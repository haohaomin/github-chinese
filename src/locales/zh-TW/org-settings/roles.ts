import type { PageDictionary } from '../../../core/types'

/** 自定义角色可选的存储库附加权限（组织角色与存储库角色共用） */
const REPOSITORY_PERMISSIONS: Readonly<Record<string, string>> = {
  'Create a discussion category': '建立討論類別',
  'Edit a discussion category': '編輯討論類別',
  'Delete a discussion category': '刪除討論類別',
  'Mark or unmark discussion answers': '標示或取消標示討論答案',
  'Hide or unhide discussion comments': '隱藏或取消隱藏討論留言',
  'Convert issues to discussions': '將議題轉換為討論',
  'Triage discussions': '分類討論',
  'Assign or remove a user': '指派或移除使用者',
  'Add or remove a label': '加上或移除標籤',
  'Close an issue': '關閉議題',
  'Reopen a closed issue': '重新開啟已關閉的議題',
  'Delete an issue': '刪除議題',
  'Mark an issue as a duplicate': '將議題標示為重複',
  'Mark an issue as duplicate': '將議題標示為重複',
  'Request a solo merge': '請求單獨合併',
  'Jump to the front of the queue': '跳到佇列最前面',
  'Close a pull request': '關閉拉取請求',
  'Reopen a closed pull request': '重新開啟已關閉的拉取請求',
  'Request a pull request review': '請求拉取請求審查',
  'Set milestones': '設定里程碑',
  'Manage wiki settings': '管理 Wiki 設定',
  'Manage project settings': '管理專案設定',
  'Manage pull request merging settings': '管理拉取請求合併設定',
  'Manage GitHub Pages settings': '管理 GitHub 頁面設定',
  'Manage GitHub Page settings': '管理 GitHub 頁面設定',
  'Manage webhooks': '管理 Web 鉤子',
  'Manage deploy keys': '管理部署金鑰',
  'Edit repository metadata': '編輯儲存庫中繼資料',
  'Set interaction limits': '設定互動限制',
  'Set the social preview': '設定社群預覽',
  'Push commits to protected branches': '推送提交到受保護的分支',
  'Create protected tags': '建立受保護的標記',
  'Delete protected tags': '刪除受保護的標記',
  'Bypass branch protections': '繞過分支保護',
  'Edit repository rules': '編輯儲存庫規則',
  'View code scanning alerts': '查看程式碼掃描警示',
  'Dismiss or reopen code scanning alerts': '解除或重新開啟程式碼掃描警示',
  'Delete code scanning alerts': '刪除程式碼掃描警示',
  'Delete code scanning results': '刪除程式碼掃描結果',
  'View Dependabot alerts': '查看 Dependabot 警示',
  'Dismiss or reopen Dependabot alerts': '解除或重新開啟 Dependabot 警示',
  'View secret scanning alerts': '查看機密掃描警示',
  'Dismiss, reopen, or assign secret scanning alerts': '解除、重新開啟或指派機密掃描警示',
  'Dismiss or reopen secret scanning alerts': '解除或重新開啟機密掃描警示',
  'Manage GitHub Actions general settings': '管理 GitHub 動作一般設定',
  'Manage runners': '管理執行器',
  'Manage secrets': '管理機密',
  'Manage variables': '管理變數',
  'Manage environments (including environment secrets and variables)': '管理環境（包括環境機密和變數）'
}

