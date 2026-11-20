import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 赞助页（/sponsors/<name>）：头部、当前 / 过往赞助者、团队成员、精选作品、赞助目标、等级选择，
 * 以及赞助结账页（/sponsors/<name>/sponsorships）。
 * 赞助目标进度按元素拆开：「1%」「towards」「每月 $12,000」「goal」，片段译文拼读为「1% / 每月 $12,000 目标」。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 赞助；成就名 Public Sponsor 保留英文。
 */

/** 目标金额 / 人数：「$12,000 per month」「100 monthly sponsors」 */
function goalTarget(target: string): string {
  const amount = /^(\$[\d,]+(?:\.\d{2})?) per month$/.exec(target)
  if (amount) return `每月 ${amount[1]}`
  const count = /^(\d[\d,]*) monthly sponsors?$/.exec(target)
  return count ? `${count[1]} 个每月赞助者` : target
}

/** 「已完成<目标>目标的 N%」，数字、英文与中文之间补空格 */
function goalProgress(percent: string, target: string): string {
  return `${joinCjk(joinCjk('已完成', goalTarget(target)), '目标的')} ${percent}%`
}

/** 成就名保留英文，与 profile 成就词典一致 */
const PUBLIC_SPONSOR_ACHIEVEMENT = '你的个人资料将获得 Public Sponsor 成就。'

/** 自定义金额提示：「the $10 monthly tier」→「每月 $10 等级」，「the $10 one-time tier」→「一次性 $10 等级」 */
function customAmountReward(amount: string, frequency: string): string {
  const tier = `${frequency === 'monthly' ? '每月' : '一次性'} ${amount}`
  return `${joinCjk(`你将获得${tier}`, '等级列出的全部回报。')}此外，${PUBLIC_SPONSOR_ACHIEVEMENT}`
}

