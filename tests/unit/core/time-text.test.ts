import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import {
  createTimeText,
  createZoneWatcher,
  spaceDigits,
  stripLocalZone,
  TIME_UPDATED_EVENT,
  type TimeText,
  zoneProbe
} from '../../../src/core/time-text'
import { FakeRelativeTime, defineFakeRelativeTime, settleTime } from './time-element'

defineFakeRelativeTime()

/** 测试时区（vitest 配置的 TZ，GMT+8）：改了时区的用例结束后改回 */
const TEST_ZONE = 'Asia/Shanghai'
/** 带空格的中文 title（已去掉时区词） */
const SPACED_TITLE = '2026年10月26日 10:03'
/** SpacedTitleTime 的渲染上限 */
const MAX_RENDERS = 10

/** 改系统时区：Node 改 TZ 时重设默认时区，同 Chrome 改系统时区后不刷新的页面 */
function changeZone(zone: string): void {
  process.env.TZ = zone
}

/**
 * 假设元素按中文生成的 title 本身就带空格：title 被改成别的值后视为自定义，移除后重新生成，变化时派发事件。
 * 渲染超过上限后停止，title 被反复移除时用例不会卡住
 */
class SpacedTitleTime extends HTMLElement {
  static observedAttributes = ['title']
  /** 渲染次数 */
  renders = 0
  private customTitle = false
  private updating = false

  connectedCallback(): void {
    this.update()
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    this.customTitle = newValue !== null && newValue !== SPACED_TITLE
    if (this.updating || this.customTitle) return
    this.updating = true
    queueMicrotask(() => {
      this.update()
      this.updating = false
    })
  }

  update(): void {
    if (++this.renders > MAX_RENDERS) return
    const oldTitle = this.getAttribute('title')
    if (!this.customTitle && oldTitle !== SPACED_TITLE) this.setAttribute('title', SPACED_TITLE)
    if (this.getAttribute('title') !== oldTitle) {
      this.dispatchEvent(new Event(TIME_UPDATED_EVENT, { bubbles: true, composed: true }))
    }
  }
}

if (!customElements.get('time-ago')) customElements.define('time-ago', SpacedTitleTime)

/** 元素的 Intl 格式缓存：同 GitHub 现行 relative-time 的 intl-cache，键为 locale 与 JSON.stringify(options)，不含系统时区 */
const intlFormats = new Map<string, Intl.DateTimeFormat>()

// 同 intl-cache：只在 languagechange 时清空
window.addEventListener('languagechange', () => intlFormats.clear())

function cachedFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  let format = intlFormats.get(key)
  if (format === undefined) {
    format = new Intl.DateTimeFormat(locale, options)
    intlFormats.set(key, format)
  }
  return format
}

/** title 的格式（同 relative-time）：zh-CN 2026年10月26日 GMT+8 10:03，zh-TW 2026年10月26日 上午10:03 [GMT+8] */
const TITLE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short'
}
/** 显示文字的格式（超过30天显示日期）：2026年10月26日 */
const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const HOUR_CYCLES: ReadonlySet<string> = new Set(['h11', 'h12', 'h23', 'h24'])

/**
 * 仿 GitHub 现行的 relative-time：用缓存的 Intl 格式把日期渲染进开放 shadowRoot 的 <span part="root">、生成 title。
 * 改了系统时区后缓存的格式仍按旧时区；title 被改成非自身生成的值后视为自定义，移除后复位；文字或 title 变化时派发事件
 */