/** 自定义组织角色可选的组织权限（与 GitHub 应用权限说明有重名，放 scoped） */
const ORGANIZATION_PERMISSIONS: Readonly<Record<string, string>> = {
  'Manage custom organization roles': '管理自訂組織角色',
  'Access to create, view, update, and delete custom organization roles within the organization. This permission does not allow a user to assign custom roles.':
    '可在組織內建立、查看、更新並刪除自訂組織角色。此權限不允許使用者指派自訂角色。',
  'View organization roles': '查看組織角色',
  "Access to view the organization's custom organization roles.": '可查看組織的自訂組織角色。',
  'Access to view the organization’s custom organization roles.': '可查看組織的自訂組織角色。',
  'Manage custom repository roles': '管理自訂儲存庫角色',
  "Access to create, view, update, and delete the organization's custom repository roles.":
    '可建立、查看、更新並刪除組織的自訂儲存庫角色。',
  'Access to create, view, update, and delete the organization’s custom repository roles.':
    '可建立、查看、更新並刪除組織的自訂儲存庫角色。',
  'View custom repository roles': '查看自訂儲存庫角色',
  "Access to view the organization's custom repository roles.": '可查看組織的自訂儲存庫角色。',
  'Access to view the organization’s custom repository roles.': '可查看組織的自訂儲存庫角色。',
  'Manage organization webhooks': '管理組織 Web 鉤子',
  'Access to register and manage webhooks for the organization. Users with this permission will be able to view webhook payloads, which may contain metadata for repositories in the organization.':
    '可為組織註冊並管理 Web 鉤子。具有此權限的使用者可以查看 Web 鉤子承載，其中可能包含組織內儲存庫的中繼資料。',
  'Manage organization OAuth app policies': '管理組織 OAuth 應用程式政策',
  'Access to the "OAuth app policy" settings for the organization.': '可存取組織的「OAuth 應用程式政策」設定。',
  'Edit custom properties values at the organization level': '在組織層級編輯自訂屬性值',
  'Access to set custom property values on all repositories in the organization.': '可為組織內所有儲存庫設定自訂屬性值。',
  "Manage the organization's custom properties definitions": '管理組織的自訂屬性定義',
  'Manage the organization’s custom properties definitions': '管理組織的自訂屬性定義',
  'Access to create and edit custom property definitions for the organization.': '可為組織建立並編輯自訂屬性定義。',
  'Manage organization ref update rules and rulesets': '管理組織參考更新規則和規則集',
  'Access to manage rulesets and view ruleset insights at the organization level.': '可在組織層級管理規則集並查看規則集洞察。',
  'View organization audit log': '查看組織稽核記錄',
  'Access to the audit log for the organization. The audit log may contain metadata for repositories in the organization.':
    '可存取組織的稽核記錄。稽核記錄可能包含組織內儲存庫的中繼資料。',
  'Manage organization Actions policies': '管理組織動作政策',
  'Access to manage all settings on the "Actions General" settings page, except for self-hosted runners settings.':
    '可管理「動作一般」設定頁面上的所有設定，自架執行器設定除外。',
  'Manage organization Actions secrets': '管理組織動作機密',
  'Access to create and manage Actions organization secrets.': '可建立並管理組織動作機密。',
  'Manage organization Actions variables': '管理組織動作變數',
  'Access to create and manage Actions organization variables.': '可建立並管理組織動作變數。',
  'Manage organization hosted runner custom images': '管理組織代管執行器自訂映像檔',
  'Access to create and manage custom images for your organization.': '可為組織建立並管理自訂映像檔。',
  'Manage organization runners and runner groups': '管理組織執行器和執行器群組',
  'Access to create and manage GitHub-hosted runners, self-hosted runners, and runner groups, and control where self-hosted runners can be created.':
    '可建立並管理 GitHub 代管的執行器、自架執行器和執行器群組，並控制可在何處建立自架執行器。',
  'View organization Actions metrics': '查看組織動作指標',
  'View GitHub Actions metrics for your organization.': '查看組織的 GitHub 動作指標。',
  'View organization hosted runner custom images': '查看組織代管執行器自訂映像檔',
  'View custom images for your organization.': '查看組織的自訂映像檔。',
  'Review and manage secret scanning bypass requests': '審查並管理機密掃描繞過請求',
  'Review and manage secret scanning bypass requests for your organization.': '審查並管理組織的機密掃描繞過請求。',
  'Review and manage secret scanning alert dismissal requests': '審查並管理機密掃描警示解除請求',
  'Review and manage secret scanning alert dismissal requests for your organization.': '審查並管理組織的機密掃描警示解除請求。',
  'Bypass code scanning alert dismissal requests': '繞過程式碼掃描警示解除請求',
  'Bypass code scanning alert dismissal requests for your organization.': '繞過組織的程式碼掃描警示解除請求。',
  'Review code scanning alert dismissal requests': '審查程式碼掃描警示解除請求',
  'Review and manage code scanning alert dismissal requests for your organization.': '審查並管理組織的程式碼掃描警示解除請求。',
  'View code scanning alert dismissal requests': '查看程式碼掃描警示解除請求',
  'View code scanning alert dismissal requests for your organization.': '查看組織的程式碼掃描警示解除請求。',
  'Bypass Dependabot alert dismissal requests': '繞過 Dependabot 警示解除請求',
  'Bypass Dependabot alert dismissal requests for your organization.': '繞過組織的 Dependabot 警示解除請求。',
  'Review Dependabot alert dismissal requests': '審查 Dependabot 警示解除請求',
  'Review and manage Dependabot alert dismissal requests for your organization.': '審查並管理組織的 Dependabot 警示解除請求。',
  'View Dependabot alert dismissal requests': '查看 Dependabot 警示解除請求',
  'View Dependabot alert dismissal requests for your organization.': '查看組織的 Dependabot 警示解除請求。',
  'View organization Copilot metrics': '查看組織 Copilot 指標',
  'View Copilot usage metrics for your organization.': '查看組織的 Copilot 使用量指標。'
}

