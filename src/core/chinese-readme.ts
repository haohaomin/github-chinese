import type { MessageKey } from '../i18n'
import { parseWebUrl } from '../shared/github'
import { chineseScript, type PageLocale } from '../shared/locale'
import { DOCUMENT_POSITION_FOLLOWING, SHOW_TEXT } from './dom'
import type { FetchLike } from './folder-files'
import { pageSite, repositoryName } from './page'

/**
 * 中文自述文件：开启后，存储库首页（文件标签页选中自述文件时）与目录页显示的自述文件有中文版时，换成中文版。
 * - 中文版按路径认：文件名带中文的语言标记（README.zh-CN.md、README_CN.md、README-zh_Hant.md 等），
 *   或是中文语言目录里不带标记的自述文件（docs/zh-CN/README.md）；有简体、繁体两种时按翻译语言选。
 * - 从自述文件里的链接与目录的文件列表里找。链接指向别的目录时，链接文字（含提示、图片的替代文字）要是语言名
 *   （简体中文、中文、Chinese、zh-CN 等）：单仓多包的自述文件链到各包的中文版时不换。
 * - 显示的自述文件本来就是中文时不换。
 * 中文版是 GitHub 渲染好的正文：向同站请求文件页的页面数据（JSON，带 Cookie，同在页面上浏览），不经第三方；
 * 本页面内（含软导航）最近取过的 MAX_CACHED 个不再取。原自述文件（React 管理）隐藏，不移除；中文版放在它之前，
 * 上方的提示可切回原文、再切回中文版，选了原文的存储库在本页面内保持原文。
 * 页面上新出现的自述文件在中文版取回之前先隐藏（最多 CLOAK_MS），不先显示原文再换
 */
export interface ChineseReadmeOptions {
  /** 是否换成中文版：总开关与「中文自述文件」都开启 */
  readonly active: () => boolean
  /** 翻译语言：有简体、繁体两种中文版时取与它相同的 */
  readonly locale: () => PageLocale
  /** 提示的文字（扩展界面语言） */
  readonly label: (key: MessageKey) => string
  /** 取回；不给时用全局 fetch */
  readonly fetch?: FetchLike
}

export interface ChineseReadme {
  /** 设置变化、软导航后按新状态处理 */
  refresh(): void
  /** 停止：还原自述文件，移除加的元素 */
  stop(): void
}

/** 自述文件所在的页面 */
export interface ReadmePage {
  /** 存储库（/所有者/存储库，小写）：记下选了原文的存储库；文件页地址的前缀 */
  readonly repo: string
  /** 页面所在的目录：存储库首页为根目录；目录页为 tree/ 之后去掉引用（按一段算）的各段 */
  readonly directory: readonly string[]
}

/** 中文版自述文件 */
export interface ChineseReadmeFile {
  /** 文件页地址，不带查询串与锚点 */
  readonly url: string
  /** 在存储库中的路径（引用之后的各段） */
  readonly path: readonly string[]
  readonly locale: PageLocale
}

/** 加的元素：提示（notice）、中文版正文（content） */
export const README_ATTRIBUTE = 'data-gcn-readme'
/** 原自述文件的状态：loading 为新出现的自述文件等中文版取回时（隐藏，留着位置，最多 CLOAK_MS），hidden 为显示中文版时 */
export const NATIVE_ATTRIBUTE = 'data-gcn-readme-native'
/** 新出现的自述文件在中文版取回之前最多隐藏多久：超时后先显示原文，取回后再换 */
export const CLOAK_MS = 2000
/** 本页面内缓存的中文版个数：超出时先丢最早取的 */
export const MAX_CACHED = 20
/** 判断正文是否已是中文时，最多看这么多字（不含代码） */
const SAMPLE_LENGTH = 2000
/** 汉字与拉丁字母合计不到这么多时不算中文：正文可能还在加载（只有开头的语言切换链接） */
const MIN_LETTERS = 40
/** 汉字占汉字与拉丁字母之和的比例超过它时，正文算中文 */
const CHINESE_RATIO = 0.1

