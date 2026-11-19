/**
 * 更新时间着色：存储库文件列表（首页、目录页）各项的最近提交时间，以及最近一次提交的时间（文件列表上方、文件页），
 * 按距今远近改文字颜色，可加背景色。时段（「N 天内」与「更早」）及各时段的颜色可在设置页改（见 shared/freshness）：
 * 默认按时段先后用 GitHub 主题的成功色、提示色、严重色等，更早的不变；背景色默认为同色调的柔和底色。
 * 只改颜色，不改文字；时间取自 <relative-time> 的 datetime。
 * 思路参考 GitHub-Freshness（rational-stars），不搬运代码
 */
import {
  cssSupports,
  DEFAULT_FRESHNESS_RANGES,
  isGradient,
  isValidColor,
  toneOf,
  type CssSupports,
  type FreshnessKey,
  type FreshnessPaint,
  type FreshnessRanges,
  type FreshnessTone,
  type ThemedColor
} from '../shared/freshness'

/** 着色的设置：时段与颜色、是否加背景色 */
export interface FreshnessConfig {
  readonly ranges: FreshnessRanges
  readonly background: boolean
}

export interface FreshnessDeps {
  /** 是否开启（总开关与本功能的开关） */
  readonly active: () => boolean
  /** 时段与颜色；不给时用默认 */
  readonly config?: () => FreshnessConfig
  /** 当前时间（毫秒时间戳）；不给时用 Date.now */
  readonly now?: () => number
}

export interface FreshnessMarker {
  /** 设置变化后：关闭时移除，开启时补上，时段、颜色变了时重新标记、换样式 */
  refresh(): void
  /** 停止：移除颜色，不再处理 */
  stop(): void
}

/** 加的属性：值为时段的序号（从近到远，0 起），更早的为 stale */
export const FRESHNESS_ATTRIBUTE = 'data-gcn-freshness'

const STYLE_ID = 'gcn-freshness-style'
const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_CONFIG: FreshnessConfig = { ranges: DEFAULT_FRESHNESS_RANGES, background: false }
/** 文件列表各项的时间；最近一次提交的时间（窄屏、宽屏各一处） */
const TIME_SELECTOR = [
  '.react-directory-commit-age relative-time',
  '[data-testid="latest-commit"] relative-time',
  '[data-testid="latest-commit-details"] relative-time'
].join(', ')

/**
 * 默认文字色：主题的各色调（旧版主题的变量名、默认主题的值兜底）；更早的不变。
 * currentColor 在 color 属性里取继承的颜色，即时间原本的颜色
 */
const DEFAULT_TEXT: Readonly<Record<FreshnessTone, string>> = {
  success: 'var(--fgColor-success, var(--color-success-fg, #1a7f37))',
  attention: 'var(--fgColor-attention, var(--color-attention-fg, #9a6700))',
  severe: 'var(--fgColor-severe, var(--color-severe-fg, #bc4c00))',
  danger: 'var(--fgColor-danger, var(--color-danger-fg, #d1242f))',
  done: 'var(--fgColor-done, var(--color-done-fg, #8250df))',
  accent: 'var(--fgColor-accent, var(--color-accent-fg, #0969da))',
  neutral: 'currentColor'
}

/** 默认背景色：主题的各色调的柔和底色 */
const DEFAULT_BACKGROUND: Readonly<Record<FreshnessTone, string>> = {
  success: 'var(--bgColor-success-muted, var(--color-success-subtle, #dafbe1))',
  attention: 'var(--bgColor-attention-muted, var(--color-attention-subtle, #fff8c5))',
  severe: 'var(--bgColor-severe-muted, var(--color-severe-subtle, #fff1e5))',
  danger: 'var(--bgColor-danger-muted, var(--color-danger-subtle, #ffebe9))',
  done: 'var(--bgColor-done-muted, var(--color-done-subtle, #fbefff))',
  accent: 'var(--bgColor-accent-muted, var(--color-accent-subtle, #ddf4ff))',
  neutral: 'var(--bgColor-neutral-muted, var(--color-neutral-muted, #818b981f))'
}

/** 加背景色时的内边距与圆角：换行时每行各自带上 */
const BOX = 'padding: 0 4px !important; border-radius: 6px !important; -webkit-box-decoration-break: clone; box-decoration-break: clone;'
/** 文字按 background-image 显示（渐变文字） */
const TEXT_FILL = '-webkit-text-fill-color: transparent !important;'

/** 距今远近：days 为各时段的天数（从小到大）；datetime 无效时为 undefined；晚于当前（时钟偏差）的算第一个时段 */
export function freshnessOf(datetime: string | null, now: number, days: readonly number[]): FreshnessKey | undefined {
  const time = datetime === null ? Number.NaN : Date.parse(datetime)
  if (!Number.isFinite(time)) return undefined
  const age = (now - time) / DAY_MS
  const index = days.findIndex(limit => age <= limit)
  return index === -1 ? 'stale' : index
}

