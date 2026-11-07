import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import actions from '../../../src/locales/zh-CN/common-ui/actions'
import counts from '../../../src/locales/zh-CN/common-ui/counts'
import status from '../../../src/locales/zh-CN/common-ui/status'
import { zhCN } from '../../../src/locales/zh-CN/index'
import organization from '../../../src/locales/zh-CN/organization'
import { SORT_VALUE } from '../../../src/locales/zh-CN/organization/repos-filter'
import { zhTW } from '../../../src/locales/zh-TW/index'
import { SORT_VALUE as SORT_VALUE_TW } from '../../../src/locales/zh-TW/organization/repos-filter'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = organization

const matcher = createMatcher([['organization', organization]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'organization'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 头部
  { hits: [['Users following vuejs', '关注 vuejs 的用户']], misses: ['Users following', 'Label: Public'] },
  {
    hits: [
      ['Follow octocat', '关注 octocat'],
      ['Follow 123456', '关注 123456']
    ],
    misses: ['Follow', 'Follow the organization']
  },
  { hits: [['Unfollow mona-lisa', '取消关注 mona-lisa']], misses: ['Unfollow all users'] },

  // 概述：存储库列表
  {
    hits: [
      ['Showing 10 of 124 repositories', '显示 124 个存储库中的 10 个'],
      ['Showing 1 of 1 repository', '显示 1 个存储库中的 1 个'],
      ['Showing 10 of 8,396 repositories', '显示 8,396 个存储库中的 10 个']
    ],
    misses: ['Showing all repositories']
  },
  {
    hits: [
      ['(3 issues need help)', '（3 个议题需要帮助）'],
      ['(1 issue needs help)', '（1 个议题需要帮助）']
    ],
    misses: ['(issues need help)']
  },
  {
    hits: [
      ['vuejs doesn’t have any pinned public repositories yet.', 'vuejs 还没有置顶的公共存储库。'],
      ["octo-org doesn't have any pinned public repositories yet.", 'octo-org 还没有置顶的公共存储库。']
    ],
    misses: ['vuejs has no pinned repositories.']
  },

  // 项目列表
  { hits: [['vuejs projects', 'vuejs 的项目']], misses: ['Open projects', 'closed projects', '5 projects'] },
  { hits: [['#21 updated', '#21 更新于']], misses: ['#21 created'] },
  {
    hits: [['Your project "@octocat\'s untitled project" was successfully deleted.', "项目“@octocat's untitled project”已删除。"]],
    misses: ['Your project was successfully deleted.']
  },

  // 人员 / 团队计数
  { hits: [['3 teams', '3 个团队']], misses: ['teams'] },
  {
    hits: [
      ['12 people in the octo-org organization', 'octo-org 组织中的 12 个成员'],
      ['1 person in the octo-org organization', 'octo-org 组织中的 1 个成员']
    ],
    misses: ['People in the octo-org organization']
  },
  {
    hits: [
      ['2 security managers in the octo-org organization', 'octo-org 组织中的 2 个安全管理员'],
      ['1 security manager in the octo-org organization', 'octo-org 组织中的 1 个安全管理员']
    ],
    misses: ['Security managers in the octo-org organization']
  },
  {
    hits: [
      ['5 teams in the octo-org organization', 'octo-org 组织中的 5 个团队'],
      ['1 team in the octo-org organization', 'octo-org 组织中的 1 个团队']
    ],
    misses: ['Teams in the octo-org organization']
  },
  {
    hits: [
      ['3 child team members', '3 个子团队成员'],
      ['1 child team member', '1 个子团队成员']
    ],
    misses: ['Child team members']
  },
  // 团队同步不一致页标题
  {
    hits: [
      ['5 group members not in team', '5 个组成员不在团队中'],
      ['1 group member not in team', '1 个组成员不在团队中']
    ],
    misses: ['group members not in team']
  },
  {
    hits: [
      ['3 team members not in group', '3 个团队成员不在组中'],
      ['1 team member not in group', '1 个团队成员不在组中']
    ],
    misses: ['team members not in group', '3 team members']
  },
  {
    hits: [
      ['2 members selected...', '已选择 2 个成员...'],
      ['1 member selected…', '已选择 1 个成员…'],
      ['3 collaborators selected...', '已选择 3 个协作者...'],
      ['2 teams selected', '已选择 2 个团队'],
      ['1 team selected…', '已选择 1 个团队…']
    ],
    misses: ['members selected...', '2 repositories selected']
  },

  // 人员：邀请、转换、移除、公开成员身份
  {
    hits: [
      ["You've invited octocat to octo-org!", '已邀请 octocat 加入 octo-org！'],
      [
        'You’ve invited @octocat to octo-org! They’ll be receiving an email shortly.',
        '已邀请 octocat 加入 octo-org！对方很快会收到电子邮件。'
      ],
      [
        "You've invited octocat to octo-org! They'll be receiving an email shortly. They can also visit https://github.com/orgs/octo-org/invitation to accept the invitation.",
        '已邀请 octocat 加入 octo-org！对方很快会收到电子邮件。对方也可以访问 https://github.com/orgs/octo-org/invitation 接受邀请。'
      ]
    ],
    misses: ["You've invited members to octo-org!"]
  },
  { hits: [['Invite a member to octo-org', '邀请成员加入 octo-org']], misses: ['Invite a member'] },
  {
    hits: [
      ['Invite octocat to octo-org', '邀请 octocat 加入 octo-org'],
      ['Invite @mona-lisa to octo-org', '邀请 mona-lisa 加入 octo-org']
    ],
    misses: ['Invite members to octo-org', 'Invite the team to octo-org']
  },
  {
    hits: [
      ['Cancel invitation from octocat', '取消 octocat 的邀请'],
      ['Cancel invitation from @mona-lisa', '取消 mona-lisa 的邀请']
    ],
    misses: ['Cancel invitation from the organization']
  },
  {
    // 时间由 helpers 生成，后接中文不加空格
    hits: [
      ['Invited on Oct 20, 2025', '2025 年 10 月 20 日邀请'],
      ['Invited 3 days ago', '3 天前邀请'],
      ['Invited about 1 year ago', '约 1 年前邀请'],
      ['Invited yesterday', '昨天邀请']
    ],
    misses: ['Invited by octocat']
  },
  {
    hits: [
      ["You've successfully updated octocat's invitation.", '已更新 octocat 的邀请。'],
      ['You’ve successfully updated mona-lisa’s invitation.', '已更新 mona-lisa 的邀请。']
    ],
    misses: ["You've successfully updated the invitation."]
  },
  {
    hits: [
      [
        "You've canceled 2 invitations from octo-org. It may take a few minutes to process.",
        '已取消 octo-org 的 2 个邀请。处理可能需要几分钟。'
      ]
    ],
    misses: ["You've canceled the invitation."]
  },
  { hits: [['You are now a member of octo-org!', '你已成为 octo-org 的成员！']], misses: ['You are now a member!'] },
  // 邀请页：Sorry, <strong>用户</strong> is already a member of <组织>.
  {
    hits: [
      ['is already a member of octo-org.', '已是 octo-org 的成员。'],
      ['is already a member of octo.org.', '已是 octo.org 的成员。']
    ],
    misses: ['is already a member of the organization.', 'is already a member of octo-org', 'is already a member.']
  },
  {
    hits: [
      ['Convert octocat to outside collaborator?', '要将 octocat 转换为外部协作者吗？'],
      ['Convert 2 members to outside collaborators?', '要将 2 个成员转换为外部协作者吗？'],
      ['Convert 1 member to an outside collaborator?', '要将 1 个成员转换为外部协作者吗？']
    ],
    misses: ['Convert members to outside collaborators?']
  },
  {
    hits: [
      ['Removing 2 members from octo-org', '将 2 个成员移出 octo-org'],
      ['Removing 1 member from', '将 1 个成员移出']
    ],
    misses: ['Removing members from octo-org']
  },
  {
    hits: [
      ['You publicized 2 memberships.', '你已公开 2 个成员身份。'],
      ['You concealed 3 memberships.', '你已隐藏 3 个成员身份。']
    ],
    misses: ['You publicized your membership.']
  },

  // 赞助
  { hits: [['Who microsoft is sponsoring', 'microsoft 赞助的对象']], misses: ['Who is sponsoring'] },
  {
    hits: [
      ["microsoft's sponsorships", 'microsoft 的赞助'],
      ['microsoft’s sponsorships', 'microsoft 的赞助']
    ],
    misses: ['sponsorships of microsoft']
  },

  // 成员视角切换
  {
    hits: [
      ['View as: Public', '查看身份：公开'],
      ['View as: Member', '查看身份：成员']
    ],
    misses: ['View as: Owner']
  },
  {
    hits: [
      [
        'You are viewing the README and pinned repositories as a member of the vuejs organization.',
        '你正以 vuejs 组织成员的身份查看自述文件和置顶存储库。'
      ]
    ],
    misses: ['You are viewing the README and pinned repositories as an owner.']
  },

  // 见解：Actions 指标
  { hits: [['Showing data from 2026/10/1 to', '数据时段 2026/10/1 至']], misses: ['Showing data from last month to'] },
  {
    hits: [
      ['Total minutes across all workflows in this organization for current month', '此组织所有工作流本月的总分钟数'],
      ['Total job runs across all workflows in this organization for Last 30 days', '此组织所有工作流过去 30 天的作业运行总数']
    ],
    misses: ['Total minutes across all workflows in this repository for current month']
  },
  {
    hits: [
      ['Average run time of jobs in this organization for current month', '此组织本月作业的平均运行时间'],
      ['Failure rate across jobs in this organization for last month', '此组织上个月作业的失败率']
    ],
    misses: ['Average run time of jobs']
  },

  // 标签页标题
  {
    hits: [
      ['vuejs repositories', 'vuejs 的存储库'],
      ['microsoft repositories', 'microsoft 的存储库'],
      ['SAP repositories', 'SAP 的存储库']
    ],
    misses: ['Popular repositories', 'Public repositories', 'other repositories', '124 repositories', '1.2k repositories']
  },

  // 存储库列表（React）
  {
    hits: [
      ['Sort by Last pushed descending', '按最近推送降序排序'],
      ['Sort by Name ascending', '按名称升序排序']
    ],
    misses: ['Sort by Last pushed']
  },
  {
    hits: [
      ['Show 2 more topics', '再显示 2 个主题'],
      ['Show 1 more topic', '再显示 1 个主题']
    ],
    misses: ['Show more topics']
  },
  {
    hits: [
      ['9.3k forks in vuejs/core', 'vuejs/core 中的 9.3k 个复刻'],
      ['55k stars in vuejs/core', 'vuejs/core 中的 55k 个星标'],
      ['546 issues in vuejs/core', 'vuejs/core 中的 546 个议题'],
      ['1 pull request in vuejs/tsconfig', 'vuejs/tsconfig 中的 1 个拉取请求'],
      ['5,000+ issues in microsoft/vscode', 'microsoft/vscode 中的 5,000+ 个议题']
    ],
    misses: ['9.3k forks in core']
  },
  {
    hits: [
      ['vuejs/core’s past year of commit activity', 'vuejs/core 过去一年的提交活动'],
      ["vuejs/devtools's past year of commit activity", 'vuejs/devtools 过去一年的提交活动']
    ],
    misses: ['past year of commit activity']
  },

  // 存储库列表（/repos 与组织存储库页）
  {
    hits: [
      ['Topics for octocat/hello-world', 'octocat/hello-world 的主题'],
      ['Topics for vuejs/core', 'vuejs/core 的主题']
    ],
    misses: ['Topics for', 'Topics for octocat', 'Topics for octocat/hello-world now']
  },
  {
    hits: [
      ['124 repositories found. List is sorted by Last pushed in descending order.', '找到 124 个存储库。列表按最近推送降序排列。'],
      ['1 repository found. List is sorted by Name in ascending order.', '找到 1 个存储库。列表按名称升序排列。'],
      ['1.2k repositories found. List is sorted by Stars in descending order.', '找到 1.2k 个存储库。列表按星标降序排列。']
    ],
    misses: [
      '124 repositories found.',
      '124 repositories found. List is sorted by Size in descending order.',
      'List is sorted by Name in ascending order.'
    ]
  },
  {
    hits: [["Are you sure you want to delete view 'My view'?", '确定要删除视图“My view”吗？']],
    misses: ['Are you sure you want to delete view?', "Are you sure you want to delete 'My view'?"]
  },
  {
    hits: [
      ['Gray color', '灰色'],
      ['Purple color', '紫色']
    ],
    misses: ['Gray', 'Teal color', 'Gray colour']
  },
  {
    hits: [
      ['People icon', '人群图标'],
      ['Repo locked icon', '锁定的存储库图标'],
      ['Copilot icon', 'Copilot 图标']
    ],
    misses: ['Unknown icon', 'People icons', 'icon']
  },

  // 存储库筛选框：高级筛选对话框
  {
    hits: [
      ['Advanced filter dialog: 1 valid filter', '高级筛选器对话框：1 个有效筛选器'],
      ['Advanced filter dialog: 3 valid filters', '高级筛选器对话框：3 个有效筛选器']
    ],
    misses: ['Advanced filter dialog: valid filters', 'Advanced filter dialog: 1 filter']
  },
  { hits: [['Row 1', '第 1 行']], misses: ['Row one', 'Rows 1'] },
  {
    hits: [['Delete filter 1: Language, is one of, Go,Ruby', '删除筛选器 1：Language, is one of, Go,Ruby']],
    misses: ['Delete filter: Language', 'Delete filter 1']
  },
  {
    hits: [
      ['Qualifier 1', '限定符 1'],
      ['Created, Qualifier 2', '创建日期，限定符 2'],
      // 自定义属性子键：排在 Property: 规则之前，不会被整个当成属性名
      ['Property: team, Qualifier 1', '属性：team，限定符 1']
    ],
    misses: ['Qualifier one', ', Qualifier 1']
  },
  {
    hits: [
      ['Operator 1', '运算符 1'],
      ['is, Operator 1', '是，运算符 1'],
      ['between, Operator 2', '介于，运算符 2'],
      ['greater than or equal to, Operator 3', '大于或等于，运算符 3']
    ],
    misses: ['Operator one', 'Operators 1']
  },
  {
    hits: [
      ['Value 1 From', '值 1 起始'],
      ['Value 2 To', '值 2 结束']
    ],
    misses: ['Value 1 Between']
  },
  {
    hits: [
      ['Value 1', '值 1'],
      ['True, Value 1', '是，值 1'],
      ['Public, Value 2', '公共，值 2'],
      // 语言名等数据保留原文
      ['Go, Value 1', 'Go，值 1']
    ],
    misses: ['Value one', 'Values 1']
  },
  // 取值框的占位文字（Enter a number 由 pages.ts 的 scoped 收录）
  {
    hits: [
      ['Enter a text', '输入文本'],
      ['Enter a value', '输入值'],
      ['Enter a date', '输入日期']
    ],
    misses: ['Enter a color', 'Enter a search term']
  },

  // 存储库筛选框
  {
    hits: [
      ['Total stars (ascending)', '星标总数（升序）'],
      ['Recently pushed (descending)', '最近推送（降序）'],
      ['Help-wanted issues (ascending)', '需要帮助的议题（升序）'],
      ['Name (descending)', '名称（降序）']
    ],
    misses: ['Total stars (asc)', 'Stars (ascending)', 'Total stars ascending']
  },
  {
    hits: [
      ['Visibility, Filter', '可见性，筛选器'],
      ['Sort, Filter, Order of results', '排序，筛选器，结果顺序'],
      ['Created, Filter, Creation date', '创建日期，筛选器，创建日期'],
      ['Custom properties, Filter, Filter by custom properties', '自定义属性，筛选器，按自定义属性筛选'],
      ['Size (Kb), Filter', '大小 (Kb)，筛选器'],
      // 自定义属性子键作为筛选键；未收录的键保留原文
      ['Property: team, Filter', '属性：team，筛选器'],
      ['Unknown key, Filter', 'Unknown key，筛选器']
    ],
    misses: ['Visibility, Filter,', ', Filter', 'Visibility Filter']
  },
  {
    hits: [
      ['Me, Admin Access', '我，管理员权限'],
      ['Public, Visibility', '公共，可见性'],
      ['Funding file, Has', '赞助文件，有'],
      ['README, In', '自述文件，范围'],
      ['Total forks (ascending), Sort', '复刻总数（升序），排序'],
      ['True, Template', '是，模板'],
      ['This month, Created', '本月，创建日期'],
      ['More than 10, Total forks', '多于 10，复刻总数'],
      // 语言名、组织名是数据，保留原文；许可证名按 code/licenses 译出（同可见文字）
      ['TypeScript, Language', 'TypeScript，语言'],
      ['MIT License, License', 'MIT 许可证，许可证'],
      ['octo-org, Organization', 'octo-org，组织'],
      ['Property: team, Custom properties', '属性：team，自定义属性']
    ],
    misses: ['Me, Member', 'octocat, Collaborator', ', Visibility', 'Public, visibility']
  },
  {
    hits: [
      ['Has property: team', '有属性：team'],
      ['No property: cost center', '无属性：cost center'],
      ['Has Property: team, Property: team', '有属性：team，属性：team'],
      ['No Property: team, Property: team', '无属性：team，属性：team']
    ],
    misses: ['Has property:', 'Has property team', 'Has label']
  },
  {
    hits: [
      ['True, Property: team', '是，属性：team'],
      ['False, Property: team', '否，属性：team'],
      // 组织自定义的取值保留原文
      ['Production, Property: environment', 'Production，属性：environment']
    ],
    misses: [', Property: team', 'True, Property:']
  },
  {
    hits: [
      ['Property: team', '属性：team'],
      ['Property: cost center', '属性：cost center']
    ],
    misses: ['Property:', 'Properties: team']
  },
  {
    hits: [
      ['Exclude props.team', '排除属性：team'],
      ['Exclude props.cost_center', '排除属性：cost_center']
    ],
    misses: ['Exclude props.', 'Exclude Props.team']
  },
  {
    hits: [
      ['Exclude language', '排除语言'],
      ['Exclude visibility', '排除可见性'],
      ['Exclude contributed-by', '排除贡献'],
      ['Exclude created', '排除创建日期'],
      ['Exclude pushed', '排除最后更新'],
      ['Exclude runtime-risk', '排除运行时风险'],
      ['Exclude unknown', '排除 unknown']
    ],
    misses: ['Exclude Language', 'Exclude language visibility', 'Excluded language']
  },
  {
    hits: [
      ['Filter contains 1 issue:', '筛选器有 1 处错误：'],
      ['Filter contains 2 issues:', '筛选器有 2 处错误：']
    ],
    misses: ['Filter contains issues:', 'Filter contains 2 issues']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('organization 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = organization.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Showing ', '10', ' of ', '124', ' repositories'].join('')))).toBe('显示 124 个存储库中的 10 个')
    expect(translate(normalizeText(['(', '3', ' issues need help)'].join('')))).toBe('（3 个议题需要帮助）')
  })
})

