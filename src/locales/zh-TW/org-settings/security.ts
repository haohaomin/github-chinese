import type { PageDictionary, RegExpRule } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * Dependabot 规则页（规则列表、新建 / 编辑表单、删除确认）的 scoped 词条。
 * 存储库设置的 Dependabot 规则页是同一组件，由 repo-settings/security.ts 取用；
 * New rule、/ New rule、Rules 在存储库设置由 branches.ts、nav.ts 收录，不放这里
 */
export const DEPENDABOT_RULES_SCOPED: Readonly<Record<string, string>> = {
  'Rule created.': '已建立規則。',
  'Rule saved. It may take a moment for this rule to be applied to matching alerts':
    '已儲存規則。此規則可能需要一些時間才會套用到相符的警示',
  'Rule saved.': '已儲存規則。',
  'Rule was successfully deleted.': '已刪除規則。',
  '/ Dependabot rules': '/ Dependabot 規則',
  // preset 取「預設集」，与 default（預設）区分
  'GitHub presets': 'GitHub 預設集',
  'Managed by GitHub': '由 GitHub 管理',
  'Edit curated rule': '編輯精選規則',
  'Edit rule': '編輯規則',
  // GitHub 预设规则：恶意软件警报
  'Dismiss package malware alerts': '解除套件惡意軟體警示',
  'Matches malware:package': '符合 malware:package',
  'This rule auto-dismisses alerts for false positives from private packages as well as public packages where all versions are flagged as malicious.':
    '此規則會自動解除私人套件誤判的警示，以及所有版本都被標示為惡意的公開套件的警示。',
  'Dismiss low-impact alerts for development-scoped dependencies': '解除開發範圍相依項目的低影響警示',
  'In a developer (non-production or runtime) environment, these alerts are unlikely to be exploitable or have limited effect like slow builds or long-running tests.':
    '在開發環境（非正式環境、非執行階段）中，這些警示不太可能被利用，或影響有限，例如建置變慢或測試執行時間較長。',
  'Learn more about this methodology.': '瞭解此方法。',
  'Repository rules': '儲存庫規則',
  'Organization rules': '組織規則',
  'Edit custom rule': '編輯自訂規則',
  'The following inputs have errors:': '下列輸入有錯誤：',
  'Rule name': '規則名稱',
  // 表单校验提示：add 指填写名称，作「輸入」
  'Add a rule name': '輸入規則名稱',
  State: '狀態',
  Enforced: '已強制執行',
  // 「目標警示」自动补全只译分组标题，筛选取值（critical、runtime 等）要原样输入查询，照原文
  'Target alerts': '目標警示',
  'Add rule metadata': '新增規則中繼資料',
  Severities: '嚴重性',
  Scopes: '範圍',
  'Rules will be applied for alerts matching all included metadata.': '規則會套用到與所有包含的中繼資料相符的警示。',
  'Select one or more rules to apply to matching alerts.': '選取一或多個要套用到相符警示的規則。',
  'Dependabot will automatically close or reopen alerts based on selected criteria.': 'Dependabot 會根據選取的條件自動關閉或重新開啟警示。',
  'Until patch is available': '直到有可用的修補程式',
  // 拉取请求语境的动词 open → 建立（安全更新即 Dependabot 创建的拉取请求）
  'Open a pull request to resolve alerts': '建立拉取請求以解決警示',
  'Dependabot will attempt to open security updates based on selected criteria.': 'Dependabot 會根據選取的條件嘗試建立安全性更新。',
  'Create rule': '建立規則',
  '/ Edit rule': '/ 編輯規則',
  'Save rule': '儲存規則',
  'Delete this rule': '刪除此規則',
  'Deleting this rule can potentially reopen associated alerts.': '刪除此規則可能會重新開啟關聯的警示。',
  'Are you sure you want to delete this rule?': '確定要刪除此規則嗎？',
  '/ GitHub Preset rule': '/ GitHub 預設集規則'
}

/** Dependabot 规则的正则：安全设置页的已启用条数、删除确认（repo-settings/security.ts 同样取用） */
export const DEPENDABOT_RULES_REGEXP: readonly RegExpRule[] = [
  [/^(\d+) rules? enabled$/, '已啟用 $1 個規則'],
  // 规则名两侧的引号随原文（作「」），原文无逗号，译文不加
  [
    /^This will permanently delete the rule "([^"]{1,200})" and potentially reopen associated alerts\.$/,
    '這會永久刪除規則「$1」並可能重新開啟關聯的警示。'
  ]
]

/**
 * 绕过列表内置参与者的名称（actor.name 原值）：存储库角色 admin、maintain、write，组织管理员角色 Organization admin
 * （新版组件里也可能是 admin，故 admin 只作「管理員」），无名称时的兜底词 Unknown。用 Map 查找，constructor 等原型链键不会命中
 */
const BYPASS_ACTOR_NAMES: ReadonlyMap<string, string> = new Map([
  ['admin', '管理員'],
  ['maintain', '維護'],
  ['write', '寫入'],
  ['Organization admin', '組織管理員'],
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
    return builtin === undefined ? `可繞過的執行者 ${name} 的動作` : `可繞過的執行者${builtin}的動作`
  }
]

/**
 * 安全：身份验证安全（双因素身份验证、SAML 单一登录、SSH 证书颁发机构、IP 允许列表）、Advanced Security（配置、全局设置）、
 * Dependabot 规则、已验证和批准的域、合规。
 * 个人和存储库的「程式碼安全性」设置页有大量同名文字，这部分放 scoped。
 * 术语：security（功能）→ 安全性，configuration → 設定，enforce → 強制執行，actor → 執行者，bypass → 繞過，
 * eligible → 符合資格，default setup → 預設設定，extended → 擴充，certificate authority → 憑證授權單位。
 */
