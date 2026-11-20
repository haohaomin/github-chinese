import type { PageDictionary } from '../../../core/types'

/**
 * 新建组织：选择计划页的“比较功能”表（/organizations/plan、/account/organizations/new；/pricing 同一张表）。
 * 计划卡片见 new.ts。表格与 /account/upgrade 的比较表相同：分组名与长说明由 settings-account 的 static
 * 提供（全站同一译法），Features on、Switch plans 等由 common 翻译，此处不重复收录；
 * 其余词条（短功能名、单元格）放 scoped，只在 new 生效。
 * 产品名、方案名译成中文（用户决定，2026-10-27）：表中单独出现的 GitHub Actions / Codespaces / Packages、
 * GitHub Secret Protection / Code Security、Copilot Autofix、Enterprise Cloud / Server / Managed Users、GitHub Connect
 * 在此收录；窄屏计划选择的小写 free / team / enterprise（CSS 首字母大写）同样译“X 版”。
 * 自造品牌词 CodeQL、技术缩写 LDAP 保留原文；价格后的货币代码 USD 按用户要求译作美元。
 */
export default {
  scoped: {
    // 页头与比较表框架
    'Choose a plan': '选择计划',
    'Compare features': '比较功能',
    'How to get started': '如何开始',
    'Join for free': '免费加入',
    'Start Enterprise trial': '开始企业版试用',
    'per month forever': '每月 永久',
    'Contact our sales team': '联系我们的销售团队',
    'to learn more.': '以了解更多。',
    // 窄屏计划选择：Features on <span>team</span>（common 的 inline 规则把计划名移到句首）
    free: '免费版',
    team: '团队版',
    enterprise: '企业版',

    // 单元格
    Available: '可用',
    Unlimited: '无限制',
    'Usage-based': '基于使用情况',
    // 价格后的币种：$<span>4</span> <span>USD</span>
    USD: '美元',
    'Ability to increase spend limit': '可提高支出上限',
    // Enterprise Cloud、Enterprise Server 由 common/pages.ts 的全局词条翻译

    // 分组（Code Security、Secret Protection 由 common 翻译；带 GitHub 前缀的全称见下方行名）
    Collaboration: '协作',

    // 代码管理
    'Public repositories': '公共存储库',
    'Private repositories': '专用存储库',

    // 代码工作流
    'GitHub Actions': 'GitHub 操作',
    'GitHub Codespaces': 'GitHub 代码空间',
    'GitHub Packages': 'GitHub 软件包',
    'GitHub sandbox (public preview)': 'GitHub 沙盒（公开预览）',
    'Run agent-generated code safely in isolated, stateful cloud environments with snapshot and resume.':
      '在隔离的有状态云环境中安全运行智能体生成的代码，支持快照和恢复。',
    'Code reviews': '代码审查',
    'Multiple pull request assignees': '拉取请求的多个受理人',
    'Repository insights': '存储库洞察',
    // Scheduled reminders 由 org-settings 收录
    'Automatic code review assignment': '自动分配代码审查',

    // 协作
    'Collaborators for public repositories': '公共存储库的协作者',
    'Collaborators for private repositories': '专用存储库的协作者',
    // Issues、Projects 等行名由 common 翻译
    Milestones: '里程碑',
    'Organization and team management': '组织和团队管理',
    'Pages and wikis': '页面和 Wiki',
    'Multiple issue assignees': '议题的多个受理人',

    // 机密保护（provider 译“提供程序”；Provider patterns 由 repo-settings 的 static 译作“提供程序模式”，此处不重复）
    'GitHub Secret Protection': 'GitHub 机密保护',
    'Push protection': '推送保护',
    'Prevent secret exposures by proactively blocking secrets before they reach your code.': '在机密进入代码前主动拦截，防止机密泄露。',
    'Secret scanning': '机密扫描',
    'Detect and manage exposed secrets across git history, pull requests, issues, and wikis.':
      '在 Git 历史记录、拉取请求、议题和 Wiki 中检测并管理已泄露的机密。',
    'GitHub collaborates with AWS, Azure, and Google Cloud to detect secrets with high accuracy. This minimizes false positives, letting you focus on what matters.':
      'GitHub 与 AWS、Azure 和 Google Cloud 合作，高精度检测机密，尽量减少误报，让你专注于重要的事。',
    'Provider notification': '提供程序通知',
    'Providers get real-time alerts when their tokens appear in public code, enabling them to notify, quarantine, or revoke secrets.':
      '提供程序的令牌出现在公共代码中时，提供程序会实时收到警报，以便通知、隔离或撤销机密。',
    'Validity checks': '有效性检查',
    'Prioritize active secrets with validity checks for provider patterns.': '通过提供程序模式的有效性检查，优先处理仍有效的机密。',
    'AI detection for alerts': '警报 AI 检测',
    'Use AI to detect unstructured secrets, like passwords, in existing code.': '使用 AI 检测现有代码中的非结构化机密（如密码）。',
    'AI detection for push protection': '推送保护 AI 检测',
    'Use AI to detect unstructured secrets, like passwords, and block pushes that contain them.':
      '使用 AI 检测非结构化机密（如密码），并阻止包含这些机密的推送。',
    'Detect tokens from unknown providers, including HTTP authentication headers, connection strings, and private keys.':
      '检测来自未知提供程序的令牌，包括 HTTP 身份验证标头、连接字符串和私钥。',
    'Create your own patterns and find organization-specific secrets.': '创建你自己的模式，查找组织特有的机密。',
    'Push protection bypass controls': '推送保护绕过控制',
    'Manage who can bypass push protection and when.': '管理谁可以在何时绕过推送保护。',
    'Insights in security overview': '安全概述洞察',
    'Understand how risk is distributed across your organization with security metrics and insight dashboards.':
      '通过安全指标和洞察仪表板，了解风险在组织中的分布。',
    'Scan history API': '扫描历史记录 API',
    'Review how and when GitHub scans your repositories for secrets.': '查看 GitHub 何时以及如何扫描存储库中的机密。',

    // 代码安全
    'GitHub Code Security': 'GitHub 代码安全',
    'Copilot Autofix': 'Copilot 自动修复',
    'Powered by GitHub Copilot, generate automatic fixes for 90% of alert types in JavaScript, Typescript, Java, and Python.':
      '由 GitHub Copilot 提供支持，为 JavaScript、TypeScript、Java 和 Python 中 90% 的警报类型自动生成修复。',
    'Third party extensibility for code scanning alerts': '代码扫描警报第三方扩展',
    'Centralize your findings across all your scanning tools via SARIF upload to GitHub.':
      '通过将 SARIF 上传到 GitHub，集中管理所有扫描工具的结果。',
    'Contextual vulnerability intelligence and advice': '上下文漏洞情报与建议',
    'Quickly remediate with context provided by Copilot Autofix.': '借助 Copilot 自动修复提供的上下文快速修复。',
    'Uncover vulnerabilities in your code with our industry-leading semantic code analysis.':
      '借助业界领先的语义代码分析发现代码中的漏洞。',
    'Security campaigns': '安全活动',
    'Reduce security debt and burn down your security backlog with security campaigns.': '通过安全活动减少安全债务，清理安全积压。',
    'Get a clear view of your project’s dependencies with a summary of manifest, lock files, and submitted dependencies via the API.':
      '通过清单、锁定文件和经 API 提交的依赖项摘要，清楚了解项目的依赖项。',
    "Get a clear view of your project's dependencies with a summary of manifest, lock files, and submitted dependencies via the API.":
      '通过清单、锁定文件和经 API 提交的依赖项摘要，清楚了解项目的依赖项。',
    'Dependency review action': '依赖项审查操作',
    'Catch insecure dependencies before adding them and get insights on licenses, dependents, and age.':
      '在添加不安全的依赖项前将其拦截，并了解许可证、被依赖和存在时长等信息。',
    'Dependabot custom auto-triage rules': 'Dependabot 自定义自动分类规则',
    'Define alert-centric policies to control how Dependabot handles alerts and pull requests.':
      '定义以警报为中心的策略，控制 Dependabot 处理警报和拉取请求的方式。',
    'Dependabot security updates with grouped updates': '支持分组更新的 Dependabot 安全更新',
    'Automated pull requests that batch dependency updates for known vulnerabilities.': '自动创建拉取请求，批量更新存在已知漏洞的依赖项。',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Automated pull requests that keep your dependencies up to date.': '自动创建拉取请求，使依赖项保持最新。',
    'Get a clear view of risk distribution with security metrics and dashboards.': '通过安全指标和仪表板清楚了解风险分布。',

    // 平台安全与合规
    SBOMs: 'SBOM',
    'Artifact attestations': '产物证明',
    'GitHub Security Advisories': 'GitHub 安全公告',
    'Role-based access control': '基于角色的访问控制',
    'Required 2FA': '强制 2FA',
    'Audit log API': '审核日志 API',
    'Keep copies of audit log data to ensure secure IP and maintain compliance for your organization.':
      '保留审核日志数据副本，以保护知识产权并维持组织合规。',
    'SAML single sign-on (SSO)': 'SAML 单一登录 (SSO)',
    'Access GitHub Enterprise Server using your existing accounts and centrally manage repository access.':
      '使用现有帐户访问 GitHub 企业服务器，并集中管理存储库访问权限。',
    'IP allow list': 'IP 允许列表',
    'Limit access to known allowed IP addresses.': '仅允许已知的 IP 地址访问。',

    // 市场与集成
    'GitHub Apps': 'GitHub 应用',
    'Status checks': '状态检查',
    'Pre-receive hooks': '预接收钩子',
    'Create requirements for automatically accepting or rejecting a push based on the contents of the push.':
      '根据推送内容设定自动接受或拒绝推送的条件。',

    // 支持与部署
    'Community Support': '社区支持',
    'Standard Support': '标准支持',
    // Premium Plus → 高级增强（与 common 的 /premium-support 页一致）
    'Premium and Premium Plus Support': '高级支持和高级增强支持',
    'Invoice billing': '发票付款',
    'Pay bills via invoice, rather than using your credit card.': '通过发票支付账单，而不是使用信用卡。',
    'Self-hosted deployment': '自托管部署',
    'Self-hosted GitHub for on-prem appliances or self-managed cloud tenants.': '在本地设备或自管理云租户上自托管 GitHub。',
    'Enterprise Managed Users': '企业托管用户',
    'GitHub Connect': 'GitHub 连接',
    'Multi-tenant enterprise SaaS solution on Microsoft Azure, allowing you to choose a regional cloud deployment for data residency, so your in-scope data is stored at rest in a designated location. This is available in the EU and Australia with additional regions coming soon.':
      'Microsoft Azure 上的多租户企业 SaaS 解决方案，可选择区域云部署实现数据驻留，让范围内的静态数据存储在指定位置。目前已在欧盟和澳大利亚推出，更多区域即将推出。'
  },
  regexp: [
    // 使用量与支出上限
    [/^([\d,]+) minutes\/month$/, '每月 $1 分钟'],
    [/^(\$[\d,]+(?:\.\d+)?) spend limit$/, '$1 支出上限']
  ]
} satisfies PageDictionary
