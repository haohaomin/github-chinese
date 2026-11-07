import type { PageDictionary } from '../../../core/types'
import { LICENSE_NAMES } from '../code/licenses'
import { joinCjk } from '../helpers'
import { sortDirection } from './repos-list'

/**
 * React 存储库列表的筛选框（/repos 与 /orgs/<组织>/repositories 共用）：建议列表的筛选键、说明、取值及其 aria-label，
 * 自定义属性子键，校验横幅，高级筛选对话框。与 issues/filter.ts 是同一套筛选组件，同句同译。
 * 语言名、组织名、自定义属性名与组织自定义的属性取值是数据，保留原文；许可证名按 code/licenses 译出（可见文字由其 static 处理）。
 */

/** 筛选键名称（建议列表的 displayName）；全局 /pulls 的选择存储库筛选框是同一组件，由 pulls/dashboard.ts 取用 */
export const FILTER_KEY: Readonly<Record<string, string>> = {
  'Admin Access': '管理員權限',
  Archived: '已封存',
  Contributions: '貢獻',
  Fork: '分叉',
  Has: '有',
  In: '範圍',
  Is: '是',
  License: '授權條款',
  Mirror: '鏡像',
  Organization: '組織',
  Owner: '擁有者',
  Sort: '排序',
  Sponsorable: '可贊助',
  Template: '範本',
  Topic: '主題',
  User: '使用者',
  Visibility: '可見度',
  Deployable: '可部署',
  Deployed: '已部署',
  'Runtime risk': '執行階段風險',
  'Custom properties': '自訂屬性',
  Language: '語言',
  // 与说明 Creation date、议题筛选框的同一限定符同译
  Created: '建立日期',
  'Last updated': '上次更新',
  'Total stars': '星號總數',
  'Total help-wanted issues': '需要協助的議題總數',
  'Total good-first issues': '適合新手的議題總數',
  'Total forks': '分叉總數',
  'Size (Kb)': '大小 (Kb)',
  'Total topics': '主題總數'
}

/** 筛选键说明（pulls/dashboard.ts 同样取用） */
export const FILTER_DESCRIPTION: Readonly<Record<string, string>> = {
  'Order of results': '結果順序',
  'Filter by runtime risks associated with the deployment': '依部署的執行階段風險篩選',
  'Filter by custom properties': '依自訂屬性篩選',
  'Programming language': '程式語言',
  'Creation date': '建立日期',
  'Last updated date': '上次更新日期'
}

/** 筛选取值（pulls/dashboard.ts 同样取用） */
export const FILTER_VALUE: Readonly<Record<string, string>> = {
  README: '讀我檔案',
  Me: '我',
  'Funding file': '贊助檔案',
  Public: '公開',
  Private: '私人',
  Internal: '內部',
  Sponsorable: '可贊助',
  Name: '名稱',
  Description: '描述',
  Topics: '主題',
  'Recently pushed': '最近推送',
  Language: '語言',
  License: '授權條款',
  Size: '大小',
  'Total stars': '星號總數',
  'Total forks': '分叉總數',
  Relevance: '相關性',
  'Help-wanted issues': '需要協助的議題',
  True: '是',
  False: '否',
  Today: '今天',
  'This month': '本月',
  'This year': '今年',
  'At least 1': '至少 1',
  'More than 10': '多於 10',
  'Critical resource': '關鍵資源',
  'Internet exposed': '暴露於網際網路',
  'Lateral movement': '橫向移動',
  'Sensitive data': '敏感資料'
}

/** 高级筛选对话框的运算符（同 issues/filter.ts）；比较运算符的 scoped 由 pages.ts 收录 */
const OPERATOR: Readonly<Record<string, string>> = {
  'is one of': '是下列其中之一',
  'is not one of': '不是下列其中之一',
  is: '是',
  'is not': '不是',
  'greater than': '大於',
  'less than': '小於',
  'greater than or equal to': '大於或等於',
  'less than or equal to': '小於或等於',
  'equal to': '等於',
  before: '早於',
  after: '晚於',
  'before and including': '早於或等於',
  'after and including': '晚於或等於',
  between: '介於'
}

/** 高级筛选对话框取值框占位文字 Enter a <类型> 中的类型（同 issues/filter.ts）；未收录的作“值” */
const VALUE_TYPE: Readonly<Record<string, string>> = { text: '文字', number: '數字', date: '日期' }

/** 「Exclude <key>」中的筛选器 key（小写）；计数筛选器不出这一项 */
const EXCLUDE_KEY: Readonly<Record<string, string>> = {
  admin: '管理員權限',
  archived: '已封存',
  'contributed-by': '貢獻',
  fork: '分叉',
  has: '有',
  in: '範圍',
  is: '是',
  license: '授權條款',
  mirror: '鏡像',
  org: '組織',
  owner: '擁有者',
  sort: '排序',
  sponsorable: '可贊助',
  template: '範本',
  topic: '主題',
  user: '使用者',
  visibility: '可見度',
  deployable: '可部署',
  deployed: '已部署',
  'runtime-risk': '執行階段風險',
  created: '建立日期',
  pushed: '上次更新',
  language: '語言'
}

