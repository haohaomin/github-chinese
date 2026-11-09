import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { BACKUP_FORMAT, BACKUP_VERSION } from '../../../src/shared/backup'
import { FEEDBACK_URL } from '../../../src/shared/extension'
import { githubTokenItem, NEW_TOKEN_URL } from '../../../src/shared/github-api'
import { getSettings, settingsItem } from '../../../src/shared/settings'
import { mockVersion, openOptionsTab, optionsPanel, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

/** 增强设置里的子标签 */
const TAB = '下载次数'
const RATE_LIMIT = 'https://api.github.com/rate_limit'
/** 占位令牌（运行时拼出，不是真实令牌） */
const TOKEN = `github_pat_${'x'.repeat(82)}`
const OTHER_TOKEN = `ghp_${'y'.repeat(36)}`

interface Download {
  readonly name: string
  readonly blob: Blob
}

async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  return wrapper
}

function panel(wrapper: VueWrapper): DOMWrapper<Element> {
  return optionsPanel(wrapper, TAB)
}

/** 切到标签（默认下载次数：先切到增强设置） */
async function openTab(wrapper: VueWrapper, label = TAB): Promise<void> {
  await openOptionsTab(wrapper, label)
}

function tokenInput(wrapper: VueWrapper): DOMWrapper<HTMLInputElement> {
  return panel(wrapper).get<HTMLInputElement>(
    '[data-test="github-token"] input, input[data-test="github-token"]'
  ) as DOMWrapper<HTMLInputElement>
}

/** 标签页里的导入、导出 */
function tools(wrapper: VueWrapper): DOMWrapper<Element> {
  return panel(wrapper).get('.transfer-tools') as DOMWrapper<Element>
}

function status(wrapper: VueWrapper): string {
  return panel(wrapper).get('[data-test="token-status"]').text()
}

function button(scope: DOMWrapper<Element>, text: string): DOMWrapper<HTMLButtonElement> {
  const found = scope.findAll('button').find(item => item.text() === text)
  if (!found) throw new Error(`未找到按钮：${text}`)
  return found as DOMWrapper<HTMLButtonElement>
}

function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

/** 输入令牌，不提交 */
async function typeToken(wrapper: VueWrapper, value: string): Promise<void> {
  tokenInput(wrapper).element.value = value
  await tokenInput(wrapper).trigger('input')
}

/** 输入令牌并提交（失去焦点、按 Enter 时触发 change） */
async function enterToken(wrapper: VueWrapper, value: string): Promise<void> {
  await typeToken(wrapper, value)
  await tokenInput(wrapper).trigger('change')
  await settle()
}

/** 限额查询的应答；其他请求失败（单元测试不联网） */
function mockRateLimit(respond: (init: RequestInit | undefined) => Response | Promise<Response>): ReturnType<typeof vi.fn> {
  const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url) === RATE_LIMIT) return respond(init)
    throw new TypeError('单元测试不联网')
  })
  vi.spyOn(globalThis, 'fetch').mockImplementation(fetch as typeof globalThis.fetch)
  return fetch
}

function rate(limit: number, remaining: number): Response {
  return new Response(JSON.stringify({ resources: { core: { limit, remaining, reset: 1_800_003_600, used: limit - remaining } } }), {
    headers: { 'content-type': 'application/json' }
  })
}

function rateCalls(fetch: ReturnType<typeof vi.fn>): unknown[][] {
  return fetch.mock.calls.filter(([url]) => String(url) === RATE_LIMIT)
}

function file(content: Record<string, unknown>): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: '2026-11-07T00:00:00.000Z', ...content })
}

async function chooseBackup(scope: DOMWrapper<Element>, content: string): Promise<void> {
  const input = scope.get('[data-test="backup-file"]')
  Object.defineProperty(input.element, 'files', {
    value: [new File([content], 'backup.json', { type: 'application/json' })],
    configurable: true
  })
  await input.trigger('change')
  await settle()
}

function captureDownloads(): Download[] {
  const downloads: Download[] = []
  let blob: Blob | undefined
  vi.spyOn(URL, 'createObjectURL').mockImplementation(value => {
    blob = value as Blob
    return 'blob:backup'
  })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    if (blob) downloads.push({ name: this.download, blob })
  })
  return downloads
}

async function readDownload(download: Download | undefined): Promise<Record<string, unknown>> {
  if (!download) throw new Error('没有下载')
  return JSON.parse(await download.blob.text()) as Record<string, unknown>
}

