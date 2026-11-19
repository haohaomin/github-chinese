import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { translateTitleText } from '../../../src/core/title'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import mcp from '../../../src/locales/zh-CN/mcp'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = mcp

const matcher = createMatcher([['mcp', mcp]])
/** 完整语言包：DOM 级测试里 common 的词条（Install、Previous、Page N 等）也要生效 */
const bundleMatcher = createMatcher(zhCN)
const MCP: readonly PageKey[] = ['common', 'mcp']

function translate(text: string): string | undefined {
  return matcher.translate(text, MCP)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 详情页标签页标题：服务器名保持原文
  {
    hits: [
      ['MCP Registry | Sample Server', 'MCP 注册表 | Sample Server'],
      ['MCP Registry | GitHub', 'MCP 注册表 | GitHub']
    ],
    misses: ['MCP Registry |', 'Registry | Sample Server', 'MCP Registry · Sample Server']
  },
  // 搜索无结果
  {
    hits: [
      ['No MCPs found matching "zzqq". Try a different search term.', '未找到与“zzqq”匹配的 MCP。尝试其他搜索词。'],
      ['No MCPs found matching "sample text". Try a different search term.', '未找到与“sample text”匹配的 MCP。尝试其他搜索词。']
    ],
    misses: ['No MCPs found matching "". Try a different search term.', 'No MCPs found matching "zzqq".', 'Try a different search term.']
  },
  // 屏幕阅读器通知：可用服务器数（结果数「648 results」由 common-ui/counts.ts 覆盖，见下方「不重复收录」用例）
  {
    hits: [
      ['1 MCP available.', '1 个 MCP 可用。'],
      ['648 MCPs available.', '648 个 MCP 可用。']
    ],
    misses: ['MCPs available.', '648 MCPs available', '648 MCP servers available.']
  }
]

describe('mcp 正则词条', () => {
  it('每条正则都有测试用例，且锚定、不带 g / y 标志', () => {
    const rules = dict.regexp ?? []
    expect(rules).toHaveLength(REGEXP_CASES.length)
    for (const [pattern] of rules) {
      expect(pattern.source.startsWith('^')).toBe(true)
      expect(pattern.source.endsWith('$')).toBe(true)
      expect(pattern.global || pattern.sticky).toBe(false)
    }
  })

  it.each(REGEXP_CASES.flatMap(item => item.hits))('%s → %s', (source, expected) => {
    expect(translate(source)).toBe(expected)
  })

  it.each(REGEXP_CASES.flatMap(item => item.misses))('不命中：%s', source => {
    expect(translate(source)).toBeUndefined()
  })
})

describe('mcp 静态词条', () => {
  it.each([
    ['Connect models to the real world', '将模型连接到现实世界'],
    [
      'Servers and tools from the community that connect models to files, APIs, databases, and more.',
      '来自社区的服务器和工具，将模型连接到文件、API、数据库等。'
    ],
    ['Search MCP registry', '搜索 MCP 注册表'],
    ['Search MCPs', '搜索 MCP'],
    ['All MCP servers', '全部 MCP 服务器'],
    ['MCP registry pagination', 'MCP 注册表分页'],
    ['Install MCP server', '安装 MCP 服务器'],
    ['Install in VS Code', '在 VS Code 中安装'],
    ['Install in VS Code Insiders', '在 VS Code Insiders 中安装'],
    ['Install in GitHub Copilot app', '在 GitHub Copilot 应用中安装']
  ])('%s → %s', (source, expected) => {
    expect(dict.static?.[source]).toBe(expected)
    expect(translate(source)).toBe(expected)
  })

  it('By、标题第二段只在本页面生效（scoped）', () => {
    expect(dict.static?.['By']).toBeUndefined()
    expect(dict.scoped?.['By']).toBe('来自')
    expect(dict.scoped?.['Connect Agents to tools']).toBe('将智能体连接到工具')
    expect(matcher.translate('By', ['common'])).toBeUndefined()
    expect(translate('By')).toBe('来自')
  })

  it.each([
    'MCP Registry',
    'MCP registry',
    'Install',
    'Search results',
    'Previous',
    'Next Page',
    'Contact support',
    'Try a different search term',
    '648 results',
    '1 result'
  ])('common 已收录的词条不重复收录：%s', source => {
    expect(dict.static?.[source]).toBeUndefined()
    expect(dict.scoped?.[source]).toBeUndefined()
    // 只用本词典不命中（含正则），完整语言包命中
    expect(translate(source)).toBeUndefined()
    expect(bundleMatcher.translate(source, MCP)).toBeDefined()
  })
})

