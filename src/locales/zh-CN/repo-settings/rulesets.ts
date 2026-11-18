import type { PageDictionary } from '../../../core/types'

/** 规则集类型：英文 → 中文 */
const RULE_KIND: Readonly<Record<string, string>> = {
  branch: '分支',
  tag: '标签',
  push: '推送',
  repository: '存储库'
}

/** 强制实施状态：英文 → 中文 */
const ENFORCEMENT: Readonly<Record<string, string>> = {
  Active: '活动',
  Evaluate: '评估',
  Disabled: '已禁用'
}

/** 强制实施状态说明（只读页「Active - This ruleset will be enforced」）：英文 → 中文 */
const ENFORCEMENT_DESCRIPTION: Readonly<Record<string, string>> = {
  'This ruleset will be enforced': '将强制实施此规则集',
  'Evaluate this ruleset to trial rules and view insights': '评估此规则集以试用规则并查看见解',
  'This ruleset will not be enforced': '不会强制实施此规则集'
}

/** 绕过参与者分类：英文 → 中文 */
const ACTOR_CATEGORY: Readonly<Record<string, string>> = {
  All: '全部',
  Roles: '角色',
  Teams: '团队',
  Apps: '应用',
  Users: '用户',
  Others: '其他',
  roles: '角色',
  teams: '团队',
  apps: '应用',
  users: '用户',
  agents: '代理',
  'other actors': '其他参与者'
}

/** 条件缺失提示的对象：英文 → 中文 */
const CONDITION_OBJECT: Readonly<Record<string, string>> = {
  Branch: '分支',
  Tag: '标签',
  Repository: '存储库',
  Organization: '组织',
  Workflow: '工作流'
}

/** 计数对象：英文（单复数）→ 中文量词 + 名词 */
function countNoun(noun: string): string {
  if (noun.startsWith('branch condition')) return '个分支条件'
  if (noun.startsWith('branch')) return '个分支'
  if (noun.startsWith('tag')) return '个标签'
  if (noun.startsWith('repositor')) return '个存储库'
  if (noun.startsWith('organization')) return '个组织'
  return '个目标'
}

/** 计数：超过 100 时显示 100+ */
const COUNT = String.raw`(\d+\+?)`
const NOUN = '(branch(?:es)?|branch conditions?|tags?|repositor(?:y|ies)|organizations?|targets?)'
/** 目标短语：N 个对象 / 所有推送 / 分支过多无法显示 */
const TARGET = String.raw`(?:${COUNT} ${NOUN}|(all pushes)|(branches \(too many to display\)))`

/** 「针对」+ 目标短语的译文；数字前加空格 */
function targeting(count: string, noun: string, all: string, many: string, inRepo = ''): string {
  const where = inRepo ? '针对此存储库中的' : '针对'
  if (all) return `${where}所有推送`
  if (many) return `${where}分支（过多无法显示）`
  return `${where} ${count} ${countNoun(noun)}`
}

/**
 * 存储库设置 · 规则集：规则集列表、新建 / 导入 / 导出 / 删除、编辑器（名称、强制实施状态、绕过列表、
 * 目标分支 / 标签 / 存储库 / 组织 / 工作流）、保存提示、历史记录、升级提示。
 * 规则与参数见 ruleset-rules.ts，规则见解见 ruleset-insights.ts，导入 / 转换分支保护规则见 ruleset-import.ts。
 * 组织设置的规则集页面同样使用这些文字（static 全局生效；scoped 与 regexp 只在存储库设置页生效）；
 * 与经典分支保护同名的规则（Require signed commits 等）见 branches.ts；
 * 「Filter items」「Select items」「Default」「None」等选择面板通用词由 common-ui 收录。
 */
