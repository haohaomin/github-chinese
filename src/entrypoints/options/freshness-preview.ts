import { isGradient, isValidColor, normalizeHexColor } from '../../shared/freshness'

/** 预览用的颜色：写法可用时为它（hex 统一写法），否则为默认色 */
export function shownColor(value: string, fallback: string): string {
  const text = value.trim()
  if (text === '') return fallback
  const hex = normalizeHexColor(text)
  if (hex !== undefined) return hex
  return isValidColor(text) ? text : fallback
}

/**
 * 时段名称的样式（即预览），同页面上的写法（见 core/freshness）：文字颜色用 color，渐变用背景裁到文字；
 * 有背景色时另起一层背景（各层分别裁切），加内边距与圆角
 */
export function previewStyle(text: string, background?: string): Record<string, string> {
  const fill = background === undefined ? undefined : isGradient(background) ? background : `linear-gradient(${background}, ${background})`
  const style: Record<string, string> = {}
  if (isGradient(text)) {
    const clip = fill ? 'text, padding-box' : 'text'
    style.backgroundImage = fill ? `${text}, ${fill}` : text
    style.WebkitBackgroundClip = clip
    style.backgroundClip = clip
    style.WebkitTextFillColor = 'transparent'
  } else {
    style.color = text
    if (fill) style.backgroundImage = fill
  }
  if (fill) {
    style.padding = '0 4px'
    style.borderRadius = '6px'
  }
  return style
}
