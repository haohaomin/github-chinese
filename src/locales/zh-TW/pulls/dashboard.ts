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
  'Needs your review': '需要你審查',
  "Needs your teams' review": '需要你的團隊審查',
  'Your drafts': '你的草稿',
  'Waiting for review or checks': '等待審查或檢查',
  'Needs action': '需要採取動作',
  'Ready to merge': '可以合併',
  Merging: '合併中'
}

/** 分区名中的撇号可能是直撇号或弯撇号 */
const INBOX_SECTION_SOURCE = Object.keys(INBOX_SECTION)
  .map(name => name.replace("'", "['’]"))
  .join('|')

function inboxSection(name: string): string {
  return INBOX_SECTION[name.replace('’', "'")] ?? name
}

/** 更新时间筛选（与提交活动页的时间筛选同译；Any time 取 Chromium 繁中「不限時間」） */
const AGE: Readonly<Record<string, string>> = {
  'Any time': '不限時間',
  'Last week': '過去一週',
  'Last month': '過去一個月',
  'Last 3 months': '過去 3 個月',
  'Last year': '過去一年'
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
 * section 作「區段」，与 dashboard 词典的自定义分区一致。
 */
export default {
  static: {
    // 分区空状态
    'Pull requests that need your review will appear here.': '需要你審查的拉取請求會顯示在這裡。',
    "Pull requests that need your teams' review will appear here.": '需要你的團隊審查的拉取請求會顯示在這裡。',
    'Pull requests that you have started but not yet submitted for review will appear here.':
      '你已開始但尚未送交審查的拉取請求會顯示在這裡。',
    'Pull requests that are waiting for review but have not had a review will appear here.':
      '等待審查但尚未獲得審查的拉取請求會顯示在這裡。',
    'Pull requests with failing checks, merge conflicts, or required changes will appear here.':
      '檢查失敗、有合併衝突或需要變更的拉取請求會顯示在這裡。',
    'Pull requests that are ready to merge will appear here.': '可以合併的拉取請求會顯示在這裡。',

    // 自定义分区对话框
    'Loading customize sections...': '正在載入自訂區段...',
    'Pull requests that are waiting for your review': '等待你審查的拉取請求',
    'Pull requests that are waiting for reviews from your team': '等待你的團隊審查的拉取請求',
    'Your pull requests that you have started but not yet submitted for review': '你已開始但尚未送交審查的拉取請求',
    'Your pull requests that are waiting for a review or have running checks': '你建立的等待審查或檢查執行中的拉取請求',
    'Your pull requests with failing checks, merge conflicts, outdated branches, or requested changes':
      '你建立的檢查失敗、有合併衝突、分支過時或收到變更要求的拉取請求',
    'Your pull requests that are ready to merge': '你建立的可以合併的拉取請求',
    'Your pull requests that are currently merging or are in the merge queue': '你建立的正在合併或在合併佇列中的拉取請求',

    // 视图选项
    'Default view options': '預設檢視選項',
    'Tailor your Inbox to fit your workflow, or pick a different view to open by default at github.com/pulls':
      '依你的工作流程自訂收件匣，或選擇在 github.com/pulls 預設開啟的其他檢視'
  },
  scoped: {
    'Needs your review': '需要你審查',
    "Needs your teams' review": '需要你的團隊審查',
    'Needs your teams’ review': '需要你的團隊審查',
    'Your drafts': '你的草稿',
    'Waiting for review or checks': '等待審查或檢查',
    'Needs action': '需要採取動作',
    // 自定义分区对话框（与 Hidden「已隱藏」成对，与 dashboard 词典同译）
    Visible: '已顯示',
    'Move up': '上移',
    'Move down': '下移',
    // 视图切换对话框标题；视图图标与颜色选择
    Views: '檢視',
    Icon: '圖示',
    Color: '顏色',
    // 更新时间筛选项（指时间段，不是上一个自然月 / 年）
    'Last week': '過去一週',
    'Last month': '過去一個月',
    'Last year': '過去一年',
    // 结果计数：<1> result（结果量词作「項」）
    result: '項結果',
    // 选择存储库筛选框的筛选键与说明（与 organization 词典同译）；Created 与 list.ts 经典 /pulls 标签同键，
    // 两处都是单独一段文字，按结构区分不了，不收
    'Admin Access': '管理員權限',
    Contributions: '貢獻',
    Topic: '主題',
    'Total stars': '星號總數',
    'Total help-wanted issues': '需要協助的議題總數',
    'Total good-first issues': '適合新手的議題總數',
    'Total forks': '分叉總數',
    'Size (Kb)': '大小 (Kb)',
    'Total topics': '主題總數',
    'Custom properties': '自訂屬性',
    'Order of results': '結果順序',
    'Filter by custom properties': '依自訂屬性篩選',
    'Programming language': '程式語言',
    // 选择存储库筛选框的取值
    ...REPO_FILTER_VALUE,
    // 选择存储库筛选框的建议项 Exclude <key>（key 小写，与 organization 词典的 EXCLUDE_KEY 同译）；
    // archived 由 search 词典的全局词条翻译，计数筛选器不出这一项，org / owner / user 只在不限范围时出现。
    // 拉取请求列表的筛选框（与议题列表同一组件）也出 Exclude created，名称是 Creation date，两处同译
    'Exclude fork': '排除分叉',
    'Exclude mirror': '排除鏡像',
    'Exclude license': '排除授權條款',
    'Exclude visibility': '排除可見度',
    'Exclude has': '排除有',
    'Exclude in': '排除範圍',
    'Exclude is': '排除是',
    'Exclude topic': '排除主題',
    'Exclude sponsorable': '排除可贊助',
    'Exclude template': '排除範本',
    'Exclude sort': '排除排序',
    'Exclude admin': '排除管理員權限',
    'Exclude contributed-by': '排除貢獻',
    'Exclude created': '排除建立日期',
    'Exclude pushed': '排除上次更新',
    'Exclude language': '排除語言',
    'Exclude org': '排除組織',
    'Exclude owner': '排除擁有者',
    'Exclude user': '排除使用者',
    // 不带 key 的建议项与输入 - 时的建议分组标题（同 organization、issues 词典）
    Exclude: '排除'
  },
  regexp: [
    // 分区名：原文有引号的才加「」；无引号时补「區段」，免得「展開需要你審查」读成一句话
    [new RegExp(`^About the “(${INBOX_SECTION_SOURCE})” section$`), (_, name) => `關於「${inboxSection(name)}」區段`],
    [new RegExp(`^More options for (${INBOX_SECTION_SOURCE})$`), (_, name) => `${inboxSection(name)}區段的更多選項`],
    [
      new RegExp(`^(Expand|Collapse) (${INBOX_SECTION_SOURCE})$`),
      (_, action, name) => `${action === 'Expand' ? '展開' : '摺疊'}${inboxSection(name)}區段`
    ],
    // Default to this view when visiting <code>/pulls</code>（与议题仪表板同译）
    [/^Default to this view when visiting (\S+)$/, '造訪 $1 時預設開啟此檢視'],
    // 更新时间筛选：按钮 Updated: Last month，无障碍名称 Filter by age: Last month
    [new RegExp(`^Updated: (${AGE_SOURCE})$`), (_, age) => `更新時間：${AGE[age]}`],
    [new RegExp(`^Filter by age: (${AGE_SOURCE})$`), (_, age) => `依更新時間篩選：${AGE[age]}`],
    [/^(\d+) repositor(?:y|ies) selected$/, '已選取 $1 個儲存庫'],
    // 组织范围时的自定义属性：Exclude props.<属性名>（属性名小写，同 organization 词典）
    [/^Exclude props\.(.+)$/, '排除屬性：$1'],
    // 选择存储库筛选框中筛选键的 aria-label：<键>, Filter[, <说明>]（同 organization 词典，自定义属性子键作 Property: <属性名>）；
    // 先于 list.ts 的议题筛选框规则命中，键或说明不在表中的仍由它处理。取值的 aria-label 见 attributeRules。
    // 以下各条按属性名不含逗号匹配：含逗号的（Code language, Filter, Language、Property: team, Qualifier 1 等）留给 list.ts
    [
      new RegExp(`^(${REPO_FILTER_KEY_SOURCE}|Property: [^,]+), Filter(?:, (${REPO_FILTER_DESCRIPTION_SOURCE}))?$`),
      (_, name: string, description: string) =>
        `${keyName(name)}，篩選器${description ? `，${FILTER_DESCRIPTION[description] ?? description}` : ''}`
    ],
    // 非必填自定义属性的 Has / No 建议项及其 aria-label（同 organization 词典；选择存储库筛选框不出这两项，
    // 先于下一条命中，免得译成「Has Property: team，屬性：team」）
    [
      /^(Has|No) [Pp]roperty: ([^,]+?)(?:, (Property: \2))?$/,
      (_, kind: string, name: string, suffix: string) => `${kind === 'Has' ? '有' : '無'}屬性：${name}${suffix ? `，屬性：${name}` : ''}`
    ],
    // 自定义属性子键取值的 aria-label：<值>, Property: <属性名>；自定义属性子键（同 organization 词典）
    [/^(.+), Property: ([^,]+)$/, (_, value: string, name: string) => `${propertyValueName(value)}，屬性：${name}`],
    [/^Property: ([^,]+)$/, '屬性：$1']
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
