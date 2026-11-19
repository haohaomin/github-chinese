import { TIME_SOURCE, joinCjk, translateTime } from '../helpers'
import type { PageDictionary } from '../../../core/types'
import { BYPASS_ACTOR_ACTIONS_RULE, DEPENDABOT_RULES_REGEXP, DEPENDABOT_RULES_SCOPED } from '../org-settings/security'

/**
 * 存储库设置 · Advanced Security（代码安全与分析）：专用漏洞报告、依赖项关系图、自动依赖项提交、Dependabot、
 * 代码扫描（CodeQL 默认 / 高级设置、Copilot Autofix、检查运行失败阈值）、Secret Protection、警报访问权限；
 * Dependabot 规则页（/<owner>/<repo>/settings/dependabot_rules）。
 * 与组织设置共用的文字沿用 org-settings / settings-developer 的译法；Dependabot 规则页取用 org-settings/security.ts 的共用常量。
 * 产品名译法见 nav.ts 文件头：Advanced Security → 進階安全性、Secret Protection → 機密保護、Actions 运行器 → 動作執行器
 * （与 org-settings/security.ts 同一标签同译）、GitHub Actions → GitHub 動作、Copilot Autofix → Copilot 自動修正；
 * CodeQL、Dependabot 保留。
 * 术语：dependency → 相依（相依項目、相依性圖表），manifest → 資訊清單，ecosystem → 生態系，actor → 執行者，
 * bypass → 繞過，dismiss（警示）→ 解除，eligible → 符合資格，extended → 擴充，preset → 預設集，
 * severity level → 嚴重性層級，threshold → 門檻，check in → 簽入，self-hosted → 自架，credential → 認證資訊，
 * finding → 發現項目（同 security/code-scanning.ts）。
 */
