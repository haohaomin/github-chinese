import type { PageDictionary } from '../../../core/types'

const LOGIN = '@([\\w-]+)'

const DURATION_UNIT: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '个月',
  year: '年'
}

const DURATION_QUALIFIER: Readonly<Record<string, string>> = { about: '约', almost: '将近', over: '超过' }

/** 交互限制剩余时长：“about 23 hours” → 已启用剩余约 23小时；原文无逗号，译文不加；句号随原文 */
function enabledRemaining(qualifier: string | undefined, amount: string, unit: string, dot: string): string {
  const prefix = qualifier ? (DURATION_QUALIFIER[qualifier] ?? '') : ''
  const count = /^\d+$/.test(amount) ? amount : '1'
  return `已启用剩余${prefix} ${count}${DURATION_UNIT[unit] ?? unit}${dot ? '。' : ''}`
}

/**
 * 调解：已阻止的用户、交互限制、代码审查限制、版主；导入/导出（占位帐户、归属邀请）。
 * 阻止用户、交互限制、代码审查限制中与个人设置共用的句子放 static（个人设置依赖这里）；
 * 存储库设置、个人设置已收录为 static 的句子（Temporary interaction limits、Limit to …、
 * Code review limits are currently、Additionally, blocked users are not able to: 等）不再重复。
 * 阻止用户表格等短词放 scoped，译法与个人设置一致（block 一律译“阻止”）。
 */
