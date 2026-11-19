import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 列表项状态图标的无障碍描述 */
const ITEM_STATUS: Readonly<Record<string, string>> = {
  Open: '打开',
  'Closed (completed)': '已关闭（已完成）',
  'Not planned (skipped)': '未计划（已跳过）',
  'Duplicate of an existing item': '与已有条目重复',
  'Merged (completed)': '已合并（已完成）',
  'In merge queue': '在合并队列中',
  'Open (in progress)': '打开（正在进行）',
  'Closed (abandoned)': '已关闭（已放弃）',
  'Draft (not ready)': '草稿（未就绪）',
  'Archived (abandoned)': '已存档（已放弃）'
}

const ITEM_STATUS_SOURCE = Object.keys(ITEM_STATUS)
  .map(status => status.replace(/[()]/g, '\\$&'))
  .join('|')

/** 排序字段（按钮文字与菜单项） */
const SORT_FIELD: Readonly<Record<string, string>> = {
  Newest: '最新',
  Oldest: '最早',
  Updated: '更新时间',
  Comments: '评论数',
  'Best match': '最佳匹配',
  'Created on': '创建时间',
  'Last updated': '最后更新',
  'Total comments': '评论总数',
  Reactions: '反应',
  'Total reactions': '反应总数',
  'Thumbs up': '👍',
  'Thumbs down': '👎',
  Laugh: '😄',
  Hooray: '🎉',
  Confused: '😕',
  Rocket: '🚀',
  Eyes: '👀',
  Heart: '❤️'
}

const SORT_FIELD_SOURCE = Object.keys(SORT_FIELD).join('|')

/** 中文、日文假名、谚文 */
const CJK_LETTER_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]/
/** 空白、全角标点、弯引号、省略号、破折号：两侧不加空格 */
const TIGHT_RE = /[\s\u2014\u2018\u2019\u201c\u201d\u2026\u3000-\u303f\uff00-\uffef]/

/** 交界处的字符与中文相接时要隔开：英文、数字、表情符号、半角标点 */
function apart(char: string | undefined): boolean {
  return char !== undefined && !CJK_LETTER_RE.test(char) && !TIGHT_RE.test(char)
}

/**
 * 中文与用户内容（标题、标签名、字段名、视图名、状态名）拼接，议题词典各文件共用。用户内容原文不加引号，译文也不加；
 * 与英文、数字、表情符号、半角标点相接时留一个空格，与中文、全角标点相接时直接相连
 * （按标签 good first issue 筛选、按标签缺陷筛选、通过移至 ✅ Done、查看 [Bug] Fix login）
 */
export function joinName(left: string, right: string): string {
  const end = left.at(-1)
  const start = right.at(0)
  const spaced =
    (end !== undefined && CJK_LETTER_RE.test(end) && apart(start)) || (start !== undefined && CJK_LETTER_RE.test(start) && apart(end))
  return spaced ? `${left} ${right}` : `${left}${right}`
}

/** 按 X 排序 / 按 X 降序排序 / 按 X 降序排列：原文无标点，译文不加冒号、逗号；表情符号两侧留空格 */
function sortBy(field: string, suffix: string, verb = '排序'): string {
  return joinName(joinName('按', SORT_FIELD[field] ?? field), `${suffix}${verb}`)
}

/** 选择计数中的条目单位 */
const UNIT: Readonly<Record<string, string>> = {
  issue: '议题',
  issues: '议题',
  'pull request': '拉取请求',
  'pull requests': '拉取请求',
  'issue or pull request': '议题或拉取请求',
  'issues and pull requests': '议题和拉取请求',
  // 与通用词典的 list item → 列表项一致
  'list item': '列表项',
  'list items': '列表项'
}

const UNIT_SOURCE = Object.keys(UNIT)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 全选勾选框标签中的条目名（复数） */
const SELECT_ALL_UNIT: Readonly<Record<string, string>> = {
  issues: '议题',
  'pull requests': '拉取请求',
  'list items': '列表项'
}

/** 链接的拉取请求的状态 */
const PR_STATE: Readonly<Record<string, string>> = {
  Open: '打开',
  Closed: '已关闭',
  Merged: '已合并',
  Draft: '草稿',
  'State unavailable': '状态不可用'
}

const PR_STATE_SOURCE = Object.keys(PR_STATE).join('|')

