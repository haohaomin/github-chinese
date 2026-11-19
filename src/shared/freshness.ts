/**
 * 更新时间着色的时段与颜色（设置项 freshnessRanges、freshnessBackground，处理见 core/freshness）。
 * 时段按天数从近到远排列（「N 天内」，天数不重复），其后是「更早」；各时段的文字颜色、背景色按 GitHub 的浅色、深色主题各一项：
 * 值为 CSS 颜色或渐变（hex 统一为小写 #rrggbb），空字符串为默认。
 * 默认颜色按时段的先后取色调（成功、提示、严重、危险、完成、强调），更早的文字不变、背景为中性色
 */

/** 时段的期限（天）：默认的两个时段 */
export const FRESH_DAYS = 30
export const RECENT_DAYS = 365
/** 自定义天数的范围 */
export const MIN_FRESH_DAYS = 1
export const MAX_FRESH_DAYS = 3650
/** 时段数（不含「更早」）的上下限 */
export const MIN_FRESHNESS_RANGES = 1
export const MAX_FRESHNESS_RANGES = 6

/** GitHub 的主题：浅色、深色 */
export type FreshnessScheme = 'light' | 'dark'
export const FRESHNESS_SCHEMES: readonly FreshnessScheme[] = ['light', 'dark']

/** 颜色的用处：文字、背景 */
export type FreshnessPaintKind = 'text' | 'background'
export const FRESHNESS_PAINT_KINDS: readonly FreshnessPaintKind[] = ['text', 'background']

/** 一项颜色在浅色、深色主题下的值，空字符串为默认 */
export type ThemedColor = Readonly<Record<FreshnessScheme, string>>

/** 一个时段的颜色 */
export type FreshnessPaint = Readonly<Record<FreshnessPaintKind, ThemedColor>>

/** 时段：days 天内（含） */
export interface FreshnessRange extends FreshnessPaint {
  readonly days: number
}

/** 时段设置：从近到远的各时段与「更早」 */
export interface FreshnessRanges {
  readonly ranges: readonly FreshnessRange[]
  readonly stale: FreshnessPaint
}

/** 时段的键：从近到远的序号，或 stale（更早） */
export type FreshnessKey = number | 'stale'

/** 默认颜色的色调：各时段按先后循环取，更早的为 neutral */
export type FreshnessTone = 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'accent' | 'neutral'
export const RANGE_TONES: readonly Exclude<FreshnessTone, 'neutral'>[] = ['success', 'attention', 'severe', 'danger', 'done', 'accent']

const EMPTY_COLOR: ThemedColor = { light: '', dark: '' }
const EMPTY_PAINT: FreshnessPaint = { text: EMPTY_COLOR, background: EMPTY_COLOR }

export function emptyRange(days: number): FreshnessRange {
  return { days, ...EMPTY_PAINT }
}

export const DEFAULT_FRESHNESS_RANGES: FreshnessRanges = {
  ranges: [emptyRange(FRESH_DAYS), emptyRange(RECENT_DAYS)],
  stale: EMPTY_PAINT
}

/** 时段的色调 */
export function toneOf(key: FreshnessKey): FreshnessTone {
  return key === 'stale' ? 'neutral' : RANGE_TONES[key % RANGE_TONES.length]!
}

/**
 * 各色调在 GitHub 默认主题下的值（文字色、柔和背景色）：设置页的预览与调色盘用。
 * 中性的文字色为次要文字色（更早的时间在页面上不改颜色，预览用它）
 */
export const FRESHNESS_PREVIEW_COLORS: Readonly<Record<FreshnessTone, FreshnessPaint>> = {
  success: { text: { light: '#1a7f37', dark: '#3fb950' }, background: { light: '#dafbe1', dark: '#2ea04326' } },
  attention: { text: { light: '#9a6700', dark: '#d29922' }, background: { light: '#fff8c5', dark: '#bb800926' } },
  severe: { text: { light: '#bc4c00', dark: '#db6d28' }, background: { light: '#fff1e5', dark: '#db6d281a' } },
  danger: { text: { light: '#d1242f', dark: '#f85149' }, background: { light: '#ffebe9', dark: '#f851491a' } },
  done: { text: { light: '#8250df', dark: '#ab7df8' }, background: { light: '#fbefff', dark: '#ab7df826' } },
  accent: { text: { light: '#0969da', dark: '#4493f8' }, background: { light: '#ddf4ff', dark: '#388bfd1a' } },
  neutral: { text: { light: '#59636e', dark: '#9198a1' }, background: { light: '#818b981f', dark: '#656c7633' } }
}

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** 颜色写法：#rgb 或 #rrggbb（# 可省，不分大小写，忽略首尾空白），统一为小写 #rrggbb；格式不符时为 undefined */
export function normalizeHexColor(value: string): string | undefined {
  const hex = HEX_COLOR.exec(value.trim())?.[1]?.toLowerCase()
  if (hex === undefined) return undefined
  return `#${hex.length === 3 ? [...hex].map(digit => digit + digit).join('') : hex}`
}

