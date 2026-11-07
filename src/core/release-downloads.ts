import type { FetchLike } from './folder-files'
import { isPrivatePage } from './private-page'

/**
 * 发行版附件的下载次数：发行版列表、单个发行版页面的附件行，在附件名一侧靠右显示下载次数
 * （行右侧的摘要列可收缩，放在大小之前会把摘要挤没）。
 * 次数取自 GitHub REST API（api.github.com）：不带 Cookie 与来源页、不用令牌，每个 IP 每小时限 60 次。
 * 每个发行版请求一次，同时只发一个（限额用尽时不白发其余的），结果在页面内缓存 CACHE_TTL_MS；
 * 限额用尽后到重置时间之前不再请求。
 * 只处理 github.com 上的公开存储库（企业版的 API 地址、访问方式各不相同）
 */
export interface ReleaseDownloadsDeps {
  /** 是否开启（总开关与本功能的开关） */
  readonly active: () => boolean
  /** 数字格式的语言（扩展界面语言，如 zh-CN） */
  readonly lang: () => string
  /** 读屏与提示的文字；count 为按语言分组的完整次数 */
  readonly label: (count: string) => string
  /** 取回；不给时用全局 fetch */
  readonly fetch?: FetchLike
  /** 当前时间（毫秒时间戳）；不给时用 Date.now */
  readonly now?: () => number
}

export interface ReleaseDownloads {
  /** 设置、界面语言变化后：关闭时移除，开启时补上并按新语言重写 */
  refresh(): void
  /** 停止：取消进行中的请求，移除显示 */
  stop(): void
}

/** 加的元素：附件行的下载次数（值为次数） */
export const COUNT_ATTRIBUTE = 'data-gcn-downloads'
/** 结果的有效期：过期后再遇到该发行版的附件时重新请求 */
export const CACHE_TTL_MS = 10 * 60 * 1000
/** 限额用尽、响应没有给出重置时间时暂停的时长 */
export const DEFAULT_BLOCK_MS = 10 * 60 * 1000
/** 单次请求的时限 */
export const REQUEST_TIMEOUT_MS = 10_000

const API_ORIGIN = 'https://api.github.com'
const SITE_HOST = 'github.com'
const STYLE_ID = 'gcn-downloads-style'
/** 附件的下载地址：/<所有者>/<存储库>/releases/download/<标签>/<文件名>（标签可含 /，文件名是最后一段） */
const DOWNLOAD_PATH_RE = /^\/([^/]+)\/([^/]+)\/releases\/download\/(.+)\/([^/]+)$/
/** 附件行：左侧图标与附件名，右侧摘要、大小、时间 */
const ASSET_LINK_SELECTOR = '.Box-row a[href*="/releases/download/"]'
const ROW_SELECTOR = '.Box-row'
const LEFT_SELECTOR = ':scope > .flex-justify-start'
/** Octicons 的 download（16px） */
const ICON_PATHS = [
  'M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z',
  'M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z'
]
const SVG_NS = 'http://www.w3.org/2000/svg'

/** 推到左侧的最右边，各行对齐；宽屏时与右侧的摘要隔开 */
const STYLE = `
[${COUNT_ATTRIBUTE}] {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding-left: 16px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
@media (min-width: 768px) {
  [${COUNT_ATTRIBUTE}] {
    padding-right: 16px;
  }
}
[${COUNT_ATTRIBUTE}] > svg {
  flex: none;
  fill: currentColor;
}
`

/** 发行版：所有者、存储库、标签（均已解码） */
interface ReleaseRef {
  readonly owner: string
  readonly repo: string
  readonly tag: string
}

/** 页面上的附件行 */
interface AssetRow {
  /** 放次数的元素：行的左侧，没有时为链接所在的元素 */
  readonly holder: Element
  /** 次数紧跟其后：左侧里含附件名的那一项（之后可能是另起一行的加速选项，见 core/accelerate-options） */
  readonly name: Element
  /** 附件的文件名（已解码） */
  readonly file: string
}

/** 缓存的结果：文件名 → 次数；请求中为 undefined，失败为 null */
interface CacheEntry {
  readonly at: number
  readonly counts: ReadonlyMap<string, number> | null | undefined
}

/** 限额用尽 */
class RateLimitError extends Error {
  constructor(readonly until: number) {
    super('GitHub API 限额已用尽')
  }
}

