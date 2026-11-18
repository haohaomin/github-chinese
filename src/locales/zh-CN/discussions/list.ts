import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'
import { categoryName, DEFAULT_CATEGORY_SOURCE, withCategory } from './categories'

/** 列表“Filter: <状态>”中的状态 */
const FILTER_STATES: ReadonlyMap<string, string> = new Map([
  ['Open', '打开'],
  ['Closed', '已关闭'],
  ['Locked', '已锁定'],
  ['Unlocked', '未锁定'],
  ['Answered', '已回答'],
  ['Unanswered', '未回答'],
  ['Verified', '已验证'],
  ['All', '全部']
])

const FILTER_STATE_SOURCE = `(?:${[...FILTER_STATES.keys()].join('|')})`

/** Open, Answered → 打开、已回答 */
function filterStates(states: string): string {
  return states
    .split(', ')
    .map(state => FILTER_STATES.get(state) ?? state)
    .join('、')
}

/** 列表页标题（屏幕阅读器）开头不会是这些词：排除“Get started with GitHub Discussions”之类的界面文字 */
const NOT_OWNER =
  '(?!(?:About|All|Communities|Create|Enable|Explore|Get|Manage|New|Organization|Pinned|Search|Set|Start|Team|Try|Turn|Using|View|Welcome|Your) )'
/** 列表页标题第二段（存储库名）不会是这些虚词 */
const NOT_REPO = '(?!(?:a|about|all|an|and|for|in|of|on|or|our|started|the|to|up|using|with|your) )'

/** 无障碍名称中的时间：11:34PM on September 06、01:59AM today、08:07AM yesterday（不含捕获组） */
export const COMMENT_TIME_SOURCE = `\\d{1,2}:\\d{2}[AP]M (?:today|yesterday|on ${DATE_SOURCE})`
const COMMENT_TIME_RE = new RegExp(`^(\\d{1,2}):(\\d{2})([AP]M) (today|yesterday|on ${DATE_SOURCE})$`)

/** 11:34PM on September 06 → 9月6日 23:34；01:59AM today → 今天 1:59（小时不补零，与 Intl 输出一致） */
export function commentTime(text: string): string {
  const match = COMMENT_TIME_RE.exec(text)
  if (!match) return text
  const [, hour, minute, period, day] = match
  const hour24 = (Number(hour) % 12) + (period === 'PM' ? 12 : 0)
  return `${translateTime(day!)} ${hour24}:${minute!}`
}

const regexp: readonly RegExpRule[] = [
  // 列表页标题（屏幕阅读器）：octo-org hello-world Discussions / octo-org hello-world Polls Discussions
  [new RegExp(`^${NOT_OWNER}([\\w.-]+) ${NOT_REPO}([\\w.-]+) Discussions$`), '$1/$2 的讨论'],
  [
    new RegExp(`^${NOT_OWNER}([\\w.-]+) ${NOT_REPO}([\\w.-]+) (.+) Discussions$`),
    (_, owner, repo, category) => `${owner}/${repo} ${withCategory('的', category, '讨论')}`
  ],
  // 类别页的页面标题段：octo-org/hello-world Polls（只有默认类别名需要翻译）
  [new RegExp(`^([\\w.-]+/[\\w.-]+) (${DEFAULT_CATEGORY_SOURCE})$`), (_, repo, category) => `${repo} ${categoryName(category)}`],
  // 类别页的置顶讨论标题：Pinned to Announcements
  [/^Pinned to (.+)$/, (_, name) => withCategory('置顶于', name)],
  // 列表筛选：Filter: Open / Filter: Open, Answered
  [new RegExp(`^Filter: (${FILTER_STATE_SOURCE}(?:, ${FILTER_STATE_SOURCE})*)$`), (_, states) => `筛选器：${filterStates(states)}`],
  // 列表项无障碍名称（类别、作者链接由全局 ignore 排除；参与者头像是 <img>）
  [/^(.+) \(category\)$/, (_, name) => `${categoryName(name)}（类别）`],
  [/^([^\s()]+) \(author\)$/, '$1（作者）'],
  [/^([^\s()]+) \(participant\)$/, '$1（参与者）'],
  [/^Upvote: (\d[\d,]*)$/, '赞成：$1'],
  // 登录后列表项的屏幕阅读器文字：General · #527 was created by octocat on January 08, 2025 23:53
  [
    new RegExp(`^(.+) · #(\\d+) was created by ([^\\s]+) on (${DATE_SOURCE}) (\\d{1,2}:\\d{2})$`),
    (_, category, number, user, date, clock) =>
      `${categoryName(category)} · #${number} 由 ${user} ${joinCjk('于', translateTime(date))} ${clock} 创建`
  ],
  // 评论数链接：12 comments: octocat, 11:34PM on September 06
  [
    new RegExp(`^(\\d[\\d,]*) comments?: ([^\\s,]+), (${COMMENT_TIME_SOURCE})$`),
    (_, count, user, time) => `${count} 条评论：${user}，${commentTime(time)}`
  ],
  // 计数（N comments、N replies、N participants 由 common-ui 的通用计数翻译）
  [/^(\d[\d,]*) new comments?$/, '$1 条新评论'],
  [/^(\d[\d,]*) upvotes?$/, '$1 票赞成'],
  [/^(\d[\d,]*) answers?$/, '$1 个回答'],
  [/^(\d[\d,]*) (new )?suggested answers?$/, (_, count, isNew) => `${count} 个${isNew ? '新的' : ''}建议答案`]
]

