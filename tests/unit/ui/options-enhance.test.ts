import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { getSettings, settingsItem } from '../../../src/shared/settings'
import { mockVersion, openOptionsTab, optionsPanel, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

/** 自动加载的范围开关，按显示顺序 */
const AUTO_LOAD_LABELS = [
  '搜索结果',
  '议题',
  '拉取请求',
  '讨论',
  '操作',
  '发行版',
  '标签',
  '提交',
  '首页',
  '个人与组织主页',
  '侧栏常用存储库',
  '其他页面'
]
/** 新标签页打开的范围开关，按显示顺序 */
const NEW_TAB_LABELS = ['站外链接', '正文链接', '搜索结果', '议题与拉取请求', '通知', '首页', '个人与组织主页', '探索']

/** 增强设置里的子标签，按显示顺序 */
const ENHANCE_LABELS = ['自动加载', '下载次数', '新标签页打开', '更新时间着色']

function tabLabels(scope: VueWrapper | DOMWrapper<Element>, selector: string): string[] {
  return scope
    .get(selector)
    .findAll('[role="tab"]')
    .map(item => item.text())
}

const panel = optionsPanel

/** 打开设置页并切到给出的标签（子标签先切到增强设置） */
async function render(label: string): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await openOptionsTab(wrapper, label)
  return wrapper
}

function switchOf(scope: DOMWrapper<Element>, label: string): DOMWrapper<HTMLButtonElement> {
  const labelEl = scope.findAll('label').find(item => item.text() === label)
  if (!labelEl) throw new Error(`未找到开关：${label}`)
  return scope.get(`#${CSS.escape(labelEl.attributes('for') ?? '')}`) as DOMWrapper<HTMLButtonElement>
}

function switchLabels(scope: DOMWrapper<Element>): string[] {
  return scope.findAll('label').map(item => item.text())
}

function headings(scope: DOMWrapper<Element>): string[] {
  return scope.findAll('h2').map(item => item.text())
}

function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

function pathRows(scope: DOMWrapper<Element>): string[] {
  return scope.findAll<HTMLInputElement>('tbody input:not([type="checkbox"])').map(input => input.element.value)
}

async function addPath(scope: DOMWrapper<Element>, value: string): Promise<void> {
  await scope.get('form input').setValue(value)
  await scope.get('form').trigger('submit')
  await settle()
}

