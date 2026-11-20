import type { PageDictionary } from '../../../core/types'

/** 用户名（可带 [bot] 后缀） */
const LOGIN = '([\\w-]+(?:\\[bot\\])?)'
/** 团队：org/team */
const TEAM = '(@?[\\w.-]+\\/[\\w.-]+)'
/** 审查者：用户名或团队 */
const REVIEWER = '(@?[\\w.-]+(?:\\/[\\w.-]+)?(?:\\[bot\\])?)'

/** Copilot 审查强度（总览页审查者行，小写；Lite / Balanced / Max 与组织设定的 Copilot 页同译） */
const EFFORT: Readonly<Record<string, string>> = {
  lite: '輕量',
  light: '輕量',
  balanced: '平衡',
  thorough: '深入',
  deep: '深入',
  max: '最高',
  auto: '自動'
}

const EFFORT_SOURCE = Object.keys(EFFORT).join('|')

/** Reviewing at balanced effort · Last completed: lite */
function reviewingText(requested: string | undefined, completed: string | undefined): string {
  const head = requested ? `正在以${EFFORT[requested] ?? requested}強度審查` : '正在審查'
  return completed ? `${head} · 上次完成：${EFFORT[completed] ?? completed}` : head
}

/**
 * 拉取请求侧栏：审查者（含 Copilot 审查强度）、负责人、标签、专案、里程碑、开发（已连结的议题）、通知、参与者、
 * 维护者编辑权限，以及锁定对话框。新增拉取请求表单的侧栏与此相同。
 */
