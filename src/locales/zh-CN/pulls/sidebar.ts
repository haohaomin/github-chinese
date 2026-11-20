import type { PageDictionary } from '../../../core/types'

/** 用户名（可带 [bot] 后缀） */
const LOGIN = '([\\w-]+(?:\\[bot\\])?)'
/** 团队：org/team */
const TEAM = '(@?[\\w.-]+\\/[\\w.-]+)'
/** 审查者：用户名或团队 */
const REVIEWER = '(@?[\\w.-]+(?:\\/[\\w.-]+)?(?:\\[bot\\])?)'

/** Copilot 审查强度（概述页审查者行，小写） */
const EFFORT: Readonly<Record<string, string>> = {
  lite: '轻量',
  light: '轻量',
  balanced: '均衡',
  thorough: '深度',
  deep: '深度',
  max: '最高',
  auto: '自动'
}

const EFFORT_SOURCE = Object.keys(EFFORT).join('|')

/** Reviewing at balanced effort · Last completed: lite */
function reviewingText(requested: string | undefined, completed: string | undefined): string {
  const head = requested ? `正在以${EFFORT[requested] ?? requested}强度审查` : '正在审查'
  return completed ? `${head} · 上次完成：${EFFORT[completed] ?? completed}` : head
}

/**
 * 拉取请求侧栏：审查者（含 Copilot 审查强度）、受理人、标签、项目、里程碑、开发（链接的议题）、通知、参与者、
 * 维护者编辑权限，以及锁定对话框。新建拉取请求表单的侧栏与此相同。
 */
