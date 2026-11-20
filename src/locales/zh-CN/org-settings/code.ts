import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

const ORG = '([\\w.-]+)'
const BRANCH = '([\\w./-]+)'

/** 自定义属性类型（类型菜单按钮的无障碍名称「Type: <类型>」） */
const PROPERTY_TYPES: Readonly<Record<string, string>> = {
  Text: '文本',
  'Single select': '单选',
  'Multi select': '多选',
  'True/false': '真/假',
  URL: 'URL'
}

/** 议题字段：预置字段名、预置单选选项（组织自定义的是用户内容，照录） */
const PRESET_FIELDS: Readonly<Record<string, string>> = {
  Priority: '优先级',
  'Start date': '开始日期',
  'Target date': '目标日期',
  Effort: '工作量'
}
const PRESET_OPTIONS: Readonly<Record<string, string>> = { Urgent: '紧急', High: '高', Medium: '中', Low: '低' }
/** 议题类型：默认类型名（与 scoped 的类型名一致） */
const PRESET_TYPES: Readonly<Record<string, string>> = { Task: '任务', Bug: '缺陷', Feature: '功能' }
/** 字段名与选项名（类型的置顶字段、字段的单选选项共用操作按钮的读屏名称） */
const PRESET_NAMES: Readonly<Record<string, string>> = { ...PRESET_FIELDS, ...PRESET_OPTIONS }

/** 查表：键可能是用户内容（选项名），不取原型链上的键 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/**
 * 代码、规划和自动化（Copilot、Actions、Web 钩子除外）：存储库常规设置（默认分支、提交签署、默认标签）、
 * 自定义属性、规划（议题类型、议题字段）、Codespaces、沙盒、讨论、软件包、Pages、项目、
 * 托管计算网络。
 * 个人设置、存储库设置、项目、议题标签已收录为 static 的词条（默认分支说明、软件包与 Pages 域验证、
 * 项目字段、标签表单等）不再重复，译法以那里为准。
 */
