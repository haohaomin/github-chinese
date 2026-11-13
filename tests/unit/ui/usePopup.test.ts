import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import { useSettings } from '../../../src/components/useSettings'
import { STATUS_POLL_MS, usePopup, type UsePopup } from '../../../src/entrypoints/popup/usePopup'
import { enterpriseOrigins, hasGitHubMarkers } from '../../../src/shared/enterprise'
import { DEFAULT_SETTINGS, getSettings, settingsItem } from '../../../src/shared/settings'
import { MESSAGE_TIMEOUT_MS } from '../../../src/shared/tab-messages'
import { fakePermissions } from '../shared/fake-permissions'
import {
  STATUS,
  contentMissing,
  contentWith,
  focusWindow,
  messagesOf,
  mockContent,
  mockPermission,
  mockVersion,
  openTab,
  settle,
  shownToasts,
  withScope,
  type Scoped
} from './helpers'

const REPO_URL = 'https://github.com/vuejs/core/issues'

let scoped: Scoped<UsePopup> | undefined

async function setup(): Promise<UsePopup> {
  scoped = withScope(usePopup)
  await settle()
  return scoped.result
}

beforeEach(() => {
  fakeBrowser.reset()
  mockVersion('1.2.3')
  mockPermission(true)
})

afterEach(() => {
  scoped?.stop()
  scoped = undefined
  clearToasts()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('当前标签页状态', () => {
  it('初始为加载中', async () => {
    mockContent(contentWith())
    scoped = withScope(usePopup)
    expect(scoped.result.state.value).toBe('loading')
    expect(scoped.result.settingsReady.value).toBe(false)
    await settle()
    expect(scoped.result.settingsReady.value).toBe(true)
  })

  it('设置读取失败也结束加载', async () => {
    vi.spyOn(fakeBrowser.storage.sync, 'get').mockRejectedValue(new Error('存储不可用'))
    mockContent(contentWith())
    expect((await setup()).settingsReady.value).toBe(true)
  })

  it('非 GitHub 页面 → 不可用，不发消息', async () => {
    await openTab('https://example.com/')
    const send = mockContent(contentWith())
    const popup = await setup()
    expect(popup.state.value).toBe('unavailable')
    expect(popup.tab.value).toBeUndefined()
    expect(send).not.toHaveBeenCalled()
  })

  it('无活动标签页 → 不可用', async () => {
    await focusWindow()
    mockContent(contentWith())
    expect((await setup()).state.value).toBe('unavailable')
  })

  it('查询标签页失败 → 不可用', async () => {
    vi.spyOn(fakeBrowser.tabs, 'query').mockRejectedValue(new Error('失败'))
    mockContent(contentWith())
    expect((await setup()).state.value).toBe('unavailable')
  })

  it('内容脚本无响应 → 未就绪', async () => {
    await openTab(REPO_URL)
    mockContent(contentMissing)
    expect((await setup()).state.value).toBe('not-ready')
  })

  it('响应格式不符 → 未就绪', async () => {
    await openTab(REPO_URL)
    mockContent(() => ({ active: true }))
    expect((await setup()).state.value).toBe('not-ready')
  })

  it('内容脚本不回复 → 超时后未就绪', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await openTab(REPO_URL)
    mockContent(() => new Promise(() => undefined))
    const popup = await setup()
    expect(popup.state.value).toBe('loading')
    vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS)
    await settle()
    expect(popup.state.value).toBe('not-ready')
  })

  it.each([
    [{ ...STATUS, active: true }, 'translated'],
    [{ ...STATUS, active: false, excluded: true }, 'excluded'],
    [{ ...STATUS, active: false, excluded: false }, 'disabled']
  ] as const)('状态 %j → %s', async (status, expected) => {
    await openTab('https://gist.github.com/octocat/1')
    mockContent(contentWith(status))
    expect((await setup()).state.value).toBe(expected)
  })

  it.each([
    [{ translation: false }, { ...STATUS, active: false, excluded: false }, 'translation-off'],
    [{ translation: false }, { ...STATUS, active: false, excluded: true }, 'excluded'],
    [{ enabled: false, translation: false }, { ...STATUS, active: false, excluded: false }, 'disabled']
  ] as const)('设置 %j、状态 %j → %s', async (patch, status, expected) => {
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, ...patch })
    await openTab(REPO_URL)
    mockContent(contentWith(status))
    expect((await setup()).state.value).toBe(expected)
  })

  it('GitHub 状态页同样查询内容脚本状态', async () => {
    await openTab('https://www.githubstatus.com/history')
    mockContent(contentWith({ ...STATUS, active: true }))
    expect((await setup()).state.value).toBe('translated')
  })

  it.each([REPO_URL, 'https://example.com/'])('无主机权限（当前页 %s）→ 未授权，不查询内容脚本', async url => {
    mockPermission(false)
    await openTab(url)
    const send = mockContent(contentWith())
    const popup = await setup()
    expect(popup.state.value).toBe('unauthorized')
    expect(popup.tab.value).toBeUndefined()
    expect(send).not.toHaveBeenCalled()
  })

  it('权限查询出错时按已授权处理', async () => {
    vi.spyOn(fakeBrowser.permissions, 'contains').mockRejectedValue(new Error('不支持'))
    await openTab(REPO_URL)
    mockContent(contentWith())
    expect((await setup()).state.value).toBe('translated')
  })

  it('读取版本号', async () => {
    mockContent(contentWith())
    expect((await setup()).version).toBe('1.2.3')
  })
})

