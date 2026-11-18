import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import wiki from '../../../src/locales/zh-CN/wiki'
import editorHelp from '../../../src/locales/zh-CN/wiki/editor-help'
import pages from '../../../src/locales/zh-CN/wiki/pages'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = wiki

/** editor-help 没有 regexp，同样以通用类型访问 */
const helpDict: PageDictionary = editorHelp

const matcher = createMatcher([['wiki', wiki]])

/** 存储库 Wiki 的作用域：common → repository → wiki */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'wiki']

function translate(text: string): string | undefined {
  return matcher.translate(text, [...SCOPE])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按合并后的正则顺序排列（只有 pages 有正则），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 空 Wiki
  {
    hits: [
      ['Welcome to the hello-world wiki!', '欢迎来到 hello-world Wiki！'],
      ['Welcome to the octo-repo Wiki!', '欢迎来到 octo-repo Wiki！']
    ],
    misses: ['Welcome to the wiki', 'Welcome to the hello-world wiki']
  },
  // 空 Wiki（登录后）：Wiki: owner/repo
  {
    hits: [
      ['Wiki: octocat/hello-world', 'Wiki：octocat/hello-world'],
      ['Wiki: octo-org/octo-repo', 'Wiki：octo-org/octo-repo']
    ],
    misses: ['Wiki: Home', 'Wiki:', 'Wiki: acme/app/extra']
  },
  // 页面头部：<用户> edited this page
  {
    hits: [
      ['Monalisa Octocat edited this page', 'Monalisa Octocat 编辑于'],
      ['octocat edited this page', 'octocat 编辑于']
    ],
    misses: ['octocat edited this file', 'octocat edited this page yesterday']
  },
  // 修订数
  {
    hits: [
      ['14 revisions', '14 次修订'],
      ['1 revision', '1 次修订'],
      ['1,024 revisions', '1,024 次修订']
    ],
    misses: ['revisions', 'many revisions']
  },
  // 最后编辑者与时间
  {
    hits: [
      ['Last edited by octocat 2 weeks ago', 'octocat 最后编辑于 2周前'],
      ['Last edited by octocat, on Mar 18, 2025', 'octocat 最后编辑于 2025年3月18日'],
      ['Last edited by octocat yesterday', 'octocat 最后编辑于昨天']
    ],
    misses: ['Last edited by octocat', 'Last edited by octocat recently']
  },
  // 侧栏：Show N more pages
  {
    hits: [
      ['Show 38 more pages…', '再显示 38 个页面…'],
      ['Show 1 more page...', '再显示 1 个页面...']
    ],
    misses: ['Show more pages…', 'Show 38 more pages']
  },
  // 侧栏：Structure for <页面名>
  {
    hits: [
      // 页面名原文不带引号，译文也不加；中文页面名后不补空格
      ['Structure for Home', 'Home 的结构'],
      ['Structure for 0. Index', '0. Index 的结构'],
      ['Structure for 安装指南', '安装指南的结构']
    ],
    misses: ['Structure for']
  },
  // 编辑
  {
    hits: [
      ['Editing Home', '编辑 Home'],
      ['Editing FAQ', '编辑 FAQ']
    ],
    misses: ['Edit Home']
  },
  {
    hits: [['Could not find version "abc1234"', '找不到版本“abc1234”']],
    misses: ['Could not find version', 'Could not find version abc1234']
  },
  // 比较修订：Compare: <页面名>
  {
    hits: [
      ['Compare: Home', '比较：Home'],
      ['Compare: 0. Index', '比较：0. Index']
    ],
    misses: ['Compare:', 'Compare Home']
  },
  // 比较：差异统计
  {
    hits: [
      ['1 change: 0 additions & 1 deletion', '1 处更改：新增 0 行和删除 1 行'],
      ['12 changes: 10 additions & 2 deletions', '12 处更改：新增 10 行和删除 2 行']
    ],
    misses: ['0 changes: none', '1 change: 0 additions']
  },
  {
    hits: [
      ['1 changed file', '1 个已更改的文件'],
      ['3 changed files', '3 个已更改的文件']
    ],
    misses: ['changed file']
  },
  {
    hits: [
      ['3 additions', '新增 3 行'],
      ['0 additions', '新增 0 行'],
      ['1 addition', '新增 1 行']
    ],
    misses: ['additions']
  },
  {
    hits: [
      ['1 deletion', '删除 1 行'],
      ['7 deletions', '删除 7 行']
    ],
    misses: ['deletions']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('wiki 合并', () => {
  it('包含两个子文件的全部词条与正则', () => {
    expect(Object.keys(dict.static ?? {})).toHaveLength(
      Object.keys(pages.static ?? {}).length + Object.keys(editorHelp.static ?? {}).length
    )
    expect(Object.keys(dict.scoped ?? {})).toHaveLength(
      Object.keys(pages.scoped ?? {}).length + Object.keys(editorHelp.scoped ?? {}).length
    )
    expect(RULES).toHaveLength((pages.regexp?.length ?? 0) + (helpDict.regexp?.length ?? 0))
    expect(dict.ignore).toEqual(pages.ignore)
  })
})

describe('wiki 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('被元素隔开的片段单独命中', () => {
    // Showing <1 changed file> with <0 additions> and <1 deletion>
    expect(translate('Showing')).toBe('显示')
    expect(translate('with')).toBe('包含')
    // Last updated <relative-time>
    expect(translate('Last updated')).toBe('最后更新于')
    // Markdown 帮助：Markdown creates blockquotes … with the <code>&gt;</code>. This looks best …
    expect(translate('Markdown creates blockquotes email-style by prefixing each line with the')).toBe(
      'Markdown 按电子邮件风格创建引用块的方法是在每行前加上'
    )
    expect(translate('before your paragraph.')).toBe('。')
    // Markdown 帮助：… wrap your words in single/double asterisks/underscores. …（中文之间的斜杠两侧不加空格）
    expect(
      translate('tag. To create italic or bold text, simply wrap your words in single/double asterisks/underscores. For example,')
    ).toBe('标签。要创建斜体或粗体文本，只需用一个或两个星号/下划线包裹文字。例如，')
    // AsciiDoc 帮助：To display text as <strong>bold</strong>, wrap the text in <code>*</code> (asterisks). …
    expect(translate('To display text as')).toBe('要将文本显示为')
    expect(translate('bold')).toBe('粗体')
    expect(translate(', wrap the text in')).toBe('，请用')
    expect(translate('(asterisks). To display text as')).toBe('（星号）包裹文本。要将文本显示为')
    // AsciiDoc 帮助：… Level two headers are created with <code>==</code> and so on.（原文无逗号，译文不加）
    expect(translate('. Level two headers are created with')).toBe('。二级及以下标题依次用')
    expect(translate('and so on.')).toBe('等创建。')
    // AsciiDoc 帮助：<code>(R)</code> becomes ®, <code>(C)</code> becomes © and <code>(TM)</code> becomes ™.
    expect(translate('becomes ®,')).toBe('会变成 ®，')
    expect(translate('becomes ™.')).toBe('会变成 ™。')
    // Org-mode 帮助：Forward slashes (<code>/</code>) …
    expect(translate('Forward slashes (')).toBe('正斜杠 (')
    expect(translate('tag.')).toBe('标签。')
    // Pod 帮助：All command paragraphs start with <code>=</code> (equals sign).
    expect(translate('All command paragraphs start with')).toBe('所有命令段落都以')
    expect(translate('(equals sign).')).toBe('（等号）开头。')
    // Pod 帮助：<code>=headN</code>, where <code>N</code> is the number of the heading 1 through 4. …
    // 原文 1 through 4 两侧无括号，译文不加
    expect(
      translate('is the number of the heading 1 through 4. For example, to make a first-order heading (the largest possible,) write')
    ).toBe('是 1～4 的标题级别。例如，要创建一级标题（最大的标题），请写')
    // Textile 帮助：To display a link, put the text … then a colon (<code>:</code>), then the URL …
    expect(translate('To display a link, put the text you want to display in quotes, then a colon (')).toBe(
      '要显示链接，请将要显示的文本放在引号中，后接冒号 ('
    )
    expect(translate('), then the URL after the colon. For example')).toBe(')，再在冒号后写 URL。例如')
  })

  it('帮助中的示例文字不翻译', () => {
    expect(translate('My double emphasis text')).toBeUndefined()
    expect(translate('my bold text')).toBeUndefined()
    expect(translate('mytext')).toBeUndefined()
  })
})

