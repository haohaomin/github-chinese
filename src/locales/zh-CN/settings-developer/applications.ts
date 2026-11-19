import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, TIME_SOURCE, joinCjk, translateTime } from '../helpers'
import { SUSPEND_TIME_SOURCE, translateSuspendTime } from './apps'
import { USAGE_SOURCE, translateUsage } from './keys'

/**
 * 「Report / Revoke + 应用名」的应用名：以大写字母或数字开头，且不是常见的界面用词
 * （Revoke all sessions、Report a bug 等不是应用名，交给其他词条或保留原文）。
 */
const APP_NAME_SOURCE =
  '(?!(?:All|Access|Authorization|Selected|Sessions?|Tokens?|Keys?|Abuse|Spam|Content|This|It|An?|The)\\b)([A-Z0-9].*)'

/**
 * 应用（/settings/installations、/settings/apps/authorizations、/settings/applications）：
 * 已安装的 GitHub 应用及其配置页、权限更新请求、已授权的 GitHub 应用和 OAuth 应用、
 * 应用授权详情（/settings/connections/applications/…）。
 * 与组织设置、授权页同名的短语放 scoped；个人设置独有的句子放 static。
 */
export default {
  static: {
    // 已安装的 GitHub App
    'Permission updates requested.': '已请求更新权限。',
    'No installed GitHub Apps': '暂无已安装的 GitHub 应用',
    'You have no GitHub Apps installed on this account.': '此帐户未安装任何 GitHub 应用。',
    'Visit Marketplace': '访问市场',
    'My GitHub Apps': '我的 GitHub 应用',

    // 安装配置页
    'Unsuspend your installation': '恢复安装',
    'This grant the app access to your resources.': '这将允许该应用访问你的资源。',
    'This will grant the app access to your resources.': '这将允许该应用访问你的资源。',
    'Are you sure you want to suspend this GitHub App?': '确定要暂停此 GitHub 应用吗？',
    'Your app has been unsuspended': '已恢复该应用',
    'Your app has been unsuspended.': '已恢复该应用。',
    // 「Your installation was suspended by you on <relative-time>.」
    'Your installation was suspended by you on': '此安装已由你暂停于',
    // 「Read more about connecting with third-party applications at <a>GitHub Help</a>.」
    'Read more about connecting with third-party applications at': '有关连接第三方应用的详情请参阅',
    'Read more about connecting with third-party applications at GitHub Help.': '有关连接第三方应用的详情请参阅 GitHub 帮助。',
    'App Suspended': '应用已暂停',
    'This integration has been suspended. Repository access can be modified once the integration is reinstated.':
      '此集成已暂停。恢复后才能修改存储库访问权限。',
    'Label: App Suspended': '标签：应用已暂停',

    // 权限更新请求
    'is requesting updated permissions': '正在请求更新权限',
    'is requesting an update to its permissions.': '正在请求更新其权限。',
    'Show unchanged permissions': '显示未更改的权限',
    'Hide unchanged permissions': '隐藏未更改的权限',
    'Accept new permissions': '接受新权限',

    // 已授权的 OAuth 应用、GitHub 应用
    'No authorized applications': '暂无已授权的应用',
    'You have no applications authorized to access your account.': '你未授权任何应用访问你的帐户。',
    'Loading authorizations...': '正在加载授权...',
    'Loading authorizations…': '正在加载授权…',
    'Sorry, something went wrong loading authorizations': '加载授权时出错',
    'You have granted': '你已授权',
    'You have authorized': '你已授权',
    'access to your account.': '访问你的帐户。',
    'to access your account.': '访问你的帐户。',
    'Are you sure you want to revoke authorization?': '确定要撤销授权吗？',
    'will no longer be able to access your GitHub account. You cannot undo this action.': '将无法再访问你的 GitHub 帐户。此操作无法撤销。',
    'will no longer be able to access the GitHub API. You cannot undo this action.': '将无法再访问 GitHub API。此操作无法撤销。',
    'I understand, revoke access': '我已了解，撤销访问权限',
    'Revoking…': '撤销中…',
    'Revoking...': '撤销中...',
    'Revoking will deny future access to your account': '撤销后该应用将无法再访问你的帐户',
    'Are you sure you want to revoke access for all applications?': '确定要撤销所有应用的访问权限吗？',
    'This will revoke access for': '这将撤销',
    'all third-party': '所有第三方',
    'OAuth applications. This action cannot be undone.': 'OAuth 应用的访问权限。此操作无法撤销。',
    'This will revoke access for all third-party OAuth applications. This action cannot be undone.':
      '这将撤销所有第三方 OAuth 应用的访问权限。此操作无法撤销。',
    'Any SSH keys created on your behalf by applications will also be deleted.': '应用代表你创建的 SSH 密钥也将被删除。',
    'Type your username to confirm.': '输入你的用户名以确认。',
    'I understand, revoke access for everything': '我已了解，撤销所有访问权限',

    // 应用授权详情
    'Applications act on your behalf to access your data based on the permissions you grant them. Organizations control which applications are allowed to access their private data. Applications you authorize will always have access to public data in your organizations.':
      '应用会根据你授予的权限代表你访问数据。组织可以控制允许哪些应用访问其私密数据。你授权的应用始终可以访问你所在组织的公开数据。',
    'Read about third-party access.': '了解第三方访问。',
    // 「approval requested by <a>用户</a>」
    'approval requested by': '申请人',
    'No private access': '无私密访问权限',
    'Review third-party application access request': '审查第三方应用访问请求',
    // 「Granting access will give … private data in the <strong>组织</strong> organization.」
    'Granting access will give this application the ability to request access to private data in the':
      '授予访问权限后此应用将能够请求访问以下组织的私密数据',
    'Denying access will remove this application’s ability to request access to private data in the':
      '拒绝访问后此应用将无法再请求访问以下组织的私密数据',
    "Denying access will remove this application's ability to request access to private data in the":
      '拒绝访问后此应用将无法再请求访问以下组织的私密数据'
  },
  scoped: {
    // 标签页（Installed GitHub Apps 等与存储库设置相同的说明由 repo-settings 收录；Configure、Revoke 等按钮由 common-ui 收录）
    'Authorized GitHub Apps': '授权的 GitHub 应用',
    'Authorized OAuth Apps': '授权的 OAuth 应用',
    'Pending GitHub Apps installation requests': '待处理的 GitHub 应用安装请求',
    Suspended: '已暂停',
    'Review request': '审查请求',

    // 安装配置页（与组织设置共用）
    Installed: '已安装',
    'Developed by': '开发人员',
    'App settings': '应用设置',
    'This applies to all current and future repositories owned by the resource owner. Also includes public repositories (read-only).':
      '适用于资源所有者拥有的所有现有和将来的存储库。同时包括公共存储库（只读）。',
    'Select at least one repository. Also includes public repositories (read-only).': '至少选择一个存储库。同时包括公共存储库（只读）。',
    'Only select repositories': '仅选定的存储库',
    'Suspend your installation': '暂停安装',
    'This will block the app access to your resources.': '这将阻止该应用访问你的资源。',
    Suspend: '暂停',
    Unsuspend: '恢复',
    'Uninstall this app': '卸载此应用',
    'This will remove the app and revoke access to all resources.': '这将删除该应用并撤销其对所有资源的访问权限。',
    'GitHub Help': 'GitHub 帮助',
    'New request': '新请求',

    // 已授权的应用（Danger zone、Revoke all 等与帐户设置相同的按钮由 settings-account 收录）
    'Revoke all': '全部撤销',
    'Revoke access': '撤销访问权限',
    'Report Abuse': '举报滥用行为',
    // 每个已授权应用的操作菜单按钮
    'Show more options': '显示更多选项',
    'Recently used': '最近使用',
    'Owned by': '所有者',

    // 应用授权详情（与授权页共用）
    'Organization access': '组织访问权限',
    'Organizations and teams': '组织和团队',
    'Profile information (read-only)': '个人资料信息（只读）',
    'User public keys': '用户公钥',
    'Repository hooks': '存储库 Web 钩子',
    'Organization hooks': '组织 Web 钩子',
    'Security events': '安全事件',
    'Repository delete': '删除存储库',
    'Commit status': '提交状态',
    Workflow: '工作流',
    // 访问级别：read / write access → 读取 / 写入访问权限
    'Read-only access': '只读访问权限',
    'Read and write access': '读取和写入访问权限',
    'Full access': '完全访问权限',
    'Public and': '公共和',
    private: '专用',
    '(read)': '（只读）',
    'Deploy keys': '部署密钥',
    'Webhooks and services': 'Web 钩子和服务',
    'Collaboration invites': '协作邀请',
    Grant: '授予',
    Request: '请求',
    Requested: '已请求',
    'Currently:': '当前：',
    'Grant access': '授予访问权限',
    'Deny access': '拒绝访问',
    'organization.': '组织。'
  },
  regexp: [
    // 已授权的应用：数量、使用情况、所有者
    [/^You have granted (\d+) applications? access to your account\.$/, '你已授权 $1 个应用访问你的帐户。'],
    [/^You have authorized (\d+) applications? to access your account\.$/, '你已授权 $1 个应用访问你的帐户。'],
    [/^(\d+) applications?$/, '$1 个应用'],
    [new RegExp(`^(${USAGE_SOURCE}) · Owned by$`), (_, usage: string) => `${translateUsage(usage)} · 所有者`],
    [
      new RegExp(`^(${USAGE_SOURCE}) · Owned by ([\\w.-]+)$`),
      (_, usage: string, owner: string) => `${translateUsage(usage)} · 所有者 ${owner}`
    ],
    [/^Owned by ([\w.-]+)$/, '所有者 $1'],
    [
      /^(.+) will no longer be able to access your GitHub account\. You cannot undo this action\.$/,
      '$1 将无法再访问你的 GitHub 帐户。此操作无法撤销。'
    ],
    [
      /^(.+) will no longer be able to access the GitHub API\. You cannot undo this action\.$/,
      '$1 将无法再访问 GitHub API。此操作无法撤销。'
    ],
    [/^(.+) has been revoked from your account\.$/, '已从你的帐户撤销 $1。'],
    // 已授权的 OAuth 应用：每个应用的操作菜单与确认对话框（应用名原样保留）
    [/^Reporting (.+) will contact Support about abuse on the application\.$/, '举报 $1 将联系支持团队处理该应用的滥用问题。'],
    [new RegExp(`^Report ${APP_NAME_SOURCE}$`), '举报 $1'],
    [new RegExp(`^Revoke ${APP_NAME_SOURCE}$`), '撤销 $1'],

    // 安装配置页
    [new RegExp(`^Installed (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '安装')],
    [
      new RegExp(`^Your installation was suspended by you on (${SUSPEND_TIME_SOURCE})\\.$`),
      (_, time: string) => `你已于 ${translateSuspendTime(time)}暂停此安装。`
    ],
    [
      new RegExp(`^Your installation was suspended by you on (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk(joinCjk('你已于', translateTime(date)), '暂停此安装')}${dot ? '。' : ''}`
    ],
    [/^Uninstall ["“](.+)["”]$/, '卸载“$1”'],
    [
      /^This action cannot be undone\. Are you sure you want to uninstall this GitHub App from (\d+) repositor(?:y|ies)\?$/,
      '此操作无法撤销。确定要从 $1 个存储库中卸载此 GitHub 应用吗？'
    ],
    [
      /^This action cannot be undone\. Are you sure you want to uninstall this GitHub App from all repositories\?$/,
      '此操作无法撤销。确定要从所有存储库中卸载此 GitHub 应用吗？'
    ],
    [/^You['’]re all set! (.+) has been uninstalled\.$/, '已卸载 $1。'],
    [/^You['’]re all set! A job has been queued to uninstall the ['‘](.+)['’] app\.$/, '已排队卸载 $1 应用。'],
    [/^Okay, (.+) was installed on the (@[\w-]+) account\.$/, '已将 $1 安装到 $2 帐户。'],
    [/^Okay, (.+) was updated for the (@[\w-]+) account\.$/, '已更新 $2 帐户的 $1。'],

    // 权限更新请求（原文无逗号，译文不加）
    [/^(.+) is requesting updated permissions$/, '$1 正在请求更新权限'],
    [
      /^The (.+) app will retain its current permissions if you choose not to accept the new permissions\.$/,
      '$1 应用将在你不接受新权限时保留其当前权限。'
    ],

    // 应用授权详情：组织访问
    [/^(.+) is authorized to access this organization['’]s resources$/, '$1 已获授权访问此组织的资源'],
    [/^(.+) is denied access (?:to )?this organization['’]s resources$/, '$1 已被拒绝访问此组织的资源']
    // 「Created <time>」由 common-ui 的时间词条翻译
  ]
} satisfies PageDictionary
