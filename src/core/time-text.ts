/**
 * 原生时间元素（<relative-time> 等）的显示文字与 title：去掉本地时区名，中文与数字之间补空格。
 *
 * 元素按 lang 用 Intl 把文字渲染进开放的 shadowRoot，zh-CN 输出“3天前”“2024年1月5日”，
 * 与词典的“3 天前”“2024 年 1 月 5 日”不一致。元素每次渲染后同步派发 relative-time-updated
 * （冒泡、穿透 shadow），在监听中改写 shadowRoot 内的文本节点，同一任务内完成，不闪烁；
 * 元素下次渲染写回原样文字时再次改写。
 * 带时刻的写法里，zh-CN 把时区夹在日期与时刻之间（2026年10月7日 GMT+8 15:06），zh-TW 写在末尾（… 下午3:06 [GMT+8]）。
 * 时区名按偏移换算（GMT±h、UTC、PDT、HAST 等，与词典的 isLocalZone 一致），在元素日期那一刻与浏览器本地时区偏移相同就去掉，
 * 只留日期与时刻（2026 年 10 月 7 日 15:06）。元素设了其他时区时保留；元素按 lang 与选项缓存 Intl 格式、不随系统时区更新，
 * 改了系统时区后仍按旧时区生成的写法同样保留（2026 年 10 月 7 日 GMT+8 15:06）。
 *
 * title 由元素按datetime、lang、小时制生成。改写后元素把它当作自定义 title，不再随datetime、lang、小时制、时区更新：
 * 日期变了（React 复用元素只改datetime）就移除改写过的 title，元素按新日期重新生成，渲染后再改写；
 * 显示文字不变（如“昨天”）时元素不派发事件，所以另外观察datetime 属性。
 * 改写过却没有记录的 title（失效的旧实例写入、克隆体带来）不知按哪个日期生成，同样移除后由元素重新生成。
 * 还原时移除 title，元素重新生成当前语言的 title。只处理含中文的 title：GitHub 自带的 title 是英文。
 *
 * 改了系统时区（Chrome 重设默认时区，页面不刷新）：改写时记下该日期的本地偏移，偏移变了的 title 同样移除，
 * 由元素重新生成后再改写。元素渲染时就会发现；不定时刷新的元素（超过 30 天显示日期、format=datetime）不再派发事件，
 * 所以另在页面重新可见、窗口获得焦点时比较时区探针（见 createZoneWatcher），变化时逐个复位有记录的元素。
 * 普通文本与属性里由词典译出的完整时间另由 core/controller 重建匹配器重译；同一次事件两边的监听只读一次探针。
 *
 * 自定义时间格式（见 shared/time-format）：显示文字换成按写法写出的时刻，时区按元素的 time-zone（没有时按本地）；
 * 时长（format=duration、elapsed）、日期无效的不换。元素重新渲染（定时刷新、换 lang）写回自己的文字时再换；
 * 改回默认、还原时写回元素自己渲染的文字。title 照常改写
 */
import { formatTime } from '../shared/time-format'
import { ELEMENT_NODE, SHOW_TEXT, TIME_TAGS } from './dom'

export const TIME_UPDATED_EVENT = 'relative-time-updated'

const CJK_DIGIT_RE = /(?<=\d)(?=[一-鿿])|(?<=[一-鿿])(?=\d)/g
const CJK_RE = /[一-鿿]/
const DATETIME_OPTIONS: MutationObserverInit = { attributes: true, attributeFilter: ['datetime'] }
const TIME_SELECTOR = [...TIME_TAGS].join(', ')

/** 保留用于兼容性，不再插入空格 */
export function spaceDigits(text: string): string {
  return text
}

