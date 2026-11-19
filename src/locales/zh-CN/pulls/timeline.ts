import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 审查强度名称（Copilot 代码审查） */
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

function effortName(effort: string): string {
  return EFFORT[effort.toLowerCase()] ?? effort
}

/** 自动合并方式 */
const AUTO_MERGE_METHOD: Readonly<Record<string, string>> = {
  merge: '合并',
  squash: '压缩',
  rebase: '变基'
}

/** 从合并队列中删除的原因（前一组跟在 due to 后，后一组跟在 because 后） */
const DEQUEUE_REASON: Readonly<Record<string, string>> = {
  'an unknown reason': '未知原因',
  'it being already merged': '已合并',
  'no response for status checks': '状态检查无响应',
  'failed status checks': '状态检查失败',
  'a conflict with the base branch': '与基础分支冲突',
  'the pull request being merged': '拉取请求已合并',
  'a manual request': '手动请求',
  'an unknown Git error': '未知 Git 错误',
  'the queue being cleared': '队列已清空',
  'a roll back': '回滚',
  'invalid changes in the merge commit': '合并提交中的无效更改',
  'Branch Protection failures': '分支保护失败',
  'a pull request earlier in the stack was removed': '堆栈中较早的拉取请求已删除',
  'a pull request earlier in the stack was unmerged and was not in the queue': '堆栈中较早的拉取请求未合并且不在队列中',
  'the pull requests in the stack were not ordered correctly in the queue': '堆栈中的拉取请求在队列中的顺序不正确'
}

const DEQUEUE_REASON_SOURCE = Object.keys(DEQUEUE_REASON)
  .map(reason => reason.replace(/[()[\]{}*+?.\\^$|]/g, '\\$&'))
  .join('|')

function dequeueReason(reason: string): string {
  return DEQUEUE_REASON[reason] ?? reason
}

/** 锁定原因（时间线小写形式，与议题时间线同译） */
const LOCK_REASON: Readonly<Record<string, string>> = {
  'off topic': '偏离主题',
  'off-topic': '偏离主题',
  'too heated': '争论过激',
  resolved: '已解决',
  spam: '垃圾信息'
}

const LOCK_REASON_SOURCE = Object.keys(LOCK_REASON).join('|')

/** 项目状态名：无状态时 GitHub 显示 No status */
function projectStatus(status: string): string {
  return status === 'No status' ? '无状态' : status
}

/**
 * 移动项目卡片：moved this from Todo to Done in <项目> → 将此拉取请求从 Todo 移至 Done 于 <项目>（与议题时间线同一写法）。
 * 原文无标点：状态名（用户内容）不加引号，后接的项目链接前用“于”；英文状态名两侧补空格
 */
function movedText(from: string | undefined, to: string): string {
  const parts = from === undefined ? ['移至', projectStatus(to)] : ['从', projectStatus(from), '移至', projectStatus(to)]
  return ['将此拉取请求', ...parts, '于'].reduce(joinCjk)
}

/** 排序依据 */
const SORT_ORDER: Readonly<Record<string, string>> = { Oldest: '最早', Newest: '最新' }
const SORT_SUBJECT: Readonly<Record<string, string>> = { comments: '评论', activity: '活动' }

/**
 * 拉取请求时间线：经典与 React 时间线的事件句子与片段、活动面板（时间线面板）、Copilot 事件、隐藏评论。
 * 事件由“操作者 + 文本片段 + 链接 / 令牌”交替组成，片段按出现位置分别收录，译文需能顺序拼读。
 * 独立的 to 译为“至”，与差异视图行范围（commits 词典）一致：从 <A> 至 <B>。
 * 审查提交、审查线程与建议见 review.ts。
 */
