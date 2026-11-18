import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 计量使用量页的时间范围选项 */
const TIMEFRAMES: Readonly<Record<string, string>> = {
  Today: '今天',
  'Current month': '本月',
  'Last month': '上個月',
  'This year': '今年',
  'Last year': '去年',
  Custom: '自訂',
  'Custom range': '自訂範圍'
}

/** 使用量分组依据 */
const GROUPS: Readonly<Record<string, string>> = {
  None: '無',
  Product: '產品',
  Products: '產品',
  SKU: 'SKU',
  SKUs: 'SKU',
  Repository: '儲存庫',
  Repositories: '儲存庫',
  Model: '模型',
  Models: '模型',
  Organization: '組織',
  Organizations: '組織',
  User: '使用者',
  Users: '使用者',
  'Cost center': '成本中心'
}

/** 图表标题中的分组说明：「依產品分組」，英文名两侧加空格「依 SKU 分組」 */
function groupedBy(group: string): string {
  return joinCjk(joinCjk('依', GROUPS[group] ?? group), '分組')
}

/**
 * 使用量图表标题中的产品名（“Actions usage grouped by SKU”）。
 * 产品名译成中文（见 nav.ts 文件头）；Copilot、Git LFS、Spark 是品牌词或技术缩写，保留。usage 按术语表作「使用量」。
 */
const USAGE_PRODUCTS: Readonly<Record<string, string>> = {
  'Metered usage': '計量使用量',
  'AI usage': 'AI 使用量',
  'Actions usage': '動作使用量',
  'Copilot usage': 'Copilot 使用量',
  'Codespaces usage': '程式碼空間使用量',
  'Git_lfs usage': 'Git LFS 使用量',
  'Git LFS usage': 'Git LFS 使用量',
  'Packages usage': '套件使用量',
  'Models usage': '模型使用量',
  'Spark usage': 'Spark 使用量',
  'Advanced Security usage': '進階安全性使用量'
}

/** 授权页的产品名（与 nav.ts 的 scoped、common/marketing.ts 的 static 一致） */
const PRODUCTS: Readonly<Record<string, string>> = {
  'Advanced Security': '進階安全性',
  'Secret Protection': '機密保護',
  'Code Security': '程式碼安全性',
  'Code Quality': '程式碼品質'
}

/** 组织方案名（用户要求：方案名译成中文） */
const PLANS: Readonly<Record<string, string>> = {
  Free: '免費版',
  Team: '團隊版',
  Enterprise: '企業版'
}

/** 成员请求页引用的方案名、产品名（带品牌前缀，与「Member requests for GitHub Add-Ons」同译）；其他名称原样保留 */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  'GitHub Free': 'GitHub 免費版',
  'GitHub Team': 'GitHub 團隊版',
  'GitHub Enterprise': 'GitHub 企業版',
  'GitHub Add-Ons': 'GitHub 附加元件',
  'Copilot Free': 'Copilot 免費版',
  'Copilot Business': 'Copilot 商務版',
  'Copilot Enterprise': 'Copilot 企業版',
  'GitHub Advanced Security': 'GitHub 進階安全性',
  'GitHub Secret Protection': 'GitHub 機密保護',
  'GitHub Code Security': 'GitHub 程式碼安全性',
  ...PRODUCTS
}

function translatePlan(name: string): string {
  return PLAN_NAMES[name] ?? name
}

/** 排名：Top three → 前三名（two 作「兩」：前兩名） */
const ORDINALS: Readonly<Record<string, string>> = { two: '兩', three: '三', four: '四', five: '五' }

/** 包含的使用量明细项（“2 GB included Packages storage”） */
const INCLUDED_ITEMS: Readonly<Record<string, string>> = {
  'Actions storage': '動作儲存空間',
  'Git LFS bandwidth': 'Git LFS 頻寬',
  'Git LFS storage': 'Git LFS 儲存空間',
  'Packages data transfer': '套件資料傳輸',
  'Packages storage': '套件儲存空間',
  'Codespaces storage': '程式碼空間的儲存空間'
}

