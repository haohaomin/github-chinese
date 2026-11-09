import { browser } from 'wxt/browser'
import { defineContentScript } from 'wxt/utils/define-content-script'
import { createHealthCache } from '../core/accelerate-health'
import { createAccelerateOptions } from '../core/accelerate-options'
import { createAutoLoader } from '../core/auto-load'
import { createChineseReadme } from '../core/chinese-readme'
import { createCloneUrlRewriter } from '../core/clone-url'
import { createController } from '../core/controller'
import { createDownloadClickHandler } from '../core/download-click'
import { createFolderDownload } from '../core/folder-download'
import { createFreshness } from '../core/freshness'
import { createImageAccelerator } from '../core/image-accelerate'
import { createImagePreview } from '../core/image-preview'
import type { ViewerLabel } from '../core/image-viewer'
import { createInstanceMark } from '../core/instance-mark'
import { createLayoutFix } from '../core/layout-fix'
import { createNewTabClickHandler } from '../core/new-tab'
import { createReleaseDownloads } from '../core/release-downloads'
import { createSearchPurifier } from '../core/search-purify'
import { TURBO_RESET_EVENT, TURBO_REVISIT_EVENT, TURBO_TRANSLATING_EVENT } from '../core/turbo-bridge'
import type { LocaleBundle } from '../core/types'
import { translateMessage, type MessageKey, type MessageParams } from '../i18n'
import { PROBE_TIMEOUT_MS } from '../shared/accelerate'
import type { SourceHealth } from '../shared/accelerate-categories'
import type { ReleaseCountsResult, ReleaseRef } from '../shared/github-api'
import { pageLanguageEnvironment } from '../shared/language-env'
import { resolvePageLocale, resolveUiLanguage, type PageLocale } from '../shared/locale'
import { createLocaleLoader, TIME_LANGS, waitForRegistration } from '../shared/locale-loader'
import { compileSearchBlockRules, type SearchBlockList } from '../shared/search-block'
import { BUILTIN_BLOCK_RULES } from '../shared/search-block-builtin'
import {
  fromReleaseCountsResponse,
  isAcknowledged,
  isContentMessage,
  isFetchedImage,
  isProbedSources,
  type BackgroundMessage,
  type ContentMessage
} from '../shared/messages'
import {
  DEFAULT_SETTINGS,
  getCustomEntries,
  getSearchBlockRules,
  getSettings,
  isPathExcluded,
  watchSettings,
  type Settings
} from '../shared/settings'
import { sendToBackground } from '../shared/tab-messages'

type SendResponse = (response?: unknown) => void

/** 处理一条消息。同步应答时直接调用 sendResponse；异步应答返回 true 保持消息通道（Chrome 与 Firefox 均适用） */
type MessageHandler = (message: ContentMessage, sendResponse: SendResponse) => true | undefined

interface MessageGate {
  /** 注册到 runtime.onMessage 的监听 */
  readonly listener: (message: unknown, sender: unknown, sendResponse: SendResponse) => true | undefined
  /** 启动完成：按序处理排队的消息，之后直接交给 handler */
  open(handler: MessageHandler): void
}

/** 要应答的消息（popup、后台的查询）：启动完成前收到时保持消息通道 */
function expectsResponse(message: ContentMessage): boolean {
  return message.type === 'gcn:get-status'
}

