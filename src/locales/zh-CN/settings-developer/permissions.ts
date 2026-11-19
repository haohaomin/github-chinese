import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 精细个人访问令牌、GitHub 应用的权限名称（标题）。
 * 键为界面上的英文标题，值为译文（产品名按用户要求译成中文：Actions → 操作、Codespaces → 代码空间、
 * Copilot Chat → Copilot 聊天、Pages → 页面）；供 scoped 词条和“Remove X”等正则共用。
 */
export const PERMISSION_TITLES: Readonly<Record<string, string>> = {
  // 存储库权限
  Actions: '操作',
  Administration: '管理',
  'Agent secrets': '智能体机密',
  'Agent tasks': '智能体任务',
  'Agent variables': '智能体变量',
  'Artifact metadata': '产物元数据',
  Attestations: '证明',
  Checks: '检查',
  'Code quality': '代码质量',
  'Code scanning alerts': '代码扫描警报',
  Codespaces: '代码空间',
  'Codespaces lifecycle admin': '代码空间生命周期管理',
  'Codespaces metadata': '代码空间元数据',
  'Codespaces secrets': '代码空间机密',
  'Commit statuses': '提交状态',
  Contents: '内容',
  'Copilot agent settings': 'Copilot 智能体设置',
  'Custom properties': '自定义属性',
  'Dependabot alerts': 'Dependabot 警报',
  'Dependabot secrets': 'Dependabot 机密',
  Deployments: '部署',
  Discussions: '讨论',
  Environments: '环境',
  'GitHub App installation repository access': 'GitHub 应用安装的存储库访问权限',
  Issues: '议题',
  'License compliance alerts': '许可证合规警报',
  'Merge queues': '合并队列',
  Metadata: '元数据',
  Packages: '软件包',
  Pages: '页面',
  Projects: '项目',
  'Pull requests': '拉取请求',
  'Repository creation': '存储库创建',
  'Repository license policy': '存储库许可证策略',
  'Repository security advisories': '存储库安全公告',
  'Secret scanning alert dismissal requests': '机密扫描警报消除请求',
  'Secret scanning alerts': '机密扫描警报',
  'Secret scanning push protection bypass requests': '机密扫描推送保护绕过请求',
  Secrets: '机密',
  'Single file': '单个文件',
  Variables: '变量',
  Webhooks: 'Web 钩子',
  Workflows: '工作流',
  // 帐户权限
  'Block another user': '阻止其他用户',
  'Codespaces user secrets': '代码空间用户机密',
  'Copilot Chat': 'Copilot 聊天',
  'Copilot Editor Context': 'Copilot 编辑器上下文',
  'Copilot Requests': 'Copilot 请求',
  'Email addresses': '电子邮件地址',
  Events: '事件',
  Followers: '关注者',
  'GPG keys': 'GPG 密钥',
  Gists: '代码片段',
  'Git SSH keys': 'Git SSH 密钥',
  'Interaction limits': '交互限制',
  'Knowledge bases': '知识库',
  Models: '模型',
  Plan: '计划',
  'Plugin gateway connections': '插件网关连接',
  'Private repository invitations': '专用存储库邀请',
  Profile: '个人资料',
  'SSH signing keys': 'SSH 签名密钥',
  Starring: '星标',
  Watching: '关注',
  // 组织权限
  'API Insights': 'API 洞察',
  'Blocking users': '阻止用户',
  Campaigns: '活动',
  'Copilot Spaces': 'Copilot 空间',
  'Copilot content exclusion': 'Copilot 内容排除',
  'Custom organization roles': '自定义组织角色',
  'Custom properties for organizations': '组织自定义属性',
  'Custom repository roles': '自定义存储库角色',
  'External custom properties for repositories': '存储库的外部自定义属性',
  'GitHub Copilot Business': 'GitHub Copilot 商业版',
  'Hosted runner custom images': '托管运行器自定义映像',
  'Issue Fields': '议题字段',
  'Issue Types': '议题类型',
  Members: '成员',
  'Network configurations': '网络配置',
  'Organization announcement banners': '组织公告横幅',
  'Organization bypass requests for secret scanning': '组织机密扫描绕过请求',
  'Organization codespaces': '组织代码空间',
  'Organization codespaces secrets': '组织代码空间机密',
  'Organization codespaces settings': '组织代码空间设置',
  'Organization Copilot metrics': '组织 Copilot 指标',
  'Organization credentials': '组织凭据',
  'Organization dependabot secrets': '组织 Dependabot 机密',
  'Organization dismissal requests for code scanning': '组织代码扫描消除请求',
  'Organization dismissal requests for Dependabot': '组织 Dependabot 消除请求',
  'Organization innersource vulnerabilities': '组织内源漏洞',
  'Organization IP allow list': '组织 IP 允许列表',
  'Organization private registries': '组织专用注册表',
  'Organization verifiable domains': '组织可验证域',
  'Personal access token requests': '个人访问令牌请求',
  'Personal access tokens': '个人访问令牌',
  'Self-hosted runners': '自托管运行器',
  'Team discussions': '团队讨论',
  // 企业权限
  'Copilot usage records': 'Copilot 使用记录',
  'Custom enterprise roles': '自定义企业角色',
  'Enterprise access restrictions': '企业访问限制',
  'Enterprise AI controls': '企业 AI 控制',
  'Enterprise billing': '企业计费',
  'Enterprise bypass requests': '企业绕过请求',
  'Enterprise Copilot metrics': '企业 Copilot 指标',
  'Enterprise Copilot license management': '企业 Copilot 许可证管理',
  'Enterprise credentials': '企业凭据',
  'Enterprise custom organization roles': '企业自定义组织角色',
  'Enterprise custom properties for organizations': '企业的组织自定义属性',
  'Enterprise innersource vulnerabilities': '企业内源漏洞',
  'Enterprise IP allow list': '企业 IP 允许列表',
  'Enterprise license policy': '企业许可证策略',
  'Enterprise Organization and Repository Policies': '企业组织和存储库策略',
  'Enterprise organization installation repositories': '企业组织安装的存储库',
  'Enterprise organization installations': '企业组织安装',
  'Enterprise organizations': '企业组织',
  'Enterprise people': '企业人员',
  'Enterprise Ruleset': '企业规则集',
  'Enterprise SCIM': '企业 SCIM',
  'Enterprise security products': '企业安全产品',
  'Enterprise settings': '企业设置',
  'Enterprise single sign-on': '企业单一登录',
  'Enterprise teams': '企业团队',
  'Enterprise two-factor authentication': '企业双因素身份验证',
  'Enterprise verifiable domains': '企业可验证域'
}

