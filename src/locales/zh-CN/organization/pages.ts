import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/**
 * 组织页：头部与验证徽章、概述（侧栏、置顶存储库、存储库筛选、入门任务）、人员、团队与团队设置、项目列表、关注者、赞助、洞察。
 * React 存储库列表见 repos-list.ts、repos-filter.ts。
 */

/**
 * 「<组织> repositories / projects」中的组织名：排除计数（3、1.2k）、首字母大写的英文单词与常见小写修饰词，
 * 避免把「3 repositories」「No repositories」「Popular repositories」「pin repositories」之类当成组织名
 */
const OWNER =
  '(?!(?:\\d[\\d,.]*[kKmM]?|[A-Z][a-z]*|no|all|any|some|more|other|public|private|internal|archived|forked|popular|starred|pinned|pin|your|my|recent|related|matching|open|closed) )([\\w.-]+)'

/** 人员页句子中的用户名：可带 @，排除 a / members / people 等普通单词 */
const LOGIN = '@?((?!(?:a|an|the|members?|people|someone|users?|collaborators?) )[\\w-]+)'

/** 人员、团队批量选择：2 members selected… */
const SELECTED_KINDS: Readonly<Record<string, string>> = {
  member: '个成员',
  collaborator: '个协作者',
  team: '个团队'
}

/** 组织洞察 Actions 指标：句中的时段（小写） */
const METRIC_PERIODS: Readonly<Record<string, string>> = {
  'current week (mon-sun)': '本周（周一至周日）',
  'current month': '本月',
  'this month': '本月',
  'last month': '上个月',
  'last 30 days': '过去 30 天',
  'last 90 days': '过去 90 天',
  'last year': '去年',
  custom: '自定义时段'
}

/** 组织洞察 Actions 指标：图表说明中的指标 */
const USAGE_METRICS: Readonly<Record<string, string>> = { minutes: '总分钟数', 'job runs': '作业运行总数' }
const PERFORMANCE_METRICS: Readonly<Record<string, string>> = {
  'Average run time of': '作业的平均运行时间',
  'Average queue time of': '作业的平均排队时间',
  'Failure rate across': '作业的失败率',
  'Total minutes used across failed': '失败作业使用的总分钟数'
}

/** 时段查表：避免 constructor 等原型链键命中 */
function metricPeriod(text: string): string {
  const key = text.toLowerCase()
  return Object.hasOwn(METRIC_PERIODS, key) ? METRIC_PERIODS[key]! : text
}

