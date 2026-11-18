import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, joinCjk, translateTime } from '../helpers'

/** 代理名称（用于“選擇要啟用 X 的儲存庫”等句子）；产品名按用户要求译成中文，表外的名称原样保留 */
const AGENT_NAME: Readonly<Record<string, string>> = {
  'Cloud agent': '雲端代理',
  'Coding agent': '程式開發代理',
  'Copilot cloud agent': 'Copilot 雲端代理',
  'Copilot coding agent': 'Copilot 程式開發代理'
}

const USAGE_LABEL: Readonly<Record<string, string>> = {
  'Included credits': '包含的點數',
  'Additional usage': '額外使用量',
  'Monthly limit': '每月上限'
}

/** Copilot 模型策略名中的厂商前缀 */
const MODEL_VENDOR = '(?:Anthropic|Google|OpenAI|xAI|Microsoft|Meta|Mistral|DeepSeek|Cohere|Moonshot|Alibaba|Qwen)'

function agentName(name: string): string {
  return AGENT_NAME[name] ?? name
}

/** Copilot 方案名后缀（Free / Pro / Pro+ / Student）→ 免費版 / 專業版 / 專業增強版 / 學生版 */
const COPILOT_PLAN: Readonly<Record<string, string>> = {
  Free: '免費版',
  Pro: '專業版',
  'Pro+': '專業增強版',
  Student: '學生版'
}

function copilotPlan(plan: string): string {
  return COPILOT_PLAN[plan] ?? plan
}

/** 代码审查力度档位（服务端选项名）；review effort 译「審查強度」，与组织、存储库设置一致 */
const REVIEW_EFFORT: Readonly<Record<string, string>> = { Auto: '自動', Lite: '輕量', Balanced: '平衡', Max: '最高' }
const REVIEW_EFFORT_SOURCE = '(Auto|Lite|Balanced|Max)'
const EFFORT_DEFAULT: Readonly<Record<string, string>> = {
  Default: '預設',
  'Organization default': '組織預設值',
  'Enterprise default': '企業預設值'
}
const EFFORT_LIMIT: Readonly<Record<string, string>> = {
  Organization: '組織上限',
  Enterprise: '企業上限',
  Inherited: '繼承的上限'
}

function reviewEffort(tier: string): string {
  return REVIEW_EFFORT[tier] ?? tier
}

/** “your enterprise” → 你的企業；“the Acme enterprise” → Acme 企業（企业名原样保留；未匹配的捕获组为空串） */
function enterpriseOwner(name: string): string {
  return name ? `${name} 企業` : '你的企業'
}

/**
 * Copilot 设置（/settings/copilot/…）：计划状态与使用情况、功能开关与策略说明、模型策略、
 * 公共代码匹配、数据使用、可见性、云代理存储库访问、代理合并、代码审查力度、编程工具、入门清单。
 * 产品名、方案名按用户要求译成中文（Copilot Chat → Copilot 聊天、Copilot Spaces → Copilot 空間、Copilot Pro → Copilot 專業版，
 * 见 product-names.md）；单独出现的方案名 Copilot Pro 等由 settings-account/plans.ts 收录。
 * 术语：policy → 政策，AI credits → AI 點數，quota → 配額，code completions → 程式碼自動完成，
 * Copilot in the cloud → 雲端 Copilot，coding tool → 程式開發工具，pay-as-you-go → 隨用隨付。
 */
