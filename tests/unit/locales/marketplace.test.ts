import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import marketplace from '../../../src/locales/zh-CN/marketplace'
import agreement, { agreementText } from '../../../src/locales/zh-CN/marketplace/agreement'
import marketplaceHook from '../../../src/locales/zh-CN/marketplace-hook'
import developerApps from '../../../src/locales/zh-CN/settings-developer/apps'
import marketplaceTW from '../../../src/locales/zh-TW/marketplace'
import marketplaceHookTW from '../../../src/locales/zh-TW/marketplace-hook'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = marketplace

const matcher = createMatcher([['marketplace', marketplace]])
/** 含通用词典，与实际页面一致：计划名 Free、Pro、Open Source 与权限级别 Admin 等通用词由 common / common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['marketplace', marketplace]
])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'marketplace'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 搜索结果与类别
  { hits: [['Search results for “zzqqxx”', '“zzqqxx”的搜索结果']], misses: ['Search results for "zzqqxx"'] },
  {
    hits: [
      ['0 results', '0 个结果'],
      ['1 result', '1 个结果'],
      // 原文末尾的句号照录
      ['25 results.', '25 个结果。']
    ],
    misses: ['results']
  },
  {
    hits: [
      ['Code quality apps', '代码质量应用'],
      ['Code quality actions', '代码质量操作'],
      ['AI Assisted apps', 'AI 辅助应用'],
      ['IDEs apps', 'IDE 应用'],
      // 产品名译中文：GitHub Sponsors → GitHub 赞助
      ['GitHub Sponsors actions', 'GitHub 赞助操作'],
      ['Mobile apps', '移动端应用'],
      ['Container CI actions', '容器 CI 操作']
    ],
    misses: ['Popular apps']
  },
  {
    hits: [
      ['Page 2', '第 2 页'],
      // 省略号随原文
      ['Page 7...', '第 7 页...'],
      ['Page 7…', '第 7 页…']
    ],
    misses: ['Page two']
  },

  // 操作页
  {
    hits: [
      ['Star this repository (9K)', '为此存储库加星标 (9K)'],
      ['Star this repository (1,234)', '为此存储库加星标 (1,234)']
    ],
    misses: ['Star this repository']
  },
  { hits: [['Unstar this repository (9K)', '取消此存储库的星标 (9K)']], misses: ['Unstar this repository'] },
  {
    hits: [['You cannot star repositories outside of your enterprise Acme', '无法为企业 Acme 以外的存储库加星标']],
    misses: ['You cannot star repositories']
  },
  {
    hits: [
      ['Use v4', '使用 v4'],
      ['Use v7.0.1', '使用 v7.0.1']
    ],
    misses: ['Use this action now']
  },
  {
    hits: [
      ['+ 12 contributors', '+ 12 个贡献者'],
      ['+ 1 contributor', '+ 1 个贡献者']
    ],
    misses: ['contributors to this']
  },

  // 应用页：计划与安装
  {
    hits: [
      // 并列计划名：「A 和 B」「A、B 和 C」，原文 and 不译作顿号；常见计划名按方案名译「X 版」，Open Source → 开源
      ['Open Source and Umbrella plans available.', '提供开源和 Umbrella 计划。'],
      ['Free plan available.', '提供免费版计划。'],
      ['Umbrella plan available.', '提供 Umbrella 计划。'],
      [
        'Renovate Community Cloud. Free, hosted Renovate by Mend.io plan available.',
        '提供 Renovate Community Cloud. Free, hosted Renovate by Mend.io 计划。'
      ],
      ['Free, Pro, and Enterprise plans available.', '提供免费版、专业版和企业版计划。'],
      ['Starter and Business plans available.', '提供入门版和商业版计划。'],
      // 采集到的实际句子：小写 Open source 同译，其余自定义计划名保留原文
      ['Open source, Agency, Enterprise, Gold, and Platinum plans available.', '提供开源、Agency、企业版、Gold 和 Platinum 计划。']
    ],
    misses: ['Plans available']
  },
  {
    hits: [
      ['Number of users', '用户数量'],
      ['Number of seats', '席位数量'],
      ['Number of developers', '开发人员数量'],
      ['Number of widgets', 'widget 数量']
    ],
    misses: ['Number of']
  },
  { hits: [['Account: octocat', '帐户：octocat']], misses: ['Account octocat'] },
  {
    hits: [
      ['Set up with Codecov', '使用 Codecov 设置'],
      // 新建计划的预览按钮写作一个词
      ['Setup with 1651asduhaiuh', '使用 1651asduhaiuh 设置']
    ],
    misses: ['Set up']
  },
  {
    hits: [
      ['Try free for 14 days', '免费试用 14 天'],
      ['Try free for 1 day', '免费试用 1 天'],
      ['Try free for 1 month', '免费试用 1 个月'],
      ['Try free for 2 months', '免费试用 2 个月']
    ],
    misses: ['Try free', 'Try free for 2 weeks']
  },
  {
    hits: [
      ['/ user', '/ 用户'],
      ['/ seat', '/ 席位'],
      ['/ repository', '/ 存储库']
    ],
    misses: ['/ widget', '/ users']
  },
  {
    hits: [
      ['3 days left of free trial', '免费试用剩余 3 天'],
      ['1 day left of free trial', '免费试用剩余 1 天']
    ],
    misses: ['days left of free trial']
  },

  // 服务条款说明（原文按钮名带引号、引号后有逗号，译文照录）
  {
    hits: [['By clicking “Set up with Codecov,” you are agreeing to the', '单击“使用 Codecov 设置”，即表示你同意']],
    misses: ['By clicking “Set up,” you are agreeing to the']
  },
  {
    hits: [['By clicking “Set up with Codecov,” you are agreeing to Codecov’s', '单击“使用 Codecov 设置”，即表示你同意 Codecov 的']],
    misses: ['By clicking “Set up with Codecov,” you are agreeing to Codecov']
  },
  {
    // 原文按钮名没有引号，译文不加
    hits: [['By clicking Set up with Codecov, you agree to the', '单击使用 Codecov 设置，即表示你同意']],
    misses: ['By clicking Install, you agree to the']
  },
  {
    hits: [['By clicking Set up with Codecov, you agree to Codecov’s', '单击使用 Codecov 设置，即表示你同意 Codecov 的']],
    misses: ['By clicking Set up with Codecov, you agree']
  },
  { hits: [[', and Codecov’s', '，以及 Codecov 的']], misses: [', and Codecov'] },
  {
    hits: [
      [',Codecov’s', '，以及 Codecov 的'],
      [', Codecov’s', '，以及 Codecov 的']
    ],
    misses: ['Codecov’s']
  },
  {
    hits: [['Copilot for Docker is owned and operated by GitHub with separate', 'Copilot for Docker 由 GitHub 拥有和运营并适用单独的']],
    misses: ['is owned and operated by GitHub with separate']
  },
  {
    hits: [['Codecov is provided by a third-party and is governed by separate', 'Codecov 由第三方提供并适用单独的']],
    misses: ['Codecov is provided by a third-party']
  },
  {
    hits: [['Copilot for Docker is owned and operated by GitHub', 'Copilot for Docker 由 GitHub 拥有和运营']],
    misses: ['Owned and operated by GitHub']
  },

  // 透明度：权限表（访问级别 Read / write / Admin 是前面单独的加粗元素）
  {
    hits: [
      [
        'access to public repositories, public organization information, and public user profile data',
        '访问权限适用于公共存储库、公开组织信息和公开用户个人资料数据'
      ],
      ['access to contents and metadata', '访问权限适用于内容和元数据'],
      ['access to checks', '访问权限适用于检查'],
      ['access to Dependabot alerts, administration, and merge queues', '访问权限适用于 Dependabot 警报、管理和合并队列'],
      ['access to members and organization administration', '访问权限适用于成员和组织管理'],
      // 产品名权限 actions / codespaces 译中文；未知权限名保留原文，“和”与英文之间加空格
      ['access to actions and pages', '访问权限适用于操作和页面'],
      ['access to codespaces and metadata', '访问权限适用于代码空间和元数据'],
      ['access to metadata and Dependabot alerts', '访问权限适用于元数据和 Dependabot 警报'],
      ['access to custom properties and metadata', '访问权限适用于 custom properties 和元数据']
    ],
    misses: ['access', 'access to your GitHub account.', 'access to 2 repositories']
  },

  // GitHub 应用页与安装授权
  { hits: [['GitHub Apps - Codecov', 'GitHub 应用 - Codecov']], misses: ['GitHub Apps'] },
  {
    hits: [['Install & Authorize on your personal account octocat', '安装并授权到个人帐户 octocat']],
    misses: ['install & Authorize on your personal account octocat']
  },
  {
    hits: [['Install & Authorize on your organization octo-org', '安装并授权到组织 octo-org']],
    misses: ['install & Authorize on your organization octo-org']
  },
  {
    hits: [['Install on your personal account octocat', '安装到个人帐户 octocat']],
    misses: ['install on your personal account octocat']
  },
  {
    hits: [['Install on your organization octo-org', '安装到组织 octo-org']],
    misses: ['install on your organization octo-org']
  },
  {
    hits: [['Authorize & Request on your organization octo-org', '授权并向组织 octo-org 申请']],
    misses: ['Authorize & request on your organization octo-org']
  },
  {
    hits: [['Request on your organization octo-org', '向组织 octo-org 申请']],
    misses: ['Request on your team octo-org']
  },
  {
    hits: [['Where do you want to install Codecov?', '要将 Codecov 安装到哪里？']],
    misses: ['Where do you want to install Codecov']
  },
  {
    hits: [['Codecov is installed. Click to configure.', 'Codecov 已安装。单击进行配置。']],
    misses: ['Codecov is installed.']
  },
  {
    hits: [
      // 原文末尾的句号照录
      ['Selected 3 repositories.', '已选择 3 个存储库。'],
      ['Selected 1 repository', '已选择 1 个存储库']
    ],
    misses: ['Selected repositories']
  },
  {
    hits: [
      [
        'Installing and authorizing Codecov immediately grants these permissions on your account:',
        '安装并授权 Codecov 会立即在你的帐户上授予以下权限：'
      ]
    ],
    misses: ['Installing and authorizing Codecov']
  },
  {
    hits: [
      [
        "Codecov can also request users' permission to the following resources. These permissions will be requested and authorized on an individual-user basis.",
        'Codecov 还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。'
      ]
    ],
    misses: ['Codecov can also request users permission to the following resources.']
  },
  { hits: [['Install Codecov', '安装 Codecov']], misses: ['install Codecov'] },
  // 上架项的创建与编辑：标题、页头、交易页标题段
  {
    hits: [['Edit 1651asduhaiuh - GitHub Marketplace', '编辑 1651asduhaiuh - GitHub 市场']],
    misses: ['Editing 1651asduhaiuh - GitHub Marketplace']
  },
  { hits: [['Edit 1651asduhaiuh', '编辑 1651asduhaiuh']], misses: ['Editing 1651asduhaiuh'] },
  { hits: [['1651asduhaiuh Transactions', '1651asduhaiuh 交易']], misses: ['1651asduhaiuh transactions'] },
  { hits: [['Create draft listing for Stb', '为 Stb 创建上架项草稿']], misses: ['Create draft listing for'] },
  // 字数限制与剩余
  {
    hits: [
      ['Limit 255 characters.', '限 255 个字符。'],
      ['Limit 1,000 characters.', '限 1,000 个字符。']
    ],
    misses: ['Limit 255 characters']
  },
  { hits: [['252 remaining.', '还剩 252 个字符。']], misses: ['252 remaining'] },
  { hits: [['Limit 255 characters. 252 remaining.', '限 255 个字符。还剩 252 个字符。']], misses: ['Limit 255 characters 252 remaining.'] },
  // 步骤进度
  { hits: [['1 of 5', '1 / 5']], misses: ['Step 1 of 5'] },
  // 开发人员协议
  {
    hits: [['GitHub Marketplace Developer Agreement v2.4', 'GitHub 市场开发人员协议 v2.4']],
    misses: ['GitHub Marketplace Developer Agreement 2.4']
  },
  {
    hits: [['signed the GitHub Marketplace Developer Agreement version v2.3', '签署 GitHub 市场开发人员协议 v2.3 版于']],
    misses: ['signed the GitHub Marketplace Developer Agreement']
  },
  {
    hits: [['This is a list of the financial transactions for 1651asduhaiuh.', '1651asduhaiuh 的财务交易列表。']],
    misses: ['This is a list of the financial transactions.']
  },
  // 新建计划
  { hits: [['Enable 14 day free trial for this plan', '为此计划启用 14 天免费试用']], misses: ['Enable free trial for this plan'] },
  {
    hits: [
      ['Plan bullet 1', '计划要点 1'],
      ['Plan bullet 4', '计划要点 4']
    ],
    misses: ['Plan bullet']
  },
  // 订单与安装：下一步提示、按比例计费区间、跳转、已安装、取消计划、卸载确认与完成提示
  {
    hits: [['Next: Authorize Render to access your account.', '下一步：授权 Render 访问你的帐户。']],
    misses: ['Next: Authorize the app.']
  },
  { hits: [['Prorated for Nov 19th-Dec 18th', '11月19日至12月18日按比例计费']], misses: ['Prorated for November'] },
  {
    hits: [['You are being redirected to Render to continue installation.', '正在重定向到 Render 以继续安装。']],
    misses: ['You are being redirected.']
  },
  {
    hits: [
      [
        'You have already installed and set up a plan for Render on setube-organization. To proceed, please select a different plan or account.',
        '你已在 setube-organization 上安装 Render 并设置了计划。如需继续，请选择其他计划或帐户。'
      ]
    ],
    misses: ['You have already installed and set up a plan.']
  },
  {
    hits: [
      [
        'Cancelling this plan will end your subscription to this app on 2026-11-19. Are you sure you wish to continue?',
        '取消此计划将于 2026-11-19 终止你对此应用的订阅。确定继续吗？'
      ]
    ],
    misses: ['Cancelling this plan will end your subscription.']
  },
  {
    hits: [
      [
        'It looks like Render has already been installed on your account. You can view your current installation or continue with setting up this plan.',
        'Render 似乎已安装在你的帐户上。可以查看当前安装或继续设置此计划。'
      ]
    ],
    misses: ['It looks like it has already been installed.']
  },
  {
    hits: [
      [
        'This action cannot be undone. Are you sure you want to uninstall this GitHub App from 1 repository?',
        '此操作无法撤消。确定从 1 个存储库卸载此 GitHub 应用吗？'
      ]
    ],
    misses: ['Are you sure you want to uninstall this GitHub App?']
  },
  {
    hits: [["You're all set! A job has been queued to uninstall the 'Render' app.", '已完成！卸载“Render”应用的作业已加入队列。']],
    misses: ["You're all set!"]
  },
  // 开发人员协议：生效日期；与收录原文只差编号写法、标点的段落（规范化后查表）
  { hits: [['Effective Date: May 27, 2025', '生效日期：2025年5月27日']], misses: ['Effective Date: soon'] },
  {
    hits: [['ii. Notify users when they are interacting with generative AI content;', 'ii. 在用户与生成式 AI 内容交互时通知用户；']],
    misses: ['Notify users when they are interacting with other content;']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('marketplace 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = marketplace.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Use ', 'latest version'].join('')))).toBe('使用最新版本')
    expect(translate(normalizeText(['install', 's'].join('')))).toBe('次安装')
    expect(translate(normalizeText(['Next: Confirm your installation location', ' and payment information'].join('')))).toBe(
      '下一步：确认安装位置和付款信息'
    )
    expect(translate(normalizeText(['Codecov', ' is provided by a third-party and is governed by', ' ', 'separate', ' '].join('')))).toBe(
      'Codecov 由第三方提供并适用单独的'
    )
    expect(translate(normalizeText(['By clicking “', 'Set up with Codecov', ',” you are agreeing to', ' ', 'the', ' '].join('')))).toBe(
      '单击“使用 Codecov 设置”，即表示你同意'
    )
    expect(translate(normalizeText(['+ ', '12', ' contributors'].join('')))).toBe('+ 12 个贡献者')
  })

  it('权限表：访问级别与描述片段拼读，原文无标点的片段不加冒号', () => {
    const row = (...parts: readonly string[]): string => parts.map(part => translate(part) ?? part).join(' ')
    expect(row('Read', 'access to contents and metadata')).toBe('读取 访问权限适用于内容和元数据')
    expect(row('write', 'access to checks')).toBe('写入 访问权限适用于检查')
    expect(row('Read', 'access to files located at')).toBe('读取 访问权限仅限以下路径的文件')
    expect(translate('access to contents and metadata')).not.toMatch(/[：:]/)
    // 访问级别 Admin 由 common 的全局 static 译出
    const fullRow = (...parts: readonly string[]): string =>
      parts.map(part => fullMatcher.translate(part, ['common', 'marketplace']) ?? part).join(' ')
    expect(fullRow('Admin', 'access to checks')).toBe('管理员 访问权限适用于检查')
  })
})

describe('marketplace 静态词条', () => {
  it.each([
    ['Enhance your workflow with extensions', '使用扩展增强你的工作流'],
    ['Search for apps and actions', '搜索应用和操作'],
    ['All apps', '全部应用'],
    ['All actions', '全部操作'],
    ['Actions only', '仅操作'],
    ['Copilot extensions only', '仅 Copilot 扩展'],
    ['Verified creators', '已验证创建者'],
    [
      'Automate your code review with style, quality, security, and test‑coverage checks when you need them.',
      '按需通过代码风格、质量、安全和测试覆盖率检查自动执行代码审查。'
    ],
    ['Get insights into how your teams are developing software using GitHub.', '深入了解团队如何使用 GitHub 开发软件。'],
    ['Use latest version', '使用最新版本'],
    ['Choose a version', '选择版本'],
    ['Delist action?', '下架此操作？'],
    ['You must be signed in to star a repository', '登录后才能为存储库加星标'],
    ['Verified creator', '已验证创建者'],
    ['Plans and pricing', '计划与定价'],
    ['Install it for free', '免费安装'],
    ['Buy with GitHub', '通过 GitHub 购买'],
    ['You’ve already used a free trial for this app', '你已使用过此应用的免费试用'],
    ['Transparency and security', '透明度与安全'],
    ['3. Security & Compliance', '3. 安全与合规'],
    ['Learn more about OAuth and GitHub Apps', '了解 OAuth 应用和 GitHub 应用'],
    ['Learn more about GitHub Apps', '了解 GitHub 应用'],
    ['Set up a free trial', '开始免费试用'],
    ['Learn more about this action in', '详见'],
    ['Install & Authorize', '安装并授权'],
    ['Installing & Authorizing', '安装并授权中'],
    ['Only select repositories', '仅选定的存储库'],
    ['Pending orders', '待处理订单'],
    ['Remove from pending orders', '从待处理订单中删除'],
    ['Listing type, Filter, Filter by listing type', '类型，筛选器，按类型筛选'],
    ['Category, Filter, Filter by category or tag', '类别，筛选器，按类别或标签筛选'],
    ['View recommended or recent marketplace listings', '查看推荐或最近添加的上架项'],
    ['Yes - Classifies as a trader in the European Union', '是 - 属于欧盟贸易商'],
    ['No - Does not classify as a trader in the European Union', '否 - 不属于欧盟贸易商'],
    ['Yes - Publisher organization requires 2FA', '是 - 发布者组织要求 2FA'],
    ['No - Publisher organization does not require 2FA', '否 - 发布者组织不要求 2FA'],
    ['Not applicable - Individual publisher', '不适用 - 个人发布者'],
    // 产品名译中文（用户决定 2026-10-27）：Marketplace → 市场、GitHub Marketplace → GitHub 市场、Copilot Chat → Copilot 聊天
    ['Search Marketplace', '搜索市场'],
    ['Search in GitHub Marketplace', '在 GitHub 市场中搜索'],
    ['Marketplace navigation', '市场导航'],
    ['Marketplace Terms of Service', '市场服务条款'],
    ['Marketplace Developer Agreement', '市场开发人员协议'],
    ['About badges in GitHub Marketplace', '关于 GitHub 市场中的徽章'],
    ['Read more about this app on the Marketplace', '在市场中了解此应用'],
    ['List your tool on GitHub Marketplace', '在 GitHub 市场上架你的工具'],
    ['Only enterprise admins are able to install paid Marketplace plans.', '只有企业管理员才能安装市场付费计划。'],
    ['Copilot Chat, Copilot in the IDE', 'Copilot 聊天、IDE 中的 Copilot'],
    // 标点随原文：原文无标点或结尾无标点的片段
    ['Tools from the community and partners to simplify tasks and automate processes', '来自社区和合作伙伴的任务简化与流程自动化工具'],
    ['Enables custom protection rules to gate deployments with third-party services', '启用自定义保护规则以借助第三方服务管控部署'],
    ['This app is not installable because it is missing', '此应用因缺少以下内容而无法安装'],
    ['is provided by a third-party and is governed by', '由第三方提供并适用'],
    ['access to files located at', '访问权限仅限以下路径的文件'],
    ['Classified as high risk by EU AI Act', '被欧盟人工智能法案列为高风险'],
    ['View or cancel any active subscriptions on the', '如需查看或取消有效订阅请前往'],
    // 标点随原文：原文没有逗号的句子，译文改语序或用“以”“并”连接
    ['to list a tool on GitHub Marketplace.', '以在 GitHub 市场上架工具。'],
    ['Streamline your code deployment so you can focus on your product.', '简化代码部署以便专注于产品。'],
    [
      'Tools that are superpowered with AI (artificial intelligence) to help you be a better developer.',
      'AI（人工智能）加持的工具助你成为更好的开发人员。'
    ],
    [
      'We noticed you started setting up some new plans but didn’t finish. You can complete your pending orders below or review any active subscriptions on the',
      '你有尚未完成设置的新计划。可在下方完成待处理订单或前往可查看有效订阅的'
    ],
    [
      'Are you sure you want to delist this action from the Marketplace? Note: It will still be installable as long as the repository is public.',
      '确定要从市场下架此操作吗？注意：存储库为公共存储库时仍可安装。'
    ],
    [
      'is not certified by GitHub. It is provided by a third-party and is governed by separate terms of service, privacy policy, and support documentation.',
      '未经 GitHub 认证。由第三方提供并适用其单独的服务条款、隐私政策和支持文档。'
    ],
    // link → 链接
    [
      'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by',
      '组织所有者或账单管理员必须将个人账单信息链接到此组织帐户。若要切换为企业帐户以使用企业账单信息请'
    ],
    // 原文按钮名带引号、引号后有逗号，译文照录
    ['By clicking “Complete order and begin installation”, you agree to the', '单击“完成订单并开始安装”，即表示你同意'],
    ['By clicking "Complete order and begin installation", you agree to the', '单击“完成订单并开始安装”，即表示你同意'],
    // 原文两句，译文不用逗号合并
    ['Sorry, we couldn’t find that version of this Action. Here’s the latest version.', '找不到此操作的该版本。已显示最新版本。']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('产品名译中文：译文里不再出现英文 Marketplace、Actions、Codespaces、Copilot Chat', () => {
    const values = [...Object.values(dict.static ?? {}), ...Object.values(dict.scoped ?? {})]
    expect(values.filter(value => /Marketplace|\bActions\b|Codespaces|Copilot Chat/.test(value))).toEqual([])
  })
})

describe('marketplace 页面词条', () => {
  it.each([
    // 产品名译中文：侧栏分区标题、面包屑与搜索结果分区标题里的 Actions（Marketplace、GitHub Marketplace 由 common 译“市场”）
    ['Actions', '操作'],
    ['GitHub Sponsors', 'GitHub 赞助'],
    ['Apps', '应用'],
    ['App', '应用'],
    ['Action', '操作'],
    ['Chat', '聊天'],
    ['Code quality', '代码质量'],
    ['Popularity', '热门程度'],
    ['installs', '次安装'],
    ['latest version', '最新版本'],
    ['Read', '读取'],
    ['write', '写入'],
    ['Developer', '开发人员'],
    ['Installing', '安装中'],
    ['Requesting', '申请中'],
    ['billing overview page', '计费概述页'],
    ['Filter:', '筛选器：'],
    ['Collapse sidebar', '折叠侧栏'],
    // 搜索框输入 type:、category: 时的有值建议项
    ['Has listing type', '有类型'],
    ['Has category', '有类别'],
    ['Mobile', '移动端'],
    ['Mobile CI', '移动端 CI'],
    ['Tools to manage your', '管理'],
    ['community', '社区的工具'],
    // 操作页侧栏：Tags 下是 code-quality 等市场类别标签（链接到 /marketplace?category=…），不是版本标签
    ['Tags', '标签'],
    ['Start a discussion', '开始讨论'],
    ['Open an issue', '提交议题'],
    // 计划卡片上的常见计划名（Free、Pro、Open Source 由 common 译出）
    ['Starter', '入门版'],
    ['Business', '商业版'],
    ['Open source', '开源']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('页面词条只在 marketplace 页面生效', () => {
    expect(matcher.translate('Apps', ['common'])).toBeUndefined()
    expect(matcher.translate('Action', ['common'])).toBeUndefined()
    expect(matcher.translate('Actions', ['common'])).toBeUndefined()
    expect(matcher.translate('Install Codecov', ['common'])).toBeUndefined()
    expect(matcher.translate('Tools to manage your', ['common'])).toBeUndefined()
    expect(matcher.translate('/ user', ['common'])).toBeUndefined()
    expect(matcher.translate('Has category', ['common'])).toBeUndefined()
  })

  it('已下线的 GitHub Models 词条已移除', () => {
    expect(dict.static?.['Search for apps, actions, and models']).toBeUndefined()
    // 模型目录的能力标签、模型试验场的预设选择器
    for (const key of ['Coding', 'Preset:']) {
      expect(dict.static?.[key], key).toBeUndefined()
      expect(dict.scoped?.[key], key).toBeUndefined()
    }
  })

  it('类别名不进入 static', () => {
    expect(dict.static?.['Chat']).toBeUndefined()
    expect(dict.scoped?.['Security']).toBeUndefined()
    expect(dict.static?.['GitHub Sponsors']).toBeUndefined()
  })

  it('与全站 static 译文相同的词条不在本页重复收录', () => {
    for (const key of [
      'Clear filter',
      'Featured',
      'Star',
      'Starred',
      'Admin',
      'Configure',
      'No results',
      'Marketplace',
      'Free',
      'Pro',
      'Open Source',
      'and the'
    ]) {
      expect(dict.static?.[key]).toBeUndefined()
      expect(dict.scoped?.[key]).toBeUndefined()
    }
    // and the 由 common/pages.ts 的全局词条翻译
    expect(fullMatcher.translate('and the', ['common', 'marketplace'])).toBe('和')
  })
})

describe('marketplace 繁体词条（zh-TW）', () => {
  const twDict: PageDictionary = marketplaceTW
  const twMatcher = createMatcher([['marketplace', marketplaceTW]])

  it.each([
    ['Has listing type', '有類型'],
    ['Has category', '有類別'],
    ['Per unit', '按單位計費'],
    ['Available for', '適用於'],
    ['(s) in this plan', '（此方案內）']
  ])('页面：%s → %s', (input, expected) => {
    expect(twDict.scoped?.[input]).toBe(expected)
    expect(twMatcher.translate(input, ['common', 'marketplace'])).toBe(expected)
  })

  it('页面词条只在 marketplace 页面生效', () => {
    expect(twMatcher.translate('Has category', ['common'])).toBeUndefined()
  })
})

describe('marketplace 忽略选择器', () => {
  it.each(marketplace.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('列表条目名称与描述被忽略', () => {
    expect(marketplace.ignore).toEqual(
      expect.arrayContaining(['[data-testid="marketplace-item"] h3', '[data-testid="marketplace-item"] p'])
    )
  })

  it('截图说明被忽略', () => {
    const root = document.createElement('div')
    root.innerHTML = '<div role="tabpanel" class="ScreenshotCarousel-screenshot"><img alt=""><div class="pt-2">Settings</div></div>'
    const selector = (marketplace.ignore ?? []).join(', ')
    expect(root.querySelector('.pt-2')?.matches(selector)).toBe(true)
  })

  it('搜索框的查询文本叠加层被忽略，提示文字照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div id="marketplace-search-filter">',
      '<div aria-hidden="true" class="styled-input-content"><span class="text-block">Testing</span></div>',
      '<div aria-hidden="true"><span>Testing</span></div>',
      '<span aria-hidden="true" data-component="Tooltip">Clear filter</span>',
      '</div>'
    ].join('')
    const selector = (marketplace.ignore ?? []).join(', ')
    const overlays = [...root.querySelectorAll('#marketplace-search-filter > div')]
    expect(overlays).toHaveLength(2)
    expect(overlays.every(element => element.matches(selector))).toBe(true)
    expect(root.querySelector('[data-component="Tooltip"]')?.closest(selector)).toBeNull()
  })

  /** 元素自身或祖先命中忽略选择器 */
  function isIgnored(root: Element, query: string): boolean {
    const element = root.querySelector(query)
    if (!element) throw new Error(`找不到元素：${query}`)
    return element.closest((marketplace.ignore ?? []).join(', ')) !== null
  }

  it('列表条目的类型标签照常翻译，名称与描述被忽略', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div data-testid="marketplace-item"><div data-testid="non-featured-item"><div class="d-flex">',
      '<h3><a href="/marketplace/actions/hello-world">Hello World</a></h3>',
      '<span data-testid="listing-type-label">Action</span></div>',
      '<p class="mt-1 mb-0">Greet someone</p></div></div>'
    ].join('')
    expect(isIgnored(root, 'h3 a')).toBe(true)
    expect(isIgnored(root, 'p')).toBe(true)
    expect(isIgnored(root, '[data-testid="listing-type-label"]')).toBe(false)
    expect(translate('Action')).toBe('操作')
  })

  it('操作页版本号与发行版标题被忽略，“最新”标签与对话框标题照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div data-testid="about"><span>Checkout a Git repository</span>',
      '<div class="min-width-0"><div class="prc-Truncate-Truncate-2G1eo" title="v7.0.1"><span>v7.0.1</span></div>',
      '<span data-component="Label">Latest</span></div></div>',
      '<div role="dialog"><h1 data-component="Dialog.Title">Choose a version</h1>',
      '<ul data-testid="version-picker-dialog"><li data-component="ActionList.Item"><a href="?version=v8.1.1">',
      '<span data-component="ActionList.Item--DividerContainer"><div data-description-variant="block">',
      '<span data-component="ActionList.Item.Label"><span class="text-semibold">v8.1.1</span></span>',
      '<span data-component="ActionList.Description">Latest</span></div></span></a></li></ul></div>'
    ].join('')
    expect(isIgnored(root, '[title="v7.0.1"] > span')).toBe(true)
    expect(isIgnored(root, '.text-semibold')).toBe(true)
    expect(isIgnored(root, '[data-component="ActionList.Description"]')).toBe(true)
    expect(isIgnored(root, '[data-component="Label"]')).toBe(false)
    expect(isIgnored(root, '[data-component="Dialog.Title"]')).toBe(false)
  })

  it('支持的语言列表被忽略，计划名、计划描述、标题与“提供免费试用”标签照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div data-testid="languages"><div><h2>Supported languages</h2><span data-component="CounterLabel">3</span></div>',
      '<span>JavaScript, Ruby, and Go</span></div>',
      '<div data-testid="plans-radio-group">',
      '<div><label for="plan-1" class="text-bold">Open Source </label><span id="plan-1-description">Free</span></div>',
      '<div><label for="plan-2" class="text-bold">Umbrella <span data-component="Label">Free trial available</span></label></div>',
      '</div>',
      '<form><label for="quantity">Number of users</label></form>'
    ].join('')
    expect(isIgnored(root, '[data-testid="languages"] > span')).toBe(true)
    expect(isIgnored(root, 'h2')).toBe(false)
    expect(isIgnored(root, '[data-component="CounterLabel"]')).toBe(false)
    expect(isIgnored(root, '#plan-1-description')).toBe(false)
    expect(isIgnored(root, 'label[for="plan-1"]')).toBe(false)
    expect(isIgnored(root, 'label[for="plan-2"]')).toBe(false)
    expect(isIgnored(root, 'label[for="plan-2"] [data-component="Label"]')).toBe(false)
    expect(isIgnored(root, 'label[for="quantity"]')).toBe(false)
  })

  it('应用页侧栏的开发人员帐户名与应用名被忽略，其余链接与说明照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div class="Layout-sidebar"><p class="text-mono">Developer</p>',
      '<ul class="list-style-none"><li><img class="avatar avatar-user" alt="@octo-org"> <a href="/octo-org">octo-org</a></li>',
      '<li><a href="https://example.com">Website</a></li></ul>',
      '<p class="text-small"><strong>Codecov</strong> is provided by a third-party.</p>',
      '<a href="/contact/report-abuse">Report abuse</a></div>'
    ].join('')
    expect(isIgnored(root, 'a[href="/octo-org"]')).toBe(true)
    expect(isIgnored(root, 'strong')).toBe(true)
    expect(isIgnored(root, 'p.text-mono')).toBe(false)
    expect(isIgnored(root, 'p.text-small')).toBe(false)
    expect(isIgnored(root, 'a[href="https://example.com"]')).toBe(false)
    expect(isIgnored(root, 'a[href="/contact/report-abuse"]')).toBe(false)
  })
})

