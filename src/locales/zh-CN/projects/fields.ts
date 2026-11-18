import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 项目（新版 Projects）：字段。
 * 系统字段与模板默认字段名、字段类型、新建字段对话框、字段设置页、单选 / 迭代选项、
 * 议题字段导入、默认值、字段排序、删除字段与删除选项。
 */

/** 系统字段与模板默认字段名 → 译文；用于表头、分组、筛选等拼接文本 */
export const FIELD_NAMES: Readonly<Record<string, string>> = {
  Title: '标题',
  Assignees: '受理人',
  Status: '状态',
  Labels: '标签',
  'Linked pull requests': '链接的拉取请求',
  Milestone: '里程碑',
  Repository: '存储库',
  Reviewers: '审查者',
  'Parent issue': '父议题',
  'Sub-issues progress': '子议题进度',
  Type: '类型',
  'Issue type': '议题类型',
  Created: '创建时间',
  Updated: '更新时间',
  Closed: '关闭时间',
  Iteration: '迭代',
  Estimate: '估算',
  Priority: '优先级',
  Size: '规模',
  'Start date': '开始日期',
  'Target date': '目标日期',
  'End date': '结束日期'
}

const FIELD_NAMES_LOWER = new Map(Object.entries(FIELD_NAMES).map(([name, zh]) => [name.toLowerCase(), zh]))

/** 已知字段名返回译文（不区分大小写），其余（用户自定义字段）原样返回 */
export function translateFieldName(name: string): string {
  return FIELD_NAMES[name] ?? FIELD_NAMES_LOWER.get(name.toLowerCase()) ?? name
}

