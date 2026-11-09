/**
 * 更新时间着色：存储库文件列表（首页、目录页）各项的最近提交时间，以及最近一次提交的时间（文件列表上方、文件页），
 * 按距今远近改文字颜色。默认 FRESH_DAYS 天内绿色、RECENT_DAYS 天内琥珀色（GitHub 主题的成功色、提示色），更早的不变；
 * 各时段的颜色可在设置页按 GitHub 的浅色、深色主题分别改（见 shared/freshness）。
 * 只改颜色，不改文字；时间取自 <relative-time> 的 datetime。
 * 思路参考 GitHub-Freshness（rational-stars），不搬运代码
 */
import {
  DEFAULT_FRESHNESS_COLORS,
  FRESH_DAYS,
  FRESHNESS_LEVELS,
  normalizeHexColor,
  RECENT_DAYS,
  type FreshnessColors,
  type FreshnessLevel
} from '../shared/freshness'

export interface FreshnessDeps {
  /** 是否开启（总开关与本功能的开关） */
  readonly active: () => boolean
  /** 各时段的颜色；不给时都用默认 */
  readonly colors?: () => FreshnessColors
  /** 当前时间（毫秒时间戳）；不给时用 Date.now */
  readonly now?: () => number
}

export interface FreshnessMarker {
  /** 设置变化后：关闭时移除，开启时补上，颜色变了时换样式 */
  refresh(): void
  /** 停止：移除颜色，不再处理 */
  stop(): void
}

/** 加的属性：值为时段（见 FreshnessLevel） */
export const FRESHNESS_ATTRIBUTE = 'data-gcn-freshness'

const STYLE_ID = 'gcn-freshness-style'
const DAY_MS = 24 * 60 * 60 * 1000
/** 文件列表各项的时间；最近一次提交的时间（窄屏、宽屏各一处） */
const TIME_SELECTOR = [
  '.react-directory-commit-age relative-time',
  '[data-testid="latest-commit"] relative-time',
  '[data-testid="latest-commit-details"] relative-time'
].join(', ')

/**
 * 各时段的默认颜色：主题的成功色、提示色（旧版主题的变量名、默认主题的值兜底）；更早的不变。
 * currentColor 在 color 属性里取继承的颜色，即时间原本的颜色
 */
const DEFAULT_COLORS: Readonly<Record<FreshnessLevel, string>> = {
  fresh: 'var(--fgColor-success, var(--color-success-fg, #1a7f37))',
  recent: 'var(--fgColor-attention, var(--color-attention-fg, #9a6700))',
  stale: 'currentColor'
}

/** 距今远近：datetime 无效时为 undefined；晚于当前（时钟偏差）的算 fresh */
export function freshnessOf(datetime: string | null, now: number): FreshnessLevel | undefined {
  const time = datetime === null ? Number.NaN : Date.parse(datetime)
  if (!Number.isFinite(time)) return undefined
  const days = (now - time) / DAY_MS
  if (days <= FRESH_DAYS) return 'fresh'
  if (days <= RECENT_DAYS) return 'recent'
  return 'stale'
}

/**
 * 样式：每个时段一条，都没改过的「更早」不加。改过的用 light-dark() 按页面的 color-scheme
 * （GitHub 按当前主题设置，跟随系统时随系统）取浅色或深色主题的颜色，没改的一侧用默认
 */
export function freshnessStyle(colors: FreshnessColors): string {
  return FRESHNESS_LEVELS.flatMap(level => {
    const fallback = DEFAULT_COLORS[level]
    const light = normalizeHexColor(colors[level].light)
    const dark = normalizeHexColor(colors[level].dark)
    if (light === undefined && dark === undefined) {
      return level === 'stale' ? [] : [`relative-time[${FRESHNESS_ATTRIBUTE}="${level}"] { color: ${fallback} !important; }`]
    }
    const color = `light-dark(${light ?? fallback}, ${dark ?? fallback})`
    return [`relative-time[${FRESHNESS_ATTRIBUTE}="${level}"] { color: ${color} !important; }`]
  }).join('\n')
}

export function createFreshness(doc: Document, deps: FreshnessDeps): FreshnessMarker {
  const now = deps.now ?? (() => Date.now())
  const colors = deps.colors ?? (() => DEFAULT_FRESHNESS_COLORS)
  /** 页面上有没有加过：没有时关闭状态下的变动不用查找移除 */
  let marked = false
  let scheduled = false
  let stopped = false

  function ensureStyle(): void {
    const css = freshnessStyle(colors())
    const existing = doc.getElementById(STYLE_ID)
    if (existing) {
      if (existing.textContent !== css) existing.textContent = css
      return
    }
    const style = doc.createElement('style')
    style.id = STYLE_ID
    style.textContent = css
    ;(doc.head ?? doc.documentElement).append(style)
  }

  function removeAll(): void {
    if (!marked) return
    marked = false
    for (const element of doc.querySelectorAll(`[${FRESHNESS_ATTRIBUTE}]`)) element.removeAttribute(FRESHNESS_ATTRIBUTE)
    doc.getElementById(STYLE_ID)?.remove()
  }

  function mark(time: Element, at: number): void {
    const level = freshnessOf(time.getAttribute('datetime'), at)
    const current = time.getAttribute(FRESHNESS_ATTRIBUTE)
    if (level === undefined) {
      if (current !== null) time.removeAttribute(FRESHNESS_ATTRIBUTE)
    } else if (current !== level) {
      time.setAttribute(FRESHNESS_ATTRIBUTE, level)
    }
  }

  function scan(): void {
    scheduled = false
    if (stopped) return
    if (!deps.active()) {
      removeAll()
      return
    }
    const times = doc.querySelectorAll(TIME_SELECTOR)
    if (times.length === 0) return
    ensureStyle()
    marked = true
    const at = now()
    for (const time of times) mark(time, at)
  }

  function schedule(): void {
    if (scheduled || stopped) return
    scheduled = true
    queueMicrotask(scan)
  }

  // 新出现的行、软导航换掉的列表；同一元素换了时间（React 复用节点）
  const observer = new MutationObserver(schedule)
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['datetime'] })
  scan()

  return {
    refresh: scan,
    stop() {
      stopped = true
      observer.disconnect()
      removeAll()
    }
  }
}
