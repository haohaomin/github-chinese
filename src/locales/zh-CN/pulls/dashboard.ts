import type { PageDictionary } from '../../../core/types'
import {
  FILTER_DESCRIPTION,
  FILTER_KEY,
  FILTER_VALUE,
  keyName,
  propertyValueName,
  SORT_VALUE,
  valueName
} from '../organization/repos-filter'

/** 收件箱分区名（全局 /pulls） */
const INBOX_SECTION: Readonly<Record<string, string>> = {
  'Needs your review': '需要你审查',
  "Needs your teams' review": '需要你的团队审查',
  'Your drafts': '你的草稿',
  'Waiting for review or checks': '等待审查或检查',
  'Needs action': '需要操作',
  'Ready to merge': '可以合并',
  Merging: '合并中'
}

/** 分区名中的撇号可能是直撇号或弯撇号 */
const INBOX_SECTION_SOURCE = Object.keys(INBOX_SECTION)
  .map(name => name.replace("'", "['’]"))
  .join('|')

function inboxSection(name: string): string {
  return INBOX_SECTION[name.replace('’', "'")] ?? name
}

/** 更新时间筛选（与提交活动页的时间筛选同译） */
const AGE: Readonly<Record<string, string>> = {
  'Any time': '任意时间',
  'Last week': '过去一周',
  'Last month': '过去一个月',
  'Last 3 months': '过去 3 个月',
  'Last year': '过去一年'
}

const AGE_SOURCE = Object.keys(AGE).join('|')

