import { tableEntries } from '../../core/table'
import type { InlineRule, PageDictionary } from '../../core/types'
import regions from './common/regions'
import { formatDate, isLocalZone, joinCjk } from './helpers'

/**
 * GitHub 状态页（www.githubstatus.com，Atlassian Statuspage）：组件状态、可用率条与提示框、订阅表单、
 * 事件历史（/history）、正常运行时间（/uptime）、事件报告（/incidents/<编号>）。
 *
 * - 事件标题、更新正文是工程师写的文字，只收 Statuspage 自动生成的模板句与 GitHub 固定用语，其余保持原文。
 * - 日期、年份、时刻在 <var> 里（引擎跳过），行内句只改其间的文字；年份排在日之后，无法调成「年 月 日」。
 *   时刻按 UTC 显示，浏览器本地时区不是 UTC 时在末尾写 (UTC)。
 * - 「Visit www.githubstatus.com for more information」组件不翻译：GitHub 的页面脚本按这句英文隐藏它。
 * - 「+ Show All N Incidents」「Posted on」「Scheduled for」整句在 <var> 里，不处理。
 * - 标签页标题「GitHub Status」、页头「Help / Community / Status」、页脚营销链接、Privacy Policy、Terms of Service、
 *   Today、Resolved、Previous page 等由 common 收录。
 */

/** 组件名：首页组件列表、事件标题与更新中的组件列表、正常运行时间页的组件选择框 */
const COMPONENTS: Readonly<Record<string, string>> = {
  'Git Operations': 'Git 操作',
  Webhooks: 'Web 钩子',
  'API Requests': 'API 请求',
  Issues: '议题',
  'Pull Requests': '拉取请求',
  Actions: '操作',
  Packages: '软件包',
  Pages: '页面',
  Codespaces: '代码空间',
  Copilot: 'Copilot',
  'Copilot AI Model Providers': 'Copilot AI 模型提供商'
}
const COMPONENT_NAMES: ReadonlyMap<string, string> = new Map(Object.entries(COMPONENTS))

/** 电话区号选项中与 regions.ts 写法不同的国家/地区名（Chad、Jordan、Georgia 只在这里收，不进全局词条） */
const PHONE_REGIONS: Readonly<Record<string, string>> = {
  Cocos: '科科斯群岛',
  'Aland Islands': '奥兰群岛',
  'Central Africa': '中非共和国',
  Chad: '乍得',
  Congo: '刚果共和国',
  'Congo, Dem Rep': '刚果民主共和国',
  Georgia: '格鲁吉亚',
  Jordan: '约旦',
  'Korea, Republic of': '韩国',
  'Palestinian Territory': '巴勒斯坦领土',
  'St Kitts and Nevis': '圣基茨和尼维斯',
  'St Lucia': '圣卢西亚',
  'St Vincent Grenadines': '圣文森特和格林纳丁斯',
  Turkey: '土耳其'
}
const PHONE_NAMES: ReadonlyMap<string, string> = new Map([...tableEntries(regions.static), ...Object.entries(PHONE_REGIONS)])

/** 固定的事件标题：GitHub 未定位到组件时的默认标题、计划维护标题 */
const INCIDENT_TITLES: Readonly<Record<string, string>> = {
  'Disruption with some GitHub services': '部分 GitHub 服务中断',
  'Codespaces Scheduled Maintenance': '代码空间计划维护'
}
const INCIDENT_TITLE_NAMES: ReadonlyMap<string, string> = new Map(Object.entries(INCIDENT_TITLES))

