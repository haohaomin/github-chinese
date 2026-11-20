/**
 * 简体、繁体词典共用的工具：日期、相对时间、中英文拼接、词典合并。
 * 各语言的 helpers.ts 用 createTimeHelpers 生成本语言的相对时间（Intl 与「刚刚 / 约」等用词），并转出其余部分。
 * 相对时间照 Intl 的写法（简体 3天前，繁体 3 天前），日期不加空格（2024年1月5日），与引擎对 <relative-time> 输出的处理一致。
 *
 * *_SOURCE 常量是不含捕获组的正则片段，可拼进词典规则：
 *   [new RegExp(`^Updated (${TIME_SOURCE})$`), (_, time) => `${translateTime(time)}更新`]
 */

import { mergeTables } from '../../core/table'
import { isLocalOffset, spaceDigits, zoneOffset } from '../../core/time-text'
import type { PageDictionary } from '../../core/types'

/** 时区写法的换算与引擎去掉时间元素里的本地时区名共用一份（见 core/time-text） */
export { spaceDigits, zoneOffset }

const MONTHS: Readonly<Record<string, number>> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
}

const UNITS = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'] as const
type Unit = (typeof UNITS)[number]

export const MONTH_SOURCE =
  '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'

export const DATE_SOURCE = `(?:${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})?|${MONTH_SOURCE},? \\d{4}|\\d{1,2} ${MONTH_SOURCE},? \\d{4})`

const UNIT_SOURCE = '(?:second|minute|hour|day|week|month|year)'

export const RELATIVE_SOURCE = `(?:(?:about |almost |over )?(?:\\d+|an?|one) ${UNIT_SOURCE}s? ago|in (?:\\d+|an?|one) ${UNIT_SOURCE}s?|just now|now|yesterday|today|tomorrow|(?:last|next|this) (?:week|month|year))`

export const TIME_SOURCE = `(?:${RELATIVE_SOURCE}|(?:on )?${DATE_SOURCE})`

function monthNumber(name: string): number | undefined {
  return MONTHS[name.slice(0, 3).toLowerCase()]
}

const CJK_END_RE = /[一-鿿]$/
const CJK_START_RE = /^[一-鿿]/
const LATIN_END_RE = /[A-Za-z0-9]$/
const LATIN_START_RE = /^[A-Za-z0-9]/

/** 拼接两段文字：一侧是中文、另一侧是字母或数字时补空格，中文与中文、标点直接相连 */
export function joinCjk(left: string, right: string): string {
  const spaced = (CJK_END_RE.test(left) && LATIN_START_RE.test(right)) || (LATIN_END_RE.test(left) && CJK_START_RE.test(right))
  return spaced ? `${left} ${right}` : `${left}${right}`
}

/** 数字或 a / an / one；超出安全整数返回 undefined（Infinity 会让 Intl 抛 RangeError，大数会丢精度） */
function parseAmount(raw: string): number | undefined {
  if (!/^\d+$/.test(raw)) return 1
  const amount = Number(raw)
  return Number.isSafeInteger(amount) ? amount : undefined
}

function isUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value)
}

/** 2024, 1, 5 → 2024年1月5日；缺年 → 1月5日；缺日 → 2024年1月 */
export function formatDate(year: number | undefined, month: number, day: number | undefined): string {
  const y = year === undefined ? '' : `${year}年`
  const d = day === undefined ? '' : `${day}日`
  return `${y}${month}月${d}`
}

const DATE_MDY_RE = new RegExp(`^(?:on )?(${MONTH_SOURCE}) (\\d{1,2})(?:, (\\d{4}))?$`)
const DATE_MY_RE = new RegExp(`^(?:on )?(${MONTH_SOURCE}),? (\\d{4})$`)
const DATE_DMY_RE = new RegExp(`^(?:on )?(\\d{1,2}) (${MONTH_SOURCE}),? (\\d{4})$`)

/**
 * "Jan 5, 2024" → 2024年1月5日；"January 2024" → 2024年1月；"5 January 2024" → 2024年1月5日。
 * 三种写法都可带 on 前缀（与 TIME_SOURCE 一致）："on Jan 5" → 1月5日
 */
export function translateDate(text: string): string | undefined {
  const value = text.trim()
  const mdy = DATE_MDY_RE.exec(value)
  if (mdy) {
    const month = monthNumber(mdy[1]!)
    if (month) return formatDate(mdy[3] ? Number(mdy[3]) : undefined, month, Number(mdy[2]))
  }
  const my = DATE_MY_RE.exec(value)
  if (my) {
    const month = monthNumber(my[1]!)
    if (month) return formatDate(Number(my[2]), month, undefined)
  }
  const dmy = DATE_DMY_RE.exec(value)
  if (dmy) {
    const month = monthNumber(dmy[2]!)
    if (month) return formatDate(Number(dmy[3]), month, Number(dmy[1]))
  }
  return undefined
}

const MINUTE_MS = 60_000

/**
 * 原文的时区与浏览器本地时区在该时刻相同（同一偏移）：按原文时区的年月日时分（24 小时制）换算出时刻再比较。
 * 原文缺年份时按今年算。按调用时的系统时区判断；译文由匹配器按原文缓存，改了系统时区后由 core/controller 重建匹配器重译
 */
