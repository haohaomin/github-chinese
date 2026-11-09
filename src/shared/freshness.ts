/**
 * 更新时间着色的时段与颜色（设置项 freshnessColors，处理见 core/freshness）。
 * 颜色按时段、GitHub 的浅色与深色主题各一项：值为小写 #rrggbb，空字符串为默认
 * （FRESH_DAYS 天内、RECENT_DAYS 天内用主题的成功色、提示色，更早的不变）
 */

/** 时段的期限（天） */
export const FRESH_DAYS = 30
export const RECENT_DAYS = 365

/** 时段：fresh 为 FRESH_DAYS 天内，recent 为 RECENT_DAYS 天内，stale 为更早 */
export type FreshnessLevel = 'fresh' | 'recent' | 'stale'
export const FRESHNESS_LEVELS: readonly FreshnessLevel[] = ['fresh', 'recent', 'stale']

/** GitHub 的主题：浅色、深色 */
export type FreshnessScheme = 'light' | 'dark'
export const FRESHNESS_SCHEMES: readonly FreshnessScheme[] = ['light', 'dark']

export type FreshnessColors = Readonly<Record<FreshnessLevel, Readonly<Record<FreshnessScheme, string>>>>

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeColor(value: unknown): string {
  return typeof value === 'string' ? (normalizeHexColor(value) ?? '') : ''
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

/** 改一项颜色（空字符串为默认），返回新的颜色设置 */
export function withFreshnessColor(
  colors: FreshnessColors,
  level: FreshnessLevel,
  scheme: FreshnessScheme,
  color: string
): FreshnessColors {
  return { ...colors, [level]: { ...colors[level], [scheme]: color } }
}