export default {
  static: {
    // 计划状态
    'You are using Copilot for free': '你正在免費使用 Copilot',
    'Responses are limited to 2,000 code completions and 50 chat messages per month.': '每月限 2,000 次程式碼自動完成和 50 則聊天訊息。',
    'Get unlimited usage with Copilot Pro': '透過 Copilot 專業版無限制使用',
    'Unlimited messages and interactions': '無限次訊息和互動',
    'Access to the latest models': '可使用最新模型',
    'Customize conversations to your private codebase and extensions': '依你的私人程式碼庫和擴充功能自訂對話',
    'Copilot policies': 'Copilot 政策',
    'After that $10/month': '之後 $10/月',
    // 「Trained on billions of lines of code, <a>GitHub Copilot</a> turns …」：前段作定语，不留逗号
    'Trained on billions of lines of code,': '經過數十億行程式碼訓練的',
    'turns natural language prompts into coding suggestions across dozens of languages.':
      '可將自然語言提示轉換為數十種程式語言的程式碼建議。',
    'Get Copilot from an organization': '透過組織取得 Copilot',
    'Organizations can provide their members (including you) and their teams access to GitHub Copilot.':
      '組織可以為其成員（包括你）和團隊提供 GitHub Copilot 存取權。',
    'Organizations owned by enterprise accounts': '企業帳號擁有的組織',
    'are not currently listed.': '目前未列出。',
    'You do not belong to any organizations.': '你不屬於任何組織。',
    'Ask admin for access': '向管理員申請存取權',
    'Buy Copilot Business': '購買 Copilot 商務版',
    'You currently have an active': '你目前擁有有效的',
    'Get started by installing the extension in your preferred IDE.': '首先在你慣用的 IDE 中安裝擴充功能。',
    'Get started by installing the extension in your preferred environment.': '首先在你慣用的環境中安裝擴充功能。',
    'Copilot in your IDE': '在 IDE 中使用 Copilot',
    'Copilot in the CLI': '在 CLI 中使用 Copilot',
    'Chat in GitHub Mobile': '在 GitHub 行動版中聊天',
    'More features': '更多功能',
    'It appears you are not eligible to sign up to GitHub Copilot for free': '你似乎不符合免費註冊 GitHub Copilot 的資格',
    'Your GitHub Copilot setup is incomplete. Select your preferences below to start using GitHub Copilot.':
      '你的 GitHub Copilot 設定尚未完成。在下方選擇偏好設定以開始使用 GitHub Copilot。',
    'Plan upgrades are temporarily unavailable.': '暫時無法升級方案。',
    // 后接日期元素：「免費回應次數重設於 <日期>」
    'Free responses reset': '免費回應次數重設於',
    'Upgrade your Copilot plan for higher usage limits, premium models, AI reviews and more.':
      '升級 Copilot 方案以取得更高的使用量上限、進階模型、AI 審查等。',

    // 使用情况
    'Premium requests': '進階請求',
    'AI credits included with your plan, reset monthly. Enable additional usage to continue with pay-as-you-go credits once you run out of your included usage.':
      '方案內含的 AI 點數，每月重設。啟用額外使用量可在用完包含的使用量後以隨用隨付點數繼續使用。',
    'No usage yet': '尚無使用量',
    'Pay-as-you-go usage of additional AI credits once you run out of your included usage. Set a budget to cap your maximum monthly spend.':
      '用完包含的使用量後以隨用隨付方式使用額外 AI 點數。設定預算以限制每月最高支出。',
    'Monthly limit': '每月上限',
    'Usage limit per month, resets automatically. AI credit usage counts toward your monthly limit. Ask your account manager about increasing your overage when monthly limit is hit.':
      '每月使用量上限，自動重設。AI 點數使用量計入每月上限。達到每月上限時可向客戶經理洽詢提高超額用量。',
    'Usage blocked': '已阻擋使用',
    'Monthly AI credits': '每月 AI 點數',
    'Usage unavailable': '無法取得使用量',
    'Monthly limit unavailable': '無法取得每月上限',
    'Your organization has blocked AI credits usage.': '你的組織已阻擋使用 AI 點數。',
    'Failed to update budget. Please try again.': '無法更新預算。請再試一次。',
    'View usage': '查看使用量',
    'Refresh for latest usage': '重新整理以取得最新使用量',
    'You have no monthly limit on AI credits usage set by your organization.': '你的組織未設定 AI 點數使用量的每月上限。',
    'Upgrade Copilot plan': '升級 Copilot 方案',
    'There was a problem loading your Copilot usage.': '載入 Copilot 使用量時發生問題。',
    'Please note that there may be a delay in the displayed usage percentage.': '請注意顯示的使用量百分比可能會有延遲。',
    'Loading usage data...': '正在載入使用量資料...',
    'Loading usage data…': '正在載入使用量資料…',

    // 功能开关
    'Copilot in GitHub.com': '在 GitHub.com 上使用 Copilot',
    'Copilot Chat in GitHub.com': '在 GitHub.com 上使用 Copilot 聊天',
    'You can use Copilot Chat in GitHub.com, Copilot for pull requests, and all of the preview features.':
      '你可以使用 GitHub.com 上的 Copilot 聊天、拉取請求中的 Copilot 和所有預覽功能。',
    'You can use Copilot Chat in GitHub.com. Copilot code review and preview features are only available for paid licenses.':
      '你可以在 GitHub.com 上使用 Copilot 聊天。Copilot 程式碼審查和預覽功能僅適用於付費授權。',
    'You can use Copilot Chat in GitHub.com. Preview features are only available for paid licenses.':
      '你可以在 GitHub.com 上使用 Copilot 聊天。預覽功能僅適用於付費授權。',
    'You can use Copilot Chat in GitHub.com and Copilot for pull requests. Preview features are only available for paid licenses.':
      '你可以使用 GitHub.com 上的 Copilot 聊天和拉取請求中的 Copilot。預覽功能僅適用於付費授權。',
    'You can use Copilot Chat in GitHub.com and Copilot for pull requests. Copilot code review and preview features are only available for paid licenses.':
      '你可以使用 GitHub.com 上的 Copilot 聊天和拉取請求中的 Copilot。Copilot 程式碼審查和預覽功能僅適用於付費授權。',
    'Learn more about Copilot in GitHub.com': '瞭解 GitHub.com 上的 Copilot',
    'Editor preview features': '編輯器預覽功能',
    'You can use preview features in your editor.': '你可以在編輯器中使用預覽功能。',
    'Copilot Chat in the IDE': '在 IDE 中使用 Copilot 聊天',
    'GitHub Copilot Chat in the IDE': 'IDE 中的 GitHub Copilot 聊天',
    'to explain a piece of code, propose bug fixes, or generate unit tests in a chat interface from your editor.':
      '在編輯器的聊天介面中解釋程式碼、提出錯誤修正建議或產生單元測試。',
    'Copilot Chat in GitHub Mobile': '在 GitHub 行動版中使用 Copilot 聊天',
    'GitHub Copilot Chat in GitHub Mobile': 'GitHub 行動版中的 GitHub Copilot 聊天',
    // 「You can use <a>GitHub Copilot Chat in GitHub Mobile</a> personalized to a codebase.」
    'personalized to a codebase.': '取得針對程式碼庫的個人化回應。',
    'GitHub Copilot for assistance in terminal': 'GitHub Copilot 在終端機中取得協助',
    'Copilot in GitHub Desktop': '在 GitHub 桌面版中使用 Copilot',
    'GitHub Copilot for assistance in GitHub Desktop': 'GitHub Copilot 在 GitHub 桌面版中取得協助',
    'Copilot can search the web': 'Copilot 可以搜尋網路',
    'Copilot can answer questions about new trends and give improved answers, via Bing. See':
      'Copilot 可以透過 Bing 回答有關新趨勢的問題並提供更好的答案。請參閱',
    'Microsoft Privacy Statement': 'Microsoft 隱私權聲明',
    'GitHub Copilot will answer questions about new trends and give improved answers':
      'GitHub Copilot 將回答有關新趨勢的問題並提供更好的答案',
    "GitHub Copilot won't answer questions about new trends and give improved answers":
      'GitHub Copilot 不會回答有關新趨勢的問題或提供更好的答案',
    'GitHub Copilot won’t answer questions about new trends and give improved answers':
      'GitHub Copilot 不會回答有關新趨勢的問題或提供更好的答案',
    'Copilot can search the web using model native search': 'Copilot 可以使用模型原生搜尋功能搜尋網路',
    "Copilot can answer questions using a model's built-in search capabilities.": 'Copilot 可以使用模型內建的搜尋功能回答問題。',
    'Copilot can answer questions using a model’s built-in search capabilities.': 'Copilot 可以使用模型內建的搜尋功能回答問題。',
    'You will have access to the feature': '你將可以使用此功能',
    "You won't have access to the feature": '你將無法使用此功能',
    'You won’t have access to the feature': '你將無法使用此功能',
    'Use Copilot on GitHub.com and GitHub Mobile. Start and continue secure cloud sessions across supported Copilot surfaces. This policy replaces the previous Copilot Chat in GitHub, Copilot Chat in GitHub Mobile, and Cloud Agent policies.':
      '在 GitHub.com 和 GitHub 行動版上使用 Copilot。在支援的 Copilot 介面中啟動並繼續安全的雲端工作階段。此政策取代先前的 GitHub 中的 Copilot 聊天、GitHub 行動版中的 Copilot 聊天和雲端代理政策。',
    'Semantic indexing for Non-GitHub Repositories': '非 GitHub 儲存庫的語意索引',
    'to index your non-GitHub repositories in VSCode.': '在 VSCode 中為你的非 GitHub 儲存庫建立索引。',
    // 「You can use the <a>GitHub Copilot app</a>. Enforcement begins …」（原文只有日期里的逗号，译文不另加）
    '. Enforcement begins July 27th, 2026 in version 1.1 of the GitHub Copilot app. The Copilot CLI policy continues to govern the GitHub Copilot App until version 1.1':
      '。GitHub Copilot 應用程式 1.1 版自 2026年7月27日起強制執行此政策。Copilot CLI 政策在 1.1 版之前繼續管控 GitHub Copilot 應用程式',
    // 「If enabled, you may be served <a>evaluation models</a> through <a>Copilot Auto model selection</a>」
    // 拼出「啟用後，可能會將 評估模型 納入 Copilot 自動模型選擇」（through 见 scoped）
    'Evaluation models in Copilot auto model selection': 'Copilot 自動模型選擇中的評估模型',
    'If enabled, you may be served': '啟用後，可能會將',
    'Copilot Auto model selection': 'Copilot 自動模型選擇',
    'Dashboard entry point': '儀表板入口',
    'Dashboard Entry Point': '儀表板入口',
    'Allows instant chatting when landing on GitHub.com': '進入 GitHub.com 時可立即聊天',
    'Automatically request Copilot code review': '自動請求 Copilot 程式碼審查',
    "Use Copilot to automatically review all the pull requests you've created.": '使用 Copilot 自動審查你建立的所有拉取請求。',
    'Use Copilot to automatically review all the pull requests you’ve created.': '使用 Copilot 自動審查你建立的所有拉取請求。',
    'Automatic Copilot code review': 'Copilot 自動程式碼審查',
    'Copilot will automatically review your pull requests.': 'Copilot 將自動審查你的拉取請求。',
    'Learn more about configuring automatic code reviews.': '瞭解如何設定自動程式碼審查。',
    'Delegate tasks to Copilot coding agent in repositories where it is enabled': '在已啟用 Copilot 程式開發代理的儲存庫中將任務委派給它',
    'Delegate tasks to Copilot cloud agent in repositories where it is enabled': '在已啟用 Copilot 雲端代理的儲存庫中將任務委派給它',
    // 产品名：功能区块标题，也是「You can use <a>Copilot Memory</a> to remember …」中的链接
    'Copilot Memory': 'Copilot 記憶',
    'to remember repository context across Copilot agent interactions.': '在 Copilot 代理互動之間記住儲存庫上下文。',
    // 记忆的下拉按钮：「<span>Copilot Memory:</span> User and repository memories allowed」
    'Copilot Memory:': 'Copilot 記憶：',
    'User and repository memories allowed': '允許使用者和儲存庫記憶',
    "Choose which memories Copilot can use in work you start, such as agent sessions and code reviews. If user or repository memory is disabled by organization, enterprise or repository policy, those memories will not be supplied, regardless of your preference. Your preference remains saved and will automatically take effect if the policy later allows memory. Disabling memory does not delete existing memories. While user memories aren't enabled, you can't view or delete them on the Memory page.":
      '選擇 Copilot 在你發起的工作（例如代理工作階段和程式碼審查）中可以使用哪些記憶。如果組織、企業或儲存庫政策停用了使用者記憶或儲存庫記憶，無論你的偏好設定為何，都不會提供這些記憶。你的偏好設定會保留，並在政策日後允許記憶時自動生效。停用記憶不會刪除現有的記憶。未啟用使用者記憶時，你無法在記憶頁面查看或刪除它們。',
    'Choose which memories Copilot can use in work you start, such as agent sessions and code reviews. If user or repository memory is disabled by organization, enterprise or repository policy, those memories will not be supplied, regardless of your preference. Your preference remains saved and will automatically take effect if the policy later allows memory. Disabling memory does not delete existing memories. While user memories aren’t enabled, you can’t view or delete them on the Memory page.':
      '選擇 Copilot 在你發起的工作（例如代理工作階段和程式碼審查）中可以使用哪些記憶。如果組織、企業或儲存庫政策停用了使用者記憶或儲存庫記憶，無論你的偏好設定為何，都不會提供這些記憶。你的偏好設定會保留，並在政策日後允許記憶時自動生效。停用記憶不會刪除現有的記憶。未啟用使用者記憶時，你無法在記憶頁面查看或刪除它們。',
    // Copilot Dreaming（功能名 Dreaming 译「夢境」，见 scoped）；「<strong>Memories are fully managed.</strong> Dreaming applies …」
    'Dreaming works in the background to improve the memories and guidance Copilot uses in future coding sessions and code reviews.':
      '夢境會在背景運作，改善 Copilot 在日後的程式開發工作階段和程式碼審查中使用的記憶和指引。',
    'Memories are fully managed.': '記憶全面託管。',
    'Dreaming applies memory changes automatically, without a pull request or manual approval.':
      '夢境會自動套用記憶變更，不需要拉取請求或手動核准。',
    'Dreaming runs only where the relevant Memory scope and other required policies and features are enabled. Session-based Dreams also require session upload.':
      '夢境只會在相關記憶範圍及其他必要的政策和功能都已啟用時執行。以工作階段為基礎的夢境還需要上傳工作階段。',
    'Learn more about Copilot Dreaming': '瞭解 Copilot 夢境',
    "This setting controls Dreaming for your user memories. Enable repository Dreaming separately in each repository's settings.":
      '此設定控制使用者記憶的夢境。儲存庫的夢境需在各儲存庫的設定中分別啟用。',
    'This setting controls Dreaming for your user memories. Enable repository Dreaming separately in each repository’s settings.':
      '此設定控制使用者記憶的夢境。儲存庫的夢境需在各儲存庫的設定中分別啟用。',
    // 「This preview is governed by <a>GitHub's pre-release terms</a>.」
    'This preview is governed by': '此預覽適用',
    "GitHub's pre-release terms": 'GitHub 發行前版本條款',
    'GitHub’s pre-release terms': 'GitHub 發行前版本條款',
    'MCP servers in Copilot': 'Copilot 中的 MCP 伺服器',
    'Connect MCP servers to Copilot in all Copilot editors and Coding Agent.':
      '在所有 Copilot 編輯器和程式開發代理中將 MCP 伺服器連接到 Copilot。',
    'Connect MCP servers to Copilot in all Copilot editors and Copilot cloud agent.':
      '在所有 Copilot 編輯器和 Copilot 雲端代理中將 MCP 伺服器連接到 Copilot。',
    'Copilot-generated commit messages': 'Copilot 產生的提交訊息',
    'Allow Copilot to suggest commit messages when you make changes on GitHub.com.':
      '允許 Copilot 為你在 GitHub.com 上所做的變更建議提交訊息。',
    'Learn more about Copilot-generated commit messages.': '瞭解 Copilot 產生的提交訊息。',
    'If enabled, you can view and create': '啟用後，你可以查看並建立',
    '. When disabled, you cannot view or create any Copilot Spaces.': '。停用後，你將無法查看或建立任何 Copilot 空間。',
    'Copilot Spaces Individual Access': 'Copilot 空間個人存取',
    'If enabled, you can create individually owned': '啟用後，你可以建立個人擁有的',
    '. When disabled, you cannot create individual spaces.': '。停用後，你將無法建立個人空間。',
    'Copilot Spaces Individual Sharing': 'Copilot 空間個人共用',
    'If enabled, you can share individually owned': '啟用後，你可以共用個人擁有的',
    '. When disabled, you cannot share individual spaces.': '。停用後，你將無法共用個人空間。',

    // 公共代码匹配、数据使用、可见性（public code 指公开的代码，译「公開程式碼」）
    'Suggestions matching public code': '與公開程式碼相符的建議',
    'Suggestions matching public code (duplication detection filter)': '與公開程式碼相符的建議（重複偵測篩選器）',
    'Copilot can allow or block suggestions matching public code. Learn more about': 'Copilot 可以允許或阻擋與公開程式碼相符的建議。瞭解',
    'code suggestions': '程式碼建議',
    'GitHub Copilot will show suggestions matching public code.': 'GitHub Copilot 將顯示與公開程式碼相符的建議。',
    "GitHub Copilot won't show suggestions matching public code.": 'GitHub Copilot 不會顯示與公開程式碼相符的建議。',
    'GitHub Copilot won’t show suggestions matching public code.': 'GitHub Copilot 不會顯示與公開程式碼相符的建議。',
    'Allow GitHub to use my data for product improvements': '允許 GitHub 將我的資料用於產品改善',
    'Allow GitHub, its affiliates and third parties to use my data, including Prompts, Suggestions, and Code Snippets, for product improvements. More information in the':
      '允許 GitHub、其關係企業和第三方將我的資料，包括提示、建議和程式碼片段，用於產品改善。詳情請參閱',
    'About GitHub Copilot privacy.': '關於 GitHub Copilot 隱私權。',
    'Allow GitHub to use my data for AI model training': '允許 GitHub 將我的資料用於 AI 模型訓練',
    'Allow GitHub, its affiliates and third parties to use my data, including Prompts, Suggestions, and Code Snippets, for AI model training. More information in the':
      '允許 GitHub、其關係企業和第三方將我的資料，包括提示、建議和程式碼片段，用於 AI 模型訓練。詳情請參閱',
    'Allow GitHub to collect and use my Inputs, Outputs, and associated context to train and improve AI models. Read more in the':
      '允許 GitHub 收集並使用我的輸入、輸出和相關上下文來訓練、改善 AI 模型。詳情請參閱',
    'For more information about the data your organization receives regarding your use of GitHub Copilot, please review':
      '若要瞭解你的組織會收到哪些有關你使用 GitHub Copilot 的資料，請查看',
    "GitHub's Privacy Statement": 'GitHub 隱私權聲明',
    'GitHub’s Privacy Statement': 'GitHub 隱私權聲明',
    'It can take up to 30 minutes for the changes to take effect. Restart your code editor for the changes to take effect immediately.':
      '變更最多可能需要 30 分鐘才會生效。重新啟動程式碼編輯器可讓變更立即生效。',
    'Show Copilot': '顯示 Copilot',
    'Enable Copilot for all GitHub features, including navigation bar, search, and dashboard.':
      '在所有 GitHub 功能中啟用 Copilot，包括導覽列、搜尋和儀表板。',
    'When disabled, Copilot will be hidden and unavailable. This setting does not apply to Copilot search on GitHub Docs.':
      '停用後，Copilot 將會隱藏且無法使用。此設定不適用於 GitHub 說明文件上的 Copilot 搜尋。',

    // 云代理：说明与存储库访问
    'With Copilot cloud agent, you can delegate tasks to Copilot, freeing you to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request your review, then leave feedback on the pull request to iterate.':
      '透過 Copilot 雲端代理，你可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。只要將議題指派給 Copilot，等待代理請求你審查，然後在拉取請求上留下意見回饋來反覆迭代。',
    'With Copilot coding agent, you can delegate tasks to Copilot, freeing you to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request your review, then leave feedback on the pull request to iterate.':
      '透過 Copilot 程式開發代理，你可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。只要將議題指派給 Copilot，等待代理請求你審查，然後在拉取請求上留下意見回饋來反覆迭代。',
    'With Coding agent, you can delegate tasks to Copilot, freeing you to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request your review, then leave feedback on the pull request to iterate.':
      '透過程式開發代理，你可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。只要將議題指派給 Copilot，等待代理請求你審查，然後在拉取請求上留下意見回饋來反覆迭代。',
    'Learn more in the docs.': '在說明文件中瞭解詳情。',
    'Include all current and future repositories': '包括所有目前和未來的儲存庫',
    'Applies only to specifically selected repositories': '僅適用於指定的儲存庫',
    'Selected repositories...': '選取的儲存庫...',
    'Selected repositories…': '選取的儲存庫…',
    'Matching a filter...': '與篩選器相符...',
    'Matching a filter…': '與篩選器相符…',
    'Matching a filter': '與篩選器相符',
    'Applies to repositories that match specified filters, now and in the future': '適用於現在和未來與指定篩選器相符的儲存庫',
    'Use a query to select repositories': '使用查詢選取儲存庫',
    'Enter a query to start searching.': '輸入查詢以開始搜尋。',
    'Error fetching repositories': '擷取儲存庫時發生錯誤',
    'Public repository:': '公開儲存庫：',
    'Private repository:': '私人儲存庫：',
    'Internal repository:': '內部儲存庫：',
    'Use of Copilot coding agent is subject to the': '使用 Copilot 程式開發代理須遵守',
    'Use of Copilot cloud agent is subject to the': '使用 Copilot 雲端代理須遵守',
    'Failed to update selection, please try again later.': '無法更新選取項目，請稍後再試。',
    // because 从句用“因…而…”，不另加逗号
    "You can enable Copilot cloud agent for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以為其他使用者啟用 Copilot 雲端代理，但因沒有 Copilot 專業版、Copilot 專業增強版、Copilot 商務版或 Copilot 企業版授權而無法將任務指派給 Copilot。',
    "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以為其他使用者啟用 Copilot 程式開發代理，但因沒有 Copilot 專業版、Copilot 專業增強版、Copilot 商務版或 Copilot 企業版授權而無法將任務指派給 Copilot。',
    "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro+ or Copilot Enterprise license.":
      '你可以為其他使用者啟用 Copilot 程式開發代理，但因沒有 Copilot 專業增強版或 Copilot 企業版授權而無法將任務指派給 Copilot。',
    "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because the Copilot coding agent policy has been disabled by an administrator.":
      '你可以為其他使用者啟用 Copilot 程式開發代理，但因管理員已停用 Copilot 程式開發代理政策而無法將任務指派給 Copilot。',
    "You can enable Copilot cloud agent for other users, but you won't be able to assign tasks to Copilot because the Copilot cloud agent policy has been disabled by an administrator.":
      '你可以為其他使用者啟用 Copilot 雲端代理，但因管理員已停用 Copilot 雲端代理政策而無法將任務指派給 Copilot。',

    // 代理合并（watch 是监看拉取请求的状态，作「監看」，与 pulls/merge-flow.ts 同一功能一致，不用「關注」）
    'Agent Merge': '代理合併',
    'With Agent Merge, Copilot can watch your pull requests, get them ready to merge and keep them ready to merge.':
      '透過代理合併，Copilot 可以監看你的拉取請求，讓它們達到並保持可合併狀態。',
    'Your settings could not be saved': '無法儲存你的設定',
    // 原文无 GitHub 前缀，作「動作工作流程」，与 pulls/merge-flow.ts「失敗的動作工作流程」一致
    'Fix failed Actions workflows': '修正失敗的動作工作流程',
    'Address review feedback': '處理審查意見',
    'Enable Agent Merge automatically for pull requests I create': '為我建立的拉取請求自動啟用代理合併',
    'Turn on Agent Merge when I create a pull request in the ready state or mark a draft pull request as ready for review. Applies to pull requests I create in any repository':
      '在我建立處於就緒狀態的拉取請求或將草稿拉取請求標示為可供審查時開啟代理合併。適用於我在任何儲存庫中建立的拉取請求',
    'No automatic agent merge actions are currently available.': '目前沒有可用的自動代理合併動作。',
    // 原文两句之间缺句号（元素拼接），译文按两句断开
    'Turn on Agent Merge when I create a pull request in the ready state or mark a draft pull request as ready for review. Applies to pull requests I create in any repository No automatic agent merge actions are currently available.':
      '在我建立處於就緒狀態的拉取請求或將草稿拉取請求標示為可供審查時開啟代理合併。適用於我在任何儲存庫中建立的拉取請求。目前沒有可用的自動代理合併動作。',
    'Your automatic agent merge settings could not be updated. Your saved settings are shown.':
      '無法更新自動代理合併設定。目前顯示的是已儲存的設定。',

    // 代码审查力度
    'Default review effort level': '預設審查強度',
    'Controls the depth of analysis when Copilot reviews pull requests.': '控制 Copilot 審查拉取請求時的分析深度。',
    'Organizations and repositories can override this default.': '組織和儲存庫可以覆寫此預設值。',
    'Repositories can override this default.': '儲存庫可以覆寫此預設值。',
    'The saved choice is temporarily unavailable.': '已儲存的選項暫時無法使用。',
    'Saving default review effort level': '正在儲存預設審查強度',
    'Default review effort level saved.': '已儲存預設審查強度。',
    'Failed to update the default review effort level, please try again later.': '無法更新預設審查強度，請稍後再試。',
    'Limited by policy': '受政策限制',
    'Maximum review effort': '最高審查強度',
    'Maximum review effort saved.': '已儲存最高審查強度。',
    'The maximum review effort is temporarily unavailable.': '最高審查強度暫時無法使用。',
    'Saving maximum review effort': '正在儲存最高審查強度',
    'Failed to update the maximum review effort, please try again later.': '無法更新最高審查強度，請稍後再試。',
    'Requires organization opt-in for preview features': '需要組織選擇加入預覽功能',
    'Enabled by your enterprise.': '已由你的企業啟用。',
    'Disabled by your enterprise.': '已由你的企業停用。',
    'This setting is managed by your enterprise.': '此設定由你的企業管理。',
    'View enterprise settings': '查看企業設定',
    'Contact an enterprise owner to manage this setting.': '聯絡企業擁有者以管理此設定。',
    'Select a policy': '選擇政策',

    // 编程工具
    'Opens in VS Code': '在 VS Code 中開啟',
    'Opens in claude.ai': '在 claude.ai 中開啟',
    'Opens in the Codex desktop app': '在 Codex 桌面應用程式中開啟',
    'Claude Code (Web)': 'Claude Code（網頁版）',
    'Codex Desktop App': 'Codex 桌面應用程式',
    'Unable to save coding tool preference. Please try again.': '無法儲存程式開發工具偏好設定。請再試一次。',

    // 入门清单（start building 指开发，不是 build 建置，与 copilot/plans.ts 一致）
    'Install Copilot in your editor': '在編輯器中安裝 Copilot',
    'Ask about coding problems and get code completions while you work.': '工作時詢問程式設計問題並取得程式碼自動完成。',
    'Chat with Copilot anywhere': '隨時隨地與 Copilot 聊天',
    'Copilot chat in the navigation from anywhere on GitHub. Try asking': '在 GitHub 任何頁面都能使用導覽列中的 Copilot 聊天。試著詢問',
    '“what can I do with Copilot?”': '「我可以用 Copilot 做什麼？」',
    'Start building with Copilot': '開始使用 Copilot 開發',
    'Learn how to build with Copilot in Visual Studio Code or Visual Studio.':
      '瞭解如何在 Visual Studio Code 或 Visual Studio 中使用 Copilot 開發。',
    'Remove section': '移除區段',

    // 云端 Copilot（/settings/copilot/coding_agent）
    'From researching a repository to reviewing and merging a pull request, Copilot works in a secure, isolated cloud environment. Delegate work to an agent, freeing you to focus on the creative, complex, and high-impact work that matters most.':
      '從研究儲存庫到審查並合併拉取請求，Copilot 都在安全、隔離的雲端環境中工作。將工作委派給代理，讓你專注於最重要的創意、複雜和高影響力工作。',
    'Choose which repositories Copilot in the cloud should be enabled in. Cloud will only be an environment option where it is enabled for the repository and in the Copilot license policies.':
      '選擇要在哪些儲存庫中啟用雲端 Copilot。雲端只有在儲存庫已啟用且 Copilot 授權政策允許時才會作為環境選項出現。'
  },
  scoped: {
    // Copilot Dreaming 的功能名（功能列表的标题，旁边是「預覽」标记）
    Dreaming: '夢境',
    // 「You currently have an active <strong>Copilot Pro</strong> subscription.」
    subscription: '訂閱',
    'subscription.': '訂閱。',
    'Copilot code completions quota usage': 'Copilot 程式碼自動完成配額使用量',
    'Copilot chat messages quota usage': 'Copilot 聊天訊息配額使用量',
    'Upgrade plan': '升級方案',
    // 编辑器中直接显示的补全建议：inline 作「內嵌」，与留言、代码的「行內」区分
    'Inline suggestions': '內嵌建議',
    'Start free trial': '開始免費試用',
    'Create an organization': '建立組織',
    'Requesting...': '申請中...',
    'Requesting…': '申請中…',
    'Cancelling...': '取消中...',
    'Cancelling…': '取消中…',
    'Not enabled': '未啟用',
    Exceeded: '已超出',
    // 后接日期元素：「重設於 <日期>」
    Resets: '重設於',
    'Getting started': '入門',
    'Get started': '開始使用',
    complete: '已完成',
    'You can use': '你可以使用',
    'You can use the': '你可以使用',
    'If enabled you can use': '啟用後你可以使用',
    'evaluation models': '評估模型',
    // 只在「… served <a>evaluation models</a> through <a>Copilot Auto model selection</a>」一句：將 X 納入 Y
    through: '納入',
    // 「Use Copilot to <a>review your code</a> and generate <a>pull request summaries</a>」
    'Use Copilot to': '使用 Copilot',
    'review your code': '審查程式碼',
    'and generate': '並產生',
    'pull request summaries': '拉取請求摘要',
    // 「Open <a>Copilot chat …</a> “what can I do with Copilot?” to get started.」（与组织 Copilot 设置同译）
    'to get started.': '以開始使用。',
    'Read more.': '瞭解詳情。',
    'Select an option': '選擇選項',
    // 功能与策略的选项（与组织 Copilot 设置一致；状态用“已+动词”，Blocked 指功能被阻挡，不用「封鎖」）
    Policies: '政策',
    Allowed: '已允許',
    Blocked: '已阻擋',
    Unconfigured: '未設定',
    'No policy': '無政策',
    'Requires preview features': '需要預覽功能',
    'Agent sessions': '代理工作階段',
    'pre-release terms': '發行前版本條款',
    'No repositories': '無儲存庫',
    'Only selected repositories': '僅選取的儲存庫',
    'No filter': '無篩選器',
    'Error loading repositories.': '載入儲存庫時發生錯誤。',
    'No repositories to show.': '沒有可顯示的儲存庫。',
    Exclude: '排除',
    'Resolve merge conflicts': '解決合併衝突',
    Unavailable: '無法使用',
    'Failed to update setting': '無法更新設定',
    'Failed to update setting, please try again later.': '無法更新設定，請稍後再試。',
    // 代码审查力度选项
    Auto: '自動',
    Lite: '輕量',
    Balanced: '平衡',
    Max: '最高',
    'No limit': '無限制',
    'Copilot can use any available review effort': 'Copilot 可以使用任何可用的審查強度',
    'Use the default review effort level': '使用預設審查強度',
    'Inherit the GitHub default review effort level': '繼承 GitHub 預設審查強度',
    'Use the maximum review effort set at a higher level': '使用上層設定的最高審查強度',
    // 默认值、上限的来源（带企业名的由正则处理）
    'Organization default': '組織預設值',
    'Enterprise default': '企業預設值',
    'Inherit the review effort level set for the organization': '繼承組織設定的審查強度',
    'Use the maximum review effort set for the organization': '使用組織設定的最高審查強度',
    // 预览档位的限制提示：「<message> <a>View enterprise settings</a>.」或「<message> Contact … owner to enable them.」
    'Preview features are disabled by your enterprise.': '你的企業已停用預覽功能。',
    'Preview features are not enabled for this organization.': '此組織未啟用預覽功能。',
    'Manage preview features': '管理預覽功能',
    'Contact an enterprise owner to enable them.': '聯絡企業擁有者以啟用這些功能。',
    'Contact an organization owner to enable them.': '聯絡組織擁有者以啟用這些功能。'
  },
  regexp: [
    // 计划状态
    [
      /^Upgrade for higher limits, premium models, AI reviews\. Free responses reset in (\d+) days?(\.?)$/,
      (_, days: string, dot: string) => `升級以取得更高上限、進階模型和 AI 審查。免費回應次數將在 ${days} 天後重設${dot ? '。' : ''}`
    ],
    [/^Free responses reset in (\d+) days?\.$/, '免費回應次數將在 $1 天後重設。'],
    // 方案名译成中文：Copilot 免費版 / 專業版 / 專業增強版 / 學生版
    [
      /^GitHub Copilot (Free|Pro\+?|Student) is active for your account$/,
      (_, plan: string) => `你的帳號已啟用 GitHub Copilot ${copilotPlan(plan)}`
    ],
    [/^Copilot (Free|Pro\+?|Student) subscription$/, (_, plan: string) => `Copilot ${copilotPlan(plan)}訂閱`],
    [/^Your GitHub Copilot subscription will renew in (\d+) days?\.$/, '你的 GitHub Copilot 訂閱將在 $1 天後續訂。'],

    // 使用情况（AI credits → AI 點數，与 common/site.ts、org-settings/billing.ts 一致）
    [/^([\d,.]+) \/ ([\d,.]+) AI credits$/, '$1 / $2 AI 點數'],
    [/^([\d,.]+) AI credits used$/, '已使用 $1 AI 點數'],
    [/^([\d,.]+) AI credits?$/, '$1 AI 點數'],
    [/^(\$[\d,.]+) \/ (\$[\d,.]+) budget$/, '$1 / $2 預算'],
    [
      /^(Included credits|Additional usage|Monthly limit): (\d+(?:\.\d+)?)% used$/,
      (_, label: string, percent: string) => `${USAGE_LABEL[label] ?? label}：已使用 ${percent}%`
    ],
    [/^(\d+(?:\.\d+)?)% used$/, '已使用 $1%'],
    [new RegExp(`^Resets (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '重設')],

    // 模型策略（原文无逗号，译文不加）
    [
      /^Learn more about how GitHub Copilot serves (.+?) and confirm compatibility with your IDE in our documentation\.$/,
      '在說明文件中瞭解 GitHub Copilot 如何提供 $1 並確認與你的 IDE 的相容性。'
    ],
    [/^Learn more about how GitHub Copilot serves (.+)\.$/, '瞭解 GitHub Copilot 如何提供 $1。'],
    [/^You can use the latest (.+) model\.$/, '你可以使用最新的 $1 模型。'],
    [/^If enabled, you can access and send data to (.+)\.$/, '啟用後，你可以存取 $1 並向其傳送資料。'],
    [new RegExp(`^(${MODEL_VENDOR} .+) in Copilot$`), 'Copilot 中的 $1'],

    // 云代理：存储库访问（原文无逗号，译文不加）
    [
      /^Choose which repositories (.+?) should be enabled in\. (.+?) will only be available where it is enabled for the repository and in the Copilot license policies\.$/,
      (_, agent: string) => {
        const name = agentName(agent)
        const choose = joinCjk(joinCjk('選擇要啟用', name), '的儲存庫。')
        return `${choose}${joinCjk(name, '只有在儲存庫已啟用且 Copilot 授權政策允許時才可使用。')}`
      }
    ],
    // match → 相符（术语表）；item → 項目
    [/^Matching ([\d,.]+[kKmM]?) repositor(?:y|ies)$/, '$1 個相符的儲存庫'],
    [/^(\d+) repositor(?:y|ies) matching$/, '$1 個相符的儲存庫'],
    [/^(\d+) repositories matching, showing first (\d+)$/, '$1 個相符的儲存庫，顯示前 $2 個'],
    [/^(\d+) of ([\d,.]+[kKmM]?) items shown\.$/, '已顯示 $2 個項目中的 $1 個。'],

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
      (_, tier: string) => `審查因最高審查強度限制而使用${reviewEffort(tier)}強度。`
    ],
    [
      /^Inherit the review effort level set by (?:your enterprise|the (.+) enterprise)$/,
      (_, name: string) => joinCjk('繼承', `${enterpriseOwner(name)}設定的審查強度`)
    ],
    [
      /^Use the maximum review effort set by (?:your enterprise|the (.+) enterprise)$/,
      (_, name: string) => joinCjk('使用', `${enterpriseOwner(name)}設定的最高審查強度`)
    ]
  ]
} satisfies PageDictionary
