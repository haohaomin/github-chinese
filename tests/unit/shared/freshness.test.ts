import { describe, expect, it } from 'vitest'
import {
  canSetRangeDays,
  DEFAULT_FRESHNESS_RANGES,
  emptyRange,
  isValidColor,
  MAX_FRESH_DAYS,
  MAX_FRESHNESS_RANGES,
  migrateLegacyFreshness,
  nextRangeDays,
  normalizeHexColor,
  sanitizeFreshnessRanges,
  toneOf,
  withAddedRange,
  withFreshnessColor,
  withoutRange,
  withRangeDays,
  type FreshnessRanges
} from '../../../src/shared/freshness'
import { GRADIENT, imageLightDark, LAYERED_GRADIENT, noImageLightDark } from './fake-css'

describe('normalizeHexColor', () => {
  it.each([
    ['#1a7f37', '#1a7f37'],
    ['#1A7F37', '#1a7f37'],
    ['1a7f37', '#1a7f37'],
    [' #1a7f37 ', '#1a7f37'],
    ['#abc', '#aabbcc'],
    ['ABC', '#aabbcc']
  ])('%s → %s', (value, expected) => {
    expect(normalizeHexColor(value)).toBe(expected)
  })

  it.each(['', '#', '#12', '#1234', '#12345', '#1a7f37ff', '#12345g', 'red', 'rgb(0, 0, 0)', '#1a7f37;'])('格式不符：%s', value => {
    expect(normalizeHexColor(value)).toBeUndefined()
  })
})

describe('isValidColor', () => {
  it.each(['#cf222e', '#ABC', '#1a7f3780', '#abcd', 'red', 'rgba(9, 105, 218, 0.5)', GRADIENT])('可用：%s', value => {
    expect(isValidColor(value, imageLightDark)).toBe(true)
    expect(isValidColor(` ${value} `, imageLightDark)).toBe(true)
  })

  it.each([
    ['', '空为默认'],
    ['foo', '浏览器不认'],
    ['#0969d', 'hex 位数不对'],
    ['#12345g', 'hex 含非十六进制字符'],
    [LAYERED_GRADIENT, '多层渐变放不进 light-dark()'],
    ['red; } body { display: none', '分号、花括号'],
    ['url(https://example.com/)', '外部资源'],
    ['linear-gradient(red, url(x))', '渐变里的外部资源'],
    ['red /* x */', '注释'],
    ['rgba(1, 2, 3', '括号不成对'],
    ['linear-gradient(red, blue))', '括号不成对'],
    ['red !important', '感叹号'],
    ['u\\72l(x)', '反斜杠转义']
  ])('不可用：%s（%s）', value => {
    expect(isValidColor(value, imageLightDark)).toBe(false)
  })

  it('浏览器不支持在 light-dark() 里用图像：渐变不可用，颜色照常', () => {
    expect(isValidColor(GRADIENT, noImageLightDark)).toBe(false)
    expect(isValidColor('red', noImageLightDark)).toBe(true)
  })
})

const EMPTY = { light: '', dark: '' }

function config(days: readonly number[]): FreshnessRanges {
  return { ranges: days.map(value => emptyRange(value)), stale: { text: EMPTY, background: EMPTY } }
}

const daysOf = (value: FreshnessRanges): number[] => value.ranges.map(range => range.days)

