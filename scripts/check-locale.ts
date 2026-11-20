/**
 * 校验词典文件。
 * 用法：bun run check:locale [--locale=zh-TW] [--redundant] [文件...]
 *   --locale（也可写 --locale zh-TW）：检查哪种语言的词典（src/locales/<语言>）。不写时按文件所在目录判断，默认 zh-CN；
 *   与文件所在目录不符、或同时给了两种语言的文件时报错退出。其他 -- 参数报错退出
 *   不带文件：检查该语言下全部词典（含子目录里的文件），并做跨文件检查
 *   --redundant：另列可删的 scoped（实际生效的全局 static 已有相同译文，且没有别的 scoped 给出不同译文）
 * 错误（退出码 1）：结构错误、缺少默认导出、键未规范化、正则未锚定 / 带 g、y、m、u、v 标志 / 顶层有 |、
 *   反向引用越界 / $<名称> 不是命名组、疑似灾难回溯、属性规则的属性名不是可翻译属性、原文无标点而译文有标点、
 *   原文结尾无标点而译文结尾有标点、行内句的句型没有槽位或未规范化、句型键长或子节点数超过引擎上限、
 *   译文槽位数与句型不同（含 $n、$<名称>、$& 带入的槽位）；static / scoped 的条目检查同样用于名称表 labels、
 *   说明表 labelDescriptions、星标列表名 listNames、默认议题类型名 issueTypes，regexp 的规则检查同样用于标签正则
 *   labelRegexp；跨文件：static 冲突、labels 冲突、labelDescriptions 冲突、listNames 冲突、issueTypes 冲突、
 *   同一页面类型的 scoped 冲突、
 *   子文件没被任何已注册的词典合并、
 *   主文件未在 index.ts 注册
 * 警告：中英文之间缺空格、中文后接半角标点、正则原文结尾无标点而替换文本结尾有标点、与其它文件重复、
 *   同组不同文件的 scoped 与 static 重复
 * 繁体（zh-TW）另查源码中所有含中文的字符串与模板字面量（含替换函数、模块内常量、共用工具；全量检查时另含
 *   helpers.ts、index.ts 与 src/locales/shared/；注释与抛出的错误信息除外）：含简体字（错误），大陆用语、弯引号（警告，引号用「」）
 * 疑似灾难回溯：按引擎实际执行的正则计时（行内句的槽位换成槽位字符），输入接在推导出的示例后面
 *   （开头与每个带量词的成分之前），另把各带量词的成分重复多次后接失配字符；两种输入每条正则各最多 128 处。
 *   推导不出示例的成分（如反向引用）之后不再接输入。
 * 顶层 index.ts、helpers.ts，以及子目录里既没有默认导出、也没有词典形状具名导出的模块视为共用工具，
 *   不做词典检查（繁体照样扫描字面量）。
 * 合并关系按内容判断（见 locale-wiring.ts），跨组合并的文件归各自所在文件，不重复计算。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Worker } from 'node:worker_threads'
import ts from 'typescript'
import { hasLatin, normalizeText } from '../src/core/matcher'
import { RULE_ONLY_ATTRIBUTES, TRANSLATABLE_ATTRIBUTES } from '../src/core/ignore'
import {
  MAX_SENTENCE_CHILDREN,
  MAX_SENTENCE_KEY,
  minChildren,
  NUM_SLOT,
  patternKey,
  patternRegExp,
  patternSlots,
  SLOT,
  slotCount
} from '../src/core/inline-key'
import { hasTopLevelAlternative } from '../src/core/regexp-index'
import type { LocaleBundle, PageDictionary, PageKey, RegExpRule } from '../src/core/types'
import {
  classifyModule,
  displayPath,
  effectiveStatic,
  isEmptyDictionary,
  isNonDictionaryFile,
  listDictionaryFiles,
  mergedFiles,
  ownEntriesByFile,
  pageKeysByFile,
  parentOf,
  placeOf,
  recordOf,
  registeredKeys
} from './locale-wiring'
import { ACCEPTED_WORDS, MAINLAND_TERMS } from './data/mainland-terms'
import { simplifiedChars } from './data/simplified-only'

/** 可检查的语言：目录名与 index.ts 导出的语言包名 */
const LOCALES: Readonly<Record<string, string>> = { 'zh-CN': 'zhCN', 'zh-TW': 'zhTW' }
const SHARED_DIR = resolve('src/locales/shared')

interface Command {
  readonly locale: string
  readonly redundant: boolean
  /** 指定的文件（绝对路径，去重）；为空时全量检查 */
  readonly files: readonly string[]
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

/** 文件所在的语言目录；不在 src/locales/<语言> 下时为 undefined */
function localeOfFile(file: string): string | undefined {
  return Object.keys(LOCALES).find(locale => placeOf(file, resolve('src/locales', locale)) !== 'outside')
}

function parseCommand(args: readonly string[]): Command {
  let locale: string | undefined
  let redundant = false
  const files: string[] = []
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!
    if (arg === '--redundant') redundant = true
    else if (arg === '--locale' || arg.startsWith('--locale=')) {
      locale = arg === '--locale' ? args[++index] : arg.slice('--locale='.length)
      if (locale === undefined || !Object.hasOwn(LOCALES, locale))
        fail(`未知语言 ${locale ?? '（缺少取值）'}，可选 ${Object.keys(LOCALES).join('、')}`)
    } else if (arg.startsWith('--')) fail(`未知参数 ${arg}`)
    else files.push(resolve(arg))
  }
  const fileLocales = [...new Set(files.flatMap(file => localeOfFile(file) ?? []))]
  if (fileLocales.length > 1) fail('简体、繁体词典文件要分开检查')
  const [fileLocale] = fileLocales
  if (locale !== undefined && fileLocale !== undefined && fileLocale !== locale)
    fail(`文件在 ${fileLocale} 目录下，与 --locale=${locale} 不符`)
  return { locale: locale ?? fileLocale ?? 'zh-CN', redundant, files: [...new Set(files)] }
}

