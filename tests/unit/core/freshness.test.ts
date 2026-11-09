import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createFreshness, FRESHNESS_ATTRIBUTE, freshnessOf, freshnessStyle, type FreshnessMarker } from '../../../src/core/freshness'
import { DEFAULT_FRESHNESS_COLORS, FRESH_DAYS, RECENT_DAYS, type FreshnessColors } from '../../../src/shared/freshness'

const NOW = Date.parse('2026-11-09T12:00:00Z')
const DAY = 24 * 60 * 60 * 1000

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

let active = true
let colors: FreshnessColors = DEFAULT_FRESHNESS_COLORS
let marker: FreshnessMarker | undefined

function start(): FreshnessMarker {
  marker = createFreshness(document, { active: () => active, colors: () => colors, now: () => NOW })
  return marker
}

beforeEach(() => {
  active = true
  colors = DEFAULT_FRESHNESS_COLORS
})

afterEach(() => {
  marker?.stop()
  marker = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('freshnessOf', () => {
  it.each<[string, string | null, string | undefined]>([
    ['刚刚', ago(0), 'fresh'],
    [`${FRESH_DAYS} 天前`, ago(FRESH_DAYS), 'fresh'],
    [`${FRESH_DAYS} 天多一点`, new Date(NOW - FRESH_DAYS * DAY - 1).toISOString(), 'recent'],
    [`${RECENT_DAYS} 天前`, ago(RECENT_DAYS), 'recent'],
    [`${RECENT_DAYS} 天多一点`, new Date(NOW - RECENT_DAYS * DAY - 1).toISOString(), 'stale'],
    ['5 年前', ago(5 * 365), 'stale'],
    ['晚于当前（时钟偏差）', ago(-1), 'fresh'],
    ['无效', 'Sample text', undefined],
    ['没有', null, undefined]
  ])('%s → %s', (_, datetime, expected) => {
    expect(freshnessOf(datetime, NOW)).toBe(expected)
  })
})

describe('更新时间着色', () => {
  it('文件列表各项、最近一次提交按距今远近标记；其他地方的时间不标', () => {
    document.body.innerHTML = page()
    start()
    expect([level('packages'), level('scripts'), level('LICENSE')]).toEqual(['fresh', 'recent', 'stale'])
    expect([level('latest-small'), level('latest-wide')]).toEqual(['fresh', 'fresh'])
    expect(level('release')).toBeNull()
    expect(styleCount()).toBe(1)
    expect(styleText()).toBe(freshnessStyle(DEFAULT_FRESHNESS_COLORS))
  })

  it('后来出现的行（软导航、展开目录）也标；React 复用节点换了时间时重标', async () => {
    document.body.innerHTML = page()
    start()
    document.querySelector('tbody')!.insertAdjacentHTML('beforeend', row('docs', ago(3)))
    await flush()
    expect(level('docs')).toBe('fresh')
    document.getElementById('docs')!.setAttribute('datetime', ago(RECENT_DAYS * 2))
    await flush()
    expect(level('docs')).toBe('stale')
    document.getElementById('docs')!.setAttribute('datetime', 'Sample text')
    await flush()
    expect(level('docs')).toBeNull()
    document.getElementById('LICENSE')!.setAttribute('datetime', ago(100))
    await flush()
    expect(level('LICENSE')).toBe('recent')
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
    expect(level('packages')).toBe('fresh')
    active = false
    instance.refresh()
    expect(document.querySelectorAll(`[${FRESHNESS_ATTRIBUTE}]`)).toHaveLength(0)
    expect(styleCount()).toBe(0)
  })

  it('颜色：刷新时换成新的样式，不重复添加', () => {
    document.body.innerHTML = page()
    const instance = start()
    colors = { ...DEFAULT_FRESHNESS_COLORS, stale: { light: '#59636e', dark: '' } }
    instance.refresh()
    expect(styleCount()).toBe(1)
    expect(styleText()).toBe(freshnessStyle(colors))
    expect(styleText()).toContain('light-dark(#59636e, currentColor)')
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
  const rule = (level: string, color: string): string => `relative-time[${FRESHNESS_ATTRIBUTE}="${level}"] { color: ${color} !important; }`
  const SUCCESS = 'var(--fgColor-success, var(--color-success-fg, #1a7f37))'
  const ATTENTION = 'var(--fgColor-attention, var(--color-attention-fg, #9a6700))'
  const NEWLINE = '\n'

  it('默认：30 天内、一年内用主题的成功色、提示色，更早的不加', () => {
    expect(freshnessStyle(DEFAULT_FRESHNESS_COLORS).split(NEWLINE)).toEqual([rule('fresh', SUCCESS), rule('recent', ATTENTION)])
  })

  it('改过的按页面的 color-scheme 取浅色或深色的值；没改的一侧用默认，更早的默认为原本的颜色', () => {
    const css = freshnessStyle({
      fresh: { light: '#cf222e', dark: '' },
      recent: { light: '#0969da', dark: '#4493f8' },
      stale: { light: '', dark: '#8b949e' }
    })
    expect(css.split(NEWLINE)).toEqual([
      rule('fresh', `light-dark(#cf222e, ${SUCCESS})`),
      rule('recent', 'light-dark(#0969da, #4493f8)'),
      rule('stale', 'light-dark(currentColor, #8b949e)')
    ])
  })

  it('格式不符的颜色按默认：不会写进样式', () => {
    const css = freshnessStyle({
      ...DEFAULT_FRESHNESS_COLORS,
      fresh: { light: 'red; } body { display: none', dark: '' },
      stale: { light: 'url(https://example.com/)', dark: '' }
    })
    expect(css).toBe(freshnessStyle(DEFAULT_FRESHNESS_COLORS))
  })
})
