import { tableEntries } from '../../core/table'
import type { InlineRule, PageDictionary } from '../../core/types'
import regions from './common/regions'
import { formatDate, isLocalZone, joinCjk } from './helpers'

/**
 * GitHub 状态页（www.githubstatus.com，Atlassian Statuspage）：组件状态、可用率条与提示框、订阅表单、
 * 事件历史（/history）、正常运行时间（/uptime）、事件报告（/incidents/<编号>）。
 *
 * - 事件标题、更新正文是工程师写的文字，只收 Statuspage 自动生成的模板句与 GitHub 固定用语，其余保持原文。
 * - 日期、年份、时刻在 <var> 里（引擎跳过），行内句只改其间的文字；年份排在日之后，无法调成「年 月 日」，
 *   时刻也无法改成上午 / 下午 12 小时制。时刻按 UTC 显示，浏览器本地时区不是 UTC 时在末尾写 [UTC]。
 * - 「Visit www.githubstatus.com for more information」组件不翻译：GitHub 的页面脚本按这句英文隐藏它。
 * - 「+ Show All N Incidents」「Posted on」「Scheduled for」整句在 <var> 里，不处理。
 * - 标签页标题「GitHub Status」、页头「Help / Community / Status」、页脚营销链接、Privacy Policy、Terms of Service、
 *   Today、Resolved、Previous page 等由 common 收录。
 * - component 译「元件」，scheduled maintenance 译「排定維護」（微软繁中「排定的維護」）。
 */

/** 组件名：首页组件列表、事件标题与更新中的组件列表、正常运行时间页的组件选择框 */
const COMPONENTS: Readonly<Record<string, string>> = {
  'Git Operations': 'Git 操作',
  Webhooks: 'Web 鉤子',
  'API Requests': 'API 請求',
  Issues: '議題',
  'Pull Requests': '拉取請求',
  Actions: '動作',
  Packages: '套件',
  Pages: '頁面',
  Codespaces: '程式碼空間',
  Copilot: 'Copilot',
  'Copilot AI Model Providers': 'Copilot AI 模型提供者'
}
const COMPONENT_NAMES: ReadonlyMap<string, string> = new Map(Object.entries(COMPONENTS))

/** 电话区号选项中与 regions.ts 写法不同的国家/地区名（Chad、Jordan、Georgia 只在这里收，不进全局词条） */
const PHONE_REGIONS: Readonly<Record<string, string>> = {
  Cocos: '科克斯群島',
  'Aland Islands': '奧蘭群島',
  'Central Africa': '中非共和國',
  Chad: '查德',
  Congo: '剛果共和國',
  'Congo, Dem Rep': '剛果民主共和國',
  Georgia: '喬治亞',
  Jordan: '約旦',
  'Korea, Republic of': '南韓',
  'Palestinian Territory': '巴勒斯坦自治區',
  'St Kitts and Nevis': '聖克里斯多福及尼維斯',
  'St Lucia': '聖露西亞',
  'St Vincent Grenadines': '聖文森及格瑞那丁',
  Turkey: '土耳其'
}
const PHONE_NAMES: ReadonlyMap<string, string> = new Map([...tableEntries(regions.static), ...Object.entries(PHONE_REGIONS)])

/** 固定的事件标题：GitHub 未定位到组件时的默认标题、计划维护标题 */
const INCIDENT_TITLES: Readonly<Record<string, string>> = {
  'Disruption with some GitHub services': '部分 GitHub 服務中斷',
  'Codespaces Scheduled Maintenance': '程式碼空間排定維護'
}
const INCIDENT_TITLE_NAMES: ReadonlyMap<string, string> = new Map(Object.entries(INCIDENT_TITLES))

/** 标签页标题「GitHub Status - <页面>」中的页面名 */
const PAGE_TITLES: ReadonlyMap<string, string> = new Map([
  ['Incident History', '事件歷史記錄'],
  ['Uptime History', '正常運作時間歷史記錄']
])

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const
const MONTH_ABBRS = MONTH_NAMES.map(name => name.slice(0, 3))
/** Statuspage 时间戳里的月份缩写 */
const MONTH_SOURCE = `(${MONTH_ABBRS.join('|')})`

