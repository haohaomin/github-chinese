import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import releases from '../../../src/locales/zh-CN/releases'
import repository from '../../../src/locales/zh-CN/repository'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = releases

const matcher = createMatcher([['releases', releases]])

/** 发行版与标记页的作用域：common → repository → releases */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'releases']

function translate(text: string): string | undefined {
  return matcher.translate(text, [...SCOPE])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 屏幕阅读器标题
  {
    hits: [
      ['Releases: octo-org/hello-world', '发行版：octo-org/hello-world'],
      ['Releases: octocat/Hello-World', '发行版：octocat/Hello-World']
    ],
    misses: ['Releases: octo-org']
  },
  { hits: [['Tags: octo-org/hello-world', '标签：octo-org/hello-world']], misses: ['Tags: hello-world'] },
  // 隐藏的页面标题
  {
    hits: [
      ['Releases · octo-org/hello-world', '发行版 · octo-org/hello-world'],
      ['Tags · octocat/Hello-World', '标签 · octocat/Hello-World']
    ],
    misses: ['Issues · octo-org/hello-world']
  },
  // 标签页标题段
  {
    hits: [
      ['Release v3.5.0', '发行版 v3.5.0'],
      ['Release 1.2.3-beta.1', '发行版 1.2.3-beta.1']
    ],
    misses: ['Release GitHub CLI 2.103.2', 'Release notes draft']
  },
  {
    hits: [
      ['to main since this release', '在此发行版之后进入 main'],
      ['to release/3.x since this release', '在此发行版之后进入 release/3.x']
    ],
    misses: ['since this release']
  },
  // 资产
  { hits: [['Show all 25 assets', '显示全部 25 个资产']], misses: ['Show all assets'] },
  {
    hits: [
      ['Copy to clipboard digest for gh_2.103.2_linux_386.deb', '复制 gh_2.103.2_linux_386.deb 的摘要到剪贴板'],
      ['Copy to clipboard digest for GitHub CLI 2.103.2 checksums', '复制 GitHub CLI 2.103.2 checksums 的摘要到剪贴板']
    ],
    misses: ['Copy to clipboard digest for']
  },
  { hits: [['Remove attached binary app.zip', '删除附加的二进制文件 app.zip']], misses: ['Remove attached binaries'] },
  // 贡献者
  {
    hits: [
      ['octocat and hubot', 'octocat 和 hubot'],
      ['dependabot[bot] and octocat', 'dependabot[bot] 和 octocat']
    ],
    misses: ['and hubot']
  },
  {
    hits: [
      ['octocat, hubot, and 8 other contributors', 'octocat、hubot 和另外 8 个贡献者'],
      ['octocat, hubot, monalisa, and 1 other contributor', 'octocat、hubot、monalisa 和另外 1 个贡献者']
    ],
    misses: ['and 8 other contributors']
  },
  {
    hits: [
      ['octocat, hubot, and monalisa', 'octocat、hubot 和 monalisa'],
      ['a-b, c[bot], and d', 'a-b、c[bot] 和 d']
    ],
    misses: ['octocat, and']
  },
  // 标记页
  {
    hits: [
      ["Toggle v3.6.0-rc.13's commit message", '切换 v3.6.0-rc.13 的提交消息'],
      ['Toggle v1.0’s commit message', '切换 v1.0 的提交消息']
    ],
    misses: ['Toggle v1.0 commit message']
  },
  // 编辑 / 删除按钮
  { hits: [['Edit: v1.0.0', '编辑：v1.0.0']], misses: ['Edit:'] },
  { hits: [['Delete: v1.0.0', '删除：v1.0.0']], misses: ['Delete:'] },
  { hits: [['Edit v1.0.0', '编辑 v1.0.0']], misses: ['Edit v1.0.0 notes'] },
  {
    hits: [['This will delete the information for the release v1.0.0.', '这将删除发行版 v1.0.0 的信息。']],
    misses: ['This will delete the information for the release.']
  },
  {
    hits: [
      ['There are no releases containing "foo".', '没有包含“foo”的发行版。'],
      ['There are no releases containing “v9”.', '没有包含“v9”的发行版。']
    ],
    misses: ['There are no releases.']
  },
  // 发布表单：标记选择
  { hits: [['v2.0.0 will be created on publish', 'v2.0.0 将在发布时创建']], misses: ['will be created on publish'] },
  {
    hits: [['v1.0.0 is used by another release', 'v1.0.0 已被其他发行版使用']],
    misses: ['is used by another release']
  },
  {
    hits: [['v1.0.0 is used by an immutable release and cannot be reused', 'v1.0.0 已被不可变发行版使用且无法再次使用']],
    misses: ['is used by an immutable release and cannot be reused', 'v1.0.0 is used by an immutable release']
  },
  // 发布表单：标记与上一个标记按钮的无障碍名称
  {
    hits: [
      ['Tag: v1.0.0', '标签：v1.0.0'],
      ['Tag: release/2026-10', '标签：release/2026-10']
    ],
    misses: ['Tag:v1.0.0']
  },
  { hits: [['Previous tag: v0.9.0', '上一个标签：v0.9.0']], misses: ['Previous tag:v0.9.0'] },
  // 发布表单：提交失败
  {
    hits: [
      [
        "There was an error creating your Release: tag name can't be blank, tag name is not well-formed, published releases must have a valid tag.",
        '创建发行版时出错：标签名称不能为空，标签名称格式不正确，已发布的发行版必须有有效的标签。'
      ],
      ['There was an error creating your Release: tag name is not well-formed.', '创建发行版时出错：标签名称格式不正确。']
    ],
    misses: [
      'There was an error creating your Release: target is invalid.',
      'There was an error creating your Release: tag name is not well-formed'
    ]
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('releases 正则词条', () => {
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
})

describe('releases 静态词条', () => {
  it.each([
    ['Find a release', '查找发行版'],
    ['Draft a new release', '起草新发行版'],
    ['Release list', '发行版列表'],
    ['Jump to release', '跳转到发行版'],
    ['Choose a tag to compare', '选择要比较的标签'],
    ['There aren’t any releases here', '暂无发行版'],
    // …供他人使用。有关发行版的更多信息请参阅 <文档>（末句原文无逗号，译文不加）
    [
      'You can create a release to package software, along with release notes and links to binary files, for other people to use. Learn more about releases in',
      '你可以创建发行版来打包软件，并附上发行说明和二进制文件链接，供他人使用。有关发行版的更多信息请参阅'
    ],
    ['our docs', '文档'],
    ['tagging specific points of history', '给存储库历史记录中的特定节点打标签'],
    // 实现。适合标记发行节点如 <v0.2.0> 或 <v1.0.0>。（原文无逗号，译文不加）
    ['in a repository. They’re great for marking release points like', '实现。适合标记发行节点如'],
    ['released this', '发布于'],
    ['Immutable', '不可变'],
    ['release. Only release title and notes can be modified.', '发行版。只能修改发行版标题和说明。'],
    ['Verified commit signature', '已验证的提交签名'],
    ['Assets', '资产'],
    ['Release attestation', '发行版证明'],
    ['Delete this release?', '删除此发行版？'],
    ['Discard draft', '放弃草稿'],
    ['This will delete the information for the tag', '这将删除标签'],
    ['and cannot be undone.', '的信息且无法撤销。'],
    // 原文无逗号，译文不加
    ['This will delete the information for this tag and cannot be undone.', '这将删除此标签的信息且无法撤销。'],
    ['Delete tag', '删除标签'],
    ['Toggle commit message', '切换提交消息'],
    ['Choose a tag', '选择标签'],
    ['Find or create a new tag', '查找或创建新标签'],
    ['Loading tag information...', '正在加载标签信息...'],
    ['Loading tag information…', '正在加载标签信息…'],
    ['Target:', '目标：'],
    ['Filter branches...', '筛选分支...'],
    ['Release title', '发行版标题'],
    ['Previous tag', '上一个标签'],
    ['Generate release notes', '生成发行说明'],
    ['Describe this release', '描述此发行版'],
    ['Attach binaries by dropping them here or selecting them.', '将二进制文件拖放到此处或选择文件以附加。'],
    ['Set as a pre-release', '设为预发行版'],
    ['Set as the latest release', '设为最新发行版'],
    ['Release label', '发行版标签'],
    ['Create a discussion for this release', '为此发行版创建讨论'],
    ['Publish release', '发布发行版'],
    ['Save draft', '保存草稿'],
    ['Update release', '更新发行版'],
    ['Publishing…', '发布中…'],
    ['Publishing...', '发布中...'],
    ['Saving release...', '正在保存发行版...'],
    ['Source code (zip)', '源代码 (zip)'],
    ['Source code (tar.gz)', '源代码 (tar.gz)'],
    ['This tag was signed with the tagger’s', '此标签使用打标签者的'],
    ["This tag was signed with the committer's", '此标签使用提交者的'],
    ['Tag cannot be blank', '标签不能为空'],
    // 「X. Please try again.」句号随原文，不并成逗号句
    ['Unable to validate tag name. Please try again.', '无法验证标签名称。请重试。'],
    [
      'Creating a tag with the same name as a branch can cause ambiguity when selecting refs',
      '创建与分支同名的标签可能导致选择引用时产生歧义'
    ],
    ['Tag: Select tag', '标签：选择标签'],
    ['Previous tag: Auto', '上一个标签：自动'],
    ['Tag name unavailable', '标签名称不可用'],
    ['Branch with this tag name already exists', '已存在与此标签同名的分支'],
    ['Release description', '发行版描述'],
    ['Remove attached binary', '删除附加的二进制文件'],
    ['Uploading your file now…', '正在上传文件…'],
    ['Uploading your file now...', '正在上传文件...'],
    ['Too many assets. Releases are limited to 1000 assets.', '资产过多。每个发行版最多 1000 个资产。'],
    ['with a file smaller than 2GB.', '并改用小于 2GB 的文件。'],
    ['A draft of this release has been saved!', '此发行版的草稿已保存！'],
    ['This is a draft and won’t be seen by the public unless it’s published.', '这是发布前不会公开的草稿。'],
    ['This will delete the information for the release', '这将删除发行版'],
    ['Release Action', '发布操作'],
    // 产品名译中文：GitHub Marketplace → GitHub 市场
    ['Publish this release to the GitHub Marketplace', '将此发行版发布到 GitHub 市场'],
    ['Publish this Action to the GitHub Marketplace', '将此操作发布到 GitHub 市场'],
    ['accept the GitHub Marketplace Developer Agreement', '接受 GitHub 市场开发人员协议'],
    ['before publishing an Action.', '才能发布操作。'],
    [
      'Your Action will be discoverable in the Marketplace and available in GitHub search.',
      '你的操作将可在市场中被发现并出现在 GitHub 搜索结果中。'
    ],
    // 两句原文用句号分开，译文不并成逗号句
    [
      '- Name must be unique. Cannot match an existing action, user or organization name.',
      '- 名称必须唯一。不能与现有操作、用户或组织名称相同。'
    ],
    ['— optional', '— 可选']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('静态词条优先于贡献者正则', () => {
    // “Releases and Tags”形如“a and b”，由 static 先行命中
    expect(translate('Releases and Tags')).toBe('发行版和标签')
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('\n    released this\n  ', [...SCOPE])).toBe('\n    发布于\n  ')
  })
})

describe('releases 页面词条', () => {
  it.each([
    ['Pre-release', '预发行版'],
    ['Source code', '源代码'],
    ['Notes', '说明'],
    ['Revoked', '已撤销'],
    ['Target', '目标'],
    ['Full Changelog', '完整更新日志'],
    ['You must', '你必须先'],
    // 发行说明编辑器的已保存回复为空：You can create one in your <a>settings</a>.
    ['settings', '设置'],
    ['Category:', '类别：'],
    ['Announcements', '公告'],
    ['Q&A', '问答']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('common-ui 已收录的通用词条不重复收录', () => {
    for (const text of ['Commit', 'Verified', 'Unverified', 'Partially verified', 'Expired', 'Saved!', 'Read more']) {
      expect(dict.static?.[text]).toBeUndefined()
      expect(dict.scoped?.[text]).toBeUndefined()
    }
  })

  it('repository 已按页面收录的词条不重复收录（发行版页作用域含 repository）', () => {
    expect(dict.static?.['Tag name']).toBeUndefined()
    expect(dict.scoped?.['Tag name']).toBeUndefined()
    // 新建标记对话框输入框的无障碍名称在发行版页仍由 repository 词典译出
    const withRepository = createMatcher([
      ['repository', repository],
      ['releases', releases]
    ])
    expect(withRepository.translate('Tag name', [...SCOPE])).toBe('标签名称')
  })

  it('页面词条优先于贡献者正则', () => {
    expect(translate('Show and tell')).toBe('展示与分享')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Pre-release', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Notes', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('settings', ['common', 'repository', 'code'])).toBeUndefined()
    expect(matcher.translate('octocat and hubot', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Release v3.5.0', ['common', 'repository', 'commits'])).toBeUndefined()
    expect(matcher.translate('Tag: v1.0.0', ['common', 'repository', 'commits'])).toBeUndefined()
  })
})

describe('发行版表单：标签选择按钮与编辑页标题', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 标签选择按钮：灰色的字段名（React 渲染成「字段名」「:」两段文字）与值；textClass 为两种写法的类名之一 */
  function refButton(id: string, field: string, value: string, textClass: string): string {
    return `
      <button id="${id}" type="button" aria-label="${field}: ${value}">
        <span class="prc-Button-Label-FWkx3"><div class="ref-selector-button-text-container">
          <span class="${textClass}"><span class="fgColor-muted">${field}:</span><span>${value}</span></span>
        </div></span>
      </button>`
  }

  function start(html: string): void {
    document.body.innerHTML = html
    for (const label of document.querySelectorAll('.fgColor-muted')) {
      const text = label.firstChild as Text
      text.splitText(text.data.length - 1)
    }
    translator = createTranslator({
      matcher: createMatcher([
        ['repository', repository],
        ['releases', releases]
      ]),
      host: window,
      resolvePages: () => ['repository', 'releases']
    })
    translator.start()
  }

  const field = (id: string): string | undefined => document.querySelector(`#${id} .fgColor-muted`)?.textContent ?? undefined
  const value = (id: string): string | undefined => document.querySelector(`#${id} .fgColor-muted + span`)?.textContent ?? undefined

  it.each(['RefSelectorText__DKi677', 'RefSelectorAnchoredOverlay-module_zwGJlW_RefSelectorText'])(
    '新建页（%s）：字段名与未选择时的值译出',
    textClass => {
      start(
        refButton('ref-picker-releases-tag', 'Tag', 'Select tag', textClass) +
          refButton('ref-picker-releases-previous-tag', 'Previous tag', 'Auto', textClass)
      )
      expect(field('ref-picker-releases-tag')).toBe('标签：')
      expect(value('ref-picker-releases-tag')).toBe('选择标签')
      expect(field('ref-picker-releases-previous-tag')).toBe('上一个标签：')
      expect(value('ref-picker-releases-previous-tag')).toBe('自动')
      expect(document.getElementById('ref-picker-releases-tag')?.getAttribute('aria-label')).toBe('标签：选择标签')
      expect(document.getElementById('ref-picker-releases-previous-tag')?.getAttribute('aria-label')).toBe('上一个标签：自动')
    }
  )

  it.each(['RefSelectorText__DKi677', 'RefSelectorAnchoredOverlay-module_zwGJlW_RefSelectorText'])(
    '编辑页（%s）：标题与字段名译出，标签名、目标分支名保持原文（与词条同形也不译）',
    textClass => {
      start(
        `<div class="Subhead"><h1 class="Subhead-heading"><strong>Edit v1.0.0</strong></h1></div>` +
          refButton('ref-picker-releases-tag', 'Tag', 'Latest', textClass) +
          refButton('ref-picker-releases-target', 'Target', 'Latest', textClass) +
          refButton('ref-picker-releases-previous-tag', 'Previous tag', 'v0.9.0', textClass)
      )
      expect(document.querySelector('h1')?.textContent).toBe('编辑 v1.0.0')
      expect(field('ref-picker-releases-tag')).toBe('标签：')
      expect(value('ref-picker-releases-tag')).toBe('Latest')
      expect(field('ref-picker-releases-target')).toBe('目标：')
      expect(value('ref-picker-releases-target')).toBe('Latest')
      expect(field('ref-picker-releases-previous-tag')).toBe('上一个标签：')
      expect(value('ref-picker-releases-previous-tag')).toBe('v0.9.0')
    }
  )

  it('选择上一个标签后显示标签名，不再按占位文字翻译', async () => {
    start(refButton('ref-picker-releases-previous-tag', 'Previous tag', 'Auto', 'RefSelectorText__DKi677'))
    const node = document.querySelector('#ref-picker-releases-previous-tag .fgColor-muted + span')!.firstChild as Text
    expect(node.data).toBe('自动')
    node.data = 'Latest'
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(value('ref-picker-releases-previous-tag')).toBe('Latest')
  })
})

describe('releases 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('跳转菜单中的发行版名被忽略，菜单按钮不被忽略', () => {
    document.body.innerHTML = `
      <button id="jump"><span class="Button-label">Jump to release</span></button>
      <ul role="menu">
        <li role="none">
          <a id="item" href="#release-v1.2.3" role="menuitem"><span class="ActionListItem-label">Release 1.2.3</span></a>
        </li>
      </ul>
    `
    const ignored = (dict.ignore ?? []).join(', ')
    expect(document.querySelector('#item')?.matches(ignored)).toBe(true)
    expect(document.querySelector('#jump')?.matches(ignored)).toBe(false)
    expect(matcher.ignoreSelectors([...SCOPE])).toContain('a[href^="#release-"]')
  })
})
