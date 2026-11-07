import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import background from '../../src/entrypoints/background'
import { BUILTIN_SOURCES } from '../../src/shared/accelerate'
import { enterpriseOrigins } from '../../src/shared/enterprise'
import { ENTERPRISE_BRIDGE_ID, ENTERPRISE_CONTENT_ID } from '../../src/shared/enterprise-scripts'
import { GITHUB_ORIGINS } from '../../src/shared/github'
import { githubTokenItem } from '../../src/shared/github-api'
import { DEFAULT_SETTINGS, settingsItem, updateSettings } from '../../src/shared/settings'
import { LOCALE_SCRIPT_ID } from '../../src/shared/locale-script'
import { removeApi } from './shared/fake-api'
import { fakePermissions } from './shared/fake-permissions'
import { fakeContentScripts, type FakeContentScripts } from './shared/fake-scripting'

/** 界面语言为简体中文时停用的徽标文字 */
const BADGE_OFF = '关'

async function badgeText(): Promise<string> {
  return fakeBrowser.action.getBadgeText({})
}

/** 等待存储事件与异步回调完成 */
async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

type Sender = Browser.runtime.MessageSender

/** GitHub 页面上的内容脚本 */
function githubTab(frameId = 0): Sender {
  return {
    id: fakeBrowser.runtime.id,
    url: 'https://github.com/vuejs/core',
    frameId,
    tab: { id: 7, incognito: false } as Browser.tabs.Tab
  }
}

/** 企业版站点 */
const ENTERPRISE_HOST = 'github.example.com'
const ENTERPRISE_ORIGINS = enterpriseOrigins(ENTERPRISE_HOST)

/** 企业版站点页面上的内容脚本（站点授权与否由用例决定） */
function enterpriseTab(frameId = 0): Sender {
  return { ...githubTab(frameId), url: `https://${ENTERPRISE_HOST}/octocat/hello-world` }
}

/** 其他网站上的发送方 */
function otherSite(): Sender {
  return { ...githubTab(), url: 'https://example.com/' }
}

/** 发消息给后台：handled 为监听器是否保持消息通道，保持时一并等到应答 */
async function deliver(message: unknown, sender: Sender): Promise<{ handled: boolean; response?: unknown }> {
  let respond: (value: unknown) => void = () => undefined
  const response = new Promise(resolve => {
    respond = resolve
  })
  const results: unknown[] = await fakeBrowser.runtime.onMessage.trigger(message, sender, respond)
  const handled = results.some(result => result === true)
  return handled ? { handled, response: await response } : { handled }
}

/** 动态注册的内容脚本（fakeBrowser 未实现，用内存表模拟） */
let scripts: FakeContentScripts

beforeEach(() => {
  fakeBrowser.reset()
  // fakeBrowser 未实现 executeScript：默认成功
  vi.spyOn(fakeBrowser.scripting, 'executeScript').mockImplementation((async () => []) as never)
  scripts = fakeContentScripts()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('background', () => {
  it('启动时按设置同步徽标', async () => {
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, enabled: false, uiLanguage: 'zh-CN' })
    background.main()
    await settle()
    expect(await badgeText()).toBe(BADGE_OFF)
  })

  it('启用时徽标为空', async () => {
    background.main()
    await settle()
    expect(await badgeText()).toBe('')
  })

  it('不注册快捷键命令', () => {
    const listen = vi.spyOn(fakeBrowser.commands.onCommand, 'addListener').mockImplementation(() => undefined)
    background.main()
    expect(listen).not.toHaveBeenCalled()
  })

  it('启动时注册当前语言的词典脚本；改语言时更新，关闭总开关时注销', async () => {
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, language: 'zh-CN' })
    background.main()
    await settle()
    expect(scripts.registered).toEqual([expect.objectContaining({ id: LOCALE_SCRIPT_ID, js: ['locale-zh-cn.js'] })])
    await updateSettings({ language: 'zh-TW' })
    await settle()
    expect(scripts.registered).toEqual([expect.objectContaining({ id: LOCALE_SCRIPT_ID, js: ['locale-zh-tw.js'] })])
    await updateSettings({ enabled: false })
    await settle()
    expect(scripts.registered).toEqual([])
  })

  it('安装时两次同步只注册一次、不更新；Service Worker 重启后不更新；重启浏览器后注册仍在', async () => {
    background.main()
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'install' } as never)
    await settle()
    expect(fakeBrowser.scripting.registerContentScripts).toHaveBeenCalledTimes(1)
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
    // Service Worker 闲置停止后被唤醒：重新执行顶层代码
    background.main()
    await settle()
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
    scripts.restart()
    expect(scripts.registered).toEqual([
      expect.objectContaining({ id: LOCALE_SCRIPT_ID, js: ['locale-zh-cn.js'], persistAcrossSessions: true })
    ])
  })

  it('更新扩展时浏览器清空注册：新版本启动与更新事件的同步补回，只注册一次', async () => {
    background.main()
    await settle()
    expect(scripts.registered).toHaveLength(1)
    scripts.updateExtension()
    vi.mocked(fakeBrowser.scripting.registerContentScripts).mockClear()
    // 新版本的 Service Worker：执行顶层代码，随后收到更新事件
    background.main()
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'update' } as never)
    await settle()
    expect(fakeBrowser.scripting.registerContentScripts).toHaveBeenCalledTimes(1)
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
    expect(scripts.registered).toEqual([
      expect.objectContaining({ id: LOCALE_SCRIPT_ID, js: ['locale-zh-cn.js'], persistAcrossSessions: true })
    ])
  })

  it('改语言后重启浏览器：注册仍在', async () => {
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, language: 'zh-CN' })
    background.main()
    await settle()
    await updateSettings({ language: 'zh-TW' })
    await settle()
    scripts.restart()
    expect(scripts.registered).toEqual([expect.objectContaining({ js: ['locale-zh-tw.js'], persistAcrossSessions: true })])
  })

  it('浏览器语言变化：按新语言重新注册（语言自动）', async () => {
    let languageChange: (() => void) | undefined
    const addEventListener = globalThis.addEventListener.bind(globalThis)
    vi.spyOn(globalThis, 'addEventListener').mockImplementation(((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === 'languagechange') languageChange = listener as () => void
      else addEventListener(type, listener)
    }) as never)
    const accept = vi.spyOn(fakeBrowser.i18n, 'getAcceptLanguages').mockResolvedValue(['zh-CN'] as never)
    background.main()
    await settle()
    expect(scripts.registered).toEqual([expect.objectContaining({ js: ['locale-zh-cn.js'] })])
    accept.mockResolvedValue(['zh-HK', 'zh-CN'] as never)
    languageChange!()
    await settle()
    expect(scripts.registered).toEqual([expect.objectContaining({ js: ['locale-zh-tw.js'], persistAcrossSessions: true })])
  })

  it('设置变化时同步徽标', async () => {
    background.main()
    await settle()
    await updateSettings({ enabled: false, uiLanguage: 'zh-CN' })
    await settle()
    expect(await badgeText()).toBe(BADGE_OFF)
  })

  it('浏览器启动与扩展安装 / 更新时重新同步，不打开页面', async () => {
    const createTab = vi.spyOn(fakeBrowser.tabs, 'create')
    background.main()
    await settle()

    await settingsItem.setValue({ ...DEFAULT_SETTINGS, enabled: false, uiLanguage: 'zh-CN' })
    await fakeBrowser.action.setBadgeText({ text: '' })
    await fakeBrowser.runtime.onStartup.trigger()
    await settle()
    expect(await badgeText()).toBe(BADGE_OFF)

    await fakeBrowser.action.setBadgeText({ text: '' })
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'install' } as never)
    await settle()
    expect(await badgeText()).toBe(BADGE_OFF)
    expect(createTab).not.toHaveBeenCalled()
  })

  it('存储失败时记录错误，不抛出', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(fakeBrowser.storage.sync, 'get').mockRejectedValue(new Error('存储不可用'))
    expect(() => background.main()).not.toThrow()
    await settle()
    expect(consoleError).toHaveBeenCalled()
  })
})

