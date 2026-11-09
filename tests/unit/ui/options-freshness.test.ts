import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import {
  DEFAULT_FRESHNESS_COLORS,
  FRESHNESS_LEVELS,
  FRESHNESS_PREVIEW_COLORS,
  FRESHNESS_SCHEMES,
  type FreshnessLevel,
  type FreshnessScheme
} from '../../../src/shared/freshness'
import { getSettings, settingsItem, updateSettings } from '../../../src/shared/settings'
import { mockVersion, openOptionsTab, optionsPanel, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

/** 增强设置里的子标签 */
const TAB = '更新时间着色'

interface Rendered {
  readonly wrapper: VueWrapper
  /** 更新时间着色的面板 */
  readonly scope: DOMWrapper<Element>
}

/** 打开设置页并切到增强设置里的更新时间着色 */
async function render(): Promise<Rendered> {
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  await openOptionsTab(wrapper, TAB)
  return { wrapper, scope: optionsPanel(wrapper, TAB) }
}

function switchOf(scope: DOMWrapper<Element>, label: string): DOMWrapper<HTMLButtonElement> {
  const labelEl = scope.findAll('label').find(item => item.text() === label)
  if (!labelEl) throw new Error(`未找到开关：${label}`)
  return scope.get(`#${CSS.escape(labelEl.attributes('for') ?? '')}`) as DOMWrapper<HTMLButtonElement>
}

/** get 取到的元素 */
type Found<T extends Element = Element> = Omit<DOMWrapper<T>, 'exists'>

function field(scope: DOMWrapper<Element>, scheme: FreshnessScheme, level: FreshnessLevel): Found {
  return scope.get(`[data-test="freshness-${scheme}-${level}"]`)
}

const hex = (scope: Found): Found<HTMLInputElement> => scope.get<HTMLInputElement>('[data-test="color-hex"]')
const picker = (scope: Found): Found<HTMLInputElement> => scope.get<HTMLInputElement>('[data-test="color-picker"]')
const reset = (scope: Found): Found<HTMLButtonElement> => scope.get<HTMLButtonElement>('[data-test="color-reset"]')
const status = (scope: Found): Found => scope.get('[data-test="color-status"]')
const label = (scope: Found): Found<HTMLElement> => scope.get<HTMLElement>('[data-test="color-label"]')

/** aria-labelledby 指向的各元素的文字 */
function labelledBy(element: Element): string {
  return (element.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(id => document.getElementById(id)?.textContent?.trim() ?? '')
    .join(' ')
}

/** 颜色写进 style 后读出的写法：与名称的颜色比较 */
function cssColor(color: string): string {
  const probe = document.createElement('span')
  probe.style.color = color
  return probe.style.color
}

/** 在写法输入框输入，不提交（setValue 会同时触发 change） */
async function typeHex(scope: Found, value: string): Promise<void> {
  hex(scope).element.value = value
  await hex(scope).trigger('input')
  await settle()
}

/** 在写法输入框输入并提交（失去焦点、按 Enter 时触发 change） */
async function commitHex(scope: Found, value: string): Promise<void> {
  await typeHex(scope, value)
  await hex(scope).trigger('change')
  await settle()
}

async function savedColors(): Promise<unknown> {
  return (await getSettings()).freshnessColors
}

function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

describe.skipIf(!App)('设置页：更新时间着色', () => {
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

  it('开关默认关闭；「颜色」分浅色、深色两组（各按 GitHub 该主题的配色），三个时段默认为空、显示默认颜色，关闭时不可用', async () => {
    const { scope } = await render()
    expect(scope.findAll('h2').map(item => item.text())).toEqual(['颜色'])
    expect(switchOf(scope, '更新时间着色').attributes('aria-checked')).toBe('false')
    expect(scope.findAll('h3').map(item => item.text())).toEqual(['浅色', '深色'])
    for (const scheme of FRESHNESS_SCHEMES) {
      const group = scope.get(`[data-test="freshness-${scheme}"]`)
      expect(group.attributes('data-gcn-scheme')).toBe(scheme)
      expect(group.findAll('[data-test="color-label"]').map(item => item.text())).toEqual(['30 天内', '一年内', '更早'])
      for (const level of FRESHNESS_LEVELS) {
        const row = field(scope, scheme, level)
        const fallback = FRESHNESS_PREVIEW_COLORS[level][scheme]
        expect(hex(row).element.value).toBe('')
        expect(hex(row).attributes('placeholder')).toBe('默认')
        expect(picker(row).element.value).toBe(fallback)
        expect(label(row).element.style.color).toBe(cssColor(fallback))
        expect([hex(row), picker(row), reset(row)].map(control => control.element.disabled)).toEqual([true, true, true])
      }
    }
    const row = field(scope, 'dark', 'recent')
    expect(labelledBy(picker(row).element)).toBe('深色 一年内')
    expect(labelledBy(hex(row).element)).toBe('深色 一年内')
    expect(labelledBy(reset(row).element)).toBe('重置 深色 一年内')
  })

  it('开关立即保存；开启后颜色可改', async () => {
    const { scope } = await render()
    await switchOf(scope, '更新时间着色').trigger('click')
    await settle()
    expect((await getSettings()).freshness).toBe(true)
    expect(hex(field(scope, 'light', 'fresh')).element.disabled).toBe(false)
    expect(picker(field(scope, 'dark', 'stale')).element.disabled).toBe(false)
  })

  it('写法：失去焦点、按 Enter 时保存，统一为小写 #rrggbb（# 可省，可用三位写法）；名称、取色器随之显示', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'fresh')
    await commitHex(row, 'CF222E')
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '#cf222e', dark: '' } })
    expect(hex(row).element.value).toBe('#cf222e')
    expect(picker(row).element.value).toBe('#cf222e')
    expect(label(row).element.style.color).toBe(cssColor('#cf222e'))
    await commitHex(field(scope, 'dark', 'stale'), ' #ABC ')
    expect(await savedColors()).toEqual({
      ...DEFAULT_FRESHNESS_COLORS,
      fresh: { light: '#cf222e', dark: '' },
      stale: { light: '', dark: '#aabbcc' }
    })
  })

  it('输入中只预览、不保存；格式不符时提示、不保存，改对后保存', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'recent')
    await typeHex(row, '#0969da')
    expect(label(row).element.style.color).toBe(cssColor('#0969da'))
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)
    await commitHex(row, '#0969d')
    expect(hex(row).attributes('aria-invalid')).toBe('true')
    expect(status(row).text()).toBe('格式错误')
    expect(hex(row).attributes('aria-describedby')).toBe(status(row).attributes('id'))
    expect(label(row).element.style.color).toBe(cssColor(FRESHNESS_PREVIEW_COLORS.recent.light))
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)
    await commitHex(row, '#0969da')
    expect(hex(row).attributes('aria-invalid')).toBeUndefined()
    expect(status(row).text()).toBe('')
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, recent: { light: '#0969da', dark: '' } })
  })

  it('取色器：拖动时只预览，关闭时保存', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'dark', 'fresh')
    picker(row).element.value = '#4493f8'
    await picker(row).trigger('input')
    await settle()
    expect(hex(row).element.value).toBe('#4493f8')
    expect(label(row).element.style.color).toBe(cssColor('#4493f8'))
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)
    await picker(row).trigger('change')
    await settle()
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '', dark: '#4493f8' } })
  })

  it('重置、清空写法：恢复默认，只改这一项', async () => {
    const colors = { ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '#cf222e', dark: '#ff7b72' } }
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true, freshnessColors: colors })
    const { scope } = await render()
    const light = field(scope, 'light', 'fresh')
    expect(hex(light).element.value).toBe('#cf222e')
    expect(reset(light).element.disabled).toBe(false)
    await reset(light).trigger('click')
    await settle()
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '', dark: '#ff7b72' } })
    expect(hex(light).element.value).toBe('')
    expect(reset(light).element.disabled).toBe(true)
    expect(label(light).element.style.color).toBe(cssColor(FRESHNESS_PREVIEW_COLORS.fresh.light))
    await commitHex(field(scope, 'dark', 'fresh'), '  ')
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)
  })

  it('设置在别处改了（其他页面、导入备份）：跟着变；未提交的输入不覆盖', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const light = field(scope, 'light', 'stale')
    const dark = field(scope, 'dark', 'stale')
    await typeHex(dark, '#8b9')
    await updateSettings({ freshnessColors: { ...DEFAULT_FRESHNESS_COLORS, stale: { light: '#59636e', dark: '#30363d' } } })
    await settle()
    expect(hex(light).element.value).toBe('#59636e')
    expect(hex(dark).element.value).toBe('#8b9')
  })

  it('界面语言随设置', async () => {
    const { scope } = await render()
    await updateSettings({ uiLanguage: 'en' })
    await settle()
    expect(scope.findAll('h3').map(item => item.text())).toEqual(['Light', 'Dark'])
    const labels = scope.get('[data-test="freshness-light"]').findAll('[data-test="color-label"]')
    expect(labels.map(item => item.text())).toEqual(['Within 30 days', 'Within a year', 'Older'])
    expect(hex(field(scope, 'light', 'fresh')).attributes('placeholder')).toBe('Default')
    expect(reset(field(scope, 'light', 'fresh')).text()).toBe('Reset')
  })

  it('保存失败：提示', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { wrapper, scope } = await render()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await commitHex(field(scope, 'light', 'fresh'), '#cf222e')
    expect(toastTexts(wrapper)).toEqual(['保存失败'])
  })
})