export default {
  static: {
    // 只出现在拉取请求中的事件
    'linked an issue that may be closed by this pull request': '链接了一个可能被此拉取请求关闭的议题',
    'removed a link to an issue': '删除了一个议题链接',
    'added a commit that referenced this pull request': '添加了一个引用此拉取请求的提交',
    'pushed a commit that referenced this pull request': '推送了一个引用此拉取请求的提交',
    'review requested due to automatic review settings': '因自动审查设置请求了审查',
    'Head branch was pushed to by a user without write access': '没有写入访问权限的用户推送了头部分支',
    // 经典时间线隐去操作者的事件（作者处为文字 Repository owner；带锁定原因的见 scoped 与 inline）
    'Repository owner locked and limited conversation to collaborators': '存储库所有者锁定了对话并限制为仅协作者可评论',
    'Repository owner deleted a comment': '存储库所有者删除了一条评论',
    'Repository owner deleted a comment from': '存储库所有者删除了以下用户的一条评论'
  },
  scoped: {
    // 审查（时间线头部）
    'approved these changes': '批准了这些更改',
    'requested changes': '请求了更改',
    'suggested changes': '建议了更改',
    'left review comments': '留下了审查评论',
    'left a comment': '发表了评论',
    reviewed: '审查于',
    'started a review': '开始审查',
    'reviewed these changes': '审查了这些更改',
    'found potential problems': '发现了潜在问题',
    'previously approved these changes': '先前批准了这些更改',
    'previously requested changes': '先前请求了更改',
    // previously 单独成段时：<用户> <previously> approved these changes；先前审查条目旁的按钮
    previously: '先前',
    'See review': '查看审查',
    // 已消除审查的状态标签（评论列表审查头部，后接时间）；不收录时 previously commented 会被 mergebox.ts 的审查者正则当作用户名
    'previously approved': '先前批准于',
    'previously recommended approval': '先前建议批准于',
    'previously suggested changes': '先前建议更改于',
    'previously commented': '先前评论于',
    'previously reviewed': '先前审查于',
    // 当前审查的状态标签（同一位置，后接时间；commented 由 common-ui 译“评论于”，与 actions 词典的 approved 同译）
    approved: '批准于',
    'recommended approval': '建议批准于',
    'changes requested': '请求更改于',
    // 消除审查：dismissed <user>’s stale review via <sha>；活动面板：dismissed <user>'s review / a review via <sha>
    // 原文无逗号，via 前不加标点：消除了 octocat 的过时审查因提交 0ff253b
    'dismissed this review': '消除了此审查',
    dismissed: '消除了',
    '’s stale review via': '的过时审查因提交',
    "'s stale review via": '的过时审查因提交',
    '’s stale review': '的过时审查',
    "'s stale review": '的过时审查',
    '’s review via': '的审查因提交',
    "'s review via": '的审查因提交',
    '’s review': '的审查',
    "'s review": '的审查',
    // stale review 是链接时 ’s 单独成段：dismissed <user>’s <stale review> via <sha>
    '’s': '的',
    'stale review': '过时审查',
    'a review': '一项审查',
    via: '因提交',
    // 没有审查者链接时：dismissed a stale review via <sha>
    'dismissed a stale review via': '消除了一项过时审查因提交',
    'View reviewed changes': '查看审查的更改',

    // 请求审查：requested review from <user> and a balanced review from <Copilot>
    'requested a review from': '请求审查者',
    'requested review from': '请求审查者',
    'requested a review': '请求了审查',
    'self-requested a review': '自行请求了审查',
    'removed the review request': '删除了审查请求',
    'removed the review request for': '删除了审查者',
    'removed the request for review from': '删除了审查者',
    'a team': '一个团队',
    'as a': '作为',
    'code owner': '代码所有者',
    'on behalf of': '代表',

    // Copilot 事件：Copilot started reviewing on behalf of <user>
    'started reviewing': '开始审查',
    'finished reviewing': '完成了审查',
    'started work': '开始工作',
    'finished work': '完成了工作',
    'stopped work': '停止了工作',
    // 动词无会话链接时与 on behalf of 合成一段（整句见下方 inline，此为整句未命中时的片段；“以下用户”指后接的用户名）
    'finished reviewing on behalf of': '代表以下用户完成了审查',
    'finished work on behalf of': '代表以下用户完成了工作',
    'stopped work on behalf of': '代表以下用户停止了工作',
    'due to an error': '因出错',
    'View session': '查看会话',
    'Copilot PR reviewer': 'Copilot 拉取请求审查者',
    'created this pull request from a session': '从会话创建了此拉取请求',
    // 会话状态后接时长：completed after <时长>
    'completed after': '完成用时',
    'failed after': '失败前已运行',

    // 推送：force-pushed the <branch> branch from <sha> to <sha>；活动面板：force-pushed <this branch> from <sha> to <sha>
    'force-pushed': '强制推送了',
    'force-pushed the': '强制推送了分支',
    // 经典时间线：force-pushed 是比较链接，the 是链接后的独立文本：<force-pushed> the <branch> branch from …
    the: '分支',
    'this branch': '此分支',
    'branch from': '从',
    to: '至',

    // 分支：merged commit <sha> into <branch>、deleted the <branch> branch；活动面板：merged commit <sha>
    'merged commit': '合并了提交',
    commit: '提交',
    into: '到',
    'deleted the': '删除了',
    // 不带分支名时的整段
    'deleted the branch': '删除了分支',
    'restored the': '恢复了',
    branch: '分支',
    'changed the base branch from': '更改了基础分支从',
    'changed the title': '更改了标题',
    'changed the title from': '更改了标题从',

    // 标签：added the <label> label、added <a> <b> and removed <c> labels
    added: '添加了',
    removed: '删除了',
    'and removed': '并删除了',
    'added the': '添加了',
    'removed the': '删除了',
    label: '标签',
    labels: '标签',
    'added a label': '添加了标签',
    'removed a label': '删除了标签',

    // 受理人
    assigned: '分配给了',
    unassigned: '取消分配了',
    'and unassigned': '并取消分配了',
    'self-assigned this': '将此拉取请求分配给了自己',
    'removed their assignment': '取消了自己的分配',

    // 里程碑与项目
    'added this to the': '将此拉取请求添加到',
    'removed this from the': '将此拉取请求移出',
    milestone: '里程碑',
    'modified the milestones:': '修改了里程碑：',
    'modified the milestone:': '修改了里程碑：',
    'added this to': '将此拉取请求添加到',
    'removed this from': '将此拉取请求移出',
    'and removed this from': '并将此拉取请求移出',

    // 状态
    'closed this': '关闭了此拉取请求',
    'reopened this': '重新打开了此拉取请求',
    'closed this PR': '关闭了此拉取请求',
    'reopened this PR': '重新打开了此拉取请求',
    'closed this in': '通过以下提交关闭了此拉取请求',
    'closed this as not planned': '以未计划为由关闭了此拉取请求',
    // 头部存储库（复刻）被删除时
    'closed this by deleting the head repository': '通过删除头部存储库关闭了此拉取请求',
    'marked this pull request as draft': '将此拉取请求标记为草稿',
    'marked this pull request as ready for review': '将此拉取请求标记为可供审查',
    'converted this to draft': '将此拉取请求转换为草稿',
    'converted this pull request to draft': '将此拉取请求转换为草稿',
    'locked this conversation': '锁定了此对话',
    'unlocked this conversation': '解锁了此对话',
    locked: '锁定了对话',
    'and limited conversation to collaborators': '并限制为仅协作者可评论',
    // 经典时间线：locked as <strong>原因</strong> and limited conversation to collaborators（整句见下方 inline；
    // 不命中时按片段拼读：将对话锁定为 偏离主题 并限制为仅协作者可评论）
    'locked as': '将对话锁定为',
    'Repository owner locked as': '存储库所有者将对话锁定为',
    ...LOCK_REASON,

    // 提及与引用：referenced this from <repo> in <commit>；referenced this pull request in a commit
    'mentioned this pull request': '提及了此拉取请求',
    'mentioned this': '提及了此拉取请求',
    'mentioned this in': '在以下位置提及了此拉取请求',
    'mentioned this pull request in': '在以下位置提及了此拉取请求',
    'referenced this pull request': '引用了此拉取请求',
    'referenced this pull request from a commit': '从提交中引用了此拉取请求',
    'referenced this': '引用了此拉取请求',
    'referenced this pull request in a commit': '在一个提交中引用了此拉取请求',
    'pull request in a commit': '于一个提交中',
    in: '于提交',
    'This was referenced': '被引用于',
    'started a Copilot session': '开始了 Copilot 会话',

    // 自动合并、合并队列与堆栈
    'enabled auto-merge': '启用了自动合并',
    'disabled auto-merge': '禁用了自动合并',
    'auto-merge was automatically disabled': '自动合并已被自动禁用',
    'Auto-merge was automatically disabled': '自动合并已被自动禁用',
    'Pull request was closed': '拉取请求已关闭',
    'enabled stacked auto-merge': '启用了堆叠自动合并',
    'disabled stacked auto-merge': '禁用了堆叠自动合并',
    'enabled stacked auto-merge (squash)': '启用了堆叠自动合并（压缩）',
    'enabled stacked auto-merge (rebase)': '启用了堆叠自动合并（变基）',
    'enabled stacked auto-merge (merge)': '启用了堆叠自动合并（合并）',
    'added this pull request to the': '将此拉取请求添加到',
    'removed this pull request from the': '将此拉取请求移出',
    'added this pull request to': '将此拉取请求添加到',
    'removed this pull request from': '将此拉取请求移出',
    'added this pull request to a stack': '将此拉取请求添加到一个堆栈',
    'removed this pull request from a stack': '将此拉取请求移出一个堆栈',
    'Merged via the queue into': '通过队列合并到',
    'with commit': '提交为',
    'added to the merge queue': '已添加到合并队列',
    // 移出合并队列：removed this pull request from the <merge queue> due to <原因>（原因在按钮里时单独成段）
    'due to': '原因是',
    because: '原因是',
    ...DEQUEUE_REASON,

    // 活动面板未单独映射的事件（GitHub 以事件类型名代替）
    'head ref deleted': '删除了头部分支',
    'head ref restored': '恢复了头部分支',
    'base ref changed': '更改了基础分支',
    'auto merge enabled': '启用了自动合并',
    'auto merge disabled': '禁用了自动合并',
    'auto squash enabled': '启用了自动压缩合并',
    'auto rebase enabled': '启用了自动变基合并',
    milestoned: '添加了里程碑',
    demilestoned: '删除了里程碑',
    connected: '链接了议题',
    disconnected: '取消了议题链接',
    'comment deleted': '删除了评论',
    'automatic base change succeeded': '自动更改基础分支成功',
    'automatic base change failed': '自动更改基础分支失败',

    // 部署：deployed to <environment>
    'deployed to': '部署到',
    'temporarily deployed to': '临时部署到',
    'had a problem deploying to': '部署到以下环境时出现问题',
    Active: '活跃',

    // 隐藏评论
    'There was a problem hiding this comment.': '隐藏此评论时出现问题。',
    'Learn more about hiding disruptive comments': '了解隐藏干扰性评论',
    'Low Quality': '低质量',
    comment: '评论',
    'This comment has been minimized.': '此评论已最小化。',
    'This comment was marked as spam.': '此评论已被标记为垃圾信息。',
    'This comment was marked as abuse.': '此评论已被标记为滥用。',
    'This comment was marked as off-topic.': '此评论已被标记为偏离主题。',
    'This comment was marked as outdated.': '此评论已被标记为过时。',
    'This comment was marked as duplicate.': '此评论已被标记为重复。',
    'This comment was marked as resolved.': '此评论已被标记为已解决。',
    'This comment was marked as low quality.': '此评论已被标记为低质量。',

    // 活动面板过滤器
    'Since this pull request was created': '自拉取请求创建以来',
    'Since your last review': '自你上次审查以来',
    'Since you last interacted': '自你上次交互以来',
    'Since marked ready for review': '自标记为可供审查以来',
    // 活动行
    'New changes since last review': '上次审查后的新更改',
    // 经典对话页时间线的分隔标记
    'New changes since you last viewed': '你上次查看后的新更改',
    'started a review thread': '开始了审查线程',
    'performed an action': '执行了操作',
    // 时间线面板
    'Any time': '任意时间',
    'Activity type': '活动类型',
    'Actor login or ID': '参与者用户名或 ID',
    Actor: '参与者',
    Since: '起始时间',
    'No activity': '暂无活动',
    'Activity on this pull request will appear here.': '此拉取请求的活动将显示在这里。',
    'No loaded activity matches the query. Change the query or retry loading activity.':
      '已加载的活动中没有匹配的结果。请更改查询或重试加载活动。',
    'No loaded activity matches the query. Change or clear the query.': '已加载的活动中没有匹配的结果。请更改或清除查询。',
    'Loading more activity': '正在加载更多活动',
    'Unable to load more activity. Try again.': '无法加载更多活动。请重试。',
    'Retry loading activity': '重试加载活动',
    'Fix the filter query to show activity.': '修正筛选器查询以显示活动。',
    'Unable to load activity.': '无法加载活动。',
    'Unable to load activity': '无法加载活动',
    'No actors in loaded activity': '已加载的活动中没有参与者',
    'Actors unavailable': '参与者不可用',
    'Loading actors': '正在加载参与者',
    'Timeline events': '时间线事件',
    'Unknown time': '未知时间',
    'Activity time': '活动时间',
    'Search loaded activity by username, commit summary, or commit SHA. All words must match; use quotes for a phrase. Combine text with type:, actor: (login or ID), and since: (available preset or ISO timestamp). Use commas for multiple types or actors.':
      '按用户名、提交摘要或提交 SHA 搜索已加载的活动。须匹配所有词语；短语请加引号。可与 type:、actor:（用户名或 ID）和 since:（可用预设或 ISO 时间戳）组合使用。多个类型或参与者用逗号分隔。',
    'Use type:, actor:, or since: qualifiers. Quote literal text containing colons or leading hyphens.':
      '请使用 type:、actor: 或 since: 限定符。含冒号或以连字符开头的文本请加引号。',
    'Parentheses, AND, and OR are not supported. Use plain text, quoted phrases, or type:, actor:, and since:.':
      '不支持括号、AND 和 OR。请使用纯文本、带引号的短语，或 type:、actor: 和 since:。',
    'Only inclusive qualifiers are supported. Remove exclusions, comparisons, or ranges.':
      '仅支持包含型限定符。请删除排除、比较或范围条件。',
    'Unknown activity type. Choose a type from the suggestions.': '未知的活动类型。请从建议中选择类型。',
    'Use an actor login or ID, not a comparison or range.': '请使用参与者用户名或 ID，不要使用比较或范围。',
    'Commented reviews': '带评论的审查',
    'Conversation comments': '对话评论',
    'State changes': '状态更改',
    'Description edits': '描述编辑',
    'Base changes and force pushes': '基础分支更改与强制推送',
    Approvals: '批准',
    // 产品名按 product-names.md 译出
    'copilot code review': 'Copilot 代码审查',
    // 评论时间线
    'View all activity': '查看全部活动',
    'Comment unavailable': '评论不可用',

    // 未登录时对话底部的注册提示
    'Have a question about this project?': '对此项目有疑问？',
    'Sign up for a free GitHub account to open an issue and contact its maintainers and the community.':
      '注册免费 GitHub 帐户以创建议题并联系维护者和社区。',
    'By clicking “Sign up for GitHub”, you agree to our': '单击“注册 GitHub”即表示你同意我们的',
    'By clicking "Sign up for GitHub", you agree to our': '单击“注册 GitHub”即表示你同意我们的',
    'terms of service': '服务条款',
    // 弯撇号版由 common/pages.ts 的全局词条翻译，直撇号版与之同译
    ". We'll occasionally send you account related emails.": '。我们会不定期向你发送帐户相关电子邮件。',
    'Already on GitHub?': '已有 GitHub 帐户？',
    'to your account': '到你的帐户'
  },
  regexp: [
    // 审查强度：requested a lite review from / and a balanced review from
    [new RegExp(`^requested an? (${EFFORT_SOURCE}) review from$`, 'i'), (_, effort) => `请求${effortName(effort)}审查者`],
    [new RegExp(`^and an? (${EFFORT_SOURCE}) review from$`, 'i'), (_, effort) => `以及${effortName(effort)}审查者`],
    // 添加了 N 个提交
    [/^added (\d+) commits?$/, '添加了 $1 个提交'],
    [/^and others added (\d+) commits?$/, '等人添加了 $1 个提交'],
    // 自动合并
    [/^enabled auto-merge \((merge|squash|rebase)\)$/, (_, method) => `启用了自动合并（${AUTO_MERGE_METHOD[method] ?? method}）`],
    [
      /^enabled auto-merge for pull request #(\d+) \((merge|squash|rebase)\)$/,
      (_, num, method) => `为拉取请求 #${num} 启用了自动合并（${AUTO_MERGE_METHOD[method] ?? method}）`
    ],
    // 合并队列：removed this pull request from the merge queue due to failed status checks（原文无标点，改语序代替逗号、冒号）
    [
      new RegExp(`^removed from the queue (?:due to|because) (${DEQUEUE_REASON_SOURCE})$`),
      (_, reason) => `因${dequeueReason(reason)}从队列中删除`
    ],
    [
      new RegExp(`^removed this pull request from the merge queue (?:due to|because) (${DEQUEUE_REASON_SOURCE})$`),
      (_, reason) => `因${dequeueReason(reason)}将此拉取请求移出合并队列`
    ],
    // 活动面板：<merge queue> 链接之后的原因（与前面的 due to 拼成一段；整句见下方 inline）
    [new RegExp(`^(?:due to|because) (${DEQUEUE_REASON_SOURCE})$`), (_, reason) => `原因是${dequeueReason(reason)}`],
    // 堆栈
    [/^added this pull request to stack #(\d+)$/, '将此拉取请求添加到堆栈 #$1'],
    [/^removed this pull request from stack #(\d+)$/, '将此拉取请求移出堆栈 #$1'],
    // 项目状态：moved this to Done in <project>
    [/^moved this from (.+?) to (.+) in$/, (_, from, to) => movedText(from, to)],
    [/^moved this to (.+) in$/, (_, status) => movedText(undefined, status)],
    // 交叉引用
    [
      /^mentioned this in (\d+) (issues|pull requests)$/,
      (_, count, kind) => `在 ${count} 个${kind === 'issues' ? '议题' : '拉取请求'}中提及了此拉取请求`
    ],
    // 锁定：locked [as off-topic] and limited conversation to collaborators（原文无标点，原因不加引号；与议题时间线同一写法）
    [
      new RegExp(`^locked (?:as (${LOCK_REASON_SOURCE}) )?and limited conversation to collaborators$`),
      (_, reason) =>
        reason ? `以${LOCK_REASON[reason] ?? reason}为由锁定了对话并限制为仅协作者可评论` : '锁定了对话并限制为仅协作者可评论'
    ],
    [
      new RegExp(`^locked this conversation as (${LOCK_REASON_SOURCE})$`),
      (_, reason) => `以${LOCK_REASON[reason] ?? reason}为由锁定了此对话`
    ],
    [new RegExp(`^as (${LOCK_REASON_SOURCE})$`), (_, reason) => `以${LOCK_REASON[reason] ?? reason}为由`],
    // 检查通过数
    [/^(\d+) of (\d+) checks passed$/, '$1/$2 个检查通过'],
    [/^(\d+) checks? passed$/, '$1 个检查通过'],
    [/^(\d+) checks? failed$/, '$1 个检查失败'],
    // 相似评论 / 之前的评论
    [/^(\d+) similar comments?$/, '$1 条相似评论'],
    [/^(\d+) previous comments?$/, '$1 条之前的评论'],
    // 消除审查：Reason for dismissing <name>'s review
    [/^Reason for dismissing (.+)['’]s review$/, '消除 $1 审查的原因'],
    // 活动面板
    [/^Showing (\d+) of (\d+) loaded events$/, '显示 $1/$2 条已加载事件'],
    [/^(\d+) activit(?:y|ies)$/, '$1 条活动'],
    [/^Expand (\d+) activit(?:y|ies)$/, '展开 $1 条活动'],
    [/^Collapse (\d+) activit(?:y|ies)$/, '折叠 $1 条活动'],
    [/^Activity filters \((\d+) active\)$/, '活动筛选器（$1 个已激活）'],
    [/^Activity \((.+)\)$/, '活动 ($1)'],
    [/^Filter activity: (.+)$/, '筛选活动：$1'],
    [
      /^Sort (comments|activity): (Oldest|Newest)$/,
      (_, subject, order) => `${SORT_SUBJECT[subject] ?? subject}排序：${SORT_ORDER[order] ?? order}`
    ],
    [/^Enter a value for (type|actor|since):\.$/, '请输入 $1: 的值。'],
    [/^Use an available since: preset or an ISO timestamp, such as (\S+)\.$/, '请使用可用的 since: 预设或 ISO 时间戳，例如 $1。'],
    // 智能体会话链接：View session <会话 ID>
    [/^View session ([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/, '查看会话 $1']
  ],
  inline: [
    // 经典时间线：<作者> changed the base branch from <main> to <dev> <时间链接>。
    // 作者前的头像、句末的时间链接随布局可有可无，前后的槽位原样带回；不命中时按上方片段逐段翻译
    [/^(\{\}*)changed the base branch from \{\} to \{\}(\{\}*)$/, '$1 将基础分支从 {} 更改为 {}$2'],
    // 经典时间线锁定事件：<作者> locked as <strong>原因</strong> and limited conversation to collaborators <时间链接>；
    // 隐去操作者时作者处为文字 Repository owner。原文无标点，原因提到句首（与上方正则同一写法）
    [/^(\{\}*)locked as \{\} and limited conversation to collaborators(\{\}*)$/, '$1 以{}为由锁定了对话并限制为仅协作者可评论 $2'],
    [
      /^(\{\}*)Repository owner locked as \{\} and limited conversation to collaborators(\{\}*)$/,
      '$1 存储库所有者以{}为由锁定了对话并限制为仅协作者可评论 $2'
    ],
    // 活动面板（RemovedFromMergeQueueText）：<作者> removed this pull request from the <merge queue> due to <原因>。
    // 原文无标点：原因是文字时提到句首；原因在按钮里时作“…移出合并队列的原因是 <原因>”。作者元素带右边距，不补空格
    [
      new RegExp(`^(\\{\\}*)removed this pull request from the \\{\\} (?:due to|because) (${DEQUEUE_REASON_SOURCE})$`),
      (_, lead, reason) => `${lead}因${dequeueReason(reason)}将此拉取请求移出{}`
    ],
    [/^(\{\}*)removed this pull request from the \{\} (?:due to|because) \{\}$/, '$1将此拉取请求移出{}的原因是{}'],
    // 经典时间线编码智能体事件：<Copilot> finished work on behalf of <用户> [due to an error] <时间链接>。
    // 原文无标点，用户名提到动词前（与 copilot/code.ts 的整句正则同一写法）；用户链接后没有文本节点时整句写不进去，
    // 按上方 scoped 片段“代表以下用户完成了工作”逐段翻译
    [
      /^(\{\}*)(finished|stopped) work on behalf of \{\}(due to an error)?(\{\}*)$/,
      (_, lead, verb, error, tail) => `${lead} 代表 {} ${error ? '因出错' : ''}${verb === 'finished' ? '完成了工作' : '停止了工作'} ${tail}`
    ],
    [/^(\{\}*)finished reviewing on behalf of \{\}(\{\}*)$/, '$1 代表 {} 完成了审查 $2']
  ]
} satisfies PageDictionary
