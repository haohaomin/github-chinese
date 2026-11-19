import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 上架项详情页：操作页（/marketplace/actions/*）与应用页（/marketplace/*）的头部、关于、资源、
 * 版本选择与安装片段、计划与定价、安装按钮、服务条款说明、透明度与安全。
 * 服务条款说明由多个链接拆开，按片段收录，整句另用正则。
 * 产品名、方案名按用户决定（2026-10-27，product-names.md）译成中文：Marketplace → 市场、权限名 actions / codespaces →
 * 操作 / 代码空间、Copilot Chat → Copilot 聊天；第三方应用的常见计划名 Free / Pro / Open Source 等按 PLAN_NAMES 译出
 * （计划卡片与「… plan available.」句同译）。
 */

/** GitHub 应用权限名（透明度表格） */
const PERMISSION_NAMES: Readonly<Record<string, string>> = {
  'public repositories': '公共存储库',
  'public organization information': '公开组织信息',
  'public user profile data': '公开用户个人资料数据',
  actions: '操作',
  administration: '管理',
  checks: '检查',
  code: '代码',
  codespaces: '代码空间',
  'commit statuses': '提交状态',
  contents: '内容',
  'Dependabot alerts': 'Dependabot 警报',
  'Dependabot secrets': 'Dependabot 机密',
  deployments: '部署',
  discussions: '讨论',
  'email addresses': '电子邮件地址',
  emails: '电子邮件',
  environments: '环境',
  followers: '关注者',
  gists: '代码片段',
  'gpg keys': 'GPG 密钥',
  'git ssh keys': 'Git SSH 密钥',
  issues: '议题',
  members: '成员',
  'merge queues': '合并队列',
  metadata: '元数据',
  'organization administration': '组织管理',
  'organization hooks': '组织 Web 钩子',
  'organization plan': '组织计划',
  'organization projects': '组织项目',
  'organization secrets': '组织机密',
  packages: '软件包',
  pages: '页面',
  plan: '计划',
  profile: '个人资料',
  projects: '项目',
  'pull requests': '拉取请求',
  'repository hooks': '存储库 Web 钩子',
  'repository projects': '存储库项目',
  'secret scanning alerts': '机密扫描警报',
  secrets: '机密',
  'security events': '安全事件',
  starring: '星标',
  statuses: '状态',
  'team discussions': '团队讨论',
  variables: '变量',
  watching: '关注',
  webhooks: 'Web 钩子',
  workflows: '工作流'
}

/** 英文并列「A, B, and C」「A and B」拆成各项 */
function splitList(list: string): string[] {
  return list.split(/, and |, | and /)
}

/** 各项连成「A、B 和 C」「A 和 B」；“和”与英文、数字之间加空格 */
function joinList(items: readonly string[]): string {
  if (items.length < 2) return items.join('')
  return joinCjk(joinCjk(items.slice(0, -1).join('、'), '和'), items[items.length - 1]!)
}

/** 「contents, checks, and metadata」→「内容、检查和元数据」，已知权限名转为中文 */
function permissionList(list: string): string {
  return joinList(splitList(list).map(item => PERMISSION_NAMES[item] ?? item))
}

/**
 * 权限表描述「<Read|Read and write|Admin> access to <列表>」中访问级别之后的片段。
 * 原文 1～2 项时没有标点，译文不加冒号；与「access to files located at」的译文同为「访问权限……」句式
 */
function accessTo(list: string): string {
  return joinCjk('访问权限适用于', permissionList(list))
}

/** 计费单位 */
const UNIT_NAMES: Readonly<Record<string, string>> = {
  user: '用户',
  seat: '席位',
  member: '成员',
  repository: '存储库',
  repo: '存储库',
  developer: '开发人员',
  committer: '提交者'
}

/** 计费单位的正则片段 */
const UNIT_SOURCE = Object.keys(UNIT_NAMES).join('|')

