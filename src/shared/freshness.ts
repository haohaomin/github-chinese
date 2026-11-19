/**
 * 更新时间着色的时段与颜色（设置项 freshnessColors，处理见 core/freshness）。
 * 颜色按时段、GitHub 的浅色与深色主题各一项：值为 CSS 颜色或渐变（hex 统一为小写 #rrggbb），空字符串为默认
 * （FRESH_DAYS 天内、RECENT_DAYS 天内用主题的成功色、提示色，更早的不变）
 */

/** 时段的期限（天）：默认值 */
export const FRESH_DAYS = 30
export const RECENT_DAYS = 365
/** 自定义天数的范围 */
export const MIN_FRESH_DAYS = 1
export const MAX_FRESH_DAYS = 3650

/** 时段：fresh 为 FRESH_DAYS 天内，recent 为 RECENT_DAYS 天内，stale 为更早 */
export type FreshnessLevel = 'fresh' | 'recent' | 'stale'
export const FRESHNESS_LEVELS: readonly FreshnessLevel[] = ['fresh', 'recent', 'stale']

/** GitHub 的主题：浅色、深色 */
export type FreshnessScheme = 'light' | 'dark'
export const FRESHNESS_SCHEMES: readonly FreshnessScheme[] = ['light', 'dark']

export type FreshnessColors = Readonly<Record<FreshnessLevel, Readonly<Record<FreshnessScheme, string>>>>

/** 自定义时段天数：fresh 为多少天内，recent 为多少天内（须大于 fresh） */
export interface FreshnessDays {
  readonly fresh: number
  readonly recent: number
}

export const DEFAULT_FRESHNESS_DAYS: FreshnessDays = {
  fresh: FRESH_DAYS,
  recent: RECENT_DAYS
}

export const DEFAULT_FRESHNESS_COLORS: FreshnessColors = {
  fresh: { light: '', dark: '' },
  recent: { light: '', dark: '' },
  stale: { light: '', dark: '' }
}

/** 默认颜色在 GitHub 默认主题下的值（成功色、提示色、次要文字色）：设置页的预览与调色盘用 */
export const FRESHNESS_PREVIEW_COLORS: FreshnessColors = {
  fresh: { light: '#1a7f37', dark: '#3fb950' },
  recent: { light: '#9a6700', dark: '#d29922' },
  stale: { light: '#59636e', dark: '#9198a1' }
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

/** 读取存储、导入备份：逐项校验，缺失或格式不符的用默认 */
export function sanitizeFreshnessColors(value: unknown): FreshnessColors {
  const levels = isRecord(value) ? value : {}
  const levelColors = (level: FreshnessLevel): Record<FreshnessScheme, string> => {
    const schemes = levels[level]
    const pick = (scheme: FreshnessScheme): string => (isRecord(schemes) ? sanitizeColor(schemes[scheme]) : '')
    return { light: pick('light'), dark: pick('dark') }
  }
  return { fresh: levelColors('fresh'), recent: levelColors('recent'), stale: levelColors('stale') }
}

/** 读取存储、导入备份：校验自定义天数，缺失或越界用默认 */
export function sanitizeFreshnessDays(value: unknown): FreshnessDays {
  if (!isRecord(value)) return { ...DEFAULT_FRESHNESS_DAYS }
  const pick = (key: 'fresh' | 'recent', fallback: number): number => {
    const raw = value[key]
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback
    const rounded = Math.round(raw)
    if (rounded < MIN_FRESH_DAYS || rounded > MAX_FRESH_DAYS) return fallback
    return rounded
  }
  const fresh = pick('fresh', DEFAULT_FRESHNESS_DAYS.fresh)
  const recent = pick('recent', DEFAULT_FRESHNESS_DAYS.recent)
  // recent 必须 > fresh，否则用默认
  return { fresh, recent: recent > fresh ? recent : DEFAULT_FRESHNESS_DAYS.recent }
}

/** 改一项颜色（空字符串为默认），返回新的颜色设置 */
export function withFreshnessColor(
  colors: FreshnessColors,
  level: FreshnessLevel,
  scheme: FreshnessScheme,
  color: string
): FreshnessColors {
  return { ...colors, [level]: { ...colors[level], [scheme]: color } }
}

/** 改一项天数，返回新的天数设置；recent 自动保证 > fresh */
export function withFreshnessDays(days: FreshnessDays, key: 'fresh' | 'recent', value: number): FreshnessDays {
  const clamped = Math.max(MIN_FRESH_DAYS, Math.min(MAX_FRESH_DAYS, Math.round(value)))
  if (key === 'fresh') {
    return { fresh: clamped, recent: Math.max(clamped + 1, days.recent) }
  }
  return { fresh: days.fresh, recent: Math.max(days.fresh + 1, clamped) }
}
