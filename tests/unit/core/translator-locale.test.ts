// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createTranslator, defaultHourCycle, type Translator } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { $, testMatcher } from './helpers'
import { defineFakeRelativeTime, settleTime, type FakeRelativeTime } from './time-element'

const TW_BUNDLE: LocaleBundle = [['common', { static: { Issues: '議題', Copy: '複製' } }]]

let translator: Translator | undefined

function start(html: string): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: testMatcher(), host: window })
  translator.start()
  return translator
}

const time = (): FakeRelativeTime => $('relative-time') as FakeRelativeTime

beforeAll(defineFakeRelativeTime)

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('setLocale', () => {
  it('翻译中切换语言：文本、属性按新词典重译，时间元素换成新的 lang 并补空格', async () => {
    const t = start('<p>Issues</p><button aria-label="Copy">Issues</button><relative-time></relative-time>')
    await settleTime()
    expect($('p').textContent).toBe('议题')
    expect(time().renderedText).toBe('3天前')

    t.setLocale(testMatcher(undefined, TW_BUNDLE), 'zh-TW')
    await settleTime()
    expect($('p').textContent).toBe('議題')
    expect($('button').textContent).toBe('議題')
    expect($('button').getAttribute('aria-label')).toBe('複製')
    expect(time().getAttribute('lang')).toBe('zh-TW')
    expect(time().renderedText).toBe('3 天前')
    expect(time().getAttribute('title')).toBe('2026年10月26日 上午10:03')
  })

  it('切换后停止：还原英文原文与时间元素', async () => {
    const t = start('<p>Issues</p><relative-time></relative-time>')
    await settleTime()
    t.setLocale(testMatcher(undefined, TW_BUNDLE), 'zh-TW')
    await settleTime()
    t.stop()
    translator = undefined
    await settleTime()
    expect($('p').textContent).toBe('Issues')
    expect(time().hasAttribute('lang')).toBe(false)
    expect(time().renderedText).toBe('3 days ago')
  })

  it('新词典没有的文本还原为原文', () => {
    const t = start('<p>Issues</p><p>Pull requests</p>')
    expect($('p:last-child').textContent).toBe('拉取请求')
    t.setLocale(testMatcher(undefined, TW_BUNDLE), 'zh-TW')
    expect($('p').textContent).toBe('議題')
    expect($('p:last-child').textContent).toBe('Pull requests')
  })

  it('停止时切换：只换词典，启动后按新语言翻译', async () => {
    document.body.innerHTML = '<p>Issues</p><relative-time></relative-time>'
    translator = createTranslator({ matcher: testMatcher(), host: window })
    translator.setLocale(testMatcher(undefined, TW_BUNDLE), 'zh-TW')
    expect($('p').textContent).toBe('Issues')
    translator.start()
    await settleTime()
    expect($('p').textContent).toBe('議題')
    expect(time().getAttribute('lang')).toBe('zh-TW')
  })

  describe('元素原本按别的中文 lang 渲染', () => {
    const TW_TITLE = '2026年10月26日 上午10:03'

    function startTw(html: string, translateTime = true): Translator {
      document.body.innerHTML = html
      translator = createTranslator({
        matcher: testMatcher(undefined, TW_BUNDLE),
        host: window,
        timeLang: 'zh-TW',
        translateTime
      })
      translator.start()
      return translator
    }

    it('页面自设 lang="zh-CN"：title 按 zh-TW 重新生成后补空格', async () => {
      document.body.innerHTML = '<relative-time lang="zh-CN"></relative-time>'
      await settleTime()
      startTw(document.body.innerHTML)
      await settleTime()
      await settleTime()
      expect(time().getAttribute('lang')).toBe('zh-TW')
      expect(time().renderedText).toBe('3 天前')
      expect(time().getAttribute('title')).toBe(TW_TITLE)
    })

    it('祖先 lang="zh-CN"：同样按 zh-TW 重新生成', async () => {
      startTw('<div lang="zh-CN"><relative-time></relative-time></div>')
      await settleTime()
      await settleTime()
      expect(time().getAttribute('title')).toBe(TW_TITLE)
    })

    it('关闭时间本地化再开启：按 zh-TW 重新生成', async () => {
      const t = startTw('<relative-time lang="zh-CN"></relative-time>', false)
      await settleTime()
      t.setFeatures({ translateTime: true })
      await settleTime()
      await settleTime()
      expect(time().getAttribute('title')).toBe(TW_TITLE)
    })

    it('克隆体带来补过空格的 zh-CN title、文字两种语言相同（昨天）：移除后按 zh-TW 重新生成', async () => {
      startTw('<relative-time lang="zh-CN" datetime="2026-10-28T02:03:00Z" title="2026年10月28日 GMT+8 10:03"></relative-time>')
      await settleTime()
      await settleTime()
      expect(time().renderedText).toBe('昨天')
      expect(time().getAttribute('title')).toBe('2026年10月28日 上午10:03')
    })

    it('祖先 lang 与小时制与 timeLang 相同：元素不重新渲染，立即补空格', async () => {
      document.body.innerHTML = '<div lang="zh-CN" hour-cycle="h23"><relative-time></relative-time></div>'
      await settleTime()
      expect(time().renderedText).toBe('3天前')
      translator = createTranslator({ matcher: testMatcher(), host: window })
      translator.start()
      await settleTime()
      expect(time().renderedText).toBe('3天前')
      expect(time().getAttribute('title')).toBe('2026年10月26日 10:03')
    })
  })

  it('选项 timeLang：时间元素按指定语言渲染', async () => {
    document.body.innerHTML = '<relative-time></relative-time>'
    translator = createTranslator({ matcher: testMatcher(undefined, TW_BUNDLE), host: window, timeLang: 'zh-TW' })
    translator.start()
    await settleTime()
    expect(time().getAttribute('lang')).toBe('zh-TW')
    expect(time().getAttribute('title')).toBe('2026年10月26日 上午10:03')
  })
})

