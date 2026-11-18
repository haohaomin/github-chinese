import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, translateTime } from '../helpers'

/**
 * Actions 管理：缓存、运行器、使用情况指标、性能指标、证明（列表与详情，/attestations 归入 actions 页面类型）。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 指标时段（句中为小写） */
const PERIODS: Readonly<Record<string, string>> = {
  'current week (mon-sun)': '本週（週一至週日）',
  'current month': '本月',
  'this month': '本月',
  'last month': '上個月',
  'last 30 days': '過去 30 天',
  'last 90 days': '過去 90 天',
  'last year': '去年',
  custom: '自訂範圍'
}

function period(text: string): string {
  return pick(PERIODS, text.toLowerCase()) ?? text
}

const SCOPES: Readonly<Record<string, string>> = { organization: '此組織', repository: '此儲存庫' }

const USAGE_METRICS: Readonly<Record<string, string>> = { minutes: '總分鐘數', 'job runs': '作業執行總數' }

/** 性能指标说明：主语与指标 */
const PERFORMANCE_METRICS: Readonly<Record<string, string>> = {
  'Average run time of': '作業的平均執行時間',
  'Average queue time of': '作業的平均佇列時間',
  'Failure rate across': '作業的失敗率',
  'Total minutes used across failed': '失敗作業使用的總分鐘數'
}

const PERFORMANCE_SOURCE = Object.keys(PERFORMANCE_METRICS).join('|')

/** 证明详情摘要条目的名称 */
const ATTESTATION_FIELDS: Readonly<Record<string, string>> = {
  Created: '建立時間',
  Commit: '提交',
  'Build Summary': '建置摘要',
  'Workflow File': '工作流程檔案'
}

/** Created 的取值：Oct 23 (Fri, 23 Oct 2026 20:22:17 GMT) → 10月23日 (Fri, 23 Oct 2026 20:22:17 GMT)；括号内的完整时间戳保留原文 */
const CREATED_VALUE_RE = new RegExp(`^(${TIME_SOURCE})( \\(.+\\))?$`)

function attestationValue(field: string, value: string): string {
  const created = field === 'Created' ? CREATED_VALUE_RE.exec(value) : null
  return created ? `${translateTime(created[1]!)}${created[2] ?? ''}` : value
}

/** Windows, Linux, and Mac → Windows、Linux 和 Mac */
function joinList(list: string): string {
  return list.replace(/,? and /, ' 和 ').replace(/, /g, '、')
}

