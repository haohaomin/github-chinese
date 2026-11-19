import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createFreshness,
  FRESHNESS_ATTRIBUTE,
  freshnessOf,
  freshnessStyle,
  type FreshnessConfig,
  type FreshnessMarker
} from '../../../src/core/freshness'
import {
  DEFAULT_FRESHNESS_RANGES,
  emptyRange,
  FRESH_DAYS,
  RECENT_DAYS,
  type FreshnessPaint,
  type FreshnessRange,
  type FreshnessRanges
} from '../../../src/shared/freshness'
import { GRADIENT, imageLightDark, LAYERED_GRADIENT, noImageLightDark } from '../shared/fake-css'

const NOW = Date.parse('2026-11-09T12:00:00Z')
const DAY = 24 * 60 * 60 * 1000
const DAYS = [FRESH_DAYS, RECENT_DAYS]

function ago(days: number): string {
  return new Date(NOW - days * DAY).toISOString()
}

/** 文件列表的一行（同 GitHub 的 React 目录列表） */
function row(name: string, datetime: string): string {
  return (
    `<tr class="react-directory-row"><td><a href="/vuejs/core/tree/main/${name}">${name}</a></td>` +
    `<td><div class="react-directory-commit-age"><relative-time id="${name}" datetime="${datetime}">Sample text</relative-time></div></td></tr>`
  )
}

/** 存储库首页：最近一次提交（窄屏、宽屏各一处）、文件列表，另有侧栏发行版的时间 */
function page(): string {
  return `
<div data-testid="latest-commit"><span><relative-time id="latest-small" datetime="${ago(2)}">Sample text</relative-time></span></div>
<div data-testid="latest-commit-details"><span><relative-time id="latest-wide" datetime="${ago(2)}">Sample text</relative-time></span></div>
<div data-testid="directory-content"><table><tbody>
  ${row('packages', ago(0.5))}
  ${row('scripts', ago(FRESH_DAYS + 1))}
  ${row('LICENSE', ago(RECENT_DAYS + 1))}
</tbody></table></div>
<aside><relative-time id="release" datetime="${ago(1)}">Sample text</relative-time></aside>`
}

function level(id: string): string | null {
  return document.getElementById(id)!.getAttribute(FRESHNESS_ATTRIBUTE)
}

function styleCount(): number {
  return document.querySelectorAll('style#gcn-freshness-style').length
}

async function flush(): Promise<void> {
  await new Promise(done => setTimeout(done, 0))
}

function styleText(): string {
  return document.getElementById('gcn-freshness-style')?.textContent ?? ''
}

/** 颜色：文字、背景（浅色、深色） */
function paint(text: readonly string[] = [], background: readonly string[] = []): FreshnessPaint {
  return { text: { light: text[0] ?? '', dark: text[1] ?? '' }, background: { light: background[0] ?? '', dark: background[1] ?? '' } }
}

function range(days: number, text?: readonly string[], background?: readonly string[]): FreshnessRange {
  return { days, ...paint(text, background) }
}

function ranges(list: readonly FreshnessRange[], stale: FreshnessPaint = paint()): FreshnessRanges {
  return { ranges: list, stale }
}

let active = true
let config: FreshnessConfig = { ranges: DEFAULT_FRESHNESS_RANGES, background: false }
let marker: FreshnessMarker | undefined

function start(): FreshnessMarker {
  marker = createFreshness(document, { active: () => active, config: () => config, now: () => NOW })
  return marker
}

beforeEach(() => {
  active = true
  config = { ranges: DEFAULT_FRESHNESS_RANGES, background: false }
})

