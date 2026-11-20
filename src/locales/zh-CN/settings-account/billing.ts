import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 日期范围：Oct 1 - Oct 31, 2026 */
const DATE_RANGE_RE = new RegExp(`^(${DATE_SOURCE}) - (${DATE_SOURCE})$`)

/** 按流量计费的使用情况页的时间范围选项 */
const TIMEFRAMES: Readonly<Record<string, string>> = {
  Today: '今天',
  'Current month': '本月',
  'Last month': '上个月',
  'This year': '今年',
  'Last year': '去年',
  Custom: '自定义',
  'Custom range': '自定义范围'
}

/** 使用情况分组依据 */
const GROUPS: Readonly<Record<string, string>> = {
  None: '无',
  Product: '产品',
  Products: '产品',
  SKU: 'SKU',
  SKUs: 'SKU',
  Repository: '存储库',
  Repositories: '存储库',
  Model: '模型',
  Models: '模型',
  Organization: '组织',
  Organizations: '组织',
  User: '用户',
  Users: '用户',
  'Cost center': '成本中心',
  'Cost centers': '成本中心'
}

/** 分组名的译名，大小写不敏感（图表标题有 “grouped by skus”）；未知分组返回 undefined */
function groupName(group: string): string | undefined {
  const lower = group.toLowerCase()
  const key = Object.keys(GROUPS).find(name => name.toLowerCase() === lower)
  return key === undefined ? undefined : GROUPS[key]
}

/** 图表标题中的分组说明：“按产品分组”，英文名两侧加空格“按 SKU 分组” */
export function groupedBy(group: string): string {
  return joinCjk(joinCjk('按', groupName(group) ?? group), '分组')
}

/** 使用情况图表标题中的产品名（“Actions usage grouped by SKU”）；产品名按用户规定译成中文，品牌词 Copilot、Spark、Git LFS 保留 */
const USAGE_PRODUCTS: Readonly<Record<string, string>> = {
  'Metered usage': '按流量计费的使用情况',
  'AI usage': 'AI 使用情况',
  'Actions usage': '操作使用情况',
  'Copilot usage': 'Copilot 使用情况',
  'Codespaces usage': '代码空间使用情况',
  'Git_lfs usage': 'Git LFS 使用情况',
  'Git LFS usage': 'Git LFS 使用情况',
  'Packages usage': '软件包使用情况',
  'Models usage': '模型使用情况',
  'Spark usage': 'Spark 使用情况',
  'Advanced Security usage': '高级安全使用情况',
  'Premium request usage': '高级请求使用情况',
  'Premium requests usage': '高级请求使用情况'
}

const USAGE_PRODUCT_SOURCE = Object.keys(USAGE_PRODUCTS).join('|')
/** 分组名（大小写混用：“grouped by SKU”“grouped by skus”） */
const GROUP_SOURCE = '(?:[Pp]roducts?|SKUs?|skus?|[Rr]epositor(?:y|ies)|[Mm]odels?|[Oo]rganizations?|[Uu]sers?|[Cc]ost centers?)'
const USAGE_TITLE_RE = new RegExp(`^(${USAGE_PRODUCT_SOURCE}) grouped by (${GROUP_SOURCE})$`)

/** 使用情况图表标题：“Metered usage” → “按流量计费的使用情况”；“Actions usage grouped by SKU” → “按 SKU 分组的操作使用情况” */
function usageTitle(title: string): string {
  const grouped = USAGE_TITLE_RE.exec(title)
  if (grouped) return joinCjk(`${groupedBy(grouped[2]!)}的`, USAGE_PRODUCTS[grouped[1]!] ?? grouped[1]!)
  return lookup(USAGE_PRODUCTS, title) ?? title
}

/** 只查自有键：自由文本作键时避免命中 constructor 等原型链属性 */
function lookup(record: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined
}

/** 图表无障碍描述（Highcharts）中的图表类型与坐标轴名 */
const CHART_TYPES: Readonly<Record<string, string>> = {
  Line: '折线图',
  Spline: '曲线图',
  Area: '面积图',
  Bar: '条形图',
  Column: '柱状图',
  Pie: '饼图'
}
const AXIS_NAMES: Readonly<Record<string, string>> = {
  Time: '时间',
  Date: '日期',
  Billing: '计费金额',
  Usage: '使用情况',
  Amount: '金额'
}

/** 预算的范围类型与预算名（“View actions for All AI Credit SKUs budget for Account mona”）：按 SKU 汇总的预算名与产品名 */
const BUDGET_SCOPES: Readonly<Record<string, string>> = {
  Account: '帐户',
  Organization: '组织',
  Enterprise: '企业',
  Repository: '存储库',
  'Cost center': '成本中心'
}
const BUDGET_NAMES: Readonly<Record<string, string>> = {
  'All AI Credit SKUs': '所有 AI 额度 SKU',
  'All Premium Request SKUs': '所有高级请求 SKU',
  Actions: '操作',
  Codespaces: '代码空间',
  Packages: '软件包',
  Models: '模型',
  'Advanced Security': '高级安全',
  'Shared Storage': '共享存储'
}

