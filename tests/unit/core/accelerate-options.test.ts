// @vitest-environment-options { "url": "https://github.com/vuejs/core/releases" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHealthCache, type HealthCache } from '../../../src/core/accelerate-health'
import {
  BUTTONS_ATTRIBUTE,
  CLONE_ATTRIBUTE,
  COPY_FEEDBACK_MS,
  createAccelerateOptions,
  FEEDBACK_ATTRIBUTE,
  GROUP_ATTRIBUTE,
  LABEL_ATTRIBUTE,
  OPTION_ATTRIBUTE,
  OWNER_ATTRIBUTE,
  ROW_ATTRIBUTE,
  type AccelerateOptions
} from '../../../src/core/accelerate-options'
import { translateMessage, type MessageKey } from '../../../src/i18n'
import type { SourceHealth } from '../../../src/shared/accelerate-categories'
import { DEFAULT_SETTINGS, type Settings } from '../../../src/shared/settings'

const RELEASE = 'https://github.com/vuejs/core/releases/download/v3.5.0/vue.global.js'
const ARCHIVE = 'https://github.com/vuejs/core/archive/refs/heads/main.zip'
const TAG_ZIP = 'https://github.com/vuejs/core/archive/refs/tags/v3.5.0.zip'
const TAG_TAR = 'https://github.com/vuejs/core/archive/refs/tags/v3.5.0.tar.gz'
const RAW = 'https://github.com/vuejs/core/raw/refs/heads/main/README.md'
const GIST_ARCHIVE = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/archive/c197afe.zip'
const GIST_RAW = 'https://gist.github.com/octocat/0831f3fbd83ac4d46451/raw/c197afe/sample.txt'
const CLONE = 'https://github.com/vuejs/core.git'
const CATEGORIES = ['gh-proxy', 'ghfast', 'wget.la', '其他']
/** 各分类都有可用的加速源；gh-proxy 中最快的是 gh-proxy.com */
const ALL_UP: SourceHealth = {
  'gh-proxy-hk': null,
  'gh-proxy-cdn': 300,
  'gh-proxy-com': 90,
  ghfast: 20,
  'wget-la': 50,
  'gh-monlor': 70
}

let settings: Settings
let options: AccelerateOptions | undefined
/** 后台的探测（内容脚本里由 createHealthCache 记住结果） */
const get = vi.fn(async (): Promise<SourceHealth> => ({}))
let health: HealthCache
const copy = vi.fn(async (_text: string): Promise<void> => undefined)
const label = (key: MessageKey): string => translateMessage('zh-CN', key)

/** 选项代为打开的地址（临时链接的单击） */
interface Followed {
  readonly href: string
  readonly target: string
  readonly download: boolean
  readonly rel: string
  readonly referrerPolicy: string
  readonly connected: boolean
}

function start(): AccelerateOptions {
  options = createAccelerateOptions(document, { settings: () => settings, health, copy, label })
  return options
}

/** 先记住一次探测结果（有效期内不再请求） */
async function knownHealth(value: SourceHealth): Promise<void> {
  get.mockResolvedValueOnce(value)
  await health.get()
  get.mockClear()
}

/** 后台的探测结果由用例给出 */
function deferHealth(): (value: SourceHealth) => void {
  let resolve: ((value: SourceHealth) => void) | undefined
  get.mockImplementation(
    () =>
      new Promise(done => {
        resolve = done
      })
  )
  return value => resolve?.(value)
}

/** 等 MutationObserver 回调、排队的扫描与探测结果 */
async function flush(): Promise<void> {
  await new Promise(done => setTimeout(done, 0))
}

function $<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T {
  const found = scope.querySelector<T>(selector)
  if (!found) throw new Error(`未找到：${selector}`)
  return found
}

function groups(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[${GROUP_ATTRIBUTE}]`)]
}

/** 克隆原元素加的同款元素 */
function clones(layout: 'menu' | 'button' | 'clone'): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[${CLONE_ATTRIBUTE}="${layout}"]`)]
}

function optionsIn(scope: Element | null | undefined): HTMLElement[] {
  return [...(scope?.querySelectorAll<HTMLElement>(`[${OPTION_ATTRIBUTE}]`) ?? [])]
}

function texts(scope: Element | null | undefined): string[] {
  return optionsIn(scope).map(option => option.textContent ?? '')
}

function option(scope: Element | null | undefined, name: string): HTMLElement {
  const found = optionsIn(scope).find(item => item.textContent === name)
  if (!found) throw new Error(`未找到选项：${name}`)
  return found
}

/** 同款按钮里的链接（同款按钮是链接本身或包着它的元素） */
function anchorOf(clone: HTMLElement): HTMLAnchorElement {
  return (clone.matches('a') ? clone : $('a', clone)) as HTMLAnchorElement
}

/** 同款菜单项的文字「原菜单项的文字 [分类名称]」里的分类名称 */
function menuNames(): string[] {
  return clones('menu').map(item => /\[(.+)\]$/.exec(item.textContent?.trim() ?? '')?.[1] ?? '')
}

/** 同款的克隆地址行：分类名称（地址框的无障碍名称）与地址 */
function cloneRows(): { readonly name: string | null; readonly value: string }[] {
  return clones('clone').map(row => {
    const field = $<HTMLInputElement>('input', row)
    return { name: field.getAttribute('aria-label'), value: field.value }
  })
}