describe('旧版本的未翻译文本', () => {
  type Sender = Browser.runtime.MessageSender

  /** 旧版本存下的未翻译文本：一条记录一个键，另有条数、清空代次与更早的整体存储 */
  const LEGACY_UNTRANSLATED = {
    'untranslated:Open issues': { count: 2, kinds: 1, seen: 1, pages: { issues: 1 } },
    untranslatedMeta: { count: 1, full: false },
    untranslatedEpoch: 2,
    untranslated: { records: [] }
  }
  const CUSTOM_ENTRIES = { customEntries: { Issues: '议题' } }

  function githubTab(): Sender {
    return {
      id: fakeBrowser.runtime.id,
      url: 'https://github.com/vuejs/core/issues',
      frameId: 0,
      tab: { id: 1, incognito: false } as Browser.tabs.Tab
    }
  }

  function extensionPage(): Sender {
    return { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/popup.html') }
  }

  /** 投递消息：handled 为监听器是否保持消息通道，responded 为是否已应答 */
  async function deliver(message: unknown, sender: Sender): Promise<{ handled: boolean; responded: boolean }> {
    const respond = vi.fn()
    const results: unknown[] = await fakeBrowser.runtime.onMessage.trigger(message, sender, respond)
    return { handled: results.some(result => result === true), responded: respond.mock.calls.length > 0 }
  }

  async function update(): Promise<void> {
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'update' } as never)
    await settle()
  }

  it.each<[string, unknown, () => Sender]>([
    ['内容脚本上报', { type: 'gcn:report-untranslated', items: [['Open issues', 'issues', 1, 2, 1]] }, githubTab],
    ['扩展页面请求清空', { type: 'gcn:clear-untranslated' }, extensionPage]
  ])('%s：不处理、不应答，不写存储、不通知标签页', async (_name, message, sender) => {
    background.main()
    await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    const notify = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    expect(await deliver(message, sender())).toEqual({ handled: false, responded: false })
    await settle()
    expect(await fakeBrowser.storage.local.get(null)).toEqual({})
    expect(notify).not.toHaveBeenCalled()
  })

  it('扩展更新时删除，自定义词条保留', async () => {
    await fakeBrowser.storage.local.set({ ...LEGACY_UNTRANSLATED, ...CUSTOM_ENTRIES })
    background.main()
    await update()
    expect(await fakeBrowser.storage.local.get(null)).toEqual(CUSTOM_ENTRIES)
  })

  it('浏览器启动时再删一次（更新时没删成的）', async () => {
    background.main()
    await fakeBrowser.storage.local.set({ ...LEGACY_UNTRANSLATED, ...CUSTOM_ENTRIES })
    await fakeBrowser.runtime.onStartup.trigger()
    await settle()
    expect(await fakeBrowser.storage.local.get(null)).toEqual(CUSTOM_ENTRIES)
  })

  it('扩展安装、Service Worker 重启时不删除', async () => {
    await fakeBrowser.storage.local.set(LEGACY_UNTRANSLATED)
    const remove = vi.spyOn(fakeBrowser.storage.local, 'remove')
    background.main()
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'install' } as never)
    await settle()
    expect(remove).not.toHaveBeenCalled()
  })

  it('扩展更新时把设置里的 collectUntranslated 改为 false（同步给未更新的旧版本），其余设置不变', async () => {
    await fakeBrowser.storage.sync.set({
      settings: { ...DEFAULT_SETTINGS, enabled: false, excludedPaths: ['/settings'], collectUntranslated: true }
    })
    background.main()
    await update()
    expect((await fakeBrowser.storage.sync.get('settings')).settings).toEqual({
      ...DEFAULT_SETTINGS,
      enabled: false,
      excludedPaths: ['/settings'],
      collectUntranslated: false
    })
  })

  it('删除失败只记录错误：徽标同步、已打开页面的注入照常', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await fakeBrowser.storage.sync.set({
      settings: { ...DEFAULT_SETTINGS, enabled: false, uiLanguage: 'zh-CN', collectUntranslated: true }
    })
    const tab = await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('Receiving end does not exist.'))
    vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValue(new Error('存储不可用'))
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    background.main()
    await update()
    expect(consoleError).toHaveBeenCalledWith('[GitHub 中文化]', expect.objectContaining({ message: '存储不可用' }))
    expect(consoleError).toHaveBeenCalledWith('[GitHub 中文化]', expect.objectContaining({ message: '配额' }))
    expect(await badgeText()).toBe(BADGE_OFF)
    expect(fakeBrowser.scripting.executeScript).toHaveBeenCalledWith(
      expect.objectContaining({ target: { tabId: tab.id }, files: ['/content-scripts/content.js'] })
    )
  })
})

