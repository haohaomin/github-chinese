import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { archivedLabelName } from './labels'
import { joinName } from './list'

/** 选择器中“暂时无法编辑 X”的对象名 */
const PICKER_SUBJECT: Readonly<Record<string, string>> = {
  assignees: '受理人',
  labels: '标签',
  milestone: '里程碑',
  milestones: '里程碑',
  projects: '项目',
  'issue type': '议题类型',
  'issue types': '议题类型'
}

/** 依赖关系上限提示中的关系名 */
const RELATION_NAME: Readonly<Record<string, string>> = { 'blocked by': '被阻止', blocking: '阻止' }

/** 侧栏分区标题旁“编辑”按钮的读屏文字：Edit Assignees */
const SECTION_NAME: Readonly<Record<string, string>> = {
  Assignees: '受理人',
  Labels: '标签',
  Type: '类型',
  'Issue type': '议题类型',
  Projects: '项目',
  Milestone: '里程碑',
  Relationships: '关系',
  Development: '开发',
  Fields: '字段',
  Participants: '参与者'
}

const SECTION_NAME_SOURCE = Object.keys(SECTION_NAME).join('|')

/**
 * 默认议题类型（组织预置）的名称：默认类型名称表（PageDictionary.issueTypes），只在议题类型名称区域内整段匹配；
 * 组织自定义的类型名是用户内容，不收
 */
const ISSUE_TYPE_NAMES: Readonly<Record<string, string>> = {
  Task: '任务',
  Bug: '缺陷',
  Feature: '功能'
}

/** 看板卡片存储库按钮中的存储库状态 */
const REPOSITORY_STATUS: Readonly<Record<string, string>> = {
  public: '公共',
  private: '专用',
  fork: '复刻',
  archived: '已存档'
}

/**
 * 议题侧栏：受理人、标签、类型、项目、里程碑、议题字段、关系、开发（分支与拉取请求）、参与者，
 * 以及侧栏中的各类选择器、子议题列表。
 */
