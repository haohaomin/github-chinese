import {
  defaultGradient,
  parseColor,
  parseGradient,
  sortStops,
  type ColorFormat,
  type ColorResolver,
  type Gradient,
  type GradientStop,
  type Hsva
} from '../../shared/color'
import { isGradient, normalizeHexColor } from '../../shared/freshness'

/** 调色盘的填充方式 */
export type PaletteMode = 'solid' | 'gradient'

/** 编辑中的色标：id 区分各色标（位置可交错，顺序会变） */
export interface EditorStop extends GradientStop {
  readonly id: number
}

export interface EditorGradient extends Omit<Gradient, 'stops'> {
  readonly stops: readonly EditorStop[]
}

/** 打开调色盘时的状态 */
export interface PaletteState {
  readonly mode: PaletteMode
  readonly format: ColorFormat
  readonly solid: Hsva
  readonly gradient: Gradient
  /** 纯色、渐变是否来自原值（否则切换时由另一种生成） */
  readonly solidFromValue: boolean
  readonly gradientFromValue: boolean
}

const BLACK: Hsva = { h: 0, s: 0, v: 0, a: 1 }

/**
 * 按当前写法打开调色盘：渐变、纯色各按原写法拆解；为空、无效（isValid 不认）或拆解不了时用 fallback 纯色（hex）。
 * 另一种填充方式由这一种生成：纯色 → 默认渐变，渐变 → 第一个色标的颜色
 */
export function initialPalette(text: string, fallback: string, resolve: ColorResolver, isValid: (text: string) => boolean): PaletteState {
  const value = normalizeHexColor(text) ?? text.trim()
  if (value !== '' && isValid(value)) {
    const gradient = isGradient(value) ? parseGradient(value, resolve) : undefined
    const first = gradient && sortStops(gradient.gradient.stops)[0]
    if (gradient && first) {
      return {
        mode: 'gradient',
        format: gradient.format,
        solid: first.color,
        gradient: gradient.gradient,
        solidFromValue: false,
        gradientFromValue: true
      }
    }
    const solid = gradient ? undefined : parseColor(value, resolve)
    if (solid) {
      return {
        mode: 'solid',
        format: solid.format,
        solid: solid.color,
        gradient: defaultGradient(solid.color),
        solidFromValue: true,
        gradientFromValue: false
      }
    }
  }
  const color = parseColor(fallback, resolve)?.color ?? BLACK
  return { mode: 'solid', format: 'hex', solid: color, gradient: defaultGradient(color), solidFromValue: false, gradientFromValue: false }
}

/** 新色标的位置：相邻色标间最大空隙的中点（取整） */
export function newStopPosition(stops: readonly GradientStop[]): number {
  const sorted = sortStops(stops)
  let best = { gap: -1, position: 50 }
  for (let index = 1; index < sorted.length; index += 1) {
    const left = sorted[index - 1]?.position ?? 0
    const right = sorted[index]?.position ?? 100
    if (right - left > best.gap) best = { gap: right - left, position: Math.round((left + right) / 2) }
  }
  return best.position
}
