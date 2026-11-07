import { createImageViewer, type ImageViewer, type ViewerImage, type ViewerLabel } from './image-viewer'

/**
 * 图片预览：开启后，单击正文（自述文件、议题与拉取请求的评论、发行说明、维基、讨论等渲染后的 Markdown）里的图片，
 * 或文件页显示的图片文件，在页面内预览（见 image-viewer），页面上其余正文图片可左右切换。
 * 图片链到别处（作者加的链接，如横幅链到网站）时同样预览，预览中可打开链接；链接不是 http(s) 的照常打开链接。
 * 徽章、图标（见 isBadge）不论有没有链接都不预览，也不在切换之列：单击照常（链到别处时打开链接，
 * 没有链接时 GitHub 给图片加的链接在新标签页打开图片）。
 * 表情、头像、加载失败的图片不处理；中键、带修饰键的单击照常处理
 */
export interface ImagePreviewOptions {
  /** 是否预览：总开关与「图片预览」都开启 */
  readonly active: () => boolean
  readonly label: (key: ViewerLabel) => string
  /** 在新标签页打开 */
  readonly open: (url: string) => void
  /** 取回图片（下载用）；应答不成功、不是图片时拒绝 */
  readonly fetchImage?: (url: string) => Promise<Blob>
}

export interface ImagePreview {
  /** 单击：在 window 的捕获阶段注册，先于下载加速、新标签页打开与页面脚本；处理的单击不再传给页面 */
  readonly onClick: (event: MouseEvent) => void
  /** 关闭预览（关闭功能、软导航、停止时） */
  close(): void
}

/** 渲染后的 Markdown */
const CONTENT_SELECTOR = '.markdown-body, .comment-body'
const IMAGE_SELECTOR = '.markdown-body img, .comment-body img'
/** 不预览：表情、头像 */
const EXCLUDED_SELECTOR = 'img.emoji, g-emoji img, img.avatar, .avatar img'
/** 图片代理、上传图片的主机：链到这里的都是图片 */
const IMAGE_HOSTS: ReadonlySet<string> = new Set([
  'camo.githubusercontent.com',
  'user-images.githubusercontent.com',
  'private-user-images.githubusercontent.com'
])
const IMAGE_EXTENSION_RE = /\.(?:apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i
/** 徽章的地址：主机或路径含 badge、shields（img.shields.io、…/badge.svg、badgen.net 等） */
const BADGE_RE = /badge|shields/i
/** 图标、徽章的尺寸上限（CSS 像素），见 isBadge */
const SMALL_MAX_SIZE = 32
/** 下载文件的扩展名 */
const MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/apng': 'apng',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico'
}
/** 下载用的 blob: 地址保留多久 */
const REVOKE_DELAY_MS = 60_000

function parseUrl(href: string): URL | undefined {
  try {
    return new URL(href)
  } catch {
    return undefined
  }
}

/** 图片当前显示的地址：http(s)、data: 图片或 blob:；其余为 undefined */
export function imageSource(img: HTMLImageElement): string | undefined {
  const src = img.currentSrc || img.src
  return /^(?:https?:|data:image\/|blob:)/i.test(src) ? src : undefined
}

/** 链接指向图片本身：同一地址、图片代理与上传图片的主机，或路径以图片扩展名结尾 */
export function isImageLink(href: string, src: string): boolean {
  const url = parseUrl(href)
  if (!url || !isHttp(url)) return false
  if (url.href === parseUrl(src)?.href) return true
  return IMAGE_HOSTS.has(url.hostname) || IMAGE_EXTENSION_RE.test(url.pathname)
}

function isHttp(url: URL): boolean {
  return url.protocol === 'https:' || url.protocol === 'http:'
}

/**
 * 徽章或图标：不预览，单击照常。符合其一：
 * - 图片地址（图片代理看原地址 data-canonical-src）的主机或路径含 badge、shields；
 * - 显示的宽、高都不超过 32px（图标）；
 * - 显示的高度不超过 32px，原图不超过显示的两倍高（地址里没有 badge 的徽章，如 Travis CI、AppVeyor、Packagist，
 *   以及按钮条、分隔线：没怎么缩小，预览看不到更多）
 */
export function isBadge(img: HTMLImageElement): boolean {
  const url = parseUrl(img.getAttribute('data-canonical-src') || img.currentSrc || img.src)
  if (url && BADGE_RE.test(url.hostname + url.pathname)) return true
  const { width, height } = img.getBoundingClientRect()
  if (width <= 0 || height <= 0 || height > SMALL_MAX_SIZE) return false
  return width <= SMALL_MAX_SIZE || (img.naturalHeight > 0 && img.naturalHeight <= height * 2)
}

/** 图片所在的链接 */
function anchorOf(img: HTMLImageElement): HTMLAnchorElement | undefined {
  const anchor = img.closest('a[href]')
  return anchor instanceof HTMLAnchorElement ? anchor : undefined
}

/** 图片链到别处时链接的地址（http(s)）；没有链接、链到图片自身时为 undefined */
export function linkTarget(img: HTMLImageElement, src: string): string | undefined {
  const anchor = anchorOf(img)
  return anchor && !isImageLink(anchor.href, src) && isHttpLink(anchor) ? anchor.href : undefined
}

