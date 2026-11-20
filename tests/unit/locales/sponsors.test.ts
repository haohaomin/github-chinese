import { describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { translateTitleText } from '../../../src/core/title'
import type { PageDictionary } from '../../../src/core/types'
import sponsors from '../../../src/locales/zh-CN/sponsors'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = sponsors

const matcher = createMatcher([['sponsors', sponsors]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'sponsors'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 赞助页：标题与按钮
  {
    // 产品名译中文（用户决定 2026-10-27）：GitHub Sponsors → GitHub 赞助
    hits: [['Sponsor @octocat on GitHub Sponsors', '通过 GitHub 赞助来赞助 @octocat']],
    misses: ['Sponsor octocat on GitHub']
  },
  {
    hits: [
      ['Sponsor @octocat', '赞助 @octocat'],
      ['Sponsor @octo-org', '赞助 @octo-org']
    ],
    misses: ['Sponsor @']
  },
  {
    hits: [
      ['Sponsor octocat', '赞助 octocat'],
      ['Sponsor octo-org', '赞助 octo-org']
    ],
    misses: ['Sponsor goals', 'Sponsor badge']
  },
  { hits: [['You must be logged in to sponsor octocat', '登录后才能赞助 octocat']], misses: ['You must be logged in'] },
  {
    hits: [
      ['You are previewing octo-org’s GitHub Sponsors profile.', '你正在预览 octo-org 的 GitHub 赞助个人资料。'],
      ["You are previewing octo-org's GitHub Sponsors profile.", '你正在预览 octo-org 的 GitHub 赞助个人资料。']
    ],
    misses: ['You are previewing the GitHub Sponsors profile.']
  },
  { hits: [['Edit octo-org’s profile.', '编辑 octo-org 的个人资料。']], misses: ['Edit profile.'] },

  // 赞助目标
  {
    hits: [
      ["@octocat's goal is to", '@octocat 的目标是'],
      ['octo-org’s goal is to', 'octo-org 的目标是']
    ],
    misses: ['The goal is to']
  },
  {
    hits: [
      ['earn $12,000 per month', '每月获得 $12,000'],
      ['earn $500.50 per month', '每月获得 $500.50']
    ],
    misses: ['earn money per month']
  },
  {
    hits: [
      ['have 100 monthly sponsors', '拥有 100 个每月赞助者'],
      ['have 1 monthly sponsor', '拥有 1 个每月赞助者']
    ],
    misses: ['have monthly sponsors']
  },
  { hits: [['$12,000 per month', '每月 $12,000']], misses: ['per month'] },
  { hits: [['100 monthly sponsors', '100 个每月赞助者']], misses: ['monthly sponsors'] },
  { hits: [['42% towards goal', '已完成目标的 42%']], misses: ['towards goal'] },
  {
    hits: [
      ['1% towards $12,000 per month goal', '已完成每月 $12,000 目标的 1%'],
      ['50% towards 100 monthly sponsors goal', '已完成 100 个每月赞助者目标的 50%'],
      // 未识别的目标保留原文，与中文之间补空格
      ['5% towards a new laptop goal', '已完成 a new laptop 目标的 5%']
    ],
    misses: ['towards $12,000 per month goal']
  },
  {
    hits: [
      ['and 39 others sponsor this goal', '及其他 39 个赞助者支持此目标'],
      ['and 1 other sponsors this goal', '及其他 1 个赞助者支持此目标']
    ],
    misses: ['and others sponsor this goal']
  },

  // 等级与金额
  {
    hits: [
      ['$5 a month', '每月 $5'],
      ['$1,000 a month', '每月 $1,000']
    ],
    misses: ['5 a month']
  },
  { hits: [['$10 one time', '一次性 $10']], misses: ['$10 two times'] },
  { hits: [['Amount must be at least $1', '金额至少为 $1']], misses: ['Amount must be at least one dollar'] },
  {
    hits: [['Amount exceeds maximum tier amount of $12,000', '金额超过等级上限 $12,000']],
    misses: ['Amount exceeds maximum tier amount']
  },
  {
    hits: [
      [
        "You'll receive any rewards listed in the $10 monthly tier. Additionally, a Public Sponsor achievement will be added to your profile.",
        '你将获得每月 $10 等级列出的全部回报。此外，你的个人资料将获得 Public Sponsor 成就。'
      ],
      [
        'You’ll receive any rewards listed in the $1,000 one-time tier. Additionally, a Public Sponsor achievement will be added to your profile.',
        '你将获得一次性 $1,000 等级列出的全部回报。此外，你的个人资料将获得 Public Sponsor 成就。'
      ],
      // 脚本拼出的金额不带千分位
      [
        "You'll receive any rewards listed in the $1000 monthly tier. Additionally, a Public Sponsor achievement will be added to your profile.",
        '你将获得每月 $1000 等级列出的全部回报。此外，你的个人资料将获得 Public Sponsor 成就。'
      ]
    ],
    misses: [
      "You'll receive any rewards listed in the monthly tier. Additionally, a Public Sponsor achievement will be added to your profile.",
      "You'll receive any rewards listed in the $10 yearly tier. Additionally, a Public Sponsor achievement will be added to your profile.",
      "You'll receive any rewards listed in the $10 monthly tier.",
      "You'll receive any rewards listed in the $10 monthly tier. Additionally, a Public Sponsor achievement will be added to your profile. Thanks!"
    ]
  },
  { hits: [['Receive email updates from octocat', '接收 octocat 的电子邮件动态']], misses: ['Receive email updates'] },
  { hits: [["octo-org's a sponsor.", 'octo-org 是赞助者。']], misses: ['a sponsor.', "octo-org's a sponsor"] },
  {
    hits: [
      ['$5 a month tier', '每月 $5 等级'],
      ['$1,000 one time tier', '一次性 $1,000 等级']
    ],
    misses: ['$5 tier', 'a month tier']
  },
  {
    hits: [['Save $0.03 in fees when you switch to', '如需节省 $0.03 费用可切换到']],
    misses: ['Save in fees when you switch to']
  },

  // 探索页
  {
    hits: [['25 sponsored developers and organizations loaded.', '已加载 25 个被赞助的开发者和组织。']],
    misses: ['sponsored developers and organizations loaded.']
  },
  { hits: [['Explore as: octocat', '探索身份：octocat']], misses: ['Explore as octocat'] },
  {
    hits: [
      ['Ecosystems: All ecosystems', '生态系统：全部生态系统'],
      ['Ecosystems: 2 ecosystems', '生态系统：2 个生态系统'],
      ['Ecosystems: npm', '生态系统：npm']
    ],
    misses: ['Ecosystems npm']
  },
  {
    hits: [
      ['2 ecosystems', '2 个生态系统'],
      ['1 ecosystem', '1 个生态系统']
    ],
    misses: ['ecosystems']
  },
  {
    hits: [
      ['Order by: Most used', '排序依据：使用最多'],
      ['Order by: Newest Sponsors profile', '排序依据：赞助个人资料最新'],
      ['Order by: Custom', '排序依据：Custom']
    ],
    misses: ['Order by Most used']
  },
  {
    hits: [
      [
        'octo-org does not directly depend on any repositories whose maintainers can be sponsored.',
        'octo-org 没有直接依赖任何维护者可赞助的存储库。'
      ]
    ],
    misses: ['does not directly depend on any repositories']
  },
  {
    hits: [
      [
        'does not directly depend on any repositories in the Cargo ecosystem whose maintainers can be sponsored.',
        '没有直接依赖 Cargo 生态系统中任何维护者可赞助的存储库。'
      ],
      [
        'octo-org does not directly depend on any repositories in the npm ecosystem whose maintainers can be sponsored.',
        'octo-org 没有直接依赖 npm 生态系统中任何维护者可赞助的存储库。'
      ],
      [
        "You don't directly depend on any repositories in the pip ecosystem whose maintainers can be sponsored.",
        '你没有直接依赖 pip 生态系统中任何维护者可赞助的存储库。'
      ]
    ],
    misses: ['does not directly depend on any repositories in the ecosystem']
  },
  {
    hits: [
      ['12 repositories they own or maintain', '他们拥有或维护的 12 个存储库'],
      ['1 repository they own or maintain', '他们拥有或维护的 1 个存储库']
    ],
    misses: ['repositories they own or maintain']
  },
  {
    hits: [
      ['others sponsor, including 3 organizations', '个其他赞助者，包括 3 个组织'],
      ['other sponsor, including 1 organization', '个其他赞助者，包括 1 个组织']
    ],
    misses: ['others sponsor, including organizations']
  },
  { hits: [['Want to sponsor on behalf of octo-org?', '想代表 octo-org 赞助吗？']], misses: ['Want to sponsor?'] },
  {
    hits: [
      ['depend on 12 repositories', '依赖的 12 个存储库由'],
      ['depend on 1 repository', '依赖的 1 个存储库由']
    ],
    misses: ['depend on repositories']
  },
  { hits: [['depends on 5 repositories', '依赖的 5 个存储库由']], misses: ['depends on repositories'] },
  {
    hits: [
      ['12 repositories', '12 个存储库'],
      ['1 repository', '1 个存储库']
    ],
    misses: ['repositories']
  },
  {
    hits: [
      ['12 members', '12 个成员'],
      ['1 member', '1 个成员']
    ],
    misses: ['members']
  },
  {
    hits: [
      ['3 of your repositories depend on this', '你有 3 个存储库依赖于此'],
      ['1 of your repositories depends on this', '你有 1 个存储库依赖于此']
    ],
    misses: ['of your repositories depend on this']
  },
  { hits: [['+3 more', '另有 3 个']], misses: ['+ more'] },
  {
    hits: [
      ['Sponsor 5 maintainers', '赞助 5 个维护者'],
      ['Sponsor 1 maintainer', '赞助 1 个维护者']
    ],
    misses: ['Sponsor maintainers now']
  },

  // 仪表板：收件人选择
  {
    hits: [
      ['Filter: All sponsors (12 sponsors)', '筛选器：全部赞助者（12 个）'],
      ['Filter: select filter', '筛选器：选择筛选器'],
      ['Filter: [retired] $5 a month (1 sponsor)', '筛选器：[已停用] 每月 $5（1 个）']
    ],
    misses: ['Filter:']
  },
  {
    hits: [
      ['Send email to All sponsors (12 sponsors)', '发送电子邮件给全部赞助者（12 个）'],
      ['Send email to One-time sponsors (2 sponsors)', '发送电子邮件给一次性赞助者（2 个）'],
      // 未识别的名称保留原文，与中文前缀之间补空格
      ['Send email to Backers (2 sponsors)', '发送电子邮件给 Backers（2 个）']
    ],
    misses: ['Send email']
  },
  {
    hits: [
      ['All sponsors (12 sponsors)', '全部赞助者（12 个）'],
      ['$5 a month (3 sponsors)', '每月 $5（3 个）'],
      ['[retired] $10 one time (1 sponsor)', '[已停用] 一次性 $10（1 个）'],
      ['Recurring sponsors (4 sponsors)', '定期赞助者（4 个）'],
      // 分号随原文
      ['$5 a month; $10 a month (3 sponsors)', '每月 $5；每月 $10（3 个）']
    ],
    misses: ['All sponsors']
  },
  {
    hits: [
      // 省略号随原文
      ['Advanced move octocat...', '高级移动 octocat...'],
      ['Advanced move octocat…', '高级移动 octocat…']
    ],
    misses: ['Advanced move']
  },
  {
    hits: [
      ['3 remaining', '剩余 3 个'],
      ['0 remaining', '剩余 0 个']
    ],
    misses: ['remaining', '3 remaining sponsors']
  },

  // 候补名单
  {
    hits: [['GitHub Sponsors is now out of beta for 103 regions!', 'GitHub 赞助已在 103 个地区结束测试！']],
    misses: ['GitHub Sponsors is now out of beta!']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('sponsors 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = sponsors.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Filter: ', 'All sponsors (12 sponsors)'].join('')))).toBe('筛选器：全部赞助者（12 个）')
    expect(translate(normalizeText([' depends on ', '5', ' repositories'].join('')))).toBe('依赖的 5 个存储库由')
    expect(translate(normalizeText(['+', '3', ' more'].join('')))).toBe('另有 3 个')
  })

  it('赞助目标进度的片段译文，按原文空白拼读', () => {
    expect(['1%', 'towards', '$12,000 per month', 'goal'].map(text => translate(text) ?? text).join(' ')).toBe('1% / 每月 $12,000 目标')
  })

  it('自定义金额提示：脚本按「前缀 + 空格 + $金额 + 空格 + 后缀」拼接，规范化后命中', () => {
    const prefix = "You'll receive any rewards listed in the "
    const suffix = 'one-time tier. Additionally, a Public Sponsor achievement will be added to your profile.'
    expect(translate(normalizeText(`${prefix} $1000 ${suffix}`))).toBe(
      '你将获得一次性 $1000 等级列出的全部回报。此外，你的个人资料将获得 Public Sponsor 成就。'
    )
  })
})

