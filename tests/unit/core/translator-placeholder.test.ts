import { afterEach, describe, expect, it } from 'vitest'
import { FORM_BLANK_TEXTS, PLACEHOLDER_TEXTS } from '../../../src/core/ignore'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'
import { $, settle } from './helpers'

const BUNDLE: LocaleBundle = [
  [
    'common',
    {
      static: {
        'Rendered Markdown Preview': 'Markdown 渲染预览',
        'Nothing to preview': '没有可预览的内容',
        'Markdown preview unavailable': 'Markdown 预览不可用',
        'Loading preview…': '正在加载预览…',
        'Error rendering preview': '渲染预览时出错',
        Preview: '预览',
        Issues: '议题',
        'No response': '未填写'
      }
    }
  ]
]

/** Markdown 编辑器预览窗格：预览为空时 .markdown-body 里只有占位文字 */
const PREVIEW =
  '<div aria-live="polite" id="pane"><h2 id="heading">Rendered Markdown Preview</h2>' +
  '<div class="markdown-body" id="body">Nothing to preview</div></div>'

/**
 * 经典评论框（gist、拉取请求等页的 .js-previewable-comment-form）：预览区 .js-preview-body 里由脚本用 innerHTML
 * 写入一个不带属性的段落（Loading preview…、Nothing to preview、Error rendering preview）；服务器渲染时段落前后有换行缩进
 */
const CLASSIC = (content: string, id = 'classic'): string =>
  '<div class="js-previewable-comment-form write-selected">' +
  `<button type="button" class="tabnav-tab js-preview-tab" id="${id}-tab">Preview</button>` +
  '<div class="comment js-suggested-changes-container">' +
  `<div class="comment-body markdown-body js-preview-body" id="${id}">${content}</div></div></div>`

/** 议题页：评论框所在页面 */
const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']

let translator: Translator | undefined

function start(html: string, bundle: LocaleBundle = BUNDLE): Translator {
  document.body.innerHTML = html
  translator = createTranslator({ matcher: createMatcher(bundle), host: window, resolvePages: () => ISSUES })
  translator.start()
  return translator
}

