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
import { GRADIENT, imageLightDark, LAYERED_GRADIENT, noImageLightDark } from '../shared/fake-css'
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
/** 色块按钮（点开调色盘） */
const picker = (scope: Found): Found<HTMLButtonElement> => scope.get<HTMLButtonElement>('[data-test="color-picker"]')
const swatch = (scope: Found): Found<HTMLElement> => scope.get<HTMLElement>('[data-test="color-swatch"]')
const reset = (scope: Found): Found<HTMLButtonElement> => scope.get<HTMLButtonElement>('[data-test="color-reset"]')
const status = (scope: Found): Found => scope.get('[data-test="color-status"]')
const label = (scope: Found): Found<HTMLElement> => scope.get<HTMLElement>('[data-test="color-label"]')
const hasPalette = (scope: Found): boolean => scope.find('[data-test="color-palette"]').exists()
const channel = (scope: Found, key: string): Found<HTMLInputElement> => scope.get<HTMLInputElement>(`[data-test="color-channel-${key}"]`)
const stops = (scope: Found): DOMWrapper<HTMLElement>[] => scope.findAll<HTMLElement>('[data-test="gradient-stop"]')

/** 点色块打开调色盘 */
async function openPalette(row: Found): Promise<Found> {
  await picker(row).trigger('click')
  await settle()
  return row.get('[data-test="color-palette"]')
}

/** 点在调色盘以外 */
async function clickOutside(): Promise<void> {
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  await settle()
}

function slider(scope: Found, name: string): DOMWrapper<HTMLElement> {
  const found = scope.findAll<HTMLElement>('[role="slider"]').find(item => item.attributes('aria-label') === name)
  if (!found) throw new Error(`未找到滑杆：${name}`)
  return found
}

async function press(target: Found, key: string, init: KeyboardEventInit = {}): Promise<void> {
  await target.trigger('keydown', { key, ...init })
  await settle()
}

/** 在调色盘的数值框输入并提交 */
async function setChannel(scope: Found, key: string, value: string): Promise<void> {
  const input = channel(scope, key)
  input.element.value = value
  await input.trigger('change')
  await settle()
}

async function setInput(scope: Found, test: string, value: string): Promise<void> {
  const input = scope.get<HTMLInputElement>(`[data-test="${test}"]`)
  input.element.value = value
  await input.trigger('change')
  await settle()
}