/** 依次拼接各段，中英文相接处加空格 */
function joinAll(...parts: readonly string[]): string {
  return parts.reduce((left, right) => joinCjk(left, right), '')
}

/** 时间范围：预设项或日期范围（“Current month”“Oct 1 - Oct 31, 2026”） */
function periodName(period: string): string {
  const preset = lookup(TIMEFRAMES, period)
  if (preset !== undefined) return preset
  const range = DATE_RANGE_RE.exec(period)
  return range ? `${translateTime(range[1]!)} - ${translateTime(range[2]!)}` : translateTime(period)
}

const ORDINALS: Readonly<Record<string, string>> = { two: '二', three: '三', four: '四', five: '五' }

/** 包含的使用量明细项（“2 GB included Packages storage”） */
const INCLUDED_ITEMS: Readonly<Record<string, string>> = {
  'Actions storage': '操作存储',
  'Git LFS bandwidth': 'Git LFS 带宽',
  'Git LFS storage': 'Git LFS 存储',
  'Packages data transfer': '软件包数据传输',
  'Packages storage': '软件包存储',
  'Codespaces storage': '代码空间存储'
}
const PERIODS: Readonly<Record<string, string>> = {
  today: '今天',
  'this month': '本月',
  'last month': '上个月',
  'this year': '今年',
  'last year': '去年'
}

const MONEY = '(\\$[\\d,]+(?:\\.\\d+)?)'
const NUMBER = '(\\d[\\d,]*(?:\\.\\d+)?)'

/**
 * 计费概述、按流量计费的使用情况、AI 使用情况与高级请求分析、预算和警报（/settings/billing、/usage、/ai_usage、
 * /premium_requests_usage、/budgets）。组织计费的同名页面与此共用，词条放 static。
 * 「Manage budgets」由 common 收录；图表菜单（Chart options、View as table、Download CSV / PNG）、
 * 「Choose date...」「No expiration」由其他词典收录。
 */
