import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk } from '../helpers'
import { LAST_USED_SOURCE, USAGE_SOURCE, translateUsage } from '../settings-developer/keys'
import { WEEKDAY_DATE_SOURCE, translateTokenDate } from '../settings-developer/tokens'

const ORG = '([\\w.-]+)'

/** 令牌日期：“Tue, Nov 25 2025”或常规日期（不含捕获组） */
const ANY_DATE_SOURCE = `(?:${WEEKDAY_DATE_SOURCE}|${DATE_SOURCE})`

/** 句号：原文有则补全角句号 */
function period(dot: string): string {
  return dot ? '。' : ''
}

/**
 * 第三方访问：已安装的 GitHub 应用、应用管理者、OAuth 应用策略、个人访问令牌策略 / 活动令牌 / 请求。
 * 与个人开发人员设置同名的条目放 scoped；权限名与权限摘要（“Read access to …”）由 developer 沿用个人开发人员设置。
 */
export default {
  static: {
    // 个人访问令牌策略保存提示
    'Personal access tokens are now able to access your organization.': '个人访问令牌现在可以访问你的组织。',
    'Personal access tokens are no longer able to access your organization.': '个人访问令牌不能再访问你的组织。',
    'All fine-grained personal access tokens requested for this organization will work immediately':
      '为此组织请求的所有精细个人访问令牌将立即生效',
    'All organization fine-grained personal access token requests are now subject to administrator review.':
      '所有组织精细个人访问令牌请求现在都须经管理员审查。',
    'Personal access tokens expiration policy disabled': '已禁用个人访问令牌有效期策略',
    'Personal access tokens expiration policy updated': '已更新个人访问令牌有效期策略',
    'Personal access tokens (classic) are now able to access your organization.': '个人访问令牌（经典）现在可以访问你的组织。',
    'Personal access tokens (classic) are no longer able to access your organization.': '个人访问令牌（经典）不能再访问你的组织。',
    // 个人访问令牌：分类导航、最长有效期、搜索（无障碍名称与占位文字）
    'Personal Access tokens categories navigation': '个人访问令牌类别导航',
    'Are you sure you want to update your selection?': '确定要更新所选内容吗？',
    'Select the maximum lifetime for fine-grained personal access tokens': '选择精细个人访问令牌的最长有效期',
    'Enter a custom maximum lifetime for fine-grained personal access tokens': '输入精细个人访问令牌的自定义最长有效期',
    'Search token names or filter with owner:, repository:, permission:': '搜索令牌名称，或使用 owner:、repository:、permission: 筛选',
    // 已安装的 GitHub 应用：待处理的安装请求
    'Members in your organization can request that GitHub Apps be installed. Pending requests are listed below.':
      '你组织中的成员可以请求安装 GitHub 应用。下方列出了待处理的请求。',

    // OAuth 应用策略
    'Third-party application access policy': '第三方应用访问策略',
    'Only approved applications can access data in this organization. Applications owned by': '只有已批准的应用才能访问此组织中的数据。由',
    'always have access.': '拥有的应用始终具有访问权限。',
    'Remove restrictions': '解除限制',
    'You’re about to remove all third-party application restrictions. Please read this carefully.':
      '你即将解除所有第三方应用限制。请仔细阅读以下内容。',
    "You're about to remove all third-party application restrictions. Please read this carefully.":
      '你即将解除所有第三方应用限制。请仔细阅读以下内容。',
    'Removing third-party application restrictions will immediately give member authorized applications access to private data in the':
      '解除第三方应用限制将立即允许成员授权的应用访问以下组织的私密数据',
    'Please be sure you want to do this.': '请确认你要执行此操作。',
    'Yes, remove application restrictions': '是，解除应用限制',
    'All applications authorized by organization members have access to': '组织成员授权的所有应用都可以访问',
    '’s data.': '的数据。',
    "'s data.": '的数据。',
    'Setup application access restrictions': '设置应用访问限制',
    'As members request access for specific applications, those requests will be listed here for your approval. You can start by browsing':
      '成员请求特定应用的访问权限后，这些请求会列在此处等待你批准。你可以先浏览',
    'your own authorized applications': '你自己授权的应用',
    'When authorized, applications can act on behalf of organization members. Your access policy determines which applications can access data in your organization.':
      '获得授权后，应用可以代表组织成员执行操作。访问策略决定哪些应用可以访问组织中的数据。',
    'Read more about third-party access and organizations.': '了解第三方访问和组织。',
    'Third-party application restrictions': '第三方应用限制',
    'create an extra layer of security that allows owners to better control how applications access data in their organization.':
      '提供额外的安全层，让所有者更好地控制应用如何访问组织中的数据。',
    'Organization owners maintain an allowlist of trusted applications.': '组织所有者维护受信任应用的允许列表。',
    'are always trusted.': '拥有的应用始终受信任。',
    'Members can request organization approval for an application.': '成员可以为应用申请组织批准。',
    'Approval requests notify organization owners, allowing them to deny or approve application access.':
      '批准请求会通知组织所有者，由其拒绝或批准应用访问。',
    'Only trusted applications can:': '只有受信任的应用可以：',
    // 非可见性义的 private / public（数据、事件）→ 私密 / 公开
    'Access private organization data via the API or SSH.': '通过 API 或 SSH 访问私密组织数据。',
    'Change public organization data.': '更改公开组织数据。',
    'Receive webhooks for private events.': '接收私密事件的 Web 钩子。',
    'Restrict third-party application access': '限制第三方应用访问',
    'Restricting access will immediately block all unapproved applications and will disable SSH keys created before February 2014.':
      '限制访问将立即阻止所有未批准的应用，并禁用 2014年2月之前创建的 SSH 密钥。',
    // OAuth 应用访问申请详细信息（/orgs/<组织>/policies/applications/<id>，organization 页面类型）
    'Applications act on your behalf to access your data based on the permissions you grant them. Organizations control which applications are allowed to access their private data. Applications authorized by members will always have access to public data in your organization.':
      '应用会根据你授予的权限代表你访问数据。组织可以控制允许哪些应用访问其私密数据。成员授权的应用始终可以访问组织的公开数据。',
    'Read about organization OAuth app access restrictions.': '了解组织 OAuth 应用访问限制。',

    // 个人访问令牌：精细
    'By default, fine-grained personal access tokens cannot access content owned by your organization via the Public API or Git. This includes both public and private resources such as repositories.':
      '默认情况下，精细个人访问令牌无法通过公共 API 或 Git 访问组织拥有的内容。这包括存储库等公共和专用资源。',
    'Allow access via fine-grained personal access tokens': '允许通过精细个人访问令牌访问',
    "API and Git access will be allowed using approved organization member's fine-grained personal access tokens":
      '允许使用组织成员已获批准的精细个人访问令牌进行 API 和 Git 访问',
    'API and Git access will be allowed using approved organization member’s fine-grained personal access tokens':
      '允许使用组织成员已获批准的精细个人访问令牌进行 API 和 Git 访问',
    'Restrict access via fine-grained personal access tokens': '限制通过精细个人访问令牌访问',
    'Organization members will not be allowed to access your organization using a fine-grained personal access token':
      '组织成员将无法使用精细个人访问令牌访问你的组织',
    'Require approval of fine-grained personal access tokens': '精细个人访问令牌需要批准',
    'Access requests by organization members can be subject to review by administrator before approval.':
      '组织成员的访问请求可在批准前交由管理员审查。',
    'Require administrator approval': '需要管理员批准',
    'All access requests by organization members to this organization must be approved before the token is usable.':
      '组织成员对此组织的所有访问请求都必须获得批准，令牌才能使用。',
    'Do not require administrator approval': '无需管理员批准',
    'Tokens requested for this organization will work immediately, and organization members are not required to provide a justification when creating the token.':
      '为此组织申请的令牌将立即生效，组织成员创建令牌时无需提供理由。',
    'Set maximum lifetimes for personal access tokens': '设置个人访问令牌的最长有效期',
    'Control the maximum lifetime for fine-grained personal access tokens in your organizations. If set, your organization members can only use fine-grained personal access tokens against your resources if the tokens are set to expire within the period you provide.':
      '控制组织中精细个人访问令牌的最长有效期。设置后，组织成员只能使用在你指定期限内到期的精细个人访问令牌访问你的资源。',
    'Learn more about token expiration policies.': '了解令牌过期策略。',
    'Fine-grained personal access tokens must expire': '精细个人访问令牌必须设置过期时间',
    'Select a maximum lifetime for fine-grained personal access tokens to be allowed to access your organizations.':
      '选择允许访问组织的精细个人访问令牌的最长有效期。',

    // 个人访问令牌：经典
    'Restrict personal access tokens (classic) from accessing your organizations': '限制个人访问令牌（经典）访问你的组织',
    'By default, personal access tokens (classic) can access content owned by your organization via the GitHub API or Git over HTTPS. This includes both public and private resources such as repositories.':
      '默认情况下，个人访问令牌（经典）可以通过 GitHub API 或基于 HTTPS 的 Git 访问组织拥有的内容。这包括存储库等公共和专用资源。',
    'Allow access via personal access tokens (classic)': '允许通过个人访问令牌（经典）访问',
    "API and Git access will be allowed using an organization member's personal access token (classic)":
      '允许使用组织成员的个人访问令牌（经典）进行 API 和 Git 访问',
    'API and Git access will be allowed using an organization member’s personal access token (classic)':
      '允许使用组织成员的个人访问令牌（经典）进行 API 和 Git 访问',
    'Restrict access via personal access tokens (classic)': '限制通过个人访问令牌（经典）访问',
    'Organization members will not be allowed to access your organization using a personal access token (classic)':
      '组织成员将无法使用个人访问令牌（经典）访问你的组织',
    'Control the maximum lifetime for personal access tokens (classic) in your organizations. If set, your organization members can only use personal access tokens (classic) against your resources if the tokens are set to expire within the period you provide.':
      '控制组织中个人访问令牌（经典）的最长有效期。设置后，组织成员只能使用在你指定期限内到期的个人访问令牌（经典）访问你的资源。',
    'Personal access tokens (classic) must expire': '个人访问令牌（经典）必须设置过期时间',
    'Select a maximum lifetime for personal access tokens (classic) to be allowed to access your organizations.':
      '选择允许访问组织的个人访问令牌（经典）的最长有效期。',

    // 活动令牌与请求
    'Filter active fine-grained tokens': '筛选活动的精细令牌',
    "There aren't any fine-grained tokens for this organization": '此组织暂无精细令牌',
    'There aren’t any fine-grained tokens for this organization': '此组织暂无精细令牌',
    'Fine-grained personal access token requests': '精细个人访问令牌请求',
    'Fine-grained Personal Access Token Requests': '精细个人访问令牌请求',
    'Filter fine-grained personal access tokens requests': '筛选精细个人访问令牌请求',
    "There aren't any personal access token requests for this organization": '此组织暂无个人访问令牌请求',
    'There aren’t any personal access token requests for this organization': '此组织暂无个人访问令牌请求',
    'Approve...': '批准...',
    'Approve…': '批准…',
    'Deny...': '拒绝...',
    'Deny…': '拒绝…',
    'Revoke...': '撤销...',
    'Revoke…': '撤销…',

    // GitHub 应用管理者
    'Choose members that are allowed to manage all GitHub Apps belonging to this organization.':
      '选择允许管理此组织所有 GitHub 应用的成员。',
    'To see or change who can manage GitHub Apps belonging to your organization, see': '要查看或更改谁可以管理组织的 GitHub 应用，请参阅',
    'organization role assignments': '组织角色分配',
    '. All organization owners can manage Apps, as well as users and teams with one or more of the app management permissions.':
      '。所有组织所有者都可以管理应用，拥有一项或多项应用管理权限的用户和团队也可以。',
    'Organization owner': '组织所有者'
  },
  scoped: {
    // 已安装的 GitHub 应用（与个人设置共用）
    'Pending GitHub Apps installation requests': '待处理的 GitHub 应用安装请求',
    'Pending installation requests': '待处理的安装请求',
    Installed: '已安装',
    Suspended: '已暂停',
    'Developed by': '开发人员',
    'Installed on': '安装在',
    'App settings': '应用设置',
    'Report Abuse': '举报滥用行为',
    'Owned by': '所有者',
    'Only select repositories': '仅选定的存储库',
    'Select at least one repository.': '至少选择一个存储库。',
    // 句号随原文（与个人开发人员设置同译）
    'Select at least one repository. Also includes public repositories (read-only).': '至少选择一个存储库。同时包括公共存储库（只读）。',
    'This applies to all current and future repositories owned by the resource owner. Also includes public repositories (read-only).':
      '适用于资源所有者拥有的所有现有和将来的存储库。同时包括公共存储库（只读）。',
    'Suspend your installation': '暂停安装',
    'This will block the app access to your resources.': '这将阻止该应用访问你的资源。',
    Suspend: '暂停',
    Unsuspend: '恢复',
    'Uninstall this app': '卸载此应用',
    'This will remove the app and revoke access to all resources.': '这将删除该应用并撤销其对所有资源的访问权限。',

    // 应用管理者
    Management: '管理',
    'Search by username or full name': '按用户名或全名搜索',
    Grant: '授予',

    // OAuth 应用策略
    'Policy:': '策略：',
    'Access restricted': '访问受限',
    'No restrictions': '无限制',
    Denied: '已拒绝',
    'No pending requests': '暂无待处理的请求',
    'Applications owned by': '由',
    'Read more at GitHub Help.': '在 GitHub 帮助中了解更多。',
    'Grant access': '授予访问权限',
    'Deny access': '拒绝访问',
    'Revoke access': '撤销访问权限',

    // 个人访问令牌（与个人开发人员设置共用）
    'Fine-grained tokens': '精细令牌',
    'Fine-grained personal access tokens': '精细个人访问令牌',
    'Tokens (classic)': '令牌（经典）',
    'Custom...': '自定义...',
    'Custom…': '自定义…',
    'between 1 and 366 days': '介于 1 到 366 天之间',
    Tokens: '令牌',
    Requests: '请求',
    'Filter users': '筛选用户',
    'Filter by permission': '按权限筛选',
    'Filter permissions': '筛选权限',
    read: '读取',
    'Never used': '从未使用',
    Expires: '有效期至',
    Created: '创建于',
    'No description': '暂无描述',
    Review: '审查',
    'Approve request': '批准请求',
    'Deny request': '拒绝请求',
    'Request reason': '请求理由',

    // 精细令牌权限名：其余由 developer 沿用个人开发人员设置
    'Repository announcement banners': '存储库公告横幅',
    Plan: '计划'
  },
  regexp: [
    [new RegExp(`^Applications owned by ${ORG} always have access\\.$`), '由 $1 拥有的应用始终具有访问权限。'],
    [new RegExp(`^Applications owned by ${ORG} are always trusted\\.$`), '由 $1 拥有的应用始终受信任。'],
    [
      new RegExp(`^All applications authorized by organization members have access to ${ORG}[’']s data\\.$`),
      '组织成员授权的所有应用都可以访问 $1 的数据。'
    ],
    // 令牌与请求批量操作：「2 tokens selected...」（省略号随原文）
    [/^(\d+) requests? selected(\.\.\.|…)$/, '已选择 $1 个请求$2'],
    [/^(\d+) tokens? selected(\.\.\.|…)$/, '已选择 $1 个令牌$2'],
    // 活动令牌列表：过期时间与最近使用（与个人开发人员设置译法一致）
    [
      new RegExp(`^(Expires|Expired) on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, state: string, date: string, dot: string) =>
        state === 'Expires'
          ? `${joinCjk('有效期至', translateTokenDate(date))}${period(dot)}`
          : `${joinCjk(joinCjk('已于', translateTokenDate(date)), '过期')}${period(dot)}`
    ],
    [new RegExp(`^(${LAST_USED_SOURCE})$`), (_, usage: string) => translateUsage(usage)],
    [new RegExp(`^(${USAGE_SOURCE}) •$`), (_, usage: string) => `${translateUsage(usage)} •`]
  ]
} satisfies PageDictionary