describe('小时制', () => {
  afterEach(() => document.documentElement.removeAttribute('hour-cycle'))

  it('翻译语言的默认小时制：zh-TW 12 小时制，zh-CN 24 小时制', () => {
    expect(defaultHourCycle('zh-TW')).toBe('h12')
    expect(defaultHourCycle('zh-CN')).toBe('h23')
  })

  it('页面按 24 小时制、翻译成繁体：元素设 hour-cycle="h12"，title 按上午 / 下午重新生成；停止后移除', async () => {
    document.documentElement.setAttribute('hour-cycle', 'h23')
    document.body.innerHTML = '<relative-time lang="zh-TW"></relative-time>'
    await settleTime()
    expect(time().getAttribute('title')).toBe('2026年10月26日 10:03 [GMT+8]')
    translator = createTranslator({ matcher: testMatcher(undefined, TW_BUNDLE), host: window, timeLang: 'zh-TW' })
    translator.start()
    await settleTime()
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h12')
    expect(time().getAttribute('title')).toBe('2026年10月26日 上午10:03')

    translator.stop()
    translator = undefined
    await settleTime()
    expect(time().hasAttribute('hour-cycle')).toBe(false)
    expect(time().getAttribute('title')).toBe('2026年10月26日 10:03 [GMT+8]')
  })

  it('祖先按 12 小时制、翻译成简体：元素设 hour-cycle="h23"', async () => {
    start('<div hour-cycle="h12"><relative-time></relative-time></div>')
    await settleTime()
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h23')
    expect(time().getAttribute('title')).toBe('2026年10月26日 10:03')
  })

  it('元素自带 hour-cycle：翻译时改成翻译语言的小时制，停止后还原原值', async () => {
    const t = start('<relative-time hour-cycle="h12"></relative-time>')
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h23')
    t.stop()
    translator = undefined
    expect(time().getAttribute('hour-cycle')).toBe('h12')
  })

  it('lang 已是 zh-TW、只有小时制不同：补过空格的 24 小时制 title 被移除并按 12 小时制重新生成', async () => {
    document.documentElement.setAttribute('hour-cycle', 'h23')
    document.body.innerHTML = '<relative-time lang="zh-TW" prefix="" title="2026年10月26日 10:03 [GMT+8]"></relative-time>'
    await settleTime()
    translator = createTranslator({ matcher: testMatcher(undefined, TW_BUNDLE), host: window, timeLang: 'zh-TW' })
    translator.start()
    await settleTime()
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h12')
    expect(time().getAttribute('title')).toBe('2026年10月26日 上午10:03')
  })

  it('lang 已是 zh-CN、只有小时制不同、title 是页面自定义值（元素不派发事件）：文字照样补空格', async () => {
    document.documentElement.setAttribute('hour-cycle', 'h12')
    document.body.innerHTML = '<relative-time lang="zh-CN" prefix="" title="Sample title"></relative-time>'
    await settleTime()
    expect(time().renderedText).toBe('3天前')
    start(document.body.innerHTML)
    expect(time().renderedText).toBe('3天前')
    await settleTime()
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h23')
    expect(time().renderedText).toBe('3天前')
    expect(time().getAttribute('title')).toBe('Sample title')
  })

  it('页面改掉元素的 hour-cycle：改回翻译语言的小时制，title 重新生成', async () => {
    start('<relative-time></relative-time>')
    await settleTime()
    time().setAttribute('hour-cycle', 'h12')
    await settleTime()
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h23')
    expect(time().getAttribute('title')).toBe('2026年10月26日 10:03')
  })

  it('祖先的 hour-cycle 不是元素认可的取值：按翻译语言的小时制设置', async () => {
    start('<div hour-cycle="auto"><relative-time></relative-time></div>')
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h23')
    expect(time().getAttribute('title')).toBe('2026年10月26日 10:03')
  })

  it('取不到语言的小时制：不设 hour-cycle', () => {
    expect(defaultHourCycle('not a locale')).toBeUndefined()
  })

  it('切换翻译语言：小时制随之改变', async () => {
    const t = start('<relative-time></relative-time>')
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h23')
    t.setLocale(testMatcher(undefined, TW_BUNDLE), 'zh-TW')
    await settleTime()
    await settleTime()
    expect(time().getAttribute('hour-cycle')).toBe('h12')
    expect(time().getAttribute('title')).toBe('2026年10月26日 上午10:03')
  })
})
