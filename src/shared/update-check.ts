import { browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'
import { REPOSITORY_URL } from './extension'
import { getSettings, type Settings } from './settings'
import { DEFAULT_UPDATE_INTERVAL, UPDATE_INTERVAL_MS } from './update-settings'

/**
 * 新版本检查：从发行版安装的（Chromium 解压加载、Safari 宿主应用）不会自动更新，弹出页、设置页据此提示新版本。
 * 打开时按设置（updateCheck、updateInterval）自动检查，也可手动检查。
 * 商店版由商店更新：Chrome 应用商店、Edge 加载项安装时在 manifest 中写入 update_url；企业策略部署的由管理员更新。
 * Firefox 不检查（见 components/useUpdateCheck）
 */

/** 最新发行版（不含预发行版）：GitHub 跳转到 /releases/tag/v<版本号> */
export const LATEST_RELEASE_URL = `${REPOSITORY_URL}/releases/latest`

/** 单次请求的时限 */
export const UPDATE_CHECK_TIMEOUT_MS = 10_000

/** 上次检查的结果 */
export interface UpdateCheck {
  /** 最新发行版的版本号 */
  readonly latest: string
  /** 检查时间（毫秒时间戳） */
  readonly checkedAt: number
}

// 标为无副作用：Firefox 构建不检查新版本，用不到时打包去掉
export const updateCheckItem = /* @__PURE__ */ storage.defineItem<UpdateCheck | null>('local:updateCheck', {
  fallback: null
})

/** 安装方式：商店、企业策略部署、手动（解压加载、宿主应用等） */
export type InstallSource = 'store' | 'admin' | 'manual'

/** manifest 带 update_url 的是商店安装；installType（management.getSelf）为 admin 的是企业策略部署 */
export function installSource(manifest: { readonly update_url?: unknown }, installType: string | undefined): InstallSource {
  if (typeof manifest.update_url === 'string' && manifest.update_url !== '') return 'store'
  return installType === 'admin' ? 'admin' : 'manual'
}

/** 版本号：1～4 段数字，同 manifest 的 version */
const VERSION_RE = /^\d+(?:\.\d+){0,3}$/

function versionParts(version: string): number[] | undefined {
  return VERSION_RE.test(version) ? version.split('.').map(Number) : undefined
}

/** candidate 比 current 新（缺的段按 0）；任一不是版本号时为 false */
export function isNewerVersion(candidate: string, current: string): boolean {
  const next = versionParts(candidate)
  const now = versionParts(current)
  if (!next || !now) return false
  for (let index = 0; index < Math.max(next.length, now.length); index++) {
    const diff = (next[index] ?? 0) - (now[index] ?? 0)
    if (diff !== 0) return diff > 0
  }
  return false
}

/** 发行版页的路径。所有者、名称不限：存储库改名、转移后 GitHub 跳转到新地址 */
const RELEASE_PATH_RE = /^\/[^/]+\/[^/]+\/releases\/tag\/v?(\d+(?:\.\d+){0,3})$/

/** 发行版页地址中的版本号（…/releases/tag/v1.3.0 → 1.3.0）；预发行版及其他地址为 undefined */
export function releaseVersion(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    return parsed.origin === 'https://github.com' ? RELEASE_PATH_RE.exec(parsed.pathname)?.[1] : undefined
  } catch {
    return undefined
  }
}

/** 该版本的发行版页 */
export function releaseUrl(version: string): string {
  return `${REPOSITORY_URL}/releases/tag/v${version}`
}

/** 自动检查：是否检查、两次检查的最短间隔 */
export interface UpdatePolicy {
  readonly auto: boolean
  readonly intervalMs: number
}

const DEFAULT_POLICY: UpdatePolicy = { auto: true, intervalMs: UPDATE_INTERVAL_MS[DEFAULT_UPDATE_INTERVAL] }

/** 设置里的自动检查 */
export function updatePolicy(settings: Pick<Settings, 'updateCheck' | 'updateInterval'>): UpdatePolicy {
  return { auto: settings.updateCheck, intervalMs: UPDATE_INTERVAL_MS[settings.updateInterval] }
}

