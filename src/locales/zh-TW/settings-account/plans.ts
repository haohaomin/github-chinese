import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/** 剩余时长前缀与单位：“Expires in almost 2 years” */
const QUALIFIERS: Readonly<Record<string, string>> = { about: '約 ', almost: '將近 ', over: '超過 ' }
const UNITS: Readonly<Record<string, string>> = { day: '天', month: '個月', year: '年' }

/** 教育权益申请失败的原因；用 Map 避免命中原型链键 */
const DISCOUNT_ERRORS: ReadonlyMap<string, string> = new Map([
  ['School email must be verified on your GitHub account', '學校電子郵件必須在你的 GitHub 帳號中完成驗證']
])

/**
 * 方案名按用户规定译成「X 版」（取消订阅提示、取消 Copilot 订阅对话框）；
 * Copilot Max 尚无既定译名，保留原文。
 */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  'GitHub Free': 'GitHub 免費版',
  'GitHub Pro': 'GitHub 專業版',
  'GitHub Team': 'GitHub 團隊版',
  'GitHub Enterprise': 'GitHub 企業版',
  'Copilot Free': 'Copilot 免費版',
  'Copilot Pro': 'Copilot 專業版',
  'Copilot Pro+': 'Copilot 專業增強版',
  'Copilot Business': 'Copilot 商務版',
  'Copilot Enterprise': 'Copilot 企業版',
  'Copilot Student': 'Copilot 學生版'
}

/** 方案名的译名；未收录的（如 Marketplace 应用的方案名）保留原文 */
function planName(name: string): string {
  return Object.hasOwn(PLAN_NAMES, name) ? PLAN_NAMES[name]! : name
}

/**
 * 授权与方案（/settings/billing/licensing、/account/upgrade、方案比较）、付款资讯（帐单资讯、付款方式、
 * 优惠券、附加资讯、发票、Azure 订阅）、付款历史记录、其他帐务详细资料（组织、市集应用程式、赞助）、
 * 教育权益（/settings/education/benefits）。
 * 组织帐务页面与此共用，词条放 static；「Unlimited public/private repos」等组织设定已收录的条目为 scoped，此处补 static。
 * 方案比较表中的短功能名放 scoped（与 new/plans.ts 一致），长说明放 static。
 * 产品名、方案名按用户规定译成中文（Actions → 動作、Codespaces → 程式碼空間、Packages → 套件、Pages → 頁面、
 * Marketplace → 市集、Pro → 專業版 等）；品牌词 Copilot、Dependabot、PayPal 保留。
 * 术语（按术语表 billing 行）：功能区作「帳務」，账单内容作「帳單」（帳單資訊），收费方式作「計費」（按年計費、
 * 依用量計費）；plan → 方案，coupon → 優惠券，off（优惠）→ 折抵（与 org-settings/billing.ts 一致），
 * benefits → 權益（与 education 一致），debit card → 金融卡。
 * 「The basics for organizations and developers」「Learn more about GitHub Sponsors」「Switch to invoiced billing」
 * 由其他词典收录。
 */