/** 存储库首页、目录页的自述文件正文 */
const ARTICLE_SELECTOR = 'article.markdown-body[itemprop="text"]'
/** 存储库首页正文上方的标题区（含文件标签页）：按微数据认，aria-label 会被翻译 */
const OVERVIEW_HEADER_SELECTOR = '[itemtype="https://schema.org/abstract"]'
/** 选中的是自述文件标签页：按书本图标认，标签文字会被翻译 */
const README_TAB_SELECTOR = '[aria-current="page"] svg.octicon-book'
/** 目录页的自述文件区域 */
const DIRECTORY_README_SELECTOR = '#readme'
/** 文件列表里的文件、目录链接 */
const FILE_LINK_SELECTOR = '.react-directory-filename-cell a[href]'
const STYLE_ID = 'gcn-readme-style'

/** GitHub 渲染的标记语言的扩展名：其他文件（纯文本、图片等）取不到渲染好的正文 */
const MARKUP_EXTENSION_RE = /\.(?:md|markdown|mdown|mkdn|mdx|rst|adoc|asciidoc|org|textile|rdoc)$/i
/** 语言标记里表示中文的词（不分大小写）→ 语言子标签：简繁交给 chineseScript 判断（台湾、香港、澳门与 hant 为繁体） */
const CHINESE_WORDS: ReadonlyMap<string, string> = new Map([
  ['chinese', ''],
  ['cn', 'cn'],
  ['chs', 'hans'],
  ['sc', 'hans'],
  ['hans', 'hans'],
  ['tw', 'tw'],
  ['hk', 'hk'],
  ['mo', 'mo'],
  ['cht', 'hant'],
  ['tc', 'hant'],
  ['hant', 'hant']
])
/** 只作修饰的词：与表示中文的词一起出现才算（README.simplified.md 不是中文版） */
const MODIFIER_WORDS: ReadonlyMap<string, string> = new Map([
  ['simplified', 'hans'],
  ['traditional', 'hant']
])
/** 中文写的语言标记：中文、简体中文、繁體中文、简体、繁體、简中、繁中，可带「版」 */
const HAN_TAG_RE = /^(?:[简簡繁](?:[体體]|中)|(?:[简簡繁][体體])?中文)版?$/
/** 语言名：简体中文、繁體中文、中文、Chinese、zh、zh-CN 等，以及中国、台湾、香港的旗帜 */
const LANGUAGE_NAME_RE =
  /中文|[简簡繁][体體]|chinese|(?:^|[^a-z])zh(?:[-_](?:cn|tw|hk|hans|hant))?(?:$|[^a-z])|\u{1F1E8}\u{1F1F3}|\u{1F1F9}\u{1F1FC}|\u{1F1ED}\u{1F1F0}/iu

/** 提示与正文同宽（container-lg）、居中；颜色用 GitHub 的主题变量 */
const STYLE = `
[${README_ATTRIBUTE}='notice'] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  max-width: 1012px;
  margin: 0 auto 16px;
  color: var(--fgColor-muted, #59636e);
  font-size: 12px;
  line-height: 18px;
}
[${README_ATTRIBUTE}='notice'] :is(a, button) {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--fgColor-accent, #0969da);
  font: inherit;
  cursor: pointer;
}
[${README_ATTRIBUTE}='notice'] :is(a, button):hover {
  text-decoration: underline;
}
[${README_ATTRIBUTE}='notice'] button:focus-visible {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: 2px;
}
[${NATIVE_ATTRIBUTE}='loading'] {
  visibility: hidden !important;
}
[${NATIVE_ATTRIBUTE}='hidden'] {
  display: none !important;
}
`

/**
 * 页面上的自述文件与处理结果。正文元素、页面路径、正文内容（第一个子元素）、翻译语言任一变了就重新处理：
 * 软导航后 React 可能沿用同一个正文元素、换掉内容；翻译语言变了简繁可能换一个
 */