describe('wiki 静态词条', () => {
  it.each([
    ['Create the first page', '创建第一个页面'],
    ['Wiki pages', 'Wiki 页面'],
    ['Find a page or section…', '查找页面或章节…'],
    ['Find a page...', '查找页面...'],
    ['Clone this wiki locally', '在本地克隆此 Wiki'],
    ['Add a custom sidebar', '添加自定义侧边栏'],
    ['+ Add a custom footer', '+ 添加自定义页脚'],
    ['Page history', '页面历史记录'],
    ['Compare revisions', '比较修订'],
    ['Compare Revisions', '比较修订'],
    ['Revert changes', '还原更改'],
    ['Revert Changes', '还原更改'],
    ['Create new page', '创建新页面'],
    ['Save page', '保存页面'],
    ['Save Page', '保存页面'],
    ['Delete page', '删除页面'],
    ['Are you sure you want to delete this page?', '确定要删除此页面吗？'],
    ['Edit mode:', '编辑模式：'],
    ['Write a small message here explaining this change. (Optional)', '简要说明此次更改。（可选）'],
    // 原文分句、原文无逗号处，译文不合并、不添加
    [
      'Someone has edited the wiki since you started. Please reload this page and re-apply your changes.',
      '在你编辑期间有人修改了此 Wiki。请重新加载此页面并重新应用你的更改。'
    ],
    [') are treated as emphasis and are wrapped with an', ') 表示强调并会被包裹在'],
    ['Block Elements', '块级元素'],
    [
      'ASCIIDoc will automatically convert textual representations of commonly-used special characters. For example,',
      'ASCIIDoc 会自动转换常用特殊字符的文本写法。例如，'
    ],
    ['To create ordered lists, prefix each line with', '要创建有序列表，请在每行前加上'],
    ['To display an image, simply wrap the image’s URL in', '要显示图片，只需用']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Save page \n', [...SCOPE])).toBe('  保存页面 \n')
  })

  it('不收录旧编辑器工具栏词条与帮助中的示例文字', () => {
    // 工具栏已改为 Insert h1 等（scoped）；# Header 1 等只出现在帮助的 <code> 示例里
    for (const text of ['Header 1', 'Insert Image', 'Image URL', 'Link Text', 'Unordered List', 'Horizontal Rule']) {
      expect(dict.static?.[text]).toBeUndefined()
      expect(translate(text)).toBeUndefined()
    }
  })
})

