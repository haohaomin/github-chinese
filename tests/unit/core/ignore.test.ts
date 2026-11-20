import { beforeEach, describe, expect, it } from 'vitest'
import {
  CLASSIC_PREVIEW_SELECTOR,
  IGNORE_SELECTORS,
  IGNORE_TAGS,
  ISSUE_TYPE_NAME_SELECTORS,
  LABEL_DESCRIPTION_SELECTORS,
  LABEL_NAME_SELECTORS,
  LABEL_SELECTORS,
  LIST_NAME_SELECTORS,
  MIRROR_ATTRIBUTES,
  MIRROR_SELECTOR,
  PLACEHOLDER_SELECTOR,
  PLACEHOLDER_TEXTS,
  TRANSLATABLE_ATTRIBUTES
} from '../../../src/core/ignore'
import { normalizeText } from '../../../src/core/matcher'
import { compileIgnoreIndex, selectorKeys, splitSelectorList } from '../../../src/core/selectors'
import { PAGE_IGNORES } from './helpers'

const index = compileIgnoreIndex(IGNORE_SELECTORS, document.createElement('div'))

/** 与引擎一致：元素自身或任一祖先命中忽略选择器即整块跳过 */
function ignored(element: Element): boolean {
  return element.closest(index.selector) !== null
}

function mount(html: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host
}

/** 规范化后与 text 相同的第一个文本节点所在元素 */
function owner(host: Element, text: string): Element {
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent?.replace(/\s+/g, ' ').trim() === text) return node.parentElement!
  }
  throw new Error(`片段中没有文本：${text}`)
}

function find(host: Element, selector: string): Element {
  const element = host.querySelector(selector)
  if (!element) throw new Error(`片段中没有元素：${selector}`)
  return element
}

/** 返回 texts 中被忽略的文本，便于失败时直接看出是哪一条 */
function ignoredTexts(host: Element, texts: readonly string[]): string[] {
  return texts.filter(text => ignored(owner(host, text)))
}

/** 最右复合选择器之前的部分（祖先条件）；跳过括号、方括号与引号内的字符 */
function ancestorPart(selector: string): string {
  let depth = 0
  let quote = ''
  let start = 0
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i]!
    if (quote) {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '(' || char === '[') {
      depth++
    } else if (char === ')' || char === ']') {
      depth--
    } else if (depth === 0 && /[\s>+~]/.test(char)) {
      start = i + 1
    }
  }
  return selector.slice(0, start)
}

/** 引用会被引擎翻译（含镜像文字属性）的属性的属性选择器 */
const TRANSLATED_ATTRIBUTE_RE = new RegExp(
  `\\[\\s*(?:${[...TRANSLATABLE_ATTRIBUTES, ...MIRROR_ATTRIBUTES, 'value'].join('|')})\\s*[\\]~|^$*=]`
)

beforeEach(() => {
  document.body.replaceChildren()
})

describe('IGNORE_TAGS', () => {
  it('标签名为大写', () => {
    for (const tag of IGNORE_TAGS) expect(tag).toBe(tag.toUpperCase())
  })
})

describe('IGNORE_SELECTORS', () => {
  it('全部是合法选择器', () => {
    for (const selector of IGNORE_SELECTORS) expect(() => document.querySelector(selector), selector).not.toThrow()
    expect(index.invalid).toEqual([])
  })

  it('没有重复', () => {
    expect(new Set(IGNORE_SELECTORS).size).toBe(IGNORE_SELECTORS.length)
  })

  it('都能按特征建索引，不需要逐元素匹配', () => {
    for (const selector of IGNORE_SELECTORS) {
      for (const complex of splitSelectorList(selector)) expect(selectorKeys(complex), complex).toBeDefined()
    }
    expect(index.universal).toEqual([])
  })

  it('祖先条件不依赖会被翻译的属性', () => {
    expect(ancestorPart('nav[aria-label="Categories"] li')).toMatch(TRANSLATED_ATTRIBUTE_RE)
    expect(ancestorPart('a[aria-label$=" (category)"]')).toBe('')
    for (const selector of IGNORE_SELECTORS) {
      for (const complex of splitSelectorList(selector)) {
        expect(ancestorPart(complex), complex).not.toMatch(TRANSLATED_ATTRIBUTE_RE)
      }
    }
  })
})