/** 在下拉框（data-test 为 test）里选 label */
async function choose(scope: Found, test: string, label: string): Promise<void> {
  const trigger = scope.get(`[data-test="${test}"]`)
  await trigger.trigger('click')
  const listbox = scope.get(`#${CSS.escape(trigger.attributes('aria-controls') ?? '')}`)
  const option = listbox.findAll('[role="option"]').find(item => item.text() === label)
  if (!option) throw new Error(`未找到选项：${label}`)
  await option.trigger('click')
  await settle()
}

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
    expect(scope.findAll('h2').map(item => item.text())).toEqual(['时段范围', '颜色'])
    expect(switchOf(scope, '更新时间着色').attributes('aria-checked')).toBe('false')
    expect(scope.findAll('h3').map(item => item.text())).toEqual(['浅色', '深色'])
    for (const scheme of FRESHNESS_SCHEMES) {
      const group = scope.get(`[data-test="freshness-${scheme}"]`)
      expect(group.attributes('data-gcn-scheme')).toBe(scheme)
      expect(group.findAll('[data-test="color-label"]').map(item => item.text())).toEqual(['30 天内', '365 天内', '更早'])
      for (const level of FRESHNESS_LEVELS) {
        const row = field(scope, scheme, level)
        const fallback = FRESHNESS_PREVIEW_COLORS[level][scheme]
        expect(hex(row).element.value).toBe('')
        expect(hex(row).attributes('placeholder')).toBe('默认')
        expect(swatch(row).element.style.backgroundColor).toBe(cssColor(fallback))
        expect(label(row).element.style.color).toBe(cssColor(fallback))
        expect([hex(row), picker(row), reset(row)].map(control => control.element.disabled)).toEqual([true, true, true])
      }
    }
    const row = field(scope, 'dark', 'recent')
    expect(labelledBy(picker(row).element)).toBe('调色盘 深色 365 天内')
    expect(picker(row).attributes('aria-haspopup')).toBe('dialog')
    expect(picker(row).attributes('aria-expanded')).toBe('false')
    expect(labelledBy(hex(row).element)).toBe('深色 365 天内')
    expect(labelledBy(reset(row).element)).toBe('重置 深色 365 天内')
  })

  it('开关立即保存；开启后颜色可改', async () => {
    const { scope } = await render()
    await switchOf(scope, '更新时间着色').trigger('click')
    await settle()
    expect((await getSettings()).freshness).toBe(true)
    expect(hex(field(scope, 'light', 'fresh')).element.disabled).toBe(false)
    expect(picker(field(scope, 'dark', 'stale')).element.disabled).toBe(false)
  })

  it('写法：失去焦点、按 Enter 时保存，统一为小写 #rrggbb（# 可省，可用三位写法）；名称、色块随之显示', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'fresh')
    await commitHex(row, 'CF222E')
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '#cf222e', dark: '' } })
    expect(hex(row).element.value).toBe('#cf222e')
    expect(swatch(row).element.style.backgroundColor).toBe(cssColor('#cf222e'))
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

  it('CSS 颜色与渐变：浏览器认的保存，名称按值预览（渐变裁到文字）；不认的提示格式错误、不保存', async () => {
    // happy-dom 每次访问 CSS 都新建实例，改原型上的 supports
    const prototype = Object.getPrototypeOf(CSS) as { supports: typeof CSS.supports }
    const supports = vi
      .spyOn(prototype, 'supports')
      .mockImplementation(((property: string, value?: string) => imageLightDark(property, value ?? '')) as typeof CSS.supports)
    onTestFinished(() => supports.mockRestore())
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'fresh')

    await commitHex(row, 'foo')
    expect(status(row).text()).toBe('格式错误')
    expect(label(row).element.style.color).toBe(cssColor(FRESHNESS_PREVIEW_COLORS.fresh.light))
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)

    await commitHex(row, 'rgba(9, 105, 218, 0.5)')
    expect(status(row).text()).toBe('')
    expect(label(row).element.style.color).toBe(cssColor('rgba(9, 105, 218, 0.5)'))
    expect(swatch(row).element.style.backgroundColor).toBe(cssColor('rgba(9, 105, 218, 0.5)'))

    await commitHex(row, GRADIENT)
    expect(label(row).element.style.backgroundImage).toBe(GRADIENT)
    expect(label(row).element.style.backgroundClip).toBe('text')
    expect(swatch(row).element.style.backgroundImage).toBe(GRADIENT)
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: GRADIENT, dark: '' } })

    await commitHex(row, LAYERED_GRADIENT)
    expect(status(row).text()).toBe('格式错误')
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: GRADIENT, dark: '' } })
  })

  it('调色盘：改动只预览，点在别处时保存；再点色块收起；Tab 离开时也保存', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'dark', 'fresh')
    const panel = await openPalette(row)
    expect(picker(row).attributes('aria-expanded')).toBe('true')
    expect(panel.attributes('role')).toBe('dialog')
    expect(labelledBy(panel.element)).toBe('深色 30 天内')
    expect(panel.element.contains(document.activeElement)).toBe(true)
    // 默认颜色按 hex 拆开
    expect(channel(panel, 'hex').element.value).toBe(FRESHNESS_PREVIEW_COLORS.fresh.dark)
    expect(channel(panel, 'a').element.value).toBe('100')

    await setChannel(panel, 'hex', '4493f8')
    expect(hex(row).element.value).toBe('#4493f8')
    expect(label(row).element.style.color).toBe(cssColor('#4493f8'))
    expect(swatch(row).element.style.backgroundColor).toBe(cssColor('#4493f8'))
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)
    await clickOutside()
    expect(hasPalette(row)).toBe(false)
    expect(picker(row).attributes('aria-expanded')).toBe('false')
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '', dark: '#4493f8' } })

    // 再点色块：收起
    await openPalette(row)
    await picker(row).trigger('click')
    await settle()
    expect(hasPalette(row)).toBe(false)

    // Tab 离开：焦点落到调色盘以外的控件
    const again = await openPalette(row)
    await setChannel(again, 'hex', '#ff7b72')
    again.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: hex(row).element }))
    await settle()
    expect(hasPalette(row)).toBe(false)
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: '', dark: '#ff7b72' } })
  })

  it('调色盘：键盘调不透明度、色相、饱和度与明度；透明度写进 hex；Esc 取消并恢复', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'recent')
    const panel = await openPalette(row)
    // #9a6700：色相约 40°，明度约 60%
    await press(slider(panel, '不透明度'), 'ArrowLeft', { shiftKey: true })
    expect(hex(row).element.value).toBe('#9a6700e6')
    expect(slider(panel, '不透明度').attributes('aria-valuetext')).toBe('90%')
    await press(slider(panel, '色相'), 'Home')
    expect(hex(row).element.value).toBe('#9a0000e6')
    expect(slider(panel, '色相').attributes('aria-valuenow')).toBe('0')
    const area = slider(panel, '饱和度与明度')
    await press(area, 'ArrowDown', { shiftKey: true })
    expect(hex(row).element.value).toBe('#800000e6')
    expect(area.attributes('aria-valuetext')).toBe('饱和度 100%，明度 50%')
    await press(area, 'Home')
    expect(hex(row).element.value).toBe('#808080e6')
    // 饱和度为 0 后色相照旧
    expect(slider(panel, '色相').attributes('aria-valuenow')).toBe('0')

    await press(panel, 'Escape')
    expect(hasPalette(row)).toBe(false)
    expect(hex(row).element.value).toBe('')
    expect(document.activeElement).toBe(picker(row).element)
    await settle()
    expect(await savedColors()).toEqual(DEFAULT_FRESHNESS_COLORS)
  })

  it('调色盘：HEX / RGB / HSL 切换写法，数值框改值（越界取边界，非数字恢复）', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'fresh')
    const panel = await openPalette(row)
    await choose(panel, 'color-format', 'RGB')
    expect(hex(row).element.value).toBe('rgb(26, 127, 55)')
    expect(['r', 'g', 'b', 'a'].map(key => channel(panel, key).element.value)).toEqual(['26', '127', '55', '100'])
    expect(channel(panel, 'r').attributes('aria-label')).toBe('红')

    await setChannel(panel, 'a', '50')
    expect(hex(row).element.value).toBe('rgba(26, 127, 55, 0.5)')
    await setChannel(panel, 'r', '300')
    expect(hex(row).element.value).toBe('rgba(255, 127, 55, 0.5)')
    expect(channel(panel, 'r').element.value).toBe('255')
    await setChannel(panel, 'g', 'abc')
    expect(channel(panel, 'g').element.value).toBe('127')
    await press(channel(panel, 'b'), 'ArrowUp', { shiftKey: true })
    expect(hex(row).element.value).toBe('rgba(255, 127, 65, 0.5)')

    await choose(panel, 'color-format', 'HSL')
    expect(['h', 's', 'l', 'a'].map(key => channel(panel, key).element.value)).toEqual(['20', '100', '63', '50'])
    expect(hex(row).element.value).toBe('hsla(20, 100%, 63%, 0.5)')
    await setChannel(panel, 'l', '50')
    expect(hex(row).element.value).toBe('hsla(20, 100%, 50%, 0.5)')

    await clickOutside()
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: 'hsla(20, 100%, 50%, 0.5)', dark: '' } })
    // 再打开：按已存的写法拆开
    const again = await openPalette(row)
    expect(again.get('[data-test="color-format"] .ui-select-label:not(.ui-select-sizer)').text()).toBe('HSL')
    expect(channel(again, 'l').element.value).toBe('50')
  })

  it('调色盘：渐变——由纯色生成，可加减色标、改类型与角度；已有的渐变按原样拆开，色标可用键盘移动、删除', async () => {
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const row = field(scope, 'light', 'fresh')
    const panel = await openPalette(row)
    const gradientMode = panel.get('[data-test="palette-gradient"]')
    expect(panel.get('[data-test="palette-solid"]').attributes('aria-checked')).toBe('true')
    await gradientMode.trigger('click')
    await settle()
    expect(gradientMode.attributes('aria-checked')).toBe('true')
    expect(hex(row).element.value).toMatch(/^linear-gradient\(90deg, #1a7f37 0%, #[0-9a-f]{6} 100%\)$/)
    expect(stops(panel)).toHaveLength(2)
    expect(panel.get<HTMLButtonElement>('[data-test="gradient-remove"]').element.disabled).toBe(true)

    await panel.get('[data-test="gradient-add"]').trigger('click')
    await settle()
    expect(stops(panel)).toHaveLength(3)
    expect(panel.get<HTMLInputElement>('[data-test="gradient-position"]').element.value).toBe('50')
    expect(hex(row).element.value).toMatch(/^linear-gradient\(90deg, #1a7f37 0%, #[0-9a-f]{6} 50%, #[0-9a-f]{6} 100%\)$/)
    await panel.get('[data-test="gradient-remove"]').trigger('click')
    await settle()
    expect(stops(panel)).toHaveLength(2)

    await setInput(panel, 'gradient-angle', '45')
    expect(hex(row).element.value).toMatch(/^linear-gradient\(45deg, /)
    await choose(panel, 'gradient-type', '径向')
    expect(hex(row).element.value).toMatch(/^radial-gradient\(#1a7f37 0%, /)
    expect(panel.find('[data-test="gradient-angle"]').exists()).toBe(false)
    await choose(panel, 'gradient-type', '锥形')
    expect(hex(row).element.value).toMatch(/^conic-gradient\(from 45deg, #1a7f37 0%, /)
    const value = hex(row).element.value
    await clickOutside()
    expect(await savedColors()).toEqual({ ...DEFAULT_FRESHNESS_COLORS, fresh: { light: value, dark: '' } })

    await commitHex(row, 'linear-gradient(90deg, #cf222e, #0969da 80%, rgb(130, 80, 223))')
    const opened = await openPalette(row)
    expect(opened.get('[data-test="palette-gradient"]').attributes('aria-checked')).toBe('true')
    expect(stops(opened).map(stop => stop.attributes('aria-valuetext'))).toEqual(['0%', '80%', '100%'])
    expect(channel(opened, 'hex').element.value).toBe('#cf222e')
    const second = stops(opened)[1]!
    await second.trigger('focus')
    await settle()
    expect(channel(opened, 'hex').element.value).toBe('#0969da')
    await press(second, 'ArrowLeft', { shiftKey: true })
    expect(hex(row).element.value).toBe('linear-gradient(90deg, #cf222e 0%, #0969da 70%, #8250df 100%)')
    await press(second, 'Delete')
    expect(hex(row).element.value).toBe('linear-gradient(90deg, #cf222e 0%, #8250df 100%)')
    // 只剩两个：不再删除
    await press(stops(opened)[0]!, 'Delete')
    expect(stops(opened)).toHaveLength(2)
  })

  it('调色盘：浏览器不能在 light-dark() 里用渐变时只有纯色', async () => {
    const prototype = Object.getPrototypeOf(CSS) as { supports: typeof CSS.supports }
    const supports = vi
      .spyOn(prototype, 'supports')
      .mockImplementation(((property: string, value?: string) => noImageLightDark(property, value ?? '')) as typeof CSS.supports)
    onTestFinished(() => supports.mockRestore())
    await settingsItem.setValue({ ...ZH_SETTINGS, freshness: true })
    const { scope } = await render()
    const panel = await openPalette(field(scope, 'dark', 'stale'))
    expect(panel.find('[role="radiogroup"]').exists()).toBe(false)
    expect(panel.find('[data-test="gradient-track"]').exists()).toBe(false)
    expect(channel(panel, 'hex').element.value).toBe(FRESHNESS_PREVIEW_COLORS.stale.dark)
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
    expect(labels.map(item => item.text())).toEqual(['Within 30 days', 'Within 365 days', 'Older'])
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
