import type { PageDictionary, RegExpRule } from '../../../core/types'
import { formatClock } from '../common-ui/time'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'
import { categoryName, DEFAULT_CATEGORY_SOURCE, withCategory } from './categories'

/** 列表“Filter: <状态>”中的状态 */
const FILTER_STATES: ReadonlyMap<string, string> = new Map([
  ['Open', '開放中'],
  ['Closed', '已關閉'],
  ['Locked', '已鎖定'],
  ['Unlocked', '未鎖定'],
  ['Answered', '已回答'],
  ['Unanswered', '未回答'],
  ['Verified', '已驗證'],
  ['All', '全部']
])

const FILTER_STATE_SOURCE = `(?:${[...FILTER_STATES.keys()].join('|')})`

/** Open, Answered → 開放中、已回答 */
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

/** 11:34PM on September 06 → 9月6日 下午 11:34；01:59AM today → 今天 上午 1:59（时刻同 common-ui 的 formatClock） */
export function commentTime(text: string): string {
  const match = COMMENT_TIME_RE.exec(text)
  if (!match) return text
  const [, hour, minute, period, day] = match
  return `${translateTime(day!)} ${formatClock(hour!, minute!, period)}`
}

const regexp: readonly RegExpRule[] = [
  // 列表页标题（屏幕阅读器）：octo-org hello-world Discussions / octo-org hello-world Polls Discussions
  [new RegExp(`^${NOT_OWNER}([\\w.-]+) ${NOT_REPO}([\\w.-]+) Discussions$`), '$1/$2 的討論'],
  [
    new RegExp(`^${NOT_OWNER}([\\w.-]+) ${NOT_REPO}([\\w.-]+) (.+) Discussions$`),
    (_, owner, repo, category) => `${owner}/${repo} ${withCategory('的', category, '討論')}`
  ],
  // 类别页的页面标题段：octo-org/hello-world Polls（只有默认类别名需要翻译）
  [new RegExp(`^([\\w.-]+/[\\w.-]+) (${DEFAULT_CATEGORY_SOURCE})$`), (_, repo, category) => `${repo} ${categoryName(category)}`],
  // 类别页的固定讨论标题：Pinned to Announcements（状态用「已＋动词」）
  [/^Pinned to (.+)$/, (_, name) => withCategory('已釘選到', name)],
  // 列表筛选：Filter: Open / Filter: Open, Answered
  [new RegExp(`^Filter: (${FILTER_STATE_SOURCE}(?:, ${FILTER_STATE_SOURCE})*)$`), (_, states) => `篩選器：${filterStates(states)}`],
  // 列表项无障碍名称（类别、作者链接由全局 ignore 排除；参与者头像是 <img>）
  [/^(.+) \(category\)$/, (_, name) => `${categoryName(name)}（類別）`],
  [/^([^\s()]+) \(author\)$/, '$1（作者）'],
  [/^([^\s()]+) \(participant\)$/, '$1（參與者）'],
  [/^Upvote: (\d[\d,]*)$/, '贊成：$1'],
  // 登录后列表项的屏幕阅读器文字：General · #527 was created by octocat on January 08, 2025 23:53（24 小时制换成 下午 11:53）
  [
    new RegExp(`^(.+) · #(\\d+) was created by ([^\\s]+) on (${DATE_SOURCE}) (\\d{1,2}:\\d{2})$`),
    (_, category, number, user, date, clock: string) => {
      const [hour, minute] = clock.split(':')
      return `${categoryName(category)} · #${number} 由 ${user} ${joinCjk('於', translateTime(date))} ${formatClock(hour!, minute!)} 建立`
    }
  ],
  // 评论数链接：12 comments: octocat, 11:34PM on September 06
  [
    new RegExp(`^(\\d[\\d,]*) comments?: ([^\\s,]+), (${COMMENT_TIME_SOURCE})$`),
    (_, count, user, time) => `${count} 則留言：${user}，${commentTime(time)}`
  ],
  // 计数（N comments、N replies、N participants 由 common-ui 的通用计数翻译）
  [/^(\d[\d,]*) new comments?$/, '$1 則新留言'],
  [/^(\d[\d,]*) upvotes?$/, '$1 票贊成'],
  [/^(\d[\d,]*) answers?$/, '$1 個回答'],
  [/^(\d[\d,]*) (new )?suggested answers?$/, (_, count, isNew) => `${count} 個${isNew ? '新的' : ''}建議答案`]
]

/**
 * 讨论列表：存储库 / 组织讨论列表、类别页、搜索与筛选、排序、侧栏（类别、最有帮助、社区链接）、固定讨论、
 * 空状态与引导提示、未启用讨论时的介绍页、全局讨论页（/discussions）。
 */