/** 已安装应用页“Read access to …”列表中的小写资源名 */
const RESOURCE_NAMES: Readonly<Record<string, string>> = {
  actions: '操作',
  administration: '管理',
  'artifact metadata': '产物元数据',
  attestations: '证明',
  checks: '检查',
  code: '代码',
  'code scanning alerts': '代码扫描警报',
  codespaces: '代码空间',
  'codespaces lifecycle admin': '代码空间生命周期管理',
  'codespaces metadata': '代码空间元数据',
  'codespaces secrets': '代码空间机密',
  'commit statuses': '提交状态',
  contents: '内容',
  'custom properties': '自定义属性',
  'dependabot alerts': 'Dependabot 警报',
  'dependabot secrets': 'Dependabot 机密',
  deployments: '部署',
  discussions: '讨论',
  environments: '环境',
  issues: '议题',
  'merge queues': '合并队列',
  metadata: '元数据',
  packages: '软件包',
  pages: '页面',
  projects: '项目',
  'pull requests': '拉取请求',
  'repository hooks': '存储库 Web 钩子',
  'repository projects': '存储库项目',
  'repository advisories': '存储库公告',
  'repository security advisories': '存储库安全公告',
  'secret scanning alerts': '机密扫描警报',
  secrets: '机密',
  'security events': '安全事件',
  'single file': '单个文件',
  statuses: '状态',
  variables: '变量',
  'vulnerability alerts': '漏洞警报',
  webhooks: 'Web 钩子',
  workflows: '工作流',
  members: '成员',
  'organization administration': '组织管理',
  'organization hooks': '组织 Web 钩子',
  'organization plan': '组织计划',
  'organization projects': '组织项目',
  'organization secrets': '组织机密',
  'organization self hosted runners': '组织自托管运行器',
  'organization user blocking': '组织用户阻止',
  'team discussions': '团队讨论',
  'email addresses': '电子邮件地址',
  followers: '关注者',
  gists: '代码片段',
  'git ssh keys': 'Git SSH 密钥',
  'gpg keys': 'GPG 密钥',
  'interaction limits': '交互限制',
  keys: '密钥',
  plan: '计划',
  profile: '个人资料',
  starring: '星标',
  watching: '关注',
  models: '模型',
  'knowledge bases': '知识库',
  'copilot chat': 'Copilot 聊天',
  'copilot editor context': 'Copilot 编辑器上下文'
}

const LIST_SEPARATOR_RE = /, and |, | and /

function escapeSource(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}

/** 长词在前，避免前缀抢先匹配 */
function alternation(words: readonly string[]): string {
  return [...words]
    .sort((a, b) => b.length - a.length)
    .map(escapeSource)
    .join('|')
}

const RESOURCE_SOURCE = alternation(Object.keys(RESOURCE_NAMES))

/** 只由已知资源名组成的列表：“code, issues, and pull requests” */
export const RESOURCE_LIST_SOURCE = `(?:${RESOURCE_SOURCE})(?:(?:, and |, | and )(?:${RESOURCE_SOURCE}))*`

/** “code, issues, and pull requests” → 代码、议题和拉取请求（未知资源名保留英文） */
export function translatePermissionList(list: string): string {
  const items = list.split(LIST_SEPARATOR_RE).map(item => RESOURCE_NAMES[item] ?? item)
  if (items.length === 1) return items[0]!
  const head = items.slice(0, -1).reduce((acc, item) => joinCjk(joinCjk(acc, '、'), item))
  return joinCjk(joinCjk(head, '和'), items[items.length - 1]!)
}