describe('organization 静态词条', () => {
  it.each([
    ["We've verified that the organization", '我们已验证组织'],
    ['We’ve verified that the organization', '我们已验证组织'],
    ['controls the domain:', '拥有以下域：'],
    ['Learn more about verified organizations', '了解已验证组织'],
    ['View all repositories', '查看所有存储库'],
    ['Top languages', '热门语言'],
    ['Most used topics', '最常用的主题'],
    ['This organization has no public repositories.', '此组织没有公共存储库。'],
    ['Edit pinned repositories', '编辑置顶存储库'],
    ['You are viewing the README and pinned repositories as a public user.', '你正以公开用户身份查看自述文件和置顶存储库。'],
    ['Switch profile context', '切换个人资料视角'],
    ['Last pushed', '最近推送'],
    ['Repository filters', '存储库筛选器'],
    ['No repositories matched your search.', '没有匹配的存储库。'],
    ['Pending invitations', '待定邀请'],
    ['Pending collaborators', '待定协作者'],
    ['Find a member…', '查找成员…'],
    ['Organization permissions', '组织权限'],
    ["We couldn't find any matching members.", '未找到匹配的成员。'],
    ['Search all projects', '搜索所有项目'],
    ['Current sponsorships', '当前赞助'],
    ['Subscribe to email updates', '订阅电子邮件更新'],
    ['Unsubscribe from emails', '取消订阅电子邮件'],
    ["We'll start the export process and email you at", '我们将开始导出并在完成后把导出文件发送到'],
    // 原文句中没有逗号，译文不加
    ['Set up discussions to engage with your community!', '设置讨论来与社区互动！'],
    // 头部：关注按钮旁的提示框
    ['You can now follow organizations', '现在可以关注组织了'],
    ['Organization activity like new discussions, sponsorships, and repositories will appear in', '新讨论、赞助和存储库等组织活动将显示在'],
    // 概述：存储库筛选无结果，直撇号与弯撇号同译
    ['This organization doesn’t have any repositories that match.', '此组织没有匹配的存储库。'],
    ["This organization doesn't have any repositories that match.", '此组织没有匹配的存储库。'],
    // 概述：新组织的欢迎横幅与入门任务说明（原文句中没有逗号，译文不加）
    ['We think you’re gonna like it here.', '我们相信你会喜欢这里。'],
    ["We think you're gonna like it here.", '我们相信你会喜欢这里。'],
    [
      "We’ve suggested some tasks here in your organization's overview to help you get started.",
      '我们在组织概述中推荐了一些任务来帮助你上手。'
    ],
    ['Find people by their GitHub username or email address.', '按 GitHub 用户名或电子邮件地址查找人员。'],
    ['Set everyone’s base permissions for your code.', '为所有人设置代码的基本权限。'],
    ['Propose and collaborate on changes to a repository.', '对存储库提出更改并共同协作。'],
    ['Enforce certain workflows for one or more branches.', '为一个或多个分支强制实施特定工作流。'],
    ['Try automatically assigning work with GitHub Actions.', '试试使用 GitHub 操作自动分配工作。'],
    ['Validate your code using a CI workflow.', '使用 CI 工作流验证代码。']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })
})

