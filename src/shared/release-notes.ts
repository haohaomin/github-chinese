import { REPOSITORY_URL } from './extension'
import { isNewerVersion, releaseVersion } from './update-check'

/**
 * 发行说明：手动检查到新版本时，在对话框里列出当前版本之后到最新版本的各版说明（见 components/UpdateDialog）。
 * 先取 GitHub REST API 的发行版列表（Markdown 原文），失败（如未登录的限额用尽）时改取发行版的 Atom 订阅（GitHub 渲染的 HTML，最近 10 个）。
 * 两者都转成只含标题、段落、列表、引用、代码与行内强调、链接的结构，由组件逐个创建元素显示，不插入 HTML
 */

/** 行内内容 */
export type NoteInline =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'strong'; readonly children: readonly NoteInline[] }
  | { readonly type: 'em'; readonly children: readonly NoteInline[] }
  | { readonly type: 'code'; readonly text: string }
  | { readonly type: 'link'; readonly href: string; readonly children: readonly NoteInline[] }
  | { readonly type: 'break' }

/** 块 */
export type NoteBlock =
  | { readonly type: 'heading'; readonly level: number; readonly children: readonly NoteInline[] }
  | { readonly type: 'paragraph'; readonly children: readonly NoteInline[] }
  | { readonly type: 'list'; readonly ordered: boolean; readonly items: readonly (readonly NoteBlock[])[] }
  | { readonly type: 'quote'; readonly children: readonly NoteBlock[] }
  | { readonly type: 'code'; readonly text: string }

/** 一个版本的说明 */
export interface ReleaseNote {
  readonly version: string
  readonly blocks: readonly NoteBlock[]
}

/** 发行版列表（一页最多 100 个，足够列出全部版本） */
export const RELEASES_API_URL = `${REPOSITORY_URL.replace('https://github.com/', 'https://api.github.com/repos/')}/releases?per_page=100`
/** 发行版的 Atom 订阅 */
export const RELEASES_FEED_URL = `${REPOSITORY_URL}/releases.atom`
/** 单次请求的时限 */
export const RELEASE_NOTES_TIMEOUT_MS = 10_000

const LIST_ITEM_RE = /^( *)([-*+]|\d{1,9}[.)])(?: +(.*))?$/
const HEADING_RE = /^ {0,3}(#{1,6})(?: +(.*?))?(?: +#+)? *$/
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/
const QUOTE_RE = /^ {0,3}> ?(.*)$/
const RULE_RE = /^ {0,3}([-*_])(?: *\1){2,} *$/
/** 反斜杠转义的字符 */
const ESCAPABLE = /[\\`*_{}[\]()#+\-.!<>~|]/

/** 只收 http、https 的链接（相对地址按 github.com 解析）；其他为 undefined */
export function safeUrl(href: string): string | undefined {
  try {
    const url = new URL(href.trim(), 'https://github.com/')
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  } catch {
    return undefined
  }
}

/** 行首的空格数（制表符按 4 个） */
function indentOf(line: string): number {
  let width = 0
  for (const char of line) {
    if (char === ' ') width += 1
    else if (char === '\t') width += 4
    else break
  }
  return width
}

/** 去掉至多 count 个行首空格 */
function dedent(line: string, count: number): string {
  let index = 0
  while (index < count && line[index] === ' ') index += 1
  return line.slice(index)
}

/** [文字](地址)：从 start（[ 的位置）起；不是链接时为 undefined */
function matchLink(text: string, start: number): { readonly label: string; readonly href: string; readonly end: number } | undefined {
  let depth = 0
  let close = -1
  for (let index = start; index < text.length; index++) {
    const char = text[index]
    if (char === '\\') index += 1
    else if (char === '[') depth += 1
    else if (char === ']') {
      depth -= 1
      if (depth === 0) {
        close = index
        break
      }
    }
  }
  if (close === -1 || text[close + 1] !== '(') return undefined
  // 地址里的括号成对（同 GitHub）
  let end = -1
  let parens = 1
  for (let index = close + 2; index < text.length; index++) {
    const char = text[index]
    if (char === '\\') index += 1
    else if (char === '(') parens += 1
    else if (char === ')') {
      parens -= 1
      if (parens === 0) {
        end = index
        break
      }
    }
  }
  if (end === -1) return undefined
  // 地址后可带标题（"…"），只取地址
  const target = text.slice(close + 2, end).trim()
  const href = /^<([^>]*)>/.exec(target)?.[1] ?? target.split(/\s+/)[0] ?? ''
  return { label: text.slice(start + 1, close), href, end: end + 1 }
}

/** 行内 Markdown：转义、`代码`、**粗体**、__粗体__、*斜体*、[链接](地址)、换行 */
export function parseInline(text: string): NoteInline[] {
  const nodes: NoteInline[] = []
  let buffer = ''
  const flush = (): void => {
    if (buffer !== '') nodes.push({ type: 'text', text: buffer })
    buffer = ''
  }
  let index = 0
  while (index < text.length) {
    const char = text[index]!
    const next = text[index + 1]
    if (char === '\\' && next !== undefined && ESCAPABLE.test(next)) {
      buffer += next
      index += 2
      continue
    }
    if (char === '\n') {
      flush()
      nodes.push({ type: 'break' })
      index += 1
      continue
    }
    if (char === '`') {
      let run = 1
      while (text[index + run] === '`') run += 1
      const fence = '`'.repeat(run)
      const end = text.indexOf(fence, index + run)
      if (end !== -1) {
        flush()
        nodes.push({ type: 'code', text: text.slice(index + run, end).replace(/^ (.+) $/, '$1') })
        index = end + run
        continue
      }
      buffer += fence
      index += run
      continue
    }
    if ((char === '*' || char === '_') && next === char) {
      const end = text.indexOf(char + char, index + 2)
      if (end > index + 2) {
        flush()
        nodes.push({ type: 'strong', children: parseInline(text.slice(index + 2, end)) })
        index = end + 2
        continue
      }
    }
    if (char === '*' && next !== undefined && next !== ' ' && next !== '*') {
      const end = text.indexOf('*', index + 1)
      if (end > index + 1 && text[end - 1] !== ' ') {
        flush()
        nodes.push({ type: 'em', children: parseInline(text.slice(index + 1, end)) })
        index = end + 1
        continue
      }
    }
    if (char === '[') {
      const link = matchLink(text, index)
      if (link) {
        flush()
        const href = safeUrl(link.href)
        const children = parseInline(link.label)
        if (href) nodes.push({ type: 'link', href, children })
        else nodes.push(...children)
        index = link.end
        continue
      }
    }
    buffer += char
    index += 1
  }
  flush()
  return nodes
}

