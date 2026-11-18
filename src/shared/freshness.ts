/**
 * 更新时间着色的时段与颜色（设置项 freshnessColors，处理见 core/freshness）。
 * 颜色按时段、GitHub 的浅色与深色主题各一项：值为小写 #rrggbb，空字符串为默认
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

/** 默认颜色在 GitHub 默认主题下的值（成功色、提示色、次要文字色）：设置页的预览与取色器用 */
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

/**
 * 验证颜色写法是否为合法 CSS 颜色值（宽松验证：非空字符串视为合法）。
 * 支持 #rrggbb、#rgb、rgba(...)、渐变等任意 CSS 颜色。
 * 空字符串表示使用默认颜色。
 */
/** CSS 注入特征：分号、花括号、url() */
const UNSAFE_COLOR = /[;{}]|^\s*url\s*\(/i

export function isValidColor(value: string): boolean {
  const trimmed = value.trim()
  return trimmed !== '' && !UNSAFE_COLOR.test(trimmed)
}

/** 规范化颜色：空为默认；去掉首尾空白；不做格式验证（由 isValidColor 负责） */
export function normalizeColor(value: string): string {
  return value.trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeColor(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (UNSAFE_COLOR.test(trimmed)) return ''
  // 优先按 hex 规范化（保持向后兼容）；非 hex 的任意 CSS 值原样保留
  return normalizeHexColor(trimmed) ?? trimmed
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