/** en-US 给美洲时区用的缩写（zh-TW Intl 照写，夏威夷时间写作 HAST）→ 与 UTC 的偏移（分钟） */
const ZONE_ABBREVIATIONS: Readonly<Record<string, number>> = {
  AST: -240,
  ADT: -180,
  EST: -300,
  EDT: -240,
  CST: -360,
  CDT: -300,
  MST: -420,
  MDT: -360,
  PST: -480,
  PDT: -420,
  AKST: -540,
  AKDT: -480,
  HST: -600,
  HDT: -540,
  // 夏威夷-阿留申时间：en-US 给 America/Adak 用，zh-TW 给 Pacific/Honolulu、America/Adak 用
  HAST: -600,
  HADT: -540
}
const GMT_OFFSET_RE = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/

/** 时区写法 → 与 UTC 的偏移（分钟）：GMT、UTC、GMT±h[:mm]、PST 等缩写；不认识的返回 undefined */
export function zoneOffset(zone: string): number | undefined {
  if (zone === 'GMT' || zone === 'UTC') return 0
  if (Object.hasOwn(ZONE_ABBREVIATIONS, zone)) return ZONE_ABBREVIATIONS[zone]
  const match = GMT_OFFSET_RE.exec(zone)
  if (!match) return undefined
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0)
  return match[1] === '-' ? -minutes : minutes
}

/** 偏移 offset（分钟）就是浏览器本地时区在 time 时刻的偏移（按当前系统时区，改了时区立即生效） */
export function isLocalOffset(offset: number, time: number): boolean {
  return -new Date(time).getTimezoneOffset() === offset
}

/** 可能是时区名的词：GMT±h[:mm]，或大写缩写（GMT、UTC、PDT、HAST 等） */
const ZONE_WORD = 'GMT[+-]\\d{1,2}(?::\\d{2})?|[A-Z]{3,4}'
/** 整个词（zh-TW 写在方括号里），连同两侧的空白 */
const ZONE_WORD_RE = new RegExp(`(^|\\s)(?:\\[(${ZONE_WORD})\\]|(${ZONE_WORD}))(\\s|$)`, 'g')

/**
 * 去掉文字里的本地时区名：按 zoneOffset 换算，time 时刻与浏览器本地时区偏移相同的才算。
 * 2026年10月7日 GMT+8 15:06 → 2026年10月7日 15:06；2026年10月7日 下午3:06 [GMT+8] → 2026年10月7日 下午3:06。
 * 只认整个词（本地为 GMT+1 时不动 GMT+10、GMT+1:30）；其他时区、不认识的缩写保留，不含时返回原文
 */
export function stripLocalZone(text: string, time: number): string {
  return text.replace(ZONE_WORD_RE, (match, before: string, bracketed: string | undefined, bare: string | undefined, after: string) => {
    const offset = zoneOffset(bracketed ?? bare ?? '')
    if (offset === undefined || !isLocalOffset(offset, time)) return match
    // 去掉时区词及其两侧空白；两侧都有空白时保留一个空格（日期与时刻之间）
    return before && after ? ' ' : ''
  })
}

/** 浏览器本地时区的探针：IANA 时区名与今年 1 月、7 月的偏移 */
export function zoneProbe(): string {
  const year = new Date().getFullYear()
  const name = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `${name}|${new Date(year, 0, 1).getTimezoneOffset()}|${new Date(year, 6, 1).getTimezoneOffset()}`
}

export interface ZoneWatcher {
  /** 记下当前探针，开始监听 */
  start(): void
  stop(): void
  /** 不等事件，立即比较一次探针，变化时回调；未在监听时不比较 */
  check(): void
}

/** 各次事件读到的探针：同一次事件派发给多个监听（引擎与控制器各一个）时只读一次 */
const eventProbes = new WeakMap<Event, string>()

/** 本次事件的探针：同一事件的其他监听读过就沿用 */
function probeOf(event: Event): string {
  let probe = eventProbes.get(event)
  if (probe === undefined) {
    probe = zoneProbe()
    eventProbes.set(event, probe)
  }
  return probe
}

