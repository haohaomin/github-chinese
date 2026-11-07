import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test as base, chromium, expect, type BrowserContext, type Locator, type Page, type Worker } from '@playwright/test'
import { DEFAULT_AUTO_LOAD_SCOPES } from '../../src/shared/auto-load'
import type { CustomEntries, Settings } from '../../src/shared/settings'

/** 被测扩展目录：默认构建产物 .output/chrome-mv3（bun run build）；E2E_EXTENSION 可指向其他解压目录 */
export const EXTENSION_PATH = resolve(import.meta.dirname, '../..', process.env.E2E_EXTENSION?.trim() || '.output/chrome-mv3')

const FIXTURE_DIR = resolve(import.meta.dirname, 'fixtures')

interface FixtureFile {
  readonly file: string
  readonly contentType: string
}

const HTML = 'text/html; charset=utf-8'

/** 离线夹具：github.com 路径 → 本地文件 */
const FIXTURE_ROUTES: Readonly<Record<string, FixtureFile>> = {
  '/octo-org/hello-world': { file: 'repo.html', contentType: HTML },
  '/octo-org/hello-world/issues': { file: 'issues.html', contentType: HTML },
  '/octo-org/hello-world/pull/1': { file: 'pull.html', contentType: HTML },
  '/settings/apps/fixture-app/permissions': { file: 'app-permissions.html', contentType: HTML },
  '/__fixtures__/github-sim.js': { file: 'github-sim.js', contentType: 'text/javascript; charset=utf-8' },
  '/__fixtures__/github-sim.css': { file: 'github-sim.css', contentType: 'text/css; charset=utf-8' }
}

export const FIXTURE_URL = {
  repo: 'https://github.com/octo-org/hello-world',
  issues: 'https://github.com/octo-org/hello-world/issues',
  pull: 'https://github.com/octo-org/hello-world/pull/1',
  appPermissions: 'https://github.com/settings/apps/fixture-app/permissions'
} as const

/** 与 src/shared/settings.ts 的 DEFAULT_SETTINGS 一致（该模块依赖扩展运行时，不能在 Node 中导入） */
export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  translateTime: true,
  timeFormat: 'default',
  customTimeFormat: 'YYYY-MM-DD HH:mm',
  translateTitle: true,
  excludedPaths: [],
  language: 'auto',
  uiLanguage: 'auto',
  theme: 'auto',
  accelerate: false,
  accelerateImages: false,
  failover: false,
  purifySearch: true,
  purifyBuiltin: true,
  autoLoad: false,
  autoLoadScopes: DEFAULT_AUTO_LOAD_SCOPES,
  imagePreview: false,
  folderDownload: true,
  downloadCount: false,
  newTab: false,
  newTabScopes: ['external', 'search'],
  newTabPaths: [],
  chineseReadme: false,
  categories: [],
  categoryOrder: [],
  removedCategories: [],
  customSources: [],
  removedSources: [],
  replaceCategory: ''
}

/** 中日韩统一表意文字（含扩展 A 区） */
export const CJK = /[\u3400-\u9fff]/

export function readFixture(file: string): Promise<string> {
  return readFile(resolve(FIXTURE_DIR, file), 'utf8')
}

/** 夹具中 <script type="application/json"> 的原文 */
export function extractJsonScripts(html: string): string[] {
  const pattern = /<script\b[^>]*\btype="application\/json"[^>]*>([\s\S]*?)<\/script>/g
  return [...html.matchAll(pattern)].map(match => match[1]!)
}

/** 夹具中 <title> 的文本（与 document.title 一样合并空白） */
export function extractTitle(html: string): string {
  return (/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? '').replace(/\s+/g, ' ').trim()
}

/** 存储库标签页文字（data-tab-item：code、issues、pull-requests…） */
export function repoTab(page: Page, item: string): Locator {
  return page.locator(`[data-tab-item="${item}"] [data-component="text"]`)
}

