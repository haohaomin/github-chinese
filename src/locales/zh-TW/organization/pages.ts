import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/**
 * 组织页：头部与验证徽章、概述（侧栏、已固定的存储库、存储库筛选、入门任务）、人员、团队与团队设置、项目列表、关注者、赞助、见解。
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

/** 人员、团队批量选择：2 members selected…（量词随名词：人用「位」，团队用「個」） */
const SELECTED_KINDS: Readonly<Record<string, string>> = {
  member: '位成員',
  collaborator: '位協作者',
  team: '個團隊'
}

/** 组织见解 Actions 指标：句中的时段（小写） */
const METRIC_PERIODS: Readonly<Record<string, string>> = {
  'current week (mon-sun)': '本週（週一至週日）',
  'current month': '本月',
  'this month': '本月',
  'last month': '上個月',
  'last 30 days': '過去 30 天',
  'last 90 days': '過去 90 天',
  'last year': '去年',
  custom: '自訂範圍'
}

/** 组织见解 Actions 指标：图表说明中的指标 */
const USAGE_METRICS: Readonly<Record<string, string>> = { minutes: '總分鐘數', 'job runs': '作業執行總數' }
const PERFORMANCE_METRICS: Readonly<Record<string, string>> = {
  'Average run time of': '作業的平均執行時間',
  'Average queue time of': '作業的平均佇列時間',
  'Failure rate across': '作業的失敗率',
  'Total minutes used across failed': '失敗作業使用的總分鐘數'
}

/** 时段查表：避免 constructor 等原型链键命中 */
function metricPeriod(text: string): string {
  const key = text.toLowerCase()
  return Object.hasOwn(METRIC_PERIODS, key) ? METRIC_PERIODS[key]! : text
}

