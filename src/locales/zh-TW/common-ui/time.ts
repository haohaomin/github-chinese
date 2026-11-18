import type { PageDictionary } from '../../../core/types'
import { formatDate, isLocalZone, joinCjk, MONTH_SOURCE, relativeTime, TIME_SOURCE, translateTime } from '../helpers'

/**
 * 时间与日期：相对时间、日期、带时刻的完整时间（title / aria-label），以及时间元素前后的片段。
 * 中文与数字之间加空格：3 天前、2026年10月26日、2026年10月26日 下午 8:03、10月19日 上午 7:05。
 * 时刻与繁体 Intl（浏览器按 lang="zh-TW" 渲染的时间元素）一致：上午 / 下午 + 12 小时制，小时不补零；
 * 时区与浏览器本地时区相同时不写，不同时放在末尾方括号里（上午 10:03 [PDT]）。
 */

const MONTHS: ReadonlyMap<string, number> = new Map(
  ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((name, index) => [name, index + 1])
)

/** 月份名 → 数字；MONTH_SOURCE 匹配到的名称一定能换算 */
function monthOf(name: string): number {
  const month = MONTHS.get(name.slice(0, 3).toLowerCase())
  if (month === undefined) throw new Error(`未知月份：${name}`)
  return month
}

/** 年月日 → 2026年10月26日；缺年 → 10月26日 */
function dateOf(month: string, day: string, year: string): string {
  return formatDate(year ? Number(year) : undefined, monthOf(month), Number(day))
}

/** 月份与年 → 2024年1月（January 2024） */
export function formatMonthYear(month: string, year: string): string {
  return formatDate(Number(year), monthOf(month), undefined)
}

/** 小时换成 24 小时制：8 PM → 20，12 AM → 0；没有 AM / PM 时原样 */
function hour24Of(hour: string, meridiem: string): number {
  const value = Number(hour)
  return meridiem ? (value % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0) : value
}

/**
 * 时刻：上午 / 下午 + 12 小时制，小时不补零（8:33 PM → 下午 8:33，12:05 AM → 上午 12:05）；
 * 原文没有 AM / PM 时按 24 小时制换算（02:03 → 上午 2:03，14:03 → 下午 2:03）
 */
export function formatClock(hour: string, minute: string, meridiem = ''): string {
  const value = Number(hour)
  const afternoon = meridiem ? meridiem.toUpperCase() === 'PM' : value >= 12
  return `${afternoon ? '下午' : '上午'} ${value % 12 || 12}:${minute}`
}

/** React 评论菜单等处的 aria-label 时间：7:05 AM today / 3:00 AM on July 1 / 3:00 AM on July 1, 2025 */
export const ARIA_DATE_SOURCE = `\\d{1,2}:[0-5]\\d [AP]M (?:today|yesterday|on ${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})?)`
const ARIA_DATE_RE = new RegExp(`^(\\d{1,2}):([0-5]\\d) ([AP]M) (?:(today|yesterday)|on (${MONTH_SOURCE}) (\\d{1,2})(?:, (\\d{4}))?)$`)

/** 7:05 AM on October 19 → 10月19日 上午 7:05；7:05 AM today → 今天 上午 7:05 */
export function translateAriaDate(text: string): string {
  const match = ARIA_DATE_RE.exec(text)
  if (!match) throw new Error(`无法解析时间：${text}`)
  const [, hour, minute, meridiem, named, month, day, year] = match
  const date = named ? (named === 'today' ? '今天' : '昨天') : dateOf(month!, day!, year ?? '')
  return `${date} ${formatClock(hour!, minute!, meridiem)}`
}

/** 经典页面的 aria-label 时间：07:51AM on October 16 / 05:49PM on December 22, 2024 */
export const COMPACT_DATE_SOURCE = `\\d{1,2}:[0-5]\\d[AP]M on ${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})?`
const COMPACT_DATE_RE = new RegExp(`^(\\d{1,2}):([0-5]\\d)([AP]M) on (${MONTH_SOURCE}) (\\d{1,2})(?:, (\\d{4}))?$`)

/** 07:51AM on October 16 → 10月16日 上午 7:51 */
export function translateCompactDate(text: string): string {
  const match = COMPACT_DATE_RE.exec(text)
  if (!match) throw new Error(`无法解析时间：${text}`)
  const [, hour, minute, meridiem, month, day, year] = match
  return `${dateOf(month!, day!, year ?? '')} ${formatClock(hour!, minute!, meridiem)}`
}

/** 时长单位：Last 7 days → 最近 7 天、30 days → 30 天 */
const DURATION_UNITS: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分鐘',
  hour: '小時',
  day: '天',
  week: '週',
  month: '個月',
  year: '年'
}

/** 2 days → 2 天；1 month → 1 個月 */
function duration(amount: string, unit: string): string {
  return `${amount} ${DURATION_UNITS[unit.replace(/s$/, '')]!}`
}

