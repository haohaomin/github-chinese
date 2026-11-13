/**
 * 内容脚本控制器：把设置、自定义词条、排除路径、软导航、本地时区变化与消息协议装配到翻译引擎上。
 * 不依赖扩展 API，由 content.ts 注入设置与回调。
 * 本地时区变化（改了系统时区，页面不刷新）：词典按本地时区决定完整时间写不写时区（见 locales 的 isLocalZone），
 * 匹配器按原文缓存的译文随之过时，重建匹配器并基于原文重译；时间元素改写过的 title 由 time-text 复位。
 * 页面重新可见、窗口获得焦点时比较时区；启动翻译前也比较一次：停止期间改了时区而没有这两个事件时，
 * 恢复翻译不沿用旧时区的译文。
 */
import type { ContentStatus } from '../shared/messages'
import type { CustomEntries, Settings } from '../shared/settings'
import { activeTimeFormat } from '../shared/time-format'
import { createNavigationWatcher, type NavigationHost } from './location'
import { createMatcher } from './matcher'
import { createZoneWatcher } from './time-text'
import { createTranslator, type Translator, type TranslatorFeatures, type TranslatorHost } from './translator'
import type { LocaleBundle } from './types'

export type ControllerHost = TranslatorHost & NavigationHost

/** 重置原因：dispose 为控制器销毁（内容脚本失效，页面上可能已有新实例），其余为 change */
export type ResetReason = 'change' | 'dispose'

export interface ControllerOptions {
  readonly bundle: LocaleBundle
  /** 时间元素渲染所用的 lang（随语言包，见 translator 的 timeLang） */
  readonly timeLang?: string
  readonly settings: Settings
  readonly customEntries: CustomEntries
  /** 路径是否命中排除规则（见 shared/settings 的 isPathExcluded） */
  readonly isPathExcluded: (pathname: string, patterns: readonly string[]) => boolean
  /**
   * 页面上可能有翻译记录之外的已译副本时调用：停止翻译，语言包、自定义词条、时间本地化开关或本地时区变化
   * （停止翻译期间变化的，恢复翻译时补发）。
   * Turbo 前进后退渲染缓存克隆体，克隆出的节点没有记录，无法还原或重译（见 core/turbo-bridge）
   */
  readonly onReset?: (reason: ResetReason) => void
  /** 翻译器启动、停止后调用（内容脚本据此维护实例标记，见 core/instance-mark） */
  readonly onActiveChange?: (active: boolean) => void
  readonly host?: ControllerHost
}

export interface Controller {
  readonly translator: Translator
  updateSettings(settings: Settings): void
  updateCustomEntries(entries: CustomEntries): void
  /** 更换语言包（页面翻译语言变化）：基于原文重译 */
  updateLocale(bundle: LocaleBundle, timeLang: string): void
  /** 重新判断开关（总开关、汉化）、排除路径与页面类型 */
  checkLocation(): void
  /** 当前页面状态（popup 查询） */
  getStatus(): ContentStatus
  /** 停止并还原，之后不再响应任何变化 */
  dispose(): void
}

/** 交给引擎的功能开关；未翻译收集不开启（诊断用，见 core/untranslated） */
function featuresOf(settings: Settings): Pick<TranslatorFeatures, 'translateTime' | 'timeFormat' | 'translateTitle'> {
  return {
    translateTime: settings.translateTime,
    timeFormat: activeTimeFormat(settings.timeFormat, settings.customTimeFormat),
    translateTitle: settings.translateTitle
  }
}

/** 词条完全相同 */
function sameEntries(a: CustomEntries, b: CustomEntries): boolean {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && a[key] === b[key])
}

