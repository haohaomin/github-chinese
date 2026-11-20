import type { PageDictionary } from '../../../core/types'

/** 自定义角色可选的存储库附加权限（组织角色与存储库角色共用） */
const REPOSITORY_PERMISSIONS: Readonly<Record<string, string>> = {
  'Create a discussion category': '创建讨论类别',
  'Edit a discussion category': '编辑讨论类别',
  'Delete a discussion category': '删除讨论类别',
  'Mark or unmark discussion answers': '标记或取消标记讨论答案',
  'Hide or unhide discussion comments': '隐藏或取消隐藏讨论评论',
  'Convert issues to discussions': '将议题转换为讨论',
  'Triage discussions': '分类讨论',
  'Assign or remove a user': '分配或移除用户',
  'Add or remove a label': '添加或移除标签',
  'Close an issue': '关闭议题',
  'Reopen a closed issue': '重新打开已关闭的议题',
  'Delete an issue': '删除议题',
  'Mark an issue as a duplicate': '将议题标记为重复',
  'Mark an issue as duplicate': '将议题标记为重复',
  'Request a solo merge': '请求单独合并',
  'Jump to the front of the queue': '跳到队列最前',
  'Close a pull request': '关闭拉取请求',
  'Reopen a closed pull request': '重新打开已关闭的拉取请求',
  'Request a pull request review': '请求拉取请求审查',
  'Set milestones': '设置里程碑',
  'Manage wiki settings': '管理 Wiki 设置',
  'Manage project settings': '管理项目设置',
  'Manage pull request merging settings': '管理拉取请求合并设置',
  'Manage GitHub Pages settings': '管理 GitHub 页面设置',
  'Manage GitHub Page settings': '管理 GitHub 页面设置',
  'Manage webhooks': '管理 Web 钩子',
  'Manage deploy keys': '管理部署密钥',
  'Edit repository metadata': '编辑存储库元数据',
  'Set interaction limits': '设置交互限制',
  'Set the social preview': '设置社交预览',
  'Push commits to protected branches': '向受保护分支推送提交',
  'Create protected tags': '创建受保护标签',
  'Delete protected tags': '删除受保护标签',
  'Bypass branch protections': '绕过分支保护',
  'Edit repository rules': '编辑存储库规则',
  'View code scanning alerts': '查看代码扫描警报',
  'Dismiss or reopen code scanning alerts': '消除或重新打开代码扫描警报',
  'Delete code scanning alerts': '删除代码扫描警报',
  'Delete code scanning results': '删除代码扫描结果',
  'View Dependabot alerts': '查看 Dependabot 警报',
  'Dismiss or reopen Dependabot alerts': '消除或重新打开 Dependabot 警报',
  'View secret scanning alerts': '查看机密扫描警报',
  'Dismiss, reopen, or assign secret scanning alerts': '消除、重新打开或分配机密扫描警报',
  'Dismiss or reopen secret scanning alerts': '消除或重新打开机密扫描警报',
  'Manage GitHub Actions general settings': '管理 GitHub 操作常规设置',
  'Manage runners': '管理运行器',
  'Manage secrets': '管理机密',
  'Manage variables': '管理变量',
  'Manage environments (including environment secrets and variables)': '管理环境（包括环境机密和变量）'
}

