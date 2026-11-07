import { storage } from 'wxt/utils/storage'

/**
 * GitHub REST API（api.github.com）：发行版附件的下载次数（后台请求，见 core/release-downloads）与限额（设置页）。
 * 不带 Cookie 与来源页。设置了个人访问令牌时带上：每个帐户每小时 5000 次（同一帐户的令牌、授权的应用共用）；
 * 不带时每个 IP 每小时 60 次。
 * 令牌只存在 storage.local（不随浏览器账号同步），只由后台与设置页读取，不交给内容脚本
 */

export const GITHUB_API_ORIGIN = 'https://api.github.com'
/** 新建精细个人访问令牌的页面 */
export const NEW_TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'
/** GitHub 的每小时请求限额（设置页的说明）：不带令牌时每个 IP，带令牌时每个帐户 */
export const ANONYMOUS_RATE_LIMIT = 60
export const TOKEN_RATE_LIMIT = 5000
/** 单次请求的时限 */
export const API_TIMEOUT_MS = 10_000
/** 下载次数在后台缓存的时长（各标签页共用） */
export const RELEASE_CACHE_TTL_MS = 10 * 60 * 1000
/** 后台缓存的发行版数上限：超出时丢弃最早的 */
export const RELEASE_CACHE_MAX = 200
/** 限额用尽、响应没有给出重置时间时暂停的时长 */
export const DEFAULT_BLOCK_MS = 10 * 60 * 1000

/** 个人访问令牌；没有时为空串 */
export const githubTokenItem = storage.defineItem<string>('local:githubToken', { fallback: '' })

/**
 * 令牌的写法：精细令牌（github_pat_）、经典令牌（ghp_）与其他 gh?_ 前缀的令牌、旧版 40 位十六进制。
 * 长度从宽：GitHub 可能加长令牌
 */
const TOKEN_RE = /^(?:github_pat_\w{22,251}|gh[opsur]_[A-Za-z\d]{30,251}|[\da-f]{40})$/

/** 规范化输入的令牌：去掉首尾空白；写法不符时为 undefined */
export function normalizeToken(value: string): string | undefined {
  const token = value.trim()
  return TOKEN_RE.test(token) ? token : undefined
}

/** 读取已保存的令牌；没有、写法不符、读取失败时为空串 */
export async function readGitHubToken(): Promise<string> {
  try {
    const value: unknown = await githubTokenItem.getValue()
    return typeof value === 'string' ? (normalizeToken(value) ?? '') : ''
  } catch {
    return ''
  }
}

/** 发行版：所有者、存储库、标签（均已解码） */
export interface ReleaseRef {
  readonly owner: string
  readonly repo: string
  readonly tag: string
}

/** 取下载次数的结果：成功（附件文件名 → 次数；限额已用完时另给重置时间），限额用尽（到何时为止），失败 */
export type ReleaseCountsResult =
  | { readonly kind: 'ok'; readonly counts: ReadonlyMap<string, number>; readonly limitedUntil?: number }
  | { readonly kind: 'limited'; readonly until: number }
  | { readonly kind: 'failed' }

export type ApiFetch = (url: string, init: RequestInit) => Promise<Response>

export interface ApiDeps {
  readonly fetch: ApiFetch
  /** 当前时间（毫秒时间戳） */
  readonly now: () => number
}

export const API_DEPS: ApiDeps = {
  // 不把全局 fetch 直接挂到对象上：以对象为 this 调用会报 Illegal invocation
  fetch: (url, init) => fetch(url, init),
  now: () => Date.now()
}

function safeDecode(text: string): string | undefined {
  try {
    return decodeURIComponent(text)
  } catch {
    return undefined
  }
}

/** 地址的最后一段（已解码） */
function lastSegment(url: string): string | undefined {
  try {
    const segment = new URL(url).pathname.split('/').pop()
    return segment ? safeDecode(segment) : undefined
  } catch {
    return undefined
  }
}

/** API 返回的发行版 → 附件文件名（下载地址的最后一段，解码后；没有地址时用 name）→ 次数；格式不符时为 undefined */
export function parseReleaseCounts(data: unknown): ReadonlyMap<string, number> | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const assets: unknown = (data as { readonly assets?: unknown }).assets
  if (!Array.isArray(assets)) return undefined
  const counts = new Map<string, number>()
  for (const asset of assets as unknown[]) {
    if (typeof asset !== 'object' || asset === null) continue
    const { browser_download_url: url, download_count: count, name } = asset as Readonly<Record<string, unknown>>
    if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) continue
    const file = (typeof url === 'string' ? lastSegment(url) : undefined) ?? (typeof name === 'string' ? name : undefined)
    if (file) counts.set(file, count)
  }
  return counts
}

/** 限额用尽时到何时为止（毫秒时间戳）；没有用尽时为 undefined */
export function rateLimitedUntil(response: Pick<Response, 'status' | 'headers'>, now: number): number | undefined {
  const retryAfter = Number(response.headers.get('retry-after'))
  if ((response.status === 403 || response.status === 429) && Number.isFinite(retryAfter) && retryAfter > 0) {
    return now + retryAfter * 1000
  }
  if (response.headers.get('x-ratelimit-remaining') !== '0') return undefined
  const reset = Number(response.headers.get('x-ratelimit-reset'))
  return Number.isFinite(reset) && reset > 0 ? reset * 1000 : now + DEFAULT_BLOCK_MS
}

