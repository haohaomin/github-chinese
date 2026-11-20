/**
 * 词典文件的组织规则：子文件 <组>/<名>.ts 由 <组>.ts（或其他词典）用 mergeDictionaries 合并，
 * 顶层主文件在 index.ts 注册。check:locale、coverage:locale 与接线测试共用。
 * 合并关系按内容判断：子文件的全部词条都出现在某个词典里（正则、属性规则、行内句规则、区域词条、标签正则按同一对象），就算被它合并。
 */
import { readdirSync, statSync } from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import type { AttributeRule, ContextualRule, InlineRule, LocaleBundle, PageDictionary, PageKey, RegExpRule } from '../src/core/types'

export const LOCALE_DIR = resolve('src/locales/zh-CN')
const NON_DICTIONARY_FILES = new Set(['index.ts', 'helpers.ts'])
const DICTIONARY_FIELDS = new Set([
  'static',
  'scoped',
  'regexp',
  'ignore',
  'attributeRules',
  'inline',
  'mergeText',
  'contextual',
  'labels',
  'labelDescriptions',
  'labelRegexp',
  'listNames',
  'issueTypes'
])
/** 原文 → 译文的表 */
type TableField = 'static' | 'scoped' | 'labels' | 'labelDescriptions' | 'listNames' | 'issueTypes'
const TABLE_FIELDS: readonly TableField[] = ['static', 'scoped', 'labels', 'labelDescriptions', 'listNames', 'issueTypes']

/** 顶层主文件与子目录中的文件（绝对路径，按名称排序）；顶层的 index.ts、helpers.ts 不是词典 */
export function listDictionaryFiles(dir = LOCALE_DIR, top = true): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap(name => {
      const full = resolve(dir, name)
      if (statSync(full).isDirectory()) return listDictionaryFiles(full, false)
      if (!name.endsWith('.ts')) return []
      return top && NON_DICTIONARY_FILES.has(name) ? [] : [full]
    })
}

/** 文件相对 root 的位置：top 顶层主文件，sub 子目录中的文件，outside 不在 root 下 */
export function placeOf(file: string, root = LOCALE_DIR): 'top' | 'sub' | 'outside' {
  const rel = relative(root, file)
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) return 'outside'
  return /[\\/]/.test(rel) ? 'sub' : 'top'
}

/** 顶层的 index.ts、helpers.ts：不是词典 */
export function isNonDictionaryFile(file: string, root = LOCALE_DIR): boolean {
  return placeOf(file, root) === 'top' && NON_DICTIONARY_FILES.has(basename(file))
}

/** 子文件 <组>/<名>.ts 约定的上级文件 <组>.ts；其他文件返回 undefined */
export function parentOf(file: string, root = LOCALE_DIR): string | undefined {
  return placeOf(file, root) === 'sub' ? `${dirname(file)}.ts` : undefined
}

/**
 * 只含词典字段（static、scoped、regexp、ignore、attributeRules、inline、mergeText、contextual、labels、labelDescriptions、
 * labelRegexp、listNames、issueTypes，至少一个）的对象
 */
export function isDictionaryLike(value: unknown): value is PageDictionary {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every(key => DICTIONARY_FIELDS.has(key))
}

/**
 * 模块分类：有默认导出的是词典；子目录里没有默认导出、也没有词典形状具名导出的是共用工具；
 * 其余（顶层文件、或疑似漏写 export default 的子文件）算缺少默认导出
 */
export function classifyModule(
  module: Readonly<Record<string, unknown>>,
  place: 'top' | 'sub' | 'outside'
): 'dictionary' | 'helper' | 'missing-default' {
  if ('default' in module) return 'dictionary'
  if (place === 'sub' && !Object.values(module).some(isDictionaryLike)) return 'helper'
  return 'missing-default'
}

/** 结构不对的 static / scoped / labels / labelDescriptions / listNames / issueTypes 按空对象处理（结构错误由 check:locale 单独报告） */
export function recordOf(value: unknown): Readonly<Record<string, string>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, string>) : {}
}

export function arrayOf<T>(value: readonly T[] | undefined): readonly T[] {
  return Array.isArray(value) ? value : []
}

