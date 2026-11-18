import type { CssSupports } from '../../../src/shared/freshness'

/**
 * 模拟浏览器的 CSS.supports：happy-dom 的 CSS.supports 对任何值都返回 true，测不出浏览器不认的颜色。
 * 只认下面列出的颜色与渐变；light-dark() 只收两个值，同为颜色或同为渐变
 */
export const GRADIENT = 'linear-gradient(90deg, #cf222e, #0969da)'
/** 两层渐变：本身合法，放进 light-dark() 会多出参数 */
export const LAYERED_GRADIENT = `${GRADIENT}, linear-gradient(#000, #000)`

const COLORS = new Set(['red', 'rgba(9, 105, 218, 0.5)'])
const GRADIENTS = new Set([GRADIENT, 'linear-gradient(#000, #000)', LAYERED_GRADIENT])
const SINGLE_GRADIENTS = [GRADIENT, 'linear-gradient(#000, #000)']

/** 支持在 light-dark() 里用图像的浏览器（如 Chrome 158） */
export const imageLightDark: CssSupports = (property, value) => {
  if (property === 'color') return COLORS.has(value)
  const pair = /^light-dark\((.*)\)$/.exec(value)?.[1]
  if (pair === undefined) return GRADIENTS.has(value)
  return SINGLE_GRADIENTS.some(light => SINGLE_GRADIENTS.some(dark => pair === `${light}, ${dark}`))
}

/** 不支持在 light-dark() 里用图像的浏览器 */
export const noImageLightDark: CssSupports = (property, value) => !value.startsWith('light-dark(') && imageLightDark(property, value)
