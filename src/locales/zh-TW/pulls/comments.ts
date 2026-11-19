import type { PageDictionary } from '../../../core/types'
import { ARIA_DATE_SOURCE, translateAriaDate } from '../common-ui/time'
import { joinCjk } from '../helpers'

/** 评论条目类型：Failed to load comment / Edit review */
const ITEM_TYPE: Readonly<Record<string, string>> = { comment: '留言', review: '審查' }

/** 线程的解决原因：Resolved as Won't fix */
const RESOLUTION_REASON: Readonly<Record<string, string>> = {
  Addressed: '已處理',
  "Won't fix": '不予修正',
  Incorrect: '不正確'
}

/** 批次无法提交的原因（横幅把前缀、原因、提示拼成一句） */
const BATCH_PREFIX: Readonly<Record<string, string>> = {
  'This batch doesn’t contain any suggestions to commit': '此批次不包含可提交的建議',
  'This batch contains items other than committable suggestions, so it can’t be committed': '此批次包含可提交建議以外的項目，因此無法提交'
}
const BATCH_REASON: Readonly<Record<string, string>> = {
  'Fix with Copilot isn’t available on your account': '你的帳號無法使用 Copilot 修正',
  'Fix with Copilot isn’t available on pull requests from a fork': '來自分叉的拉取請求無法使用 Copilot 修正'
}