export function isLocalZone(zone: string, year: number | undefined, month: number, day: number, hour: number, minute: number): boolean {
  const offset = zoneOffset(zone)
  if (offset === undefined) return false
  const instant = Date.UTC(year ?? new Date().getFullYear(), month - 1, day, hour, minute) - offset * MINUTE_MS
  return isLocalOffset(offset, instant)
}

/** 一种语言的相对时间用词 */
export interface TimeWords {
  /** Intl 语言 */
  readonly locale: string
  /** now、just now、yesterday、today、tomorrow 的译法 */
  readonly namedDays: Readonly<Record<'now' | 'just now' | 'yesterday' | 'today' | 'tomorrow', string>>
  /** about、almost、over 的前缀 */
  readonly qualifiers: Readonly<Record<'about' | 'almost' | 'over', string>>
}

export interface TimeHelpers {
  /** Intl 相对时间：relativeTime(-3, 'day') → 3天前（繁体 3 天前） */
  relativeTime(amount: number, unit: Intl.RelativeTimeFormatUnit): string
  /** "3 days ago" → 3天前；"about 1 year ago" → 约1年前；"in 2 hours" → 2小时后；"yesterday" → 昨天 */
  translateRelativeTime(text: string): string | undefined
  /** 相对时间或日期；都不匹配时原样返回 */
  translateTime(text: string): string
}

const RELATIVE_PAST_RE = new RegExp(`^(?:(about|almost|over) )?(\\d+|an?|one) (${UNIT_SOURCE})s? ago$`, 'i')
const RELATIVE_FUTURE_RE = new RegExp(`^in (\\d+|an?|one) (${UNIT_SOURCE})s?$`, 'i')
const RELATIVE_NAMED_RE = /^(last|next|this) (week|month|year)$/i
const NAMED_OFFSET: Readonly<Record<string, number>> = { last: -1, this: 0, next: 1 }

/** 按语言生成相对时间的翻译函数 */
export function createTimeHelpers(words: TimeWords): TimeHelpers {
  const relativeFormat = new Intl.RelativeTimeFormat(words.locale, { numeric: 'auto' })
  /** 带前缀时用纯数字格式，避免「约去年」「约昨天」 */
  const numericFormat = new Intl.RelativeTimeFormat(words.locale, { numeric: 'always' })
  /** 用 Map 查找，constructor、__proto__ 等原型链键不会命中 */
  const namedDays: ReadonlyMap<string, string> = new Map(Object.entries(words.namedDays))
  const qualifiers: ReadonlyMap<string, string> = new Map(Object.entries(words.qualifiers))

  function relativeTime(amount: number, unit: Intl.RelativeTimeFormatUnit): string {
    return relativeFormat.format(amount, unit)
  }

  function translateRelativeTime(text: string): string | undefined {
    const lower = text.trim().toLowerCase()
    const named = namedDays.get(lower)
    if (named !== undefined) return named

    const past = RELATIVE_PAST_RE.exec(lower)
    if (past && isUnit(past[3]!)) {
      const amount = parseAmount(past[2]!)
      if (amount === undefined) return undefined
      const qualifier = past[1] === undefined ? undefined : qualifiers.get(past[1])
      if (qualifier === undefined) return relativeTime(-amount, past[3])
      return qualifier + numericFormat.format(-amount, past[3])
    }
    const future = RELATIVE_FUTURE_RE.exec(lower)
    if (future && isUnit(future[2]!)) {
      const amount = parseAmount(future[1]!)
      return amount === undefined ? undefined : relativeTime(amount, future[2])
    }

    const relative = RELATIVE_NAMED_RE.exec(lower)
    if (relative && isUnit(relative[2]!)) return relativeTime(NAMED_OFFSET[relative[1]!]!, relative[2])
    return undefined
  }

  return {
    relativeTime,
    translateRelativeTime,
    translateTime: text => translateRelativeTime(text) ?? translateDate(text) ?? text
  }
}

/**
 * 合并多个词典：static / scoped / labels / labelDescriptions / listNames / issueTypes 按顺序合并（先出现者优先；构建产物中子表是压缩串，不复制，
 * 记下子表由 matcher 按顺序收录，见 core/table 的 mergeTables），
 * regexp / ignore / attributeRules / inline / mergeText / contextual / labelRegexp 依次拼接
 */
export function mergeDictionaries(...dicts: readonly PageDictionary[]): PageDictionary {
  return {
    static: mergeTables(dicts.map(dict => dict.static)),
    scoped: mergeTables(dicts.map(dict => dict.scoped)),
    regexp: dicts.flatMap(dict => dict.regexp ?? []),
    ignore: dicts.flatMap(dict => dict.ignore ?? []),
    attributeRules: dicts.flatMap(dict => dict.attributeRules ?? []),
    inline: dicts.flatMap(dict => dict.inline ?? []),
    mergeText: dicts.flatMap(dict => dict.mergeText ?? []),
    contextual: dicts.flatMap(dict => dict.contextual ?? []),
    labels: mergeTables(dicts.map(dict => dict.labels)),
    labelDescriptions: mergeTables(dicts.map(dict => dict.labelDescriptions)),
    labelRegexp: dicts.flatMap(dict => dict.labelRegexp ?? []),
    listNames: mergeTables(dicts.map(dict => dict.listNames)),
    issueTypes: mergeTables(dicts.map(dict => dict.issueTypes))
  }
}