/** 自定义组织角色可选的组织权限（与 GitHub 应用权限说明有重名，放 scoped） */
const ORGANIZATION_PERMISSIONS: Readonly<Record<string, string>> = {
  'Manage custom organization roles': '管理自定义组织角色',
  'Access to create, view, update, and delete custom organization roles within the organization. This permission does not allow a user to assign custom roles.':
    '可在组织内创建、查看、更新和删除自定义组织角色。此权限不允许分配自定义角色。',
  'View organization roles': '查看组织角色',
  "Access to view the organization's custom organization roles.": '可查看组织的自定义组织角色。',
  'Access to view the organization’s custom organization roles.': '可查看组织的自定义组织角色。',
  'Manage custom repository roles': '管理自定义存储库角色',
  "Access to create, view, update, and delete the organization's custom repository roles.":
    '可创建、查看、更新和删除组织的自定义存储库角色。',
  'Access to create, view, update, and delete the organization’s custom repository roles.':
    '可创建、查看、更新和删除组织的自定义存储库角色。',
  'View custom repository roles': '查看自定义存储库角色',
  "Access to view the organization's custom repository roles.": '可查看组织的自定义存储库角色。',
  'Access to view the organization’s custom repository roles.': '可查看组织的自定义存储库角色。',
  'Manage organization webhooks': '管理组织 Web 钩子',
  'Access to register and manage webhooks for the organization. Users with this permission will be able to view webhook payloads, which may contain metadata for repositories in the organization.':
    '可为组织注册和管理 Web 钩子。拥有此权限的用户可以查看 Web 钩子有效负载，其中可能包含组织内存储库的元数据。',
  'Manage organization OAuth app policies': '管理组织 OAuth 应用策略',
  'Access to the "OAuth app policy" settings for the organization.': '可访问组织的“OAuth 应用策略”设置。',
  'Edit custom properties values at the organization level': '在组织级别编辑自定义属性值',
  'Access to set custom property values on all repositories in the organization.': '可为组织内所有存储库设置自定义属性值。',
  "Manage the organization's custom properties definitions": '管理组织的自定义属性定义',
  'Manage the organization’s custom properties definitions': '管理组织的自定义属性定义',
  'Access to create and edit custom property definitions for the organization.': '可为组织创建和编辑自定义属性定义。',
  'Manage organization ref update rules and rulesets': '管理组织引用更新规则和规则集',
  'Access to manage rulesets and view ruleset insights at the organization level.': '可在组织级别管理规则集并查看规则集洞察。',
  'View organization audit log': '查看组织审核日志',
  'Access to the audit log for the organization. The audit log may contain metadata for repositories in the organization.':
    '可访问组织的审核日志。审核日志可能包含组织内存储库的元数据。',
  'Manage organization Actions policies': '管理组织操作策略',
  'Access to manage all settings on the "Actions General" settings page, except for self-hosted runners settings.':
    '可管理“操作常规”设置页上的所有设置，自托管运行器设置除外。',
  'Manage organization Actions secrets': '管理组织操作机密',
  'Access to create and manage Actions organization secrets.': '可创建和管理组织操作机密。',
  'Manage organization Actions variables': '管理组织操作变量',
  'Access to create and manage Actions organization variables.': '可创建和管理组织操作变量。',
  'Manage organization hosted runner custom images': '管理组织托管运行器自定义映像',
  'Access to create and manage custom images for your organization.': '可为组织创建和管理自定义映像。',
  'Manage organization runners and runner groups': '管理组织运行器和运行器组',
  'Access to create and manage GitHub-hosted runners, self-hosted runners, and runner groups, and control where self-hosted runners can be created.':
    '可创建和管理 GitHub 托管的运行器、自托管运行器和运行器组，并控制可在哪里创建自托管运行器。',
  'View organization Actions metrics': '查看组织操作指标',
  'View GitHub Actions metrics for your organization.': '查看组织的 GitHub 操作指标。',
  'View organization hosted runner custom images': '查看组织托管运行器自定义映像',
  'View custom images for your organization.': '查看组织的自定义映像。',
  'Review and manage secret scanning bypass requests': '审查和管理机密扫描绕过请求',
  'Review and manage secret scanning bypass requests for your organization.': '审查和管理组织的机密扫描绕过请求。',
  'Review and manage secret scanning alert dismissal requests': '审查和管理机密扫描警报消除请求',
  'Review and manage secret scanning alert dismissal requests for your organization.': '审查和管理组织的机密扫描警报消除请求。',
  'Bypass code scanning alert dismissal requests': '绕过代码扫描警报消除请求',
  'Bypass code scanning alert dismissal requests for your organization.': '绕过组织的代码扫描警报消除请求。',
  'Review code scanning alert dismissal requests': '审查代码扫描警报消除请求',
  'Review and manage code scanning alert dismissal requests for your organization.': '审查和管理组织的代码扫描警报消除请求。',
  'View code scanning alert dismissal requests': '查看代码扫描警报消除请求',
  'View code scanning alert dismissal requests for your organization.': '查看组织的代码扫描警报消除请求。',
  'Bypass Dependabot alert dismissal requests': '绕过 Dependabot 警报消除请求',
  'Bypass Dependabot alert dismissal requests for your organization.': '绕过组织的 Dependabot 警报消除请求。',
  'Review Dependabot alert dismissal requests': '审查 Dependabot 警报消除请求',
  'Review and manage Dependabot alert dismissal requests for your organization.': '审查和管理组织的 Dependabot 警报消除请求。',
  'View Dependabot alert dismissal requests': '查看 Dependabot 警报消除请求',
  'View Dependabot alert dismissal requests for your organization.': '查看组织的 Dependabot 警报消除请求。',
  'View organization Copilot metrics': '查看组织 Copilot 指标',
  'View Copilot usage metrics for your organization.': '查看组织的 Copilot 使用情况指标。'
}