/** 紧凑相对时间的单位：2d ago、1mo ago（m 为分钟，mo 为月） */
const MICRO_UNITS: Readonly<Record<string, Intl.RelativeTimeFormatUnit>> = {
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week',
  mo: 'month',
  y: 'year'
}

/**
 * 完整时间里的时区：GMT±h、GMT（零时区）、UTC，以及 en-US 给美洲时区用的缩写（PST、EDT、AKST、HAST 等）。
 * zh-TW Intl 照写缩写，只有夏威夷时间写法不同（en-US 的 HST 写作 HAST）；阿留申的 HAST / HADT 两边相同
 */
const ZONE_SOURCE = 'GMT(?:[+-]\\d{1,2}(?::\\d{2})?)?|UTC|AK[SD]T|HA[SD]T|[ACEHMP][SD]T'
const ZONE_NAMES: Readonly<Record<string, string>> = { HST: 'HAST', HDT: 'HADT' }

/** 带时刻的完整时间：Oct 26, 2026, 10:03 AM GMT+8 / … PDT / on Oct 26, 2026, 10:03 AM / October 26, 2026 02:03 */
const DATETIME_RE = new RegExp(
  `^(?:on )?(${MONTH_SOURCE}) (\\d{1,2})(?:, (\\d{4}))?,? (\\d{1,2}):([0-5]\\d)(?: ?([AP]M))?(?: (${ZONE_SOURCE}))?$`
)

export default {
  static: {
    // 时间元素前后的片段：Updated <relative-time>、octocat authored <relative-time>
    Updated: '更新於',
    updated: '更新於',
    on: '於',
    // 议题、拉取请求的 open 按术语表译「建立」：#123 opened <relative-time> by octocat
    opened: '建立於',
    authored: '撰寫於',
    committed: '提交於',
    edited: '已編輯',
    Edited: '已編輯',

    // 日期范围
    Today: '今天',
    Yesterday: '昨天',
    'Just now': '剛剛',
    'This week': '本週',
    'This month': '本月',
    'This year': '今年',
    'Last week': '上週',
    'Last month': '上個月',
    'Last year': '去年',
    // 个人状态的自动清除时间（Never / in 30 minutes / after today …），译「永不」
    Never: '永不'
  },
  regexp: [
    // 3 days ago、last week、Oct 26, 2026、on Jul 1
    [new RegExp(`^(${TIME_SOURCE})$`), (_, time: string) => translateTime(time)],
    // 紧凑格式：2d ago、1mo ago
    [/^(\d{1,4})(mo|[smhdwy]) ago$/, (_, amount: string, unit: string) => relativeTime(-Number(amount), MICRO_UNITS[unit]!)],
    [new RegExp(`^[Uu]pdated (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '更新')],
    // Last updated 按术语表译「上次更新」，时间放后面：上次更新於 2 小時前
    [new RegExp(`^Last updated (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次更新於', translateTime(time))],
    [new RegExp(`^Created (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '建立')],
    [new RegExp(`^[Ee]dited (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '編輯')],

    // 带时刻的完整时间：2026年10月26日 下午 8:33；时区不是本地时区时放在末尾方括号里（同繁体 Intl）
    [
      DATETIME_RE,
      (_, month: string, day: string, year: string, hour: string, minute: string, meridiem: string, zone: string) => {
        const time = `${dateOf(month, day, year)} ${formatClock(hour, minute, meridiem)}`
        if (!zone) return time
        const local = isLocalZone(
          zone,
          year ? Number(year) : undefined,
          monthOf(month),
          Number(day),
          hour24Of(hour, meridiem),
          Number(minute)
        )
        return local ? time : `${time} [${ZONE_NAMES[zone] ?? zone}]`
      }
    ],
    [new RegExp(`^(${ARIA_DATE_SOURCE})$`), (_, date: string) => translateAriaDate(date)],
    [new RegExp(`^(${COMPACT_DATE_SOURCE})$`), (_, date: string) => translateCompactDate(date)],
    [
      /^(Today|Yesterday) at (\d{1,2}):([0-5]\d) ([AP]M)$/,
      (_, day: string, hour: string, minute: string, meridiem: string) =>
        `${day === 'Today' ? '今天' : '昨天'} ${formatClock(hour, minute, meridiem)}`
    ],

    // 时间范围：Last 7 days → 最近 7 天、Past 24 hours → 過去 24 小時
    [
      /^(Last|Past) (\d+) (hours?|days?|weeks?|months?|years?)$/,
      (_, range: string, amount: string, unit: string) => joinCjk(range === 'Last' ? '最近' : '過去', duration(amount, unit))
    ],
    // 独立时长：24 hours、30 days、1 week
    [/^(\d+) (seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/, (_, amount: string, unit: string) => duration(amount, unit)],

    // 编辑历史
    [/^Edited (\d[\d,]*) times?$/, '已編輯 $1 次'],
    [/^edited by ([\w.-]+(?:\[bot\])?)$/, '由 $1 編輯']
  ]
} satisfies PageDictionary
