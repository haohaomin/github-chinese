import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { $, settle } from './helpers'

/**
 * 区域词条（PageDictionary.contextual）：词典未命中时，按文本所在区域查表。
 * 夹具取自账单地址表单（国家/地区与美国州下拉框）与组织资料的位置选择器，内容换成中性占位
 */
const BUNDLE: LocaleBundle = [
  [
    'common',
    {
      static: { Afghanistan: '阿富汗', Texas: '得克萨斯州' },
      contextual: [
        ['select[name*="country"] option, .js-org-country-item', { Chad: '乍得', Georgia: '格鲁吉亚' }],
        ['#region_us_states option', { Georgia: '佐治亚州' }]
      ]
    }
  ],
  ['settings', { contextual: [['.settings-only', { Chad: '乍得（设置）' }]], scoped: { Profile: '个人资料' } }]
]

const FORM = `
  <select name="billing_contact[country_code]" id="country">
    <option value="AF">Afghanistan</option>
    <option value="TD"> Chad </option>
    <option value="GE">Georgia</option>
  </select>
  <select name="billing_contact[region]" id="region_us_states">
    <option value="Georgia">Georgia</option>
    <option value="Texas">Texas</option>
  </select>
  <p id="name">Chad</p>
  <p id="state">Georgia</p>`

let translator: Translator | undefined

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

function start(html: string, bundle: LocaleBundle = BUNDLE, pages: readonly ('common' | 'settings')[] = ['common']): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: createMatcher(bundle), host: window, resolvePages: () => pages })
  translator.start()
  return translator
}

describe('matcher：区域词条', () => {
  const matcher = createMatcher(BUNDLE)

  it('按规范化原文查表，保留首尾空白；越具体的页面类型越靠前', () => {
    expect(matcher.contextual(' Chad ', ['common', 'settings'])).toEqual([
      ['.settings-only', ' 乍得（设置）'],
      ['select[name*="country"] option, .js-org-country-item', ' 乍得 ']
    ])
    expect(matcher.contextual('Georgia', ['common'])).toEqual([
      ['select[name*="country"] option, .js-org-country-item', '格鲁吉亚'],
      ['#region_us_states option', '佐治亚州']
    ])
    expect(matcher.contextual('Jordan', ['common'])).toEqual([])
  })

  it('页面范围内有无区域词条；区域词条不进 static', () => {
    expect(matcher.hasContextual(['common'])).toBe(true)
    expect(createMatcher([['settings', { scoped: { Profile: '个人资料' } }]]).hasContextual(['settings'])).toBe(false)
    expect(matcher.translate('Chad', ['common'])).toBeUndefined()
  })
})

describe('translator：区域词条', () => {
  it('下拉框里的同形词按所在区域译出，区域外保持原文', async () => {
    start(FORM)
    await settle()
    const options = [...document.querySelectorAll('#country option')].map(option => option.textContent)
    expect(options).toEqual(['阿富汗', ' 乍得 ', '格鲁吉亚'])
    expect([...document.querySelectorAll('#region_us_states option')].map(option => option.textContent)).toEqual(['佐治亚州', '得克萨斯州'])
    expect($('#name').textContent).toBe('Chad')
    expect($('#state').textContent).toBe('Georgia')
  })

  it('动态插入的选项同样按区域译出；停用后还原', async () => {
    const t = start('<select name="country" id="country"></select>')
    const option = document.createElement('option')
    option.textContent = 'Chad'
    $('#country').append(option)
    await settle()
    expect(option.textContent).toBe('乍得')
    t.stop()
    expect(option.textContent).toBe('Chad')
  })

  it('正式语言包：账单地址的国家/地区与美国州下拉框', async () => {
    start(FORM, zhCN)
    await settle()
    expect([...document.querySelectorAll('#country option')].map(option => option.textContent?.trim())).toEqual([
      '阿富汗',
      '乍得',
      '格鲁吉亚'
    ])
    expect($('#region_us_states option').textContent).toBe('佐治亚州')
    expect($('#name').textContent).toBe('Chad')
  })
})

describe('translator：选中项写回原文', () => {
  const PICKER = `
    <details class="js-dropdown" open>
      <summary><span class="js-org-location-input">Select a location</span></summary>
      <div class="SelectMenu-list">
        <div class="SelectMenu-item js-org-country-item" role="menuitem">Chad</div>
        <div class="SelectMenu-item js-org-country-item" role="menuitem">Afghanistan</div>
      </div>
    </details>
    <input type="hidden" class="js-org-location-input-hidden" name="organization[profile_location]" value="">`

  /** 模拟页面在 document 上委托的点击处理：把选中项的文字写进隐藏字段与按钮文字 */
  function pageHandler(event: Event): void {
    const item = (event.target as Element).closest('.js-org-country-item')
    if (!item) return
    const text = item.textContent ?? ''
    $('.js-org-location-input-hidden').setAttribute('value', text)
    $('.js-org-location-input').textContent = text
  }

  afterEach(() => document.removeEventListener('click', pageHandler))

  it('字段值是选中项的译文时写回原文；显示的文字不变', async () => {
    start(PICKER, zhCN)
    document.addEventListener('click', pageHandler)
    await settle()
    const [chad, afghanistan] = [...document.querySelectorAll<HTMLElement>('.js-org-country-item')]
    expect(chad?.textContent).toBe('乍得')
    chad?.click()
    expect($('.js-org-location-input-hidden').getAttribute('value')).toBe('Chad')
    expect($('.js-org-location-input').textContent).toBe('乍得')
    afghanistan?.click()
    expect($('.js-org-location-input-hidden').getAttribute('value')).toBe('Afghanistan')
  })

  it('字段值不是选中项的文字（页面另行处理）时不改', async () => {
    start(PICKER, zhCN)
    await settle()
    $('.js-org-location-input-hidden').setAttribute('value', 'Elsewhere')
    document.querySelector<HTMLElement>('.js-org-country-item')!.click()
    expect($('.js-org-location-input-hidden').getAttribute('value')).toBe('Elsewhere')
  })

  it('停用后不再处理', async () => {
    const t = start(PICKER, zhCN)
    document.addEventListener('click', pageHandler)
    await settle()
    t.stop()
    $('.js-org-country-item').textContent = '乍得'
    document.querySelector<HTMLElement>('.js-org-country-item')!.click()
    expect($('.js-org-location-input-hidden').getAttribute('value')).toBe('乍得')
  })
})