/** 看板列 “No 字段” 中的字段名 */
const BOARD_FIELD: Readonly<Record<string, string>> = {
  Status: '状态',
  Assignees: '受理人',
  Assignee: '受理人',
  Labels: '标签',
  Milestone: '里程碑',
  Type: '类型',
  'Issue type': '议题类型',
  Project: '项目',
  Priority: '优先级',
  Repository: '存储库',
  Author: '作者'
}

const BOARD_FIELD_SOURCE = Object.keys(BOARD_FIELD).join('|')

/** 批量标记的已读状态 */
const READ_STATE: Readonly<Record<string, string>> = { read: '已读', unread: '未读' }

/** 看板卡片父议题的状态（读屏）：(Open) */
const PARENT_STATE: Readonly<Record<string, string>> = {
  Open: '打开',
  Closed: '已关闭',
  Completed: '已完成',
  'Not planned': '未计划',
  Duplicate: '重复'
}

/** 智能体会话耗时单位 */
const ELAPSED_UNIT: Readonly<Record<string, string>> = { d: '天', h: '小时', m: '分钟', s: '秒' }

/** 智能体会话状态动词 */
const SESSION_VERB: Readonly<Record<string, string>> = { Running: '已运行', Ran: '运行了', Active: '活跃了' }

const ELAPSED_SOURCE = '\\d+[dhms](?: \\d+[dhms])?'

/** 耗时：数字与单位之间、各段之间都留空格（2h 3m → 2 小时 3 分钟） */
function elapsed(text: string): string {
  return text.replace(/(\d+)([dhms])/g, (_, value: string, unit: string) => `${value}${ELAPSED_UNIT[unit] ?? unit}`)
}

/** 前缀 + 位于 A 和 B 之间：条目标题是用户内容，不加引号；与中文之间按 joinName 留空格 */
function between(prefix: string, first: string, second: string): string {
  return joinName(joinName(joinName(joinName(prefix, first), '和'), second), '之间')
}

/**
 * 议题列表：存储库议题列表（React）与 /issues 共用的列表外壳、列表项、空状态、批量操作、
 * 置顶议题、视图选项与看板布局、拖放排序、首次贡献横幅。
 */
