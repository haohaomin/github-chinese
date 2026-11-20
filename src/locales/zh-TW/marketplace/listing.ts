import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 上架项详情页：操作页（/marketplace/actions/*）与应用页（/marketplace/*）的头部、关于、资源、
 * 版本选择与安装片段、计划与定价、安装按钮、服务条款说明、透明度与安全。
 * 服务条款说明由多个链接拆开，按片段收录，整句另用正则。
 * 产品名、方案名按用户决定（2026-10-27，product-names.md）译成中文：Marketplace → 市集、权限名 actions / codespaces →
 * 動作 / 程式碼空間、Copilot Chat → Copilot 聊天；第三方应用的常见计划名 Free / Pro / Open Source 等按 PLAN_NAMES 译出
 * （计划卡片与「… plan available.」句同译）。计费 plan 作「方案」，publisher 作「發行者」（与 org-settings 的发行者验证一致）。
 * 计划描述与要点（发布者填写）不忽略：按用户要求收录的见 apps.ts，其余保留原文。
 */

/** GitHub 应用权限名（透明度表格；与 settings-developer/permissions.ts 的资源名同译） */
const PERMISSION_NAMES: Readonly<Record<string, string>> = {
  'public repositories': '公開儲存庫',
  'public organization information': '公開組織資訊',
  'public user profile data': '公開使用者個人檔案資料',
  actions: '動作',
  administration: '管理',
  checks: '檢查',
  code: '程式碼',
  codespaces: '程式碼空間',
  'commit statuses': '提交狀態',
  contents: '內容',
  'Dependabot alerts': 'Dependabot 警示',
  'Dependabot secrets': 'Dependabot 機密',
  deployments: '部署',
  discussions: '討論',
  'email addresses': '電子郵件地址',
  emails: '電子郵件',
  environments: '環境',
  followers: '追蹤者',
  gists: '程式碼片段',
  'gpg keys': 'GPG 金鑰',
  'git ssh keys': 'Git SSH 金鑰',
  issues: '議題',
  members: '成員',
  'merge queues': '合併佇列',
  metadata: '中繼資料',
  'organization administration': '組織管理',
  'organization hooks': '組織 Web 鉤子',
  'organization plan': '組織方案',
  'organization projects': '組織專案',
  'organization secrets': '組織機密',
  packages: '套件',
  pages: '頁面',
  plan: '方案',
  profile: '個人檔案',
  projects: '專案',
  'pull requests': '拉取請求',
  'repository hooks': '儲存庫 Web 鉤子',
  'repository projects': '儲存庫專案',
  'secret scanning alerts': '機密掃描警示',
  secrets: '機密',
  'security events': '安全性事件',
  starring: '加星號',
  statuses: '狀態',
  'team discussions': '團隊討論',
  variables: '變數',
  watching: '關注',
  webhooks: 'Web 鉤子',
  workflows: '工作流程'
}

/** 英文并列「A, B, and C」「A and B」拆成各项 */
function splitList(list: string): string[] {
  return list.split(/, and |, | and /)
}

/** 各项连成「A、B 和 C」「A 和 B」；「和」与英文、数字之间加空格 */
function joinList(items: readonly string[]): string {
  if (items.length < 2) return items.join('')
  return joinCjk(joinCjk(items.slice(0, -1).join('、'), '和'), items[items.length - 1]!)
}

/** 「contents, checks, and metadata」→「內容、檢查和中繼資料」，已知权限名转为中文 */
function permissionList(list: string): string {
  return joinList(splitList(list).map(item => PERMISSION_NAMES[item] ?? item))
}

/**
 * 权限表描述「<Read|Read and write|Admin> access to <列表>」中访问级别之后的片段。
 * 原文 1～2 项时没有标点，译文不加冒号；与「access to files located at」的译文同为「存取權……」句式
 */
function accessTo(list: string): string {
  return joinCjk('存取權適用於', permissionList(list))
}

/** 计费单位（license seats → 「授權席次」，seat 作「席次」） */
const UNIT_NAMES: Readonly<Record<string, string>> = {
  user: '使用者',
  seat: '席次',
  member: '成員',
  repository: '儲存庫',
  repo: '儲存庫',
  developer: '開發人員',
  committer: '提交者'
}