interface State {
  /** 原自述文件 */
  readonly native: Element
  readonly first: Element | null
  readonly path: string
  readonly locale: PageLocale
  readonly repo: string
  /** 中文版；没有时为 undefined，只记下结果、不再找 */
  readonly file: ChineseReadmeFile | undefined
  /** 中文版正文：取回中为 undefined，取不到（或原文其实已是中文）为 null */
  html: string | null | undefined
  /** 取回之前原文先隐藏 */
  cloaked: boolean
  notice: HTMLElement | undefined
  /** 提示渲染时的内容（状态与文字）：没变时不重建，不打断键盘焦点 */
  noticeKey: string
  content: HTMLElement | undefined
}

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 存储库首页（/所有者/存储库）、目录页（/所有者/存储库/tree/引用[/路径]）；其他页面为 undefined */
export function readmePage(url: Pick<URL, 'hostname' | 'pathname'>): ReadmePage | undefined {
  const site = pageSite(url)
  if (site.kind !== 'github' || repositoryName(site.pathname) === undefined) return undefined
  const [owner = '', repo = '', section, ref, ...path] = site.pathname.split('/').filter(Boolean)
  if (section !== undefined && (section !== 'tree' || ref === undefined)) return undefined
  return { repo: `/${owner}/${repo}`.toLowerCase(), directory: path.map(decode) }
}

/**
 * 语言标记（文件名中 README 之后的部分、目录名）表示的中文：zh 开头的按语言标签（zh、zh-CN、zh_Hant 等）；
 * 否则由表示中文的词组成（CN、TW、chs、Chinese、chinese-traditional 等），或是中文写的「中文」「繁體中文」等。
 * 不是中文为 undefined
 */
export function tagLocale(tag: string): PageLocale | undefined {
  const words = tag
    .toLowerCase()
    .split(/[\s._-]+/)
    .filter(Boolean)
  if (words[0] === 'zh') return chineseScript(words.join('-'))
  const subtags = words.map(word => CHINESE_WORDS.get(word) ?? MODIFIER_WORDS.get(word))
  if (words.some(word => CHINESE_WORDS.has(word)) && !subtags.includes(undefined))
    return chineseScript(['zh', ...subtags].filter(Boolean).join('-'))
  const han = tag.trim()
  if (HAN_TAG_RE.test(han)) return han.includes('繁') ? 'zh-TW' : 'zh-CN'
  return undefined
}

/**
 * 自述文件的语言标记：标记语言文件的文件名去掉扩展名后以 README 开头时，为其后的部分（去掉开头的分隔符），只是 README 时为空串；
 * 不是标记语言的自述文件为 undefined
 */
function readmeTag(name: string): string | undefined {
  const base = name.replace(MARKUP_EXTENSION_RE, '')
  return base === name ? undefined : /^readme(.*)$/i.exec(base)?.[1]?.replace(/^[\s._-]+/, '')
}

/**
 * 中文版自述文件的简繁：文件名带中文的语言标记（README.zh-CN.md、README_CN.md 等），
 * 或是中文语言目录（docs/zh-CN/ 等）里不带标记的自述文件。不是中文版为 undefined
 */
export function readmeLocale(path: readonly string[]): PageLocale | undefined {
  const tag = readmeTag(path.at(-1) ?? '')
  if (tag === undefined) return undefined
  if (tag !== '') return tagLocale(tag)
  const directory = path.at(-2)
  return directory === undefined ? undefined : tagLocale(directory)
}

/** 文件页的页面数据中渲染好的正文：payload.codeViewBlobRoute.richText；没有（不是标记语言文件）或被截断时为 undefined */
export function parseRichText(json: unknown): string | undefined {
  const route = isRecord(json) && isRecord(json.payload) ? json.payload.codeViewBlobRoute : undefined
  if (!isRecord(route) || typeof route.richText !== 'string' || route.richTextTruncated === true) return undefined
  return route.richText
}

/**
 * 正文已是中文：不看代码，前 SAMPLE_LENGTH 个字里汉字与拉丁字母合计不少于 MIN_LETTERS，汉字占其中的比例超过 CHINESE_RATIO，
 * 且假名不多（不是日文）
 */
export function isChineseText(root: Element): boolean {
  const walker = root.ownerDocument.createTreeWalker(root, SHOW_TEXT)
  let length = 0
  let han = 0
  let kana = 0
  let latin = 0
  for (let node = walker.nextNode(); node !== null && length < SAMPLE_LENGTH; node = walker.nextNode()) {
    if (node.parentElement?.closest('pre, code')) continue
    const text = (node.textContent ?? '').slice(0, SAMPLE_LENGTH - length)
    length += text.length
    han += text.match(/\p{Script=Han}/gu)?.length ?? 0
    kana += text.match(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu)?.length ?? 0
    latin += text.match(/[a-z]/gi)?.length ?? 0
  }
  return han + latin >= MIN_LETTERS && han > kana * 4 && han > (han + latin) * CHINESE_RATIO
}

