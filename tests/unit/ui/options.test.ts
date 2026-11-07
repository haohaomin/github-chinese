import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import { EXPORT_FILE_NAME } from '../../../src/shared/custom-entries'
import { REPOSITORY_URL } from '../../../src/shared/extension'
import { customEntriesItem, getCustomEntries, getSettings, settingsItem, updateSettings } from '../../../src/shared/settings'
import '../../../src/entrypoints/options/options.css'
import { deleteSelected, mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

async function render(): Promise<VueWrapper> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  return wrapper
}

/** 页面的标签（不含加速设置里各分类的标签） */
function pageTabs(wrapper: VueWrapper): DOMWrapper<Element>[] {
  return wrapper.get('[role="tablist"]').findAll('[role="tab"]')
}

function tab(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  const found = pageTabs(wrapper).find(item => item.text() === label)
  if (!found) throw new Error(`未找到标签：${label}`)
  return found
}

/** 分区：标签页（加速设置、净化设置，汉化设置里的自定义词库、内置词库）按标签文字取对应的面板，其余按标题（h2）取 section */
function section(wrapper: VueWrapper, title: string): DOMWrapper<Element> {
  const tabbed = wrapper.findAll('[role="tab"]').find(item => item.text() === title)
  if (tabbed) return wrapper.get(`#${CSS.escape(tabbed.attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
  const found = wrapper.findAll('section').find(item => item.find('h2').text() === title)
  if (!found) throw new Error(`未找到分区：${title}`)
  return found
}

/** 汉化设置里词库的标签：自定义词库、内置词库 */
function dictionaryTabLabels(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[role="tablist"][aria-label="词库"]')
    .findAll('[role="tab"]')
    .map(item => item.text())
}

function tabLabels(wrapper: VueWrapper): string[] {
  return pageTabs(wrapper).map(item => item.text())
}

/** 显示中的面板对应的标签（页面的标签页） */
function visiblePanels(wrapper: VueWrapper): string[] {
  return wrapper
    .findAll<HTMLElement>('.options-main > .ui-tabs > [role="tabpanel"]')
    .filter(panel => panel.element.style.display !== 'none')
    .map(panel => wrapper.get(`#${CSS.escape(panel.attributes('aria-labelledby') ?? '')}`).text())
}

/** 页面顶部的提示文字（读屏朗读的区域内），先显示的在前 */
function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

function headings(wrapper: VueWrapper): string[] {
  return wrapper.findAll('h2').map(item => item.text())
}

function button(scope: VueWrapper | DOMWrapper<Element>, text: string): DOMWrapper<HTMLButtonElement> {
  const found = scope.findAll('button').find(item => item.text() === text)
  if (!found) throw new Error(`未找到按钮：${text}`)
  return found as DOMWrapper<HTMLButtonElement>
}

function addInput(scope: DOMWrapper<Element>): DOMWrapper<HTMLInputElement> {
  return scope.get('form input') as DOMWrapper<HTMLInputElement>
}

/** 排除路径列表各行的值，新添加的在前 */
function pathRows(wrapper: VueWrapper): string[] {
  return section(wrapper, '排除路径')
    .findAll<HTMLInputElement>('tbody input:not([type="checkbox"])')
    .map(input => input.element.value)
}

async function addPath(wrapper: VueWrapper, value: string): Promise<void> {
  const excluded = section(wrapper, '排除路径')
  await addInput(excluded).setValue(value)
  await excluded.get('form').trigger('submit')
  await settle()
}

async function chooseFile(wrapper: VueWrapper, content: string): Promise<void> {
  const input = wrapper.get('[data-test="import-file"]')
  Object.defineProperty(input.element, 'files', {
    value: [new File([content], 'entries.json', { type: 'application/json' })],
    configurable: true
  })
  await input.trigger('change')
  await settle()
}

/** 先聚焦再点击：模拟键盘操作（Chromium 点击按钮时也会聚焦） */
async function pressButton(scope: DOMWrapper<Element>, selector: string): Promise<void> {
  const target = scope.get<HTMLButtonElement>(selector)
  target.element.focus()
  await target.trigger('click')
  await settle()
}

describe.skipIf(!App)('设置页组件', () => {
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

  describe('布局', () => {
    it('先是汉化设置（时间格式、排除路径；自定义词库、内置词库两个标签）、加速设置、净化设置、自动加载设置、下载次数设置、新标签页设置、企业版设置七个标签页，再是关于；常规开关、语言下拉、快捷键都不在这里', async () => {
      const wrapper = await render()
      expect(wrapper.get('h1').text()).toBe('GitHub 中文化')
      expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('设置')
      expect(tabLabels(wrapper)).toEqual(['汉化设置', '加速设置', '净化设置', '自动加载设置', '下载次数设置', '新标签页设置', '企业版设置'])
      expect(headings(wrapper)).toEqual([
        '时间格式',
        '排除路径',
        '加速源',
        '范围',
        '说明',
        '个人访问令牌',
        '创建令牌',
        '隐私',
        '范围',
        '关于'
      ])
      expect(dictionaryTabLabels(wrapper)).toEqual(['自定义词库', '内置词库'])
      expect(section(wrapper, '自定义词库').isVisible()).toBe(true)
      expect(section(wrapper, '内置词库').isVisible()).toBe(false)
      for (const title of ['时间格式', '排除路径', '自定义词库', '内置词库']) {
        expect(
          section(wrapper, title).element.closest('.options-main > .ui-tabs > [role="tabpanel"]')?.getAttribute('aria-labelledby')
        ).toBe(tab(wrapper, '汉化设置').attributes('id'))
      }
      expect(section(wrapper, '关于').element.closest('[role="tabpanel"]')).toBeNull()
      const main = wrapper.get('main').element
      expect(main.firstElementChild?.contains(wrapper.get('[role="tablist"]').element)).toBe(true)
      // 开关只有加速的三个与各分类的自动隐藏、净化搜索，以及自动加载、下载次数、新标签页打开及其范围（图片预览、下载文件夹只在弹出页）
      expect(wrapper.findAll('.ui-switch-label').map(item => item.text())).toEqual([
        '加速下载',
        '加速图片',
        '故障转移',
        ...Array.from({ length: 5 }, () => '自动隐藏'),
        '净化搜索',
        '内置规则',
        '自动加载',
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
        '其他页面',
        '下载次数',
        '新标签页打开',
        '站外链接',
        '正文链接',
        '搜索结果',
        '议题与拉取请求',
        '通知',
        '首页',
        '个人与组织主页',
        '探索'
      ])
      // 下拉只有时间格式、内置词库的翻译语言与加速设置的替换原链接；没有界面语言下拉
      expect(wrapper.findAll('[role="combobox"]').map(item => item.attributes('data-test'))).toEqual([
        'time-format',
        'dictionary-language',
        'replace-category'
      ])
      expect(wrapper.text()).not.toContain('快捷键')
    })

    it('默认显示汉化设置；点标签切换面板，其他面板里未提交的输入保留', async () => {
      const wrapper = await render()
      expect(visiblePanels(wrapper)).toEqual(['汉化设置'])
      expect(tab(wrapper, '汉化设置').attributes('aria-selected')).toBe('true')
      await addInput(section(wrapper, '排除路径')).setValue('/draft')
      await tab(wrapper, '加速设置').trigger('click')
      await settle()
      expect(visiblePanels(wrapper)).toEqual(['加速设置'])
      await tab(wrapper, '净化设置').trigger('click')
      await settle()
      expect(visiblePanels(wrapper)).toEqual(['净化设置'])
      await tab(wrapper, '汉化设置').trigger('click')
      await settle()
      expect(visiblePanels(wrapper)).toEqual(['汉化设置'])
      expect(addInput(section(wrapper, '排除路径')).element.value).toBe('/draft')
    })

    it('标题后紧跟版本号（不在标题内）', async () => {
      const wrapper = await render()
      const title = wrapper.get('h1')
      const version = wrapper.get('[data-test="version"]')
      expect(title.text()).toBe('GitHub 中文化')
      expect(version.text()).toBe('v1.2.3')
      expect(title.element.nextElementSibling).toBe(version.element)
    })

    it('关于：GitHub 存储库地址，在新标签页打开', async () => {
      const wrapper = await render()
      const about = section(wrapper, '关于')
      expect(about.findAll('dt').map(item => item.text())).toEqual(['GitHub'])
      const link = about.get('dd a')
      expect(link.attributes('href')).toBe(REPOSITORY_URL)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noreferrer')
      expect(link.text()).toBe(REPOSITORY_URL.replace('https://', ''))
    })

    it.each([
      [
        'en',
        'GitHub Chinese',
        'Settings',
        ['Translation', 'Acceleration', 'Search filter', 'Auto load', 'Download counts', 'Open in new tab', 'Enterprise'],
        [
          'Time format',
          'Excluded paths',
          'Sources',
          'Scope',
          'How it works',
          'Personal access token',
          'Create a token',
          'Privacy',
          'Scope',
          'About'
        ],
        'GitHub repository'
      ],
      [
        'zh-TW',
        'GitHub 中文化',
        '設定',
        ['中文化設定', '加速設定', '淨化設定', '自動載入設定', '下載次數設定', '新分頁設定', '企業版設定'],
        ['時間格式', '排除路徑', '加速來源', '範圍', '說明', '個人存取權杖', '建立權杖', '隱私權', '範圍', '關於'],
        'GitHub'
      ]
    ] as const)('界面语言随设置（如在弹出页修改）切换：%s', async (uiLanguage, title, tabsLabel, tabs, sections, repository) => {
      const wrapper = await render()
      await updateSettings({ uiLanguage })
      await settle()
      expect(wrapper.get('h1').text()).toBe(title)
      expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe(tabsLabel)
      expect(tabLabels(wrapper)).toEqual(tabs)
      expect(headings(wrapper)).toEqual(sections)
      expect(wrapper.get('dt').text()).toBe(repository)
      expect(document.documentElement.lang).toBe(uiLanguage)
    })

    it('外观随设置', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, theme: 'dark' })
      await render()
      expect(document.documentElement.dataset.theme).toBe('dark')
      await updateSettings({ theme: 'light' })
      await settle()
      expect(document.documentElement.dataset.theme).toBe('light')
    })
  })

  describe('排除路径', () => {
    it('显示已有规则，新添加的在前；列名、添加框、行内输入框以「路径」为名', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings', '/*/*/wiki'] })
      const wrapper = await render()
      const excluded = section(wrapper, '排除路径')
      expect(pathRows(wrapper)).toEqual(['/*/*/wiki', '/settings'])
      expect(excluded.findAll('th').map(item => item.text())).toEqual(['', '路径', '操作'])
      expect(excluded.get('th [data-test="select-all"] input').attributes('aria-label')).toBe('全选')
      expect(addInput(excluded).attributes('aria-label')).toBe('路径')
      expect(addInput(excluded).attributes('placeholder')).toBe('/*/*/wiki')
      expect(excluded.findAll('tbody input:not([type="checkbox"])').map(input => input.attributes('aria-label'))).toEqual(['路径', '路径'])
      expect(excluded.findAll('tbody button').map(item => item.attributes('aria-label'))).toEqual(['删除 /*/*/wiki', '删除 /settings'])
    })

    it('空时显示暂无路径；添加框为空时不能添加', async () => {
      const wrapper = await render()
      const excluded = section(wrapper, '排除路径')
      expect(excluded.get('[data-test="list-empty"]').text()).toBe('暂无路径')
      expect(excluded.find('table').exists()).toBe(false)
      expect(button(excluded, '添加').element.disabled).toBe(true)
      await addInput(excluded).setValue('  ')
      expect(button(excluded, '添加').element.disabled).toBe(true)
    })

    it('添加：去掉首尾空白，即时保存；清空添加框，焦点回到添加框', async () => {
      const wrapper = await render()
      await addPath(wrapper, ' /settings ')
      await addPath(wrapper, '/*/*/wiki')
      expect((await getSettings()).excludedPaths).toEqual(['/settings', '/*/*/wiki'])
      expect(pathRows(wrapper)).toEqual(['/*/*/wiki', '/settings'])
      const input = addInput(section(wrapper, '排除路径'))
      expect(input.element.value).toBe('')
      expect(document.activeElement).toBe(input.element)
      expect(toastTexts(wrapper)).toEqual([])
    })

    it.each([
      ['不以 / 开头', 'settings', '格式错误'],
      ['已存在', ' /settings ', '已存在']
    ])('添加失败（%s）：提示，不保存，添加框保留', async (_name, value, message) => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings'] })
      const wrapper = await render()
      await addPath(wrapper, value)
      expect(toastTexts(wrapper)).toEqual([message])
      expect((await getSettings()).excludedPaths).toEqual(['/settings'])
      expect(addInput(section(wrapper, '排除路径')).element.value).toBe(value)
    })

    it('行内改写即时保存；无效、已存在时恢复原值并提示', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings', '/*/*/wiki'] })
      const wrapper = await render()
      const input = section(wrapper, '排除路径').get<HTMLInputElement>('tbody input:not([type="checkbox"])')
      await input.setValue(' /*/*/wiki/new ')
      await settle()
      expect((await getSettings()).excludedPaths).toEqual(['/settings', '/*/*/wiki/new'])
      expect(input.element.value).toBe('/*/*/wiki/new')

      await input.setValue('wiki')
      await settle()
      expect(input.element.value).toBe('/*/*/wiki/new')
      expect(toastTexts(wrapper)).toEqual(['格式错误'])

      await input.setValue('/settings')
      await settle()
      expect(input.element.value).toBe('/*/*/wiki/new')
      expect(toastTexts(wrapper)).toEqual(['已存在'])
      expect((await getSettings()).excludedPaths).toEqual(['/settings', '/*/*/wiki/new'])
    })

    it('改写：同一行就地更新，焦点保留', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings'] })
      const wrapper = await render()
      const input = section(wrapper, '排除路径').get<HTMLInputElement>('tbody input:not([type="checkbox"])')
      input.element.focus()
      await input.setValue('/settings/profile')
      await settle()
      expect(section(wrapper, '排除路径').get('tbody input:not([type="checkbox"])').element).toBe(input.element)
      expect(document.activeElement).toBe(input.element)
    })

    it('删除；用键盘删除时焦点移到原位置这一条（原来的下一条）的删除按钮，删空时移到添加框', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/a', '/b', '/c'] })
      const wrapper = await render()
      const excluded = section(wrapper, '排除路径')
      expect(pathRows(wrapper)).toEqual(['/c', '/b', '/a'])

      await pressButton(excluded, 'button[aria-label="删除 /b"]')
      expect((await getSettings()).excludedPaths).toEqual(['/a', '/c'])
      expect(document.activeElement?.getAttribute('aria-label')).toBe('删除 /a')

      await pressButton(excluded, 'button[aria-label="删除 /a"]')
      expect(document.activeElement?.getAttribute('aria-label')).toBe('删除 /c')

      await pressButton(excluded, 'button[aria-label="删除 /c"]')
      expect((await getSettings()).excludedPaths).toEqual([])
      expect(document.activeElement).toBe(addInput(excluded).element)
      expect(excluded.get('[data-test="list-empty"]').text()).toBe('暂无路径')
    })

    it('多选：勾选、全选（部分选中时为横线）；表头显示删除所选，确认后一次写入；焦点移到全选框，删空时移到添加框', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/a', '/b', '/c'] })
      const wrapper = await render()
      const excluded = section(wrapper, '排除路径')
      const selectAll = (): HTMLInputElement => excluded.get<HTMLInputElement>('[data-test="select-all"] input').element
      const rowBox = (path: string) => excluded.get<HTMLInputElement>(`tbody input[type="checkbox"][aria-label="选择 ${path}"]`)
      expect(excluded.find('[data-test="delete-selected"]').exists()).toBe(false)
      expect(excluded.get('th .sr-only').text()).toBe('操作')
      expect(excluded.get('.list-frame > .ui-back-to-top [data-test="back-to-top"]').attributes('aria-label')).toBe('返回顶部')

      await rowBox('/b').setValue(true)
      expect(rowBox('/b').element.checked).toBe(true)
      expect(selectAll().checked).toBe(false)
      expect(selectAll().indeterminate).toBe(true)
      expect(excluded.get('[data-test="delete-selected"]').text()).toBe('删除 1 条')

      await excluded.get('[data-test="select-all"] input').setValue(true)
      expect(selectAll().checked).toBe(true)
      expect(selectAll().indeterminate).toBe(false)
      expect(excluded.get('[data-test="delete-selected"]').text()).toBe('删除 3 条')
      await excluded.get('[data-test="select-all"] input').setValue(false)
      expect(excluded.find('[data-test="delete-selected"]').exists()).toBe(false)

      await rowBox('/a').setValue(true)
      await rowBox('/c').setValue(true)
      const set = vi.spyOn(fakeBrowser.storage.sync, 'set')
      await deleteSelected(excluded)
      expect(set).toHaveBeenCalledOnce()
      expect((await getSettings()).excludedPaths).toEqual(['/b'])
      expect(pathRows(wrapper)).toEqual(['/b'])
      expect(rowBox('/b').element.checked).toBe(false)
      expect(document.activeElement).toBe(selectAll())

      await excluded.get('[data-test="select-all"] input').setValue(true)
      await deleteSelected(excluded)
      expect((await getSettings()).excludedPaths).toEqual([])
      expect(document.activeElement).toBe(addInput(excluded).element)
    })

    it('多选：删除失败时提示，所选保留', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/a', '/b'] })
      const wrapper = await render()
      const excluded = section(wrapper, '排除路径')
      await excluded.get('[data-test="select-all"] input').setValue(true)
      vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
      await deleteSelected(excluded)
      expect(toastTexts(wrapper)).toEqual(['保存失败'])
      expect(pathRows(wrapper)).toEqual(['/b', '/a'])
      expect(excluded.get('[data-test="delete-selected"]').text()).toBe('删除 2 条')
    })

    it('删除所选要确认：确认框显示条数，焦点在取消上；取消、关闭（Escape）时不删除，所选保留', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/a', '/b'] })
      const wrapper = await render()
      const excluded = section(wrapper, '排除路径')
      await excluded.get('[data-test="select-all"] input').setValue(true)
      const set = vi.spyOn(fakeBrowser.storage.sync, 'set')
      const dialog = excluded.get('[data-test="confirm"]')
      const element = dialog.element as HTMLDialogElement
      expect(element.open).toBe(false)

      await pressButton(excluded, '[data-test="delete-selected"]')
      expect(element.open).toBe(true)
      expect(document.getElementById(dialog.attributes('aria-labelledby') ?? '')?.textContent).toBe('删除 2 条？')
      expect(dialog.findAll('button').map(button => button.text())).toEqual(['取消', '删除'])
      expect(dialog.get('[data-test="confirm-cancel"]').attributes()).toHaveProperty('autofocus')
      await pressButton(excluded, '[data-test="confirm-cancel"]')
      expect(element.open).toBe(false)

      await pressButton(excluded, '[data-test="delete-selected"]')
      element.close()
      await settle()
      expect(element.open).toBe(false)
      expect(set).not.toHaveBeenCalled()
      expect(pathRows(wrapper)).toEqual(['/b', '/a'])
      expect(excluded.get('[data-test="delete-selected"]').text()).toBe('删除 2 条')
    })

    it('弹出页排除此页、取消排除时列表随之更新；行内未提交的修改保留', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings'] })
      const wrapper = await render()
      const input = section(wrapper, '排除路径').get<HTMLInputElement>('tbody input:not([type="checkbox"])')
      input.element.value = '/settings/draft'
      await input.trigger('input')

      await updateSettings({ excludedPaths: ['/settings', '/vuejs/core/issues'] })
      await settle()
      expect(pathRows(wrapper)).toEqual(['/vuejs/core/issues', '/settings/draft'])

      await updateSettings({ excludedPaths: ['/settings'] })
      await settle()
      expect(pathRows(wrapper)).toEqual(['/settings/draft'])
    })

    it('保存失败：提示，列表不变', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings'] })
      const wrapper = await render()
      vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
      await addPath(wrapper, '/vuejs/core/issues')
      expect(toastTexts(wrapper)).toEqual(['保存失败'])
      expect(pathRows(wrapper)).toEqual(['/settings'])
    })

    it('列表框限高、框内滚动；表头固定在顶部，键盘切换焦点时滚动留出表头高度', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, excludedPaths: ['/settings'] })
      const wrapper = await render()
      const table = section(wrapper, '排除路径').get('table').element
      const frame = getComputedStyle(table.parentElement!)
      const head = getComputedStyle(table.querySelector('th')!)
      expect(frame.maxHeight).toMatch(/^min\(480px, /)
      expect(frame.overflowY).toBe('auto')
      expect(head.position).toBe('sticky')
      expect(head.top).toBe('0px')
      expect(head.height).toBe('36px')
      expect(frame.scrollPaddingTop).toBe(head.height)
    })
  })

  describe('自定义词库', () => {
    it('读取失败时列表处显示加载失败，不弹提示', async () => {
      vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValue(new Error('存储不可用'))
      const wrapper = await render()
      expect(section(wrapper, '自定义词库').get('[data-test="entries-empty"]').text()).toBe('加载失败')
      expect(toastTexts(wrapper)).toEqual([])
    })

    it('空时显示暂无词条，导出不可用', async () => {
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      expect(entries.get('[data-test="entries-empty"]').text()).toBe('暂无词条')
      expect(button(entries, '导出').element.disabled).toBe(true)
    })

    it('添加词条', async () => {
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const add = button(entries, '添加')
      expect(add.element.disabled).toBe(true)

      await entries.get('form input[aria-label="原文"]').setValue('Pull requests')
      await entries.get('form input[aria-label="译文"]').setValue('拉取请求')
      expect(add.element.disabled).toBe(false)
      await entries.get('form').trigger('submit')
      await settle()

      expect(await getCustomEntries()).toEqual({ 'Pull requests': '拉取请求' })
      expect(entries.findAll('tbody tr')).toHaveLength(1)
      expect((entries.get('form input[aria-label="原文"]').element as HTMLInputElement).value).toBe('')
    })

    it('原文重复时提示已存在', async () => {
      await customEntriesItem.setValue({ Code: '代码' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      await entries.get('form input[aria-label="原文"]').setValue('Code')
      await entries.get('form input[aria-label="译文"]').setValue('源码')
      await entries.get('form').trigger('submit')
      await settle()
      expect(toastTexts(wrapper)).toEqual(['已存在'])
      expect(await getCustomEntries()).toEqual({ Code: '代码' })
    })

    it('行内编辑原文与译文', async () => {
      await customEntriesItem.setValue({ Code: '代码' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')

      const target = entries.get('tbody input[aria-label="译文"]')
      await target.setValue('  源码  ')
      await settle()
      expect(await getCustomEntries()).toEqual({ Code: '源码' })
      expect((target.element as HTMLInputElement).value).toBe('源码')

      await entries.get('tbody input[aria-label="原文"]').setValue('Source')
      await settle()
      expect(await getCustomEntries()).toEqual({ Source: '源码' })
    })

    it('行内编辑无效时恢复原值', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const firstTarget = entries.get('tbody input[aria-label="译文"]')
      await firstTarget.setValue('  ')
      await settle()
      expect((firstTarget.element as HTMLInputElement).value).toBe('议题')
      expect(toastTexts(wrapper)).toEqual(['格式错误'])

      const firstSource = entries.get('tbody input[aria-label="原文"]')
      await firstSource.setValue('Code')
      await settle()
      expect((firstSource.element as HTMLInputElement).value).toBe('Issues')
      expect(toastTexts(wrapper)).toEqual(['已存在'])
      expect(await getCustomEntries()).toEqual({ Code: '代码', Issues: '议题' })
    })

    it('删除词条', async () => {
      await customEntriesItem.setValue({ Code: '代码' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const remove = entries.get('button[aria-label="删除 Code"]')
      expect(remove.text()).toBe('删除')
      await remove.trigger('click')
      await settle()
      expect(await getCustomEntries()).toEqual({})
      expect(entries.get('[data-test="entries-empty"]').text()).toBe('暂无词条')
    })

    it('改原文：同一行就地更新，焦点与同一行里未提交的输入都保留', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const row = entries.get('tr[data-index="1"]').element
      const sourceInput = row.querySelector<HTMLInputElement>('input[aria-label="原文"]')!
      const targetInput = row.querySelector<HTMLInputElement>('input[aria-label="译文"]')!

      // 改原文后按 Tab：保存还没完成时已进入同一行的译文框并开始输入
      sourceInput.focus()
      sourceInput.value = 'Source code'
      sourceInput.dispatchEvent(new Event('change'))
      targetInput.focus()
      targetInput.value = '源码'
      targetInput.dispatchEvent(new Event('input'))
      await settle()

      expect(await getCustomEntries()).toEqual({ 'Source code': '代码', Issues: '议题' })
      expect(row.isConnected).toBe(true)
      expect(document.activeElement).toBe(targetInput)
      expect(targetInput.value).toBe('源码')
      expect(sourceInput.value).toBe('Source code')
      expect(row.querySelector('button')?.getAttribute('aria-label')).toBe('删除 Source code')
    })

    it('改原文保存失败：恢复原文，仍是同一行', async () => {
      await customEntriesItem.setValue({ Code: '代码' })
      const wrapper = await render()
      const row = section(wrapper, '自定义词库').get('tr[data-index="0"]').element
      const sourceInput = row.querySelector<HTMLInputElement>('input[aria-label="原文"]')!
      vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValueOnce(new Error('存储不可用'))
      sourceInput.value = 'Source code'
      sourceInput.dispatchEvent(new Event('change'))
      await settle()
      expect(toastTexts(wrapper)).toEqual(['保存失败'])
      expect(sourceInput.value).toBe('Code')
      expect(await getCustomEntries()).toEqual({ Code: '代码' })

      sourceInput.value = 'Source code'
      sourceInput.dispatchEvent(new Event('change'))
      await settle()
      expect(await getCustomEntries()).toEqual({ 'Source code': '代码' })
      expect(row.isConnected).toBe(true)
    })

    it('用键盘删除：焦点移到原位置这一条（原来的下一条）的删除按钮；删掉末条时移到上一条', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题', Wiki: '维基' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')

      await pressButton(entries, 'button[aria-label="删除 Issues"]')
      expect(document.activeElement?.getAttribute('aria-label')).toBe('删除 Code')

      await pressButton(entries, 'button[aria-label="删除 Code"]')
      expect(document.activeElement?.getAttribute('aria-label')).toBe('删除 Wiki')
    })

    it('删空：焦点移到添加表单；搜索结果删空时移到搜索框', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')

      await entries.get('input[type="search"]').setValue('议')
      await pressButton(entries, 'button[aria-label="删除 Issues"]')
      expect(document.activeElement).toBe(entries.get('input[type="search"]').element)

      await entries.get('input[type="search"]').setValue('')
      await pressButton(entries, 'button[aria-label="删除 Code"]')
      expect(document.activeElement).toBe(entries.get('form input[aria-label="原文"]').element)
    })

    it('点击删除、按钮没有获得焦点（如 Firefox）时不移动焦点', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题' })
      const wrapper = await render()
      await section(wrapper, '自定义词库').get('button[aria-label="删除 Issues"]').trigger('click')
      await settle()
      expect(await getCustomEntries()).toEqual({ Code: '代码' })
      expect(document.activeElement).toBe(document.body)
    })

    it('多选：全选只选搜索结果；搜索变了，不在结果中的取消；删除所选一次写入并通知页面', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题', Wiki: '维基' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const search = entries.get('input[type="search"]')
      const selectAll = entries.get<HTMLInputElement>('[data-test="select-all"] input')
      expect(selectAll.attributes('aria-label')).toBe('全选')
      expect(entries.get('.list-frame > .ui-back-to-top [data-test="back-to-top"]').attributes('aria-label')).toBe('返回顶部')
      expect(entries.findAll('tbody input[type="checkbox"]').map(item => item.attributes('aria-label'))).toEqual([
        '选择 Wiki',
        '选择 Issues',
        '选择 Code'
      ])

      await search.setValue('i')
      await selectAll.setValue(true)
      expect(entries.get('[data-test="delete-selected"]').text()).toBe('删除 2 条')
      await search.setValue('wiki')
      expect(entries.get('[data-test="delete-selected"]').text()).toBe('删除 1 条')
      await search.setValue('')
      expect(selectAll.element.indeterminate).toBe(true)
      expect(entries.get<HTMLInputElement>('tbody input[aria-label="选择 Wiki"]').element.checked).toBe(true)

      await entries.get('tbody input[aria-label="选择 Code"]').setValue(true)
      const send = vi.spyOn(fakeBrowser.runtime, 'sendMessage')
      await deleteSelected(entries)
      expect(await getCustomEntries()).toEqual({ Issues: '议题' })
      expect(send).toHaveBeenCalledWith({ type: 'gcn:custom-entries-saved' })
      expect(document.activeElement).toBe(entries.get('[data-test="select-all"] input').element)

      await search.setValue('issues')
      await entries.get('[data-test="select-all"] input').setValue(true)
      await deleteSelected(entries)
      expect(await getCustomEntries()).toEqual({})
      expect(document.activeElement).toBe(search.element)
    })

    it('搜索', async () => {
      await customEntriesItem.setValue({ Code: '代码', Issues: '议题' })
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const search = entries.get('input[type="search"]')

      await search.setValue('议')
      expect(entries.findAll('tbody tr')).toHaveLength(1)
      expect((entries.get('tbody input[aria-label="原文"]').element as HTMLInputElement).value).toBe('Issues')

      await search.setValue('none')
      expect(entries.get('[data-test="entries-empty"]').text()).toBe('未找到')
    })

    it('导入按钮直接打开文件选择框', async () => {
      const wrapper = await render()
      const entries = section(wrapper, '自定义词库')
      const click = vi
        .spyOn(entries.get('[data-test="import-file"]').element as HTMLInputElement, 'click')
        .mockImplementation(() => undefined)
      const create = vi.spyOn(fakeBrowser.tabs, 'create')
      await button(entries, '导入').trigger('click')
      expect(click).toHaveBeenCalledTimes(1)
      expect(create).not.toHaveBeenCalled()
    })

    it('导入 JSON 后提示条数', async () => {
      await customEntriesItem.setValue({ Code: '代码' })
      const wrapper = await render()
      await chooseFile(wrapper, '{"Issues": "议题", "Wiki": "维基"}')
      expect(toastTexts(wrapper)).toEqual(['已导入 2 条'])
      expect(await getCustomEntries()).toEqual({ Code: '代码', Issues: '议题', Wiki: '维基' })
      expect((wrapper.get('[data-test="import-file"]').element as HTMLInputElement).value).toBe('')
    })

    it('导入格式错误', async () => {
      const wrapper = await render()
      await chooseFile(wrapper, '["Code"]')
      expect(toastTexts(wrapper)).toEqual(['格式错误'])
      expect(await getCustomEntries()).toEqual({})
    })

    it('导出 JSON', async () => {
      await customEntriesItem.setValue({ Code: '代码' })
      let blob: Blob | undefined
      vi.spyOn(URL, 'createObjectURL').mockImplementation(value => {
        blob = value as Blob
        return 'blob:export'
      })
      const download = vi.fn()
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        download(this.download)
      })
      const wrapper = await render()
      await button(section(wrapper, '自定义词库'), '导出').trigger('click')
      expect(download).toHaveBeenCalledWith(EXPORT_FILE_NAME)
      expect(JSON.parse((await blob?.text()) ?? '')).toEqual({ Code: '代码' })
    })

    it('其他页面修改词条时列表同步', async () => {
      const wrapper = await render()
      await customEntriesItem.setValue({ Wiki: '维基' })
      await settle()
      const entries = section(wrapper, '自定义词库')
      expect(entries.findAll('tbody tr')).toHaveLength(1)
      expect((entries.get('tbody input[aria-label="原文"]').element as HTMLInputElement).value).toBe('Wiki')
    })

    describe('长列表（限高、虚拟列表）', () => {
      /** 列表框可视高度 440；行高按渲染后实测的 tr 高度 50（与估计值 44 不同）：可见 10 行 */
      const HEIGHT = 440
      const ROW = 50

      /** count 条词条；列表里新添加的在前：第 i 行是 Sample text {count - 1 - i} */
      function manyEntries(count: number): Record<string, string> {
        return Object.fromEntries(Array.from({ length: count }, (_, index) => [`Sample text ${index}`, `示例文字 ${index}`]))
      }

      function range(start: number, end: number): number[] {
        return Array.from({ length: end - start }, (_, offset) => start + offset)
      }

      function viewportOf(wrapper: VueWrapper): HTMLElement {
        const viewport = section(wrapper, '自定义词库').get('table').element.parentElement
        if (!viewport) throw new Error('未找到列表框')
        return viewport
      }

      /** 已渲染的数据行的序号 */
      function rendered(wrapper: VueWrapper): number[] {
        return section(wrapper, '自定义词库')
          .findAll('tbody tr[data-index]')
          .map(row => Number(row.attributes('data-index')))
      }

      function inputAt(wrapper: VueWrapper, index: number, label: '原文' | '译文'): HTMLInputElement {
        const input = section(wrapper, '自定义词库').get(`tr[data-index="${index}"] input[aria-label="${label}"]`)
        return input.element as HTMLInputElement
      }

      async function scrollList(wrapper: VueWrapper, top: number): Promise<void> {
        const viewport = viewportOf(wrapper)
        viewport.scrollTop = top
        viewport.dispatchEvent(new Event('scroll'))
        await nextTick()
      }

      /** 在第 index 行的译文框里输入（未提交） */
      async function typeTarget(wrapper: VueWrapper, index: number, value: string): Promise<HTMLInputElement> {
        const element = inputAt(wrapper, index, '译文')
        element.focus()
        element.value = value
        element.dispatchEvent(new Event('input'))
        await nextTick()
        return element
      }

      beforeEach(async () => {
        vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
          return this.classList.contains('entries-viewport') ? HEIGHT : 0
        })
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
          return new DOMRect(0, 0, 0, this.matches('tr[data-index]') ? ROW : 0)
        })
        await customEntriesItem.setValue(manyEntries(200))
      })

      it('只渲染可视范围内的行（行高按实测），其余用占位撑开；表格标出总行数与各行序号，占位对读屏隐藏', async () => {
        const wrapper = await render()
        const entries = section(wrapper, '自定义词库')
        // 可见 10 行，下方多渲染 6 行
        expect(rendered(wrapper)).toEqual(range(0, 16))
        expect(inputAt(wrapper, 0, '原文').value).toBe('Sample text 199')
        expect(entries.get('table').attributes('aria-rowcount')).toBe('201')
        expect(entries.get('thead tr').attributes('aria-rowindex')).toBe('1')
        expect(entries.get('tr[data-index="0"]').attributes('aria-rowindex')).toBe('2')
        const gaps = entries.findAll('tbody tr.entries-gap')
        expect(gaps).toHaveLength(1)
        expect(gaps[0]!.attributes('aria-hidden')).toBe('true')
        expect(gaps[0]!.get('td').attributes('style')).toContain(`height: ${184 * ROW}px`)
      })

      it('列表框限高、框内滚动、不做滚动锚定；表头固定在顶部，键盘切换焦点时滚动留出表头高度', async () => {
        const wrapper = await render()
        const viewport = getComputedStyle(viewportOf(wrapper))
        const head = getComputedStyle(section(wrapper, '自定义词库').get('th').element)
        expect(viewport.maxHeight).toMatch(/^min\(480px, /)
        expect(viewport.overflowY).toBe('auto')
        expect(viewport.overflowAnchor).toBe('none')
        expect(head.position).toBe('sticky')
        expect(head.top).toBe('0px')
        expect(viewport.scrollPaddingTop).toBe(head.height)
      })

      it('滚动时换成对应的行', async () => {
        const wrapper = await render()
        await scrollList(wrapper, 100 * ROW)
        expect(rendered(wrapper)).toEqual(range(94, 116))
        expect(inputAt(wrapper, 100, '原文').value).toBe('Sample text 99')
        expect(section(wrapper, '自定义词库').get('tr[data-index="100"]').attributes('aria-rowindex')).toBe('102')
      })

      it('搜索、添加、导入成功后滚回顶部；添加失败、导入失败、删除词条时位置不变', async () => {
        const wrapper = await render()
        const entries = section(wrapper, '自定义词库')

        await scrollList(wrapper, 100 * ROW)
        await entries.get('input[type="search"]').setValue('Sample text')
        expect(viewportOf(wrapper).scrollTop).toBe(0)
        expect(rendered(wrapper)[0]).toBe(0)
        await entries.get('input[type="search"]').setValue('')

        await scrollList(wrapper, 100 * ROW)
        await entries.get('form input[aria-label="原文"]').setValue('Sample text 5')
        await entries.get('form input[aria-label="译文"]').setValue('示例')
        await entries.get('form').trigger('submit')
        await settle()
        expect(toastTexts(wrapper)).toEqual(['已存在'])
        expect(viewportOf(wrapper).scrollTop).toBe(100 * ROW)

        await entries.get('tr[data-index="100"] button').trigger('click')
        await settle()
        expect((await getCustomEntries())['Sample text 99']).toBeUndefined()
        expect(viewportOf(wrapper).scrollTop).toBe(100 * ROW)
        expect(rendered(wrapper)).toEqual(range(94, 116))

        await entries.get('form input[aria-label="原文"]').setValue('Code')
        await entries.get('form input[aria-label="译文"]').setValue('代码')
        await entries.get('form').trigger('submit')
        await settle()
        expect(viewportOf(wrapper).scrollTop).toBe(0)
        expect(inputAt(wrapper, 0, '原文').value).toBe('Code')

        await scrollList(wrapper, 100 * ROW)
        await chooseFile(wrapper, '["Code"]')
        expect(viewportOf(wrapper).scrollTop).toBe(100 * ROW)
        await chooseFile(wrapper, '{"Issues": "议题"}')
        expect(viewportOf(wrapper).scrollTop).toBe(0)
        expect(inputAt(wrapper, 0, '原文').value).toBe('Issues')
      })

      it('编辑中的行滚出可视范围后连同相邻的行仍在原处，未提交的修改保留并照常提交；失焦后移除', async () => {
        const wrapper = await render()
        const element = await typeTarget(wrapper, 1, '示例')

        await scrollList(wrapper, 100 * ROW)
        expect(rendered(wrapper)).toEqual([0, 1, 2, ...range(94, 116)])
        expect(element.isConnected).toBe(true)
        expect(element.value).toBe('示例')

        element.dispatchEvent(new Event('change'))
        await settle()
        expect((await getCustomEntries())['Sample text 198']).toBe('示例')

        element.blur()
        await nextTick()
        expect(rendered(wrapper)).toEqual(range(94, 116))
      })

      it('编辑中的行在范围下方时一次滚到它下方：这一行不被移动，焦点与未提交的修改保留', async () => {
        const wrapper = await render()
        await scrollList(wrapper, 100 * ROW)
        const element = await typeTarget(wrapper, 100, '未提交')
        await scrollList(wrapper, 0)
        expect(rendered(wrapper)).toEqual([...range(0, 16), 99, 100, 101])

        await scrollList(wrapper, 150 * ROW)
        expect(rendered(wrapper)).toEqual([99, 100, 101, ...range(144, 166)])
        expect(element.isConnected).toBe(true)
        expect(document.activeElement).toBe(element)
        expect(element.value).toBe('未提交')
      })

      it('焦点在范围外的行内移动（如 Tab 到同一行的译文框）：这一行不在焦点移过去之前被移除', async () => {
        const wrapper = await render()
        const sourceInput = inputAt(wrapper, 1, '原文')
        const targetInput = inputAt(wrapper, 1, '译文')
        sourceInput.focus()
        await scrollList(wrapper, 100 * ROW)

        // 浏览器在 focusout 之后、聚焦新元素之前运行微任务，Vue 在此时更新
        sourceInput.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: targetInput }))
        await nextTick()
        expect(targetInput.isConnected).toBe(true)
        targetInput.focus()
        await nextTick()
        expect(rendered(wrapper)).toEqual([0, 1, 2, ...range(94, 116)])
      })

      it('焦点行在范围外时用键盘删除：原位置这一条保留渲染，焦点移到它的删除按钮', async () => {
        const wrapper = await render()
        const entries = section(wrapper, '自定义词库')
        entries.get<HTMLButtonElement>('tr[data-index="1"] button').element.focus()
        await scrollList(wrapper, 100 * ROW)

        await pressButton(entries, 'tr[data-index="1"] button')
        expect((await getCustomEntries())['Sample text 198']).toBeUndefined()
        expect(document.activeElement?.getAttribute('aria-label')).toBe('删除 Sample text 197')
        expect(document.activeElement?.closest('tr')?.dataset.index).toBe('1')
      })

      it('编辑中途其他页面添加了词条（排在最前）：编辑中的行仍保留，序号随之变，修改不丢', async () => {
        const wrapper = await render()
        const element = await typeTarget(wrapper, 1, '示例')
        await scrollList(wrapper, 100 * ROW)

        await customEntriesItem.setValue({ ...manyEntries(200), Wiki: '维基' })
        await settle()
        expect(element.isConnected).toBe(true)
        expect(element.value).toBe('示例')
        expect(element.closest('tr')?.dataset.index).toBe('2')
      })
    })
  })
})
