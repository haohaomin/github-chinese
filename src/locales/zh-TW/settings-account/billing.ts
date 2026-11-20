import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 日期范围：Oct 1 - Oct 31, 2026 */
const DATE_RANGE_RE = new RegExp(`^(${DATE_SOURCE}) - (${DATE_SOURCE})$`)

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
  'Cost center': '成本中心',
  'Cost centers': '成本中心'
}

/** 分组名的译名，大小写不敏感（图表标题有 “grouped by skus”）；未知分组返回 undefined */
function groupName(group: string): string | undefined {
  const lower = group.toLowerCase()
  const key = Object.keys(GROUPS).find(name => name.toLowerCase() === lower)
  return key === undefined ? undefined : GROUPS[key]
}

/** 图表标题中的分组说明：「依產品分組」，英文名两侧加空格「依 SKU 分組」（与 org-settings/billing.ts 一致） */
export function groupedBy(group: string): string {
  return joinCjk(joinCjk('依', groupName(group) ?? group), '分組')
}

/**
 * 使用量图表标题中的产品名（“Actions usage grouped by SKU”）；产品名按用户规定译成中文，品牌词 Copilot、Spark、Git LFS 保留。
 * usage 按术语表作「使用量」，与 org-settings/billing.ts 同译
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
  'Advanced Security usage': '進階安全性使用量',
  'Premium request usage': '進階請求使用量',
  'Premium requests usage': '進階請求使用量'
}

const USAGE_PRODUCT_SOURCE = Object.keys(USAGE_PRODUCTS).join('|')
/** 分组名（大小写混用：“grouped by SKU”“grouped by skus”） */
const GROUP_SOURCE = '(?:[Pp]roducts?|SKUs?|skus?|[Rr]epositor(?:y|ies)|[Mm]odels?|[Oo]rganizations?|[Uu]sers?|[Cc]ost centers?)'
const USAGE_TITLE_RE = new RegExp(`^(${USAGE_PRODUCT_SOURCE}) grouped by (${GROUP_SOURCE})$`)

/** 使用量图表标题：「Metered usage」→「計量使用量」；「Actions usage grouped by SKU」→「依 SKU 分組的動作使用量」 */
function usageTitle(title: string): string {
  const grouped = USAGE_TITLE_RE.exec(title)
  if (grouped) return joinCjk(`${groupedBy(grouped[2]!)}的`, USAGE_PRODUCTS[grouped[1]!] ?? grouped[1]!)
  return lookup(USAGE_PRODUCTS, title) ?? title
}

/** 只查自有键：自由文本作键时避免命中 constructor 等原型链属性 */
function lookup(record: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined
}

/** 图表无障碍描述（Highcharts）中的图表类型与坐标轴名；图表类型取微软繁中（Excel）的名称 */
const CHART_TYPES: Readonly<Record<string, string>> = {
  Line: '折線圖',
  Spline: '曲線圖',
  Area: '區域圖',
  Bar: '橫條圖',
  Column: '直條圖',
  Pie: '圓形圖'
}
const AXIS_NAMES: Readonly<Record<string, string>> = {
  Time: '時間',
  Date: '日期',
  Billing: '計費金額',
  Usage: '使用量',
  Amount: '金額'
}

/** 预算的范围类型与预算名（“View actions for All AI Credit SKUs budget for Account mona”）：按 SKU 汇总的预算名与产品名 */
const BUDGET_SCOPES: Readonly<Record<string, string>> = {
  Account: '帳號',
  Organization: '組織',
  Enterprise: '企業',
  Repository: '儲存庫',
  'Cost center': '成本中心'
}
const BUDGET_NAMES: Readonly<Record<string, string>> = {
  'All AI Credit SKUs': '所有 AI 點數 SKU',
  'All Premium Request SKUs': '所有進階請求 SKU',
  Actions: '動作',
  Codespaces: '程式碼空間',
  Packages: '套件',
  Models: '模型',
  'Advanced Security': '進階安全性',
  'Shared Storage': '共用儲存空間'
}

/** 依次拼接各段，中英文相接处加空格 */
function joinAll(...parts: readonly string[]): string {
  return parts.reduce((left, right) => joinCjk(left, right), '')
}

/** 时间范围：预设项或日期范围（“Current month”“Oct 1 - Oct 31, 2026”） */
function periodName(period: string): string {
  const preset = lookup(TIMEFRAMES, period)
  if (preset !== undefined) return preset
  const range = DATE_RANGE_RE.exec(period)
  return range ? `${translateTime(range[1]!)} - ${translateTime(range[2]!)}` : translateTime(period)
}