export default {
  static: {
    // 列表与新建
    'New ruleset': '新建规则集',
    'New branch ruleset': '新建分支规则集',
    'New tag ruleset': '新建标签规则集',
    'New push ruleset': '新建推送规则集',
    'Import a ruleset': '导入规则集',
    'Organization rulesets': '组织规则集',
    'Enterprise rulesets': '企业规则集',
    'Upstream rulesets': '上游规则集',
    'Choose a JSON file to upload': '选择要上传的 JSON 文件',
    "You haven't created any rulesets": '你尚未创建任何规则集',
    'You haven’t created any rulesets': '你尚未创建任何规则集',
    'No rulesets have been added yet': '尚未添加规则集',
    'No rulesets matched your search': '没有与搜索匹配的规则集',
    'Try expanding your search or creating a new ruleset': '尝试扩大搜索范围或新建规则集',
    'Define whether collaborators can delete or force push and set requirements for any pushes, such as passing status checks or a linear commit history.':
      '决定协作者能否删除或强制推送，并为推送设置要求，例如通过状态检查或保持线性提交历史记录。',
    'define whether collaborators can delete or force push and set requirements for any pushes, such as passing status checks or a linear commit history.':
      '决定协作者能否删除或强制推送，并为推送设置要求，例如通过状态检查或保持线性提交历史记录。',
    'Ruleset menu': '规则集菜单',
    'Export ruleset': '导出规则集',
    'Delete ruleset': '删除规则集',
    'Delete ruleset?': '删除规则集？',
    'Are you sure you want to delete this ruleset? This action cannot be undone.': '确定要删除此规则集吗？此操作无法撤销。',
    'Open additional options': '打开更多选项',
    'Error deleting ruleset': '删除规则集时出错',
    'Error exporting ruleset': '导出规则集时出错',
    'Cannot delete a ruleset while restoring. Save or cancel and try again.': '恢复期间无法删除规则集。请保存或取消后重试。',
    'Cannot export a ruleset while restoring. Save or cancel and try again.': '恢复期间无法导出规则集。请保存或取消后重试。',
    'Push rulesets apply to these repositories and their forks.': '推送规则集适用于这些存储库及其复刻。',
    'Push rulesets only apply to non-fork private or internal repositories and forks of those repositories.':
      '推送规则集仅适用于非复刻的专用或内部存储库，以及这些存储库的复刻。',
    // 列表分隔片段（旧版列表中「• targeting」单独成节点）
    '• targeting': '• 针对',
    ', targeting': '，针对',

    // 导入 JSON
    'Cannot import an empty ruleset': '无法导入空规则集',
    'Error importing ruleset': '导入规则集时出错',
    'No file specified': '未指定文件',
    'Invalid file type': '文件类型无效',
    'Invalid ruleset specified': '指定的规则集无效',

    // 升级提示
    "Your rulesets won't be enforced on this private repository until you upgrade this organization account to GitHub Team.":
      '在将此组织帐户升级到 GitHub 团队版之前，规则集不会在此专用存储库上强制实施。',
    'Your rulesets won’t be enforced on this private repository until you upgrade this organization account to GitHub Team.':
      '在将此组织帐户升级到 GitHub 团队版之前，规则集不会在此专用存储库上强制实施。',
    "Your rulesets won't be enforced on this private repository until you move to GitHub Team organization account.":
      '在迁移到 GitHub 团队版组织帐户之前，规则集不会在此专用存储库上强制实施。',
    "Your rulesets won't be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.":
      '在迁移到 GitHub 团队版或企业版组织帐户之前，规则集不会在此专用存储库上强制实施。',
    'Your rulesets won’t be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.':
      '在迁移到 GitHub 团队版或企业版组织帐户之前，规则集不会在此专用存储库上强制实施。',
    "Your rulesets won't be enforced on this private repository until your organization account admins upgrade this organization account to GitHub Team.":
      '在组织帐户管理员将此组织帐户升级到 GitHub 团队版之前，规则集不会在此专用存储库上强制实施。',
    "Organization rulesets won't be enforced until you upgrade this organization account to GitHub Team.":
      '在将此组织帐户升级到 GitHub 团队版之前，组织规则集不会强制实施。',
    // 升级链接与前文分属不同节点
    "Your rulesets won't be enforced on this private repository until you": '规则集不会在此专用存储库上强制实施，除非你',
    'upgrade this organization account to GitHub Team.': '将此组织帐户升级到 GitHub 团队版。',
    'move to GitHub Team organization account.': '迁移到 GitHub 团队版组织帐户。',
    'until you upgrade this organization account to GitHub Enterprise.': '，除非将此组织帐户升级到 GitHub 企业版。',

    // 可删除 / 可转换的分支保护规则
    'You have branch protection rules that can be removed': '你有可以删除的分支保护规则',
    "This repository has branch protection rules that are fully covered by rulesets and can be removed without affecting your repository's protection.":
      '此存储库的部分分支保护规则已被规则集完全覆盖，删除后不会影响存储库的保护。',
    'Manage protected branches': '管理受保护分支',

    // 编辑器：名称与强制实施状态
    'Ruleset Name': '规则集名称',
    'Ruleset name': '规则集名称',
    'Ruleset name cannot be empty': '规则集名称不能为空',
    'Name cannot be empty': '名称不能为空',
    'Name must be unique': '名称必须唯一',
    'Enforcement status': '强制实施状态',
    'This ruleset will be enforced': '将强制实施此规则集',
    'Rules will be enforced': '将强制实施规则',
    'Enable Organization Ruleset': '启用组织规则集',
    'Enforce this ruleset on targeted repositories.': '对目标存储库强制实施此规则集。',
    'I want rules enforced on targeted repositories in this ruleset.': '我希望在此规则集针对的存储库上强制实施规则。',
    'Evaluate this ruleset to trial rules and view insights': '评估此规则集以试用规则并查看见解',
    'Evaluate Rulesets to trial rules and view insights': '评估规则集以试用规则并查看见解',
    'Evaluate mode is only available to Enterprise organizations.': '评估模式仅适用于企业版组织。',
    'Upgrade to Enterprise to use this mode.': '升级到企业版即可使用此模式。',
    'Do not evaluate or enforce rules': '不评估也不强制实施规则',
    'This ruleset will not be enforced': '不会强制实施此规则集',

    // 绕过列表
    'Bypass list': '绕过列表',
    'Allow list': '允许列表',
    'Allowed actors': '允许的参与者',
    'Exempt roles, teams, and apps from this ruleset by adding them to the bypass list.':
      '将角色、团队和应用添加到绕过列表，使其不受此规则集约束。',
    'Exempt roles, teams, or apps from this ruleset by adding them to the bypass list.':
      '将角色、团队或应用添加到绕过列表，使其不受此规则集约束。',
    'Exempt roles, teams, agents, apps, and users from this ruleset by adding them to the bypass list.':
      '将角色、团队、代理、应用和用户添加到绕过列表，使其不受此规则集约束。',
    'Exempt roles, teams, agents, and apps from this ruleset by adding them to the bypass list.':
      '将角色、团队、代理和应用添加到绕过列表，使其不受此规则集约束。',
    'Exempt roles, teams, agents, and apps from this ruleset by adding them to the allow list.':
      '将角色、团队、代理和应用添加到允许列表，使其不受此规则集约束。',
    'Exempt roles or teams from this ruleset by adding them to the bypass list': '添加到绕过列表的角色或团队不受此规则集约束',
    'Select the roles and teams that can bypass and also approve bypass requests. Add the bots and agents that can bypass this ruleset.':
      '选择可以绕过并审批绕过请求的角色和团队。添加可以绕过此规则集的机器人和代理。',
    'Select the roles that can bypass and also approve bypass requests.': '选择可以绕过并审批绕过请求的角色。',
    'Add bypass': '添加绕过',
    'Add actors': '添加参与者',
    'Choose which roles, teams, and apps can bypass this ruleset': '选择可以绕过此规则集的角色、团队和应用',
    'Choose which roles, teams, agents, apps, and users can bypass this ruleset': '选择可以绕过此规则集的角色、团队、代理、应用和用户',
    'Choose which roles, teams, agents, and apps can bypass this ruleset': '选择可以绕过此规则集的角色、团队、代理和应用',
    'Filter actors': '筛选参与者',
    'Filter bypass actors': '筛选绕过参与者',
    'Filter actors by category': '按类别筛选参与者',
    'No suggestions': '无建议',
    'Adjust your search term to find other actors': '调整搜索词以查找其他参与者',
    'No actors have been added.': '尚未添加参与者。',
    'Organization admin': '组织管理员',
    'Repository admin': '存储库管理员',
    'Enterprise team': '企业团队',
    'Add selected': '添加所选项',
    'Add Selected': '添加所选项',
    'Always allow': '始终允许',
    'Allow for pull requests only': '仅允许用于拉取请求',
    'For pull requests only': '仅限拉取请求',
    'Select bypass mode': '选择绕过模式',
    'Bypass actor actions': '绕过参与者操作',
    'The ruleset will be evaluated and the selected actor(s) will be prompted to bypass': '将评估规则集并提示所选参与者绕过',
    'The ruleset will not be evaluated and no bypass prompt will be shown': '不评估规则集也不显示绕过提示',
    'The ruleset will be enforced on command line changes and the selected actor(s) will be prompted to bypass only in a pull request':
      '对命令行更改强制实施规则集，仅在拉取请求中提示所选参与者绕过',
    'Delete bypass': '删除绕过',
    'Bypass list is empty': '绕过列表为空',
    'Allow list is empty': '允许列表为空',

    // 目标：存储库 / 组织（组织、企业规则集）
    'Which branches should be matched?': '应匹配哪些分支？',
    'Which tags should be matched?': '应匹配哪些标签？',
    'Which repositories should be matched?': '应匹配哪些存储库？',
    'Which organizations should be matched?': '应匹配哪些组织？',
    'Which workflows should be matched?': '应匹配哪些工作流？',
    'Which branches do you want to make a ruleset for?': '要为哪些分支创建规则集？',
    'Which tags do you want to make a ruleset for?': '要为哪些标签创建规则集？',
    'Which repositories and branches do you want to make a ruleset for?': '要为哪些存储库和分支创建规则集？',
    'Target repositories': '目标存储库',
    'Target organizations': '目标组织',
    'Target workflows': '目标工作流',
    'Repository targeting determines which repositories will be protected by this ruleset. Use inclusion patterns to expand the list of repositories under this ruleset. Use exclusion patterns to exclude repositories.':
      '存储库目标决定此规则集保护哪些存储库。使用包含模式扩展此规则集下的存储库列表，使用排除模式排除存储库。',
    'Repository targeting determines which repositories will be protected by this ruleset.': '存储库目标决定此规则集保护哪些存储库。',
    'Organization targeting determines which repositories will be protected by this ruleset.': '组织目标决定此规则集保护哪些存储库。',
    'Target all repositories within the organization': '针对组织内的所有存储库',
    'Target all organizations within the enterprise': '针对企业内的所有组织',
    'Dynamic list by name': '按名称动态列表',
    'Target repositories based on name': '按名称选择目标存储库',
    'Target organizations based on name': '按名称选择目标组织',
    'Dynamic list by property': '按属性动态列表',
    'Target repositories based on properties': '按属性选择目标存储库',
    'Target organizations based on properties': '按属性选择目标组织',
    'Target a specific list of selected repositories': '针对特定的选定存储库列表',
    'Target a specific list of selected organizations': '针对特定的选定组织列表',
    'All organizations': '所有组织',
    'Select organizations': '选择组织',
    'Targeting criteria': '目标条件',
    'Repository targeting criteria': '存储库目标条件',
    'Repositories matching a name': '名称匹配的存储库',
    'No repository targets have been added yet': '尚未添加存储库目标',
    'No organization targets have been added yet': '尚未添加组织目标',
    'Target all enterprise managed user accounts': '针对所有企业托管用户帐户',
    'If enabled, this ruleset will also apply to all repositories owned by enterprise managed users.':
      '启用后，此规则集还将应用于企业托管用户拥有的所有存储库。',
    'Prevent renaming of target repositories': '禁止重命名目标存储库',
    'When checked, target repositories can only be renamed by those with bypass permission.':
      '勾选后，只有拥有绕过权限的人才能重命名目标存储库。',
    'Repositories that match the matching pattern will be targeted by this ruleset.': '匹配此模式的存储库将成为此规则集的目标。',
    'Repositories that do not match the matching pattern will be targeted by this ruleset.': '不匹配此模式的存储库将成为此规则集的目标。',
    'Organizations that match the matching pattern will be targeted by this ruleset.': '匹配此模式的组织将成为此规则集的目标。',
    'Organizations that do not match the matching pattern will be targeted by this ruleset.': '不匹配此模式的组织将成为此规则集的目标。',
    'Target by repository properties': '按存储库属性选择目标',
    'Target by organization properties': '按组织属性选择目标',
    'Include by property': '按属性包含',
    'Exclude by property': '按属性排除',
    'Include repositories by property': '按属性包含存储库',
    'Exclude repositories by property': '按属性排除存储库',
    'Include organizations by property': '按属性包含组织',
    'Exclude organizations by property': '按属性排除组织',
    'Include repositories by custom property': '按自定义属性包含存储库',
    'Custom properties allow you to create your own metadata for repositories': '自定义属性可用于为存储库创建自己的元数据',
    'Select property': '选择属性',
    'Search for properties': '搜索属性',
    'Please select a property': '请选择属性',
    'Please select at least one value': '请至少选择一个值',
    'Select a value': '选择值',
    'Search for values': '搜索值',
    'The count is based on repositories visible to an organization administrator.': '计数基于组织管理员可见的存储库。',

    // 目标：分支 / 标签
    'Target branches': '目标分支',
    'Target tags': '目标标签',
    'Add a target': '添加目标',
    'Add target': '添加目标',
    'Branch targeting determines which branches will be protected by this ruleset. Use inclusion patterns to expand the list of branches under this ruleset. Use exclusion patterns to exclude branches.':
      '分支目标决定此规则集保护哪些分支。使用包含模式扩展此规则集下的分支列表，使用排除模式排除分支。',
    'Tag targeting determines which tags will be protected by this ruleset. Use inclusion patterns to expand the list of tags under this ruleset. Use exclusion patterns to exclude tags.':
      '标签目标决定此规则集保护哪些标签。使用包含模式扩展此规则集下的标签列表，使用排除模式排除标签。',
    'Branch targeting criteria': '分支目标条件',
    'Tag targeting criteria': '标签目标条件',
    'Include default branch': '包含默认分支',
    'Include all tags': '包含所有标签',
    'Target by inclusion or exclusion pattern': '按包含或排除模式选择目标',
    'Include by pattern': '按模式包含',
    'Exclude by pattern': '按模式排除',
    'Branch targeting has not been configured': '尚未配置分支目标',
    'Tag targeting has not been configured': '尚未配置标签目标',
    'Targets have changed and branch match list will update on save.': '目标已更改，分支匹配列表将在保存时更新。',
    'Targets have changed and tag match list will update on save.': '目标已更改，标签匹配列表将在保存时更新。',
    'Targets have changed and repository match list will update on save.': '目标已更改，存储库匹配列表将在保存时更新。',
    'Targets have changed and organization match list will update on save.': '目标已更改，组织匹配列表将在保存时更新。',
    'Targets have changed and': '目标已更改并且',
    'match list will update on save.': '匹配列表将在保存时更新。',
    'Branches that match the matching pattern will be targeted by this ruleset.': '匹配此模式的分支将成为此规则集的目标。',
    'Tags that match the matching pattern will be targeted by this ruleset.': '匹配此模式的标签将成为此规则集的目标。',
    'Branches that do not match the matching pattern will be targeted by this ruleset.': '不匹配此模式的分支将成为此规则集的目标。',
    'Tags that do not match the matching pattern will be targeted by this ruleset.': '不匹配此模式的标签将成为此规则集的目标。',
    'Pattern cannot be empty': '模式不能为空',
    'Invalid pattern': '无效的模式',
    'Branch naming pattern': '分支命名模式',
    'Tag naming pattern': '标签命名模式',
    'Repository naming pattern': '存储库命名模式',
    'Organization naming pattern': '组织命名模式',
    'Example patterns:': '模式示例：',
    'Learn more about fnmatch': '了解 fnmatch',
    'Add Inclusion pattern': '添加包含模式',
    'Add Exclusion pattern': '添加排除模式',

    // 目标：工作流（组织、企业的操作规则集）
    'Workflow path pattern': '工作流路径模式',
    'Workflows that match the matching pattern will be targeted by this ruleset.': '匹配此模式的工作流将成为此规则集的目标。',
    'Workflows that do not match the matching pattern will be targeted by this ruleset.': '不匹配此模式的工作流将成为此规则集的目标。',
    'Workflow targeting criteria': '工作流目标条件',
    'No workflow targets have been added yet': '尚未添加工作流目标',
    'Add an include or exclude pattern to target workflow files with this ruleset.': '添加包含或排除模式，使此规则集针对工作流文件。',
    'All workflows are targeted': '已针对所有工作流',
    'Target a centrally managed required workflow': '针对集中管理的必需工作流',
    'Choose a centrally managed required workflow without entering its internal execution path.':
      '选择集中管理的必需工作流，无需输入其内部执行路径。',
    'Include required workflow': '包含必需工作流',
    'Exclude required workflow': '排除必需工作流',
    'Required workflow': '必需工作流',
    'Please select a workflow': '请选择工作流',
    'The saved workflow targeting condition is incomplete and cannot be displayed. It will be preserved when you save other changes.':
      '已保存的工作流目标条件不完整，无法显示。保存其他更改时会保留该条件。',

    // 保存与提示
    'Reverting...': '还原中...',
    'Reverting…': '还原中…',
    'Ruleset created': '规则集已创建',
    'Ruleset imported': '规则集已导入',
    'Ruleset updated': '规则集已更新',
    'Ruleset restored': '规则集已恢复',
    'Ruleset deleted': '规则集已删除',
    'Failed to save ruleset': '保存规则集失败',
    'Failed to get saved ruleset': '获取已保存的规则集失败',
    'Changes reverted': '更改已还原',
    'No changes have been made': '未做任何更改',
    "Invalid rules: 'Required status checks'": '无效的规则：“必需的状态检查”',
    'This ruleset has been restored to a previous version but the changes have not been saved.':
      '此规则集已恢复到之前的版本，但更改尚未保存。',
    'Review and save the changes below.': '请在下方审查并保存更改。',
    'This ruleset has been imported but the changes have not been saved.': '此规则集已导入，但更改尚未保存。',
    'This ruleset does not target any resources and will not be applied.': '此规则集未针对任何资源，不会生效。',
    'does not target any resources and will not be applied.': '未针对任何资源，不会生效。',
    'You are viewing a previous version of this ruleset. This ruleset has been modified since this version. See the':
      '你正在查看此规则集的旧版本。此版本之后规则集已被修改。查看',
    'latest version': '最新版本',
    'Push rulesets are applied to a repository and its downstream repositories. To review the downstream repositories that will inherit this ruleset,':
      '推送规则集适用于存储库及其下游存储库。要查看将继承此规则集的下游存储库，请',
    'visit the forks page': '访问复刻页面',

    // 历史版本
    'Ruleset history': '规则集历史记录',
    'Restore ruleset': '恢复规则集',
    'Restore the ruleset to this version': '将规则集恢复到此版本',
    'No ruleset history available': '暂无规则集历史记录',
    'History menu': '历史记录菜单',
    'View a diff of these changes': '查看这些更改的差异'
  },
  scoped: {
    Ruleset: '规则集',
    ruleset: '规则集',
    rulesets: '规则集',
    rules: '条规则',
    protections: '保护',
    Active: '活动',
    Evaluate: '评估',
    Exempt: '豁免',
    App: '应用',
    Apps: '应用',
    Roles: '角色',
    Others: '其他',
    Actors: '参与者',
    Always: '始终',
    Target: '目标',
    'Target:': '目标：',
    Repos: '存储库',
    Property: '属性',
    include: '包含',
    exclude: '排除',
    'Applies to': '适用于',
    'Applies To': '适用于',
    // 适用目标摘要：Applies to <a>3 targets</a> including main, dev and others.
    including: '包括',
    'and others': '等',
    // 只读规则集页的目标条件：Include: main、Exclude: release/*
    'Include:': '包含：',
    'Exclude:': '排除：',
    // 规则页（/rules）：「Managed by」+ 链接 <owner>；「All」标签的读屏名称
    'Managed by': '管理者',
    'All branch': '全部分支',
    'target:': '个目标：',
    'targets:': '个目标：',
    'targets including': '个目标包括',
    'naming pattern': '命名模式',
    'All branches': '所有分支',
    'All tags': '所有标签',
    branch: '分支',
    branches: '分支',
    tag: '标签',
    Tag: '标签',
    tags: '标签',
    Export: '导出',
    Revert: '还原',
    // 保存 / 还原按钮：Save<span> changes</span>
    changes: '更改',
    // 历史记录：octocat edited <relative-time>
    edited: '编辑于',
    Unauthorized: '未授权'
  },
  regexp: [
    // 规则集列表：6 branch rules • targeting 1 branch（超过 100 显示 100+）
    [
      new RegExp(String.raw`^${COUNT} (branch|tag|push|repository) rules?(?: [•·] targeting ${TARGET})?$`),
      (_, count: string, kind: string, targets: string, noun: string, all: string, many: string) => {
        const rules = `${count} 条${RULE_KIND[kind] ?? kind}规则`
        return targets || all || many ? `${rules} • ${targeting(targets, noun, all, many)}` : rules
      }
    ],
    // 旧版列表：「• targeting 1 branch」单独成节点
    [
      new RegExp(String.raw`^[•·,] targeting ${COUNT} ${NOUN}$`),
      (match: string, targets: string, noun: string) => `${match.startsWith(',') ? '，' : '• '}针对 ${targets} ${countNoun(noun)}`
    ],
    // Copilot 代码审查页：3 Copilot code review rules • targeting 2 branches in this repository
    [
      new RegExp(String.raw`^${COUNT} Copilot code review rules?(?: [•·] targeting ${TARGET}( in this repository)?)?$`),
      (_, count: string, targets: string, noun: string, all: string, many: string, inRepo: string) => {
        const rules = `${count} 条 Copilot 代码审查规则`
        return targets || all || many ? `${rules} • ${targeting(targets, noun, all, many, inRepo)}` : rules
      }
    ],
    [
      new RegExp(String.raw`^targeting ${TARGET}( in this repository)?$`),
      (_, targets: string, noun: string, all: string, many: string, inRepo: string) => targeting(targets, noun, all, many, inRepo)
    ],
    // 规则集计数：3 rulesets、1 organization ruleset
    [
      new RegExp(String.raw`^${COUNT} (?:(repository|organization) )?rulesets?$`),
      (_, count: string, owner: string) => `${count} 个${owner === 'repository' ? '存储库' : owner === 'organization' ? '组织' : ''}规则集`
    ],
    [new RegExp(String.raw`^${COUNT} rules?$`), '$1 条规则'],
    // 编辑器：适用目标数（数量在链接中时由 scoped「Applies to」「including」与下一条分别匹配）
    [
      new RegExp(String.raw`^Applies to ${COUNT} targets?(:| including)?$`),
      (_, count: string, tail: string) => `适用于 ${count} 个目标${tail === ':' ? '：' : tail ? '包括' : ''}`
    ],
    [
      new RegExp(String.raw`^${COUNT} targets?(:| including)?$`),
      (_, count: string, tail: string) => `${count} 个目标${tail === ':' ? '：' : tail ? '包括' : ''}`
    ],
    // 编辑器：强制实施状态、绕过参与者分类的读屏名称
    [/^(Active|Evaluate|Disabled), Enforcement status$/, (_, status: string) => `${ENFORCEMENT[status] ?? status}，强制实施状态`],
    [
      /^(All|Roles|Teams|Apps|Users|Others), Filter actors by category$/,
      (_, category: string) => `${ACTOR_CATEGORY[category] ?? category}，按类别筛选参与者`
    ],
    // 只读规则集页：Active - This ruleset will be enforced
    [
      /^- (This ruleset will be enforced|Evaluate this ruleset to trial rules and view insights|This ruleset will not be enforced)$/,
      (_, description: string) => `- ${ENFORCEMENT_DESCRIPTION[description] ?? description}`
    ],
    // 绕过列表按类别筛选后为空
    [
      /^No (roles|teams|apps|users|agents|other actors) in (bypass|allow) list$/,
      (_, category: string, list: string) => `${list === 'allow' ? '允许列表' : '绕过列表'}中没有${ACTOR_CATEGORY[category] ?? category}`
    ],
    // 添加绕过面板候选项的说明：Team • @devs、App • octo-org（团队名、应用所有者原样保留）
    [/^(Team|App) • (.{1,100})$/, (_, type: string, name: string) => `${type === 'Team' ? '团队' : '应用'} • ${name}`],
    // 列表：缺少目标条件
    [
      /^(Branch|Tag|Repository|Organization|Workflow) conditions missing$/,
      (_, object: string) => `缺少${CONDITION_OBJECT[object] ?? object}条件`
    ],
    // 添加目标对话框：Example patterns: "main", "releases/**/*", "users/**/*".
    [/^Example patterns: ("[^"]{1,80}"(?:, "[^"]{1,80}"){0,5})\.$/, '模式示例：$1。'],
    // 按属性添加目标：已选多个值
    [/^(\d+) values selected$/, '已选择 $1 个值'],
    // 操作菜单读屏名称：View history for the ruleset named main-protection
    [
      /^View (history|insights) for the ruleset named (.{1,100})$/,
      (_, kind: string, name: string) => `查看规则集 ${name} 的${kind === 'history' ? '历史记录' : '见解'}`
    ],
    // 导入失败：Error importing ruleset: <服务端消息>
    [/^Error importing ruleset: (.{1,200})$/, '导入规则集时出错：$1'],
    // 继承来源分组
    [/^Managed by ([\w.-]+)$/, '由 $1 管理'],
    [/^As an? ([\w.-]+) admin, you can$/, '作为 $1 管理员，你可以'],
    [
      /^manage ([\w.-]+) rulesets in (organization|enterprise) settings\.$/,
      (_, name: string, owner: string) => `在${owner === 'enterprise' ? '企业' : '组织'}设置中管理 ${name} 规则集。`
    ]
  ]
} satisfies PageDictionary