export default {
  static: {
    // 审查者
    'Request review': '請求審查',
    'Reviewers whose approvals may not affect merge requirements': '其核准可能不影響合併要求的審查者',
    'Only reviews by reviewers with write access count toward mergeability': '只有具有寫入權限的審查者所做的審查才會計入可合併性',
    // 审查者列表中 Copilot 头像链接的读屏文字（<span class="sr-only">）；产品名按 product-names.md 译出
    'Copilot code review': 'Copilot 程式碼審查',
    'Copilot review effort': 'Copilot 審查強度',
    'Efficient review, low cost': '高效審查，成本低',
    'Deep analysis, moderate cost': '深入分析，成本中等',
    'Most thorough, high cost': '最詳盡，成本高',
    'Applies to this pull request for everyone.': '對此拉取請求的所有人生效。',
    // 建议审查者的推荐理由；经典侧栏审查者行“已请求更改”图标的提示
    'Recently edited these files': '最近編輯過這些檔案',
    'Requested changes must be addressed to merge this pull request.': '必須處理所要求的變更才能合併此拉取請求。',
    // Copilot 代码审查引导弹出框
    'Copilot can review pull requests': 'Copilot 可以審查拉取請求',
    'Request a review from Copilot to get fast, actionable feedback on your code, so you can start iterating before you receive a human review.':
      '請求 Copilot 審查，快速取得針對你程式碼的可行意見回饋，以便在收到人工審查前開始迭代。',

    // 开发
    'Successfully merging this pull request may close these issues.': '成功合併此拉取請求可能會關閉這些議題。',
    'Use Closing keywords in the description to automatically close issues': '在描述中使用關閉關鍵字以自動關閉議題',
    'in the description to automatically close issues': '於描述中以自動關閉議題',
    'Use Closing keywords to add a closing reference': '使用關閉關鍵字新增關閉參考',
    'Link an issue from this repository': '連結此儲存庫中的議題',

    // 经典通知设置对话框的选项说明（选项名见 scoped；与议题版同译）
    'Only receive notifications from this pull request when you have participated or have been @mentioned.':
      '僅在你參與或被 @提及時接收此拉取請求的通知。',
    'Receive all notifications from this pull request.': '接收此拉取請求的所有通知。',
    // Custom 选项说明被 <br> 隔开的两句
    'You will only be notified for the events selected from the list below.': '你只會收到下方清單中所選事件的通知。',
    'If you participate or are @mentioned you will be subscribed.': '你參與或被 @提及時將會自動訂閱。',
    'Receive a notification when this pull request has been merged.': '此拉取請求合併時接收通知。',
    'Receive a notification when this pull request has been closed.': '此拉取請求關閉時接收通知。',
    'Receive a notification when this pull request has been reopened.': '此拉取請求重新開啟時接收通知。',

    // 维护者编辑权限
    'Allow edits by maintainers': '允許維護者編輯',
    'Allow edits and access to secrets by maintainers': '允許維護者編輯和存取機密',
    'If checked, users with write access to': '勾選後，對',
    'can add new commits to your': '具有寫入權限的使用者可以向你的',
    'branch. You can always change this setting later.': '分支加入新的提交。你隨時可以變更此設定。',
    // 比较页与侧栏弹出框中单独成节点的末句、注意事项
    'You can always change this setting later.': '你隨時可以變更此設定。',
    "Note: By granting write access, maintainers could potentially edit your repository's workflows to reveal values of secrets and gain access to other branches.":
      '注意：授予寫入權限後，維護者可能會編輯你儲存庫中的工作流程以洩漏機密的值並取得其他分支的存取權。',
    // 侧栏弹出框标题与注意事项；非作者看到的状态
    'Allowing edits by maintainers': '允許維護者編輯',
    "Maintainers could potentially edit this repository's workflows to reveal values of secrets and gain access to other branches.":
      '維護者可能會編輯此儲存庫的工作流程以洩漏機密的值並取得其他分支的存取權。',
    'Maintainers are allowed to edit this pull request.': '維護者可以編輯此拉取請求。',

    // 锁定对话框
    'Lock conversation on this pull request': '鎖定此拉取請求的對話',
    'Unlock conversation on this pull request': '解除鎖定此拉取請求的對話',
    "Other users can't add new comments to this pull request. You and other members of teams with":
      '其他使用者將無法在此拉取請求中新增留言。你和其他擁有此儲存庫',
    'Other users can’t add new comments to this pull request. You and other members of teams with':
      '其他使用者將無法在此拉取請求中新增留言。你和其他擁有此儲存庫',
    'to this repository can still leave comments that others can see. You can always unlock this pull request again in the future.':
      '的團隊成員仍可發表其他人看得到的留言。你隨時可以再次解除鎖定此拉取請求。',
    'Everyone will be able to comment on this pull request once more. You can always lock this pull request again in the future.':
      '所有人都將可以再次在此拉取請求中留言。你隨時可以再次鎖定此拉取請求。',
    // 经典锁定 / 解锁对话框分条的写法（整段未命中时也按句兜底）：<Everyone> will be able to comment … once more.
    'will be able to comment on this pull request once more.': '都能再次在此拉取請求中留言。',
    'You can always unlock this pull request again in the future.': '你隨時可以再次解除鎖定此拉取請求。',
    'You can always lock this pull request again in the future.': '你隨時可以再次鎖定此拉取請求。',
    // 锁定原因：Optionally, choose a reason … when it’s appropriate to <lock conversations>.
    'Reason for locking': '鎖定原因',
    'Optionally, choose a reason for locking that others can see. Learn more about when it’s appropriate to':
      '可選擇其他人可見的鎖定原因。瞭解何時適合',
    'lock conversations': '鎖定對話',
    'You do not have permissions to comment on this pull request.': '你沒有在此拉取請求留言的權限。',
    'Apply labels to this pull request': '為此拉取請求套用標籤'
  },
  scoped: {
    // 分区标题与空状态（与议题侧栏同译）
    Reviewers: '審查者',
    'Select reviewers': '選取審查者',
    Request: '請求',
    Lite: '輕量',
    Balanced: '平衡',
    Max: '最高',
    'Select assignees': '選取負責人',
    'No one assigned': '無負責人',
    'No one—': '無人——',
    'No one -': '無人 -',
    'assign yourself': '指派給自己',
    'Assign yourself': '指派給自己',
    // 经典侧栏负责人区的按钮
    'unassign me': '取消指派給自己',
    'Select labels': '選取標籤',
    'Edit labels': '編輯標籤',
    'No labels': '無標籤',
    'Select projects': '選取專案',
    'No projects': '無專案',
    'Select milestones': '選擇里程碑',
    'Select milestone': '選擇里程碑',
    'Set milestone': '設定里程碑',
    'No milestone': '無里程碑',
    // 里程碑选择器说明：Past due by <relative-time>（逾期时长由时间元素输出；与议题侧栏同译）
    'Past due by': '逾期',
    'Due by': '截止於',
    'No due date': '無截止日期',
    Development: '開發',
    'Link issues': '連結議題',
    'Closing keywords': '關閉關鍵字',
    Participants: '參與者',
    'Type or choose a user': '輸入或選擇使用者',
    'Clear assignees': '清除負責人',
    'Filter projects': '篩選專案',

    // 经典通知设置对话框的选项名（与议题侧栏同译）
    'Not subscribed': '未訂閱',
    Subscribed: '已訂閱',
    Custom: '自訂',

    // 比较页维护者编辑说明：If checked, <users with write access to> octo-org/repo <can add new commits> to your <分支>
    // branch.（片段重排后拼读；branch. 由 merge-flow.ts 收录）
    'If checked,': '勾選後，',
    'users with write access to': '對',
    'can add new commits': '具有寫入權限的使用者可以加入新的提交',
    'to your': '到你的',
    // 侧栏弹出框：If checked, users with write access to octo-org/repo <can add new commits to> <分支> branch.
    'can add new commits to': '具有寫入權限的使用者可以加入新的提交到',

    // 经典锁定对话框：Other users <can’t add new comments> to this pull request.（与提交页同一套重排译法）
    'Other users': '其他使用者',
    'can’t add new comments': '將無法',
    "can't add new comments": '將無法',
    'to this pull request.': '在此拉取請求中新增留言。',

    // 通知原因（与讨论同译；原文无逗号，译文用「因…而…」）
    "You're receiving notifications because you're subscribed to this thread.": '你因已訂閱此討論串而收到通知。',
    'You’re receiving notifications because you’re subscribed to this thread.': '你因已訂閱此討論串而收到通知。',
    'You’re receiving notifications because you’re watching this repository.': '你因正在關注此儲存庫而收到通知。',
    'You’re receiving notifications because you are watching pull requests on this repository.':
      '你因正在關注此儲存庫的拉取請求而收到通知。',
    'You’re receiving notifications because you authored the thread.': '你因是此討論串的作者而收到通知。',
    'You’re receiving notifications because you were mentioned.': '你因被提及而收到通知。',
    'You’re receiving notifications because you commented.': '你因留言而收到通知。',
    'You’re receiving notifications because you were assigned.': '你因被指派而收到通知。',
    'You’re receiving notifications because your review was requested.': '你因被請求審查而收到通知。',
    'You’re receiving notifications because you modified the open/close state.': '你因變更了開啟/關閉狀態而收到通知。',
    "You're not receiving notifications from this thread.": '你不會收到此討論串的通知。'
  },
  regexp: [
    // 审查者提示
    [new RegExp(`^Awaiting requested review from ${LOGIN}$`), '正在等待 $1 的審查'],
    [new RegExp(`^Awaiting requested review from ${TEAM}$`), '正在等待 $1 的審查'],
    [new RegExp(`^${LOGIN} is a code owner automatically assigned from ${TEAM}$`), '$1 是從 $2 自動指派的程式碼擁有者'],
    [new RegExp(`^${TEAM} is a code owner automatically assigned from ${TEAM}$`), '$1 是從 $2 自動指派的程式碼擁有者'],
    [new RegExp(`^${LOGIN} is a code owner$`), '$1 是程式碼擁有者'],
    [new RegExp(`^${TEAM} is a code owner$`), '$1 是程式碼擁有者'],
    [new RegExp(`^${LOGIN} left review comments$`), '$1 發表了審查留言'],
    [/^(\d+) more reviewers?$/, '還有 $1 位審查者'],
    [new RegExp(`^Re-request review from ${REVIEWER}$`), '重新請求 $1 審查'],
    [new RegExp(`^Request review from ${REVIEWER}$`), '請求 $1 審查'],
    [/^Request up to (\d+) reviewers?$/, '最多請求 $1 位審查者'],
    // 经典侧栏选择菜单：选满上限时的提示
    [
      /^You can only select (\d+) (reviewers?|assignees?)\.$/,
      (_, count: string, kind: string) => `最多只能選擇 ${count} 位${kind.startsWith('reviewer') ? '審查者' : '負責人'}。`
    ],
    // 经典侧栏审查者区无审查时的提示（— 连接两分句）
    [/^No reviews—at least (\d+) approving reviews? (?:is|are) required\.$/, '尚無審查——至少需要 $1 個核准審查。'],
    // 总览页审查者行
    [new RegExp(`^Re-requesting review from ${REVIEWER}$`), '正在重新請求 $1 審查'],
    [new RegExp(`^Requesting review from ${REVIEWER}$`), '正在請求 $1 審查'],
    [new RegExp(`^Request a review from ${REVIEWER} now$`), '立即請求 $1 審查'],
    [new RegExp(`^Review requested from ${REVIEWER}$`), '已請求 $1 審查'],
    [new RegExp(`^Failed to re-request review from ${REVIEWER}\\.$`), '無法重新請求 $1 審查。'],
    [new RegExp(`^Members of ${REVIEWER}$`), '$1 的成員'],
    // 原文无标点，译文不加逗号
    [
      new RegExp(`^${LOGIN} will automatically review once the pull request is marked ready for review$`),
      '$1 將在拉取請求標示為可供審查後自動審查'
    ],
    [
      new RegExp(`^${LOGIN} will be requested when the pull request is marked ready for review$`),
      '將在拉取請求標示為可供審查後請求 $1 審查'
    ],
    [
      new RegExp(`^Reviewing(?: at (${EFFORT_SOURCE}) effort)?(?: · Last completed: (${EFFORT_SOURCE}))?$`),
      (_, requested, completed) => reviewingText(requested, completed)
    ],
    // 负责人
    [/^Assign up to (\d+) people to this pull request$/, '最多為此拉取請求指派 $1 人']
  ]
} satisfies PageDictionary
