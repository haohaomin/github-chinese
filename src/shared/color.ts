/**
 * 颜色的解析、换算与写法（设置页的调色盘用）。
 * 纯色：hex（#rgb、#rgba、#rrggbb、#rrggbbaa）、rgb() / rgba()、hsl() / hsla()（逗号、空格两种写法）；
 * 颜色名、oklch() 等其他写法交给 ColorResolver 换算（浏览器里用画布，见 createCanvasResolver）。
 * 渐变：linear / radial / conic（可带 repeating-），色标位置只认百分比；radial 的形状、conic 的 at 位置原样保留。
 * 调色盘内部用 HSV：饱和度、明度为 0 时色相照样保留，拖动不跳色
 */

/** sRGB 颜色：r、g、b 为 0–255，a 为 0–1 */
export interface Rgba {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

/** HSV 颜色：h 为 0–360，s、v、a 为 0–1 */
export interface Hsva {
  readonly h: number
  readonly s: number
  readonly v: number
  readonly a: number
}

/** HSL：h 为 0–360，s、l 为 0–1 */
export interface Hsl {
  readonly h: number
  readonly s: number
  readonly l: number
}

/** 颜色写法 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl'
export const COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl']

export interface ParsedColor {
  readonly color: Hsva
  readonly format: ColorFormat
}

/** 其他写法（颜色名、oklch() 等）→ sRGB；不认时为 undefined */
export type ColorResolver = (text: string) => Rgba | undefined

export type GradientType = 'linear' | 'radial' | 'conic'
export const GRADIENT_TYPES: readonly GradientType[] = ['linear', 'radial', 'conic']

/** 色标：position 为 0–100（%） */
export interface GradientStop {
  readonly color: Hsva
  readonly position: number
}

export interface Gradient {
  readonly type: GradientType
  readonly repeating: boolean
  /** linear 的方向、conic 的起始角度（deg，0–360）；radial 不用 */
  readonly angle: number
  /** radial 的形状、大小与位置（如 circle at top），conic 的 at 位置：原样保留，可为空 */
  readonly shape: string
  /** 至少两个 */
  readonly stops: readonly GradientStop[]
}

export interface ParsedGradient {
  readonly gradient: Gradient
  /** 第一个色标的写法 */
  readonly format: ColorFormat
}

/** linear 不写方向时的角度（自上而下） */
const DEFAULT_LINEAR_ANGLE = 180

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 四舍五入到 digits 位小数 */
function round(value: number, digits = 0): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** 角度归入 [0, 360) */
export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360
}

// —— 换算 ——

/** 色相（deg）：r、g、b 为 0–1，max、delta 为其最大值与极差（delta > 0） */
function hueOf(red: number, green: number, blue: number, max: number, delta: number): number {
  if (max === red) return ((green - blue) / delta + (green < blue ? 6 : 0)) * 60
  if (max === green) return ((blue - red) / delta + 2) * 60
  return ((red - green) / delta + 4) * 60
}

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const channel = (n: number): number => {
    const k = (n + h / 60) % 6
    return (v - v * s * clamp(Math.min(k, 4 - k), 0, 1)) * 255
  }
  return { r: channel(5), g: channel(3), b: channel(1), a }
}

/** sRGB → HSV。灰色没有色相时取 hue，黑色没有饱和度时取 saturation（拖动时保留原来的值） */
export function rgbToHsv({ r, g, b, a }: Rgba, hue = 0, saturation = 0): Hsva {
  const [red, green, blue] = [r / 255, g / 255, b / 255] as const
  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)
  return {
    h: delta === 0 ? hue : hueOf(red, green, blue, max, delta),
    s: max === 0 ? saturation : delta / max,
    v: max,
    a
  }
}

export function hsvToHsl({ h, s, v }: Hsva): Hsl {
  const l = v * (1 - s / 2)
  const lightnessSpan = Math.min(l, 1 - l)
  return { h, s: lightnessSpan <= 0 ? 0 : clamp((v - l) / lightnessSpan, 0, 1), l }
}

export function hslToHsv({ h, s, l }: Hsl, a: number): Hsva {
  const v = l + s * Math.min(l, 1 - l)
  return { h, s: v <= 0 ? 0 : clamp(2 * (1 - l / v), 0, 1), v, a }
}

// —— 纯色的解析与写法 ——