const text = (selector: string): string => $(selector).textContent ?? ''
/** 空白已归并的文字 */
const normalized = (selector: string): string => text(selector).replace(/\s+/g, ' ').trim()

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('忽略区域里的占位文字', () => {
  it('预览为空时翻译占位文字；stop 后还原', () => {
    const t = start(PREVIEW)
    expect(text('#heading')).toBe('Markdown 渲染预览')
    expect(text('#body')).toBe('没有可预览的内容')
    t.stop()
    expect(text('#body')).toBe('Nothing to preview')
  })

  it('预览内容渲染后保持原文；再次清空时重新翻译', async () => {
    start(PREVIEW)
    $('#body').innerHTML = '<p>Nothing to preview</p><p>Issues</p>'
    await settle()
    expect(text('#body')).toBe('Nothing to previewIssues')
    $('#body').innerHTML = 'Nothing to preview'
    await settle()
    expect(text('#body')).toBe('没有可预览的内容')
  })

  it('只认占位文字：只有文字的其他内容、外层也是忽略区域时都不翻译', () => {
    start(
      '<div class="markdown-body" id="other">Issues</div>' +
        '<div class="comment-body" id="outer"><div class="markdown-body">Nothing to preview</div></div>'
    )
    expect(text('#other')).toBe('Issues')
    expect(text('#outer')).toBe('Nothing to preview')
  })

  it('预览窗格带哈希类名、没有播报属性时同样翻译', () => {
    start('<div class="previewViewerWrapper__ayPbFL"><div class="markdown-body" id="body">Nothing to preview</div></div>')
    expect(text('#body')).toBe('没有可预览的内容')
  })

  it('其他忽略区域里同样的文字是用户内容：标题、描述、标签名、提交标题、评论正文都保持原文', async () => {
    start(
      '<bdi class="markdown-title" id="title">Nothing to preview</bdi>' +
        '<p itemprop="description" id="description">\n  Nothing to preview\n</p>' +
        '<span class="prc-Token-IssueLabel-a1"><span class="prc-Token-TokenTextContainer-b2" id="label">' +
        'Nothing to preview</span></span>' +
        '<p class="commit-title" id="commit">Nothing to preview</p>' +
        '<div class="markdown-body" id="comment">Nothing to preview</div>' +
        '<bdi class="markdown-title" id="later">Sample title</bdi>'
    )
    for (const id of ['#title', '#label', '#commit', '#comment']) expect(text(id)).toBe('Nothing to preview')
    expect(text('#description')).toBe('\n  Nothing to preview\n')
    // 种子路径：标题文字后改为占位文字
    ;($('#later').firstChild as Text).data = 'Nothing to preview'
    await settle()
    expect(text('#later')).toBe('Nothing to preview')
  })

  it('预览区域根自身带退出标记时不翻译；可编辑区域里输入成占位文字也不改写', async () => {
    start(
      '<div aria-live="polite"><div class="markdown-body" translate="no" id="no">Nothing to preview</div></div>' +
        '<div aria-live="polite"><div class="markdown-body notranslate" id="notranslate">Nothing to preview</div></div>' +
        '<div aria-live="polite"><div class="markdown-body" data-gcn-ignore id="gcn">Nothing to preview</div></div>' +
        '<div aria-live="polite"><div class="markdown-body" contenteditable="true" id="edit">Nothing to previe</div></div>'
    )
    for (const id of ['#no', '#notranslate', '#gcn']) expect(text(id)).toBe('Nothing to preview')
    ;($('#edit').firstChild as Text).data = 'Nothing to preview'
    await settle()
    expect(text('#edit')).toBe('Nothing to preview')
  })

  it('译后加上退出标记：还原原文，不再写回', async () => {
    start(PREVIEW)
    expect(text('#body')).toBe('没有可预览的内容')
    $('#body').setAttribute('translate', 'no')
    await settle()
    expect(text('#body')).toBe('Nothing to preview')
  })

  it('换词典后按新词典重译', () => {
    const t = start(PREVIEW)
    t.setMatcher(createMatcher([['common', { static: { 'Nothing to preview': '无内容' } }]]))
    expect(text('#body')).toBe('无内容')
  })

  it('预览请求失败的占位文字同样翻译：服务器渲染与之后写入的都翻译；stop 后还原', async () => {
    const t = start(PREVIEW.replace('Nothing to preview', 'Markdown preview unavailable'))
    expect(text('#body')).toBe('Markdown 预览不可用')
    $('#body').remove()
    $('#pane').insertAdjacentHTML('beforeend', '<div class="markdown-body" id="later">Markdown preview unavailable</div>')
    await settle()
    expect(text('#later')).toBe('Markdown 预览不可用')
    t.stop()
    expect(text('#later')).toBe('Markdown preview unavailable')
  })
})

/**
 * 议题正文（React 版）：表单未填的字段渲染为字段标题（h3）之后、只含一个 <em> 的段落；
 * 正文在两层 .markdown-body 里（外层带 data-testid，内层是 safe-html-box）
 */
const FORM_BODY = (content: string): string =>
  '<div class="markdown-body" data-testid="markdown-body" id="issue">' +
  `<div class="markdown-body safe-html-box__Uwc6Al" id="box">${content}</div></div>`

const BLANK_FIELDS = (id = 'blank'): string =>
  `<h3 dir="auto">Steps</h3><p dir="auto"><em id="${id}">No response</em></p>` +
  `<h3 dir="auto">Version</h3><p dir="auto" id="${id}-version">1.0</p>`

