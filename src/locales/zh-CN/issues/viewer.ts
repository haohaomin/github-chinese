import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { joinName } from './list'

/** 智能体建议的置信度 */
const CONFIDENCE: Readonly<Record<string, string>> = { High: '高', Medium: '中', Low: '低' }

/** 智能体建议的字段名（建议条 aria-label，已应用时为小写） */
const SUGGESTION_FIELD: Readonly<Record<string, string>> = {
  type: '类型',
  label: '标签',
  close: '关闭',
  assignee: '受理人',
  field: '字段'
}

function suggestionField(name: string): string {
  return SUGGESTION_FIELD[name.toLowerCase()] ?? name
}

/** 待处理的 X 建议：自定义字段名保留原文，与中文之间按 joinName 留空格 */
function pendingSuggestion(name: string): string {
  return joinName(joinName('待处理的', suggestionField(name)), '建议')
}

function confidenceText(level: string | undefined): string {
  return level ? `。置信度${CONFIDENCE[level] ?? level}` : ''
}

/** 保存视图 / 排序菜单的对象名 */
const SORT_SUBJECT: Readonly<Record<string, string>> = { comments: '评论', activity: '活动' }

/** 头部状态按钮中的状态名（GitHub 预设；组织自定义的状态名原样保留） */
const STATUS_NAME: Readonly<Record<string, string>> = {
  Open: '打开',
  Closed: '已关闭',
  'Closed as not planned': '已关闭为未计划',
  'Closed as duplicate': '已关闭为重复',
  Completed: '已完成',
  'Not planned': '未计划',
  Duplicate: '重复',
  New: '新建',
  Backlog: '待办',
  Todo: '待办',
  Planned: '已计划',
  Started: '已开始',
  'In progress': '正在进行',
  'In review': '审查中',
  Done: '已完成',
  // 列表项状态图标的 title（Status: Merged）与通用词典一致
  Merged: '已合并',
  Draft: '草稿',
  Queued: '已排队',
  Archived: '已存档'
}

function statusName(name: string): string {
  return STATUS_NAME[name] ?? name
}

/** 前缀 + 状态名：状态名是界面文字或组织自定义名称，原文无引号，译文不加；与中文之间按 joinName 留空格 */
function withStatus(prefix: string, name: string): string {
  return joinName(prefix, statusName(name))
}

/** 头部智能体会话摘要的状态分组：1 session running、2 sessions needs input, 1 failed */
const SESSION_GROUP: Readonly<Record<string, string>> = {
  'needs input': '需要输入',
  running: '运行中',
  failed: '失败',
  complete: '已完成',
  cancelled: '已取消'
}

const SESSION_GROUP_SOURCE = Object.keys(SESSION_GROUP).join('|')

function sessionGroup(name: string): string {
  return SESSION_GROUP[name] ?? name
}

/** 摘要的次要部分：, 1 failed / , 2 others */
function sessionRest(count: string | undefined, name: string | undefined): string {
  if (!count || !name) return ''
  return /^others?$/.test(name) ? `，其他 ${count} 个` : `，${count} 个${sessionGroup(name)}`
}

/**
 * 议题详情页：头部（标题、状态、导航、吸顶头部）、正文头部、关闭 / 重新打开、议题操作（锁定、置顶、转移、
 * 转为讨论、删除、克隆）、通知设置、活动筛选、智能体建议、附件、错误与登录提示。
 * 侧栏元数据见 metadata.ts，时间线事件见 timeline.ts。
 */
