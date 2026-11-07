import { fakeBrowser } from 'wxt/testing/fake-browser'
import {
  API_TIMEOUT_MS,
  createReleaseCountsService,
  DEFAULT_BLOCK_MS,
  fetchRateLimit,
  fetchReleaseCounts,
  githubTokenItem,
  normalizeToken,
  parseReleaseCounts,
  rateLimitedUntil,
  readGitHubToken,
  RELEASE_CACHE_MAX,
  RELEASE_CACHE_TTL_MS,
  releaseKey,
  releasePath,
  type ApiFetch,
  type ReleaseCountsResult,
  type ReleaseRef
} from '../../../src/shared/github-api'

const RELEASES = 'https://github.com/vuejs/core/releases/download'
const API = 'https://api.github.com'
/** 测试的起始时刻（毫秒） */
const START = 1_800_000_000_000
/** 占位令牌（运行时拼出，不是真实令牌） */
const FINE_GRAINED = `github_pat_${'x'.repeat(82)}`
const CLASSIC = `ghp_${'x'.repeat(36)}`
const LEGACY = '0123456789abcdef'.repeat(3).slice(0, 40)

const VUE: ReleaseRef = { owner: 'vuejs', repo: 'core', tag: 'v3.5.0' }

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' }, ...init })
}

function asset(name: string, count: number): Record<string, unknown> {
  return { name, browser_download_url: `${RELEASES}/v3.5.0/${encodeURIComponent(name)}`, download_count: count }
}

let now = START
const fetchMock = vi.fn<ApiFetch>()
const deps = { fetch: fetchMock, now: () => now }

beforeEach(() => {
  fakeBrowser.reset()
  now = START
  fetchMock.mockReset()
})

describe('normalizeToken', () => {
  it.each([FINE_GRAINED, CLASSIC, `gho_${'x'.repeat(36)}`, LEGACY])('合法：%s', token => {
    expect(normalizeToken(`  ${token}\n`)).toBe(token)
  })

  it.each([
    '',
    'token',
    `ghp_${'x'.repeat(10)}`,
    `github_pat_${'x'.repeat(10)}`,
    `${CLASSIC} ${CLASSIC}`,
    `Bearer ${CLASSIC}`,
    LEGACY.toUpperCase()
  ])('写法不符：%j', token => {
    expect(normalizeToken(token)).toBeUndefined()
  })
})

describe('readGitHubToken', () => {
  it('没有：空串；已保存：去掉空白后的令牌；写法不符：空串', async () => {
    expect(await readGitHubToken()).toBe('')
    await githubTokenItem.setValue(` ${CLASSIC} `)
    expect(await readGitHubToken()).toBe(CLASSIC)
    await githubTokenItem.setValue('not a token')
    expect(await readGitHubToken()).toBe('')
  })

  it('存在 storage.local（不随浏览器账号同步）', async () => {
    await githubTokenItem.setValue(CLASSIC)
    expect(await fakeBrowser.storage.local.get('githubToken')).toEqual({ githubToken: CLASSIC })
    expect(await fakeBrowser.storage.sync.get(null)).toEqual({})
  })

  it('读取失败：空串', async () => {
    vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValueOnce(new Error('storage unavailable'))
    expect(await readGitHubToken()).toBe('')
  })
})

describe('parseReleaseCounts', () => {
  it('按下载地址的文件名（解码后）；没有地址时用 name；跳过次数无效的附件', () => {
    const result = parseReleaseCounts({
      assets: [
        asset('a b.zip', 2),
        { name: 'c.zip', download_count: 3 },
        { name: 'd.zip', download_count: -1 },
        { name: 'e.zip', download_count: 1.5 },
        { name: 'f.zip', download_count: '4' },
        { browser_download_url: 'not a url', name: 'g.zip', download_count: 5 },
        { browser_download_url: `${RELEASES}/v1/%E0%A4%A.zip`, name: 'h.zip', download_count: 6 },
        null
      ]
    })
    expect([...result!]).toEqual([
      ['a b.zip', 2],
      ['c.zip', 3],
      ['g.zip', 5],
      ['h.zip', 6]
    ])
  })

  it.each([null, 'text', {}, { assets: {} }])('格式不符（%j）：undefined', data => {
    expect(parseReleaseCounts(data)).toBeUndefined()
  })
})

