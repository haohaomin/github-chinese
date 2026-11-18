import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, MONTH_SOURCE, RELATIVE_SOURCE, translateDate, translateTime } from '../helpers'
import { FIELD_NAMES, pangu, translateFieldName } from './fields'

/**
 * 项目（新版 Projects）：项。
 * 添加项（omnibar、批量添加）、项菜单与确认框、侧边面板、草稿转议题、项状态、
 * 状态更新、存档项页、批量更新 / 导入提示、子议题、代理任务、日期选择器、反馈对话框。
 */

const ITEM_STATES: Readonly<Record<string, string>> = {
  open: '開放中',
  closed: '已關閉',
  merged: '已合併',
  draft: '草稿',
  queued: '已排入佇列'
}

/** 项状态图标的 aria-label */
const STATE_LABELS: Readonly<Record<string, string>> = {
  'Open issue': '開放中的議題',
  'Closed as completed issue': '已關閉並標示為完成的議題',
  'Closed as not planned issue': '已關閉並標示為不予處理的議題',
  'Closed as duplicate issue': '已關閉並標示為重複的議題',
  'Redacted issue': '已遮蔽的議題',
  'Open pull request': '開放中的拉取請求',
  'Closed pull request': '已關閉的拉取請求',
  'Merged pull request': '已合併的拉取請求',
  'Queued pull request': '已排入佇列的拉取請求',
  'Draft pull request': '草稿拉取請求'
}

/** scoped 展开的项状态：Closed as not planned issue 由 common-ui/status.ts 的全局词条翻译，不收 scoped 副本 */
const SCOPED_STATE_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(STATE_LABELS).filter(([label]) => label !== 'Closed as not planned issue')
)

/** 无后缀距离：about 2 months → 約 2 個月；less than a minute → 不到 1 分鐘 */
const DISTANCE_UNITS: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分鐘',
  hour: '小時',
  day: '天',
  week: '週',
  month: '個月',
  year: '年'
}

const DISTANCE_PREFIXES: Readonly<Record<string, string>> = {
  about: '約',
  almost: '將近',
  over: '超過',
  'less than': '不到'
}

/** 距离片段（不含捕获组） */
export const DISTANCE_SOURCE = '(?:(?:about|almost|over|less than) )?(?:\\d+|an?) (?:second|minute|hour|day|week|month|year)s?'

export function translateDistance(text: string): string {
  const match = /^(?:(about|almost|over|less than) )?(\d+|an?) (second|minute|hour|day|week|month|year)s?$/.exec(text)
  if (!match) return text
  const [, prefix, amount = '', unit = ''] = match
  const count = /^\d+$/.test(amount) ? amount : '1'
  const distance = `${count} ${DISTANCE_UNITS[unit] ?? unit}`
  return prefix ? joinCjk(DISTANCE_PREFIXES[prefix] ?? '', distance) : distance
}

const WEEKDAYS_LONG: Readonly<Record<string, string>> = {
  Monday: '星期一',
  Tuesday: '星期二',
  Wednesday: '星期三',
  Thursday: '星期四',
  Friday: '星期五',
  Saturday: '星期六',
  Sunday: '星期日'
}

const DAY_NOTES: Readonly<Record<string, string>> = {
  Today: '今天',
  'Start of selected range': '選取範圍起點',
  'End of selected range': '選取範圍終點',
  'Inside selected range': '在選取範圍內',
  'Minimum allowed date': '允許的最早日期',
  'Maximum allowed date': '允許的最晚日期'
}

const DAY_NOTE_SOURCE = Object.keys(DAY_NOTES).join('|')

function translateDayNotes(notes: string): string {
  return notes.replace(/ \(([^)]+)\)/g, (_, note: string) => `（${DAY_NOTES[note] ?? note}）`)
}

const CONTENT_NOUNS: Readonly<Record<string, string>> = {
  'an issue type': '議題類型',
  'an issue field': '議題欄位',
  'issue fields': '議題欄位',
  'issue field': '議題欄位',
  type: '類型'
}

function contentNoun(noun: string): string {
  return CONTENT_NOUNS[noun] ?? translateFieldName(noun)
}

/** 复数字段名：Milestones → 里程碑；Labels → 標籤 */
function pluralFieldName(name: string): string {
  const exact = translateFieldName(name)
  if (exact !== name) return exact
  const single = name.replace(/s$/, '')
  const singular = translateFieldName(single)
  return singular !== single ? singular : name
}

/** “this item” / “3 items” / “these 3 items” → 此項目 / 這 3 個項目 */
function itemPhrase(phrase: string): string {
  const count = /\d[\d,]*/.exec(phrase)?.[0]
  return count ? `這 ${count} 個項目` : '此項目'
}

