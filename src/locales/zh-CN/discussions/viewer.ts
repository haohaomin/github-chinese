import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'
import { withCategory } from './categories'
import { COMMENT_TIME_SOURCE, commentTime } from './list'

/** 侧栏通知原因（弯引号原文）；直引号写法由 withStraightQuotes 补齐。原文无逗号，译文用“因…而…”，不加逗号 */
const NOTIFICATION_REASONS: Readonly<Record<string, string>> = {
  'You’re receiving notifications because you’re watching this repository.': '你因正在关注此存储库而收到通知。',
  'You’re receiving notifications because you are watching issues on this repository.': '你因正在关注此存储库的议题而收到通知。',
  'You’re receiving notifications because you are watching pull requests on this repository.': '你因正在关注此存储库的拉取请求而收到通知。',
  'You’re receiving notifications because you authored the thread.': '你因是此线程的作者而收到通知。',
  'You’re receiving notifications because you’re subscribed to this thread.': '你因已订阅此线程而收到通知。',
  'You’re receiving notifications because you were mentioned.': '你因被提及而收到通知。',
  'You’re receiving notifications because you commented.': '你因发表了评论而收到通知。',
  'You’re receiving notifications because you modified the open/close state.': '你因更改了打开/关闭状态而收到通知。',
  // 持续关系用“正在+动词”，与拉取请求页同译
  'You’re ignoring this repository.': '你正在忽略此存储库。'
}

/** 同一原文的弯引号（’）与直引号（'）写法都收录 */
function withStraightQuotes(entries: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(entries).flatMap(([source, target]) => [
      [source, target],
      [source.replaceAll('’', "'"), target]
    ])
  )
}

/** 关闭原因（与 static 中的 Close as … / Closed as … 一致） */
const CLOSE_REASONS: ReadonlyMap<string, string> = new Map([
  ['resolved', '已解决'],
  ['outdated', '过时'],
  ['duplicate', '重复']
])