/** 自定义属性子键的取值：true_false 类型是 True / False，其余是组织自定义的 */
const PROPERTY_VALUE: Readonly<Record<string, string>> = { True: '是', False: '否' }

/** 自定义属性子键的 displayName 前缀 */
const PROPERTY_PREFIX = 'Property: '

const FILTER_KEY_SOURCE = Object.keys(FILTER_KEY)
  .map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 带方向的排序取值：Total stars (ascending) */
const SORT_VALUE_RE =
  /^(Recently pushed|Name|Language|License|Topics|Size|Total stars|Total forks|Help-wanted issues) \((ascending|descending)\)$/

/** 查表：键可能是用户内容（组织名、属性取值），不取原型链上的键 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 筛选键译名：自定义属性子键写作「屬性：<属性名>」；未收录的保留原文（pulls/dashboard.ts 同样取用） */
export function keyName(name: string): string {
  if (name.startsWith(PROPERTY_PREFIX)) return `屬性：${name.slice(PROPERTY_PREFIX.length)}`
  return pick(FILTER_KEY, name) ?? name
}

function sortValue(field: string, order: string): string {
  return `${pick(FILTER_VALUE, field) ?? field}（${sortDirection(order)}）`
}

/** 筛选取值译名：查表（含许可证名）、带方向的排序取值、自定义属性子键；未收录的保留原文（pulls/dashboard.ts 同样取用） */
export function valueName(value: string): string {
  const known = pick(FILTER_VALUE, value) ?? pick(LICENSE_NAMES, value)
  if (known !== undefined) return known
  const sort = SORT_VALUE_RE.exec(value)
  if (sort) return sortValue(sort[1]!, sort[2]!)
  return value.startsWith(PROPERTY_PREFIX) ? keyName(value) : value
}

/** 自定义属性子键取值译名：true_false 类型的 True / False；组织自定义的保留原文（pulls/dashboard.ts 同样取用） */
export function propertyValueName(value: string): string {
  return pick(PROPERTY_VALUE, value) ?? value
}

/** 组件中带方向的排序取值（不带方向的见 FILTER_VALUE）：全局 /pulls 的选择存储库筛选框按词条收录（pulls/dashboard.ts） */
export const SORT_VALUE: Readonly<Record<string, string>> = Object.fromEntries(
  [
    'Recently pushed (descending)',
    'Name (descending)',
    'Language (descending)',
    'License (descending)',
    'Topics (ascending)',
    'Size (ascending)',
    'Total stars (ascending)',
    'Total forks (ascending)',
    'Help-wanted issues (ascending)',
    'Help-wanted issues (descending)'
  ].map(value => [value, valueName(value)])
)