/** 没有任何词条 */
export function isEmptyDictionary(dict: PageDictionary): boolean {
  return (
    TABLE_FIELDS.every(field => Object.keys(recordOf(dict[field])).length === 0) &&
    arrayOf(dict.regexp).length === 0 &&
    arrayOf(dict.ignore).length === 0 &&
    arrayOf(dict.attributeRules).length === 0 &&
    arrayOf(dict.inline).length === 0 &&
    arrayOf(dict.mergeText).length === 0 &&
    arrayOf(dict.contextual).length === 0 &&
    arrayOf(dict.labelRegexp).length === 0
  )
}

interface Index {
  readonly rules: ReadonlySet<RegExpRule>
  readonly selectors: ReadonlySet<string>
  readonly attributeRules: ReadonlySet<AttributeRule>
  readonly inline: ReadonlySet<InlineRule>
  readonly mergeText: ReadonlySet<string>
  readonly contextual: ReadonlySet<ContextualRule>
  readonly labelRules: ReadonlySet<RegExpRule>
}

const indexes = new WeakMap<PageDictionary, Index>()

function indexOf(dict: PageDictionary): Index {
  let index = indexes.get(dict)
  if (!index) {
    index = {
      rules: new Set(arrayOf(dict.regexp)),
      selectors: new Set(arrayOf(dict.ignore)),
      attributeRules: new Set(arrayOf(dict.attributeRules)),
      inline: new Set(arrayOf(dict.inline)),
      mergeText: new Set(arrayOf(dict.mergeText)),
      contextual: new Set(arrayOf(dict.contextual)),
      labelRules: new Set(arrayOf(dict.labelRegexp))
    }
    indexes.set(dict, index)
  }
  return index
}

/** 子文件的全部词条都出现在 parent 中才算已合并（正则、属性规则、行内句规则、区域词条、标签正则按同一对象判断）；结构不对的字段按空处理 */
export function isMerged(child: PageDictionary, parent: PageDictionary): boolean {
  const { rules, selectors, attributeRules, inline, mergeText, contextual, labelRules } = indexOf(parent)
  return (
    TABLE_FIELDS.every(field => {
      const target = recordOf(parent[field])
      return Object.keys(recordOf(child[field])).every(key => Object.hasOwn(target, key))
    }) &&
    arrayOf(child.regexp).every(rule => rules.has(rule)) &&
    arrayOf(child.ignore).every(selector => selectors.has(selector)) &&
    arrayOf(child.attributeRules).every(rule => attributeRules.has(rule)) &&
    arrayOf(child.inline).every(rule => inline.has(rule)) &&
    arrayOf(child.mergeText).every(selector => mergeText.has(selector)) &&
    arrayOf(child.contextual).every(rule => contextual.has(rule)) &&
    arrayOf(child.labelRegexp).every(rule => labelRules.has(rule))
  )
}

/** 合并后译文与子文件不同的原文：被排在前面的词典覆盖了 */
export function overriddenKeys(child: PageDictionary, parent: PageDictionary): string[] {
  return TABLE_FIELDS.flatMap(field => {
    const target = recordOf(parent[field])
    return Object.entries(recordOf(child[field]))
      .filter(([key, value]) => Object.hasOwn(target, key) && target[key] !== value)
      .map(([key]) => `${field} ${JSON.stringify(key)}`)
  })
}

/** 每个词典合并了哪些子目录文件（含间接合并；空文件不算） */
export function mergedFiles(dicts: ReadonlyMap<string, PageDictionary>, root = LOCALE_DIR): Map<string, string[]> {
  const subs = [...dicts].filter(([file, dict]) => placeOf(file, root) === 'sub' && !isEmptyDictionary(dict))
  return new Map(
    [...dicts].map(([file, dict]) => [file, subs.filter(([sub, child]) => sub !== file && isMerged(child, dict)).map(([sub]) => sub)])
  )
}

/**
 * 词典自己的词条：去掉键与译文都和某个被合并文件相同的表条目，以及被合并文件的正则、选择器、属性规则、行内句规则、
 * 区域词条与标签正则
 */
