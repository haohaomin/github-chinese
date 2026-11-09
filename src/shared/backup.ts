/**
 * 设置备份：设置页顶部的导出、导入（全部），与排除路径、加速源、净化设置、下载次数、新标签页打开、企业版设置
 * 各自的导出、导入（只含该部分）。
 * 文件是同一格式的 JSON：各部分都可缺省，导入时只用当前范围内的部分（在加速源处导入完整备份时只导入加速源）。
 * 导入：设置项按文件覆盖（只覆盖文件中有的项）；排除路径、新标签页的自定义页面、自定义词条、屏蔽规则与现有的合并；
 * 企业版站点要授权，由企业版设置另行处理。
 * 个人访问令牌只在下载次数处导出、导入：全部的导出不含令牌，导入全部时忽略文件中的令牌
 */
import { mergeEntries, normalizeEntry } from './custom-entries'
import { normalizeEnterpriseHost } from './enterprise'
import { normalizeToken } from './github-api'
import { normalizeRule, ruleKeyOf } from './search-block'
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  normalizeExcludedPath,
  sanitizeCustomEntries,
  type CustomEntries,
  type Settings
} from './settings'

/** 备份的范围：全部，或设置页的一部分（排除路径、加速源、净化设置、下载次数、新标签页打开、企业版设置） */
export type BackupScope = 'all' | 'excluded' | 'accelerate' | 'purify' | 'downloads' | 'new-tab' | 'enterprise'

export const BACKUP_FORMAT = 'github-chinese-backup'
export const BACKUP_VERSION = 1

/** 备份内容：各部分都可缺省 */
export interface BackupData {
  readonly settings?: Partial<Settings>
  readonly customEntries?: CustomEntries
  readonly searchBlockRules?: readonly string[]
  readonly enterpriseSites?: readonly string[]
  /** 个人访问令牌（只在下载次数的范围内） */
  readonly githubToken?: string
}

/** 分类、分类的顺序、加速源与替换原链接：互相关联，文件中有其中一项时一并导入 */
const ACCELERATE_SOURCE_KEYS = [
  'categories',
  'categoryOrder',
  'removedCategories',
  'customSources',
  'removedSources',
  'replaceCategory'
] as const satisfies readonly (keyof Settings)[]

/** 加速设置（在加速源处导入、导出）：开关（加速下载、图片加速、故障转移）与加速源的各项；开关只导入文件中有的 */
export const ACCELERATE_KEYS = [
  'accelerate',
  'accelerateImages',
  'failover',
  ...ACCELERATE_SOURCE_KEYS
] as const satisfies readonly (keyof Settings)[]

const PURIFY_KEYS: readonly (keyof Settings)[] = ['purifySearch', 'purifyBuiltin']
const DOWNLOADS_KEYS: readonly (keyof Settings)[] = ['downloadCount']
const EXCLUDED_KEYS: readonly (keyof Settings)[] = ['excludedPaths']
const NEW_TAB_KEYS: readonly (keyof Settings)[] = ['newTab', 'newTabScopes', 'newTabPaths']
/** 各范围的设置项；全部为 undefined（取全部设置），企业版设置没有设置项 */
const SCOPE_KEYS: Readonly<Record<Exclude<BackupScope, 'all'>, readonly (keyof Settings)[]>> = {
  excluded: EXCLUDED_KEYS,
  accelerate: ACCELERATE_KEYS,
  purify: PURIFY_KEYS,
  downloads: DOWNLOADS_KEYS,
  'new-tab': NEW_TAB_KEYS,
  enterprise: []
}
/** 路径列表：导入时与现有的合并 */
const PATH_KEYS = ['excludedPaths', 'newTabPaths'] as const satisfies readonly (keyof Settings)[]
const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pick(settings: Partial<Settings>, keys: readonly (keyof Settings)[]): Partial<Settings> {
  return Object.fromEntries(keys.filter(key => Object.hasOwn(settings, key)).map(key => [key, settings[key]]))
}

/** 文件中的设置：逐项校验（同读取存储），只取文件中有的项；类型不符的项用默认值。路径列表去掉格式错误、重复的路径 */
function sanitizeSettingsPart(raw: Record<string, unknown>): Partial<Settings> {
  const merged = mergeSettings(raw)
  const present = new Set(SETTING_KEYS.filter(key => Object.hasOwn(raw, key)))
  if (ACCELERATE_SOURCE_KEYS.some(key => present.has(key))) for (const key of ACCELERATE_SOURCE_KEYS) present.add(key)
  const part = pick(merged, [...present])
  const paths = PATH_KEYS.flatMap(key => {
    const value = part[key]
    return value ? [[key, sanitizeList(value, normalizeExcludedPath, path => path)] as const] : []
  })
  return { ...part, ...Object.fromEntries(paths) }
}