const COMMAND = parseCommand(process.argv.slice(2))
const LOCALE = COMMAND.locale
const ROOT = resolve('src/locales', LOCALE)
const INDEX_FILE = resolve(ROOT, 'index.ts')
const BUNDLE_EXPORT = LOCALES[LOCALE]!
const TRADITIONAL = LOCALE === 'zh-TW'
const ALLOWED_KEYS = new Set([
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
/**
 * 回溯计时的通用输入：[重复片段, 结尾]，由计时线程补足到输入长度。结尾都带槽位字符：句型键必含槽位字符，
 * 且 V8 对单字节字符串会直接判定需要 Latin-1 以外字符的正则失配，测不出回溯
 */
const REDOS_INPUTS: readonly (readonly [unit: string, end: string])[] = [
  ['a', SLOT],
  ['a ', SLOT],
  ['1', SLOT],
  ['Aa1 ', `!${SLOT}`],
  ['a,', SLOT]
]
/** regexp 规则、属性规则的计时输入长度；行内句正则只匹配句型键，按句型键长度上限 */
const REDOS_INPUT_LENGTH = 4000
/** 带量词的成分重复多次后接的结尾：多数写法在此失配，迫使回溯 */
const REDOS_PUMP_END = `\u0000${SLOT}`
/** 每条正则最多在几处接上通用输入、最多重复几个带量词的成分（现有词典最多七十余处） */
const REDOS_MAX_CUTS = 128
const REDOS_LIMIT_MS = 30
/** 超时的输入最多计时几次取最小值，避免机器繁忙时误报 */
const REDOS_ATTEMPTS = 3
/** 单个输入的时限：超过即视为灾难回溯，结束线程后换新线程继续 */
const REDOS_TIMEOUT_MS = 2000
/** 推导示例时先试的字符 */
const SAMPLE_CHARS: readonly string[] = [...`aA1 .,:-_/#@()'"!?${SLOT}${NUM_SLOT}中\n`]
/** 成分（多为字符类）里写出的字符：\uXXXX、\xXX、\ 加单个字符、单个字符 */
const WRITTEN_CHAR_RE = /\\u[\da-fA-F]{4}|\\x[\da-fA-F]{2}|\\[\s\S]|[^\\]/g
const CJK_LATIN_RE = /[一-鿿][A-Za-z]|[A-Za-z][一-鿿]/
/** 中文后接半角标点，其后是空白、结尾或槽位（行内句译文中的槽位换成了 SLOT） */
const CJK_HALF_PUNCT_RE = new RegExp(`[一-鿿][,;:?!](?:\\s|$|${SLOT})`)
/** 原文中的标点（撇号、引号、括号、破折号也算） */
const SOURCE_PUNCT_RE = /[.,;:!?…"'“”‘’()—]/
/** 译文中的标点 */
const TARGET_PUNCT_RE = /[，。、；：？！“”‘’（）《》【】「」…—,.;:?!()"]/
const SOURCE_END_RE = /[.;:!?…]$/
const TARGET_END_RE = /[。；：？！….;:!?]$/
/** 正则以标点结尾（\.$、[.!?]$、:$、…$ 等）；只用于警告，宽松判断 */
const PATTERN_END_PUNCT_RE = /(?:\\[.?!]|[.;:!?…\]])\)?[?*+]?\$$/
/** 行内句的句型、译文中的槽位写法 */
const SLOT_MARK_RE = /\\?\{#?\\?\}/g
/** 字符串替换中的 $ 写法（同 String.prototype.replace）：$$、$&、$`、$'、$n / $nn、$<名称> */
const REPLACEMENT_REF_RE = /\$(?:([$&`'])|(\d\d?)|<([^>]*)>)/g
/** 正则转义：\uXXXX、\xXX、\cX、\k<名称>、\数字、其余单个字符（u / v 标志已报错，不按其写法推导） */
const ESCAPE_RE = /^\\(?:u[\da-fA-F]{4}|x[\da-fA-F]{2}|c[A-Za-z]|k<[^>]*>|\d+|[\s\S])/
/** 量词：* + ? {n} {n,} {n,m}，可带懒惰的 ? */
const QUANTIFIER_RE = /^(?:([*+?])|\{(\d+)(?:,\d*)?\})\??/
/** 不占字符的成分 */
const ZERO_WIDTH_RE = /^(?:\^|\$|\\[bB])$/
/** 反向引用：推不出示例 */
const BACKREFERENCE_RE = /^\\(?:[1-9]|k<)/
/** 捕获组的开头：( 后不是 ?，或是 (?<名称> */
const CAPTURE_RE = /^\((?:[^?]|\?<[^=!])/
/** 前瞻、后顾 */
const LOOKAROUND_RE = /^\(\?<?[=!]/
const LITERAL_ESCAPE_RE = /^\\[^\dA-Za-z]$/
const HEX_ESCAPE_RE = /^\\(?:u([\da-fA-F]{4})|x([\da-fA-F]{2}))$/

/** 回溯计时线程：主线程无法打断同步执行的正则，放到线程里跑，每测完一个输入回报一次；超时就结束线程 */
const REDOS_WORKER_SOURCE = `
const { parentPort } = require('node:worker_threads')
parentPort.on('message', ({ source, flags, inputs, length, limit, attempts }) => {
  const pattern = new RegExp(source, flags.replace(/[gy]/g, ''))
  for (const [prefix, unit, end] of inputs) {
    const count = Math.max(0, Math.floor((length - prefix.length - end.length) / unit.length))
    const input = prefix + unit.repeat(count) + end
    let elapsed = Infinity
    for (let attempt = 0; attempt < attempts && elapsed > limit; attempt++) {
      const start = performance.now()
      pattern.test(input)
      elapsed = Math.min(elapsed, performance.now() - start)
    }
    parentPort.postMessage(elapsed)
    if (elapsed > limit) break
  }
})
`

interface Report {
  readonly errors: string[]
  readonly warnings: string[]
}

/** 一个词典文件 */
interface Unit {
  readonly file: string
  readonly name: string
  readonly report: Report
  /** 默认导出 */
  dict?: PageDictionary
  /** 本文件自己的词条：去掉从别的文件合并来的部分，跨文件检查只看这部分 */
  own?: PageDictionary
  /** 生效的页面类型：已注册的主文件，以及被它合并的文件 */
  keys: readonly PageKey[]
  /** 子目录里的共用工具模块，不是词典 */
  helper?: boolean
}

/** 待测回溯的正则：引擎实际执行的形式 */
interface RedosTask {
  readonly tag: string
  readonly pattern: RegExp
  /** 计时输入长度 */
  readonly length: number
  readonly report: Report
}

/** 规则中的正则在引擎里实际执行的形式，与计时输入长度 */
interface RuleTarget {
  readonly compile: (pattern: RegExp) => RegExp
  readonly length: number
}

/** regexp 规则、属性规则：原样执行 */
const REGEXP_TARGET: RuleTarget = { compile: pattern => pattern, length: REDOS_INPUT_LENGTH }
/** 行内句正则：槽位换成槽位字符后匹配句型键，键长不超过上限 */
const INLINE_TARGET: RuleTarget = { compile: patternRegExp, length: MAX_SENTENCE_KEY }

function countGroups(pattern: RegExp): number {
  return (new RegExp(`${pattern.source}|`).exec('')?.length ?? 1) - 1
}

/** 正则的命名组名；没有命名组为 undefined */
function groupNames(pattern: RegExp): ReadonlySet<string> | undefined {
  const groups = new RegExp(`${pattern.source}|`).exec('')?.groups
  return groups && new Set(Object.keys(groups))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function checkEntries(label: string, entries: unknown, report: Report): void {
  if (entries === undefined) return
  if (typeof entries !== 'object' || entries === null || Array.isArray(entries)) {
    report.errors.push(`${label} 必须是对象`)
    return
  }
  for (const [key, value] of Object.entries(entries)) {
    const where = `${label} ${JSON.stringify(key)}`
    if (typeof value !== 'string' || !value.trim()) report.errors.push(`${where}：译文为空或不是字符串`)
    else if (value !== value.trim()) report.errors.push(`${where}：译文首尾有空白`)
    else if (value === key) report.warnings.push(`${where}：译文与原文相同`)
    if (normalizeText(key) !== key) report.errors.push(`${where}：键未规范化（首尾空白 / 连续空白 / NBSP）`)
    if (!hasLatin(key)) report.errors.push(`${where}：键不含英文字母，不会被匹配`)
    if (typeof value === 'string' && CJK_LATIN_RE.test(value)) report.warnings.push(`${where}：中英文之间缺空格 → ${value}`)
    if (typeof value === 'string' && CJK_HALF_PUNCT_RE.test(value)) report.warnings.push(`${where}：中文后接半角标点 → ${value}`)
    if (typeof value === 'string') checkPunctuation(where, key, value, report)
  }
}

/** 繁体译文：不混入简体字；大陆用语、弯引号给警告 */
function checkScript(where: string, value: string, report: Report): void {
  const simplified = simplifiedChars(value)
  if (simplified.length > 0) report.errors.push(`${where}：含简体字「${simplified.join('')}」 → ${value}`)
  const rest = ACCEPTED_WORDS.reduce((text, word) => text.replaceAll(word, ''), value)
  for (const [term, preferred] of MAINLAND_TERMS) {
    if (rest.includes(term)) report.warnings.push(`${where}：大陆用语「${term}」（宜用「${preferred}」）→ ${value}`)
  }
  if (/[“”‘’]/.test(value)) report.warnings.push(`${where}：引号用「」 → ${value}`)
}

const CJK_TEXT_RE = /[一-鿿]/

/** 抛出的错误信息：开发者看的，按项目约定用简体 */
function isErrorMessage(node: ts.Node): boolean {
  return (
    ts.isThrowStatement(node) || (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text.endsWith('Error'))
  )
}

/**
 * 繁体：检查源码中含中文的字符串与模板字面量（注释、抛出的错误信息除外）。
 * 替换函数的输出、模块内常量与共用工具里的译文都在字面量里，按值检查看不到
 */
function scanLiterals(file: string, report: Report): void {
  let text: string
  try {
    text = readFileSync(file, 'utf8')
  } catch (error) {
    report.errors.push(`读取失败：${errorMessage(error)}`)
    return
  }
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const visit = (node: ts.Node): void => {
    if (isErrorMessage(node)) return
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateLiteralToken(node)) &&
      CJK_TEXT_RE.test(node.text)
    ) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
      checkScript(`第 ${line} 行`, node.text, report)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

/** 标点随原文：原文没有的标点，译文不加；shown 为报错时显示的译文 */
function checkPunctuation(where: string, key: string, value: string, report: Report, shown = value): void {
  if (!SOURCE_PUNCT_RE.test(key) && TARGET_PUNCT_RE.test(value)) {
    report.errors.push(`${where}：原文无标点，译文不应有标点 → ${shown}`)
  } else if (!SOURCE_END_RE.test(key) && TARGET_END_RE.test(value)) {
    report.errors.push(`${where}：原文结尾无标点，译文结尾不应有标点 → ${shown}`)
  }
}

function checkRule(where: string, rule: unknown, report: Report, redos: RedosTask[], target: RuleTarget = REGEXP_TARGET): void {
  if (!Array.isArray(rule) || rule.length !== 2 || !(rule[0] instanceof RegExp)) {
    report.errors.push(`${where}：应为 [RegExp, string | function]`)
    return
  }
  const [pattern, replacement] = rule as unknown as RegExpRule
  const tag = `${where} /${pattern.source}/${pattern.flags}`
  if (!pattern.source.startsWith('^') || !pattern.source.endsWith('$') || pattern.source.endsWith('\\$')) {
    report.errors.push(`${tag}：必须以 ^ 开头、$ 结尾`)
  }
  if (pattern.global || pattern.sticky) report.errors.push(`${tag}：不得使用 g / y 标志`)
  // 引擎按首字符与字面前缀给正则建索引（src/core/regexp-index）：这几种写法推导不了，也容易写错锚定
  if (/[muv]/.test(pattern.flags)) report.errors.push(`${tag}：不得使用 m / u / v 标志`)
  if (hasTopLevelAlternative(pattern)) report.errors.push(`${tag}：顶层不得有 |，备选放进分组`)
  if (typeof replacement === 'string') {
    if (!replacement.trim()) report.errors.push(`${tag}：替换文本为空`)
    const groups = countGroups(pattern)
    const names = groupNames(pattern)
    for (const [, , digits, name] of replacement.matchAll(REPLACEMENT_REF_RE)) {
      if (Number(digits) > groups) report.errors.push(`${tag}：$${digits} 超出捕获组数量 ${groups}`)
      // 同 String.prototype.replace：正则没有命名组时 $<名称> 原样输出，有命名组而名字不对时换成空串
      if (name !== undefined && !names?.has(name)) report.errors.push(`${tag}：$<${name}> ${names ? '不是命名组' : '会原样输出'}`)
    }
    if (CJK_LATIN_RE.test(replacement.replace(/\$\d+/g, ''))) report.warnings.push(`${tag}：中英文之间缺空格 → ${replacement}`)
    if (!PATTERN_END_PUNCT_RE.test(pattern.source) && TARGET_END_RE.test(replacement))
      report.warnings.push(`${tag}：原文结尾无标点，替换文本结尾不应有标点 → ${replacement}`)
  } else if (typeof replacement !== 'function') {
    report.errors.push(`${tag}：替换必须是字符串或函数`)
  }
  try {
    redos.push({ tag, pattern: target.compile(pattern), length: target.length, report })
  } catch (error) {
    report.errors.push(`${tag}：编译失败：${errorMessage(error)}`)
  }
}

/** 属性规则可改写的属性：可翻译属性与只按规则改写的 value */
const RULE_ATTRIBUTES: readonly string[] = [...TRANSLATABLE_ATTRIBUTES, ...RULE_ONLY_ATTRIBUTES]

/** 属性规则：[选择器, 属性名, RegExp, 替换]，正则同 regexp 规则 */
function checkAttributeRule(where: string, rule: unknown, report: Report, redos: RedosTask[]): void {
  if (!Array.isArray(rule) || rule.length !== 4) {
    report.errors.push(`${where}：应为 [选择器, 属性名, RegExp, string | function]`)
    return
  }
  const [selector, name] = rule as unknown[]
  if (typeof selector !== 'string' || !selector.trim()) report.errors.push(`${where}：选择器为空`)
  if (typeof name !== 'string' || !RULE_ATTRIBUTES.includes(name)) {
    report.errors.push(`${where}：属性名必须是可翻译属性或 value（${RULE_ATTRIBUTES.join('、')}）`)
  }
  checkRule(where, rule.slice(2), report, redos)
}

/** 正则源码中各捕获组的源码（命名组带 ?<名称> 前缀），依次对应 $1、$2… */
function captureGroups(source: string): string[] {
  const groups: string[] = []
  for (let at = 0; at < source.length; at = source[at] === '(' ? at + 1 : tokenEnd(source, at)) {
    if (source[at] === '(' && CAPTURE_RE.test(source.slice(at, at + 4))) groups.push(source.slice(at + 1, groupEnd(source, at) - 1))
  }
  return groups
}

/** 正则句型的字符串译文中 $ 写法带入的槽位数：$n、$<名称> 计所引用捕获组中的槽位，$& 计整个句型的槽位 */
function carriedSlots(pattern: RegExp, translation: string): number {
  const groups = captureGroups(pattern.source)
  const slotsIn = (source = ''): number => source.match(SLOT_MARK_RE)?.length ?? 0
  let count = 0
  for (const [, sign, digits, name] of translation.matchAll(REPLACEMENT_REF_RE)) {
    if (sign === '&') count += slotsIn(pattern.source)
    else if (name !== undefined) count += slotsIn(groups.find(group => group.startsWith(`?<${name}>`)))
    else if (digits !== undefined) {
      // 两位数超出捕获组数时，按一位数加一个字面数字处理
      const index = Number(digits) > groups.length ? Number(digits[0]) : Number(digits)
      if (index > 0) count += slotsIn(groups[index - 1])
    }
  }
  return count
}

/** 字符串句型的键长、宿主至少要有的子节点数超过引擎上限时，句型不会被匹配 */
function checkReach(tag: string, key: string, report: Report): void {
  if (key.length > MAX_SENTENCE_KEY) report.errors.push(`${tag}：句型键长 ${key.length}，超过上限 ${MAX_SENTENCE_KEY}，不会被匹配`)
  const children = minChildren(key)
  if (children > MAX_SENTENCE_CHILDREN)
    report.errors.push(`${tag}：至少 ${children} 个子节点，超过上限 ${MAX_SENTENCE_CHILDREN}，不会被匹配`)
}

/**
 * 行内句规则：[句型, 译文]。句型须有槽位；正则句型同 regexp 规则（回溯按槽位换成槽位字符后的正则计时），
 * 字符串译文的槽位数须与句型相同（$n、$<名称>、$& 带入所引用内容中的槽位）；字符串句型须已规范化、含英文，
 * 句型键长、子节点数不超过引擎上限；标点、空格随原文（槽位按占位字符计）
 */
function checkInlineRule(where: string, rule: unknown, report: Report, redos: RedosTask[]): void {
  if (!Array.isArray(rule) || rule.length !== 2) {
    report.errors.push(`${where}：应为 [string | RegExp, string | function]`)
    return
  }
  const [pattern, translation] = rule as unknown[]
  if (!(pattern instanceof RegExp) && typeof pattern !== 'string') {
    report.errors.push(`${where}：句型必须是字符串或 RegExp`)
    return
  }
  const tag = pattern instanceof RegExp ? `${where} /${pattern.source}/${pattern.flags}` : `${where} ${JSON.stringify(pattern)}`
  const slots = patternSlots(pattern)
  if (slots === 0) report.errors.push(`${tag}：句型没有槽位，应写进 ${pattern instanceof RegExp ? 'regexp' : 'static / scoped'}`)
  if (pattern instanceof RegExp) {
    checkRule(where, rule, report, redos, INLINE_TARGET)
    if (typeof translation !== 'string') return
    const carried = carriedSlots(pattern, translation)
    const count = slotCount(translation) + carried
    if (count !== slots)
      report.errors.push(`${tag}：译文有 ${count} 个槽位${carried > 0 ? `（引用带入 ${carried} 个）` : ''}，句型有 ${slots} 个`)
    return
  }
  // 槽位换成占位字符再查标点与空格：直接删掉会让两侧的标点、空白挨在一起或落到句末
  const source = pattern.replace(SLOT_MARK_RE, SLOT)
  if (normalizeText(pattern) !== pattern) report.errors.push(`${tag}：句型未规范化（首尾空白 / 连续空白 / NBSP）`)
  if (!hasLatin(source)) report.errors.push(`${tag}：句型不含英文字母，不会被匹配`)
  checkReach(tag, patternKey(pattern), report)
  if (typeof translation === 'function') return
  if (typeof translation !== 'string' || !translation.trim()) {
    report.errors.push(`${tag}：译文为空或不是字符串`)
    return
  }
  if (translation !== translation.trim()) report.errors.push(`${tag}：译文首尾有空白`)
  if (slotCount(translation) !== slots) report.errors.push(`${tag}：译文有 ${slotCount(translation)} 个槽位，句型有 ${slots} 个`)
  const text = translation.replace(SLOT_MARK_RE, SLOT)
  if (CJK_LATIN_RE.test(text)) report.warnings.push(`${tag}：中英文之间缺空格 → ${translation}`)
  if (CJK_HALF_PUNCT_RE.test(text)) report.warnings.push(`${tag}：中文后接半角标点 → ${translation}`)
  checkPunctuation(tag, source, text, report, translation)
}

/** 默认导出必须是只含已知字段的对象 */
function checkShape(dict: unknown, report: Report): dict is PageDictionary {
  if (typeof dict !== 'object' || dict === null || Array.isArray(dict)) {
    report.errors.push('默认导出必须是 PageDictionary 对象')
    return false
  }
  for (const key of Object.keys(dict)) {
    if (!ALLOWED_KEYS.has(key)) report.errors.push(`未知字段 ${key}`)
  }
  return true
}

/** 区域词条：[非空选择器, 词条表]；词条表的检查同 static */
function checkContextualRule(where: string, rule: unknown, report: Report): void {
  if (!Array.isArray(rule) || rule.length !== 2) {
    report.errors.push(`${where}：必须是 [选择器, 词条表]`)
    return
  }
  const [selector, table] = rule as unknown[]
  if (typeof selector !== 'string' || !selector.trim()) report.errors.push(`${where}：选择器为空`)
  if (typeof table !== 'object' || table === null || Array.isArray(table)) report.errors.push(`${where}：词条表必须是对象`)
  else checkEntries(`${where} 词条表`, table as Record<string, string>, report)
}

function checkDictionary(value: PageDictionary, report: Report, redos: RedosTask[]): void {
  checkEntries('static', value.static, report)
  checkEntries('scoped', value.scoped, report)
  checkEntries('labels', value.labels, report)
  checkEntries('labelDescriptions', value.labelDescriptions, report)
  checkEntries('listNames', value.listNames, report)
  checkEntries('issueTypes', value.issueTypes, report)
  if (value.regexp !== undefined && !Array.isArray(value.regexp)) report.errors.push('regexp 必须是数组')
  else value.regexp?.forEach((rule, index) => checkRule(`regexp[${index}]`, rule, report, redos))
  if (value.labelRegexp !== undefined && !Array.isArray(value.labelRegexp)) report.errors.push('labelRegexp 必须是数组')
  else value.labelRegexp?.forEach((rule, index) => checkRule(`labelRegexp[${index}]`, rule, report, redos))
  if (value.ignore !== undefined && !Array.isArray(value.ignore)) report.errors.push('ignore 必须是数组')
  else
    value.ignore?.forEach((selector, index) => {
      if (typeof selector !== 'string' || !selector.trim()) report.errors.push(`ignore[${index}]：选择器为空`)
    })
  if (value.attributeRules !== undefined && !Array.isArray(value.attributeRules)) {
    report.errors.push('attributeRules 必须是数组')
  } else {
    value.attributeRules?.forEach((rule, index) => checkAttributeRule(`attributeRules[${index}]`, rule, report, redos))
  }
  if (value.inline !== undefined && !Array.isArray(value.inline)) report.errors.push('inline 必须是数组')
  else value.inline?.forEach((rule, index) => checkInlineRule(`inline[${index}]`, rule, report, redos))
  if (value.mergeText !== undefined && !Array.isArray(value.mergeText)) report.errors.push('mergeText 必须是数组')
  else
    value.mergeText?.forEach((selector, index) => {
      if (typeof selector !== 'string' || !selector.trim()) report.errors.push(`mergeText[${index}]：选择器为空`)
    })
  if (value.contextual !== undefined && !Array.isArray(value.contextual)) report.errors.push('contextual 必须是数组')
  else value.contextual?.forEach((rule, index) => checkContextualRule(`contextual[${index}]`, rule, report))
  const statics = recordOf(value.static)
  for (const key of Object.keys(recordOf(value.scoped))) {
    if (Object.hasOwn(statics, key)) report.warnings.push(`scoped 与 static 重复：${JSON.stringify(key)}`)
  }
}

// ---------- 回溯计时输入 ----------

/** 计时输入：[前缀, 重复片段, 结尾]，重复片段补足到输入长度 */
type RedosInput = readonly [prefix: string, unit: string, end: string]

/** 推导计时输入：沿途记下切点与重复片段 */
interface InputPlan {
  readonly source: string
  readonly flags: string
  /** 带量词的成分之前的示例：通用输入接在其后 */
  readonly cuts: Set<string>
  /** 带量词的成分：其前的示例、成分重复一次的示例、失配结尾 */
  readonly pumps: Map<string, RedosInput>
}

const sampleCache = new Map<string, string | undefined>()

/** at 处成分（转义、字符类或单个字符）之后的位置 */
function tokenEnd(source: string, at: number): number {
  if (source[at] === '\\') return at + (ESCAPE_RE.exec(source.slice(at))?.[0].length ?? 1)
  if (source[at] !== '[') return at + 1
  for (let i = at + 1; i < source.length; i++) {
    if (source[i] === '\\') i++
    else if (source[i] === ']') return i + 1
  }
  return source.length
}

/** open 处分组之后的位置 */
function groupEnd(source: string, open: number): number {
  let depth = 0
  for (let at = open; at < source.length; at = tokenEnd(source, at)) {
    if (source[at] === '(') depth++
    else if (source[at] === ')' && --depth === 0) return at + 1
  }
  return source.length
}

/** open 处分组内容的起点：跳过 ?:、?<名称>、修饰符；前瞻、后顾不占字符，返回 -1 */
function groupBody(source: string, open: number): number {
  if (source[open + 1] !== '?') return open + 1
  if (LOOKAROUND_RE.test(source.slice(open, open + 4))) return -1
  const at = source.indexOf(source[open + 2] === '<' ? '>' : ':', open)
  return at < 0 ? -1 : at + 1
}

/** [start, end) 按顶层 | 分开的各分支 */
function branches(source: string, start: number, end: number): [number, number][] {
  const parts: [number, number][] = []
  let from = start
  for (let at = start; at < end; at = source[at] === '(' ? groupEnd(source, at) : tokenEnd(source, at)) {
    if (source[at] !== '|') continue
    parts.push([from, at])
    from = at + 1
  }
  parts.push([from, end])
  return parts
}

/** 字面成分代表的字符：单个字符、\ 加标点、\uXXXX、\xXX */
function literalChar(atom: string): string | undefined {
  if (atom.length === 1) return atom
  if (LITERAL_ESCAPE_RE.test(atom)) return atom[1]
  const hex = HEX_ESCAPE_RE.exec(atom)
  return hex ? String.fromCharCode(Number.parseInt(hex[1] ?? hex[2]!, 16)) : undefined
}

/**
 * 单个字符的成分的示例：字面字符取自身，否则依次试 SAMPLE_CHARS、成分里写出的字符（如 [smhd]、[·•]）；
 * 都不匹配返回 undefined
 */
function sampleChar(atom: string, flags: string): string | undefined {
  const key = `${flags}/${atom}`
  if (sampleCache.has(key)) return sampleCache.get(key)
  let sample: string | undefined
  try {
    const single = new RegExp(`^(?:${atom})$`, flags.replace(/[gy]/g, ''))
    const written = Array.from(atom.matchAll(WRITTEN_CHAR_RE), ([token]) => literalChar(token))
    sample = [literalChar(atom), ...SAMPLE_CHARS, ...written].find(char => char !== undefined && single.test(char))
  } catch {
    sample = undefined
  }
  sampleCache.set(key, sample)
  return sample
}

/** 分组内容 [start, end) 的示例（before 为其前的示例）：各分支都记下切点，示例取第一个分支 */
function walkGroup(plan: InputPlan, start: number, end: number, before: string): string | undefined {
  return branches(plan.source, start, end).map(([from, to]) => walkBranch(plan, from, to, before))[0]
}

/**
 * 分支 [start, end) 的最短示例（量词取下限、分组取第一个分支），before 为其前的示例；
 * 遇到带量词的成分时记下切点与重复片段。推不下去（反向引用、没有示例字符）时返回 undefined
 */
function walkBranch(plan: InputPlan, start: number, end: number, before: string): string | undefined {
  const { source, flags } = plan
  let sample = ''
  let at = start
  while (at < end) {
    let next: number
    let unit: string | undefined
    if (source[at] === '(') {
      next = groupEnd(source, at)
      const body = groupBody(source, at)
      unit = body < 0 ? '' : walkGroup(plan, body, next - 1, before + sample)
    } else {
      next = tokenEnd(source, at)
      const atom = source.slice(at, next)
      unit = ZERO_WIDTH_RE.test(atom) ? '' : BACKREFERENCE_RE.test(atom) ? undefined : sampleChar(atom, flags)
    }
    if (unit === undefined) return undefined
    const quantifier = QUANTIFIER_RE.exec(source.slice(next, end))
    if (!quantifier) {
      sample += unit
      at = next
      continue
    }
    const cut = before + sample
    plan.cuts.add(cut)
    at = next + quantifier[0].length
    if (!unit) continue
    plan.pumps.set(`${cut}\u0000${unit}`, [cut, unit, REDOS_PUMP_END])
    const min = quantifier[1] === undefined ? Number(quantifier[2]) : quantifier[1] === '+' ? 1 : 0
    // 重复次数按输入长度封顶：嵌套的大下限量词不会撑出超长示例
    sample += unit.repeat(Math.min(min, Math.ceil(REDOS_INPUT_LENGTH / unit.length)))
  }
  return sample
}

/** 正则的计时输入：开头与各切点各接一组通用输入，另有各带量词的成分重复多次后接失配结尾 */
function redosInputs(pattern: RegExp): RedosInput[] {
  const plan: InputPlan = { source: pattern.source, flags: pattern.flags, cuts: new Set(['']), pumps: new Map() }
  walkGroup(plan, 0, pattern.source.length, '')
  const cuts = [...plan.cuts].slice(0, REDOS_MAX_CUTS)
  const pumps = [...plan.pumps.values()].slice(0, REDOS_MAX_CUTS)
  return [...cuts.flatMap(cut => REDOS_INPUTS.map(([unit, end]): RedosInput => [cut, unit, end])), ...pumps]
}

/** 逐条正则在线程里计时；超时的结束线程、换新线程继续 */
class RedosProbe {
  private worker = RedosProbe.spawn()

  private static spawn(): Worker {
    return new Worker(REDOS_WORKER_SOURCE, { eval: true })
  }

  /** 最慢一个输入的耗时；某个输入超过时限即停，单个输入超时返回 Infinity */
  measure(pattern: RegExp, length: number): Promise<number> {
    const { source, flags } = pattern
    const inputs = redosInputs(pattern)
    const worker = this.worker
    return new Promise(resolve => {
      let worst = 0
      let left = inputs.length
      const finish = (elapsed: number): void => {
        clearTimeout(timer)
        worker.off('message', progress)
        worker.off('error', fail)
        resolve(elapsed)
      }
      const expire = (): void => {
        finish(Infinity)
        void worker.terminate()
        this.worker = RedosProbe.spawn()
      }
      // 每测完一个输入重新计时
      const progress = (elapsed: number): void => {
        worst = Math.max(worst, elapsed)
        left -= 1
        if (left === 0 || elapsed > REDOS_LIMIT_MS) {
          finish(worst)
          return
        }
        clearTimeout(timer)
        timer = setTimeout(expire, REDOS_TIMEOUT_MS)
      }
      const fail = (): void => {
        finish(0)
        this.worker = RedosProbe.spawn()
      }
      let timer = setTimeout(expire, REDOS_TIMEOUT_MS)
      worker.on('message', progress)
      worker.once('error', fail)
      worker.postMessage({ source, flags, inputs, length, limit: REDOS_LIMIT_MS, attempts: REDOS_ATTEMPTS })
    })
  }

  async close(): Promise<void> {
    await this.worker.terminate()
  }
}

async function checkRedos(tasks: readonly RedosTask[]): Promise<void> {
  if (tasks.length === 0) return
  const probe = new RedosProbe()
  try {
    for (const task of tasks) {
      const elapsed = await probe.measure(task.pattern, task.length)
      if (elapsed === Infinity) task.report.errors.push(`${task.tag}：疑似灾难回溯（超过 ${REDOS_TIMEOUT_MS}ms 未结束）`)
      else if (elapsed > REDOS_LIMIT_MS) task.report.errors.push(`${task.tag}：疑似灾难回溯（${elapsed.toFixed(0)}ms）`)
    }
  } finally {
    await probe.close()
  }
}

/** 主文件注册、子文件接线，并给每个文件标上生效的页面类型 */
function checkWiring(units: readonly Unit[], bundle: LocaleBundle, merged: ReadonlyMap<string, readonly string[]>): void {
  const dicts = new Map(units.flatMap(unit => (unit.dict ? [[unit.file, unit.dict] as const] : [])))
  const keys = pageKeysByFile(dicts, bundle, merged, ROOT)
  for (const unit of units) {
    if (!unit.dict) continue
    unit.keys = keys.get(unit.file) ?? []
    if (placeOf(unit.file, ROOT) === 'top') {
      if (registeredKeys(unit.dict, bundle).length === 0) unit.report.errors.push('未在 index.ts 注册')
      continue
    }
    if (unit.keys.length > 0) continue
    if (isEmptyDictionary(unit.dict)) {
      unit.report.warnings.push('没有词条')
      continue
    }
    const parent = parentOf(unit.file, ROOT)!
    unit.report.errors.push(
      existsSync(parent)
        ? `没有被任何已注册的词典合并（应在 ${displayPath(parent)} 用 mergeDictionaries 合并）`
        : `缺少上级文件 ${displayPath(parent)}`
    )
  }
}

interface Owner {
  readonly name: string
  readonly value: string
}

/** 同一原文在 owners 中已有记录时：译文相同记警告，不同记错误 */
function claim(owners: Map<string, Owner>, label: string, key: string, unit: Unit, value: string): void {
  const previous = owners.get(key)
  if (!previous) {
    owners.set(key, { name: unit.name, value })
    return
  }
  if (previous.value === value) unit.report.warnings.push(`${label} ${JSON.stringify(key)} 与 ${previous.name} 重复`)
  else unit.report.errors.push(`${label} ${JSON.stringify(key)} 冲突：${previous.name}「${previous.value}」≠ 本文件「${value}」`)
}

/**
 * static、labels、labelDescriptions、listNames、issueTypes 全站合并，同一原文只能有一种译法；
 * scoped 在同一页面类型内合并
 */
function checkConflicts(units: readonly Unit[]): void {
  const staticOwners = new Map<string, Owner>()
  const labelOwners = new Map<string, Owner>()
  const descriptionOwners = new Map<string, Owner>()
  const listNameOwners = new Map<string, Owner>()
  const issueTypeOwners = new Map<string, Owner>()
  const scopedOwners = new Map<PageKey, Map<string, Owner>>()
  for (const unit of units) {
    for (const [key, value] of Object.entries(recordOf(unit.own?.static))) claim(staticOwners, 'static', key, unit, value)
    for (const [key, value] of Object.entries(recordOf(unit.own?.labels))) claim(labelOwners, 'labels', key, unit, value)
    for (const [key, value] of Object.entries(recordOf(unit.own?.labelDescriptions)))
      claim(descriptionOwners, 'labelDescriptions', key, unit, value)
    for (const [key, value] of Object.entries(recordOf(unit.own?.listNames))) claim(listNameOwners, 'listNames', key, unit, value)
    for (const [key, value] of Object.entries(recordOf(unit.own?.issueTypes))) claim(issueTypeOwners, 'issueTypes', key, unit, value)
    for (const page of new Set(unit.keys)) {
      const owners = scopedOwners.get(page) ?? new Map<string, Owner>()
      scopedOwners.set(page, owners)
      for (const [key, value] of Object.entries(recordOf(unit.own?.scoped))) claim(owners, `scoped（${page}）`, key, unit, value)
    }
  }
}

/** 同组不同文件分别给出同一原文的 scoped 与 static（同一文件内的由 checkDictionary 报告） */
function checkGroupOverlap(units: readonly Unit[], merged: ReadonlyMap<string, readonly string[]>): void {
  const byFile = new Map(units.map(unit => [unit.file, unit]))
  for (const unit of units) {
    if (!unit.dict || placeOf(unit.file, ROOT) !== 'top') continue
    const statics = recordOf(unit.dict.static)
    const members = [unit, ...(merged.get(unit.file) ?? []).flatMap(file => byFile.get(file) ?? [])]
    for (const key of Object.keys(recordOf(unit.dict.scoped))) {
      if (!Object.hasOwn(statics, key)) continue
      const inOneFile = members.some(
        member => Object.hasOwn(recordOf(member.own?.static), key) && Object.hasOwn(recordOf(member.own?.scoped), key)
      )
      if (!inOneFile) unit.report.warnings.push(`scoped 与 static 重复（来自不同文件）：${JSON.stringify(key)}`)
    }
  }
}

/** 可删的 scoped：实际生效的全局 static 已有相同译文，且所有生效的 scoped 对这条原文只有这一种译文 */
function checkRedundant(units: readonly Unit[], bundle: LocaleBundle): void {
  const active = effectiveStatic(bundle)
  const effective = units.filter(unit => unit.keys.length > 0)
  const scopedValues = new Map<string, Set<string>>()
  for (const unit of effective) {
    for (const [key, value] of Object.entries(recordOf(unit.own?.scoped)))
      scopedValues.set(key, (scopedValues.get(key) ?? new Set()).add(value))
  }
  for (const unit of effective) {
    for (const [key, value] of Object.entries(recordOf(unit.own?.scoped))) {
      if (active.get(key) !== value || scopedValues.get(key)?.size !== 1) continue
      const owner = effective.find(other => recordOf(other.own?.static)[key] === value)
      unit.report.warnings.push(`可删：scoped ${JSON.stringify(key)} 与${owner ? ` ${owner.name} 的` : '全局'} static 译文相同`)
    }
  }
}

async function load(unit: Unit): Promise<void> {
  if (isNonDictionaryFile(unit.file, ROOT)) {
    unit.helper = true
    return
  }
  try {
    const module = (await import(pathToFileURL(unit.file).href)) as Record<string, unknown>
    const kind = classifyModule(module, placeOf(unit.file, ROOT))
    if (kind === 'helper') unit.helper = true
    else if (kind === 'missing-default') unit.report.errors.push('缺少默认导出（export default 词典）')
    else if (checkShape(module.default, unit.report)) unit.dict = module.default
  } catch (error) {
    unit.report.errors.push(`加载失败：${errorMessage(error)}`)
  }
}

async function loadBundle(): Promise<{ bundle?: LocaleBundle; error?: string }> {
  try {
    const module = (await import(pathToFileURL(INDEX_FILE).href)) as Record<string, unknown>
    const bundle = module[BUNDLE_EXPORT]
    if (!Array.isArray(bundle)) return { error: `index.ts 没有导出数组 ${BUNDLE_EXPORT}` }
    // 只认 [页面类型, 词典] 形状的条目
    return {
      bundle: bundle.filter((entry): entry is LocaleBundle[number] => Array.isArray(entry) && entry.length === 2)
    }
  } catch (error) {
    return { error: `index.ts 加载失败：${errorMessage(error)}` }
  }
}

function print(units: readonly Unit[]): number {
  let errorCount = 0
  let entryCount = 0
  for (const unit of units) {
    const { report } = unit
    const dict = unit.own ?? unit.dict
    const staticCount = Object.keys(recordOf(dict?.static)).length
    const scopedCount = Object.keys(recordOf(dict?.scoped)).length
    const regexpCount = Array.isArray(dict?.regexp) ? dict.regexp.length : 0
    const inlineCount = Array.isArray(dict?.inline) ? dict.inline.length : 0
    const labelsCount = Object.keys(recordOf(dict?.labels)).length
    const descriptionsCount = Object.keys(recordOf(dict?.labelDescriptions)).length
    const labelRegexpCount = Array.isArray(dict?.labelRegexp) ? dict.labelRegexp.length : 0
    const listNamesCount = Object.keys(recordOf(dict?.listNames)).length
    const issueTypesCount = Object.keys(recordOf(dict?.issueTypes)).length
    entryCount +=
      staticCount +
      scopedCount +
      regexpCount +
      inlineCount +
      labelsCount +
      descriptionsCount +
      labelRegexpCount +
      listNamesCount +
      issueTypesCount
    const status = report.errors.length > 0 ? '✖' : '✔'
    const inline = inlineCount > 0 ? `  inline ${inlineCount}` : ''
    const labels = labelsCount > 0 ? `  labels ${labelsCount}` : ''
    const descriptions = descriptionsCount > 0 ? `  labelDescriptions ${descriptionsCount}` : ''
    const labelRegexp = labelRegexpCount > 0 ? `  labelRegexp ${labelRegexpCount}` : ''
    const listNames = listNamesCount > 0 ? `  listNames ${listNamesCount}` : ''
    const issueTypes = issueTypesCount > 0 ? `  issueTypes ${issueTypesCount}` : ''
    process.stdout.write(
      `${status} ${unit.name}  static ${staticCount}  scoped ${scopedCount}  regexp ${regexpCount}${inline}${labels}${descriptions}${labelRegexp}${listNames}${issueTypes}  错误 ${report.errors.length}  警告 ${report.warnings.length}\n`
    )
    for (const error of report.errors) process.stdout.write(`    错误 ${error}\n`)
    for (const warning of report.warnings) process.stdout.write(`    警告 ${warning}\n`)
    errorCount += report.errors.length
  }
  process.stdout.write(`共 ${units.length} 个文件，${entryCount} 条词条，${errorCount} 个错误\n`)
  return errorCount
}

function unitOf(file: string): Unit {
  return { file, name: displayPath(file), report: { errors: [], warnings: [] }, keys: [] }
}

function hasProblems(report: Report): boolean {
  return report.errors.length > 0 || report.warnings.length > 0
}

/** 繁体全量检查时另扫描的源码：顶层 helpers.ts、index.ts 与简繁共用的 src/locales/shared/ */
function extraSources(): string[] {
  const shared = existsSync(SHARED_DIR)
    ? readdirSync(SHARED_DIR)
        .filter(name => name.endsWith('.ts'))
        .map(name => resolve(SHARED_DIR, name))
    : []
  return [resolve(ROOT, 'helpers.ts'), INDEX_FILE, ...shared].filter(file => existsSync(file))
}

async function main(): Promise<void> {
  const { redundant } = COMMAND
  const whole = COMMAND.files.length === 0
  const loaded = (whole ? listDictionaryFiles(ROOT) : COMMAND.files).map(unitOf)
  for (const unit of loaded) await load(unit)
  if (TRADITIONAL) for (const unit of loaded) scanLiterals(unit.file, unit.report)
  // 共用工具不是词典：指定时照常列出，全量检查时只列有问题的
  const units = loaded.filter(unit => !unit.helper || !whole || hasProblems(unit.report))
  if (TRADITIONAL && whole) {
    for (const file of extraSources()) {
      const unit = unitOf(file)
      scanLiterals(file, unit.report)
      if (hasProblems(unit.report)) units.push(unit)
    }
  }
  const redos: RedosTask[] = []

  if (!whole) {
    // 指定文件时按默认导出的整体检查
    for (const unit of units) {
      unit.own = unit.dict
      if (unit.dict) checkDictionary(unit.dict, unit.report, redos)
    }
  } else {
    // 全量检查时每个文件只查自己的词条，跨文件检查也按各自的词条
    const dicts = new Map(units.flatMap(unit => (unit.dict ? [[unit.file, unit.dict] as const] : [])))
    const merged = mergedFiles(dicts, ROOT)
    const own = ownEntriesByFile(dicts, merged)
    for (const unit of units) {
      unit.own = own.get(unit.file)
      if (unit.own) checkDictionary(unit.own, unit.report, redos)
    }
    const { bundle, error } = await loadBundle()
    if (bundle) checkWiring(units, bundle, merged)
    checkConflicts(units)
    checkGroupOverlap(units, merged)
    if (bundle && redundant) checkRedundant(units, bundle)
    if (error)
      units.push({
        file: INDEX_FILE,
        name: displayPath(INDEX_FILE),
        report: { errors: [`${error}；已跳过注册、接线与 scoped 冲突检查`], warnings: [] },
        keys: []
      })
  }
  await checkRedos(redos)
  process.exitCode = print(units) > 0 ? 1 : 0
}

await main()
