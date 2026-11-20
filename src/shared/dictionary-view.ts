/**
 * 内置词库的浏览（设置页）：语言包展开成「原文 → 译文」的行。
 * 全局词条（static）、名称区域的词条（标签、星标列表、议题类型）为全局；页面词条（scoped）、正则、行内句规则、区域词条注明页面类型。
 * 同一原文的全局词条先收录的生效，只列生效的一条；译文是函数（按匹配结果生成）的显示为「—」
 */
import { tableEntries } from '../core/table'
import type { LocaleBundle, PageKey, RegExpRule } from '../core/types'

export interface DictionaryRow {
  readonly source: string
  readonly target: string
  /** 生效的页面类型；全局为 undefined */
  readonly page?: PageKey
  /** 搜索用：原文、译文、页面类型，小写 */
  readonly haystack: string
}

/** 译文是函数时显示的文字 */
export const DYNAMIC_TARGET = '—'

function row(source: string, target: string, page?: PageKey): DictionaryRow {
  return { source, target, ...(page ? { page } : {}), haystack: `${source}\n${target}\n${page ?? ''}`.toLowerCase() }
}

function targetText(target: unknown): string {
  return typeof target === 'string' ? target : DYNAMIC_TARGET
}

function ruleRows(rules: readonly RegExpRule[] | undefined, page?: PageKey): DictionaryRow[] {
  return (rules ?? []).map(([pattern, target]) => row(String(pattern), targetText(target), page))
}

/** 语言包展开成行，按语言包顺序 */
export function dictionaryRows(bundle: LocaleBundle): DictionaryRow[] {
  const rows: DictionaryRow[] = []
  /** 全局表（static 与各名称区域分开）中已收录的原文 */
  const seen = new Map<string, Set<string>>()
  const addGlobal = (kind: string, entries: readonly [string, string][]): void => {
    let keys = seen.get(kind)
    if (!keys) {
      keys = new Set()
      seen.set(kind, keys)
    }
    for (const [source, target] of entries) {
      if (keys.has(source)) continue
      keys.add(source)
      rows.push(row(source, target))
    }
  }
  for (const [page, dictionary] of bundle) {
    addGlobal('static', tableEntries(dictionary.static))
    for (const [source, target] of tableEntries(dictionary.scoped)) rows.push(row(source, target, page))
    rows.push(...ruleRows(dictionary.regexp, page))
    for (const [pattern, target] of dictionary.inline ?? []) rows.push(row(String(pattern), targetText(target), page))
    for (const [, table] of dictionary.contextual ?? [])
      for (const [source, target] of Object.entries(table)) rows.push(row(source, target, page))
    addGlobal('labels', tableEntries(dictionary.labels))
    addGlobal('labelDescriptions', tableEntries(dictionary.labelDescriptions))
    rows.push(...ruleRows(dictionary.labelRegexp))
    addGlobal('listNames', tableEntries(dictionary.listNames))
    addGlobal('issueTypes', tableEntries(dictionary.issueTypes))
  }
  return rows
}

/** 按原文、译文、页面类型筛选（不区分大小写）；空白分隔的多个词都要命中 */
export function filterDictionaryRows(rows: readonly DictionaryRow[], query: string): readonly DictionaryRow[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return rows
  return rows.filter(item => words.every(word => item.haystack.includes(word)))
}