describe('mcp 标签页标题', () => {
  const translateInBundle = (text: string) => bundleMatcher.translate(text, MCP)

  it('目录页：两段都翻译', () => {
    expect(translateTitleText('MCP Registry · Connect Agents to tools', translateInBundle, '/mcp')).toBe('MCP 注册表 · 将智能体连接到工具')
  })

  it.each([
    ['MCP Registry | Sample Server', 'MCP 注册表 | Sample Server', '/mcp/octocat/sample-server'],
    // 服务器名与界面词同形也保持原文
    ['MCP Registry | Status', 'MCP 注册表 | Status', '/mcp/octocat/status'],
    ['MCP Registry | GitHub', 'MCP 注册表 | GitHub', '/mcp/octocat/sample-server']
  ])('详情页：%s → %s', (title, expected, pathname) => {
    expect(translateTitleText(title, translateInBundle, pathname)).toBe(expected)
  })
})

describe('mcp 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })
})

describe('mcp 页面 DOM', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function start(): void {
    translator = createTranslator({ matcher: bundleMatcher, host: window, resolvePages: () => MCP })
    translator.start()
  }

  function text(selector: string): string | undefined {
    return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim()
  }

  function attribute(selector: string, name: string): string | null | undefined {
    return document.querySelector(selector)?.getAttribute(name)
  }

  /** 页头面包屑（登录后）：首项「MCP Registry」是链接，服务器名是静态项 */
  function headerCrumbs(server?: string): string {
    const last = server
      ? `<li class="prc-Breadcrumbs-ItemWrapper-k0NLn"><span class="contextCrumb__Q8nET8 contextCrumbStatic__folAMo prc-Breadcrumbs-Item-jcraJ" data-component="Breadcrumbs.Item"><span class="contextCrumbLast__l2P28s">${server}</span></span></li>`
      : ''
    return `
      <header class="AppHeader GlobalNav">
        <nav class="contextRegion__Wb1-GR prc-Breadcrumbs-BreadcrumbsBase-3Gb-B" aria-label="Breadcrumbs" data-component="Breadcrumbs">
          <ol class="prc-Breadcrumbs-BreadcrumbsList-BKjpe">
            <li class="prc-Breadcrumbs-ItemWrapper-k0NLn"><a class="contextCrumb__Q8nET8 prc-Breadcrumbs-Item-jcraJ" href="/mcp" data-component="Breadcrumbs.Item"><span class="${server ? '' : 'contextCrumbLast__l2P28s'}">MCP Registry</span></a></li>
            ${last}
          </ol>
        </nav>
      </header>`
  }

  it('目录页：页头、搜索框、卡片、空状态、分页、屏幕阅读器通知', () => {
    // 结构来自 /mcp 快照；名称、描述换成占位内容
    document.body.innerHTML = `
      ${headerCrumbs()}
      <react-app app-name="mcp-registry" initial-path="/mcp"><div data-target="react-app.reactRoot">
        <header class="header__oZ3TFo">
          <img src="/logo.png" alt="MCP logo" width="86" height="76">
          <div class="content__1DTBDH">
            <h1 class="heading__7814cm prc-Heading-Heading-MtWFE" data-component="Heading">Connect models to the real world</h1>
            <p class="subheading__2S9LD_">Servers and tools from the community that connect models to files, APIs, databases, and more.</p>
          </div>
          <div id="mcp-registry-search-filter" role="form" aria-label="Search MCP registry" class="FormControl FormControl--fullWidth input__n6rcL7 Box_1__QYTtv7">
            <label id="mcp-registry-search-filter-label" for="mcp-registry-search-filter-input" class="FormControl-label sr-only">Search MCP registry</label>
            <div class="styled-input-container Box_0__HkKqOF"><div aria-hidden="true" class="styled-input-content Box_1__kjXarr"></div>
              <input id="mcp-registry-search-filter-input" role="combobox" aria-expanded="false" placeholder="Search MCPs" class="Box_4__0ZM1Bz" value="">
            </div>
            <button data-component="IconButton" type="button" class="prc-Button-ButtonBase-9n-Xk prc-Button-IconButton-fyge7" aria-labelledby="search-tip"></button>
            <span class="prc-TooltipV2-Tooltip-tLeuB" data-component="Tooltip" aria-hidden="true" id="search-tip" popover="auto">Search</span>
            <ul class="prc-ActionList-ActionList-rPFF2 ActionList_0__Ssg8Xf" role="listbox" data-component="ActionList" aria-label="Suggestions" id="mcp-registry-search-filter-results"></ul>
          </div>
        </header>
        <div class="container__SV6DtN"><div>
          <div class="d-flex flex-items-center tmp-mb-4">
            <h2 class="f3 mr-2 prc-Heading-Heading-MtWFE" data-component="Heading">All MCP servers</h2>
            <span class="Counter">648</span>
          </div>
          <section class="grid__ts-CrO">
            <div class="card__EKInQM">
              <div class="body__EvKpkW">
                <div class="header__A3YOFH">
                  <div class="heading__r-l09w">
                    <div class="logoContainer__ukUCtN"><img src="/avatar.png" alt="Status logo" class="logo__XrMsYg"></div>
                    <a class="link__jGBs0K prc-Link-Link-9ZwDx" data-component="Link" href="/mcp/octocat/status">Status</a>
                  </div>
                  <div class="isolate__gRAmIf">
                    <button data-component="ActionMenu.Button" type="button" aria-haspopup="true" aria-expanded="false" class="prc-Button-ButtonBase-9n-Xk" data-size="small" data-variant="default">
                      <span data-component="buttonContent" class="prc-Button-ButtonContent-Iohp5"><span data-component="text" class="prc-Button-Label-FWkx3">Install</span></span>
                    </button>
                  </div>
                </div>
                <p class="description__ksUAc_">Sample text about this server.</p>
              </div>
              <footer class="footer__Iw8UiV">
                <p class="footerOwner__Kl2T7K">By <span>octocat</span></p>
                <div class="footerStats__I-8Mov"><span>1,234</span></div>
              </footer>
            </div>
          </section>
          <p id="empty" class="color-fg-muted mb-0">No MCPs found matching "<!-- -->zzqq<!-- -->". Try a different search term.</p>
        </div>
        <div class="pagination__CPT450">
          <nav class="prc-Pagination-PaginationContainer-HEhGo" aria-label="MCP registry pagination" data-component="Pagination"><div class="prc-Pagination-TablePaginationSteps-cAXs3">
            <a class="prc-Pagination-Page-Etgqf" data-component="Pagination.PreviousPage" rel="prev" aria-hidden="true" aria-disabled="true">Previous</a>
            <a class="prc-Pagination-Page-Etgqf" data-component="Pagination.Page" href="#1" aria-label="Page 1" aria-current="page">1</a>
            <a class="prc-Pagination-Page-Etgqf" data-component="Pagination.Page" href="#7" aria-label="Page 7...">7</a>
            <a class="prc-Pagination-Page-Etgqf" data-component="Pagination.NextPage" rel="next" href="#2" aria-label="Next Page">Next</a>
          </div></nav>
        </div>
      </div></div></react-app>
      <div id="js-global-screen-reader-notice" class="sr-only mt-n1" aria-live="polite" aria-atomic="true">648 MCPs available.</div>`
    start()

    // 页头面包屑只有一项时照常翻译
    expect(text('header.GlobalNav [data-component="Breadcrumbs.Item"]')).toBe('MCP 注册表')
    // 页头与搜索框：文字、aria-label、placeholder、提示
    expect(text('h1')).toBe('将模型连接到现实世界')
    expect(text('.subheading__2S9LD_')).toBe('来自社区的服务器和工具，将模型连接到文件、API、数据库等。')
    expect(attribute('#mcp-registry-search-filter', 'aria-label')).toBe('搜索 MCP 注册表')
    expect(text('label.sr-only')).toBe('搜索 MCP 注册表')
    expect(attribute('#mcp-registry-search-filter-input', 'placeholder')).toBe('搜索 MCP')
    expect(text('#search-tip')).toBe('搜索')
    expect(attribute('ul[role="listbox"]', 'aria-label')).toBe('建议')
    expect(text('h2')).toBe('全部 MCP 服务器')
    // 卡片：名称（与界面词 Status 同形）、描述、所有者保持原文；By、Install 照常翻译；徽标 alt 不处理
    expect(text('.card__EKInQM a[href^="/mcp/"]')).toBe('Status')
    expect(text('.description__ksUAc_')).toBe('Sample text about this server.')
    expect(text('.footerOwner__Kl2T7K')).toBe('来自 octocat')
    expect(text('.footerOwner__Kl2T7K > span')).toBe('octocat')
    expect(text('[data-component="ActionMenu.Button"]')).toBe('安装')
    expect(attribute('.logo__XrMsYg', 'alt')).toBe('Status logo')
    // 空状态：查询词是相邻文本节点，整组匹配
    expect(text('#empty')).toBe('未找到与“zzqq”匹配的 MCP。尝试其他搜索词。')
    // 分页
    expect(attribute('[data-component="Pagination"]', 'aria-label')).toBe('MCP 注册表分页')
    expect(text('[data-component="Pagination.PreviousPage"]')).toBe('上一页')
    expect(attribute('a[href="#1"]', 'aria-label')).toBe('第 1 页')
    expect(attribute('a[href="#7"]', 'aria-label')).toBe('第 7 页...')
    expect(attribute('[data-component="Pagination.NextPage"]', 'aria-label')).toBe('下一页')
    expect(text('[data-component="Pagination.NextPage"]')).toBe('下一页')
    // 屏幕阅读器通知
    expect(text('#js-global-screen-reader-notice')).toBe('648 个 MCP 可用。')
  })

  it('详情页：面包屑、关于块、README、侧栏资源、安装按钮与菜单', () => {
    // 结构来自 /mcp/<所有者>/<服务器> 快照（登录后面包屑在页头，未登录时在详情页顶部，两种都放）；名称换成占位内容
    document.body.innerHTML = `
      ${headerCrumbs('Status')}
      <react-app app-name="mcp-registry" initial-path="/mcp/octocat/status"><div data-target="react-app.reactRoot">
        <div class="container__dToO1w tmp-pt-5">
          <nav class="prc-Breadcrumbs-BreadcrumbsBase-3Gb-B" aria-label="Breadcrumbs" data-component="Breadcrumbs">
            <ol class="prc-Breadcrumbs-BreadcrumbsList-BKjpe">
              <li class="prc-Breadcrumbs-ItemWrapper-k0NLn"><a class="fgColor-muted text-underline prc-Breadcrumbs-Item-jcraJ" href="/mcp" data-component="Breadcrumbs.Item">MCP registry</a></li>
              <li class="prc-Breadcrumbs-ItemWrapper-k0NLn"><a class="prc-Breadcrumbs-Item-jcraJ" href="#" aria-current="page" data-component="Breadcrumbs.Item">Status</a></li>
            </ol>
          </nav>
          <div class="hideOnDesktop__gkVksq">
            <div class="about__C7UdQJ">
              <div class="logoContainer__41iGuD"><img src="/avatar.png" alt="Status logo" class="logo__RlGYK2"></div>
              <p class="heading__yayGZD">Status</p>
              <p class="subheading__wr3QO3"><span>By<!-- --> <a class="ownerLink__dRzWQ4 prc-Link-Link-9ZwDx" href="https://github.com/octocat" data-component="Link" data-inline="true">octocat</a></span><span>·</span><span class="group___QOBwn">1,234</span></p>
              <p class="description__X6V85Z">Sample text about this server.</p>
              <button id="install" class="prc-Button-ButtonBase-9n-Xk" data-component="ActionMenu.Button" type="button" aria-haspopup="true" aria-expanded="false">
                <span class="prc-Button-ButtonContent-Iohp5" data-component="buttonContent"><span class="prc-Button-Label-FWkx3" data-component="text">Install MCP server</span></span>
              </button>
            </div>
          </div>
          <div class="content__U_HvDl">
            <div class="js-snippet-clipboard-copy-unpositioned">
              <div class="markdown-body color-fg-muted"><p>No README available</p></div>
            </div>
            <aside class="sidebar__ddo0A5">
              <div class="onlyDesktop__pSodNn"><h2 class="sr-only">About</h2></div>
              <div class="sidebarStack__AnZPKl">
                <h2 class="h5">Resources</h2>
                <ul class="resourceLinks__ZQMNBv">
                  <li><a class="resourceLink__d8egy4 prc-Link-Link-9ZwDx" href="/octocat/status" data-component="Link">octocat / status</a></li>
                  <li><a class="resourceLink__d8egy4 prc-Link-Link-9ZwDx" href="https://support.github.com/" data-component="Link">Contact support</a></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div></div></react-app>
      <ul role="menu" class="prc-ActionList-ActionList-rPFF2" aria-labelledby="install">
        <li role="menuitem" class="prc-ActionList-ActionListItem-uq6I7"><span class="prc-ActionList-ItemLabel-TmBhn">Install in VS Code</span></li>
        <li role="menuitem" class="prc-ActionList-ActionListItem-uq6I7"><span class="prc-ActionList-ItemLabel-TmBhn">Install in VS Code Insiders</span></li>
        <li role="menuitem" class="prc-ActionList-ActionListItem-uq6I7"><span class="prc-ActionList-ItemLabel-TmBhn">Install in GitHub Copilot app</span></li>
      </ul>`
    start()

    const crumbs = (scope: string) =>
      [...document.querySelectorAll(`${scope} [data-component="Breadcrumbs.Item"]`)].map(item => item.textContent?.trim())
    // 面包屑：首项翻译，服务器名（与界面词 Status 同形）保持原文
    expect(crumbs('header.GlobalNav')).toEqual(['MCP 注册表', 'Status'])
    expect(crumbs('react-app')).toEqual(['MCP 注册表', 'Status'])
    // 关于块：名称、所有者、描述保持原文；By（SSR 结构 By<!-- --> <a>，有意义段只有一段，逐段翻译）、安装按钮翻译；徽标 alt 不处理
    expect(text('.heading__yayGZD')).toBe('Status')
    expect(text('.subheading__wr3QO3 > span')).toBe('来自 octocat')
    expect(text('.ownerLink__dRzWQ4')).toBe('octocat')
    expect(text('.description__X6V85Z')).toBe('Sample text about this server.')
    expect(text('#install')).toBe('安装 MCP 服务器')
    expect(attribute('.logo__RlGYK2', 'alt')).toBe('Status logo')
    // README 区域由全局规则忽略（无 README 时的提示也在其中）
    expect(text('.markdown-body')).toBe('No README available')
    // 侧栏：标题与支持链接翻译，存储库链接保持原文
    expect(text('h2.sr-only')).toBe('关于')
    expect(text('h2.h5')).toBe('资源')
    expect(text('a[href="/octocat/status"]')).toBe('octocat / status')
    expect(text('a[href="https://support.github.com/"]')).toBe('联系支持')
    // 安装菜单
    expect([...document.querySelectorAll('[role="menuitem"]')].map(item => item.textContent?.trim())).toEqual([
      '在 VS Code 中安装',
      '在 VS Code Insiders 中安装',
      '在 GitHub Copilot 应用中安装'
    ])
  })
})
