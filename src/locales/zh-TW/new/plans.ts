import type { PageDictionary } from '../../../core/types'

/**
 * 新建组织：选择计划页的「比較功能」表（/organizations/plan、/account/organizations/new；/pricing 同一张表）。
 * 计划卡片见 new.ts。表格与 /account/upgrade 的比较表相同：分组名与长说明由 settings-account 的 static
 * 提供（全站同一译法），Features on、Switch plans 等由 common 翻译，此处不重复收录；
 * 其余词条（短功能名、单元格）放 scoped，只在 new 生效。
 * 产品名、方案名译成中文（用户决定，2026-10-27）：表中单独出现的 GitHub Actions / Codespaces / Packages、
 * GitHub Secret Protection / Code Security、Copilot Autofix、Enterprise Cloud / Server / Managed Users、GitHub Connect
 * 在此收录；窄屏计划选择的小写 free / team / enterprise（CSS 首字母大写）同样译「X 版」。
 * 自造品牌词 CodeQL、技术缩写 LDAP 保留原文；价格后的货币代码 USD 按用户要求译作美元。
 */
export default {
  scoped: {
    // 页头与比较表框架
    'Choose a plan': '選擇方案',
    'Compare features': '比較功能',
    'How to get started': '如何開始',
    'Join for free': '免費加入',
    'Start Enterprise trial': '開始試用企業版',
    'per month forever': '每月 永久',
    'Contact our sales team': '聯絡我們的銷售團隊',
    'to learn more.': '以瞭解詳情。',
    // 窄屏计划选择：Features on <span>team</span>（common 的 inline 规则把计划名移到句首）
    free: '免費版',
    team: '團隊版',
    enterprise: '企業版',

    // 单元格
    Available: '可用',
    Unlimited: '無限制',
    'Usage-based': '依用量計費',
    // 价格后的币种：$<span>4</span> <span>USD</span>
    USD: '美元',
    'Ability to increase spend limit': '可提高支出上限',
    // Enterprise Cloud、Enterprise Server 由 common/pages.ts 的全局词条翻译

    // 分组（Code Security、Secret Protection 由 common 翻译；带 GitHub 前缀的全称见下方行名）
    Collaboration: '協作',

    // 代码管理
    'Public repositories': '公開儲存庫',
    'Private repositories': '私人儲存庫',

    // 代码工作流
    'GitHub Actions': 'GitHub 動作',
    'GitHub Codespaces': 'GitHub 程式碼空間',
    'GitHub Packages': 'GitHub 套件',
    'GitHub sandbox (public preview)': 'GitHub 沙箱（公開預覽）',
    'Run agent-generated code safely in isolated, stateful cloud environments with snapshot and resume.':
      '在隔離且具狀態的雲端環境中安全執行代理產生的程式碼，並支援快照和繼續執行。',
    'Code reviews': '程式碼審查',
    'Multiple pull request assignees': '拉取請求的多位負責人',
    'Repository insights': '儲存庫洞察',
    // Scheduled reminders 由 org-settings 收录
    'Automatic code review assignment': '自動指派程式碼審查',

    // 协作
    'Collaborators for public repositories': '公開儲存庫的協作者',
    'Collaborators for private repositories': '私人儲存庫的協作者',
    // Issues、Projects 等行名由 common 翻译
    Milestones: '里程碑',
    'Organization and team management': '組織和團隊管理',
    'Pages and wikis': '頁面和 Wiki',
    'Multiple issue assignees': '議題的多位負責人',

    // 机密保护（provider 译「提供者」；Provider patterns 由 repo-settings 的 static 译作「提供者模式」，此处不重复）
    'GitHub Secret Protection': 'GitHub 機密保護',
    'Push protection': '推送保護',
    'Prevent secret exposures by proactively blocking secrets before they reach your code.': '在機密進入程式碼前主動攔截，防止機密外洩。',
    'Secret scanning': '機密掃描',
    'Detect and manage exposed secrets across git history, pull requests, issues, and wikis.':
      '在 Git 歷史記錄、拉取請求、議題和 Wiki 中偵測並管理外洩的機密。',
    'GitHub collaborates with AWS, Azure, and Google Cloud to detect secrets with high accuracy. This minimizes false positives, letting you focus on what matters.':
      'GitHub 與 AWS、Azure 和 Google Cloud 合作，以高準確度偵測機密。這能盡量減少誤報，讓你專注於重要的事。',
    'Provider notification': '提供者通知',
    'Providers get real-time alerts when their tokens appear in public code, enabling them to notify, quarantine, or revoke secrets.':
      '提供者的權杖出現在公開程式碼中時，提供者會即時收到警示，以便通知、隔離或撤銷機密。',
    'Validity checks': '有效性檢查',
    'Prioritize active secrets with validity checks for provider patterns.': '透過提供者模式的有效性檢查，優先處理仍有效的機密。',
    'AI detection for alerts': '警示 AI 偵測',
    'Use AI to detect unstructured secrets, like passwords, in existing code.': '使用 AI 偵測現有程式碼中的非結構化機密（例如密碼）。',
    'AI detection for push protection': '推送保護 AI 偵測',
    'Use AI to detect unstructured secrets, like passwords, and block pushes that contain them.':
      '使用 AI 偵測非結構化機密（例如密碼），並阻擋包含這些機密的推送。',
    'Detect tokens from unknown providers, including HTTP authentication headers, connection strings, and private keys.':
      '偵測來自未知提供者的權杖，包括 HTTP 身分驗證標頭、連接字串和私密金鑰。',
    'Create your own patterns and find organization-specific secrets.': '建立你自己的模式，找出組織特有的機密。',
    'Push protection bypass controls': '推送保護繞過控制',
    'Manage who can bypass push protection and when.': '管理誰可以在何時繞過推送保護。',
    'Insights in security overview': '安全性總覽中的洞察',
    'Understand how risk is distributed across your organization with security metrics and insight dashboards.':
      '透過安全性指標和洞察儀表板，瞭解風險在組織中的分布情形。',
    'Scan history API': '掃描歷史記錄 API',
    'Review how and when GitHub scans your repositories for secrets.': '查看 GitHub 掃描儲存庫機密的方式和時間。',

    // 代码安全
    'GitHub Code Security': 'GitHub 程式碼安全性',
    'Copilot Autofix': 'Copilot 自動修正',
    'Powered by GitHub Copilot, generate automatic fixes for 90% of alert types in JavaScript, Typescript, Java, and Python.':
      '由 GitHub Copilot 驅動，為 JavaScript、TypeScript、Java 和 Python 中 90% 的警示類型自動產生修正。',
    'Third party extensibility for code scanning alerts': '程式碼掃描警示的第三方擴充性',
    'Centralize your findings across all your scanning tools via SARIF upload to GitHub.':
      '將 SARIF 上傳到 GitHub，集中管理所有掃描工具的發現項目。',
    'Contextual vulnerability intelligence and advice': '結合上下文的漏洞情報和建議',
    'Quickly remediate with context provided by Copilot Autofix.': '利用 Copilot 自動修正提供的上下文快速修復。',
    'Uncover vulnerabilities in your code with our industry-leading semantic code analysis.':
      '運用業界領先的語意程式碼分析，找出程式碼中的漏洞。',
    'Security campaigns': '安全性活動',
    'Reduce security debt and burn down your security backlog with security campaigns.':
      '透過安全性活動減少安全性債務，逐步消化安全性待辦事項。',
    'Get a clear view of your project’s dependencies with a summary of manifest, lock files, and submitted dependencies via the API.':
      '透過資訊清單、鎖定檔和經由 API 提交的相依項目摘要，清楚掌握專案的相依項目。',
    "Get a clear view of your project's dependencies with a summary of manifest, lock files, and submitted dependencies via the API.":
      '透過資訊清單、鎖定檔和經由 API 提交的相依項目摘要，清楚掌握專案的相依項目。',
    'Dependency review action': '相依性審查動作',
    'Catch insecure dependencies before adding them and get insights on licenses, dependents, and age.':
      '在加入不安全的相依項目前加以攔截，並掌握授權條款、被相依項目和存在時間等資訊。',
    'Dependabot custom auto-triage rules': 'Dependabot 自訂自動分類規則',
    'Define alert-centric policies to control how Dependabot handles alerts and pull requests.':
      '定義以警示為中心的政策，控制 Dependabot 處理警示和拉取請求的方式。',
    'Dependabot security updates with grouped updates': '支援分組更新的 Dependabot 安全性更新',
    'Automated pull requests that batch dependency updates for known vulnerabilities.': '自動建立拉取請求，批次更新有已知漏洞的相依項目。',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Automated pull requests that keep your dependencies up to date.': '自動建立拉取請求，讓相依項目保持最新。',
    'Get a clear view of risk distribution with security metrics and dashboards.': '透過安全性指標和儀表板，清楚掌握風險分布。',

    // 平台安全与合规
    SBOMs: 'SBOM',
    'Artifact attestations': '成品證明',
    'GitHub Security Advisories': 'GitHub 安全性公告',
    'Role-based access control': '角色型存取控制',
    'Required 2FA': '強制使用 2FA',
    'Audit log API': '稽核記錄 API',
    'Keep copies of audit log data to ensure secure IP and maintain compliance for your organization.':
      '保留稽核記錄資料副本，以保護智慧財產並維持組織合規。',
    'SAML single sign-on (SSO)': 'SAML 單一登入 (SSO)',
    'Access GitHub Enterprise Server using your existing accounts and centrally manage repository access.':
      '使用現有帳號存取 GitHub 企業伺服器，並集中管理儲存庫存取權。',
    'IP allow list': 'IP 允許清單',
    'Limit access to known allowed IP addresses.': '僅允許已知的 IP 位址存取。',

    // 市场与集成
    'GitHub Apps': 'GitHub 應用程式',
    'Status checks': '狀態檢查',
    'Pre-receive hooks': '預先接收鉤子',
    'Create requirements for automatically accepting or rejecting a push based on the contents of the push.':
      '根據推送內容設定自動接受或拒絕推送的條件。',

    // 支持与部署
    'Community Support': '社群支援',
    'Standard Support': '標準支援',
    // Premium Plus → 進階增強（与 common 的 /premium-support 页一致）
    'Premium and Premium Plus Support': '進階支援和進階增強支援',
    'Invoice billing': '發票付款',
    'Pay bills via invoice, rather than using your credit card.': '以發票支付帳單，而不使用信用卡。',
    'Self-hosted deployment': '自架部署',
    'Self-hosted GitHub for on-prem appliances or self-managed cloud tenants.': '在內部部署設備或自行管理的雲端租戶上自架 GitHub。',
    'Enterprise Managed Users': '企業受控使用者',
    'GitHub Connect': 'GitHub 連接',
    'Multi-tenant enterprise SaaS solution on Microsoft Azure, allowing you to choose a regional cloud deployment for data residency, so your in-scope data is stored at rest in a designated location. This is available in the EU and Australia with additional regions coming soon.':
      'Microsoft Azure 上的多租戶企業 SaaS 解決方案，可讓你選擇區域雲端部署以實現資料落地，使範圍內的待用資料儲存在指定位置。目前已在歐盟和澳洲提供，更多區域即將推出。'
  },
  regexp: [
    // 使用量与支出上限
    [/^([\d,]+) minutes\/month$/, '每月 $1 分鐘'],
    [/^(\$[\d,]+(?:\.\d+)?) spend limit$/, '$1 支出上限']
  ]
} satisfies PageDictionary
