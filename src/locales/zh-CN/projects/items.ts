import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, MONTH_SOURCE, RELATIVE_SOURCE, translateDate, translateTime } from '../helpers'
import { FIELD_NAMES, pangu, translateFieldName } from './fields'

/**
 * 项目（新版 Projects）：项。
 * 添加项（omnibar、批量添加）、项菜单与确认框、侧边面板、草稿转议题、项状态、
 * 状态更新、存档项页、批量更新 / 导入提示、子议题、代理任务、日期选择器、反馈对话框。
 */

const ITEM_STATES: Readonly<Record<string, string>> = {
  open: '打开',
  closed: '已关闭',
  merged: '已合并',
  draft: '草稿',
  queued: '已排队'
}

/** 项状态图标的 aria-label */
const STATE_LABELS: Readonly<Record<string, string>> = {
  'Open issue': '打开的议题',
  'Closed as completed issue': '以已完成关闭的议题',
  'Closed as not planned issue': '以未计划关闭的议题',
  'Closed as duplicate issue': '以重复关闭的议题',
  'Redacted issue': '已隐藏的议题',
  'Open pull request': '打开的拉取请求',
  'Closed pull request': '已关闭的拉取请求',
  'Merged pull request': '已合并的拉取请求',
  'Queued pull request': '已排队的拉取请求',
  'Draft pull request': '草稿拉取请求'
}

/** scoped 展开的项状态：Closed as not planned issue 由 common-ui/status.ts 的全局词条翻译，不收 scoped 副本 */
const SCOPED_STATE_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(STATE_LABELS).filter(([label]) => label !== 'Closed as not planned issue')
)

/** 无后缀距离：about 2 months → 约2 个月；less than a minute → 不到 1 分钟 */
const DISTANCE_UNITS: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '个月',
  year: '年'
}

const DISTANCE_PREFIXES: Readonly<Record<string, string>> = {
  about: '约',
  almost: '将近',
  over: '超过',
  'less than': '不到'
}

/** 距离片段（不含捕获组） */
export const DISTANCE_SOURCE = '(?:(?:about|almost|over|less than) )?(?:\\d+|an?) (?:second|minute|hour|day|week|month|year)s?'

export function translateDistance(text: string): string {
  const match = /^(?:(about|almost|over|less than) )?(\d+|an?) (second|minute|hour|day|week|month|year)s?$/.exec(text)
  if (!match) return text
  const [, prefix, amount = '', unit = ''] = match
  const count = /^\d+$/.test(amount) ? amount : '1'
  const distance = `${count}${DISTANCE_UNITS[unit] ?? unit}`
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
  'Start of selected range': '所选范围开始',
  'End of selected range': '所选范围结束',
  'Inside selected range': '在所选范围内',
  'Minimum allowed date': '允许的最早日期',
  'Maximum allowed date': '允许的最晚日期'
}

const DAY_NOTE_SOURCE = Object.keys(DAY_NOTES).join('|')

function translateDayNotes(notes: string): string {
  return notes.replace(/ \(([^)]+)\)/g, (_, note: string) => `（${DAY_NOTES[note] ?? note}）`)
}

const CONTENT_NOUNS: Readonly<Record<string, string>> = {
  'an issue type': '议题类型',
  'an issue field': '议题字段',
  'issue fields': '议题字段',
  'issue field': '议题字段',
  type: '类型'
}

function contentNoun(noun: string): string {
  return CONTENT_NOUNS[noun] ?? translateFieldName(noun)
}

/** 复数字段名：Milestones → 里程碑；Labels → 标签 */
function pluralFieldName(name: string): string {
  const exact = translateFieldName(name)
  if (exact !== name) return exact
  const single = name.replace(/s$/, '')
  const singular = translateFieldName(single)
  return singular !== single ? singular : name
}

/** “this item” / “3 items” / “these 3 items” → 此项 / 这 3 个项 */
function itemPhrase(phrase: string): string {
  const count = /\d[\d,]*/.exec(phrase)?.[0]
  return count ? `这 ${count} 个项` : '此项'
}

/** 状态更新的状态选项（同时用于代理任务的 Complete） */
const STATUS_OPTIONS: Readonly<Record<string, string>> = {
  'On track': '进展顺利',
  'At risk': '存在风险',
  'Off track': '偏离计划',
  Inactive: '不活跃',
  Complete: '已完成'
}