describe('marketplace 计划卡片（真实结构）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 一张计划卡片：结构同应用页「Pricing and setup」，计划名后接 React 注释与空白，可带“Free trial available”标签 */
  function planCard(id: string, name: string, description: string, price: string, trial = false): string {
    const label = trial
      ? '<span class="ml-1" data-size="small" data-variant="default" data-component="Label">Free trial available</span>'
      : ''
    return [
      `<div data-component="Stack"><input type="radio" id="${id}" name="plan" value="${id}" aria-describedby="${id}-description">`,
      '<div data-component="Stack" class="width-full"><div data-component="Stack"><div data-component="Stack" class="width-full">',
      `<div data-component="Stack" class="width-full"><label for="${id}" class="text-bold">${name}<!-- --> ${label}</label>`,
      `<span class="color-fg-muted mt-1" data-component="Text" data-size="small" id="${id}-description">${description}</span></div>`,
      `<span class="color-fg-muted flex-shrink-0" data-testid="plan-price-info"><span>${price}</span></span>`,
      '</div></div></div></div>'
    ].join('')
  }

  it('常见计划名照译，自定义计划名保留原文；计划描述有词条时翻译，“提供免费试用”标签照常翻译', () => {
    document.body.innerHTML = [
      '<div data-testid="plans-radio-group" data-component="Stack">',
      planCard('plan-1', 'Open Source', 'Unlimited public repositories', '$0'),
      planCard('plan-2', 'Umbrella', 'Sample text', '$10', true),
      // 描述是发布者填写的，按用户要求不忽略：与全局词条同形时照词条翻译（Free → 免费版）
      planCard('plan-3', 'Pro', 'Free', '$20'),
      planCard('plan-4', 'Open source', 'Sample text', '$0', true),
      '</div>'
    ].join('')
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'marketplace'] })
    translator.start()
    const name = (id: string): string | undefined => document.querySelector(`label[for="${id}"]`)?.firstChild?.textContent ?? undefined
    expect(name('plan-1')).toBe('开源')
    expect(name('plan-2')).toBe('Umbrella')
    expect(name('plan-3')).toBe('专业版')
    expect(name('plan-4')).toBe('开源')
    expect(document.querySelector('#plan-1-description')?.textContent).toBe('无限公共存储库')
    expect(document.querySelector('#plan-2-description')?.textContent).toBe('Sample text')
    expect(document.querySelector('#plan-3-description')?.textContent).toBe('免费版')
    expect([...document.querySelectorAll('[data-component="Label"]')].map(label => label.textContent)).toEqual([
      '提供免费试用',
      '提供免费试用'
    ])
    expect(document.querySelector('[data-testid="plan-price-info"]')?.textContent).toBe('$0')
  })
})

