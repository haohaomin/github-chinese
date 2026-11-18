import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { compileIgnoreIndex, elementMatches } from '../../../src/core/selectors'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import search from '../../../src/locales/zh-CN/search'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = search

const matcher = createMatcher([['search', search]])
/** 含通用词典，与实际页面一致：排序菜单的通用项、结果计数、分页、状态标签由 common / common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['search', search]
])

/** 页面上实际生效的忽略选择器：全局规则 + 本页规则 */
const PAGE_IGNORE = [...IGNORE_SELECTORS, ...(search.ignore ?? [])]

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'search'])
}

function translateFull(text: string): string | undefined {
  return fullMatcher.translate(text, ['common', 'search'])
}

/** 等待变动回调处理完 */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列（results → tips），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 结果页 sr-only 标题
  {
    hits: [
      ['repositories Search Results · vue', '存储库搜索结果 · vue'],
      ['pullrequests Search Results · is:open label:bug', '拉取请求搜索结果 · is:open label:bug'],
      ['wikis Search Results · readme', 'Wiki 搜索结果 · readme']
    ],
    misses: ['projects Search Results · vue']
  },
  // 类型为空、没有前缀的结果页标题
  {
    hits: [
      ['Search Results · vue is:public', '搜索结果 · vue is:public'],
      ['Search Results · org:octo-org language:TypeScript', '搜索结果 · org:octo-org language:TypeScript']
    ],
    misses: ['Search Results', 'Search Results vue', 'My Search Results · vue']
  },
  // 结果数
  {
    hits: [
      ['1.1M results', '1.1M 个结果'],
      ['1 result', '1 个结果'],
      ['12,345 results', '12,345 个结果'],
      ['1.2k files', '1.2k 个文件']
    ],
    misses: ['many results']
  },
  {
    hits: [
      ['More than 1M results', '超过 1M 个结果'],
      ['More than 100 files', '超过 100 个文件']
    ],
    misses: ['More than a few results']
  },
  // 耗时（数字与单位之间加空格）
  {
    hits: [
      ['(178ms)', '（178 毫秒）'],
      ['(2s)', '（2 秒）'],
      ['(1.5 s)', '（1.5 秒）']
    ],
    misses: ['(178 msec)', '(fast)']
  },
  // 排序按钮
  {
    hits: [
      ['Sort by: Best match', '排序依据：最佳匹配'],
      ['Sort by: Most stars', '排序依据：星标最多'],
      ['Sort by: Least recently committed', '排序依据：最早提交']
    ],
    misses: ['Sort by: Relevance']
  },
  // 浏览器语言为中文时的本地格式日期（数字与年月日之间有无空格都匹配，输出带空格）
  {
    hits: [
      ['on 1月23日', '1月23日'],
      ['on 2017年4月7日', '2017年4月7日'],
      ['on 1月23日', '1月23日'],
      ['on 2017年4月7日', '2017年4月7日'],
      ['on 12月1日', '12月1日']
    ],
    misses: ['on Jan 23', 'on 1月23', 'on 2017年4月', 'on 1 月 23', 'on 2017年4月']
  },
  // 存储库结果
  {
    hits: [
      ['3 issues need help', '3 个议题需要帮助'],
      ['1 issue needs help', '1 个议题需要帮助']
    ],
    misses: ['issues need help']
  },
  {
    hits: [
      ['Sponsor octo-org/hello-world', '赞助 octo-org/hello-world'],
      ['Sponsor @monalisa', '赞助 @monalisa']
    ],
    misses: ['Sponsor this project']
  },
  // 提交结果（检查计数用“个”，状态词与句式同 commits 的检查摘要；原文没有逗号时不加标点）
  {
    hits: [
      ['20 successful, 1 skipped, and 1 failing checks', '20 个检查成功、1 个已跳过、1 个失败'],
      ['3 successful and 1 failing checks', '3 个检查成功和 1 个失败'],
      ['2 in progress, 1 queued checks', '2 个检查正在进行、1 个已排队'],
      ['1 pending, 1 expected and 1 timed out checks', '1 个检查挂起、1 个等待报告、1 个已超时'],
      ['1 successful check', '1 个检查成功']
    ],
    misses: ['all checks passed', '20 successful checks passed']
  },
  {
    hits: [['Copy full commit hash 06838a0', '复制完整提交哈希 06838a0']],
    misses: ['Copy full commit hash main']
  },
  // 提交签名对话框的 sr-only 标题
  {
    hits: [
      ['verified: 06838a0', '已验证：06838a0'],
      ['partially verified: 06838a06833d0264a78a7928f81a980a88b36230', '部分验证：06838a06833d0264a78a7928f81a980a88b36230'],
      ['unverified: ecde65d', '未验证：ecde65d']
    ],
    misses: ['verified: main', 'Verified: 06838a0']
  },
  // 包结果
  {
    hits: [
      ['npm type', 'npm 类型'],
      ['container type', '容器类型']
    ],
    misses: ['pypi type']
  },
  // 代码结果
  {
    hits: [
      ['Show 3 more matches', '再显示 3 处匹配'],
      ['Show 1 more match', '再显示 1 处匹配']
    ],
    misses: ['Show more matches']
  },
  {
    hits: [
      ['This file contains 12 more matches not shown.', '此文件另有 12 处匹配未显示。'],
      ['This file contains 1 more match not shown.', '此文件另有 1 处匹配未显示。']
    ],
    misses: ['This file contains more matches not shown.']
  },
  {
    hits: [['See all 15 matches in the full file', '查看完整文件中的全部 15 处匹配']],
    misses: ['See all matches in the full file']
  },
  // 搜索首页页脚
  { hits: [['GitHub, Inc. © 2026', 'GitHub, Inc. © 2026']], misses: ['GitHub, Inc. © 26'] },

  // 空结果
  {
    hits: [
      ['Your search did not match any repositories', '没有与搜索匹配的存储库'],
      ['Your search did not match any pull requests', '没有与搜索匹配的拉取请求'],
      ['Your search did not match any wikis', '没有与搜索匹配的 Wiki'],
      // 产品名译中文：Marketplace → 市场
      ['Your search did not match any marketplace', '没有与搜索匹配的市场应用']
    ],
    misses: ['Your search did not match any projects']
  },
  {
    hits: [
      [
        'However we found 3 repositories that matched your search query. Alternatively try one of the tips below.',
        '不过找到了 3 个与搜索查询匹配的存储库。也可尝试以下提示。'
      ],
      [
        'However we found 1.2k code results that matched your search query. Alternatively try one of the tips below.',
        '不过找到了 1.2k 个与搜索查询匹配的代码结果。也可尝试以下提示。'
      ],
      [
        'However we found 1 wiki that matched your search query. Alternatively try one of the tips below.',
        '不过找到了 1 个与搜索查询匹配的 Wiki。也可尝试以下提示。'
      ]
    ],
    misses: ['However we found some repositories that matched your search query. Alternatively try one of the tips below.']
  },
  // 句中类型为链接时单独出现的「数量 + 类型」（存储库、问题等的计数由 common 收录）
  {
    hits: [
      ['3 code results', '3 个代码结果'],
      ['1 code result', '1 个代码结果'],
      ['12 users', '12 个用户'],
      ['1 wiki', '1 个 Wiki'],
      ['1.2k topics', '1.2k 个主题']
    ],
    misses: ['some code results', '3 repositories', 'code results 3']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('search 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = search.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    // 耗时：「\u00a0(」「210」「 」「ms」「)」
    expect(translate(normalizeText(['\u00a0(', '210', ' ', 'ms', ')'].join('')))).toBe('（210 毫秒）')
    expect(translate(normalizeText(['Sort by: ', 'Best match'].join('')))).toBe('排序依据：最佳匹配')
    expect(translate(normalizeText(['Your search did not match any ', 'repositories'].join('')))).toBe('没有与搜索匹配的存储库')
    expect(translate(normalizeText(['GitHub, Inc. © ', '2026'].join('')))).toBe('GitHub, Inc. © 2026')
    expect(
      translate(
        normalizeText(
          ['However we found ', '3', ' ', 'repositories', ' that matched your search query. Alternatively try one of the tips below.'].join(
            ''
          )
        )
      )
    ).toBe('不过找到了 3 个与搜索查询匹配的存储库。也可尝试以下提示。')
    // 句中类型为链接：链接内的「3」「 」「code results」拼接
    expect(translate(normalizeText(['3', ' ', 'code results'].join('')))).toBe('3 个代码结果')
  })

  it('拆开的片段单独命中', () => {
    expect(translate('Your search did not match any')).toBe('没有与搜索匹配的')
    expect(translate('However we found')).toBe('不过找到了')
    expect(translate('code results')).toBe('个代码结果')
    expect(translate('that matched your search query. Alternatively try one of the tips below.')).toBe('与搜索查询匹配。也可尝试以下提示。')
    // 排序按钮与结果数的片段由 common-ui 收录
    expect(translateFull('Sort by:')).toBe('排序依据：')
    expect(translateFull('results')).toBe('个结果')
  })

  it('类型词不单独收录（空结果标题整句拼接后命中），路径、代码中的同名单词不被误译', () => {
    for (const word of ['code', 'issues', 'pull requests', 'packages', 'users', 'commits', 'topics', 'marketplace']) {
      expect(translateFull(word)).toBeUndefined()
    }
  })

  it('计数、分页由 common-ui 收录，本页不重复', () => {
    const cases: readonly (readonly [string, string])[] = [
      ['Page 2', '第 2 页'],
      ['Page 7…', '第 7 页…'],
      ['212632 stars', '212632 个星标'],
      ['124 repositories', '124 个存储库'],
      ['20782 followers', '20782 个关注者'],
      ['25 comments', '25 条评论'],
      ['0 downloads', '0 次下载']
    ]
    for (const [input, expected] of cases) {
      expect(translate(input)).toBeUndefined()
      expect(translateFull(input)).toBe(expected)
    }
  })
})

