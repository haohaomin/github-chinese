import type { PageDictionary } from '../../../core/types'

/** 行范围前缀：Comment on lines R12 to R14 */
const LINE_SOURCE = '[LR+-]?\\d+'

/** 自动审查评论（代码扫描等）涉及的对象 */
const RESOURCE: Readonly<Record<string, string>> = { alert: '警报', finding: '发现' }
const RESOURCE_SOURCE = Object.keys(RESOURCE).join('|')

/** 消除原因（与 security 词典同译） */
const RESOLUTION: Readonly<Record<string, string>> = {
  'false positive': '误报',
  'used in tests': '用于测试',
  "won't fix": '不予修复',
  'won’t fix': '不予修复'
}

/** 原因：as false positive → 以误报为由（原文无标点，与 security 词典的“以…为由消除”一致） */
function reasonPrefix(reason: string | undefined): string {
  return reason ? `以${RESOLUTION[reason] ?? reason}为由` : ''
}

/**
 * 审查：提交审查（审查更改、完成审查、提交审查对话框）、行评论（开始审查、添加单条评论）、
 * 审查线程（解决对话、显示已解决）、建议更改与批次提交、Copilot 建议状态、自动修复建议、
 * 代码扫描等自动审查评论的消除状态。
 */
export default {
  static: {
    // 提交审查
    'Review changes': '审查更改',
    'Submit review': '提交审查',
    'Finish your review': '完成审查',
    // 审查菜单为 comments 模式时的标题（无权批准与请求更改，或拉取请求不可审查）
    'Finish your comments': '完成评论',
    'Request changes': '请求更改',
    'Submit general feedback without explicit approval.': '提交不含明确批准的一般反馈。',
    'Submit feedback and approve merging these changes.': '提交反馈并批准合并这些更改。',
    'Submit feedback suggesting follow-up changes.': '提交包含后续更改建议的反馈。',
    'Submit feedback suggesting changes.': '提交包含更改建议的反馈。',
    'Submit feedback that must be addressed before merging.': '提交必须在合并前处理的反馈。',
    'Submit feedback and record your approval of these merged changes.': '提交反馈并记录你对这些已合并更改的批准。',
    'Submit feedback and approve merging these changes into': '提交反馈并批准将这些更改合并到',
    "Pull request authors can't approve their own pull requests.": '拉取请求作者无法批准自己的拉取请求。',
    'Pull request authors can’t approve their own pull requests.': '拉取请求作者无法批准自己的拉取请求。',
    "Pull request authors can't request changes on their own pull requests.": '拉取请求作者无法对自己的拉取请求请求更改。',
    'Pull request authors can’t request changes on their own pull requests.': '拉取请求作者无法对自己的拉取请求请求更改。',
    "Users that pushed changes to this pull request after it was opened can't approve": '在此拉取请求创建后推送过更改的用户无法批准',
    'Only users with explicit access to this repository may approve pull requests': '只有对此存储库具有明确访问权限的用户才能批准拉取请求',
    'Only users with explicit access to this repository may request changes on pull requests':
      '只有对此存储库具有明确访问权限的用户才能对拉取请求请求更改',
    // 经典审查菜单：Approve 选项说明、单数 pull request 版的禁用提示、请求更改未填评论时的校验提示
    'Submit feedback approving these changes.': '提交批准这些更改的反馈。',
    'Pull request authors can’t approve their own pull request.': '拉取请求作者无法批准自己的拉取请求。',
    'Pull request authors can’t request changes on their own pull request.': '拉取请求作者无法对自己的拉取请求请求更改。',
    'Only users with explicit access to this repository may request changes to pull requests':
      '只有对此存储库具有明确访问权限的用户才能对拉取请求请求更改',
    'You need to leave a comment indicating the requested changes.': '你需要发表评论说明所请求的更改。',
    'Only users who did not collaborate with the cloud agent will satisfy review requirements.':
      '只有未与云端智能体协作的用户才能满足审查要求。',
    'Are you sure you want to cancel? You will lose all your pending comments.': '确定要取消吗？所有待处理的评论都将丢失。',
    'Are you sure you want to abandon your review? You will lose all your pending comments.':
      '确定要放弃审查吗？所有待处理的评论都将丢失。',
    'Cancel review': '取消审查',
    'Abandon review': '放弃审查',
    'Submitting review…': '正在提交审查…',
    'Submitting review...': '正在提交审查...',
    'Failed to submit review': '提交审查失败',
    'Review submitted': '审查已提交',
    // 经典页提交审查后的闪现提示
    'Your review was submitted successfully.': '你的审查已成功提交。',
    'Your review was submitted on a merged pull request.': '你在已合并的拉取请求上提交了审查。',
    'Pending review': '待处理的审查',
    'Your review is pending': '你的审查尚未提交',
    'Unable to load pending comments': '无法加载待处理的评论',

    // 行评论
    'Start a review': '开始审查',
    'Add single comment': '添加单条评论',
    'Add review comment': '添加审查评论',
    'Add diff comment': '添加差异评论',
    // 经典多行评论表单标题：Commenting on lines <+12> to <+14>（React 整句由正则处理）
    'Commenting on lines': '评论行',
    'Reply…': '回复…',
    'Reply...': '回复...',
    'Reply and resolve comment': '回复并解决评论',
    'Changing the line number of a comment with a suggested change is not supported.': '不支持更改带有建议更改的评论的行号。',

    // 审查线程
    'Resolve conversation': '解决对话',
    'Unresolve conversation': '取消解决对话',
    // 经典版按钮提交中的文字
    'Resolving conversation…': '正在解决对话…',
    'Unresolving conversation…': '正在取消解决对话…',
    'Failed to resolve thread': '解决线程失败',
    'Failed to unresolve thread': '取消解决线程失败',
    'resolved this thread as': '将此线程解决为',
    'marked this conversation as resolved.': '将此对话标记为已解决。',
    'marked this thread as resolved': '将此线程标记为已解决',
    'Resolve with reason': '附理由解决',
    'Resolve comment': '解决评论',
    'Unresolve comment': '取消解决评论',
    'Show resolved': '显示已解决',
    'Hide resolved': '隐藏已解决',
    'Show outdated': '显示过时',
    'Hide outdated': '隐藏过时',
    'Comment thread': '评论线程',
    'There was a problem loading this review comment': '加载此审查评论时出现问题',

    // 建议更改
    'Suggested change': '建议更改',
    'Commit suggestion': '提交建议',
    'Commit suggestions': '提交建议',
    // 存储库要求签署提交时的按钮
    'Sign off and commit suggestion': '签署并提交建议',
    'Sign off and commit suggestions': '签署并提交建议',
    // 无写入权限时“提交建议”按钮的提示
    'This code change can be committed by users with write permissions.': '具有写入权限的用户可以提交此代码更改。',
    'Add suggestion to batch': '将建议添加到批次',
    'Remove from batch': '从批次中删除',
    'Pending in batch': '已在批次中',
    'Apply suggestion': '应用建议',
    'Apply suggestions': '应用建议',
    'Apply Suggestion': '应用建议',
    'Applying suggestion…': '正在应用建议…',
    'Applying suggestions…': '正在应用建议…',
    'Insert a suggestion': '插入建议',
    'Suggestions to apply': '要应用的建议',
    'Discard batch': '放弃批次',
    'Discard batch?': '要放弃批次吗？',
    'Add this suggestion to a batch that can be applied as a single commit.': '将此建议添加到可作为单个提交应用的批次。',
    'This suggestion is invalid because no changes were made to the code.': '此建议因未对代码进行任何更改而无效。',
    'Suggestions cannot be applied while the pull request is closed.': '拉取请求关闭后无法应用建议。',
    'Suggestions cannot be applied while viewing a subset of changes.': '查看部分更改时无法应用建议。',
    'Only one suggestion per line can be applied in a batch.': '每行每次只能在批次中应用一条建议。',
    'Applying suggestions on deleted lines is not supported.': '不支持在已删除的行上应用建议。',
    'You must change the existing code in this line in order to create a valid suggestion.': '必须更改此行中的现有代码才能创建有效建议。',
    'Outdated suggestions cannot be applied.': '已过时的建议无法应用。',
    'This suggestion has been applied or marked resolved.': '此建议已应用或标记为已解决。',
    'Suggestions cannot be applied from pending reviews.': '无法从待处理的审查中应用建议。',
    'Suggestions cannot be applied on multi-line comments.': '无法在多行评论上应用建议。',
    'Suggestions cannot be applied on outdated comments.': '无法在过时的评论上应用建议。',
    'Suggestions cannot be applied while the pull request is queued to merge.': '拉取请求排队合并时无法应用建议。',
    'Suggestion cannot be applied right now. Please check back later.': '暂时无法应用建议。请稍后再试。',
    'You do not have permission to apply this suggestion.': '你没有应用此建议的权限。',
    'This suggestion cannot be applied because the pull request is closed.': '此建议因拉取请求已关闭而无法应用。',
    'This suggestion cannot be applied because the pull request is queued to merge.': '此建议因拉取请求已排队等待合并而无法应用。',
    'This suggestion is outdated and cannot be applied.': '此建议已过时且无法应用。',
    'This suggestion is part of a pending comment and cannot be applied.': '此建议属于待处理的评论且无法应用。',
    'This suggestion is part of a resolved comment and cannot be applied.': '此建议属于已解决的评论且无法应用。',
    'Unable to apply suggestions when viewing a specific commit range.': '查看特定提交范围时无法应用建议。',
    'Unable to commit due to too many changes in the batch.': '因批次中的更改过多而无法提交。',
    'Unable to apply suggestions on deleted lines.': '无法在已删除的行上应用建议。',
    'This suggestion does not have a valid line range.': '此建议没有有效的行范围。',
    'Unable to determine the validity of this suggestion.': '无法确定此建议是否有效。',
    'The pull request has been updated since this batch was created. Please refresh the page and try again.':
      '创建此批次后拉取请求已更新。请刷新页面后重试。',
    'Failed to submit suggested changes': '提交建议更改失败',
    // 经典版批次建议：按钮提示、提交对话框、提交失败（后接 Refresh and try again.）
    'Batching suggestions must be done from the files tab.': '必须在已更改的文件标签页中批量处理建议。',
    'Remove this suggestion from those to be applied in batch': '从要批量应用的建议中删除此建议',
    'Apply all batched suggestions as a single commit': '将批次中的所有建议作为单个提交应用',
    'Multiple suggested changes can be batched together in a single commit. Each suggestion author will be attributed in the commit as a co-author.':
      '多个建议更改可以批量放入单个提交。每个建议作者都会在提交中被列为共同作者。',
    'Applying commit...': '正在应用提交...',
    'This diff has recently been updated.': '此差异最近已更新。',
    // 提交消息生成（读屏播报）
    'Commit message updated with a generated suggestion.': '已使用生成的建议更新提交消息。',
    'Commit message cleared for the updated batch.': '已为更新的批次清除提交消息。',
    'Copilot is generating a commit message. Enter your own message or wait for Copilot to finish.':
      'Copilot 正在生成提交消息。你可以自行输入或等待 Copilot 完成。',
    "Copilot couldn't generate a commit message. Using the default commit message instead.":
      'Copilot 无法生成提交消息。将改用默认提交消息。',
    'Commit description updated with a generated suggestion.': '已使用生成的建议更新提交描述。',
    'Generated commit description cleared.': '已清除生成的提交描述。',
    'Message suggested by Copilot.': '消息由 Copilot 建议。',
    'Copilot is generating a description. Enter your own description or wait for Copilot to finish.':
      'Copilot 正在生成描述。你可以自行输入或等待 Copilot 完成。',
    'Description suggested by Copilot.': '描述由 Copilot 建议。',

    // Copilot 建议状态
    'This suggestion has been addressed.': '此建议已处理。',
    "This suggestion won't be addressed.": '此建议不会处理。',
    'This suggestion won’t be addressed.': '此建议不会处理。',
    'This suggestion is incorrect or unhelpful.': '此建议不正确或无帮助。',

    // 自动修复建议（代码扫描）
    'Loading suggestion...': '正在加载建议...',
    'Sorry, we could not generate an autofix suggestion.': '抱歉，无法生成自动修复建议。',
    'Unable to commit as this autofix suggestion is now outdated.': '此自动修复建议因已过时而无法提交。',
    'This autofix suggestion is outdated': '此自动修复建议已过时',
    'Show autofix suggestion': '显示自动修复建议',
    'Hide autofix suggestion': '隐藏自动修复建议',
    'This autofix suggestion was applied.': '此自动修复建议已应用。',
    'Failed to commit suggested changes': '提交建议更改失败',
    'Commit this suggested change directly.': '直接提交此建议更改。',
    'Revise this suggestion with Copilot.': '使用 Copilot 修改此建议。',
    'Apply this suggested change directly.': '直接应用此建议更改。',
    'Change suggestion action': '更改建议操作',
    'Batching suggestions is only available in the Files changed tab': '只能在已更改的文件标签页中批量处理建议',
    'Unable to commit due to other pending changes affecting this line.': '此行受其他待处理更改影响而无法提交。',
    'Workflows are awaiting approval. Approve workflows to run.': '工作流正在等待批准。请批准运行工作流。',
    'A maintainer must approve the workflows to verify this fix.': '维护者必须批准工作流以验证此修复。',
    'Failed to approve workflows, please try again.': '批准工作流失败，请重试。',
    'Copilot session is done': 'Copilot 会话已完成',
    'Assigning to Copilot': '正在分配给 Copilot',
    // 产品名按 product-names.md 译出：Copilot code review → Copilot 代码审查
    'Copilot code review comment': 'Copilot 代码审查评论',
    'Generated by AI': '由 AI 生成',
    'Code scanning notice': '代码扫描提示',
    'View in Conversation tab': '在对话标签页中查看',
    'for the full code scanning experience.': '以获得完整的代码扫描体验。',
    'Request to dismiss was denied': '消除请求已被拒绝',
    'Request to close license alert': '请求关闭许可证警报',
    'An authorized approver needs to close this alert. Submitting this request will send a notification to all approvers for their review.':
      '需要由获授权的审批者关闭此警报。提交此请求将通知所有审批者进行审查。'
  },
  scoped: {
    'Review event': '审查事件',
    'Start review': '开始审查',
    'Discard review': '放弃审查',
    // comments 模式的按钮：Submit / Discard 与 comments 是同一元素内的相邻文本节点，引擎拼成整句匹配，片段不单独收录
    'Submit comments': '提交评论',
    'Discard comments': '放弃评论',
    'Pending comments': '待处理的评论',
    // 经典审查菜单标题 Finish your <review> 的两段（React 版整句由 static 处理）
    'Finish your': '完成',
    review: '审查',
    'Expand this section': '展开此部分',
    // Copilot 建议状态（与 security 词典同译）
    Addressed: '已处理',
    "Won't fix": '不予修复',
    'Won’t fix': '不予修复',
    Incorrect: '不正确',
    // 自动修复建议：Try pushing a new commit or if the problem persists <contact support>
    'Try pushing a new commit or if the problem persists': '推送新提交或在问题持续存在时',
    'Add to batch': '添加到批次',
    'Unknown Author': '未知作者',
    'Code paths': '代码路径',
    Ask: '询问',
    'Something went wrong, please try again.': '出错了，请重试。',
    'Failed to react to comment': '添加反应失败',
    'Failed to dismiss': '消除失败',
    'Failed to reopen': '重新打开失败',
    // 自动审查评论状态：<user> denied request to dismiss
    'denied request to dismiss': '拒绝了消除请求',
    'denied request to close': '拒绝了关闭请求',
    // 放弃批次对话框：… remove all <3> <suggestions> <from the batch.>（建议只是移出批次，评论本身保留）
    suggestion: '建议',
    suggestions: '建议',
    'from the batch.': '从批次中删除。'
  },
  regexp: [
    // 待处理的评论数（pending review comments 按术语表作“待处理”，与 common-ui 的 Pending 徽章一致）
    [/^(\d+) pending comments?$/, '$1 条待处理的评论'],
    // 行评论表单：Comment on line R12 / Commenting on lines +12 to +14
    [
      new RegExp(`^Comment(?:ing)? on lines? (${LINE_SOURCE})(?: to (${LINE_SOURCE}))?$`),
      (_, start, end) => (end ? `评论第 ${start} 至 ${end} 行` : `评论第 ${start} 行`)
    ],
    // 批次：Commit 3 suggestions
    [/^Commit (\d+) suggestions?$/, '提交 $1 条建议'],
    [/^(\d+) suggestions? in batch$/, '批次中有 $1 条建议'],
    [/^Are you sure you want to discard this batch\? This will remove all (\d+)$/, '确定要放弃此批次吗？此操作会将全部 $1 条'],
    // 提交建议失败：冒号后为服务器返回的原因（与 commits 词典同译）
    [/^There was an error trying to commit changes: (\S.*)$/, '提交更改时出错：$1'],
    // 自动审查评论（代码扫描等）的消除与关闭状态
    [
      /^requested to (dismiss|close)(?: as (.+))?$/,
      (_, action, reason) => `请求${reasonPrefix(reason)}${action === 'dismiss' ? '消除' : '关闭'}`
    ],
    [
      new RegExp(`^This (${RESOURCE_SOURCE}) was dismissed(?: as (.+))?$`),
      // 带原因时不用“被”：此警报已以误报为由消除
      (_, resource, reason) => `此${RESOURCE[resource] ?? resource}已${reason ? reasonPrefix(reason) : '被'}消除`
    ],
    [
      new RegExp(`^(dismissed|closed) this (${RESOURCE_SOURCE})(?: as (.+))?$`),
      (_, action, resource, reason) =>
        `${reasonPrefix(reason)}${action === 'dismissed' ? '消除' : '关闭'}了此${RESOURCE[resource] ?? resource}`
    ],
    [
      new RegExp(`^Dismissing the (${RESOURCE_SOURCE}) will mark this conversation as resolved\\.$`),
      (_, resource) => `消除此${RESOURCE[resource] ?? resource}会将此对话标记为已解决。`
    ]
  ]
} satisfies PageDictionary