/** 第三方应用常见的计划名（发布者自定义，译不了的保留原文）；方案名作「X 版」，Open Source → 开源 */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  Free: '免费版',
  Pro: '专业版',
  Team: '团队版',
  Business: '商业版',
  Enterprise: '企业版',
  'Open Source': '开源',
  'Open source': '开源',
  Starter: '入门版',
  Basic: '基础版',
  Standard: '标准版',
  Premium: '高级版'
}

/**
 * 计划卡片上单独显示的计划名。Free、Pro、Open Source 由 common 的全局 static 译出（译文相同）；
 * Team、Enterprise 与全局导航、页脚的导航名同形，由 common 译“团队”“企业”，不在本页覆盖
 */
const PLAN_SCOPED = Object.fromEntries(
  Object.entries(PLAN_NAMES).filter(([name]) => !['Free', 'Pro', 'Open Source', 'Team', 'Enterprise'].includes(name))
)

/** 单个计划名：「Free」→「免费版」，未知名称原样保留 */
function planName(name: string): string {
  return PLAN_NAMES[name] ?? name
}

/** 多个计划名：「Open Source and Umbrella」→「开源和 Umbrella」；计划名本身含逗号时会被拆开，只用于复数句式 */
function planNames(list: string): string {
  return joinList(splitList(list).map(planName))
}