function isHttpLink(anchor: HTMLAnchorElement): boolean {
  const url = parseUrl(anchor.href)
  return url !== undefined && isHttp(url)
}

/**
 * 可预览的图片：在正文里，不是表情、头像、徽章、图标；有链接时是 http(s) 链接（链到图片自身或别处）。
 * 另有文件页显示的图片文件
 */
export function isPreviewable(img: HTMLImageElement): boolean {
  if (img.matches(EXCLUDED_SELECTOR)) return false
  if (!img.closest(CONTENT_SELECTOR)) return isFileImage(img)
  if (!imageSource(img) || isBadge(img)) return false
  const anchor = anchorOf(img)
  return !anchor || isHttpLink(anchor)
}

/**
 * 文件页（/所有者/存储库/blob/引用/路径）显示的图片文件本身：图片地址与页面同源，路径与页面相同（?raw=true），
 * 或把 /blob/ 换成 /raw/。文件页的外层只有带哈希的样式类名，按地址认
 */
export function isFileImage(img: HTMLImageElement): boolean {
  const page = img.ownerDocument.location
  const src = imageSource(img)
  const url = src ? parseUrl(src) : undefined
  if (!page || !url || url.origin !== page.origin) return false
  const segments = page.pathname.split('/')
  if (segments[3] !== 'blob' || segments.length < 6) return false
  return url.pathname === page.pathname || url.pathname === [...segments.slice(0, 3), 'raw', ...segments.slice(4)].join('/')
}

/** 普通的左键单击：不带修饰键，页面没有取消 */
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** 加载失败的图片（已完成但没有尺寸） */
function isBroken(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth === 0 && img.naturalHeight === 0
}

/** 页面上显示着的图片（隐藏的副本，如动图播放器替换掉的原图，不算） */
function isRendered(img: HTMLImageElement): boolean {
  return img.getClientRects().length > 0
}

/** 下载的文件名：地址的最后一段；没有（data: 地址）或像哈希（图片代理）时为 image；没有扩展名时按类型补上 */
export function downloadName(url: string, type = ''): string {
  const parsed = parseUrl(url)
  let name = ''
  if (parsed && (parsed.protocol === 'https:' || parsed.protocol === 'http:')) {
    const last = parsed.pathname.split('/').pop() ?? ''
    try {
      name = decodeURIComponent(last)
    } catch {
      name = last
    }
  }
  // Windows 保留字符与控制字符
  name = name.replace(/[\\/:*?"<>|\p{Cc}]+/gu, '_').trim()
  if (name === '' || /^[0-9a-f]{20,}$/i.test(name)) name = 'image'
  const mime = (type || /^data:([^;,]+)/i.exec(url)?.[1] || '').toLowerCase()
  const extension = MIME_EXTENSIONS[mime]
  return IMAGE_EXTENSION_RE.test(name) || !extension ? name : `${name}.${extension}`
}

/** 默认的取回：同站带 Cookie（私有存储库的 Raw 图片），跨站不带 */
async function defaultFetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'same-origin' })
  const blob = await response.blob()
  if (!response.ok || !blob.type.toLowerCase().startsWith('image/')) throw new Error(`不是图片：${url}`)
  return blob
}

export function createImagePreview(doc: Document, options: ImagePreviewOptions): ImagePreview {
  const fetchImage = options.fetchImage ?? defaultFetchImage

  function save(href: string, name: string): void {
    // 不放进页面：点击不经过页面脚本与本扩展的点击处理
    const anchor = doc.createElement('a')
    anchor.href = href
    anchor.download = name
    anchor.click()
  }

  async function download(url: string): Promise<void> {
    if (/^(?:data|blob):/i.test(url)) {
      save(url, downloadName(url))
      return
    }
    const blob = await fetchImage(url)
    const objectUrl = URL.createObjectURL(blob)
    save(objectUrl, downloadName(url, blob.type))
    setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_DELAY_MS)
  }

  let viewer: ImageViewer | undefined

  /** 页面上可预览的图片，按文档顺序；被点的不在其中时只有它一张 */
  function gallery(clicked: HTMLImageElement): { readonly images: ViewerImage[]; readonly index: number } {
    const all = [...doc.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR)].filter(
      img => img === clicked || (isPreviewable(img) && isRendered(img) && !isBroken(img))
    )
    const list = all.includes(clicked) ? all : [clicked]
    return {
      images: list.map(img => {
        const src = imageSource(img)!
        const link = linkTarget(img, src)
        return link ? { src, alt: img.alt, link } : { src, alt: img.alt }
      }),
      index: list.indexOf(clicked)
    }
  }

  return {
    onClick(event) {
      if (!options.active() || !isPlainClick(event)) return
      const img = event.composedPath().find((node): node is HTMLImageElement => node instanceof HTMLImageElement)
      if (!img || isBroken(img) || !isPreviewable(img)) return
      // 不再交给页面：GitHub 的自述文件（React）对链接的单击不看 defaultPrevented，照样站内跳转
      event.preventDefault()
      event.stopPropagation()
      const { images, index } = gallery(img)
      viewer ??= createImageViewer(doc, { label: options.label, open: options.open, download })
      viewer.show(images, index)
    },
    close() {
      viewer?.close()
    }
  }
}