describe('search 静态词条', () => {
  it.each([
    ['Repository search results', '存储库搜索结果'],
    // 产品名译中文：Marketplace → 市场、GitHub Issues → GitHub 问题、GitHub Packages → GitHub 包
    ['Marketplace search results', '市场搜索结果'],
    ['Learn more about GitHub Issues', '了解 GitHub 议题'],
    ['Learn more about GitHub Packages', '了解 GitHub 软件包'],
    ['Advanced search', '高级搜索'],
    // 省略号随原文
    ['More languages...', '更多语言...'],
    ['More languages…', '更多语言…'],
    ['More repositories...', '更多存储库...'],
    ['Has linked pull request', '有链接的拉取请求'],
    // 按钮的无障碍名称：Open 为动词，加“已”避免读成“打开链接”的问题
    ['Open linked issues', '打开已链接的议题'],
    ['Involved user', '涉及的用户'],
    ['Involves user', '涉及的用户'],
    ['Number of interactions', '交互数'],
    ['Parent hash', '父提交哈希'],
    ['Exclude archived', '排除已存档'],
    ['Copy full commit hash', '复制完整提交哈希'],
    ['Sign in to search code on GitHub', '登录 GitHub 以搜索代码'],
    // 原文没有逗号，改语序，不加逗号
    ['Before you can access our code search functionality please sign in or sign up.', '请先登录或注册再使用代码搜索。'],
    [
      'Before you can access our code search functionality please sign in or create a free account.',
      '请先登录或创建免费帐户再使用代码搜索。'
    ],
    // 原文用逗号带出插入语，译文同样用逗号，不改成括号
    [
      'The path qualifier can search the entire file path, not just the extension, and supports regular expressions. For more information, see our',
      'path 限定符可搜索完整文件路径，不只是扩展名，还支持正则表达式。详细信息请参阅'
    ],
    [
      'GitHub Packages is a platform for hosting and managing packages, including containers and other dependencies. Get started with publishing or installing packages yourself.',
      'GitHub 软件包是托管和管理软件包的平台，包括容器和其他依赖项。立即开始发布或安装软件包。'
    ],
    ['Restrict your search to the title by using the in:title qualifier.', '使用 in:title 限定符可只搜索标题。'],
    ["Why wasn't my code found?", '为什么找不到我的代码？'],
    ['Why wasn’t my code found?', '为什么找不到我的代码？'],
    ['Empty files and files over 350 kiB are excluded', '排除空文件和超过 350 kiB 的文件'],
    // 原文没有冒号：Note that … 不译出“注意：”
    [
      'Note that we don’t currently support regular expressions in the repo or org qualifiers. For more information on search syntax, see our',
      'repo 和 org 限定符目前不支持正则表达式。有关搜索语法的详细信息，请参阅'
    ],
    [
      "Note that you'll have to escape any slashes in the regex. For more information, see our",
      '正则表达式中的斜杠需要转义。详细信息请参阅'
    ],
    ['Advanced options', '高级选项'],
    ['With this many stars', '星标数为'],
    // 可见性 public → 公共
    ['With this many public repositories', '公共存储库数为'],
    ['Return repositories', '返回存储库'],
    ['including forks.', '复刻。'],
    ['Wiki options', 'Wiki 选项'],
    ['Curated topics', '人工整理的主题'],
    // 赞助对话框的 sr-only 片段「Learn more」+「about Sponsors」：Sponsors 指 GitHub Sponsors，译“赞助”
    ['about Sponsors', '赞助相关信息'],
    ['Possible unrecognized qualifier, searching for this term literally', '可能是无法识别的限定符，将按字面搜索该词'],
    // 片段译文不带原文没有的标点
    ['matches in the full file', '处完整文件中的匹配'],
    ['Repository size in KB', '以 KB 为单位的存储库大小']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })
})