/** 状态更新的状态选项（同时用于代理任务的 Complete） */
const STATUS_OPTIONS: Readonly<Record<string, string>> = {
  'On track': '進度正常',
  'At risk': '有風險',
  'Off track': '偏離計畫',
  Inactive: '閒置',
  Complete: '已完成'
}

/** 字段类型名（不可清空单元格的提示“X cannot be deleted”），字段名之外的部分 */
const COLUMN_TYPE_TEXT: Readonly<Record<string, string>> = {
  'Single select': '單選',
  'Multi select': '多選',
  Number: '數字',
  Date: '日期',
  Text: '文字',
  'Created at': '建立時間',
  'Updated at': '更新時間',
  'Closed at': '關閉時間'
}

const COLUMN_TYPE_SOURCE = [...Object.keys(COLUMN_TYPE_TEXT), ...Object.keys(FIELD_NAMES)]
  .sort((a, b) => b.length - a.length)
  .map(name => name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
  .join('|')

export default {
  static: {
    // 添加项
    'Search or add items': '搜尋或新增項目',
    'Start typing to create an item, or type # to select a repository': '輸入內容以建立項目，或輸入 # 選擇儲存庫',
    'Start typing to create an item, or type hashtag to select a repository': '輸入內容以建立項目，或輸入井字號選擇儲存庫',
    'Create new item or add existing item': '建立新項目或加入現有項目',
    'Add item from repository': '從儲存庫新增項目',
    'Add your first item': '新增第一個項目',
    'Add more items': '新增更多項目',
    'Click "Add Item" to get started or use the shortcut': '按一下「新增項目」或使用快速鍵開始',
    'Add items to project': '將項目加入專案',
    'Pick a repository to add issues and pull requests from': '選擇要從中新增議題和拉取請求的儲存庫',
    'This repository is either empty or all items were already added to this project.': '此儲存庫為空或所有項目都已加入此專案。',
    'The new item has been added to the bottom of the column.': '新項目已新增到欄底部。',
    'The new item has been added to the bottom of the roadmap.': '新項目已新增到藍圖底部。',
    'The new item has been added to the bottom of the table.': '新項目已新增到表格底部。',
    "The new item is hidden by this view's filters.": '此檢視的篩選器隱藏了新項目。',
    'Add selected items': '新增選取的項目',
    'Adding item...': '正在新增項目...',
    'Adding items...': '正在新增項目...',
    'No items to add': '沒有可新增的項目',
    'Select all items': '選取所有項目',
    'Deselect all items': '取消選取所有項目',

    // 项菜单与确认框
    'Archive all items?': '封存所有項目？',
    'Remove all items?': '移除所有項目？',
    'Move items to…': '將項目移到…',
    'Cannot add items when grouped by milestone': '依里程碑分組時無法新增項目',
    'Cannot add items when grouped by repository': '依儲存庫分組時無法新增項目',
    'Cannot add items when grouped by type': '依類型分組時無法新增項目',
    // write access → 寫入權限；原文没有逗号，改语序代替
    "You can't edit this item because it belongs to a repository that you don't have write-access to.":
      '需要此項目所屬儲存庫的寫入權限才能編輯。',
    'Convert this draft to an issue to add an assignee': '將此草稿轉換為議題後才能新增負責人',
    'Content already exists in this group': '此群組中已有此內容',
    'Convert to issue to edit this cell': '轉換為議題後才能編輯此儲存格',
    'Convert this draft to an issue to add it to this repository': '將此草稿轉換為議題後才能加入此儲存庫',
    'Drafts can’t be added to milestones. Convert this draft to an issue to add it to a milestone.':
      '草稿無法加入里程碑。將此草稿轉換為議題後才能加入里程碑。',
    'Redacted item': '已遮蔽的項目',
    'We are having trouble connecting to your project. Please try again or reload the page.':
      '連線到專案時發生問題。請再試一次或重新載入頁面。',
    'Labels can only be copied within the same repository': '標籤只能在同一個儲存庫內複製',
    'Assignees can only be copied within the same repository': '負責人只能在同一個儲存庫內複製',
    'Milestones can only be copied within the same repository': '里程碑只能在同一個儲存庫內複製',
    'Issue types can only be copied within the same repository': '議題類型只能在同一個儲存庫內複製',
    'Cannot paste data of different types': '無法貼上不同類型的資料',
    'Cannot paste: value does not match any allowed option': '無法貼上：值與任何允許的選項都不相符',
    "You can't edit this field because this repository is archived": '無法編輯已封存儲存庫中的欄位',
    "We couldn't find any items matching that search query.": '找不到與該搜尋查詢相符的項目。',
    'Could not copy items. Please check the page permissions and try again.': '無法複製項目。請檢查頁面權限後再試一次。',

    // 侧边面板
    'Pull requests are not currently supported in the side panel.': '側邊面板目前不支援拉取請求。',
    "The item is not in the project, or you don't have access to view it.": '此項目不在專案中，或你沒有查看權限。',
    'Copy project item permalink': '複製專案項目的永久連結',
    'File uploads have been disabled for draft issues in this organization.': '此組織已停用草稿議題的檔案上傳。',
    'The issue was deleted, but the project may be out of date. Reload the page to try again.':
      '議題已刪除，但專案可能尚未更新。請重新載入頁面後再試一次。',
    'Archive in project': '在專案中封存',

    // 子议题
    'Manage missing sub-issues': '管理缺少的子議題',
    'Sub-issues will be automatically added to your project. Prefer to disable this? Click the button below to turn off the workflow.':
      '子議題會自動加入專案。要停用嗎？按一下下方按鈕關閉此工作流程。',
    'Adding this issue to the project will change its parent, because the current view is filtered or grouped by a parent issue. Are you sure you want to change the parent of this issue?':
      '目前檢視是依父議題篩選或分組，將此議題加入專案會變更其父議題。確定要變更此議題的父議題嗎？',
    // 分组名（No Parent issue、No milestone、No type）原文没有引号，译文也不加
    'PRs and Drafts can’t be added as sub-issues. Item was added to No Parent issue group':
      'PR 和草稿無法新增為子議題。項目已加入無父議題群組',
    'PRs and draft issues are not supported by sub-issues': '子議題不支援 PR 和草稿議題',
    'Drafts can’t be added with a milestone. Item was added to No milestone group': '草稿無法設定里程碑。項目已加入無里程碑群組',
    'Drafts can’t be added with an issue type. Item was added to No type group': '草稿無法設定議題類型。項目已加入無類型群組',

    // 状态更新
    'Add a project status update': '新增專案狀態更新',
    "Status updates are brief reports tracking your project's health and progress. Begin by adding an update.":
      '狀態更新是追蹤專案健康狀況和進度的簡短報告。新增一則更新以開始使用。',
    'Add status update': '新增狀態更新',
    'Delete status update': '刪除狀態更新',
    "Are you sure you'd like to delete this status update?": '確定要刪除此狀態更新嗎？',
    'Subscribe to status updates for this project': '訂閱此專案的狀態更新',
    'Unsubscribe from status updates for this project': '取消訂閱此專案的狀態更新',
    'Subscribing to status updates': '正在訂閱狀態更新',
    'Unsubscribing from status updates': '正在取消訂閱狀態更新',
    'Status update options': '狀態更新選項',

    // 存档项
    "There aren't any archived items": '沒有已封存的項目',
    "Archive items from a project view and they'll be shown here.": '在專案檢視中封存的項目會顯示在這裡。',
    'Filter for "issues" or "pull requests", or items that are "open", "closed", "merged", or "draft"':
      '篩選「issues」或「pull requests」，或狀態為「open」、「closed」、「merged」或「draft」的項目',
    'Removing items from project...': '正在從專案移除項目...',
    'Restoring items in project...': '正在還原專案中的項目...',
    'Are you sure you want to remove all items matching this query?': '確定要移除與此查詢相符的所有項目嗎？',

    // 批量更新 / 复制 / 导入
    'An error occurred while copying draft issues.': '複製草稿議題時發生錯誤。',
    'Draft issues copied successfully.': '已成功複製草稿議題。',
    'Copying draft issues to your new project. This may take a minute to complete.': '正在將草稿議題複製到新專案。可能需要一分鐘才能完成。',
    'No items were added to this project.': '沒有任何項目加入此專案。',

    // 单元格校验与错误提示
    'This field must be a number': '此欄位必須為數字',
    'This field must be a date': '此欄位必須為日期',
    'This floating point value is too precise': '此浮點數值的精確度過高',
    'Unable to refresh project data': '無法重新整理專案資料',
    'Copying is not supported in this browser': '此瀏覽器不支援複製'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Discovery menu': '探索選單',
    'No repositories found matching your search query.': '找不到與搜尋查詢相符的儲存庫。',
    'Issue types are excluded from this repository.': '此儲存庫已排除議題類型。',
    'Pin side panel': '釘選側邊面板',
    'Unpin side panel': '取消釘選側邊面板',
    'Side panel controls': '側邊面板控制項',
    'Remove session from issue': '從議題移除工作階段',
    'Session removed from issue': '已從議題移除工作階段',
    'This may take some time. This dialog will close when the job is complete.': '這可能需要一些時間。作業完成後此對話方塊會關閉。',
    ...SCOPED_STATE_LABELS,
    // 添加项：侧边面板空状态的拆分句（Create a <a>repository</a> to get started.）整句由下方 inline 规则译出；
    // omnibar 的 You can use <kbd>…</kbd> to add an item 是 kbd 句子（快捷键文字随平台变化），按片段翻译
    'You can use': '使用',
    'to add an item': '新增項目',
    'Create new issue': '建立新議題',
    'Create a draft': '建立草稿',
    'OK, dismiss': '好，關閉',
    'Open item': '開啟項目',
    'Jump to bottom': '跳至底部',
    'Add items from': '從以下儲存庫新增項目',
    'Add items': '新增項目',
    // Select a repository、Select repository 由 common-ui 的全局词条翻译，不收 scoped 副本
    'Search ⏎': '搜尋 ⏎',
    'Create a': '建立',
    repository: '儲存庫',
    'to get started.': '以開始使用。',
    // 项菜单与确认框
    'Update permissions': '更新權限',
    'Edit title': '編輯標題',
    'Unable to transfer pull request': '無法轉移拉取請求',
    'Pull requests cannot be moved between repositories.': '拉取請求無法在儲存庫之間移動。',
    'Transfer issue': '轉移議題',
    // 拖入里程碑 / 议题类型分组的提示：整句由下方 inline 规则译出，不构成行内句时按以下片段翻译
    'New milestone required': '需要新里程碑',
    'Please create the': '請先建立',
    'milestone in the': '里程碑於',
    'repository before adding to this milestone group.': '儲存庫中再加入此里程碑群組。',
    'There is no': '不存在',
    'issue type in the': '議題類型於',
    'organization.': '組織中。',
    'You can transfer this issue to a different repository from the': '可從以下頁面將此議題轉移到其他儲存庫',
    'issue page': '議題頁面',
    'Sorry, something went wrong': '抱歉，發生錯誤',
    'Rate limit exceeded. Please try again later.': '已超過速率限制。請稍後再試。',
    'This form has errors': '此表單有錯誤',
    'Unknown item': '未知項目',
    'Agent task': '代理任務',
    'No valid updates to apply': '沒有可套用的有效更新',
    "You don't have permission to edit this field.": '你沒有編輯此欄位的權限。',
    'Untitled project': '未命名專案',
    "Item can't be moved": '無法移動項目',
    "Parent issue can't be updated": '無法更新父議題',
    'Nothing to show': '沒有可顯示的內容',
    'No milestones to show.': '沒有可顯示的里程碑。',
    'No types to show.': '沒有可顯示的類型。',
    'Search milestones': '搜尋里程碑',
    'Search types': '搜尋類型',
    'Search labels': '搜尋標籤',
    'Search people': '搜尋人員',
    'Open milestone': '開放中的里程碑',
    'Closed milestone': '已關閉的里程碑',
    'Archived repository': '已封存的儲存庫',
    'Forked repository': '分叉的儲存庫',
    Archived: '已封存',
    'This value is too long': '此值過長',
    'You cannot delete this': '無法刪除',
    Selected: '已選取',
    'No matches': '沒有相符項目',
    Archive: '封存',
    Remove: '移除',
    Move: '移動',
    Export: '匯出',
    'Changes saved': '已儲存變更',
    'Copy link': '複製連結',
    'Copied!': '已複製！',
    Issue: '議題',
    'Pull request': '拉取請求',
    'Are you sure?': '確定嗎？',
    // 侧边面板
    'Side panel': '側邊面板',
    'Project information': '專案資訊',
    'Agent session': '代理工作階段',
    'Close panel': '關閉面板',
    'Item title': '項目標題',
    'Item status': '項目狀態',
    Properties: '屬性',
    // 侧边面板操作列表的 aria-label（sidebar-actions.tsx 的 <ActionList aria-label="Actions">）。
    // 产品名 Actions 按术语表译「動作」，与此处同译，不冲突
    Actions: '動作',
    Description: '描述',
    opened: '建立於',
    'Loading...': '載入中...',
    Loading: '載入中',
    Comments: '留言',
    Comment: '留言',
    "Jump to 'add comment' input": '跳至「新增留言」輸入框',
    'Add new comment': '新增留言',
    'Comment actions': '留言動作',
    'Edit comment': '編輯留言',
    'Update comment': '更新留言',
    '(edited)': '（已編輯）',
    'update issue state options menu': '更新議題狀態選項選單',
    Reactions: '表情回應',
    'All reactions': '所有表情回應',
    'No description provided': '未提供描述',
    'None yet': '尚無',
    'Close issue': '關閉議題',
    Reopen: '重新開啟',
    'Close with comment': '留言並關閉',
    'Reopen and comment': '重新開啟並留言',
    'Reopen issue': '重新開啟議題',
    'Close as completed': '關閉並標示為完成',
    'Done, closed, fixed, resolved': '已完成、已關閉、已修正、已解決',
    'Close as not planned': '關閉並標示為不予處理',
    'Won’t fix, can’t repro, duplicate, stale': '不予修正、無法重現、重複、過時',
    'Reload project': '重新載入專案',
    'The issue could not be deleted. It has been restored.': '無法刪除議題。議題已還原。',
    'Unable to load task chat:': '無法載入任務聊天：',
    'Loading task chat': '正在載入任務聊天',
    'Unable to load task data.': '無法載入任務資料。',
    'No session information available.': '沒有工作階段資訊。',
    'Session options': '工作階段選項',
    // 产品名按用户要求译成中文（product-names.md）：Copilot Chat → Copilot 聊天
    'Unable to load Copilot Chat. Ensure Copilot is enabled.': '無法載入 Copilot 聊天。請確認已啟用 Copilot。',
    'Agent tasks': '代理任務',
    Failed: '失敗',
    Cancelled: '已取消',
    Waiting: '等待中',
    Agent: '代理',
    // 子议题
    'Add all to project': '全部加入專案',
    'Add sub-issue': '新增子議題',
    'Failed to load data': '無法載入資料',
    'Disable workflow': '停用工作流程',
    'Change parent issue': '變更父議題',
    'No due date': '無截止日期',
    // 状态更新
    'Status updates': '狀態更新',
    'Add update': '新增更新',
    'Save update': '儲存更新',
    'Filter statuses': '篩選狀態',
    'Status results': '狀態結果',
    'Select a status': '選擇狀態',
    'Select status': '選擇狀態',
    'Select start date': '選擇開始日期',
    'Select target date': '選擇目標日期',
    'Unable to save. Something went wrong.': '無法儲存。發生錯誤。',
    'Unable to save:': '無法儲存：',
    'Dismiss flash message': '關閉提示訊息',
    ...STATUS_OPTIONS,
    Unsubscribe: '取消訂閱',
    // 评论头部的 Spammy 徽章由 common-ui 的全局词条翻译，不收 scoped 副本
    updated: '更新於',
    // 存档项
    'Archived items': '已封存的項目',
    'Issues only': '僅限議題',
    'Pull Requests only': '僅限拉取請求',
    'Items with open state': '狀態為開放中的項目',
    'Items with closed state': '狀態為已關閉的項目',
    'Items with merged state': '狀態為已合併的項目',
    'Items with draft state': '狀態為草稿的項目',
    'Fields without values': '沒有值的欄位',
    'Items without an assignee': '沒有負責人的項目',
    'Toggle select all items': '切換全選',
    'Restore unavailable': '無法還原',
    'Restoring items...': '正在還原項目...',
    'Deleting items...': '正在刪除項目...',
    'No archived items': '沒有已封存的項目',
    'No results matched your filter': '沒有與篩選器相符的結果',
    'Open item actions': '開啟項目動作',
    Restore: '還原',
    archived: '封存於',
    restored: '還原於',
    by: '由',
    // 批量更新 / 导入
    'Bulk update pending': '批次更新等待中',
    'Importing items…': '正在匯入項目…',
    'Configure workflow': '設定工作流程',
    // 日期选择器
    'Open date picker': '開啟日期選擇器',
    'Selected date': '選取的日期',
    'Date Picker': '日期選擇器',
    'Go to month': '前往月份',
    'Go to year': '前往年份',
    'Go to previous month': '前往上個月',
    'Go to next month': '前往下個月',
    'Clear selected date': '清除選取的日期',
    "Go to today's date": '前往今天',
    'Apply selection and close': '套用並關閉',
    'Choose Date...': '選擇日期...',
    'Choose Date': '選擇日期',
    'Save Changes?': '儲存變更？',
    'You have unsaved changes, would you like to save them?': '你有未儲存的變更，要儲存嗎？',
    'Invalid configuration': '設定無效',
    'Invalid date': '日期無效',
    'Invalid selection': '選取無效',
    'Must not fall on a weekend': '不得為週末',
    // 原文 like 前没有逗号，译文改语序不加（与 commits/date-picker.ts 同译）
    'Use arrow keys to select a date, or type a date like "Dec 28, 2020" or "12/28/2020".':
      '使用方向鍵選取日期，或輸入「Dec 28, 2020」或「12/28/2020」格式的日期。',
    'Type a date, like "Dec 28, 2020" or "12/28/2020".': '輸入日期，例如「Dec 28, 2020」或「12/28/2020」。',
    'Select a date from the grid.': '從日曆中選取日期。',
    'Select a start date from the grid.': '從日曆中選取開始日期。',
    'Select an end date from the grid.': '從日曆中選取結束日期。',
    '(Today)': '（今天）',
    '(Start of selected range)': '（選取範圍起點）',
    '(End of selected range)': '（選取範圍終點）',
    '(Inside selected range)': '（在選取範圍內）',
    '(Minimum allowed date)': '（允許的最早日期）',
    '(Maximum allowed date)': '（允許的最晚日期）',
    Jan: '1 月',
    Feb: '2 月',
    Mar: '3 月',
    Apr: '4 月',
    May: '5 月',
    Jun: '6 月',
    Jul: '7 月',
    Aug: '8 月',
    Sep: '9 月',
    Oct: '10 月',
    Nov: '11 月',
    Dec: '12 月',
    // 反馈对话框与错误页（与 common-ui/actions.ts 的反馈对话框、issues/viewer.ts 的评分同译）
    'Tell us what you liked or what could be better': '告訴我們你喜歡的地方或可改進之處',
    Rating: '評分',
    Message: '訊息',
    Send: '傳送',
    'Privacy Policy': '隱私權政策',
    Hate: '討厭',
    Dislike: '不喜歡',
    Neutral: '普通',
    Like: '喜歡',
    Love: '非常喜歡',
    'Copy logs to add in feedback': '複製記錄以附加到意見回饋',
    'Copy logs': '複製記錄',
    'Failed to copy logs.': '無法複製記錄。',
    "Please don't include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our":
      '請勿包含敏感、機密或個人資料。你的意見回饋將用於改善我們的服務，並遵循我們的',
    'Please select a rating.': '請選擇評分。',
    'An error occurred while submitting your feedback.': '送出意見回饋時發生錯誤。',
    'This project failed to load': '此專案載入失敗',
    'This page failed to load': '此頁面載入失敗',
    'Stale cache warning': '快取過時警告',
    'Failed to fetch data.': '無法擷取資料。',
    'Reload the page': '重新載入頁面'
  },
  regexp: [
    // 添加项
    [/^Showing (\d+) most recent items$/, '顯示最近 $1 個項目'],
    [
      /^Showing (\d+) most recent items? that (?:has|have) not been added to this project(\. Use search to narrow down this list\.)?$/,
      (_, count: string, hint?: string) => `顯示最近 ${count} 個未加入此專案的項目${hint ? '。使用搜尋縮小清單範圍。' : ''}`
    ],

    // 确认框
    [
      /^Are you sure you want to archive (this item|[\d,]+ items|these [\d,]+ items)\?$/,
      (_, phrase: string) => `確定要封存${itemPhrase(phrase)}嗎？`
    ],
    [
      /^Are you sure you want to remove (this item|[\d,]+ items|these [\d,]+ items) from (?:the|this) project\?$/,
      (_, phrase: string) => `確定要從專案中移除${itemPhrase(phrase)}嗎？`
    ],
    [/^Archive items?\?$/, '封存項目？'],
    [/^Remove items?\?$/, '移除項目？'],
    // 目标分组名是用户内容，原文没有引号，译文也不加
    [/^Move items to (.+)\?$/, (_, target: string) => `${joinCjk('將項目移到', target)}？`],
    [
      /^Are you sure you want to move (this item|[\d,]+ items) to "(.+)"\?$/,
      (_, phrase: string, target: string) => `確定要將${itemPhrase(phrase)}移到「${target}」嗎？`
    ],
    [/^Cannot add (.+)$/, (_, noun: string) => pangu(`無法新增${contentNoun(noun)}`)],
    [/^Pull requests cannot have (.+)$/, (_, noun: string) => pangu(`拉取請求不能有${contentNoun(noun)}`)],
    [/^Convert this draft to an issue to add (.+)$/, (_, noun: string) => pangu(`將此草稿轉換為議題後才能新增${contentNoun(noun)}`)],
    [
      /^(.+) cannot be applied to (pull requests|draft issues)$/,
      (_, field: string, target: string) =>
        pangu(`${pluralFieldName(field)}無法套用於${target === 'pull requests' ? '拉取請求' : '草稿議題'}`)
    ],
    [
      /^More than (\d+) cells are selected\. Deselect some cells to perform bulk edits\.$/,
      '已選取超過 $1 個儲存格。取消選取部分儲存格後才能批次編輯。'
    ],
    [/^Unable to assign the following users to the converted issue: (.+)$/, '無法將下列使用者指派給轉換後的議題：$1'],
    [/^This value must be between (-?\d+) and (-?\d+)$/, '此值必須介於 $1 和 $2 之間'],
    [
      new RegExp(`^(${COLUMN_TYPE_SOURCE}) cannot be deleted$`),
      (_, name: string) => `${COLUMN_TYPE_TEXT[name] ?? translateFieldName(name)}無法刪除`
    ],
    [/^Invalid `(.+)`: (.+)\. (.+) are acceptable values for `(.+)`$/, '`$1` 無效：$2。`$4` 的可接受值為 $3'],
    [/^@(.+)'s untitled project$/, '@$1 的未命名專案'],
    [/^(\d+) results?\.$/, '$1 項結果。'],
    [/^(\d+) reviewers?$/, '$1 位審查者'],
    [/^(\d+)% of (\d+)$/, '$2 項中的 $1%'],
    [/^(\d+) of (\d+) completed$/, '已完成 $1/$2'],
    [/^(\d+)% completed$/, '已完成 $1%'],
    [
      /^(.+), status: (\w+)( pull request)?(?:\. sub-issue of (.+)\. Level (\d+))?$/,
      (_, title: string, state: string, pr?: string, parent?: string, level?: string) => {
        const status = `狀態：${ITEM_STATES[state.toLowerCase()] ?? state}${pr ? '的拉取請求' : ''}`
        return parent ? `${title}，${status}。${parent} 的子議題。第 ${level} 層` : `${title}，${status}`
      }
    ],
    [new RegExp(`^(${Object.keys(STATE_LABELS).join('|')}), blocked$`), (_, label: string) => `${STATE_LABELS[label] ?? label}，受阻擋`],

    // 子议题
    [/^(\d+) sub-issues? not in this project$/, '$1 個子議題不在此專案中'],
    [/^Sub-issues progress: (\d+) of (\d+) \((\d+)%\)$/, '子議題進度：$1/$2 ($3%)'],
    // 议题标题是用户内容，原文没有引号，译文也不加
    [
      /^Sub-issues progress: (\d+) of (\d+) \((\d+)%\)\. Show sub-issues for: (.+)$/,
      (_, completed: string, total: string, percent: string, title: string) =>
        `子議題進度：${completed}/${total} (${percent}%)。${joinCjk(joinCjk('顯示', title), '的子議題')}`
    ],

    // 里程碑与状态更新
    [new RegExp(`^Past due by (${DISTANCE_SOURCE})$`), (_, distance: string) => joinCjk('已逾期', translateDistance(distance))],
    [new RegExp(`^Due by (${DATE_SOURCE})$`), (_, date: string) => joinCjk('截止於', translateDate(date) ?? date)],
    // 项目头部状态徽章的 aria-label：原文没有引号、逗号，改语序代替标点（查看 2026年1月5日更新為進度正常的最新狀態）
    [
      new RegExp(`^View latest (.+) status updated (${DATE_SOURCE})$`),
      (_, status: string, date: string) =>
        pangu(`${joinCjk(joinCjk('查看', translateDate(date) ?? date), '更新為')}${STATUS_OPTIONS[status] ?? status}的最新狀態`)
    ],
    [
      new RegExp(`^Updated (less than a minute ago|${RELATIVE_SOURCE})$`),
      (_, time: string) => joinCjk('更新於', time === 'less than a minute ago' ? '不到 1 分鐘前' : translateTime(time))
    ],
    [/^React with (.+) \((\d+) .+ reactions? so far\)$/, '新增 $1 表情回應（已有 $2 個）'],

    // 存档项
    [/^All ([\d,]+\+?) items matching query selected$/, '已選取與查詢相符的全部 $1 個項目'],
    [/^Select all ([\d,]+\+?) items matching this query$/, '選取與此查詢相符的全部 $1 個項目'],
    [/^([\d,]+) items? selected$/, '已選取 $1 個項目'],
    [/^([\d,]+)-([\d,]+) of ([\d,]+\+?) items?$/, '共 $3 個項目中的第 $1-$2 個'],
    [/^([\d,]+) items? matched your filter$/, '$1 個項目與篩選器相符'],
    [/^This will exceed the ([\d,]+) project item limit$/, '這將超過專案 $1 個項目的上限'],
    [/^Items without a '(.+)' value$/, (_, name: string) => `沒有「${translateFieldName(name)}」值的項目`],
    // 存档页查询构建器的筛选建议（Filter for <字段> / Exclude <字段>）：原文没有引号，与 Filter by <字段> 同一写法
    [/^Filter for ([\w-]+(?: [\w-]+){0,3})$/, (_, name: string) => pangu(`依${translateFieldName(name)}篩選`)],
    [/^Exclude ([\w-]+(?: [\w-]+){0,3})$/, (_, name: string) => pangu(`排除${translateFieldName(name)}`)],

    // 批量更新 / 导入（原文没有的逗号不加；导入完成提示里的 – 按破折号译「——」）
    [/^Bulk update in progress (\d+)%$/, '批次更新進行中 $1%'],
    [
      /^Bulk update completed\.(?: (\d+) items? couldn’t be updated and (?:were|was) skipped\.)?$/,
      (_, skipped?: string) => `批次更新已完成。${skipped ? `${skipped} 個項目無法更新並已略過。` : ''}`
    ],
    // 原文没有括号：3 個項目批次更新失敗。
    [
      /^Bulk update failed(?: for (\d+) items)?\. Please refresh the page and try again\.$/,
      (_, count?: string) => `${count ? `${count} 個項目` : ''}批次更新失敗。請重新整理頁面後再試一次。`
    ],
    [/^Error updating items: Cannot update more than (\d+) items at once$/, '更新項目時發生錯誤：一次最多只能更新 $1 個項目'],
    [/^(\d+)% imported; you may leave this page while we work in the background\.$/, '已匯入 $1%；在背景處理期間可以離開此頁面。'],
    [
      /^Import complete\.(?: (\d+) items? failed to import\.)?( Now running setup workflows – this may take a few minutes\.)?( Keep this project up to date by automatically adding new items matching your filters\.)?$/,
      (_, failed?: string, workflows?: string, hint?: string) =>
        `匯入完成。${failed ? `${failed} 個項目匯入失敗。` : ''}${workflows ? '正在執行設定工作流程——可能需要幾分鐘。' : ''}${hint ? '自動新增與篩選器相符的新項目以保持專案最新。' : ''}`
    ],
    [/^Failed to add items from your repository\. (\d+) items? failed to import\.$/, '無法從儲存庫新增項目。$1 個項目匯入失敗。'],

    // 日期选择器与日期
    [/^Week (\d+)$/, '第 $1 週'],
    [/^Must be on or after (.+)$/, (_, date: string) => joinCjk('不得早於', translateDate(date) ?? date)],
    [/^Must be on or before (.+)$/, (_, date: string) => joinCjk('不得晚於', translateDate(date) ?? date)],
    [
      /^(.+) - Open date picker \(currently selected: (.+)\)$/,
      (_, field: string, date: string) => `${translateFieldName(field)} - 開啟日期選擇器（目前選取：${translateDate(date) ?? date}）`
    ],
    [/^(.+) - Choose date\.\.\.$/, (_, field: string) => `${translateFieldName(field)} - 選擇日期...`],
    [
      new RegExp(
        `^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (${MONTH_SOURCE} \\d{1,2})((?: \\((?:${DAY_NOTE_SOURCE})\\))*)$`
      ),
      (_, weekday: string, date: string, notes: string) =>
        `${translateDate(date) ?? date}${WEEKDAYS_LONG[weekday] ?? ''}${translateDayNotes(notes)}`
    ],
    [new RegExp(`^(${DATE_SOURCE})$`), (_, date: string) => translateDate(date) ?? date],
    [/^Please keep your feedback within (\d+) characters or less\.$/, '意見回饋請控制在 $1 個字元以內。']
  ],
  inline: [
    // 拖入里程碑 / 议题类型分组的提示框（get-group-update-validation.tsx，宿主是 AlertDialog 正文 div）：
    // Please create the <code>里程碑</code> milestone in the <a>owner/repo</a> repository before adding to this milestone group.
    // 槽位顺序不能变，改语序：<里程碑> 里程碑需先在 <存储库> 儲存庫中建立（原文没有逗号，译文不加）
    [
      'Please create the {} milestone in the {} repository before adding to this milestone group.',
      '{} 里程碑需先在 {} 儲存庫中建立才能加入此里程碑群組。'
    ],
    // There is no <code>类型</code> issue type in the <a>组织</a> organization.
    ['There is no {} issue type in the {} organization.', '{} 議題類型在 {} 組織中不存在。'],
    // 拖入存储库分组的提示框：<div>You can transfer this issue to a different repository from the&nbsp;<a>issue page</a>.</div>
    ['You can transfer this issue to a different repository from the {}.', '可從{}將此議題轉移到其他儲存庫。'],
    // 添加项建议列表的“Add items from <span>owner/repo</span>”槽位后没有文本节点，译文无法把存储库名移到句中，
    // 仍按 scoped 片段「從以下儲存庫新增項目」翻译
    // 侧边面板没有存储库建议时的空状态（item-suggestions-list.tsx）：<p>Create a <a>repository</a> to get started.</p>
    ['Create a {} to get started.', '建立{}以開始使用。']
  ]
} satisfies PageDictionary
