import type { PageDictionary } from '../../../core/types'

/** 智能体会话的状态 */
const SESSION_STATES: Readonly<Record<string, string>> = {
  Working: '工作中',
  'Ready for review': '可供审查',
  Done: '已完成',
  Failed: '失败',
  Idle: '空闲',
  'Needs attention': '需要处理',
  'Timed out': '已超时',
  Cancelled: '已取消',
  Queued: '已排队',
  Unknown: '未知',
  Merged: '已合并',
  Closed: '已关闭',
  'Queued to merge': '已排队等待合并'
}

/** 新版首页的分区名（自定义分区对话框的“更多选项”“显示”按钮） */
const SECTIONS: Readonly<Record<string, string>> = {
  'Agent sessions': '智能体会话',
  'Pull requests': '拉取请求',
  Issues: '议题',
  Repositories: '存储库',
  Feed: '动态'
}

/**
 * 登录后首页 /、/dashboard 的框架与新版首页分区：
 * 仪表板上下文切换、左侧常用存储库与团队、右侧最新变更与探索存储库、
 * 智能体会话 / 拉取请求 / 议题列表、反馈对话框，
 * 旧版首页的仪表板菜单与满意度反馈，组织仪表板的新成员提示。
 * Copilot 输入框见 composer.ts。
 */