describe('search 页面词条', () => {
  it.each([
    ['Best match', '最佳匹配'],
    ['Most stars', '星标最多'],
    ['Filter by', '筛选条件'],
    // 窄屏类型选择前的名词标签，同 discussions、marketplace
    ['Filter:', '筛选器：'],
    ['not', '不含'],
    ['only', '仅限'],
    // 签名弹层中句末带句号的版本（其余由 commits 的 static 收录）
    ['Learn about vigilant mode.', '了解警戒模式。'],
    // Marketplace 结果的类别标签沿用 marketplace 词典译名
    ['Utilities', '实用工具'],
    ['Code quality', '代码质量'],
    ['IDEs', 'IDE'],
    // Marketplace 结果的类型标签；产品名译中文：GitHub Action → GitHub 操作
    ['Application', '应用'],
    ['GitHub Action', 'GitHub 操作'],
    // 搜索首页提示片段
    ['For an', '如需'],
    ['advanced search', '高级搜索'],
    [', use our', '，可使用'],
    ['prefixes', '前缀']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it.each([
    ['Recently updated', '最近更新'],
    ['Sort by:', '排序依据：'],
    ['Language', '语言'],
    ['Updated', '更新于'],
    ['Verified', '已验证'],
    ['ProTip!', '提示！'],
    ['More', '更多'],
    ['Save', '保存'],
    ['See all', '查看全部'],
    ['Archived', '已存档'],
    ['Merged', '已合并'],
    ['Popular', '热门'],
    ['not planned', '未计划'],
    // 全站标签页标题的标语段
    ['Where software is built', '构建软件的地方']
  ])('通用词 %s 由 common 收录，本页不重复', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translateFull(input)).toBe(expected)
  })

  it('不再收录用户内容与未出现的词条', () => {
    // 包结果的版本标签（如 latest）是用户内容
    expect(translate('latest')).toBeUndefined()
    // 高级搜索页没有该字段
    expect(dict.static?.['Of this file size']).toBeUndefined()
  })

  it('类型词 projects、users 单独出现时不翻译（common 的旧版命令面板帮助项按整句收录）', () => {
    for (const word of ['projects', 'users']) expect(translateFull(word)).toBeUndefined()
  })

  it('市场类别不重复 common 已收录或与原文相同的词条', () => {
    // Security、Support 与 common 的全站译文相同，不进 scoped
    expect(dict.scoped?.['Security']).toBeUndefined()
    expect(dict.scoped?.['Support']).toBeUndefined()
    // 产品名译中文：类别 GitHub Sponsors → GitHub 赞助。common 收录同一译文时不重复；未收录时由本页 scoped 翻译
    expect(dict.scoped?.['GitHub Sponsors']).not.toBe(common.static?.['GitHub Sponsors'])
    expect(translateFull('GitHub Sponsors')).toBe('GitHub 赞助')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Best match', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('3 code results', ['common', 'code'])).toBeUndefined()
    expect(matcher.translate('on 1月23日', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('verified: 06838a0', ['common', 'commits'])).toBeUndefined()
    // 搜索首页提示的片段只在本页成立
    expect(matcher.translate('For an', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('prefixes', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate(', use our', ['common', 'repository'])).toBeUndefined()
  })
})

describe('search 结果页 ProTip（快捷键是 span.hx_kbd，不是 <kbd>）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('按片段翻译，快捷键保留，不记未翻译', () => {
    // 结构同实际页面：<span>Press the <span class="… hx_kbd">/</span> key to activate …</span>
    document.body.innerHTML = `<div id="tip"><span><span class="proTipText__GNqUcg">ProTip!</span>&nbsp;</span><span>Press the <span class="kbdWrapper__gBC8b4 hx_kbd">/</span> key to activate the search input again and adjust your query.</span></div>`
    const tip = document.getElementById('tip')!
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => ['common', 'search'],
      collectUntranslated: true
    })
    translator.start()
    // 「提示！」后页面自带的 &nbsp; 文本节点紧跟全角标点，引擎置空
    expect(tip.textContent).toBe('提示！按 / 键可再次激活搜索框并调整查询。')
    expect(tip.querySelector('.hx_kbd')?.textContent).toBe('/')
    expect(translator.drainUntranslated()).toEqual([])
  })
})

