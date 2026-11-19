import type { InlineRule, PageDictionary, RegExpRule } from '../../../core/types'
import { VALIDATION_FIELD_SOURCE } from '../common-ui/validation'
import { joinCjk } from '../helpers'

/**
 * 筛选框 label: 的取值建议（建议项 aria-label 为“名称, Label”，译后为“名称，标签”）：标签名是用户内容，只忽略名称；
 * 界面取值（Open、Closed 等）照常翻译。无值、有值两项 No label、Has label 的 aria-label 同样以“, Label”结尾
 * （“No Label, Label”“Has Label, Label”，译后为“无标签，标签”“有标签，标签”），按原文与译文全等排除。
 * 拉取请求列表用同一组件（pulls/list.ts）
 */
export const LABEL_SUGGESTION_IGNORE =
  'li[role="option"]:is([aria-label$=", Label"], [aria-label$="，标签"])' +
  ':not([aria-label="No Label, Label"], [aria-label="Has Label, Label"], [aria-label="无标签，标签"], [aria-label="有标签，标签"])' +
  ' [class*="displayName__"]'

/** 筛选器名称（建议列表、高级筛选的限定符） */
const FILTER_KEY: Readonly<Record<string, string>> = {
  Archived: '已存档',
  Assignee: '受理人',
  Author: '作者',
  Base: '基础分支',
  'Blocked by': '被阻止',
  Blocking: '阻止',
  Category: '类别',
  'Closed date': '关闭日期',
  'Closed reason': '关闭原因',
  // language: 限定符的新名称（与 Programming language“编程语言”区分）
  'Code language': '代码语言',
  'Comment count': '评论数',
  Commenter: '评论者',
  'Commit SHA': '提交 SHA',
  'Creation date': '创建日期',
  Draft: '草稿',
  Field: '字段',
  Has: '有',
  Head: '头部分支',
  In: '范围',
  'In body': '在正文中',
  'In comments': '在评论中',
  'In title': '在标题中',
  'Interactions count': '交互数',
  Involves: '涉及',
  Is: '是',
  Label: '标签',
  Language: '语言',
  Linked: '链接',
  'Merge date': '合并日期',
  Mentions: '提及',
  Milestone: '里程碑',
  No: '无',
  Organization: '组织',
  'Parent issue': '父议题',
  Project: '项目',
  'Reaction count': '反应数',
  'Relates to': '相关',
  Repository: '存储库',
  'Review requested': '已请求审查',
  'Review state': '审查状态',
  'Reviewed by': '审查者',
  Sort: '排序',
  State: '状态',
  Status: '状态',
  'Sub-issue': '子议题',
  Suggestions: '建议',
  Team: '团队',
  'Team review requested': '已请求团队审查',
  Text: '文本',
  Type: '类型',
  'Update date': '更新日期',
  User: '用户',
  'User review requested': '已请求用户审查'
}

