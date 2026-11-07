import { storage } from 'wxt/utils/storage'
import { sanitizeAccelerateSettings, type AccelerateSettings } from './accelerate-categories'
import { DEFAULT_AUTO_LOAD_SCOPES, sanitizeAutoLoadScopes, type AutoLoadScope } from './auto-load'
import { isPageLocalePreference, isUiLanguagePreference, type PageLocalePreference, type UiLanguagePreference } from './locale'
import { DEFAULT_NEW_TAB_SCOPES, sanitizeNewTabScopes, type NewTabScope } from './new-tab'
import { DEFAULT_CUSTOM_TIME_FORMAT, isTimeFormatMode, sanitizeTimeFormat, type TimeFormatMode } from './time-format'

/** 扩展界面外观：auto 跟随浏览器 */
export type ThemePreference = 'auto' | 'light' | 'dark'

export const THEME_PREFERENCES: readonly ThemePreference[] = ['auto', 'light', 'dark']

export function isThemePreference(value: unknown): value is ThemePreference {
  return (THEME_PREFERENCES as readonly unknown[]).includes(value)
}

export interface Settings extends AccelerateSettings {
  /** 总开关 */
  readonly enabled: boolean
  /** 时间本地化：<relative-time> 等元素改用中文格式 */
  readonly translateTime: boolean
  /** 时间格式：default 为元素按翻译语言渲染；custom 按 customTimeFormat 显示具体时刻（见 shared/time-format） */
  readonly timeFormat: TimeFormatMode
  /** 自定义时间格式的写法（如 YYYY-MM-DD HH:mm）；为空时按默认 */
  readonly customTimeFormat: string
  /** 翻译标签页标题 */
  readonly translateTitle: boolean
  /**
   * 排除路径。以 / 开头；* 匹配单段，** 匹配任意多段；
   * 命中路径本身及其下级路径。例：/settings、/*\/*\/wiki
   */
  readonly excludedPaths: readonly string[]
  /** 页面翻译语言（简体 / 繁体）；auto 按浏览器语言 */
  readonly language: PageLocalePreference
  /** 扩展界面语言；auto 按浏览器界面语言 */
  readonly uiLanguage: UiLanguagePreference
  /** 扩展界面外观；auto 跟随浏览器 */
  readonly theme: ThemePreference
  /**
   * 下载加速：Release 附件、源码包、Raw 文件、Gist 的链接与克隆地址旁加各分类的加速选项（见 core/accelerate-options）；
   * 选了替换原链接的分类时原链接也改走该分类（见 replaceCategory）
   */
  readonly accelerate: boolean
  /** 图片加速：GitHub 的图片加载失败时经加速源取回（见 core/image-accelerate） */
  readonly accelerateImages: boolean
  /** 故障转移：探测各加速源，分类中用可用的最快的（不可用的分类按自动隐藏开关处理）；图片取不到时依次换用其他加速源 */
  readonly failover: boolean
  /** 搜索净化：搜索结果中命中屏蔽规则的直接隐藏（规则见 searchBlockRulesItem，处理见 core/search-purify） */
  readonly purifySearch: boolean
  /** 内置屏蔽规则（见 shared/search-block-builtin）：与自定义的屏蔽规则一起用 */
  readonly purifyBuiltin: boolean
  /** 自动加载：「加载更多」按钮、分页列表的下一页在接近页面底部时自动加载（范围见 autoLoadScopes，处理见 core/auto-load） */
  readonly autoLoad: boolean
  /** 自动加载的范围（见 shared/auto-load） */
  readonly autoLoadScopes: readonly AutoLoadScope[]
  /** 图片预览：单击正文中的图片在页面内预览（见 core/image-preview） */
  readonly imagePreview: boolean
  /** 下载文件夹：目录页「…」菜单加下载文件夹（见 core/folder-download） */
  readonly folderDownload: boolean
  /** 下载次数：发行版附件行显示下载次数，取自 GitHub REST API（见 core/release-downloads） */
  readonly downloadCount: boolean
  /** 新标签页打开：总开关（范围见 newTabScopes、newTabPaths，处理见 core/new-tab） */
  readonly newTab: boolean
  /** 新标签页打开的范围（见 shared/new-tab） */
  readonly newTabScopes: readonly NewTabScope[]
  /** 新标签页打开的自定义页面：这些页面上的链接都在新标签页打开，写法同排除路径 */
  readonly newTabPaths: readonly string[]
}

/**
 * 自定义词条：原文 → 译文，优先于内置词条与正则。
 * 内置属性规则命中的属性、内置行内句整句命中的句子不再查词典，自定义词条对它们不生效
 */
