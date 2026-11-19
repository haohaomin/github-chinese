import { enableAutoUnmount, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import '../../../src/entrypoints/options/options.css'
import { getSettings, settingsItem, updateSettings, type Settings } from '../../../src/shared/settings'
import { mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const App = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

enableAutoUnmount(afterEach)

/** 预览用的时刻：本地（GMT+8）2026-10-26 10:03:09，周一 */
const NOW = Date.parse('2026-10-26T02:03:09Z')
/** 输入停顿多久后保存 */
const SAVE_DELAY_MS = 400

async function render(settings: Partial<Settings> = {}): Promise<VueWrapper> {
  await settingsItem.setValue({ ...ZH_SETTINGS, ...settings })
  const wrapper = mount(required(App), { attachTo: document.body })
  await settle()
  return wrapper
}

function section(wrapper: VueWrapper): DOMWrapper<Element> {
  const found = wrapper.findAll('section').find(item => item.find('h2').text() === '时间格式')
  if (!found) throw new Error('未找到分区：时间格式')
  return found
}

function modeSelect(wrapper: VueWrapper): Omit<DOMWrapper<Element>, 'exists'> {
  return section(wrapper).get('[data-test="time-format"]')
}

function modeOptions(wrapper: VueWrapper): DOMWrapper<Element>[] {
  const id = modeSelect(wrapper).attributes('aria-controls') ?? ''
  return wrapper.get(`#${CSS.escape(id)}`).findAll('[role="option"]')
}

function selectedMode(wrapper: VueWrapper): string | undefined {
  return modeOptions(wrapper)
    .find(option => option.attributes('aria-selected') === 'true')
    ?.text()
}

async function chooseMode(wrapper: VueWrapper, label: string): Promise<void> {
  await modeSelect(wrapper).trigger('click')
  const option = modeOptions(wrapper).find(item => item.text() === label)
  if (!option) throw new Error(`未找到选项：${label}`)
  await option.trigger('click')
  await settle()
}

/** 输入（只派发 input；setValue 还会派发 change，即失去焦点） */
async function type(input: DOMWrapper<HTMLInputElement>, value: string): Promise<void> {
  input.element.value = value
  await input.trigger('input')
}

/** 写法输入框；不显示时为 undefined */
function patternInput(wrapper: VueWrapper): DOMWrapper<HTMLInputElement> | undefined {
  const found = section(wrapper).find<HTMLInputElement>('[data-test="time-format-pattern"]')
  return found.exists() ? found : undefined
}

/** 预览文字；不显示时为 undefined */
function previewText(wrapper: VueWrapper): string | undefined {
  const found = section(wrapper).find('[data-test="time-format-preview"]')
  return found.exists() ? found.text() : undefined
}

/** 格式符说明表：每行为 [格式符, 含义, 示例] */
function referenceRows(wrapper: VueWrapper): string[][] {
  return wrapper.findAll('[data-test="format-reference-row"]').map(row => row.findAll('dt, dd, span').map(cell => cell.text()))
}

async function savedPattern(): Promise<string> {
  return (await getSettings()).customTimeFormat
}

describe.skipIf(!App)('设置页：时间格式', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.3')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    clearToasts()
  })

  it('默认为「默认」，可选默认、自定义；下拉框以分区标题为名；不显示写法', async () => {
    const wrapper = await render()
    expect(modeOptions(wrapper).map(option => option.text())).toEqual(['默认', '自定义'])
    expect(selectedMode(wrapper)).toBe('默认')
    expect(modeSelect(wrapper).attributes('aria-labelledby')).toBe(section(wrapper).get('h2').attributes('id'))
    expect(patternInput(wrapper)).toBeUndefined()
    expect(previewText(wrapper)).toBeUndefined()
  })

  it('选自定义：即时保存，显示写法与按写法写出的当前时刻；选回默认时隐藏', async () => {
    const wrapper = await render()
    await chooseMode(wrapper, '自定义')
    expect((await getSettings()).timeFormat).toBe('custom')
    const input = patternInput(wrapper)!
    expect(input.element.value).toBe('YYYY-MM-DD HH:mm')
    expect(input.attributes('aria-label')).toBe('格式')
    expect(input.attributes('placeholder')).toBe('YYYY-MM-DD HH:mm')
    expect(input.attributes('maxlength')).toBe('64')
    expect(previewText(wrapper)).toBe('2026-10-26 10:03')
    await chooseMode(wrapper, '默认')
    expect((await getSettings()).timeFormat).toBe('default')
    expect(patternInput(wrapper)).toBeUndefined()
  })

  it('输入写法：预览立即更新；停顿后保存，去掉首尾空白，输入框不变；清空时不显示预览', async () => {
    const wrapper = await render({ timeFormat: 'custom' })
    const input = patternInput(wrapper)!
    await type(input, ' ddd HH:mm:ss ')
    expect(previewText(wrapper)).toBe('周一 10:03:09')
    vi.advanceTimersByTime(SAVE_DELAY_MS - 1)
    await settle()
    expect(await savedPattern()).toBe('YYYY-MM-DD HH:mm')
    vi.advanceTimersByTime(1)
    await settle()
    expect(await savedPattern()).toBe('ddd HH:mm:ss')
    expect(input.element.value).toBe(' ddd HH:mm:ss ')
    await type(input, '')
    expect(previewText(wrapper)).toBeUndefined()
    vi.advanceTimersByTime(SAVE_DELAY_MS)
    await settle()
    expect(await savedPattern()).toBe('')
  })

  it('失去焦点、按 Enter（change）：立即保存', async () => {
    const wrapper = await render({ timeFormat: 'custom' })
    const input = patternInput(wrapper)!
    await type(input, 'YYYY/M/D')
    await input.trigger('change')
    await settle()
    expect(await savedPattern()).toBe('YYYY/M/D')
  })

  it('离开页面时有未保存的输入：立即保存', async () => {
    const wrapper = await render({ timeFormat: 'custom' })
    await type(patternInput(wrapper)!, 'HH:mm')
    wrapper.unmount()
    await settle()
    expect(await savedPattern()).toBe('HH:mm')
  })

  it('设置在别处改了（其他页面、导入备份）：选项、写法与预览跟着变', async () => {
    const wrapper = await render()
    await updateSettings({ timeFormat: 'custom', customTimeFormat: 'M月D日 dddd' })
    await settle()
    expect(selectedMode(wrapper)).toBe('自定义')
    expect(patternInput(wrapper)!.element.value).toBe('M月D日 dddd')
    expect(previewText(wrapper)).toBe('10月26日 星期一')
  })

  it('页面语言为繁体：预览按繁体', async () => {
    const wrapper = await render({ language: 'zh-TW', timeFormat: 'custom', customTimeFormat: 'ddd A h:mm' })
    expect(previewText(wrapper)).toBe('週一 上午 10:03')
  })

  it('格式符说明表：始终显示，选自定义前后一样；示例为本地 2026-01-05 09:05:08.007（周一）', async () => {
    const wrapper = await render()
    const before = referenceRows(wrapper)
    await chooseMode(wrapper, '自定义')
    const rows = referenceRows(wrapper)
    expect(before).toEqual(rows)
    expect(rows[0]).toEqual(['YYYY', '年（四位）', '2026'])
    expect(rows).toContainEqual(['M / MM', '月', '1 / 01'])
    expect(rows).toContainEqual(['H / HH', '时（24 小时制）', '9 / 09'])
    expect(rows).toContainEqual(['SSS', '毫秒', '007'])
    expect(rows).toContainEqual(['ddd', '星期（短）', '周一'])
    expect(rows).toContainEqual(['Z / ZZ', '时区偏移', '+08:00 / +0800'])
    expect(rows.at(-1)).toEqual(['[文字]', '原样输出', '[今天] → 今天'])
  })

  it('格式符说明表：含义随界面语言（英文），示例按翻译语言（繁体）', async () => {
    const wrapper = await render({ uiLanguage: 'en', language: 'zh-TW', timeFormat: 'custom' })
    const rows = referenceRows(wrapper)
    expect(rows).toContainEqual(['YY', 'Year (2 digits)', '26'])
    expect(rows).toContainEqual(['ddd', 'Weekday (short)', '週一'])
    expect(rows).toContainEqual(['A / a', 'AM / PM', '上午'])
    expect(rows.at(-1)).toEqual(['[text]', 'Literal text', '[today] → today'])
  })
})