describe('wiki 页面词条', () => {
  it.each([
    ['Pages', '页面'],
    ['New page', '新建页面'],
    ['New Page', '新建页面'],
    ['edited this page', '编辑于'],
    ['Last updated', '最后更新于'],
    ['Revisions', '修订'],
    ['Diff view', '差异视图'],
    ['Split', '拆分'],
    ['Unified', '统一'],
    ['Toggle diff contents', '切换差异内容'],
    ['Display the rich diff', '显示富差异'],
    ['View file', '查看文件'],
    ['No newline at end of file', '文件末尾没有换行符'],
    ['Editing', '编辑'],
    ['Edit message', '编辑说明'],
    ['Page content', '页面内容'],
    ['Insert h1', '插入一级标题'],
    ['Markup help', '标记语言帮助'],
    ['Image', '图片'],
    ['Text Formatting', '文本格式'],
    // 中文之间的斜杠两侧不加空格
    ['Bold / Italic', '粗体/斜体'],
    ['Superscript / Subscript', '上标/下标'],
    ['Command Paragraphs', '命令段落'],
    ['Phrase Modifiers', '短语修饰'],
    ['Links / Images', '链接/图片']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('编辑页标题拆成片段时与整句译法一致', () => {
    // <h1>Editing <span>Home</span></h1> 与 “Editing Home” 都以“编辑”开头
    expect(translate('Editing')).toBe('编辑')
    expect(translate('Editing Home')).toBe('编辑 Home')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Revisions', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Pages', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('14 revisions', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('bold', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Text Formatting', ['common', 'issues'])).toBeUndefined()
  })

  it('附件类型错误片段由 common-ui 的全局正则翻译，Wiki 词典不重复收录', () => {
    // <button>Try again</button> with a GIF, … or WEBP.
    const text = 'with a GIF, JPEG, JPG, MOV, MP4, PNG, SVG, WEBM or WEBP.'
    expect(helpDict.regexp).toBeUndefined()
    expect(translate(text)).toBeUndefined()
    const withCommonUi = createMatcher([
      ['common', commonUi],
      ['wiki', wiki]
    ])
    expect(withCommonUi.translate(text, [...SCOPE])).toBe('并改用 GIF、JPEG、JPG、MOV、MP4、PNG、SVG、WEBM 或 WEBP 格式的文件。')
  })
})

describe('wiki 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('页面标题、侧栏页面名、页面列表页面名与修订说明被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <div id="wiki-wrapper">
        <div class="d-flex gh-header">
          <h1 class="gh-header-title">Release Notes</h1>
          <div class="gh-header-actions"><a href="#wiki-pages-box">Jump to bottom</a></div>
        </div>
        <div class="gh-header-meta">Monalisa Octocat edited this page</div>
        <div class="js-wiki-sidebar-page-container">
          <div class="d-flex">
            <button aria-label="Structure for Install guide">toggle</button>
            <a class="Truncate flex-1 py-1 text-bold Link" href="/acme/app/wiki/Install">
              <div class="Truncate-text">Install guide</div>
            </a>
          </div>
          <div class="js-wiki-sidebar-toc-container">
            <ul><li class="my-2"><a class="Link--primary" href="/acme/app/wiki/Install#faq">FAQ section heading</a></li></ul>
            <div data-show-on-forbidden-error hidden>
              <h3 class="blankslate-heading">Uh oh!</h3>
              <p>There was an error while loading. <a class="Link--inTextBlock" href="">Please reload this page</a>.</p>
            </div>
          </div>
        </div>
      </div>
      <ul>
        <li class="Box-row">
          <div class="d-flex">
            <div class="flex-auto min-width-0 col-12 col-md-8"><a href="/acme/app/wiki/Usage">Usage notes</a></div>
            <div class="ml-md-2 col-12 col-md-4">Last updated</div>
          </div>
        </li>
      </ul>
      <form id="version-form">
        <ul>
          <li class="Box-row d-flex js-wiki-history-revision">
            <input class="js-wiki-history-checkbox" aria-label="Select Yet another deep link found">
            <p class="h5 mb-1">Yet another deep link found</p>
            <div class="mt-1 f6"><a href="/octocat"><span class="text-bold">octocat</span></a> committed</div>
          </li>
        </ul>
      </form>
      <button>Compare revisions</button>`

    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Release Notes')).toBe(true)
    expect(ignored('Install guide')).toBe(true)
    expect(ignored('FAQ section heading')).toBe(true)
    expect(ignored('Usage notes')).toBe(true)
    expect(ignored('Yet another deep link found')).toBe(true)
    expect(ignored('octocat')).toBe(true)
    expect(document.querySelector('.js-wiki-history-checkbox')?.closest(selector)).not.toBeNull()
    expect(ignored('Jump to bottom')).toBe(false)
    expect(ignored('Monalisa Octocat edited this page')).toBe(false)
    expect(ignored('toggle')).toBe(false)
    expect(ignored('Uh oh!')).toBe(false)
    expect(ignored('Please reload this page')).toBe(false)
    expect(ignored('Last updated')).toBe(false)
    expect(ignored('octocat committed')).toBe(false)
    expect(ignored('Compare revisions')).toBe(false)
  })

  it('页面历史标题整体忽略（含页面名）', () => {
    document.body.innerHTML = `
      <div id="wiki-wrapper">
        <div class="gh-header">
          <h1 class="gh-header-title"><a href="/acme/app/wiki/_history">History</a> <span class="divider">/</span> Home</h1>
        </div>
      </div>`
    const selector = (dict.ignore ?? []).join(', ')
    expect(document.querySelector('h1')?.closest(selector)).not.toBeNull()
  })
})
