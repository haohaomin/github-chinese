import type { PageDictionary } from '../../../core/types'
import { formatDate, isLocalZone, joinCjk, MONTH_SOURCE, relativeTime, TIME_SOURCE, translateTime } from '../helpers'

/**
 * 时间与日期：相对时间、日期、带时刻的完整时间（title / aria-label），以及时间元素前后的片段。
 * 写法：3天前、2026年10月26日、2026年10月26日 08:03、10月19日 7:05。
 * 完整时间只写日期与时刻：时区与浏览器本地时区相同时不写，不同时写在时刻后的括号里（10:03 (GMT-7)）。
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

/** 时刻：12 小时制换成 24 小时制；pad 时补零（Intl 带时区输出 08:03，不带时区输出 8:03） */
export function formatClock(hour: string, minute: string, meridiem = '', pad = false): string {
  const hour24 = hour24Of(hour, meridiem)
  return `${pad ? String(hour24).padStart(2, '0') : hour24}:${minute}`
}

/** React 评论菜单等处的 aria-label 时间：7:05 AM today / 3:00 AM on July 1 / 3:00 AM on July 1, 2025 */
export const ARIA_DATE_SOURCE = `\\d{1,2}:[0-5]\\d [AP]M (?:today|yesterday|on ${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})?)`
const ARIA_DATE_RE = new RegExp(`^(\\d{1,2}):([0-5]\\d) ([AP]M) (?:(today|yesterday)|on (${MONTH_SOURCE}) (\\d{1,2})(?:, (\\d{4}))?)$`)

/** 7:05 AM on October 19 → 10月19日 7:05；7:05 AM today → 今天 7:05 */
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

/** 07:51AM on October 16 → 10月16日 7:51 */
export function translateCompactDate(text: string): string {
  const match = COMPACT_DATE_RE.exec(text)
  if (!match) throw new Error(`无法解析时间：${text}`)
  const [, hour, minute, meridiem, month, day, year] = match
  return `${dateOf(month!, day!, year ?? '')} ${formatClock(hour!, minute!, meridiem)}`
}

/** 时长单位：Last 7 days → 最近 7 天、30 days → 30 天 */
const DURATION_UNITS: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '个月',
  year: '年'
}

/** 2 days → 2 天；1 month → 1 个月 */
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
 * 与本地时区不同时才写出，缩写按 zh-CN Intl 写成 GMT 偏移
 */
const ZONE_SOURCE = 'GMT(?:[+-]\\d{1,2}(?::\\d{2})?)?|UTC|AK[SD]T|HA[SD]T|[ACEHMP][SD]T'
const ZONE_OFFSETS: Readonly<Record<string, string>> = {
  AST: 'GMT-4',
  ADT: 'GMT-3',
  EST: 'GMT-5',
  EDT: 'GMT-4',
  CST: 'GMT-6',
  CDT: 'GMT-5',
  MST: 'GMT-7',
  MDT: 'GMT-6',
  PST: 'GMT-8',
  PDT: 'GMT-7',
  AKST: 'GMT-9',
  AKDT: 'GMT-8',
  HST: 'GMT-10',
  HDT: 'GMT-9',
  // 阿留申（America/Adak）
  HAST: 'GMT-10',
  HADT: 'GMT-9'
}

/** 带时刻的完整时间：Oct 26, 2026, 10:03 AM GMT+8 / … PDT / on Oct 26, 2026, 10:03 AM / October 26, 2026 02:03 */
const DATETIME_RE = new RegExp(
  `^(?:on )?(${MONTH_SOURCE}) (\\d{1,2})(?:, (\\d{4}))?,? (\\d{1,2}):([0-5]\\d)(?: ?([AP]M))?(?: (${ZONE_SOURCE}))?$`
)

export default {
  static: {
    // 时间元素前后的片段：Updated <relative-time>、octocat authored <relative-time>
    Updated: '更新于',
    updated: '更新于',
    on: '于',
    opened: '打开于',
    authored: '编写于',
    committed: '提交于',
    edited: '已编辑',
    Edited: '已编辑',

    // 日期范围
    Today: '今天',
    Yesterday: '昨天',
    'Just now': '刚刚',
    'This week': '本周',
    'This month': '本月',
    'This year': '今年',
    'Last week': '上周',
    'Last month': '上个月',
    'Last year': '去年',
    Never: '从不'
  },
  regexp: [
    // 3 days ago、last week、Oct 26, 2026、on Jul 1
    [new RegExp(`^(${TIME_SOURCE})$`), (_, time: string) => translateTime(time)],
    // 紧凑格式：2d ago、1mo ago
    [/^(\d{1,4})(mo|[smhdwy]) ago$/, (_, amount: string, unit: string) => relativeTime(-Number(amount), MICRO_UNITS[unit]!)],
    [new RegExp(`^[Uu]pdated (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '更新')],
    [new RegExp(`^Last updated (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '最后更新')],
    [new RegExp(`^Created (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '创建')],
    [new RegExp(`^[Ee]dited (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '编辑')],

    // 带时刻的完整时间：2026年10月26日 08:03；时区不是本地时区时写在时刻后：2026年10月26日 10:03 (GMT-7)
    [
      DATETIME_RE,
      (_, month: string, day: string, year: string, hour: string, minute: string, meridiem: string, zone: string) => {
        const date = dateOf(month, day, year)
        if (!zone) return `${date} ${formatClock(hour, minute, meridiem)}`
        const time = `${date} ${formatClock(hour, minute, meridiem, true)}`
        const local = isLocalZone(
          zone,
          year ? Number(year) : undefined,
          monthOf(month),
          Number(day),
          hour24Of(hour, meridiem),
          Number(minute)
        )
        return local ? time : `${time} (${ZONE_OFFSETS[zone] ?? zone})`
      }
    ],
    [new RegExp(`^(${ARIA_DATE_SOURCE})$`), (_, date: string) => translateAriaDate(date)],
    [new RegExp(`^(${COMPACT_DATE_SOURCE})$`), (_, date: string) => translateCompactDate(date)],
    [
      /^(Today|Yesterday) at (\d{1,2}):([0-5]\d) ([AP]M)$/,
      (_, day: string, hour: string, minute: string, meridiem: string) =>
        `${day === 'Today' ? '今天' : '昨天'} ${formatClock(hour, minute, meridiem)}`
    ],

    // 时间范围：Last 7 days → 最近 7 天、Past 24 hours → 过去 24 小时
    [
      /^(Last|Past) (\d+) (hours?|days?|weeks?|months?|years?)$/,
      (_, range: string, amount: string, unit: string) => joinCjk(range === 'Last' ? '最近' : '过去', duration(amount, unit))
    ],
    // 独立时长：24 hours、30 days、1 week
    [/^(\d+) (seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/, (_, amount: string, unit: string) => duration(amount, unit)],

    // 编辑历史
    [/^Edited (\d[\d,]*) times?$/, '已编辑 $1 次'],
    [/^edited by ([\w.-]+(?:\[bot\])?)$/, '由 $1 编辑']
  ]
} satisfies PageDictionary