export default {
  static: {
    // 双因素身份验证、部署密钥策略的保存提示
    'Disabled two-factor authentication requirement policy.': '已停用雙重驗證要求政策。',
    'Deploy key policy enabled.': '已啟用部署金鑰政策。',
    'Deploy key policy disabled.': '已停用部署金鑰政策。',
    // 代码质量（组织）：启用范围选项说明、强制访问、启用确认对话框、保存提示
    'Code Quality will be disabled on all current and future repositories.': '所有目前和未來的儲存庫都將停用程式碼品質。',
    'Code Quality will be disabled on all current and futurerepositories.': '所有目前和未來的儲存庫都將停用程式碼品質。',
    'Maintains access for currently enabled repositories and allows future changes.': '保留目前已啟用儲存庫的存取權，並允許日後變更。',
    'Maintains access for currently enabled repositoriesand allows future changes.': '保留目前已啟用儲存庫的存取權，並允許日後變更。',
    'Choose which repositories Code Quality should be enabled and disabled in.': '選擇要在哪些儲存庫中啟用和停用程式碼品質。',
    'Enforce access': '強制執行存取設定',
    'Prevent repository admins from overriding access settings to Code Quality.': '禁止儲存庫管理員覆寫程式碼品質的存取設定。',
    'Review enablement and billing changes': '檢閱啟用和計費變更',
    'Licenses and usage': '授權和使用情況',
    'AI credits usage': 'AI 點數使用情況',
    'Action minutes consumed': '消耗的動作分鐘數',
    'Based on usage': '依使用量計費',
    'Code Quality scans your pull requests and default branch, using a mix of deterministic and AI scans.':
      '程式碼品質結合確定性掃描和 AI 掃描，檢查你的拉取請求和預設分支。',
    'Code Quality scans your pull requests and default branch, using a mix of deterministic and AI scans. Learn more about our billing model':
      '程式碼品質結合確定性掃描和 AI 掃描，檢查你的拉取請求和預設分支。瞭解計費模式',
    'Learn more about our billing model': '瞭解計費模式',
    'Settings saved.': '設定已儲存。',
    'Changes are being applied in the background and may take some time to take effect.': '變更正在背景套用，可能需要一段時間才會生效。',
    // 合规：SOC、ISO、CSA 报告说明
    'Our SOC 2 reports assume the use of certain security features only available to Enterprise customers, such as SAML SSO. As a non-Enterprise customer, your account cannot make use of these security features and the SOC 2 report does not apply; as such, we cannot share this report where it is not applicable.':
      '我們的 SOC 2 報告以使用某些僅提供給企業版客戶的安全性功能（如 SAML SSO）為前提。身為非企業版客戶，你的帳號無法使用這些安全性功能，SOC 2 報告並不適用；因此，在不適用的情況下我們無法分享此報告。',
    'We provide a SOC 3 report to non-Enterprise customers in order to confirm:': '我們向非企業版客戶提供 SOC 3 報告，用於確認：',
    'that controls have been operating throughout the period (as in our SOC 1 and 2 reports, the Auditor’s opinion is included in our SOC 3 report);':
      '控制措施在整個期間內持續運作（與 SOC 1 和 SOC 2 報告一樣，SOC 3 報告也包含稽核員意見）；',
    "that controls have been operating throughout the period (as in our SOC 1 and 2 reports, the Auditor's opinion is included in our SOC 3 report);":
      '控制措施在整個期間內持續運作（與 SOC 1 和 SOC 2 報告一樣，SOC 3 報告也包含稽核員意見）；',
    'the scope of GitHub’s services;': 'GitHub 服務的範圍；',
    "the scope of GitHub's services;": 'GitHub 服務的範圍；',
    'our CUECs (Complementary User Entity Controls), which prospective customers want to see so they know what controls they need to have/implement on their side in order to rely on GitHub’s SOC reports.':
      '我們的 CUEC（補充使用者實體控制），潛在客戶可據此了解自己需要具備或實施哪些控制措施，才能依賴 GitHub 的 SOC 報告。',
    "our CUECs (Complementary User Entity Controls), which prospective customers want to see so they know what controls they need to have/implement on their side in order to rely on GitHub's SOC reports.":
      '我們的 CUEC（補充使用者實體控制），潛在客戶可據此了解自己需要具備或實施哪些控制措施，才能依賴 GitHub 的 SOC 報告。',
    'ISO, the International Organization for Standardization, brings global experts together to agree on the best way of doing things.':
      'ISO（國際標準化組織）匯集全球專家，就做事的最佳方式達成共識。',
    "The Cloud Security Alliance Consensus Assessment Initiative Questionnaire (CSA-CAIQ or CAIQ) is a self-assessment that evaluates a cloud provider against CSA's Cloud Control Matrix.":
      '雲端安全聯盟共識評估倡議問卷（CSA-CAIQ 或 CAIQ）是一項自我評估，依據 CSA 的雲端控制矩陣評估雲端供應商。',
    'The Cloud Security Alliance Consensus Assessment Initiative Questionnaire (CSA-CAIQ or CAIQ) is a self-assessment that evaluates a cloud provider against CSA’s Cloud Control Matrix.':
      '雲端安全聯盟共識評估倡議問卷（CSA-CAIQ 或 CAIQ）是一項自我評估，依據 CSA 的雲端控制矩陣評估雲端供應商。',
    // 已验证和批准的域：验证说明、菜单、确认对话框
    'Wait until your DNS configuration changes. This could take up to 72 hours to propagate.':
      '等待 DNS 設定生效。傳播最多可能需要 72 小時。',
    'An error occurred while verifying this DNS record.': '驗證此 DNS 記錄時發生錯誤。',
    'Pending verification': '待驗證',
    'Domain menu': '網域選單',
    'Delete this domain': '刪除此網域',
    'The domain was deleted.': '網域已刪除。',
    'Are you sure you want to approve this domain? This will allow notifications from GitHub to be sent to users with an email address ending in':
      '確定要核准此網域嗎？這將允許 GitHub 向以下結尾的電子郵件地址傳送通知',
    // 身份验证安全：双因素身份验证要求（「… owned by the <strong>组织</strong> organization, …」见 inline）
    'Two-factor authentication adds another level of security for your organization.': '雙重驗證可為組織增加一層安全保護。',
    'Learn more about requiring two-factor authentication in your organization.': '瞭解如何在組織中要求雙重驗證。',
    'View organization membership': '檢視組織成員資格',
    'Users can only use secure two-factor methods: authenticator apps, passkeys, security keys, and the GitHub mobile app.':
      '使用者只能使用安全的雙重驗證方式：驗證器應用程式、通行金鑰、安全性金鑰和 GitHub 行動版應用程式。',
    'Existing members will lose access to organization resources if they disable two-factor authentication. Outside collaborators will be removed from the organization if they disable two-factor authentication.':
      '現有成員若停用雙重驗證，將無法存取組織資源。外部協作者若停用雙重驗證，將從組織中移除。',
    "Users' two-factor authentication methods will not be affected.": '使用者的雙重驗證方式不受影響。',
    // 企业版推广
    'Secure your data and people with GitHub Enterprise': '使用 GitHub 企業版保護你的資料和人員',
    'SAML single sign-on (SSO) gives GitHub Enterprise accounts a way to control and secure access to organization resources like repositories, issues, and pull requests.':
      'SAML 單一登入 (SSO) 讓 GitHub 企業版帳號能夠控制和保護對儲存庫、議題、拉取請求等組織資源的存取。',
    'With an SSH certificate authority, enterprise accounts can provide SSH certificates that members can use to access your resources with Git.':
      '透過 SSH 憑證授權單位，企業帳號可以提供 SSH 憑證，供成員透過 Git 存取你的資源。',
    'Certified for compliance': '合規認證',
    'GitHub Enterprise Cloud is certified for SOC 1 Type 2, SOC 2 Type 2, FedRAMP LiSaaS. Enterprise customers can download these reports, and more, at any time.':
      'GitHub 企業雲端已通過 SOC 1 Type 2、SOC 2 Type 2、FedRAMP LiSaaS 認證。企業客戶可以隨時下載這些報告及更多內容。',
    'Team Synchronization': '團隊同步',
    'Enable and disable team synchronization between your identity provider (IdP) and your organizations on GitHub Enterprise accounts.':
      '在 GitHub 企業版帳號中啟用和停用身分識別提供者 (IdP) 與組織之間的團隊同步。',
    'GitHub Enterprise accounts can restrict access to private organization assets by configuring an allow list for specific IP addresses.':
      'GitHub 企業版帳號可以為特定 IP 位址設定允許清單，以限制對組織私人資產的存取。',
    // 高级安全全局设置：Dependabot 运行器、CodeQL、AI 扫描（「The <code>dependabot</code> label …」见 inline）
    'Global Advanced Security settings': '全域進階安全性設定',
    "Global Advanced Security settings are enabled for all repositories in this organization where the parent feature is enabled. By enabling these features, you're granting us permission to perform read-only analysis on your organization's repositories.":
      '全域進階安全性設定會套用至此組織中已啟用上層功能的所有儲存庫。啟用這些功能即表示你授權我們對組織的儲存庫執行唯讀分析。',
    'Configure dependabot rules': '設定 Dependabot 規則',
    'Select the runner type used by Dependabot for scans and version and security updates.':
      '選擇 Dependabot 用於掃描及版本和安全性更新的執行器類型。',
    'Learn about GitHub Actions runners.': '瞭解 GitHub 動作執行器。',
    'Dependabot will use standard GitHub runners to run scans': 'Dependabot 將使用標準 GitHub 執行器執行掃描',
    'Dependabot will use labeled GitHub or self-hosted runners that you may define.':
      'Dependabot 將使用你定義的帶有標籤的 GitHub 執行器或自架執行器。',
    'Optional runner information': '選用的執行器資訊',
    'Provide any existing runner information you would like to use for Dependabot.': '提供要用於 Dependabot 的現有執行器資訊。',
    'Existing name': '現有名稱',
    'Verify spelling matches an existing runner group to ensure proper setup.': '請確認拼字與現有執行器群組一致，以確保設定正確。',
    'use or create custom labels': '使用或建立自訂標籤',
    'Existing label': '現有標籤',
    'Verify spelling matches an existing label to ensure proper setup.': '請確認拼字與現有標籤一致，以確保設定正確。',
    'Inactive repositories are repositories with no pushes or pull requests in the last 6 months. Applies only to repositories using code scanning default setup.':
      '不活躍的儲存庫是指過去 6 個月內沒有推送或拉取請求的儲存庫。僅適用於使用程式碼掃描預設設定的儲存庫。',
    'Expand CodeQL analysis': '擴充 CodeQL 分析',
    'Expand CodeQL to recognize more libraries and frameworks in repositories using CodeQL default setup.':
      '擴充 CodeQL，以在使用 CodeQL 預設設定的儲存庫中辨識更多程式庫和架構。',
    'Configure CodeQL model packs': '設定 CodeQL 模型套件',
    'consume AI credits': '消耗 AI 點數',
    'Scan repository default branches with AI for additional security findings.': '使用 AI 掃描儲存庫預設分支，以取得更多安全性發現。',
    'Run AI code scan on pull requests. Only applies for non-CodeQL languages.':
      '對拉取請求執行 AI 程式碼掃描。僅適用於 CodeQL 不支援的語言。',
    'A valid payment method is required to use AI Scan.': '使用 AI 掃描需要有效的付款方式。',
    'A valid payment method is required to use Scan for AI applications.': '使用「掃描 AI 應用程式」需要有效的付款方式。',
    'Add a payment method': '新增付款方式',
    // 安全配置页：未购买高级安全（「…, <a>upgrade to GitHub Advanced Security.</a>」见 inline）
    'upgrade to GitHub Advanced Security.': '升級到 GitHub 進階安全性。',
    'Set up Advanced Security': '設定進階安全性',
    'Manage Secret scanning, Code scanning and Dependabot.': '管理機密掃描、程式碼掃描和 Dependabot。',
    // 代码质量（「… will incur charges in <a>action minutes.</a>」「… found in this <a>open source repository</a>. …」见 inline）
    'Find and fix code quality issues like code coverage, maintainability risks, reliability problems, and more. Get quality insights directly in your development workflow with Copilot-powered autofix.':
      '尋找並修正程式碼涵蓋範圍、可維護性風險、可靠性問題等程式碼品質問題。透過 Copilot 驅動的自動修正，直接在開發工作流程中取得品質洞察。',
    'Build resilient code, at scale': '大規模建置穩健的程式碼',
    'action minutes.': '動作分鐘數費用。',
    'Enable Code Quality': '啟用程式碼品質',
    'What happens once I turn on code quality scanning?': '啟用程式碼品質掃描後會發生什麼事？',
    'GitHub will perform a point-in-time scan of the default branch of the repository, reporting back code quality findings and suggestions to developers. It will also proactively start scanning pull requests for code quality issues.':
      'GitHub 將對儲存庫的預設分支執行一次即時掃描，並向開發人員回報程式碼品質發現和建議。它還會主動開始掃描拉取請求中的程式碼品質問題。',
    'To enable code coverage reports, you will need to manually commit a workflow file, once code quality is enabled.':
      '若要啟用程式碼涵蓋範圍報告，需要在啟用程式碼品質後手動提交工作流程檔案。',
    'Learn how to configure code coverage': '瞭解如何設定程式碼涵蓋範圍',
    'Does Code Quality use AI?': '程式碼品質是否使用 AI？',
    'Along with standard findings that are detected using the default CodeQL query suite, Code Quality also uses AI to detect additional findings, labeled as AI findings.':
      '除了使用預設 CodeQL 查詢套件偵測到的標準發現外，程式碼品質還會使用 AI 偵測其他發現，並標記為 AI 發現。',
    'What quality rules and languages are supported?': '支援哪些品質規則和語言？',
    'open source repository': '開放原始碼儲存庫',
    // 合规报告与认证
    'Coverage period': '涵蓋期間',
    'SOC 3 Report': 'SOC 3 報告',
    'GitHub ISO certifications': 'GitHub ISO 認證',
    'View CSA CAIQ': '檢視 CSA CAIQ',
    // 身份验证安全：双因素身份验证
    'Requiring an additional authentication method adds another level of security for your organization.':
      '要求額外的身分驗證方式可為組織多加一層安全防護。',
    'Require two-factor authentication for everyone in your organization': '要求組織中的所有人啟用雙重驗證',
    // 确认对话框：「… owned by the <strong>组织</strong> organization, but will remain a member of <strong>组织</strong> until … <a>…</a> to see …」按文本节点分段
    'Organization members who do not have two-factor authentication enabled will be unable to access resources owned by the':
      '未啟用雙重驗證的組織成員將無法存取',
    'organization, but will remain a member of': '組織擁有的資源，但在更新設定之前仍是',
    'until they update their settings. Outside collaborators who do not have two-factor authentication enabled will be removed from the organization and notified.':
      '的成員。未啟用雙重驗證的外部協作者將從組織中移除並收到通知。',
    'to see which users will be impacted.': '以查看哪些使用者會受影響。',
    'Only allow secure two-factor methods': '僅允許安全的雙重驗證方式',
    'Members, billing managers, and outside collaborators who do not have two-factor authentication enabled for their personal account will be removed from the organization and will receive an email notifying them about the change.':
      '個人帳號未啟用雙重驗證的成員、帳務管理員和外部協作者將從組織中移除，並會收到通知此變更的電子郵件。',
    'Enabling two-factor authentication requirement.': '正在啟用雙重驗證要求。',
    'Disabled two-factor authentication requirement.': '已停用雙重驗證要求。',

    // 身份验证安全：SSH 证书颁发机构
    'SSH Certificate Authorities': 'SSH 憑證授權單位',
    'SSH certificate authorities': 'SSH 憑證授權單位',
    'Provide SSH certificates that members can use to access your resources with Git': '提供 SSH 憑證供成員透過 Git 存取你的資源',
    'New CA': '新增 CA',
    'Add CA': '新增 CA',
    'Require SSH Certificates': '要求使用 SSH 憑證',
    'I understand, please delete this CA': '我瞭解，刪除此 CA',

    // 身份验证安全：IP 允许列表
    'An IP allow list lets your organization limit access based on the IP address a person is accessing from.':
      'IP 允許清單可讓組織根據存取來源的 IP 位址限制存取。',
    // 原文无标点，译文不加
    "Restrict access to your organization's assets by configuring a list of IP addresses that are allowed to connect":
      '設定允許連線的 IP 位址清單以限制對組織資產的存取',
    'Restrict access to your organization’s assets by configuring a list of IP addresses that are allowed to connect':
      '設定允許連線的 IP 位址清單以限制對組織資產的存取',
    'Enable IP allow list': '啟用 IP 允許清單',
    'Enable IP allow list configuration for installed GitHub Apps': '為已安裝的 GitHub 應用程式啟用 IP 允許清單設定',

    // 身份验证安全：SAML 单一登录（GitHub Enterprise Cloud 组织）
    'Enable SAML authentication': '啟用 SAML 身分驗證',
    'Sign on URL': '登入 URL',
    'Public certificate': '公開憑證',
    'Test SAML configuration': '測試 SAML 設定',

    // Advanced Security：配置
    'Code security configurations': '程式碼安全性設定',
    'New configuration': '新增設定',
    'Apply to': '套用到',
    'Apply configuration': '套用設定',
    'All repositories without configurations': '所有未套用設定的儲存庫',
    // detach 与 repo-settings/danger-zone.ts 一致作「分離」
    'Detach configuration': '分離設定',
    'Use as default for newly created repositories': '設為新建立儲存庫的預設',
    'Enforce configuration': '強制執行設定',
    'Custom configuration': '自訂設定',
    'Update configuration': '更新設定',
    'Dependency scanning': '相依性掃描',
    'Malware alerts': '惡意軟體警示',
    'Scan for AI-detected secrets': '掃描 AI 偵測到的機密',
    'Generic patterns': '通用模式',
    'Extended metadata': '擴充中繼資料',
    'Specific actors': '特定執行者',
    'Select actors': '選取執行者',
    'Specific roles or teams': '特定角色或團隊',
    'Add role or team': '新增角色或團隊',

    // 机密风险评估、绕过请求、自定义模式
    Assessments: '評估',
    'Scan your organization': '掃描你的組織',
    'Rerun scan': '重新執行掃描',
    'Preview cost and enable Secret Protection': '預覽費用並啟用機密保護',
    'Review and enable': '查看並啟用',
    'For all repositories': '適用於所有儲存庫',
    'For public repositories for free': '免費用於公開儲存庫',
    'Configure in settings': '在設定頁面中設定',
    'Approve bypass request': '核准繞過請求',
    'Deny bypass request': '拒絕繞過請求',
    'Push protection bypass': '推送保護繞過',
    'All statuses': '所有狀態',
    'Publish pattern': '發布模式',
    'All repositories in the organization': '組織中的所有儲存庫',

    // Advanced Security：全局设置（组织专用）
    "Security and analysis features help keep your repositories secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your organization's repositories.":
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對組織的儲存庫執行唯讀分析。',
    'Security and analysis features help keep your repositories secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your organization’s repositories.':
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對組織的儲存庫執行唯讀分析。',
    'Grant Dependabot access to private repositories': '授予 Dependabot 私人儲存庫的存取權',
    'In order to update dependencies in your organization, Dependabot accesses dependencies in all public repositories and the selected private repositories. The contents of these repositories will be accessible to all users in your organization through Dependabot updates. Be sure that you want to share these repositories with everyone in your organization or consider using private registries instead.':
      '為了更新組織中的相依項目，Dependabot 會存取所有公開儲存庫和選取的私人儲存庫中的相依項目。組織中的所有使用者都可以透過 Dependabot 更新存取這些儲存庫的內容。請確認你要與組織中的所有人共用這些儲存庫，或考慮改用私人登錄庫。',
    'Add private repositories': '新增私人儲存庫',
    'Add a private repository': '新增私人儲存庫',
    'Choose which repositories Dependabot can access.': '選擇 Dependabot 可以存取的儲存庫。',
    // 「Choose」+（「additional」）+「repositories Dependabot can access.」：名词放到本段末尾
    'repositories Dependabot can access.': 'Dependabot 可以存取的儲存庫。',
    'Public repositories only': '僅限公開儲存庫',
    'Public and internal repositories only': '僅限公開和內部儲存庫',
    'Grant a team permission to manage security alerts and settings across your organization. This team will also be granted read access to all repositories.':
      '授予團隊管理整個組織安全性警示和設定的權限。此團隊也會獲得所有儲存庫的讀取權限。',
    'Keep scheduled scans running every 30 days for inactive repositories': '對不活躍的儲存庫繼續每 30 天執行一次排程掃描',

    // Dependabot 规则（组织专用）
    'Rules will target all public repositories in this organization.': '規則將以此組織中的所有公開儲存庫為目標。',
    'Rule is enabled by default for all public repositories.': '此規則預設對所有公開儲存庫啟用。',
    'Rule is enabled for all public repositories and can never be disabled by individual repositories.':
      '此規則對所有公開儲存庫啟用，個別儲存庫一律無法停用。',
    'Rule can never be enabled on any repositories.': '此規則無法在任何儲存庫上啟用。',

    // 已验证和批准的域（组织资料作「組織資料」；中间的徽章元素译作「已驗證」）
    "You can verify the domains controlled by your organization to confirm your organization's identity on GitHub. A":
      '你可以驗證組織控制的網域，以在 GitHub 上確認組織的身分。如果組織資料上顯示的所有網域（例如公開電子郵件或網站 URL）都已驗證，組織資料頁面上就會加上',
    'You can verify the domains controlled by your organization to confirm your organization’s identity on GitHub. A':
      '你可以驗證組織控制的網域，以在 GitHub 上確認組織的身分。如果組織資料上顯示的所有網域（例如公開電子郵件或網站 URL）都已驗證，組織資料頁面上就會加上',
    "badge will be added to your organization's profile page if all of the domains displayed on your profile (e.g. public email or website URL) are verified. You may also approve a domain by first adding it to the list of eligible domains. Approved domains may be used for email notification routing to users with verified emails that do not belong to a domain that you can verify.":
      '徽章。你也可以先將網域加入符合資格的網域清單，再核准該網域。已核准的網域可用於向電子郵件已驗證、但不屬於你可驗證網域的使用者路由電子郵件通知。',
    'badge will be added to your organization’s profile page if all of the domains displayed on your profile (e.g. public email or website URL) are verified. You may also approve a domain by first adding it to the list of eligible domains. Approved domains may be used for email notification routing to users with verified emails that do not belong to a domain that you can verify.':
      '徽章。你也可以先將網域加入符合資格的網域清單，再核准該網域。已核准的網域可用於向電子郵件已驗證、但不屬於你可驗證網域的使用者路由電子郵件通知。',
    'Learn more about verifying or approving a domain for your enterprise.': '瞭解如何為企業驗證或核准網域。',
    'Learn more about verifying or approving a domain for your organization.': '瞭解如何為組織驗證或核准網域。',
    "Can't verify this domain?": '無法驗證此網域？',
    'Can’t verify this domain?': '無法驗證此網域？',
    'Approve it instead': '改為核准',
    'Restrict email notifications to only approved or verified domains': '僅向已核准或已驗證的網域傳送電子郵件通知',

    // 合规
    'Compliance reports': '合規性報告',
    'ISO/IEC 27001:2022 certification': 'ISO/IEC 27001:2022 認證',
    'ISO/IEC 27001:2013 certification': 'ISO/IEC 27001:2013 認證',
    'Cloud Security Alliance CAIQ self-assessment (CSA CAIQ - Level 1)': '雲端安全聯盟 CAIQ 自我評估 (CSA CAIQ - Level 1)'
  },
  scoped: {
    // 新建 / 编辑安全配置（/organizations/<组织>/settings/security_products/configurations/new）
    'Name*': '名稱*',
    'Receive alerts for detected secrets, keys, or other tokens.': '偵測到機密、金鑰或其他權杖時接收警示。',
    'Verify if a secret is valid by sending it to the relevant partner. GitHub will check detected provider.':
      '將機密傳送給相關合作夥伴以驗證其是否有效。GitHub 會檢查偵測到的提供者。',
    'When enabled, GitHub will attempt to enrich detected secrets with additional metadata from the relevant provider.':
      '啟用後，GitHub 會嘗試以相關提供者的其他中繼資料補充偵測到的機密。',
    'Scan for generic secrets using deterministic methods, including traditional pattern matching and regex detectors.':
      '使用確定性方法掃描通用機密，包括傳統模式比對和規則運算式偵測器。',
    'AI-detected secrets': 'AI 偵測到的機密',
    'Scan for generic secrets detected with AI.': '掃描 AI 偵測到的通用機密。',
    'Block AI-detected secrets': '封鎖 AI 偵測到的機密',
    'Block AI-detected secrets: Not set': '封鎖 AI 偵測到的機密：未設定',
    'Block AI-detected secrets: Enabled': '封鎖 AI 偵測到的機密：已啟用',
    'Block AI-detected secrets: Disabled': '封鎖 AI 偵測到的機密：已停用',
    'consumes AI credits': '消耗 AI 點數',
    'Your organization cannot consume AI credits.': '你的組織無法使用 AI 點數。',
    'Manage protected patterns': '管理受保護的模式',
    'View custom role assignments.': '檢視自訂角色指派。',
    'Actors must submit requests to dismiss an alert.': '執行者必須提交要求才能解除警示。',
    'Receive alerts for automatically detected vulnerabilities and coding errors using CodeQL default configuration. Code scanning uses GitHub Actions and costs Actions minutes.':
      '使用 CodeQL 預設設定自動偵測弱點和程式碼錯誤並接收警示。程式碼掃描會使用 GitHub 動作並消耗動作分鐘數。',
    'Receive alerts for automatically detected vulnerabilities and coding errors using CodeQL default configuration.':
      '使用 CodeQL 預設設定自動偵測弱點和程式碼錯誤並接收警示。',
    'Code scanning uses GitHub Actions and costs Actions minutes.': '程式碼掃描會使用 GitHub 動作並消耗動作分鐘數。',
    'Define the runner used for code scanning.': '定義用於程式碼掃描的執行器。',
    'Not Set': '未設定',
    'Display license information and vulnerability severity for your dependencies.': '顯示相依項目的授權資訊和弱點嚴重性。',
    'Automatically detect and report build-time dependencies for select ecosystems. Automatic dependency submission uses GitHub Actions and costs Actions minutes.':
      '自動偵測並回報特定生態系統的建置時相依項目。自動相依項目提交會使用 GitHub 動作並消耗動作分鐘數。',
    'Receive alerts for vulnerabilities that affect your dependencies.': '接收影響相依項目的弱點警示。',
    'Allow Dependabot to open pull requests automatically to resolve alerts. For more specific pull request configurations, disable this setting to use Dependabot rules.':
      '允許 Dependabot 自動建立拉取請求來解決警示。如需更具體的拉取請求設定，請停用此設定以使用 Dependabot 規則。',
    'Require organization owners and security managers to dismiss Dependabot alerts instead of allowing repository collaborators to dismiss alerts directly.':
      '要求由組織擁有者和安全性管理員解除 Dependabot 警示，不允許儲存庫協作者直接解除警示。',
    'Receive alerts when malware is detected in dependencies.': '在相依項目中偵測到惡意軟體時接收警示。',
    'Allow your community to privately report potential security vulnerabilities in public repositories.':
      '允許社群私下回報公開儲存庫中潛在的安全性弱點。',
    'Block repository owners from changing features that are enabled or disabled by this configuration. Repository owners will still be able to change features that are not set.':
      '禁止儲存庫擁有者變更此設定已啟用或停用的功能。儲存庫擁有者仍可變更未設定的功能。',
    'Enforce for repository owners': '對儲存庫擁有者強制執行',
    'This configuration enables GitHub Advanced Security features. Applying it to private repositories will only enable free security features.':
      '此設定會啟用 GitHub 進階安全性功能。套用至私人儲存庫時只會啟用免費安全性功能。',
    // 安全配置列表：默认配置、允许修改、各配置的摘要
    'Default for new repositories': '新儲存庫的預設值',
    'Allow repository owners to modify features': '允許儲存庫擁有者修改功能',
    'Receive alerts for and block secret leaks, validate secrets and scan with AI.': '接收機密外洩警示並封鎖外洩、驗證機密並使用 AI 掃描。',
    'Receive alerts for vulnerabilities, coding errors, and advanced dependency management.':
      '接收弱點和程式碼錯誤警示，並取得進階相依項目管理。',
    'Receive alerts for vulnerable dependencies with automated update pull requests.':
      '接收易受攻擊相依項目的警示，並取得自動更新拉取請求。',
    // 安全配置页的提示标题与按钮
    Information: '資訊',
    'Set up': '設定',
    // 身份验证安全
    'Try risk-free for 30 days': '免費試用 30 天',
    'learn more': '瞭解詳情',
    'dismiss this message.': '關閉此訊息。',
    Key: '金鑰',
    'IP allow list': 'IP 允許清單',
    'IP address or range in CIDR notation': '以 CIDR 標記法表示的 IP 位址或範圍',
    'Short description of IP address or range': 'IP 位址或範圍的簡短描述',
    'Check IP address': '檢查 IP 位址',
    'Yes, delete this IP allow list entry': '是，刪除此 IP 允許清單項目',

    // Advanced Security：配置（与存储库设置共用）
    'Security configurations': '安全性設定',
    'GitHub recommended': 'GitHub 建議',
    'Save configuration': '儲存設定',
    Enforce: '強制執行',
    "Don't enforce": '不強制執行',
    'Don’t enforce': '不強制執行',
    'Private and internal': '私人和內部',
    'Not set': '未設定',
    'Security updates': '安全性更新',
    'Dependabot on Actions runners': '動作執行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自架執行器上的 Dependabot',
    Exempt: '豁免',
    'Default setup': '預設設定',
    'Validity checks': '有效性檢查',
    'Non-provider patterns': '非提供者模式',
    'Scan for generic passwords': '掃描通用密碼',
    'Bypass privileges': '繞過權限',

    // 推送保护的绕过执行者（安全配置、规则集共用的绕过列表组件）；原文无逗号，译文不加
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

    // Advanced Security：全局设置（与个人、存储库「程式碼安全性」设置共用）
    'Try our new settings': '試用新設定',
    'Security & analysis': '安全性和分析',
    'Security and analysis features help keep your repositories secure and updated.': '安全性和分析功能可協助你的儲存庫保持安全和最新。',
    'Disable all': '全部停用',
    'Enable all': '全部啟用',
    // 「全部啟用 / 全部停用」按钮的无障碍标签（与个人设置一致）
    'Enable all private vulnerability reporting': '全部啟用私下回報漏洞',
    'Disable all private vulnerability reporting': '全部停用私下回報漏洞',
    'Enable all dependency graph': '全部啟用相依性圖表',
    'Disable all dependency graph': '全部停用相依性圖表',
    'Enable all Dependabot alerts': '全部啟用 Dependabot 警示',
    'Disable all Dependabot alerts': '全部停用 Dependabot 警示',
    'Enable all Dependabot security updates': '全部啟用 Dependabot 安全性更新',
    'Disable all Dependabot security updates': '全部停用 Dependabot 安全性更新',
    'Enable all grouped security updates': '全部啟用分組安全性更新',
    'Disable all grouped security updates': '全部停用分組安全性更新',
    'Enable all dependabot on actions': '全部啟用動作執行器上的 Dependabot',
    'Disable all dependabot on actions': '全部停用動作執行器上的 Dependabot',
    'Enable all dependabot self-hosted': '全部啟用自架執行器上的 Dependabot',
    'Disable all dependabot self-hosted': '全部停用自架執行器上的 Dependabot',
    'Automatically enable for new public repositories': '為新的公開儲存庫自動啟用',
    'Disable private vulnerability reporting': '停用私下回報漏洞',
    'Enable by default for new public repositories': '為新的公開儲存庫預設啟用',
    'Automatically enable for new private repositories': '為新的私人儲存庫自動啟用',
    'Enable by default for new private repositories': '為新的私人儲存庫預設啟用',
    'Dependabot alerts': 'Dependabot 警示',
    'Automatically enable for new repositories': '為新儲存庫自動啟用',
    'Enable by default for new repositories': '為新儲存庫預設啟用',
    'Dependabot security updates': 'Dependabot 安全性更新',
    'Grouped security updates': '分組安全性更新',
    'Learn how to group updates.': '瞭解如何將更新分組。',
    'learn more here': '在此瞭解詳情',
    'Code scanning': '程式碼掃描',
    // 「Identify vulnerabilities and errors with」+ CodeQL +「. Default CodeQL analysis will be set up on」+「eligible」+「public repositories.」
    'Identify vulnerabilities and errors with': '使用',
    '. Default CodeQL analysis will be set up on': '識別漏洞和錯誤。預設的 CodeQL 分析將設定在',
    eligible: '符合資格的',
    'public repositories.': '公開儲存庫上。',
    'Recommend the extended query suite for repositories enabling default setup': '為啟用預設設定的儲存庫建議擴充查詢套件',
    'The extended query includes the default suite, plus lower severity and precision queries.':
      '擴充查詢包含預設套件，以及嚴重性和精確度較低的查詢。',
    'Enable code scanning default setup': '啟用程式碼掃描預設設定',
    'This will turn on CodeQL default setup for all eligible public repositories and repositories with GitHub Advanced Security enabled.':
      '這會為所有符合資格的公開儲存庫，以及已啟用 GitHub 進階安全性的儲存庫開啟 CodeQL 預設設定。',
    'What makes a repository eligible for default setup?': '儲存庫需符合哪些條件才能使用預設設定？',
    'Query suites': '查詢套件',
    // 「Group of queries」+「to run against your code.」（与存储库设置一致，不加逗号）
    'Group of queries': '一組查詢',
    'to run against your code.': '用於對你的程式碼執行。',
    Extended: '擴充',
    'Recommended by your organization. Queries from the default suite, plus lower severity and precision queries.':
      '由你的組織建議。預設套件中的查詢，以及嚴重性和精確度較低的查詢。',
    'Code scanning uses GitHub Actions. Also, repositories where code scanning is already enabled will not be re-enabled.':
      '程式碼掃描使用 GitHub 動作。此外，已啟用程式碼掃描的儲存庫不會重複啟用。',
    'Disable code scanning default setup': '停用程式碼掃描預設設定',
    'This will disable CodeQL default setup on all repositories where it is enabled.':
      '這會在所有已啟用 CodeQL 預設設定的儲存庫上停用此設定。',
    'Secret scanning': '機密掃描',
    'Push protection': '推送保護',
    // 「Block commits that contain」+「supported secrets」：阻挡提交、推送作「阻擋」（封鎖只用于用户）
    'Block commits that contain': '阻擋提交中出現',
    'supported secrets': '支援的機密',
    'Automatically enable for repositories added to secret scanning': '為加入機密掃描的儲存庫自動啟用',
    'Add a resource link in the CLI and web UI when a commit is blocked': '提交遭阻擋時在 CLI 和網頁介面中新增資源連結',
    'Add a resource link in the CLI and the web UI when a commit is blocked': '提交遭阻擋時在 CLI 和網頁介面中新增資源連結',
    // 「Link will show in addition to」+「the message GitHub displays」
    'Link will show in addition to': '連結會附加於',
    'the message GitHub displays': 'GitHub 顯示的訊息',
    'Save link': '儲存連結',
    'Save Link': '儲存連結',
    'Enable secret scanning for eligible repositories?': '為符合資格的儲存庫啟用機密掃描？',
    'This will turn on secret scanning for all public repositories.': '這會為所有公開儲存庫開啟機密掃描。',
    'Enable for eligible repositories': '為符合資格的儲存庫啟用',
    'Disable secret scanning?': '停用機密掃描？',
    'This will disable secret scanning on all repositories where it is enabled.': '這會在所有已啟用機密掃描的儲存庫上停用此功能。',
    'Disable secret scanning': '停用機密掃描',
    'Enable push protection for eligible repositories?': '為符合資格的儲存庫啟用推送保護？',
    'This will turn on push protection for all repositories that have secret scanning enabled.':
      '這會為所有已啟用機密掃描的儲存庫開啟推送保護。',
    'Push protection coverage': '推送保護涵蓋範圍',
    'Already enabled': '已啟用',
    'Will be enabled': '將啟用',
    'Not eligible': '不符合資格',
    'Disable push protection?': '停用推送保護？',
    'You can still enable push protection at the repository level.': '你仍可在儲存庫層級啟用推送保護。',
    'Disable push protection': '停用推送保護',
    'Enable push protection': '啟用推送保護',
    'This will disable push protection on all repositories where it is enabled.': '這會在所有已啟用推送保護的儲存庫上停用此功能。',
    'Learn more about these security privileges': '瞭解這些安全性權限',
    'Search for teams': '搜尋團隊',
    'Edit runner type for Dependabot': '編輯 Dependabot 的執行器類型',
    'Runner label': '執行器標籤',
    'Runner group name': '執行器群組名稱',
    'Pattern configurations': '模式設定',
    'Organization setting': '組織設定',
    'Enterprise setting': '企業設定',
    'New pattern': '新增模式',
    'Save and dry run': '儲存並試執行',
    'Additional settings': '其他設定',

    // Dependabot 存储库访问（组织专用）：显示「Repository access」选择器时，「Select」/「Choose」与后段之间插入的片段，
    // 拼作「選擇 其他 儲存庫」「選擇 其他 Dependabot 可以存取的儲存庫。」
    additional: '其他',

    // Dependabot 规则（与存储库设置共用）
    ...DEPENDABOT_RULES_SCOPED,
    // 以下三条存储库设置由 branches.ts、nav.ts 收录，不放进共用常量
    'New rule': '新增規則',
    '/ New rule': '/ 新增規則',
    Rules: '規則',

    // SAML 单一登录（GitHub Enterprise Cloud 组织）
    Issuer: '簽發者',
    'Signature method': '簽章方法',
    'Digest method': '摘要方法',
    'Require SAML SSO authentication for all members': '要求所有成員透過 SAML SSO 驗證身分',
    'Save SAML settings': '儲存 SAML 設定',

    // IP 允许列表条目
    'Edit IP allow list entry': '編輯 IP 允許清單項目',
    'Delete IP allow list entry': '刪除 IP 允許清單項目',

    // Advanced Security：配置、安全管理员
    Enforcement: '強制執行',
    'Security manager team': '安全性管理員團隊',
    'Add team': '新增團隊',

    // 已验证和批准的域
    'Approve domain': '核准網域'
  },
  regexp: [
    // 双因素身份验证要求的确认对话框（含组织名）
    [
      /^Are you sure you want to require two-factor authentication and only allow secure methods for all users in the ([\w.-]+) organization\?$/,
      '確定要要求 $1 組織的所有使用者啟用雙重驗證並僅允許安全方式嗎？'
    ],
    [
      /^Are you sure you want to remove the two-factor authentication requirement for the ([\w.-]+) organization\?$/,
      '確定要移除 $1 組織的雙重驗證要求嗎？'
    ],
    // 代码质量启用确认：存储库数、按提交者计价
    [
      /^Enabling across (\d+) repositor(?:y|ies) in this organization will incur additional costs based on:$/,
      '在此組織的 $1 個儲存庫中啟用將依下列各項產生額外費用：'
    ],
    [/^(\$[\d,.]+) per active committer\/month$/, '每位活躍提交者每月 $1'],
    // 域：验证码有效期、批准 / 删除确认（域名照录）
    [/^Please note that the code will expire in (\d+) days?\.$/, '請注意，驗證碼將在 $1 天後到期。'],
    [/^Confirm approval of ([\w-]+(?:\.[\w-]+)+)$/, '確認核准 $1'],
    [/^Are you sure you want to approve the domain ([\w-]+(?:\.[\w-]+)+)\?$/, '確定要核准網域 $1 嗎？'],
    [/^Approve ([\w-]+(?:\.[\w-]+)+)$/, '核准 $1'],
    [
      /^You approved the domain ([\w-]+(?:\.[\w-]+)+?)(\.?)$/,
      (_, domain: string, dot: string) => `你已核准網域 ${domain}${dot ? '。' : ''}`
    ],
    [/^Confirm deleting ([\w-]+(?:\.[\w-]+)+)$/, '確認刪除 $1'],
    [/^Are you sure you want to delete the domain ([\w-]+(?:\.[\w-]+)+)\?$/, '確定要刪除網域 $1 嗎？'],
    [/^Delete ([\w-]+(?:\.[\w-]+)+)$/, '刪除 $1'],
    [/^Security settings updated for ([\w.-]+)[’']s repositories\.$/, '已更新 $1 的儲存庫安全性設定。'],
    // 双因素身份验证要求的确认对话框与说明（组织名在句中）
    [
      /^Are you sure you want to require two-factor authentication for all users in ([\w.-]+)\?$/,
      '確定要求 $1 中的所有使用者啟用雙重驗證嗎？'
    ],
    [
      /^Two-factor authentication will no longer be required to access any resources in the ([\w.-]+) organization\.$/,
      '存取 $1 組織中的任何資源將不再需要雙重驗證。'
    ],
    [
      /^Users will be required to set up two-factor authentication using a secure method in order to access the ([\w.-]+) organization\.$/,
      '使用者必須使用安全方式設定雙重驗證才能存取 $1 組織。'
    ],
    [
      /^Users will be required to set up two-factor authentication in order to access the ([\w.-]+) organization\.$/,
      '使用者必須設定雙重驗證才能存取 $1 組織。'
    ],
    [
      /^Secure methods of two-factor authentication will no longer be required to access any organization's resources in the ([\w.-]+) organization\.$/,
      '存取 $1 組織中的資源將不再需要安全的雙重驗證方式。'
    ],
    // 合规报告：下载按钮与涵盖期间
    [/^Download SOC (\d) Report$/, '下載 SOC $1 報告'],
    [/^GitHub\.com (ISO\/IEC [\d:]+) certification$/, 'GitHub.com $1 認證'],
    [/^Download GitHub\.com (ISO\/IEC [\d:]+) certification$/, '下載 GitHub.com $1 認證'],
    [/^(\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})$/, '$1 至 $2'],
    // 句号随原文
    [
      new RegExp(`^Require two-factor authentication for everyone in the ${ORG} organization(\\.?)$`),
      (_, org: string, dot: string) => `要求 ${org} 組織中的所有人啟用雙重驗證${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^Require SAML SSO authentication for all members of the ${ORG} organization(\\.?)$`),
      (_, org: string, dot: string) => `要求 ${org} 組織的所有成員透過 SAML SSO 驗證身分${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^You[’']re about to enable private vulnerability reporting on all public repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有公開儲存庫啟用私下回報漏洞。'
    ],
    [
      new RegExp(`^You[’']re about to disable private vulnerability reporting on all public repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有公開儲存庫停用私下回報漏洞。'
    ],
    [
      new RegExp(`^You[’']re about to enable dependency graph on all private repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有私人儲存庫啟用相依性圖表。'
    ],
    [
      new RegExp(
        `^You[’']re about to disable dependency graph on all private repositories in ${ORG}\\. This will also disable Dependabot alerts and Dependabot security updates on those repositories\\.$`
      ),
      '你即將為 $1 中的所有私人儲存庫停用相依性圖表。這也會停用這些儲存庫的 Dependabot 警示和 Dependabot 安全性更新。'
    ],
    [
      new RegExp(
        `^You[’']re about to enable Dependabot alerts on all repositories in ${ORG}\\. Alerts require the dependency graph, so we[’']ll also turn that on for all repositories\\. No notifications will be sent while Dependabot alerts are being enabled\\.$`
      ),
      '你即將為 $1 中的所有儲存庫啟用 Dependabot 警示。警示需要相依性圖表，因此我們也會為所有儲存庫開啟相依性圖表。啟用 Dependabot 警示期間不會傳送通知。'
    ],
    [
      new RegExp(
        `^You[’']re about to disable Dependabot alerts on all repositories in ${ORG}\\. This will also disable Dependabot security updates on those repositories\\.$`
      ),
      '你即將為 $1 中的所有儲存庫停用 Dependabot 警示。這也會停用這些儲存庫的 Dependabot 安全性更新。'
    ],
    [
      new RegExp(
        `^You[’']re about to enable Dependabot security updates on all repositories in ${ORG}\\. Dependabot security updates require the dependency graph and Dependabot alerts, so we[’']ll also turn that on for all repositories\\.$`
      ),
      '你即將為 $1 中的所有儲存庫啟用 Dependabot 安全性更新。Dependabot 安全性更新需要相依性圖表和 Dependabot 警示，因此我們也會為所有儲存庫開啟這些功能。'
    ],
    [
      new RegExp(`^You[’']re about to disable Dependabot security updates on all repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有儲存庫停用 Dependabot 安全性更新。'
    ],
    [
      new RegExp(
        `^You[’']re about to enable grouped security updates on all repositories in ${ORG}\\. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we[’']ll also turn that on for all repositories\\.$`
      ),
      '你即將為 $1 中的所有儲存庫啟用分組安全性更新。分組安全性更新需要相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會為所有儲存庫開啟這些功能。'
    ],
    [
      new RegExp(`^You[’']re about to disable grouped security updates on all repositories in ${ORG}\\.$`),
      '你即將為 $1 中的所有儲存庫停用分組安全性更新。'
    ],
    [
      /^This will disable push protection on (\d+) repositor(?:y|ies) where it is enabled\.$/,
      '這會在 $1 個已啟用推送保護的儲存庫上停用此功能。'
    ],
    // Dependabot 规则（与存储库设置共用）；「Managed by <组织>」由合并进来的规则集词典收录
    ...DEPENDABOT_RULES_REGEXP,
    // 推送保护绕过列表标题：「3 actors」（执行者可以是角色、团队或应用程序，量词作「個」）
    [/^(\d+) actors?$/, '$1 個執行者'],
    // 绕过列表每行菜单按钮的读屏名称：「<名称> Bypass actor actions」（与存储库设置共用）
    BYPASS_ACTOR_ACTIONS_RULE
  ],
  inline: [
    // 批准域确认：「… with an email address ending in <strong>@example.com</strong>.」
    [
      'Are you sure you want to approve this domain? This will allow notifications from GitHub to be sent to users with an email address ending in {}.',
      '確定要核准此網域嗎？這將允許 GitHub 向電子郵件地址以 {} 結尾的使用者傳送通知。'
    ],
    // 新建安全配置：被链接、注释拆开的说明
    [
      "Use AI to block pushes containing secrets that don't match known patterns. This feature {}.{}",
      '使用 AI 封鎖包含與已知模式不符之機密的推送。此功能會{}。{}'
    ],
    [
      'Block commits that contain supported secrets. {} with Pattern configurations under Global Settings.',
      '封鎖包含受支援機密的提交。在「全域設定」的「模式設定」中{}。'
    ],
    [
      'Actors with privileges can bypass push protection and approve bypass requests. Bypass privileges can also be granted via custom organization roles. {}',
      '具有權限的執行者可以繞過推送保護並核准繞過要求。也可以透過自訂組織角色授予繞過權限。{}'
    ],
    // 未购买高级安全的组织：「This organization does not have <a>GitHub Advanced Security</a>, please <a>contact sales</a>. …」
    [
      'This organization does not have {}, please {}. Private repositories will only have free features enabled.',
      '此組織沒有 {}，請{}。私人儲存庫只會啟用免費功能。'
    ],
    ['The {} label is used by default. Learn how to {}.', '預設使用 {} 標籤。瞭解如何{}。'],
    ['Identify code security findings using AI. All features {}. {}.', '使用 AI 識別程式碼安全性發現。所有功能都會{}。{}。'],
    [
      'This organization does not have GitHub Advanced Security, which is free for public repositories and billed per active committer for private and internal repositories. To apply configurations with GitHub Advanced Security features to private repositories, {}',
      '此組織沒有 GitHub 進階安全性，該功能對公開儲存庫免費，對私人和內部儲存庫按活躍提交者計費。若要將包含 GitHub 進階安全性功能的設定套用到私人儲存庫，請{}'
    ],
    [
      'Ensure your codebases are reliable, maintainable, and efficient by proactively scanning for best practices, reducing bugs, improving readability, and enabling easier testing, collaboration, and scalability. Enabling this feature will incur charges in {}',
      '主動掃描最佳做法、減少錯誤、提升可讀性，讓測試、協作和擴充更輕鬆，確保程式碼庫可靠、可維護且有效率。啟用此功能將產生{}'
    ],
    [
      'We will support quality rules and languages found in this {}. The languages supported with CodeQL for standard findings are: C#, Java, JavaScript/TypeScript, Python, Ruby, and Go. Other languages may be scanned with AI, but will not generate standard findings with CodeQL.',
      '我們將支援此{}中的品質規則和語言。CodeQL 支援產生標準發現的語言有：C#、Java、JavaScript/TypeScript、Python、Ruby 和 Go。其他語言可以使用 AI 掃描，但不會透過 CodeQL 產生標準發現。'
    ]
  ]
} satisfies PageDictionary