/** 段落以外的块的开头：标题、列表项、引用、代码块、分隔线 */
function isBlockStart(line: string): boolean {
  return HEADING_RE.test(line) || LIST_ITEM_RE.test(line) || QUOTE_RE.test(line) || FENCE_RE.test(line) || RULE_RE.test(line)
}

/** 列表：从 start 行起，同一缩进的各项；项里缩进更深的行（下级列表、续行）为该项的内容 */
function parseList(lines: readonly string[], start: number): { readonly block: NoteBlock; readonly next: number } {
  const first = LIST_ITEM_RE.exec(lines[start]!)!
  const base = first[1]!.length
  const ordered = /\d/.test(first[2]!)
  const items: NoteBlock[][] = []
  let index = start
  while (index < lines.length) {
    const match = LIST_ITEM_RE.exec(lines[index]!)
    if (!match || match[1]!.length !== base || /\d/.test(match[2]!) !== ordered) break
    // 内容的起始列：其后各行去掉这么多缩进
    const offset = base + match[2]!.length + 1
    const body: string[] = [match[3] ?? '']
    index += 1
    while (index < lines.length) {
      const line = lines[index]!
      if (line.trim() === '') {
        // 空行：下一个非空行仍缩进在项内时算项的内容
        let ahead = index + 1
        while (ahead < lines.length && lines[ahead]!.trim() === '') ahead += 1
        if (ahead < lines.length && indentOf(lines[ahead]!) > base) {
          body.push('')
          index += 1
          continue
        }
        break
      }
      if (indentOf(line) <= base) break
      body.push(dedent(line, offset))
      index += 1
    }
    items.push(parseMarkdown(body.join('\n')))
    // 项之间的空行
    let ahead = index
    while (ahead < lines.length && lines[ahead]!.trim() === '') ahead += 1
    const following = ahead < lines.length ? LIST_ITEM_RE.exec(lines[ahead]!) : null
    if (ahead !== index && following && following[1]!.length === base) index = ahead
  }
  return { block: { type: 'list', ordered, items }, next: index }
}

