import type { MessageKey } from '../i18n'
import { accelerateLink, parseCloneUrl, parseDownloadLink, type AccelerableLink, type LinkKind } from '../shared/accelerate'
import {
  categoryCandidates,
  categoryName,
  categoryUrl,
  listCategories,
  pickSource,
  type SourceHealth
} from '../shared/accelerate-categories'
import type { Settings } from '../shared/settings'
import type { HealthCache } from './accelerate-health'
import { createIcon } from './icons'
import { isPrivatePage } from './private-page'

/**
 * 加速选项：开启下载加速时，在下载链接、克隆地址旁加各分类的加速选项，原链接不变。融入页面原有的元素，随页面的浅色、深色主题；
 * 样式照搬 GitHub 下载加速脚本（YuKongA/github-download-userscript，经作者同意）：
 * - 菜单里的源码包（存储库 Code 下拉框的 Download ZIP、代码片段窄屏菜单）：其后加同款菜单项，文字为「原菜单项的文字 [分类名称]」；
 * - 文件页的 Raw 按钮：同一按钮组里、Raw 之后加同款按钮；代码片段的 Raw、Download ZIP 按钮：其后加同款按钮，与原按钮拼成一组；按钮文字为分类名称；
 * - 存储库 Code 下拉框的 HTTPS 克隆地址：地址行下方加同款的行（地址框、复制按钮），复制加速后的地址，复制后图标换成对勾；
 * - Code 下拉框加高后限高、内部滚动：不然 GitHub 把下拉框顶到视口顶部；
 * - 发行版的附件、源码包：附件名下方另起一行小号按钮组（透明底、灰字），与附件图标左对齐；
 * - 标签列表的源码包：该标签的信息行下方另起一行，zip、tar.gz 各一组，按钮同发行版。
 * 同款元素克隆自原元素（去掉 id、提示框、统计与测试标记），页面改版时样式随之变化。
 * 链接单击下载，右键可复制地址。每个分类一个选项（见 shared/accelerate-categories），没有支持该地址的加速源的分类不显示。
 * 故障转移开启时不等后台的探测结果：先按各分类的第一个加速源显示，结果到后原地改为可用的最快的，
 * 都不可用时按分类的自动隐藏开关隐藏，或显示为不可用；结果到之前单击的，等结果到后再打开（复制）。
 * 不公开的页面不加；关闭下载加速、停止时移除
 */
export interface AccelerateOptionsDeps {
  readonly settings: () => Settings
  /** 加速源的探测结果（故障转移开启时用） */
  readonly health: HealthCache
  /** 写入剪贴板；失败时拒绝 */
  readonly copy: (text: string) => Promise<void>
  /** 界面文案（扩展界面语言） */
  readonly label: (key: MessageKey) => string
}

export interface AccelerateOptions {
  /** 设置变化后按新设置添加、更新或移除 */
  refresh(): void
  /** 停止监听并移除 */
  stop(): void
}

/** 另起的一行里的一组按钮 */
export const GROUP_ATTRIBUTE = 'data-gcn-accel'
/** 选项：链接或复制按钮（复制按钮是另建的时值为 plain） */
export const OPTION_ATTRIBUTE = 'data-gcn-accel-option'
/** 另起的一行（值为位置：asset、tags） */
export const ROW_ATTRIBUTE = 'data-gcn-accel-row'
/** 一组里的按钮、组前的标注 */
export const BUTTONS_ATTRIBUTE = 'data-gcn-accel-buttons'
export const LABEL_ATTRIBUTE = 'data-gcn-accel-label'
/** 克隆原元素加的同款元素（值为位置：menu、button、clone） */
export const CLONE_ATTRIBUTE = 'data-gcn-accel-clone'
/** 当前处理页面的运行：写在 <html> 上（扩展更新后新注入的运行改写它，旧运行随即不再处理页面） */
export const OWNER_ATTRIBUTE = 'data-gcn-accel-owner'
/** 复制后的提示图标（值为 copied、failed） */
export const FEEDBACK_ATTRIBUTE = 'data-gcn-accel-feedback'
/** 不在按钮组里、父元素也不用 gap 排布的同款按钮：与原按钮拼成一组（同按钮组） */
export const JOINED_ATTRIBUTE = 'data-gcn-accel-joined'
/** 已复制、复制失败的提示保留多久 */
export const COPY_FEEDBACK_MS = 2000

const STYLE_ID = 'gcn-accel-style'
const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * 选项的位置：
 * - asset、tags：另起一行（发行版附件名下方、标签信息行下方），放各分类的按钮组；
 * - menu、button、clone：原元素之后依次加同款元素（菜单项、按钮、克隆地址行）
 */