describe('轮询', () => {
  it('定时刷新状态；停止后不再发送', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    await openTab(REPO_URL)
    let active = true
    const send = mockContent(message => (message.type === 'gcn:get-status' ? { ...STATUS, active } : undefined))
    const popup = await setup()
    expect(popup.state.value).toBe('translated')

    active = false
    vi.advanceTimersByTime(STATUS_POLL_MS)
    await settle()
    expect(popup.state.value).toBe('disabled')

    const calls = send.mock.calls.length
    scoped?.stop()
    vi.advanceTimersByTime(STATUS_POLL_MS * 3)
    await settle()
    expect(send.mock.calls.length).toBe(calls)
  })

  it('内容脚本注入后由未就绪转为已翻译', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    await openTab(REPO_URL)
    let injected = false
    mockContent(message => (injected ? contentWith()(message) : contentMissing()))
    const popup = await setup()
    expect(popup.state.value).toBe('not-ready')

    injected = true
    vi.advanceTimersByTime(STATUS_POLL_MS)
    await settle()
    expect(popup.state.value).toBe('translated')
  })
})

describe('启用开关', () => {
  it('写入存储并刷新状态', async () => {
    await openTab(REPO_URL)
    const send = mockContent(contentWith())
    const popup = await setup()
    await popup.setEnabled(false)
    expect((await getSettings()).enabled).toBe(false)
    expect(popup.settings.value.enabled).toBe(false)
    expect(messagesOf(send)).toEqual(['gcn:get-status', 'gcn:get-status'])
  })

  it('写入失败 → 保存失败', async () => {
    mockContent(contentWith())
    const popup = await setup()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await popup.setEnabled(false)
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    expect(popup.settings.value.enabled).toBe(true)
  })
})

describe('外观', () => {
  it('依次切换自动、浅色、深色', async () => {
    mockContent(contentWith())
    const popup = await setup()
    for (const theme of ['light', 'dark', 'auto'] as const) {
      await popup.cycleTheme()
      expect((await getSettings()).theme).toBe(theme)
      expect(popup.settings.value.theme).toBe(theme)
    }
    expect(shownToasts()).toEqual([])
  })

  it('写入失败 → 保存失败', async () => {
    mockContent(contentWith())
    const popup = await setup()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await popup.cycleTheme()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    expect(popup.settings.value.theme).toBe('auto')
  })
})