/** 标签页标题「GitHub Status - <页面>」中的页面名 */
const PAGE_TITLES: ReadonlyMap<string, string> = new Map([
  ['Incident History', '事件历史记录'],
  ['Uptime History', '正常运行时间历史记录']
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
  ['minute', '分钟'],
  ['hour', '小时'],
  ['day', '天'],
  ['month', '个月'],
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
  if (degradation) return joinCjk(translateList(degradation[1]!, COMPONENT_NAMES), '降级')
  return undefined
}

/** 月份缩写 → 10月 */
function monthLabel(abbr: string): string {
  return formatDate(undefined, MONTH_ABBRS.indexOf(abbr) + 1, undefined)
}

/** 时刻后的时区：浏览器本地时区就是 UTC 时不写（日、时在 <var> 里，按该月中旬判断） */
function utcSuffix(abbr: string): string {
  return isLocalZone('UTC', undefined, MONTH_ABBRS.indexOf(abbr) + 1, 15, 12, 0) ? '' : ' (UTC)'
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
      `${posted ? '发布于 ' : ''}${slots} ${monthLabel(month)}{#}日，{#}年 {}${utcSuffix(month)}`
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
    (_, month: string) => `${monthLabel(month)}{#}日，{#}年 {}-{}${utcSuffix(month)}`
  ],
  // 跨日的计划维护时段：Oct <var>28</var>, <var>2026</var> <var>23:00</var> - Oct <var>29</var>, …
  [
    new RegExp(`^${MONTH_SOURCE} \\{#\\}, \\{#\\} \\{\\} - ${MONTH_SOURCE} \\{#\\}, \\{#\\} \\{\\} UTC$`),
    (_, start: string, end: string) => `${monthLabel(start)}{#}日，{#}年 {} - ${monthLabel(end)}{#}日，{#}年 {}${utcSuffix(end)}`
  ],
  // span.ago：<var>21</var> hours ago.
  [/^\{#\} (minute|hour|day|month|year)s? ago\.$/, (_, unit: string) => `{#}${AGO_UNITS.get(unit) ?? unit}前。`]
]

export default {
  scoped: {
    // 页头
    'GitHub Octicon logo': 'GitHub Octicon 徽标',
    'Subscribe to Updates': '订阅更新',
    'Subscribe to updates': '订阅更新',
    'Subscribe via email': '通过电子邮件订阅',
    'Subscribe via SMS': '通过短信订阅',
    'Subscribe via slack': '通过 Slack 订阅',
    'Subscribe via webhook': '通过 Web 钩子订阅',
    'Subscribe via RSS': '通过 RSS 订阅',
    'Close subscribe form': '关闭订阅表单',

    // 订阅下拉框：方式说明里的加粗动词、表单、按钮（input 的 value）、条款链接
    creates: '创建',
    updates: '更新',
    resolves: '解决',
    changes: '更改',
    'Enter OTP:': '输入验证码：',
    "Didn't receive the OTP?": '没有收到验证码？',
    'Resend OTP': '重新发送验证码',
    'Verify OTP and Subscribe': '验证并订阅',
    'Subscribe via Email': '通过电子邮件订阅',
    'Subscribing...': '订阅中...',
    'Country code:': '国家/地区代码：',
    'Phone number:': '电话号码：',
    'Change number': '更改号码',
    'Subscribe via Text Message': '通过短信订阅',
    'Get incident updates and maintenance status messages in Slack.': '在 Slack 中接收事件更新和维护状态消息。',
    'Subscribe via Slack': '通过 Slack 订阅',
    'Cloud Terms of Service': '云服务条款',
    'Webhook URL:': 'Web 钩子 URL：',
    'The URL we should send the webhooks to': '接收 Web 钩子的 URL',
    "We'll send you email if your endpoint fails": '端点失败时，我们会向你发送电子邮件',
    'support site': '支持网站',
    'Atom Feed': 'Atom 订阅源',
    'RSS Feed': 'RSS 订阅源',

    // 页面状态（GitHub 的页面脚本把部分降级改写为 Some services are degraded）
    'All Systems Operational': '所有系统运行正常',
    'Partially Degraded Service': '服务部分降级',
    'Degraded System Service': '系统服务降级',
    'Minor Service Outage': '轻微服务中断',
    'Partial System Outage': '部分系统中断',
    'Major System Outage': '严重系统中断',
    'Service Under Maintenance': '服务维护中',
    'Some services are degraded': '部分服务降级',

    // 关于本站（GitHub 的脚本把这段移到「事件历史记录」链接之后）
    'About This Site': '关于本站',
    'Check GitHub Enterprise Cloud status by region:': '按区域查看 GitHub 企业云状态：',
    '- Australia:': '- 澳大利亚：',
    '- EU:': '- 欧盟：',
    '- Japan:': '- 日本：',
    '- US:': '- 美国：',
    'View historical uptime.': '查看历史正常运行时间。',

    // 组件名（Issues、Actions、Packages、Codespaces 由 common 收录，Copilot 保留）与描述（悬停提示）
    'Git Operations': 'Git 操作',
    Webhooks: 'Web 钩子',
    'API Requests': 'API 请求',
    'Pull Requests': '拉取请求',
    Pages: '页面',
    'Copilot AI Model Providers': 'Copilot AI 模型提供商',
    'Performance of git clones, pulls, pushes, and associated operations': 'git 克隆、拉取、推送及相关操作的性能',
    'Real time HTTP callbacks of user-generated and system events': '用户生成事件和系统事件的实时 HTTP 回调',
    'Requests for GitHub APIs': '对 GitHub API 的请求',
    'Requests for Issues on GitHub.com': '对 GitHub.com 上议题的请求',
    'Requests for Pull Requests on GitHub.com': '对 GitHub.com 上拉取请求的请求',
    'Workflows, Compute and Orchestration for GitHub Actions': 'GitHub 操作的工作流、计算和编排',
    'API requests and webhook delivery for GitHub Packages': 'GitHub 软件包的 API 请求和 Web 钩子交付',
    'Frontend application and API servers for Pages builds': '页面构建的前端应用和 API 服务器',
    'Orchestration and Compute for GitHub Codespaces': 'GitHub 代码空间的编排和计算',

    // 组件状态：图例、状态按钮的 aria-label 与提示；GitHub 脚本追加的 status-msg 与提示框标签
    Operational: '正常运行',
    'Degraded Performance': '性能降低',
    'Partial Outage': '部分中断',
    'Major Outage': '严重中断',
    'Under Maintenance': '维护中',
    Maintenance: '维护中',
    Normal: '正常',
    Degraded: '降级',
    Incident: '故障',
    Degradation: '降级',
    'Major outage': '严重中断',
    'Partial outage': '部分中断',

    // 可用率条提示框
    'No downtime recorded on this day.': '当天没有停机记录。',
    'No data exists for this day.': '当天没有数据。',
    Related: '相关事件',
    'No incidents or maintenance related to this downtime.': '没有与此次停机相关的事件或维护。',

    // 事件列表（首页过往事件、计划维护、历史页）
    'Past Incidents': '过往事件',
    'No incidents reported today.': '今天没有报告事件。',
    'No incidents reported.': '没有报告事件。',
    'Scheduled Maintenance': '计划维护',
    'No incidents reported for this month.': '当月没有报告事件。',
    '- Collapse Incidents': '- 收起事件',
    'Filter Components': '筛选组件',
    Incidents: '事件',
    Uptime: '正常运行时间',

    // 更新状态（Resolved、Update、Completed 由 common 收录）
    Investigating: '调查中',
    Identified: '已查明',
    Monitoring: '监控中',
    Postmortem: '事后分析',
    Scheduled: '已计划',
    'In progress': '正在进行',
    Verifying: '验证中',

    // 页脚
    'Incident History': '事件历史记录',
    'Current Status': '当前状态',
    'Back to current status': '返回当前状态',
    'Powered by Atlassian Statuspage': '由 Atlassian Statuspage 提供支持',
    'GitHub text logo': 'GitHub 文字徽标',

    // 正常运行时间页：组件选择框与下拉箭头
    'Select Component': '选择组件',
    open: '展开',

    // 事件订阅弹窗
    'Subscribe to Incident': '订阅事件',
    close: '关闭',
    'VIA EMAIL:': '通过电子邮件：',
    'VIA SMS:': '通过短信：',
    'Enter mobile number': '输入手机号码',
    'Edit number': '编辑号码',
    'Send OTP': '发送验证码',
    'Enter the OTP sent': '输入收到的验证码',
    'To receive SMS updates, please verify your number. To proceed with just email click ‘Subscribe’':
      '如需接收短信更新，请验证你的号码。如只使用电子邮件，请单击“订阅”',

    // 事件标题
    ...INCIDENT_TITLES,

    // 更新正文的模板句（多句的段落逐句匹配）
    'We are investigating reports of impacted performance for some GitHub services.': '我们正在调查有关部分 GitHub 服务性能受影响的报告。',
    'We are investigating reports of degraded performance.': '我们正在调查有关性能降低的报告。',
    'We are continuing to investigate.': '我们正在继续调查。',
    'The degradation has been mitigated.': '降级问题已缓解。',
    'We are monitoring to ensure stability.': '我们正在监控以确保稳定。',
    'We will continue monitoring to ensure stability, but mitigation is complete.': '缓解措施已完成，但我们将继续监控以确保稳定。',
    'We will continue to keep users updated on progress towards mitigation.': '我们将持续向用户通报缓解进展。',
    'This incident has been resolved.': '此事件已解决。',
    'Thank you for your patience and understanding as we addressed this issue.': '感谢你在我们处理此问题期间的耐心与理解。',
    'A detailed root cause analysis will be shared as soon as it is available.': '详细的根本原因分析完成后将尽快分享。',
    // Copilot 模型提供商故障的模板句
    'This is due to an issue with an upstream model provider.': '这是由于上游模型提供商出现问题。',
    "While we work with them to resolve the issue, we recommend choosing another model or selecting 'Auto' to continue using Copilot.":
      '在我们与其合作解决问题期间，建议选择其他模型或选择“自动”以继续使用 Copilot。',
    "We recommend choosing another model or selecting 'Auto' to continue using Copilot.":
      '建议选择其他模型或选择“自动”以继续使用 Copilot。',
    'The provider is working to mitigate the problem and we are monitoring recovery.': '提供商正在缓解问题，我们正在监控恢复情况。',
    'The issue was resolved by a mitigation put in place by our provider.': '该问题已通过我们的提供商实施的缓解措施得到解决。',
    'GitHub is working with our provider to further improve the resiliency of the service to prevent similar incidents in the future.':
      'GitHub 正在与我们的提供商合作，进一步提高服务的弹性，以防今后再发生类似事件。',

    // 历史页分页、月份标题（年份在 <var> 里，显示为「10月 2026」）
    ...Object.fromEntries(MONTH_NAMES.map((name, i) => [name, formatDate(undefined, i + 1, undefined)]))
  },
  regexp: [
    // 标签页标题：GitHub Status - Incident History / Uptime History / <事件标题>（译不了的事件标题保持原文）
    [/^GitHub Status - (.+)$/, (_, page: string) => `GitHub 状态 - ${PAGE_TITLES.get(page) ?? translateIncidentTitle(page) ?? page}`],
    // 事件标题：Incident with Actions, Issues and Pull Requests → 操作、议题和拉取请求故障
    [INCIDENT_WITH_RE, (_, list: string) => joinCjk(translateList(list, COMPONENT_NAMES), '故障')],
    [DEGRADATION_WITH_RE, (_, list: string) => joinCjk(translateList(list, COMPONENT_NAMES), '降级')],
    // 事件页底部：This incident affected: A, B, and C. / This scheduled maintenance affects: A.
    [
      new RegExp(`^This (incident|scheduled maintenance) (affected|affects): (${LIST_SOURCE})\\.$`),
      (_, subject: string, tense: string, list: string) =>
        `${subject === 'incident' ? '此事件' : '此次计划维护'}${tense === 'affected' ? '影响了' : '影响'}：${translateList(list, COMPONENT_NAMES)}。`
    ],
    // 组件说明按钮的 aria-label：More information about Git Operations（同 auth/two-factor.ts 的同句型）
    [/^More information about (.+)$/, (_, name: string) => joinCjk(joinCjk('关于', COMPONENT_NAMES.get(name) ?? name), '的更多信息')],
    // 组件组提示框：2 components had a major outage. 中的计数
    [/^(\d+) components?$/, '$1 个组件'],
    // 提示框中的停机时长：1 hrs、5 mins（Statuspage 不分单复数）
    [/^(\d+) (hrs|mins)$/, (_, amount: string, unit: string) => `${amount} ${unit === 'hrs' ? '小时' : '分钟'}`],
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
          joinCjk('我们正在调查有关', translateList(list, COMPONENT_NAMES)),
          `${kind === 'performance' ? '性能' : '可用性'}降低的报告`
        )
    ],
    [
      new RegExp(`^(${LIST_SOURCE}) (?:is|are) experiencing degraded (performance|availability)\\.$`),
      (_, list: string, kind: string) =>
        joinCjk(translateList(list, COMPONENT_NAMES), `出现${kind === 'performance' ? '性能' : '可用性'}降低。`)
    ],
    [
      new RegExp(`^(${LIST_SOURCE}) (?:is|are) operating normally\\.$`),
      (_, list: string) => joinCjk(translateList(list, COMPONENT_NAMES), '运行正常。')
    ],
    [
      new RegExp(`^The degradation affecting (${LIST_SOURCE}) has been mitigated\\.$`),
      (_, list: string) => joinCjk(joinCjk('影响', translateList(list, COMPONENT_NAMES)), '的降级问题已缓解。')
    ],
    // We are investigating reports of issues with service(s): Spark.（服务名不是组件时保持原文；名称中不含句末「. 」，
    // 后接其他句子时由逐句匹配处理）
    [
      /^We are investigating reports of issues with service\(s\): ((?:(?!\. ).)+)\.$/,
      (_, services: string) => `我们正在调查有关以下服务问题的报告：${translateList(services, COMPONENT_NAMES)}。`
    ],
    // 合并到其他事件：链接保持原文
    [/^Please refer to the combined summary in this related incident: (https:\/\/\S+)$/, '请参阅此相关事件中的综合摘要：$1'],
    // Copilot 模型可用性：模型名保持原文，列表连接词译出
    [
      /^We are experiencing degraded availability for (?:the )?((?:(?!\. ).)+?)(?: models?)? in Copilot products and IDE surfaces\.$/,
      (_, models: string) => joinCjk(joinCjk('Copilot 产品和 IDE 中的', translateList(models)), '模型可用性降低。')
    ],
    [
      /^The issues with our upstream model provider have been (resolved|mitigated), and ((?:(?!\. ).)+?) (?:is|are) once again available in Copilot products and IDE surfaces\.$/,
      (_, state: string, models: string) =>
        joinCjk(
          joinCjk(`上游模型提供商的问题已${state === 'resolved' ? '解决' : '缓解'}，`, translateList(models)),
          '已在 Copilot 产品和 IDE 中恢复可用。'
        )
    ]
  ],
  inline: [
    // 订阅下拉框：方式说明（加粗动词由 scoped 翻译）
    ['Get email notifications whenever GitHub {}, {} or {} an incident.', '每当 GitHub {}、{}或{}事件时，接收电子邮件通知。'],
    ['Get text message notifications whenever GitHub {} or {} an incident.', '每当 GitHub {}或{}事件时，接收短信通知。'],
    [
      'Get webhook notifications whenever GitHub {} an incident, {} an incident, {} an incident or {} a component status.',
      '每当 GitHub {}事件、{}事件、{}事件或{}组件状态时，接收 Web 钩子通知。'
    ],
    // 验证码倒计时：Resend OTP in: <span>30</span> seconds；事件订阅弹窗中跟在置灰的「重新发送验证码」链接后
    ['Resend OTP in: {} seconds', '{}秒后可重新发送验证码'],
    ['in {} seconds', '{}秒后可用'],
    // 条款与隐私
    ['By subscribing you agree to our {}.', '订阅即表示你同意我们的{}。'],
    ['{} This site is protected by reCAPTCHA and the Google {} and {} apply.', '{}本网站受 reCAPTCHA 保护，并适用 Google {}和{}。'],
    [
      'Message and data rates may apply. By subscribing you agree to our {}, the Atlassian {}, and the Atlassian {}. This site is protected by reCAPTCHA and the Google {} and {} apply.',
      '可能会产生短信和数据流量费用。订阅即表示你同意我们的{}、Atlassian {}和 Atlassian {}。本网站受 reCAPTCHA 保护，并适用 Google {}和{}。'
    ],
    [
      "By subscribing you acknowledge our {}. In addition, you agree to the Atlassian {} and acknowledge Atlassian's {}.",
      '订阅即表示你已知悉我们的{}。此外，你同意 Atlassian {}，并已知悉 Atlassian 的{}。'
    ],
    ['Visit our {}.', '访问我们的{}。'],
    ['Get the {} or {}.', '获取 {}或 {}。'],
    // 组件区：Uptime over the past <var>90</var> days. <a>View historical uptime.</a>；可用率条图例
    ['Uptime over the past {} days. {}', '过去 {}天的正常运行时间。{}'],
    ['{} days ago', '{}天前'],
    ['{} % uptime', '{}% 正常运行时间'],
    // 组件组提示框：<i></i><span>2 components</span> had a major outage.
    ['{} {} had a major outage.', '{}{}出现严重中断。'],
    ['{} {} had a partial outage.', '{}{}出现部分中断。'],
    // 事件订阅弹窗说明（事件标题在 <strong> 里，可能已译成中文：加引号，槽位两侧不留空格）
    [
      "Subscribe to updates for {} via email and/or text message. You'll receive email notifications when incidents are updated, and text message notifications whenever GitHub {} or {} an incident.",
      '通过电子邮件和/或短信订阅“{}”的更新。事件更新时你会收到电子邮件通知，GitHub {}或{}事件时你会收到短信通知。'
    ],
    // 事件页副标题：Incident Report for <a>GitHub</a>
    ['Incident Report for {}', '{} 事件报告'],
    ['Scheduled Maintenance Report for {}', '{} 计划维护报告'],
    // 历史页、正常运行时间页分页：<span>August</span><var> 2026</var> to <span>October</span><var> 2026</var>
    ['{} {#} to {} {#}', '{} {#} 至 {} {#}'],
    ...TIMESTAMP_RULES
  ]
} satisfies PageDictionary