/** 筛选器说明（item 指议题、拉取请求或项目项，与 projects 词典同译“项”） */
const FILTER_DESCRIPTION: Readonly<Record<string, string>> = {
  'Specify archived or non-archived items only': '仅限已存档或未存档的项',
  'Pull Request base branch': '拉取请求的基础分支',
  'Closing date': '关闭日期',
  'Item comment count': '项评论数',
  'Creation date': '创建日期',
  'Search for draft items': '搜索草稿项',
  'Filter by items with a specific metadata value': '筛选具有特定元数据值的项',
  'Head branch commit sha': '头部分支的提交 SHA',
  'Search for text only inside the body of an item': '仅在项的正文中搜索文本',
  'Search for text only inside the comments of an item': '仅在项的评论中搜索文本',
  'Interaction count': '交互数',
  'Search for text only inside the title of an item': '仅在项的标题中搜索文本',
  'Filter only "issues", "pulls", "open", "closed", or "draft"': '仅筛选“issues”“pulls”“open”“closed”或“draft”',
  'Limit text search to the title, body, or comments of an item or a combination of them': '将文本搜索限定在项的标题、正文、评论或其组合中',
  Language: '语言',
  'Items linked to an issue or pull request': '链接了议题或拉取请求的项',
  'Look for open, closed, or draft issues': '查找打开、已关闭或草稿议题',
  'Merge date': '合并日期',
  Milestone: '里程碑',
  'Filter by items without a specific metadata value': '筛选缺少特定元数据值的项',
  'Parent issue': '父议题',
  'State of Pull Requests': '拉取请求的状态',
  'Reactions count': '反应数',
  'Filter by item closed reason': '按项的关闭原因筛选',
  'Specify a review state': '指定审查状态',
  'Commit SHA': '提交 SHA',
  'Sort results': '排序结果',
  'Look for open / closed items': '查找打开或已关闭的项',
  'Commit status: pending | success | failure': '提交状态：pending | success | failure',
  'Issue status or pull request commit status': '议题状态或拉取请求的提交状态',
  'Pending suggestions count': '待处理建议数',
  'Team name': '团队名称',
  'Review requested from team': '已请求团队审查',
  'Updated date': '更新日期',
  'Filter by repository': '按存储库筛选',
  'Filter by organization': '按组织筛选',
  'Filter by label': '按标签筛选',
  'Filter by project': '按项目筛选',
  'Issues blocked by another issue': '被其他议题阻止的议题',
  'Issues blocking another issue': '阻止其他议题的议题',
  'Issues related to another issue': '与其他议题相关的议题',
  'The assignee of the item': '项的受理人',
  'The author of the item': '项的作者',
  'Items commented on by the user': '该用户评论过的项',
  'The user involved in the item': '涉及项的用户',
  'The user mentioned in the item': '项中提及的用户',
  'Items reviewed by the user': '该用户审查过的项',
  'Items with review requested for the user': '请求该用户审查的项',
  'Items in repositories owned by the user': '该用户拥有的存储库中的项',
  'Items with review requested for the user explicitly': '明确请求该用户审查的项',
  'Filter by issue fields': '按议题字段筛选',
  'Specify the type of issue to search for': '指定要搜索的议题类型'
}

/** 筛选值（建议列表） */
const FILTER_VALUE: Readonly<Record<string, string>> = {
  Issue: '议题',
  'Pull Request': '拉取请求',
  Title: '标题',
  Body: '正文',
  Comments: '评论',
  Open: '打开',
  Closed: '已关闭',
  Merged: '已合并',
  Draft: '草稿',
  Completed: '已完成',
  'Not planned': '未计划',
  Duplicate: '重复',
  'No reviews': '暂无审查',
  'Review required': '需要审查',
  Approved: '已批准',
  'Changes requested': '已请求更改',
  Pending: '挂起',
  Success: '成功',
  Failure: '失败',
  Queued: '已排队',
  Waiting: '等待中',
  Cancelled: '已取消',
  Skipped: '已跳过',
  Discussion: '讨论',
  Locked: '已锁定',
  Unlocked: '未锁定',
  Unmerged: '未合并',
  Private: '专用',
  Public: '公共',
  Repository: '存储库',
  Unread: '未读',
  Blocked: '被阻止',
  Blocking: '阻止',
  True: '是',
  False: '否',
  Today: '今天',
  Yesterday: '昨天',
  'Past 7 days': '过去 7 天',
  'Past 30 days': '过去 30 天',
  'Past year': '过去一年',
  'Less than 10': '少于 10',
  'More than 10': '多于 10',
  'Between 10 and 100': '10 到 100 之间',
  'Signed-in user': '已登录用户',
  'Your AI pair programmer': '你的 AI 结对程序员',
  Me: '我'
}