describe('排除此页', () => {
  it('加入当前路径，再取消排除', async () => {
    await openTab(`${REPO_URL}/`)
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, excludedPaths: ['/settings'] })
    mockContent(contentWith())
    const popup = await setup()
    expect(popup.excluded.value).toBe(false)
    expect(popup.canToggleExcluded.value).toBe(true)

    await popup.toggleExcluded()
    expect((await getSettings()).excludedPaths).toEqual(['/settings', '/vuejs/core/issues'])
    expect(popup.excluded.value).toBe(true)

    await popup.toggleExcluded()
    expect((await getSettings()).excludedPaths).toEqual(['/settings'])
    expect(popup.excluded.value).toBe(false)
  })

  it('取消排除时移除命中的通配规则', async () => {
    await openTab('https://github.com/vuejs/core/wiki/Home')
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, excludedPaths: ['/*/*/wiki', '/settings'] })
    mockContent(contentWith({ ...STATUS, active: false, excluded: true }))
    const popup = await setup()
    expect(popup.excluded.value).toBe(true)
    await popup.toggleExcluded()
    expect((await getSettings()).excludedPaths).toEqual(['/settings'])
  })

  it('根路径不可排除', async () => {
    await openTab('https://github.com/')
    mockContent(contentWith())
    const popup = await setup()
    expect(popup.canToggleExcluded.value).toBe(false)
    await popup.toggleExcluded()
    expect((await getSettings()).excludedPaths).toEqual([])
  })

  it('写入失败 → 保存失败', async () => {
    await openTab(REPO_URL)
    mockContent(contentWith())
    const popup = await setup()
    vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await popup.toggleExcluded()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
  })
})

describe('不涉及未翻译文本', () => {
  it('打开时不读取 storage.local，也不监听其变化', async () => {
    await fakeBrowser.storage.local.set({ untranslatedMeta: { count: 2, full: false } })
    const get = vi.spyOn(fakeBrowser.storage.local, 'get')
    const watch = vi.spyOn(fakeBrowser.storage.local.onChanged, 'addListener')
    mockContent(contentWith())
    await setup()
    expect(get).not.toHaveBeenCalled()
    expect(watch).not.toHaveBeenCalled()
  })
})

describe('无 GitHub 标签页', () => {
  it('页面操作不发消息', async () => {
    const send = mockContent(contentWith())
    const popup = await setup()
    await popup.reloadTab()
    await popup.toggleExcluded()
    expect(send).not.toHaveBeenCalled()
    expect(shownToasts()).toEqual([])
  })
})

describe('授权', () => {
  it('授权后重新检查', async () => {
    const contains = mockPermission(false)
    await openTab(REPO_URL)
    mockContent(contentWith())
    const popup = await setup()
    expect(popup.state.value).toBe('unauthorized')

    const request = vi.fn(async () => true)
    vi.spyOn(fakeBrowser.permissions, 'request').mockImplementation(request as never)
    contains.mockResolvedValue(true)
    const pending = popup.authorize()
    // 首个 await 之前同步调用，保证处于用户手势内
    expect(request).toHaveBeenCalledWith({
      origins: [
        'https://github.com/*',
        'https://gist.github.com/*',
        'https://www.githubstatus.com/*',
        'https://help.github.com/*',
        'https://support.github.com/*'
      ]
    })
    await pending
    await settle()
    expect(popup.state.value).toBe('translated')
  })

  it('用户拒绝 → 保持未授权', async () => {
    mockPermission(false)
    mockContent(contentWith())
    const popup = await setup()
    vi.spyOn(fakeBrowser.permissions, 'request').mockResolvedValue(false as never)
    await popup.authorize()
    expect(popup.state.value).toBe('unauthorized')
    expect(shownToasts()).toEqual([])
  })

  it('请求出错 → 授权失败', async () => {
    mockPermission(false)
    mockContent(contentWith())
    const popup = await setup()
    vi.spyOn(fakeBrowser.permissions, 'request').mockRejectedValue(new Error('需要用户手势'))
    await popup.authorize()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'authorizeFailed' }])
  })
})