describe('自定义词条、屏蔽规则转发', () => {
  type Sender = Browser.runtime.MessageSender

  const SAVED = { type: 'gcn:custom-entries-saved' }

  /** 设置页在标签页中打开（open_in_tab），发送方带标签页 */
  function optionsPage(): Sender {
    return {
      id: fakeBrowser.runtime.id,
      url: fakeBrowser.runtime.getURL('/options.html'),
      tab: { id: 7, incognito: false } as Browser.tabs.Tab
    }
  }

  /** 弹出页不在标签页中，发送方不带标签页 */
  function popupPage(): Sender {
    return { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/popup.html') }
  }

  /** GitHub 页面上的内容脚本 */
  function githubTab(): Sender {
    return {
      id: fakeBrowser.runtime.id,
      url: 'https://github.com/vuejs/core/issues',
      frameId: 0,
      tab: { id: 1, incognito: false } as Browser.tabs.Tab
    }
  }

  it.each<[string, () => Sender]>([
    ['设置页', optionsPage],
    ['弹出页', popupPage]
  ])('%s保存词条后通知各 GitHub 标签页重新读取', async (_name, sender) => {
    background.main()
    const tab = await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    const other = await fakeBrowser.tabs.create({ url: 'https://example.com/' })
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    const respond = vi.fn()
    await fakeBrowser.runtime.onMessage.trigger(SAVED, sender(), respond)
    await settle()
    expect(respond).toHaveBeenCalledWith({ ok: true })
    expect(send).toHaveBeenCalledWith(tab.id, { type: 'gcn:custom-entries-changed' })
    expect(send.mock.calls.map(([tabId]) => tabId)).not.toContain(other.id)
  })

  it.each<[string, () => Sender]>([
    ['GitHub 页面的内容脚本', githubTab],
    ['其他扩展（发送方 id 不符）', () => ({ ...popupPage(), id: 'other-extension' })]
  ])('%s发来：不处理、不应答、不转发', async (_name, sender) => {
    background.main()
    await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    const respond = vi.fn()
    const results: unknown[] = await fakeBrowser.runtime.onMessage.trigger(SAVED, sender(), respond)
    await settle()
    expect(results).not.toContain(true)
    expect(respond).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('设置页保存屏蔽规则后通知各 GitHub 标签页重新读取；内容脚本发来时不转发', async () => {
    background.main()
    const tab = await fakeBrowser.tabs.create({ url: 'https://github.com/search?q=vue' })
    const other = await fakeBrowser.tabs.create({ url: 'https://example.com/' })
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    const respond = vi.fn()
    const message = { type: 'gcn:search-rules-saved' }
    await fakeBrowser.runtime.onMessage.trigger(message, optionsPage(), respond)
    await settle()
    expect(respond).toHaveBeenCalledWith({ ok: true })
    expect(send).toHaveBeenCalledWith(tab.id, { type: 'gcn:search-rules-changed' })
    expect(send.mock.calls.map(([tabId]) => tabId)).not.toContain(other.id)

    send.mockClear()
    respond.mockClear()
    await fakeBrowser.runtime.onMessage.trigger(message, githubTab(), respond)
    await settle()
    expect(respond).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('url 不可见的标签页也通知（撤销站点权限后内容脚本仍在运行）', async () => {
    background.main()
    vi.spyOn(fakeBrowser.tabs, 'query').mockImplementation((async () => [{ id: 7 }, { id: 8, url: 'https://example.com/' }]) as never)
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    await fakeBrowser.runtime.onMessage.trigger(SAVED, popupPage(), vi.fn())
    await settle()
    expect(send.mock.calls.map(([tabId]) => tabId)).toEqual([7])
  })

  it('有标签页通知失败（未注入内容脚本）：其余照常通知，应答成功，不报错', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    background.main()
    const missing = await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    const tab = await fakeBrowser.tabs.create({ url: 'https://gist.github.com/' })
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation((async (tabId: number) => {
      if (tabId === missing.id) throw new Error('Could not establish connection. Receiving end does not exist.')
      return undefined
    }) as never)
    const respond = vi.fn()
    await fakeBrowser.runtime.onMessage.trigger(SAVED, popupPage(), respond)
    await settle()
    expect(respond).toHaveBeenCalledWith({ ok: true })
    expect(send).toHaveBeenCalledWith(tab.id, { type: 'gcn:custom-entries-changed' })
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('不监听 storage.local：存储写入不触发转发', async () => {
    const watch = vi.spyOn(fakeBrowser.storage.local.onChanged, 'addListener')
    background.main()
    await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    await fakeBrowser.storage.local.set({ customEntries: { Code: '代码' } })
    await settle()
    expect(watch).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('消息监听在 main() 返回前同步注册：Service Worker 被消息唤醒时收得到', () => {
    const listen = vi.spyOn(fakeBrowser.runtime.onMessage, 'addListener')
    background.main()
    expect(listen).toHaveBeenCalledTimes(1)
  })
})

describe('扩展安装、更新后向已打开的 GitHub 页面注入桥接与内容脚本', () => {
  const BRIDGE = { files: ['/content-scripts/turbo-bridge.js'], world: 'MAIN' }
  const CONTENT = { files: ['/content-scripts/content.js'] }
  const STATUS = { active: true, excluded: false, pages: ['repository'], translatedCount: 3 }

  interface Injection {
    readonly target: { readonly tabId: number }
    readonly files: readonly string[]
    readonly world?: string
    readonly injectImmediately?: boolean
  }

  /** 拦截注入；fail 为 true 的注入失败 */
  function captureInjections(fail: (injection: Injection) => boolean = () => false): {
    injections: Injection[]
    execute: ReturnType<typeof vi.spyOn>
  } {
    const injections: Injection[] = []
    const execute = vi.spyOn(fakeBrowser.scripting, 'executeScript').mockImplementation((async (injection: Injection) => {
      if (fail(injection)) throw new Error('Cannot access contents of the page.')
      injections.push(injection)
      return []
    }) as never)
    return { injections, execute }
  }

  /** 各标签页依次成功注入的文件与运行环境 */
  function perTab(injections: readonly Injection[]): Map<number, unknown[]> {
    const result = new Map<number, unknown[]>()
    for (const { target, files, world } of injections) {
      result.set(target.tabId, [...(result.get(target.tabId) ?? []), { files, world }])
    }
    return result
  }

  async function trigger(reason: string): Promise<void> {
    background.main()
    await fakeBrowser.runtime.onInstalled.trigger({ reason } as never)
    await settle()
  }

  beforeEach(() => {
    vi.spyOn(fakeBrowser.tabs, 'query').mockImplementation((async () => [
      { id: 1, url: 'https://github.com/vuejs/core' },
      { id: 2, url: 'https://gist.github.com/' },
      { id: 3, url: 'https://github.com/vuejs/core/issues', discarded: true },
      { id: 4, url: 'https://example.com/' },
      // 无站点权限：url 不可见
      { id: 5 }
    ]) as never)
    // 默认没有接收方：未注入，或只有已失效的旧版本内容脚本
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('Could not establish connection. Receiving end does not exist.'))
  })

  it.each(['install', 'update'])('%s：先在主世界注入桥接，再注入内容脚本；跳过休眠的标签页与其他站点', async reason => {
    const { injections } = captureInjections()
    await trigger(reason)
    expect(perTab(injections)).toEqual(
      new Map([
        [1, [BRIDGE, CONTENT]],
        [2, [BRIDGE, CONTENT]]
      ])
    )
    // 立即注入，不等 document_idle
    expect(injections.every(injection => injection.injectImmediately === true)).toBe(true)
  })

  it('GitHub 状态页的标签页同样注入', async () => {
    vi.spyOn(fakeBrowser.tabs, 'query').mockImplementation((async () => [
      { id: 6, url: 'https://www.githubstatus.com/' },
      { id: 7, url: 'https://eu.githubstatus.com/' }
    ]) as never)
    const { injections } = captureInjections()
    await trigger('update')
    expect(perTab(injections)).toEqual(new Map([[6, [BRIDGE, CONTENT]]]))
  })

  it('已有本版本内容脚本应答状态的标签页（更新时正在加载）：不注入', async () => {
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation((async (tabId: number) => {
      if (tabId === 1) return STATUS
      // 应答不是状态：按未注入处理
      return undefined
    }) as never)
    const { injections } = captureInjections()
    await trigger('update')
    expect(send).toHaveBeenCalledWith(1, { type: 'gcn:get-status' })
    expect(perTab(injections)).toEqual(new Map([[2, [BRIDGE, CONTENT]]]))
  })

  it.each(['chrome_update', 'shared_module_update'])('%s：不注入', async reason => {
    const { execute } = captureInjections()
    await trigger(reason)
    expect(execute).not.toHaveBeenCalled()
  })

  it('没有 scripting API：不注入、不报错', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const restore = removeApi('scripting')
    try {
      await trigger('update')
      expect(fakeBrowser.tabs.sendMessage).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      restore()
    }
  })

  it.each(['install', 'update'])(
    'Firefox（import.meta.env.FIREFOX 为真）%s：不注入（Firefox 自动注入已打开的页面），照常注册词典脚本',
    async reason => {
      vi.stubEnv('FIREFOX', 'true')
      const { execute } = captureInjections()
      await trigger(reason)
      expect(execute).not.toHaveBeenCalled()
      expect(fakeBrowser.tabs.sendMessage).not.toHaveBeenCalled()
      expect(scripts.registered).toEqual([expect.objectContaining({ id: LOCALE_SCRIPT_ID })])
    }
  )

  it('单个标签页注入失败不影响其他标签页，不报错', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { injections, execute } = captureInjections(injection => injection.target.tabId === 1)
    await trigger('update')
    expect(execute).toHaveBeenCalledTimes(4)
    expect(perTab(injections)).toEqual(new Map([[2, [BRIDGE, CONTENT]]]))
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('桥接注入失败时照常注入内容脚本', async () => {
    const { injections } = captureInjections(injection => injection.target.tabId === 1 && injection.world === 'MAIN')
    await trigger('install')
    expect(perTab(injections)).toEqual(
      new Map([
        [1, [CONTENT]],
        [2, [BRIDGE, CONTENT]]
      ])
    )
  })

  it('桥接注入落定后才注入内容脚本：新内容脚本启动时旧实例派发的重置要有桥接接收', async () => {
    let finishBridge: () => void = () => undefined
    const started: string[] = []
    vi.spyOn(fakeBrowser.scripting, 'executeScript').mockImplementation((async (injection: Injection) => {
      if (injection.target.tabId !== 1) return []
      started.push(injection.files[0]!)
      if (injection.world === 'MAIN') {
        await new Promise<void>(resolve => {
          finishBridge = resolve
        })
      }
      return []
    }) as never)
    await trigger('update')
    expect(started).toEqual(['/content-scripts/turbo-bridge.js'])
    finishBridge()
    await settle()
    expect(started).toEqual(['/content-scripts/turbo-bridge.js', '/content-scripts/content.js'])
  })
})

describe('词典脚本注入（内容脚本动态导入失败时的退路）', () => {
  const INJECT = { type: 'gcn:inject-locale', locale: 'zh-TW' }

  beforeEach(() => {
    background.main()
  })

  it('GitHub 页面请求：把对应语言的词典脚本注入发送方所在框架，完成后确认', async () => {
    const execute = vi.mocked(fakeBrowser.scripting.executeScript)
    expect(await deliver(INJECT, githubTab(3))).toEqual({ handled: true, response: { ok: true } })
    expect(execute).toHaveBeenCalledWith({
      target: { tabId: 7, frameIds: [3] },
      files: ['/locale-zh-tw.js'],
      injectImmediately: true
    })
  })

  it('注入失败：应答 ok: false 并记录错误', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(fakeBrowser.scripting.executeScript).mockRejectedValue(new Error('Cannot access contents'))
    expect(await deliver(INJECT, githubTab())).toEqual({ handled: true, response: { ok: false } })
    expect(consoleError).toHaveBeenCalled()
  })

  it.each([
    ['扩展页面', INJECT, { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/popup.html') }],
    ['其他扩展（发送方 id 不符）', INJECT, { ...githubTab(), id: 'other-extension' }],
    ['语言不合法', { type: 'gcn:inject-locale', locale: 'ja' }, githubTab()]
  ] as const)('%s → 不处理、不注入', async (_name, message, sender) => {
    expect(await deliver(message, sender as Sender)).toEqual({ handled: false })
    expect(fakeBrowser.scripting.executeScript).not.toHaveBeenCalled()
  })

  it.each([
    ['其他网站', otherSite],
    ['未授权的企业版站点', enterpriseTab]
  ] as const)('%s → 应答 ok: false，不注入', async (_name, sender) => {
    expect(await deliver(INJECT, sender())).toEqual({ handled: true, response: { ok: false } })
    expect(fakeBrowser.scripting.executeScript).not.toHaveBeenCalled()
  })

  it('已授权的企业版站点：同样注入', async () => {
    await fakePermissions.grant(ENTERPRISE_ORIGINS)
    await settle()
    const execute = vi.mocked(fakeBrowser.scripting.executeScript)
    execute.mockClear()
    expect(await deliver(INJECT, enterpriseTab(2))).toEqual({ handled: true, response: { ok: true } })
    expect(execute).toHaveBeenCalledExactlyOnceWith({
      target: { tabId: 7, frameIds: [2] },
      files: ['/locale-zh-tw.js'],
      injectImmediately: true
    })
  })

  it('Firefox：同样注入（动态导入失败时的退路）', async () => {
    vi.stubEnv('FIREFOX', 'true')
    const execute = vi.mocked(fakeBrowser.scripting.executeScript)
    expect(await deliver(INJECT, githubTab(2))).toEqual({ handled: true, response: { ok: true } })
    expect(execute).toHaveBeenCalledWith({
      target: { tabId: 7, frameIds: [2] },
      files: ['/locale-zh-tw.js'],
      injectImmediately: true
    })
  })

  it('没有 scripting API：应答 ok: false', async () => {
    const restore = removeApi('scripting')
    try {
      expect(await deliver(INJECT, githubTab())).toEqual({ handled: true, response: { ok: false } })
    } finally {
      restore()
    }
  })
})

describe('加速源的探测', () => {
  const PROBE = { type: 'gcn:probe-sources' }

  beforeEach(() => {
    background.main()
  })

  it.each([
    ['未开启下载加速', {}],
    ['开启下载加速、未开启故障转移', { accelerate: true }],
    ['开启故障转移、未开启下载加速', { failover: true }]
  ] as const)('%s：应答空结果，不探测', async (_name, patch) => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await updateSettings(patch)
    expect(await deliver(PROBE, githubTab())).toEqual({ handled: true, response: { ok: true, health: {} } })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('开启下载加速与故障转移：探测各加速源的站点根路径，应答 标识 → 耗时或 null', async () => {
    const fetch = vi.fn(async (url: string) => (url === 'https://ghfast.top/' ? Promise.reject(new TypeError('Failed')) : {}))
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ accelerate: true, failover: true })
    const result = await deliver(PROBE, githubTab())
    expect(result).toMatchObject({ handled: true, response: { ok: true } })
    const { health } = (result as { response: { health: Record<string, number | null> } }).response
    expect(health['ghfast']).toBeNull()
    expect(typeof health['wget-la']).toBe('number')
    expect(Object.keys(health)).toHaveLength(BUILTIN_SOURCES.length)
    expect(fetch).toHaveBeenCalledWith('https://ghfast.top/', expect.objectContaining({ method: 'HEAD', mode: 'no-cors' }))
  })

  it('有效期内不再探测', async () => {
    const fetch = vi.fn(async () => ({}))
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ accelerate: true, failover: true })
    await deliver(PROBE, githubTab())
    const calls = fetch.mock.calls.length
    await deliver(PROBE, githubTab())
    expect(fetch.mock.calls.length).toBe(calls)
  })

  it('读取设置失败：应答 ok: false 并记录错误', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(fakeBrowser.storage.sync, 'get').mockRejectedValue(new Error('storage unavailable'))
    expect(await deliver(PROBE, githubTab())).toEqual({ handled: true, response: { ok: false } })
    expect(consoleError).toHaveBeenCalled()
  })

  it.each([
    ['扩展页面', { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/popup.html') }],
    ['其他扩展（发送方 id 不符）', { ...githubTab(), id: 'other-extension' }]
  ] as const)('%s → 不处理', async (_name, sender) => {
    expect(await deliver(PROBE, sender as Sender)).toEqual({ handled: false })
  })

  it('其他网站 → 应答 ok: false', async () => {
    expect(await deliver(PROBE, otherSite())).toEqual({ handled: true, response: { ok: false } })
  })

  it('已授权的企业版站点：同样探测（页面上指向 github.com 的链接）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({}))
    )
    await fakePermissions.grant(ENTERPRISE_ORIGINS)
    await updateSettings({ accelerate: true, failover: true })
    expect(await deliver(PROBE, enterpriseTab())).toMatchObject({
      handled: true,
      response: { ok: true, health: { ghfast: expect.any(Number) } }
    })
  })
})

describe('图片加速的取回', () => {
  const AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4'
  const FETCH_IMAGE = { type: 'gcn:fetch-image', url: AVATAR }

  beforeEach(() => {
    background.main()
  })

  it('经支持该地址的加速源取回（头像：hk.gh-proxy.org），应答 data: 地址', async () => {
    const fetch = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } }))
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ accelerateImages: true })
    expect(await deliver(FETCH_IMAGE, githubTab())).toEqual({
      handled: true,
      response: { ok: true, url: 'data:image/png;base64,AQID' }
    })
    expect(fetch).toHaveBeenCalledExactlyOnceWith(`https://hk.gh-proxy.org/${AVATAR}`, expect.any(Object))
  })

  it('未开启图片加速、取不到：应答 ok: false', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 404 }))
    vi.stubGlobal('fetch', fetch)
    expect(await deliver(FETCH_IMAGE, githubTab())).toEqual({ handled: true, response: { ok: false } })
    expect(fetch).not.toHaveBeenCalled()
    await updateSettings({ accelerateImages: true })
    expect(await deliver(FETCH_IMAGE, githubTab())).toEqual({ handled: true, response: { ok: false } })
  })

  it('读取设置失败：应答 ok: false 并记录错误', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(fakeBrowser.storage.sync, 'get').mockRejectedValue(new Error('storage unavailable'))
    expect(await deliver(FETCH_IMAGE, githubTab())).toEqual({ handled: true, response: { ok: false } })
    expect(consoleError).toHaveBeenCalled()
  })

  it.each([
    ['扩展页面', { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/popup.html') }],
    ['其他扩展（发送方 id 不符）', { ...githubTab(), id: 'other-extension' }]
  ] as const)('%s → 不处理', async (_name, sender) => {
    expect(await deliver(FETCH_IMAGE, sender as Sender)).toEqual({ handled: false })
  })

  it('未授权的企业版站点 → 应答 ok: false，不取回', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ accelerateImages: true })
    expect(await deliver(FETCH_IMAGE, enterpriseTab())).toEqual({ handled: true, response: { ok: false } })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('下载次数', () => {
  const RELEASE = { type: 'gcn:release-counts', owner: 'vuejs', repo: 'core', tag: 'v3.5.0' }
  const API = 'https://api.github.com/repos/vuejs/core/releases/tags/v3.5.0'
  /** 占位令牌（运行时拼出，不是真实令牌） */
  const TOKEN = `ghp_${'x'.repeat(36)}`

  function release(count: number, headers: Record<string, string> = {}): Response {
    const assets = [
      {
        name: 'vue.global.js',
        browser_download_url: `https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js`,
        download_count: count
      }
    ]
    return new Response(JSON.stringify({ assets }), { headers: { 'content-type': 'application/json', ...headers } })
  }

  beforeEach(() => {
    background.main()
  })

  it('未开启下载次数：应答 ok: false，不请求', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ downloadCount: false })
    expect(await deliver(RELEASE, githubTab())).toEqual({ handled: true, response: { ok: false } })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('开启时请求 GitHub API（不带 Cookie），应答 [文件名, 次数]；有效期内各标签页共用结果', async () => {
    const fetch = vi.fn(async () => release(12_345))
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ downloadCount: true })
    expect(await deliver(RELEASE, githubTab())).toEqual({ handled: true, response: { ok: true, counts: [['vue.global.js', 12_345]] } })
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      API,
      expect.objectContaining({ credentials: 'omit', headers: { Accept: 'application/vnd.github+json' } })
    )
    expect(await deliver(RELEASE, { ...githubTab(), tab: { id: 8, incognito: false } as Browser.tabs.Tab })).toMatchObject({
      response: { ok: true }
    })
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('填了令牌：带 Authorization（令牌只在后台读取）', async () => {
    const fetch = vi.fn(async () => release(1))
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ downloadCount: true })
    await githubTokenItem.setValue(TOKEN)
    await deliver(RELEASE, githubTab())
    expect(fetch).toHaveBeenCalledWith(
      API,
      expect.objectContaining({ headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${TOKEN}` } })
    )
  })

  it('限额用尽：应答到何时为止，之后不请求；改了令牌后照常请求', async () => {
    const reset = 1_800_000_600
    const fetch = vi.fn(
      async () => new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) } })
    )
    vi.stubGlobal('fetch', fetch)
    vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000)
    await updateSettings({ downloadCount: true })
    expect(await deliver(RELEASE, githubTab())).toEqual({ handled: true, response: { ok: false, limitedUntil: reset * 1000 } })
    expect(await deliver({ ...RELEASE, tag: 'v3.4.0' }, githubTab())).toEqual({
      handled: true,
      response: { ok: false, limitedUntil: reset * 1000 }
    })
    expect(fetch).toHaveBeenCalledOnce()
    fetch.mockImplementation(async () => release(2))
    await githubTokenItem.setValue(TOKEN)
    expect(await deliver({ ...RELEASE, tag: 'v3.4.0' }, githubTab())).toEqual({
      handled: true,
      response: { ok: true, counts: [['vue.global.js', 2]] }
    })
  })

  it('读取设置失败：应答 ok: false 并记录错误', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(fakeBrowser.storage.sync, 'get').mockRejectedValue(new Error('storage unavailable'))
    expect(await deliver(RELEASE, githubTab())).toEqual({ handled: true, response: { ok: false } })
    expect(consoleError).toHaveBeenCalled()
  })

  it.each([
    ['扩展页面', { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/popup.html') }],
    ['其他扩展（发送方 id 不符）', { ...githubTab(), id: 'other-extension' }]
  ] as const)('%s → 不处理', async (_name, sender) => {
    expect(await deliver(RELEASE, sender as Sender)).toEqual({ handled: false })
  })

  it('格式不符的请求 → 不处理', async () => {
    expect(await deliver({ ...RELEASE, owner: '../octocat' }, githubTab())).toEqual({ handled: false })
  })

  it('其他网站、未授权的企业版站点 → 应答 ok: false，不请求', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await updateSettings({ downloadCount: true })
    expect(await deliver(RELEASE, otherSite())).toEqual({ handled: true, response: { ok: false } })
    expect(await deliver(RELEASE, enterpriseTab())).toEqual({ handled: true, response: { ok: false } })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('企业版站点', () => {
  const BRIDGE = { files: ['/content-scripts/turbo-bridge.js'], world: 'MAIN' }
  const CONTENT = { files: ['/content-scripts/content.js'] }

  /** 企业版站点的两份注册 */
  function enterpriseScripts(matches: readonly string[] = ENTERPRISE_ORIGINS): unknown[] {
    return [
      {
        id: ENTERPRISE_BRIDGE_ID,
        matches,
        js: ['content-scripts/turbo-bridge.js'],
        runAt: 'document_start',
        persistAcrossSessions: true,
        world: 'MAIN'
      },
      { id: ENTERPRISE_CONTENT_ID, matches, js: ['content-scripts/content.js'], runAt: 'document_start', persistAcrossSessions: true }
    ]
  }

  const registeredIds = (): string[] => scripts.registered.map(script => script.id)
  const localeMatches = (): readonly string[] | undefined => scripts.registered.find(script => script.id === LOCALE_SCRIPT_ID)?.matches

  interface Injection {
    readonly target: { readonly tabId: number }
    readonly files: readonly string[]
    readonly world?: string
  }

  /** 各次注入的标签页、文件与运行环境，按注入顺序 */
  function injections(): [number, unknown][] {
    return vi.mocked(fakeBrowser.scripting.executeScript).mock.calls.map(([call]) => {
      const { target, files, world } = call as unknown as Injection
      return [target.tabId, world ? { files, world } : { files }]
    })
  }

  /** 等待权限事件触发的同步、注入完成 */
  async function settleAll(): Promise<void> {
    for (let i = 0; i < 5; i++) await settle()
  }

  beforeEach(() => {
    // 默认没有接收方：页面上还没有内容脚本
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('Could not establish connection. Receiving end does not exist.'))
  })

  it('启动时按已授权的站点注册桥接（主世界）与内容脚本，document_start、跨会话保留；词典脚本的站点一并加上', async () => {
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    background.main()
    await settleAll()
    expect(scripts.registered.filter(script => script.id !== LOCALE_SCRIPT_ID)).toEqual(enterpriseScripts())
    expect(localeMatches()).toEqual([...GITHUB_ORIGINS, ...ENTERPRISE_ORIGINS])
  })

  it('没有已授权的站点：只注册词典脚本', async () => {
    background.main()
    await settleAll()
    expect(registeredIds()).toEqual([LOCALE_SCRIPT_ID])
    expect(localeMatches()).toEqual([...GITHUB_ORIGINS])
  })

  it('通配的主机权限（如在扩展管理里允许所有网站）、GitHub 自己的站点：不当作企业版站点', async () => {
    fakePermissions.granted.push('*://*/*', '<all_urls>', '*://*.example.com/*', 'https://docs.github.com/*')
    background.main()
    await settleAll()
    expect(registeredIds()).toEqual([LOCALE_SCRIPT_ID])
  })

  it('授权后注册，并向已打开的该站页面注入（先桥接再内容脚本）；其他标签页不注入', async () => {
    background.main()
    await settleAll()
    const page = await fakeBrowser.tabs.create({ url: `https://${ENTERPRISE_HOST}/octocat/hello-world` })
    const gist = await fakeBrowser.tabs.create({ url: `https://gist.${ENTERPRISE_HOST}/octocat` })
    await fakeBrowser.tabs.create({ url: 'https://example.com/' })
    await fakeBrowser.tabs.create({ url: 'https://github.com/vuejs/core' })
    vi.mocked(fakeBrowser.scripting.executeScript).mockClear()
    await fakePermissions.grant(ENTERPRISE_ORIGINS)
    await settleAll()
    expect(registeredIds()).toEqual([LOCALE_SCRIPT_ID, ENTERPRISE_BRIDGE_ID, ENTERPRISE_CONTENT_ID])
    expect(localeMatches()).toEqual([...GITHUB_ORIGINS, ...ENTERPRISE_ORIGINS])
    expect(injections()).toEqual([
      [page.id, BRIDGE],
      [gist.id, BRIDGE],
      [page.id, CONTENT],
      [gist.id, CONTENT]
    ])
  })

  it('已有内容脚本应答状态的页面不再注入', async () => {
    background.main()
    await settleAll()
    await fakeBrowser.tabs.create({ url: `https://${ENTERPRISE_HOST}/` })
    vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ active: true, excluded: false, pages: [], translatedCount: 0 } as never)
    vi.mocked(fakeBrowser.scripting.executeScript).mockClear()
    await fakePermissions.grant(ENTERPRISE_ORIGINS)
    await settleAll()
    expect(fakeBrowser.scripting.executeScript).not.toHaveBeenCalled()
  })

  it('再授权一个站点：两个站点的匹配模式合并到同一份注册', async () => {
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    background.main()
    await settleAll()
    const second = enterpriseOrigins('octo-corp.ghe.com')
    await fakePermissions.grant(second)
    await settleAll()
    expect(scripts.registered.filter(script => script.id !== LOCALE_SCRIPT_ID)).toEqual(
      enterpriseScripts([...ENTERPRISE_ORIGINS, ...second])
    )
  })

  it('撤销后注销，词典脚本恢复为 GitHub 的站点', async () => {
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    background.main()
    await settleAll()
    await fakePermissions.revoke(ENTERPRISE_ORIGINS)
    await settleAll()
    expect(registeredIds()).toEqual([LOCALE_SCRIPT_ID])
    expect(localeMatches()).toEqual([...GITHUB_ORIGINS])
  })

  it('关闭总开关：注销词典脚本，企业版站点的内容脚本保留（关闭时内容脚本仍应答状态）', async () => {
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    background.main()
    await settleAll()
    await updateSettings({ enabled: false })
    await settleAll()
    expect(registeredIds()).toEqual([ENTERPRISE_BRIDGE_ID, ENTERPRISE_CONTENT_ID])
  })

  it('扩展更新后浏览器清空注册：补回', async () => {
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    background.main()
    await settleAll()
    scripts.updateExtension()
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'update' } as never)
    await settleAll()
    expect(registeredIds()).toEqual([LOCALE_SCRIPT_ID, ENTERPRISE_BRIDGE_ID, ENTERPRISE_CONTENT_ID])
  })

  it.each([
    ['Chromium', false, ['https://github.com/vuejs/core', `https://${ENTERPRISE_HOST}/`]],
    ['Firefox（清单里的内容脚本自动注入）', true, [`https://${ENTERPRISE_HOST}/`]]
  ] as const)('%s 更新：向已打开的企业版站点页面注入，不注入未授权的站点', async (_name, firefox, expected) => {
    if (firefox) vi.stubEnv('FIREFOX', 'true')
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    const tabs = [
      { id: 1, url: 'https://github.com/vuejs/core' },
      { id: 2, url: `https://${ENTERPRISE_HOST}/` },
      { id: 3, url: 'https://octo-corp.ghe.com/' }
    ]
    vi.spyOn(fakeBrowser.tabs, 'query').mockImplementation((async () => tabs) as never)
    background.main()
    await fakeBrowser.runtime.onInstalled.trigger({ reason: 'update' } as never)
    await settleAll()
    const injected = new Set(injections().map(([tabId]) => tabs.find(tab => tab.id === tabId)?.url))
    expect([...injected]).toEqual(expected)
  })

  it('设置页保存词条：通知已授权的企业版站点的标签页，不通知未授权的', async () => {
    fakePermissions.granted.push(...ENTERPRISE_ORIGINS)
    background.main()
    const tab = await fakeBrowser.tabs.create({ url: `https://${ENTERPRISE_HOST}/octocat` })
    const other = await fakeBrowser.tabs.create({ url: 'https://octo-corp.ghe.com/' })
    const send = vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue(undefined as never)
    const respond = vi.fn()
    await fakeBrowser.runtime.onMessage.trigger(
      { type: 'gcn:custom-entries-saved' },
      { id: fakeBrowser.runtime.id, url: fakeBrowser.runtime.getURL('/options.html') },
      respond
    )
    await settleAll()
    expect(respond).toHaveBeenCalledWith({ ok: true })
    const notified = send.mock.calls.map(([tabId]) => tabId)
    expect(notified).toContain(tab.id)
    expect(notified).not.toContain(other.id)
  })

  it('读取权限失败：按没有企业版站点处理，照常注册词典脚本', async () => {
    vi.spyOn(fakeBrowser.permissions, 'getAll').mockRejectedValue(new Error('不支持'))
    background.main()
    await settleAll()
    expect(registeredIds()).toEqual([LOCALE_SCRIPT_ID])
  })

  it('只增减 API 权限（不含主机权限）：不重新同步', async () => {
    background.main()
    await settleAll()
    const getAll = vi.spyOn(fakeBrowser.permissions, 'getAll')
    await fakePermissions.onAdded.trigger([])
    await fakePermissions.onRemoved.trigger([])
    await settleAll()
    expect(getAll).not.toHaveBeenCalled()
  })
})
