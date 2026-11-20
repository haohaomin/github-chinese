/**
 * 校验繁体词典与简体词典结构一致。
 * 同名文件；具名导出相同；static / scoped / labels / labelDescriptions / listNames / issueTypes 键集合相同；
 * 正则（regexp、labelRegexp）数量、顺序、source、flags 相同；ignore、mergeText 相同；
 * 属性规则的选择器、属性名、正则相同；行内句的句型相同；区域词条的选择器与词条表键集合相同；语言包注册顺序与页面类型相同。
 * 选择器里含中文的引号属性值（按译文匹配的选择器，简繁各用各的译文）不比。
 * 用法：bun run check:parity [文件...]
 *   指定文件（简体或繁体目录下的路径均可）时只对照这些文件；index.ts 对照语言包注册顺序
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { AttributeRule, InlineRule, LocaleBundle, PageDictionary } from '../src/core/types'

const CN_DIR = resolve('src/locales/zh-CN')
const TW_DIR = resolve('src/locales/zh-TW')
const NON_DICTIONARY_FILES = new Set(['index.ts', 'helpers.ts'])
const CJK_QUOTED_RE = /"[^"]*[一-鿿][^"]*"|'[^']*[一-鿿][^']*'/g

function listFiles(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return listFiles(full, base)
    const rel = relative(base, full).replace(/\\/g, '/')
    return name.endsWith('.ts') && !NON_DICTIONARY_FILES.has(rel) ? [rel] : []
  })
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

type DictionaryModule = Readonly<Record<string, unknown>> & { readonly default?: PageDictionary }

/** 加载失败时返回错误信息 */
async function load(file: string, label: string): Promise<DictionaryModule | string> {
  try {
    return (await import(pathToFileURL(file).href)) as DictionaryModule
  } catch (error) {
    return `${label}加载失败：${errorMessage(error)}`
  }
}

function diffKeys(label: string, cn: object | undefined, tw: object | undefined): string[] {
  const cnKeys = new Set(Object.keys(cn ?? {}))
  const twKeys = new Set(Object.keys(tw ?? {}))
  const missing = [...cnKeys].filter(key => !twKeys.has(key)).map(key => `${label} 缺少 ${JSON.stringify(key)}`)
  const extra = [...twKeys].filter(key => !cnKeys.has(key)).map(key => `${label} 多出 ${JSON.stringify(key)}`)
  return [...missing, ...extra]
}

function diffRules(
  label: 'regexp' | 'labelRegexp',
  cnRules: PageDictionary['regexp'] = [],
  twRules: PageDictionary['regexp'] = []
): string[] {
  const problems: string[] = []
  if (cnRules.length !== twRules.length) problems.push(`${label} 数量不同：简体 ${cnRules.length}，繁体 ${twRules.length}`)
  cnRules.forEach(([pattern], index) => {
    const other = twRules[index]?.[0]
    if (!other || other.source !== pattern.source || other.flags !== pattern.flags) {
      problems.push(`${label}[${index}] 不同：/${pattern.source}/${pattern.flags} ≠ ${other ? `/${other.source}/${other.flags}` : '缺失'}`)
    }
  })
  return problems
}

/** 选择器的结构：含中文的引号属性值换成占位 */
function selectorShape(selector: unknown): unknown {
  return typeof selector === 'string' ? selector.replace(CJK_QUOTED_RE, quoted => `${quoted[0]}…${quoted[0]}`) : selector
}

/** ignore、mergeText：选择器逐条相同 */
function diffSelectors(label: string, cn: readonly string[] | undefined, tw: readonly string[] | undefined): string[] {
  const shape = (list: readonly string[] | undefined): string => JSON.stringify((list ?? []).map(selectorShape))
  return shape(cn) === shape(tw) ? [] : [`${label} 不同：${JSON.stringify(cn ?? [])} ≠ ${JSON.stringify(tw ?? [])}`]
}

/** 区域词条：选择器逐条相同，各词条表的键集合相同 */
function diffContextual(cn: PageDictionary, tw: PageDictionary): string[] {
  const cnRules = cn.contextual ?? []
  const twRules = tw.contextual ?? []
  const problems = diffSelectors(
    'contextual 选择器',
    cnRules.map(([selector]) => selector),
    twRules.map(([selector]) => selector)
  )
  cnRules.forEach(([, table], index) => problems.push(...diffKeys(`contextual[${index}]`, table, twRules[index]?.[1])))
  return problems
}

function describePattern(pattern: string | RegExp | undefined): string {
  if (pattern === undefined) return '缺失'
  return pattern instanceof RegExp ? `/${pattern.source}/${pattern.flags}` : JSON.stringify(pattern)
}

/** 属性规则：[选择器, 属性名, 正则] 逐条相同 */
function diffAttributeRules(cn: PageDictionary, tw: PageDictionary): string[] {
  const describe = (rule: AttributeRule | undefined): string =>
    rule ? `${String(selectorShape(rule[0]))} [${rule[1]}] ${describePattern(rule[2])}` : '缺失'
  const cnRules = cn.attributeRules ?? []
  const twRules = tw.attributeRules ?? []
  const problems: string[] = []
  if (cnRules.length !== twRules.length) problems.push(`attributeRules 数量不同：简体 ${cnRules.length}，繁体 ${twRules.length}`)
  cnRules.forEach((rule, index) => {
    const a = describe(rule)
    const b = describe(twRules[index])
    if (a !== b) problems.push(`attributeRules[${index}] 不同：${a} ≠ ${b}`)
  })
  return problems
}

