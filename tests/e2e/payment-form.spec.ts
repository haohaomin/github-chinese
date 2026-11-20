import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test as base, chromium, expect, type BrowserContext, type FrameLocator, type Worker } from '@playwright/test'
import { EXTENSION_PATH } from './fixtures'

/**
 * 付款表单：github.com 页面里的 Zuora 托管页（www.zuora.com 的跨源 iframe）。
 * 浏览器的授权询问无法自动点击：加载清单预授 www.zuora.com 的扩展副本，等同在设置页开启「汉化付款表单」后的状态
 * （授权即由后台注册付款表单脚本，见 src/shared/payment-form.ts）。两个站点的请求都由本地页面应答
 */

const ZUORA_ORIGIN = 'https://www.zuora.com/*'
const FORM_URL =
  'https://www.zuora.com/apps/PublicHostedPageLite.do?method=requestPage&host=https%3A%2F%2Fgithub.com%2Fsponsors%2Foctocat%2Fsponsorships&id=fixture&style=inline'
const CHECKOUT_URL = 'https://github.com/sponsors/octocat/sponsorships'
const OTHER_SITE_URL = 'https://shop.example.com/checkout'

/** 托管页（结构取自 www.zuora.com 的模板：文字前后带换行、制表符；校验提示由页面脚本稍后写入） */
const FORM_HTML = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<form>
  <label id="card" class="form-label required">
    Card Number *
  </label>
  <input id="input-creditCardNumber" type="text">
  <div id="error" class="error-field" aria-live="polite"></div>
  <label id="expiration">
    Expiration Date *
  </label>
  <select id="month"><option value="">
    - Select One -\t
  </option><option value="01">01</option></select>
  <a id="cvv" href="#" aria-label="The three or four digit number located either on the front or back of a credit or debit card"></a>
  <a id="submit" href="#">Save payment information</a>
</form>
<script>setTimeout(() => { document.getElementById('error').textContent = 'Invalid Card Type' }, 300)</script>
</body></html>`

/** 嵌入托管页的页面 */
const embedding = `<!doctype html><html><head><meta charset="utf-8"><title>Checkout</title></head><body>
<iframe id="z_hppm_iframe" src="${FORM_URL}" width="600" height="400"></iframe>
</body></html>`

interface ChromeScripting {
  readonly scripting: { getRegisteredContentScripts(): Promise<{ id: string; allFrames?: boolean }[]> }
}

/** 扩展副本：清单预授 www.zuora.com */
async function grantedCopy(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'gcn-payment-form-'))
  await cp(EXTENSION_PATH, dir, { recursive: true })
  const path = join(dir, 'manifest.json')
  const manifest = JSON.parse(await readFile(path, 'utf8')) as { host_permissions?: string[] }
  manifest.host_permissions = [...(manifest.host_permissions ?? []), ZUORA_ORIGIN]
  await writeFile(path, JSON.stringify(manifest))
  return dir
}

const test = base.extend<{ context: BrowserContext; worker: Worker }>({
  context: async ({ headless }, use) => {
    const dir = await grantedCopy()
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless,
      locale: 'en-US',
      args: [`--disable-extensions-except=${dir}`, `--load-extension=${dir}`, '--lang=zh-CN']
    })
    await context.route('https://github.com/**', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: embedding }))
    await context.route('https://shop.example.com/**', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: embedding }))
    await context.route('https://www.zuora.com/**', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: FORM_HTML }))
    try {
      await use(context)
    } finally {
      await context.close()
      await rm(dir, { recursive: true, force: true })
    }
  },
  worker: async ({ context }, use) => {
    await use(context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker')))
  }
})

/** 等后台注册付款表单脚本（所有框架） */
async function waitForRegistration(worker: Worker): Promise<void> {
  await expect
    .poll(() =>
      worker.evaluate(async () => {
        const { chrome } = globalThis as unknown as { chrome: ChromeScripting }
        return (await chrome.scripting.getRegisteredContentScripts()).find(script => script.id === 'gcn-payment-form')?.allFrames
      })
    )
    .toBe(true)
}

function field(form: FrameLocator, id: string) {
  return form.locator(`#${id}`)
}

test('github.com 页面里的托管页：翻译字段、下拉框首项、读屏文字、按钮与之后写入的校验提示', async ({ context, worker }) => {
  await waitForRegistration(worker)
  const page = await context.newPage()
  await page.goto(CHECKOUT_URL)
  const form = page.frameLocator('#z_hppm_iframe')
  await expect(field(form, 'card')).toHaveText('卡号 *')
  await expect(field(form, 'expiration')).toHaveText('有效期 *')
  await expect(field(form, 'month').locator('option').first()).toHaveText('- 请选择 -')
  await expect(field(form, 'cvv')).toHaveAttribute('aria-label', '信用卡或借记卡正面或背面的三位或四位数字')
  await expect(field(form, 'submit')).toHaveText('保存付款信息')
  await expect(field(form, 'error')).toHaveText('卡类型无效')
})

test('其他网站嵌入的托管页：不翻译', async ({ context, worker }) => {
  await waitForRegistration(worker)
  const page = await context.newPage()
  await page.goto(OTHER_SITE_URL)
  const form = page.frameLocator('#z_hppm_iframe')
  await expect(field(form, 'error')).toHaveText('Invalid Card Type')
  await expect(field(form, 'card')).toHaveText('Card Number *')
  await expect(field(form, 'submit')).toHaveText('Save payment information')
})
