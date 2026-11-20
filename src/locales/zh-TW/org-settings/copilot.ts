import type { PageDictionary } from '../../../core/types'

/** 内容排除继承规则的层级、下载记忆对话框的实体类型 */
const ENTITY_TYPES: Readonly<Record<string, string>> = { enterprise: '企業', organization: '組織' }

/**
 * 组织 Copilot 设置：访问（席位分配）、策略、模型、云代理（存储库访问、合作伙伴代理、互联网访问、
 * 运行器类型）、代码审查、内容排除、Copilot Memory 管理。
 * 与个人 Copilot 设置、存储库 Copilot 设置同名的条目放 scoped；
 * 个人设置、存储库设置已收录为 static 的策略名、审查力度文案等不再重复，译法以那里为准。
 */
export default {
  static: {
    // 启用引导（「… will have access to <a>GitHub Copilot</a> inside your organization.」：句尾见 scoped）
    'AI coding agent for tasks, projects, and automated work. Once you complete onboarding, you’ll have the ability to manage policies and control which users or teams will have access to':
      '用於任務、專案和自動化工作的 AI 程式開發代理。完成初始設定後，你就能管理政策並控制組織內哪些使用者或團隊可以使用',
    "AI coding agent for tasks, projects, and automated work. Once you complete onboarding, you'll have the ability to manage policies and control which users or teams will have access to":
      '用於任務、專案和自動化工作的 AI 程式開發代理。完成初始設定後，你就能管理政策並控制組織內哪些使用者或團隊可以使用',
    // 云端 Copilot：无许可证提示、说明（「With」「Copilot in the cloud」「, developers …」是相邻文本节点，整体匹配）
    "You can enable Copilot in the cloud for other users, but you won't be able to assign tasks to Copilot because you don't have a Copilot Pro, Copilot Pro+, Copilot Business or Copilot Enterprise license.":
      '你可以為其他使用者啟用雲端 Copilot，但因沒有 Copilot 專業版、Copilot 專業增強版、Copilot 商務版或 Copilot 企業版授權而無法將任務指派給 Copilot。',
    'Buy or request a seat': '購買或申請席位',
    'With Copilot in the cloud, developers can delegate tasks to Copilot, freeing them to focus on the creative, complex, and high-impact work that matters most. Simply assign a task to Copilot, wait for the agent to request review, then leave feedback on the pull request to iterate.':
      '透過雲端 Copilot，開發人員可以將任務委派給 Copilot，從而專注於最重要的創造性、複雜和高影響力的工作。只需將任務指派給 Copilot，等待代理請求審查，然後在拉取請求上留下意見回饋進行迭代。',
    'Choose which repositories Copilot in the cloud should be enabled in. You can select up to 500 repositories or enable all repositories. To be able to assign an issue to Copilot, the user must have access to Copilot in the cloud and it must be enabled for the repository.':
      '選擇要在哪些儲存庫中啟用雲端 Copilot。最多可選擇 500 個儲存庫，也可以為所有儲存庫啟用。若要將議題指派給 Copilot，使用者必須有權使用雲端 Copilot，且儲存庫已啟用該功能。',
    // 自动化
    'Let users with write access create automations that run on a schedule or in response to events.':
      '允許具有寫入權限的使用者建立依排程或回應事件執行的自動化。',
    'Allow shared automations': '允許共用自動化',
    "Shared automations belong to the repository and run as the organization, so their usage is billed to the organization. When disabled, shared automations are hidden and the organization isn't billed for them.":
      '共用自動化屬於儲存庫並以組織身分執行，因此用量會向組織計費。停用後，共用自動化將會隱藏，組織也不會為其付費。',
    'Require write access to trigger automations': '需要寫入權限才能觸發自動化',
    'Automations only run for events from users with write access.': '自動化僅針對具有寫入權限的使用者觸發的事件執行。',
    'Only allow automations to update the resource that triggered them': '僅允許自動化更新觸發它的資源',
    "Runs can only change the issue, pull request, or discussion that triggered them, and anything the run created. Doesn't apply to scheduled runs, security alert runs, or runs started by another automation.":
      '執行只能變更觸發它的議題、拉取請求或討論，以及該執行建立的內容。不適用於排程執行、安全性警示執行或由其他自動化啟動的執行。',
    'Require approval for workflows on automation pull requests': '自動化拉取請求上的工作流程需要核准',
    "Workflows on automation pull requests wait for approval, even in repositories that let workflows run on Copilot's changes without approval.":
      '自動化拉取請求上的工作流程會等待核准，即使儲存庫允許工作流程在 Copilot 的變更上無需核准即可執行。',
    // 设置已移动的提示（「… has moved to its own <a>Runner type</a> settings page.」见 inline）
    'Some settings have moved': '部分設定已移動',
    // 合作伙伴智能体（「Allow Claude <span>coding agent</span>」见 inline）
    "Enabling an agent allows it to be mentioned in issues and pull requests, and assigned to issues and open pull requests. Agents can only be triggered by organization members and repository collaborators, and can only be used in this organization's repositories where the cloud agent feature is enabled.":
      '啟用代理後，可以在議題和拉取請求中提及它，並將其指派給議題和開啟的拉取請求。代理只能由組織成員和儲存庫協作者觸發，且只能在此組織已啟用雲端代理功能的儲存庫中使用。',
    // 运行器类型（「Select … for」「Copilot cloud agent」「sessions.」是相邻文本节点，整体匹配）
    'Select the default runner type for Copilot cloud agent sessions.': '選擇 Copilot 雲端代理工作階段的預設執行器類型。',
    'Select the runner type for Copilot cloud agent sessions.': '選擇 Copilot 雲端代理工作階段的執行器類型。',
    'Select the default runner type for Copilot code review sessions.': '選擇 Copilot 程式碼審查工作階段的預設執行器類型。',
    'Select the runner type for Copilot code review sessions.': '選擇 Copilot 程式碼審查工作階段的執行器類型。',
    'Repositories in this organization will use the selected runner type unless overridden at the repository level.':
      '除非在儲存庫層級覆寫，否則此組織中的儲存庫將使用所選的執行器類型。',
    'When enabled, repositories can specify their own runner via their copilot-setup-steps.yml file.':
      '啟用後，儲存庫可以透過各自的 copilot-setup-steps.yml 檔案指定執行器。',
    'When enabled, repositories can specify their own runner via their copilot-code-review.yml file.':
      '啟用後，儲存庫可以透過各自的 copilot-code-review.yml 檔案指定執行器。',
    // 互联网访问（组织级）
    'Configure firewall rules for Copilot in the cloud across all repositories in this organization.':
      '為此組織所有儲存庫中的雲端 Copilot 設定防火牆規則。',
    'Limit Internet access for Copilot in the cloud to only allow access to allowlisted locations.':
      '僅允許雲端 Copilot 存取允許清單中的網際網路位置。',
    'Configure firewall rules for Copilot code review across all repositories in this organization.':
      '為此組織所有儲存庫中的 Copilot 程式碼審查設定防火牆規則。',
    'Limit Internet access for Copilot code review to only allow access to allowlisted locations.':
      '僅允許 Copilot 程式碼審查存取允許清單中的網際網路位置。',
    'Allow repository administrators to add their own custom allowlist rules in addition to the organization allowlist.':
      '允許儲存庫管理員在組織允許清單之外新增自己的自訂允許清單規則。',
    'Allow access to specific domains, IP addresses, or URLs for all repositories in this organization.':
      '允許此組織的所有儲存庫存取特定網域、IP 位址或 URL。',
    // 代码审查默认设置
    "These are the defaults for this organization's repositories. Repository admins can override them.":
      '以下是此組織儲存庫的預設設定。儲存庫管理員可以覆寫這些設定。',
    'Secret Protection AI Scan': '機密保護 AI 掃描',
    'Uses machine learning and known patterns to detect secrets when Copilot reviews pull requests.':
      'Copilot 審查拉取請求時，使用機器學習和已知模式偵測機密。',
    'Choose where Copilot can approve pull requests and where those approvals can count toward merge requirements.':
      '選擇 Copilot 可以在哪些位置核准拉取請求，以及這些核准在哪些位置計入合併要求。',
    'Disabled everywhere': '全部停用',
    // 未启用 Copilot 时的引导
    'The AI powered pair programmer for your organization. Once you complete onboarding, you’ll have the ability to manage policies and control which users or teams will have access to':
      '為組織打造的 AI 結對程式設計師。完成初始設定後，你就能管理政策並控制組織內哪些使用者或團隊可以使用',
    "The AI powered pair programmer for your organization. Once you complete onboarding, you'll have the ability to manage policies and control which users or teams will have access to":
      '為組織打造的 AI 結對程式設計師。完成初始設定後，你就能管理政策並控制組織內哪些使用者或團隊可以使用',

    // 访问：席位分配
    'Copilot Business is active in your organization': '你的組織已啟用 Copilot 商務版',
    'Copilot Enterprise is active in your organization': '你的組織已啟用 Copilot 企業版',
    'Access management': '存取管理',
    'Enabled for all members': '已為所有成員啟用',
    'Enabled for selected members': '已為選取的成員啟用',
    'Enabled For:': '啟用範圍：',
    'selected members': '選取的成員',
    'all members': '所有成員',
    'Allow this organization to assign seats': '允許此組織指派席次',
    'Start adding seats': '開始新增席次',
    'Purchase for all members': '為所有成員購買',
    'Purchase for selected members': '為選取的成員購買',
    'Confirm seats purchase for all members': '確認為所有成員購買席次',
    'Enable Copilot access for users and teams': '為使用者和團隊啟用 Copilot 存取權',
    'Upload CSV': '上傳 CSV',
    'Choose CSV to upload': '選擇要上傳的 CSV',
    'Continue to purchase': '繼續購買',
    'Remove Copilot access': '移除 Copilot 存取權',
    'Confirm and remove seats': '確認並移除席次',
    'Confirm policy update': '確認政策更新',
    'Renew seats': '續訂席次',
    'Cancel seat': '取消席次',
    'Confirm seat removal': '確認移除席次',
    'Go to policies': '前往政策',
    'Add people': '新增人員',
    'Add teams': '新增團隊',
    'Last activity': '上次活動',
    'No activity yet': '尚無活動',
    'Members awaiting Copilot access': '等待 Copilot 存取權的成員',
    // 「3 members」+「will get … — no action needed. …」：分句间的破折号译「——」
    'will get Copilot access automatically within 24 hours — no action needed. Need it sooner? Pay now.':
      '將在 24 小時內自動取得 Copilot 存取權——不需要採取任何動作。需要提早取得嗎？立即付款。',
    'Pay now': '立即付款',
    'Confirm purchase': '確認購買',
    'Please confirm you are purchasing the previously assigned licenses.': '請確認你要購買先前指派的授權。',
    'Purchase licenses': '購買授權',
    'Purchase failed': '購買失敗',
    'Something went wrong while starting your purchase. Please try again.': '開始購買時發生錯誤。請再試一次。',
    'Due today': '今日應付',
    'Covered by account credits': '由帳號點數支付',
    // 「This organization is part of」+ 企业名 +「and is billed at the enterprise level.」：原文无逗号，译文不加
    'This organization is part of': '此組織隸屬於',
    'and is billed at the enterprise level.': '並在企業層級計費。',
    'Get activity report': '取得活動報告',
    'Get reports': '取得報告',
    'View policies': '查看政策',

    // Copilot Memory 管理
    'Download user memories': '下載使用者記憶',
    'Delete user memories': '刪除使用者記憶',
    'Delete user memories?': '要刪除使用者記憶嗎？',
    'Download user memories?': '要下載使用者記憶嗎？',
    'Delete memories': '刪除記憶',
    'Download memories': '下載記憶',
    'This action cannot be undone. Deleted memories cannot be recovered.': '此動作無法復原。已刪除的記憶無法復原。',
    // 原文按钮名无引号，译文不加
    'By clicking Delete memories, you confirm you have permission to perform this action on behalf of these users.':
      '按一下刪除記憶即表示你確認有權代表這些使用者執行此動作。',
    'By clicking Download memories, you confirm you have permission to access this information on behalf of users in this':
      '按一下下載記憶即表示你確認有權代表使用者存取這些資訊，這些使用者屬於此',
    'Checking delete status...': '正在檢查刪除狀態...',
    'Checking delete status…': '正在檢查刪除狀態…',
    'Deleting memories...': '正在刪除記憶...',
    'Deleting memories…': '正在刪除記憶…',
    'Checking export status...': '正在檢查匯出狀態...',
    'Checking export status…': '正在檢查匯出狀態…',
    'Generating report...': '正在產生報告...',
    'Generating report…': '正在產生報告…',
    'Memory delete completed': '記憶已刪除',
    'Memory delete is taking longer than expected': '刪除記憶所需的時間比預期長',
    'Memory delete failed': '記憶刪除失敗',
    'Memory export is taking longer than expected': '匯出記憶所需的時間比預期長',
    'Memory export failed': '記憶匯出失敗',
    'User memories have been permanently deleted.': '使用者記憶已永久刪除。',
    'This delete is taking longer than expected. You can close this dialog and check again later.':
      '刪除所需的時間比預期長。你可以關閉此對話方塊並稍後再查看。',
    'This export is taking longer than expected. You can close this dialog and check again later.':
      '匯出所需的時間比預期長。你可以關閉此對話方塊並稍後再查看。',
    "We couldn't delete these memories. Please try again later.": '無法刪除這些記憶。請稍後再試。',
    'We couldn’t delete these memories. Please try again later.': '無法刪除這些記憶。請稍後再試。',
    "We couldn't check the delete status. Please try again later.": '無法檢查刪除狀態。請稍後再試。',
    'We couldn’t check the delete status. Please try again later.': '無法檢查刪除狀態。請稍後再試。',
    'A memory delete is already in progress for this scope.': '此範圍的記憶刪除已在處理中。',
    "You've made too many delete requests. Please try again later.": '刪除請求次數過多。請稍後再試。',
    'You’ve made too many delete requests. Please try again later.': '刪除請求次數過多。請稍後再試。',
    "We couldn't generate your export. Please try again later.": '無法產生匯出檔案。請稍後再試。',
    'We couldn’t generate your export. Please try again later.': '無法產生匯出檔案。請稍後再試。',
    "We couldn't check your export status. Please try again later.": '無法檢查匯出狀態。請稍後再試。',
    'We couldn’t check your export status. Please try again later.': '無法檢查匯出狀態。請稍後再試。',

    // 内容排除（组织）
    'Choose the repositories and paths that GitHub Copilot should exclude.': '選擇 GitHub Copilot 應排除的儲存庫和路徑。',
    'All exclusions defined will apply to all members of your organization.': '定義的所有排除項目都將套用至組織的所有成員。',
    'Repositories and paths to exclude:': '要排除的儲存庫和路徑：',

    // 运行器类型（组织级）
    'Runner type configuration': '執行器類型設定',
    'Edit runner type': '編輯執行器類型',
    'Standard GitHub runner': '標準 GitHub 執行器',
    'Labeled runner': '帶有標籤的執行器',
    'Save runner selection': '儲存執行器選擇',
    'Allow repositories to customize the runner type': '允許儲存庫自訂執行器類型',

    // 合作伙伴代理
    'Partner agents': '合作夥伴代理',
    'Allow automations': '允許自動化',

    // 编码代理 / 云代理：存储库访问
    'Choose which repositories Copilot coding agent should be enabled in. Copilot coding agent will only be available where it is enabled for the repository and in the Copilot license policies.':
      '選擇要在哪些儲存庫中啟用 Copilot 程式開發代理。只有在儲存庫已啟用且 Copilot 授權政策允許時，Copilot 程式開發代理才可使用。',
    'Choose which repositories Coding agent should be enabled in. Coding agent will only be available where it is enabled for the repository and in the Copilot license policies.':
      '選擇要在哪些儲存庫中啟用程式開發代理。只有在儲存庫已啟用且 Copilot 授權政策允許時，程式開發代理才可使用。',
    'Choose which repositories Copilot cloud agent should be enabled in. Copilot cloud agent will only be available where it is enabled for the repository and in the Copilot license policies.':
      '選擇要在哪些儲存庫中啟用 Copilot 雲端代理。只有在儲存庫已啟用且 Copilot 授權政策允許時，Copilot 雲端代理才可使用。',

    // 策略、模型
    'Configure custom models': '設定自訂模型',
    'Configure models': '設定模型',
    'Restrict MCP access to registry servers': '將 MCP 存取限制為登錄庫中的伺服器',
    'Allow use of Copilot CLI billed to the organization': '允許使用向組織計費的 Copilot CLI',
    'Default availability': '預設可用性',
    'Default availability for released models': '已發布模型的預設可用性',
    'Delegate to Default Policy': '委派給預設政策',
    'Enable custom models': '啟用自訂模型',
    'Add API key': '新增 API 金鑰',
    'Available models': '可用模型',
    'Deployment URL': '部署 URL',
    'Enable GitHub Copilot': '啟用 GitHub Copilot'
  },
  scoped: {
    // 自动化分组标题、代码审查的批准分组、合作伙伴智能体名后的标签
    Automations: '自動化',
    Approvals: '核准',
    'coding agent': '程式開發代理',
    // 「…will have access to」+「Copilot」+「inside your organization.」
    'inside your organization.': '。',
    'Pending cancellation': '待取消',
    'API key': 'API 金鑰',
    // 席位与访问（与企业 / 个人设置同名）
    'Copilot access': 'Copilot 存取權',
    'Users and teams': '使用者和團隊',
    'Assign seats': '指派席次',

    // 策略（与个人 Copilot 设置同名）
    'Opt in to preview features': '選擇加入預覽功能',
    'Opt in to user feedback collection': '選擇加入使用者意見回饋收集',
    'If enabled, users will see options to provide feedback on selected Copilot features.':
      '啟用後，使用者會看到可針對部分 Copilot 功能提供意見回饋的選項。',
    'If enabled, users can test new Copilot features that are not yet generally available. Be aware that previews of features may have flaws, and the features may be changed or discontinued at any time.':
      '啟用後，使用者可以試用尚未正式推出的 Copilot 新功能。請注意，預覽功能可能有瑕疵，且這些功能可能隨時變更或停止提供。',
    'Agent apps': '代理應用程式',
    // 状态用「已＋动词」，与规则集洞察一致
    Allowed: '已允許',
    Blocked: '已阻擋',
    Unconfigured: '未設定',
    'No policy': '無政策',
    'Select an option': '選擇選項',
    'Failed to update setting': '無法更新設定',
    'Failed to update setting, please try again later.': '無法更新設定，請稍後再試。',
    Unavailable: '無法使用',
    'Requires preview features': '需要預覽功能',
    'Preview features are disabled by your enterprise.': '你的企業已停用預覽功能。',
    'Preview features are not enabled for this organization.': '此組織未啟用預覽功能。',
    'Manage preview features': '管理預覽功能',

    // 代码审查（与存储库设置共用）
    'General settings': '一般設定',
    'Limits the review effort Copilot can use in this organization. Repositories can only set a stricter limit.':
      '限制 Copilot 在此組織中可使用的審查強度。儲存庫只能設定更嚴格的限制。',
    'Organization default': '組織預設值',
    'Inherit the review effort level set for the organization': '繼承組織設定的審查強度',
    'Enterprise default': '企業預設值',
    'Inherit the GitHub default review effort level': '繼承 GitHub 預設審查強度',
    'Use the default review effort level': '使用預設審查強度',
    'No limit': '無限制',
    'Copilot can use any available review effort': 'Copilot 可以使用任何可用的審查強度',
    'Use the maximum review effort set for the organization': '使用組織設定的最高審查強度',
    'Use the maximum review effort set at a higher level': '使用上層設定的最高審查強度',
    Lite: '輕量',
    Balanced: '平衡',
    Max: '最高',
    Auto: '自動',

    // 云代理（与存储库设置共用）
    'No repositories': '無儲存庫',
    'Only selected repositories': '僅選取的儲存庫',
    'Enable firewall': '啟用防火牆',
    'Recommended allowlist': '建議的允許清單',
    'Custom allowlist': '自訂允許清單',
    'Add rule': '新增規則',
    'Delete rule': '刪除規則',
    'No rules yet': '尚無規則',
    'Validation tools': '驗證工具',
    'Model Context Protocol (MCP)': '模型上下文協定 (MCP)',
    'MCP configuration': 'MCP 設定',
    // 「Use of Copilot coding agent is subject to the」+「pre-release terms」
    'pre-release terms': '發行前版本條款',

    // 内容排除（与存储库设置共用）
    'Use separate lines to choose which folders and files will be excluded by GitHub Copilot':
      '每行指定一個要讓 GitHub Copilot 排除的資料夾或檔案',
    'Excluded paths not updated, check the errors and try again.': '排除路徑未更新，請檢查錯誤後再試一次。',
    'Excluded paths updated.': '已更新排除路徑。',
    'Delete excluded paths': '刪除排除路徑',
    'You are about to delete all excluded paths. Are you sure you want to proceed?': '你即將刪除所有排除路徑。確定要繼續嗎？',
    'Copilot won’t be able to access or utilize the contents located in those specified paths.':
      'Copilot 將無法存取或使用這些指定路徑中的內容。',
    "Copilot won't be able to access or utilize the contents located in those specified paths.":
      'Copilot 將無法存取或使用這些指定路徑中的內容。',
    'Learn more about setup and usage.': '瞭解設定和使用方式。',
    'Excluded paths inherited from': '排除路徑繼承自',
    'Values defined by': '值定義自',
    'last edited': '上次編輯於',

    // 选择存储库对话框：筛选按钮与计数片段（item → 「項目」）
    Exclude: '排除',
    'items shown.': '個項目已顯示。',
    'No filter': '無篩選器',
    'Error loading repositories.': '載入儲存庫時發生錯誤。',
    'No repositories to show.': '沒有可顯示的儲存庫。',

    // 未启用 Copilot、试用与购买（与个人 Copilot 设置一致）
    'Not enabled': '未啟用',
    'Get started': '開始使用',
    'Getting started': '入門',
    'to get started.': '以開始使用。',
    'Start free trial': '開始免費試用',
    'Start a free trial': '開始免費試用',
    'Create an organization': '建立組織',
    'Requesting...': '申請中...',
    'Requesting…': '申請中…',
    'Cancelling...': '取消中...',
    'Cancelling…': '取消中…',
    'Read more.': '瞭解詳情。',
    'Upgrade plan': '升級方案',
    'Purchase Copilot': '購買 Copilot',
    'Enable Copilot': '啟用 Copilot',
    'Disable Copilot': '停用 Copilot',
    'Contact an enterprise owner to enable them.': '聯絡企業擁有者以啟用這些功能。',
    'Contact an organization owner to enable them.': '聯絡組織擁有者以啟用這些功能。',

    // 访问：席位
    'Seat management': '席次管理',
    'Copilot seat assignment': 'Copilot 席次指派',
    'Disabled for all members': '已為所有成員停用',

    // 策略、功能名
    'Copilot in the IDE': 'IDE 中的 Copilot',
    'MCP servers in Copilot CLI': 'Copilot CLI 中的 MCP 伺服器',
    'Copilot metrics API access': 'Copilot 指標 API 存取權',
    'Copilot usage metrics': 'Copilot 使用量指標',
    'Enabled everywhere': '已全面啟用',
    'Enabled for all repositories': '已為所有儲存庫啟用',
    'Enabled for selected repositories': '已為選取的儲存庫啟用',
    'Disabled for all repositories': '已為所有儲存庫停用',
    'Review effort': '審查強度',
    'Default (Balanced)': '預設（平衡）',

    // 云代理、内容排除
    'Coding agent policies': '程式開發代理政策',
    'Third-party agents': '第三方代理',
    Firewall: '防火牆',
    Allowlist: '允許清單',
    'Paths to exclude': '要排除的路徑',
    'Repositories and paths to exclude': '要排除的儲存庫和路徑'
  },
  regexp: [
    [/^(\d+) seats? assigned$/, '已指派 $1 個席次'],
    // 省略号随原文
    [/^(\d+) members? selected(\.\.\.|…)$/, '已選取 $1 位成員$2'],
    [/^(\d+) teams? selected$/, '已選取 $1 個團隊'],
    [
      /^You have (\d+) characters, but the maximum is (\d+)(\.?)$/,
      (_, count: string, max: string, dot: string) => `目前有 ${count} 個字元，上限為 ${max} 個${dot ? '。' : ''}`
    ],
    // 模型策略说明（与个人 Copilot 设置一致）
    [/^If enabled, you can access and send data to ([\w .()/:-]{1,100})\.$/, '啟用後，你可以存取 $1 並向其傳送資料。'],
    // 存储库选择器只显示部分结果：「10」+「 of 」+「1.2k」+「 items shown.」
    [/^(\d[\d,]*) of (\d[\d,.]*[kKmM]?) items shown\.$/, '已顯示 $2 個項目中的 $1 個。'],
    // 确认购买对话框的金额明细（「今日應付」旁、各方案明细行），单个文本节点；人用量词「位」
    [/^(\d[\d,]*) users?, (\$[\d,]+(?:\.\d+)?) per user\/month$/, '$1 位使用者，每位使用者 $2/月'],
    // 删除、下载记忆对话框首段：整句是一个文本节点（登录名、计费的组织或企业）。
    // 登录名放在「計費的」之后，避免「octocat 向 octo-org 計費」读成 octocat 收费
    [
      /^This will permanently delete user-scoped Copilot memories for ([\w-]+) that are billed to (.+)\.$/,
      '這會永久刪除向 $2 計費的 $1 使用者範圍 Copilot 記憶。'
    ],
    [
      /^This will permanently delete user-scoped Copilot memories for all users with Copilot seats billed to (.+)\.$/,
      '這會永久刪除 Copilot 席次向 $1 計費之所有使用者的使用者範圍 Copilot 記憶。'
    ],
    [
      /^This will download user-scoped Copilot memories for ([\w-]+) that are billed to (.+)\.$/,
      '這會下載向 $2 計費的 $1 使用者範圍 Copilot 記憶。'
    ],
    [
      /^This will download user-scoped Copilot memories for all users with Copilot seats billed to (.+)\.$/,
      '這會下載 Copilot 席次向 $1 計費之所有使用者的使用者範圍 Copilot 記憶。'
    ],
    // 下载记忆对话框第二段：「… in this 」+ 实体类型 +「.」三个相邻文本节点，整段拼读
    [
      /^By clicking Download memories, you confirm you have permission to access this information on behalf of users in this (organization|enterprise)\.$/,
      (_, entity: string) => `按一下下載記憶即表示你確認有權代表此${ENTITY_TYPES[entity]}的使用者存取這些資訊。`
    ],
    // 内容排除的继承规则说明：图标 +「 Values defined by 」+ 名称 +「's administrators can't be edited」，整段拼读
    [/^Values defined by (.+?)['’]s administrators can['’]t be edited$/, '由 $1 的管理員定義的值無法編輯'],
    // 继承规则标签：「Excluded paths inherited from 」+ 层级 +「 」+ 名称 +「:」。名称有链接时前三段拼读、
    // 冒号是孤立标点（拼读为「排除路徑繼承自企業 <a>octo-ent</a>：」）；没有链接时名称也是文本，整段拼读
    [/^Excluded paths inherited from (enterprise|organization)$/, (_, level: string) => `排除路徑繼承自${ENTITY_TYPES[level]}`],
    [
      /^Excluded paths inherited from (enterprise|organization) (.+):$/,
      (_, level: string, name: string) => `排除路徑繼承自${ENTITY_TYPES[level]} ${name}：`
    ]
  ],
  inline: [
    ['Runner type configuration has moved to its own {} settings page.', '執行器類型設定已移至獨立的{}設定頁面。'],
    ['Internet access configuration has moved to its own {} settings page.', '網際網路存取設定已移至獨立的{}設定頁面。'],
    ['Allow Claude {}', '允許 Claude {}'],
    ['Allow Codex {}', '允許 Codex {}']
  ]
} satisfies PageDictionary
