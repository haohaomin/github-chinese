import { AUTO_LOAD_SCOPES, autoLoadPageScope, type AutoLoadScope } from '../shared/auto-load'
import { completeDeferred } from './deferred-fill'
import { pageSite, pathSegments } from './page'
import { createPageBreak } from './page-break'
import {
  currentPageNumber,
  findByPath,
  firstLink,
  itemKey,
  listBefore,
  listItems,
  nextPageLink,
  nextPageUrl,
  pageNumberOf,
  pathOf,
  paginations,
  paginationsAfter,
  renameDuplicateIds,
  type ElementPath,
  type PageList
} from './page-list'

/**
 * 自动加载：开启后，
 * 1. 「加载更多」按钮（首页动态与侧栏、贡献动态、主题页、拉取请求与议题里折叠的时间线、全局导航侧栏的常用存储库等）
 *    接近视口时自动点击；点击后页面把焦点移到加载的内容时，位置留在原处、焦点还回去
 *    （不然页面随焦点滚到新内容，按钮一直在视口附近，加载不停）。
 *    贡献动态的按钮每次只加一个月，空的月份很短，按钮总在视口附近：进入视口才点，且两次之间页面要往下滚过
 *    （页面不能滚动时不必），不滚动时不接连加载；
 * 2. 有分页的列表（议题、拉取请求、搜索结果、讨论、操作、发行版、标签、提交等，见 core/page-list），
 *    列表下方的分页接近视口时取回下一页，把列表项接在当前列表之后，直到最后一页。
 *    取回的是同站页面（带 Cookie，同手动翻页），不经第三方。
 *    每页前插入「第 N 页」分隔；分页换成最后取回那一页的分页（React 管理的分页隐藏，不移除）。
 * 范围按页面逐项开关（见 shared/auto-load）：侧栏常用存储库的按钮在任何页面按 sidePanel，其余按当前页面
 */
export interface AutoLoadOptions {
  /** 是否自动加载：总开关与「自动加载」都开启 */
  readonly active: () => boolean
  /** 开启的范围（见 shared/auto-load）；默认全部 */
  readonly scopes?: () => readonly AutoLoadScope[]
  /** 取回同站页面的 HTML；应答不成功时拒绝 */
  readonly fetchPage: (url: string) => Promise<string>
  /** 页码分隔的文字（第 N 页） */
  readonly pageLabel?: (page: number) => string
  /**
   * 元素接近视口（视口下方一屏内；visible 为 true 时为进入视口）时回调；返回取消函数。
   * 默认用 IntersectionObserver
   */
  readonly watch?: (element: Element, onNear: () => void, visible?: boolean) => () => void
  /** 当前时间（毫秒）；测试用 */
  readonly now?: () => number
  /** 取回或接上失败时回调（该列表不再自动加载） */
  readonly onError?: (error: unknown) => void
}

export interface AutoLoader {
  /** 设置变化、软导航后按新状态处理 */
  refresh(): void
  /** 停止监听；已接上的列表项保留 */
  stop(): void
}

/** 经典的 ajax 分页表单里的按钮（首页动态与侧栏、贡献动态、主题页、拉取请求时间线等）：表单随加载换掉，每个只点一次 */
const AJAX_LOAD_MORE_SELECTOR = 'form.ajax-pagination-form button'
/** 全局导航侧栏的常用存储库（Show more）：在任何页面，范围为 sidePanel */
const SIDE_PANEL_LOAD_MORE_SELECTOR = 'button[data-testid="dynamic-side-panel-items-show-more"]'
/**
 * React 的「加载更多」：议题时间线、侧栏常用存储库。
 * 加载后可能还是同一个按钮，仍在原处时再点
 */
