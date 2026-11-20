import { fakeBrowser } from 'wxt/testing/fake-browser'
import type { FrameContext } from '../../../src/shared/payment-form'
import { updateSettings } from '../../../src/shared/settings'

/** 当前框架：用例决定是否是嵌在 GitHub 页面里的托管页 */
const frame = vi.hoisted(() => ({ current: undefined as FrameContext | undefined }))

vi.mock('../../../src/shared/payment-form', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../src/shared/payment-form')>()
  return { ...actual, currentFrame: (win: Window) => frame.current ?? actual.currentFrame(win) }
})

/** GitHub 赞助结账页里的托管页 */
const EMBEDDED: FrameContext = {
  location: {
    href: 'https://www.zuora.com/apps/PublicHostedPageLite.do?method=requestPage&host=https%3A%2F%2Fgithub.com%2Fsponsors%2Freedy%2Fsponsorships&id=8a12',
    ancestorOrigins: Object.assign(['https://github.com'], { length: 1 })
  },
  top: false,
  referrer: 'https://github.com/'
}

/** 托管页的表单（取自 www.zuora.com 的模板：文字前后带换行、制表符） */
const FORM = `<form>
  <label id="card">
    Card Number *
  </label>
  <select id="month"><option value="">
    - Select One -\t
  </option><option value="01">01</option></select>
  <a id="cvv" aria-label="The three or four digit number located either on the front or back of a credit or debit card" href="#"></a>
  <div id="error" class="error-field"></div>
  <a id="submit">Save payment information</a>
</form>`

interface FakeContext {
  invalid: boolean
  readonly invalidated: (() => void)[]
  readonly isInvalid: boolean
  onInvalidated(callback: () => void): () => void
  setInterval(handler: () => void, timeout: number): number
  invalidate(): void
}

function createContext(): FakeContext {
  const context: FakeContext = {
    invalid: false,
    invalidated: [],
    get isInvalid() {
      return context.invalid
    },
    onInvalidated(callback) {
      context.invalidated.push(callback)
      return () => undefined
    },
    setInterval: () => 0,
    invalidate() {
      context.invalid = true
      for (const callback of context.invalidated.splice(0)) callback()
    }
  }
  return context
}

const text = (selector: string): string => document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? ''

/** 等待存储事件、变动观察的回调 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve, 0))
}

async function start(): Promise<FakeContext> {
  const definition = (await import('../../../src/entrypoints/payment-form.content')).default
  const context = createContext()
  await definition.main(context as never)
  return context
}

let context: FakeContext | undefined

beforeEach(async () => {
  fakeBrowser.reset()
  frame.current = EMBEDDED
  document.body.innerHTML = FORM
  await updateSettings({ language: 'zh-CN' })
})

afterEach(() => {
  if (context && !context.invalid) context.invalidate()
  context = undefined
  frame.current = undefined
  document.body.innerHTML = ''
})

describe('付款表单脚本', () => {
  it('运行时注册（不写进清单），document_start；不声明匹配地址（避免成为安装时申请的主机权限）', async () => {
    const definition = (await import('../../../src/entrypoints/payment-form.content')).default
    expect(definition.registration).toBe('runtime')
    expect(definition.runAt).toBe('document_start')
    expect(definition.matches).toBeUndefined()
  })

  it('嵌在 GitHub 页面里的托管页：翻译字段、下拉框首项、读屏文字与按钮；之后写入的校验提示同样翻译', async () => {
    context = await start()
    expect(text('#card')).toBe('卡号 *')
    expect(text('#month option')).toBe('- 请选择 -')
    expect(document.querySelector('#cvv')?.getAttribute('aria-label')).toBe('信用卡或借记卡正面或背面的三位或四位数字')
    expect(text('#submit')).toBe('保存付款信息')
    document.querySelector('#error')!.textContent = 'Invalid Card Type'
    await settle()
    expect(text('#error')).toBe('卡类型无效')
  })

  it('不是嵌在 GitHub 页面里的托管页：不翻译', async () => {
    frame.current = {
      ...EMBEDDED,
      location: { ...EMBEDDED.location, ancestorOrigins: Object.assign(['https://shop.example.com'], { length: 1 }) }
    }
    context = await start()
    expect(text('#card')).toBe('Card Number *')
  })

  it('随设置启停、切换语言', async () => {
    context = await start()
    await updateSettings({ translation: false })
    await settle()
    expect(text('#card')).toBe('Card Number *')
    await updateSettings({ translation: true, language: 'zh-TW' })
    await settle()
    expect(text('#card')).toBe('卡號 *')
    expect(text('#month option')).toBe('- 選擇一項 -')
    await updateSettings({ enabled: false })
    await settle()
    expect(text('#submit')).toBe('Save payment information')
  })

  it('总开关关闭时启动：不翻译，开启后翻译', async () => {
    await updateSettings({ enabled: false })
    context = await start()
    expect(text('#card')).toBe('Card Number *')
    await updateSettings({ enabled: true })
    await settle()
    expect(text('#card')).toBe('卡号 *')
  })

  it('扩展失效：还原表单', async () => {
    context = await start()
    context.invalidate()
    expect(text('#card')).toBe('Card Number *')
    expect(text('#submit')).toBe('Save payment information')
  })
})