/** Markdown（GitHub 的发行说明所用的部分）→ 块 */
export function parseMarkdown(source: string): NoteBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: NoteBlock[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]!
    if (line.trim() === '' || RULE_RE.test(line)) {
      index += 1
      continue
    }
    const fence = FENCE_RE.exec(line)
    if (fence) {
      const marker = fence[1]!
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index]!.trimStart().startsWith(marker)) {
        code.push(lines[index]!)
        index += 1
      }
      blocks.push({ type: 'code', text: code.join('\n') })
      index += 1
      continue
    }
    const heading = HEADING_RE.exec(line)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1]!.length, children: parseInline(heading[2] ?? '') })
      index += 1
      continue
    }
    if (LIST_ITEM_RE.test(line)) {
      const { block, next } = parseList(lines, index)
      blocks.push(block)
      index = next
      continue
    }
    if (QUOTE_RE.test(line)) {
      const quoted: string[] = []
      while (index < lines.length) {
        const match = QUOTE_RE.exec(lines[index]!)
        if (!match) break
        quoted.push(match[1]!)
        index += 1
      }
      blocks.push({ type: 'quote', children: parseMarkdown(quoted.join('\n')) })
      continue
    }
    const paragraph = [line.trim()]
    index += 1
    while (index < lines.length && lines[index]!.trim() !== '' && !isBlockStart(lines[index]!)) {
      paragraph.push(lines[index]!.trim())
      index += 1
    }
    blocks.push({ type: 'paragraph', children: parseInline(paragraph.join('\n')) })
  }
  return blocks
}

/** HTML 的行内内容：空白合并，未知元素取其中的内容 */
function htmlInline(children: Iterable<Node>): NoteInline[] {
  const nodes: NoteInline[] = []
  for (const child of children) {
    if (child.nodeType === 3) {
      const text = (child.textContent ?? '').replace(/\s+/g, ' ')
      if (text !== '') nodes.push({ type: 'text', text })
      continue
    }
    if (child.nodeType !== 1) continue
    const element = child as Element
    const tag = element.localName
    if (tag === 'br') nodes.push({ type: 'break' })
    else if (tag === 'code') nodes.push({ type: 'code', text: element.textContent ?? '' })
    else if (tag === 'strong' || tag === 'b') nodes.push({ type: 'strong', children: htmlInline(element.childNodes) })
    else if (tag === 'em' || tag === 'i') nodes.push({ type: 'em', children: htmlInline(element.childNodes) })
    else if (tag === 'a') {
      const children = htmlInline(element.childNodes)
      const href = safeUrl(element.getAttribute('href') ?? '')
      // 标题旁的锚点链接只有图标
      if (children.length === 0) continue
      if (href) nodes.push({ type: 'link', href, children })
      else nodes.push(...children)
    } else if (tag !== 'img' && tag !== 'svg' && tag !== 'script' && tag !== 'style') nodes.push(...htmlInline(element.childNodes))
  }
  return nodes
}

/** 去掉首尾的空白文字 */
function trimInline(nodes: readonly NoteInline[]): NoteInline[] {
  const result = [...nodes]
  const first = result[0]
  if (first?.type === 'text') result[0] = { type: 'text', text: first.text.trimStart() }
  const last = result.at(-1)
  if (last?.type === 'text') result[result.length - 1] = { type: 'text', text: last.text.trimEnd() }
  return result.filter(node => node.type !== 'text' || node.text !== '')
}

const BLOCK_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'blockquote',
  'pre',
  'div',
  'section',
  'article',
  'table',
  'details',
  'hr'
])

/** HTML（GitHub 渲染的发行说明）→ 块；块级元素之间的行内内容作段落 */
export function htmlToBlocks(parent: Node): NoteBlock[] {
  const blocks: NoteBlock[] = []
  let pending: Node[] = []
  const flushInline = (): void => {
    const children = trimInline(htmlInline(pending))
    if (children.length > 0) blocks.push({ type: 'paragraph', children })
    pending = []
  }
  for (const child of parent.childNodes) {
    const tag = child.nodeType === 1 ? (child as Element).localName : ''
    if (!BLOCK_TAGS.has(tag)) {
      pending.push(child)
      continue
    }
    flushInline()
    const element = child as Element
    const heading = /^h([1-6])$/.exec(tag)
    if (heading) {
      const children = trimInline(htmlInline(element.childNodes))
      if (children.length > 0) blocks.push({ type: 'heading', level: Number(heading[1]), children })
    } else if (tag === 'p') {
      const children = trimInline(htmlInline(element.childNodes))
      if (children.length > 0) blocks.push({ type: 'paragraph', children })
    } else if (tag === 'ul' || tag === 'ol') {
      const items = [...element.children].filter(item => item.localName === 'li').map(item => htmlToBlocks(item))
      blocks.push({ type: 'list', ordered: tag === 'ol', items })
    } else if (tag === 'blockquote') {
      blocks.push({ type: 'quote', children: htmlToBlocks(element) })
    } else if (tag === 'pre') {
      blocks.push({ type: 'code', text: (element.textContent ?? '').replace(/\n$/, '') })
    } else if (tag !== 'hr') {
      blocks.push(...htmlToBlocks(element))
    }
  }
  flushInline()
  return blocks
}

