import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

const DURATION_UNIT: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '个月',
  year: '年'
}

const DURATION_QUALIFIER: Readonly<Record<string, string>> = { about: '约 ', almost: '将近 ', over: '超过 ' }

const DURATION_RE = /^(?:(about|almost|over) )?(\d+|an?|one) (second|minute|hour|day|week|month|year)s?$/

/** 剩余时长片段（不含捕获组）：less than a minute、about 23 hours、1 day 等 */
const DURATION_SOURCE = '(?:less than a minute|(?:(?:about|almost|over) )?(?:\\d+|an?|one) (?:second|minute|hour|day|week|month|year)s?)'

/** 剩余时长：“about 23 hours” → 约 23小时；无法识别时原样返回 */
export function translateDuration(text: string): string {
  if (text === 'less than a minute') return '不到 1分钟'
  const match = DURATION_RE.exec(text)
  if (!match) return text
  const amount = /^\d+$/.test(match[2]!) ? match[2]! : '1'
  const qualifier = match[1] === undefined ? '' : (DURATION_QUALIFIER[match[1]] ?? '')
  return `${qualifier}${amount}${DURATION_UNIT[match[3]!] ?? match[3]}`
}

const LOGIN = '@([\\w-]+)'

/**
 * 组织（/settings/organizations）、企业（/settings/enterprises）、
 * 调解：已阻止的用户、交互限制、代码审查限制（/settings/blocked_users、interaction_limits、code_review_limits）。
 * 阻止用户、交互限制中与组织设置相同的句子已由 org-settings 收录（全站生效），这里只收个人设置独有的句子；
 * 阻止用户表格等短词放 scoped，译法与组织设置一致。
 */
