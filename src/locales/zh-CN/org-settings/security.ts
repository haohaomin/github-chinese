import type { PageDictionary, RegExpRule } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * Dependabot 规则页（规则列表、新建 / 编辑表单、删除确认）的 scoped 词条。
 * 存储库设置的 Dependabot 规则页是同一组件，由 repo-settings/security.ts 取用；
 * New rule、/ New rule、Rules 在存储库设置由 branches.ts、nav.ts 收录，不放这里
 */
export const DEPENDABOT_RULES_SCOPED: Readonly<Record<string, string>> = {
  'Rule created.': '规则已创建。',
  'Rule saved. It may take a moment for this rule to be applied to matching alerts': '规则已保存。可能需要一段时间才会应用到匹配的警报',
  'Rule saved.': '规则已保存。',
  'Rule was successfully deleted.': '规则已删除。',
  '/ Dependabot rules': '/ Dependabot 规则',
  'GitHub presets': 'GitHub 预设',
  'Managed by GitHub': '由 GitHub 管理',
  'Edit curated rule': '编辑精选规则',
  'Edit rule': '编辑规则',
  'Dismiss low-impact alerts for development-scoped dependencies': '消除开发范围依赖项的低影响警报',
  'In a developer (non-production or runtime) environment, these alerts are unlikely to be exploitable or have limited effect like slow builds or long-running tests.':
    '在开发环境（非生产、非运行时）中，这些警报不太可能被利用，影响也有限，例如构建变慢或测试耗时较长。',
  'Learn more about this methodology.': '了解此方法。',
  'Repository rules': '存储库规则',
  'Organization rules': '组织规则',
  'Edit custom rule': '编辑自定义规则',
  'The following inputs have errors:': '以下输入有误：',
  'Rule name': '规则名称',
  'Add a rule name': '添加规则名称',
  State: '状态',
  Enforced: '已强制实施',
  // 「目标警报」自动补全只译分组标题，筛选取值（critical、runtime 等）要原样输入查询，照原文
  'Target alerts': '目标警报',
  'Add rule metadata': '添加规则元数据',
  Severities: '严重性',
  Scopes: '范围',
  'Rules will be applied for alerts matching all included metadata.': '规则将应用于匹配所有已包含元数据的警报。',
  'Select one or more rules to apply to matching alerts.': '选择一个或多个规则应用于匹配的警报。',
  'Dependabot will automatically close or reopen alerts based on selected criteria.': 'Dependabot 将根据所选条件自动关闭或重新打开警报。',
  'Until patch is available': '直到有可用补丁',
  // 拉取请求语境的动词 open → 创建（安全更新即 Dependabot 创建的拉取请求）
  'Open a pull request to resolve alerts': '创建拉取请求以解决警报',
  'Dependabot will attempt to open security updates based on selected criteria.': 'Dependabot 将根据所选条件尝试创建安全更新。',
  'Create rule': '创建规则',
  '/ Edit rule': '/ 编辑规则',
  'Save rule': '保存规则',
  'Delete this rule': '删除此规则',
  'Deleting this rule can potentially reopen associated alerts.': '删除此规则可能会重新打开相关警报。',
  'Are you sure you want to delete this rule?': '确定要删除此规则吗？',
  '/ GitHub Preset rule': '/ GitHub 预设规则'
}

/** Dependabot 规则的正则：安全设置页的已启用条数、删除确认（repo-settings/security.ts 同样取用） */
export const DEPENDABOT_RULES_REGEXP: readonly RegExpRule[] = [
  [/^(\d+) rules? enabled$/, '已启用 $1 条规则'],
  // 规则名两侧的引号随原文，原文无逗号，译文不加
  [
    /^This will permanently delete the rule "([^"]{1,200})" and potentially reopen associated alerts\.$/,
    '这将永久删除规则“$1”并可能重新打开相关警报。'
  ]
]

/**
 * 绕过列表内置参与者的名称（actor.name 原值）：存储库角色 admin、maintain、write，组织管理员角色 Organization admin
 * （新版组件里也可能是 admin，故 admin 只作“管理员”），无名称时的兜底词 Unknown。用 Map 查找，constructor 等原型链键不会命中
 */