export default {
  static: {
    // 简介
    "Advanced Security features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository.":
      '進階安全性功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對儲存庫執行唯讀分析。',
    'Advanced Security features help keep your repository secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repository.':
      '進階安全性功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對儲存庫執行唯讀分析。',
    "Advanced Security features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository. Unarchive your repository to access additional features.":
      '進階安全性功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對儲存庫執行唯讀分析。取消封存儲存庫以使用更多功能。',
    'Advanced Security features help keep your repository secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repository. Unarchive your repository to access additional features.':
      '進階安全性功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對儲存庫執行唯讀分析。取消封存儲存庫以使用更多功能。',
    "Security and analysis features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository.":
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對儲存庫執行唯讀分析。',
    'Security and analysis features help keep your repository secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repository.':
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對儲存庫執行唯讀分析。',

    // 私下回报漏洞、相依性图表
    'Allow your community to privately report potential security vulnerabilities to maintainers and repository owners.':
      '允許社群向維護者和儲存庫擁有者私下回報潛在的安全性漏洞。',
    'Learn more about private vulnerability reporting': '瞭解私下回報漏洞',
    'Enable private vulnerability reporting': '啟用私下回報漏洞',
    'Understand your dependencies.': '瞭解你的相依項目。',
    'Dependency Scanning': '相依性掃描',
    // 「Understand the packages this repository depends on and secure its」+「software supply chain」
    'Understand the packages this repository depends on and secure its': '瞭解此儲存庫相依的套件並保護其',
    'software supply chain': '軟體供應鏈',
    'Learn more about software supply chain security (opens in a new tab)': '瞭解軟體供應鏈安全性（在新分頁中開啟）',
    "Identify and understand your project's dependencies.": '識別並瞭解專案的相依項目。',
    'Identify and understand your project’s dependencies.': '識別並瞭解專案的相依項目。',
    'Disabling the dependency graph will also disable Dependabot alerts and Dependabot security updates.':
      '停用相依性圖表也會停用 Dependabot 警示和 Dependabot 安全性更新。',
    'Disabling the dependency graph will also disable Dependabot alerts.': '停用相依性圖表也會停用 Dependabot 警示。',
    // 与 insights/dependency-graph.ts 的「相依性提交 API」一致
    'Automatic dependency submission': '自動相依性提交',
    'Automatically detect and report build-time dependencies for select ecosystems.': '自動偵測並回報部分生態系的建置階段相依項目。',
    'Use standard GitHub runners': '使用標準 GitHub 執行器',
    'Enabled for labeled runners': '已為帶有標籤的執行器啟用',
    "Use runners labeled with 'dependency-submission'": '使用帶有「dependency-submission」標籤的執行器',
    'No runners with this label assigned to repository': '儲存庫未指派帶有此標籤的執行器',

    // Dependabot
    'Keep your dependencies secure and up-to-date.': '讓相依項目保持安全和最新。',
    // 后接「Dependabot」链接：with 改作判断句「…的工具是」+「Dependabot」；原文无标点，译文不加
    'Keep your dependencies secure and up-to-date with': '讓相依項目保持安全和最新的工具是',
    'Learn more about Dependabot': '瞭解 Dependabot',
    'Learn more about Dependabot (opens in a new tab)': '瞭解 Dependabot（在新分頁中開啟）',
    'Receive alerts when vulnerabilities are detected in your dependencies.': '在相依項目中偵測到漏洞時接收警示。',
    "Dependabot alerts needs the dependency graph to be enabled, so we'll turn that on too.":
      'Dependabot 警示需要啟用相依性圖表，因此我們也會一併開啟。',
    'Dependabot alerts needs the dependency graph to be enabled, so we’ll turn that on too.':
      'Dependabot 警示需要啟用相依性圖表，因此我們也會一併開啟。',
    // 拉取请求语境的动词 open → 建立
    'Automatically open pull requests for alerts with a patch.': '自動為有修補程式的警示建立拉取請求。',
    'Group security updates into one pull request per package manager and manifest directory. For advanced configuration, disable this setting and use dependabot.yml.':
      '將安全性更新依套件管理員和資訊清單目錄分組，每組合併為一個拉取請求。如需進階設定，請停用此設定並使用 dependabot.yml。',
    // 「Automatically open dependency update pull requests by」+「configuring dependabot.yml」：by 译作「…的方法是」
    'Automatically open dependency update pull requests by': '自動建立相依項目更新拉取請求的方法是',
    'configuring dependabot.yml': '設定 dependabot.yml',
    'Create dependabot.yml': '建立 dependabot.yml',
    'Receive alerts for vulnerabilities that affect your dependencies and manually generate Dependabot pull requests to resolve these vulnerabilities.':
      '接收影響相依項目的漏洞警示，並手動產生 Dependabot 拉取請求來解決這些漏洞。',
    'Configure alert notifications': '設定警示通知',
    'Create your own custom rules and manage alert presets.': '建立自訂規則並管理警示預設集。',
    'Review and manage alert presets.': '查看並管理警示預設集。',
    // 「Dependabot rules」行的齿轮按钮（组织安全设置页同用此条）
    'Configure Dependabot rules': '設定 Dependabot 規則',
    // 警示列表的 open 作「未解決」
    'Enabling this option will result in Dependabot automatically attempting to open pull requests to resolve every open Dependabot alert with an available patch.':
      '啟用此選項後，Dependabot 會自動嘗試建立拉取請求，以解決每個有可用修補程式的未解決 Dependabot 警示。',
    'Enabling this option will result in Dependabot automatically attempting to open pull requests to resolve every open Dependabot alert with an available patch. If you would like more specific configuration options, leave this disabled and use':
      '啟用此選項後，Dependabot 會自動嘗試建立拉取請求，以解決每個有可用修補程式的未解決 Dependabot 警示。如需更具體的設定選項，請保持停用並使用',
    "Dependabot security updates needs the dependency graph and Dependabot alerts to be enabled, so we'll turn them on too.":
      'Dependabot 安全性更新需要啟用相依性圖表和 Dependabot 警示，因此我們也會一併開啟。',
    'Dependabot security updates needs the dependency graph and Dependabot alerts to be enabled, so we’ll turn them on too.':
      'Dependabot 安全性更新需要啟用相依性圖表和 Dependabot 警示，因此我們也會一併開啟。',
    "Dependabot security updates needs Dependabot alerts to be enabled, so we'll turn that on too.":
      'Dependabot 安全性更新需要啟用 Dependabot 警示，因此我們也會一併開啟。',
    'Dependabot security updates needs Dependabot alerts to be enabled, so we’ll turn that on too.':
      'Dependabot 安全性更新需要啟用 Dependabot 警示，因此我們也會一併開啟。',
    // 末尾「 -」后接「learn more here」链接，照原文保留
    'Groups all available updates that resolve a Dependabot alert into one pull request (per package manager and directory of requirement manifests). This option may be overridden by group rules specified in dependabot.yml -':
      '將所有可解決 Dependabot 警示的可用更新合併為一個拉取請求（依套件管理員和需求資訊清單目錄分組）。dependabot.yml 中指定的分組規則可能會覆寫此選項 -',
    "Grouped security updates needs the dependency graph, Dependabot alerts and Dependabot security updates to be enabled, so we'll turn them on too":
      '分組安全性更新需要啟用相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會一併開啟',
    'Grouped security updates needs the dependency graph, Dependabot alerts and Dependabot security updates to be enabled, so we’ll turn them on too':
      '分組安全性更新需要啟用相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會一併開啟',
    "Grouped security updates needs Dependabot alerts and Dependabot security updates to be enabled, so we'll turn them on too.":
      '分組安全性更新需要啟用 Dependabot 警示和 Dependabot 安全性更新，因此我們也會一併開啟。',
    'Grouped security updates needs Dependabot alerts and Dependabot security updates to be enabled, so we’ll turn them on too.':
      '分組安全性更新需要啟用 Dependabot 警示和 Dependabot 安全性更新，因此我們也會一併開啟。',
    "Grouped security updates needs Dependabot security updates to be enabled, so we'll turn that on too.":
      '分組安全性更新需要啟用 Dependabot 安全性更新，因此我們也會一併開啟。',
    'Grouped security updates needs Dependabot security updates to be enabled, so we’ll turn that on too.':
      '分組安全性更新需要啟用 Dependabot 安全性更新，因此我們也會一併開啟。',
    'Allow Dependabot to open pull requests automatically to keep your dependencies up-to-date when new versions are available.':
      '允許 Dependabot 在有新版本時自動建立拉取請求，讓相依項目保持最新。',
    'Learn more about configuring a dependabot.yml file': '瞭解如何設定 dependabot.yml 檔案',
    'Learn more about configuring a dependabot.yml file.': '瞭解如何設定 dependabot.yml 檔案。',
    'Learn more about Dependabot.': '瞭解 Dependabot。',
    'Run Dependabot security and version updates on Actions runners.': '在動作執行器上執行 Dependabot 安全性更新和版本更新。',
    'Run Dependabot security and version updates on self-hosted Actions runners.':
      '在自架動作執行器上執行 Dependabot 安全性更新和版本更新。',

    // 代码扫描
    'Code scanning with GitHub Actions is not available for this repository.': '此儲存庫無法使用透過 GitHub 動作執行的程式碼掃描。',
    // 后接「enable it」与「submit code scanning results externally using the API」链接
    'GitHub Actions is disabled on this repository because it is a fork. To use code scanning please':
      '此儲存庫是分叉，因此已停用 GitHub 動作。若要使用程式碼掃描，請',
    'GitHub Actions is disabled on this repository by an enterprise or organization policy. To use code scanning, please ask your organization administrator to enable Actions, or':
      '企業或組織政策已在此儲存庫停用 GitHub 動作。若要使用程式碼掃描，請要求組織管理員啟用 GitHub 動作，或',
    // submit 作「送出」，与 commit（提交）分开
    'submit code scanning results externally using the API': '使用 API 從外部送出程式碼掃描結果',
    'Prevent direct alert dismissals': '禁止直接解除警示',
    'Actors must submit requests to dismiss an alert. This can impact pull requests requiring code scanning dismissal to merge.':
      '執行者必須送出請求才能解除警示。這可能會影響需要解除程式碼掃描警示才能合併的拉取請求。',
    'CodeQL analysis': 'CodeQL 分析',
    'Identify vulnerabilities and errors with CodeQL for eligible repositories.': '使用 CodeQL 為符合資格的儲存庫識別漏洞和錯誤。',
    'Last scan': '上次掃描',
    'CodeQL will automatically find the best configuration for your repository.': 'CodeQL 會自動為你的儲存庫找出最佳設定。',
    'Languages detected in this repository are not compatible with this setup type at this time. Use the advanced setup instead.':
      '此儲存庫中偵測到的語言目前與此設定類型不相容。請改用進階設定。',
    'Customize your CodeQL configuration via a YAML file checked into the repository.': '透過簽入儲存庫的 YAML 檔案自訂 CodeQL 設定。',
    'Not supported': '不支援',
    'Languages on this repository are not compatible with this feature. Learn more about': '此儲存庫中的語言與此功能不相容。瞭解',
    'supported languages and frameworks': '支援的語言和架構',
    'CodeQL default configuration': 'CodeQL 預設設定',
    'These languages were detected on the default branch of this repository.': '在此儲存庫的預設分支上偵測到這些語言。',
    'No CodeQL supported languages to scan in this repository': '此儲存庫中沒有 CodeQL 支援掃描的語言',
    // 「CodeQL will automatically perform the first scan when it detects」+「a supported language」+「on the default branch.」
    'CodeQL will automatically perform the first scan when it detects': 'CodeQL 在預設分支上偵測到',
    'a supported language': '支援的語言',
    'CodeQL high-precision queries.': 'CodeQL 高精確度查詢。',
    'Queries from the default suite, plus lower severity and precision queries.': '預設套件中的查詢，以及嚴重性和精確度較低的查詢。',
    'This is the runner default setup will use to run': '這是預設設定執行時將使用的執行器',
    'Loading runner info...': '正在載入執行器資訊...',
    'Loading runner info…': '正在載入執行器資訊…',
    'Scan events': '掃描事件',
    'These events will trigger a new scan.': '這些事件會觸發新的掃描。',
    // 后接分支名或「protected branches」
    'On push and pull requests to': '推送和拉取請求至',
    'On a weekly schedule': '每週排程',
    'Next scan of': '下次掃描',
    'Enable CodeQL': '啟用 CodeQL',
    'Enabling CodeQL...': '正在啟用 CodeQL...',
    'Enabling CodeQL…': '正在啟用 CodeQL…',
    'View setup log': '查看設定記錄',
    // 前半句与 nav.ts 的「Repository settings saved.」同译
    'Repository settings saved. This initial setup might take a while because CodeQL will perform a full scan of the repository.':
      '儲存庫設定已儲存。CodeQL 會對儲存庫執行完整掃描，因此首次設定可能需要一段時間。',
    'View last scan log': '查看上次掃描記錄',
    'View Code Scanning alerts': '查看程式碼掃描警示',
    'View CodeQL configuration': '查看 CodeQL 設定',
    'Switch to advanced': '切換到進階設定',
    'Switch to a CodeQL workflow?': '切換到 CodeQL 工作流程？',
    'To switch to a workflow-based configuration, we must disable CodeQL first. CodeQL will stop analyzing code and resume once a valid workflow file is committed to the repository.':
      '若要切換到以工作流程為基礎的設定，我們必須先停用 CodeQL。CodeQL 會停止分析程式碼，待有效的工作流程檔案提交到儲存庫後再繼續。',
    'Disable CodeQL': '停用 CodeQL',
    'Disable CodeQL?': '停用 CodeQL？',
    // 后接「manually re-enabled to resume previous analyses」链接；警示状态 open 作「未解決」，close as fixed 作「關閉並標示為已修正」
    'CodeQL will stop analyzing code from this repository. Existing alerts will remain open; you can dismiss them but not close them as fixed, as CodeQL needs to be enabled for that to happen. Existing CodeQL Actions workflows on this repository must be':
      'CodeQL 會停止分析此儲存庫的程式碼。現有警示會維持未解決；你可以解除這些警示，但無法將其關閉並標示為已修正，因為這需要啟用 CodeQL。此儲存庫中現有的 CodeQL 動作工作流程必須',
    'manually re-enabled to resume previous analyses': '手動重新啟用才能繼續先前的分析',
    'Other tools': '其他工具',
    'Add any third-party code scanning tool.': '新增任何第三方程式碼掃描工具。',
    'Explore workflows': '探索工作流程',
    'Suggest fixes for CodeQL alerts using AI. CodeQL default or advanced setup must be enabled for this feature to work. Learn more about the':
      '使用 AI 為 CodeQL 警示建議修正。必須啟用 CodeQL 預設或進階設定，此功能才能運作。瞭解',
    'limitations of autofix code suggestions': '自動修正程式碼建議的限制',
    'Copilot Autofix enablement': 'Copilot 自動修正啟用狀態',
    // credits 作「點數」
    'Assign code scanning alerts to Copilot to create a fix and open a pull request. This feature consumes AI credits.':
      '將程式碼掃描警示指派給 Copilot 以產生修正並建立拉取請求。此功能會耗用 AI 點數。',
    'Agentic autofix enablement': '代理式自動修正啟用狀態',
    'AI Scan': 'AI 掃描',
    'Identify code security findings using AI.': '使用 AI 識別程式碼安全性發現項目。',
    'Learn more about AI scan': '瞭解 AI 掃描',
    'AI Scan for pull requests': '拉取請求 AI 掃描',
    'Generate security findings for non-CodeQL languages using AI.': '使用 AI 為 CodeQL 不支援的語言產生安全性發現項目。',
    'AI Scan for pull requests enablement': '拉取請求 AI 掃描啟用狀態',
    'AI Scan for repositories': '儲存庫 AI 掃描',
    'AI Scan for repositories enablement': '儲存庫 AI 掃描啟用狀態',
    'Scan for AI applications': '掃描 AI 應用程式',
    'Scan for AI applications enablement': '掃描 AI 應用程式啟用狀態',
    'Copilot Autofix for third-party tools': '第三方工具的 Copilot 自動修正',
    'Suggest fixes for third-party alerts using AI. Ensure that these tools are properly configured or that an analysis is uploaded for this feature to work. Learn more about the':
      '使用 AI 為第三方警示建議修正。請確認這些工具已正確設定或已上傳分析，此功能才能運作。瞭解',
    'limitations of autofix code suggestions for third party tools': '第三方工具自動修正程式碼建議的限制',
    'Check runs failure threshold': '檢查執行失敗門檻',
    'Select the alert severity level for code scanning check runs to fail.': '選擇會導致程式碼掃描檢查執行失敗的警示嚴重性層級。',
    'Create a branch ruleset': '建立分支規則集',
    // 「Create a branch ruleset」链接 +「to prevent a branch from merging when these checks fail.」
    'to prevent a branch from merging when these checks fail.': '以在這些檢查失敗時阻止分支合併。',
    'Security alert severity level:': '安全性警示嚴重性層級：',
    // 严重性 Critical 作「重大」
    'Only critical': '僅重大',
    'Standard alert severity level:': '標準警示嚴重性層級：',
    'Only errors': '僅錯誤',
    'Errors and warnings': '錯誤和警告',
    'Code Scanning alert severity settings saved.': '已儲存程式碼掃描警示嚴重性設定。',

    // 机密保护
    'GitHub will always send alerts to partners for detected secrets in public repositories.':
      'GitHub 一律會將公開儲存庫中偵測到的機密警示傳送給合作夥伴。',
    'Continuously monitor this repository to prevent secret exposures and protect credentials. GitHub will always send alerts to partners for detected secrets in public repositories.':
      '持續監控此儲存庫以防止機密外洩並保護認證資訊。GitHub 一律會將公開儲存庫中偵測到的機密警示傳送給合作夥伴。',
    'Token scanning enabled': '已啟用權杖掃描',
    'Disable Secret Protection': '停用機密保護',
    'This will disable Secret Protection for your repository.': '這會為你的儲存庫停用機密保護。',
    'Disable secret scanning alerts': '停用機密掃描警示',
    'Learn more about partner patterns': '瞭解合作夥伴模式',
    'Enable Secret Protection': '啟用機密保護',
    'This will enable Secret Protection for your repository.': '這會為你的儲存庫啟用機密保護。',
    'Enable secret scanning alerts': '啟用機密掃描警示',
    'No additional licenses will be consumed.': '不會額外耗用授權。',
    'Receive alerts on GitHub for detected secrets, keys, or other tokens.': '在 GitHub 上接收偵測到的機密、金鑰或其他權杖的警示。',
    'Custom patterns': '自訂模式',

    // 警示存取权
    'Access to alerts': '警示存取權',
    // 后接「notification settings」链接与句号：「…詳見」+「通知設定」+「。」
    "Admins, users, and teams in the list below have permission to view and manage code scanning, Dependabot, or secret scanning alerts. These users may be notified when a new vulnerability is found in one of this repository's dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their":
      '下方清單中的管理員、使用者和團隊有權查看並管理程式碼掃描、Dependabot 或機密掃描警示。在此儲存庫的相依項目中發現新漏洞或有機密、金鑰被簽入時，這些使用者可能會收到通知。他們查看 Dependabot 安全性更新時也會看到更多詳細資料。個人可以管理自己接收這些警示的方式，詳見',
    'Admins, users, and teams in the list below have permission to view and manage code scanning, Dependabot, or secret scanning alerts. These users may be notified when a new vulnerability is found in one of this repository’s dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their':
      '下方清單中的管理員、使用者和團隊有權查看並管理程式碼掃描、Dependabot 或機密掃描警示。在此儲存庫的相依項目中發現新漏洞或有機密、金鑰被簽入時，這些使用者可能會收到通知。他們查看 Dependabot 安全性更新時也會看到更多詳細資料。個人可以管理自己接收這些警示的方式，詳見',
    'Choose the people or teams you would like to grant access': '選擇要授予存取權的人員或團隊',
    'You have reached the maximum number of people and teams you can add.': '已達到可新增的人員和團隊數量上限。',
    'Remove one or more to continue adding others.': '移除一或多個後才能繼續新增。',
    'People and teams with access': '具有存取權的人員和團隊',
    'Organization administrators, repository administrators, and teams with the security manager role':
      '組織管理員、儲存庫管理員和具有安全性管理員角色的團隊',
    'These members always see code scanning, Dependabot, and secret scanning alerts.':
      '這些成員一律可以看到程式碼掃描、Dependabot 和機密掃描警示。'
  },
  scoped: {
    // 代码扫描设置里单独出现的功能名（见 nav.ts 文件头）
    'Copilot Autofix': 'Copilot 自動修正',
    // 「To use code scanning please」+「enable it」+「or」+ …
    'enable it': '啟用它',
    'Setting up': '設定中',
    'Grouped security updates': '分組安全性更新',
    'learn more here': '在此瞭解詳情',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Dependabot on Actions runners': '動作執行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自架執行器上的 Dependabot',
    'Push protection': '推送保護',
    // 「Block pushes that contain」+ 链接「supported secrets」：阻挡推送作「阻擋」（封鎖只用于用户；与 org-settings/security.ts 一致）
    'Block pushes that contain': '阻擋推送中出現',
    'supported secrets': '支援的機密',
    'Validity checks': '有效性檢查',
    'Non-provider patterns': '非提供者模式',
    'Scan for generic passwords': '掃描通用密碼',
    'New pattern': '新增模式',
    'Default setup': '預設設定',
    'Set up': '設定',
    Advanced: '進階',
    'Query suites': '查詢套件',
    // 「Group of queries」+「to run against your code.」（不加逗号）
    'Group of queries': '一組查詢',
    'to run against your code.': '用於對你的程式碼執行。',
    Extended: '擴充',
    'Runner type': '執行器類型',
    // 「Identify vulnerabilities and errors with」+ CodeQL +「for」+「eligible」+「repositories.」
    'Identify vulnerabilities and errors with': '使用',
    for: '為',
    eligible: '符合資格的',
    'repositories.': '儲存庫識別漏洞和錯誤。',
    // 「CodeQL will automatically perform the first scan when it detects」+ 链接 +「on the default branch.」
    'on the default branch.': '時會自動執行首次掃描。',
    'Protection rules': '保護規則',
    Any: '任何',
    On: '開啟',
    Off: '關閉',
    // 代码扫描警示严重性层级
    Warnings: '警告',
    Notes: '附註',
    // 「Block commits that contain」+ 链接「supported secrets」
    'Block commits that contain': '阻擋提交中出現',
    'notification settings': '通知設定',
    'Search for people or teams': '搜尋人員或團隊',

    // 推送保护的可绕过执行者（推送保护、规则集共用的绕过列表组件；译法同 org-settings/security.ts；原文无逗号，译文不加）
    'Push Protection will run and the selected actor(s) will be prompted to bypass': '推送保護會執行並向選取的執行者顯示繞過提示',
    'Push Protection will not run and no bypass prompt will be shown': '推送保護不會執行也不會顯示繞過提示',
    'No actors have been selected': '尚未選取執行者',
    'At least one actor is required.': '至少需要一個執行者。',
    'Bypass actors are managed by policy or security configuration': '可繞過的執行者由政策或安全性設定管理',
    'Bypass actors are managed by policy/security configuration.': '可繞過的執行者由政策/安全性設定管理。',
    'Search for bypass actors': '搜尋可繞過的執行者',
    'Adjust your search term to find other bypass actors': '調整搜尋字詞以尋找其他可繞過的執行者',
    'Actor is already added': '此執行者已加入',
    'Failed to fetch suggestions': '無法擷取建議',
    'Failed to update bypass actor.': '無法更新可繞過的執行者。',
    'Choose which roles and teams can bypass this ruleset': '選擇可以繞過此規則集的角色和團隊',

    // Dependabot 规则页（与组织设置共用；New rule、/ New rule、Rules 由 branches.ts、nav.ts 收录）
    ...DEPENDABOT_RULES_SCOPED,
    // 「Dismiss alerts」的期限选项（组织设置由 moderation.ts 收录，不放进共用常量）
    Indefinitely: '無限期'
  },
  regexp: [
    // 代码扫描：上次扫描 / 下次扫描时间
    [new RegExp(`^Last scan (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次掃描於', translateTime(time))],
    [new RegExp(`^Next scan (${TIME_SOURCE})$`), (_, time: string) => joinCjk('下次掃描於', translateTime(time))],
    // CodeQL 默认设置：语言选择（选中列表项作「選取」）
    [/^(\d+) of (\d+) languages? selected$/, '已選取 $2 種語言中的 $1 種'],
    // 推送保护绕过列表标题：「3 actors」「1 actor」（同 org-settings/security.ts；量词作「個」）
    [/^(\d+) actors?$/, '$1 個執行者'],
    // 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（与组织设置共用）
    BYPASS_ACTOR_ACTIONS_RULE,
    // Dependabot 规则（与组织设置共用）；「Managed by <组织>」由 rulesets.ts 收录
    ...DEPENDABOT_RULES_REGEXP
  ]
} satisfies PageDictionary