const PERIODS: Readonly<Record<string, string>> = {
  today: '今天',
  'this month': '本月',
  'last month': '上個月',
  'this year': '今年',
  'last year': '去年'
}

const MONEY = '(\\$[\\d,]+(?:\\.\\d+)?)'
const NUMBER = '(\\d[\\d,]*(?:\\.\\d+)?)'

/** 日期区间：Oct 1 - Oct 31, 2025 → 10月1日 - 2025年10月31日 */
function dateRange(start: string, end: string): string {
  return `${translateTime(start)} - ${translateTime(end)}`
}

/**
 * 组织帐务：帐务管理员（含 /organizations/<组织>/billing_managers/new 邀请页）、帐务联系人、
 * 发票、Azure 计量计费、组织方案升降级与席次；总览、使用量、预算和警示、付款信息等页面。
 * 帐务页面的长句与个人帐务共用，已由个人设置收录为 static；
 * 个人帐务页的短词与正则只在个人设置生效，组织帐务页（org-settings 页面类型）在这里另收一份。
 * 邀请帐务管理员页、方案升级页属于 organization 页面类型，词条放 static。
 * 术语（按术语表 billing 行）：功能区、角色作「帳務」（帳務管理員），账单内容作「帳單」（帳單電子郵件、帳單週期），
 * 收费方式作「計費」（依用量計費）；plan → 方案，seat → 席次，license（计费）→ 授權，AI credits → AI 點數，
 * premium requests → 進階請求，off（优惠）→ 折抵。
 */