/** 自述文件的正文：存储库首页标题区里选中的是自述文件标签页，或在目录页的自述文件区域里 */
export function isReadmeArticle(article: Element): boolean {
  const header = article.parentElement?.previousElementSibling
  if (header?.matches(OVERVIEW_HEADER_SELECTOR)) return header.querySelector(README_TAB_SELECTOR) !== null
  return article.closest(DIRECTORY_README_SELECTOR) !== null
}

/** 链接指向的本存储库文件页（/所有者/存储库/blob/引用/路径，引用按一段算）：不带查询串与锚点的地址、在存储库中的路径 */
function repoFile(anchor: Element, page: ReadmePage): Omit<ChineseReadmeFile, 'locale'> | undefined {
  const url = anchor instanceof HTMLAnchorElement ? parseWebUrl(anchor.href) : undefined
  const prefix = `${page.repo}/blob/`
  if (!url || url.origin !== anchor.ownerDocument.location.origin || !url.pathname.toLowerCase().startsWith(prefix)) return undefined
  const path = url.pathname.slice(prefix.length).split('/').filter(Boolean).slice(1).map(decode)
  // 编码的斜杠（%2F）解出的段不是真的路径
  if (path.length === 0 || path.some(segment => segment.includes('/'))) return undefined
  url.search = ''
  url.hash = ''
  return { url: url.href, path }
}

/** 链接文字、提示或图片的替代文字是语言名：语言切换的链接 */
function isLanguageLink(anchor: Element): boolean {
  const alts = [...anchor.querySelectorAll('img')].map(img => img.getAttribute('alt') ?? '')
  return LANGUAGE_NAME_RE.test([anchor.textContent ?? '', anchor.getAttribute('title') ?? '', ...alts].join(' '))
}

/** path 是 directory 下的文件 */
function inDirectory(path: readonly string[], directory: readonly string[]): boolean {
  return path.length === directory.length + 1 && directory.every((segment, index) => path[index] === segment)
}

/**
 * 显示的自述文件的中文版：自述文件里的链接（同一目录的，或链接文字是语言名的）与文件列表里的。
 * 有多个时依次取简繁与翻译语言相同的、同一目录的（子目录的自述文件可能链到根目录的中文版）、先出现的（链接在前）。
 * 没有时为 undefined
 */
export function findChineseReadme(doc: Document, article: Element, page: ReadmePage, locale: PageLocale): ChineseReadmeFile | undefined {
  let best: { readonly file: ChineseReadmeFile; readonly rank: number } | undefined
  for (const anchor of [...article.querySelectorAll('a[href]'), ...doc.querySelectorAll(FILE_LINK_SELECTOR)]) {
    const file = repoFile(anchor, page)
    const fileLocale = file && readmeLocale(file.path)
    if (!file || !fileLocale) continue
    const sibling = inDirectory(file.path, page.directory)
    // 同一目录里不带标记的自述文件：就是显示的这个
    if (sibling && readmeTag(file.path.at(-1) ?? '') === '') continue
    if (!sibling && !isLanguageLink(anchor)) continue
    const rank = (fileLocale === locale ? 0 : 2) + (sibling ? 0 : 1)
    if (!best || rank < best.rank) best = { file: { ...file, locale: fileLocale }, rank }
  }
  return best?.file
}

/** 中文版正文：类名同原文；节点收进当前文档，去掉脚本（DOMParser 解析的脚本不执行，再保险一次） */
function createContent(native: Element, html: string): HTMLElement {
  const doc = native.ownerDocument
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const source = parsed.querySelector('article.markdown-body') ?? parsed.body
  for (const script of source.querySelectorAll('script')) script.remove()
  const content = doc.createElement('article')
  content.className = native.className
  content.setAttribute(README_ATTRIBUTE, 'content')
  content.append(...[...source.childNodes].map(node => doc.adoptNode(node)))
  return content
}