describe('rateLimitedUntil', () => {
  function response(status: number, headers: Record<string, string>): Pick<Response, 'status' | 'headers'> {
    return { status, headers: new Headers(headers) }
  }

  it('403 / 429 带 retry-after：按秒数', () => {
    expect(rateLimitedUntil(response(403, { 'retry-after': '30' }), START)).toBe(START + 30_000)
    expect(rateLimitedUntil(response(429, { 'retry-after': '5' }), START)).toBe(START + 5000)
  })

  it('剩余为 0：到重置时间；没给重置时间时暂停 DEFAULT_BLOCK_MS', () => {
    expect(rateLimitedUntil(response(403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000600' }), START)).toBe(
      1_800_000_600_000
    )
    expect(rateLimitedUntil(response(200, { 'x-ratelimit-remaining': '0' }), START)).toBe(START + DEFAULT_BLOCK_MS)
  })

  it('没有用尽：undefined', () => {
    expect(rateLimitedUntil(response(200, { 'x-ratelimit-remaining': '59' }), START)).toBeUndefined()
    expect(rateLimitedUntil(response(404, {}), START)).toBeUndefined()
    expect(rateLimitedUntil(response(200, { 'retry-after': '30' }), START)).toBeUndefined()
  })
})

describe('releasePath / releaseKey', () => {
  it('路径各段编码（标签可含 /）', () => {
    expect(releasePath({ owner: 'vuejs', repo: 'core', tag: 'release/1.0 中文' })).toBe(
      '/repos/vuejs/core/releases/tags/release%2F1.0%20%E4%B8%AD%E6%96%87'
    )
  })

  it('所有者、存储库不分大小写，标签区分', () => {
    expect(releaseKey({ owner: 'VueJS', repo: 'Core', tag: 'v1' })).toBe(releaseKey({ owner: 'vuejs', repo: 'core', tag: 'v1' }))
    expect(releaseKey({ owner: 'vuejs', repo: 'core', tag: 'V1' })).not.toBe(releaseKey({ owner: 'vuejs', repo: 'core', tag: 'v1' }))
  })
})

describe('fetchReleaseCounts', () => {
  it('不带令牌：不带 Cookie 与来源页，不加 Authorization', async () => {
    fetchMock.mockResolvedValueOnce(json({ assets: [asset('vue.global.js', 12_345)] }))
    expect(await fetchReleaseCounts(VUE, '', deps)).toEqual({ kind: 'ok', counts: new Map([['vue.global.js', 12_345]]) })
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${API}/repos/vuejs/core/releases/tags/v3.5.0`, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/vnd.github+json' },
      signal: expect.any(AbortSignal)
    })
  })

  it('带令牌：加 Authorization: Bearer', async () => {
    fetchMock.mockResolvedValueOnce(json({ assets: [] }))
    await fetchReleaseCounts(VUE, CLASSIC, deps)
    expect(fetchMock.mock.calls[0]![1].headers).toEqual({ Accept: 'application/vnd.github+json', Authorization: `Bearer ${CLASSIC}` })
  })

  it('令牌无效（401）：不带令牌再请求一次', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ message: 'Bad credentials' }, { status: 401 }))
      .mockResolvedValueOnce(json({ assets: [asset('a.zip', 1)] }))
    expect(await fetchReleaseCounts(VUE, CLASSIC, deps)).toEqual({ kind: 'ok', counts: new Map([['a.zip', 1]]) })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]![1].headers).toEqual({ Accept: 'application/vnd.github+json' })
  })

  it('不带令牌时 401：失败，不再请求', async () => {
    fetchMock.mockResolvedValue(json({}, { status: 401 }))
    expect(await fetchReleaseCounts(VUE, '', deps)).toEqual({ kind: 'failed' })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('限额用尽（403 剩余为 0）：limited，到重置时间', async () => {
    fetchMock.mockResolvedValueOnce(
      json(
        { message: 'API rate limit exceeded' },
        { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000600' } }
      )
    )
    expect(await fetchReleaseCounts(VUE, '', deps)).toEqual({ kind: 'limited', until: 1_800_000_600_000 })
  })

  it('本次成功但限额已用完：ok 带重置时间', async () => {
    fetchMock.mockResolvedValueOnce(json({ assets: [asset('a.zip', 1)] }, { headers: { 'x-ratelimit-remaining': '0' } }))
    expect(await fetchReleaseCounts(VUE, '', deps)).toEqual({
      kind: 'ok',
      counts: new Map([['a.zip', 1]]),
      limitedUntil: START + DEFAULT_BLOCK_MS
    })
  })

  it('404、网络错误、格式不符、JSON 解析失败：failed', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ message: 'Not Found' }, { status: 404 }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(json({ assets: 'none' }))
      .mockResolvedValueOnce(new Response('<html>', { status: 200 }))
    for (let index = 0; index < 4; index++) expect(await fetchReleaseCounts(VUE, '', deps)).toEqual({ kind: 'failed' })
  })

  it('超时：取消请求，failed', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fetchMock.mockImplementationOnce(
        (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          })
      )
      const result = fetchReleaseCounts(VUE, '', deps)
      await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS)
      expect(await result).toEqual({ kind: 'failed' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('默认用全局 fetch', async () => {
    const fetch = vi.fn(async () => json({ assets: [] }))
    vi.stubGlobal('fetch', fetch)
    try {
      expect(await fetchReleaseCounts(VUE, '')).toEqual({ kind: 'ok', counts: new Map() })
      expect(fetch).toHaveBeenCalledOnce()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('fetchRateLimit', () => {
  it('成功：取 resources.core 的总数、剩余、重置时间', async () => {
    fetchMock.mockResolvedValueOnce(json({ resources: { core: { limit: 5000, remaining: 4999, reset: 1_800_003_600, used: 1 } } }))
    expect(await fetchRateLimit(FINE_GRAINED, deps)).toEqual({ kind: 'ok', rate: { limit: 5000, remaining: 4999, reset: 1_800_003_600 } })
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${API}/rate_limit`, expect.objectContaining({ credentials: 'omit' }))
    expect(fetchMock.mock.calls[0]![1].headers).toMatchObject({ Authorization: `Bearer ${FINE_GRAINED}` })
  })

  it('令牌无效：unauthorized', async () => {
    fetchMock.mockResolvedValueOnce(json({ message: 'Bad credentials' }, { status: 401 }))
    expect(await fetchRateLimit(CLASSIC, deps)).toEqual({ kind: 'unauthorized' })
  })

  it.each([
    ['非 2xx', () => json({}, { status: 500 })],
    ['没有 core', () => json({ resources: {} })],
    ['数值无效', () => json({ resources: { core: { limit: '60', remaining: 60, reset: 1 } } })],
    ['不是对象', () => json(null)]
  ] as const)('%s：failed', async (_name, make) => {
    fetchMock.mockResolvedValueOnce(make())
    expect(await fetchRateLimit('', deps)).toEqual({ kind: 'failed' })
  })

  it('网络错误：failed', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    expect(await fetchRateLimit('', deps)).toEqual({ kind: 'failed' })
  })
})

