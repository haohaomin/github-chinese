import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

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
  'Cost center': '成本中心'
}

/** 分组名查表：图表标题里的分组名可能全小写（grouped by skus），不区分大小写 */
function groupName(group: string): string {
  const key = Object.keys(GROUPS).find(name => name.toLowerCase() === group.toLowerCase())
  return key === undefined ? group : GROUPS[key]!
}

/** 图表标题中的分组说明：“按产品分组”，英文名两侧加空格“按 SKU 分组” */
function groupedBy(group: string): string {
  return joinCjk(joinCjk('按', groupName(group)), '分组')
}

/**
 * 使用情况图表标题中的产品名（“Actions usage grouped by SKU”）。
 * 产品名译成中文（见 nav.ts 文件头）；Copilot、Git LFS、Spark 是品牌词或技术缩写，保留。
 */
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
  'Advanced Security usage': '高级安全使用情况'
}

/** 预算列表操作菜单（读屏名称）中的产品名；Copilot、Git LFS、Spark 是品牌词或技术缩写，保留 */
const BUDGET_PRODUCTS: Readonly<Record<string, string>> = {
  Actions: '操作',
  Packages: '软件包',
  Codespaces: '代码空间',
  Models: '模型'
}

/** 许可页的产品名（与 nav.ts 的 scoped、common/marketing.ts 的 static 一致） */
const PRODUCTS: Readonly<Record<string, string>> = {
  'Advanced Security': '高级安全',
  'Secret Protection': '机密保护',
  'Code Security': '代码安全',
  'Code Quality': '代码质量'
}

/** 组织计划名（用户要求：计划名译成中文） */
const PLANS: Readonly<Record<string, string>> = {
  Free: '免费版',
  Team: '团队版',
  Enterprise: '企业版'
}

/** 成员请求页引用的计划名、产品名（带品牌前缀，与「Member requests for GitHub Add-Ons」同译）；其他名称原样保留 */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  'GitHub Free': 'GitHub 免费版',
  'GitHub Team': 'GitHub 团队版',
  'GitHub Enterprise': 'GitHub 企业版',
  'GitHub Add-Ons': 'GitHub 附加组件',
  'Copilot Free': 'Copilot 免费版',
  'Copilot Business': 'Copilot 商业版',
  'Copilot Enterprise': 'Copilot 企业版',
  'GitHub Advanced Security': 'GitHub 高级安全',
  'GitHub Secret Protection': 'GitHub 机密保护',
  'GitHub Code Security': 'GitHub 代码安全',
  ...PRODUCTS
}