describe('sanitizeFreshnessRanges', () => {
  it.each([undefined, null, 'Sample text', [], { ranges: 'x' }])('不合法：用默认（%s）', value => {
    expect(sanitizeFreshnessRanges(value)).toEqual(DEFAULT_FRESHNESS_RANGES)
  })

  it('逐项校验：天数取整、越界的时段丢弃，按天数排序去重，颜色只收安全的写法，hex 统一', () => {
    const value = sanitizeFreshnessRanges({
      ranges: [
        { days: 365, text: { light: '#CF222E', dark: 'red; }' }, background: { light: 'rgba(9, 105, 218, 0.5)', dark: 3 } },
        { days: 6.6 },
        { days: 0 },
        { days: 4000 },
        { days: 7, text: { light: 'blue' } },
        'bad'
      ],
      stale: { background: { dark: '#ABC' } }
    })
    expect(daysOf(value)).toEqual([7, 365])
    expect(value.ranges[1]).toEqual({
      days: 365,
      text: { light: '#cf222e', dark: '' },
      background: { light: 'rgba(9, 105, 218, 0.5)', dark: '' }
    })
    expect(value.stale).toEqual({ text: EMPTY, background: { light: '', dark: '#aabbcc' } })
  })

  it(`最多 ${MAX_FRESHNESS_RANGES} 个；一个都没有时用默认`, () => {
    expect(daysOf(sanitizeFreshnessRanges({ ranges: [1, 2, 3, 4, 5, 6, 7, 8].map(days => ({ days })) }))).toEqual([1, 2, 3, 4, 5, 6])
    expect(sanitizeFreshnessRanges({ ranges: [{ days: 0 }] })).toEqual(DEFAULT_FRESHNESS_RANGES)
  })

  it('没有时段设置时按 1.6 的天数、颜色换算', () => {
    const value = sanitizeFreshnessRanges(undefined, {
      days: { fresh: 7, recent: 90 },
      colors: { fresh: { light: '#cf222e', dark: '' }, stale: { light: '', dark: 'red' } }
    })
    expect(daysOf(value)).toEqual([7, 90])
    expect(value.ranges[0]?.text).toEqual({ light: '#cf222e', dark: '' })
    expect(value.ranges[1]?.text).toEqual(EMPTY)
    expect(value.stale).toEqual({ text: { light: '', dark: 'red' }, background: EMPTY })
  })
})

describe('migrateLegacyFreshness', () => {
  it('没有、不合法：默认 30、365 天', () => {
    expect(daysOf(migrateLegacyFreshness(undefined, undefined))).toEqual([30, 365])
    expect(daysOf(migrateLegacyFreshness({ fresh: 'x', recent: -1 }, 'x'))).toEqual([30, 365])
  })

  it('次近不大于近期：次近按默认；近期已是上限时只留一个', () => {
    expect(daysOf(migrateLegacyFreshness({ fresh: 400, recent: 300 }, undefined))).toEqual([400, 401])
    expect(daysOf(migrateLegacyFreshness({ fresh: MAX_FRESH_DAYS, recent: 30 }, undefined))).toEqual([MAX_FRESH_DAYS])
  })
})

describe('改动', () => {
  it('withFreshnessColor：按天数找时段改一项，其他不变；时段已不在时不改', () => {
    const base = config([30, 365])
    const next = withFreshnessColor(base, 365, 'background', 'dark', '#d29922')
    expect(next.ranges[1]?.background).toEqual({ light: '', dark: '#d29922' })
    expect(next.ranges[0]).toBe(base.ranges[0])
    expect(withFreshnessColor(next, 'stale', 'text', 'light', 'red').stale.text).toEqual({ light: 'red', dark: '' })
    expect(withFreshnessColor(base, 90, 'text', 'light', 'red')).toEqual(base)
  })

  it('withRangeDays：取整、按天数重新排序；越界、与其他时段重复时不改', () => {
    const base = config([30, 365])
    expect(daysOf(withRangeDays(base, 0, 400.4))).toEqual([365, 400])
    expect(withRangeDays(base, 0, 365)).toBe(base)
    expect(withRangeDays(base, 0, 0)).toBe(base)
    expect(withRangeDays(base, 0, MAX_FRESH_DAYS + 1)).toBe(base)
    expect(canSetRangeDays(base, 1, 365)).toBe(true)
    expect(canSetRangeDays(base, 1, 30)).toBe(false)
  })

  it('nextRangeDays、withAddedRange：最后一个的两倍；到上限时取最大空隙的中点；满了不加', () => {
    expect(nextRangeDays(config([30, 365]))).toBe(730)
    expect(nextRangeDays(config([1000, MAX_FRESH_DAYS]))).toBe(2325)
    expect(nextRangeDays(config([1, 2, 3, 4, 5, 6]))).toBeUndefined()
    expect(daysOf(withAddedRange(config([30, 365])))).toEqual([30, 365, 730])
    const full = config([1, 2, 3, 4, 5, 6])
    expect(withAddedRange(full)).toBe(full)
  })

  it('withoutRange：删除；至少留一个', () => {
    expect(daysOf(withoutRange(config([30, 365]), 0))).toEqual([365])
    const single = config([30])
    expect(withoutRange(single, 0)).toBe(single)
  })

  it('toneOf：时段按先后循环取色调，更早的为中性', () => {
    expect([0, 1, 2, 5, 6].map(key => toneOf(key))).toEqual(['success', 'attention', 'severe', 'accent', 'success'])
    expect(toneOf('stale')).toBe('neutral')
  })
})