/** 只在组织角色详情（「• 」开头的权限条目）里出现的存储库 / 组织权限 */
const ROLE_DETAIL_PERMISSIONS: Readonly<Record<string, string>> = {
  'Create a label': '创建标签',
  'Edit a label': '编辑标签',
  'Remove a label': '移除标签',
  'Create a milestone': '创建里程碑',
  'Edit a milestone': '编辑里程碑',
  'Remove an assigned user': '移除已分配的用户',
  'Comment on a locked issue': '评论已锁定的议题',
  'Edit an issue title and body': '编辑议题标题和正文',
  'Edit a comment on an issue': '编辑议题上的评论',
  'Lock and unlock an issue conversation': '锁定和解锁议题对话',
  'Minimize an issue comment': '最小化议题评论',
  'Unminimize an issue comment': '取消最小化议题评论',
  'Set an issue type': '设置议题类型',
  'Transfer an issue': '转移议题',
  'View code quality alerts': '查看代码质量警报',
  'Dismiss or reopen code quality alerts': '消除或重新打开代码质量警报',
  'Close a discussion': '关闭讨论',
  'Reopen a discussion': '重新打开讨论',
  'Delete a discussion': '删除讨论',
  'Delete a discussion comment': '删除讨论评论',
  'Edit a discussion comment': '编辑讨论评论',
  'Edit category on a discussion': '编辑讨论的类别',
  'Award and revoke discussion badges': '授予和撤销讨论徽章',
  'Manage repository Actions secrets': '管理存储库操作机密',
  'Manage repository Actions variables': '管理存储库操作变量',
  'Manage repository Actions runners': '管理存储库操作运行器',
  'Manage repository Actions policies': '管理存储库操作策略',
  'Manage repository environments, environment secrets and variables': '管理存储库环境、环境机密和变量',
  'Create a protected tag': '创建受保护标签',
  'Delete a protected tag': '删除受保护标签',
  'Edit repository announcement banners': '编辑存储库公告横幅',
  'Manage topics': '管理主题',
  'Edit repository custom properties values at the repository level': '在存储库级别编辑存储库自定义属性值',
  'Delete code scanning analyses': '删除代码扫描分析',
  'View security advisories': '查看安全公告',
  'Create, edit, and manage security advisories (includes Read)': '创建、编辑和管理安全公告（包括读取）',
  'Publish security advisories and request CVEs. Requires Read or Write security advisories.':
    '发布安全公告并申请 CVE。需要“读取或写入安全公告”权限。',
  'Accept private vulnerability reports and close or reopen security advisories. Requires Read or Write security advisories.':
    '接受专用漏洞报告，关闭或重新打开安全公告。需要“读取或写入安全公告”权限。',
  'Create organization owned integrations': '创建组织拥有的集成',
  'Edit organization owned integrations': '编辑组织拥有的集成',
  'Delete organization owned integrations': '删除组织拥有的集成',
  'View all organization owned integrations': '查看组织拥有的所有集成',
  'View organization Actions usage metrics': '查看组织操作使用情况指标',
  'Edit organization hosted compute network configurations': '编辑组织托管计算网络配置',
  'Bypass secret scanning alert closure requests': '绕过机密扫描警报关闭请求',
  'Review license compliance closure requests': '审查许可证合规关闭请求',
  'View license compliance closure requests': '查看许可证合规关闭请求',
  'View repository license policy': '查看存储库许可证策略'
}

/** 组织角色详情的权限条目：「• 」+ 权限名，按存储库 / 组织权限表与上表整段匹配 */
const BULLET_PERMISSIONS: Readonly<Record<string, string>> = {
  ...REPOSITORY_PERMISSIONS,
  ...ORGANIZATION_PERMISSIONS,
  ...ROLE_DETAIL_PERMISSIONS
}

