import { generalizeKey, keyMatches, NUM_SLOT, patternKey, patternRegExp } from './inline-key'
import { createRegExpIndex, type RegExpIndex } from './regexp-index'
import { addEntries, type Table } from './table'
import { FULL_PUNCT_END_RE, FULL_PUNCT_START_RE, hasLatin, normalizeText } from './text'
import type { AttributeRule, ContextualRule, InlineRule, LabelPart, LocaleBundle, PageKey, RegExpReplacer, RegExpRule } from './types'

export { hasLatin, normalizeText }

const LEADING_SPACE_RE = /^\s*/
const TRAILING_SPACE_RE = /\s*$/
const DEFAULT_MAX_CACHE_SIZE = 5000
/** 多句文本的句子边界：句末的 . ! ? 后接空白、下一句以大写字母开头 */
const SENTENCE_BREAK_RE = /(?<=[.!?])\s+(?=[A-Z])/
/**
 * 句末多出的一个句点：服务器把几条错误信息用「. 」拼成一段时，本身以 . ! ? 结尾的那条后面会多一个句点
 * （Domain is not a valid public domain.. Domain is not properly formatted.），查词条时再去掉；省略号（Loading...）照原样先查
 */
const EXTRA_PERIOD_RE = /[.!?]\.$/
/** 按句翻译的句数上限：更长的多是用户内容或说明文字，整段没有词条就不拆 */
const MAX_SENTENCES = 6

export interface MatcherOptions {
  /**
   * 用户自定义词条，优先于内置词条与正则（属性规则、行内句由调用方先查，命中时不查词条）；
   * 标签区域不参与（见 translateLabel）
   */
  readonly custom?: Readonly<Record<string, string>>
  /** 每个页面范围的缓存上限 */
  readonly maxCacheSize?: number
}

export interface Matcher {
  /** 翻译已规范化的文本；未命中返回 undefined */
  translate(text: string, pages: readonly PageKey[]): string | undefined
  /** 翻译原始文本并保留首尾空白（译文那一端是全角标点时不保留）；未命中返回 undefined */
  translateRaw(raw: string, pages: readonly PageKey[]): string | undefined
  /** 指定页面范围的额外忽略选择器 */
  ignoreSelectors(pages: readonly PageKey[]): readonly string[]
  /** 指定页面范围的属性规则：越具体的页面类型越靠前 */
  attributeRules(pages: readonly PageKey[]): readonly AttributeRule[]
  /** 行内句：key 为句型键（见 inline-key），返回用 {} 标出槽位的译文；未命中返回 undefined */
  translateInline(key: string, pages: readonly PageKey[]): string | undefined
  /** 指定页面范围内有无行内句规则 */
  hasInline(pages: readonly PageKey[]): boolean
  /** 指定页面范围的整段合并选择器 */
  mergeSelectors(pages: readonly PageKey[]): readonly string[]
  /**
   * 名称区域里的文字（原文）：规范化后整段（区分大小写）命中时返回译文，首尾空白同 translateRaw；否则返回 undefined。
   * 标签名称区域（part 为 name）只查名称表 labels，标签说明区域只查说明表 labelDescriptions、再试标签正则 labelRegexp，
   * 星标列表名称区域（list）只查预置名称表 listNames，议题类型名称区域（type）只查默认类型名称表 issueTypes。
   * 都全局生效；static / scoped / regexp 不参与，自定义词条也不参与（同属性规则：令牌、说明提示与无障碍名称里的
   * 默认标签都按语言包，译名一致）
   */
  translateLabel(raw: string, part: LabelPart): string | undefined
  /** 有无名称表、说明表、预置列表名、默认类型名条目或标签正则 */
  hasLabels(): boolean
  /**
   * 区域词条（见 ContextualRule）：原始文本规范化后在各区域词条表中的译文（首尾空白同 translateRaw），
   * 返回 [选择器, 译文]，越具体的页面类型越靠前，同一页面类型按收录顺序；没有时返回空数组
   */
  contextual(raw: string, pages: readonly PageKey[]): readonly (readonly [selector: string, translation: string])[]
  /** 指定页面范围内有无区域词条 */
  hasContextual(pages: readonly PageKey[]): boolean
}

/** 行内句的字符串句型 */
interface InlineEntry {
  /** 句型键 */
  readonly key: string
  /** 键中的数字槽位数：越多越具体 */
  readonly numeric: number
  readonly translation: string | RegExpReplacer
}