const ACCESS_VERB: Readonly<Record<string, string>> = {
  'Read and write': '读写',
  Read: '读取',
  Admin: '管理'
}

export const ACCESS_LEVEL: Readonly<Record<string, string>> = {
  'No access': '无权限',
  'Read-only': '只读',
  'Read and write': '读写',
  Admin: '管理员'
}

/** 权限标题的正则片段 */
export const PERMISSION_TITLE_SOURCE = alternation(Object.keys(PERMISSION_TITLES))

/**
 * 已由其他文件收录且译文相同的标题，不再放进 scoped：
 * keys.ts 的 static；settings-account 的菜单项（Pages、Codespaces）、通知设置（Actions）与计划页；
 * 全站 static（common 导航与对话框、存储库设置、组织设置等）。
 * 例外：Watching 由通知设置收录为“正在关注”（同在 settings 页面类型），权限名拼接仍用“关注”
 */
export const PROVIDED_TITLES: ReadonlySet<string> = new Set([
  'GPG keys',
  'Interaction limits',
  'Watching',
  'Plan',
  'Attestations',
  'Checks',
  'Code scanning alerts',
  'Codespaces secrets',
  'Copilot Chat',
  'Dependabot secrets',
  'Discussions',
  'Gists',
  'Issues',
  'Models',
  'Network configurations',
  'Packages',
  'Profile',
  'Projects',
  'Pull requests',
  'Secret scanning alerts',
  'Self-hosted runners',
  'Team discussions',
  'Workflows',
  'Agent tasks',
  'Repository creation',
  'Enterprise settings',
  'Pages',
  'Actions',
  'Codespaces'
])

/** 只收译文与原文不同的标题 */
const TITLE_ENTRIES = Object.fromEntries(
  Object.entries(PERMISSION_TITLES).filter(([key, value]) => key !== value && !PROVIDED_TITLES.has(key))
)

/**
 * GitHub 应用可订阅的 Web 钩子事件名（译法与存储库、组织 Web 钩子一致），
 * 供 scoped 词条和“Learn more about the X event”正则共用。
 */
export const EVENT_TITLES: Readonly<Record<string, string>> = {
  'Branch protection configuration': '分支保护配置',
  'Branch protection rule': '分支保护规则',
  'Check run': '检查运行',
  'Check suite': '检查套件',
  'Code scanning alert': '代码扫描警报',
  'Commit comment': '提交评论',
  Create: '创建',
  'Custom property': '自定义属性',
  'Custom property values': '自定义属性值',
  Delete: '删除',
  'Dependabot alert': 'Dependabot 警报',
  'Deploy key': '部署密钥',
  Deployment: '部署',
  'Deployment protection rule': '部署保护规则',
  'Deployment review': '部署审查',
  'Deployment status': '部署状态',
  Discussion: '讨论',
  'Discussion comment': '讨论评论',
  'Dismissal request code scanning': '代码扫描消除请求',
  'Dismissal request dependabot': 'Dependabot 消除请求',
  'Dismissal request license compliance': '许可证合规消除请求',
  'Dismissal request secret scanning': '机密扫描消除请求',
  'Exemption request push ruleset': '推送规则集豁免请求',
  'Exemption request secret scanning': '机密扫描豁免请求',
  Fork: '复刻',
  Gollum: 'Gollum',
  'Installation target': '安装目标',
  'Issue comment': '议题评论',
  'Issue dependencies': '议题依赖',
  'Issue relates to': '议题关联',
  Issues: '议题',
  Label: '标签',
  Member: '成员',
  Membership: '成员身份',
  'Merge group': '合并组',
  'Merge queue entry': '合并队列条目',
  Meta: 'Web 钩子本身',
  Milestone: '里程碑',
  'Org block': '组织阻止',
  Organization: '组织',
  'Organization custom property values': '组织自定义属性值',
  'Page build': '页面构建',
  'Personal access token request': '个人访问令牌请求',
  Project: '项目',
  'Project card': '项目卡片',
  'Project column': '项目列',
  'Projects v2': '项目 v2',
  'Projects v2 item': '项目 v2 项',
  'Projects v2 status update': '项目 v2 状态更新',
  Public: '公共',
  'Pull request': '拉取请求',
  'Pull request review': '拉取请求审查',
  'Pull request review comment': '拉取请求审查评论',
  'Pull request review thread': '拉取请求审查线程',
  Push: '推送',
  'Registry package': '注册表软件包',
  Release: '发行版',
  Repository: '存储库',
  'Repository advisory': '存储库公告',
  'Repository dispatch': '存储库调度',
  'Repository import': '存储库导入',
  'Repository ruleset': '存储库规则集',
  'Secret scanning alert': '机密扫描警报',
  'Secret scanning alert location': '机密扫描警报位置',
  'Secret scanning scan': '机密扫描任务',
  'Security advisory': '安全公告',
  'Security and analysis': '安全与分析',
  Star: '星标',
  Status: '状态',
  'Sub issues': '子议题',
  Team: '团队',
  'Team add': '团队添加',
  Watch: '关注',
  'Workflow dispatch': '工作流调度',
  'Workflow job': '工作流作业',
  'Workflow run': '工作流运行'
}