export default {
  static: {
    // 头部：验证徽章
    "We've verified that the organization": '我们已验证组织',
    'We’ve verified that the organization': '我们已验证组织',
    'controls the domain:': '拥有以下域：',
    'controls the domains:': '拥有以下域：',
    'Learn more about verified organizations': '了解已验证组织',
    'GitHub Sponsor': 'GitHub 赞助者',
    // 头部：关注按钮旁的提示框，正文后接链接 your dashboard feed
    'You can now follow organizations': '现在可以关注组织了',
    'Organization activity like new discussions, sponsorships, and repositories will appear in': '新讨论、赞助和存储库等组织活动将显示在',

    // 概述侧栏
    'View all repositories': '查看所有存储库',
    'Top languages': '热门语言',
    'Most used topics': '最常用的主题',

    // 概述：空状态与置顶存储库
    'This organization has no repositories.': '此组织没有存储库。',
    'This organization has no public repositories.': '此组织没有公共存储库。',
    'This organization doesn’t have any repositories that match.': '此组织没有匹配的存储库。',
    "This organization doesn't have any repositories that match.": '此组织没有匹配的存储库。',
    'Edit pinned repositories': '编辑置顶存储库',
    'Select up to six public, internal, or private repositories you’d like to show only to members of the organization.':
      '最多选择六个仅向组织成员展示的公共、内部或专用存储库。',
    "Select up to six public, internal, or private repositories you'd like to show only to members of the organization.":
      '最多选择六个仅向组织成员展示的公共、内部或专用存储库。',
    'No repositories or gists found.': '未找到存储库或代码片段。',

    // 概述：成员视角
    'Switch profile context': '切换个人资料视角',
    'You’re not a member of any teams in this organization.': '你不是此组织中任何团队的成员。',
    "You're not a member of any teams in this organization.": '你不是此组织中任何团队的成员。',
    // <用户> invited you to join the <组织> organization
    'invited you to join the': '邀请你加入',
    'Top discussions this past month': '过去一个月的热门讨论',
    'Set up discussions to engage with your community!': '设置讨论来与社区互动！',

    // 概述：新组织的入门任务（欢迎横幅与各任务说明；任务名由 actions/workflows.ts 收录）
    'We think you’re gonna like it here.': '我们相信你会喜欢这里。',
    "We think you're gonna like it here.": '我们相信你会喜欢这里。',
    "We’ve suggested some tasks here in your organization's overview to help you get started.":
      '我们在组织概述中推荐了一些任务来帮助你上手。',
    'Find people by their GitHub username or email address.': '按 GitHub 用户名或电子邮件地址查找人员。',
    'Set everyone’s base permissions for your code.': '为所有人设置代码的基本权限。',
    'Propose and collaborate on changes to a repository.': '对存储库提出更改并共同协作。',
    'Enforce certain workflows for one or more branches.': '为一个或多个分支强制实施特定工作流。',
    'Try automatically assigning work with GitHub Actions.': '试试使用 GitHub 操作自动分配工作。',
    'Validate your code using a CI workflow.': '使用 CI 工作流验证代码。',

    // 人员
    'Organization permissions': '组织权限',
    'help for user roles': '用户角色帮助',
    'Find a member…': '查找成员…',
    "We couldn't find any matching members.": '未找到匹配的成员。',
    'We couldn’t find any matching members.': '未找到匹配的成员。',
    'Invite member': '邀请成员',
    'Outside collaborators': '外部协作者',
    'Pending collaborators': '待定协作者',
    'Pending invitations': '待定邀请',
    'Failed invitations': '失败的邀请',
    'Organization roles': '组织角色',
    'Role management': '角色管理',
    'This organization has no public members. You must be a member to see who’s a part of this organization.':
      '此组织没有公开成员。只有成员才能查看此组织的成员。',
    "This organization has no public members. You must be a member to see who's a part of this organization.":
      '此组织没有公开成员。只有成员才能查看此组织的成员。',

    // 团队
    'New team': '新建团队',
    'Find a team…': '查找团队…',
    'Child teams': '子团队',
    'Parent team': '父团队',
    'Add a member': '添加成员',

    // 项目列表
    'Search all projects': '搜索所有项目',
    'Projects views': '项目视图',

    // 赞助
    'Current or past sponsorships navigation': '当前或过往赞助导航',
    'Current or past sponsorships navigation navigation': '当前或过往赞助导航',
    'Current sponsorships': '当前赞助',
    'Past sponsorships': '过往赞助',
    "'s sponsorships": '的赞助',
    '’s sponsorships': '的赞助',
    'No sponsorships': '暂无赞助',
    'No sponsorships to display.': '暂无可显示的赞助。',
    'No sponsorships match the search.': '没有匹配的赞助。',
    'Explore your dependencies': '探索你的依赖项',
    'Manage sponsorship': '管理赞助',
    'Make Private': '设为私密',
    'Make Public': '设为公开',
    'Subscribe to email updates': '订阅电子邮件更新',
    'Unsubscribe from emails': '取消订阅电子邮件',
    'Re-sponsor': '再次赞助',
    'Export as CSV': '导出为 CSV',
    'Export sponsorships': '导出赞助',
    'Start export': '开始导出',
    "We'll start the export process and email you at": '我们将开始导出并在完成后把导出文件发送到',
    "with the export attached when it's done. Update your": '。可更新',
    'contact email settings': '联系电子邮件设置',
    'to change where the file is sent.': '以更改文件的发送地址。',
    'There was a problem exporting your sponsorships.': '导出赞助时出现问题。',
    'There was a problem updating your sponsorship': '更新赞助时出现问题',

    // 成员视角切换
    'View as:': '查看身份：',
    'You are viewing the README and pinned repositories as a public user.': '你正以公开用户身份查看自述文件和置顶存储库。'
  },
  scoped: {
    // 存储库筛选（与 profile 词典一致）
    Type: '类型',
    'Last updated': '最后更新',
    Other: '其他',
    // 概述：You can <create a README file> or <pin repositories> visible to anyone.
    'create a README file': '创建自述文件',
    'pin repositories': '置顶存储库',
    'visible to anyone.': '对所有人可见。',
    'visible only to members of the organization.': '仅对组织成员可见。',
    Import: '导入',
    'Invite someone': '邀请他人',
    // <组织> doesn’t have any pinned public repositories yet.
    'doesn’t have any pinned public repositories yet.': '还没有置顶的公共存储库。',
    "doesn't have any pinned public repositories yet.": '还没有置顶的公共存储库。',
    // 概述：隐藏入门任务后的提示（<Get started with tasks> that most …；You can <hide …> on this page …），
    // 句尾片段以全角逗号起句，前面的空白不保留
    'Get started with tasks': '开始完成任务',
    'that most successful organizations complete.': '，大多数成功的组织都会完成这些任务。',
    "hide the tasks we've suggested": '隐藏我们推荐的任务',
    'on this page and bring them back later.': '，以后还能在此页面重新显示。',
    // 概述：入门任务列表的加载占位、分组标题与查看更多链接
    'Loading tasks': '正在加载任务',
    'Invite your people': '邀请伙伴',
    'See more about collaborative coding': '查看更多协作编码内容',
    'Automation and CI/CD': '自动化和 CI/CD',
    'See more about automation and CI/CD': '查看更多自动化和 CI/CD 内容',
    'Discover new GitHub features': '探索 GitHub 新功能',
    'See all features': '查看所有功能',
    // 「探索 GitHub 新功能」分组的功能链接（与 actions/workflows.ts 一致；Community 由通用词典收录）
    'Client apps': '客户端应用',
    'Project management': '项目管理',
    'Team administration': '团队管理',
    // 头部提示框正文的链接：… will appear in <your dashboard feed>；关闭按钮（与讨论页同译）
    'your dashboard feed': '你的仪表板动态中',
    'OK, got it!': '好的，知道了！',
    // 概述：讨论
    'Turn on discussions': '开启讨论',
    'Nothing to see here yet!': '暂无内容！',
    'Discussions are for sharing announcements, creating conversation in your community, answering questions, and more.':
      '讨论用于发布公告、在社区中交流、回答问题等。',
    // 人员与团队
    People: '人员',
    Members: '成员',
    Export: '导出',
    Visible: '可见',
    Secret: '机密',
    Source: '来源',
    Requests: '申请',
    'Invite a member to': '邀请成员加入',
    // 邀请页：Sorry, <用户> is already a member of <组织>.（后半句由正则翻译）
    'Sorry,': '抱歉，',
    'Search users': '搜索用户',
    'Start date': '开始日期',
    Amount: '金额',
    // 团队设置页
    General: '常规',
    // OAuth 应用访问申请页（/orgs/<组织>/policies/applications/<id>，与 settings-developer 一致）
    'Organization access': '组织访问权限',
    'Currently:': '当前：',
    'Grant access': '授予访问权限',
    'Deny access': '拒绝访问',
    // 赞助摘要片段：<组织> has <1> current sponsorship and <248> past sponsorships
    has: '有',
    'current sponsorship': '个当前赞助',
    'current sponsorships': '个当前赞助',
    'current sponsorship and': '个当前赞助和',
    'current sponsorships and': '个当前赞助和',
    'past sponsorship': '个过往赞助',
    'past sponsorships': '个过往赞助',
    // 项目列表（组织项目页与个人主页的项目标签页）
    'No open projects': '没有打开的项目',
    'Project closed.': '项目已关闭。',
    'Project reopened.': '项目已重新打开。',
    'Make a copy': '创建副本',
    'More project options': '更多项目选项',
    'Select an owner': '选择所有者',
    // 洞察：依赖项
    'My organizations': '我的组织',
    'Open security advisories': '打开的安全公告',
    Licenses: '许可证',
    Unknown: '未知',
    // 洞察：Actions 使用情况 / 性能指标（列名等由 actions 词典的 static 收录）
    Metrics: '指标',
    Range: '范围',
    'Range:': '范围：',
    'Enter a number': '输入数字',
    'equal to': '等于',
    'greater than': '大于',
    'less than': '小于',
    'greater than or equal to': '大于或等于',
    'less than or equal to': '小于或等于',
    Workflow: '工作流',
    Job: '作业',
    Jobs: '作业',
    hosted: '托管',
    'hosted-larger': '更大的托管'
  },
  regexp: [
    // 头部与存储库条目的「Label: Verified」「Label: Public」由 common-ui 的通用规则翻译
    // 关注者页标题
    [/^Users following ([\w.-]+)$/, '关注 $1 的用户'],
    // 关注者列表中的关注按钮（个人主页关注者标签页、组织关注者页）
    [/^Follow ([\w-]+)$/, '关注 $1'],
    [/^Unfollow ([\w-]+)$/, '取消关注 $1'],

    // 概述：存储库列表
    [/^Showing (\d[\d,]*) of (\d[\d,]*) repositor(?:y|ies)$/, '显示 $2 个存储库中的 $1 个'],
    [/^\((\d[\d,]*) issues? needs? help\)$/, '（$1 个议题需要帮助）'],
    [/^([\w.-]+) doesn[’']t have any pinned public repositories yet\.$/, '$1 还没有置顶的公共存储库。'],

    // 项目列表
    [new RegExp(`^${OWNER} projects$`), '$1 的项目'],
    [/^#(\d+) updated$/, '#$1 更新于'],
    [/^Your project ["“](.+)["”] was successfully deleted\.$/, '项目“$1”已删除。'],

    // 人员 / 团队计数
    [/^(\d[\d,]*) teams?$/, '$1 个团队'],
    [/^(\d[\d,]*) (?:people|person) in the ([\w.-]+) organization$/, '$2 组织中的 $1 个成员'],
    [/^(\d[\d,]*) security managers? in the ([\w.-]+) organization$/, '$2 组织中的 $1 个安全管理员'],
    [/^(\d[\d,]*) teams? in the ([\w.-]+) organization$/, '$2 组织中的 $1 个团队'],
    [/^(\d[\d,]*) child team members?$/, '$1 个子团队成员'],
    // 团队同步不一致页标题
    [/^(\d[\d,]*) group members? not in team$/, '$1 个组成员不在团队中'],
    [/^(\d[\d,]*) team members? not in group$/, '$1 个团队成员不在组中'],
    [
      /^(\d[\d,]*) (member|collaborator|team)s? selected(…|\.\.\.)?$/,
      (_, count: string, kind: string, ellipsis?: string) => `已选择 ${count} ${SELECTED_KINDS[kind] ?? kind}${ellipsis ?? ''}`
    ],

    // 人员：邀请、转换、移除、公开成员身份
    [
      new RegExp(
        `^You['’]ve invited ${LOGIN} to ([\\w.-]+)!( They['’]ll be receiving an email shortly\\.)?(?: They can also visit (\\S+) to accept the invitation\\.)?$`
      ),
      (_, login: string, org: string, mail?: string, url?: string) =>
        `已邀请 ${login} 加入 ${org}！${mail ? '对方很快会收到电子邮件。' : ''}${url ? `对方也可以访问 ${url} 接受邀请。` : ''}`
    ],
    [/^Invite a member to ([\w.-]+)$/, '邀请成员加入 $1'],
    [new RegExp(`^Invite ${LOGIN} to ([\\w.-]+)$`), '邀请 $1 加入 $2'],
    [/^Cancel invitation from @?([\w-]+)$/, '取消 $1 的邀请'],
    [new RegExp(`^Invited (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '邀请')],
    [/^You['’]ve successfully updated @?([\w-]+)['’]s invitation\.$/, '已更新 $1 的邀请。'],
    [
      /^You['’]ve canceled (\d[\d,]*) invitations? from ([\w.-]+)\. It may take a few minutes to process\.$/,
      '已取消 $2 的 $1 个邀请。处理可能需要几分钟。'
    ],
    [/^You are now a member of ([\w.-]+)!$/, '你已成为 $1 的成员！'],
    // 邀请页：Sorry, <strong>octocat</strong> is already a member of octo-org.（用户名在前一个元素里）
    [/^is already a member of ([\w.-]+)\.$/, '已是 $1 的成员。'],
    [
      new RegExp(`^Convert (?:(\\d[\\d,]*) members?|${LOGIN}) to (?:an )?outside collaborators?\\?$`),
      (_, count?: string, login?: string) => (count ? `要将 ${count} 个成员转换为外部协作者吗？` : `要将 ${login} 转换为外部协作者吗？`)
    ],
    // 组织名可能在下一个元素里：Removing 2 members from <strong>octo-org</strong>
    [
      /^Removing (\d[\d,]*) members? from(?: ([\w.-]+))?$/,
      (_, count: string, org?: string) => `将 ${count} 个成员移出${org ? ` ${org}` : ''}`
    ],
    [
      /^You (publicized|concealed) (\d[\d,]*) memberships?\.$/,
      (_, action: string, count: string) => `你已${action === 'publicized' ? '公开' : '隐藏'} ${count} 个成员身份。`
    ],

    // 赞助
    [/^Who ([\w.-]+) is sponsoring$/, '$1 赞助的对象'],
    [/^([\w.-]+)[’']s sponsorships$/, '$1 的赞助'],

    // 成员视角切换
    [/^View as: (Public|Member)$/, (_, role) => `查看身份：${role === 'Member' ? '成员' : '公开'}`],
    [
      /^You are viewing the README and pinned repositories as a member of the ([\w.-]+) organization\.$/,
      '你正以 $1 组织成员的身份查看自述文件和置顶存储库。'
    ],

    // 洞察：Actions 使用情况 / 性能指标的图表说明
    [/^Showing data from (\d{4}\/\d{1,2}\/\d{1,2}) to$/, '数据时段 $1 至'],
    [
      /^Total (minutes|job runs) across all workflows in this organization for (.+)$/,
      (_, metric: string, period: string) => `此组织所有工作流${metricPeriod(period)}的${USAGE_METRICS[metric] ?? metric}`
    ],
    [
      new RegExp(`^(${Object.keys(PERFORMANCE_METRICS).join('|')}) jobs in this organization for (.+)$`),
      (_, metric: string, period: string) => `此组织${metricPeriod(period)}${PERFORMANCE_METRICS[metric] ?? metric}`
    ],

    // 标签页标题：vuejs repositories
    [new RegExp(`^${OWNER} repositories$`), '$1 的存储库']
  ],
  ignore: [
    // 组织名、描述（所在地由全局忽略规则处理）
    '.orghead h1',
    '.orghead .flex-1 > .color-fg-muted',
    // 关注者列表中的简介、公司、所在地（赞助标签页的赞助时间是 span，照常翻译）
    '.d-table.table-fixed .d-table-cell .color-fg-muted.text-small:not(span)',
    // 页头面包屑首项的组织名；只取链接；href 限相对路径
    'header.GlobalNav li:first-child > a[class*="contextCrumb__"][href^="/"]'
  ]
} satisfies PageDictionary
