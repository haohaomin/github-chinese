import { afterEach, describe, expect, it } from 'vitest'
import { createLayoutFix, LAYOUT_FIX_STYLE_ID } from '../../../src/core/layout-fix'

/** 贡献图的表头：最后一个月只占两列 */
const CALENDAR = `
<table class="ContributionCalendar-grid">
  <thead><tr>
    <td class="ContributionCalendar-label" colspan="4" style="position: relative">
      <span class="sr-only">October</span><span id="october" aria-hidden="true" style="position: absolute; top: 0">10 月</span>
    </td>
    <td class="ContributionCalendar-label" colspan="2" style="position: relative">
      <span id="hidden" class="sr-only">November</span><span id="november" aria-hidden="true" style="position: absolute; top: 0">11 月</span>
    </td>
  </tr></thead>
</table>`

function styles(): HTMLStyleElement[] {
  return [...document.querySelectorAll<HTMLStyleElement>(`style#${LAYOUT_FIX_STYLE_ID}`)]
}

function whiteSpace(id: string): string {
  return getComputedStyle(document.getElementById(id)!).whiteSpace
}

afterEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('排版修正', () => {
  it('翻译中：贡献图的月份标签不折行，读屏文字不受影响；停止后移除', () => {
    document.body.innerHTML = CALENDAR
    const fix = createLayoutFix(document)
    fix.update(true)
    expect(styles()).toHaveLength(1)
    expect(styles()[0]!.parentElement).toBe(document.head)
    expect(whiteSpace('october')).toBe('nowrap')
    expect(whiteSpace('november')).toBe('nowrap')
    expect(whiteSpace('hidden')).not.toBe('nowrap')
    fix.update(false)
    expect(styles()).toHaveLength(0)
    expect(whiteSpace('november')).not.toBe('nowrap')
  })

  it('重复启动不重复添加', () => {
    const fix = createLayoutFix(document)
    fix.update(true)
    fix.update(true)
    fix.refresh()
    expect(styles()).toHaveLength(1)
  })

  it('软导航后样式不在了：翻译中补回，停止时不补', () => {
    const fix = createLayoutFix(document)
    fix.update(true)
    styles()[0]!.remove()
    fix.refresh()
    expect(styles()).toHaveLength(1)
    fix.update(false)
    fix.refresh()
    expect(styles()).toHaveLength(0)
  })
})
