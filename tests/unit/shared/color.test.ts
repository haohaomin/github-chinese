import {
  colorAt,
  createCanvasResolver,
  defaultGradient,
  formatColor,
  formatGradient,
  hslToHsv,
  hsvToHsl,
  hsvToRgb,
  parseColor,
  parseGradient,
  parseHex,
  rgbToHsv,
  type ColorFormat,
  type ColorResolver,
  type Hsva,
  type Rgba
} from '../../../src/shared/color'

/** 颜色名的换算（测试环境没有画布） */
const NAMED: Readonly<Record<string, Rgba>> = {
  red: { r: 255, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 }
}
const resolve: ColorResolver = text => NAMED[text.toLowerCase()]

/** 解析后按同一写法写出 */
function roundTrip(text: string): string | undefined {
  const parsed = parseColor(text, resolve)
  return parsed && formatColor(parsed.color, parsed.format)
}

function rgbOf(color: Hsva): number[] {
  const { r, g, b, a } = hsvToRgb(color)
  return [Math.round(r), Math.round(g), Math.round(b), Math.round(a * 100) / 100]
}

describe('颜色换算', () => {
  it.each([
    [
      { r: 255, g: 0, b: 0, a: 1 },
      { h: 0, s: 1, v: 1 }
    ],
    [
      { r: 0, g: 255, b: 0, a: 1 },
      { h: 120, s: 1, v: 1 }
    ],
    [
      { r: 0, g: 0, b: 255, a: 1 },
      { h: 240, s: 1, v: 1 }
    ],
    [
      { r: 255, g: 0, b: 255, a: 1 },
      { h: 300, s: 1, v: 1 }
    ],
    [
      { r: 128, g: 128, b: 128, a: 1 },
      { h: 0, s: 0, v: 128 / 255 }
    ]
  ])('RGB ↔ HSV：%j', (rgb, hsv) => {
    const converted = rgbToHsv(rgb)
    expect(converted.h).toBeCloseTo(hsv.h)
    expect(converted.s).toBeCloseTo(hsv.s)
    expect(converted.v).toBeCloseTo(hsv.v)
    expect(rgbOf(converted)).toEqual([rgb.r, rgb.g, rgb.b, 1])
  })

  it('灰色、黑色保留传入的色相与饱和度', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 0, a: 1 }, 200, 0.4)).toEqual({ h: 200, s: 0.4, v: 0, a: 1 })
    expect(rgbToHsv({ r: 255, g: 255, b: 255, a: 0.5 }, 30).h).toBe(30)
  })

  it('HSV ↔ HSL 互换，色相不变', () => {
    const hsv: Hsva = { h: 212, s: 0.96, v: 0.85, a: 1 }
    const hsl = hsvToHsl(hsv)
    const back = hslToHsv(hsl, 1)
    expect(back.h).toBe(212)
    expect(back.s).toBeCloseTo(hsv.s)
    expect(back.v).toBeCloseTo(hsv.v)
    expect(hsvToHsl({ h: 50, s: 0, v: 1, a: 1 })).toEqual({ h: 50, s: 0, l: 1 })
  })
})

describe('纯色的解析与写法', () => {
  it.each([
    ['#0969da', '#0969da'],
    ['#0969DA', '#0969da'],
    ['#fff', '#ffffff'],
    ['#0969da80', '#0969da80'],
    ['#f008', '#ff000088'],
    ['rgb(9, 105, 218)', 'rgb(9, 105, 218)'],
    ['rgba(9, 105, 218, 0.5)', 'rgba(9, 105, 218, 0.5)'],
    ['rgb(9 105 218 / 50%)', 'rgba(9, 105, 218, 0.5)'],
    ['rgb(100% 0% 0%)', 'rgb(255, 0, 0)'],
    ['rgba(300, -5, 0, 2)', 'rgb(255, 0, 0)'],
    ['hsl(212, 92%, 45%)', 'hsl(212, 92%, 45%)'],
    ['hsla(212, 92%, 45%, 0.25)', 'hsla(212, 92%, 45%, 0.25)'],
    ['hsl(0.5turn 100% 50%)', 'hsl(180, 100%, 50%)'],
    ['hsl(212 92 45 / 0.5)', 'hsla(212, 92%, 45%, 0.5)']
  ])('%s → %s', (input, output) => {
    expect(roundTrip(input)).toBe(output)
  })

  it('写法：rgb()、hsl() 记为各自的写法，其余按 hex', () => {
    expect(parseColor('rgb(1, 2, 3)')?.format).toBe<ColorFormat>('rgb')
    expect(parseColor('hsla(1, 2%, 3%, 1)')?.format).toBe<ColorFormat>('hsl')
    expect(parseColor('#123')?.format).toBe<ColorFormat>('hex')
    expect(parseColor('red', resolve)?.format).toBe<ColorFormat>('hex')
  })

  it('颜色名等交给换算函数；换算不了、写法不对时为 undefined', () => {
    expect(roundTrip('red')).toBe('#ff0000')
    expect(roundTrip('transparent')).toBe('#00000000')
    expect(parseColor('red')).toBeUndefined()
    for (const text of [
      '',
      '#12',
      '#12345',
      'rgb(1, 2)',
      'rgb(1 2 3 4)',
      'rgb(1, 2, 3, 4, 5)',
      'hsl(red, 1%, 2%)',
      'rgb(1 2 3 /)',
      'nope'
    ]) {
      expect(parseColor(text, resolve)).toBeUndefined()
    }
  })

  it('hex 解析：三、四、六、八位', () => {
    expect(parseHex('#abc')).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc, a: 1 })
    expect(parseHex('#00000000')).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    expect(parseHex('abc')).toBeUndefined()
  })

  it('rgb、hsl 的透明度保留两位小数；hex 按 1/255 取整，不透明时不写', () => {
    const color: Hsva = { h: 0, s: 1, v: 1, a: 0.333 }
    expect(formatColor(color, 'rgb')).toBe('rgba(255, 0, 0, 0.33)')
    expect(formatColor(color, 'hex')).toBe('#ff000055')
    expect(formatColor({ ...color, a: 0.999 }, 'hex')).toBe('#ff0000')
    expect(formatColor({ ...color, a: 1 }, 'hsl')).toBe('hsl(0, 100%, 50%)')
  })

  it('浏览器外没有画布：换算函数返回 undefined', () => {
    expect(createCanvasResolver()('red')).toBeUndefined()
  })
})