describe('sponsors 静态词条', () => {
  it.each([
    ['Explore GitHub Sponsors', '探索 GitHub 赞助'],
    ['Fund the work of developers and projects you depend on.', '资助你所依赖的开发者和项目。'],
    ['Sponsored developers and organizations', '被赞助的开发者和组织'],
    ['Become a sponsor to', '赞助'],
    ['You are previewing your GitHub Sponsors profile.', '你正在预览自己的 GitHub 赞助个人资料。'],
    ['Current sponsors', '当前赞助者'],
    ['Meet the team', '团队成员'],
    ['Featured work', '精选作品'],
    ['Select a tier', '选择等级'],
    ['Choose a custom amount', '自定义金额'],
    ['Choose a custom amount.', '选择自定义金额。'],
    ['A Public Sponsor achievement will be added to your profile.', '你的个人资料将获得 Public Sponsor 成就。'],
    ['Be the first to sponsor this goal!', '成为首位支持此目标的赞助者！'],
    ['Sponsor as', '赞助身份'],
    ['Your sponsorships', '你的赞助'],
    ['Switch to invoiced billing', '切换到开票计费'],
    ['Learn about invoiced billing', '了解开票计费'],
    ['Sponsor tiers', '赞助等级'],
    ['Monthly tiers', '每月等级'],
    ['Sponsor dashboard', '赞助仪表板'],
    ['Sponsors dashboard', '赞助仪表板'],
    ['Profile details', '个人资料详细信息'],
    ['Update Patreon preferences', '更新 Patreon 首选项'],
    // link → 链接、Unlink → 取消链接（官方界面名）
    ['Link Patreon account', '链接 Patreon 帐户'],
    ['Unlink Patreon account', '取消链接 Patreon 帐户'],
    ['Grant sponsors access to a private repository', '授予赞助者访问专用存储库的权限'],
    ['and start receiving funding.', '并开始接受资助。'],
    ['Payouts', '付款'],
    ['Disable GitHub Sponsors account', '禁用 GitHub 赞助帐户'],
    ['Get sponsored', '获得赞助'],
    ['Sponsorable dependencies', '可赞助的依赖'],
    ['Direct dependencies only', '仅直接依赖'],
    ['Bank account', '银行帐户'],
    ['Fiscal host project profile URL', '财务托管方项目个人资料 URL'],
    ['Frequently Asked Questions', '常见问题'],
    ['Support the developers who power open source', '支持驱动开源的开发者'],
    // 标点随原文：原文无标点或结尾无标点的片段；三句各自成句，不加原文没有的逗号
    [
      'The organization billing email where we will contact you about your GitHub Sponsors profile. This will not be shared publicly. Change it in the',
      '我们将通过此组织计费电子邮件就你的 GitHub 赞助个人资料与你联系。该地址不会公开。可在以下位置更改'
    ],
    [
      'Select a verified email address for us to contact you about your GitHub Sponsors profile. This will not be shared publicly. You can manage verified email addresses in your',
      '选择一个已验证的电子邮件地址供我们就你的 GitHub 赞助个人资料与你联系。该地址不会公开。可在以下位置管理已验证的电子邮件地址'
    ],
    ['You can manage verified email addresses in your', '可在以下位置管理已验证的电子邮件地址'],
    ['organization profile page', '组织个人资料页面'],
    ['Or export a list of your dependencies on', '或在以下位置导出依赖项列表'],
    ['Sign in and start by navigating to', '登录后前往'],
    ['trending repositories', '趋势存储库'],
    // 「GitHub Sponsors profile」各处统一作「GitHub 赞助个人资料」（申请页标题片段与联系电子邮件说明同屏）
    ['GitHub Sponsors profile', 'GitHub 赞助个人资料'],
    ['This GitHub Sponsors profile is waiting to be reviewed by GitHub.', '此 GitHub 赞助个人资料正在等待 GitHub 审查。'],
    // 原文不带 GitHub 前缀的产品名 Sponsors → 赞助（Sponsors profile → 赞助个人资料），不补“GitHub”
    ['Explore Sponsors', '探索赞助'],
    ['or sign up to be notified when Sponsors supports your region.', '的帐户或注册以便在赞助支持你所在地区时收到通知。'],
    ['Talk to your organization about GitHub Sponsors', '与组织讨论 GitHub 赞助'],
    ['GitHub Sponsors eligible accounts', '符合 GitHub 赞助条件的帐户'],
    ['Learn more about tax information for GitHub Sponsors', '了解 GitHub 赞助的税务信息'],
    ['Edit your profile.', '编辑个人资料。'],
    // profile → 个人资料
    ['Unpublish profile', '取消发布个人资料'],
    ['Please include a link to your profile on your fiscal host’s site, if available.', '如有，请附上你在财务托管方网站上的个人资料链接。'],
    [
      'We only show dependencies that have an active sponsors profile. We use files in your repositories like package-lock.json and requirements.txt to find your dependencies. We check their maintainer status by seeing if they’re listed in a repository’s funding file.',
      '只显示拥有有效赞助个人资料的依赖。我们通过存储库中的 package-lock.json 和 requirements.txt 等文件查找依赖。我们通过检查维护者是否列在存储库的资助文件中确认其身份。'
    ],
    // email → 电子邮件；申请的 review → 审查
    ['Email updates to your sponsors', '通过电子邮件向赞助者发送动态'],
    ['Send email to', '发送电子邮件给'],
    ['Receive email updates from the maintainers you’re sponsoring', '接收所赞助维护者的电子邮件动态'],
    [', you will get an email from us when your application has been reviewed.', '，申请经审查后我们会给你发送电子邮件。'],
    // 原文只有一个逗号，译文不加冒号、不加第二个逗号
    [
      'Note that we do our best to help you with the Sponsors program, but we’re unable to provide tax guidance.',
      '请注意我们会尽力协助你参与赞助计划，但无法提供税务指导。'
    ],
    [
      'Yes. Your tax information must be on file in order for GitHub to make payments to your bank account. The required tax documents may vary based on your location.',
      '需要。GitHub 须存有你的税务信息才能向你的银行帐户付款。所需税务文件因所在地而异。'
    ],
    ['Invest in open source. It powers your world.', '投资开源。它驱动着你的世界。'],
    // 原文的逗号在两个形容词之间，译文作顿号，不在分句间另加逗号
    [
      'Everyone should be able to contribute to open source. Making open source a viable, financially rewarding career path helps contribute to our digital infrastructure. More funding, more projects, more software to power our world.',
      '每个人都应能为开源做贡献。让开源成为可行、有经济回报的职业道路有助于建设我们的数字基础设施。更多资金，更多项目，更多驱动世界的软件。'
    ],
    [
      'Use another bank account where GitHub Sponsors is available or complete signup to receive a notification if your region becomes available.',
      '使用 GitHub 赞助可用地区的其他银行帐户或完成注册以便在你所在地区可用时收到通知。'
    ],
    ['Hover over your avatar to review the badge you’ll get that shows', '将鼠标悬停在头像上可预览你将获得的徽章并看到它表明']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('email 作“电子邮件”，profile 作“个人资料”，“审核”只用于审核日志', () => {
    const values = [...Object.values(dict.static ?? {}), ...Object.values(dict.scoped ?? {})]
    expect(values.filter(value => /(?<!电子)邮件|(?<!个人)资料|审核(?!日志)/.test(value))).toEqual([])
  })

  it('产品名译中文：译文里不再出现英文 Sponsors、Beta（成就名 Public Sponsor、品牌 Stripe Connect 除外）', () => {
    const values = [...Object.values(dict.static ?? {}), ...Object.values(dict.scoped ?? {})]
    expect(values.filter(value => /Sponsors|\bBeta\b/.test(value))).toEqual([])
  })

  it('译文的“GitHub 赞助”只对应原文的 GitHub Sponsors，单独的 Sponsors 作“赞助”', () => {
    const count = (text: string, part: string): number => text.split(part).length - 1
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    expect(entries.filter(([source, translation]) => count(translation, 'GitHub 赞助') > count(source, 'GitHub Sponsors'))).toEqual([])
  })
})

describe('sponsors 标签页标题', () => {
  it.each([
    ['GitHub Sponsors · GitHub', 'GitHub 赞助 · GitHub'],
    ['Explore GitHub Sponsors · GitHub', '探索 GitHub 赞助 · GitHub'],
    ['Sponsor @octocat on GitHub Sponsors · GitHub', '通过 GitHub 赞助来赞助 @octocat · GitHub']
  ])('%s → %s', (title, expected) => {
    expect(translateTitleText(title, translate)).toBe(expected)
  })
})

describe('sponsors 页面词条', () => {
  it.each([
    ['towards', '/'],
    ['goal', '目标'],
    ['a month', '每月'],
    ['one time', '一次性'],
    ['Monthly', '每月'],
    ['One-time', '一次性'],
    ['Tiers', '等级'],
    ['Goals', '目标'],
    ['Updates', '动态'],
    // 筛选菜单标题，与 search、org-settings 的同名词条一致
    ['Filter by', '筛选条件'],
    ['Add or remove', '添加或删除'],
    ['others sponsor', '个其他赞助者'],
    ['Disable account', '禁用帐户'],
    ['Link account', '链接帐户'],
    ['Linked account', '链接的帐户'],
    ['or may be in', '或可能处于'],
    // 句中的 beta 作“测试阶段”，不留英文
    ['beta', '测试阶段'],
    ['e.g.,', '例如'],
    ['email settings', '电子邮件设置'],
    ['Update profile', '更新个人资料'],
    // 赞助帐户页的申请状态
    ['Pending', '待审查'],
    ['Get email updates', '获取电子邮件动态'],
    ['Change email updates', '更改电子邮件动态'],
    // 产品名：探索页子导航标签、全局导航菜单项与页面标题里的 GitHub Sponsors；排序选项里不带前缀的 Sponsors profile
    ['GitHub Sponsors', 'GitHub 赞助'],
    ['Newest Sponsors profile', '赞助个人资料最新'],
    ['Oldest Sponsors profile', '赞助个人资料最早']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('页面词条只在 sponsors 页面生效', () => {
    expect(matcher.translate('towards', ['common'])).toBeUndefined()
    expect(matcher.translate('$5 a month', ['common'])).toBeUndefined()
    expect(matcher.translate('or may be in', ['common'])).toBeUndefined()
    expect(matcher.translate('GitHub Sponsors', ['common'])).toBeUndefined()
  })

  it('与全站 static 译文相同的词条不在本页重复收录', () => {
    for (const key of ['Clear filter', 'Select', 'Refresh', 'Apply', 'Update', 'Submit', 'No results']) {
      expect(dict.static?.[key]).toBeUndefined()
      expect(dict.scoped?.[key]).toBeUndefined()
    }
  })

  it('已下线的旧版营销页词条已移除', () => {
    expect(dict.static?.['to open source']).toBeUndefined()
    expect(dict.static?.['Available in 103 regions']).toBeUndefined()
  })

  it('被赞助者名称、简介、项目名与营销数字不收录', () => {
    for (const text of [
      'Mona Lisa Octocat',
      "Support octocat's open source work",
      'Support octocat’s open source work',
      'Support my open-source projects!',
      'hello-world',
      '$40M+',
      '4.2K+'
    ]) {
      expect(translate(text)).toBeUndefined()
    }
  })

  it('营销页推荐项目（运营内容）不收录，赞助按钮由通用正则翻译', () => {
    for (const text of [
      'Comprehensive website security and health monitoring with performance analysis',
      'Intuitive, open-source interface for native GenAI applications',
      'A command line tool and library for transferring data with URL syntax'
    ]) {
      expect(translate(text)).toBeUndefined()
    }
    const sponsorButton = (sponsors.regexp ?? []).find(([pattern]) => pattern.test('Sponsor hello-world'))?.[0]
    expect(sponsorButton).toBeDefined()
    expect(Object.keys(dict.static ?? {}).filter(key => sponsorButton?.test(key))).toEqual([])
    expect(translate('Sponsor hello-world')).toBe('赞助 hello-world')
  })
})

describe('sponsors 忽略选择器', () => {
  it.each(sponsors.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('赞助目标下的首个赞助者名被忽略，其余片段照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<p class="text-small color-fg-muted">',
      '<span class="Truncate"><span class="Truncate-text">Support</span></span>',
      ' and 39 others sponsor this goal',
      '</p>'
    ].join('')
    const selector = (sponsors.ignore ?? []).join(', ')
    expect(root.querySelector('.Truncate-text')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('p')?.closest(selector)).toBeNull()
    expect(translate('and 39 others sponsor this goal')).toBe('及其他 39 个赞助者支持此目标')
  })

  it('探索页卡片的名称与简介被忽略，赞助按钮照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<article class="Box-row d-flex" id="pa-octocat"><div class="d-sm-flex flex-auto">',
      '<div class="col-sm-9 d-md-flex">',
      '<div class="col-md-5"><h2 class="h3 lh-condensed"><a href="/octocat">Mona Lisa Octocat</a></h2></div>',
      '<div class="col-md-7">Building things on GitHub.</div>',
      '</div>',
      '<div class="col-sm-3"><a href="/sponsors/octocat" aria-label="Sponsor @octocat" class="Button">',
      '<span class="v-align-middle">Sponsor</span></a></div>',
      '</div></article>'
    ].join('')
    const selector = (sponsors.ignore ?? []).join(', ')
    expect(root.querySelector('h2 a')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('.col-md-7')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('.Button')?.closest(selector)).toBeNull()
    expect(translate('Sponsor @octocat')).toBe('赞助 @octocat')
  })

  it('精选作品的存储库描述被忽略，标题照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<h4 class="f3-light color-fg-muted">Featured work</h4>',
      '<ol class="d-flex flex-wrap list-style-none"><li class="d-flex col-12"><div class="border rounded-2"><div>',
      '<a class="color-fg-inherit text-bold" href="/octo-org/hello-world">octo-org/hello-world</a>',
      '<p class="color-fg-muted text-small my-1">My first repository on GitHub!</p>',
      '</div></div></li></ol>'
    ].join('')
    const selector = (sponsors.ignore ?? []).join(', ')
    expect(root.querySelector('p')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('h4')?.closest(selector)).toBeNull()
    expect(translate('Featured work')).toBe('精选作品')
  })

  // 以下结构按 GitHub sponsors 脚本使用的类名构造
  it('目标编辑器：类型标签与描述预览被忽略，目标预览照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div class="js-sponsors-goals-radio-target">',
      '<span class="js-sponsors-goals-type-label">Monthly amount you&#39;re aiming for:</span>',
      '<span class="js-sponsors-goal-target-preview">earn $500 per month</span>',
      '<p class="js-sponsors-goal-description-preview">Thank you!</p>',
      '</div>'
    ].join('')
    const selector = (sponsors.ignore ?? []).join(', ')
    expect(root.querySelector('.js-sponsors-goals-type-label')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('.js-sponsors-goal-description-preview')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('.js-sponsors-goal-target-preview')?.closest(selector)).toBeNull()
    expect(translate("Monthly amount you're aiming for:")).toBeUndefined()
    expect(translate('earn $500 per month')).toBe('每月获得 $500')
  })

  it('等级建议的奖励文字被忽略，全选按钮照常处理', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div class="Box-row">',
      '<button type="button" class="js-tier-suggestion-batch-select" data-function="select">Select all</button>',
      '<label><input type="checkbox" class="js-tier-suggestion" data-tier-category="recognition"> Logo on README</label>',
      '</div>'
    ].join('')
    const selector = (sponsors.ignore ?? []).join(', ')
    expect(root.querySelector('label')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('button')?.closest(selector)).toBeNull()
    expect(root.querySelector('.Box-row')?.closest(selector)).toBeNull()
  })
})

describe('sponsors 标点随原文', () => {
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

  it('静态与页面词条不加原文没有的逗号、顿号、冒号、分号、引号、括号', () => {
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    expect(entries.flatMap(([source, translation]) => extraPunctuation(source, translation))).toEqual([])
  })

  /** 原文句数：句末标点后接空白和大写字母处断句 */
  const sourceSentences = (text: string): number => text.split(/(?<=[A-Za-z)'’"”][.!?])\s+(?=[A-Z"'(“‘])/).length

  it('不把原文的几句合成一句（合并处的逗号是原文没有的）', () => {
    expect(sourceSentences('Invest in open source. It powers your world.')).toBe(2)
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    expect(entries.filter(([source, translation]) => splitTranslation(translation).length < sourceSentences(source))).toEqual([])
  })

  it('正则译文同样不加', () => {
    expect(HITS.flatMap(([source, translation]) => extraPunctuation(source, translation))).toEqual([])
  })
})