export default {
  static: {
    // 概述
    'For more information on using these billing pages': '有关使用这些计费页面的更多信息',
    'please refer to the docs content here': '请参阅此处的文档',
    'Current metered usage': '当前按流量计费的使用情况',
    'Showing gross metered usage for your account.': '显示你帐户按流量计费的使用情况总额。',
    'Showing gross metered usage for your organization.': '显示你组织按流量计费的使用情况总额。',
    'Current included usage': '当前包含的使用量',
    'Showing currently applied discounts for your account.': '显示你帐户当前适用的折扣。',
    'Showing currently applied discounts for your organization.': '显示你组织当前适用的折扣。',
    'Showing currently applied usage and credits for your account.': '显示你帐户当前适用的使用量和额度。',
    'Showing currently applied usage and credits for your organization.': '显示你组织当前适用的使用量和额度。',
    // 卡片说明的日期在单独元素中时
    'Gross metered usage for': '按流量计费的使用情况总额',
    'Included usage discounts for': '包含的使用量折扣',
    'More details': '更多详细信息',
    '* As per current pricing': '* 按当前定价',
    // 「Download your Copilot premium request usage report <a>here</a>.」（here 见 scoped）
    'Download your Copilot premium request usage report': '下载 Copilot 高级请求使用情况报告请单击',
    'Included usage and credits': '包含的使用量和额度',
    'Included usage*': '包含的使用量*',
    'Included premium requests': '包含的高级请求',
    'Included premium requests consumed': '已使用的包含高级请求',
    'Billed premium requests': '已计费的高级请求',
    'Free usage**': '免费使用量**',
    '100% off per month': '每月减免 100%',
    '* Included usage is an approximate amount based on current pricing.': '* 包含的使用量是基于当前定价的估算值。',
    '** GitHub Packages usage is free for public packages. For details on free Actions usage, see':
      '** 公共软件包的 GitHub 软件包使用量免费。有关操作免费使用量的详细信息，请参阅',
    'Free use of GitHub Actions': 'GitHub 操作的免费使用',
    'Next payment due': '下次应付款',
    'Manage subscriptions': '管理订阅',
    'Usage by products': '按产品统计的使用情况',
    'Billable usage': '可计费使用量',
    'consumed usage': '已消耗使用量',
    discounts: '折扣',
    // 产品说明（原文无逗号，译文不加）
    'Billable spend for Actions and Actions Runners for the selected timeframe. Applicable discounts cover Actions usage in public repositories and included usage for Actions minutes and storage.':
      '所选时间范围内操作和操作运行器的可计费支出。适用折扣涵盖公共存储库中的操作使用量以及操作分钟数和存储中包含的使用量。',
    'Billable spend for Codespaces for the selected timeframe.': '所选时间范围内代码空间的可计费支出。',
    'Billable spend for Sandbox for the selected timeframe.': '所选时间范围内沙盒的可计费支出。',
    'Billable spend for Git LFS for the selected timeframe. Applicable discounts cover included usage for Git LFS bandwidth and storage.':
      '所选时间范围内 Git LFS 的可计费支出。适用折扣涵盖 Git LFS 带宽和存储中包含的使用量。',
    'Billable spend for Packages for the selected timeframe. Applicable discounts cover Packages usage in public repositories and included usage for Packages data transfer and storage.':
      '所选时间范围内软件包的可计费支出。适用折扣涵盖公共存储库中的软件包使用量以及软件包数据传输和存储中包含的使用量。',
    'Included usage': '包含的使用量',
    'Actions minutes': '操作分钟数',
    'Git LFS bandwidth': 'Git LFS 带宽',
    'Git LFS storage': 'Git LFS 存储',
    'Packages data transfer': '软件包数据传输',
    'Packages storage': '软件包存储',
    'Actions storage': '操作存储',
    'Codespaces storage': '代码空间存储',
    'Codespaces compute': '代码空间计算',
    'Included usage limits reset in': '距包含的使用量限制重置还有',
    'All usage': '全部使用情况',
    'Gross:': '总额：',
    'Billed:': '计费：',
    'Discount:': '折扣：',
    'Usage by repository': '按存储库统计的使用情况',
    'Gross amount': '总额',
    'Billed amount': '计费金额',
    'All other repositories': '其他所有存储库',
    'All other': '其他',
    'No usage found': '未找到使用情况',
    'No usage': '无使用情况',
    'No usage data found for the selected filters.': '所选筛选器下无使用情况数据。',
    'Products selector': '产品选择器',
    'Products selector navigation': '产品选择器导航',
    'Open repository usage options': '打开存储库使用情况选项',
    'Total billable usage after subtracting discounts from consumed usage': '已消耗使用量减去折扣后的可计费使用量总额',
    'Advanced Security usage': '高级安全使用情况',
    'Total gross spend on GitHub Advanced Security AI credits for the selected timeframe.':
      '所选时间范围内 GitHub 高级安全 AI 额度的总支出。',
    'Showing total unique licenses billed for your enterprise. Actual billed amount for each license is prorated based on when it is added during the billing cycle.':
      '显示为你的企业计费的唯一许可证总数。每个许可证的实际计费金额按其在计费周期内的添加时间按比例计算。',
    // 按流量计费的使用情况：搜索框、图表与明细表（清除按钮的名称为 “Clear ” + 搜索框占位文字）
    'Search or filter usage (chart updates as you type)': '搜索或筛选使用情况（图表随输入更新）',
    'Clear Search or filter usage (chart updates as you type)': '清除搜索或筛选',
    'Show Usage': '显示使用情况',
    'Show Usage Breakdown': '显示使用情况明细',
    'Hide Usage Breakdown': '隐藏使用情况明细',
    'Usage breakdown table (scrollable)': '使用情况明细表（可滚动）',
    'Chart view': '图表视图',
    'consumed usage -': '已消耗使用量 -',
    'in discounts =': '折扣 =',
    'in billable usage': '可计费使用量',
    'Usage for Actions and Actions Runners.': '操作和操作运行器的使用情况。',
    'Copilot usage': 'Copilot 使用情况',
    'Actions usage': '操作使用情况',
    'Codespaces usage': '代码空间使用情况',
    'Git LFS usage': 'Git LFS 使用情况',
    'Git_lfs usage': 'Git LFS 使用情况',
    'Packages usage': '软件包使用情况',
    'Free Codespaces usage per organization': '每个组织的免费代码空间使用量',
    'Total spend on Copilot for the selected timeframe, excluding applicable discounts.': '所选时间范围内 Copilot 的总支出，不含适用折扣。',
    'Total gross spend on Copilot for the selected timeframe including licenses and AI Credits.':
      '所选时间范围内包含许可证和 AI 额度的 Copilot 总支出。',
    'Total gross spend on Copilot for the selected timeframe including licenses and AI credits.':
      '所选时间范围内包含许可证和 AI 额度的 Copilot 总支出。',
    'Total gross spend on GitHub Advanced Security for the selected timeframe including licenses and AI credits.':
      '所选时间范围内包含许可证和 AI 额度的 GitHub 高级安全总支出。',
    'Spark AI credits': 'Spark AI 额度',
    // 操作用量：存储计费说明；按存储库统计的「其他所有使用量」及其提示
    'GitHub Actions storage billing': 'GitHub 操作存储计费',
    'GitHub Actions storage billing operates on an hourly accrual model.': 'GitHub 操作存储按小时累计计费。',
    'Learn more about Actions Storage': '了解操作存储',
    'All other usage': '其他所有使用量',
    'About all other usage by repository': '关于按存储库统计的其他所有使用量',
    "Includes usage from all other repositories, plus usage that isn't tied to a repository, such as licenses and Copilot.":
      '包括其他所有存储库的使用量，以及许可证、Copilot 等不关联存储库的使用量。',
    'Includes usage from all other repositories, plus usage that isn’t tied to a repository, such as licenses and Copilot.':
      '包括其他所有存储库的使用量，以及许可证、Copilot 等不关联存储库的使用量。',
    'Billable licenses': '可计费许可证',
    'Billable licenses info': '可计费许可证信息',
    "If a user stops consuming a license within the month, the adjustment will be reflected in your next month's bill.":
      '如果用户在当月停止占用许可证，调整将体现在下个月的账单中。',
    "Billable licenses are only available for the 'Current month' timeframe.": '可计费许可证仅适用于“本月”时间范围。',
    'Learn more about billable licenses': '了解可计费许可证',
    'Copilot premium requests': 'Copilot 高级请求',
    'About Copilot premium requests': '关于 Copilot 高级请求',
    'If enabled, additional premium requests beyond the included amount for each license will be billed.':
      '启用后，超出每个许可证包含数量的高级请求将另行计费。',
    'Manage Copilot policy': '管理 Copilot 策略',
    'Spark premium requests': 'Spark 高级请求',
    'About GitHub Models rate limits': '关于 GitHub 模型速率限制',
    'GitHub Models rate limits': 'GitHub 模型速率限制',
    // playground（GitHub 模型的功能名）按官方文档译“操场”
    'The playground and free API usage are rate limited by requests per minute, requests per day, tokens per request, and concurrent requests.':
      '操场和免费 API 的使用受每分钟请求数、每天请求数、每个请求的令牌数和并发请求数限制。',
    'Learn more about GitHub Models rate limits': '了解 GitHub 模型速率限制',
    'GitHub Copilot is moving to AI credits': 'GitHub Copilot 将改用 AI 额度计费',
    'Starting June 1, 2026 Copilot usage will be measured and billed in AI credits instead of Premium request units. AI credits give you more granular visibility into your usage across models and features. Preview how this change will affect your billing based on your recent usage.':
      '自 2026年6月1日起，Copilot 使用量将以 AI 额度而非高级请求单位计量和计费。AI 额度可让你更细致地了解各模型和功能的使用情况。可根据近期使用情况预览此变更对计费的影响。',
    'Preview your usage': '预览你的使用情况',
    'Read the blog post': '阅读博客文章',

    // 使用情况按 SKU 分组时的 SKU 名（核数可变的见 regexp）
    'Actions Linux': '操作 Linux',
    'Actions Windows': '操作 Windows',
    'Copilot Premium Request': 'Copilot 高级请求',

    // 代码空间使用量提醒（Codespaces / codespace → 代码空间）
    "You've used 90% of included services for GitHub Codespaces storage.": '你已使用 GitHub 代码空间存储包含的使用量的 90%。',
    "You've used 100% of included services for GitHub Codespaces storage.": '你已使用 GitHub 代码空间存储包含的使用量的 100%。',
    'Update spending limit': '更新支出上限',
    // 免费额度用尽说明：被 “export your unpushed work to a branch.”“usage report” 等链接拆开（逗号数随原文）
    "When your allotment is exhausted, you won't be able to use Codespaces until you set up a spending limit or your free Codespaces allotment is reset next month. If you want to access your in progress work from a codespace, you can":
      '额度用尽后，在设置支出上限或下月重置免费代码空间额度之前你将无法使用代码空间。如需访问代码空间中进行中的工作，你可以',
    'When your allotment is exhausted, you won’t be able to use Codespaces until you set up a spending limit or your free Codespaces allotment is reset next month. If you want to access your in progress work from a codespace, you can':
      '额度用尽后，在设置支出上限或下月重置免费代码空间额度之前你将无法使用代码空间。如需访问代码空间中进行中的工作，你可以',
    'export your unpushed work to a branch.': '将未推送的工作导出到分支。',
    'To see a full list of your usage, obtain a copy of your': '要查看完整的使用情况列表，请获取你的',
    'usage report': '使用情况报告',
    // 前面是 “usage report” 链接和空格，译文不以标点开头
    "to see the codespaces and prebuilds created by your account. The usage report is the only place where prebuild usage is visible. If you see charges you'd like to stop going forward, you can delete a":
      '来查看你的帐户创建的代码空间和预生成。只有使用情况报告中才能看到预生成使用情况。如果要停止今后的某些费用，你可以删除',
    'to see the codespaces and prebuilds created by your account. The usage report is the only place where prebuild usage is visible. If you see charges you’d like to stop going forward, you can delete a':
      '来查看你的帐户创建的代码空间和预生成。只有使用情况报告中才能看到预生成使用情况。如果要停止今后的某些费用，你可以删除',
    'delete prebuilds for a repository.': '删除存储库的预生成。',

    // 使用情况报告
    'Get usage report': '获取使用情况报告',
    'Metered billing usage report': '按流量计费的使用情况报告',
    'Provides a breakdown of all metered usage': '提供所有按流量计费的使用情况的明细',
    'Select report type:': '选择报告类型：',
    'Metered usage by repository for up to 1 year': '按存储库统计最长 1 年按流量计费的使用情况',
    'Metered usage by username and workflow for up to 31 days': '按用户名和工作流统计最长 31 天按流量计费的使用情况',
    'Select time frame': '选择时间范围',
    'Up to 1 year': '最长 1 年',
    'Up to 31 days': '最长 31 天',
    'Choose date…': '选择日期…',
    'Email me the report': '通过电子邮件发送报告',
    'Copilot premium requests usage report': 'Copilot 高级请求使用情况报告',
    'Provides a per user breakdown of requests exhausted and their monthly quota for the current billing period.':
      '按用户列出当前计费周期内已用请求数及每月配额。',
    'Search or filter usage': '搜索或筛选使用情况',
    'For license-based products, the price/unit is a prorated portion of the monthly price.':
      '对于按许可证计费的产品，单价为月价按比例折算的部分。',
    'Usage breakdown': '使用情况明细',
    'Price/unit': '单价',
    'Loading usage breakdown…': '正在加载使用情况明细…',
    'Loading usage breakdown...': '正在加载使用情况明细...',
    'Loading Actions data...': '正在加载操作数据...',
    'Loading Packages data...': '正在加载软件包数据...',
    'Loading Shared Storage data...': '正在加载共享存储数据...',
    'Loading Codespaces data...': '正在加载代码空间数据...',

    // AI 使用情况、高级请求分析
    'Included credits': '包含的额度',
    'About included credits': '关于包含的额度',
    'Additional usage': '额外使用量',
    'About Additional Usage': '关于额外使用量',
    'About additional usage': '关于额外使用量',
    'Edit budget': '编辑预算',
    'Model usage': '模型使用情况',
    Overage: '超额',
    'Additional credits': '额外额度',
    'About Copilot AI credits': '关于 Copilot AI 额度',
    'If enabled, your account will be billed for additional AI credits usage after your included credits have been exhausted.':
      '启用后，包含的额度用尽后的额外 AI 额度使用量将向你的帐户计费。',
    'If enabled, your enterprise will be billed for additional AI credits usage after your included credits have been exhausted.':
      '启用后，包含的额度用尽后的额外 AI 额度使用量将向你的企业计费。',
    'Code Review model': '代码审查模型',
    'Coding Agent model': '编码智能体模型',
    'Each GitHub AI credit costs $0.01.': '每个 GitHub AI 额度的费用为 $0.01。',
    'New Copilot AI Credits': '新的 Copilot AI 额度',
    'Overage spend': '超额支出',

    // 预算和警报
    'Account budgets': '帐户预算',
    'New budget': '新建预算',
    'Stop usage': '停止使用',
    spent: '已支出',
    // 预算表的列名
    Spent: '已支出',
    budget: '预算',
    'Budget table': '预算表',
    'Loading budgets': '正在加载预算',
    'Filter scope': '筛选范围',
    'Filter by scope, repository, product or SKU': '按范围、存储库、产品或 SKU 筛选',
    'Clear Filter by scope, repository, product or SKU': '清除筛选器',
    'Included usage alerts:': '包含的使用量警报：',
    'Included usage alerts: On': '包含的使用量警报：开',
    'Included usage alerts: Off': '包含的使用量警报：关',
    'All AI Credit SKUs': '所有 AI 额度 SKU',
    'AI credits budget': 'AI 额度预算',
    'Set a budget for all SKUs that consume AI credits': '为所有消耗 AI 额度的 SKU 设置预算',
    'About GitHub Actions storage billing': '关于 GitHub 操作存储计费',
    'Enable to use the this feature.': '启用后即可使用此功能。',
    'Budgets let you set monthly usage limits for specific GitHub products or SKUs. If no budget is set, usage for that product is unlimited.':
      '预算可为特定 GitHub 产品或 SKU 设置每月使用限制。未设置预算的产品使用量不受限制。',
    'SKU level budgets are only available for products that have > 1 SKU.': '只有包含多个 SKU 的产品才能设置 SKU 级预算。',
    'Budgets and Alerts': '预算和警报',
    'New monthly budget': '新建月度预算',
    'Edit monthly budget': '编辑月度预算',
    'Create a budget to track spending for a selected product and scope.': '创建预算以跟踪所选产品和范围的支出。',
    'Create a budget to track spending for a selected product and scope': '创建预算以跟踪所选产品和范围的支出',
    'Payment method is missing': '缺少付款方式',
    'Please set up a valid payment method before creating or adjusting your budget.': '创建或调整预算前请先设置有效的付款方式。',
    'Budget type': '预算类型',
    'Budget Type': '预算类型',
    'Set budget for either a product or individual SKU within a product.': '为产品或产品中的单个 SKU 设置预算。',
    'Set budget for either a product or individual SKU within a product': '为产品或产品中的单个 SKU 设置预算',
    'Product-level budget': '产品级预算',
    'SKU-level budget': 'SKU 级预算',
    'Bundled AI credits budget': 'AI 额度捆绑预算',
    'Enable billing to set a budget. See': '启用计费后才能设置预算。请参阅',
    'Models policy configuration': '模型策略配置',
    'Select 1 product': '选择 1 个产品',
    'Next: Configure budget': '下一步：配置预算',
    'All Premium Request SKUs': '所有高级请求 SKU',
    'A budget for all SKUs that consume premium requests': '适用于所有消耗高级请求的 SKU 的预算',
    'Supported SKUs:': '支持的 SKU：',
    'Coding Agent premium requests': '编码智能体高级请求',
    'Budget scope': '预算范围',
    'Select the scope of spending for this budget.': '选择此预算的支出范围。',
    'Scoped budgets track spending for a single repository': '范围预算跟踪单个存储库的支出',
    'Scoped budgets track spending for all repositories owned by your account': '范围预算跟踪你帐户拥有的所有存储库的支出',
    'Scoped budgets track all spending for your account': '范围预算跟踪你帐户的全部支出',
    'Search repository': '搜索存储库',
    Budget: '预算',
    'Set a budget amount to track your spending on a monthly basis.': '设置预算金额以按月跟踪支出。',
    "Usage before budget creation isn't counted in the current billing cycle.": '创建预算之前的使用量不计入当前计费周期。',
    'Usage before budget creation isn’t counted in the current billing cycle.': '创建预算之前的使用量不计入当前计费周期。',
    'Budget amount': '预算金额',
    'Stop usage when budget limit is reached': '达到预算上限时停止使用',
    'Limit usage when budget limit is reached': '达到预算上限时限制使用',
    "Spending won't exceed your set budget": '支出不会超过你设定的预算',
    'Spending won’t exceed your set budget': '支出不会超过你设定的预算',
    'Get emails and GitHub notifications when your spending has reached 75%, 90%, and 100% of the budget threshold.':
      '支出达到预算阈值的 75%、90% 和 100% 时，接收电子邮件和 GitHub 通知。',
    'Receive emails when usage reaches 75%, 90%, and 100% of the budget amount.': '使用量达到预算金额的 75%、90% 和 100% 时接收电子邮件。',
    'Receive budget threshold alerts': '接收预算阈值警报',
    'Alert Recipients': '警报接收人',
    'Alert recipients': '警报接收人',
    'Included usage alerts': '包含的使用量警报',
    'Receive alerts when my included usage reaches 90% and 100%': '包含的使用量达到 90% 和 100% 时接收警报',
    'End of current billing cycle': '当前计费周期结束时',
    'Specific date': '指定日期',
    'Create budget': '创建预算',
    'Update budget': '更新预算',
    'Delete budget': '删除预算',
    'Please add a payment method to use budgets.': '请添加付款方式以使用预算。'
  },
  scoped: {
    // 时间范围、报告类型、表格列等单词（Current month 的全站 static 由 actions 词典提供，此处固定本页译法）
    'Current month': '本月',
    'Last month': '上个月',
    'Last year': '去年',
    'Custom range': '自定义范围',
    // 时间范围按钮只显示标签时
    Timeframe: '时间范围',
    'Time frame': '时间范围',
    Summarized: '汇总',
    Detailed: '详细',
    Legacy: '旧版',
    // AI 额度（安全公告的 Credits 是致谢，见 security/advisories）
    Credits: '额度',
    'AI Credits': 'AI 额度',
    Model: '模型',
    Units: '单位',
    Amount: '金额',
    Discount: '折扣',
    Requests: '请求数',
    Alerts: '警报',
    No: '否',
    Info: '信息',
    // 使用情况页的图表/表格视图切换
    Chart: '图表',
    Showing: '显示',
    SKUs: 'SKU',
    usage: '使用情况',
    // 计划价格「$0 per month」中被拆开的单位
    per: '/',
    month: '月',
    year: '年',
    day: '天',
    // 分页「1 of 1」
    of: '/',
    // 「… usage report <a>here</a>.」
    here: '此处',
    // 预算范围说明：「Select the <存储库> to include in this <预算>. You can only add/remove the <存储库> that you have access to.」
    'Select the': '选择',
    'to include in this': '以纳入此',
    '. You can only add/remove the': '。你只能添加/删除',
    'that you have access to.': '中你有权访问的部分。'
  },
  regexp: [
    // 概述卡片说明：Gross metered usage for Oct 1 - Oct 31, 2025.（句号随原文）
    [
      new RegExp(`^(Gross metered usage|Included usage discounts) for (${DATE_SOURCE}) - (${DATE_SOURCE})(\\.?)$`),
      (_, kind: string, start: string, end: string, dot: string) =>
        `${joinCjk(
          `${translateTime(start)} - ${translateTime(end)}`,
          kind === 'Gross metered usage' ? '的按流量计费的使用情况总额' : '的包含的使用量折扣'
        )}${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^Current usage for (${DATE_SOURCE}) - (${DATE_SOURCE})\\. Monthly quota resets in (\\d+) day\\(s\\)\\.$`),
      (_, start: string, end: string, days: string) =>
        `${joinCjk(`${translateTime(start)} - ${translateTime(end)}`, '的当前使用情况')}。每月配额将在 ${days}天后重置。`
    ],
    [
      new RegExp(`^Resets in (\\d+) days? on (${DATE_SOURCE})$`),
      (_, days: string, date: string) => joinAll(`${days}天后于`, translateTime(date), '重置')
    ],
    [
      /^Included usage limits reset in (\d+) days?(\.?)$/,
      (_, days: string, dot: string) => `包含的使用量限制将在 ${days}天后重置${dot ? '。' : ''}`
    ],
    [/^(\d+) days?$/, '$1 天'],
    // 金额与使用量：「~$3.00 off*」中的约数符号与脚注星号随原文
    [
      new RegExp(`^(~?)${MONEY} off(\\*?)$`),
      (_, tilde: string, amount: string, star: string) => `减免${tilde ? '约' : ''} ${amount}${star}`
    ],
    [new RegExp(`^${MONEY} off per month for (\\d+) years?$`), '$2 年内每月减免 $1'],
    [new RegExp(`^${NUMBER} min used / ${NUMBER} min included$`), '已用 $1 分钟 / 包含 $2 分钟'],
    [new RegExp(`^${NUMBER} GB used / ${NUMBER} GB included$`), '已用 $1 GB / 包含 $2 GB'],
    // 包含的使用量明细（产品名译成中文，与 org-settings/billing.ts 同一译法）
    [new RegExp(`^${NUMBER} included Actions minutes$`), '包含 $1 操作分钟数'],
    [
      new RegExp(`^${NUMBER} GB included (${Object.keys(INCLUDED_ITEMS).join('|')})$`),
      (_, amount: string, item: string) => `包含 ${amount} GB ${INCLUDED_ITEMS[item] ?? item}`
    ],
    [new RegExp(`^${NUMBER} included Codespaces core hours$`), '包含 $1 代码空间核心小时数'],
    [/^Discount for usage in public repositories \((\d+%) off\)$/, '公共存储库使用量折扣（减免 $1）'],
    [/^Based on (\d[\d,]*) additional premium requests? beyond your included usage\.$/, '基于超出包含的使用量的 $1 个额外高级请求。'],
    [/^Based on (\d[\d,]*) additional AI credits? beyond your included usage\.$/, '基于超出包含的使用量的 $1 个额外 AI 额度。'],
    [
      /^Cost calculated based on additional (\d[\d,]*) premium requests? for Copilot and Spark\.$/,
      '费用按 Copilot 和 Spark 的 $1 个额外高级请求计算。'
    ],
    [
      /^Cost calculated based on additional (\d[\d,]*) premium requests?(\.?)$/,
      (_, count: string, dot: string) => `费用按 ${count} 个额外高级请求计算${dot ? '。' : ''}`
    ],
    [
      /^Cost calculated based on additional (\d[\d,]*) token units?(\.?)$/,
      (_, count: string, dot: string) => `费用按 ${count} 个额外令牌单位计算${dot ? '。' : ''}`
    ],
    [
      /^Cost calculated based on (\d[\d,]*) Spark premium requests? that exceed the premium request usage included with your Copilot licenses\.$/,
      '费用按超出 Copilot 许可证包含的高级请求使用量的 $1 个 Spark 高级请求计算。'
    ],
    [/^\/ (\d[\d,]*) AI credits$/, '/ $1 AI 额度'],
    // 使用情况按 SKU 分组时核数可变的 SKU 名：Actions macOS 3-core、Codespaces compute 2-core
    [/^Actions (Linux|Windows|macOS) (\d+)-core$/, '操作 $1 $2 核'],
    [/^Codespaces compute (\d+)-core$/, '代码空间计算 $1 核'],
    // 使用情况明细表中的数量与单位
    [/^(\d[\d,]*) requests?$/, '$1 个请求'],
    [new RegExp(`^${NUMBER} min$`), '$1 分钟'],
    [new RegExp(`^${NUMBER} hr$`), '$1 小时'],
    [new RegExp(`^${NUMBER} GB-hr$`), '$1 GB·小时'],
    // 按流量计费的使用情况：时间范围、分组、图表标题（年份括号内只有数字，用半角，前面加空格）
    [
      /^(?:Timeframe|Time [Ff]rame): (Today|Current month|Last month|Custom|Custom range|This year|Last year)(?: \((\d{4})\))?$/,
      (_, period: string, year: string) => `时间范围：${TIMEFRAMES[period] ?? period}${year ? ` (${year})` : ''}`
    ],
    [/^(This year|Last year) \((\d{4})\)$/, (_, period: string, year: string) => `${TIMEFRAMES[period] ?? period} (${year})`],
    // 分组按钮：Group: None、Group by: Product（Group by → 分组依据）
    [
      /^Group( by)?: (None|Products?|SKUs?|Repositor(?:y|ies)|Models?|Organizations?|Users?|Cost centers?)$/,
      (_, by: string, group: string) => `${by ? '分组依据' : '分组'}：${groupName(group) ?? group}`
    ],
    // 图表标题：Actions usage grouped by SKU、Advanced Security usage grouped by skus
    [USAGE_TITLE_RE, (_, product: string, group: string) => usageTitle(`${product} grouped by ${group}`)],
    [
      /^Top (two|three|four|five) repositories (today|this month|last month|this year|last year)$/,
      (_, count: string, period: string) => `${PERIODS[period] ?? period}排名前${ORDINALS[count] ?? count}的存储库`
    ],
    [new RegExp(`^(${DATE_SOURCE}) \\(All times in UTC\\)$`), (_, date: string) => `${translateTime(date)}（UTC 时间）`],
    [
      new RegExp(`^Usage for (${DATE_SOURCE})(?: - (${DATE_SOURCE}))?(\\.?)$`),
      (_, start: string, end: string | undefined, dot: string) =>
        `${joinCjk(periodName(end ? `${start} - ${end}` : start), '的使用情况')}${dot ? '。' : ''}`
    ],
    // 使用情况明细标题后接许可证说明时
    [
      new RegExp(
        `^Usage for (${DATE_SOURCE}) - (${DATE_SOURCE})\\. For license-based products, the price/unit is a prorated portion of the monthly price\\.$`
      ),
      (_, start: string, end: string) =>
        `${joinCjk(periodName(`${start} - ${end}`), '的使用情况')}。对于按许可证计费的产品，单价为月价按比例折算的部分。`
    ],
    // 卡片中单独显示的日期范围：Oct 1 - Oct 31, 2025
    [DATE_RANGE_RE, (_, start: string, end: string) => `${translateTime(start)} - ${translateTime(end)}`],
    [
      new RegExp(`^Metered usage before the billing transition, until (${DATE_SOURCE})$`),
      (_, date: string) => joinCjk('计费过渡前按流量计费的使用情况，截至', translateTime(date))
    ],
    // 使用情况图表的无障碍描述（Highcharts）；原文没有逗号、冒号，译文不加：“X 图表显示 Y 的数据。找到 N 个数据点。”
    [
      /^(.+?) chart showing data for (.+?)\. (\d+) data points? found\.$/,
      (_, title: string, period: string, count: string) =>
        `${joinAll(usageTitle(title), '图表显示', periodName(period), '的数据')}。找到 ${count} 个数据点。`
    ],
    [/^(.+?)\. Interactive chart\.$/, (_, title: string) => `${usageTitle(title)}。交互式图表。`],
    [
      new RegExp(`^(${Object.keys(CHART_TYPES).join('|')}) chart with (\\d+) data points?\\.$`),
      (_, type: string, count: string) => `包含 ${count} 个数据点的${CHART_TYPES[type] ?? type}。`
    ],
    [
      /^The chart has (\d+) ([XY]) ax[ie]s displaying (.+?)\. Data ranges from (.+?) to (.+)\.$/,
      (_, count: string, axis: string, name: string, from: string, to: string) =>
        `${joinAll(`图表有 ${count} 条显示`, lookup(AXIS_NAMES, name) ?? name, '的')} ${axis} 轴。数据范围为 ${from} 至 ${to}。`
    ],
    // 预算
    [/^(\d+) budgets?$/, '$1 个预算'],
    [new RegExp(`^${MONEY} spent$`), '已支出 $1'],
    [new RegExp(`^/ ${MONEY} spent$`), '/ 已支出 $1'],
    [new RegExp(`^${MONEY} budget$`), '预算 $1'],
    [/^(\d+) selected$/, '已选择 $1 项'],
    // 原文无标点，译文不加逗号
    [/^Showing (\d+) to (\d+) of (\d+) budgets?$/, '显示 $3 个预算中的第 $1 至 $2 个'],
    // 预算表分页：1-5 of 5
    [/^(\d+)-(\d+) of (\d+)$/, '$3 项中的第 $1-$2 项'],
    // 预算表的无障碍名称：Budget utilization for mona、View actions for Actions budget for Account mona
    [/^Budget utilization for (.+)$/, '$1 的预算使用率'],
    [
      new RegExp(`^View actions for (.+?) budget for (${Object.keys(BUDGET_SCOPES).join('|')}) (.+)$`),
      (_, budget: string, scope: string, name: string) =>
        joinAll('查看', BUDGET_SCOPES[scope] ?? scope, name, '的', lookup(BUDGET_NAMES, budget) ?? budget, '预算的操作')
    ],
    // 使用情况报告（句号随原文）
    [
      /^We['’]re preparing your usage report\. It may take ~30 minutes to see usage in your report\. We['’]ll send an email to (\S+@\S+) when it['’]s ready\.$/,
      '正在准备使用情况报告。使用情况可能约30分钟后才会出现在报告中。报告就绪后会发送电子邮件至 $1。'
    ],
    [
      /^We['’]re preparing your usage report\. We['’]ll send an email to (\S+@\S+) when it['’]s ready\.$/,
      '正在准备使用情况报告。报告就绪后会发送电子邮件至 $1。'
    ],
    [
      /^Your usage report request is already in progress\. Check (\S+@\S+) for the report when it['’]s ready\.$/,
      '你的使用情况报告请求正在处理中。报告就绪后请查收 $1。'
    ],
    [/^The usage report will be emailed when it['’]s ready to (\S+@\S+)\.$/, '报告就绪后将通过电子邮件发送至 $1。']
  ]
} satisfies PageDictionary