describe('真实结构：用户内容命中，界面文字不命中', () => {
  it('details-dialog 法律文本、组织合规页报告说明的 .markdown-body 照常翻译；其他 .markdown-body 仍忽略', () => {
    const host = mount(`
      <details class="details-reset details-overlay">
        <summary>GitHub Marketplace Developer Agreement</summary>
        <details-dialog class="Box Box--overlay d-flex flex-column">
          <div class="Box-body markdown-body overflow-auto">
            <h2>1. DEFINITIONS</h2>
            <p><strong>2.1</strong> This Agreement sets forth the terms.</p>
          </div>
        </details-dialog>
      </details>
      <div class="col-12 tmp-mr-5 mb-1">
        <div class="markdown-body f5 color-fg-muted mt-2">Our SOC 2 reports assume the use of certain security features.</div>
      </div>
      <div class="Box-body wiki-custom-sidebar markdown-body"><p>Sidebar link</p></div>
      <article class="markdown-body entry-content container-lg"><p>Project readme</p></article>
    `)
    expect(
      ignoredTexts(host, [
        '1. DEFINITIONS',
        'This Agreement sets forth the terms.',
        'Our SOC 2 reports assume the use of certain security features.'
      ])
    ).toEqual([])
    expect(ignoredTexts(host, ['Sidebar link', 'Project readme'])).toEqual(['Sidebar link', 'Project readme'])
  })

  it('讨论：标题、分类分组名；分类链接交给 discussions 词典', () => {
    const host = mount(`
      <nav class="NavigationList" aria-label="Categories">
        <ul class="ActionList" role="list">
          <li class="ActionList-item--navActive ActionList-item" data-item-id="all">
            <a class="ActionList-content" href="/vercel/next.js/discussions" aria-current="page">
              <span class="ActionList-item-label">View all discussions</span>
            </a>
          </li>
          <li class="ActionList-item--hasSubItem ActionList-item" data-item-id="">
            <button class="ActionList-content" type="button" aria-expanded="true">
              <span class="ActionList-item-label">Ask for help</span>
            </button>
            <ul class="ActionList ActionList--subGroup">
              <li class="ActionList-item ActionList-item--subItem" data-item-id="help">
                <a class="ActionList-content" href="/vercel/next.js/discussions/categories/help">
                  <span class="ActionList-item-label">Help</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <a class="ActionListContent" role="menuitemcheckbox" href="/vercel/next.js/discussions/categories/help">
        <span class="ActionListItem-label">Open</span>
      </a>
      <a class="select-menu-item" role="menuitemradio" href="/vercel/next.js/discussions/categories/help?discussions_q=is%3Aopen">
        <span class="select-menu-item-text">Latest activity</span>
      </a>
      <div class="text-small color-fg-muted mt-1">
        <a class="Link--muted Link--inTextBlock" aria-label="Ideas (category)" href="/vercel/next.js/discussions/categories/ideas">Ideas</a>
        <span>asked</span>
        <relative-time datetime="2026-10-24T08:00:00Z">Oct 24, 2026</relative-time>
      </div>
      <h3><a class="lh-condensed discussion-title Link--primary Link" href="/vercel/next.js/discussions/10640">Show your sites</a></h3>
      <span class="Truncate">
        <a class="Truncate-text" aria-label="Announcements (category)" href="/vercel/next.js/discussions?discussions_q=category%3AAnnouncements">Announcements</a>
        <a class="Truncate-text" aria-label="timneutkens (author)" href="/timneutkens">timneutkens</a>
      </span>`)
    const user = ['Ask for help', 'Show your sites']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['View all discussions', 'Open', 'Latest activity', 'asked', 'Oct 24, 2026'])).toEqual([])
    expect(ignored(find(host, 'relative-time'))).toBe(false)
    // discussions 词典翻译默认分类名与“(category)”“(author)”无障碍名称，这些链接不能忽略
    for (const selector of ['a[aria-label="Ideas (category)"]', 'a[aria-label$="(category)"]', 'a[aria-label$="(author)"]']) {
      expect(ignored(find(host, selector)), selector).toBe(false)
    }
    expect(ignored(owner(host, 'Help'))).toBe(false)
  })

  it('发行版：标题、标签名、作者、资源文件名与导航', () => {
    const host = mount(`
      <section aria-labelledby="hd-1" data-release-anchor="release-v3.6.0-rc.13">
        <h2 class="sr-only" id="hd-1">Vue 3.6 RC</h2>
        <div class="Box"><div class="Box-body">
          <div class="d-flex flex-md-row flex-column">
            <div class="d-flex flex-row flex-1 tmp-mb-3 wb-break-word">
              <div class="flex-1">
                <span class="tmp-mr-3 f1 text-bold d-inline">
                  <a class="Link--primary Link" href="/vuejs/core/releases/tag/v3.6.0-rc.13">Vue 3.6 release candidate</a>
                </span>
                <span class="Label Label--warning Label--large">Pre-release</span>
              </div>
            </div>
            <button type="button" class="Button--secondary Button--small Button"><span class="Button-label">Compare</span></button>
          </div>
          <div class="d-flex flex-row flex-wrap color-fg-muted flex-items-end">
            <div class="tmp-mr-4 mb-2">
              <a class="text-bold color-fg-muted" href="/apps/github-actions">github-actions</a>
              released this
              <relative-time datetime="2026-10-23T07:59:39Z">23 Oct 07:59</relative-time>
            </div>
            <div class="tmp-mr-4 mb-2">
              <a class="Link Link--muted" href="/vuejs/core/tree/nightly-build">
                <span class="css-truncate css-truncate-target">
                  <svg aria-label="Tag" role="img" class="octicon octicon-tag"></svg><span class="ml-1">nightly-build</span>
                </span>
              </a>
            </div>
          </div>
        </div></div>
      </section>
      <div class="Box-body"><div class="d-flex"><div class="flex-1"><h1 class="tmp-mr-3 d-inline">GitHub CLI 2.103.2</h1></div></div></div>
      <ul class="list-style-none f6">
        <li class="d-inline-block mt-1 mr-2"><a class="Link--muted" href="/vuejs/core/releases/tag/v3.6.0-rc.13">Notes</a></li>
      </ul>
      <a class="wb-break-all" href="/vuejs/core/archive/refs/tags/v3.5.44.zip"><span class="text-bold">Source code</span> (zip)</a>
      <a class="wb-break-all" href="/cli/cli/releases/download/v2.103.2/gh_checksums.txt"><span class="text-bold">gh checksums</span></a>
      <nav aria-label="Release list navigation">
        <ul class="ActionListWrap">
          <li class="ActionListItem" data-item-id="release-v3.5.44">
            <a class="ActionListContent" aria-label="Stable 3.5.44" title="Stable 3.5.44" href="#release-v3.5.44">
              <span class="ActionListItem-label">Stable 3.5.44</span>
            </a>
          </li>
        </ul>
      </nav>`)
    const user = [
      'Vue 3.6 RC',
      'Vue 3.6 release candidate',
      'github-actions',
      'nightly-build',
      'GitHub CLI 2.103.2',
      'gh checksums',
      'Stable 3.5.44'
    ]
    expect(ignoredTexts(host, user)).toEqual(user)
    const ui = ['Pre-release', 'Compare', 'released this', '23 Oct 07:59', 'Notes', 'Source code', '(zip)']
    expect(ignoredTexts(host, ui)).toEqual([])
    expect(ignored(find(host, 'svg[aria-label="Tag"]'))).toBe(false)
  })

  it('Actions：工作流名、作业名、分支名', () => {
    const host = mount(`
      <ul>
        <li class="listItem__X41oTe ListItem__SfuuaF" aria-label="completed successfully: Run 27405 of Deploy docs.">
          <div class="container__VGL_Vt MainContent__zoDzfF"><div class="inner__Rm1Enx">
            <div class="container__W45oI6 d-flex flex-wrap">
              <strong>Deploy docs</strong><span>#27405:</span><span>Commit</span>
              <a class="prc-Link-Link-9ZwDx" href="/vuejs/core/commit/1e1a7ca">1e1a7ca</a><span>pushed</span><span>by</span>
            </div>
          </div></div>
          <div class="container__1MF1B1"><div class="metadata__lB1fsH">
            <a class="prc-BranchName-BranchName-CMTaU" data-component="BranchName" href="/vuejs/core/tree/feature/docs">feature/docs</a>
          </div></div>
        </li>
      </ul>
      <span class="PageHeader-parentLink">
        <a class="Link" href="/vuejs/core/actions/workflows/release.yml"><span class="PageHeader-parentLink-label">Release pipeline</span></a>
      </span>
      <streaming-graph-job class="WorkflowJob">
        <a class="WorkflowJob-title" href="/vuejs/core/actions/runs/1/job/2">
          <span class="css-truncate css-truncate-overflow" data-target="streaming-graph-job.name">Build</span>
          <span class="text-small color-fg-muted">1m 41s</span>
        </a>
        <tool-tip class="jobName-truncation-tooltip sr-only" for="workflow-job-name-build">test / Build</tool-tip>
      </streaming-graph-job>
      <a class="position-relative d-block f5 Link--primary" href="/vuejs/core/actions/runs/40257031832">
        <span>Lint</span><span class="f6 text-normal d-block color-fg-muted">on: pull_request</span>
      </a>
      <a class="d-inline-block SideNav-subItem" href="/vuejs/core/actions/runs/1/job/3?pr=1">Test matrix</a>
      <a class="d-inline-block SideNav-subItem" href="/vuejs/core/pull/1/checks?check_run_id=5">Header rules</a>`)
    const user = ['Deploy docs', 'feature/docs', 'Release pipeline', 'Build', 'test / Build', 'Lint', 'Test matrix', 'Header rules']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['#27405:', 'Commit', 'pushed', 'by', '1m 41s', 'on: pull_request'])).toEqual([])
    expect(ignored(find(host, 'li[aria-label]'))).toBe(false)
  })

  it('标签：名称、说明与说明提示', () => {
    const host = mount(`
      <div class="container__W45oI6 labelRowDescription__BiyOt7">
        <div class="default__oxxQZ0">
          <a aria-label="documentation" href="/vuejs/core/issues?q=state%3Aopen%20label%3Adocumentation">
            <span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM">
              <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">documentation</span></span>
            </span>
          </a>
        </div>
        <div class="default__oxxQZ0 labelRowDescriptionItemDescription__btj1EZ">Improvements or additions to documentation</div>
        <div class="default__oxxQZ0 labelRowIssuesAndPrsCount__zLwVeZ">
          <a class="countItem__vYhvTp prc-Link-Link-9ZwDx" href="/vuejs/core/pulls?q=label%3Adocumentation">
            20<span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB">open pull requests</span>
          </a>
        </div>
      </div>
      <span class="lh-default">
        <a id="label-857372" class="IssueLabel" href="/vuejs/core/labels/scope">scope: vapor</a>
        <tool-tip for="label-857372" popover="manual" data-type="description" class="sr-only" role="tooltip">related to vapor mode</tool-tip>
      </span>
      <tool-tip for="Comment-actions-1-text" popover="manual" data-type="label" class="sr-only">Comment options</tool-tip>`)
    const user = ['documentation', 'Improvements or additions to documentation', 'scope: vapor', 'related to vapor mode']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['open pull requests', 'Comment options'])).toEqual([])
    expect(ignored(find(host, 'a[aria-label="documentation"]'))).toBe(true)
  })

  it('探索：趋势语言菜单、开发者、主题与集合', () => {
    const host = mount(`
      <div id="languages-menuitems">
        <a class="select-menu-item" role="menuitemradio" href="https://github.com/trending/unknown?since=daily">
          <span class="select-menu-item-text">Unknown languages</span>
        </a>
        <a class="select-menu-item" role="menuitemradio" href="https://github.com/trending/typescript?since=daily">
          <span class="select-menu-item-text">TypeScript</span>
        </a>
      </div>
      <article class="Box-row d-flex">
        <div class="col-md-6">
          <h1 class="h3 lh-condensed"><a class="Link" href="/mvanhorn">Matt Van Horn</a></h1>
          <p class="f4 text-normal mb-1"><a class="Link--secondary Link" href="/mvanhorn">mvanhorn</a></p>
        </div>
        <div class="col-md-6"><article>
          <div class="f6 color-fg-muted text-uppercase mb-1">Popular repo</div>
          <h1 class="h4 lh-condensed"><a class="css-truncate css-truncate-target Link" href="/mvanhorn/skill">skill-kit</a></h1>
          <div class="f6 color-fg-muted mt-1">Research any topic</div>
        </article></div>
        <a class="btn btn-sm btn-block">Follow</a>
      </article>
      <a class="no-underline flex-1 d-flex flex-column" href="/topics/awesome">
        <p class="f3 lh-condensed mb-0 mt-1 Link--primary">Awesome Lists</p>
        <p class="f5 color-fg-muted mb-0 mt-1">Lists of awesome things.</p>
      </a>
      <a href="/topics"><p>See all topics</p></a>
      <article class="d-flex border-bottom color-border-muted">
        <div class="col-10 col-md-11"><h2 class="h3"><a href="/collections/music">Music</a></h2>Musically themed repositories.</div>
      </article>`)
    const user = [
      'TypeScript',
      'Matt Van Horn',
      'mvanhorn',
      'skill-kit',
      'Research any topic',
      'Awesome Lists',
      'Lists of awesome things.',
      'Music',
      'Musically themed repositories.'
    ]
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['Unknown languages', 'Popular repo', 'Follow', 'See all topics'])).toEqual([])
  })

  it('提交与比较：推送标题、提交菜单、范围选择', () => {
    const host = mount(`
      <h2 data-testid="push-link" class="h5">Deleted branch</h2>
      <h2 data-testid="push-link" class="h5">
        <div class="truncate__u1Uy83 prc-Truncate-Truncate-2G1eo" title="perf: trim allocations">
          <div class="commitMessage__ti06KT">perf: trim allocations</div>
        </div>
      </h2>
      <a class="select-menu-item" role="menuitem" href="/vuejs/core/pull/1/files">
        <div class="select-menu-item-text"><div class="text-emphasized css-truncate css-truncate-target">Show all changes</div></div>
      </a>
      <a class="select-menu-item" role="menuitem" href="/vuejs/core/pull/1/commits/0ff253b">
        <div class="select-menu-item-text"><div class="text-emphasized css-truncate css-truncate-target">fix: handle empty slot</div></div>
      </a>
      <div class="range-editor">
        <span class="Button-label">
          <span class="fgColor-muted text-bold">base:</span>
          <span class="css-truncate css-truncate-target" data-menu-button="">release-branch</span>
        </span>
      </div>
      <ul><li class="Box-row d-flex"><a class="css-truncate css-truncate-target" href="/vuejs/core/compare/main...feature">feature</a></li></ul>`)
    const user = ['perf: trim allocations', 'fix: handle empty slot', 'release-branch', 'feature']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['Deleted branch', 'Show all changes', 'base:'])).toEqual([])
    expect(ignored(find(host, '[title="perf: trim allocations"]'))).toBe(true)
  })

  it('用户名：链接、成员列表、迷你名片；含界面文字的筛选按钮不忽略', () => {
    const host = mount(`
      <button type="button" class="filterLink__ywNfwR" data-testid="author-filter-link" data-hovercard-type="user">
        <span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB">Filter by author</span>octocat
      </button>
      <span class="d-flex min-width-0 js-hovercard-left flex-1" data-hovercard-type="user">
        <a class="assignee Link--primary" href="/babakks"><span class="css-overflow-wrap-anywhere">babakks</span></a>
      </span>
      <ul><li class="member-list-item">
        <div class="css-truncate flex-auto">
          <a class="f4 d-block" data-hovercard-type="user" href="/afontcu">Adrià Fontcuberta</a>
          <span class="color-fg-default">afontcu</span>
        </div>
        <a class="btn btn-sm">Follow</a>
      </li></ul>
      <div class="user-profile-mini-vcard d-table">
        <span class="d-table-cell"><div class="css-truncate css-truncate-target"><strong>sindresorhus</strong></div></span>
      </div>`)
    const user = ['babakks', 'Adrià Fontcuberta', 'afontcu', 'sindresorhus']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['Filter by author', 'Follow'])).toEqual([])
  })

  it('团队名：审查摘要 on behalf of 后的团队链接不翻译（与词条同名也是）；说明文字与分隔符照常', () => {
    // 拉取请求审查摘要（OnBehalfOfTeams）：团队链接内是团队名，分隔符在链接外
    const host = mount(`
      <span class="delegationNote__abc12 pt-1">on behalf of <span class="nestedTeamList__abc12"><a
        class="inlineReviewerIdentity__abc12" data-hovercard-type="team"
        data-hovercard-url="/orgs/octo-org/teams/sample/hovercard" href="/orgs/octo-org/teams/sample"><span
        class="inlineReviewerName__abc12">Sample</span></a><span class="separator__abc12">, </span></span><span
        class="nestedTeamList__abc12"><a class="inlineReviewerIdentity__abc12" data-hovercard-type="team"
        href="/orgs/octo-org/teams/octo-team"><span class="inlineReviewerName__abc12">octo-team</span></a></span></span>`)
    expect(ignoredTexts(host, ['Sample', 'octo-team'])).toEqual(['Sample', 'octo-team'])
    expect(ignoredTexts(host, ['on behalf of', ','])).toEqual([])
  })

  it('文件：目录列表、面包屑、查找结果、差异文件头与文件树', () => {
    const host = mount(`
      <div class="react-directory-filename-cell"><div class="react-directory-truncate">
        <a class="Link--primary" title="docs" aria-label="docs, (Directory)" href="/vuejs/core/tree/main/docs">docs</a>
      </div></div>
      <div class="react-directory-filename-cell"><div class="react-directory-truncate">
        <a class="Link--primary" title="This path skips through empty directories" aria-label=".github/workflows, (Directory)"
          href="/vuejs/core/tree/main/.github/workflows">
          <span class="react-directory-default-color" data-testid="path-name-segment">.github/</span>
          <span data-testid="path-name-segment">workflows</span>
        </a>
      </div></div>
      <nav data-testid="breadcrumbs" aria-labelledby="breadcrumb-heading">
        <h2 class="sr-only" id="breadcrumb-heading">Breadcrumbs</h2>
        <ol><li><a data-testid="breadcrumbs-repo-link" href="/vuejs/core/tree/main">core</a></li></ol>
        <div data-testid="breadcrumbs-filename"><h1>package.json</h1></div>
      </nav>
      <a class="tree-browser-result no-underline" role="option" href="/vuejs/core/blob/main/README.md"><marked-text>README.md</marked-text></a>
      <div class="file-info flex-auto">
        <span class="sr-only">2 changes: 1 addition &amp; 1 deletion</span>
        <span class="Truncate"><a class="Link--primary Truncate-text" title="src/index.ts" href="#diff-1">src/index.ts</a></span>
      </div>
      <file-tree><ul class="ActionList"><li class="ActionList-item js-tree-node" role="treeitem">
        <span data-filterable-item-text hidden>packages/runtime/src/main.ts</span>
        <a class="ActionList-content"><span class="ActionList-item-label">main.ts</span></a>
      </li></ul></file-tree>`)
    const user = [
      'docs',
      '.github/',
      'workflows',
      'core',
      'package.json',
      'README.md',
      'src/index.ts',
      'packages/runtime/src/main.ts',
      'main.ts'
    ]
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['Breadcrumbs', '2 changes: 1 addition & 1 deletion'])).toEqual([])
    // 合并路径链接的 title 是界面文字，链接本身不忽略
    expect(ignored(find(host, '[title="This path skips through empty directories"]'))).toBe(false)
    expect(ignored(find(host, '[title="docs"]'))).toBe(true)
  })

  it('查询框：高亮层与尺寸层镜像输入的查询，不翻译；标签与按钮照常翻译', () => {
    const host = mount(`
      <query-builder>
        <label for="notifications-search-input">Search notifications</label>
        <div class="QueryBuilder-InputWrapper">
          <div aria-hidden="true" class="QueryBuilder-Sizer"><span></span>reason:mention</div>
          <div class="QueryBuilder-StyledInputContainer">
            <div aria-hidden="true" class="QueryBuilder-StyledInputContent"><span data-type="filter-expression"><span data-type="filter">reason</span><span>:</span><span data-type="filter-value">assign</span></span></div>
          </div>
        </div>
        <button type="button">Clear</button>
      </query-builder>
      <div class="styled-input-container"><div><span aria-hidden="true"><span>is:open</span> <span>author</span></span></div></div>
      <div class="styled-input-content"><span>label:bug</span></div>`)
    expect(ignoredTexts(host, ['reason:mention', 'reason', 'assign', 'is:open', 'author', 'label:bug'])).toEqual([
      'reason:mention',
      'reason',
      'assign',
      'is:open',
      'author',
      'label:bug'
    ])
    expect(ignoredTexts(host, ['Search notifications', 'Clear'])).toEqual([])
  })

  it('查询框建议：url-result 标签（查询回显）不翻译；分组标题、尾注、filter-result 与其他列表照常', () => {
    const host = mount(`
      <ul role="listbox" class="ActionListWrap QueryBuilder-ListWrap" aria-label="Suggestions">
        <li role="presentation" class="ActionList-sectionDivider">
          <h3 class="ActionList-sectionDivider-title QueryBuilder-sectionTitle">Search</h3>
          <ul role="presentation">
            <li role="option" class="ActionListItem" aria-label="is:open Help, Submit search" data-type="url-result">
              <span class="QueryBuilder-ListItem-link ActionListContent QueryBuilder-ListItem">
                <span class="ActionListItem-descriptionWrap">
                  <span class="ActionListItem-label text-normal"><span>is:</span><span data-type="filter-value">open</span><span></span><span>Help</span></span>
                </span>
                <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing">Submit search</span>
              </span>
            </li>
            <li role="option" class="ActionListItem" data-type="filter-result" data-value="label">
              <span class="ActionListContent QueryBuilder-ListItem"><span class="ActionListItem-descriptionWrap">
                <span class="ActionListItem-label text-normal">Security</span>
              </span></span>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="ActionListWrap"><li class="ActionListItem" data-type="url-result"><span class="ActionListItem-label">Settings</span></li></ul>`)
    expect(ignoredTexts(host, ['is:', 'open', 'Help'])).toEqual(['is:', 'open', 'Help'])
    expect(ignoredTexts(host, ['Search', 'Submit search', 'Security', 'Settings'])).toEqual([])
    expect(ignored(find(host, 'li[data-type="url-result"]'))).toBe(false)
  })

  it('快速搜索：输入叠加层、最近搜索与原词搜索建议、顶部按钮里的当前查询不翻译；界面文字照常', () => {
    const host = mount(`
      <div role="dialog" data-component="Dialog">
        <h1 class="sr-only">Quick search</h1>
        <div class="inputWrapper__5m6uxa">
          <div class="inputOverlay__K9QHpO" aria-hidden="true" data-testid="quick-search-input-overlay"><span>is:</span><span class="filterValue__x1">open</span></div>
          <input type="text" role="combobox" placeholder="Search or jump to..." value="is:open">
        </div>
        <ul role="listbox">
          <li role="none"><a id="qs-option-recent-Settings" data-testid="quick-search-suggestion" role="option" href="/search?q=Settings">
            <span class="suggestionName__mZ5KXf"><span>Settings</span></span><span class="sr-only">Recent search</span></a></li>
          <li role="none"><a id="qs-option-search-plain-Issues" data-testid="quick-search-suggestion" role="option" href="/search?q=Issues">
            <span class="suggestionName__mZ5KXf">Issues</span><span class="trailing__a1">Search all of GitHub</span></a></li>
          <li role="none"><a id="qs-option-explore-issues" data-testid="quick-search-suggestion" role="option" href="/features/issues">
            <span class="suggestionName__mZ5KXf">Explore issues</span></a></li>
        </ul>
        <a href="https://docs.github.com/search-github">Search syntax tips</a>
      </div>
      <button type="button" class="Search-module__searchButton__aiE0a"><span data-component="text">
        <span class="Search-module__placeholder__p9hbG Search-module__text__veSYi">is:issue label:bug</span></span></button>
      <button type="button" class="Search-module__searchButton__aiE0a"><span data-component="text">
        <span class="Search-module__placeholder__p9hbG Search-module__value__TFoak">Type <kbd class="Search-module__kbd__WCskr">/</kbd> to search</span></span></button>`)
    const user = ['is:', 'open', 'Settings', 'Issues', 'is:issue label:bug']
    expect(ignoredTexts(host, user)).toEqual(user)
    const ui = ['Quick search', 'Recent search', 'Search all of GitHub', 'Explore issues', 'Search syntax tips', 'Type', 'to search']
    expect(ignoredTexts(host, ui)).toEqual([])
    expect(ignored(find(host, 'input'))).toBe(false)
  })

  it('评论框自动补全建议：表情符号名、用户名、问题标题不翻译；列表外的读屏提示照常', () => {
    const host = mount(`
      <div class="Overlay_0__pXyGlP">
        <ul role="listbox" aria-label="Autocomplete suggestions" class="ActionList_0__k18x-M">
          <li role="option" class="prc-ActionList-ActionListItem-uq6I7 suggestion__lNPZhM" aria-selected="true">
            <span class="prc-ActionList-LeadingVisual">😕</span><span class="prc-ActionList-ItemLabel">confused</span></li>
          <li role="option" class="prc-ActionList-ActionListItem-uq6I7 suggestion__lNPZhM">
            <span class="prc-ActionList-ItemLabel">octocat</span><span>Sample text</span></li>
        </ul>
      </div>
      <span aria-live="assertive" class="sr-only">Loading autocomplete suggestions…</span>
      <text-expander keys=": @ #" data-emoji-url="/autocomplete/emoji">
        <textarea aria-label="Comment body"></textarea>
        <ul role="listbox" class="suggester-container suggester suggestions list-style-none position-absolute">
          <li role="option" data-emoji-name="heart" data-text="heart love"><g-emoji alias="heart">❤️</g-emoji> heart</li>
          <li role="option" data-emoji-name="rocket" data-text="rocket"><g-emoji alias="rocket">🚀</g-emoji> rocket</li>
        </ul>
      </text-expander>
      <div class="suggestion__g-7Pdj"><span>Suggestion applied</span></div>`)
    const user = ['confused', 'octocat', 'Sample text', 'heart', 'rocket']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['Loading autocomplete suggestions…', 'Suggestion applied'])).toEqual([])
    expect(ignored(find(host, 'ul[aria-label]'))).toBe(false)
    expect(ignored(find(host, 'textarea'))).toBe(false)
  })

  it('检查运行页：头部提交信息不翻译，分支与状态照常', () => {
    const host = mount(`
      <div class="d-flex check-page-commit-message-container"><div class="d-flex flex-column tmp-pl-3">
        <h2 class="f3 text-normal css-truncate css-truncate-target check-page-commit-message">Delete unused files</h2>
        <div><span class="mr-2">Annotations</span></div>
      </div></div>`)
    expect(ignoredTexts(host, ['Delete unused files'])).toEqual(['Delete unused files'])
    expect(ignoredTexts(host, ['Annotations'])).toEqual([])
  })

  it('文件树名称的悬停提示（Portal 渲染）不翻译；其他提示照常', () => {
    const host = mount(`
      <div id="__primerPortalRoot__">
        <span role="tooltip" aria-label="Settings" data-visible-text="Settings" data-testid="Settings-directory-item-tooltip" class="tooltipBase__xwaNrA">Settings</span>
        <span role="tooltip" aria-label="Docs" data-visible-text="Docs" data-testid="Docs-item-tooltip" class="tooltipBase__xwaNrA">Docs</span>
        <span role="tooltip" aria-label="Open pull request" data-visible-text="Open pull request" class="tooltipBase__xwaNrA">Open pull request</span>
        <span data-testid="item-count">Items</span>
      </div>`)
    expect(ignoredTexts(host, ['Settings', 'Docs'])).toEqual(['Settings', 'Docs'])
    expect(ignoredTexts(host, ['Open pull request', 'Items'])).toEqual([])
  })

  it('评论头部的作者名（与词条同名也不翻译）；动作文字照常', () => {
    const host = mount(`
      <div class="ActivityHeader-module__headerContainer__abc12">
        <a data-testid="avatar-link" href="/today" class="ActivityHeader-module__authorLink__abc12">today</a>
        <span data-testid="avatar-name">Issues</span>
        <span class="ActivityHeader-module__action__abc12">commented</span>
      </div>`)
    expect(ignoredTexts(host, ['today', 'Issues'])).toEqual(['today', 'Issues'])
    expect(ignoredTexts(host, ['commented'])).toEqual([])
  })

  it('建议块：代码格（GitHub 读取其文字生成提交）不翻译', () => {
    const host = mount(`
      <div class="my-2 border rounded-2 js-suggested-changes-blob diff-view">
        <div class="blob-wrapper data file"><table class="d-table tab-size mb-0 width-full"><tbody>
          <tr class="border-0">
            <td class="blob-num blob-num-deletion text-right border-0 px-2 py-1 lh-default" data-line-number="1"></td>
            <td class="border-0 px-2 py-1 blob-code-inner blob-code-deletion js-blob-code-deletion">Open</td>
          </tr>
          <tr class="border-0">
            <td class="blob-num blob-num-addition text-right border-0 px-2 py-1 lh-default" data-line-number="1"></td>
            <td class="border-0 px-2 py-1 blob-code-inner blob-code-addition js-blob-code-addition">Close</td>
          </tr>
        </tbody></table></div>
      </div>`)
    expect(ignoredTexts(host, ['Open', 'Close'])).toEqual(['Open', 'Close'])
  })

  it('差异视图：代码高亮区不翻译，空文件提示照常翻译', () => {
    const host = mount(`
      <div class="data highlight js-blob-wrapper"><span class="pl-k">Close</span></div>
      <div class="data highlight empty">
        Empty file.
      </div>`)
    expect(ignoredTexts(host, ['Close'])).toEqual(['Close'])
    expect(ignoredTexts(host, ['Empty file.'])).toEqual([])
  })

  it('ListView 条目标题：议题、标签、证明列表的主体名不翻译；证明详情摘要的字段名照常翻译', () => {
    const host = mount(`
      <ul class="ul__5IxUHb" role="list" data-listview-component="items-list" data-density="default">
        <li class="listItem__X41oTe">
          <div class="container__mDVuhO" data-listview-item-title-container="true">
            <h3 class="heading__fzQskI"><a class="anchor__PSAOdR" href="/octo-org/hello-world/issues/1"><span>Settings</span></a></h3>
          </div>
        </li>
      </ul>
      <ul class="ul__5IxUHb" role="list" data-listview-component="items-list" data-density="default">
        <li class="listItem__X41oTe" role="listitem" data-label-id="LA_1">
          <div class="container__mDVuhO sr-only" data-listview-item-title-container="true">
            <h4 class="heading__fzQskI"><span>question</span></h4>
          </div>
        </li>
      </ul>
      <ul class="ul__5IxUHb" role="list" data-listview-component="items-list" data-density="default">
        <li class="listItem__X41oTe">
          <div class="container__mDVuhO" data-listview-item-title-container="true">
            <h5 class="heading__fzQskI"><a class="anchor__PSAOdR" href="/octo-org/hello-world/attestations/1"><span>octocat.deb and 2 others</span></a></h5>
          </div>
          <div class="container__VGL_Vt"><div class="container__W45oI6">
            <div class="default__oxxQZ0"><relative-time data-testid="attestation-list-item-date" datetime="2026-10-23T20:22:17.000Z">Oct 23, 2026</relative-time> by</div>
            <div class="default__oxxQZ0"><a data-testid="attestation-workflow-link" href="/octo-org/hello-world/actions/runs/1/attempts/1">build.yml@refs/heads/main</a></div>
          </div></div>
        </li>
      </ul>
      <div class="container__uZQXyV">
        <h2 class="sr-only">Attestation summary</h2>
        <ul class="ul__5IxUHb" role="list" data-listview-component="items-list" data-density="compact">
          <li class="listItem__X41oTe compact___mvP2J" aria-label="Created. Oct 23 (Fri, 23 Oct 2026 20:22:17 GMT).">
            <div class="container__mDVuhO compact__3vbapR" data-listview-item-title-container="true">
              <h3 class="heading__fzQskI compact__3vbapR"><span>Created</span></h3>
            </div>
            <div class="container__VGL_Vt"><relative-time data-testid="attestation-relative-time" datetime="2026-10-23T20:22:17.000Z">Oct 23</relative-time> (Fri, 23 Oct 2026 20:22:17 GMT)</div>
          </li>
          <li class="listItem__X41oTe compact___mvP2J" aria-label="Commit. 0123abc.">
            <div class="container__mDVuhO compact__3vbapR" data-listview-item-title-container="true">
              <h3 class="heading__fzQskI compact__3vbapR"><span>Commit</span></h3>
            </div>
            <div class="container__VGL_Vt"><a data-testid="attestation-commit-link" href="/octo-org/hello-world/tree/0123abc">0123abc</a></div>
          </li>
          <li class="listItem__X41oTe compact___mvP2J" aria-label="Build Summary. /octo-org/hello-world/actions/runs/1/attempts/1.">
            <div class="container__mDVuhO compact__3vbapR" data-listview-item-title-container="true">
              <h3 class="heading__fzQskI compact__3vbapR"><span>Build Summary</span></h3>
            </div>
            <div class="container__VGL_Vt"><a data-testid="view-build-summary" href="https://github.com/octo-org/hello-world/actions/runs/1/attempts/1">/octo-org/hello-world/actions/runs/1/attempts/1</a></div>
          </li>
          <li class="listItem__X41oTe compact___mvP2J" aria-label="Workflow File. .github/workflows/build.yml@refs/heads/main.">
            <div class="container__mDVuhO compact__3vbapR" data-listview-item-title-container="true">
              <h3 class="heading__fzQskI compact__3vbapR"><span>Workflow File</span></h3>
            </div>
            <div class="container__VGL_Vt"><a data-testid="attestation-workflow-link" href="/octo-org/hello-world/actions/runs/1/workflow">.github/workflows/build.yml@refs/heads/main</a></div>
          </li>
        </ul>
      </div>`)
    const user = ['Settings', 'question', 'octocat.deb and 2 others']
    expect(ignoredTexts(host, user)).toEqual(user)
    const ui = ['Created', 'Commit', 'Build Summary', 'Workflow File', 'Attestation summary', 'by']
    expect(ignoredTexts(host, ui)).toEqual([])
    expect(ignored(find(host, 'li[aria-label^="Created."]'))).toBe(false)
  })

  it('个人主页列表：关注者简介、公司、所在地不翻译；赞助标签页的赞助时间照常翻译', () => {
    const host = mount(`
      <turbo-frame id="user-profile-frame">
        <div class="d-table table-fixed col-12 width-full tmp-py-4 border-bottom color-border-muted">
          <div class="d-table-cell col-3 col-sm-7 v-align-top tmp-pr-3">
            <a class="d-inline-block no-underline mb-1" data-hovercard-type="user" href="/octocat">
              <span class="f4 Link--primary">The Octocat</span>
              <span class="Link--secondary">octocat</span>
            </a>
            <div class="color-fg-muted text-small mb-2"><div>Sample bio</div></div>
            <p class="color-fg-muted text-small mb-0">
              <span class="tmp-mr-3"><svg class="octicon octicon-organization"></svg> Sample org</span>
              <svg class="octicon octicon-location"></svg> Sample location
            </p>
          </div>
          <div class="d-table-cell col-2 v-align-top text-right"><a class="btn btn-sm" href="/login">Follow</a></div>
        </div>
        <div class="d-table table-fixed col-12 width-full tmp-py-4 border-bottom color-border-muted">
          <div class="d-table-cell col-8 v-align-top tmp-pr-3">
            <a class="d-inline-block no-underline mb-1" data-hovercard-type="user" href="/monalisa">
              <span class="f4 Link--primary">Mona Lisa</span>
              <span class="Link--secondary pl-1">monalisa</span>
            </a>
            <span class="Label Label--secondary ml-2">Past sponsorship</span>
            <div><span class="color-fg-muted text-small">
              Sponsored on
              January 28, 2021
            </span></div>
          </div>
          <div class="d-table-cell col-2 v-align-top text-right">
            <a href="/sponsors/monalisa" aria-label="Sponsor @monalisa" class="Button--secondary Button--small Button">
              <span class="Button-label"><span class="v-align-middle">Sponsor</span></span>
            </a>
          </div>
        </div>
      </turbo-frame>`)
    const user = ['The Octocat', 'octocat', 'Sample bio', 'Sample org', 'Sample location', 'Mona Lisa', 'monalisa']
    expect(ignoredTexts(host, user)).toEqual(user)
    expect(ignoredTexts(host, ['Sponsored on January 28, 2021', 'Past sponsorship', 'Follow', 'Sponsor'])).toEqual([])
  })

  it('个人资料名片：所在地不翻译，本地时间照常翻译', () => {
    const host = mount(`
      <ul class="vcard-details">
        <li class="vcard-detail pt-1 hide-sm hide-md" itemprop="homeLocation" show_title="false" aria-label="Home location: Sample location">
          <svg class="octicon octicon-location"></svg>
          <span class="p-label">Sample location</span>
        </li>
        <li class="vcard-detail pt-1 hide-sm hide-md" itemprop="localTime" show_title="false">
          <svg class="octicon octicon-clock"></svg>
          <span class="p-label">
            13:26
            <profile-timezone class="color-fg-muted d-inline" data-hours-ahead-of-utc="9.0" data-timezone-offset="-480">- 1h ahead</profile-timezone>
          </span>
        </li>
      </ul>`)
    expect(ignoredTexts(host, ['Sample location'])).toEqual(['Sample location'])
    expect(ignoredTexts(host, ['13:26', '- 1h ahead'])).toEqual([])
    expect(ignored(find(host, 'li[itemprop="homeLocation"]'))).toBe(false)
  })
})

