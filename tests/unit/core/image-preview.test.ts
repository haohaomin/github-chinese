// @vitest-environment-options { "url": "https://github.com/vuejs/core" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createImagePreview,
  downloadName,
  imageSource,
  isFileImage,
  isImageLink,
  isPreviewable,
  type ImagePreview
} from '../../../src/core/image-preview'
import { VIEWER_HOST_ATTRIBUTE } from '../../../src/core/image-viewer'

/** 图片代理的地址：摘要 + 原地址的十六进制 */
const CAMO =
  'https://camo.githubusercontent.com/0123456789abcdef0123456789abcdef01234567/68747470733a2f2f6578616d706c652e636f6d2f612e706e67'
const CI = 'https://github.com/vuejs/core/actions'

/**
 * 正文：普通图片、表情、链到 CI 的徽章、链到自身的图片代理、加载失败的、不显示的；正文外一张；评论里一张与头像。
 * 可预览（按文档顺序）：a、camo、c
 */
const PAGE = `
<div class="markdown-body">
  <p><img id="a" src="https://example.com/a.png" alt="Sample text A"></p>
  <p><img id="emoji" class="emoji" src="https://example.com/emoji.png" alt=":smile:"></p>
  <p><a href="${CI}"><img id="badge" src="https://example.com/badge" alt="CI"></a></p>
  <p><a href="${CAMO}"><img id="camo" src="${CAMO}" alt="Sample text B"></a></p>
  <p><img id="broken" data-broken src="https://example.com/missing.png" alt=""></p>
  <p><img id="hidden" data-hidden src="https://example.com/hidden.png" alt=""></p>
</div>
<img id="outside" src="https://example.com/outside.png" alt="">
<div class="comment-body">
  <img id="c" src="https://example.com/c.png" alt="Sample text C">
  <img id="avatar" class="avatar" src="https://example.com/avatar.png" alt="@octocat">
</div>`

const open = vi.fn()
const fetchImage = vi.fn(async (): Promise<Blob> => new Blob(['x'], { type: 'image/png' }))
let active = true
let preview: ImagePreview

/** 宽x高；没写时为 [0, 0] */
function parseSize(value: string | undefined): [number, number] {
  const [width = 0, height = 0] = (value ?? '').split('x').map(Number)
  return [width, height]
}

/**
 * 放进页面；除标了 data-broken 的都已加载（固有尺寸 640x480，标了 data-natural（宽x高）的按该尺寸），
 * 标了 data-hidden 的不显示，标了 data-size（宽x高）的按该尺寸显示
 */
function render(html: string): void {
  document.body.innerHTML = html
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('data-broken')) {
      const [naturalWidth, naturalHeight] = img.dataset.natural ? parseSize(img.dataset.natural) : [640, 480]
      Object.defineProperty(img, 'naturalWidth', { value: naturalWidth, configurable: true })
      Object.defineProperty(img, 'naturalHeight', { value: naturalHeight, configurable: true })
    }
    if (img.hasAttribute('data-hidden')) {
      Object.defineProperty(img, 'getClientRects', { value: () => [], configurable: true })
    }
    const [width, height] = parseSize(img.dataset.size)
    if (width > 0 && height > 0) {
      Object.defineProperty(img, 'getBoundingClientRect', { value: () => new DOMRect(0, 0, width, height), configurable: true })
    }
  }
}

function img(id: string): HTMLImageElement {
  return document.getElementById(id) as HTMLImageElement
}

/** 传到页面（document 的捕获阶段）时默认行为是否已被取消；没传到（预览处理了，不再传给页面）时为 undefined */
let preventedAtPage: boolean | undefined

/**
 * 记下是否已取消，再取消：测试环境里未取消的链接点击（含带修饰键的）会真的跳转。
 * 在 document 的捕获阶段：预览在 window 的捕获阶段处理，之后才到这里
 */
function guard(event: Event): void {
  preventedAtPage = event.defaultPrevented
  event.preventDefault()
}