/**
 * 讨论列表：存储库 / 组织讨论列表、类别页、搜索与筛选、排序、侧栏（类别、最有帮助、社区链接）、置顶讨论、
 * 空状态与引导提示、未启用讨论时的介绍页、全局讨论页（/discussions）。
 */
export default {
  static: {
    // 未启用讨论时的介绍页（产品名译成中文：GitHub Discussions → GitHub 讨论，GitHub Actions → GitHub 操作）
    'Get started with GitHub Discussions': '开始使用 GitHub 讨论',
    'Get Started With GitHub Discussions': '开始使用 GitHub 讨论',
    'Discussions is a central gathering space for your community to ask questions, share ideas, and build connections with each other—all right next to your code.':
      '讨论是社区提问、分享想法和彼此建立联系的集中交流空间——就在代码旁边。',
    'Only maintainers can see this page and enable Discussions': '只有维护者能看到此页面并启用讨论',
    "Create custom categories and discussion types to suit your community's unique needs.":
      '创建自定义类别和讨论类型来满足社区的独特需求。',
    'Create custom categories and discussion types to suit your community’s unique needs.':
      '创建自定义类别和讨论类型来满足社区的独特需求。',
    'Mark the most helpful answer': '标记最有帮助的回答',
    'Highlight quality responses and make the best answer super discoverable.': '突出优质回复并让最佳答案一目了然。',
    'Pin big announcements': '置顶重要公告',
    'Direct the community’s attention to important announcements or popular discussions.': '引导社区关注重要公告或热门讨论。',
    "Direct the community's attention to important announcements or popular discussions.": '引导社区关注重要公告或热门讨论。',
    'Label your discussions': '为讨论添加标签',
    'Organize and triage discussions to keep your space tidy and help contributors filter to areas of interest.':
      '整理和分类讨论来保持空间整洁并帮助贡献者筛选出感兴趣的领域。',
    'Respond on-the-go with mobile': '随时随地在移动端回复',
    'Check in and respond to discussions whenever and wherever is convenient for you.': '随时随地查看和回复讨论。',
    'Connect to your apps': '连接你的应用',
    'Integrate with your existing workflows and GitHub Actions via the GraphQL API and webhooks.':
      '通过 GraphQL API 和 Web 钩子与现有工作流及 GitHub 操作集成。',
    'Thread your conversations': '用嵌套回复组织对话',
    'Keep conversations on track and encourage collaboration with threaded comments.': '通过嵌套评论让对话不偏题并促进协作。',
    'Monitor community insights': '监控社区见解',
    'Track the health and growth of your community with a dashboard full of actionable data.':
      '通过满是可操作数据的仪表板跟踪社区的健康与成长。',
    'Ask your community with polls': '用投票征询社区意见',
    'Gauge interest in a feature, vote on a meetup time, or learn more about your community with polls.':
      '通过投票了解大家对某项功能的兴趣、表决聚会时间，或进一步了解你的社区。',
    'Communities using Discussions': '使用讨论的社区',
    'Ready to try Discussions?': '准备好试用讨论了吗？',
    'Click “get started” to enable it for your community and start your first discussion. Now is not the right time? Click “not now” to dismiss this tab. You can always turn Discussions on in your repository settings later.':
      '单击“开始使用”为社区启用讨论并开始第一个讨论。现在不是时候？单击“暂不”关闭此标签页。你以后随时可以在存储库设置中开启讨论。',
    'Read about best practices for setting up Discussions for your community.': '阅读为社区设置讨论的最佳实践。',

    // 引导提示
    'Get started by creating the first': '从创建社区的第一个',
    'discussion for your community.': '讨论开始吧。',
    'About pinned discussions': '关于置顶讨论',
    'When you start a discussion,': '开始讨论时，',
    'you can choose to feature it': '你可以选择通过置顶',
    'here by pinning it.': '将其展示在这里。',
    'Personalize your categories': '个性化类别',
    'Choose categories that fit your community. These could be announcements, Q&A with marked answers, open-ended conversations, or polls for community voting.':
      '选择适合社区的类别。可以是公告、带标记答案的问答、开放式对话或供社区表决的投票。',
    'Welcome to discussions!': '欢迎使用讨论！',
    'Discussions are to share announcements, create conversation in your community, answer questions, and more.':
      '讨论可用于发布公告、在社区中发起对话、解答问题等。',
    'Discussions are to share announcements, create conversation in your community, answer questions, and more. To get started, you can create a':
      '讨论可用于发布公告、在社区中发起对话、解答问题等。首先，你可以创建一个',
    'Welcome to Organization Discussions!': '欢迎使用组织讨论！',
    'There are no discussions here yet': '暂无讨论',
    'Organization discussions are to broadcast news, create conversation in your community, answer questions, and share ideas. To get started, you can':
      '组织讨论可用于发布消息、在社区中发起对话、解答问题和分享想法。首先，你可以',
    'create a new discussion.': '创建新讨论。',
    // 组织讨论源存储库：This is a ✨special✨ repository containing … for <a>org</a>. Everything posted here …
    'This is a ✨special✨ repository containing the organization level discussions for': '这个✨特殊✨存储库包含以下组织的组织级讨论',
    '. Everything posted here will also be visible at the organization level.': '。在此发布的所有内容也会在组织级别显示。',
    'View organization discussions': '查看组织讨论',

    // 列表
    'New discussion': '新建讨论',
    'New Discussion': '新建讨论',
    'Pinned Discussions': '置顶讨论',
    'Pinned discussions': '置顶讨论',
    'Search all discussions': '搜索所有讨论',
    'filter by discussion author': '按讨论作者筛选',
    'filter by discussion category': '按讨论类别筛选',
    'filter by answered or unanswered': '按已回答或未回答筛选',
    'View all discussions': '查看所有讨论',
    'Categories, most helpful, and community links': '类别、最有帮助和社区链接',
    'Be sure to mark someone’s comment as an answer if it helps you resolve your question — they deserve the credit!':
      '记得将帮你解决了问题的评论标记为答案——这是对回答者应有的认可！',
    "Be sure to mark someone's comment as an answer if it helps you resolve your question — they deserve the credit!":
      '记得将帮你解决了问题的评论标记为答案——这是对回答者应有的认可！',
    'You must be logged in to vote': '登录后才能投票',
    'Posted as Admin': '以管理员身份发布',
    'Unanswered Question': '未回答的问题',
    'asked a question in': '提问于',

    // 空状态
    "There aren't any discussions.": '暂无讨论。',
    'There aren’t any discussions.': '暂无讨论。',
    'There are no matching discussions.': '没有匹配的讨论。',
    'There are no matching answered discussions.': '没有匹配的已回答讨论。',
    'There are no matching unanswered discussions.': '没有匹配的未回答讨论。',
    // You can open a <a>new discussion</a> to ask questions about this repository or get help.（原文无逗号，译文不加）
    'to ask questions about this repository or get help.': '来询问有关此存储库的问题或寻求帮助。',

    // 全局讨论页（/discussions）
    'No discussions match the selected filters.': '没有符合所选筛选器的讨论。',
    'Discussions are used to ask questions and have open-ended conversations.': '讨论用于提问和进行开放式对话。'
  },
  scoped: {
    // 介绍页按钮
    'Get Started': '开始使用',
    'Not now': '暂不',
    'Visit the docs': '查看文档',
    'new discussion': '新讨论',
    'You can open a': '你可以发起一个',

    // 侧栏
    Categories: '类别',
    Category: '类别',
    'Most helpful': '最有帮助',
    'Last 30 days': '最近 30 天',
    Maintainers: '维护者',
    'Community links': '社区链接',
    'Community guidelines': '社区准则',
    'Community insights': '社区见解',
    'Code of conduct': '行为准则',
    // 维护者可见的管理入口
    'Admin controls': '管理员控件',

    // 搜索（Suggested filters 由 notifications 的全站 static 翻译：建议的筛选器）
    'Submit search': '提交搜索',
    'Discussions filter': '讨论筛选器',
    // 查询框建议分组（Categories、Labels 见下）
    Authors: '作者',
    States: '状态',

    // 排序
    'Latest activity': '最新活动',
    'Date created': '创建日期',
    'Top: Past day': '热门：过去一天',
    'Top: Past week': '热门：过去一周',
    'Top: Past month': '热门：过去一个月',
    'Top: Past year': '热门：过去一年',
    'Top: All': '热门：全部',

    // 筛选与状态（与 FILTER_STATES 一致；Locked、Answered 等单词由 common-ui 翻译）
    Pinned: '已置顶',
    '· Answered': '· 已回答',
    '· Unanswered': '· 未回答',
    '· Closed': '· 已关闭',
    '· Verified': '· 已验证',
    'Filter:': '筛选器：',
    Label: '标签',
    Labels: '标签',
    Unlabeled: '无标签',
    'Edit labels': '编辑标签',
    'Filter labels': '筛选标签',
    'Filter by label': '按标签筛选',
    'No labels found. Sorry about that.': '未找到标签。',
    // Use <kbd>alt</kbd> + <kbd>click/return</kbd> to exclude labels.（整句匹配，片段兜底）
    'Use alt + click/return to exclude labels.': '使用 alt + click/return 排除标签。',
    Use: '使用',
    'to exclude labels.': '排除标签。',

    // 列表项：<用户> started <时间> in <类别>
    started: '发起于',
    asked: '提问于',
    announced: '发布于',
    in: '位于',

    // 全局讨论页（/discussions）的筛选标签页，与 /pulls 一致
    Created: '已创建',
    Commented: '已评论'
  },
  regexp
} satisfies PageDictionary
