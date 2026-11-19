import { formatColor, formatGradient, type ColorResolver } from '../../../src/shared/color'
import { initialPalette, newStopPosition } from '../../../src/entrypoints/options/palette'

const FALLBACK = '#1a7f37'
const resolve: ColorResolver = text => (text === 'red' ? { r: 255, g: 0, b: 0, a: 1 } : undefined)
const valid = (): boolean => true

describe('调色盘的初始状态', () => {
  it('纯色：按原写法拆开，渐变由它生成', () => {
    const state = initialPalette(' rgba(9, 105, 218, 0.5) ', FALLBACK, resolve, valid)
    expect(state.mode).toBe('solid')
    expect(state.format).toBe('rgb')
    expect(formatColor(state.solid, state.format)).toBe('rgba(9, 105, 218, 0.5)')
    expect(state.solidFromValue).toBe(true)
    expect(state.gradientFromValue).toBe(false)
    expect(formatGradient(state.gradient, 'hex')).toMatch(/^linear-gradient\(90deg, #0969da80 0%, /)
  })

  it('hex 可省 #；颜色名按 hex 写', () => {
    expect(initialPalette('abc', FALLBACK, resolve, valid).format).toBe('hex')
    expect(formatColor(initialPalette('abc', FALLBACK, resolve, valid).solid, 'hex')).toBe('#aabbcc')
    expect(formatColor(initialPalette('red', FALLBACK, resolve, valid).solid, 'hex')).toBe('#ff0000')
  })

  it('渐变：按原写法拆开，纯色取第一个色标（按位置）', () => {
    const state = initialPalette('linear-gradient(90deg, red 60%, #0969da 10%)', FALLBACK, resolve, valid)
    expect(state.mode).toBe('gradient')
    expect(state.gradientFromValue).toBe(true)
    expect(state.solidFromValue).toBe(false)
    expect(formatColor(state.solid, 'hex')).toBe('#ff0000')
  })

  it('为空、浏览器不认、拆解不了时用默认色（hex）', () => {
    for (const [text, isValid] of [
      ['', valid],
      ['#0969da', () => false],
      ['linear-gradient(red 10px, red)', valid],
      ['oklch(70% 0.1 200)', valid]
    ] as const) {
      const state = initialPalette(text, FALLBACK, resolve, isValid)
      expect(state.mode).toBe('solid')
      expect(state.format).toBe('hex')
      expect(formatColor(state.solid, 'hex')).toBe(FALLBACK)
      expect(state.solidFromValue).toBe(false)
    }
  })
})

describe('新色标的位置', () => {
  it('相邻色标间最大空隙的中点', () => {
    const color = { h: 0, s: 0, v: 0, a: 1 }
    expect(newStopPosition([0, 100].map(position => ({ color, position })))).toBe(50)
    expect(newStopPosition([0, 20, 100].map(position => ({ color, position })))).toBe(60)
    expect(newStopPosition([100, 0, 30].map(position => ({ color, position })))).toBe(65)
  })
})
