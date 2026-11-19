import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { joinName } from './list'

/** 代理建议的置信度 */
const CONFIDENCE: Readonly<Record<string, string>> = { High: '高', Medium: '中等', Low: '低' }

/** 代理建议的字段名（建议条 aria-label，已应用时为小写） */
const SUGGESTION_FIELD: Readonly<Record<string, string>> = {
  type: '類型',
  label: '標籤',
  close: '關閉',
  assignee: '負責人',
  field: '欄位'
}

function suggestionField(name: string): string {
  return SUGGESTION_FIELD[name.toLowerCase()] ?? name
}

/** 待處理的 X 建議：自定义字段名保留原文，与中文之间按 joinName 留空格 */
function pendingSuggestion(name: string): string {
  return joinName(joinName('待處理的', suggestionField(name)), '建議')
}

function confidenceText(level: string | undefined): string {
  return level ? `。${CONFIDENCE[level] ?? level}信賴度` : ''
}

/** 保存视图 / 排序菜单的对象名 */
const SORT_SUBJECT: Readonly<Record<string, string>> = { comments: '留言', activity: '活動' }

/** 头部状态按钮中的状态名（GitHub 预设；组织自定义的状态名原样保留） */
const STATUS_NAME: Readonly<Record<string, string>> = {
  Open: '開放中',
  Closed: '已關閉',
  'Closed as not planned': '已關閉並標示為不予處理',
  'Closed as duplicate': '已關閉並標示為重複',
  Completed: '已完成',
  'Not planned': '不予處理',
  Duplicate: '重複',
  New: '新',
  Backlog: '待辦清單',
  Todo: '待辦',
  Planned: '已規劃',
  Started: '已開始',
  'In progress': '進行中',
  'In review': '審查中',
  Done: '已完成',
  // 列表项状态图标的 title（Status: Merged）与通用词典一致
  Merged: '已合併',
  Draft: '草稿',
  Queued: '已排入佇列',
  Archived: '已封存'
}

function statusName(name: string): string {
  return STATUS_NAME[name] ?? name
}

/** 前缀 + 状态名：状态名是界面文字或组织自定义名称，原文无引号，译文不加；与中文之间按 joinName 留空格 */
function withStatus(prefix: string, name: string): string {
  return joinName(prefix, statusName(name))
}

/** 头部代理会话摘要的状态分组：1 session running、2 sessions needs input, 1 failed */
const SESSION_GROUP: Readonly<Record<string, string>> = {
  'needs input': '需要輸入',
  running: '執行中',
  failed: '失敗',
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
  return /^others?$/.test(name) ? `，其他 ${count} 個` : `，${count} 個${sessionGroup(name)}`
}

/**
 * 议题详情页：头部（标题、状态、导航、吸顶头部）、正文头部、关闭 / 重新打开、议题操作（锁定、固定、转移、
 * 转为讨论、删除、克隆）、通知设置、活动筛选、代理建议、附件、错误与登录提示。
 * 侧栏元数据见 metadata.ts，时间线事件见 timeline.ts。
 */