/** 只在组织角色详情（「• 」开头的权限条目）里出现的存储库 / 组织权限 */
const ROLE_DETAIL_PERMISSIONS: Readonly<Record<string, string>> = {
  'Create a label': '建立標籤',
  'Edit a label': '編輯標籤',
  'Remove a label': '移除標籤',
  'Create a milestone': '建立里程碑',
  'Edit a milestone': '編輯里程碑',
  'Remove an assigned user': '移除已指派的使用者',
  'Comment on a locked issue': '在已鎖定的議題上留言',
  'Edit an issue title and body': '編輯議題標題和內文',
  'Edit a comment on an issue': '編輯議題上的留言',
  'Lock and unlock an issue conversation': '鎖定和解鎖議題對話',
  'Minimize an issue comment': '最小化議題留言',
  'Unminimize an issue comment': '取消最小化議題留言',
  'Set an issue type': '設定議題類型',
  'Transfer an issue': '轉移議題',
  'View code quality alerts': '查看程式碼品質警示',
  'Dismiss or reopen code quality alerts': '解除或重新開啟程式碼品質警示',
  'Close a discussion': '關閉討論',
  'Reopen a discussion': '重新開啟討論',
  'Delete a discussion': '刪除討論',
  'Delete a discussion comment': '刪除討論留言',
  'Edit a discussion comment': '編輯討論留言',
  'Edit category on a discussion': '編輯討論的類別',
  'Award and revoke discussion badges': '授予和撤銷討論徽章',
  'Manage repository Actions secrets': '管理儲存庫動作機密',
  'Manage repository Actions variables': '管理儲存庫動作變數',
  'Manage repository Actions runners': '管理儲存庫動作執行器',
  'Manage repository Actions policies': '管理儲存庫動作政策',
  'Manage repository environments, environment secrets and variables': '管理儲存庫環境、環境機密和變數',
  'Create a protected tag': '建立受保護的標記',
  'Delete a protected tag': '刪除受保護的標記',
  'Edit repository announcement banners': '編輯儲存庫公告橫幅',
  'Manage topics': '管理主題',
  'Edit repository custom properties values at the repository level': '在儲存庫層級編輯儲存庫自訂屬性值',
  'Delete code scanning analyses': '刪除程式碼掃描分析',
  'View security advisories': '查看安全性公告',
  'Create, edit, and manage security advisories (includes Read)': '建立、編輯和管理安全性公告（包括讀取）',
  'Publish security advisories and request CVEs. Requires Read or Write security advisories.':
    '發佈安全性公告並申請 CVE。需要「讀取或寫入安全性公告」權限。',
  'Accept private vulnerability reports and close or reopen security advisories. Requires Read or Write security advisories.':
    '接受私下回報的漏洞，關閉或重新開啟安全性公告。需要「讀取或寫入安全性公告」權限。',
  'Create organization owned integrations': '建立組織擁有的整合',
  'Edit organization owned integrations': '編輯組織擁有的整合',
  'Delete organization owned integrations': '刪除組織擁有的整合',
  'View all organization owned integrations': '查看組織擁有的所有整合',
  'View organization Actions usage metrics': '查看組織動作使用量指標',
  'Edit organization hosted compute network configurations': '編輯組織代管運算網路設定',
  'Bypass secret scanning alert closure requests': '繞過機密掃描警示關閉請求',
  'Review license compliance closure requests': '審查授權合規關閉請求',
  'View license compliance closure requests': '查看授權合規關閉請求',
  'View repository license policy': '查看儲存庫授權政策'
}

