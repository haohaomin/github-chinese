import { computed, onScopeDispose, ref, shallowRef, watch, type ComputedRef, type Ref } from 'vue'
import { browser } from 'wxt/browser'
import { createToastSource } from '../../components/toast'
import { useSettings } from '../../components/useSettings'
import type { MessageKey } from '../../i18n'
import { enterpriseOrigins, enterpriseSiteOf, grantedOrigins, hasGitHubMarkers, isEnterpriseUrl } from '../../shared/enterprise'
import { getExtensionVersion } from '../../shared/extension'
import { GITHUB_ORIGINS, parseGitHubUrl, parseWebUrl } from '../../shared/github'
import { isContentStatus, type ContentStatus } from '../../shared/messages'
import {
  addExcludedPath,
  canExcludePath,
  isPathExcluded,
  removeExcludedPath,
  type Settings,
  type ThemePreference
} from '../../shared/settings'
import { sendToTab } from '../../shared/tab-messages'

/** 当前标签页状态；translation-off：总开关开着、汉化关闭（其他功能照常） */
export type PageState =
  'loading' | 'unauthorized' | 'unavailable' | 'not-ready' | 'translated' | 'excluded' | 'translation-off' | 'disabled'

/** 各状态的文案 */
export const PAGE_STATE_MESSAGE: Readonly<Record<PageState, MessageKey>> = {
  loading: 'stateLoading',
  unauthorized: 'stateUnauthorized',
  unavailable: 'stateUnavailable',
  'not-ready': 'stateNotReady',
  translated: 'stateTranslated',
  excluded: 'stateExcluded',
  'translation-off': 'stateTranslationOff',
  disabled: 'stateDisabled'
}

/** 操作失败时的提示（文案键），显示在页面顶部 */
export type PopupError = 'saveFailed' | 'authorizeFailed' | 'reloadFailed' | 'openFailed'

/** 外观按钮依次切换：自动 → 浅色 → 深色 */
export const NEXT_THEME: Readonly<Record<ThemePreference, ThemePreference>> = {
  auto: 'light',
  light: 'dark',
  dark: 'auto'
}

/** 状态轮询间隔：内容脚本注入、页面跳转后状态随之更新 */
export const STATUS_POLL_MS = 1500

export interface ActiveTab {
  readonly id: number
  readonly url: URL
}

export interface UsePopup {
  readonly version: string
  readonly settings: Readonly<Ref<Settings>>
  /** 设置已读取（或读取失败）；之前显示的是默认值 */
  readonly settingsReady: ComputedRef<boolean>
  readonly tab: Readonly<Ref<ActiveTab | undefined>>
  readonly state: ComputedRef<PageState>
  /** 当前路径命中排除规则 */
  readonly excluded: ComputedRef<boolean>
  readonly canToggleExcluded: ComputedRef<boolean>
  load(): Promise<void>
  refreshStatus(): Promise<void>
  setEnabled(enabled: boolean): Promise<void>
  /** 切换到下一种外观 */
  cycleTheme(): Promise<void>
  toggleExcluded(): Promise<void>
  authorize(): Promise<void>
  reloadTab(): Promise<void>
  /** 打开设置页（排除路径、自定义词条）并关闭弹出页 */
  openOptions(): Promise<void>
}

async function hasHostPermission(): Promise<boolean> {
  try {
    return await browser.permissions.contains({ origins: [...GITHUB_ORIGINS] })
  } catch {
    // 无法判断时按已授权处理，由消息结果决定后续状态
    return true
  }
}

/** 当前标签页（网页）。打开弹出页时有当前页的临时权限（activeTab），企业版站点未授权也读得到地址 */
async function queryActiveTab(): Promise<ActiveTab | undefined> {
  try {
    const [active] = await browser.tabs.query({ active: true, currentWindow: true })
    const url = parseWebUrl(active?.url)
    return active?.id !== undefined && url ? { id: active.id, url } : undefined
  } catch {
    return undefined
  }
}

/** 标签页是否是 GitHub 页面（尚未启用的企业版站点，见 hasGitHubMarkers） */
async function isGitHubPage(tabId: number): Promise<boolean> {
  try {
    const [injection] = await browser.scripting.executeScript({ target: { tabId }, func: hasGitHubMarkers })
    return injection?.result === true
  } catch {
    // 无权访问的页面（浏览器内部页、扩展商店），没有 scripting API
    return false
  }
}

/**
 * 当前标签页所在的站点：GitHub 自己的站点，已授权的企业版站点，未授权的企业版站点（像 GitHub 的页面，带主机名），其他页面
 */
type TabSite = { readonly kind: 'github' | 'enterprise' | 'other' } | { readonly kind: 'pending'; readonly host: string }

async function siteOf(tab: ActiveTab | undefined): Promise<TabSite> {
  if (!tab) return { kind: 'other' }
  if (parseGitHubUrl(tab.url.href)) return { kind: 'github' }
  if (isEnterpriseUrl(tab.url, await grantedOrigins())) return { kind: 'enterprise' }
  const host = enterpriseSiteOf(tab.url.hostname)
  return host && (await isGitHubPage(tab.id)) ? { kind: 'pending', host } : { kind: 'other' }
}