export default {
  static: {
    // 头部
    'Become a sponsor to': '赞助',
    'Current sponsors': '当前赞助者',
    'Past sponsors': '过往赞助者',
    'Meet the team': '团队成员',
    'Featured work': '精选作品',
    'Learn more about sponsoring developers and organizations': '了解如何赞助开发者和组织',
    'You are previewing your GitHub Sponsors profile.': '你正在预览自己的 GitHub 赞助个人资料。',
    'Edit your profile.': '编辑个人资料。',

    // 赞助目标
    'Be the first to sponsor this goal!': '成为首位支持此目标的赞助者！',

    // 等级
    'Select a tier': '选择等级',
    'Choose a custom amount': '自定义金额',
    // 自定义金额提示的另两种状态：未输入或低于最低金额 / 未达任何等级，
    // 与下方正则同在 #sponsors-custom-amount-message
    'Choose a custom amount.': '选择自定义金额。',
    'A Public Sponsor achievement will be added to your profile.': PUBLIC_SPONSOR_ACHIEVEMENT,
    // 后接加粗的「你是赞助者。」；原文没有逗号，译文不加
    'Hover over your avatar to review the badge you’ll get that shows': '将鼠标悬停在头像上可预览你将获得的徽章并看到它表明',
    "Hover over your avatar to review the badge you'll get that shows": '将鼠标悬停在头像上可预览你将获得的徽章并看到它表明',

    // 结账
    'Sponsor as': '赞助身份',
    'Sponsoring as': '赞助身份',
    'Set a sponsorship end date': '设置赞助结束日期',
    'Update sponsorship': '更新赞助',
    "Receive email updates from the maintainers you're sponsoring": '接收所赞助维护者的电子邮件动态',
    'Receive email updates from the maintainers you’re sponsoring': '接收所赞助维护者的电子邮件动态',
    'Your sponsorships': '你的赞助',
    'Sponsorship log': '赞助日志',
    'Switch to invoiced billing': '切换到开票计费',
    'GitHub Invoiced Sponsor Agreement': 'GitHub 发票赞助协议',
    // 等级回报的默认说明
    'Get a Sponsor badge on your profile': '在个人资料上获得赞助者徽章',
    // 结账页所选等级为自定义金额时的说明（位于 .markdown-body，按 core/ignore.ts 的占位文字放行）
    'Custom amount. A Public Sponsor achievement will be added to your profile.': `自定义金额。${PUBLIC_SPONSOR_ACHIEVEMENT}`,
    'Sponsorship summary': '赞助摘要',
    // 下月扣款说明的片段（金额在 <span> 中，整句见 inline）
    'Next month your billing cycle starts again and you will see a charge for': '下个月计费周期重新开始时将向你收取',
    '. You can cancel at any time.': '。你可以随时取消。',
    // 自定义金额的输入校验
    'Please choose a whole-dollar amount': '请选择整美元金额'
  },
  scoped: {
    Invoices: '发票',
    Monthly: '每月',
    'One-time': '一次性',
    'a month': '每月',
    'one time': '一次性',
    towards: '/',
    goal: '目标',
    'Billing information': '账单信息',
    'Payment method': '付款方式',
    'Pay later': '稍后付款',
    'Full amount': '全额',
    'Invoice balance': '发票余额',
    'Create invoice': '创建发票',
    'Create an invoice': '创建发票',
    'sponsors this goal': '支持此目标',
    'sponsor this goal': '支持此目标',
    'you’re a sponsor.': '你是赞助者。',
    "you're a sponsor.": '你是赞助者。',
    // 结账页：标题「赞助 <strong>reedy</strong> / Tier confirmation」、编辑按钮的读屏文字、费用
    '/ Tier confirmation': '/ 等级确认',
    'selected tier': '所选等级',
    Fees: '费用',
    // 「Save $0.03 in fees when you switch to <a>invoiced billing.</a>」的链接文字（前半见 regexp）
    'invoiced billing.': '开票计费。'
  },
  regexp: [
    // 页面标题与按钮
    [/^Sponsor @([\w.-]+) on GitHub Sponsors$/, '通过 GitHub 赞助来赞助 @$1'],
    [/^Sponsor @([\w.-]+)$/, '赞助 @$1'],
    [/^Sponsor (?!(?:tiers?|as|dashboard|goals?|profile|badge|button|page|updates?)$)([\w.-]+)$/, '赞助 $1'],
    [/^You must be logged in to sponsor (\S+)$/, '登录后才能赞助 $1'],
    [/^You are previewing (.+?)['’]s GitHub Sponsors profile\.$/, '你正在预览 $1 的 GitHub 赞助个人资料。'],
    [/^Edit (.+?)['’]s profile\.$/, '编辑 $1 的个人资料。'],

    // 赞助目标
    [/^(@?[\w.-]+)['’]s goal is to$/, '$1 的目标是'],
    [/^earn (\$[\d,]+(?:\.\d{2})?) per month$/, '每月获得 $1'],
    [/^have (\d[\d,]*) monthly sponsors?$/, '拥有 $1 个每月赞助者'],
    [/^(\$[\d,]+(?:\.\d{2})?) per month$/, '每月 $1'],
    [/^(\d[\d,]*) monthly sponsors?$/, '$1 个每月赞助者'],
    [/^(\d+)% towards goal$/, '已完成目标的 $1%'],
    [/^(\d+)% towards (.+) goal$/, (_, percent: string, target: string) => goalProgress(percent, target)],
    [/^and (\d[\d,]*) others? sponsors? this goal$/, '及其他 $1 个赞助者支持此目标'],

    // 等级与金额
    [/^(\$[\d,]+(?:\.\d{2})?) a month$/, '每月 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) one time$/, '一次性 $1'],
    [/^Amount must be at least (\$[\d,]+(?:\.\d{2})?)$/, '金额至少为 $1'],
    [/^Amount exceeds maximum tier amount of (\$[\d,]+(?:\.\d{2})?)$/, '金额超过等级上限 $1'],
    // 自定义金额提示：随输入金额变化，脚本拼出的金额不带千分位（$1000）。
    // 所在的 #sponsors-custom-amount-message 带 markdown-body、comment-body 类，需全局忽略规则豁免后才会翻译
    [
      /^You['’]ll receive any rewards listed in the (\$[\d,]+(?:\.\d{2})?) (monthly|one-time) tier\. Additionally, a Public Sponsor achievement will be added to your profile\.$/,
      (_, amount: string, frequency: string) => customAmountReward(amount, frequency)
    ],

    // 结账
    [/^Receive email updates from (.+)$/, '接收 $1 的电子邮件动态'],
    // 以组织身份赞助时徽章说明的后半：setube-organization's a sponsor.（前半见 static 的 Hover over your avatar…）
    [/^([\w.-]+)['’]s a sponsor\.$/, '$1 是赞助者。'],
    // 等级选择按钮的读屏文字：选择 + $5 a month tier
    [
      /^(\$[\d,]+(?:\.\d{2})?) (a month|one time) tier$/,
      (_, amount: string, frequency: string) => `${frequency === 'a month' ? '每月' : '一次性'} ${amount} 等级`
    ],
    // 费用说明：Save $0.03 in fees when you switch to <a>invoiced billing.</a>
    [/^Save (\$[\d,]+(?:\.\d{2})?) in fees when you switch to$/, '如需节省 $1 费用可切换到']
  ],
  inline: [
    // 下月扣款说明：「… you will see a charge for <span>$1.06</span>. You can cancel at any time.」
    [
      'Next month your billing cycle starts again and you will see a charge for {}. You can cancel at any time.',
      '下个月计费周期重新开始时将向你收取 {}。你可以随时取消。'
    ]
  ],
  ignore: [
    // 头部所在地
    'h2.f3 ~ div.mt-1.color-fg-muted',
    // 赞助目标描述
    '.Box-body label.d-block + p.mb-0',
    // 赞助目标下「<首个赞助者> and N others sponsor this goal」中的赞助者名
    'p.text-small.color-fg-muted > .Truncate',
    // 精选作品的存储库描述
    'ol.list-style-none li p.color-fg-muted.text-small',
    // 团队成员卡片
    '.sponsors-featured-item'
  ]
} satisfies PageDictionary
