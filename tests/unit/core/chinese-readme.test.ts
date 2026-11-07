// @vitest-environment-options { "url": "https://github.com/octo-org/hello-world" }
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import {
  CLOAK_MS,
  createChineseReadme,
  findChineseReadme,
  isChineseText,
  isReadmeArticle,
  MAX_CACHED,
  NATIVE_ATTRIBUTE,
  parseRichText,
  README_ATTRIBUTE,
  readmeLocale,
  readmePage,
  tagLocale,
  type ChineseReadme,
  type ChineseReadmeOptions
} from '../../../src/core/chinese-readme'
import { translateMessage } from '../../../src/i18n'
import type { PageLocale, UiLanguage } from '../../../src/shared/locale'
import { settle } from './helpers'

const REPO = '/octo-org/hello-world'
const ZH_URL = `https://github.com${REPO}/blob/main/README.zh-CN.md`
const TW_URL = `https://github.com${REPO}/blob/main/README.zh-TW.md`

const ENGLISH = '<h1>Hello World</h1><p>An example project used in tests. Install the dependencies, then start the dev server.</p>'
const CHINESE = '<h1>你好世界</h1><p>这是测试用的示例项目，带一段简短的说明。安装依赖之后运行开发服务器，就能在浏览器里看到效果。</p>'
/** 自述文件开头的语言切换 */
const SWITCHER = `<p><a href="${REPO}/blob/main/README.zh-CN.md">简体中文</a> | English</p>`

/** 存储库首页：标题区（文件标签页，current 为选中的标签页图标）与自述文件正文 */
function overview(body: string, current: 'octicon-book' | 'octicon-law' = 'octicon-book'): string {
  const tab = (icon: string, text: string): string =>
    `<li><a href="#"${icon === current ? ' aria-current="page"' : ''}><svg class="octicon ${icon}"></svg><span>${text}</span></a></li>`
  return `<div class="Box_2__a1">
<div itemscope itemtype="https://schema.org/abstract" class="Box_3__b2"><nav aria-label="Repository files"><ul>${tab('octicon-book', 'README')}${tab('octicon-law', 'License')}</ul></nav></div>
<div class="SharedMarkdownContent__c3"><article class="markdown-body entry-content container-lg" itemprop="text">${body}</article></div>
</div>`
}

/** 目录页的自述文件 */
function directoryReadme(body: string): string {
  return `<div id="readme" class="readmeContainer__d4"><div class="readmeHeader__e5"><h2><a href="#readme">README.md</a></h2></div>
<div class="SharedMarkdownContent__c3"><article class="markdown-body entry-content container-lg" itemprop="text">${body}</article></div></div>`
}

/** 文件列表 */
function fileList(paths: readonly string[]): string {
  const rows = paths.map(
    path => `<tr><td><div class="react-directory-filename-cell"><a href="${REPO}/blob/main/${path}">${path}</a></div></td></tr>`
  )
  return `<table aria-labelledby="folders-and-files"><tbody>${rows.join('')}</tbody></table>`
}

/** 文件页的页面数据 */
function blobData(html: string, truncated = false): unknown {
  return {
    payload: {
      codeViewBlobRoute: {
        richText: `<article class="markdown-body entry-content container-lg" itemprop="text">${html}</article>`,
        richTextTruncated: truncated
      }
    }
  }
}

type FetchMock = Mock<(url: string, init: RequestInit) => Promise<Response>>

/** 应答：url 为跟随跳转后的地址 */
function respond(data: unknown, ok = true, url = ZH_URL): Response {
  return { ok, url, json: async () => data } as unknown as Response
}

/** 按地址应答的取回；没有的地址应答 404 */
function mockFetch(responses: Readonly<Record<string, unknown>> = { [ZH_URL]: blobData(CHINESE) }): FetchMock {
  return vi.fn(async (url: string, _init: RequestInit) =>
    Object.hasOwn(responses, url) ? respond(responses[url], true, url) : respond(null, false, url)
  )
}

/** 取回挂起，直到调用返回的 resolve */
function pendingFetch(): { readonly fetch: FetchMock; resolve: (response: Response) => void } {
  const result = {
    resolve: (_response: Response): void => undefined,
    fetch: vi.fn(
      (_url: string, _init: RequestInit) =>
        new Promise<Response>(done => {
          result.resolve = done
        })
    )
  }
  return result
}