/** 当前语言的语言包：词典脚本按需加载，动态导入失败（Firefox、Safari 不动态导入）时请后台注入 */
const locales = createLocaleLoader({
  resolveUrl: path => browser.runtime.getURL(path as Parameters<typeof browser.runtime.getURL>[0]),
  requestInjection: async locale => {
    const message: BackgroundMessage = { type: 'gcn:inject-locale', locale }
    return isAcknowledged(await browser.runtime.sendMessage(message))
  },
  // Firefox 的注册脚本可能还在编译，本脚本先读完存储：先等它登记。Chromium 的注册脚本在解析前同步执行，不等。
  // Firefox 不动态导入：AMO 的代码检查把参数不是字面量的 import() 报为不安全调用。
  // Safari 同 Firefox：不依赖内容脚本的动态导入与注册脚本的执行时机（词典脚本也不开放，见 wxt.config.ts）。
  // 条件直接写构建期常量（同 isFirefoxBuild）：函数调用不内联，经它判断时 Firefox 构建里仍留着 import()
  ...(String(import.meta.env.FIREFOX) === 'true' || String(import.meta.env.SAFARI) === 'true'
    ? { waitForRegistration: () => waitForRegistration(document) }
    : { importScript: (url: string) => import(/* @vite-ignore */ url) })
})

/** 总开关关闭时启动用的空语言包：开启后加载完成才换上真实语言包 */
const EMPTY_BUNDLE: LocaleBundle = []

/** 开启后语言包加载期间收到状态查询：等加载落定再应答，最多等这么久（须短于 popup 的应答超时，见 shared/tab-messages） */
const STATUS_WAIT_MS = 1000

/**
 * 检查扩展是否失效的间隔。Chrome、Edge 中停用、卸载扩展时不通知内容脚本，脚本照常运行：
 * 靠 WXT 的 ctx.setInterval 到点时读 browser.runtime.id，读不到即触发 onInvalidated
 */
const INVALIDATION_CHECK_MS = 3000

/** 故障转移：等后台探测的时限（后台探测加速源最多 PROBE_TIMEOUT_MS），超时按不探测处理 */
const PROBE_WAIT_MS = PROBE_TIMEOUT_MS + 2000

/** 图片加速：等后台取回的时限（故障转移开启、自动选择时后台依次试各加速源） */
const FETCH_IMAGE_TIMEOUT_MS = 30_000

/** 下载次数：等后台请求 GitHub API 的时限（后台单次请求最多 10 秒，令牌无效时不带令牌再请求一次） */
const RELEASE_COUNTS_WAIT_MS = 25_000

/** 图片预览浮层上的文字 → 界面文案 */
const VIEWER_MESSAGES: Readonly<Record<ViewerLabel, MessageKey>> = {
  dialog: 'imagePreview',
  previous: 'previous',
  next: 'next',
  zoomOut: 'zoomOut',
  zoomIn: 'zoomIn',
  reset: 'resetView',
  link: 'openLink',
  original: 'original',
  download: 'download',
  close: 'close',
  loading: 'stateLoading',
  loadFailed: 'loadFailed'
}

/** 在新标签页打开（不让新页面拿到本页的 window.opener） */
function openInNewTab(url: string, noreferrer = false): void {
  window.open(url, '_blank', noreferrer ? 'noopener,noreferrer' : 'noopener')
}

/** 自动加载：取回同站的下一页（带 Cookie，同手动翻页） */
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'text/html' } })
  if (!response.ok) throw new Error(`取回下一页失败：${response.status}`)
  return response.text()
}

/** 请后台探测各加速源（故障转移开启时），返回探测结果 */
async function probeSources(): Promise<SourceHealth> {
  const message: BackgroundMessage = { type: 'gcn:probe-sources' }
  const response = await sendToBackground(message, PROBE_WAIT_MS)
  if (!isProbedSources(response)) throw new Error('后台未返回探测结果')
  return response.health
}

/** 请后台经加速源取回加载失败的图片，返回 data: 地址 */
async function fetchImage(url: string): Promise<string> {
  const message: BackgroundMessage = { type: 'gcn:fetch-image', url }
  const response = await sendToBackground(message, FETCH_IMAGE_TIMEOUT_MS)
  if (!isFetchedImage(response)) throw new Error('后台未取回图片')
  return response.url
}

/** 请后台取发行版各附件的下载次数（令牌在后台，不经内容脚本） */
async function requestReleaseCounts(release: ReleaseRef): Promise<ReleaseCountsResult> {
  const message: BackgroundMessage = { type: 'gcn:release-counts', owner: release.owner, repo: release.repo, tag: release.tag }
  return fromReleaseCountsResponse(await sendToBackground(message, RELEASE_COUNTS_WAIT_MS))
}

