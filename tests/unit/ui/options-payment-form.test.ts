import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { PAYMENT_FORM_ORIGINS } from '../../../src/shared/payment-form'
import { getSettings, updateSettings } from '../../../src/shared/settings'
import { fakePermissions } from '../shared/fake-permissions'
import { mockVersion, seedChineseUi, settle } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

/** 打开设置页（默认显示汉化设置） */
async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  return wrapper
}

function toggle(wrapper: VueWrapper): Omit<DOMWrapper<Element>, 'exists'> {
  return wrapper.get('[data-test="payment-form"] [role="switch"]')
}

function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

describe.skipIf(!App)('设置页：汉化付款表单', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    clearToasts()
    vi.restoreAllMocks()
  })

  it('在汉化开关之后；默认开启', async () => {
    const wrapper = await render()
    const switches = wrapper.findAll('.switches [role="switch"]').slice(0, 2)
    expect(switches.map(item => item.element.closest('[data-test]')?.getAttribute('data-test'))).toEqual(['translation', 'payment-form'])
    expect(wrapper.get('[data-test="payment-form"] label').text()).toBe('汉化付款表单')
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
  })

  it('旁有说明按钮：点开显示说明，不切换开关', async () => {
    const wrapper = await render()
    const help = wrapper.get('[data-test="payment-form"] [data-test="help-tip"]')
    expect(help.attributes('aria-label')).toBe('汉化付款表单说明')
    await help.trigger('click')
    await settle()
    expect(document.querySelector('[data-test="help-tip-text"]')?.textContent?.trim()).toBe('仅翻译表单文字。不读取、不发送付款信息。')
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    expect((await getSettings()).paymentForm).toBe(true)
  })

  it('关闭、开启：只保存设置，不申请、不移除权限', async () => {
    const wrapper = await render()
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    const remove = vi.spyOn(fakeBrowser.permissions, 'remove')
    await toggle(wrapper).trigger('click')
    await settle()
    expect((await getSettings()).paymentForm).toBe(false)
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    await toggle(wrapper).trigger('click')
    await settle()
    expect((await getSettings()).paymentForm).toBe(true)
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    expect(request).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
    expect(fakePermissions.withheld).toEqual([])
    expect(toastTexts(wrapper)).toEqual([])
  })

  it('设置在别处改动（同步）：随之刷新', async () => {
    const wrapper = await render()
    await updateSettings({ paymentForm: false })
    await settle()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
  })

  it('权限被撤销：显示关闭；开启时在点击中同步申请，授予后开启', async () => {
    fakePermissions.withheld.push(...PAYMENT_FORM_ORIGINS)
    const wrapper = await render()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    void toggle(wrapper).trigger('click')
    expect(request).toHaveBeenCalledExactlyOnceWith({ origins: [...PAYMENT_FORM_ORIGINS] })
    await settle()
    expect(fakePermissions.withheld).toEqual([])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    expect((await getSettings()).paymentForm).toBe(true)
    expect(toastTexts(wrapper)).toEqual([])
  })

  it('权限被撤销且设置关闭：开启时申请权限并保存设置', async () => {
    fakePermissions.withheld.push(...PAYMENT_FORM_ORIGINS)
    await updateSettings({ paymentForm: false })
    const wrapper = await render()
    await toggle(wrapper).trigger('click')
    await settle()
    expect(fakePermissions.withheld).toEqual([])
    expect((await getSettings()).paymentForm).toBe(true)
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
  })

  it('拒绝授权、申请出错：提示授权失败，保持关闭，不改设置', async () => {
    fakePermissions.withheld.push(...PAYMENT_FORM_ORIGINS)
    await updateSettings({ paymentForm: false })
    fakePermissions.answer = false
    const wrapper = await render()
    await toggle(wrapper).trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    expect((await getSettings()).paymentForm).toBe(false)

    clearToasts()
    vi.spyOn(fakeBrowser.permissions, 'request').mockRejectedValue(new Error('需要用户手势'))
    await toggle(wrapper).trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    expect((await getSettings()).paymentForm).toBe(false)
  })

  it('在别处撤销、授权（浏览器的扩展管理）：随之刷新', async () => {
    const wrapper = await render()
    await fakePermissions.revoke(PAYMENT_FORM_ORIGINS)
    await settle()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    await fakePermissions.grant(PAYMENT_FORM_ORIGINS)
    await settle()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
  })
})