/** 行内句：句型逐条相同 */
function diffInline(cn: PageDictionary, tw: PageDictionary): string[] {
  const cnRules: readonly InlineRule[] = cn.inline ?? []
  const twRules: readonly InlineRule[] = tw.inline ?? []
  const problems: string[] = []
  if (cnRules.length !== twRules.length) problems.push(`inline 数量不同：简体 ${cnRules.length}，繁体 ${twRules.length}`)
  cnRules.forEach(([pattern], index) => {
    const a = describePattern(pattern)
    const b = describePattern(twRules[index]?.[0])
    if (a !== b) problems.push(`inline[${index}] 不同：${a} ≠ ${b}`)
  })
  return problems
}

async function compareBundles(): Promise<string[]> {
  const twIndex = join(TW_DIR, 'index.ts')
  if (!existsSync(twIndex)) return ['繁体 index.ts 缺失']
  try {
    const { zhCN } = (await import(pathToFileURL(join(CN_DIR, 'index.ts')).href)) as { zhCN?: LocaleBundle }
    const { zhTW } = (await import(pathToFileURL(twIndex).href)) as { zhTW?: LocaleBundle }
    if (!Array.isArray(zhCN) || !Array.isArray(zhTW)) return ['index.ts 没有导出语言包数组 zhCN / zhTW']
    const cnPages = zhCN.map(([page]) => page).join(',')
    const twPages = zhTW.map(([page]) => page).join(',')
    return cnPages === twPages ? [] : [`index.ts 注册顺序不同：\n  简体 ${cnPages}\n  繁体 ${twPages}`]
  } catch (error) {
    return [`index.ts 加载失败：${errorMessage(error)}`]
  }
}

async function compareFile(file: string): Promise<string[]> {
  const cnFile = join(CN_DIR, file)
  const twFile = join(TW_DIR, file)
  if (!existsSync(cnFile)) return ['简体无对应文件']
  if (!existsSync(twFile)) return ['繁体文件缺失']
  const cnModule = await load(cnFile, '简体')
  const twModule = await load(twFile, '繁体')
  if (typeof cnModule === 'string' || typeof twModule === 'string')
    return [cnModule, twModule].filter((module): module is string => typeof module === 'string')
  const cn = cnModule.default ?? {}
  const tw = twModule.default ?? {}
  return [
    // 具名导出（词典之间、测试共用的常量与函数）须同名
    ...diffKeys('导出', cnModule, twModule),
    ...diffKeys('static', cn.static, tw.static),
    ...diffKeys('scoped', cn.scoped, tw.scoped),
    ...diffKeys('labels', cn.labels, tw.labels),
    ...diffKeys('labelDescriptions', cn.labelDescriptions, tw.labelDescriptions),
    ...diffKeys('listNames', cn.listNames, tw.listNames),
    ...diffKeys('issueTypes', cn.issueTypes, tw.issueTypes),
    ...diffRules('regexp', cn.regexp, tw.regexp),
    ...diffRules('labelRegexp', cn.labelRegexp, tw.labelRegexp),
    ...diffSelectors('ignore', cn.ignore, tw.ignore),
    ...diffAttributeRules(cn, tw),
    ...diffInline(cn, tw),
    ...diffSelectors('mergeText', cn.mergeText, tw.mergeText),
    ...diffContextual(cn, tw)
  ]
}

function inside(dir: string, file: string): boolean {
  const rel = relative(dir, file)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

/** 命令行指定的文件：换成相对词典目录的路径 */
function selectedFiles(args: readonly string[]): string[] {
  return args.map(arg => {
    const full = resolve(arg)
    const base = [CN_DIR, TW_DIR].find(dir => inside(dir, full))
    if (!base) throw new Error(`不在词典目录下：${arg}`)
    return relative(base, full).replaceAll('\\', '/')
  })
}

async function main(): Promise<void> {
  let selected: string[]
  try {
    selected = [...new Set(selectedFiles(process.argv.slice(2)))]
  } catch (error) {
    process.stderr.write(`${errorMessage(error)}\n`)
    process.exitCode = 1
    return
  }
  const whole = selected.length === 0
  const cnFiles = whole ? listFiles(CN_DIR) : selected
  const report = new Map<string, string[]>()

  for (const file of cnFiles) {
    const problems = file === 'index.ts' ? await compareBundles() : await compareFile(file)
    if (problems.length > 0) report.set(file, problems)
  }
  if (whole) {
    for (const file of existsSync(TW_DIR) ? listFiles(TW_DIR) : []) {
      if (!cnFiles.includes(file)) report.set(file, ['简体无对应文件'])
    }
    const bundleProblems = await compareBundles()
    if (bundleProblems.length > 0) report.set('index.ts', bundleProblems)
  }

  let count = 0
  for (const [file, problems] of report) {
    process.stdout.write(`✖ ${file}\n${problems.map(problem => `    ${problem}`).join('\n')}\n`)
    count += problems.length
  }
  process.stdout.write(count === 0 ? `✔ 简繁结构一致（${cnFiles.length} 个文件）\n` : `共 ${count} 处不一致\n`)
  process.exitCode = count === 0 ? 0 : 1
}

await main()