const NUMBER = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?`
const NUMBER_RE = new RegExp(`^${NUMBER}$`, 'i')
const PERCENT_RE = new RegExp(`^(${NUMBER})%$`, 'i')
const ANGLE_RE = new RegExp(`^(${NUMBER})(deg|grad|rad|turn)?$`, 'i')
const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const COLOR_FUNCTION_RE = /^(rgba?|hsla?)\(([^()]*)\)$/i
/** 角度单位 → deg 的倍数 */
const ANGLE_UNITS: Readonly<Record<string, number>> = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 }

/** 数字或百分比（100% = percentScale）；none 为 0 */
function parseNumberOrPercent(token: string, percentScale: number): number | undefined {
  if (token.toLowerCase() === 'none') return 0
  const percent = PERCENT_RE.exec(token)?.[1]
  if (percent !== undefined) return (Number(percent) / 100) * percentScale
  return NUMBER_RE.test(token) ? Number(token) : undefined
}

/** 透明度：0–1 的数字或百分比；不写为 1 */
function parseAlpha(token: string | undefined): number | undefined {
  if (token === undefined) return 1
  const value = parseNumberOrPercent(token, 1)
  return value === undefined ? undefined : clamp(value, 0, 1)
}

/** 色相：数字（deg）或带单位的角度 → 0–360；none 为 0 */
function parseHue(token: string): number | undefined {
  if (token.toLowerCase() === 'none') return 0
  const match = ANGLE_RE.exec(token)
  if (!match) return undefined
  return normalizeDegrees(Number(match[1]) * (ANGLE_UNITS[(match[2] ?? 'deg').toLowerCase()] ?? 1))
}

/** hex → sRGB；格式不符为 undefined */
export function parseHex(text: string): Rgba | undefined {
  const digits = HEX_RE.exec(text.trim())?.[1]
  if (digits === undefined) return undefined
  const full = digits.length <= 4 ? [...digits].map(digit => digit + digit).join('') : digits
  const channel = (index: number): number => parseInt(full.slice(index * 2, index * 2 + 2), 16)
  return { r: channel(0), g: channel(1), b: channel(2), a: full.length === 8 ? channel(3) / 255 : 1 }
}

/** rgb()、hsl() 的参数：逗号写法 3 或 4 项；空格写法 3 项，透明度在 / 后 */
function functionArgs(body: string): readonly string[] | undefined {
  const text = body.trim()
  if (text.includes(',')) {
    const parts = text.split(',').map(part => part.trim())
    return parts.length === 3 || parts.length === 4 ? parts : undefined
  }
  const [main = '', alpha, ...rest] = text.split('/').map(part => part.trim())
  const parts = main.split(/\s+/).filter(Boolean)
  if (rest.length > 0 || parts.length !== 3 || alpha === '') return undefined
  return alpha === undefined ? parts : [...parts, alpha]
}

function parseColorFunction(name: string, body: string): ParsedColor | undefined {
  const args = functionArgs(body)
  if (!args) return undefined
  const [first = '', second = '', third = '', alphaText] = args
  const a = parseAlpha(alphaText)
  if (name.startsWith('rgb')) {
    const [r, g, b] = [first, second, third].map(token => parseNumberOrPercent(token, 255))
    if (r === undefined || g === undefined || b === undefined || a === undefined) return undefined
    return { color: rgbToHsv({ r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255), a }), format: 'rgb' }
  }
  const h = parseHue(first)
  // 饱和度、亮度：百分比；空格写法里也可以是数字（同百分数）
  const [s, l] = [second, third].map(token => parseNumberOrPercent(token, 100))
  if (h === undefined || s === undefined || l === undefined || a === undefined) return undefined
  return { color: hslToHsv({ h, s: clamp(s / 100, 0, 1), l: clamp(l / 100, 0, 1) }, a), format: 'hsl' }
}

/** 纯色 → HSV 与写法；hex、rgb()、hsl() 以外的写法交给 resolve（按 hex 写出） */
export function parseColor(text: string, resolve?: ColorResolver): ParsedColor | undefined {
  const value = text.trim()
  const hex = parseHex(value)
  if (hex) return { color: rgbToHsv(hex), format: 'hex' }
  const match = COLOR_FUNCTION_RE.exec(value)
  if (match) return parseColorFunction((match[1] ?? '').toLowerCase(), match[2] ?? '')
  const resolved = value === '' ? undefined : resolve?.(value)
  return resolved ? { color: rgbToHsv(resolved), format: 'hex' } : undefined
}

function hexByte(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0')
}

/** 按写法写出：hex 为小写 #rrggbb（不透明）或 #rrggbbaa；rgb、hsl 不透明时不写透明度，透明度保留两位小数 */
export function formatColor(color: Hsva, format: ColorFormat): string {
  const alpha = round(clamp(color.a, 0, 1), 2)
  if (format === 'hsl') {
    const { h, s, l } = hsvToHsl(color)
    const body = `${round(h) % 360}, ${round(s * 100)}%, ${round(l * 100)}%`
    return alpha < 1 ? `hsla(${body}, ${alpha})` : `hsl(${body})`
  }
  const { r, g, b } = hsvToRgb(color)
  if (format === 'rgb') {
    const body = [r, g, b].map(value => Math.round(clamp(value, 0, 255))).join(', ')
    return alpha < 1 ? `rgba(${body}, ${alpha})` : `rgb(${body})`
  }
  // hex 的透明度按 1/255 取整，不经两位小数
  const alphaByte = Math.round(clamp(color.a, 0, 1) * 255)
  return `#${[r, g, b].map(hexByte).join('')}${alphaByte < 255 ? hexByte(alphaByte) : ''}`
}

