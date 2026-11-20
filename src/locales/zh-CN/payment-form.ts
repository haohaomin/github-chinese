import type { PageDictionary } from '../../core/types'

/**
 * 付款表单：GitHub 的信用卡表单是 Zuora 托管页（www.zuora.com），以跨源 iframe 嵌在 GitHub 页面里，
 * 由付款表单脚本单独翻译（见 entrypoints/payment-form.content.ts，设置页开启「汉化付款表单」后生效）。
 * GitHub 页面不检测此页面类型：词条只放 scoped，不作用于 GitHub 页面。
 * 原文取自托管页：字段标签带星号，下拉框首项前后带短横线，校验提示由托管页脚本写在字段下方。
 * 托管页里隐藏的字段（持卡人、卡类型、国家与地址等由 GitHub 页面收集）不收
 */
export default {
  scoped: {
    // 字段
    'Card Number *': '卡号 *',
    'Expiration Date *': '有效期 *',
    'Expiration Date (YYYY) *': '有效期 (YYYY) *',
    // 有效期字段组的标题、年份下拉框的标签（读屏用）
    'Expiration date*': '有效期*',
    'Expiration Date': '有效期',
    '- Select One -': '- 请选择 -',
    // CVV 说明图标的读屏文字
    'The three or four digit number located either on the front or back of a credit or debit card':
      '信用卡或借记卡正面或背面的三位或四位数字',
    'Save payment information': '保存付款信息',

    // 校验提示
    'Required Field Not Completed': '必填字段未填写',
    'Invalid Card Number': '卡号无效',
    'Invalid Card Type': '卡类型无效',
    'Invalid CVV Number': 'CVV 无效',
    'Invalid number value.': '数值无效。',
    'Card number not allowed. Please use a different payment method.': '不允许使用此卡号。请使用其他付款方式。',

    // 托管页地址已失效（同一地址重复打开）
    'Attempt_Exceed_Limitation - Attempt exceed the limitation, refresh page to try again.':
      'Attempt_Exceed_Limitation - 尝试次数超出限制，请刷新页面后重试。'
  }
} satisfies PageDictionary