/** 计费单位的正则片段 */
const UNIT_SOURCE = Object.keys(UNIT_NAMES).join('|')

/** 第三方应用常见的计划名（发布者自定义，译不了的保留原文）；方案名作「X 版」，Open Source → 開源 */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  Free: '免費版',
  Pro: '專業版',
  Team: '團隊版',
  Business: '商務版',
  Enterprise: '企業版',
  'Open Source': '開源',
  'Open source': '開源',
  Starter: '入門版',
  Basic: '基本版',
  Standard: '標準版',
  Premium: '進階版'
}

/**
 * 计划卡片上单独显示的计划名。Free、Pro、Open Source 由 common 的全局 static 译出（译文相同）；
 * Team、Enterprise 与全局导航、页脚的导航名同形，由 common 译「團隊」「企業」，不在本页覆盖
 */
const PLAN_SCOPED = Object.fromEntries(
  Object.entries(PLAN_NAMES).filter(([name]) => !['Free', 'Pro', 'Open Source', 'Team', 'Enterprise'].includes(name))
)

/** 单个计划名：「Free」→「免費版」，未知名称原样保留 */
function planName(name: string): string {
  return PLAN_NAMES[name] ?? name
}

/** 多个计划名：「Open Source and Umbrella」→「開源和 Umbrella」；计划名本身含逗号时会被拆开，只用于复数句式 */
function planNames(list: string): string {
  return joinList(splitList(list).map(planName))
}