/** 消息入口：启动完成前收到的消息排队 */
function createMessageGate(): MessageGate {
  let handle: MessageHandler | undefined
  const queued: { readonly message: ContentMessage; readonly sendResponse: SendResponse }[] = []
  return {
    listener(message, _sender, sendResponse) {
      if (!isContentMessage(message)) return undefined
      if (handle) return handle(message, sendResponse)
      queued.push({ message, sendResponse })
      return expectsResponse(message) ? true : undefined
    },
    open(handler) {
      handle = handler
      for (const { message, sendResponse } of queued.splice(0)) handler(message, sendResponse)
    }
  }
}

export default defineContentScript({
  matches: [
    'https://github.com/*',
    'https://gist.github.com/*',
    'https://www.githubstatus.com/*',
    'https://help.github.com/*',
    'https://support.github.com/*'
  ],
  runAt: 'document_start',
  // 新实例只用 document 上的自定义事件让旧实例失效，不经 window.postMessage 把事件名广播给页面脚本
  noScriptStartedPostMessage: true,
  async main(ctx) {
    if (ctx.isInvalid) return
    // 先注册消息监听再读存储：扩展安装、更新后后台先探测页面上有没有本版本的内容脚本（见 background.ts），
    // 读存储期间没有应答会被当成没有，再注入一份让本实例失效，整页先还原成英文再重译
    const gate = createMessageGate()
    browser.runtime.onMessage.addListener(gate.listener)
    const removeMessageListener = (): void => {
      try {
        browser.runtime.onMessage.removeListener(gate.listener)
      } catch {
        // 上下文已失效，监听随之作废
      }
    }

    const [settings, customEntries, searchRules, initialLanguages] = await Promise.all([
      getSettings().catch(() => DEFAULT_SETTINGS),
      getCustomEntries().catch(() => ({})),
      getSearchBlockRules().catch(() => []),
      // 与后台注册词典脚本同一来源（见 shared/language-env）
      pageLanguageEnvironment()
    ])
    let languages = initialLanguages
    let current: Settings = settings
    /** 自定义的屏蔽规则；开启内置规则时连同内置规则编译 */
    let customRules = searchRules
    const compileRules = (): SearchBlockList => compileSearchBlockRules(customRules, current.purifyBuiltin ? BUILTIN_BLOCK_RULES : [])
    let blockList = compileRules()
    // 搜索净化不等语言包：结果插入页面时就隐藏（见 core/search-purify）
    const purifier = createSearchPurifier(document, {
      active: () => current.enabled && current.purifySearch,
      rules: () => blockList
    })
    // 中文自述文件：存储库首页、目录页的自述文件有中文版时换成中文版（见 core/chinese-readme）。
    // 不等语言包：自述文件出现时就隐藏原文、开始取中文版，不先显示原文再换
    const readme = createChineseReadme(document, {
      active: () => current.enabled && current.chineseReadme,
      locale: () => resolvePageLocale(current.language, languages),
      label: key => translateMessage(resolveUiLanguage(current.uiLanguage, languages), key)
    })
    const locale: PageLocale = resolvePageLocale(settings.language, languages)
    // 总开关关闭时不加载语言包，开启时再加载（见 syncLocale）
    const bundle: LocaleBundle | undefined =
      ctx.isInvalid || !settings.enabled ? undefined : await locales.load(locale).catch(() => undefined)
    // 不再启动（已失效，或开启时语言包加载失败）。排队的查询不应答：页面上有新实例时由它应答
    if (ctx.isInvalid || (settings.enabled && !bundle)) {
      purifier.stop()
      readme.stop()
      removeMessageListener()
      return
    }
    /** 已换上的语言包的语言：关闭时启动的为 undefined，开启后加载完成才换上 */
    let loadedLocale: PageLocale | undefined = bundle ? locale : undefined
    /** 交给控制器的设置：语言包换上之前一律停止（空语言包没有译文，不算在翻译） */
    const effective = (next: Settings): Settings => (loadedLocale === undefined ? { ...next, enabled: false } : next)

    // 翻译中在 <html> 上留标记（见 core/instance-mark）：重置时发现别的实例的标记，说明它已失效、旧译文没有还原
    const mark = createInstanceMark(document)
    // 译文的排版修正（见 core/layout-fix）：随翻译启停
    const layoutFix = createLayoutFix(document)
    // 关闭时启动也创建（用空语言包）：状态查询、后台探测、桥接询问都靠它应答
    const controller = createController({
      bundle: bundle ?? EMPTY_BUNDLE,
      timeLang: TIME_LANGS[locale],
      settings: effective(settings),
      customEntries,
      isPathExcluded,
      onActiveChange: active => {
        mark.update(active)
        layoutFix.update(active)
      },
      // 交给主世界的 turbo-bridge 处理 Turbo 缓存克隆体；有已失效实例的标记时强制重新访问。
      // 失效时只做普通重置：新实例此时可能已写入标记
      onReset: reason => {
        const stale = reason !== 'dispose' && mark.clearOthers()
        window.dispatchEvent(new Event(stale ? TURBO_REVISIT_EVENT : TURBO_RESET_EVENT))
      }
    })
    /** 最近一次加载请求的序号：加载期间又有变化（关闭、语言再变）时，旧请求的结果丢弃 */
    let localeRequest = 0

    /** 开启时加载当前语言的语言包并换上；关闭期间不加载 */
    const syncLocale = async (): Promise<void> => {
      const request = ++localeRequest
      if (!current.enabled) return
      const target = resolvePageLocale(current.language, languages)
      if (target === loadedLocale) return
      let next: LocaleBundle
      try {
        next = await locales.load(target)
      } catch {
        // 加载失败时沿用当前语言，还没有语言包时保持停止；设置或浏览器语言再变化时重试
        return
      }
      if (request !== localeRequest || ctx.isInvalid) return
      const first = loadedLocale === undefined
      loadedLocale = target
      controller.updateLocale(next, TIME_LANGS[target])
      // 第一次换上语言包：按加载完成时的最新设置开启
      if (first) controller.updateSettings(current)
    }

    /** 在途的 syncLocale（最近一次），落定后为 undefined：开启后语言包换上之前的状态查询等它 */
    let localeTask: Promise<void> | undefined
    const requestLocale = (): void => {
      const task = syncLocale()
      localeTask = task
      const settled = (): void => {
        if (localeTask === task) localeTask = undefined
      }
      void task.then(settled, settled)
    }

    /** 等在途的 syncLocale 落定，最多 STATUS_WAIT_MS */
    const waitForLocale = (task: Promise<void>): Promise<void> =>
      new Promise(resolve => {
        const timer = ctx.setTimeout(resolve, STATUS_WAIT_MS)
        const settle = (pending: Promise<void>): void => {
          const next = (): void => {
            // 期间又发起了加载（设置、浏览器语言再变）：接着等最新的
            if (localeTask && localeTask !== pending) {
              settle(localeTask)
              return
            }
            clearTimeout(timer)
            resolve()
          }
          void pending.then(next, next)
        }
        settle(task)
      })

    // 加速源的探测结果（故障转移开启时由后台探测，见 core/accelerate-health）
    const sourceHealth = createHealthCache(probeSources)
    // 替换原链接：改写 Code 下拉框等处的克隆地址（见 core/clone-url）
    const cloneUrls = createCloneUrlRewriter(document, {
      settings: () => current,
      health: sourceHealth,
      copy: text => {
        navigator.clipboard.writeText(text).catch(() => undefined)
      }
    })
    // 图片加速：图片加载失败时经加速源取回（见 core/image-accelerate）
    const images = createImageAccelerator({ settings: () => current, fetchImage })
    /** 页面内控件（图片预览、加速选项、下载文件夹、页码分隔）的文字：扩展界面语言 */
    const message = (key: MessageKey, params?: MessageParams): string =>
      translateMessage(resolveUiLanguage(current.uiLanguage, languages), key, params)
    // 加速选项：下载链接、克隆地址旁的各分类选项（见 core/accelerate-options）
    const accelerateOptions = createAccelerateOptions(document, {
      settings: () => current,
      health: sourceHealth,
      copy: text => navigator.clipboard.writeText(text),
      label: key => message(key)
    })
    // 下载文件夹：目录页「…」菜单（见 core/folder-download）
    const folders = createFolderDownload(document, {
      settings: () => current,
      health: sourceHealth,
      label: key => message(key)
    })
    // 下载次数：发行版附件行显示下载次数（见 core/release-downloads）
    const downloads = createReleaseDownloads(document, {
      active: () => current.enabled && current.downloadCount,
      lang: () => resolveUiLanguage(current.uiLanguage, languages),
      label: count => message('downloadTimes', { count }),
      request: requestReleaseCounts
    })
    // 更新时间着色：文件列表与最近提交的时间按距今远近改颜色（见 core/freshness）
    const freshness = createFreshness(document, {
      active: () => current.enabled && current.freshness,
      colors: () => current.freshnessColors
    })
    // 自动加载：「加载更多」与分页列表的下一页（见 core/auto-load）
    const autoLoader = createAutoLoader(document, {
      active: () => current.enabled && current.autoLoad,
      scopes: () => current.autoLoadScopes,
      fetchPage,
      pageLabel: page => message('pageNumber', { page })
    })
    // 图片预览：单击正文里的图片在页面内预览（见 core/image-preview）
    const preview = createImagePreview(document, {
      active: () => current.enabled && current.imagePreview,
      label: key => message(VIEWER_MESSAGES[key]),
      open: url => openInNewTab(url)
    })

    const applySettings = (next: Settings): void => {
      const builtinChanged = next.purifyBuiltin !== current.purifyBuiltin
      current = next
      if (builtinChanged) blockList = compileRules()
      controller.updateSettings(effective(next))
      requestLocale()
      // 加速源可能增删：探测结果重新取
      sourceHealth.clear()
      cloneUrls.refresh()
      accelerateOptions.refresh()
      folders.refresh()
      downloads.refresh()
      freshness.refresh()
      autoLoader.refresh()
      purifier.refresh()
      readme.refresh()
      if (!next.enabled || !next.imagePreview) preview.close()
      if (next.enabled && next.accelerateImages) images.retryFailed(document)
    }

    /** 最近一次读取浏览器语言的序号：读取期间又变化时，旧结果丢弃 */
    let languagesRequest = 0
    const refreshLanguages = async (): Promise<void> => {
      const request = ++languagesRequest
      const next = await pageLanguageEnvironment()
      if (request !== languagesRequest || ctx.isInvalid) return
      languages = next
      downloads.refresh()
      requestLocale()
      readme.refresh()
    }

    // 只监听 sync 区（设置）；自定义词条变化由后台转发
    const unwatchSettings = watchSettings(applySettings)
    // 浏览器语言变化：自动识别的翻译语言随之变化
    ctx.addEventListener(window, 'languagechange', () => void refreshLanguages())
    // 主世界桥接询问是否在翻译：翻译中取消询问事件。实例标记会被 GitHub 前进后退时写回，桥接不据此判断
    ctx.addEventListener(window, TURBO_TRANSLATING_EVENT, (event: Event) => {
      if (controller.translator.active) event.preventDefault()
    })
    // 图片预览：在捕获阶段最先处理正文图片的单击（先于下载加速、新标签页打开）
    ctx.addEventListener(window, 'click', preview.onClick, { capture: true })
    // 替换原链接：在捕获阶段先于页面脚本处理下载链接的点击（见 core/download-click）
    ctx.addEventListener(
      window,
      'click',
      createDownloadClickHandler({
        settings: () => current,
        health: sourceHealth,
        open: (url, newTab) => {
          window.open(url, newTab ? '_blank' : '_self', newTab ? 'noopener' : '')
        }
      }),
      { capture: true }
    )
    // 新标签页打开：图片预览、下载加速都不处理的链接点击（见 core/new-tab）
    ctx.addEventListener(window, 'click', createNewTabClickHandler({ settings: () => current, open: openInNewTab }), { capture: true })
    // 图片的 error 不冒泡：在捕获阶段监听
    ctx.addEventListener(window, 'error', images.onError, { capture: true })

    const refreshCustomEntries = async (): Promise<void> => {
      try {
        const entries = await getCustomEntries()
        if (ctx.isValid) controller.updateCustomEntries(entries)
      } catch {
        // 读取失败时沿用当前词条
      }
    }

    const refreshSearchRules = async (): Promise<void> => {
      try {
        const rules = await getSearchBlockRules()
        if (!ctx.isValid) return
        customRules = rules
        blockList = compileRules()
        purifier.refresh()
      } catch {
        // 读取失败时沿用当前规则
      }
    }

    const refreshSettings = async (): Promise<void> => {
      try {
        const next = await getSettings()
        if (ctx.isValid) applySettings(next)
      } catch {
        // 读取失败时沿用当前设置
      }
    }

    const handleMessage: MessageHandler = (message, sendResponse) => {
      switch (message.type) {
        case 'gcn:get-status':
          // 开启后语言包还在加载：保持消息通道，等加载落定再应答（popup 开启后立即查询，得到换上之后的状态）。
          // 期间失效时不应答
          if (current.enabled && loadedLocale === undefined && localeTask) {
            void waitForLocale(localeTask).then(() => {
              if (ctx.isValid) sendResponse(controller.getStatus())
            })
            return true
          }
          sendResponse(controller.getStatus())
          return undefined
        case 'gcn:custom-entries-changed':
          void refreshCustomEntries()
          return undefined
        case 'gcn:search-rules-changed':
          void refreshSearchRules()
          return undefined
      }
    }

    // 往返缓存恢复：缓存期间收不到自定义词条、屏蔽规则的通知，Firefox 还会丢弃设置变更事件，恢复后补读
    ctx.addEventListener(window, 'pageshow', event => {
      if (!event.persisted) return
      void refreshCustomEntries()
      void refreshSearchRules()
      void refreshSettings()
    })

    // 软导航时顺带检查扩展是否失效（失效会触发 onInvalidated）。
    // 搜索净化随 DOM 变动处理，地址晚于结果改变时（进出搜索页）在这里补上
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      if (!ctx.isValid) return
      controller.checkLocation()
      layoutFix.refresh()
      purifier.refresh()
      autoLoader.refresh()
      readme.refresh()
      preview.close()
    })
    // 不导航时定时检查（见 INVALIDATION_CHECK_MS）：检查由 ctx.setInterval 完成，回调不做事
    ctx.setInterval(() => undefined, INVALIDATION_CHECK_MS)

    // 先还原页面：扩展更新后旧上下文里调用扩展 API 可能抛错，不能因此跳过还原
    ctx.onInvalidated(() => {
      controller.dispose()
      mark.disconnect()
      cloneUrls.stop()
      accelerateOptions.stop()
      folders.stop()
      downloads.stop()
      freshness.stop()
      autoLoader.stop()
      preview.close()
      readme.stop()
      purifier.stop()
      removeMessageListener()
      try {
        unwatchSettings()
      } catch {
        // 上下文已失效，监听随之作废
      }
    })

    // 设置、浏览器语言的监听在读完存储（开启时还有加载语言包）后才注册，期间的变化收不到：补读一次
    void refreshLanguages()
    void refreshSettings()

    // 启动完成：处理读存储期间排队的消息
    gate.open(handleMessage)
  }
})