/** 字段类型名（不可清空单元格的提示“X cannot be deleted”），字段名之外的部分 */
const COLUMN_TYPE_TEXT: Readonly<Record<string, string>> = {
  'Single select': '单选',
  'Multi select': '多选',
  Number: '数字',
  Date: '日期',
  Text: '文本',
  'Created at': '创建时间',
  'Updated at': '更新时间',
  'Closed at': '关闭时间'
}

const COLUMN_TYPE_SOURCE = [...Object.keys(COLUMN_TYPE_TEXT), ...Object.keys(FIELD_NAMES)]
  .sort((a, b) => b.length - a.length)
  .map(name => name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
  .join('|')

export default {
  static: {
    // 添加项
    'Search or add items': '搜索或添加项',
    'Start typing to create an item, or type # to select a repository': '输入内容以创建项，或输入 # 选择存储库',
    'Start typing to create an item, or type hashtag to select a repository': '输入内容以创建项，或输入井号选择存储库',
    'Create new item or add existing item': '新建项或添加现有项',
    'Add item from repository': '从存储库添加项',
    'Add your first item': '添加第一项',
    'Add more items': '添加更多项',
    'Click "Add Item" to get started or use the shortcut': '单击“添加项”或使用快捷方式',
    'Add items to project': '向项目添加项',
    'Pick a repository to add issues and pull requests from': '选择要从中添加议题和拉取请求的存储库',
    'This repository is either empty or all items were already added to this project.': '此存储库为空或所有项都已添加到此项目。',
    'The new item has been added to the bottom of the column.': '新项已添加到列底部。',
    'The new item has been added to the bottom of the roadmap.': '新项已添加到路线图底部。',
    'The new item has been added to the bottom of the table.': '新项已添加到表格底部。',
    "The new item is hidden by this view's filters.": '新项被此视图的筛选器隐藏。',
    'Add selected items': '添加所选项',
    'Adding item...': '正在添加项...',
    'Adding items...': '正在添加项...',
    'No items to add': '没有可添加的项',
    'Select all items': '选择所有项',
    'Deselect all items': '取消选择所有项',

    // 项菜单与确认框
    'Archive all items?': '存档所有项？',
    'Remove all items?': '删除所有项？',
    'Move items to…': '将项移到…',
    'Cannot add items when grouped by milestone': '按里程碑分组时无法添加项',
    'Cannot add items when grouped by repository': '按存储库分组时无法添加项',
    'Cannot add items when grouped by type': '按类型分组时无法添加项',
    // write access → 写入访问权限；原文没有逗号，改语序代替
    "You can't edit this item because it belongs to a repository that you don't have write-access to.":
      '需要此项所属存储库的写入访问权限才能编辑。',
    'Convert this draft to an issue to add an assignee': '将此草稿转换为议题后才能添加受理人',
    'Content already exists in this group': '此分组中已存在该内容',
    'Convert to issue to edit this cell': '转换为议题后才能编辑此单元格',
    'Convert this draft to an issue to add it to this repository': '将此草稿转换为议题后才能添加到此存储库',
    'Drafts can’t be added to milestones. Convert this draft to an issue to add it to a milestone.':
      '草稿无法添加到里程碑。将此草稿转换为议题后才能添加。',
    'Redacted item': '已隐藏的项',
    'We are having trouble connecting to your project. Please try again or reload the page.': '无法连接到项目。请重试或重新加载页面。',
    'Labels can only be copied within the same repository': '标签只能在同一存储库内复制',
    'Assignees can only be copied within the same repository': '受理人只能在同一存储库内复制',
    'Milestones can only be copied within the same repository': '里程碑只能在同一存储库内复制',
    'Issue types can only be copied within the same repository': '议题类型只能在同一存储库内复制',
    'Cannot paste data of different types': '无法粘贴不同类型的数据',
    'Cannot paste: value does not match any allowed option': '无法粘贴：值与任何允许的选项都不匹配',
    "You can't edit this field because this repository is archived": '无法编辑已存档存储库中的字段',
    "We couldn't find any items matching that search query.": '未找到与搜索词匹配的项。',
    'Could not copy items. Please check the page permissions and try again.': '无法复制项。请检查页面权限后重试。',

    // 侧边面板
    'Pull requests are not currently supported in the side panel.': '侧边面板暂不支持拉取请求。',
    "The item is not in the project, or you don't have access to view it.": '该项不在项目中，或你无权查看。',
    'Copy project item permalink': '复制项目项永久链接',
    'File uploads have been disabled for draft issues in this organization.': '此组织已禁用草稿议题的文件上传。',
    'The issue was deleted, but the project may be out of date. Reload the page to try again.':
      '议题已删除，但项目可能未更新。重新加载页面后重试。',
    'Archive in project': '在项目中存档',

    // 子议题
    'Manage missing sub-issues': '管理缺失的子议题',
    'Sub-issues will be automatically added to your project. Prefer to disable this? Click the button below to turn off the workflow.':
      '子议题会自动添加到项目。单击下方按钮可关闭此工作流。',
    'Adding this issue to the project will change its parent, because the current view is filtered or grouped by a parent issue. Are you sure you want to change the parent of this issue?':
      '当前视图按父议题筛选或分组，将此议题添加到项目会更改其父议题。确定要更改吗？',
    // 分组名（No Parent issue、No milestone、No type）原文没有引号，译文也不加
    'PRs and Drafts can’t be added as sub-issues. Item was added to No Parent issue group':
      '拉取请求和草稿无法添加为子议题。项已添加到无父议题分组',
    'PRs and draft issues are not supported by sub-issues': '子议题不支持拉取请求和草稿议题',
    'Drafts can’t be added with a milestone. Item was added to No milestone group': '草稿无法设置里程碑。项已添加到无里程碑分组',
    'Drafts can’t be added with an issue type. Item was added to No type group': '草稿无法设置议题类型。项已添加到无类型分组',

    // 状态更新
    'Add a project status update': '添加项目状态更新',
    "Status updates are brief reports tracking your project's health and progress. Begin by adding an update.":
      '状态更新是记录项目健康状况和进度的简短报告。',
    'Add status update': '添加状态更新',
    'Delete status update': '删除状态更新',
    "Are you sure you'd like to delete this status update?": '确定要删除此状态更新吗？',
    'Subscribe to status updates for this project': '订阅此项目的状态更新',
    'Unsubscribe from status updates for this project': '取消订阅此项目的状态更新',
    'Subscribing to status updates': '正在订阅状态更新',
    'Unsubscribing from status updates': '正在取消订阅状态更新',
    'Status update options': '状态更新选项',

    // 存档项
    "There aren't any archived items": '没有已存档的项',
    "Archive items from a project view and they'll be shown here.": '在项目视图中存档的项会显示在这里。',
    'Filter for "issues" or "pull requests", or items that are "open", "closed", "merged", or "draft"':
      '筛选“issues”或“pull requests”，或状态为“open”“closed”“merged”或“draft”的项',
    'Removing items from project...': '正在从项目中删除项...',
    'Restoring items in project...': '正在恢复项目中的项...',
    'Are you sure you want to remove all items matching this query?': '确定要删除与此查询匹配的所有项吗？',

    // 批量更新 / 复制 / 导入
    'An error occurred while copying draft issues.': '复制草稿议题时出错。',
    'Draft issues copied successfully.': '草稿议题已复制。',
    'Copying draft issues to your new project. This may take a minute to complete.': '正在将草稿议题复制到新项目。可能需要一分钟。',
    'No items were added to this project.': '未向此项目添加任何项。',

    // 单元格校验与错误提示
    'This field must be a number': '此字段必须为数字',
    'This field must be a date': '此字段必须为日期',
    'This floating point value is too precise': '此浮点数精度过高',
    'Unable to refresh project data': '无法刷新项目数据',
    'Copying is not supported in this browser': '此浏览器不支持复制'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Discovery menu': '发现菜单',
    'No repositories found matching your search query.': '没有与搜索词匹配的存储库。',
    'Issue types are excluded from this repository.': '此存储库不使用议题类型。',
    'Pin side panel': '固定侧边面板',
    'Unpin side panel': '取消固定侧边面板',
    'Side panel controls': '侧边面板控件',
    'Remove session from issue': '从议题中删除会话',
    'Session removed from issue': '已从议题中删除会话',
    'This may take some time. This dialog will close when the job is complete.': '可能需要一些时间。任务完成后此对话框会关闭。',
    ...SCOPED_STATE_LABELS,
    // 添加项：侧边面板空状态的拆分句（Create a <a>repository</a> to get started.）整句由下方 inline 规则译出；
    // omnibar 的 You can use <kbd>…</kbd> to add an item 是 kbd 句子（快捷键文字随平台变化），按片段翻译
    'You can use': '使用',
    'to add an item': '添加项',
    'Create new issue': '新建议题',
    'Create a draft': '创建草稿',
    'OK, dismiss': '好的，关闭',
    'Open item': '打开项',
    'Jump to bottom': '跳到底部',
    'Add items from': '从以下存储库添加项',
    'Add items': '添加项',
    // Select a repository、Select repository 由 common-ui 的全局词条翻译，不收 scoped 副本
    'Search ⏎': '搜索 ⏎',
    'Create a': '创建一个',
    repository: '存储库',
    'to get started.': '以开始使用。',
    // 项菜单与确认框
    'Update permissions': '更新权限',
    'Edit title': '编辑标题',
    'Unable to transfer pull request': '无法转移拉取请求',
    'Pull requests cannot be moved between repositories.': '拉取请求无法在存储库之间移动。',
    'Transfer issue': '转移议题',
    // 拖入里程碑 / 议题类型分组的提示：整句由下方 inline 规则译出，不构成行内句时按以下片段翻译
    'New milestone required': '需要新里程碑',
    'Please create the': '请先创建',
    'milestone in the': '里程碑于',
    'repository before adding to this milestone group.': '存储库中再添加到此里程碑分组。',
    'There is no': '不存在',
    'issue type in the': '议题类型于',
    'organization.': '组织中。',
    'You can transfer this issue to a different repository from the': '可从以下页面将此议题转移到其他存储库',
    'issue page': '议题页面',
    'Sorry, something went wrong': '抱歉，出错了',
    'Rate limit exceeded. Please try again later.': '超出速率限制。请稍后重试。',
    'This form has errors': '表单有错误',
    'Unknown item': '未知项',
    'Agent task': '代理任务',
    'No valid updates to apply': '没有可应用的有效更新',
    "You don't have permission to edit this field.": '你没有编辑此字段的权限。',
    'Untitled project': '未命名项目',
    "Item can't be moved": '项无法移动',
    "Parent issue can't be updated": '父议题无法更新',
    'Nothing to show': '暂无内容',
    'No milestones to show.': '没有可显示的里程碑。',
    'No types to show.': '没有可显示的类型。',
    'Search milestones': '搜索里程碑',
    'Search types': '搜索类型',
    'Search labels': '搜索标签',
    'Search people': '搜索用户',
    'Open milestone': '打开的里程碑',
    'Closed milestone': '已关闭的里程碑',
    'Archived repository': '已存档的存储库',
    'Forked repository': '复刻的存储库',
    Archived: '已存档',
    'This value is too long': '此值过长',
    'You cannot delete this': '无法删除',
    Selected: '已选择',
    'No matches': '无匹配项',
    Archive: '存档',
    Remove: '删除',
    Move: '移动',
    Export: '导出',
    'Changes saved': '更改已保存',
    'Copy link': '复制链接',
    'Copied!': '已复制！',
    Issue: '议题',
    'Pull request': '拉取请求',
    'Are you sure?': '确定吗？',
    // 侧边面板
    'Side panel': '侧边面板',
    'Project information': '项目信息',
    'Agent session': '代理会话',
    'Close panel': '关闭面板',
    'Item title': '项标题',
    'Item status': '项状态',
    Properties: '属性',
    // 侧边面板操作列表的 aria-label（sidebar-actions.tsx 的 <ActionList aria-label="Actions">）。
    // 产品名 Actions 按用户要求同样译“操作”（product-names.md），不再与之冲突
    Actions: '操作',
    Description: '描述',
    opened: '打开于',
    'Loading...': '加载中...',
    Loading: '加载中',
    Comments: '评论',
    Comment: '评论',
    "Jump to 'add comment' input": '跳到评论输入框',
    'Add new comment': '添加新评论',
    'Comment actions': '评论操作',
    'Edit comment': '编辑评论',
    'Update comment': '更新评论',
    '(edited)': '（已编辑）',
    'update issue state options menu': '更新议题状态选项菜单',
    Reactions: '反应',
    'All reactions': '所有反应',
    'No description provided': '未提供描述',
    'None yet': '暂无',
    'Close issue': '关闭议题',
    Reopen: '重新打开',
    'Close with comment': '评论并关闭',
    'Reopen and comment': '重新打开并评论',
    'Reopen issue': '重新打开议题',
    'Close as completed': '以已完成关闭',
    'Done, closed, fixed, resolved': '已完成、已关闭、已修复、已解决',
    'Close as not planned': '以未计划关闭',
    'Won’t fix, can’t repro, duplicate, stale': '不修复、无法复现、重复、已过时',
    'Reload project': '重新加载项目',
    'The issue could not be deleted. It has been restored.': '无法删除议题。议题已恢复。',
    'Unable to load task chat:': '无法加载任务对话：',
    'Loading task chat': '正在加载任务对话',
    'Unable to load task data.': '无法加载任务数据。',
    'No session information available.': '暂无会话信息。',
    'Session options': '会话选项',
    // 产品名按用户要求译成中文（product-names.md）：Copilot Chat → Copilot 聊天
    'Unable to load Copilot Chat. Ensure Copilot is enabled.': '无法加载 Copilot 聊天。请确认已启用 Copilot。',
    'Agent tasks': '代理任务',
    Failed: '失败',
    Cancelled: '已取消',
    Waiting: '等待中',
    Agent: '代理',
    // 子议题
    'Add all to project': '全部添加到项目',
    'Add sub-issue': '添加子议题',
    'Failed to load data': '数据加载失败',
    'Disable workflow': '禁用工作流',
    'Change parent issue': '更改父议题',
    'No due date': '无截止日期',
    // 状态更新
    'Status updates': '状态更新',
    'Add update': '添加更新',
    'Save update': '保存更新',
    'Filter statuses': '筛选状态',
    'Status results': '状态结果',
    'Select a status': '选择状态',
    'Select status': '选择状态',
    'Select start date': '选择开始日期',
    'Select target date': '选择目标日期',
    'Unable to save. Something went wrong.': '无法保存。出错了。',
    'Unable to save:': '无法保存：',
    'Dismiss flash message': '关闭提示',
    ...STATUS_OPTIONS,
    Unsubscribe: '取消订阅',
    // 评论头部的 Spammy 徽章由 common-ui 的全局词条翻译，不收 scoped 副本
    updated: '更新于',
    // 存档项
    'Archived items': '存档项',
    'Issues only': '仅议题',
    'Pull Requests only': '仅拉取请求',
    'Items with open state': '打开状态的项',
    'Items with closed state': '关闭状态的项',
    'Items with merged state': '合并状态的项',
    'Items with draft state': '草稿状态的项',
    'Fields without values': '没有值的字段',
    'Items without an assignee': '没有受理人的项',
    'Toggle select all items': '切换全选',
    'Restore unavailable': '无法恢复',
    'Restoring items...': '正在恢复项...',
    'Deleting items...': '正在删除项...',
    'No archived items': '没有已存档的项',
    'No results matched your filter': '没有与筛选器匹配的结果',
    'Open item actions': '打开项操作',
    Restore: '恢复',
    archived: '存档于',
    restored: '恢复于',
    by: '由',
    // 批量更新 / 导入
    'Bulk update pending': '批量更新等待中',
    'Importing items…': '正在导入项…',
    'Configure workflow': '配置工作流',
    // 日期选择器
    'Open date picker': '打开日期选择器',
    'Selected date': '所选日期',
    'Date Picker': '日期选择器',
    'Go to month': '转到月份',
    'Go to year': '转到年份',
    'Go to previous month': '转到上个月',
    'Go to next month': '转到下个月',
    'Clear selected date': '清除所选日期',
    "Go to today's date": '转到今天',
    'Apply selection and close': '应用并关闭',
    'Choose Date...': '选择日期...',
    'Choose Date': '选择日期',
    'Save Changes?': '保存更改？',
    'You have unsaved changes, would you like to save them?': '有未保存的更改，要保存吗？',
    'Invalid configuration': '配置无效',
    'Invalid date': '日期无效',
    'Invalid selection': '选择无效',
    'Must not fall on a weekend': '不能是周末',
    // 原文 like 前没有逗号，译文改语序不加（与 commits/date-picker.ts 同译）
    'Use arrow keys to select a date, or type a date like "Dec 28, 2020" or "12/28/2020".':
      '用方向键选择日期，或输入如“Dec 28, 2020”或“12/28/2020”的日期。',
    'Type a date, like "Dec 28, 2020" or "12/28/2020".': '输入日期，如“Dec 28, 2020”或“12/28/2020”。',
    'Select a date from the grid.': '从日历中选择日期。',
    'Select a start date from the grid.': '从日历中选择开始日期。',
    'Select an end date from the grid.': '从日历中选择结束日期。',
    '(Today)': '（今天）',
    '(Start of selected range)': '（所选范围开始）',
    '(End of selected range)': '（所选范围结束）',
    '(Inside selected range)': '（在所选范围内）',
    '(Minimum allowed date)': '（允许的最早日期）',
    '(Maximum allowed date)': '（允许的最晚日期）',
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
    // 反馈对话框与错误页
    'Tell us what you liked or what could be better': '告诉我们你喜欢的地方或可改进之处',
    Rating: '评分',
    Message: '消息',
    Send: '发送',
    'Privacy Policy': '隐私政策',
    Hate: '很差',
    Dislike: '不满意',
    Neutral: '一般',
    Like: '满意',
    Love: '很满意',
    'Copy logs to add in feedback': '复制日志以附加到反馈',
    'Copy logs': '复制日志',
    'Failed to copy logs.': '日志复制失败。',
    "Please don't include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our":
      '请勿包含敏感、机密或个人数据。你的反馈将依据以下政策用于改进服务',
    'Please select a rating.': '请选择评分。',
    'An error occurred while submitting your feedback.': '提交反馈时出错。',
    'This project failed to load': '项目加载失败',
    'This page failed to load': '页面加载失败',
    'Stale cache warning': '缓存过期警告',
    'Failed to fetch data.': '数据获取失败。',
    'Reload the page': '重新加载页面'
  },
  regexp: [
    // 添加项
    [/^Showing (\d+) most recent items$/, '显示最近 $1 个项'],
    [
      /^Showing (\d+) most recent items? that (?:has|have) not been added to this project(\. Use search to narrow down this list\.)?$/,
      (_, count: string, hint?: string) => `显示最近 ${count} 个未添加到此项目的项${hint ? '。搜索可缩小范围。' : ''}`
    ],

    // 确认框
    [
      /^Are you sure you want to archive (this item|[\d,]+ items|these [\d,]+ items)\?$/,
      (_, phrase: string) => `确定要存档${itemPhrase(phrase)}吗？`
    ],
    [
      /^Are you sure you want to remove (this item|[\d,]+ items|these [\d,]+ items) from (?:the|this) project\?$/,
      (_, phrase: string) => `确定要从项目中删除${itemPhrase(phrase)}吗？`
    ],
    [/^Archive items?\?$/, '存档项？'],
    [/^Remove items?\?$/, '删除项？'],
    // 目标分组名是用户内容，原文没有引号，译文也不加
    [/^Move items to (.+)\?$/, (_, target: string) => `${joinCjk('将项移到', target)}？`],
    [
      /^Are you sure you want to move (this item|[\d,]+ items) to "(.+)"\?$/,
      (_, phrase: string, target: string) => `确定要将${itemPhrase(phrase)}移到“${target}”吗？`
    ],
    [/^Cannot add (.+)$/, (_, noun: string) => pangu(`无法添加${contentNoun(noun)}`)],
    [/^Pull requests cannot have (.+)$/, (_, noun: string) => pangu(`拉取请求不能有${contentNoun(noun)}`)],
    [/^Convert this draft to an issue to add (.+)$/, (_, noun: string) => pangu(`将此草稿转换为议题后才能添加${contentNoun(noun)}`)],
    [
      /^(.+) cannot be applied to (pull requests|draft issues)$/,
      (_, field: string, target: string) =>
        pangu(`${pluralFieldName(field)}无法应用于${target === 'pull requests' ? '拉取请求' : '草稿议题'}`)
    ],
    [
      /^More than (\d+) cells are selected\. Deselect some cells to perform bulk edits\.$/,
      '已选择超过$1 个单元格。取消选择部分单元格后才能批量编辑。'
    ],
    [/^Unable to assign the following users to the converted issue: (.+)$/, '无法将以下用户分配给转换后的议题：$1'],
    [/^This value must be between (-?\d+) and (-?\d+)$/, '此值必须介于 $1 和 $2 之间'],
    [
      new RegExp(`^(${COLUMN_TYPE_SOURCE}) cannot be deleted$`),
      (_, name: string) => `${COLUMN_TYPE_TEXT[name] ?? translateFieldName(name)}无法删除`
    ],
    [/^Invalid `(.+)`: (.+)\. (.+) are acceptable values for `(.+)`$/, '`$1` 无效：$2。`$4` 的可接受值为 $3'],
    [/^@(.+)'s untitled project$/, '@$1 的未命名项目'],
    [/^(\d+) results?\.$/, '$1 个结果。'],
    [/^(\d+) reviewers?$/, '$1 个审查者'],
    [/^(\d+)% of (\d+)$/, '$2 项中的 $1%'],
    [/^(\d+) of (\d+) completed$/, '已完成 $1/$2'],
    [/^(\d+)% completed$/, '已完成 $1%'],
    [
      /^(.+), status: (\w+)( pull request)?(?:\. sub-issue of (.+)\. Level (\d+))?$/,
      (_, title: string, state: string, pr?: string, parent?: string, level?: string) => {
        const status = `状态：${ITEM_STATES[state.toLowerCase()] ?? state}${pr ? '的拉取请求' : ''}`
        return parent ? `${title}，${status}。${parent} 的子议题。第 ${level} 级` : `${title}，${status}`
      }
    ],
    [new RegExp(`^(${Object.keys(STATE_LABELS).join('|')}), blocked$`), (_, label: string) => `${STATE_LABELS[label] ?? label}，被阻止`],

    // 子议题
    [/^(\d+) sub-issues? not in this project$/, '$1 个子议题不在此项目中'],
    [/^Sub-issues progress: (\d+) of (\d+) \((\d+)%\)$/, '子议题进度：$1/$2 ($3%)'],
    // 议题标题是用户内容，原文没有引号，译文也不加
    [
      /^Sub-issues progress: (\d+) of (\d+) \((\d+)%\)\. Show sub-issues for: (.+)$/,
      (_, completed: string, total: string, percent: string, title: string) =>
        `子议题进度：${completed}/${total} (${percent}%)。${joinCjk(joinCjk('显示', title), '的子议题')}`
    ],

    // 里程碑与状态更新
    [new RegExp(`^Past due by (${DISTANCE_SOURCE})$`), (_, distance: string) => joinCjk('已逾期', translateDistance(distance))],
    [new RegExp(`^Due by (${DATE_SOURCE})$`), (_, date: string) => joinCjk('截止于', translateDate(date) ?? date)],
    // 项目头部状态徽章的 aria-label：原文没有引号、逗号，改语序代替标点
    [
      new RegExp(`^View latest (.+) status updated (${DATE_SOURCE})$`),
      (_, status: string, date: string) =>
        `${joinCjk('查看更新于', translateDate(date) ?? date)}的最新${joinCjk(STATUS_OPTIONS[status] ?? status, '状态')}`
    ],
    [
      new RegExp(`^Updated (less than a minute ago|${RELATIVE_SOURCE})$`),
      (_, time: string) => joinCjk('更新于', time === 'less than a minute ago' ? '不到 1分钟前' : translateTime(time))
    ],
    [/^React with (.+) \((\d+) .+ reactions? so far\)$/, '添加 $1 反应（已有 $2 个）'],

    // 存档项
    [/^All ([\d,]+\+?) items matching query selected$/, '已选择与查询匹配的全部 $1 个项'],
    [/^Select all ([\d,]+\+?) items matching this query$/, '选择与此查询匹配的全部 $1 个项'],
    [/^([\d,]+) items? selected$/, '已选择 $1 个项'],
    [/^([\d,]+)-([\d,]+) of ([\d,]+\+?) items?$/, '共 $3 个项中的第 $1-$2 个'],
    [/^([\d,]+) items? matched your filter$/, '$1 个项与筛选器匹配'],
    [/^This will exceed the ([\d,]+) project item limit$/, '将超出项目 $1 个项的上限'],
    [/^Items without a '(.+)' value$/, (_, name: string) => `没有“${translateFieldName(name)}”值的项`],
    // 存档页查询构建器的筛选建议（Filter for <字段> / Exclude <字段>）：原文没有引号，与 Filter by <字段> 同一写法
    [/^Filter for ([\w-]+(?: [\w-]+){0,3})$/, (_, name: string) => pangu(`按${translateFieldName(name)}筛选`)],
    [/^Exclude ([\w-]+(?: [\w-]+){0,3})$/, (_, name: string) => pangu(`排除${translateFieldName(name)}`)],

    // 批量更新 / 导入（原文没有的逗号不加；导入完成提示里的 – 按破折号译“——”）
    [/^Bulk update in progress (\d+)%$/, '批量更新进行中 $1%'],
    [
      /^Bulk update completed\.(?: (\d+) items? couldn’t be updated and (?:were|was) skipped\.)?$/,
      (_, skipped?: string) => `批量更新已完成。${skipped ? `${skipped} 个项无法更新并已跳过。` : ''}`
    ],
    // 原文没有括号：3 个项批量更新失败。
    [
      /^Bulk update failed(?: for (\d+) items)?\. Please refresh the page and try again\.$/,
      (_, count?: string) => `${count ? `${count} 个项` : ''}批量更新失败。请刷新页面后重试。`
    ],
    [/^Error updating items: Cannot update more than (\d+) items at once$/, '更新项出错：一次最多更新 $1 个项'],
    [/^(\d+)% imported; you may leave this page while we work in the background\.$/, '已导入 $1%；后台导入期间可离开此页面。'],
    [
      /^Import complete\.(?: (\d+) items? failed to import\.)?( Now running setup workflows – this may take a few minutes\.)?( Keep this project up to date by automatically adding new items matching your filters\.)?$/,
      (_, failed?: string, workflows?: string, hint?: string) =>
        `导入完成。${failed ? `${failed} 个项导入失败。` : ''}${workflows ? '正在运行设置工作流——可能需要几分钟。' : ''}${hint ? '通过自动添加与筛选器匹配的新项保持项目最新。' : ''}`
    ],
    [/^Failed to add items from your repository\. (\d+) items? failed to import\.$/, '无法从存储库添加项。$1 个项导入失败。'],

    // 日期选择器与日期
    [/^Week (\d+)$/, '第 $1 周'],
    [/^Must be on or after (.+)$/, (_, date: string) => joinCjk('不能早于', translateDate(date) ?? date)],
    [/^Must be on or before (.+)$/, (_, date: string) => joinCjk('不能晚于', translateDate(date) ?? date)],
    [
      /^(.+) - Open date picker \(currently selected: (.+)\)$/,
      (_, field: string, date: string) => `${translateFieldName(field)} - 打开日期选择器（当前：${translateDate(date) ?? date}）`
    ],
    [/^(.+) - Choose date\.\.\.$/, (_, field: string) => `${translateFieldName(field)} - 选择日期...`],
    [
      new RegExp(
        `^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (${MONTH_SOURCE} \\d{1,2})((?: \\((?:${DAY_NOTE_SOURCE})\\))*)$`
      ),
      (_, weekday: string, date: string, notes: string) =>
        `${translateDate(date) ?? date}${WEEKDAYS_LONG[weekday] ?? ''}${translateDayNotes(notes)}`
    ],
    [new RegExp(`^(${DATE_SOURCE})$`), (_, date: string) => translateDate(date) ?? date],
    [/^Please keep your feedback within (\d+) characters or less\.$/, '反馈请控制在 $1 个字符以内。']
  ],
  inline: [
    // 拖入里程碑 / 议题类型分组的提示框（get-group-update-validation.tsx，宿主是 AlertDialog 正文 div）：
    // Please create the <code>里程碑</code> milestone in the <a>owner/repo</a> repository before adding to this milestone group.
    // 槽位顺序不能变，改语序：<里程碑> 里程碑需先在 <存储库> 存储库中创建（原文没有逗号，译文不加）
    [
      'Please create the {} milestone in the {} repository before adding to this milestone group.',
      '{} 里程碑需先在 {} 存储库中创建才能添加到此里程碑分组。'
    ],
    // There is no <code>类型</code> issue type in the <a>组织</a> organization.
    ['There is no {} issue type in the {} organization.', '{} 议题类型在 {} 组织中不存在。'],
    // 拖入存储库分组的提示框：<div>You can transfer this issue to a different repository from the&nbsp;<a>issue page</a>.</div>
    ['You can transfer this issue to a different repository from the {}.', '可从{}将此议题转移到其他存储库。'],
    // 添加项建议列表的“Add items from <span>owner/repo</span>”槽位后没有文本节点，译文无法把存储库名移到句中，
    // 仍按 scoped 片段“从以下存储库添加项”翻译
    // 侧边面板没有存储库建议时的空状态（item-suggestions-list.tsx）：<p>Create a <a>repository</a> to get started.</p>
    ['Create a {} to get started.', '创建{}以开始使用。']
  ]
} satisfies PageDictionary
