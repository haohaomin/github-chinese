/**
 * 模拟 @github/relative-time-element：按 datetime 与 lang 把文字渲染进开放 shadowRoot 的 <span part="root">，
 * title 另按 hour-cycle（自身或祖先、<html>，没有时按语言默认）取小时制；
 * 自行维护 title（被改成非本元素按当前 datetime、lang、小时制生成的值后视为自定义，不再更新，datetime 变化也不复位；
 * 移除后复位），渲染后派发 relative-time-updated。
 */
import { TIME_UPDATED_EVENT } from '../../../src/core/time-text'

/** 未设 datetime 时的日期 */
const DEFAULT_DATETIME = '2026-10-26T02:03:00Z'
/** 相对时间的参照时刻：默认日期为3天前 */
const NOW = Date.parse('2026-10-29T02:03:00Z')
const DAY_MS = 86_400_000
/** 时区固定为 GMT+8 */
const OFFSET_MS = 8 * 3_600_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** zh-CN：3天前 / 昨天；zh-TW：3天前 / 昨天；其余：3 days ago / yesterday */
function formatText(time: number, lang: string): string {
  const days = Math.round((NOW - time) / DAY_MS)
  if (lang === 'zh-CN') return days === 1 ? '昨天' : `${days}天前`
  if (lang === 'zh-TW') return days === 1 ? '昨天' : `${days} 天前`
  return days === 1 ? 'yesterday' : `${days} days ago`
}

/**
 * zh-CN：2026年10月26日 GMT+8 10:03；zh-TW：2026年10月26日 上午10:03 [GMT+8]；其余：Oct 26, 2026, 10:03 AM GMT+8。
 * cycle 为 h12 / h23时按该小时制（zh-CN 12小时制：GMT+8上午10:03；zh-TW 24小时制：10:03 [GMT+8]），否则按语言默认
 */
function formatTitle(time: number, lang: string, cycle?: string): string {
  const local = new Date(time + OFFSET_MS)
  const year = local.getUTCFullYear()
  const month = local.getUTCMonth()
  const day = local.getUTCDate()
  const hours = local.getUTCHours()
  const minutes = String(local.getUTCMinutes()).padStart(2, '0')
  const twelve = cycle === undefined ? lang !== 'zh-CN' : cycle === 'h12'
  const meridiem = hours < 12 ? '上午' : '下午'
  const clock = twelve ? `${meridiem}${hours % 12 || 12}:${minutes}` : `${hours}:${minutes}`
  if (lang === 'zh-CN') return `${year}年${month + 1}月${day}日 GMT+8 ${clock}`
  if (lang === 'zh-TW') return `${year}年${month + 1}月${day}日 ${clock} [GMT+8]`
  const english = twelve ? `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}` : `${hours}:${minutes}`
  return `${MONTHS[month]} ${day}, ${year}, ${english} GMT+8`
}

/** 元素按哪种小时制渲染：自身或祖先、<html> 的 hour-cycle（h12 / h23），都没有时按语言默认 */
function hourCycleOf(element: Element): string | undefined {
  const value =
    element.closest('[hour-cycle]')?.getAttribute('hour-cycle') || element.ownerDocument.documentElement.getAttribute('hour-cycle')
  return value === 'h12' || value === 'h23' ? value : undefined
}

export class FakeRelativeTime extends HTMLElement {
  static observedAttributes = ['lang', 'prefix', 'title', 'datetime', 'hour-cycle']
  private customTitle = false
  private updating = false
  private readonly root: ShadowRoot

  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'open' })
  }

  /** shadowRoot 内显示的文字 */
  get renderedText(): string {
    return this.root.textContent ?? ''
  }

  private lang_(): string {
    return this.closest('[lang]')?.getAttribute('lang') || 'en'
  }

  private time_(): number {
    return Date.parse(this.getAttribute('datetime') || DEFAULT_DATETIME)
  }

  connectedCallback(): void {
    this.update()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (name === 'title') this.customTitle = newValue !== null && formatTitle(this.time_(), this.lang_(), hourCycleOf(this)) !== newValue
    if (!this.updating && !(name === 'title' && this.customTitle)) {
      this.updating = true
      queueMicrotask(() => {
        this.update()
        this.updating = false
      })
    }
  }

  /** 定时刷新：元素按间隔重新渲染 */
  tick(): void {
    this.update()
  }

  update(): void {
    const lang = this.lang_()
    const time = this.time_()
    const oldText = this.root.textContent ?? ''
    const oldTitle = this.getAttribute('title') ?? ''
    let newTitle = oldTitle
    if (!this.customTitle) {
      newTitle = formatTitle(time, lang, hourCycleOf(this))
      if (newTitle !== oldTitle) this.setAttribute('title', newTitle)
    }
    const newText = formatText(time, lang)
    let span = this.root.firstElementChild
    if (!span) {
      span = document.createElement('span')
      span.setAttribute('part', 'root')
      this.root.replaceChildren(span)
    }
    if (span.textContent !== newText) span.textContent = newText
    if (newText !== oldText || newTitle !== oldTitle) {
      this.dispatchEvent(new Event(TIME_UPDATED_EVENT, { bubbles: true, composed: true }))
    }
  }
}

export function defineFakeRelativeTime(): void {
  if (!customElements.get('relative-time')) customElements.define('relative-time', FakeRelativeTime)
}

/** 等元素的微任务渲染完成 */
export function settleTime(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}