/** 写成 CSS 的 rgb()（不论写法）：调色盘的预览用 */
export function cssColor(color: Hsva): string {
  return formatColor(color, 'rgb')
}

/**
 * 浏览器里把任意 CSS 颜色换成 sRGB：在 1×1 的画布上画一点再读回（超出 sRGB 的截断）。
 * 没有画布（测试环境）或写法无效时为 undefined
 */
export function createCanvasResolver(): ColorResolver {
  let context: CanvasRenderingContext2D | null | undefined
  return text => {
    if (context === undefined) {
      try {
        context = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d', { willReadFrequently: true })
      } catch {
        context = null
      }
    }
    if (!context) return undefined
    // 写法无效时 fillStyle 保持原值：先后以黑、白为底各设一次，两次读回不同即无效
    context.fillStyle = '#000000'
    context.fillStyle = text
    const first = context.fillStyle
    context.fillStyle = '#ffffff'
    context.fillStyle = text
    if (context.fillStyle !== first) return undefined
    context.clearRect(0, 0, 1, 1)
    context.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data
    return { r, g, b, a: a / 255 }
  }
}

// —— 渐变 ——

const GRADIENT_FUNCTION_RE = /^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/is
/** to 方位 → 角度（到角的方位按 45° 的倍数近似） */
const SIDE_ANGLES: Readonly<Record<string, number>> = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
  'top right': 45,
  'right top': 45,
  'bottom right': 135,
  'right bottom': 135,
  'bottom left': 225,
  'left bottom': 225,
  'top left': 315,
  'left top': 315
}

/** 按括号外的分隔符拆开，各段去掉首尾空白 */
function splitTopLevel(text: string, isSeparator: (char: string) => boolean): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    if (depth === 0 && isSeparator(char)) {
      parts.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current.trim())
  return parts
}

const isComma = (char: string): boolean => char === ','
const isSpace = (char: string): boolean => /\s/.test(char)

/** 角度：0 或带单位的数字（deg、grad、rad、turn）→ 0–360 的 deg */
function parseAngle(text: string): number | undefined {
  const match = ANGLE_RE.exec(text)
  if (!match) return undefined
  const value = Number(match[1])
  const unit = match[2]?.toLowerCase()
  if (unit === undefined) return value === 0 ? 0 : undefined
  return normalizeDegrees(value * (ANGLE_UNITS[unit] ?? 1))
}

/** 色标位置：百分比或 0 */
function parsePosition(token: string): number | undefined {
  if (token === '0') return 0
  const percent = PERCENT_RE.exec(token)?.[1]
  return percent === undefined ? undefined : Number(percent)
}

interface GradientConfig {
  readonly angle: number
  readonly shape: string
}

/** 第一个参数（不是色标时）：linear 的方向，radial 的形状，conic 的 from 角度与 at 位置 */
function parseConfig(type: GradientType, text: string): GradientConfig | undefined {
  const normalized = text.split(/\s+/).filter(Boolean).join(' ')
  if (type === 'radial') return { angle: 0, shape: normalized }
  if (type === 'conic') {
    const match = /^(?:from (\S+))? ?(at .+)?$/i.exec(normalized)
    if (!match || (match[1] === undefined && match[2] === undefined)) return undefined
    const angle = match[1] === undefined ? 0 : parseAngle(match[1])
    return angle === undefined ? undefined : { angle, shape: match[2] ?? '' }
  }
  const side = /^to (.+)$/i.exec(normalized)?.[1]
  const angle = side === undefined ? parseAngle(normalized) : SIDE_ANGLES[side.toLowerCase()]
  return angle === undefined ? undefined : { angle, shape: '' }
}

interface RawStop {
  readonly color: Hsva
  readonly position?: number
}

interface ParsedStops {
  readonly stops: readonly RawStop[]
  readonly format: ColorFormat
}

/** 一个色标参数：颜色与 0–2 个位置（两个位置拆成同色的两个色标）；颜色提示（只有位置）不认 */
function parseStop(text: string, resolve?: ColorResolver): ParsedStops | undefined {
  const [colorText = '', ...positionTexts] = splitTopLevel(text, isSpace).filter(Boolean)
  if (positionTexts.length > 2) return undefined
  const parsed = parseColor(colorText, resolve)
  const positions = positionTexts.map(parsePosition)
  if (!parsed || positions.some(position => position === undefined)) return undefined
  const stops = positions.length === 0 ? [{ color: parsed.color }] : positions.map(position => ({ color: parsed.color, position }))
  return { stops, format: parsed.format }
}

