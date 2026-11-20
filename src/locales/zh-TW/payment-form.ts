import type { PageDictionary } from '../../core/types'

/**
 * 付款表单：GitHub 的信用卡表单是 Zuora 托管页（www.zuora.com），以跨源 iframe 嵌在 GitHub 页面里，
 * 由付款表单脚本单独翻译（见 entrypoints/payment-form.content.ts，设置页开启「中文化付款表單」后生效）。
 * GitHub 页面不检测此页面类型：词条只放 scoped，不作用于 GitHub 页面。
 * 原文取自托管页：字段标签带星号，下拉框首项前后带短横线，校验提示由托管页脚本写在字段下方。
 * 托管页里隐藏的字段（持卡人、卡类型、国家与地址等由 GitHub 页面收集）不收。
 * 用语与 settings-account/plans.ts 的付款资讯一致：expiration date → 到期日，debit card → 金融卡
 */
export default {
  scoped: {
    // 字段
    'Card Number *': '卡號 *',
    'Expiration Date *': '到期日 *',
    'Expiration Date (YYYY) *': '到期日 (YYYY) *',
    // 有效期字段组的标题、年份下拉框的标签（读屏用）
    'Expiration date*': '到期日*',
    'Expiration Date': '到期日',
    '- Select One -': '- 選擇一項 -',
    // CVV 说明图标的读屏文字
    'The three or four digit number located either on the front or back of a credit or debit card':
      '信用卡或金融卡正面或背面的三位或四位數字',
    'Save payment information': '儲存付款資訊',

    // 校验提示
    'Required Field Not Completed': '必填欄位未填寫',
    'Invalid Card Number': '卡號無效',
    'Invalid Card Type': '卡片類型無效',
    'Invalid CVV Number': 'CVV 無效',
    'Invalid number value.': '數值無效。',
    'Card number not allowed. Please use a different payment method.': '不允許使用此卡號。請使用其他付款方式。',

    // 托管页地址已失效（同一地址重复打开）
    'Attempt_Exceed_Limitation - Attempt exceed the limitation, refresh page to try again.':
      'Attempt_Exceed_Limitation - 嘗試次數超出限制，請重新整理頁面後再試一次。'
  }
} satisfies PageDictionary
