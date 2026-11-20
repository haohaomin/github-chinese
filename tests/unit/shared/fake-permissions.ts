import { fakeBrowser } from 'wxt/testing/fake-browser'
import { GITHUB_ORIGINS } from '../../../src/shared/github'
import { PAYMENT_FORM_ORIGINS } from '../../../src/shared/payment-form'

type Listener = (permissions: { origins?: string[]; permissions?: string[] }) => void

/** 权限事件：记录监听，trigger 依次调用 */
interface FakeEvent {
  addListener(listener: Listener): void
  removeListener(listener: Listener): void
  hasListener(listener: Listener): boolean
  hasListeners(): boolean
  trigger(origins: string[]): Promise<void>
}

function fakeEvent(): FakeEvent & { readonly listeners: Set<Listener> } {
  const listeners = new Set<Listener>()
  return {
    listeners,
    addListener: listener => void listeners.add(listener),
    removeListener: listener => void listeners.delete(listener),
    hasListener: listener => listeners.has(listener),
    hasListeners: () => listeners.size > 0,
    async trigger(origins) {
      for (const listener of [...listeners]) listener({ origins, permissions: [] })
    }
  }
}

export interface FakePermissions {
  /** 已授予的可选主机权限（清单的主机权限之外），按授予顺序 */
  readonly granted: string[]
  /** 被用户撤销的清单主机权限（付款表单的托管页） */
  readonly withheld: string[]
  /** permissions.request 的结果：授予或拒绝 */
  answer: boolean
  /** 模拟在浏览器的扩展管理里授予（触发 onAdded） */
  grant(origins: readonly string[]): Promise<void>
  /** 模拟在浏览器的扩展管理里撤销（触发 onRemoved） */
  revoke(origins: readonly string[]): Promise<void>
  readonly onAdded: FakeEvent
  readonly onRemoved: FakeEvent
  /** 恢复初始状态：只有清单的主机权限，请求时授予，没有监听 */
  reset(): void
}

/** 清单里可被用户撤销的主机权限（Chrome 的网站访问权限、Firefox 的附加组件管理器）；GitHub 的站点按始终授予 */
const REVOCABLE: readonly string[] = PAYMENT_FORM_ORIGINS

/**
 * fakeBrowser 未实现 permissions：用内存表模拟。清单的 GitHub 站点始终授予，托管页默认授予、可撤销；
 * 可选主机权限按精确的匹配模式记录，已授予的不重复记录、不触发事件（同浏览器）。
 * permissions.remove 移除清单的主机权限时报错（同 Chrome）。直接赋值到 fakeBrowser 上（不是 spy）：
 * vi.restoreAllMocks 不会还原它，用例里对它的 spy 还原后仍是这份实现
 */
export function installFakePermissions(): FakePermissions {
  const granted: string[] = []
  const withheld: string[] = []
  const onAdded = fakeEvent()
  const onRemoved = fakeEvent()
  const state: FakePermissions = {
    granted,
    withheld,
    answer: true,
    async grant(origins) {
      const added = origins.filter(origin => (REVOCABLE.includes(origin) ? withheld.includes(origin) : !granted.includes(origin)))
      withheld.splice(0, withheld.length, ...withheld.filter(origin => !added.includes(origin)))
      granted.push(...added.filter(origin => !REVOCABLE.includes(origin)))
      if (added.length > 0) await onAdded.trigger(added)
    },
    async revoke(origins) {
      const removed = origins.filter(origin => (REVOCABLE.includes(origin) ? !withheld.includes(origin) : granted.includes(origin)))
      withheld.push(...removed.filter(origin => REVOCABLE.includes(origin)))
      granted.splice(0, granted.length, ...granted.filter(origin => !removed.includes(origin)))
      if (removed.length > 0) await onRemoved.trigger(removed)
    },
    onAdded,
    onRemoved,
    reset() {
      granted.splice(0)
      withheld.splice(0)
      state.answer = true
      onAdded.listeners.clear()
      onRemoved.listeners.clear()
    }
  }
  const all = (): string[] => [...GITHUB_ORIGINS, ...REVOCABLE.filter(origin => !withheld.includes(origin)), ...granted]
  Object.assign(fakeBrowser.permissions, {
    contains: async ({ origins = [] }: { origins?: string[] }) => origins.every(origin => all().includes(origin)),
    getAll: async () => ({ permissions: ['storage', 'scripting', 'activeTab'], origins: all() }),
    request: async ({ origins = [] }: { origins?: string[] }) => {
      if (!state.answer) return false
      await state.grant(origins)
      return true
    },
    remove: async ({ origins = [] }: { origins?: string[] }) => {
      if (origins.some(origin => GITHUB_ORIGINS.includes(origin) || REVOCABLE.includes(origin))) {
        throw new Error('You cannot remove required permissions.')
      }
      await state.revoke(origins)
      return true
    },
    onAdded,
    onRemoved
  })
  return state
}

/** 全局的模拟权限：各用例前由 setup.ts 重置 */
export const fakePermissions = installFakePermissions()
