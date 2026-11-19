import type { PageDictionary, RegExpRule } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'
import { withCategory } from './categories'
import { COMMENT_TIME_SOURCE, commentTime } from './list'

/** 侧栏通知原因（弯引号原文）；直引号写法由 withStraightQuotes 补齐。原文无逗号，译文用「因…而…」，不加逗号 */
const NOTIFICATION_REASONS: Readonly<Record<string, string>> = {
  'You’re receiving notifications because you’re watching this repository.': '你因正在關注此儲存庫而收到通知。',
  'You’re receiving notifications because you are watching issues on this repository.': '你因正在關注此儲存庫的議題而收到通知。',
  'You’re receiving notifications because you are watching pull requests on this repository.': '你因正在關注此儲存庫的拉取請求而收到通知。',
  'You’re receiving notifications because you authored the thread.': '你因是此討論串的作者而收到通知。',
  'You’re receiving notifications because you’re subscribed to this thread.': '你因已訂閱此討論串而收到通知。',
  'You’re receiving notifications because you were mentioned.': '你因被提及而收到通知。',
  'You’re receiving notifications because you commented.': '你因留言而收到通知。',
  'You’re receiving notifications because you modified the open/close state.': '你因變更了開啟/關閉狀態而收到通知。',
  // 持续关系带宾语用「正在＋动词」，与拉取请求页同译
  'You’re ignoring this repository.': '你正在忽略此儲存庫。'
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
  ['resolved', '已解決'],
  ['outdated', '過時'],
  ['duplicate', '重複']
])