export default {
  static: {
    // 组织
    'You are not a member of any organizations.': '你不是任何组织的成员。',
    'Leave organization': '退出组织',
    'Transform account': '转换帐户',
    'You cannot transform this account into an organization until you leave all organizations that you’re a member of.':
      '在退出你所属的所有组织之前无法将此帐户转换为组织。',
    "You cannot transform this account into an organization until you leave all organizations that you're a member of.":
      '在退出你所属的所有组织之前无法将此帐户转换为组织。',
    'You cannot transform this account into an organization because you have an active GitHub Sponsors account.':
      '你因有活跃的 GitHub 赞助帐户而无法将此帐户转换为组织。',
    'Move to an organization': '迁移到组织',
    'Move work to an organization': '将工作迁移到组织',
    'Your personal account cannot be converted to an organization. You must create a new organization and transfer your repositories and projects to it instead. You can then rename your personal account and the organization if you want your organization to have the same name that you are currently using for your personal account.':
      '个人帐户无法转换为组织。你需要新建组织并将存储库和项目转让给该组织。如果希望组织使用你个人帐户当前的名称则可以随后重命名个人帐户和组织。',
    'Account Transformation Warning': '帐户转换警告',
    'What you are about to do is an irreversible and destructive process. Please be aware:': '你即将执行的操作不可逆且具有破坏性。请注意：',
    'Any user-specific information (OAuth tokens, SSH keys, Job Profile, etc) will be erased':
      '所有用户特定信息（OAuth 令牌、SSH 密钥、求职个人资料等）都将被清除',
    'You will no longer be able to create or modify gists owned by the converted personal account':
      '你将无法再创建或修改被转换的个人帐户所拥有的代码片段',
    'create a new personal account': '创建新的个人帐户',
    'The total amount of collaborators across private repositories will be the total amount of seats for the organization':
      '各专用存储库的协作者总数将成为组织的席位总数',
    // 单一登录组织列表
    'SSO banner settings': 'SSO 横幅设置',
    'Reset SSO banner': '重置 SSO 横幅',
    'Reset SSO Banner': '重置 SSO 横幅',
    'Are you sure you want to reset your dismissal of the single sign-on banner on this device?':
      '确定要在此设备上撤销对单一登录横幅的关闭吗？',
    'This will clear your dismissal preferences and the SSO banner may appear again for organizations that require single sign-on authentication.':
      '这将清除你的关闭首选项并可能让 SSO 横幅在要求单一登录身份验证的组织中再次出现。',

    // 企业
    "You don't have any enterprises": '你还没有任何企业',
    'You don’t have any enterprises': '你还没有任何企业',
    'Designed for businesses or teams who collaborate on GitHub.com': '专为在 GitHub.com 上协作的企业或团队设计',
    'Start free for 30 days': '免费试用 30 天',
    'Learn more about enterprises': '了解企业',
    'Learn more about enterprise accounts': '了解企业帐户',
    'New Enterprise': '新建企业',

    // 已阻止的用户（个人）
    'You are about to block:': '你即将阻止：',
    'Maximum 250 characters. Please don’t include any personal information such as legal names or email addresses. This note will only be visible to you.':
      '最多 250 个字符。请勿包含法定姓名或电子邮件地址等个人信息。此备注仅你可见。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. This note will only be visible to you.":
      '最多 250 个字符。请勿包含法定姓名或电子邮件地址等个人信息。此备注仅你可见。',
    'Additionally, blocked users are not able to:': '此外，被阻止的用户无法：',
    'invite you as a collaborator to their repositories': '邀请你成为其存储库的协作者',
    'follow your account’s public activity': '关注你帐户的公开活动',
    "follow your account's public activity": '关注你帐户的公开活动',
    'send you notifications by @mentioning your username in public repositories': '在公共存储库中通过 @提及你的用户名向你发送通知',
    'Warn me when a blocked user is a prior contributor to a repository': '被阻止的用户曾为某存储库做出贡献时提醒我',
    'Warn me when blocked users have contributed to a repository': '被阻止的用户曾为某存储库做出贡献时提醒我',
    'We will show this warning each time you visit a repository where someone you blocked has committed code, unless you own the repository or have also contributed a commit. This warning does not restrict your access.':
      '每次访问你阻止的用户曾提交过代码的存储库时都会显示此警告，除非你拥有该存储库或也提交过代码。此警告不会限制你的访问。',
    'On repositories you haven’t contributed to yet, we’ll warn you when a user you’ve blocked has previously made contributions.':
      '在你尚未贡献过的存储库中，我们会在你阻止的用户曾做出贡献时提醒你。',
    "On repositories you haven't contributed to yet, we'll warn you when a user you've blocked has previously made contributions.":
      '在你尚未贡献过的存储库中，我们会在你阻止的用户曾做出贡献时提醒你。',
    "Please don't include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.":
      '请勿包含法定姓名或电子邮件地址等任何个人信息。支持 Markdown。此备注仅你可见。',
    'Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.':
      '请勿包含法定姓名或电子邮件地址等任何个人信息。支持 Markdown。此备注仅你可见。',
    'Markdown is supported. This note will only be visible to you.': '支持 Markdown。此备注仅你可见。',

    // 交互限制（个人）：与组织设置同句写法一致
    'Temporarily restrict which external users can interact with your repositories (comment, open issues, or create pull requests) for a configurable period of time.':
      '在可配置的时间段内，临时限制哪些外部用户可以与你的存储库交互（评论、创建议题或创建拉取请求）。',
    // 「… your account's <a>public repositories</a>. Any changes here will override those limits.」后两段由 org-settings 收录
    "Interaction limits may already exist in your account's": '交互限制可能已存在于你帐户的',
    'Interaction limits may already exist in your account’s': '交互限制可能已存在于你帐户的',
    'Users that have recently created their account will be unable to interact with your repositories.':
      '最近创建帐户的用户将无法与你的存储库交互。',
    'Users that have not previously committed to the default branch of one of your repositories will be unable to interact with that repository.':
      '从未向你某个存储库的默认分支提交过的用户将无法与该存储库交互。',
    'Users that are not collaborators of one of your repositories will not be able to interact with that repository.':
      '不是你某个存储库协作者的用户将无法与该存储库交互。',

    // 代码审查限制（个人）
    'Restrict users who are permitted to approve or request changes on pull requests in your public repositories.':
      '限制哪些用户可以在你的公共存储库中批准拉取请求或请求更改。',
    'Code review limits are currently': '所有存储库的代码审查限制目前',
    'for all repositories. Only users explicitly granted access to these repositories may submit pull request reviews that "approve" or "request changes". All users able to submit comment pull request reviews continue to be able to do so.':
      '。只有被明确授予这些存储库访问权限的用户才能提交“批准”或“请求更改”审查。能够提交评论审查的用户仍可继续提交。',
    'for all repositories. All users are able to submit pull request reviews, including those that "approve" or "request changes". Limit reviews to only permit users who have explicitly been granted access to each repository to submit reviews that "approve" or "request changes".':
      '。所有用户都可以提交拉取请求审查，包括“批准”或“请求更改”审查。将审查限制为只允许被明确授予各存储库访问权限的用户提交“批准”或“请求更改”审查。',
    'Code review limit settings saved.': '已保存代码审查限制设置。'
  },
  scoped: {
    // 阻止成功的提示：「<strong>用户</strong> has been successfully blocked.」
    'has been successfully blocked.': '已被阻止。',
    // 组织（Leave 由 common-ui 收录，Billing manager 由 org-settings 收录）
    'Compare plans': '比较计划',
    Dismissed: '已关闭',

    // 企业
    'Start a free trial': '开始免费试用',

    // 已阻止的用户（与组织设置共用的表格、对话框；译法与 org-settings 一致）
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
    'Unable to save block settings. Please try again.': '无法保存阻止设置。请重试。',
    'Block settings may have been saved, but the server returned an unexpected response. Refresh the page to confirm.':
      '阻止设置可能已保存，但服务器返回了意外响应。请刷新页面确认。',
    'Something went wrong while saving. Please try again.': '保存时出错。请重试。',
    Misconduct: '不当行为',
    Harassment: '骚扰',
    Entitlement: '态度傲慢',

    // 交互限制（与组织、存储库设置共用的短词；24 hours 由 common 收录）
    'New users': '新用户',
    Collaborators: '协作者',
    '3 days': '3 天',
    '1 week': '1 周',
    '1 month': '1 个月',
    '6 months': '6 个月',

    // 代码审查限制
    enabled: '已启用',
    disabled: '已禁用',
    Unset: '取消设置'
  },
  regexp: [
    // 组织：退出确认、外部协作者身份
    [
      /^Are you positive you want to leave (\S+)\? You will lose access to all repositories and teams\.$/,
      '确定要退出 $1 吗？你将失去对其所有存储库和团队的访问权限。'
    ],
    [
      /^Are you positive you want to leave (\S+)\? You will lose access to all repositories\.$/,
      '确定要退出 $1 吗？你将失去对其所有存储库的访问权限。'
    ],
    [/^You left (\S+)\. It may take a few minutes to process\.$/, '你已退出 $1。处理可能需要几分钟。'],
    [
      /^Can[’']t leave (\S+)\. If you[’']re the last owner, delete the organization\.$/,
      '无法退出 $1。如果你是最后一位所有者，请删除该组织。'
    ],
    [/^Outside collaborator on (\d+) repositor(?:y|ies)$/, '$1 个存储库的外部协作者'],
    [/^Member and collaborator on (\d+) repositor(?:y|ies)$/, '$1 个存储库的成员和协作者'],
    // 组织：帐户转换警告
    [/^Turn (\S+) into an organization$/, '将 $1 转换为组织'],
    [
      /^You will no longer be able to sign in to (\S+) \(all administrative privileges will be bestowed upon the owners you choose\)$/,
      '你将无法再登录 $1（所有管理权限将授予你选择的所有者）'
    ],
    [
      /^Any commits and comments credited to (\S+) will no longer be linked to this GitHub account$/,
      '归属于 $1 的提交和评论将不再关联到此 GitHub 帐户'
    ],
    [/^Any GitHub Apps installed on (\S+) will be uninstalled$/, '安装在 $1 上的所有 GitHub 应用都将被卸载'],
    [/^If you are using (\S+) as a personal account, you should$/, '如果你将 $1 用作个人帐户，应先'],
    // 句首片段原文无逗号，译文不加
    [/^before transforming (\S+) into an organization\.$/, '再将 $1 转换为组织。'],

    // 已阻止的用户：React 表格与对话框
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
    // 同一句不带 @ 的写法（个人设置的阻止用户页），用户名照原文
    [/^Content created by ([\w-]+) is being closed\.$/, '正在关闭 $1 创建的内容。'],
    // 企业列表：设置按钮的无障碍名称（企业标识）
    [/^Settings for ([\w.-]+)$/, '$1 的设置'],
    [/^(\d+) users? found$/, '找到 $1 个用户'],
    [/^(\d+) blocked users?$/, '$1 个已阻止的用户'],
    // 阻止备注输入框的剩余字数
    [/^(\d+) characters? remaining\.$/, '还可输入 $1 个字符。'],

    // 交互限制：剩余时间（原文无逗号，译文不加；句号随原文）
    [
      new RegExp(`^Enabled with (${DURATION_SOURCE}) remaining(\\.?)$`),
      (_, remaining: string, dot: string) => `${joinCjk('已启用剩余', translateDuration(remaining))}${dot ? '。' : ''}`
    ]
  ],
  ignore: [
    // 单一登录组织列表：组织登录名、显示名是用户内容
    '[data-testid^="sso-org-link-"]',
    '[data-testid^="sso-org-row-"] [class*="profileName__"]'
  ]
} satisfies PageDictionary