/** 排名：Top three → 前三名（two 作「兩」：前兩名；与 org-settings/billing.ts 一致） */
const ORDINALS: Readonly<Record<string, string>> = { two: '兩', three: '三', four: '四', five: '五' }

/** 包含的使用量明细项（“2 GB included Packages storage”；与 org-settings/billing.ts 同译） */
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

/**
 * 帐务总览、计量使用量、AI 使用量与进阶请求分析、预算和警示（/settings/billing、/usage、/ai_usage、
 * /premium_requests_usage、/budgets）。组织帐务的同名页面与此共用，词条放 static。
 * 「Manage budgets」由 common 收录；图表选单（Chart options、View as table、Download CSV / PNG）、
 * 「Choose date...」「No expiration」由其他词典收录。
 * 术语（按术语表 billing 行，与 org-settings/billing.ts 一致）：功能区作「帳務」，账单内容作「帳單」（帳單週期），
 * 收费方式作「計費」（依用量計費、可計費）；metered usage → 計量使用量，license（计费）→ 授權，
 * AI credits → AI 點數，premium requests → 進階請求，off（优惠）→ 折抵（百分比作「減免」），threshold → 門檻。
 */
export default {
  static: {
    // 总览
    'For more information on using these billing pages': '如需瞭解這些帳務頁面的使用方式',
    'please refer to the docs content here': '請參閱這裡的說明文件內容',
    'Current metered usage': '目前計量使用量',
    'Showing gross metered usage for your account.': '顯示你帳號的計量使用量總額。',
    'Showing gross metered usage for your organization.': '顯示你組織的計量使用量總額。',
    'Current included usage': '目前包含的使用量',
    'Showing currently applied discounts for your account.': '顯示你帳號目前適用的折扣。',
    'Showing currently applied discounts for your organization.': '顯示你組織目前適用的折扣。',
    'Showing currently applied usage and credits for your account.': '顯示你帳號目前適用的使用量和點數。',
    'Showing currently applied usage and credits for your organization.': '顯示你組織目前適用的使用量和點數。',
    // 卡片说明的日期在单独元素中时
    'Gross metered usage for': '計量使用量總額',
    'Included usage discounts for': '包含的使用量折扣',
    'More details': '更多詳細資料',
    '* As per current pricing': '* 依目前定價',
    // 「Download your Copilot premium request usage report <a>here</a>.」（here 见 scoped）
    'Download your Copilot premium request usage report': '若要下載 Copilot 進階請求使用量報告請按一下',
    'Included usage and credits': '包含的使用量和點數',
    'Included usage*': '包含的使用量*',
    'Included premium requests': '包含的進階請求',
    'Included premium requests consumed': '已使用的所含進階請求',
    'Billed premium requests': '已計費的進階請求',
    'Free usage**': '免費使用量**',
    '100% off per month': '每月減免 100%',
    '* Included usage is an approximate amount based on current pricing.': '* 包含的使用量是依目前定價估算的近似值。',
    '** GitHub Packages usage is free for public packages. For details on free Actions usage, see':
      '** 公開套件的 GitHub 套件使用量免費。如需動作免費使用量的詳細資訊，請參閱',
    'Free use of GitHub Actions': '免費使用 GitHub 動作',
    'Next payment due': '下次應付款項',
    'Manage subscriptions': '管理訂閱',
    'Usage by products': '依產品統計的使用量',
    'Billable usage': '可計費使用量',
    'consumed usage': '已耗用使用量',
    discounts: '折扣',
    // 产品说明（原文无逗号，译文不加）
    'Billable spend for Actions and Actions Runners for the selected timeframe. Applicable discounts cover Actions usage in public repositories and included usage for Actions minutes and storage.':
      '所選時間範圍內動作和動作執行器的可計費支出。適用的折扣涵蓋公開儲存庫中的動作使用量以及動作分鐘數和儲存空間的包含使用量。',
    'Billable spend for Codespaces for the selected timeframe.': '所選時間範圍內程式碼空間的可計費支出。',
    'Billable spend for Sandbox for the selected timeframe.': '所選時間範圍內沙箱的可計費支出。',
    'Billable spend for Git LFS for the selected timeframe. Applicable discounts cover included usage for Git LFS bandwidth and storage.':
      '所選時間範圍內 Git LFS 的可計費支出。適用的折扣涵蓋 Git LFS 頻寬和儲存空間的包含使用量。',
    'Billable spend for Packages for the selected timeframe. Applicable discounts cover Packages usage in public repositories and included usage for Packages data transfer and storage.':
      '所選時間範圍內套件的可計費支出。適用的折扣涵蓋公開儲存庫中的套件使用量以及套件資料傳輸和儲存空間的包含使用量。',
    'Included usage': '包含的使用量',
    'Actions minutes': '動作分鐘數',
    'Git LFS bandwidth': 'Git LFS 頻寬',
    'Git LFS storage': 'Git LFS 儲存空間',
    'Packages data transfer': '套件資料傳輸',
    'Packages storage': '套件儲存空間',
    'Actions storage': '動作儲存空間',
    'Codespaces storage': '程式碼空間的儲存空間',
    'Codespaces compute': '程式碼空間的運算',
    'Included usage limits reset in': '距離包含的使用量上限重設還有',
    'All usage': '所有使用量',
    'Gross:': '總額：',
    'Billed:': '已計費：',
    'Discount:': '折扣：',
    'Usage by repository': '依儲存庫統計的使用量',
    'Gross amount': '總額',
    'Billed amount': '計費金額',
    'All other repositories': '所有其他儲存庫',
    'All other': '其他',
    'No usage found': '找不到使用量',
    'No usage': '沒有使用量',
    'No usage data found for the selected filters.': '在所選篩選器下找不到使用量資料。',
    'Products selector': '產品選擇器',
    'Products selector navigation': '產品選擇器導覽',
    'Open repository usage options': '開啟儲存庫使用量選項',
    'Total billable usage after subtracting discounts from consumed usage': '已耗用使用量扣除折扣後的可計費使用量總額',
    'Advanced Security usage': '進階安全性使用量',
    'Total gross spend on GitHub Advanced Security AI credits for the selected timeframe.':
      '所選時間範圍內 GitHub 進階安全性 AI 點數的總支出。',
    'Showing total unique licenses billed for your enterprise. Actual billed amount for each license is prorated based on when it is added during the billing cycle.':
      '顯示為你的企業計費的不重複授權總數。每個授權的實際計費金額依其在帳單週期內新增的時間按比例計算。',
    // 计量使用量：搜寻框、图表与明细表（清除按钮的名称为 “Clear ” + 搜寻框占位文字）
    'Search or filter usage (chart updates as you type)': '搜尋或篩選使用量（圖表會隨輸入更新）',
    'Clear Search or filter usage (chart updates as you type)': '清除搜尋或篩選',
    'Show Usage': '顯示使用量',
    'Show Usage Breakdown': '顯示使用量明細',
    'Hide Usage Breakdown': '隱藏使用量明細',
    'Usage breakdown table (scrollable)': '使用量明細表（可捲動）',
    'Chart view': '圖表檢視',
    'consumed usage -': '已耗用使用量 -',
    'in discounts =': '折扣 =',
    'in billable usage': '可計費使用量',
    'Usage for Actions and Actions Runners.': '動作和動作執行器的使用量。',
    'Copilot usage': 'Copilot 使用量',
    'Actions usage': '動作使用量',
    'Codespaces usage': '程式碼空間使用量',
    'Git LFS usage': 'Git LFS 使用量',
    'Git_lfs usage': 'Git LFS 使用量',
    'Packages usage': '套件使用量',
    'Free Codespaces usage per organization': '每個組織的免費程式碼空間使用量',
    'Total spend on Copilot for the selected timeframe, excluding applicable discounts.':
      '所選時間範圍內 Copilot 的總支出，不含適用的折扣。',
    'Total gross spend on Copilot for the selected timeframe including licenses and AI Credits.':
      '所選時間範圍內包括授權和 AI 點數在內的 Copilot 總支出。',
    'Total gross spend on Copilot for the selected timeframe including licenses and AI credits.':
      '所選時間範圍內包括授權和 AI 點數在內的 Copilot 總支出。',
    'Total gross spend on GitHub Advanced Security for the selected timeframe including licenses and AI credits.':
      '所選時間範圍內包括授權和 AI 點數在內的 GitHub 進階安全性總支出。',
    'Spark AI credits': 'Spark AI 點數',
    // 操作用量：存储计费说明；按存储库统计的「其他所有使用量」及其提示
    'GitHub Actions storage billing': 'GitHub 動作儲存空間計費',
    'GitHub Actions storage billing operates on an hourly accrual model.': 'GitHub 動作儲存空間按小時累計計費。',
    'Learn more about Actions Storage': '瞭解動作儲存空間',
    'All other usage': '所有其他使用量',
    'About all other usage by repository': '關於依儲存庫統計的所有其他使用量',
    "Includes usage from all other repositories, plus usage that isn't tied to a repository, such as licenses and Copilot.":
      '包括所有其他儲存庫的使用量，以及授權、Copilot 等未與儲存庫關聯的使用量。',
    'Includes usage from all other repositories, plus usage that isn’t tied to a repository, such as licenses and Copilot.':
      '包括所有其他儲存庫的使用量，以及授權、Copilot 等未與儲存庫關聯的使用量。',
    'Billable licenses': '可計費授權',
    'Billable licenses info': '可計費授權資訊',
    "If a user stops consuming a license within the month, the adjustment will be reflected in your next month's bill.":
      '如果使用者在當月停止使用授權，調整將反映在下個月的帳單中。',
    "Billable licenses are only available for the 'Current month' timeframe.": '可計費授權僅適用於「本月」時間範圍。',
    'Learn more about billable licenses': '瞭解可計費授權',
    'Copilot premium requests': 'Copilot 進階請求',
    'About Copilot premium requests': '關於 Copilot 進階請求',
    'If enabled, additional premium requests beyond the included amount for each license will be billed.':
      '啟用後，超出每個授權所含數量的額外進階請求將另行計費。',
    'Manage Copilot policy': '管理 Copilot 政策',
    'Spark premium requests': 'Spark 進階請求',
    'About GitHub Models rate limits': '關於 GitHub 模型速率限制',
    'GitHub Models rate limits': 'GitHub 模型速率限制',
    // playground（GitHub 模型的功能名）取微软繁中（Azure AI Foundry）的「遊樂場」
    'The playground and free API usage are rate limited by requests per minute, requests per day, tokens per request, and concurrent requests.':
      '遊樂場和免費 API 的使用量受每分鐘請求數、每日請求數、每個請求的權杖數和並行請求數的速率限制。',
    'Learn more about GitHub Models rate limits': '瞭解 GitHub 模型速率限制',
    'GitHub Copilot is moving to AI credits': 'GitHub Copilot 將改用 AI 點數計費',
    'Starting June 1, 2026 Copilot usage will be measured and billed in AI credits instead of Premium request units. AI credits give you more granular visibility into your usage across models and features. Preview how this change will affect your billing based on your recent usage.':
      '自 2026年6月1日起，Copilot 使用量將改以 AI 點數而非進階請求單位計量並計費。AI 點數可讓你更精細地掌握各模型和功能的使用量。依據你近期的使用量預覽此變更對計費的影響。',
    'Preview your usage': '預覽你的使用量',
    'Read the blog post': '閱讀部落格文章',

    // 使用量按 SKU 分组时的 SKU 名（核数可变的见 regexp）
    'Actions Linux': '動作 Linux',
    'Actions Windows': '動作 Windows',
    'Copilot Premium Request': 'Copilot 進階請求',

    // 程式碼空間使用量提醒（Codespaces / codespace → 程式碼空間）
    "You've used 90% of included services for GitHub Codespaces storage.": '你已使用 GitHub 程式碼空間的儲存空間所含服務的 90%。',
    "You've used 100% of included services for GitHub Codespaces storage.": '你已使用 GitHub 程式碼空間的儲存空間所含服務的 100%。',
    'Update spending limit': '更新支出上限',
    // 免费额度用完说明：被 “export your unpushed work to a branch.”“usage report” 等链接拆开（逗号数随原文）
    "When your allotment is exhausted, you won't be able to use Codespaces until you set up a spending limit or your free Codespaces allotment is reset next month. If you want to access your in progress work from a codespace, you can":
      '額度用完後將無法使用程式碼空間，直到你設定支出上限或免費程式碼空間額度於下個月重設為止。如果要存取程式碼空間中尚未完成的工作，你可以',
    'When your allotment is exhausted, you won’t be able to use Codespaces until you set up a spending limit or your free Codespaces allotment is reset next month. If you want to access your in progress work from a codespace, you can':
      '額度用完後將無法使用程式碼空間，直到你設定支出上限或免費程式碼空間額度於下個月重設為止。如果要存取程式碼空間中尚未完成的工作，你可以',
    'export your unpushed work to a branch.': '將尚未推送的工作匯出到分支。',
    'To see a full list of your usage, obtain a copy of your': '若要查看完整的使用量清單，請取得你的',
    'usage report': '使用量報告',
    // 前面是 “usage report” 链接和空格，译文不以标点开头
    "to see the codespaces and prebuilds created by your account. The usage report is the only place where prebuild usage is visible. If you see charges you'd like to stop going forward, you can delete a":
      '以查看你的帳號建立的程式碼空間和預先建置。只有使用量報告會顯示預先建置的使用量。如果想停止往後的某些費用，你可以刪除',
    'to see the codespaces and prebuilds created by your account. The usage report is the only place where prebuild usage is visible. If you see charges you’d like to stop going forward, you can delete a':
      '以查看你的帳號建立的程式碼空間和預先建置。只有使用量報告會顯示預先建置的使用量。如果想停止往後的某些費用，你可以刪除',
    'delete prebuilds for a repository.': '刪除儲存庫的預先建置。',

    // 使用量报告
    'Get usage report': '取得使用量報告',
    'Metered billing usage report': '依用量計費的使用量報告',
    'Provides a breakdown of all metered usage': '提供所有計量使用量的明細',
    'Select report type:': '選擇報告類型：',
    'Metered usage by repository for up to 1 year': '依儲存庫統計最長 1 年的計量使用量',
    'Metered usage by username and workflow for up to 31 days': '依使用者名稱和工作流程統計最長 31 天的計量使用量',
    'Select time frame': '選擇時間範圍',
    'Up to 1 year': '最長 1 年',
    'Up to 31 days': '最長 31 天',
    'Choose date…': '選擇日期…',
    'Email me the report': '以電子郵件傳送報告給我',
    'Copilot premium requests usage report': 'Copilot 進階請求使用量報告',
    'Provides a per user breakdown of requests exhausted and their monthly quota for the current billing period.':
      '依使用者列出目前帳單期間內已耗用的請求數和每月配額。',
    'Search or filter usage': '搜尋或篩選使用量',
    'For license-based products, the price/unit is a prorated portion of the monthly price.':
      '對於依授權計費的產品，單價為按比例分攤的月費。',
    'Usage breakdown': '使用量明細',
    'Price/unit': '單價',
    'Loading usage breakdown…': '正在載入使用量明細…',
    'Loading usage breakdown...': '正在載入使用量明細...',
    'Loading Actions data...': '正在載入動作資料...',
    'Loading Packages data...': '正在載入套件資料...',
    'Loading Shared Storage data...': '正在載入共用儲存空間資料...',
    'Loading Codespaces data...': '正在載入程式碼空間資料...',

    // AI 使用量、进阶请求分析
    'Included credits': '包含的點數',
    'About included credits': '關於包含的點數',
    'Additional usage': '額外使用量',
    'About Additional Usage': '關於額外使用量',
    'About additional usage': '關於額外使用量',
    'Edit budget': '編輯預算',
    'Model usage': '模型使用量',
    Overage: '超額',
    'Additional credits': '額外點數',
    'About Copilot AI credits': '關於 Copilot AI 點數',
    'If enabled, your account will be billed for additional AI credits usage after your included credits have been exhausted.':
      '啟用後，額外的 AI 點數使用量會在包含的點數用完後向你的帳號計費。',
    'If enabled, your enterprise will be billed for additional AI credits usage after your included credits have been exhausted.':
      '啟用後，額外的 AI 點數使用量會在包含的點數用完後向你的企業計費。',
    'Code Review model': '程式碼審查模型',
    'Coding Agent model': '程式開發代理模型',
    'Each GitHub AI credit costs $0.01.': 'GitHub AI 點數每點的費用為 $0.01。',
    'New Copilot AI Credits': '新的 Copilot AI 點數',
    'Overage spend': '超額支出',

    // 预算和警示
    'Account budgets': '帳號預算',
    'New budget': '新增預算',
    'Stop usage': '停止使用',
    spent: '已支出',
    // 预算表的栏名
    Spent: '已支出',
    budget: '預算',
    'Budget table': '預算表',
    'Loading budgets': '正在載入預算',
    'Filter scope': '篩選範圍',
    'Filter by scope, repository, product or SKU': '依範圍、儲存庫、產品或 SKU 篩選',
    'Clear Filter by scope, repository, product or SKU': '清除篩選器',
    'Included usage alerts:': '包含的使用量警示：',
    'Included usage alerts: On': '包含的使用量警示：開啟',
    'Included usage alerts: Off': '包含的使用量警示：關閉',
    'All AI Credit SKUs': '所有 AI 點數 SKU',
    'AI credits budget': 'AI 點數預算',
    'Set a budget for all SKUs that consume AI credits': '為所有耗用 AI 點數的 SKU 設定預算',
    'About GitHub Actions storage billing': '關於 GitHub 動作儲存空間計費',
    'Enable to use the this feature.': '啟用以使用此功能。',
    'Budgets let you set monthly usage limits for specific GitHub products or SKUs. If no budget is set, usage for that product is unlimited.':
      '預算可讓你為特定 GitHub 產品或 SKU 設定每月使用量上限。未設定預算時，該產品的使用量不受限制。',
    'SKU level budgets are only available for products that have > 1 SKU.': '只有 SKU 超過 1 個的產品才能設定 SKU 層級預算。',
    'Budgets and Alerts': '預算和警示',
    'New monthly budget': '新增每月預算',
    'Edit monthly budget': '編輯每月預算',
    'Create a budget to track spending for a selected product and scope.': '建立預算以追蹤所選產品和範圍的支出。',
    'Create a budget to track spending for a selected product and scope': '建立預算以追蹤所選產品和範圍的支出',
    'Payment method is missing': '缺少付款方式',
    'Please set up a valid payment method before creating or adjusting your budget.': '建立或調整預算前，請先設定有效的付款方式。',
    'Budget type': '預算類型',
    'Budget Type': '預算類型',
    'Set budget for either a product or individual SKU within a product.': '為產品或產品中的個別 SKU 設定預算。',
    'Set budget for either a product or individual SKU within a product': '為產品或產品中的個別 SKU 設定預算',
    'Product-level budget': '產品層級預算',
    'SKU-level budget': 'SKU 層級預算',
    'Bundled AI credits budget': 'AI 點數合併預算',
    'Enable billing to set a budget. See': '啟用計費後才能設定預算。請參閱',
    'Models policy configuration': '模型政策設定',
    'Select 1 product': '選擇 1 個產品',
    'Next: Configure budget': '下一步：設定預算',
    'All Premium Request SKUs': '所有進階請求 SKU',
    'A budget for all SKUs that consume premium requests': '涵蓋所有耗用進階請求的 SKU 的預算',
    'Supported SKUs:': '支援的 SKU：',
    'Coding Agent premium requests': '程式開發代理進階請求',
    'Budget scope': '預算範圍',
    'Select the scope of spending for this budget.': '選擇此預算的支出範圍。',
    'Scoped budgets track spending for a single repository': '範圍預算會追蹤單一儲存庫的支出',
    'Scoped budgets track spending for all repositories owned by your account': '範圍預算會追蹤你帳號擁有的所有儲存庫的支出',
    'Scoped budgets track all spending for your account': '範圍預算會追蹤你帳號的所有支出',
    'Search repository': '搜尋儲存庫',
    Budget: '預算',
    'Set a budget amount to track your spending on a monthly basis.': '設定預算金額以按月追蹤支出。',
    "Usage before budget creation isn't counted in the current billing cycle.": '建立預算前的使用量不會計入目前的帳單週期。',
    'Usage before budget creation isn’t counted in the current billing cycle.': '建立預算前的使用量不會計入目前的帳單週期。',
    'Budget amount': '預算金額',
    'Stop usage when budget limit is reached': '達到預算上限時停止使用',
    'Limit usage when budget limit is reached': '達到預算上限時限制使用',
    "Spending won't exceed your set budget": '支出不會超過你設定的預算',
    'Spending won’t exceed your set budget': '支出不會超過你設定的預算',
    'Get emails and GitHub notifications when your spending has reached 75%, 90%, and 100% of the budget threshold.':
      '支出達到預算門檻的 75%、90% 和 100% 時，接收電子郵件和 GitHub 通知。',
    'Receive emails when usage reaches 75%, 90%, and 100% of the budget amount.': '使用量達到預算金額的 75%、90% 和 100% 時接收電子郵件。',
    'Receive budget threshold alerts': '接收預算門檻警示',
    'Alert Recipients': '警示收件者',
    'Alert recipients': '警示收件者',
    'Included usage alerts': '包含的使用量警示',
    'Receive alerts when my included usage reaches 90% and 100%': '我的所含使用量達到 90% 和 100% 時接收警示',
    'End of current billing cycle': '目前帳單週期結束時',
    'Specific date': '指定日期',
    'Create budget': '建立預算',
    'Update budget': '更新預算',
    'Delete budget': '刪除預算',
    'Please add a payment method to use budgets.': '請新增付款方式以使用預算。'
  },
  scoped: {
    // 时间范围、报告类型、表格栏等单词（Current month 的全站 static 由 actions 词典提供，此处固定本页译法）
    'Current month': '本月',
    'Last month': '上個月',
    'Last year': '去年',
    'Custom range': '自訂範圍',
    // 时间范围按钮只显示标签时
    Timeframe: '時間範圍',
    'Time frame': '時間範圍',
    Summarized: '摘要',
    Detailed: '詳細',
    Legacy: '舊版',
    // AI 点数（安全公告的 Credits 是致谢，见 security/advisories）
    Credits: '點數',
    'AI Credits': 'AI 點數',
    Model: '模型',
    Units: '單位',
    Amount: '金額',
    Discount: '折扣',
    Requests: '請求數',
    Alerts: '警示',
    No: '否',
    Info: '資訊',
    // 使用量页的图表/表格检视切换
    Chart: '圖表',
    Showing: '顯示',
    SKUs: 'SKU',
    usage: '使用量',
    // 方案价格「$0 per month」中被拆开的单位
    per: '/',
    month: '月',
    year: '年',
    day: '天',
    // 分页「1 of 1」
    of: '/',
    // 「… usage report <a>here</a>.」
    here: '這裡',
    // 预算范围说明：「Select the <储存库> to include in this <预算>. You can only add/remove the <储存库> that you have access to.」
    // 第二句的限定语移到链接前：「…。你只能新增/移除你有權存取的 <储存库>。」
    'Select the': '選擇',
    'to include in this': '以納入此',
    '. You can only add/remove the': '。你只能新增/移除你有權存取的',
    'that you have access to.': '。'
  },
  regexp: [
    // 总览卡片说明：Gross metered usage for Oct 1 - Oct 31, 2025.（句号随原文）
    // 折扣一句用「期間」连接，避免「…的包含的…」（与 org-settings/billing.ts 一致）
    [
      new RegExp(`^(Gross metered usage|Included usage discounts) for (${DATE_SOURCE}) - (${DATE_SOURCE})(\\.?)$`),
      (_, kind: string, start: string, end: string, dot: string) =>
        `${joinCjk(
          `${translateTime(start)} - ${translateTime(end)}`,
          kind === 'Gross metered usage' ? '的計量使用量總額' : '期間包含的使用量折扣'
        )}${dot ? '。' : ''}`
    ],
    [
      new RegExp(`^Current usage for (${DATE_SOURCE}) - (${DATE_SOURCE})\\. Monthly quota resets in (\\d+) day\\(s\\)\\.$`),
      (_, start: string, end: string, days: string) =>
        `${joinCjk(`${translateTime(start)} - ${translateTime(end)}`, '的目前使用量')}。每月配額將在 ${days} 天後重設。`
    ],
    [
      new RegExp(`^Resets in (\\d+) days? on (${DATE_SOURCE})$`),
      (_, days: string, date: string) => joinAll(`${days} 天後於`, translateTime(date), '重設')
    ],
    [
      /^Included usage limits reset in (\d+) days?(\.?)$/,
      (_, days: string, dot: string) => `包含的使用量上限將在 ${days} 天後重設${dot ? '。' : ''}`
    ],
    [/^(\d+) days?$/, '$1 天'],
    // 金额与使用量：「~$3.00 off*」中的约数符号与脚注星号随原文
    [
      new RegExp(`^(~?)${MONEY} off(\\*?)$`),
      (_, tilde: string, amount: string, star: string) => `折抵${tilde ? '約' : ''} ${amount}${star}`
    ],
    [new RegExp(`^${MONEY} off per month for (\\d+) years?$`), '$2 年內每月折抵 $1'],
    [new RegExp(`^${NUMBER} min used / ${NUMBER} min included$`), '已使用 $1 分鐘 / 包含 $2 分鐘'],
    [new RegExp(`^${NUMBER} GB used / ${NUMBER} GB included$`), '已使用 $1 GB / 包含 $2 GB'],
    // 包含的使用量明细（产品名译成中文，与 org-settings/billing.ts 同一译法）
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
    // 使用量按 SKU 分组时核数可变的 SKU 名：Actions macOS 3-core、Codespaces compute 2-core
    [/^Actions (Linux|Windows|macOS) (\d+)-core$/, '動作 $1 $2 核心'],
    [/^Codespaces compute (\d+)-core$/, '程式碼空間的運算 $1 核心'],
    // 使用量明细表中的数量与单位
    [/^(\d[\d,]*) requests?$/, '$1 個請求'],
    [new RegExp(`^${NUMBER} min$`), '$1 分鐘'],
    [new RegExp(`^${NUMBER} hr$`), '$1 小時'],
    [new RegExp(`^${NUMBER} GB-hr$`), '$1 GB·小時'],
    // 计量使用量：时间范围、分组、图表标题（年份括号内只有数字，用半形，前面加空格）
    [
      /^(?:Timeframe|Time [Ff]rame): (Today|Current month|Last month|Custom|Custom range|This year|Last year)(?: \((\d{4})\))?$/,
      (_, period: string, year: string) => `時間範圍：${TIMEFRAMES[period] ?? period}${year ? ` (${year})` : ''}`
    ],
    [/^(This year|Last year) \((\d{4})\)$/, (_, period: string, year: string) => `${TIMEFRAMES[period] ?? period} (${year})`],
    // 分组按钮：Group: None、Group by: Product（Group by → 分組依據）
    [
      /^Group( by)?: (None|Products?|SKUs?|Repositor(?:y|ies)|Models?|Organizations?|Users?|Cost centers?)$/,
      (_, by: string, group: string) => `${by ? '分組依據' : '分組'}：${groupName(group) ?? group}`
    ],
    // 图表标题：Actions usage grouped by SKU、Advanced Security usage grouped by skus
    [USAGE_TITLE_RE, (_, product: string, group: string) => usageTitle(`${product} grouped by ${group}`)],
    [
      /^Top (two|three|four|five) repositories (today|this month|last month|this year|last year)$/,
      (_, count: string, period: string) => `${PERIODS[period] ?? period}前${ORDINALS[count] ?? count}名的儲存庫`
    ],
    [new RegExp(`^(${DATE_SOURCE}) \\(All times in UTC\\)$`), (_, date: string) => `${translateTime(date)}（所有時間皆為 UTC）`],
    [
      new RegExp(`^Usage for (${DATE_SOURCE})(?: - (${DATE_SOURCE}))?(\\.?)$`),
      (_, start: string, end: string | undefined, dot: string) =>
        `${joinCjk(periodName(end ? `${start} - ${end}` : start), '的使用量')}${dot ? '。' : ''}`
    ],
    // 使用量明细标题后接授权说明时
    [
      new RegExp(
        `^Usage for (${DATE_SOURCE}) - (${DATE_SOURCE})\\. For license-based products, the price/unit is a prorated portion of the monthly price\\.$`
      ),
      (_, start: string, end: string) =>
        `${joinCjk(periodName(`${start} - ${end}`), '的使用量')}。對於依授權計費的產品，單價為按比例分攤的月費。`
    ],
    // 卡片中单独显示的日期范围：Oct 1 - Oct 31, 2025
    [DATE_RANGE_RE, (_, start: string, end: string) => `${translateTime(start)} - ${translateTime(end)}`],
    [
      new RegExp(`^Metered usage before the billing transition, until (${DATE_SOURCE})$`),
      (_, date: string) => joinCjk('計費轉換前的計量使用量，截至', translateTime(date))
    ],
    // 使用量图表的无障碍描述（Highcharts）；原文没有逗号、冒号，译文不加：「X 圖表顯示 Y 的資料。找到 N 個資料點。」
    [
      /^(.+?) chart showing data for (.+?)\. (\d+) data points? found\.$/,
      (_, title: string, period: string, count: string) =>
        `${joinAll(usageTitle(title), '圖表顯示', periodName(period), '的資料')}。找到 ${count} 個資料點。`
    ],
    [/^(.+?)\. Interactive chart\.$/, (_, title: string) => `${usageTitle(title)}。互動式圖表。`],
    [
      new RegExp(`^(${Object.keys(CHART_TYPES).join('|')}) chart with (\\d+) data points?\\.$`),
      (_, type: string, count: string) => `包含 ${count} 個資料點的${CHART_TYPES[type] ?? type}。`
    ],
    [
      /^The chart has (\d+) ([XY]) ax[ie]s displaying (.+?)\. Data ranges from (.+?) to (.+)\.$/,
      (_, count: string, axis: string, name: string, from: string, to: string) =>
        `${joinAll(`圖表有 ${count} 條顯示`, lookup(AXIS_NAMES, name) ?? name, '的')} ${axis} 軸。資料範圍為 ${from} 至 ${to}。`
    ],
    // 预算
    [/^(\d+) budgets?$/, '$1 個預算'],
    [new RegExp(`^${MONEY} spent$`), '已支出 $1'],
    [new RegExp(`^/ ${MONEY} spent$`), '/ 已支出 $1'],
    [new RegExp(`^${MONEY} budget$`), '預算 $1'],
    // 勾选的预算项：select 按术语表作「選取」
    [/^(\d+) selected$/, '已選取 $1 個'],
    // 原文无标点，译文不加逗号
    [/^Showing (\d+) to (\d+) of (\d+) budgets?$/, '顯示 $3 個預算中的第 $1 至 $2 個'],
    // 预算表分页：1-5 of 5
    [/^(\d+)-(\d+) of (\d+)$/, '$3 項中的第 $1-$2 項'],
    // 预算表的无障碍名称：Budget utilization for mona、View actions for Actions budget for Account mona
    // 「View actions」是预算行的操作选单按钮，译「選項」，避免与产品名「動作」相混
    [/^Budget utilization for (.+)$/, '$1 的預算使用率'],
    [
      new RegExp(`^View actions for (.+?) budget for (${Object.keys(BUDGET_SCOPES).join('|')}) (.+)$`),
      (_, budget: string, scope: string, name: string) =>
        joinAll('查看', BUDGET_SCOPES[scope] ?? scope, name, '的', lookup(BUDGET_NAMES, budget) ?? budget, '預算的選項')
    ],
    // 使用量报告（句号随原文；与 org-settings/billing.ts 同译）
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
    [/^The usage report will be emailed when it['’]s ready to (\S+@\S+)\.$/, '報告準備好後會以電子郵件傳送至 $1。']
  ]
} satisfies PageDictionary
