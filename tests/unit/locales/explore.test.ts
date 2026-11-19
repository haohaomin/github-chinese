import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { compileIgnoreIndex } from '../../../src/core/selectors'
import { createTranslator, type Translator } from '../../../src/core/translator'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import explore from '../../../src/locales/zh-CN/explore'
import languages from '../../../src/locales/zh-CN/explore/languages'

const matcher = createMatcher([['explore', explore]])
/** 含通用词典，与实际页面一致：存储库卡片的“Updated”、星标计数等由 common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['explore', explore]
])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'explore'])
}

function translateFull(text: string): string | undefined {
  return fullMatcher.translate(text, ['common', 'explore'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 探索首页：存储库卡片、集合卡片、侧栏
  { hits: [['Repository menu: octocat/hello-world', '存储库菜单：octocat/hello-world']], misses: ['Repository menu'] },
  {
    hits: [
      ['See the 17 items in this collection', '查看此集合中的 17 项'],
      ['See the 1 item in this collection', '查看此集合中的 1 项']
    ],
    misses: ['See the items in this collection']
  },
  {
    hits: [
      ['3 starred topics', '3 个已加星标的主题'],
      ['1 starred topic', '1 个已加星标的主题']
    ],
    misses: ['starred topics']
  },
  {
    hits: [
      ['12 starred repositories', '12 个已加星标的存储库'],
      ['1 starred repository', '1 个已加星标的存储库']
    ],
    misses: ['no starred repositories']
  },
  { hits: [['5 more', '另有 5 个']], misses: ['more'] },

  // 趋势（趋势短语里的 today 译“今日”，日期范围选项 Today 仍译“今天”）
  {
    hits: [
      ['675 stars today', '今日 675 个星标'],
      ['2,987 stars this week', '本周 2,987 个星标'],
      ['1 star this month', '本月 1 个星标']
    ],
    misses: ['675 stars yesterday']
  },
  { hits: [['Works for @octo-org', '就职于 @octo-org']], misses: ['Worked for GitHub'] },
  { hits: [['Is from Sample City, CA', '来自 Sample City, CA']], misses: ['From Sample City, CA'] },
  {
    hits: [
      ['It looks like we don’t have any trending repositories for Zimpl.', '暂无 Zimpl 趋势存储库。'],
      ["It looks like we don't have any trending developers.", '暂无趋势开发人员。']
    ],
    misses: ['We don’t have any trending repositories.']
  },
  {
    hits: [
      ['Trending repositories on GitHub today', '今日 GitHub 上的趋势存储库'],
      ['Trending TypeScript repositories on GitHub this week', '本周 GitHub 上的 TypeScript 趋势存储库'],
      ['Trending developers on GitHub this month', '本月 GitHub 上的趋势开发人员']
    ],
    misses: ['Trending repositories on GitLab today']
  },

  // 主题与集合
  {
    hits: [
      ['Here are 67,180 public repositories matching this topic...', '共有 67,180 个公共存储库匹配此主题...'],
      ['Here is 1 public repository matching this topic...', '共有 1 个公共存储库匹配此主题...']
    ],
    misses: ['Here are some public repositories matching this topic...']
  },
  {
    hits: [
      ['There are 1,234 public repositories matching this topic', '共有 1,234 个公共存储库匹配此主题'],
      // 句号随原文
      ['There is 1 public repository matching this topic.', '共有 1 个公共存储库匹配此主题。']
    ],
    misses: ['There are many public repositories matching this topic']
  },
  {
    hits: [
      ['February 11, 2014', '2014年2月11日'],
      ['13 days ago', '13天前'],
      ['yesterday', '昨天']
    ],
    misses: ['Octember 11, 2014']
  },
  {
    hits: [['Collection: Getting started with machine learning', '集合：Getting started with machine learning']],
    misses: ['Collections: Music']
  },

  // 活动
  { hits: [['Filters (2)', '筛选器 (2)']], misses: ['Filters (two)'] },
  {
    hits: [
      ['Upcoming GitHub events, webinars & developer conferences - Page 2', '即将举行的 GitHub 活动、网络研讨会与开发人员大会 - 第 2 页']
    ],
    misses: ['Upcoming GitHub events, webinars & developer conferences - Page two']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('explore 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(explore.static?.[input]).toBeUndefined()
    expect(explore.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = explore.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('换行缩进的服务端文本规范化后命中', () => {
    expect(translate(normalizeText('\n      See what the GitHub community is most excited about today.\n    '))).toBe(
      '看看 GitHub 社区今天最关注什么。'
    )
    expect(translate(normalizeText('\n  Here are 1,065 public repositories matching this topic...\n'))).toBe(
      '共有 1,065 个公共存储库匹配此主题...'
    )
  })

  it('被主题名拆开的句子各段单独命中', () => {
    expect(translate('The')).toBe('主题')
    expect(translate("topic hasn't been used on any public repositories, yet.")).toBe('尚未被任何公共存储库使用。')
    expect(translate('To associate your repository with the')).toBe('要将存储库关联到')
    // 原文句号在引号内（select "manage topics."），check:locale 不把引号算作结尾标点，译文结尾不加句号
    expect(translate('topic, visit your repo\'s landing page and select "manage topics."')).toBe('主题，请在存储库首页选择“管理主题”')
    expect(translate('Add a description, image, and links to the')).toBe('为')
    expect(translate('topic page so that developers can more easily learn about it.')).toBe(
      '主题页面添加描述、图片和链接，方便开发人员了解。'
    )
  })

  it('被链接拆开的动态结尾各段单独命中', () => {
    expect(translate("That's everything we found for you, for now.")).toBe('目前为你找到的就这些。')
    expect(translate('Come back soon to see what we find next, or')).toBe('稍后再来看看新发现，或')
    expect(translate('get email updates.')).toBe('获取电子邮件动态。')
    // 已订阅时：Come back soon to see what we find next, + check how often you receive email updates.
    expect(translate('Come back soon to see what we find next,')).toBe('稍后再来看看新发现，')
    expect(translate('check how often you receive email updates.')).toBe('查看电子邮件动态的接收频率。')
  })

  it('存储库卡片的星标计数与主题关注者计数由 common-ui 翻译', () => {
    expect(translateFull('4959 users starred this repository')).toBe('4959 个用户为此存储库加了星标')
    expect(translateFull('59k followers')).toBe('59k 个关注者')
    expect(translateFull('1 follower')).toBe('1 个关注者')
    for (const text of ['4959 users starred this repository', '59k followers']) {
      expect(explore.regexp?.some(([pattern]) => pattern.test(text))).toBe(false)
    }
  })

  it('趋势页的赞助按钮与加载状态由 common-ui 翻译', () => {
    expect(translateFull('Sponsor @octocat')).toBe('赞助 @octocat')
    expect(explore.regexp?.some(([pattern]) => pattern.test('Sponsor @octocat'))).toBe(false)
    expect(translateFull('Loading')).toBe('加载中')
    expect(explore.scoped?.Loading).toBeUndefined()
  })

  it('React 拆开的筛选读屏文字与计数拼接后命中', () => {
    // <span class="sr-only">{Open|Close}{" Filters"}</span>
    expect(translate(normalizeText(['Open', ' Filters'].join('')))).toBe('打开筛选器')
    expect(translate(normalizeText(['Close', ' Filters'].join('')))).toBe('关闭筛选器')
    // <h2>{"Filters "}{"(2)"}</h2>
    expect(translate(normalizeText(['Filters ', '(2)'].join('')))).toBe('筛选器 (2)')
  })
})

describe('explore 静态词条', () => {
  it.each([
    ['Explore navigation', '探索导航'],
    ["Here's what's popular on GitHub today...", '以下是 GitHub 今日热门内容...'],
    ["Here's what we found based on your interests...", '以下是根据你的兴趣找到的内容...'],
    ['This recommendation was generated by GitHub computers', '此推荐由 GitHub 自动生成'],
    ['Trending repository', '趋势存储库'],
    ['Popular topic', '热门主题'],
    ['Collection recommended by GitHub', 'GitHub 推荐的集合'],
    ["Based on repositories you've starred", '基于你已加星标的存储库'],
    ['Based on topics you’ve starred', '基于你已加星标的主题'],
    ['Based on your public repository contributions', '基于你对公共存储库的贡献'],
    ['Trending developers', '趋势开发人员'],
    ['See more trending developers', '查看更多趋势开发人员'],
    // 侧栏“Trending repositories today”中的时间：趋势短语里的 today 译“今日”
    ['today', '今日'],
    ['Star topics that interest you', '为你感兴趣的主题加星标'],
    ['Updated', '更新于'],
    ['Daily', '每天'],
    [
      'The perfect way to keep on top of everything GitHub. Every Tuesday, we’ll send you an email with everything we found for you in the past week based on your interests.',
      '紧跟 GitHub 动态的最佳方式。每周二，我们会根据你的兴趣，把过去一周为你找到的内容通过电子邮件发给你。'
    ],
    // email → 电子邮件；email updates 与 sponsors 探索页同译“电子邮件动态”
    ['Get email updates', '获取电子邮件动态'],
    ['Change email updates', '更改电子邮件动态'],
    ['Explore email newsletter', '探索电子邮件简报'],
    ['Get email updates about what GitHub finds for you based on your interests', '通过电子邮件接收 GitHub 根据你的兴趣找到的内容'],
    ['Spoken Language:', '自然语言：'],
    ['Select a spoken language', '选择自然语言'],
    ['profile settings', '个人资料设置'],
    ['Date range:', '日期范围：'],
    // 日期范围选项 Today 由全局词条译“今天”，与趋势短语的“今日”不同
    ['Today', '今天'],
    ['This week', '本周'],
    ['Built by', '构建者'],
    ['Popular repo', '热门存储库'],
    ['These are the developers building the hot tools today.', '这些开发人员正在打造今日热门工具。'],
    // 可赞助筛选属赞助语境，沿用“开发者”；产品名按用户要求译成中文：GitHub Sponsors → GitHub 赞助
    ['Sponsorable developers', '可赞助的开发者'],
    ['All developers', '所有开发者'],
    ['GitHub Sponsors participation', 'GitHub 赞助参与情况'],
    ['Browse popular topics on GitHub.', '浏览 GitHub 上的热门主题。'],
    ['Curated lists and insight into burgeoning industries, topics, and communities.', '精选列表，以及对新兴行业、主题和社区的洞察。'],
    ['Sort:', '排序：'],
    ['Least recently updated', '最久未更新'],
    ['Latest release', '最新发行版'],
    ['Related topics', '相关主题'],
    ['Collection', '集合'],
    ['GitHub Topics', 'GitHub 主题'],
    ['Events & Webinars', '活动与网络研讨会'],
    ['Upcoming GitHub events, webinars & developer conferences', '即将举行的 GitHub 活动、网络研讨会与开发人员大会'],
    ['Date (soonest)', '日期（由近及远）'],
    ['Region', '地区'],
    ['AMER', '美洲'],
    ['On demand', '点播'],
    // 名词 filters → 筛选器
    ['No results found. Please clear your filters and try another search.', '未找到结果。请清除筛选器后重新搜索。']
  ])('%s → %s', (input, expected) => {
    expect(translateFull(input)).toBe(expected)
  })

  it('自然语言菜单全部收录，截断的名称按原样匹配', () => {
    const names = Object.entries(languages.scoped ?? {})
    expect(names).toHaveLength(184)
    for (const [name, label] of names) expect(translate(name)).toBe(label)
    expect(translate('Chinese')).toBe('中文')
    expect(translate('Spanish, Castilian')).toBe('西班牙语、卡斯蒂利亚语')
    expect(translate('Interlingua (International Auxil...')).toBe('国际语（国际辅助语言协会）')
    expect(translate('Church Slavic, Old Slavonic, Chu...')).toBe('教会斯拉夫语、古斯拉夫语')
  })

  it('自然语言名只在探索页生效', () => {
    const elsewhere = createMatcher([['explore', explore]])
    expect(elsewhere.translate('Chinese', ['common', 'profile'])).toBeUndefined()
    expect(elsewhere.translate('Daily', ['common', 'profile'])).toBeUndefined()
    expect(elsewhere.translate('AMER', ['common', 'profile'])).toBeUndefined()
  })

  it('与通用词条同形的编程语言名在探索页原样保留', () => {
    // 趋势页按钮：Language: + <已选语言>；主题页语言筛选菜单：<语言名> + <存储库数>
    for (const name of ['Logos', 'Move', 'Reason']) expect(translateFull(name)).toBe(name)
    expect(fullMatcher.translate('Reason', ['common', 'profile'])).toBe('原因')
  })

  it('活动页筛选标题 Type 只在探索页收录，页头搜索提示整句交给通用词典', () => {
    expect(explore.static?.Type).toBeUndefined()
    expect(explore.scoped?.Type).toBe('类型')
    expect(translateFull('Type')).toBe('类型')
    expect(translateFull('Type / to search')).toBe('按 / 搜索')
    expect(fullMatcher.translate('Type', ['common', 'profile'])).toBeUndefined()
  })
})

describe('explore 活动页筛选栏与页头搜索提示（DOM）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('筛选标题 Type 译为“类型”，被 <kbd> 拆开的页头搜索提示仍整句翻译', () => {
    // 筛选栏结构取自 /resources/events（Primer Brand：h2 标题 + fieldset 的隐藏 legend）；
    // 页头为登录后的搜索按钮（React 页头：searchButton__ 按钮内的 placeholder__，快捷键是 kbd）
    document.body.innerHTML = `
      <button data-component="Button" type="button" class="prc-Button-ButtonBase-9n-Xk appHeaderButton__sQ5HIU searchButton__6Ru-S-">
        <span data-component="buttonContent" class="prc-Button-ButtonContent-Iohp5"><span data-component="text" class="prc-Button-Label-FWkx3"><span class="placeholder__MIdoN6 text__t7BSCl value__JUFO_5">Type <kbd class="kbd__Qnh9QU">/</kbd> to search</span></span></span>
      </button>
      <div class="Primer_Brand__Box-module__Box___2jCFE">
        <h2 class="Primer_Brand__Heading-module__Heading___fudyh navListHeading__5JhXYL">Type</h2>
      </div>
      <div class="Primer_Brand__Stack-module__Stack___kkChc">
        <fieldset class="Primer_Brand__ControlGroup-module__ControlGroup__container___k0gGq">
          <legend class="Primer_Brand__ControlGroup-module__ControlGroup__label___T4WJ_ visually-hidden"><span class="Primer_Brand__Text-module__Text___XeGJJ">Type</span></legend>
          <section class="Primer_Brand__FormControl-module__FormControl___xyCI6">
            <label class="Primer_Brand__FormControl-module__FormControl-label____oJE0">Virtual</label>
            <span class="Primer_Brand__Checkbox-module__Checkbox-wrapper___81I1z"><input type="checkbox" name="type" value="virtual"></span>
          </section>
        </fieldset>
      </div>`
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => ['common', 'explore'] })
    translator.start()
    const placeholder = document.querySelector('[class*="placeholder__"]')
    expect(placeholder?.textContent?.replace(/\s+/g, ' ').trim()).toBe('按 / 搜索')
    expect(placeholder?.querySelector('kbd')?.textContent).toBe('/')
    expect(document.querySelector('h2')?.textContent).toBe('类型')
    expect(document.querySelector('legend span')?.textContent).toBe('类型')
    expect(document.querySelector('label')?.textContent).toBe('线上')
  })
})

describe('explore 忽略规则', () => {
  it.each(explore.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  /** 元素自身或祖先命中忽略选择器 */
  function isIgnored(root: Element, query: string): boolean {
    const element = root.querySelector(query)
    if (!element) throw new Error(`找不到元素：${query}`)
    return element.closest((explore.ignore ?? []).join(', ')) !== null
  }

  /** 页面实际生效的忽略规则：全局规则加本词典规则（编译时丢弃测试环境不支持的选择器） */
  const pageIgnore = compileIgnoreIndex([...IGNORE_SELECTORS, ...(explore.ignore ?? [])], document.createElement('div')).selector

  /** 同 isIgnored，但按页面实际生效的规则判断 */
  function isIgnoredOnPage(root: Element, query: string): boolean {
    const element = root.querySelector(query)
    if (!element) throw new Error(`找不到元素：${query}`)
    return element.closest(pageIgnore) !== null
  }

  it('主题页的主题名被忽略，界面文字照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div class="col-lg-9 col-md-8 d-flex"><div class="d-flex flex-1"><div>#</div><h1 class="h1">vite-plugin</h1></div>',
      '<a class="btn"><span class="d-inline">Star</span></a></div>',
      '<div class="d-md-flex gutter-md"><div class="col-md-8 col-lg-9">',
      '<div class="f3 color-fg-muted lh-condensed">The <strong class="h3 color-fg-default">vite-plugin</strong> topic hasn’t been used</div>',
      '</div><div class="col-md-4 col-lg-3"><div class="tmp-mb-6"><h2 class="h4">Add this topic to your repo</h2>',
      '<p class="color-fg-muted">To associate your repository with the <span class="text-bold">vite-plugin</span> topic</p>',
      '</div></div></div>',
      '<div class="container-lg text-center"><h1 class="h1">Trending</h1></div>'
    ].join('')
    expect(isIgnored(root, 'h1.h1')).toBe(true)
    expect(isIgnored(root, 'strong.h3')).toBe(true)
    expect(isIgnored(root, 'span.text-bold')).toBe(true)
    expect(isIgnored(root, 'div.f3')).toBe(false)
    expect(isIgnored(root, 'h2.h4')).toBe(false)
    expect(isIgnored(root, 'span.d-inline')).toBe(false)
    expect(isIgnored(root, '.text-center > h1')).toBe(false)
  })

  it('主题列表页的推荐卡片与精选主题的名称、描述由全局规则忽略，列表标题与星标按钮照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<ul><li><div class="topic-box position-relative"><div class="js-toggler-container starring-container"></div>',
      '<a href="/topics/react" class="no-underline d-flex flex-column flex-justify-center">',
      '<p class="f3 lh-condensed text-center Link--primary mb-0 mt-1">React</p>',
      '<p class="f5 color-fg-muted text-center mb-0 mt-1">React is a JavaScript library.</p></a></div></li></ul>',
      '<h2 class="h2">All featured topics</h2>',
      '<div class="tmp-py-4 border-bottom d-flex flex-justify-between">',
      '<a href="/topics/code-quality" class="no-underline flex-1 d-flex flex-column">',
      '<p class="f3 lh-condensed mb-0 mt-1 Link--primary">Code quality</p>',
      '<p class="f5 color-fg-muted mb-0 mt-1">Automate your code review with style, quality, security, and test-coverage checks when you need them.</p></a>',
      '<div class="flex-grow-0"><a class="btn-sm btn" aria-label="You must be signed in to star a repository">',
      '<span class="d-inline">Star</span></a></div></div>'
    ].join('')
    expect(isIgnoredOnPage(root, '.topic-box p.f3')).toBe(true)
    expect(isIgnoredOnPage(root, '.topic-box p.f5')).toBe(true)
    expect(isIgnoredOnPage(root, '.border-bottom p.f3')).toBe(true)
    expect(isIgnoredOnPage(root, '.border-bottom p.f5')).toBe(true)
    expect(isIgnoredOnPage(root, 'h2.h2')).toBe(false)
    expect(isIgnoredOnPage(root, 'span.d-inline')).toBe(false)
    // 全局规则已覆盖，本词典不另收
    expect(isIgnored(root, '.topic-box p.f3')).toBe(false)
    expect(isIgnored(root, '.border-bottom p.f5')).toBe(false)
  })

  it('集合名与描述被忽略，“Collection”标签照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<div class="d-md-flex"><div><div class="h5 text-uppercase"><a href="/collections" class="Link--secondary">Collection</a></div>',
      '<h1 class="h1 lh-condensed tmp-mb-3">Music</h1>',
      '<div class="f3 color-fg-muted lh-condensed tmp-mb-3">Drop the code bass.</div></div></div>',
      '<div class="col-12 col-sm-6"><a class="exploregrid-item d-flex" href="/collections/learn-to-code">',
      '<p class="f3 lh-condensed">Learn to Code</p><p class="f5 color-fg-muted">Resources to help people learn to code</p></a></div>'
    ].join('')
    expect(isIgnored(root, 'h1.h1')).toBe(true)
    expect(isIgnored(root, 'h1 + .f3')).toBe(true)
    expect(isIgnored(root, 'a.exploregrid-item > p.f3')).toBe(true)
    expect(isIgnored(root, 'a.exploregrid-item > p.f5')).toBe(true)
    expect(isIgnored(root, 'a.Link--secondary')).toBe(false)
  })

  it('页脚站点语言选择器的当前语言被忽略，自然语言筛选照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<button aria-label="English - Select language"><span class="triggerContent__V04-BC">',
      '<svg class="octicon octicon-globe"></svg><span class="triggerLabel__F6_qO9">English</span></span></button>',
      '<button><span class="triggerContent__V04-BC"><svg class="octicon octicon-filter"></svg>',
      '<span class="triggerLabel__F6_qO9">Type</span></span></button>',
      '<ul role="menu"><li class="select-menu-item"><span class="select-menu-item-text">English</span></li></ul>'
    ].join('')
    expect(isIgnored(root, '.octicon-globe + [class*="triggerLabel__"]')).toBe(true)
    expect(isIgnored(root, '.octicon-filter + [class*="triggerLabel__"]')).toBe(false)
    expect(isIgnored(root, '.select-menu-item-text')).toBe(false)
  })
})
