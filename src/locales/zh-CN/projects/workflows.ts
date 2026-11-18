import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { translateOptionName } from './templates'

/**
 * 项目（新版 Projects）：工作流。
 * 默认工作流名称、工作流编辑器（触发条件、操作块、筛选器校验）、自动添加 / 自动存档确认、
 * 代理自动分配、看板列上的工作流指示。
 */

/** 默认工作流名称（服务端数据，可被用户改名） */
export const WORKFLOW_NAMES: Readonly<Record<string, string>> = {
  'Item added to project': '项已添加到项目',
  'Item reopened': '项已重新打开',
  'Item closed': '项已关闭',
  'Code changes requested': '已请求代码更改',
  'Code review approved': '代码审查已批准',
  'Pull request merged': '拉取请求已合并',
  'Pull request linked to issue': '拉取请求已链接到议题',
  'Auto-archive items': '自动存档项',
  'Auto-add to project': '自动添加到项目',
  'Auto-close issue': '自动关闭议题',
  'Auto-add sub-issues to project': '自动将子议题添加到项目',
  'Item added': '项已添加'
}

function workflowName(name: string): string {
  return WORKFLOW_NAMES[name] ?? name
}

const TIME_UNITS: Readonly<Record<string, string>> = {
  minute: '分钟',
  hour: '小时',
  day: '天'
}