export interface UpdateCheckDeps {
  fetch(url: string, init: RequestInit): Promise<Pick<Response, 'ok' | 'url'>>
  /** 当前时间（毫秒时间戳） */
  now(): number
  manifest(): { readonly update_url?: unknown }
  /** management.getSelf() 的 installType；没有该接口时为 undefined */
  installType(): Promise<string | undefined>
  /** 自动检查的设置 */
  policy(): Promise<UpdatePolicy>
}

export const UPDATE_CHECK_DEPS: UpdateCheckDeps = {
  // 不把全局 fetch 直接挂到对象上：以对象为 this 调用会报 Illegal invocation
  fetch: (url, init) => fetch(url, init),
  now: () => Date.now(),
  manifest: () => browser.runtime.getManifest(),
  // getSelf 不需要 management 权限
  installType: async () => (await browser.management?.getSelf?.())?.installType,
  policy: async () => updatePolicy(await getSettings())
}

/**
 * 请求最新发行版，取跳转后地址中的版本号；失败、超时为 undefined。
 * HEAD：只要跳转后的地址。已有 github.com 的主机权限，跨源请求读得到；不带 Cookie 与来源页
 */
export async function fetchLatestVersion(deps: UpdateCheckDeps = UPDATE_CHECK_DEPS): Promise<string | undefined> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT_MS)
  try {
    const response = await deps.fetch(LATEST_RELEASE_URL, {
      method: 'HEAD',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    })
    return response.ok ? releaseVersion(response.url) : undefined
  } catch {
    return undefined
  } finally {
    clearTimeout(timer)
  }
}

function isUpdateCheck(value: unknown): value is UpdateCheck {
  if (typeof value !== 'object' || value === null) return false
  const { latest, checkedAt } = value as Partial<Record<keyof UpdateCheck, unknown>>
  return typeof latest === 'string' && typeof checkedAt === 'number'
}

async function readCache(): Promise<UpdateCheck | undefined> {
  try {
    const value: unknown = await updateCheckItem.getValue()
    return isUpdateCheck(value) ? value : undefined
  } catch {
    return undefined
  }
}

async function readInstallSource(deps: UpdateCheckDeps): Promise<InstallSource | undefined> {
  let installType: string | undefined
  try {
    installType = await deps.installType()
  } catch {
    installType = undefined
  }
  try {
    return installSource(deps.manifest(), installType)
  } catch {
    return undefined
  }
}

async function readPolicy(deps: UpdateCheckDeps): Promise<UpdatePolicy> {
  try {
    return await deps.policy()
  } catch {
    return DEFAULT_POLICY
  }
}

/** 是否检查新版本：手动安装的（商店安装、企业策略部署的不检查） */
export async function canCheckUpdates(deps: UpdateCheckDeps = UPDATE_CHECK_DEPS): Promise<boolean> {
  return (await readInstallSource(deps)) === 'manual'
}

/** 请求最新发行版的版本号并写入缓存；失败为 undefined，缓存不变 */
async function requestLatest(deps: UpdateCheckDeps): Promise<string | undefined> {
  const now = deps.now()
  const latest = await fetchLatestVersion(deps)
  if (latest === undefined) return undefined
  try {
    await updateCheckItem.setValue({ latest, checkedAt: now })
  } catch {
    // 写不进缓存：下次打开时再请求
  }
  return latest
}

/**
 * 取最新发行版的版本号，经 onLatest 回调：手动安装时先回调缓存的；开启自动检查且缓存过期（或检查时间晚于当前）再请求，
 * 取到则回调并写入缓存，失败时缓存不变。商店安装、企业策略部署不读缓存、不请求
 */
export async function checkLatestVersion(onLatest: (version: string) => void, deps: UpdateCheckDeps = UPDATE_CHECK_DEPS): Promise<void> {
  if (!(await canCheckUpdates(deps))) return
  const now = deps.now()
  const cached = await readCache()
  if (cached) onLatest(cached.latest)
  const policy = await readPolicy(deps)
  if (!policy.auto) return
  if (cached && cached.checkedAt <= now && now - cached.checkedAt < policy.intervalMs) return
  const latest = await requestLatest(deps)
  if (latest !== undefined) onLatest(latest)
}

/** 手动检查：不看缓存与设置，直接请求；取到的写入缓存。失败为 undefined */
export async function checkForUpdate(deps: UpdateCheckDeps = UPDATE_CHECK_DEPS): Promise<string | undefined> {
  return requestLatest(deps)
}
