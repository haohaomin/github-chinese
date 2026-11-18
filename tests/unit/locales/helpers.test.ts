import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import type { RegExpRule } from '../../../src/core/types'
import {
  DATE_SOURCE,
  TIME_SOURCE,
  formatDate,
  joinCjk,
  mergeDictionaries,
  spaceDigits,
  translateDate,
  translateRelativeTime,
  translateTime
} from '../../../src/locales/zh-CN/helpers'
import { isLocalZone, zoneOffset } from '../../../src/locales/shared/helpers'

describe('translateRelativeTime', () => {
  it.each([
    ['3 days ago', '3天前'],
    ['a minute ago', '1分钟前'],
    ['an hour ago', '1小时前'],
    ['about 2 hours ago', '约2小时前'],
    ['in 2 weeks', '2周后'],
    ['yesterday', '昨天'],
    ['Yesterday', '昨天'],
    ['now', '刚刚'],
    ['last week', '上周'],
    ['last month', '上个月'],
    ['next year', '明年']
  ])('%s → %s', (input, expected) => {
    expect(translateRelativeTime(input)).toBe(expected)
  })

  it.each([
    ['about 1 year ago', '约1年前'],
    ['about 1 day ago', '约1天前'],
    ['almost 2 years ago', '将近2年前'],
    ['over 3 years ago', '超过3年前']
  ])('带前缀时用数字格式：%s → %s', (input, expected) => {
    expect(translateRelativeTime(input)).toBe(expected)
  })

  it('不匹配时返回 undefined', () => {
    expect(translateRelativeTime('3 apples ago')).toBeUndefined()
  })

  it('原型链上的键不命中', () => {
    for (const key of ['constructor', '__proto__', 'toString', ' Constructor ']) {
      expect(translateRelativeTime(key)).toBeUndefined()
    }
  })

  it('数量超出安全整数时返回 undefined，不抛错', () => {
    const huge = '9'.repeat(400)
    expect(translateRelativeTime(`about ${huge} years ago`)).toBeUndefined()
    expect(translateRelativeTime(`in ${huge} days`)).toBeUndefined()
    expect(translateTime('12345678901234567890 days ago')).toBe('12345678901234567890 days ago')
  })
})

describe('translateDate', () => {
  it.each([
    ['Jan 5, 2024', '2024年1月5日'],
    ['on Jan 5', '1月5日'],
    ['September 30, 2025', '2025年9月30日'],
    ['January 2024', '2024年1月'],
    ['5 Jan 2024', '2024年1月5日'],
    ['on January 2024', '2024年1月'],
    ['on 5 January 2024', '2024年1月5日']
  ])('%s → %s', (input, expected) => {
    expect(translateDate(input)).toBe(expected)
  })

  it('TIME_SOURCE 接受的日期写法都能翻译', () => {
    const time = new RegExp(`^${TIME_SOURCE}$`)
    for (const input of ['on Jan 5, 2024', 'on January 2024', 'on 5 January 2024']) {
      expect(time.test(input)).toBe(true)
      expect(translateTime(input)).not.toBe(input)
    }
  })

  it('不匹配时返回 undefined', () => {
    expect(translateDate('Janus 5')).toBeUndefined()
  })
})

describe('translateTime', () => {
  it('依次尝试相对时间与日期，都不匹配时原样返回', () => {
    expect(translateTime('5 days ago')).toBe('5天前')
    expect(translateTime('Mar 3, 2023')).toBe('2023年3月3日')
    expect(translateTime('sometime')).toBe('sometime')
  })
})

describe('formatDate', () => {
  it('省略缺失部分', () => {
    expect(formatDate(2024, 1, 5)).toBe('2024年1月5日')
    expect(formatDate(undefined, 12, 31)).toBe('12月31日')
    expect(formatDate(2024, 2, undefined)).toBe('2024年2月')
  })
})

