import type { PageDictionary } from '../../../core/types'

/**
 * 人员管理（/orgs/<组织>/people、outside-collaborators、pending_collaborators、invitations 等）。
 * 这些页面属于 organization 页面类型，本词典的 scoped / regexp 不生效，只能放 static；
 * 通用短词（Owner、Member、Role、Visibility 等）与含数量、用户名的句子（N members selected… 等）
 * 由 organization / common 词典负责。
 * 术语：pending collaborators / members → 待加入的協作者 / 待加入的成員，pending invitation → 待處理的邀請，
 * billing manager → 帳務管理員，seat → 席次，remove → 移除，组织成员身分 private → 不公開，reinstate → 還原。
 */
export default {
  static: {
    // 人员：批量选择、双因素身份验证标记、角色说明、转换为外部协作者、删除直接成员身份
    'Select all members': '選擇所有成員',
    '2FA enabled': '已啟用雙重驗證',
    'Has full administrative access to the entire organization.': '擁有整個組織的完整管理權限。',
    'Can see every member and non-secret team in the organization, and can create new repositories.':
      '可以查看組織中的每位成員和非祕密團隊，並可以建立新儲存庫。',
    'Members cannot be converted to outside collaborators when membership through an identity provider group or enterprise team prevents removal from the organization.':
      '如果透過身分識別提供者群組或企業團隊取得的成員資格阻止將成員從組織中移除，則無法將其轉換為外部協作者。',
    'Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization’s repositories will be lost. If the user does not have access to any repositories, they will be removed from the organization.':
      '對方將成為其團隊授予存取權之所有儲存庫的協作者，以保留儲存庫存取權。對方會保留原本已是協作者之儲存庫的存取權，但會失去此組織儲存庫的其他所有存取權。如果使用者無權存取任何儲存庫，將從組織中移除。',
    "Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization's repositories will be lost. If the user does not have access to any repositories, they will be removed from the organization.":
      '對方將成為其團隊授予存取權之所有儲存庫的協作者，以保留儲存庫存取權。對方會保留原本已是協作者之儲存庫的存取權，但會失去此組織儲存庫的其他所有存取權。如果使用者無權存取任何儲存庫，將從組織中移除。',
    'Direct membership for the following members will be removed:': '將移除以下成員的直接成員資格：',
    // 左侧栏与标题片段
    Invitations: '邀請',
    'Security Managers': '安全性管理員',
    'Pending Members': '待加入的成員',
    'Outside Collaborators': '外部協作者',
    'Pending Collaborators': '待加入的協作者',
    'Failed Invitations': '失敗的邀請',

    // 组织角色名（人员页与组织设置页共用）
    'Billing manager': '帳務管理員',
    'Security manager': '安全性管理員',
    'Security managers': '安全性管理員',

    // 成员列表
    'You are the only owner of this organization! We recommend a minimum of two people within each organization have the owner role.':
      '你是此組織唯一的擁有者！建議每個組織至少有兩人擔任擁有者角色。',
    Insecure: '不安全',
    Membership: '成員身分',
    'Filter by membership': '依成員身分篩選',
    'Membership via:': '成員身分來源：',
    'direct assignment': '直接指派',
    'Organization visibility': '組織可見度',
    'Your membership is visible to everyone and is displayed on your public profile.':
      '你的成員身分對所有人可見，並顯示在你的公開個人檔案中。',
    'Your membership is only visible to other members of this organization.': '只有此組織的其他成員能看到你的成員身分。',
    'Owners have full access to teams, settings, and repositories.': '擁有者對團隊、設定和儲存庫具有完整存取權。',
    'Member settings': '成員設定',
    'Set role': '設定角色',
    'Select a new role': '選擇新角色',
    'Change role…': '變更角色…',
    'Change role...': '變更角色...',
    'Convert to outside collaborator…': '轉換為外部協作者…',
    'Convert to outside collaborator...': '轉換為外部協作者...',
    'Remove from organization…': '從組織中移除…',
    'Remove from organization...': '從組織中移除...',
    'Remove from organization': '從組織中移除',
    'This organization has no public members.': '此組織沒有公開成員。',
    'You publicized 1 membership.': '你已公開 1 個成員身分。',
    'You concealed 1 membership.': '你已將 1 個成員身分設為不公開。',

    // 邀请对话框
    'Authenticate members with': '驗證成員身分時使用',
    'SAML single sign-on': 'SAML 單一登入',
    'Try it in a 30-day trial of GitHub Enterprise.': '可在 GitHub 企業版 30 天試用期間體驗。',

    // 转换为外部协作者 / 删除成员
    'Converting members to outside collaborators will remove them from this organization and from all teams, and if they do not currently have access to any private repositories in the organization their seat will be reclaimed.':
      '將成員轉換為外部協作者會將其移出此組織和所有團隊；若對方目前無法存取組織中的任何私人儲存庫，其席次將會收回。',
    'Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization’s repositories will be lost.':
      '對方將成為其團隊授予存取權之所有儲存庫的協作者，以保留儲存庫存取權。對方會保留原本已是協作者之儲存庫的存取權，但會失去此組織儲存庫的其他所有存取權。',
    "Their repository access will be preserved by making them collaborators on all repositories that their teams gave them access to. They will retain access to repositories that they were previously collaborators on, but all other access to this organization's repositories will be lost.":
      '對方將成為其團隊授予存取權之所有儲存庫的協作者，以保留儲存庫存取權。對方會保留原本已是協作者之儲存庫的存取權，但會失去此組織儲存庫的其他所有存取權。',
    'Convert to outside collaborator': '轉換為外部協作者',
    "You can't remove yourself from the organization. Have another admin do this for you.": '你無法將自己移出組織。請其他管理員代為處理。',
    'You can’t remove yourself from the organization. Have another admin do this for you.': '你無法將自己移出組織。請其他管理員代為處理。',
    'The following members will be removed:': '將移除下列成員：',
    'Remove members': '移除成員',
    'Remove member': '移除成員',
    "You can't remove the last owner of this organization.": '你無法移除此組織的最後一位擁有者。',
    'You can’t remove the last owner of this organization.': '你無法移除此組織的最後一位擁有者。',

    // 外部协作者、待定协作者
    'Find a collaborator…': '尋找協作者…',
    'No one outside of the organization has access to its repositories.': '組織以外沒有任何人可以存取其儲存庫。',
    'Find a pending collaborator…': '尋找待加入的協作者…',
    'Find a pending collaborator...': '尋找待加入的協作者...',
    "There aren't any pending collaborators.": '沒有待加入的協作者。',
    'There aren’t any pending collaborators.': '沒有待加入的協作者。',
    'Cancel invitations for pending collaborators': '取消待加入協作者的邀請',
    'Remove from all repositories': '從所有儲存庫中移除',
    'Remove outside collaborators': '移除外部協作者',
    'Manage access': '管理存取權',
    'Remove access to this repository': '移除此儲存庫的存取權',
    'Invite to organization': '邀請加入組織',
    'Convert to member': '轉換為成員',
    'Invite as member': '邀請成為成員',

    // 待定 / 失败的邀请
    'Find an invitation…': '尋找邀請…',
    'Find an invitation...': '尋找邀請...',
    'Filter by invitation source': '依邀請來源篩選',
    'All sources': '所有來源',
    'Sort Order': '排序順序',
    'No matching invitations.': '沒有相符的邀請。',
    'Edit invitation': '編輯邀請',
    'Cancel invitation': '取消邀請',
    'The following invitations will be canceled:': '將取消下列邀請：',
    'Cancel invitations': '取消邀請',
    'Retry invitation': '重試邀請',
    'Resend invitation': '重新傳送邀請',
    'Pending invitation': '待處理的邀請',
    'Invited by': '邀請者',
    Invited: '已邀請',
    Requested: '已請求',
    'Membership requested': '已申請加入',
    'No failed invitations.': '沒有失敗的邀請。',
    'Find a security manager…': '尋找安全性管理員…',
    'Find a security manager...': '尋找安全性管理員...',

    // 邀请 / 编辑邀请页
    'Invite a member': '邀請成員',
    'Add to teams': '加入團隊',
    'Give them an appropriate role in the organization and add them to some teams to give access to repositories.':
      '為對方指派適當的組織角色，並將其加入團隊以授予儲存庫存取權。',
    'Role in the organization': '組織中的角色',
    'Members can see all other members, and can be granted access to repositories. They can also create new teams and repositories.':
      '成員可以看到所有其他成員，也可以獲得儲存庫存取權。成員還可以建立新團隊和儲存庫。',
    'Owners have full administrative rights to the organization and have complete access to all repositories and teams.':
      '擁有者具有組織的完整管理權限，並可完整存取所有儲存庫和團隊。',
    'Send invitation': '傳送邀請',
    'Originally invited by': '最初邀請者',
    'Update invitation': '更新邀請',

    // 恢复前成员
    Reinstate: '還原',
    'Invite and reinstate': '邀請並還原',
    'Invite and start fresh': '邀請並重新開始',

    // 导出成员列表
    'Export as JSON': '匯出為 JSON'
  }
} satisfies PageDictionary
