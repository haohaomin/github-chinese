import { browser, type Browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'
import type { ScriptPublicPath } from 'wxt/utils/inject-script'
import { PROBE_DEPS } from '../shared/accelerate'
import { listSources } from '../shared/accelerate-categories'
import { syncBadge } from '../shared/badge'
import { enterpriseMatches, grantedOrigins, isEnterpriseUrl } from '../shared/enterprise'
import { BRIDGE_SCRIPT_FILE, CONTENT_SCRIPT_FILE, syncEnterpriseScripts } from '../shared/enterprise-scripts'
import { isFirefoxBuild } from '../shared/extension'
import { parseGitHubUrl, parseWebUrl } from '../shared/github'
import { API_DEPS, createReleaseCountsService, fetchReleaseCounts, readGitHubToken } from '../shared/github-api'
import { fetchImage, IMAGE_FETCH_DEPS } from '../shared/image-fetcher'
import { applyLegacySettingValues, removeLegacyUntranslated } from '../shared/legacy-storage'
import type { PageLocale } from '../shared/locale'
import { LOCALE_SCRIPT_FILES } from '../shared/locale-loader'
import { syncLocaleScript } from '../shared/locale-script'
import { isBackgroundMessage, isContentStatus, toReleaseCountsResponse, type ContentMessage } from '../shared/messages'
import { getSettings, watchSettings, type Settings } from '../shared/settings'
import { createSourceHealthMonitor, SESSION_HEALTH_STORE } from '../shared/source-health'

type MessageSender = Browser.runtime.MessageSender

function reportError(error: unknown): void {
  console.error('[GitHub 中文化]', error)
}

/** 动态注册的排队：词典脚本、企业版站点的内容脚本依次注册、更新、注销，不并发（并发注册同一 ID 会报错） */
let scriptSync: Promise<void> = Promise.resolve()

/**
 * 按设置与已授权的企业版站点同步动态注册（见 shared/locale-script、shared/enterprise-scripts）；不传设置时读存储。
 * 返回本次同步落定的 Promise（不抛出）
 */
function scheduleScriptSync(settings?: Settings): Promise<void> {
  scriptSync = scriptSync
    .then(async () => {
      const [current, origins] = await Promise.all([settings ?? getSettings(), grantedOrigins()])
      const matches = enterpriseMatches(origins)
      await syncLocaleScript(current, matches).catch(reportError)
      await syncEnterpriseScripts(matches)
    })
    .catch(reportError)
  return scriptSync
}

/** 按存储中的设置刷新徽标 */
function syncBadgeFromStorage(): Promise<void> {
  return getSettings().then(syncBadge).catch(reportError)
}

/** 地址在已授权的企业版站点上；enterprise 为企业版站点的匹配模式（见 shared/enterprise） */
function onEnterprise(url: string | undefined, enterprise: readonly string[]): boolean {
  const parsed = parseWebUrl(url)
  return parsed !== undefined && isEnterpriseUrl(parsed, enterprise)
}

/** 地址在 GitHub 自己的站点，或已授权的企业版站点上 */
function onGitHub(url: string | undefined, enterprise: readonly string[]): boolean {
  return parseGitHubUrl(url) !== undefined || onEnterprise(url, enterprise)
}

/** 来自本扩展在标签页里的内容脚本 */
function fromOwnTab(sender: MessageSender): boolean {
  return sender.id === browser.runtime.id && sender.tab !== undefined
}

/** 来自 GitHub 页面（含已授权的企业版站点）的内容脚本 */
async function fromGitHubTab(sender: MessageSender): Promise<boolean> {
  if (!fromOwnTab(sender)) return false
  return parseGitHubUrl(sender.url) !== undefined || onEnterprise(sender.url, enterpriseMatches(await grantedOrigins()))
}

type SendResponse = (response: unknown) => void

/** 应答内容脚本的请求：不是来自 GitHub 页面时应答 ok: false；处理出错时记录错误，应答 ok: false */
function answerGitHubTab(sender: MessageSender, sendResponse: SendResponse, handle: () => Promise<unknown>): true {
  fromGitHubTab(sender)
    .then(trusted => (trusted ? handle() : { ok: false }))
    .then(sendResponse, (error: unknown) => {
      reportError(error)
      sendResponse({ ok: false })
    })
  return true
}

/** 来自本扩展的页面（popup、设置页） */
function fromExtensionPage(sender: MessageSender): boolean {
  return sender.id === browser.runtime.id && (sender.url?.startsWith(browser.runtime.getURL('/')) ?? false)
}

/** 通知所有 GitHub 标签页（含企业版站点）的内容脚本；未注入内容脚本的标签页忽略 */
async function notifyGitHubTabs(message: ContentMessage): Promise<void> {
  const enterprise = enterpriseMatches(await grantedOrigins())
  // 有主机权限的页面才带 url。url 不可见的也发：撤销站点权限后，已注入的内容脚本仍在运行到刷新
  const tabs = (await browser.tabs.query({})).filter(
    tab => tab.id !== undefined && (tab.url === undefined || onGitHub(tab.url, enterprise))
  )
  await Promise.all(tabs.map(tab => browser.tabs.sendMessage(tab.id!, message).catch(() => undefined)))
}

const CONTENT_SCRIPT_FILES: ScriptPublicPath[] = [CONTENT_SCRIPT_FILE]
const BRIDGE_SCRIPT_FILES: ScriptPublicPath[] = [BRIDGE_SCRIPT_FILE]

/**
 * 标签页里已有本版本的内容脚本在运行（更新时正在加载的页面已由清单注入）：能应答状态查询。
 * 还在读存储的内容脚本也已注册监听，启动完成后应答
 */
async function hasLiveContentScript(tabId: number): Promise<boolean> {
  const request: ContentMessage = { type: 'gcn:get-status' }
  try {
    return isContentStatus(await browser.tabs.sendMessage(tabId, request))
  } catch {
    // 没有接收方：未注入，或只有已失效的旧版本
    return false
  }
}

/** 先注入主世界桥接：新内容脚本启动时旧实例还原、派发重置事件，要有桥接接收 */
async function injectIntoTab(tabId: number): Promise<void> {
  if (await hasLiveContentScript(tabId)) return
  const target = { tabId }
  // 立即注入：缺省要等到 document_idle，仍在加载的页面会先显示英文
  await browser.scripting
    .executeScript({ target, files: BRIDGE_SCRIPT_FILES, world: 'MAIN', injectImmediately: true })
    .catch(() => undefined)
  await browser.scripting.executeScript({ target, files: CONTENT_SCRIPT_FILES, injectImmediately: true }).catch(() => undefined)
}

/**
 * 把词典脚本注入内容脚本所在的框架（内容脚本动态导入失败时的退路，Firefox 同样适用）。
 * 没有 scripting API 时返回 false
 */
async function injectLocale(tabId: number, frameId: number, locale: PageLocale): Promise<boolean> {
  if (typeof browser.scripting?.executeScript !== 'function') return false
  const files = [LOCALE_SCRIPT_FILES[locale] as ScriptPublicPath]
  // 内容脚本已在等待：立即注入，不等 document_idle
  await browser.scripting.executeScript({ target: { tabId, frameIds: [frameId] }, files, injectImmediately: true })
  return true
}

/** 向已打开的、地址符合 matches 的标签页注入；休眠的标签页不注入（恢复时重新加载，自动注入） */
async function injectIntoTabs(matches: (url: string | undefined) => boolean): Promise<void> {
  if (typeof browser.scripting?.executeScript !== 'function') return
  const tabs = (await browser.tabs.query({})).filter(tab => tab.id !== undefined && !tab.discarded && matches(tab.url))
  await Promise.all(tabs.map(tab => injectIntoTab(tab.id!)))
}

/**
 * 扩展安装、更新后向已打开的 GitHub 页面注入内容脚本与桥接：Chromium 不自动注入，旧内容脚本失效后页面还原为英文。
 * Safari 同样注入（已有本版本内容脚本的标签页跳过）。Firefox 自动注入清单里的内容脚本，GitHub 页面再注入会出现两个实例：
 * 只注入企业版站点（动态注册的脚本不自动注入已打开的页面）
 */
async function injectIntoOpenTabs(): Promise<void> {
  const enterprise = enterpriseMatches(await grantedOrigins())
  const matches = isFirefoxBuild() ? onEnterprise : onGitHub
  await injectIntoTabs(url => matches(url, enterprise))
}

/** 新授权的企业版站点：注册落定后向已打开的该站页面注入（各浏览器都是：动态注册的脚本不自动注入已打开的页面） */
async function injectIntoGrantedTabs(origins: readonly string[]): Promise<void> {
  const enterprise = enterpriseMatches(origins)
  if (enterprise.length > 0) await injectIntoTabs(url => onEnterprise(url, enterprise))
}

export default defineBackground(() => {
  // 加速源的探测：结果在有效期内缓存，并存入会话存储（Service Worker 重启后照用）
  const sourceHealth = createSourceHealthMonitor(PROBE_DEPS, SESSION_HEALTH_STORE)
  // 下载次数：各标签页共用缓存与限额状态；令牌每次请求前读取，只在后台使用（见 shared/github-api）
  const releaseCounts = createReleaseCountsService({
    fetchCounts: (release, token) => fetchReleaseCounts(release, token, API_DEPS),
    token: readGitHubToken,
    now: API_DEPS.now
  })
  // 事件监听须在顶层同步注册，Service Worker 被唤醒时才能收到事件
  // 自定义词条、屏蔽规则由设置页保存后发消息，这里转发给各 GitHub 标签页
  browser.runtime.onMessage.addListener((message: unknown, sender: MessageSender, sendResponse) => {
    if (!isBackgroundMessage(message)) return undefined
    switch (message.type) {
      case 'gcn:custom-entries-saved':
        if (!fromExtensionPage(sender)) return undefined
        notifyGitHubTabs({ type: 'gcn:custom-entries-changed' }).catch(reportError)
        sendResponse({ ok: true })
        return undefined
      case 'gcn:search-rules-saved':
        if (!fromExtensionPage(sender)) return undefined
        notifyGitHubTabs({ type: 'gcn:search-rules-changed' }).catch(reportError)
        sendResponse({ ok: true })
        return undefined
      // 以下来自内容脚本：标签页外（扩展页面）、其他扩展发来的不处理；其余是否来自 GitHub 页面（企业版站点要查授权）在应答前判断
      case 'gcn:inject-locale': {
        const tabId = sender.tab?.id
        if (!fromOwnTab(sender) || tabId === undefined) return undefined
        return answerGitHubTab(sender, sendResponse, async () => ({ ok: await injectLocale(tabId, sender.frameId ?? 0, message.locale) }))
      }
      case 'gcn:probe-sources':
        if (!fromOwnTab(sender)) return undefined
        return answerGitHubTab(sender, sendResponse, async () => {
          const settings = await getSettings()
          // 只在开启下载加速与故障转移时探测：关闭时不向加速源发请求
          const active = settings.enabled && settings.accelerate && settings.failover
          return { ok: true, health: active ? await sourceHealth.check(listSources(settings)) : {} }
        })
      case 'gcn:fetch-image':
        if (!fromOwnTab(sender)) return undefined
        return answerGitHubTab(sender, sendResponse, async () => {
          const url = await fetchImage(message.url, await getSettings(), { ...IMAGE_FETCH_DEPS, rank: sourceHealth.rank })
          return url ? { ok: true, url } : { ok: false }
        })
      case 'gcn:release-counts':
        if (!fromOwnTab(sender)) return undefined
        return answerGitHubTab(sender, sendResponse, async () => {
          const settings = await getSettings()
          // 只在开启下载次数时请求
          if (!settings.enabled || !settings.downloadCount) return { ok: false }
          return toReleaseCountsResponse(await releaseCounts.get({ owner: message.owner, repo: message.repo, tag: message.tag }))
        })
    }
  })
  // 企业版站点的授权、撤销（弹出页、设置页、浏览器的扩展管理）：同步注册；新授权的站点注入已打开的页面
  browser.permissions?.onAdded?.addListener(({ origins }) => {
    if (!origins?.length) return
    scheduleScriptSync()
      .then(() => injectIntoGrantedTabs(origins))
      .catch(reportError)
  })
  browser.permissions?.onRemoved?.addListener(({ origins }) => {
    if (origins?.length) void scheduleScriptSync()
  })
  // 浏览器重启或扩展更新后徽标会重置。旧版本的未翻译文本：更新时删除，启动时再删一次（更新时没删成的）
  browser.runtime.onStartup.addListener(() => {
    void syncBadgeFromStorage()
    removeLegacyUntranslated().catch(reportError)
  })
  browser.runtime.onInstalled.addListener(({ reason }) => {
    void syncBadgeFromStorage()
    // 安装、更新扩展时浏览器清空注册（Chromium、Firefox 都是），在此与顶层同步补回
    void scheduleScriptSync()
    if (reason === 'install' || reason === 'update') injectIntoOpenTabs().catch(reportError)
    if (reason === 'update') {
      removeLegacyUntranslated().catch(reportError)
      // 设置中旧版本的「收集未翻译」开关改为关闭：同步到未更新的旧版本，它们随之停止收集
      applyLegacySettingValues().catch(reportError)
    }
  })
  watchSettings(settings => {
    syncBadge(settings).catch(reportError)
    void scheduleScriptSync(settings)
  })
  // 浏览器语言变化：自动识别的翻译语言随之变化，按新语言注册
  globalThis.addEventListener('languagechange', () => void scheduleScriptSync())
  void syncBadgeFromStorage()
  void scheduleScriptSync()
})
