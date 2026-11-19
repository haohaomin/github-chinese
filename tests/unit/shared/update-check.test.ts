import { fakeBrowser } from 'wxt/testing/fake-browser'
import { REPOSITORY_URL } from '../../../src/shared/extension'
import { settingsItem } from '../../../src/shared/settings'
import {
  canCheckUpdates,
  checkForUpdate,
  checkLatestVersion,
  fetchLatestVersion,
  installSource,
  isNewerVersion,
  LATEST_RELEASE_URL,
  releaseUrl,
  releaseVersion,
  UPDATE_CHECK_DEPS,
  UPDATE_CHECK_TIMEOUT_MS,
  updateCheckItem,
  type UpdateCheckDeps
} from '../../../src/shared/update-check'
import { UPDATE_INTERVAL_MS } from '../../../src/shared/update-settings'

const NOW = Date.UTC(2026, 10, 1, 8)
const TAG_URL = `${REPOSITORY_URL}/releases/tag/v1.3.0`
const CWS_UPDATE_URL = 'https://clients2.google.com/service/update2/crx'
/** 默认的自动检查间隔（每天） */
const UPDATE_CHECK_INTERVAL_MS = UPDATE_INTERVAL_MS.daily

type FetchMock = ReturnType<typeof vi.fn<UpdateCheckDeps['fetch']>>

function makeDeps(overrides: Partial<UpdateCheckDeps> = {}): UpdateCheckDeps & { fetch: FetchMock } {
  return {
    fetch: vi.fn<UpdateCheckDeps['fetch']>(async () => ({ ok: true, url: TAG_URL })),
    now: () => NOW,
    manifest: () => ({ version: '1.2.0' }),
    installType: async () => 'development',
    policy: async () => ({ auto: true, intervalMs: UPDATE_CHECK_INTERVAL_MS }),
    ...overrides
  } as UpdateCheckDeps & { fetch: FetchMock }
}

/** 收集回调收到的版本号 */
async function collect(deps: UpdateCheckDeps): Promise<string[]> {
  const seen: string[] = []
  await checkLatestVersion(version => seen.push(version), deps)
  return seen
}