/** 去掉开头的一级标题（「GitHub 中文化 x.y.z 版本更新说明」）：对话框里已按版本号分开 */
function withoutTitle(blocks: readonly NoteBlock[]): NoteBlock[] {
  const [first, ...rest] = blocks
  return first?.type === 'heading' && first.level === 1 ? rest : [...blocks]
}

/** 介于 current（不含）与 latest（含）之间的版本，新的在前 */
export function notesBetween(notes: readonly ReleaseNote[], current: string, latest: string): ReleaseNote[] {
  const byVersion = new Map<string, ReleaseNote>()
  for (const note of notes) {
    if (isNewerVersion(note.version, current) && !isNewerVersion(note.version, latest) && !byVersion.has(note.version)) {
      byVersion.set(note.version, note)
    }
  }
  return [...byVersion.values()].sort((a, b) => (isNewerVersion(a.version, b.version) ? -1 : isNewerVersion(b.version, a.version) ? 1 : 0))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** API 的发行版列表 → 说明；不是正式发行版（草稿、预发行版）的跳过 */
export function notesFromApi(value: unknown): ReleaseNote[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.flatMap((release): ReleaseNote[] => {
    if (!isRecord(release) || release.draft === true || release.prerelease === true) return []
    const version = typeof release.html_url === 'string' ? releaseVersion(release.html_url) : undefined
    if (version === undefined) return []
    const body = typeof release.body === 'string' ? release.body : ''
    return [{ version, blocks: withoutTitle(parseMarkdown(body)) }]
  })
}

/** Atom 订阅 → 说明；parse 为 DOMParser 的解析 */
export function notesFromFeed(xml: string, parse: (text: string, type: DOMParserSupportedType) => Document): ReleaseNote[] | undefined {
  const feed = parse(xml, 'application/xml')
  if (feed.getElementsByTagName('parsererror').length > 0) return undefined
  return [...feed.getElementsByTagName('entry')].flatMap((entry): ReleaseNote[] => {
    const link = [...entry.getElementsByTagName('link')].find(item => (item.getAttribute('rel') ?? 'alternate') === 'alternate')
    const version = releaseVersion(link?.getAttribute('href') ?? '')
    if (version === undefined) return []
    const html = entry.getElementsByTagName('content')[0]?.textContent ?? ''
    return [{ version, blocks: withoutTitle(htmlToBlocks(parse(html, 'text/html').body)) }]
  })
}

export interface ReleaseNotesDeps {
  fetch(url: string, init: RequestInit): Promise<Pick<Response, 'ok' | 'json' | 'text'>>
  /** 同 DOMParser.parseFromString */
  parse(text: string, type: DOMParserSupportedType): Document
}

export const RELEASE_NOTES_DEPS: ReleaseNotesDeps = {
  fetch: (url, init) => fetch(url, init),
  parse: (text, type) => new DOMParser().parseFromString(text, type)
}

/** GET 请求：不带 Cookie 与来源页；失败、超时为 undefined */
async function request<T>(
  deps: ReleaseNotesDeps,
  url: string,
  headers: HeadersInit,
  read: (response: Pick<Response, 'json' | 'text'>) => Promise<T>
): Promise<T | undefined> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), RELEASE_NOTES_TIMEOUT_MS)
  try {
    const response = await deps.fetch(url, { headers, credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal })
    return response.ok ? await read(response) : undefined
  } catch {
    return undefined
  } finally {
    clearTimeout(timer)
  }
}

/** current 之后到 latest 的各版说明，新的在前；都取不到时为 undefined */
export async function fetchReleaseNotes(
  current: string,
  latest: string,
  deps: ReleaseNotesDeps = RELEASE_NOTES_DEPS
): Promise<ReleaseNote[] | undefined> {
  const fromApi = notesFromApi(
    await request(deps, RELEASES_API_URL, { Accept: 'application/vnd.github+json' }, response => response.json())
  )
  if (fromApi) return notesBetween(fromApi, current, latest)
  const xml = await request(deps, RELEASES_FEED_URL, { Accept: 'application/atom+xml' }, response => response.text())
  const fromFeed = xml === undefined ? undefined : notesFromFeed(xml, deps.parse)
  return fromFeed ? notesBetween(fromFeed, current, latest) : undefined
}
