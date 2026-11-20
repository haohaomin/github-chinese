import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/** 基本权限名称 */
const PERMISSION_NAMES: Readonly<Record<string, string>> = {
  'No permission': '無權限',
  'No access': '無存取權',
  None: '無',
  Read: '讀取',
  Write: '寫入',
  Admin: '管理員'
}

const PERMISSION_SOURCE = '(No permission|No access|None|Read|Write|Admin)'

/** 权限名两侧可选的引号（直引号或弯引号）；左引号捕获，用来判断原文是否带引号 */
const OPEN_QUOTE = '(["“]?)'
const CLOSE_QUOTE = '["”]?'

/** 权限名：原文带引号才加「」，否则不加 */
function quotedPermission(quote: string, permission: string): string {
  const name = PERMISSION_NAMES[permission] ?? permission
  return quote ? `「${name}」` : name
}

/**
 * 成员权限页（基本权限、存储库创建 / 复刻 / 讨论、项目基本权限、页面创建、应用访问请求、
 * 管理员存储库权限、团队创建）、团队讨论、存储库策略（Policies）。
 * 「Learn more about rulesets.」已由 commits 的 static 收录。
 * 术语：clone → 複製，pull → 拉取，fork → 分叉，transfer → 轉移，policy → 政策，request（申请动词）→ 申請。
 */