export default {
  static: {
    // 受理人 / 标签 / 里程碑 / 项目
    'Apply labels to this issue': '为此议题应用标签',
    'Archived in project:': '已在项目中存档：',
    'Issue could not be restored in project': '无法在项目中恢复议题',
    'Issue restored in project': '议题已在项目中恢复',
    'Move card to column': '将卡片移至列',
    'Show more project fields': '显示更多项目字段',
    'Hide project fields': '隐藏项目字段',
    'Could not update projects': '无法更新项目',
    'Projects are currently unavailable': '项目暂不可用',
    'You may only link 10 pull requests to this issue across all repositories.': '此议题在所有存储库中最多只能链接 10 个拉取请求。',
    'This project has reached the maximum of 50,000 items. To add more, please delete existing items from the project.':
      '此项目已达到 50,000 个项的上限。如需添加，请先从项目中删除现有项。',
    'Project items limit reached dialog': '项目项上限对话框',
    'Project limits reached': '已达到项目上限',
    'One or more of the projects you selected has reached the maximum of 50,000 items. To add more, please delete existing items from the selected project(s).':
      '所选项目中至少有一个已达到 50,000 个项的上限。如需添加，请先从所选项目中删除现有项。',
    'Failed to update issue labels': '更新议题标签失败',
    'Failed to update issue milestone': '更新议题里程碑失败',
    'Failed to update issue type': '更新议题类型失败',
    'Failed to add issue to project': '将议题添加到项目失败',
    'Failed to remove issue from project': '从项目中删除议题失败',
    'Could not update issue type': '无法更新议题类型',
    'No issue type': '无议题类型',
    'Filter issue types': '筛选议题类型',
    'Issue Type results': '议题类型结果',
    'No issue types were found': '未找到议题类型',
    // 分配代理对话框的默认标题（具名代理见正则）
    'Assign agent to issue': '将代理分配给议题',

    // 议题字段
    'Something went wrong while setting the field value. Please try again.': '设置字段值时出错。请重试。',
    "Couldn't load issue fields": '无法加载议题字段',
    "We couldn't load the issue fields. Please try again later or if the problem persists contact support":
      '无法加载议题字段。请稍后重试；仍然出错时请联系支持',
    // <添加字段> to track more details about your issues.（链接后的片段，原文无逗号）
    'to track more details about your issues.': '来跟踪议题的更多详细信息。',
    'Reload site? Changes you made might not be saved.': '重新加载网站？你所做的更改可能不会保存。',
    'Must contain only numbers, decimals, and optional negative sign': '只能包含数字、小数点和可选的负号',
    'There was an error updating this value. Please try again.': '更新此值时出错。请重试。',
    'No fields configured for issues without a type.': '无类型的议题未配置字段。',
    'Field is visible to the public.': '此字段公开可见。',
    'Field is visible to all organizations in this enterprise.': '此字段对此企业中的所有组织可见。',
    'This status automatically assigns the issue to an agent.': '此状态会自动将议题分配给代理。',
    'Issue field option results': '议题字段选项结果',

    // 关系
    'Relationships are currently unavailable': '关系暂不可用',
    'Mark issues that relate to the current issue…': '标记与当前议题相关的议题…',
    "We couldn't load the related issues. Try reloading the page, or if the problem persists, contact support.":
      '无法加载相关议题。请尝试重新加载页面；仍然出错时请联系支持。',
    "We couldn't load the issues. Try reloading the page, or if the problem persists, contact support.":
      '无法加载议题。请尝试重新加载页面；仍然出错时请联系支持。',
    'No blocked by issues found': '未找到阻止此议题的议题',
    'No blocking issues found': '未找到被此议题阻止的议题',
    'No linked security alerts found': '未找到链接的安全警报',
    'No related issues found': '未找到相关议题',
    'Mark current issue as blocked by…': '将当前议题标记为被以下议题阻止…',
    'Mark current issue as blocking…': '将当前议题标记为阻止以下议题…',
    'Private issues are hidden.': '专用议题已隐藏。',
    'Failed to remove parent issue': '删除父议题失败',
    'Unable to remove parent issue': '无法删除父议题',
    'Failed to set parent': '设置父议题失败',
    'Failed to add related issue': '添加相关议题失败',
    'Failed to remove related issue': '删除相关议题失败',
    'An issue may not be blocked by an issue that it is already blocking. Please remove the existing relationship before adding this one.':
      '议题不能被它正在阻止的议题阻止。请先删除现有关系再添加。',
    "You do not have permission to take this action for the selected issue. A repository role of 'triage' or higher is required on the selected issue.":
      '你无权对所选议题执行此操作。需要在所选议题的存储库中拥有“分类”或更高角色。',
    "You do not have permission to take this action for the selected issue. A repository role of 'triage' or higher is required.":
      '你无权对所选议题执行此操作。需要“分类”或更高的存储库角色。',
    'An issue cannot have more than 50 links': '议题最多只能有 50 个链接',

    // 开发
    'No branches or linked pull requests': '没有分支或链接的拉取请求',
    'Development is currently unavailable': '开发信息暂不可用',
    // <创建分支> for this issue or link a pull request.（链接后的片段，原文无逗号）
    'for this issue or link a pull request.': '用于此议题或链接一个拉取请求。',
    'Select a repository to search for branches and pull requests or': '选择要搜索分支和拉取请求的存储库或',
    'Edit the pull request description to unlink': '编辑拉取请求描述以取消链接',
    'Create a branch for this issue': '为此议题创建分支',
    'Shows branches and pull requests linked to this issue.': '显示链接到此议题的分支和拉取请求。',
    'When branches are created from issues, their pull requests are automatically linked.': '从议题创建分支时，其拉取请求会自动链接。',
    'Link a pull request from this repository': '链接此存储库中的拉取请求',
    'Search for branches or pull requests': '搜索分支或拉取请求',
    // 产品名按用户要求译成中文（product-names.md）：codespace → 代码空间
    'Start a codespace with Copilot agent mode for this issue in another repository.':
      '在其他存储库中为此议题启动使用 Copilot 代理模式的代码空间。',
    'Could not update linked pull requests': '无法更新链接的拉取请求',
    'Could not update linked branches': '无法更新关联的分支',

    // 参与者 / 通知
    'Only the first 100 participants are shown in this list.': '此列表仅显示前 100 个参与者。',
    'Participants are currently unavailable': '参与者暂不可用',
    'Notifications are currently unavailable': '通知暂不可用',

    // 子议题
    'Create sub-issue': '创建子议题',
    'Convert to sub-issue': '转换为子议题',
    'View more sub-issue options': '查看更多子议题选项',
    'Sub-issue options': '子议题选项',
    'Remove sub-issue': '删除子议题',
    'Failed to remove sub-issue': '删除子议题失败',
    'Failed to reorder sub-issue': '调整子议题顺序失败',
    'Closed sub-issues hidden': '已隐藏已关闭的子议题',
    'All sub-issues shown': '已显示全部子议题',
    'Sub-issues are limited to one parent. Confirm you want to proceed with this change.': '子议题只能有一个父议题。请确认是否继续此更改。',
    'Sub-issue added': '已添加子议题',
    'Failed to add sub-issue': '添加子议题失败',
    'Sub-issue limit reached': '已达到子议题上限',
    'Sub-issue circular dependency': '子议题循环依赖',
    'A parent may not be a sub-issue of itself. To add it as a sub-issue, remove it as a parent in the tree.':
      '父议题不能是自身的子议题。如需将其添加为子议题，请先在层级中取消其父议题身份。',
    'Duplicate sub-issue': '重复的子议题',
    'A parent may not have duplicate sub-issues.': '父议题不能包含重复的子议题。',
    'A sub-issue must belong to the same organization or user as the parent.': '子议题必须与父议题属于同一组织或用户。',
    // 子议题列表（嵌套列表）的错误与管理对话框
    'An error occured while loading items': '加载条目时出错',
    'An error occurred while loading items': '加载条目时出错',
    'There was an issue loading Sub issues': '加载子议题时出错',
    'Manage this item': '管理此条目'
  },
  scoped: {
    // 分区标题与空状态
    Assignees: '受理人',
    Assignee: '受理人',
    'No one assigned': '无受理人',
    'No one -': '无人 -',
    'Assign yourself': '分配给自己',
    Labels: '标签',
    Label: '标签',
    'No labels': '无标签',
    Type: '类型',
    'No type': '无类型',
    'Issue type': '议题类型',
    Project: '项目',
    'No projects': '无项目',
    Milestone: '里程碑',
    'No milestone': '无里程碑',
    Relationships: '关系',
    Development: '开发',
    'No branches or pull requests': '没有分支或拉取请求',
    Participants: '参与者',
    Participant: '参与者',
    'No participants': '暂无参与者',
    Fields: '字段',
    Field: '字段',
    'Add fields': '添加字段',
    'No status': '无状态',
    'Awaiting triage': '等待分类',
    'Select projects': '选择项目',
    'Filter projects': '筛选项目',
    'Please try again later': '请稍后重试',

    // 关系名称与操作
    'Parent issue': '父议题',
    'Blocked by': '被阻止',
    'Is blocking': '阻止',
    'Relates to': '相关',
    'Security alert': '安全警报',
    'Add relates to': '添加相关议题',
    'Change or remove parent': '更改或删除父议题',
    'Add parent': '添加父议题',
    'Select parent issue': '选择父议题',
    'Mark as blocked by': '标记为被阻止',
    'Mark as blocking': '标记为阻止',
    'Change or add security alerts': '更改或添加安全警报',
    'Add security alert': '添加安全警报',
    'Loading related items...': '正在加载相关条目...',
    'Unable to load more issues': '无法加载更多议题',
    'Dependency limit reached': '已达到依赖关系上限',
    'Circular dependency': '循环依赖',
    'Access denied': '拒绝访问',
    'Unexpected error': '意外错误',
    'Failed to add dependency': '添加依赖关系失败',
    'Failed to remove dependency': '删除依赖关系失败',
    'No alerts found': '未找到警报',
    'Search alerts...': '搜索警报...',
    'Search repositories...': '搜索存储库...',
    'Failed to link alert': '链接警报失败',
    'Failed to unlink alert': '取消链接警报失败',
    'Invalid owner': '所有者无效',
    'Change parent issue': '更改父议题',

    // 子议题
    'Add existing issue': '添加现有议题',
    'Draft with Copilot': '使用 Copilot 起草',
    'Issues to include': '包含的议题',
    'Open and closed': '打开和已关闭',
    'Open only': '仅打开',
    'Manage item': '管理条目',
    // 正文任务清单项菜单
    'Convert to issue': '转换为议题',

    // 议题字段编辑
    'Enter text…': '输入文本…',
    'Enter number…': '输入数字…',
    'Choose a date': '选择日期',
    'Choose an option': '选择一个选项',
    'Choose options': '选择选项',
    'Choose an iteration': '选择迭代',
    'Text cannot be empty.': '文本不能为空。',
    'This value must be between -2147483647 and 2147483647': '此值必须介于 -2147483647 和 2147483647 之间',
    'This floating point value is too precise': '此浮点数精度过高',
    'This value is too long': '此值过长',
    'No date': '无日期',
    Current: '当前',
    'No option found': '未找到选项',
    'Auto-assign to agent': '自动分配给代理',
    'Filter option': '筛选选项',
    'Try searching with a different query for results.': '请尝试其他搜索词。',

    // 选择器（Popular 由通用词典处理，Copilot 的说明 Your AI pair programmer 见 filter.ts）
    'Select assignees': '选择受理人',
    'Filter assignees': '筛选受理人',
    'User results': '用户结果',
    'No assignees were found': '未找到受理人',
    'Try searching for a different name for results.': '请尝试搜索其他名称。',
    'Edit labels': '编辑标签',
    'Select labels': '选择标签',
    'Filter labels': '筛选标签',
    'Selected labels': '已选标签',
    'Copilot suggestions': 'Copilot 建议',
    'Label results': '标签结果',
    'No labels were found': '未找到标签',
    'Back to labels': '返回标签',
    'Create a new label': '新建标签',
    'Set milestone': '设置里程碑',
    'Select milestone': '选择里程碑',
    'Filter milestones': '筛选里程碑',
    'Milestone results': '里程碑结果',
    'No milestones were found': '未找到里程碑',
    'Currently selected:': '当前选择：',
    // 里程碑说明：Past due by <relative-time>（逾期时长由时间元素输出）
    'Past due by': '逾期',
    'Due by': '截止于',
    'No due date': '无截止日期',
    ', not started': '，未开始',
    'No projects were found': '未找到项目',
    'No projects were found. Please try a different search query.': '未找到项目。请尝试其他搜索词。',
    'Project results': '项目结果',
    'Please try a different search query.': '请尝试其他搜索词。',
    'Choose issue': '选择议题',
    'Select issue': '选择议题',
    'issue results': '议题结果',
    'Select issue field': '选择议题字段',
    // Select an option、Select repository 由通用词典处理
    'Select options': '选择选项',
    'Filter types': '筛选类型',
    'Filter organizations': '筛选组织',
    'Select a pull request': '选择拉取请求',
    'no pull request': '无拉取请求',
    'No issues found': '未找到议题',
    'Try changing your search term or selecting a different repository.': '请尝试更换搜索词或选择其他存储库。',
    'Back to repository selection': '返回存储库选择',
    'No repositories match': '没有匹配的存储库',
    'Repository results': '存储库结果',
    '(private)': '（专用）',
    'private repository': '专用存储库',
    'Could not update assignees': '无法更新受理人',
    'Could not search assignees': '无法搜索受理人',
    'Could not update labels': '无法更新标签',
    'Could not search labels': '无法搜索标签',
    'Could not update milestone': '无法更新里程碑',
    'Could not update type': '无法更新类型',
    'Could not search milestones': '无法搜索里程碑',
    'Could not search repositories': '无法搜索存储库',
    'Could not search pull requests': '无法搜索拉取请求',
    'Could not search projects': '无法搜索项目',
    'Could not search branches': '无法搜索分支',
    'Could not create branch': '无法创建分支',
    'Could not create label': '无法创建标签',
    'Could not create milestone': '无法创建里程碑',
    'Failed to update assignees': '更新受理人失败',
    'Updating assignees was cancelled': '已取消更新受理人',

    // 开发：分支与拉取请求
    'Create a branch': '创建分支',
    'create a branch': '创建分支',
    'Link a branch, pull request, or': '链接分支、拉取请求，或',
    'Link a branch or pull request': '链接分支或拉取请求',
    'Link pull requests': '链接拉取请求',
    'Creating branch…': '正在创建分支…',
    'Branch created': '分支已创建',
    'Branch not created': '分支未创建',
    'Return to repository picker': '返回存储库选择器',
    // 产品名按用户要求译成中文（product-names.md）：Copilot Workspace → 工作区、codespace → 代码空间
    'Open in Workspace': '在工作区中打开',
    'Code with agent mode': '使用代理模式编写代码',
    'Codespace creation failed.': '代码空间创建失败。',
    'Codespace creation failed': '代码空间创建失败',
    'Failed to link branches': '链接分支失败',
    'Failed to link pull requests': '链接拉取请求失败',
    'Unable to load repositories': '无法加载存储库',
    'Select branch': '选择分支',
    'No branches were found': '未找到分支',
    'Branch results': '分支结果',
    'Pull request results': '拉取请求结果',
    'No pull requests or branches were found': '未找到拉取请求或分支',
    'Branch name': '分支名称',
    'Repository destination': '目标存储库',
    'Branch source': '分支来源',
    'Change branch source': '更改分支来源',
    'Choose a source branch': '选择源分支',
    'Create branch': '创建分支',
    "What's next?": '下一步做什么？',
    'What’s next?': '下一步做什么？',
    'Copy branch name to clipboard': '复制分支名称到剪贴板',
    'Run the following commands in your local clone.': '在本地克隆中运行以下命令。',
    'Checkout in your local repository': '在本地存储库中检出',
    'If nothing happens, make sure': '如果没有响应，请确认',
    'is installed and set up properly, then': '已正确安装和设置，然后',
    'try again': '重试',
    'Select code repository': '选择代码存储库',
    'Failed to fetch repository data. Please try again.': '获取存储库数据失败。请重试。',
    'Linked branch not found': '未找到关联的分支',
    Releases: '发行版',
    Latest: '最新',
    'Pre-release': '预发行版',
    'No releases found': '未找到发行版'
  },
  regexp: [
    // 分区标题旁的编辑按钮（读屏）：Edit Assignees
    [new RegExp(`^Edit (${SECTION_NAME_SOURCE})$`), (_, name) => `编辑${SECTION_NAME[name] ?? name}`],
    // 标签删除提示
    [/^Removing label: (.+)\.$/, '正在删除标签：$1。'],
    [/^Could not remove label: (.+)\. The label was restored\.$/, '无法删除标签：$1。标签已恢复。'],
    [/^Removed label: (.+)\.$/, '已删除标签：$1。'],
    // 删除按钮的提示文字（常态下按钮没有 aria-label，名称取自提示）：默认标签名与令牌同译，已存档的 Archived 译出，
    // 自定义标签名保持原文（见 issues/labels.ts 的 archivedLabelName）
    [/^Remove label: (?:(Archived) )?(.+)$/, (_, archived: string, name: string) => `删除标签：${archivedLabelName(archived, name)}`],
    // 项目分区展开（Show 5 more 由通用词典处理）
    [/^Show (\d+) closed projects?$/, '显示 $1 个已关闭的项目'],
    [/^Show (\d+) more \((\d+) closed\)$/, '再显示 $1 个（$2 个已关闭的）'],
    // 里程碑进度（侧栏）
    [/^, (\d+)% complete$/, '，已完成 $1%'],
    // 议题字段（字段名是用户内容，原文无引号，译文不加；与中文之间按 joinName 留空格）
    [/^Value cannot be more than (\d+) characters \((\d+)\)$/, '值不能超过 $1 个字符（当前 $2 个）'],
    [/^The value for the (.+) field$/, (_, name) => joinName(name, '字段的值')],
    [/^Toolbar for (.+) field$/, (_, name) => joinName(name, '字段工具栏')],
    [/^Cannot be greater than (-?[\d.,]+)$/, '不能大于 $1'],
    [/^Cannot be less than (-?[\d.,]+)$/, '不能小于 $1'],
    [/^Remove field (.+)$/, (_, name) => joinName('删除字段', name)],
    [/^Update field (.+) \(press enter to submit\)$/, (_, name) => `${joinName('更新字段', name)}（按 Enter 提交）`],
    [/^No fields configured for (.+)\.$/, (_, name) => `${joinName(name, '未配置字段')}。`],
    [/^Set (.+), none$/, (_, name) => `${joinName('设置', name)}，当前为空`],
    [/^(.+) \(edited\)$/, '$1（已编辑）'],
    // 选择器
    [/^Cannot edit (.+) right now$/, (_, subject) => joinCjk('暂时无法编辑', PICKER_SUBJECT[subject] ?? subject)],
    [/^You have reached the limit of (\d+) assignees?$/, '已达到 $1 个受理人的上限'],
    // 分配代理对话框标题（copilot/agents.ts 的同类规则只在 Copilot 页生效；默认标题 Assign agent to issue 见 static）
    [/^Assign (Copilot|Claude|Codex) to issue$/, '将 $1 分配给议题'],
    [/^Create new label: "(.+)"$/, '新建标签：“$1”'],
    [/^Created and selected label: (.+)\.$/, '已创建并选中标签：$1。'],
    [/^Create new milestone: "(.+)"$/, '新建里程碑：“$1”'],
    [/^Filter milestones \((\d+) milestones loaded\)$/, '筛选里程碑（已加载 $1 个）'],
    [/^(\d+) pull requests? selected$/, '已选择 $1 个拉取请求'],
    [/^The branch (.+) already exists\.$/, '分支 $1 已存在。'],
    [
      /^Repository: ([\w.-]+\/[\w.-]+)(?: \((public|private|fork|archived)\))?$/,
      (_, repo, status) => `存储库：${repo}${status ? `（${REPOSITORY_STATUS[status] ?? status}）` : ''}`
    ],
    [/^Change destination, current repository: ([\w.-]+\/[\w.-]+)$/, '更改目标，当前存储库：$1'],
    // 开发
    [/^Creating in ([\w.-]+\/[\w.-]+)…$/, '正在 $1 中创建…'],
    [/^Creating branch (.+) in ([\w.-]+\/[\w.-]+)\.$/, '正在 $2 中创建分支 $1。'],
    [/^Codespace creation failed\. (.+)$/, '代码空间创建失败。$1'],
    // 关系
    [
      /^Issues have a limit of (\d+) (?:"(blocked by|blocking)" )?relationships\. To add more, an existing one must be removed\.$/,
      (_, limit, relation) =>
        `每个议题最多有 ${limit} 个${relation ? `“${RELATION_NAME[relation] ?? relation}”` : ''}关系。如需添加，请先删除现有关系。`
    ],
    [/^Failed to save (\d+) issues?$/, '$1 个议题保存失败'],
    [/^Failed to save (\d+) alerts?$/, '$1 个警报保存失败'],
    [/^An unexpected error occurred\. (.+)$/, '发生意外错误。$1'],
    // 参与者
    [/^and (\d+) other participants, click to see the full list$/, '以及其他 $1 个参与者，单击可查看完整列表'],
    // 子议题
    [/^Loading (\d+) sub-issues$/, '正在加载 $1 个子议题'],
    [/^(\d+) sub-issues loaded$/, '已加载 $1 个子议题'],
    // 子议题列表标题的折叠按钮：Collapse Sub-issues
    [/^(Collapse|Expand) Sub-issues$/, (_, action) => `${action === 'Collapse' ? '折叠' : '展开'}子议题`],
    [/^(.+), blocked$/, '$1，被阻止'],
    [
      /^Parents have a limit of (\d+) sub-issues\. To add more, an existing one must be removed\.$/,
      '每个父议题最多有 $1 个子议题。如需添加，请先删除现有子议题。'
    ],
    [
      /^You can[’'`]t add more than (\d+) layers of sub-issues\. To add a sub-issue, remove a parent issue at any level\.$/,
      '子议题最多 $1 层。如需添加子议题，请删除任一层级的父议题。'
    ],
    [/^You can[’'`]t add more than (\d+) layers of sub-issues$/, '子议题最多 $1 层'],
    [/^(\d+) tasks?$/, '$1 个任务'],
    // 受理人选择器中代理的任务数（读屏，后接状态图标）：2 tasks,
    [/^(\d+) tasks,$/, '$1 个任务，'],
    [/^(\d+) of (\d+)$/, '$1/$2'],
    // 子议题列表项的无障碍名称（标题、状态等在前，以句号结尾）：Fix bug. Press Control, Shift, U for more actions.
    [
      /^(?:(.+)\. )?Press (Command|Control), Shift, U for more actions(\.?)$/,
      (_, head, key, dot) => `${head ? `${head}。` : ''}按 ${key}、Shift、U 查看更多操作${dot ? '。' : ''}`
    ],
    // 正文任务清单项（清单文字是用户内容，原文无标点，译文不加冒号、引号）
    [/^Open (.+) task options$/, (_, title) => joinName(joinName('打开', title), '的任务选项')],
    [/^(.+) checklist item$/, (_, title) => joinName(title, '清单项')]
  ],
  issueTypes: ISSUE_TYPE_NAMES
} satisfies PageDictionary