/** 角色图标的无障碍名称：<角色名> icon（all_repo_read 是内部名） */
const ROLE_ICONS: Readonly<Record<string, string>> = {
  all_repo_read: '所有存储库读取',
  'All-repository read': '所有存储库读取',
  'All-repository write': '所有存储库写入',
  'All-repository triage': '所有存储库分类',
  'All-repository moderate': '所有存储库审核',
  'All-repository maintain': '所有存储库维护',
  'All-repository admin': '所有存储库管理员',
  'Apps manager': '应用管理员',
  'CI/CD Admin': 'CI/CD 管理员',
  'Security manager': '安全管理员',
  'Open-source license manager': '开源许可证管理员',
  Repository: '存储库',
  Organization: '组织'
}

/** 转义正则元字符：权限名含括号、点号、斜杠 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 名称表拼成正则备选：长名在前（Delete a discussion comment 先于 Delete a discussion） */
function alternatives(table: Readonly<Record<string, string>>): string {
  return Object.keys(table)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')
}

/**
 * 组织角色（角色管理、角色分配、自定义组织角色）与存储库角色（预定义角色、自定义存储库角色）。
 * 「Organization roles」「Role management」已由 organization 收录；「Add permissions」「Users」「Merge queue」
 * 由个人设置、common、commits 的 static 收录。
 */