/** 单击；返回默认行为是否被取消（没传到页面时看事件本身） */
function click(target: Element, init: MouseEventInit = {}): boolean {
  preventedAtPage = undefined
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, button: 0, ...init })
  target.dispatchEvent(event)
  return preventedAtPage ?? event.defaultPrevented
}

function viewerPart<T extends Element = HTMLElement>(selector: string): T | null {
  return document.querySelector(`[${VIEWER_HOST_ATTRIBUTE}]`)?.shadowRoot?.querySelector<T>(selector) ?? null
}

beforeEach(() => {
  active = true
  preview = createImagePreview(document, { active: () => active, label: key => key, open, fetchImage })
  window.addEventListener('click', preview.onClick, { capture: true })
  document.addEventListener('click', guard, { capture: true })
  render(PAGE)
})

afterEach(() => {
  preview.close()
  window.removeEventListener('click', preview.onClick, { capture: true })
  document.removeEventListener('click', guard, { capture: true })
  vi.restoreAllMocks()
  vi.useRealTimers()
  open.mockClear()
  fetchImage.mockClear()
  document.body.innerHTML = ''
})

describe('isImageLink', () => {
  it.each([
    ['同一地址', 'https://example.com/a', 'https://example.com/a'],
    ['图片代理', CAMO, 'https://example.com/a.png'],
    ['上传的图片', 'https://user-images.githubusercontent.com/1/a', 'https://example.com/a'],
    ['私有上传的图片', 'https://private-user-images.githubusercontent.com/1/a?jwt=x', 'https://example.com/a'],
    ['路径以图片扩展名结尾', 'https://github.com/vuejs/core/blob/main/logo.SVG?raw=true', 'https://example.com/a']
  ])('%s：是', (_, href, src) => {
    expect(isImageLink(href, src)).toBe(true)
  })

  it.each([
    ['链到 CI', CI, 'https://example.com/badge.svg'],
    ['链到网站', 'https://vuejs.org/', 'https://example.com/logo.png'],
    ['非 http(s)', 'mailto:octocat@example.com', 'https://example.com/a.png'],
    ['地址无效', 'http://', 'https://example.com/a.png']
  ])('%s：否', (_, href, src) => {
    expect(isImageLink(href, src)).toBe(false)
  })
})

describe('imageSource', () => {
  it.each([
    ['https://example.com/a.png', 'https://example.com/a.png'],
    ['data:image/png;base64,AAAA', 'data:image/png;base64,AAAA'],
    ['blob:https://github.com/0f0f0f0f-0000-4000-8000-000000000000', 'blob:https://github.com/0f0f0f0f-0000-4000-8000-000000000000'],
    ['data:text/html,Sample', undefined],
    ['javascript:void(0)', undefined]
  ])('%s', (src, expected) => {
    const element = document.createElement('img')
    element.setAttribute('src', src)
    expect(imageSource(element)).toBe(expected)
  })

  it('没有地址', () => {
    expect(imageSource(document.createElement('img'))).toBeUndefined()
  })
})

describe('isPreviewable', () => {
  it.each([
    ['a', true],
    ['camo', true],
    ['c', true],
    ['emoji', false],
    ['avatar', false],
    ['badge', false],
    ['outside', false]
  ])('%s → %s', (id, expected) => {
    expect(isPreviewable(img(id))).toBe(expected)
  })

  it('表情元素里的图片、头像容器里的图片不预览', () => {
    render(
      '<div class="markdown-body"><g-emoji><img id="g" src="https://example.com/g.png"></g-emoji><span class="avatar"><img id="v" src="https://example.com/v.png"></span></div>'
    )
    expect(isPreviewable(img('g'))).toBe(false)
    expect(isPreviewable(img('v'))).toBe(false)
  })
})

/**
 * 链到别处的图片（作者给图片加的链接）：横幅、宽图预览；徽章（地址含 badge、shields，图片代理看原地址）、
 * 图标大小（显示的宽高都不超过 32px）的，以及链接不是 http(s) 的照常打开链接
 */
