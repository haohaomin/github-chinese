import type { PageDictionary } from '../../../core/types'

/**
 * 探索页（/sponsors/explore）与筛选器、赞助帐号页（/sponsors/accounts）、
 * 批次赞助（/sponsors/bulk-sponsorships/*）、组织相依项目页。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 贊助，
 * 不带前缀的 Sponsors → 贊助（Sponsors profile → 贊助個人檔案）。
 * dependency 作「相依項目」，depend on 作「相依於」；ecosystem 作「生態系」（与 insights、security 一致）；
 * 人（赞助者、维护者、成员）的量词用「位」，funding file 作「贊助檔案」（与 code、organization 一致）。
 */

/** 排序选项 */
const ORDERINGS: Readonly<Record<string, string>> = {
  'Most used': '最常使用',
  'Least used': '最少使用',
  'Most sponsors': '最多贊助者',
  'Fewest sponsors': '最少贊助者',
  'Newest Sponsors profile': '最新的贊助個人檔案',
  'Oldest Sponsors profile': '最舊的贊助個人檔案',
  Unknown: '未知'
}

/** 生态系筛选按钮文字：All ecosystems / 2 ecosystems / npm */
function ecosystemLabel(label: string): string {
  if (label === 'All ecosystems') return '所有生態系'
  const count = /^(\d+) ecosystems?$/.exec(label)
  return count ? `${count[1]} 個生態系` : label
}