describe('镜像文字属性白名单', () => {
  it('合法且只命中界面组件', () => {
    expect(() => document.querySelector(MIRROR_SELECTOR)).not.toThrow()
    const host = mount(`
      <a class="prc-components-UnderlineItem-7fP-n"><span id="a" data-component="text" data-content="Issues">Issues</span></a>
      <nav><a class="UnderlineNav-item"><span id="b" data-content="Code">Code</span></a></nav>
      <div class="SegmentedControl-item"><span id="c" class="Button-label" data-content="Split">Split</span></div>
      <div id="d" class="prc-SegmentedControl-Text-7S2y2" data-text="Code">Code</div>
      <ul><li id="e" data-emoji-name="smile" data-text="smile">smile</li></ul>
      <div id="f" data-content='{"a":"Code"}'>Code</div>
      <span id="g" class="Button-label" data-content="Code">Code</span>`)
    const matches = (id: string): boolean => find(host, `#${id}`).matches(MIRROR_SELECTOR)
    expect(['a', 'b', 'c', 'd'].map(matches)).toEqual([true, true, true, true])
    expect(['e', 'f', 'g'].map(matches)).toEqual([false, false, false])
  })
})

describe('忽略区域里的占位文字', () => {
  it('占位区域选择器合法；预览窗格的 .markdown-body、经典评论框预览区都是忽略区域根，普通评论正文不是占位区域', () => {
    const host = mount(`
      <div aria-live="polite"><h2>Rendered Markdown Preview</h2><div id="pane" class="markdown-body"></div></div>
      <div class="previewViewerWrapper__ayPbFL"><div id="hashed" class="markdown-body"></div></div>
      <div class="js-previewable-comment-form"><div class="comment">
        <div id="classic" class="comment-body markdown-body js-preview-body"><p>Nothing to preview</p></div>
      </div></div>
      <div id="comment" class="comment-body markdown-body"><p dir="auto">Sample text</p></div>`)
    const matches = (id: string): boolean[] => {
      const element = find(host, `#${id}`)
      return [element.matches(PLACEHOLDER_SELECTOR), element.matches(CLASSIC_PREVIEW_SELECTOR), ignored(element)]
    }
    expect(matches('pane')).toEqual([true, false, true])
    expect(matches('hashed')).toEqual([true, false, true])
    expect(matches('classic')).toEqual([false, true, true])
    expect(matches('comment')).toEqual([false, false, true])
  })

  it('占位文字是规范化后的文字（引擎按规范化后的节点文字比较）', () => {
    for (const text of PLACEHOLDER_TEXTS) expect(normalizeText(text)).toBe(text)
  })
})