describe.skipIf(!App)('设置页：自动加载、新标签页打开', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
  })

  afterEach(() => {
    delete document.documentElement.dataset.theme
    clearToasts()
    vi.restoreAllMocks()
  })

  it('在增强设置（排在净化设置之后）中各一个子标签：自动加载、下载次数、新标签页打开、更新时间着色；图片预览只在弹出页开关', async () => {
    const wrapper = await render('自动加载')
    expect(tabLabels(wrapper, '[role="tablist"]')).toEqual(['汉化设置', '加速设置', '净化设置', '增强设置', '企业版设置'])
    const enhance = panel(wrapper, '增强设置')
    expect(enhance.get('[role="tablist"]').attributes('aria-label')).toBe('增强设置')
    expect(tabLabels(enhance, '[role="tablist"]')).toEqual(ENHANCE_LABELS)
    expect(enhance.get('.ui-tabs').classes()).toContain('ui-tabs-pill')
    expect(wrapper.findAll('label').map(item => item.text())).not.toContain('图片预览')
  })

  it('增强设置默认显示自动加载；点子标签切换，只显示所选功能', async () => {
    const wrapper = mount(required(App), { attachTo: document.body })
    await settle()
    await openOptionsTab(wrapper, '增强设置')
    const visible = (): string[] => ENHANCE_LABELS.filter(label => panel(wrapper, label).isVisible())
    expect(visible()).toEqual(['自动加载'])
    await openOptionsTab(wrapper, '更新时间着色')
    expect(visible()).toEqual(['更新时间着色'])
    expect(panel(wrapper, '增强设置').isVisible()).toBe(true)
  })

  it('自动加载：开关，下方「范围」按页面逐项开关；默认关闭，范围默认全部、不可用', async () => {
    const wrapper = await render('自动加载')
    const scope = panel(wrapper, '自动加载')
    expect(headings(scope)).toEqual(['范围'])
    expect(switchLabels(scope)).toEqual(['自动加载', ...AUTO_LOAD_LABELS])
    expect(switchOf(scope, '自动加载').attributes('aria-checked')).toBe('false')
    for (const label of AUTO_LOAD_LABELS) {
      const control = switchOf(scope, label)
      expect(control.element.disabled, label).toBe(true)
      expect(control.attributes('aria-checked'), label).toBe('true')
    }
  })

  it('新标签页打开：开关，下方「范围」：各范围与自定义页面；默认关闭，默认选中站外链接、搜索结果', async () => {
    const wrapper = await render('新标签页打开')
    const scope = panel(wrapper, '新标签页打开')
    expect(headings(scope)).toEqual(['范围'])
    expect(switchLabels(scope)).toEqual(['新标签页打开', ...NEW_TAB_LABELS])
    expect(switchOf(scope, '新标签页打开').attributes('aria-checked')).toBe('false')
    for (const label of NEW_TAB_LABELS) {
      const control = switchOf(scope, label)
      expect(control.element.disabled, label).toBe(true)
      expect(control.attributes('aria-checked'), label).toBe(String(label === '站外链接' || label === '搜索结果'))
    }
    const input = scope.get('form input')
    expect(input.attributes('aria-label')).toBe('自定义页面')
    expect(input.attributes('placeholder')).toBe('/*/*/releases')
    expect(scope.get('[data-test="list-empty"]').text()).toBe('暂无路径')
  })

  it('开关立即保存；开启后范围可用', async () => {
    const wrapper = await render('自动加载')
    await switchOf(panel(wrapper, '自动加载'), '自动加载').trigger('click')
    await openOptionsTab(wrapper, '新标签页打开')
    await switchOf(panel(wrapper, '新标签页打开'), '新标签页打开').trigger('click')
    await settle()
    expect(await getSettings()).toMatchObject({ autoLoad: true, newTab: true })
    expect(switchOf(panel(wrapper, '自动加载'), '议题').element.disabled).toBe(false)
    expect(switchOf(panel(wrapper, '新标签页打开'), '议题与拉取请求').element.disabled).toBe(false)
  })

  it('自动加载的范围：连续开关几项都保存，按固定顺序', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, autoLoad: true })
    const wrapper = await render('自动加载')
    const scope = panel(wrapper, '自动加载')
    await switchOf(scope, '首页').trigger('click')
    await switchOf(scope, '其他页面').trigger('click')
    await switchOf(scope, '侧栏常用存储库').trigger('click')
    await settle()
    expect((await getSettings()).autoLoadScopes).toEqual([
      'search',
      'issues',
      'pulls',
      'discussions',
      'actions',
      'releases',
      'tags',
      'commits',
      'profiles'
    ])
    expect(switchOf(scope, '首页').attributes('aria-checked')).toBe('false')
    await switchOf(scope, '首页').trigger('click')
    await settle()
    expect((await getSettings()).autoLoadScopes).toContain('dashboard')
    expect(switchOf(scope, '首页').attributes('aria-checked')).toBe('true')
  })

  it('新标签页打开的范围：连续开关几项都保存，按固定顺序', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, newTab: true })
    const wrapper = await render('新标签页打开')
    const scope = panel(wrapper, '新标签页打开')
    await switchOf(scope, '探索').trigger('click')
    await switchOf(scope, '站外链接').trigger('click')
    await switchOf(scope, '正文链接').trigger('click')
    await settle()
    expect((await getSettings()).newTabScopes).toEqual(['content', 'search', 'explore'])
    expect(switchOf(scope, '站外链接').attributes('aria-checked')).toBe('false')
    expect(switchOf(scope, '探索').attributes('aria-checked')).toBe('true')
  })

  it('自定义页面：去掉首尾空白后保存，不以 / 开头的不保存', async () => {
    const wrapper = await render('新标签页打开')
    const scope = panel(wrapper, '新标签页打开')
    await addPath(scope, ' /*/*/releases ')
    await addPath(scope, '/orgs/*/repositories')
    expect((await getSettings()).newTabPaths).toEqual(['/*/*/releases', '/orgs/*/repositories'])
    expect(pathRows(scope)).toEqual(['/orgs/*/repositories', '/*/*/releases'])
    await addPath(scope, 'vuejs/core')
    expect((await getSettings()).newTabPaths).toEqual(['/*/*/releases', '/orgs/*/repositories'])
  })

  it('保存失败：提示', async () => {
    const wrapper = await render('自动加载')
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await switchOf(panel(wrapper, '自动加载'), '自动加载').trigger('click')
    await settle()
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
  })
})