async function requestStatus(tabId: number): Promise<ContentStatus | undefined> {
  try {
    const response = await sendToTab(tabId, 'gcn:get-status')
    return isContentStatus(response) ? response : undefined
  } catch {
    // 内容脚本未注入（如扩展安装前已打开的页面）
    return undefined
  }
}

/** 弹出页逻辑。须在组件 setup 或 effectScope 内调用 */
export function usePopup(): UsePopup {
  const { settings, ready: settingsReady, update } = useSettings()
  const version = getExtensionVersion()
  const checked = ref(false)
  const authorized = ref(true)
  /** 待授权的企业版站点（当前页像 GitHub 页面，站点未授权）：授权时申请它的权限，否则申请 GitHub 的 */
  const pendingHost = ref<string>()
  const tab = shallowRef<ActiveTab>()
  const status = shallowRef<ContentStatus>()
  // 各操作共用一处提示：再次操作时收起上一次的失败提示
  const toast = createToastSource()
  let polling = false

  const state = computed<PageState>(() => {
    if (!checked.value) return 'loading'
    if (!authorized.value) return 'unauthorized'
    if (!tab.value) return 'unavailable'
    if (!status.value) return 'not-ready'
    if (status.value.active) return 'translated'
    if (status.value.excluded) return 'excluded'
    return settings.value.enabled && !settings.value.translation ? 'translation-off' : 'disabled'
  })

  const excluded = computed(() => tab.value !== undefined && isPathExcluded(tab.value.url.pathname, settings.value.excludedPaths))

  const canToggleExcluded = computed(() => tab.value !== undefined && (excluded.value || canExcludePath(tab.value.url.pathname)))

  function fail(reason: PopupError): void {
    toast.show('danger', reason)
  }

  async function load(): Promise<void> {
    const active = await queryActiveTab()
    const site = await siteOf(active)
    pendingHost.value = site.kind === 'pending' ? site.host : undefined
    // 已授权的企业版站点不看 GitHub 的权限；其他页面沿用：GitHub 未授权时提示授权
    authorized.value = site.kind === 'enterprise' || (site.kind !== 'pending' && (await hasHostPermission()))
    tab.value = authorized.value && (site.kind === 'github' || site.kind === 'enterprise') ? active : undefined
    status.value = tab.value ? await requestStatus(tab.value.id) : undefined
    checked.value = true
  }

  async function refreshStatus(): Promise<void> {
    const current = tab.value
    if (!current || polling) return
    polling = true
    try {
      status.value = await requestStatus(current.id)
    } finally {
      polling = false
    }
  }

  async function setEnabled(enabled: boolean): Promise<void> {
    toast.clear()
    if (!(await update({ enabled }))) return fail('saveFailed')
    await refreshStatus()
  }

  async function cycleTheme(): Promise<void> {
    toast.clear()
    if (!(await update({ theme: NEXT_THEME[settings.value.theme] }))) fail('saveFailed')
  }

  async function toggleExcluded(): Promise<void> {
    const current = tab.value
    if (!current || !canToggleExcluded.value) return
    toast.clear()
    const { pathname } = current.url
    const patterns = settings.value.excludedPaths
    const excludedPaths = excluded.value ? removeExcludedPath(patterns, pathname) : addExcludedPath(patterns, pathname)
    if (!(await update({ excludedPaths }))) return fail('saveFailed')
    await refreshStatus()
  }

  async function authorize(): Promise<void> {
    toast.clear()
    // 企业版站点授权后，后台注册内容脚本并注入已打开的该站页面（见 background.ts）
    const origins = pendingHost.value ? enterpriseOrigins(pendingHost.value) : [...GITHUB_ORIGINS]
    try {
      // permissions.request 须在用户手势内调用：这里位于首个 await 之前，点击事件中同步执行
      const granted = await browser.permissions.request({ origins })
      if (granted) await load()
    } catch {
      fail('authorizeFailed')
    }
  }

  async function reloadTab(): Promise<void> {
    const current = tab.value
    if (!current) return
    toast.clear()
    try {
      await browser.tabs.reload(current.id)
    } catch {
      fail('reloadFailed')
    }
  }

  async function openOptions(): Promise<void> {
    try {
      await browser.runtime.openOptionsPage()
      window.close()
    } catch {
      fail('openFailed')
    }
  }

  // 汉化开关在常规区（GeneralSection）：切换后立即查询页面状态，不等下一次轮询
  watch(
    () => settings.value.translation,
    () => void refreshStatus()
  )
  const pollTimer = setInterval(() => void refreshStatus(), STATUS_POLL_MS)
  onScopeDispose(() => {
    clearInterval(pollTimer)
  })
  void load()

  return {
    version,
    settings,
    settingsReady,
    tab,
    state,
    excluded,
    canToggleExcluded,
    load,
    refreshStatus,
    setEnabled,
    cycleTheme,
    toggleExcluded,
    authorize,
    reloadTab,
    openOptions
  }
}
