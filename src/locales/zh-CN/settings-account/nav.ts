import type { PageDictionary } from '../../../core/types'

/**
 * 个人设置框架：页头（帐户名、切换设置对象）、左侧导航分组与菜单项、标签页标题。
 * common 已收录的菜单项（Appearance、Accessibility、Notifications、Organizations、Enterprises、Repositories、
 * Models、Packages、Features、Security、Code security、Integrations、Overview）与其他词典已收录的
 * 「Sponsorship log」「Switch settings context」「Code, planning, and automation」不再重复。
 * 与组织设置同名的单词菜单项放 scoped，只在个人设置页生效。
 */
export default {
  static: {
    // 页头
    'Your personal account': '你的个人帐户',
    'Go to your personal profile': '转到你的个人资料',
    'Go to settings page': '转到设置页面',
    'User settings': '用户设置',
    // 窄屏下左侧导航收进的对话框标题
    'Settings menu': '设置菜单',

    // 只在个人设置出现的菜单项
    'Public profile': '公开个人资料',
    'Password and authentication': '密码和身份验证',
    'SSH and GPG keys': 'SSH 和 GPG 密钥',
    'Saved replies': '已保存回复',
    'Security log': '安全日志',
    'Education benefits': '教育福利',
    'Code security and analysis': '代码安全和分析',
    // 旧版计费菜单（Billing and plans 下的子项）
    'Plans and usage': '计划和使用情况',
    'Spending limits': '支出上限',

    // 标签页标题片段
    'Your Profile': '你的个人资料',
    'Notification Settings': '通知设置',
    'Account security': '帐户安全',
    'Email settings': '电子邮件设置',
    'Accessibility settings': '辅助功能设置',
    'Billing Overview': '计费概述',
    'Billing overview': '计费概述',
    'Billing Usage': '计费使用情况',
    'Billing usage': '计费使用情况',
    'Payment Information': '付款信息'
  },
  scoped: {
    // 页头帐户名后的读屏文字：「Mona (octocat) settings」
    settings: '设置',
    // 一级分组
    Access: '访问',
    Archives: '存档',

    // 菜单项（与组织设置菜单同名，译法一致）
    Account: '帐户',
    'Account settings': '帐户设置',
    'Billing and licensing': '计费和许可',
    'Billing & licensing': '计费和许可',
    'Billing & Licensing': '计费和许可',
    'Billing and plans': '计费和计划',
    Billing: '计费',
    Usage: '使用情况',
    'Metered usage': '按流量计费的使用情况',
    'AI usage': 'AI 使用情况',
    'Premium request analytics': '高级请求分析',
    'Budgets and alerts': '预算和警报',
    Budgets: '预算',
    Licensing: '许可',
    'Payment information': '付款信息',
    'Payment history': '付款历史记录',
    'Additional billing details': '其他计费详细信息',
    Emails: '电子邮件',
    Sessions: '会话',
    Credentials: '凭据',
    Moderation: '调解',
    'Blocked users': '已阻止的用户',
    'Interaction limits': '交互限制',
    'Code review limits': '代码审查限制',
    'Coding agent': '编码智能体',
    'Cloud agent': '云端智能体',
    // Copilot 下的子菜单项（与存储库设置一致）
    Cloud: '云端',
    Memory: '记忆',
    // 侧栏的产品名按用户规定译成中文（GitHub Pages → 页面、Codespaces → 代码空间）；Copilot 是品牌词，保留。
    // Codespaces 同时覆盖计费页的产品名、预算产品、GitHub 应用权限名
    Pages: '页面',
    Codespaces: '代码空间',
    Applications: '应用',
    'Scheduled reminders': '预定提醒',
    // 规划分组（与组织设置一致）
    Planning: '规划',
    'Issue types': '议题类型',
    'Issue fields': '议题字段',
    'Developer settings': '开发人员设置',
    'Developer Settings': '开发人员设置'
  },
  // 切换设置对象的按钮：「Switch <span>settings</span> context」，settings 由 scoped 译出（整句同 org-settings 的 static）
  inline: [['Switch {} context', '切换{}对象']]
} satisfies PageDictionary
