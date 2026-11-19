import { TIME_SOURCE, joinCjk, translateTime } from '../helpers'
import type { PageDictionary } from '../../../core/types'
import { BYPASS_ACTOR_ACTIONS_RULE, DEPENDABOT_RULES_REGEXP, DEPENDABOT_RULES_SCOPED } from '../org-settings/security'

/**
 * 存储库设置 · 高级安全（代码安全与分析）：专用漏洞报告、依赖项关系图、自动依赖项提交、Dependabot、
 * 代码扫描（CodeQL 默认 / 高级设置、Copilot 自动修复、检查运行失败阈值）、机密保护、警报访问权限；
 * Dependabot 规则页（/<owner>/<repo>/settings/dependabot_rules）。
 * 与组织设置共用的文字沿用 org-settings / settings-developer 的译法；Dependabot 规则页取用 org-settings/security.ts 的共用常量。
 * 产品名译法见 nav.ts 文件头：Advanced Security → 高级安全、Secret Protection → 机密保护、Actions 运行器 → 操作运行器
 * （与 org-settings/security.ts 同一标签同译）、GitHub Actions → GitHub 操作、Copilot Autofix → Copilot 自动修复；
 * CodeQL、Dependabot 保留。
 */
export default {
  static: {
    // 简介
    "Advanced Security features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository.":
      '高级安全功能有助于保持存储库安全并及时更新。启用这些功能即表示你授权我们对存储库执行只读分析。',
    'Advanced Security features help keep your repository secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repository.':
      '高级安全功能有助于保持存储库安全并及时更新。启用这些功能即表示你授权我们对存储库执行只读分析。',
    "Advanced Security features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository. Unarchive your repository to access additional features.":
      '高级安全功能有助于保持存储库安全并及时更新。启用这些功能即表示你授权我们对存储库执行只读分析。取消存档存储库后可使用更多功能。',
    'Advanced Security features help keep your repository secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repository. Unarchive your repository to access additional features.':
      '高级安全功能有助于保持存储库安全并及时更新。启用这些功能即表示你授权我们对存储库执行只读分析。取消存档存储库后可使用更多功能。',
    "Security and analysis features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository.":
      '安全和分析功能有助于保持存储库安全并及时更新。启用这些功能即表示你授权我们对存储库执行只读分析。',
    'Security and analysis features help keep your repository secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repository.':
      '安全和分析功能有助于保持存储库安全并及时更新。启用这些功能即表示你授权我们对存储库执行只读分析。',

    // 专用漏洞报告、依赖项关系图
    'Allow your community to privately report potential security vulnerabilities to maintainers and repository owners.':
      '允许社区向维护者和存储库所有者私下报告潜在的安全漏洞。',
    'Learn more about private vulnerability reporting': '了解专用漏洞报告',
    'Enable private vulnerability reporting': '启用专用漏洞报告',
    'Understand your dependencies.': '了解你的依赖项。',
    'Dependency Scanning': '依赖项扫描',
    'Understand the packages this repository depends on and secure its': '了解此存储库依赖的软件包并保护其',
    'software supply chain': '软件供应链',
    'Learn more about software supply chain security (opens in a new tab)': '了解软件供应链安全（在新标签页中打开）',
    "Identify and understand your project's dependencies.": '识别并了解项目的依赖项。',
    'Identify and understand your project’s dependencies.': '识别并了解项目的依赖项。',
    'Disabling the dependency graph will also disable Dependabot alerts and Dependabot security updates.':
      '禁用依赖项关系图也会禁用 Dependabot 警报和 Dependabot 安全更新。',
    'Disabling the dependency graph will also disable Dependabot alerts.': '禁用依赖项关系图也会禁用 Dependabot 警报。',
    'Automatic dependency submission': '自动依赖项提交',
    'Automatically detect and report build-time dependencies for select ecosystems.': '自动检测并报告部分生态系统的构建时依赖项。',
    'Use standard GitHub runners': '使用标准 GitHub 运行器',
    'Enabled for labeled runners': '已为带标签的运行器启用',
    "Use runners labeled with 'dependency-submission'": '使用带有“dependency-submission”标签的运行器',
    'No runners with this label assigned to repository': '没有分配给存储库的带此标签的运行器',

    // Dependabot
    'Keep your dependencies secure and up-to-date.': '保持依赖项安全并及时更新。',
    'Keep your dependencies secure and up-to-date with': '使用以下工具保持依赖项安全并及时更新',
    'Learn more about Dependabot': '了解 Dependabot',
    'Learn more about Dependabot (opens in a new tab)': '了解 Dependabot（在新标签页中打开）',
    'Receive alerts when vulnerabilities are detected in your dependencies.': '依赖项中检测到漏洞时接收警报。',
    "Dependabot alerts needs the dependency graph to be enabled, so we'll turn that on too.":
      'Dependabot 警报需要启用依赖项关系图，因此会一并开启。',
    'Dependabot alerts needs the dependency graph to be enabled, so we’ll turn that on too.':
      'Dependabot 警报需要启用依赖项关系图，因此会一并开启。',
    'Automatically open pull requests for alerts with a patch.': '自动为有可用补丁的警报创建拉取请求。',
    'Group security updates into one pull request per package manager and manifest directory. For advanced configuration, disable this setting and use dependabot.yml.':
      '按软件包管理器和清单目录将安全更新合并到一个拉取请求中。如需高级配置，请禁用此设置并使用 dependabot.yml。',
    'Automatically open dependency update pull requests by': '通过以下方式自动创建依赖项更新拉取请求',
    'configuring dependabot.yml': '配置 dependabot.yml',
    'Create dependabot.yml': '创建 dependabot.yml',
    'Receive alerts for vulnerabilities that affect your dependencies and manually generate Dependabot pull requests to resolve these vulnerabilities.':
      '接收影响依赖项的漏洞警报，并手动生成 Dependabot 拉取请求来解决这些漏洞。',
    'Configure alert notifications': '配置警报通知',
    'Create your own custom rules and manage alert presets.': '创建自定义规则并管理警报预设。',
    'Review and manage alert presets.': '查看和管理警报预设。',
    // 「Dependabot rules」行的齿轮按钮（组织安全设置页同用此条）
    'Configure Dependabot rules': '配置 Dependabot 规则',
    'Enabling this option will result in Dependabot automatically attempting to open pull requests to resolve every open Dependabot alert with an available patch.':
      '启用此选项后，Dependabot 将自动尝试创建拉取请求，以解决所有已有可用补丁的未处理 Dependabot 警报。',
    'Enabling this option will result in Dependabot automatically attempting to open pull requests to resolve every open Dependabot alert with an available patch. If you would like more specific configuration options, leave this disabled and use':
      '启用此选项后，Dependabot 将自动尝试创建拉取请求，以解决所有已有可用补丁的未处理 Dependabot 警报。如需更具体的配置选项，请保持禁用并使用',
    "Dependabot security updates needs the dependency graph and Dependabot alerts to be enabled, so we'll turn them on too.":
      'Dependabot 安全更新需要启用依赖项关系图和 Dependabot 警报，因此会一并开启。',
    'Dependabot security updates needs the dependency graph and Dependabot alerts to be enabled, so we’ll turn them on too.':
      'Dependabot 安全更新需要启用依赖项关系图和 Dependabot 警报，因此会一并开启。',
    "Dependabot security updates needs Dependabot alerts to be enabled, so we'll turn that on too.":
      'Dependabot 安全更新需要启用 Dependabot 警报，因此会一并开启。',
    'Dependabot security updates needs Dependabot alerts to be enabled, so we’ll turn that on too.':
      'Dependabot 安全更新需要启用 Dependabot 警报，因此会一并开启。',
    'Groups all available updates that resolve a Dependabot alert into one pull request (per package manager and directory of requirement manifests). This option may be overridden by group rules specified in dependabot.yml -':
      '将所有可解决 Dependabot 警报的可用更新合并到一个拉取请求中（按软件包管理器和清单目录分组）。此选项可能会被 dependabot.yml 中指定的分组规则覆盖 -',
    "Grouped security updates needs the dependency graph, Dependabot alerts and Dependabot security updates to be enabled, so we'll turn them on too":
      '分组安全更新需要启用依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此会一并开启',
    'Grouped security updates needs the dependency graph, Dependabot alerts and Dependabot security updates to be enabled, so we’ll turn them on too':
      '分组安全更新需要启用依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此会一并开启',
    "Grouped security updates needs Dependabot alerts and Dependabot security updates to be enabled, so we'll turn them on too.":
      '分组安全更新需要启用 Dependabot 警报和 Dependabot 安全更新，因此会一并开启。',
    'Grouped security updates needs Dependabot alerts and Dependabot security updates to be enabled, so we’ll turn them on too.':
      '分组安全更新需要启用 Dependabot 警报和 Dependabot 安全更新，因此会一并开启。',
    "Grouped security updates needs Dependabot security updates to be enabled, so we'll turn that on too.":
      '分组安全更新需要启用 Dependabot 安全更新，因此会一并开启。',
    'Grouped security updates needs Dependabot security updates to be enabled, so we’ll turn that on too.':
      '分组安全更新需要启用 Dependabot 安全更新，因此会一并开启。',
    'Allow Dependabot to open pull requests automatically to keep your dependencies up-to-date when new versions are available.':
      '允许 Dependabot 在有新版本时自动创建拉取请求，使依赖项保持最新。',
    'Learn more about configuring a dependabot.yml file': '了解如何配置 dependabot.yml 文件',
    'Learn more about configuring a dependabot.yml file.': '了解如何配置 dependabot.yml 文件。',
    'Learn more about Dependabot.': '了解 Dependabot。',
    'Run Dependabot security and version updates on Actions runners.': '在操作运行器上运行 Dependabot 安全更新和版本更新。',
    'Run Dependabot security and version updates on self-hosted Actions runners.':
      '在自托管的操作运行器上运行 Dependabot 安全更新和版本更新。',

    // 代码扫描
    'Code scanning with GitHub Actions is not available for this repository.': '此存储库无法使用基于 GitHub 操作的代码扫描。',
    'GitHub Actions is disabled on this repository because it is a fork. To use code scanning please':
      '此存储库是复刻，已禁用 GitHub 操作。要使用代码扫描，请',
    'GitHub Actions is disabled on this repository by an enterprise or organization policy. To use code scanning, please ask your organization administrator to enable Actions, or':
      '企业或组织策略已在此存储库禁用 GitHub 操作。要使用代码扫描，请让组织管理员启用 GitHub 操作，或',
    'submit code scanning results externally using the API': '使用 API 从外部提交代码扫描结果',
    'Prevent direct alert dismissals': '禁止直接消除警报',
    'Actors must submit requests to dismiss an alert. This can impact pull requests requiring code scanning dismissal to merge.':
      '参与者必须提交请求才能消除警报。这可能影响需要消除代码扫描警报才能合并的拉取请求。',
    'CodeQL analysis': 'CodeQL 分析',
    'Identify vulnerabilities and errors with CodeQL for eligible repositories.': '使用 CodeQL 识别符合条件的存储库中的漏洞和错误。',
    'Last scan': '上次扫描',
    'CodeQL will automatically find the best configuration for your repository.': 'CodeQL 将自动为存储库找到最佳配置。',
    'Languages detected in this repository are not compatible with this setup type at this time. Use the advanced setup instead.':
      '此存储库中检测到的语言目前与此设置类型不兼容，请改用高级设置。',
    'Customize your CodeQL configuration via a YAML file checked into the repository.': '通过签入存储库的 YAML 文件自定义 CodeQL 配置。',
    'Not supported': '不支持',
    'Languages on this repository are not compatible with this feature. Learn more about': '此存储库中的语言与此功能不兼容。了解',
    'supported languages and frameworks': '支持的语言和框架',
    'CodeQL default configuration': 'CodeQL 默认配置',
    'These languages were detected on the default branch of this repository.': '在此存储库的默认分支上检测到这些语言。',
    'No CodeQL supported languages to scan in this repository': '此存储库中没有 CodeQL 支持扫描的语言',
    'CodeQL will automatically perform the first scan when it detects': 'CodeQL 在默认分支上检测到',
    'a supported language': '受支持的语言',
    'CodeQL high-precision queries.': 'CodeQL 高精确度查询。',
    'Queries from the default suite, plus lower severity and precision queries.': '默认套件中的查询，外加较低严重性和精确度的查询。',
    'This is the runner default setup will use to run': '这是默认设置运行时将使用的运行器',
    'Loading runner info...': '正在加载运行器信息...',
    'Loading runner info…': '正在加载运行器信息…',
    'Scan events': '扫描事件',
    'These events will trigger a new scan.': '这些事件将触发新的扫描。',
    'On push and pull requests to': '推送和拉取请求目标为',
    'On a weekly schedule': '每周定期',
    'Next scan of': '下次扫描',
    'Enable CodeQL': '启用 CodeQL',
    'Enabling CodeQL...': '正在启用 CodeQL...',
    'Enabling CodeQL…': '正在启用 CodeQL…',
    'View setup log': '查看设置日志',
    'Repository settings saved. This initial setup might take a while because CodeQL will perform a full scan of the repository.':
      '存储库设置已保存。CodeQL 将对存储库执行完整扫描，初始设置可能需要一段时间。',
    'View last scan log': '查看上次扫描日志',
    'View Code Scanning alerts': '查看代码扫描警报',
    'View CodeQL configuration': '查看 CodeQL 配置',
    'Switch to advanced': '切换到高级设置',
    'Switch to a CodeQL workflow?': '切换到 CodeQL 工作流？',
    'To switch to a workflow-based configuration, we must disable CodeQL first. CodeQL will stop analyzing code and resume once a valid workflow file is committed to the repository.':
      '要切换到基于工作流的配置，须先禁用 CodeQL。CodeQL 将停止分析代码，待有效的工作流文件提交到存储库后恢复。',
    'Disable CodeQL': '禁用 CodeQL',
    'Disable CodeQL?': '禁用 CodeQL？',
    'CodeQL will stop analyzing code from this repository. Existing alerts will remain open; you can dismiss them but not close them as fixed, as CodeQL needs to be enabled for that to happen. Existing CodeQL Actions workflows on this repository must be':
      'CodeQL 将停止分析此存储库的代码。现有警报将保持打开；你可以消除它们，但无法将其标记为已修复关闭，因为这需要启用 CodeQL。此存储库中现有的 CodeQL 操作工作流必须',
    'manually re-enabled to resume previous analyses': '手动重新启用才能恢复之前的分析',
    'Other tools': '其他工具',
    'Add any third-party code scanning tool.': '添加任意第三方代码扫描工具。',
    'Explore workflows': '浏览工作流',
    'Suggest fixes for CodeQL alerts using AI. CodeQL default or advanced setup must be enabled for this feature to work. Learn more about the':
      '使用 AI 为 CodeQL 警报建议修复。必须启用 CodeQL 默认或高级设置，此功能才能工作。了解',
    'limitations of autofix code suggestions': '自动修复代码建议的局限性',
    'Copilot Autofix enablement': 'Copilot 自动修复启用状态',
    'Assign code scanning alerts to Copilot to create a fix and open a pull request. This feature consumes AI credits.':
      '将代码扫描警报分配给 Copilot，由其创建修复和拉取请求。此功能会消耗 AI 额度。',
    'Agentic autofix enablement': '智能体自动修复启用状态',
    'AI Scan': 'AI 扫描',
    'Identify code security findings using AI.': '使用 AI 识别代码安全问题。',
    'Identify code security findings using AI. All features consume AI credits.': '使用 AI 识别代码安全问题。所有功能都会消耗 AI 额度。',
    'Learn more about AI scan': '了解 AI 扫描',
    'AI Scan for pull requests': '拉取请求 AI 扫描',
    'Generate security findings for non-CodeQL languages using AI.': '使用 AI 为 CodeQL 不支持的语言生成安全检测结果。',
    'AI Scan for pull requests enablement': '拉取请求 AI 扫描启用状态',
    'AI Scan for repositories': '存储库 AI 扫描',
    'AI Scan for repositories enablement': '存储库 AI 扫描启用状态',
    'Scan this repository with AI for additional security findings. Only scans the default branch.':
      '使用 AI 扫描此存储库，发现更多安全问题。仅扫描默认分支。',
    'Scan for AI applications': '扫描 AI 应用程序',
    'Scan for AI applications enablement': '扫描 AI 应用程序启用状态',
    'Find risks such as indirect prompt injection in AI applications and agents, in any language. Only scans pull requests.':
      '查找 AI 应用程序和智能体中的间接提示注入等风险，不限语言。仅扫描拉取请求。',
    'Copilot Autofix for third-party tools': '第三方工具的 Copilot 自动修复',
    'Suggest fixes for third-party alerts using AI. Ensure that these tools are properly configured or that an analysis is uploaded for this feature to work. Learn more about the':
      '使用 AI 为第三方警报建议修复。请确保这些工具已正确配置或已上传分析结果，此功能才能工作。了解',
    'limitations of autofix code suggestions for third party tools': '第三方工具自动修复代码建议的局限性',
    'Check runs failure threshold': '检查运行失败阈值',
    'Select the alert severity level for code scanning check runs to fail.': '选择导致代码扫描检查运行失败的警报严重级别。',
    'Create a branch ruleset': '创建分支规则集',
    // 「Create a branch ruleset」链接 +「to prevent a branch from merging when these checks fail.」
    'to prevent a branch from merging when these checks fail.': '以在这些检查失败时阻止分支合并。',
    'Security alert severity level:': '安全警报严重级别：',
    'Only critical': '仅严重',
    'Standard alert severity level:': '标准警报严重级别：',
    'Only errors': '仅错误',
    'Errors and warnings': '错误和警告',
    'Code Scanning alert severity settings saved.': '代码扫描警报严重级别设置已保存。',

    // 机密保护
    'GitHub will always send alerts to partners for detected secrets in public repositories.':
      'GitHub 始终会将公共存储库中检测到的机密警报发送给合作伙伴。',
    'Continuously monitor this repository to prevent secret exposures and protect credentials. GitHub will always send alerts to partners for detected secrets in public repositories.':
      '持续监控此存储库，防止机密泄露并保护凭据。GitHub 始终会将公共存储库中检测到的机密警报发送给合作伙伴。',
    'Token scanning enabled': '令牌扫描已启用',
    'Disable Secret Protection': '禁用机密保护',
    'This will disable Secret Protection for your repository.': '这将为你的存储库禁用机密保护。',
    'Disable secret scanning alerts': '禁用机密扫描警报',
    'Learn more about partner patterns': '了解合作伙伴模式',
    'Enable Secret Protection': '启用机密保护',
    'This will enable Secret Protection for your repository.': '这将为你的存储库启用机密保护。',
    'Enable secret scanning alerts': '启用机密扫描警报',
    'No additional licenses will be consumed.': '不会额外占用许可证。',
    'Receive alerts on GitHub for detected secrets, keys, or other tokens.': '在 GitHub 上接收检测到的机密、密钥或其他令牌的警报。',
    'Custom patterns': '自定义模式',

    // 警报访问权限
    'Access to alerts': '警报访问权限',
    "Admins, users, and teams in the list below have permission to view and manage code scanning, Dependabot, or secret scanning alerts. These users may be notified when a new vulnerability is found in one of this repository's dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their":
      '下方列表中的管理员、用户和团队有权查看和管理代码扫描、Dependabot 或机密扫描警报。在此存储库的依赖项中发现新漏洞或有机密、密钥被签入时，这些用户可能会收到通知。他们查看 Dependabot 安全更新时也会看到更多详细信息。个人可以管理接收这些警报的方式，详见其',
    'Admins, users, and teams in the list below have permission to view and manage code scanning, Dependabot, or secret scanning alerts. These users may be notified when a new vulnerability is found in one of this repository’s dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their':
      '下方列表中的管理员、用户和团队有权查看和管理代码扫描、Dependabot 或机密扫描警报。在此存储库的依赖项中发现新漏洞或有机密、密钥被签入时，这些用户可能会收到通知。他们查看 Dependabot 安全更新时也会看到更多详细信息。个人可以管理接收这些警报的方式，详见其',
    'Choose the people or teams you would like to grant access': '选择要授予访问权限的人员或团队',
    'You have reached the maximum number of people and teams you can add.': '已达到可添加的人员和团队数量上限。',
    'Remove one or more to continue adding others.': '删除一个或多个后才能继续添加。',
    'People and teams with access': '拥有访问权限的人员和团队',
    'Organization administrators, repository administrators, and teams with the security manager role':
      '组织管理员、存储库管理员和拥有安全管理员角色的团队',
    'These members always see code scanning, Dependabot, and secret scanning alerts.':
      '这些成员始终可以看到代码扫描、Dependabot 和机密扫描警报。'
  },
  scoped: {
    // 代码扫描设置里单独出现的功能名（见 nav.ts 文件头）
    'Copilot Autofix': 'Copilot 自动修复',
    'enable it': '启用它',
    'Setting up': '设置中',
    'Grouped security updates': '分组安全更新',
    'learn more here': '在此了解更多',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Dependabot on Actions runners': '操作运行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自托管运行器上的 Dependabot',
    'Push protection': '推送保护',
    // 「Block pushes that contain」+ 链接「supported secrets」
    'Block pushes that contain': '阻止推送包含',
    'supported secrets': '受支持的机密',
    'Validity checks': '有效性检查',
    'Non-provider patterns': '非提供程序模式',
    'Scan for generic passwords': '扫描通用密码',
    'New pattern': '新建模式',
    'Default setup': '默认设置',
    'Set up': '设置',
    Advanced: '高级',
    'Query suites': '查询套件',
    'Group of queries': '一组查询',
    'to run against your code.': '用于对你的代码运行。',
    Extended: '扩展',
    'Runner type': '运行器类型',
    // 「Identify vulnerabilities and errors with」+ CodeQL +「for」+「eligible」+「repositories.」
    'Identify vulnerabilities and errors with': '使用',
    for: '为',
    eligible: '符合条件的',
    'repositories.': '存储库识别漏洞和错误。',
    // 「CodeQL will automatically perform the first scan when it detects」+ 链接 +「on the default branch.」
    'on the default branch.': '后自动执行首次扫描。',
    'Protection rules': '保护规则',
    Any: '任意',
    On: '开',
    Off: '关',
    // 代码扫描警报严重级别
    Warnings: '警告',
    Notes: '注意',
    // 「Block commits that contain」+ 链接「supported secrets」
    'Block commits that contain': '阻止提交中出现',
    'notification settings': '通知设置',
    'Search for people or teams': '搜索人员或团队',

    // 推送保护绕过参与者（推送保护、规则集共用的绕过列表组件；译法同 org-settings/security.ts；原文无逗号，译文不加）
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

    // Dependabot 规则页（与组织设置共用；New rule、/ New rule、Rules 由 branches.ts、nav.ts 收录）
    ...DEPENDABOT_RULES_SCOPED,
    // 「Dismiss alerts」的期限选项（组织设置由 moderation.ts 收录，不放进共用常量）
    Indefinitely: '无限期'
  },
  regexp: [
    // 代码扫描：上次扫描 / 下次扫描时间
    [new RegExp(`^Last scan (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次扫描于', translateTime(time))],
    [new RegExp(`^Next scan (${TIME_SOURCE})$`), (_, time: string) => joinCjk('下次扫描于', translateTime(time))],
    // CodeQL 默认设置：语言选择
    [/^(\d+) of (\d+) languages? selected$/, '已选择 $2 种语言中的 $1 种'],
    // 推送保护绕过列表标题：「3 actors」「1 actor」（同 org-settings/security.ts）
    [/^(\d+) actors?$/, '$1 个参与者'],
    // 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（与组织设置共用）
    BYPASS_ACTOR_ACTIONS_RULE,
    // Dependabot 规则（与组织设置共用）；「Managed by <组织>」由 rulesets.ts 收录
    ...DEPENDABOT_RULES_REGEXP
  ]
} satisfies PageDictionary
