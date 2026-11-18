import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinName } from './list'

/** 标签颜色选择器的默认颜色名 */
const COLOR_NAME: Readonly<Record<string, string>> = {
  Red: '红色',
  Orange: '橙色',
  Yellow: '黄色',
  Green: '绿色',
  Teal: '青色',
  Blue: '蓝色',
  Navy: '藏青色',
  Purple: '紫色',
  Pink: '粉色',
  'Light Pink': '浅粉色',
  'Light Yellow': '浅黄色',
  'Light Green': '浅绿色',
  'Light Teal': '浅青色',
  'Light Blue': '浅蓝色',
  'Light Indigo': '浅靛蓝色',
  Lavender: '薰衣草色'
}

const COLOR_NAME_SOURCE = Object.keys(COLOR_NAME)
  .sort((a, b) => b.length - a.length)
  .join('|')

const HEX_SOURCE = '#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?'

/**
 * 默认标签（GitHub、Dependabot 预置）的名称：名称表（PageDictionary.labels），只在标签名称区域内整段匹配；
 * 自定义标签名是用户内容，不收
 */
const LABEL_NAMES: Readonly<Record<string, string>> = {
  bug: '缺陷',
  documentation: '文档',
  duplicate: '重复',
  enhancement: '改进',
  'good first issue': '适合新手的议题',
  'help wanted': '需要帮助',
  invalid: '无效',
  question: '疑问',
  wontfix: '不予修复',
  dependencies: '依赖项',
  accessibility: '辅助功能'
}

/**
 * 默认标签的说明（说明表 PageDictionary.labelDescriptions，只在标签说明区域内整段匹配），弯引号、直引号两种写法都收。
 * 同一说明另收在 static：筛选框的标签建议、标签选择器里的说明不在标签区域里（两处译文相同）
 */
const LABEL_DESCRIPTIONS: Readonly<Record<string, string>> = {
  'Barrier affecting people with disabilities': '影响残障人士使用的障碍',
  "Something isn't working": '有功能不正常',
  'Something isn’t working': '有功能不正常',
  'Improvements or additions to documentation': '文档改进或补充',
  'This issue or pull request already exists': '此议题或拉取请求已存在',
  'New feature or request': '新功能或功能请求',
  'Good for newcomers': '适合新手',
  'Extra attention is needed': '需要额外关注',
  "This doesn't seem right": '这似乎不对',
  'This doesn’t seem right': '这似乎不对',
  'Further information is requested': '需要更多信息',
  'This will not be worked on': '不会处理',
  'Pull requests that update a dependency file': '更新依赖文件的拉取请求'
}

/**
 * 名称区域里 GitHub 写入的占位文字（名称表）：新建、编辑标签对话框的预览令牌，名称为空时显示。
 * static 另收（令牌的 aria-label 不在标签区域里，两处译文相同）
 */
const LABEL_PLACEHOLDERS: Readonly<Record<string, string>> = {
  'Label preview': '标签预览'
}

/** 名称表：默认标签名与名称区域里的占位文字 */
const LABEL_NAME_TABLE: Readonly<Record<string, string>> = { ...LABEL_NAMES, ...LABEL_PLACEHOLDERS }

const LABEL_NAME_MAP: ReadonlyMap<string, string> = new Map(Object.entries(LABEL_NAMES))
const LABEL_TOKEN_MAP: ReadonlyMap<string, string> = new Map(Object.entries(LABEL_NAME_TABLE))
const LABEL_DESCRIPTION_MAP: ReadonlyMap<string, string> = new Map(Object.entries(LABEL_DESCRIPTIONS))