export function ownEntries(dict: PageDictionary, children: readonly PageDictionary[]): PageDictionary {
  if (children.length === 0) return dict
  const childRules = new Set(children.flatMap(child => arrayOf(child.regexp)))
  const childSelectors = new Set(children.flatMap(child => arrayOf(child.ignore)))
  const childAttributeRules = new Set(children.flatMap(child => arrayOf(child.attributeRules)))
  const childInline = new Set(children.flatMap(child => arrayOf(child.inline)))
  const childMergeText = new Set(children.flatMap(child => arrayOf(child.mergeText)))
  const childContextual = new Set(children.flatMap(child => arrayOf(child.contextual)))
  const childLabelRules = new Set(children.flatMap(child => arrayOf(child.labelRegexp)))
  const own = (field: TableField): Record<string, string> =>
    Object.fromEntries(
      Object.entries(recordOf(dict[field])).filter(([key, value]) => !children.some(child => recordOf(child[field])[key] === value))
    )
  return {
    static: own('static'),
    scoped: own('scoped'),
    regexp: arrayOf(dict.regexp).filter(rule => !childRules.has(rule)),
    ignore: arrayOf(dict.ignore).filter(selector => !childSelectors.has(selector)),
    attributeRules: arrayOf(dict.attributeRules).filter(rule => !childAttributeRules.has(rule)),
    inline: arrayOf(dict.inline).filter(rule => !childInline.has(rule)),
    mergeText: arrayOf(dict.mergeText).filter(selector => !childMergeText.has(selector)),
    contextual: arrayOf(dict.contextual).filter(rule => !childContextual.has(rule)),
    labels: own('labels'),
    labelDescriptions: own('labelDescriptions'),
    labelRegexp: arrayOf(dict.labelRegexp).filter(rule => !childLabelRules.has(rule)),
    listNames: own('listNames'),
    issueTypes: own('issueTypes')
  }
}

/** 每个文件自己的词条 */
export function ownEntriesByFile(
  dicts: ReadonlyMap<string, PageDictionary>,
  merged: ReadonlyMap<string, readonly string[]>
): Map<string, PageDictionary> {
  return new Map(
    [...dicts].map(([file, dict]) => [
      file,
      ownEntries(
        dict,
        (merged.get(file) ?? []).flatMap(sub => dicts.get(sub) ?? [])
      )
    ])
  )
}

/** 主文件在语言包中注册的页面类型 */
export function registeredKeys(dict: PageDictionary, bundle: LocaleBundle): PageKey[] {
  return bundle.filter(([, registered]) => registered === dict).map(([key]) => key)
}

/** 每个文件生效的页面类型：已注册的主文件本身，以及被它（直接或间接）合并的文件 */
export function pageKeysByFile(
  dicts: ReadonlyMap<string, PageDictionary>,
  bundle: LocaleBundle,
  merged: ReadonlyMap<string, readonly string[]>,
  root = LOCALE_DIR
): Map<string, PageKey[]> {
  const keys = new Map<string, Set<PageKey>>()
  for (const [file, dict] of dicts) {
    if (placeOf(file, root) !== 'top') continue
    const registered = registeredKeys(dict, bundle)
    for (const target of [file, ...(merged.get(file) ?? [])]) {
      const set = keys.get(target) ?? new Set<PageKey>()
      for (const key of registered) set.add(key)
      keys.set(target, set)
    }
  }
  return new Map([...dicts.keys()].map(file => [file, [...(keys.get(file) ?? [])]]))
}

/** 语言包实际生效的全局 static：按注册顺序，先出现者优先（与匹配器一致） */
export function effectiveStatic(bundle: LocaleBundle): Map<string, string> {
  const result = new Map<string, string>()
  for (const [, dict] of bundle) {
    for (const [key, value] of Object.entries(recordOf(dict.static))) {
      if (!result.has(key)) result.set(key, value)
    }
  }
  return result
}

/** 输出用的相对路径，统一用 / */
export function displayPath(file: string): string {
  return relative(process.cwd(), file).replaceAll('\\', '/')
}
