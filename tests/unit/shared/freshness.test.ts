import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FRESHNESS_COLORS,
  isValidColor,
  normalizeHexColor,
  sanitizeFreshnessColors,
  withFreshnessColor,
  type FreshnessColors
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

  it('CSS 颜色与渐变原样保留（后台没有 CSS 接口，只查写法）；含注入字符、括号不成对的为默认', () => {
    expect(
      sanitizeFreshnessColors({
        fresh: { light: ` ${GRADIENT} `, dark: 'rgba(9, 105, 218, 0.5)' },
        recent: { light: '#1A7F3780', dark: 'red; } body { display: none' },
        stale: { light: 'rgba(1, 2, 3', dark: 'red /* x */' }
      })
    ).toEqual({
      fresh: { light: GRADIENT, dark: 'rgba(9, 105, 218, 0.5)' },
      recent: { light: '#1A7F3780', dark: '' },
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