export default {
  static: {
    // 授权：Copilot 与目前方案
    'Your AI pair programmer': '你的 AI 結對程式設計師',
    'You are eligible to use GitHub Copilot for free.': '你有資格免費使用 GitHub Copilot。',
    'Current plan': '目前方案',
    'Compare all plans': '比較所有方案',
    'per month': '每月',
    'per user/month': '每位使用者/月',
    'The basics for all developers': '適用於所有開發人員的基本功能',
    'Unlimited public/private repos': '無限量的公開/私人儲存庫',
    'Unlimited collaborators': '無限量的協作者',
    // Actions minutes → 動作分鐘數（与组织帐务「包含 $1 動作分鐘數」一致）；core-hours of … 带「的」，
    // 避免「時數程式碼」连读；Codespaces storage 同组织帐务作「程式碼空間的儲存空間」
    '2,000 Actions minutes/month': '每月 2,000 動作分鐘數',
    '3,000 Actions minutes/month': '每月 3,000 動作分鐘數',
    '500MB of Packages storage': '500MB 套件儲存空間',
    '2GB of Packages storage': '2GB 套件儲存空間',
    '120 core-hours of Codespaces compute per developer': '每位開發人員 120 核心時數的程式碼空間運算',
    '15GB of Codespaces storage per developer': '每位開發人員 15GB 程式碼空間的儲存空間',
    '180 core-hours of Codespaces compute': '180 核心時數的程式碼空間運算',
    '20GB of Codespaces storage': '20GB 程式碼空間的儲存空間',
    'Community support': '社群支援',
    'Downgrade to Free': '降級到免費版',
    // 「Code owners, required reviewers, GitHub Pages, <a>and more</a> advanced tools」
    'Code owners, required reviewers, GitHub Pages,': '程式碼擁有者、必要審查者、GitHub 頁面',
    'and more': '等',
    'advanced tools': '進階工具',
    'Not included:': '不包含：',
    'Protected branches on all repos': '所有儲存庫的受保護分支',
    'Increase Codespaces': '提高程式碼空間',
    'spend limits': '支出上限',
    'Multiple reviewers in pull requests': '拉取請求的多位審查者',
    'Required status checks': '必要狀態檢查',
    'Code owners': '程式碼擁有者',
    'Required reviewers': '必要審查者',
    'Pages for static website hosting': '用於代管靜態網站的頁面',
    'Web-based support': '網頁支援',
    'See all features and compare plans': '查看所有功能並比較方案',
    'Active subscription': '有效訂閱',
    'Upgrade Copilot': '升級 Copilot',
    'You can upgrade to Copilot Pro at any time. Check out this': '你可以隨時升級到 Copilot 專業版。查看此',
    'Current GitHub base plan': '目前的 GitHub 基本方案',
    'Compare base plans': '比較基本方案',
    'Upgrade to GitHub Pro': '升級到 GitHub 專業版',
    'Switch to yearly billing': '切換為按年計費',
    'Switch to monthly billing': '切換為按月計費',
    'Switch to annual billing': '切換為按年計費',
    'Current Copilot plan': '目前的 Copilot 方案',
    'Monthly payment': '按月付款',
    'Yearly payment': '按年付款',
    'Next payment': '下次付款',
    'You can upgrade your subscription to yearly billing or cancel any time.': '你可以隨時將訂閱升級為按年計費或取消訂閱。',
    'Read billing documentation': '閱讀帳務說明文件',
    'Compare Copilot plans': '比較 Copilot 方案',
    'Upgrade to Copilot Pro': '升級到 Copilot 專業版',
    'Upgrade to Copilot Pro+': '升級到 Copilot 專業增強版',
    'Upgrade to Copilot Max': '升級到 Copilot Max',
    'Upgrade Individual Plan': '升級個人方案',
    'Upgrade to Business': '升級到商務版',
    'Manage subscription': '管理訂閱',
    'Cancel subscription': '取消訂閱',

    // 方案比较、升级与降级
    'All the basics': '所有基本功能',
    'Advanced tools for private repos': '私人儲存庫的進階工具',
    'Advanced tools for teams': '適用於團隊的進階工具',
    'Upgrade to Pro': '升級到專業版',
    'Upgrade now': '立即升級',
    'Edit plan': '編輯方案',
    'Downgrade plan': '降級方案',
    // 句号随原文
    'I understand. Continue with downgrade': '我已瞭解。繼續降級',
    'Upgrade summary': '升級摘要',
    'Show details': '顯示詳細資料',
    'Upgrade my account': '升級我的帳號',
    // 选择要升级的帐户（/account/choose?action=upgrade）
    'Which do you want to upgrade?': '要升級哪個帳號？',
    'Your new plan': '你的新方案',
    'Redeem your coupon': '兌換優惠券',
    'Free for public repositories': '公開儲存庫免費',
    'With policies and controls': '含政策和管控',
    '180 core-hours compute/month and 20GB storage': '每月 180 核心時數的運算和 20GB 儲存空間',
    '2,000 minutes/month': '每月 2,000 分鐘',
    '3,000 minutes/month': '每月 3,000 分鐘',

    // 方案比较表：分组与功能说明（原文没有的逗号、冒号不加，用定语或「以」「並」连接；
    // 与 new.ts 计划卡片同句的部分译法一致）
    'Code management': '程式碼管理',
    'Code workflow': '程式碼工作流程',
    'Platform security and compliance': '平台安全性和合規性',
    'Marketplace and integrations': '市集和整合',
    'Support and deployment': '支援和部署',
    'Host open source projects in public GitHub repositories, accessible via web or command line. Public repositories are accessible to anyone at GitHub.com.':
      '在公開 GitHub 儲存庫中代管開源專案，可透過網頁或命令列存取。GitHub.com 上的任何人都可以存取公開儲存庫。',
    'Host code in private GitHub repositories, accessible via appliance, web, and command line. Private repositories are only accessible to you and people you share them with.':
      '在私人 GitHub 儲存庫中代管程式碼，可透過設備、網頁和命令列存取。私人儲存庫只有你和你與之共用的人可以存取。',
    'Spin up fully configured dev environments in the cloud with the power of your favorite editor. A "core hour" denotes compute usage. On a 2-core machine, you would get 60 hours free. On a 4-core machine, you would get 30 hours free, etc. Free hours are assigned to personal accounts, rather than free organizations.':
      '使用你喜愛的編輯器在雲端啟動完整設定的開發環境。「核心時數」表示運算使用量。在 2 核心機器上可免費使用 60 小時。在 4 核心機器上可免費使用 30 小時，依此類推。免費時數會分配給個人帳號，而不是免費組織。',
    'Spin up fully configured dev environments in the cloud with the power of your favorite editor. A “core hour” denotes compute usage. On a 2-core machine, you would get 60 hours free. On a 4-core machine, you would get 30 hours free, etc. Free hours are assigned to personal accounts, rather than free organizations.':
      '使用你喜愛的編輯器在雲端啟動完整設定的開發環境。「核心時數」表示運算使用量。在 2 核心機器上可免費使用 60 小時。在 4 核心機器上可免費使用 30 小時，依此類推。免費時數會分配給個人帳號，而不是免費組織。',
    'Use execution minutes with GitHub Actions to automate your software development workflows. Write tasks and combine them to build, test, and deploy any code project on GitHub. Minutes are free for public repositories.':
      '使用 GitHub 動作的執行分鐘數自動化軟體開發工作流程。撰寫並組合任務以在 GitHub 上建置、測試、部署任何程式碼專案。公開儲存庫可免費使用分鐘數。',
    'Learn more about billing': '瞭解計費',
    'Host your own software packages or use them as dependencies in other projects. Both private and public hosting available. Packages are free for public repositories.':
      '代管你自己的軟體套件，或在其他專案中將其作為相依項目使用。提供私人和公開代管。公開儲存庫可免費使用套件。',
    'Review new code, see visual code changes, and confidently merge code changes with automated status checks.':
      '審查新的程式碼、查看視覺化的程式碼變更，並透過自動化狀態檢查放心合併程式碼變更。',
    "Allow contributors to easily notify you of changes they've pushed to a repository – with access limited to the contributors you specify. Easily merge changes you accept.":
      '讓貢獻者將變更推送到儲存庫後輕鬆通知你，且存取權僅限於你指定的貢獻者。輕鬆合併你接受的變更。',
    'Allow contributors to easily notify you of changes they’ve pushed to a repository – with access limited to the contributors you specify. Easily merge changes you accept.':
      '讓貢獻者將變更推送到儲存庫後輕鬆通知你，且存取權僅限於你指定的貢獻者。輕鬆合併你接受的變更。',
    'Enforce restrictions on how code branches are merged, including requiring reviews by selected collaborators, or allowing only specific contributors to work on a particular branch.':
      '限制程式碼分支的合併方式，包括要求由選定的協作者審查，或只允許特定貢獻者在某個分支上工作。',
    'Automatically request reviews – or require approval – by selected contributors when changes are made to sections of code that they own.':
      '選定貢獻者擁有的程式碼區段有變更時，自動請求其審查或要求其核准。',
    'Easily discuss and collaborate on pull requests before submitting to formal review.': '在送交正式審查前輕鬆討論並協作處理拉取請求。',
    'Assign more than one person to a pull request.': '為一個拉取請求指派多人。',
    'See data about activity and contributions within your repositories, including trends. You can use this data to improve collaboration and make development faster and more effective.':
      '查看儲存庫中活動和貢獻的資料，包括趨勢。你可以運用這些資料改善協作，讓開發更快速、更有效。',
    'Send scheduled messages to you or your team listing open pull requests.': '依排定時間向你或你的團隊傳送列出開放中拉取請求的訊息。',
    'Automatically assign code reviews to members of your team based on one of two algorithms.':
      '依兩種演算法之一自動將程式碼審查指派給團隊成員。',
    "When a workflow job references an environment, the job won't start until all of the environment's protection rules pass.":
      '工作流程作業參考環境時，作業要等到該環境的所有保護規則都通過後才會開始。',
    'When a workflow job references an environment, the job won’t start until all of the environment’s protection rules pass.':
      '工作流程作業參考環境時，作業要等到該環境的所有保護規則都通過後才會開始。',
    'A job cannot access secrets that are defined in an environment unless it is running on the specified branch.':
      '作業只有在指定分支上執行時才能存取環境中定義的機密。',
    'Invite any GitHub member, or all GitHub members, to work with you on code in a public repository you control – including making changes and opening issues.':
      '邀請任何一位或所有 GitHub 成員與你一起處理你所控制的公開儲存庫中的程式碼，包括做出變更和建立議題。',
    'Invite any GitHub member, or all GitHub members, to work with you on code in a private repository you control – including making changes and opening issues.':
      '邀請任何一位或所有 GitHub 成員與你一起處理你所控制的私人儲存庫中的程式碼，包括做出變更和建立議題。',
    'Track bugs, enhancements, and other requests, prioritize work, and communicate with stakeholders as changes are proposed and merged.':
      '追蹤錯誤、改進和其他請求，排定工作優先順序，並在提出、合併變更時與相關人員溝通。',
    'Visualize and manage issues and pull requests across tables, boards, and roadmaps with custom fields and views that you can arrange to suit your workflow.':
      '在表格、看板和藍圖中視覺化呈現並管理議題和拉取請求，自訂欄位和檢視可依你的工作流程安排。',
    'Track progress on groups of issues or pull requests in a repository, and map groups to overall project goals.':
      '追蹤儲存庫中各組議題或拉取請求的進度，並將各組對應到專案的整體目標。',
    'Discuss any topic, unattached to a specific project or issue. Control who has access, notify discussion participants with updates, and link from anywhere.':
      '討論任何話題，無須關聯特定專案或議題。控制誰能存取、向討論參與者通知更新，並可從任何位置連結。',
    'Manage access to projects on a team-by-team, or individual user, basis.': '依團隊或個別使用者管理專案的存取權。',
    'Host documentation and simple websites for your project in a wiki format that contributors can easily edit either on the web or command line.':
      '以貢獻者可透過網頁或命令列輕鬆編輯的 Wiki 形式代管專案的說明文件和簡易網站。',
    'Assign more than one person to an issue.': '為一個議題指派多人。',
    'GitHub organizations give you team-based access control and discussions.': 'GitHub 組織提供以團隊為單位的存取控制和討論。',
    'Learn more about organizations': '瞭解組織',
    'Enforce consistent code standards, security, and compliance across branches and tags.':
      '在各分支和標記中強制執行一致的程式碼標準、安全性和合規性。',
    'Export a software bill of materials (SBOM) for your repository.': '為儲存庫匯出軟體物料清單 (SBOM)。',
    'Ensure unfalsifiable provenance and integrity for your software.': '確保軟體具有無法偽造的來源證明和完整性。',
    "Define users' level of access to your code, data and settings.": '定義使用者對你的程式碼、資料和設定的存取層級。',
    'Define users’ level of access to your code, data and settings.': '定義使用者對你的程式碼、資料和設定的存取層級。',
    'Use an extra layer of security with two factor authentication (2FA) when logging into GitHub.':
      '登入 GitHub 時使用雙重驗證 (2FA) 增加一層安全保護。',
    'Quickly review the actions performed by members of your organization.': '快速查看組織成員執行的動作。',
    'Enterprises can connect to advanced systems like LDAP and SAML single sign-on (SSO).':
      '企業可連接 LDAP 和 SAML 單一登入 (SSO) 等進階系統。',
    'Learn more about GitHub Enterprise': '瞭解 GitHub 企業版',
    "Install apps that integrate directly with GitHub's API to improve development workflows – or build your own for private use or publication in the GitHub Marketplace.":
      '安裝直接與 GitHub API 整合的應用程式來改善開發工作流程，或自行建置應用程式供私人使用或發布到 GitHub 市集。',
    'Install apps that integrate directly with GitHub’s API to improve development workflows – or build your own for private use or publication in the GitHub Marketplace.':
      '安裝直接與 GitHub API 整合的應用程式來改善開發工作流程，或自行建置應用程式供私人使用或發布到 GitHub 市集。',
    'Define tests that GitHub automatically runs against code being committed to your repository, and get details about failures and what is causing them.':
      '定義 GitHub 對提交到儲存庫的程式碼自動執行的測試，並取得失敗的詳細資料和失敗原因。',
    'Enterprise Server customers create pre-receive hooks to automatically accept or reject a push.':
      '企業伺服器客戶可建立預先接收鉤子以自動接受或拒絕推送。',
    'Learn more about pre-receive hooks': '瞭解預先接收鉤子',
    'Get help with most of your GitHub questions and issues in our Community Forum.': '在我們的社群論壇取得大多數 GitHub 問題的協助。',
    'GitHub Support can help you troubleshoot issues you run into while using GitHub. Get support via the web.':
      'GitHub 支援可協助你排除使用 GitHub 時遇到的問題。透過網頁取得支援。',
    'Enterprises also get Premium Support, invoice billing, and self-hosted deployment.': '企業還可獲得進階支援、發票付款和自架部署。',

    // 付款资讯：帐单资讯
    'Billing information': '帳單資訊',
    'You have not added any billing information.': '你尚未新增任何帳單資訊。',
    'Add your information to show on every invoice': '新增要顯示在每張發票上的資訊',
    'First name': '名字',
    "First name can't be blank.": '名字不能空白。',
    "First name can't be blank": '名字不能空白',
    'Last name': '姓氏',
    "Last name can't be blank.": '姓氏不能空白。',
    "Last name can't be blank": '姓氏不能空白',
    Address: '地址',
    '(Street, P.O. box)': '（街道、郵政信箱）',
    "Address can't be blank.": '地址不能空白。',
    "Address can't be blank": '地址不能空白',
    'Address line 2': '地址第 2 行',
    // unit 取台湾地址用语「室號」（「單位」是港式说法）
    '(Apartment, suite, unit)': '（公寓、套房、室號）',
    City: '城市',
    "City can't be blank.": '城市不能空白。',
    "City can't be blank": '城市不能空白',
    'Country/Region': '國家/地區',
    'State/Province': '州/省',
    'Required for certain countries': '部分國家/地區必填',
    'Postal/Zip code': '郵遞區號',
    '(9-digit zip code for US)': '（美國為 9 位數郵遞區號）',
    'VAT/GST ID': 'VAT/GST 稅號',
    'Save billing information': '儲存帳單資訊',
    'Save and continue': '儲存並繼續',
    'Successfully updated billing information.': '已更新帳單資訊。',
    'An error occurred while saving billing information.': '儲存帳單資訊時發生錯誤。',
    'Remove your billing information?': '要移除你的帳單資訊嗎？',
    'Remove billing information': '移除帳單資訊',
    'Successfully removed billing information.': '已移除帳單資訊。',
    'Please confirm your billing details to continue. You only need to do this once.': '請確認帳單詳細資料以繼續。只需確認一次。',

    // 付款资讯：付款方式（credit or debit card 取 Apple 繁中「信用卡或金融卡」）
    'Payment method': '付款方式',
    'Payment Method': '付款方式',
    'payment method': '付款方式',
    'You have not added a payment method.': '你尚未新增付款方式。',
    'Pay with': '付款方式',
    'Loading payment information…': '正在載入付款資訊…',
    'Credit or debit card': '信用卡或金融卡',
    'Card Number *': '卡號 *',
    'Expiration Date (YYYY) *': '到期日 (YYYY) *',
    '- Select One -': '- 選擇一項 -',
    'Save payment information': '儲存付款資訊',
    // 「You are currently paying with your PayPal account <strong>电子邮件</strong>, but you can switch …」
    // →「你目前使用的付款方式為 PayPal 帳戶 <電子郵件>，但可以隨時改用信用卡或金融卡。」（电子邮件后接全形逗号，不缺空格）
    'You are currently paying with your PayPal account': '你目前使用的付款方式為 PayPal 帳戶',
    ', but you can switch to using a credit or debit card at any time.': '，但可以隨時改用信用卡或金融卡。',
    'PayPal account': 'PayPal 帳戶',
    'Paypal account': 'PayPal 帳戶',
    'Sign in to PayPal to use a different account.': '登入 PayPal 以使用其他帳戶。',
    // 网路连线义 connect → 連線
    'Connecting to PayPal…': '正在連線到 PayPal…',
    'Sorry, we’re having trouble with PayPal right now, please try again a bit later.': '抱歉，PayPal 目前發生問題，請稍後再試。',
    'You are currently paying with a credit card, but you can switch to using PayPal at any time.':
      '你目前使用信用卡付款，但可以隨時改用 PayPal。',
    'An error occurred while saving payment information.': '儲存付款資訊時發生錯誤。',
    'Your PayPal account has been successfully added.': '已新增你的 PayPal 帳戶。',
    'Your credit card has been successfully updated.': '已更新你的信用卡。',
    // temporary hold 取台湾刷卡用语「預先授權」
    'We may place a temporary hold on your payment method to verify its validity. This is not a charge, and it will be released automatically after verification.':
      '我們可能會暫時預先授權你的付款方式以驗證其有效性。這不是扣款，驗證後會自動解除。',
    'Bank card or PayPal': '信用卡/金融卡或 PayPal',
    'Update payment method': '更新付款方式',
    'Please update your billing information in order to add a payment method.': '請先更新帳單資訊再新增付款方式。',
    // 移除付款方式的确认对话框（原文没有的逗号不加）
    'Edit payment method': '編輯付款方式',
    'Remove payment method': '移除付款方式',
    'Confirm removing payment method': '確認移除付款方式',
    'Removing the payment method will result in your user account losing access to paid features and services billed against this payment method.':
      '移除付款方式後你的使用者帳號將無法使用以此付款方式計費的付費功能和服務。',
    'Important considerations:': '重要注意事項：',
    'Instead of removing, you can edit and add a different payment method to your account in order to continue to use paid features and avoid any product interruptions.':
      '你也可以不移除，而是編輯並為帳號新增其他付款方式以繼續使用付費功能並避免產品中斷。',
    'Removing the payment method does not impact any other settings and configurations for your account.':
      '移除付款方式不會影響帳號的其他任何設定。',
    'Once removed, you can add another payment method at anytime to resume using paid features and services.':
      '移除後，你可以隨時新增其他付款方式以重新使用付費功能和服務。',

    // 付款资讯：上次付款、优惠券、附加资讯
    'Last payment': '上次付款',
    'You have not made any payments.': '你尚未支付任何款項。',
    Coupon: '優惠券',
    'Redeem a coupon': '兌換優惠券',
    // 兑换页（/redeem，只有 common 作用域）
    'Enter coupon code': '輸入優惠碼',
    Redeem: '兌換',
    "You don't have an active coupon.": '你沒有有效的優惠券。',
    'You don’t have an active coupon.': '你沒有有效的優惠券。',
    '* Discount only applies for GitHub Pro': '* 折扣僅適用於 GitHub 專業版',
    'Additional information': '附加資訊',
    'Add specific contact or tax information to your receipts, like your full business name, VAT/GST identification number, or address of record here. We’ll make sure it shows up on every receipt.':
      '在此為收據新增具體的聯絡或稅務資訊，例如公司全名、VAT/GST 識別號碼或登記地址。我們會確保這些資訊顯示在每張收據上。',
    "Add specific contact or tax information to your receipts, like your full business name, VAT/GST identification number, or address of record here. We'll make sure it shows up on every receipt.":
      '在此為收據新增具體的聯絡或稅務資訊，例如公司全名、VAT/GST 識別號碼或登記地址。我們會確保這些資訊顯示在每張收據上。',
    'Add information': '新增資訊',
    'No additional information added to your receipts.': '收據上尚未新增附加資訊。',
    'Extra information': '附加資訊',
    'Extra billing information': '額外帳單資訊',
    'This information will appear on all your receipts.': '此資訊將顯示在你所有的收據上。',
    'For your security, do not include any confidential or financial information (like credit card numbers).':
      '為了你的安全，請勿包含任何機密或財務資訊（例如信用卡號碼）。',
    // 「To update the information that appears on <a>invoices</a> (if enabled), visit the <a>billing information section</a>.」
    'To update the information that appears on': '若要更新顯示在',
    invoices: '發票',
    '(if enabled), visit the': '（如已啟用）上的資訊，請前往',
    'Full business name or address of record': '公司全名或登記地址',
    'Save contact information': '儲存聯絡資訊',
    'Saving contact information…': '正在儲存聯絡資訊…',
    'Updated your optional contact information, it will show up on your next receipt.': '已更新選填的聯絡資訊，將顯示在你的下一張收據上。',

    // 付款资讯：发票、Azure 订阅（「billing information section」为链接）
    'Receive an invoice for your GitHub purchases': '接收你在 GitHub 上消費的發票',
    'The data from Billing Information, such as your address and VAT/GST ID will appear on your invoices.':
      '帳單資訊中的地址和 VAT/GST 稅號等資料將顯示在發票上。',
    // 原文无标点，译文不加逗号
    'Update your information displayed on your invoices in the': '如需更新發票上顯示的資訊請前往',
    'billing information section': '帳單資訊區段',
    'Automatically receive an invoice alongside the payment receipt': '隨付款收據自動接收發票',
    '* Enables invoices for all NEW payments.': '* 為所有新的付款啟用發票。',
    'Save invoice preference': '儲存發票偏好設定',
    // metered billing 按术语表作「依用量計費」（与组织帐务一致）
    'To manage metered billing for this account through Microsoft Azure an Azure Subscription ID must be added to your account.':
      '若要透過 Microsoft Azure 管理此帳號的依用量計費，必須在帳號中新增 Azure 訂閱 ID。',

    // 付款历史记录
    'Amounts shown in USD': '金額以美元顯示',
    'Download receipt': '下載收據',
    Receipt: '收據',
    Refunded: '已退款',
    'Partially refunded': '已部分退款',

    // 其他帐务详细资料
    'Manage your organizations': '管理你的組織',
    'Create a new organization': '建立新組織',
    'Start your first organization': '建立你的第一個組織',
    "With CI/CD, Dependabot, and the world's largest developer community, GitHub gives your team everything they need to ship better software faster":
      '有了 CI/CD、Dependabot 和全球最大的開發人員社群，GitHub 能為你的團隊提供更快交付更好軟體所需的一切',
    'With CI/CD, Dependabot, and the world’s largest developer community, GitHub gives your team everything they need to ship better software faster':
      '有了 CI/CD、Dependabot 和全球最大的開發人員社群，GitHub 能為你的團隊提供更快交付更好軟體所需的一切',
    'Marketplace apps': '市集應用程式',
    'Change plan': '變更方案',
    'Cancel plan': '取消方案',
    'Are you sure you want to cancel this integration?': '確定要取消此整合嗎？',
    // 其后是应用的支持链接（「Codecov 支援」，见 regexp）
    'Do you have any questions? Contact': '有任何問題嗎？請聯絡',
    'Connect with the community that builds the tools you use': '與打造你所用工具的社群建立聯繫',
    'Start sponsoring': '開始贊助',
    "You're currently not sponsoring anyone.": '你目前沒有贊助任何人。',
    'You’re currently not sponsoring anyone.': '你目前沒有贊助任何人。',

    // 教育权益（benefits → 權益，与 education 词典的「GitHub 教育權益」一致）
    'Free GitHub developer resources for students and teachers': '為學生和教師提供的免費 GitHub 開發人員資源',
    'Education Benefits': '教育權益',
    'Complete a teacher or student application to unlock tools and resources for your educational journey.':
      '完成教師或學生申請，以取得教學或學習所需的工具和資源。',
    // 「You have a current student coupon applied. Find more information on your benefits <a>here</a>.」（here 见 billing 的 scoped）
    'You have a current student coupon applied. Find more information on your benefits': '你目前已套用學生優惠券。權益詳情請見',
    'Start an application': '開始申請',
    'You have not submitted an application for education benefits.': '你尚未送出教育權益申請。',
    'Education Benefits Application': '教育權益申請',
    'Select your role in education: *': '選擇你的教育身分：*',
    Teacher: '教師',
    'What is the name of your school? *': '你的學校名稱是什麼？*',
    'If your school is not listed, then enter the full school name and continue. You will be asked to provide further information about your school on the next page. A minimum of two characters is required to find your school.':
      '如果清單中沒有你的學校，請輸入學校全名後繼續。下一頁會要求你提供學校的更多資訊。至少須輸入兩個字元才能搜尋學校。',
    'What is your school email address?': '你的學校電子郵件地址是什麼？',
    'Have a different email address you use with your school?': '在學校使用其他電子郵件地址嗎？',
    'Add it here.': '在此新增。',
    // 学校从清单中挑选，select 作「選擇」
    'Unselect this school': '取消選擇此學校',
    'Share Location': '分享位置',
    'Location shared': '已分享位置',
    'Please select the type of proof you would like to provide *': '請選擇要提供的證明類型 *',
    'What is a valid proof of education?': '什麼是有效的教育證明？',
    'Application Type:': '申請類型：',
    'Coupon applied': '已套用優惠券',
    'Your academic status has been verified. Congratulations!': '你的學術身分已通過驗證。恭喜！',
    'Your academic benefits, including Partner offers, will become available after 72 hours of your verification.':
      '你的學術權益，包括合作夥伴優惠，將在驗證通過 72 小時後生效。',
    // 其后是「here」链接（参考译文均按链接处理；billing 的 scoped 译「這裡」）：「…優惠，請見這裡。」
    'Once the benefits become available, you will be able to access the Students Developer Pack offers':
      '權益生效後，你就能使用學生開發人員套件優惠，請見',
    // 「… please sign up via this <a>link</a>.」（link 见 scoped）→「…，請使用此註冊連結。」
    'To redeem your Copilot Pro coupon, please sign up via this': '若要兌換 Copilot 專業版優惠券，請使用此註冊',
    'We hope you enjoy your GitHub Education benefits.': '希望你喜歡 GitHub 教育權益。',
    'Congratulations! Your application has been approved and the coupon code has been applied to your account.':
      '恭喜！你的申請已獲核准，優惠碼也已套用到你的帳號。',
    // 「Please visit the <a>Developer Pack</a> page to view your benefits.」（Please visit the 见 scoped）
    'Developer Pack': '開發人員套件',
    'page to view your benefits.': '頁面查看你的權益。',
    'Your benefits will expire on': '你的權益到期日為',
    'Loading details': '正在載入詳細資料',
    'Reason(s):': '原因：',
    'GitHub billing information': 'GitHub 帳單資訊',
    'GitHub user profile': 'GitHub 使用者個人檔案',
    // 教育权益：申请条件与未通过原因（学校名、电子邮件、链接在其他元素中）
    'We require applicants of': '我們要求',
    'to use one of these school-issues email addresses to apply:': '的申請人使用下列其中一個學校核發的電子郵件地址提出申請：',
    'to use one of these school-issued email addresses to apply:': '的申請人使用下列其中一個學校核發的電子郵件地址提出申請：',
    // 「<a>add and verify your</a> <a>school-issued email address</a> in your account settings -- or …」
    // →「在帳號設定中新增並驗證你的 學校核發的電子郵件地址——若沒有，…」：「在帳號設定中」移到第一段，
    // 第三段以破折号开头，引擎不保留其前的原文空白
    'add and verify your': '在帳號設定中新增並驗證你的',
    'school-issued email address': '學校核發的電子郵件地址',
    'in your account settings -- or a contact email if you do not have one. Once your email is verified, you can try applying again.':
      '——若沒有，則改用聯絡電子郵件。電子郵件驗證後，可以再次嘗試申請。',
    // 「You have verified the email address <电子邮件> on your GitHub account. This academic domain is associated with the school <学校>.」
    // →「你已在 GitHub 帳號中驗證電子郵件地址 <電子郵件>。此學術網域關聯的學校為 <學校>.」（第二段以句号开头）
    'You have verified the email address': '你已在 GitHub 帳號中驗證電子郵件地址',
    'on your GitHub account. This academic domain is associated with the school': '。此學術網域關聯的學校為',
    '1. Dated school ID - Good': '1. 註明日期的學生證 - 良好',
    // 证明类型图例：「<span>Good</span> proof requires …」（Good / Fair / Poor 见 scoped）
    'proof requires infinite academic affiliation documentation most likely to help you be approved.':
      '證明需提供最有可能讓你獲得核准的完整學術身分證明文件。',
    'proof types may lower your chances of being approved.': '證明類型可能會降低你獲得核准的機會。',
    'proof types are unlikely to be acceptable.': '證明類型通常不予接受。',
    'Gathering available school information...': '正在收集可用的學校資訊...',
    'Gathering available school information…': '正在收集可用的學校資訊…',
    // premium tools 与 education 词典的「優質工具」一致；「180 monthly Codespaces hours」带「的」
    'Get Copilot for free, 180 monthly Codespaces hours for cloud coding, unlimited private repositories with GitHub Pro or Team, and dozens of premium tools in the Student Developer Pack.':
      '免費使用 Copilot，每月享有 180 小時的程式碼空間雲端開發時間，透過 GitHub 專業版或團隊版使用無限量私人儲存庫，並取得學生開發人員套件中的數十種優質工具。',
    // 「Please complete your [GitHub billing information] with your full name …」
    'Please complete your': '請在',
    'with your full name exactly as it appears in your academic affiliation document. You do not have to add a payment method. You may need to log out and log back in to GitHub before reapplying. If you have only a single legal name, enter it in both the first and last name fields.':
      '中填寫與學術身分證明文件完全一致的全名。無須新增付款方式。重新申請前可能需要登出並重新登入 GitHub。如果你只有一個法定姓名，請在名字和姓氏欄位中都填入該姓名。',
    // 「You are unlikely to be verified until you have completed your [GitHub user profile] with your full name …」
    // →「你需要先在 <GitHub 使用者個人檔案> 中填寫…全名才有可能通過驗證。」（原文无逗号，译文不加）
    'You are unlikely to be verified until you have completed your': '你需要先在',
    'with your full name exactly as it appears in your academic affiliation document. Please do not use a variation of your name or a nickname. Once you have updated your profile information log out and log back into GitHub before re-applying.':
      '中填寫與學術身分證明文件完全一致的全名才有可能通過驗證。請勿使用姓名的其他寫法或暱稱。更新個人檔案資訊後請先登出並重新登入 GitHub 再重新申請。',
    // 其他未通过原因（被链接拆开的句子按片段收录）
    'You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect, then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.':
      '你必須將瀏覽器和作業系統設定為允許存取位置資訊。不得使用 VPN。如果你認為我們掌握的學校資訊不完整或不正確，請在送出 GitHub 教育支援工單時選擇「我選擇的學校資訊不正確或不完整，例如網域或校園位置」選項。',
    // 上一条的现行版本：前面多两句，后半句多“e.g. missing campus location(s)”（旧版仍可能出现，保留）
    'You appear not to be near any campus location for the school you have selected. Your academic affiliation documentation must indicate virtual learning if you are remote. You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect e.g. missing campus location(s), then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.':
      '你似乎不在所選學校的任何校園位置附近。如果你遠距上課，學術身分證明文件中必須註明為線上學習。你必須將瀏覽器和作業系統設定為允許存取位置資訊。不得使用 VPN。如果你認為我們掌握的學校資訊不完整或不正確，例如缺少校園位置，請在送出 GitHub 教育支援工單時選擇「我選擇的學校資訊不正確或不完整，例如網域或校園位置」選項。',
    // 「… can be found <a>here</a>. You may also try …」（here 见 billing 的 scoped）
    'Please use your device camera to submit your academic affiliation documents. If you’re having trouble using your device camera, please allow camera access for the application website on your browser. The steps for this will vary depending on which browser you are using. Information on browsers supported by GitHub can be found':
      '請使用裝置的攝影機拍攝並送出你的學術身分證明文件。如果使用裝置的攝影機時遇到問題，請在瀏覽器中允許申請網站存取攝影機。實際步驟依你使用的瀏覽器而定。如需 GitHub 支援的瀏覽器相關資訊，請參閱',
    '. You may also try applying from a different computer or mobile device.': '。你也可以嘗試改用其他電腦或行動裝置申請。',
    // 「… exactly as it appears in your <a>GitHub billing information</a>. …」
    // →「請確保學術身分證明文件中的姓氏與你的 GitHub 帳單資訊中的完全一致。…」
    'Please ensure that your academic affiliation document contains your last name exactly as it appears in your':
      '請確保學術身分證明文件中的姓氏與你的',
    '. If you have only a single legal name, enter it in both the first and last name fields of your GitHub billing information.':
      '中的完全一致。如果你只有一個法定姓名，請在 GitHub 帳單資訊的名字和姓氏欄位中都填入該姓名。',
    'The image you selected does not appear to contain your school name. Your complete school name must appear in your document, not only the school logo. You may include multiple documents together. If your official document is not in English then you may photograph the original next to an English translation.':
      '你選取的圖片中似乎沒有學校名稱。文件中必須出現完整的學校名稱，而不只是校徽。你可以將多份文件放在一起。如果你的正式文件不是英文，可以將正本與英文譯本並排拍照。',
    'Please ensure that your academic affiliation document contains your first name exactly as it appears in your':
      '請確保學術身分證明文件中的名字與你的',
    '. Variations of your name and nicknames are unacceptable.': '中的完全一致。不接受姓名的其他寫法或暱稱。',
    'The image you captured appears to be a screen display. Please take a clear, live photo of physical documentation confirming your academic enrollment.':
      '你拍攝的圖片似乎是螢幕畫面。請為能證明你在學身分的實體文件現場拍攝一張清晰的相片。'
  },
  scoped: {
    Sponsorships: '贊助',
    Plan: '方案',
    Downgrade: '降級',
    Denied: '已拒絕',
    // 全站 static 由 security 词典提供，此处固定本页译法
    Revoked: '已撤銷',
    Failed: '失敗',
    link: '連結',
    // 「Please visit the <a>Developer Pack</a> page to view your benefits.」：造访网站义 visit → 造訪
    'Please visit the': '請造訪',
    // 发票、Azure 订阅（与组织设定译法一致）
    Invoice: '發票',
    'Metered billing via Azure': '透過 Azure 依用量計費',
    'Add Azure Subscription': '新增 Azure 訂閱',
    'Azure subscription': 'Azure 訂閱',
    'Select a subscription': '選擇訂閱',
    'Edit the subscription': '編輯訂閱',
    // connect → 連接（与 Azure 订阅的「連接」按钮一致；同 org-settings/billing.ts）
    'Disconnect the subscription': '中斷訂閱連接',
    // 方案比较表：功能名（与 new/plans.ts 一致）
    Unlimited: '無限制',
    Collaboration: '協作',
    'Private repositories': '私人儲存庫',
    'Code reviews': '程式碼審查',
    'Protected branches': '受保護的分支',
    'Repository rules': '儲存庫規則',
    'Draft pull requests': '草稿拉取請求',
    'Multiple pull request assignees': '拉取請求的多位負責人',
    'Repository insights': '儲存庫洞察',
    'Automatic code review assignment': '自動指派程式碼審查',
    'Environment protection rules': '環境保護規則',
    'Environment deployment branches and secrets': '環境部署分支和機密',
    'Collaborators for public repositories': '公開儲存庫的協作者',
    'Collaborators for private repositories': '私人儲存庫的協作者',
    Milestones: '里程碑',
    'Organization and team management': '組織和團隊管理',
    'Pages and wikis': '頁面和 Wiki',
    'Multiple issue assignees': '議題的多位負責人',
    'Repository rulesets': '儲存庫規則集',
    'Artifact attestations': '成品證明',
    'GitHub Security Advisories': 'GitHub 安全性公告',
    'Role-based access control': '角色型存取控制',
    'Required 2FA': '強制使用 2FA',
    'Status checks': '狀態檢查',
    'Pre-receive hooks': '預先接收鉤子',
    'Community Support': '社群支援',
    'Standard Support': '標準支援',
    // 教育权益：证明类型图例标签
    Good: '良好',
    Fair: '尚可',
    Poor: '不佳',
    // 教育权益申请的身份选项（与 Teacher 并列）。全局 Student 是 Copilot 菜单的方案标签，设定页固定为身份义
    Student: '學生',
    // 帐务页、教育权益页单独显示的产品名
    'GitHub Sponsors': 'GitHub 贊助',
    'GitHub Education': 'GitHub 教育',
    // 授权页单独显示的方案名（目前方案、Copilot 方案）与帐务页的产品名：按用户规定译成中文；
    // 组织提供的 Copilot 席次与团队、企业方案同 PLAN_NAMES，与组织帐务页一致
    'GitHub Free': 'GitHub 免費版',
    'GitHub Pro': 'GitHub 專業版',
    'GitHub Team': 'GitHub 團隊版',
    'GitHub Enterprise': 'GitHub 企業版',
    'Copilot Free': 'Copilot 免費版',
    'Copilot Pro': 'Copilot 專業版',
    'Copilot Pro+': 'Copilot 專業增強版',
    'Copilot Business': 'Copilot 商務版',
    'Copilot Enterprise': 'Copilot 企業版',
    // 帐务总览「訂閱」卡片的学生方案
    'Copilot Student': 'Copilot 學生版',
    'Advanced Security': '進階安全性'
    // 付款方式「Sign in to <PayPal 标志>」：Sign in to 由 auth 的全站 static 收录
  },
  regexp: [
    // 其他帐务详细资料
    [/^In addition to your personal account, you manage (\d+) organizations?\.$/, '除了個人帳號，你還管理 $1 個組織。'],
    [
      new RegExp(`^You['’]ve cancelled your subscription to (.+?)\\. This plan change will take effect on (${DATE_SOURCE})\\.$`),
      (_, name: string, date: string) =>
        joinCjk(joinCjk(joinCjk('你已取消訂閱', planName(name)), '。此方案變更將於'), translateTime(date)) + '生效。'
    ],
    // 优惠券与教育权益（句号随原文；off 作「折抵」，与组织帐务一致）
    [
      new RegExp(`^(\\$[\\d,]+(?:\\.\\d{2})?) off per month until (${DATE_SOURCE})(\\.?)$`),
      (_, amount: string, date: string, dot: string) => `${joinCjk(translateTime(date), '前每月折抵')} ${amount}${dot ? '。' : ''}`
    ],
    // 优惠券期限在单独元素中：“$4.00 off per month” + “until Dec 31, 2026.”
    [/^(\$[\d,]+(?:\.\d{2})?) off per month$/, '每月折抵 $1'],
    [
      new RegExp(`^until (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk('至', translateTime(date))}${dot ? '。' : ''}`
    ],
    [/^· (\d+) (day|month|year)s? remaining$/, (_, amount: string, unit: string) => `· 剩餘 ${amount} ${UNITS[unit] ?? unit}`],
    // 申请的送出时间：3 天前送出、2025年10月1日送出（submit 按术语表作「送出」）
    [new RegExp(`^Submitted (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '送出')],
    // 未来的到期用「到期」（同 org-settings/third-party.ts 的 Expires on）
    [
      /^Expires in (?:(about|almost|over) )?(\d+) (day|month|year)s?$/,
      (_, qualifier: string, amount: string, unit: string) => `${QUALIFIERS[qualifier] ?? ''}${amount} ${UNITS[unit] ?? unit}後到期`
    ],
    // 付款方式：卡号末四码与到期日（ending in 只跟四位数字，取台湾通行的「末四碼」）
    [/^(Visa|Mastercard|MasterCard|American Express|Amex|Discover|JCB|Diners Club|UnionPay) ending in (\d{4})$/, '$1 末四碼 $2'],
    [/^Expires (\d{1,2}\/\d{2,4})$/, '到期日 $1'],
    // 方案价格
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?month$/, '$1/月'],
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?year$/, '$1/年'],
    [/^(\$[\d,]+(?:\.\d{2})?) per month$/, '每月 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) per year$/, '每年 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) spend limit$/, '$1 支出上限'],
    // 取消 Copilot 订阅对话框：Cancel Copilot Pro / Pro+ / Max（方案名译成「X 版」，Max 保留）
    [/^Cancel (Copilot (?:Pro\+?|Max))$/, (_, name: string) => joinCjk('取消', planName(name))],
    // 其他帐务详细资料：Marketplace 应用的支持链接「Codecov | Code Coverage support」；常见的通用支持名称排除在外
    [/^(?!(?:Contact|Community|Web-based|Standard|Premium|Priority|Customer|Enterprise|Email) support$)([A-Z0-9].*) support$/, '$1 支援'],
    // 教育权益：送出申请失败（错误原因未收录时保留原文）
    [
      /^There was an error creating the discount request\. Errors: Discount request could not be created\. Discount request errors: (.+)$/,
      (_, reason: string) => `建立折扣申請時發生錯誤。錯誤：無法建立折扣申請。折扣申請錯誤：${DISCOUNT_ERRORS.get(reason) ?? reason}`
    ]
  ]
} satisfies PageDictionary