describe('createReleaseCountsService', () => {
  const fetchCounts = vi.fn<(release: ReleaseRef, token: string) => Promise<ReleaseCountsResult>>()
  let token = ''

  function service(): ReturnType<typeof createReleaseCountsService> {
    return createReleaseCountsService({ fetchCounts, token: async () => token, now: () => now })
  }

  function counts(...entries: [string, number][]): ReleaseCountsResult {
    return { kind: 'ok', counts: new Map(entries) }
  }

  beforeEach(() => {
    token = ''
    fetchCounts.mockReset()
    fetchCounts.mockImplementation(async () => counts(['a.zip', 1]))
  })

  it('每次请求前读取令牌；有效期内用缓存（各标签页共用），过期后重新请求', async () => {
    const releases = service()
    token = CLASSIC
    expect(await releases.get(VUE)).toEqual(counts(['a.zip', 1]))
    expect(fetchCounts).toHaveBeenCalledExactlyOnceWith(VUE, CLASSIC)
    now += RELEASE_CACHE_TTL_MS - 1
    expect(await releases.get({ ...VUE, owner: 'VueJS' })).toEqual(counts(['a.zip', 1]))
    expect(fetchCounts).toHaveBeenCalledOnce()
    now += 1
    await releases.get(VUE)
    expect(fetchCounts).toHaveBeenCalledTimes(2)
  })

  it('同一发行版的并发请求合并为一次', async () => {
    const releases = service()
    const [first, second] = await Promise.all([releases.get(VUE), releases.get(VUE)])
    expect(first).toBe(second)
    expect(fetchCounts).toHaveBeenCalledOnce()
  })

  it('限额用尽：到时之前不请求，直接应答 limited；换了令牌（填写、清除）后照常请求', async () => {
    const releases = service()
    fetchCounts.mockResolvedValueOnce({ kind: 'limited', until: START + 60_000 })
    expect(await releases.get(VUE)).toEqual({ kind: 'limited', until: START + 60_000 })
    expect(await releases.get({ ...VUE, tag: 'v3.4.0' })).toEqual({ kind: 'limited', until: START + 60_000 })
    expect(fetchCounts).toHaveBeenCalledOnce()
    token = CLASSIC
    expect(await releases.get({ ...VUE, tag: 'v3.4.0' })).toEqual(counts(['a.zip', 1]))
    expect(fetchCounts).toHaveBeenLastCalledWith({ ...VUE, tag: 'v3.4.0' }, CLASSIC)
    // 新令牌也用尽：按新令牌的到时间；清除令牌后按 IP 的限额（已过期）照常请求
    fetchCounts.mockResolvedValueOnce({ kind: 'limited', until: START + 30_000 })
    expect(await releases.get({ ...VUE, tag: 'v3.3.0' })).toEqual({ kind: 'limited', until: START + 30_000 })
    expect(await releases.get({ ...VUE, tag: 'v3.3.0' })).toEqual({ kind: 'limited', until: START + 30_000 })
    now = START + 30_000
    expect(await releases.get({ ...VUE, tag: 'v3.3.0' })).toEqual(counts(['a.zip', 1]))
    expect(fetchCounts).toHaveBeenCalledTimes(4)
  })

  it('本次成功但限额已用完：缓存本次结果，其余的到时之前不请求', async () => {
    const releases = service()
    fetchCounts.mockResolvedValueOnce({ kind: 'ok', counts: new Map([['a.zip', 2]]), limitedUntil: START + 60_000 })
    await releases.get(VUE)
    expect(await releases.get(VUE)).toEqual(counts(['a.zip', 2]))
    expect(await releases.get({ ...VUE, tag: 'v3.4.0' })).toEqual({ kind: 'limited', until: START + 60_000 })
    now = START + 60_000
    await releases.get({ ...VUE, tag: 'v3.4.0' })
    expect(fetchCounts).toHaveBeenCalledTimes(2)
  })

  it('失败不缓存：下次再请求', async () => {
    const releases = service()
    fetchCounts.mockResolvedValueOnce({ kind: 'failed' })
    expect(await releases.get(VUE)).toEqual({ kind: 'failed' })
    expect(await releases.get(VUE)).toEqual(counts(['a.zip', 1]))
    expect(fetchCounts).toHaveBeenCalledTimes(2)
  })

  it(`缓存最多 ${RELEASE_CACHE_MAX} 个发行版：超出时丢弃最早的`, async () => {
    const releases = service()
    for (let index = 0; index <= RELEASE_CACHE_MAX; index++) await releases.get({ ...VUE, tag: `v${index}` })
    expect(fetchCounts).toHaveBeenCalledTimes(RELEASE_CACHE_MAX + 1)
    await releases.get({ ...VUE, tag: `v${RELEASE_CACHE_MAX}` })
    expect(fetchCounts).toHaveBeenCalledTimes(RELEASE_CACHE_MAX + 1)
    await releases.get({ ...VUE, tag: 'v0' })
    expect(fetchCounts).toHaveBeenCalledTimes(RELEASE_CACHE_MAX + 2)
  })
})