describe('marketplace 标点随原文', () => {
  /** [名称, 译文中的标点, 原文中对应的标点]：同一句中译文的个数不得多于原文（只查个数，原文有一处不等于译文可加两处） */
  const PUNCTUATION: readonly (readonly [string, RegExp, RegExp])[] = [
    ['逗号', /[，、]/g, /,/g],
    ['冒号', /：/g, /:/g],
    ['分号', /；/g, /;/g],
    ['引号', /“/g, /["'“‘]/g],
    ['括号', /[（(]/g, /\(/g]
  ]
  const splitSource = (text: string): string[] => text.split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
  const splitTranslation = (text: string): string[] => text.split(/(?<=[。！？])(?=.)/)
  const countOf = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0

  /** 句数相同时逐句比较，否则整段比较；返回译文多出的标点 */
  function extraPunctuation(source: string, translation: string): string[] {
    const sources = splitSource(source)
    const translations = splitTranslation(translation)
    const pairs =
      sources.length === translations.length
        ? sources.map((sentence, index) => [sentence, translations[index] ?? ''] as const)
        : [[source, translation] as const]
    return pairs.flatMap(([sentence, translated]) =>
      PUNCTUATION.filter(([, mark, pattern]) => countOf(translated, mark) > countOf(sentence, pattern)).map(
        ([name]) => `${name} ${sentence} → ${translated}`
      )
    )
  }

  it('守护自身：多出的逗号、句间合并的逗号会被查出', () => {
    expect(extraPunctuation('A, which runs while B.', '甲，运行，同时乙。')).toHaveLength(1)
    expect(extraPunctuation('A is a tool. It supports B, C.', '甲是工具，支持乙、丙。')).toHaveLength(1)
    expect(extraPunctuation('A is a tool. It supports B, C.', '甲是工具。支持乙、丙。')).toEqual([])
  })

  /** 开发人员协议正文是法律长文，按中文法律文书断句、加标点（见 marketplace/agreement.ts），不在此查 */
  const isAgreement = (source: string): boolean => Object.hasOwn(agreement.scoped, source)
  const uiEntries = (): [string, string][] =>
    [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})].filter(([source]) => !isAgreement(source))

  it('静态与页面词条不加原文没有的逗号、顿号、冒号、分号、引号、括号', () => {
    const entries = uiEntries()
    expect(entries.flatMap(([source, translation]) => extraPunctuation(source, translation))).toEqual([])
  })

  /** 原文句数：句末标点后接空白和大写字母处断句，编号标题（1. Publisher）、单字母缩写（P.O. Box）不算 */
  const sourceSentences = (text: string): number => text.split(/(?<=(?:[A-Za-z]{2}|[)'’"”])[.!?])\s+(?=[A-Z"'(“‘])/).length

  it('不把原文的几句合成一句（合并处的逗号是原文没有的）', () => {
    expect(sourceSentences('Sorry, we couldn’t find it. Here’s the latest version.')).toBe(2)
    expect(sourceSentences('1. Publisher')).toBe(1)
    expect(sourceSentences('Individual traders can use a P.O. Box.')).toBe(1)
    const entries = uiEntries()
    expect(entries.filter(([source, translation]) => splitTranslation(translation).length < sourceSentences(source))).toEqual([])
  })

  it('正则译文同样不加', () => {
    expect(HITS.flatMap(([source, translation]) => extraPunctuation(source, translation))).toEqual([])
  })
})

describe('marketplace 新建计划（真实结构）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('价格标签按片段译出，预览的适用对象整句译出，单位名保留原文', () => {
    document.body.innerHTML = [
      '<form><dl><dt><label for="price">Price <span class="js-unit">per unit </span>/ month</label></dt>',
      '<dd><div><span>$</span><input id="price" type="number" value="0"><span class="suffix"><span>per unit </span>/ month</span></div>',
      '<p class="note">Must be a whole dollar amount</p></dd></dl>',
      '<p class="for"><svg aria-hidden="true"></svg> For <span>\n personal accounts and organizations\n </span></p>',
      // 切换适用对象后脚本改写的文字不带空白
      '<p class="for-js"><svg aria-hidden="true"></svg> For <span>organizations only</span></p>',
      '<div class="qty"><input disabled type="number" value="1"><span>seat</span>(s) in this plan</div></form>'
    ].join('')
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'marketplace'] })
    translator.start()
    const text = (selector: string): string => (document.querySelector(selector)?.textContent ?? '').replace(/\s+/g, ' ').trim()
    expect(text('label')).toBe('价格 每单位 / 月')
    expect(text('.suffix')).toBe('每单位 / 月')
    expect(text('.note')).toBe('须为整数美元金额')
    expect(text('.for')).toBe('适用于个人帐户和组织')
    expect(text('.for-js')).toBe('仅限组织')
    expect(text('.qty')).toBe('seat（此计划内）')
  })

  it('计划升级 URL 说明：链接与占位符代码按槽位译出', () => {
    document.body.innerHTML =
      '<p class="upgrade">The <a href="#">upgrade URL</a> for this plan, where the customer’s account ID from the API replaces <code>CUSTOMER_ACCOUNT_ID</code>, is:</p>'
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'marketplace'] })
    translator.start()
    const paragraph = document.querySelector('.upgrade')!
    expect(paragraph.querySelector('a')?.textContent).toBe('升级 URL')
    expect(paragraph.querySelector('code')?.textContent).toBe('CUSTOMER_ACCOUNT_ID')
    expect(paragraph.textContent).toBe('此计划的升级 URL 如下，其中 CUSTOMER_ACCOUNT_ID 会替换为 API 中的客户帐户 ID：')
  })
})