describe('企业版站点', () => {
  const HOST = 'github.example.com'
  const PAGE = `https://${HOST}/octocat/hello-world/issues`

  /** 当前页的 GitHub 标记检测（scripting.executeScript）的结果 */
  function mockMarkers(isGitHub: boolean): ReturnType<typeof vi.spyOn> {
    return vi.spyOn(fakeBrowser.scripting, 'executeScript').mockResolvedValue([{ frameId: 0, result: isGitHub }] as never)
  }

  it.each([PAGE, `https://gist.${HOST}/octocat/1`, `http://${HOST}/`])(
    '已授权的站点（%s）：同 GitHub 页面，查询内容脚本状态，不检测页面',
    async url => {
      fakePermissions.granted.push(...enterpriseOrigins(HOST))
      await openTab(url)
      mockContent(contentWith())
      const execute = mockMarkers(true)
      const popup = await setup()
      expect(popup.state.value).toBe('translated')
      expect(popup.tab.value?.url.href).toBe(url)
      expect(execute).not.toHaveBeenCalled()
    }
  )

  it('GitHub 未授权时，已授权的企业版站点照常查询状态', async () => {
    mockPermission(false)
    fakePermissions.granted.push(...enterpriseOrigins(HOST))
    await openTab(PAGE)
    mockContent(contentWith())
    expect((await setup()).state.value).toBe('translated')
  })

  it('未授权、像 GitHub 的页面 → 未授权，不查询内容脚本；授权申请主站与代码片段子域名（首个 await 之前），授权后查询状态', async () => {
    const tabId = await openTab(PAGE)
    const send = mockContent(contentWith())
    const execute = mockMarkers(true)
    const popup = await setup()
    expect(popup.state.value).toBe('unauthorized')
    expect(execute).toHaveBeenCalledWith({ target: { tabId }, func: hasGitHubMarkers })
    expect(send).not.toHaveBeenCalled()

    const request = vi.spyOn(fakeBrowser.permissions, 'request')
    const pending = popup.authorize()
    expect(request).toHaveBeenCalledWith({ origins: enterpriseOrigins(HOST) })
    await pending
    await settle()
    expect(popup.state.value).toBe('translated')
    expect(popup.tab.value?.id).toBe(tabId)
  })

  it('在代码片段子域名上：申请主站与代码片段子域名', async () => {
    await openTab(`https://gist.${HOST}/octocat/1`)
    mockContent(contentWith())
    mockMarkers(true)
    const popup = await setup()
    const request = vi.spyOn(fakeBrowser.permissions, 'request').mockResolvedValue(false as never)
    await popup.authorize()
    expect(request).toHaveBeenCalledWith({ origins: enterpriseOrigins(HOST) })
    expect(popup.state.value).toBe('unauthorized')
  })

  it('GitHub 未授权时也申请当前站点', async () => {
    mockPermission(false)
    await openTab(PAGE)
    mockContent(contentWith())
    mockMarkers(true)
    const popup = await setup()
    const request = vi.spyOn(fakeBrowser.permissions, 'request').mockResolvedValue(false as never)
    await popup.authorize()
    expect(request).toHaveBeenCalledWith({ origins: enterpriseOrigins(HOST) })
  })

  it.each([
    ['不像 GitHub 的页面', () => mockMarkers(false)],
    [
      '检测失败（浏览器内部页等无权访问）',
      () => vi.spyOn(fakeBrowser.scripting, 'executeScript').mockRejectedValue(new Error('Cannot access'))
    ],
    ['没有结果', () => vi.spyOn(fakeBrowser.scripting, 'executeScript').mockResolvedValue([] as never)]
  ])('%s → 不可用', async (_name, mock) => {
    await openTab('https://example.com/')
    mockContent(contentWith())
    mock()
    expect((await setup()).state.value).toBe('unavailable')
  })

  it('非网页（浏览器内部页）：不检测，不可用', async () => {
    await openTab('chrome://extensions/')
    const execute = mockMarkers(true)
    expect((await setup()).state.value).toBe('unavailable')
    expect(execute).not.toHaveBeenCalled()
  })
})

