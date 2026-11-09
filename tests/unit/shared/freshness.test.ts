import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FRESHNESS_COLORS,
  normalizeHexColor,
  sanitizeFreshnessColors,
  withFreshnessColor,
  type FreshnessColors
} from '../../../src/shared/freshness'

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

describe('sanitizeFreshnessColors', () => {
  it.each([undefined, null, 'Sample text', 42, []])('不是对象：都为默认（%s）', value => {
    expect(sanitizeFreshnessColors(value)).toEqual(DEFAULT_FRESHNESS_COLORS)
  })

  it('逐项校验：统一写法；缺失、类型不符、格式不符的为默认；未知的项丢弃', () => {
    expect(
      sanitizeFreshnessColors({
        fresh: { light: '#CF222E', dark: 'abc', extra: '#000000' },
        recent: { light: 42, dark: 'url(https://example.com/)' },
        stale: 'Sample text',
        other: { light: '#000000', dark: '#000000' }
      })
    ).toEqual({
      fresh: { light: '#cf222e', dark: '#aabbcc' },
      recent: { light: '', dark: '' },
      stale: { light: '', dark: '' }
    })
  })
})

describe('withFreshnessColor', () => {
  it('只改给出的一项，返回新对象，原对象不变', () => {
    const colors: FreshnessColors = { ...DEFAULT_FRESHNESS_COLORS, recent: { light: '#9a6700', dark: '' } }
    const next = withFreshnessColor(colors, 'recent', 'dark', '#d29922')
    expect(next).toEqual({ ...DEFAULT_FRESHNESS_COLORS, recent: { light: '#9a6700', dark: '#d29922' } })
    expect(colors.recent).toEqual({ light: '#9a6700', dark: '' })
    expect(next.fresh).toBe(colors.fresh)
    expect(withFreshnessColor(next, 'recent', 'light', '').recent).toEqual({ light: '', dark: '#d29922' })
  })
})