/** 夹具元素（data-fx） */
export function fx(page: Page, name: string): Locator {
  return page.locator(`[data-fx="${name}"]`)
}

/** 用本地夹具应答 github.com 请求；未登记的路径返回 404 */
export async function serveFixtures(context: BrowserContext): Promise<void> {
  await context.route('https://github.com/**', async route => {
    const { pathname } = new URL(route.request().url())
    const entry = FIXTURE_ROUTES[pathname.replace(/\/+$/, '')]
    if (!entry) {
      await route.fulfill({ status: 404, contentType: 'text/plain; charset=utf-8', body: 'Not Found' })
      return
    }
    await route.fulfill({ status: 200, contentType: entry.contentType, body: await readFixture(entry.file) })
  })
}

/** 等夹具脚本完成 React 改写与动态插入（见 fixtures/github-sim.js） */
export async function waitForSimulation(page: Page): Promise<void> {
  await expect(page.locator('body')).toHaveAttribute('data-fx-rewritten', 'true')
  await expect(page.locator('body')).toHaveAttribute('data-fx-dynamic', 'true')
}

type StorageAreaName = 'sync' | 'local'

/** 内容脚本状态（与 src/shared/messages.ts 的 ContentStatus 对应） */
export interface ContentStatusLike {
  readonly active: boolean
  readonly excluded: boolean
  readonly pages: readonly string[]
}

/** 扩展页面上下文中可用的 chrome API 子集 */
interface ChromeLike {
  readonly storage: Record<
    StorageAreaName,
    {
      set(items: Record<string, unknown>): Promise<void>
      get(keys: string | string[]): Promise<Record<string, unknown>>
    }
  >
  readonly tabs: {
    query(info: { url: string }): Promise<Array<{ id?: number }>>
    sendMessage(tabId: number, message: unknown): Promise<unknown>
  }
  readonly runtime: {
    sendMessage(message: unknown): Promise<unknown>
    getContexts(filter: { contextTypes: string[] }): Promise<unknown[]>
  }
}

/** 通过扩展页面读写 chrome.storage */
export interface ExtensionControl {
  readonly page: Page
  /** 写入 chrome.storage.sync 的 settings（在默认设置上合并） */
  setSettings(patch: Partial<Settings>): Promise<void>
  /** 写入 chrome.storage.local 的 customEntries，并像设置页一样通知后台转发给已打开的页面 */
  setCustomEntries(entries: CustomEntries): Promise<void>
  /** 读取 chrome.storage.sync 的 settings 原始值 */
  readSettings(): Promise<unknown>
  /** 向匹配 url 的标签页发送 gcn:get-status；无标签页或无应答时返回 undefined */
  status(url: string): Promise<ContentStatusLike | undefined>
  /** 扩展的 Service Worker；找不到时抛错 */
  serviceWorker(): Worker
  /**
   * 停止扩展的 Service Worker（模拟空闲回收），确认已停止才返回；之后的消息、事件会重新唤醒它。
   * Playwright 停止、重启前后沿用同一个 Worker 对象，不发 close、serviceworker 事件
   */
  stopServiceWorker(): Promise<void>
}

/** 等扩展 Service Worker 停止的时限 */
const SERVICE_WORKER_STOP_TIMEOUT_MS = 10_000