describe('正文里的表单空字段', () => {
  it('字段标题后只有空字段标记的段落照常翻译，其余正文保持原文；stop 后还原', () => {
    const t = start(FORM_BODY(BLANK_FIELDS()))
    expect(text('#blank')).toBe('未填写')
    expect(text('#blank-version')).toBe('1.0')
    expect(text('#box h3')).toBe('Steps')
    t.stop()
    expect(text('#blank')).toBe('No response')
  })

  it('经典视图的评论正文（.comment-body.markdown-body）同样翻译', () => {
    start(`<table><tbody><tr><td class="d-block comment-body markdown-body">${BLANK_FIELDS()}</td></tr></tbody></table>`)
    expect(text('#blank')).toBe('未填写')
  })

  it('结构不同时保持原文：前面不是 h3、段落里还有别的内容、em 里套着元素、不是空字段标记', () => {
    start(
      FORM_BODY(
        '<p dir="auto"><em id="first">No response</em></p>' +
          '<h2 dir="auto">Steps</h2><p dir="auto"><em id="h2">No response</em></p>' +
          '<h3 dir="auto">Logs</h3><p dir="auto"><em id="mixed">No response</em> yet</p>' +
          '<h3 dir="auto">Notes</h3><p dir="auto"><em id="nested"><strong>No response</strong></em></p>' +
          '<h3 dir="auto">Other</h3><p dir="auto"><em id="other">None</em></p>'
      )
    )
    for (const id of ['#first', '#h2', '#mixed', '#nested']) expect(text(id)).toBe('No response')
    expect(text('#other')).toBe('None')
  })

  it('不在正文里、正文带退出标记时保持原文', () => {
    start(
      `<div class="comment-body">${BLANK_FIELDS('plain')}</div>` +
        `<div class="markdown-body" translate="no">${BLANK_FIELDS('exit')}</div>` +
        `<div class="markdown-body"><div class="notranslate">${BLANK_FIELDS('inner-exit')}</div></div>`
    )
    for (const id of ['#plain', '#exit', '#inner-exit']) expect(text(id)).toBe('No response')
  })

  it('正文整体替换（React 重渲染）、标记文字之后写入都翻译；改为其他文字保持原文', async () => {
    start(FORM_BODY('<p dir="auto">Loading</p>'))
    $('#box').innerHTML = BLANK_FIELDS()
    await settle()
    expect(text('#blank')).toBe('未填写')
    $('#box').innerHTML = '<h3 dir="auto">Steps</h3><p dir="auto"><em id="later">Pending</em></p>'
    await settle()
    expect(text('#later')).toBe('Pending')
    ;($('#later').firstChild as Text).data = 'No response'
    await settle()
    expect(text('#later')).toBe('未填写')
    ;($('#later').firstChild as Text).data = 'Done'
    await settle()
    expect(text('#later')).toBe('Done')
  })

  it('换词典后按新词典重译；译后正文加上退出标记：还原原文，不再写回', async () => {
    const t = start(FORM_BODY(BLANK_FIELDS()) + `<div class="markdown-body">${BLANK_FIELDS('second')}</div>`)
    t.setMatcher(createMatcher([['common', { static: { 'No response': '无' } }]]))
    expect(text('#blank')).toBe('无')
    expect(text('#second')).toBe('无')
    $('#issue').setAttribute('translate', 'no')
    await settle()
    expect(text('#blank')).toBe('No response')
    expect(text('#second')).toBe('无')
  })
})