/**
 * 本地时区变化（改了系统时区，Chrome 重设默认时区、页面不刷新）：页面重新可见（visibilitychange）或窗口获得焦点（focus）时
 * 比较探针，变化时回调。不加定时器，每次事件只读一次探针（多个监听共用）；事件之外要比较的（如恢复翻译前）调用 check
 */
export function createZoneWatcher(doc: Document, onChange: () => void): ZoneWatcher {
  let probe = ''
  let running = false

  function compare(next: string): void {
    if (next === probe) return
    probe = next
    onChange()
  }

  function onEvent(event: Event): void {
    compare(probeOf(event))
  }

  return {
    start() {
      if (running) return
      running = true
      probe = zoneProbe()
      doc.addEventListener('visibilitychange', onEvent)
      doc.defaultView?.addEventListener('focus', onEvent)
    },

    stop() {
      if (!running) return
      running = false
      doc.removeEventListener('visibilitychange', onEvent)
      doc.defaultView?.removeEventListener('focus', onEvent)
    },

    check() {
      if (running) compare(zoneProbe())
    }
  }
}

export interface TimeText {
  /** 开始监听元素渲染与本地时区变化，并观察改写过 title 的元素的datetime */
  attach(): void
  /** 停止监听 */
  detach(): void
  /** 改写元素当前的显示文字与 title */
  sync(element: Element): void
  /**
   * 只改写元素当前的显示文字：元素将按新的小时制重新渲染（lang 不变），title 留给渲染后的事件处理，
   * 现在改写会被元素当作自定义 title、不再随小时制更新
   */
  syncText(element: Element): void
  /** 写回元素自己渲染的文字（写入了自定义格式时），移除改写过的 title；显示文字随 lang 还原由元素重新渲染 */
  restore(element: Element): void
  /**
   * lang 或小时制将要变化：移除改写过的 title，以及改写过却没有记录的中文 title（失效实例、克隆体留下的）。
   * 元素把它们当作自定义 title 保留，换了 lang、小时制也不会重新生成；移除后元素按新的设置生成，渲染后再改写
   */
  reset(element: Element): void
}

/** 写入或认领的 title，及当时的日期与本地偏移（title 由元素按它们生成） */
interface WrittenTitle {
  readonly title: string
  /** datetime 解析出的时刻，同一时刻换种写法不算变化；无效为 NaN */
  readonly time: number
  /** 改写时浏览器本地时区在该时刻的偏移（getTimezoneOffset）；改了系统时区后不同，title 停在旧时区 */
  readonly offset: number
}

/** 元素按datetime 解析出的时刻（与元素自己解析日期的方式一致） */
function timeOf(element: Element): number {
  return Date.parse(element.getAttribute('datetime') ?? '')
}

/** 浏览器本地时区在 time 时刻的偏移（getTimezoneOffset）；time 无效为 NaN */
function offsetAt(time: number): number {
  return new Date(time).getTimezoneOffset()
}

/** 改写过的 title 仍对得上元素：datetime 是同一时刻，该时刻的本地偏移也没变 */
function isCurrent(element: Element, written: WrittenTitle): boolean {
  const time = timeOf(element)
  return Object.is(time, written.time) && Object.is(offsetAt(time), written.offset)
}

/** 显示文字、title 的改写：去掉本地时区名（按元素的日期判断，datetime 无效时按当前时刻） */
function rewrite(element: Element, text: string): string {
  const time = timeOf(element)
  return stripLocalZone(text, Number.isFinite(time) ? time : Date.now())
}

/**
 * 改写过的写法：已去掉时区词（无 GMT/UTC 等）；元素生成的中文 title 总带时区缩写。
 * 旧版本改写的 title 还带着本地时区名，含字母，视为未改写过，会被重新改写一次
 */
function isRewritten(title: string): boolean {
  return CJK_RE.test(title) && !/GMT|UTC|[A-Z]{3,4}/.test(title)
}