describe('search 结果中的语言名（忽略区域根元素按属性规则改写）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('语言名不译，aria-label 改写为「<语言名> 语言」，停止后还原', () => {
    // 结构同实际页面（存储库结果的页脚）；Reason 与通用词条同名，不应译成“原因”
    document.body.innerHTML = `
      <div data-testid="results-list" class="List__XCUflO">
        <div class="Result__Of4h7n"><div class="resultRow__BjR5Xh"><div class="resultContent__clhnjI">
          <ul class="footer__evnOBN">
            <li class="footerItem__UC05DZ"><span class="languageCircleWrapper__VOT6Am"><div class="languageCircle__eF82_7" style="background-color:#41b883"></div></span><span id="vue" aria-label="Vue language">Vue</span></li>
            <span aria-hidden="true" class="spacer__oqbDuD">·</span>
            <li class="footerItem__UC05DZ"><a id="stars" class="stargazersLink__uyIXyf" href="/octo-org/hello-world/stargazers" aria-label="212632 stars"><span>213k</span></a></li>
          </ul>
        </div></div></div>
        <div class="Result__Of4h7n"><div class="resultRow__BjR5Xh"><div class="resultContent__clhnjI">
          <ul class="footer__evnOBN">
            <li class="footerItem__UC05DZ"><span class="languageCircleWrapper__VOT6Am"><div class="languageCircle__eF82_7" style="background-color:#ff5847"></div></span><span id="reason" aria-label="Reason language">Reason</span></li>
          </ul>
        </div></div></div>
      </div>`
    const vue = document.getElementById('vue')!
    const reason = document.getElementById('reason')!
    expect(translateFull('Reason')).toBe('原因')
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => ['common', 'search'],
      collectUntranslated: true
    })
    translator.start()
    expect(vue.textContent).toBe('Vue')
    expect(vue.getAttribute('aria-label')).toBe('Vue 语言')
    expect(reason.textContent).toBe('Reason')
    expect(reason.getAttribute('aria-label')).toBe('Reason 语言')
    // 忽略区域外的属性照常查词典
    expect(document.getElementById('stars')?.getAttribute('aria-label')).toBe('212632 个星标')
    const untranslated = translator.drainUntranslated().map(([text]) => text)
    for (const text of ['Vue', 'Reason', 'Vue language', 'Reason language']) expect(untranslated).not.toContain(text)
    translator.stop()
    translator = undefined
    expect(vue.getAttribute('aria-label')).toBe('Vue language')
    expect(reason.getAttribute('aria-label')).toBe('Reason language')
  })

  it('aria-label 改写后重新渲染语言名，仍不翻译', async () => {
    // 忽略选择器若依赖 aria-label 的取值（如 span[aria-label$=" language"]），改写后不再命中，重新渲染的 Reason 会被译成“原因”
    document.body.innerHTML = `<div data-testid="results-list" class="List__XCUflO"><ul class="footer__evnOBN"><li class="footerItem__UC05DZ"><span class="languageCircleWrapper__VOT6Am"><div class="languageCircle__eF82_7" style="background-color:#ff5847"></div></span><span id="reason" aria-label="Reason language">Reason</span></li></ul></div>`
    const reason = document.getElementById('reason')!
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'search'] })
    translator.start()
    expect(reason.getAttribute('aria-label')).toBe('Reason 语言')
    reason.replaceChildren(document.createTextNode('Reason'))
    await settle()
    expect(reason.textContent).toBe('Reason')
    expect(reason.getAttribute('aria-label')).toBe('Reason 语言')
  })

  it('只在 search 页面类型生效', () => {
    document.body.innerHTML = `<ul data-testid="results-list"><li class="footerItem__UC05DZ"><span class="languageCircleWrapper__VOT6Am"></span><span id="vue" aria-label="Vue language">Vue</span></li></ul>`
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'repository'] })
    translator.start()
    expect(document.getElementById('vue')?.getAttribute('aria-label')).toBe('Vue language')
  })
})