describe.skipIf(!App)('设置页：下载次数', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    clearToasts()
    vi.restoreAllMocks()
  })

  it('顶部：导入备份、导出备份之后是反馈问题（新窗口打开议题模板选择页）', async () => {
    const wrapper = await render()
    const actions = wrapper.get('.options-header .options-actions')
    const feedback = actions.get('[data-test="feedback"]')
    expect(feedback.text()).toBe('反馈问题')
    expect(feedback.attributes('href')).toBe(FEEDBACK_URL)
    expect(FEEDBACK_URL).toBe('https://github.com/setube/github-chinese/issues/new/choose')
    expect(feedback.attributes('target')).toBe('_blank')
    expect(feedback.attributes('rel')).toBe('noopener noreferrer')
    expect(feedback.element.previousElementSibling?.classList.contains('transfer-tools')).toBe(true)
  })

  it('最上方为导入、导出；下面是开关、说明、令牌（密码框）、创建令牌的步骤、隐私说明', async () => {
    const wrapper = await render()
    const content = panel(wrapper).get('.section').element
    expect(content.firstElementChild?.classList.contains('transfer-tools')).toBe(true)
    expect(
      panel(wrapper)
        .get('.transfer-tools')
        .findAll('button')
        .map(item => item.text())
    ).toEqual(['导入', '导出'])
    expect(
      panel(wrapper)
        .findAll('h2')
        .map(item => item.text())
    ).toEqual(['说明', '个人访问令牌', '创建令牌', '隐私'])
    expect(panel(wrapper).get('[data-test="download-count"]').text()).toBe('下载次数')
    expect(
      panel(wrapper)
        .get('[data-test="download-about"]')
        .findAll('li')
        .map(item => item.text())
    ).toEqual([
      '来源：GitHub 统计的附件下载次数，由扩展后台经 api.github.com 获取',
      '更新：打开、刷新发行版页面时获取；同一发行版 10 分钟内不重复请求',
      '额度：未填令牌时每个 IP 每小时 60 次，同一网络共用；用尽后到重置时间前不显示',
      '令牌：额度提高到每个帐户每小时 5,000 次'
    ])
    const input = tokenInput(wrapper)
    expect(input.attributes('type')).toBe('password')
    expect(input.attributes('autocomplete')).toBe('off')
    expect(input.attributes('aria-describedby')).toBe('github-token-status')
    expect(button(panel(wrapper), '清除').element.disabled).toBe(true)
    const guide = panel(wrapper).get('[data-test="token-guide"]')
    expect(guide.findAll('li').map(item => item.text())).toEqual([
      '新建精细个人访问令牌',
      '令牌名称：任填',
      '过期时间：按需',
      '存储库访问权限：公共存储库',
      '权限：不添加',
      '生成令牌，复制后粘贴到上方'
    ])
    const link = guide.get('[data-test="new-token"]')
    expect(link.attributes('href')).toBe(NEW_TOKEN_URL)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(
      panel(wrapper)
        .get('[data-test="privacy"]')
        .findAll('li')
        .map(item => item.text())
    ).toEqual(['不收集任何用户信息', '所有数据与令牌只保存在浏览器中', '令牌不同步，只发送给 api.github.com'])
  })

  it('开关即时保存', async () => {
    const wrapper = await render()
    await openTab(wrapper)
    const toggle = panel(wrapper).get('[data-test="download-count"] [role="switch"]')
    expect(toggle.attributes('aria-checked')).toBe('false')
    await toggle.trigger('click')
    await settle()
    expect((await getSettings()).downloadCount).toBe(true)
    expect(toggle.attributes('aria-checked')).toBe('true')
  })

  it('下载次数显示时才查询限额（每次显示都查：切到其他标签页、其他子标签再回来也查）；没有令牌时不带 Authorization', async () => {
    const fetch = mockRateLimit(() => rate(60, 57))
    const wrapper = await render()
    expect(rateCalls(fetch)).toHaveLength(0)
    expect(status(wrapper)).toBe('')
    await openTab(wrapper, '增强设置')
    expect(rateCalls(fetch)).toHaveLength(0)
    await openTab(wrapper)
    expect(status(wrapper)).toBe('剩余额度 57 / 60')
    const [, init] = rateCalls(fetch)[0] as [string, RequestInit]
    expect(init).toMatchObject({ credentials: 'omit', headers: { Accept: 'application/vnd.github+json' } })
    await openTab(wrapper, '汉化设置')
    await openTab(wrapper)
    expect(rateCalls(fetch)).toHaveLength(2)
    await openTab(wrapper, '自动加载')
    expect(rateCalls(fetch)).toHaveLength(2)
    await openTab(wrapper)
    expect(rateCalls(fetch)).toHaveLength(3)
  })

  it('填写令牌：失去焦点时保存到 storage.local（去掉首尾空白），按新令牌查询限额', async () => {
    const fetch = mockRateLimit(init => rate((init?.headers as Record<string, string>).Authorization ? 5000 : 60, 4999))
    const wrapper = await render()
    await openTab(wrapper)
    await enterToken(wrapper, `  ${TOKEN}\n`)
    expect(await githubTokenItem.getValue()).toBe(TOKEN)
    expect(await fakeBrowser.storage.sync.get('githubToken')).toEqual({})
    expect(tokenInput(wrapper).element.value).toBe(TOKEN)
    expect(status(wrapper)).toBe('剩余额度 4,999 / 5,000')
    const [, init] = rateCalls(fetch).at(-1) as [string, RequestInit]
    expect(init.headers).toEqual({ Accept: 'application/vnd.github+json', Authorization: `Bearer ${TOKEN}` })
    expect(button(panel(wrapper), '清除').element.disabled).toBe(false)
  })

  it('格式不符：提示格式错误，不保存；改动输入后提示消失', async () => {
    await githubTokenItem.setValue(TOKEN)
    mockRateLimit(() => rate(5000, 5000))
    const wrapper = await render()
    await openTab(wrapper)
    await enterToken(wrapper, 'not a token')
    expect(status(wrapper)).toBe('格式错误')
    expect(tokenInput(wrapper).attributes('aria-invalid')).toBe('true')
    expect(await githubTokenItem.getValue()).toBe(TOKEN)
    await typeToken(wrapper, OTHER_TOKEN.slice(0, 10))
    expect(status(wrapper)).toBe('剩余额度 5,000 / 5,000')
    expect(tokenInput(wrapper).attributes('aria-invalid')).toBeUndefined()
  })

  it('清空输入框或点清除：删除令牌', async () => {
    await githubTokenItem.setValue(TOKEN)
    const wrapper = await render()
    expect(tokenInput(wrapper).element.value).toBe(TOKEN)
    await enterToken(wrapper, '')
    expect(await githubTokenItem.getValue()).toBe('')
    await githubTokenItem.setValue(OTHER_TOKEN)
    await settle()
    expect(tokenInput(wrapper).element.value).toBe(OTHER_TOKEN)
    await button(panel(wrapper), '清除').trigger('click')
    await settle()
    expect(await githubTokenItem.getValue()).toBe('')
    expect(tokenInput(wrapper).element.value).toBe('')
    expect(button(panel(wrapper), '清除').element.disabled).toBe(true)
  })

  it('令牌无效（401）：提示令牌无效；查询失败：加载失败', async () => {
    await githubTokenItem.setValue(TOKEN)
    mockRateLimit(() => new Response('{"message":"Bad credentials"}', { status: 401 }))
    const wrapper = await render()
    await openTab(wrapper)
    expect(status(wrapper)).toBe('令牌无效')
    expect(panel(wrapper).get('[data-test="token-status"]').classes()).toContain('token-status-danger')
    mockRateLimit(() => new Response('', { status: 500 }))
    await openTab(wrapper, '汉化设置')
    await openTab(wrapper)
    expect(status(wrapper)).toBe('加载失败')
  })

  it('保存失败：提示保存失败，令牌不变', async () => {
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValueOnce(new Error('quota'))
    await enterToken(wrapper, TOKEN)
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
    expect(await githubTokenItem.getValue()).toBe('')
  })

  it('导出含开关与令牌；导入时开关、令牌按文件，不导入其他部分', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, downloadCount: true, accelerate: true })
    await githubTokenItem.setValue(TOKEN)
    const downloads = captureDownloads()
    const wrapper = await render()
    await openTab(wrapper)
    await button(tools(wrapper), '导出').trigger('click')
    await settle()
    expect(downloads[0]!.name).toMatch(/^github-chinese-downloads-\d{4}-\d{2}-\d{2}\.json$/)
    const content = await readDownload(downloads[0])
    expect(content.settings).toEqual({ downloadCount: true })
    expect(content.githubToken).toBe(TOKEN)
    await chooseBackup(
      tools(wrapper),
      file({ settings: { downloadCount: false, accelerate: false }, githubToken: ` ${OTHER_TOKEN} `, customEntries: { Code: '代码' } })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    expect(await getSettings()).toEqual({ ...ZH_SETTINGS, downloadCount: false, accelerate: true })
    expect(await githubTokenItem.getValue()).toBe(OTHER_TOKEN)
    expect(tokenInput(wrapper).element.value).toBe(OTHER_TOKEN)
  })

  it('顶部的导出不含令牌；导入备份时忽略文件中的令牌', async () => {
    await githubTokenItem.setValue(TOKEN)
    const downloads = captureDownloads()
    const wrapper = await render()
    await button(wrapper.get('.options-header') as DOMWrapper<Element>, '导出备份').trigger('click')
    await settle()
    const content = await readDownload(downloads[0])
    expect(content).not.toHaveProperty('githubToken')
    expect((content.settings as Record<string, unknown>).downloadCount).toBe(false)
    await chooseBackup(
      wrapper.get('.options-header') as DOMWrapper<Element>,
      file({ settings: { downloadCount: true }, githubToken: OTHER_TOKEN })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    expect((await getSettings()).downloadCount).toBe(true)
    expect(await githubTokenItem.getValue()).toBe(TOKEN)
  })

  it('文件中只有格式不符的令牌：格式错误', async () => {
    const wrapper = await render()
    await chooseBackup(tools(wrapper), file({ githubToken: 'not a token' }))
    expect(toastTexts(wrapper)).toEqual(['格式错误'])
  })
})