beforeEach(() => {
  fakeBrowser.reset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('installSource', () => {
  it.each([
    [{ update_url: CWS_UPDATE_URL }, 'normal', 'store'],
    [{ update_url: 'https://edge.microsoft.com/extensionwebstorebase/v1/crx' }, 'normal', 'store'],
    [{ update_url: CWS_UPDATE_URL }, 'admin', 'store'],
    [{}, 'admin', 'admin'],
    [{}, 'development', 'manual'],
    [{}, 'normal', 'manual'],
    [{}, 'sideload', 'manual'],
    [{}, 'other', 'manual'],
    [{}, undefined, 'manual'],
    [{ update_url: '' }, 'development', 'manual'],
    [{ update_url: 1 }, undefined, 'manual']
  ] as const)('manifest %j、installType %s → %s', (manifest, installType, source) => {
    expect(installSource(manifest, installType)).toBe(source)
  })
})

describe('isNewerVersion', () => {
  it.each([
    ['1.3.0', '1.2.0', true],
    ['1.10.0', '1.9.9', true],
    ['2.0', '1.9.9', true],
    ['1.2.0.1', '1.2.0', true],
    ['1.2.0', '1.2.0', false],
    ['1.2', '1.2.0', false],
    ['1.1.9', '1.2.0', false],
    ['1.3.0-beta.1', '1.2.0', false],
    ['', '1.2.0', false],
    ['1.3.0', '', false],
    ['1.3.0', 'dev', false]
  ])('%s 比 %s 新：%s', (candidate, current, newer) => {
    expect(isNewerVersion(candidate, current)).toBe(newer)
  })
})

describe('releaseVersion', () => {
  it.each([
    [TAG_URL, '1.3.0'],
    [`${REPOSITORY_URL}/releases/tag/1.3.0`, '1.3.0'],
    // 存储库改名、转移后 GitHub 跳转到新地址
    ['https://github.com/octocat/github-chinese/releases/tag/v2.0.1', '2.0.1'],
    [`${REPOSITORY_URL}/releases/tag/v1.3.0-beta.1`, undefined],
    [`${REPOSITORY_URL}/releases`, undefined],
    ['https://github.com/login?return_to=%2Freleases', undefined],
    ['https://example.com/setube/github-chinese/releases/tag/v1.3.0', undefined],
    ['', undefined]
  ])('%s → %s', (url, version) => {
    expect(releaseVersion(url)).toBe(version)
  })
})

it('releaseUrl：该版本的发行版页', () => {
  expect(releaseUrl('1.3.0')).toBe(TAG_URL)
  expect(LATEST_RELEASE_URL).toBe(`${REPOSITORY_URL}/releases/latest`)
})

describe('fetchLatestVersion', () => {
  it('HEAD 请求最新发行版，不带 Cookie 与来源页、不用缓存；从跳转后的地址取版本号', async () => {
    const deps = makeDeps()
    expect(await fetchLatestVersion(deps)).toBe('1.3.0')
    expect(deps.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = deps.fetch.mock.calls[0]!
    expect(url).toBe(LATEST_RELEASE_URL)
    expect(init).toMatchObject({
      method: 'HEAD',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer'
    })
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it.each([
    ['应答不成功', async () => ({ ok: false, url: TAG_URL })],
    ['没有发行版（停在发行版列表）', async () => ({ ok: true, url: `${REPOSITORY_URL}/releases` })],
    [
      '请求出错',
      async () => {
        throw new TypeError('Failed to fetch')
      }
    ]
  ] as const)('%s：undefined', async (_name, fetch) => {
    expect(await fetchLatestVersion(makeDeps({ fetch }))).toBeUndefined()
  })

  it('超时：中止请求，undefined', async () => {
    vi.useFakeTimers()
    const fetch = vi.fn<UpdateCheckDeps['fetch']>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        })
    )
    const pending = fetchLatestVersion(makeDeps({ fetch }))
    await vi.advanceTimersByTimeAsync(UPDATE_CHECK_TIMEOUT_MS)
    expect(await pending).toBeUndefined()
    expect(fetch.mock.calls[0]![1].signal?.aborted).toBe(true)
  })
})

describe('checkLatestVersion', () => {
  it.each([
    ['商店安装（manifest 带 update_url）', { manifest: () => ({ version: '1.2.0', update_url: CWS_UPDATE_URL }) }],
    ['企业策略部署', { installType: async () => 'admin' }]
  ] as const)('%s：不读缓存、不请求', async (_name, overrides) => {
    await updateCheckItem.setValue({ latest: '1.3.0', checkedAt: NOW })
    const deps = makeDeps(overrides)
    expect(await collect(deps)).toEqual([])
    expect(deps.fetch).not.toHaveBeenCalled()
  })

  it('手动安装、没有缓存：请求一次，回调最新版本号并写入缓存', async () => {
    const deps = makeDeps()
    expect(await collect(deps)).toEqual(['1.3.0'])
    expect(deps.fetch).toHaveBeenCalledTimes(1)
    expect(await updateCheckItem.getValue()).toEqual({ latest: '1.3.0', checkedAt: NOW })
  })

  it('缓存未过期：回调缓存的版本号，不请求', async () => {
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW - UPDATE_CHECK_INTERVAL_MS + 1 })
    const deps = makeDeps()
    expect(await collect(deps)).toEqual(['1.2.5'])
    expect(deps.fetch).not.toHaveBeenCalled()
  })

  it('缓存过期：先回调缓存的版本号，再请求、回调并写入新的', async () => {
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW - UPDATE_CHECK_INTERVAL_MS })
    const deps = makeDeps()
    expect(await collect(deps)).toEqual(['1.2.5', '1.3.0'])
    expect(await updateCheckItem.getValue()).toEqual({ latest: '1.3.0', checkedAt: NOW })
  })

  it('缓存时间晚于当前（时钟回拨）：重新请求', async () => {
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW + 60_000 })
    const deps = makeDeps()
    expect(await collect(deps)).toEqual(['1.2.5', '1.3.0'])
    expect(deps.fetch).toHaveBeenCalledTimes(1)
  })

  it('请求失败：缓存不变，下次打开再请求', async () => {
    const stale = { latest: '1.2.5', checkedAt: NOW - UPDATE_CHECK_INTERVAL_MS }
    await updateCheckItem.setValue(stale)
    const deps = makeDeps({ fetch: vi.fn(async () => ({ ok: false, url: TAG_URL })) })
    expect(await collect(deps)).toEqual(['1.2.5'])
    expect(await updateCheckItem.getValue()).toEqual(stale)
  })

  it('缓存不合法：按没有缓存处理', async () => {
    await fakeBrowser.storage.local.set({ updateCheck: { latest: 3, checkedAt: 'x' } })
    const deps = makeDeps()
    expect(await collect(deps)).toEqual(['1.3.0'])
  })

  it('读缓存失败：照常请求', async () => {
    vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValue(new Error('存储不可用'))
    const deps = makeDeps()
    expect(await collect(deps)).toEqual(['1.3.0'])
  })

  it('写缓存失败：仍回调新版本号', async () => {
    vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValue(new Error('配额'))
    expect(await collect(makeDeps())).toEqual(['1.3.0'])
  })

  it('读安装方式出错：按手动安装处理', async () => {
    const deps = makeDeps({
      installType: async () => {
        throw new Error('不可用')
      }
    })
    expect(await collect(deps)).toEqual(['1.3.0'])
  })
})

