// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTranslator, type Translator, type TranslatorOptions } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../../../src/locales/zh-CN/helpers'
import { $, TEST_BUNDLE, testMatcher } from './helpers'
import { defineFakeRelativeTime, settleTime, type FakeRelativeTime } from './time-element'

const ZH_TEXT = '3天前'
const ZH_TITLE = '2026年10月26日 10:03'
const EN_TEXT = '3 days ago'
const EN_TITLE = 'Oct 26, 2026, 10:03 AM GMT+8'
/** 页面自己设为中文（24小时制）、不带前缀与中文 title 的时间元素：引擎要设的属性值与原值相同，不改写 */
const PAGE_ZH_TIME = '<relative-time lang="zh-CN" hour-cycle="h23" prefix="" title="Sample title"></relative-time>'

/** 测试词典加上全局忽略规则 */
function ignoring(...selectors: string[]): LocaleBundle {
  return [...TEST_BUNDLE, ['common', { ignore: selectors }]]
}

let translator: Translator | undefined

function start(html: string, options: Partial<TranslatorOptions> = {}): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: testMatcher(), host: window, ...options })
  translator.start()
  return translator
}

function stop(): void {
  translator?.stop()
  translator = undefined
}

const time = (): FakeRelativeTime => $('relative-time') as FakeRelativeTime

beforeAll(defineFakeRelativeTime)

afterEach(() => {
  stop()
  document.body.innerHTML = ''
})

describe('时间元素按中文渲染后补空格', () => {
  it('文字与 title 在中文与数字之间补空格', async () => {
    start('<relative-time datetime="2026-10-26T02:03:00Z"></relative-time>')
    await settleTime()
    expect(time().getAttribute('lang')).toBe('zh-CN')
    expect(time().renderedText).toBe(ZH_TEXT)
    expect(time().getAttribute('title')).toBe(ZH_TITLE)
  })

  it('元素定时重新渲染：再次补空格', async () => {
    start('<relative-time></relative-time>')
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
    expect(time().getAttribute('title')).toBe(ZH_TITLE)
  })

  it('动态插入的时间元素同样补空格', async () => {
    start('<main></main>')
    $('main').insertAdjacentHTML('beforeend', '<relative-time></relative-time>')
    await settleTime()
    await settleTime()
    expect(time().renderedText).toBe(ZH_TEXT)
  })

  it('停止翻译：文字与 title 回到英文', async () => {
    start('<relative-time></relative-time>')
    await settleTime()
    stop()
    await settleTime()
    expect(time().hasAttribute('lang')).toBe(false)
    expect(time().renderedText).toBe(EN_TEXT)
    expect(time().getAttribute('title')).toBe(EN_TITLE)
  })

  it('关闭时间本地化：回到英文；再开启：补空格', async () => {
    const t = start('<relative-time></relative-time>')
    await settleTime()
    t.setFeatures({ translateTime: false })
    await settleTime()
    expect(time().renderedText).toBe(EN_TEXT)
    expect(time().getAttribute('title')).toBe(EN_TITLE)
    t.setFeatures({ translateTime: true })
    await settleTime()
    expect(time().renderedText).toBe(ZH_TEXT)
    expect(time().getAttribute('title')).toBe(ZH_TITLE)
  })

  it('页面设的 title 不改，停止后保留', async () => {
    start('<relative-time title="Close"></relative-time>')
    await settleTime()
    expect(time().renderedText).toBe(ZH_TEXT)
    expect(time().getAttribute('title')).toBe('Close')
    stop()
    await settleTime()
    expect(time().getAttribute('title')).toBe('Close')
  })

  it('补空格后页面改了 title：停止时保留页面的值', async () => {
    start('<relative-time></relative-time>')
    await settleTime()
    time().setAttribute('title', 'Sample title')
    stop()
    await settleTime()
    expect(time().getAttribute('title')).toBe('Sample title')
  })

  it('React 复用元素只改 datetime：title 按新日期补空格；停止后回到英文', async () => {
    start('<relative-time datetime="2026-10-26T02:03:00Z"></relative-time>')
    await settleTime()
    time().setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time().renderedText).toBe('7天前')
    expect(time().getAttribute('title')).toBe('2026年10月22日 10:03')
    stop()
    await settleTime()
    expect(time().renderedText).toBe('7 days ago')
    expect(time().getAttribute('title')).toBe('Oct 22, 2026, 10:03 AM GMT+8')
  })

  it('只改 datetime、显示文字不变（昨天）：title 同样更新', async () => {
    start('<relative-time datetime="2026-10-28T02:03:00Z"></relative-time>')
    await settleTime()
    expect(time().renderedText).toBe('昨天')
    time().setAttribute('datetime', '2026-10-28T07:20:00Z')
    await settleTime()
    expect(time().renderedText).toBe('昨天')
    expect(time().getAttribute('title')).toBe('2026年10月28日 15:20')
  })

  it('克隆体（Turbo 缓存快照）带着中文 lang：同样补空格', async () => {
    start('<main><relative-time></relative-time></main>')
    await settleTime()
    $('main').replaceWith($('main').cloneNode(true))
    await settleTime()
    expect(time().renderedText).toBe(ZH_TEXT)
    expect(time().getAttribute('title')).toBe(ZH_TITLE)
  })

  it('启动前已按中文渲染的元素（lang 不变、不再渲染）：启动时立即补空格', async () => {
    document.body.innerHTML = '<relative-time lang="zh-CN" hour-cycle="h23" prefix=""></relative-time>'
    await settleTime()
    expect(time().renderedText).toBe('3天前')
    translator = createTranslator({ matcher: testMatcher(), host: window })
    translator.start()
    expect(time().renderedText).toBe(ZH_TEXT)
    expect(time().getAttribute('title')).toBe(ZH_TITLE)
  })

  it('忽略区域内的时间元素：页面改为中文也不补空格', async () => {
    start('<div class="markdown-body"><relative-time lang="en"></relative-time></div>')
    await settleTime()
    time().setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time().renderedText).toBe('3天前')
  })

  it('关闭时间本地化时页面改为中文的元素：不补空格', async () => {
    start('<relative-time lang="en"></relative-time>', { translateTime: false })
    await settleTime()
    time().setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time().renderedText).toBe('3天前')
  })

  it('未启动或已停止翻译：不补空格', async () => {
    document.body.innerHTML = '<relative-time lang="zh-CN"></relative-time>'
    await settleTime()
    expect(time().renderedText).toBe('3天前')
    start('<relative-time lang="zh-CN"></relative-time>')
    stop()
    time().tick()
    expect(time().renderedText).toBe('3天前')
  })
})