/** 浏览器的 CSS 支持检测：属性与值 → 是否支持（同 CSS.supports） */
export type CssSupports = (property: string, value: string) => boolean

/** 当前环境的 CSS.supports；没有 CSS 接口时（后台服务工作线程）只看写法 */
export function cssSupports(property: string, value: string): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' ? CSS.supports(property, value) : true
}

/** 渐变（linear、radial、conic，可带 repeating-）：用 background-image 着色 */
const GRADIENT_RE = /^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i
/** hex 写法：#rgb、#rgba、#rrggbb、#rrggbbaa */
const HEX_SYNTAX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
/** 浏览器能否在 light-dark() 里用图像（渐变）的检测样例 */
const LIGHT_DARK_IMAGE = 'light-dark(linear-gradient(#000, #000), linear-gradient(#000, #000))'
/** 颜色写法可用的字符：字母、数字、空白与 # ( ) , . % + - * /；引号、分号、花括号、冒号、反斜杠等都不收 */
const COLOR_CHARS = /^[\w\s#(),.%+\-*/]+$/
/** 注释、外部资源 */
const COLOR_UNSAFE = /\/\*|\*\/|url\s*\(/i

/** 是否为渐变写法 */
export function isGradient(value: string): boolean {
  return GRADIENT_RE.test(value.trim())
}

/** 写法检查：只含可用字符，不含注释与外部资源，括号成对（防止写进样式后吞掉后面的规则） */
function isSafeColorText(text: string): boolean {
  if (!COLOR_CHARS.test(text) || COLOR_UNSAFE.test(text)) return false
  let depth = 0
  for (const char of text) {
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  return depth === 0
}

/**
 * 是否为可用的颜色：CSS 颜色（#rgb、#rrggbbaa、rgb()、hsl()、颜色名等）或渐变；空串（默认）不算。
 * 先查写法，hex 按语法判断，其余由浏览器判断（supports 默认为 CSS.supports）。
 * 渐变要放进 light-dark() 按主题取值（见 core/freshness）：浏览器须支持在 light-dark() 里用图像，且只能一层
 * （多层渐变的逗号会让 light-dark() 多出参数）。检测样例不含 var()：含 var() 的值在解析时一律算合法
 */
export function isValidColor(value: string, supports: CssSupports = cssSupports): boolean {
  const text = value.trim()
  if (text === '' || !isSafeColorText(text)) return false
  if (text.startsWith('#')) return HEX_SYNTAX.test(text)
  if (isGradient(text)) {
    return supports('background-image', LIGHT_DARK_IMAGE) && supports('background-image', `light-dark(${text}, ${text})`)
  }
  return supports('color', text)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 存储里的颜色：只查写法（后台没有 CSS 接口）；hex 统一为小写 #rrggbb，其他写法原样保留 */
function sanitizeColor(value: unknown): string {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (text === '' || !isSafeColorText(text)) return ''
  return normalizeHexColor(text) ?? text
}

function sanitizeThemed(value: unknown): ThemedColor {
  return isRecord(value) ? { light: sanitizeColor(value.light), dark: sanitizeColor(value.dark) } : EMPTY_COLOR
}

function sanitizePaint(value: unknown): FreshnessPaint {
  return isRecord(value) ? { text: sanitizeThemed(value.text), background: sanitizeThemed(value.background) } : EMPTY_PAINT
}

/** 天数：整数、在范围内；否则为 undefined */
function sanitizeDays(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const rounded = Math.round(value)
  return rounded >= MIN_FRESH_DAYS && rounded <= MAX_FRESH_DAYS ? rounded : undefined
}

/** 按天数从小到大，天数重复的只留第一个，最多 MAX_FRESHNESS_RANGES 个 */
function normalizeRanges(ranges: readonly FreshnessRange[]): FreshnessRange[] {
  const sorted: FreshnessRange[] = []
  for (const range of [...ranges].sort((a, b) => a.days - b.days)) {
    if (sorted.at(-1)?.days !== range.days) sorted.push(range)
  }
  return sorted.slice(0, MAX_FRESHNESS_RANGES)
}

/**
 * 1.6 的设置：两个时段的天数（freshnessDays：fresh、recent）与三个时段的文字颜色（freshnessColors：fresh、recent、stale），
 * 换成时段设置；没有或不合法的用默认
 */
export function migrateLegacyFreshness(days: unknown, colors: unknown): FreshnessRanges {
  const picked = isRecord(days) ? days : {}
  const fresh = sanitizeDays(picked.fresh) ?? FRESH_DAYS
  const recentDays = sanitizeDays(picked.recent)
  const recent = recentDays !== undefined && recentDays > fresh ? recentDays : Math.max(RECENT_DAYS, fresh + 1)
  const levels = isRecord(colors) ? colors : {}
  const paint = (level: string): FreshnessPaint => ({ text: sanitizeThemed(levels[level]), background: EMPTY_COLOR })
  return {
    // 近期已是上限（3650 天）时次近与之重复，只留近期
    ranges: normalizeRanges([
      { days: fresh, ...paint('fresh') },
      { days: Math.min(recent, MAX_FRESH_DAYS), ...paint('recent') }
    ]),
    stale: paint('stale')
  }
}

/**
 * 读取存储、导入备份：校验时段设置；没有时按 1.6 的设置（legacy）换算。
 * 天数不合法的时段丢弃，按天数排序、去重；一个时段都没有时用默认
 */
export function sanitizeFreshnessRanges(value: unknown, legacy?: { readonly days: unknown; readonly colors: unknown }): FreshnessRanges {
  if (!isRecord(value) || !Array.isArray(value.ranges)) {
    return legacy ? migrateLegacyFreshness(legacy.days, legacy.colors) : DEFAULT_FRESHNESS_RANGES
  }
  const ranges = normalizeRanges(
    value.ranges.flatMap((item): FreshnessRange[] => {
      const days = isRecord(item) ? sanitizeDays(item.days) : undefined
      return days === undefined ? [] : [{ days, ...sanitizePaint(item) }]
    })
  )
  if (ranges.length < MIN_FRESHNESS_RANGES) return DEFAULT_FRESHNESS_RANGES
  return { ranges, stale: sanitizePaint(value.stale) }
}

/** 时段的颜色 */
export function paintOf(config: FreshnessRanges, key: FreshnessKey): FreshnessPaint | undefined {
  return key === 'stale' ? config.stale : config.ranges[key]
}

/** 改一项颜色（空字符串为默认）；days 为时段的天数（时段改了天数或已删除时不改），stale 为更早 */
export function withFreshnessColor(
  config: FreshnessRanges,
  target: number | 'stale',
  kind: FreshnessPaintKind,
  scheme: FreshnessScheme,
  color: string
): FreshnessRanges {
  const paint = (current: FreshnessPaint): FreshnessPaint => ({ ...current, [kind]: { ...current[kind], [scheme]: color } })
  if (target === 'stale') return { ...config, stale: paint(config.stale) }
  return { ...config, ranges: config.ranges.map(range => (range.days === target ? { ...range, ...paint(range) } : range)) }
}

/** 天数是否可改为 value：在范围内且不与其他时段重复 */
export function canSetRangeDays(config: FreshnessRanges, index: number, value: number): boolean {
  const days = Math.round(value)
  if (!Number.isFinite(days) || days < MIN_FRESH_DAYS || days > MAX_FRESH_DAYS) return false
  return config.ranges.every((range, other) => other === index || range.days !== days)
}

/** 改一个时段的天数（取整）并按天数重新排序；越界或与其他时段重复时不改 */
export function withRangeDays(config: FreshnessRanges, index: number, value: number): FreshnessRanges {
  const range = config.ranges[index]
  if (!range || !canSetRangeDays(config, index, value)) return config
  const days = Math.round(value)
  return { ...config, ranges: normalizeRanges(config.ranges.map((item, other) => (other === index ? { ...item, days } : item))) }
}

/** 新时段的天数：最后一个的两倍（不超过上限）；已到上限时取相邻时段间最大空隙的中点；放不下时为 undefined */
export function nextRangeDays(config: FreshnessRanges): number | undefined {
  if (config.ranges.length >= MAX_FRESHNESS_RANGES) return undefined
  const days = config.ranges.map(range => range.days)
  const last = days.at(-1)
  if (last === undefined) return FRESH_DAYS
  const doubled = Math.min(MAX_FRESH_DAYS, last * 2)
  if (doubled > last) return doubled
  let best: number | undefined
  let gap = 1
  days.forEach((value, index) => {
    const previous = index === 0 ? 0 : days[index - 1]!
    if (value - previous > gap) {
      gap = value - previous
      best = previous + Math.floor(gap / 2)
    }
  })
  return best !== undefined && best >= MIN_FRESH_DAYS ? best : undefined
}

/** 加一个时段（天数见 nextRangeDays）；放不下时不改 */
export function withAddedRange(config: FreshnessRanges): FreshnessRanges {
  const days = nextRangeDays(config)
  return days === undefined ? config : { ...config, ranges: normalizeRanges([...config.ranges, emptyRange(days)]) }
}

/** 删除一个时段；至少留 MIN_FRESHNESS_RANGES 个 */
export function withoutRange(config: FreshnessRanges, index: number): FreshnessRanges {
  if (config.ranges.length <= MIN_FRESHNESS_RANGES || !config.ranges[index]) return config
  return { ...config, ranges: config.ranges.filter((_range, other) => other !== index) }
}
