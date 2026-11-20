import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 赞助页（/sponsors/<name>）：头部、目前 / 过往赞助者、团队成员、精选作品、赞助目标、等级选择，
 * 以及赞助结帐页（/sponsors/<name>/sponsorships）。
 * 赞助目标进度按元素拆开：「1%」「towards」「每月 $12,000」「goal」，片段译文拼读为「1% / 每月 $12,000 目標」。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 贊助；成就名 Public Sponsor 保留英文。
 * 等级的 rewards 取台湾群众募资通行的「回饋」；赞助者是人，量词用「位」；Create invoice 作「開立發票」。
 */

/** 目标金额 / 人数：「$12,000 per month」「100 monthly sponsors」 */
function goalTarget(target: string): string {
  const amount = /^(\$[\d,]+(?:\.\d{2})?) per month$/.exec(target)
  if (amount) return `每月 ${amount[1]}`
  const count = /^(\d[\d,]*) monthly sponsors?$/.exec(target)
  return count ? `${count[1]} 位每月贊助者` : target
}

/** 「已達成<目标>目標的 N%」，数字、英文与中文之间补空格 */
function goalProgress(percent: string, target: string): string {
  return `${joinCjk(joinCjk('已達成', goalTarget(target)), '目標的')} ${percent}%`
}

/** 成就名保留英文，与 profile 成就词典一致 */
const PUBLIC_SPONSOR_ACHIEVEMENT = '你的個人檔案將新增 Public Sponsor 成就。'

/** 自订金额提示：「the $10 monthly tier」→「每月 $10 等級」，「the $10 one-time tier」→「一次性 $10 等級」 */
function customAmountReward(amount: string, frequency: string): string {
  const tier = `${frequency === 'monthly' ? '每月' : '一次性'} ${amount}`
  return `${joinCjk(`你將獲得${tier}`, '等級列出的所有回饋。')}此外，${PUBLIC_SPONSOR_ACHIEVEMENT}`
}