describe('organization 页面词条', () => {
  it.each([
    ['People', '人员'],
    ['Members', '成员'],
    ['Secret', '机密'],
    ['pin repositories', '置顶存储库'],
    ['Make a copy', '创建副本'],
    ['No open projects', '没有打开的项目'],
    ['Metrics', '指标'],
    ['Comfortable display density', '宽松显示密度'],
    ['General', '常规'],
    ['Organization access', '组织访问权限'],
    ['Currently:', '当前：'],
    ['Grant access', '授予访问权限'],
    ['Deny access', '拒绝访问'],
    // 概述：入门任务列表的加载占位、分组标题、查看更多链接与功能链接
    ['Loading tasks', '正在加载任务'],
    ['Invite your people', '邀请伙伴'],
    ['See more about collaborative coding', '查看更多协作编码内容'],
    ['Automation and CI/CD', '自动化和 CI/CD'],
    ['See more about automation and CI/CD', '查看更多自动化和 CI/CD 内容'],
    ['Discover new GitHub features', '探索 GitHub 新功能'],
    ['See all features', '查看所有功能'],
    ['Client apps', '客户端应用'],
    ['Project management', '项目管理'],
    ['Team administration', '团队管理'],
    // 隐藏入门任务后的提示、头部提示框的链接与关闭按钮、邀请页的开头片段
    ['Get started with tasks', '开始完成任务'],
    ["hide the tasks we've suggested", '隐藏我们推荐的任务'],
    ['your dashboard feed', '你的仪表板动态中'],
    ['OK, got it!', '好的，知道了！'],
    ['Sorry,', '抱歉，']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('People', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('General', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Grant access', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Follow octocat', ['common', 'search'])).toBeUndefined()
    expect(matcher.translate('Sorry,', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('See all features', ['common', 'repository'])).toBeUndefined()
  })

  it('裸的紧凑时间不翻译：存储库列表里的是 <relative-time format="micro">，项目字段等处的同形文字是用户内容', () => {
    for (const text of ['4m', '13h', '2d', '1w', '6mo', '1y']) expect(translate(text)).toBeUndefined()
  })

  it('赞助摘要片段按顺序读通', () => {
    const parts = ['github', 'has', '24', 'current sponsorships and', '1070', 'past sponsorships']
    expect(parts.map(part => translate(part) ?? part).join(' ')).toBe('github 有 24 个当前赞助和 1070 个过往赞助')
  })

  it('概述提示片段按顺序读通', () => {
    const parts = ['create a README file', 'or', 'pin repositories', 'visible to anyone.']
    expect(parts.map(part => translate(part) ?? part).join(' ')).toBe('创建自述文件 or 置顶存储库 对所有人可见。')
  })
})

describe('删除的冗余词条由 common-ui 提供', () => {
  const withCommon = createMatcher([
    ['common', actions],
    ['common', status],
    ['common', counts],
    ['organization', organization]
  ])

  it.each([
    ['Verified', '已验证'],
    ['Label: Verified', '标签：已验证'],
    ['Label: GitHub Sponsor', '标签：GitHub 赞助者'],
    ['Label: Public', '标签：公共'],
    ['Label: Private', '标签：专用'],
    ['Label: Public archive', '标签：公共存档'],
    ['Label: Private archive', '标签：专用存档'],
    ['View all', '查看全部'],
    ['Not available', '不可用'],
    ['Least recently updated', '最久未更新'],
    ['124 repositories', '124 个存储库'],
    ['5 projects', '5 个项目'],
    ['12 members', '12 个成员']
  ])('%s → %s', (input, expected) => {
    expect(withCommon.translate(input, ['common', 'organization'])).toBe(expected)
  })
})

describe('organization 忽略选择器', () => {
  // 实际生效的是全局忽略规则加上本词典的规则
  const selector = [...IGNORE_SELECTORS, ...(organization.ignore ?? [])].join(', ')

  /** 文本完全相同的最内层元素是否落在忽略区域内 */
  function ignored(text: string): boolean {
    const element = [...document.querySelectorAll('*')].filter(node => node.textContent?.trim() === text).at(-1)
    return Boolean(element?.closest(selector))
  }

  it.each(organization.ignore ?? [])('%s 是合法选择器', rule => {
    expect(() => document.createElement('div').querySelector(rule)).not.toThrow()
  })

  it('组织名、描述、所在地与关注者简介被忽略，徽章文字不被忽略', () => {
    document.body.innerHTML = `
      <header class="pagehead orghead">
        <div class="flex-1">
          <h1 class="h2">Vue</h1>
          <div class="color-fg-muted"><div>Your friendly JavaScript framework</div></div>
          <summary title="Label: Verified" class="Label Label--success">Verified</summary>
          <span itemprop="location">All Over the World</span>
        </div>
      </header>
      <div class="d-table table-fixed"><div class="d-table-cell">
        <div class="color-fg-muted text-small mb-2"><div>Frontend engineer.</div></div>
        <a class="btn btn-sm">Follow</a>
      </div></div>`
    expect(ignored('Vue')).toBe(true)
    expect(ignored('Your friendly JavaScript framework')).toBe(true)
    expect(ignored('All Over the World')).toBe(true)
    expect(ignored('Frontend engineer.')).toBe(true)
    expect(ignored('Verified')).toBe(false)
    expect(ignored('Follow')).toBe(false)
  })

  it('赞助标签页的赞助时间不被忽略；关注者简介、所在地仍被忽略（/<用户> 同时套用本词典）', () => {
    document.body.innerHTML = `
      <div class="d-table table-fixed"><div class="d-table-cell">
        <div class="color-fg-muted text-small mb-2"><div>Frontend engineer.</div></div>
        <p class="color-fg-muted text-small mb-0"><svg class="octicon octicon-location"></svg> Switzerland</p>
      </div></div>
      <div class="d-table table-fixed"><div class="d-table-cell">
        <div><span class="color-fg-muted text-small">Sponsoring since January 31, 2022</span></div>
      </div></div>`
    expect(ignored('Frontend engineer.')).toBe(true)
    expect(ignored('Switzerland')).toBe(true)
    expect(ignored('Sponsoring since January 31, 2022')).toBe(false)
  })

  it('页头面包屑首项（组织名）被忽略；站点页首项、切换存储库按钮与提示不被忽略', () => {
    document.body.innerHTML = `
      <header class="GlobalNav">
        <nav aria-label="Breadcrumbs" data-component="Breadcrumbs"><ol>
          <li><a class="contextCrumb__Q8nET8" data-component="Breadcrumbs.Item" href="/today"><span>today</span></a></li>
          <li>
            <a class="contextCrumb__Q8nET8 contextCrumbLast__l2P28s repoPickerCrumb__56N_WW" data-component="Breadcrumbs.Item" href="/today/hello-world">hello-world</a>
            <button class="contextCrumb__Q8nET8 repoPickerDropdownButton__o-JgKh" data-component="IconButton" type="button" aria-labelledby="tip"></button>
            <span data-component="Tooltip" aria-hidden="true"><span id="tip">Switch repository</span></span>
          </li>
        </ol></nav>
      </header>
      <header class="GlobalNav">
        <nav aria-label="Breadcrumbs" data-component="Breadcrumbs"><ol>
          <li><a class="styles-module__contextCrumb__IzGIq" href="https://github.com/"><span class="styles-module__contextCrumbLast__tI2e3">Dashboard</span></a></li>
        </ol></nav>
      </header>`
    // 不忽略时 today 会被时间词条译成“今天”
    expect(ignored('today')).toBe(true)
    expect(ignored('Dashboard')).toBe(false)
    expect(ignored('Switch repository')).toBe(false)
    expect(document.querySelector('button[class*="repoPickerDropdownButton__"]')?.closest(selector)).toBeNull()
  })
})

/** /repos 与组织存储库页的作用域；与其他页面同句同译的断言用完整语言包 */
const REPOS: readonly PageKey[] = ['common', 'organization']
const full = createMatcher(zhCN)

describe('存储库列表与筛选框（完整语言包）', () => {
  it.each([
    // ProTip 被 <code> 拆成两段
    ['Using a comma within certain filters will aggregate the results. For example:', '在某些筛选器中使用逗号会合并结果。例如：'],
    ['will show all repositories that have either Go or Ruby as their primary language.', '会显示主要语言为 Go 或 Ruby 的所有存储库。'],
    [
      "Don't forget that you can create saved views to keep track of your most important repositories!",
      '别忘了可以创建已保存的视图来跟踪你最重要的存储库！'
    ],
    ['Repository settings', '存储库设置'],
    ['Change the repository type filter', '切换存储库视图'],
    ['No more repositories. Visit a lower page.', '没有更多存储库。请访问前面的页面。'],
    ["Your teams don't have access to any repositories.", '你的团队没有任何存储库的访问权限。'],
    ['No repositories matched your search. Try a different search query.', '没有匹配的存储库。请尝试其他搜索词。'],
    ['More repository actions', '更多存储库操作'],
    ['Filter "is:" is deprecated, use "visibility:" or "sponsorable:" instead', '筛选器“is:”已弃用，请改用“visibility:”或“sponsorable:”'],
    // 侧栏与已保存视图
    ['Views', '视图'],
    ['Icon', '图标'],
    ['Color', '颜色'],
    ['My repositories', '我的存储库'],
    ['My contributions', '我的贡献'],
    ['My forks', '我的复刻'],
    ['Open sidebar', '打开侧栏'],
    // 筛选键、说明与取值
    ['Admin Access', '管理员权限'],
    ['Has', '有'],
    ['In', '范围'],
    ['Is', '是'],
    ['Runtime risk', '运行时风险'],
    ['Order of results', '结果顺序'],
    ['Me', '我'],
    ['Funding file', '赞助文件'],
    ['Recently pushed', '最近推送'],
    ['Size', '大小'],
    ['True', '是'],
    ['False', '否'],
    ['No language', '无语言'],
    ['Created', '创建日期'],
    ['Size (Kb)', '大小 (Kb)'],
    ['Programming language', '编程语言'],
    ['Custom properties', '自定义属性'],
    ['Exclude', '排除'],
    ['Unbalanced quotation marks', '引号不匹配'],
    // 高级筛选对话框：列标题、介于运算符的起止输入框
    ['Qualifier', '限定符'],
    ['Operator', '运算符'],
    ['Value', '值'],
    ['From', '从'],
    ['To', '到'],
    // 高级筛选对话框：运算符与取值框的占位文字（比较运算符由 pages.ts 收录）
    ['is one of', '是以下之一'],
    ['is not one of', '不是以下之一'],
    ['is', '是'],
    ['is not', '不是'],
    ['before', '早于'],
    ['after', '晚于'],
    ['before and including', '早于或等于'],
    ['after and including', '晚于或等于'],
    ['between', '介于'],
    ['greater than', '大于'],
    ['Filter values', '筛选值'],
    // /repos 的标签页标题
    ['User repositories', '用户存储库'],
    // 由通用词典或其他词典收录的同页文字
    ['Archived', '已存档'],
    ['Sponsorable', '可赞助'],
    ['No saved views', '没有已保存的视图'],
    ['Create view', '创建视图'],
    ['Private mirror', '专用镜像']
  ])('%s → %s', (input, expected) => {
    expect(full.translate(input, REPOS)).toBe(expected)
  })

  it.each([
    'Views',
    'Icon',
    'Color',
    'Has',
    'In',
    'Is',
    'Me',
    'Size',
    'True',
    'False',
    'No language',
    'Created',
    'Visit a lower page.',
    'Qualifier',
    'Operator',
    'Value',
    'From',
    'To',
    'is one of',
    'is not one of',
    'is',
    'is not',
    'before',
    'after',
    'before and including',
    'after and including',
    'between',
    'Filter values'
  ])('短词只在 organization 生效：%s', input => {
    expect(full.translate(input, ['common'])).toBeUndefined()
  })

  it.each([
    ['Visit a lower page.', ['common', 'repository', 'pulls']],
    ['Filter contains 2 issues:', ['common', 'repository', 'issues']],
    ['Exclude language', ['common', 'repository', 'issues']],
    ['Unbalanced parentheses', ['common', 'repository', 'issues']],
    ['Empty value for', ['common', 'repository', 'issues']],
    ['Gray color', ['common', 'repository', 'issues']],
    ['Bookmark icon', ['common', 'repository', 'issues']],
    ['Qualifier', ['common', 'repository', 'issues']],
    ['Operator', ['common', 'repository', 'issues']],
    ['Value', ['common', 'repository', 'issues']],
    ['From', ['common', 'repository', 'issues']],
    ['To', ['common', 'repository', 'issues']],
    ['is one of', ['common', 'repository', 'issues']],
    ['is not one of', ['common', 'repository', 'issues']],
    ['is', ['common', 'repository', 'issues']],
    ['is not', ['common', 'repository', 'issues']],
    ['before', ['common', 'repository', 'issues']],
    ['after', ['common', 'repository', 'issues']],
    ['before and including', ['common', 'repository', 'issues']],
    ['after and including', ['common', 'repository', 'issues']],
    ['between', ['common', 'repository', 'issues']],
    ['Filter values', ['common', 'repository', 'issues']],
    ['Advanced filter dialog: 2 valid filters', ['common', 'repository', 'issues']],
    ['Row 1', ['common', 'repository', 'issues']],
    ['Delete filter 1: Language, is, Go', ['common', 'repository', 'issues']],
    ['Qualifier 1', ['common', 'repository', 'issues']],
    ['between, Operator 1', ['common', 'repository', 'issues']],
    ['Value 1 From', ['common', 'repository', 'issues']],
    ['Value 1 To', ['common', 'repository', 'issues']],
    ['True, Value 1', ['common', 'repository', 'issues']],
    ['Enter a text', ['common', 'repository', 'issues']],
    ['Enter a value', ['common', 'repository', 'issues']]
  ] as const)('与其他页面同句同译：%s', (input, scope) => {
    expect(full.translate(input, REPOS)).toBeDefined()
    expect(full.translate(input, REPOS)).toBe(full.translate(input, scope))
  })

  it.each(['TypeScript', '+ 2'])('数据与技术词不收录：%s', input => {
    expect(full.translate(input, REPOS)).toBeUndefined()
  })

  it('筛选取值中的许可证名按 code/licenses 译出（全局 static）', () => {
    expect(full.translate('MIT License', REPOS)).toBe('MIT 许可证')
  })

  it('筛选取值 README（in:readme）译作自述文件', () => {
    expect(full.translate('README', REPOS)).toBe('自述文件')
  })

  it('查表不取原型链上的键：组织名、属性取值照常保留', () => {
    expect(full.translate('constructor, Organization', REPOS)).toBe('constructor，组织')
    expect(full.translate('toString, Filter', REPOS)).toBe('toString，筛选器')
    expect(full.translate('Exclude constructor', REPOS)).toBe('排除 constructor')
    expect(full.translate('__proto__, Property: team', REPOS)).toBe('__proto__，属性：team')
  })

  it.each([
    ['Created {}', '创建于 {}'],
    ['Invalid value {} for {}', '无效值 {} 用于筛选器 {}']
  ])('行内句：%s → %s', (pattern, expected) => {
    expect(full.translateInline(patternKey(pattern), REPOS)).toBe(expected)
  })

  it.each(['Updated {}', 'Invalid value {} for', 'Empty value for {}'])('行内句不命中：%s', pattern => {
    expect(full.translateInline(patternKey(pattern), REPOS)).toBeUndefined()
  })
})

describe('存储库列表与筛选框（繁体）', () => {
  const tw = createMatcher(zhTW)

  it.each([
    ['User repositories', '使用者儲存庫'],
    ['Qualifier', '限定詞'],
    ['Operator', '運算子'],
    ['Value', '值'],
    ['From', '從'],
    ['To', '到'],
    ['is one of', '是下列其中之一'],
    ['is not', '不是'],
    ['No language', '無語言'],
    ['before and including', '早於或等於'],
    ['between', '介於'],
    ['Filter values', '篩選值'],
    ['Advanced filter dialog: 2 valid filters', '進階篩選器對話方塊：2 個有效篩選器'],
    ['Row 1', '第 1 列'],
    ['Property: team, Qualifier 1', '屬性：team，限定詞 1'],
    ['between, Operator 1', '介於，運算子 1'],
    ['Value 1 From', '值 1 起始'],
    ['True, Value 2', '是，值 2'],
    ['Enter a text', '輸入文字'],
    ['Enter a value', '輸入值'],
    // 筛选键 Created 与说明 Creation date、议题筛选框的同一限定符同译
    ['Created', '建立日期'],
    ['Created, Filter, Creation date', '建立日期，篩選器，建立日期'],
    ['This month, Created', '本月，建立日期'],
    ['Exclude created', '排除建立日期']
  ])('%s → %s', (input, expected) => {
    expect(tw.translate(input, REPOS)).toBe(expected)
  })

  it.each(['Qualifier', 'Operator', 'From', 'is one of', 'is not', 'between', 'Filter values', 'Row 1', 'Value 1 To'])(
    '与议题页筛选框同译：%s',
    input => {
      expect(tw.translate(input, REPOS)).toBe(tw.translate(input, ['common', 'repository', 'issues']))
    }
  )

  it('个人主页（同时套用 organization 词典）同样生效，其他页面不生效', () => {
    expect(tw.translate('From', ['common', 'profile', 'organization'])).toBe('從')
    expect(tw.translate('From', ['common', 'repository'])).toBeUndefined()
  })

  it('Exclude created 与议题筛选框、全局 /pulls 同译（简繁）', () => {
    for (const locale of [full, tw]) {
      const expected = locale.translate('Exclude created', REPOS)
      expect(expected).toBeDefined()
      expect(locale.translate('Exclude created', ['common', 'repository', 'issues'])).toBe(expected)
      expect(locale.translate('Exclude created', ['common', 'pulls'])).toBe(expected)
    }
  })

  it('带方向的排序取值（全局 /pulls 按词条收录）与本页正则同译（简繁）', () => {
    for (const [locale, table] of [
      [full, SORT_VALUE],
      [tw, SORT_VALUE_TW]
    ] as const) {
      const entries = Object.entries(table)
      expect(entries).toHaveLength(10)
      for (const [value, expected] of entries) {
        expect(expected).not.toBe(value)
        expect(locale.translate(value, REPOS)).toBe(expected)
        expect(locale.translate(value, ['common', 'pulls'])).toBe(expected)
      }
    }
    expect(SORT_VALUE['Total stars (ascending)']).toBe('星标总数（升序）')
    expect(SORT_VALUE_TW['Help-wanted issues (descending)']).toBe('需要協助的議題（遞減）')
  })
})

describe('存储库列表与筛选框（DOM）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: full, host: window, resolvePages: () => REPOS })
    translator.start()
  }

  function text(selector: string): string | undefined {
    return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim()
  }

  function attribute(selector: string, name: string): string | null | undefined {
    return document.querySelector(selector)?.getAttribute(name)
  }

  it('列表条目：Created + 时间、主题对话框、设置提示；名称、描述与语言保持原文', () => {
    // 结构按 repos-list 的 ReposListItem 简化，名称与描述是占位内容
    render(`
      <ul data-listview-component="items-list" role="list">
        <li class="listItem__abc" aria-label="hello-world.">
          <h3><a href="/octocat/hello-world"><span class="NwoTitle__x1">octocat/hello-world</span></a></h3>
          <div class="repos-list-description width-full"><span>Sample text about this repository.</span></div>
          <span class="PrimaryLanguageName__x6">Go</span>
          <span id="created" class="LastUpdated__x7">Created <relative-time datetime="2026-10-20T00:00:00Z">Oct 20, 2026</relative-time></span>
          <span class="prc-TooltipV2-Tooltip-x" id="settings-tip" popover="auto">Repository settings</span>
        </li>
      </ul>
      <div role="dialog"><h1 id="topics-title">Topics for octocat/hello-world</h1></div>`)
    expect(text('#created')?.startsWith('创建于')).toBe(true)
    expect(document.querySelector('#created relative-time')).not.toBeNull()
    expect(text('#settings-tip')).toBe('存储库设置')
    expect(text('#topics-title')).toBe('octocat/hello-world 的主题')
    expect(text('.repos-list-description')).toBe('Sample text about this repository.')
    expect(text('.PrimaryLanguageName__x6')).toBe('Go')
    expect(text('.NwoTitle__x1')).toBe('octocat/hello-world')
    expect(attribute('li', 'aria-label')).toBe('hello-world.')
  })

  it('ProTip：被 <code> 拆开的提示按片段翻译，代码保持原文', () => {
    render(`
      <div id="tip"><strong>ProTip!</strong> Using a comma within certain filters will aggregate the results. For example:&nbsp;<code>language:Go,Ruby</code> will show all repositories that have either Go or Ruby as their primary language.</div>
      <div id="saved-tip"><strong>ProTip!</strong> Don't forget that you can create saved views to keep track of your most important repositories!</div>`)
    expect(text('#tip')).toBe('提示！在某些筛选器中使用逗号会合并结果。例如：language:Go,Ruby 会显示主要语言为 Go 或 Ruby 的所有存储库。')
    expect(text('#tip code')).toBe('language:Go,Ruby')
    expect(text('#saved-tip')).toBe('提示！别忘了可以创建已保存的视图来跟踪你最重要的存储库！')
  })

  it('侧栏：预设链接、视图分组、折叠按钮说明', () => {
    render(`
      <nav aria-label="Repository views">
        <ul>
          <li><a href="?q=user:@me"><span>My repositories</span></a></li>
          <li><a href="?q=contributed-by:@me"><span>My contributions</span></a></li>
          <li><a href="?q=fork:true"><span>My forks</span></a></li>
          <li><a href="?q=admin:@me"><span>Admin access</span></a></li>
        </ul>
        <h2 id="views-heading">Views</h2>
        <button id="create-view" aria-label="Create view"></button>
      </nav>
      <span class="sr-only" id="types-description">Change the repository type filter</span>`)
    expect(attribute('nav', 'aria-label')).toBe('存储库视图')
    expect(text('nav li:nth-child(1)')).toBe('我的存储库')
    expect(text('nav li:nth-child(2)')).toBe('我的贡献')
    expect(text('nav li:nth-child(3)')).toBe('我的复刻')
    expect(text('nav li:nth-child(4)')).toBe('管理员权限')
    expect(text('#views-heading')).toBe('视图')
    expect(attribute('#create-view', 'aria-label')).toBe('创建视图')
    expect(text('#types-description')).toBe('切换存储库视图')
  })

  it('筛选框：建议项的文字与 aria-label、校验横幅', () => {
    // 结构按 filter 的 SuggestionItem、ValidationMessage 简化
    render(`
      <ul role="listbox" aria-label="Suggestions">
        <li id="s1" role="option" aria-label="Sort, Filter, Order of results"><span>Sort</span><span id="s1-desc">Order of results</span></li>
        <li id="s2" role="option" aria-label="Total stars (ascending), Sort"><span>Total stars (ascending)</span></li>
        <li id="s3" role="option" aria-label="Go, Language"><span>Go</span></li>
        <li id="s4" role="option" aria-label="Exclude props.team"><span>Exclude props.team</span></li>
        <li id="s5" role="option" aria-label="No Property: team, Property: team"><span>No property: team</span></li>
        <li id="s6" role="option" aria-label="Production, Property: environment"><span>Production</span></li>
      </ul>
      <div class="Banner" id="validation">
        <h2><span>Filter contains 2 issues:</span></h2>
        <ul>
          <li><span id="v1">Invalid value <code>foo</code> for <code>visibility</code></span></li>
          <li><span id="v2">Empty value for <code>stars</code></span></li>
        </ul>
      </div>`)
    expect(attribute('#s1', 'aria-label')).toBe('排序，筛选器，结果顺序')
    expect(text('#s1-desc')).toBe('结果顺序')
    expect(attribute('#s2', 'aria-label')).toBe('星标总数（升序），排序')
    expect(text('#s2')).toBe('星标总数（升序）')
    expect(attribute('#s3', 'aria-label')).toBe('Go，语言')
    expect(text('#s3')).toBe('Go')
    expect(text('#s4')).toBe('排除属性：team')
    expect(attribute('#s5', 'aria-label')).toBe('无属性：team，属性：team')
    expect(text('#s5')).toBe('无属性：team')
    expect(attribute('#s6', 'aria-label')).toBe('Production，属性：environment')
    expect(text('#s6')).toBe('Production')
    expect(text('#validation h2')).toBe('筛选器有 2 处错误：')
    expect(text('#v1')).toBe('无效值 foo 用于筛选器 visibility')
    expect(text('#v1 code')).toBe('foo')
    expect(text('#v2')).toBe('以下筛选器的值为空 stars')
  })

  it('高级筛选对话框：一行的列标题、运算符、起止输入框与各控件的 aria-label', () => {
    // 结构按 filter 的高级筛选对话框一行简化（运算符菜单与取值选择框的占位文字一并放入）
    render(`
      <div role="dialog">
        <fieldset>
          <legend><h2 id="row">Row 1</h2></legend>
          <div><span id="qualifier-label">Qualifier</span><button id="qualifier" aria-label="Created, Qualifier 1"><span>Created</span></button></div>
          <div><span id="operator-label">Operator</span><button id="operator" aria-label="between, Operator 1"><span>between</span></button></div>
          <div>
            <span id="value-label">Value</span>
            <input id="from" aria-label="Value 1 From" placeholder="From"><span>-</span><input id="to" aria-label="Value 1 To" placeholder="To">
          </div>
          <button id="delete" aria-label="Delete filter 1: Created, between, 2026-01-01..2026-02-01"></button>
        </fieldset>
        <ul role="listbox">
          <li role="option"><span id="op-is">is</span></li>
          <li role="option"><span id="op-one-of">is not one of</span></li>
          <li role="option"><span id="op-after">after and including</span></li>
        </ul>
        <button id="values"><span>Filter values</span></button>
      </div>`)
    expect(text('#row')).toBe('第 1 行')
    expect(text('#qualifier-label')).toBe('限定符')
    expect(attribute('#qualifier', 'aria-label')).toBe('创建日期，限定符 1')
    expect(text('#qualifier')).toBe('创建日期')
    expect(text('#operator-label')).toBe('运算符')
    expect(attribute('#operator', 'aria-label')).toBe('介于，运算符 1')
    expect(text('#operator')).toBe('介于')
    expect(text('#value-label')).toBe('值')
    expect(attribute('#from', 'placeholder')).toBe('从')
    expect(attribute('#from', 'aria-label')).toBe('值 1 起始')
    expect(attribute('#to', 'placeholder')).toBe('到')
    expect(attribute('#to', 'aria-label')).toBe('值 1 结束')
    expect(attribute('#delete', 'aria-label')).toBe('删除筛选器 1：Created, between, 2026-01-01..2026-02-01')
    expect(text('#op-is')).toBe('是')
    expect(text('#op-one-of')).toBe('不是以下之一')
    expect(text('#op-after')).toBe('晚于或等于')
    expect(text('#values')).toBe('筛选值')
  })

  it('已保存视图编辑：图标与颜色选择器', () => {
    render(`
      <form>
        <label id="icon-label">Icon</label>
        <button id="icon" aria-label="Change icon"></button>
        <div id="color-heading">Color</div>
        <div role="radiogroup" aria-label="Color selection">
          <button id="gray" role="radio" aria-label="Gray color"></button>
        </div>
        <div role="radiogroup" aria-label="Icon selection">
          <button id="bookmark" role="radio" aria-label="Bookmark icon"></button>
        </div>
      </form>`)
    expect(text('#icon-label')).toBe('图标')
    expect(attribute('#icon', 'aria-label')).toBe('更改图标')
    expect(text('#color-heading')).toBe('颜色')
    expect(attribute('[role="radiogroup"]', 'aria-label')).toBe('颜色选择')
    expect(attribute('#gray', 'aria-label')).toBe('灰色')
    expect(attribute('#bookmark', 'aria-label')).toBe('书签图标')
  })
})

