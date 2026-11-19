/**
 * 调色盘控件的按键步长：← ↓ 减，→ ↑ 加，Shift 为十倍；PageUp、PageDown 为十倍。
 * 输入框里只认 ↑ ↓（← → 移动光标）
 */
export function arrowDelta(event: KeyboardEvent, step: number, inInput = false): number | undefined {
  const unit = event.shiftKey ? step * 10 : step
  switch (event.key) {
    case 'ArrowUp':
      return unit
    case 'ArrowDown':
      return -unit
    case 'ArrowRight':
      return inInput ? undefined : unit
    case 'ArrowLeft':
      return inInput ? undefined : -unit
    case 'PageUp':
      return inInput ? undefined : step * 10
    case 'PageDown':
      return inInput ? undefined : -step * 10
    default:
      return undefined
  }
}

/** 输入框里的数字：去掉首尾空白与结尾的单位（% °）；不是数字时为 undefined */
export function parseNumberInput(text: string): number | undefined {
  const value = Number(text.trim().replace(/[%°]$/, ''))
  return text.trim() !== '' && Number.isFinite(value) ? value : undefined
}