type Layout = 'asset' | 'tags' | 'menu' | 'button' | 'clone'
type RowLayout = Extract<Layout, 'asset' | 'tags'>
type CopyState = 'idle' | 'copied' | 'failed'

interface Target {
  /** 原链接或克隆地址输入框 */
  readonly host: HTMLElement
  readonly link: AccelerableLink
  readonly layout: Layout
  /** 选项放在这个元素之后；menu、button、clone 时也是克隆的原元素 */
  readonly after: Element
  /** 组前的标注：同一行里有多组时（标签列表的 zip、tar.gz） */
  readonly label?: string
}

interface Rule {
  readonly selector: string
  readonly kinds: ReadonlySet<LinkKind>
  readonly layout: Exclude<Layout, 'clone'>
  /** 选项放在哪个元素之后 */
  readonly after: (anchor: HTMLAnchorElement) => Element
  /** 组前标注链接文字 */
  readonly labelled?: boolean
}

/** 一个选项：分类；可用时有加速后的地址与所用加速源的名称 */
interface OptionView {
  readonly id: string
  readonly name: string
  readonly url?: string
  readonly source?: string
  /** 不可用时分类中第一个加速源的地址（克隆地址行照常显示地址） */
  readonly preview?: string
}

/** 链接选项：另起一行里的按钮、同款菜单项、同款按钮 */
interface LinkOption {
  readonly kind: 'link'
  /** 加上的元素（另起一行时为按钮本身） */
  readonly root: HTMLElement
  readonly control: HTMLAnchorElement
  /** 显示文字的元素：按钮为分类名称，同款菜单项为「原菜单项的文字 [分类名称]」 */
  readonly label: HTMLElement
  readonly menu: boolean
}

/** 复制选项：同款的克隆地址行 */
interface CopyOption {
  readonly kind: 'copy'
  readonly root: HTMLElement
  readonly control: HTMLButtonElement
  readonly field: HTMLInputElement
  /** 复制按钮原有的图标：提示结束时换回 */
  readonly icon?: Element
}

type Option = LinkOption | CopyOption

/** 已加的一组选项 */
interface Rendered {
  readonly layout: Layout
  /** 加上的元素：另起的一行里的一组按钮；或依次在 after 之后的同款元素 */
  readonly nodes: readonly HTMLElement[]
  readonly after: Element
  /** 结构（位置、分类、名称、顺序）：不变时只原地更新地址与可用状态 */
  readonly key: string
  /** 分类 → 选项 */
  readonly options: ReadonlyMap<string, Option>
}

/** 探测结果：没有（故障转移关闭、探测失败）或在等结果时为 undefined */
interface HealthState {
  readonly health?: SourceHealth
  /** 在等后台的探测结果 */
  readonly pending: boolean
}

const NO_HEALTH: HealthState = { pending: false }

const BUTTON_GROUP = '[data-component="ButtonGroup"]'
/** 菜单项的文字（Primer React、Primer ViewComponents） */
const MENU_LABEL = '[data-component="ActionList.Item.Label"], .ActionListItem-label'
/** 按钮的文字 */
const BUTTON_LABEL = '[data-component="text"], .Button-label'
/** 克隆的元素去掉的属性：id 与引用 id 的属性（不重复）、统计与测试标记、页面脚本的行为标记 */
const STRIPPED_ATTRIBUTES = [
  'id',
  'for',
  'aria-labelledby',
  'aria-describedby',
  'data-testid',
  'data-dd-action-name',
  'data-hydro-click',
  'data-hydro-click-hmac',
  'data-ga-click',
  'data-item-id',
  'data-autoselect'
]
/** 克隆的元素去掉的子元素：提示框（页面脚本显示，克隆的不会出现） */
const STRIPPED_ELEMENTS = '[popover], [role="tooltip"], tool-tip'
/** 已加的元素：其中的链接、地址框不再处理 */
const OURS = `[${GROUP_ATTRIBUTE}], [${CLONE_ATTRIBUTE}]`
/** 已加的元素里最外层的：另起的行、同款元素 */
const TOP_LEVEL = `[${ROW_ATTRIBUTE}], [${CLONE_ATTRIBUTE}]`

/** 附件所在的行（图标与附件名）：附件名下方另起一行时放在它之后 */
function assetLine(anchor: HTMLAnchorElement): Element {
  const parent = anchor.parentElement
  return parent && !parent.matches('.Box-row') ? parent : anchor
}

/** 按钮组里的按钮：按钮组的一项（按钮本身或包着它的元素）；不在按钮组里时为按钮本身 */
function buttonItem(anchor: HTMLAnchorElement): Element {
  const parent = anchor.parentElement
  if (!parent || parent.matches(BUTTON_GROUP)) return anchor
  return parent.parentElement?.matches(BUTTON_GROUP) ? parent : anchor
}