/** 补全色标位置（同 CSS）：首尾缺省为 0%、100%，中间缺省的在前后已知位置间均分；不小于前面的位置，限于 0–100 */
function resolvePositions(stops: readonly RawStop[]): GradientStop[] {
  const last = stops.length - 1
  let max = 0
  const known = stops.map((stop, index) => {
    const position = stop.position ?? (index === 0 ? 0 : index === last ? 100 : undefined)
    if (position === undefined) return undefined
    max = Math.max(max, clamp(position, 0, 100))
    return max
  })
  const between = (index: number): number => {
    let start = index - 1
    while (start > 0 && known[start] === undefined) start -= 1
    let end = index + 1
    while (end < last && known[end] === undefined) end += 1
    const from = known[start] ?? 0
    const to = known[end] ?? 100
    return from + ((to - from) * (index - start)) / (end - start)
  }
  return stops.map((stop, index) => ({ color: stop.color, position: known[index] ?? between(index) }))
}

/** 渐变 → 类型、角度、形状与色标；写法无法拆解（长度位置、颜色提示、var() 等）时为 undefined */
export function parseGradient(text: string, resolve?: ColorResolver): ParsedGradient | undefined {
  const match = GRADIENT_FUNCTION_RE.exec(text.trim())
  if (!match) return undefined
  const type = (match[2] ?? 'linear').toLowerCase() as GradientType
  const [first = '', ...rest] = splitTopLevel(match[3] ?? '', isComma)
  const firstStop = parseStop(first, resolve)
  const config = firstStop ? { angle: type === 'linear' ? DEFAULT_LINEAR_ANGLE : 0, shape: '' } : parseConfig(type, first)
  if (!config) return undefined
  const parsedStops = (firstStop ? [first, ...rest] : rest).map(arg => parseStop(arg, resolve))
  const stops = parsedStops.flatMap(parsed => parsed?.stops ?? [])
  const format = parsedStops[0]?.format
  if (format === undefined || parsedStops.some(parsed => parsed === undefined) || stops.length < 2) return undefined
  return {
    gradient: { type, repeating: match[1] !== undefined, angle: config.angle, shape: config.shape, stops: resolvePositions(stops) },
    format
  }
}

function gradientConfig({ type, angle, shape }: Gradient): string {
  const degrees = `${round(angle) % 360}deg`
  if (type === 'linear') return degrees
  if (type === 'conic') return shape ? `from ${degrees} ${shape}` : `from ${degrees}`
  return shape
}

/** 按位置排好的色标 */
export function sortStops<T extends GradientStop>(stops: readonly T[]): T[] {
  return [...stops].sort((left, right) => left.position - right.position)
}

/** 写出渐变：色标按位置排列，颜色按 format 写，位置取整 */
export function formatGradient(gradient: Gradient, format: ColorFormat): string {
  const stops = sortStops(gradient.stops).map(stop => `${formatColor(stop.color, format)} ${round(stop.position)}%`)
  const config = gradientConfig(gradient)
  const name = `${gradient.repeating ? 'repeating-' : ''}${gradient.type}-gradient`
  return `${name}(${(config ? [config, ...stops] : stops).join(', ')})`
}

/** 渐变在 position（%）处的颜色：相邻色标间按 RGB 与透明度线性插值 */
export function colorAt(stops: readonly GradientStop[], position: number): Hsva {
  const sorted = sortStops(stops)
  const fallback: Hsva = { h: 0, s: 0, v: 0, a: 1 }
  const index = sorted.findIndex(stop => stop.position >= position)
  if (index === -1) return sorted.at(-1)?.color ?? fallback
  const right = sorted[index]
  const left = sorted[index - 1]
  if (!right) return fallback
  if (!left || right.position === left.position) return right.color
  const t = (position - left.position) / (right.position - left.position)
  const from = hsvToRgb(left.color)
  const to = hsvToRgb(right.color)
  const mix = (start: number, end: number): number => start + (end - start) * t
  return rgbToHsv(
    { r: mix(from.r, to.r), g: mix(from.g, to.g), b: mix(from.b, to.b), a: mix(from.a, to.a) },
    mix(left.color.h, right.color.h)
  )
}

/** 由纯色生成默认渐变：自左向右，从该色到色相转 60° 的颜色（太灰时提高饱和度） */
export function defaultGradient(color: Hsva): Gradient {
  const end: Hsva = { ...color, h: normalizeDegrees(color.h + 60), s: Math.max(color.s, 0.6), v: Math.max(color.v, 0.5) }
  return {
    type: 'linear',
    repeating: false,
    angle: 90,
    shape: '',
    stops: [
      { color, position: 0 },
      { color: end, position: 100 }
    ]
  }
}