function copyButton(name: string): HTMLButtonElement {
  const row = clones('clone').find(item => $('input', item).getAttribute('aria-label') === name)
  if (!row) throw new Error(`未找到地址行：${name}`)
  return $<HTMLButtonElement>(`button[${OPTION_ATTRIBUTE}]`, row)
}

/** 克隆里留下的 id 与引用 id 的属性、统计与测试标记 */
function strippedLeftovers(root: Element): string[] {
  const names = ['id', 'for', 'aria-labelledby', 'data-testid', 'data-dd-action-name', 'data-ga-click', 'data-item-id', 'data-autoselect']
  return [root, ...root.querySelectorAll('*')].flatMap(element => names.filter(name => element.hasAttribute(name)))
}

/** 发行版附件行（同 GitHub：图标与附件名在一个元素里，大小、时间在另一个） */
function releaseRow(href = RELEASE): HTMLAnchorElement {
  document.body.innerHTML = `<ul><li class="Box-row"><div><span class="asset"><svg></svg><a href="${href}"><span>vue.global.js</span></a></span></div><div><span>1 MB</span></div></li></ul>`
  return $<HTMLAnchorElement>('.asset a')
}

/** 附件名下方的一行 */
function assetRow(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.asset')?.nextElementSibling as HTMLElement | null
}

/** 存储库 Code 下拉框（同 Primer React：菜单项的文字在 Label 里，id 供 aria-labelledby 引用） */
function codeMenu(): void {
  document.body.innerHTML = `
    <ul data-component="ActionList" class="list">
      <li data-component="ActionList.Item" class="item"><button type="button">Open with GitHub Desktop</button></li>
      <li data-component="ActionList.Item" class="item"><a class="content" id="r1" aria-labelledby="r1--label" data-testid="download-zip" tabindex="0" rel="nofollow" href="${ARCHIVE}"><span class="visual"><svg class="octicon-file-zip"></svg></span><span class="sub"><span id="r1--label" class="label" data-component="ActionList.Item.Label">Download ZIP</span></span></a></li>
      <li data-component="ActionList.Item" class="item"><button type="button">Open in Copilot</button></li>
    </ul>`
}

/** 存储库 Code 下拉框的克隆地址（同 GitHub：无障碍标签、地址框、复制按钮与其提示框在一行里，下方是说明） */
function cloneTab(): HTMLInputElement {
  document.body.innerHTML = `
    <div class="panel">
      <div class="d-flex mb-2 clone"><label for="clone-with-https" class="sr-only">Clone with HTTPS url</label><input id="clone-with-https" class="form-control" data-autoselect="true" readonly type="text" value="${CLONE}"><button data-component="IconButton" type="button" class="icon-button" aria-labelledby="tip"><svg class="octicon-copy"></svg></button><span id="tip" popover="auto" aria-hidden="true">Copy URL to clipboard</span></div>
      <p class="caption">Clone using the web URL.</p>
    </div>`
  return $<HTMLInputElement>('#clone-with-https')
}

/** 单击选项（不触发链接的默认跳转）：返回是否被取消 */
function clickOption(target: HTMLElement, init: MouseEventInit = {}): boolean {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

/** 记录代为打开的地址 */
function captureFollow(): Followed[] {
  const followed: Followed[] = []
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    followed.push({
      href: this.href,
      target: this.target,
      download: this.hasAttribute('download'),
      rel: this.rel,
      referrerPolicy: this.referrerPolicy,
      connected: this.isConnected
    })
  })
  return followed
}

/** 测试环境不跳转：冒泡到文档时取消链接的默认行为 */
function blockNavigation(event: Event): void {
  event.preventDefault()
}

beforeEach(() => {
  settings = { ...DEFAULT_SETTINGS, accelerate: true }
  health = createHealthCache(get)
  document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="true">'
})