/** 正则备选：转义元字符，长的在前 */
function alternatives(texts: readonly string[]): string {
  return texts
    .map(text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|')
}

/**
 * 选择存储库筛选框（与组织存储库列表同一组件）的筛选键、说明与取值。拉取请求列表的筛选框（list.ts）有同名键
 * （Is、Sort 等）而说明、取值不同，aria-label 规则只匹配这几张表里的键、说明与取值
 */
const REPO_FILTER_KEY_SOURCE = alternatives(Object.keys(FILTER_KEY))
const REPO_FILTER_DESCRIPTION_SOURCE = alternatives(Object.keys(FILTER_DESCRIPTION))
const REPO_FILTER_VALUE_SOURCE = alternatives([...Object.keys(FILTER_VALUE), ...Object.keys(SORT_VALUE)])

/**
 * 选择存储库对话框建议列表中的建议项（filter-picker 的筛选框 id 写死为 picker-filter，建议列表 id 为 <id>-results）。
 * 取值的 aria-label 只在这里改写：拉取请求列表的筛选框（与议题列表同一组件）有同形的 aria-label（Public, Is 等），与议题列表一致
 */
const PICKER_OPTION = '#picker-filter-results [role="option"]'

/** README、Size 可能与文件名同形，可见文字不收；aria-label 里同样保留原文，与可见文字一致 */
const KEPT_VALUES: ReadonlySet<string> = new Set(['README', 'Size'])

/**
 * 选择存储库筛选框的取值（与 organization 词典同译）：排序取值（含带方向的）、has: 与计数筛选器的取值。
 * Name、Public 等由通用词典或 list.ts 同译；KEPT_VALUES 不收
 */
const REPO_FILTER_VALUE: Readonly<Record<string, string>> = {
  ...Object.fromEntries(['Recently pushed', 'Relevance', 'Funding file', 'At least 1'].map(v => [v, valueName(v)])),
  ...SORT_VALUE
}

/**
 * 全局 /pulls 收件箱：分区名与空状态说明、自定义分区对话框、默认视图选项、更新时间筛选、选择存储库筛选框（计数、筛选键、说明与取值及其 aria-label、自定义属性子键、Exclude 建议项）。
 * 列表项、筛选与排序见 list.ts；已保存的视图、Customize sections 等由 issues 词典的全局词条处理。
 */
export default {
  static: {
    // 分区空状态
    'Pull requests that need your review will appear here.': '需要你审查的拉取请求会显示在这里。',
    "Pull requests that need your teams' review will appear here.": '需要你的团队审查的拉取请求会显示在这里。',
    'Pull requests that you have started but not yet submitted for review will appear here.':
      '你已开始但尚未提交审查的拉取请求会显示在这里。',
    'Pull requests that are waiting for review but have not had a review will appear here.':
      '等待审查但尚未获得审查的拉取请求会显示在这里。',
    'Pull requests with failing checks, merge conflicts, or required changes will appear here.':
      '检查失败、存在合并冲突或需要更改的拉取请求会显示在这里。',
    'Pull requests that are ready to merge will appear here.': '可以合并的拉取请求会显示在这里。',

    // 自定义分区对话框
    'Loading customize sections...': '正在加载自定义分区...',
    'Pull requests that are waiting for your review': '等待你审查的拉取请求',
    'Pull requests that are waiting for reviews from your team': '等待你的团队审查的拉取请求',
    'Your pull requests that you have started but not yet submitted for review': '你已开始但尚未提交审查的拉取请求',
    'Your pull requests that are waiting for a review or have running checks': '你创建的等待审查或检查运行中的拉取请求',
    'Your pull requests with failing checks, merge conflicts, outdated branches, or requested changes':
      '你创建的检查失败、存在合并冲突、分支过时或被请求更改的拉取请求',
    'Your pull requests that are ready to merge': '你创建的可以合并的拉取请求',
    'Your pull requests that are currently merging or are in the merge queue': '你创建的正在合并或在合并队列中的拉取请求',

    // 视图选项
    'Default view options': '默认视图选项',
    'Tailor your Inbox to fit your workflow, or pick a different view to open by default at github.com/pulls':
      '按你的工作流自定义收件箱，或选择在 github.com/pulls 默认打开的其他视图'
  },
  scoped: {
    'Needs your review': '需要你审查',
    "Needs your teams' review": '需要你的团队审查',
    'Needs your teams’ review': '需要你的团队审查',
    'Your drafts': '你的草稿',
    'Waiting for review or checks': '等待审查或检查',
    'Needs action': '需要操作',
    // 自定义分区对话框
    Visible: '已显示',
    'Move up': '上移',
    'Move down': '下移',
    // 视图切换对话框标题；视图图标与颜色选择
    Views: '视图',
    Icon: '图标',
    Color: '颜色',
    // 更新时间筛选项（指时间段，不是上一个自然月 / 年）
    'Last week': '过去一周',
    'Last month': '过去一个月',
    'Last year': '过去一年',
    // 结果计数：<1> result
    result: '个结果',
    // 选择存储库筛选框的筛选键与说明（与 organization 词典同译）；Created 与 list.ts 经典 /pulls 标签同键，
    // 两处都是单独一段文字，按结构区分不了，不收
    'Admin Access': '管理员权限',
    Contributions: '贡献',
    Topic: '主题',
    'Total stars': '星标总数',
    'Total help-wanted issues': '需要帮助的议题总数',
    'Total good-first issues': '适合新手的议题总数',
    'Total forks': '复刻总数',
    'Size (Kb)': '大小 (Kb)',
    'Total topics': '主题总数',
    'Custom properties': '自定义属性',
    'Order of results': '结果顺序',
    'Filter by custom properties': '按自定义属性筛选',
    'Programming language': '编程语言',
    // 选择存储库筛选框的取值
    ...REPO_FILTER_VALUE,
    // 选择存储库筛选框的建议项 Exclude <key>（key 小写，与 organization 词典的 EXCLUDE_KEY 同译）；
    // archived 由 search 词典的全局词条翻译，计数筛选器不出这一项，org / owner / user 只在不限范围时出现。
    // 拉取请求列表的筛选框（与议题列表同一组件）也出 Exclude created，名称是 Creation date，两处同译
    'Exclude fork': '排除复刻',
    'Exclude mirror': '排除镜像',
    'Exclude license': '排除许可证',
    'Exclude visibility': '排除可见性',
    'Exclude has': '排除有',
    'Exclude in': '排除范围',
    'Exclude is': '排除是',
    'Exclude topic': '排除主题',
    'Exclude sponsorable': '排除可赞助',
    'Exclude template': '排除模板',
    'Exclude sort': '排除排序',
    'Exclude admin': '排除管理员权限',
    'Exclude contributed-by': '排除贡献',
    'Exclude created': '排除创建日期',
    'Exclude pushed': '排除最后更新',
    'Exclude language': '排除语言',
    'Exclude org': '排除组织',
    'Exclude owner': '排除所有者',
    'Exclude user': '排除用户',
    // 不带 key 的建议项与输入 - 时的建议分组标题（同 organization、issues 词典）
    Exclude: '排除'
  },
  regexp: [
    // 分区名：原文有引号的才加“”；无引号时补“分区”，免得“展开需要你审查”读成一句话
    [new RegExp(`^About the “(${INBOX_SECTION_SOURCE})” section$`), (_, name) => `关于“${inboxSection(name)}”分区`],
    [new RegExp(`^More options for (${INBOX_SECTION_SOURCE})$`), (_, name) => `${inboxSection(name)}分区的更多选项`],
    [
      new RegExp(`^(Expand|Collapse) (${INBOX_SECTION_SOURCE})$`),
      (_, action, name) => `${action === 'Expand' ? '展开' : '折叠'}${inboxSection(name)}分区`
    ],
    // Default to this view when visiting <code>/pulls</code>（与议题仪表板同译）
    [/^Default to this view when visiting (\S+)$/, '访问 $1 时默认打开此视图'],
    // 更新时间筛选：按钮 Updated: Last month，无障碍名称 Filter by age: Last month
    [new RegExp(`^Updated: (${AGE_SOURCE})$`), (_, age) => `更新时间：${AGE[age]}`],
    [new RegExp(`^Filter by age: (${AGE_SOURCE})$`), (_, age) => `按更新时间筛选：${AGE[age]}`],
    [/^(\d+) repositor(?:y|ies) selected$/, '已选择 $1 个存储库'],
    // 组织范围时的自定义属性：Exclude props.<属性名>（属性名小写，同 organization 词典）
    [/^Exclude props\.(.+)$/, '排除属性：$1'],
    // 选择存储库筛选框中筛选键的 aria-label：<键>, Filter[, <说明>]（同 organization 词典，自定义属性子键作 Property: <属性名>）；
    // 先于 list.ts 的议题筛选框规则命中，键或说明不在表中的仍由它处理。取值的 aria-label 见 attributeRules。
    // 以下各条按属性名不含逗号匹配：含逗号的（Code language, Filter, Language、Property: team, Qualifier 1 等）留给 list.ts
    [
      new RegExp(`^(${REPO_FILTER_KEY_SOURCE}|Property: [^,]+), Filter(?:, (${REPO_FILTER_DESCRIPTION_SOURCE}))?$`),
      (_, name: string, description: string) =>
        `${keyName(name)}，筛选器${description ? `，${FILTER_DESCRIPTION[description] ?? description}` : ''}`
    ],
    // 非必填自定义属性的 Has / No 建议项及其 aria-label（同 organization 词典；选择存储库筛选框不出这两项，
    // 先于下一条命中，免得译成“Has Property: team，属性：team”）
    [
      /^(Has|No) [Pp]roperty: ([^,]+?)(?:, (Property: \2))?$/,
      (_, kind: string, name: string, suffix: string) => `${kind === 'Has' ? '有' : '无'}属性：${name}${suffix ? `，属性：${name}` : ''}`
    ],
    // 自定义属性子键取值的 aria-label：<值>, Property: <属性名>；自定义属性子键（同 organization 词典）
    [/^(.+), Property: ([^,]+)$/, (_, value: string, name: string) => `${propertyValueName(value)}，属性：${name}`],
    [/^Property: ([^,]+)$/, '属性：$1']
  ],
  attributeRules: [
    // 选择存储库筛选框中取值的 aria-label：<值>, <键>（同 organization 词典），只改该对话框的建议项。
    // 语言名、组织名是数据，保留原文；许可证名按 code/licenses 译出（同可见文字）；Has / No 开头的建议项（该筛选框不出）留给 list.ts
    [
      PICKER_OPTION,
      'aria-label',
      /^(?!(?:Has|No) )([^,]+), (License|Language|Organization)$/,
      (_, value: string, key: string) => `${key === 'License' ? valueName(value) : value}，${keyName(key)}`
    ],
    // 其余取值限于表中的；KEPT_VALUES 保留原文
    [
      PICKER_OPTION,
      'aria-label',
      new RegExp(`^(${REPO_FILTER_VALUE_SOURCE}|Property: [^,]+), (${REPO_FILTER_KEY_SOURCE})$`),
      (_, value: string, key: string) => `${KEPT_VALUES.has(value) ? value : valueName(value)}，${keyName(key)}`
    ]
  ]
} satisfies PageDictionary