/** 相对时间（span.ago）的单位 */
const AGO_UNITS: ReadonlyMap<string, string> = new Map([
  ['minute', '分鐘'],
  ['hour', '小時'],
  ['day', '天'],
  ['month', '個月'],
  ['year', '年']
])

/** 转义正则元字符：组件名、国家/地区名含括号、点号 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 名称表拼成正则备选：长名在前（Copilot AI Model Providers 先于 Copilot） */
function alternatives(names: Iterable<string>): string {
  return [...names]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map(escapeRegExp)
    .join('|')
}

const COMPONENT_SOURCE = alternatives(COMPONENT_NAMES.keys())
/** 组件列表：A、A and B、A, B and C、A, B, and C */
const LIST_SOURCE = `(?:${COMPONENT_SOURCE})(?:(?:, and |, | and )(?:${COMPONENT_SOURCE}))*`
const LIST_SEPARATOR_RE = /, and |, | and /
const PHONE_SOURCE = alternatives(PHONE_NAMES.keys())

const INCIDENT_WITH_RE = new RegExp(`^Incident [Ww]ith (${LIST_SOURCE})$`)
const DEGRADATION_WITH_RE = new RegExp(`^Degradation [Ww]ith (${LIST_SOURCE})$`)

/** 中文列表：A、B 和 C（中英文之间补空格） */
function joinList(items: readonly string[]): string {
  if (items.length < 2) return items[0] ?? ''
  const head = items.slice(0, -1).join('、')
  return joinCjk(joinCjk(head, '和'), items[items.length - 1]!)
}

/** 英文列表按分隔符拆开，逐项查名称表（查不到的保持原文），拼成中文列表 */
function translateList(list: string, names?: ReadonlyMap<string, string>): string {
  return joinList(list.split(LIST_SEPARATOR_RE).map(name => names?.get(name) ?? name))
}

/** 事件标题：固定标题、Incident with <组件列表>、Degradation with <组件列表>；其余返回 undefined */
function translateIncidentTitle(title: string): string | undefined {
  const fixed = INCIDENT_TITLE_NAMES.get(title)
  if (fixed !== undefined) return fixed
  const incident = INCIDENT_WITH_RE.exec(title)
  if (incident) return joinCjk(translateList(incident[1]!, COMPONENT_NAMES), '故障')
  const degradation = DEGRADATION_WITH_RE.exec(title)
  if (degradation) return joinCjk(translateList(degradation[1]!, COMPONENT_NAMES), '降級')
  return undefined
}

/** 月份缩写 → 10 月 */
function monthLabel(abbr: string): string {
  return formatDate(undefined, MONTH_ABBRS.indexOf(abbr) + 1, undefined)
}

/** 时刻后的时区：浏览器本地时区就是 UTC 时不写（日、时在 <var> 里，按该月中旬判断） */
function utcSuffix(abbr: string): string {
  return isLocalZone('UTC', undefined, MONTH_ABBRS.indexOf(abbr) + 1, 15, 12, 0) ? '' : ' [UTC]'
}