export function createController(options: ControllerOptions): Controller {
  const host = options.host ?? (globalThis as unknown as ControllerHost)
  let settings = options.settings
  let customEntries = options.customEntries
  let bundle = options.bundle
  let disposed = false
  /** 翻译过：缓存里可能有本实例的译文 */
  let everActive = false
  /** 停止翻译期间语言包、词条、时间本地化开关或本地时区有变化：缓存里的译文已过时，恢复翻译时补发重置 */
  let pendingReset = false

  /** 已译副本随之过时：翻译中立即通知，停止期间等恢复翻译 */
  function noteStaleCopies(): void {
    if (translator.active) options.onReset?.('change')
    else if (everActive) pendingReset = true
  }

  const isExcluded = (): boolean => options.isPathExcluded(host.location.pathname, settings.excludedPaths)

  const translator = createTranslator({
    matcher: createMatcher(bundle, { custom: customEntries }),
    timeLang: options.timeLang,
    host,
    ...featuresOf(settings),
    onLocationChange: () => {
      if (isExcluded()) stopTranslator()
    }
  })

  /** 停止并还原；之前在翻译时通知重置 */
  function stopTranslator(reason: ResetReason = 'change'): void {
    if (!translator.active) return
    translator.stop()
    options.onActiveChange?.(false)
    options.onReset?.(reason)
  }

  /**
   * 按开关与排除路径启停；仍在翻译时检查页面类型。
   * 总开关、汉化都开启才翻译（同 shared/settings 的 isTranslationOn：那里引入存储，本模块不依赖扩展 API）
   */
  function sync(): void {
    if (disposed) return
    if (!settings.enabled || !settings.translation) {
      watcher.stop()
      stopTranslator()
      return
    }
    watcher.start()
    if (isExcluded()) stopTranslator()
    else if (translator.active) translator.checkLocation()
    else {
      // 停止期间改了时区、还没有派发事件（如系统自动切换）：先补查，免得沿用按旧时区缓存的译文
      zoneWatcher.check()
      translator.start()
      everActive = true
      options.onActiveChange?.(true)
      // 先启动再通知：桥接据「在翻译」把缓存里的译文记为过时
      if (pendingReset) {
        pendingReset = false
        options.onReset?.('change')
      }
    }
  }

  /** 本地时区变了：重建匹配器（丢掉按旧时区缓存的译文）并重译；停止翻译期间只换匹配器，恢复翻译时按新时区翻译 */
  const zoneWatcher = createZoneWatcher(host.document, () => {
    if (disposed) return
    translator.setMatcher(createMatcher(bundle, { custom: customEntries }))
    // 克隆体里的译文没有记录，不随时区重译
    noteStaleCopies()
  })

  const watcher = createNavigationWatcher(host, sync)
  sync()
  // 首次 sync 之后再开始监听：匹配器刚建好、没有旧译文，这次启动前不用比较（未监听时 check 不比较），省一次读取
  zoneWatcher.start()

  return {
    translator,

    updateSettings(next) {
      if (disposed) return
      const timeChanged = next.translateTime !== settings.translateTime
      const wasActive = translator.active
      settings = next
      translator.setFeatures(featuresOf(next))
      // 克隆体里的时间元素没有记录，不随开关切换。翻译中切换的稍后通知；停止期间切换的，恢复翻译时补发
      if (timeChanged && !wasActive && everActive) pendingReset = true
      sync()
      // 本次停止翻译时已通知过
      if (timeChanged && wasActive && translator.active) options.onReset?.('change')
    },

    updateCustomEntries(entries) {
      // 词条没变时不重建匹配器：重建会整页重新遍历
      if (disposed || sameEntries(customEntries, entries)) return
      customEntries = entries
      translator.setMatcher(createMatcher(bundle, { custom: entries }))
      // 克隆体里的译文没有记录，不随词条重译
      noteStaleCopies()
    },

    updateLocale(next, timeLang) {
      if (disposed || next === bundle) return
      bundle = next
      translator.setLocale(createMatcher(next, { custom: customEntries }), timeLang)
      // 克隆体里的译文没有记录，不随语言重译
      noteStaleCopies()
    },

    checkLocation: sync,

    getStatus: () => ({
      active: translator.active,
      excluded: isExcluded(),
      pages: translator.pages,
      translatedCount: translator.translatedCount()
    }),

    dispose() {
      if (disposed) return
      disposed = true
      watcher.stop()
      zoneWatcher.stop()
      stopTranslator('dispose')
    }
  }
}