export default {
  static: {
    // Copilot 洞察：使用情况指标未启用
    'Copilot impact dashboard info': 'Copilot 影響儀表板資訊',
    'Copilot impact metrics': 'Copilot 影響指標',
    'Graph icon': '圖表圖示',
    'Copilot usage metrics are currently disabled': 'Copilot 使用量指標目前已停用',
    'Enable Copilot usage metrics to measure how Copilot adoption impacts your organization, or ask an admin to enable them.':
      '啟用 Copilot 使用量指標，以衡量 Copilot 的採用對組織的影響，或請管理員啟用。',
    'Manage Copilot usage metrics': '管理 Copilot 使用量指標',
    // 组织概览：头像、公共自述文件提示（「Create a public repository called <code>.github</code>. …」见 inline）
    'Change your organization’s avatar': '變更組織大頭貼',
    'Create Public README': '建立公開讀我檔案',
    'Read documentation': '閱讀文件',
    'Invite Member': '邀請成員',
    'Invite members': '邀請成員',
    'Authenticate your members with SAML single sign-on': '使用 SAML 單一登入驗證成員',
    'dismiss this message': '關閉此訊息',
    // 头部：验证徽章
    "We've verified that the organization": '我們已驗證組織',
    'We’ve verified that the organization': '我們已驗證組織',
    'controls the domain:': '擁有下列網域：',
    'controls the domains:': '擁有下列網域：',
    'Learn more about verified organizations': '瞭解已驗證的組織',
    'GitHub Sponsor': 'GitHub 贊助者',
    // 头部：关注按钮旁的提示框，正文后接链接 your dashboard feed
    'You can now follow organizations': '現在可以追蹤組織了',
    'Organization activity like new discussions, sponsorships, and repositories will appear in': '新討論、贊助和儲存庫等組織活動將顯示在',

    // 概述侧栏
    'View all repositories': '查看所有儲存庫',
    'Top languages': '熱門語言',
    'Most used topics': '最常用的主題',

    // 概述：空状态与已固定的存储库
    'This organization has no repositories.': '此組織沒有儲存庫。',
    'This organization has no public repositories.': '此組織沒有公開儲存庫。',
    'This organization doesn’t have any repositories that match.': '此組織沒有相符的儲存庫。',
    "This organization doesn't have any repositories that match.": '此組織沒有相符的儲存庫。',
    'Edit pinned repositories': '編輯已釘選的儲存庫',
    'Select up to six public, internal, or private repositories you’d like to show only to members of the organization.':
      '最多選取六個僅向組織成員顯示的公開、內部或私人儲存庫。',
    "Select up to six public, internal, or private repositories you'd like to show only to members of the organization.":
      '最多選取六個僅向組織成員顯示的公開、內部或私人儲存庫。',
    'No repositories or gists found.': '找不到儲存庫或程式碼片段。',

    // 概述：成员视角
    'Switch profile context': '切換檢視角度',
    'You’re not a member of any teams in this organization.': '你不是此組織中任何團隊的成員。',
    "You're not a member of any teams in this organization.": '你不是此組織中任何團隊的成員。',
    // <用户> invited you to join the <组织> organization
    'invited you to join the': '邀請你加入',
    'Top discussions this past month': '過去一個月的熱門討論',
    'Set up discussions to engage with your community!': '設定討論來與社群互動！',

    // 概述：新组织的入门任务（欢迎横幅与各任务说明；任务名由 actions/workflows.ts 收录）
    'We think you’re gonna like it here.': '我們相信你會喜歡這裡。',
    "We think you're gonna like it here.": '我們相信你會喜歡這裡。',
    "We’ve suggested some tasks here in your organization's overview to help you get started.":
      '我們在組織總覽中推薦了一些任務來協助你開始使用。',
    'Find people by their GitHub username or email address.': '依 GitHub 使用者名稱或電子郵件地址尋找人員。',
    'Set everyone’s base permissions for your code.': '為所有人設定程式碼的基本權限。',
    'Propose and collaborate on changes to a repository.': '對儲存庫提出變更並共同協作。',
    'Enforce certain workflows for one or more branches.': '為一個或多個分支強制執行特定工作流程。',
    'Try automatically assigning work with GitHub Actions.': '試試使用 GitHub 動作自動指派工作。',
    'Validate your code using a CI workflow.': '使用 CI 工作流程驗證程式碼。',

    // 人员
    'Organization permissions': '組織權限',
    'help for user roles': '使用者角色說明',
    'Find a member…': '尋找成員…',
    "We couldn't find any matching members.": '找不到相符的成員。',
    'We couldn’t find any matching members.': '找不到相符的成員。',
    'Invite member': '邀請成員',
    'Outside collaborators': '外部協作者',
    'Pending collaborators': '待加入的協作者',
    'Pending invitations': '待處理的邀請',
    'Failed invitations': '失敗的邀請',
    'Organization roles': '組織角色',
    'Role management': '角色管理',
    'This organization has no public members. You must be a member to see who’s a part of this organization.':
      '此組織沒有公開的成員。你必須是成員才能查看此組織有哪些人。',
    "This organization has no public members. You must be a member to see who's a part of this organization.":
      '此組織沒有公開的成員。你必須是成員才能查看此組織有哪些人。',

    // 团队
    'New team': '新增團隊',
    'Find a team…': '尋找團隊…',
    'Child teams': '子團隊',
    'Parent team': '父團隊',
    'Add a member': '新增成員',

    // 项目列表
    'Search all projects': '搜尋所有專案',
    'Projects views': '專案檢視',

    // 赞助
    'Current or past sponsorships navigation': '目前或過往贊助導覽',
    'Current or past sponsorships navigation navigation': '目前或過往贊助導覽',
    'Current sponsorships': '目前的贊助',
    'Past sponsorships': '過往的贊助',
    "'s sponsorships": '的贊助',
    '’s sponsorships': '的贊助',
    'No sponsorships': '沒有贊助',
    'No sponsorships to display.': '沒有可顯示的贊助。',
    'No sponsorships match the search.': '沒有相符的贊助。',
    'Explore your dependencies': '探索你的相依項目',
    'Manage sponsorship': '管理贊助',
    'Make Private': '設為不公開',
    'Make Public': '設為公開',
    'Subscribe to email updates': '訂閱電子郵件更新',
    'Unsubscribe from emails': '取消訂閱電子郵件',
    'Re-sponsor': '再次贊助',
    'Export as CSV': '匯出為 CSV',
    'Export sponsorships': '匯出贊助',
    'Start export': '開始匯出',
    "We'll start the export process and email you at": '我們將開始匯出並在完成後將匯出檔案寄到',
    "with the export attached when it's done. Update your": '。可更新你的',
    'contact email settings': '聯絡電子郵件設定',
    'to change where the file is sent.': '以變更檔案的寄送地址。',
    'There was a problem exporting your sponsorships.': '匯出贊助時發生問題。',
    'There was a problem updating your sponsorship': '更新贊助時發生問題',

    // 成员视角切换
    'View as:': '檢視角度：',
    'You are viewing the README and pinned repositories as a public user.': '你正以公開使用者的身分查看讀我檔案和已釘選的儲存庫。'
  },
  scoped: {
    // 人员页导出按钮的进行状态、主题页空状态
    Exporting: '匯出中',
    'No repositories': '暫無儲存庫',
    // 存储库筛选（与 profile 词典一致）
    Type: '類型',
    'Last updated': '上次更新',
    Other: '其他',
    // 概述：You can <create a README file> or <pin repositories> visible to anyone.
    'create a README file': '建立讀我檔案',
    'pin repositories': '釘選儲存庫',
    'visible to anyone.': '供所有人查看。',
    'visible only to members of the organization.': '僅供組織成員查看。',
    Import: '匯入',
    'Invite someone': '邀請他人',
    // <组织> doesn’t have any pinned public repositories yet.
    'doesn’t have any pinned public repositories yet.': '尚未釘選任何公開儲存庫。',
    "doesn't have any pinned public repositories yet.": '尚未釘選任何公開儲存庫。',
    // 概述：隐藏入门任务后的提示（<Get started with tasks> that most …；You can <hide …> on this page …），
    // 句尾片段以全角逗号起句，前面的空白不保留
    'Get started with tasks': '開始完成任務',
    'that most successful organizations complete.': '，大多數成功的組織都會完成這些任務。',
    "hide the tasks we've suggested": '隱藏我們推薦的任務',
    'on this page and bring them back later.': '，之後還能在此頁面重新顯示。',
    // 概述：入门任务列表的加载占位、分组标题与查看更多链接
    'Loading tasks': '正在載入任務',
    'Invite your people': '邀請夥伴',
    'See more about collaborative coding': '查看更多協作程式開發內容',
    'Automation and CI/CD': '自動化和 CI/CD',
    'See more about automation and CI/CD': '查看更多自動化和 CI/CD 內容',
    'Discover new GitHub features': '探索 GitHub 新功能',
    'See all features': '查看所有功能',
    // 「探索 GitHub 新功能」分组的功能链接（与 actions/workflows.ts 一致；Community 由通用词典收录）
    'Client apps': '用戶端應用程式',
    'Project management': '專案管理',
    'Team administration': '團隊管理',
    // 头部提示框正文的链接：… will appear in <your dashboard feed>；关闭按钮（与讨论页同译）
    'your dashboard feed': '你的儀表板動態中',
    'OK, got it!': '好，我知道了！',
    // 概述：讨论
    'Turn on discussions': '啟用討論',
    'Nothing to see here yet!': '尚無內容！',
    'Discussions are for sharing announcements, creating conversation in your community, answering questions, and more.':
      '討論可用來發布公告、在社群中交流、回答問題等。',
    // 人员与团队
    People: '人員',
    Members: '成員',
    Export: '匯出',
    Visible: '可見',
    Secret: '祕密',
    Source: '來源',
    Requests: '請求',
    'Invite a member to': '邀請成員加入',
    // 邀请页：Sorry, <用户> is already a member of <组织>.（后半句由正则翻译）
    'Sorry,': '抱歉，',
    'Search users': '搜尋使用者',
    'Start date': '開始日期',
    Amount: '金額',
    // 团队设置页
    General: '一般',
    // OAuth 应用访问申请页（/orgs/<组织>/policies/applications/<id>，与 settings-developer 一致）
    'Organization access': '組織存取權',
    'Currently:': '目前：',
    'Grant access': '授予存取權',
    'Deny access': '拒絕存取',
    // 赞助摘要片段：<组织> has <1> current sponsorship and <248> past sponsorships
    has: '有',
    'current sponsorship': '個目前的贊助',
    'current sponsorships': '個目前的贊助',
    'current sponsorship and': '個目前的贊助和',
    'current sponsorships and': '個目前的贊助和',
    'past sponsorship': '個過往的贊助',
    'past sponsorships': '個過往的贊助',
    // 项目列表（组织项目页与个人主页的项目标签页）
    'No open projects': '沒有開放中的專案',
    'Project closed.': '專案已關閉。',
    'Project reopened.': '專案已重新開啟。',
    'Make a copy': '建立副本',
    'More project options': '更多專案選項',
    'Select an owner': '選擇擁有者',
    // 见解：依赖项
    'My organizations': '我的組織',
    'Open security advisories': '未解決的安全性公告',
    Licenses: '授權條款',
    Unknown: '未知',
    // 见解：Actions 使用情况 / 性能指标（列名等由 actions 词典的 static 收录）
    Metrics: '指標',
    Range: '範圍',
    'Range:': '範圍：',
    'Enter a number': '輸入數字',
    'equal to': '等於',
    'greater than': '大於',
    'less than': '小於',
    'greater than or equal to': '大於或等於',
    'less than or equal to': '小於或等於',
    Workflow: '工作流程',
    Job: '作業',
    Jobs: '作業',
    hosted: '代管',
    'hosted-larger': '較大型代管'
  },
  regexp: [
    // 人员：角色数、更改角色确认；新建团队：父团队搜索结果（读屏）
    [/^(\d+) roles?$/, '$1 個角色'],
    [/^Change the role of (\d[\d,]*) members?\?$/, '要變更 $1 位成員的角色嗎？'],
    [/^Change the role of ([\w.-]+)\?$/, '要變更 $1 的角色嗎？'],
    [/^Search teams, Found (\d+) teams?$/, '搜尋團隊，找到 $1 個團隊'],
    // 主题页（/orgs/<组织>/topics）：可设置主题的存储库
    [/^([\w.-]+) repositories you contribute to$/, '你參與貢獻的 $1 儲存庫'],
    [
      /^There are no repositories in ([\w.-]+) that you[\u2019']ve contributed to and that you can set topics on\.$/,
      '$1 中沒有你參與貢獻且可設定主題的儲存庫。'
    ],
    // 创建组织后的邀请页：Welcome to <组织>
    [/^Welcome to ([\w.-]+)$/, '歡迎來到 $1'],
    // 头部与存储库条目的「Label: Verified」「Label: Public」由 common-ui 的通用规则翻译
    // 关注者页标题
    [/^Users following ([\w.-]+)$/, '追蹤 $1 的使用者'],
    // 关注者列表中的关注按钮（个人主页关注者标签页、组织关注者页）
    [/^Follow ([\w-]+)$/, '追蹤 $1'],
    [/^Unfollow ([\w-]+)$/, '取消追蹤 $1'],

    // 概述：存储库列表
    [/^Showing (\d[\d,]*) of (\d[\d,]*) repositor(?:y|ies)$/, '顯示 $2 個儲存庫中的 $1 個'],
    [/^\((\d[\d,]*) issues? needs? help\)$/, '（$1 個議題需要協助）'],
    [/^([\w.-]+) doesn[’']t have any pinned public repositories yet\.$/, '$1 尚未釘選任何公開儲存庫。'],

    // 项目列表
    [new RegExp(`^${OWNER} projects$`), '$1 的專案'],
    [/^#(\d+) updated$/, '#$1 更新於'],
    [/^Your project ["“](.+)["”] was successfully deleted\.$/, '專案「$1」已刪除。'],

    // 人员 / 团队计数
    [/^(\d[\d,]*) teams?$/, '$1 個團隊'],
    [/^(\d[\d,]*) (?:people|person) in the ([\w.-]+) organization$/, '$2 組織中的 $1 人'],
    [/^(\d[\d,]*) security managers? in the ([\w.-]+) organization$/, '$2 組織中的 $1 位安全性管理員'],
    [/^(\d[\d,]*) teams? in the ([\w.-]+) organization$/, '$2 組織中的 $1 個團隊'],
    [/^(\d[\d,]*) child team members?$/, '$1 位子團隊成員'],
    // 团队同步不一致页标题
    [/^(\d[\d,]*) group members? not in team$/, '$1 位群組成員不在團隊中'],
    [/^(\d[\d,]*) team members? not in group$/, '$1 位團隊成員不在群組中'],
    [
      /^(\d[\d,]*) (member|collaborator|team)s? selected(…|\.\.\.)?$/,
      (_, count: string, kind: string, ellipsis?: string) => `已選取 ${count} ${SELECTED_KINDS[kind] ?? kind}${ellipsis ?? ''}`
    ],

    // 人员：邀请、转换、移除、公开成员身份
    [
      new RegExp(
        `^You['’]ve invited ${LOGIN} to ([\\w.-]+)!( They['’]ll be receiving an email shortly\\.)?(?: They can also visit (\\S+) to accept the invitation\\.)?$`
      ),
      (_, login: string, org: string, mail?: string, url?: string) =>
        `已邀請 ${login} 加入 ${org}！${mail ? '對方很快就會收到電子郵件。' : ''}${url ? `對方也可以造訪 ${url} 接受邀請。` : ''}`
    ],
    [/^Invite a member to ([\w.-]+)$/, '邀請成員加入 $1'],
    [new RegExp(`^Invite ${LOGIN} to ([\\w.-]+)$`), '邀請 $1 加入 $2'],
    [/^Cancel invitation from @?([\w-]+)$/, '取消 $1 的邀請'],
    [new RegExp(`^Invited (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '邀請')],
    [/^You['’]ve successfully updated @?([\w-]+)['’]s invitation\.$/, '已更新 $1 的邀請。'],
    [
      /^You['’]ve canceled (\d[\d,]*) invitations? from ([\w.-]+)\. It may take a few minutes to process\.$/,
      '已取消 $2 的 $1 個邀請。處理可能需要幾分鐘。'
    ],
    [/^You are now a member of ([\w.-]+)!$/, '你已成為 $1 的成員！'],
    // 邀请页：Sorry, <strong>octocat</strong> is already a member of octo-org.（用户名在前一个元素里）
    [/^is already a member of ([\w.-]+)\.$/, '已是 $1 的成員。'],
    [
      new RegExp(`^Convert (?:(\\d[\\d,]*) members?|${LOGIN}) to (?:an )?outside collaborators?\\?$`),
      (_, count?: string, login?: string) => (count ? `要將 ${count} 位成員轉換為外部協作者嗎？` : `要將 ${login} 轉換為外部協作者嗎？`)
    ],
    // 组织名可能在下一个元素里：Removing 2 members from <strong>octo-org</strong>
    [
      /^Removing (\d[\d,]*) members? from(?: ([\w.-]+))?$/,
      (_, count: string, org?: string) => `將 ${count} 位成員移出${org ? ` ${org}` : ''}`
    ],
    [
      /^You (publicized|concealed) (\d[\d,]*) memberships?\.$/,
      (_, action: string, count: string) => `你已${action === 'publicized' ? '公開' : '隱藏'} ${count} 個成員身分。`
    ],

    // 赞助
    [/^Who ([\w.-]+) is sponsoring$/, '$1 贊助的帳號'],
    [/^([\w.-]+)[’']s sponsorships$/, '$1 的贊助'],

    // 成员视角切换
    [/^View as: (Public|Member)$/, (_, role) => `檢視角度：${role === 'Member' ? '成員' : '公開'}`],
    [
      /^You are viewing the README and pinned repositories as a member of the ([\w.-]+) organization\.$/,
      '你正以 $1 組織成員的身分查看讀我檔案和已釘選的儲存庫。'
    ],

    // 见解：Actions 使用情况 / 性能指标的图表说明
    [/^Showing data from (\d{4}\/\d{1,2}\/\d{1,2}) to$/, '資料期間 $1 至'],
    [
      /^Total (minutes|job runs) across all workflows in this organization for (.+)$/,
      (_, metric: string, period: string) => `此組織所有工作流程${metricPeriod(period)}的${USAGE_METRICS[metric] ?? metric}`
    ],
    [
      new RegExp(`^(${Object.keys(PERFORMANCE_METRICS).join('|')}) jobs in this organization for (.+)$`),
      (_, metric: string, period: string) => `此組織${metricPeriod(period)}${PERFORMANCE_METRICS[metric] ?? metric}`
    ],

    // 标签页标题：vuejs repositories
    [new RegExp(`^${OWNER} repositories$`), '$1 的儲存庫']
  ],
  ignore: [
    // 组织名、描述（所在地由全局忽略规则处理）
    '.orghead h1',
    '.orghead .flex-1 > .color-fg-muted',
    // 关注者列表中的简介、公司、所在地（赞助标签页的赞助时间是 span，照常翻译）
    '.d-table.table-fixed .d-table-cell .color-fg-muted.text-small:not(span)',
    // 页头面包屑首项的组织名；只取链接；href 限相对路径
    'header.GlobalNav li:first-child > a[class*="contextCrumb__"][href^="/"]'
  ],
  inline: [
    [
      "Create a public repository called {}. Once created, add a {}. The README will appear on your organization's profile, visible to anyone.",
      '建立名為 {} 的公開儲存庫。建立後新增 {}。讀我檔案將顯示在組織的個人檔案中，所有人皆可看到。'
    ]
  ]
} satisfies PageDictionary