/** 高级筛选中的运算符 */
const OPERATOR: Readonly<Record<string, string>> = {
  'is one of': '是以下之一',
  'is not one of': '不是以下之一',
  is: '是',
  'is not': '不是',
  'greater than': '大于',
  'less than': '小于',
  'greater than or equal to': '大于或等于',
  'less than or equal to': '小于或等于',
  'equal to': '等于',
  before: '早于',
  after: '晚于',
  'before and including': '早于或等于',
  'after and including': '晚于或等于',
  between: '介于'
}

/** 选择器条目名（复数） */
const PICKER_ITEMS: Readonly<Record<string, string>> = {
  users: '用户',
  labels: '标签',
  projects: '项目',
  milestones: '里程碑',
  assignees: '受理人',
  authors: '作者',
  repositories: '存储库',
  organizations: '组织',
  teams: '团队',
  types: '类型',
  'issue types': '议题类型',
  items: '条目',
  values: '值',
  results: '结果'
}

const PICKER_ITEMS_SOURCE = Object.keys(PICKER_ITEMS)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 选择器条目名（单数，选择按钮“1 label selected”“Select a label”） */
const PICKER_ITEM: Readonly<Record<string, string>> = {
  user: '用户',
  label: '标签',
  project: '项目',
  milestone: '里程碑',
  assignee: '受理人',
  author: '作者',
  repository: '存储库',
  organization: '组织',
  team: '团队',
  type: '类型',
  'issue type': '议题类型',
  item: '条目',
  value: '值'
}

const PICKER_ITEM_SOURCE = Object.keys(PICKER_ITEM)
  .sort((a, b) => b.length - a.length)
  .join('|')

/**
 * 不放入 scoped 的词条：通用词典已有相同译文，或已由侧栏 / 详情页（metadata.ts、viewer.ts）收录。
 * 映射表本身保留，供组合文本的正则查表。
 */
const SHARED: ReadonlySet<string> = new Set([
  // 通用词典
  'Archived',
  'Author',
  'Draft',
  'Language',
  'Organization',
  'Repository',
  'Sort',
  'Status',
  'Suggestions',
  'User',
  'Title',
  'Open',
  'Closed',
  'Merged',
  'Completed',
  'Not planned',
  'Duplicate',
  'Review required',
  'Approved',
  'Changes requested',
  'Success',
  'Locked',
  'Unlocked',
  'Private',
  'Public',
  'Today',
  'Yesterday',
  // metadata.ts、viewer.ts
  'Assignee',
  'Label',
  'Type',
  'Project',
  'Milestone',
  'Field',
  'Parent issue',
  'Blocked by',
  'Relates to',
  'Comments'
])

/** 去掉 SHARED 中的词条 */
function own(map: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).filter(([key]) => !SHARED.has(key)))
}

function keyName(name: string): string {
  return FILTER_KEY[name] ?? name
}

/** 连字符与空格视为相同：parent-issue、parent issue → Parent issue */
function looseKey(name: string): string {
  return name.toLowerCase().replace(/-/g, ' ')
}

/** 小写的筛选器名称（建议列表的 Has label、No assignee、Exclude parent-issue） */
const LOOSE_KEY: ReadonlyMap<string, string> = new Map(Object.entries(FILTER_KEY).map(([key, value]) => [looseKey(key), value]))

/**
 * Exclude <key> 中的 key 是限定符（小写），与筛选器名称不同的按名称查表：created → Creation date。
 * Has / No 建议项用的是名称，不经此表
 */
const KEY_NAME: ReadonlyMap<string, string> = new Map([
  ['closed', 'Closed date'],
  ['created', 'Creation date'],
  ['merged', 'Merge date'],
  ['updated', 'Update date'],
  ['org', 'Organization'],
  ['repo', 'Repository'],
  ['reason', 'Closed reason'],
  ['review', 'Review state'],
  ['sha', 'Commit SHA']
])