export type CustomEntries = Readonly<Record<string, string>>

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  translateTime: true,
  timeFormat: 'default',
  customTimeFormat: DEFAULT_CUSTOM_TIME_FORMAT,
  translateTitle: true,
  excludedPaths: [],
  language: 'auto',
  uiLanguage: 'auto',
  theme: 'auto',
  accelerate: false,
  accelerateImages: false,
  failover: false,
  purifySearch: true,
  purifyBuiltin: true,
  autoLoad: false,
  autoLoadScopes: DEFAULT_AUTO_LOAD_SCOPES,
  imagePreview: false,
  folderDownload: true,
  downloadCount: false,
  newTab: false,
  newTabScopes: DEFAULT_NEW_TAB_SCOPES,
  newTabPaths: [],
  categories: [],
  categoryOrder: [],
  removedCategories: [],
  customSources: [],
  removedSources: [],
  replaceCategory: ''
}

/**
 * 已删除的设置项，写入时固定为下列值（读取时忽略）。
 * collectUntranslated：旧版本的「收集未翻译」开关。设置随浏览器账号同步，未更新的旧版本读不到时按开启处理
 */
export const LEGACY_SETTING_VALUES = { collectUntranslated: false } as const

export const settingsItem = storage.defineItem<Partial<Settings>>('sync:settings', {
  fallback: DEFAULT_SETTINGS
})

export const customEntriesItem = storage.defineItem<CustomEntries>('local:customEntries', {
  fallback: {}
})

/** 搜索净化的屏蔽规则：每项一条（写法见 shared/search-block）。可能较多，不放进同步的设置 */
export const searchBlockRulesItem = storage.defineItem<readonly string[]>('local:searchBlockRules', {
  fallback: []
})

/**
 * 导入的企业版站点中尚未授权的（主机名）：授权要在用户点击时申请（读取文件后已不在点击中），
 * 由设置页的企业版设置列出、点击授权（见 entrypoints/options/useEnterpriseSites）
 */
export const pendingSitesItem = storage.defineItem<readonly string[]>('local:pendingEnterpriseSites', {
  fallback: []
})

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/**
 * 合并存储值与默认值，丢弃类型不符的字段与未知字段；加速源设置见 sanitizeAccelerateSettings。
 * 旧版本的首选加速源为自动选择（accelerateSource: 'auto'）时开启故障转移（自动选择要探测）
 */
export function mergeSettings(stored: unknown): Settings {
  if (typeof stored !== 'object' || stored === null) return DEFAULT_SETTINGS
  const value = stored as Record<string, unknown>
  const pickBoolean = (key: keyof Settings, fallback: boolean): boolean =>
    typeof value[key] === 'boolean' ? (value[key] as boolean) : fallback
  const merged: Settings = {
    enabled: pickBoolean('enabled', DEFAULT_SETTINGS.enabled),
    translateTime: pickBoolean('translateTime', DEFAULT_SETTINGS.translateTime),
    timeFormat: isTimeFormatMode(value.timeFormat) ? value.timeFormat : DEFAULT_SETTINGS.timeFormat,
    customTimeFormat: sanitizeTimeFormat(value.customTimeFormat),
    translateTitle: pickBoolean('translateTitle', DEFAULT_SETTINGS.translateTitle),
    excludedPaths: isStringArray(value.excludedPaths) ? value.excludedPaths : DEFAULT_SETTINGS.excludedPaths,
    language: isPageLocalePreference(value.language) ? value.language : DEFAULT_SETTINGS.language,
    uiLanguage: isUiLanguagePreference(value.uiLanguage) ? value.uiLanguage : DEFAULT_SETTINGS.uiLanguage,
    theme: isThemePreference(value.theme) ? value.theme : DEFAULT_SETTINGS.theme,
    accelerate: pickBoolean('accelerate', DEFAULT_SETTINGS.accelerate),
    accelerateImages: pickBoolean('accelerateImages', DEFAULT_SETTINGS.accelerateImages),
    failover: pickBoolean('failover', DEFAULT_SETTINGS.failover) || value.accelerateSource === 'auto',
    purifySearch: pickBoolean('purifySearch', DEFAULT_SETTINGS.purifySearch),
    purifyBuiltin: pickBoolean('purifyBuiltin', DEFAULT_SETTINGS.purifyBuiltin),
    autoLoad: pickBoolean('autoLoad', DEFAULT_SETTINGS.autoLoad),
    autoLoadScopes: sanitizeAutoLoadScopes(value.autoLoadScopes),
    imagePreview: pickBoolean('imagePreview', DEFAULT_SETTINGS.imagePreview),
    folderDownload: pickBoolean('folderDownload', DEFAULT_SETTINGS.folderDownload),
    downloadCount: pickBoolean('downloadCount', DEFAULT_SETTINGS.downloadCount),
    newTab: pickBoolean('newTab', DEFAULT_SETTINGS.newTab),
    newTabScopes: sanitizeNewTabScopes(value.newTabScopes),
    newTabPaths: isStringArray(value.newTabPaths) ? value.newTabPaths : DEFAULT_SETTINGS.newTabPaths,
    ...sanitizeAccelerateSettings(value)
  }
  return merged
}