describe('忽略区域里的标签区域', () => {
  const labelSelector = LABEL_SELECTORS.join(', ')
  const nameSelector = LABEL_NAME_SELECTORS.join(', ')
  const descriptionSelector = LABEL_DESCRIPTION_SELECTORS.join(', ')

  it('合法、没有重复、都在全局忽略列表里（索引照常建）；名称区域、说明区域、星标列表名称区域与议题类型名称区域合起来就是标签区域', () => {
    for (const selector of LABEL_SELECTORS) {
      expect(() => document.querySelector(selector), selector).not.toThrow()
      expect(IGNORE_SELECTORS, selector).toContain(selector)
    }
    expect(new Set(LABEL_SELECTORS).size).toBe(LABEL_SELECTORS.length)
    expect(compileIgnoreIndex(LABEL_SELECTORS, document.createElement('div')).universal).toEqual([])
    expect([...LABEL_NAME_SELECTORS, ...LABEL_DESCRIPTION_SELECTORS, ...LIST_NAME_SELECTORS, ...ISSUE_TYPE_NAME_SELECTORS]).toEqual(
      LABEL_SELECTORS
    )
  })

  it('标签名与说明在标签区域里（名称、说明分别在名称区域、说明区域）；计数、评论提示、条目标题、行标题等不在', () => {
    const host = mount(`
      <ul data-listview-component="items-list">
        <li role="listitem" data-label-id="LA_1" aria-label="documentation. 20 open pull requests20 open pull requests.">
          <div class="container__mDVuhO sr-only" data-listview-item-title-container="true">
            <h4 class="heading__fzQskI"><span>bug</span></h4>
          </div>
          <div class="container__W45oI6 labelRowDescription__BiyOt7">
            <div class="default__oxxQZ0">
              <a aria-label="documentation" href="/vuejs/core/issues?q=label%3Adocumentation">
                <span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM">
                  <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">documentation</span></span>
                </span>
              </a>
            </div>
            <div class="default__oxxQZ0 labelRowDescriptionItemDescription__btj1EZ">Improvements or additions to documentation</div>
            <div class="default__oxxQZ0 labelRowIssuesAndPrsCount__zLwVeZ">
              <a class="countItem__vYhvTp" href="/vuejs/core/pulls?q=label%3Adocumentation">20<span>open pull requests</span></a>
            </div>
          </div>
        </li>
        <li>
          <div data-listview-item-title-container="true"><h3 class="heading__fzQskI"><a href="/vuejs/core/issues/1">Sample text</a></h3></div>
        </li>
      </ul>
      <a class="labelLink__AJlImc" href="/vuejs/core/issues?q=label%3Aquestion">
        <span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM">
          <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">question</span></span>
        </span>
        <span class="sr-only">Further information is requested</span>
      </a>
      <span class="labelDescriptionTooltip__3yeDxA" role="tooltip">Extra attention is needed</span>
      <a id="label-1" class="IssueLabel" href="/vuejs/core/labels/enhancement">enhancement</a>
      <tool-tip for="label-1" popover="manual" data-type="description" class="sr-only" role="tooltip">New feature or request</tool-tip>
      <tool-tip for="Comment-actions-1-text" popover="manual" data-type="label" class="sr-only">Comment options</tool-tip>
      <ul role="listbox"><li role="option"><span class="labelNameText__xVR7LL">wontfix</span></li></ul>
      <a class="user-mention" href="/octocat">octocat</a>`)
    /** 文字所在的最内层标签区域 */
    const regionOf = (text: string): Element | null => owner(host, text).closest(labelSelector)
    const names = ['documentation', 'question', 'enhancement', 'wontfix']
    const descriptions = [
      'Improvements or additions to documentation',
      'Further information is requested',
      'Extra attention is needed',
      'New feature or request'
    ]
    expect(names.filter(text => !regionOf(text)?.matches(nameSelector))).toEqual([])
    expect(descriptions.filter(text => !regionOf(text)?.matches(descriptionSelector))).toEqual([])
    expect(names.filter(text => regionOf(text)?.matches(descriptionSelector))).toEqual([])
    expect(descriptions.filter(text => regionOf(text)?.matches(nameSelector))).toEqual([])
    // 标签页行标题（屏幕阅读器读，React 读它的文字拼行的无障碍名称）只由列表条目标题的规则忽略
    expect(['bug', '20', 'open pull requests', 'Sample text', 'Comment options', 'octocat'].filter(text => regionOf(text))).toEqual([])
    // 标签区域、行标题都是忽略区域
    const labels = ['bug', ...names, ...descriptions]
    expect(ignoredTexts(host, labels)).toEqual(labels)
  })
})