afterEach(() => {
  options?.stop()
  options = undefined
  get.mockReset()
  get.mockImplementation(async () => ({}))
  copy.mockReset()
  copy.mockImplementation(async () => undefined)
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.removeEventListener('click', blockNavigation)
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('createAccelerateOptions', () => {
  it('发行版附件：附件名下方另起一行各分类的按钮组（没有图标，与附件图标左对齐）；单击下载，不带来源页；原链接不变；文字不翻译', () => {
    const anchor = releaseRow()
    start()
    const row = assetRow()!
    expect(row.tagName).toBe('DIV')
    expect(row.getAttribute(ROW_ATTRIBUTE)).toBe('asset')
    expect(row.getAttribute('translate')).toBe('no')
    expect([...row.children].map(child => child.hasAttribute(GROUP_ATTRIBUTE))).toEqual([true])
    expect(row.querySelector('svg')).toBeNull()
    const group = row.querySelector(`[${GROUP_ATTRIBUTE}]`)!
    expect(group.getAttribute('role')).toBe('group')
    expect(group.getAttribute('aria-label')).toBe('加速下载')
    expect(group.querySelector(`[${LABEL_ATTRIBUTE}]`)).toBeNull()
    expect(group.querySelector(`[${BUTTONS_ATTRIBUTE}]`)?.children).toHaveLength(4)
    expect(texts(group)).toEqual(CATEGORIES)
    const ghfast = option(group, 'ghfast') as HTMLAnchorElement
    expect(ghfast.className).toBe('btn')
    expect(ghfast.href).toBe(`https://ghfast.top/${RELEASE}`)
    expect(ghfast.title).toBe('ghfast.top')
    expect(ghfast.hasAttribute('download')).toBe(true)
    expect(ghfast.rel).toBe('noopener noreferrer')
    expect(ghfast.referrerPolicy).toBe('no-referrer')
    expect((option(group, 'gh-proxy') as HTMLAnchorElement).href).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
    expect(anchor.href).toBe(RELEASE)
    expect(anchor.nextElementSibling).toBeNull()
  })

  it('样式：另起一行的按钮为小号、透明底的 btn，用 GitHub 的设计变量；附件行里另起的一行独占一行；Code 下拉框加了同款元素时限高', () => {
    releaseRow()
    start()
    const style = document.getElementById('gcn-accel-style')?.textContent ?? ''
    expect(style).toContain(`[${BUTTONS_ATTRIBUTE}] > .btn[${OPTION_ATTRIBUTE}]`)
    expect(style).toContain('height: 24px')
    expect(style).toContain('--borderColor-default')
    expect(style).toContain(`:has(> [${ROW_ATTRIBUTE}='asset'])`)
    expect(style).toContain(`[data-component='AnchoredOverlay']:has([${CLONE_ATTRIBUTE}])`)
  })

  it('标签列表：信息行下方另起一行，zip、tar.gz 各一组，组前标注；没有图标', () => {
    document.body.innerHTML = `
      <div class="Box-row"><div><h2><a href="https://github.com/vuejs/core/releases/tag/v3.5.0">v3.5.0</a></h2>
        <ul class="list-style-none"><li><a href="https://github.com/vuejs/core/commit/abc1234">abc1234</a></li><li><a href="${TAG_ZIP}">zip</a></li><li><a href="${TAG_TAR}"> tar.gz </a></li></ul>
      </div></div>`
    start()
    const rows = [...document.querySelectorAll(`[${ROW_ATTRIBUTE}]`)]
    expect(rows).toHaveLength(1)
    expect(rows[0]!.getAttribute(ROW_ATTRIBUTE)).toBe('tags')
    expect(rows[0]!.previousElementSibling?.tagName).toBe('UL')
    expect(rows[0]!.querySelector('svg')).toBeNull()
    const [zip, tar] = groups()
    expect(zip!.querySelector(`[${LABEL_ATTRIBUTE}]`)?.textContent).toBe('zip')
    expect(tar!.querySelector(`[${LABEL_ATTRIBUTE}]`)?.textContent).toBe('tar.gz')
    expect(zip!.getAttribute('aria-label')).toBe('加速下载 zip')
    expect(zip!.querySelector(`[${LABEL_ATTRIBUTE}]`)?.getAttribute('aria-hidden')).toBe('true')
    expect(texts(tar)).toEqual(CATEGORIES)
    expect((option(tar, 'ghfast') as HTMLAnchorElement).href).toBe(`https://ghfast.top/${TAG_TAR}`)
  })

  it('菜单里的源码包：原菜单项之后依次加同款菜单项（克隆原菜单项，去掉 id 与测试标记），文字为「原菜单项的文字 [分类名称]」', () => {
    codeMenu()
    start()
    const native = $('a[data-testid="download-zip"]').parentElement!
    const items = clones('menu')
    expect(items).toHaveLength(4)
    expect(items[0]!.previousElementSibling).toBe(native)
    expect(items[3]!.nextElementSibling?.textContent).toBe('Open in Copilot')
    expect(menuNames()).toEqual(CATEGORIES)
    const item = items[1]!
    expect(item.tagName).toBe('LI')
    expect(item.className).toBe('item')
    expect(item.getAttribute('data-component')).toBe('ActionList.Item')
    expect(item.getAttribute('translate')).toBe('no')
    expect(strippedLeftovers(item)).toEqual([])
    expect(item.querySelector('svg.octicon-file-zip')).not.toBeNull()
    const anchor = $<HTMLAnchorElement>(`a[${OPTION_ATTRIBUTE}]`, item)
    expect(anchor.className).toBe('content')
    expect(anchor.getAttribute('tabindex')).toBe('0')
    expect(anchor.href).toBe(`https://ghfast.top/${ARCHIVE}`)
    expect(anchor.title).toBe('ghfast.top')
    expect(anchor.hasAttribute('download')).toBe(true)
    expect(anchor.rel).toBe('noopener noreferrer')
    expect($('.label', item).textContent).toBe('Download ZIP [ghfast]')
    // 原菜单项不变
    expect(native.querySelector('a')?.getAttribute('href')).toBe(ARCHIVE)
    expect(native.querySelector('a')?.id).toBe('r1')
  })

  it('代码片段窄屏菜单（Primer ViewComponents）：文字去掉多余的空白；不显示不支持的分类（gh-proxy）；保留菜单项的角色', () => {
    document.body.innerHTML = `
      <ul class="ActionListWrap"><li class="ActionListItem" role="none" data-item-id="download" data-ga-click="Gist, download zip"><a role="menuitem" tabindex="-1" id="item-1" class="ActionListContent" href="${GIST_ARCHIVE}"><span class="ActionListItem-visual"><svg></svg></span><span class="ActionListItem-label">
        Download ZIP
      </span></a></li></ul>`
    start()
    expect(menuNames()).toEqual(['ghfast', 'wget.la', '其他'])
    const item = clones('menu')[0]!
    expect(item.getAttribute('role')).toBe('none')
    expect(strippedLeftovers(item)).toEqual([])
    const anchor = $<HTMLAnchorElement>('a', item)
    expect(anchor.getAttribute('role')).toBe('menuitem')
    expect($('.ActionListItem-label', item).textContent).toBe('Download ZIP [ghfast]')
  })

  it('同款菜单项的文字随原菜单项（汉化、还原只改文字）', async () => {
    codeMenu()
    start()
    const text = $('[data-testid="download-zip"] .label').firstChild as Text
    text.data = '下载 ZIP'
    await flush()
    expect(clones('menu').map(item => $('.label', item).textContent)).toEqual(CATEGORIES.map(name => `下载 ZIP [${name}]`))
    text.data = 'Download ZIP'
    await flush()
    expect($('.label', clones('menu')[0]!).textContent).toBe('Download ZIP [gh-proxy]')
  })

  it('文件页的 Raw 按钮：同一按钮组里 Raw 之后加同款按钮（文字为分类名称），复制、下载按钮在其后；在新标签页打开；去掉提示框与测试标记', () => {
    document.body.innerHTML = `
      <div data-component="ButtonGroup" class="group">
        <div class="group-item"><a data-testid="raw-button" data-dd-action-name="raw" class="button" href="${RAW}"><span data-component="buttonContent"><span data-component="text" class="label">Raw</span></span></a></div>
        <div class="group-item"><button type="button" aria-labelledby="tip-copy">copy</button><span id="tip-copy" popover="auto">Copy raw file</span></div>
      </div>`
    start()
    const raw = $('a[data-testid="raw-button"]')
    const items = clones('button')
    expect(items).toHaveLength(4)
    expect(items[0]!.previousElementSibling).toBe(raw.parentElement)
    expect(items[3]!.nextElementSibling?.textContent).toContain('copy')
    expect(items.map(item => item.className)).toEqual(Array.from({ length: 4 }, () => 'group-item'))
    expect(items.map(item => $('.label', item).textContent)).toEqual(CATEGORIES)
    expect(items.some(item => item.hasAttribute('data-gcn-accel-joined'))).toBe(false)
    const anchor = anchorOf(items[2]!)
    expect(anchor.className).toBe('button')
    expect(anchor.target).toBe('_blank')
    expect(anchor.hasAttribute('download')).toBe(false)
    expect(anchor.href).toBe(`https://wget.la/${RAW}`)
    expect(strippedLeftovers(items[2]!)).toEqual([])
    expect(raw.getAttribute('href')).toBe(RAW)
  })

  it('代码片段的 Raw、Download ZIP 按钮：其后加同款按钮；父元素不用 gap 排布时与原按钮拼成一组', () => {
    document.body.innerHTML = `
      <div class="file-actions"><a class="Button" href="${GIST_RAW}"><span class="Button-content"><span class="Button-label">Raw</span></span></a></div>
      <div class="toolbar" style="display: flex; column-gap: 8px"><a class="btn btn-sm" rel="nofollow" data-ga-click="Gist, download zip" href="${GIST_ARCHIVE}">Download ZIP</a></div>`
    start()
    const items = clones('button')
    const raw = items.filter(item => item.parentElement?.matches('.file-actions'))
    const zip = items.filter(item => item.parentElement?.matches('.toolbar'))
    expect(raw.map(item => $('.Button-label', item).textContent)).toEqual(CATEGORIES)
    expect(raw.every(item => item.matches(`a.Button[${OPTION_ATTRIBUTE}]`) && item.hasAttribute('data-gcn-accel-joined'))).toBe(true)
    expect(anchorOf(raw[0]!).target).toBe('_blank')
    expect(zip.map(item => item.textContent)).toEqual(['ghfast', 'wget.la', '其他'])
    expect(zip.some(item => item.hasAttribute('data-gcn-accel-joined'))).toBe(false)
    expect(strippedLeftovers(zip[0]!)).toEqual([])
    expect(anchorOf(zip[0]!).hasAttribute('download')).toBe(true)
  })

  it('克隆地址：原地址行之后依次加同款的行（克隆原行，地址框只读、显示加速后的地址），说明在其后；单击复制，图标换成已复制，稍后恢复', async () => {
    vi.useFakeTimers()
    cloneTab()
    start()
    const native = $('#clone-with-https').parentElement!
    const rows = clones('clone')
    expect(rows).toHaveLength(4)
    expect(rows[0]!.previousElementSibling).toBe(native)
    expect(rows[3]!.nextElementSibling?.className).toBe('caption')
    expect(cloneRows()).toEqual([
      { name: 'gh-proxy', value: `https://hk.gh-proxy.org/${CLONE}` },
      { name: 'ghfast', value: `https://ghfast.top/${CLONE}` },
      { name: 'wget.la', value: `https://wget.la/${CLONE}` },
      { name: '其他', value: `https://gh.monlor.com/${CLONE}` }
    ])
    const row = rows[2]!
    expect(row.className).toBe('d-flex mb-2 clone')
    expect(row.getAttribute('translate')).toBe('no')
    expect(strippedLeftovers(row)).toEqual([])
    expect(row.querySelector('label, [popover]')).toBeNull()
    const field = $<HTMLInputElement>('input', row)
    expect(field.readOnly).toBe(true)
    expect(field.className).toBe('form-control')
    expect(field.title).toBe('wget.la')
    const button = copyButton('wget.la')
    expect(button.className).toBe('icon-button')
    expect(button.type).toBe('button')
    expect(button.getAttribute('aria-label')).toBe('wget.la 复制加速链接')
    const icon = $('svg.octicon-copy', button)
    button.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(copy).toHaveBeenCalledExactlyOnceWith(`https://wget.la/${CLONE}`)
    expect(button.dataset.state).toBe('copied')
    expect(button.getAttribute('aria-label')).toBe('wget.la 已复制')
    const check = button.querySelector(`svg[${FEEDBACK_ATTRIBUTE}="copied"]`)
    expect(check?.getAttribute('class')).toBe('octicon octicon-check color-fg-success')
    expect(check?.getAttribute('fill')).toBe('currentColor')
    expect(icon.isConnected).toBe(false)
    await vi.advanceTimersByTimeAsync(COPY_FEEDBACK_MS)
    expect(button.dataset.state).toBeUndefined()
    expect(button.getAttribute('aria-label')).toBe('wget.la 复制加速链接')
    expect(button.querySelector(`[${FEEDBACK_ATTRIBUTE}]`)).toBeNull()
    expect(button.firstElementChild).toBe(icon)
  })

  it('同款地址框：聚焦时全选；单击时全选并复制，提示显示在复制按钮上', async () => {
    cloneTab()
    start()
    const field = $<HTMLInputElement>('input', clones('clone')[1]!)
    const select = vi.spyOn(field, 'select')
    field.dispatchEvent(new FocusEvent('focus'))
    expect(select).toHaveBeenCalledOnce()
    expect(copy).not.toHaveBeenCalled()

    field.click()
    await flush()
    expect(select).toHaveBeenCalledTimes(2)
    expect(copy).toHaveBeenCalledExactlyOnceWith(`https://ghfast.top/${CLONE}`)
    const button = copyButton('ghfast')
    expect(button.dataset.state).toBe('copied')
    expect(button.getAttribute('aria-label')).toBe('ghfast 已复制')
  })

  it('复制失败：显示复制失败', async () => {
    copy.mockRejectedValueOnce(new Error('denied'))
    cloneTab()
    start()
    const button = copyButton('ghfast')
    button.click()
    await flush()
    expect(button.dataset.state).toBe('failed')
    expect(button.getAttribute('aria-label')).toBe('ghfast 复制失败')
    expect(button.querySelector(`svg[${FEEDBACK_ATTRIBUTE}="failed"]`)?.getAttribute('class')).toBe('octicon octicon-x color-fg-danger')
  })

  it('原地址行没有复制按钮：另建，带复制图标', () => {
    document.body.innerHTML = `<div><input id="clone-with-https" readonly value="${CLONE}"></div>`
    start()
    const button = copyButton('ghfast')
    expect(button.getAttribute(OPTION_ATTRIBUTE)).toBe('plain')
    expect(button.type).toBe('button')
    expect(button.querySelector('svg')).not.toBeNull()
  })

  it('克隆方式换成 SSH：移除；换回 HTTPS：再加', async () => {
    const input = cloneTab()
    start()
    expect(clones('clone')).toHaveLength(4)
    input.value = 'git@github.com:vuejs/core.git'
    input.setAttribute('value', input.value)
    await flush()
    expect(clones('clone')).toHaveLength(0)
    input.value = CLONE
    input.setAttribute('value', CLONE)
    await flush()
    expect(clones('clone')).toHaveLength(4)
  })

  it('之后出现的链接：加上；链接改了地址：原地更新选项的地址；链接移除：选项与所在的行移除', async () => {
    start()
    const anchor = releaseRow()
    await flush()
    expect(texts(assetRow())).toEqual(CATEGORIES)
    const before = option(assetRow(), 'ghfast')
    anchor.href = RELEASE.replace('vue.global.js', 'vue.esm.js')
    await flush()
    const after = option(assetRow(), 'ghfast') as HTMLAnchorElement
    expect(after).toBe(before)
    expect(after.href).toBe(`https://ghfast.top/${anchor.href}`)
    expect(groups()).toHaveLength(1)
    anchor.remove()
    await flush()
    expect(groups()).toHaveLength(0)
    expect(document.querySelector(`[${ROW_ATTRIBUTE}]`)).toBeNull()
  })

  it('所在的行被页面移走：重新加上', async () => {
    releaseRow()
    start()
    assetRow()!.remove()
    await flush()
    expect(assetRow()?.getAttribute(ROW_ATTRIBUTE)).toBe('asset')
    expect(groups()).toHaveLength(1)
  })

  it('页面快照恢复（Turbo 缓存）带回的旧选项：移除，只留一组', async () => {
    codeMenu()
    document.body.insertAdjacentHTML(
      'beforeend',
      `<ul><li class="Box-row"><div><span class="asset"><svg></svg><a href="${RELEASE}"><span>vue.global.js</span></a></span></div></li></ul>`
    )
    start()
    expect(groups()).toHaveLength(1)
    expect(clones('menu')).toHaveLength(4)
    // 快照为 HTML 的副本：已加的元素随之复制，不在本次运行的记录里
    const snapshot = document.body.innerHTML
    document.body.innerHTML = snapshot
    await flush()
    expect(document.querySelectorAll(`[${ROW_ATTRIBUTE}]`)).toHaveLength(1)
    expect(groups()).toHaveLength(1)
    expect(texts(groups()[0])).toEqual(CATEGORIES)
    expect(menuNames()).toEqual(CATEGORIES)
    options!.stop()
    expect(document.querySelectorAll(`[${ROW_ATTRIBUTE}], [${CLONE_ATTRIBUTE}]`)).toHaveLength(0)
  })

  it('扩展更新后新注入的运行：旧运行不再添加、移除，其停止时不动新运行的选项与样式', async () => {
    releaseRow()
    const old = start()
    const current = createAccelerateOptions(document, { settings: () => settings, health, copy, label })
    await flush()
    expect(groups()).toHaveLength(1)
    expect(document.querySelectorAll(`[${ROW_ATTRIBUTE}]`)).toHaveLength(1)
    old.stop()
    await flush()
    expect(groups()).toHaveLength(1)
    expect(document.getElementById('gcn-accel-style')).not.toBeNull()
    current.stop()
    expect(groups()).toHaveLength(0)
    expect(document.documentElement.hasAttribute(OWNER_ATTRIBUTE)).toBe(false)
  })

  it('同款元素不再紧跟原元素（被页面移走、中间插入了别的元素）：移除后重新加上；原菜单项移除时一并移除', async () => {
    codeMenu()
    start()
    const native = $('a[data-testid="download-zip"]').parentElement!
    clones('menu')[1]!.remove()
    await flush()
    expect(menuNames()).toEqual(CATEGORIES)
    const inserted = document.createElement('li')
    native.after(inserted)
    await flush()
    expect(menuNames()).toEqual(CATEGORIES)
    expect(clones('menu')[0]!.previousElementSibling).toBe(native)
    expect(clones('menu')[3]!.nextElementSibling).toBe(inserted)
    native.remove()
    await flush()
    expect(clones('menu')).toHaveLength(0)
  })

  it('不是下载的链接、选项里的链接：不加', () => {
    document.body.innerHTML = '<ul><li class="Box-row"><a href="https://github.com/vuejs/core/releases/tag/v3.5.0">v3.5.0</a></li></ul>'
    start()
    expect(groups()).toHaveLength(0)
  })

  it.each([
    ['未开启下载加速', { accelerate: false }],
    ['总开关关闭', { enabled: false }]
  ] as const)('%s：不加；开启后刷新时加上，关闭后移除', (_name, overrides) => {
    settings = { ...settings, ...overrides }
    releaseRow()
    document.body.insertAdjacentHTML('beforeend', `<ul role="menu"><li><a href="${ARCHIVE}">Download ZIP</a></li></ul>`)
    start()
    expect(groups()).toHaveLength(0)
    expect(clones('menu')).toHaveLength(0)
    settings = { ...settings, accelerate: true, enabled: true }
    options!.refresh()
    expect(groups()).toHaveLength(1)
    expect(clones('menu')).toHaveLength(4)
    settings = { ...settings, ...overrides }
    options!.refresh()
    expect(groups()).toHaveLength(0)
    expect(clones('menu')).toHaveLength(0)
    expect(assetRow()).toBeNull()
    expect(document.getElementById('gcn-accel-style')).toBeNull()
  })

  it('不公开的页面：不加', () => {
    document.head.innerHTML = '<meta name="octolytics-dimension-repository_public" content="false">'
    releaseRow()
    start()
    expect(groups()).toHaveLength(0)
  })

  it('分类改名、删除、自定义分类与加速源：按设置显示', () => {
    settings = {
      ...settings,
      categories: [
        { id: 'ghfast', name: '快' },
        { id: 'category-1', name: 'Team' }
      ],
      removedCategories: ['other'],
      customSources: [{ id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{path}', category: 'category-1' }]
    }
    releaseRow()
    start()
    expect(texts(assetRow())).toEqual(['gh-proxy', '快', 'wget.la', 'Team'])
    expect((option(assetRow(), 'Team') as HTMLAnchorElement).href).toBe(
      'https://mirror.example/vuejs/core/releases/download/v3.5.0/vue.global.js'
    )
  })

  it('分类排过序：按排好的顺序；设置里换了顺序后随之换顺序（同款元素也是）', () => {
    settings = { ...settings, categoryOrder: ['other', 'ghfast'] }
    releaseRow()
    document.body.insertAdjacentHTML('beforeend', `<ul role="menu"><li><a href="${ARCHIVE}">Download ZIP</a></li></ul>`)
    start()
    expect(texts(assetRow())).toEqual(['其他', 'ghfast', 'gh-proxy', 'wget.la'])
    expect(menuNames()).toEqual(['其他', 'ghfast', 'gh-proxy', 'wget.la'])
    settings = { ...settings, categoryOrder: ['wget-la'] }
    options!.refresh()
    expect(texts(assetRow())).toEqual(['wget.la', 'gh-proxy', 'ghfast', '其他'])
    expect(menuNames()).toEqual(['wget.la', 'gh-proxy', 'ghfast', '其他'])
  })

  it('停止：移除选项、同款元素与样式，之后不再添加', async () => {
    cloneTab()
    document.body.insertAdjacentHTML(
      'beforeend',
      `<ul><li class="Box-row"><div><span class="asset"><a href="${RELEASE}">vue.global.js</a></span></div></li></ul>`
    )
    start()
    expect(groups()).toHaveLength(1)
    expect(clones('clone')).toHaveLength(4)
    options!.stop()
    expect(groups()).toHaveLength(0)
    expect(clones('clone')).toHaveLength(0)
    expect(document.getElementById('gcn-accel-style')).toBeNull()
    releaseRow()
    await flush()
    expect(groups()).toHaveLength(0)
  })

  it('故障转移关闭：单击照常下载，不代为打开', () => {
    const followed = captureFollow()
    document.addEventListener('click', blockNavigation)
    releaseRow()
    start()
    expect(clickOption(option(assetRow(), 'ghfast'))).toBe(true)
    expect(followed).toEqual([])
    expect(get).not.toHaveBeenCalled()
  })

  describe('故障转移开启', () => {
    beforeEach(() => {
      settings = { ...settings, failover: true }
    })

    it('没有探测结果：不等探测，先按各分类的第一个加速源显示，并请后台探测；结果到后改为可用的最快的，都不可用的分类隐藏', async () => {
      get.mockResolvedValue({ 'gh-proxy-hk': null, 'gh-proxy-cdn': 300, 'gh-proxy-com': 90, ghfast: null, 'wget-la': 50 })
      releaseRow()
      start()
      expect(get).toHaveBeenCalledOnce()
      expect(texts(assetRow())).toEqual(CATEGORIES)
      expect((option(assetRow(), 'gh-proxy') as HTMLAnchorElement).href).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
      await flush()
      expect(texts(assetRow())).toEqual(['gh-proxy', 'wget.la'])
      expect((option(assetRow(), 'gh-proxy') as HTMLAnchorElement).href).toBe(`https://gh-proxy.com/${RELEASE}`)
      expect(option(assetRow(), 'gh-proxy').title).toBe('gh-proxy.com')
    })

    it('探测结果到后各分类仍都可用：原地更新地址，不重建（同款元素也是）', async () => {
      const resolve = deferHealth()
      cloneTab()
      document.body.insertAdjacentHTML(
        'beforeend',
        `<ul><li class="Box-row"><div><span class="asset"><a href="${RELEASE}">vue.global.js</a></span></div></li></ul>`
      )
      start()
      const before = optionsIn(assetRow())
      expect(before).toHaveLength(4)
      const rows = clones('clone')
      resolve(ALL_UP)
      await flush()
      expect(optionsIn(assetRow())).toEqual(before)
      expect((before[0] as HTMLAnchorElement).href).toBe(`https://gh-proxy.com/${RELEASE}`)
      expect(before[0]!.title).toBe('gh-proxy.com')
      expect(clones('clone')).toEqual(rows)
      expect(cloneRows()[0]).toEqual({ name: 'gh-proxy', value: `https://gh-proxy.com/${CLONE}` })
    })

    it('结果到之前单击：先不跳转，结果到后打开所选分类中可用的最快的（不带来源页，留在本页下载）', async () => {
      const followed = captureFollow()
      const resolve = deferHealth()
      releaseRow()
      start()
      expect(clickOption(option(assetRow(), 'gh-proxy'))).toBe(true)
      expect(followed).toEqual([])
      resolve(ALL_UP)
      await flush()
      expect(followed).toEqual([
        {
          href: `https://gh-proxy.com/${RELEASE}`,
          target: '',
          download: true,
          rel: 'noopener noreferrer',
          referrerPolicy: 'no-referrer',
          connected: true
        }
      ])
      expect(document.querySelectorAll('a[download][hidden]')).toHaveLength(0)
    })

    it('结果到之前单击、所选分类都不可用：打开原链接', async () => {
      const followed = captureFollow()
      const resolve = deferHealth()
      releaseRow()
      start()
      clickOption(option(assetRow(), 'ghfast'))
      resolve({ ...ALL_UP, ghfast: null })
      await flush()
      expect(followed.map(item => item.href)).toEqual([RELEASE])
    })

    it('结果到之前单击同款菜单项：结果到后下载；单击 Raw 的同款按钮：结果到后在新标签页打开', async () => {
      const followed = captureFollow()
      const resolve = deferHealth()
      codeMenu()
      document.body.insertAdjacentHTML(
        'beforeend',
        `<div data-component="ButtonGroup"><div><a data-testid="raw-button" href="${RAW}"><span data-component="text">Raw</span></a></div></div>`
      )
      start()
      expect(clickOption($(`a[${OPTION_ATTRIBUTE}]`, clones('menu')[0]!))).toBe(true)
      clickOption(anchorOf(clones('button')[2]!))
      resolve(ALL_UP)
      await flush()
      expect(followed).toEqual([
        expect.objectContaining({ href: `https://gh-proxy.com/${ARCHIVE}`, target: '', download: true }),
        expect.objectContaining({ href: `https://wget.la/${RAW}`, target: '_blank', download: false })
      ])
    })

    it('结果到之前中键、带修饰键单击：照常（新标签页打开等），不代为打开', async () => {
      const followed = captureFollow()
      deferHealth()
      document.addEventListener('click', blockNavigation)
      releaseRow()
      start()
      expect(clickOption(option(assetRow(), 'ghfast'), { ctrlKey: true })).toBe(true)
      expect(clickOption(option(assetRow(), 'ghfast'), { button: 1 })).toBe(true)
      await flush()
      expect(followed).toEqual([])
    })

    it('探测结果已到：单击照常下载，不代为打开', async () => {
      const followed = captureFollow()
      await knownHealth(ALL_UP)
      document.addEventListener('click', blockNavigation)
      const seen: boolean[] = []
      document.addEventListener('click', event => seen.push(event.defaultPrevented), { capture: true })
      releaseRow()
      start()
      clickOption(option(assetRow(), 'ghfast'))
      expect(seen).toEqual([false])
      await flush()
      expect(followed).toEqual([])
    })

    it('克隆地址：结果到之前单击复制，结果到后复制所选分类中可用的最快的', async () => {
      const resolve = deferHealth()
      cloneTab()
      start()
      const button = copyButton('gh-proxy')
      button.click()
      await flush()
      expect(copy).not.toHaveBeenCalled()
      resolve(ALL_UP)
      await flush()
      expect(copy).toHaveBeenCalledExactlyOnceWith(`https://gh-proxy.com/${CLONE}`)
      expect(button.dataset.state).toBe('copied')
    })

    it('克隆地址：结果到后所选分类都不可用（关闭了自动隐藏），显示复制失败，地址行不可用', async () => {
      const resolve = deferHealth()
      settings = { ...settings, categories: [{ id: 'ghfast', autoHide: false }] }
      cloneTab()
      start()
      const button = copyButton('ghfast')
      button.click()
      resolve({ ...ALL_UP, ghfast: null })
      await flush()
      expect(copy).not.toHaveBeenCalled()
      expect(button.dataset.state).toBe('failed')
      expect(button.disabled).toBe(true)
      expect($<HTMLInputElement>('input', button.parentElement!).disabled).toBe(true)
    })

    it('关闭自动隐藏的分类：都不可用时显示为不可用', async () => {
      await knownHealth({ ghfast: null, 'wget-la': 50 })
      settings = { ...settings, categories: [{ id: 'ghfast', autoHide: false }] }
      codeMenu()
      document.body.insertAdjacentHTML(
        'afterbegin',
        `<ul><li class="Box-row"><div><span class="asset"><a href="${RELEASE}">vue.global.js</a></span></div></li></ul>`
      )
      start()
      const ghfast = option(assetRow(), 'ghfast') as HTMLAnchorElement
      expect(ghfast.getAttribute('aria-disabled')).toBe('true')
      expect(ghfast.hasAttribute('href')).toBe(false)
      expect(ghfast.title).toBe('不可用')
      const item = clones('menu').find(clone => clone.textContent?.endsWith('[ghfast]'))!
      expect($('a', item).getAttribute('aria-disabled')).toBe('true')
      expect($('a', item).hasAttribute('href')).toBe(false)
      expect(get).not.toHaveBeenCalled()
    })

    it('关闭自动隐藏的分类：结果到后不可用，原地改为不可用', async () => {
      const resolve = deferHealth()
      settings = { ...settings, categories: [{ id: 'ghfast', autoHide: false }] }
      releaseRow()
      start()
      const ghfast = option(assetRow(), 'ghfast') as HTMLAnchorElement
      expect(ghfast.hasAttribute('href')).toBe(true)
      resolve({ ...ALL_UP, ghfast: null })
      await flush()
      expect(option(assetRow(), 'ghfast')).toBe(ghfast)
      expect(ghfast.getAttribute('aria-disabled')).toBe('true')
      expect(ghfast.hasAttribute('href')).toBe(false)
    })

    it('克隆地址：不可用的分类地址行不可用，照常显示分类中第一个加速源的地址', async () => {
      await knownHealth({})
      settings = { ...settings, categories: [{ id: 'wget-la', autoHide: false }] }
      cloneTab()
      start()
      expect(cloneRows()).toEqual([{ name: 'wget.la', value: `https://wget.la/${CLONE}` }])
      const button = copyButton('wget.la')
      const field = $<HTMLInputElement>('input', button.parentElement!)
      expect(button.disabled).toBe(true)
      expect(field.disabled).toBe(true)
      expect(field.title).toBe('不可用')
      field.click()
      await flush()
      expect(copy).not.toHaveBeenCalled()
    })

    it('探测失败：按不探测处理（各分类第一个支持的）', async () => {
      get.mockRejectedValue(new Error('后台无响应'))
      releaseRow()
      start()
      await flush()
      expect(texts(assetRow())).toEqual(CATEGORIES)
      expect((option(assetRow(), 'gh-proxy') as HTMLAnchorElement).href).toBe(`https://hk.gh-proxy.org/${RELEASE}`)
    })

    it('刷新后等新的探测结果：已加的选项先保留，结果到了再更新', async () => {
      get.mockResolvedValue({ ghfast: 10 })
      releaseRow()
      start()
      await flush()
      expect(texts(assetRow())).toEqual(['ghfast'])
      get.mockResolvedValue({ 'wget-la': 10 })
      health.clear()
      options!.refresh()
      expect(texts(assetRow())).toEqual(['ghfast'])
      await flush()
      expect(texts(assetRow())).toEqual(['wget.la'])
    })

    it('页面上没有下载链接：不探测', async () => {
      start()
      await flush()
      expect(get).not.toHaveBeenCalled()
    })
  })
})
