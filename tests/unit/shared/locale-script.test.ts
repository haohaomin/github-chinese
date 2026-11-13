import { fakeBrowser } from 'wxt/testing/fake-browser'
import { GITHUB_ORIGINS } from '../../../src/shared/github'
import { LOCALE_SCRIPT_ID, syncLocaleScript } from '../../../src/shared/locale-script'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'
import { removeApi } from './fake-api'
import { fakeContentScripts, type FakeContentScripts, type RegisteredScript } from './fake-scripting'

let scripts: FakeContentScripts
let registered: RegisteredScript[]

const settings = (patch: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...patch })

/** 已注册的词典脚本 */
const localeScript = (patch: Partial<RegisteredScript> = {}): RegisteredScript => ({
  id: LOCALE_SCRIPT_ID,
  matches: [...GITHUB_ORIGINS],
  js: ['locale-zh-cn.js'],
  runAt: 'document_start',
  persistAcrossSessions: true,
  ...patch
})

beforeEach(() => {
  fakeBrowser.reset()
  scripts = fakeContentScripts()
  registered = scripts.registered
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('syncLocaleScript', () => {
  it('开启时注册当前语言的词典脚本：document_start，站点与内容脚本相同，跨会话保留', async () => {
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    expect(registered).toEqual([localeScript({ js: ['locale-zh-tw.js'] })])
    expect(fakeBrowser.scripting.registerContentScripts).toHaveBeenCalledWith([expect.objectContaining({ persistAcrossSessions: true })])
  })

  it('语言自动时按浏览器环境选（测试环境无中文、时区非台港澳 → 简体）', async () => {
    await syncLocaleScript(settings({ language: 'auto' }))
    expect(registered[0]?.js).toEqual(['locale-zh-cn.js'])
  })

  it('语言自动时按 i18n.getAcceptLanguages 的语言列表（隐身窗口中 navigator.languages 被缩减）', async () => {
    vi.spyOn(fakeBrowser.i18n, 'getAcceptLanguages').mockResolvedValue(['en-US', 'zh-TW'] as never)
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US', 'en'])
    await syncLocaleScript(settings({ language: 'auto' }))
    expect(registered[0]?.js).toEqual(['locale-zh-tw.js'])
  })

  it('语言改变时更新为另一语言；与已注册的相同时不改动', async () => {
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    expect(registered).toHaveLength(1)
    expect(registered[0]?.js).toEqual(['locale-zh-tw.js'])
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(1)
    await syncLocaleScript(settings({ language: 'zh-TW', theme: 'dark' }))
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(1)
    expect(fakeBrowser.scripting.registerContentScripts).toHaveBeenCalledTimes(1)
  })

  it('同一设置同步两次：不更新，仍跨会话保留（浏览器按字符串排序返回站点列表）', async () => {
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
    expect(registered).toEqual([localeScript()])
  })

  it('改语言后仍跨会话保留：更新时显式写持久（Chromium 的更新不带该标志即改为仅本次会话）', async () => {
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledWith([expect.objectContaining({ persistAcrossSessions: true })])
    expect(registered).toEqual([localeScript({ js: ['locale-zh-tw.js'] })])
  })

  it('重启浏览器后注册保留', async () => {
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    scripts.restart()
    expect(registered).toEqual([localeScript({ js: ['locale-zh-tw.js'] })])
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(1)
  })

  it('已注册为仅本次会话：更新为持久', async () => {
    registered.push(localeScript({ persistAcrossSessions: false }))
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(1)
    scripts.restart()
    expect(registered).toEqual([localeScript()])
  })

  it('浏览器不返回持久标志时按持久，不更新', async () => {
    registered.push(localeScript({ persistAcrossSessions: undefined }))
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
  })

  it('浏览器返回的站点列表顺序不同、有重复：视为相同，不更新', async () => {
    const [first, ...rest] = GITHUB_ORIGINS
    registered.push(localeScript())
    vi.mocked(fakeBrowser.scripting.getRegisteredContentScripts).mockResolvedValueOnce([
      { ...localeScript(), matches: [...rest.reverse(), first!, first!] }
    ] as never)
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
  })

  it('浏览器返回的路径带开头的 / 时视为相同', async () => {
    registered.push({
      id: LOCALE_SCRIPT_ID,
      matches: [...GITHUB_ORIGINS],
      js: ['/locale-zh-cn.js'],
      runAt: 'document_start'
    })
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
  })

  it('已注册的站点列表不同（如缺少状态页）：更新', async () => {
    registered.push(localeScript({ matches: ['https://github.com/*', 'https://gist.github.com/*'] }))
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(new Set(registered[0]?.matches)).toEqual(new Set(GITHUB_ORIGINS))
  })

  it('企业版站点：站点加上已授权的企业版站点；站点变化时更新', async () => {
    const enterprise = ['*://github.example.com/*', '*://gist.github.example.com/*']
    await syncLocaleScript(settings({ language: 'zh-CN' }), enterprise)
    expect(registered).toEqual([localeScript({ matches: [...GITHUB_ORIGINS, ...enterprise] })])
    await syncLocaleScript(settings({ language: 'zh-CN' }), enterprise)
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
    await syncLocaleScript(settings({ language: 'zh-CN' }))
    expect(fakeBrowser.scripting.updateContentScripts).toHaveBeenCalledTimes(1)
    expect(registered).toEqual([localeScript()])
  })

  it('浏览器启动初期持久注册还在加载（查询不到，注册报 ID 已存在）：按已注册处理', async () => {
    registered.push(localeScript())
    vi.mocked(fakeBrowser.scripting.getRegisteredContentScripts).mockResolvedValueOnce([] as never)
    await expect(syncLocaleScript(settings({ language: 'zh-CN' }))).resolves.toBeUndefined()
    expect(registered).toEqual([localeScript()])
  })

  it('注册的其他错误照常抛出', async () => {
    vi.mocked(fakeBrowser.scripting.registerContentScripts).mockRejectedValueOnce(new Error('Invalid url pattern'))
    await expect(syncLocaleScript(settings())).rejects.toThrow('Invalid url pattern')
  })

  it('总开关关闭时注销；没有注册时不调用注销', async () => {
    await syncLocaleScript(settings({ enabled: false }))
    expect(fakeBrowser.scripting.unregisterContentScripts).not.toHaveBeenCalled()
    await syncLocaleScript(settings())
    expect(registered).toHaveLength(1)
    await syncLocaleScript(settings({ enabled: false }))
    expect(registered).toEqual([])
  })

  it('汉化关闭时注销（总开关开着，其他功能照常）；再开启时注册', async () => {
    await syncLocaleScript(settings())
    expect(registered).toHaveLength(1)
    await syncLocaleScript(settings({ translation: false }))
    expect(registered).toEqual([])
    await syncLocaleScript(settings({ translation: true }))
    expect(registered).toEqual([localeScript()])
  })

  it('Firefox（申请 scripting，查询按注册时的顺序返回站点列表）：照常注册，相同设置不更新', async () => {
    vi.stubEnv('FIREFOX', 'true')
    vi.mocked(fakeBrowser.scripting.getRegisteredContentScripts).mockImplementation((async () =>
      registered.map(script => ({ ...script }))) as never)
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    await syncLocaleScript(settings({ language: 'zh-TW' }))
    expect(registered).toEqual([localeScript({ js: ['locale-zh-tw.js'] })])
    expect(fakeBrowser.scripting.updateContentScripts).not.toHaveBeenCalled()
  })

  it('没有 scripting API：不处理、不报错', async () => {
    const restore = removeApi('scripting')
    try {
      await expect(syncLocaleScript(settings())).resolves.toBeUndefined()
    } finally {
      restore()
    }
  })
})