export default {
  static: {
    // 仪表板上下文切换
    'Switch dashboard context': '切换仪表板上下文',
    // 新版首页侧栏：上下文区域的读屏名称（切换菜单、常用存储库图标的读屏名称见 scoped）
    'Account context': '帐户上下文',
    'Manage organizations': '管理组织',
    'Create organization': '创建组织',
    'Try the new dashboard experience': '试用新版仪表板',
    'Switch to classic dashboard': '切换到经典仪表板',

    // 新版仪表板侧边栏：主页切换
    'Make Home your homepage': '将首页设为主页',
    'Make Feed your homepage': '将动态设为主页',
    'Pin your homepage': '置顶主页',
    'Choose whether github.com opens to Home or Feed. Select the pin next to either one.':
      '选择 github.com 打开时显示首页还是动态。选择其中一项旁边的置顶图标。',

    // 左侧栏：常用存储库、团队、最近活动
    'Top Repositories': '常用存储库',
    'Your teams': '你的团队',
    'You don’t belong to any teams yet!': '你还不属于任何团队！',
    "You don't belong to any teams yet!": '你还不属于任何团队！',
    'When you take actions across GitHub, we’ll provide links to that activity here.': '你在 GitHub 上的操作会在这里显示链接。',
    'Create your first project': '创建你的第一个项目',
    'Ready to start building? Create a repository for a new idea or bring over an existing repository to keep contributing to it.':
      '准备好开始构建了吗？为新想法创建存储库，或导入现有存储库继续贡献。',

    // 右侧栏：最新变更、探索存储库
    'Latest changes': '最新变更',
    'View changelog →': '查看更新日志 →',
    'Explore repositories': '探索存储库',
    'Explore more →': '探索更多 →',

    // 智能体会话列表
    'Start an agent session to create new work or iterate on an existing project.': '启动智能体会话以开始新工作或迭代现有项目。',
    'No sessions found. Create one by sending a prompt above.': '未找到会话。在上方发送提示即可创建。',
    // 名词 filter → 筛选器（分区菜单里的筛选选项）
    'No sessions found. Try a different filter, or': '未找到会话。请尝试其他筛选器，或',
    'start a session': '开始会话',
    'Unable to load agent tasks, try again later.': '无法加载智能体任务，请稍后重试。',
    'Agent sessions options': '智能体会话选项',
    'Agent sessions to include': '包含的智能体会话',
    'Agent sessions status filter': '智能体会话状态筛选器',
    'Open session in VS Code': '在 VS Code 中打开会话',

    // 拉取请求与议题列表
    'Pull request options': '拉取请求选项',
    'Pull requests to include': '包含的拉取请求',
    'Unable to load pull requests, try again later.': '无法加载拉取请求，请稍后重试。',
    'No pull requests found, try a different filter.': '未找到拉取请求，请尝试其他筛选器。',
    'Open pull request in VS Code': '在 VS Code 中打开拉取请求',
    'Unable to load issues, try again later.': '无法加载议题，请稍后重试。',
    'No issues found, try a different filter.': '未找到议题，请尝试其他筛选器。',
    'Assigned to Copilot': '已分配给 Copilot',
    // 产品名按用户要求译成中文：Copilot Chat → Copilot 聊天（.harvest/scratch/followups/product-names.md）
    'Open in Copilot Chat': '在 Copilot 聊天中打开',
    'Number of results': '结果数量',
    'Maximum age of results': '结果时间范围',
    'No maximum': '不限',

    // 反馈对话框（句末的隐私政策链接与句号单独成节点）
    'Tell us your feedback on the new dashboard experience': '告诉我们你对新版仪表板的反馈',
    'Please don’t include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our':
      '请勿包含敏感、机密或个人数据。你的反馈将用于改进我们的服务，并遵循我们的',

    // 新版首页：分区列表与自定义分区对话框（与议题仪表板的“Customize sections”同译“分区”）
    'Error loading repositories': '存储库加载失败',
    'Issue actions': '议题操作',
    'Hide section': '隐藏分区',
    'At least one section must remain visible': '至少保留一个可见分区',

    // 旧版首页：仪表板菜单、新版预览、满意度反馈对话框
    'Dashboard menu': '仪表板菜单',
    'Dashboard preview options': '仪表板预览选项',
    'Try the new dashboard': '试用新版仪表板',
    'Give dashboard feedback': '提供仪表板反馈',
    'How satisfied are you with this dashboard?': '你对此仪表板的满意度如何？',
    'What can we improve?': '我们可以改进哪些方面？',
    'Thanks for sharing your dashboard feedback.': '感谢你提供仪表板反馈。',
    // 标签页标题段
    'GitHub Dashboard': 'GitHub 仪表板',

    // 组织仪表板：新成员提示（句子被组织名、用户名链接拆开；括号内是用户名，用半角括号）
    'You’ve been added to the': '你已被添加到',
    "You've been added to the": '你已被添加到',
    'Here are some quick tips for a first-time organization member.': '以下是给组织新成员的几条小提示。',
    'Use the switch context button in the upper left corner of this page to switch between your personal context (':
      '使用页面左上角的上下文切换按钮，在你的个人上下文 (',
    ') and organizations you are a member of.': ') 和你所属的组织之间切换。',
    'After you switch contexts you’ll see an organization-focused dashboard that lists out organization repositories and activities.':
      '切换上下文后，你会看到以组织为中心的仪表板，其中列出组织的存储库和活动。',
    "After you switch contexts you'll see an organization-focused dashboard that lists out organization repositories and activities.":
      '切换上下文后，你会看到以组织为中心的仪表板，其中列出组织的存储库和活动。',
    'Go to organization dashboard': '转到组织仪表板',
    'Return to your personal dashboard': '返回个人仪表板',
    'View organization': '查看组织',
    "Browse organization's repositories": '浏览组织的存储库',
    'Browse organization’s repositories': '浏览组织的存储库',
    'See all owners': '查看全部所有者',
    'View your teams': '查看你的团队',
    'View and create teams': '查看和创建团队',
    'Member statuses': '成员状态'
  },
  scoped: {
    // 左侧栏
    'Recent activity': '最近活动',
    'Switch back': '切回旧版',
    // 上下文切换菜单、常用存储库图标的读屏名称
    dashboards: '仪表板',
    Repository: '存储库',

    // 分区列表：“查看全部”后的读屏文字、筛选菜单（分区标题“Agent sessions”、时间范围由全局词条翻译）
    sessions: '会话',
    issues: '议题',
    'pull requests': '拉取请求',
    Active: '进行中',
    Authored: '我创建的',
    Mentioned: '提及我的',
    'Review requested': '请求我审查的',
    Reviewed: '我审查过的',
    'Assigned to me': '分配给我的',
    'Involves me': '与我有关',
    'Issues to include': '包含的议题',
    // 会话时间前缀：Started + <relative-time>
    Started: '开始于',
    // 评论数后的读屏文字
    comment: '条评论',
    comments: '条评论',

    // 旧版首页：满意度评分
    'Very dissatisfied': '非常不满意',
    Dissatisfied: '不满意',
    Satisfied: '满意',
    'Very satisfied': '非常满意',

    // 新版首页：自定义分区对话框（“Assign to Copilot”“Hidden”由全局词条翻译）
    Visible: '已显示',
    'Move up': '上移',
    'Move down': '下移',

    // 组织仪表板：Welcome to the / You’ve been added to the + <组织> + organization!
    'Welcome to the': '欢迎加入',
    'organization!': '组织！'
  },
  regexp: [
    // 上下文切换按钮
    [/^Switch dashboard: (.+)$/, '切换仪表板：$1'],
    // 新版首页侧栏的上下文切换按钮（读屏名称）：Go to octocat dashboard
    [/^Go to (?!(?:the|your|my) )([A-Za-z\d][\w-]*) dashboard$/, '前往 $1 的仪表板'],
    // 拉取请求 / 议题条目说明：owner/repo#12 · Opened by octocat · Updated + <relative-time>
    // 拉取请求与议题条目共用同一模板（IssueListItem / PullRequestListItem），无法区分；
    // 拉取请求的动词 open → 创建（GLOSSARY pull request 行），议题条目随同句一致也作“创建”
    [
      /^(\S+#\d+) · Opened by (\S+) · (Updated|Created)$/,
      (_, ref, author, label) => `${ref} · 由 ${author} 创建 · ${label === 'Updated' ? '更新于' : '创建于'}`
    ],
    // 智能体会话条目说明：<relative-time> · 2 revisions · Ready for review
    [
      /^· (?:([\d,]+) revisions · )?(Working|Ready for review|Done|Failed|Idle|Needs attention|Timed out|Cancelled|Queued|Unknown|Merged|Closed|Queued to merge)$/,
      (_, revisions, state) => `· ${revisions ? `${revisions} 次修订 · ` : ''}${SESSION_STATES[state] ?? state}`
    ],
    [/^(\S+) · Initializing session\.\.\.$/, '$1 · 正在初始化会话...'],
    // 反馈字数
    [/^Please keep your feedback within ([\d,]+) characters or less\.$/, '反馈请控制在 $1 个字符以内。'],
    // 自定义分区对话框：More options for Agent sessions / Show Agent sessions
    [/^More options for (.+)$/, (_, section) => (SECTIONS[section] ? `${SECTIONS[section]}的更多选项` : `${section} 的更多选项`)],
    [new RegExp(`^Show (${Object.keys(SECTIONS).join('|')})$`), (_, section) => `显示${SECTIONS[section] ?? section}`],
    // 组织仪表板
    [/^You[’']re an owner of the (\S+) organization!$/, '你是 $1 组织的所有者！'],
    [/^Create a repository for (\S+)$/, '为 $1 创建存储库'],
    [/^Edit (\S+)[’']s settings$/, '编辑 $1 的设置'],
    [/^Check out (\S+)[’']s public profile$/, '查看 $1 的公开个人资料'],
    // 顶部提示：删除存储库、接受 / 拒绝继任者邀请后跳转到首页
    [/^Your repository ["“]([^"”]+)["”] was successfully deleted\.$/, '存储库“$1”已删除。'],
    [/^You are now the designated successor for @?([\w-]+)[’']s account\.$/, '你已成为 $1 帐户的指定继任者。'],
    [/^You have declined to become the designated successor for @?([\w-]+)[’']s account\.$/, '已拒绝成为 $1 帐户的指定继任者。']
  ],
  ignore: [
    // 分区列表中的议题、拉取请求、会话标题，以及标题截断时显示完整标题的提示框
    'a[class*="ItemTitle__"] [class*="ItemTitleInner__"]',
    'a[class*="ItemTitle__"] + [class*="prc-TooltipV2-Tooltip-"]'
  ]
} satisfies PageDictionary
