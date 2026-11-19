import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import newDictionary from '../../../src/locales/zh-CN/new'
import plansDictionary from '../../../src/locales/zh-CN/new/plans'
import repoSettings from '../../../src/locales/zh-CN/repo-settings'
import settingsPlans from '../../../src/locales/zh-CN/settings-account/plans'

const newPages: PageDictionary = newDictionary
const matcher = createMatcher([['new', newPages]])
/** 含通用词典与 settings-account 的计划词条，与实际页面一致：通用字段、计划比较表的共用说明由它们翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['settings', settingsPlans],
  ['new', newPages]
])
const NEW_SCOPE: readonly PageKey[] = ['common', 'new']
const REPO_SCOPE: readonly PageKey[] = ['common', 'repository']

function translate(text: string, scope: readonly PageKey[] = NEW_SCOPE): string | undefined {
  return matcher.translate(text, scope)
}

function translateFull(text: string): string | undefined {
  return fullMatcher.translate(text, NEW_SCOPE)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 存储库名称可用性
  {
    hits: [
      ['hello-world is available.', 'hello-world 可用。'],
      ['my.repo_1 is available.', 'my.repo_1 可用。']
    ],
    misses: ['hello world is available.', 'hello-world is available']
  },
  {
    hits: [
      ['The repository hello already exists on this account.', '此帐户中已存在存储库 hello。'],
      ['The repository hello already exists on this account', '此帐户中已存在存储库 hello']
    ],
    misses: ['The repository hello already exists on that account.']
  },
  {
    hits: [
      ['Your new repository will be created as my-repo.', '你的新存储库将创建为 my-repo。'],
      ['Your new repository will be created as my-repo', '你的新存储库将创建为 my-repo'],
      ['Your new repository will be created as my.site.', '你的新存储库将创建为 my.site。']
    ],
    misses: ['Your new repository will be created as my repo.']
  },
  {
    hits: [
      ['Great repository names are short and memorable. How about super-chainsaw?', '好的存储库名称简短易记。不妨试试 super-chainsaw？'],
      [
        'Great repository names are short and memorable. Need inspiration? How about automatic-octo-telegram?',
        '好的存储库名称简短易记。需要灵感？不妨试试 automatic-octo-telegram？'
      ]
    ],
    misses: [
      'Great repository names are short and memorable. How about this one?',
      'Great repository names are short and memorable. Need inspiration? How about this one?'
    ]
  },
  {
    hits: [
      ['acme-org, Owner (Required)', 'acme-org，所有者（必填）'],
      ['octocat, Owner (Required)', 'octocat，所有者（必填）']
    ],
    misses: ['octocat, Owner', 'octo cat, Owner (Required)']
  },
  {
    hits: [['Use suggested repository name super-chainsaw', '使用建议的存储库名称 super-chainsaw']],
    misses: ['Use suggested repository name', 'Use suggested repository name my repo']
  },
  {
    hits: [
      ['0/350 characters', '0/350 个字符'],
      ['12 / 350 characters', '12/350 个字符']
    ],
    misses: ['350 characters']
  },
  {
    hits: [
      ['Choose visibility: Public', '选择可见性：公共'],
      ['Choose visibility: Internal', '选择可见性：内部']
    ],
    misses: ['Choose visibility: Secret', 'Choose visibility: public']
  },
  // 可见性与默认分支
  {
    hits: [
      ['You are creating a private repository in the acme organization.', '你正在 acme 组织中创建专用存储库。'],
      ['You are creating an internal repository in the big-co organization.', '你正在 big-co 组织中创建内部存储库。']
    ],
    misses: ['You are creating a private repository in the acme team.', 'You are creating a secret repository in the acme organization.']
  },
  {
    hits: [
      [
        'Octo Corp enterprise members can see this repository. You choose who can commit.',
        'Octo Corp 企业成员可以查看此存储库。你可以选择谁能提交。'
      ]
    ],
    misses: ['Octo Corp members can see this repository. You choose who can commit.']
  },
  {
    hits: [['This will set main as the default branch.', '这会将 main 设为默认分支。']],
    misses: ['This will set main as the base branch.']
  },
  {
    hits: [
      [
        'This will set trunk as the default branch. Change the default name in your settings.',
        '这会将 trunk 设为默认分支。可在你的设置中更改默认名称。'
      ]
    ],
    misses: ['This will set trunk as the default branch. Change it later.']
  },
  // 模板与 GitHub 应用
  {
    hits: [
      ['Copy all branches from octo/template and not just the default branch.', '复制 octo/template 的所有分支，而不仅仅是默认分支。']
    ],
    misses: ['Copy all branches from template and not just the default branch.']
  },
  {
    hits: [
      ['Connect this repository to apps octocat is subscribed to', '将此存储库连接到 octocat 订阅的应用'],
      ['Connect this repository to apps acme is subscribed to.', '将此存储库连接到 acme 订阅的应用。']
    ],
    misses: ['Connect this repository to apps you like']
  },
  {
    hits: [
      ['You are subscribed to 1 Marketplace app', '你订阅了 1 个市场应用'],
      ['You are subscribed to 3 Marketplace apps.', '你订阅了 3 个市场应用。']
    ],
    misses: ['You are subscribed to many Marketplace apps']
  },
  {
    hits: [
      ['1 app selected', '已选择 1 个应用'],
      ['4 apps selected', '已选择 4 个应用']
    ],
    misses: ['No apps selected']
  },
  { hits: [['Auto-installed by acme', '由 acme 自动安装']], misses: ['Auto-installed by the acme org'] },
  // 特殊存储库
  {
    hits: [
      [
        'octocat/octocat is a ✨special✨ repository that you can use to add a README.md to your GitHub profile. Make sure it’s public and initialize it with a README to get started.',
        'octocat/octocat 是一个 ✨特殊✨ 存储库，可用于将 README.md 添加到你的 GitHub 个人资料。请确保它是公共的，并使用自述文件初始化即可开始。'
      ]
    ],
    misses: ['octocat/octocat is a special repository.']
  },
  {
    hits: [
      [
        "acme/.github is a ✨special✨ repository that you can use to add a README.md to your organization's GitHub profile. Make sure it's public and initialize it with a README in the profile directory to get started.",
        'acme/.github 是一个 ✨特殊✨ 存储库，可用于将 README.md 添加到你组织的 GitHub 个人资料。请确保它是公共的，并使用自述文件初始化 profile 目录即可开始。'
      ]
    ],
    misses: [
      "acme/docs is a ✨special✨ repository that you can use to add a README.md to your organization's GitHub profile. Make sure it's public and initialize it with a README in the profile directory to get started."
    ]
  },
  // 复刻
  {
    hits: [
      ['Copy the main branch only', '仅复制 main 分支'],
      ['Copy the release/v2 branch only', '仅复制 release/v2 分支']
    ],
    misses: ['Copy the main branch']
  },
  {
    hits: [['Contribute back to octocat/hello-world by adding your own branch.', '通过添加你自己的分支向 octocat/hello-world 回馈贡献。']],
    misses: ['Contribute back to octocat by adding your own branch.']
  },
  {
    hits: [['You are creating a fork in the acme organization.', '你正在 acme 组织中创建复刻。']],
    misses: ['You are creating a fork in the acme enterprise.']
  },
  { hits: [['Fork octocat/hello-world', '复刻 octocat/hello-world']], misses: ['Fork this repository'] },
  { hits: [['Forking octocat/hello-world', '正在复刻 octocat/hello-world']], misses: ['Forking a repository'] },
  // 导入
  {
    hits: [
      ['Updating branches and 3 commit authors…', '正在更新分支和 3 个提交作者…'],
      ['Updating branches and 1 commit author...', '正在更新分支和 1 个提交作者...']
    ],
    misses: ['Updating branches and commit authors…']
  },
  {
    hits: [
      [
        'No source repositories were detected at https://example.com/repo.git. Please check the URL and try again.',
        '在 https://example.com/repo.git 未检测到源存储库。请检查 URL 后重试。'
      ]
    ],
    misses: ['No source repositories were detected. Please check the URL and try again.']
  },
  {
    hits: [['Importing complete! Your new repository octocat/hello is ready.', '导入完成！你的新存储库 octocat/hello 已就绪。']],
    misses: ['Importing complete! Your new repository is ready.']
  },
  // 新建组织
  {
    hits: [["The name 'acme' is already taken.", '名称“acme”已被占用。']],
    misses: ['The name acme is already taken.', "The name 'a'b' is already taken."]
  },
  {
    hits: [
      [
        "The name 'acme--' may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
        '名称“acme--”只能包含字母、数字或单个连字符，且不能以连字符开头或结尾。'
      ]
    ],
    misses: ["The name 'acme--' may only contain alphanumeric characters."]
  },
  {
    hits: [["Organization name 'octo-org' is unavailable.", '组织名称“octo-org”不可用。']],
    misses: ["Organization name 'octo-org' is available."]
  },
  {
    hits: [
      ['Your URL will be: https://github.com/acme', '你的 URL 将是：https://github.com/acme'],
      ['Your URL will be: https://github.com/my-org', '你的 URL 将是：https://github.com/my-org']
    ],
    misses: ['Your URL will be: https://gitlab.com/acme']
  },
  {
    hits: [['I.e., octocat (your personal account)', '即 octocat（你的个人帐户）']],
    misses: ['I.e., the octocat team']
  },
  {
    hits: [
      [
        'Boost developer productivity for $19/user/month. Pay only for assigned seats after setup.',
        '以每用户每月 $19 的价格提升开发人员效率。设置后仅为已分配的席位付费。'
      ],
      [
        'Boost developer productivity for $21.50/user/month. Pay only for assigned seats after setup.',
        '以每用户每月 $21.50 的价格提升开发人员效率。设置后仅为已分配的席位付费。'
      ]
    ],
    misses: ['Boost developer productivity for free. Pay only for assigned seats after setup.']
  },
  // 计划卡片
  {
    hits: [
      ['2,000 CI/CD minutes/month', '每月 2,000 分钟 CI/CD'],
      ['50,000 CI/CD minutes/month', '每月 50,000 分钟 CI/CD']
    ],
    misses: ['Unlimited CI/CD minutes/month']
  },
  {
    hits: [
      ['500MB of Packages storage', '500MB 软件包存储'],
      ['2GB of Packages storage', '2GB 软件包存储'],
      ['50 GB of Packages storage', '50 GB 软件包存储']
    ],
    misses: ['Unlimited Packages storage', '500MB of Codespaces storage']
  },
  {
    hits: [
      [
        'Blazing fast cloud developer environments with flexible compute and pre-configured containers, developers can code, collaborate, and debug from any browser. Pay only for what you use with compute fees starting at $0.18/hr and storage fees at $0.07/GB per month.',
        '极速云端开发环境，提供灵活的算力和预配置容器，开发人员可在任意浏览器中编码、协作和调试。按使用量付费，计算费用低至每小时 $0.18，存储费用为每月每 GB $0.07。'
      ]
    ],
    misses: ['Blazing fast cloud developer environments with flexible compute and pre-configured containers.']
  },
  // 转让与邀请页
  {
    hits: [['Transfer repository: octocat/hello', '转让存储库：octocat/hello']],
    misses: ['Transfer repository: hello']
  },
  {
    hits: [
      ['There are 2 codespaces that may be affected by this transfer.', '有 2 个代码空间可能会受到此次转让的影响。'],
      ['There is 1 codespace that may be affected by this transfer.', '有 1 个代码空间可能会受到此次转让的影响。']
    ],
    misses: ['There are codespaces that may be affected by this transfer.']
  },
  {
    hits: [
      ['There are', '当前有'],
      ['There is', '当前有']
    ],
    misses: ['There were']
  },
  {
    hits: [
      ['2 codespaces', '2 个代码空间'],
      ['1 codespace', '1 个代码空间']
    ],
    misses: ['many codespaces']
  },
  { hits: [['Type octocat/hello to confirm.', '输入 octocat/hello 以确认。']], misses: ['Type hello to confirm.'] },
  {
    hits: [['monalisa invited you to collaborate on octocat/hello', 'monalisa 邀请你协作开发 octocat/hello']],
    misses: ['monalisa invited you to collaborate on hello']
  },
  {
    hits: [
      ['of hello will be able to see:', '(hello) 将能够看到：'],
      ['of acme may be able to see:', '(acme) 可能会看到：']
    ],
    misses: ['of acme might see:']
  },
  { hits: [['Block monalisa', '阻止 monalisa']], misses: ['Block this user'] },
  { hits: [['Join acme', '加入 acme']], misses: ['Join the acme organization', 'Join the team now'] },
  {
    hits: [
      [
        "As an account successor, you would be able to manage octocat's repositories if they're not able to.",
        '作为帐户继任者，你可以在 octocat 无法管理其存储库时代为管理。'
      ],
      [
        'As an account successor, you would be able to manage mona-lisa’s repositories if they’re not able to.',
        '作为帐户继任者，你可以在 mona-lisa 无法管理其存储库时代为管理。'
      ]
    ],
    misses: ['As an account successor, you would be able to manage repositories.']
  },
  {
    hits: [
      [
        'By clicking "Accept invitation" below, I acknowledge that I agree to serve as the successor for octocat, in such ways authorized by their successor request. I agree to abide by GitHub\'s',
        '单击下方的“接受邀请”，即表示我同意按照 octocat 的继任者请求所授权的方式担任其继任者。我同意在使用和维护其帐户内容时遵守 GitHub 的'
      ]
    ],
    misses: [
      'By clicking "Decline" below, I acknowledge that I agree to serve as the successor for octocat, in such ways authorized by their successor request. I agree to abide by GitHub\'s'
    ]
  },
  // 将工作移至组织：进度
  { hits: [['10% complete', '已完成 10%']], misses: ['10 percent complete'] }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('new 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(newPages.static?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = newPages.regexp ?? []
    // 计划比较表的正则在下方单独测试
    const planRules = new Set((plansDictionary.regexp ?? []).map(([pattern]) => pattern))
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter(([pattern], index) => !covered.has(index) && !planRules.has(pattern)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('正则只在 new 页面生效', () => {
    expect(translate('hello-world is available.', REPO_SCOPE)).toBeUndefined()
    expect(translate('You are creating a fork in the acme organization.', REPO_SCOPE)).toBeUndefined()
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    const join = (parts: readonly string[]): string => normalizeText(parts.join(''))
    expect(translate(join(['You are creating a ', 'private', ' repository in your personal account.']))).toBe(
      '你正在个人帐户中创建专用存储库。'
    )
    expect(translate(join(['The repository ', 'hello', ' already exists on this account.']))).toBe('此帐户中已存在存储库 hello。')
    expect(translate(join(['Updating branches and ', '12', ' commit authors…']))).toBe('正在更新分支和 12 个提交作者…')
  })
})

describe('new 静态词条', () => {
  it.each([
    ['Create a new repository', '新建存储库'],
    ["Repositories contain a project's files and version history.", '存储库包含项目的文件和版本历史记录。'],
    ['Repositories contain a project’s files and version history.', '存储库包含项目的文件和版本历史记录。'],
    ['Have a project elsewhere?', '项目托管在别处？'],
    ['Required fields are marked with an asterisk (*).', '带星号 (*) 的为必填字段。'],
    ['Choose an owner', '选择所有者'],
    ['Great repository names are short and memorable. How about', '好的存储库名称简短易记。不妨试试'],
    ['Choose visibility', '选择可见性'],
    ['Add README', '添加自述文件'],
    ['No .gitignore', '无 .gitignore'],
    ['Add license', '添加许可证'],
    ["A license tells others what they can and can't do with your code.", '许可证说明他人可以和不可以用你的代码做什么。'],
    ['Create repository', '创建存储库'],
    ['Checking availability...', '正在检查可用性...'],
    ['Fetching templates...', '正在获取模板...'],
    ['Fetching templates…', '正在获取模板…'],
    ['Import your project to GitHub', '将你的项目导入到 GitHub'],
    ['Begin import', '开始导入'],
    ['Create a new fork', '创建新复刻'],
    ['Create fork', '创建复刻'],
    ['Set up your organization', '设置你的组织'],
    ['This organization belongs to:', '此组织属于：'],
    ['Create a free organization', '创建免费组织'],
    ['Continue with Team', '选择团队版'],
    ['I understand, transfer this repository.', '我已了解，转让此存储库。'],
    ['Transfer repository', '转让存储库'],
    ['Pulse, Contributors, Community, Traffic, Commits, Code Frequency, Network,', '统计、贡献者、社区、流量、提交、代码频率、网络'],
    ['You’ve been invited to the', '你已受邀加入'],
    ["You've been invited to the", '你已受邀加入'],
    ['Accept invitation', '接受邀请'],
    // 导入进度：email → 电子邮件；句号、逗号随原文
    [
      'There is no need to keep this window open, we’ll email you when the import is done.',
      '无需保持此窗口打开，导入完成后我们会通过电子邮件通知你。'
    ],
    [
      "There is no need to keep this window open. We'll email you when the import is done.",
      '无需保持此窗口打开。导入完成后我们会通过电子邮件通知你。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('日期与数字两侧加空格，缩写括号用半角', () => {
    expect(
      translate(
        'Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the'
      )
    ).toBe('已于 2024年4月12日停止支持导入 Mercurial、Subversion 和 Team Foundation Version Control (TFVC) 存储库。有关详细信息，请参阅')
  })

  it('完整句子全站生效', () => {
    expect(
      translate(
        'Transfer this repository to another user or to an organization where you have the ability to create repositories.',
        REPO_SCOPE
      )
    ).toBe('将此存储库转让给其他用户，或转让给你有权创建存储库的组织。')
    expect(translate('Your public profile information', ['common', 'organization'])).toBe('你的公开个人资料信息')
    expect(translate('Required fields are marked with an asterisk (*).', REPO_SCOPE)).toBe('带星号 (*) 的为必填字段。')
    // 继任邀请页的链接文字（不带句号）；/settings/admin 带句号的写法由 settings-account 收录
    expect(translate('Learn more about account successors', ['common', 'settings'])).toBe('了解帐户继任者')
    expect(newPages.static?.['Learn more about account successors.']).toBeUndefined()
    // 计费计划页共用，词条只在本文件收录
    expect(translate('The basics for organizations and developers', ['common', 'settings'])).toBe('面向组织和开发人员的基础功能')
  })

  it('不收录 common 已有或与其他词典重复的词条', () => {
    // Creating repository... / Creating fork... 由 codespaces 收录
    for (const key of ['Terms of Service', 'Learn more', 'Learn more.', 'Cancel', 'Creating repository...', 'Creating fork...']) {
      expect(newPages.static?.[key]).toBeUndefined()
    }
  })

  it('不在 scoped 重复收录 common-ui、repo-settings、settings-account 已有的词条', () => {
    for (const key of [
      // common-ui
      'Owner',
      'Visibility',
      'Description',
      '(required)',
      '(optional)',
      'Public',
      'Private',
      'Internal',
      'None',
      'Cancel and close',
      'Filter…',
      'Learn more about',
      'Recommended',
      'Draft',
      'Decline',
      'Not available',
      // repo-settings
      'already exists on this account.',
      'already exists on this account',
      // settings-account（计划卡片与比较表）
      'per month',
      'per user/month',
      'Code owners',
      'Required reviewers',
      'Multiple reviewers in pull requests',
      'Web-based support',
      "Define users' level of access to your code, data and settings.",
      // org-settings
      'Scheduled reminders',
      // common
      'Features on',
      'Switch plans'
    ]) {
      expect(newPages.scoped?.[key]).toBeUndefined()
      expect(newPages.static?.[key]).toBeUndefined()
    }
  })

  it('不收录易与存储库名混淆的单词', () => {
    // Change the default name in <a>your settings</a>：只收整段链接文字
    expect(newPages.scoped?.['your']).toBeUndefined()
    expect(newPages.scoped?.['settings']).toBeUndefined()
    expect(translate('your settings')).toBe('你的设置')
  })

  it('通用字段与计划词条由其他词典翻译', () => {
    expect(translateFull('Owner')).toBe('所有者')
    expect(translateFull('Description')).toBe('描述')
    expect(translateFull('Public')).toBe('公共')
    expect(translateFull('Private')).toBe('专用')
    expect(translateFull('None')).toBe('无')
    expect(translateFull('(required)')).toBe('（必填）')
    expect(translateFull('Recommended')).toBe('推荐')
    expect(translateFull('per month')).toBe('每月')
    expect(translateFull('per user/month')).toBe('每用户/月')
    expect(translateFull('Code owners')).toBe('代码所有者')
    // 译文以 settings-account 为准（人的量词按新约定由“名”改“个”，由该组同步）
    const settingsDictionary: PageDictionary = settingsPlans
    const reviewers = settingsDictionary.static?.['Multiple reviewers in pull requests']
    expect(reviewers).toBeDefined()
    expect(translateFull('Multiple reviewers in pull requests')).toBe(reviewers)
  })

  it('省略号写法由本文件收录', () => {
    expect(translate('Creating repository…')).toBe('正在创建存储库…')
    expect(translate('Creating fork…')).toBe('正在创建复刻…')
  })

  it('继任邀请：句首与句尾片段围绕 Terms of Service 链接', () => {
    expect(translate("and the user's written requests, if any, in my use and maintaining of their account's content.")).toBe(
      '以及该用户的书面请求（如有）。'
    )
  })

  it('个人帐户提示整句命中', () => {
    expect(translate('You are creating a public repository in your personal account.')).toBe('你正在个人帐户中创建公共存储库。')
    expect(translate('You are creating a fork in your personal account.')).toBe('你正在个人帐户中创建复刻。')
  })

  it('组织名被 <strong> 拆开时句首片段可与“组织。”拼接', () => {
    expect(translate('You are creating a private repository in the')).toBe('你正在创建的专用存储库将位于')
    expect(translate('You are creating a fork in the')).toBe('你正在创建的复刻将位于')
  })
})

describe('new 页面专用词条', () => {
  it.each([
    ['General', '常规'],
    ['Configuration', '配置'],
    ['Repository name', '存储库名称'],
    ['On', '开'],
    ['Off', '关'],
    ['Next', '下一步'],
    ['Copy the', '仅复制'],
    ['branch only', '分支'],
    ['Most popular', '最受欢迎'],
    ['The basics for individuals', '面向个人'],
    ['and organizations', '和组织的基础功能'],
    ['Starting at', '起价'],
    ['Unlimited public/private repositories', '不限数量的公共/专用存储库'],
    ['Everything included in Free, plus...', '包含免费版的全部功能，另加...'],
    ['Everything included in Team, plus…', '包含团队版的全部功能，另加…'],
    [
      'Enforce branch and tag protections, as well as push rules across your enterprise. Rule insights allow you to assess impact of rules before and during enforcement.',
      '在整个企业中强制实施分支和标签保护以及推送规则。规则洞察可帮助你在强制实施前和强制实施期间评估规则的影响。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('计划名译“X 版”：scoped 覆盖全局 static（导航义的 团队 / 企业；Free 不依赖 common 的计划标签译法）', () => {
    const planNames: readonly (readonly [string, string])[] = [
      ['Free', '免费版'],
      ['Team', '团队版'],
      ['Enterprise', '企业版']
    ]
    for (const [plan, expected] of planNames) {
      expect(newPages.scoped?.[plan]).toBe(expected)
      expect(translateFull(plan)).toBe(expected)
    }
  })

  it('产品名译成中文：Copilot 云端智能体、商业版，GitHub 代码空间、操作、市场', () => {
    expect(translate('About Copilot cloud agent')).toBe('关于 Copilot 云端智能体')
    expect(translate('About Copilot coding agent')).toBe('关于 Copilot 编码智能体')
    expect(translate('Get GitHub Copilot Business in this organization')).toBe('在此组织中使用 GitHub Copilot 商业版')
    expect(translate('GitHub Codespaces Access')).toBe('GitHub 代码空间访问权限')
    expect(translate('Access to GitHub Codespaces')).toBe('可使用 GitHub 代码空间')
    expect(translate('Pages and Wikis')).toBe('页面和 Wiki')
    expect(translate('Grant your Marketplace apps access to this repository')).toBe('授予你的市场应用访问此存储库的权限')
    expect(
      translate(
        'Use execution minutes with GitHub Actions to automate your software development workflows. Write tasks and combine them to build, test, and deploy any code project on GitHub.'
      )
    ).toBe('使用 GitHub 操作的执行分钟数自动化软件开发工作流。编写任务并加以组合，即可构建、测试和部署 GitHub 上的任何代码项目。')
    expect(translate('Share features and workflows between your GitHub Enterprise Server instance and GitHub Enterprise Cloud.')).toBe(
      '在 GitHub 企业服务器实例与 GitHub 企业云之间共享功能和工作流。'
    )
    // Premium Plus → 高级增强（与 common 的 /premium-support 页一致）
    expect(
      translate(
        'With Premium, get a 30-minute SLA on Urgent tickets and 24/7 web and phone support via callback request. With Premium Plus, get everything in Premium, assigned Customer Reliability Engineer and more.'
      )
    ).toBe(
      '高级支持提供紧急工单 30 分钟 SLA，以及全天候网页和电话回拨支持。高级增强支持包含高级支持的全部内容，另有分配的客户可靠性工程师等服务。'
    )
    expect(fullMatcher.translate('GitHub Premium Plus Support', NEW_SCOPE)).toBe('GitHub 高级增强支持')
    // 第三方产品名 Team Foundation Version Control 不是方案名，保留
    expect(
      translate(
        'Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the'
      )
    ).toContain('Team Foundation Version Control (TFVC)')
  })

  it('不影响其他页面', () => {
    expect(translate('General', REPO_SCOPE)).toBeUndefined()
    expect(translate('On', ['common', 'repo-settings'])).toBeUndefined()
    expect(translate('Most popular', REPO_SCOPE)).toBeUndefined()
    expect(translate('is available.', REPO_SCOPE)).toBeUndefined()
    expect(translate('Next', REPO_SCOPE)).toBeUndefined()
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw(' Create fork ', NEW_SCOPE)).toBe(' 创建复刻 ')
  })

  it('被 <strong> / <code> / 链接拆开的句子按片段翻译', () => {
    // This will set <strong>main</strong> as the default branch.
    expect(translate('This will set')).toBe('这会将')
    expect(translate('as the default branch.')).toBe('设为默认分支。')
    // You are creating a <strong>public</strong> repository in your personal account.
    expect([translate('You are creating a'), translate('public'), translate('repository in your personal account.')]).toEqual([
      '你正在创建的',
      '公共',
      '存储库将位于你的个人帐户。'
    ])
    // A <a>fork</a> is a copy of a repository…
    expect(translate('A')).toBe('所谓')
    expect(translate('fork')).toBe('复刻')
    // Contribute back to <strong>owner/repo</strong> by adding your own branch.
    expect(`${translate('Contribute back to')} octocat/hello-world ${translate('by adding your own branch.')}`).toBe(
      '通过添加你自己的分支向 octocat/hello-world 回馈贡献。'
    )
    // This will set <strong>main</strong> as the default branch. Change the default name in <a>your settings</a>.
    expect(translate('as the default branch. Change the default name in')).toBe('设为默认分支。更改默认名称请前往')
    expect(translate('Change the default name in')).toBe('更改默认名称请前往')
    // Learn more about <a>importing git repositories</a>（Learn more about 由 common-ui 翻译）
    expect([translateFull('Learn more about'), translate('importing git repositories')]).toEqual(['了解', '导入 Git 存储库'])
    // Type <strong>owner/repo</strong> to confirm.
    expect([translate('Type'), translate('to confirm.')]).toEqual(['输入', '以确认。'])
    // There <span>are</span> <a>2 codespaces</a> that may be affected by this transfer.
    expect([translate('There'), translate('are'), translate('2 codespaces')]).toEqual(['当前', '有', '2 个代码空间'])
    expect(translate('that may be affected by this transfer.')).toBe('可能会受到此次转让的影响。')
    // <a>Owners</a> of hello will be able to see:（括号内全为英文用半角，前导空格保留，与前面的中文隔开）
    expect(matcher.translateRaw(' of hello will be able to see:', NEW_SCOPE)).toBe(' (hello) 将能够看到：')
    // …initialize it with a <strong>README</strong> in the <code>profile</code> directory to get started.
    expect([translate('README'), translate('in the'), translate('directory to get started.')]).toEqual([
      '自述文件',
      '初始化',
      '目录即可开始。'
    ])
    // This business or institution — not <strong>user</strong> (your personal account) — will control this organization.
    expect([
      translate('This business or institution — not'),
      translate('(your personal account) — will control this organization.')
    ]).toEqual(['将由此企业或机构而不是', '（你的个人帐户）控制此组织。'])
  })

  it('原文没有标点的片段，译文也不加标点', () => {
    const SOURCE_PUNCT = /[.,;:!?…"'“”‘’()]/
    const TARGET_PUNCT = /[，。、；：？！“”‘’（）《》【】「」…—,.;:?!()"]/
    const entries = [
      ...Object.entries(newPages.static ?? {}),
      ...Object.entries(newPages.scoped ?? {}),
      ...Object.entries(plansDictionary.scoped ?? {})
    ]
    const offenders = entries
      .filter(([source, target]) => !SOURCE_PUNCT.test(source) && TARGET_PUNCT.test(target))
      .map(([source]) => source)
    expect(offenders).toEqual([])
  })
})

describe('new 页面类型覆盖的路由', () => {
  it.each([
    'https://github.com/new',
    'https://github.com/new/import',
    'https://github.com/octocat/hello/fork',
    'https://github.com/octocat/hello/generate',
    'https://github.com/octocat/hello/import',
    'https://github.com/octocat/hello/transfer',
    'https://github.com/octocat/hello/invitations',
    'https://github.com/orgs/acme/invitation',
    'https://github.com/users/octocat/succession/invitation',
    'https://github.com/organizations/plan',
    'https://github.com/organizations/new',
    'https://github.com/organizations/acme/repositories/new',
    'https://github.com/account/organizations/new',
    'https://github.com/pricing'
  ])('%s', url => {
    expect(detectPages(new URL(url))).toContain('new')
  })
})

describe('new 计划页 DOM（计划名、产品名译成中文）', () => {
  /**
   * 结构取自 /pricing 页面（.harvest 采集）：营销页头（Enterprise 栏目按钮带 svg 图标）、计划卡片、窄屏计划选择菜单、
   * 比较表列头与行、页脚；选择计划页的计划区同一组件
   */
  const PLAN_PAGE = `
    <header class="HeaderMktg header-logged-out"><nav aria-label="Global"><ul>
      <li><div class="container__KHyzq4"><button type="button" class="button__qiVZaY" aria-expanded="false" aria-controls="_R_2nd_">Enterprise<svg data-component="Octicon" aria-hidden="true" focusable="false" class="octicon octicon-triangle-right buttonIcon__44FXu9" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m6.427 4.427 3.396 3.396a.25.25 0 0 1 0 .354l-3.396 3.396A.25.25 0 0 1 6 11.396V4.604a.25.25 0 0 1 .427-.177Z"></path></svg></button></div></li>
    </ul></nav></header>
    <div class="js-pricing-plan">
      <div class="d-md-flex"><div class="tmp-px-3"><h2 class="mb-2 h5-mktg">Free</h2></div></div>
    </div>
    <div class="js-pricing-plan">
      <p class="js-recommended-plan-caption" id="caption">Most popular</p>
      <div class="d-md-flex"><div class="tmp-px-3"><h2 class="mb-2 h5-mktg">Team</h2></div></div>
    </div>
    <div class="js-pricing-plan">
      <div class="d-md-flex"><div class="tmp-px-3"><h2 class="mb-2 h5-mktg">Enterprise</h2></div></div>
    </div>
    <details id="plan-picker">
      <summary><div class="d-flex"><span> Features on <span class="h6-mktg js-compare-features-selected" data-default-plan="team" style="text-transform: capitalize;">team</span> </span></div></summary>
      <details-menu class="SelectMenu" role="menu"><div class="SelectMenu-list">
        <button role="menuitem" class="SelectMenu-item js-compare-features-nav" type="button" data-plan="free">Free</button>
        <button role="menuitem" class="SelectMenu-item js-compare-features-nav" type="button" data-plan="team">Team</button>
        <button role="menuitem" class="SelectMenu-item js-compare-features-nav" type="button" data-plan="enterprise">Enterprise</button>
      </div></details-menu>
    </details>
    <div role="table"><div role="rowgroup"><div role="row">
      <div role="columnheader" class="js-compare-features-item" data-plan="free"><div><h2 class="h3 mt-1">Free</h2></div></div>
      <div role="columnheader" class="js-compare-features-item" data-plan="team"><div><h2 class="h3 mt-1">Team</h2></div></div>
      <div role="columnheader" class="js-compare-features-item" data-plan="enterprise"><div><h2 class="h3 mt-1">Enterprise</h2></div></div>
    </div></div>
    <div role="rowgroup" id="github-secret-protection">
      <div role="rowheader"><h3 class="color-fg-muted h6-mktg">GitHub Secret Protection</h3></div>
    </div>
    <div role="rowgroup"><div role="row">
      <div role="rowheader"><details class="pricing-card-accordion"><summary>
        <div class="d-flex flex-auto flex-justify-between flex-items-center"><div class="flex-auto d-inline-block text-bold"> GitHub Actions </div></div>
      </summary></details></div>
      <div role="cell" class="js-compare-features-item" data-plan="enterprise"><div class="height-full tmp-p-3 color-bg-subtle"> Enterprise Cloud </div></div>
    </div></div></div>
    <footer><ul>
      <li class="item__KZSU7Z"><a class="Primer_Brand__Link-module__Link___lF11y" href="/enterprise"><span class="Primer_Brand__Text-module__Text___XeGJJ">Enterprise</span></a></li>
      <li class="item__KZSU7Z"><a class="Primer_Brand__Link-module__Link___lF11y" href="/team"><span class="Primer_Brand__Text-module__Text___XeGJJ">Team</span></a></li>
    </ul></footer>`
  const PLANS = ['免费版', '团队版', '企业版']

  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function texts(selector: string): string[] {
    return [...document.querySelectorAll(selector)].map(element => element.textContent?.trim() ?? '')
  }

  it.each(['https://github.com/pricing', 'https://github.com/organizations/plan'])(
    '%s：计划卡片、比较表、窄屏菜单的计划名译“X 版”，页头 Enterprise 栏目仍译“企业”',
    url => {
      document.body.innerHTML = PLAN_PAGE
      translator = createTranslator({
        matcher: fullMatcher,
        host: window,
        resolvePages: () => detectPages(new URL(url))
      })
      translator.start()
      expect(texts('.js-pricing-plan h2')).toEqual(PLANS)
      expect(texts('.js-compare-features-nav')).toEqual(PLANS)
      expect(texts('.js-compare-features-item h2')).toEqual(PLANS)
      expect(texts('.js-compare-features-selected')).toEqual(['团队版'])
      // 整句 Features on <span>team</span> 由 common 的 inline 规则把计划名移到句首，中文之间不留空格
      expect(texts('#plan-picker summary')).toEqual(['团队版功能'])
      // 页头栏目按钮（文字 + svg）由 new 的 inline 规则译“企业”，svg 图标保留
      expect(texts('header button')).toEqual(['企业'])
      expect(document.querySelector('header button svg')).not.toBeNull()
      // 页脚链接只有文字，与计划名无法区分：本页显示方案名“企业版”“团队版”
      expect(texts('footer a')).toEqual(['企业版', '团队版'])
      expect(texts('#caption')).toEqual(['最受欢迎'])
      // 比较表里单独出现的产品名
      expect(texts('#github-secret-protection h3')).toEqual(['GitHub 机密保护'])
      expect(texts('.text-bold')).toEqual(['GitHub 操作'])
      expect(texts('[role="cell"]')).toEqual(['企业云'])
    }
  )

  it('页头栏目的 inline 规则只对“Enterprise + 元素”的宿主生效', () => {
    const key = patternKey('Enterprise {}')
    expect(fullMatcher.translateInline(key, NEW_SCOPE)).toBe('企业{}')
    expect(fullMatcher.translateInline(key, REPO_SCOPE)).toBeUndefined()
    // 只有文字的计划名元素按 scoped 翻译
    expect(translateFull('Enterprise')).toBe('企业版')
  })

  it('其他页面类型不受 new 的计划名 scoped 影响', () => {
    document.body.innerHTML = PLAN_PAGE
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => detectPages(new URL('https://github.com/octocat/hello-world'))
    })
    translator.start()
    // Free 的全局译法由 common 决定（Copilot 计划标签），Team / Enterprise 仍是导航义的 团队 / 企业
    const globalFree = fullMatcher.translate('Free', REPO_SCOPE) ?? 'Free'
    expect(texts('.js-pricing-plan h2')).toEqual([globalFree, '团队', '企业'])
    expect(texts('header button, footer a')).toEqual(['企业', '企业', '团队'])
  })
})

