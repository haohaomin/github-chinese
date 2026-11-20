import type { PageDictionary } from '../../../core/types'

/**
 * 人员管理（/orgs/<组织>/people、outside-collaborators、pending_collaborators、invitations 等）。
 * 这些页面属于 organization 页面类型，本词典的 scoped / regexp 不生效，只能放 static；
 * 通用短词（Owner、Member、Role、Visibility 等）与含数量、用户名的句子（N members selected… 等）
 * 由 organization / common 词典负责。
 */
export default {
  static: {
    // 人员：批量选择、双因素身份验证标记、角色说明、转换为外部协作者、删除直接成员身份
    'Select all members': '选择所有成员',
    '2FA enabled': '已启用双因素身份验证',
    'Has full administrative access to the entire organization.': '拥有对整个组织的完全管理权限。',
    'Can see every member and non-secret team in the organization, and can create new repositories.':
      '可以查看组织中的每个成员和非机密团队，并可以创建新存储库。',
    'Members cannot be converted to outside collaborators when membership through an identity provider group or enterprise team prevents removal from the organization.':
      '如果通过身份提供商组或企业团队获得的成员身份阻止将成员移出组织，则无法将其转换为外部协作者。',
    'Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization’s repositories will be lost. If the user does not have access to any repositories, they will be removed from the organization.':
      '他们将成为其团队授权访问的所有存储库的协作者，以保留存储库访问权限。他们会保留对之前已是协作者的存储库的访问权限，但会失去对此组织存储库的其他所有访问权限。如果用户无权访问任何存储库，将被移出组织。',
    "Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization's repositories will be lost. If the user does not have access to any repositories, they will be removed from the organization.":
      '他们将成为其团队授权访问的所有存储库的协作者，以保留存储库访问权限。他们会保留对之前已是协作者的存储库的访问权限，但会失去对此组织存储库的其他所有访问权限。如果用户无权访问任何存储库，将被移出组织。',
    'Direct membership for the following members will be removed:': '将删除以下成员的直接成员身份：',
    // 左侧栏与标题片段
    Invitations: '邀请',
    'Security Managers': '安全管理员',
    'Pending Members': '待定成员',
    'Outside Collaborators': '外部协作者',
    'Pending Collaborators': '待定协作者',
    'Failed Invitations': '失败的邀请',

    // 组织角色名（人员页与组织设置页共用）
    'Billing manager': '账单管理员',
    'Security manager': '安全管理员',
    'Security managers': '安全管理员',

    // 成员列表
    'You are the only owner of this organization! We recommend a minimum of two people within each organization have the owner role.':
      '你是此组织唯一的所有者！建议每个组织至少有两人担任所有者角色。',
    Insecure: '不安全',
    Membership: '成员身份',
    'Filter by membership': '按成员身份筛选',
    'Membership via:': '成员身份来源：',
    'direct assignment': '直接分配',
    'Organization visibility': '组织可见性',
    'Your membership is visible to everyone and is displayed on your public profile.':
      '你的成员身份对所有人可见，并显示在你的公开个人资料中。',
    'Your membership is only visible to other members of this organization.': '你的成员身份仅对此组织的其他成员可见。',
    'Owners have full access to teams, settings, and repositories.': '所有者拥有对团队、设置和存储库的完全访问权限。',
    'Member settings': '成员设置',
    'Set role': '设置角色',
    'Select a new role': '选择新角色',
    'Change role…': '更改角色…',
    'Change role...': '更改角色...',
    'Convert to outside collaborator…': '转换为外部协作者…',
    'Convert to outside collaborator...': '转换为外部协作者...',
    'Remove from organization…': '从组织中删除…',
    'Remove from organization...': '从组织中删除...',
    'Remove from organization': '从组织中删除',
    'This organization has no public members.': '此组织没有公开成员。',
    'You publicized 1 membership.': '你已公开 1 个成员身份。',
    'You concealed 1 membership.': '你已隐藏 1 个成员身份。',

    // 邀请对话框
    'Authenticate members with': '验证成员身份时使用',
    'SAML single sign-on': 'SAML 单一登录',
    'Try it in a 30-day trial of GitHub Enterprise.': '可在 GitHub 企业版 30 天试用中体验。',

    // 转换为外部协作者 / 删除成员
    'Converting members to outside collaborators will remove them from this organization and from all teams, and if they do not currently have access to any private repositories in the organization their seat will be reclaimed.':
      '将成员转换为外部协作者会将其移出此组织和所有团队；如果他们当前无权访问组织中的任何专用存储库，其席位将被收回。',
    'Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization’s repositories will be lost.':
      '他们将成为其团队授权访问的所有存储库的协作者，以保留存储库访问权限。他们会保留对之前已是协作者的存储库的访问权限，但会失去对此组织存储库的其他所有访问权限。',
    "Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization's repositories will be lost.":
      '他们将成为其团队授权访问的所有存储库的协作者，以保留存储库访问权限。他们会保留对之前已是协作者的存储库的访问权限，但会失去对此组织存储库的其他所有访问权限。',
    'Convert to outside collaborator': '转换为外部协作者',
    "You can't remove yourself from the organization. Have another admin do this for you.": '无法将自己移出组织。请让其他管理员操作。',
    'You can’t remove yourself from the organization. Have another admin do this for you.': '无法将自己移出组织。请让其他管理员操作。',
    'The following members will be removed:': '将删除以下成员：',
    'Remove members': '删除成员',
    'Remove member': '删除成员',
    "You can't remove the last owner of this organization.": '无法删除此组织的最后一个所有者。',
    'You can’t remove the last owner of this organization.': '无法删除此组织的最后一个所有者。',

    // 外部协作者、待定协作者
    'Find a collaborator…': '查找协作者…',
    'No one outside of the organization has access to its repositories.': '组织外部没有人可以访问其存储库。',
    'Find a pending collaborator…': '查找待定协作者…',
    'Find a pending collaborator...': '查找待定协作者...',
    "There aren't any pending collaborators.": '暂无待定协作者。',
    'There aren’t any pending collaborators.': '暂无待定协作者。',
    'Cancel invitations for pending collaborators': '取消待定协作者的邀请',
    'Remove from all repositories': '从所有存储库中删除',
    'Remove outside collaborators': '删除外部协作者',
    'Manage access': '管理访问权限',
    'Remove access to this repository': '删除此存储库的访问权限',
    'Invite to organization': '邀请加入组织',
    'Convert to member': '转换为成员',
    'Invite as member': '邀请为成员',

    // 待定 / 失败的邀请
    'Find an invitation…': '查找邀请…',
    'Find an invitation...': '查找邀请...',
    'Filter by invitation source': '按邀请来源筛选',
    'All sources': '所有来源',
    'Sort Order': '排序顺序',
    'No matching invitations.': '没有匹配的邀请。',
    'Edit invitation': '编辑邀请',
    'Cancel invitation': '取消邀请',
    'The following invitations will be canceled:': '将取消以下邀请：',
    'Cancel invitations': '取消邀请',
    'Retry invitation': '重试邀请',
    'Resend invitation': '重新发送邀请',
    'Pending invitation': '待定邀请',
    'Invited by': '邀请人',
    Invited: '已邀请',
    Requested: '已请求',
    'Membership requested': '已申请加入',
    'No failed invitations.': '暂无失败的邀请。',
    'Find a security manager…': '查找安全管理员…',
    'Find a security manager...': '查找安全管理员...',

    // 邀请 / 编辑邀请页
    'Invite a member': '邀请成员',
    'Add to teams': '添加到团队',
    'Give them an appropriate role in the organization and add them to some teams to give access to repositories.':
      '为其分配合适的组织角色，并将其添加到团队以授予存储库访问权限。',
    'Role in the organization': '组织中的角色',
    'Members can see all other members, and can be granted access to repositories. They can also create new teams and repositories.':
      '成员可以看到所有其他成员，并可被授予存储库访问权限。他们还可以创建新团队和存储库。',
    'Owners have full administrative rights to the organization and have complete access to all repositories and teams.':
      '所有者拥有组织的完全管理权限，并可完全访问所有存储库和团队。',
    'Send invitation': '发送邀请',
    'Originally invited by': '最初邀请人',
    'Update invitation': '更新邀请',

    // 恢复前成员
    Reinstate: '恢复',
    'Invite and reinstate': '邀请并恢复',
    'Invite and start fresh': '邀请并重新开始',

    // 导出成员列表
    'Export as JSON': '导出为 JSON'
  }
} satisfies PageDictionary