describe('渐变的解析与写法', () => {
  it.each([
    ['linear-gradient(90deg, #cf222e, #0969da)', 'linear-gradient(90deg, #cf222e 0%, #0969da 100%)'],
    ['linear-gradient(#cf222e, #0969da)', 'linear-gradient(180deg, #cf222e 0%, #0969da 100%)'],
    ['linear-gradient(to right, red 10%, white)', 'linear-gradient(90deg, #ff0000 10%, #ffffff 100%)'],
    ['linear-gradient(to top left, red, white)', 'linear-gradient(315deg, #ff0000 0%, #ffffff 100%)'],
    ['linear-gradient(0.25turn, red, white)', 'linear-gradient(90deg, #ff0000 0%, #ffffff 100%)'],
    [
      'radial-gradient(circle at top, rgb(255, 0, 0), rgba(0, 0, 255, 0.5) 80%)',
      'radial-gradient(circle at top, rgb(255, 0, 0) 0%, rgba(0, 0, 255, 0.5) 80%)'
    ],
    ['radial-gradient(red, white)', 'radial-gradient(#ff0000 0%, #ffffff 100%)'],
    ['conic-gradient(from 45deg at 50% 50%, red, white)', 'conic-gradient(from 45deg at 50% 50%, #ff0000 0%, #ffffff 100%)'],
    ['conic-gradient(red, white)', 'conic-gradient(from 0deg, #ff0000 0%, #ffffff 100%)'],
    ['repeating-linear-gradient(45deg, red 0%, white 10%)', 'repeating-linear-gradient(45deg, #ff0000 0%, #ffffff 10%)'],
    [
      'linear-gradient(90deg, hsl(0, 100%, 50%), hsl(120, 100%, 50%))',
      'linear-gradient(90deg, hsl(0, 100%, 50%) 0%, hsl(120, 100%, 50%) 100%)'
    ]
  ])('%s', (input, output) => {
    const parsed = parseGradient(input, resolve)
    expect(parsed && formatGradient(parsed.gradient, parsed.format)).toBe(output)
  })

  it('缺省的位置：中间的在前后已知位置间均分，小于前面的取前面的', () => {
    const positions = (text: string): number[] | undefined => parseGradient(text, resolve)?.gradient.stops.map(stop => stop.position)
    expect(positions('linear-gradient(red, white, red, white)')).toEqual([0, 100 / 3, 200 / 3, 100])
    expect(positions('linear-gradient(red 20%, white, red 80%)')).toEqual([20, 50, 80])
    expect(positions('linear-gradient(red 60%, white 30%)')).toEqual([60, 60])
    expect(positions('linear-gradient(red 0% 40%, white)')).toEqual([0, 40, 100])
  })

  it('无法拆解的写法为 undefined', () => {
    for (const text of [
      'linear-gradient(red)',
      'linear-gradient(red 10px, white)',
      'linear-gradient(red, 30%, white)',
      'linear-gradient(in oklch, red, white)',
      'linear-gradient(var(--a), white)',
      'conic-gradient(in hsl, red, white)',
      'red',
      'url(x)'
    ]) {
      expect(parseGradient(text, resolve)).toBeUndefined()
    }
  })

  it('色标按位置排列后写出', () => {
    const gradient = defaultGradient({ h: 0, s: 1, v: 1, a: 1 })
    const swapped = { ...gradient, stops: [...gradient.stops].reverse() }
    expect(formatGradient(swapped, 'hex')).toBe('linear-gradient(90deg, #ff0000 0%, #ffff00 100%)')
  })

  it('默认渐变：自左向右，到色相转 60° 的颜色；太灰时提高饱和度', () => {
    expect(formatGradient(defaultGradient({ h: 200, s: 0, v: 0.4, a: 1 }), 'hsl')).toBe(
      'linear-gradient(90deg, hsl(200, 0%, 40%) 0%, hsl(260, 43%, 35%) 100%)'
    )
  })

  it('某位置的颜色：相邻色标间插值，两端之外取端点色', () => {
    const stops = [
      { color: rgbToHsv({ r: 0, g: 0, b: 0, a: 1 }), position: 20 },
      { color: rgbToHsv({ r: 200, g: 100, b: 0, a: 0 }), position: 60 }
    ]
    expect(rgbOf(colorAt(stops, 40))).toEqual([100, 50, 0, 0.5])
    expect(rgbOf(colorAt(stops, 0))).toEqual([0, 0, 0, 1])
    expect(rgbOf(colorAt(stops, 100))).toEqual([200, 100, 0, 0])
  })
})
