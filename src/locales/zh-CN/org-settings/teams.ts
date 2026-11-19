import type { PageDictionary } from '../../../core/types'

/**
 * 团队（/orgs/<组织>/teams、new-team、teams/<团队>/…）：列表介绍、加入申请、新建团队表单、
 * 团队设置（常规、代码审查自动分配、删除）、批量操作、父团队与子团队。
 * 这些页面属于 organization 页面类型，只能放 static；「New team」「Child teams」「Parent team」
 * 「Add a member」「Find a team…」及含数量的句子（N teams selected 等）由 organization 词典收录。
 */
export default {
  static: {
    // 团队列表（无团队时的介绍）
    'Seamless communication with teams': '借助团队无缝沟通',
    'Teams are a great way for groups of people to communicate and work on code together. Take a look at why they’re great.':
      '团队是一群人沟通并协作处理代码的好方式。看看团队的优势。',
    "Teams are a great way for groups of people to communicate and work on code together. Take a look at why they're great.":
      '团队是一群人沟通并协作处理代码的好方式。看看团队的优势。',
    'Flexible repository access': '灵活的存储库访问权限',
    'You can add repositories to your teams with more flexible levels of access (Admin, Write, Read).':
      '你可以用更灵活的访问级别（管理员、写入、读取）将存储库添加到团队。',
    'Request to join teams': '申请加入团队',
    'Members can quickly request to join any team. An owner or team maintainer can approve the request.':
      '成员可以快速申请加入任何团队。所有者或团队维护者可以批准申请。',
    'Team mentions': '团队提及',
    'Use team @mentions (ex.': '在任何评论、议题或拉取请求中使用团队 @提及（例如',
    'for the entire team) in any comment, issue, or pull request.': '可提及整个团队）。',
    'Learn more about teams': '了解团队',
    'Team members': '团队成员',
    'Team maintainers': '团队维护者',
    'Members of this team': '此团队的成员',
    'My teams': '我的团队',
    'No members': '暂无成员',
    "This team doesn't have any members.": '此团队没有成员。',
    'This team doesn’t have any members.': '此团队没有成员。',
    "This team doesn't have any child teams.": '此团队没有子团队。',
    'This team doesn’t have any child teams.': '此团队没有子团队。',
    "This team doesn't have access to any repositories.": '此团队无权访问任何存储库。',
    'This team doesn’t have access to any repositories.': '此团队无权访问任何存储库。',
    'Synced team': '已同步的团队',
    'Identity provider groups': '标识提供者组',
    // 团队同步：外部组与团队成员不一致
    'View Sync Mismatches': '查看同步不一致项',
    'External Group Team Mismatches': '外部组与团队不一致项',
    'Showing first 10 members...': '仅显示前 10 个成员...',

    // 团队成员、存储库与子团队操作
    'Add member': '添加成员',
    'Add repository': '添加存储库',
    'Add a repository': '添加存储库',
    'Add a child team': '添加子团队',
    'Add child team': '添加子团队',
    'Child team': '子团队',
    Permission: '权限',
    'Leave team': '退出团队',
    'Rename team': '重命名团队',
    'Delete team': '删除团队',

    // 加入申请
    'Membership requested. We’ll let you know once an administrator has reviewed your request.': '已申请加入。管理员审查后会通知你。',
    "Membership requested. We'll let you know once an administrator has reviewed your request.": '已申请加入。管理员审查后会通知你。',
    'Okay, we’ve cancelled your request to join this team.': '已取消加入此团队的申请。',
    "Okay, we've cancelled your request to join this team.": '已取消加入此团队的申请。',
    'Request to join': '申请加入',
    'Requires approval from an owner or team maintainer': '需要所有者或团队维护者批准',
    'Cancel pending request': '取消待处理的申请',
    'Your request to join this team is pending review': '你加入此团队的申请正在等待审查',
    'This team doesn’t have any child team members.': '此团队没有子团队成员。',
    "This team doesn't have any child team members.": '此团队没有子团队成员。',
    'Filter by role': '按角色筛选',

    // 新建团队
    'Create new team': '创建新团队',
    'Team name': '团队名称',
    'You’ll use this name to mention this team in conversations.': '在对话中提及此团队时使用此名称。',
    "You'll use this name to mention this team in conversations.": '在对话中提及此团队时使用此名称。',
    'What is this team all about?': '这个团队是做什么的？',
    'There are no teams that can be selected.': '没有可选择的团队。',
    'Select parent team': '选择父团队',
    'Search teams': '搜索团队',
    'Team visibility': '团队可见性',
    'Members of this organization can see and': '此组织的成员可以查看和',
    '@mention': '@提及',
    'this team.': '此团队。',
    'A visible team can be seen and @mentioned by every member of this organization.': '可见团队可以被此组织的所有成员查看和 @提及。',
    'A secret team can only be seen by its members and may not be nested.': '机密团队只有其成员可见，且不能嵌套。',
    'Team notifications': '团队通知',
    'Everyone will be notified when the team is @mentioned.': '团队被 @提及时，所有人都会收到通知。',
    'No one will receive notifications.': '任何人都不会收到通知。',
    'Create team': '创建团队',

    // 团队设置：常规（「Upload new picture」「Danger zone」组织个人资料页也用；「Scheduled reminders」组织设置菜单也用）
    'Team settings': '团队设置',
    'Upload new picture': '上传新头像',
    'Danger zone': '危险区域',
    'Scheduled reminders': '预定提醒',
    'Changing the team name will break past @mentions.': '更改团队名称会使过去的 @提及失效。',
    'You may also drag and drop an image from your computer. The image must be less than 1MB.': '也可以从电脑拖放图片。图片须小于 1MB。',
    'Delete this team': '删除此团队',
    'Are you sure you want to delete this team?': '确定要删除此团队吗？',
    'Once deleted, it will be gone forever.': '删除后将无法恢复。',
    'I understand, delete this team': '我已了解，删除此团队',

    // 团队设置：代码审查
    'Only notify requested team members': '仅通知被请求的团队成员',
    'Only notify requested team members.': '仅通知被请求的团队成员。',
    "If both a team and one or more of its members are requested for review, don't notify the entire team.":
      '如果同时请求了团队及其一个或多个成员审查，则不通知整个团队。',
    'If both a team and one or more of its members are requested for review, don’t notify the entire team.':
      '如果同时请求了团队及其一个或多个成员审查，则不通知整个团队。',
    'Enable auto assignment': '启用自动分配',
    "This will automatically route this team's code review requests to individual team members.":
      '将此团队的代码审查请求自动分配给各个团队成员。',
    'This will automatically route this team’s code review requests to individual team members.':
      '将此团队的代码审查请求自动分配给各个团队成员。',
    // 原文状态名 Busy 无引号，译文不加
    "Note: this won't assign members who have committed to the pull request or have set their status to Busy.":
      '注意：不会分配已向该拉取请求提交过代码或状态设为忙碌的成员。',
    'Note: this won’t assign members who have committed to the pull request or have set their status to Busy.':
      '注意：不会分配已向该拉取请求提交过代码或状态设为忙碌的成员。',
    'How many team members should be assigned to review?': '应分配多少个团队成员进行审查？',
    'Routing algorithm': '分配算法',
    'Round robin': '轮询',
    'Alternate reviews between each team member': '在团队成员之间轮流分配审查',
    'Load balance': '负载均衡',
    'Balance review load across the entire team': '在整个团队中均衡审查负载',
    'Never assign certain team members': '从不分配特定团队成员',
    'Select team members': '选择团队成员',
    'Child team members': '子团队成员',
    'Include the members of any child teams when assigning requests.': '分配请求时包括所有子团队的成员。',
    'Count existing requests': '计入现有请求',
    'Count any members whose review has already been requested against the total number of members to assign.':
      '将已被请求审查的成员计入要分配的成员总数。',
    'Team review request': '团队审查请求',
    'When assigning team members, remove the review request for the team.': '分配团队成员时，删除对团队的审查请求。',

    // 团队批量操作、成员、头像
    'Remove from team': '从团队中删除',
    'Change visibility': '更改可见性',
    'Confirm changes': '确认更改',
    'I understand, delete teams': '我已了解，删除这些团队',
    'Set new team avatar': '设置新团队头像',

    // 父团队、子团队
    'Select a parent team': '选择父团队',
    'Confirm new parent team': '确认新父团队',
    'Clear selected value': '清除所选值',
    'Add a team': '添加团队'
  }
} satisfies PageDictionary