describe('marketplace 开发人员协议弹窗（真实结构）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function start(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'marketplace'] })
    translator.start()
  }

  const text = (selector: string): string => (document.querySelector(selector)?.textContent ?? '').replace(/\s+/g, ' ').trim()

  it('上架项编辑页的协议弹窗正文译出：标题、含链接的段落、编号写法不同的列表项', () => {
    start(`
      <details class="details-reset details-overlay">
        <summary>GitHub Marketplace Developer Agreement</summary>
        <details-dialog class="Box Box--overlay d-flex flex-column">
          <div class="Box-body markdown-body overflow-auto">
            <h2 class="heading">1. DEFINITIONS</h2>
            <p class="terms">Capitalized terms utilized in this Agreement and not defined shall otherwise have the meaning provided in the GitHub Terms of Service located at <a href="https://docs.github.com/articles/github-terms-of-service">https://docs.github.com/articles/github-terms-of-service</a>. Those Terms of Service are referred to as the “Terms” or “ToS”.</p>
            <ol><li class="item">ii. Notify users when they are interacting with generative AI content;</li></ol>
            <p class="purpose"><strong>b. Purpose Limitation.</strong></p>
          </div>
        </details-dialog>
      </details>`)
    expect(text('.heading')).toBe('1. 定义')
    expect(text('.terms')).toBe(
      '本协议中使用但未另行定义的大写术语，其含义以位于 https://docs.github.com/articles/github-terms-of-service 的 GitHub 服务条款为准。该服务条款简称“条款”或“ToS”。'
    )
    expect(text('.item')).toBe('ii. 在用户与生成式 AI 内容交互时通知用户；')
    expect(text('.purpose')).toBe('b. 目的限制。')
  })

  it('订单页的市场服务条款弹窗保留原文，所在的同意条款整句照常翻译', () => {
    start(`
      <div class="js-marketplace-form-wrapper">
        <div class="text-small color-fg-muted text-center mb-0 lh-condensed">
          By clicking "Issue plan changes and begin installation", you are agreeing to
          Render’s <a class="Link--inTextBlock" href="https://render.com/terms">Terms of Service</a> and
          the <a class="Link--inTextBlock" href="https://render.com/privacy">Privacy Policy</a>.

          You previously agreed to the

          <details class="details-reset details-overlay details-overlay-dark lh-default color-fg-default d-inline-block text-left">
            <summary class="btn-link ws-normal" role="button">
              Marketplace Terms of Service.
            </summary>
            <details-dialog aria-label="GitHub Marketplace Terms of Service v1.11" class="Box Box--overlay d-flex flex-column" role="dialog" aria-modal="true">
              <div class="Box-header"><h3 class="Box-title">GitHub Marketplace Terms of Service v1.11</h3></div>
              <div class="Box-body markdown-body overflow-auto"><h2 class="tos">1. DEFINITIONS</h2></div>
            </details-dialog>
          </details>
        </div>
      </div>`)
    expect(text('.tos')).toBe('1. DEFINITIONS')
    expect(text('.text-small > details > summary')).toBe('市场服务条款。')
    // 弹窗不显示、summary 为块级（首尾空白不显示）：按页面所见拼接
    const host = document.querySelector('.text-small')!
    const shown = [...host.childNodes]
      .map(node => (node instanceof HTMLDetailsElement ? (node.querySelector('summary')?.textContent ?? '').trim() : node.textContent))
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
    expect(shown).toBe('单击“提交计划变更并开始安装”即表示你同意 Render 的服务条款和隐私政策。你之前已同意市场服务条款。')
  })

  it('非协议正文不被末条正则误译', () => {
    expect(() => agreementText('Lorem ipsum dolor sit amet')).toThrow()
    expect(translate('Lorem ipsum dolor sit amet')).toBeUndefined()
  })
})

