import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, joinCjk, translateTime } from '../helpers'

/** 智能体名称（用于“选择要启用 X 的存储库”等句子）；产品名按用户要求译成中文，表外的名称原样保留 */
const AGENT_NAME: Readonly<Record<string, string>> = {
  'Cloud agent': '云端智能体',
  'Coding agent': '编码智能体',
  'Copilot cloud agent': 'Copilot 云端智能体',
  'Copilot coding agent': 'Copilot 编码智能体'
}

const USAGE_LABEL: Readonly<Record<string, string>> = {
  'Included credits': '包含的额度',
  'Additional usage': '额外使用量',
  'Monthly limit': '每月上限'
}

/** Copilot 模型策略名中的厂商前缀 */
const MODEL_VENDOR = '(?:Anthropic|Google|OpenAI|xAI|Microsoft|Meta|Mistral|DeepSeek|Cohere|Moonshot|Alibaba|Qwen)'

function agentName(name: string): string {
  return AGENT_NAME[name] ?? name
}

/** Copilot 方案名后缀（Free / Pro / Pro+ / Student）→ 免费版 / 专业版 / 专业增强版 / 学生版 */
const COPILOT_PLAN: Readonly<Record<string, string>> = {
  Free: '免费版',
  Pro: '专业版',
  'Pro+': '专业增强版',
  Student: '学生版'
}

function copilotPlan(plan: string): string {
  return COPILOT_PLAN[plan] ?? plan
}

/** 代码审查力度档位（服务端选项名） */
const REVIEW_EFFORT: Readonly<Record<string, string>> = { Auto: '自动', Lite: '轻量', Balanced: '均衡', Max: '最高' }
const REVIEW_EFFORT_SOURCE = '(Auto|Lite|Balanced|Max)'
const EFFORT_DEFAULT: Readonly<Record<string, string>> = {
  Default: '默认',
  'Organization default': '组织默认值',
  'Enterprise default': '企业默认值'
}
const EFFORT_LIMIT: Readonly<Record<string, string>> = {
  Organization: '组织上限',
  Enterprise: '企业上限',
  Inherited: '继承的上限'
}

function reviewEffort(tier: string): string {
  return REVIEW_EFFORT[tier] ?? tier
}

/** “your enterprise” → 你的企业；“the Acme enterprise” → Acme 企业（企业名原样保留；未匹配的捕获组为空串） */
function enterpriseOwner(name: string): string {
  return name ? `${name} 企业` : '你的企业'
}

/**
 * Copilot 设置（/settings/copilot/…）：计划状态与使用情况、功能开关与策略说明、模型策略、
 * 公共代码匹配、数据使用、可见性、云端智能体存储库访问、智能体合并、代码审查力度、编程工具、入门清单。
 * 产品名、方案名按用户要求译成中文（Copilot Chat → Copilot 聊天、Copilot Spaces → Copilot 空间、Copilot Pro → Copilot 专业版，
 * 见 product-names.md）；单独出现的方案名 Copilot Pro 等由 settings-account/plans.ts 收录。
 */
