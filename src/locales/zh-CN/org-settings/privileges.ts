import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/** 基本权限名称 */
const PERMISSION_NAMES: Readonly<Record<string, string>> = {
  'No permission': '无权限',
  'No access': '无权限',
  None: '无',
  Read: '读取',
  Write: '写入',
  Admin: '管理员'
}

const PERMISSION_SOURCE = '(No permission|No access|None|Read|Write|Admin)'

/** 权限名两侧可选的引号（直引号或弯引号）；左引号捕获，用来判断原文是否带引号 */
const OPEN_QUOTE = '(["“]?)'
const CLOSE_QUOTE = '["”]?'

/** 权限名：原文带引号才加“”，否则不加 */
function quotedPermission(quote: string, permission: string): string {
  const name = PERMISSION_NAMES[permission] ?? permission
  return quote ? `“${name}”` : name
}

/**
 * 成员权限页（基本权限、存储库创建 / 复刻 / 讨论、项目基本权限、页面创建、应用访问请求、
 * 管理员存储库权限、团队创建）、团队讨论、存储库策略（Policies）。
 * 「Learn more about rulesets.」已由 commits 的 static 收录。
 */
export default {
  static: {
    // 成员权限保存提示
    'Members and outside collaborators are now allowed to make app access requests.': '现在允许成员和外部协作者提交应用访问请求。',
    'Repository admins can now install GitHub Apps.': '存储库管理员现在可以安装 GitHub 应用。',
    'Branch rename settings were updated.': '已更新分支重命名设置。',
    // 成员权限：基本权限为“无”时的说明（“authorized team”版本）
    'Members will only be able to clone and pull public repositories. To give a member additional access, you’ll need to add them to an authorized team or make them a collaborator on individual repositories.':
      '成员只能克隆和拉取公共存储库。要授予成员更多权限，需要将其添加到已授权的团队，或设为单个存储库的协作者。',
    "Members will only be able to clone and pull public repositories. To give a member additional access, you'll need to add them to an authorized team or make them a collaborator on individual repositories.":
      '成员只能克隆和拉取公共存储库。要授予成员更多权限，需要将其添加到已授权的团队，或设为单个存储库的协作者。',
    // 部署密钥页：「… For more information, see <a>the GitHub Apps documentation</a>. Please note … see <a>managing deploy keys</a>.」按文本节点分段
    'Deploy keys use an SSH key to grant readonly or write access to a single repository. If you have a more complex project or want more fine-grain control over permissions, consider using a GitHub App instead. For more information, see':
      '部署密钥使用 SSH 密钥授予对单个存储库的只读或写入权限。如果项目更复杂或需要更细粒度的权限控制，请考虑改用 GitHub 应用。详情请参阅',
    '. Please note that deploy keys are not protected by a passphrase and can be a security risk if your server is compromised. For more information on deploy keys, see':
      '。请注意，部署密钥不受密码短语保护，服务器遭入侵时可能带来安全风险。有关部署密钥的详细信息，请参阅',
    'the GitHub Apps documentation': 'GitHub 应用文档',
    'managing deploy keys': '管理部署密钥',
    'Deploy keys are not allowed to be created and used within this organization. Cloning public repositories will be unaffected by this policy.':
      '不允许在此组织中创建和使用部署密钥。克隆公共存储库不受此策略影响。',
    'Deploy keys are allowed to be created and used within this organization.': '允许在此组织中创建和使用部署密钥。',
    'Are you sure you want to disable deploy keys?': '确定要禁用部署密钥吗？',
    // 存储库策略：空状态「<a>Repository policies</a> define whether …」、新建 / 编辑表单、保存提示
    'Protect your most important repositories': '保护你最重要的存储库',
    'define whether members can perform operations on repositories such as delete and transfer.':
      '定义成员能否对存储库执行删除、转让等操作。',
    'New repository policy': '新建存储库策略',
    'Policy Name': '策略名称',
    'Exempt roles, teams, agents, and apps from this policy by adding them to the allow list.':
      '将角色、团队、智能体和应用添加到允许列表，使其不受此策略约束。',
    'Choose which roles, teams, agents, and apps can bypass this policy': '选择可以绕过此策略的角色、团队、智能体和应用',
    'Repository migrations': '存储库迁移',
    'Which policies should be applied?': '应应用哪些策略？',
    'Restrict visibility': '限制可见性',
    'New repositories and visibility changes are limited to specified visibilities, unless the actor is on the allow list.':
      '新存储库和可见性更改仅限于指定的可见性，允许列表中的参与者除外。',
    'Only allow users on the allow list to create repositories.': '仅允许允许列表中的用户创建存储库。',
    'Only allow users on the allow list to delete repositories.': '仅允许允许列表中的用户删除存储库。',
    'Restrict transfers': '限制转让',
    'Only allow users on the allow list to transfer repositories out of the organization.': '仅允许允许列表中的用户将存储库转让出组织。',
    'Restrict names': '限制名称',
    'New repository names and name changes are limited to the specific patterns, unless the actor is on the allow list or is a transferred repository.':
      '新存储库名称和名称更改仅限于特定模式，允许列表中的参与者或转让来的存储库除外。',
    'Must not match': '不得匹配',
    'Naming pattern': '命名模式',
    'Define the naming pattern using a regular expression.': '使用正则表达式定义命名模式。',
    'Test pattern...': '测试模式...',
    'This policy will be enforced': '将强制实施此策略',
    'This policy will not be enforced': '不会强制实施此策略',
    'Policy created': '策略已创建',
    'Policy updated': '策略已更新',
    'Policy deleted': '策略已删除',
    // 基本权限
    'Member repository permissions': '成员存储库权限',
    'Base permissions': '基本权限',
    'Base permissions to the organization’s repositories apply to all members and excludes outside collaborators. Since organization members can have permissions from multiple sources, members and collaborators who have been granted a higher level of access than the base permissions will retain their higher permission privileges.':
      '组织存储库的基本权限适用于所有成员，不包括外部协作者。由于组织成员的权限可能来自多个来源，被授予高于基本权限的成员和协作者将保留其较高的权限。',
    "Base permissions to the organization's repositories apply to all members and excludes outside collaborators. Since organization members can have permissions from multiple sources, members and collaborators who have been granted a higher level of access than the base permissions will retain their higher permission privileges.":
      '组织存储库的基本权限适用于所有成员，不包括外部协作者。由于组织成员的权限可能来自多个来源，被授予高于基本权限的成员和协作者将保留其较高的权限。',
    'Organization member permissions': '组织成员权限',
    'Members will only be able to clone and pull public repositories. To give a member additional access, you’ll need to add them to teams or make them collaborators on individual repositories.':
      '成员只能克隆和拉取公共存储库。要授予成员更多权限，需要将其添加到团队，或设为单个存储库的协作者。',
    "Members will only be able to clone and pull public repositories. To give a member additional access, you'll need to add them to teams or make them collaborators on individual repositories.":
      '成员只能克隆和拉取公共存储库。要授予成员更多权限，需要将其添加到团队，或设为单个存储库的协作者。',
    'Members will be able to clone and pull all repositories.': '成员可以克隆和拉取所有存储库。',
    'Members will be able to clone, pull, and push all repositories.': '成员可以克隆、拉取和推送所有存储库。',
    'Members will be able to clone, pull, push, and add new collaborators to all repositories.':
      '成员可以克隆、拉取、推送所有存储库，并为其添加新的协作者。',
    'You are about to change the base repository permission for this organization.': '你即将更改此组织的存储库基本权限。',
    'Base repository permission removed.': '已删除存储库基本权限。',
    // 「Update in progress」+「. Refresh to see if it’s done.」：句号随原文
    'Update in progress': '正在更新',
    '. Refresh to see if it’s done.': '。刷新页面查看是否完成。',
    ". Refresh to see if it's done.": '。刷新页面查看是否完成。',

    // 存储库创建
    'Repository creation': '存储库创建',
    'Members will be able to create only selected repository types. Outside collaborators can never create repositories.':
      '成员只能创建所选类型的存储库。外部协作者始终无法创建存储库。',
    'Members will be able to create public repositories, visible to anyone.': '成员可以创建对所有人可见的公共存储库。',
    'Members will be able to create private repositories, visible to organization members with permission.':
      '成员可以创建专用存储库，仅对有权限的组织成员可见。',
    'Members will be able to create internal repositories, visible to all enterprise members.':
      '成员可以创建内部存储库，对所有企业成员可见。',
    'Why is this option disabled?': '为什么此选项被禁用？',
    'Members can no longer create public or private repositories.': '成员已无法创建公共或专用存储库。',
    'Members can now create public repositories.': '成员现在可以创建公共存储库。',
    'Members can now create public and private repositories.': '成员现在可以创建公共和专用存储库。',
    'Members can now create private repositories.': '成员现在可以创建专用存储库。',

    // 存储库复刻
    'Repository forking': '存储库复刻',
    'Allow forking of private repositories': '允许复刻专用存储库',
    'Allow forking of private and internal repositories': '允许复刻专用和内部存储库',
    'If enabled, forking is allowed on private and public repositories. If disabled, forking is only allowed on public repositories. This setting is also configurable per-repository.':
      '启用后，专用和公共存储库都允许复刻。禁用后，仅允许复刻公共存储库。也可以按存储库单独配置此设置。',
    'Repository forking setting updated!': '已更新存储库复刻设置！',
    'Repository forking setting not updated. Please try again.': '存储库复刻设置未更新。请重试。',

    // 存储库讨论（read access → 读取访问权限；triage access → 分类权限）
    'Repository discussions': '存储库讨论',
    'Allow users with read access to create discussions': '允许拥有读取访问权限的用户创建讨论',
    'If disabled, discussion creation is limited to users with at least triage permission. Users with read access can still comment on discussions.':
      '禁用后，只有至少拥有分类权限的用户才能创建讨论。拥有读取访问权限的用户仍可在讨论中发表评论。',
    'Users with read access to repositories can create new discussions.': '拥有存储库读取访问权限的用户可以创建新讨论。',
    'Only users with at least triage access to repositories can create new discussions.':
      '只有至少拥有存储库分类权限的用户才能创建新讨论。',

    // 项目基本权限
    'Projects base permissions': '项目基本权限',
    'Projects created by members will default to the selected role below.': '成员创建的项目将默认使用下方所选角色。',
    'Members will only be able to see projects that are made public. To give an organization member additional access, they can be added as part of a team or as a collaborator.':
      '成员只能查看已设为公共的项目。要授予组织成员更多权限，可以将其加入团队或添加为协作者。',
    'You are about to change the base projects permission for this organization.': '你即将更改此组织的项目基本权限。',
    "This won't affect any existing projects.": '这不会影响任何现有项目。',
    'This won’t affect any existing projects.': '这不会影响任何现有项目。',
    'Members can see projects.': '成员可以查看项目。',
    'Members can see and make changes to projects.': '成员可以查看和更改项目。',
    'Members can see, make changes to, and add new collaborators to projects.': '成员可以查看、更改项目，并为项目添加新的协作者。',
    'Projects settings updated for this organization.': '已更新此组织的项目设置。',

    // 页面创建（产品名 Pages → 页面，见 nav.ts 文件头）
    'Pages creation': '页面创建',
    'Members will be able to publish sites with only the selected access controls.': '成员只能以所选的访问控制发布站点。',
    'Members will be able to create public sites, visible to anyone.': '成员可以创建对所有人可见的公共站点。',
    'Members will be able to create private sites, visible to anyone with permission.': '成员可以创建专用站点，仅对有权限的人可见。',

    // 应用访问请求
    'App access requests': '应用访问请求',
    'Choose who can request GitHub or OAuth apps to use with resources in this organization':
      '选择谁可以申请在此组织的资源中使用 GitHub 应用或 OAuth 应用',
    'Members and outside collaborators': '成员和外部协作者',
    'Both members and outside collaborators can request apps for this organization.': '成员和外部协作者都可以为此组织申请应用。',
    'Members only': '仅成员',
    'Members can request apps, while outside collaborators cannot.': '成员可以申请应用，外部协作者不可以。',
    'Disable app access requests': '禁用应用访问请求',
    'Neither members nor outside collaborators can request apps.': '成员和外部协作者都无法申请应用。',
    'Integration access requests': '集成访问请求',
    'Allow integration requests from outside collaborators': '允许外部协作者发起集成请求',
    'Outside collaborators will be able to request access for GitHub or OAuth apps to access this organization and its resources.':
      '外部协作者将能够申请让 GitHub 应用或 OAuth 应用访问此组织及其资源。',
    'Outside collaborators can no longer request third party access.': '外部协作者已无法申请第三方访问。',
    'Outside collaborators can now request third party access.': '外部协作者现在可以申请第三方访问。',
    'Allow repository admins to install GitHub Apps for their repositories.': '允许存储库管理员为其存储库安装 GitHub 应用。',
    'Allow repository admins to install GitHub Apps for their repositories': '允许存储库管理员为其存储库安装 GitHub 应用',
    "Repository admins will be able to install and configure GitHub Apps on their repositories without requesting first, if the app doesn't require organization or repository administration permissions.":
      '如果应用不需要组织或存储库管理权限，存储库管理员无需申请即可在其存储库上安装和配置 GitHub 应用。',
    'Repository admins will be able to install and configure GitHub Apps on their repositories without requesting first, if the app doesn’t require organization or repository administration permissions.':
      '如果应用不需要组织或存储库管理权限，存储库管理员无需申请即可在其存储库上安装和配置 GitHub 应用。',

    // 管理员存储库权限
    'Admin repository permissions': '管理员存储库权限',
    'Repository visibility change': '存储库可见性更改',
    'Allow members to change repository visibilities for this organization': '允许成员更改此组织的存储库可见性',
    'If enabled, members with admin permissions for the repository will be able to change its visibility. If disabled, only organization owners can change repository visibilities.':
      '启用后，拥有存储库管理员权限的成员可以更改其可见性。禁用后，只有组织所有者可以更改存储库可见性。',
    'Members can now change repository visibility.': '成员现在可以更改存储库可见性。',
    'Members can no longer change repository visibility.': '成员已无法更改存储库可见性。',
    'Repository deletion and transfer': '存储库删除和转让',
    'Allow members to delete or transfer repositories for this organization': '允许成员删除或转让此组织的存储库',
    'If enabled, members with admin permissions for the repository will be able to delete or transfer':
      '启用后，拥有存储库管理员权限的成员可以删除或转让',
    'repositories. If disabled, only organization owners can delete or transfer repositories.':
      '存储库。禁用后，只有组织所有者可以删除或转让存储库。',
    'Members can now delete or transfer repositories.': '成员现在可以删除或转让存储库。',
    'Members can no longer delete or transfer repositories.': '成员已无法删除或转让存储库。',
    'Issue deletion': '议题删除',
    'Allow repository administrators to delete issues for this organization': '允许存储库管理员删除此组织的议题',
    'Allow members to delete issues for this organization': '允许成员删除此组织的议题',
    'If enabled, members with admin permissions for the repository will be able to delete issues. If disabled, only organization owners can delete issues.':
      '启用后，拥有存储库管理员权限的成员可以删除议题。禁用后，只有组织所有者可以删除议题。',
    'Learn more about allowing people to delete issues in your organization': '了解如何允许他人删除组织中的议题',
    'Members can now delete issues.': '成员现在可以删除议题。',
    'Members can no longer delete issues.': '成员已无法删除议题。',
    'Branch renames': '分支重命名',
    'Allow repository administrators to rename branches protected by organization rules': '允许存储库管理员重命名受组织规则保护的分支',
    'If enabled, members with admin permissions for the repository will be able to rename branches targeted by organization-level rulesets, provided the new name is still covered by those same rulesets or the repository admin has bypass permission. If disabled, only organization owners can rename such branches.':
      '启用后，拥有存储库管理员权限的成员可以重命名组织级规则集所针对的分支，前提是新名称仍在相同规则集的范围内，或存储库管理员拥有绕过权限。禁用后，只有组织所有者可以重命名此类分支。',

    // 成员团队权限、成员组织权限、存储库评论
    'Member team permissions': '成员团队权限',
    'Team creation rules': '团队创建规则',
    'Allow members to create teams': '允许成员创建团队',
    'If enabled, any member of the organization will be able to create new teams. If disabled, only organization owners can create new teams.':
      '启用后，组织的任何成员都可以创建新团队。禁用后，只有组织所有者可以创建新团队。',
    'Members can now create teams.': '成员现在可以创建团队。',
    'Members can no longer create teams.': '成员已无法创建团队。',
    'Member organization permissions': '成员组织权限',
    'Allow members to view dependency insights': '允许成员查看依赖项洞察',
    'If enabled, members will be able to view dependency insights for this organization.': '启用后，成员可以查看此组织的依赖项洞察。',
    'Repository Comments': '存储库评论',
    'Repository comments': '存储库评论',
    "Allow members to see comment author's profile name in private repositories": '允许成员在专用存储库中查看评论作者的个人资料名称',
    'Allow members to see comment author’s profile name in private repositories': '允许成员在专用存储库中查看评论作者的个人资料名称',

    // 团队讨论
    'Team discussions provide a place for a team to have conversations that span across projects or repositories and that don’t belong in an issue or a pull request.':
      '团队讨论为团队提供了一个交流场所，适合跨项目或存储库、且不适合放在议题或拉取请求中的对话。',
    "Team discussions provide a place for a team to have conversations that span across projects or repositories and that don't belong in an issue or a pull request.":
      '团队讨论为团队提供了一个交流场所，适合跨项目或存储库、且不适合放在议题或拉取请求中的对话。',
    'Enable team discussions for this organization': '为此组织启用团队讨论',
    'This allows members to start discussions in any team in the': '这将允许成员在以下组织的任何团队中开始讨论',
    'Looking for': '要找',
    'Organization Discussions': '组织讨论',
    '? Go to': '吗？请转到',
    'Organization Discussions settings.': '组织讨论设置。',
    'Team discussions enabled for this organization.': '已为此组织启用团队讨论。',
    'Team discussions disabled for this organization.': '已为此组织禁用团队讨论。',

    // 存储库策略
    "You haven't created any policies": '尚未创建任何策略',
    'You haven’t created any policies': '尚未创建任何策略',
    'Define whether members can perform operations on repositories such as delete and transfer.':
      '定义成员能否对存储库执行删除、转让等操作。',
    // enforce → 强制实施（与规则集词典的整句译法一致）
    "Organization rulesets won't be enforced": '组织规则集不会强制实施',
    'Organization rulesets won’t be enforced': '组织规则集不会强制实施',
    'until you upgrade this organization account to GitHub Team.': '，除非将此组织帐户升级到 GitHub 团队版。',
    'New policy': '新建策略',
    'Repository policy': '存储库策略'
  },
  scoped: {
    // 限制名称的条件（Must match / Must not match）
    Condition: '条件',
    'No permission': '无权限',
    'No access': '无权限',
    public: '公共',
    private: '专用',
    internal: '内部',

    // 更改基本权限对话框（按钮文字与引号中的权限名分开时）
    'Change base permission': '更改基本权限',
    'Change base permission to': '将基本权限更改为',
    'Change default permission': '更改默认权限',
    'Save privileges': '保存权限',
    'Default branch': '默认分支',

    // 存储库邀请
    'Repository invitations': '存储库邀请',
    'Allow members to invite outside collaborators to repositories for this organization': '允许成员邀请外部协作者加入此组织的存储库',
    'If enabled, members with admin permissions for the repository will be able to invite outside collaborators. If disabled, only organization owners can invite outside collaborators.':
      '启用后，拥有存储库管理员权限的成员可以邀请外部协作者。禁用后，只有组织所有者可以邀请外部协作者。',

    // 依赖项洞察
    'Dependency insights': '依赖项洞察',

    // 部署密钥
    'Allow deploy keys': '允许部署密钥',
    'Members with admin access to repositories can create deploy keys.': '拥有存储库管理员权限的成员可以创建部署密钥。',
    'Disabling deploy keys will disable existing deploy keys in all repositories in the organization.':
      '禁用部署密钥将禁用组织所有存储库中的现有部署密钥。',
    'Changing this setting to disabled will result in existing deploy keys being disabled in all repositories in the organization.':
      '将此设置改为禁用后，组织所有存储库中的现有部署密钥都将被禁用。',
    'Scripts, apps, or workflows that create, use, or delete deploy keys will no longer work.':
      '创建、使用或删除部署密钥的脚本、应用或工作流将无法继续运行。'
  },
  regexp: [
    // 基本权限更改确认：This will change the base permissions for 2 projects.
    [/^This will change the base permissions for (\d+) projects?\.$/, '这将更改 $1 个项目的基本权限。'],
    // 策略列表计数：0 repository policies
    [/^(\d+) repository polic(?:y|ies)$/, '$1 个存储库策略'],
    [
      new RegExp(`^Change (base|default) permissions? to ${OPEN_QUOTE}${PERMISSION_SOURCE}${CLOSE_QUOTE}$`),
      (_, kind: string, quote: string, permission: string) =>
        `将${kind === 'base' ? '基本' : '默认'}权限更改为${quotedPermission(quote, permission)}`
    ],
    [
      new RegExp(`^Base repository permission updated to ${OPEN_QUOTE}${PERMISSION_SOURCE}${CLOSE_QUOTE}\\.$`),
      (_, quote: string, permission: string) => `存储库基本权限已更新为${quotedPermission(quote, permission)}。`
    ],
    [
      new RegExp(`^Base permission updated to ${OPEN_QUOTE}${PERMISSION_SOURCE}${CLOSE_QUOTE} for projects\\.$`),
      (_, quote: string, permission: string) => `项目基本权限已更新为${quotedPermission(quote, permission)}。`
    ],
    [
      /^This may change the permission that the organization[’']s (\d+) members? ha(?:s|ve) on its (\d+) repositor(?:y|ies)\.$/,
      '这可能会改变组织 $1 个成员对其 $2 个存储库的权限。'
    ],
    [/^This will affect (\d+) projects?\.$/, '这将影响 $1 个项目。'],
    [
      new RegExp(`^If enabled, all users with read access can create and comment on discussions in ${ORG}[’']s repositories\\.$`),
      '启用后，所有拥有读取访问权限的用户都可以在 $1 的存储库中创建讨论并发表评论。'
    ]
  ],
  inline: [
    ['{} use deploy keys. Disabling deploy keys may break existing workflows.', '{}使用部署密钥。禁用部署密钥可能导致现有工作流中断。'],
    ['Existing deploy keys in {} will disabled.', '{} 中的现有部署密钥将被禁用。']
  ]
} satisfies PageDictionary