describe('new 计划比较表（new/plans.ts）', () => {
  const plans: PageDictionary = plansDictionary
  const plansMatcher = createMatcher([
    ['new', newPages],
    ['new', plans]
  ])
  const translatePlan = (text: string, scope: readonly PageKey[] = NEW_SCOPE): string | undefined => plansMatcher.translate(text, scope)

  /** 按词典中的正则顺序排列 */
  const PLAN_REGEXP_CASES: readonly RegExpCase[] = [
    {
      hits: [
        ['50,000 minutes/month', '每月 50,000 分钟'],
        ['400 minutes/month', '每月 400 分钟']
      ],
      misses: ['unlimited minutes/month', '50,000 minutes per month']
    },
    {
      hits: [
        ['$0 spend limit', '$0 支出上限'],
        ['$1,500.50 spend limit', '$1,500.50 支出上限']
      ],
      misses: ['0 spend limit', '$0 spend limits']
    }
  ]
  const planHits = PLAN_REGEXP_CASES.flatMap(item => item.hits)

  it.each(planHits)('%s → %s', (input, expected) => {
    expect(plans.scoped?.[input]).toBeUndefined()
    expect(translatePlan(input)).toBe(expected)
  })

  it.each(PLAN_REGEXP_CASES.flatMap(item => item.misses))('不命中：%s', input => {
    expect(translatePlan(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = plans.regexp ?? []
    const covered = new Set(planHits.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    expect(rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))).toEqual([])
  })

  it.each([
    ['Choose a plan', '选择计划'],
    ['Compare features', '比较功能'],
    ['Available', '可用'],
    ['Unlimited', '无限制'],
    ['Public repositories', '公共存储库'],
    ['Private repositories', '专用存储库'],
    ['Milestones', '里程碑'],
    ['GitHub Apps', 'GitHub 应用'],
    ['Dependency review action', '依赖项审查操作'],
    ['SAML single sign-on (SSO)', 'SAML 单一登录 (SSO)'],
    ['Usage-based', '基于使用情况'],
    ['Start Enterprise trial', '开始企业版试用'],
    ['Multiple pull request assignees', '拉取请求的多个受理人'],
    ['Multiple issue assignees', '议题的多个受理人'],
    ['Collaborators for public repositories', '公共存储库的协作者'],
    ['Pre-receive hooks', '预接收钩子'],
    ['Required 2FA', '强制 2FA'],
    // 机密扫描语境的 provider → 提供程序
    ['Provider notification', '提供程序通知'],
    ['Prioritize active secrets with validity checks for provider patterns.', '通过提供程序模式的有效性检查，优先处理仍有效的机密。'],
    [
      'Providers get real-time alerts when their tokens appear in public code, enabling them to notify, quarantine, or revoke secrets.',
      '提供程序的令牌出现在公共代码中时，提供程序会实时收到警报，以便通知、隔离或撤销机密。'
    ],
    [
      'Detect tokens from unknown providers, including HTTP authentication headers, connection strings, and private keys.',
      '检测来自未知提供程序的令牌，包括 HTTP 身份验证标头、连接字符串和私钥。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(translatePlan(input)).toBe(expected)
  })

  it('Usage-based 与 common 的“基于使用情况的计费”统一', () => {
    const commonDictionary: PageDictionary = common
    const usageBased = plans.scoped?.['Usage-based']
    expect(usageBased).toBe('基于使用情况')
    expect(commonDictionary.static?.['is now usage-based. Set a per-user budget to manage costs.']).toContain(`${usageBased}的计费`)
  })

  it('Provider patterns 由 repo-settings 的 static 翻译，此处不重复', () => {
    const providerMatcher = createMatcher([
      ['common', common],
      ['repo-settings', repoSettings],
      ['new', newPages]
    ])
    expect(plans.scoped?.['Provider patterns']).toBeUndefined()
    expect(newPages.scoped?.['Provider patterns']).toBeUndefined()
    expect(providerMatcher.translate('Provider patterns', NEW_SCOPE)).toBe('提供程序模式')
  })

  it('窄屏“Features on <计划>”：Features on 由 common 翻译，小写计划名译“X 版”', () => {
    expect(fullMatcher.translate('Features on', NEW_SCOPE)).toBe('功能')
    const planNames: readonly (readonly [string, string])[] = [
      ['free', '免费版'],
      ['team', '团队版'],
      ['enterprise', '企业版']
    ]
    for (const [plan, expected] of planNames) {
      expect(plans.scoped?.[plan]).toBe(expected)
      expect(fullMatcher.translate(plan, NEW_SCOPE)).toBe(expected)
    }
  })

  it('与 /account/upgrade 比较表相同的说明由 settings-account 翻译，此处不重复', () => {
    for (const key of [
      'Not available',
      'Features on',
      'Switch plans',
      'Scheduled reminders',
      "Define users' level of access to your code, data and settings.",
      'Define users’ level of access to your code, data and settings.'
    ]) {
      expect(plans.scoped?.[key]).toBeUndefined()
    }
    expect(fullMatcher.translate('Not available', NEW_SCOPE)).toBe('不可用')
    expect(fullMatcher.translate('Define users’ level of access to your code, data and settings.', NEW_SCOPE)).toBe(
      '定义用户对你的代码、数据和设置的访问级别。'
    )
  })

  it.each([
    ['GitHub Actions', 'GitHub 操作'],
    ['GitHub Codespaces', 'GitHub 代码空间'],
    ['GitHub Packages', 'GitHub 软件包'],
    ['GitHub Secret Protection', 'GitHub 机密保护'],
    ['GitHub Code Security', 'GitHub 代码安全'],
    ['Copilot Autofix', 'Copilot 自动修复'],
    ['Enterprise Managed Users', '企业托管用户'],
    ['GitHub Connect', 'GitHub 连接'],
    ['Pages and wikis', '页面和 Wiki'],
    ['Quickly remediate with context provided by Copilot Autofix.', '借助 Copilot 自动修复提供的上下文快速修复。'],
    // Premium Plus → 高级增强（与 common 的 /premium-support 页一致）
    ['Premium and Premium Plus Support', '高级支持和高级增强支持']
  ])('产品名译成中文：%s → %s', (input, expected) => {
    expect(translatePlan(input)).toBe(expected)
  })

  it('Enterprise Cloud、Enterprise Server 由 common 的全局词条翻译，此处不重复', () => {
    const products: readonly (readonly [string, string])[] = [
      ['Enterprise Cloud', '企业云'],
      ['Enterprise Server', '企业服务器']
    ]
    for (const [key, expected] of products) {
      expect(plans.scoped?.[key]).toBeUndefined()
      expect(fullMatcher.translate(key, NEW_SCOPE)).toBe(expected)
    }
  })

  it('自造品牌词、技术缩写与货币代码保留原文', () => {
    for (const key of ['CodeQL', 'LDAP', 'USD']) {
      expect(plans.scoped?.[key]).toBeUndefined()
      // common 可能为保留词收录原样词条，只要求显示文字不变
      expect(fullMatcher.translate(key, NEW_SCOPE) ?? key).toBe(key)
    }
    // 分组名 Code Security、Secret Protection 由 common 的全局 static 负责，此处不重复
    expect(plans.scoped?.['Code Security']).toBeUndefined()
    expect(plans.scoped?.['Secret Protection']).toBeUndefined()
  })

  it('只在 new 页面生效，且不放 static', () => {
    expect(plans.static).toBeUndefined()
    expect(translatePlan('Available', REPO_SCOPE)).toBeUndefined()
    expect(translatePlan('team', ['common', 'organization'])).toBeUndefined()
    expect(translatePlan('Enterprise Managed Users', ['common', 'settings'])).toBeUndefined()
    expect(translatePlan('$0 spend limit', REPO_SCOPE)).toBeUndefined()
  })
})