/** 行内句：Statuspage 时间戳（槽位是 <var> 里的日、年、时刻，span.ago 与 Posted on / Scheduled for） */
const TIMESTAMP_RULES: readonly InlineRule[] = [
  // 日期标题：Oct <var>28</var>, <var>2026</var>（年份后没有文字，不能补「年」）
  [new RegExp(`^${MONTH_SOURCE} \\{#\\}, \\{#\\}$`), (_, month: string) => `${monthLabel(month)}{#}日，{#}`],
  // 更新时间：Oct <var>27</var>, <var>08:00</var> UTC
  [new RegExp(`^${MONTH_SOURCE} \\{#\\}, \\{\\} UTC$`), (_, month: string) => `${monthLabel(month)}{#}日 {}${utcSuffix(month)}`],
  // 发布时间：Posted <span.ago>…</span>Oct <var>27</var>, <var>2026</var> - <var>08:00</var> UTC；
  // 未解决事件只有 span.ago，计划维护前有 <var>Posted on</var>。排在「事件起止」之前：{} 也匹配年份
  [
    new RegExp(`^(Posted)?((?:\\{\\}){1,2})${MONTH_SOURCE} \\{#\\}, \\{#\\} - \\{\\} UTC$`),
    (_, posted: string, slots: string, month: string) =>
      `${posted ? '發布於 ' : ''}${slots} ${monthLabel(month)}{#}日，{#} 年 {}${utcSuffix(month)}`
  ],
  // 事件起止（历史页）；计划维护页副标题前有 <var>Scheduled for</var>
  [
    new RegExp(`^(\\{\\})?${MONTH_SOURCE} \\{#\\}, \\{\\} - \\{\\} UTC$`),
    (_, lead: string, month: string) => `${lead} ${monthLabel(month)}{#}日 {} - {}${utcSuffix(month)}`
  ],
  // 跨日的事件起止
  [
    new RegExp(`^(\\{\\})?${MONTH_SOURCE} \\{#\\}, \\{\\} - ${MONTH_SOURCE} \\{#\\}, \\{\\} UTC$`),
    (_, lead: string, start: string, end: string) =>
      `${lead} ${monthLabel(start)}{#}日 {} - ${monthLabel(end)}{#}日 {}${utcSuffix(end)}`
  ],
  // 计划维护时段：Oct <var>28</var>, <var>2026</var> <var>04:00</var>-<var>06:00</var> UTC
  [
    new RegExp(`^${MONTH_SOURCE} \\{#\\}, \\{#\\} \\{\\}-\\{\\} UTC$`),
    (_, month: string) => `${monthLabel(month)}{#}日，{#} 年 {}-{}${utcSuffix(month)}`
  ],
  // 跨日的计划维护时段：Oct <var>28</var>, <var>2026</var> <var>23:00</var> - Oct <var>29</var>, …
  [
    new RegExp(`^${MONTH_SOURCE} \\{#\\}, \\{#\\} \\{\\} - ${MONTH_SOURCE} \\{#\\}, \\{#\\} \\{\\} UTC$`),
    (_, start: string, end: string) => `${monthLabel(start)}{#}日，{#} 年 {} - ${monthLabel(end)}{#}日，{#} 年 {}${utcSuffix(end)}`
  ],
  // span.ago：<var>21</var> hours ago.
  [/^\{#\} (minute|hour|day|month|year)s? ago\.$/, (_, unit: string) => `{#} ${AGO_UNITS.get(unit) ?? unit}前。`]
]

export default {
  scoped: {
    // 页头
    'GitHub Octicon logo': 'GitHub Octicon 標誌',
    'Subscribe to Updates': '訂閱更新',
    'Subscribe to updates': '訂閱更新',
    'Subscribe via email': '透過電子郵件訂閱',
    'Subscribe via SMS': '透過簡訊訂閱',
    'Subscribe via slack': '透過 Slack 訂閱',
    'Subscribe via webhook': '透過 Web 鉤子訂閱',
    'Subscribe via RSS': '透過 RSS 訂閱',
    'Close subscribe form': '關閉訂閱表單',

    // 订阅下拉框：方式说明里的加粗动词、表单、按钮（input 的 value）、条款链接
    creates: '建立',
    updates: '更新',
    resolves: '解決',
    changes: '變更',
    'Enter OTP:': '輸入驗證碼：',
    "Didn't receive the OTP?": '沒有收到驗證碼？',
    'Resend OTP': '重新傳送驗證碼',
    'Verify OTP and Subscribe': '驗證並訂閱',
    'Subscribe via Email': '透過電子郵件訂閱',
    'Subscribing...': '訂閱中...',
    'Country code:': '國碼：',
    'Phone number:': '電話號碼：',
    'Change number': '變更號碼',
    'Subscribe via Text Message': '透過簡訊訂閱',
    'Get incident updates and maintenance status messages in Slack.': '在 Slack 中接收事件更新和維護狀態訊息。',
    'Subscribe via Slack': '透過 Slack 訂閱',
    'Cloud Terms of Service': '雲端服務條款',
    'Webhook URL:': 'Web 鉤子 URL：',
    'The URL we should send the webhooks to': '接收 Web 鉤子的 URL',
    "We'll send you email if your endpoint fails": '端點失敗時，我們會傳送電子郵件給你',
    'support site': '支援網站',
    'Atom Feed': 'Atom 摘要',
    'RSS Feed': 'RSS 摘要',

    // 页面状态（GitHub 的页面脚本把部分降级改写为 Some services are degraded）
    'All Systems Operational': '所有系統正常運作',
    'Partially Degraded Service': '服務部分降級',
    'Degraded System Service': '系統服務降級',
    'Minor Service Outage': '輕微服務中斷',
    'Partial System Outage': '部分系統中斷',
    'Major System Outage': '嚴重系統中斷',
    'Service Under Maintenance': '服務維護中',
    'Some services are degraded': '部分服務降級',

    // 关于本站（GitHub 的脚本把这段移到「事件歷史記錄」链接之后）
    'About This Site': '關於本站',
    'Check GitHub Enterprise Cloud status by region:': '依區域查看 GitHub 企業雲端狀態：',
    '- Australia:': '- 澳洲：',
    '- EU:': '- 歐盟：',
    '- Japan:': '- 日本：',
    '- US:': '- 美國：',
    'View historical uptime.': '查看歷史正常運作時間。',

    // 组件名（Issues、Actions、Packages、Codespaces 由 common 收录，Copilot 保留）与描述（悬停提示）
    'Git Operations': 'Git 操作',
    Webhooks: 'Web 鉤子',
    'API Requests': 'API 請求',
    'Pull Requests': '拉取請求',
    Pages: '頁面',
    'Copilot AI Model Providers': 'Copilot AI 模型提供者',
    'Performance of git clones, pulls, pushes, and associated operations': 'git 複製、拉取、推送和相關操作的效能',
    'Real time HTTP callbacks of user-generated and system events': '使用者產生事件和系統事件的即時 HTTP 回呼',
    'Requests for GitHub APIs': '對 GitHub API 的請求',
    'Requests for Issues on GitHub.com': '對 GitHub.com 上議題的請求',
    'Requests for Pull Requests on GitHub.com': '對 GitHub.com 上拉取請求的請求',
    'Workflows, Compute and Orchestration for GitHub Actions': 'GitHub 動作的工作流程、運算和協調流程',
    'API requests and webhook delivery for GitHub Packages': 'GitHub 套件的 API 請求和 Web 鉤子傳遞',
    'Frontend application and API servers for Pages builds': '頁面建置的前端應用程式和 API 伺服器',
    'Orchestration and Compute for GitHub Codespaces': 'GitHub 程式碼空間的協調流程和運算',

    // 组件状态：图例、状态按钮的 aria-label 与提示；GitHub 脚本追加的 status-msg 与提示框标签
    Operational: '正常運作',
    'Degraded Performance': '效能降低',
    'Partial Outage': '部分中斷',
    'Major Outage': '嚴重中斷',
    'Under Maintenance': '維護中',
    Maintenance: '維護中',
    Normal: '正常',
    Degraded: '已降級',
    Incident: '故障',
    Degradation: '降級',
    'Major outage': '嚴重中斷',
    'Partial outage': '部分中斷',

    // 可用率条提示框
    'No downtime recorded on this day.': '當天沒有停機記錄。',
    'No data exists for this day.': '當天沒有資料。',
    Related: '相關事件',
    'No incidents or maintenance related to this downtime.': '沒有與此次停機相關的事件或維護。',

    // 事件列表（首页过往事件、计划维护、历史页）
    'Past Incidents': '過往事件',
    'No incidents reported today.': '今天沒有回報事件。',
    'No incidents reported.': '沒有回報事件。',
    'Scheduled Maintenance': '排定維護',
    'No incidents reported for this month.': '當月沒有回報事件。',
    '- Collapse Incidents': '- 摺疊事件',
    'Filter Components': '篩選元件',
    Incidents: '事件',
    Uptime: '正常運作時間',

    // 更新状态（Resolved、Update、Completed 由 common 收录）
    Investigating: '調查中',
    Identified: '已查明',
    Monitoring: '監控中',
    Postmortem: '事後分析',
    Scheduled: '已排定',
    'In progress': '進行中',
    Verifying: '驗證中',

    // 页脚
    'Incident History': '事件歷史記錄',
    'Current Status': '目前狀態',
    'Back to current status': '返回目前狀態',
    'Powered by Atlassian Statuspage': '由 Atlassian Statuspage 提供支援',
    'GitHub text logo': 'GitHub 文字標誌',

    // 正常运行时间页：组件选择框与下拉箭头
    'Select Component': '選擇元件',
    open: '展開',

    // 事件订阅弹窗
    'Subscribe to Incident': '訂閱事件',
    close: '關閉',
    'VIA EMAIL:': '透過電子郵件：',
    'VIA SMS:': '透過簡訊：',
    'Enter mobile number': '輸入手機號碼',
    'Edit number': '編輯號碼',
    'Send OTP': '傳送驗證碼',
    'Enter the OTP sent': '輸入收到的驗證碼',
    'To receive SMS updates, please verify your number. To proceed with just email click ‘Subscribe’':
      '若要接收簡訊更新，請驗證你的號碼。若只使用電子郵件，請按一下「訂閱」',

    // 事件标题
    ...INCIDENT_TITLES,

    // 更新正文的模板句（多句的段落逐句匹配）
    'We are investigating reports of impacted performance for some GitHub services.': '我們正在調查有關部分 GitHub 服務效能受影響的回報。',
    'We are investigating reports of degraded performance.': '我們正在調查有關效能降低的回報。',
    'We are continuing to investigate.': '我們正在繼續調查。',
    'The degradation has been mitigated.': '降級問題已緩解。',
    'We are monitoring to ensure stability.': '我們正在監控以確保穩定。',
    'We will continue monitoring to ensure stability, but mitigation is complete.': '緩解措施已完成，但我們將繼續監控以確保穩定。',
    'We will continue to keep users updated on progress towards mitigation.': '我們將持續向使用者通報緩解進度。',
    'This incident has been resolved.': '此事件已解決。',
    'Thank you for your patience and understanding as we addressed this issue.': '感謝你在我們處理此問題期間的耐心和體諒。',
    'A detailed root cause analysis will be shared as soon as it is available.': '詳細的根本原因分析完成後將盡快分享。',
    // Copilot 模型提供商故障的模板句
    'This is due to an issue with an upstream model provider.': '這是因為上游模型提供者發生問題。',
    "While we work with them to resolve the issue, we recommend choosing another model or selecting 'Auto' to continue using Copilot.":
      '在我們與對方合作解決問題期間，建議改用其他模型或選擇「自動」以繼續使用 Copilot。',
    "We recommend choosing another model or selecting 'Auto' to continue using Copilot.":
      '建議改用其他模型或選擇「自動」以繼續使用 Copilot。',
    'The provider is working to mitigate the problem and we are monitoring recovery.': '提供者正在緩解問題，我們正在監控復原情況。',
    'The issue was resolved by a mitigation put in place by our provider.': '此問題已透過我們的提供者實施的緩解措施解決。',
    'GitHub is working with our provider to further improve the resiliency of the service to prevent similar incidents in the future.':
      'GitHub 正與我們的提供者合作，進一步提升服務的韌性，以防未來再發生類似事件。',

    // 历史页分页、月份标题（年份在 <var> 里，显示为「10 月 2026」）
    ...Object.fromEntries(MONTH_NAMES.map((name, i) => [name, formatDate(undefined, i + 1, undefined)]))
  },
  regexp: [
    // 标签页标题：GitHub Status - Incident History / Uptime History / <事件标题>（译不了的事件标题保持原文）
    [/^GitHub Status - (.+)$/, (_, page: string) => `GitHub 狀態 - ${PAGE_TITLES.get(page) ?? translateIncidentTitle(page) ?? page}`],
    // 事件标题：Incident with Actions, Issues and Pull Requests → 動作、議題和拉取請求故障
    [INCIDENT_WITH_RE, (_, list: string) => joinCjk(translateList(list, COMPONENT_NAMES), '故障')],
    [DEGRADATION_WITH_RE, (_, list: string) => joinCjk(translateList(list, COMPONENT_NAMES), '降級')],
    // 事件页底部：This incident affected: A, B, and C. / This scheduled maintenance affects: A.
    [
      new RegExp(`^This (incident|scheduled maintenance) (affected|affects): (${LIST_SOURCE})\\.$`),
      (_, subject: string, tense: string, list: string) =>
        `${subject === 'incident' ? '此事件' : '此次排定維護'}${tense === 'affected' ? '影響了' : '影響'}：${translateList(list, COMPONENT_NAMES)}。`
    ],
    // 组件说明按钮的 aria-label：More information about Git Operations（同 auth/two-factor.ts 的同句型）
    [/^More information about (.+)$/, (_, name: string) => joinCjk(joinCjk('關於', COMPONENT_NAMES.get(name) ?? name), '的詳細資訊')],
    // 组件组提示框：2 components had a major outage. 中的计数
    [/^(\d+) components?$/, '$1 個元件'],
    // 提示框中的停机时长：1 hrs、5 mins（Statuspage 不分单复数）
    [/^(\d+) (hrs|mins)$/, (_, amount: string, unit: string) => `${amount} ${unit === 'hrs' ? '小時' : '分鐘'}`],
    // 短信订阅的国家/地区代码选项：Hong Kong (+852)、Australia/Cocos/Christmas Island (+61)；名称同 common/regions.ts
    [
      new RegExp(`^((?:${PHONE_SOURCE})(?:/(?:${PHONE_SOURCE}))*) \\(\\+(\\d{1,4})\\)$`),
      (_, names: string, code: string) =>
        `${names
          .split('/')
          .map(name => PHONE_NAMES.get(name) ?? name)
          .join('/')} (+${code})`
    ],
    // 更新正文的模板句：组件列表
    [
      new RegExp(`^We are investigating reports of degraded (performance|availability) for (${LIST_SOURCE})$`),
      (_, kind: string, list: string) =>
        joinCjk(
          joinCjk('我們正在調查有關', translateList(list, COMPONENT_NAMES)),
          `${kind === 'performance' ? '效能' : '可用性'}降低的回報`
        )
    ],
    [
      new RegExp(`^(${LIST_SOURCE}) (?:is|are) experiencing degraded (performance|availability)\\.$`),
      (_, list: string, kind: string) =>
        joinCjk(translateList(list, COMPONENT_NAMES), `出現${kind === 'performance' ? '效能' : '可用性'}降低。`)
    ],
    [
      new RegExp(`^(${LIST_SOURCE}) (?:is|are) operating normally\\.$`),
      (_, list: string) => joinCjk(translateList(list, COMPONENT_NAMES), '運作正常。')
    ],
    [
      new RegExp(`^The degradation affecting (${LIST_SOURCE}) has been mitigated\\.$`),
      (_, list: string) => joinCjk(joinCjk('影響', translateList(list, COMPONENT_NAMES)), '的降級問題已緩解。')
    ],
    // We are investigating reports of issues with service(s): Spark.（服务名不是组件时保持原文；名称中不含句末「. 」，
    // 后接其他句子时由逐句匹配处理）
    [
      /^We are investigating reports of issues with service\(s\): ((?:(?!\. ).)+)\.$/,
      (_, services: string) => `我們正在調查有關以下服務問題的回報：${translateList(services, COMPONENT_NAMES)}。`
    ],
    // 合并到其他事件：链接保持原文
    [/^Please refer to the combined summary in this related incident: (https:\/\/\S+)$/, '請參閱此相關事件中的綜合摘要：$1'],
    // Copilot 模型可用性：模型名保持原文，列表连接词译出
    [
      /^We are experiencing degraded availability for (?:the )?((?:(?!\. ).)+?)(?: models?)? in Copilot products and IDE surfaces\.$/,
      (_, models: string) => joinCjk(joinCjk('Copilot 產品和 IDE 中的', translateList(models)), '模型可用性降低。')
    ],
    [
      /^The issues with our upstream model provider have been (resolved|mitigated), and ((?:(?!\. ).)+?) (?:is|are) once again available in Copilot products and IDE surfaces\.$/,
      (_, state: string, models: string) =>
        joinCjk(
          joinCjk(`上游模型提供者的問題已${state === 'resolved' ? '解決' : '緩解'}，`, translateList(models)),
          '已在 Copilot 產品和 IDE 中恢復可用。'
        )
    ]
  ],
  inline: [
    // 订阅下拉框：方式说明（加粗动词由 scoped 翻译）
    ['Get email notifications whenever GitHub {}, {} or {} an incident.', '每當 GitHub {}、{}或{}事件時，接收電子郵件通知。'],
    ['Get text message notifications whenever GitHub {} or {} an incident.', '每當 GitHub {}或{}事件時，接收簡訊通知。'],
    [
      'Get webhook notifications whenever GitHub {} an incident, {} an incident, {} an incident or {} a component status.',
      '每當 GitHub {}事件、{}事件、{}事件或{}元件狀態時，接收 Web 鉤子通知。'
    ],
    // 验证码倒计时：Resend OTP in: <span>30</span> seconds；事件订阅弹窗中跟在置灰的「重新傳送驗證碼」链接后
    ['Resend OTP in: {} seconds', '{} 秒後可重新傳送驗證碼'],
    ['in {} seconds', '{} 秒後可用'],
    // 条款与隐私
    ['By subscribing you agree to our {}.', '訂閱即表示你同意我們的{}。'],
    ['{} This site is protected by reCAPTCHA and the Google {} and {} apply.', '{}本網站受 reCAPTCHA 保護，並適用 Google {}和{}。'],
    [
      'Message and data rates may apply. By subscribing you agree to our {}, the Atlassian {}, and the Atlassian {}. This site is protected by reCAPTCHA and the Google {} and {} apply.',
      '可能需支付簡訊和資料傳輸費用。訂閱即表示你同意我們的{}、Atlassian {}和 Atlassian {}。本網站受 reCAPTCHA 保護，並適用 Google {}和{}。'
    ],
    [
      "By subscribing you acknowledge our {}. In addition, you agree to the Atlassian {} and acknowledge Atlassian's {}.",
      '訂閱即表示你已知悉我們的{}。此外，你同意 Atlassian {}，並已知悉 Atlassian 的{}。'
    ],
    ['Visit our {}.', '造訪我們的{}。'],
    ['Get the {} or {}.', '取得 {}或 {}。'],
    // 组件区：Uptime over the past <var>90</var> days. <a>View historical uptime.</a>；可用率条图例
    ['Uptime over the past {} days. {}', '過去 {} 天的正常運作時間。{}'],
    ['{} days ago', '{} 天前'],
    ['{} % uptime', '{}% 正常運作時間'],
    // 组件组提示框：<i></i><span>2 components</span> had a major outage.
    ['{} {} had a major outage.', '{}{}發生嚴重中斷。'],
    ['{} {} had a partial outage.', '{}{}發生部分中斷。'],
    // 事件订阅弹窗说明（事件标题在 <strong> 里，可能已译成中文：加引号，槽位两侧不留空格）
    [
      "Subscribe to updates for {} via email and/or text message. You'll receive email notifications when incidents are updated, and text message notifications whenever GitHub {} or {} an incident.",
      '透過電子郵件和/或簡訊訂閱「{}」的更新。事件更新時你會收到電子郵件通知，GitHub {}或{}事件時你會收到簡訊通知。'
    ],
    // 事件页副标题：Incident Report for <a>GitHub</a>
    ['Incident Report for {}', '{} 事件報告'],
    ['Scheduled Maintenance Report for {}', '{} 排定維護報告'],
    // 历史页、正常运行时间页分页：<span>August</span><var> 2026</var> to <span>October</span><var> 2026</var>
    ['{} {#} to {} {#}', '{} {#} 至 {} {#}'],
    ...TIMESTAMP_RULES
  ]
} satisfies PageDictionary