/** 等变动回调、取回与解析完成 */
async function flush(): Promise<void> {
  for (let i = 0; i < 3; i += 1) await settle()
}

/** 只等微任务（定时器被模拟时） */
async function microtasks(): Promise<void> {
  for (let i = 0; i < 10; i += 1) await Promise.resolve()
}

const native = (): Element => document.querySelector('article[itemprop="text"]')!
const notice = (): Element | null => document.querySelector(`[${README_ATTRIBUTE}="notice"]`)
const content = (): Element | null => document.querySelector(`[${README_ATTRIBUTE}="content"]`)
const button = (): HTMLButtonElement => notice()!.querySelector('button')!

let settings: { active: boolean; locale: PageLocale }
let readme: ChineseReadme | undefined

function create(options: Partial<ChineseReadmeOptions> = {}): ChineseReadme {
  readme = createChineseReadme(document, {
    active: () => settings.active,
    locale: () => settings.locale,
    label: key => translateMessage('zh-CN', key),
    fetch: mockFetch(),
    ...options
  })
  return readme
}

beforeEach(() => {
  history.replaceState(null, '', REPO)
  settings = { active: true, locale: 'zh-CN' }
})

afterEach(() => {
  readme?.stop()
  readme = undefined
  vi.useRealTimers()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('readmeLocale', () => {
  // GitHub 上常见的中文版文件名（代码搜索 filename: 的结果数从多到少），另有目录与少见的写法
  it.each<[string, PageLocale]>([
    ['README.zh-CN.md', 'zh-CN'],
    ['README_zh.md', 'zh-CN'],
    ['README.zh.md', 'zh-CN'],
    ['README_CN.md', 'zh-CN'],
    ['README-CN.md', 'zh-CN'],
    ['README-zh.md', 'zh-CN'],
    ['README_zh-CN.md', 'zh-CN'],
    ['README.zh-TW.md', 'zh-TW'],
    ['README.cn.md', 'zh-CN'],
    ['README-zh_CN.md', 'zh-CN'],
    ['README_zh_CN.md', 'zh-CN'],
    ['README.zh_CN.md', 'zh-CN'],
    ['README.zh-Hans.md', 'zh-CN'],
    ['README_zh-TW.md', 'zh-TW'],
    ['README-zh-CN.md', 'zh-CN'],
    ['README.zh-Hant.md', 'zh-TW'],
    ['README_zh-Hans.md', 'zh-CN'],
    ['README_TW.md', 'zh-TW'],
    ['README.zh-HK.md', 'zh-TW'],
    ['README-zh-TW.md', 'zh-TW'],
    ['README_Chinese.md', 'zh-CN'],
    ['README_CHS.md', 'zh-CN'],
    ['README_中文.md', 'zh-CN'],
    ['README_CHT.md', 'zh-TW'],
    ['README.Chinese.md', 'zh-CN'],
    ['README_TC.md', 'zh-TW'],
    ['README_SC.md', 'zh-CN'],
    ['README-中文.md', 'zh-CN'],
    ['README_简体中文.md', 'zh-CN'],
    ['readme-cn.markdown', 'zh-CN'],
    ['README.zh-CN.rst', 'zh-CN'],
    ['README-chinese-traditional.md', 'zh-TW'],
    ['README.繁體中文.md', 'zh-TW'],
    ['docs/zh-CN/README.md', 'zh-CN'],
    ['zh/README.md', 'zh-CN'],
    ['i18n/zh-TW/README.md', 'zh-TW']
  ])('%s → %s', (path, locale) => {
    expect(readmeLocale(path.split('/'))).toBe(locale)
  })

  it.each([
    'README.md',
    'readme',
    'README.en.md',
    'README.ja-JP.md',
    'README_EN.md',
    'README.simplified.md',
    'README-tools.md',
    'README.版.md',
    'README_CN',
    'README_zh.txt',
    'README.zh.svg',
    'README_zh.pdf',
    'README.zh-CN.md.html',
    'docs/README.md',
    'zh-CN/docs/README.md',
    'zh-CN/guide.md',
    'CONTRIBUTING.zh-CN.md'
  ])('不是中文版：%s', path => {
    expect(readmeLocale(path.split('/'))).toBeUndefined()
  })

  it('语言标记：zh 开头的按语言标签，其余由表示中文的词组成', () => {
    expect(tagLocale('zh_Hant_TW')).toBe('zh-TW')
    expect(tagLocale('CHS')).toBe('zh-CN')
    expect(tagLocale('cht')).toBe('zh-TW')
    expect(tagLocale('traditional')).toBeUndefined()
    expect(tagLocale('繁中')).toBe('zh-TW')
    expect(tagLocale('')).toBeUndefined()
  })
})

describe('readmePage', () => {
  it('存储库首页、目录页：存储库小写，目录去掉引用', () => {
    expect(readmePage(new URL('https://github.com/Octo-Org/Hello-World'))).toEqual({ repo: '/octo-org/hello-world', directory: [] })
    expect(readmePage(new URL(`https://github.com${REPO}/tree/main`))?.directory).toEqual([])
    expect(readmePage(new URL(`https://github.com${REPO}/tree/main/packages/%E4%B8%AD%E6%96%87/`))?.directory).toEqual(['packages', '中文'])
    expect(readmePage(new URL(`https://github.example.com${REPO}`))?.repo).toBe(REPO)
  })

  it.each([
    'https://github.com/',
    'https://github.com/octo-org',
    'https://github.com/orgs/octo-org/repositories',
    'https://github.com/settings/profile',
    `https://github.com${REPO}/issues`,
    `https://github.com${REPO}/blob/main/README.md`,
    `https://github.com${REPO}/tree`,
    'https://gist.github.com/octocat/0123456789abcdef',
    'https://github.example.com/gist/octocat/0123456789abcdef',
    'https://www.githubstatus.com/'
  ])('其他页面：%s', url => {
    expect(readmePage(new URL(url))).toBeUndefined()
  })
})

describe('parseRichText', () => {
  it('取 payload.codeViewBlobRoute.richText；没有、类型不符、被截断时为 undefined', () => {
    expect(parseRichText({ payload: { codeViewBlobRoute: { richText: '<p>x</p>', richTextTruncated: false } } })).toBe('<p>x</p>')
    expect(parseRichText({ payload: { codeViewBlobRoute: { richText: '<p>x</p>', richTextTruncated: true } } })).toBeUndefined()
    expect(parseRichText({ payload: { codeViewBlobRoute: { richText: null, rawLines: ['x'] } } })).toBeUndefined()
    expect(parseRichText({ payload: { codeViewTreeRoute: {} } })).toBeUndefined()
    expect(parseRichText(null)).toBeUndefined()
    expect(parseRichText('x')).toBeUndefined()
  })
})

describe('isChineseText', () => {
  function element(html: string): Element {
    const div = document.createElement('div')
    div.innerHTML = html
    return div
  }

  it('英文正文（带语言切换链接）不算；中文正文算，代码不计', () => {
    expect(isChineseText(element(`<p><a href="#">简体中文</a> | <a href="#">日本語</a></p>${ENGLISH}`))).toBe(false)
    expect(isChineseText(element(CHINESE))).toBe(true)
    expect(isChineseText(element(`<pre><code>${'const value = compute(input)\n'.repeat(80)}</code></pre>${CHINESE}`))).toBe(true)
  })

  it('超长的文本节点只看开头一段', () => {
    expect(isChineseText(element(`<p>${'a'.repeat(3000)}${'中'.repeat(5000)}</p>`))).toBe(false)
  })

  it('文字太少（正文还在加载，只有语言切换链接）、日文：不算', () => {
    expect(isChineseText(element('<p><a href="#">简体中文</a> | English</p>'))).toBe(false)
    expect(
      isChineseText(
        element('<p>これはテスト用のサンプルプロジェクトです。依存関係をインストールしてから、開発サーバーを起動してください。</p>')
      )
    ).toBe(false)
  })
})

describe('isReadmeArticle', () => {
  it('存储库首页：选中的是自述文件标签页时是，其他标签页不是', () => {
    document.body.innerHTML = overview(ENGLISH)
    expect(isReadmeArticle(native())).toBe(true)
    document.body.innerHTML = overview(ENGLISH, 'octicon-law')
    expect(isReadmeArticle(native())).toBe(false)
  })

  it('目录页的自述文件区域里是；其他地方的正文不是', () => {
    document.body.innerHTML = directoryReadme(ENGLISH)
    expect(isReadmeArticle(native())).toBe(true)
    document.body.innerHTML = `<div><article class="markdown-body" itemprop="text">${ENGLISH}</article></div>`
    expect(isReadmeArticle(native())).toBe(false)
  })
})

describe('findChineseReadme', () => {
  function find(locale: PageLocale = 'zh-CN'): ReturnType<typeof findChineseReadme> {
    return findChineseReadme(document, native(), readmePage(location)!, locale)
  }

  it('自述文件里同一目录的链接：地址不带查询串与锚点', () => {
    document.body.innerHTML = overview(`<p><a href="${REPO}/blob/main/README.zh-CN.md?plain=1#top">core</a></p>${ENGLISH}`)
    expect(find()).toEqual({ url: ZH_URL, path: ['README.zh-CN.md'], locale: 'zh-CN' })
  })

  it('别的目录：链接文字、提示或图片的替代文字是语言名时才算', () => {
    document.body.innerHTML = overview(`<p><a href="${REPO}/blob/main/packages/core/README.zh-CN.md">core</a></p>${ENGLISH}`)
    expect(find()).toBeUndefined()
    for (const label of ['简体中文', '<img src="https://img.shields.io/badge/lang-zh--CN-red" alt="中文">', 'Chinese', 'zh-CN', '🇨🇳']) {
      document.body.innerHTML = overview(`<p><a href="${REPO}/blob/main/docs/README.zh-CN.md">${label}</a></p>${ENGLISH}`)
      expect(find()?.path, label).toEqual(['docs', 'README.zh-CN.md'])
    }
    document.body.innerHTML = overview(`<p><a href="${REPO}/blob/main/docs/zh-TW/README.md" title="繁體中文">📖</a></p>${ENGLISH}`)
    expect(find()).toMatchObject({ path: ['docs', 'zh-TW', 'README.md'], locale: 'zh-TW' })
  })

  it('有简体、繁体两种时按翻译语言选；没有相同的取第一个', () => {
    const tw = `<a href="${REPO}/blob/main/README.zh-TW.md">繁體中文</a>`
    const cn = `<a href="${REPO}/blob/main/README.zh-CN.md">简体中文</a>`
    document.body.innerHTML = overview(`<p>${tw} | ${cn}</p>${ENGLISH}`)
    expect(find('zh-CN')?.url).toBe(ZH_URL)
    expect(find('zh-TW')?.url).toBe(TW_URL)
    document.body.innerHTML = overview(`<p>${tw}</p>${ENGLISH}`)
    expect(find('zh-CN')?.url).toBe(TW_URL)
  })

  it('同为翻译语言的简繁时，同一目录的优先（子目录的自述文件链到根目录的中文版）；简繁优先于目录', () => {
    history.replaceState(null, '', `${REPO}/tree/main/packages/core`)
    const root = `<a href="https://github.com${REPO}/blob/main/README.zh-CN.md">中文介绍</a>`
    document.body.innerHTML =
      fileList(['packages/core/README.md', 'packages/core/README.zh-CN.md']) + directoryReadme(`<p>${root}</p>${ENGLISH}`)
    expect(find()?.path).toEqual(['packages', 'core', 'README.zh-CN.md'])
    const tw = `<a href="${REPO}/blob/main/docs/zh-TW/README.md">繁體中文</a>`
    document.body.innerHTML = fileList(['packages/core/README.zh-CN.md']) + directoryReadme(`<p>${tw}</p>${ENGLISH}`)
    expect(find('zh-TW')?.path).toEqual(['docs', 'zh-TW', 'README.md'])
    expect(find('zh-CN')?.path).toEqual(['packages', 'core', 'README.zh-CN.md'])
  })

  it('自述文件里没有链接时看文件列表', () => {
    document.body.innerHTML = fileList(['README.ja-JP.md', 'README.md', 'README.zh-CN.md']) + overview(ENGLISH)
    expect(find()?.url).toBe(ZH_URL)
  })

  it('目录页：同一目录的链接与文件', () => {
    history.replaceState(null, '', `${REPO}/tree/main/packages/core`)
    document.body.innerHTML = fileList(['packages/core/README.md', 'packages/core/README_zh.md']) + directoryReadme(ENGLISH)
    expect(find()?.path).toEqual(['packages', 'core', 'README_zh.md'])
    document.body.innerHTML = directoryReadme(`<p><a href="${REPO}/blob/main/packages/core/README.zh-TW.md">core</a></p>${ENGLISH}`)
    expect(find()?.path).toEqual(['packages', 'core', 'README.zh-TW.md'])
  })

  it('不算：显示的这个自述文件、别的存储库、别的站点、目录与 Raw 地址', () => {
    document.body.innerHTML = overview(`<p>
      <a href="${REPO}/blob/main/README.md">English</a>
      <a href="/octo-org/other/blob/main/README.zh-CN.md">中文</a>
      <a href="https://example.com${REPO}/blob/main/README.zh-CN.md">中文</a>
      <a href="${REPO}/tree/main/zh-CN">中文</a>
      <a href="${REPO}/raw/main/README.zh-CN.md">中文</a>
      <a href="https://raw.githubusercontent.com${REPO}/main/README.zh-CN.md">中文</a>
      <a href="${REPO}/blob/main/README.zh-CN%2F..%2F..%2Fsettings.md">中文</a>
    </p>${ENGLISH}`)
    expect(find()).toBeUndefined()
  })
})

describe('createChineseReadme', () => {
  it('同站带 Cookie 按 JSON 取回中文版，换上；原文隐藏，提示在前', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const fetch = mockFetch()
    create({ fetch })
    await flush()
    expect(fetch).toHaveBeenCalledExactlyOnceWith(ZH_URL, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('hidden')
    expect(content()?.className).toBe('markdown-body entry-content container-lg')
    expect(content()?.hasAttribute('itemprop')).toBe(false)
    expect(content()?.querySelector('h1')?.textContent).toBe('你好世界')
    expect(notice()?.getAttribute('translate')).toBe('no')
    expect(notice()?.textContent).toBe('已切换到中文版README.zh-CN.md·显示原文')
    expect(notice()?.querySelector('a')?.href).toBe(ZH_URL)
    expect(native().previousElementSibling).toBe(content())
    expect(content()?.previousElementSibling).toBe(notice())
  })

  it('显示原文：去掉中文版；本页面内（软导航后）保持原文；再显示中文版时不再取', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const fetch = mockFetch()
    create({ fetch })
    await flush()
    button().click()
    expect(content()).toBeNull()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    expect(notice()?.textContent).toBe('显示中文版')
    // 软导航回到同一存储库：自述文件重新渲染
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    await flush()
    expect(content()).toBeNull()
    expect(notice()?.textContent).toBe('显示中文版')
    button().click()
    await flush()
    expect(content()?.querySelector('h1')?.textContent).toBe('你好世界')
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('hidden')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('目录页：文件列表里的中文版，提示显示其路径', async () => {
    history.replaceState(null, '', `${REPO}/tree/main/packages/core`)
    const url = `https://github.com${REPO}/blob/main/packages/core/README_zh.md`
    document.body.innerHTML = fileList(['packages/core/README.md', 'packages/core/README_zh.md']) + directoryReadme(ENGLISH)
    create({ fetch: mockFetch({ [url]: blobData(CHINESE) }) })
    await flush()
    expect(notice()?.querySelector('a')?.textContent).toBe('packages/core/README_zh.md')
    expect(content()).not.toBeNull()
  })

  it('不取、不改：没有中文版、已是中文、选中其他标签页、其他页面、未开启', async () => {
    const fetch = mockFetch()
    create({ fetch })
    for (const html of [overview(ENGLISH), overview(SWITCHER + CHINESE), overview(SWITCHER + ENGLISH, 'octicon-law')]) {
      document.body.innerHTML = html
      await flush()
    }
    history.replaceState(null, '', `${REPO}/issues`)
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    await flush()
    history.replaceState(null, '', REPO)
    settings.active = false
    readme?.refresh()
    await flush()
    expect(fetch).not.toHaveBeenCalled()
    expect(document.querySelector(`[${README_ATTRIBUTE}], [${NATIVE_ATTRIBUTE}]`)).toBeNull()
  })

  it.each<[string, () => Promise<Response>]>([
    ['应答不成功', async () => respond(null, false)],
    ['不是标记语言文件', async () => respond({ payload: { codeViewBlobRoute: { richText: null } } })],
    ['正文被截断', async () => respond(blobData(CHINESE, true))],
    ['请求出错', async () => Promise.reject(new TypeError('offline'))]
  ])('取不到（%s）：保持原文，不提示；本页面内不再取', async (_, failure) => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const fetch = vi.fn(failure)
    create({ fetch })
    await flush()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    document.body.append(document.createElement('p'))
    await flush()
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    await flush()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('应答跳转到了别的站点：不用，保持原文', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create({ fetch: vi.fn(async () => respond(blobData(CHINESE), true, 'https://example.com/README.zh-CN.md')) })
    await flush()
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
  })

  it('取回时正文已完整、其实是中文：保持原文', async () => {
    document.body.innerHTML = overview(SWITCHER)
    const pending = pendingFetch()
    create({ fetch: pending.fetch })
    expect(pending.fetch).toHaveBeenCalledOnce()
    native().insertAdjacentHTML('beforeend', CHINESE)
    pending.resolve(respond(blobData('<p>简体中文版</p>')))
    await flush()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
  })

  it('新出现的自述文件在取回之前隐藏（留着位置），取回后换上；超时先显示原文', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const pending = pendingFetch()
    create({ fetch: pending.fetch })
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    readme?.refresh()
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('loading')
    vi.advanceTimersByTime(CLOAK_MS - 1)
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('loading')
    vi.advanceTimersByTime(1)
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    pending.resolve(respond(blobData(CHINESE)))
    await microtasks()
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('hidden')
    expect(content()).not.toBeNull()
  })

  it('开启后第一次扫描时已在页面上的自述文件（可能已显示）不隐藏', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const pending = pendingFetch()
    create({ fetch: pending.fetch })
    expect(pending.fetch).toHaveBeenCalledOnce()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    pending.resolve(respond(blobData(CHINESE)))
    await flush()
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('hidden')
  })

  it('关闭时还原；再开启时换上，取过的不再取', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const fetch = mockFetch()
    create({ fetch })
    await flush()
    settings.active = false
    readme?.refresh()
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    settings.active = true
    readme?.refresh()
    await flush()
    expect(content()).not.toBeNull()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('切换到其他标签页（正文换掉）：去掉加的元素', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    const wrapper = native().parentElement!
    document.querySelector('[aria-current="page"]')?.removeAttribute('aria-current')
    document.querySelector('.octicon-law')?.closest('a')?.setAttribute('aria-current', 'page')
    const license = document.createElement('article')
    license.className = 'markdown-body entry-content container-lg'
    license.setAttribute('itemprop', 'text')
    license.textContent = 'MIT License'
    native().replaceWith(license)
    await flush()
    expect(wrapper.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(license.hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
  })

  it('软导航后 React 沿用同一个正文元素、换了内容（页面路径变了）：按新页面重新处理', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const otherUrl = 'https://github.com/octo-org/other/blob/main/README_CN.md'
    const fetch = mockFetch({ [ZH_URL]: blobData(CHINESE), [otherUrl]: blobData('<p>另一个存储库的中文说明。</p>') })
    create({ fetch })
    await flush()
    const article = native()
    history.replaceState(null, '', '/octo-org/other')
    article.innerHTML = ENGLISH
    readme?.refresh()
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(article.hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    article.innerHTML = `<p><a href="/octo-org/other/blob/main/README_CN.md">中文</a></p>${ENGLISH}`
    await flush()
    expect(native()).toBe(article)
    expect(fetch).toHaveBeenLastCalledWith(otherUrl, expect.anything())
    expect(content()?.textContent).toBe('另一个存储库的中文说明。')
  })

  it('提示的内容没变时不重建：键盘焦点留在按钮上', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    const original = button()
    original.focus()
    readme?.refresh()
    await flush()
    expect(button()).toBe(original)
    expect(document.activeElement).toBe(original)
  })

  it('用键盘切换原文、中文版：焦点交给换上的按钮', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    button().focus()
    button().click()
    expect(document.activeElement).toBe(button())
    expect(button().textContent).toBe('显示中文版')
    button().click()
    await flush()
    expect(document.activeElement).toBe(button())
    expect(button().textContent).toBe('显示原文')
  })

  it('从原文换回中文版：只插入中文版正文，不挪动提示', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    button().click()
    const shown = notice()!
    const removed: Node[] = []
    const watcher = new MutationObserver(records => removed.push(...records.flatMap(record => [...record.removedNodes])))
    watcher.observe(native().parentNode!, { childList: true })
    button().click()
    await flush()
    watcher.disconnect()
    expect(content()).not.toBeNull()
    expect(notice()).toBe(shown)
    expect(removed).not.toContain(shown)
  })

  it('另一份扩展的元素插在中间：只看先后，不挪动（两边都要紧挨原文会来回挪，页面卡死）', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    const other = document.createElement('div')
    other.setAttribute(README_ATTRIBUTE, 'notice')
    native().before(other)
    await flush()
    expect(content()?.nextElementSibling).toBe(other)
    expect(other.nextElementSibling).toBe(native())
  })

  it('页面重新渲染后加的元素不在原处：放回', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    native().parentElement?.append(notice()!)
    await flush()
    expect(native().previousElementSibling).toBe(content())
    expect(content()?.previousElementSibling).toBe(notice())
  })

  it('翻译语言变了：换成对应简繁的中文版', async () => {
    document.body.innerHTML = overview(
      `<p><a href="${REPO}/blob/main/README.zh-CN.md">简体中文</a> | <a href="${REPO}/blob/main/README.zh-TW.md">繁體中文</a></p>${ENGLISH}`
    )
    create({ fetch: mockFetch({ [ZH_URL]: blobData(CHINESE), [TW_URL]: blobData('<p>繁體中文的說明。</p>') }) })
    await flush()
    expect(notice()?.querySelector('a')?.textContent).toBe('README.zh-CN.md')
    settings.locale = 'zh-TW'
    readme?.refresh()
    await flush()
    expect(notice()?.querySelector('a')?.textContent).toBe('README.zh-TW.md')
    expect(content()?.textContent).toBe('繁體中文的說明。')
    expect(document.querySelectorAll(`[${README_ATTRIBUTE}]`)).toHaveLength(2)
  })

  it('提示用扩展界面语言，界面语言变了随之更新', async () => {
    let language: UiLanguage = 'zh-TW'
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create({ label: key => translateMessage(language, key) })
    await flush()
    expect(notice()?.textContent).toBe('已切換到中文版README.zh-CN.md·顯示原文')
    language = 'en'
    readme?.refresh()
    expect(notice()?.textContent).toBe('Switched to the Chinese versionREADME.zh-CN.md·Show original')
  })

  it('中文版正文去掉脚本', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create({ fetch: mockFetch({ [ZH_URL]: blobData(`${CHINESE}<script>window.injected = true</script>`) }) })
    await flush()
    expect(content()?.querySelector('h1')).not.toBeNull()
    expect(content()?.querySelector('script')).toBeNull()
  })

  it('没有中文版：页面加载完后记下结果，不再随页面变动反复找；正文内容换了再找', async () => {
    document.body.innerHTML = overview(ENGLISH)
    const fetch = mockFetch()
    create({ fetch })
    const spy = vi.spyOn(document, 'querySelectorAll')
    for (let i = 0; i < 3; i += 1) {
      document.body.append(document.createElement('p'))
      await flush()
    }
    expect(spy.mock.calls.filter(([selector]) => String(selector).includes('react-directory-filename-cell'))).toEqual([])
    spy.mockRestore()
    native().innerHTML = SWITCHER + ENGLISH
    await flush()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('页面还在加载时没找到中文版：正文可能不完整，下次变动再找', async () => {
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true })
    try {
      document.body.innerHTML = overview(ENGLISH)
      const fetch = mockFetch()
      create({ fetch })
      native().insertAdjacentHTML('beforeend', SWITCHER)
      await flush()
      expect(fetch).toHaveBeenCalledOnce()
    } finally {
      delete (document as unknown as Record<string, unknown>).readyState
    }
  })

  it('重新处理同一个正文元素（翻译语言变了）：之前的隐藏时限到了也不提前显示', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    create({ fetch: pendingFetch().fetch })
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    readme?.refresh()
    vi.advanceTimersByTime(CLOAK_MS / 2)
    settings.locale = 'zh-TW'
    readme?.refresh()
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('loading')
    vi.advanceTimersByTime(CLOAK_MS / 2)
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe('loading')
    vi.advanceTimersByTime(CLOAK_MS / 2)
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
  })

  it(`本页面内最近取过的 ${MAX_CACHED} 个不再取，更早的再取`, async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) => respond(blobData(CHINESE)))
    create({ fetch })
    const visit = async (index: number): Promise<void> => {
      const repo = `/octo-org/repo-${index}`
      history.replaceState(null, '', repo)
      document.body.innerHTML = overview(`<p><a href="${repo}/blob/main/README.zh-CN.md">简体中文</a></p>${ENGLISH}`)
      await flush()
    }
    for (let index = 0; index <= MAX_CACHED; index += 1) await visit(index)
    await visit(MAX_CACHED)
    expect(fetch).toHaveBeenCalledTimes(MAX_CACHED + 1)
    await visit(0)
    expect(fetch).toHaveBeenCalledTimes(MAX_CACHED + 2)
  })

  describe('选了原文的存储库', () => {
    const CN_PATH = `${REPO}/blob/main/README_CN.md`
    const CN_SWITCHER = `<p><a href="${CN_PATH}">中文</a></p>`

    /** 先显示中文版、选原文，再换成链到 README_CN.md 的自述文件（软导航） */
    async function chooseOriginal(cn: () => Promise<Response>): Promise<FetchMock> {
      document.body.innerHTML = overview(SWITCHER + ENGLISH)
      const fetch: FetchMock = vi.fn(async (url: string, _init: RequestInit) => (url === ZH_URL ? respond(blobData(CHINESE)) : cn()))
      create({ fetch })
      await flush()
      button().click()
      document.body.innerHTML = overview(CN_SWITCHER + ENGLISH)
      await flush()
      return fetch
    }

    it('取回中连点「显示中文版」：取回后只换上一份', async () => {
      const pending = pendingFetch()
      const fetch = await chooseOriginal(() => pending.fetch('', {}))
      expect(button().textContent).toBe('显示中文版')
      button().click()
      button().click()
      expect(content()).toBeNull()
      pending.resolve(respond(blobData(CHINESE)))
      await flush()
      expect(document.querySelectorAll(`[${README_ATTRIBUTE}="content"]`)).toHaveLength(1)
      expect(notice()?.textContent).toBe('已切换到中文版README_CN.md·显示原文')
      expect(fetch.mock.calls.filter(([url]) => url.endsWith('README_CN.md'))).toHaveLength(1)
    })

    it('中文版取不到：不提示', async () => {
      await chooseOriginal(async () => respond(null, false))
      expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
      expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    })
  })

  it.each<[string, () => Promise<Response>]>([
    ['取到中文版', async () => respond(blobData(CHINESE))],
    ['取不到', async () => respond(null, false)]
  ])('销毁的实例（Firefox 更新扩展）留下的元素与原文的标记：换上之前去掉（%s）', async (_, result) => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    native().setAttribute(NATIVE_ATTRIBUTE, 'hidden')
    native().insertAdjacentHTML('beforebegin', `<div ${README_ATTRIBUTE}="notice"></div><article ${README_ATTRIBUTE}="content"></article>`)
    create({ fetch: vi.fn(result) })
    await flush()
    expect(document.querySelectorAll(`[${README_ATTRIBUTE}]`)).toHaveLength(content() ? 2 : 0)
    expect(native().getAttribute(NATIVE_ATTRIBUTE)).toBe(content() ? 'hidden' : null)
  })

  it('停止时页面上还有另一份扩展加的元素：留着样式', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    const other = document.createElement('article')
    other.setAttribute(NATIVE_ATTRIBUTE, 'hidden')
    document.body.append(other)
    readme?.stop()
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(document.getElementById('gcn-readme-style')).not.toBeNull()
  })

  it('停止：还原，去掉加的元素与样式；取回中的结果丢弃，之后不再处理', async () => {
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    create()
    await flush()
    expect(document.getElementById('gcn-readme-style')).not.toBeNull()
    readme?.stop()
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
    expect(document.getElementById('gcn-readme-style')).toBeNull()
    document.body.innerHTML = overview(SWITCHER + ENGLISH)
    const pending = pendingFetch()
    create({ fetch: pending.fetch })
    readme?.stop()
    pending.resolve(respond(blobData(CHINESE)))
    await flush()
    readme?.refresh()
    expect(document.querySelector(`[${README_ATTRIBUTE}]`)).toBeNull()
    expect(native().hasAttribute(NATIVE_ATTRIBUTE)).toBe(false)
  })
})