function translatePlan(name: string): string {
  return PLAN_NAMES[name] ?? name
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

/** 日期区间：Oct 1 - Oct 31, 2025 → 10月1日 - 2025年10月31日 */
function dateRange(start: string, end: string): string {
  return `${translateTime(start)} - ${translateTime(end)}`
}

/**
 * 组织计费：账单管理员（含 /organizations/<组织>/billing_managers/new 邀请页）、计费联系人、
 * 发票、Azure 按流量计费、组织计划升降级与席位；概述、使用情况、预算和警报、付款信息等页面。
 * 计费页面的长句与个人计费共用，已由个人设置收录为 static；
 * 个人计费页的短词与正则只在个人设置生效，组织计费页（org-settings 页面类型）在这里另收一份。
 * 邀请账单管理员页、计划升级页属于 organization 页面类型，词条放 static。
 */
export default {
  static: {
    // 包含的计算额度说明、预算表单、开票偏好提示
    'Included compute is shared by eligible GitHub-hosted runners and Sandbox.': '符合条件的 GitHub 托管运行器和沙盒共享包含的计算额度。',
    'On paid GitHub plans, Larger Hosted Runners can also use this allowance. Each product retains its own meter and rate.':
      '在付费 GitHub 计划中，较大托管运行器也可以使用此额度。各产品分别计量、单独计费。',
    'Learn more about included compute': '了解包含的计算额度',
    'Scoped budgets track spending for all repositories in the organization': '范围预算跟踪组织内所有存储库的支出',
    'Set a budget amount to track your spending on a monthly basis': '设置预算金额以按月跟踪支出',
    'Receive emails when usage reaches 75%, 90%, and 100% of the budget amount': '使用量达到预算金额的 75%、90% 和 100% 时接收电子邮件',
    'Account owners and billing managers receive budget alert emails by default. You can add other recipients if needed.':
      '帐户所有者和账单管理员默认接收预算警报电子邮件。如有需要，可以添加其他收件人。',
    'Select users': '选择用户',
    'Search for users': '搜索用户',
    'Successfully updated invoicing preference': '已更新开票偏好设置',
    // 概览：计算使用量
    'About included compute usage': '关于包含的计算使用量',
    'Included compute usage': '包含的计算使用量',
    'Actions and Packages storage': '操作和软件包存储',
    // 预算：筛选、分页（读屏）
    'Filter by scope, repository, product, SKU or user': '按范围、存储库、产品、SKU 或用户筛选',
    'Clear Filter by scope, repository, product, SKU or user': '清除按范围、存储库、产品、SKU 或用户的筛选',
    // AI 使用情况
    'Filter by user or model': '按用户或模型筛选',
    'Included AI credits progress': '包含的 AI 额度进度',
    'Spend on additional AI credits exceeding your included credits.': '超出包含额度的额外 AI 额度支出。',
    'Usage grouped by models': '按模型分组的使用情况',
    // 付款信息、订阅
    'Saving invoice preference': '正在保存发票偏好',
    'Label: Primary': '标签：主要',
    'Edit primary email address': '编辑主电子邮件地址',
    // 许可：Copilot 商业版
    'Learn more about Copilot Business': '了解 Copilot 商业版',
    'Copilot builds features, fixes bugs, reviews code, and opens pull requests. Developers can use it in GitHub, their editor, the command line, or the Copilot app. You control access and set usage limits.':
      'Copilot 可以构建功能、修复缺陷、审查代码并创建拉取请求。开发人员可以在 GitHub、编辑器、命令行或 Copilot 应用中使用它。你可以控制访问权限并设置使用限额。',
    'Sign up for Copilot Business': '注册 Copilot 商业版',
    // 邀请账单管理员
    '/ Add a billing manager': '/ 添加账单管理员',
    'Add a billing manager': '添加账单管理员',
    'Invite a billing manager': '邀请账单管理员',
    'Billing managers': '账单管理员',
    'billing manager': '账单管理员',
    will: '将',
    'will not': '不会',
    'is a user who manages the billing settings of your organization.': '是管理组织计费设置的用户。',
    'have the ability to:': '拥有以下权限：',
    'Change the billing plan': '更改计费计划',
    'Add, update, or remove payment methods': '添加、更新或删除付款方式',
    'View payment history': '查看付款历史记录',
    'Download, and receive receipts': '下载和接收收据',
    'View a list of billing managers': '查看账单管理员列表',
    'Invite additional billing managers': '邀请其他账单管理员',
    'Remove other existing billing managers': '删除其他现有账单管理员',
    'Start, modify, or cancel sponsorships': '发起、修改或取消赞助',
    'be able to:': '获得以下权限：',
    'Create or access repositories in your organization': '在组织中创建或访问存储库',
    'See private members of your organization': '查看组织的非公开成员',
    'Be seen in the list of organization members': '出现在组织成员列表中',
    'Use the organization’s payment method': '使用组织的付款方式',
    "Use the organization's payment method": '使用组织的付款方式',
    'Enable or manage Copilot': '启用或管理 Copilot',
    'Purchase, edit, or cancel Marketplace subscriptions': '购买、编辑或取消市场订阅',

    // 计划升级、降级
    'Upgrade to Enterprise': '升级到企业版',
    'This organization is owned by a business': '此组织归企业所有',
    "Upgrade my organization's account": '升级我的组织帐户',
    'Upgrade my organization’s account': '升级我的组织帐户',
    'I understand. Downgrade my organization': '我已了解。降级我的组织',

    // Azure 订阅连接（connect → 连接；metered → 按流量计费，与 Metered billing via Azure 一致）
    'By clicking "Connect", you are confirming that you want to be billed for metered services via the selected Azure subscription':
      '单击“连接”即表示你确认通过所选 Azure 订阅支付按流量计费服务的费用',
    'By clicking “Connect”, you are confirming that you want to be billed for metered services via the selected Azure subscription':
      '单击“连接”即表示你确认通过所选 Azure 订阅支付按流量计费服务的费用'
  },
  scoped: {
    // 按流量计费的使用情况：分组菜单（全大写缩写的复数），图表说明
    SKUs: 'SKU',
    'All times in UTC': '所有时间均为 UTC',
    // 概览的用量分组名、使用量公式的减号图标；付款信息「by <a>signing</a> the …」的链接（整句见 inline）
    Compute: '计算',
    Sandbox: '沙盒',
    Minus: '减号',
    signing: '签署',
    // 计费联系人
    'Billing Contacts': '计费联系人',
    'Billing contacts': '计费联系人',
    'Receipts are sent to billing managers and email recipients.': '收据会发送给账单管理员和电子邮件收件人。',
    'You have not invited any billing managers': '尚未邀请任何账单管理员',
    'Email recipients': '电子邮件收件人',
    'Edit billing email address': '编辑计费电子邮件地址',
    'Billing primary email': '计费主要电子邮件地址',
    'Add billing recipient': '添加计费收件人',
    'Add billing recipient email': '添加计费收件人电子邮件',
    Primary: '主要',

    // 发票与 Azure
    Invoice: '发票',
    'Metered billing via Azure': '通过 Azure 进行按流量计费',
    'Add Azure Subscription': '添加 Azure 订阅',
    'Azure subscription': 'Azure 订阅',
    'Select a subscription': '选择订阅',
    'Edit the subscription': '编辑订阅',
    // 「Connect」按钮译“连接”，断开同用“连接”
    'Disconnect the subscription': '断开订阅连接',

    // 按流量计费的使用情况：页面标题、时间范围、报告类型、表格列（与个人计费一致）
    'Metered usage': '按流量计费的使用情况',
    'AI usage': 'AI 使用情况',
    Budgets: '预算',
    'Custom range': '自定义范围',
    Summarized: '汇总',
    Detailed: '详细',
    Legacy: '旧版',
    Model: '模型',
    Units: '单位',
    Amount: '金额',
    Discount: '折扣',
    Alerts: '警报',
    'Cost center': '成本中心',
    // 时间范围按钮只显示标签时
    Timeframe: '时间范围',
    'Time frame': '时间范围',

    // 概述、使用情况、预算（新版计费）
    'Gross metered usage': '按流量计费的使用情况总额',
    'Included usage discounts': '包含的使用量折扣',
    Discounts: '折扣',
    'Net amount': '净额',
    'Usage report': '使用情况报告',
    'Usage by organization': '按组织统计的使用情况',
    'Top products': '使用量最高的产品',
    Spending: '支出',
    'No budgets': '暂无预算',
    'Search budgets': '搜索预算',
    'Cost centers': '成本中心',
    Info: '信息',
    // 「Select repository」由 common-ui 的 static 统一收录

    // 计划、计费管理、付款方式（旧版计费）
    'Billing summary': '计费摘要',
    'Current monthly bill': '当前月度账单',
    'Next billing date': '下次计费日期',
    'Billing cycle': '计费周期',
    'Billing period': '计费周期',
    Monthly: '每月',
    Yearly: '每年',
    Annual: '每年',
    'Compare plans': '比较计划',
    'Manage spending limit': '管理支出上限',
    'Usage this month': '本月使用情况',
    'Git LFS Data': 'Git LFS 数据',
    'Add more data packs': '添加更多数据包',
    'Billing management': '计费管理',
    'Edit billing email': '编辑计费电子邮件',
    'Add billing manager': '添加账单管理员',
    'Invite billing manager': '邀请账单管理员',
    'Billing contact': '计费联系人',
    'Add payment method': '添加付款方式',
    'Add information to your receipts': '在收据中添加信息',
    'Manage sponsorships': '管理赞助',
    'Edit seats': '编辑席位',

    // 付款历史记录、发票
    Invoices: '发票',
    'View invoice': '查看发票',
    'Download invoice': '下载发票',
    Receipts: '收据',
    'Transaction ID': '交易 ID',
    Total: '总计',
    Subtotal: '小计',
    Tax: '税费',
    Taxes: '税费',
    Credit: '额度',
    Paid: '已支付',
    Unpaid: '未支付',
    Failed: '失败',

    // 组织计划与席位（计划名译成中文，见 nav.ts 文件头）
    'Upgrade to GitHub Team': '升级到 GitHub 团队版',
    'Downgrade to GitHub Free': '降级到 GitHub 免费版',
    'GitHub Free': 'GitHub 免费版',
    'GitHub Team': 'GitHub 团队版',
    'GitHub Enterprise': 'GitHub 企业版',
    'Copilot Free': 'Copilot 免费版',
    'Copilot Business': 'Copilot 商业版',
    'Copilot Enterprise': 'Copilot 企业版',
    Downgrade: '降级',
    Seats: '席位',
    'Add seats': '添加席位',
    'Remove seats': '删除席位',
    'Manage seats': '管理席位',
    'Purchase seats': '购买席位',

    // 成员请求（Requests from members）：功能、附加组件与 Copilot 预算请求
    'Member requests for GitHub Add-Ons': 'GitHub 附加组件的成员请求',
    'Member requests for additional Copilot budget': '额外 Copilot 预算的成员请求',
    'Discover your organization’s specific needs and uncover your users’ ideal workflows to enhance productivity and collaboration.':
      '了解组织的具体需求，发掘用户的理想工作流，从而提升效率与协作。',
    "Discover your organization's specific needs and uncover your users' ideal workflows to enhance productivity and collaboration.":
      '了解组织的具体需求，发掘用户的理想工作流，从而提升效率与协作。',
    // 「Unlock」+「Enterprise Features」
    Unlock: '解锁',
    'Watch customer story': '观看客户案例',
    'Ask enterprise owners for access': '向企业所有者申请访问权限',
    // 「Contact an admin」+「for more details around their decision.」
    'for more details around their decision.': '了解此决定的详细信息。',
    'Something went wrong creating your request. Please try again.': '创建请求时出错。请重试。',
    'Something went wrong removing your request. Please try again.': '删除请求时出错。请重试。',
    'Something went wrong updating your notification settings. Please try again.': '更新通知设置时出错。请重试。',
    'Notified of all notifications on this page.': '接收此页面上的所有通知。',
    'Select events you want to be notified of.': '选择要接收通知的事件。',
    Ignore: '忽略',
    // 请求数旁的单位：「3」+「requests」
    request: '个请求',
    requests: '个请求',
    // Copilot 策略页的成员请求卡片
    'View all requests': '查看所有请求',

    // 许可（/organizations/<组织>/settings/licensing）：Advanced Security、Code Quality 卡片
    "What's included": '包含内容',
    'What’s included': '包含内容',
    'Push protection to prevent secret leaks': '防止机密泄露的推送保护',
    'AI detection with a low rate of false positives': '低误报率的 AI 检测',
    'Custom patterns for secrets': '机密自定义模式',
    'Enterprise-grade policies': '企业级策略',
    'Security overview for risk insights': '提供风险洞察的安全概述',
    'Copilot Autofix for vulnerabilities': '针对漏洞的 Copilot 自动修复',
    'Security findings for third-party tools': '第三方工具的安全发现',
    'Security campaigns to address security debt': '解决安全债务的安全活动',
    'Buy Advanced Security': '购买高级安全',
    'Contact sales': '联系销售',
    'Download CSV report': '下载 CSV 报告',
    'Download CSV report for Advanced Security': '下载高级安全的 CSV 报告',
    'Manage Advanced Security': '管理高级安全',
    'Disable Advanced Security': '禁用高级安全',
    'Disable Advanced Security for this organization': '为此组织禁用高级安全',
    'This will disable Advanced Security, including Secret Protection and Code Security for private and internal repositories.':
      '这将为专用和内部存储库禁用高级安全，包括机密保护和代码安全。',
    'Public repositories will remain protected for free': '公共存储库仍免费受保护',
    'Advanced Security features will be disabled on all private and internal repositories': '所有专用和内部存储库都将禁用高级安全功能',
    'Any default security configurations that enable Advanced Security will be removed': '启用高级安全的默认安全配置将被删除',
    'To re-enable Advanced Security in the future, you can configure it under your organization security settings.':
      '以后如需重新启用高级安全，可在组织安全设置中配置。',
    'Start trial': '开始试用',
    'Starting trial': '正在开始试用',
    // <p>「Your trial includes all Secret Protection and Code Security」<a>features</a><span>for repositories in your organization.</span></p>
    // 原文无逗号：适用范围前移到第一段，末段只留句号
    'Your trial includes all Secret Protection and Code Security': '试用为组织中的存储库提供所有机密保护和代码安全',
    features: '功能',
    'for repositories in your organization.': '。',
    Trial: '试用',
    'Trial expired': '试用已过期',
    'Consumed licenses': '已用许可证',
    'Consumed seats': '已用席位',
    'Licenses used': '已用许可证',
    'About Advanced Security consumed licenses': '关于高级安全已用许可证',
    'Active committers who contributed to at least one private organization-owned or user-owned repository.':
      '至少为一个组织或用户拥有的专用存储库做过贡献的活跃提交者。',
    'Estimated monthly payment': '预计每月付款',
    'Estimated yearly payment': '预计每年付款',
    'Payment breakdown': '付款明细',
    'View billing details': '查看计费详细信息',
    'Code Quality licenses': '代码质量许可证',
    'About Code Quality consumed licenses': '关于代码质量已用许可证',
    'Unique, active committers to repositories with Code Quality enabled consume Code Quality licenses.':
      '向已启用代码质量的存储库提交的每个活跃提交者各占用一个代码质量许可证。',
    'Learn more about Code Quality consumed licenses': '了解代码质量已用许可证',
    'Download CSV report for Code Quality': '下载代码质量的 CSV 报告',
    'View AI usage': '查看 AI 使用情况',
    'View AI usage for Code Quality': '查看代码质量的 AI 使用情况',
    'Manage Code Quality': '管理代码质量',
    'Loading summaries': '正在加载摘要',
    'License usage and payment summaries cannot be loaded': '无法加载许可证使用情况和付款摘要',
    // 「…if the problem persists,」+「contact support」+「.」
    'The license usage and payment summaries are currently unavailable due to a system error. Try reloading the page, or if the problem persists,':
      '由于系统错误，许可证使用情况和付款摘要暂不可用。请重新加载页面；如果问题仍然存在，请'
  },
  regexp: [
    // 概览：已用金额 / 包含金额；预算：分页、使用率与操作菜单（读屏）
    [new RegExp(`^${MONEY} used / ${MONEY} included$`), '已用 $1 / 包含 $2'],
    [/^Showing (\d+) to (\d+) of (\d+) budgets?$/, '显示 $3 个预算中的第 $1 至 $2 个'],
    [/^Budget utilization for ([\w.-]+)$/, '$1 的预算使用率'],
    [
      /^View actions for (Actions|Packages|Codespaces|Git LFS|Copilot|Models|Spark) budget for Organization ([\w.-]+)$/,
      (_, product: string, org: string) => joinCjk(joinCjk(`查看组织 ${org} 的`, BUDGET_PRODUCTS[product] ?? product), '预算的可用操作')
    ],
    // AI 使用情况：包含额度的说明（日期按浏览器语言格式化，可能已是中文日期）
    [
      new RegExp(
        `^Included AI credits consumed by users in your account\\. Monthly limit resets in (\\d+) days? on (${DATE_SOURCE}|\\d{4}年\\d{1,2}月\\d{1,2}日)\\.$`
      ),
      (_, days: string, date: string) =>
        `帐户中用户消耗的包含 AI 额度。每月限额将${joinCjk(joinCjk(`在 ${days}天后于`, date.includes('年') ? date : translateTime(date)), '重置')}。`
    ],
    // 成员请求：标题与升级横幅（「octo-org is on the」+「Free organization plan」）；计划名译成中文
    [/^Member requests for GitHub (Team|Enterprise)$/, (_, plan: string) => `GitHub ${PLANS[plan]}的成员请求`],
    [/^(Team|Enterprise) Features$/, (_, plan: string) => `${PLANS[plan]}功能`],
    [/^([\w.-]+) is on the$/, '$1 当前使用'],
    [
      /^(GitHub )?(Free|Team|Enterprise) organization plan$/,
      (_, github: string | undefined, plan: string) => `${github ? 'GitHub ' : ''}${PLANS[plan]}组织计划`
    ],
    [/^View ([A-Z][\w .-]{0,59}) docs$/, (_, name: string) => joinCjk(joinCjk('查看', translatePlan(name)), '文档')],
    [
      new RegExp(`^Your request for ([\\w .-]{1,80}) was declined by an admin on (${DATE_SOURCE})\\.$`),
      (_, feature: string, date: string) =>
        joinCjk(joinCjk(joinCjk(joinCjk('你对', translatePlan(feature)), '的请求已于'), translateTime(date)), '被管理员拒绝。')
    ],
    // 席位与账单管理员
    [/^(\d+) seats?$/, '$1 个席位'],
    [/^(\d+) of (\d+) seats? used$/, '已使用 $1/$2 个席位'],
    [/^(\d+) billing managers?$/, '$1 个账单管理员'],

    // 概述卡片说明：Gross metered usage for Oct 1 - Oct 31, 2025.（句号随原文）
    [
      new RegExp(`^(Gross metered usage|Included usage discounts) for (${DATE_SOURCE}) - (${DATE_SOURCE})(\\.?)$`),
      (_, kind: string, start: string, end: string, dot: string) => {
        const label = kind === 'Gross metered usage' ? '按流量计费的使用情况总额' : '包含的使用量折扣'
        return `${joinCjk(dateRange(start, end), `的${label}`)}${dot ? '。' : ''}`
      }
    ],
    [
      new RegExp(`^Current usage for (${DATE_SOURCE}) - (${DATE_SOURCE})\\. Monthly quota resets in (\\d+) day\\(s\\)\\.$`),
      (_, start: string, end: string, days: string) => `${joinCjk(dateRange(start, end), '的当前使用情况。')}每月配额将在 ${days}天后重置。`
    ],
    [
      new RegExp(`^Resets in (\\d+) days? on (${DATE_SOURCE})$`),
      (_, days: string, date: string) => joinCjk(joinCjk(`${days}天后于`, translateTime(date)), '重置')
    ],
    [
      /^Included usage limits reset in (\d+) days?(\.?)$/,
      (_, days: string, dot: string) => `包含的使用量限制将在 ${days}天后重置${dot ? '。' : ''}`
    ],
    [/^(\d+) days?$/, '$1 天'],

    // 金额、优惠券与使用情况
    // 「~$3.00 off*」中的约数符号与脚注星号随原文（与个人计费一致）
    [
      new RegExp(`^(~?)${MONEY} off(\\*?)$`),
      (_, tilde: string, amount: string, star: string) => `减免${tilde ? '约' : ''} ${amount}${star}`
    ],
    [new RegExp(`^${MONEY} off per month for (\\d+) years?$`), '$2 年内每月减免 $1'],
    [
      new RegExp(`^${MONEY} off per month until (${DATE_SOURCE})(\\.?)$`),
      (_, amount: string, date: string, dot: string) => `${joinCjk(translateTime(date), '前每月减免')} ${amount}${dot ? '。' : ''}`
    ],
    // 优惠券期限在单独元素中：“$4.00 off per month” + “until Dec 31, 2026.”
    [new RegExp(`^${MONEY} off per month$`), '每月减免 $1'],
    [
      new RegExp(`^until (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk('至', translateTime(date))}${dot ? '。' : ''}`
    ],
    [new RegExp(`^${NUMBER} min used / ${NUMBER} min included$`), '已用 $1 分钟 / 包含 $2 分钟'],
    [new RegExp(`^${NUMBER} GB used / ${NUMBER} GB included$`), '已用 $1 GB / 包含 $2 GB'],
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

    // 使用情况按 SKU 分组时核数可变的 SKU 名（与个人计费一致）：Actions macOS 3-core、Codespaces compute 2-core
    [/^Actions (Linux|Windows|macOS) (\d+)-core$/, '操作 $1 $2 核'],
    [/^Codespaces compute (\d+)-core$/, '代码空间计算 $1 核'],

    // 使用情况明细表中的数量与单位
    [/^(\d[\d,]*) requests?$/, '$1 个请求'],
    [new RegExp(`^${NUMBER} min$`), '$1 分钟'],
    [new RegExp(`^${NUMBER} hr$`), '$1 小时'],
    [new RegExp(`^${NUMBER} GB-hr$`), '$1 GB·小时'],

    // 计划价格
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?month$/, '$1/月'],
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?year$/, '$1/年'],
    [/^(\$[\d,]+(?:\.\d{2})?) per month$/, '每月 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) per year$/, '每年 $1'],

    // 按流量计费的使用情况：时间范围、分组、图表标题（年份括号内只有数字，用半角，前面加空格）
    [
      /^(?:Timeframe|Time [Ff]rame): (Today|Current month|Last month|Custom|Custom range|This year|Last year)(?: \((\d{4})\))?$/,
      (_, period: string, year: string) => `时间范围：${TIMEFRAMES[period] ?? period}${year ? ` (${year})` : ''}`
    ],
    [/^(This year|Last year) \((\d{4})\)$/, (_, period: string, year: string) => `${TIMEFRAMES[period] ?? period} (${year})`],
    // 分组按钮：Group: None、Group by: Product（Group by → 分组依据，与个人计费一致）
    [
      /^Group( by)?: (None|Products?|SKUs?|Repositor(?:y|ies)|Models?|Organizations?|Users?|Cost center)$/,
      (_, by: string | undefined, group: string) => `${by ? '分组依据' : '分组'}：${GROUPS[group] ?? group}`
    ],
    [
      /^(Metered usage|AI usage|Actions usage|Copilot usage|Codespaces usage|Git_lfs usage|Git LFS usage|Packages usage|Models usage|Spark usage|Advanced Security usage) grouped by ([Pp]roducts?|SKUs?|skus?|[Rr]epositor(?:y|ies)|[Mm]odels?|[Oo]rganizations?|[Uu]sers?)$/,
      (_, product: string, group: string) => joinCjk(`${groupedBy(group)}的`, USAGE_PRODUCTS[product] ?? product)
    ],
    [
      /^Top (two|three|four|five) repositories (today|this month|last month|this year|last year)$/,
      (_, count: string, period: string) => `${PERIODS[period] ?? period}排名前${ORDINALS[count] ?? count}的存储库`
    ],
    [new RegExp(`^(${DATE_SOURCE}) \\(All times in UTC\\)$`), (_, date: string) => `${translateTime(date)}（UTC 时间）`],
    [
      new RegExp(`^Usage for (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk(translateTime(date), '的使用情况')}${dot ? '。' : ''}`
    ],
    // 卡片中单独显示的日期范围：Oct 1 - Oct 31, 2025
    [new RegExp(`^(${DATE_SOURCE}) - (${DATE_SOURCE})$`), (_, start: string, end: string) => dateRange(start, end)],

    // 预算
    [/^(\d+) budgets?$/, '$1 个预算'],
    [new RegExp(`^${MONEY} spent$`), '已支出 $1'],
    [new RegExp(`^${MONEY} budget$`), '预算 $1'],
    [/^(\d+) selected$/, '已选择 $1 项'],

    // 使用情况报告
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
    [/^The usage report will be emailed when it['’]s ready to (\S+@\S+)\.$/, '报告就绪后将通过电子邮件发送至 $1。'],

    // 许可：试用、许可证使用情况与付款说明（相邻文本节点拼接后匹配）
    [/^Learn more about (Secret Protection|Code Security)$/, (_, product: string) => `了解${PRODUCTS[product]}`],
    [/^Try free for (\d+) days?$/, '免费试用 $1 天'],
    [/^Start your free (\d+) day trial$/, '开始 $1 天免费试用'],
    [
      /^You can convert to a paid plan at any time\. If you don[’']t purchase by the end of (\d+) days, your trial will expire and all private repositories will lose access to Secret Protection and Code Security features\.$/,
      '你可以随时转为付费计划。如果 $1 天内未购买，试用将过期，所有专用存储库都将无法使用机密保护和代码安全功能。'
    ],
    // 卡片底部的试用期限：Trial ends on October 31, 2026.
    [
      new RegExp(`^Trial (ends|ended) on (${DATE_SOURCE})\\.$`),
      (_, verb: string, date: string) => joinCjk(joinCjk(verb === 'ends' ? '试用将于' : '试用已于', translateTime(date)), '结束。')
    ],
    [/^([\d,]+) available$/, '$1 个可用'],
    [
      /^Amount based on ([\d,]+) (billable|purchased) licenses?\.$/,
      (_, count: string, kind: string) => `金额按 ${count} 个${kind === 'billable' ? '可计费' : '已购买的'}许可证计算。`
    ],
    [
      new RegExp(`^Amount based on ([\\d,]+) billable licenses?, due by (${DATE_SOURCE})\\.$`),
      (_, count: string, date: string) => `金额按 ${count} 个可计费许可证计算，${joinCjk(joinCjk('应于', translateTime(date)), '前支付。')}`
    ],
    [/^(\$[\d,]+\.\d{2})\/month each$/, '每个 $1/月'],
    // 付款明细中各产品的许可证数：3 Secret Protection licenses、1 GitHub Advanced Security license
    [
      /^([\d,]+) (GitHub )?(Advanced Security|Secret Protection|Code Security|Code Quality) licenses?$/,
      (_, count: string, github: string | undefined, product: string) =>
        `${count} 个${github ? ' GitHub ' : ''}${PRODUCTS[product] ?? product}许可证`
    ]
  ],
  inline: [
    [
      'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by {} the {}.',
      '组织所有者或账单管理员必须将个人账单信息链接到此组织帐户。若要切换为企业帐户以使用企业账单信息请{} {}。'
    ]
  ]
} satisfies PageDictionary