export default {
  static: {
    // 组织角色：说明、预定义角色（审核、应用管理员、CI/CD 管理员、开源许可证管理员）与详情里的分组
    'Organization roles are used to grant access to specific organization and repository settings. Repository permissions are granted across every repository in the organization.':
      '组织角色用于授予特定组织设置和存储库设置的访问权限。存储库权限适用于组织内的每个存储库。',
    'All-repository moderate': '所有存储库审核',
    'Grants Moderate access to all repositories in the organization.': '授予组织内所有存储库的审核权限。',
    'Apps manager': '应用管理员',
    'Grants the ability to manage all GitHub Apps owned by an organization.': '授予管理组织拥有的所有 GitHub 应用的权限。',
    'CI/CD Admin': 'CI/CD 管理员',
    'Grants admin access to manage Actions policies, runners, runner groups, network configurations, secrets, variables, and usage metrics for an organization.':
      '授予管理组织操作策略、运行器、运行器组、网络配置、机密、变量和使用情况指标的管理员权限。',
    'Open-source license manager': '开源许可证管理员',
    'Grants the ability to review open-source license compliance closure requests and update repository license policies.':
      '授予审查开源许可证合规关闭请求和更新存储库许可证策略的权限。',
    'Base repository role:': '基本存储库角色：',
    'Apps and automation': '应用和自动化',
    'All read permissions plus…': '所有读取权限，外加…',
    // 角色分配：页面说明、空状态（「No」「organization」「roles assigned」是相邻文本节点，整体匹配）
    'Assign teams or people an organization role': '为团队或人员分配组织角色',
    'No organization roles assigned': '暂无已分配的组织角色',
    'Organization roles have not been assigned to any users or teams.': '尚未向任何用户或团队分配组织角色。',
    // 存储库角色：审核（Moderate）角色的说明
    'Triage permissions plus edit and moderate issues, manage labels, milestones, etc.':
      '分类权限，外加编辑和审核议题、管理标签、里程碑等。',
    // 组织角色：预定义角色
    'Pre-defined roles': '预定义角色',
    'Predefined roles': '预定义角色',
    'All-repository read': '所有存储库读取',
    'All-repository write': '所有存储库写入',
    'All-repository triage': '所有存储库分类',
    'All-repository maintain': '所有存储库维护',
    'All-repository admin': '所有存储库管理员',
    'CI/CD admin': 'CI/CD 管理员',
    'App Manager': '应用管理员',
    'App manager': '应用管理员',
    'Grants read access to all repositories in the organization.': '授予组织内所有存储库的读取访问权限。',
    'Grants write access to all repositories in the organization.': '授予组织内所有存储库的写入访问权限。',
    'Grants triage access to all repositories in the organization.': '授予组织内所有存储库的分类权限。',
    'Grants maintenance access to all repositories in the organization.': '授予组织内所有存储库的维护权限。',
    'Grants admin access to all repositories in the organization.': '授予组织内所有存储库的管理员权限。',
    'Grants admin access to manage Actions policies, runners, runner groups, hosted compute network configurations, secrets, variables, and usage metrics for an organization.':
      '授予管理组织操作策略、运行器、运行器组、托管计算网络配置、机密、变量和使用情况指标的管理员权限。',
    'Grants the ability to manage security policies, security alerts, and security configurations for an organization and all its repositories.':
      '授予管理组织及其所有存储库的安全策略、安全警报和安全配置的权限。',
    'Grants the ability to create, edit, and delete all GitHub Apps in an organization.':
      '授予创建、编辑和删除组织内所有 GitHub 应用的权限。',
    'Grants standard access to organization features.': '授予组织功能的标准访问权限。',
    'Grants full administrative control of the organization.': '授予组织的完全管理控制权。',
    'Grants additional permissions to help moderate organization-level discussions and community content.':
      '授予额外权限，以协助管理组织级讨论和社区内容。',
    'Grants permission to view and manage billing settings and subscription details for the organization.':
      '授予查看和管理组织计费设置及订阅详细信息的权限。',
    'Show role permissions': '显示角色权限',
    'Hide role permissions': '隐藏角色权限',
    'Organization permissions:': '组织权限：',
    'Repository permissions:': '存储库权限：',
    // base 与 Base permissions → 基本权限 一致（官方 Base role → 基本角色）
    'Base repository role': '基本存储库角色',

    // 组织角色：自定义角色
    'Create a role': '创建角色',
    'Create a Role': '创建角色',
    'Create role': '创建角色',
    'Edit role': '编辑角色',
    'Update role': '更新角色',
    'Delete role': '删除角色',
    'Add Permissions': '添加权限',
    'Choose a role to inherit': '选择要继承的角色',
    'Inherited role': '继承的角色',
    'Search permissions': '搜索权限',
    'No custom roles': '暂无自定义角色',
    "You haven't created any custom roles yet.": '尚未创建自定义角色。',
    'You haven’t created any custom roles yet.': '尚未创建自定义角色。',
    'Organization roles are used to grant access and permissions to manage your organization.': '组织角色用于授予管理组织的访问权限。',
    'Adding a repository role and permissions to a custom organization role is currently in public preview and subject to change.':
      '为自定义组织角色添加存储库角色和权限目前处于公开预览阶段，可能会有变动。',
    'If you delete an existing role, all teams and users with the role will be unassigned.':
      '删除角色后，拥有该角色的所有团队和用户都将被取消分配。',

    // 组织角色：角色分配
    'New role assignment': '新建角色分配',
    'Add new assignment': '添加分配',
    'Search for users or teams': '搜索用户或团队',
    'Search users and teams': '搜索用户和团队',
    'Select a role': '选择角色',
    'Select roles': '选择角色',
    'No role assignments': '暂无角色分配',
    'Remove role assignment': '删除角色分配',
    'Remove role assignment?': '删除角色分配？',
    'Assign role': '分配角色',
    'Assigned roles': '已分配的角色',

    // 存储库角色
    'Roles are used to grant access and permissions for teams and members.': '角色用于向团队和成员授予访问权限。',
    'In addition to the available pre-defined roles, you can create up to 20 custom roles to fit your needs.':
      '除了现有的预定义角色，你还可以根据需要创建最多 20 个自定义角色。',
    'Learn more about custom repository roles': '了解自定义存储库角色',
    // 「You can」+「set the base role」+「for this organization from one of these roles.」：片段间原文无逗号，改语序不加
    'set the base role': '设置组织的基本角色',
    'for this organization from one of these roles.': '为以下角色之一。',
    'Read and clone repositories. Open and comment on issues and pull requests.': '读取和克隆存储库。创建议题和拉取请求并发表评论。',
    'Read permissions plus manage issues and pull requests.': '读取权限，外加管理议题和拉取请求。',
    'Triage permissions plus read, clone and push to repositories.': '分类权限，外加读取、克隆和推送存储库。',
    'Write permissions plus manage issues, pull requests and some repository settings.':
      '写入权限，外加管理议题、拉取请求和部分存储库设置。',
    'Full access to repositories including sensitive and destructive actions.': '对存储库的完全访问权限，包括敏感和破坏性操作。',
    'Modify Admin Role': '修改管理员角色',
    'Custom roles': '自定义角色',
    'Create custom roles with GitHub Enterprise': '使用 GitHub 企业版创建自定义角色',
    'Enterprise accounts offer organizations more granular control over permissions by allowing you to configure up to 20 custom repository roles. This enables greater control over who and how your users access code and data in your organization.':
      '企业帐户允许配置最多 20 个自定义存储库角色，让组织能更精细地控制权限。这样可以更好地掌控谁能以何种方式访问组织中的代码和数据。',
    'Non-code contributors who want to view or discuss your project': '希望查看或讨论项目的非代码贡献者',
    'Contributors who need to proactively manage issues and pull requests without write access':
      '需要主动管理议题和拉取请求但无写入访问权限的贡献者',
    'Organization members and collaborators who actively push to your project': '积极向项目推送代码的组织成员和协作者',
    'Project managers who need to manage the repository without access to sensitive or destructive actions':
      '需要管理存储库但无权执行敏感或破坏性操作的项目经理',
    'Mixed roles': '混合角色'
  },
  scoped: {
    // 存储库角色 Moderate（全局 static 是安全严重性“中”）、角色详情里的分组标题
    Moderate: '审核',
    'Moderate:': '审核：',
    'Issue and Pull Request': '议题和拉取请求',
    'Pull Request': '拉取请求',
    'Merge Queue': '合并队列',
    ...REPOSITORY_PERMISSIONS,
    ...ORGANIZATION_PERMISSIONS,
    Members: '成员',
    Read: '读取',
    Triage: '分类',
    Write: '写入',
    Maintain: '维护',
    'Read:': '读取：',
    'Triage:': '分类：',
    'Write:': '写入：',
    'Maintain:': '维护：',
    'Admin:': '管理员：',
    Roles: '角色',
    'Issue and pull requests': '议题和拉取请求',
    // 「You can」+「set the base role」+「for this organization from one of these roles.」
    'You can': '你可以',

    // 组织角色：说明、自定义角色表单
    'Organization roles allow you to grant individuals or teams permissions to manage your organization and its repositories.':
      '组织角色可向个人或团队授予管理组织及其存储库的权限。',
    'Create custom organization roles with GitHub Enterprise': '使用 GitHub 企业版创建自定义组织角色',
    'Upgrade to GitHub Enterprise to create custom organization roles.': '升级到 GitHub 企业版即可创建自定义组织角色。',
    'Create a custom role': '创建自定义角色',
    'Base role': '基本角色',
    'No base repository role': '无基本存储库角色',
    'No permissions': '无权限',
    'Role name': '角色名称',
    'Role description': '角色描述',
    'Save role': '保存角色',
    'Remove role': '移除角色',
    'Delete this role': '删除此角色',
    'Are you sure you want to delete this role?': '确定要删除此角色吗？',
    'Deleting this role will remove it from all teams and members that have been assigned it.':
      '删除此角色后，已分配此角色的所有团队和成员都将失去该角色。',

    // 组织角色：角色分配
    'Add role assignment': '添加角色分配',
    'Remove assignment': '删除分配',
    'Assigned via': '分配来源',
    'Assigned to': '分配给',
    Assignment: '分配',
    Assignments: '分配',
    'Search for users and teams': '搜索用户和团队',
    'Select users or teams': '选择用户或团队',
    'Select role': '选择角色',
    'Filter roles': '筛选角色',
    'All roles': '所有角色',
    'There are no role assignments for this organization.': '此组织暂无角色分配。',
    'Role assigned': '已分配角色',
    // 角色分配页只有 Remove（官方文档：单击 Remove，在弹窗中再单击 Remove），remove → 删除，与本节一致
    'Role removed': '已删除角色',
    'Are you sure you want to remove this role assignment?': '确定要删除此角色分配吗？'
  },
  regexp: [
    // 组织角色详情：• <权限名>（权限名按表整段匹配）；角色图标：<角色名> icon
    [new RegExp(`^• (${alternatives(BULLET_PERMISSIONS)})$`), (_, name: string) => `• ${BULLET_PERMISSIONS[name] ?? name}`],
    [new RegExp(`^(${alternatives(ROLE_ICONS)}) icon$`), (_, name: string) => `${ROLE_ICONS[name] ?? name}图标`],
    [/^(\d+) roles?$/, '$1 个角色'],
    [/^(\d+) permissions?$/, '$1 项权限'],
    [/^(\d+) custom roles?$/, '$1 个自定义角色'],
    [/^(\d+)\/(\d+) custom roles?$/, '$1/$2 个自定义角色'],
    [/^(\d+) users? and (\d+) teams? assigned$/, '已分配 $1 个用户和 $2 个团队'],
    [/^You can create up to (\d+) custom roles\.$/, '最多可创建 $1 个自定义角色。'],
    [
      /^In addition to the available pre-defined roles, you can create up to (\d+) custom roles to fit your needs\.$/,
      '除了现有的预定义角色，你还可以根据需要创建最多 $1 个自定义角色。'
    ]
  ]
} satisfies PageDictionary
