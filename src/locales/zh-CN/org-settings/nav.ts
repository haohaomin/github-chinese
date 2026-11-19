import type { PageDictionary } from '../../../core/types'

/**
 * 组织设置：页头、左侧导航菜单项、标签页标题片段。
 * common 已收录的词（Settings、Organization、Repository、Topics、Models、Discussions、Projects、
 * Packages、Security、Security and quality、Code security、Code review、Integrations）、
 * organization 已收录的「Organization roles」「Role management」与 sponsors 已收录的「Sponsorship log」不再重复。
 * 与存储库设置、个人设置菜单同名的项放 scoped；侧栏 Pages 译“页面”。
 * 产品名、方案名按用户要求译成中文（.harvest/scratch/followups/product-names.md，先于 GLOSSARY 第 3 节生效）：
 * Actions → 操作、Codespaces / codespace → 代码空间、Advanced Security → 高级安全、Pages → 页面、
 * Marketplace → 市场、Sponsors → 赞助；带 GitHub 前缀的全名同样译出后半部分（GitHub 操作、GitHub 代码空间、
 * GitHub 高级安全、GitHub 页面、GitHub 赞助）；Copilot 功能名译出后半部分（Copilot 编码智能体、Copilot 云端智能体、
 * Copilot 自动修复）。只有自造品牌词（GitHub、Copilot、Dependabot、CodeQL、Spark、Git）和技术缩写（CLI、LFS、
 * MCP 等）保留英文。原文只写 Actions / Codespaces 而指整个产品的句子补上 GitHub 前缀（运行 GitHub 操作）。
 * 方案名 Free / Team / Enterprise / Business 译 免费版 / 团队版 / 企业版 / 商业版，品牌前缀保留
 * （GitHub 团队版、Copilot 商业版）；企业帐户义的 enterprise、团队义的 team 仍译 企业、团队。
 * Code Security、Secret Protection、Code Quality 已由 common/marketing.ts 的全局 static 译出，本区不重复。
 */
export default {
  static: {
    // 页头
    'Organization account': '组织帐户',
    'Go to your organization profile': '转到组织个人资料',
    'Go to organization profile': '转到组织个人资料',
    'Switch settings context': '切换设置对象',
    'Select settings context': '选择设置对象',
    'Organization settings navigation': '组织设置导航',

    // 一级分组
    'Code, planning, and automation': '代码、规划和自动化',
    'Third-party Access': '第三方访问',
    'Third-party access': '第三方访问',

    // 仅组织设置才有的菜单项
    'Role assignments': '角色分配',
    'Repository roles': '存储库角色',
    'Member privileges': '成员权限',
    'Team discussions': '团队讨论',
    'Import/Export': '导入/导出',
    Moderators: '版主',
    'Hosted compute networking': '托管计算网络',
    'Authentication security': '身份验证安全',
    'Verified and approved domains': '已验证和批准的域',
    'Verified & approved domains': '已验证和批准的域',
    'OAuth app policy': 'OAuth 应用策略',
    'OAuth application policy': 'OAuth 应用策略',
    // 官方界面名“活动令牌”；Active 在本区作“活动”（运行器、规则集状态同译）
    'Active tokens': '活动令牌',
    'Audit log': '审核日志',
    'Repository policies': '存储库策略',

    // 标签页标题片段
    'Organization Profile': '组织个人资料',
    'Organization profile': '组织个人资料',
    'Member Privileges': '成员权限',
    'Repository Roles': '存储库角色',
    'Repository Defaults': '存储库默认设置',
    'Repository defaults': '存储库默认设置',
    'Authentication Security': '身份验证安全',
    'Audit Log': '审核日志',
    'Deploy Keys': '部署密钥',
    'Verified Domains': '已验证的域',
    'General Organization Settings': '常规组织设置',
    'Runner Groups': '运行器组',
    'GitHub Publisher Verification': 'GitHub 发布者验证'
  },
  scoped: {
    // 组织页头标签（设置页也显示）
    People: '人员',

    // 产品名（见文件头注释）：侧栏 Actions、Codespaces、Advanced Security，机密页标签 Actions / Codespaces
    Actions: '操作',
    Codespaces: '代码空间',
    'Advanced Security': '高级安全',

    // 与其他设置页同名的菜单项
    General: '常规',
    Policies: '策略',
    Access: '访问',
    'Billing and plans': '计费和计划',
    'Billing and licensing': '计费和许可',
    'Billing & licensing': '计费和许可',
    'Billing & Licensing': '计费和许可',
    Billing: '计费',
    Usage: '使用情况',
    'Premium request analytics': '高级请求分析',
    'Budgets and alerts': '预算和警报',
    Licensing: '许可',
    'Payment information': '付款信息',
    'Payment history': '付款历史记录',
    'Additional billing details': '其他计费详细信息',
    'Requests from members': '成员请求',
    Moderation: '调解',
    'Blocked users': '已阻止的用户',
    'Interaction limits': '交互限制',
    'Code review limits': '代码审查限制',
    Rulesets: '规则集',
    'Rule insights': '规则洞察',
    'Custom properties': '自定义属性',
    Sandboxes: '沙盒',
    Planning: '规划',
    'Issue types': '议题类型',
    'Issue fields': '议题字段',
    'Issue Fields': '议题字段',
    'Cloud agent': '云端智能体',
    'Content exclusion': '内容排除',
    'Internet access': '互联网访问',
    'Runner groups': '运行器组',
    'Custom images': '自定义映像',
    Development: '开发',
    'Custom models': '自定义模型',
    Webhooks: 'Web 钩子',
    Pages: '页面',
    Configurations: '配置',
    'Global settings': '全局设置',
    'Deploy keys': '部署密钥',
    Compliance: '合规',
    'Secrets and variables': '机密和变量',
    'Private registries': '专用注册表',
    'Private Registries': '专用注册表',
    'GitHub Apps': 'GitHub 应用',
    'App managers': '应用管理员',
    'Personal access tokens': '个人访问令牌',
    'Pending requests': '待处理的请求',
    Applications: '应用',
    Logs: '日志',
    'Deleted repositories': '已删除的存储库',
    'Deleted Repositories': '已删除的存储库',
    'Developer settings': '开发人员设置',
    'Developer Settings': '开发人员设置',
    'OAuth Apps': 'OAuth 应用',
    'OAuth apps': 'OAuth 应用',
    'Publisher Verification': '发布者验证',
    'Publisher verification': '发布者验证',
    'Account settings': '帐户设置',
    // 切换设置对象按钮里单独包起来的 settings（见 inline）
    settings: '设置'
  },
  // 切换设置对象的按钮：「Switch <span>settings</span> context」，整句不在同一文本节点时按行内句译（同 static 的整句）
  inline: [['Switch {} context', '切换{}对象']]
} satisfies PageDictionary
