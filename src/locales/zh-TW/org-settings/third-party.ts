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
    // 个人访问令牌：分类导航、最长有效期、搜索（无障碍名称与占位文字）
    'Personal Access tokens categories navigation': '個人存取權杖類別導覽',
    'Are you sure you want to update your selection?': '確定要更新所選內容嗎？',
    'Select the maximum lifetime for fine-grained personal access tokens': '選擇精細個人存取權杖的最長有效期限',
    'Enter a custom maximum lifetime for fine-grained personal access tokens': '輸入精細個人存取權杖的自訂最長有效期限',
    'Search token names or filter with owner:, repository:, permission:': '搜尋權杖名稱，或使用 owner:、repository:、permission: 篩選',
    // 已安装的 GitHub 应用：待处理的安装请求
    'Members in your organization can request that GitHub Apps be installed. Pending requests are listed below.':
      '你組織中的成員可以請求安裝 GitHub 應用程式。下方列出了待處理的請求。',

    // OAuth 应用策略
    'Third-party application access policy': '第三方應用程式存取政策',
    'Only approved applications can access data in this organization. Applications owned by':
      '只有已核准的應用程式才能存取此組織中的資料。由',
    'always have access.': '擁有的應用程式一律具有存取權。',
    'Remove restrictions': '解除限制',
    'You’re about to remove all third-party application restrictions. Please read this carefully.':
      '你即將解除所有第三方應用程式限制。請仔細閱讀以下內容。',
    "You're about to remove all third-party application restrictions. Please read this carefully.":
      '你即將解除所有第三方應用程式限制。請仔細閱讀以下內容。',
    'Removing third-party application restrictions will immediately give member authorized applications access to private data in the':
      '解除第三方應用程式限制將立即讓成員授權的應用程式存取下列組織中的不公開資料',
    'Please be sure you want to do this.': '請確定你要這麼做。',
    'Yes, remove application restrictions': '是，解除應用程式限制',
    'All applications authorized by organization members have access to': '組織成員授權的所有應用程式都可以存取',
    '’s data.': '的資料。',
    "'s data.": '的資料。',
    'Setup application access restrictions': '設定應用程式存取限制',
    'As members request access for specific applications, those requests will be listed here for your approval. You can start by browsing':
      '成員請求特定應用程式的存取權後，這些請求會列在這裡等候你核准。你可以先瀏覽',
    'your own authorized applications': '你自己授權的應用程式',
    'When authorized, applications can act on behalf of organization members. Your access policy determines which applications can access data in your organization.':
      '獲得授權後，應用程式可以代表組織成員行事。你的存取政策決定哪些應用程式可以存取組織中的資料。',
    'Read more about third-party access and organizations.': '瞭解第三方存取和組織。',
    'Third-party application restrictions': '第三方應用程式限制',
    'create an extra layer of security that allows owners to better control how applications access data in their organization.':
      '提供額外一層安全防護，讓擁有者更能掌控應用程式存取組織資料的方式。',
    'Organization owners maintain an allowlist of trusted applications.': '組織擁有者維護受信任應用程式的允許清單。',
    'are always trusted.': '擁有的應用程式一律受信任。',
    'Members can request organization approval for an application.': '成員可以請求組織核准應用程式。',
    'Approval requests notify organization owners, allowing them to deny or approve application access.':
      '核准請求會通知組織擁有者，由其拒絕或核准應用程式存取。',
    'Only trusted applications can:': '只有受信任的應用程式可以：',
    // 非可见性义的 private / public（数据、事件）→ 不公開 / 公開
    'Access private organization data via the API or SSH.': '透過 API 或 SSH 存取組織的不公開資料。',
    'Change public organization data.': '變更組織的公開資料。',
    'Receive webhooks for private events.': '接收不公開事件的 Web 鉤子。',
    'Restrict third-party application access': '限制第三方應用程式存取',
    'Restricting access will immediately block all unapproved applications and will disable SSH keys created before February 2014.':
      '限制存取將立即封鎖所有未核准的應用程式，並停用 2014年2月之前建立的 SSH 金鑰。',
    // OAuth 应用访问申请详细信息（/orgs/<组织>/policies/applications/<id>，organization 页面类型）
    'Applications act on your behalf to access your data based on the permissions you grant them. Organizations control which applications are allowed to access their private data. Applications authorized by members will always have access to public data in your organization.':
      '應用程式會依你授予的權限代表你存取資料。組織可以控制允許哪些應用程式存取其不公開的資料。成員授權的應用程式一律可以存取組織的公開資料。',
    'Read about organization OAuth app access restrictions.': '瞭解組織的 OAuth 應用程式存取限制。',

    // 个人访问令牌：精细
    'By default, fine-grained personal access tokens cannot access content owned by your organization via the Public API or Git. This includes both public and private resources such as repositories.':
      '根據預設，精細個人存取權杖無法透過公開 API 或 Git 存取組織擁有的內容。這包括儲存庫等公開和私人資源。',
    'Allow access via fine-grained personal access tokens': '允許透過精細個人存取權杖存取',
    "API and Git access will be allowed using approved organization member's fine-grained personal access tokens":
      '允許使用組織成員已核准的精細個人存取權杖存取 API 和 Git',
    'API and Git access will be allowed using approved organization member’s fine-grained personal access tokens':
      '允許使用組織成員已核准的精細個人存取權杖存取 API 和 Git',
    'Restrict access via fine-grained personal access tokens': '限制透過精細個人存取權杖存取',
    'Organization members will not be allowed to access your organization using a fine-grained personal access token':
      '組織成員將無法使用精細個人存取權杖存取你的組織',
    'Require approval of fine-grained personal access tokens': '精細個人存取權杖需要核准',
    'Access requests by organization members can be subject to review by administrator before approval.':
      '組織成員的存取請求可在核准前交由管理員審查。',
    'Require administrator approval': '需要管理員核准',
    'All access requests by organization members to this organization must be approved before the token is usable.':
      '組織成員對此組織的所有存取請求都必須獲得核准，權杖才能使用。',
    'Do not require administrator approval': '不需要管理員核准',
    'Tokens requested for this organization will work immediately, and organization members are not required to provide a justification when creating the token.':
      '為此組織請求的權杖會立即生效，組織成員建立權杖時不必提供理由。',
    'Set maximum lifetimes for personal access tokens': '設定個人存取權杖的最長有效期',
    'Control the maximum lifetime for fine-grained personal access tokens in your organizations. If set, your organization members can only use fine-grained personal access tokens against your resources if the tokens are set to expire within the period you provide.':
      '控制組織中精細個人存取權杖的最長有效期。設定後，組織成員只能使用在你指定期限內到期的精細個人存取權杖存取你的資源。',
    'Learn more about token expiration policies.': '瞭解權杖到期政策。',
    'Fine-grained personal access tokens must expire': '精細個人存取權杖必須設定到期日',
    'Select a maximum lifetime for fine-grained personal access tokens to be allowed to access your organizations.':
      '選擇允許存取組織的精細個人存取權杖的最長有效期。',

    // 个人访问令牌：经典
    'Restrict personal access tokens (classic) from accessing your organizations': '限制個人存取權杖（傳統）存取你的組織',
    'By default, personal access tokens (classic) can access content owned by your organization via the GitHub API or Git over HTTPS. This includes both public and private resources such as repositories.':
      '根據預設，個人存取權杖（傳統）可以透過 GitHub API 或使用 HTTPS 的 Git 存取組織擁有的內容。這包括儲存庫等公開和私人資源。',
    'Allow access via personal access tokens (classic)': '允許透過個人存取權杖（傳統）存取',
    "API and Git access will be allowed using an organization member's personal access token (classic)":
      '允許使用組織成員的個人存取權杖（傳統）存取 API 和 Git',
    'API and Git access will be allowed using an organization member’s personal access token (classic)':
      '允許使用組織成員的個人存取權杖（傳統）存取 API 和 Git',
    'Restrict access via personal access tokens (classic)': '限制透過個人存取權杖（傳統）存取',
    'Organization members will not be allowed to access your organization using a personal access token (classic)':
      '組織成員將無法使用個人存取權杖（傳統）存取你的組織',
    'Control the maximum lifetime for personal access tokens (classic) in your organizations. If set, your organization members can only use personal access tokens (classic) against your resources if the tokens are set to expire within the period you provide.':
      '控制組織中個人存取權杖（傳統）的最長有效期。設定後，組織成員只能使用在你指定期限內到期的個人存取權杖（傳統）存取你的資源。',
    'Personal access tokens (classic) must expire': '個人存取權杖（傳統）必須設定到期日',
    'Select a maximum lifetime for personal access tokens (classic) to be allowed to access your organizations.':
      '選擇允許存取組織的個人存取權杖（傳統）的最長有效期。',

    // 活动令牌与请求
    'Filter active fine-grained tokens': '篩選作用中的精細權杖',
    "There aren't any fine-grained tokens for this organization": '此組織沒有任何精細權杖',
    'There aren’t any fine-grained tokens for this organization': '此組織沒有任何精細權杖',
    'Fine-grained personal access token requests': '精細個人存取權杖請求',
    'Fine-grained Personal Access Token Requests': '精細個人存取權杖請求',
    'Filter fine-grained personal access tokens requests': '篩選精細個人存取權杖請求',
    "There aren't any personal access token requests for this organization": '此組織沒有任何個人存取權杖請求',
    'There aren’t any personal access token requests for this organization': '此組織沒有任何個人存取權杖請求',
    'Approve...': '核准...',
    'Approve…': '核准…',
    'Deny...': '拒絕...',
    'Deny…': '拒絕…',
    'Revoke...': '撤銷...',
    'Revoke…': '撤銷…',

    // GitHub 应用管理者
    'Choose members that are allowed to manage all GitHub Apps belonging to this organization.':
      '選擇允許管理此組織所有 GitHub 應用程式的成員。',
    'To see or change who can manage GitHub Apps belonging to your organization, see':
      '若要查看或變更誰可以管理組織的 GitHub 應用程式，請參閱',
    'organization role assignments': '組織角色指派',
    '. All organization owners can manage Apps, as well as users and teams with one or more of the app management permissions.':
      '。所有組織擁有者都可以管理應用程式，擁有一項或多項應用程式管理權限的使用者和團隊也可以。',
    'Organization owner': '組織擁有者'
  },
  scoped: {
    // 已安装的 GitHub 应用（与个人设置共用）
    'Pending GitHub Apps installation requests': '待處理的 GitHub 應用程式安裝請求',
    'Pending installation requests': '待處理的安裝請求',
    Installed: '已安裝',
    Suspended: '已暫停',
    'Developed by': '開發人員',
    'Installed on': '安裝於',
    'App settings': '應用程式設定',
    'Report Abuse': '檢舉濫用',
    'Owned by': '擁有者',
    'Only select repositories': '僅限選取的儲存庫',
    'Select at least one repository.': '至少選取一個儲存庫。',
    // 句号随原文（与个人开发人员设置同译）
    'Select at least one repository. Also includes public repositories (read-only).': '至少選取一個儲存庫。同時包含公開儲存庫（唯讀）。',
    'This applies to all current and future repositories owned by the resource owner. Also includes public repositories (read-only).':
      '適用於資源擁有者擁有的所有現有和未來儲存庫。同時包含公開儲存庫（唯讀）。',
    'Suspend your installation': '暫停安裝',
    'This will block the app access to your resources.': '這將封鎖該應用程式對你資源的存取。',
    Suspend: '暫停',
    Unsuspend: '取消暫停',
    'Uninstall this app': '解除安裝此應用程式',
    'This will remove the app and revoke access to all resources.': '這將移除該應用程式並撤銷其對所有資源的存取權。',

    // 应用管理者
    Management: '管理',
    'Search by username or full name': '依使用者名稱或全名搜尋',
    Grant: '授予',

    // OAuth 应用策略
    'Policy:': '政策：',
    'Access restricted': '存取受限',
    'No restrictions': '無限制',
    Denied: '已拒絕',
    'No pending requests': '沒有待處理的請求',
    'Applications owned by': '由',
    'Read more at GitHub Help.': '詳情請參閱 GitHub 說明。',
    'Grant access': '授予存取權',
    'Deny access': '拒絕存取',
    'Revoke access': '撤銷存取權',

    // 个人访问令牌（与个人开发人员设置共用）
    'Fine-grained tokens': '精細權杖',
    'Fine-grained personal access tokens': '精細個人存取權杖',
    'Tokens (classic)': '權杖（傳統）',
    'Custom...': '自訂...',
    'Custom…': '自訂…',
    'between 1 and 366 days': '介於 1 到 366 天之間',
    Tokens: '權杖',
    Requests: '請求',
    'Filter users': '篩選使用者',
    'Filter by permission': '依權限篩選',
    'Filter permissions': '篩選權限',
    read: '讀取',
    'Never used': '從未使用',
    Expires: '到期日',
    Created: '建立於',
    'No description': '沒有描述',
    Review: '審查',
    'Approve request': '核准請求',
    'Deny request': '拒絕請求',
    'Request reason': '請求理由',

    // 精细令牌权限名：其余由 developer 沿用个人开发人员设置
    'Repository announcement banners': '儲存庫公告橫幅',
    Plan: '方案'
  },
  regexp: [
    [new RegExp(`^Applications owned by ${ORG} always have access\\.$`), '由 $1 擁有的應用程式一律具有存取權。'],
    [new RegExp(`^Applications owned by ${ORG} are always trusted\\.$`), '由 $1 擁有的應用程式一律受信任。'],
    [
      new RegExp(`^All applications authorized by organization members have access to ${ORG}[’']s data\\.$`),
      '組織成員授權的所有應用程式都可以存取 $1 的資料。'
    ],
    // 令牌与请求批量操作：「2 tokens selected...」（省略号随原文）
    [/^(\d+) requests? selected(\.\.\.|…)$/, '已選取 $1 個請求$2'],
    [/^(\d+) tokens? selected(\.\.\.|…)$/, '已選取 $1 個權杖$2'],
    // 活动令牌列表：过期时间与最近使用（与个人开发人员设置译法一致）
    [
      new RegExp(`^(Expires|Expired) on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, state: string, date: string, dot: string) =>
        state === 'Expires'
          ? `${joinCjk(joinCjk('將於', translateTokenDate(date)), '到期')}${period(dot)}`
          : `${joinCjk(joinCjk('已於', translateTokenDate(date)), '過期')}${period(dot)}`
    ],
    [new RegExp(`^(${LAST_USED_SOURCE})$`), (_, usage: string) => translateUsage(usage)],
    [new RegExp(`^(${USAGE_SOURCE}) •$`), (_, usage: string) => `${translateUsage(usage)} •`]
  ]
} satisfies PageDictionary
