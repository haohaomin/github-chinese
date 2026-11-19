import type { PageDictionary } from '../../../core/types'
import { joinCjk, MONTH_SOURCE, translateDate } from '../helpers'
import { FIELD_NAMES, FIELD_NAME_SOURCE, pangu, translateFieldName } from './fields'
import { translateOptionName } from './templates'

/**
 * 项目（新版 Projects）：视图。
 * 视图标签页与视图菜单、布局切换、筛选栏（含筛选建议的组合 aria-label）、排序 / 分组 / 切片 / 字段求和、
 * 表格表头菜单、看板列菜单与卡片标签、路线图（日期字段、标记、缩放、日期提示）、用户内容忽略选择器。
 */

const WEEKDAYS: Readonly<Record<string, string>> = {
  Mon: '周一',
  Tue: '周二',
  Wed: '周三',
  Thu: '周四',
  Fri: '周五',
  Sat: '周六',
  Sun: '周日'
}

/** 路线图日期片段（不含捕获组）：Mon, Oct 26 或 Fri, Jan 8 2027 */
export const WEEKDAY_DATE_SOURCE = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), ${MONTH_SOURCE} \\d{1,2}(?: \\d{4})?`

/** 路线图日期区间（不含捕获组）：Mon, Oct 26 - Fri, Nov 6 [Iteration 3] */
export const ROADMAP_SPAN_SOURCE = `${WEEKDAY_DATE_SOURCE}(?: - ${WEEKDAY_DATE_SOURCE})?(?: \\[[^\\]]+\\])?`

/** 迭代日期区间（不含捕获组）：Oct 01 - Oct 14、Dec 25, 2026 - Jan 07, 2027 */
export const ITERATION_RANGE_SOURCE = `${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})? - ${MONTH_SOURCE} \\d{1,2}(?:, \\d{4})?`

const WEEKDAY_DATE_RE = new RegExp(`^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (${MONTH_SOURCE}) (\\d{1,2})(?: (\\d{4}))?$`)
const SHORT_DATE_RE = new RegExp(`^${MONTH_SOURCE} \\d{1,2}$`)

/** "Mon, Oct 26" → 10月26日周一；"Fri, Jan 8 2027" → 2027年1月8日周五 */
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
      return edge ? `${edge[1]} ${edge[2] === 'start' ? '开始' : '结束'}` : part
    })
    .join(' - ')
}

/** 路线图项提示：Mon, Oct 26 - Fri, Nov 6 [Iteration 3] → 10月26日周一 - 11月6日周五 [Iteration 3] */
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
  return rank.replace(/^no\. (\d+)$/, '第 $1 个')
}

function sortDirection(direction: string): string {
  return direction === 'ascending' ? '升序' : '降序'
}

const ZOOM_LEVELS: Readonly<Record<string, string>> = {
  month: '月',
  quarter: '季度',
  year: '年'
}

const DURATION_UNITS: Readonly<Record<string, string>> = {
  day: '天',
  week: '周',
  month: '个月'
}

const MACRO_PREFIXES: Readonly<Record<string, string>> = {
  Current: '当前',
  Next: '下一个',
  Previous: '上一个'
}

const MACRO_OPERATORS: Readonly<Record<string, string>> = {
  'starts with': '开头为',
  'ends with': '结尾为',
  contains: '包含'
}

/**
 * 迭代宏：Current iteration / Next sprint（字段名小写）。排除同形的通用短语：Next page、Next month 等，
 * 以及项目页上智能体会话的 Next step / Previous step、Copilot 的 Next steps、议题查看器的 Next issue
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

/** 字段名之外的内置筛选器名 */
const FILTER_KEY_NAMES: Readonly<Record<string, string>> = {
  Has: '有',
  No: '无',
  State: '状态',
  'Closed reason': '关闭原因',
  Reviews: '审查',
  'Last updated': '最后更新',
  'Blocked by': '被阻止',
  Blocking: '阻止',
  'Relates to': '相关'
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

/** Title, Assignees, and Status → 标题、受理人和状态 */
function translateFieldList(list: string): string {
  const names = list.split(/, and |, | and /).map(name => translateFieldName(name))
  const last = names.pop() ?? ''
  return `${names.join('、')}和${last}`
}

const STATIC: Readonly<Record<string, string>> = {
  // 视图标签页与视图菜单
  'New view': '新建视图',
  'Select view': '选择视图',
  'Change view name': '更改视图名称',
  'Rename view': '重命名视图',
  'View name': '视图名称',
  'View name cannot be empty': '视图名称不能为空',
  // Duplicate view、Save changes to new view、Delete view 与议题视图共用，由 issues 词典收录
  'Save to current view': '保存到当前视图',
  'Delete view?': '删除视图？',
  'Are you sure you want to delete this view?': '确定要删除此视图吗？',
  'Remove deleted view': '移除已删除的视图',
  'Move view': '移动视图',
  'View options...': '视图选项...',
  'View more options': '查看更多选项',
  'Export view data': '导出视图数据',
  'Only rows that have been loaded into this view will be exported.': '只导出此视图中已加载的行。',
  'Generate chart': '生成图表',
  'Show hierarchy': '显示层级',
  'Show agent sessions': '显示智能体会话',
  'Select row height': '选择行高',
  'Switch layout: Table': '切换布局：表格',
  'Switch layout: Board': '切换布局：看板',
  'Switch layout: Roadmap': '切换布局：路线图',
  'Switch layout...': '切换布局...',
  'Return to project view': '返回项目视图',
  'This view has been deleted.': '此视图已删除。',
  'Save a copy to make changes.': '保存副本以修改。',
  'Duplicate it to make changes.': '复制视图以修改。',
  'This view no longer exists': '此视图已不存在',
  'Select another view to use this project.': '选择其他视图以使用此项目。',

  // 保存视图（原文没有逗号，译文不加）
  'Set as the default for everyone?': '设为所有人的默认设置？',
  'Publishing this configuration will make it the default for everyone viewing the project.':
    '发布此配置会使其成为所有查看此项目的人的默认设置。',
  'Saving these filters will make it the default for everyone in this view.': '保存这些筛选器会使其成为此视图中所有人的默认设置。',
  'Saving these display options will make it the default for everyone in this view.':
    '保存这些显示选项会使其成为此视图中所有人的默认设置。',
  'Saving these options will make it the default for everyone in this view.': '保存这些选项会使其成为此视图中所有人的默认设置。',

  // 筛选栏
  'Filter by keyword or by field': '按关键字或字段筛选',
  'View filters': '视图筛选器',
  'The "last-updated" filter is deprecated and will be removed in the future. Please use the new "updated" filter instead.':
    '“last-updated”筛选器已弃用并将在以后删除。请改用新的“updated”筛选器。',
  'Issue items with a linked pull request': '链接了拉取请求的议题项',
  'Items without a value for the specified field': '指定字段没有值的项',
  'Items reviewed by the user': '该用户审查过的项',
  'Filter by item closed reason': '按项的关闭原因筛选',
  'Date when the item was last updated': '项最后更新的日期',
  'Filter for items that are blocked by other items': '筛选被其他项阻止的项',
  'Filter for items that are blocking other items': '筛选阻止其他项的项',
  'Filter for items that are related to other items': '筛选与其他项相关的项',
  'Filter by sub-issue properties': '按子议题属性筛选',
  'Filter by item state or object type': '按项的状态或对象类型筛选',
  "Filter by item's state reason": '按项的状态原因筛选',
  'Filter by item last updated': '按项的最后更新时间筛选',
  "Filter by item's updated date": '按项的更新日期筛选',
  'Filter by items with a specific metadata value': '筛选具有特定元数据值的项',
  'Filter by items without a specific metadata value': '筛选缺少特定元数据值的项',
  'Filter only "issues", "pulls", "open", "closed", or "draft"': '仅筛选“issues”“pulls”“open”“closed”或“draft”',
  'Look for open, closed, or draft issues': '查找打开、已关闭或草稿议题',
  'Look for open / closed items': '查找打开或已关闭的项',

  // 排序 / 分组 / 切片 / 字段求和
  'Select a field to sort by': '选择排序字段',
  'Select up to 2 fields': '最多选择 2 个字段',
  'No sorting': '不排序',
  'No grouping': '不分组',
  'No slicing': '不切片',
  'Select a field to slice by': '选择切片字段',
  'Slice by...': '切片依据...',
  'Column field by...': '列字段...',
  'Field sum': '字段求和',
  'Marker fields': '标记字段',
  'Remove sorting': '删除排序',
  'Cannot reorder items between sorted values': '无法在已排序的值之间调整项的顺序',
  'Drag and drop is not supported when grouped by a multi-select field': '按多选字段分组时不支持拖放',
  'Confirm sort order overwrite': '确认覆盖排序',
  'You are about to overwrite the currently set sort order. All previous settings will be lost.':
    '将覆盖当前的排序设置。之前的设置会全部丢失。',
  'Overwrite sorting': '覆盖排序',
  'Project items group': '项目项分组',
  'Project iterations list': '项目迭代列表',
  'Slice panel separator': '切片面板分隔条',

  // 表格表头菜单
  'Filter by values…': '按值筛选…',
  'Filter by type or state…': '按类型或状态筛选…',
  'Group by values': '按值分组',
  'Grouped by field': '已按此字段分组',
  'Slice by values': '按值切片',
  'Hide field': '隐藏字段',
  'Field settings…': '字段设置…',
  'Reordering this item is disabled': '无法调整此项的顺序',

  // 看板
  'Add a new column to the board': '向看板添加新列',
  'New column': '新建列',
  'Visible columns': '可见列',
  'Hidden columns': '隐藏的列',
  'Click a value to filter the view': '单击值以筛选视图',
  'Copy link in project': '复制项目内链接',
  'Move to column': '移到列',
  'This is the left-most column': '已是最左列',
  'This is the right-most column': '已是最右列',
  'Remove from project': '从项目中删除',
  'Set column limit': '设置列上限',
  'Edit column limit': '编辑列上限',
  'Column limit': '列上限',
  'A limit on the number of items in a column': '一列中项的数量上限',
  'Column limit is too large, must be less than 1,000,000.': '列上限过大，必须小于 1,000,000。',
  'Rename column': '重命名列',
  'Column name': '列名称',
  'Column name cannot be empty': '列名称不能为空',
  'Hide from view': '在视图中隐藏',
  'Loading data required to properly display view': '正在加载显示视图所需的数据',
  // Column overview、Loading board 与 There are more columns / rows … 与议题视图共用，由 issues 词典收录

  // 路线图
  'Roadmap options': '路线图选项',
  'Date fields': '日期字段',
  'Select date fields': '选择日期字段',
  'Scroll to previous date range': '滚动到上一个日期范围',
  'Scroll to next date range': '滚动到下一个日期范围',
  'Unable to set date fields': '无法设置日期字段',
  'Unable to expand date selection': '无法扩展日期选择',
  'Welcome to Roadmap!': '欢迎使用路线图！',
  'Your project needs at least one date or iteration field to get started.': '项目至少需要一个日期或迭代字段。',
  'Create a date or iteration field to specify dates': '创建日期或迭代字段以指定日期',
  'Add item to today': '将项添加到今天',
  'Drag to resize the table column': '拖动以调整表格列宽',
  'Configure vertical markers to display on roadmap': '配置路线图上显示的竖向标记',
  'Resize the item by dragging the earlier date': '拖动较早的日期以调整项',
  'Resize the item by dragging the later date': '拖动较晚的日期以调整项',
  'Skip to start of markers': '跳到标记开头',
  'Skip to end of markers': '跳到标记末尾',
  'Show date fields': '显示日期字段'
}

const SCOPED: Readonly<Record<string, string>> = {
  // 通用文本（仅项目页生效）
  'Save filter': '保存筛选器',
  'Filter by...': '筛选...',
  'Filter by pull request review state': '按拉取请求审查状态筛选',
  // 筛选栏建议弹层的 aria-label（名词 filter → 筛选器）
  'Filter suggestions': '筛选器建议',
  'Closed reason': '关闭原因',
  'Last updated': '最后更新',
  'Blocked by': '被阻止',
  'Relates to': '相关',
  'Changes requested': '已请求更改',
  '7 or more days ago': '7天前或更早',
  '14 or more days ago': '14 天前或更早',
  '21 or more days ago': '21 天前或更早',
  'Unbalanced quotation marks': '引号不匹配',
  'Unbalanced parentheses': '括号不匹配',
  'Invalid filter: Unmatched quotation mark': '筛选器无效：引号不匹配',
  // 标点随原文：X 之后的逗号、两句之间的句号、ex: 的冒号
  'Supported format is <@today-X, where X is a number and unit. Unit can be one of d,w or m ex: 7d':
    '支持的格式为 <@today-X，其中 X 为数字加单位。单位可为 d、w 或 m 例如：7d',
  'Supported format is XXdays (except 0days)': '支持的格式为 XXdays（0days 除外）',
  'Signed-in user': '已登录用户',
  'Your AI pair programmer': '你的 AI 结对程序员',
  '@me, Signed-in user': '@me，已登录用户',
  '@copilot, Your AI pair programmer': '@copilot，你的 AI 结对程序员',
  'Past 7 days': '过去 7 天',
  'Past 30 days': '过去 30 天',
  'Past year': '过去一年',
  'Less than 10': '少于 10',
  'More than 10': '多于 10',
  'Between 10 and 100': '10 到 100 之间',
  'Group by...': '分组依据...',
  'Sort by...': '排序依据...',
  'Zoom level': '缩放级别',
  'Row height': '行高',
  'Ascending order: oldest to newest': '升序：从旧到新',
  'Descending order: newest to oldest': '降序：从新到旧',
  'Ascending order: lowest to highest': '升序：从低到高',
  'Descending order: highest to lowest': '降序：从高到低',
  'Ascending order: first to last': '升序：从首项到末项',
  'Descending order: last to first': '降序：从末项到首项',
  'Ascending order: A to Z': '升序：A 到 Z',
  'Descending order: Z to A': '降序：Z 到 A',
  'Press enter/space to resize pane with arrow keys. Press escape to exit.': '按 Enter 或空格后用方向键调整面板大小。按 Esc 退出。',
  'Filter values...': '筛选值...',
  'Filter values': '筛选值',
  'Filter mode': '筛选模式',
  'Hide empty values': '隐藏空值',
  'Show empty values': '显示空值',
  'Select column': '选择列',
  'Sort ascending': '升序排序',
  'Sorted ascending': '已升序排序',
  'Sort descending': '降序排序',
  'Sorted descending': '已降序排序',
  'Row actions': '行操作',
  'Repository suggestions': '存储库建议',
  'Loading sub-issues': '正在加载子议题',
  'Load more items': '加载更多项',
  'Move to top': '移到顶部',
  'Move to bottom': '移到底部',
  'Move to start': '移到开头',
  'Move to end': '移到末尾',
  'Remove limit': '删除上限',
  'Set limit': '设置上限',
  'Edit details': '编辑详细信息',
  'Archive all': '全部存档',
  'Remove all': '全部移除',
  'To drag an item: press Enter to grab, arrow keys to move, Enter to drop, or Escape to cancel.':
    '拖动项：按 Enter 拿起，用方向键移动，按 Enter 放下，按 Esc 取消。',
  'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.':
    '按空格键拿起可拖动的项。拖动时用方向键移动项。再按空格键将项放到新位置，或按 Esc 取消。',
  'No cards': '没有卡片',
  'Loading cards': '正在加载卡片',
  'Loading columns': '正在加载列',
  'Loading rows': '正在加载行',
  'More columns': '更多列',
  'More rows': '更多行',
  'Draggable pane splitter': '可拖动的面板分隔条',
  'No start date': '无开始日期',
  'No target date': '无目标日期',
  'No date set': '未设置日期',
  'No sort applied': '未排序',
  'Truncate titles': '截断标题',
  // 读屏文本：右括号在 <time> 之后的独立文本节点里。整句由下方 inline 规则译出（全角括号）；
  // 不构成行内句时按片段翻译，保持半角以免括号不配对
  '(Starting on': '(开始于',
  '(Due on': '(截止于',
  // 布局与视图菜单
  Layout: '布局',
  'Layout:': '布局：',
  Table: '表格',
  Board: '看板',
  View: '视图',
  'User settings': '用户设置',
  Configuration: '配置',
  Swimlanes: '泳道',
  'Swimlanes:': '泳道：',
  'Fields:': '字段：',
  'Group by': '分组依据',
  'Group by:': '分组依据：',
  'Sort by': '排序依据',
  'Sort by:': '排序依据：',
  'Slice by': '切片依据',
  'Slice by:': '切片依据：',
  'Column by': '分列依据',
  'Column by:': '分列依据：',
  'Field sum:': '字段求和：',
  'Row height:': '行高：',
  'Markers:': '标记：',
  'Marker fields:': '标记字段：',
  'Dates:': '日期：',
  'Zoom level:': '缩放级别：',
  'Unsort by': '取消排序',
  Markers: '标记',
  Dates: '日期',
  none: '无',
  manual: '手动',
  Count: '计数',
  '(ascending)': '（升序）',
  '(descending)': '（降序）',
  Sort: '排序',
  // Filter、Filters、Clear filter 由 common-ui 的全局词条译为“筛选器”“清除筛选器”，不收 scoped 副本
  Discard: '放弃',
  Reset: '重置',
  Set: '设置',
  'Unsaved changes': '未保存的更改',
  'Discard changes?': '放弃更改？',
  'You have unsaved changes. Are you sure you want to discard them?': '有未保存的更改。确定要放弃吗？',
  'Keep editing': '继续编辑',
  'Close and discard': '关闭并放弃',
  'Are you sure you want to proceed?': '确定要继续吗？',
  Has: '有',
  No: '无',
  Me: '我',
  Yesterday: '昨天',
  Include: '包含',
  Exclude: '排除',
  Deselect: '取消选择',
  'matching item': '个匹配项',
  'matching items': '个匹配项',
  // 行高
  Single: '单行',
  Medium: '中等',
  Tall: '较高',
  'Extra tall': '超高',
  // 筛选建议
  State: '状态',
  Blocking: '阻止',
  'Not planned': '未计划',
  Duplicate: '重复',
  Reopened: '已重新打开',
  Merged: '已合并',
  Queued: '已排队',
  'Pull Request': '拉取请求',
  Pending: '待处理',
  Approved: '已批准',
  Commented: '已评论',
  Dismissed: '已消除',
  Reviews: '审查',
  // 看板
  Column: '列',
  Group: '分组',
  Items: '项',
  Position: '位置',
  'Move left': '左移',
  'Move right': '右移',
  'Move up': '上移',
  'Move down': '下移',
  'Move to': '移到',
  'Move item': '移动项',
  'Unavailable for iterations': '不适用于迭代',
  'More actions': '更多操作',
  'Convert to issue': '转换为议题',
  'Open in new tab': '在新标签页中打开',
  'Draft issue': '草稿议题',
  Draft: '草稿',
  'Access prohibited': '禁止访问',
  'Add item': '添加项',
  'Dropdown button': '下拉按钮',
  'Assignees:': '受理人：',
  // 路线图
  Today: '今天',
  Month: '月',
  Quarter: '季度',
  Year: '年',
  Break: '间隔',
  milestones: '个里程碑',
  'Got it!': '知道了！'
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
    [/^View options for (.+)$/, (_, name: string) => joinCjk(name, '的视图选项')],
    [/^Save display options for (.+)\?$/, (_, name: string) => `${joinCjk(joinCjk('保存', name), '的显示选项')}？`],
    [/^Save filters for (.+)\?$/, (_, name: string) => `${joinCjk(joinCjk('保存', name), '的筛选器')}？`],
    [/^Save filters and display options for (.+)\?$/, (_, name: string) => `${joinCjk(joinCjk('保存', name), '的筛选器和显示选项')}？`],

    // 分组、列与卡片
    [
      /^Actions for (column|group): (.+)$/,
      (_, kind: string, name: string) => joinCjk(joinCjk(kind === 'column' ? '列' : '分组', name), '的操作')
    ],
    [/^Actions for (.+)$/, (_, name: string) => joinCjk(name, '的操作')],
    [/^(Collapse|Expand) group (.+)$/, (_, action: string, name: string) => joinCjk(action === 'Collapse' ? '折叠分组' : '展开分组', name)],
    [new RegExp(`^No (${FIELD_NAME_SOURCE})$`), (_, name: string) => `无${translateFieldName(name)}`],
    [/^No ([A-Z][\w-]*(?: [\w-]+)?)$/, (_, name: string) => pangu(`无${name}`)],
    [/^(\d+) cards?$/, '$1 张卡片'],
    [/^More cards in (.+)$/, (_, name: string) => joinCjk(name, '中的更多卡片')],
    [/^Archive (\d+) selected items$/, '存档 $1 个所选项'],
    // 表格行菜单（多选）：同一操作在看板卡片菜单里写作 Remove … from project
    [/^Archive (\d+) items$/, '存档 $1 个项'],
    [/^Remove (\d+) selected items from project$/, '从项目中删除 $1 个所选项'],
    [/^Delete (\d+) selected items from project$/, '从项目中删除 $1 个所选项'],
    [/^Add item to (.+)$/, (_, name: string) => joinCjk(joinCjk('向', name), '添加项')],
    // 切片面板的筛选状态（原文无标点，译文不加逗号）
    [/^Showing (\d+) of (\d+)$/, '显示 $2 个中的 $1 个'],
    [/^Linked pull request: #(\d+)$/, '链接的拉取请求：#$1'],
    [/^Label: (.+)$/, '标签：$1'],
    [
      new RegExp(`^([^:]+): (.+) \\((${ITERATION_RANGE_SOURCE})\\)$`),
      (_, field: string, title: string, range: string) => `${translateFieldName(field)}：${title}（${translateIterationRange(range)}）`
    ],
    [
      new RegExp(`^(${CARD_FIELD_SOURCE}): (.+)$`),
      (_, field: string, value: string) => `${translateFieldName(field)}：${cardFieldValue(value)}`
    ],

    // 表格表头与视图配置
    [/^(.+) column options$/, (_, name: string) => joinCjk(translateFieldName(name), '列选项')],
    [
      /^Change (?:(primary|secondary|no\. \d+) )?sort direction to (ascending|descending)$/,
      (_, rank: string | undefined, direction: string) => `将${sortRank(rank)}排序方向改为${sortDirection(direction)}`
    ],
    [
      /^\((?:(primary|secondary|no\. \d+) )?sort: (ascending|descending)\)$/,
      (_, rank: string | undefined, direction: string) => `（${sortRank(rank)}排序：${sortDirection(direction)}）`
    ],
    [
      /^Sorted by: (.+)$/,
      (_, list: string) =>
        `排序依据：${list
          .split(', ')
          .map(part => {
            const sort = /^(.+) (ascending|descending)$/.exec(part)
            return sort ? pangu(`${translateFieldName(sort[1] ?? '')}${sortDirection(sort[2] ?? '')}`) : part
          })
          .join('，')}`
    ],
    [
      /^Count, (.+) and (\d+) more$/,
      (_, name: string, count: string) => pangu(`计数，${translateFieldName(name)}等 ${Number(count) + 1} 项`)
    ],
    [/^Count, (.+)$/, (_, name: string) => `计数，${translateFieldName(name)}`],
    [new RegExp(`^(${FIELD_LIST_SOURCE})$`), (_, list: string) => translateFieldList(list)],
    // 字段求和只列一个字段名；逗号分隔的名单（反应者：alice, bob and 3 more）不匹配，避免总数算错
    [/^([^,]+) and (\d+) more$/, (_, name: string, count: string) => pangu(`${translateFieldName(name)}等 ${Number(count) + 1} 项`)],

    // 筛选建议
    [MACRO_RE, (_, which: string, name: string) => translateMacro(which, name)],
    [WILDCARD_RE, (_, name: string, operator: string) => translateWildcard(name, operator)],
    [/^Sub-issues – (.+)$/, (_, name: string) => `子议题 – ${translateFieldName(name)}`],
    // 字段名首字母大写；小写的 Filter by user / author 等来自侧边面板的共享选择器，不按字段名处理
    [/^Filter by ([A-Z][\w-]*(?: [\w-]+){0,3})$/, (_, name: string) => pangu(`按${translateFieldName(name)}筛选`)],
    [/^Has ([a-z][\w -]*)$/, (_, name: string) => pangu(`有${translateFieldName(name)}`)],
    [/^(\d+) (days?|weeks?|months?)$/, (_, count: string, unit: string) => `${count} ${DURATION_UNITS[unit.replace(/s$/, '')] ?? unit}`],
    // 筛选建议的组合 aria-label：Has Assignees, Assignees / term*, iteration starts with / Status, Filter / Todo, Status
    [
      /^(Has|No) (.+), \2$/,
      (_, prefix: string, name: string) => `${pangu(`${prefix === 'Has' ? '有' : '无'}${filterKeyName(name)}`)}，${filterKeyName(name)}`
    ],
    [
      /^(\*?term\*?), ([a-z][\w -]*) (starts with|ends with|contains)$/,
      (_, term: string, name: string, operator: string) =>
        `${term}，${pangu(`${translateFieldName(name)}${MACRO_OPERATORS[operator] ?? operator}`)}`
    ],
    [
      /^(.+), Filter(?:, (.+))?$/,
      (_, name: string, description: string) =>
        `${filterKeyName(name)}，筛选器${description ? `，${STATIC[description] ?? SCOPED[description] ?? description}` : ''}`
    ],
    [
      new RegExp(`^(.+), (${FILTER_PROVIDER_SOURCE})$`),
      (_, value: string, provider: string) => `${filterValueName(value)}，${filterKeyName(provider)}`
    ],

    // 路线图
    [/^Zoom level: (month|quarter|year)\.$/, (_, level: string) => `缩放级别：${ZOOM_LEVELS[level] ?? level}。`],
    [
      /^Select zoom level\. The current zoom level is (month|quarter|year)\.$/,
      (_, level: string) => `选择缩放级别。当前缩放级别为${ZOOM_LEVELS[level] ?? level}。`
    ],
    [new RegExp(`^Today: (${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => `今天：${translateRoadmapSpan(span)}`],
    [new RegExp(`^Scroll to: (${WEEKDAY_DATE_SOURCE})$`), (_, date: string) => `滚动到：${translateWeekdayDate(date)}`],
    // 原文没有冒号：添加到今天 10月26日周一
    [new RegExp(`^Add to today at (${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => joinCjk('添加到今天', translateRoadmapSpan(span))],
    [new RegExp(`^Add to (${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => joinCjk('添加到', translateRoadmapSpan(span))],
    [
      new RegExp(`^Create an iteration containing (${WEEKDAY_DATE_SOURCE}) to add items here$`),
      (_, date: string) => joinCjk('创建包含', `${translateWeekdayDate(date)}的迭代后才能在此添加项`)
    ],
    [new RegExp(`^(${ROADMAP_SPAN_SOURCE})$`), (_, span: string) => translateRoadmapSpan(span)],
    [new RegExp(`^(${ITERATION_RANGE_SOURCE})$`), (_, range: string) => translateIterationRange(range)],
    [
      /^We've selected an existing (date|iteration) field in your project to get started\. You can change the fields used here\.$/,
      (_, kind: string) => `已选择项目中现有的${kind === 'date' ? '日期' : '迭代'}字段。可在此更改所用字段。`
    ],
    [/^(\d+) milestones$/, '$1 个里程碑'],
    [/^(\d+) iterations$/, '$1 个迭代'],
    [
      /^([A-Z]\S*(?: \S+)?) (start|end)$/,
      (_, name: string, edge: string) => pangu(`${translateFieldName(name)}${edge === 'start' ? '开始' : '结束'}`)
    ]
  ],
  inline: [
    // 路线图表头里程碑 / 迭代标记的读屏文本（roadmap-header.tsx）：<span class="sr-only">(Starting on <time>Oct 26, 2026</time>)</span>
    // 右括号是独立文本节点；整句译出后用全角括号，日期由 <time> 内的文字照常翻译
    ['(Starting on {})', '（开始于 {}）'],
    ['(Due on {})', '（截止于 {}）']
  ],
  ignore: [
    // 项目标题（用户内容）。顶栏的项目标题是 SanitizedHtml 渲染的 h1（memex-title.tsx）；项目设置、工作流、洞察、
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