function escapeSource(texts: Readonly<Record<string, string>>): string {
  return Object.keys(texts)
    .map(text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
}

/**
 * 线程位置加后缀：src/app.ts, lines 3 to 5 + 的留言 → src/app.ts 第 3 至 5 行的留言；
 * 没有行号时以路径结尾，后缀前加空格。
 */
function threadLabel(label: string, suffix: string): string {
  const located = label.replace(/, lines (\d+) to (\d+)$/, ' 第 $1 至 $2 行').replace(/, line (\d+)$/, ' 第 $1 行')
  return located.endsWith('行') ? located + suffix : `${located} ${suffix}`
}

/** 评论的读屏名称：octocat's comment, 3:45 PM today（时间与 common-ui 的读屏时间同一格式：今天 下午 3:45） */
const COMMENT_LABEL_SOURCE = `(?:[\\w-]+(?:\\[bot\\])?'s )?(?:comment|review), ${ARIA_DATE_SOURCE}`

/** octocat's comment, 3:45 PM today + 的更多動作 → octocat 的留言的更多動作，今天 下午 3:45 */
function commentLabel(text: string, suffix = ''): string {
  const match = /^(?:([\w-]+(?:\[bot\])?)'s )?(comment|review), (.+)$/.exec(text)
  if (!match) return text
  const [, login, kind, date] = match
  return `${login ? `${login} 的` : ''}${ITEM_TYPE[kind!]}${suffix}，${translateAriaDate(date!)}`
}

/**
 * 评论面板与批次管理：新版“已更改的文件”与概述页的评论列表（筛选、排序、空状态、线程预览与标题）、
 * 评论操作（隐藏、最小化、编辑历史记录）、批次管理面板（提交建议、交给 Copilot 修复）、附件标签页、堆栈详细信息、单文件模式提示。
 * comment 作「留言」（量词「則」），thread 作「討論串」，artifact 作「附件」，Newest / Oldest first 作「由新到舊 / 由舊到新」。
 */
export default {
  static: {
    // 评论列表
    'Loading previous comments': '正在載入先前的留言',
    'Load previous comments': '載入先前的留言',
    'Add a comment to start the conversation.': '新增留言以開始對話。',
    'No review comments yet': '尚無審查留言',
    'Request a review to get feedback on your changes.': '請求審查以取得對變更的意見回饋。',
    'Review and add comments to share your feedback.': '審查並新增留言以分享你的意見回饋。',
    'All comments resolved': '所有留言皆已解決',
    'All review comments have been resolved. Nice work!': '所有審查留言皆已解決。做得好！',
    "You haven't left any review comments yet": '你尚未留下任何審查留言',
    'Unable to load comments': '無法載入留言',
    'Try reloading the pull request page.': '請嘗試重新載入拉取請求頁面。',
    'Loading comments...': '正在載入留言...',
    'Loading conversation timeline': '正在載入對話時間軸',
    // 评论筛选与排序
    'Additional comment filters': '更多留言篩選器',
    'Additional comment filters (filters applied)': '更多留言篩選器（已套用篩選器）',
    'Show resolved comments': '顯示已解決的留言',
    'Show outdated comments': '顯示過時的留言',
    'Show hidden comments': '顯示已隱藏的留言',
    'Show AI and bot comments': '顯示 AI 和機器人留言',
    'Filter comments by author': '依作者篩選留言',
    'Newest-first sort': '由新到舊排序',
    'The latest comments are now shown first, bringing the newest activity to the top.': '現在會優先顯示最新的留言，讓最新的活動位於頂端。',
    'If you prefer, you can use the sort menu to change back to showing the oldest comments first.':
      '如有需要，你可以使用排序選單改回優先顯示最舊的留言。',
    'Open sort menu': '開啟排序選單',
    'Comments view mode': '留言檢視模式',
    // 评论操作
    'The comment editing form cannot be displayed. Please reload the page to try again.':
      '無法顯示留言編輯表單。請重新載入頁面後再試一次。',
    'Open review comment': '展開審查留言',
    'Close review comment': '摺疊審查留言',
    'Jump to the comment in the diff': '跳至差異中的留言',
    'Unminimize comment': '取消最小化留言',
    'Minimize comment': '最小化留言',
    'Hide for everyone': '對所有人隱藏',
    'Unhide for everyone': '對所有人取消隱藏',
    'Posting comment…': '正在發表留言…',
    'New comment added successfully.': '已新增留言。',
    'Add comment form': '新增留言表單',
    'Comment updated successfully.': '留言已更新。',
    'Comment deleted successfully.': '留言已刪除。',
    'View comment in diff': '在差異中查看留言',
    'Expand review': '展開審查',
    'Collapse review': '摺疊審查',
    'Edit review': '編輯審查',
    'Update review': '更新審查',
    'Review updated successfully.': '審查已更新。',
    'Failed to submit reply': '無法送出回覆',
    // 新版“已更改的文件”介绍
    "It's faster, more accessible, and includes new features like commenting anywhere in changed files and file tree indicators.":
      '新版速度更快、無障礙體驗更好，並加入在變更的檔案中任意位置留言和檔案樹指示器等新功能。',
    "You're in single-file mode": '你正在使用單一檔案模式',
    'No alerts found': '找不到警示',

    // 批次管理
    'No comments in batch': '批次中沒有留言',
    "Add a review comment to the batch from any comment's resolve row.": '可從任一留言的解決列將審查留言加入批次。',
    'Comment too long to preview here.': '留言過長而無法在此預覽。',
    'View full comment': '查看完整留言',
    'Commit description': '提交描述',
    'There was an error trying to commit changes': '嘗試提交變更時發生錯誤',
    'Batch actions unavailable': '批次動作無法使用',
    'There was an error sending the batch to Copilot': '將批次傳送給 Copilot 時發生錯誤',
    'Additional instructions cleared for the new batch.': '已為新批次清除附加指示。',
    // 产品名按 product-names.md 译出：Copilot cloud agent → Copilot 雲端代理
    'Batch sent to Copilot cloud agent.': '已將批次傳送給 Copilot 雲端代理。',
    'Ask Copilot cloud agent to address the comments in this batch.': '讓 Copilot 雲端代理處理此批次中的留言。',
    'will be added as co-author on any new commits.': '將列為所有新提交的共同作者。',
    'Additional instructions for Copilot': '給 Copilot 的附加指示',
    'Add additional instructions for Copilot...': '為 Copilot 新增附加指示...',
    'Model: Auto': '模型：自動',
    'Change Fix with Copilot action': '變更使用 Copilot 修正的動作',
    'Expanded all batched comments': '已展開所有批次中的留言',
    'Collapsed all batched comments': '已摺疊所有批次中的留言',
    'Fix with Copilot isn’t available.': '無法使用 Copilot 修正。',
    'This batch does not contain any suggestions that can be committed.': '此批次不包含任何可提交的建議。',
    'This batch contains items other than committable suggestions, so it can’t be committed.':
      '此批次包含可提交建議以外的項目，因此無法提交。',
    'Manage batch action mode': '管理批次動作模式',

    // 附件标签页
    'Loading artifacts…': '正在載入附件…',
    'Unable to load artifacts': '無法載入附件',
    'No artifacts yet': '尚無附件',
    'Artifacts created for this pull request will appear here': '為此拉取請求建立的附件會顯示在這裡',
    'Artifact not found': '找不到附件',
    'Select an artifact from the sidebar': '從側邊欄選取附件'
  },
  scoped: {
    'No comments yet': '尚無留言',
    'Newest first': '由新到舊',
    'Oldest first': '由舊到新',
    'Code order': '程式碼順序',
    Mine: '我的',
    'Edit history': '編輯歷史記錄',
    // 经典反应选择器的 aria-label（thumbs up、laugh 等由 common-ui 收录，与讨论页同译）；
    // 评论框表情符号自动补全列表已由引擎整体忽略，其中的同名别名不受影响
    confused: '困惑',
    heart: '愛心',
    rocket: '火箭',
    eyes: '眼睛',
    'unknown user': '未知使用者',
    Review: '審查',
    Category: '類別',
    // 工具栏：Discard <batch> / Commit <suggestions>
    batch: '批次',
    'Batched comments': '批次中的留言',
    // <You> will be added as co-author …（取不到用户名时）
    You: '你',
    Auto: '自動'
  },
  regexp: [
    // 评论计数：Showing 3 of 10 loaded comments / Showing 3 of 10 review comments
    [
      /^Showing (\d+) of (\d+)( loaded)?( review)? comments$/,
      (_, shown, total, loaded, review) => `顯示 ${shown}/${total} 則${loaded ? '已載入的' : ''}${review ? '審查' : ''}留言`
    ],
    [/^Only the (\d+) latest comments are being shown\.$/, '僅顯示最新的 $1 則留言。'],
    [/^(\d+) earlier comments?$/, '$1 則較早的留言'],
    [/^(\d+) later repl(?:y|ies)$/, '$1 則後續回覆'],
    // 折叠的提交：3 additional commits by <作者>；读屏：… , starting at commit abc1234（by 译「來自」，不加逗号）
    [/^(\d+) additional commits?$/, '另外 $1 個提交'],
    [/^(\d+) additional commits? by$/, '另外 $1 個提交來自'],
    [
      /^(\d+) additional commits?(?: by (.+))?, starting at commit ([0-9a-f]{7,40})$/,
      (_, count, authors, sha) => `另外 ${count} 個提交${authors ? `來自 ${authors}` : ''}，從提交 ${sha} 開始`
    ],
    [/^Commit: (.+)$/, '提交：$1'],
    // 条目加载失败：Failed to load comment / This review cannot be displayed. …
    [/^Failed to load (comment|review)$/, (_, kind) => `無法載入${ITEM_TYPE[kind]}`],
    [
      /^This (comment|review) cannot be displayed\. Please reload the page to try again\.$/,
      (_, kind) => `無法顯示此${ITEM_TYPE[kind]}。請重新載入頁面後再試一次。`
    ],
    [/^Failed to update (comment|review)$/, (_, kind) => `無法更新${ITEM_TYPE[kind]}`],
    [
      /^Review comment by ([\w-]+(?:\[bot\])?|unknown user)$/,
      (_, login) => `${login === 'unknown user' ? '未知使用者' : `${login} `}的審查留言`
    ],
    // 线程标题：Line 5 / Lines 3 - 5；Resolved as Won't fix（与审查讨论串「解決為」同一写法，不加冒号）
    [/^Line (\d+)$/, '第 $1 行'],
    [/^Lines (\d+) - (\d+)$/, '第 $1 - $2 行'],
    [/^Resolved as (Addressed|Won't fix|Incorrect)$/, (_, reason) => `已解決為${RESOLUTION_REASON[reason]}`],
    // 带线程位置的读屏名称：… in src/app.ts, line 5
    [
      /^(Open|Close) review comment in (.+)$/,
      (_, action, label) => `${action === 'Open' ? '展開' : '摺疊'} ${threadLabel(label, '的審查留言')}`
    ],
    [/^Jump to the comment in the diff for (.+)$/, (_, label) => `跳至差異中 ${threadLabel(label, '的留言')}`],
    [
      /^(Resolve|Unresolve) (comment|conversation) in (.+)$/,
      (_, action, kind, label) =>
        `${action === 'Resolve' ? '解決' : '取消解決'} ${threadLabel(label, kind === 'comment' ? '的留言' : '的對話')}`
    ],
    [/^Resolve with reason in (.+)$/, (_, label) => `附上原因解決 ${threadLabel(label, '的留言')}`],
    [/^Write a reply in (.+)$/, (_, label) => `在 ${threadLabel(label, '中撰寫回覆')}`],
    [
      /^View comment in diff for (.+), (\d+) previous comments?$/,
      (_, label, count) => `在差異中查看 ${threadLabel(label, '的留言')}，先前有 ${count} 則留言`
    ],
    // 评论的读屏名称：More actions for octocat's comment, 3:45 PM today（原文无冒号）；编辑历史记录后的 for …
    [new RegExp(`^More actions for (${COMMENT_LABEL_SOURCE})$`), (_, label) => commentLabel(label, '的更多動作')],
    // 编辑历史记录后的读屏文字：Edit history <span> for octocat's review, …</span>（原文无括号）
    [new RegExp(`^for (${COMMENT_LABEL_SOURCE})$`), (_, label) => joinCjk('關於', commentLabel(label))],
    // 批次管理：View <行> in Files changed / Remove <行> from batch（原文界面名无引号，译文不加）
    [/^View (.+) in Files changed$/, '在變更的檔案中查看 $1'],
    [/^View comment on (.+)$/, '查看 $1 上的留言'],
    [/^View full comment by ([\w-]+(?:\[bot\])?) on (.+)$/, '查看 $1 在 $2 上的完整留言'],
    [/^Remove (.+) from batch \(outdated\)$/, '從批次中移除 $1（過時）'],
    [/^Remove (.+) from batch$/, '從批次中移除 $1'],
    [
      new RegExp(
        `^(${escapeSource(BATCH_PREFIX)}), and (${escapeSource(BATCH_REASON)})\\. You can still publish your review from the review menu\\.$`
      ),
      (_, prefix, reason) => `${BATCH_PREFIX[prefix]}，且${BATCH_REASON[reason]}。你仍可在審查選單中發布審查。`
    ]
  ],
  inline: [
    // 评论头部的读屏标题（React 评论头部）：<h3 class="sr-only">octocat commented <relative-time></h3>。
    // 后接时间，与 common-ui 的片段 commented 同译「留言於」；不按整句时会落到合并框审查者列表的读屏名称正则（不带时间，作「發表了留言」）
    [/^([\w.-]+(?:\[bot\])?) commented \{\}$/, '$1 留言於 {}']
  ]
} satisfies PageDictionary
