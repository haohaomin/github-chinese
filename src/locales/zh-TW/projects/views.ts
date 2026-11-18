import type { PageDictionary } from '../../../core/types'
import { joinCjk, MONTH_SOURCE, translateDate } from '../helpers'
import { FIELD_NAMES, FIELD_NAME_SOURCE, pangu, translateFieldName } from './fields'
import { translateOptionName } from './templates'

/**
 * 项目（新版 Projects）：视图。
 * 视图标签页与视图菜单、布局切换、筛选栏（含筛选建议的组合 aria-label）、排序 / 分组 / 切片 / 字段求和、
 * 表格表头菜单、看板列菜单与卡片标签、路线图（日期字段、标记、缩放、日期提示）、用户内容忽略选择器。
 */

/** 星期简称：「周」一律写「週」 */
const WEEKDAYS: Readonly<Record<string, string>> = {
  Mon: '週一',
  Tue: '週二',
  Wed: '週三',
  Thu: '週四',
  Fri: '週五',
  Sat: '週六',
  Sun: '週日'
}

/** 路线图日期片段（不含捕获组）：Mon, Oct 26 或 Fri, Jan 8 2027 */
export const WEEKDAY_DATE_SOURCE = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), ${MONTH_SOURCE} \\d{1,2}(?: \\d{4})?`

/** 路线图日期区间（不含捕获组）：Mon, Oct 26 - Fri, Nov 6 [Iteration 3] */
export const ROADMAP_SPAN_SOURCE = `${WEEKDAY_DATE_SOURCE}(?: - ${WEEKDAY_DATE_SOURCE})?(?: \\[[^\\]]+\\])?`

/** 迭代日期区间（不含捕获组）：Oct 01 - Oct 14、Dec 25, 2026 - Jan 07, 2027 */
export const ITERATION_RANGE_SOURCE = `${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})? - ${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})?`

const WEEKDAY_DATE_RE = new RegExp(`^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (${MONTH_SOURCE}) (\\d{1,2})(?: (\\d{4}))?$`)
const SHORT_DATE_RE = new RegExp(`^${MONTH_SOURCE} \\d{1,2}$`)

/** "Mon, Oct 26" → 10月26日週一；"Fri, Jan 8 2027" → 2027年1月8日週五 */
export function translateWeekdayDate(text: string): string {
  const match = WEEKDAY_DATE_RE.exec(text)
  if (!match) return translateDate(text) ?? text
  const [, weekday = '', month = '', day = '', year] = match
  const date = translateDate(year ? `${month} ${day}, ${year}` : `${month} ${day}`) ?? `${month} ${day}`
  return `${date}${WEEKDAYS[weekday] ?? ''}`
}

/** 方括号内的迭代说明：Iteration 3 start - Iteration 4 end、Iteration 3 start - Oct 14 */
function translateSpanNote(note: string): string {
  return note
    .split(' - ')
    .map(part => {
      if (SHORT_DATE_RE.test(part)) return translateDate(part) ?? part
      const edge = /^(.+) (start|end)$/.exec(part)
      return edge ? `${edge[1]} ${edge[2] === 'start' ? '開始' : '結束'}` : part
    })
    .join(' - ')
}

/** 路线图项提示：Mon, Oct 26 - Fri, Nov 6 [Iteration 3] → 10月26日週一 - 11月6日週五 [Iteration 3] */
export function translateRoadmapSpan(text: string): string {
  const match = /^(.+?)(?: \[([^\]]+)\])?$/.exec(text)
  if (!match) return text
  const [, range = '', note] = match
  const dates = range
    .split(' - ')
    .map(part => translateWeekdayDate(part))
    .join(' - ')
  return note ? `${dates} [${translateSpanNote(note)}]` : dates
}

/** "Oct 01 - Oct 14" → 10月1日 - 10月14日 */
export function translateIterationRange(text: string): string {
  return text
    .split(' - ')
    .map(part => translateDate(part) ?? part)
    .join(' - ')
}

/** 排序优先级：primary / secondary / no. 3 */
function sortRank(rank: string | undefined): string {
  if (!rank) return ''
  if (rank === 'primary') return '主要'
  if (rank === 'secondary') return '次要'
  return rank.replace(/^no\. (\d+)$/, '第 $1 個')
}

/** 排序方向：与 issues/list.ts 的 ascending / descending 同译 */
function sortDirection(direction: string): string {
  return direction === 'ascending' ? '遞增' : '遞減'
}

const ZOOM_LEVELS: Readonly<Record<string, string>> = {
  month: '月',
  quarter: '季',
  year: '年'
}

const DURATION_UNITS: Readonly<Record<string, string>> = {
  day: '天',
  week: '週',
  month: '個月'
}

const MACRO_PREFIXES: Readonly<Record<string, string>> = {
  Current: '目前',
  Next: '下一個',
  Previous: '上一個'
}

const MACRO_OPERATORS: Readonly<Record<string, string>> = {
  'starts with': '開頭為',
  'ends with': '結尾為',
  contains: '包含'
}

/**
 * 迭代宏：Current iteration / Next sprint（字段名小写）。排除同形的通用短语：Next page、Next month 等，
 * 以及项目页上代理会话的 Next step / Previous step、Copilot 的 Next steps、议题查看器的 Next issue
 */
const MACRO_RE = /^(Current|Next|Previous) (?!(?:page|day|week|month|quarter|year|steps?|issue)$)([a-z][\w -]*)$/
/** 通配宏：iteration starts with... */
const WILDCARD_RE = /^([a-z][\w -]*) (starts with|ends with|contains)\.\.\.$/

function translateMacro(which: string, name: string): string {
  return pangu(`${MACRO_PREFIXES[which] ?? which}${translateFieldName(name)}`)
}

function translateWildcard(name: string, operator: string): string {
  return pangu(`${translateFieldName(name)}${MACRO_OPERATORS[operator] ?? operator}...`)
}

/** 字段名之外的内置筛选器名（与 issues/filter.ts 同译） */
const FILTER_KEY_NAMES: Readonly<Record<string, string>> = {
  Has: '有',
  No: '無',
  State: '狀態',
  'Closed reason': '關閉原因',
  Reviews: '審查',
  'Last updated': '上次更新',
  'Blocked by': '受阻於',
  Blocking: '阻擋',
  'Relates to': '相關'
}

/** 筛选建议组合 aria-label 中的筛选器名（不含捕获组），长名在前 */
const FILTER_PROVIDER_SOURCE = [...Object.keys(FIELD_NAMES), ...Object.keys(FILTER_KEY_NAMES)]
  .sort((a, b) => b.length - a.length)
  .map(name => name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
  .join('|')

function filterKeyName(name: string): string {
  return FILTER_KEY_NAMES[name] ?? translateFieldName(name)
}

/** 卡片标签提示中的字段名（不含捕获组）：子议题进度另有规则 */
const CARD_FIELD_SOURCE = Object.keys(FIELD_NAMES)
  .filter(name => name !== 'Sub-issues progress')
  .sort((a, b) => b.length - a.length)
  .map(name => name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
  .join('|')

/** 视图配置中的字段列表（joinOxford，仅含系统 / 模板字段时匹配）：Title, Assignees, and Status */
const FIELD_LIST_SOURCE = `(?:${FIELD_NAME_SOURCE})(?:, (?:${FIELD_NAME_SOURCE}))*,? and (?:${FIELD_NAME_SOURCE})`

/** Title, Assignees, and Status → 標題、負責人和狀態 */
function translateFieldList(list: string): string {
  const names = list.split(/, and |, | and /).map(name => translateFieldName(name))
  const last = names.pop() ?? ''
  return `${names.join('、')}和${last}`
}

const STATIC: Readonly<Record<string, string>> = {
  // 视图标签页与视图菜单
  'New view': '新增檢視',
  'Select view': '選擇檢視',
  'Change view name': '變更檢視名稱',
  'Rename view': '重新命名檢視',
  'View name': '檢視名稱',
  'View name cannot be empty': '檢視名稱不可空白',
  // Duplicate view、Save changes to new view、Delete view 与议题视图共用，由 issues 词典收录
  'Save to current view': '儲存到目前檢視',
  'Delete view?': '要刪除檢視嗎？',
  'Are you sure you want to delete this view?': '確定要刪除此檢視嗎？',
  'Remove deleted view': '移除已刪除的檢視',
  'Move view': '移動檢視',
  'View options...': '檢視選項...',
  'View more options': '查看更多選項',
  'Export view data': '匯出檢視資料',
  'Only rows that have been loaded into this view will be exported.': '只會匯出已載入此檢視的列。',
  'Generate chart': '產生圖表',
  'Show hierarchy': '顯示階層',
  'Show agent sessions': '顯示代理工作階段',
  'Select row height': '選擇列高',
  'Switch layout: Table': '切換版面配置：表格',
  'Switch layout: Board': '切換版面配置：看板',
  'Switch layout: Roadmap': '切換版面配置：藍圖',
  'Switch layout...': '切換版面配置...',
  'Return to project view': '返回專案檢視',
  'This view has been deleted.': '此檢視已刪除。',
  'Save a copy to make changes.': '儲存副本以修改。',
  'Duplicate it to make changes.': '建立副本以修改。',
  'This view no longer exists': '此檢視已不存在',
  'Select another view to use this project.': '選擇其他檢視以使用此專案。',

  // 保存视图（原文没有逗号，译文不加）
  'Set as the default for everyone?': '要設為所有人的預設設定嗎？',
  'Publishing this configuration will make it the default for everyone viewing the project.':
    '發布此設定會使其成為所有查看此專案者的預設設定。',
  'Saving these filters will make it the default for everyone in this view.': '儲存這些篩選器會使其成為此檢視中所有人的預設設定。',
  'Saving these display options will make it the default for everyone in this view.':
    '儲存這些顯示選項會使其成為此檢視中所有人的預設設定。',
  'Saving these options will make it the default for everyone in this view.': '儲存這些選項會使其成為此檢視中所有人的預設設定。',

  // 筛选栏（筛选器说明与 issues/filter.ts 同译）
  'Filter by keyword or by field': '依關鍵字或欄位篩選',
  'View filters': '檢視篩選器',
  'The "last-updated" filter is deprecated and will be removed in the future. Please use the new "updated" filter instead.':
    '「last-updated」篩選器已淘汰且日後將移除。請改用新的「updated」篩選器。',
  'Issue items with a linked pull request': '已連結拉取請求的議題項目',
  'Items without a value for the specified field': '指定欄位沒有值的項目',
  'Items reviewed by the user': '該使用者審查過的項目',
  'Filter by item closed reason': '依項目的關閉原因篩選',
  'Date when the item was last updated': '項目上次更新的日期',
  'Filter for items that are blocked by other items': '篩選受其他項目阻擋的項目',
  'Filter for items that are blocking other items': '篩選阻擋其他項目的項目',
  'Filter for items that are related to other items': '篩選與其他項目相關的項目',
  'Filter by sub-issue properties': '依子議題屬性篩選',
  'Filter by item state or object type': '依項目狀態或物件類型篩選',
  "Filter by item's state reason": '依項目的狀態原因篩選',
  'Filter by item last updated': '依項目上次更新時間篩選',
  "Filter by item's updated date": '依項目的更新日期篩選',
  'Filter by items with a specific metadata value': '篩選具有特定中繼資料值的項目',
  'Filter by items without a specific metadata value': '篩選缺少特定中繼資料值的項目',
  'Filter only "issues", "pulls", "open", "closed", or "draft"': '僅篩選「issues」「pulls」「open」「closed」或「draft」',
  'Look for open, closed, or draft issues': '尋找開放中、已關閉或草稿議題',
  'Look for open / closed items': '尋找開放中/已關閉的項目',

  // 排序 / 分组 / 切片 / 字段求和
  'Select a field to sort by': '選擇排序欄位',
  'Select up to 2 fields': '最多選擇 2 個欄位',
  'No sorting': '不排序',
  'No grouping': '不分組',
  'No slicing': '不切分',
  'Select a field to slice by': '選擇切分欄位',
  'Slice by...': '切分依據...',
  'Column field by...': '分欄欄位...',
  'Field sum': '欄位加總',
  'Marker fields': '標記欄位',
  'Remove sorting': '移除排序',
  'Cannot reorder items between sorted values': '無法在已排序的值之間調整項目順序',
  'Drag and drop is not supported when grouped by a multi-select field': '依多選欄位分組時不支援拖放',
  'Confirm sort order overwrite': '確認覆寫排序順序',
  'You are about to overwrite the currently set sort order. All previous settings will be lost.':
    '你即將覆寫目前設定的排序順序。先前的所有設定都會遺失。',
  'Overwrite sorting': '覆寫排序',
  'Project items group': '專案項目群組',
  'Project iterations list': '專案迭代清單',
  'Slice panel separator': '切分面板分隔線',

  // 表格表头菜单
  'Filter by values…': '依值篩選…',
  'Filter by type or state…': '依類型或狀態篩選…',
  'Group by values': '依值分組',
  'Grouped by field': '已依此欄位分組',
  'Slice by values': '依值切分',
  'Hide field': '隱藏欄位',
  'Field settings…': '欄位設定…',
  'Reordering this item is disabled': '無法調整此項目的順序',

  // 看板（看板的 column 按术语表作「欄」）
  'Add a new column to the board': '在看板中新增欄',
  'New column': '新增欄',
  'Visible columns': '顯示的欄',
  'Hidden columns': '隱藏的欄',
  'Click a value to filter the view': '按一下值以篩選檢視',
  'Copy link in project': '複製專案內連結',
  'Move to column': '移到欄',
  'This is the left-most column': '這是最左邊的欄',
  'This is the right-most column': '這是最右邊的欄',
  'Remove from project': '從專案中移除',
  'Set column limit': '設定欄上限',
  'Edit column limit': '編輯欄上限',
  'Column limit': '欄上限',
  'A limit on the number of items in a column': '一欄中項目數量的上限',
  'Column limit is too large, must be less than 1,000,000.': '欄上限過大，必須小於 1,000,000。',
  'Rename column': '重新命名欄',
  'Column name': '欄名稱',
  'Column name cannot be empty': '欄名稱不可空白',
  'Hide from view': '從檢視中隱藏',
  'Loading data required to properly display view': '正在載入正確顯示檢視所需的資料',
  // Column overview、Loading board 与 There are more columns / rows … 与议题视图共用，由 issues 词典收录

  // 路线图
  'Roadmap options': '藍圖選項',
  'Date fields': '日期欄位',
  'Select date fields': '選擇日期欄位',
  'Scroll to previous date range': '捲動到上一個日期範圍',
  'Scroll to next date range': '捲動到下一個日期範圍',
  'Unable to set date fields': '無法設定日期欄位',
  'Unable to expand date selection': '無法擴大日期選取範圍',
  'Welcome to Roadmap!': '歡迎使用藍圖！',
  'Your project needs at least one date or iteration field to get started.': '專案至少需要一個日期或迭代欄位才能開始使用。',
  'Create a date or iteration field to specify dates': '建立日期或迭代欄位以指定日期',
  'Add item to today': '將項目新增到今天',
  'Drag to resize the table column': '拖曳以調整表格欄寬',
  'Configure vertical markers to display on roadmap': '設定要在藍圖上顯示的垂直標記',
  'Resize the item by dragging the earlier date': '拖曳較早的日期以調整項目長度',
  'Resize the item by dragging the later date': '拖曳較晚的日期以調整項目長度',
  'Skip to start of markers': '跳到標記開頭',
  'Skip to end of markers': '跳到標記結尾',
  'Show date fields': '顯示日期欄位'
}

const SCOPED: Readonly<Record<string, string>> = {
  // 通用文本（仅项目页生效）
  'Save filter': '儲存篩選器',
  'Filter by...': '篩選依據...',
  'Filter by pull request review state': '依拉取請求審查狀態篩選',
  // 筛选栏建议弹层的 aria-label（名词 filter → 篩選器）
  'Filter suggestions': '篩選器建議',
  'Closed reason': '關閉原因',
  'Last updated': '上次更新',
  'Blocked by': '受阻於',
  'Relates to': '相關',
  'Changes requested': '已要求變更',
  '7 or more days ago': '7 天前或更早',
  '14 or more days ago': '14 天前或更早',
  '21 or more days ago': '21 天前或更早',
  'Unbalanced quotation marks': '引號不成對',
  'Unbalanced parentheses': '括號不成對',
  'Invalid filter: Unmatched quotation mark': '篩選器無效：引號不成對',
  // 标点随原文：X 之后的逗号、两句之间的句号、ex: 的冒号
  'Supported format is <@today-X, where X is a number and unit. Unit can be one of d,w or m ex: 7d':
    '支援的格式為 <@today-X，其中 X 為數字加單位。單位可為 d、w 或 m 例如：7d',
  'Supported format is XXdays (except 0days)': '支援的格式為 XXdays（0days 除外）',
  'Signed-in user': '已登入的使用者',
  'Your AI pair programmer': '你的 AI 結對程式設計師',
  '@me, Signed-in user': '@me，已登入的使用者',
  '@copilot, Your AI pair programmer': '@copilot，你的 AI 結對程式設計師',
  'Past 7 days': '過去 7 天',
  'Past 30 days': '過去 30 天',
  'Past year': '過去一年',
  'Less than 10': '少於 10',
  'More than 10': '多於 10',
  'Between 10 and 100': '介於 10 到 100 之間',
  'Group by...': '分組依據...',
  'Sort by...': '排序依據...',
  'Zoom level': '縮放層級',
  'Row height': '列高',
  'Ascending order: oldest to newest': '遞增順序：從舊到新',
  'Descending order: newest to oldest': '遞減順序：從新到舊',
  'Ascending order: lowest to highest': '遞增順序：從低到高',
  'Descending order: highest to lowest': '遞減順序：從高到低',
  'Ascending order: first to last': '遞增順序：從第一個到最後一個',
  'Descending order: last to first': '遞減順序：從最後一個到第一個',
  'Ascending order: A to Z': '遞增順序：A 到 Z',
  'Descending order: Z to A': '遞減順序：Z 到 A',
  'Press enter/space to resize pane with arrow keys. Press escape to exit.': '按 Enter 鍵或空白鍵後使用方向鍵調整窗格大小。按 Esc 鍵離開。',
  'Filter values...': '篩選值...',
  'Filter values': '篩選值',
  'Filter mode': '篩選模式',
  'Hide empty values': '隱藏空白值',
  'Show empty values': '顯示空白值',
  'Select column': '選擇欄',
  'Sort ascending': '遞增排序',
  'Sorted ascending': '已遞增排序',
  'Sort descending': '遞減排序',
  'Sorted descending': '已遞減排序',
  'Row actions': '列動作',
  'Repository suggestions': '儲存庫建議',
  'Loading sub-issues': '正在載入子議題',
  'Load more items': '載入更多項目',
  'Move to top': '移到頂端',
  'Move to bottom': '移到底部',
  'Move to start': '移到開頭',
  'Move to end': '移到結尾',
  'Remove limit': '移除上限',
  'Set limit': '設定上限',
  'Edit details': '編輯詳細資料',
  'Archive all': '全部封存',
  'Remove all': '全部移除',
  'To drag an item: press Enter to grab, arrow keys to move, Enter to drop, or Escape to cancel.':
    '若要拖曳項目：按 Enter 鍵拿起，按方向鍵移動，按 Enter 鍵放下，或按 Esc 鍵取消。',
  // 读屏说明三句随原文分句，与 issues/list.ts 同译
  'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.':
    '若要拿起可拖曳的項目，請按空白鍵。拖曳時，使用方向鍵移動項目。再按一次空白鍵將項目放到新位置，或按 Esc 鍵取消。',
  'No cards': '沒有卡片',
  'Loading cards': '正在載入卡片',
  'Loading columns': '正在載入欄',
  'Loading rows': '正在載入列',
  'More columns': '更多欄',
  'More rows': '更多列',
  'Draggable pane splitter': '可拖曳的窗格分隔線',
  'No start date': '無開始日期',
  'No target date': '無目標日期',
  'No date set': '未設定日期',
  'No sort applied': '未套用排序',
  'Truncate titles': '截斷標題',
  // 读屏文本：右括号在 <time> 之后的独立文本节点里。整句由下方 inline 规则译出（全角括号）；
  // 不构成行内句时按片段翻译，保持半角以免括号不配对
  '(Starting on': '(開始於',
  '(Due on': '(截止於',
  // 布局与视图菜单
  Layout: '版面配置',
  'Layout:': '版面配置：',
  Table: '表格',
  Board: '看板',
  View: '檢視',
  'User settings': '使用者設定',
  Configuration: '設定',
  Swimlanes: '泳道',
  'Swimlanes:': '泳道：',
  'Fields:': '欄位：',
  'Group by': '分組依據',
  'Group by:': '分組依據：',
  'Sort by': '排序依據',
  'Sort by:': '排序依據：',
  'Slice by': '切分依據',
  'Slice by:': '切分依據：',
  'Column by': '分欄依據',
  'Column by:': '分欄依據：',
  'Field sum:': '欄位加總：',
  'Row height:': '列高：',
  'Markers:': '標記：',
  'Marker fields:': '標記欄位：',
  'Dates:': '日期：',
  'Zoom level:': '縮放層級：',
  'Unsort by': '取消排序',
  Markers: '標記',
  Dates: '日期',
  none: '無',
  manual: '手動',
  Count: '計數',
  '(ascending)': '（遞增）',
  '(descending)': '（遞減）',
  Sort: '排序',
  // Filter、Filters、Clear filter 由 common-ui 的全局词条译为「篩選器」「清除篩選器」，不收 scoped 副本
  Discard: '捨棄',
  Reset: '重設',
  Set: '設定',
  'Unsaved changes': '未儲存的變更',
  'Discard changes?': '要捨棄變更嗎？',
  'You have unsaved changes. Are you sure you want to discard them?': '你有未儲存的變更。確定要捨棄嗎？',
  'Keep editing': '繼續編輯',
  'Close and discard': '關閉並捨棄',
  'Are you sure you want to proceed?': '確定要繼續嗎？',
  Has: '有',
  No: '無',
  Me: '我',
  Yesterday: '昨天',
  Include: '包含',
  Exclude: '排除',
  Deselect: '取消選取',
  'matching item': '個相符項目',
  'matching items': '個相符項目',
  // 行高
  Single: '單行',
  Medium: '中等',
  Tall: '較高',
  'Extra tall': '特高',
  // 筛选建议（审查状态：Pending 指未送出的审查，Dismissed 指已驳回的审查）
  State: '狀態',
  Blocking: '阻擋',
  'Not planned': '不予處理',
  Duplicate: '重複',
  Reopened: '已重新開啟',
  Merged: '已合併',
  Queued: '已排入佇列',
  'Pull Request': '拉取請求',
  Pending: '待處理',
  Approved: '已核准',
  Commented: '已留言',
  Dismissed: '已駁回',
  Reviews: '審查',
  // 看板（分组按术语表 group → 「群組」）
  Column: '欄',
  Group: '群組',
  Items: '項目',
  Position: '位置',
  'Move left': '左移',
  'Move right': '右移',
  'Move up': '上移',
  'Move down': '下移',
  'Move to': '移到',
  'Move item': '移動項目',
  'Unavailable for iterations': '不適用於迭代',
  'More actions': '更多動作',
  'Convert to issue': '轉換為議題',
  'Open in new tab': '在新分頁中開啟',
  'Draft issue': '草稿議題',
  Draft: '草稿',
  'Access prohibited': '禁止存取',
  'Add item': '新增項目',
  'Dropdown button': '下拉式按鈕',
  'Assignees:': '負責人：',
  // 路线图
  Today: '今天',
  Month: '月',
  Quarter: '季',
  Year: '年',
  Break: '間隔',
  milestones: '個里程碑',
  'Got it!': '我知道了！'
}

/** 筛选建议组合 aria-label 中的值：先查本文件页面词条，再查宏、模板选项名、字段名 */
function filterValueName(value: string): string {
  const scoped = SCOPED[value]
  if (scoped) return scoped
  const macro = MACRO_RE.exec(value)
  if (macro) return translateMacro(macro[1] ?? '', macro[2] ?? '')
  const wildcard = WILDCARD_RE.exec(value)
  if (wildcard) return translateWildcard(wildcard[1] ?? '', wildcard[2] ?? '')
  return translateFieldName(translateOptionName(value))
}

/** 卡片标签提示中的值：日期或模板选项名 */
function cardFieldValue(value: string): string {
  return translateDate(value) ?? translateOptionName(value)
}

export default {
  static: STATIC,
  scoped: SCOPED,
  regexp: [
    // 视图
    // 视图名、列名等用户内容两侧不加引号（原文没有引号），中英文之间由 joinCjk 补空格
    [/^View options for (.+)$/, (_, name: string) => joinCjk(name, '的檢視選項')],
    [/^Save display options for (.+)\?$/, (_, name: string) => `${joinCjk(joinCjk('要儲存', name), '的顯示選項嗎')}？`],
    [/^Save filters for (.+)\?$/, (_, name: string) => `${joinCjk(joinCjk('要儲存', name), '的篩選器嗎')}？`],
    [/^Save filters and display options for (.+)\?$/, (_, name: string) => `${joinCjk(joinCjk('要儲存', name), '的篩選器和顯示選項嗎')}？`],

    // 分组、列与卡片（看板的 column 作「欄」，group 作「群組」）
    [
      /^Actions for (column|group): (.+)$/,
      (_, kind: string, name: string) => joinCjk(joinCjk(kind === 'column' ? '欄' : '群組', name), '的動作')
    ],
    [/^Actions for (.+)$/, (_, name: string) => joinCjk(name, '的動作')],
    [/^(Collapse|Expand) group (.+)$/, (_, action: string, name: string) => joinCjk(action === 'Collapse' ? '摺疊群組' : '展開群組', name)],
    [new RegExp(`^No (${FIELD_NAME_SOURCE})$`), (_, name: string) => `無${translateFieldName(name)}`],
    [/^No ([A-Z][\w-]*(?: [\w-]+)?)$/, (_, name: string) => pangu(`無${name}`)],
    [/^(\d+) cards?$/, '$1 張卡片'],
    [/^More cards in (.+)$/, (_, name: string) => joinCjk(name, '中的更多卡片')],
    [/^Archive (\d+) selected items$/, '封存 $1 個選取的項目'],
    // 表格行菜单（多选）：同一操作在看板卡片菜单里写作 Remove … from project
    [/^Archive (\d+) items$/, '封存 $1 個項目'],
    [/^Remove (\d+) selected items from project$/, '從專案中移除 $1 個選取的項目'],
    [/^Delete (\d+) selected items from project$/, '從專案中刪除 $1 個選取的項目'],
    [/^Add item to (.+)$/, (_, name: string) => joinCjk(joinCjk('在', name), '中新增項目')],
    // 切片面板的筛选状态（原文无标点，译文不加逗号）
    [/^Showing (\d+) of (\d+)$/, '顯示 $2 個中的 $1 個'],
    [/^Linked pull request: #(\d+)$/, '已連結的拉取請求：#$1'],
    [/^Label: (.+)$/, '標籤：$1'],
    [
      new RegExp(`^([^:]+): (.+) \\((${ITERATION_RANGE_SOURCE})\\)$`),
      (_, field: string, title: string, range: string) => `${translateFieldName(field)}：${title}（${translateIterationRange(range)}）`
    ],
    [
      new RegExp(`^(${CARD_FIELD_SOURCE}): (.+)$`),
      (_, field: string, value: string) => `${translateFieldName(field)}：${cardFieldValue(value)}`
    ],

    // 表格表头与视图配置
    [/^(.+) column options$/, (_, name: string) => joinCjk(translateFieldName(name), '欄選項')],
    [
      /^Change (?:(primary|secondary|no\. \d+) )?sort direction to (ascending|descending)$/,
      (_, rank: string | undefined, direction: string) => `將${sortRank(rank)}排序方向變更為${sortDirection(direction)}`
    ],
    [
      /^\((?:(primary|secondary|no\. \d+) )?sort: (ascending|descending)\)$/,
      (_, rank: string | undefined, direction: string) => `（${sortRank(rank)}排序：${sortDirection(direction)}）`
    ],
    [
      /^Sorted by: (.+)$/,
      (_, list: string) =>
        `排序依據：${list
          .split(', ')
          .map(part => {
            const sort = /^(.+) (ascending|descending)$/.exec(part)
            return sort ? pangu(`${translateFieldName(sort[1] ?? '')}${sortDirection(sort[2] ?? '')}`) : part
          })
          .join('，')}`
    ],
    [
      /^Count, (.+) and (\d+) more$/,
      (_, name: string, count: string) => pangu(`計數，${translateFieldName(name)}等 ${Number(count) + 1} 項`)
    ],
    [/^Count, (.+)$/, (_, name: string) => `計數，${translateFieldName(name)}`],
    [new RegExp(`^(${FIELD_LIST_SOURCE})$`), (_, list: string) => translateFieldList(list)],
    // 字段求和只列一个字段名；逗号分隔的名单（反应者：alice, bob and 3 more）不匹配，避免总数算错
    [/^([^,]+) and (\d+) more$/, (_, name: string, count: string) => pangu(`${translateFieldName(name)}等 ${Number(count) + 1} 項`)],

    // 筛选建议
    [MACRO_RE, (_, which: string, name: string) => translateMacro(which, name)],
    [WILDCARD_RE, (_, name: string, operator: string) => translateWildcard(name, operator)],
    [/^Sub-issues – (.+)$/, (_, name: string) => `子議題 – ${translateFieldName(name)}`],
    // 字段名首字母大写；小写的 Filter by user / author 等来自侧边面板的共享选择器，不按字段名处理
    [/^Filter by ([A-Z][\w-]*(?: [\w-]+){0,3})$/, (_, name: string) => pangu(`依${translateFieldName(name)}篩選`)],
    [/^Has ([a-z][\w -]*)$/, (_, name: string) => pangu(`有${translateFieldName(name)}`)],
    [/^(\d+) (days?|weeks?|months?)$/, (_, count: string, unit: string) => `${count} ${DURATION_UNITS[unit.replace(/s$/, '')] ?? unit}`],
    // 筛选建议的组合 aria-label：Has Assignees, Assignees / term*, iteration starts with / Status, Filter / Todo, Status
    [
      /^(Has|No) (.+), \2$/,
      (_, prefix: string, name: string) => `${pangu(`${prefix === 'Has' ? '有' : '無'}${filterKeyName(name)}`)}，${filterKeyName(name)}`
    ],
    [
      /^(\*?term\*?), ([a-z][\w -]*) (starts with|ends with|contains)$/,
      (_, term: string, name: string, operator: string) =>
        `${term}，${pangu(`${translateFieldName(name)}${MACRO_OPERATORS[operator] ?? operator}`)}`
    ],
    [
      /^(.+), Filter(?:, (.+))?$/,
      (_, name: string, description: string) =>
        `${filterKeyName(name)}，篩選器${description ? `，${STATIC[description] ?? SCOPED[description] ?? description}` : ''}`
    ],
    [
      new RegExp(`^(.+), (${FILTER_PROVIDER_SOURCE})$`),
      (_, value: string, provider: string) => `${filterValueName(value)}，${filterKeyName(provider)}`
    ],

    // 路线图
    [/^Zoom level: (month|quarter|year)\.$/, (_, level: string) => `縮放層級：${ZOOM_LEVELS[level] ?? level}。`],
    [
      /^Select zoom level\. The current zoom level is (month|quarter|year)\.$/,
      (_, level: string) => `選擇縮放層級。目前的縮放層級為${ZOOM_LEVELS[level] ?? level}。`
    ],
    [new RegExp(`^Today: (${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => `今天：${translateRoadmapSpan(span)}`],
    [new RegExp(`^Scroll to: (${WEEKDAY_DATE_SOURCE})$`), (_, date: string) => `捲動到：${translateWeekdayDate(date)}`],
    // 原文没有冒号：新增到今天 10月26日週一
    [new RegExp(`^Add to today at (${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => joinCjk('新增到今天', translateRoadmapSpan(span))],
    [new RegExp(`^Add to (${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => joinCjk('新增到', translateRoadmapSpan(span))],
    [
      new RegExp(`^Create an iteration containing (${WEEKDAY_DATE_SOURCE}) to add items here$`),
      (_, date: string) => joinCjk('建立包含', `${translateWeekdayDate(date)}的迭代後才能在此新增項目`)
    ],
    [new RegExp(`^(${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => translateRoadmapSpan(span)],
    [new RegExp(`^(${ITERATION_RANGE_SOURCE})$`), (_, range: string) => translateIterationRange(range)],
    [
      /^We've selected an existing (date|iteration) field in your project to get started\. You can change the fields used here\.$/,
      (_, kind: string) => `已選擇專案中現有的${kind === 'date' ? '日期' : '迭代'}欄位。你可以在此變更使用的欄位。`
    ],
    [/^(\d+) milestones$/, '$1 個里程碑'],
    [/^(\d+) iterations$/, '$1 個迭代'],
    [
      /^([A-Z]\S*(?: \S+)?) (start|end)$/,
      (_, name: string, edge: string) => pangu(`${translateFieldName(name)}${edge === 'start' ? '開始' : '結束'}`)
    ]
  ],
  inline: [
    // 路线图表头里程碑 / 迭代标记的读屏文本（roadmap-header.tsx）：<span class="sr-only">(Starting on <time>Oct 26, 2026</time>)</span>
    // 右括号是独立文本节点；整句译出后用全角括号，日期由 <time> 内的文字照常翻译
    ['(Starting on {})', '（開始於 {}）'],
    ['(Due on {})', '（截止於 {}）']
  ],
  ignore: [
    // 项目标题（用户内容）。顶栏的项目标题是 SanitizedHtml 渲染的 h1（memex-title.tsx）；项目设置、工作流、见解、
    // 存档页顶栏的路由标题（RouteTitle，Primer Heading 渲染的 h1，不带 SanitizedHtml__）是界面文字，照常翻译
    '#memex-root [class*="topBar__"] h1[class*="SanitizedHtml__"]',
    // 项目详细信息侧栏的项目标题（side-panel/content.tsx）：浮层版渲染在 Primer 门户里（#memex-root 外），不加前缀
    '[class*="infoPanelTitle__"]',
    // 视图名称（含标签页 title 提示）、项标题（用户内容）
    '#memex-root [class*="viewNameText__"]',
    '#memex-root a[class*="tabNavLink__"]',
    '#memex-root [class*="titleCell__"] a',
    '#memex-root [class*="titleCell__"] [class*="TextCell__"]',
    '#memex-root h3[id^="board-card-title-"]',
    '#memex-root [class*="RoadmapCell__"] [class*="SanitizedHtml__"]',
    '#memex-root [class*="titleHeading__"] bdi',
    // 看板卡片：虚拟化（未渲染内容）时 aria-label 为项标题（及 owner/repo#编号）
    '#memex-root .board-view-column-card[aria-label]',
    // 看板卡片头部的“存储库名 #编号”：只有议题、拉取请求（含草稿拉取请求）卡片带 hovercard 标记；
    // 草稿议题头部显示 Draft、已隐藏项显示 Access prohibited，均不带，不忽略
    '#memex-root .board-view-column-card[data-hovercard-subject-tag] [id^="board-card-header-title-"]',
    // 议题标签名（prc-Token-IssueLabel- 内的 TokenTextContainer）由全局忽略规则处理，不重复收录
    // 筛选框中 aria-hidden 的高亮层与光标定位镜像（输入文本副本）；输入框本身（placeholder）不在其内。
    // 比全局规则（.styled-input-container > div > [aria-hidden="true"]）宽：镜像层嵌套更深时也能命中
    '.styled-input-container [aria-hidden="true"]'
  ]
} satisfies PageDictionary