class IntlTime extends HTMLElement {
  static observedAttributes = ['lang', 'title', 'datetime', 'hour-cycle']
  private customTitle = false
  private updating = false
  private readonly root: ShadowRoot

  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.update()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (name === 'title') this.customTitle = newValue !== null && this.formatTitle() !== newValue
    if (this.updating || (name === 'title' && this.customTitle)) return
    this.updating = true
    queueMicrotask(() => {
      this.update()
      this.updating = false
    })
  }

  /** 定时刷新：元素按间隔重新渲染 */
  tick(): void {
    this.update()
  }

  private locale(): string {
    return this.closest('[lang]')?.getAttribute('lang') || 'en'
  }

  private time(): number {
    return Date.parse(this.getAttribute('datetime') ?? '')
  }

  private formatTitle(): string {
    const cycle = this.getAttribute('hour-cycle') ?? ''
    const hourCycle = HOUR_CYCLES.has(cycle) ? (cycle as Intl.DateTimeFormatOptions['hourCycle']) : undefined
    return cachedFormat(this.locale(), { ...TITLE_OPTIONS, hourCycle }).format(this.time())
  }

  update(): void {
    let span = this.root.firstElementChild
    if (!span) {
      span = document.createElement('span')
      span.setAttribute('part', 'root')
      this.root.replaceChildren(span)
    }
    const oldText = span.textContent ?? ''
    const oldTitle = this.getAttribute('title') ?? ''
    let newTitle = oldTitle
    if (!this.customTitle) {
      newTitle = this.formatTitle()
      this.setAttribute('title', newTitle)
    }
    const newText = cachedFormat(this.locale(), DATE_OPTIONS).format(this.time())
    if (newText !== oldText) span.textContent = newText
    if (newText !== oldText || newTitle !== oldTitle) {
      this.dispatchEvent(new Event(TIME_UPDATED_EVENT, { bubbles: true, composed: true }))
    }
  }
}

if (!customElements.get('local-time')) customElements.define('local-time', IntlTime)

/** 各用例创建的实例：结束时 detach，断言失败也不留下监听 */
const created: TimeText[] = []

afterEach(() => {
  for (const timeText of created.splice(0)) timeText.detach()
  document.body.innerHTML = ''
  if (process.env.TZ !== TEST_ZONE) changeZone(TEST_ZONE)
  intlFormats.clear()
  vi.restoreAllMocks()
})

function mount(html = '<relative-time datetime="2026-10-26T02:03:00Z"></relative-time>'): FakeRelativeTime {
  document.body.innerHTML = html
  return document.querySelector('relative-time') as FakeRelativeTime
}

function create(owns: (element: Element) => boolean = () => true): TimeText {
  const timeText = createTimeText(document, owns)
  created.push(timeText)
  return timeText
}

/** 失效实例（Firefox 更新、停用扩展时直接销毁，不还原）留下中文 lang 与补过空格的 title；新实例没有它的记录 */
async function leftover(): Promise<FakeRelativeTime> {
  const time = mount()
  const dead = create()
  dead.attach()
  time.setAttribute('lang', 'zh-CN')
  await settleTime()
  dead.detach()
  return time
}

describe('spaceDigits', () => {
  it.each([
    ['3天前', '3天前'],
    ['约1年前', '约1年前'],
    ['2026年10月26日 GMT+8 10:03', '2026年10月26日 GMT+8 10:03'],
    ['上午10:03', '上午10:03'],
    ['3小时5分钟', '3小时5分钟'],
    ['昨天', '昨天'],
    ['3 days ago', '3 days ago']
  ])('%s → %s', (input, expected) => {
    expect(spaceDigits(input)).toBe(expected)
  })
})

describe('stripLocalZone', () => {
  /** 2026-10-07 15:06（测试时区 GMT+8） */
  const time = Date.parse('2026-10-07T07:06:00Z')

  it.each([
    ['2026年10月7日 GMT+8 15:06', '2026年10月7日 15:06'],
    ['2026年10月7日 下午3:06 [GMT+8]', '2026年10月7日 下午3:06'],
    ['GMT+8 15:06', '15:06'],
    ['2026年10月7日 GMT-7 15:06', '2026年10月7日 GMT-7 15:06'],
    ['2026年10月7日 GMT+10 15:06', '2026年10月7日 GMT+10 15:06'],
    ['2026年10月7日 下午3:06 [GMT+5:30]', '2026年10月7日 下午3:06 [GMT+5:30]'],
    ['2026年10月7日 上午12:06 [PDT]', '2026年10月7日 上午12:06 [PDT]'],
    ['2026年10月7日 UTC 07:06', '2026年10月7日 UTC 07:06'],
    ['2026年10月7日 XYZ 15:06', '2026年10月7日 XYZ 15:06'],
    ['3天前', '3天前']
  ])('%s → %s', (text, expected) => {
    expect(stripLocalZone(text, time)).toBe(expected)
  })

  it.each([
    ['Etc/UTC', '2026年10月7日 UTC 07:06', '2026年10月7日 07:06'],
    ['Europe/London', '2026年10月7日 GMT+1 08:06', '2026年10月7日 08:06'],
    ['America/Los_Angeles', '2026年10月7日 上午12:06 [PDT]', '2026年10月7日 上午12:06'],
    ['America/Adak', '2026年10月6日 下午10:06 [HADT]', '2026年10月6日 下午10:06'],
    ['Asia/Kolkata', '2026年10月7日 GMT+5:30 12:36', '2026年10月7日 12:36']
  ])('本地时区为 %s：%s → %s', (zone, text, expected) => {
    changeZone(zone)
    expect(stripLocalZone(text, time)).toBe(expected)
  })

  it('按调用时的系统时区判断：改了时区后，旧时区写法保留、新时区写法去掉', () => {
    changeZone('Asia/Tokyo')
    expect(stripLocalZone('2026年10月7日 GMT+8 15:06', time)).toBe('2026年10月7日 GMT+8 15:06')
    expect(stripLocalZone('2026年10月7日 GMT+9 16:06', time)).toBe('2026年10月7日 16:06')
  })

  it('零时区的两种写法（GMT+0、GMT）：本地为 Europe/London 冬令时时去掉', () => {
    changeZone('Europe/London')
    const winter = Date.parse('2026-01-07T07:06:00Z')
    expect(stripLocalZone('2026年1月7日 GMT+0 07:06', winter)).toBe('2026年1月7日 07:06')
    expect(stripLocalZone('2026年1月7日 上午7:06 [GMT]', winter)).toBe('2026年1月7日 上午7:06')
  })
})