export default {
  static: {
    // 头部与关于
    'Manually verified': '已人工验证',
    'Verified creator': '已验证创建者',
    'You must be signed in to star a repository': '登录后才能为存储库加星标',
    "You can't star at this time": '暂时无法加星标',
    'You can’t star at this time': '暂时无法加星标',
    'Use latest version': '使用最新版本',

    // 旧版本横幅
    "You're viewing an older version of this GitHub Action. Do you want to see the": '你正在查看此 GitHub 操作的旧版本。是否改为查看',
    'You’re viewing an older version of this GitHub Action. Do you want to see the': '你正在查看此 GitHub 操作的旧版本。是否改为查看',
    'Sorry, we couldn’t find that version of this Action. Here’s the latest version.': '找不到此操作的该版本。已显示最新版本。',
    "Sorry, we couldn't find that version of this Action. Here's the latest version.": '找不到此操作的该版本。已显示最新版本。',

    // 安装片段对话框
    'Copy and paste the following snippet into your': '将以下代码片段复制并粘贴到你的',
    'Learn more about this action in': '详见',

    // 无自述文件
    'This GitHub Action has no README in the repository. If': '此 GitHub 操作的存储库中没有自述文件。如果',
    'one is added': '添加了自述文件',
    ', it will appear here.': '，将显示在此处。',

    // 下架
    'Delist action?': '下架此操作？',
    'Delist action': '下架操作',
    'Are you sure you want to delist this action from the Marketplace? Note: It will still be installable as long as the repository is public.':
      '确定要从市场下架此操作吗？注意：存储库为公共存储库时仍可安装。',

    // 验证徽章
    'GitHub has manually verified the creator of the action as an official partner organization. For more info see':
      'GitHub 已人工验证此操作的创建者为官方合作伙伴组织。详见',
    'About badges in GitHub Marketplace': '关于 GitHub 市场中的徽章',
    "GitHub has verified the publisher's identity, ownership of their domain, and compliance with":
      'GitHub 已验证发布者的身份、域名所有权，以及是否符合',
    'GitHub has verified the publisher’s identity, ownership of their domain, and compliance with':
      'GitHub 已验证发布者的身份、域名所有权，以及是否符合',
    'GitHub has verified that the publisher controls the domain and meets other requirements.':
      'GitHub 已验证发布者拥有该域名并符合其他要求。',
    // 标点随原文：第一句没有逗号，第二句只有并列项的逗号
    'is not certified by GitHub. It is provided by a third-party and is governed by separate terms of service, privacy policy, and support documentation.':
      '未经 GitHub 认证。由第三方提供并适用其单独的服务条款、隐私政策和支持文档。',
    'is provided by a third-party and is governed by separate terms of service, privacy policy, and support documentation.':
      '由第三方提供并适用其单独的服务条款、隐私政策和支持文档。',

    // 应用页：按钮与菜单
    'Set up a free trial': '开始免费试用',
    'Edit current plan': '编辑当前计划',
    'Configure account access': '配置帐户访问权限',
    'Manage app listing': '管理应用上架信息',
    'Configure your installation': '配置安装',
    'Install unavailable': '无法安装',
    'Only enterprise administrators and organization admins can purchase applications from the marketplace.':
      '只有企业管理员和组织管理员才能从市场购买应用。',
    'Only enterprise admins are able to install paid Marketplace plans.': '只有企业管理员才能安装市场付费计划。',

    // 应用页：侧栏
    'Copilot Chat, Copilot in the IDE': 'Copilot 聊天、IDE 中的 Copilot',
    'GitHub Copilot license': 'GitHub Copilot 许可证',
    'Copilot Extensions require an active': 'Copilot 扩展需要有效的',

    // 计划与定价
    'Plans and pricing': '计划与定价',
    'Pricing and setup': '定价与设置',
    'Free trial available': '提供免费试用',
    'For organizations only': '仅限组织',
    'For users only': '仅限用户',
    'Enterprise-owned organization': '企业拥有的组织',
    'Supports Copilot extensions': '支持 Copilot 扩展',

    // 安装按钮与说明
    'Buy with GitHub': '通过 GitHub 购买',
    'Install it for free': '免费安装',
    'You’ve already used a free trial for this app': '你已使用过此应用的免费试用',
    "You've already used a free trial for this app": '你已使用过此应用的免费试用',
    'This app is not installable because it is missing': '此应用因缺少以下内容而无法安装',
    'Next: Confirm your installation location': '下一步：确认安装位置',
    'Next: Confirm your installation location.': '下一步：确认安装位置。',
    'Next: Confirm your installation location and payment information': '下一步：确认安装位置和付款信息',
    'Next: Confirm your installation location and payment information.': '下一步：确认安装位置和付款信息。',
    'You’ve already purchased this on all of your GitHub accounts': '你已在所有 GitHub 帐户上购买此应用',
    "You've already purchased this on all of your GitHub accounts": '你已在所有 GitHub 帐户上购买此应用',

    // 服务条款说明
    'You previously agreed to the': '你此前已同意',
    // 后接 <relative-time>：拼成「你同意这些条款于 3 天前」「…于 2024年1月5日」
    'You agreed to these terms': '你同意这些条款于',
    'is provided by a third-party and is governed by': '由第三方提供并适用',
    'Marketplace Terms of Service': '市场服务条款',

    // 透明度与安全
    'Transparency and security': '透明度与安全',
    '1. Publisher': '1. 发布者',
    '2. Permissions': '2. 权限',
    '3. Security & Compliance': '3. 安全与合规',
    'For more information on the terms of service on the GitHub Marketplace, please visit the':
      '有关 GitHub 市场服务条款的更多信息，请参阅',
    'Marketplace Developer Agreement': '市场开发人员协议',
    'An error occurred while exporting the CSV.': '导出 CSV 时出错。',
    'Repository permissions can be granted for all or selected repositories owned by the installing account.':
      '存储库权限可授予安装帐户拥有的全部或选定存储库。',
    'access to files located at': '访问权限仅限以下路径的文件',
    'OAuth Apps use scopes to grant access based on your current user permissions. You can view the specific scopes being requested before completing authorization. Scopes requested may change over time and depending on which resources you have access to. GitHub Apps use fixed, granular controls set at installation time.':
      'OAuth 应用通过作用域按你当前的用户权限授予访问权限。完成授权前可查看所请求的具体作用域。所请求的作用域可能随时间及你可访问的资源而变化。GitHub 应用使用安装时设定的固定、精细控制。',
    'Learn more about OAuth and GitHub Apps': '了解 OAuth 应用和 GitHub 应用',
    'Security & Compliance information is self-attested by the publisher. Only the Publisher and Permissions information is verified by GitHub. Make sure to conduct your own security reviews.':
      '安全与合规信息由发布者自行声明。只有发布者和权限信息经过 GitHub 验证。请自行进行安全审查。',
    'EU Trader': '欧盟贸易商',
    'Publisher 2FA Required': '发布者要求 2FA',
    // 透明度表格取值：<Yes|No|Not applicable> - <说明>（服务端数据，原文已在应用页核实）
    'Yes - Classifies as a trader in the European Union': '是 - 属于欧盟贸易商',
    'No - Does not classify as a trader in the European Union': '否 - 不属于欧盟贸易商',
    'Yes - Publisher organization requires 2FA': '是 - 发布者组织要求 2FA',
    'No - Publisher organization does not require 2FA': '否 - 发布者组织不要求 2FA',
    'Not applicable - Individual publisher': '不适用 - 个人发布者',
    'Indemnity Status': '赔偿状态',
    "Not covered by Microsoft's indemnity policy. All other Copilot features retain indemnity coverage.":
      '不在 Microsoft 赔偿政策范围内。其他所有 Copilot 功能仍享有赔偿保障。',
    'Not covered by Microsoft’s indemnity policy. All other Copilot features retain indemnity coverage.':
      '不在 Microsoft 赔偿政策范围内。其他所有 Copilot 功能仍享有赔偿保障。',
    'Classified as high risk by EU AI Act': '被欧盟人工智能法案列为高风险',
    'Third party services used': '使用的第三方服务'
  },
  scoped: {
    ...PLAN_SCOPED,
    Customers: '客户',
    Disclosures: '披露信息',
    Paid: '付费',
    By: '来自',
    by: '来自',
    Latest: '最新',
    'Pre-release': '预发行版',
    Use: '使用',
    'latest version': '最新版本',
    'instead?': '？',
    Installation: '安装',
    'file.': '文件中。',
    'No description': '暂无描述',
    'Security policy': '安全策略',
    // 侧栏「Tags」下是 code-quality、code-review 等市场类别标签（链接到 /marketplace?category=…），不是 Git 标签
    Tags: '标签',
    contributors: '个贡献者',
    Transparency: '透明度',
    install: '次安装',
    installs: '次安装',
    'Free Trial': '免费试用',
    'Pay-as-you-go': '按需付费',
    Plans: '计划',
    'Account:': '帐户：',
    '/ month': '/ 月',
    'Current plan': '当前计划',
    separate: '单独的',
    Requirements: '要求',
    Developer: '开发人员',
    Read: '读取',
    write: '写入',
    Info: '信息',
    No: '否',
    Integration: '集成',
    'Start a discussion': '开始讨论',
    'Open an issue': '提交议题',
    'View source code': '查看源代码',
    'Export CSV': '导出 CSV',
    'Select a tab': '选择标签页',
    'Select a tab navigation': '选择标签页',
    // Terms of service 由 common/site.ts 的全局词条翻译
    'Privacy policy': '隐私政策',
    'terms of service': '服务条款',
    'privacy policy': '隐私政策',
    'support contact': '支持联系方式',
    'support documentation': '支持文档',
    'other requirements': '其他要求',
    'Status page': '状态页',
    'Support URL': '支持 URL',
    'Support email': '支持电子邮件',
    'Select account': '选择帐户',
    'Already installed': '已安装',
    'Works with': '适用于',
    'Supported languages': '支持的语言',
    'Latest version': '最新版本',
    'Choose a version': '选择版本',
    'Company domain': '公司域名',
    'Business address': '营业地址',
    'Business ID': '企业 ID',
    'Repository URL': '存储库 URL',
    'Repository visibility': '存储库可见性',
    'Models used': '使用的模型',
    'Requires a': '需要',
    'From the developer': '来自开发人员',
    'an installation URL': '安装 URL',
    'and payment information': '和付款信息'
  },
  regexp: [
    // 头部
    [/^Star this repository \(([\d.,]+[kKmM]?)\)$/, '为此存储库加星标 ($1)'],
    [/^Unstar this repository \(([\d.,]+[kKmM]?)\)$/, '取消此存储库的星标 ($1)'],
    [/^You cannot star repositories outside of your enterprise (.+)$/, '无法为企业 $1 以外的存储库加星标'],
    [/^Use ([\w.+-]+)$/, '使用 $1'],
    [/^\+ ?(\d[\d,]*) contributors?$/, '+ $1 个贡献者'],

    // 计划与安装：计划名译出后与中文直接相连，保留原文时补空格
    [
      /^(.+) plan(s?) available\.$/,
      (_, names: string, plural: string) => joinCjk(joinCjk('提供', plural ? planNames(names) : planName(names)), '计划。')
    ],
    [/^Number of (\w+?)s$/, (_, unit: string) => joinCjk(UNIT_NAMES[unit] ?? unit, '数量')],
    [/^Account: (.+)$/, '帐户：$1'],
    [/^Set ?up with (.+)$/, '使用 $1 设置'],
    [/^Try free for (\d+) (day|month)s?$/, (_, count: string, unit: string) => `免费试用 ${count} ${unit === 'day' ? '天' : '个月'}`],
    [new RegExp(`^/ (${UNIT_SOURCE})$`), (_, unit: string) => `/ ${UNIT_NAMES[unit] ?? unit}`],
    [/^(\d+) days? left of free trial$/, '免费试用剩余 $1 天'],

    // 服务条款说明（整句）；原文按钮名带引号、引号后有逗号，译文照录
    [/^By clicking “Set up with (.+?),” you are agreeing to the$/, '单击“使用 $1 设置”，即表示你同意'],
    [/^By clicking “Set up with (.+?),” you are agreeing to (.+)’s$/, '单击“使用 $1 设置”，即表示你同意 $2 的'],
    // 原文按钮名没有引号，译文不加
    [/^By clicking Set up with (.+?), you agree to the$/, '单击使用 $1 设置，即表示你同意'],
    [/^By clicking Set up with (.+?), you agree to (.+)’s$/, '单击使用 $1 设置，即表示你同意 $2 的'],
    [/^, ?and (.+)’s$/, '，以及 $1 的'],
    [/^, ?(.+)’s$/, '，以及 $1 的'],
    [/^(.+) is owned and operated by GitHub with separate$/, '$1 由 GitHub 拥有和运营并适用单独的'],
    [/^(.+) is provided by a third-party and is governed by separate$/, '$1 由第三方提供并适用单独的'],
    [/^(.+) is owned and operated by GitHub$/, '$1 由 GitHub 拥有和运营'],

    // 透明度：权限表
    [/^access to ([A-Za-z][A-Za-z ,-]*[A-Za-z])$/, (_, list: string) => accessTo(list)]
  ],
  ignore: [
    // 头部名称、面包屑末项、简介、版本号（标签名）
    '[data-testid="overview-header"] h1',
    '[data-testid="overview-header"] nav li:last-child',
    '[data-testid="about"] > span',
    '[data-testid="about"] [class*="prc-Truncate-Truncate-"]',
    // 版本选择对话框：版本号（标签名）、发行版标题（与标签名不同时显示在条目描述中）
    '[data-testid="version-picker-dialog"] [data-component="ActionList.Item.Label"]',
    '[data-testid="version-picker-dialog"] [data-component="ActionList.Description"]',
    // 安装片段对话框标题中的名称与简介
    '[role="dialog"] h3.lh-condensed',
    '[role="dialog"] h3.lh-condensed + p',
    // 支持的语言列表（发布者选择）
    '[data-testid="languages"] > span',
    // 计划描述与要点（发布者填写）。计划名不忽略：常见英文词照译（PLAN_SCOPED 与 common），其余保留原文
    '[data-testid="plans-radio-group"] [id$="-description"]',
    '[data-testid="plans-radio-group"] li',
    // 截图说明（发布者填写）
    '.ScreenshotCarousel-screenshot > .pt-2'
  ]
} satisfies PageDictionary