export default {
  static: {
    // 头部与关于
    'Manually verified': '已手動驗證',
    'Verified creator': '已驗證創作者',
    'You must be signed in to star a repository': '必須登入才能為儲存庫加星號',
    "You can't star at this time": '目前無法加星號',
    'You can’t star at this time': '目前無法加星號',
    'Use latest version': '使用最新版本',

    // 旧版本横幅（后接链接「最新版本」与片段 instead?）
    "You're viewing an older version of this GitHub Action. Do you want to see the": '你正在查看此 GitHub 動作的舊版本。是否改為查看',
    'You’re viewing an older version of this GitHub Action. Do you want to see the': '你正在查看此 GitHub 動作的舊版本。是否改為查看',
    'Sorry, we couldn’t find that version of this Action. Here’s the latest version.': '找不到此動作的該版本。以下是最新版本。',
    "Sorry, we couldn't find that version of this Action. Here's the latest version.": '找不到此動作的該版本。以下是最新版本。',

    // 安装片段对话框
    'Copy and paste the following snippet into your': '將下列程式碼片段複製並貼到你的',
    'Learn more about this action in': '詳情請參閱',

    // 无自述文件
    'This GitHub Action has no README in the repository. If': '此 GitHub 動作的儲存庫中沒有讀我檔案。如果',
    'one is added': '新增了讀我檔案',
    ', it will appear here.': '，就會顯示在這裡。',

    // 下架
    'Delist action?': '要下架此動作嗎？',
    'Delist action': '下架動作',
    'Are you sure you want to delist this action from the Marketplace? Note: It will still be installable as long as the repository is public.':
      '確定要從市集下架此動作嗎？注意：儲存庫為公開時仍可安裝。',

    // 验证徽章
    'GitHub has manually verified the creator of the action as an official partner organization. For more info see':
      'GitHub 已手動驗證此動作的創作者為官方合作夥伴組織。詳情請參閱',
    'About badges in GitHub Marketplace': '關於 GitHub 市集中的徽章',
    "GitHub has verified the publisher's identity, ownership of their domain, and compliance with":
      'GitHub 已驗證發行者的身分、網域擁有權，以及是否符合',
    'GitHub has verified the publisher’s identity, ownership of their domain, and compliance with':
      'GitHub 已驗證發行者的身分、網域擁有權，以及是否符合',
    'GitHub has verified that the publisher controls the domain and meets other requirements.':
      'GitHub 已驗證發行者掌控該網域並符合其他要求。',
    // 标点随原文：第一句没有逗号，第二句只有并列项的逗号
    'is not certified by GitHub. It is provided by a third-party and is governed by separate terms of service, privacy policy, and support documentation.':
      '未經 GitHub 認證。由第三方提供並適用個別的服務條款、隱私權政策和支援說明文件。',
    'is provided by a third-party and is governed by separate terms of service, privacy policy, and support documentation.':
      '由第三方提供並適用個別的服務條款、隱私權政策和支援說明文件。',

    // 应用页：按钮与菜单
    'Set up a free trial': '開始免費試用',
    'Edit current plan': '編輯目前方案',
    'Configure account access': '設定帳號存取權',
    'Manage app listing': '管理應用程式上架資訊',
    'Configure your installation': '設定安裝',
    'Install unavailable': '無法安裝',
    'Only enterprise administrators and organization admins can purchase applications from the marketplace.':
      '只有企業管理員和組織管理員才能從市集購買應用程式。',
    'Only enterprise admins are able to install paid Marketplace plans.': '只有企業管理員才能安裝市集付費方案。',

    // 应用页：侧栏（Copilot 授权是计费义 license，作「授權」）
    'Copilot Chat, Copilot in the IDE': 'Copilot 聊天、IDE 中的 Copilot',
    'GitHub Copilot license': 'GitHub Copilot 授權',
    'Copilot Extensions require an active': 'Copilot 擴充功能需要有效的',

    // 计划与定价
    'Plans and pricing': '方案和定價',
    'Pricing and setup': '定價和設定',
    'Free trial available': '提供免費試用',
    'For organizations only': '僅限組織',
    'For users only': '僅限使用者',
    'Enterprise-owned organization': '企業擁有的組織',
    'Supports Copilot extensions': '支援 Copilot 擴充功能',

    // 安装按钮与说明
    'Buy with GitHub': '透過 GitHub 購買',
    'Install it for free': '免費安裝',
    'You’ve already used a free trial for this app': '你已使用過此應用程式的免費試用',
    "You've already used a free trial for this app": '你已使用過此應用程式的免費試用',
    // 后接加粗的缺少项「安裝 URL」：原文没有标点，译文不加逗号，用「…的原因是缺少」承接，避免「無法安裝安裝 URL」
    'This app is not installable because it is missing': '此應用程式無法安裝的原因是缺少',
    'Next: Confirm your installation location': '下一步：確認安裝位置',
    'Next: Confirm your installation location.': '下一步：確認安裝位置。',
    'Next: Confirm your installation location and payment information': '下一步：確認安裝位置和付款資訊',
    'Next: Confirm your installation location and payment information.': '下一步：確認安裝位置和付款資訊。',
    'You’ve already purchased this on all of your GitHub accounts': '你已在所有 GitHub 帳號上購買此應用程式',
    "You've already purchased this on all of your GitHub accounts": '你已在所有 GitHub 帳號上購買此應用程式',

    // 服务条款说明
    'You previously agreed to the': '你先前已同意',
    // 后接 <relative-time>：拼成「你同意這些條款於 3 天前」「…於 2024年1月5日」
    'You agreed to these terms': '你同意這些條款於',
    'is provided by a third-party and is governed by': '由第三方提供並適用',
    'Marketplace Terms of Service': '市集服務條款',

    // 透明度与安全
    'Transparency and security': '透明度和安全性',
    '1. Publisher': '1. 發行者',
    '2. Permissions': '2. 權限',
    '3. Security & Compliance': '3. 安全性和合規性',
    'For more information on the terms of service on the GitHub Marketplace, please visit the':
      '如需 GitHub 市集服務條款的詳細資訊，請參閱',
    'Marketplace Developer Agreement': '市集開發人員協議',
    'An error occurred while exporting the CSV.': '匯出 CSV 時發生錯誤。',
    'Repository permissions can be granted for all or selected repositories owned by the installing account.':
      '儲存庫權限可授予安裝帳號擁有的所有或選取的儲存庫。',
    'access to files located at': '存取權僅限以下路徑的檔案',
    'OAuth Apps use scopes to grant access based on your current user permissions. You can view the specific scopes being requested before completing authorization. Scopes requested may change over time and depending on which resources you have access to. GitHub Apps use fixed, granular controls set at installation time.':
      'OAuth 應用程式透過範圍依你目前的使用者權限授予存取權。你可以在完成授權前查看所請求的具體範圍。所請求的範圍可能隨時間和你能存取的資源而改變。GitHub 應用程式使用安裝時設定的固定、精細控制項。',
    'Learn more about OAuth and GitHub Apps': '瞭解 OAuth 應用程式和 GitHub 應用程式',
    'Security & Compliance information is self-attested by the publisher. Only the Publisher and Permissions information is verified by GitHub. Make sure to conduct your own security reviews.':
      '安全性和合規性資訊由發行者自行聲明。只有發行者和權限資訊經過 GitHub 驗證。請務必自行審查安全性。',
    'EU Trader': '歐盟交易商',
    'Publisher 2FA Required': '發行者要求 2FA',
    // 透明度表格取值：<Yes|No|Not applicable> - <说明>（服务端数据，原文已在应用页核实）
    'Yes - Classifies as a trader in the European Union': '是 - 屬於歐盟交易商',
    'No - Does not classify as a trader in the European Union': '否 - 不屬於歐盟交易商',
    'Yes - Publisher organization requires 2FA': '是 - 發行者組織要求 2FA',
    'No - Publisher organization does not require 2FA': '否 - 發行者組織不要求 2FA',
    'Not applicable - Individual publisher': '不適用 - 個人發行者',
    'Indemnity Status': '賠償保障狀態',
    "Not covered by Microsoft's indemnity policy. All other Copilot features retain indemnity coverage.":
      '不在 Microsoft 賠償政策的涵蓋範圍內。所有其他 Copilot 功能仍享有賠償保障。',
    'Not covered by Microsoft’s indemnity policy. All other Copilot features retain indemnity coverage.':
      '不在 Microsoft 賠償政策的涵蓋範圍內。所有其他 Copilot 功能仍享有賠償保障。',
    'Classified as high risk by EU AI Act': '依歐盟人工智慧法列為高風險',
    'Third party services used': '使用的第三方服務'
  },
  scoped: {
    ...PLAN_SCOPED,
    Customers: '客戶',
    Disclosures: '揭露資訊',
    Paid: '付費',
    By: '來自',
    by: '來自',
    Latest: '最新',
    'Pre-release': '發行前版本',
    Use: '使用',
    'latest version': '最新版本',
    'instead?': '？',
    Installation: '安裝',
    'file.': '檔案中。',
    'No description': '沒有描述',
    'Security policy': '安全性政策',
    // 侧栏「Tags」下是 code-quality、code-review 等市场类别标签（链接到 /marketplace?category=…），不是 Git 标记，作「標籤」
    Tags: '標籤',
    contributors: '位貢獻者',
    Transparency: '透明度',
    install: '次安裝',
    installs: '次安裝',
    'Free Trial': '免費試用',
    'Pay-as-you-go': '隨用隨付',
    Plans: '方案',
    'Account:': '帳號：',
    '/ month': '/ 月',
    'Current plan': '目前方案',
    // 订单页方案价格的单位（per&nbsp;user/&nbsp;month）
    'per user/ month': '每位使用者/月',
    'per user / month': '每位使用者 / 月',
    separate: '個別的',
    Requirements: '需求',
    Developer: '開發人員',
    Read: '讀取',
    write: '寫入',
    Info: '資訊',
    No: '否',
    Integration: '整合',
    'Start a discussion': '發起討論',
    'Open an issue': '建立議題',
    'View source code': '查看原始碼',
    'Export CSV': '匯出 CSV',
    'Select a tab': '選擇分頁',
    'Select a tab navigation': '選擇分頁',
    // Terms of service 由 common/site.ts 的全局词条翻译
    'Privacy policy': '隱私權政策',
    'terms of service': '服務條款',
    'privacy policy': '隱私權政策',
    'support contact': '支援聯絡方式',
    'support documentation': '支援說明文件',
    'other requirements': '其他要求',
    'Status page': '狀態頁面',
    'Support URL': '支援 URL',
    'Support email': '支援電子郵件',
    'Select account': '選擇帳號',
    'Already installed': '已安裝',
    'Works with': '適用於',
    'Supported languages': '支援的語言',
    'Latest version': '最新版本',
    'Choose a version': '選擇版本',
    'Company domain': '公司網域',
    'Business address': '營業地址',
    'Business ID': '企業 ID',
    'Repository URL': '儲存庫 URL',
    'Repository visibility': '儲存庫可見度',
    'Models used': '使用的模型',
    'Requires a': '需要',
    'From the developer': '來自開發人員',
    'an installation URL': '安裝 URL',
    'and payment information': '和付款資訊'
  },
  regexp: [
    // 头部
    [/^Star this repository \(([\d.,]+[kKmM]?)\)$/, '為此儲存庫加星號 ($1)'],
    [/^Unstar this repository \(([\d.,]+[kKmM]?)\)$/, '移除此儲存庫的星號 ($1)'],
    [/^You cannot star repositories outside of your enterprise (.+)$/, '無法為企業 $1 以外的儲存庫加星號'],
    [/^Use ([\w.+-]+)$/, '使用 $1'],
    [/^\+ ?(\d[\d,]*) contributors?$/, '+ $1 位貢獻者'],

    // 计划与安装：计划名译出后与中文直接相连，保留原文时补空格
    [
      /^(.+) plan(s?) available\.$/,
      (_, names: string, plural: string) => joinCjk(joinCjk('提供', plural ? planNames(names) : planName(names)), '方案。')
    ],
    [/^Number of (\w+?)s$/, (_, unit: string) => joinCjk(UNIT_NAMES[unit] ?? unit, '數量')],
    [/^Account: (.+)$/, '帳號：$1'],
    [/^Set ?up with (.+)$/, '使用 $1 設定'],
    [/^Try free for (\d+) (day|month)s?$/, (_, count: string, unit: string) => `免費試用 ${count} ${unit === 'day' ? '天' : '個月'}`],
    [new RegExp(`^/ (${UNIT_SOURCE})$`), (_, unit: string) => `/ ${UNIT_NAMES[unit] ?? unit}`],
    [/^(\d+) days? left of free trial$/, '免費試用剩餘 $1 天'],

    // 服务条款说明（整句）；原文按钮名带引号、引号后有逗号，译文用「」，逗号移到引号外
    [/^By clicking “Set up with (.+?),” you are agreeing to the$/, '按一下「使用 $1 設定」，即表示你同意'],
    [/^By clicking “Set up with (.+?),” you are agreeing to (.+)’s$/, '按一下「使用 $1 設定」，即表示你同意 $2 的'],
    // 原文按钮名没有引号，译文不加
    [/^By clicking Set up with (.+?), you agree to the$/, '按一下使用 $1 設定，即表示你同意'],
    [/^By clicking Set up with (.+?), you agree to (.+)’s$/, '按一下使用 $1 設定，即表示你同意 $2 的'],
    // 并列的条款链接：末项「, and X’s」作「，以及 X 的」，中间项「, X’s」作「、X 的」
    [/^, ?and (.+)’s$/, '，以及 $1 的'],
    [/^, ?(.+)’s$/, '、$1 的'],
    [/^(.+) is owned and operated by GitHub with separate$/, '$1 由 GitHub 擁有和營運並適用個別的'],
    [/^(.+) is provided by a third-party and is governed by separate$/, '$1 由第三方提供並適用個別的'],
    [/^(.+) is owned and operated by GitHub$/, '$1 由 GitHub 擁有和營運'],

    // 透明度：权限表
    [/^access to ([A-Za-z][A-Za-z ,-]*[A-Za-z])$/, (_, list: string) => accessTo(list)]
  ],
  ignore: [
    // 头部名称、面包屑末项、简介、版本号（标记名）
    '[data-testid="overview-header"] h1',
    '[data-testid="overview-header"] nav li:last-child',
    '[data-testid="about"] > span',
    '[data-testid="about"] [class*="prc-Truncate-Truncate-"]',
    // 版本选择对话框：版本号（标记名）、发行版标题（与标记名不同时显示在条目描述中）
    '[data-testid="version-picker-dialog"] [data-component="ActionList.Item.Label"]',
    '[data-testid="version-picker-dialog"] [data-component="ActionList.Description"]',
    // 安装片段对话框标题中的名称与简介
    '[role="dialog"] h3.lh-condensed',
    '[role="dialog"] h3.lh-condensed + p',
    // 支持的语言列表（发布者选择）
    '[data-testid="languages"] > span',
    // 截图说明（发布者填写）
    '.ScreenshotCarousel-screenshot > .pt-2'
  ]
} satisfies PageDictionary