describe('*_SOURCE 片段', () => {
  it('可拼成锚定规则并配合 matcher 使用', () => {
    const matcher = createMatcher([
      [
        'common',
        {
          regexp: [
            [new RegExp(`^Updated (${TIME_SOURCE})$`), (_, time) => `${translateTime(time)}更新`],
            [new RegExp(`^Due by (${DATE_SOURCE})$`), (_, date) => `截止于 ${translateTime(date)}`]
          ]
        }
      ]
    ])
    expect(matcher.translate('Updated 3 days ago', ['common'])).toBe('3天前更新')
    expect(matcher.translate('Updated on Jan 5, 2024', ['common'])).toBe('2024年1月5日更新')
    expect(matcher.translate('Due by June 30, 2025', ['common'])).toBe('截止于 2025年6月30日')
  })
})

describe('mergeDictionaries', () => {
  it('先出现的 static 优先，regexp / ignore 依次拼接', () => {
    const merged = mergeDictionaries(
      { static: { A: '甲' }, regexp: [[/^a$/, '1']], ignore: ['.x'] },
      { static: { A: '乙', B: '丙' }, regexp: [[/^b$/, '2']], ignore: ['.y'] }
    )
    expect(merged.static).toEqual({ A: '甲', B: '丙' })
    expect(merged.regexp).toHaveLength(2)
    expect(merged.ignore).toEqual(['.x', '.y'])
  })

  it('attributeRules / inline / mergeText 依次拼接', () => {
    const merged = mergeDictionaries(
      {
        attributeRules: [['a', 'title', /^a$/, '1']],
        inline: [['{} merged', '{} 已合并']],
        mergeText: ['.a']
      },
      {},
      {
        attributeRules: [['b', 'title', /^b$/, '2']],
        inline: [['{} closed', '{} 已关闭']],
        mergeText: ['.b']
      }
    )
    expect(merged.attributeRules?.map(([selector]) => selector)).toEqual(['a', 'b'])
    expect(merged.inline?.map(([pattern]) => pattern)).toEqual(['{} merged', '{} closed'])
    expect(merged.mergeText).toEqual(['.a', '.b'])
  })

  it('labels、labelDescriptions 与 static 一样先出现的优先，没有这两张表的词典不影响', () => {
    const merged = mergeDictionaries(
      { labels: { bug: '缺陷' }, labelDescriptions: { 'Good for newcomers': '适合新手' } },
      {},
      {
        labels: { bug: '错误', question: '疑问' },
        labelDescriptions: { 'Good for newcomers': '后收录', 'Extra attention is needed': '需要额外关注' }
      }
    )
    expect(merged.labels).toEqual({ bug: '缺陷', question: '疑问' })
    expect(merged.labelDescriptions).toEqual({
      'Good for newcomers': '适合新手',
      'Extra attention is needed': '需要额外关注'
    })
    const matcher = createMatcher([['common', merged]])
    expect(matcher.translateLabel('bug', 'name')).toBe('缺陷')
    expect(matcher.translateLabel('question', 'name')).toBe('疑问')
    expect(matcher.translateLabel('Good for newcomers', 'description')).toBe('适合新手')
    expect(matcher.translateLabel('Extra attention is needed', 'description')).toBe('需要额外关注')
    expect(matcher.translate('bug', ['common'])).toBeUndefined()
  })

  it('listNames 与 static 一样先出现的优先，合并后只用于列表名', () => {
    const merged = mergeDictionaries(
      { listNames: { '✨ Inspiration': '✨ 灵感' } },
      {},
      { listNames: { '✨ Inspiration': '后收录', '🚀 My stack': '🚀 我的技术栈' } }
    )
    expect(merged.listNames).toEqual({ '✨ Inspiration': '✨ 灵感', '🚀 My stack': '🚀 我的技术栈' })
    const matcher = createMatcher([['common', merged]])
    expect(matcher.translateLabel('✨ Inspiration', 'list')).toBe('✨ 灵感')
    expect(matcher.translateLabel('🚀 My stack', 'list')).toBe('🚀 我的技术栈')
    expect(matcher.translateLabel('✨ Inspiration', 'name')).toBeUndefined()
    expect(matcher.translate('✨ Inspiration', ['common'])).toBeUndefined()
  })

  it('labelRegexp 依次拼接（同一规则对象），合并后照常生效', () => {
    const first: RegExpRule = [/^Pull requests that update ([\w.#+ -]{1,40}) code$/, '更新 $1 代码的拉取请求']
    const second: RegExpRule = [/^Sample (\d+)$/, '示例 $1']
    const merged = mergeDictionaries({ labelRegexp: [first] }, { labels: { bug: '缺陷' } }, { labelRegexp: [second] })
    expect(merged.labelRegexp).toEqual([first, second])
    expect(merged.labelRegexp?.[0]).toBe(first)
    const matcher = createMatcher([['common', merged]])
    expect(matcher.translateLabel('Pull requests that update Ruby code', 'description')).toBe('更新 Ruby 代码的拉取请求')
    expect(matcher.translateLabel('Sample 3', 'description')).toBe('示例 3')
    expect(matcher.translate('Sample 3', ['common'])).toBeUndefined()
  })
})

describe('spaceDigits', () => {
  it.each([
    ['3天前', '3天前'],
    ['约1年前', '约1年前'],
    ['2024年1月5日', '2024年1月5日'],
    ['昨天', '昨天'],
    ['just now', 'just now']
  ])('%s → %s', (input, expected) => {
    expect(spaceDigits(input)).toBe(expected)
  })
})

describe('joinCjk', () => {
  it.each([
    ['提交于', '3天前', '提交于 3天前'],
    ['提交于', '昨天', '提交于昨天'],
    ['updated', '3天前', 'updated3天前'],
    ['updated', 'yesterday', 'updatedyesterday']
  ])('joinCjk(%s, %s) → %s', (left, right, expected) => {
    expect(joinCjk(left, right)).toBe(expected)
  })
})

describe('zoneOffset', () => {
  it.each([
    ['GMT', 0],
    ['UTC', 0],
    ['GMT+0', 0],
    ['GMT+8', 480],
    ['GMT-5:30', -330],
    ['GMT+05:45', 345],
    ['PDT', -420],
    ['HST', -600],
    ['HAST', -600],
    ['HADT', -540]
  ])('%s → %i', (zone, expected) => {
    expect(zoneOffset(zone)).toBe(expected)
  })

  it.each(['XST', 'GMT+', 'CET', 'constructor'])('不认识：%s', zone => {
    expect(zoneOffset(zone)).toBeUndefined()
  })
})

/** 测试时区固定为 GMT+8（vitest 配置的 TZ） */
describe('isLocalZone', () => {
  afterEach(() => {
    process.env.TZ = 'Asia/Shanghai'
  })

  it('与本地时区偏移相同时为真；缺年份按今年', () => {
    expect(isLocalZone('GMT+8', 2026, 10, 26, 10, 3)).toBe(true)
    expect(isLocalZone('GMT+8', undefined, 1, 15, 8, 0)).toBe(true)
  })

  it('其他时区、不认识的时区为假', () => {
    expect(isLocalZone('UTC', 2026, 10, 26, 0, 5)).toBe(false)
    expect(isLocalZone('PDT', 2026, 7, 15, 11, 5)).toBe(false)
    expect(isLocalZone('GMT+9', 2026, 10, 26, 10, 3)).toBe(false)
    expect(isLocalZone('XST', 2026, 10, 26, 10, 3)).toBe(false)
  })

  it('按调用时的系统时区判断：改了时区后按新时区', () => {
    process.env.TZ = 'America/Adak'
    expect(isLocalZone('HAST', 2026, 1, 15, 0, 5)).toBe(true)
    expect(isLocalZone('HADT', 2026, 7, 15, 1, 5)).toBe(true)
    expect(isLocalZone('GMT+8', 2026, 10, 26, 10, 3)).toBe(false)
  })
})
