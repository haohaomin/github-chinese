/** DOM 常量与小工具：不依赖全局 Node / NodeFilter，便于在内容脚本与测试窗口间通用 */

export const ELEMENT_NODE = 1
export const TEXT_NODE = 3
export const COMMENT_NODE = 8

export const SHOW_ELEMENT = 0x1
export const SHOW_TEXT = 0x4
export const FILTER_ACCEPT = 1
export const FILTER_REJECT = 2
export const DOCUMENT_POSITION_FOLLOWING = 0x4

/** GitHub 时间元素：用 Intl 在 shadow DOM 渲染，light DOM 为后备文本 */
export const TIME_TAGS: ReadonlySet<string> = new Set(['relative-time', 'time-ago', 'local-time', 'time-until'])

export function isTextNode(node: Node | null | undefined): node is Text {
  return node?.nodeType === TEXT_NODE
}

/** 文本或注释：相邻文本组只由这两类节点组成 */
export function isRunNode(node: Node | null | undefined): node is CharacterData {
  return node?.nodeType === TEXT_NODE || node?.nodeType === COMMENT_NODE
}

/**
 * 包含 node 的相邻文本组：同一父节点下连续的文本节点，中间只隔注释（React SSR 的 <!-- -->）。
 * node 须为文本或注释节点；组内没有文本时返回空数组。
 */
export function textRun(node: Node): Text[] {
  let first = node
  for (let previous = node.previousSibling; isRunNode(previous); previous = previous.previousSibling) {
    first = previous
  }
  const run: Text[] = []
  for (let current: Node | null = first; isRunNode(current); current = current.nextSibling) {
    if (isTextNode(current)) run.push(current)
  }
  return run
}

const XHTML_NS = 'http://www.w3.org/1999/xhtml'

/** 文档标题元素：第一个 HTML 命名空间的 title（排除 SVG 内的 title） */
export function titleElement(doc: Document): Element | null {
  for (const element of doc.getElementsByTagName('title')) {
    if (element.namespaceURI === XHTML_NS) return element
  }
  return null
}

/** 元素的直接子文本节点 */
export function childTexts(element: Element): Text[] {
  const texts: Text[] = []
  for (let child = element.firstChild; child; child = child.nextSibling) {
    if (isTextNode(child)) texts.push(child)
  }
  return texts
}