describe('页面级忽略规则候选', () => {
  const pageIndex = compileIgnoreIndex(
    [...IGNORE_SELECTORS, ...PAGE_IGNORES.repository, ...PAGE_IGNORES.actions],
    document.createElement('div')
  )
  const pageIgnoredTexts = (host: Element, texts: readonly string[]): string[] =>
    texts.filter(text => owner(host, text).closest(pageIndex.selector) !== null)

  it('合法、可建索引、祖先条件不依赖会被翻译的属性', () => {
    const all = [...PAGE_IGNORES.repository, ...PAGE_IGNORES.actions]
    expect(pageIndex.invalid).toEqual([])
    expect(pageIndex.universal).toEqual([])
    for (const selector of all) {
      expect(selectorKeys(selector), selector).toBeDefined()
      expect(ancestorPart(selector), selector).not.toMatch(TRANSLATED_ATTRIBUTE_RE)
    }
  })

  it('仓库页头部：React 与 Rails 面包屑里的名称不翻译；切换仓库提示与导航标题照常', () => {
    const host = mount(`
      <header aria-label="Global navigation menu" class="GlobalNav styles-module__appHeader__YzYWk">
        <nav aria-label="Breadcrumbs" data-component="Breadcrumbs"><ol>
          <li><a class="styles-module__contextCrumb__IzGIq" data-component="Breadcrumbs.Item" href="/Home"><span>Home</span></a></li>
          <li><a class="styles-module__contextCrumb__IzGIq" data-component="Breadcrumbs.Item" href="/Home/Docs">Docs</a>
            <button data-component="IconButton" type="button" aria-labelledby="tip"></button>
            <span data-component="Tooltip" aria-hidden="true"><span id="tip">Switch repository<span class="sr-only">(alt shift r)</span></span></span>
          </li>
        </ol></nav>
        <h2 class="sr-only">Repository navigation</h2>
      </header>
      <context-region-controller class="AppHeader-context">
        <div class="AppHeader-context-compact">
          <button type="button" class="AppHeader-context-compact-trigger"><span class="Button-label">
            <span class="AppHeader-context-compact-lead"><span class="AppHeader-context-compact-parentItem">Security</span><span>&nbsp;/</span></span>
            <strong class="AppHeader-context-compact-mainItem"><span class="Truncate-text">Roadmap</span></strong>
          </span></button>
          <h1 class="Overlay-title">Navigate back to</h1>
          <a href="/Security"><span class="AppHeader-context-item-label Truncate-text">Archive</span></a>
        </div>
        <div class="AppHeader-context-full"><nav aria-label="Page context">
          <a class="AppHeader-context-item" href="/Security/Roadmap"><span class="AppHeader-context-item-label">Template</span></a>
        </nav></div>
      </context-region-controller>`)
    const user = ['Home', 'Docs', 'Security', 'Roadmap', 'Archive', 'Template']
    expect(pageIgnoredTexts(host, user)).toEqual(user)
    const ui = ['Switch repository', '(alt shift r)', 'Repository navigation', 'Navigate back to']
    expect(pageIgnoredTexts(host, ui)).toEqual([])
    expect(find(host, 'nav[aria-label="Breadcrumbs"]').closest(pageIndex.selector)).toBeNull()
  })

  it('Actions：窄屏页头的作业名、运行标题对话框的无障碍标题不翻译；分隔符与普通对话框标题照常', () => {
    const host = mount(`
      <h2 class="Truncate lh-default h3"><span class="Truncate-text"><div class="d-flex">
        <span class="css-truncate css-truncate-overflow workflow-path-first-item" data-target="streaming-graph-job.name">Deploy&nbsp;</span>
        <span>/</span>
        <span class="css-truncate css-truncate-overflow min-width-0">&nbsp;Docs</span>
      </div></span></h2>
      <h2 class="Truncate h3"><span class="Truncate-text">Summary</span></h2>
      <div class="Overlay-titleWrap">
        <h1 class="Overlay-title sr-only">Update</h1>
        <h2 class="d-flex"><span class="markdown-title">Update<span class="color-fg-muted"> #27404</span></span></h2>
      </div>
      <div class="Overlay-titleWrap"><h1 class="Overlay-title">Settings</h1></div>
      <button aria-label="Close" type="button" class="close-button Overlay-closeButton"></button>`)
    expect(pageIgnoredTexts(host, ['Deploy', 'Docs'])).toEqual(['Deploy', 'Docs'])
    expect(pageIgnoredTexts(host, ['/', 'Summary', 'Settings'])).toEqual([])
    expect(find(host, 'h1.sr-only').closest(pageIndex.selector)).not.toBeNull()
    expect(find(host, 'button[aria-label]').closest(pageIndex.selector)).toBeNull()
  })
})