export default {
  static: {
    // 头部与侧栏
    'Search Issues': '搜索议题',
    'Search issues': '搜索议题',
    'Search Issues and PRs': '搜索议题和拉取请求',
    'Search PRs': '搜索拉取请求',
    'Issue list': '议题列表',
    'Navigation sidebar': '导航侧栏',
    'Open Issues sidebar navigation': '打开议题侧栏导航',
    'Issues navigation': '议题导航',
    'Open views': '打开视图列表',
    'Pinned views': '置顶视图',
    'All views': '全部视图',
    'Default views': '默认视图',
    'Untitled view': '未命名视图',
    'Private preview': '私密预览',
    'Issues display density': '议题显示密度',
    // /issues 仪表板“提及我的”视图的说明
    'Issues mentioning you': '提及你的议题',

    // 列表控件
    'Filter issues by state': '按状态筛选议题',
    'Issue list controls': '议题列表控件',
    // 操作栏溢出菜单：More + 操作栏名称
    'More Issue list controls': '更多议题列表控件',
    'More Issue actions': '更多议题操作',
    'Bulk actions': '批量操作',
    'Sort by reactions': '按反应排序',
    'Updating issues': '正在更新议题',
    'Loading issues': '正在加载议题',
    'Saved view issues results': '视图中的议题结果',
    'Unable to refresh issues': '无法刷新议题',
    'Unable to refresh issues.': '无法刷新议题。',
    'Unable to refresh issues. Showing previously loaded results.': '无法刷新议题。显示的是之前加载的结果。',
    'Showing previously loaded results.': '显示的是之前加载的结果。',
    'View issue': '查看议题',
    'Loading issue': '正在加载议题',

    // 列表项
    'Closed issue (completed)': '已关闭的议题（已完成）',
    'Closed issue (not planned)': '已关闭的议题（未计划）',
    'Blocked, filter by blocked issues': '被阻止，筛选被阻止的议题',
    'sub-issues summary': '子议题摘要',
    '1 linked PR': '1 个链接的拉取请求',
    'Pull request link unavailable': '拉取请求链接不可用',
    'New activity.': '有新动态。',
    'list item action bar': '列表项操作栏',
    'Learn more about searching and filtering issues and pull requests.': '了解如何搜索和筛选议题与拉取请求。',
    'Search for issues.': '搜索议题。',
    'No issues matched your search': '没有匹配的议题',
    'No more issues': '没有更多议题',
    'Failed to load issues. Try refreshing the page.': '加载议题失败。请刷新页面。',
    'More issues available': '还有更多议题',
    'Issue options': '议题选项',

    // 空状态：To get started, you should <create an issue>.
    'Welcome to issues!': '欢迎使用议题！',
    'Issues are used to track todos, bugs, feature requests, and more. As issues are created, they’ll appear here in a searchable and filterable list. To get started, you should':
      '议题用于跟踪待办事项、缺陷、功能请求等。创建的议题会显示在这里，可供搜索和筛选。开始使用，你可以',
    "Issues are used to track todos, bugs, feature requests, and more. As issues are created, they'll appear here in a searchable and filterable list. To get started, you should":
      '议题用于跟踪待办事项、缺陷、功能请求等。创建的议题会显示在这里，可供搜索和筛选。开始使用，你可以',
    'create an issue': '创建议题',
    'There aren’t any open issues.': '没有打开的议题。',
    "There aren't any open issues.": '没有打开的议题。',
    'Try adjusting your search filters.': '请尝试调整搜索筛选器。',
    'We encountered an error trying to load issues.': '加载议题时出错。',

    // 置顶议题
    'Pinned issues': '置顶议题',
    'Drag and drop pinned issues list.': '可拖放的置顶议题列表。',
    'Advanced move...': '高级移动...',
    'Could not reorder pinned issues. Please try again.': '无法调整置顶议题顺序。请重试。',
    'Could not unpin issue. Please try again.': '无法取消置顶议题。请重试。',

    // 首次贡献横幅
    'Dismiss for this repository only': '仅在此存储库中关闭',
    'Dismiss for all repositories': '在所有存储库中关闭',
    'If you have a bug or an idea, read the': '如果你发现了缺陷或有新想法，请在打开议题前阅读',
    'contributing guidelines': '贡献指南',
    'before opening an issue.': '。',
    "If you're ready to tackle some open issues,": '如果你准备好处理一些打开的议题，',
    'If you’re ready to tackle some open issues,': '如果你准备好处理一些打开的议题，',
    "we've collected some good first issues for you.": '我们为你挑选了一些适合新手的议题。',
    'we’ve collected some good first issues for you.': '我们为你挑选了一些适合新手的议题。',
    'First-time contribution banner dismissed': '已关闭首次贡献横幅',
    // 经典横幅（无贡献指南时）：… You can also take a look at the <Open Source Guide>. … <we've collected some good first issues for you>.
    'If you have a bug or an idea, browse the open issues before opening a new one. You can also take a look at the':
      '如果你发现了缺陷或有新想法，请先浏览打开的议题，再打开新议题。你也可以查看',
    'Open Source Guide': '开源指南',
    'Learn about Open Source and how to contribute': '了解开源以及如何参与贡献',
    "we've collected some good first issues for you": '我们为你挑选了一些适合新手的议题',
    'we’ve collected some good first issues for you': '我们为你挑选了一些适合新手的议题',
    // 维护者横幅（议题列表与拉取请求列表共用，放 static）：
    // Now, GitHub will help potential first-time contributors <discover issues> labeled with <good first issue>
    // 标签名固定在句末：链接只译“发现”，labeled with 补出“议题”（原文无标点，不加冒号），
    // 读作“…发现 带有以下标签的议题 good first issue”
    'Label issues and pull requests for new contributors': '为议题和拉取请求添加面向新贡献者的标签',
    'Now, GitHub will help potential first-time contributors': '现在，GitHub 将帮助潜在的首次贡献者',
    'discover issues': '发现',
    'labeled with': '带有以下标签的议题',

    // 批量操作
    'Apply issue type': '应用议题类型',
    'Bulk update had an error': '批量更新出错',
    'Bulk update is pending': '批量更新等待中',
    'Bulk update completed successfully': '批量更新已完成',
    'Bulk update completed with errors': '批量更新已完成但有错误',
    'Bulk update failed': '批量更新失败',
    'Issues updated, but the results could not be refreshed': '议题已更新，但无法刷新结果',
    'Could not update issues': '无法更新议题',
    'Failed to load projects': '加载项目失败',
    'Select issues individually to change read state': '请逐个选择议题以更改已读状态',
    'Read state updated, but the results could not be refreshed': '已读状态已更新，但无法刷新结果',
    'Could not update read state': '无法更新已读状态',
    'The update timed out, but some changes might have been applied. Refresh the page before trying again.':
      '更新超时，但部分更改可能已生效。请刷新页面后再重试。',

    // 侧边面板
    'Could not delete the issue. The issue was restored. Please try again.': '无法删除议题。议题已恢复。请重试。',
    'The issue was deleted, but the dashboard could not be refreshed. Reload the page to recover.':
      '议题已删除，但无法刷新仪表板。请重新加载页面。',
    'Issue deletion failed': '议题删除失败',
    'Issue deleted; refresh failed': '议题已删除，刷新失败',
    'Could not delete the issue. The sub-issue was restored. Please try again.': '无法删除议题。子议题已恢复。请重试。',
    'The issue was deleted, but this page could not be refreshed. Reload the page to recover.':
      '议题已删除，但无法刷新此页面。请重新加载页面。',

    // 视图选项
    'View options': '视图选项',
    'Unable to load view options': '无法加载视图选项',
    'Loading view options': '正在加载视图选项',
    'Swimlane by': '泳道分组依据',
    'View options have unsaved changes': '视图选项有未保存的更改',
    'Close view options': '关闭视图选项',
    'Unsaved layout changes': '布局有未保存的更改',

    // 看板
    'Nothing to group by': '没有可分组的字段',
    'Choose a field to group by to see this view as a board.': '选择一个分组字段，以看板形式查看此视图。',
    'Could not move this item. Please try again.': '无法移动此条目。请重试。',
    'Initializing session': '正在初始化会话',
    'Could not check for this issue': '无法检查此议题',
    'Not available for this issue': '此议题不可用',
    'Assign to agent': '分配给智能体',
    'More labels': '更多标签',
    'Link copied.': '链接已复制。',
    'Could not copy link.': '无法复制链接。',
    "Some cards couldn't load all details.": '部分卡片无法加载全部详细信息。',
    'Some cards couldn’t load all details.': '部分卡片无法加载全部详细信息。',
    'Unable to load all details.': '无法加载全部详细信息。',
    'Could not load more board groups. Try again.': '无法加载更多看板分组。请重试。',
    'Too many board groups are loaded to continue. Narrow the view and try again.':
      '已加载的看板分组过多，无法继续。请缩小视图范围后重试。',
    'Could not load more board groups.': '无法加载更多看板分组。',
    'Could not load more cards. Try again.': '无法加载更多卡片。请重试。',
    'You do not have permission to move this item.': '你没有移动此条目的权限。',
    'Wait for this item’s last move to finish before moving it again.': '请等待此条目的上一次移动完成后再移动。',
    "Wait for this item's last move to finish before moving it again.": '请等待此条目的上一次移动完成后再移动。',
    'Moved. This item no longer matches this view and will not appear on the next refresh.':
      '已移动。此条目不再符合此视图，刷新后将不再显示。',
    'You cannot move this item.': '你无法移动此条目。',

    // 拖放与键盘移动
    'How to move objects via keyboard': '如何使用键盘移动对象',
    'This navigation is only available when move mode is activated.': '此导航仅在启用移动模式时可用。',
    'Keyboard Shortcut': '键盘快捷方式',
    'Move selected items': '移动所选条目',
    'Move selected item': '移动所选条目',
    'Missing selection': '未选择条目',
    'The first item you selected cannot be deselected when performing a move.': '执行移动时，无法取消选择第一个选中的条目。',
    'I understand': '我已了解',
    'First item in list.': '列表中的第一项。',
    'Last item in list.': '列表中的最后一项。',
    'Move item one position': '将条目移动一个位置',
    'Cancel drag mode': '取消拖动模式',
    'Place item': '放置条目',
    'Entry must be greater than 0.': '输入值必须大于 0。',
    'Entry is required.': '必须输入值。',
    'Entry is invalid.': '输入值无效。',
    'Move item before': '将条目移到前面',
    'Move item after': '将条目移到后面',
    'Move to position': '移动到指定位置'
  },
  scoped: {
    // 头部与侧栏
    'Issue filters': '议题筛选器',
    'Issues sidebar navigation': '议题侧栏导航',
    // /issues 仪表板的筛选区域（landmark）
    'Filter issues': '筛选议题',
    'List view': '列表视图',
    Pages: '页面',
    Views: '视图',
    'Assigned to me': '分配给我的',
    'Created by me': '我创建的',
    Mentioned: '提及我的',
    'Mentioning me': '提及我的',
    'Involves me': '与我有关',
    'Recent activity': '最近活动',
    "What's new": '新功能',
    'What’s new': '新功能',

    // 筛选按钮（Filter by label、Filter by project 见 filter.ts，Labels 见 metadata.ts）
    Milestones: '里程碑',
    Types: '类型',
    'Filter by milestone': '按里程碑筛选',
    'Filter by assignees': '按受理人筛选',
    'Filter by assignee': '按受理人筛选',
    'Filter by issue type': '按议题类型筛选',

    // 列表控件
    Density: '密度',
    Compact: '紧凑',
    'Comfortable display density': '宽松显示密度',
    'Compact display density': '紧凑显示密度',
    'Sort…': '排序…',
    Order: '顺序',
    ascending: '升序',
    descending: '降序',
    Updated: '更新时间',
    'Created on': '创建时间',
    'Last updated': '最后更新',
    'Total comments': '评论总数',
    'Best match': '最佳匹配',
    'Total reactions': '反应总数',
    // 反应排序项（Thumbs up、Thumbs down 由通用词典处理）
    Laugh: '大笑',
    Hooray: '欢呼',
    Confused: '困惑',
    Rocket: '火箭',
    Eyes: '眼睛',
    Heart: '爱心',
    'Most commented': '评论最多',
    'Least commented': '评论最少',
    'Most reactions': '反应最多',
    // 已读状态（Unread 见 filter.ts）
    Read: '已读',

    // 批量操作
    'Mark as': '标记为',
    'Apply labels': '应用标签',
    Assign: '分配',
    'Apply assignees': '应用受理人',
    'Apply milestone': '应用里程碑',
    'Add to projects': '添加到项目',

    // 列表项（/issues 仪表板的拉取请求列表另有 was merged，后接时间元素）
    'Open issue': '打开的议题',
    by: '由',
    'was closed': '关闭于',
    'was merged': '合并于',
    '· Updated': '· 更新于',
    '· Duplicate': '· 重复',
    'more label': '个其他标签',
    'more labels': '个其他标签',
    'Only the first': '仅显示前',
    'linked pull requests are shown.': '个链接的拉取请求。',
    'State unavailable': '状态不可用',
    // 列表项勾选框的无障碍名称前缀（标题为空时）；只剩说明的 More information available below. 由通用词典处理
    'Select:': '选择：',

    // 空状态（Something went wrong 由通用词典处理）
    'Invalid query': '查询无效',
    'Visit a lower page.': '请访问前面的页面。',
    'Try a different search query.': '请尝试其他搜索词。',
    'Enter a query to start searching.': '输入查询以开始搜索。',
    'Learn more about searching and filtering': '了解搜索与筛选',
    'All caught up': '全部处理完毕',
    'Try a new search': '尝试新的搜索',
    'Try refreshing the page.': '请刷新页面。',
    'Reload page': '重新加载页面',

    // 视图选项（Table 由通用词典处理）
    List: '列表',
    Board: '看板',
    Layout: '布局',
    'Column by': '分列依据',
    'Group by': '分组依据',
    Configuration: '配置',
    'Unsaved changes': '未保存的更改',
    'No value': '无值',

    // 看板卡片：智能体会话、日期令牌、父议题、存储库图标（公共/专用存储库与“在新标签页中打开”由通用词典处理）
    'In progress': '正在进行',
    Complete: '已完成',
    'Created:': '创建时间：',
    'Updated:': '更新时间：',
    'Closed:': '关闭时间：',
    'Parent issue:': '父议题：',
    'Archived repository': '已存档的存储库',
    'Forked repository': '复刻的存储库',

    // 拖放（读屏说明三句随原文分句，与 projects/views.ts 同一句式）
    Action: '操作',
    Item: '条目',
    'Item(s)': '条目',
    'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.':
      '按空格键拿起可拖动的条目。拖动时用方向键移动条目。再按空格键将条目放到新位置，或按 Esc 取消。'
  },
  regexp: [
    // 全选读屏：3 issues of 25 selected（与通用词典的“25 个列表项中已选择 3 个”同一写法；
    // 1,234 results、3 selected、3 of 25 selected 由通用词典处理）
    [
      new RegExp(`^([\\d,]+) (${UNIT_SOURCE}) (?:of ([\\d,]+) )?selected$`),
      (_, count, unit, total) =>
        total ? `${total} 个${UNIT[unit] ?? unit}中已选择 ${count} 个` : `已选择 ${count} 个${UNIT[unit] ?? unit}`
    ],
    // 计数在独立节点中时的后半段：<3> of 25 selected（原文无标点，不加逗号）
    [/^of ([\d,]+) selected$/, '/$1 已选择'],
    // 排序按钮：Sort by Newest descending → 按最新降序排序（与 pulls、organization 同一写法）
    [
      new RegExp(`^Sort by (${SORT_FIELD_SOURCE}) (ascending|descending)$`),
      (_, field, direction) => sortBy(field, direction === 'ascending' ? '升序' : '降序')
    ],
    [new RegExp(`^Sort by (${SORT_FIELD_SOURCE})$`), (_, field) => sortBy(field, '')],
    // 读屏摘要：12 issues found. List is sorted by Last updated in descending order.
    [
      new RegExp(
        `^([\\d.,]+k?) (issues?|pull requests?|results?) found\\. List is sorted by (${SORT_FIELD_SOURCE}) in (ascending|descending) order\\.$`
      ),
      (_, count, noun, field, direction) =>
        `找到 ${count} 个${/^issue/.test(noun) ? '议题' : /^pull/.test(noun) ? '拉取请求' : '结果'}。${sortBy(field, direction === 'ascending' ? '升序' : '降序', '排列')}。`
    ],
    // 分页播报（原文无标点，译文不加括号、逗号）
    [/^Page (\d+) of (\d+) loaded with (\d+) items$/, '第 $1/$2 页已加载 $3 个条目'],
    // 列表项状态图标
    [new RegExp(`^Status: (${ITEM_STATUS_SOURCE})\\.$`), (_, status) => `状态：${ITEM_STATUS[status] ?? status}。`],
    // 列表项的无障碍名称：[Selected. ]标题[. New activity]. More information available below.
    // （原文状态后是句号，不改冒号；与 pulls 的“已选择。<标题>。”同一写法）
    [
      /^(Selected\. )?(.+?)(\. New activity)?\. More information available below\.$/,
      (_, selected, title, activity) => `${selected ? '已选择。' : ''}${title}${activity ? '。有新动态' : ''}。更多信息见下方。`
    ],
    [/^Select: (.+)$/, '选择：$1'],
    [/^Selected\. (.+)\.$/, '已选择。$1。'],
    [/^Unselected\. (.+)\.$/, '未选择。$1。'],
    // 全选勾选框的标签（读屏）：Select all issues: <列表标题>
    [/^Select all (issues|pull requests|list items):(?: (.+))?$/, (_, unit, title) => `全选${SELECT_ALL_UNIT[unit] ?? unit}：${title}`],
    // 列表项元数据（12 comments 由通用词典处理）
    [
      /^([\d,]+) (Total reactions|Thumbs up|Thumbs down|Laugh|Hooray|Confused|Rocket|Eyes|Heart) reactions?$/,
      (_, count, label) => (label === 'Total reactions' ? `${count} 个反应` : `${count} 个 ${SORT_FIELD[label] ?? label} 反应`)
    ],
    [/^(\d+) \/ (\d+) sub-issues completed, filter by parent issue ([\w.-]+\/[\w.-]+#\d+)$/, '已完成 $1/$2 个子议题，按父议题 $3 筛选'],
    [/^Filter by author (\S+)$/, '按作者 $1 筛选'],
    [/^Filter by assignee (\S+)$/, '按受理人 $1 筛选'],
    // 标签名是用户内容，两侧不加引号
    [/^Filter by label (.+)$/, (_, name) => joinName(joinName('按标签', name), '筛选')],
    [/^Filter by repository ([\w.-]+\/[\w.-]+)$/, '按存储库 $1 筛选'],
    // 议题字段徽章：Filter by Priority: High → 按 Priority 为 High 筛选（字段名、取值不加引号）
    [/^Filter by ([^:]+): (.+)$/, (_, field, value) => joinName(joinName(joinName(joinName('按', field), '为'), value), '筛选')],
    [/^Show (\d+) more issue field values?$/, '再显示 $1 个议题字段值'],
    [/^\+(\d+), show all (\d+) assignees$/, '+$1，显示全部 $2 个受理人'],
    [/^Milestone: (.+)$/, '里程碑：$1'],
    [/^View ([\w-]+(?:\[bot\])?)'s profile$/, '查看 $1 的个人资料'],
    // 链接的拉取请求
    [
      new RegExp(`^1 linked pull request (\\S*#\\d+)(?:: (.+))?, (${PR_STATE_SOURCE})$`),
      (_, reference, title, state) => `1 个链接的拉取请求 ${reference}${title ? `：${title}` : ''}，${PR_STATE[state] ?? state}`
    ],
    [/^([\d,]+) linked pull requests?$/, '$1 个链接的拉取请求'],
    [/^([\d,]+) linked pull requests, showing first (\d+)$/, '$1 个链接的拉取请求，显示前 $2 个'],
    [/^([\d,]+) linked PRs$/, '$1 个链接的拉取请求'],
    [/^Only the first (\d+) of ([\d,]+) linked pull requests are shown\.$/, '仅显示 $2 个链接的拉取请求中的前 $1 个。'],
    [new RegExp(`^(\\S*#\\d+) · (${PR_STATE_SOURCE})$`), (_, reference, state) => `${reference} · ${PR_STATE[state] ?? state}`],
    [/^link to the pull request #(.+)$/, '指向拉取请求 #$1 的链接'],
    [/^link to the issue #(.+)$/, '指向议题 #$1 的链接'],
    // 结果上限横幅
    [
      /^Showing the first ([\d,]+) (issues|pull requests)\. To view additional \2, please refine your search\.$/,
      (_, count, noun) => {
        const name = noun === 'issues' ? '议题' : '拉取请求'
        return `仅显示前 ${count} 个${name}。如需查看更多${name}，请细化搜索条件。`
      }
    ],
    // /issues 仪表板收件箱空状态
    [
      /^When an? (issue|pull request) needs your review or attention, it[’']ll appear here\.$/,
      (_, noun) => `需要你审查或关注的${noun === 'issue' ? '议题' : '拉取请求'}会显示在这里。`
    ],
    // 置顶议题
    [/^Pinned issue #(\d+) options$/, '置顶议题 #$1 的选项'],
    // 取消置顶按钮的无障碍名称：Unpin issue #12, <标题>（逗号随原文，不改成冒号）
    [/^Unpin issue #(\d+), (.+)$/, '取消置顶议题 #$1，$2'],
    // 首次贡献横幅
    [/^👋 Want to contribute to ([\w.-]+\/[\w.-]+)\?$/, '👋 想为 $1 做贡献吗？'],
    // 批量更新
    [
      /^Bulk update is in progress (\d+) %(?: \((\d+) issues failing to update\))?$/,
      (_, percent, failed) => `批量更新进行中 ${percent}%${failed ? `（${failed} 个议题更新失败）` : ''}`
    ],
    [/^\((\d+) issues failing to update\)$/, '（$1 个议题更新失败）'],
    [/^Could not update (\d+) of (\d+) issues$/, '$2 个议题中有 $1 个无法更新'],
    [/^(\d+) issues? updated$/, '已更新 $1 个议题'],
    [/^Updating (\d+) issues?$/, '正在更新 $1 个议题'],
    [/^(\d+) issues? marked as (read|unread)$/, (_, count, state) => `已将 ${count} 个议题标记为${READ_STATE[state] ?? state}`],
    [/^Marking (\d+) issues? as (read|unread)$/, (_, count, state) => `正在将 ${count} 个议题标记为${READ_STATE[state] ?? state}`],
    [/^Select at most (\d+) issues to change read state$/, '最多选择 $1 个议题以更改已读状态'],
    [/^Select between 1 and ([\d,]+) issues$/, '请选择 1 到 $1 个议题'],
    // 看板卡片
    [/^Author: (.+)$/, '作者：$1'],
    [/^Assignee: (.+)$/, '受理人：$1'],
    [/^Type: (.+)$/, '类型：$1'],
    [/^Sub-issues progress: (\d+) \/ (\d+) completed$/, '子议题进度：已完成 $1/$2'],
    // 卡片标签溢出提示：bug, docs and 2 more（反应提示 Reacted by … 与“, and 2 more”由通用词典处理）
    [/^(?!Reacted by |, )(.+) and (\d+) more$/, '$1 及另外 $2 个'],
    [new RegExp(`^No (${BOARD_FIELD_SOURCE})$`), (_, field) => `无${BOARD_FIELD[field] ?? field}`],
    [/^\((Open|Closed|Completed|Not planned|Duplicate)\)$/, (_, state) => `（${PARENT_STATE[state] ?? state}）`],
    // 看板卡片的智能体会话
    [/^Open (Copilot|Claude|Codex) session$/, '打开 $1 会话'],
    [/^(Copilot|Claude|Codex) session(:?)$/, (_, agent, colon) => `${agent} 会话${colon ? '：' : ''}`],
    [
      new RegExp(`^(.+?) · Updated (${ELAPSED_SOURCE}) ago · (Running|Ran|Active) for (${ELAPSED_SOURCE})$`),
      (_, head, updated, verb, duration) =>
        `${head} · ${joinCjk(elapsed(updated), '前更新')} · ${joinCjk(SESSION_VERB[verb] ?? verb, elapsed(duration))}`
    ],
    // 拖放播报（条目标题是用户内容，原文无引号，译文不加；标题与中文之间按 joinName 留空格）
    [/^Moving (.+)\.$/, (_, title) => `${joinName('正在移动', title)}。`],
    [/^Between (.+) and (.+)\.$/, (_, first, second) => `${between('位于', first, second)}。`],
    [/^Cancel moving (.+) and (\d+) other items$/, (_, title, count) => joinName(joinName('取消移动', title), `及其他 ${count} 个条目`)],
    [/^Cancel moving (.+)$/, (_, title) => joinName('取消移动', title)],
    [/^(.+) successfully moved to first item in list\.$/, (_, title) => `${joinName(title, '已移到列表第一项')}。`],
    [/^(.+) successfully moved to last item in list\.$/, (_, title) => `${joinName(title, '已移到列表最后一项')}。`],
    [
      /^(.+) successfully moved between (.+) and (.+)\.$/,
      (_, title, first, second) => `${between(joinName(title, '已移到'), first, second)}。`
    ],
    [/^(.+) (?:did not move|not moved)\.$/, (_, title) => `${joinName(title, '未移动')}。`],
    [/^Entry must be less than or equal to (\d+)\.$/, '输入值必须小于或等于 $1。'],
    [/^(.+) will be moved\.\.\.$/, (_, title) => `${joinName(title, '将被移动')}...`],
    [/^(.+) will not be moved\.$/, (_, title) => `${joinName(title, '不会被移动')}。`],
    [/^(.+) will be first item in the list\.$/, (_, title) => `${joinName(title, '将成为列表第一项')}。`],
    [/^(.+) will be last item in the list\.$/, (_, title) => `${joinName(title, '将成为列表最后一项')}。`],
    [/^(.+) will be between (.+) and (.+)\.$/, (_, title, first, second) => `${between(joinName(title, '将位于'), first, second)}。`],
    [/^(.+) cannot be moved to an invalid position\.$/, (_, title) => `${joinName(title, '无法移到无效位置')}。`],
    // 兜底（放在最后，具体规则优先）：已存档标签的无障碍名称、看板泳道的折叠按钮、看板卡片的操作菜单
    // （标签名、分组值、卡片标题是用户内容，原文无标点，译文不加冒号、引号）
    [/^Archived (.+)$/, (_, name) => joinName('已存档', name)],
    [/^(Collapse|Expand) (.+)$/, (_, action, name) => joinName(action === 'Collapse' ? '折叠' : '展开', name)],
    // 评论的操作按钮（Actions for octocat's comment, …）由通用词典处理
    [/^Actions for (?!.*['’]s (?:comment|reply), )(.+)$/, (_, name) => joinName(name, '的操作')]
  ],
  attributeRules: [
    // 置顶议题卡片的标题链接：aria-label="View <议题标题>"（PinnedIssueCard：
    // div[class*="PinnedIssueContainer__"] > div > div[class*="titleOptionsContainer__"] > a）。
    // 标题原样保留；选择器不依赖 aria-label 的取值，同容器内的选项按钮是 button，不受影响
    [
      '[class*="PinnedIssueContainer__"] [class*="titleOptionsContainer__"] > a',
      'aria-label',
      /^View (.+)$/,
      (_, title) => joinName('查看', title)
    ]
  ]
} satisfies PageDictionary
