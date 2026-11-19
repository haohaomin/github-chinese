import type { PageDictionary } from '../../../core/types'

/**
 * 团队（/orgs/<组织>/teams、new-team、teams/<团队>/…）：列表介绍、加入申请、新建团队表单、
 * 团队设置（常规、代码审查自动分配、删除）、批量操作、父团队与子团队。
 * 这些页面属于 organization 页面类型，只能放 static；「New team」「Child teams」「Parent team」
 * 「Add a member」「Find a team…」及含数量的句子（N teams selected 等）由 organization 词典收录。
 * 术语：secret team → 祕密團隊，visibility → 可見度，assign → 指派，Remove → 移除，request to join → 申請加入。
 */
export default {
  static: {
    // 团队列表（无团队时的介绍）
    'Seamless communication with teams': '透過團隊無縫溝通',
    'Teams are a great way for groups of people to communicate and work on code together. Take a look at why they’re great.':
      '團隊是讓一群人溝通並協作處理程式碼的絕佳方式。看看團隊的優點。',
    "Teams are a great way for groups of people to communicate and work on code together. Take a look at why they're great.":
      '團隊是讓一群人溝通並協作處理程式碼的絕佳方式。看看團隊的優點。',
    'Flexible repository access': '彈性的儲存庫存取權',
    'You can add repositories to your teams with more flexible levels of access (Admin, Write, Read).':
      '你可以用更有彈性的存取層級（管理員、寫入、讀取）將儲存庫加入團隊。',
    'Request to join teams': '申請加入團隊',
    'Members can quickly request to join any team. An owner or team maintainer can approve the request.':
      '成員可以快速申請加入任何團隊。擁有者或團隊維護者可以核准申請。',
    'Team mentions': '團隊提及',
    // 「Use team @mentions (ex.」+ <code>@org/team</code> +「for the entire team) in any comment, issue, or pull request.」
    'Use team @mentions (ex.': '在任何留言、議題或拉取請求中使用團隊 @提及（例如',
    'for the entire team) in any comment, issue, or pull request.': '代表整個團隊）。',
    'Learn more about teams': '瞭解團隊',
    'Team members': '團隊成員',
    'Team maintainers': '團隊維護者',
    'Members of this team': '此團隊的成員',
    'My teams': '我的團隊',
    'No members': '尚無成員',
    "This team doesn't have any members.": '此團隊沒有任何成員。',
    'This team doesn’t have any members.': '此團隊沒有任何成員。',
    "This team doesn't have any child teams.": '此團隊沒有任何子團隊。',
    'This team doesn’t have any child teams.': '此團隊沒有任何子團隊。',
    "This team doesn't have access to any repositories.": '此團隊沒有任何儲存庫的存取權。',
    'This team doesn’t have access to any repositories.': '此團隊沒有任何儲存庫的存取權。',
    'Synced team': '已同步的團隊',
    'Identity provider groups': '身分識別提供者群組',
    // 团队同步：外部组与团队成员不一致
    'View Sync Mismatches': '查看同步不一致項目',
    'External Group Team Mismatches': '外部群組和團隊不一致項目',
    'Showing first 10 members...': '僅顯示前 10 位成員...',

    // 团队成员、存储库与子团队操作
    'Add member': '新增成員',
    'Add repository': '新增儲存庫',
    'Add a repository': '新增儲存庫',
    'Add a child team': '新增子團隊',
    'Add child team': '新增子團隊',
    'Child team': '子團隊',
    Permission: '權限',
    'Leave team': '離開團隊',
    'Rename team': '重新命名團隊',
    'Delete team': '刪除團隊',

    // 加入申请
    'Membership requested. We’ll let you know once an administrator has reviewed your request.':
      '已申請加入。管理員審查你的申請後，我們會通知你。',
    "Membership requested. We'll let you know once an administrator has reviewed your request.":
      '已申請加入。管理員審查你的申請後，我們會通知你。',
    'Okay, we’ve cancelled your request to join this team.': '已取消你加入此團隊的申請。',
    "Okay, we've cancelled your request to join this team.": '已取消你加入此團隊的申請。',
    'Request to join': '申請加入',
    'Requires approval from an owner or team maintainer': '需要擁有者或團隊維護者核准',
    'Cancel pending request': '取消待處理的申請',
    'Your request to join this team is pending review': '你加入此團隊的申請正在等待審查',
    'This team doesn’t have any child team members.': '此團隊沒有任何子團隊成員。',
    "This team doesn't have any child team members.": '此團隊沒有任何子團隊成員。',
    'Filter by role': '依角色篩選',

    // 新建团队
    'Create new team': '建立新團隊',
    'Team name': '團隊名稱',
    'You’ll use this name to mention this team in conversations.': '在對話中提及此團隊時會使用此名稱。',
    "You'll use this name to mention this team in conversations.": '在對話中提及此團隊時會使用此名稱。',
    'What is this team all about?': '這個團隊是做什麼的？',
    'There are no teams that can be selected.': '沒有可選取的團隊。',
    'Select parent team': '選擇父團隊',
    'Search teams': '搜尋團隊',
    'Team visibility': '團隊可見度',
    'Members of this organization can see and': '此組織的成員可以查看並',
    '@mention': '@提及',
    'this team.': '此團隊。',
    'A visible team can be seen and @mentioned by every member of this organization.': '此組織的每位成員都能查看並 @提及可見團隊。',
    'A secret team can only be seen by its members and may not be nested.': '祕密團隊只有其成員看得到，且不支援巢狀。',
    'Team notifications': '團隊通知',
    'Everyone will be notified when the team is @mentioned.': '團隊被 @提及時，所有人都會收到通知。',
    'No one will receive notifications.': '任何人都不會收到通知。',
    'Create team': '建立團隊',

    // 团队设置：常规（「Upload new picture」「Danger zone」组织个人资料页也用；「Scheduled reminders」组织设置菜单也用）
    'Team settings': '團隊設定',
    'Upload new picture': '上傳新頭像',
    'Danger zone': '危險區域',
    'Scheduled reminders': '排定的提醒',
    'Changing the team name will break past @mentions.': '變更團隊名稱會使過去的 @提及失效。',
    'You may also drag and drop an image from your computer. The image must be less than 1MB.':
      '你也可以從電腦拖放圖片。圖片必須小於 1MB。',
    'Delete this team': '刪除此團隊',
    'Are you sure you want to delete this team?': '確定要刪除此團隊嗎？',
    'Once deleted, it will be gone forever.': '刪除後將無法復原。',
    'I understand, delete this team': '我瞭解，刪除此團隊',

    // 团队设置：代码审查
    'Only notify requested team members': '僅通知被請求的團隊成員',
    'Only notify requested team members.': '僅通知被請求的團隊成員。',
    "If both a team and one or more of its members are requested for review, don't notify the entire team.":
      '如果同時請求團隊及其一或多位成員審查，則不通知整個團隊。',
    'If both a team and one or more of its members are requested for review, don’t notify the entire team.':
      '如果同時請求團隊及其一或多位成員審查，則不通知整個團隊。',
    'Enable auto assignment': '啟用自動指派',
    "This will automatically route this team's code review requests to individual team members.":
      '這會自動將此團隊的程式碼審查請求指派給個別團隊成員。',
    'This will automatically route this team’s code review requests to individual team members.':
      '這會自動將此團隊的程式碼審查請求指派給個別團隊成員。',
    // 原文状态名 Busy 无引号，译文不加
    "Note: this won't assign members who have committed to the pull request or have set their status to Busy.":
      '注意：這不會指派已向該拉取請求提交過的成員，或狀態設為忙碌的成員。',
    'Note: this won’t assign members who have committed to the pull request or have set their status to Busy.':
      '注意：這不會指派已向該拉取請求提交過的成員，或狀態設為忙碌的成員。',
    'How many team members should be assigned to review?': '要指派多少位團隊成員審查？',
    'Routing algorithm': '指派演算法',
    'Round robin': '輪流指派',
    'Alternate reviews between each team member': '在每位團隊成員之間輪流指派審查',
    'Load balance': '負載平衡',
    'Balance review load across the entire team': '在整個團隊中平衡審查負載',
    'Never assign certain team members': '永不指派特定團隊成員',
    'Select team members': '選取團隊成員',
    'Child team members': '子團隊成員',
    'Include the members of any child teams when assigning requests.': '指派請求時包含所有子團隊的成員。',
    'Count existing requests': '計入現有請求',
    'Count any members whose review has already been requested against the total number of members to assign.':
      '將已被請求審查的成員計入要指派的成員總數。',
    'Team review request': '團隊審查請求',
    'When assigning team members, remove the review request for the team.': '指派團隊成員時，移除對團隊的審查請求。',

    // 团队批量操作、成员、头像
    'Remove from team': '從團隊移除',
    'Change visibility': '變更可見度',
    'Confirm changes': '確認變更',
    'I understand, delete teams': '我瞭解，刪除這些團隊',
    'Set new team avatar': '設定新的團隊頭像',

    // 父团队、子团队
    'Select a parent team': '選擇父團隊',
    'Confirm new parent team': '確認新的父團隊',
    'Clear selected value': '清除選取的值',
    'Add a team': '新增團隊'
  }
} satisfies PageDictionary
