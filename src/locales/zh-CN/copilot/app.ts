import type { PageDictionary } from '../../../core/types'
import { COPILOT_PLANS, copilotPlan } from './plans'

/**
 * Copilot 应用外壳：侧栏导航、GitHub Copilot 应用的下载与唤起、智能体首页（/copilot/agents）与存储库智能体页、
 * 存储库智能体页与停靠面板会话历史的筛选、智能体推广提示、拉取请求中的编码智能体会话，以及 Copilot 页通用的单个词。
 * 外壳与停靠面板在各页面复用，整句放 static；单个通用词放 scoped，只在 Copilot 页生效。
 */
export default {
  static: {
    // 侧栏
    'Copilot navigation': 'Copilot 导航',
    'Agent management': '智能体管理',
    // 侧栏会话列表的标题、议题页的智能体会话面板
    'Agent sessions': '智能体会话',
    'Agent session': '智能体会话',

    // GitHub Copilot 应用：侧栏入口、下载菜单、唤起状态
    'The GitHub Copilot app': 'GitHub Copilot 应用',
    'The GitHub Copilot app, New': 'GitHub Copilot 应用，新功能',
    'GitHub Copilot App': 'GitHub Copilot 应用',
    'An agent-driven desktop experience built natively on GitHub.': '原生构建于 GitHub、由智能体驱动的桌面体验。',
    'Choose a GitHub Copilot app download': '选择要下载的 GitHub Copilot 应用',
    'Download GitHub Copilot app (opens in new tab)': '下载 GitHub Copilot 应用（在新标签页中打开）',
    'More download options': '更多下载选项',
    'Opening GitHub Copilot app': '正在打开 GitHub Copilot 应用',
    'GitHub Copilot app did not open. Use Open the app to retry or Download to install.':
      'GitHub Copilot 应用未打开。单击打开应用以重试，或单击下载以安装。',

    // 智能体首页：<Copilot 云端智能体> 处理……（产品名、功能名、方案名按 product-names.md 译出）
    'handles routine tasks so you can focus on core work': '处理日常任务让你专注于核心工作',
    'Save time by offloading testing, dependency upgrades, migrations and maintenance to agents. Create pull requests from Copilot Chat, CLI, IDEs or assign an Issue to Copilot to get started.':
      '将测试、依赖升级、迁移和维护工作交给智能体，节省时间。可从 Copilot 聊天、CLI、IDE 创建拉取请求，或将议题分配给 Copilot 来开始使用。',
    'View capabilities': '查看功能',
    'Copilot cloud agent access disabled': 'Copilot 云端智能体访问已禁用',
    'Agents (opens a new page)': '智能体（打开新页面）',
    // 存储库智能体页（/<owner>/<repo>/agents）：未开通与空状态
    'Copilot Coding Agent handles routine tasks so you can focus on core work': 'Copilot 编码智能体处理日常任务让你专注于核心工作',
    'View Copilot Coding Agent capabilities': '查看 Copilot 编码智能体的功能',
    'Available on paid plans. Try it with Copilot Pro — free for 30 days.': '付费计划可用。试用 Copilot 专业版——30 天免费。',
    'Let Copilot work on tasks for you in the background.': '让 Copilot 在后台为你处理任务。',
    'Your code review sessions are available from the pull request timeline. Enable Copilot cloud agent to assign tasks, track progress, and review changes — all from this page.':
      '你的代码审查会话可在拉取请求时间线中查看。启用 Copilot 云端智能体后即可在此页面分配任务、跟踪进度并审查更改。',
    'Customize environment': '自定义环境',
    // 旧版编码智能体面板与推广
    'No agents running': '没有正在运行的智能体',
    'You can now ask Copilot to work on a task for you in the background, creating a pull request which you can review.':
      '现在你可以让 Copilot 在后台为你处理任务，并创建拉取请求供你审查。',
    'No open tasks yet. Start a new task to see it here.': '暂无打开的任务。开始新任务后会显示在这里。',
    'Copilot coding agent now uses fewer premium requests!': 'Copilot 编码智能体现在消耗的高级请求更少了！',
    'From now on, each session uses just one premium request.': '从现在起，每个会话只消耗一个高级请求。',
    'Delegate tasks to GitHub Copilot coding agent': '将任务委派给 GitHub Copilot 编码智能体',
    "Let Copilot work independently in the background to complete tasks, and then monitor Copilot's progress.":
      '让 Copilot 在后台独立完成任务，然后查看 Copilot 的进度。',
    "Delegate tasks to GitHub Copilot coding agent to work on in the background, and then monitor Copilot's progress.":
      '将任务委派给 GitHub Copilot 编码智能体在后台处理，然后查看 Copilot 的进度。',
    'This feature is not available on your current plan.': '你当前的计划不提供此功能。',
    // 拉取请求中的编码智能体会话：标题后缀、状态与错误
    '· Initializing pull request…': '· 正在初始化拉取请求…',
    '· Last updated': '· 最后更新',
    'Steer active session while Copilot is working': '在 Copilot 工作时引导当前会话',
    'View detailed logs': '查看详细日志',
    'Copilot encountered an unknown Git error. If the problem persists, please contact GitHub Support. To retry, leave a comment on this pull request asking Copilot to try again.':
      'Copilot 遇到未知 Git 错误。如果问题仍然存在，请联系 GitHub 支持。如需重试，请在此拉取请求中发表评论，让 Copilot 重试。',
    'Submitting will post a pull request comment': '提交后将发布拉取请求评论',
    'Copilot is still working. Changes will automatically appear once they have been committed to the branch.':
      'Copilot 仍在工作。更改提交到分支后将自动显示。',

    // 会话筛选（存储库智能体页、停靠面板的会话历史）；Filter by <标签小写>
    'Filter sessions': '筛选会话',
    'Session filters': '会话筛选器',
    'Task filters': '任务筛选器',
    'My sessions': '我的会话',
    'Filter by status': '按状态筛选',
    'Filter by environment': '按环境筛选',
    'Filter by type': '按类型筛选',
    'Filter by agent': '按智能体筛选',

    // 智能体推广提示（免费用户弹出提示的标题 Start a task with Copilot cloud agent 见 common/global-nav.ts）
    'Let Copilot tackle your TODOs': '让 Copilot 处理你的待办事项'
  },
  scoped: {
    // 外壳
    'GitHub homepage': 'GitHub 主页',
    'Condense sidebar': '收起侧栏',
    Navigation: '导航',
    'Open the app': '打开应用',
    // 侧栏用户菜单的方案标签（Copilot Free），订阅页链接文字（Copilot Business）同用；方案名见 plans.ts 的 COPILOT_PLANS
    ...COPILOT_PLANS,
    // 唤起中的按钮：<span>Opening</span><span>GitHub Copilot app</span>，后接宾语（应用名）作“正在打开”
    Opening: '正在打开',
    // 侧栏入口的“新”徽章（无障碍名称 The GitHub Copilot app, New 见 static）
    New: '新',
    // 智能体首页：查看 <功能>；访问 <Copilot 云端智能体> 的权限已被管理员禁用。
    capabilities: '功能',
    'Access to': '访问',
    'has been disabled by your administrator.': '的权限已被管理员禁用。',
    // 会话列表
    Active: '进行中',
    'In progress': '正在进行',
    'Created by me': '我创建的',
    'Start free trial': '开始免费试用',
    'Try adjusting your search or filters.': '请尝试调整搜索或筛选器。',
    // 拉取请求中的编码智能体会话：<Copilot> 开始工作；已更改的文件列表
    'started work': '开始工作',
    'View file': '查看文件',
    Viewed: '已查看',
    viewed: '已查看',
    'Viewed files': '已查看的文件',
    Diff: '差异',
    Repos: '存储库',
    default: '默认',
    'Find a branch...': '查找分支...',
    'Find a branch…': '查找分支…',

    // Copilot 页通用词：会话、任务视图、聊天中的引用卡片
    Model: '模型',
    Session: '会话',
    'View session': '查看会话',
    'Session options': '会话选项',
    'Previous conversation': '上一个对话',
    'Repository owner': '存储库所有者',
    'Previous question': '上一个问题',
    'Next question': '下一个问题',
    'Previous step': '上一步',
    'Next step': '下一步',
    Assign: '分配',
    Authorize: '授权',
    Duration: '时长',
    Tip: '提示',
    Skipped: '已跳过',
    You: '你',
    Host: '主机',
    'Files changed': '已更改的文件',
    'Loading tasks': '正在加载任务',
    'Open issue': '打开的议题',
    'Draft issue': '草稿议题',
    Opened: '已打开',
    'Blocked by': '被阻止',
    Image: '图片',
    Job: '作业',
    'Code search': '代码搜索',
    'Failed to search': '搜索失败',
    'Upload failed': '上传失败',
    'Please try again later.': '请稍后重试。',
    // Share feedback（提供反馈）由 common-ui 翻译
    'Suggest improvements': '建议改进',
    'Input:': '输入：',
    'Output:': '输出：',
    // 停靠聊天的推荐问题标题
    'Get started': '开始使用',
    'Next steps': '后续步骤',
    Comments: '评论',
    "What's new": '新功能',
    // 公告横幅的链接
    'See what’s new': '查看新功能',
    "See what's new": '查看新功能',
    // Copilot 专业版结账页（/github-copilot/pro）的步骤名：核对订单，不是代码审查
    Review: '确认'
  },
  regexp: [
    // 侧栏用户菜单：方案标签后接升级链接（Copilot Free · <Upgrade>）；用户按钮的无障碍名称（octocat, Copilot Free）
    [/^(Copilot (?:Free|Pro\+?|Business|Enterprise|Student)) ·$/, (_, plan: string) => `${copilotPlan(plan)} ·`],
    [
      /^([\w-]+), (Copilot (?:Free|Pro\+?|Business|Enterprise|Student))$/,
      (_, login: string, plan: string) => `${login}，${copilotPlan(plan)}`
    ]
  ]
} satisfies PageDictionary