/** 组织角色详情的权限条目：「• 」+ 权限名，按存储库 / 组织权限表与上表整段匹配 */
const BULLET_PERMISSIONS: Readonly<Record<string, string>> = {
  ...REPOSITORY_PERMISSIONS,
  ...ORGANIZATION_PERMISSIONS,
  ...ROLE_DETAIL_PERMISSIONS
}

/** 角色图标的无障碍名称：<角色名> icon（all_repo_read 是内部名） */
const ROLE_ICONS: Readonly<Record<string, string>> = {
  all_repo_read: '所有儲存庫讀取',
  'All-repository read': '所有儲存庫讀取',
  'All-repository write': '所有儲存庫寫入',
  'All-repository triage': '所有儲存庫分類',
  'All-repository moderate': '所有儲存庫審核',
  'All-repository maintain': '所有儲存庫維護',
  'All-repository admin': '所有儲存庫管理員',
  'Apps manager': '應用程式管理員',
  'CI/CD Admin': 'CI/CD 管理員',
  'Security manager': '安全性管理員',
  'Open-source license manager': '開放原始碼授權管理員',
  Repository: '儲存庫',
  Organization: '組織'
}

/** 转义正则元字符：权限名含括号、点号、斜杠 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 名称表拼成正则备选：长名在前（Delete a discussion comment 先于 Delete a discussion） */
function alternatives(table: Readonly<Record<string, string>>): string {
  return Object.keys(table)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')
}

/**
 * 组织角色（角色管理、角色分配、自定义组织角色）与存储库角色（预定义角色、自定义存储库角色）。
 * 「Organization roles」「Role management」已由 organization 收录；「Add permissions」「Users」「Merge queue」
 * 由个人设置、common、commits 的 static 收录。
 * 术语：assign → 指派，Remove → 移除，pre-defined → 預先定義，base role → 基本角色。
 */
