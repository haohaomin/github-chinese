import { describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { createMatcher } from '../../../src/core/matcher'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import discussions from '../../../src/locales/zh-CN/discussions'
import { categoryName, withCategory } from '../../../src/locales/zh-CN/discussions/categories'
import { commentTime } from '../../../src/locales/zh-CN/discussions/list'
import issues from '../../../src/locales/zh-CN/issues'
import notifications from '../../../src/locales/zh-CN/notifications'
import pulls from '../../../src/locales/zh-CN/pulls'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = discussions

const matcher = createMatcher([['discussions', discussions]])

/** 存储库讨论页的作用域：common → repository → discussions */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'discussions']

function translate(text: string): string | undefined {
  return matcher.translate(text, [...SCOPE])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按合并后的正则顺序排列（list → viewer → compose → categories），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // list：列表页标题（屏幕阅读器）
  {
    hits: [
      ['octo-org hello-world.js Discussions', 'octo-org/hello-world.js 的讨论'],
      ['octo-org octo-org Discussions', 'octo-org/octo-org 的讨论']
    ],
    misses: ['Explore GitHub Discussions', 'Set up Discussions']
  },
  {
    hits: [
      ['octo-org hello-world.js Help Discussions', 'octo-org/hello-world.js 的帮助讨论'],
      ['octo-org hello-world.js Build Error Report Discussions', 'octo-org/hello-world.js 的 Build Error Report 讨论']
    ],
    misses: ['Learn about using GitHub Discussions', 'Turn on GitHub Discussions']
  },
  // list：类别页的页面标题段（只翻译默认类别名）
  {
    hits: [
      ['octo-org/hello-world.js Polls', 'octo-org/hello-world.js 投票'],
      ['acme/app Q&A', 'acme/app 问答']
    ],
    misses: ['octo-org/hello-world.js RFC', 'hello-world.js Polls']
  },
  // list：类别页的置顶讨论标题（类别名原文不带引号，译文也不加）
  {
    hits: [
      ['Pinned to Announcements', '置顶于公告'],
      ['Pinned to RFC', '置顶于 RFC']
    ],
    misses: ['Pinned to']
  },
  // list：筛选
  {
    hits: [
      ['Filter: Open', '筛选器：打开'],
      ['Filter: Unanswered', '筛选器：未回答'],
      ['Filter: Open, Answered', '筛选器：打开、已回答']
    ],
    misses: ['Filter: Draft', 'Filter: Open, Draft']
  },
  // list：列表项无障碍名称
  {
    hits: [
      ['Ideas (category)', '想法（类别）'],
      ['RFC (category)', 'RFC（类别）']
    ],
    misses: ['(category)']
  },
  { hits: [['octocat (author)', 'octocat（作者）']], misses: ['Jane Doe (author)'] },
  { hits: [['mona (participant)', 'mona（参与者）']], misses: ['the participant'] },
  { hits: [['Upvote: 233', '赞成：233']], misses: ['Upvote: many'] },
  // list：登录后列表项的屏幕阅读器文字
  {
    hits: [
      ['General · #527 was created by octocat on January 08, 2025 23:53', '常规 · #527 由 octocat 于 2025年1月8日 23:53 创建'],
      [
        'Other Feature Feedback, Questions, & Ideas · #7 was created by mona on May 14, 2026 14:50',
        'Other Feature Feedback, Questions, & Ideas · #7 由 mona 于 2026年5月14日 14:50 创建'
      ]
    ],
    misses: ['General · #527 was created by octocat', 'General #527 was created by octocat on January 08, 2025 23:53']
  },
  // list：评论数链接
  {
    hits: [
      ['12 comments: octocat, 11:34PM on September 06', '12 条评论：octocat，9月6日 23:34'],
      ['0 comments: mona, 01:59AM today', '0 条评论：mona，今天 1:59'],
      ['3 comments: octo-user, 11:51PM yesterday', '3 条评论：octo-user，昨天 23:51'],
      ['2013 comments: mona, 12:37PM on February 22, 2020', '2013 条评论：mona，2020年2月22日 12:37'],
      ['1 comment: octocat, 12:05AM today', '1 条评论：octocat，今天 0:05']
    ],
    misses: ['12 comments: octocat', '12 comments']
  },
  // list：计数（N comments、N replies、N participants 由 common-ui 翻译）
  {
    hits: [
      ['3 new comments', '3 条新评论'],
      ['1 new comment', '1 条新评论']
    ],
    misses: ['new comments']
  },
  {
    hits: [
      ['5 upvotes', '5 票赞成'],
      ['1 upvote', '1 票赞成']
    ],
    misses: ['upvotes']
  },
  { hits: [['2 answers', '2 个回答']], misses: ['answers'] },
  {
    hits: [
      ['3 suggested answers', '3 个建议答案'],
      ['1 new suggested answer', '1 个新的建议答案']
    ],
    misses: ['suggested answers']
  },
  // viewer：详情
  { hits: [['Answered by monalisa', '回答者 monalisa']], misses: ['Answered by two people'] },
  {
    hits: [
      ['Status: Closed as resolved', '状态：已关闭为已解决'],
      ['Status: Closed as outdated', '状态：已关闭为过时'],
      ['Status: Closed as duplicate', '状态：已关闭为重复']
    ],
    misses: ['Status: Closed as completed', 'Status: Closed']
  },
  {
    hits: [
      // 原文没有括号：日期放进句中；原文有句点才加句号
      ['This discussion was converted from issue #123 on January 5, 2024', '此讨论于 2024年1月5日由议题 #123 转换而来'],
      ['This discussion was converted from issue #7 on Jan 5, 2024.', '此讨论于 2024年1月5日由议题 #7 转换而来。'],
      ['This discussion was converted from issue #42.', '此讨论由议题 #42 转换而来。']
    ],
    misses: ['This discussion was converted from issue #abc']
  },
  { hits: [['This user is sponsoring octo-org.', '此用户正在赞助 octo-org。']], misses: ['This user is sponsoring'] },
  {
    hits: [
      [
        "Congratulations, you've created the first discussion in octo-org/hello-world!",
        '恭喜，你已在 octo-org/hello-world 中创建了第一个讨论！'
      ],
      ['Congratulations, you’ve created the first discussion in acme!', '恭喜，你已在 acme 中创建了第一个讨论！']
    ],
    misses: ['Congratulations!']
  },
  // viewer：登录后评论的按钮名称
  {
    hits: [
      ['Upvote: (86): octocat, 09:00AM on May 12, 2022', '赞成 (86)：octocat，2022年5月12日 9:00'],
      ['Upvote: (1,024): mona, 11:30PM yesterday', '赞成 (1,024)：mona，昨天 23:30']
    ],
    misses: ['Upvote: (86)']
  },
  {
    hits: [['Write a reply: octocat, 01:16PM today', '编写回复：octocat，今天 13:16']],
    misses: ['Write a reply: octocat']
  },
  // viewer：投票
  {
    hits: [
      ['2 votes', '2 票'],
      ['1 vote', '1 票'],
      ['2k votes', '2k 票'],
      ['1.5k votes', '1.5k 票']
    ],
    misses: ['votes', 'many votes']
  },
  // viewer：回复
  {
    hits: [
      ['Show 77 previous replies', '显示前 77 条回复'],
      ['Show 1 previous reply', '显示前 1 条回复']
    ],
    misses: ['Show previous replies']
  },
  { hits: [['Show 3 more replies', '再显示 3 条回复']], misses: ['Show more replies'] },
  // viewer：置顶（类别名原文不带引号，译文也不加）
  {
    hits: [['Discussion "Roadmap" has been unpinned.', '已取消置顶讨论“Roadmap”。']],
    misses: ['Discussion "" has been unpinned.']
  },
  {
    hits: [
      ['Discussion pinned to Announcements', '已将讨论置顶到公告'],
      ['Discussion pinned to RFC', '已将讨论置顶到 RFC']
    ],
    misses: ['Discussion pinned']
  },
  { hits: [['Discussion unpinned from Q&A', '已从问答取消置顶讨论']], misses: ['Discussion unpinned'] },
  { hits: [['Pin discussion to General', '将讨论置顶到常规']], misses: ['Pin discussion to'] },
  {
    hits: [
      ['Pin to Ideas', '置顶到想法'],
      ['Pin to RFC', '置顶到 RFC']
    ],
    misses: ['Pin to']
  },
  {
    hits: [
      ['This will pin this discussion to the top of the Polls category.', '这会在投票类别中置顶此讨论。'],
      ['This will pin this discussion to the top of the RFC category.', '这会在 RFC 类别中置顶此讨论。']
    ],
    misses: ['This will pin this discussion.']
  },
  {
    hits: [['Are you sure you want to unpin this discussion from Show and tell?', '确定要从展示与分享取消置顶此讨论吗？']],
    misses: ['Are you sure you want to unpin this discussion from?']
  },
  // viewer：页面标题段
  { hits: [['Discussion #100709', '讨论 #100709']], misses: ['Discussion #abc'] },
  // compose：选择类别页的按钮名称
  {
    hits: [
      ['Get started with Q&A category', '开始使用问答类别'],
      ['Get started with RFC category', '开始使用 RFC 类别']
    ],
    misses: ['Get started with category']
  },
  // compose：投票选项输入框
  { hits: [['Option 3', '选项 3']], misses: ['Option three'] },
  // categories：类别管理（类别名、分组名原文不带引号，译文也不加）
  {
    hits: [
      ['6 categories', '6 个类别'],
      ['1 category', '1 个类别']
    ],
    misses: ['categories']
  },
  {
    hits: [
      ['Edit Announcements category', '编辑公告类别'],
      ['Edit RFC category', '编辑 RFC 类别']
    ],
    misses: ['Edit categories']
  },
  { hits: [['Delete Polls category', '删除投票类别']], misses: ['Delete categories'] },
  { hits: [['Edit section Ask for help', '编辑分组 Ask for help']], misses: ['Edit sections'] },
  { hits: [['Delete section Community', '删除分组 Community']], misses: ['Delete sections'] },
  { hits: [['Delete Community section', '删除 Community 分组']], misses: ['Delete this'] },
  {
    hits: [
      // 原文带引号的才用“”
      ['Category "Ideas" has been created.', '“想法”类别已创建。'],
      ['Category RFC has been deleted.', 'RFC 类别已删除。']
    ],
    misses: ['Category has been created.']
  },
  {
    hits: [
      ['Section "Community" has been updated.', '“Community”分组已更新。'],
      ['Section Community has been deleted.', 'Community 分组已删除。']
    ],
    misses: ['Section has been updated.']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('discussions 正则词条', () => {
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

  it('以“Discussions”结尾的界面文字走精确词条，不被列表页标题规则误译', () => {
    // 产品名译成中文：GitHub Discussions → GitHub 讨论
    expect(translate('Get started with GitHub Discussions')).toBe('开始使用 GitHub 讨论')
    expect(translate('Get Started With GitHub Discussions')).toBe('开始使用 GitHub 讨论')
    expect(translate('Communities using Discussions')).toBe('使用讨论的社区')
    expect(translate('Pinned Discussions')).toBe('置顶讨论')
  })

  it('被元素隔开的片段单独命中', () => {
    // <用户> started <relative-time> in <类别>
    expect(translate('started')).toBe('发起于')
    expect(translate('asked')).toBe('提问于')
    expect(translate('announced')).toBe('发布于')
    expect(translate('in')).toBe('位于')
    // <用户> started this conversation in <类别>
    expect(translate('started this conversation in')).toBe('发起对话于')
    // Answered by <用户>（头部状态里 Answered 与 by 是不同元素；Answered 由 common-ui 翻译）
    expect(translate('by')).toBe('回答者')
    expect(translate('Answered by')).toBe('回答者')
    // Other users <strong>can’t add new comments</strong> to this discussion.
    expect(translate('Other users')).toBe('其他用户')
    expect(translate('can’t add new comments')).toBe('将无法')
    expect(translate('to this discussion.')).toBe('向此讨论添加新评论。')
    // Use <kbd>alt</kbd> + <kbd>click/return</kbd> to exclude labels.（整句匹配，片段兜底）
    expect(translate('Use alt + click/return to exclude labels.')).toBe('使用 alt + click/return 排除标签。')
    expect(translate('Use')).toBe('使用')
    expect(translate('to exclude labels.')).toBe('排除标签。')
    // You can open a <a>new discussion</a> to ask questions about this repository or get help.（原文无逗号，译文不加）
    expect(translate('You can open a')).toBe('你可以发起一个')
    expect(translate('new discussion')).toBe('新讨论')
    expect(translate('to ask questions about this repository or get help.')).toBe('来询问有关此存储库的问题或寻求帮助。')
    // If this doesn’t look right you can <a>choose a different category.</a>（原文无逗号，译文不加）
    expect(translate('If this doesn’t look right you can')).toBe('类别不合适时可以')
    expect(translate('choose a different category.')).toBe('选择其他类别。')
  })
})

describe('discussions 时间与类别名工具', () => {
  it('评论时间转为 24 小时制，小时不补零', () => {
    expect(commentTime('11:34PM on September 06')).toBe('9月6日 23:34')
    expect(commentTime('12:05AM today')).toBe('今天 0:05')
    expect(commentTime('12:37PM yesterday')).toBe('昨天 12:37')
    expect(commentTime('noon')).toBe('noon')
  })

  it('默认类别译为中文，其余类别名与原型链键原样保留', () => {
    expect(categoryName('Ideas')).toBe('想法')
    expect(categoryName('Show and tell')).toBe('展示与分享')
    expect(categoryName('RFC')).toBe('RFC')
    expect(categoryName('constructor')).toBe('constructor')
    expect(categoryName('__proto__')).toBe('__proto__')
  })

  it('类别名嵌入中文时不加引号，与英文之间补空格', () => {
    expect(withCategory('置顶到', 'Polls')).toBe('置顶到投票')
    expect(withCategory('置顶到', 'RFC')).toBe('置顶到 RFC')
    expect(withCategory('编辑', 'Show and tell', '类别')).toBe('编辑展示与分享类别')
    expect(withCategory('编辑', 'Build Error Report', '类别')).toBe('编辑 Build Error Report 类别')
  })
})

describe('discussions 静态词条', () => {
  it.each([
    ['New discussion', '新建讨论'],
    [
      'Integrate with your existing workflows and GitHub Actions via the GraphQL API and webhooks.',
      '通过 GraphQL API 和 Web 钩子与现有工作流及 GitHub 操作集成。'
    ],
    ['Search all discussions', '搜索所有讨论'],
    ['View all discussions', '查看所有讨论'],
    ['You must be logged in to vote', '登录后才能投票'],
    ["There aren't any discussions.", '暂无讨论。'],
    ['Start a new discussion', '开始新讨论'],
    ['Select a discussion category', '选择讨论类别'],
    ['Start discussion', '开始讨论'],
    ['Start poll', '开始投票'],
    ['Discussion title', '讨论标题'],
    ['Poll question', '投票问题'],
    ['Mark as answer', '标记为答案'],
    ['Unmark as answer', '取消标记为答案'],
    ['View full answer', '查看完整回答'],
    ['Answer selected by', '答案选定者'],
    ['Suggest an answer', '提出答案'],
    ['Close as resolved', '以已解决关闭'],
    ['Close as outdated', '以过时关闭'],
    ['Close as duplicate', '以重复关闭'],
    ['Closed as resolved', '已关闭为已解决'],
    ['Closed as outdated', '已关闭为过时'],
    ['Closed as duplicate', '已关闭为重复'],
    ['Apply labels to this discussion', '为此讨论应用标签'],
    ['Pin discussion', '置顶讨论'],
    // 原文分句、原文无逗号处，译文不合并、不添加
    [
      'You can pin up to 4 discussions. They will appear publicly at the top of the discussions page.',
      '最多可置顶 4 个讨论。它们将公开显示在讨论页顶部。'
    ],
    ['Cannot be changed to polls. Please create a new category for polls.', '无法更改为投票格式。请为投票新建类别。'],
    [
      "Be sure to mark someone's comment as an answer if it helps you resolve your question — they deserve the credit!",
      '记得将帮你解决了问题的评论标记为答案——这是对回答者应有的认可！'
    ],
    ['Pin this discussion to this category', '将此讨论置顶到此类别'],
    ['Unpin discussion from this category', '从此类别取消置顶讨论'],
    ['Unpin from this category', '从此类别取消置顶'],
    ['Transfer this discussion', '转移此讨论'],
    ['Lock conversation on this discussion', '锁定此讨论的对话'],
    ['Unlock conversation on this discussion', '解锁此讨论的对话'],
    ['Create issue from discussion', '从讨论创建议题'],
    ['Delete discussion?', '删除讨论？'],
    ['Updates from maintainers', '来自维护者的更新'],
    ['Show off something you’ve made', '展示你的作品'],
    ['Manage discussion categories', '管理讨论类别'],
    ['New category', '新建类别'],
    ['Category name', '类别名称'],
    ['Delete and move', '删除并移动'],
    ['Delete & Move', '删除并移动'],
    ['Open-ended discussion', '开放式讨论'],
    ['Question / Answer', '问题/回答'],
    ['Loading more replies...', '正在加载更多回复...'],
    ['Loading more replies…', '正在加载更多回复…'],
    ['Category selection', '选择类别'],
    // 新成员首帖说明（原文没有 quickly，译文不加“快速”）
    [
      "Since you're new here, we're helping you to get started by generating your first post to the community. Don't worry, you can edit this discussion after you post!",
      '你是新成员，我们为你生成了面向社区的第一篇帖子来帮助你上手。别担心，发布后仍可编辑此讨论！'
    ],
    [
      'Since you’re new here, we’re helping you to get started by generating your first post to the community. Don’t worry, you can edit this discussion after you post!',
      '你是新成员，我们为你生成了面向社区的第一篇帖子来帮助你上手。别担心，发布后仍可编辑此讨论！'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  New discussion \n', [...SCOPE])).toBe('  新建讨论 \n')
  })
})

describe('discussions 页面词条', () => {
  it.each([
    ['Categories', '类别'],
    ['Category', '类别'],
    ['Category:', '类别：'],
    ['Change category', '更改类别'],
    ['Most helpful', '最有帮助'],
    ['Last 30 days', '最近 30 天'],
    ['Maintainers', '维护者'],
    ['Community guidelines', '社区准则'],
    ['Latest activity', '最新活动'],
    ['Date created', '创建日期'],
    ['Top: Past week', '热门：过去一周'],
    ['· Unanswered', '· 未回答'],
    ['Pinned', '已置顶'],
    ['Discussions filter', '讨论筛选器'],
    ['Filter:', '筛选器：'],
    ['Authors', '作者'],
    ['States', '状态'],
    ['Upvote', '赞成'],
    ['Write a reply', '编写回复'],
    // 已保存回复为空：You can create one in your <a>settings</a>.
    ['settings', '设置'],
    ['heart', '爱心'],
    ['confused', '困惑'],
    ['thinking_face', '困惑'],
    ['Vote', '投票'],
    ['Show Results', '显示结果'],
    ['Hide results', '隐藏结果'],
    ['Back to vote', '返回投票'],
    ['Lock conversation', '锁定对话'],
    ['Allow reactions', '允许反应'],
    ['Get started', '开始使用'],
    ['Helpful resources', '实用资源'],
    ['Fields marked with an asterisk (*) are required.', '标有星号 (*) 的字段为必填项。'],
    // 原文无逗号，译文用“因…而…”，不加逗号；中文之间的斜杠两侧不加空格
    ["You're receiving notifications because you're subscribed to this thread.", '你因已订阅此线程而收到通知。'],
    ['You’re receiving notifications because you’re watching this repository.', '你因正在关注此存储库而收到通知。'],
    ['You’re receiving notifications because you authored the thread.', '你因是此线程的作者而收到通知。'],
    ['You’re receiving notifications because you modified the open/close state.', '你因更改了打开/关闭状态而收到通知。'],
    // 持续关系用“正在+动词”
    ['You’re ignoring this repository.', '你正在忽略此存储库。'],
    ["You're ignoring this repository.", '你正在忽略此存储库。'],
    ['This conversation has been locked and limited to collaborators.', '此对话已锁定并限制为仅协作者可评论。'],
    ['Announcements', '公告'],
    ['Q&A', '问答'],
    ['Show and tell', '展示与分享']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('common-ui 已收录且译法相同的词条不重复收录', () => {
    for (const text of [
      'Answered',
      'Unanswered',
      'Locked',
      'Unlocked',
      'Comment options',
      'Sign in to view',
      'Show comment',
      'Submitting',
      'Submitting…'
    ]) {
      expect(dict.scoped?.[text]).toBeUndefined()
      expect(dict.static?.[text]).toBeUndefined()
    }
    // Help 是默认类别名：繁体译「求助」，与通用词条不同，简体同键收录
    expect(categoryName('Help')).toBe('帮助')
    expect(dict.scoped?.Help).toBe('帮助')
  })

  it('组织讨论页与全局讨论页同样生效', () => {
    expect(matcher.translate('Most helpful', ['common', 'organization', 'discussions'])).toBe('最有帮助')
    expect(matcher.translate('3 new comments', ['common', 'discussions'])).toBe('3 条新评论')
    expect(matcher.translate('Pinned to Ideas', ['common', 'organization', 'discussions'])).toBe('置顶于想法')
  })

  it('Suggested filters 不单独收录，沿用 notifications 的全站 static', () => {
    expect(dict.scoped?.['Suggested filters']).toBeUndefined()
    expect(dict.static?.['Suggested filters']).toBeUndefined()
    const withNotifications = createMatcher([
      ['notifications', notifications],
      ['discussions', discussions]
    ])
    expect(withNotifications.translate('Suggested filters', [...SCOPE])).toBe('建议的筛选器')
  })

  it('全站 static 的 Close as duplicate 与问题页的 scoped 同译', () => {
    const withIssues = createMatcher([
      ['issues', issues],
      ['discussions', discussions]
    ])
    expect(withIssues.translate('Close as duplicate', ['common', 'repository', 'issues'])).toBe('以重复关闭')
    expect(withIssues.translate('Close as duplicate', [...SCOPE])).toBe('以重复关闭')
    expect(withIssues.translate('Close as duplicate', ['common', 'repository', 'pulls'])).toBe('以重复关闭')
  })

  it('You’re ignoring this repository. 与拉取请求页的全站 static 同译', () => {
    const withPulls = createMatcher([
      ['pulls', pulls],
      ['discussions', discussions]
    ])
    const straight = "You're ignoring this repository."
    expect(withPulls.translate(straight, ['common', 'repository', 'pulls'])).toBe('你正在忽略此存储库。')
    expect(withPulls.translate(straight, [...SCOPE])).toBe('你正在忽略此存储库。')
    expect(withPulls.translate('You’re ignoring this repository.', [...SCOPE])).toBe('你正在忽略此存储库。')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Most helpful', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('5 upvotes', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('Help', ['common', 'repository', 'code'])).toBeUndefined()
    expect(matcher.translate('Pinned to Announcements', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('settings', ['common', 'repository', 'code'])).toBeUndefined()
  })
})

describe('discussions 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('搜索框的高亮层与尺寸层由全局忽略选择器排除', () => {
    expect(IGNORE_SELECTORS).toEqual(expect.arrayContaining(['.QueryBuilder-StyledInputContent', '.QueryBuilder-Sizer']))
  })

  it('投票问题与选项被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <div class="js-discussion-poll-component Box">
        <div class="Box-header poll-title">Which option is better?</div>
        <div class="js-discussion-poll-options Box-body">
          <div class="form-checkbox"><label class="text-normal">Other</label></div>
        </div>
        <div class="js-discussion-poll-results">
          <div class="Box-row"><div class="d-flex"><div class="flex-auto">Yes</div></div></div>
        </div>
        <div class="Box-footer"><p>2 votes</p><button>Vote</button></div>
      </div>`
    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Which option is better?')).toBe(true)
    expect(ignored('Other')).toBe(true)
    expect(ignored('Yes')).toBe(true)
    expect(ignored('2 votes')).toBe(false)
    expect(ignored('Vote')).toBe(false)
  })

  /** 按 data-case 取元素，判断是否在忽略区域内 */
  function ignoredCase(name: string): boolean {
    const element = document.querySelector(`[data-case="${name}"]`)
    if (!element) throw new Error(`缺少用例元素：${name}`)
    return element.closest((dict.ignore ?? []).join(', ')) !== null
  }

  it('自定义类别名被忽略，默认类别名与类别页菜单不被忽略', () => {
    document.body.innerHTML = `
      <ul>
        <li><a class="ActionList-content" href="/acme/app/discussions/categories/security">
          <span class="ActionList-item-label" data-case="sidebar-custom"> Security </span></a></li>
        <li><a class="ActionList-content" href="/acme/app/discussions/categories/q-a">
          <span class="ActionList-item-label" data-case="sidebar-qa"> Q&amp;A </span></a></li>
        <li><a class="ActionList-content" href="/acme/app/discussions/categories/get-help">
          <span class="ActionList-item-label" data-case="sidebar-suffix"> Get help </span></a></li>
      </ul>
      <a class="Link--muted Link--inTextBlock" data-case="item-custom"
        href="/acme/app/discussions/categories/feedback?discussions_q=is%3Aopen+category%3AFeedback">Feedback</a>
      <a class="Link--muted Link--inTextBlock" data-case="item-default"
        href="/acme/app/discussions/categories/show-and-tell?discussions_q=is%3Aopen+category%3A%22Show+and+tell%22">Show and tell</a>
      <a class="Truncate-text" data-case="pinned-custom"
        href="/orgs/acme/discussions?discussions_q=category%3A%22Repositories%22"> Repositories </a>
      <a class="Truncate-text" data-case="pinned-prefix"
        href="/acme/app/discussions?discussions_q=category%3AGeneralities"> Generalities </a>
      <a class="Truncate-text" data-case="pinned-quoted"
        href="/orgs/acme/discussions?discussions_q=category%3A%22Announcements%22"> Announcements </a>
      <a class="Truncate-text" data-case="pinned-plain" href="/acme/app/discussions?discussions_q=category%3AGeneral"> General </a>
      <a class="Truncate-text" data-case="pinned-multi"
        href="/acme/app/discussions?discussions_q=category%3A%22Show+and+tell%22"> Show and tell </a>
      <a class="color-fg-inherit text-bold" data-case="header-custom" href="/acme/app/discussions/categories/rfc">RFC</a>
      <a class="color-fg-inherit text-bold" data-case="header-default" href="/acme/app/discussions/categories/polls">Polls</a>
      <a class="Link--onHover" data-case="side-custom" href="/acme/app/discussions/categories/accessibility"> Accessibility </a>
      <a class="Link--onHover" data-case="side-default" href="/acme/app/discussions/categories/ideas"> Ideas </a>
      <a class="select-menu-item" data-case="sort-menu"
        href="/acme/app/discussions/categories/security?discussions_q=category%3ASecurity+sort%3Atop">Top</a>
      <a class="ActionListContent" data-case="filter-menu"
        href="/acme/app/discussions/categories/security?discussions_q=category%3ASecurity+is%3Aanswered">Answered</a>`
    expect(ignoredCase('sidebar-custom')).toBe(true)
    expect(ignoredCase('sidebar-suffix')).toBe(true)
    expect(ignoredCase('sidebar-qa')).toBe(false)
    expect(ignoredCase('item-custom')).toBe(true)
    expect(ignoredCase('item-default')).toBe(false)
    expect(ignoredCase('pinned-custom')).toBe(true)
    expect(ignoredCase('pinned-prefix')).toBe(true)
    expect(ignoredCase('pinned-quoted')).toBe(false)
    expect(ignoredCase('pinned-plain')).toBe(false)
    expect(ignoredCase('pinned-multi')).toBe(false)
    expect(ignoredCase('header-custom')).toBe(true)
    expect(ignoredCase('header-default')).toBe(false)
    expect(ignoredCase('side-custom')).toBe(true)
    expect(ignoredCase('side-default')).toBe(false)
    expect(ignoredCase('sort-menu')).toBe(false)
    expect(ignoredCase('filter-menu')).toBe(false)
  })

  it('自定义类别页的标题与说明被忽略，默认类别页不被忽略', () => {
    const page = (slug: string): string => `
      <a class="ActionList-content" aria-current="page" href="/acme/app/discussions/categories/${slug}">
        <span class="ActionList-item-label">Name</span></a>
      <div class="Subhead">
        <h2 class="Subhead-heading" id="discussions-list" data-case="title">Name <span class="sr-only">Discussions</span></h2>
        <div class="Subhead-description" data-case="description">Description</div>
      </div>`
    document.body.innerHTML = page('feedback')
    expect(ignoredCase('title')).toBe(true)
    expect(ignoredCase('description')).toBe(true)
    document.body.innerHTML = page('help')
    expect(ignoredCase('title')).toBe(false)
    expect(ignoredCase('description')).toBe(false)
  })
})

describe('discussions 繁体词条（完整语言包）', () => {
  const twMatcher = createMatcher(zhTW)

  it.each([
    // 回答
    ['Suggest an answer', '提出答案'],
    ['Mark as answer', '標示為答案'],
    ['Answer selected by', '答案選定者'],
    ['settings', '設定'],
    [
      'Since you’re new here, we’re helping you to get started by generating your first post to the community. Don’t worry, you can edit this discussion after you post!',
      '你是新成員，我們為你產生了第一篇社群貼文來協助你上手。別擔心，發布後仍可編輯此討論！'
    ]
  ])('%s → %s', (input, expected) => {
    expect(twMatcher.translate(input, SCOPE)).toBe(expected)
  })
})