describe('自定义时间格式', () => {
  it('显示文字按写法，title 照常补空格；改写法、改回默认时立即更新；定时刷新后仍按写法；停止后回到英文', async () => {
    const t = start('<relative-time datetime="2026-10-26T02:03:00Z"></relative-time>', { timeFormat: 'YYYY-MM-DD HH:mm' })
    await settleTime()
    expect(time().renderedText).toBe('2026-10-26 10:03')
    expect(time().getAttribute('title')).toBe(ZH_TITLE)
    time().tick()
    expect(time().renderedText).toBe('2026-10-26 10:03')
    t.setFeatures({ timeFormat: 'M/D HH:mm' })
    expect(time().renderedText).toBe('10/26 10:03')
    t.setFeatures({ timeFormat: '' })
    expect(time().renderedText).toBe(ZH_TEXT)
    t.setFeatures({ timeFormat: 'YYYY-MM-DD' })
    expect(time().renderedText).toBe('2026-10-26')
    stop()
    await settleTime()
    expect(time().renderedText).toBe(EN_TEXT)
    expect(time().getAttribute('title')).toBe(EN_TITLE)
  })

  it('时间本地化关闭：不按写法；开启后按写法', async () => {
    const t = start('<relative-time datetime="2026-10-26T02:03:00Z"></relative-time>', { translateTime: false, timeFormat: 'YYYY-MM-DD' })
    await settleTime()
    expect(time().renderedText).toBe(EN_TEXT)
    t.setFeatures({ timeFormat: 'HH:mm' })
    expect(time().renderedText).toBe(EN_TEXT)
    t.setFeatures({ translateTime: true })
    await settleTime()
    expect(time().renderedText).toBe('10:03')
  })
})