export default {
  static: {
    // 组织角色：说明、预定义角色（审核、应用管理员、CI/CD 管理员、开源许可证管理员）与详情里的分组
    'Organization roles are used to grant access to specific organization and repository settings. Repository permissions are granted across every repository in the organization.':
      '組織角色用於授予特定組織設定和儲存庫設定的存取權。儲存庫權限適用於組織內的每個儲存庫。',
    'All-repository moderate': '所有儲存庫審核',
    'Grants Moderate access to all repositories in the organization.': '授予組織內所有儲存庫的審核權限。',
    'Apps manager': '應用程式管理員',
    'Grants the ability to manage all GitHub Apps owned by an organization.': '授予管理組織擁有的所有 GitHub 應用程式的權限。',
    'CI/CD Admin': 'CI/CD 管理員',
    'Grants admin access to manage Actions policies, runners, runner groups, network configurations, secrets, variables, and usage metrics for an organization.':
      '授予管理組織動作政策、執行器、執行器群組、網路設定、機密、變數和使用量指標的管理員權限。',
    'Open-source license manager': '開放原始碼授權管理員',
    'Grants the ability to review open-source license compliance closure requests and update repository license policies.':
      '授予審查開放原始碼授權合規關閉請求和更新儲存庫授權政策的權限。',
    'Base repository role:': '基本儲存庫角色：',
    'Apps and automation': '應用程式和自動化',
    'All read permissions plus…': '所有讀取權限，外加…',
    // 角色分配：页面说明、空状态（「No」「organization」「roles assigned」是相邻文本节点，整体匹配）
    'Assign teams or people an organization role': '為團隊或人員指派組織角色',
    'No organization roles assigned': '暫無已指派的組織角色',
    'Organization roles have not been assigned to any users or teams.': '尚未將組織角色指派給任何使用者或團隊。',
    // 存储库角色：审核（Moderate）角色的说明
    'Triage permissions plus edit and moderate issues, manage labels, milestones, etc.':
      '分類權限，外加編輯和審核議題、管理標籤、里程碑等。',
    // 组织角色：预定义角色
    'Pre-defined roles': '預先定義的角色',
    'Predefined roles': '預先定義的角色',
    'All-repository read': '所有儲存庫讀取',
    'All-repository write': '所有儲存庫寫入',
    'All-repository triage': '所有儲存庫分類',
    'All-repository maintain': '所有儲存庫維護',
    'All-repository admin': '所有儲存庫管理員',
    'CI/CD admin': 'CI/CD 管理員',
    'App Manager': '應用程式管理員',
    'App manager': '應用程式管理員',
    'Grants read access to all repositories in the organization.': '授予組織內所有儲存庫的讀取權限。',
    'Grants write access to all repositories in the organization.': '授予組織內所有儲存庫的寫入權限。',
    'Grants triage access to all repositories in the organization.': '授予組織內所有儲存庫的分類權限。',
    'Grants maintenance access to all repositories in the organization.': '授予組織內所有儲存庫的維護權限。',
    'Grants admin access to all repositories in the organization.': '授予組織內所有儲存庫的管理員權限。',
    'Grants admin access to manage Actions policies, runners, runner groups, hosted compute network configurations, secrets, variables, and usage metrics for an organization.':
      '授予管理組織動作政策、執行器、執行器群組、代管運算網路設定、機密、變數和使用量指標的管理員權限。',
    'Grants the ability to manage security policies, security alerts, and security configurations for an organization and all its repositories.':
      '授予管理組織及其所有儲存庫的安全性政策、安全性警示和安全性設定的權限。',
    'Grants the ability to create, edit, and delete all GitHub Apps in an organization.':
      '授予建立、編輯並刪除組織內所有 GitHub 應用程式的權限。',
    'Grants standard access to organization features.': '授予組織功能的標準存取權。',
    'Grants full administrative control of the organization.': '授予組織的完整管理控制權。',
    'Grants additional permissions to help moderate organization-level discussions and community content.':
      '授予額外權限，協助審核組織層級的討論和社群內容。',
    'Grants permission to view and manage billing settings and subscription details for the organization.':
      '授予查看並管理組織帳務設定和訂閱詳細資料的權限。',
    'Show role permissions': '顯示角色權限',
    'Hide role permissions': '隱藏角色權限',
    'Organization permissions:': '組織權限：',
    'Repository permissions:': '儲存庫權限：',
    // base 与 Base permissions → 基本權限 一致（Base role → 基本角色）
    'Base repository role': '基本儲存庫角色',

    // 组织角色：自定义角色
    'Create a role': '建立角色',
    'Create a Role': '建立角色',
    'Create role': '建立角色',
    'Edit role': '編輯角色',
    'Update role': '更新角色',
    'Delete role': '刪除角色',
    'Add Permissions': '新增權限',
    'Choose a role to inherit': '選擇要繼承的角色',
    'Inherited role': '繼承的角色',
    'Search permissions': '搜尋權限',
    'No custom roles': '尚無自訂角色',
    "You haven't created any custom roles yet.": '你尚未建立任何自訂角色。',
    'You haven’t created any custom roles yet.': '你尚未建立任何自訂角色。',
    'Organization roles are used to grant access and permissions to manage your organization.': '組織角色用於授予管理組織的存取權和權限。',
    'Adding a repository role and permissions to a custom organization role is currently in public preview and subject to change.':
      '將儲存庫角色和權限加入自訂組織角色的功能目前為公開預覽，可能會變更。',
    'If you delete an existing role, all teams and users with the role will be unassigned.':
      '刪除現有角色後，具有該角色的所有團隊和使用者都會被取消指派。',

    // 组织角色：角色分配
    'New role assignment': '新增角色指派',
    'Add new assignment': '新增指派',
    'Search for users or teams': '搜尋使用者或團隊',
    'Search users and teams': '搜尋使用者和團隊',
    'Select a role': '選擇角色',
    // 复数的多选列表作「選取」，单数的选择作「選擇」
    'Select roles': '選取角色',
    'No role assignments': '尚無角色指派',
    'Remove role assignment': '移除角色指派',
    'Remove role assignment?': '移除角色指派？',
    'Assign role': '指派角色',
    'Assigned roles': '已指派的角色',

    // 存储库角色
    'Roles are used to grant access and permissions for teams and members.': '角色用於向團隊和成員授予存取權和權限。',
    'In addition to the available pre-defined roles, you can create up to 20 custom roles to fit your needs.':
      '除了可用的預先定義角色之外，你還可以視需要建立最多 20 個自訂角色。',
    'Learn more about custom repository roles': '瞭解自訂儲存庫角色',
    // 「You can」+「set the base role」+「for this organization from one of these roles.」：片段间原文无逗号，改语序不加
    'set the base role': '設定此組織的基本角色',
    'for this organization from one of these roles.': '為以下角色之一。',
    'Read and clone repositories. Open and comment on issues and pull requests.': '讀取並複製儲存庫。建立議題和拉取請求並留言。',
    'Read permissions plus manage issues and pull requests.': '讀取權限，外加管理議題和拉取請求。',
    'Triage permissions plus read, clone and push to repositories.': '分類權限，外加讀取、複製並推送到儲存庫。',
    'Write permissions plus manage issues, pull requests and some repository settings.':
      '寫入權限，外加管理議題、拉取請求和部分儲存庫設定。',
    'Full access to repositories including sensitive and destructive actions.': '儲存庫的完整存取權，包括敏感和破壞性操作。',
    'Modify Admin Role': '修改管理員角色',
    'Custom roles': '自訂角色',
    'Create custom roles with GitHub Enterprise': '使用 GitHub 企業版建立自訂角色',
    'Enterprise accounts offer organizations more granular control over permissions by allowing you to configure up to 20 custom repository roles. This enables greater control over who and how your users access code and data in your organization.':
      '企業帳號可讓你設定最多 20 個自訂儲存庫角色，讓組織更精細地控制權限。這能更有效地掌控哪些使用者能以何種方式存取組織中的程式碼和資料。',
    'Non-code contributors who want to view or discuss your project': '想要查看或討論專案的非程式碼貢獻者',
    'Contributors who need to proactively manage issues and pull requests without write access':
      '需要主動管理議題和拉取請求但沒有寫入權限的貢獻者',
    'Organization members and collaborators who actively push to your project': '積極推送到專案的組織成員和協作者',
    'Project managers who need to manage the repository without access to sensitive or destructive actions':
      '需要管理儲存庫但無權執行敏感或破壞性操作的專案經理',
    'Mixed roles': '混合角色'
  },
  scoped: {
    // 存储库角色 Moderate（全局 static 是安全严重性“中”）、角色详情里的分组标题
    Moderate: '審核',
    'Moderate:': '審核：',
    'Issue and Pull Request': '議題和拉取請求',
    'Pull Request': '拉取請求',
    'Merge Queue': '合併佇列',
    ...REPOSITORY_PERMISSIONS,
    ...ORGANIZATION_PERMISSIONS,
    Members: '成員',
    Read: '讀取',
    Triage: '分類',
    Write: '寫入',
    Maintain: '維護',
    'Read:': '讀取：',
    'Triage:': '分類：',
    'Write:': '寫入：',
    'Maintain:': '維護：',
    'Admin:': '管理員：',
    Roles: '角色',
    'Issue and pull requests': '議題和拉取請求',
    // 「You can」+「set the base role」+「for this organization from one of these roles.」
    'You can': '你可以',

    // 组织角色：说明、自定义角色表单
    'Organization roles allow you to grant individuals or teams permissions to manage your organization and its repositories.':
      '組織角色可讓你授予個人或團隊管理組織及其儲存庫的權限。',
    'Create custom organization roles with GitHub Enterprise': '使用 GitHub 企業版建立自訂組織角色',
    'Upgrade to GitHub Enterprise to create custom organization roles.': '升級到 GitHub 企業版以建立自訂組織角色。',
    'Create a custom role': '建立自訂角色',
    'Base role': '基本角色',
    'No base repository role': '無基本儲存庫角色',
    'No permissions': '無權限',
    'Role name': '角色名稱',
    'Role description': '角色描述',
    'Save role': '儲存角色',
    'Remove role': '移除角色',
    'Delete this role': '刪除此角色',
    'Are you sure you want to delete this role?': '確定要刪除此角色嗎？',
    'Deleting this role will remove it from all teams and members that have been assigned it.':
      '刪除此角色後，已指派此角色的所有團隊和成員都會失去此角色。',

    // 组织角色：角色分配
    'Add role assignment': '新增角色指派',
    'Remove assignment': '移除指派',
    'Assigned via': '指派來源',
    'Assigned to': '指派給',
    Assignment: '指派',
    Assignments: '指派',
    'Search for users and teams': '搜尋使用者和團隊',
    'Select users or teams': '選取使用者或團隊',
    'Select role': '選擇角色',
    'Filter roles': '篩選角色',
    'All roles': '所有角色',
    'There are no role assignments for this organization.': '此組織尚無角色指派。',
    'Role assigned': '已指派角色',
    // 角色分配页的 Remove 按术语表作「移除」，与本节「移除角色指派」一致
    'Role removed': '已移除角色',
    'Are you sure you want to remove this role assignment?': '確定要移除此角色指派嗎？'
  },
  regexp: [
    // 组织角色详情：• <权限名>（权限名按表整段匹配）；角色图标：<角色名> icon
    [new RegExp(`^• (${alternatives(BULLET_PERMISSIONS)})$`), (_, name: string) => `• ${BULLET_PERMISSIONS[name] ?? name}`],
    [new RegExp(`^(${alternatives(ROLE_ICONS)}) icon$`), (_, name: string) => `${ROLE_ICONS[name] ?? name}圖示`],
    [/^(\d+) roles?$/, '$1 個角色'],
    [/^(\d+) permissions?$/, '$1 項權限'],
    [/^(\d+) custom roles?$/, '$1 個自訂角色'],
    [/^(\d+)\/(\d+) custom roles?$/, '$1/$2 個自訂角色'],
    // 用户是人，量词作「位」；团队作「個」
    [/^(\d+) users? and (\d+) teams? assigned$/, '已指派 $1 位使用者和 $2 個團隊'],
    [/^You can create up to (\d+) custom roles\.$/, '最多可建立 $1 個自訂角色。'],
    [
      /^In addition to the available pre-defined roles, you can create up to (\d+) custom roles to fit your needs\.$/,
      '除了可用的預先定義角色之外，你還可以視需要建立最多 $1 個自訂角色。'
    ]
  ]
} satisfies PageDictionary