/** 页面的主机名；没有地址时为空串 */
function hostOf(doc: Document): string {
  try {
    return new URL(doc.URL).hostname
  } catch {
    return ''
  }
}

function safeDecode(text: string): string | undefined {
  try {
    return decodeURIComponent(text)
  } catch {
    return undefined
  }
}

/** 链接指向的附件：发行版与文件名；不是 github.com 的附件下载地址时为 undefined */
function parseAsset(anchor: HTMLAnchorElement): { readonly release: ReleaseRef; readonly file: string } | undefined {
  let url: URL
  try {
    url = new URL(anchor.href)
  } catch {
    return undefined
  }
  if (url.hostname !== SITE_HOST) return undefined
  const match = DOWNLOAD_PATH_RE.exec(url.pathname)
  if (!match) return undefined
  const [owner, repo, tag, file] = match.slice(1).map(part => safeDecode(part!))
  return owner && repo && tag && file ? { release: { owner, repo, tag }, file } : undefined
}

/** 行里放次数的位置：左侧容器与其中含链接的那一项；没有左侧容器时为链接所在的元素与链接本身 */
function placeOf(row: Element, anchor: HTMLAnchorElement): { readonly holder: Element; readonly name: Element } | undefined {
  const left = row.querySelector(LEFT_SELECTOR)
  if (left?.contains(anchor)) {
    let name: Element = anchor
    while (name.parentElement && name.parentElement !== left) name = name.parentElement
    return { holder: left, name }
  }
  return anchor.parentElement ? { holder: anchor.parentElement, name: anchor } : undefined
}

/** 缓存键：所有者、存储库不分大小写，标签区分 */
function releaseKey(release: ReleaseRef): string {
  return `${release.owner.toLowerCase()}/${release.repo.toLowerCase()}\n${release.tag}`
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

/** API 返回的发行版 → 文件名 → 次数；格式不符时为 undefined */
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
function rateLimitedUntil(response: Response, now: number): number | undefined {
  const retryAfter = Number(response.headers.get('retry-after'))
  if ((response.status === 403 || response.status === 429) && Number.isFinite(retryAfter) && retryAfter > 0) {
    return now + retryAfter * 1000
  }
  if (response.headers.get('x-ratelimit-remaining') !== '0') return undefined
  const reset = Number(response.headers.get('x-ratelimit-reset'))
  return Number.isFinite(reset) && reset > 0 ? reset * 1000 : now + DEFAULT_BLOCK_MS
}

function createIcon(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'octicon octicon-download')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('width', '16')
  svg.setAttribute('height', '16')
  svg.setAttribute('aria-hidden', 'true')
  for (const d of ICON_PATHS) {
    const path = doc.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', d)
    svg.append(path)
  }
  return svg
}