describe('createZoneWatcher', () => {
  it('窗口获得焦点、页面重新可见时比较时区探针，变化时回调；stop 后不再回调', () => {
    const onChange = vi.fn()
    const watcher = createZoneWatcher(document, onChange)
    watcher.start()
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
    expect(onChange).not.toHaveBeenCalled()

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
    expect(onChange).toHaveBeenCalledTimes(1)
    changeZone(TEST_ZONE)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(onChange).toHaveBeenCalledTimes(2)

    watcher.stop()
    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('focus'))
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('偏移相同、时区名不同也算变化（探针含 IANA 时区名）', () => {
    const before = zoneProbe()
    changeZone('Asia/Singapore')
    expect(zoneProbe()).not.toBe(before)
  })

  it('多个监听收到同一次事件：只读一次探针，各自与记下的探针比较', () => {
    const first = vi.fn()
    const second = vi.fn()
    for (const watcher of [createZoneWatcher(document, first), createZoneWatcher(document, second)]) {
      watcher.start()
      onTestFinished(() => watcher.stop())
    }
    const intl = vi.spyOn(Intl, 'DateTimeFormat')
    const offset = vi.spyOn(Date.prototype, 'getTimezoneOffset')

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))

    // 每次事件一次：Intl 一次，getTimezoneOffset 两次（1月、7月）
    expect(intl).toHaveBeenCalledTimes(2)
    expect(offset).toHaveBeenCalledTimes(4)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('check：不等事件立即比较，变化时回调；未开始监听时不比较', () => {
    const onChange = vi.fn()
    const watcher = createZoneWatcher(document, onChange)
    onTestFinished(() => watcher.stop())

    changeZone('Asia/Tokyo')
    watcher.check()
    expect(onChange).not.toHaveBeenCalled()

    watcher.start()
    watcher.check()
    expect(onChange).not.toHaveBeenCalled()
    changeZone(TEST_ZONE)
    watcher.check()
    window.dispatchEvent(new Event('focus'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('createTimeText', () => {
  it('元素渲染后改写 shadowRoot 文字与 title；再次渲染后重新改写', async () => {
    const time = mount()
    create().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('3天前')
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
    time.tick()
    expect(time.renderedText).toBe('3天前')
  })

  it('owns 为 false 时不改写', async () => {
    const time = mount()
    create(() => false).attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('3天前')
    expect(time.getAttribute('title')).toBe('2026年10月26日 GMT+8 10:03')
  })

  it('detach 后不再改写', async () => {
    const time = mount()
    const timeText = create()
    timeText.attach()
    timeText.detach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('3天前')
  })

  it('sync 立即改写已渲染的元素', async () => {
    const time = mount()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    create().sync(time)
    expect(time.renderedText).toBe('3天前')
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
  })

  it('restore 移除改写过的 title，元素按当前 lang 重新生成', async () => {
    const time = mount()
    const timeText = create(element => element.getAttribute('lang') === 'zh-CN')
    timeText.attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    time.setAttribute('lang', 'en')
    timeText.restore(time)
    await settleTime()
    expect(time.renderedText).toBe('3 days ago')
    expect(time.getAttribute('title')).toBe('Oct 26, 2026, 10:03 AM GMT+8')
  })

  it('restore 不动未改写或已被页面改掉的 title', async () => {
    const plain = mount('<relative-time title="Close"></relative-time>')
    const timeText = create()
    timeText.restore(plain)
    expect(plain.getAttribute('title')).toBe('Close')
    const time = mount()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    timeText.sync(time)
    time.setAttribute('title', '页面自定义1')
    timeText.restore(time)
    expect(time.getAttribute('title')).toBe('页面自定义1')
  })

  it('datetime 变化：移除改写过的 title，元素按新日期重新生成后再补空格', async () => {
    const time = mount()
    create().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('datetime 变化、显示文字不变（元素不派发事件）：title 同样更新', async () => {
    const time = mount('<relative-time datetime="2026-10-28T02:03:00Z"></relative-time>')
    create().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('昨天')
    time.setAttribute('datetime', '2026-10-28T07:20:00Z')
    await settleTime()
    expect(time.renderedText).toBe('昨天')
    expect(time.getAttribute('title')).toBe('2026年10月28日 15:20')
  })

  it('datetime 写回同一时刻（含换种写法）、元素定时刷新：不移除 title', async () => {
    const time = mount()
    create().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    const removeAttribute = vi.spyOn(time, 'removeAttribute')
    time.setAttribute('datetime', '2026-10-26T02:03:00Z')
    time.setAttribute('datetime', '2026-10-26T02:03:00.000Z')
    time.tick()
    await settleTime()
    expect(removeAttribute).not.toHaveBeenCalled()
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
  })

  it('页面改了 title 后 datetime 变化：保留页面的值', async () => {
    const time = mount()
    create().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    time.setAttribute('title', 'Sample title')
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('Sample title')
  })

  it('detach 后不再处理 datetime 变化', async () => {
    const time = mount()
    const timeText = create()
    timeText.attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    timeText.detach()
    const removeAttribute = vi.spyOn(time, 'removeAttribute')
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(removeAttribute).not.toHaveBeenCalled()
  })

  it('detach 后再 attach：此前改写的 title 在 datetime 变化后的渲染中更新', async () => {
    const time = mount()
    const timeText = create()
    timeText.attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    timeText.detach()
    timeText.attach()
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('失效实例留下的 title，期间 datetime 变化：新实例 sync 后 title 按新日期', async () => {
    const time = await leftover()
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    // 元素把补过空格的 title 当作自定义值，不随 datetime 重新生成
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
    const timeText = create()
    timeText.attach()
    timeText.sync(time)
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('失效实例留下的 title、datetime 未变：新实例 sync 后 title 不变，之后 datetime 变化照常更新', async () => {
    const time = await leftover()
    const timeText = create()
    timeText.attach()
    timeText.sync(time)
    await settleTime()
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('失效实例留下的 title 在渲染中（事件路径）首次遇到：等这次渲染结束再移除，title 按新日期', async () => {
    const time = await leftover()
    create().attach()
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('旧版本留下的带本地时区的 title：同样当作改写过的移除，按新写法重新生成', async () => {
    const time = mount()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    time.setAttribute('title', '2026年10月26日 GMT+8 10:03')
    time.setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    const timeText = create()
    timeText.attach()
    timeText.sync(time)
    await settleTime()
    expect(time.renderedText).toBe('7天前')
    expect(time.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('失效实例留下的 title 在移除前被页面改掉：保留页面的值', async () => {
    const time = await leftover()
    const timeText = create()
    timeText.attach()
    timeText.sync(time)
    time.setAttribute('title', 'Sample title')
    await settleTime()
    expect(time.getAttribute('title')).toBe('Sample title')
  })

  it('克隆体带着补过空格的 title、插入前改了 datetime：渲染后 title 按新日期', async () => {
    const time = mount()
    create().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    const clone = time.cloneNode(true) as FakeRelativeTime
    clone.setAttribute('datetime', '2026-10-22T02:03:00Z')
    time.replaceWith(clone)
    await settleTime()
    expect(clone.renderedText).toBe('7天前')
    expect(clone.getAttribute('title')).toBe('2026年10月22日 10:03')
  })

  it('元素按中文生成的 title 本身就带空格（假设）：只移除一次，不反复渲染', async () => {
    document.body.innerHTML = '<time-ago lang="zh-CN"></time-ago>'
    const time = document.querySelector('time-ago') as SpacedTitleTime
    await settleTime()
    const renders = time.renders
    const timeText = create()
    timeText.attach()
    timeText.sync(time)
    await settleTime()
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
    expect(time.renders - renders).toBe(1)
  })

  it('不处理非时间元素派发的同名事件', () => {
    document.body.innerHTML = '<span title="3天前"></span>'
    const span = document.querySelector('span')!
    create().attach()
    span.dispatchEvent(new Event(TIME_UPDATED_EVENT, { bubbles: true, composed: true }))
    expect(span.getAttribute('title')).toBe('3天前')
  })
})

/**
 * 改了系统时区、页面不刷新（Chrome 重设默认时区）。元素同 GitHub 现行的 relative-time，按 lang 与选项缓存 Intl 格式：
 * 缓存的格式仍按旧时区生成，新建的格式（缓存清空后）按新时区
 */
/** 自定义时间格式的写法与元素的 lang（改了之后 sync 生效） */
const custom = { pattern: '', lang: 'zh-CN' }

function createCustom(owns: (element: Element) => boolean = () => true): TimeText {
  const timeText = createTimeText(document, owns, { pattern: () => custom.pattern, lang: () => custom.lang })
  created.push(timeText)
  return timeText
}

describe('自定义时间格式', () => {
  afterEach(() => {
    custom.pattern = ''
    custom.lang = 'zh-CN'
  })

  it('元素渲染后显示为按写法写出的时刻（本地时区），title 照常补空格；定时刷新后仍按写法', async () => {
    custom.pattern = 'YYYY-MM-DD HH:mm'
    const time = mount()
    createCustom().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('2026-10-26 10:03')
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
    time.tick()
    expect(time.renderedText).toBe('2026-10-26 10:03')
  })

  it.each(['duration', 'elapsed'])('format="%s"（时长）：不按写法，照常补空格', async format => {
    custom.pattern = 'YYYY-MM-DD'
    const time = mount(`<relative-time format="${format}" datetime="2026-10-26T02:03:00Z"></relative-time>`)
    createCustom().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('3天前')
  })

  it('日期无效：不按写法，保留元素渲染的文字', async () => {
    custom.pattern = 'YYYY-MM-DD'
    const time = mount('<relative-time datetime="not a date"></relative-time>')
    createCustom().attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).not.toBe('')
    expect(time.renderedText).not.toMatch(/\d{4}-/)
  })

  it('改了写法后 sync：按新写法；改回默认后 sync：恢复元素渲染的文字并补空格', async () => {
    custom.pattern = 'YYYY-MM-DD'
    const time = mount()
    const timeText = createCustom()
    timeText.attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('2026-10-26')
    custom.pattern = 'M/D HH:mm'
    timeText.sync(time)
    expect(time.renderedText).toBe('10/26 10:03')
    custom.pattern = ''
    timeText.sync(time)
    expect(time.renderedText).toBe('3天前')
    time.tick()
    expect(time.renderedText).toBe('3天前')
  })

  it('默认改为自定义后 sync：按写法；之后元素重新渲染也按写法', async () => {
    const time = mount()
    const timeText = createCustom()
    timeText.attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time.renderedText).toBe('3天前')
    custom.pattern = 'HH:mm'
    timeText.sync(time)
    expect(time.renderedText).toBe('10:03')
    time.tick()
    expect(time.renderedText).toBe('10:03')
  })

  it('restore：写回元素自己渲染的文字；lang 还原后元素按原语言重新渲染', async () => {
    custom.pattern = 'YYYY-MM-DD'
    const time = mount()
    const timeText = createCustom(element => element.getAttribute('lang') === 'zh-CN')
    timeText.attach()
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    timeText.restore(time)
    expect(time.renderedText).toBe('3天前')
    time.setAttribute('lang', 'en')
    await settleTime()
    expect(time.renderedText).toBe('3 days ago')
  })

  it('restore：元素已重新渲染（文字不是写入的）时不动', async () => {
    custom.pattern = 'YYYY-MM-DD'
    const time = mount()
    const timeText = createCustom(() => false)
    time.setAttribute('lang', 'zh-CN')
    await settleTime()
    timeText.restore(time)
    expect(time.renderedText).toBe('3天前')
  })

  it('繁体：星期的简称用「週」；元素设了 time-zone 时按该时区', async () => {
    custom.pattern = 'ddd HH:mm Z'
    custom.lang = 'zh-TW'
    const time = mount('<relative-time time-zone="UTC" datetime="2026-10-26T02:03:00Z"></relative-time>')
    createCustom().attach()
    time.setAttribute('lang', 'zh-TW')
    await settleTime()
    expect(time.renderedText).toBe('週一 02:03 +00:00')
  })
})

describe('改了系统时区', () => {
  const ZH_CN_TIME = '<local-time lang="zh-CN" hour-cycle="h23" datetime="2026-10-26T02:03:00Z"></local-time>'
  const ZH_TW_TIME = '<local-time lang="zh-TW" hour-cycle="h12" datetime="2026-10-26T02:03:00Z"></local-time>'

  /** 先开始监听再插入：元素连接时渲染并派发事件 */
  function mountIntl(html = ZH_CN_TIME): IntlTime {
    document.body.innerHTML = html
    return document.querySelector('local-time') as IntlTime
  }

  it('改写过的 title：窗口获得焦点时复位，元素沿用缓存的格式（旧时区）时保留时区', async () => {
    create().attach()
    const time = mountIntl()
    await settleTime()
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('focus'))
    await settleTime()

    expect(time.getAttribute('title')).toBe('2026年10月26日 GMT+8 10:03')
  })

  it('元素的格式缓存清空后（新建格式）：按新时区重新生成，去掉本地时区', async () => {
    create().attach()
    const time = mountIntl()
    await settleTime()

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('languagechange'))
    window.dispatchEvent(new Event('focus'))
    await settleTime()

    expect(time.getAttribute('title')).toBe('2026年10月26日 11:03')
  })

  it('不定时刷新的元素：页面重新可见时同样复位', async () => {
    create().attach()
    const time = mountIntl()
    await settleTime()

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('languagechange'))
    document.dispatchEvent(new Event('visibilitychange'))
    await settleTime()

    expect(time.getAttribute('title')).toBe('2026年10月26日 11:03')
  })

  it('元素定时刷新：渲染时发现本地偏移已变，等这次渲染结束后复位', async () => {
    create().attach()
    const time = mountIntl()
    await settleTime()

    changeZone('Asia/Tokyo')
    time.tick()
    await settleTime()

    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
    expect(time.shadowRoot?.textContent).toBe('2026年10月26日')
  })

  it('sync 时发现本地偏移已变：移除改写过的 title，元素重新生成后再改写', async () => {
    const timeText = create()
    timeText.attach()
    const time = mountIntl()
    await settleTime()

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('languagechange'))
    timeText.sync(time)
    await settleTime()

    expect(time.getAttribute('title')).toBe('2026年10月26日 11:03')
  })

  it.each([
    ['zh-CN', ZH_CN_TIME, '2026年10月26日 GMT+8 10:03', '2026年10月26日 11:03'],
    ['zh-TW', ZH_TW_TIME, '2026年10月26日 上午10:03 [GMT+8]', '2026年10月26日 上午11:03']
  ])('改时区后插入的 %s 元素：沿用缓存的格式时保留时区，新建的格式按新时区去掉', async (_lang, html, cached, fresh) => {
    create().attach()
    mountIntl(html)
    await settleTime()
    changeZone('Asia/Tokyo')

    const cachedTime = mountIntl(html)
    await settleTime()
    const cachedTitle = cachedTime.getAttribute('title')
    window.dispatchEvent(new Event('languagechange'))
    const freshTime = mountIntl(html)
    await settleTime()

    expect(cachedTitle).toBe(cached)
    expect(freshTime.getAttribute('title')).toBe(fresh)
  })

  it('时区没变：获得焦点、页面重新可见不移除 title', async () => {
    create().attach()
    const time = mountIntl()
    await settleTime()
    const removeAttribute = vi.spyOn(time, 'removeAttribute')

    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
    await settleTime()

    expect(removeAttribute).not.toHaveBeenCalled()
    expect(time.getAttribute('title')).toBe('2026年10月26日 10:03')
  })

  it('detach 后不再检查时区', async () => {
    const timeText = create()
    timeText.attach()
    const time = mountIntl()
    await settleTime()
    timeText.detach()
    const removeAttribute = vi.spyOn(time, 'removeAttribute')

    changeZone('Asia/Tokyo')
    window.dispatchEvent(new Event('focus'))
    await settleTime()

    expect(removeAttribute).not.toHaveBeenCalled()
  })
})