export default {
  static: {
    // 探索页
    'Explore GitHub Sponsors': '探索 GitHub 贊助',
    'Fund the work of developers and projects you depend on.': '資助你所仰賴的開發人員和專案。',
    'Sponsored developers and organizations': '受贊助的開發人員和組織',
    "Don't see what you're looking for? Try": '找不到你要的嗎？試試',
    'Don’t see what you’re looking for? Try': '找不到你要的嗎？試試',
    'searching for people you can sponsor': '搜尋可贊助的人',
    'and filtering by language!': '並依語言篩選！',

    // 探索页：筛选器
    'All ecosystems': '所有生態系',
    'Direct dependencies only': '僅限直接相依項目',

    // 探索页：相依项目
    'None of your dependencies can be sponsored': '你的相依項目都無法贊助',
    "You don't directly depend on any repositories whose maintainers can be sponsored.": '你沒有直接相依於任何維護者可受贊助的儲存庫。',
    'You don’t directly depend on any repositories whose maintainers can be sponsored.': '你沒有直接相依於任何維護者可受贊助的儲存庫。',
    // 主语（组织名）在单独的元素里时的后半句
    'does not directly depend on any repositories whose maintainers can be sponsored.': '沒有直接相依於任何維護者可受贊助的儲存庫。',
    'developers who maintain your dependencies': '位維護你相依項目的開發人員',
    'Explore people and projects': '探索人員和專案',
    'Bulk Sponsor': '批次贊助',
    'Sponsor multiple maintainers in one easy transaction.': '透過一筆交易輕鬆贊助多位維護者。',
    'owns or maintains.': '擁有或維護。',
    'owns or maintains': '擁有或維護',
    "We check their maintainer status by seeing if they're listed in a repository's": '我們藉由檢查對方是否列在儲存庫的',
    'We check their maintainer status by seeing if they’re listed in a repository’s': '我們藉由檢查對方是否列在儲存庫的',
    'Talk to your organization about GitHub Sponsors': '和你的組織討論 GitHub 贊助',
    'Share this discovery page with your team to start a conversation about investing in the people and projects you rely on.':
      '與團隊分享此探索頁面以開始討論如何投資你所仰賴的人員和專案。',
    "Invest in open source software and we'll track your progress here!": '投資開源軟體後我們會在這裡追蹤你的進度！',
    'Invest in open source software and we’ll track your progress here!': '投資開源軟體後我們會在這裡追蹤你的進度！',

    // 赞助帐号页 /sponsors/accounts
    'GitHub Sponsors accounts': 'GitHub 贊助帳號',
    // who 可能是使用者或组织，与 organization 词典「$1 贊助的帳號」同译
    'Manage who you sponsor': '管理你贊助的帳號',
    "You haven't sponsored anyone yet.": '你尚未贊助任何人。',
    'You haven’t sponsored anyone yet.': '你尚未贊助任何人。',
    'Find someone to sponsor': '尋找要贊助的人',
    'GitHub Sponsors eligible accounts': '符合 GitHub 贊助資格的帳號',
    'This account has not applied to join GitHub Sponsors.': '此帳號尚未申請加入 GitHub 贊助。',
    'Join the waitlist': '加入候補名單',
    'GitHub Sponsors applications': 'GitHub 贊助申請',
    'This GitHub Sponsors profile is waiting to be reviewed by GitHub.': '此 GitHub 贊助個人檔案正在等候 GitHub 審查。',

    // 批次赞助
    'Bulk sponsor': '批次贊助',
    'Bulk sponsorship': '批次贊助',
    'Bulk Sponsors': '批次贊助',
    'Choose frequency to bulk sponsor': '選擇批次贊助頻率',
    'Choose a frequency': '選擇頻率',
    'Sponsored maintainers will receive a one-time payment. Your profile picture will appear in their sponsors for one month.':
      '受贊助的維護者將收到一次性付款。你的頭像會在對方的贊助者清單中顯示一個月。',
    'Sponsored maintainers will receive a recurring sponsorship until you cancel. Your profile picture will appear in their sponsors for the duration of your sponsorship.':
      '受贊助的維護者將持續收到定期贊助直到你取消為止。你的頭像會在贊助期間顯示在對方的贊助者清單中。',
    'Create sponsorships in bulk via file import': '透過匯入檔案批次建立贊助',
    'One-time bulk sponsorship': '一次性批次贊助',
    'Monthly bulk sponsorship': '每月批次贊助',
    'Import a CSV': '匯入 CSV',
    'Download example CSV': '下載範例 CSV',
    // 后接链接「探索贊助」
    'Or export a list of your dependencies on': '若要匯出相依項目清單也可前往',
    // 链接到探索页；原文没有 GitHub 前缀，按 product-names 作「贊助」
    'Explore Sponsors': '探索贊助',
    "A CSV is a type of file that contains the names of the people you want to sponsor and the sponsorship amount. We'll look for columns labeled Maintainer Username and Amount in USD. We'll safely ignore the rest of your columns. You can modify the file using a tool like Microsoft Excel, Google Sheets, or a text editor.":
      'CSV 檔案包含你要贊助的人員名稱和贊助金額。我們會尋找標題為 Maintainer Username 和 Amount in USD 的欄。其餘的欄會直接略過。你可以使用 Microsoft Excel、Google Sheets 或文字編輯器等工具修改檔案。',
    'Continue to checkout': '繼續結帳',

    // 组织相依项目页（标点随原文：三句各自成句）
    'We only show dependencies that have an active sponsors profile. We use files in your repositories like package-lock.json and requirements.txt to find your dependencies. We check their maintainer status by seeing if they’re listed in a repository’s funding file.':
      '只顯示擁有有效贊助個人檔案的相依項目。我們會使用儲存庫中的 package-lock.json 和 requirements.txt 等檔案找出你的相依項目。我們藉由檢查對方是否列在儲存庫的贊助檔案中來確認其維護者身分。',
    "We only show dependencies that have an active sponsors profile. We use files in your repositories like package-lock.json and requirements.txt to find your dependencies. We check their maintainer status by seeing if they're listed in a repository's funding file.":
      '只顯示擁有有效贊助個人檔案的相依項目。我們會使用儲存庫中的 package-lock.json 和 requirements.txt 等檔案找出你的相依項目。我們藉由檢查對方是否列在儲存庫的贊助檔案中來確認其維護者身分。',
    'Your dependencies will appear here': '你的相依項目會顯示在這裡',
    "Looks like you don't have any dependencies that can be sponsored right now. You can find open source maintainers to sponsor on our explore page.":
      '你目前似乎沒有可贊助的相依項目。你可以在探索頁面尋找可贊助的開源維護者。',
    'Explore maintainers': '探索維護者',
    'Search maintainers, dependencies': '搜尋維護者、相依項目',
    'Try searching for something else': '試試搜尋其他內容',
    'An error occurred while searching for your dependencies.': '搜尋相依項目時發生錯誤。',
    'Loading dependencies table': '正在載入相依項目表格',
    'Your dependencies they maintain or own': '由他們維護或擁有的相依項目',
    'Export dependencies': '匯出相依項目',
    'There was a problem exporting your dependencies.': '匯出相依項目時發生問題。',
    'Sponsorable dependencies': '可贊助的相依項目'
  },
  scoped: {
    Ecosystems: '生態系',
    sponsors: '位贊助者',
    You: '你',
    Pending: '待審查',
    Import: '匯入',
    'Choose file': '選擇檔案',
    Unknown: '未知',
    'Repository list': '儲存庫清單',
    'Recent activity': '最近活動',
    'Choose your file': '選擇你的檔案',
    'Download your': '下載',
    'results as CSV': 'CSV 格式的結果',
    'You depend on': '你相依於',
    'others sponsor': '位其他贊助者',
    'funding file': '贊助檔案中來確認其維護者身分',
    'Order by': '排序依據',
    'Most used': '最常使用',
    'Least used': '最少使用',
    'Most sponsors': '最多贊助者',
    'Fewest sponsors': '最少贊助者',
    'Newest Sponsors profile': '最新的贊助個人檔案',
    'Oldest Sponsors profile': '最舊的贊助個人檔案',
    'Explore as': '探索身分',
    // 与 explore 词典子导航的订阅入口同译（newsletter 的 email updates 作「電子郵件更新」）
    'Get email updates': '接收電子郵件更新',
    'Change email updates': '變更電子郵件更新',
    // 产品名：探索页子导航分页、全局导航「Open Source」选单项与页面标题里的 GitHub Sponsors；common 没有全局词条
    'GitHub Sponsors': 'GitHub 贊助'
  },
  regexp: [
    [/^(\d[\d,]*) sponsored developers and organizations loaded\.$/, '已載入 $1 個受贊助的開發人員和組織。'],
    [/^Explore as: (.+)$/, '探索身分：$1'],
    [/^Ecosystems: (.+)$/, (_, label: string) => `生態系：${ecosystemLabel(label)}`],
    [/^(\d+) ecosystems?$/, '$1 個生態系'],
    [/^Order by: (.+)$/, (_, label: string) => `排序依據：${ORDERINGS[label] ?? label}`],
    [
      /^(.+) does not directly depend on any repositories whose maintainers can be sponsored\.$/,
      '$1 沒有直接相依於任何維護者可受贊助的儲存庫。'
    ],
    // 按生态系统筛选后（主语在单独的元素里时只剩后半句）：… in the Cargo ecosystem whose maintainers can be sponsored.
    [
      /^(?:(.+?) )?(?:does not|don['’]t) directly depend on any repositories in the (.+) ecosystem whose maintainers can be sponsored\.$/,
      (_, subject: string | undefined, ecosystem: string) =>
        `${subject === 'You' ? '你' : subject ? `${subject} ` : ''}沒有直接相依於 ${ecosystem} 生態系統中任何維護者可受贊助的儲存庫。`
    ],
    [/^(\d[\d,]*) repositor(?:y|ies) they own or maintain$/, '他們擁有或維護的 $1 個儲存庫'],
    [/^others? sponsor, including (\d[\d,]*) organizations?$/, '位其他贊助者，包括 $1 個組織'],
    [/^Want to sponsor on behalf of (.+)\?$/, '想代表 $1 贊助嗎？'],
    // 仓库列表对话框：<You / 组织> depend(s) on <N> repositories <用户> owns or maintains.
    // 主语分开收录，两条同译，拼读为「你相依的 3 個儲存庫由 octocat 擁有或維護。」
    [/^depend on (\d[\d,]*) repositor(?:y|ies)$/, '相依的 $1 個儲存庫由'],
    [/^depends on (\d[\d,]*) repositor(?:y|ies)$/, '相依的 $1 個儲存庫由'],
    [/^(\d[\d,]*) repositor(?:y|ies)$/, '$1 個儲存庫'],
    [/^(\d[\d,]*) members?$/, '$1 位成員'],
    [/^(\d[\d,]*) of your repositories depends? on this$/, '你有 $1 個儲存庫相依於此'],
    [/^\+(\d[\d,]*) more$/, '另有 $1 個'],
    [/^Sponsor (\d[\d,]*) maintainers?$/, '贊助 $1 位維護者']
  ],
  ignore: [
    // 探索页卡片：名称与简介
    'article.Box-row .col-sm-9'
  ]
} satisfies PageDictionary