export default {
  static: {
    // 计划状态
    'You are using Copilot for free': '你正在免费使用 Copilot',
    'Responses are limited to 2,000 code completions and 50 chat messages per month.': '每月限 2,000 次代码补全和 50 条聊天消息。',
    'Get unlimited usage with Copilot Pro': '通过 Copilot 专业版不限量使用',
    'Unlimited messages and interactions': '不限量的消息和交互',
    'Access to the latest models': '使用最新模型',
    'Customize conversations to your private codebase and extensions': '根据你的专用代码库和扩展定制对话',
    'Copilot policies': 'Copilot 策略',
    'After that $10/month': '之后 $10/月',
    'Trained on billions of lines of code,': '经过数十亿行代码训练的',
    'turns natural language prompts into coding suggestions across dozens of languages.': '可将自然语言提示转换为数十种语言的编码建议。',
    'Get Copilot from an organization': '从组织获取 Copilot',
    'Organizations can provide their members (including you) and their teams access to GitHub Copilot.':
      '组织可以为其成员（包括你）和团队提供 GitHub Copilot 访问权限。',
    'Organizations owned by enterprise accounts': '企业帐户拥有的组织',
    'are not currently listed.': '目前未列出。',
    'You do not belong to any organizations.': '你不属于任何组织。',
    'Ask admin for access': '向管理员申请访问权限',
    'Buy Copilot Business': '购买 Copilot 商业版',
    'You currently have an active': '你当前拥有有效的',
    'Get started by installing the extension in your preferred IDE.': '首先在你常用的 IDE 中安装扩展。',
    'Get started by installing the extension in your preferred environment.': '首先在你常用的环境中安装扩展。',
    'Copilot in your IDE': '在 IDE 中使用 Copilot',
    'Copilot in the CLI': '在 CLI 中使用 Copilot',
    'Chat in GitHub Mobile': '在 GitHub 移动版中聊天',
    'More features': '更多功能',
    'It appears you are not eligible to sign up to GitHub Copilot for free': '你似乎不符合免费注册 GitHub Copilot 的条件',
    'Your GitHub Copilot setup is incomplete. Select your preferences below to start using GitHub Copilot.':
      '你的 GitHub Copilot 设置尚未完成。请在下方选择首选项以开始使用 GitHub Copilot。',
    'Plan upgrades are temporarily unavailable.': '暂时无法升级计划。',
    'Free responses reset': '免费额度重置于',
    'Upgrade your Copilot plan for higher usage limits, premium models, AI reviews and more.':
      '升级你的 Copilot 计划以获取更高的使用限制、高级模型、AI 审查等。',

    // 使用情况
    'Premium requests': '高级请求',
    'AI credits included with your plan, reset monthly. Enable additional usage to continue with pay-as-you-go credits once you run out of your included usage.':
      '计划内含的 AI 额度，每月重置。启用额外使用量，可在用完包含的使用量后继续按量付费使用。',
    'No usage yet': '暂无使用情况',
    'Pay-as-you-go usage of additional AI credits once you run out of your included usage. Set a budget to cap your maximum monthly spend.':
      '用完包含的使用量后按量付费使用额外 AI 额度。设置预算以限制每月最高支出。',
    'Monthly limit': '每月上限',
    'Usage limit per month, resets automatically. AI credit usage counts toward your monthly limit. Ask your account manager about increasing your overage when monthly limit is hit.':
      '每月使用限制，自动重置。AI 额度使用量计入每月上限。达到每月上限后可联系客户经理提高超额额度。',
    'Usage blocked': '已阻止使用',
    'Monthly AI credits': '每月 AI 额度',
    'Usage unavailable': '使用情况不可用',
    'Monthly limit unavailable': '每月上限不可用',
    'Your organization has blocked AI credits usage.': '你的组织已阻止使用 AI 额度。',
    'Failed to update budget. Please try again.': '无法更新预算。请重试。',
    'View usage': '查看使用情况',
    'Refresh for latest usage': '刷新以获取最新使用情况',
    'You have no monthly limit on AI credits usage set by your organization.': '你的组织未设置 AI 额度的每月使用限制。',
    'Upgrade Copilot plan': '升级 Copilot 计划',
    'There was a problem loading your Copilot usage.': '加载 Copilot 使用情况时出现问题。',
    'Please note that there may be a delay in the displayed usage percentage.': '请注意显示的使用量百分比可能存在延迟。',
    'Loading usage data...': '正在加载使用情况数据...',
    'Loading usage data…': '正在加载使用情况数据…',

    // 功能开关
    'Copilot in GitHub.com': '在 GitHub.com 中使用 Copilot',
    'Copilot Chat in GitHub.com': '在 GitHub.com 中使用 Copilot 聊天',
    'You can use Copilot Chat in GitHub.com, Copilot for pull requests, and all of the preview features.':
      '你可以在 GitHub.com 中使用 Copilot 聊天、拉取请求中的 Copilot 以及所有预览功能。',
    'You can use Copilot Chat in GitHub.com. Copilot code review and preview features are only available for paid licenses.':
      '你可以在 GitHub.com 中使用 Copilot 聊天。Copilot 代码审查和预览功能仅适用于付费许可证。',
    'You can use Copilot Chat in GitHub.com. Preview features are only available for paid licenses.':
      '你可以在 GitHub.com 中使用 Copilot 聊天。预览功能仅适用于付费许可证。',
    'You can use Copilot Chat in GitHub.com and Copilot for pull requests. Preview features are only available for paid licenses.':
      '你可以在 GitHub.com 中使用 Copilot 聊天和拉取请求中的 Copilot。预览功能仅适用于付费许可证。',
    'You can use Copilot Chat in GitHub.com and Copilot for pull requests. Copilot code review and preview features are only available for paid licenses.':
      '你可以在 GitHub.com 中使用 Copilot 聊天和拉取请求中的 Copilot。Copilot 代码审查和预览功能仅适用于付费许可证。',
    'Learn more about Copilot in GitHub.com': '了解 GitHub.com 中的 Copilot',
    'Editor preview features': '编辑器预览功能',
    'You can use preview features in your editor.': '你可以在编辑器中使用预览功能。',
    'Copilot Chat in the IDE': '在 IDE 中使用 Copilot 聊天',
    'GitHub Copilot Chat in the IDE': 'IDE 中的 GitHub Copilot 聊天',
    'to explain a piece of code, propose bug fixes, or generate unit tests in a chat interface from your editor.':
      '在编辑器的聊天界面中解释代码、提出错误修复建议或生成单元测试。',
    'Copilot Chat in GitHub Mobile': '在 GitHub 移动版中使用 Copilot 聊天',
    'GitHub Copilot Chat in GitHub Mobile': 'GitHub 移动版中的 GitHub Copilot 聊天',
    'personalized to a codebase.': '获取针对代码库的个性化回答。',
    'GitHub Copilot for assistance in terminal': 'GitHub Copilot 在终端中获得协助',
    'Copilot in GitHub Desktop': '在 GitHub 桌面版中使用 Copilot',
    'GitHub Copilot for assistance in GitHub Desktop': 'GitHub Copilot 在 GitHub 桌面版中获得协助',
    'Copilot can search the web': 'Copilot 可以搜索网页',
    'Copilot can answer questions about new trends and give improved answers, via Bing. See':
      'Copilot 可以通过必应回答有关新趋势的问题并给出更好的答案。请参阅',
    'Microsoft Privacy Statement': 'Microsoft 隐私声明',
    'GitHub Copilot will answer questions about new trends and give improved answers':
      'GitHub Copilot 将回答有关新趋势的问题并给出更好的答案',
    "GitHub Copilot won't answer questions about new trends and give improved answers":
      'GitHub Copilot 不会回答有关新趋势的问题或给出更好的答案',
    'GitHub Copilot won’t answer questions about new trends and give improved answers':
      'GitHub Copilot 不会回答有关新趋势的问题或给出更好的答案',
    'Copilot can search the web using model native search': 'Copilot 可以使用模型原生搜索来搜索网页',
    "Copilot can answer questions using a model's built-in search capabilities.": 'Copilot 可以使用模型内置的搜索功能回答问题。',
    'Copilot can answer questions using a model’s built-in search capabilities.': 'Copilot 可以使用模型内置的搜索功能回答问题。',
    'You will have access to the feature': '你将可以使用此功能',
    "You won't have access to the feature": '你将无法使用此功能',
    'You won’t have access to the feature': '你将无法使用此功能',
    'Use Copilot on GitHub.com and GitHub Mobile. Start and continue secure cloud sessions across supported Copilot surfaces. This policy replaces the previous Copilot Chat in GitHub, Copilot Chat in GitHub Mobile, and Cloud Agent policies.':
      '在 GitHub.com 和 GitHub 移动版上使用 Copilot。在受支持的 Copilot 界面中启动并继续安全的云端会话。此策略取代此前的 GitHub 中的 Copilot 聊天、GitHub 移动版中的 Copilot 聊天和云端智能体策略。',
    'Semantic indexing for Non-GitHub Repositories': '非 GitHub 存储库的语义索引',
    'to index your non-GitHub repositories in VSCode.': '在 VSCode 中为你的非 GitHub 存储库编制索引。',
    // 「You can use the <a>GitHub Copilot app</a>. Enforcement begins …」（原文只有日期里的逗号，译文不另加）
    '. Enforcement begins July 27th, 2026 in version 1.1 of the GitHub Copilot app. The Copilot CLI policy continues to govern the GitHub Copilot App until version 1.1':
      '。GitHub Copilot 应用 1.1 版自 2026年7月27日起强制实施此策略。Copilot CLI 策略在 1.1 版之前继续管控 GitHub Copilot 应用',
    // 「If enabled, you may be served <a>evaluation models</a> through <a>Copilot Auto model selection</a>」
    // 拼出「启用后，可能会将 评估模型 纳入 Copilot 自动模型选择」（through 见 scoped）
    'Evaluation models in Copilot auto model selection': 'Copilot 自动模型选择中的评估模型',
    'If enabled, you may be served': '启用后，可能会将',
    'Copilot Auto model selection': 'Copilot 自动模型选择',
    'Dashboard entry point': '仪表板入口',
    'Dashboard Entry Point': '仪表板入口',
    'Allows instant chatting when landing on GitHub.com': '进入 GitHub.com 时即可聊天',
    'Automatically request Copilot code review': '自动请求 Copilot 代码审查',
    "Use Copilot to automatically review all the pull requests you've created.": '使用 Copilot 自动审查你创建的所有拉取请求。',
    'Use Copilot to automatically review all the pull requests you’ve created.': '使用 Copilot 自动审查你创建的所有拉取请求。',
    'Automatic Copilot code review': '自动 Copilot 代码审查',
    'Copilot will automatically review your pull requests.': 'Copilot 将自动审查你的拉取请求。',
    'Learn more about configuring automatic code reviews.': '了解如何配置自动代码审查。',
    'Delegate tasks to Copilot coding agent in repositories where it is enabled': '在已启用 Copilot 编码智能体的存储库中将任务委派给它',
    'Delegate tasks to Copilot cloud agent in repositories where it is enabled': '在已启用 Copilot 云端智能体的存储库中将任务委派给它',
    // 产品名：功能区块标题，也是「You can use <a>Copilot Memory</a> to remember …」中的链接
    'Copilot Memory': 'Copilot 记忆',
    'to remember repository context across Copilot agent interactions.': '在 Copilot 智能体交互中记住存储库上下文。',
    // 记忆的下拉按钮：「<span>Copilot Memory:</span> User and repository memories allowed」
    'Copilot Memory:': 'Copilot 记忆：',
    'User and repository memories allowed': '允许用户和存储库记忆',
    "Choose which memories Copilot can use in work you start, such as agent sessions and code reviews. If user or repository memory is disabled by organization, enterprise or repository policy, those memories will not be supplied, regardless of your preference. Your preference remains saved and will automatically take effect if the policy later allows memory. Disabling memory does not delete existing memories. While user memories aren't enabled, you can't view or delete them on the Memory page.":
      '选择 Copilot 在你发起的工作（如智能体会话和代码审查）中可以使用哪些记忆。如果组织、企业或存储库策略禁用了用户记忆或存储库记忆，无论你的偏好如何，都不会提供这些记忆。你的偏好会保留，并在策略日后允许记忆时自动生效。禁用记忆不会删除现有记忆。未启用用户记忆时，你无法在记忆页面查看或删除它们。',
    'Choose which memories Copilot can use in work you start, such as agent sessions and code reviews. If user or repository memory is disabled by organization, enterprise or repository policy, those memories will not be supplied, regardless of your preference. Your preference remains saved and will automatically take effect if the policy later allows memory. Disabling memory does not delete existing memories. While user memories aren’t enabled, you can’t view or delete them on the Memory page.':
      '选择 Copilot 在你发起的工作（如智能体会话和代码审查）中可以使用哪些记忆。如果组织、企业或存储库策略禁用了用户记忆或存储库记忆，无论你的偏好如何，都不会提供这些记忆。你的偏好会保留，并在策略日后允许记忆时自动生效。禁用记忆不会删除现有记忆。未启用用户记忆时，你无法在记忆页面查看或删除它们。',
    // Copilot Dreaming（功能名 Dreaming 译「梦境」，见 scoped）；「<strong>Memories are fully managed.</strong> Dreaming applies …」
    'Dreaming works in the background to improve the memories and guidance Copilot uses in future coding sessions and code reviews.':
      '梦境在后台运行，改进 Copilot 在今后的编码会话和代码审查中使用的记忆和指导。',
    'Memories are fully managed.': '记忆完全托管。',
    'Dreaming applies memory changes automatically, without a pull request or manual approval.':
      '梦境自动应用记忆变更，无需拉取请求或手动批准。',
    'Dreaming runs only where the relevant Memory scope and other required policies and features are enabled. Session-based Dreams also require session upload.':
      '梦境只在相关记忆范围及其他必需的策略和功能均已启用时运行。基于会话的梦境还需要上传会话。',
    'Learn more about Copilot Dreaming': '了解 Copilot 梦境',
    "This setting controls Dreaming for your user memories. Enable repository Dreaming separately in each repository's settings.":
      '此设置控制用户记忆的梦境。存储库的梦境需在各存储库的设置中分别启用。',
    'This setting controls Dreaming for your user memories. Enable repository Dreaming separately in each repository’s settings.':
      '此设置控制用户记忆的梦境。存储库的梦境需在各存储库的设置中分别启用。',
    'This preview is governed by': '此预览适用',
    "GitHub's pre-release terms": 'GitHub 预发行条款',
    'GitHub’s pre-release terms': 'GitHub 预发行条款',
    'MCP servers in Copilot': 'Copilot 中的 MCP 服务器',
    'Connect MCP servers to Copilot in all Copilot editors and Coding Agent.':
      '在所有 Copilot 编辑器和编码智能体中将 MCP 服务器连接到 Copilot。',
    'Connect MCP servers to Copilot in all Copilot editors and Copilot cloud agent.':
      '在所有 Copilot 编辑器和 Copilot 云端智能体中将 MCP 服务器连接到 Copilot。',
    'Copilot-generated commit messages': 'Copilot 生成的提交消息',
    'Allow Copilot to suggest commit messages when you make changes on GitHub.com.':
      '允许 Copilot 为你在 GitHub.com 上所做的更改建议提交消息。',
    'Learn more about Copilot-generated commit messages.': '了解 Copilot 生成的提交消息。',
    'If enabled, you can view and create': '启用后，你可以查看和创建',
    '. When disabled, you cannot view or create any Copilot Spaces.': '。禁用后，你将无法查看或创建任何 Copilot 空间。',
    'Copilot Spaces Individual Access': 'Copilot 空间个人访问',
    'If enabled, you can create individually owned': '启用后，你可以创建个人拥有的',
    '. When disabled, you cannot create individual spaces.': '。禁用后，你将无法创建个人空间。',
    'Copilot Spaces Individual Sharing': 'Copilot 空间个人共享',
    'If enabled, you can share individually owned': '启用后，你可以共享个人拥有的',
    '. When disabled, you cannot share individual spaces.': '。禁用后，你将无法共享个人空间。',

    // 公共代码匹配、数据使用、可见性
    'Suggestions matching public code': '与公共代码匹配的建议',
    'Suggestions matching public code (duplication detection filter)': '与公共代码匹配的建议（重复检测筛选器）',
    'Copilot can allow or block suggestions matching public code. Learn more about': 'Copilot 可以允许或阻止与公共代码匹配的建议。了解',
    'code suggestions': '代码建议',
    'GitHub Copilot will show suggestions matching public code.': 'GitHub Copilot 将显示与公共代码匹配的建议。',
    "GitHub Copilot won't show suggestions matching public code.": 'GitHub Copilot 不会显示与公共代码匹配的建议。',
    'GitHub Copilot won’t show suggestions matching public code.': 'GitHub Copilot 不会显示与公共代码匹配的建议。',
    'Allow GitHub to use my data for product improvements': '允许 GitHub 将我的数据用于产品改进',
    'Allow GitHub, its affiliates and third parties to use my data, including Prompts, Suggestions, and Code Snippets, for product improvements. More information in the':
      '允许 GitHub、其关联公司和第三方将我的数据，包括提示、建议和代码片段，用于产品改进。详情请参阅',
    'About GitHub Copilot privacy.': '关于 GitHub Copilot 隐私。',
    'Allow GitHub to use my data for AI model training': '允许 GitHub 将我的数据用于 AI 模型训练',
    'Allow GitHub, its affiliates and third parties to use my data, including Prompts, Suggestions, and Code Snippets, for AI model training. More information in the':
      '允许 GitHub、其关联公司和第三方将我的数据，包括提示、建议和代码片段，用于 AI 模型训练。详情请参阅',
    'Allow GitHub to collect and use my Inputs, Outputs, and associated context to train and improve AI models. Read more in the':
      '允许 GitHub 收集并使用我的输入、输出及相关上下文来训练和改进 AI 模型。详情请参阅',
    'For more information about the data your organization receives regarding your use of GitHub Copilot, please review':
      '要了解你的组织会收到哪些有关你使用 GitHub Copilot 的数据，请查看',
    "GitHub's Privacy Statement": 'GitHub 隐私声明',
    'GitHub’s Privacy Statement': 'GitHub 隐私声明',
    'It can take up to 30 minutes for the changes to take effect. Restart your code editor for the changes to take effect immediately.':
      '更改最长可能需要 30 分钟生效。重启代码编辑器可立即生效。',
    'Show Copilot': '显示 Copilot',
    'Enable Copilot for all GitHub features, including navigation bar, search, and dashboard.':
      '在所有 GitHub 功能中启用 Copilot，包括导航栏、搜索和仪表板。',
    'When disabled, Copilot will be hidden and unavailable. This setting does not apply to Copilot search on GitHub Docs.':
      '禁用后，Copilot 将隐藏且不可用。此设置不适用于 GitHub 文档上的 Copilot 搜索。',

    // 云端智能体：说明与存储库访问
    'With Copilot cloud agent, you can delegate tasks to Copilot, freeing you to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request your review, then leave feedback on the pull request to iterate.':
      '借助 Copilot 云端智能体，你可以将任务委派给 Copilot，从而专注于最重要的创造性、复杂且影响深远的工作。只需将议题分配给 Copilot，等待智能体请求你审查，然后在拉取请求中留下反馈以继续迭代。',
    'With Copilot coding agent, you can delegate tasks to Copilot, freeing you to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request your review, then leave feedback on the pull request to iterate.':
      '借助 Copilot 编码智能体，你可以将任务委派给 Copilot，从而专注于最重要的创造性、复杂且影响深远的工作。只需将议题分配给 Copilot，等待智能体请求你审查，然后在拉取请求中留下反馈以继续迭代。',
    'With Coding agent, you can delegate tasks to Copilot, freeing you to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request your review, then leave feedback on the pull request to iterate.':
      '借助编码智能体，你可以将任务委派给 Copilot，从而专注于最重要的创造性、复杂且影响深远的工作。只需将议题分配给 Copilot，等待智能体请求你审查，然后在拉取请求中留下反馈以继续迭代。',
    'Learn more in the docs.': '在文档中了解详情。',
    'Include all current and future repositories': '包括所有当前和未来的存储库',
    'Applies only to specifically selected repositories': '仅适用于明确选定的存储库',
    'Selected repositories...': '所选存储库...',
    'Selected repositories…': '所选存储库…',
    'Matching a filter...': '匹配筛选器...',
    'Matching a filter…': '匹配筛选器…',
    'Matching a filter': '匹配筛选器',
    'Applies to repositories that match specified filters, now and in the future': '适用于现在及将来与指定筛选器匹配的存储库',
    'Use a query to select repositories': '使用查询选择存储库',
    'Enter a query to start searching.': '输入查询以开始搜索。',
    'Error fetching repositories': '获取存储库时出错',
    'Public repository:': '公共存储库：',
    'Private repository:': '专用存储库：',
    'Internal repository:': '内部存储库：',
    'Use of Copilot coding agent is subject to the': '使用 Copilot 编码智能体须遵守',
    'Use of Copilot cloud agent is subject to the': '使用 Copilot 云端智能体须遵守',
    'Failed to update selection, please try again later.': '无法更新选择，请稍后重试。',
    // because 从句用“因…而…”，不另加逗号
    "You can enable Copilot cloud agent for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以为其他用户启用 Copilot 云端智能体，但因没有 Copilot 专业版、Copilot 专业增强版、Copilot 商业版或 Copilot 企业版许可证而无法向 Copilot 分配任务。',
    "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以为其他用户启用 Copilot 编码智能体，但因没有 Copilot 专业版、Copilot 专业增强版、Copilot 商业版或 Copilot 企业版许可证而无法向 Copilot 分配任务。',
    "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro+ or Copilot Enterprise license.":
      '你可以为其他用户启用 Copilot 编码智能体，但因没有 Copilot 专业增强版或 Copilot 企业版许可证而无法向 Copilot 分配任务。',
    "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because the Copilot coding agent policy has been disabled by an administrator.":
      '你可以为其他用户启用 Copilot 编码智能体，但因管理员已禁用 Copilot 编码智能体策略而无法向 Copilot 分配任务。',
    "You can enable Copilot cloud agent for other users, but you won't be able to assign tasks to Copilot because the Copilot cloud agent policy has been disabled by an administrator.":
      '你可以为其他用户启用 Copilot 云端智能体，但因管理员已禁用 Copilot 云端智能体策略而无法向 Copilot 分配任务。',

    // 智能体合并
    'Agent Merge': '智能体合并',
    'With Agent Merge, Copilot can watch your pull requests, get them ready to merge and keep them ready to merge.':
      '借助智能体合并，Copilot 可以跟踪你的拉取请求，使其达到并保持可合并状态。',
    'Your settings could not be saved': '无法保存你的设置',
    'Fix failed Actions workflows': '修复失败的操作工作流',
    'Address review feedback': '处理审查反馈',
    'Enable Agent Merge automatically for pull requests I create': '为我创建的拉取请求自动启用智能体合并',
    'Turn on Agent Merge when I create a pull request in the ready state or mark a draft pull request as ready for review. Applies to pull requests I create in any repository':
      '在我创建处于就绪状态的拉取请求或将草稿拉取请求标记为可供审查时开启智能体合并。适用于我在任何存储库中创建的拉取请求',
    'No automatic agent merge actions are currently available.': '目前没有可用的自动智能体合并操作。',
    // 原文两句之间缺句号（元素拼接），译文按两句断开
    'Turn on Agent Merge when I create a pull request in the ready state or mark a draft pull request as ready for review. Applies to pull requests I create in any repository No automatic agent merge actions are currently available.':
      '在我创建处于就绪状态的拉取请求或将草稿拉取请求标记为可供审查时开启智能体合并。适用于我在任何存储库中创建的拉取请求。目前没有可用的自动智能体合并操作。',
    'Your automatic agent merge settings could not be updated. Your saved settings are shown.':
      '无法更新自动智能体合并设置。当前显示的是已保存的设置。',

    // 代码审查力度
    'Default review effort level': '默认审查力度',
    'Controls the depth of analysis when Copilot reviews pull requests.': '控制 Copilot 审查拉取请求时的分析深度。',
    'Organizations and repositories can override this default.': '组织和存储库可以覆盖此默认设置。',
    'Repositories can override this default.': '存储库可以覆盖此默认设置。',
    'The saved choice is temporarily unavailable.': '已保存的选项暂时不可用。',
    'Saving default review effort level': '正在保存默认审查力度',
    'Default review effort level saved.': '已保存默认审查力度。',
    'Failed to update the default review effort level, please try again later.': '无法更新默认审查力度，请稍后重试。',
    'Limited by policy': '受策略限制',
    'Maximum review effort': '最高审查力度',
    'Maximum review effort saved.': '已保存最高审查力度。',
    'The maximum review effort is temporarily unavailable.': '最高审查力度暂时不可用。',
    'Saving maximum review effort': '正在保存最高审查力度',
    'Failed to update the maximum review effort, please try again later.': '无法更新最高审查力度，请稍后重试。',
    'Requires organization opt-in for preview features': '需要组织选择加入预览功能',
    'Enabled by your enterprise.': '已由你的企业启用。',
    'Disabled by your enterprise.': '已由你的企业禁用。',
    'This setting is managed by your enterprise.': '此设置由你的企业管理。',
    'View enterprise settings': '查看企业设置',
    'Contact an enterprise owner to manage this setting.': '请联系企业所有者管理此设置。',
    'Select a policy': '选择策略',

    // 编程工具
    'Opens in VS Code': '在 VS Code 中打开',
    'Opens in claude.ai': '在 claude.ai 中打开',
    'Opens in the Codex desktop app': '在 Codex 桌面应用中打开',
    'Claude Code (Web)': 'Claude Code（网页版）',
    'Codex Desktop App': 'Codex 桌面应用',
    'Unable to save coding tool preference. Please try again.': '无法保存编程工具首选项。请重试。',

    // 入门清单
    'Install Copilot in your editor': '在编辑器中安装 Copilot',
    'Ask about coding problems and get code completions while you work.': '工作时提出编程问题并获取代码补全。',
    'Chat with Copilot anywhere': '随时随地与 Copilot 聊天',
    'Copilot chat in the navigation from anywhere on GitHub. Try asking': '在 GitHub 任意页面均可使用导航栏中的 Copilot 聊天。试着问',
    '“what can I do with Copilot?”': '“我可以用 Copilot 做什么？”',
    'Start building with Copilot': '开始使用 Copilot 构建',
    'Learn how to build with Copilot in Visual Studio Code or Visual Studio.':
      '了解如何在 Visual Studio Code 或 Visual Studio 中使用 Copilot 构建。',
    'Remove section': '删除此部分',

    // 云端 Copilot（/settings/copilot/coding_agent）
    'From researching a repository to reviewing and merging a pull request, Copilot works in a secure, isolated cloud environment. Delegate work to an agent, freeing you to focus on the creative, complex, and high-impact work that matters most.':
      '从研究存储库到审查并合并拉取请求，Copilot 都在安全、隔离的云环境中工作。将工作委派给智能体，让你专注于最重要的创造性、复杂且影响深远的工作。',
    'Choose which repositories Copilot in the cloud should be enabled in. Cloud will only be an environment option where it is enabled for the repository and in the Copilot license policies.':
      '选择要在哪些存储库中启用云端 Copilot。云端只有在存储库中已启用且 Copilot 许可证策略允许时才会作为环境选项出现。'
  },
  scoped: {
    // Copilot Dreaming 的功能名（功能列表的标题，旁边是「预览」标记）
    Dreaming: '梦境',
    // 「You currently have an active <strong>Copilot Pro</strong> subscription.」
    subscription: '订阅',
    'subscription.': '订阅。',
    'Copilot code completions quota usage': 'Copilot 代码补全额度使用情况',
    'Copilot chat messages quota usage': 'Copilot 聊天消息额度使用情况',
    'Upgrade plan': '升级计划',
    'Inline suggestions': '内联建议',
    'Start free trial': '开始免费试用',
    'Create an organization': '创建组织',
    'Requesting...': '申请中...',
    'Requesting…': '申请中…',
    'Cancelling...': '取消中...',
    'Cancelling…': '取消中…',
    'Not enabled': '未启用',
    Exceeded: '已超出',
    Resets: '重置于',
    'Getting started': '入门',
    'Get started': '开始使用',
    complete: '已完成',
    'You can use': '你可以使用',
    'You can use the': '你可以使用',
    'If enabled you can use': '启用后你可以使用',
    'evaluation models': '评估模型',
    // 只在「… served <a>evaluation models</a> through <a>Copilot Auto model selection</a>」一句：将 X 纳入 Y
    through: '纳入',
    // 「Use Copilot to <a>review your code</a> and generate <a>pull request summaries</a>」
    'Use Copilot to': '使用 Copilot',
    'review your code': '审查代码',
    'and generate': '并生成',
    'pull request summaries': '拉取请求摘要',
    // 「Open <a>Copilot chat …</a> “what can I do with Copilot?” to get started.」
    'to get started.': '来开始使用。',
    'Read more.': '了解更多。',
    'Select an option': '选择选项',
    // 功能与策略的选项（与组织 Copilot 设置一致；状态用“已+动词”）
    Policies: '策略',
    Allowed: '已允许',
    Blocked: '已阻止',
    Unconfigured: '未配置',
    'No policy': '无策略',
    'Requires preview features': '需要预览功能',
    'Agent sessions': '智能体会话',
    'pre-release terms': '预发行条款',
    'No repositories': '无存储库',
    'Only selected repositories': '仅选定的存储库',
    'No filter': '无筛选器',
    'Error loading repositories.': '加载存储库时出错。',
    'No repositories to show.': '没有可显示的存储库。',
    Exclude: '排除',
    'Resolve merge conflicts': '解决合并冲突',
    Unavailable: '不可用',
    'Failed to update setting': '无法更新设置',
    'Failed to update setting, please try again later.': '无法更新设置，请稍后重试。',
    // 代码审查力度选项
    Auto: '自动',
    Lite: '轻量',
    Balanced: '均衡',
    Max: '最高',
    'No limit': '无限制',
    'Copilot can use any available review effort': 'Copilot 可以使用任何可用的审查力度',
    'Use the default review effort level': '使用默认审查力度',
    'Inherit the GitHub default review effort level': '继承 GitHub 默认审查力度',
    'Use the maximum review effort set at a higher level': '使用上级设置的最高审查力度',
    // 默认值、上限的来源（带企业名的由正则处理）
    'Organization default': '组织默认值',
    'Enterprise default': '企业默认值',
    'Inherit the review effort level set for the organization': '继承组织设置的审查力度',
    'Use the maximum review effort set for the organization': '使用组织设置的最高审查力度',
    // 预览档位的限制提示：「<message> <a>View enterprise settings</a>.」或「<message> Contact … owner to enable them.」
    'Preview features are disabled by your enterprise.': '你的企业已禁用预览功能。',
    'Preview features are not enabled for this organization.': '此组织未启用预览功能。',
    'Manage preview features': '管理预览功能',
    'Contact an enterprise owner to enable them.': '请联系企业所有者启用。',
    'Contact an organization owner to enable them.': '请联系组织所有者启用。'
  },
  regexp: [
    // 计划状态
    [
      /^Upgrade for higher limits, premium models, AI reviews\. Free responses reset in (\d+) days?(\.?)$/,
      (_, days: string, dot: string) => `升级以获得更高额度、高级模型和 AI 审查。免费额度将在 ${days}天后重置${dot ? '。' : ''}`
    ],
    [/^Free responses reset in (\d+) days?\.$/, '免费额度将在 $1天后重置。'],
    // 方案名译成中文：Copilot 免费版 / 专业版 / 专业增强版 / 学生版
    [
      /^GitHub Copilot (Free|Pro\+?|Student) is active for your account$/,
      (_, plan: string) => `你的帐户已启用 GitHub Copilot ${copilotPlan(plan)}`
    ],
    [/^Copilot (Free|Pro\+?|Student) subscription$/, (_, plan: string) => `Copilot ${copilotPlan(plan)}订阅`],
    [/^Your GitHub Copilot subscription will renew in (\d+) days?\.$/, '你的 GitHub Copilot 订阅将在 $1天后续订。'],

    // 使用情况（措辞与 copilot/models 一致）
    [/^([\d,.]+) \/ ([\d,.]+) AI credits$/, '$1 / $2 AI 额度'],
    [/^([\d,.]+) AI credits used$/, '已使用 $1 AI 额度'],
    [/^([\d,.]+) AI credits?$/, '$1 AI 额度'],
    [/^(\$[\d,.]+) \/ (\$[\d,.]+) budget$/, '$1 / $2 预算'],
    [
      /^(Included credits|Additional usage|Monthly limit): (\d+(?:\.\d+)?)% used$/,
      (_, label: string, percent: string) => `${USAGE_LABEL[label] ?? label}：已使用 ${percent}%`
    ],
    [/^(\d+(?:\.\d+)?)% used$/, '已使用 $1%'],
    [new RegExp(`^Resets (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '重置')],

    // 模型策略（原文无逗号，译文不加）
    [
      /^Learn more about how GitHub Copilot serves (.+?) and confirm compatibility with your IDE in our documentation\.$/,
      '在文档中了解 GitHub Copilot 如何提供 $1 并确认与你的 IDE 的兼容性。'
    ],
    [/^Learn more about how GitHub Copilot serves (.+)\.$/, '了解 GitHub Copilot 如何提供 $1。'],
    [/^You can use the latest (.+) model\.$/, '你可以使用最新的 $1 模型。'],
    [/^If enabled, you can access and send data to (.+)\.$/, '启用后，你可以访问 $1 并向其发送数据。'],
    [new RegExp(`^(${MODEL_VENDOR} .+) in Copilot$`), 'Copilot 中的 $1'],

    // 云端智能体：存储库访问（原文无逗号，译文不加）
    [
      /^Choose which repositories (.+?) should be enabled in\. (.+?) will only be available where it is enabled for the repository and in the Copilot license policies\.$/,
      (_, agent: string) => {
        const name = agentName(agent)
        const choose = joinCjk(joinCjk('选择要启用', name), '的存储库。')
        return `${choose}${joinCjk(name, '只有在存储库中已启用且 Copilot 许可证策略允许时才可用。')}`
      }
    ],
    [/^Matching ([\d,.]+[kKmM]?) repositor(?:y|ies)$/, '匹配 $1 个存储库'],
    [/^(\d+) repositor(?:y|ies) matching$/, '匹配 $1 个存储库'],
    [/^(\d+) repositories matching, showing first (\d+)$/, '匹配 $1 个存储库，显示前 $2 个'],
    [/^(\d+) of ([\d,.]+[kKmM]?) items shown\.$/, '显示 $2 个项中的 $1 个。'],
    [/^Buy Copilot Business for (.+)$/, '为 $1 购买 Copilot 商业版'],

    // 代码审查力度：「Default (Balanced)」等选项标签、上限来源、受上限影响的提示
    [
      new RegExp(`^(Default|Organization default|Enterprise default) \\(${REVIEW_EFFORT_SOURCE}\\)$`),
      (_, label: string, tier: string) => `${EFFORT_DEFAULT[label] ?? label}（${reviewEffort(tier)}）`
    ],
    [
      new RegExp(`^(Organization|Enterprise|Inherited) limit \\(${REVIEW_EFFORT_SOURCE}\\)$`),
      (_, source: string, tier: string) => `${EFFORT_LIMIT[source] ?? source}（${reviewEffort(tier)}）`
    ],
    [
      new RegExp(`^Reviews use ${REVIEW_EFFORT_SOURCE} because of the maximum review effort\\.$`),
      (_, tier: string) => `审查因最高审查力度限制而使用${reviewEffort(tier)}力度。`
    ],
    [
      /^Inherit the review effort level set by (?:your enterprise|the (.+) enterprise)$/,
      (_, name: string) => joinCjk('继承', `${enterpriseOwner(name)}设置的审查力度`)
    ],
    [
      /^Use the maximum review effort set by (?:your enterprise|the (.+) enterprise)$/,
      (_, name: string) => joinCjk('使用', `${enterpriseOwner(name)}设置的最高审查力度`)
    ]
  ]
} satisfies PageDictionary