describe('定时刷新沿用位置判断', () => {
  it('文字不变的定时刷新：补空格，不再按忽略选择器查找祖先', async () => {
    start(`<main>${'<div class="d-flex"><a href="#c"><relative-time></relative-time></a></div>'.repeat(3)}</main>`)
    await settleTime()
    const times = [...document.querySelectorAll('relative-time')] as FakeRelativeTime[]
    // 第一次刷新重新判断（渲染后改写 title 的变动作废了此前的判断），之后沿用
    for (const element of times) element.tick()
    const closest = vi.spyOn(Element.prototype, 'closest')
    for (const element of times) element.tick()
    const lookups = closest.mock.calls.filter(([selector]) => selector.includes('.markdown-body')).length
    closest.mockRestore()
    expect(times.map(element => element.renderedText)).toEqual([ZH_TEXT, ZH_TEXT, ZH_TEXT])
    expect(lookups).toBe(0)
  })

  it('元素移入忽略区域：移入时的渲染与之后的刷新都不补空格；移回后再补', async () => {
    start('<main><a href="#c"><relative-time></relative-time></a></main><div class="markdown-body"></div>')
    await settleTime()
    time().tick()
    $('.markdown-body').append(time())
    expect(time().renderedText).toBe('3天前')
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe('3天前')
    $('a').append(time())
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
  })

  it('所在区块移入忽略区域：同样不补空格', async () => {
    start('<main><section><a href="#c"><relative-time></relative-time></a></section></main><div class="markdown-body"></div>')
    await settleTime()
    time().tick()
    $('.markdown-body').append($('section'))
    expect(time().renderedText).toBe('3天前')
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe('3天前')
  })

  it('页面设为中文的元素移出忽略区域：补空格', async () => {
    start('<main></main><div class="markdown-body"><relative-time lang="en"></relative-time></div>')
    await settleTime()
    time().setAttribute('lang', 'zh-CN')
    await settleTime()
    expect(time().renderedText).toBe('3天前')
    $('main').append(time())
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
  })

  it('祖先 class 改为忽略类名：不补空格；改回后再渲染时补空格', async () => {
    start('<main><section class="sample-region"><relative-time></relative-time></section></main>')
    await settleTime()
    time().tick()
    $('section').className = 'markdown-body'
    time().tick()
    expect(time().renderedText).toBe('3天前')
    $('section').className = 'sample-region'
    time().setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time().renderedText).toBe('7天前')
  })

  it('祖先加上退出标记：不补空格', async () => {
    start(`<main><section>${PAGE_ZH_TIME}</section></main>`)
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
    $('section').setAttribute('data-gcn-ignore', '')
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe('3天前')
  })

  it('依赖子节点的忽略规则随插入节点命中祖先：不补空格', async () => {
    start(`<main><section>${PAGE_ZH_TIME}</section></main>`, {
      matcher: testMatcher(undefined, ignoring('section:has(> .sample-flag)'))
    })
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
    $('section').insertAdjacentHTML('beforeend', '<i class="sample-flag"></i>')
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe('3天前')
  })

  it('换忽略规则：所在区域新命中时不补空格，不再命中时再补', async () => {
    const t = start(`<main><section class="sample-region">${PAGE_ZH_TIME}</section></main>`)
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
    t.setMatcher(testMatcher(undefined, ignoring('.sample-region')))
    time().tick()
    expect(time().renderedText).toBe('3天前')
    t.setMatcher(testMatcher())
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
  })

  it('页面类型变化、所在区域不再命中页面忽略规则：补空格', async () => {
    const t = start(`<main><div class="issue-user-content">${PAGE_ZH_TIME}</div></main>`)
    await settleTime()
    time().setAttribute('datetime', '2026-10-22T02:03:00Z')
    await settleTime()
    expect(time().renderedText).toBe('7天前')
    history.pushState(null, '', '/vuejs/core/pulls')
    try {
      t.checkLocation()
      time().tick()
      expect(time().renderedText).toBe('7天前')
    } finally {
      history.pushState(null, '', '/vuejs/core/issues')
    }
  })

  it('停止期间所在区域加上 / 去掉退出标记：重新开始后按新位置判断', async () => {
    const t = start(`<main><section>${PAGE_ZH_TIME}</section></main>`)
    await settleTime()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
    // 停止期间不观察变动：重新开始时作废此前的判断
    t.stop()
    $('section').setAttribute('data-gcn-ignore', '')
    t.start()
    time().tick()
    expect(time().renderedText).toBe('3天前')
    t.stop()
    $('section').removeAttribute('data-gcn-ignore')
    t.start()
    time().tick()
    expect(time().renderedText).toBe(ZH_TEXT)
  })
})

describe('TIME_SOURCE 拼成的词典规则', () => {
  /** 按 helpers 文件头的用法拼成的时间规则：带前缀的整句、单独的时间 */
  const TIME_BUNDLE: LocaleBundle = [
    [
      'common',
      {
        regexp: [
          [new RegExp(`^Updated (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '更新')],
          [new RegExp(`^(${TIME_SOURCE})$`), (_, time: string) => translateTime(time)]
        ]
      }
    ]
  ]

  it.each([
    ['Updated on Jan 5, 2024', '2024年1月5日更新'],
    ['Updated on January 2024', '2024年1月更新'],
    ['Updated on 5 January 2024', '2024年1月5日更新'],
    ['on January 2024', '2024年1月']
  ])('规则接受的带 on 日期整句译出：%s → %s', (source, expected) => {
    start(`<span id="time">${source}</span>`, { matcher: testMatcher(undefined, TIME_BUNDLE) })
    expect($('#time').textContent).toBe(expected)
  })

  it('停止后还原原文', () => {
    start('<span id="time">Updated on January 2024</span>', { matcher: testMatcher(undefined, TIME_BUNDLE) })
    stop()
    expect($('#time').textContent).toBe('Updated on January 2024')
  })
})