describe('刷新与设置', () => {
  it('刷新当前标签页', async () => {
    const tabId = await openTab(REPO_URL)
    mockContent(contentMissing)
    const reload = vi.fn(async () => undefined)
    vi.spyOn(fakeBrowser.tabs, 'reload').mockImplementation(reload as never)
    const popup = await setup()
    await popup.reloadTab()
    expect(reload).toHaveBeenCalledWith(tabId)
  })

  it('刷新出错 → 刷新失败', async () => {
    await openTab(REPO_URL)
    mockContent(contentMissing)
    vi.spyOn(fakeBrowser.tabs, 'reload').mockRejectedValue(new Error('标签页已关闭'))
    const popup = await setup()
    await popup.reloadTab()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'reloadFailed' }])
  })

  it('打开设置页并关闭弹出页', async () => {
    mockContent(contentWith())
    const open = vi.fn(async () => undefined)
    vi.spyOn(fakeBrowser.runtime, 'openOptionsPage').mockImplementation(open as never)
    const close = vi.spyOn(window, 'close').mockImplementation(() => undefined)
    const popup = await setup()
    await popup.openOptions()
    expect(open).toHaveBeenCalled()
    expect(close).toHaveBeenCalled()
  })

  it('打开出错 → 打开失败', async () => {
    mockContent(contentWith())
    vi.spyOn(fakeBrowser.runtime, 'openOptionsPage').mockRejectedValue(new Error('失败'))
    const close = vi.spyOn(window, 'close').mockImplementation(() => undefined)
    const popup = await setup()
    await popup.openOptions()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'openFailed' }])
    expect(close).not.toHaveBeenCalled()
  })
})

describe('汉化开关', () => {
  it('常规区切换汉化后立即查询页面状态，不等轮询', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    await openTab(REPO_URL)
    let active = true
    const send = mockContent(message => (message.type === 'gcn:get-status' ? { ...STATUS, active } : undefined))
    const both = withScope(() => ({ popup: usePopup(), section: useSettings() }))
    try {
      await settle()
      const { popup, section } = both.result
      expect(popup.state.value).toBe('translated')
      active = false
      expect(await section.update({ translation: false })).toBe(true)
      await settle()
      expect(popup.state.value).toBe('translation-off')
      expect(messagesOf(send)).toEqual(['gcn:get-status', 'gcn:get-status'])
    } finally {
      both.stop()
    }
  })
})

describe('共用设置', () => {
  it('与常规、语言分区共用一份设置：分区写入后这里随之更新，只读一次存储', async () => {
    await settingsItem.setValue({ ...DEFAULT_SETTINGS, translateTitle: false })
    mockContent(contentWith())
    const get = vi.spyOn(fakeBrowser.storage.sync, 'get')
    const both = withScope(() => ({ popup: usePopup(), section: useSettings() }))
    try {
      await settle()
      const { popup, section } = both.result
      expect(get).toHaveBeenCalledTimes(1)
      expect(popup.settings.value.translateTitle).toBe(false)
      expect(await section.update({ translateTitle: true })).toBe(true)
      expect(popup.settings.value.translateTitle).toBe(true)
      expect(await section.update({ translateTitle: false })).toBe(true)
      expect(popup.settings.value.translateTitle).toBe(false)
    } finally {
      both.stop()
    }
  })
})

describe('提示', () => {
  it('连续失败只留一条；再次操作成功时收起', async () => {
    mockContent(contentWith())
    const popup = await setup()
    const set = vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValue(new Error('配额'))
    await popup.setEnabled(false)
    await popup.cycleTheme()
    expect(shownToasts()).toEqual([{ tone: 'danger', key: 'saveFailed' }])
    set.mockRestore()
    await popup.setEnabled(false)
    expect(shownToasts()).toEqual([])
    expect((await getSettings()).enabled).toBe(false)
  })
})