describe('marketplace-hook 上架项 Web 钩子页', () => {
  const HOOK_PAGES: PageKey[] = ['common', 'marketplace', 'marketplace-hook']
  const hookMatcher = createMatcher([
    ['marketplace', marketplace],
    ['marketplace-hook', marketplaceHook]
  ])
  const twHookMatcher = createMatcher([
    ['marketplace', marketplaceTW],
    ['marketplace-hook', marketplaceHookTW]
  ])
  const appsMatcher = createMatcher([['settings', developerApps]])

  it.each([
    ['Recent Deliveries', '最近请求', '最近傳遞'],
    ['Redeliver', '重新请求', '重新傳遞'],
    ['Request', '请求', '請求'],
    ['Response', '响应', '回應'],
    ['Completed in 0.09 seconds.', '耗时 0.09 秒。', '耗時 0.09 秒。'],
    ['Completed in 1 second', '耗时 1 秒', '耗時 1 秒'],
    [
      "Sorry, something went wrong and we weren't able to fetch this delivery's details.",
      '出错了，无法获取此请求的详细信息。',
      '發生錯誤，無法取得此傳遞的詳細資料。'
    ]
  ])('%s → %s / %s', (input, cn, tw) => {
    expect(hookMatcher.translate(input, HOOK_PAGES)).toBe(cn)
    expect(twHookMatcher.translate(input, HOOK_PAGES)).toBe(tw)
  })

  it.each(['Headers', 'Payload', 'Body'])('请求详情的区块名照原文：%s', input => {
    expect(hookMatcher.translate(input, HOOK_PAGES)).toBeUndefined()
    expect(twHookMatcher.translate(input, HOOK_PAGES)).toBeUndefined()
    expect(appsMatcher.translate(input, ['common', 'settings'])).toBeUndefined()
  })

  it.each(['Recent Deliveries', 'Recent deliveries', 'Redeliver', 'Response'])('请求记录与 GitHub 应用设置页同译：%s', input => {
    expect(hookMatcher.translate(input, HOOK_PAGES)).toBe(appsMatcher.translate(input, ['common', 'settings']))
  })

  it('不在其他市场页面生效：Request 仍作“申请”，耗时不译', () => {
    expect(hookMatcher.translate('Request', ['common', 'marketplace'])).toBe('申请')
    expect(hookMatcher.translate('Completed in 0.09 seconds.', ['common', 'marketplace'])).toBeUndefined()
  })
})