const REACT_LOAD_MORE_SELECTOR = `button[data-testid^="issue-timeline-load-more"], ${SIDE_PANEL_LOAD_MORE_SELECTOR}`
/** 「加载更多」按钮 */
export const LOAD_MORE_SELECTOR = `${AJAX_LOAD_MORE_SELECTOR}, ${REACT_LOAD_MORE_SELECTOR}`
/** 个人主页贡献动态的「Show more activity」：进入视口才点，两次之间页面要往下滚过 */
export const TIMELINE_LOAD_MORE_SELECTOR = 'form.js-show-more-timeline-form button'
/** 同一页面最多自动取回的页数，同一类「加载更多」在同一路径上最多点的次数：防止异常页面无限加载 */
export const MAX_AUTO_PAGES = 30
/** 点过的 React 按钮多久后仍在原处才再点 */
export const RECLICK_DELAY_MS = 1500
/** 自动点击后多久内页面把焦点移到加载的内容时不跟着滚动（见 onFocusIn） */
export const FOCUS_GUARD_MS = 15_000
/** 找不到列表的分页隔多久再找、最多找几次（列表可能还在渲染） */
const RETRY_LIST_MS = 1000
const MAX_LIST_TRIES = 5
/** 换上的分页（React 区域里，不归 React 管理）：下次直接替换 */
export const PAGE_NAV_ATTRIBUTE = 'data-gcn-page-nav'
/** 换下的 React 分页：隐藏 */
export const HIDDEN_NAV_ATTRIBUTE = 'data-gcn-hidden-nav'

/** 跟着列表一起接上的其他组：发行版侧栏目录 */
const EXTRA_GROUPS: readonly { readonly matches: (url: URL) => boolean; readonly selector: string }[] = [
  {
    matches: url => {
      const parts = pathSegments(url.pathname)
      return pageSite(url).kind === 'github' && parts.length === 3 && parts[2] === 'releases'
    },
    selector: '.js-release-toc nav-list li'
  }
]

/** 一个列表的自动加载状态 */
interface ListState {
  readonly list: PageList
  readonly path: ElementPath
  /** 开始时就有的列表项：有被移除的、第一项的链接变了（列表重新渲染）就作废，接上的节点一并去掉 */
  readonly originals: readonly Element[]
  readonly firstHref: string
  /** 下一页；没有了为 undefined */
  next: URL | undefined
  /** 最后接上的页码 */
  page: number
  /** 接上的节点（列表项、页码分隔、换上的分页、侧栏目录项） */
  readonly appended: Element[]
  /** 隐藏的 React 分页 */
  readonly hidden: Element[]
}

/** 默认的接近视口判断：视口下方一屏内；visible 时进入视口 */
function watchNear(element: Element, onNear: () => void, visible = false): () => void {
  const observer = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) onNear()
    },
    { rootMargin: visible ? '0px' : '0px 0px 100% 0px' }
  )
  observer.observe(element)
  return () => observer.disconnect()
}

/** 元素在视口里（显示着，有一部分在视口内） */
function inViewport(element: Element, view: Window): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < view.innerHeight
}

/** 取回的节点：去掉脚本（DOMParser 解析的脚本不执行，再保险一次），收进当前文档 */
function adopt<T extends Node>(doc: Document, node: T): T {
  if (node instanceof Element || node instanceof DocumentFragment) {
    for (const script of node.querySelectorAll('script')) script.remove()
  }
  return doc.adoptNode(node)
}

/** 当前文档里不显示的元素 */
function isHiddenNow(element: Element): boolean {
  if (element.hasAttribute('hidden')) return true
  const view = element.ownerDocument.defaultView
  return view !== null && view.getComputedStyle(element).display === 'none'
}

/** React 管理的元素：在 React 渲染的区域里，且不是换上的分页 */
function isReactOwned(element: Element): boolean {
  return element.closest('react-app, react-partial') !== null && element.closest(`[${PAGE_NAV_ATTRIBUTE}]`) === null
}