export default {
  static: {
    // 审查者
    'Request review': '请求审查',
    'Reviewers whose approvals may not affect merge requirements': '其批准可能不影响合并要求的审查者',
    'Only reviews by reviewers with write access count toward mergeability': '只有具有写入访问权限的审查者的审查计入可合并性',
    // 审查者列表中 Copilot 头像链接的读屏文字（<span class="sr-only">）；产品名按 product-names.md 译出
    'Copilot code review': 'Copilot 代码审查',
    'Copilot review effort': 'Copilot 审查强度',
    'Efficient review, low cost': '高效审查，成本低',
    'Deep analysis, moderate cost': '深度分析，成本中等',
    'Most thorough, high cost': '最全面，成本高',
    'Applies to this pull request for everyone.': '对此拉取请求的所有人生效。',
    // 建议审查者的推荐理由；经典侧栏审查者行“已请求更改”图标的提示
    'Recently edited these files': '最近编辑过这些文件',
    'Requested changes must be addressed to merge this pull request.': '必须处理所请求的更改才能合并此拉取请求。',
    // Copilot 代码审查引导弹出框
    'Copilot can review pull requests': 'Copilot 可以审查拉取请求',
    'Request a review from Copilot to get fast, actionable feedback on your code, so you can start iterating before you receive a human review.':
      '请求 Copilot 审查，快速获得针对你代码的可操作反馈，以便在收到人工审查前开始迭代。',

    // 开发
    'Successfully merging this pull request may close these issues.': '成功合并此拉取请求可能会关闭这些议题。',
    'Use Closing keywords in the description to automatically close issues': '在描述中使用关闭关键词可自动关闭议题',
    'in the description to automatically close issues': '在描述中自动关闭议题',
    'Use Closing keywords to add a closing reference': '使用关闭关键词添加关闭引用',
    'Link an issue from this repository': '链接此存储库中的议题',

    // 经典通知设置对话框的选项说明（选项名见 scoped；与议题版同译）
    'Only receive notifications from this pull request when you have participated or have been @mentioned.':
      '仅在你参与或被 @提及时接收此拉取请求的通知。',
    'Receive all notifications from this pull request.': '接收此拉取请求的所有通知。',
    // Custom 选项说明被 <br> 隔开的两句
    'You will only be notified for the events selected from the list below.': '仅接收下方所选事件的通知。',
    'If you participate or are @mentioned you will be subscribed.': '你参与或被 @提及时将自动订阅。',
    'Receive a notification when this pull request has been merged.': '此拉取请求合并时接收通知。',
    'Receive a notification when this pull request has been closed.': '此拉取请求关闭时接收通知。',
    'Receive a notification when this pull request has been reopened.': '此拉取请求重新打开时接收通知。',

    // 维护者编辑权限
    'Allow edits by maintainers': '允许维护者编辑',
    'Allow edits and access to secrets by maintainers': '允许维护者编辑和访问机密',
    'If checked, users with write access to': '勾选后，对',
    'can add new commits to your': '具有写入访问权限的用户可以向你的',
    'branch. You can always change this setting later.': '分支添加新提交。你随时可以更改此设置。',
    // 比较页与侧栏弹出框中单独成节点的末句、注意事项
    'You can always change this setting later.': '你随时可以更改此设置。',
    "Note: By granting write access, maintainers could potentially edit your repository's workflows to reveal values of secrets and gain access to other branches.":
      '注意：授予写入访问权限后，维护者可能会编辑你存储库中的工作流以泄露机密的值并获得其他分支的访问权限。',
    // 侧栏弹出框标题与注意事项；非作者看到的状态
    'Allowing edits by maintainers': '允许维护者编辑',
    "Maintainers could potentially edit this repository's workflows to reveal values of secrets and gain access to other branches.":
      '维护者可能会编辑此存储库的工作流以泄露机密的值并获得其他分支的访问权限。',
    'Maintainers are allowed to edit this pull request.': '维护者可以编辑此拉取请求。',

    // 锁定对话框
    'Lock conversation on this pull request': '锁定此拉取请求的对话',
    'Unlock conversation on this pull request': '解锁此拉取请求的对话',
    "Other users can't add new comments to this pull request. You and other members of teams with":
      '其他用户将无法对此拉取请求发表新评论。你和其他拥有此存储库',
    'Other users can’t add new comments to this pull request. You and other members of teams with':
      '其他用户将无法对此拉取请求发表新评论。你和其他拥有此存储库',
    'to this repository can still leave comments that others can see. You can always unlock this pull request again in the future.':
      '的团队成员仍可发表他人可见的评论。你随时可以再次解锁此拉取请求。',
    'Everyone will be able to comment on this pull request once more. You can always lock this pull request again in the future.':
      '所有人都将可以再次对此拉取请求发表评论。你随时可以再次锁定此拉取请求。',
    // 经典锁定 / 解锁对话框分条的写法（整段未命中时也按句兜底）：<Everyone> will be able to comment … once more.
    'will be able to comment on this pull request once more.': '都可以再次对此拉取请求发表评论。',
    'You can always unlock this pull request again in the future.': '你随时可以再次解锁此拉取请求。',
    'You can always lock this pull request again in the future.': '你随时可以再次锁定此拉取请求。',
    // 锁定原因：Optionally, choose a reason … when it’s appropriate to <lock conversations>.
    'Reason for locking': '锁定原因',
    'Optionally, choose a reason for locking that others can see. Learn more about when it’s appropriate to':
      '可选择其他人可见的锁定原因。了解何时适合',
    'lock conversations': '锁定对话',
    'You do not have permissions to comment on this pull request.': '你没有在此拉取请求上评论的权限。',
    'Apply labels to this pull request': '为此拉取请求应用标签'
  },
  scoped: {
    // 分区标题与空状态（与议题侧栏同译）
    Reviewers: '审查者',
    'Select reviewers': '选择审查者',
    Request: '请求',
    Lite: '轻量',
    Balanced: '均衡',
    Max: '最高',
    'Select assignees': '选择受理人',
    'No one assigned': '无受理人',
    'No one—': '无人——',
    'No one -': '无人 -',
    'assign yourself': '分配给自己',
    'Assign yourself': '分配给自己',
    // 经典侧栏受理人区的按钮
    'unassign me': '取消分配给自己',
    'Select labels': '选择标签',
    'Edit labels': '编辑标签',
    'No labels': '无标签',
    'Select projects': '选择项目',
    'No projects': '无项目',
    'Select milestones': '选择里程碑',
    'Select milestone': '选择里程碑',
    'Set milestone': '设置里程碑',
    'No milestone': '无里程碑',
    // 里程碑选择器说明：Past due by <relative-time>（逾期时长由时间元素输出；与议题侧栏同译）
    'Past due by': '逾期',
    'Due by': '截止于',
    'No due date': '无截止日期',
    Development: '开发',
    'Link issues': '链接议题',
    'Closing keywords': '关闭关键词',
    Participants: '参与者',
    'Type or choose a user': '输入或选择用户',
    'Clear assignees': '清除受理人',
    'Filter projects': '筛选项目',

    // 经典通知设置对话框的选项名（与议题侧栏同译）
    'Not subscribed': '未订阅',
    Subscribed: '已订阅',
    Custom: '自定义',

    // 比较页维护者编辑说明：If checked, <users with write access to> octo-org/repo <can add new commits> to your <分支>
    // branch.（片段重排后拼读；branch. 由 merge-flow.ts 收录）
    'If checked,': '勾选后，',
    'users with write access to': '对',
    'can add new commits': '具有写入访问权限的用户可以添加新提交',
    'to your': '到你的',
    // 侧栏弹出框：If checked, users with write access to octo-org/repo <can add new commits to> <分支> branch.
    'can add new commits to': '具有写入访问权限的用户可以添加新提交到',

    // 经典锁定对话框：Other users <can’t add new comments> to this pull request.（与提交页同一套重排译法）
    'Other users': '其他用户',
    'can’t add new comments': '将无法',
    "can't add new comments": '将无法',
    'to this pull request.': '对此拉取请求发表新评论。',

    // 通知原因（与讨论同译；原文无逗号，译文用“因…而…”）
    "You're receiving notifications because you're subscribed to this thread.": '你因已订阅此线程而收到通知。',
    'You’re receiving notifications because you’re subscribed to this thread.': '你因已订阅此线程而收到通知。',
    'You’re receiving notifications because you’re watching this repository.': '你因正在关注此存储库而收到通知。',
    'You’re receiving notifications because you are watching pull requests on this repository.':
      '你因正在关注此存储库的拉取请求而收到通知。',
    'You’re receiving notifications because you authored the thread.': '你因是此线程的作者而收到通知。',
    'You’re receiving notifications because you were mentioned.': '你因被提及而收到通知。',
    'You’re receiving notifications because you commented.': '你因发表了评论而收到通知。',
    'You’re receiving notifications because you were assigned.': '你因被分配了此拉取请求而收到通知。',
    'You’re receiving notifications because your review was requested.': '你因被请求审查而收到通知。',
    'You’re receiving notifications because you modified the open/close state.': '你因更改了打开/关闭状态而收到通知。',
    "You're not receiving notifications from this thread.": '你不会收到此线程的通知。'
  },
  regexp: [
    // 审查者提示
    [new RegExp(`^Awaiting requested review from ${LOGIN}$`), '正在等待 $1 的审查'],
    [new RegExp(`^Awaiting requested review from ${TEAM}$`), '正在等待 $1 的审查'],
    [new RegExp(`^${LOGIN} is a code owner automatically assigned from ${TEAM}$`), '$1 是从 $2 自动分配的代码所有者'],
    [new RegExp(`^${TEAM} is a code owner automatically assigned from ${TEAM}$`), '$1 是从 $2 自动分配的代码所有者'],
    [new RegExp(`^${LOGIN} is a code owner$`), '$1 是代码所有者'],
    [new RegExp(`^${TEAM} is a code owner$`), '$1 是代码所有者'],
    [new RegExp(`^${LOGIN} left review comments$`), '$1 留下了审查评论'],
    [/^(\d+) more reviewers?$/, '另外 $1 个审查者'],
    [new RegExp(`^Re-request review from ${REVIEWER}$`), '重新请求 $1 审查'],
    [new RegExp(`^Request review from ${REVIEWER}$`), '请求 $1 审查'],
    [/^Request up to (\d+) reviewers?$/, '最多请求 $1 个审查者'],
    // 经典侧栏选择菜单：选满上限时的提示
    [
      /^You can only select (\d+) (reviewers?|assignees?)\.$/,
      (_, count: string, kind: string) => `最多只能选择 ${count} 个${kind.startsWith('reviewer') ? '审查者' : '受理人'}。`
    ],
    // 经典侧栏审查者区无审查时的提示（— 连接两分句）
    [/^No reviews—at least (\d+) approving reviews? (?:is|are) required\.$/, '暂无审查——至少需要 $1 个批准审查。'],
    // 概述页审查者行
    [new RegExp(`^Re-requesting review from ${REVIEWER}$`), '正在重新请求 $1 审查'],
    [new RegExp(`^Requesting review from ${REVIEWER}$`), '正在请求 $1 审查'],
    [new RegExp(`^Request a review from ${REVIEWER} now$`), '立即请求 $1 审查'],
    [new RegExp(`^Review requested from ${REVIEWER}$`), '已请求 $1 审查'],
    [new RegExp(`^Failed to re-request review from ${REVIEWER}\\.$`), '重新请求 $1 审查失败。'],
    [new RegExp(`^Members of ${REVIEWER}$`), '$1 的成员'],
    // 原文无标点，译文不加逗号
    [
      new RegExp(`^${LOGIN} will automatically review once the pull request is marked ready for review$`),
      '$1 将在拉取请求标记为可供审查后自动审查'
    ],
    [
      new RegExp(`^${LOGIN} will be requested when the pull request is marked ready for review$`),
      '将在拉取请求标记为可供审查后请求 $1 审查'
    ],
    [
      new RegExp(`^Reviewing(?: at (${EFFORT_SOURCE}) effort)?(?: · Last completed: (${EFFORT_SOURCE}))?$`),
      (_, requested, completed) => reviewingText(requested, completed)
    ],
    // 受理人
    [/^Assign up to (\d+) people to this pull request$/, '最多为此拉取请求分配 $1 人']
  ]
} satisfies PageDictionary