const BYPASS_ACTOR_NAMES: ReadonlyMap<string, string> = new Map([
  ['admin', '管理员'],
  ['maintain', '维护'],
  ['write', '写入'],
  ['Organization admin', '组织管理员'],
  ['Unknown', '未知']
])

/**
 * 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（repo-settings/security.ts 同样取用）。
 * 内置参与者用译名（同名的团队、用户也会译出）；其余团队、应用、用户、自定义角色的名称原样保留
 */
export const BYPASS_ACTOR_ACTIONS_RULE: RegExpRule = [
  /^(.+) Bypass actor actions$/,
  (_, name: string) => {
    const builtin = BYPASS_ACTOR_NAMES.get(name)
    return builtin === undefined ? `绕过参与者 ${name} 的操作` : `绕过参与者${builtin}的操作`
  }
]

/**
 * 安全：身份验证安全（双因素身份验证、SAML 单一登录、SSH 证书颁发机构、IP 允许列表）、Advanced Security（配置、全局设置）、
 * Dependabot 规则、已验证和批准的域、合规。
 * 个人和存储库的“代码安全”设置页有大量同名文字，这部分放 scoped。
 */
export default {
  static: {
    // 身份验证安全：双因素身份验证
    'Requiring an additional authentication method adds another level of security for your organization.':
      '要求额外的身份验证方法可以为组织增加一层安全保障。',
    'Require two-factor authentication for everyone in your organization': '要求组织中的所有人启用双因素身份验证',
    'Only allow secure two-factor methods': '仅允许安全的双因素方法',
    'Members, billing managers, and outside collaborators who do not have two-factor authentication enabled for their personal account will be removed from the organization and will receive an email notifying them about the change.':
      '未在个人帐户上启用双因素身份验证的成员、账单管理员和外部协作者将被移出组织，并会收到通知电子邮件。',
    'Enabling two-factor authentication requirement.': '正在启用双因素身份验证要求。',
    'Disabled two-factor authentication requirement.': '已禁用双因素身份验证要求。',

    // 身份验证安全：SSH 证书颁发机构
    'SSH Certificate Authorities': 'SSH 证书颁发机构',
    'SSH certificate authorities': 'SSH 证书颁发机构',
    'Provide SSH certificates that members can use to access your resources with Git': '提供 SSH 证书供成员通过 Git 访问你的资源',
    'New CA': '新建 CA',
    'Add CA': '添加 CA',
    'Require SSH Certificates': '要求使用 SSH 证书',
    'I understand, please delete this CA': '我已了解，删除此 CA',

    // 身份验证安全：IP 允许列表
    'An IP allow list lets your organization limit access based on the IP address a person is accessing from.':
      'IP 允许列表可让组织根据访问者的 IP 地址限制访问。',
    // 原文无标点，译文不加
    "Restrict access to your organization's assets by configuring a list of IP addresses that are allowed to connect":
      '配置允许连接的 IP 地址列表以限制对组织资产的访问',
    'Restrict access to your organization’s assets by configuring a list of IP addresses that are allowed to connect':
      '配置允许连接的 IP 地址列表以限制对组织资产的访问',
    'Enable IP allow list': '启用 IP 允许列表',
    'Enable IP allow list configuration for installed GitHub Apps': '为已安装的 GitHub 应用启用 IP 允许列表配置',

    // 身份验证安全：SAML 单一登录（GitHub Enterprise Cloud 组织）
    'Enable SAML authentication': '启用 SAML 身份验证',
    'Sign on URL': '登录 URL',
    'Public certificate': '公共证书',
    'Test SAML configuration': '测试 SAML 配置',

    // Advanced Security：配置
    'Code security configurations': '代码安全配置',
    'New configuration': '新建配置',
    'Apply to': '应用到',
    'Apply configuration': '应用配置',
    'All repositories without configurations': '所有未应用配置的存储库',
    'Detach configuration': '分离配置',
    'Use as default for newly created repositories': '用作新建存储库的默认配置',
    'Enforce configuration': '强制实施配置',
    'Custom configuration': '自定义配置',
    'Update configuration': '更新配置',
    'Dependency scanning': '依赖项扫描',
    'Malware alerts': '恶意软件警报',
    'Scan for AI-detected secrets': '扫描 AI 检测到的机密',
    'Generic patterns': '通用模式',
    'Extended metadata': '扩展元数据',
    'Specific actors': '特定参与者',
    'Select actors': '选择参与者',
    'Specific roles or teams': '特定角色或团队',
    'Add role or team': '添加角色或团队',

    // 机密风险评估、绕过请求、自定义模式
    Assessments: '评估',
    'Scan your organization': '扫描你的组织',
    'Rerun scan': '重新运行扫描',
    'Preview cost and enable Secret Protection': '预览费用并启用机密保护',
    'Review and enable': '查看并启用',
    'For all repositories': '适用于所有存储库',
    'For public repositories for free': '免费用于公共存储库',
    'Configure in settings': '在设置中配置',
    'Approve bypass request': '批准绕过请求',
    'Deny bypass request': '拒绝绕过请求',
    'Push protection bypass': '推送保护绕过',
    'All statuses': '所有状态',
    'Publish pattern': '发布模式',
    'All repositories in the organization': '组织中的所有存储库',

    // Advanced Security：全局设置（组织专用）
    "Security and analysis features help keep your repositories secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your organization's repositories.":
      '安全与分析功能可帮助你的存储库保持安全和最新。启用这些功能即表示你授权我们对组织的存储库执行只读分析。',
    'Security and analysis features help keep your repositories secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your organization’s repositories.':
      '安全与分析功能可帮助你的存储库保持安全和最新。启用这些功能即表示你授权我们对组织的存储库执行只读分析。',
    'Grant Dependabot access to private repositories': '授予 Dependabot 访问专用存储库的权限',
    'In order to update dependencies in your organization, Dependabot accesses dependencies in all public repositories and the selected private repositories. The contents of these repositories will be accessible to all users in your organization through Dependabot updates. Be sure that you want to share these repositories with everyone in your organization or consider using private registries instead.':
      '为了更新组织中的依赖项，Dependabot 会访问所有公共存储库和所选专用存储库中的依赖项。组织中的所有用户都可以通过 Dependabot 更新访问这些存储库的内容。请确认你要与组织中的所有人共享这些存储库，或考虑改用专用注册表。',
    'Add private repositories': '添加专用存储库',
    'Add a private repository': '添加专用存储库',
    'Choose which repositories Dependabot can access.': '选择 Dependabot 可以访问的存储库。',
    'repositories Dependabot can access.': '存储库可供 Dependabot 访问。',
    'Public repositories only': '仅公共存储库',
    'Public and internal repositories only': '仅公共和内部存储库',
    'Grant a team permission to manage security alerts and settings across your organization. This team will also be granted read access to all repositories.':
      '授予团队管理整个组织安全警报和设置的权限。该团队还将获得所有存储库的读取访问权限。',
    'Keep scheduled scans running every 30 days for inactive repositories': '对不活跃存储库每 30 天继续运行一次计划扫描',

    // Dependabot 规则（组织专用）
    'Rules will target all public repositories in this organization.': '规则将针对此组织中的所有公共存储库。',
    'Rule is enabled by default for all public repositories.': '规则默认对所有公共存储库启用。',
    'Rule is enabled for all public repositories and can never be disabled by individual repositories.':
      '规则对所有公共存储库启用，且单个存储库无法禁用。',
    'Rule can never be enabled on any repositories.': '规则无法在任何存储库上启用。',

    // 已验证和批准的域
    "You can verify the domains controlled by your organization to confirm your organization's identity on GitHub. A":
      '你可以验证组织控制的域，以在 GitHub 上确认组织的身份。如果个人资料上显示的所有域（例如公开电子邮件或网站 URL）都已验证，组织个人资料页面上将添加',
    'You can verify the domains controlled by your organization to confirm your organization’s identity on GitHub. A':
      '你可以验证组织控制的域，以在 GitHub 上确认组织的身份。如果个人资料上显示的所有域（例如公开电子邮件或网站 URL）都已验证，组织个人资料页面上将添加',
    "badge will be added to your organization's profile page if all of the domains displayed on your profile (e.g. public email or website URL) are verified. You may also approve a domain by first adding it to the list of eligible domains. Approved domains may be used for email notification routing to users with verified emails that do not belong to a domain that you can verify.":
      '徽章。你也可以先将域添加到合格域列表，再批准该域。已批准的域可用于向电子邮件已验证、但不属于你可验证域的用户路由电子邮件通知。',
    'badge will be added to your organization’s profile page if all of the domains displayed on your profile (e.g. public email or website URL) are verified. You may also approve a domain by first adding it to the list of eligible domains. Approved domains may be used for email notification routing to users with verified emails that do not belong to a domain that you can verify.':
      '徽章。你也可以先将域添加到合格域列表，再批准该域。已批准的域可用于向电子邮件已验证、但不属于你可验证域的用户路由电子邮件通知。',
    'Learn more about verifying or approving a domain for your enterprise.': '了解如何为企业验证或批准域。',
    'Learn more about verifying or approving a domain for your organization.': '了解如何为组织验证或批准域。',
    "Can't verify this domain?": '无法验证此域？',
    'Can’t verify this domain?': '无法验证此域？',
    'Approve it instead': '改为批准',
    'Restrict email notifications to only approved or verified domains': '仅向已批准或已验证的域发送电子邮件通知',

    // 合规
    'Compliance reports': '合规报告',
    'ISO/IEC 27001:2022 certification': 'ISO/IEC 27001:2022 认证',
    'ISO/IEC 27001:2013 certification': 'ISO/IEC 27001:2013 认证',
    'Cloud Security Alliance CAIQ self-assessment (CSA CAIQ - Level 1)': '云安全联盟 CAIQ 自评估 (CSA CAIQ - Level 1)'
  },
  scoped: {
    // 身份验证安全
    'Try risk-free for 30 days': '免费试用 30 天',
    'learn more': '了解更多',
    'dismiss this message.': '关闭此消息。',
    Key: '密钥',
    'IP allow list': 'IP 允许列表',
    'IP address or range in CIDR notation': 'IP 地址或 CIDR 表示的地址范围',
    'Short description of IP address or range': 'IP 地址或范围的简短描述',
    'Check IP address': '检查 IP 地址',
    'Yes, delete this IP allow list entry': '是，删除此 IP 允许列表条目',

    // Advanced Security：配置（与存储库设置共用）
    'Security configurations': '安全配置',
    'GitHub recommended': 'GitHub 推荐',
    'Save configuration': '保存配置',
    Enforce: '强制实施',
    "Don't enforce": '不强制实施',
    'Don’t enforce': '不强制实施',
    'Private and internal': '专用和内部',
    'Not set': '未设置',
    'Security updates': '安全更新',
    'Dependabot on Actions runners': '操作运行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自托管运行器上的 Dependabot',
    Exempt: '豁免',
    'Default setup': '默认设置',
    'Validity checks': '有效性检查',
    'Non-provider patterns': '非提供程序模式',
    'Scan for generic passwords': '扫描通用密码',
    'Bypass privileges': '绕过权限',

    // 推送保护绕过参与者（安全配置、规则集共用的绕过列表组件）；原文无逗号，译文不加
    'Push Protection will run and the selected actor(s) will be prompted to bypass': '推送保护会运行并向所选参与者显示绕过提示',
    'Push Protection will not run and no bypass prompt will be shown': '推送保护不会运行也不显示绕过提示',
    'No actors have been selected': '尚未选择参与者',
    'At least one actor is required.': '至少需要一个参与者。',
    'Bypass actors are managed by policy or security configuration': '绕过参与者由策略或安全配置管理',
    'Bypass actors are managed by policy/security configuration.': '绕过参与者由策略/安全配置管理。',
    'Search for bypass actors': '搜索绕过参与者',
    'Adjust your search term to find other bypass actors': '调整搜索词以查找其他绕过参与者',
    'Actor is already added': '已添加此参与者',
    'Failed to fetch suggestions': '获取建议失败',
    'Failed to update bypass actor.': '更新绕过参与者失败。',
    'Choose which roles and teams can bypass this ruleset': '选择可以绕过此规则集的角色和团队',

    // Advanced Security：全局设置（与个人、存储库“代码安全”设置共用）
    'Try our new settings': '试用新设置',
    'Security & analysis': '安全与分析',
    'Security and analysis features help keep your repositories secure and updated.': '安全与分析功能可帮助你的存储库保持安全和最新。',
    'Disable all': '全部禁用',
    'Enable all': '全部启用',
    // 「全部启用 / 全部禁用」按钮的无障碍标签（与个人设置一致）
    'Enable all private vulnerability reporting': '全部启用专用漏洞报告',
    'Disable all private vulnerability reporting': '全部禁用专用漏洞报告',
    'Enable all dependency graph': '全部启用依赖项关系图',
    'Disable all dependency graph': '全部禁用依赖项关系图',
    'Enable all Dependabot alerts': '全部启用 Dependabot 警报',
    'Disable all Dependabot alerts': '全部禁用 Dependabot 警报',
    'Enable all Dependabot security updates': '全部启用 Dependabot 安全更新',
    'Disable all Dependabot security updates': '全部禁用 Dependabot 安全更新',
    'Enable all grouped security updates': '全部启用分组安全更新',
    'Disable all grouped security updates': '全部禁用分组安全更新',
    'Enable all dependabot on actions': '全部启用操作运行器上的 Dependabot',
    'Disable all dependabot on actions': '全部禁用操作运行器上的 Dependabot',
    'Enable all dependabot self-hosted': '全部启用自托管运行器上的 Dependabot',
    'Disable all dependabot self-hosted': '全部禁用自托管运行器上的 Dependabot',
    'Automatically enable for new public repositories': '为新的公共存储库自动启用',
    'Disable private vulnerability reporting': '禁用专用漏洞报告',
    'Enable by default for new public repositories': '为新的公共存储库默认启用',
    'Automatically enable for new private repositories': '为新的专用存储库自动启用',
    'Enable by default for new private repositories': '为新的专用存储库默认启用',
    'Dependabot alerts': 'Dependabot 警报',
    'Automatically enable for new repositories': '为新存储库自动启用',
    'Enable by default for new repositories': '为新存储库默认启用',
    'Dependabot security updates': 'Dependabot 安全更新',
    'Grouped security updates': '分组安全更新',
    'Learn how to group updates.': '了解如何分组更新。',
    'learn more here': '在此了解更多',
    'Code scanning': '代码扫描',
    'Identify vulnerabilities and errors with': '使用',
    '. Default CodeQL analysis will be set up on': '识别漏洞和错误。默认 CodeQL 分析将设置于',
    eligible: '符合条件的',
    'public repositories.': '公共存储库。',
    'Recommend the extended query suite for repositories enabling default setup': '为启用默认设置的存储库推荐扩展查询套件',
    'The extended query includes the default suite, plus lower severity and precision queries.':
      '扩展查询包含默认套件，外加较低严重性和精确度的查询。',
    'Enable code scanning default setup': '启用代码扫描默认设置',
    'This will turn on CodeQL default setup for all eligible public repositories and repositories with GitHub Advanced Security enabled.':
      '这将为所有符合条件的公共存储库以及已启用 GitHub 高级安全的存储库开启 CodeQL 默认设置。',
    'What makes a repository eligible for default setup?': '存储库需满足哪些条件才能使用默认设置？',
    'Query suites': '查询套件',
    // 「Group of queries」+「to run against your code.」（与存储库设置一致，不加逗号）
    'Group of queries': '一组查询',
    'to run against your code.': '用于对你的代码运行。',
    Extended: '扩展',
    'Recommended by your organization. Queries from the default suite, plus lower severity and precision queries.':
      '由你的组织推荐。默认套件中的查询，外加较低严重性和精确度的查询。',
    'Code scanning uses GitHub Actions. Also, repositories where code scanning is already enabled will not be re-enabled.':
      '代码扫描使用 GitHub 操作。此外，已启用代码扫描的存储库不会被重复启用。',
    'Disable code scanning default setup': '禁用代码扫描默认设置',
    'This will disable CodeQL default setup on all repositories where it is enabled.': '这将在所有已启用 CodeQL 默认设置的存储库中禁用它。',
    'Secret scanning': '机密扫描',
    'Push protection': '推送保护',
    'Block commits that contain': '阻止提交中出现',
    'supported secrets': '受支持的机密',
    'Automatically enable for repositories added to secret scanning': '为添加到机密扫描的存储库自动启用',
    'Add a resource link in the CLI and web UI when a commit is blocked': '提交被阻止时在 CLI 和网页界面中添加资源链接',
    'Add a resource link in the CLI and the web UI when a commit is blocked': '提交被阻止时在 CLI 和网页界面中添加资源链接',
    // 「Link will show in addition to」+「the message GitHub displays」
    'Link will show in addition to': '链接将附加到',
    'the message GitHub displays': 'GitHub 显示的消息',
    'Save link': '保存链接',
    'Save Link': '保存链接',
    'Enable secret scanning for eligible repositories?': '为符合条件的存储库启用机密扫描？',
    'This will turn on secret scanning for all public repositories.': '这将为所有公共存储库开启机密扫描。',
    'Enable for eligible repositories': '为符合条件的存储库启用',
    'Disable secret scanning?': '禁用机密扫描？',
    'This will disable secret scanning on all repositories where it is enabled.': '这将在所有已启用机密扫描的存储库中禁用它。',
    'Disable secret scanning': '禁用机密扫描',
    'Enable push protection for eligible repositories?': '为符合条件的存储库启用推送保护？',
    'This will turn on push protection for all repositories that have secret scanning enabled.':
      '这将为所有已启用机密扫描的存储库开启推送保护。',
    'Push protection coverage': '推送保护覆盖范围',
    'Already enabled': '已启用',
    'Will be enabled': '将启用',
    'Not eligible': '不符合条件',
    'Disable push protection?': '禁用推送保护？',
    'You can still enable push protection at the repository level.': '你仍可在存储库级别启用推送保护。',
    'Disable push protection': '禁用推送保护',
    'Enable push protection': '启用推送保护',
    'This will disable push protection on all repositories where it is enabled.': '这将在所有已启用推送保护的存储库中禁用它。',
    'Learn more about these security privileges': '了解这些安全权限',
    'Search for teams': '搜索团队',
    'Edit runner type for Dependabot': '编辑 Dependabot 的运行器类型',
    'Runner label': '运行器标签',
    'Runner group name': '运行器组名称',
    'Pattern configurations': '模式配置',
    'Organization setting': '组织设置',
    'Enterprise setting': '企业设置',
    'New pattern': '新建模式',
    'Save and dry run': '保存并试运行',
    'Additional settings': '其他设置',

    // Dependabot 存储库访问（组织专用）：显示「Repository access」选择器时，「Select」/「Choose」与后段之间插入的片段，
    // 拼作「选择 其他 存储库」「选择 其他 存储库可供 Dependabot 访问。」
    additional: '其他',

    // Dependabot 规则（与存储库设置共用）
    ...DEPENDABOT_RULES_SCOPED,
    // 以下三条存储库设置由 branches.ts、nav.ts 收录，不放进共用常量
    'New rule': '新建规则',
    '/ New rule': '/ 新建规则',
    Rules: '规则',

    // SAML 单一登录（GitHub Enterprise Cloud 组织）
    Issuer: '颁发者',
    'Signature method': '签名方法',
    'Digest method': '摘要方法',
    'Require SAML SSO authentication for all members': '要求所有成员通过 SAML SSO 进行身份验证',
    'Save SAML settings': '保存 SAML 设置',

    // IP 允许列表条目
    'Edit IP allow list entry': '编辑 IP 允许列表条目',
    'Delete IP allow list entry': '删除 IP 允许列表条目',

    // Advanced Security：配置、安全管理员
    Enforcement: '强制实施',
    'Security manager team': '安全管理员团队',
    'Add team': '添加团队',

    // 已验证和批准的域
    'Approve domain': '批准域'
  },
  regexp: [
    // 句号随原文
    [
      new RegExp(`^Require two-factor authentication for everyone in the ${ORG} organization(\\.?)$`),
      (_, org: string, dot: string) => `要求 ${org} 组织中的所有人启用双因素身份验证${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^Require SAML SSO authentication for all members of the ${ORG} organization(\\.?)$`),
      (_, org: string, dot: string) => `要求 ${org} 组织的所有成员通过 SAML SSO 进行身份验证${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^You[’']re about to enable private vulnerability reporting on all public repositories in ${ORG}\\.$`),
      '你即将为 $1 中的所有公共存储库启用专用漏洞报告。'
    ],
    [
      new RegExp(`^You[’']re about to disable private vulnerability reporting on all public repositories in ${ORG}\\.$`),
      '你即将为 $1 中的所有公共存储库禁用专用漏洞报告。'
    ],
    [
      new RegExp(`^You[’']re about to enable dependency graph on all private repositories in ${ORG}\\.$`),
      '你即将为 $1 中的所有专用存储库启用依赖项关系图。'
    ],
    [
      new RegExp(
        `^You[’']re about to disable dependency graph on all private repositories in ${ORG}\\. This will also disable Dependabot alerts and Dependabot security updates on those repositories\\.$`
      ),
      '你即将为 $1 中的所有专用存储库禁用依赖项关系图。这也会禁用这些存储库的 Dependabot 警报和 Dependabot 安全更新。'
    ],
    [
      new RegExp(
        `^You[’']re about to enable Dependabot alerts on all repositories in ${ORG}\\. Alerts require the dependency graph, so we[’']ll also turn that on for all repositories\\. No notifications will be sent while Dependabot alerts are being enabled\\.$`
      ),
      '你即将为 $1 中的所有存储库启用 Dependabot 警报。警报需要依赖项关系图，因此我们也会为所有存储库开启它。启用 Dependabot 警报期间不会发送通知。'
    ],
    [
      new RegExp(
        `^You[’']re about to disable Dependabot alerts on all repositories in ${ORG}\\. This will also disable Dependabot security updates on those repositories\\.$`
      ),
      '你即将为 $1 中的所有存储库禁用 Dependabot 警报。这也会禁用这些存储库的 Dependabot 安全更新。'
    ],
    [
      new RegExp(
        `^You[’']re about to enable Dependabot security updates on all repositories in ${ORG}\\. Dependabot security updates require the dependency graph and Dependabot alerts, so we[’']ll also turn that on for all repositories\\.$`
      ),
      '你即将为 $1 中的所有存储库启用 Dependabot 安全更新。Dependabot 安全更新需要依赖项关系图和 Dependabot 警报，因此我们也会为所有存储库开启它们。'
    ],
    [
      new RegExp(`^You[’']re about to disable Dependabot security updates on all repositories in ${ORG}\\.$`),
      '你即将为 $1 中的所有存储库禁用 Dependabot 安全更新。'
    ],
    [
      new RegExp(
        `^You[’']re about to enable grouped security updates on all repositories in ${ORG}\\. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we[’']ll also turn that on for all repositories\\.$`
      ),
      '你即将为 $1 中的所有存储库启用分组安全更新。分组安全更新需要依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此我们也会为所有存储库开启它们。'
    ],
    [
      new RegExp(`^You[’']re about to disable grouped security updates on all repositories in ${ORG}\\.$`),
      '你即将为 $1 中的所有存储库禁用分组安全更新。'
    ],
    [
      /^This will disable push protection on (\d+) repositor(?:y|ies) where it is enabled\.$/,
      '这将在 $1 个已启用推送保护的存储库中禁用它。'
    ],
    // Dependabot 规则（与存储库设置共用）；「Managed by <组织>」由合并进来的规则集词典收录
    ...DEPENDABOT_RULES_REGEXP,
    // 推送保护绕过列表标题：「3 actors」
    [/^(\d+) actors?$/, '$1 个参与者'],
    // 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（与存储库设置共用）
    BYPASS_ACTOR_ACTIONS_RULE,
    [/^Approve ([\w-]+(?:\.[\w-]+)+)$/, '批准 $1']
  ]
} satisfies PageDictionary