/** GET 请求 API：带令牌时加 Authorization；超时取消 */
async function apiGet(path: string, token: string, deps: ApiDeps): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    return await deps.fetch(`${GITHUB_API_ORIGIN}${path}`, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: token
        ? { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` }
        : { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    })
  } finally {
    clearTimeout(timer)
  }
}

/** 发行版的 API 路径 */
export function releasePath(release: ReleaseRef): string {
  const repo = [release.owner, release.repo].map(encodeURIComponent).join('/')
  return `/repos/${repo}/releases/tags/${encodeURIComponent(release.tag)}`
}

/** 请求发行版，取各附件的下载次数。令牌无效（401）时改为不带令牌再请求一次；出错时为 failed */
export async function fetchReleaseCounts(release: ReleaseRef, token: string, deps: ApiDeps = API_DEPS): Promise<ReleaseCountsResult> {
  try {
    const path = releasePath(release)
    let response = await apiGet(path, token, deps)
    if (response.status === 401 && token) response = await apiGet(path, '', deps)
    const until = rateLimitedUntil(response, deps.now())
    if (!response.ok) return until === undefined ? { kind: 'failed' } : { kind: 'limited', until }
    const counts = parseReleaseCounts(await response.json())
    if (!counts) return { kind: 'failed' }
    return until === undefined ? { kind: 'ok', counts } : { kind: 'ok', counts, limitedUntil: until }
  } catch {
    return { kind: 'failed' }
  }
}

/** 限额：每小时总数、剩余、重置时间（秒级时间戳） */
export interface RateLimit {
  readonly limit: number
  readonly remaining: number
  readonly reset: number
}

/** 查询限额的结果：成功、令牌无效、失败 */
export type RateLimitResult =
  { readonly kind: 'ok'; readonly rate: RateLimit } | { readonly kind: 'unauthorized' } | { readonly kind: 'failed' }

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

/** 查询当前限额（GET /rate_limit，不计入限额） */
export async function fetchRateLimit(token: string, deps: ApiDeps = API_DEPS): Promise<RateLimitResult> {
  try {
    const response = await apiGet('/rate_limit', token, deps)
    if (response.status === 401) return { kind: 'unauthorized' }
    if (!response.ok) return { kind: 'failed' }
    const data: unknown = await response.json()
    const core: unknown = (data as { readonly resources?: { readonly core?: unknown } } | null)?.resources?.core
    if (typeof core !== 'object' || core === null) return { kind: 'failed' }
    const { limit, remaining, reset } = core as Readonly<Record<string, unknown>>
    return isCount(limit) && isCount(remaining) && isCount(reset) ? { kind: 'ok', rate: { limit, remaining, reset } } : { kind: 'failed' }
  } catch {
    return { kind: 'failed' }
  }
}

/** 缓存键：所有者、存储库不分大小写，标签区分 */
export function releaseKey(release: ReleaseRef): string {
  return `${release.owner.toLowerCase()}/${release.repo.toLowerCase()}\n${release.tag}`
}

export interface ReleaseCountsServiceDeps {
  /** 请求一个发行版 */
  readonly fetchCounts: (release: ReleaseRef, token: string) => Promise<ReleaseCountsResult>
  /** 当前的令牌（每次请求前读取） */
  readonly token: () => Promise<string>
  readonly now: () => number
}

export interface ReleaseCountsService {
  /** 取下载次数：有效期内用缓存，同一发行版的并发请求合并；限额用尽期间不请求（换了令牌时照常请求） */
  get(release: ReleaseRef): Promise<ReleaseCountsResult>
}

/** 后台的下载次数服务：各标签页共用缓存与限额状态 */
export function createReleaseCountsService(deps: ReleaseCountsServiceDeps): ReleaseCountsService {
  const cache = new Map<string, { readonly at: number; readonly counts: ReadonlyMap<string, number> }>()
  const pending = new Map<string, Promise<ReleaseCountsResult>>()
  /**
   * 限额用尽：到此时间（毫秒时间戳）之前不请求；只对用尽时的令牌生效。限额按帐户计（不带令牌时按 IP），
   * 换的令牌可能属于别的帐户：照常请求，同一帐户的会再次用尽
   */
  let blockedUntil = 0
  let blockedToken = ''

  function block(until: number, token: string): void {
    blockedUntil = token === blockedToken ? Math.max(blockedUntil, until) : until
    blockedToken = token
  }

  function remember(key: string, counts: ReadonlyMap<string, number>): void {
    cache.delete(key)
    cache.set(key, { at: deps.now(), counts })
    while (cache.size > RELEASE_CACHE_MAX) cache.delete(cache.keys().next().value!)
  }

  async function load(key: string, release: ReleaseRef): Promise<ReleaseCountsResult> {
    const token = await deps.token()
    if (deps.now() < blockedUntil && token === blockedToken) return { kind: 'limited', until: blockedUntil }
    const result = await deps.fetchCounts(release, token)
    if (result.kind === 'limited') block(result.until, token)
    if (result.kind === 'ok') {
      if (result.limitedUntil !== undefined) block(result.limitedUntil, token)
      remember(key, result.counts)
    }
    return result
  }

  return {
    get(release) {
      const key = releaseKey(release)
      const hit = cache.get(key)
      if (hit && deps.now() - hit.at < RELEASE_CACHE_TTL_MS) return Promise.resolve({ kind: 'ok', counts: hit.counts })
      const running = pending.get(key)
      if (running) return running
      const task = load(key, release).finally(() => pending.delete(key))
      pending.set(key, task)
      return task
    }
  }
}
