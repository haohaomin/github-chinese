// @vitest-environment-options { "url": "https://github.com/octocat/Sample/commit/0000003" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { $, settle, TEST_BUNDLE, testMatcher, texts } from './helpers'

const BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  ['common', { static: { 'Code review': '代码审查', Commits: '提交' } }],
  [
    'commits',
    {
      scoped: { commit: '提交' },
      regexp: [
        [/^(\d+) parents?$/, '$1 个父提交'],
        [/^Copy full SHA for ([0-9a-f]{7,40})$/, '复制 $1 的完整 SHA']
      ]
    }
  ]
]

/** React 新版提交页页头（服务端渲染，合并提交：2 个父提交） */
const HEADER = `
  <div class="commitBranchContainer__wieILg" data-files-changed-active="true">
    <div class="d-flex flex-row flex-items-center"><a class="mx-1" data-component="BranchName" href="/octocat/Sample/compare/main">main</a></div>
    <pre class="color-fg-muted d-flex flex-items-center" id="hdr">2 parents <a class="color-fg-default Link--inTextBlock" data-hotkey="p" href="/octocat/Sample/commit/0000001">0000001</a> + <a class="color-fg-default Link--inTextBlock" data-hotkey="o" href="/octocat/Sample/commit/abcdef1">abcdef1</a> commit <span class="fgColor-default">0000003</span><div><button data-component="IconButton" type="button" aria-labelledby="tip"><svg aria-hidden="true" class="octicon octicon-copy"><title>Copy</title></svg></button><span class="prc-TooltipV2-Tooltip-tLeuB" data-component="Tooltip" aria-label="Copy full SHA for 0000003" aria-hidden="true" id="tip" popover="auto">Copy full SHA for 0000003</span></div></pre>
  </div>
  <pre id="code">1 parent commit</pre>`

const COMMIT_PAGES: readonly PageKey[] = ['common', 'repository', 'commits']
const PROFILE_PAGES: readonly PageKey[] = ['common', 'profile', 'organization']

let translator: Translator | undefined

