import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · Copilot：代码审查（自动审查、自定义说明、审查力度、批准计入）、
 * 云端智能体 / 编码智能体（简介、工作流运行审批、验证工具、MCP 配置）、互联网访问（防火墙、允许列表）、
 * MCP 服务器、议题的智能体建议（自动化级别）。
 * 与组织设置共用的文字沿用 org-settings/copilot.ts 的译法。
 */
export default {
  static: {
    // 代码审查
    'Enable automatic code review': '启用自动代码审查',
    'You can enable Copilot to automatically review pull requests by enabling it inside Repository rules.':
      '在存储库规则中启用后，Copilot 可以自动审查拉取请求。',
    'Learn more about automatic code reviews.': '了解自动代码审查。',
    'Go to repository rules': '转到存储库规则',
    'Use custom instructions when reviewing pull requests': '审查拉取请求时使用自定义说明',
    'repository custom instructions': '存储库自定义说明',
    'when reviewing pull requests.': '来审查拉取请求。',
    'With Copilot code review, you can add Copilot as a reviewer to your pull requests, including drafts. You can also select lines in Visual Studio Code and ask Copilot to review and comment on specific sections.':
      '使用 Copilot 代码审查，可以将 Copilot 添加为拉取请求（包括草稿）的审查者。也可以在 Visual Studio Code 中选择代码行，让 Copilot 审查并评论特定部分。',
    'Learn more about Copilot code reviews.': '了解 Copilot 代码审查。',
    'Automated code reviews using rulesets': '使用规则集自动审查代码',
    'Use rulesets to configure Copilot to review pull requests automatically.': '使用规则集配置 Copilot 自动审查拉取请求。',
    'Learn how to set up rulesets.': '了解如何设置规则集。',
    'Go to rulesets': '转到规则集',
    'No rulesets set up for automated reviews': '尚未为自动审查设置规则集',
    'Create a ruleset to automate code reviews for pull requests targeting your default branch':
      '创建规则集来自动审查面向默认分支的拉取请求',
    'Create ruleset for default branch': '为默认分支创建规则集',
    'Review effort level': '审查力度',
    'Count Copilot approvals toward merge requirements': '将 Copilot 的批准计入合并要求',
    'Copilot reviews your pull requests, flagging bugs and suggesting improvements as inline comments.':
      'Copilot 会审查你的拉取请求，以行内评论标出缺陷并提出改进建议。',
    'Learn more about Copilot code review.': '了解 Copilot 代码审查。',
    'No Copilot code review access': '无 Copilot 代码审查访问权限',
    "Copilot code review isn't enabled for your account, but these settings still apply to people who have access to Copilot code review.":
      '你的帐户未启用 Copilot 代码审查，但这些设置仍适用于有权使用 Copilot 代码审查的人员。',
    'Copilot code review isn’t enabled for your account, but these settings still apply to people who have access to Copilot code review.':
      '你的帐户未启用 Copilot 代码审查，但这些设置仍适用于有权使用 Copilot 代码审查的人员。',
    'Allow Copilot to use MCP tools when reviewing pull requests': '允许 Copilot 在审查拉取请求时使用 MCP 工具',
    'Copilot code review uses the tools from your': 'Copilot 代码审查会在审查时使用你的',
    'Use custom instructions': '使用自定义说明',
    'Copilot references instruction files in this repository. Organization custom instructions apply regardless of this setting.':
      'Copilot 会参考此存储库中的说明文件。无论此设置如何，组织自定义说明都会生效。',
    'Learn more about custom instructions.': '了解自定义说明。',
    'Allow Copilot to approve pull requests': '允许 Copilot 批准拉取请求',
    'Copilot approvals can count toward merge requirements.': 'Copilot 的批准可计入合并要求。',
    'Automatic code review': '自动代码审查',
    'Use rulesets to request a review when a pull request is opened, on each new push, or while it is still a draft.':
      '使用规则集在拉取请求创建时、每次推送新提交时或仍为草稿时请求审查。',
    'Learn more about automatic code review.': '了解自动代码审查。',
    'View all rulesets': '查看所有规则集',
    'Automate Copilot code reviews': '自动执行 Copilot 代码审查',
    'Access and licensing': '访问与许可',
    'Block reviews requested with an external Copilot license': '阻止使用外部 Copilot 许可证请求的审查',
    'External licenses': '外部许可证',
    'include personal Copilot licenses.': '包括个人 Copilot 许可证。',
    'In a personal repository, only the owner and direct collaborators can request reviews.':
      '在个人存储库中，只有所有者和直接协作者可以请求审查。',
    'Automatic reviews from rulesets still run.': '规则集触发的自动审查仍会运行。',
    'Limits the review effort Copilot can use in this repository. Organization and enterprise limits still apply.':
      '限制 Copilot 在此存储库中可使用的审查力度。组织和企业的限制仍然适用。',
    'Search public repositories': '搜索公共存储库',
    'Copilot can search public repositories that a pull request uses for context when it reviews pull requests in this repository.':
      'Copilot 审查此存储库中的拉取请求时，可以搜索拉取请求所用的公共存储库来获取上下文。',
    // 机密保护 AI 扫描：组织禁用时的说明（整句见 inline）
    'Disabled by your organization.': '已被你的组织禁用。',

    // 云端智能体 / 编码智能体
    "You can configure Copilot cloud agent for other users with access to this repository, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以为有权访问此存储库的其他用户配置 Copilot 云端智能体，但你没有 Copilot 专业版、Copilot 专业增强版、Copilot 商业版或 Copilot 企业版许可证，无法向 Copilot 分配任务。',
    'You can configure Copilot cloud agent for other users with access to this repository, but you won’t be able to assign tasks to Copilot because you don’t have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.':
      '你可以为有权访问此存储库的其他用户配置 Copilot 云端智能体，但你没有 Copilot 专业版、Copilot 专业增强版、Copilot 商业版或 Copilot 企业版许可证，无法向 Copilot 分配任务。',
    "You can configure Copilot coding agent for other users with access to this repository, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro+ or Copilot Enterprise license.":
      '你可以为有权访问此存储库的其他用户配置 Copilot 编码智能体，但你没有 Copilot 专业增强版或 Copilot 企业版许可证，无法向 Copilot 分配任务。',
    'You can configure Copilot coding agent for other users with access to this repository, but you won’t be able to assign tasks to Copilot because you don’t have a Copilot Pro+ or Copilot Enterprise license.':
      '你可以为有权访问此存储库的其他用户配置 Copilot 编码智能体，但你没有 Copilot 专业增强版或 Copilot 企业版许可证，无法向 Copilot 分配任务。',
    'With Copilot cloud agent, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Assign a task to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '借助 Copilot 云端智能体，开发人员可以把任务委派给 Copilot，从而专注于最重要的创造性、复杂和高影响力的工作。向 Copilot 分配任务，等待智能体请求审查，然后在拉取请求上留下反馈进行迭代。',
    ', developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Assign a task to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '，开发人员可以把任务委派给 Copilot，从而专注于最重要的创造性、复杂和高影响力的工作。向 Copilot 分配任务，等待智能体请求审查，然后在拉取请求上留下反馈进行迭代。',
    'With Copilot coding agent, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate. To learn more, see the':
      '借助 Copilot 编码智能体，开发人员可以把任务委派给 Copilot，从而专注于最重要的创造性、复杂和高影响力的工作。只需将议题分配给 Copilot，等待智能体请求审查，然后在拉取请求上留下反馈进行迭代。详情请参阅',
    'With Copilot coding agent, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Assign an issue to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '借助 Copilot 编码智能体，开发人员可以把任务委派给 Copilot，从而专注于最重要的创造性、复杂和高影响力的工作。将议题分配给 Copilot，等待智能体请求审查，然后在拉取请求上留下反馈进行迭代。',
    'Learn more about Copilot coding agent': '了解 Copilot 编码智能体',
    'Learn more about Copilot in the cloud': '了解云端 Copilot',
    'No Copilot in the cloud access': '无云端 Copilot 访问权限',
    'Require approval for workflow runs': '工作流运行需要批准',
    'When Copilot pushes changes, require approval from a maintainer with write access before Actions workflows are run. When this policy is disabled, Actions workflows run automatically when Copilot pushes, except when the push comes from an automation that requires approval.':
      'Copilot 推送更改后，须由拥有写入访问权限的维护者批准，GitHub 操作工作流才会运行。禁用此策略后，Copilot 推送时 GitHub 操作工作流会自动运行，除非推送来自需要批准的自动化。',
    'When Copilot pushes changes, require approval from a maintainer with write access before Actions workflows are run.':
      'Copilot 推送更改后，须由拥有写入访问权限的维护者批准，GitHub 操作工作流才会运行。',
    'Allowing GitHub Actions workflows to run without approval may allow unreviewed code written by Copilot to gain write access to your repository or access your GitHub Actions secrets.':
      '允许 GitHub 操作工作流未经批准运行，可能让 Copilot 编写的未审查代码获得存储库写入访问权限或访问 GitHub 操作机密。',
    'Configure which tools Copilot cloud agent uses to validate its work and iterate before requesting human review.':
      '配置 Copilot 云端智能体在请求人工审查前用于验证工作并迭代的工具。',
    'Configure which tools Copilot in the cloud uses to validate its work and iterate before requesting human review.':
      '配置云端 Copilot 在请求人工审查前用于验证工作并迭代的工具。',
    "Actions workflows wait for approval from someone with write access before they run on Copilot's changes.":
      'GitHub 操作工作流在 Copilot 的更改上运行前，须等待拥有写入访问权限的人员批准。',
    'Actions workflows wait for approval from someone with write access before they run on Copilot’s changes.':
      'GitHub 操作工作流在 Copilot 的更改上运行前，须等待拥有写入访问权限的人员批准。',
    // 沙盒资源
    'Sandbox resources': '沙盒资源',
    'Choose the compute size for new cloud agent sandboxes. Existing sandboxes keep their current size. For tasks using multiple repositories, the largest repository setting is used.':
      '为新的云端智能体沙盒选择计算规格。现有沙盒保持当前规格。对于使用多个存储库的任务，采用其中最大的存储库设置。',
    'Sandbox size': '沙盒规格',
    'No repository default': '无存储库默认值',
    'Small (S)': '小 (S)',
    'Medium (M)': '中 (M)',
    'Large (L)': '大 (L)',
    'No repository-specific size is set. Choose a size to save a repository default.':
      '未设置存储库专用规格。选择规格即可保存为存储库默认值。',
    'Save sandbox size': '保存沙盒规格',

    // 自动化
    'When enabled, users with write access can create automations that automatically run agents on a schedule or in response to events like new issues or updated pull requests.':
      '启用后，拥有写入访问权限的用户可以创建自动化，按计划或在出现新议题、拉取请求更新等事件时自动运行智能体。',
    'Only allow automations to be triggered by users with write access': '仅允许拥有写入访问权限的用户触发自动化',
    'When enabled, automations will only run if the user triggering the event has write access to the repository. When disabled, users can create automations that listen for events triggered by users without write access.':
      '启用后，只有触发事件的用户拥有存储库写入访问权限时，自动化才会运行。禁用后，用户可以创建监听无写入访问权限用户所触发事件的自动化。',
    "Allowing automations to be triggered by users without write access to the repository increases risk of prompt injection attacks, where an untrusted user can cause an agent to take actions in the repository using the agent's permissions.":
      '允许无存储库写入访问权限的用户触发自动化会增加提示注入攻击的风险，不受信任的用户可能利用智能体的权限让其在存储库中执行操作。',
    'Allowing automations to be triggered by users without write access to the repository increases risk of prompt injection attacks, where an untrusted user can cause an agent to take actions in the repository using the agent’s permissions.':
      '允许无存储库写入访问权限的用户触发自动化会增加提示注入攻击的风险，不受信任的用户可能利用智能体的权限让其在存储库中执行操作。',
    'Limit automation writes to the triggering resource': '将自动化的写入限制在触发资源内',
    'When enabled, automation runs can only change the issue, pull request, or discussion that triggered them, and anything they create. This does not apply to scheduled runs, security alert runs, or runs started by another automation.':
      '启用后，自动化运行只能更改触发它的议题、拉取请求或讨论，以及它自己创建的内容。此限制不适用于计划运行、安全警报运行或由其他自动化启动的运行。',
    "Shared automations belong to the repository and run as its owner, so their usage is billed to the owner. When disabled, shared automations are hidden and the owner isn't billed for them.":
      '共享自动化归属于存储库并以其所有者身份运行，因此使用量计费给所有者。禁用后，共享自动化将被隐藏，所有者也不会为其付费。',
    'Shared automations belong to the repository and run as its owner, so their usage is billed to the owner. When disabled, shared automations are hidden and the owner isn’t billed for them.':
      '共享自动化归属于存储库并以其所有者身份运行，因此使用量计费给所有者。禁用后，共享自动化将被隐藏，所有者也不会为其付费。',
    'Workflows on automation pull requests wait for approval, even when "Require approval for workflow runs" is off.':
      '即使“工作流运行需要批准”已关闭，自动化拉取请求上的工作流仍须等待批准。',
    'Workflows on automation pull requests wait for approval, even when “Require approval for workflow runs” is off.':
      '即使“工作流运行需要批准”已关闭，自动化拉取请求上的工作流仍须等待批准。',
    'CodeQL code scanning': 'CodeQL 代码扫描',
    'Use CodeQL to scan for security vulnerabilities.': '使用 CodeQL 扫描安全漏洞。',
    'Use Copilot code review to identify code quality issues.': '使用 Copilot 代码审查发现代码质量问题。',
    'Scan for accidentally committed secrets and credentials.': '扫描意外提交的机密和凭据。',
    'Dependency vulnerability checks': '依赖项漏洞检查',
    'Check new dependencies against the GitHub Advisory Database for known vulnerabilities.':
      '对照 GitHub 公告数据库检查新依赖项是否存在已知漏洞。',

    // 议题的智能体建议
    'An agent analyzes incoming issues and recommends labels, priority, assignees, and other metadata.':
      '智能体会分析新议题，并推荐标签、优先级、受理人和其他元数据。',
    'Automation level': '自动化级别',
    'Set how much control the agent has to apply changes': '设置智能体应用更改的自主程度',
    'Full control': '完全掌控',
    'Every suggestion is held for your review. Nothing is applied automatically.': '每条建议都等待你审查，不会自动应用任何更改。',
    Cautious: '谨慎',
    'Only high confidence changes are applied automatically. Everything else is held for your review.':
      '仅自动应用高置信度的更改，其余更改都等待你审查。',
    'Routine, clear-cut changes are applied automatically. Anything with ambiguity is held for review.':
      '自动应用常规、明确的更改，有歧义的更改等待审查。',
    'Full automation': '完全自动化',
    "Every change is applied automatically. The agent only holds a change back if it's flagged as uncertain.":
      '所有更改都自动应用，只有被标记为不确定的更改才会被智能体暂缓。',
    'Every change is applied automatically. The agent only holds a change back if it’s flagged as uncertain.':
      '所有更改都自动应用，只有被标记为不确定的更改才会被智能体暂缓。',

    // MCP
    'The MCP is an open standard that defines how applications share context with large language models (LLMs). MCP provides a standardized way to connect AI models to different data sources and tools, enabling them to work together more effectively.':
      'MCP 是一项开放标准，定义了应用如何与大语言模型 (LLM) 共享上下文。MCP 提供了将 AI 模型连接到不同数据源和工具的标准方式，使它们能更高效地协同工作。',
    'With MCP, you can extend the capabilities of Copilot cloud agent by connecting it to other tools and services. The GitHub and Playwright MCP servers are enabled by default.':
      '借助 MCP，可以将 Copilot 云端智能体连接到其他工具和服务以扩展其能力。GitHub 和 Playwright MCP 服务器默认启用。',
    'With MCP, you can extend the capabilities of Copilot cloud agent by connecting it to other tools and services. The':
      '借助 MCP，可以将 Copilot 云端智能体连接到其他工具和服务以扩展其能力。其中',
    'With MCP, you can extend the capabilities of': '借助 MCP，可以扩展',
    'by connecting it to other tools and services. The': '的能力，方法是将其连接到其他工具和服务。其中',
    'MCP servers are enabled by default.': 'MCP 服务器默认启用。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's .copilot environment.":
      '可以在下方添加 JSON 配置来配置自己的 MCP 服务器。MCP 服务器可以选择访问存储库 .copilot 环境中定义的机密。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's .copilot environment. Learn more about configuring MCP servers.":
      '可以在下方添加 JSON 配置来配置自己的 MCP 服务器。MCP 服务器可以选择访问存储库 .copilot 环境中定义的机密。了解如何配置 MCP 服务器。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's copilot environment.":
      '可以在下方添加 JSON 配置来配置自己的 MCP 服务器。MCP 服务器可以选择访问存储库 copilot 环境中定义的机密。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's copilot environment. Learn more about configuring MCP servers.":
      '可以在下方添加 JSON 配置来配置自己的 MCP 服务器。MCP 服务器可以选择访问存储库 copilot 环境中定义的机密。了解如何配置 MCP 服务器。',
    'Learn more about configuring MCP servers.': '了解如何配置 MCP 服务器。',
    // 「With MCP, …」与「… MCP servers can optionally access secrets defined in the repository's」+ <code>copilot</code> +「environment.」
    'With MCP, you can extend the capabilities of Copilot in the cloud and Copilot code review by connecting them to other tools and services. The':
      '借助 MCP，可以将云端 Copilot 和 Copilot 代码审查连接到其他工具和服务以扩展其能力。其中',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's":
      '可以在下方添加 JSON 配置来配置自己的 MCP 服务器。MCP 服务器可以选择访问存储库的',
    'You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository’s':
      '可以在下方添加 JSON 配置来配置自己的 MCP 服务器。MCP 服务器可以选择访问存储库的',
    'This MCP configuration applies to Copilot in the cloud and Copilot code review. IDEs and Copilot CLI use their own MCP configuration.':
      '此 MCP 配置适用于云端 Copilot 和 Copilot 代码审查。IDE 和 Copilot CLI 使用各自的 MCP 配置。',
    'Supported agents': '支持的智能体',
    'You can use MCP to extend the capabilities of Copilot cloud agent by connecting it to other tools and services.':
      '可以使用 MCP 将 Copilot 云端智能体连接到其他工具和服务，以扩展其能力。',
    'You can use MCP to extend the capabilities of Copilot coding agent by connecting it to other tools and services. For information on how to write your JSON MCP configuration, see the':
      '可以使用 MCP 将 Copilot 编码智能体连接到其他工具和服务，以扩展其能力。有关如何编写 JSON MCP 配置，请参阅',
    'You can use MCP to extend the capabilities of Copilot coding agent by connecting it to other tools and services.':
      '可以使用 MCP 将 Copilot 编码智能体连接到其他工具和服务，以扩展其能力。',
    'Learn how to write your JSON MCP configuration': '了解如何编写 JSON MCP 配置',
    'Your configuration will be validated on save.': '保存时将验证你的配置。',
    'Save MCP configuration': '保存 MCP 配置',

    // 互联网访问
    'Ensure that the agent only accesses approved network resources during code generation and execution.':
      '确保智能体在生成和执行代码期间只访问经批准的网络资源。',
    'Ensure that Copilot in the cloud only accesses approved network resources while working on tasks.':
      '确保云端 Copilot 在处理任务时只访问经批准的网络资源。',
    'Ensure that Copilot code review only accesses approved network resources while reviewing changes.':
      '确保 Copilot 代码审查在审查更改时只访问经批准的网络资源。',
    'Limit Internet access for Copilot in the cloud to only allow access to allowlisted locations':
      '仅允许云端 Copilot 访问允许列表中的互联网位置',
    'Limit Internet access for Copilot code review to only allow access to allowlisted locations':
      '仅允许 Copilot 代码审查访问允许列表中的互联网位置',
    'The firewall will not be enforced on self-hosted runners.': '防火墙不会在自托管运行器上强制实施。',
    'Learn more about customizing network access.': '了解如何自定义网络访问。',
    'Learn more about the recommended allowlist': '了解推荐的允许列表',
    'Learn more about customizing network access': '了解如何自定义网络访问',
    'Limit Copilot cloud agent’s Internet access to only allow access to allowlisted locations':
      '限制 Copilot 云端智能体的互联网访问，只允许访问允许列表中的位置',
    "Limit Copilot cloud agent's Internet access to only allow access to allowlisted locations":
      '限制 Copilot 云端智能体的互联网访问，只允许访问允许列表中的位置',
    'Limit Copilot coding agent’s Internet access to only allow access to allowlisted locations':
      '限制 Copilot 编码智能体的互联网访问，只允许访问允许列表中的位置',
    "Limit Copilot coding agent's Internet access to only allow access to allowlisted locations":
      '限制 Copilot 编码智能体的互联网访问，只允许访问允许列表中的位置',
    'Allow access to locations frequently used to install tools, packages, and dependencies':
      '允许访问常用于安装工具、软件包和依赖项的位置',
    'Allow access to locations frequently used to install tools, packages, and dependencies.':
      '允许访问常用于安装工具、软件包和依赖项的位置。',
    'Allow access to specific domains, IP addresses, or URLs.': '允许访问特定域、IP 地址或 URL。',
    'Add items to the allowlist to enable Copilot coding agent to access specific domains, IP addresses, or URLs.':
      '向允许列表添加条目，使 Copilot 编码智能体可以访问特定域、IP 地址或 URL。',
    'See the GitHub Docs for syntax and examples.': '语法和示例请参阅 GitHub 文档。',
    'e.g. https://example.com/a/path or example.com': '例如 https://example.com/a/path 或 example.com',
    'Rule must be a valid domain, IP address, or URL': '规则必须是有效的域、IP 地址或 URL',
    'Tip: Paste a list of rules into the input to add them all at once.': '提示：将规则列表粘贴到输入框可一次性全部添加。',
    'Allowlist settings saved successfully!': '已保存允许列表设置！',
    'Allow repository custom rules': '允许存储库自定义规则',
    'Let repositories decide': '由存储库决定',
    'Organization custom allowlist': '组织自定义允许列表',

    // Copilot 梦境（/settings/copilot/dreaming；功能名与个人 Copilot 设置同译，见 settings-developer/copilot）；
    // 「<strong>Repository skills … pull requests.</strong> Dreaming proposes …」
    'Copilot Dreaming': 'Copilot 梦境',
    'Manage Dreaming for this repository. Only repository administrators can change this setting.':
      '管理此存储库的梦境。只有存储库管理员可以更改此设置。',
    'Repository skills and custom instructions are managed through pull requests.': '存储库技能和自定义指令通过拉取请求管理。',
    'Dreaming proposes changes to files checked into your repository for review.': '梦境对存储库中已签入的文件提出更改，供审查。',
    'Dreaming runs only where repository Memory and other required policies and features are enabled. Session-based Dreams also require session upload.':
      '梦境只在存储库记忆及其他必需的策略和功能均已启用时运行。基于会话的梦境还需要上传会话。',
    'Repository Dreaming requires a Copilot Pro, Pro+ or Max plan.': '存储库梦境需要 Copilot 专业版、专业增强版或 Max 计划。'
  },
  scoped: {
    Adaptive: '自适应',
    // 「With」+ 链接「Copilot in the cloud」+「, developers can …」
    With: '借助',
    'Copilot references': 'Copilot 会参考',
    // 「Copilot code review uses the tools from your」+ 链接 +「during reviews.」
    'during reviews.': '中的工具。',
    // MCP 配置说明末尾：<code>copilot</code> +「environment.」
    'environment.': '环境中定义的机密。',
    'No rulesets': '暂无规则集',
    'General settings': '常规设置',
    'Enable firewall': '启用防火墙',
    'Recommended allowlist': '推荐的允许列表',
    'Custom allowlist': '自定义允许列表',
    'Delete rule': '删除规则',
    'No rules yet': '暂无规则',
    'Validation tools': '验证工具',
    // 验证工具列表里单独出现的功能名（见 nav.ts 文件头）
    'Copilot code review': 'Copilot 代码审查',
    'Model Context Protocol (MCP)': '模型上下文协议 (MCP)',
    'MCP configuration': 'MCP 配置',
    'pre-release terms': '预发行条款',
    Approvals: '批准',
    // Copilot 梦境的功能名：侧栏导航项、设置项标题（旁边是「预览」标记）
    Dreaming: '梦境',
    // 审查力度（与组织设置、个人 Copilot 设置同译）
    Lite: '轻量',
    Balanced: '均衡',
    Max: '最高',
    Auto: '自动',
    'Default (Balanced)': '默认（均衡）',
    // MCP 配置编辑器的键盘提示（与 gist.ts 编辑器译法一致）
    Use: '使用',
    'to toggle the': '切换',
    'key moving focus. Alternatively, use': '键是否移动焦点。也可以先按',
    'to move to the next interactive element on the page.': '移动到页面上的下一个交互元素。',
    // 自动化分组标题；「<span>已启用</span> <span>by your organization</span>」的后半
    Automations: '自动化',
    'by your organization': '由你的组织设置',
    'by your enterprise': '由你的企业设置',
    // 机密保护 AI 扫描与组织禁用说明中的链接文字（整句见 inline）
    'Scans use': '扫描会消耗',
    'Secret Protection AI credits': '机密保护 AI 额度',
    'organization Copilot settings': '组织 Copilot 设置'
  },
  inline: [
    // 机密保护 AI 扫描：「…pull requests. Scans use <a>Secret Protection AI credits</a>.」（同组织设置）
    [
      'Uses machine learning and known patterns to detect secrets when Copilot reviews pull requests. Scans use {}.',
      'Copilot 审查拉取请求时，使用机器学习和已知模式检测机密。扫描会消耗{}。'
    ],
    // 组织禁用：「Disabled by your organization. Manage this in <a>organization Copilot settings</a>.」
    ['Disabled by your organization. Manage this in {}.', '已被你的组织禁用。在{}中管理。']
  ]
} satisfies PageDictionary