export default {
  static: {
    // 工作流编辑器
    'Save and turn on workflow': '保存并开启工作流',
    'Save workflow': '保存工作流',
    'Viewing mode. Click edit to make changes to this workflow.': '查看模式。单击编辑以修改此工作流。',
    'A workflow with this name already exists': '已存在同名工作流',
    'An empty filter will match all newly created and updated Issues and Pull Requests': '筛选器为空时将匹配所有新建和更新的议题与拉取请求',
    'Workflow name cannot be empty': '工作流名称不能为空',
    'A valid field is required': '需要有效的字段',
    'A query or a field id is required': '需要查询或字段 ID',
    'Workflow name cannot be longer than 250 characters': '工作流名称不能超过 250 个字符',
    'Add the item to the project': '将项添加到项目',
    'Add sub-issues to the project': '将子议题添加到项目',
    'When the filter matches a new or updated item': '筛选器匹配新建或更新的项时',
    'When an item in the project has sub-issues': '项目中的项有子议题时',
    'When an item is added to the project': '项添加到项目时',
    'When an item is reopened': '项重新打开时',
    'When an item is closed': '项关闭时',
    'When a pull request has a review requesting changes': '拉取请求的审查请求更改时',
    'When a pull request is approved': '拉取请求获得批准时',
    'When a pull request is merged': '拉取请求合并时',
    'When a pull request is linked to an issue': '拉取请求链接到议题时',
    'When the status is updated': '状态更新时',
    'Going forward, all new or updated items that match your filter will be auto added. You can also manually add items that currently match your filter':
      '之后所有与筛选器匹配的新建或更新项都会自动添加。当前匹配的项也可手动添加',
    'Link to GitHub Docs page about adding multiple issues or pull requests to a project':
      '关于向项目添加多个议题或拉取请求的 GitHub 文档链接',
    'Enabling this workflow will automatically add sub-issues in the following scenarios:': '启用此工作流会在以下情况下自动添加子议题：',
    'When a sub-issue is added to an issue in the project': '项目中的议题添加了子议题时',
    'When an issue with sub-issues is added to the project': '有子议题的议题添加到项目时',
    'Note: This workflow will initially add all existing sub-issues of issues in the project.':
      '注意：此工作流首次运行时会添加项目中议题的所有现有子议题。',
    'existing items that match this query': '个与此查询匹配的现有项',
    'Something went wrong loading this workflow configuration.': '加载此工作流配置时出错。',
    'Workflow list': '工作流列表',
    'No workflows': '没有工作流',
    'Open workflow options': '打开工作流选项',
    'Edit workflow name': '编辑工作流名称',
    'Workflow name': '工作流名称',
    'Default workflows': '默认工作流',
    'Configure workflows': '配置工作流',
    'Select a content type': '选择内容类型',

    // 启用 / 更新确认
    'Update workflow': '更新工作流',
    'Update workflow?': '更新工作流？',
    'Disable workflow?': '禁用工作流？',
    'Enable workflow?': '启用工作流？',
    'You have to disable this workflow to be able to edit this field.': '需先禁用此工作流才能编辑此字段。',
    'Updating this workflow will archive': '更新此工作流将存档',
    'Enabling this workflow will archive': '启用此工作流将存档',
    'items that currently meet the filter conditions.': '个当前满足筛选条件的项。',
    'item that currently meet the filter conditions.': '个当前满足筛选条件的项。',
    'As future items match filter conditions, they will be automatically archived.': '之后满足筛选条件的项也会自动存档。',

    // 删除 / 新建 / 复制工作流
    'Could not delete workflow, please try again': '无法删除工作流，请重试',
    'Workflow deleted': '工作流已删除',
    'Delete workflow': '删除工作流',
    'Are you sure you want to delete this workflow? This action cannot be undone.': '确定要删除此工作流吗？此操作无法撤销。',
    'New auto-add workflow': '新建自动添加工作流',
    'Duplicate workflow': '复制工作流',
    'New workflow': '新建工作流',
    'Maximum number of auto-add workflows reached. Delete a workflow or upgrade your plan to continue.':
      '自动添加工作流数量已达上限。删除工作流或升级计划后才能继续。',

    // 代理自动分配（原文没有的逗号不加）
    'Auto-assign issues to agent': '自动将议题分配给代理',
    'Assigns maximum 5 agents at once. Respects column limits.': '一次最多分配 5 个代理。遵守列上限。',
    'The agent assigned to work on issues in this project': '负责处理此项目议题的代理',
    'The configured model is no longer available. Future auto-assign runs will use the default model until a valid model is selected.':
      '已配置的模型不再可用。选择有效模型之前自动分配将使用默认模型。',
    'Source column': '来源列',
    'Auto-assign to agent': '自动分配给代理',
    'Auto-assign enabled': '自动分配已启用',
    'Auto-assign disabled': '自动分配已禁用',
    'Add auto-assign workflow': '添加自动分配工作流',
    'Pause auto-assign': '暂停自动分配',
    'Enable auto-assign': '启用自动分配'
  },
  scoped: {
    // 默认工作流名称
    ...WORKFLOW_NAMES,
    // 通用文本（仅项目页生效）
    'Filter cannot be empty': '筛选器不能为空',
    'A valid value is required': '需要有效的值',
    'An action is required': '需要操作',
    'A type is required': '需要类型',
    'A query is required': '需要查询',
    'A repository is required': '需要存储库',
    'A value is required': '需要值',
    'Filter contains invalid syntax': '筛选器包含无效语法',
    'Close the issue': '关闭议题',
    'Save and enable': '保存并启用',
    'Assign agent': '分配代理',
    'starts and moves to': '开始并移到',
    'The AI model used by the agent to complete work': '代理完成工作所用的 AI 模型',
    'Select a repository to choose a specific model': '选择存储库后才能指定模型',
    'Filter models': '筛选模型',
    'The repository the agent will work in. Set to auto-detect from the issue': '代理工作的存储库。设为根据议题自动检测',
    'Set by issue': '由议题决定',
    'Additional instructions for this agent': '给此代理的附加说明',
    'Provide additional instructions for the agent': '为代理提供附加说明',
    'Prompt cannot be longer than 4000 characters': '提示不能超过 4000 个字符',
    Workflows: '工作流',
    'is added': '已添加',
    // “筛选项”易读作名词（筛选选项），写全“项目项”
    'Filter items': '筛选项目项',
    'Set value': '设置值',
    'Archive item': '存档项',
    'Oops!': '出错了！',
    See: '查看',
    Recommended: '推荐',
    Model: '模型',
    Auto: '自动',
    Prompt: '提示',
    On: '开',
    Off: '关',
    Pause: '暂停',
    Enable: '启用',
    Disabled: '已禁用'
  },
  regexp: [
    // 复制的工作流名：Duplicate of Item closed。只接大写或数字开头的名称，避开议题关闭菜单的 Duplicate of another issue
    [/^Duplicate of ([A-Z0-9].*)$/, (_, name: string) => joinCjk(workflowName(name), '的副本')],
    [/^See (\d+) existing items that match this query$/, '查看 $1 个与此查询匹配的现有项'],
    [/^(\d+) items? match(?:es)? this query$/, '$1 个项与此查询匹配'],
    // 原文没有逗号，译文也不加
    [
      /^Using the (.+) operator means that your workflow will run every (\d+) (minutes?|hours?|days?)$/,
      (_, field: string, value: string, unit: string) =>
        `使用 ${field} 运算符时工作流每 ${value} ${TIME_UNITS[unit.replace(/s$/, '')] ?? unit}运行一次`
    ],
    // 看板列上的工作流指示（strings.ts 的 columnWorkflowIndicator*，for 后都是列名）：列名原文没有引号，译文也不加
    [/^Workflows for (.+)$/, (_, column: string) => joinCjk(translateOptionName(column), '列的工作流')],
    [
      /^(\d+) workflows configured for (.+)$/,
      (_, count: string, column: string) => joinCjk(translateOptionName(column), `列配置了 ${count} 个工作流`)
    ],
    [
      /^Auto-assign (enabled|disabled) for (.+)$/,
      (_, state: string, column: string) => joinCjk(translateOptionName(column), `列的自动分配${state === 'enabled' ? '已启用' : '已禁用'}`)
    ],
    // 工作流名不含句末标点，且不以 is / are / been 等结尾，避免误配普通句子。
    // 两个译名相连无法断句，改语序并补“列”“工作流”：已为已完成列启用项已关闭工作流
    [
      /^([^.,:;!?]+?)(?<! (?:is|are|was|were|been|be)) (enabled|disabled) for ([^.,:;!?]+)$/,
      (_, name: string, state: string, column: string) =>
        joinCjk(
          joinCjk(joinCjk('已为', translateOptionName(column)), `列${state === 'enabled' ? '启用' : '禁用'}`),
          joinCjk(workflowName(name), '工作流')
        )
    ],
    // 状态字段设置页：Item added to project: Active
    [
      /^(Item added to project|Item added): (Active|Disabled)$/,
      (_, name: string, state: string) => `${workflowName(name)}：${state === 'Active' ? '已启用' : '已禁用'}`
    ]
  ]
} satisfies PageDictionary