export default {
  static: {
    // 邀请帐务管理员
    '/ Add a billing manager': '/ 新增帳務管理員',
    'Add a billing manager': '新增帳務管理員',
    'Invite a billing manager': '邀請帳務管理員',
    'Billing managers': '帳務管理員',
    // 「A <strong>billing manager</strong> is a user who …」「Billing managers <strong>will</strong> have the ability to:」
    // 「Billing managers <strong>will not</strong> be able to:」
    'billing manager': '帳務管理員',
    will: '將',
    'will not': '不會',
    'is a user who manages the billing settings of your organization.': '是管理組織帳務設定的使用者。',
    'have the ability to:': '擁有以下權限：',
    'Change the billing plan': '變更計費方案',
    'Add, update, or remove payment methods': '新增、更新或移除付款方式',
    'View payment history': '查看付款歷史記錄',
    'Download, and receive receipts': '下載並接收收據',
    'View a list of billing managers': '查看帳務管理員清單',
    'Invite additional billing managers': '邀請其他帳務管理員',
    'Remove other existing billing managers': '移除其他現有的帳務管理員',
    'Start, modify, or cancel sponsorships': '開始、修改或取消贊助',
    'be able to:': '擁有以下權限：',
    'Create or access repositories in your organization': '在組織中建立或存取儲存庫',
    // 组织成员身分 Private 按术语表作「不公開」
    'See private members of your organization': '查看組織的不公開成員',
    'Be seen in the list of organization members': '出現在組織成員清單中',
    'Use the organization’s payment method': '使用組織的付款方式',
    "Use the organization's payment method": '使用組織的付款方式',
    'Enable or manage Copilot': '啟用或管理 Copilot',
    'Purchase, edit, or cancel Marketplace subscriptions': '購買、編輯或取消市集訂閱',

    // 方案升级、降级
    'Upgrade to Enterprise': '升級到企業版',
    'This organization is owned by a business': '此組織歸企業所有',
    "Upgrade my organization's account": '升級我的組織帳號',
    'Upgrade my organization’s account': '升級我的組織帳號',
    'I understand. Downgrade my organization': '我已瞭解。降級我的組織',

    // Azure 订阅连接（connect → 連接；metered → 計量）
    'By clicking "Connect", you are confirming that you want to be billed for metered services via the selected Azure subscription':
      '按一下「連接」即表示你確認要透過所選的 Azure 訂閱支付計量服務的費用',
    'By clicking “Connect”, you are confirming that you want to be billed for metered services via the selected Azure subscription':
      '按一下「連接」即表示你確認要透過所選的 Azure 訂閱支付計量服務的費用'
  },
  scoped: {
    // 帐务联系人
    'Billing Contacts': '帳務聯絡人',
    'Billing contacts': '帳務聯絡人',
    'Receipts are sent to billing managers and email recipients.': '收據會傳送給帳務管理員和電子郵件收件者。',
    'You have not invited any billing managers': '你尚未邀請任何帳務管理員',
    'Email recipients': '電子郵件收件者',
    'Edit billing email address': '編輯帳單電子郵件地址',
    'Billing primary email': '主要帳單電子郵件',
    'Add billing recipient': '新增帳單收件者',
    'Add billing recipient email': '新增帳單收件者電子郵件',
    Primary: '主要',

    // 发票与 Azure（metered billing 按术语表作「依用量計費」）
    Invoice: '發票',
    'Metered billing via Azure': '透過 Azure 依用量計費',
    'Add Azure Subscription': '新增 Azure 訂閱',
    'Azure subscription': 'Azure 訂閱',
    'Select a subscription': '選擇訂閱',
    'Edit the subscription': '編輯訂閱',
    // 「Connect」按钮译「連接」，断开同用「連接」（同 common-ui 的 Disconnect → 中斷連接）
    'Disconnect the subscription': '中斷訂閱連接',

    // 计量使用量：页面标题、时间范围、报告类型、表格列（与个人帐务一致）
    'Metered usage': '計量使用量',
    'AI usage': 'AI 使用量',
    Budgets: '預算',
    'Custom range': '自訂範圍',
    Summarized: '摘要',
    Detailed: '詳細',
    Legacy: '舊版',
    Model: '模型',
    Units: '單位',
    Amount: '金額',
    Discount: '折扣',
    Alerts: '警示',
    'Cost center': '成本中心',
    // 时间范围按钮只显示标签时
    Timeframe: '時間範圍',
    'Time frame': '時間範圍',

    // 总览、使用量、预算（新版帐务）
    'Gross metered usage': '計量使用量總額',
    'Included usage discounts': '包含的使用量折扣',
    Discounts: '折扣',
    'Net amount': '淨額',
    'Usage report': '使用量報告',
    'Usage by organization': '依組織統計的使用量',
    'Top products': '使用量最高的產品',
    Spending: '支出',
    'No budgets': '尚無預算',
    'Search budgets': '搜尋預算',
    'Cost centers': '成本中心',
    Info: '資訊',
    // 「Select repository」由 common-ui 的 static 统一收录

    // 方案、帐务管理、付款方式（旧版帐务）
    'Billing summary': '帳單摘要',
    'Current monthly bill': '目前每月帳單',
    'Next billing date': '下次帳單日期',
    'Billing cycle': '帳單週期',
    'Billing period': '帳單期間',
    Monthly: '每月',
    Yearly: '每年',
    Annual: '每年',
    'Compare plans': '比較方案',
    'Manage spending limit': '管理支出上限',
    'Usage this month': '本月使用量',
    'Git LFS Data': 'Git LFS 資料',
    'Add more data packs': '新增更多資料包',
    'Billing management': '帳務管理',
    'Edit billing email': '編輯帳單電子郵件',
    'Add billing manager': '新增帳務管理員',
    'Invite billing manager': '邀請帳務管理員',
    'Billing contact': '帳務聯絡人',
    'Add payment method': '新增付款方式',
    'Add information to your receipts': '在收據中新增資訊',
    'Manage sponsorships': '管理贊助',
    'Edit seats': '編輯席次',

    // 付款历史记录、发票
    Invoices: '發票',
    'View invoice': '查看發票',
    'Download invoice': '下載發票',
    Receipts: '收據',
    'Transaction ID': '交易 ID',
    Total: '總計',
    Subtotal: '小計',
    Tax: '稅金',
    Taxes: '稅金',
    // 发票上的抵用金额
    Credit: '抵用額度',
    Paid: '已付款',
    Unpaid: '未付款',
    Failed: '失敗',

    // 组织方案与席次（方案名译成中文，见 nav.ts 文件头）
    'Upgrade to GitHub Team': '升級到 GitHub 團隊版',
    'Downgrade to GitHub Free': '降級到 GitHub 免費版',
    'GitHub Free': 'GitHub 免費版',
    'GitHub Team': 'GitHub 團隊版',
    'GitHub Enterprise': 'GitHub 企業版',
    'Copilot Free': 'Copilot 免費版',
    'Copilot Business': 'Copilot 商務版',
    'Copilot Enterprise': 'Copilot 企業版',
    Downgrade: '降級',
    Seats: '席次',
    'Add seats': '新增席次',
    'Remove seats': '移除席次',
    'Manage seats': '管理席次',
    'Purchase seats': '購買席次',

    // 成员请求（Requests from members）：功能、附加元件与 Copilot 预算请求
    'Member requests for GitHub Add-Ons': 'GitHub 附加元件的成員請求',
    'Member requests for additional Copilot budget': '額外 Copilot 預算的成員請求',
    'Discover your organization’s specific needs and uncover your users’ ideal workflows to enhance productivity and collaboration.':
      '瞭解組織的具體需求，找出使用者理想的工作流程，以提升生產力和協作。',
    "Discover your organization's specific needs and uncover your users' ideal workflows to enhance productivity and collaboration.":
      '瞭解組織的具體需求，找出使用者理想的工作流程，以提升生產力和協作。',
    // 「Unlock」+「Enterprise Features」：取得企業版功能（「解鎖」是大陆用语，lock 义的「解除鎖定」不适用于此）
    Unlock: '取得',
    'Watch customer story': '觀看客戶案例',
    'Ask enterprise owners for access': '向企業擁有者申請存取權',
    // 「Contact an admin」+「for more details around their decision.」
    'for more details around their decision.': '以瞭解此決定的詳情。',
    'Something went wrong creating your request. Please try again.': '建立請求時發生錯誤。請再試一次。',
    'Something went wrong removing your request. Please try again.': '移除請求時發生錯誤。請再試一次。',
    'Something went wrong updating your notification settings. Please try again.': '更新通知設定時發生錯誤。請再試一次。',
    'Notified of all notifications on this page.': '接收此頁面上的所有通知。',
    // 事件是勾选项，select 按术语表作「選取」
    'Select events you want to be notified of.': '選取要接收通知的事件。',
    Ignore: '忽略',
    // 请求数旁的单位：「3」+「requests」
    request: '個請求',
    requests: '個請求',
    // Copilot 政策页的成员请求卡片
    'View all requests': '查看所有請求',

    // 授权（/organizations/<组织>/settings/licensing）：Advanced Security、Code Quality 卡片
    "What's included": '包含的內容',
    'What’s included': '包含的內容',
    'Push protection to prevent secret leaks': '防止機密外洩的推送保護',
    'AI detection with a low rate of false positives': '低誤報率的 AI 偵測',
    'Custom patterns for secrets': '機密的自訂模式',
    'Enterprise-grade policies': '企業級政策',
    'Security overview for risk insights': '提供風險洞察的安全性總覽',
    'Copilot Autofix for vulnerabilities': '針對漏洞的 Copilot 自動修正',
    'Security findings for third-party tools': '第三方工具的安全性發現項目',
    'Security campaigns to address security debt': '處理安全性債務的安全性活動',
    'Buy Advanced Security': '購買進階安全性',
    'Contact sales': '聯絡銷售人員',
    'Download CSV report': '下載 CSV 報告',
    'Download CSV report for Advanced Security': '下載進階安全性的 CSV 報告',
    'Manage Advanced Security': '管理進階安全性',
    'Disable Advanced Security': '停用進階安全性',
    'Disable Advanced Security for this organization': '為此組織停用進階安全性',
    'This will disable Advanced Security, including Secret Protection and Code Security for private and internal repositories.':
      '這會為私人和內部儲存庫停用進階安全性，包括機密保護和程式碼安全性。',
    'Public repositories will remain protected for free': '公開儲存庫仍會免費受到保護',
    'Advanced Security features will be disabled on all private and internal repositories': '所有私人和內部儲存庫都將停用進階安全性功能',
    'Any default security configurations that enable Advanced Security will be removed': '啟用進階安全性的所有預設安全性設定都將移除',
    'To re-enable Advanced Security in the future, you can configure it under your organization security settings.':
      '日後若要重新啟用進階安全性，可在組織安全性設定中設定此功能。',
    'Start trial': '開始試用',
    'Starting trial': '正在開始試用',
    // <p>「Your trial includes all Secret Protection and Code Security」<a>features</a><span>for repositories in your organization.</span></p>
    // 原文无逗号：适用范围前移到第一段，末段只留句号
    'Your trial includes all Secret Protection and Code Security': '試用為組織中的儲存庫提供所有機密保護和程式碼安全性',
    features: '功能',
    'for repositories in your organization.': '。',
    Trial: '試用',
    'Trial expired': '試用已到期',
    'Consumed licenses': '已使用的授權',
    'Consumed seats': '已使用的席次',
    'Licenses used': '已使用的授權',
    'About Advanced Security consumed licenses': '關於進階安全性已使用的授權',
    'Active committers who contributed to at least one private organization-owned or user-owned repository.':
      '至少為一個組織或使用者擁有的私人儲存庫做出貢獻的活躍提交者。',
    'Estimated monthly payment': '預估每月付款金額',
    'Estimated yearly payment': '預估每年付款金額',
    'Payment breakdown': '付款明細',
    'View billing details': '查看帳單詳細資料',
    'Code Quality licenses': '程式碼品質授權',
    'About Code Quality consumed licenses': '關於程式碼品質已使用的授權',
    'Unique, active committers to repositories with Code Quality enabled consume Code Quality licenses.':
      '向已啟用程式碼品質的儲存庫提交的每位活躍提交者各使用一個程式碼品質授權。',
    'Learn more about Code Quality consumed licenses': '瞭解程式碼品質已使用的授權',
    'Download CSV report for Code Quality': '下載程式碼品質的 CSV 報告',
    'View AI usage': '查看 AI 使用量',
    'View AI usage for Code Quality': '查看程式碼品質的 AI 使用量',
    'Manage Code Quality': '管理程式碼品質',
    'Loading summaries': '正在載入摘要',
    'License usage and payment summaries cannot be loaded': '無法載入授權使用量和付款摘要',
    // 「…if the problem persists,」+「contact support」+「.」
    'The license usage and payment summaries are currently unavailable due to a system error. Try reloading the page, or if the problem persists,':
      '由於系統錯誤，目前無法顯示授權使用量和付款摘要。請嘗試重新載入頁面，若問題持續發生，請'
  },
  regexp: [
    // 成员请求：标题与升级横幅（「octo-org is on the」+「Free organization plan」）；方案名译成中文
    [/^Member requests for GitHub (Team|Enterprise)$/, (_, plan: string) => `GitHub ${PLANS[plan]}的成員請求`],
    [/^(Team|Enterprise) Features$/, (_, plan: string) => `${PLANS[plan]}功能`],
    [/^([\w.-]+) is on the$/, '$1 目前使用'],
    [
      /^(GitHub )?(Free|Team|Enterprise) organization plan$/,
      (_, github: string | undefined, plan: string) => `${github ? 'GitHub ' : ''}${PLANS[plan]}組織方案`
    ],
    [/^View ([A-Z][\w .-]{0,59}) docs$/, (_, name: string) => joinCjk(joinCjk('查看', translatePlan(name)), '說明文件')],
    // 改为主动句：管理員已於 <日期> 拒絕你對 <名称> 的請求。
    [
      new RegExp(`^Your request for ([\\w .-]{1,80}) was declined by an admin on (${DATE_SOURCE})\\.$`),
      (_, feature: string, date: string) =>
        joinCjk(joinCjk(joinCjk(joinCjk('管理員已於', translateTime(date)), '拒絕你對'), translatePlan(feature)), '的請求。')
    ],
    // 席次与帐务管理员（人用量词「位」）
    [/^(\d+) seats?$/, '$1 個席次'],
    [/^(\d+) of (\d+) seats? used$/, '已使用 $1/$2 個席次'],
    [/^(\d+) billing managers?$/, '$1 位帳務管理員'],

    // 总览卡片说明：Gross metered usage for Oct 1 - Oct 31, 2025.（句号随原文）
    // 折扣一句用「期間」连接，避免「…的包含的…」：10月1日 - 2025年10月31日期間包含的使用量折扣
    [
      new RegExp(`^(Gross metered usage|Included usage discounts) for (${DATE_SOURCE}) - (${DATE_SOURCE})(\\.?)$`),
      (_, kind: string, start: string, end: string, dot: string) => {
        const label = kind === 'Gross metered usage' ? '的計量使用量總額' : '期間包含的使用量折扣'
        return `${joinCjk(dateRange(start, end), label)}${dot ? '。' : ''}`
      }
    ],
    [
      new RegExp(`^Current usage for (${DATE_SOURCE}) - (${DATE_SOURCE})\\. Monthly quota resets in (\\d+) day\\(s\\)\\.$`),
      (_, start: string, end: string, days: string) => `${joinCjk(dateRange(start, end), '的目前使用量。')}每月配額將在 ${days} 天後重設。`
    ],
    [
      new RegExp(`^Resets in (\\d+) days? on (${DATE_SOURCE})$`),
      (_, days: string, date: string) => joinCjk(joinCjk(`${days} 天後於`, translateTime(date)), '重設')
    ],
    [
      /^Included usage limits reset in (\d+) days?(\.?)$/,
      (_, days: string, dot: string) => `包含的使用量上限將在 ${days} 天後重設${dot ? '。' : ''}`
    ],
    [/^(\d+) days?$/, '$1 天'],

    // 金额、优惠券与使用量
    // 「~$3.00 off*」中的约数符号与脚注星号随原文（与个人帐务一致）
    [
      new RegExp(`^(~?)${MONEY} off(\\*?)$`),
      (_, tilde: string, amount: string, star: string) => `折抵${tilde ? '約' : ''} ${amount}${star}`
    ],
    [new RegExp(`^${MONEY} off per month for (\\d+) years?$`), '$2 年內每月折抵 $1'],
    [
      new RegExp(`^${MONEY} off per month until (${DATE_SOURCE})(\\.?)$`),
      (_, amount: string, date: string, dot: string) => `${joinCjk(translateTime(date), '前每月折抵')} ${amount}${dot ? '。' : ''}`
    ],
    // 优惠券期限在单独元素中：“$4.00 off per month” + “until Dec 31, 2026.”
    [new RegExp(`^${MONEY} off per month$`), '每月折抵 $1'],
    [
      new RegExp(`^until (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk('至', translateTime(date))}${dot ? '。' : ''}`
    ],
    [new RegExp(`^${NUMBER} min used / ${NUMBER} min included$`), '已使用 $1 分鐘 / 包含 $2 分鐘'],
    [new RegExp(`^${NUMBER} GB used / ${NUMBER} GB included$`), '已使用 $1 GB / 包含 $2 GB'],
    [new RegExp(`^${NUMBER} included Actions minutes$`), '包含 $1 動作分鐘數'],
    [
      new RegExp(`^${NUMBER} GB included (${Object.keys(INCLUDED_ITEMS).join('|')})$`),
      (_, amount: string, item: string) => `包含 ${amount} GB ${INCLUDED_ITEMS[item] ?? item}`
    ],
    [new RegExp(`^${NUMBER} included Codespaces core hours$`), '包含 $1 程式碼空間核心時數'],
    [/^Discount for usage in public repositories \((\d+%) off\)$/, '公開儲存庫使用量折扣（減免 $1）'],
    [/^Based on (\d[\d,]*) additional premium requests? beyond your included usage\.$/, '依據超出所含使用量的 $1 個額外進階請求。'],
    // AI 點數计数不加量词：額外 1,500 AI 點數
    [/^Based on (\d[\d,]*) additional AI credits? beyond your included usage\.$/, '依據超出所含使用量的額外 $1 AI 點數。'],
    [
      /^Cost calculated based on additional (\d[\d,]*) premium requests? for Copilot and Spark\.$/,
      '費用依 Copilot 和 Spark 的 $1 個額外進階請求計算。'
    ],
    [
      /^Cost calculated based on additional (\d[\d,]*) premium requests?(\.?)$/,
      (_, count: string, dot: string) => `費用依 ${count} 個額外進階請求計算${dot ? '。' : ''}`
    ],
    [
      /^Cost calculated based on additional (\d[\d,]*) token units?(\.?)$/,
      (_, count: string, dot: string) => `費用依 ${count} 個額外權杖單位計算${dot ? '。' : ''}`
    ],
    [
      /^Cost calculated based on (\d[\d,]*) Spark premium requests? that exceed the premium request usage included with your Copilot licenses\.$/,
      '費用依超出 Copilot 授權所含進階請求使用量的 $1 個 Spark 進階請求計算。'
    ],
    [/^\/ (\d[\d,]*) AI credits$/, '/ $1 AI 點數'],

    // 使用量按 SKU 分组时核数可变的 SKU 名（与个人帐务一致）：Actions macOS 3-core、Codespaces compute 2-core
    [/^Actions (Linux|Windows|macOS) (\d+)-core$/, '動作 $1 $2 核心'],
    [/^Codespaces compute (\d+)-core$/, '程式碼空間的運算 $1 核心'],

    // 使用量明细表中的数量与单位
    [/^(\d[\d,]*) requests?$/, '$1 個請求'],
    [new RegExp(`^${NUMBER} min$`), '$1 分鐘'],
    [new RegExp(`^${NUMBER} hr$`), '$1 小時'],
    [new RegExp(`^${NUMBER} GB-hr$`), '$1 GB·小時'],

    // 方案价格
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?month$/, '$1/月'],
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?year$/, '$1/年'],
    [/^(\$[\d,]+(?:\.\d{2})?) per month$/, '每月 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) per year$/, '每年 $1'],

    // 计量使用量：时间范围、分组、图表标题（年份括号内只有数字，用半形，前面加空格）
    [
      /^(?:Timeframe|Time [Ff]rame): (Today|Current month|Last month|Custom|Custom range|This year|Last year)(?: \((\d{4})\))?$/,
      (_, period: string, year: string) => `時間範圍：${TIMEFRAMES[period] ?? period}${year ? ` (${year})` : ''}`
    ],
    [/^(This year|Last year) \((\d{4})\)$/, (_, period: string, year: string) => `${TIMEFRAMES[period] ?? period} (${year})`],
    // 分组按钮：Group: None、Group by: Product（Group by → 分組依據，与个人帐务一致）
    [
      /^Group( by)?: (None|Products?|SKUs?|Repositor(?:y|ies)|Models?|Organizations?|Users?|Cost center)$/,
      (_, by: string | undefined, group: string) => `${by ? '分組依據' : '分組'}：${GROUPS[group] ?? group}`
    ],
    [
      /^(Metered usage|AI usage|Actions usage|Copilot usage|Codespaces usage|Git_lfs usage|Git LFS usage|Packages usage|Models usage|Spark usage|Advanced Security usage) grouped by (Products?|SKUs?|Repositor(?:y|ies)|Models?|Organizations?|Users?)$/,
      (_, product: string, group: string) => joinCjk(`${groupedBy(group)}的`, USAGE_PRODUCTS[product] ?? product)
    ],
    [
      /^Top (two|three|four|five) repositories (today|this month|last month|this year|last year)$/,
      (_, count: string, period: string) => `${PERIODS[period] ?? period}前${ORDINALS[count] ?? count}名的儲存庫`
    ],
    [new RegExp(`^(${DATE_SOURCE}) \\(All times in UTC\\)$`), (_, date: string) => `${translateTime(date)}（所有時間皆為 UTC）`],
    [
      new RegExp(`^Usage for (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk(translateTime(date), '的使用量')}${dot ? '。' : ''}`
    ],
    // 卡片中单独显示的日期范围：Oct 1 - Oct 31, 2025
    [new RegExp(`^(${DATE_SOURCE}) - (${DATE_SOURCE})$`), (_, start: string, end: string) => dateRange(start, end)],

    // 预算
    [/^(\d+) budgets?$/, '$1 個預算'],
    [new RegExp(`^${MONEY} spent$`), '已支出 $1'],
    [new RegExp(`^${MONEY} budget$`), '預算 $1'],
    [/^(\d+) selected$/, '已選取 $1 個'],

    // 使用量报告
    [
      /^We['’]re preparing your usage report\. It may take ~30 minutes to see usage in your report\. We['’]ll send an email to (\S+@\S+) when it['’]s ready\.$/,
      '正在準備使用量報告。使用量可能約 30 分鐘後才會出現在報告中。報告準備好後我們會傳送電子郵件至 $1。'
    ],
    [
      /^We['’]re preparing your usage report\. We['’]ll send an email to (\S+@\S+) when it['’]s ready\.$/,
      '正在準備使用量報告。報告準備好後我們會傳送電子郵件至 $1。'
    ],
    [
      /^Your usage report request is already in progress\. Check (\S+@\S+) for the report when it['’]s ready\.$/,
      '你的使用量報告請求已在處理中。報告準備好後請至 $1 查收。'
    ],
    [/^The usage report will be emailed when it['’]s ready to (\S+@\S+)\.$/, '報告準備好後會以電子郵件傳送至 $1。'],

    // 授权：试用、授权使用量与付款说明（相邻文本节点拼接后匹配）
    [/^Learn more about (Secret Protection|Code Security)$/, (_, product: string) => `瞭解${PRODUCTS[product]}`],
    [/^Try free for (\d+) days?$/, '免費試用 $1 天'],
    [/^Start your free (\d+) day trial$/, '開始 $1 天免費試用'],
    [
      /^You can convert to a paid plan at any time\. If you don[’']t purchase by the end of (\d+) days, your trial will expire and all private repositories will lose access to Secret Protection and Code Security features\.$/,
      '你可以隨時轉換為付費方案。如果在 $1 天內未購買，試用將到期，所有私人儲存庫都將無法使用機密保護和程式碼安全性功能。'
    ],
    // 卡片底部的试用期限：Trial ends on October 31, 2026.
    [
      new RegExp(`^Trial (ends|ended) on (${DATE_SOURCE})\\.$`),
      (_, verb: string, date: string) => joinCjk(joinCjk(verb === 'ends' ? '試用將於' : '試用已於', translateTime(date)), '結束。')
    ],
    [/^([\d,]+) available$/, '$1 個可用'],
    [
      /^Amount based on ([\d,]+) (billable|purchased) licenses?\.$/,
      (_, count: string, kind: string) => `金額依 ${count} 個${kind === 'billable' ? '可計費' : '已購買的'}授權計算。`
    ],
    [
      new RegExp(`^Amount based on ([\\d,]+) billable licenses?, due by (${DATE_SOURCE})\\.$`),
      (_, count: string, date: string) => `金額依 ${count} 個可計費授權計算，${joinCjk(joinCjk('應於', translateTime(date)), '前支付。')}`
    ],
    [/^(\$[\d,]+\.\d{2})\/month each$/, '每個 $1/月'],
    // 付款明细中各产品的授权数：3 Secret Protection licenses、1 GitHub Advanced Security license
    [
      /^([\d,]+) (GitHub )?(Advanced Security|Secret Protection|Code Security|Code Quality) licenses?$/,
      (_, count: string, github: string | undefined, product: string) =>
        `${count} 個${github ? ' GitHub ' : ''}${PRODUCTS[product] ?? product}授權`
    ]
  ]
} satisfies PageDictionary