interface CompiledPage {
  /** 各词典的 scoped 词条表（任一运行时形态，见 core/table），按收录顺序（同一原文先收录的生效） */
  readonly scopedSources: Table[]
  /** scoped 词条合并后的查找表：第一次查本页面类型时建立（页面只用到少数几个页面类型） */
  scoped?: Map<string, string>
  readonly regexp: RegExpRule[]
  readonly ignore: string[]
  readonly attributeRules: AttributeRule[]
  /**
   * 行内句：字符串句型按放宽后的键（数字槽位换成普通槽位）分组。组内数字槽位多的在前，同样多时按收录顺序；
   * 同一句型先收录的生效
   */
  readonly inlineStrings: Map<string, readonly InlineEntry[]>
  /** 行内句：正则句型（槽位已换成槽位字符） */
  readonly inlineRules: RegExpRule[]
  readonly mergeText: string[]
  /** 区域词条：选择器与规范化原文 → 译文的表，按收录顺序 */
  readonly contextual: ContextualEntry[]
  /** 正则索引：第一次用到时建立（同一页面类型的多个词典此时已合并） */
  index?: RegExpIndex
}

/** 区域词条（见 ContextualRule） */
interface ContextualEntry {
  readonly selector: string
  readonly table: ReadonlyMap<string, string>
}

function compileContextual([selector, table]: ContextualRule): ContextualEntry {
  const map = new Map<string, string>()
  for (const [key, value] of Object.entries(table)) {
    const normalized = normalizeText(key)
    if (normalized && !map.has(normalized)) map.set(normalized, value)
  }
  return { selector, table: map }
}

/** 页面类型的 scoped 查找表：第一次用到时按收录顺序合并（压缩串此时才解开） */
function scopedOf(page: CompiledPage): Map<string, string> {
  if (page.scoped) return page.scoped
  const scoped = new Map<string, string>()
  for (const source of page.scopedSources) addEntries(scoped, source)
  page.scoped = scoped
  return scoped
}

function compileCustom(custom: Readonly<Record<string, string>> | undefined): Map<string, string> {
  const map = new Map<string, string>()
  for (const [key, value] of Object.entries(custom ?? {})) {
    const normalized = normalizeText(key)
    if (normalized && value.trim()) map.set(normalized, value)
  }
  return map
}

/** 加上原文开头的空白；译文以全角标点开头时不加（全角标点两侧不留空白，那一端不保留原文的空白） */
export function withLeading(raw: string, result: string): string {
  return FULL_PUNCT_START_RE.test(result) ? result : (LEADING_SPACE_RE.exec(raw)?.[0] ?? '') + result
}

/** 加上原文结尾的空白；译文以全角标点结尾时不加 */
export function withTrailing(raw: string, result: string): string {
  return FULL_PUNCT_END_RE.test(result) ? result : result + (TRAILING_SPACE_RE.exec(raw)?.[0] ?? '')
}

/** 替换函数查表误中原型链上的键（constructor、toString、__proto__ 等）时，拼进译文的函数源码或对象字样 */
const PROTOTYPE_LEAK_RE = /\[native code\]|\[object Object\]/

/** 调用替换函数：出错、或译文混入原文没有的原型链取值时算未命中 */
function callReplacer(source: string, replace: () => string): string | undefined {
  try {
    const result = replace()
    return PROTOTYPE_LEAK_RE.test(result) && !PROTOTYPE_LEAK_RE.test(source) ? undefined : result
  } catch {
    // 单条规则出错（如数字过大时 Intl 抛 RangeError）只算未命中，不中断整页翻译
    return undefined
  }
}

export function applyRule(text: string, [pattern, replacement]: RegExpRule): string | undefined {
  const match = pattern.exec(text)
  if (!match) return undefined
  if (typeof replacement === 'string') return text.replace(pattern, replacement)
  return callReplacer(text, () => replacement(match[0], ...match.slice(1).map(group => group ?? '')))
}

function addInline(page: CompiledPage, [pattern, translation]: InlineRule): void {
  if (typeof pattern !== 'string') {
    page.inlineRules.push([patternRegExp(pattern), translation])
    return
  }
  const key = patternKey(pattern)
  const general = generalizeKey(key)
  const group = page.inlineStrings.get(general) ?? []
  if (group.some(entry => entry.key === key)) return
  const entry: InlineEntry = { key, numeric: key.split(NUM_SLOT).length - 1, translation }
  const at = group.findIndex(other => other.numeric < entry.numeric)
  page.inlineStrings.set(general, at < 0 ? [...group, entry] : [...group.slice(0, at), entry, ...group.slice(at)])
}

/** 字符串句型的译文：替换函数以整句键为参数调用，出错算未命中 */
function exactInline(translation: string | RegExpReplacer, key: string): string | undefined {
  if (typeof translation === 'string') return translation
  return callReplacer(key, () => translation(key))
}