/** 建议列表“No 筛选器名”中可出现的筛选器（排除 has / no / is / in 这类关键字本身） */
const LOWER_KEY_SOURCE = Object.keys(FILTER_KEY)
  .map(key => key.toLowerCase())
  .filter(key => !['has', 'no', 'is', 'in'].includes(key))
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 已知筛选器直接接中文，未知的保留原文并与中文之间留空格 */
function withKey(prefix: string, name: string): string {
  return joinCjk(prefix, LOOSE_KEY.get(looseKey(name)) ?? name)
}

function describe(text: string): string {
  return FILTER_DESCRIPTION[text] ?? text
}

function valueName(value: string): string {
  return FILTER_VALUE[value] ?? value
}

function items(name: string): string {
  return PICKER_ITEMS[name] ?? name
}

/**
 * 筛选框组件的 scoped 词条：建议列表（筛选器名称、说明、取值）、高级筛选、校验提示。
 * 拉取请求列表是同一组件，由 pulls/list.ts 取用
 */
export const FILTER_BAR_SCOPED: Readonly<Record<string, string>> = {
  ...own(FILTER_KEY),
  ...own(FILTER_DESCRIPTION),
  ...own(FILTER_VALUE),
  ...OPERATOR,

  // 高级筛选与建议
  Exclude: '排除',
  Qualifier: '限定符',
  Operator: '运算符',
  Value: '值',
  From: '从',
  To: '到',
  Before: '早于',
  After: '晚于',
  Between: '介于',
  And: '且',
  Or: '或',
  'Filter values': '筛选值',
  'No filter': '无筛选器',
  'items shown.': '个条目已显示。',

  // 校验提示（<code> 两侧的片段）
  'Unbalanced quotation marks': '引号不匹配',
  'Unbalanced parentheses': '括号不匹配',
  'Invalid value': '无效值',
  'Empty value for': '以下筛选器的值为空',
  'Only one value allowed for': '以下筛选器只允许一个值',
  'Filter values are not supported for': '以下筛选器不支持筛选值',
  'cannot be used within groups': '不能在分组中使用',
  'is not supported.': '不受支持。'
  // 关闭高级筛选时的确认（Discard changes? 等）由通用词典处理
}

/** 筛选框组件的正则：建议列表的组合文字、高级筛选、校验提示（pulls/list.ts 同样取用） */
export const FILTER_BAR_RULES: readonly RegExpRule[] = [
  // 建议列表的组合 aria-label：Author, Filter, The author of the item
  [/^(.+), Filter(?:, (.+))?$/, (_, name, description) => `${keyName(name)}，筛选器${description ? `，${describe(description)}` : ''}`],
  [/^(@me|@copilot), (Signed-in user|Your AI pair programmer)$/, (_, value, text) => `${value}，${valueName(text)}`],
  [/^Has (.+), \1$/, (_, name) => `${joinCjk('有', keyName(name))}，${keyName(name)}`],
  [/^No (.+), \1$/, (_, name) => `${joinCjk('无', keyName(name))}，${keyName(name)}`],
  [/^Has ([a-z][\w -]*)$/, (_, name) => withKey('有', name)],
  [/^Exclude ([a-z][\w -]*)$/, (_, key) => withKey('排除', KEY_NAME.get(key) ?? key)],
  [new RegExp(`^No (${LOWER_KEY_SOURCE})$`), (_, name) => withKey('无', name)],
  // 高级筛选
  [/^Advanced filter dialog(?:: (\d+) valid filters?)?$/, (_, count) => `高级筛选器对话框${count ? `：${count} 个有效筛选器` : ''}`],
  [/^Row (\d+)$/, '第 $1 行'],
  [/^Delete filter (\d+): (.+)$/, '删除筛选器 $1：$2'],
  [/^(?:(.+), )?Qualifier (\d+)$/, (_, title, index) => `${title ? `${keyName(title)}，` : ''}限定符 ${index}`],
  [/^(?:(.+), )?Operator (\d+)$/, (_, title, index) => `${title ? `${OPERATOR[title] ?? keyName(title)}，` : ''}运算符 ${index}`],
  // 介于运算符的两个输入框：Value 1 From / Value 1 To（原文无标点，译文不加括号）
  [/^Value (\d+) (From|To)$/, (_, index, edge) => `值 ${index} ${edge === 'From' ? '起始' : '结束'}`],
  [/^(?:(.+), )?Value (\d+)$/, (_, value, index) => `${value ? `${valueName(value)}，` : ''}值 ${index}`],
  [/^Enter a (text|number|date|value)$/, (_, type) => `输入${{ text: '文本', number: '数字', date: '日期' }[type] ?? '值'}`],
  // 校验提示（issues 指查询中的错误，用“处”与议题计数区分）
  [/^Filter contains (\d+) issues?:$/, '筛选器有 $1 处错误：'],
  [/^Filter '(.+)' not supported$/, '不支持筛选器“$1”'],
  // 原文无逗号，译文用“且”连接
  [/^Filter '(.+)' is deprecated and will be removed in the future$/, '筛选器“$1”已弃用且将来会被删除'],
  [/^Maximum nested groups of (\d+) exceeded$/, '嵌套分组超过上限 $1'],
  [/^Authenticate with (.+) to access$/, '使用 $1 进行身份验证以访问'],
  [/^SSO required for (.+)$/, '$1 需要 SSO'],
  // 表单校验句（Title is invalid）与多句文本不在此翻译，交给 common 的校验规则与按句翻译
  [new RegExp(`^(?!(?:${VALIDATION_FIELD_SOURCE}) is invalid$)(?!.*[.!?] [A-Z])(.+) is invalid$`), '$1 无效']
]