/** 下载链接的位置，按顺序匹配，同一链接只按第一个处理 */
const RULES: readonly Rule[] = [
  // 标签列表：信息行（时间、提交、zip、tar.gz 等）里的源码包
  {
    selector: '.Box-row ul > li > a[href]',
    kinds: new Set(['archive']),
    layout: 'tags',
    after: anchor => anchor.closest('ul') ?? anchor,
    labelled: true
  },
  // 发行版的附件与源码包
  { selector: '.Box-row a[href]', kinds: new Set(['release', 'archive']), layout: 'asset', after: assetLine },
  // 菜单里的源码包：存储库 Code 下拉框（Primer React）、代码片段窄屏菜单（Primer ViewComponents）
  {
    selector: ':is([role="menu"], [data-component="ActionList"], .ActionListWrap) > li > a[href]',
    kinds: new Set(['archive', 'gist']),
    layout: 'menu',
    after: anchor => anchor.parentElement ?? anchor
  },
  // 文件页的 Raw 按钮（在按钮组里）；代码片段的 Raw、Download ZIP 按钮
  {
    selector: 'a[data-testid="raw-button"], .file-actions a[href], a.btn[href], a.Button[href]',
    kinds: new Set(['raw', 'gist', 'archive']),
    layout: 'button',
    after: buttonItem
  }
]

/** 存储库 Code 下拉框的 HTTPS 克隆地址（同一元素切换 HTTPS、SSH 等时改 value） */
const CLONE_SELECTOR = 'input#clone-with-https'

/** 复制后的提示图标：GitHub 的 Octicons（check、x），颜色用 GitHub 的工具类 */
const FEEDBACK_ICONS: Readonly<Record<Exclude<CopyState, 'idle'>, { readonly className: string; readonly d: string }>> = {
  copied: {
    className: 'octicon octicon-check color-fg-success',
    d: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z'
  },
  failed: {
    className: 'octicon octicon-x color-fg-danger',
    d: 'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z'
  }
}

const MUTED = 'var(--fgColor-muted, var(--color-fg-muted, #59636e))'
const DISABLED = 'var(--fgColor-disabled, var(--color-primer-fg-disabled, #818b98))'
const FOCUS = 'var(--focus-outlineColor, var(--color-accent-fg, #0969da))'

/**
 * 另起一行的按钮用 GitHub 的 btn 类，改为小号、透明底、灰字，拼成一组（照搬下载加速脚本的发行版附件按钮）；
 * 颜色取 GitHub 的设计变量（Primer），旧版企业版用其旧变量，都没有时用浅色主题的值
 */
const STYLE = `
[${ROW_ATTRIBUTE}] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  color: ${MUTED};
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
}
[${ROW_ATTRIBUTE}='asset'] {
  display: inline-flex;
  width: 100%;
  margin-top: 4px;
}
:is(.Box-row, .Box-row *):has(> [${ROW_ATTRIBUTE}='asset']) {
  flex-wrap: wrap;
}
[${ROW_ATTRIBUTE}='tags'] {
  margin-top: 8px;
}
[${GROUP_ATTRIBUTE}] {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
[${GROUP_ATTRIBUTE}] + [${GROUP_ATTRIBUTE}] {
  margin-left: 8px;
}
[${LABEL_ATTRIBUTE}] {
  white-space: nowrap;
}
[${BUTTONS_ATTRIBUTE}] {
  display: inline-flex;
  min-width: 0;
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}] {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  height: 24px;
  margin-left: -1px;
  padding: 0 clamp(4px, 0.8vw, 8px);
  border-color: var(--borderColor-default, var(--color-border-default, #d1d9e0));
  border-radius: 0;
  background-color: transparent;
  color: ${MUTED};
  font-size: 12px;
  font-weight: 400;
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}]:first-child {
  margin-left: 0;
  border-radius: 6px 0 0 6px;
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}]:last-child {
  border-radius: 0 6px 6px 0;
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}]:only-child {
  border-radius: 6px;
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}]:is(:hover, :focus-visible) {
  position: relative;
  z-index: 1;
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}]:not([aria-disabled='true']):hover {
  background-color: var(--bgColor-muted, var(--color-canvas-subtle, #f6f8fa));
  color: var(--fgColor-default, var(--color-fg-default, #1f2328));
}
[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}][aria-disabled='true'] {
  background-color: transparent;
  color: ${DISABLED};
  cursor: not-allowed;
}
#__primerPortalRoot__ [data-component='AnchoredOverlay']:has([${CLONE_ATTRIBUTE}]) {
  max-height: max(240px, calc(100vh - 360px));
  overflow-y: auto;
}
[${CLONE_ATTRIBUTE}='clone'] {
  margin-top: 4px;
}
a:has(+ [${JOINED_ATTRIBUTE}]) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
[${JOINED_ATTRIBUTE}] {
  margin-left: calc(var(--borderWidth-thin, 1px) * -1) !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}
[${JOINED_ATTRIBUTE}]:is(:hover, :focus-visible) {
  position: relative;
  z-index: 1;
}
div:has(> a[${JOINED_ATTRIBUTE}]) {
  white-space: nowrap;
}
:is([${CLONE_ATTRIBUTE}] [${OPTION_ATTRIBUTE}], [${CLONE_ATTRIBUTE}][${OPTION_ATTRIBUTE}])[aria-disabled='true'] {
  color: ${DISABLED} !important;
  cursor: not-allowed;
}
[${FEEDBACK_ATTRIBUTE}='copied'] {
  color: var(--fgColor-success, var(--color-success-fg, #1a7f37)) !important;
}
[${FEEDBACK_ATTRIBUTE}='failed'] {
  color: var(--fgColor-danger, var(--color-danger-fg, #d1242f)) !important;
}
[${OPTION_ATTRIBUTE}='plain'] {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--control-medium-size, 32px);
  height: var(--control-medium-size, 32px);
  margin-left: 4px;
  padding: 0;
  border: 0;
  border-radius: var(--borderRadius-medium, 6px);
  background: transparent;
  color: ${MUTED};
  cursor: pointer;
}
[${OPTION_ATTRIBUTE}='plain']:not(:disabled):hover {
  background: var(--control-transparent-bgColor-hover, #818b981a);
}
[${OPTION_ATTRIBUTE}='plain']:focus-visible {
  outline: 2px solid ${FOCUS};
  outline-offset: -2px;
}
[${OPTION_ATTRIBUTE}='plain']:disabled {
  color: ${DISABLED};
  cursor: not-allowed;
}
`