function emptyPage(): CompiledPage {
  return {
    scopedSources: [],
    regexp: [],
    ignore: [],
    attributeRules: [],
    inlineStrings: new Map(),
    inlineRules: [],
    mergeText: [],
    contextual: []
  }
}

export function createMatcher(bundle: LocaleBundle, options: MatcherOptions = {}): Matcher {
  /** 全局 static：按语言包顺序收录，同一原文先收录的生效（static / scoped 只经 core/table 读取） */
  const globalStatic = new Map<string, string>()
  /** 名称表、说明表：全局，按语言包顺序收录，同一原文先收录的生效（同 static，只经 core/table 读取） */
  const labelNames = new Map<string, string>()
  const labelDescriptions = new Map<string, string>()
  /** 星标列表的预置名称：全局，同名称表 */
  const listNames = new Map<string, string>()
  /** 默认议题类型的名称：全局，同名称表 */
  const issueTypes = new Map<string, string>()
  /** 标签正则（说明区域）：全局，按语言包顺序 */
  const labelRegexp: RegExpRule[] = []
  const pages = new Map<PageKey, CompiledPage>()
  for (const [key, dict] of bundle) {
    const page = pages.get(key) ?? emptyPage()
    pages.set(key, page)
    addEntries(globalStatic, dict.static)
    addEntries(labelNames, dict.labels)
    addEntries(labelDescriptions, dict.labelDescriptions)
    addEntries(listNames, dict.listNames)
    addEntries(issueTypes, dict.issueTypes)
    labelRegexp.push(...(dict.labelRegexp ?? []))
    if (dict.scoped) page.scopedSources.push(dict.scoped)
    page.regexp.push(...(dict.regexp ?? []))
    page.ignore.push(...(dict.ignore ?? []))
    page.attributeRules.push(...(dict.attributeRules ?? []))
    for (const rule of dict.inline ?? []) addInline(page, rule)
    page.mergeText.push(...(dict.mergeText ?? []))
    page.contextual.push(...(dict.contextual ?? []).map(compileContextual))
  }
  const custom = compileCustom(options.custom)
  const maxCacheSize = options.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE
  const caches = new Map<string, Map<string, string | null>>()

  function lookup(text: string, scope: readonly PageKey[]): string | undefined {
    const customHit = custom.get(text)
    if (customHit !== undefined) return customHit
    for (let i = scope.length - 1; i >= 0; i--) {
      const page = pages.get(scope[i]!)
      const hit = page && scopedOf(page).get(text)
      if (hit !== undefined) return hit
    }
    const globalHit = globalStatic.get(text)
    if (globalHit !== undefined) return globalHit
    for (let i = scope.length - 1; i >= 0; i--) {
      const page = pages.get(scope[i]!)
      if (!page || page.regexp.length === 0) continue
      page.index ??= createRegExpIndex(page.regexp)
      for (const { rule, prefix } of page.index.candidates(text)) {
        if (!text.startsWith(prefix)) continue
        const result = applyRule(text, rule)
        if (result !== undefined) return result
      }
    }
    return undefined
  }

  /**
   * 整段没有词条的多句文本：逐句查词条，每句都有译文时拼成一段（前一句译文以全角标点结尾时直接相接，否则隔一个空格）；
   * 有一句没有就算未命中，整段保持原文
   */
  function lookupSentences(text: string, scope: readonly PageKey[]): string | undefined {
    const sentences = text.split(SENTENCE_BREAK_RE)
    if (sentences.length < 2 || sentences.length > MAX_SENTENCES) return undefined
    let result = ''
    for (const sentence of sentences) {
      const translated = lookup(sentence, scope) ?? (EXTRA_PERIOD_RE.test(sentence) ? lookup(sentence.slice(0, -1), scope) : undefined)
      if (translated === undefined) return undefined
      result += result && !FULL_PUNCT_END_RE.test(result) ? ` ${translated}` : translated
    }
    return result
  }

  function translate(text: string, scope: readonly PageKey[]): string | undefined {
    if (!text || !hasLatin(text)) return undefined
    const scopeKey = scope.join('|')
    let cache = caches.get(scopeKey)
    if (!cache) {
      cache = new Map()
      caches.set(scopeKey, cache)
    }
    const cached = cache.get(text)
    if (cached !== undefined) return cached ?? undefined
    const result = lookup(text, scope) ?? lookupSentences(text, scope)
    if (cache.size >= maxCacheSize) cache.clear()
    cache.set(text, result ?? null)
    return result
  }

  function translateRaw(raw: string, scope: readonly PageKey[]): string | undefined {
    const result = translate(normalizeText(raw), scope)
    return result === undefined ? undefined : withTrailing(raw, withLeading(raw, result))
  }

  function ignoreSelectors(scope: readonly PageKey[]): readonly string[] {
    return scope.flatMap(key => pages.get(key)?.ignore ?? [])
  }

  function attributeRules(scope: readonly PageKey[]): readonly AttributeRule[] {
    return [...scope].reverse().flatMap(key => pages.get(key)?.attributeRules ?? [])
  }

  const inlineCaches = new Map<string, Map<string, string | null>>()

  /**
   * 越具体的页面类型越优先。同一页面类型先查字符串句型：{} 对应任一槽位，{#} 只对应数字槽位，
   * 对上的 {#} 越多越优先，同样多时先收录的优先；再按顺序试正则句型。替换函数出错算未命中，接着试后面的句型
   */
  function lookupInline(key: string, scope: readonly PageKey[]): string | undefined {
    const general = generalizeKey(key)
    for (let i = scope.length - 1; i >= 0; i--) {
      const page = pages.get(scope[i]!)
      if (!page) continue
      for (const entry of page.inlineStrings.get(general) ?? []) {
        const hit = keyMatches(entry.key, key) ? exactInline(entry.translation, key) : undefined
        if (hit !== undefined) return hit
      }
      for (const rule of page.inlineRules) {
        const result = applyRule(key, rule)
        if (result !== undefined) return result
      }
    }
    return undefined
  }

  function translateInline(key: string, scope: readonly PageKey[]): string | undefined {
    if (!key || !hasLatin(key)) return undefined
    const scopeKey = scope.join('|')
    let cache = inlineCaches.get(scopeKey)
    if (!cache) {
      cache = new Map()
      inlineCaches.set(scopeKey, cache)
    }
    const cached = cache.get(key)
    if (cached !== undefined) return cached ?? undefined
    const result = lookupInline(key, scope)
    if (cache.size >= maxCacheSize) cache.clear()
    cache.set(key, result ?? null)
    return result
  }

  function hasInline(scope: readonly PageKey[]): boolean {
    return scope.some(key => {
      const page = pages.get(key)
      return page !== undefined && (page.inlineStrings.size > 0 || page.inlineRules.length > 0)
    })
  }

  function mergeSelectors(scope: readonly PageKey[]): readonly string[] {
    return scope.flatMap(key => pages.get(key)?.mergeText ?? [])
  }

  /** 标签正则的索引：第一次用到时建立 */
  let labelRuleIndex: RegExpIndex | undefined
  const hasLabels = labelNames.size > 0 || labelDescriptions.size > 0 || labelRegexp.length > 0 || listNames.size > 0 || issueTypes.size > 0

  /** 规范化原文在说明表中的译文；表中没有时按顺序试标签正则 */
  function lookupLabelDescription(text: string): string | undefined {
    const hit = labelDescriptions.get(text)
    if (hit !== undefined || labelRegexp.length === 0) return hit
    labelRuleIndex ??= createRegExpIndex(labelRegexp)
    for (const { rule, prefix } of labelRuleIndex.candidates(text)) {
      if (!text.startsWith(prefix)) continue
      const result = applyRule(text, rule)
      if (result !== undefined) return result
    }
    return undefined
  }

  /** 规范化原文在所在区域的表中的译文 */
  function lookupLabel(text: string, part: LabelPart): string | undefined {
    switch (part) {
      case 'name':
        return labelNames.get(text)
      case 'list':
        return listNames.get(text)
      case 'type':
        return issueTypes.get(text)
      case 'description':
        return lookupLabelDescription(text)
    }
  }

  function contextual(raw: string, scope: readonly PageKey[]): readonly (readonly [string, string])[] {
    const text = normalizeText(raw)
    const hits: [string, string][] = []
    for (let i = scope.length - 1; i >= 0; i--) {
      for (const { selector, table } of pages.get(scope[i]!)?.contextual ?? []) {
        const hit = table.get(text)
        if (hit !== undefined) hits.push([selector, withTrailing(raw, withLeading(raw, hit))])
      }
    }
    return hits
  }

  function hasContextual(scope: readonly PageKey[]): boolean {
    return scope.some(key => (pages.get(key)?.contextual.length ?? 0) > 0)
  }

  function translateLabel(raw: string, part: LabelPart): string | undefined {
    if (!hasLabels) return undefined
    const label = lookupLabel(normalizeText(raw), part)
    return label === undefined ? undefined : withTrailing(raw, withLeading(raw, label))
  }

  return {
    translate,
    translateRaw,
    ignoreSelectors,
    attributeRules,
    translateInline,
    hasInline,
    mergeSelectors,
    translateLabel,
    hasLabels: () => hasLabels,
    contextual,
    hasContextual
  }
}