export default {
  static: {
    // 头部
    'Become a sponsor to': '贊助',
    'Current sponsors': '目前的贊助者',
    'Past sponsors': '過往的贊助者',
    'Meet the team': '認識團隊',
    'Featured work': '精選作品',
    'Learn more about sponsoring developers and organizations': '瞭解如何贊助開發人員和組織',
    'You are previewing your GitHub Sponsors profile.': '你正在預覽自己的 GitHub 贊助個人檔案。',
    'Edit your profile.': '編輯你的個人檔案。',

    // 赞助目标
    'Be the first to sponsor this goal!': '成為第一位支持此目標的贊助者！',

    // 等级
    'Select a tier': '選擇等級',
    'Choose a custom amount': '選擇自訂金額',
    // 自订金额提示的另两种状态：未输入或低于最低金额 / 未达任何等级，
    // 与下方正则同在 #sponsors-custom-amount-message
    'Choose a custom amount.': '選擇自訂金額。',
    'A Public Sponsor achievement will be added to your profile.': PUBLIC_SPONSOR_ACHIEVEMENT,
    // 后接加粗的「你是贊助者。」；原文没有逗号，译文不加。hover 取微软繁中的「暫留」
    'Hover over your avatar to review the badge you’ll get that shows': '將游標暫留在頭像上可預覽你將獲得的徽章並看到它標示',
    "Hover over your avatar to review the badge you'll get that shows": '將游標暫留在頭像上可預覽你將獲得的徽章並看到它標示',

    // 结帐
    'Sponsor as': '贊助身分',
    'Sponsoring as': '贊助身分',
    'Set a sponsorship end date': '設定贊助結束日期',
    'Update sponsorship': '更新贊助',
    "Receive email updates from the maintainers you're sponsoring": '接收所贊助維護者的電子郵件動態',
    'Receive email updates from the maintainers you’re sponsoring': '接收所贊助維護者的電子郵件動態',
    'Your sponsorships': '你的贊助',
    'Sponsorship log': '贊助記錄',
    'Switch to invoiced billing': '切換為發票付款',
    'GitHub Invoiced Sponsor Agreement': 'GitHub 發票付款贊助者合約',
    // 等级回报的默认说明
    'Get a Sponsor badge on your profile': '在個人檔案上獲得贊助者徽章',
    // 结帐页所选等级为自订金额时的说明（位于 .markdown-body，按 core/ignore.ts 的占位文字放行）
    'Custom amount. A Public Sponsor achievement will be added to your profile.': `自訂金額。${PUBLIC_SPONSOR_ACHIEVEMENT}`,
    'Sponsorship summary': '贊助摘要',
    // 下月扣款说明的片段（金额在 <span> 中，整句见 inline）
    'Next month your billing cycle starts again and you will see a charge for': '下個月帳單週期重新開始時將向你收取',
    '. You can cancel at any time.': '。你可以隨時取消。',
    // 自订金额的输入校验
    'Please choose a whole-dollar amount': '請選擇整數美元金額'
  },
  scoped: {
    Invoices: '發票',
    Monthly: '每月',
    'One-time': '一次性',
    'a month': '每月',
    'one time': '一次性',
    towards: '/',
    goal: '目標',
    'Billing information': '帳單資訊',
    'Payment method': '付款方式',
    'Pay later': '稍後付款',
    'Full amount': '全額',
    'Invoice balance': '發票餘額',
    'Create invoice': '開立發票',
    'Create an invoice': '開立發票',
    'sponsors this goal': '支持此目標',
    'sponsor this goal': '支持此目標',
    'you’re a sponsor.': '你是贊助者。',
    "you're a sponsor.": '你是贊助者。',
    // 结帐页：标题「贊助 <strong>reedy</strong> / Tier confirmation」、编辑按钮的读屏文字、费用
    '/ Tier confirmation': '/ 等級確認',
    'selected tier': '所選等級',
    Fees: '費用',
    // 「Save $0.03 in fees when you switch to <a>invoiced billing.</a>」的链接文字（前半见 regexp）
    'invoiced billing.': '發票付款。'
  },
  regexp: [
    // 页面标题与按钮
    [/^Sponsor @([\w.-]+) on GitHub Sponsors$/, '在 GitHub 贊助上贊助 @$1'],
    [/^Sponsor @([\w.-]+)$/, '贊助 @$1'],
    [/^Sponsor (?!(?:tiers?|as|dashboard|goals?|profile|badge|button|page|updates?)$)([\w.-]+)$/, '贊助 $1'],
    [/^You must be logged in to sponsor (\S+)$/, '登入後才能贊助 $1'],
    [/^You are previewing (.+?)['’]s GitHub Sponsors profile\.$/, '你正在預覽 $1 的 GitHub 贊助個人檔案。'],
    [/^Edit (.+?)['’]s profile\.$/, '編輯 $1 的個人檔案。'],

    // 赞助目标
    [/^(@?[\w.-]+)['’]s goal is to$/, '$1 的目標是'],
    [/^earn (\$[\d,]+(?:\.\d{2})?) per month$/, '每月獲得 $1'],
    [/^have (\d[\d,]*) monthly sponsors?$/, '擁有 $1 位每月贊助者'],
    [/^(\$[\d,]+(?:\.\d{2})?) per month$/, '每月 $1'],
    [/^(\d[\d,]*) monthly sponsors?$/, '$1 位每月贊助者'],
    [/^(\d+)% towards goal$/, '已達成目標的 $1%'],
    [/^(\d+)% towards (.+) goal$/, (_, percent: string, target: string) => goalProgress(percent, target)],
    [/^and (\d[\d,]*) others? sponsors? this goal$/, '和其他 $1 位贊助者支持此目標'],

    // 等级与金额
    [/^(\$[\d,]+(?:\.\d{2})?) a month$/, '每月 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) one time$/, '一次性 $1'],
    [/^Amount must be at least (\$[\d,]+(?:\.\d{2})?)$/, '金額至少須為 $1'],
    [/^Amount exceeds maximum tier amount of (\$[\d,]+(?:\.\d{2})?)$/, '金額超過等級上限 $1'],
    // 自订金额提示：随输入金额变化，脚本拼出的金额不带千分位（$1000）。
    // 所在的 #sponsors-custom-amount-message 带 markdown-body、comment-body 类，需全局忽略规则豁免后才会翻译
    [
      /^You['’]ll receive any rewards listed in the (\$[\d,]+(?:\.\d{2})?) (monthly|one-time) tier\. Additionally, a Public Sponsor achievement will be added to your profile\.$/,
      (_, amount: string, frequency: string) => customAmountReward(amount, frequency)
    ],

    // 结帐
    [/^Receive email updates from (.+)$/, '接收 $1 的電子郵件動態'],
    // 以组织身分赞助时徽章说明的后半：setube-organization's a sponsor.（前半见 static 的 Hover over your avatar…）
    [/^([\w.-]+)['’]s a sponsor\.$/, '$1 是贊助者。'],
    // 等级选择按钮的读屏文字：選擇 + $5 a month tier
    [
      /^(\$[\d,]+(?:\.\d{2})?) (a month|one time) tier$/,
      (_, amount: string, frequency: string) => `${frequency === 'a month' ? '每月' : '一次性'} ${amount} 等級`
    ],
    // 费用说明：Save $0.03 in fees when you switch to <a>invoiced billing.</a>
    [/^Save (\$[\d,]+(?:\.\d{2})?) in fees when you switch to$/, '如需節省 $1 費用可切換為']
  ],
  inline: [
    // 下月扣款说明：「… you will see a charge for <span>$1.06</span>. You can cancel at any time.」
    [
      'Next month your billing cycle starts again and you will see a charge for {}. You can cancel at any time.',
      '下個月帳單週期重新開始時將向你收取 {}。你可以隨時取消。'
    ]
  ],
  ignore: [
    // 头部所在地
    'h2.f3 ~ div.mt-1.color-fg-muted',
    // 赞助目标描述
    '.Box-body label.d-block + p.mb-0',
    // 赞助目标下「<首个赞助者> and N others sponsor this goal」中的赞助者名
    'p.text-small.color-fg-muted > .Truncate',
    // 精选作品的储存库描述
    'ol.list-style-none li p.color-fg-muted.text-small',
    // 团队成员卡片
    '.sponsors-featured-item'
  ]
} satisfies PageDictionary