export default {
  static: {
    // 已阻止的用户
    'Block a user': '阻止用户',
    'Blocking a user prevents the following on all your repositories:': '阻止用户后，将禁止其在你的所有存储库中：',
    'opening or commenting on issues or pull requests': '创建或评论议题和拉取请求',
    'starring, forking, or watching': '加星标、复刻或关注',
    'adding or editing wiki pages': '添加或编辑 Wiki 页面',
    'You can block a user to deny them access to repositories and more.': '你可以阻止用户，禁止其访问存储库等内容。',
    'All blocked users': '所有已阻止的用户',
    'Block user from organization': '在组织中阻止用户',
    'Block user from organization and send message': '在组织中阻止用户并发送消息',
    'Close all open issues, pull requests, and discussions opened by this user': '关闭此用户创建的所有议题、拉取请求和讨论',
    'Hide this user’s comments': '隐藏此用户的评论',
    "Hide this user's comments": '隐藏此用户的评论',
    'Send a notification to this user': '向此用户发送通知',
    'Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to org admins.':
      '请勿包含任何个人信息，例如法定姓名或电子邮件地址。支持 Markdown。此备注仅组织管理员可见。',
    "Please don't include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to org admins.":
      '请勿包含任何个人信息，例如法定姓名或电子邮件地址。支持 Markdown。此备注仅组织管理员可见。',
    'Markdown is supported. This note will only be visible to org admins.': '支持 Markdown。此备注仅组织管理员可见。',

    // 交互限制（原文括号外无逗号，译文不加；与 repo-settings/access.ts 同句一致）
    'Temporarily restrict which external users can interact with your repositories (comment, open issues, or create pull requests) for a configurable period of time. Users who are members of this organization will not be affected by these limits.':
      '在可配置的时间段内临时限制哪些外部用户可以与你的存储库交互（评论、创建议题或创建拉取请求）。此组织的成员不受这些限制影响。',
    "Interaction limits may already exist in your organization's": '交互限制可能已存在于你组织的',
    'Interaction limits may already exist in your organization’s': '交互限制可能已存在于你组织的',
    'public repositories': '公共存储库',
    '. Any changes here will override those limits.': '中。此处的任何更改都将覆盖这些限制。',
    "Users that have recently created their account will be unable to interact with this organization's repositories.":
      '最近创建帐户的用户将无法与此组织的存储库交互。',
    'Users that have recently created their account will be unable to interact with this organization’s repositories.':
      '最近创建帐户的用户将无法与此组织的存储库交互。',
    'Users that have not previously committed to the default branch of a repository in this organization will be unable to interact with that repository.':
      '从未向此组织中某存储库默认分支提交过的用户将无法与该存储库交互。',
    'Users that are not collaborators of a repository in this organization will not be able to interact with that repository.':
      '不是此组织中某存储库协作者的用户将无法与该存储库交互。',
    'User interaction limit settings saved.': '已保存用户交互限制设置。',
    'Organization members': '组织成员',
    'Pull request limits': '拉取请求限制',
    'Count draft pull requests toward the limit': '草稿拉取请求计入限制',

    // 代码审查限制
    'Restrict users who are permitted to approve or request changes on pull requests in public repositories within this organization.':
      '限制哪些用户可以在此组织的公共存储库中批准拉取请求或请求更改。',
    'Code review limits may already be specified by individual repositories. Any changes here will override those limits until unset.':
      '各存储库可能已单独设置代码审查限制。此处的任何更改都将覆盖这些限制，直至取消设置。',
    'Code review limits are currently managed individually for all repositories. Enable limits to permit only users who have explicitly been granted access to each repository to submit reviews that "approve" or "request changes". Remove limits to allow all users to submit pull request reviews. All users able to submit comment pull request reviews will continue to be able to do so.':
      '目前各存储库单独管理代码审查限制。启用限制后，只有被明确授予各存储库访问权限的用户才能提交“批准”或“请求更改”审查。删除限制后，所有用户都可以提交拉取请求审查。能够提交评论审查的用户仍可继续提交。',
    'Limit review on all repositories': '限制所有存储库的审查',
    'Limit reviews on all repositories': '限制所有存储库的审查',
    'Remove review limits from all repositories': '删除所有存储库的审查限制',

    // 版主
    'You can add organization members or teams as moderators for your organization. Moderators can block and unblock users from the organization, minimize comments, and manage interaction limits for all public organization repositories.':
      '你可以将组织成员或团队添加为组织的版主。版主可以在组织中阻止和取消阻止用户、最小化评论，并管理组织所有公共存储库的交互限制。',
    'You may add up to': '最多可添加',
    'members or teams as moderators.': '个成员或团队作为版主。',
    'Add a member or team': '添加成员或团队',
    "You don't have any moderators for this organization.": '此组织暂无版主。',
    'You don’t have any moderators for this organization.': '此组织暂无版主。',
    'Remove moderator': '删除版主',

    // 导入/导出
    Mannequins: '占位帐户',
    'Search mannequins by login or email...': '按登录名或电子邮件搜索占位帐户...',
    'Search mannequins by login or email…': '按登录名或电子邮件搜索占位帐户…',
    'There are no mannequins in this organization': '此组织暂无占位帐户',
    'Mannequins represent authors of imported contributions. They do not have profile pages and cannot sign in. Their contributions can be reattributed to other members of your organization.':
      '占位帐户代表导入贡献的作者。它们没有个人资料页面，也无法登录。其贡献可以重新归属给组织的其他成员。',
    'Attribution Invitations': '归属邀请',
    'Attribution invitations': '归属邀请',
    'Below are the mannequin reattribution invitations that have been sent within this organization. If the state is "invited," then the user has not yet replied; if it is "completed," then the user has accepted and their contributions have been reattributed, and if it is "rejected," then the user opted not to be credited for that mannequin\'s contributions.':
      '以下是此组织内已发送的占位帐户重新归属邀请。状态为“invited”表示用户尚未回复；“completed”表示用户已接受，其贡献已重新归属；“rejected”表示用户选择不认领该占位帐户的贡献。',
    'Below are the mannequin reattribution invitations that have been sent within this organization. If the state is "invited," then the user has not yet replied; if it is "completed," then the user has accepted and their contributions have been reattributed, and if it is "rejected," then the user opted not to be credited for that mannequin’s contributions.':
      '以下是此组织内已发送的占位帐户重新归属邀请。状态为“invited”表示用户尚未回复；“completed”表示用户已接受，其贡献已重新归属；“rejected”表示用户选择不认领该占位帐户的贡献。',
    'No attribution invitations have been sent': '尚未发送归属邀请',
    Reattribute: '重新归属',
    'Reattribute contributions': '重新归属贡献',
    Mannequin: '占位帐户'
  },
  scoped: {
    // 阻止用户表格与对话框（与个人设置共用的短词）
    'Search by username, full name, or public email': '按用户名、全名或公开电子邮件搜索',
    'Learn more about blocking a user': '了解如何阻止用户',
    'Learn more about blocking a user.': '了解如何阻止用户。',
    'For 1 day': '1 天',
    'For 3 days': '3 天',
    'For 7 days': '7 天',
    'For 30 days': '30 天',
    'Until unblocked': '直到取消阻止',
    'You have not blocked any users.': '你尚未阻止任何用户。',
    'You have not blocked anyone.': '你尚未阻止任何人。',
    'No blocked users match your search.': '没有匹配的已阻止用户。',
    'Blocked by': '阻止者',
    'Blocked until': '阻止截止',
    Indefinitely: '无限期',
    'Date blocked': '阻止日期',
    Label: '标签',
    Notes: '备注',
    Note: '备注',
    'Block settings': '阻止设置',
    'Close all content': '关闭所有内容',
    'Currently blocked': '当前已阻止',
    'Find blocked users': '查找已阻止的用户',
    'Blocked users pagination': '已阻止用户分页',
    'Blocked Duration': '阻止时长',
    'Restriction ends': '限制结束于',
    'Add a label': '添加标签',
    'Select one or more reasons for blocking.': '选择一个或多个阻止原因。',
    'Add a note': '添加备注',
    'Add Note': '添加备注',
    'Saving block settings': '正在保存阻止设置',
    'Block settings saved': '已保存阻止设置',
    'Block settings summary': '阻止设置摘要',
    // 与个人设置共用的两句：句号随原文，与 settings-developer/moderation.ts 同译
    'Unable to save block settings. Please try again.': '无法保存阻止设置。请重试。',
    'Block settings may have been saved, but the server returned an unexpected response. Refresh the page to confirm.':
      '阻止设置可能已保存，但服务器返回了意外响应。请刷新页面确认。',
    'Something went wrong while saving. Please try again.': '保存时出错。请重试。',
    Misconduct: '不当行为',
    Harassment: '骚扰',
    Entitlement: '态度傲慢',

    // 交互限制（与个人 / 存储库设置共用的短词）
    'New users': '新用户',
    Collaborators: '协作者',
    '3 days': '3 天',
    '1 week': '1 周',
    '1 month': '1 个月',
    '6 months': '6 个月',

    // 代码审查限制：「Code review limits are currently」+ 状态 +「for all repositories. …」
    enabled: '已启用',
    disabled: '已禁用',
    Unset: '取消设置'
  },
  regexp: [
    // 版主
    [/^Successfully added (@[\w.-]+(?:\/[\w.-]+)?) as a moderator$/, '已将 $1 添加为版主'],
    [/^Successfully removed (@[\w.-]+(?:\/[\w.-]+)?) as a moderator$/, '已将 $1 从版主中删除'],
    [/^You may add up to (\d+) members or teams as moderators\.$/, '最多可添加 $1 个成员或团队作为版主。'],

    // 已阻止的用户：计数、React 表格与对话框（与个人设置相同）
    [/^(\d+) blocked users?$/, '$1 个已阻止的用户'],
    [/^(\d+) users? found$/, '找到 $1 个用户'],
    [new RegExp(`^Note for ${LOGIN}$`), '@$1 的备注'],
    [new RegExp(`^View note for ${LOGIN}$`), '查看 @$1 的备注'],
    [new RegExp(`^Edit block for ${LOGIN}$`), '编辑对 @$1 的阻止'],
    [new RegExp(`^Block settings for ${LOGIN}$`), '@$1 的阻止设置'],
    [new RegExp(`^Block user ${LOGIN}$`), '阻止用户 @$1'],
    [new RegExp(`^Block actions for ${LOGIN}$`), '@$1 的阻止操作'],
    [new RegExp(`^${LOGIN} has been unblocked$`), '已取消阻止 @$1'],
    [new RegExp(`^Unblocking ${LOGIN}$`), '正在取消阻止 @$1'],
    [new RegExp(`^Closing content from ${LOGIN}$`), '正在关闭 @$1 的内容'],
    [new RegExp(`^Unable to unblock ${LOGIN}\\. Please try again\\.$`), '无法取消阻止 @$1。请重试。'],
    [new RegExp(`^Unable to close content from ${LOGIN}\\. Please try again\\.$`), '无法关闭 @$1 的内容。请重试。'],
    [new RegExp(`^Content created by ${LOGIN} is being closed\\.$`), '正在关闭 @$1 创建的内容。'],

    // 交互限制：剩余时间（原文无逗号，译文不加；句号随原文，与个人设置一致）
    [/^Enabled with less than a minute remaining(\.?)$/, (_, dot: string) => `已启用剩余不到 1 分钟${dot ? '。' : ''}`],
    [
      /^Enabled with (?:(about|almost|over) )?(\d+|an?|one) (second|minute|hour|day|week|month|year)s? remaining(\.?)$/,
      (_, qualifier: string, amount: string, unit: string, dot: string) => enabledRemaining(qualifier, amount, unit, dot)
    ],

    // 导入/导出
    [/^(\d+) mannequins?$/, '$1 个占位帐户']
  ]
} satisfies PageDictionary