export default {
  static: {
    // 缓存
    Caches: '快取',
    'Showing caches from all workflows.': '顯示所有工作流程的快取。',
    'Learn more about managing caches.': '瞭解如何管理快取。',
    'Filter by cache key': '依快取鍵篩選',
    'No caches': '尚無快取',
    'No caches matched your search': '沒有與搜尋相符的快取',
    'Cache not found': '找不到快取',
    'Nothing has been cached by workflows running in this repository.': '此儲存庫中執行的工作流程尚未快取任何內容。',
    'Remove the filters': '移除篩選器',
    'or try a different search query.': '或嘗試其他搜尋字詞。',
    'Approaching total cache storage limit': '即將達到快取儲存空間總上限',
    'Learn more about cache usage.': '瞭解快取使用量。',
    'Least recently used': '最久未使用',
    'at an unknown time': '不明時間',
    'Delete cache': '刪除快取',
    // Remove 按术语表作「移除」，与 Delete cache（刪除）区分
    'Remove cache': '移除快取',
    'Are you sure you want to delete this cache?': '確定要刪除此快取嗎？',
    'Yes, permanently delete this cache': '是，永久刪除此快取',
    'Deleting cache...': '正在刪除快取...',
    'Deleting Cache...': '正在刪除快取...',
    'Deletion is in progress. Dismissing this dialog will not cancel it.': '正在刪除。關閉此對話方塊不會取消刪除。',
    'Cache deleted successfully.': '快取已刪除。',
    'Failed to delete this cache. Please try again.': '無法刪除此快取。請再試一次。',
    'Unable to load branches': '無法載入分支',
    'Unable to load branches.': '無法載入分支。',
    'Unable to load branches. Try again.': '無法載入分支。請再試一次。',
    'Close and reopen the filter to try again.': '關閉並重新開啟篩選器後再試一次。',
    'Filter menus are unavailable because this query is too long. Shorten it in the filter input.':
      '篩選器選單因查詢過長而無法使用。在篩選器輸入框中縮短查詢。',

    // 运行器
    Runners: '執行器',
    'New runner': '新增執行器',
    'Runners available to this repository': '此儲存庫可用的執行器',
    'GitHub-hosted runners': 'GitHub 代管的執行器',
    'Self-hosted runners': '自架執行器',
    'Copy label': '複製標籤',
    'Runner actions': '執行器動作',
    'Runner list item actions': '執行器清單項目動作',
    'Loading runners': '正在載入執行器',
    'Self-hosted runners are virtual machines for GitHub Actions workflows that you manage and maintain outside of GitHub.':
      '自架執行器是供 GitHub 動作工作流程使用、由你在 GitHub 外部管理並維護的虛擬機器。',
    'You don’t have any runners for this repository': '此儲存庫沒有任何執行器',
    "You don't have any runners for this repository": '此儲存庫沒有任何執行器',
    'You don’t have any self-hosted runners for this repository': '此儲存庫沒有任何自架執行器',
    "You don't have any self-hosted runners for this repository": '此儲存庫沒有任何自架執行器',
    'Unable to load runners': '無法載入執行器',
    'An error occurred while loading runners. Please try again.': '載入執行器時發生錯誤。請再試一次。',
    'Unable to load runners. An error occurred while loading runners. Please try again.':
      '無法載入執行器。載入執行器時發生錯誤。請再試一次。',
    'Repository runners': '儲存庫執行器',
    'GitHub-hosted runners list': 'GitHub 代管的執行器清單',
    'Self-hosted runners list': '自架執行器清單',
    'Repository self-hosted runner list': '儲存庫自架執行器清單',
    'Runner type': '執行器類型',

    // 使用情况指标、性能指标
    'Metrics navigation': '指標導覽',
    'Showing data:': '顯示資料：',
    'Current month': '本月',
    'Current week (Mon-Sun)': '本週（週一至週日）',
    'Custom date range (UTC)': '自訂日期範圍 (UTC)',
    'Choose dates': '選擇日期',
    'Download report': '下載報告',
    'Job runs': '作業執行',
    'Runtime OS': '執行階段作業系統',
    'Runner labels': '執行器標籤',
    'No table data available yet.': '尚無表格資料。',
    'You don’t have workflows on any of your organization repositories.': '你的組織儲存庫中沒有任何工作流程。',
    "You don't have workflows on any of your organization repositories.": '你的組織儲存庫中沒有任何工作流程。',
    'Total minutes': '總分鐘數',
    'Total job runs': '作業執行總數',
    'Row Actions': '列動作',
    'View performance': '查看效能',
    'Avg job run time': '平均作業執行時間',
    'Avg job queue time': '平均作業佇列時間',
    'Job failure rate': '作業失敗率',
    // 数量义 usage 作「使用量」
    'Failed job usage': '失敗作業使用量',
    'Avg run time minutes': '平均執行分鐘數',
    'Avg queue time minutes': '平均佇列分鐘數',
    'Failure rate': '失敗率',
    'Has job failures': '有作業失敗',
    'Avg run time': '平均執行時間',
    'Avg queue time': '平均佇列時間',

    // 证明
    'Attestations list': '證明清單',
    'No attestations': '尚無證明',
    // Create attestations using the <a>attest-build-provenance</a> action
    'Create attestations using the': '使用',
    'Predicate type': '述詞類型',
    'Title of the list': '清單標題',
    'Attestation summary': '證明摘要',
    'Build Summary': '建置摘要',
    'Workflow File': '工作流程檔案',
    'Verify attestation': '驗證證明',
    'Certificate summary': '憑證摘要',
    'Subject digest': '主體摘要',
    // 证书摘要的字段
    'Build Config Digest': '建置設定摘要',
    'Build Config URI': '建置設定 URI',
    'Build Signer Digest': '建置簽署者摘要',
    'Build Signer URI': '建置簽署者 URI',
    'Build Trigger': '建置觸發條件',
    'Runner Invocation URI': '執行器叫用 URI',
    'Runner Environment': '執行器環境',
    'Source Repository Digest': '來源儲存庫摘要',
    'Source Repository Identifier': '來源儲存庫識別碼',
    'Source Repository Owner Identifier': '來源儲存庫擁有者識別碼',
    'Source Repository Owner URI': '來源儲存庫擁有者 URI',
    'Source Repository Ref': '來源儲存庫參考',
    'Source Repository URI': '來源儲存庫 URI',
    'Source Repository Visibility': '來源儲存庫可見度'
  },

  scoped: {
    Key: '鍵',
    'Find a branch': '尋找分支',
    'Recently used': '最近使用',
    cached: '快取於',
    'Last used': '上次使用於',
    label: '標籤',
    Metrics: '指標',
    Range: '範圍',
    'Range:': '範圍：',
    'Enter a number': '輸入數字',
    'equal to': '等於',
    'greater than': '大於',
    'less than': '小於',
    'greater than or equal to': '大於或等於',
    'less than or equal to': '小於或等於',
    // 运行器类型的取值（self-hosted 也是自托管运行器的默认标签，保留原文）
    hosted: '代管',
    'hosted-larger': '較大型代管',
    // 指标表格中不足 1 秒的时长（其余时长由 run.ts 的时长规则译出，同限 actions）
    '<1s': '<1 秒',
    of: '共',

    // 运行器空状态、标准托管运行器（与组织设置的运行器页共用组件）
    'Learn more about using runners': '瞭解如何使用執行器',
    'Runners are the machines that execute GitHub Actions workflows.': '執行器是執行 GitHub 動作工作流程的機器。',
    'Standard GitHub-hosted runners': '標準 GitHub 代管的執行器',
    'Ready-to-use runners managed by GitHub.': '由 GitHub 管理的立即可用執行器。',
    'Learn more about GitHub-hosted runners.': '瞭解 GitHub 代管的執行器。',

    // 证明；action 是 Create attestations using the <a>attest-build-provenance</a> action 的末段：使用 attest-build-provenance 動作建立證明
    action: '動作建立證明',
    Subjects: '主體',
    Subject: '主體',
    Issuer: '簽發者',
    // 排序按钮的读屏后缀：Sort by Newest, descending
    ', descending': '，遞減',
    ', ascending': '，遞增'
  },

  regexp: [
    // 缓存
    [/^([\d,]+) caches?$/, '$1 個快取'],
    [/^([\d,]+) cache results?$/, '$1 項快取結果'],
    [/^([\d,]+) found\.$/, '找到 $1 個。'],
    [/^([\d,]+) Bytes?$/, '$1 位元組'],
    [/^Delete (.+) on ([^ ]+)$/, '刪除 $2 上的快取 $1'],
    [
      /^Least recently used caches will be automatically evicted to limit the total cache storage to ([\d.]+ [KMGT]B)\.$/,
      '最久未使用的快取會自動清除，以將快取總儲存量限制在 $1。'
    ],
    // 运行器
    [/^([\d,]+) available runners?$/, '$1 個可用執行器'],
    [
      /^(\d+)-cores · (\d+) GB RAM · (\d+) GB SSD Storage(?: · (.+))?$/,
      (_, cores: string, ram: string, ssd: string, systems: string) =>
        `${cores} 核心 · ${ram} GB 記憶體 · ${ssd} GB SSD 儲存空間${systems ? ` · ${joinList(systems)}` : ''}`
    ],
    [/^Copy ([\w.-]+-latest)( label)?$/, (_, name: string, label: string) => `複製 ${name}${label ? ' 標籤' : ''}`],
    // 指标
    [/^Insights: ([\w.-]+\/[\w.-]+)$/, '洞察：$1'],
    [/^Showing data from (\d{4}\/\d{1,2}\/\d{1,2}) to$/, '資料期間 $1 至'],
    [/^Period: (.+)$/, (_, text: string) => `期間：${period(text)}`],
    [
      /^Total (minutes|job runs) across all workflows in this (organization|repository) for (.+)$/,
      (_, metric: string, scope: string, text: string) =>
        `${pick(SCOPES, scope)}所有工作流程${period(text)}的${pick(USAGE_METRICS, metric)}`
    ],
    [
      new RegExp(`^(${PERFORMANCE_SOURCE}) jobs in this (organization|repository) for (.+)$`),
      (_, metric: string, scope: string, text: string) => `${pick(SCOPES, scope)}${period(text)}${pick(PERFORMANCE_METRICS, metric)}`
    ],
    // 证明列表：主体名不含空格，避免误伤带“and N others”的运行标题
    [/^([\d,]+) subjects? ·$/, '$1 個主體 ·'],
    [/^Download attestation #(\d+)$/, '下載證明 #$1'],
    [/^(\S+) and ([\d,]+) others?$/, '$1 和另外 $2 個'],
    // 列表项的无障碍名称：gh.deb and 20 others. deployment.yml@refs/heads/trunk. More information available below.
    [
      /^(\S+?)(?: and ([\d,]+) others?)?\. (\S+)\. More information available below\.$/,
      (_, subject: string, count: string | undefined, workflow: string) =>
        `${subject}${count ? ` 和另外 ${count} 個` : ''}。${workflow}。下方有更多資訊。`
    ],
    // 证明详情的摘要条目：Commit. 4f2cfe9….（标点随原文，名称与取值之间用句号；Created 的日期按通则译出）
    [
      new RegExp(`^(${Object.keys(ATTESTATION_FIELDS).join('|')})\\. (.+)\\.$`),
      (_, field: string, value: string) => `${pick(ATTESTATION_FIELDS, field)}。${attestationValue(field, value)}。`
    ]
  ],

  ignore: [
    // 运行器页自托管标签页：条目标题后的运行器标签（self-hosted、Linux、X64 等，runs-on 用的标识符），来源标签（accent）照常
    '[class*="SelfHostedRunners__"] [data-listview-item-title-container] > [data-component="Label"]:not([data-variant="accent"])'
  ]
} satisfies PageDictionary