/** 过滤非字符串、空键空值 */
export function sanitizeCustomEntries(stored: unknown): CustomEntries {
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return {}
  const entries = Object.entries(stored as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[0].trim() !== '' && entry[1].trim() !== ''
  )
  return Object.fromEntries(entries)
}

export async function getSettings(): Promise<Settings> {
  return mergeSettings(await settingsItem.getValue())
}

/** 要写入的部分设置；按当前设置计算时传函数（如增删列表项，读改写不丢失之前的修改） */
export type SettingsPatch = Partial<Settings> | ((current: Settings) => Partial<Settings>)

/** 合并写入；已删除的设置项一并写入固定值（见 LEGACY_SETTING_VALUES） */
export async function updateSettings(patch: SettingsPatch): Promise<Settings> {
  const current = await getSettings()
  const next = { ...current, ...(typeof patch === 'function' ? patch(current) : patch) }
  await settingsItem.setValue({ ...next, ...LEGACY_SETTING_VALUES })
  return next
}

export function watchSettings(callback: (settings: Settings) => void): () => void {
  return settingsItem.watch(value => callback(mergeSettings(value)))
}

export async function getCustomEntries(): Promise<CustomEntries> {
  return sanitizeCustomEntries(await customEntriesItem.getValue())
}

export function watchCustomEntries(callback: (entries: CustomEntries) => void): () => void {
  return customEntriesItem.watch(value => callback(sanitizeCustomEntries(value)))
}

function globToRegExp(pattern: string): RegExp {
  const source = pattern
    .replace(/\/+$/, '')
    .split(/(\*\*|\*)/)
    .map(part => {
      if (part === '**') return '.*'
      if (part === '*') return '[^/]*'
      return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
  return new RegExp(`^${source}(?:/.*)?$`, 'i')
}

/** 路径是否命中路径规则（排除路径、新标签页打开的自定义页面）：以 / 开头，* 匹配单段，** 匹配任意多段，含下级路径 */
export function matchesPathPattern(pathname: string, patterns: readonly string[]): boolean {
  return patterns
    .map(pattern => pattern.trim())
    .filter(pattern => pattern.startsWith('/'))
    .some(pattern => globToRegExp(pattern).test(pathname))
}

/** 路径是否被排除规则命中 */
export function isPathExcluded(pathname: string, patterns: readonly string[]): boolean {
  return matchesPathPattern(pathname, patterns)
}

/** 值为布尔的设置项 */
export type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never
}[keyof Settings]

/** 写入自定义词条（先过滤无效项），返回实际写入的值 */
export async function setCustomEntries(entries: CustomEntries): Promise<CustomEntries> {
  const next = sanitizeCustomEntries(entries)
  await customEntriesItem.setValue(next)
  return next
}

/** 过滤非字符串与空行，去掉首尾空白 */
export function sanitizeSearchBlockRules(stored: unknown): readonly string[] {
  if (!Array.isArray(stored)) return []
  return stored
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item !== '')
}

export async function getSearchBlockRules(): Promise<readonly string[]> {
  return sanitizeSearchBlockRules(await searchBlockRulesItem.getValue())
}

export function watchSearchBlockRules(callback: (rules: readonly string[]) => void): () => void {
  return searchBlockRulesItem.watch(value => callback(sanitizeSearchBlockRules(value)))
}

/** 写入屏蔽规则（先过滤无效项），返回实际写入的值 */
export async function setSearchBlockRules(rules: readonly string[]): Promise<readonly string[]> {
  const next = sanitizeSearchBlockRules(rules)
  await searchBlockRulesItem.setValue(next)
  return next
}

/** 规范化一条排除规则：去掉首尾空白；不以 / 开头时为 undefined */
export function normalizeExcludedPath(value: string): string | undefined {
  const path = value.trim()
  return path.startsWith('/') ? path : undefined
}

/** 根路径 / 作为规则会命中全部页面，不能单独排除 */
export function canExcludePath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '') !== ''
}

/** 把页面路径加入排除规则；已命中或不可排除时原样返回 */
export function addExcludedPath(patterns: readonly string[], pathname: string): readonly string[] {
  if (!canExcludePath(pathname) || isPathExcluded(pathname, patterns)) return patterns
  return [...patterns, pathname.replace(/\/+$/, '')]
}

/** 移除所有命中页面路径的排除规则 */
export function removeExcludedPath(patterns: readonly string[], pathname: string): readonly string[] {
  return patterns.filter(pattern => !isPathExcluded(pathname, [pattern]))
}
