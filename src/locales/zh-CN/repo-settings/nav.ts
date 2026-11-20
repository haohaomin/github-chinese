import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置：左侧导航（分组与菜单项）、标签页标题片段、设置页通用提示。
 * common 已收录的 Settings、Security、Security and quality、Code security、Code review、Models、
 * Integrations、Insights、Agents 不再重复，org-settings 已收录「Code, planning, and automation」；
 * 与组织设置、个人设置同名的菜单项放 scoped。
 * 产品名、功能名、方案名按用户要求译成中文（.harvest/scratch/followups/product-names.md，先于 GLOSSARY 第 3 节生效），
 * 与组织设置（org-settings/nav.ts 文件头）同一套写法：Actions → 操作（操作权限、操作机密和变量、操作策略）、
 * Codespaces / codespace → 代码空间、Pages → 页面、Advanced Security → 高级安全、Secret Protection → 机密保护、
 * Models → 模型、Marketplace → 市场、Sponsors → 赞助、Packages → 软件包、Beta → 测试版；带 GitHub 前缀的全名同样译出
 * 后半部分（GitHub 操作、GitHub 页面、GitHub 高级安全、GitHub 公告数据库）；Copilot 功能名译出后半部分
 * （Copilot 代码审查、Copilot 云端智能体、Copilot 编码智能体、Copilot 自动修复）。原文只写 Actions 而指整个产品的句子
 * 补上 GitHub 前缀（禁用 GitHub 操作）。只有自造品牌词（GitHub、Git、Copilot、Dependabot、CodeQL）与技术词
 * （OIDC、MCP、Wiki、LFS 等）保留英文。方案名 Free / Pro / Pro+ / Team / Enterprise / Business →
 * 免费版 / 专业版 / 专业增强版 / 团队版 / 企业版 / 商业版，品牌前缀保留（GitHub 团队版、Copilot 商业版）。
 */
export default {
  static: {
    // 分组
    'Code and automation': '代码和自动化',

    // 存储库设置专有菜单项
    'Collaborators and teams': '协作者和团队',
    'Collaborators & teams': '协作者和团队',
    'Team and member roles': '团队和成员角色',
    'Moderation options': '调解选项',
    'Reported content': '报告的内容',
    'Email notifications': '电子邮件通知',
    'Autolink references': '自动链接引用',
    'MCP servers': 'MCP 服务器',
    'Agent suggestions for issues': '议题的智能体建议',

    // 标签页标题片段
    'Actions settings': '操作设置',
    'Actions policies': '操作策略',
    'Actions policy insights': '操作策略洞察',
    'Actions secrets': '操作机密',
    'Actions variables': '操作变量',
    'Add Actions secret': '添加操作机密',
    'Add Actions variable': '添加操作变量',
    'Agents secrets': '智能体机密',
    'Agents variables': '智能体变量',
    'Agents secrets and variables': '智能体机密和变量',
    'Add Agents secret': '添加智能体机密',
    'Add Agents variable': '添加智能体变量',
    'Codespaces secrets': '代码空间机密',
    'Add Codespaces secret': '添加代码空间机密',
    'Dependabot secrets': 'Dependabot 机密',
    'Add Dependabot secret': '添加 Dependabot 机密',
    'New branch protection rule': '新建分支保护规则',
    'Edit branch protection rule': '编辑分支保护规则',
    'Configure email notifications': '配置电子邮件通知',
    'GitHub Models access policy': 'GitHub 模型访问策略',
    'Copilot in the cloud': '云端 Copilot',
    'Create environment': '创建环境',
    'OIDC Configuration': 'OIDC 配置',
    'OIDC configuration': 'OIDC 配置',

    // 设置页通用提示
    'Repository settings saved.': '存储库设置已保存。',
    'Most repository settings are hidden for archived repositories. This repository must be unarchived to change them.':
      '已存档存储库的大多数设置已隐藏。须先取消存档此存储库才能更改这些设置。',
    "You don't have access to repository options": '你无权访问存储库选项',
    'You don’t have access to repository options': '你无权访问存储库选项',
    'Check the sidebar for available repository settings.': '请在侧栏中查看可用的存储库设置。'
  },
  scoped: {
    // 侧栏「安全和质量」分组
    'Code quality': '代码质量',
    // 与组织设置、个人设置同名的菜单项
    General: '常规',
    Access: '访问',
    Collaborators: '协作者',
    Moderation: '调解',
    'Interaction limits': '交互限制',
    'Code review limits': '代码审查限制',
    Branches: '分支',
    Tags: '标签',
    Rules: '规则',
    Rulesets: '规则集',
    Runners: '运行器',
    Policies: '策略',
    'Policy insights': '策略洞察',
    Webhooks: 'Web 钩子',
    'Coding agent': '编码智能体',
    'Cloud agent': '云端智能体',
    Cloud: '云端',
    'Internet access': '互联网访问',
    Planning: '规划',
    Environments: '环境',
    Pages: '页面',
    // 侧栏里单独出现的产品名（「Secrets and variables」下的 Actions、Codespaces 子项同形；见文件头）
    Actions: '操作',
    Codespaces: '代码空间',
    'Advanced Security': '高级安全',
    'Custom properties': '自定义属性',
    'Deploy keys': '部署密钥',
    'Secrets and variables': '机密和变量',
    'Private registries': '专用注册表',
    'GitHub Apps': 'GitHub 应用',
    'Rule insights': '规则洞察',
    'Rule Insights': '规则洞察'
  },
  regexp: [
    // 侧栏标题（读屏）：Settings: owner/repo
    [/^Settings: ([\w.-]+\/[\w.-]+)$/, '设置：$1']
  ]
} satisfies PageDictionary