/** 已由全站 static（或本词典其他词条，如阻止用户表格的 Label）收录且译文相同的事件名，不再放进 scoped */
export const PROVIDED_EVENTS: ReadonlySet<string> = new Set([
  'Create',
  'Custom property values',
  'Delete',
  'Dependabot alert',
  'Fork',
  'Issue dependencies',
  'Issues',
  'Label',
  'Member',
  'Membership',
  'Organization',
  'Projects v2',
  'Public',
  'Pull request',
  'Release',
  'Repository',
  'Secret scanning alert',
  'Security advisory',
  'Star',
  'Status',
  'Sub issues',
  'Team',
  'Watch',
  'Workflow dispatch',
  'Workflow job',
  'Workflow run'
])

const EVENT_ENTRIES = Object.fromEntries(Object.entries(EVENT_TITLES).filter(([key, value]) => key !== value && !PROVIDED_EVENTS.has(key)))

const EVENT_TITLE_SOURCE = alternation(Object.keys(EVENT_TITLES))

/** 权限选择器各分区的计数标签：「repository mandatory permission count」 */
const PERMISSION_SECTION: Readonly<Record<string, string>> = {
  repository: '存储库',
  organization: '组织',
  user: '帐户',
  business: '企业'
}

/**
 * 权限：精细个人访问令牌与 GitHub 应用的权限标题、说明，权限选择器（React），
 * 已安装应用的权限摘要（“Read access to …”），GitHub App 可订阅的 Web 钩子事件。
 * 权限标题与事件名都是短词，放 scoped；说明句放 static。
 */
