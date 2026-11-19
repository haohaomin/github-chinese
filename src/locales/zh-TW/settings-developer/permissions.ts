import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 精细个人访问令牌、GitHub 应用的权限名称（标题）。
 * 键为界面上的英文标题，值为译文（产品名按用户要求译成中文：Actions → 動作、Codespaces → 程式碼空間、
 * Copilot Chat → Copilot 聊天、Pages → 頁面）；供 scoped 词条和“Remove X”等正则共用。
 */
export const PERMISSION_TITLES: Readonly<Record<string, string>> = {
  // 存储库权限
  Actions: '動作',
  Administration: '管理',
  'Agent secrets': '代理機密',
  'Agent tasks': '代理任務',
  'Agent variables': '代理變數',
  'Artifact metadata': '成品中繼資料',
  Attestations: '證明',
  Checks: '檢查',
  'Code quality': '程式碼品質',
  'Code scanning alerts': '程式碼掃描警示',
  Codespaces: '程式碼空間',
  'Codespaces lifecycle admin': '程式碼空間生命週期管理',
  'Codespaces metadata': '程式碼空間中繼資料',
  'Codespaces secrets': '程式碼空間機密',
  'Commit statuses': '提交狀態',
  Contents: '內容',
  'Copilot agent settings': 'Copilot 代理設定',
  'Custom properties': '自訂屬性',
  'Dependabot alerts': 'Dependabot 警示',
  'Dependabot secrets': 'Dependabot 機密',
  Deployments: '部署',
  Discussions: '討論',
  Environments: '環境',
  'GitHub App installation repository access': 'GitHub 應用程式安裝的儲存庫存取權',
  Issues: '議題',
  'License compliance alerts': '授權條款合規性警示',
  'Merge queues': '合併佇列',
  Metadata: '中繼資料',
  Packages: '套件',
  Pages: '頁面',
  Projects: '專案',
  'Pull requests': '拉取請求',
  'Repository creation': '儲存庫建立',
  'Repository license policy': '儲存庫授權條款政策',
  'Repository security advisories': '儲存庫安全性公告',
  'Secret scanning alert dismissal requests': '機密掃描警示解除請求',
  'Secret scanning alerts': '機密掃描警示',
  'Secret scanning push protection bypass requests': '機密掃描推送保護繞過請求',
  Secrets: '機密',
  'Single file': '單一檔案',
  Variables: '變數',
  Webhooks: 'Web 鉤子',
  Workflows: '工作流程',
  // 帐户权限
  'Block another user': '封鎖其他使用者',
  'Codespaces user secrets': '程式碼空間使用者機密',
  'Copilot Chat': 'Copilot 聊天',
  'Copilot Editor Context': 'Copilot 編輯器上下文',
  'Copilot Requests': 'Copilot 請求',
  'Email addresses': '電子郵件地址',
  Events: '事件',
  Followers: '追蹤者',
  'GPG keys': 'GPG 金鑰',
  Gists: '程式碼片段',
  'Git SSH keys': 'Git SSH 金鑰',
  'Interaction limits': '互動限制',
  'Knowledge bases': '知識庫',
  Models: '模型',
  Plan: '方案',
  'Plugin gateway connections': '外掛程式閘道連線',
  'Private repository invitations': '私人儲存庫邀請',
  Profile: '個人檔案',
  'SSH signing keys': 'SSH 簽署金鑰',
  Starring: '加星號',
  Watching: '關注',
  // 组织权限
  'API Insights': 'API 洞察',
  'Blocking users': '封鎖使用者',
  Campaigns: '活動',
  'Copilot Spaces': 'Copilot 空間',
  'Copilot content exclusion': 'Copilot 內容排除',
  'Custom organization roles': '自訂組織角色',
  'Custom properties for organizations': '組織自訂屬性',
  'Custom repository roles': '自訂儲存庫角色',
  'External custom properties for repositories': '儲存庫的外部自訂屬性',
  'GitHub Copilot Business': 'GitHub Copilot 商務版',
  'Hosted runner custom images': '代管執行器自訂映像檔',
  'Issue Fields': '議題欄位',
  'Issue Types': '議題類型',
  Members: '成員',
  'Network configurations': '網路設定',
  'Organization announcement banners': '組織公告橫幅',
  'Organization bypass requests for secret scanning': '組織機密掃描繞過請求',
  'Organization codespaces': '組織程式碼空間',
  'Organization codespaces secrets': '組織程式碼空間機密',
  'Organization codespaces settings': '組織程式碼空間設定',
  'Organization Copilot metrics': '組織 Copilot 指標',
  'Organization credentials': '組織認證資訊',
  'Organization dependabot secrets': '組織 Dependabot 機密',
  'Organization dismissal requests for code scanning': '組織程式碼掃描解除請求',
  'Organization dismissal requests for Dependabot': '組織 Dependabot 解除請求',
  'Organization innersource vulnerabilities': '組織內部開源漏洞',
  'Organization IP allow list': '組織 IP 允許清單',
  'Organization private registries': '組織私人登錄庫',
  'Organization verifiable domains': '組織可驗證網域',
  'Personal access token requests': '個人存取權杖請求',
  'Personal access tokens': '個人存取權杖',
  'Self-hosted runners': '自架執行器',
  'Team discussions': '團隊討論',
  // 企业权限
  'Copilot usage records': 'Copilot 使用量記錄',
  'Custom enterprise roles': '自訂企業角色',
  'Enterprise access restrictions': '企業存取限制',
  'Enterprise AI controls': '企業 AI 控制項',
  'Enterprise billing': '企業帳務',
  'Enterprise bypass requests': '企業繞過請求',
  'Enterprise Copilot metrics': '企業 Copilot 指標',
  'Enterprise Copilot license management': '企業 Copilot 授權管理',
  'Enterprise credentials': '企業認證資訊',
  'Enterprise custom organization roles': '企業自訂組織角色',
  'Enterprise custom properties for organizations': '企業的組織自訂屬性',
  'Enterprise innersource vulnerabilities': '企業內部開源漏洞',
  'Enterprise IP allow list': '企業 IP 允許清單',
  'Enterprise license policy': '企業授權條款政策',
  'Enterprise Organization and Repository Policies': '企業組織和儲存庫政策',
  'Enterprise organization installation repositories': '企業組織安裝的儲存庫',
  'Enterprise organization installations': '企業組織安裝',
  'Enterprise organizations': '企業組織',
  'Enterprise people': '企業人員',
  'Enterprise Ruleset': '企業規則集',
  'Enterprise SCIM': '企業 SCIM',
  'Enterprise security products': '企業安全性產品',
  'Enterprise settings': '企業設定',
  'Enterprise single sign-on': '企業單一登入',
  'Enterprise teams': '企業團隊',
  'Enterprise two-factor authentication': '企業雙重驗證',
  'Enterprise verifiable domains': '企業可驗證網域'
}