function createControl(page: Page): ExtensionControl {
  const serviceWorker = (): Worker => {
    // chrome-extension: 不是特殊协议，Node 中 URL.origin 为 "null"：按扩展 ID 拼前缀
    const prefix = `chrome-extension://${new URL(page.url()).host}/`
    // 取最新加入的
    const worker = page
      .context()
      .serviceWorkers()
      .findLast(item => item.url().startsWith(prefix))
    if (!worker) throw new Error('未找到扩展的 Service Worker')
    return worker
  }

  const write = (area: StorageAreaName, items: Record<string, unknown>): Promise<void> =>
    page.evaluate(
      async ({ name, values }) => {
        const { chrome } = globalThis as unknown as { chrome: ChromeLike }
        await chrome.storage[name].set(values)
      },
      { name: area, values: items }
    )

  /** 后台是否在 runtime.getContexts 中：只列出活动的上下文，停止后不在其中 */
  const backgroundRunning = (): Promise<boolean> =>
    page.evaluate(async () => {
      const { chrome } = globalThis as unknown as { chrome: ChromeLike }
      return (await chrome.runtime.getContexts({ contextTypes: ['BACKGROUND'] })).length > 0
    })

  return {
    page,
    setSettings: patch => write('sync', { settings: { ...DEFAULT_SETTINGS, ...patch } }),
    setCustomEntries: entries =>
      page.evaluate(async values => {
        const { chrome } = globalThis as unknown as { chrome: ChromeLike }
        await chrome.storage.local.set({ customEntries: values })
        await chrome.runtime.sendMessage({ type: 'gcn:custom-entries-saved' })
      }, entries),
    readSettings: () =>
      page.evaluate(async () => {
        const { chrome } = globalThis as unknown as { chrome: ChromeLike }
        return (await chrome.storage.sync.get('settings')).settings
      }),
    status: url =>
      page.evaluate(async target => {
        const { chrome } = globalThis as unknown as { chrome: ChromeLike }
        const [tab] = await chrome.tabs.query({ url: target })
        if (tab?.id === undefined) return undefined
        try {
          return (await chrome.tabs.sendMessage(tab.id, { type: 'gcn:get-status' })) as ContentStatusLike | undefined
        } catch {
          return undefined
        }
      }, url),
    serviceWorker,
    stopServiceWorker: async () => {
      const url = serviceWorker().url()
      const session = await page.context().newCDPSession(page)
      /** 运行中的扩展 Service Worker 的 CDP 目标 ID；已停止的不在目标列表中 */
      const runningTargetId = async (): Promise<string | undefined> => {
        const { targetInfos } = await session.send('Target.getTargets')
        return targetInfos.find(info => info.type === 'service_worker' && info.url === url)?.targetId
      }
      try {
        const targetId = await runningTargetId()
        if (!targetId) throw new Error('未找到扩展的 Service Worker 目标')
        // 停止前列出过后台，才用 runtime.getContexts 判断
        const listed = await backgroundRunning().catch(() => false)
        // 关闭 Service Worker 目标：与浏览器空闲回收一样终止，下一条消息、事件重新启动它
        await session.send('Target.closeTarget', { targetId })
        // 目标列表、runtime.getContexts 任一处已没有它即已停止
        await expect
          .poll(async () => (await runningTargetId()) === undefined || (listed && !(await backgroundRunning())), {
            message: 'Service Worker 未停止',
            timeout: SERVICE_WORKER_STOP_TIMEOUT_MS
          })
          .toBe(true)
      } finally {
        await session.detach()
      }
    }
  }
}

interface ExtensionFixtures {
  /** 扩展 ID（取自 service worker URL） */
  extensionId: string
  /** 已打开 popup.html 的扩展页面，用于读写存储 */
  extension: ExtensionControl
}

/** 加载 .output/chrome-mv3 的测试；每个测试使用全新的浏览器配置 */
export const test = base.extend<ExtensionFixtures>({
  context: async ({ headless }, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless,
      locale: 'en-US',
      viewport: { width: 1440, height: 900 },
      // 浏览器界面语言用简体中文：扩展界面（自动识别）与页面翻译语言都按简体，断言的界面文字与之对应
      args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`, '--lang=zh-CN']
    })
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
    await use(new URL(worker.url()).host)
  },
  extension: async ({ context, extensionId }, use) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await use(createControl(page))
  }
})

/** 离线夹具测试：github.com 请求全部由 tests/e2e/fixtures 应答 */
export const offlineTest = test.extend({
  context: async ({ context }, use) => {
    await serveFixtures(context)
    await use(context)
  }
})

export { expect }