/** 按字面匹配的正则备选 */
function alternatives(texts: Iterable<string>): string {
  return [...texts].map(text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
}

/** 默认标签名（正则备选）：无障碍名称里的标签名按它匹配 */
export const LABEL_NAME_SOURCE = alternatives(LABEL_NAME_MAP.keys())

/** 默认标签的说明（正则备选）：说明提示的无障碍名称按它匹配 */
export const LABEL_DESCRIPTION_SOURCE = alternatives(LABEL_DESCRIPTION_MAP.keys())

/**
 * 无障碍名称里的标签名：默认标签与标签区域里显示的译名相同，自定义标签名（用户内容）原样返回
 */
export function labelName(name: string): string {
  return LABEL_NAME_MAP.get(name) ?? name
}

/** 无障碍名称里的标签名，archived 不为空时是已存档标签（Archived 加标签名，与议题列表的 Archived 兜底规则同样拼接） */
export function archivedLabelName(archived: string, name: string): string {
  return archived ? joinName('已存档', labelName(name)) : labelName(name)
}

/** 预览令牌的无障碍名称（值同令牌里显示的文字）：默认标签名、占位文字与令牌同译，自定义标签名原样返回 */
export function labelTokenName(text: string): string {
  return LABEL_TOKEN_MAP.get(text) ?? text
}

/** 无障碍名称里的标签说明：默认说明与标签区域里显示的译文相同，其余原样返回 */
export function labelDescription(description: string): string {
  return LABEL_DESCRIPTION_MAP.get(description) ?? description
}

/** 生态说明里的产品名按术语表第 3 节译出；其余生态名（javascript、Docker 等）保持原文 */
const ECOSYSTEM_NAMES: ReadonlyMap<string, string> = new Map([['GitHub Actions', 'GitHub 操作']])

/**
 * Dependabot 按生态生成的标签说明：Pull requests that update javascript code（新建的写作 Javascript）。
 * 生态名不定，不逐条收进说明表：标签说明区域里按标签正则、区域外按全站 regexp（common-ui/labels.ts）、
 * 说明提示的无障碍名称按属性规则翻译，译文相同
 */
export const ECOSYSTEM_DESCRIPTION: RegExpRule = [
  /^Pull requests that update ([\w.#+ -]{1,40}) code$/,
  (_, name: string) => joinName(joinName('更新', ECOSYSTEM_NAMES.get(name) ?? name), '代码的拉取请求')
]

/**
 * 标签页：列表、排序、搜索、活跃 / 已存档切换、新建 / 编辑 / 删除 / 存档对话框、颜色选择器、按标签转换为讨论，
 * 以及 GitHub 与 Dependabot 默认标签的名称（标签名称区域）与说明（标签说明区域、static）。
 */
export default {
  static: {
    // 列表与头部
    'New label': '新建标签',
    'Search all labels': '搜索所有标签',
    'Loading labels': '正在加载标签',
    'Label actions': '标签操作',
    'label actions': '标签操作',
    'More label actions': '更多标签操作',
    'Total issue count': '议题总数',
    'Oops we could not load the labels': '无法加载标签',
    'Could not load data': '无法加载数据',
    'open pull requests': '个打开的拉取请求',
    'open issues': '个打开的议题',

    // 排序（与里程碑页的 Alphabetical 同译；Most issues、Fewest issues 见 milestones.ts）
    Alphabetically: '按字母顺序',
    'Reverse alphabetically': '按字母倒序',

    // 空状态
    'There are no labels in this repository': '此存储库中没有标签',
    'Start creating labels using the "New Label" button.': '使用“新建标签”按钮开始创建标签。',
    'There are no archived labels in this repository': '此存储库中没有已存档的标签',
    'Labels you archive will appear here.': '存档的标签会显示在这里。',
    'No matching labels': '没有匹配的标签',
    'We couldn’t find any labels that match your filter. Please try again.': '找不到与筛选器匹配的标签。请重试。',
    "We couldn't find any labels that match your filter. Please try again.": '找不到与筛选器匹配的标签。请重试。',

    // 新建 / 编辑表单
    'Edit label': '编辑标签',
    'Create label': '创建标签',
    'Label name': '标签名称',
    'Label preview': '标签预览',
    'Optionally add a description': '可添加描述',
    'Maximum 50 characters': '最多 50 个字符',
    'Name is required': '名称为必填项',
    'Name must be 50 characters or fewer': '名称不能超过 50 个字符',
    'Name has already been taken': '名称已被使用',
    'Description is too long (maximum is 100 characters)': '描述过长（最多 100 个字符）',
    'Color is required': '颜色为必填项',
    'Color is invalid': '颜色无效',
    'Color must be a valid hex color, such as #0969da': '颜色必须是有效的十六进制颜色，例如 #0969da',
    'Choose random color': '随机选择颜色',
    'Choose from default colors': '从默认颜色中选择',
    'Could not update label': '无法更新标签',
    'There was an error updating this label': '更新此标签时出错',
    'You do not have permission to create labels in this repository': '你没有在此存储库中创建标签的权限',

    // 删除 / 存档
    'Permanently delete label': '永久删除标签',
    'Delete this label': '删除此标签',
    'Once you delete this label, you will not be able to see it again.': '删除后将无法再看到此标签。',
    'Deleting this label will remove it from all issues and pull requests.': '删除此标签会将其从所有议题和拉取请求中移除。',
    'There was an error deleting the label. Please try again.': '删除标签时出错。请重试。',
    'Archive Label': '存档标签',
    'There was an error archiving the label. Please try again.': '存档标签时出错。请重试。',
    'There was an error removing the label from the archive. Please try again.': '取消存档标签时出错。请重试。',
    "Don't show this again": '不再显示',
    'Don’t show this again': '不再显示',

    // 按标签将议题转换为讨论（标题的复数写法 Convert issues to discussions 见 scoped）
    'Convert to discussions': '转换为讨论',
    'Convert issue to discussion': '将议题转换为讨论',
    'Issue will be locked': '议题将被锁定',
    'Existing links will redirect to the new discussion': '现有链接将重定向到新讨论',
    'You must choose a category for the discussion to belong to. You will be able to change this after the conversion is complete.':
      '你必须为讨论选择所属类别。转换完成后可以更改。',
    'Choose a category': '选择类别',
    'I understand, convert issue to discussion': '我已了解，将议题转换为讨论',
    'I understand, convert issues to discussions': '我已了解，将议题转换为讨论',
    'Future issues with this label will not be automatically converted into discussions.': '以后带有此标签的议题不会自动转换为讨论。',

    // 默认标签的说明：筛选框的标签建议、标签选择器里显示（标签区域里的同一说明见 LABEL_DESCRIPTIONS，两处译文相同）
    'Barrier affecting people with disabilities': '影响残障人士使用的障碍',
    "Something isn't working": '有功能不正常',
    'Something isn’t working': '有功能不正常',
    'Improvements or additions to documentation': '文档改进或补充',
    'This issue or pull request already exists': '此议题或拉取请求已存在',
    'New feature or request': '新功能或功能请求',
    'Good for newcomers': '适合新手',
    'Extra attention is needed': '需要额外关注',
    "This doesn't seem right": '这似乎不对',
    'This doesn’t seem right': '这似乎不对',
    'Further information is requested': '需要更多信息',
    'This will not be worked on': '不会处理',
    'Pull requests that update a dependency file': '更新依赖文件的拉取请求'
  },
  scoped: {
    Active: '活跃',
    Color: '颜色',
    'Delete failed': '删除失败',
    // 按标签转换的对话框标题（多个议题）；组织设置页另有同名权限名
    'Convert issues to discussions': '将议题转换为讨论'
  },
  regexp: [
    // 计数提示：20 open pull requests / 4 open issues（标签总数 59 labels 由通用词典处理）
    [/^([\d,]+) open pull requests?$/, '$1 个打开的拉取请求'],
    [/^([\d,]+) open issues?$/, '$1 个打开的议题'],
    // 标签行的无障碍名称：标签名 + 计数（计数的可见文字与提示文字被列表组件首尾相接；两段计数之间原文无标点，译文用空格隔开）
    // bug. 9 open pull requests9 open pull requests48 open issues48 open issues.（默认标签名与行里的标签令牌同译）
    [
      /^(.+?)\. (?=\d)(?:([\d,]+) open pull requests\2 open pull requests)?(?:([\d,]+) open issues\3 open issues)?\.$/,
      (_, name, pulls, issues) =>
        `${labelName(name)}。${[pulls ? `${pulls} 个打开的拉取请求` : '', issues ? `${issues} 个打开的议题` : ''].filter(Boolean).join(' ')}。`
    ],
    // 存档确认（默认标签名与行里的标签令牌同译，自定义标签名原样保留）
    [
      /^Archiving hides "(.+)" so it can[’']t be added to discussions, issues, or pull requests\. It remains on anything that already uses it, and you can unarchive it any time\.$/,
      (_, name: string) =>
        `存档后，“${labelName(name)}”将被隐藏，无法再添加到讨论、议题或拉取请求中。已使用它的内容会保留该标签，你可以随时取消存档。`
    ],
    // 颜色选择器：Red (#b60205)、Color: Red (#b60205)、Color: #ab12cd（括号内是色值，用半角括号并与中文隔开）
    [new RegExp(`^(${COLOR_NAME_SOURCE}) \\((${HEX_SOURCE})\\)$`), (_, name, hex) => `${COLOR_NAME[name] ?? name} (${hex})`],
    [new RegExp(`^Color: (${COLOR_NAME_SOURCE}) \\((${HEX_SOURCE})\\)$`), (_, name, hex) => `颜色：${COLOR_NAME[name] ?? name} (${hex})`],
    [new RegExp(`^Color: (${HEX_SOURCE})$`), '颜色：$1'],
    // 非预设颜色的色块按钮：Color: (#ab12cd)
    [new RegExp(`^Color: \\((${HEX_SOURCE})\\)$`), '颜色：($1)']
  ],
  attributeRules: [
    // 标签页列表行的标签链接（忽略区域根）：无障碍名称是标签名，已存档的前加 Archived；默认标签与链接里的标签令牌同译，
    // 自定义标签名保持原文（结果与原文相同时保持原文）
    [
      '[class*="labelRowDescription__"] a[aria-label]',
      'aria-label',
      /^(?:(Archived) )?(.+)$/,
      (_, archived: string, name: string) => archivedLabelName(archived, name)
    ],
    // 标签页列表行的无障碍名称（没有打开的议题、拉取请求时只有标签名）：good first issue.（默认标签名同译）
    ['li[data-label-id]', 'aria-label', new RegExp(`^(${LABEL_NAME_SOURCE})\\.$`), (_, name: string) => `${labelName(name)}。`]
  ],
  labels: LABEL_NAME_TABLE,
  labelDescriptions: LABEL_DESCRIPTIONS,
  labelRegexp: [ECOSYSTEM_DESCRIPTION]
} satisfies PageDictionary