export function createChineseReadme(doc: Document, options: ChineseReadmeOptions): ChineseReadme {
  const fetcher = options.fetch ?? ((url: string, init: RequestInit) => fetch(url, init))
  /** 文件页地址 → 渲染好的正文；取不到的为 undefined，在缓存里时不再取 */
  const cache = new Map<string, Promise<string | undefined>>()
  /** 选了原文的存储库 */
  const originals = new Set<string>()
  let state: State | undefined
  /** 可先隐藏新出现的自述文件：开启后第一次扫描时已在页面上的（可能已显示）不隐藏 */
  let cloakable = false
  let scheduled = false
  let observing = false
  let stopped = false

  function ensureStyle(): void {
    if (doc.getElementById(STYLE_ID)) return
    const style = doc.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE
    ;(doc.head ?? doc.documentElement).append(style)
  }

  function load(url: string): Promise<string | undefined> {
    const cached = cache.get(url)
    if (cached) return cached
    // 只用跟随跳转后仍在本站的应答：插入页面的只能是 GitHub 自己渲染的正文
    const task = fetcher(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(async response =>
        response.ok && parseWebUrl(response.url)?.origin === doc.location.origin ? parseRichText(await response.json()) : undefined
      )
      .catch(() => undefined)
    cache.set(url, task)
    const oldest = cache.keys().next().value
    if (cache.size > MAX_CACHED && oldest !== undefined) cache.delete(oldest)
    return task
  }

  function setNative(current: State, value?: 'loading' | 'hidden'): void {
    if (current.native.getAttribute(NATIVE_ATTRIBUTE) === (value ?? null)) return
    if (value) current.native.setAttribute(NATIVE_ATTRIBUTE, value)
    else current.native.removeAttribute(NATIVE_ATTRIBUTE)
  }

  /**
   * 加的元素放在原自述文件之前，依次为提示、中文版正文；页面重新渲染后不在原处时放回。
   * 只看先后、不要求紧挨：同时装着两份扩展时，两边都要紧挨原文就会来回挪动，观察器回调接连不断，页面卡死。
   * 从原文往前逐个看，只挪不在原处的：挪动会让其中有焦点的按钮失去焦点
   */
  function place(current: State): void {
    const { native } = current
    let next: Element = native
    for (const node of [current.content, current.notice]) {
      if (!node) continue
      const placed = node.parentNode === native.parentNode && (node.compareDocumentPosition(next) & DOCUMENT_POSITION_FOLLOWING) !== 0
      if (!placed) next.before(node)
      next = node
    }
  }

  /** 选原文或中文版：记下选了原文的存储库，本页面内（软导航后）保持 */
  function choose(current: State, original: boolean): void {
    if (original) originals.add(current.repo)
    else originals.delete(current.repo)
    render(current)
  }

  /** 提示：显示中文版时为「已切换到中文版 <路径> · 显示原文」，选了原文时为「显示中文版」；文字没变时不重建 */
  function renderNotice(current: State, file: ChineseReadmeFile, view: 'chinese' | 'original'): void {
    const switched = options.label('readmeSwitched')
    const action = options.label(view === 'chinese' ? 'showOriginal' : 'showChinese')
    const key = [view, switched, action].join('\n')
    if (current.notice && current.noticeKey === key) return
    ensureStyle()
    const notice = current.notice ?? doc.createElement('div')
    notice.setAttribute(README_ATTRIBUTE, 'notice')
    // 文字已是扩展界面语言：汉化引擎、浏览器翻译都不处理
    notice.setAttribute('translate', 'no')
    const button = doc.createElement('button')
    button.type = 'button'
    button.textContent = action
    button.addEventListener('click', () => choose(current, view === 'chinese'))
    if (view === 'chinese') {
      const link = doc.createElement('a')
      link.href = file.url
      link.textContent = file.path.join('/')
      const separator = doc.createElement('span')
      separator.setAttribute('aria-hidden', 'true')
      separator.textContent = '·'
      notice.replaceChildren(switched, link, separator, button)
    } else {
      notice.replaceChildren(button)
    }
    current.notice = notice
    current.noticeKey = key
  }

  /**
   * 按处理结果更新页面：取到中文版、没选原文时隐藏原文、放上中文版；取回之前按需隐藏原文。
   * 取不到时不提示；取回中（从原文切回中文版、还没取回）提示不变
   */
  function render(current: State): void {
    const { file } = current
    if (!file) return
    // 切换后按钮换了：焦点原在提示里时交给新按钮，键盘操作接着用
    const focused = current.notice?.contains(doc.activeElement) ?? false
    const original = originals.has(current.repo)
    const html = original ? undefined : current.html
    if (typeof html === 'string') {
      current.content ??= createContent(current.native, html)
      setNative(current, 'hidden')
    } else {
      current.content?.remove()
      current.content = undefined
      setNative(current, current.cloaked ? 'loading' : undefined)
    }
    if (current.html === null) {
      current.notice?.remove()
      current.notice = undefined
    } else if (original || typeof html === 'string') {
      renderNotice(current, file, original ? 'original' : 'chinese')
    }
    place(current)
    if (focused && !current.notice?.contains(doc.activeElement)) current.notice?.querySelector('button')?.focus()
  }

  /** 还原当前的自述文件，去掉加的元素 */
  function clear(): void {
    if (!state) return
    state.notice?.remove()
    state.content?.remove()
    if (state.file) setNative(state)
    state = undefined
  }

  /** 页面上显示着的自述文件正文 */
  function findReadme(): { readonly native: Element; readonly page: ReadmePage } | undefined {
    const page = readmePage(doc.location)
    if (!page) return undefined
    for (const article of doc.querySelectorAll(ARTICLE_SELECTOR)) {
      if (isReadmeArticle(article)) return { native: article, page }
    }
    return undefined
  }

  /** 处理新的自述文件：找中文版，有就取回；没有时记下结果，不再随页面变动反复找 */
  function start(native: Element, page: ReadmePage): void {
    const locale = options.locale()
    const file = isChineseText(native) ? undefined : findChineseReadme(doc, native, page, locale)
    // 页面还在加载：正文可能不完整，没找到时下次变动再找
    if (!file && doc.readyState === 'loading') return
    const current: State = {
      native,
      first: native.firstElementChild,
      path: doc.location.pathname,
      locale,
      repo: page.repo,
      file,
      html: undefined,
      cloaked: cloakable && !originals.has(page.repo),
      notice: undefined,
      noticeKey: '',
      content: undefined
    }
    state = current
    if (!file) return
    // 页面上没有记录的加的元素、原文的标记（Firefox 更新扩展时旧实例来不及还原就被销毁）：放上之前去掉。
    // 只在这里去一次，不随每次扫描：同时装着两份扩展时，两边都去掉对方的就会来回增删
    for (const element of doc.querySelectorAll(`[${README_ATTRIBUTE}]`)) element.remove()
    for (const element of doc.querySelectorAll(`[${NATIVE_ATTRIBUTE}]`)) element.removeAttribute(NATIVE_ATTRIBUTE)
    if (current.cloaked) {
      setTimeout(() => {
        if (state !== current || !current.cloaked) return
        current.cloaked = false
        render(current)
      }, CLOAK_MS)
    }
    void load(file.url).then(html => {
      if (state !== current) return
      current.html = html === undefined || isChineseText(native) ? null : html
      current.cloaked = false
      render(current)
    })
    render(current)
  }

  /** 处理结果还对应这个自述文件：正文元素、内容、页面路径、翻译语言都没变 */
  function matches(current: State, native: Element): boolean {
    return (
      current.native === native &&
      current.first === native.firstElementChild &&
      current.path === doc.location.pathname &&
      current.locale === options.locale()
    )
  }

  function scan(): void {
    scheduled = false
    const active = !stopped && options.active()
    setObserving(active)
    const found = active ? findReadme() : undefined
    if (found && state && matches(state, found.native)) render(state)
    else {
      clear()
      if (found) start(found.native, found.page)
    }
    cloakable = active
  }

  /** 同一轮 DOM 变动只扫描一次 */
  function schedule(): void {
    if (scheduled || stopped) return
    scheduled = true
    queueMicrotask(scan)
  }

  const observer = new MutationObserver(schedule)

  function setObserving(on: boolean): void {
    if (on === observing) return
    observing = on
    if (on) observer.observe(doc.documentElement, { childList: true, subtree: true })
    else observer.disconnect()
  }

  scan()

  return {
    refresh() {
      if (!stopped) scan()
    },
    stop() {
      stopped = true
      setObserving(false)
      clear()
      // 页面上还有另一份扩展加的元素时留着样式
      if (!doc.querySelector(`[${README_ATTRIBUTE}], [${NATIVE_ATTRIBUTE}]`)) doc.getElementById(STYLE_ID)?.remove()
    }
  }
}