export default {
  static: {
    // is: 筛选器的弃用提示（校验横幅）
    'Filter "is:" is deprecated, use "visibility:" or "sponsorable:" instead':
      '篩選器「is:」已淘汰，請改用「visibility:」或「sponsorable:」'
  },
  scoped: {
    // 筛选键（Archived、Fork、License 等由通用词典收录）
    'Admin Access': '管理員權限',
    Contributions: '貢獻',
    Has: '有',
    In: '範圍',
    Is: '是',
    Topic: '主題',
    Created: '建立日期',
    'Total help-wanted issues': '需要協助的議題總數',
    'Total good-first issues': '適合新手的議題總數',
    'Size (Kb)': '大小 (Kb)',
    'Total topics': '主題總數',
    // 组织页按功能开关追加的筛选键
    Deployable: '可部署',
    Deployed: '已部署',
    'Runtime risk': '執行階段風險',
    'Custom properties': '自訂屬性',
    // 筛选键说明
    'Order of results': '結果順序',
    'Filter by runtime risks associated with the deployment': '依部署的執行階段風險篩選',
    'Filter by custom properties': '依自訂屬性篩選',
    'Programming language': '程式語言',
    // 筛选取值（Public、Name、Topics 等由通用词典收录）
    README: '讀我檔案',
    Me: '我',
    'Funding file': '贊助檔案',
    'Recently pushed': '最近推送',
    Size: '大小',
    'Total stars': '星號總數',
    'Total forks': '分叉總數',
    True: '是',
    False: '否',
    'At least 1': '至少 1',
    'More than 10': '多於 10',
    'Critical resource': '關鍵資源',
    'Internet exposed': '暴露於網際網路',
    'Lateral movement': '橫向移動',
    'Sensitive data': '敏感資料',
    // 无语言项
    'No language': '無語言',
    // 输入 - 时的建议分组标题
    Exclude: '排除',
    // 高级筛选对话框：各行的列标题、介于运算符的起止输入框（同 issues/filter.ts）
    Qualifier: '限定詞',
    Operator: '運算子',
    Value: '值',
    From: '從',
    To: '到',
    // 运算符（比较运算符由 pages.ts 收录）与取值框的占位文字（同 issues/filter.ts）
    'is one of': '是下列其中之一',
    'is not one of': '不是下列其中之一',
    is: '是',
    'is not': '不是',
    before: '早於',
    after: '晚於',
    'before and including': '早於或等於',
    'after and including': '晚於或等於',
    between: '介於',
    'Filter values': '篩選值',
    // 校验横幅条目；<code> 在句末的三条按片段收录（同 issues/filter.ts）
    'Unbalanced quotation marks': '引號不成對',
    'Unbalanced parentheses': '括號不成對',
    'Empty value for': '下列篩選器的值為空',
    'Only one value allowed for': '下列篩選器只允許一個值',
    'Filter values are not supported for': '下列篩選器不支援篩選值'
  },
  regexp: [
    // 高级筛选对话框：按钮与各行的读屏标题、aria-label（同 issues/filter.ts）；
    // 排在最前：取值、属性名可能以筛选键或 Filter 结尾，也可能以「Property: 」开头
    [/^Advanced filter dialog: (\d+) valid filters?$/, '進階篩選器對話方塊：$1 個有效篩選器'],
    [/^Row (\d+)$/, '第 $1 列'],
    [/^Delete filter (\d+): (.+)$/, '刪除篩選器 $1：$2'],
    [/^(?:(.+), )?Qualifier (\d+)$/, (_, title, index) => `${title ? `${keyName(title)}，` : ''}限定詞 ${index}`],
    [/^(?:(.+), )?Operator (\d+)$/, (_, title, index) => `${title ? `${pick(OPERATOR, title) ?? title}，` : ''}運算子 ${index}`],
    // 介于运算符的两个输入框：Value 1 From / Value 1 To（原文无标点，译文不加括号）
    [/^Value (\d+) (From|To)$/, (_, index, edge) => `值 ${index} ${edge === 'From' ? '起始' : '結束'}`],
    [/^(?:(.+), )?Value (\d+)$/, (_, value, index) => `${value ? `${valueName(value)}，` : ''}值 ${index}`],
    // 取值框的占位文字：Enter a text / Enter a value（同 issues/filter.ts；Enter a number 由 pages.ts 收录）
    [/^Enter a (text|number|date|value)$/, (_, type) => `輸入${pick(VALUE_TYPE, type) ?? '值'}`],
    // 带方向的排序取值：Total stars (ascending)
    [SORT_VALUE_RE, (_, field, order) => sortValue(field, order)],
    // 建议列表中筛选键的 aria-label：<键>, Filter[, <说明>]（同 issues/filter.ts）
    [
      /^(.+), Filter(?:, (.+))?$/,
      (_, name, description?: string) =>
        `${keyName(name)}，篩選器${description ? `，${pick(FILTER_DESCRIPTION, description) ?? description}` : ''}`
    ],
    // 筛选取值的 aria-label：<值>, <键>，键限于本列表的筛选键；
    // 须排在 Property: 规则之前，否则「Property: team, Custom properties」会被整个当成属性名
    [new RegExp(`^(.+), (${FILTER_KEY_SOURCE})$`), (_, value, key) => `${valueName(value)}，${keyName(key)}`],
    // 非必填自定义属性的 Has / No 建议项（文字的 displayName 小写）及其 aria-label（同 issues/filter.ts）；
    // 须排在「<值>, Property: <属性名>」规则之前
    [
      /^(Has|No) [Pp]roperty: (.+?)(?:, (Property: \2))?$/,
      (_, kind, name, suffix?: string) => `${kind === 'Has' ? '有' : '無'}屬性：${name}${suffix ? `，屬性：${name}` : ''}`
    ],
    // 自定义属性子键取值的 aria-label：<值>, Property: <属性名>
    [/^(.+), Property: (.+)$/, (_, value, name) => `${propertyValueName(value)}，屬性：${name}`],
    // 自定义属性子键
    [/^Property: (.+)$/, '屬性：$1'],
    // 值位为空时建议列表的第一项：Exclude props.<属性名>、Exclude <key>（key 小写，未收录的保留原文）
    [/^Exclude props\.(.+)$/, '排除屬性：$1'],
    [/^Exclude ([a-z][\w-]*)$/, (_, key) => joinCjk('排除', pick(EXCLUDE_KEY, key) ?? key)],
    // 校验横幅标题（与 issues/filter.ts 同句同译）
    [/^Filter contains (\d+) issues?:$/, '篩選器有 $1 處錯誤：']
  ],
  inline: [
    // 校验横幅条目：<code> 是槽位，槽位顺序不变（与 issues/filter.ts 同句同译）
    ['Invalid value {} for {}', '{} 不是篩選器 {} 的有效值']
  ]
} satisfies PageDictionary