export default {
  static: {
    // 未启用讨论时的介绍页（产品名译成中文：GitHub Discussions → GitHub 討論，GitHub Actions → GitHub 動作）
    'Get started with GitHub Discussions': '開始使用 GitHub 討論',
    'Get Started With GitHub Discussions': '開始使用 GitHub 討論',
    'Discussions is a central gathering space for your community to ask questions, share ideas, and build connections with each other—all right next to your code.':
      '討論是社群提問、分享想法和彼此建立聯繫的集中交流空間——就在你的程式碼旁邊。',
    'Only maintainers can see this page and enable Discussions': '只有維護者能看到此頁面並啟用討論',
    "Create custom categories and discussion types to suit your community's unique needs.": '建立符合社群獨特需求的自訂類別和討論類型。',
    'Create custom categories and discussion types to suit your community’s unique needs.': '建立符合社群獨特需求的自訂類別和討論類型。',
    'Mark the most helpful answer': '標示最有幫助的回答',
    'Highlight quality responses and make the best answer super discoverable.': '突顯優質回覆並讓最佳答案一目了然。',
    'Pin big announcements': '釘選重要公告',
    'Direct the community’s attention to important announcements or popular discussions.': '引導社群關注重要公告或熱門討論。',
    "Direct the community's attention to important announcements or popular discussions.": '引導社群關注重要公告或熱門討論。',
    'Label your discussions': '為討論加上標籤',
    'Organize and triage discussions to keep your space tidy and help contributors filter to areas of interest.':
      '整理並分類討論以保持空間整潔，同時協助貢獻者篩選出感興趣的領域。',
    'Respond on-the-go with mobile': '隨時隨地透過行動裝置回覆',
    'Check in and respond to discussions whenever and wherever is convenient for you.': '隨時隨地查看並回覆討論。',
    'Connect to your apps': '連接你的應用程式',
    'Integrate with your existing workflows and GitHub Actions via the GraphQL API and webhooks.':
      '透過 GraphQL API 和 Web 鉤子整合現有的工作流程和 GitHub 動作。',
    'Thread your conversations': '以討論串整理對話',
    'Keep conversations on track and encourage collaboration with threaded comments.': '透過討論串留言讓對話不離題並促進協作。',
    'Monitor community insights': '監控社群洞察',
    'Track the health and growth of your community with a dashboard full of actionable data.':
      '透過充滿實用資料的儀表板，追蹤社群的健康狀況和成長。',
    'Ask your community with polls': '透過投票徵詢社群意見',
    'Gauge interest in a feature, vote on a meetup time, or learn more about your community with polls.':
      '透過投票瞭解大家對某項功能的興趣、表決聚會時間，或進一步瞭解你的社群。',
    'Communities using Discussions': '使用討論的社群',
    'Ready to try Discussions?': '準備好試用討論了嗎？',
    'Click “get started” to enable it for your community and start your first discussion. Now is not the right time? Click “not now” to dismiss this tab. You can always turn Discussions on in your repository settings later.':
      '按一下「開始使用」為社群啟用討論並發起第一個討論。現在不是時候？按一下「暫時不要」關閉此分頁。你之後隨時可以在儲存庫設定中開啟討論。',
    'Read about best practices for setting up Discussions for your community.': '閱讀為社群設定討論的最佳做法。',

    // 引导提示
    'Get started by creating the first': '從建立社群的第一個',
    'discussion for your community.': '討論開始。',
    'About pinned discussions': '關於已釘選的討論',
    'When you start a discussion,': '發起討論時，',
    'you can choose to feature it': '你可以選擇透過釘選',
    'here by pinning it.': '將其展示在這裡。',
    'Personalize your categories': '個人化類別',
    'Choose categories that fit your community. These could be announcements, Q&A with marked answers, open-ended conversations, or polls for community voting.':
      '選擇適合社群的類別。可以是公告、可標示答案的問與答、開放式對話或供社群表決的投票。',
    'Welcome to discussions!': '歡迎使用討論！',
    'Discussions are to share announcements, create conversation in your community, answer questions, and more.':
      '討論可用於發布公告、在社群中發起對話、解答問題等。',
    'Discussions are to share announcements, create conversation in your community, answer questions, and more. To get started, you can create a':
      '討論可用於發布公告、在社群中發起對話、解答問題等。首先，你可以建立一個',
    'Welcome to Organization Discussions!': '歡迎使用組織討論！',
    'There are no discussions here yet': '尚無討論',
    'Organization discussions are to broadcast news, create conversation in your community, answer questions, and share ideas. To get started, you can':
      '組織討論可用於發布新聞、在社群中發起對話、解答問題和分享想法。首先，你可以',
    'create a new discussion.': '建立新討論。',
    // 组织讨论源存储库：This is a ✨special✨ repository containing … for <a>org</a>. Everything posted here …
    'This is a ✨special✨ repository containing the organization level discussions for': '這個✨特殊✨儲存庫包含以下組織的組織層級討論',
    '. Everything posted here will also be visible at the organization level.': '。在此發布的所有內容也會在組織層級顯示。',
    'View organization discussions': '查看組織討論',

    // 列表
    'New discussion': '新增討論',
    'New Discussion': '新增討論',
    'Pinned Discussions': '已釘選的討論',
    'Pinned discussions': '已釘選的討論',
    'Search all discussions': '搜尋所有討論',
    'filter by discussion author': '依討論作者篩選',
    'filter by discussion category': '依討論類別篩選',
    'filter by answered or unanswered': '依已回答或未回答篩選',
    'View all discussions': '查看所有討論',
    'Categories, most helpful, and community links': '類別、最有幫助和社群連結',
    'Be sure to mark someone’s comment as an answer if it helps you resolve your question — they deserve the credit!':
      '記得將幫你解決問題的留言標示為答案——這是對方應得的肯定！',
    "Be sure to mark someone's comment as an answer if it helps you resolve your question — they deserve the credit!":
      '記得將幫你解決問題的留言標示為答案——這是對方應得的肯定！',
    'You must be logged in to vote': '登入後才能投票',
    'Posted as Admin': '以管理員身分發布',
    'Unanswered Question': '未回答的問題',
    'asked a question in': '提問於',

    // 空状态
    "There aren't any discussions.": '尚無討論。',
    'There aren’t any discussions.': '尚無討論。',
    'There are no matching discussions.': '沒有相符的討論。',
    'There are no matching answered discussions.': '沒有相符的已回答討論。',
    'There are no matching unanswered discussions.': '沒有相符的未回答討論。',
    // You can open a <a>new discussion</a> to ask questions about this repository or get help.（原文无逗号，译文不加）
    'to ask questions about this repository or get help.': '來提出有關此儲存庫的問題或尋求協助。',

    // 全局讨论页（/discussions）
    'No discussions match the selected filters.': '沒有符合所選篩選器的討論。',
    'Discussions are used to ask questions and have open-ended conversations.': '討論用於提問和展開開放式對話。'
  },
  scoped: {
    // 介绍页按钮
    'Get Started': '開始使用',
    'Not now': '暫時不要',
    'Visit the docs': '查看說明文件',
    'new discussion': '新討論',
    'You can open a': '你可以發起一個',

    // 侧栏
    Categories: '類別',
    Category: '類別',
    'Most helpful': '最有幫助',
    'Last 30 days': '過去 30 天',
    Maintainers: '維護者',
    'Community links': '社群連結',
    'Community guidelines': '社群守則',
    'Community insights': '社群洞察',
    'Code of conduct': '行為準則',
    // 维护者可见的管理入口
    'Admin controls': '管理員控制項',

    // 搜索（Suggested filters 由 notifications 的全站 static 翻译）
    'Submit search': '送出搜尋',
    'Discussions filter': '討論篩選器',
    // 查询框建议分组（Categories、Labels 见下）
    Authors: '作者',
    States: '狀態',

    // 排序
    'Latest activity': '最新活動',
    'Date created': '建立日期',
    'Top: Past day': '熱門：過去一天',
    'Top: Past week': '熱門：過去一週',
    'Top: Past month': '熱門：過去一個月',
    'Top: Past year': '熱門：過去一年',
    'Top: All': '熱門：全部',

    // 筛选与状态（与 FILTER_STATES 一致；Locked、Answered 等单词由 common-ui 翻译）
    Pinned: '已釘選',
    '· Answered': '· 已回答',
    '· Unanswered': '· 未回答',
    '· Closed': '· 已關閉',
    '· Verified': '· 已驗證',
    'Filter:': '篩選器：',
    Label: '標籤',
    Labels: '標籤',
    Unlabeled: '無標籤',
    'Edit labels': '編輯標籤',
    'Filter labels': '篩選標籤',
    'Filter by label': '依標籤篩選',
    'No labels found. Sorry about that.': '找不到標籤。',
    // Use <kbd>alt</kbd> + <kbd>click/return</kbd> to exclude labels.（整句匹配，片段兜底）
    'Use alt + click/return to exclude labels.': '使用 alt + click/return 排除標籤。',
    Use: '使用',
    'to exclude labels.': '排除標籤。',

    // 列表项：<用户> started <时间> in <类别>
    started: '發起於',
    asked: '提問於',
    announced: '發布於',
    in: '位於',

    // 全局讨论页（/discussions）的筛选标签页，与 /pulls 一致
    Created: '已建立',
    Commented: '已留言'
  },
  regexp
} satisfies PageDictionary