function start(html: string, pages: readonly PageKey[] = COMMIT_PAGES): Translator {
  document.body.innerHTML = html
  translator = createTranslator({
    matcher: testMatcher(undefined, BUNDLE),
    host: window,
    collectUntranslated: true,
    resolvePages: () => pages
  })
  translator.start()
  return translator
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('提交详情页头的 <pre> 按选择器放行', () => {
  it('首轮：界面文字译出，提交哈希、分支名、按钮图标保持原样；未放行的 <pre> 照旧跳过', () => {
    const t = start(HEADER)
    expect(texts($('#hdr'))).toEqual(['2 个父提交 ', ' + ', ' 提交 '])
    expect($('#hdr [data-hotkey="p"]').textContent).toBe('0000001')
    expect($('#hdr [data-hotkey="o"]').textContent).toBe('abcdef1')
    expect($('#hdr .fgColor-default').textContent).toBe('0000003')
    expect($('#tip').textContent).toBe('复制 0000003 的完整 SHA')
    expect($('#tip').getAttribute('aria-label')).toBe('复制 0000003 的完整 SHA')
    expect($('#hdr svg title').textContent).toBe('Copy')
    expect($('[data-component="BranchName"]').textContent).toBe('main')
    expect($('#code').textContent).toBe('1 parent commit')
    // 提交哈希（含数字的十六进制串）不进未翻译
    expect(t.drainUntranslated().map(([text]) => text)).toEqual([])
  })

  it('React 改写、插入：放行的 <pre> 内照常重译，未放行的 <pre> 内仍不翻译', async () => {
    start(HEADER)
    const hdr = $('#hdr')
    hdr.removeChild(hdr.childNodes[2]!)
    hdr.removeChild($('#hdr [data-hotkey="o"]'))
    ;(hdr.firstChild as Text).data = '1 parent '
    $('#tip').setAttribute('aria-label', 'Copy full SHA for 0000004')
    ;($('#tip').firstChild as Text).data = 'Copy full SHA for 0000004'
    hdr.insertAdjacentHTML('beforeend', '<span id="later">Copy full SHA for 0000005</span>')
    $('#code').insertAdjacentHTML('beforeend', '<span id="code-later">Copy full SHA for 0000005</span>')
    await settle()
    expect((hdr.firstChild as Text).data).toBe('1 个父提交 ')
    expect($('#tip').getAttribute('aria-label')).toBe('复制 0000004 的完整 SHA')
    expect($('#tip').textContent).toBe('复制 0000004 的完整 SHA')
    expect($('#later').textContent).toBe('复制 0000005 的完整 SHA')
    expect($('#code-later').textContent).toBe('Copy full SHA for 0000005')
  })

  it('停止后还原原文', () => {
    const t = start(HEADER)
    t.stop()
    translator = undefined
    expect(texts($('#hdr'))).toEqual(['2 parents ', ' + ', ' commit '])
    expect($('#tip').getAttribute('aria-label')).toBe('Copy full SHA for 0000003')
  })

  it.each([
    ['自身命中退出标记', '<div class="commitBranchContainer__x"><pre class="notranslate" id="p">1 parent </pre></div>'],
    ['不是容器的直接子元素', '<div class="commitBranchContainer__x"><div><pre id="p">1 parent </pre></div></div>'],
    ['位于忽略区域内', '<div class="markdown-body"><div class="commitBranchContainer__x"><pre id="p">1 parent </pre></div></div>']
  ])('%s：不放行（首轮、插入后都保持原文）', async (_, html) => {
    start(html)
    expect($('#p').textContent).toBe('1 parent ')
    $('#p').append('commit')
    await settle()
    expect($('#p').textContent).toBe('1 parent commit')
  })
})

describe('活动概览雷达图的 <svg> 按选择器放行', () => {
  const RADAR = `
    <div class="js-activity-overview-graph-container" data-percentages='{"Commits":82,"Pull requests":16,"Code review":2,"Issues":0}'>
      <svg class="js-activity-overview-graph mx-auto d-block" xmlns="http://www.w3.org/2000/svg" width="285" height="261">
        <title>A graph representing octocat's contributions from October 26, 2025 to October 26, 2026. The contributions are 82% commits, 16% pull requests, 2% code review, 0% issues.</title>
        <g>
          <text class="activity-overview-percentage js-highlight-percent-top">2%</text>
          <text class="text-small activity-overview-label js-highlight-label-top" id="top">Code review</text>
          <text class="activity-overview-percentage js-highlight-percent-right">&nbsp;</text>
          <text class="text-small activity-overview-label js-highlight-label-right" id="right">Issues</text>
          <text class="text-small activity-overview-label js-highlight-label-bottom" id="bottom">Pull requests</text>
          <text class="text-small activity-overview-label js-highlight-label-left" id="left">Commits</text>
        </g>
      </svg>
    </div>
    <svg class="octicon" id="icon"><text>Issues</text></svg>`

  it('标签译出；说明（title）不译、不进未翻译；其他 SVG 照旧跳过', () => {
    const t = start(RADAR, PROFILE_PAGES)
    expect(['#top', '#right', '#bottom', '#left'].map(id => $(id).textContent)).toEqual(['代码审查', '议题', '拉取请求', '提交'])
    expect($('.js-activity-overview-graph title').textContent).toContain("octocat's contributions")
    expect($('#icon').textContent).toBe('Issues')
    expect(t.drainUntranslated()).toEqual([])
  })

  it('脚本重绘（textContent 清空后追加英文文本节点）后重译', async () => {
    start(RADAR, PROFILE_PAGES)
    const top = $('#top')
    top.textContent = ''
    top.appendChild(document.createTextNode('Code review'))
    await settle()
    expect(top.textContent).toBe('代码审查')
  })
})

describe('Highcharts 图表的 <svg> 按选择器放行', () => {
  const CHART = `
    <div class="highcharts-container">
      <svg class="highcharts-root" xmlns="http://www.w3.org/2000/svg" width="600" height="300">
        <g class="highcharts-legend"><g class="highcharts-legend-item"><text id="legend">Commits</text></g></g>
        <g class="highcharts-axis"><text class="highcharts-axis-title" id="axis">Code review</text></g>
      </svg>
    </div>
    <svg class="octicon" id="icon"><text>Commits</text></svg>`

  it('图例与坐标轴标题译出；其他 SVG 照旧跳过', () => {
    start(CHART, PROFILE_PAGES)
    expect($('#legend').textContent).toBe('提交')
    expect($('#axis').textContent).toBe('代码审查')
    expect($('#icon').textContent).toBe('Commits')
  })

  it('重绘（替换文本节点）后重译', async () => {
    start(CHART, PROFILE_PAGES)
    const legend = $('#legend')
    legend.textContent = ''
    legend.appendChild(document.createTextNode('Code review'))
    await settle()
    expect(legend.textContent).toBe('代码审查')
  })
})