const LINKED = `
<div class="markdown-body">
  <p><a href="https://vuejs.org/"><img id="banner" src="https://example.com/assets/banner.png" alt="Sample text A"></a></p>
  <p><a href="${CI}"><img id="workflow" src="https://github.com/vuejs/core/actions/workflows/ci.yml/badge.svg" alt="CI"></a></p>
  <p><a href="https://www.npmjs.com/package/vue"><img id="shield" src="https://img.shields.io/npm/v/vue" alt="npm"></a></p>
  <p><a href="https://www.npmjs.com/package/vue"><img id="proxied" src="${CAMO}" data-canonical-src="https://img.shields.io/npm/v/vue" alt="npm"></a></p>
  <p><a href="https://example.com/chat"><img id="icon" data-size="24x24" src="https://example.com/chat.svg" alt="Chat"></a></p>
  <p><a href="mailto:octocat@example.com"><img id="mail" src="https://example.com/contact.png" alt="Mail"></a></p>
  <p><a href="https://example.com/sponsor"><img id="wide" data-size="150x30" src="https://example.com/wide.png" alt="Sample text B"></a></p>
</div>`

describe('链到别处的图片', () => {
  beforeEach(() => render(LINKED))

  it.each([
    ['banner', true],
    ['wide', true],
    ['workflow', false],
    ['shield', false],
    ['proxied', false],
    ['icon', false],
    ['mail', false]
  ])('%s → %s', (id, expected) => {
    expect(isPreviewable(img(id))).toBe(expected)
  })

  it('单击：不跳转，打开预览，可与其他可预览的图片切换；「打开链接」在新标签页打开图片的链接', () => {
    expect(click(img('banner'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('1 / 2')
    const link = viewerPart<HTMLButtonElement>('button[data-action="link"]')!
    expect(link.hidden).toBe(false)
    link.click()
    expect(open).toHaveBeenCalledExactlyOnceWith('https://vuejs.org/')
    viewerPart<HTMLButtonElement>('button[data-action="next"]')!.click()
    expect(viewerPart<HTMLImageElement>('.image')?.getAttribute('src')).toBe('https://example.com/wide.png')
    link.click()
    expect(open).toHaveBeenLastCalledWith('https://example.com/sponsor')
  })

  it.each(['workflow', 'shield', 'proxied', 'icon', 'mail'])('%s：照常打开链接', id => {
    expect(click(img(id))).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it.each<[string, MouseEventInit]>([
    ['中键', { button: 1 }],
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }]
  ])('%s 单击：照常打开链接', (_, init) => {
    expect(click(img('banner'), init)).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it('链到图片自身的：没有「打开链接」', () => {
    render('<div class="markdown-body"><a href="https://example.com/a.png"><img id="self" src="https://example.com/a.png"></a></div>')
    click(img('self'))
    expect(viewerPart<HTMLButtonElement>('button[data-action="link"]')?.hidden).toBe(true)
  })
})

/** GitHub 给没有链接的图片包上的链接：新标签页打开图片自身（图片代理的地址） */
function selfLink(id: string, src: string, attributes = ''): string {
  return `<a target="_blank" rel="noopener noreferrer nofollow" href="${src}"><img id="${id}" src="${src}" ${attributes}></a>`
}

/**
 * 徽章、图标：不论有没有链接都不预览，也不在切换之列。可预览（按文档顺序）：photo、strip、last
 */
const BADGES = `
<div class="markdown-body">
  <p><img id="photo" src="https://example.com/photo.png" alt="Sample text A"></p>
  <p>
    ${selfLink('stars', CAMO, 'data-canonical-src="https://img.shields.io/github/stars/vuejs/core.svg" alt="GitHub stars"')}
    ${selfLink('workflow', 'https://github.com/vuejs/core/actions/workflows/ci.yml/badge.svg', 'alt="CI"')}
    <a href="https://ci.example.com/vuejs/core"><img id="status" data-size="90x20" data-natural="90x20" src="https://ci.example.com/vuejs/core.svg" alt="Build"></a>
    ${selfLink('plain', 'https://ci.example.com/vuejs/core.svg?branch=main', 'data-size="90x20" data-natural="90x20" alt="Build"')}
  </p>
  <p>${selfLink('icon', 'https://example.com/icon.svg', 'data-size="16x16" alt="Sample text B"')}</p>
  <p>${selfLink('hidpi', 'https://example.com/button.png', 'data-size="120x20" data-natural="240x40" alt="Sample text C"')}</p>
  <p>${selfLink('strip', 'https://example.com/strip.png', 'data-size="900x28" data-natural="1920x60" alt="Sample text D"')}</p>
  <p><img id="last" src="https://example.com/last.png" alt="Sample text E"></p>
</div>`

describe('徽章、图标', () => {
  beforeEach(() => render(BADGES))

  it.each([
    ['photo', true],
    ['stars', false],
    ['workflow', false],
    ['status', false],
    ['plain', false],
    ['icon', false],
    ['hidpi', false],
    ['strip', true],
    ['last', true]
  ])('%s → %s', (id, expected) => {
    expect(isPreviewable(img(id))).toBe(expected)
  })

  it.each(['stars', 'workflow', 'plain', 'icon', 'hidpi'])('%s（没有链接）：不预览，照常打开 GitHub 加的链接', id => {
    expect(click(img(id))).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it('链到别处、地址里没有 badge 的徽章：照常打开链接', () => {
    expect(click(img('status'))).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it('不在切换之列；缩小一半以上的窄长图照常预览', () => {
    expect(click(img('photo'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('1 / 3')
    preview.close()
    expect(click(img('strip'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('2 / 3')
    expect(viewerPart<HTMLImageElement>('.image')?.getAttribute('src')).toBe('https://example.com/strip.png')
  })

  it('未加载完（没有固有尺寸）的：只按地址、显示大小判断', () => {
    render(
      `<div class="markdown-body">${selfLink('loading', 'https://example.com/loading.png', 'data-size="90x20" data-natural="0x0"')}</div>`
    )
    Object.defineProperty(img('loading'), 'complete', { value: false, configurable: true })
    expect(isPreviewable(img('loading'))).toBe(true)
  })
})

describe('文件页的图片', () => {
  /** 文件页上显示的图片文件本身（地址同页面加 ?raw=true，或换成 /raw/），另有一张别的图片 */
  const FILE_PAGE = `
<section>
  <div><img id="file" src="https://github.com/vuejs/core/blob/main/docs/logo.png?raw=true" alt="logo.png"></div>
  <img id="raw" src="https://github.com/vuejs/core/raw/main/docs/logo.png" alt="logo.png">
  <img id="other" src="https://github.com/vuejs/core/blob/main/docs/other.png?raw=true" alt="other.png">
  <img id="foreign" src="https://example.com/vuejs/core/blob/main/docs/logo.png?raw=true" alt="logo.png">
</section>`

  afterEach(() => {
    history.replaceState(null, '', '/vuejs/core')
  })

  it('文件页（/所有者/存储库/blob/…）：显示的图片文件本身可预览，其他图片不预览', () => {
    history.replaceState(null, '', '/vuejs/core/blob/main/docs/logo.png')
    render(FILE_PAGE)
    expect(isFileImage(img('file'))).toBe(true)
    expect(isFileImage(img('raw'))).toBe(true)
    expect(isFileImage(img('other'))).toBe(false)
    expect(isFileImage(img('foreign'))).toBe(false)
    expect(isPreviewable(img('file'))).toBe(true)
    expect(isPreviewable(img('other'))).toBe(false)
  })

  it('单击：打开预览，只有它一张', () => {
    history.replaceState(null, '', '/vuejs/core/blob/main/docs/logo.png')
    render(FILE_PAGE)
    expect(click(img('file'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('1 / 1')
    expect(viewerPart<HTMLImageElement>('.image')?.getAttribute('src')).toBe(
      'https://github.com/vuejs/core/blob/main/docs/logo.png?raw=true'
    )
  })

  it('不是文件页：不预览', () => {
    history.replaceState(null, '', '/vuejs/core/tree/main/docs')
    render(FILE_PAGE)
    expect(isFileImage(img('file'))).toBe(false)
    expect(click(img('file'))).toBe(false)
  })
})

describe('downloadName', () => {
  it.each<[string, string, string]>([
    ['https://example.com/docs/screen%20shot.png', '', 'screen shot.png'],
    ['https://example.com/a.gif', 'image/png', 'a.gif'],
    ['https://example.com/a', 'image/webp', 'a.webp'],
    ['https://example.com/a', 'IMAGE/JPEG', 'a.jpg'],
    ['https://example.com/file', '', 'file'],
    ['https://example.com/file', 'application/octet-stream', 'file'],
    [CAMO, 'image/png', 'image.png'],
    ['https://example.com/', 'image/png', 'image.png'],
    ['https://example.com/a%3Ab%22c%7Cd.png', '', 'a_b_c_d.png'],
    ['https://example.com/a%00%1F%7Fb.png', '', 'a_b.png'],
    ['https://example.com/%E0%A4%A.png', '', '%E0%A4%A.png'],
    ['data:image/svg+xml;base64,PHN2Zz4=', '', 'image.svg'],
    ['blob:https://github.com/0f0f0f0f-0000-4000-8000-000000000000', 'image/gif', 'image.gif']
  ])('%s（%s）→ %s', (url, type, expected) => {
    expect(downloadName(url, type)).toBe(expected)
  })
})

describe('单击', () => {
  it('取消默认行为，打开预览；可切换的是页面上可预览的图片，按文档顺序', () => {
    expect(click(img('camo'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('2 / 3')
    expect(viewerPart<HTMLImageElement>('.image')?.getAttribute('src')).toBe(CAMO)
    expect(viewerPart<HTMLImageElement>('.image')?.alt).toBe('Sample text B')
    preview.close()
    expect(viewerPart('.image')).toBeNull()
  })

  it('链到图片自身的链接：不跳转，打开预览', () => {
    render('<div class="markdown-body"><a href="https://example.com/a.png"><img id="linked" src="https://example.com/a.png"></a></div>')
    expect(click(img('linked'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('1 / 1')
  })

  it('处理的单击不再传给页面（GitHub 的自述文件不看 defaultPrevented，照样站内跳转）；不处理的照常传', () => {
    const page = vi.fn()
    document.addEventListener('click', page)
    try {
      click(img('a'))
      expect(page).not.toHaveBeenCalled()
      preview.close()
      click(img('badge'))
      expect(page).toHaveBeenCalledOnce()
    } finally {
      document.removeEventListener('click', page)
    }
  })

  it.each(['badge', 'emoji', 'avatar', 'outside', 'broken'])('%s：不处理', id => {
    expect(click(img(id))).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it('被点的图片总在列表里', () => {
    expect(click(img('hidden'))).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('3 / 4')
  })

  it('影子树里的图片：只有它一张', () => {
    const host = document.querySelector('.markdown-body')!.appendChild(document.createElement('div'))
    const root = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    inner.className = 'markdown-body'
    const shadowImage = document.createElement('img')
    shadowImage.src = 'https://example.com/shadow.png'
    Object.defineProperty(shadowImage, 'naturalWidth', { value: 640, configurable: true })
    inner.append(shadowImage)
    root.append(inner)
    expect(click(shadowImage)).toBe(true)
    expect(viewerPart('.counter')?.textContent).toBe('1 / 1')
  })

  it.each<[string, MouseEventInit]>([
    ['中键', { button: 1 }],
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }]
  ])('%s 单击：照常', (_, init) => {
    expect(click(img('a'), init)).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it('功能关闭：不处理', () => {
    active = false
    expect(click(img('a'))).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })

  it('先注册的处理已取消默认行为：不处理', () => {
    const cancel = (event: Event): void => event.preventDefault()
    window.removeEventListener('click', preview.onClick, { capture: true })
    window.addEventListener('click', cancel, { capture: true })
    window.addEventListener('click', preview.onClick, { capture: true })
    try {
      click(img('a'))
      expect(viewerPart('.viewer')).toBeNull()
    } finally {
      window.removeEventListener('click', cancel, { capture: true })
    }
  })

  it('不是图片：不处理', () => {
    const paragraph = document.querySelector('.markdown-body p')!
    expect(click(paragraph)).toBe(false)
    expect(viewerPart('.viewer')).toBeNull()
  })
})

describe('下载', () => {
  /** 拦下保存用的链接点击，记下地址与文件名 */
  function captureSaves(): { href: string; download: string }[] {
    const saves: { href: string; download: string }[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      saves.push({ href: this.href, download: this.download })
    })
    return saves
  }

  it('取回图片，按类型补扩展名保存；一分钟后释放 blob: 地址', async () => {
    const saves = captureSaves()
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://github.com/sample')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.useFakeTimers()
    click(img('camo'))
    viewerPart<HTMLButtonElement>('button[data-action="download"]')!.click()
    // 不用 vi.waitFor：假计时器下它会推进时间
    for (let round = 0; round < 10; round += 1) await Promise.resolve()
    expect(saves).toHaveLength(1)
    expect(fetchImage).toHaveBeenCalledExactlyOnceWith(CAMO)
    expect(create).toHaveBeenCalledOnce()
    expect(saves[0]).toEqual({ href: 'blob:https://github.com/sample', download: 'image.png' })
    expect(document.querySelector('a[download]')).toBeNull()
    vi.advanceTimersByTime(59_999)
    expect(revoke).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:https://github.com/sample')
    expect(open).not.toHaveBeenCalled()
  })

  it('data: 图片：直接保存，不取回', async () => {
    const saves = captureSaves()
    render('<div class="markdown-body"><img id="inline" src="data:image/png;base64,AAAA"></div>')
    click(img('inline'))
    viewerPart<HTMLButtonElement>('button[data-action="download"]')!.click()
    await vi.waitFor(() => expect(saves).toHaveLength(1))
    expect(saves[0]).toEqual({ href: 'data:image/png;base64,AAAA', download: 'image.png' })
    expect(fetchImage).not.toHaveBeenCalled()
  })

  it('取回失败：改为在新标签页打开', async () => {
    captureSaves()
    fetchImage.mockRejectedValueOnce(new Error('blocked'))
    click(img('a'))
    viewerPart<HTMLButtonElement>('button[data-action="download"]')!.click()
    await vi.waitFor(() => expect(open).toHaveBeenCalledExactlyOnceWith('https://example.com/a.png'))
  })

  it('默认的取回：同站带 Cookie；应答不成功或不是图片时失败', async () => {
    const saves = captureSaves()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://github.com/sample')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const responses = [
      { ok: true, blob: async () => new Blob(['x'], { type: 'image/webp' }) },
      { ok: false, blob: async () => new Blob(['x'], { type: 'image/png' }) },
      { ok: true, blob: async () => new Blob(['x'], { type: 'text/html' }) }
    ]
    const fetchMock = vi.fn(async () => responses.shift()!)
    vi.stubGlobal('fetch', fetchMock)
    try {
      const plain = createImagePreview(document, { active: () => true, label: key => key, open })
      window.removeEventListener('click', preview.onClick, { capture: true })
      window.addEventListener('click', plain.onClick, { capture: true })
      click(img('a'))
      const download = viewerPart<HTMLButtonElement>('button[data-action="download"]')!
      download.click()
      await vi.waitFor(() => expect(saves).toHaveLength(1))
      expect(fetchMock).toHaveBeenCalledWith('https://example.com/a.png', { credentials: 'same-origin' })
      expect(saves[0]!.download).toBe('a.png')
      download.click()
      await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(1))
      download.click()
      await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(2))
      expect(saves).toHaveLength(1)
      window.removeEventListener('click', plain.onClick, { capture: true })
      plain.close()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