export default {
  static: {
    // 存储库权限说明
    'Workflows, workflow runs and artifacts.': '工作流、工作流运行和产物。',
    'Repository creation, deletion, settings, teams, and collaborators.': '存储库的创建、删除、设置、团队和协作者。',
    'Create and retrieve artifact metadata for a repository.': '创建和检索存储库的产物元数据。',
    'Create and retrieve attestations for a repository.': '创建和检索存储库的证明。',
    'Checks on code.': '代码检查。',
    'View and manage code scanning alerts.': '查看和管理代码扫描警报。',
    'Create, edit, delete and list Codespaces.': '创建、编辑、删除和列出代码空间。',
    'Manage the lifecycle of Codespaces, including starting and stopping.': '管理代码空间的生命周期，包括启动和停止。',
    'Access Codespaces metadata including the devcontainers and machine type.': '访问包括开发容器和计算机类型在内的代码空间元数据。',
    'Restrict Codespaces user secrets modifications to specific repositories.': '将代码空间用户机密的修改限制在特定存储库。',
    'Commit statuses.': '提交状态。',
    'Repository contents, commits, branches, downloads, releases, and merges.': '存储库内容、提交、分支、下载、发行版和合并。',
    'Read and write repository custom properties values at the repository level, when allowed by the property.':
      '在属性允许时，于存储库级别读写存储库自定义属性值。',
    "View and set values for a repository's custom properties, when allowed by the property.":
      '在属性允许时，查看和设置存储库自定义属性的值。',
    'View and set values for a repository’s custom properties, when allowed by the property.':
      '在属性允许时，查看和设置存储库自定义属性的值。',
    'Retrieve Dependabot alerts.': '检索 Dependabot 警报。',
    'Manage Dependabot repository secrets.': '管理 Dependabot 存储库机密。',
    'Deployments and deployment statuses.': '部署和部署状态。',
    'Discussions and related comments and labels.': '讨论及相关评论和标签。',
    'Manage repository environments.': '管理存储库环境。',
    'Issues and related comments, assignees, labels, and milestones.': '议题及相关评论、受理人、标签和里程碑。',
    "Manage a repository's merge queues": '管理存储库的合并队列',
    'Manage a repository’s merge queues': '管理存储库的合并队列',
    'Search repositories, list collaborators, and access repository metadata.': '搜索存储库、列出协作者并访问存储库元数据。',
    'Packages published to the GitHub Package Platform.': '发布到 GitHub 软件包平台的软件包。',
    'Retrieve Pages statuses, configuration, and builds, as well as create new builds.': '检索页面状态、配置和构建，以及创建新构建。',
    'Manage classic projects within a repository.': '管理存储库中的经典项目。',
    'Pull requests and related comments, assignees, labels, milestones, and merges.': '拉取请求及相关评论、受理人、标签、里程碑和合并。',
    'View and manage repository security advisories.': '查看和管理存储库安全公告。',
    'View and manage secret scanning alert dismissal requests': '查看和管理机密扫描警报消除请求',
    'View and manage secret scanning alerts.': '查看和管理机密扫描警报。',
    'Review and manage repository secret scanning push protection bypass requests.': '审查和管理存储库的机密扫描推送保护绕过请求。',
    'Manage Actions repository secrets.': '管理操作存储库机密。',
    'Manage just a single file.': '仅管理单个文件。',
    'The content paths to single files your app can access.': '你的应用可以访问的单个文件内容路径。',
    'Manage Actions repository variables.': '管理操作存储库变量。',
    'Manage the post-receive hooks for a repository.': '管理存储库的 Web 钩子。',
    'Update GitHub Action workflow files.': '更新 GitHub 操作工作流文件。',
    'Manage agent repository secrets.': '管理智能体存储库机密。',
    'View, create, and manage agent tasks in a repository.': '查看、创建和管理存储库中的智能体任务。',
    'Manage agent repository variables.': '管理智能体存储库变量。',
    'Access and manage code quality data for a repository.': '访问和管理存储库的代码质量数据。',
    'View and manage Copilot cloud agent settings for a repository.': '查看和管理存储库的 Copilot 云端智能体设置。',
    'Manage which GitHub Apps can access a repository': '管理哪些 GitHub 应用可以访问存储库',
    'Retrieve license compliance alerts.': '检索许可证合规警报。',
    'Create repositories.': '创建存储库。',
    'View the repository license policy and check package compliance.': '查看存储库许可证策略并检查软件包合规性。',

    // 帐户权限说明
    'View and manage users blocked by the user.': '查看和管理该用户阻止的用户。',
    'Manage Codespaces user secrets.': '管理代码空间用户机密。',
    'This application will receive your GitHub ID, your GitHub Copilot Chat session messages (not including messages sent to another application), and timestamps of provided GitHub Copilot Chat session messages. This permission must be enabled for Copilot Extensions.':
      '此应用将接收你的 GitHub ID、你的 GitHub Copilot 聊天会话消息（不包括发送给其他应用的消息）以及这些消息的时间戳。Copilot 扩展必须启用此权限。',
    'This application will receive bits of Editor Context (e.g. currently opened file) whenever you send it a message through Copilot Chat.':
      '此应用会在你每次通过 Copilot 聊天向其发送消息时接收部分编辑器上下文（例如当前打开的文件）。',
    'Send Copilot requests.': '发送 Copilot 请求。',
    "Manage a user's email addresses.": '管理用户的电子邮件地址。',
    'Manage a user’s email addresses.': '管理用户的电子邮件地址。',
    "View events triggered by a user's activity.": '查看用户活动触发的事件。',
    'View events triggered by a user’s activity.': '查看用户活动触发的事件。',
    "A user's followers": '用户的关注者',
    'A user’s followers': '用户的关注者',
    "View and manage a user's GPG keys.": '查看和管理用户的 GPG 密钥。',
    'View and manage a user’s GPG keys.': '查看和管理用户的 GPG 密钥。',
    "Create and modify a user's gists and comments.": '创建和修改用户的代码片段及其评论。',
    'Create and modify a user’s gists and comments.': '创建和修改用户的代码片段及其评论。',
    "View and manage a user's Git SSH keys.": '查看和管理用户的 Git SSH 密钥。',
    'View and manage a user’s Git SSH keys.': '查看和管理用户的 Git SSH 密钥。',
    'Interaction limits on repositories': '存储库的交互限制',
    'View knowledge bases for a user.': '查看用户的知识库。',
    'Allows access to GitHub Models.': '允许访问 GitHub 模型。',
    "View a user's plan.": '查看用户的计划。',
    'View a user’s plan.': '查看用户的计划。',
    "View a user's invitations to private repositories": '查看用户收到的专用存储库邀请',
    'View a user’s invitations to private repositories': '查看用户收到的专用存储库邀请',
    "Manage a user's profile settings.": '管理用户的个人资料设置。',
    'Manage a user’s profile settings.': '管理用户的个人资料设置。',
    "View and manage a user's SSH signing keys.": '查看和管理用户的 SSH 签名密钥。',
    'View and manage a user’s SSH signing keys.': '查看和管理用户的 SSH 签名密钥。',
    'List and manage repositories a user is starring.': '列出和管理用户加了星标的存储库。',
    'List and change repositories a user is subscribed to.': '列出和更改用户关注的存储库。',
    'Manage issue fields for a user.': '管理用户的议题字段。',
    'Manage issue types for a user.': '管理用户的议题类型。',
    'Manage plugin gateway connections, their MCP configuration, and MCP invocation through them.':
      '管理插件网关连接、其 MCP 配置以及通过它们进行的 MCP 调用。',

    // 组织权限说明
    'View statistics on how the API is being used for an organization.': '查看组织的 API 使用统计。',
    'Manage access to an organization.': '管理对组织的访问。',
    'View and manage users blocked by the organization.': '查看和管理组织阻止的用户。',
    'Manage campaigns.': '管理活动。',
    'Create, edit, delete and list custom organization roles. View system organization roles.':
      '创建、编辑、删除和列出自定义组织角色。查看系统组织角色。',
    'Read and write repository custom properties values and administer definitions at the organization level.':
      '在组织级别读写存储库自定义属性值并管理属性定义。',
    'View custom properties, write repository values, and administer definitions.': '查看自定义属性、写入存储库值并管理属性定义。',
    'Read and write organization custom properties values at the organization level, when allowed by the property.':
      '在属性允许时，于组织级别读写组织自定义属性值。',
    'Create, edit, delete and list custom repository roles.': '创建、编辑、删除和列出自定义存储库角色。',
    'View events triggered by an activity in an organization.': '查看组织中的活动触发的事件。',
    'Manage Copilot Business seats and settings': '管理 Copilot 商业版席位和设置',
    'View and manage hosted runner custom images available to an organization.': '查看和管理组织可用的托管运行器自定义映像。',
    'Manage issue fields for an organization.': '管理组织的议题字段。',
    'Manage issue types for an organization.': '管理组织的议题类型。',
    'View and manage knowledge bases for an organization.': '查看和管理组织的知识库。',
    'Organization members and teams.': '组织成员和团队。',
    'Manage model access for an organization.': '管理组织的模型访问。',
    'View and manage hosted compute network configurations available to an organization.': '查看和管理组织可用的托管计算网络配置。',
    'View and modify announcement banners for an organization.': '查看和修改组织的公告横幅。',
    'Review and manage secret scanning push protection bypass requests.': '审查和管理机密扫描推送保护绕过请求。',
    'Manage Codespaces for an organization.': '管理组织的代码空间。',
    'Manage Codespaces Secrets for an organization.': '管理组织的代码空间机密。',
    'Manage Codespaces settings for an organization.': '管理组织的代码空间设置。',
    'Manage Dependabot organization secrets.': '管理 Dependabot 组织机密。',
    'Review and manage code scanning alert dismissal requests.': '审查和管理代码扫描警报消除请求。',
    'Manage private registries for an organization.': '管理组织的专用注册表。',
    'Manage personal access token requests from organization members.': '管理组织成员的个人访问令牌请求。',
    'View and revoke personal access tokens that have been granted access to an organization.':
      '查看和撤销已获授权访问组织的个人访问令牌。',
    "View an organization's plan.": '查看组织的计划。',
    'View an organization’s plan.': '查看组织的计划。',
    'Manage projects for an organization.': '管理组织的项目。',
    'Review and manage secret scanning alert dismissal requests': '审查和管理机密扫描警报消除请求',
    'Manage Actions organization secrets.': '管理操作组织机密。',
    'View and manage Actions self-hosted runners available to an organization.': '查看和管理组织可用的操作自托管运行器。',
    'Manage team discussions and related comments.': '管理团队讨论及相关评论。',
    'Manage Actions organization variables.': '管理操作组织变量。',
    'Manage the post-receive hooks for an organization.': '管理组织的 Web 钩子。',
    'Manage agent organization secrets.': '管理智能体组织机密。',
    'Manage agent organization variables.': '管理智能体组织变量。',
    'Allow this GitHub App to make Copilot requests billed to the organization where it is installed. This permission is in public preview and is subject to change.':
      '允许此 GitHub 应用发出由安装它的组织付费的 Copilot 请求。此权限处于公开预览阶段且可能会有变动。',
    'View and manage Copilot Spaces for an organization.': '查看和管理组织的 Copilot 空间。',
    'Manage Copilot cloud agent settings for an organization.': '管理组织的 Copilot 云端智能体设置。',
    'Manage Copilot content exclusion rules for the organization.': '管理组织的 Copilot 内容排除规则。',
    'View and edit external custom properties for repositories, and manage the app installations that provide them, at the organization level.':
      '在组织级别查看和编辑存储库的外部自定义属性，并管理提供这些属性的应用安装。',
    'View organization Copilot metrics.': '查看组织 Copilot 指标。',
    'View and manage an organization IP allow list': '查看和管理组织 IP 允许列表',
    'View and manage organization credentials': '查看和管理组织凭据',
    'Review and manage Dependabot alert dismissal requests.': '审查和管理 Dependabot 警报消除请求。',
    'View and manage innersource vulnerabilities across the organization': '查看和管理整个组织的内源漏洞',
    'Manage verifiable domains for an organization': '管理组织的可验证域',

    // 企业权限说明
    'Enterprise permissions permit access to enterprise account resources.': '企业权限允许访问企业帐户资源。',
    'View enterprise Copilot API usage records.': '查看企业 Copilot API 使用记录。',
    'Manage enterprise custom roles and assignments.': '管理企业自定义角色及其分配。',
    'View repository custom properties and administer definitions at the enterprise level.':
      '在企业级别查看存储库自定义属性并管理属性定义。',
    'Manage enterprise-wide AI controls configuration': '管理企业范围的 AI 控制配置',
    'View enterprise Copilot metrics.': '查看企业 Copilot 指标。',
    'View and manage an enterprise IP allow list': '查看和管理企业 IP 允许列表',
    'Allows GitHub Apps to manage enterprise policies governing repository and organization actions like creation, permissions, deploy keys, etc.':
      '允许 GitHub 应用管理约束创建、权限、部署密钥等存储库和组织操作的企业策略。',
    'View and manage rules for enterprise repositories': '查看和管理企业存储库的规则',
    'View and manage enterprise SCIM configuration in an Enterprise Managed User enterprise.': '查看和管理企业托管用户企业中的 SCIM 配置。',
    'Manage enterprise access restrictions': '管理企业访问限制',
    'Access usage, budgets, cost centers, and payment information for the enterprise': '访问企业的使用情况、预算、成本中心和付款信息',
    'View delegated bypass requests for enterprise rulesets': '查看企业规则集的委托绕过请求',
    'View and manage enterprise credentials': '查看和管理企业凭据',
    'Create, edit, delete and list custom organization roles at the enterprise level. View system organization roles.':
      '在企业级别创建、编辑、删除和列出自定义组织角色。查看系统组织角色。',
    'View organization custom properties and administer definitions at the enterprise level.':
      '在企业级别查看组织自定义属性并管理属性定义。',
    'View and manage innersource vulnerabilities across the enterprise': '查看和管理整个企业的内源漏洞',
    'View and manage the enterprise license policy': '查看和管理企业许可证策略',
    'View Copilot subscription information and manage enterprise Copilot licenses': '查看 Copilot 订阅信息并管理企业 Copilot 许可证',
    'Manage repository access of GitHub Apps on Enterprise-owned organizations. Requesting this permission will prevent it from being installed on other enterprises.':
      '管理企业所属组织中 GitHub 应用的存储库访问权限。请求此权限将使该应用无法安装到其他企业。',
    'Manage installation of GitHub Apps on Enterprise-owned organizations. Requesting this permission will prevent it from being installed on other enterprises.':
      '管理 GitHub 应用在企业所属组织中的安装。请求此权限将使该应用无法安装到其他企业。',
    'Create and remove enterprise organizations': '创建和删除企业组织',
    'Manage user access to the enterprise': '管理用户对企业的访问',
    'View and manage security products for the enterprise': '查看和管理企业的安全产品',
    'View and manage general enterprise settings': '查看和管理企业常规设置',
    'View and manage enterprise single sign-on configuration': '查看和管理企业单一登录配置',
    'Create, edit, remove and view enterprise teams': '创建、编辑、删除和查看企业团队',
    'View and manage enterprise two-factor authentication configuration': '查看和管理企业双因素身份验证配置',
    'Manage verifiable domains for an enterprise': '管理企业的可验证域',

    // 权限选择器
    'Choose the minimal permissions necessary for your needs.': '选择满足需求的最小权限。',
    'Learn more about permissions.': '了解权限。',
    // 「User permissions are granted … as part of the <a>User authorization flow</a>.」
    'User permissions are granted on an individual user basis as part of the': '按单个用户授予的用户权限属于',
    'User authorization flow.': '用户授权流程。',
    'User authorization flow': '用户授权流程',
    'permissions documentation': '权限文档',
    'for information about specific permissions.': '以了解各项权限的详情。',
    'Changes to permissions will be applied to all future installations. Current users will be prompted to accept any changes and enable the new permissions on their installation.':
      '权限更改将应用于今后的所有安装。系统会提示现有用户接受更改并在其安装中启用新权限。',
    'No account permissions added yet': '尚未添加帐户权限',
    'User permissions permit access to resources under your personal GitHub account.': '用户权限允许访问你个人 GitHub 帐户下的资源。',
    'No repository permissions added yet': '尚未添加存储库权限',
    'Repository permissions permit access to repositories and related resources.': '存储库权限允许访问存储库和相关资源。',
    'No organization permissions added yet': '尚未添加组织权限',
    'Organization permissions permit access to organization related resources.': '组织权限允许访问组织相关资源。',
    'No enterprise permissions added yet': '尚未添加企业权限',
    'Enterprise permissions permit access to business related features and data.': '企业权限允许访问企业相关功能和数据。',
    'Read access required to use other repository permissions.': '使用其他存储库权限需要读取访问权限。',
    'Read access required to use other repository permissions': '使用其他存储库权限需要读取访问权限',
    'Add permissions': '添加权限',
    'Select account permissions': '选择帐户权限',
    'Select repository permissions': '选择存储库权限',
    'Select organization permissions': '选择组织权限',
    'Select business permissions': '选择企业权限',
    'Select enterprise permissions': '选择企业权限',
    'Select an access level': '选择访问级别',
    'Repository permissions': '存储库权限',
    'Account permissions': '帐户权限',
    'Enterprise permissions': '企业权限',
    'These permissions are granted on an individual user basis as part of the User authorization flow.':
      '这些权限作为用户授权流程的一部分按单个用户授予。',

    // Web 钩子事件订阅（GitHub 应用）
    'Subscribe to events': '订阅事件',
    'Based on the permissions you’ve selected, what events would you like to subscribe to?': '根据你选择的权限，你想订阅哪些事件？',
    "Based on the permissions you've selected, what events would you like to subscribe to?": '根据你选择的权限，你想订阅哪些事件？'
  },
  scoped: {
    ...TITLE_ENTRIES,
    ...EVENT_ENTRIES,
    // 访问级别（Read-only、Admin 等与全站相同的词由 common-ui 收录）
    'No access': '无权限',
    'Read and write': '读写',
    'Read and Write': '读写',
    Read: '读取',
    write: '写入',
    'access to': '访问',
    'Access:': '访问权限：',
    Required: '必需',
    mandatory: '必选',
    Mandatory: '必选',
    'Label: selected': '标签：已选择',
    'Label: mandatory': '标签：必选',
    'Label: disabled': '标签：已禁用',
    'This is a mandatory permission and cannot be changed': '必选权限不可更改',
    "Can't be used for Agentic Apps": '不能用于智能体应用',
    'Can’t be used for Agentic Apps': '不能用于智能体应用',
    // 权限列表为空时的无障碍标题
    'Permission Blank Slate': '权限空状态',
    // 「These <a>user permissions</a> are granted on an individual user basis as part of the <a>user authorization flow</a>.」
    These: '这些',
    'user permissions': '用户权限',
    'are granted on an individual user basis as part of the': '按单个用户授予并属于',
    'user authorization flow': '用户授权流程',
    // 单个文件权限的路径
    Path: '路径',
    'Add path': '添加路径',
    'One or more paths were too long (maximum is 255 characters)': '一个或多个路径过长（最多 255 个字符）',
    'One or more paths contain invalid characters': '一个或多个路径包含无效字符',
    'Read our': '请阅读',

    // Web 钩子事件说明（事件名见 EVENT_TITLES）；与存储库 Web 钩子相同的说明由 repo-settings 收录
    'Change privileges to be able to select events': '更改权限后才能选择事件',
    'A GitHub App installation target is renamed.': 'GitHub 应用安装目标被重命名。',
    'When this App is deleted and the associated hook is removed.': '此应用被删除且关联的 Web 钩子被移除时。',
    'Security advisory published, updated, or withdrawn.': '安全公告被发布、更新或撤回。',
    'Custom property is created, updated, deleted, or promoted.': '自定义属性被创建、更新、删除或提升。',
    'Custom property values are changed for an organization': '组织的自定义属性值被更改',
    'Deployment protection rule requested for an environment.': '为环境请求了部署保护规则。',
    'Deployment review requested, approved or rejected': '部署审查被请求、批准或拒绝',
    'License compliance alert closure request was created, cancelled, or received a response (approved or rejected).':
      '许可证合规警报关闭请求被创建、取消或收到回复（批准或拒绝）。',
    'Push ruleset bypass request was created, cancelled, completed, received a response, or a response was dismissed. Note: Delegated bypass for push rules is currently in beta and subject to change.':
      '推送规则集绕过请求被创建、取消、完成、收到回复，或回复被消除。注意：推送规则的委托绕过目前为测试版且可能会有变动。',
    'Issue opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, milestoned, demilestoned, locked, unlocked, typed, or untyped.':
      '议题被打开、编辑、删除、转移、置顶、取消置顶、关闭、重新打开、分配、取消分配、添加标签、移除标签、设置里程碑、移除里程碑、锁定、解锁、设置类型或移除类型。',
    'Merge Queue entry added': '添加了合并队列条目',
    'Personal access token request created, approved, denied, or cancelled.': '个人访问令牌请求被创建、批准、拒绝或取消。',
    'Project item created, edited, deleted, archived, restored, converted, or reordered.':
      '项目中的项被创建、编辑、删除、存档、恢复、转换或重新排序。',
    'Project created, updated, deleted, closed, or reopened.': '项目被创建、更新、删除、关闭或重新打开。',
    'Project status updates created, updated, or deleted.': '项目状态更新被创建、更新或删除。',
    'When a message is dispatched from a repository.': '存储库发出调度消息时。',
    'A manual workflow run is requested.': '请求手动运行工作流。'
  },
  regexp: [
    // 权限行：访问级别按钮、删除按钮
    [/^Access: (No access|Read-only|Read and write|Admin)$/, (_, level: string) => `访问权限：${ACCESS_LEVEL[level] ?? level}`],
    [new RegExp(`^Remove (${PERMISSION_TITLE_SOURCE})$`), (_, title: string) => joinCjk('删除', PERMISSION_TITLES[title] ?? title)],
    // 已安装应用、令牌详情：权限摘要。整句未拆开时“Read access to metadata”；
    // 访问级别加粗时拆成“Read”“and”“write”“access to metadata”几段
    [
      new RegExp(`^(Read and [Ww]rite|Read|Admin) access to (${RESOURCE_LIST_SOURCE})$`),
      (_, level: string, list: string) => joinCjk(ACCESS_VERB[level.replace('Write', 'write')] ?? level, translatePermissionList(list))
    ],
    [new RegExp(`^access to (${RESOURCE_LIST_SOURCE})$`), (_, list: string) => translatePermissionList(list)],
    // 权限选择器分区标题旁计数的无障碍标签
    [
      /^(Label: )?(repository|organization|user|business) (mandatory )?permission count$/,
      (_, label: string, section: string, mandatory: string) =>
        `${label ? '标签：' : ''}${PERMISSION_SECTION[section] ?? section}${mandatory ? '必选' : ''}权限数`
    ],
    // 可订阅事件旁的帮助链接
    [
      new RegExp(`^Learn more about the (${EVENT_TITLE_SOURCE}) event$`),
      (_, title: string) => joinCjk(joinCjk('了解', EVENT_TITLES[title] ?? title), '事件')
    ]
  ]
} satisfies PageDictionary