export default {
  static: {
    // 头部
    'Edit issue title': '编辑议题标题',
    'Could not update issue title': '无法更新议题标题',
    'Closed as not planned': '已关闭为未计划',
    // 状态标签图标（Primer StateLabel）
    'Issue, not planned': '议题，未计划',
    'Issue navigation': '议题导航',
    'Next issue': '下一个议题',
    'Previous issue': '上一个议题',
    'Issue transfer in progress': '议题正在转移',
    'Dismiss issue is in transfer notification': '关闭议题转移通知',
    'Show issue details': '显示议题详细信息',
    // 订阅状态按钮（原文无逗号，译文用“因…而…”，与 pulls、discussions 同句同译）
    "You're receiving notifications because you're subscribed to this thread. Click to unsubscribe":
      '你因已订阅此线程而收到通知。单击可取消订阅',
    "You're not receiving notifications from this thread. Click to subscribe": '你不会收到此线程的通知。单击可订阅',
    'thread subscription status changed to subscribed': '线程订阅状态已更改为已订阅',
    'thread subscription status changed to unsubscribed': '线程订阅状态已更改为未订阅',
    'Linked security alerts': '链接的安全警报',
    'You cannot contribute to repositories outside of your enterprise.': '你无法向企业外部的存储库做贡献。',

    // 正文
    'Issue body actions': '议题正文操作',
    'Edit issue body': '编辑议题正文',
    'Could not update issue body': '无法更新议题正文',
    'Could not convert the checklist item to an issue. Please refresh the page and try again.':
      '无法将清单项转换为议题。请刷新页面后重试。',
    'Copy link to pinned comment': '复制置顶评论链接',
    'Pinned comment options': '置顶评论选项',
    'Failed to pin comment': '置顶评论失败',
    'Failed to unpin comment': '取消置顶评论失败',
    'URL must be available to be copied': '链接可用时才能复制',
    'Failed to unblock user': '取消阻止用户失败',

    // 关闭 / 重新打开（评论框下方）
    'Close issue': '关闭议题',
    'Close as completed': '以已完成关闭',
    'Close as not planned': '以未计划关闭',
    'Done, closed, fixed, resolved': '已完成、已关闭、已修复、已解决',
    "Won't fix, can't repro, stale": '不修复、无法复现、已过时',
    'Won’t fix, can’t repro, stale': '不修复、无法复现、已过时',
    // 经典页的四项写法（弯引号版只在项目页出现，见 projects/items.ts）
    "Won't fix, can't repro, duplicate, stale": '不修复、无法复现、重复、已过时',
    'Duplicate of another issue': '与其他议题重复',
    'Reopen issue': '重新打开议题',
    'Reopen Issue': '重新打开议题',
    'update issue state options menu': '更新议题状态选项菜单',
    'update issue status options menu': '更新议题状态选项菜单',
    'The issue has been closed.': '议题已关闭。',
    'The issue has been reopened.': '议题已重新打开。',
    'Failed to close issue': '关闭议题失败',
    'Failed to reopen issue': '重新打开议题失败',
    'Could not close issue': '无法关闭议题',
    'Could not reopen issue': '无法重新打开议题',
    'You do not have permissions to close this issue': '你没有关闭此议题的权限',
    'You do not have permissions to reopen this issue': '你没有重新打开此议题的权限',
    'You do not have permissions to set this status': '你没有设置此状态的权限',

    // 评论框：低质量评论提示、锁定与转换说明
    'Consider using reactions instead': '可以考虑改用反应',
    'To help keep issues focused, consider reacting or adding more details to your comment.':
      '为保持议题聚焦，请考虑使用反应，或在评论中补充更多细节。',
    'To help keep issues focused, consider adding more details to your comment.': '为保持议题聚焦，请考虑在评论中补充更多细节。',
    'Like issue instead 👍': '改为给议题点赞 👍',
    'Added a 👍 to this issue.': '已为此议题点赞 👍。',
    'Added a 👍 to this issue and subscribed to updates.': '已为此议题点赞 👍，并订阅了更新。',
    'Subscribed to updates.': '已订阅更新。',
    'Unsubscribed from updates.': '已取消订阅更新。',
    'This conversation has been locked and limited to collaborators.': '此对话已锁定并限制为仅协作者可评论。',
    // 后接 NBSP 与链接 discussion，原文没有标点：用“…的原因是”承接
    'Commenting has been disabled because this issue was converted to a': '已禁用评论的原因是此议题已转换为',
    'You do not have permissions to comment on this issue.': '你没有在此议题上评论的权限。',
    'Comment form unavailable': '评论表单不可用',
    'The comment form cannot be displayed. Reload the page to try again.': '无法显示评论表单。请重新加载页面后重试。',

    // 议题操作
    'Pin issue': '置顶议题',
    'Unpin issue': '取消置顶议题',
    'Could not pin issue': '无法置顶议题',
    'Could not unpin issue': '无法取消置顶议题',
    // 置顶 / 取消置顶的说明（公共存储库、专用存储库各一句）与结果提示
    'Up to 3 issues can be pinned and they will appear publicly at the top of the issues page': '最多可置顶 3 个议题并公开显示在议题页顶部',
    'Up to 3 issues can be pinned and they will appear at the top of the issues page': '最多可置顶 3 个议题并显示在议题页顶部',
    'Up to 3 issues can be pinned to the top of the issues page': '最多可在议题页置顶 3 个议题',
    'This will unpin this issue from the top of the issues page': '这会在议题页取消置顶此议题',
    'The issue has been pinned.': '议题已置顶。',
    'The issue has been unpinned.': '议题已取消置顶。',
    'Clone issue': '克隆议题',
    'Add issue type': '添加议题类型',
    'Change issue type': '更改议题类型',
    'Select issue type': '选择议题类型',
    'Something went wrong, could not set the issue type. Please reload and try again.': '出错了，无法设置议题类型。请重新加载后重试。',
    'Open in GitHub Copilot app': '在 GitHub Copilot 应用中打开',

    // 锁定对话
    'Lock conversation on this issue': '锁定此议题的对话',
    'Unlock conversation on this issue': '解锁此议题的对话',
    'Lock conversation': '锁定对话',
    'Unlock conversation': '解锁对话',
    "Other users can't add new comments to this issue. You and other members of teams with":
      '其他用户将无法对此议题发表新评论。你和其他拥有此存储库',
    'Other users can’t add new comments to this issue. You and other members of teams with':
      '其他用户将无法对此议题发表新评论。你和其他拥有此存储库',
    'write access': '写入访问权限',
    'to this repository can still leave comments that others can see. You can always unlock this issue again in the future.':
      '的团队成员仍可发表他人可见的评论。你随时可以再次解锁此议题。',
    'Everyone will be able to comment on this issue once more. You can always lock this issue again in the future.':
      '所有人都将可以再次对此议题发表评论。你随时可以再次锁定此议题。',
    'Failed to lock the conversation': '锁定对话失败',
    'Failed to unlock the conversation': '解锁对话失败',

    // 转移
    'Transfer issue': '转移议题',
    'This does not scrub any issue content. Content such as text references to other issues, pull requests, projects and teams will still appear in the description or comments. Labels will be transferred.':
      '转移不会清除议题内容。对其他议题、拉取请求、项目和团队的文字引用仍会保留在描述或评论中。标签会一并转移。',
    'Issue transfer has started. This action might take a while.': '议题转移已开始。此操作可能需要一些时间。',
    'Issue cannot be transferred to this repository.': '议题无法转移到此存储库。',
    'Could not initiate issue transfer': '无法发起议题转移',
    'Some repositories may be excluded.': '部分存储库可能未列出。',

    // 转为讨论
    'Convert to discussion': '转换为讨论',
    'Convert issue to a discussion': '将议题转换为讨论',
    'What happens when an issue is converted into a discussion:': '议题转换为讨论后：',
    'Issue will be closed and locked': '议题将被关闭并锁定',
    'Title, description, and author will be the same as the issue': '标题、描述和作者与议题相同',
    'All comments and reactions will be the same as the issue': '所有评论和反应与议题相同',
    'Discussions do not have tasklists': '讨论没有任务列表',
    'Discussions do not have assignees': '讨论没有受理人',
    'Discussions cannot be added to projects': '讨论无法添加到项目',
    'Discussions do not have milestones': '讨论没有里程碑',
    'Category for new discussion': '新讨论的类别',
    'I understand, convert this issue': '我已了解，转换此议题',
    'This issue has been moved to a discussion': '此议题已移至讨论',
    'Go to the discussion': '转到讨论',
    'Convert issue failed': '议题转换失败',

    // 删除
    'Delete issue': '删除议题',
    'Delete issue?': '删除议题？',
    'Only administrators can delete issues': '只有管理员可以删除议题',
    'Deletion will remove the issue from search and previous references will point to a placeholder':
      '删除会将议题从搜索结果中移除并使原有引用指向占位页',
    'Could not delete the issue. Please try again.': '无法删除议题。请重试。',
    'The issue was deleted, but the page could not be refreshed. Please reload the page.': '议题已删除，但无法刷新页面。请重新加载页面。',
    'The issue was successfully deleted.': '议题已删除。',
    'This issue has been deleted.': '此议题已被删除。',

    // 通知设置
    "You're now unsubscribed from this issue.": '你已取消订阅此议题。',
    "You're now subscribed to this issue.": '你已订阅此议题。',
    "You're not receiving notifications from this thread.": '你不会收到此线程的通知。',
    "You're receiving notifications because you're subscribed to this thread.": '你因已订阅此线程而收到通知。',
    'Notifications settings': '通知设置',
    'Only receive notifications from this issue when you have participated or have been @mentioned.':
      '仅在你参与或被 @提及时接收此议题的通知。',
    'Receive all notifications from this issue.': '接收此议题的所有通知。',
    'You will only be notified for events selected from the list below. If you participate or are @mentioned you will be subscribed.':
      '仅接收下方所选事件的通知。你参与或被 @提及时将自动订阅。',
    'You will be notified when this issue is closed.': '此议题关闭时通知你。',
    'You will be notified when this issue is reopened.': '此议题重新打开时通知你。',
    'Please select at least one custom event to subscribe to.': '请至少选择一个要订阅的自定义事件。',
    'Notification preferences saved': '通知首选项已保存',

    // 未找到与加载错误
    'Issue not found': '未找到议题',
    'This issue does not exist or has been deleted.': '此议题不存在或已被删除。',
    "This issue couldn't be loaded here.": '无法在此加载此议题。',
    'This issue couldn’t be loaded here.': '无法在此加载此议题。',
    'Issue metadata reconciliation failed': '议题元数据同步失败',

    // 活动筛选与排序
    'Labels and metadata': '标签和元数据',
    'Filter activity': '筛选活动',
    'At least one type must be shown': '至少需要显示一种类型',
    'No matching activity': '没有匹配的活动',
    'Showing all activity so the linked event is visible.': '已显示全部活动，以便看到链接指向的事件。',
    'Showing all activity so this comment is visible.': '已显示全部活动，以便看到此评论。',
    'Use my filters': '使用我的筛选器',
    'Nothing on this issue matches the selected filters.': '此议题中没有与所选筛选器匹配的内容。',
    '(give feedback on the issue timeline, opens in a new tab)': '（对议题时间线提供反馈，在新标签页中打开）',
    'Activity on this issue will appear here.': '此议题的活动将显示在这里。',
    'Comment unavailable. This comment cannot be shown in the activity timeline.': '评论不可用。此评论无法在活动时间线中显示。',
    'This comment cannot be shown in the activity timeline.': '此评论无法在活动时间线中显示。',

    // 反馈
    'Give feedback on Issues': '对议题提供反馈',

    // 智能体任务与建议
    'Session log is private to its creator': '会话日志仅创建者可见',
    'Agent suggestions': '智能体建议',
    'Could not accept suggestions': '无法接受建议',
    'Could not accept all suggestions': '无法接受全部建议',
    'Could not decline suggestions': '无法拒绝建议',
    'Suggestion approved': '已接受建议',
    'Suggestion rejected': '已拒绝建议',
    'Unable to load task chat:': '无法加载任务对话：',
    'Loading task chat': '正在加载任务对话',
    'Unable to load task data.': '无法加载任务数据。',
    'Unable to load repository information.': '无法加载存储库信息。',
    'Repository information not available.': '存储库信息不可用。',
    'No session information available.': '暂无会话信息。',
    // 产品名按用户要求译成中文（product-names.md）：Copilot Chat → Copilot 聊天（与 projects/items.ts 同句一致）
    'Unable to load Copilot Chat. Ensure Copilot is enabled.': '无法加载 Copilot 聊天。请确认已启用 Copilot。',

    // 附件
    'Collapse artifacts': '折叠附件',
    'Expand artifacts': '展开附件',
    'Add artifact': '添加附件',
    'Create artifact': '创建附件',
    'Create HTML artifact': '创建 HTML 附件',
    'Create new artifact': '新建附件',
    'Edit artifact': '编辑附件',
    'Saving artifact': '正在保存附件',
    'Creating artifact': '正在创建附件',
    'Artifact title': '附件标题',
    'Invalid artifact name': '附件名称无效',
    'Unable to update artifact': '无法更新附件',
    'Unable to create artifact': '无法创建附件',
    'Artifact updated successfully.': '附件已更新。',
    'Artifact could not be updated. Try again.': '无法更新附件。请重试。',
    'Artifact could not be created. Try again.': '无法创建附件。请重试。',
    'Use up to 255 characters: letters, numbers, spaces, periods, hyphens, or underscores. Start and end with a letter or number.':
      '最多 255 个字符：字母、数字、空格、句点、连字符或下划线。须以字母或数字开头和结尾。',
    'HTML source': 'HTML 源码',
    'Paste HTML source...': '粘贴 HTML 源码...',
    'Write markdown...': '编写 Markdown...',
    'Unable to reorder artifact. Previous order restored.': '无法调整附件顺序。已恢复原顺序。',
    'Link could not be updated. Try again.': '无法更新链接。请重试。',
    'Link could not be added. Try again.': '无法添加链接。请重试。'
  },
  scoped: {
    // 头部与正文头部（“– with”“No description provided.”等评论通用文字由通用词典处理）
    Header: '头部',
    'Issue actions': '议题操作',
    'Body input': '正文输入',
    'Title input': '标题输入',
    'Parent:': '父议题：',
    'Blocked by:': '被阻止：',
    'Listed in': '列于',
    'Back to': '返回',
    'Linked pull requests': '链接的拉取请求',
    'Fixed by': '已修复',
    Remaining: '待处理',
    Fixed: '已修复',
    'Pinned by': '置顶者',
    'Unpin comment': '取消置顶评论',
    'View full comment': '查看完整评论',
    'Write with Copilot': '使用 Copilot 编写',

    // 正文操作菜单：复制链接、引用回复等与评论菜单相同，由通用词典处理；Block user、Unblock user 由个人资料词典的 static 处理
    // 正文与评论下方反应栏的添加按钮（登录后显示）
    React: '添加反应',

    // 评论框下方的贡献须知：Please follow this repository's [contributing guidelines] and [security policy].
    "Please follow this repository's": '请遵守此存储库的',
    'Please follow this repository’s': '请遵守此存储库的',

    // 关闭 / 状态（头部状态标签：Closed as duplicate of <链接 #12>，吸顶头部为 Duplicate of）
    'Closed as duplicate': '已关闭为重复',
    'Closed as duplicate of': '已关闭为重复于',
    'Close as duplicate': '以重复关闭',
    'Change type': '更改类型',
    'Open in': '打开方式',
    discussion: '讨论',

    // 锁定原因（Spam、Off-topic、Resolved 由通用词典处理）
    'No reason': '无原因',
    'Too heated': '争论过激',

    // 删除确认
    'This cannot be undone': '此操作无法撤销',

    // 通知设置选项
    'Not subscribed': '未订阅',
    Subscribed: '已订阅',
    Unsubscribed: '已取消订阅',
    Custom: '自定义',
    'Custom options': '自定义选项',
    Reopened: '已重新打开',
    'Customize: Updated': '自定义：已更新',

    // 未找到 / 离开确认（直引号的 Couldn't load 由通用词典处理）
    'Couldn’t load': '无法加载',
    'Are you sure you want to leave? You have unsaved changes.': '确定要离开吗？你有未保存的更改。',
    'Something went wrong! Please try again': '出错了！请重试',
    // 时间线错误占位的句尾：… Try reloading the page. <a>Contact support</a> if the problem persists.
    // 整句见 timeline.ts 的 inline（译为“仍然出错时请联系支持。”）；此为整句未命中时的片段
    'if the problem persists.': '（如果仍然出错）。',

    // 活动筛选与排序
    Comments: '评论',
    'Status updates': '状态更新',
    References: '引用',
    Moderation: '调解',
    'No activity': '暂无活动',
    'Comment unavailable': '评论不可用',
    'Loading activity': '正在加载活动',
    'Loading comments': '正在加载评论',

    // 反馈评分
    Hate: '讨厌',
    Dislike: '不喜欢',
    Neutral: '一般',
    Like: '喜欢',
    Love: '非常喜欢',

    // 智能体任务（会话状态：Working、Idle 等由通用词典处理）
    Agent: '智能体',
    'Agent session': '智能体会话',
    'Agent sessions': '智能体会话',
    'Loading tasks': '正在加载任务',
    'needs input': '需要输入',
    'Ready for review': '可供审查',
    Done: '已完成',
    Failed: '失败',
    'Timed out': '已超时',
    Stopped: '已停止',
    Unknown: '未知',
    'View latest session': '查看最新会话',
    'View session': '查看会话',

    // 智能体建议
    'Decline all': '全部拒绝',
    'Accept all': '全部接受',
    'Never show this again': '不再显示',
    'Suggested by': '建议者',
    Applied: '已应用',
    'Duplicate of': '重复于',
    'duplicate of': '重复于',

    // 附件
    Artifacts: '附件',
    'Add link': '添加链接',
    'Edit link': '编辑链接',
    'Saving link': '正在保存链接',
    'Adding link': '正在添加链接',
    'Unable to update link': '无法更新链接',
    'Unable to add link': '无法添加链接',
    'Link title': '链接标题',

    // 时间线加载更多：<span>12</span><span> remaining <span>items</span></span>（整段由 timeline.ts 的 mergeText 合并翻译为“还有 12 项”；
    // 此为整段未命中时的片段，items 由通用词典处理）
    remaining: '剩余',
    item: '项'
  },
  regexp: [
    // 标签页标题片段：Issue #123
    [/^Issue #(\d+)$/, '议题 #$1'],
    // 头部：父议题、阻止、子议题进度、跟踪、受理人（原文无标点的译文不加冒号、逗号）
    [/^Parent issue: (.+)$/, '父议题：$1'],
    [/^Blocked by (\d+) issues?$/, '被 $1 个议题阻止'],
    [/^Blocked by issue (.+)$/, (_, title) => joinName(joinName('被议题', title), '阻止')],
    [/^(\d+) of (\d+) issues? completed$/, '已完成 $1/$2 个议题'],
    [/^Listed in (\d+) issues$/, '列于 $1 个议题'],
    [/^([\w-]+(?:\[bot\])?) is assigned$/, '已分配给 $1'],
    // 视图内议题导航的读屏位置（可见文字为 (3/12)）：与通用词典“N 个中的第 X 个”同一写法
    [/^Issue (\d+) of (\d+)$/, '$2 个议题中的第 $1 个'],
    [/^Alert: #(\d+)$/, '警报：#$1'],
    [/^Alert: (.+)$/, '警报：$1'],
    [/^View pull request #(\d+)$/, '查看拉取请求 #$1'],
    [/^Agents assigned by ([\w-]+(?:\[bot\])?)$/, '由 $1 分配的智能体'],
    // 头部智能体会话摘要（按钮文字与 aria-label）：2 sessions needs input, 1 failed
    [
      new RegExp(`^(Agent sessions: )?(\\d+) sessions? (${SESSION_GROUP_SOURCE})(?:, (\\d+) (${SESSION_GROUP_SOURCE}|others?))?$`),
      (_, prefix, count, group, restCount, restName) =>
        `${prefix ? '智能体会话：' : ''}${count} 个会话${sessionGroup(group)}${sessionRest(restCount, restName)}`
    ],
    // 关闭 / 状态
    [/^Close as duplicate of #(\d+)$/, '以 #$1 的重复项关闭'],
    [/^Issue closed as a duplicate of #(\d+)$/, '议题已作为 #$1 的重复项关闭'],
    // 评论框状态按钮：Mark as Done、Mark as Duplicate of #12 with comment（状态名两侧不加引号）
    [
      /^Mark as (.+?)(?: of #(\d+))?( with comment)?$/,
      (_, status, number, comment) => `${number ? `标记为 #${number} 的重复项` : withStatus('标记为', status)}${comment ? '并评论' : ''}`
    ],
    [
      /^Status set to (.+?)(?: of #(\d+))?$/,
      (_, status, number) => (number ? `状态已设为 #${number} 的重复项` : withStatus('状态已设为', status))
    ],
    [/^Could not set the status to (.+)$/, (_, status) => withStatus('无法将状态设为', status)],
    // 头部状态按钮：Status: Open（列表项图标的“Status: … .”带句号，由 list.ts 处理）
    [/^Status: ([^.]+)$/, (_, status) => `状态：${statusName(status)}`],
    // 置顶上限
    [/^(\d+)\/(\d+) issues already pinned\. Unpin an issue to pin this one\.$/, '已置顶 $1/$2 个议题。请先取消置顶一个议题。'],
    // 正文：清单项转议题
    [/^Create an issue with the title "(.+)"$/, '创建标题为“$1”的议题'],
    // 正文头部：Copilot 等非用户名作者的头像链接（@octocat's profile 与阻止、取消阻止 @用户由通用词典处理）
    [/^([\w-]+(?:\[bot\])?)'s profile$/, '$1 的个人资料'],
    // 仪表板侧边面板加载失败时的后备链接
    [/^Open issue #(\d+)$/, '打开议题 #$1'],
    // 活动排序按钮
    [
      /^Sort (comments|activity): (Oldest|Newest)$/,
      (_, subject, order) => `${SORT_SUBJECT[subject] ?? subject}排序：${order === 'Oldest' ? '最早' : '最新'}`
    ],
    // 智能体建议
    [/^(High|Medium|Low) confidence$/, (_, level) => `置信度${CONFIDENCE[level] ?? level}`],
    [/^(\d+) suggestions approved$/, '已接受 $1 条建议'],
    [/^(\d+) suggestions rejected$/, '已拒绝 $1 条建议'],
    [
      /^Pending label suggestions: (.+?)(?:\. (High|Medium|Low) confidence)?\. View details$/,
      (_, labels, level) => `待处理的标签建议：${labels}${confidenceText(level)}。查看详细信息`
    ],
    [
      /^Pending (.+?) suggestion(?:: (.+?))?(?:\. (High|Medium|Low) confidence)?\. View details$/,
      (_, field, value, level) => `${pendingSuggestion(field)}${value ? `：${value}` : ''}${confidenceText(level)}。查看详细信息`
    ],
    [
      /^Applied ([\w -]+?): (.+?)(\. View rationale)?$/,
      (_, field, value, rationale) => `${joinCjk('已应用', suggestionField(field))}：${value}${rationale ? '。查看理由' : ''}`
    ],
    [/^duplicate of ([\w.-]+\/[\w.-]+#\d+)$/, '重复于 $1'],
    // 附件
    [/^Edit artifact: (.+)$/, '编辑附件：$1'],
    [/^More actions for (.+)$/, '$1 的更多操作']
  ]
} satisfies PageDictionary