/** 字段名正则片段（不含捕获组），长名在前 */
export const FIELD_NAME_SOURCE = Object.keys(FIELD_NAMES)
  .sort((a, b) => b.length - a.length)
  .map(name => name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
  .join('|')

/** 拼接用户字段名后，在中文与英文 / 数字之间补空格 */
export function pangu(text: string): string {
  return text.replace(/([一-鿿])([A-Za-z0-9])/g, '$1 $2').replace(/([A-Za-z0-9])([一-鿿])/g, '$1 $2')
}

const VALUE_NOUNS: Readonly<Record<string, string>> = {
  option: '选项',
  options: '选项',
  iteration: '迭代',
  iterations: '迭代',
  'iteration value': '迭代值',
  'iteration values': '迭代值',
  value: '值',
  values: '值'
}

function valueNoun(noun: string): string {
  return VALUE_NOUNS[noun] ?? noun
}

const NOUN_SOURCE = '(?:option|options|iteration|iterations|value|values)'

export default {
  static: {
    // 字段菜单（Visible fields 与议题视图共用，由 issues 词典收录）
    'New field': '新建字段',
    'Hidden fields': '隐藏的字段',
    'Add field': '添加字段',
    'Project fields': '项目字段',
    'Manage fields...': '管理字段...',
    'Create a new field configuration': '新建字段配置',
    'Field name': '字段名称',
    'Field type': '字段类型',
    'Field name is required.': '字段名称为必填项。',
    "Field name can't contain colons": '字段名称不能包含冒号',
    'This field name has already been taken': '此字段名称已被使用',
    'This field name is a reserved word': '此字段名称是保留字',
    'Error: At least one valid option is required for the status field': '错误：状态字段至少需要一个有效选项',
    'At least one option is required for the select type fields': '选择类字段至少需要一个选项',
    'Column options failed to update.': '列选项更新失败。',
    'Single select': '单选',
    'Multi select': '多选',
    'Choose an iteration…': '选择迭代…',
    'Choose an option…': '选择选项…',
    'Date editor': '日期编辑器',
    'Number editor': '数字编辑器',
    'Text editor': '文本编辑器',
    'This field must be an integer': '此字段必须为整数',
    'This field must be positive or 0.': '此字段必须为正数或 0。',

    // 字段设置页
    'Custom fields': '自定义字段',
    'Custom field options': '自定义字段选项',
    'Reorder fields': '调整字段顺序',
    'Reorder custom fields': '调整自定义字段顺序',
    'Reorder fields list': '字段顺序列表',
    'Reorder custom fields list': '自定义字段顺序列表',
    'Change the order in which fields appear on project items and in field lists.': '更改字段在项目项和字段列表中的显示顺序。',
    'Change the order in which custom fields appear on project items and in field lists.': '更改自定义字段在项目项和字段列表中的显示顺序。',
    'appear on project items and in field lists.': '在项目项和字段列表中的显示顺序。',
    'No fields are available to reorder.': '没有可调整顺序的字段。',
    'No sortable columns available. Only custom fields can be reordered.': '没有可排序的列。只能调整自定义字段的顺序。',
    'Move field...': '移动字段...',
    'Edit field': '编辑字段',
    'Issue field': '议题字段',
    // 字段设置页的说明：链接版由下方 inline 规则整句译出，无链接时三个文本节点相邻、按整句匹配
    'Issue fields can only be edited in the': '议题字段只能在以下位置编辑',
    "Issue fields can only be edited in the project owner's settings.": '议题字段只能在项目所有者的设置中编辑。',
    'Remove field': '移除字段',
    'Delete field': '删除字段',
    'This field no longer exists': '此字段已不存在',
    'Select another field to view settings.': '选择其他字段以查看设置。',
    'New items added to the project will automatically have this value set for this field.': '添加到项目的新项会自动将此字段设为该值。',

    // 删除 / 移除字段
    'Delete field?': '删除字段？',
    'Remove field from project?': '从项目中移除字段？',
    'Permanently delete data from this project?': '永久删除此项目中的数据？',
    'from this project, but it will remain on existing issues.': '从此项目中移除，但会保留在现有议题上。',
    'You can add it back to the project anytime.': '可随时将其重新添加到项目。',
    'Delete field and data': '删除字段和数据',

    // 单选选项
    'Single select options': '单选选项',
    'Add option': '添加选项',
    'Add option…': '添加选项…',
    'Option has already been taken': '该选项已存在',
    'Option names cannot contain ","': '选项名称不能包含“,”',
    'Edit option': '编辑选项',
    'New option': '新建选项',
    'Edit option dialog': '编辑选项对话框',
    'New option dialog': '新建选项对话框',
    'Advanced Move...': '高级移动...',
    'Remove option': '移除选项',
    'Create new option': '新建选项',
    'Visible in group headers and value pickers': '显示在分组标题和值选择器中',

    // 进度字段
    'Segmented bar': '分段条形图',
    'Progress visualization variant': '进度显示样式',
    'Show numerical value': '显示数值',

    // 迭代
    'Duration quantity': '时长数值',
    'Add iteration': '添加迭代',
    'Add new iteration configuration': '添加新的迭代配置',
    'Active iterations': '活动迭代',
    'Completed iterations': '已完成迭代',
    'Insert break': '插入间隔',
    'Insert break above': '在上方插入间隔',
    'Insert break below': '在下方插入间隔',
    'Edit iteration name': '编辑迭代名称',
    "You're out of iterations.": '迭代已用完。',
    'Create an iteration using the "+ Add iteration" button above.': '使用上方的“+ 添加迭代”按钮创建迭代。',
    'No completed iterations.': '没有已完成的迭代。',
    'Iterations will automatically move here over time.': '迭代会随时间自动移到这里。',
    'Iteration length cannot be blank': '迭代时长不能为空',
    'Iteration not found': '未找到迭代',
    'Create an iteration': '创建迭代',
    'Create an Iteration': '创建迭代',

    // 议题字段
    'Add issue fields': '添加议题字段',
    'Introducing issue fields 🗂️': '议题字段上线 🗂️',
    'Add issue fields to keep information consistent across your issues.': '添加议题字段以保持各议题信息一致。',
    'Close issue field quick add actions': '关闭议题字段快速添加',
    'See more fields': '查看更多字段',
    'This field conflicts with an issue field. Rename this field.': '此字段与议题字段冲突。请重命名此字段。',
    'No Issue Fields available': '没有可用的议题字段',
    "All issue fields have restricted visibility and can't be added to this project.": '所有议题字段都因可见性受限而无法添加到此项目。',
    'All available Issue Fields have been added to this project.': '所有可用的议题字段都已添加到此项目。',
    "Issue fields can be created in the project owner's settings.": '可在项目所有者的设置中创建议题字段。',
    'Manage Issue Fields': '管理议题字段',
    'Some issue fields are not available because of their visibility settings.': '部分议题字段因可见性设置不可用。',
    'Rename duplicate field': '重命名重复字段',
    'Field limit reached': '字段数量已达上限',
    'No fields selected': '未选择字段',
    'Too many fields selected': '所选字段过多',
    'Unable to add selected fields': '无法添加所选字段',
    'Select at least one field to continue.': '至少选择一个字段。',
    'Something went wrong adding fields.': '添加字段时出错。',
    'Manage fields': '管理字段',
    'Projects cannot have more than 50 fields': '项目最多只能有 50 个字段',

    // 议题类型设置
    'Set up issue types in your project': '在项目中设置议题类型',
    'Rename field': '重命名字段',
    'Selecting the type field on a project, and applying Epic, Feature, and Task to project items':
      '在项目中选择类型字段，并为项目项设置 Epic、Feature 和 Task',
    'New timestamp fields available': '新增时间戳字段',
    'You can now add Created, Closed, and Updated timestamp fields to your project to track when issues and pull requests were created, closed, or last updated.':
      '现在可以向项目添加创建时间、关闭时间和更新时间字段，跟踪议题和拉取请求的创建、关闭和最后更新时间。'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Save and create': '保存并创建',
    'Title cannot be blank': '标题不能为空',
    'Created at': '创建时间',
    'Updated at': '更新时间',
    'Closed at': '关闭时间',
    'Sub-issues progress': '子议题进度',
    'Linked pull requests': '链接的拉取请求',
    'No linked pull requests': '没有链接的拉取请求',
    'Enter a number…': '输入数字…',
    'Enter text…': '输入文本…',
    'Enter a date…': '输入日期…',
    'Change the order in which': '更改',
    "Reorder couldn't be saved": '无法保存顺序',
    "project owner's settings": '项目所有者的设置',
    'Default value': '默认值',
    'Enter default text': '输入默认文本',
    'Enter default number': '输入默认数字',
    'Action required': '需要操作',
    'Changes saved. Return to': '更改已保存。返回',
    'and remove its data from': '并从以下位置删除其数据',
    'This cannot be undone.': '此操作无法撤销。',
    'Warning:': '警告：',
    'Label text': '标签文本',
    'Label text is required': '标签文本为必填项',
    'Set as default': '设为默认',
    'Unset as default': '取消默认',
    'Filter options': '筛选选项',
    'Starts on': '开始于',
    'Naming conflict': '名称冲突',
    'Learn more about issue types.': '了解议题类型。',
    'I’ll do it later': '稍后再说',
    'Finish setup': '完成设置',
    'Issues create dialog with issue type selection': '带议题类型选择的新建议题对话框',
    // 系统字段与模板默认字段（与其他页面共用的词，用 scoped 避免冲突）
    Title: '标题',
    Assignees: '受理人',
    Labels: '标签',
    Milestone: '里程碑',
    Reviewers: '审查者',
    'Parent issue': '父议题',
    Type: '类型',
    Created: '创建时间',
    Updated: '更新时间',
    Iteration: '迭代',
    Estimate: '估算',
    Priority: '优先级',
    Size: '规模',
    'Start date': '开始日期',
    'Target date': '目标日期',
    'End date': '结束日期',
    'Issue type': '议题类型',
    // 字段类型与设置
    Number: '数字',
    Date: '日期',
    Text: '文本',
    Options: '选项',
    Default: '默认',
    Color: '颜色',
    Bar: '条形图',
    Ring: '环形图',
    Fields: '字段',
    'custom fields': '自定义字段',
    fields: '字段',
    'Saved!': '已保存！',
    Added: '已添加',
    Rename: '重命名',
    Resolve: '解决',
    'Get Started': '开始使用',
    'Got it': '知道了',
    // 迭代
    Duration: '时长',
    day: '天',
    days: '天',
    week: '周',
    weeks: '周',
    Current: '当前',
    Planned: '计划中',
    Completed: '已完成',
    Active: '活动',
    'Remove item': '移除'
  },
  regexp: [
    // 字段设置页（字段名原文没有引号，译文也不加；中英文之间由 pangu / joinCjk 补空格；原文没有的逗号不加）
    [/^(.+) field settings$/, (_, name: string) => pangu(`${translateFieldName(name)}字段设置`)],
    [
      /^(.+) fields are created by GitHub and cannot be renamed\.$/,
      (_, name: string) => pangu(`${translateFieldName(name)}字段由 GitHub 创建且无法重命名。`)
    ],
    // 原文是 field actions；去掉引号后“打开状态的操作”有歧义，补“字段”：打开状态字段的操作
    [/^Open field actions for (.+)$/, (_, name: string) => joinCjk(joinCjk('打开', translateFieldName(name)), '字段的操作')],
    [/^Move field (.+)$/, (_, name: string) => joinCjk('移动字段', translateFieldName(name))],
    [new RegExp(`^(${FIELD_NAME_SOURCE}) options$`), (_, name: string) => `${translateFieldName(name)}选项`],
    [/^Add ([a-z][\w -]*)…$/, (_, name: string) => pangu(`添加${translateFieldName(name)}…`)],

    // 删除 / 移除字段（原文的 “” 保留；带数据的整句由下方 inline 规则译出，不构成行内句时按首段翻译）
    [
      /^This will delete the field “(.+)”(\.)?$/,
      (_, name: string, dot?: string) => `这将删除字段“${translateFieldName(name)}”${dot ? '。' : ''}`
    ],
    [
      /^This will delete the field “(.+)” and remove its data from$/,
      (_, name: string) => `这将删除字段“${translateFieldName(name)}”并从以下位置删除其数据`
    ],
    [
      /^This will remove the field “(.+)” from this project, but it will remain on existing issues\.$/,
      (_, name: string) => `这将从此项目中移除字段“${translateFieldName(name)}”，但会保留在现有议题上。`
    ],
    [/^This will remove the field “(.+)”$/, (_, name: string) => `这将移除字段“${translateFieldName(name)}”`],
    [/^(\d+) items?$/, '$1 个项'],
    [/^(\d+) workflows?$/, '$1 个工作流'],

    // 单选选项（选项名是用户内容，原文没有引号，译文也不加）
    [/^Open edit dialog for (.+)$/, (_, name: string) => joinCjk(joinCjk('打开', name), '的编辑对话框')],
    [/^Advanced move (.+)\.\.\.$/, (_, name: string) => `${joinCjk('高级移动', name)}...`],
    [/^Set (.+) as default$/, (_, name: string) => joinCjk(joinCjk('将', name), '设为默认')],
    [/^Unset (.+) as default$/, (_, name: string) => joinCjk(joinCjk('取消', name), '的默认')],
    [/^Maximum of (\d+) options reached$/, '已达到 $1 个选项的上限'],
    [/^Label text must be (\d+) characters or fewer$/, '标签文本不能超过 $1 个字符'],
    [/^Description must be (\d+) characters or fewer$/, '描述不能超过 $1 个字符'],

    // 迭代
    [/^Iteration length must be (\d+) or more$/, '迭代时长不能少于 $1'],
    [/^Iteration length must be (\d+) or less$/, '迭代时长不能超过 $1'],
    [/^(\d+) Active$/, '活动 $1'],
    [/^(\d+) Completed$/, '已完成 $1'],
    [/^(\d+) active iterations? will also be pushed forward\.$/, '$1 个活动迭代也会顺延。'],
    // 读屏播报（iteration-field-options.tsx）：Return to 后是项目标题（用户内容），原样保留、不加引号
    [/^Changes saved\. Return to (.+)\.$/, (_, title: string) => `${joinCjk('更改已保存。返回', title)}。`],

    // 删除选项 / 迭代（未参与匹配的捕获组为空字符串）
    [
      new RegExp(`^Delete (?:(${NOUN_SOURCE})|(\\d+) (${NOUN_SOURCE}))(\\?)?$`),
      (_, single: string, count: string, plural: string, mark: string) =>
        `删除${count ? ` ${count} 个` : ''}${valueNoun(single || plural)}${mark ? '？' : ''}`
    ],
    [
      /^This will permanently delete (?:this|these) (option|options|iteration|iterations|value|values|iteration value|iteration values) from the "(.+)" field and will impact everyone using this project\.$/,
      (_, noun: string, field: string) =>
        `这将从“${translateFieldName(field)}”字段中永久删除所选${valueNoun(noun)}并影响此项目的所有使用者。`
    ],
    [
      new RegExp(`^The ${NOUN_SOURCE} will be permanently deleted from (\\d+) items? in this project\\.$`),
      '将从此项目的 $1 个项中永久删除。'
    ],
    [new RegExp(`^The ${NOUN_SOURCE} will be permanently deleted from any items in this project\\.$`), '将从此项目的所有项中永久删除。'],
    [
      /^(?:This iteration value|These iteration values) will be removed from (\d+) items? in this project\.$/,
      '将从此项目的 $1 个项中移除。'
    ],
    [/^(?:This iteration value|These iteration values) will be removed from any items in this project\.$/, '将从此项目的所有项中移除。'],
    [
      new RegExp(
        `^(?:This|These) (${NOUN_SOURCE}) (?:is|are) used in (\\d+) workflows?\\. Deleting (?:it|them) will disable the workflows? and invalidate any actions referencing (?:it|them)\\.$`
      ),
      (_, noun: string, count: string) => `${count} 个工作流正在使用所选${valueNoun(noun)}。删除后会禁用相关工作流并使引用它的操作失效。`
    ],

    // 议题字段（字段名原文没有引号，译文也不加；两句之间随原文用句号）
    [/^Use issue fields defined by (.+) to keep information consistent across projects\.$/, '使用 $1 定义的议题字段以保持各项目信息一致。'],
    [/^Add (.+) field to project$/, (_, name: string) => joinCjk(joinCjk('将', translateFieldName(name)), '字段添加到项目')],
    [/^(.+) field added to project$/, (_, name: string) => joinCjk(translateFieldName(name), '字段已添加到项目')],
    [
      /^Could not add (.+) field to project\. Please try again\.$/,
      (_, name: string) => `${joinCjk(joinCjk('无法将', translateFieldName(name)), '字段添加到项目')}。请重试。`
    ],
    [/^In order to add the "(.+)" issue field, you need to rename your project field\.$/, '要添加“$1”议题字段，需先重命名项目字段。'],
    [/^Rename project field "(.+)"$/, '重命名项目字段“$1”'],
    [
      /^You already have (\d+) fields in your project\. Remove some in order to add more fields\.$/,
      '项目已有 $1 个字段。移除部分字段后才能添加。'
    ],
    [/^You can only add (\d+) at a time\. Deselect some fields to continue\.$/, '一次最多添加 $1 个。取消选择部分字段后继续。'],
    [
      /^You already have (\d+) fields in your project\. Adding these would exceed the (\d+)-field limit\.$/,
      '项目已有 $1 个字段。添加后将超出 $2 个字段的上限。'
    ],
    [/^Issue fields can only be applied to issues within the (.+) organization$/, '议题字段只能用于 $1 组织内的议题'],

    // 议题类型设置（原文右引号误用为左引号 “）
    [
      /^Rename your “(.+)[“”] custom field and start using issue types defined by your organization\.$/,
      '重命名自定义字段“$1”并开始使用组织定义的议题类型。'
    ],
    [
      /^To start using issue types in your project, please rename your “(.+)[“”] custom field and update any filters that reference it\.$/,
      '要在项目中使用议题类型，需重命名自定义字段“$1”并更新引用它的筛选器。'
    ]
  ],
  inline: [
    // 删除字段对话框（delete-field-dialog.tsx）：<p>This will delete the field “字段” and remove its data from <strong>3 items</strong> and <strong>2 workflows</strong>.</p>
    // 只有项或只有工作流时一个槽位，两者都有时两个槽位；槽位内是“3 个项”“2 个工作流”（数字开头、中文结尾），
    // 译文只在槽位前留空格，原文没有的逗号不加。不构成行内句时按上方 regexp 的首段翻译
    [
      /^This will delete the field “(.+)” and remove its data from \{\}\.$/,
      (_, name: string) => `这将删除字段“${translateFieldName(name)}”并从 {}中删除其数据。`
    ],
    [
      /^This will delete the field “(.+)” and remove its data from \{\} and \{\}\.$/,
      (_, name: string) => `这将删除字段“${translateFieldName(name)}”并从 {}和 {}中删除其数据。`
    ],
    // 字段设置页议题字段的说明（column-settings-view.tsx）：<span>Issue fields can only be edited in the <a>project owner's settings</a>.</span>
    ['Issue fields can only be edited in the {}.', '议题字段只能在{}中编辑。']
  ]
} satisfies PageDictionary