function isRow(layout: Layout): layout is RowLayout {
  return layout === 'asset' || layout === 'tags'
}

/** 普通的左键单击（含键盘触发的点击）：不带修饰键，页面没有取消 */
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** 元素用 flex、grid 的 gap 排布子元素 */
function hasGap(element: Element | null): boolean {
  const style = element && element.ownerDocument.defaultView?.getComputedStyle(element)
  return !!style && /flex|grid/.test(style.display) && Number.parseFloat(style.columnGap) > 0
}

/** 从 ancestor 到 node 的各级子元素位置；node 不在 ancestor 里时为 undefined */
function childPath(ancestor: Element, node: Element): number[] | undefined {
  const path: number[] = []
  let current = node
  while (current !== ancestor) {
    const parent = current.parentElement
    if (!parent) return undefined
    path.unshift([...parent.children].indexOf(current))
    current = parent
  }
  return path
}

function descend(root: Element, path: readonly number[]): Element | undefined {
  let current: Element | undefined = root
  for (const index of path) current = current?.children[index]
  return current
}

/** 克隆原元素：克隆与其中对应 host 的元素；去掉 id、提示框、统计与测试标记，不翻译 */
function cloneNative(template: Element, host: Element, layout: Layout): { readonly root: HTMLElement; readonly host: Element } | undefined {
  const path = childPath(template, host)
  const root = template.cloneNode(true)
  if (!path || !(root instanceof HTMLElement)) return undefined
  const counterpart = descend(root, path)
  if (!counterpart) return undefined
  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const name of STRIPPED_ATTRIBUTES) element.removeAttribute(name)
  }
  for (const element of root.querySelectorAll(STRIPPED_ELEMENTS)) element.remove()
  root.setAttribute(CLONE_ATTRIBUTE, layout)
  // 文字已是界面语言或随原元素：汉化引擎、浏览器翻译都不处理
  root.setAttribute('translate', 'no')
  return { root, host: counterpart }
}