const regexp: readonly RegExpRule[] = [
  // 详情（edited by X、Edited N times、N hidden items 由 common-ui 翻译）
  [/^Answered by ([^\s()]+)$/, '回答者 $1'],
  // 头部状态标签的 title：Status: Closed as resolved（Status: Open 等由 common-ui 翻译）
  [/^Status: Closed as (resolved|outdated|duplicate)$/, (_, reason: string) => `状态：已关闭为${CLOSE_REASONS.get(reason) ?? reason}`],
  // 原文没有括号：日期改放在句中（This discussion was converted from issue #12 on Jan 5, 2024.）；未匹配的日期为空串
  [
    new RegExp(`^This discussion was converted from issue #(\\d+)(?: on (${DATE_SOURCE}))?(\\.?)$`),
    (_, number: string, date: string, period: string) =>
      `此讨论${date ? joinCjk('于', translateTime(date)) : ''}由议题 #${number} 转换而来${period ? '。' : ''}`
  ],
  [/^This user is sponsoring ([^\s()]+)\.$/, '此用户正在赞助 $1。'],
  [/^Congratulations, you['’]ve created the first discussion in (.+)!$/, '恭喜，你已在 $1 中创建了第一个讨论！'],
  // 登录后评论的按钮名称：Upvote: (86): octocat, 09:00AM on May 12, 2022 / Write a reply: octocat, 01:16PM today
  [
    new RegExp(`^Upvote: \\((\\d[\\d,]*)\\): ([^\\s,]+), (${COMMENT_TIME_SOURCE})$`),
    (_, count, user, time) => `赞成 (${count})：${user}，${commentTime(time)}`
  ],
  [new RegExp(`^Write a reply: ([^\\s,]+), (${COMMENT_TIME_SOURCE})$`), (_, user, time) => `编写回复：${user}，${commentTime(time)}`],
  // 投票：2 votes、2k votes
  [/^(\d[\d,.]*[kKmM]?) votes?$/, '$1 票'],
  // 回复
  [/^Show (\d[\d,]*) previous repl(?:y|ies)$/, '显示前 $1 条回复'],
  [/^Show (\d[\d,]*) more repl(?:y|ies)$/, '再显示 $1 条回复'],
  // 置顶（类别名原文不带引号，译文也不加）
  [/^Discussion "(.+)" has been unpinned\.$/, '已取消置顶讨论“$1”。'],
  [/^Discussion pinned to (.+)$/, (_, name) => withCategory('已将讨论置顶到', name)],
  [/^Discussion unpinned from (.+)$/, (_, name) => withCategory('已从', name, '取消置顶讨论')],
  [/^Pin discussion to (.+)$/, (_, name) => withCategory('将讨论置顶到', name)],
  [/^Pin to (.+)$/, (_, name) => withCategory('置顶到', name)],
  [/^This will pin this discussion to the top of the (.+) category\.$/, (_, name) => withCategory('这会在', name, '类别中置顶此讨论。')],
  [/^Are you sure you want to unpin this discussion from (.+)\?$/, (_, name) => withCategory('确定要从', name, '取消置顶此讨论吗？')],
  // 页面标题段
  [/^Discussion #(\d+)$/, '讨论 #$1']
]

/**
 * 讨论详情：头部与状态、回答、评论与回复、反应以外的评论操作、投票（Poll）、侧栏（类别、标签、参与者、通知）、
 * 讨论操作（置顶、转移、锁定、关闭、删除、从讨论创建议题）及其对话框、隐藏评论、迁移提示。
 * 反应、评论编辑器、隐藏评论的原因、角色徽章说明、悬停卡片与通用按钮由 common-ui 词典负责。
 */
export default {
  static: {
    // 头部：<用户> started this conversation in <类别>
    'started this conversation in': '发起对话于',
    'asked this question in': '提问于',
    'announced in': '发布于',
    'Discussion options': '讨论选项',
    'Answered: jump to answer': '已回答：跳到答案',
    'This discussion was converted from issue': '此讨论转换自议题',
    'Converted from issue': '由议题转换',

    // 回答
    'Answered by': '回答者',
    'View full answer': '查看完整回答',
    'Mark as answer': '标记为答案',
    'Unmark as answer': '取消标记为答案',
    'Marked as answer': '已标记为答案',
    'Marked as Answer': '已标记为答案',
    'Marked then unmarked an answer': '标记后又取消了答案',
    'Answer selected by': '答案选定者',
    'Answer selected': '已选定答案',
    // 问答类别的答案编辑器标签
    'Suggest an answer': '提出答案',

    // 回复
    'Loading more replies...': '正在加载更多回复...',
    'Loading more replies…': '正在加载更多回复…',

    // 投票
    'You voted for this option': '你投给了此选项',
    "You can't vote on a locked discussion": '无法在已锁定的讨论中投票',
    'You can’t vote on a locked discussion': '无法在已锁定的讨论中投票',
    "Uh oh! You can't vote right now.": '糟糕！你现在无法投票。',
    'Uh oh! You can’t vote right now.': '糟糕！你现在无法投票。',
    'Sign in to vote': '登录后投票',

    // 关闭与重新打开（句式同议题的“以已完成关闭”）
    'Close discussion': '关闭讨论',
    'Reopen discussion': '重新打开讨论',
    'Close as resolved': '以已解决关闭',
    'Close as outdated': '以过时关闭',
    'Close as duplicate': '以重复关闭',
    'The discussion has been resolved': '讨论已解决',
    'The discussion is no longer relevant': '讨论已不再相关',
    'The discussion is a duplicate of another': '讨论与另一个讨论重复',
    'Closed as resolved': '已关闭为已解决',
    'Closed as outdated': '已关闭为过时',
    'Closed as duplicate': '已关闭为重复',

    // 侧栏标签
    'Apply labels to this discussion': '为此讨论应用标签',

    // 置顶
    'Pin discussion': '置顶讨论',
    'Unpin discussion': '取消置顶讨论',
    'Edit pinned discussion': '编辑置顶讨论',
    'Configure pinned discussion': '配置置顶讨论',
    'You can pin up to 4 discussions. They will appear publicly at the top of the discussions page.':
      '最多可置顶 4 个讨论。它们将公开显示在讨论页顶部。',
    'Pinning discussion…': '正在置顶讨论…',
    'Pinning discussion...': '正在置顶讨论...',
    'Are you sure you want to unpin this discussion?': '确定要取消置顶此讨论吗？',
    "The discussion itself won't be deleted, it just won't be shown prominently above the list of discussions.":
      '讨论本身不会被删除，只是不再显示在讨论列表上方。',
    'The discussion itself won’t be deleted, it just won’t be shown prominently above the list of discussions.':
      '讨论本身不会被删除，只是不再显示在讨论列表上方。',
    'Discussion has successfully been pinned.': '已置顶讨论。',
    'Discussion has been unpinned.': '已取消置顶讨论。',
    'Pin this discussion to this category': '将此讨论置顶到此类别',
    'Unpin discussion from this category': '从此类别取消置顶讨论',
    'Unpin from this category': '从此类别取消置顶',
    "The discussion itself won't be deleted, it just won't be shown at the top of this category.":
      '讨论本身不会被删除，只是不再显示在此类别顶部。',
    'The discussion itself won’t be deleted, it just won’t be shown at the top of this category.':
      '讨论本身不会被删除，只是不再显示在此类别顶部。',

    // 转移：Move this discussion to another repository owned by <strong>owner</strong>.
    'Transfer this discussion': '转移此讨论',
    'Transfer discussion': '转移讨论',
    'Move this discussion to another repository owned by': '将此讨论移动到以下所有者的其他存储库',
    'Move this discussion to another repository you own.': '将此讨论移动到你拥有的其他存储库。',
    "There aren't any eligible repositories to transfer this discussion to.": '没有可将此讨论转移到的存储库。',
    'There aren’t any eligible repositories to transfer this discussion to.': '没有可将此讨论转移到的存储库。',

    // 锁定
    'Lock discussion': '锁定讨论',
    'Unlock discussion': '解锁讨论',
    'Lock conversation on this discussion': '锁定此讨论的对话',
    'Unlock conversation on this discussion': '解锁此讨论的对话',
    'Are you sure you want to lock conversation on this discussion?': '确定要锁定此讨论的对话吗？',
    'Are you sure you want to unlock conversation on this discussion?': '确定要解锁此讨论的对话吗？',
    'You can always unlock this discussion again in the future.': '你以后随时可以再次解锁此讨论。',
    'will be able to comment on this discussion once more.': '将可以再次评论此讨论。',
    'You can always lock this discussion again in the future.': '你以后随时可以再次锁定此讨论。',

    // 从讨论创建议题、删除
    'Create issue from discussion': '从讨论创建议题',
    'The original post will be copied into a new issue, and the discussion will remain active.': '原帖将被复制到新议题中，讨论仍保持活跃。',
    'Delete discussion': '删除讨论',
    'Delete discussion?': '删除讨论？',
    'Delete this discussion': '删除此讨论',
    'The discussion will be deleted permanently. You will not be able to restore the discussion or its comments.':
      '讨论将被永久删除。讨论及其评论都将无法恢复。',
    'Deleting discussion…': '正在删除讨论…',
    'Deleting discussion...': '正在删除讨论...',
    'The discussion was successfully deleted.': '已删除讨论。',

    // 由议题转换时的迁移提示
    'This discussion is being migrated': '正在迁移此讨论',
    'The issue and any comments are still being copied to this discussion thread, please check back later.':
      '议题及其评论仍在复制到此讨论中，请稍后再来查看。'
  },
  scoped: {
    // 头部状态：Answered by <用户>（Answered 是链接，by 是单独的 span；Answered 由 common-ui 翻译）
    by: '回答者',
    Reopened: '已重新打开',
    'Return to top': '返回顶部',
    'Change category': '更改类别',
    'and others': '等人',

    // 评论
    Upvote: '赞成',
    'Remove upvote': '取消赞成',
    Answer: '回答',
    'Write a reply': '编写回复',
    'Reference in new issue': '在新议题中引用',
    // <用户>'s edit
    "'s edit": '的编辑',
    '’s edit': '的编辑',
    'Replies:': '回复：',
    'Sort comments': '评论排序',
    Top: '热门',
    'Are you sure you want to delete this comment?': '确定要删除此评论吗？',
    // 已保存回复为空：You can create one in your <a>settings</a>.（前段由 common-ui 翻译）
    settings: '设置',
    // 反应选择器与“All reactions”列表的 aria-label（表情别名，与 common-ui 的反应译法一致）
    tada: '欢呼',
    smile: '大笑',
    thinking_face: '困惑',
    confused: '困惑',
    heart: '爱心',
    rocket: '火箭',
    eyes: '眼睛',

    // 隐藏的评论
    'This comment was marked as spam.': '此评论已被标记为垃圾信息。',
    'This comment was marked as abuse.': '此评论已被标记为滥用。',
    'This comment was marked as off-topic.': '此评论已被标记为偏离主题。',
    'This comment was marked as outdated.': '此评论已被标记为过时。',
    'This comment was marked as duplicate.': '此评论已被标记为重复。',
    'This comment was marked as resolved.': '此评论已被标记为已解决。',
    'This comment has been hidden.': '此评论已被隐藏。',
    'This comment has been minimized.': '此评论已被折叠。',
    'Are you sure you want to unhide this comment?': '确定要取消隐藏此评论吗？',
    'Learn more about hiding a comment': '了解隐藏评论',
    'Too heated': '争论过激',

    // 未登录时的评论框（其余片段由 common-ui 翻译）
    'Remember, contributions to this repository should follow our': '请记住，对此存储库的贡献应遵守我们的',
    'contributing guidelines': '贡献指南',

    // 投票
    Vote: '投票',
    'Show Results': '显示结果',
    'Hide Results': '隐藏结果',
    'Show results': '显示结果',
    'Hide results': '隐藏结果',
    'Back to vote': '返回投票',

    // 侧栏通知（与议题共用；Customize 由 common-ui 翻译）
    ...withStraightQuotes(NOTIFICATION_REASONS),

    // 锁定对话框：Other users <strong>can’t add new comments</strong> to this discussion.
    'Lock conversation': '锁定对话',
    'Unlock conversation': '解锁对话',
    // 锁定时仍允许反应
    'Allow reactions': '允许反应',
    // 原文无逗号；与议题、拉取请求时间线的“锁定了对话并限制为仅协作者可评论”同一说法
    'This conversation has been locked and limited to collaborators.': '此对话已锁定并限制为仅协作者可评论。',
    'Other users': '其他用户',
    'can’t add new comments': '将无法',
    "can't add new comments": '将无法',
    // 片段译文依赖前文“将无法”，只在讨论页生效
    'to this discussion.': '向此讨论添加新评论。',
    // You and other collaborators <strong>with access</strong> to this repository <strong>can still leave comments</strong> …
    'You and other collaborators': '你和其他',
    'with access': '有权访问',
    'to this repository': '此存储库的协作者',
    'can still leave comments': '仍可发表',
    'that others can see.': '其他人可见的评论。',

    // 转移对话框
    'Results are limited to top repositories, search to find more.': '结果仅包含常用存储库，可搜索查找更多存储库。',
    "There aren't any eligible repositories that match your query.": '没有符合查询条件的可用存储库。',
    'There aren’t any eligible repositories that match your query.': '没有符合查询条件的可用存储库。',

    // 置顶对话框
    Background: '背景',
    Pattern: '图案',

    // 从讨论创建议题、迁移提示
    'OK, got it!': '好的，知道了！'
  },
  regexp,
  ignore: [
    // 投票：问题与选项
    '.poll-title',
    '.js-discussion-poll-options label',
    '.js-discussion-poll-results .Box-row .flex-auto'
  ]
} satisfies PageDictionary