/** 筛选框组件的行内句（pulls/list.ts 同样取用） */
export const FILTER_BAR_INLINE: readonly InlineRule[] = [
  // 校验提示：<code> 是槽位，整句命中时连同中间的 for 一起译出；未命中时按上面的片段处理
  ['Invalid value {} for {}', '无效值 {} 用于筛选器 {}']
]

/**
 * 筛选栏：搜索框、建议列表（筛选器名称、说明、取值）、高级筛选对话框、校验提示、
 * 筛选按钮（作者 / 标签 / 项目 / 里程碑 / 受理人 / 类型）的选择器对话框、排序取值。
 */
export default {
  static: {
    // 搜索框
    'Search or filter': '搜索或筛选',
    'Revert filter changes': '撤销筛选器更改',
    'Loading Suggestions': '正在加载建议',
    'User Avatar': '用户头像',

    // 高级筛选
    'Add a filter': '添加筛选器',
    'Advanced filters': '高级筛选器',
    'Build complex filter queries': '构建复杂的筛选查询',
    'To start building your query add your first filter using the button below.': '使用下方按钮添加第一个筛选器，开始构建查询。',
    'Select a filter': '选择筛选器',
    'Make a selection': '请选择',
    'Enter search text': '输入搜索文本',

    // 建议列表：筛选器说明（其余说明见 FILTER_DESCRIPTION，作为 scoped 收录）
    'Issues with no labels': '无标签的议题',
    'Issues with no type': '无类型的议题',

    // 排序取值
    'Least reactions': '反应最少',
    'Most recent committer date': '提交者日期最新',
    'Least recent committer date': '提交者日期最早',
    'Most recent author date': '作者日期最新',
    'Least recent author date': '作者日期最早',
    'Unread first': '未读优先',
    'Read first': '已读优先',
    'Most thumbs up (👍) reactions': '👍 反应最多',
    'Least thumbs up (👍) reactions': '👍 反应最少',
    'Most thumbs down (👎) reactions': '👎 反应最多',
    'Least thumbs down (👎) reactions': '👎 反应最少',
    'Most laugh (😄) reactions': '😄 反应最多',
    'Least laugh (😄) reactions': '😄 反应最少',
    'Most confused (😕) reactions': '😕 反应最多',
    'Least confused (😕) reactions': '😕 反应最少',
    'Most tada (🎉) reactions': '🎉 反应最多',
    'Least tada (🎉) reactions': '🎉 反应最少',
    'Most heart (❤️) reactions': '❤️ 反应最多',
    'Least heart (❤️) reactions': '❤️ 反应最少',
    'Most eyes (👀) reactions': '👀 反应最多',
    'Least eyes (👀) reactions': '👀 反应最少',
    'Most rocket (🚀) reactions': '🚀 反应最多',
    'Least rocket (🚀) reactions': '🚀 反应最少',

    // 选择器对话框
    'Hidden selection': '隐藏的选择',
    'Selected item hidden by search': '所选条目被搜索隐藏',
    'Use the search to find specific items': '使用搜索查找特定条目',
    'Active filter:': '当前筛选器：',
    'No filter added': '未添加筛选器',
    'Open filter dialog': '打开筛选器对话框',
    'Free text is not supported.': '不支持自由文本。',
    'Error fetching search results': '获取搜索结果时出错'
  },
  scoped: {
    ...FILTER_BAR_SCOPED,

    // 筛选按钮与嵌套菜单（Assignees 见 metadata.ts）
    'Author...': '作者...',
    'Labels...': '标签...',
    'Projects...': '项目...',
    'Milestones...': '里程碑...',
    'Assignees...': '受理人...',
    'Types...': '类型...',
    'Filter by labels': '按标签筛选',
    'Filter by projects': '按项目筛选',
    'Filter by milestones': '按里程碑筛选',
    'Filter by user': '按用户筛选',
    'No assignees': '无受理人'
  },
  regexp: [
    ...FILTER_BAR_RULES,
    // 选择器对话框
    [new RegExp(`^Filter (${PICKER_ITEMS_SOURCE})$`), (_, name) => `筛选${items(name)}`],
    [new RegExp(`^Select (${PICKER_ITEMS_SOURCE})$`), (_, name) => `选择${items(name)}`],
    [new RegExp(`^Select an? (${PICKER_ITEM_SOURCE})$`), (_, name) => `选择${PICKER_ITEM[name] ?? name}`],
    [
      new RegExp(`^([\\d,]+) (${PICKER_ITEMS_SOURCE}|${PICKER_ITEM_SOURCE}) selected$`),
      (_, count, name) => `已选择 ${count} 个${PICKER_ITEMS[name] ?? PICKER_ITEM[name] ?? name}`
    ],
    [new RegExp(`^Loading (${PICKER_ITEMS_SOURCE})\\.\\.\\.$`), (_, name) => `正在加载${items(name)}...`],
    [new RegExp(`^Error loading (${PICKER_ITEMS_SOURCE})\\.$`), (_, name) => `加载${items(name)}时出错。`],
    [new RegExp(`^No (${PICKER_ITEMS_SOURCE}) to show\\.$`), (_, name) => `没有可显示的${items(name)}。`],
    [
      new RegExp(`^Add a filter using the input to match (${PICKER_ITEMS_SOURCE})\\.$`),
      (_, name) => `在输入框中添加筛选器以匹配${items(name)}。`
    ],
    // 计数可能是 human() 的缩写形式：1.2k
    [/^([\d.,]+[kmb]?) selected items hidden by search$/, '$1 个所选条目被搜索隐藏'],
    // 条目名逐词匹配（每个后续词以空格开头），避免嵌套量词回溯
    [/^([\d,]+) [a-z]+(?: [a-z]+)* matching, showing first (\d+)$/, '$1 个匹配项，显示前 $2 个'],
    [/^([\d.,]+[kmb]?) [a-z]+(?: [a-z]+)* matching$/, '$1 个匹配项']
  ],
  inline: FILTER_BAR_INLINE,
  ignore: [LABEL_SUGGESTION_IGNORE]
} satisfies PageDictionary
