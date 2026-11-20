import { fakeBrowser } from 'wxt/testing/fake-browser'
import {
  currentFrame,
  isPaymentFormFrame,
  isPaymentFormGranted,
  PAYMENT_FORM_MATCHES,
  PAYMENT_FORM_ORIGINS,
  PAYMENT_FORM_SCRIPT_ID,
  syncPaymentFormScript,
  type FrameContext
} from '../../../src/shared/payment-form'
import { fakePermissions } from './fake-permissions'
import { fakeContentScripts, type FakeContentScripts } from './fake-scripting'

/** GitHub 赞助结账页嵌入的托管页地址（host 参数是嵌入页的地址） */
const FORM_URL =
  'https://www.zuora.com/apps/PublicHostedPageLite.do?method=requestPage&host=https%3A%2F%2Fgithub.com%2Fsponsors%2Freedy%2Fsponsorships&fromHostedPage=true&id=8a12&tenantId=6362&style=inline'

function frame(overrides: Partial<FrameContext> & { href?: string; ancestors?: readonly string[] } = {}): FrameContext {
  const { href = FORM_URL, ancestors, ...rest } = overrides
  return {
    location: ancestors ? { href, ancestorOrigins: Object.assign([...ancestors], { length: ancestors.length }) } : { href },
    top: false,
    referrer: 'https://github.com/',
    ...rest
  }
}

describe('isPaymentFormFrame', () => {
  it('嵌在 github.com 页面里的托管页：Chromium 按 ancestorOrigins', () => {
    expect(isPaymentFormFrame(frame({ ancestors: ['https://github.com', 'https://github.com'] }))).toBe(true)
  })

  it('父框架不是 github.com（ancestorOrigins 为准，不看 host 参数与来源页）：不翻译', () => {
    expect(isPaymentFormFrame(frame({ ancestors: ['https://shop.example.com'] }))).toBe(false)
  })

  it('没有 ancestorOrigins（Firefox）：按 host 参数，没有时按来源页', () => {
    expect(isPaymentFormFrame(frame())).toBe(true)
    expect(isPaymentFormFrame(frame({ href: FORM_URL.replace(/host=[^&]*&/, ''), referrer: 'https://github.com/' }))).toBe(true)
    expect(isPaymentFormFrame(frame({ href: FORM_URL.replace(/host=[^&]*&/, ''), referrer: '' }))).toBe(false)
    expect(isPaymentFormFrame(frame({ href: FORM_URL.replace(/host=[^&]*&/, 'host=https%3A%2F%2Fshop.example.com%2F&') }))).toBe(false)
  })

  it('顶层打开的托管页、其他地址：不翻译', () => {
    expect(isPaymentFormFrame(frame({ top: true }))).toBe(false)
    expect(isPaymentFormFrame(frame({ href: 'https://github.com/sponsors/reedy/sponsorships' }))).toBe(false)
    expect(isPaymentFormFrame(frame({ href: 'https://www.zuora.com/apps/Other.do' }))).toBe(false)
    expect(isPaymentFormFrame(frame({ href: FORM_URL.replace('https:', 'http:') }))).toBe(false)
    expect(isPaymentFormFrame(frame({ href: 'not a url' }))).toBe(false)
  })

  it('currentFrame：测试环境的顶层窗口', () => {
    expect(currentFrame(window).top).toBe(true)
    expect(isPaymentFormFrame(currentFrame(window))).toBe(false)
  })
})

describe('付款表单脚本的注册', () => {
  let scripts: FakeContentScripts

  const registration = {
    id: PAYMENT_FORM_SCRIPT_ID,
    matches: PAYMENT_FORM_MATCHES,
    js: ['content-scripts/payment-form.js'],
    runAt: 'document_start',
    persistAcrossSessions: true,
    allFrames: true
  }

  beforeEach(() => {
    fakeBrowser.reset()
    scripts = fakeContentScripts()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('生效：注册到所有框架，document_start，跨会话保留；再次同步不改动', async () => {
    await syncPaymentFormScript(true)
    await syncPaymentFormScript(true)
    expect(scripts.registered).toEqual([registration])
    expect(fakeBrowser.scripting.registerContentScripts).toHaveBeenCalledTimes(1)
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
  })

  it('已注册的不是所有框架：更新', async () => {
    scripts.registered.push({ ...registration, allFrames: false })
    await syncPaymentFormScript(true)
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(1)
    expect(scripts.registered).toEqual([registration])
  })

  it('不生效：注销；未注册时不报错', async () => {
    await syncPaymentFormScript(false)
    expect(fakeBrowser.scripting.unregisterContentScripts).not.toHaveBeenCalled()
    await syncPaymentFormScript(true)
    await syncPaymentFormScript(false)
    expect(scripts.registered).toEqual([])
  })

  it('有无权限：按托管页的主机权限（随清单授予，可被撤销）；读取失败时按没有', async () => {
    expect(await isPaymentFormGranted()).toBe(true)
    await fakePermissions.revoke(PAYMENT_FORM_ORIGINS)
    expect(await isPaymentFormGranted()).toBe(false)
    await fakePermissions.grant(PAYMENT_FORM_ORIGINS)
    expect(await isPaymentFormGranted()).toBe(true)
    vi.spyOn(fakeBrowser.permissions, 'contains').mockRejectedValue(new Error('不支持'))
    expect(await isPaymentFormGranted()).toBe(false)
  })

  it('托管页的主机权限与清单（wxt.config.ts）一致', async () => {
    expect(PAYMENT_FORM_ORIGINS).toEqual(['https://www.zuora.com/*'])
    const config = await import('../../../wxt.config')
    expect(config.PAYMENT_FORM_ORIGINS).toEqual(PAYMENT_FORM_ORIGINS)
  })
})