describe('经典评论框的预览区', () => {
  it('服务器渲染的占位段落照常翻译，段落前后的换行缩进不变；stop 后还原', () => {
    const t = start(CLASSIC('\n    <p>Nothing to preview</p>\n  '))
    expect(text('#classic-tab')).toBe('预览')
    expect(text('#classic')).toBe('\n    没有可预览的内容\n  ')
    t.stop()
    expect(text('#classic')).toBe('\n    Nothing to preview\n  ')
  })

  it('点预览后脚本依次写入加载中、无内容、出错三种占位段落：都照常翻译；stop 后还原', async () => {
    const t = start(CLASSIC('<p>Nothing to preview</p>'))
    const shown: string[] = []
    for (const html of [
      '<p>Loading preview&hellip;</p>',
      '<p>Nothing to preview</p>',
      '<p>Loading preview&hellip;</p>',
      '<p>Error rendering preview</p>'
    ]) {
      $('#classic').innerHTML = html
      await settle()
      shown.push(text('#classic'))
    }
    expect(shown).toEqual(['正在加载预览…', '没有可预览的内容', '正在加载预览…', '渲染预览时出错'])
    t.stop()
    expect(text('#classic')).toBe('Error rendering preview')
  })

  it('预览出的用户内容保持原文：段落带 dir="auto"、多个段落、段落里有元素、段落外有文字、不是占位文字', async () => {
    start(CLASSIC('<p>Nothing to preview</p>'))
    const contents = [
      '<p dir="auto">Nothing to preview</p>',
      '<p>Nothing to preview</p><p>Issues</p>',
      '<p>Nothing to preview <a href="/octocat">octocat</a></p>',
      'Issues<p>Nothing to preview</p>',
      '<p>Issues</p>'
    ]
    const shown: string[] = []
    for (const html of contents) {
      $('#classic').innerHTML = html
      await settle()
      shown.push(text('#classic'))
    }
    expect(shown).toEqual([
      'Nothing to preview',
      'Nothing to previewIssues',
      'Nothing to preview octocat',
      'IssuesNothing to preview',
      'Issues'
    ])
  })

  it('只认预览区：普通评论正文、外层也是忽略区域、预览区自身带退出标记时都不翻译', () => {
    start(
      '<div class="comment-body markdown-body" id="comment"><p>Nothing to preview</p></div>' +
        '<div class="markdown-body"><div class="comment-body js-preview-body" id="nested"><p>Nothing to preview</p></div></div>' +
        '<div class="comment-body markdown-body js-preview-body" translate="no" id="no"><p>Nothing to preview</p></div>' +
        '<div class="comment-body markdown-body js-preview-body notranslate" id="notranslate">' +
        '<p>Error rendering preview</p></div>'
    )
    for (const id of ['#comment', '#nested', '#no']) expect(text(id)).toBe('Nothing to preview')
    expect(text('#notranslate')).toBe('Error rendering preview')
  })

  it('段落里的文字被改写（种子路径）：改为占位文字时翻译，改为其他文字时保持原文', async () => {
    start(CLASSIC('<p>Sample text</p>'))
    expect(text('#classic')).toBe('Sample text')
    const paragraph = $('#classic p')
    ;(paragraph.firstChild as Text).data = 'Nothing to preview'
    await settle()
    expect(text('#classic')).toBe('没有可预览的内容')
    paragraph.textContent = 'Error rendering preview'
    await settle()
    expect(text('#classic')).toBe('渲染预览时出错')
    ;(paragraph.firstChild as Text).data = 'Sample text'
    await settle()
    expect(text('#classic')).toBe('Sample text')
  })

  it('译后预览区加上退出标记：还原原文，之后写入的占位段落也不翻译', async () => {
    start(CLASSIC('<p>Nothing to preview</p>'))
    expect(text('#classic')).toBe('没有可预览的内容')
    $('#classic').setAttribute('translate', 'no')
    await settle()
    expect(text('#classic')).toBe('Nothing to preview')
    $('#classic').innerHTML = '<p>Error rendering preview</p>'
    await settle()
    expect(text('#classic')).toBe('Error rendering preview')
  })

  it('换词典后按新词典重译', () => {
    const t = start(CLASSIC('<p>Error rendering preview</p>'))
    t.setMatcher(createMatcher([['common', { static: { 'Error rendering preview': '预览出错' } }]]))
    expect(text('#classic')).toBe('预览出错')
  })
})

describe.each([
  ['zh-CN', zhCN],
  ['zh-TW', zhTW]
])('正式词典（%s）', (_, bundle) => {
  it('占位文字在出现的页面都有译文：预览占位在 common 作用域，发行版表单标签按钮的值在发行版页', () => {
    const matcher = createMatcher(bundle)
    const releaseForm = new Set(['Select tag', 'Auto'])
    for (const source of PLACEHOLDER_TEXTS) {
      const pages: PageKey[] = releaseForm.has(source) ? ['common', 'repository', 'releases'] : ['common']
      expect(matcher.translate(source, pages), source).toBeDefined()
    }
    for (const source of FORM_BLANK_TEXTS) expect(matcher.translate(source, ['common']), source).toMatch(/[一-鿿]/)
  })

  it('预览窗格的请求失败提示、经典预览区的加载中与出错段落都译出；stop 后还原', () => {
    const matcher = createMatcher(bundle)
    const t = start(
      PREVIEW.replace('Nothing to preview', 'Markdown preview unavailable') +
        CLASSIC('<p>Loading preview&hellip;</p>', 'loading') +
        CLASSIC('\n    <p>Nothing to preview</p>\n  ', 'empty') +
        CLASSIC('<p>Error rendering preview</p>', 'error'),
      bundle
    )
    const cases: [string, string][] = [
      ['#body', 'Markdown preview unavailable'],
      ['#loading', 'Loading preview…'],
      ['#empty', 'Nothing to preview'],
      ['#error', 'Error rendering preview']
    ]
    for (const [selector, source] of cases) {
      const translated = matcher.translate(source, ISSUES)
      expect(translated, source).toMatch(/[一-鿿]/)
      expect(normalized(selector), source).toBe(translated)
    }
    t.stop()
    for (const [selector, source] of cases) expect(normalized(selector)).toBe(source)
  })
})