export interface TimeTextOptions {
  /** 自定义时间格式的写法（见 shared/time-format）；空串时照元素渲染的文字改写 */
  readonly pattern: () => string
  /** 元素渲染所用的 lang（星期简称分简繁） */
  readonly lang: () => string
}

/** 写入了自定义格式的元素：元素自己渲染的文字（改回默认、还原时写回）与写入的文字 */
interface CustomText {
  readonly raw: string
  readonly written: string
}

/** 时长（Actions 用时等）：不按自定义格式 */
const DURATION_FORMATS: ReadonlySet<string> = new Set(['duration', 'elapsed'])

const NO_CUSTOM_FORMAT: TimeTextOptions = { pattern: () => '', lang: () => '' }

/** 元素按哪个时区显示：自身或祖先（含 <html>）的 time-zone（与元素的取法一致）；没有时按本地 */
function timeZoneOf(element: Element): string | undefined {
  return element.closest('[time-zone]')?.getAttribute('time-zone') || undefined
}

/** shadowRoot 内的文本节点 */
function textNodes(doc: Document, root: ShadowRoot): Text[] {
  const nodes: Text[] = []
  const walker = doc.createTreeWalker(root, SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text)
  return nodes
}

/** 文字写进第一个文本节点，其余清空 */
function writeText(nodes: readonly Text[], text: string): void {
  nodes.forEach((node, index) => {
    const data = index === 0 ? text : ''
    if (node.data !== data) node.data = data
  })
}

/**
 * owns：元素是否由引擎设为中文（翻译中、时间本地化开启、lang 为引擎写入）。
 * 自定义时间格式（options.pattern 不为空）时，显示文字换成按写法写出的时刻（时长、日期无效的除外），title 照常改写
 */
