import { createMatcher } from '../../../src/core/matcher'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import paymentFormCN from '../../../src/locales/zh-CN/payment-form'
import paymentFormTW from '../../../src/locales/zh-TW/payment-form'

const PAGES: readonly PageKey[] = ['payment-form']

describe.each([
  ['zh-CN', paymentFormCN],
  ['zh-TW', paymentFormTW]
] as const)('%s 付款表单词典', (_, dict: PageDictionary) => {
  const matcher = createMatcher([['payment-form', dict]])

  it('只有 scoped：GitHub 页面不检测此页面类型，词条不作用于 GitHub 页面', () => {
    expect(Object.keys(dict)).toEqual(['scoped'])
  })

  it.each(Object.entries(dict.scoped ?? {}))('%s', (source, target) => {
    expect(matcher.translate(source, PAGES)).toBe(target)
  })
})

describe('付款表单词典的译文', () => {
  it.each([
    ['Card Number *', '卡号 *', '卡號 *'],
    ['Expiration Date *', '有效期 *', '到期日 *'],
    ['- Select One -', '- 请选择 -', '- 選擇一項 -'],
    ['Save payment information', '保存付款信息', '儲存付款資訊'],
    ['Required Field Not Completed', '必填字段未填写', '必填欄位未填寫'],
    ['Invalid Card Type', '卡类型无效', '卡片類型無效']
  ])('%s → %s / %s', (source, cn, tw) => {
    expect(createMatcher([['payment-form', paymentFormCN]]).translate(source, PAGES)).toBe(cn)
    expect(createMatcher([['payment-form', paymentFormTW]]).translate(source, PAGES)).toBe(tw)
  })

  it('GitHub 页面不用付款表单词典', () => {
    const matcher = createMatcher(zhCN)
    expect(matcher.translate('Invalid CVV Number', ['common', 'settings'])).toBeUndefined()
    expect(matcher.translate('Invalid CVV Number', PAGES)).toBe('CVV 无效')
  })
})