/** 已安装应用页“Read access to …”列表中的小写资源名 */
const RESOURCE_NAMES: Readonly<Record<string, string>> = {
  actions: '動作',
  administration: '管理',
  'artifact metadata': '成品中繼資料',
  attestations: '證明',
  checks: '檢查',
  code: '程式碼',
  'code scanning alerts': '程式碼掃描警示',
  codespaces: '程式碼空間',
  'codespaces lifecycle admin': '程式碼空間生命週期管理',
  'codespaces metadata': '程式碼空間中繼資料',
  'codespaces secrets': '程式碼空間機密',
  'commit statuses': '提交狀態',
  contents: '內容',
  'custom properties': '自訂屬性',
  'dependabot alerts': 'Dependabot 警示',
  'dependabot secrets': 'Dependabot 機密',
  deployments: '部署',
  discussions: '討論',
  environments: '環境',
  issues: '議題',
  'merge queues': '合併佇列',
  metadata: '中繼資料',
  packages: '套件',
  pages: '頁面',
  projects: '專案',
  'pull requests': '拉取請求',
  'repository hooks': '儲存庫 Web 鉤子',
  'repository projects': '儲存庫專案',
  'repository advisories': '儲存庫公告',
  'repository security advisories': '儲存庫安全性公告',
  'secret scanning alerts': '機密掃描警示',
  secrets: '機密',
  'security events': '安全性事件',
  'single file': '單一檔案',
  statuses: '狀態',
  variables: '變數',
  'vulnerability alerts': '漏洞警示',
  webhooks: 'Web 鉤子',
  workflows: '工作流程',
  members: '成員',
  'organization administration': '組織管理',
  'organization hooks': '組織 Web 鉤子',
  'organization plan': '組織方案',
  'organization projects': '組織專案',
  'organization secrets': '組織機密',
  'organization self hosted runners': '組織自架執行器',
  'organization user blocking': '組織使用者封鎖',
  'team discussions': '團隊討論',
  'email addresses': '電子郵件地址',
  followers: '追蹤者',
  gists: '程式碼片段',
  'git ssh keys': 'Git SSH 金鑰',
  'gpg keys': 'GPG 金鑰',
  'interaction limits': '互動限制',
  keys: '金鑰',
  plan: '方案',
  profile: '個人檔案',
  starring: '加星號',
  watching: '關注',
  models: '模型',
  'knowledge bases': '知識庫',
  'copilot chat': 'Copilot 聊天',
  'copilot editor context': 'Copilot 編輯器上下文'
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

/** “code, issues, and pull requests” → 程式碼、議題和拉取請求（未知资源名保留英文） */
export function translatePermissionList(list: string): string {
  const items = list.split(LIST_SEPARATOR_RE).map(item => RESOURCE_NAMES[item] ?? item)
  if (items.length === 1) return items[0]!
  const head = items.slice(0, -1).reduce((acc, item) => joinCjk(joinCjk(acc, '、'), item))
  return joinCjk(joinCjk(head, '和'), items[items.length - 1]!)
}

const ACCESS_VERB: Readonly<Record<string, string>> = {
  'Read and write': '讀寫',
  Read: '讀取',
  Admin: '管理'
}

export const ACCESS_LEVEL: Readonly<Record<string, string>> = {
  'No access': '無存取權',
  'Read-only': '唯讀',
  'Read and write': '讀寫',
  Admin: '管理員'
}

/** 权限标题的正则片段 */
export const PERMISSION_TITLE_SOURCE = alternation(Object.keys(PERMISSION_TITLES))

/**
 * 已由其他文件收录且译文相同的标题，不再放进 scoped：
 * keys.ts 的 static；settings-account 的菜单项（Pages、Codespaces）、通知设置（Actions）与计划页；
 * 全站 static（common 导航与对话框、存储库设置、组织设置等）。
 * 例外：Watching 由通知设置收录为“關注中”（同在 settings 页面类型），权限名拼接仍用“關注”
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
  'Branch protection configuration': '分支保護設定',
  'Branch protection rule': '分支保護規則',
  'Check run': '檢查執行',
  'Check suite': '檢查套件',
  'Code scanning alert': '程式碼掃描警示',
  'Commit comment': '提交留言',
  Create: '建立',
  'Custom property': '自訂屬性',
  'Custom property values': '自訂屬性值',
  Delete: '刪除',
  'Dependabot alert': 'Dependabot 警示',
  'Deploy key': '部署金鑰',
  Deployment: '部署',
  'Deployment protection rule': '部署保護規則',
  'Deployment review': '部署審查',
  'Deployment status': '部署狀態',
  Discussion: '討論',
  'Discussion comment': '討論留言',
  'Dismissal request code scanning': '程式碼掃描解除請求',
  'Dismissal request dependabot': 'Dependabot 解除請求',
  'Dismissal request license compliance': '授權條款合規性解除請求',
  'Dismissal request secret scanning': '機密掃描解除請求',
  'Exemption request push ruleset': '推送規則集豁免請求',
  'Exemption request secret scanning': '機密掃描豁免請求',
  Fork: '分叉',
  Gollum: 'Gollum',
  'Installation target': '安裝目標',
  'Issue comment': '議題留言',
  'Issue dependencies': '議題相依關係',
  'Issue relates to': '議題關聯',
  Issues: '議題',
  Label: '標籤',
  Member: '成員',
  Membership: '成員身分',
  'Merge group': '合併群組',
  'Merge queue entry': '合併佇列項目',
  Meta: 'Web 鉤子本身',
  Milestone: '里程碑',
  'Org block': '組織封鎖',
  Organization: '組織',
  'Organization custom property values': '組織自訂屬性值',
  'Page build': '頁面建置',
  'Personal access token request': '個人存取權杖請求',
  Project: '專案',
  'Project card': '專案卡片',
  'Project column': '專案欄',
  'Projects v2': '專案 v2',
  'Projects v2 item': '專案 v2 項目',
  'Projects v2 status update': '專案 v2 狀態更新',
  Public: '公開',
  'Pull request': '拉取請求',
  'Pull request review': '拉取請求審查',
  'Pull request review comment': '拉取請求審查留言',
  'Pull request review thread': '拉取請求審查討論串',
  Push: '推送',
  'Registry package': '登錄庫套件',
  Release: '發行版本',
  Repository: '儲存庫',
  'Repository advisory': '儲存庫公告',
  'Repository dispatch': '儲存庫分派',
  'Repository import': '儲存庫匯入',
  'Repository ruleset': '儲存庫規則集',
  'Secret scanning alert': '機密掃描警示',
  'Secret scanning alert location': '機密掃描警示位置',
  'Secret scanning scan': '機密掃描作業',
  'Security advisory': '安全性公告',
  'Security and analysis': '安全性和分析',
  Star: '加星號',
  Status: '狀態',
  'Sub issues': '子議題',
  Team: '團隊',
  'Team add': '團隊加入',
  Watch: '關注',
  'Workflow dispatch': '工作流程分派',
  'Workflow job': '工作流程作業',
  'Workflow run': '工作流程執行'
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
  repository: '儲存庫',
  organization: '組織',
  user: '帳號',
  business: '企業'
}

/**
 * 权限：精细个人访问令牌与 GitHub 应用的权限标题、说明，权限选择器（React），
 * 已安装应用的权限摘要（“Read access to …”），GitHub App 可订阅的 Web 钩子事件。
 * 权限标题与事件名都是短词，放 scoped；说明句放 static。
 * 术语：retrieve → 擷取，level → 層級，access（名词）→ 存取權，seat → 席次，license policy → 授權條款政策，
 * innersource → 內部開源，credential → 認證資訊，context（Copilot）→ 上下文，Agentic → 代理式。
 * 事件说明按状态写作「X 已建立、編輯或刪除。」（同 repo-settings/webhooks.ts）。
 */
export default {
  static: {
    // 存储库权限说明
    'Workflows, workflow runs and artifacts.': '工作流程、工作流程執行和成品。',
    'Repository creation, deletion, settings, teams, and collaborators.': '儲存庫的建立、刪除、設定、團隊和協作者。',
    'Create and retrieve artifact metadata for a repository.': '建立並擷取儲存庫的成品中繼資料。',
    'Create and retrieve attestations for a repository.': '建立並擷取儲存庫的證明。',
    'Checks on code.': '程式碼檢查。',
    'View and manage code scanning alerts.': '查看並管理程式碼掃描警示。',
    'Create, edit, delete and list Codespaces.': '建立、編輯、刪除並列出程式碼空間。',
    'Manage the lifecycle of Codespaces, including starting and stopping.': '管理程式碼空間的生命週期，包括啟動和停止。',
    'Access Codespaces metadata including the devcontainers and machine type.': '存取程式碼空間中繼資料，包括開發容器和機器類型。',
    'Restrict Codespaces user secrets modifications to specific repositories.': '將程式碼空間使用者機密的修改限制在特定儲存庫。',
    'Commit statuses.': '提交狀態。',
    'Repository contents, commits, branches, downloads, releases, and merges.': '儲存庫內容、提交、分支、下載、發行版本和合併。',
    'Read and write repository custom properties values at the repository level, when allowed by the property.':
      '在屬性允許時，於儲存庫層級讀寫儲存庫自訂屬性值。',
    "View and set values for a repository's custom properties, when allowed by the property.":
      '在屬性允許時，查看並設定儲存庫自訂屬性的值。',
    'View and set values for a repository’s custom properties, when allowed by the property.':
      '在屬性允許時，查看並設定儲存庫自訂屬性的值。',
    'Retrieve Dependabot alerts.': '擷取 Dependabot 警示。',
    'Manage Dependabot repository secrets.': '管理儲存庫的 Dependabot 機密。',
    'Deployments and deployment statuses.': '部署和部署狀態。',
    'Discussions and related comments and labels.': '討論，以及相關的留言和標籤。',
    'Manage repository environments.': '管理儲存庫環境。',
    'Issues and related comments, assignees, labels, and milestones.': '議題，以及相關的留言、負責人、標籤和里程碑。',
    "Manage a repository's merge queues": '管理儲存庫的合併佇列',
    'Manage a repository’s merge queues': '管理儲存庫的合併佇列',
    'Search repositories, list collaborators, and access repository metadata.': '搜尋儲存庫、列出協作者並存取儲存庫中繼資料。',
    'Packages published to the GitHub Package Platform.': '發布到 GitHub 套件平台的套件。',
    'Retrieve Pages statuses, configuration, and builds, as well as create new builds.': '擷取頁面狀態、設定和建置，以及建立新的建置。',
    'Manage classic projects within a repository.': '管理儲存庫中的傳統專案。',
    'Pull requests and related comments, assignees, labels, milestones, and merges.':
      '拉取請求，以及相關的留言、負責人、標籤、里程碑和合併。',
    'View and manage repository security advisories.': '查看並管理儲存庫安全性公告。',
    'View and manage secret scanning alert dismissal requests': '查看並管理機密掃描警示解除請求',
    'View and manage secret scanning alerts.': '查看並管理機密掃描警示。',
    'Review and manage repository secret scanning push protection bypass requests.': '審查並管理儲存庫的機密掃描推送保護繞過請求。',
    'Manage Actions repository secrets.': '管理儲存庫的動作機密。',
    'Manage just a single file.': '僅管理單一檔案。',
    'The content paths to single files your app can access.': '你的應用程式可以存取的單一檔案內容路徑。',
    'Manage Actions repository variables.': '管理儲存庫的動作變數。',
    'Manage the post-receive hooks for a repository.': '管理儲存庫的 Web 鉤子。',
    'Update GitHub Action workflow files.': '更新 GitHub 動作工作流程檔案。',
    'Manage agent repository secrets.': '管理儲存庫的代理機密。',
    'View, create, and manage agent tasks in a repository.': '查看、建立並管理儲存庫中的代理任務。',
    'Manage agent repository variables.': '管理儲存庫的代理變數。',
    'Access and manage code quality data for a repository.': '存取並管理儲存庫的程式碼品質資料。',
    'View and manage Copilot cloud agent settings for a repository.': '查看並管理儲存庫的 Copilot 雲端代理設定。',
    'Manage which GitHub Apps can access a repository': '管理哪些 GitHub 應用程式可以存取儲存庫',
    'Retrieve license compliance alerts.': '擷取授權條款合規性警示。',
    'Create repositories.': '建立儲存庫。',
    'View the repository license policy and check package compliance.': '查看儲存庫授權條款政策並檢查套件合規性。',

    // 帐户权限说明
    'View and manage users blocked by the user.': '查看並管理該使用者封鎖的使用者。',
    'Manage Codespaces user secrets.': '管理程式碼空間使用者機密。',
    'This application will receive your GitHub ID, your GitHub Copilot Chat session messages (not including messages sent to another application), and timestamps of provided GitHub Copilot Chat session messages. This permission must be enabled for Copilot Extensions.':
      '此應用程式將接收你的 GitHub ID、你的 GitHub Copilot 聊天工作階段訊息（不包括傳送給其他應用程式的訊息），以及這些訊息的時間戳記。Copilot 擴充功能必須啟用此權限。',
    'This application will receive bits of Editor Context (e.g. currently opened file) whenever you send it a message through Copilot Chat.':
      '每當你透過 Copilot 聊天傳送訊息給此應用程式，它都會接收部分編輯器上下文（例如目前開啟的檔案）。',
    'Send Copilot requests.': '傳送 Copilot 請求。',
    "Manage a user's email addresses.": '管理使用者的電子郵件地址。',
    'Manage a user’s email addresses.': '管理使用者的電子郵件地址。',
    "View events triggered by a user's activity.": '查看使用者活動觸發的事件。',
    'View events triggered by a user’s activity.': '查看使用者活動觸發的事件。',
    "A user's followers": '使用者的追蹤者',
    'A user’s followers': '使用者的追蹤者',
    "View and manage a user's GPG keys.": '查看並管理使用者的 GPG 金鑰。',
    'View and manage a user’s GPG keys.': '查看並管理使用者的 GPG 金鑰。',
    "Create and modify a user's gists and comments.": '建立並修改使用者的程式碼片段和留言。',
    'Create and modify a user’s gists and comments.': '建立並修改使用者的程式碼片段和留言。',
    "View and manage a user's Git SSH keys.": '查看並管理使用者的 Git SSH 金鑰。',
    'View and manage a user’s Git SSH keys.': '查看並管理使用者的 Git SSH 金鑰。',
    'Interaction limits on repositories': '儲存庫的互動限制',
    'View knowledge bases for a user.': '查看使用者的知識庫。',
    'Allows access to GitHub Models.': '允許存取 GitHub 模型。',
    "View a user's plan.": '查看使用者的方案。',
    'View a user’s plan.': '查看使用者的方案。',
    "View a user's invitations to private repositories": '查看使用者收到的私人儲存庫邀請',
    'View a user’s invitations to private repositories': '查看使用者收到的私人儲存庫邀請',
    "Manage a user's profile settings.": '管理使用者的個人檔案設定。',
    'Manage a user’s profile settings.': '管理使用者的個人檔案設定。',
    "View and manage a user's SSH signing keys.": '查看並管理使用者的 SSH 簽署金鑰。',
    'View and manage a user’s SSH signing keys.': '查看並管理使用者的 SSH 簽署金鑰。',
    'List and manage repositories a user is starring.': '列出並管理使用者已加星號的儲存庫。',
    'List and change repositories a user is subscribed to.': '列出並變更使用者關注的儲存庫。',
    'Manage issue fields for a user.': '管理使用者的議題欄位。',
    'Manage issue types for a user.': '管理使用者的議題類型。',
    'Manage plugin gateway connections, their MCP configuration, and MCP invocation through them.':
      '管理外掛程式閘道連線、其 MCP 設定，以及透過這些連線的 MCP 呼叫。',

    // 组织权限说明
    'View statistics on how the API is being used for an organization.': '查看組織的 API 使用統計資料。',
    'Manage access to an organization.': '管理組織的存取權。',
    'View and manage users blocked by the organization.': '查看並管理組織封鎖的使用者。',
    'Manage campaigns.': '管理活動。',
    'Create, edit, delete and list custom organization roles. View system organization roles.':
      '建立、編輯、刪除並列出自訂組織角色。查看系統組織角色。',
    'Read and write repository custom properties values and administer definitions at the organization level.':
      '在組織層級讀寫儲存庫自訂屬性值並管理屬性定義。',
    'View custom properties, write repository values, and administer definitions.': '查看自訂屬性、寫入儲存庫值並管理屬性定義。',
    'Read and write organization custom properties values at the organization level, when allowed by the property.':
      '在屬性允許時，於組織層級讀寫組織自訂屬性值。',
    'Create, edit, delete and list custom repository roles.': '建立、編輯、刪除並列出自訂儲存庫角色。',
    'View events triggered by an activity in an organization.': '查看組織中的活動觸發的事件。',
    'Manage Copilot Business seats and settings': '管理 Copilot 商務版席次和設定',
    'View and manage hosted runner custom images available to an organization.': '查看並管理組織可用的代管執行器自訂映像檔。',
    'Manage issue fields for an organization.': '管理組織的議題欄位。',
    'Manage issue types for an organization.': '管理組織的議題類型。',
    'View and manage knowledge bases for an organization.': '查看並管理組織的知識庫。',
    'Organization members and teams.': '組織成員和團隊。',
    'Manage model access for an organization.': '管理組織的模型存取權。',
    'View and manage hosted compute network configurations available to an organization.': '查看並管理組織可用的代管運算網路設定。',
    'View and modify announcement banners for an organization.': '查看並修改組織的公告橫幅。',
    'Review and manage secret scanning push protection bypass requests.': '審查並管理機密掃描推送保護繞過請求。',
    'Manage Codespaces for an organization.': '管理組織的程式碼空間。',
    'Manage Codespaces Secrets for an organization.': '管理組織的程式碼空間機密。',
    'Manage Codespaces settings for an organization.': '管理組織的程式碼空間設定。',
    'Manage Dependabot organization secrets.': '管理組織的 Dependabot 機密。',
    'Review and manage code scanning alert dismissal requests.': '審查並管理程式碼掃描警示解除請求。',
    'Manage private registries for an organization.': '管理組織的私人登錄庫。',
    'Manage personal access token requests from organization members.': '管理組織成員的個人存取權杖請求。',
    'View and revoke personal access tokens that have been granted access to an organization.': '查看並撤銷已獲准存取組織的個人存取權杖。',
    "View an organization's plan.": '查看組織的方案。',
    'View an organization’s plan.': '查看組織的方案。',
    'Manage projects for an organization.': '管理組織的專案。',
    'Review and manage secret scanning alert dismissal requests': '審查並管理機密掃描警示解除請求',
    'Manage Actions organization secrets.': '管理組織的動作機密。',
    'View and manage Actions self-hosted runners available to an organization.': '查看並管理組織可用的動作自架執行器。',
    'Manage team discussions and related comments.': '管理團隊討論和相關留言。',
    'Manage Actions organization variables.': '管理組織的動作變數。',
    'Manage the post-receive hooks for an organization.': '管理組織的 Web 鉤子。',
    'Manage agent organization secrets.': '管理組織的代理機密。',
    'Manage agent organization variables.': '管理組織的代理變數。',
    'Allow this GitHub App to make Copilot requests billed to the organization where it is installed. This permission is in public preview and is subject to change.':
      '允許此 GitHub 應用程式發出由安裝所在組織付費的 Copilot 請求。此權限目前為公開預覽，可能會變更。',
    'View and manage Copilot Spaces for an organization.': '查看並管理組織的 Copilot 空間。',
    'Manage Copilot cloud agent settings for an organization.': '管理組織的 Copilot 雲端代理設定。',
    'Manage Copilot content exclusion rules for the organization.': '管理組織的 Copilot 內容排除規則。',
    'View and edit external custom properties for repositories, and manage the app installations that provide them, at the organization level.':
      '在組織層級查看、編輯儲存庫的外部自訂屬性，並管理提供這些屬性的應用程式安裝。',
    'View organization Copilot metrics.': '查看組織 Copilot 指標。',
    'View and manage an organization IP allow list': '查看並管理組織 IP 允許清單',
    'View and manage organization credentials': '查看並管理組織認證資訊',
    'Review and manage Dependabot alert dismissal requests.': '審查並管理 Dependabot 警示解除請求。',
    'View and manage innersource vulnerabilities across the organization': '查看並管理整個組織的內部開源漏洞',
    'Manage verifiable domains for an organization': '管理組織的可驗證網域',

    // 企业权限说明
    'Enterprise permissions permit access to enterprise account resources.': '企業權限允許存取企業帳號資源。',
    'View enterprise Copilot API usage records.': '查看企業 Copilot API 使用量記錄。',
    'Manage enterprise custom roles and assignments.': '管理企業自訂角色和指派。',
    'View repository custom properties and administer definitions at the enterprise level.': '在企業層級查看儲存庫自訂屬性並管理屬性定義。',
    'Manage enterprise-wide AI controls configuration': '管理整個企業的 AI 控制項設定',
    'View enterprise Copilot metrics.': '查看企業 Copilot 指標。',
    'View and manage an enterprise IP allow list': '查看並管理企業 IP 允許清單',
    'Allows GitHub Apps to manage enterprise policies governing repository and organization actions like creation, permissions, deploy keys, etc.':
      '允許 GitHub 應用程式管理企業政策，以規範儲存庫和組織的建立、權限、部署金鑰等動作。',
    'View and manage rules for enterprise repositories': '查看並管理企業儲存庫的規則',
    'View and manage enterprise SCIM configuration in an Enterprise Managed User enterprise.':
      '在採用企業受控使用者的企業中，查看並管理企業 SCIM 設定。',
    'Manage enterprise access restrictions': '管理企業存取限制',
    'Access usage, budgets, cost centers, and payment information for the enterprise': '存取企業的使用量、預算、成本中心和付款資訊',
    'View delegated bypass requests for enterprise rulesets': '查看企業規則集的委派繞過請求',
    'View and manage enterprise credentials': '查看並管理企業認證資訊',
    'Create, edit, delete and list custom organization roles at the enterprise level. View system organization roles.':
      '在企業層級建立、編輯、刪除並列出自訂組織角色。查看系統組織角色。',
    'View organization custom properties and administer definitions at the enterprise level.': '在企業層級查看組織自訂屬性並管理屬性定義。',
    'View and manage innersource vulnerabilities across the enterprise': '查看並管理整個企業的內部開源漏洞',
    'View and manage the enterprise license policy': '查看並管理企業授權條款政策',
    'View Copilot subscription information and manage enterprise Copilot licenses': '查看 Copilot 訂閱資訊並管理企業 Copilot 授權',
    'Manage repository access of GitHub Apps on Enterprise-owned organizations. Requesting this permission will prevent it from being installed on other enterprises.':
      '管理企業擁有的組織中 GitHub 應用程式的儲存庫存取權。請求此權限後，該應用程式將無法安裝到其他企業。',
    'Manage installation of GitHub Apps on Enterprise-owned organizations. Requesting this permission will prevent it from being installed on other enterprises.':
      '管理 GitHub 應用程式在企業擁有的組織中的安裝。請求此權限後，該應用程式將無法安裝到其他企業。',
    'Create and remove enterprise organizations': '建立和移除企業組織',
    'Manage user access to the enterprise': '管理使用者對企業的存取權',
    'View and manage security products for the enterprise': '查看並管理企業的安全性產品',
    'View and manage general enterprise settings': '查看並管理企業一般設定',
    'View and manage enterprise single sign-on configuration': '查看並管理企業單一登入設定',
    'Create, edit, remove and view enterprise teams': '建立、編輯、移除並查看企業團隊',
    'View and manage enterprise two-factor authentication configuration': '查看並管理企業雙重驗證設定',
    'Manage verifiable domains for an enterprise': '管理企業的可驗證網域',

    // 权限选择器
    'Choose the minimal permissions necessary for your needs.': '選擇符合需求的最小必要權限。',
    'Learn more about permissions.': '瞭解權限。',
    // 「User permissions are granted … as part of the <a>User authorization flow</a>.」
    'User permissions are granted on an individual user basis as part of the': '使用者權限依個別使用者授予並屬於',
    'User authorization flow.': '使用者授權流程。',
    'User authorization flow': '使用者授權流程',
    'permissions documentation': '權限說明文件',
    'for information about specific permissions.': '以瞭解特定權限的詳細資訊。',
    'Changes to permissions will be applied to all future installations. Current users will be prompted to accept any changes and enable the new permissions on their installation.':
      '權限變更將套用到日後的所有安裝。系統會提示目前的使用者接受變更，並在其安裝中啟用新權限。',
    'No account permissions added yet': '尚未新增帳號權限',
    'User permissions permit access to resources under your personal GitHub account.': '使用者權限允許存取你個人 GitHub 帳號下的資源。',
    'No repository permissions added yet': '尚未新增儲存庫權限',
    'Repository permissions permit access to repositories and related resources.': '儲存庫權限允許存取儲存庫和相關資源。',
    'No organization permissions added yet': '尚未新增組織權限',
    'Organization permissions permit access to organization related resources.': '組織權限允許存取組織相關資源。',
    'No enterprise permissions added yet': '尚未新增企業權限',
    'Enterprise permissions permit access to business related features and data.': '企業權限允許存取企業相關的功能和資料。',
    'Read access required to use other repository permissions.': '必須有讀取權限才能使用其他儲存庫權限。',
    'Read access required to use other repository permissions': '必須有讀取權限才能使用其他儲存庫權限',
    'Add permissions': '新增權限',
    'Select account permissions': '選取帳號權限',
    'Select repository permissions': '選取儲存庫權限',
    'Select organization permissions': '選取組織權限',
    'Select business permissions': '選取企業權限',
    'Select enterprise permissions': '選取企業權限',
    'Select an access level': '選擇存取層級',
    'Repository permissions': '儲存庫權限',
    'Account permissions': '帳號權限',
    'Enterprise permissions': '企業權限',
    'These permissions are granted on an individual user basis as part of the User authorization flow.':
      '這些權限屬於使用者授權流程，依個別使用者授予。',

    // Web 钩子事件订阅（GitHub 应用）
    'Subscribe to events': '訂閱事件',
    'Based on the permissions you’ve selected, what events would you like to subscribe to?': '根據你選取的權限，你想訂閱哪些事件？',
    "Based on the permissions you've selected, what events would you like to subscribe to?": '根據你選取的權限，你想訂閱哪些事件？'
  },
  scoped: {
    ...TITLE_ENTRIES,
    ...EVENT_ENTRIES,
    // 访问级别（Read-only、Admin 等与全站相同的词由 common-ui 收录）
    'No access': '無存取權',
    'Read and write': '讀寫',
    'Read and Write': '讀寫',
    Read: '讀取',
    write: '寫入',
    // 资源名在另一元素时：「Read」+「access to」+ 资源 → 讀取存取權適用於 X（同 marketplace/listing.ts）
    'access to': '存取權適用於',
    'Access:': '存取權：',
    Required: '必要',
    mandatory: '必選',
    Mandatory: '必選',
    'Label: selected': '標籤：已選取',
    'Label: mandatory': '標籤：必選',
    'Label: disabled': '標籤：已停用',
    'This is a mandatory permission and cannot be changed': '必選權限無法變更',
    "Can't be used for Agentic Apps": '無法用於代理式應用程式',
    'Can’t be used for Agentic Apps': '無法用於代理式應用程式',
    // 权限列表为空时的无障碍标题
    'Permission Blank Slate': '權限空白狀態',
    // 「These <a>user permissions</a> are granted on an individual user basis as part of the <a>user authorization flow</a>.」
    These: '這些',
    'user permissions': '使用者權限',
    'are granted on an individual user basis as part of the': '依個別使用者授予並屬於',
    'user authorization flow': '使用者授權流程',
    // 单个文件权限的路径
    Path: '路徑',
    'Add path': '新增路徑',
    'One or more paths were too long (maximum is 255 characters)': '一或多個路徑過長（上限為 255 個字元）',
    'One or more paths contain invalid characters': '一或多個路徑包含無效字元',
    // 「Read our <a>permissions documentation</a> for information about specific permissions.」
    'Read our': '請參閱',

    // Web 钩子事件说明（事件名见 EVENT_TITLES）；与存储库 Web 钩子相同的说明由 repo-settings 收录
    'Change privileges to be able to select events': '變更權限後才能選取事件',
    'A GitHub App installation target is renamed.': 'GitHub 應用程式安裝目標已重新命名。',
    'When this App is deleted and the associated hook is removed.': '刪除此應用程式並移除相關聯的 Web 鉤子時。',
    'Security advisory published, updated, or withdrawn.': '安全性公告已發布、更新或撤回。',
    'Custom property is created, updated, deleted, or promoted.': '自訂屬性已建立、更新、刪除或提升。',
    'Custom property values are changed for an organization': '組織的自訂屬性值已變更',
    'Deployment protection rule requested for an environment.': '已為環境請求部署保護規則。',
    'Deployment review requested, approved or rejected': '部署審查已請求、核准或拒絕',
    'License compliance alert closure request was created, cancelled, or received a response (approved or rejected).':
      '授權條款合規性警示關閉請求已建立、取消或收到回應（核准或拒絕）。',
    // 回应被 dismiss 作「駁回」（同 repo-settings/webhooks.ts）
    'Push ruleset bypass request was created, cancelled, completed, received a response, or a response was dismissed. Note: Delegated bypass for push rules is currently in beta and subject to change.':
      '推送規則集繞過請求已建立、取消、完成、收到回應，或回應已被駁回。注意：推送規則的委派繞過目前為測試版，可能會有變動。',
    'Issue opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, milestoned, demilestoned, locked, unlocked, typed, or untyped.':
      '議題已建立、編輯、刪除、轉移、釘選、取消釘選、關閉、重新開啟、指派、取消指派、加上標籤、移除標籤、設定里程碑、移除里程碑、鎖定、解除鎖定、設定類型或移除類型。',
    'Merge Queue entry added': '已新增合併佇列項目',
    'Personal access token request created, approved, denied, or cancelled.': '個人存取權杖請求已建立、核准、拒絕或取消。',
    'Project item created, edited, deleted, archived, restored, converted, or reordered.':
      '專案項目已建立、編輯、刪除、封存、還原、轉換或重新排序。',
    'Project created, updated, deleted, closed, or reopened.': '專案已建立、更新、刪除、關閉或重新開啟。',
    'Project status updates created, updated, or deleted.': '專案狀態更新已建立、更新或刪除。',
    'When a message is dispatched from a repository.': '儲存庫分派訊息時。',
    'A manual workflow run is requested.': '已請求手動執行工作流程。'
  },
  regexp: [
    // 权限行：访问级别按钮、删除按钮（Remove 按术语表作「移除」）
    [/^Access: (No access|Read-only|Read and write|Admin)$/, (_, level: string) => `存取權：${ACCESS_LEVEL[level] ?? level}`],
    [new RegExp(`^Remove (${PERMISSION_TITLE_SOURCE})$`), (_, title: string) => joinCjk('移除', PERMISSION_TITLES[title] ?? title)],
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
        `${label ? '標籤：' : ''}${PERMISSION_SECTION[section] ?? section}${mandatory ? '必選' : ''}權限數`
    ],
    // 可订阅事件旁的帮助链接
    [
      new RegExp(`^Learn more about the (${EVENT_TITLE_SOURCE}) event$`),
      (_, title: string) => joinCjk(joinCjk('瞭解', EVENT_TITLES[title] ?? title), '事件')
    ]
  ]
} satisfies PageDictionary