describe('自动检查的设置', () => {
  it('关闭自动检查：回调缓存的版本号，不请求', async () => {
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW - 10 * UPDATE_CHECK_INTERVAL_MS })
    const deps = makeDeps({ policy: async () => ({ auto: false, intervalMs: UPDATE_CHECK_INTERVAL_MS }) })
    expect(await collect(deps)).toEqual(['1.2.5'])
    expect(deps.fetch).not.toHaveBeenCalled()
  })

  it('关闭自动检查、没有缓存：不回调、不请求', async () => {
    const deps = makeDeps({ policy: async () => ({ auto: false, intervalMs: UPDATE_CHECK_INTERVAL_MS }) })
    expect(await collect(deps)).toEqual([])
    expect(deps.fetch).not.toHaveBeenCalled()
  })

  it('按频率：每周时 3 天前检查过不请求，8 天前的请求', async () => {
    const weekly = { policy: async () => ({ auto: true, intervalMs: UPDATE_INTERVAL_MS.weekly }) }
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW - 3 * UPDATE_INTERVAL_MS.daily })
    const recent = makeDeps(weekly)
    expect(await collect(recent)).toEqual(['1.2.5'])
    expect(recent.fetch).not.toHaveBeenCalled()
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW - 8 * UPDATE_INTERVAL_MS.daily })
    const stale = makeDeps(weekly)
    expect(await collect(stale)).toEqual(['1.2.5', '1.3.0'])
  })

  it('读设置出错：按默认（开启、每天）', async () => {
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW - UPDATE_CHECK_INTERVAL_MS })
    const deps = makeDeps({
      policy: async () => {
        throw new Error('不可用')
      }
    })
    expect(await collect(deps)).toEqual(['1.2.5', '1.3.0'])
  })
})

describe('checkForUpdate', () => {
  it('不看缓存与设置，直接请求；取到的写入缓存', async () => {
    await updateCheckItem.setValue({ latest: '1.2.5', checkedAt: NOW })
    const deps = makeDeps({ policy: async () => ({ auto: false, intervalMs: UPDATE_CHECK_INTERVAL_MS }) })
    expect(await checkForUpdate(deps)).toBe('1.3.0')
    expect(deps.fetch).toHaveBeenCalledTimes(1)
    expect(await updateCheckItem.getValue()).toEqual({ latest: '1.3.0', checkedAt: NOW })
  })

  it('失败：undefined，缓存不变', async () => {
    const cached = { latest: '1.2.5', checkedAt: NOW - 1 }
    await updateCheckItem.setValue(cached)
    const deps = makeDeps({ fetch: vi.fn(async () => ({ ok: false, url: TAG_URL })) })
    expect(await checkForUpdate(deps)).toBeUndefined()
    expect(await updateCheckItem.getValue()).toEqual(cached)
  })
})

describe('canCheckUpdates', () => {
  it('手动安装为 true；商店安装、企业策略部署为 false', async () => {
    expect(await canCheckUpdates(makeDeps())).toBe(true)
    expect(await canCheckUpdates(makeDeps({ manifest: () => ({ version: '1.2.0', update_url: CWS_UPDATE_URL }) }))).toBe(false)
    expect(await canCheckUpdates(makeDeps({ installType: async () => 'admin' }))).toBe(false)
  })
})

describe('UPDATE_CHECK_DEPS', () => {
  function stubManagement(value: unknown): () => void {
    Object.defineProperty(fakeBrowser, 'management', { value, configurable: true, writable: true })
    return () => {
      delete (fakeBrowser as { management?: unknown }).management
    }
  }

  it('installType：取 management.getSelf() 的 installType（不需要 management 权限）', async () => {
    const restore = stubManagement({ getSelf: async () => ({ installType: 'admin' }) })
    try {
      expect(await UPDATE_CHECK_DEPS.installType()).toBe('admin')
    } finally {
      restore()
    }
  })

  it('installType：没有 management 时为 undefined', async () => {
    const restore = stubManagement(undefined)
    try {
      expect(await UPDATE_CHECK_DEPS.installType()).toBeUndefined()
    } finally {
      restore()
    }
  })

  it('manifest：读扩展的 manifest', () => {
    vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
      version: '1.2.0',
      update_url: CWS_UPDATE_URL
    } as never)
    expect(UPDATE_CHECK_DEPS.manifest()).toMatchObject({ update_url: CWS_UPDATE_URL })
  })

  it('policy：读设置的自动检查与频率', async () => {
    expect(await UPDATE_CHECK_DEPS.policy()).toEqual({ auto: true, intervalMs: UPDATE_INTERVAL_MS.daily })
    await settingsItem.setValue({ updateCheck: false, updateInterval: 'monthly' })
    expect(await UPDATE_CHECK_DEPS.policy()).toEqual({ auto: false, intervalMs: UPDATE_INTERVAL_MS.monthly })
  })
})