function sanitizeEntriesPart(raw: Record<string, unknown>): CustomEntries {
  return Object.fromEntries(
    Object.entries(sanitizeCustomEntries(raw)).flatMap(([source, target]) => {
      const pair = normalizeEntry(source, target)
      return pair ? [pair] : []
    })
  )
}

/** 去重（按 keyOf），保持顺序 */
function uniqueBy(items: readonly string[], keyOf: (item: string) => string): string[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = keyOf(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function sanitizeList(
  raw: readonly unknown[],
  normalize: (value: string) => string | undefined,
  keyOf: (item: string) => string
): string[] {
  const items = raw.flatMap(item => {
    const value = typeof item === 'string' ? normalize(item) : undefined
    return value === undefined ? [] : [value]
  })
  return uniqueBy(items, keyOf)
}

/** 解析备份文件；不是备份文件（格式不符、版本更新）时为 undefined。各部分逐项校验，丢弃无效项 */
export function parseBackup(text: string): BackupData | undefined {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return undefined
  }
  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) return undefined
  if (typeof parsed.version !== 'number' || parsed.version > BACKUP_VERSION) return undefined
  const { settings, customEntries, searchBlockRules, enterpriseSites, githubToken } = parsed
  const token = typeof githubToken === 'string' ? normalizeToken(githubToken) : undefined
  return {
    ...(isRecord(settings) ? { settings: sanitizeSettingsPart(settings) } : {}),
    ...(isRecord(customEntries) ? { customEntries: sanitizeEntriesPart(customEntries) } : {}),
    ...(Array.isArray(searchBlockRules) ? { searchBlockRules: sanitizeList(searchBlockRules, normalizeRule, ruleKeyOf) } : {}),
    ...(Array.isArray(enterpriseSites) ? { enterpriseSites: sanitizeList(enterpriseSites, normalizeEnterpriseHost, host => host) } : {}),
    ...(token ? { githubToken: token } : {})
  }
}

/** 范围内的部分：设置中该范围的项；净化设置另有屏蔽规则，下载次数另有令牌，企业版设置只有站点；全部不含令牌 */
export function scopeBackup(data: BackupData, scope: BackupScope): BackupData {
  if (scope === 'all') {
    if (data.githubToken === undefined) return data
    const { githubToken: _token, ...rest } = data
    return rest
  }
  if (scope === 'enterprise') return data.enterpriseSites ? { enterpriseSites: data.enterpriseSites } : {}
  return {
    ...(data.settings ? { settings: pick(data.settings, SCOPE_KEYS[scope]) } : {}),
    ...(scope === 'purify' && data.searchBlockRules ? { searchBlockRules: data.searchBlockRules } : {}),
    ...(scope === 'downloads' && data.githubToken ? { githubToken: data.githubToken } : {})
  }
}

/** 没有可导入的内容 */
export function isEmptyBackup(data: BackupData): boolean {
  const settings = data.settings ? Object.keys(data.settings).length : 0
  return settings === 0 && !data.customEntries && !data.searchBlockRules && !data.enterpriseSites && !data.githubToken
}

/** 导出的文件内容 */
export function serializeBackup(data: BackupData, date: Date): string {
  return `${JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: date.toISOString(), ...data }, null, 2)}\n`
}

/** 导出的文件名：带本地日期 */
export function backupFileName(scope: BackupScope, date: Date): string {
  const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(part => String(part).padStart(2, '0')).join('-')
  return `github-chinese-${scope === 'all' ? 'backup' : scope}-${day}.json`
}

/** 设置中范围内的项（导出用） */
export function settingsOfScope(settings: Settings, scope: BackupScope): Partial<Settings> {
  return scope === 'all' ? settings : pick(settings, SCOPE_KEYS[scope])
}

/** 导入的设置项写入前与现有的合并：路径列表（排除路径、自定义页面）已有的不重复添加，新的排在后面；其余按文件覆盖 */
export function mergeImportedSettings(current: Settings, imported: Partial<Settings>): Partial<Settings> {
  const merged: Partial<Record<(typeof PATH_KEYS)[number], readonly string[]>> = {}
  for (const key of PATH_KEYS) {
    const paths = imported[key]
    if (paths) merged[key] = uniqueBy([...current[key], ...paths], path => path)
  }
  return { ...imported, ...merged }
}

/** 合并自定义词条：同原文以导入为准 */
export function mergeImportedEntries(current: CustomEntries, imported: CustomEntries): CustomEntries {
  return mergeEntries(current, imported)
}

/** 合并屏蔽规则：已有的（同一规则的不同写法）不重复添加，新的排在后面 */
export function mergeImportedRules(current: readonly string[], imported: readonly string[]): string[] {
  return uniqueBy([...current, ...imported], ruleKeyOf)
}
