import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { PAYMENT_FORM_ORIGINS } from '../../../src/shared/payment-form'
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

  it('在汉化开关之后；未授权时关闭', async () => {
    const wrapper = await render()
    const switches = wrapper.findAll('.switches [role="switch"]').slice(0, 2)
    expect(switches.map(item => item.element.closest('[data-test]')?.getAttribute('data-test'))).toEqual(['translation', 'payment-form'])
    expect(wrapper.get('[data-test="payment-form"] label').text()).toBe('汉化付款表单')
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
  })

  it('已授权时开启', async () => {
    fakePermissions.granted.push(...PAYMENT_FORM_ORIGINS)
    const wrapper = await render()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
  })

  it('开启：在点击中同步申请托管页的权限，授予后开启；关闭：移除权限', async () => {
    const wrapper = await render()
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    void toggle(wrapper).trigger('click')
    expect(request).toHaveBeenCalledExactlyOnceWith({ origins: [...PAYMENT_FORM_ORIGINS] })
    await settle()
    expect(fakePermissions.granted).toEqual([...PAYMENT_FORM_ORIGINS])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    expect(toastTexts(wrapper)).toEqual([])

    const remove = vi.spyOn(fakeBrowser.permissions, 'remove')
    await toggle(wrapper).trigger('click')
    await settle()
    expect(remove).toHaveBeenCalledExactlyOnceWith({ origins: [...PAYMENT_FORM_ORIGINS] })
    expect(fakePermissions.granted).toEqual([])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
  })

  it('拒绝授权、申请出错：提示授权失败，保持关闭', async () => {
    fakePermissions.answer = false
    const wrapper = await render()
    await toggle(wrapper).trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')

    clearToasts()
    vi.spyOn(fakeBrowser.permissions, 'request').mockRejectedValue(new Error('需要用户手势'))
    await toggle(wrapper).trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
  })

  it('在别处授权、撤销（浏览器的扩展管理）：随之刷新', async () => {
    const wrapper = await render()
    await fakePermissions.grant(PAYMENT_FORM_ORIGINS)
    await settle()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    await fakePermissions.revoke(PAYMENT_FORM_ORIGINS)
    await settle()
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
  })
})
