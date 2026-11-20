import { enableAutoUnmount, mount } from '@vue/test-utils'
import { importSfc, required } from './sfc'

const UiHelpTip = await importSfc(() => import('../../../src/components/ui/UiHelpTip.vue'))

enableAutoUnmount(afterEach)

/** 说明文字（Teleport 到 body 下）；未显示时为 null */
function bubble(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-test="help-tip-text"]')
}

describe.skipIf(!UiHelpTip)('UiHelpTip', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  function render() {
    return mount(required(UiHelpTip), { props: { label: '中文版自述说明', text: '显示存储库自带的中文版。' }, attachTo: document.body })
  }

  it('问号按钮：按名称可读，默认收起，说明不显示', () => {
    const wrapper = render()
    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('中文版自述说明')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.get('svg').attributes('aria-hidden')).toBe('true')
    expect(bubble()).toBeNull()
  })

  it('点击显示说明（在播报区域里，与按钮关联），再点收起', async () => {
    const wrapper = render()
    const button = wrapper.get('button')
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(bubble()?.textContent?.trim()).toBe('显示存储库自带的中文版。')
    const region = bubble()?.closest('[role="status"]')
    expect(region?.id).toBe(button.attributes('aria-controls'))
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(bubble()).toBeNull()
  })

  it('Esc 收起，焦点回到按钮', async () => {
    const wrapper = render()
    const button = wrapper.get('button')
    await button.trigger('click')
    document.body.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(bubble()).toBeNull()
    expect(document.activeElement).toBe(button.element)
  })

  it('点说明以外的地方收起；点说明本身不收起', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    bubble()?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(bubble()).not.toBeNull()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(bubble()).toBeNull()
  })

  it('按钮正下方居中，不超出窗口左右边缘；下方放不下时放上方', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(300)
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600)
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(240)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(54)
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 300, 14, 14))
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()
    // 居中应在 107 - 120 = -13：贴左边缘 8；按钮下方 314 + 6
    expect(bubble()?.style.left).toBe('8px')
    expect(bubble()?.style.top).toBe('320px')
    await wrapper.get('button').trigger('click')
    // 靠近窗口底部：放上方
    rect.mockReturnValue(new DOMRect(200, 570, 14, 14))
    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(bubble()?.classList.contains('is-above')).toBe(true)
    expect(bubble()?.style.top).toBe(`${570 - 6 - 54}px`)
    // 右侧不超出：300 - 8 - 240
    expect(bubble()?.style.left).toBe('52px')
  })

  it('卸载时收起并移除监听', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    const remove = vi.spyOn(document, 'removeEventListener')
    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true)
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function), true)
  })
})
