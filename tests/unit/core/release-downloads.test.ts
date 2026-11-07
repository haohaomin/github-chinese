// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchLike } from '../../../src/core/folder-files'
import {
  CACHE_TTL_MS,
  COUNT_ATTRIBUTE,
  createReleaseDownloads,
  parseReleaseCounts,
  REQUEST_TIMEOUT_MS,
  type ReleaseDownloads,
  type ReleaseDownloadsDeps
} from '../../../src/core/release-downloads'
import { translateMessage } from '../../../src/i18n'

const RELEASES = 'https://github.com/vuejs/core/releases/download'
const API = 'https://api.github.com/repos/vuejs/core/releases/tags'
/** 测试的起始时刻（毫秒） */
const START = 1_800_000_000_000

interface AssetJson {
  readonly name: string
  readonly browser_download_url: string
  readonly download_count: number
}

function asset(tag: string, name: string, count: number): AssetJson {
  return { name, browser_download_url: `${RELEASES}/${tag}/${encodeURIComponent(name)}`, download_count: count }
}

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' }, ...init })
}

/** 附件行：左边图标与链接，右边摘要、大小、时间（同 GitHub 的发行版页面） */
function assetRow(href: string, options: { readonly size?: string; readonly digest?: boolean } = {}): string {
  const { size = '1.92 KB', digest = true } = options
  return `
    <li class="Box-row d-flex flex-column flex-md-row">
      <div class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <span class="d-flex flex-items-start">
          <svg class="octicon octicon-package"></svg>
          <a href="${href}" rel="nofollow" data-turbo="false" class="wb-break-all"><span class="text-bold">Sample text</span></a>
        </span>
      </div>
      <div class="d-flex flex-auto flex-justify-end flex-items-center col-md-6 ml-3">
        ${digest ? '<div class="d-flex flex-items-center flex-justify-end flex-1"><span class="Truncate">sha256:0123</span></div>' : ''}
        ${size ? `<span class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2" data-test="size">${size}</span>` : ''}
        <span class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2" data-test="time"><relative-time datetime="2026-10-26T19:19:59Z">Oct 26</relative-time></span>
      </div>
    </li>`
}

/** 页面上加一组附件（一个发行版的附件列表），返回列表 */
function addAssets(rows: readonly string[]): HTMLElement {
  const list = document.createElement('div')
  list.className = 'Box Box--condensed'
  list.innerHTML = `<ul>${rows.join('')}</ul>`
  document.body.append(list)
  return list
}

function counts(): Element[] {
  return [...document.querySelectorAll(`[${COUNT_ATTRIBUTE}]`)]
}

function countOf(row: Element): Element | null {
  return row.querySelector(`[${COUNT_ATTRIBUTE}]`)
}

/** 等请求（依次发出）与随后的重新扫描完成 */
async function settle(): Promise<void> {
  for (let tick = 0; tick < 10; tick++) await new Promise(done => setTimeout(done, 0))
}

let now = START
let active = true
let lang = 'zh-CN'
let downloads: ReleaseDownloads | undefined
const fetchMock = vi.fn<FetchLike>()

function start(overrides: Partial<ReleaseDownloadsDeps> = {}): ReleaseDownloads {
  downloads = createReleaseDownloads(document, {
    active: () => active,
    lang: () => lang,
    label: count => translateMessage(lang === 'en' ? 'en' : 'zh-CN', 'downloadTimes', { count }),
    fetch: fetchMock,
    now: () => now,
    ...overrides
  })
  return downloads
}

beforeEach(() => {
  now = START
  active = true
  lang = 'zh-CN'
  fetchMock.mockReset()
  fetchMock.mockImplementation(async url => {
    const tag = decodeURIComponent(String(url).split('/releases/tags/')[1] ?? '')
    return json({ tag_name: tag, assets: [asset(tag, 'vue.global.js', 12_345), asset(tag, 'vue.esm.js', 0)] })
  })
})

afterEach(() => {
  downloads?.stop()
  downloads = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createReleaseDownloads', () => {
  it('同一发行版的附件只请求一次（不带 Cookie 与来源页）；次数放在行左侧的末尾（附件名一侧靠右）；0 次照常显示', async () => {
    const list = addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`), assetRow('/vuejs/core/releases/download/v3.5.0/vue.esm.js')])
    start()
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(`${API}/v3.5.0`)
    expect(init).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/vnd.github+json' } })
    await settle()
    const [first, second] = [...list.querySelectorAll('.Box-row')]
    const element = countOf(first!)!
    expect(element.parentElement?.matches('.Box-row > .flex-justify-start')).toBe(true)
    expect(element.previousElementSibling?.querySelector('a')).not.toBeNull()
    expect(element.nextElementSibling).toBeNull()
    expect(element.className).toBe('color-fg-muted')
    expect(element.getAttribute('translate')).toBe('no')
    expect(element.getAttribute('title')).toBe('下载 12,345 次')
    expect(element.querySelector('svg.octicon-download')?.getAttribute('aria-hidden')).toBe('true')
    expect(element.querySelector('[aria-hidden="true"]:not(svg)')?.textContent).toBe('1.2万')
    expect(element.querySelector('.sr-only')?.textContent).toBe('下载 12,345 次')
    expect(countOf(second!)?.getAttribute('title')).toBe('下载 0 次')
    expect(document.getElementById('gcn-downloads-style')).not.toBeNull()
  })

  it('界面语言改了：refresh 后按新语言重写，不再请求', async () => {
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    lang = 'en'
    downloads!.refresh()
    await settle()
    const [element] = counts()
    expect(element?.getAttribute('title')).toBe('12,345 downloads')
    expect(element?.querySelector('[aria-hidden="true"]:not(svg)')?.textContent).toBe('12.3K')
    expect(counts()).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('附件晚于脚本出现（展开附件）：出现时请求；有效期内再出现不重复请求，过期后重新请求', async () => {
    start()
    expect(fetchMock).not.toHaveBeenCalled()
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(counts()).toHaveLength(1)
    // 软导航后同一发行版的附件再次出现
    document.body.innerHTML = ''
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(counts()).toHaveLength(1)
    now += CACHE_TTL_MS
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.esm.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('不同发行版依次请求（同时只发一个）；标签含 /、文件名含中文时按解码后的值匹配，请求时编码', async () => {
    fetchMock.mockImplementation(async url =>
      String(url).endsWith('/release%2F1.0')
        ? json({ assets: [asset('release/1.0', '中文 包.zip', 7)] })
        : json({ assets: [asset('v3.5.0', 'vue.global.js', 3)] })
    )
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    addAssets([assetRow(`${RELEASES}/release/1.0/${encodeURIComponent('中文 包.zip')}`)])
    start()
    expect(fetchMock).toHaveBeenCalledOnce()
    await settle()
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([`${API}/v3.5.0`, `${API}/release%2F1.0`])
    expect(counts().map(element => element.getAttribute('title'))).toEqual(['下载 3 次', '下载 7 次'])
  })

  it('关闭时不请求；开启后 refresh 补上；再关闭时移除显示与样式', async () => {
    active = false
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()
    active = true
    downloads!.refresh()
    await settle()
    expect(counts()).toHaveLength(1)
    active = false
    downloads!.refresh()
    expect(counts()).toHaveLength(0)
    expect(document.getElementById('gcn-downloads-style')).toBeNull()
  })

  it('非公开存储库的页面：不请求（企业版站点见 release-downloads-enterprise.test.ts）', async () => {
    document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="false">'
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('站外链接（加速选项）、源码包、不在附件行里的链接：不处理', async () => {
    addAssets([
      assetRow(`https://ghfast.top/${RELEASES}/v3.5.0/vue.global.js`),
      assetRow('https://github.com/vuejs/core/archive/refs/tags/v3.5.0.zip', { size: '', digest: false })
    ])
    const loose = document.createElement('a')
    loose.href = `${RELEASES}/v3.5.0/vue.global.js`
    document.body.append(loose)
    start()
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(counts()).toHaveLength(0)
  })

  it('加速选项另起的一行（插在附件名之后）：次数紧跟附件名，先后加入都一样', async () => {
    const list = addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`), assetRow(`${RELEASES}/v3.5.0/vue.esm.js`)])
    const [first, second] = [...list.querySelectorAll('.Box-row')]
    const nameOf = (row: Element): Element => row.querySelector('.flex-justify-start > .flex-items-start')!
    const optionsRow = (): HTMLElement => Object.assign(document.createElement('div'), { className: 'gcn-test-options' })
    // 加速选项先加
    nameOf(first!).after(optionsRow())
    start()
    await settle()
    expect(countOf(first!)?.previousElementSibling).toBe(nameOf(first!))
    expect(countOf(first!)?.nextElementSibling?.className).toBe('gcn-test-options')
    // 加速选项后加：插在附件名与次数之间，挪回去
    nameOf(second!).after(optionsRow())
    await settle()
    expect(countOf(second!)?.previousElementSibling).toBe(nameOf(second!))
    expect(countOf(second!)?.nextElementSibling?.className).toBe('gcn-test-options')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('行没有左侧容器时放在链接之后；返回结果中没有的附件不显示', async () => {
    const list = addAssets([
      `<li class="Box-row"><span class="name"><a href="${RELEASES}/v3.5.0/vue.global.js">vue.global.js</a></span></li>`,
      assetRow(`${RELEASES}/v3.5.0/missing.zip`)
    ])
    start()
    await settle()
    const [first, second] = [...list.querySelectorAll('.Box-row')]
    expect(countOf(first!)?.parentElement?.className).toBe('name')
    expect(countOf(first!)?.previousElementSibling?.tagName).toBe('A')
    expect(countOf(second!)).toBeNull()
  })

  it('限额用尽（403）：重置时间之前不再请求，之后照常请求', async () => {
    const reset = Math.floor(START / 1000) + 600
    fetchMock.mockResolvedValueOnce(
      json(
        { message: 'API rate limit exceeded' },
        { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) } }
      )
    )
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(counts()).toHaveLength(0)
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledOnce()
    now = reset * 1000
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    // 限额用尽时的发行版不记为失败：重置后与新出现的一起请求
    expect(fetchMock.mock.calls.slice(1).map(([url]) => url)).toEqual([`${API}/v3.5.0`, `${API}/v3.4.0`, `${API}/v3.3.0`])
    expect(counts()).toHaveLength(3)
  })

  it('限额用尽（429，retry-after）、本次成功但限额已用完：到时之前不再请求', async () => {
    fetchMock.mockResolvedValueOnce(json({}, { status: 429, headers: { 'retry-after': '30' } }))
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    now += 29_000
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledOnce()
    now += 1000
    fetchMock.mockImplementation(async () =>
      json({ assets: [asset('v3.5.0', 'vue.global.js', 1)] }, { headers: { 'x-ratelimit-remaining': '0' } })
    )
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    // 第一个成功后得知限额已用完（没给重置时间：暂停一段时间），其余的先不请求
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('请求失败（404、网络错误、格式不符）：不显示，有效期内不重试', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ message: 'Not Found' }, { status: 404 }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(json({ assets: 'none' }))
    addAssets([assetRow(`${RELEASES}/v1/vue.global.js`)])
    addAssets([assetRow(`${RELEASES}/v2/vue.global.js`)])
    addAssets([assetRow(`${RELEASES}/v3/vue.global.js`)])
    start()
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    addAssets([assetRow(`${RELEASES}/v1/vue.esm.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(counts()).toHaveLength(0)
  })

  it('stop：取消进行中的请求，移除显示，之后不再处理', async () => {
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(counts()).toHaveLength(1)
    let signal: AbortSignal | undefined
    fetchMock.mockImplementationOnce((_url, init) => {
      signal = init.signal ?? undefined
      return new Promise<Response>(() => undefined)
    })
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    downloads!.stop()
    expect(signal?.aborted).toBe(true)
    expect(counts()).toHaveLength(0)
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('请求超时：取消，记为失败，接着请求下一个发行版', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fetchMock.mockImplementationOnce(
        (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          })
      )
      addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
      addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
      start()
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([`${API}/v3.5.0`, `${API}/v3.4.0`])
      await vi.advanceTimersByTimeAsync(0)
      expect(counts()).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('parseReleaseCounts', () => {
  it('按下载地址的文件名（解码后）；没有地址时用 name；跳过次数无效的附件', () => {
    const result = parseReleaseCounts({
      assets: [
        asset('v1', 'a b.zip', 2),
        { name: 'c.zip', download_count: 3 },
        { name: 'd.zip', download_count: -1 },
        { name: 'e.zip', download_count: 1.5 },
        { name: 'f.zip', download_count: '4' },
        null
      ]
    })
    expect([...result!]).toEqual([
      ['a b.zip', 2],
      ['c.zip', 3]
    ])
  })

  it.each([null, 'text', {}, { assets: {} }])('格式不符（%j）：undefined', data => {
    expect(parseReleaseCounts(data)).toBeUndefined()
  })
})