export default {
  static: {
    // 头部
    'Edit issue title': '編輯議題標題',
    'Could not update issue title': '無法更新議題標題',
    'Closed as not planned': '已關閉並標示為不予處理',
    // 状态标签图标（Primer StateLabel）
    'Issue, not planned': '議題，不予處理',
    'Issue navigation': '議題導覽',
    'Next issue': '下一個議題',
    'Previous issue': '上一個議題',
    'Issue transfer in progress': '正在轉移議題',
    'Dismiss issue is in transfer notification': '關閉議題轉移中通知',
    'Show issue details': '顯示議題詳細資料',
    // 订阅状态按钮（原文无逗号，译文用「因…而…」，与 pulls、discussions 同句同译）
    "You're receiving notifications because you're subscribed to this thread. Click to unsubscribe":
      '你因已訂閱此討論串而收到通知。按一下可取消訂閱',
    "You're not receiving notifications from this thread. Click to subscribe": '你不會收到此討論串的通知。按一下可訂閱',
    'thread subscription status changed to subscribed': '討論串訂閱狀態已變更為已訂閱',
    'thread subscription status changed to unsubscribed': '討論串訂閱狀態已變更為未訂閱',
    'Linked security alerts': '已連結的安全性警示',
    'You cannot contribute to repositories outside of your enterprise.': '你無法對企業外部的儲存庫做出貢獻。',

    // 正文
    'Issue body actions': '議題內文動作',
    'Edit issue body': '編輯議題內文',
    'Could not update issue body': '無法更新議題內文',
    'Could not convert the checklist item to an issue. Please refresh the page and try again.':
      '無法將檢查清單項目轉換為議題。請重新整理頁面後再試一次。',
    'Copy link to pinned comment': '複製已釘選留言的連結',
    'Pinned comment options': '已釘選留言選項',
    'Failed to pin comment': '無法釘選留言',
    'Failed to unpin comment': '無法取消釘選留言',
    'URL must be available to be copied': 'URL 可用時才能複製',
    'Failed to unblock user': '無法解除封鎖使用者',

    // 关闭 / 重新打开（评论框下方）
    'Close issue': '關閉議題',
    'Close as completed': '關閉並標示為完成',
    'Close as not planned': '關閉並標示為不予處理',
    'Done, closed, fixed, resolved': '已完成、已關閉、已修正、已解決',
    "Won't fix, can't repro, stale": '不予修正、無法重現、過時',
    'Won’t fix, can’t repro, stale': '不予修正、無法重現、過時',
    // 经典页的四项写法（弯引号版只在项目页出现，见 projects/items.ts）
    "Won't fix, can't repro, duplicate, stale": '不予修正、無法重現、重複、過時',
    'Duplicate of another issue': '與其他議題重複',
    'Reopen issue': '重新開啟議題',
    'Reopen Issue': '重新開啟議題',
    'update issue state options menu': '更新議題狀態選項選單',
    'update issue status options menu': '更新議題狀態選項選單',
    'The issue has been closed.': '議題已關閉。',
    'The issue has been reopened.': '議題已重新開啟。',
    'Failed to close issue': '無法關閉議題',
    'Failed to reopen issue': '無法重新開啟議題',
    'Could not close issue': '無法關閉議題',
    'Could not reopen issue': '無法重新開啟議題',
    'You do not have permissions to close this issue': '你沒有關閉此議題的權限',
    'You do not have permissions to reopen this issue': '你沒有重新開啟此議題的權限',
    'You do not have permissions to set this status': '你沒有設定此狀態的權限',

    // 评论框：低质量评论提示、锁定与转换说明
    'Consider using reactions instead': '可考慮改用表情回應',
    'To help keep issues focused, consider reacting or adding more details to your comment.':
      '為了讓議題保持聚焦，可考慮改用表情回應，或在留言中補充更多細節。',
    'To help keep issues focused, consider adding more details to your comment.': '為了讓議題保持聚焦，可考慮在留言中補充更多細節。',
    'Like issue instead 👍': '改為對議題按讚 👍',
    'Added a 👍 to this issue.': '已為此議題按讚 👍。',
    'Added a 👍 to this issue and subscribed to updates.': '已為此議題按讚 👍 並訂閱更新。',
    'Subscribed to updates.': '已訂閱更新。',
    'Unsubscribed from updates.': '已取消訂閱更新。',
    'This conversation has been locked and limited to collaborators.': '此對話已鎖定並限制為僅協作者可留言。',
    // 后接 NBSP 与链接 discussion，原文没有标点：用「…的原因是」承接
    'Commenting has been disabled because this issue was converted to a': '已停用留言的原因是此議題已轉換為',
    'You do not have permissions to comment on this issue.': '你沒有在此議題留言的權限。',
    'Comment form unavailable': '無法使用留言表單',
    'The comment form cannot be displayed. Reload the page to try again.': '無法顯示留言表單。請重新載入頁面後再試一次。',

    // 议题操作
    'Pin issue': '釘選議題',
    'Unpin issue': '取消釘選議題',
    'Could not pin issue': '無法釘選議題',
    'Could not unpin issue': '無法取消釘選議題',
    // 固定 / 取消固定的说明（公共存储库、专用存储库各一句）与结果提示
    'Up to 3 issues can be pinned and they will appear publicly at the top of the issues page':
      '最多可釘選 3 個議題並公開顯示在議題頁面頂端',
    'Up to 3 issues can be pinned and they will appear at the top of the issues page': '最多可釘選 3 個議題並顯示在議題頁面頂端',
    'Up to 3 issues can be pinned to the top of the issues page': '最多可將 3 個議題釘選到議題頁面頂端',
    'This will unpin this issue from the top of the issues page': '這會從議題頁面頂端取消釘選此議題',
    'The issue has been pinned.': '議題已釘選。',
    'The issue has been unpinned.': '議題已取消釘選。',
    'Clone issue': '複製議題',
    'Add issue type': '新增議題類型',
    'Change issue type': '變更議題類型',
    'Select issue type': '選擇議題類型',
    'Something went wrong, could not set the issue type. Please reload and try again.':
      '發生錯誤，無法設定議題類型。請重新載入後再試一次。',
    'Open in GitHub Copilot app': '在 GitHub Copilot 應用程式中開啟',

    // 锁定对话
    'Lock conversation on this issue': '鎖定此議題的對話',
    'Unlock conversation on this issue': '解除鎖定此議題的對話',
    'Lock conversation': '鎖定對話',
    'Unlock conversation': '解除鎖定對話',
    "Other users can't add new comments to this issue. You and other members of teams with":
      '其他使用者將無法在此議題新增留言。你和其他擁有此儲存庫',
    'Other users can’t add new comments to this issue. You and other members of teams with':
      '其他使用者將無法在此議題新增留言。你和其他擁有此儲存庫',
    'write access': '寫入權限',
    'to this repository can still leave comments that others can see. You can always unlock this issue again in the future.':
      '的團隊成員仍可發表其他人看得到的留言。你之後隨時可以再次解除鎖定此議題。',
    'Everyone will be able to comment on this issue once more. You can always lock this issue again in the future.':
      '所有人都將能再次在此議題留言。你之後隨時可以再次鎖定此議題。',
    'Failed to lock the conversation': '無法鎖定對話',
    'Failed to unlock the conversation': '無法解除鎖定對話',

    // 转移
    'Transfer issue': '轉移議題',
    'This does not scrub any issue content. Content such as text references to other issues, pull requests, projects and teams will still appear in the description or comments. Labels will be transferred.':
      '轉移不會清除任何議題內容。對其他議題、拉取請求、專案和團隊的文字參考等內容仍會出現在描述或留言中。標籤會一併轉移。',
    'Issue transfer has started. This action might take a while.': '已開始轉移議題。此動作可能需要一些時間。',
    'Issue cannot be transferred to this repository.': '無法將議題轉移到此儲存庫。',
    'Could not initiate issue transfer': '無法開始轉移議題',
    'Some repositories may be excluded.': '部分儲存庫可能未列出。',

    // 转为讨论
    'Convert to discussion': '轉換為討論',
    'Convert issue to a discussion': '將議題轉換為討論',
    'What happens when an issue is converted into a discussion:': '議題轉換為討論後：',
    'Issue will be closed and locked': '議題將會關閉並鎖定',
    'Title, description, and author will be the same as the issue': '標題、描述和作者將與議題相同',
    'All comments and reactions will be the same as the issue': '所有留言和表情回應將與議題相同',
    'Discussions do not have tasklists': '討論沒有工作清單',
    'Discussions do not have assignees': '討論沒有負責人',
    'Discussions cannot be added to projects': '討論無法加入專案',
    'Discussions do not have milestones': '討論沒有里程碑',
    'Category for new discussion': '新討論的類別',
    'I understand, convert this issue': '我瞭解，轉換此議題',
    'This issue has been moved to a discussion': '此議題已移至討論',
    'Go to the discussion': '前往討論',
    'Convert issue failed': '議題轉換失敗',

    // 删除
    'Delete issue': '刪除議題',
    'Delete issue?': '要刪除議題嗎？',
    'Only administrators can delete issues': '只有管理員可以刪除議題',
    'Deletion will remove the issue from search and previous references will point to a placeholder':
      '刪除會將議題從搜尋結果中移除並使原有參考指向預留位置',
    'Could not delete the issue. Please try again.': '無法刪除議題。請再試一次。',
    'The issue was deleted, but the page could not be refreshed. Please reload the page.':
      '議題已刪除，但無法重新整理頁面。請重新載入頁面。',
    'The issue was successfully deleted.': '議題已刪除。',
    'This issue has been deleted.': '此議題已刪除。',

    // 通知设置
    "You're now unsubscribed from this issue.": '你已取消訂閱此議題。',
    "You're now subscribed to this issue.": '你已訂閱此議題。',
    "You're not receiving notifications from this thread.": '你不會收到此討論串的通知。',
    "You're receiving notifications because you're subscribed to this thread.": '你因已訂閱此討論串而收到通知。',
    'Notifications settings': '通知設定',
    'Only receive notifications from this issue when you have participated or have been @mentioned.':
      '僅在你參與或被 @提及時接收此議題的通知。',
    'Receive all notifications from this issue.': '接收此議題的所有通知。',
    'You will only be notified for events selected from the list below. If you participate or are @mentioned you will be subscribed.':
      '你只會收到下方清單中所選事件的通知。你參與或被 @提及時將會自動訂閱。',
    'You will be notified when this issue is closed.': '此議題關閉時會通知你。',
    'You will be notified when this issue is reopened.': '此議題重新開啟時會通知你。',
    'Please select at least one custom event to subscribe to.': '請至少選取一個要訂閱的自訂事件。',
    'Notification preferences saved': '已儲存通知偏好設定',

    // 未找到与加载错误
    'Issue not found': '找不到議題',
    'This issue does not exist or has been deleted.': '此議題不存在或已刪除。',
    "This issue couldn't be loaded here.": '無法在此載入此議題。',
    'This issue couldn’t be loaded here.': '無法在此載入此議題。',
    'Issue metadata reconciliation failed': '議題中繼資料同步失敗',

    // 活动筛选与排序
    'Labels and metadata': '標籤和中繼資料',
    'Filter activity': '篩選活動',
    'At least one type must be shown': '至少須顯示一種類型',
    'No matching activity': '沒有相符的活動',
    'Showing all activity so the linked event is visible.': '已顯示所有活動，以便查看連結指向的事件。',
    'Showing all activity so this comment is visible.': '已顯示所有活動，以便查看此留言。',
    'Use my filters': '使用我的篩選器',
    'Nothing on this issue matches the selected filters.': '此議題中沒有與所選篩選器相符的內容。',
    '(give feedback on the issue timeline, opens in a new tab)': '（提供議題時間軸的意見回饋，在新分頁中開啟）',
    'Activity on this issue will appear here.': '此議題的活動會顯示在這裡。',
    'Comment unavailable. This comment cannot be shown in the activity timeline.': '無法顯示留言。此留言無法在活動時間軸中顯示。',
    'This comment cannot be shown in the activity timeline.': '此留言無法在活動時間軸中顯示。',

    // 反馈
    'Give feedback on Issues': '提供議題的意見回饋',

    // 代理任务与建议
    'Session log is private to its creator': '工作階段記錄僅建立者可見',
    'Agent suggestions': '代理建議',
    'Could not accept suggestions': '無法接受建議',
    'Could not accept all suggestions': '無法接受所有建議',
    'Could not decline suggestions': '無法拒絕建議',
    'Suggestion approved': '已接受建議',
    'Suggestion rejected': '已拒絕建議',
    'Unable to load task chat:': '無法載入任務聊天：',
    'Loading task chat': '正在載入任務聊天',
    'Unable to load task data.': '無法載入任務資料。',
    'Unable to load repository information.': '無法載入儲存庫資訊。',
    'Repository information not available.': '無法取得儲存庫資訊。',
    'No session information available.': '沒有工作階段資訊。',
    // 产品名按用户要求译成中文（product-names.md）：Copilot Chat → Copilot 聊天（与 projects/items.ts 同句一致）
    'Unable to load Copilot Chat. Ensure Copilot is enabled.': '無法載入 Copilot 聊天。請確認已啟用 Copilot。',

    // 附件
    'Collapse artifacts': '摺疊附件',
    'Expand artifacts': '展開附件',
    'Add artifact': '新增附件',
    'Create artifact': '建立附件',
    'Create HTML artifact': '建立 HTML 附件',
    'Create new artifact': '建立新附件',
    'Edit artifact': '編輯附件',
    'Saving artifact': '正在儲存附件',
    'Creating artifact': '正在建立附件',
    'Artifact title': '附件標題',
    'Invalid artifact name': '附件名稱無效',
    'Unable to update artifact': '無法更新附件',
    'Unable to create artifact': '無法建立附件',
    'Artifact updated successfully.': '已更新附件。',
    'Artifact could not be updated. Try again.': '無法更新附件。請再試一次。',
    'Artifact could not be created. Try again.': '無法建立附件。請再試一次。',
    'Use up to 255 characters: letters, numbers, spaces, periods, hyphens, or underscores. Start and end with a letter or number.':
      '最多 255 個字元：字母、數字、空格、句點、連字號或底線。開頭和結尾必須是字母或數字。',
    'HTML source': 'HTML 原始碼',
    'Paste HTML source...': '貼上 HTML 原始碼...',
    'Write markdown...': '撰寫 Markdown...',
    'Unable to reorder artifact. Previous order restored.': '無法調整附件順序。已還原先前的順序。',
    'Link could not be updated. Try again.': '無法更新連結。請再試一次。',
    'Link could not be added. Try again.': '無法新增連結。請再試一次。'
  },
  scoped: {
    // 头部与正文头部（“– with”“No description provided.”等评论通用文字由通用词典处理）
    Header: '標頭',
    'Issue actions': '議題動作',
    'Body input': '內文輸入',
    'Title input': '標題輸入',
    'Parent:': '父議題：',
    'Blocked by:': '受阻於：',
    'Listed in': '列於',
    'Back to': '返回',
    'Linked pull requests': '已連結的拉取請求',
    'Fixed by': '修正於',
    Remaining: '待處理',
    Fixed: '已修正',
    'Pinned by': '釘選者',
    'Unpin comment': '取消釘選留言',
    'View full comment': '查看完整留言',
    'Write with Copilot': '使用 Copilot 撰寫',

    // 正文操作菜单：复制链接、引用回复等与评论菜单相同，由通用词典处理；Block user、Unblock user 由个人资料词典的 static 处理
    // 正文与评论下方反应栏的添加按钮（登录后显示）
    React: '新增表情回應',

    // 评论框下方的贡献须知：Please follow this repository's [contributing guidelines] and [security policy].
    "Please follow this repository's": '請遵守此儲存庫的',
    'Please follow this repository’s': '請遵守此儲存庫的',

    // 关闭 / 状态（头部状态标签：Closed as duplicate of <链接 #12>，吸顶头部为 Duplicate of）
    'Closed as duplicate': '已關閉並標示為重複',
    'Closed as duplicate of': '已關閉並標示為重複於',
    'Close as duplicate': '關閉並標示為重複',
    'Change type': '變更類型',
    'Open in': '開啟方式',
    discussion: '討論',

    // 锁定原因（Spam、Off-topic、Resolved 由通用词典处理）
    'No reason': '無原因',
    'Too heated': '過於激烈',

    // 删除确认
    'This cannot be undone': '此動作無法復原',

    // 通知设置选项
    'Not subscribed': '未訂閱',
    Subscribed: '已訂閱',
    Unsubscribed: '已取消訂閱',
    Custom: '自訂',
    'Custom options': '自訂選項',
    Reopened: '已重新開啟',
    'Customize: Updated': '自訂：已更新',

    // 未找到 / 离开确认（直引号的 Couldn't load 由通用词典处理）
    'Couldn’t load': '無法載入',
    'Are you sure you want to leave? You have unsaved changes.': '確定要離開嗎？你有未儲存的變更。',
    'Something went wrong! Please try again': '發生錯誤！請再試一次',
    // 时间线错误占位的句尾：… Try reloading the page. <a>Contact support</a> if the problem persists.
    // 整句见 timeline.ts 的 inline（译为「若問題持續發生，請聯絡支援團隊。」）；此为整句未命中时的片段
    'if the problem persists.': '（若問題持續發生）。',

    // 活动筛选与排序
    Comments: '留言',
    'Status updates': '狀態更新',
    References: '參考',
    Moderation: '內容審核',
    'No activity': '沒有活動',
    'Comment unavailable': '無法顯示留言',
    'Loading activity': '正在載入活動',
    'Loading comments': '正在載入留言',

    // 反馈评分
    Hate: '討厭',
    Dislike: '不喜歡',
    Neutral: '普通',
    Like: '喜歡',
    Love: '非常喜歡',

    // 代理任务（会话状态：Working、Idle 等由通用词典处理）
    Agent: '代理',
    'Agent session': '代理工作階段',
    'Agent sessions': '代理工作階段',
    'Loading tasks': '正在載入任務',
    'needs input': '需要輸入',
    'Ready for review': '可供審查',
    Done: '已完成',
    Failed: '失敗',
    'Timed out': '已逾時',
    Stopped: '已停止',
    Unknown: '未知',
    'View latest session': '查看最新的工作階段',
    'View session': '查看工作階段',

    // 代理建议
    'Decline all': '全部拒絕',
    'Accept all': '全部接受',
    'Never show this again': '不再顯示',
    'Suggested by': '建議者',
    Applied: '已套用',
    'Duplicate of': '重複於',
    'duplicate of': '重複於',

    // 附件
    Artifacts: '附件',
    'Add link': '新增連結',
    'Edit link': '編輯連結',
    'Saving link': '正在儲存連結',
    'Adding link': '正在新增連結',
    'Unable to update link': '無法更新連結',
    'Unable to add link': '無法新增連結',
    'Link title': '連結標題',

    // 时间线加载更多：<span>12</span><span> remaining <span>items</span></span>（整段由 timeline.ts 的 mergeText 合并翻译为「還有 12 個項目」；
    // 此为整段未命中时的片段，items 由通用词典处理）
    remaining: '剩餘',
    item: '項目'
  },
  regexp: [
    // 标签页标题片段：Issue #123
    [/^Issue #(\d+)$/, '議題 #$1'],
    // 头部：父议题、阻止、子议题进度、跟踪、受理人（原文无标点的译文不加冒号、逗号）
    [/^Parent issue: (.+)$/, '父議題：$1'],
    [/^Blocked by (\d+) issues?$/, '受阻於 $1 個議題'],
    [/^Blocked by issue (.+)$/, (_, title) => joinName(joinName('受議題', title), '阻擋')],
    [/^(\d+) of (\d+) issues? completed$/, '已完成 $1/$2 個議題'],
    [/^Listed in (\d+) issues$/, '列於 $1 個議題'],
    [/^([\w-]+(?:\[bot\])?) is assigned$/, '已指派給 $1'],
    // 视图内议题导航的读屏位置（可见文字为 (3/12)）：与通用词典「N 筆中的第 X 至 Y 筆」同一句式
    [/^Issue (\d+) of (\d+)$/, '$2 個議題中的第 $1 個'],
    [/^Alert: #(\d+)$/, '警示：#$1'],
    [/^Alert: (.+)$/, '警示：$1'],
    [/^View pull request #(\d+)$/, '查看拉取請求 #$1'],
    [/^Agents assigned by ([\w-]+(?:\[bot\])?)$/, '由 $1 指派的代理'],
    // 头部代理会话摘要（按钮文字与 aria-label）：2 sessions needs input, 1 failed
    [
      new RegExp(`^(Agent sessions: )?(\\d+) sessions? (${SESSION_GROUP_SOURCE})(?:, (\\d+) (${SESSION_GROUP_SOURCE}|others?))?$`),
      (_, prefix, count, group, restCount, restName) =>
        `${prefix ? '代理工作階段：' : ''}${count} 個工作階段${sessionGroup(group)}${sessionRest(restCount, restName)}`
    ],
    // 关闭 / 状态
    [/^Close as duplicate of #(\d+)$/, '關閉並標示為 #$1 的重複項目'],
    [/^Issue closed as a duplicate of #(\d+)$/, '議題已關閉並標示為 #$1 的重複項目'],
    // 评论框状态按钮：Mark as Done、Mark as Duplicate of #12 with comment（状态名两侧不加引号；带留言时按「留言並…」语序）
    [
      /^Mark as (.+?)(?: of #(\d+))?( with comment)?$/,
      (_, status, number, comment) => `${comment ? '留言並' : ''}${number ? `標示為 #${number} 的重複項目` : withStatus('標示為', status)}`
    ],
    [
      /^Status set to (.+?)(?: of #(\d+))?$/,
      (_, status, number) => (number ? `狀態已設為 #${number} 的重複項目` : withStatus('狀態已設為', status))
    ],
    [/^Could not set the status to (.+)$/, (_, status) => withStatus('無法將狀態設為', status)],
    // 头部状态按钮：Status: Open（列表项图标的“Status: … .”带句号，由 list.ts 处理）
    [/^Status: ([^.]+)$/, (_, status) => `狀態：${statusName(status)}`],
    // 固定上限
    [/^(\d+)\/(\d+) issues already pinned\. Unpin an issue to pin this one\.$/, '已釘選 $1/$2 個議題。請先取消釘選一個議題。'],
    // 正文：清单项转议题
    [/^Create an issue with the title "(.+)"$/, '建立標題為「$1」的議題'],
    // 正文头部：Copilot 等非用户名作者的头像链接（@octocat's profile 与阻止、取消阻止 @用户由通用词典处理）
    [/^([\w-]+(?:\[bot\])?)'s profile$/, '$1 的個人檔案'],
    // 仪表板侧边面板加载失败时的后备链接
    [/^Open issue #(\d+)$/, '開啟議題 #$1'],
    // 活动排序按钮
    [
      /^Sort (comments|activity): (Oldest|Newest)$/,
      (_, subject, order) => `${SORT_SUBJECT[subject] ?? subject}排序：${order === 'Oldest' ? '最舊' : '最新'}`
    ],
    // 代理建议
    [/^(High|Medium|Low) confidence$/, (_, level) => `${CONFIDENCE[level] ?? level}信賴度`],
    [/^(\d+) suggestions approved$/, '已接受 $1 項建議'],
    [/^(\d+) suggestions rejected$/, '已拒絕 $1 項建議'],
    [
      /^Pending label suggestions: (.+?)(?:\. (High|Medium|Low) confidence)?\. View details$/,
      (_, labels, level) => `待處理的標籤建議：${labels}${confidenceText(level)}。查看詳細資料`
    ],
    [
      /^Pending (.+?) suggestion(?:: (.+?))?(?:\. (High|Medium|Low) confidence)?\. View details$/,
      (_, field, value, level) => `${pendingSuggestion(field)}${value ? `：${value}` : ''}${confidenceText(level)}。查看詳細資料`
    ],
    [
      /^Applied ([\w -]+?): (.+?)(\. View rationale)?$/,
      (_, field, value, rationale) => `${joinCjk('已套用', suggestionField(field))}：${value}${rationale ? '。查看理由' : ''}`
    ],
    [/^duplicate of ([\w.-]+\/[\w.-]+#\d+)$/, '重複於 $1'],
    // 附件
    [/^Edit artifact: (.+)$/, '編輯附件：$1'],
    [/^More actions for (.+)$/, '$1 的更多動作']
  ]
} satisfies PageDictionary
