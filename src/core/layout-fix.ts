/**
 * 译文的排版修正：翻译期间在页面上加一段样式，停止时移除（软导航后页面换掉 <head> 内容时补回）。
 * - 贡献图的月份标签：绝对定位，宽度受所在单元格限制；译文比原文宽（Nov → 11 月），
 *   最后一个月只占一两列时折成两行。不折行，同原文一样可略超出单元格
 */
export const LAYOUT_FIX_STYLE_ID = 'gcn-layout-fix'

const STYLE = `
.ContributionCalendar-label > span[aria-hidden="true"] {
  white-space: nowrap;
}
`

export interface LayoutFix {
  /** 翻译启动、停止时调用 */
  update(active: boolean): void
  /** 软导航后：翻译中且样式不在了时补回 */
  refresh(): void
}

export function createLayoutFix(doc: Document): LayoutFix {
  let active = false

  function sync(): void {
    const existing = doc.getElementById(LAYOUT_FIX_STYLE_ID)
    if (!active) {
      existing?.remove()
      return
    }
    if (existing) return
    const style = doc.createElement('style')
    style.id = LAYOUT_FIX_STYLE_ID
    style.textContent = STYLE
    ;(doc.head ?? doc.documentElement).append(style)
  }

  return {
    update(next) {
      active = next
      sync()
    },
    refresh: sync
  }
}
