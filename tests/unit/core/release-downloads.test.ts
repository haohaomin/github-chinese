// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CACHE_TTL_MS,
  COUNT_ATTRIBUTE,
  createReleaseDownloads,
  LIMIT_RECHECK_MS,
  type ReleaseDownloads,
  type ReleaseDownloadsDeps
} from '../../../src/core/release-downloads'
import { translateMessage } from '../../../src/i18n'
import type { ReleaseCountsResult, ReleaseRef } from '../../../src/shared/github-api'

const RELEASES = 'https://github.com/vuejs/core/releases/download'
/** 测试的起始时刻（毫秒） */
const START = 1_800_000_000_000

/** 后台的结果：成功（限额已用完时另给重置时间） */
function ok(entries: readonly (readonly [string, number])[], limitedUntil?: number): ReleaseCountsResult {
  const counts = new Map(entries)
  return limitedUntil === undefined ? { kind: 'ok', counts } : { kind: 'ok', counts, limitedUntil }
}

function release(tag: string): ReleaseRef {
  return { owner: 'vuejs', repo: 'core', tag }
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
const requestMock = vi.fn<(release: ReleaseRef) => Promise<ReleaseCountsResult>>()

/** 请求过的标签（按先后） */
function requestedTags(): string[] {
  return requestMock.mock.calls.map(([value]) => value.tag)
}

function start(overrides: Partial<ReleaseDownloadsDeps> = {}): ReleaseDownloads {
  downloads = createReleaseDownloads(document, {
    active: () => active,
    lang: () => lang,
    label: count => translateMessage(lang === 'en' ? 'en' : 'zh-CN', 'downloadTimes', { count }),
    request: requestMock,
    now: () => now,
    ...overrides
  })
  return downloads
}

beforeEach(() => {
  now = START
  active = true
  lang = 'zh-CN'
  requestMock.mockReset()
  requestMock.mockImplementation(async () =>
    ok([
      ['vue.global.js', 12_345],
      ['vue.esm.js', 0]
    ])
  )
})

afterEach(() => {
  downloads?.stop()
  downloads = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createReleaseDownloads', () => {
  it('同一发行版的附件只请求一次；次数放在行左侧的末尾（附件名一侧靠右）；0 次照常显示', async () => {
    const list = addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`), assetRow('/vuejs/core/releases/download/v3.5.0/vue.esm.js')])
    start()
    expect(requestMock).toHaveBeenCalledExactlyOnceWith(release('v3.5.0'))
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
    expect(requestMock).toHaveBeenCalledOnce()
  })

  it('附件晚于脚本出现（展开附件）：出现时请求；有效期内再出现不重复请求，过期后重新请求', async () => {
    start()
    expect(requestMock).not.toHaveBeenCalled()
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledOnce()
    expect(counts()).toHaveLength(1)
    // 软导航后同一发行版的附件再次出现
    document.body.innerHTML = ''
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledOnce()
    expect(counts()).toHaveLength(1)
    now += CACHE_TTL_MS
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.esm.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledTimes(2)
  })

  it('不同发行版依次请求（同时只发一个）；标签含 /、文件名含中文时按解码后的值请求与匹配', async () => {
    requestMock.mockImplementation(async ({ tag }) => (tag === 'release/1.0' ? ok([['中文 包.zip', 7]]) : ok([['vue.global.js', 3]])))
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    addAssets([assetRow(`${RELEASES}/release/1.0/${encodeURIComponent('中文 包.zip')}`)])
    start()
    expect(requestMock).toHaveBeenCalledOnce()
    await settle()
    expect(requestedTags()).toEqual(['v3.5.0', 'release/1.0'])
    expect(counts().map(element => element.getAttribute('title'))).toEqual(['下载 3 次', '下载 7 次'])
  })

  it('关闭时不请求；开启后 refresh 补上；再关闭时移除显示与样式', async () => {
    active = false
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(requestMock).not.toHaveBeenCalled()
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
    expect(requestMock).not.toHaveBeenCalled()
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
    expect(requestMock).not.toHaveBeenCalled()
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
    expect(requestMock).toHaveBeenCalledOnce()
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

  it('限额用尽：暂停请求，到时间早于 LIMIT_RECHECK_MS 时按到时间；该发行版不记为失败，之后与新出现的一起请求', async () => {
    requestMock.mockResolvedValueOnce({ kind: 'limited', until: START + 30_000 })
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(counts()).toHaveLength(0)
    now = START + 29_999
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledOnce()
    now = START + 30_000
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    expect(requestedTags()).toEqual(['v3.5.0', 'v3.5.0', 'v3.4.0', 'v3.3.0'])
    expect(counts()).toHaveLength(3)
  })

  it('限额用尽、到时间较远：最多隔 LIMIT_RECHECK_MS 再问后台（填了令牌后不用等到重置）', async () => {
    const limited: ReleaseCountsResult = { kind: 'limited', until: START + 3_600_000 }
    requestMock.mockResolvedValueOnce(limited).mockResolvedValueOnce(limited)
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    now = START + LIMIT_RECHECK_MS - 1
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledOnce()
    // 再问一次仍用尽：只问了一个，再等 LIMIT_RECHECK_MS
    now = START + LIMIT_RECHECK_MS
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    expect(requestedTags()).toEqual(['v3.5.0', 'v3.5.0'])
    now = START + 2 * LIMIT_RECHECK_MS
    addAssets([assetRow(`${RELEASES}/v3.2.0/vue.global.js`)])
    await settle()
    expect(requestedTags()).toEqual(['v3.5.0', 'v3.5.0', 'v3.5.0', 'v3.4.0', 'v3.3.0', 'v3.2.0'])
    expect(counts()).toHaveLength(4)
  })

  it('本次成功但限额已用完：显示本次的次数，其余的到时之前不请求', async () => {
    requestMock.mockResolvedValueOnce(ok([['vue.global.js', 1]], START + 30_000))
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    start()
    await settle()
    expect(requestMock).toHaveBeenCalledOnce()
    expect(counts().map(element => element.getAttribute('title'))).toEqual(['下载 1 次'])
    now = START + 30_000
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    expect(requestedTags()).toEqual(['v3.5.0', 'v3.4.0', 'v3.3.0'])
  })

  it('失败、后台出错（如扩展已更新）：不显示，有效期内不重试，过期后重试', async () => {
    requestMock.mockResolvedValueOnce({ kind: 'failed' }).mockRejectedValueOnce(new Error('Extension context invalidated.'))
    addAssets([assetRow(`${RELEASES}/v1/vue.global.js`)])
    addAssets([assetRow(`${RELEASES}/v2/vue.global.js`)])
    start()
    await settle()
    expect(requestMock).toHaveBeenCalledTimes(2)
    addAssets([assetRow(`${RELEASES}/v1/vue.esm.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledTimes(2)
    expect(counts()).toHaveLength(0)
    now += CACHE_TTL_MS
    addAssets([assetRow(`${RELEASES}/v2/vue.esm.js`)])
    await settle()
    expect(requestedTags()).toEqual(['v1', 'v2', 'v1', 'v2'])
    expect(counts()).toHaveLength(4)
  })

  it('stop：移除显示；进行中的请求结果丢弃，之后不再请求', async () => {
    addAssets([assetRow(`${RELEASES}/v3.5.0/vue.global.js`)])
    start()
    await settle()
    expect(counts()).toHaveLength(1)
    let resolve: (result: ReleaseCountsResult) => void = () => undefined
    requestMock.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        })
    )
    addAssets([assetRow(`${RELEASES}/v3.4.0/vue.global.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledTimes(2)
    downloads!.stop()
    expect(counts()).toHaveLength(0)
    resolve(ok([['vue.global.js', 5]]))
    addAssets([assetRow(`${RELEASES}/v3.3.0/vue.global.js`)])
    await settle()
    expect(requestMock).toHaveBeenCalledTimes(2)
    expect(counts()).toHaveLength(0)
    expect(document.getElementById('gcn-downloads-style')).toBeNull()
  })
})