afterEach(() => {
  marker?.stop()
  marker = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('freshnessOf', () => {
  it.each<[string, string | null, number | 'stale' | undefined]>([
    ['刚刚', ago(0), 0],
    [`${FRESH_DAYS} 天前`, ago(FRESH_DAYS), 0],
    [`${FRESH_DAYS} 天多一点`, new Date(NOW - FRESH_DAYS * DAY - 1).toISOString(), 1],
    [`${RECENT_DAYS} 天前`, ago(RECENT_DAYS), 1],
    [`${RECENT_DAYS} 天多一点`, new Date(NOW - RECENT_DAYS * DAY - 1).toISOString(), 'stale'],
    ['5 年前', ago(5 * 365), 'stale'],
    ['晚于当前（时钟偏差）', ago(-1), 0],
    ['无效', 'Sample text', undefined],
    ['没有', null, undefined]
  ])('%s → %s', (_, datetime, expected) => {
    expect(freshnessOf(datetime, NOW, DAYS)).toBe(expected)
  })

  it('多个时段：按天数依次落入', () => {
    const days = [1, 7, 30, 365]
    expect([ago(0.5), ago(3), ago(10), ago(100), ago(400)].map(time => freshnessOf(time, NOW, days))).toEqual([0, 1, 2, 3, 'stale'])
  })
})

describe('更新时间着色', () => {
  it('文件列表各项、最近一次提交按距今远近标记；其他地方的时间不标', () => {
    document.body.innerHTML = page()
    start()
    expect([level('packages'), level('scripts'), level('LICENSE')]).toEqual(['0', '1', 'stale'])
    expect([level('latest-small'), level('latest-wide')]).toEqual(['0', '0'])
    expect(level('release')).toBeNull()
    expect(styleCount()).toBe(1)
    expect(styleText()).toBe(freshnessStyle(config))
  })

  it('后来出现的行（软导航、展开目录）也标；React 复用节点换了时间时重标', async () => {
    document.body.innerHTML = page()
    start()
    document.querySelector('tbody')!.insertAdjacentHTML('beforeend', row('docs', ago(3)))
    await flush()
    expect(level('docs')).toBe('0')
    document.getElementById('docs')!.setAttribute('datetime', ago(RECENT_DAYS * 2))
    await flush()
    expect(level('docs')).toBe('stale')
    document.getElementById('docs')!.setAttribute('datetime', 'Sample text')
    await flush()
    expect(level('docs')).toBeNull()
    document.getElementById('LICENSE')!.setAttribute('datetime', ago(100))
    await flush()
    expect(level('LICENSE')).toBe('1')
    expect(styleCount()).toBe(1)
  })

  it('关闭：不标；开启后刷新补上，再关闭时移除', () => {
    document.body.innerHTML = page()
    active = false
    const instance = start()
    expect(level('packages')).toBeNull()
    expect(styleCount()).toBe(0)
    active = true
    instance.refresh()
    expect(level('packages')).toBe('0')
    active = false
    instance.refresh()
    expect(document.querySelectorAll(`[${FRESHNESS_ATTRIBUTE}]`)).toHaveLength(0)
    expect(styleCount()).toBe(0)
  })

  it('时段、颜色变了：刷新时重新标记、换成新的样式，不重复添加', () => {
    document.body.innerHTML = page()
    const instance = start()
    config = { ranges: ranges([range(1), range(FRESH_DAYS + 7, ['#59636e', ''])]), background: true }
    instance.refresh()
    expect([level('packages'), level('scripts'), level('LICENSE')]).toEqual(['0', '1', 'stale'])
    config = { ranges: ranges([range(1)]), background: false }
    instance.refresh()
    expect([level('packages'), level('scripts'), level('LICENSE')]).toEqual(['0', 'stale', 'stale'])
    expect(styleCount()).toBe(1)
    expect(styleText()).toBe(freshnessStyle(config))
  })

  it('没有文件列表的页面：不加样式', () => {
    document.body.innerHTML = '<aside><relative-time datetime="2026-11-08T00:00:00Z">Sample text</relative-time></aside>'
    start()
    expect(styleCount()).toBe(0)
  })

  it('停止：移除标记与样式，之后的变动不处理', async () => {
    document.body.innerHTML = page()
    start().stop()
    expect(document.querySelectorAll(`[${FRESHNESS_ATTRIBUTE}]`)).toHaveLength(0)
    expect(styleCount()).toBe(0)
    document.querySelector('tbody')!.insertAdjacentHTML('beforeend', row('docs', ago(3)))
    await flush()
    expect(level('docs')).toBeNull()
  })
})

describe('freshnessStyle', () => {
  const selector = (key: string): string => `relative-time[${FRESHNESS_ATTRIBUTE}="${key}"]`
  const rule = (key: string, color: string): string => `${selector(key)} { color: ${color} !important; }`
  const SUCCESS = 'var(--fgColor-success, var(--color-success-fg, #1a7f37))'
  const ATTENTION = 'var(--fgColor-attention, var(--color-attention-fg, #9a6700))'
  const SEVERE = 'var(--fgColor-severe, var(--color-severe-fg, #bc4c00))'
  const ACCENT = 'var(--fgColor-accent, var(--color-accent-fg, #0969da))'
  const SUCCESS_BG = 'var(--bgColor-success-muted, var(--color-success-subtle, #dafbe1))'
  const ATTENTION_BG = 'var(--bgColor-attention-muted, var(--color-attention-subtle, #fff8c5))'
  const NEUTRAL_BG = 'var(--bgColor-neutral-muted, var(--color-neutral-muted, #818b981f))'
  const BOX = 'padding: 0 4px !important; border-radius: 6px !important; -webkit-box-decoration-break: clone; box-decoration-break: clone;'
  const NEWLINE = '\n'
  const style = (list: readonly FreshnessRange[], stale?: FreshnessPaint, background = false, supports = imageLightDark): string[] =>
    freshnessStyle({ ranges: ranges(list, stale), background }, supports).split(NEWLINE)

  it('默认：各时段按先后用主题的成功色、提示色、严重色……（循环），更早的不加', () => {
    expect(freshnessStyle({ ranges: DEFAULT_FRESHNESS_RANGES, background: false }).split(NEWLINE)).toEqual([
      rule('0', SUCCESS),
      rule('1', ATTENTION)
    ])
    const many = style([1, 2, 3, 4, 5, 6].map(days => emptyRange(days)))
    expect(many[2]).toBe(rule('2', SEVERE))
    expect(many[5]).toBe(rule('5', ACCENT))
  })

  it('改过的按页面的 color-scheme 取浅色或深色的值；没改的一侧用默认，更早的默认为原本的颜色', () => {
    expect(style([range(30, ['#cf222e', '']), range(365, ['#0969da', '#4493f8'])], paint(['', '#8b949e']))).toEqual([
      rule('0', `light-dark(#cf222e, ${SUCCESS})`),
      rule('1', 'light-dark(#0969da, #4493f8)'),
      rule('stale', 'light-dark(currentColor, #8b949e)')
    ])
  })

  it('格式不符的颜色按默认：不会写进样式', () => {
    const css = style([range(30, ['red; } body { display: none', '']), range(365)], paint(['url(https://example.com/)', '']))
    expect(css).toEqual(style([range(30), range(365)]))
  })

  /** 渐变：背景裁到文字 */
  const clip = (key: string, image: string): string =>
    `${selector(key)} { background-image: ${image} !important; ` +
    '-webkit-background-clip: text !important; background-clip: text !important; -webkit-text-fill-color: transparent !important; }'

  it('渐变：背景裁到文字；另一侧的颜色（含默认）写成单色渐变，light-dark() 的两个值同为图像', () => {
    expect(style([range(30, [GRADIENT, '']), range(365, ['rgba(9, 105, 218, 0.5)', GRADIENT])], paint(['', GRADIENT]))).toEqual([
      clip('0', `light-dark(${GRADIENT}, linear-gradient(${SUCCESS}, ${SUCCESS}))`),
      clip('1', `light-dark(linear-gradient(rgba(9, 105, 218, 0.5), rgba(9, 105, 218, 0.5)), ${GRADIENT})`),
      clip('stale', `light-dark(linear-gradient(currentColor, currentColor), ${GRADIENT})`)
    ])
  })

  it('浏览器不认的值按默认：不支持在 light-dark() 里用图像时渐变按默认；颜色照常', () => {
    const list = [range(30, [GRADIENT, 'red']), range(365, ['foo', LAYERED_GRADIENT])]
    expect(style(list, undefined, false, noImageLightDark)).toEqual([rule('0', `light-dark(${SUCCESS}, red)`), rule('1', ATTENTION)])
    expect(style(list, undefined, false, imageLightDark)).toEqual([
      clip('0', `light-dark(${GRADIENT}, linear-gradient(red, red))`),
      rule('1', ATTENTION)
    ])
  })

  it('背景色：各时段（含更早）默认用同色调的柔和底色，加内边距与圆角；改过的按主题取值', () => {
    expect(style([range(30), range(365, [], ['#ffebe9', ''])], undefined, true)).toEqual([
      `${selector('0')} { color: ${SUCCESS} !important; background-color: ${SUCCESS_BG} !important; ${BOX} }`,
      `${selector('1')} { color: ${ATTENTION} !important; background-color: light-dark(#ffebe9, ${ATTENTION_BG}) !important; ${BOX} }`,
      `${selector('stale')} { background-color: ${NEUTRAL_BG} !important; ${BOX} }`
    ])
  })

  it('背景色为渐变：用 background-image；文字为渐变时文字、背景分两层分别裁切', () => {
    const [gradientFill, gradientText] = style([range(30, [], [GRADIENT, '']), range(365, [GRADIENT, ''])], undefined, true)
    expect(gradientFill).toBe(
      `${selector('0')} { color: ${SUCCESS} !important; background-image: light-dark(${GRADIENT}, linear-gradient(${SUCCESS_BG}, ${SUCCESS_BG})) !important; ${BOX} }`
    )
    expect(gradientText).toBe(
      `${selector('1')} { background-image: light-dark(${GRADIENT}, linear-gradient(${ATTENTION}, ${ATTENTION})), ` +
        `light-dark(linear-gradient(${ATTENTION_BG}, ${ATTENTION_BG}), linear-gradient(${ATTENTION_BG}, ${ATTENTION_BG})) !important; ` +
        `-webkit-background-clip: text, padding-box !important; background-clip: text, padding-box !important; -webkit-text-fill-color: transparent !important; ${BOX} }`
    )
  })
})