/** 原菜单项的文字 */
function menuLabel(host: Element): string {
  return ((host.querySelector(MENU_LABEL) ?? host).textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function createAccelerateOptions(doc: Document, deps: AccelerateOptionsDeps): AccelerateOptions {
  /** 原链接、输入框 → 已加的选项 */
  const groups = new Map<HTMLElement, Rendered>()
  /** 另起的一行放在其后的元素 → 该行（标签列表的 zip、tar.gz 两组在同一行里） */
  const containers = new Map<Element, HTMLElement>()
  /** 选项当前的内容（单击时读取） */
  const current = new WeakMap<HTMLElement, OptionView>()
  const timers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>()
  let scheduled = false
  let observing = false
  let stopped = false
  /** 正在等后台的探测结果 */
  let healthPending = false
  /** 探测失败：本轮设置下不再等，按不探测处理 */
  let healthFailed = false
  /** 本次运行的标记（见 OWNER_ATTRIBUTE） */
  const owner = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  doc.documentElement.setAttribute(OWNER_ATTRIBUTE, owner)

  /** 页面已归别的运行处理：不再添加、移除（标记被页面去掉时重新写上） */
  function superseded(): boolean {
    const current = doc.documentElement.getAttribute(OWNER_ATTRIBUTE)
    if (current === null) doc.documentElement.setAttribute(OWNER_ATTRIBUTE, owner)
    return current !== null && current !== owner
  }

  function isEnabled(): boolean {
    const settings = deps.settings()
    return settings.enabled && settings.accelerate
  }

  function findTargets(): Target[] {
    const targets: Target[] = []
    const seen = new Set<Element>()
    for (const rule of RULES) {
      for (const anchor of doc.querySelectorAll<HTMLAnchorElement>(rule.selector)) {
        if (seen.has(anchor) || anchor.closest(OURS)) continue
        const link = parseDownloadLink(anchor.href)
        if (!link || !rule.kinds.has(link.kind)) continue
        seen.add(anchor)
        const label = rule.labelled ? anchor.textContent?.trim() : undefined
        targets.push({ host: anchor, link, layout: rule.layout, after: rule.after(anchor), ...(label ? { label } : {}) })
      }
    }
    for (const input of doc.querySelectorAll<HTMLInputElement>(CLONE_SELECTOR)) {
      const link = input.closest(OURS) ? undefined : parseCloneUrl(input.value)
      if (link) targets.push({ host: input, link, layout: 'clone', after: input.parentElement ?? input })
    }
    return targets
  }

  function optionViews(link: AccelerableLink, health: SourceHealth | undefined): OptionView[] {
    const views: OptionView[] = []
    for (const category of listCategories(deps.settings())) {
      const [first] = categoryCandidates(category, link)
      if (!first) continue
      // 没有探测结果时用分类中第一个支持该链接的加速源
      const source = pickSource(category, link, health)
      const url = source && accelerateLink(source.template, link)
      const name = categoryName(category, deps.label)
      if (source && url) views.push({ id: category.id, name, url, source: source.name })
      else if (!category.autoHide) views.push({ id: category.id, name, preview: accelerateLink(first.template, link) })
    }
    return views
  }

  /** 等后台的探测结果：故障转移开启、探测没有失败、还没有结果 */
  function awaitingHealth(): boolean {
    return deps.settings().failover && !healthFailed && !deps.health.current()
  }

  /** 等探测结果到后，选项所在分类的地址：都不可用时为 undefined；探测失败时用分类中第一个加速源 */
  async function probedUrl(target: Target, control: HTMLElement): Promise<string | undefined> {
    const id = current.get(control)?.id
    const health = await deps.health.get().catch(() => undefined)
    const category = listCategories(deps.settings()).find(item => item.id === id)
    return category && categoryUrl(category, target.link, health)
  }

  /** 打开地址，不带来源页：下载留在本页，Raw 文件在新标签页 */
  function follow(url: string, newTab: boolean): void {
    const anchor = doc.createElement('a')
    anchor.href = url
    anchor.rel = 'noopener noreferrer'
    anchor.referrerPolicy = 'no-referrer'
    if (newTab) anchor.target = '_blank'
    else anchor.setAttribute('download', '')
    anchor.hidden = true
    ;(doc.body ?? doc.documentElement).append(anchor)
    anchor.click()
    anchor.remove()
  }

  /** 探测结果到之前单击的链接：等结果到后打开可用的最快的；都不可用时打开原链接 */
  async function openWhenProbed(target: Target, anchor: HTMLAnchorElement): Promise<void> {
    const url = await probedUrl(target, anchor)
    follow(url ?? (target.host as HTMLAnchorElement).href, anchor.target === '_blank')
  }

  /** 复制按钮的状态：已复制、复制失败时换成对应的图标与名称 */
  function setCopyState(option: CopyOption, state: CopyState): void {
    const { control, icon } = option
    const name = current.get(control)?.name ?? ''
    const shown = control.querySelector(`[${FEEDBACK_ATTRIBUTE}]`)
    if (state === 'idle') {
      delete control.dataset.state
      if (shown && icon) shown.replaceWith(icon)
      else shown?.remove()
      control.setAttribute('aria-label', `${name} ${deps.label('copyLink')}`)
      return
    }
    control.dataset.state = state
    control.setAttribute('aria-label', `${name} ${deps.label(state === 'copied' ? 'copied' : 'copyFailed')}`)
    const feedback = feedbackIcon(state)
    const replaced = shown ?? (icon && control.contains(icon) ? icon : undefined)
    if (replaced) replaced.replaceWith(feedback)
    else control.prepend(feedback)
  }

  /** 复制后的提示图标（GitHub 的 Octicons，实心） */
  function feedbackIcon(state: Exclude<CopyState, 'idle'>): SVGSVGElement {
    const { className, d } = FEEDBACK_ICONS[state]
    const svg = doc.createElementNS(SVG_NS, 'svg')
    for (const [key, value] of Object.entries({
      class: className,
      viewBox: '0 0 16 16',
      width: '16',
      height: '16',
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false',
      [FEEDBACK_ATTRIBUTE]: state
    })) {
      svg.setAttribute(key, value)
    }
    const path = doc.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', d)
    svg.append(path)
    return svg
  }

  async function copy(target: Target, option: CopyOption): Promise<void> {
    const { control } = option
    clearTimeout(timers.get(control))
    const url = awaitingHealth() ? await probedUrl(target, control) : current.get(control)?.url
    let state: CopyState = 'failed'
    if (url) {
      try {
        await deps.copy(url)
        state = 'copied'
      } catch {
        // 剪贴板不可用：显示复制失败
      }
    }
    if (!control.isConnected) return
    setCopyState(option, state)
    timers.set(
      control,
      setTimeout(() => setCopyState(option, 'idle'), COPY_FEEDBACK_MS)
    )
  }

  /** 链接选项的行为：不带来源页；Raw 文件在新标签页打开（加速源把文本显示在页面上），其余是下载，留在本页 */
  function prepareLink(anchor: HTMLAnchorElement, target: Target): void {
    anchor.setAttribute(OPTION_ATTRIBUTE, '')
    anchor.rel = 'noopener noreferrer'
    anchor.referrerPolicy = 'no-referrer'
    if (target.link.kind === 'raw') anchor.target = '_blank'
    else anchor.setAttribute('download', '')
    anchor.addEventListener('click', event => {
      if (!anchor.hasAttribute('href') || !isPlainClick(event) || !awaitingHealth()) return
      event.preventDefault()
      void openWhenProbed(target, anchor)
    })
  }

  /** 另起一行里的按钮：GitHub 的 btn 类 */
  function ownButton(target: Target): LinkOption {
    const anchor = doc.createElement('a')
    anchor.className = 'btn'
    prepareLink(anchor, target)
    return { kind: 'link', root: anchor, control: anchor, label: anchor, menu: false }
  }

  /** 同款菜单项、按钮：克隆原元素；菜单项的文字为「原菜单项的文字 [分类名称]」，按钮的文字为分类名称 */
  function linkClone(target: Target): LinkOption | undefined {
    const cloned = cloneNative(target.after, target.host, target.layout)
    if (!cloned || !(cloned.host instanceof HTMLAnchorElement)) return undefined
    const { root, host: control } = cloned
    prepareLink(control, target)
    if (target.layout === 'menu') {
      return { kind: 'link', root, control, label: control.querySelector<HTMLElement>(MENU_LABEL) ?? control, menu: true }
    }
    const parent = target.after.parentElement
    if (!parent?.matches(BUTTON_GROUP) && !hasGap(parent)) root.setAttribute(JOINED_ATTRIBUTE, '')
    return { kind: 'link', root, control, label: control.querySelector<HTMLElement>(BUTTON_LABEL) ?? control, menu: false }
  }

  /** 原地址行没有复制按钮时另建 */
  function plainCopyButton(): HTMLButtonElement {
    const button = doc.createElement('button')
    button.setAttribute(OPTION_ATTRIBUTE, 'plain')
    button.append(createIcon(doc, 'copy'))
    return button
  }

  /** 同款的克隆地址行：克隆原地址行（地址框、复制按钮），地址框只读、聚焦时全选；单击地址框或复制按钮即复制 */
  function copyRow(target: Target): CopyOption | undefined {
    const cloned = cloneNative(target.after, target.host, 'clone')
    if (!cloned || !(cloned.host instanceof HTMLInputElement)) return undefined
    const { root, host: field } = cloned
    // 原行里的无障碍标签指向原地址框：地址框另设名称
    for (const label of root.querySelectorAll('label')) label.remove()
    field.readOnly = true
    field.addEventListener('focus', () => field.select())
    const native = root.querySelector('button')
    const control = native ?? plainCopyButton()
    if (native) native.setAttribute(OPTION_ATTRIBUTE, '')
    else root.append(control)
    control.type = 'button'
    const icon = control.querySelector('svg') ?? undefined
    const option: CopyOption = { kind: 'copy', root, control, field, ...(icon ? { icon } : {}) }
    control.addEventListener('click', event => {
      event.preventDefault()
      event.stopPropagation()
      void copy(target, option)
    })
    // 地址框：单击时全选并复制，提示显示在复制按钮上
    field.addEventListener('click', () => {
      field.select()
      void copy(target, option)
    })
    return option
  }

  function createOption(target: Target): Option | undefined {
    if (target.layout === 'clone') return copyRow(target)
    return isRow(target.layout) ? ownButton(target) : linkClone(target)
  }

  /** 写入选项的内容：名称、地址（可用时）、所用加速源（悬停提示）；只改变化了的 */
  function apply(option: Option, target: Target, view: OptionView): void {
    current.set(option.control, view)
    const title = view.url ? (view.source ?? '') : deps.label('stateUnavailable')
    if (option.kind === 'copy') {
      const { control, field } = option
      const value = view.url ?? view.preview ?? ''
      if (field.value !== value) field.value = value
      field.disabled = !view.url
      field.title = title
      field.setAttribute('aria-label', view.name)
      control.disabled = !view.url
      if (!control.dataset.state) control.setAttribute('aria-label', `${view.name} ${deps.label('copyLink')}`)
      return
    }
    const { control, label } = option
    const text = option.menu ? `${menuLabel(target.host)} [${view.name}]` : view.name
    if (label.textContent !== text) label.textContent = text
    if (control.title !== title) control.title = title
    if (view.url) {
      if (control.getAttribute('href') !== view.url) control.setAttribute('href', view.url)
      control.removeAttribute('aria-disabled')
      return
    }
    control.removeAttribute('href')
    control.setAttribute('aria-disabled', 'true')
  }

  /** 另起一行里的一组按钮 */
  function buttonGroup(target: Target, buttons: readonly HTMLElement[]): HTMLElement {
    const group = doc.createElement('span')
    group.setAttribute(GROUP_ATTRIBUTE, '')
    group.setAttribute('role', 'group')
    const name = deps.label('accelerate')
    group.setAttribute('aria-label', target.label ? `${name} ${target.label}` : name)
    if (target.label) {
      const label = doc.createElement('span')
      label.setAttribute(LABEL_ATTRIBUTE, '')
      label.setAttribute('aria-hidden', 'true')
      label.textContent = target.label
      group.append(label)
    }
    const wrap = doc.createElement('span')
    wrap.setAttribute(BUTTONS_ATTRIBUTE, '')
    wrap.append(...buttons)
    group.append(wrap)
    return group
  }

  function render(target: Target, views: readonly OptionView[]): { nodes: HTMLElement[]; options: Map<string, Option> } {
    const options = new Map<string, Option>()
    for (const view of views) {
      const option = createOption(target)
      if (!option) continue
      apply(option, target, view)
      options.set(view.id, option)
    }
    const roots = [...options.values()].map(option => option.root)
    return { nodes: isRow(target.layout) ? [buttonGroup(target, roots)] : roots, options }
  }

  /** 另起的一行：没有时新建，放在目标的 after 之后 */
  function containerFor(target: Target): HTMLElement {
    const existing = containers.get(target.after)
    if (existing) return existing
    const container = doc.createElement('div')
    container.setAttribute(ROW_ATTRIBUTE, target.layout)
    // 文字已是界面语言：汉化引擎、浏览器翻译都不处理
    container.setAttribute('translate', 'no')
    target.after.after(container)
    containers.set(target.after, container)
    return container
  }

  /** 已加的选项还在原处：另起的一行里，或依次紧跟在 after 之后 */
  function placed(rendered: Rendered, target: Target): boolean {
    if (rendered.after !== target.after || rendered.layout !== target.layout) return false
    if (isRow(target.layout)) {
      const container = containers.get(target.after)
      return container !== undefined && rendered.nodes.every(node => node.parentElement === container)
    }
    let previous: Element = target.after
    for (const node of rendered.nodes) {
      if (node.previousElementSibling !== previous) return false
      previous = node
    }
    return true
  }

  /** 放入新加的元素；替换原处的旧选项时保持位置 */
  function insert(target: Target, nodes: readonly HTMLElement[], replaced: Rendered | undefined): void {
    if (isRow(target.layout)) {
      const first = replaced?.nodes[0]
      if (first?.isConnected) first.replaceWith(...nodes)
      else containerFor(target).append(...nodes)
      return
    }
    for (const node of replaced?.nodes ?? []) node.remove()
    target.after.after(...nodes)
  }

  /** 移除一组选项；另起的一行里没有选项了时一并移除 */
  function removeGroup(rendered: Rendered): void {
    for (const node of rendered.nodes) node.remove()
    if (!isRow(rendered.layout)) return
    const container = containers.get(rendered.after)
    if (container && !container.querySelector(`[${GROUP_ATTRIBUTE}]`)) {
      container.remove()
      containers.delete(rendered.after)
    }
  }

  function ensureStyle(): void {
    if (doc.getElementById(STYLE_ID)) return
    const style = doc.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE
    ;(doc.head ?? doc.documentElement).append(style)
  }

  function removeAll(): void {
    for (const rendered of groups.values()) for (const node of rendered.nodes) node.remove()
    for (const container of containers.values()) container.remove()
    containers.clear()
    groups.clear()
    labelObserver.disconnect()
    doc.getElementById(STYLE_ID)?.remove()
  }

  function requestHealth(): void {
    if (healthPending) return
    healthPending = true
    deps.health.get().then(
      () => {
        healthPending = false
        schedule()
      },
      () => {
        healthPending = false
        healthFailed = true
        schedule()
      }
    )
  }

  function healthState(): HealthState {
    if (!deps.settings().failover || healthFailed) return NO_HEALTH
    const health = deps.health.current()
    if (health) return { health, pending: false }
    requestHealth()
    return { pending: true }
  }

  function update(target: Target, state: HealthState): void {
    const existing = groups.get(target.host)
    const inPlace = existing !== undefined && placed(existing, target)
    // 等新的探测结果（设置变化后）：已加的选项先保留，结果到后再更新
    if (state.pending && inPlace) return
    const views = optionViews(target.link, state.health)
    const key = [target.layout, target.link.kind, target.label ?? '', ...views.map(view => `${view.id}\t${view.name}`)].join('\n')
    if (inPlace && existing.key === key) {
      for (const view of views) {
        const option = existing.options.get(view.id)
        if (option) apply(option, target, view)
      }
      return
    }
    if (existing) {
      groups.delete(target.host)
      if (!inPlace || views.length === 0) removeGroup(existing)
    }
    if (views.length === 0) return
    ensureStyle()
    const { nodes, options } = render(target, views)
    insert(target, nodes, inPlace ? existing : undefined)
    groups.set(target.host, { layout: target.layout, nodes, after: target.after, key, options })
  }

  /** 另起的一行被页面移走（重新渲染等）或不在原处时移除，其中的选项随后重新添加 */
  function pruneContainers(): void {
    for (const [after, container] of containers) {
      if (container.isConnected && container.previousElementSibling === after) continue
      container.remove()
      containers.delete(after)
    }
  }

  /** 不归本次运行管理的已加元素（Turbo 缓存的页面快照恢复时带回的旧选项等）：移除，随后按目标重新添加 */
  function pruneStale(): void {
    const tracked = new Set<Element>(containers.values())
    for (const rendered of groups.values()) for (const node of rendered.nodes) tracked.add(node)
    for (const element of doc.querySelectorAll(TOP_LEVEL)) {
      if (!tracked.has(element) && !element.parentElement?.closest(TOP_LEVEL)) element.remove()
    }
  }

  /** 同款菜单项的文字随原菜单项（汉化、还原时页面只改文字）：观察原菜单项的文字 */
  function watchLabels(): void {
    labelObserver.disconnect()
    for (const [host, rendered] of groups) {
      if (rendered.layout === 'menu') labelObserver.observe(host.querySelector(MENU_LABEL) ?? host, { characterData: true, subtree: true })
    }
  }

  function scan(): void {
    scheduled = false
    if (superseded()) {
      setObserving(false)
      labelObserver.disconnect()
      return
    }
    setObserving(!stopped && isEnabled())
    // 不公开的页面（软导航后可能变化，照常监听）
    if (!observing || isPrivatePage(doc)) {
      removeAll()
      return
    }
    pruneContainers()
    pruneStale()
    const targets = findTargets()
    // 页面上有下载链接、克隆地址时才探测；不等探测结果，先按各分类的第一个加速源显示
    const state = targets.length > 0 ? healthState() : NO_HEALTH
    const hosts = new Set<HTMLElement>()
    for (const target of targets) {
      hosts.add(target.host)
      update(target, state)
    }
    for (const [host, rendered] of groups) {
      if (hosts.has(host)) continue
      removeGroup(rendered)
      groups.delete(host)
    }
    watchLabels()
  }

  /** 同一轮 DOM 变动只扫描一次 */
  function schedule(): void {
    if (scheduled || stopped) return
    scheduled = true
    queueMicrotask(scan)
  }

  const observer = new MutationObserver(schedule)
  const labelObserver = new MutationObserver(schedule)

  function setObserving(on: boolean): void {
    if (on === observing) return
    observing = on
    if (on) observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'value'] })
    else observer.disconnect()
  }

  scan()

  return {
    refresh() {
      healthFailed = false
      scan()
    },
    stop() {
      stopped = true
      setObserving(false)
      labelObserver.disconnect()
      // 页面已归新的运行：其选项、样式留给它
      if (superseded()) return
      removeAll()
      doc.documentElement.removeAttribute(OWNER_ATTRIBUTE)
    }
  }
}