/** 「加载更多」的种类：同一页面每类最多点 MAX_AUTO_PAGES 次 */
function buttonKind(button: Element): string {
  return button.getAttribute('data-testid') ?? button.closest('form')?.className ?? ''
}

function isStale(state: ListState): boolean {
  if (!state.list.container.isConnected) return true
  if (state.originals.some(item => !item.isConnected)) return true
  return state.originals[0] !== undefined && firstLink(state.originals[0]) !== state.firstHref
}

function hideNav(nav: HTMLElement): void {
  nav.setAttribute(HIDDEN_NAV_ATTRIBUTE, '')
  nav.style.setProperty('display', 'none', 'important')
}

function showNav(nav: HTMLElement): void {
  nav.removeAttribute(HIDDEN_NAV_ATTRIBUTE)
  nav.style.removeProperty('display')
}

export function createAutoLoader(doc: Document, options: AutoLoadOptions): AutoLoader {
  const watch = options.watch ?? watchNear
  const now = options.now ?? (() => Date.now())
  const pageLabel = options.pageLabel ?? ((page: number) => String(page))
  const scopes = options.scopes ?? (() => AUTO_LOAD_SCOPES)
  /** 正在监听的元素（按钮、分页）→ 取消函数 */
  const watched = new Map<Element, () => void>()
  /** 点过的按钮 → 最近一次的时间 */
  const clickedAt = new WeakMap<Element, number>()
  /** 各类按钮在当前路径上点过的次数 */
  let clicksByKind = new Map<string, number>()
  /** 分页 → 列表状态 */
  const states = new Map<Element, ListState>()
  /** 找不到列表的分页 → 最近一次的时间与次数 */
  const rejected = new WeakMap<Element, { readonly at: number; readonly tries: number }>()
  /** 当前页面（不含 #）：变了（软导航）就重新计数取回的页数 */
  let pageKey = ''
  /**
   * 当前路径（不含查询参数）：变了就重新计数点按钮的次数。
   * GitHub 加载贡献动态后改地址的 from、to，按页面计时每次都清零，上限形同虚设
   */
  let pathKey = ''
  /** 当前页面取回过的页数 */
  let loads = 0
  /** 接上的批次：重复 id 改名的后缀，不随页面重置 */
  let batch = 0
  let loading = false
  let scheduled = false
  let observing = false
  let stopped = false
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  /**
   * 自动点击「加载更多」之后：到时限前、页面把焦点移到这之后加进来的内容时，位置留在原处、焦点还回去（见 onFocusIn）。
   * previous 为点击时有焦点的元素
   */
  let focusGuard: { readonly until: number; readonly previous: Element | null } | undefined
  /** 自动点击之后加进页面的节点（到页面聚焦或时限为止） */
  let addedSinceClick: Node[] = []
  /** 上次自动点贡献动态按钮时页面的滚动位置：之后页面往下滚过这里才再点 */
  let timelineScrollY: number | undefined
  /** 进入了视口、等页面往下滚的贡献动态按钮 */
  let waitingTimeline: HTMLButtonElement | undefined

  function currentUrl(): URL {
    return new URL(doc.location.href)
  }

  /** 元素所在的范围是否开启：侧栏常用存储库的按钮按 sidePanel，其余（含不给元素时）按当前页面 */
  function inScope(element?: Element): boolean {
    const scope: AutoLoadScope = element?.matches(SIDE_PANEL_LOAD_MORE_SELECTOR) ? 'sidePanel' : autoLoadPageScope(currentUrl())
    return scopes().includes(scope)
  }

  function unwatch(element: Element): void {
    watched.get(element)?.()
    watched.delete(element)
  }

  function forget(pagination: Element): void {
    unwatch(pagination)
    states.delete(pagination)
  }

  /** 列表已移除或重新渲染：状态作废，接上的节点去掉，隐藏的分页恢复 */
  function dropStale(): void {
    const stale = new Set<ListState>()
    for (const [pagination, state] of [...states]) {
      const expired = isStale(state)
      if (expired) stale.add(state)
      if (expired || !pagination.isConnected) forget(pagination)
    }
    for (const state of stale) {
      for (const node of state.appended) if (node.isConnected) node.remove()
      for (const nav of state.hidden) if (nav instanceof HTMLElement) showNav(nav)
    }
  }

  function resetIfNavigated(): void {
    const url = currentUrl()
    const path = `${url.origin}${url.pathname}`
    if (path !== pathKey) {
      pathKey = path
      clicksByKind = new Map()
      timelineScrollY = undefined
      waitingTimeline = undefined
    }
    const key = `${path}${url.search}`
    if (key === pageKey) return
    pageKey = key
    loads = 0
  }

  // ---- 「加载更多」按钮 ----

  function clickLoadMore(button: HTMLButtonElement): void {
    unwatch(button)
    if (!options.active() || !inScope(button) || !button.isConnected || button.disabled) return
    const kind = buttonKind(button)
    const count = clicksByKind.get(kind) ?? 0
    if (count >= MAX_AUTO_PAGES) return
    clicksByKind.set(kind, count + 1)
    clickedAt.set(button, now())
    if (button.matches(TIMELINE_LOAD_MORE_SELECTOR)) timelineScrollY = doc.defaultView?.scrollY ?? 0
    focusGuard = { until: now() + FOCUS_GUARD_MS, previous: doc.activeElement }
    addedSinceClick = []
    button.click()
    if (button.matches(REACT_LOAD_MORE_SELECTOR)) scheduleRetry(RECLICK_DELAY_MS)
  }

  /** 贡献动态的按钮可以再点：还没点过，页面往下滚过了上次点击时的位置，或页面不能滚动 */
  function timelineReady(): boolean {
    const view = doc.defaultView
    if (timelineScrollY === undefined || !view) return true
    const scrollable = doc.documentElement.scrollHeight > view.innerHeight
    return !scrollable || view.scrollY > timelineScrollY
  }

  /** 贡献动态的按钮进入视口：可以再点时点，否则等页面往下滚（见 onScroll） */
  function onTimelineVisible(button: HTMLButtonElement): void {
    if (!timelineReady()) {
      waitingTimeline = button
      return
    }
    waitingTimeline = undefined
    clickLoadMore(button)
  }

  /** 页面滚动：等着的贡献动态按钮仍在视口里、页面往下滚过了上次点击时的位置时点 */
  function onScroll(): void {
    const button = waitingTimeline
    const view = doc.defaultView
    if (!button || !view) return
    if (!button.isConnected || !watched.has(button)) {
      waitingTimeline = undefined
      return
    }
    if (!timelineReady() || !inViewport(button, view)) return
    waitingTimeline = undefined
    clickLoadMore(button)
  }

  /** 记下自动点击之后加进页面的节点 */
  function collectAdded(records: readonly MutationRecord[]): void {
    if (!focusGuard) return
    for (const record of records) addedSinceClick.push(...record.addedNodes)
  }

  /**
   * 自动点击后，页面把焦点移到加载的内容（GitHub 的贡献动态聚焦新月份的标题，平滑滚过去，按钮一直在视口附近，接着加载）：
   * 等页面这次聚焦结束（微任务），立即滚回原处、打断平滑滚动；焦点还给原来的元素，原来没有焦点时让新内容失去焦点。
   * 只认这之后加进来的内容（插入的变动还没回调，先取出），用户自己的聚焦不动
   */
  function onFocusIn(event: FocusEvent): void {
    const guard = focusGuard
    const view = doc.defaultView
    const target = event.target
    if (!guard || !view || !(target instanceof HTMLElement)) return
    collectAdded(observer.takeRecords())
    // 取出的变动照常扫描
    schedule()
    if (now() > guard.until) {
      focusGuard = undefined
      addedSinceClick = []
      return
    }
    if (!addedSinceClick.some(node => node.contains(target))) return
    focusGuard = undefined
    addedSinceClick = []
    const left = view.scrollX
    const top = view.scrollY
    queueMicrotask(() => {
      view.scrollTo({ left, top, behavior: 'instant' })
      if (doc.activeElement !== target) return
      const { previous } = guard
      if (previous instanceof HTMLElement && previous !== doc.body && previous.isConnected) previous.focus({ preventScroll: true })
      else target.blur()
    })
  }

  /** 按钮能否（再）点：没点过；React 的按钮点过一会儿后仍在原处也可以 */
  function canClick(button: HTMLButtonElement): boolean {
    if (button.disabled || (clicksByKind.get(buttonKind(button)) ?? 0) >= MAX_AUTO_PAGES) return false
    const at = clickedAt.get(button)
    if (at === undefined) return true
    return button.matches(REACT_LOAD_MORE_SELECTOR) && now() - at >= RECLICK_DELAY_MS
  }

  function watchButtons(): void {
    for (const button of doc.querySelectorAll<HTMLButtonElement>(LOAD_MORE_SELECTOR)) {
      if (watched.has(button) || !canClick(button) || !inScope(button)) continue
      const timeline = button.matches(TIMELINE_LOAD_MORE_SELECTOR)
      watched.set(
        button,
        watch(button, () => (timeline ? onTimelineVisible(button) : clickLoadMore(button)), timeline)
      )
    }
  }

  // ---- 分页列表 ----

  /** 分页对应的列表状态：同一列表的几处分页（宽屏、窄屏、换上的）共用 */
  function stateFor(pagination: Element): ListState | undefined {
    const list = listBefore(pagination, isHiddenNow)
    if (!list) return undefined
    for (const state of states.values()) {
      if (state.list.container === list.container) return state
    }
    const url = currentUrl()
    const link = nextPageLink(pagination)
    const originals = listItems(list.container, list.signature)
    return {
      list,
      path: pathOf(list.container),
      originals,
      firstHref: originals[0] ? firstLink(originals[0]) : '',
      next: link ? nextPageUrl(link, url) : undefined,
      page: currentPageNumber(pagination) ?? pageNumberOf(url) ?? 1,
      appended: [],
      hidden: []
    }
  }

  function watchPaginations(): void {
    for (const pagination of paginations(doc)) {
      if (watched.has(pagination) || pagination.hasAttribute(HIDDEN_NAV_ATTRIBUTE) || !inScope(pagination) || !nextPageLink(pagination)) {
        continue
      }
      let state = states.get(pagination)
      if (!state) {
        const failed = rejected.get(pagination)
        if (failed && (failed.tries >= MAX_LIST_TRIES || now() - failed.at < RETRY_LIST_MS)) continue
        state = stateFor(pagination)
        if (!state) {
          const tries = (failed?.tries ?? 0) + 1
          rejected.set(pagination, { at: now(), tries })
          if (tries < MAX_LIST_TRIES) scheduleRetry(RETRY_LIST_MS)
          continue
        }
        states.set(pagination, state)
      }
      if (!state.next) continue
      const target = state
      watched.set(
        pagination,
        watch(pagination, () => void loadNext(target))
      )
    }
  }

  /** 取回的下一页里的同一列表：按路径找，找不到时从下一页的分页向前找 */
  function locate(next: Document, state: ListState): Element | undefined {
    const byPath = findByPath(next, state.path)
    if (byPath && listItems(byPath, state.list.signature).length > 0) return byPath
    for (const pagination of paginations(next)) {
      const found = listBefore(pagination, element => element.hasAttribute('hidden'))
      if (found?.signature === state.list.signature) return found.container
    }
    return undefined
  }

  /** 去掉已有的（同标识）；返回收进当前文档、重复 id 已改名的节点 */
  function freshNodes(current: readonly Element[], fresh: readonly Element[], suffix: string): Element[] {
    const seen = new Set(current.map(itemKey))
    const nodes = fresh.filter(item => {
      const key = itemKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const adopted = nodes.map(node => adopt(doc, node))
    renameDuplicateIds(doc, adopted, suffix)
    return adopted
  }

  /** 侧栏目录等跟着列表接上的组 */
  function appendExtras(next: Document, state: ListState, suffix: string): void {
    const url = currentUrl()
    for (const group of EXTRA_GROUPS) {
      if (!group.matches(url)) continue
      const current = [...doc.querySelectorAll(group.selector)]
      const last = current[current.length - 1]
      if (!last) continue
      const nodes = freshNodes(current, [...next.querySelectorAll(group.selector)], suffix)
      last.after(...nodes)
      state.appended.push(...nodes)
    }
  }

  /** 换上的分页：收进当前文档，重复的 id 改名；React 客户端分页的 #页码 链接换成带 page 参数的地址 */
  function adoptNav(nav: Element, url: URL, suffix: string): Element {
    const adopted = adopt(doc, nav)
    renameDuplicateIds(doc, [adopted], suffix)
    for (const link of adopted.querySelectorAll('a[href^="#"]')) {
      const target = nextPageUrl(link, url)
      if (target && /^#\d+$/.test(link.getAttribute('href') ?? '')) link.setAttribute('href', target.href)
    }
    return adopted
  }

  /**
   * 分页换成取回那一页的；下一页没有的（最后一页）去掉。React 管理的隐藏，换上的接在其后。
   * 两边分页数不同时只换列表之后的（fetchedAfter：取回页面里列表之后的分页，在列表项移走之前算好）
   */
  function replacePaginations(next: Document, state: ListState, fetchedAfter: readonly Element[], url: URL, suffix: string): void {
    const visible = (pagination: Element): boolean => !pagination.hasAttribute(HIDDEN_NAV_ATTRIBUTE)
    let current = paginations(doc).filter(visible)
    let fetched: readonly Element[] = paginations(next)
    if (current.length !== fetched.length) {
      current = paginationsAfter(doc, state.list).filter(visible)
      fetched = fetchedAfter
    }
    current.forEach((pagination, index) => {
      const replacement = fetched[index] ? adoptNav(fetched[index], url, suffix) : undefined
      const owner = states.get(pagination)
      forget(pagination)
      // 换上的分页沿用同一列表状态（页码、接上的节点）
      if (replacement && (owner === undefined || owner === state)) states.set(replacement, state)
      if (!isReactOwned(pagination)) {
        if (!replacement) {
          pagination.remove()
          return
        }
        pagination.replaceWith(replacement)
        // React 区域里换上的分页：列表作废时去掉（恢复隐藏的 React 分页）
        if (pagination.hasAttribute(PAGE_NAV_ATTRIBUTE)) {
          replacement.setAttribute(PAGE_NAV_ATTRIBUTE, '')
          state.appended.push(replacement)
        }
        return
      }
      if (pagination instanceof HTMLElement) {
        hideNav(pagination)
        state.hidden.push(pagination)
      }
      if (replacement) {
        replacement.setAttribute(PAGE_NAV_ATTRIBUTE, '')
        pagination.after(replacement)
        state.appended.push(replacement)
      }
    })
  }

  /** 接上取回的一页；返回下一页地址（没有了为 undefined） */
  function appendPage(state: ListState, next: Document, url: URL): URL | undefined {
    const nextContainer = locate(next, state)
    if (!nextContainer) return undefined
    const current = listItems(state.list.container, state.list.signature)
    const last = current[current.length - 1]
    if (!last) return undefined
    // 列表之后的分页（下一页地址、页码）：列表项移走之前找
    const after = paginationsAfter(next, { container: nextContainer, signature: state.list.signature })
    const link = after.map(pagination => nextPageLink(pagination)).find(found => found !== undefined)
    const page = after.map(currentPageNumber).find(found => found !== undefined) ?? pageNumberOf(url) ?? state.page + 1
    batch += 1
    const suffix = `-gcn${batch}`
    const nodes = freshNodes(current, listItems(nextContainer, state.list.signature), suffix)
    // 没有新的项：到头了
    if (nodes.length === 0) return undefined
    completeDeferred(doc, nodes, next)
    state.page = page
    const divider = createPageBreak(doc, state.list.container, url, pageLabel(page))
    last.after(divider, ...nodes)
    state.appended.push(divider, ...nodes)
    appendExtras(next, state, suffix)
    replacePaginations(next, state, after, url, suffix)
    return link ? nextPageUrl(link, url) : undefined
  }

  async function loadNext(state: ListState): Promise<void> {
    const url = state.next
    if (!url || loading || stopped || !options.active() || !inScope() || loads >= MAX_AUTO_PAGES) return
    // 只取同站的下一页
    if (url.origin !== currentUrl().origin) {
      state.next = undefined
      return
    }
    loading = true
    loads += 1
    state.next = undefined
    try {
      const html = await options.fetchPage(url.href)
      // 列表已移除或重新渲染（软导航、筛选）：丢弃
      if (stopped || isStale(state)) return
      // 取回期间关闭了自动加载或该页面的范围：丢弃，再开启后重新取
      if (!options.active() || !inScope()) {
        state.next = url
        return
      }
      state.next = appendPage(state, new DOMParser().parseFromString(html, 'text/html'), url)
    } catch (error: unknown) {
      // 取回失败：这一列表不再自动取，分页留给手动翻页
      options.onError?.(error)
    } finally {
      loading = false
      // 分页仍在视口附近时 IntersectionObserver 不会再回调：重新监听
      for (const [pagination, owner] of states) if (owner === state) unwatch(pagination)
      schedule()
    }
  }

  function scan(): void {
    scheduled = false
    // 已移除的、所在范围已关闭的不再监听
    for (const element of [...watched.keys()]) {
      if (!element.isConnected || !inScope(element)) unwatch(element)
    }
    // 开启（且有开启的范围）时才监听 DOM 变动
    setObserving(!stopped && options.active() && scopes().length > 0)
    if (!observing) {
      for (const element of [...watched.keys()]) unwatch(element)
      return
    }
    resetIfNavigated()
    dropStale()
    watchButtons()
    watchPaginations()
  }

  /** 同一轮 DOM 变动只扫描一次 */
  function schedule(): void {
    if (scheduled) return
    scheduled = true
    queueMicrotask(scan)
  }

  /** 过一会儿再扫描：点过的 React 按钮、暂时找不到列表的分页 */
  function scheduleRetry(delay: number): void {
    if (retryTimer !== undefined || stopped) return
    retryTimer = setTimeout(() => {
      retryTimer = undefined
      schedule()
    }, delay)
  }

  const observer = new MutationObserver(records => {
    collectAdded(records)
    schedule()
  })

  function setObserving(on: boolean): void {
    if (on === observing) return
    observing = on
    if (on) observer.observe(doc.documentElement, { childList: true, subtree: true })
    else observer.disconnect()
  }

  doc.addEventListener('focusin', onFocusIn, true)
  doc.defaultView?.addEventListener('scroll', onScroll, { passive: true })
  scan()

  return {
    refresh: scan,
    stop() {
      stopped = true
      if (retryTimer !== undefined) clearTimeout(retryTimer)
      retryTimer = undefined
      focusGuard = undefined
      addedSinceClick = []
      waitingTimeline = undefined
      doc.removeEventListener('focusin', onFocusIn, true)
      doc.defaultView?.removeEventListener('scroll', onScroll)
      setObserving(false)
      for (const element of [...watched.keys()]) unwatch(element)
    }
  }
}