export function createReleaseDownloads(doc: Document, deps: ReleaseDownloadsDeps): ReleaseDownloads {
  const fetcher: FetchLike = deps.fetch ?? ((url, init) => fetch(url, init))
  const now = deps.now ?? (() => Date.now())
  const cache = new Map<string, CacheEntry>()
  const requests = new Set<AbortController>()
  /** 限额用尽：到此时间（毫秒时间戳）之前不请求 */
  let blockedUntil = 0
  /** 页面上有没有加过：没有时关闭状态下的变动不用查找移除 */
  let rendered = false
  let scheduled = false
  let stopped = false

  function enabled(): boolean {
    return deps.active() && hostOf(doc) === SITE_HOST && !isPrivatePage(doc)
  }

  function ensureStyle(): void {
    if (doc.getElementById(STYLE_ID)) return
    const style = doc.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE
    ;(doc.head ?? doc.documentElement).append(style)
  }

  function removeAll(): void {
    if (!rendered) return
    rendered = false
    for (const element of doc.querySelectorAll(`[${COUNT_ATTRIBUTE}]`)) element.remove()
    doc.getElementById(STYLE_ID)?.remove()
  }

  /** 页面上的附件行，按发行版分组；同一行只取第一个附件链接 */
  function collectRows(): Map<string, { readonly release: ReleaseRef; readonly rows: AssetRow[] }> {
    const groups = new Map<string, { readonly release: ReleaseRef; readonly rows: AssetRow[] }>()
    const seen = new Set<Element>()
    for (const anchor of doc.querySelectorAll<HTMLAnchorElement>(ASSET_LINK_SELECTOR)) {
      const row = anchor.closest(ROW_SELECTOR)
      if (!row || seen.has(row)) continue
      const asset = parseAsset(anchor)
      const place = placeOf(row, anchor)
      if (!asset || !place) continue
      seen.add(row)
      const key = releaseKey(asset.release)
      const group = groups.get(key) ?? { release: asset.release, rows: [] }
      group.rows.push({ ...place, file: asset.file })
      groups.set(key, group)
    }
    return groups
  }

  function render(rows: readonly AssetRow[], counts: ReadonlyMap<string, number>): void {
    const lang = deps.lang()
    const short = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 })
    const full = new Intl.NumberFormat(lang)
    for (const { holder, name, file } of rows) {
      const count = counts.get(file)
      if (count === undefined) continue
      const value = `${count}|${lang}`
      const existing = holder.querySelector(`:scope > [${COUNT_ATTRIBUTE}]`)
      if (existing?.getAttribute(COUNT_ATTRIBUTE) === value) {
        // 加速选项后加的行插在了附件名与次数之间：挪回附件名之后，留在第一行
        if (existing.previousElementSibling !== name) name.after(existing)
        continue
      }
      existing?.remove()
      ensureStyle()
      rendered = true
      const element = doc.createElement('span')
      element.setAttribute(COUNT_ATTRIBUTE, value)
      element.setAttribute('translate', 'no')
      // 颜色同大小、时间
      element.className = 'color-fg-muted'
      const label = deps.label(full.format(count))
      element.title = label
      const text = doc.createElement('span')
      text.setAttribute('aria-hidden', 'true')
      text.textContent = short.format(count)
      const hidden = doc.createElement('span')
      hidden.className = 'sr-only'
      hidden.textContent = label
      element.append(createIcon(doc), text, hidden)
      name.after(element)
    }
  }

  async function fetchCounts(release: ReleaseRef, signal: AbortSignal): Promise<ReadonlyMap<string, number>> {
    const path = [release.owner, release.repo].map(encodeURIComponent).join('/')
    const response = await fetcher(`${API_ORIGIN}/repos/${path}/releases/tags/${encodeURIComponent(release.tag)}`, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/vnd.github+json' },
      signal
    })
    const until = rateLimitedUntil(response, now())
    if (!response.ok) {
      if (until !== undefined) throw new RateLimitError(until)
      throw new Error(`取回下载次数失败：${response.status}`)
    }
    // 本次成功但限额已用完：之后的先不请求
    if (until !== undefined) blockedUntil = Math.max(blockedUntil, until)
    const counts = parseReleaseCounts(await response.json())
    if (!counts) throw new Error('下载次数的格式不符')
    return counts
  }

  function request(key: string, release: ReleaseRef): void {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    requests.add(controller)
    cache.set(key, { at: now(), counts: undefined })
    fetchCounts(release, controller.signal)
      .then(
        counts => {
          cache.set(key, { at: now(), counts })
        },
        (error: unknown) => {
          if (error instanceof RateLimitError) {
            // 限额重置后可再请求：不记为失败
            blockedUntil = Math.max(blockedUntil, error.until)
            cache.delete(key)
            return
          }
          cache.set(key, { at: now(), counts: null })
        }
      )
      .finally(() => {
        clearTimeout(timer)
        requests.delete(controller)
        // 显示结果，接着请求下一个发行版
        schedule()
      })
  }

  function scan(): void {
    scheduled = false
    if (stopped) return
    if (!enabled()) {
      removeAll()
      return
    }
    for (const [key, { release, rows }] of collectRows()) {
      const entry = cache.get(key)
      if (entry && now() - entry.at < CACHE_TTL_MS) {
        if (entry.counts) render(rows, entry.counts)
        continue
      }
      if (requests.size > 0 || now() < blockedUntil) continue
      request(key, release)
    }
  }

  function schedule(): void {
    if (scheduled || stopped) return
    scheduled = true
    queueMicrotask(scan)
  }

  const observer = new MutationObserver(schedule)
  observer.observe(doc.documentElement, { childList: true, subtree: true })
  scan()

  return {
    refresh() {
      // 界面语言可能变了：按缓存重写（有效期内不再请求）
      removeAll()
      scan()
    },
    stop() {
      stopped = true
      observer.disconnect()
      for (const controller of requests) controller.abort()
      requests.clear()
      removeAll()
    }
  }
}