export default {
  static: {
    // 自定义属性：推荐属性的说明（属性名是标识符，不译）、新建 / 删除属性、设置值
    'What application does this support?': '此存储库支持哪个应用？',
    'Who owns this repository?': '谁拥有此存储库？',
    'Which compliance frameworks apply?': '适用哪些合规框架？',
    'Are personal identifiers present?': '是否包含个人身份信息？',
    'Is this repository a monorepo?': '此存储库是否为单体存储库？',
    'No properties': '暂无属性',
    'No properties that match': '没有匹配的属性',
    'A short description about this property': '此属性的简短描述',
    'Match regular expression': '匹配正则表达式',
    'Use regular expression': '使用正则表达式',
    'Repository users and apps with the repository-level "custom properties" fine-grained permission can set and update the value for their repository.':
      '拥有存储库级“自定义属性”精细权限的存储库用户和应用可以为其存储库设置和更新此值。',
    'Repository users and apps with the repository-level “custom properties” fine-grained permission can set and update the value for their repository.':
      '拥有存储库级“自定义属性”精细权限的存储库用户和应用可以为其存储库设置和更新此值。',
    'Name contains invalid characters:': '名称包含无效字符：',
    'Property definition successfully created.': '已创建属性定义。',
    'Property attributes': '属性特征',
    'Additional options': '其他选项',
    'Permanently delete this property and its values from all repositories.': '从所有存储库中永久删除此属性及其值。',
    'No repositories found that use the property:': '未找到使用此属性的存储库：',
    'No other GitHub features found that use the property:': '未找到使用此属性的其他 GitHub 功能：',
    'This will permanently delete this property.': '这将永久删除此属性。',
    'Checking usages..': '正在检查使用情况..',
    'Checking usages...': '正在检查使用情况...',
    'Property definition successfully deleted.': '已删除属性定义。',
    // 代码空间：用户访问
    'Codespaces access updated': '代码空间访问权限已更新',
    'Add user or team to Codespaces': '向代码空间添加用户或团队',
    'No users or teams allowed to access Codespaces yet': '尚未允许任何用户或团队访问代码空间',
    'You can add any number of organization members or teams': '可以添加任意数量的组织成员或团队',
    // 议题字段：编辑页（权限、置顶到议题）、删除确认
    'Unique name for your issue field': '议题字段的唯一名称',
    'Choose who should be able to see this field and its value': '选择谁可以查看此字段及其值',
    'Field is visible to organization members and any repository collaborators': '组织成员和所有存储库协作者可以看到此字段',
    'Field is visible to organization members and any repositorycollaborators': '组织成员和所有存储库协作者可以看到此字段',
    'Field is visible to anyone viewing the issue': '查看议题的任何人都可以看到此字段',
    'Pin to issues': '置顶到议题',
    'Choose which issue types show this field when viewing and creating issues.': '选择在查看和创建议题时显示此字段的议题类型。',
    'Edit field visibility': '编辑字段可见性',
    'Show this field on the selected issue types when viewing or creating issues.': '查看或创建议题时，在所选议题类型上显示此字段。',
    'When the issue has no type': '议题没有类型时',
    'Pin to selected types': '置顶到所选类型',
    'Edits to this field are global. Any changes apply to all of your issues and projects.':
      '对此字段的编辑是全局性的，任何更改都会应用到你的所有议题和项目。',
    'Modifying this issue field will affect all of your issues and projects.': '修改此议题字段将影响你的所有议题和项目。',
    'Apply to all issues and projects': '应用到所有议题和项目',
    'Save complete': '保存完成',
    'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.':
      '要拾取可拖动项，请按空格键。拖动时，使用方向键移动该项。再次按空格键将其放到新位置，或按 Esc 键取消。',
    // Slack 集成跳转（规则集仪表板图表的图例、数据点与坐标轴说明见 repo-settings/ruleset-insights.ts）
    'You are being redirected to Slack in order to authenticate.': '正在重定向到 Slack 进行身份验证。',
    'click here': '点击此处',
    // 设置保存提示
    'Pages settings updated for this organization.': '已更新此组织的页面设置。',
    'Packages settings updated for this organization.': '已更新此组织的软件包设置。',
    // 代码空间：用户访问设置的保存按钮（无障碍名称）
    'Save user access settings': '保存用户访问设置',
    // 存储库自定义属性：分页、筛选、推荐属性（属性名 cloud_providers 等是标识符，不译）
    'Page selector navigation': '页面选择器导航',
    'Page selector': '页面选择器',
    'Filter properties': '筛选属性',
    'Suggested custom properties': '推荐的自定义属性',
    'See more suggested properties': '查看更多推荐属性',
    'Which cloud providers are used?': '使用了哪些云提供商？',
    'Are external packages used here?': '是否使用了外部软件包？',
    'How protected is the default branch?': '默认分支的保护程度如何？',
    // 议题字段：说明、预置字段（名称、说明、无障碍名称与操作提示；自定义字段见 regexp）
    'Issue fields let you define structured data to capture for each issue, helping you keep information consistent across all of your repositories.':
      '议题字段可用于定义每个议题要记录的结构化数据，使所有存储库中的信息保持一致。',
    'Current importance level assigned to this issue': '为此议题指定的当前重要程度',
    'Date when work on issue will begin': '议题工作的开始日期',
    'Expected completion date for this issue': '此议题的预计完成日期',
    'Relative level of effort for completing this issue': '完成此议题所需的相对工作量',
    'Issue field: Priority': '议题字段：优先级',
    'Issue field: Start date': '议题字段：开始日期',
    'Issue field: Target date': '议题字段：目标日期',
    'Issue field: Effort': '议题字段：工作量',
    'Open field options for Priority': '打开优先级字段选项',
    'Open field options for Start date': '打开开始日期字段选项',
    'Open field options for Target date': '打开目标日期字段选项',
    'Open field options for Effort': '打开工作量字段选项',
    // 议题类型：说明、预置类型（Task / Bug / Feature，与议题页的默认类型名称表一致）
    'New type': '新建类型',
    'Customize your issue types. Issue types can be used to classify and manage issues in your repositories.':
      '自定义议题类型。议题类型可用于对存储库中的议题进行分类和管理。',
    'List of issue types': '议题类型列表',
    '"Task" Issue type list item': '议题类型列表项“任务”',
    '"Bug" Issue type list item': '议题类型列表项“缺陷”',
    '"Feature" Issue type list item': '议题类型列表项“功能”',
    'Open type options for Task': '打开任务类型选项',
    'Open type options for Bug': '打开缺陷类型选项',
    'Open type options for Feature': '打开功能类型选项',
    // 存储库默认设置：不可变发行版、标签空状态（「Choose whether <a>commit comments</a> are …」见 inline）
    'Choose whether repositories will publish immutable releases. Immutable releases improve security by disallowing changes to assets and tags after the release is published.':
      '选择存储库是否发布不可变发行版。不可变发行版禁止在发布后更改资产和标签，从而提高安全性。',
    'Require immutable releases for all repositories': '要求所有存储库使用不可变发行版',
    'Require immutable releases for specifically selected repositories': '要求所选存储库使用不可变发行版',
    'Each repository chooses whether to make releases immutable': '由各存储库选择是否将发行版设为不可变',
    'No labels!': '暂无标签',
    'There aren’t any labels for this organization quite yet. Click on the "New Label" button above to create one.':
      '此组织暂无标签。点击上方的“新建标签”按钮创建标签。',
    'There aren\'t any labels for this organization quite yet. Click on the "New Label" button above to create one.':
      '此组织暂无标签。点击上方的“新建标签”按钮创建标签。',
    // 规则集仪表板（组织）：筛选、图表、绕过统计（图表的类型、坐标轴说明由 insights/charts.ts 的规则翻译）
    'Filter rule insights dashboard': '筛选规则洞察仪表板',
    'Rule Suites': '规则套件',
    'Rule Suites. Interactive chart.': '规则套件。交互式图表。',
    'Show Passes': '显示通过',
    'Show Failures': '显示失败',
    'Show Bypasses': '显示绕过',
    'View allowed runs': '查看允许的运行',
    'View failed runs': '查看失败的运行',
    'View bypassed runs': '查看绕过的运行',
    'in the time period': '此时间段内',
    'Bypasses by actor': '按参与者统计的绕过',
    'Bypasses by actor. Interactive chart.': '按参与者统计的绕过。交互式图表。',
    'Members who have bypassed the most': '绕过次数最多的成员',
    'Top repositories by bypasses': '绕过次数最多的存储库',
    'No bypasses found': '未找到绕过',
    'No repositories have any rule bypasses for the selected filters': '所选筛选条件下没有存储库存在规则绕过',
    // 「按参与者统计的绕过」图表的纵轴标题（SVG 中，见 core/ignore.ts 的 Highcharts 放行）
    'Number of bypasses': '绕过次数',
    // 存储库：默认分支
    'Choose the default branch for new repositories in this organization. You might want to change the default name due to different workflows, or because your integrations still require “master” as the default branch name. You can always change the default branch name on individual repositories.':
      '为此组织中的新存储库选择默认分支。你可能因工作流不同，或集成仍要求使用“master”作为默认分支名称而需要更改默认名称。你随时可以更改单个存储库的默认分支名称。',
    'Change default branch name now': '立即更改默认分支名称',

    // 存储库：提交签署
    'Commit signoff': '提交签署',
    "Choose whether repositories will require contributors to sign off on commits they make through GitHub's web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the":
      '选择存储库是否要求贡献者签署其通过 GitHub 网页界面所做的提交。签署是贡献者确认其提交符合存储库条款的一种方式，通常为',
    'Choose whether repositories will require contributors to sign off on commits they make through GitHub’s web interface. Signing off is a way for contributors to affirm that their commit complies with the repository’s terms, commonly the':
      '选择存储库是否要求贡献者签署其通过 GitHub 网页界面所做的提交。签署是贡献者确认其提交符合存储库条款的一种方式，通常为',
    'Developer Certificate of Origin (DCO)': '开发者来源证书 (DCO)',
    'Learn more about signing off on commits': '了解提交签署',
    'Require signoff on web-based commits for all repositories in this organization': '为此组织中的所有存储库要求签署网页提交',
    'Each repository chooses whether to require signoff on web-based commits': '由各存储库自行选择是否要求签署网页提交',
    'Commit signoff settings were updated.': '已更新提交签署设置。',
    'Require contributors to sign off on web-based commits': '要求贡献者签署网页提交',

    // 存储库：默认标签
    'Repository labels': '存储库标签',
    'Set the labels that will be included when a new repository is created in this organization.':
      '设置在此组织中创建新存储库时默认包含的标签。',
    'Learn more about managing default labels for your organization.': '了解如何管理组织的默认标签。',
    'Are you sure? Deleting a label will remove as a default, and no future repositories will receive this label when created.':
      '确定吗？删除标签后，它将不再作为默认标签，今后创建的存储库都不会包含此标签。',

    // 自定义属性
    'Custom properties allow you to decorate your repositories with information such as compliance frameworks, data sensitivity, or project details.':
      '自定义属性可为存储库添加合规框架、数据敏感性或项目详细信息等内容。',
    'New property': '新建属性',
    'Set values': '设置值',
    'Save property': '保存属性',
    'Delete property': '删除属性',
    'Edit property': '编辑属性',
    'Edit properties': '编辑属性',
    'Allowed values': '允许的值',
    'Default value': '默认值',
    'Allow repository actors to set this property': '允许存储库参与者设置此属性',
    'When enabled, repository users and apps with the repository-level "custom properties" fine-grained permission will be able to set and update the property value for their repository.':
      '启用后，拥有存储库级“自定义属性”精细权限的存储库用户和应用可以为其存储库设置和更新此属性值。',
    'Require this property for all repositories': '要求所有存储库设置此属性',
    'Repositories that don’t have an explicit value for this property will inherit the default value.':
      '未明确设置此属性值的存储库将继承默认值。',
    "Repositories that don't have an explicit value for this property will inherit the default value.":
      '未明确设置此属性值的存储库将继承默认值。',
    'Require explicit user-specified values': '要求用户明确指定值',
    'Accept suggestion': '接受建议',
    'True/false': '真/假',
    'No custom properties': '暂无自定义属性',
    'Repository custom property suggestions': '存储库自定义属性建议',

    // 规划：议题类型、议题字段
    'Create new type': '新建类型',
    'Type name': '类型名称',
    'Customize the issue types for this organization. Issue types can be used to classify and manage issues in repositories across the organization.':
      '自定义此组织的议题类型。议题类型可用于对组织内各存储库的议题进行分类和管理。',
    'Unique name for your issue type': '议题类型的唯一名称',
    'What is this type for?': '这个类型的用途是什么？',
    // 默认议题类型的说明（类型选择器、议题类型列表）
    'A specific piece of work': '一项具体工作',
    'An unexpected problem or behavior': '意外的问题或行为',
    'A request, idea, or new functionality': '请求、想法或新功能',
    'Pinned issue fields': '置顶的议题字段',
    // 议题类型编辑页（组织与个人设置同一组件）：置顶字段、选择字段面板、禁用 / 启用 / 删除
    'The fields shown by default when this issue type is selected.': '选择此议题类型时默认显示的字段。',
    'Add new pinned issue field': '添加新的置顶议题字段',
    'No pinned fields yet': '暂无置顶字段',
    "You haven't added any fields for this type. Selected fields will appear here.": '尚未为此类型添加任何字段。所选字段将显示在这里。',
    'You haven’t added any fields for this type. Selected fields will appear here.': '尚未为此类型添加任何字段。所选字段将显示在这里。',
    'Pin issue field': '置顶议题字段',
    'Filter fields': '筛选字段',
    'Issue Fields results': '议题字段结果',
    'No issue fields were found': '未找到议题字段',
    'Try searching with a different query for results.': '请尝试其他搜索词。',
    'Disable issue type': '禁用议题类型',
    'This will prevent the issue type from being used on new or existing issues.': '这将阻止在新议题或现有议题上使用此议题类型。',
    'Enable issue type': '启用议题类型',
    'Re-enable the issue type to allow it to be added to new repositories and issues.':
      '重新启用此议题类型，使其可添加到新的存储库和议题。',
    'Delete issue type': '删除议题类型',
    'Deleting an issue type will remove it from all existing issues. This action cannot be undone.':
      '删除议题类型会将其从所有现有议题中移除。此操作无法撤消。',
    // 议题字段：个人设置的权限选项说明、空状态与入门字段
    'Field is visible to you and any repository collaborators': '你和所有存储库协作者可以看到此字段',
    'You don’t have any issue fields yet': '你还没有任何议题字段',
    "You don't have any issue fields yet": '你还没有任何议题字段',
    'Create your own field, or add a starter set with Priority, Start date, Target date, and Effort. You can edit or delete them anytime.':
      '创建自己的字段，或添加包含优先级、开始日期、目标日期和工作量的入门字段。之后可随时编辑或删除。',
    'Add starter fields': '添加入门字段',
    'Adding starter fields..': '正在添加入门字段..',
    'Adding starter fields...': '正在添加入门字段...',
    'Field Visibility': '字段可见性',
    'Field visibility': '字段可见性',
    'Organization only': '仅限组织',
    'Pin to types': '置顶到类型',
    'Issues without a type': '无类型的议题',
    'Save field': '保存字段',
    'Single-select': '单选',

    // Codespaces
    'To manage Codespace ownership settings, please': '要管理代码空间所有权设置，请',
    'to enable your organization.': '以便为组织启用。',
    'Codespaces access': '代码空间访问权限',
    "Manage access to GitHub Codespaces for your organization's members on private and internal repositories. Codespaces are always available on public repositories.":
      '管理组织成员在专用和内部存储库中使用 GitHub 代码空间的权限。公共存储库始终可以使用代码空间。',
    'Manage access to GitHub Codespaces for your organization’s members on private and internal repositories. Codespaces are always available on public repositories.':
      '管理组织成员在专用和内部存储库中使用 GitHub 代码空间的权限。公共存储库始终可以使用代码空间。',
    // 「By enabling Codespaces, you agree to GitHub’s」<a>条款</a>「and approve of these terms …」：原文无逗号，译文不加
    'By enabling Codespaces, you agree to GitHub’s': '启用代码空间即表示你同意 GitHub 的',
    "By enabling Codespaces, you agree to GitHub's": '启用代码空间即表示你同意 GitHub 的',
    'additional products and features terms': '附加产品和功能条款',
    'and approve of these terms on behalf of your organization.': '并代表你的组织批准这些条款。',
    'Disable GitHub Codespaces for all organization owned private and internal repositories':
      '为组织拥有的所有专用和内部存储库禁用 GitHub 代码空间',
    'Enable for specific members or teams': '为特定成员或团队启用',
    'Enable GitHub Codespaces for specific organization members or teams on all organization owned private and internal repositories':
      '为特定组织成员或团队在组织拥有的所有专用和内部存储库中启用 GitHub 代码空间',
    'Enable for all members': '为所有成员启用',
    'Enable GitHub Codespaces for all organization members on all organization owned private and internal repositories':
      '为所有组织成员在组织拥有的所有专用和内部存储库中启用 GitHub 代码空间',
    'Enable for all members and outside collaborators': '为所有成员和外部协作者启用',
    'Enable GitHub Codespaces for all organization members and outside collaborators on all organization owned private and internal repositories':
      '为所有组织成员和外部协作者在组织拥有的所有专用和内部存储库中启用 GitHub 代码空间',
    'Codespace ownership': '代码空间所有权',
    'Control who owns codespaces created by your organization’s members on organization owned repositories. Codespace ownership dictates who is billed for usage, whose policies apply, and where audit logs are sent.':
      '控制组织成员在组织拥有的存储库中创建的代码空间归谁所有。所有权决定由谁支付使用费用、适用谁的策略，以及审核日志发送到哪里。',
    "Control who owns codespaces created by your organization's members on organization owned repositories. Codespace ownership dictates who is billed for usage, whose policies apply, and where audit logs are sent.":
      '控制组织成员在组织拥有的存储库中创建的代码空间归谁所有。所有权决定由谁支付使用费用、适用谁的策略，以及审核日志发送到哪里。',
    'Organization ownership': '组织所有',
    'All codespaces created by your organization’s members on your organization’s repositories are owned by the organization':
      '组织成员在组织存储库中创建的所有代码空间都归组织所有',
    "All codespaces created by your organization's members on your organization's repositories are owned by the organization":
      '组织成员在组织存储库中创建的所有代码空间都归组织所有',
    'User ownership': '用户所有',
    'All codespaces created by your organization’s members on your organization’s repositories are owned by the creating member':
      '组织成员在组织存储库中创建的所有代码空间都归创建者所有',
    "All codespaces created by your organization's members on your organization's repositories are owned by the creating member":
      '组织成员在组织存储库中创建的所有代码空间都归创建者所有',
    'Any codespaces created on organization owned repositories and owned by organization members or collaborators with codespaces access will transfer ownership to your organization.':
      '在组织拥有的存储库中创建、且归有代码空间访问权限的组织成员或协作者所有的代码空间，其所有权将转让给组织。',
    'All codespaces currently owned by your organization will transfer ownership to the creating user.':
      '当前归组织所有的所有代码空间，其所有权将转让给创建者。',
    'Update GitHub Codespaces ownership settings?': '更新 GitHub 代码空间所有权设置？',
    'Codespace policies': '代码空间策略',
    'Create Policy': '创建策略',
    'Create policy': '创建策略',
    'Policy name': '策略名称',
    'Policy name is too long (maximum is 64 characters)': '策略名称过长（最多 64 个字符）',
    "Policy name can't be blank": '策略名称不能为空',
    'Policy name can’t be blank': '策略名称不能为空',
    'Add constraint': '添加约束',
    'Machine types': '机器类型',
    'Maximum codespaces per user': '每个用户的代码空间数量上限',
    'Maximum idle timeout': '最长空闲超时',
    'Retention period': '保留期',
    'Base images': '基础映像',
    'Port visibility': '端口可见性',
    'Change policy target': '更改策略目标',
    'Delete policy': '删除策略',

    // 沙盒
    'Cloud sandbox access': '云沙盒访问权限',
    "Manage cloud sandbox access for your organization's members.": '管理组织成员对云沙盒的访问权限。',
    'Manage cloud sandbox access for your organization’s members.': '管理组织成员对云沙盒的访问权限。',
    'If preview features are enabled, you agree to the': '启用预览功能即表示你同意',
    'Pre-Release Terms': '预发行条款',
    'Cloud sandbox access is not available for organization members.': '组织成员无法使用云沙盒。',
    'Members of this organization can use cloud sandboxes.': '此组织的成员可以使用云沙盒。',

    // 讨论
    'Discussions for your organization': '组织讨论',
    'Setting up Discussions for your organization will allow you to broadcast updates, answer questions, and hold conversations for the entire organization.':
      '为组织设置讨论后，你可以面向整个组织发布动态、解答问题和开展交流。',
    'Enable discussions for this organization': '为此组织启用讨论',
    'Choose a source repository that will host the discussions.': '选择用于承载讨论的源存储库。',
    // 原文界面名无引号，译文不加
    'All discussions on the source repository will be surfaced to the organization Discussions tab.':
      '源存储库中的所有讨论都将显示在组织的讨论标签页中。',
    'Permissions from the repository will be applied to the organization Discussions. By default, all members of the organization will be able to create and comment on discussions.':
      '存储库的权限将应用于组织讨论。默认情况下，组织的所有成员都可以创建讨论并发表评论。',
    'Members can now share updates or ask questions to the entire organization.': '成员现在可以面向整个组织分享动态或提问。',
    'For more information, see our documentation.': '详情请参阅我们的文档。',
    'Choose a repository': '选择存储库',
    'Search for a repository': '搜索存储库',
    'Organization discussions has been set up!': '组织讨论已设置完成！',

    // 项目
    'Projects on GitHub help you organize and prioritize your work. You can create projects for specific feature work, comprehensive roadmaps, or even release checklists.':
      'GitHub 上的项目可以帮助你组织工作并安排优先级。你可以为特定功能、完整的路线图甚至发布检查清单创建项目。',
    'Enable Projects for the organization': '为组织启用项目',
    'This allows members to create projects for the': '这将允许成员为',
    'organization. Members can create projects to organize and track issues from any': '组织创建项目。成员可以创建项目来组织和跟踪任意',
    '-owned repository.': '所拥有存储库中的议题。',
    'Allow members to change project visibilities for this organization': '允许成员更改此组织的项目可见性',
    'If enabled, members with admin permissions on a project can make the project public or private. If disabled, only organization owners can make the project public or private. All projects are private by default.':
      '启用后，拥有项目管理员权限的成员可以将项目设为公共或专用。禁用后，只有组织所有者可以更改项目的公共或专用状态。所有项目默认为专用。',
    'Recommended templates': '推荐模板',
    'Customize a selection of recommended project templates for this organization. These templates will be surfaced first when a member of the organization creates a new project.':
      '为此组织自定义一组推荐的项目模板。组织成员创建新项目时，这些模板将优先显示。',
    'Create your first GitHub project template': '创建你的第一个 GitHub 项目模板',
    'Customize recommended templates': '自定义推荐模板',

    // 托管计算网络
    'Network configurations': '网络配置',
    'New network configuration': '新建网络配置',
    'Azure private network': 'Azure 专用网络',
    'Add Azure Virtual Network': '添加 Azure 虚拟网络',
    'Enable failover VNET': '启用故障转移 VNET',
    'Disable failover VNET': '禁用故障转移 VNET',
    'Add failover network': '添加故障转移网络',
    'Edit configuration': '编辑配置',
    'Network settings resource ID': '网络设置资源 ID',
    'Failover network': '故障转移网络'
  },
  scoped: {
    // 议题字段：类型按钮、权限选项、置顶对话框的分组、单选选项的文本框
    'Single Select': '单选',
    Restricted: '受限',
    Types: '类型',
    'Label text': '标签文本',
    'issue types': '议题类型',
    // 自定义属性：批量设置值时保持原值的选项
    unchanged: '保持不变',
    // 自定义属性：新建属性表单的「Type」标签（全局搜索提示「Type <kbd>/</kbd> to search」由 kbd 整句处理，不受影响）
    Type: '类型',
    // 预置议题字段与议题类型的名称（组织自定义的名称是用户内容，不收）
    Priority: '优先级',
    'Start date': '开始日期',
    'Target date': '目标日期',
    Effort: '工作量',
    Task: '任务',
    Bug: '缺陷',
    Feature: '功能',
    // 预置单选选项（High、Medium、Low 由全局词条译出）
    Urgent: '紧急',
    // 「Choose whether <a>commit comments</a> are …」里的链接
    'commit comments': '提交评论',
    // 与个人设置、存储库设置共用
    'Description (optional)': '描述（可选）',
    Color: '颜色',
    'Get a new color': '换一种颜色',
    'Choose from default colors:': '从默认颜色中选择：',
    label: '个标签',
    labels: '个标签',
    Properties: '属性',
    Text: '文本',
    Number: '数字',
    'Learn more about custom properties.': '了解自定义属性。',

    // 存储库默认设置：默认分支、主题
    'Choose the default branch for new repositories in this organization.': '为此组织中的新存储库选择默认分支。',
    'Repository topics': '存储库主题',

    // 自定义属性：定义、设置值、删除
    'Property name': '属性名称',
    'Add value': '添加值',
    'No value': '无值',
    'No default value': '无默认值',
    'Edit custom properties': '编辑自定义属性',
    'Repository custom properties': '存储库自定义属性',
    'Property values': '属性值',
    'Set property values': '设置属性值',
    'Update values': '更新值',
    'Values updated': '值已更新',
    'Property saved': '属性已保存',
    'Property deleted': '属性已删除',
    'Delete custom property': '删除自定义属性',
    'Are you sure you want to delete this property?': '确定要删除此属性吗？',
    'This will remove the property and all its values from repositories.': '这将从存储库中移除该属性及其所有值。',
    'Deleting this property will remove its values from all repositories.': '删除此属性将从所有存储库中移除其值。',

    // 规划：议题类型、议题字段
    'Create type': '创建类型',
    'Edit type': '编辑类型',
    'Save type': '保存类型',
    'Enable type': '启用类型',
    'Disable type': '禁用类型',
    'Delete type': '删除类型',
    'Disabled types': '已禁用的类型',
    'Create field': '创建字段',

    // Pages：已验证的域
    'Verify domain': '验证域',
    'Delete domain': '删除域',

    // 项目（经典）
    'Enable projects (classic) for the organization': '为组织启用项目（经典）',

    // 软件包（与个人设置共用）
    'Package creation': '软件包创建',
    'Members will be able to publish only the selected visibility types for packages and containers. Outside collaborators can never publish packages or containers.':
      '成员只能发布所选可见性类型的软件包和容器。外部协作者始终无法发布软件包或容器。',
    'Members will be able to create public packages, visible to anyone.': '成员可以创建对所有人可见的公共软件包。',
    'Members will be able to create private packages, visible to organization members with permission.':
      '成员可以创建专用软件包，仅对有权限的组织成员可见。',
    'Members will be able to create internal packages, visible to all organization/enterprise members.':
      '成员可以创建内部软件包，对所有组织/企业成员可见。',
    'Default package settings': '默认软件包设置',
    'Default Package Settings': '默认软件包设置',
    'Deleted packages': '已删除的软件包',
    'These are packages that have been previously deleted belonging to this organization. You can restore a package deleted within the last 30 days.':
      '以下是此组织之前删除的软件包。你可以恢复最近 30 天内删除的软件包。',

    // Pages（与个人设置共用）
    'There are no verified domains for this organization.': '此组织暂无已验证的域。',

    // 议题类型：颜色选择的提示；议题字段：单选选项的高级移动对话框（「<选项> will be first item in the list.」选项名在前一个元素里时的后半句）
    Gray: '灰色',
    Blue: '蓝色',
    Green: '绿色',
    Yellow: '黄色',
    Orange: '橙色',
    Red: '红色',
    Pink: '粉色',
    Purple: '紫色',
    Item: '条目',
    Action: '操作',
    'will be first item in the list.': '将成为列表第一项。',
    'will be last item in the list.': '将成为列表最后一项。'
  },
  regexp: [
    // 议题字段、议题类型编辑页：标题「<a>议题字段</a> / Effort」「<a>议题类型</a> / Task」的后半段，单选选项、置顶字段的操作与拖动按钮
    [
      new RegExp(`^/ (${Object.keys({ ...PRESET_FIELDS, ...PRESET_TYPES }).join('|')})$`),
      (_, name: string) => `/ ${pick(PRESET_FIELDS, name) ?? PRESET_TYPES[name]}`
    ],
    [/^Open field actions for (.+)$/, (_, name: string) => `打开“${pick(PRESET_NAMES, name) ?? name}”的操作`],
    [new RegExp(`^Move (${Object.keys(PRESET_NAMES).join('|')})$`), (_, name: string) => `移动“${PRESET_NAMES[name]}”`],
    [/^Open edit dialog for (.+)$/, (_, name: string) => `打开“${pick(PRESET_OPTIONS, name) ?? name}”的编辑对话框`],
    [/^Advanced move (.+?)(\.\.\.|…)$/, (_, name: string, dots: string) => `高级移动“${pick(PRESET_OPTIONS, name) ?? name}”${dots}`],
    [new RegExp(`^Remove (${Object.keys(PRESET_NAMES).join('|')})$`), (_, name: string) => `移除“${PRESET_NAMES[name]}”`],
    // 单选选项的高级移动对话框：移动结果预览
    [/^(.+) will be first item in the list\.$/, (_, name: string) => `“${pick(PRESET_OPTIONS, name) ?? name}”将成为列表第一项。`],
    [/^(.+) will be last item in the list\.$/, (_, name: string) => `“${pick(PRESET_OPTIONS, name) ?? name}”将成为列表最后一项。`],
    [
      /^(.+) will be between (.+) and (.+)\.$/,
      (_, name: string, first: string, second: string) =>
        `“${pick(PRESET_OPTIONS, name) ?? name}”将位于“${pick(PRESET_OPTIONS, first) ?? first}”和“${pick(PRESET_OPTIONS, second) ?? second}”之间。`
    ],
    // 议题类型：禁用、删除确认（类型名保留原文）
    [
      /^The "(.+)" issue type will no longer be available to use\. If it is re-enabled in the future, it will be preserved on existing issues of this type unless a different type has been added\.$/,
      '议题类型“$1”将不再可用。将来重新启用时，此类型的现有议题会保留它，除非已改为其他类型。'
    ],
    [
      /^This will remove the "(.+)" issue type from all issues\. This action cannot be undone\.$/,
      '这将从所有议题中移除议题类型“$1”。此操作无法撤消。'
    ],
    // 自定义属性：设置值、删除前的使用情况、匹配的存储库数（筛选框计数「N repositories matching」由 org-policies 收录）
    [/^Set properties on (.+)$/, '设置 $1 的属性'],
    [/^(\d+) repositor(?:y|ies) found that uses? the property:$/, '找到 $1 个使用此属性的存储库：'],
    [/^Matching (\d+) repositor(?:y|ies)$/, '匹配 $1 个存储库'],
    // 议题字段：删除确认（字段名是确认口令，保留原文）
    [/^Delete "(.+)" issue field$/, '删除议题字段“$1”'],
    [
      /^This will remove the "(.+)" issue field from all of your issues and projects\. This action cannot be undone\.$/,
      '这将从你的所有议题和项目中移除议题字段“$1”。此操作无法撤消。'
    ],
    [/^Please type "(.+)" to confirm$/, '请输入“$1”以确认'],
    // 议题字段计数，自定义字段与类型的无障碍名称、操作提示
    [/^(\d+) Issue fields?$/, '$1 个议题字段'],
    [/^Issue field: (.+)$/, '议题字段：$1'],
    [/^Open field options for (.+)$/, (_, name: string) => joinCjk(joinCjk('打开', name), '字段选项')],
    [/^"(.+)" Issue type list item$/, '议题类型列表项“$1”'],
    [/^Open type options for (.+)$/, (_, name: string) => joinCjk(joinCjk('打开', name), '类型选项')],
    // 新建标签的颜色色块：Color #b60205
    [/^Color (#[\da-fA-F]{6})$/, '颜色 $1'],
    [
      new RegExp(`^New repositories created in ${ORG} will use ${BRANCH} as their default branch\\.$`),
      '在 $1 中创建的新存储库将使用 $2 作为默认分支。'
    ],
    [new RegExp(`^Your default branch name will be ${BRANCH}$`), '默认分支名称将为 $1'],
    [/^(\d+) labels?$/, '$1 个标签'],
    [/^(\d+) properties$/, '$1 个属性'],
    [/^(\d+) property$/, '$1 个属性'],
    [/^(\d+) issue types?$/, '$1 个议题类型'],
    // 议题类型列表标题：3 types (max 25)
    [/^(\d+) types?$/, '$1 个类型'],
    [/^\(max (\d+)\)$/, '（最多 $1 个）'],
    [/^(\d+) types? \(max (\d+)\)$/, '$1 个类型（最多 $2 个）'],
    [/^(\d+) issue fields?$/, '$1 个议题字段'],
    [/^(\d+) network configurations?$/, '$1 个网络配置'],
    [new RegExp(`^No recoverable packages were found for ${ORG}\\.$`), '未找到 $1 中可恢复的软件包。'],
    [/^Successfully verified ([\w-]+(?:\.[\w-]+)+?)(\.?)$/, (_, domain: string, dot: string) => `已成功验证 ${domain}${dot ? '。' : ''}`],
    // 新建自定义属性：类型菜单按钮的无障碍名称
    [/^Type: (Text|Single select|Multi select|True\/false|URL)$/, (_, type: string) => `类型：${PROPERTY_TYPES[type]}`]
  ],
  inline: [
    // 议题字段计数：「<span>2</span> Issue fields」
    ['{} Issue fields', '{} 个议题字段'],
    ['{} Issue field', '{} 个议题字段'],
    // 议题字段「置顶到议题」说明：Choose which <a>issue types</a> show this field …
    ['Choose which {} show this field when viewing and creating issues.', '选择在查看和创建议题时显示此字段的{}。'],
    [
      'Choose whether {} are enabled or disabled by default for repositories in this organization. Individual repositories can override this default. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.',
      '选择此组织的存储库默认启用还是禁用{}。各存储库可以覆盖此默认设置。现有提交评论不受此设置影响，仍可查看、编辑和删除。'
    ]
  ]
} satisfies PageDictionary