describe('search 忽略选择器', () => {
  it.each(search.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('引擎能为全部选择器建立索引', () => {
    const index = compileIgnoreIndex(search.ignore ?? [], document.createElement('div'))
    expect(index.invalid).toEqual([])
    expect(index.universal).toEqual([])
  })

  it('不重复全局忽略规则', () => {
    expect((search.ignore ?? []).filter(selector => IGNORE_SELECTORS.includes(selector))).toEqual([])
  })

  it('忽略选择器与属性规则选择器不依赖 aria-label 的取值', () => {
    const selectors = [...(search.ignore ?? []), ...(search.attributeRules ?? []).map(([selector]) => selector)]
    expect(selectors.filter(selector => /\[aria-label[~|^$*]?=/.test(selector))).toEqual([])
  })

  it('匹配器按页面返回忽略选择器', () => {
    expect(matcher.ignoreSelectors(['common', 'search'])).toEqual(search.ignore)
    expect(matcher.ignoreSelectors(['common', 'repository'])).toEqual([])
  })

  it('用户内容与语言名被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <a href="https://github.com/search?q=vue+language%3AVue&amp;type=repositories"><span>Vue</span></a>
      <div data-testid="results-list">
        <div class="Result__Of4h7n">
          <div class="Content__agXLbn"><span>Create Vue Applications using a Visual Designer</span></div>
          <div><a class="topicLabel__WcsFw6" href="/topics/frontend">frontend</a></div>
          <ul class="footer__evnOBN">
            <li class="footerItem__UC05DZ"><span class="languageCircleWrapper__VOT6Am"><div class="languageCircle__eF82_7" style="background-color:#3178c6"></div></span><span aria-label="TypeScript language">TypeScript</span></li>
            <span aria-hidden="true" class="spacer__oqbDuD">·</span>
            <li class="footerItem__UC05DZ"><a aria-label="212632 stars" href="/octo-org/hello-world/stargazers"><span>213k</span></a></li>
            <li class="footerItem__UC05DZ"><span>Updated </span></li>
            <li class="footerItem__UC05DZ"><span class="authorName__W_50mz">octocat</span></li>
            <li class="footerItem__UC05DZ"><button class="clickableLabel__oWcao2">Verified</button></li>
          </ul>
        </div>
        <div class="Result__Of4h7n">
          <ul class="footer__evnOBN">
            <li class="footerItem__UC05DZ"><img data-testid="github-avatar">code</li>
            <li class="footerItem__UC05DZ">Opened&nbsp; <div title="Oct 15, 2026"><span>10 days ago</span></div></li>
          </ul>
        </div>
        <div class="Result__Of4h7n">
          <ul class="footer__evnOBN">
            <li class="footerItem__UC05DZ"><img data-testid="github-avatar"><a href="/hubot"><span class="authorName__16v5kA">hubot</span></a><span class="postedText__TeTqkd">posted</span></li>
          </ul>
        </div>
        <div class="Result__Of4h7n">
          <div class="contentColumn__-wrhlk">
            <ul class="footer__evnOBN">
              <li class="footerItem__UC05DZ"><span>All Over the World</span></li>
              <li class="footerItem__UC05DZ"><span aria-label="124 repositories">124</span></li>
            </ul>
          </div>
        </div>
        <div class="Result__Of4h7n">
          <ul class="footer__evnOBN">
            <li class="footerItem__UC05DZ">By&nbsp;<a data-inline="true" href="/Application">Application</a></li>
            <li class="footerItem__UC05DZ"><span>Verified by GitHub</span></li>
          </ul>
        </div>
      </div>
      <dialog id="funding-links-modal-octo-org-hello-world">
        <h1 id="funding-links-modal-octo-org-hello-world-title">Sponsor octo-org/hello-world</h1>
        <h5>GitHub Sponsors</h5>
        <p class="mb-0 h5"><a class="color-fg-default" href="/monalisa">monalisa</a></p>
        <a href="/sponsors/monalisa" aria-label="Sponsor @monalisa"><span>Sponsor</span></a>
        <h5>External links</h5>
        <a target="_blank" href="https://patreon.com/octo-org"><span>patreon.com/<strong>octo-org</strong></span></a>
        <a href="https://docs.github.com/">Learn more about funding links in repositories</a>
      </dialog>
      <select id="search_language">
        <option value="">Any language</option>
        <optgroup label="Popular"><option>JavaScript</option></optgroup>
      </select>`
    const index = compileIgnoreIndex(search.ignore ?? [], document.createElement('div'))
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(index.selector))
    }
    expect(ignored('Vue')).toBe(true)
    expect(ignored('Create Vue Applications using a Visual Designer')).toBe(true)
    expect(ignored('frontend')).toBe(true)
    expect(ignored('TypeScript')).toBe(true)
    expect(ignored('octocat')).toBe(true)
    expect(ignored('code')).toBe(true)
    expect(ignored('hubot')).toBe(true)
    expect(ignored('All Over the World')).toBe(true)
    // Marketplace 结果的发布者名与 scoped 键同名时也不翻译
    expect(ignored('Application')).toBe(true)
    expect(ignored('Verified by GitHub')).toBe(false)
    expect(ignored('monalisa')).toBe(true)
    expect(ignored('patreon.com/octo-org')).toBe(true)
    expect(ignored('JavaScript')).toBe(true)
    expect(ignored('213k')).toBe(false)
    expect(ignored('Updated')).toBe(false)
    expect(ignored('Verified')).toBe(false)
    expect(ignored('posted')).toBe(false)
    expect(ignored('10 days ago')).toBe(false)
    expect(ignored('124')).toBe(false)
    expect(ignored('Sponsor')).toBe(false)
    expect(ignored('External links')).toBe(false)
    expect(ignored('Learn more about funding links in repositories')).toBe(false)
    expect(ignored('Any language')).toBe(false)
    // 引擎的索引匹配与原生 matches 一致
    const elements = [...document.body.querySelectorAll('*')]
    expect(elements.filter(element => elementMatches(index, element))).toEqual(elements.filter(element => element.matches(index.selector)))
  })

  it('头部搜索框的查询文字与建议取值被忽略，占位文字、限定符说明不被忽略', () => {
    document.body.innerHTML = `
      <button><span id="qb-input-query">vue code</span></button>
      <button><span id="qb-placeholder">Type <kbd>/</kbd> to search</span></button>
      <query-builder class="QueryBuilder">
        <div class="QueryBuilder-StyledInputContainer">
          <div aria-hidden="true" class="QueryBuilder-StyledInputContent"><span>vue </span><span>code</span></div>
          <div class="QueryBuilder-InputWrapper">
            <div aria-hidden="true" class="QueryBuilder-Sizer">vue code</div>
            <input class="QueryBuilder-Input" />
          </div>
        </div>
        <ul role="listbox">
          <li role="option" data-type="filter-result">
            <span class="QueryBuilder-ListItem"><span class="ActionListItem-descriptionWrap">
              <span class="ActionListItem-label text-normal" id="qb-key">state:</span>
              <span class="ActionListItem-description" id="qb-desc">Filter by state</span>
            </span></span>
          </li>
          <li role="option" data-type="filter-item">
            <span class="QueryBuilder-ListItem"><span class="ActionListItem-descriptionWrap">
              <span class="ActionListItem-label text-normal" id="qb-value">open</span>
            </span></span>
          </li>
        </ul>
      </query-builder>`
    const index = compileIgnoreIndex(PAGE_IGNORE, document.createElement('div'))
    const ignored = (node: Element | null): boolean => Boolean(node?.closest(index.selector))
    const byId = (id: string): Element | null => document.getElementById(id)
    expect(ignored(byId('qb-input-query'))).toBe(true)
    expect(ignored(document.querySelector('.QueryBuilder-StyledInputContent span:last-child'))).toBe(true)
    expect(ignored(document.querySelector('.QueryBuilder-Sizer'))).toBe(true)
    expect(ignored(byId('qb-value'))).toBe(true)
    expect(ignored(byId('qb-key'))).toBe(false)
    expect(ignored(byId('qb-desc'))).toBe(false)
    // 没有查询时按钮显示「Type / to search」，带 kbd，照常翻译
    byId('qb-placeholder')?.setAttribute('id', 'qb-input-query')
    expect(ignored(document.querySelector('#qb-input-query:has(kbd)'))).toBe(false)
    // 取值 open 与高级搜索页的 scoped 词条同名，靠忽略规则保持原样；类型词 code 不单独收录
    expect(translate('code')).toBeUndefined()
    expect(translate('open')).toBe('打开')
    const elements = [...document.body.querySelectorAll('*')]
    expect(elements.filter(element => elementMatches(index, element))).toEqual(elements.filter(element => element.matches(index.selector)))
  })
})