/** 改过的一项：浏览器不认的值按没改（见 isValidColor） */
interface Picked {
  readonly light: string | undefined
  readonly dark: string | undefined
}

function pick(color: ThemedColor, supports: CssSupports): Picked {
  const value = (text: string): string | undefined => (isValidColor(text, supports) ? text.trim() : undefined)
  return { light: value(color.light), dark: value(color.dark) }
}

function changed(color: Picked): boolean {
  return color.light !== undefined || color.dark !== undefined
}

function hasGradient(color: Picked): boolean {
  return [color.light, color.dark].some(value => value !== undefined && isGradient(value))
}

/** light-dark() 取值：没改的一侧用默认 */
function lightDark(color: Picked, fallback: string): string {
  return `light-dark(${color.light ?? fallback}, ${color.dark ?? fallback})`
}

/** 按图像（light-dark() 的两个值须同为颜色或同为图像）：颜色写成单色渐变 */
function lightDarkImage(color: Picked, fallback: string): string {
  const image = (value: string | undefined): string => {
    if (value !== undefined && isGradient(value)) return value
    const solid = value ?? fallback
    return `linear-gradient(${solid}, ${solid})`
  }
  return `light-dark(${image(color.light)}, ${image(color.dark)})`
}

/** 一个时段的声明；不用改的为空串 */
function declarations(paint: FreshnessPaint, tone: FreshnessTone, background: boolean, supports: CssSupports): string {
  const text = pick(paint.text, supports)
  const textFallback = DEFAULT_TEXT[tone]
  if (!background) {
    if (hasGradient(text)) {
      return `background-image: ${lightDarkImage(text, textFallback)} !important; -webkit-background-clip: text !important; background-clip: text !important; ${TEXT_FILL}`
    }
    if (changed(text)) return `color: ${lightDark(text, textFallback)} !important;`
    return tone === 'neutral' ? '' : `color: ${textFallback} !important;`
  }
  const fill = pick(paint.background, supports)
  const fillFallback = DEFAULT_BACKGROUND[tone]
  // 渐变文字：文字一层裁到文字，背景另起一层（各层分别裁切）
  if (hasGradient(text)) {
    return (
      `background-image: ${lightDarkImage(text, textFallback)}, ${lightDarkImage(fill, fillFallback)} !important; ` +
      `-webkit-background-clip: text, padding-box !important; background-clip: text, padding-box !important; ${TEXT_FILL} ${BOX}`
    )
  }
  const color = changed(text)
    ? `color: ${lightDark(text, textFallback)} !important; `
    : tone === 'neutral'
      ? ''
      : `color: ${textFallback} !important; `
  const fillDeclaration = hasGradient(fill)
    ? `background-image: ${lightDarkImage(fill, fillFallback)} !important;`
    : `background-color: ${changed(fill) ? lightDark(fill, fillFallback) : fillFallback} !important;`
  return `${color}${fillDeclaration} ${BOX}`
}

/**
 * 样式：每个时段一条，不用改的（默认的「更早」且不加背景色）不加。改过的颜色用 light-dark() 按页面的 color-scheme
 * （GitHub 按当前主题设置，跟随系统时随系统）取浅色或深色主题的值，没改的一侧用默认；浏览器不认的值按默认（见 isValidColor）
 */
export function freshnessStyle(config: FreshnessConfig, supports: CssSupports = cssSupports): string {
  const { ranges, stale } = config.ranges
  const segments: [FreshnessKey, FreshnessPaint][] = [
    ...ranges.map((range, index): [FreshnessKey, FreshnessPaint] => [index, range]),
    ['stale', stale]
  ]
  return segments
    .flatMap(([key, paint]) => {
      const body = declarations(paint, toneOf(key), config.background, supports)
      return body === '' ? [] : [`relative-time[${FRESHNESS_ATTRIBUTE}="${key}"] { ${body} }`]
    })
    .join('\n')
}

export function createFreshness(doc: Document, deps: FreshnessDeps): FreshnessMarker {
  const now = deps.now ?? (() => Date.now())
  const config = deps.config ?? (() => DEFAULT_CONFIG)
  /** 页面上有没有加过：没有时关闭状态下的变动不用查找移除 */
  let marked = false
  let scheduled = false
  let stopped = false

  function ensureStyle(current: FreshnessConfig): void {
    const css = freshnessStyle(current)
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

  function mark(time: Element, at: number, days: readonly number[]): void {
    const key = freshnessOf(time.getAttribute('datetime'), at, days)
    const current = time.getAttribute(FRESHNESS_ATTRIBUTE)
    if (key === undefined) {
      if (current !== null) time.removeAttribute(FRESHNESS_ATTRIBUTE)
    } else if (current !== String(key)) {
      time.setAttribute(FRESHNESS_ATTRIBUTE, String(key))
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
    const current = config()
    ensureStyle(current)
    marked = true
    const at = now()
    const days = current.ranges.ranges.map(range => range.days)
    for (const time of times) mark(time, at, days)
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
