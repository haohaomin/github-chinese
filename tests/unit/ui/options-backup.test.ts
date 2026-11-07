import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { ACCELERATE_KEYS, BACKUP_FORMAT, BACKUP_VERSION } from '../../../src/shared/backup'
import { enterpriseOrigins } from '../../../src/shared/enterprise'
import {
  customEntriesItem,
  getCustomEntries,
  getSearchBlockRules,
  getSettings,
  pendingSitesItem,
  searchBlockRulesItem,
  settingsItem
} from '../../../src/shared/settings'
import { fakePermissions } from '../shared/fake-permissions'
import { mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

const HOST = 'github.example.com'
const OTHER = 'octo-corp.ghe.com'
const DATED = /^\d{4}-\d{2}-\d{2}\.json$/

interface Download {
  readonly name: string
  readonly blob: Blob
}

async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  return wrapper
}

/** 设置页的标签（第一个标签栏） */
function pageTab(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  const found = wrapper
    .get('[role="tablist"]')
    .findAll('[role="tab"]')
    .find(item => item.text() === label)
  if (!found) throw new Error(`未找到标签：${label}`)
  return found
}

function panel(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  return wrapper.get(`#${CSS.escape(pageTab(wrapper, label).attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
}

async function openTab(wrapper: VueWrapper, label: string): Promise<void> {
  await pageTab(wrapper, label).trigger('click')
  await settle()
}

/** 页面顶部的导入备份、导出备份 */
function header(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.get('.options-header .options-actions') as DOMWrapper<Element>
}

/** 标签页里的导入、导出（汉化设置为排除路径的，加速设置为加速源的） */
function tools(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  return panel(wrapper, label).get('.transfer-tools') as DOMWrapper<Element>
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

/** 备份文件的文本 */
function file(content: Record<string, unknown>): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: '2026-11-04T00:00:00.000Z', ...content })
}

/** 选择要导入的文件 */
async function chooseBackup(scope: DOMWrapper<Element>, content: string | { text(): Promise<string> }): Promise<void> {
  const input = scope.get('[data-test="backup-file"]')
  const chosen = typeof content === 'string' ? new File([content], 'backup.json', { type: 'application/json' }) : content
  Object.defineProperty(input.element, 'files', { value: [chosen], configurable: true })
  await input.trigger('change')
  await settle()
}

/** 记录下载的文件（文件名与内容） */
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

/** 企业版设置列表中的站点 */
function sites(wrapper: VueWrapper): string[] {
  return panel(wrapper, '企业版设置')
    .findAll<HTMLInputElement>('tbody input:not([type="checkbox"])')
    .map(input => input.element.value)
}

describe.skipIf(!App)('设置页：备份与导入导出', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    clearToasts()
    vi.restoreAllMocks()
  })

  it('顶部为导入备份、导出备份；净化、下载次数、新标签页、企业版标签页最上方，排除路径、加速源标题右侧为导入、导出；只选 JSON 文件', async () => {
    const wrapper = await render()
    expect(
      header(wrapper)
        .findAll('button')
        .map(item => item.text())
    ).toEqual(['导入备份', '导出备份'])
    expect(header(wrapper).get('[data-test="backup-file"]').attributes('accept')).toBe('.json,application/json')
    for (const label of ['净化设置', '下载次数设置', '新标签页设置', '企业版设置']) {
      const content = panel(wrapper, label).get('.section').element
      expect(content.firstElementChild?.classList.contains('transfer-tools'), label).toBe(true)
    }
    expect(tools(wrapper, '汉化设置').element.closest('.section-head')?.querySelector('h2')?.textContent).toBe('排除路径')
    expect(tools(wrapper, '加速设置').element.closest('.section-head')?.querySelector('h2')?.textContent).toBe('加速源')
    for (const label of ['汉化设置', '加速设置', '净化设置', '下载次数设置', '新标签页设置', '企业版设置']) {
      expect(
        tools(wrapper, label)
          .findAll('button')
          .map(item => item.text()),
        label
      ).toEqual(['导入', '导出'])
      expect(tools(wrapper, label).get('[data-test="backup-file"]').attributes('accept'), label).toBe('.json,application/json')
    }
  })

  it('排除路径：导出只含排除路径；导入时与现有的合并（已有的不重复），不导入其他部分', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings'] })
    const downloads = captureDownloads()
    const wrapper = await render()
    await button(tools(wrapper, '汉化设置'), '导出').trigger('click')
    await settle()
    expect(downloads[0]!.name.replace('github-chinese-excluded-', '')).toMatch(DATED)
    const content = await readDownload(downloads[0])
    expect(Object.keys(content)).toEqual(['format', 'version', 'exportedAt', 'settings'])
    expect(content.settings).toEqual({ excludedPaths: ['/settings'] })
    await chooseBackup(
      tools(wrapper, '汉化设置'),
      file({ settings: { excludedPaths: ['/*/*/wiki', '/settings', 'bad'], translateTime: false }, customEntries: { Code: '代码' } })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    expect(await getSettings()).toEqual({ ...ZH_SETTINGS, excludedPaths: ['/settings', '/*/*/wiki'] })
    expect(await getCustomEntries()).toEqual({})
    expect(
      panel(wrapper, '汉化设置')
        .findAll<HTMLInputElement>('section tbody input:not([type="checkbox"])')
        .map(input => input.element.value)
    ).toEqual(['/*/*/wiki', '/settings'])
  })

  it('新标签页设置：导出开关、范围与自定义页面；导入时开关、范围按文件，自定义页面合并，不导入其他部分', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, newTab: true, newTabScopes: ['search'], newTabPaths: ['/*/*/releases'] })
    const downloads = captureDownloads()
    const wrapper = await render()
    await openTab(wrapper, '新标签页设置')
    await button(tools(wrapper, '新标签页设置'), '导出').trigger('click')
    await settle()
    expect(downloads[0]!.name.replace('github-chinese-new-tab-', '')).toMatch(DATED)
    const content = await readDownload(downloads[0])
    expect(content.settings).toEqual({ newTab: true, newTabScopes: ['search'], newTabPaths: ['/*/*/releases'] })
    await chooseBackup(
      tools(wrapper, '新标签页设置'),
      file({ settings: { newTab: false, newTabScopes: ['external'], newTabPaths: ['/orgs/*/repositories'], accelerate: true } })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    expect(await getSettings()).toEqual({
      ...ZH_SETTINGS,
      newTab: false,
      newTabScopes: ['external'],
      newTabPaths: ['/*/*/releases', '/orgs/*/repositories']
    })
  })

  it('导入：点按钮打开文件选择；选过后清空，同一文件可再次选择', async () => {
    const wrapper = await render()
    const input = header(wrapper).get<HTMLInputElement>('[data-test="backup-file"]')
    const click = vi.spyOn(input.element, 'click').mockImplementation(() => undefined)
    await button(header(wrapper), '导入备份').trigger('click')
    expect(click).toHaveBeenCalledOnce()
    await chooseBackup(header(wrapper), file({ settings: { accelerate: true } }))
    expect(input.element.value).toBe('')
  })

  it('导出备份：全部设置、自定义词条、屏蔽规则与已授权的企业版站点', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, accelerate: true })
    await customEntriesItem.setValue({ Code: '代码' })
    await searchBlockRulesItem.setValue(['@octocat'])
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    const downloads = captureDownloads()
    const wrapper = await render()
    await button(header(wrapper), '导出备份').trigger('click')
    await settle()
    expect(downloads).toHaveLength(1)
    expect(downloads[0]!.name.replace('github-chinese-backup-', '')).toMatch(DATED)
    const content = await readDownload(downloads[0])
    expect(content).toMatchObject({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      customEntries: { Code: '代码' },
      searchBlockRules: ['@octocat'],
      enterpriseSites: [HOST]
    })
    expect(content.settings).toEqual({ ...ZH_SETTINGS, accelerate: true })
    expect(Number.isNaN(Date.parse(String(content.exportedAt)))).toBe(false)
  })

  it('导出失败（读取失败）：提示，不下载', async () => {
    const downloads = captureDownloads()
    const wrapper = await render()
    vi.spyOn(fakeBrowser.permissions, 'getAll').mockRejectedValue(new Error('不支持'))
    await button(header(wrapper), '导出备份').trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['读取失败'])
    expect(downloads).toEqual([])
  })

  it('导入备份：设置按文件覆盖（只覆盖文件中有的项），词条与规则合并，站点待授权；已打开的页面重新读取；提示已导入', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, translateTitle: false })
    await customEntriesItem.setValue({ Code: '代码', Wiki: '维基' })
    await searchBlockRulesItem.setValue(['@octocat'])
    const send = vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue(undefined)
    const wrapper = await render()
    await chooseBackup(
      header(wrapper),
      file({
        settings: { translateTime: false, accelerate: true },
        customEntries: { Code: '源码', Pull: '拉取' },
        searchBlockRules: ['@OCTOCAT', 'vuejs/core'],
        enterpriseSites: [HOST]
      })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    expect(await getSettings()).toEqual({ ...ZH_SETTINGS, translateTitle: false, translateTime: false, accelerate: true })
    expect(await getCustomEntries()).toEqual({ Code: '源码', Wiki: '维基', Pull: '拉取' })
    expect(await getSearchBlockRules()).toEqual(['@octocat', 'vuejs/core'])
    expect(await pendingSitesItem.getValue()).toEqual([HOST])
    expect(send.mock.calls.map(([message]) => message)).toEqual(
      expect.arrayContaining([{ type: 'gcn:custom-entries-saved' }, { type: 'gcn:search-rules-saved' }])
    )
  })

  it('导入备份：界面语言随文件中的设置切换', async () => {
    const wrapper = await render()
    await chooseBackup(header(wrapper), file({ settings: { uiLanguage: 'en' } }))
    expect(header(wrapper).findAll('button')[1]?.text()).toBe('Export backup')
  })

  it.each([
    ['不是备份文件', '{"Code":"代码"}'],
    ['不是 JSON', 'Code'],
    ['版本更新', JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION + 1, settings: { accelerate: true } })],
    ['没有内容', file({})]
  ])('导入备份（%s）：提示格式错误，不改动', async (_name, text) => {
    const wrapper = await render()
    await chooseBackup(header(wrapper), text)
    expect(toastTexts(wrapper)).toEqual(['格式错误'])
    expect(await getSettings()).toEqual(ZH_SETTINGS)
  })

  it('导入备份：读取文件失败时提示', async () => {
    const wrapper = await render()
    await chooseBackup(header(wrapper), { text: () => Promise.reject(new Error('读取')) })
    expect(toastTexts(wrapper)).toEqual(['读取失败'])
  })

  it.each([
    ['设置', 'sync', { settings: { accelerate: true } }],
    ['自定义词条', 'local', { customEntries: { Code: '代码' } }]
  ] as const)('导入备份：保存失败（%s）时提示', async (_name, area, content) => {
    const wrapper = await render()
    vi.spyOn(fakeBrowser.storage[area], 'set').mockRejectedValue(new Error('配额'))
    await chooseBackup(header(wrapper), file(content))
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
  })

  it('加速设置：导出含开关、分类、加速源与替换原链接', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, accelerate: true, replaceCategory: 'ghfast', categoryOrder: ['ghfast', 'gh-proxy'] })
    await customEntriesItem.setValue({ Code: '代码' })
    const downloads = captureDownloads()
    const wrapper = await render()
    await openTab(wrapper, '加速设置')
    await button(tools(wrapper, '加速设置'), '导出').trigger('click')
    await settle()
    expect(downloads[0]!.name.replace('github-chinese-accelerate-', '')).toMatch(DATED)
    const content = await readDownload(downloads[0])
    expect(Object.keys(content)).toEqual(['format', 'version', 'exportedAt', 'settings'])
    expect(Object.keys(content.settings as object)).toEqual([...ACCELERATE_KEYS])
    expect(content.settings).toMatchObject({
      accelerate: true,
      accelerateImages: false,
      failover: false,
      replaceCategory: 'ghfast',
      categoryOrder: ['ghfast', 'gh-proxy']
    })
  })

  it('加速设置：导入完整备份时只导入开关与加速源；界面随之更新', async () => {
    const wrapper = await render()
    await openTab(wrapper, '加速设置')
    await chooseBackup(
      tools(wrapper, '加速设置'),
      file({
        settings: {
          accelerate: true,
          translateTime: false,
          customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'custom' }]
        },
        customEntries: { Code: '代码' }
      })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    const settings = await getSettings()
    expect(settings).toMatchObject({ accelerate: true, translateTime: true })
    expect(settings.customSources).toEqual([expect.objectContaining({ name: 'Mirror', category: 'custom' })])
    expect(await getCustomEntries()).toEqual({})
    expect(
      panel(wrapper, '加速设置')
        .findAll('.switches [role="switch"]')
        .map(item => item.attributes('aria-checked'))
    ).toEqual(['true', 'false', 'false'])
    expect(
      panel(wrapper, '加速设置')
        .findAll('.source-name')
        .map(item => item.text())
    ).toContain('Mirror')
  })

  it('加速设置：文件中没有开关、加速源时提示格式错误', async () => {
    const wrapper = await render()
    await openTab(wrapper, '加速设置')
    await chooseBackup(tools(wrapper, '加速设置'), file({ settings: { translateTime: false }, customEntries: { Code: '代码' } }))
    expect(toastTexts(wrapper)).toEqual(['格式错误'])
    expect(await getSettings()).toEqual(ZH_SETTINGS)
  })

  it('净化设置：导出净化开关、内置规则开关与屏蔽规则；导入时开关按文件，规则合并，不导入其他部分', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, purifySearch: true, purifyBuiltin: false })
    await searchBlockRulesItem.setValue(['@octocat'])
    const downloads = captureDownloads()
    const wrapper = await render()
    await openTab(wrapper, '净化设置')
    await button(tools(wrapper, '净化设置'), '导出').trigger('click')
    await settle()
    expect(downloads[0]!.name.replace('github-chinese-purify-', '')).toMatch(DATED)
    const content = await readDownload(downloads[0])
    expect(content.settings).toEqual({ purifySearch: true, purifyBuiltin: false })
    expect(content.searchBlockRules).toEqual(['@octocat'])
    expect(content).not.toHaveProperty('customEntries')
    await chooseBackup(
      tools(wrapper, '净化设置'),
      file({
        settings: { purifySearch: false, purifyBuiltin: true, accelerate: true },
        searchBlockRules: ['vuejs/core', '@OctoCat'],
        enterpriseSites: [HOST]
      })
    )
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    expect(await getSearchBlockRules()).toEqual(['@octocat', 'vuejs/core'])
    expect(await getSettings()).toMatchObject({ purifySearch: false, purifyBuiltin: true, accelerate: false })
    expect(await pendingSitesItem.getValue()).toEqual([])
    expect(
      panel(wrapper, '净化设置')
        .findAll<HTMLInputElement>('tbody input:not([type="checkbox"])')
        .map(input => input.element.value)
    ).toContain('vuejs/core')
  })

  it('企业版设置：导出已授权的站点', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    const downloads = captureDownloads()
    const wrapper = await render()
    await openTab(wrapper, '企业版设置')
    await button(tools(wrapper, '企业版设置'), '导出').trigger('click')
    await settle()
    expect(downloads[0]!.name.replace('github-chinese-enterprise-', '')).toMatch(DATED)
    const content = await readDownload(downloads[0])
    expect(Object.keys(content)).toEqual(['format', 'version', 'exportedAt', 'enterpriseSites'])
    expect(content.enterpriseSites).toEqual([HOST])
  })

  it('企业版设置：导入的站点（已授权的除外）待授权；授权时同步申请权限，授予后列入站点', async () => {
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    const wrapper = await render()
    await openTab(wrapper, '企业版设置')
    await chooseBackup(tools(wrapper, '企业版设置'), file({ enterpriseSites: [HOST, OTHER] }))
    expect(toastTexts(wrapper)).toEqual(['已导入'])
    const pending = panel(wrapper, '企业版设置').get('[data-test="pending-sites"]') as DOMWrapper<Element>
    expect(pending.get('.pending-label').text()).toBe('待授权')
    expect(pending.get('.pending-hosts').text()).toBe(OTHER)
    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    // 点击事件中同步发起，处于用户手势内
    void button(pending, '授权').trigger('click')
    expect(request).toHaveBeenCalledExactlyOnceWith({ origins: enterpriseOrigins(OTHER) })
    await settle()
    expect(panel(wrapper, '企业版设置').find('[data-test="pending-sites"]').exists()).toBe(false)
    expect(await pendingSitesItem.getValue()).toEqual([])
    expect(sites(wrapper).sort()).toEqual([HOST, OTHER].sort())
  })

  it('企业版设置：拒绝授权时提示并保留待授权；取消时清除', async () => {
    fakePermissions.answer = false
    await pendingSitesItem.setValue([OTHER])
    const wrapper = await render()
    await openTab(wrapper, '企业版设置')
    const pending = (): DOMWrapper<Element> => panel(wrapper, '企业版设置').get('[data-test="pending-sites"]') as DOMWrapper<Element>
    await button(pending(), '授权').trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['授权失败'])
    expect(await pendingSitesItem.getValue()).toEqual([OTHER])
    await button(pending(), '取消').trigger('click')
    await settle()
    expect(panel(wrapper, '企业版设置').find('[data-test="pending-sites"]').exists()).toBe(false)
    expect(await pendingSitesItem.getValue()).toEqual([])
    expect(fakePermissions.granted).toEqual([])
  })

  it('企业版设置：已待授权的站点不重复记入；在别处授权后不再待授权', async () => {
    await pendingSitesItem.setValue([OTHER])
    const wrapper = await render()
    await openTab(wrapper, '企业版设置')
    await chooseBackup(tools(wrapper, '企业版设置'), file({ enterpriseSites: [OTHER, HOST] }))
    expect(await pendingSitesItem.getValue()).toEqual([OTHER, HOST])
    expect(panel(wrapper, '企业版设置').get('.pending-hosts').text()).toBe(`${OTHER}, ${HOST}`)
    await fakePermissions.grant(enterpriseOrigins(OTHER))
    await settle()
    expect(await pendingSitesItem.getValue()).toEqual([HOST])
    expect(panel(wrapper, '企业版设置').get('.pending-hosts').text()).toBe(HOST)
  })

  it('企业版设置：文件中没有站点时提示格式错误', async () => {
    const wrapper = await render()
    await openTab(wrapper, '企业版设置')
    await chooseBackup(tools(wrapper, '企业版设置'), file({ settings: { accelerate: true } }))
    expect(toastTexts(wrapper)).toEqual(['格式错误'])
    expect(await getSettings()).toEqual(ZH_SETTINGS)
  })
})