export function createTimeText(doc: Document, owns: (element: Element) => boolean, options: TimeTextOptions = NO_CUSTOM_FORMAT): TimeText {
  /** 由本模块写入或认领的 title */
  const titles = new WeakMap<Element, WrittenTitle>()
  /** 写入了自定义格式的元素 */
  const customTexts = new WeakMap<Element, CustomText>()
  /** 移除过别处 title 的元素：再遇到改写过而没有记录的 title 就直接认领，免得反复移除、渲染 */
  const cleared = new WeakSet<Element>()
  /** 观察改写过 title 的元素的datetime：日期变了就移除过时的改写 */
  const observer = new MutationObserver(records => {
    for (const record of records) resetStale(record.target as Element)
  })
  /** 本次 attach 后已观察datetime 的元素 */
  let watched = new WeakSet<Element>()
  let attached = false
  /** 本地时区变了：没有定时刷新的元素不会再派发事件，逐个复位有记录的 */
  const zoneWatcher = createZoneWatcher(doc, () => {
    for (const element of doc.querySelectorAll(TIME_SELECTOR)) resetStale(element)
  })

  /** 元素按自定义格式显示的文字；没有自定义写法、是时长、日期无效时为 undefined */
  function customText(element: Element): string | undefined {
    const pattern = options.pattern()
    if (!pattern || DURATION_FORMATS.has(element.getAttribute('format') ?? '')) return undefined
    const time = timeOf(element)
    if (!Number.isFinite(time)) return undefined
    return formatTime(pattern, time, { lang: options.lang(), timeZone: timeZoneOf(element) })
  }

  /**
   * 改写显示文字。当前文字是写入的自定义格式时（元素之后没有重新渲染），元素自己的文字是记下的那份：
   * 改回默认时先写回再补空格，改了写法时按新写法
   */
  function syncText(element: Element, root: ShadowRoot): void {
    const nodes = textNodes(doc, root)
    if (nodes.length === 0) return
    const current = nodes.map(node => node.data).join('')
    const record = customTexts.get(element)
    const raw = record?.written === current ? record.raw : current
    const custom = customText(element)
    if (custom !== undefined) {
      customTexts.set(element, { raw, written: custom })
      if (current !== custom) writeText(nodes, custom)
      return
    }
    customTexts.delete(element)
    if (raw !== current) writeText(nodes, raw)
    for (const text of nodes) {
      const rewritten = rewrite(element, text.data)
      if (rewritten !== text.data) text.data = rewritten
    }
  }

  /** 写回元素自己渲染的文字（当前仍是写入的自定义格式时） */
  function restoreText(element: Element): void {
    const record = customTexts.get(element)
    if (record === undefined) return
    customTexts.delete(element)
    const root = element.shadowRoot
    if (!root) return
    const nodes = textNodes(doc, root)
    if (nodes.map(node => node.data).join('') === record.written) writeText(nodes, record.raw)
  }

  function watch(element: Element): void {
    if (!attached || watched.has(element)) return
    watched.add(element)
    observer.observe(element, DATETIME_OPTIONS)
  }

  /**
   * 改写过的 title 仍在而日期已变、或本地时区已变：移除，元素复位自定义标记并按当前日期重新生成（时区以元素的格式为准），
   * 渲染后再改写
   */
  function resetStale(element: Element): void {
    const written = titles.get(element)
    if (written === undefined || element.getAttribute('title') !== written.title) return
    if (isCurrent(element, written)) return
    titles.delete(element)
    element.removeAttribute('title')
  }

  /** 别处改写过的 title 仍在：移除，元素复位自定义标记并按当前日期重新生成，渲染后再改写 */
  function resetForeign(element: Element, title: string): void {
    if (element.getAttribute('title') !== title) return
    cleared.add(element)
    element.removeAttribute('title')
  }

  function syncTitle(element: Element): void {
    const title = element.getAttribute('title')
    if (title === null) return
    const written = titles.get(element)
    if (written?.title === title) {
      // 渲染中移除 title，元素不会再排一次渲染：等这次渲染结束
      if (isCurrent(element, written)) watch(element)
      else queueMicrotask(() => resetStale(element))
      return
    }
    if (!CJK_RE.test(title)) return
    // 已改写过：元素不生成这种写法，来自失效的旧实例或克隆体，日期可能已变；同样等渲染结束再移除
    if (isRewritten(title) && !cleared.has(element)) {
      queueMicrotask(() => resetForeign(element, title))
      return
    }
    const rewritten = rewrite(element, title)
    if (rewritten !== title) element.setAttribute('title', rewritten)
    const time = timeOf(element)
    titles.set(element, { title: rewritten, time, offset: offsetAt(time) })
    watch(element)
  }

  function sync(element: Element): void {
    const root = element.shadowRoot
    if (root) syncText(element, root)
    syncTitle(element)
  }

  function onUpdated(event: Event): void {
    const target = event.composedPath()[0] as Node | undefined
    if (target?.nodeType !== ELEMENT_NODE) return
    const element = target as Element
    if (TIME_TAGS.has(element.localName) && owns(element)) sync(element)
  }

  return {
    attach() {
      if (attached) return
      attached = true
      doc.addEventListener(TIME_UPDATED_EVENT, onUpdated, true)
      zoneWatcher.start()
    },

    detach() {
      if (!attached) return
      attached = false
      doc.removeEventListener(TIME_UPDATED_EVENT, onUpdated, true)
      zoneWatcher.stop()
      observer.disconnect()
      watched = new WeakSet()
    },

    sync,

    syncText(element) {
      const root = element.shadowRoot
      if (root) syncText(element, root)
    },

    restore(element) {
      restoreText(element)
      const written = titles.get(element)
      if (written === undefined) return
      titles.delete(element)
      if (element.getAttribute('title') === written.title) element.removeAttribute('title')
    },

    reset(element) {
      const title = element.getAttribute('title')
      const written = titles.get(element)
      titles.delete(element)
      if (title === null) return
      if (written !== undefined) {
        if (title === written.title) element.removeAttribute('title')
        return
      }
      if (CJK_RE.test(title) && isRewritten(title)) {
        cleared.add(element)
        element.removeAttribute('title')
      }
    }
  }
}