describe('组织概述与邀请页', () => {
  // /<组织> 依次套用 common、profile、organization（You can 由 profile 收录）；邀请页只有 common、organization
  const OVERVIEW: readonly PageKey[] = ['common', 'profile', 'organization']
  const INVITATION: readonly PageKey[] = ['common', 'organization']
  const tw = createMatcher(zhTW)
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(html: string, using: typeof full, pages: readonly PageKey[]): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: using, host: window, resolvePages: () => pages })
    translator.start()
  }

  function text(selector: string): string | undefined {
    return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim()
  }

  // 简化结构：链接与前后文字是同一元素的子节点
  const OVERVIEW_HTML = `
    <p id="restore"><a href="#">Get started with tasks</a> that most successful organizations complete.</p>
    <p id="hide">You can <a href="#">hide the tasks we've suggested</a> on this page and bring them back later.</p>
    <div id="tip">
      <h3>You can now follow organizations</h3>
      <p>Organization activity like new discussions, sponsorships, and repositories will appear in <a href="/dashboard">your dashboard feed</a>.</p>
    </div>`

  it.each([
    [
      '简体',
      full,
      [
        '开始完成任务，大多数成功的组织都会完成这些任务。',
        '你可以 隐藏我们推荐的任务，以后还能在此页面重新显示。',
        '现在可以关注组织了',
        '新讨论、赞助和存储库等组织活动将显示在 你的仪表板动态中。'
      ]
    ],
    [
      '繁体',
      tw,
      [
        '開始完成任務，大多數成功的組織都會完成這些任務。',
        '你可以 隱藏我們推薦的任務，之後還能在此頁面重新顯示。',
        '現在可以追蹤組織了',
        '新討論、贊助和儲存庫等組織活動將顯示在 你的儀表板動態中。'
      ]
    ]
  ] as const)('%s：入门任务提示与关注提示框按片段连读，全角逗号前不留空白', (_, using, expected) => {
    render(OVERVIEW_HTML, using, OVERVIEW)
    expect([text('#restore'), text('#hide'), text('#tip h3'), text('#tip p')]).toEqual(expected)
  })

  it.each([
    ['简体', full, '抱歉，octocat 已是 octo-org 的成员。'],
    ['繁体', tw, '抱歉，octocat 已是 octo-org 的成員。']
  ] as const)('%s：邀请页 Sorry, <用户> is already a member of <组织>. 按片段连读，用户名不变', (_, using, expected) => {
    render('<p id="sorry">Sorry, <strong>octocat</strong> is already a member of octo-org.</p>', using, INVITATION)
    expect(text('#sorry')).toBe(expected)
    expect(text('#sorry strong')).toBe('octocat')
  })

  it.each([
    ['We think you’re gonna like it here.', '我們相信你會喜歡這裡。'],
    [
      "We’ve suggested some tasks here in your organization's overview to help you get started.",
      '我們在組織總覽中推薦了一些任務來協助你開始使用。'
    ],
    ['Find people by their GitHub username or email address.', '依 GitHub 使用者名稱或電子郵件地址尋找人員。'],
    ['Set everyone’s base permissions for your code.', '為所有人設定程式碼的基本權限。'],
    ['Enforce certain workflows for one or more branches.', '為一個或多個分支強制執行特定工作流程。'],
    ['Try automatically assigning work with GitHub Actions.', '試試使用 GitHub 動作自動指派工作。'],
    ['Validate your code using a CI workflow.', '使用 CI 工作流程驗證程式碼。'],
    ["This organization doesn't have any repositories that match.", '此組織沒有相符的儲存庫。'],
    ['Loading tasks', '正在載入任務'],
    ['Invite your people', '邀請夥伴'],
    ['See more about collaborative coding', '查看更多協作程式開發內容'],
    ['Automation and CI/CD', '自動化和 CI/CD'],
    ['See more about automation and CI/CD', '查看更多自動化和 CI/CD 內容'],
    ['Discover new GitHub features', '探索 GitHub 新功能'],
    ['See all features', '查看所有功能'],
    ['Client apps', '用戶端應用程式'],
    ['Project management', '專案管理'],
    ['Team administration', '團隊管理'],
    ['OK, got it!', '好，我知道了！']
  ])('繁体：%s → %s', (input, expected) => {
    expect(tw.translate(input, OVERVIEW)).toBe(expected)
  })

  it.each([
    ['Invite your first member', '邀请第一个成员', '邀請第一位成員'],
    ["Customize members' permissions", '自定义成员权限', '自訂成員權限'],
    ['Create a pull request', '创建拉取请求', '建立拉取請求'],
    ['Create a branch protection rule', '创建分支保护规则', '建立分支保護規則'],
    ['Auto-assign new issues', '自动分配新议题', '自動指派新議題'],
    ['Run a continuous integration test', '运行持续集成测试', '執行持續整合測試']
  ])('入门任务名（actions 词典的全局词条）：%s', (input, cn, twText) => {
    expect(full.translate(input, OVERVIEW)).toBe(cn)
    expect(tw.translate(input, OVERVIEW)).toBe(twText)
  })

  it.each(['Client apps', 'Project management', 'Team administration'])('与 actions 入门引导卡片同译：%s', input => {
    const actionsPage: readonly PageKey[] = ['common', 'repository', 'actions']
    expect(full.translate(input, OVERVIEW)).toBeDefined()
    expect(full.translate(input, OVERVIEW)).toBe(full.translate(input, actionsPage))
    expect(tw.translate(input, OVERVIEW)).toBeDefined()
    expect(tw.translate(input, OVERVIEW)).toBe(tw.translate(input, actionsPage))
  })

  it('概述的空状态不被个人主页的正则抢占；片段与邀请页正则不在其他页面生效', () => {
    expect(full.translate('This organization doesn’t have any repositories that match.', OVERVIEW)).toBe('此组织没有匹配的存储库。')
    expect(full.translate('torvalds doesn’t have any repositories that match.', OVERVIEW)).toBe('torvalds 没有匹配的存储库。')
    for (const input of ['Sorry,', 'Loading tasks', 'See all features', 'is already a member of octo-org.']) {
      expect(full.translate(input, ['common', 'repository'])).toBeUndefined()
      expect(tw.translate(input, ['common', 'repository'])).toBeUndefined()
    }
  })
})
