import { describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import gistDictionary from '../../../src/locales/zh-CN/gist'

const gist: PageDictionary = gistDictionary
const matcher = createMatcher([['gist', gist]])
/** 含通用词典，与实际页面一致：通用按钮、列表计数、评论入口片段由 common / common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['gist', gist]
])
const GIST_SCOPE: readonly PageKey[] = ['common', 'gist']
const REPO_SCOPE: readonly PageKey[] = ['common', 'repository']

function translate(text: string, scope: readonly PageKey[] = GIST_SCOPE): string | undefined {
  return matcher.translate(text, scope)
}

function translateFull(text: string): string | undefined {
  return fullMatcher.translate(text, GIST_SCOPE)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 列表项：Created <relative-time> — forked from <a>…</a>
  {
    hits: [['— forked from', '— 复刻自']],
    misses: ['forked from', '— forked from octocat/hello', '- forked from']
  },
  // 嵌入、克隆与 GitHub Desktop（客户端名译“GitHub 桌面版”）
  {
    hits: [
      [
        'Save octocat/6cad326836d38bd3a7ae to your computer and use it in GitHub Desktop.',
        '将 octocat/6cad326836d38bd3a7ae 保存到你的计算机并在 GitHub 桌面版中使用。'
      ]
    ],
    misses: ['Save to your computer and use it in GitHub Desktop.']
  },
  {
    hits: [
      [
        'Clone this repository at &lt;script src=&quot;https://gist.github.com/octocat/6cad326836d38bd3a7ae.js&quot;&gt;&lt;/script&gt;',
        '通过 &lt;script src=&quot;https://gist.github.com/octocat/6cad326836d38bd3a7ae.js&quot;&gt;&lt;/script&gt; 克隆此存储库'
      ],
      [
        'Clone this repository at https://gist.github.com/6cad326836d38bd3a7ae.git',
        '通过 https://gist.github.com/6cad326836d38bd3a7ae.git 克隆此存储库'
      ]
    ],
    misses: ['Clone this repository']
  },
  // 文件区无障碍名称：时刻转为 24 小时制
  {
    hits: [
      ['LICENSE content, created by octocat on 02:10AM today.', 'LICENSE 的内容，由 octocat 于今天 02:10 创建。'],
      ['CLAUDE.md content, created by monalisa on 04:55PM yesterday.', 'CLAUDE.md 的内容，由 monalisa 于昨天 16:55 创建。'],
      [
        'Dockerfile content, created by hubot on 02:30PM on June 25, 2019.',
        'Dockerfile 的内容，由 hubot 于 2019年6月25日 14:30 创建。'
      ],
      [
        'data.json content, created by octocat on 12:46AM on August 12, 2022.',
        'data.json 的内容，由 octocat 于 2022年8月12日 00:46 创建。'
      ],
      ['notes.md content, created by monalisa on 12:56PM on January 13.', 'notes.md 的内容，由 monalisa 于 1月13日 12:56 创建。'],
      // 日在月前、无日的写法：on 前缀由 translateTime 去掉
      [
        'README.md content, created by octocat on 09:05AM on 25 June 2019.',
        'README.md 的内容，由 octocat 于 2019年6月25日 09:05 创建。'
      ],
      ['hello.rb content, created by octocat on 11:30PM on June 2019.', 'hello.rb 的内容，由 octocat 于 2019年6月 23:30 创建。']
    ],
    misses: ['LICENSE content, created by octocat.', 'LICENSE content, created by octocat on 02:10AM last week.']
  },
  // 修订：差异统计（与 commits、wiki 一致：新增 / 删除 N 行）
  {
    hits: [
      ['36 changes: 0 additions & 36 deletions', '36 处更改：新增 0 行和删除 36 行'],
      ['1 change: 1 addition & 0 deletions', '1 处更改：新增 1 行和删除 0 行']
    ],
    misses: ['36 changes']
  },
  {
    hits: [
      ['1 changed file', '1 个已更改的文件'],
      ['3 changed files', '3 个已更改的文件']
    ],
    misses: ['changed files']
  },
  {
    hits: [
      ['1 addition', '新增 1 行'],
      ['12 additions', '新增 12 行']
    ],
    misses: ['No additions']
  },
  {
    hits: [
      ['1 deletion', '删除 1 行'],
      ['4 deletions', '删除 4 行']
    ],
    misses: ['No deletions']
  },
  {
    hits: [
      [
        '1,024 additions, 12 deletions not shown because the diff is too large. Please use a local Git client to view these changes.',
        '新增 1,024 行、删除 12 行未显示，因为差异过大。请使用本地 Git 客户端查看这些更改。'
      ]
    ],
    misses: ['Some additions not shown because the diff is too large.']
  },
  // 搜索
  {
    hits: [
      ['1 gist result', '1 个代码片段结果'],
      ['2,345 gist results', '2,345 个代码片段结果']
    ],
    misses: ['gist results']
  },
  {
    hits: [
      ["We couldn’t find any gists matching 'vue'", '未找到与“vue”匹配的代码片段'],
      ["We couldn't find any gists matching 'foo bar'", '未找到与“foo bar”匹配的代码片段']
    ],
    misses: ['We couldn’t find any gists matching vue']
  },
  // 空列表
  {
    hits: [
      ['octocat doesn’t have any public gists yet.', 'octocat 还没有任何公共代码片段。'],
      ["octocat doesn't have any gists yet.", 'octocat 还没有任何代码片段。'],
      ['mona-lisa doesn’t have any forked gists yet.', 'mona-lisa 还没有任何复刻的代码片段。']
    ],
    misses: ['octocat doesn’t have any private gists yet.']
  },
  {
    hits: [
      ['You don’t have any gists yet.', '你还没有任何代码片段。'],
      ["You don't have any starred gists yet.", '你还没有任何已加星标的代码片段。'],
      ['You don’t have any secret gists yet.', '你还没有任何机密代码片段。']
    ],
    misses: ['You don’t have any private gists yet.']
  },
  // 标签页标题
  {
    hits: [
      ['octocat’s gists', 'octocat 的代码片段'],
      ["mona-lisa's gists", 'mona-lisa 的代码片段']
    ],
    misses: ['octocat’s repositories']
  },
  // 标星者列表与个人资料侧栏
  {
    hits: [
      ['Joined on Apr 4, 2016', '2016年4月4日加入'],
      ['Joined on June 22, 2024', '2024年6月22日加入'],
      ['Joined on 4 April 2016', '2016年4月4日加入']
    ],
    misses: ['Joined on 2016', 'Joined GitHub on Apr 4, 2016']
  },
  { hits: [['Works for GitHub', '就职于 GitHub']], misses: ['Works at GitHub'] },
  { hits: [['Is from San Francisco', '来自 San Francisco']], misses: ['Is located in San Francisco'] },
  { hits: [['Organization: @octo-org', '组织：@octo-org']], misses: ['Organizations: @octo-org'] },
  { hits: [['Home location: Berlin', '所在地：Berlin']], misses: ['Home: Berlin'] },
  { hits: [['Email: octocat@example.com', '电子邮件：octocat@example.com']], misses: ['Email: not public'] },
  {
    hits: [
      ['- 15h behind', '- 慢 15小时'],
      ['- 5.5h ahead', '- 快 5.5小时'],
      // 名片脚本按 `${h}h${m}m` 格式化，时与分之间不带空格；带空格的写法同样接受
      ['- 2h30m behind', '- 慢 2小时 30分钟'],
      ['- 5h 30m ahead', '- 快 5小时 30分钟'],
      ['- 30m behind', '- 慢 30分钟']
    ],
    misses: ['- 15 hours behind', '- 2h30 behind']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('gist 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(gist.static?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = gist.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('正则只在 gist 页面生效', () => {
    expect(translate('— forked from', REPO_SCOPE)).toBeUndefined()
    expect(translate('octocat’s gists', REPO_SCOPE)).toBeUndefined()
  })

  it('相邻文本节点拼接后命中', () => {
    const join = (parts: readonly string[]): string => normalizeText(parts.join(''))
    expect(translate(join(['36', ' changes: ', '0', ' additions & ', '36', ' deletions']))).toBe('36 处更改：新增 0 行和删除 36 行')
    expect(translate(join(['octocat', ' doesn’t have any ', 'starred ', 'gists yet.']))).toBe('octocat 还没有任何已加星标的代码片段。')
  })

  it('文件区无障碍名称：三种日期写法都不残留 on', () => {
    for (const date of ['June 25, 2019', '25 June 2019', 'June 2019']) {
      const output = translate(`LICENSE content, created by octocat on 02:10AM on ${date}.`)
      expect(output).toMatch(/^LICENSE 的内容，由 octocat 于 2019年6月/)
      expect(output).not.toMatch(/\bon\b/)
    }
  })

  it('列表计数由 common-ui 翻译，此处不重复', () => {
    const join = (parts: readonly string[]): string => normalizeText(parts.join(''))
    for (const text of ['12 files', '36 forks', '1 comment', '1,234 stars']) {
      expect(translate(text)).toBeUndefined()
    }
    expect(translateFull(join(['\n      12\n      ', 'files\n']))).toBe('12 个文件')
    expect(translateFull('36 forks')).toBe('36 个复刻')
    expect(translateFull('1 comment')).toBe('1 条评论')
    expect(translateFull('1,234 stars')).toBe('1,234 个星标')
  })

  it.each([
    ['with a GIF, JPEG, JPG, MOV, MP4, PNG, SVG, WEBM or WEBP.', '并改用 GIF、JPEG、JPG、MOV、MP4、PNG、SVG、WEBM 或 WEBP 格式的文件。'],
    ['with a GIF, JPEG, or PNG.', '并改用 GIF、JPEG 或 PNG 格式的文件。'],
    ['with a PNG.', '并改用 PNG 格式的文件。']
  ])('评论框附件类型错误片段由 common-ui 翻译：%s', (input, expected) => {
    expect(translate(input)).toBeUndefined()
    expect(translateFull(input)).toBe(expected)
  })
})

describe('gist 静态词条', () => {
  it.each([
    ['Instantly share code, notes, and snippets.', '即时分享代码、笔记和代码片段。'],
    ['All gists', '全部代码片段'],
    ['Create new gist', '新建代码片段'],
    ['Discover gists', '发现代码片段'],
    ['Gist description…', '代码片段描述…'],
    ['Filename including extension', '含扩展名的文件名'],
    ['Filename including extension...', '含扩展名的文件名...'],
    ['Gist description...', '代码片段描述...'],
    ['Create secret gist', '创建机密代码片段'],
    ["Contents can't be empty", '内容不能为空'],
    ['You must be signed in to star a gist', '登录后才能为代码片段加星标'],
    ['Star this gist', '为此代码片段加星标'],
    ['Unstar this gist', '取消此代码片段的星标'],
    ['Be the first to star this gist.', '成为第一个为此代码片段加星标的人。'],
    ['Clone via HTTPS', '通过 HTTPS 克隆'],
    ['Be the first to fork this gist.', '成为第一个复刻此代码片段的人。'],
    ['Create gist', '创建代码片段'],
    ['Select a type of Gist', '选择代码片段类型'],
    ['Your public gists will show up here on your profile.', '你的公共代码片段会显示在这里。'],
    ['Create public gist', '创建公共代码片段'],
    ['Make secret', '设为机密'],
    ['Make public', '设为公共']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('\n  Starred gists  ', GIST_SCOPE)).toBe('\n  已加星标的代码片段  ')
  })
})

describe('gist 页面专用词条', () => {
  it.each([
    ['Yours', '你的'],
    ['Forked', '已复刻'],
    ['Secret', '机密'],
    ['Raw', '原始'],
    ['Revisions', '修订'],
    ['Stargazers', '标星者'],
    ['Recently created', '最近创建'],
    ['Fewest stars', '星标最少'],
    ['Created', '创建于'],
    ['Last active', '最后活跃于'],
    ['What would you like to do?', '你想做什么？'],
    ['Editing', '正在编辑'],
    ['Load earlier comments…', '加载更早的评论…'],
    ['Load earlier comments...', '加载更早的评论...'],
    [
      'Sign up for free to join this conversation on GitHub. Already have an account? Sign in to comment',
      '免费注册以加入 GitHub 上的此对话。已有帐户？登录后评论'
    ],
    ['This user is the author of this .', '此用户是此代码片段的作者。'],
    ['revised', '修订'],
    ['this gist', '此代码片段于'],
    ['No changes.', '无更改。'],
    ['Search this file…', '搜索此文件…'],
    ['Social account', '社交帐户'],
    ['Remove File', '删除文件'],
    ['Site wide shortcuts', '全站快捷方式'],
    ['Enter file contents here', '在此输入文件内容'],
    ['No changes to display.', '无可显示的更改。'],
    ['Commit email:', '提交电子邮件：']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('编辑器读屏提示被 <kbd> 拆开时按片段翻译', () => {
    expect(matcher.translateRaw('Use ', GIST_SCOPE)).toBe('使用 ')
    expect(matcher.translateRaw(' key moving focus.', GIST_SCOPE)).toBe(' 键是否移动焦点。')
    expect(translate('Use', REPO_SCOPE)).toBeUndefined()
    // to toggle the 与第二句（Alternatively, use … to move to the next interactive element…）由 code 词典的 static 收录
    for (const key of ['to toggle the', 'key moving focus. Alternatively, use', 'to move to the next interactive element on the page.']) {
      expect(gist.scoped?.[key]).toBeUndefined()
      expect(gist.static?.[key]).toBeUndefined()
    }
  })

  it('不影响其他页面', () => {
    expect(translate('Raw', REPO_SCOPE)).toBeUndefined()
    expect(translate('Recently created', REPO_SCOPE)).toBeUndefined()
    expect(translate('Secret', REPO_SCOPE)).toBeUndefined()
    expect(translate('Editing', REPO_SCOPE)).toBeUndefined()
  })

  it('不重复收录 common-ui 与其他词典 static 已有的词条', () => {
    for (const key of [
      'Star',
      'Unstar',
      'Fork',
      'Edit',
      'Delete',
      'Public',
      'Author',
      'Owner',
      'Try again',
      'Download ZIP',
      'Least recently updated',
      'Show hidden characters',
      'Unable to load this preview, sorry.',
      'Forked from',
      'forked from',
      '— forked from',
      'Sign up for free',
      'to join this conversation on GitHub',
      '. Already have an account?',
      'Sign in to comment'
    ]) {
      expect(gist.scoped?.[key]).toBeUndefined()
      expect(gist.static?.[key]).toBeUndefined()
    }
  })

  it('通用按钮与评论入口片段由 common-ui 翻译', () => {
    expect(translateFull('Star')).toBe('星标')
    expect(translateFull('Fork')).toBe('复刻')
    expect(translateFull('Edit')).toBe('编辑')
    expect(translateFull('Delete')).toBe('删除')
    expect(translateFull('Try again')).toBe('重试')
    expect(translateFull('Sign up for free')).toBe('免费注册')
    expect(translateFull('to join this conversation on GitHub')).toBe('以加入 GitHub 上的此对话')
    expect(translateFull('. Already have an account?')).toBe('。已有帐户？')
    expect(translateFull('Sign in to comment')).toBe('登录后评论')
  })
})

describe('gist 忽略选择器', () => {
  it('只在 gist 页面生效', () => {
    const selectors = matcher.ignoreSelectors(GIST_SCOPE)
    expect(selectors).toContain('[itemprop="about"]')
    expect(selectors).toContain('.gist-blob-name')
    expect(matcher.ignoreSelectors(REPO_SCOPE)).toEqual([])
  })

  it.each(gist.ignore ?? [])('选择器合法：%s', selector => {
    expect(() => document.querySelector(selector)).not.toThrow()
  })

  it('用户内容被选中', () => {
    document.body.innerHTML = `
      <div class="gist-snippet-meta">
        <span class="f6 color-fg-muted">Docker compose notes</span>
        <strong class="css-truncate-target">docker-compose.yml</strong>
      </div>
      <div itemprop="about">My shell helpers</div>
      <strong class="gist-blob-name">bash</strong>
      <span class="Truncate"><span class="Truncate-text" aria-hidden="true">octocat</span></span>
      <div class="user-status-message-wrapper"><div>Always Coding :)</div></div>
    `
    const selector = matcher.ignoreSelectors(GIST_SCOPE).join(', ')
    const texts = [...document.querySelectorAll(selector)].map(node => node.textContent?.trim())
    expect(texts).toEqual(['Docker compose notes', 'docker-compose.yml', 'My shell helpers', 'bash', 'octocat', 'Always Coding :)'])
    document.body.innerHTML = ''
  })

  it('界面文字不被误选', () => {
    document.body.innerHTML = `
      <div class="d-inline-block px-lg-2 px-0">
        <div class="color-fg-muted f6">Last active</div>
      </div>
      <span class="Button-label">Raw</span>
      <li class="Box-row"><span class="Label">Modified</span></li>
    `
    const selector = matcher.ignoreSelectors(GIST_SCOPE).join(', ')
    expect(document.querySelectorAll(selector)).toHaveLength(0)
    document.body.innerHTML = ''
  })
})
