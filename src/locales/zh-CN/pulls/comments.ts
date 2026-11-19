import type { PageDictionary } from '../../../core/types'
import { ARIA_DATE_SOURCE, translateAriaDate } from '../common-ui/time'
import { joinCjk } from '../helpers'

/** 评论条目类型：Failed to load comment / Edit review */
const ITEM_TYPE: Readonly<Record<string, string>> = { comment: '评论', review: '审查' }

/** 线程的解决原因：Resolved as Won't fix */
const RESOLUTION_REASON: Readonly<Record<string, string>> = {
  Addressed: '已处理',
  "Won't fix": '不予修复',
  Incorrect: '不正确'
}

/** 批次无法提交的原因（横幅把前缀、原因、提示拼成一句） */
const BATCH_PREFIX: Readonly<Record<string, string>> = {
  'This batch doesn’t contain any suggestions to commit': '此批次不包含可提交的建议',
  'This batch contains items other than committable suggestions, so it can’t be committed': '此批次包含可提交建议以外的项，无法提交'
}
const BATCH_REASON: Readonly<Record<string, string>> = {
  'Fix with Copilot isn’t available on your account': '你的帐户不支持使用 Copilot 修复',
  'Fix with Copilot isn’t available on pull requests from a fork': '来自复刻的拉取请求不支持使用 Copilot 修复'
}

