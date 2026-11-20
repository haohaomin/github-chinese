import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · Copilot：代码审查（自动审查、自定义说明、审查力度、批准计入）、
 * 云代理 / 编码代理（简介、工作流运行审批、验证工具、MCP 配置）、互联网访问（防火墙、允许列表）、
 * MCP 服务器、议题的代理建议（自动化级别）。
 * 与组织设置共用的文字沿用 org-settings/copilot.ts 的译法（審查強度、平衡、建議的允許清單等）。
 * 术语：custom instructions → 自訂指示，license → 授權，Copilot in the cloud → 雲端 Copilot，
 * Internet access → 網際網路存取，credential → 認證資訊，context → 上下文（与「模型上下文協定」一致）。
 */
export default {
  static: {
    // 代码审查
    'Enable automatic code review': '啟用自動程式碼審查',
    'You can enable Copilot to automatically review pull requests by enabling it inside Repository rules.':
      '你可以在儲存庫規則中啟用 Copilot 自動審查拉取請求。',
    'Learn more about automatic code reviews.': '瞭解自動程式碼審查。',
    'Go to repository rules': '前往儲存庫規則',
    'Use custom instructions when reviewing pull requests': '審查拉取請求時使用自訂指示',
    'repository custom instructions': '儲存庫自訂指示',
    'when reviewing pull requests.': '來審查拉取請求。',
    'With Copilot code review, you can add Copilot as a reviewer to your pull requests, including drafts. You can also select lines in Visual Studio Code and ask Copilot to review and comment on specific sections.':
      '透過 Copilot 程式碼審查，你可以將 Copilot 新增為拉取請求（包括草稿）的審查者。你也可以在 Visual Studio Code 中選取程式碼行，請 Copilot 審查特定區段並留言。',
    'Learn more about Copilot code reviews.': '瞭解 Copilot 程式碼審查。',
    'Automated code reviews using rulesets': '使用規則集自動審查程式碼',
    'Use rulesets to configure Copilot to review pull requests automatically.': '使用規則集設定 Copilot 自動審查拉取請求。',
    'Learn how to set up rulesets.': '瞭解如何設定規則集。',
    'Go to rulesets': '前往規則集',
    'No rulesets set up for automated reviews': '尚未設定用於自動審查的規則集',
    'Create a ruleset to automate code reviews for pull requests targeting your default branch':
      '建立規則集來自動審查以預設分支為目標的拉取請求',
    'Create ruleset for default branch': '為預設分支建立規則集',
    'Review effort level': '審查強度',
    'Count Copilot approvals toward merge requirements': '將 Copilot 的核准計入合併要求',
    'Copilot reviews your pull requests, flagging bugs and suggesting improvements as inline comments.':
      'Copilot 會審查你的拉取請求，以行內留言標出錯誤並提出改進建議。',
    'Learn more about Copilot code review.': '瞭解 Copilot 程式碼審查。',
    'No Copilot code review access': '沒有 Copilot 程式碼審查存取權',
    "Copilot code review isn't enabled for your account, but these settings still apply to people who have access to Copilot code review.":
      '你的帳號未啟用 Copilot 程式碼審查，但這些設定仍適用於可使用 Copilot 程式碼審查的人員。',
    'Copilot code review isn’t enabled for your account, but these settings still apply to people who have access to Copilot code review.':
      '你的帳號未啟用 Copilot 程式碼審查，但這些設定仍適用於可使用 Copilot 程式碼審查的人員。',
    'Allow Copilot to use MCP tools when reviewing pull requests': '允許 Copilot 在審查拉取請求時使用 MCP 工具',
    'Copilot code review uses the tools from your': 'Copilot 程式碼審查會在審查時使用你的',
    'Use custom instructions': '使用自訂指示',
    'Copilot references instruction files in this repository. Organization custom instructions apply regardless of this setting.':
      'Copilot 會參考此儲存庫中的指示檔案。無論此設定為何，組織自訂指示都會生效。',
    'Learn more about custom instructions.': '瞭解自訂指示。',
    'Allow Copilot to approve pull requests': '允許 Copilot 核准拉取請求',
    'Copilot approvals can count toward merge requirements.': 'Copilot 的核准可以計入合併要求。',
    'Automatic code review': '自動程式碼審查',
    'Use rulesets to request a review when a pull request is opened, on each new push, or while it is still a draft.':
      '使用規則集在拉取請求建立時、每次有新推送時或仍為草稿時請求審查。',
    'Learn more about automatic code review.': '瞭解自動程式碼審查。',
    'View all rulesets': '查看所有規則集',
    'Automate Copilot code reviews': '自動執行 Copilot 程式碼審查',
    'Access and licensing': '存取和授權',
    'Block reviews requested with an external Copilot license': '阻擋使用外部 Copilot 授權請求的審查',
    'External licenses': '外部授權',
    'include personal Copilot licenses.': '包含個人 Copilot 授權。',
    'In a personal repository, only the owner and direct collaborators can request reviews.':
      '在個人儲存庫中，只有擁有者和直接協作者可以請求審查。',
    'Automatic reviews from rulesets still run.': '規則集觸發的自動審查仍會執行。',
    'Limits the review effort Copilot can use in this repository. Organization and enterprise limits still apply.':
      '限制 Copilot 在此儲存庫中可使用的審查強度。組織和企業的限制仍然適用。',
    'Search public repositories': '搜尋公開儲存庫',
    'Copilot can search public repositories that a pull request uses for context when it reviews pull requests in this repository.':
      'Copilot 審查此儲存庫中的拉取請求時，可以搜尋拉取請求使用的公開儲存庫來取得脈絡。',
    // 机密保护 AI 扫描：组织停用时的说明（整句见 inline）
    'Disabled by your organization.': '已由你的組織停用。',

    // 云代理 / 编码代理
    "You can configure Copilot cloud agent for other users with access to this repository, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以為有權存取此儲存庫的其他使用者設定 Copilot 雲端代理，但你沒有 Copilot 專業版、Copilot 專業增強版、Copilot 商務版或 Copilot 企業版授權，因此無法將任務指派給 Copilot。',
    'You can configure Copilot cloud agent for other users with access to this repository, but you won’t be able to assign tasks to Copilot because you don’t have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.':
      '你可以為有權存取此儲存庫的其他使用者設定 Copilot 雲端代理，但你沒有 Copilot 專業版、Copilot 專業增強版、Copilot 商務版或 Copilot 企業版授權，因此無法將任務指派給 Copilot。',
    "You can configure Copilot coding agent for other users with access to this repository, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro+ or Copilot Enterprise license.":
      '你可以為有權存取此儲存庫的其他使用者設定 Copilot 程式開發代理，但你沒有 Copilot 專業增強版或 Copilot 企業版授權，因此無法將任務指派給 Copilot。',
    'You can configure Copilot coding agent for other users with access to this repository, but you won’t be able to assign tasks to Copilot because you don’t have a Copilot Pro+ or Copilot Enterprise license.':
      '你可以為有權存取此儲存庫的其他使用者設定 Copilot 程式開發代理，但你沒有 Copilot 專業增強版或 Copilot 企業版授權，因此無法將任務指派給 Copilot。',
    'With Copilot cloud agent, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Assign a task to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '透過 Copilot 雲端代理，開發人員可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。將任務指派給 Copilot，等待代理請求審查，然後在拉取請求上留下意見回饋來反覆迭代。',
    ', developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Assign a task to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '，開發人員可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。將任務指派給 Copilot，等待代理請求審查，然後在拉取請求上留下意見回饋來反覆迭代。',
    'With Copilot coding agent, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Simply assign an issue to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate. To learn more, see the':
      '透過 Copilot 程式開發代理，開發人員可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。只要將議題指派給 Copilot，等待代理請求審查，然後在拉取請求上留下意見回饋來反覆迭代。若要瞭解詳情，請參閱',
    'With Copilot coding agent, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Assign an issue to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '透過 Copilot 程式開發代理，開發人員可以將任務委派給 Copilot，從而專注於最重要的創意、複雜和高影響力工作。將議題指派給 Copilot，等待代理請求審查，然後在拉取請求上留下意見回饋來反覆迭代。',
    'Learn more about Copilot coding agent': '瞭解 Copilot 程式開發代理',
    'Learn more about Copilot in the cloud': '瞭解雲端 Copilot',
    'No Copilot in the cloud access': '沒有雲端 Copilot 存取權',
    'Require approval for workflow runs': '工作流程執行需要核准',
    'When Copilot pushes changes, require approval from a maintainer with write access before Actions workflows are run. When this policy is disabled, Actions workflows run automatically when Copilot pushes, except when the push comes from an automation that requires approval.':
      'Copilot 推送變更時，必須經具有寫入權限的維護者核准，動作工作流程才會執行。停用此政策後，Copilot 推送時會自動執行動作工作流程，除非推送來自需要核准的自動化。',
    'When Copilot pushes changes, require approval from a maintainer with write access before Actions workflows are run.':
      'Copilot 推送變更時，必須經具有寫入權限的維護者核准，動作工作流程才會執行。',
    'Allowing GitHub Actions workflows to run without approval may allow unreviewed code written by Copilot to gain write access to your repository or access your GitHub Actions secrets.':
      '允許 GitHub 動作工作流程未經核准即執行，可能讓 Copilot 撰寫但未經審查的程式碼取得你儲存庫的寫入權限，或存取你的 GitHub 動作機密。',
    'Configure which tools Copilot cloud agent uses to validate its work and iterate before requesting human review.':
      '設定 Copilot 雲端代理在請求人工審查前，用來驗證其工作並迭代的工具。',
    'Configure which tools Copilot in the cloud uses to validate its work and iterate before requesting human review.':
      '設定雲端 Copilot 在請求人工審查前，用來驗證其工作並迭代的工具。',
    "Actions workflows wait for approval from someone with write access before they run on Copilot's changes.":
      '動作工作流程在 Copilot 的變更上執行前，須等待具有寫入權限的人員核准。',
    'Actions workflows wait for approval from someone with write access before they run on Copilot’s changes.':
      '動作工作流程在 Copilot 的變更上執行前，須等待具有寫入權限的人員核准。',
    // 沙箱资源
    'Sandbox resources': '沙箱資源',
    'Choose the compute size for new cloud agent sandboxes. Existing sandboxes keep their current size. For tasks using multiple repositories, the largest repository setting is used.':
      '為新的雲端代理沙箱選擇運算規格。現有沙箱維持目前規格。使用多個儲存庫的任務會採用其中最大的儲存庫設定。',
    'Sandbox size': '沙箱規格',
    'No repository default': '無儲存庫預設值',
    'Small (S)': '小 (S)',
    'Medium (M)': '中 (M)',
    'Large (L)': '大 (L)',
    'No repository-specific size is set. Choose a size to save a repository default.':
      '未設定儲存庫專用規格。選擇規格即可儲存為儲存庫預設值。',
    'Save sandbox size': '儲存沙箱規格',

    // 自动化
    'When enabled, users with write access can create automations that automatically run agents on a schedule or in response to events like new issues or updated pull requests.':
      '啟用後，具有寫入權限的使用者可以建立自動化，依排程或在出現新議題、拉取請求更新等事件時自動執行代理。',
    'Only allow automations to be triggered by users with write access': '僅允許具有寫入權限的使用者觸發自動化',
    'When enabled, automations will only run if the user triggering the event has write access to the repository. When disabled, users can create automations that listen for events triggered by users without write access.':
      '啟用後，只有在觸發事件的使用者具有儲存庫寫入權限時，自動化才會執行。停用後，使用者可以建立自動化來監聽沒有寫入權限的使用者所觸發的事件。',
    "Allowing automations to be triggered by users without write access to the repository increases risk of prompt injection attacks, where an untrusted user can cause an agent to take actions in the repository using the agent's permissions.":
      '允許沒有儲存庫寫入權限的使用者觸發自動化，會增加提示注入攻擊的風險，不受信任的使用者可能讓代理以自身權限在儲存庫中採取動作。',
    'Allowing automations to be triggered by users without write access to the repository increases risk of prompt injection attacks, where an untrusted user can cause an agent to take actions in the repository using the agent’s permissions.':
      '允許沒有儲存庫寫入權限的使用者觸發自動化，會增加提示注入攻擊的風險，不受信任的使用者可能讓代理以自身權限在儲存庫中採取動作。',
    'Limit automation writes to the triggering resource': '將自動化的寫入範圍限制在觸發資源',
    'When enabled, automation runs can only change the issue, pull request, or discussion that triggered them, and anything they create. This does not apply to scheduled runs, security alert runs, or runs started by another automation.':
      '啟用後，自動化執行只能變更觸發它的議題、拉取請求或討論，以及它自己建立的內容。此限制不適用於排程執行、安全性警示執行，或由其他自動化啟動的執行。',
    "Shared automations belong to the repository and run as its owner, so their usage is billed to the owner. When disabled, shared automations are hidden and the owner isn't billed for them.":
      '共用自動化屬於儲存庫，並以其擁有者身分執行，因此使用量會向擁有者計費。停用後，共用自動化會隱藏，擁有者也不會為其付費。',
    'Shared automations belong to the repository and run as its owner, so their usage is billed to the owner. When disabled, shared automations are hidden and the owner isn’t billed for them.':
      '共用自動化屬於儲存庫，並以其擁有者身分執行，因此使用量會向擁有者計費。停用後，共用自動化會隱藏，擁有者也不會為其付費。',
    'Workflows on automation pull requests wait for approval, even when "Require approval for workflow runs" is off.':
      '即使「工作流程執行需要核准」已關閉，自動化拉取請求上的工作流程仍須等待核准。',
    'Workflows on automation pull requests wait for approval, even when “Require approval for workflow runs” is off.':
      '即使「工作流程執行需要核准」已關閉，自動化拉取請求上的工作流程仍須等待核准。',
    'CodeQL code scanning': 'CodeQL 程式碼掃描',
    'Use CodeQL to scan for security vulnerabilities.': '使用 CodeQL 掃描安全性漏洞。',
    'Use Copilot code review to identify code quality issues.': '使用 Copilot 程式碼審查找出程式碼品質問題。',
    'Scan for accidentally committed secrets and credentials.': '掃描意外提交的機密和認證資訊。',
    'Dependency vulnerability checks': '相依項目漏洞檢查',
    'Check new dependencies against the GitHub Advisory Database for known vulnerabilities.':
      '對照 GitHub 公告資料庫，檢查新的相依項目是否有已知漏洞。',

    // 议题的代理建议
    'An agent analyzes incoming issues and recommends labels, priority, assignees, and other metadata.':
      '代理會分析新進議題，並建議標籤、優先順序、負責人和其他中繼資料。',
    'Automation level': '自動化程度',
    'Set how much control the agent has to apply changes': '設定代理套用變更的自主程度',
    'Full control': '完全掌控',
    'Every suggestion is held for your review. Nothing is applied automatically.': '每項建議都會保留待你審查。不會自動套用任何內容。',
    Cautious: '謹慎',
    'Only high confidence changes are applied automatically. Everything else is held for your review.':
      '只會自動套用高信賴度的變更。其餘變更都會保留待你審查。',
    'Routine, clear-cut changes are applied automatically. Anything with ambiguity is held for review.':
      '例行且明確的變更會自動套用。有歧義的變更會保留待審查。',
    'Full automation': '完全自動化',
    "Every change is applied automatically. The agent only holds a change back if it's flagged as uncertain.":
      '所有變更都會自動套用。代理只會暫緩標示為不確定的變更。',
    'Every change is applied automatically. The agent only holds a change back if it’s flagged as uncertain.':
      '所有變更都會自動套用。代理只會暫緩標示為不確定的變更。',

    // MCP
    'The MCP is an open standard that defines how applications share context with large language models (LLMs). MCP provides a standardized way to connect AI models to different data sources and tools, enabling them to work together more effectively.':
      'MCP 是一項開放標準，定義應用程式如何與大型語言模型 (LLM) 分享上下文。MCP 提供將 AI 模型連接到各種資料來源和工具的標準化方式，讓它們能更有效地協同運作。',
    'With MCP, you can extend the capabilities of Copilot cloud agent by connecting it to other tools and services. The GitHub and Playwright MCP servers are enabled by default.':
      '透過 MCP，你可以將 Copilot 雲端代理連接到其他工具和服務來擴充其能力。GitHub 和 Playwright MCP 伺服器預設為啟用。',
    'With MCP, you can extend the capabilities of Copilot cloud agent by connecting it to other tools and services. The':
      '透過 MCP，你可以將 Copilot 雲端代理連接到其他工具和服務來擴充其能力。其中',
    'With MCP, you can extend the capabilities of': '透過 MCP，你可以擴充',
    'by connecting it to other tools and services. The': '的能力，方法是將其連接到其他工具和服務。其中',
    'MCP servers are enabled by default.': 'MCP 伺服器預設為啟用。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's .copilot environment.":
      '你可以在下方新增 JSON 設定，以設定自己的 MCP 伺服器。MCP 伺服器可以選擇性地存取儲存庫 .copilot 環境中定義的機密。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's .copilot environment. Learn more about configuring MCP servers.":
      '你可以在下方新增 JSON 設定，以設定自己的 MCP 伺服器。MCP 伺服器可以選擇性地存取儲存庫 .copilot 環境中定義的機密。瞭解如何設定 MCP 伺服器。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's copilot environment.":
      '你可以在下方新增 JSON 設定，以設定自己的 MCP 伺服器。MCP 伺服器可以選擇性地存取儲存庫 copilot 環境中定義的機密。',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's copilot environment. Learn more about configuring MCP servers.":
      '你可以在下方新增 JSON 設定，以設定自己的 MCP 伺服器。MCP 伺服器可以選擇性地存取儲存庫 copilot 環境中定義的機密。瞭解如何設定 MCP 伺服器。',
    'Learn more about configuring MCP servers.': '瞭解如何設定 MCP 伺服器。',
    // 「With MCP, …」与「… MCP servers can optionally access secrets defined in the repository's」+ <code>copilot</code> +「environment.」
    'With MCP, you can extend the capabilities of Copilot in the cloud and Copilot code review by connecting them to other tools and services. The':
      '透過 MCP，你可以將雲端 Copilot 和 Copilot 程式碼審查連接到其他工具和服務來擴充其能力。其中',
    "You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository's":
      '你可以在下方新增 JSON 設定，以設定自己的 MCP 伺服器。MCP 伺服器可以選擇性地存取儲存庫的',
    'You can configure your own MCP servers by adding JSON configuration below. MCP servers can optionally access secrets defined in the repository’s':
      '你可以在下方新增 JSON 設定，以設定自己的 MCP 伺服器。MCP 伺服器可以選擇性地存取儲存庫的',
    'This MCP configuration applies to Copilot in the cloud and Copilot code review. IDEs and Copilot CLI use their own MCP configuration.':
      '此 MCP 設定適用於雲端 Copilot 和 Copilot 程式碼審查。IDE 和 Copilot CLI 使用各自的 MCP 設定。',
    'Supported agents': '支援的代理',
    'You can use MCP to extend the capabilities of Copilot cloud agent by connecting it to other tools and services.':
      '你可以使用 MCP 將 Copilot 雲端代理連接到其他工具和服務，以擴充其能力。',
    'You can use MCP to extend the capabilities of Copilot coding agent by connecting it to other tools and services. For information on how to write your JSON MCP configuration, see the':
      '你可以使用 MCP 將 Copilot 程式開發代理連接到其他工具和服務，以擴充其能力。如需瞭解如何撰寫 JSON MCP 設定，請參閱',
    'You can use MCP to extend the capabilities of Copilot coding agent by connecting it to other tools and services.':
      '你可以使用 MCP 將 Copilot 程式開發代理連接到其他工具和服務，以擴充其能力。',
    'Learn how to write your JSON MCP configuration': '瞭解如何撰寫 JSON MCP 設定',
    'Your configuration will be validated on save.': '儲存時將驗證你的設定。',
    'Save MCP configuration': '儲存 MCP 設定',

    // 互联网访问
    'Ensure that the agent only accesses approved network resources during code generation and execution.':
      '確保代理在產生和執行程式碼期間，只存取經核准的網路資源。',
    'Ensure that Copilot in the cloud only accesses approved network resources while working on tasks.':
      '確保雲端 Copilot 在處理任務時只存取經核准的網路資源。',
    'Ensure that Copilot code review only accesses approved network resources while reviewing changes.':
      '確保 Copilot 程式碼審查在審查變更時只存取經核准的網路資源。',
    'Limit Internet access for Copilot in the cloud to only allow access to allowlisted locations':
      '僅允許雲端 Copilot 存取允許清單中的網際網路位置',
    'Limit Internet access for Copilot code review to only allow access to allowlisted locations':
      '僅允許 Copilot 程式碼審查存取允許清單中的網際網路位置',
    'The firewall will not be enforced on self-hosted runners.': '防火牆不會在自架執行器上強制執行。',
    'Learn more about customizing network access.': '瞭解如何自訂網路存取。',
    'Learn more about the recommended allowlist': '瞭解建議的允許清單',
    'Learn more about customizing network access': '瞭解如何自訂網路存取',
    'Limit Copilot cloud agent’s Internet access to only allow access to allowlisted locations':
      '將 Copilot 雲端代理的網際網路存取限制為僅能存取允許清單中的位置',
    "Limit Copilot cloud agent's Internet access to only allow access to allowlisted locations":
      '將 Copilot 雲端代理的網際網路存取限制為僅能存取允許清單中的位置',
    'Limit Copilot coding agent’s Internet access to only allow access to allowlisted locations':
      '將 Copilot 程式開發代理的網際網路存取限制為僅能存取允許清單中的位置',
    "Limit Copilot coding agent's Internet access to only allow access to allowlisted locations":
      '將 Copilot 程式開發代理的網際網路存取限制為僅能存取允許清單中的位置',
    'Allow access to locations frequently used to install tools, packages, and dependencies':
      '允許存取常用來安裝工具、套件和相依項目的位置',
    'Allow access to locations frequently used to install tools, packages, and dependencies.':
      '允許存取常用來安裝工具、套件和相依項目的位置。',
    'Allow access to specific domains, IP addresses, or URLs.': '允許存取特定網域、IP 位址或 URL。',
    'Add items to the allowlist to enable Copilot coding agent to access specific domains, IP addresses, or URLs.':
      '將項目加入允許清單，讓 Copilot 程式開發代理可以存取特定網域、IP 位址或 URL。',
    'See the GitHub Docs for syntax and examples.': '如需語法和範例，請參閱 GitHub 說明文件。',
    'e.g. https://example.com/a/path or example.com': '例如 https://example.com/a/path 或 example.com',
    'Rule must be a valid domain, IP address, or URL': '規則必須是有效的網域、IP 位址或 URL',
    'Tip: Paste a list of rules into the input to add them all at once.': '提示：將規則清單貼到輸入欄位，可一次全部新增。',
    'Allowlist settings saved successfully!': '已成功儲存允許清單設定！',
    'Allow repository custom rules': '允許儲存庫自訂規則',
    'Let repositories decide': '由儲存庫決定',
    'Organization custom allowlist': '組織自訂允許清單'
  },
  scoped: {
    Adaptive: '自適應',
    // 「With」+ 链接「Copilot in the cloud」+「, developers can …」（与 new.ts 的 With 同译「透過」）
    With: '透過',
    // 「Copilot references」+ 链接「repository custom instructions」+「when reviewing pull requests.」
    'Copilot references': 'Copilot 會參考',
    // 「Copilot code review uses the tools from your」+ 链接 +「during reviews.」
    'during reviews.': '中的工具。',
    // MCP 配置说明末尾：<code>copilot</code> +「environment.」
    'environment.': '環境中定義的機密。',
    'No rulesets': '尚無規則集',
    'General settings': '一般設定',
    'Enable firewall': '啟用防火牆',
    'Recommended allowlist': '建議的允許清單',
    'Custom allowlist': '自訂允許清單',
    'Delete rule': '刪除規則',
    'No rules yet': '尚無規則',
    'Validation tools': '驗證工具',
    // 验证工具列表里单独出现的功能名（见 nav.ts 文件头）
    'Copilot code review': 'Copilot 程式碼審查',
    'Model Context Protocol (MCP)': '模型上下文協定 (MCP)',
    'MCP configuration': 'MCP 設定',
    'pre-release terms': '發行前版本條款',
    Approvals: '核准',
    // 审查力度（与组织设置、个人 Copilot 设置同译）
    Lite: '輕量',
    Balanced: '平衡',
    Max: '最高',
    Auto: '自動',
    'Default (Balanced)': '預設（平衡）',
    // MCP 配置编辑器的键盘提示（与 code/edit.ts、gist.ts 编辑器译法一致）：
    // 使用 <Control + Shift + m> 切換 <tab> 鍵是否移動焦點。也可以按 <esc> 再按 <tab> 移到頁面上的下一個互動元素。
    Use: '使用',
    'to toggle the': '切換',
    'key moving focus. Alternatively, use': '鍵是否移動焦點。也可以按',
    'to move to the next interactive element on the page.': '移到頁面上的下一個互動元素。',
    // 自动化分组标题；「<span>已啟用</span> <span>by your organization</span>」的后半
    Automations: '自動化',
    'by your organization': '由你的組織設定',
    'by your enterprise': '由你的企業設定',
    // 机密保护 AI 扫描与组织停用说明中的链接文字（整句见 inline）
    'Scans use': '掃描會消耗',
    'Secret Protection AI credits': '機密保護 AI 點數',
    'organization Copilot settings': '組織 Copilot 設定'
  },
  inline: [
    // 机密保护 AI 扫描：「…pull requests. Scans use <a>Secret Protection AI credits</a>.」（同组织设置）
    [
      'Uses machine learning and known patterns to detect secrets when Copilot reviews pull requests. Scans use {}.',
      'Copilot 審查拉取請求時，使用機器學習和已知模式偵測機密。掃描會消耗{}。'
    ],
    // 组织停用：「Disabled by your organization. Manage this in <a>organization Copilot settings</a>.」
    ['Disabled by your organization. Manage this in {}.', '已由你的組織停用。在{}中管理。']
  ]
} satisfies PageDictionary