export default {
  static: {
    // 成员权限保存提示
    'Members and outside collaborators are now allowed to make app access requests.': '現在允許成員和外部協作者提出應用程式存取要求。',
    'Repository admins can now install GitHub Apps.': '儲存庫管理員現在可以安裝 GitHub 應用程式。',
    'Branch rename settings were updated.': '已更新分支重新命名設定。',
    // 成员权限：基本权限为“无”时的说明（“authorized team”版本）
    'Members will only be able to clone and pull public repositories. To give a member additional access, you’ll need to add them to an authorized team or make them a collaborator on individual repositories.':
      '成員只能複製並拉取公開儲存庫。若要授予成員更多存取權，你需要將其加入已授權的團隊，或將其設為個別儲存庫的協作者。',
    "Members will only be able to clone and pull public repositories. To give a member additional access, you'll need to add them to an authorized team or make them a collaborator on individual repositories.":
      '成員只能複製並拉取公開儲存庫。若要授予成員更多存取權，你需要將其加入已授權的團隊，或將其設為個別儲存庫的協作者。',
    // 部署密钥页：「… For more information, see <a>the GitHub Apps documentation</a>. Please note … see <a>managing deploy keys</a>.」按文本节点分段
    'Deploy keys use an SSH key to grant readonly or write access to a single repository. If you have a more complex project or want more fine-grain control over permissions, consider using a GitHub App instead. For more information, see':
      '部署金鑰使用 SSH 金鑰授予單一儲存庫的唯讀或寫入權限。如果專案較複雜或需要更細緻的權限控制，請考慮改用 GitHub 應用程式。詳細資訊請參閱',
    '. Please note that deploy keys are not protected by a passphrase and can be a security risk if your server is compromised. For more information on deploy keys, see':
      '。請注意，部署金鑰不受複雜密碼保護，伺服器遭入侵時可能帶來安全性風險。有關部署金鑰的詳細資訊，請參閱',
    'the GitHub Apps documentation': 'GitHub 應用程式文件',
    'managing deploy keys': '管理部署金鑰',
    'Deploy keys are not allowed to be created and used within this organization. Cloning public repositories will be unaffected by this policy.':
      '不允許在此組織中建立和使用部署金鑰。複製公開儲存庫不受此政策影響。',
    'Deploy keys are allowed to be created and used within this organization.': '允許在此組織中建立和使用部署金鑰。',
    'Are you sure you want to disable deploy keys?': '確定要停用部署金鑰嗎？',
    // 存储库策略：空状态「<a>Repository policies</a> define whether …」、新建 / 编辑表单、保存提示
    'Protect your most important repositories': '保護你最重要的儲存庫',
    'define whether members can perform operations on repositories such as delete and transfer.':
      '定義成員能否對儲存庫執行刪除和轉移等動作。',
    'New repository policy': '新增儲存庫政策',
    'Policy Name': '政策名稱',
    'Exempt roles, teams, agents, and apps from this policy by adding them to the allow list.':
      '將角色、團隊、代理和應用程式加入允許清單，使其不受此政策約束。',
    'Choose which roles, teams, agents, and apps can bypass this policy': '選擇可以繞過此政策的角色、團隊、代理和應用程式',
    'Repository migrations': '儲存庫移轉',
    'Which policies should be applied?': '要套用哪些政策？',
    'Restrict visibility': '限制可見度',
    'New repositories and visibility changes are limited to specified visibilities, unless the actor is on the allow list.':
      '新儲存庫和可見度變更僅限於指定的可見度，允許清單中的執行者除外。',
    'Only allow users on the allow list to create repositories.': '僅允許允許清單中的使用者建立儲存庫。',
    'Only allow users on the allow list to delete repositories.': '僅允許允許清單中的使用者刪除儲存庫。',
    'Restrict transfers': '限制轉移',
    'Only allow users on the allow list to transfer repositories out of the organization.': '僅允許允許清單中的使用者將儲存庫轉移出組織。',
    'Restrict names': '限制名稱',
    'New repository names and name changes are limited to the specific patterns, unless the actor is on the allow list or is a transferred repository.':
      '新儲存庫名稱和名稱變更僅限於特定模式，允許清單中的執行者或轉移而來的儲存庫除外。',
    'Must not match': '不得符合',
    'Naming pattern': '命名模式',
    'Define the naming pattern using a regular expression.': '使用規則運算式定義命名模式。',
    'Test pattern...': '測試模式...',
    'This policy will be enforced': '將強制執行此政策',
    'This policy will not be enforced': '不會強制執行此政策',
    'Policy created': '已建立政策',
    'Policy updated': '已更新政策',
    'Policy deleted': '已刪除政策',
    // 基本权限
    'Member repository permissions': '成員儲存庫權限',
    'Base permissions': '基本權限',
    'Base permissions to the organization’s repositories apply to all members and excludes outside collaborators. Since organization members can have permissions from multiple sources, members and collaborators who have been granted a higher level of access than the base permissions will retain their higher permission privileges.':
      '組織儲存庫的基本權限適用於所有成員，但不包括外部協作者。由於組織成員的權限可能來自多個來源，獲得高於基本權限之存取層級的成員和協作者將保留其較高的權限。',
    "Base permissions to the organization's repositories apply to all members and excludes outside collaborators. Since organization members can have permissions from multiple sources, members and collaborators who have been granted a higher level of access than the base permissions will retain their higher permission privileges.":
      '組織儲存庫的基本權限適用於所有成員，但不包括外部協作者。由於組織成員的權限可能來自多個來源，獲得高於基本權限之存取層級的成員和協作者將保留其較高的權限。',
    'Organization member permissions': '組織成員權限',
    'Members will only be able to clone and pull public repositories. To give a member additional access, you’ll need to add them to teams or make them collaborators on individual repositories.':
      '成員只能複製並拉取公開儲存庫。若要授予成員更多存取權，你需要將其加入團隊，或將其設為個別儲存庫的協作者。',
    "Members will only be able to clone and pull public repositories. To give a member additional access, you'll need to add them to teams or make them collaborators on individual repositories.":
      '成員只能複製並拉取公開儲存庫。若要授予成員更多存取權，你需要將其加入團隊，或將其設為個別儲存庫的協作者。',
    'Members will be able to clone and pull all repositories.': '成員可以複製並拉取所有儲存庫。',
    'Members will be able to clone, pull, and push all repositories.': '成員可以複製、拉取並推送所有儲存庫。',
    'Members will be able to clone, pull, push, and add new collaborators to all repositories.':
      '成員可以複製、拉取、推送所有儲存庫，並為其新增協作者。',
    'You are about to change the base repository permission for this organization.': '你即將變更此組織的儲存庫基本權限。',
    'Base repository permission removed.': '已移除儲存庫基本權限。',
    // 「Update in progress」+「. Refresh to see if it’s done.」：句号随原文
    'Update in progress': '正在更新',
    '. Refresh to see if it’s done.': '。重新整理以查看是否完成。',
    ". Refresh to see if it's done.": '。重新整理以查看是否完成。',

    // 存储库创建
    'Repository creation': '儲存庫建立',
    'Members will be able to create only selected repository types. Outside collaborators can never create repositories.':
      '成員只能建立選取的儲存庫類型。外部協作者一律無法建立儲存庫。',
    'Members will be able to create public repositories, visible to anyone.': '成員可以建立公開儲存庫，所有人皆可查看。',
    'Members will be able to create private repositories, visible to organization members with permission.':
      '成員可以建立私人儲存庫，僅具備權限的組織成員可以查看。',
    'Members will be able to create internal repositories, visible to all enterprise members.':
      '成員可以建立內部儲存庫，所有企業成員皆可查看。',
    'Why is this option disabled?': '為什麼此選項已停用？',
    'Members can no longer create public or private repositories.': '成員已無法建立公開或私人儲存庫。',
    'Members can now create public repositories.': '成員現在可以建立公開儲存庫。',
    'Members can now create public and private repositories.': '成員現在可以建立公開和私人儲存庫。',
    'Members can now create private repositories.': '成員現在可以建立私人儲存庫。',

    // 存储库复刻
    'Repository forking': '儲存庫分叉',
    'Allow forking of private repositories': '允許分叉私人儲存庫',
    'Allow forking of private and internal repositories': '允許分叉私人和內部儲存庫',
    'If enabled, forking is allowed on private and public repositories. If disabled, forking is only allowed on public repositories. This setting is also configurable per-repository.':
      '啟用後，私人和公開儲存庫都允許分叉。停用後，只允許分叉公開儲存庫。每個儲存庫也可以個別調整此設定。',
    'Repository forking setting updated!': '已更新儲存庫分叉設定！',
    'Repository forking setting not updated. Please try again.': '儲存庫分叉設定未更新。請再試一次。',

    // 存储库讨论（read access → 讀取權限；triage access → 分類權限）
    'Repository discussions': '儲存庫討論',
    'Allow users with read access to create discussions': '允許具有讀取權限的使用者建立討論',
    'If disabled, discussion creation is limited to users with at least triage permission. Users with read access can still comment on discussions.':
      '停用後，只有至少具有分類權限的使用者才能建立討論。具有讀取權限的使用者仍可在討論中留言。',
    'Users with read access to repositories can create new discussions.': '具有儲存庫讀取權限的使用者可以建立新討論。',
    'Only users with at least triage access to repositories can create new discussions.':
      '只有至少具有儲存庫分類權限的使用者才能建立新討論。',

    // 项目基本权限
    'Projects base permissions': '專案基本權限',
    'Projects created by members will default to the selected role below.': '成員建立的專案將預設使用下方選擇的角色。',
    'Members will only be able to see projects that are made public. To give an organization member additional access, they can be added as part of a team or as a collaborator.':
      '成員只能查看已設為公開的專案。若要授予組織成員更多存取權，可以將其加入團隊或新增為協作者。',
    'You are about to change the base projects permission for this organization.': '你即將變更此組織的專案基本權限。',
    "This won't affect any existing projects.": '這不會影響任何現有專案。',
    'This won’t affect any existing projects.': '這不會影響任何現有專案。',
    'Members can see projects.': '成員可以查看專案。',
    'Members can see and make changes to projects.': '成員可以查看並變更專案。',
    'Members can see, make changes to, and add new collaborators to projects.': '成員可以查看、變更專案，並為專案新增協作者。',
    'Projects settings updated for this organization.': '已更新此組織的專案設定。',

    // 页面创建（产品名 Pages → 頁面，见 nav.ts 文件头）
    'Pages creation': '頁面建立',
    'Members will be able to publish sites with only the selected access controls.': '成員只能以選取的存取控制發布網站。',
    'Members will be able to create public sites, visible to anyone.': '成員可以建立公開網站，所有人皆可查看。',
    'Members will be able to create private sites, visible to anyone with permission.': '成員可以建立私人網站，僅具備權限的人可以查看。',

    // 应用访问请求
    'App access requests': '應用程式存取請求',
    'Choose who can request GitHub or OAuth apps to use with resources in this organization':
      '選擇誰可以申請在此組織的資源中使用 GitHub 應用程式或 OAuth 應用程式',
    'Members and outside collaborators': '成員和外部協作者',
    'Both members and outside collaborators can request apps for this organization.': '成員和外部協作者都可以為此組織申請應用程式。',
    'Members only': '僅限成員',
    'Members can request apps, while outside collaborators cannot.': '成員可以申請應用程式，外部協作者則不行。',
    'Disable app access requests': '停用應用程式存取請求',
    'Neither members nor outside collaborators can request apps.': '成員和外部協作者都無法申請應用程式。',
    'Integration access requests': '整合存取請求',
    'Allow integration requests from outside collaborators': '允許外部協作者提出整合請求',
    'Outside collaborators will be able to request access for GitHub or OAuth apps to access this organization and its resources.':
      '外部協作者將可以申請讓 GitHub 應用程式或 OAuth 應用程式存取此組織及其資源。',
    'Outside collaborators can no longer request third party access.': '外部協作者已無法申請第三方存取。',
    'Outside collaborators can now request third party access.': '外部協作者現在可以申請第三方存取。',
    'Allow repository admins to install GitHub Apps for their repositories.': '允許儲存庫管理員為其儲存庫安裝 GitHub 應用程式。',
    'Allow repository admins to install GitHub Apps for their repositories': '允許儲存庫管理員為其儲存庫安裝 GitHub 應用程式',
    "Repository admins will be able to install and configure GitHub Apps on their repositories without requesting first, if the app doesn't require organization or repository administration permissions.":
      '如果應用程式不需要組織或儲存庫管理權限，儲存庫管理員可以直接在其儲存庫上安裝並設定 GitHub 應用程式，無須事先申請。',
    'Repository admins will be able to install and configure GitHub Apps on their repositories without requesting first, if the app doesn’t require organization or repository administration permissions.':
      '如果應用程式不需要組織或儲存庫管理權限，儲存庫管理員可以直接在其儲存庫上安裝並設定 GitHub 應用程式，無須事先申請。',

    // 管理员存储库权限
    'Admin repository permissions': '管理員儲存庫權限',
    'Repository visibility change': '儲存庫可見度變更',
    'Allow members to change repository visibilities for this organization': '允許成員變更此組織的儲存庫可見度',
    'If enabled, members with admin permissions for the repository will be able to change its visibility. If disabled, only organization owners can change repository visibilities.':
      '啟用後，具有儲存庫管理員權限的成員可以變更其可見度。停用後，只有組織擁有者可以變更儲存庫可見度。',
    'Members can now change repository visibility.': '成員現在可以變更儲存庫可見度。',
    'Members can no longer change repository visibility.': '成員已無法變更儲存庫可見度。',
    'Repository deletion and transfer': '儲存庫刪除和轉移',
    'Allow members to delete or transfer repositories for this organization': '允許成員刪除或轉移此組織的儲存庫',
    'If enabled, members with admin permissions for the repository will be able to delete or transfer':
      '啟用後，具有儲存庫管理員權限的成員可以刪除或轉移',
    'repositories. If disabled, only organization owners can delete or transfer repositories.':
      '儲存庫。停用後，只有組織擁有者可以刪除或轉移儲存庫。',
    'Members can now delete or transfer repositories.': '成員現在可以刪除或轉移儲存庫。',
    'Members can no longer delete or transfer repositories.': '成員已無法刪除或轉移儲存庫。',
    'Issue deletion': '議題刪除',
    'Allow repository administrators to delete issues for this organization': '允許儲存庫管理員刪除此組織的議題',
    'Allow members to delete issues for this organization': '允許成員刪除此組織的議題',
    'If enabled, members with admin permissions for the repository will be able to delete issues. If disabled, only organization owners can delete issues.':
      '啟用後，具有儲存庫管理員權限的成員可以刪除議題。停用後，只有組織擁有者可以刪除議題。',
    'Learn more about allowing people to delete issues in your organization': '瞭解如何允許他人刪除組織中的議題',
    'Members can now delete issues.': '成員現在可以刪除議題。',
    'Members can no longer delete issues.': '成員已無法刪除議題。',
    'Branch renames': '分支重新命名',
    'Allow repository administrators to rename branches protected by organization rules': '允許儲存庫管理員重新命名受組織規則保護的分支',
    'If enabled, members with admin permissions for the repository will be able to rename branches targeted by organization-level rulesets, provided the new name is still covered by those same rulesets or the repository admin has bypass permission. If disabled, only organization owners can rename such branches.':
      '啟用後，具有儲存庫管理員權限的成員可以重新命名組織層級規則集所針對的分支，前提是新名稱仍在相同規則集的涵蓋範圍內，或儲存庫管理員具有繞過權限。停用後，只有組織擁有者可以重新命名這類分支。',

    // 成员团队权限、成员组织权限、存储库评论
    'Member team permissions': '成員團隊權限',
    'Team creation rules': '團隊建立規則',
    'Allow members to create teams': '允許成員建立團隊',
    'If enabled, any member of the organization will be able to create new teams. If disabled, only organization owners can create new teams.':
      '啟用後，組織的任何成員都可以建立新團隊。停用後，只有組織擁有者可以建立新團隊。',
    'Members can now create teams.': '成員現在可以建立團隊。',
    'Members can no longer create teams.': '成員已無法建立團隊。',
    'Member organization permissions': '成員組織權限',
    'Allow members to view dependency insights': '允許成員查看相依性洞察',
    'If enabled, members will be able to view dependency insights for this organization.': '啟用後，成員可以查看此組織的相依性洞察。',
    'Repository Comments': '儲存庫留言',
    'Repository comments': '儲存庫留言',
    "Allow members to see comment author's profile name in private repositories": '允許成員在私人儲存庫中查看留言作者的個人檔案名稱',
    'Allow members to see comment author’s profile name in private repositories': '允許成員在私人儲存庫中查看留言作者的個人檔案名稱',

    // 团队讨论
    'Team discussions provide a place for a team to have conversations that span across projects or repositories and that don’t belong in an issue or a pull request.':
      '團隊討論為團隊提供一個空間，用於跨專案或儲存庫、且不適合放在議題或拉取請求中的對話。',
    "Team discussions provide a place for a team to have conversations that span across projects or repositories and that don't belong in an issue or a pull request.":
      '團隊討論為團隊提供一個空間，用於跨專案或儲存庫、且不適合放在議題或拉取請求中的對話。',
    'Enable team discussions for this organization': '為此組織啟用團隊討論',
    // 「…in any team in the」+ 组织名 +「organization.」（common/site.ts 译「組織。」）
    'This allows members to start discussions in any team in the': '這會允許成員在以下組織的任何團隊中發起討論',
    // 「Looking for」+「Organization Discussions」+「? Go to」+「Organization Discussions settings.」
    'Looking for': '在找',
    'Organization Discussions': '組織討論',
    '? Go to': '嗎？前往',
    'Organization Discussions settings.': '組織討論設定。',
    'Team discussions enabled for this organization.': '已為此組織啟用團隊討論。',
    'Team discussions disabled for this organization.': '已為此組織停用團隊討論。',

    // 存储库策略
    "You haven't created any policies": '你尚未建立任何政策',
    'You haven’t created any policies': '你尚未建立任何政策',
    'Define whether members can perform operations on repositories such as delete and transfer.':
      '定義成員能否對儲存庫執行刪除和轉移等動作。',
    // enforce → 強制執行（与规则集词典的整句译法一致）
    "Organization rulesets won't be enforced": '組織規則集不會強制執行',
    'Organization rulesets won’t be enforced': '組織規則集不會強制執行',
    'until you upgrade this organization account to GitHub Team.': '，除非將此組織帳號升級到 GitHub 團隊版。',
    'New policy': '新增政策',
    'Repository policy': '儲存庫政策'
  },
  scoped: {
    // 限制名称的条件（Must match / Must not match）
    Condition: '條件',
    'No permission': '無權限',
    'No access': '無存取權',
    public: '公開',
    private: '私人',
    internal: '內部',

    // 更改基本权限对话框（按钮文字与引号中的权限名分开时）
    'Change base permission': '變更基本權限',
    'Change base permission to': '將基本權限變更為',
    'Change default permission': '變更預設權限',
    'Save privileges': '儲存權限',
    'Default branch': '預設分支',

    // 存储库邀请
    'Repository invitations': '儲存庫邀請',
    'Allow members to invite outside collaborators to repositories for this organization': '允許成員邀請外部協作者加入此組織的儲存庫',
    'If enabled, members with admin permissions for the repository will be able to invite outside collaborators. If disabled, only organization owners can invite outside collaborators.':
      '啟用後，具有儲存庫管理員權限的成員可以邀請外部協作者。停用後，只有組織擁有者可以邀請外部協作者。',

    // 依赖项见解
    'Dependency insights': '相依性洞察',

    // 部署密钥
    'Allow deploy keys': '允許部署金鑰',
    'Members with admin access to repositories can create deploy keys.': '具有儲存庫管理員權限的成員可以建立部署金鑰。',
    'Disabling deploy keys will disable existing deploy keys in all repositories in the organization.':
      '停用部署金鑰會停用組織所有儲存庫中的現有部署金鑰。',
    'Changing this setting to disabled will result in existing deploy keys being disabled in all repositories in the organization.':
      '將此設定改為停用後，組織所有儲存庫中的現有部署金鑰都會停用。',
    'Scripts, apps, or workflows that create, use, or delete deploy keys will no longer work.':
      '建立、使用或刪除部署金鑰的指令碼、應用程式或工作流程將無法再運作。'
  },
  regexp: [
    // 基本权限更改确认：This will change the base permissions for 2 projects.
    [/^This will change the base permissions for (\d+) projects?\.$/, '這將變更 $1 個專案的基本權限。'],
    // 策略列表计数：0 repository policies
    [/^(\d+) repository polic(?:y|ies)$/, '$1 個儲存庫政策'],
    [
      new RegExp(`^Change (base|default) permissions? to ${OPEN_QUOTE}${PERMISSION_SOURCE}${CLOSE_QUOTE}$`),
      (_, kind: string, quote: string, permission: string) =>
        `將${kind === 'base' ? '基本' : '預設'}權限變更為${quotedPermission(quote, permission)}`
    ],
    [
      new RegExp(`^Base repository permission updated to ${OPEN_QUOTE}${PERMISSION_SOURCE}${CLOSE_QUOTE}\\.$`),
      (_, quote: string, permission: string) => `儲存庫基本權限已更新為${quotedPermission(quote, permission)}。`
    ],
    [
      new RegExp(`^Base permission updated to ${OPEN_QUOTE}${PERMISSION_SOURCE}${CLOSE_QUOTE} for projects\\.$`),
      (_, quote: string, permission: string) => `專案基本權限已更新為${quotedPermission(quote, permission)}。`
    ],
    [
      /^This may change the permission that the organization[’']s (\d+) members? ha(?:s|ve) on its (\d+) repositor(?:y|ies)\.$/,
      '這可能會變更組織 $1 位成員對其 $2 個儲存庫的權限。'
    ],
    [/^This will affect (\d+) projects?\.$/, '這將影響 $1 個專案。'],
    [
      new RegExp(`^If enabled, all users with read access can create and comment on discussions in ${ORG}[’']s repositories\\.$`),
      '啟用後，所有具有讀取權限的使用者都可以在 $1 的儲存庫中建立討論並留言。'
    ]
  ],
  inline: [
    ['{} use deploy keys. Disabling deploy keys may break existing workflows.', '{}使用部署金鑰。停用部署金鑰可能導致現有工作流程中斷。'],
    ['Existing deploy keys in {} will disabled.', '{} 中的現有部署金鑰將被停用。']
  ]
} satisfies PageDictionary