function escapeSource(texts: Readonly<Record<string, string>>): string {
  return Object.keys(texts)
    .map(text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
}

/**
 * 线程位置加后缀：src/app.ts, lines 3 to 5 + 的评论 → src/app.ts 第 3 至 5 行的评论；
 * 没有行号时以路径结尾，后缀前加空格。
 */
function threadLabel(label: string, suffix: string): string {
  const located = label.replace(/, lines (\d+) to (\d+)$/, ' 第 $1 至 $2 行').replace(/, line (\d+)$/, ' 第 $1 行')
  return located.endsWith('行') ? located + suffix : `${located} ${suffix}`
}

/** 评论的读屏名称：octocat's comment, 3:45 PM today（时间与 common-ui 的读屏时间同一格式：今天 15:45） */
const COMMENT_LABEL_SOURCE = `(?:[\\w-]+(?:\\[bot\\])?'s )?(?:comment|review), ${ARIA_DATE_SOURCE}`

/** octocat's comment, 3:45 PM today + 的更多操作 → octocat 的评论的更多操作，今天 15:45 */
function commentLabel(text: string, suffix = ''): string {
  const match = /^(?:([\w-]+(?:\[bot\])?)'s )?(comment|review), (.+)$/.exec(text)
  if (!match) return text
  const [, login, kind, date] = match
  return `${login ? `${login} 的` : ''}${ITEM_TYPE[kind!]}${suffix}，${translateAriaDate(date!)}`
}

/**
 * 评论面板与批次管理：新版“已更改的文件”与概述页的评论列表（筛选、排序、空状态、线程预览与标题）、
 * 评论操作（隐藏、最小化、编辑历史记录）、批次管理面板（提交建议、交给 Copilot 修复）、附件标签页、堆栈详细信息、单文件模式提示。
 */
export default {
  static: {
    // 评论列表
    'Loading previous comments': '正在加载之前的评论',
    'Load previous comments': '加载之前的评论',
    'Add a comment to start the conversation.': '添加评论以开始对话。',
    'No review comments yet': '暂无审查评论',
    'Request a review to get feedback on your changes.': '请求审查以获取对更改的反馈。',
    'Review and add comments to share your feedback.': '审查并添加评论以分享你的反馈。',
    'All comments resolved': '所有评论均已解决',
    'All review comments have been resolved. Nice work!': '所有审查评论均已解决。干得好！',
    "You haven't left any review comments yet": '你还没有留下任何审查评论',
    'Unable to load comments': '无法加载评论',
    'Try reloading the pull request page.': '请重新加载拉取请求页面。',
    'Loading comments...': '正在加载评论...',
    'Loading conversation timeline': '正在加载对话时间线',
    // 评论筛选与排序
    'Additional comment filters': '更多评论筛选器',
    'Additional comment filters (filters applied)': '更多评论筛选器（已应用筛选器）',
    'Show resolved comments': '显示已解决的评论',
    'Show outdated comments': '显示过时的评论',
    'Show hidden comments': '显示已隐藏的评论',
    'Show AI and bot comments': '显示 AI 和机器人评论',
    'Filter comments by author': '按作者筛选评论',
    'Newest-first sort': '最新优先排序',
    'The latest comments are now shown first, bringing the newest activity to the top.': '现在最新的评论优先显示，最新动态位于顶部。',
    'If you prefer, you can use the sort menu to change back to showing the oldest comments first.':
      '如有需要，可使用排序菜单改回最早的评论优先显示。',
    'Open sort menu': '打开排序菜单',
    'Comments view mode': '评论视图模式',
    // 评论操作
    'The comment editing form cannot be displayed. Please reload the page to try again.': '无法显示评论编辑表单。请重新加载页面后重试。',
    'Open review comment': '展开审查评论',
    'Close review comment': '收起审查评论',
    'Jump to the comment in the diff': '跳转到差异中的评论',
    'Unminimize comment': '取消最小化评论',
    'Minimize comment': '最小化评论',
    'Hide for everyone': '对所有人隐藏',
    'Unhide for everyone': '对所有人取消隐藏',
    'Posting comment…': '正在发布评论…',
    'New comment added successfully.': '已添加新评论。',
    'Add comment form': '添加评论表单',
    'Comment updated successfully.': '评论已更新。',
    'Comment deleted successfully.': '评论已删除。',
    'View comment in diff': '在差异中查看评论',
    'Expand review': '展开审查',
    'Collapse review': '折叠审查',
    'Edit review': '编辑审查',
    'Update review': '更新审查',
    'Review updated successfully.': '审查已更新。',
    'Failed to submit reply': '提交回复失败',
    // 新版“已更改的文件”介绍
    "It's faster, more accessible, and includes new features like commenting anywhere in changed files and file tree indicators.":
      '新版更快、辅助功能更完善，并带来可在已更改的文件中任意位置评论和文件树指示器等新功能。',
    "You're in single-file mode": '你正在使用单文件模式',
    'No alerts found': '未找到警报',

    // 批次管理
    'No comments in batch': '批次中没有评论',
    "Add a review comment to the batch from any comment's resolve row.": '可从任意评论的解决行将审查评论添加到批次。',
    'Comment too long to preview here.': '评论因过长而无法在此预览。',
    'View full comment': '查看完整评论',
    'Commit description': '提交描述',
    'There was an error trying to commit changes': '提交更改时出错',
    'Batch actions unavailable': '批次操作不可用',
    'There was an error sending the batch to Copilot': '将批次发送给 Copilot 时出错',
    'Additional instructions cleared for the new batch.': '已为新批次清除附加说明。',
    // 产品名按 product-names.md 译出：Copilot cloud agent → Copilot 云端智能体
    'Batch sent to Copilot cloud agent.': '批次已发送给 Copilot 云端智能体。',
    'Ask Copilot cloud agent to address the comments in this batch.': '让 Copilot 云端智能体处理此批次中的评论。',
    'will be added as co-author on any new commits.': '将作为共同作者添加到所有新提交中。',
    'Additional instructions for Copilot': '给 Copilot 的附加说明',
    'Add additional instructions for Copilot...': '为 Copilot 添加附加说明...',
    'Model: Auto': '模型：自动',
    'Change Fix with Copilot action': '更改使用 Copilot 修复的操作',
    'Expanded all batched comments': '已展开所有批次评论',
    'Collapsed all batched comments': '已折叠所有批次评论',
    'Fix with Copilot isn’t available.': '使用 Copilot 修复不可用。',
    'This batch does not contain any suggestions that can be committed.': '此批次不包含可提交的建议。',
    'This batch contains items other than committable suggestions, so it can’t be committed.': '此批次包含可提交建议以外的项，无法提交。',
    'Manage batch action mode': '批次操作模式',

    // 附件标签页
    'Loading artifacts…': '正在加载附件…',
    'Unable to load artifacts': '无法加载附件',
    'No artifacts yet': '暂无附件',
    'Artifacts created for this pull request will appear here': '为此拉取请求创建的附件将显示在这里',
    'Artifact not found': '未找到附件',
    'Select an artifact from the sidebar': '从侧栏中选择一个附件'
  },
  scoped: {
    'No comments yet': '暂无评论',
    'Newest first': '最新优先',
    'Oldest first': '最早优先',
    'Code order': '代码顺序',
    Mine: '我的',
    'Edit history': '编辑历史记录',
    // 经典反应选择器的 aria-label（thumbs up、laugh 等由 common-ui 收录，与讨论页同译）；
    // 评论框表情符号自动补全列表已由引擎整体忽略，其中的同名别名不受影响
    confused: '困惑',
    heart: '爱心',
    rocket: '火箭',
    eyes: '眼睛',
    'unknown user': '未知用户',
    Review: '审查',
    Category: '类别',
    // 工具栏：Discard <batch> / Commit <suggestions>
    batch: '批次',
    'Batched comments': '批次中的评论',
    // <You> will be added as co-author …（取不到用户名时）
    You: '你',
    Auto: '自动'
  },
  regexp: [
    // 评论计数：Showing 3 of 10 loaded comments / Showing 3 of 10 review comments
    [
      /^Showing (\d+) of (\d+)( loaded)?( review)? comments$/,
      (_, shown, total, loaded, review) => `显示 ${shown}/${total} 条${loaded ? '已加载的' : ''}${review ? '审查' : ''}评论`
    ],
    [/^Only the (\d+) latest comments are being shown\.$/, '仅显示最新的 $1 条评论。'],
    [/^(\d+) earlier comments?$/, '$1 条更早的评论'],
    [/^(\d+) later repl(?:y|ies)$/, '$1 条后续回复'],
    // 折叠的提交：3 additional commits by <作者>；读屏：… , starting at commit abc1234（by 译“来自”，不加逗号）
    [/^(\d+) additional commits?$/, '另外 $1 个提交'],
    [/^(\d+) additional commits? by$/, '另外 $1 个提交来自'],
    [
      /^(\d+) additional commits?(?: by (.+))?, starting at commit ([0-9a-f]{7,40})$/,
      (_, count, authors, sha) => `另外 ${count} 个提交${authors ? `来自 ${authors}` : ''}，从提交 ${sha} 开始`
    ],
    [/^Commit: (.+)$/, '提交：$1'],
    // 条目加载失败：Failed to load comment / This review cannot be displayed. …
    [/^Failed to load (comment|review)$/, (_, kind) => `加载${ITEM_TYPE[kind]}失败`],
    [
      /^This (comment|review) cannot be displayed\. Please reload the page to try again\.$/,
      (_, kind) => `无法显示此${ITEM_TYPE[kind]}。请重新加载页面后重试。`
    ],
    [/^Failed to update (comment|review)$/, (_, kind) => `更新${ITEM_TYPE[kind]}失败`],
    [
      /^Review comment by ([\w-]+(?:\[bot\])?|unknown user)$/,
      (_, login) => `${login === 'unknown user' ? '未知用户' : `${login} `}的审查评论`
    ],
    // 线程标题：Line 5 / Lines 3 - 5；Resolved as Won't fix（与审查线程“将此线程解决为”同译，不加冒号）
    [/^Line (\d+)$/, '第 $1 行'],
    [/^Lines (\d+) - (\d+)$/, '第 $1 - $2 行'],
    [/^Resolved as (Addressed|Won't fix|Incorrect)$/, (_, reason) => `已解决为${RESOLUTION_REASON[reason]}`],
    // 带线程位置的读屏名称：… in src/app.ts, line 5
    [
      /^(Open|Close) review comment in (.+)$/,
      (_, action, label) => `${action === 'Open' ? '展开' : '收起'} ${threadLabel(label, '的审查评论')}`
    ],
    [/^Jump to the comment in the diff for (.+)$/, (_, label) => `跳转到差异中 ${threadLabel(label, '的评论')}`],
    [
      /^(Resolve|Unresolve) (comment|conversation) in (.+)$/,
      (_, action, kind, label) =>
        `${action === 'Resolve' ? '解决' : '取消解决'} ${threadLabel(label, kind === 'comment' ? '的评论' : '的对话')}`
    ],
    [/^Resolve with reason in (.+)$/, (_, label) => `附理由解决 ${threadLabel(label, '的评论')}`],
    [/^Write a reply in (.+)$/, (_, label) => `在 ${threadLabel(label, '中回复')}`],
    [
      /^View comment in diff for (.+), (\d+) previous comments?$/,
      (_, label, count) => `在差异中查看 ${threadLabel(label, '的评论')}，之前有 ${count} 条评论`
    ],
    // 评论的读屏名称：More actions for octocat's comment, 3:45 PM today（原文无冒号）；编辑历史记录后的 for …
    [new RegExp(`^More actions for (${COMMENT_LABEL_SOURCE})$`), (_, label) => commentLabel(label, '的更多操作')],
    // 编辑历史记录后的读屏文字：Edit history <span> for octocat's review, …</span>（原文无括号）
    [new RegExp(`^for (${COMMENT_LABEL_SOURCE})$`), (_, label) => joinCjk('关于', commentLabel(label))],
    // 批次管理：View <行> in Files changed / Remove <行> from batch（原文界面名无引号，译文不加）
    [/^View (.+) in Files changed$/, '在已更改的文件中查看 $1'],
    [/^View comment on (.+)$/, '查看 $1 上的评论'],
    [/^View full comment by ([\w-]+(?:\[bot\])?) on (.+)$/, '查看 $1 在 $2 上的完整评论'],
    [/^Remove (.+) from batch \(outdated\)$/, '从批次中删除 $1（过时）'],
    [/^Remove (.+) from batch$/, '从批次中删除 $1'],
    [
      new RegExp(
        `^(${escapeSource(BATCH_PREFIX)}), and (${escapeSource(BATCH_REASON)})\\. You can still publish your review from the review menu\\.$`
      ),
      (_, prefix, reason) => `${BATCH_PREFIX[prefix]}，且${BATCH_REASON[reason]}。你仍可在审查菜单中发布审查。`
    ]
  ],
  inline: [
    // 评论头部的读屏标题（React 评论头部）：<h3 class="sr-only">octocat commented <relative-time></h3>。
    // 后接时间，与 common-ui 同译“评论于”；不按整句时会落到合并框审查者列表的读屏名称正则（不带时间，作“发表了评论”）
    [/^([\w.-]+(?:\[bot\])?) commented \{\}$/, '$1 评论于 {}']
  ]
} satisfies PageDictionary