const regexp: readonly RegExpRule[] = [
  // 详情（edited by X、Edited N times、N hidden items 由 common-ui 翻译）
  [/^Answered by ([^\s()]+)$/, '由 $1 回答'],
  // 头部状态标签的 title：Status: Closed as resolved（Status: Open 等由 common-ui 翻译）
  [
    /^Status: Closed as (resolved|outdated|duplicate)$/,
    (_, reason: string) => `狀態：已關閉並標示為${CLOSE_REASONS.get(reason) ?? reason}`
  ],
  // 原文没有括号：日期改放在句中（This discussion was converted from issue #12 on Jan 5, 2024.）；未匹配的日期为空串
  [
    new RegExp(`^This discussion was converted from issue #(\\d+)(?: on (${DATE_SOURCE}))?(\\.?)$`),
    (_, number: string, date: string, period: string) =>
      `此討論${date ? joinCjk('於', translateTime(date)) : ''}由議題 #${number} 轉換而來${period ? '。' : ''}`
  ],
  [/^This user is sponsoring ([^\s()]+)\.$/, '此使用者正在贊助 $1。'],
  [/^Congratulations, you['’]ve created the first discussion in (.+)!$/, '恭喜，你已在 $1 中建立第一個討論！'],
  // 登录后评论的按钮名称：Upvote: (86): octocat, 09:00AM on May 12, 2022 / Write a reply: octocat, 01:16PM today
  [
    new RegExp(`^Upvote: \\((\\d[\\d,]*)\\): ([^\\s,]+), (${COMMENT_TIME_SOURCE})$`),
    (_, count, user, time) => `贊成 (${count})：${user}，${commentTime(time)}`
  ],
  [new RegExp(`^Write a reply: ([^\\s,]+), (${COMMENT_TIME_SOURCE})$`), (_, user, time) => `撰寫回覆：${user}，${commentTime(time)}`],
  // 投票：2 votes、2k votes
  [/^(\d[\d,.]*[kKmM]?) votes?$/, '$1 票'],
  // 回复
  [/^Show (\d[\d,]*) previous repl(?:y|ies)$/, '顯示先前的 $1 則回覆'],
  [/^Show (\d[\d,]*) more repl(?:y|ies)$/, '再顯示 $1 則回覆'],
  // 固定（类别名原文不带引号，译文也不加）
  [/^Discussion "(.+)" has been unpinned\.$/, '已取消釘選討論「$1」。'],
  [/^Discussion pinned to (.+)$/, (_, name) => withCategory('已將討論釘選到', name)],
  [/^Discussion unpinned from (.+)$/, (_, name) => withCategory('已從', name, '取消釘選討論')],
  [/^Pin discussion to (.+)$/, (_, name) => withCategory('將討論釘選到', name)],
  [/^Pin to (.+)$/, (_, name) => withCategory('釘選到', name)],
  [
    /^This will pin this discussion to the top of the (.+) category\.$/,
    (_, name) => withCategory('這會將此討論釘選到', name, '類別的頂端。')
  ],
  [/^Are you sure you want to unpin this discussion from (.+)\?$/, (_, name) => withCategory('確定要從', name, '取消釘選此討論嗎？')],
  // 页面标题段
  [/^Discussion #(\d+)$/, '討論 #$1']
]

/**
 * 讨论详情：头部与状态、回答、评论与回复、反应以外的评论操作、投票（Poll）、侧栏（类别、标签、参与者、通知）、
 * 讨论操作（固定、转移、锁定、关闭、删除、从讨论创建议题）及其对话框、隐藏评论、迁移提示。
 * 反应、评论编辑器、隐藏评论的原因、角色徽章说明、悬停卡片与通用按钮由 common-ui 词典负责。
 */
export default {
  static: {
    // 头部：<用户> started this conversation in <类别>
    'started this conversation in': '發起此對話於',
    'asked this question in': '提出此問題於',
    'announced in': '發布於',
    'Discussion options': '討論選項',
    'Answered: jump to answer': '已回答：跳至答案',
    'This discussion was converted from issue': '此討論轉換自議題',
    'Converted from issue': '轉換自議題',

    // 回答
    'Answered by': '回答者',
    'View full answer': '查看完整回答',
    'Mark as answer': '標示為答案',
    'Unmark as answer': '取消標示為答案',
    'Marked as answer': '已標示為答案',
    'Marked as Answer': '已標示為答案',
    'Marked then unmarked an answer': '標示了答案後又取消標示',
    'Answer selected by': '答案選定者',
    'Answer selected': '已選定答案',
    // 问答类别的答案编辑器标签
    'Suggest an answer': '提出答案',

    // 回复
    'Loading more replies...': '正在載入更多回覆...',
    'Loading more replies…': '正在載入更多回覆…',

    // 投票
    'You voted for this option': '你投給了此選項',
    "You can't vote on a locked discussion": '無法在已鎖定的討論中投票',
    'You can’t vote on a locked discussion': '無法在已鎖定的討論中投票',
    "Uh oh! You can't vote right now.": '糟糕！你現在無法投票。',
    'Uh oh! You can’t vote right now.': '糟糕！你現在無法投票。',
    'Sign in to vote': '登入後投票',

    // 关闭与重新打开（句式同议题的「關閉並標示為完成」）
    'Close discussion': '關閉討論',
    'Reopen discussion': '重新開啟討論',
    'Close as resolved': '關閉並標示為已解決',
    'Close as outdated': '關閉並標示為過時',
    'Close as duplicate': '關閉並標示為重複',
    'The discussion has been resolved': '討論已解決',
    'The discussion is no longer relevant': '討論已不再相關',
    'The discussion is a duplicate of another': '討論與另一個討論重複',
    'Closed as resolved': '已關閉並標示為已解決',
    'Closed as outdated': '已關閉並標示為過時',
    'Closed as duplicate': '已關閉並標示為重複',

    // 侧栏标签
    'Apply labels to this discussion': '為此討論套用標籤',

    // 固定
    'Pin discussion': '釘選討論',
    'Unpin discussion': '取消釘選討論',
    'Edit pinned discussion': '編輯已釘選的討論',
    'Configure pinned discussion': '設定已釘選的討論',
    'You can pin up to 4 discussions. They will appear publicly at the top of the discussions page.':
      '最多可釘選 4 個討論。這些討論會公開顯示在討論頁面頂端。',
    'Pinning discussion…': '正在釘選討論…',
    'Pinning discussion...': '正在釘選討論...',
    'Are you sure you want to unpin this discussion?': '確定要取消釘選此討論嗎？',
    "The discussion itself won't be deleted, it just won't be shown prominently above the list of discussions.":
      '討論本身不會被刪除，只是不再醒目顯示於討論清單上方。',
    'The discussion itself won’t be deleted, it just won’t be shown prominently above the list of discussions.':
      '討論本身不會被刪除，只是不再醒目顯示於討論清單上方。',
    'Discussion has successfully been pinned.': '已釘選討論。',
    'Discussion has been unpinned.': '已取消釘選討論。',
    'Pin this discussion to this category': '將此討論釘選到此類別',
    'Unpin discussion from this category': '從此類別取消釘選討論',
    'Unpin from this category': '從此類別取消釘選',
    "The discussion itself won't be deleted, it just won't be shown at the top of this category.":
      '討論本身不會被刪除，只是不再顯示於此類別頂端。',
    'The discussion itself won’t be deleted, it just won’t be shown at the top of this category.':
      '討論本身不會被刪除，只是不再顯示於此類別頂端。',

    // 转移：Move this discussion to another repository owned by <strong>owner</strong>.
    'Transfer this discussion': '轉移此討論',
    'Transfer discussion': '轉移討論',
    'Move this discussion to another repository owned by': '將此討論移到以下擁有者的其他儲存庫',
    'Move this discussion to another repository you own.': '將此討論移到你擁有的其他儲存庫。',
    "There aren't any eligible repositories to transfer this discussion to.": '沒有符合資格的儲存庫可轉移此討論。',
    'There aren’t any eligible repositories to transfer this discussion to.': '沒有符合資格的儲存庫可轉移此討論。',

    // 锁定
    'Lock discussion': '鎖定討論',
    'Unlock discussion': '解除鎖定討論',
    'Lock conversation on this discussion': '鎖定此討論的對話',
    'Unlock conversation on this discussion': '解除鎖定此討論的對話',
    'Are you sure you want to lock conversation on this discussion?': '確定要鎖定此討論的對話嗎？',
    'Are you sure you want to unlock conversation on this discussion?': '確定要解除鎖定此討論的對話嗎？',
    'You can always unlock this discussion again in the future.': '你之後隨時可以再次解除鎖定此討論。',
    'will be able to comment on this discussion once more.': '都將能再次在此討論中留言。',
    'You can always lock this discussion again in the future.': '你之後隨時可以再次鎖定此討論。',

    // 从讨论创建议题、删除
    'Create issue from discussion': '從討論建立議題',
    'The original post will be copied into a new issue, and the discussion will remain active.':
      '原始貼文將複製到新議題，討論仍會保持活躍。',
    'Delete discussion': '刪除討論',
    'Delete discussion?': '要刪除討論嗎？',
    'Delete this discussion': '刪除此討論',
    'The discussion will be deleted permanently. You will not be able to restore the discussion or its comments.':
      '討論將永久刪除。你將無法還原討論或其留言。',
    'Deleting discussion…': '正在刪除討論…',
    'Deleting discussion...': '正在刪除討論...',
    'The discussion was successfully deleted.': '已刪除討論。',

    // 由议题转换时的迁移提示
    'This discussion is being migrated': '正在移轉此討論',
    'The issue and any comments are still being copied to this discussion thread, please check back later.':
      '議題和所有留言仍在複製到此討論串，請稍後再回來查看。'
  },
  scoped: {
    // 头部状态：Answered by <用户>（Answered 是链接，by 是单独的 span；Answered 由 common-ui 翻译）
    by: '回答者',
    Reopened: '已重新開啟',
    'Return to top': '回到頂端',
    'Change category': '變更類別',
    'and others': '等人',

    // 评论
    Upvote: '贊成',
    'Remove upvote': '取消贊成',
    Answer: '回答',
    'Write a reply': '撰寫回覆',
    'Reference in new issue': '在新議題中參考',
    // <用户>'s edit
    "'s edit": '的編輯',
    '’s edit': '的編輯',
    'Replies:': '回覆：',
    'Sort comments': '留言排序',
    Top: '熱門',
    'Are you sure you want to delete this comment?': '確定要刪除此留言嗎？',
    // 已保存回复为空：You can create one in your <a>settings</a>.（前段由 common-ui 翻译）
    settings: '設定',
    // 反应选择器与“All reactions”列表的 aria-label（表情别名，与 common-ui 的反应译法一致）
    tada: '歡呼',
    smile: '大笑',
    thinking_face: '困惑',
    confused: '困惑',
    heart: '愛心',
    rocket: '火箭',
    eyes: '眼睛',

    // 隐藏的评论
    'This comment was marked as spam.': '此留言已標示為垃圾內容。',
    'This comment was marked as abuse.': '此留言已標示為濫用。',
    'This comment was marked as off-topic.': '此留言已標示為離題。',
    'This comment was marked as outdated.': '此留言已標示為過時。',
    'This comment was marked as duplicate.': '此留言已標示為重複。',
    'This comment was marked as resolved.': '此留言已標示為已解決。',
    'This comment has been hidden.': '此留言已隱藏。',
    'This comment has been minimized.': '此留言已最小化。',
    'Are you sure you want to unhide this comment?': '確定要取消隱藏此留言嗎？',
    'Learn more about hiding a comment': '瞭解隱藏留言',
    'Too heated': '過於激烈',

    // 未登录时的评论框（其余片段由 common-ui 翻译）
    'Remember, contributions to this repository should follow our': '請記得，對此儲存庫的貢獻應遵守我們的',
    'contributing guidelines': '貢獻指南',

    // 投票
    Vote: '投票',
    'Show Results': '顯示結果',
    'Hide Results': '隱藏結果',
    'Show results': '顯示結果',
    'Hide results': '隱藏結果',
    'Back to vote': '返回投票',

    // 侧栏通知（与议题共用；Customize 由 common-ui 翻译）
    ...withStraightQuotes(NOTIFICATION_REASONS),

    // 锁定对话框：Other users <strong>can’t add new comments</strong> to this discussion.
    'Lock conversation': '鎖定對話',
    'Unlock conversation': '解除鎖定對話',
    // 锁定时仍允许反应
    'Allow reactions': '允許表情回應',
    // 原文无逗号；与议题、拉取请求时间线「鎖定了對話並限制為僅協作者可留言」同一说法
    'This conversation has been locked and limited to collaborators.': '此對話已鎖定並限制為僅協作者可留言。',
    'Other users': '其他使用者',
    'can’t add new comments': '將無法',
    "can't add new comments": '將無法',
    // 片段译文依赖前文「將無法」，只在讨论页生效
    'to this discussion.': '在此討論中新增留言。',
    // You and other collaborators <strong>with access</strong> to this repository <strong>can still leave comments</strong> …
    'You and other collaborators': '你和其他',
    'with access': '有權存取',
    'to this repository': '此儲存庫的協作者',
    'can still leave comments': '仍可發表',
    'that others can see.': '其他人可見的留言。',

    // 转移对话框
    'Results are limited to top repositories, search to find more.': '結果僅限常用儲存庫，搜尋可找到更多。',
    "There aren't any eligible repositories that match your query.": '沒有符合查詢條件的合格儲存庫。',
    'There aren’t any eligible repositories that match your query.': '沒有符合查詢條件的合格儲存庫。',

    // 固定对话框
    Background: '背景',
    Pattern: '圖案',

    // 从讨论创建议题、迁移提示
    'OK, got it!': '好，我知道了！'
  },
  regexp,
  ignore: [
    // 投票：问题与选项
    '.poll-title',
    '.js-discussion-poll-options label',
    '.js-discussion-poll-results .Box-row .flex-auto'
  ]
} satisfies PageDictionary
