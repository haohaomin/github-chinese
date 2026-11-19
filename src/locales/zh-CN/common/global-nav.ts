import type { PageDictionary } from '../../../core/types'

const ORG_INVITE_VERB: Readonly<Record<string, string>> = {
  Invite: '邀请成员加入',
  Add: '添加成员到'
}

/** 登录后全局导航栏：头部按钮、全局导航侧栏、用户菜单、新建菜单、Copilot 与智能体菜单、存储库标签导航 */
export default {
  static: {
    // 头部
    'Global navigation menu': '全局导航菜单',
    'Open global navigation menu': '打开全局导航菜单',
    'Open menu': '打开菜单',
    'Close menu': '关闭菜单',
    Breadcrumbs: '面包屑导航',
    // 页头面包屑（所有页面共用）
    'GitHub Breadcrumb': 'GitHub 面包屑导航',
    'Show more breadcrumb items': '显示更多面包屑导航项',
    'Command palette': '命令面板',
    'Search or jump to…': '搜索或跳转到…',
    'Search or jump to...': '搜索或跳转到...',
    'Search or jump to': '搜索或跳转到',
    // 搜索按钮文字 Type <kbd>/</kbd> to search：引擎整句匹配，其他快捷键由正则处理；
    // “to search” 是整句未命中时的片段兜底。“Type” 与“类型”同形，不收录
    'Type / to search': '按 / 搜索',
    'to search': '搜索',
    'All issues': '全部议题',
    'All pull requests': '全部拉取请求',
    'All repositories': '全部存储库',
    'Your issues': '你的议题',
    'Your pull requests': '你的拉取请求',
    'Your repositories': '你的存储库',
    'Create new…': '新建…',
    'Create new...': '新建...',
    'Create something new': '新建内容',
    'Open user navigation menu': '打开用户导航菜单',
    'Close user navigation menu': '关闭用户导航菜单',
    'Switch repository': '切换存储库',
    'Search repositories': '搜索存储库',
    'Loading repositories...': '正在加载存储库...',
    'Loading repositories…': '正在加载存储库…',
    'No repositories found': '未找到存储库',

    // 通知入口
    Notifications: '通知',
    'You have no unread notifications': '没有未读通知',
    'You have unread notifications': '有未读通知',
    'Notifications are disabled': '通知已禁用',
    'Notifications are unavailable at the moment.': '通知暂不可用。',

    // Copilot 菜单
    'Chat with Copilot': '与 Copilot 聊天',
    'Navigate to Copilot': '转到 Copilot',
    'Open Copilot…': '打开 Copilot…',
    'Open Copilot...': '打开 Copilot...',
    'Open Copilot menu': '打开 Copilot 菜单',
    'Open agents panel': '打开智能体面板',
    'Ask Copilot…': '询问 Copilot…',
    'In immersive chat': '在沉浸式聊天中',
    'In a space': '在空间中',
    'About this page': '关于此页面',
    'Download for…': '下载适用于…',
    'Your Copilot': '你的 Copilot',
    // 计划标签（GlobalCopilotMenu 的 <Label>：Free / Student / Pro / Pro+）：方案名按用户要求译“X 版”；
    // 教育福利申请的身份选项 Student 由 settings-account 的 scoped 译“学生”
    Free: '免费版',
    Student: '学生版',
    Pro: '专业版',
    'Pro+': '专业增强版',
    'Meet the new Copilot': '认识全新的 Copilot',
    'Close announcement': '关闭公告',
    'Start a session or revisit recent sessions from the navigation bar.': '在导航栏中开始会话或重新打开最近的会话。',
    "Start a session or revisit recent sessions from the navigation bar. Choose Learn more for a quick tour of what's new.":
      '在导航栏中开始会话或重新打开最近的会话。选择了解更多可快速浏览新功能。',
    'Opening Copilot': '正在打开 Copilot',
    'Unable to open Copilot. Please try again.': '无法打开 Copilot。请重试。',

    // 智能体菜单
    Agents: '智能体',
    'Recent sessions': '最近的会话',
    'New session': '新建会话',
    'Open Copilot settings': '打开 Copilot 设置',
    'View all sessions': '查看全部会话',
    'Loading recent sessions': '正在加载最近的会话',
    'Sessions couldn’t be loaded': '无法加载会话',
    'No recent sessions': '没有最近的会话',
    'Start a new session to see it here.': '新建会话后显示在这里。',
    'Try again or, if the problem persists, contact support.': '请重试；如果问题仍然存在，请联系支持。',
    'GitHub status': 'GitHub 状态',
    'Start a new task with Copilot': '使用 Copilot 开始新任务',
    'Describe your task in natural language. Copilot will work in the background and open a pull request for your review.':
      '用自然语言描述任务。Copilot 会在后台工作，并创建拉取请求供你审查。',
    'Describe a coding task to work on': '描述要处理的编程任务',
    'Learn more about Copilot cloud agent': '了解 Copilot 云端智能体',
    'Recent tasks': '最近的任务',
    'Tasks couldn’t be loaded': '无法加载任务',
    'uses AI. Check for mistakes.': '使用 AI，请检查是否有误。',
    // 产品名按用户要求译成中文：Copilot cloud agent → Copilot 云端智能体
    'Copilot cloud agent': 'Copilot 云端智能体',
    // 标题由 “Start a task with ” 与智能体名两个相邻文本节点组成，整体匹配
    'Start a task with Copilot cloud agent': '使用 Copilot 云端智能体开始任务',
    'Copilot works in the cloud and opens a pull request for your review. Enjoy up to 5 free uses this month with your Copilot Free plan.':
      'Copilot 在云端工作，并创建拉取请求供你审查。本月你的 Copilot 免费版计划可免费使用最多 5 次。',
    // 会话状态（列表项说明文字）
    Working: '工作中',
    'Needs attention': '需要处理',
    Idle: '空闲',

    // 新建菜单
    'New issue': '新建议题',
    'New repository': '新建存储库',
    'Import repository': '导入存储库',
    'New agent session': '新建智能体会话',
    'New agent task': '新建智能体任务',
    'New spark': '新建 Spark',
    'New codespace': '新建代码空间',
    'New doc': '新建文档',
    'New gist': '新建代码片段',
    'New organization': '新建组织',
    'New project': '新建项目',
    'Create new repository': '新建存储库',
    // 组织页面中新建菜单的分组标题
    'This organization': '此组织',

    // 全局导航侧栏
    Home: '首页',
    Feed: '动态',
    'Pull requests': '拉取请求',
    Repositories: '存储库',
    Projects: '项目',
    Discussions: '讨论',
    'MCP registry': 'MCP 注册表',
    'Top repositories': '常用存储库',
    'Search for repositories': '搜索存储库',
    'Close search': '关闭搜索',
    'Show even more': '显示更多',
    // 原“团队”区的迁移提示，后接链接
    'Teams have moved to': '团队已移至',

    // 用户菜单
    'User navigation': '用户导航',
    'Set status': '设置状态',
    'Edit status': '编辑状态',
    Profile: '个人资料',
    Stars: '星标',
    Gists: '代码片段',
    Organizations: '组织',
    // 导航项（指赞助功能）；个人资料侧栏的赞助者列表标题需由 profile 词典 scoped 译“赞助者”
    Sponsors: '赞助',
    Settings: '设置',
    'Enterprise settings': '企业设置',
    'Copilot settings': 'Copilot 设置',
    'Feature preview': '功能预览',
    Appearance: '外观',
    Accessibility: '辅助功能',
    'Try Enterprise': '试用企业版',
    Upgrade: '升级',
    'Privacy Statement': '隐私声明',
    'Status Page': '状态页',
    'My Privacy Choices': '我的隐私选择',
    'Sign out': '退出登录',
    'Sign out...': '退出登录...',
    'Sign out…': '退出登录…',
    'Single sign-on': '单一登录',
    'Staff tools': '员工工具',
    'Admin mode': '管理员模式',
    'Enable site admin actions': '启用站点管理员操作',
    'Failed to toggle site admin mode': '切换站点管理员模式失败',
    'UI service': 'UI 服务',
    'Route through the new UI service': '通过新 UI 服务路由',
    'Failed to toggle UI service opt-out': '切换 UI 服务退出状态失败',
    // 旧版用户菜单
    'Your profile': '你的个人资料',
    'Your projects': '你的项目',
    'Your stars': '你的星标',
    'Your gists': '你的代码片段',
    'Your organizations': '你的组织',
    'Your enterprises': '你的企业',
    'Your enterprise': '你的企业',
    'Your sponsors': '你的赞助者',
    'GitHub Website': 'GitHub 网站',
    'GitHub Docs': 'GitHub 文档',
    'GitHub Support': 'GitHub 支持',
    'GitHub Community': 'GitHub 社区',

    // 帐户切换
    'Account switcher': '帐户切换器',
    'Add account': '添加帐户',
    'Switch account': '切换帐户',
    'Maximum accounts reached': '已达帐户数量上限',
    'Signed in as': '当前登录帐户',
    'Switch to another account': '切换到其他帐户',
    'An error has occurred while switching accounts. Please try again.': '切换帐户时出错。请重试。',
    'An error occurred while switching accounts. Please try again.': '切换帐户时出错。请重试。',
    'Unable to switch to the selected account.': '无法切换到所选帐户。',
    'Please try again. If the issue persists, try adding the account again.': '请重试。如果问题仍然存在，请尝试重新添加该帐户。',

    // 企业栏
    'Data residency:': '数据驻留：',
    'Viewing as': '当前身份',
    'Users managed by': '用户托管于',
    'UI PREVIEW': 'UI 预览',
    'UI PREVIEW: View commit in github-ui': 'UI 预览：在 github-ui 中查看提交',
    'Leave UI preview mode': '退出 UI 预览模式',

    // 存储库、组织等页面的标签导航（位于全局导航栏内）
    'Repository navigation': '存储库导航',
    Repository: '存储库',
    Organization: '组织',
    User: '用户',
    Local: '本地',
    Code: '代码',
    // 产品名按用户要求译成中文：存储库标签页 Actions、代码按钮下拉的 Codespaces 标签页；
    // 全局导航侧栏、营销头部的同名产品项共用
    Actions: '操作',
    Codespaces: '代码空间',
    Models: '模型',
    'Security and quality': '安全和质量',
    Insights: '洞察'
  },
  regexp: [
    // 已登录头部搜索按钮的无障碍名称与按钮文字（快捷键不是 / 时）
    [/^Open quick search dialog, type (\S+) to search$/, '打开快速搜索对话框，按 $1 搜索'],
    [/^Type (\S+) to search$/, '按 $1 搜索'],
    // 新建菜单中的组织项
    [/^(Invite|Add) someone to ([\w.-]+)$/, (_, verb, org) => `${ORG_INVITE_VERB[verb] ?? verb} ${org}`],
    [/^New team in ([\w.-]+)$/, '在 $1 中新建团队'],
    [/^New repository in ([\w.-]+)$/, '在 $1 中新建存储库'],
    // 企业栏 title
    [/^Data residency: ([^-]+?) - Viewing as ([\w-]+)$/, '数据驻留：$1 - 以 $2 身份查看'],
    [/^Data residency: ([^-]+?) - Users managed by (.+)$/, '数据驻留：$1 - 由 $2 托管的用户'],
    [/^Viewing as ([\w-]+)$/, '以 $1 身份查看'],
    [/^Users managed by (.+)$/, '由 $1 托管的用户'],
    // 智能体菜单：会话数播报、正在创建的任务
    [/^(\d+) recent sessions?$/, '$1 个最近的会话'],
    [/^Creating task in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中创建任务']
  ]
} satisfies PageDictionary
