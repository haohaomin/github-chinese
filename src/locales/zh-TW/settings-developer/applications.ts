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
 * 术语：app → 應用程式，install / uninstall → 安裝 / 解除安裝，suspend / unsuspend → 暫停 / 取消暫停，
 * revoke → 撤銷，report abuse → 檢舉濫用，owner → 擁有者；与组织第三方访问（org-settings/third-party.ts）、
 * 授权页（auth/oauth.ts）同键同译。非可见度义的 private data → 不公開資料。
 */
export default {
  static: {
    // 已安装的 GitHub App
    'Permission updates requested.': '已請求更新權限。',
    'No installed GitHub Apps': '沒有已安裝的 GitHub 應用程式',
    'You have no GitHub Apps installed on this account.': '此帳號未安裝任何 GitHub 應用程式。',
    'Visit Marketplace': '造訪市集',
    'My GitHub Apps': '我的 GitHub 應用程式',

    // 安装配置页
    'Unsuspend your installation': '取消暫停安裝',
    'This grant the app access to your resources.': '這將授予該應用程式對你資源的存取權。',
    'This will grant the app access to your resources.': '這將授予該應用程式對你資源的存取權。',
    'Are you sure you want to suspend this GitHub App?': '確定要暫停此 GitHub 應用程式嗎？',
    'Your app has been unsuspended': '你的應用程式已取消暫停',
    'Your app has been unsuspended.': '你的應用程式已取消暫停。',
    // 「Your installation was suspended by you on <relative-time>.」
    'Your installation was suspended by you on': '此安裝已由你暫停於',
    // 「Read more about connecting with third-party applications at <a>GitHub Help</a>.」（原文无逗号，译文不加）
    'Read more about connecting with third-party applications at': '如需連接第三方應用程式的詳細資訊請參閱',
    'Read more about connecting with third-party applications at GitHub Help.': '如需連接第三方應用程式的詳細資訊請參閱 GitHub 說明。',
    'App Suspended': '應用程式已暫停',
    'This integration has been suspended. Repository access can be modified once the integration is reinstated.':
      '此整合已暫停。恢復後才能修改儲存庫存取權。',
    'Label: App Suspended': '標籤：應用程式已暫停',

    // 权限更新请求
    'is requesting updated permissions': '正在請求更新權限',
    'is requesting an update to its permissions.': '正在請求更新其權限。',
    'Show unchanged permissions': '顯示未變更的權限',
    'Hide unchanged permissions': '隱藏未變更的權限',
    'Accept new permissions': '接受新權限',

    // 已授权的 OAuth 应用、GitHub 应用
    'No authorized applications': '沒有已授權的應用程式',
    'You have no applications authorized to access your account.': '你沒有授權任何應用程式存取你的帳號。',
    'Loading authorizations...': '正在載入授權...',
    'Loading authorizations…': '正在載入授權…',
    'Sorry, something went wrong loading authorizations': '載入授權時發生錯誤',
    // 「You have granted <strong>3 applications</strong> access to your account.」
    'You have granted': '你已授權',
    'You have authorized': '你已授權',
    'access to your account.': '存取你的帳號。',
    'to access your account.': '存取你的帳號。',
    'Are you sure you want to revoke authorization?': '確定要撤銷授權嗎？',
    'will no longer be able to access your GitHub account. You cannot undo this action.':
      '將無法再存取你的 GitHub 帳號。你無法復原此動作。',
    'will no longer be able to access the GitHub API. You cannot undo this action.': '將無法再存取 GitHub API。你無法復原此動作。',
    'I understand, revoke access': '我瞭解，撤銷存取權',
    'Revoking…': '撤銷中…',
    'Revoking...': '撤銷中...',
    'Revoking will deny future access to your account': '撤銷後該應用程式將無法再存取你的帳號',
    'Are you sure you want to revoke access for all applications?': '確定要撤銷所有應用程式的存取權嗎？',
    // 「This will revoke access for <strong>all third-party</strong> OAuth applications. …」
    'This will revoke access for': '這將撤銷',
    'all third-party': '所有第三方',
    'OAuth applications. This action cannot be undone.': 'OAuth 應用程式的存取權。此動作無法復原。',
    'This will revoke access for all third-party OAuth applications. This action cannot be undone.':
      '這將撤銷所有第三方 OAuth 應用程式的存取權。此動作無法復原。',
    'Any SSH keys created on your behalf by applications will also be deleted.': '應用程式代表你建立的所有 SSH 金鑰也會一併刪除。',
    'Type your username to confirm.': '輸入你的使用者名稱以確認。',
    'I understand, revoke access for everything': '我瞭解，撤銷所有存取權',

    // 应用授权详情
    'Applications act on your behalf to access your data based on the permissions you grant them. Organizations control which applications are allowed to access their private data. Applications you authorize will always have access to public data in your organizations.':
      '應用程式會依你授予的權限代表你存取資料。組織可以控制允許哪些應用程式存取其不公開的資料。你授權的應用程式一律可以存取你所屬組織的公開資料。',
    'Read about third-party access.': '瞭解第三方存取。',
    // 「approval requested by <a>用户</a>」
    'approval requested by': '申請人',
    'No private access': '無法存取不公開資料',
    'Review third-party application access request': '審查第三方應用程式存取請求',
    // 「Granting access will give … private data in the <strong>组织</strong> organization.」
    // 与 org-settings/third-party.ts 同一句式：「下列組織中的不公開資料」+ 组织名 +「組織。」
    'Granting access will give this application the ability to request access to private data in the':
      '授予存取權後此應用程式將能請求存取下列組織中的不公開資料',
    'Denying access will remove this application’s ability to request access to private data in the':
      '拒絕存取後此應用程式將無法再請求存取下列組織中的不公開資料',
    "Denying access will remove this application's ability to request access to private data in the":
      '拒絕存取後此應用程式將無法再請求存取下列組織中的不公開資料'
  },
  scoped: {
    // 标签页（Installed GitHub Apps 等与存储库设置相同的说明由 repo-settings 收录；Configure、Revoke 等按钮由 common-ui 收录）
    'Authorized GitHub Apps': '已授權的 GitHub 應用程式',
    'Authorized OAuth Apps': '已授權的 OAuth 應用程式',
    'Pending GitHub Apps installation requests': '待處理的 GitHub 應用程式安裝請求',
    Suspended: '已暫停',
    'Review request': '審查請求',

    // 安装配置页（与组织设置共用）
    Installed: '已安裝',
    'Developed by': '開發人員',
    'App settings': '應用程式設定',
    'This applies to all current and future repositories owned by the resource owner. Also includes public repositories (read-only).':
      '適用於資源擁有者擁有的所有現有和未來儲存庫。同時包含公開儲存庫（唯讀）。',
    'Select at least one repository. Also includes public repositories (read-only).': '至少選取一個儲存庫。同時包含公開儲存庫（唯讀）。',
    'Only select repositories': '僅限選取的儲存庫',
    'Suspend your installation': '暫停安裝',
    'This will block the app access to your resources.': '這將封鎖該應用程式對你資源的存取。',
    Suspend: '暫停',
    Unsuspend: '取消暫停',
    'Uninstall this app': '解除安裝此應用程式',
    'This will remove the app and revoke access to all resources.': '這將移除該應用程式並撤銷其對所有資源的存取權。',
    'GitHub Help': 'GitHub 說明',
    'New request': '新請求',

    // 已授权的应用（Danger zone、Revoke all 等与帐户设置相同的按钮由 settings-account 收录）
    'Revoke all': '全部撤銷',
    'Revoke access': '撤銷存取權',
    'Report Abuse': '檢舉濫用',
    // 每个已授权应用的操作菜单按钮
    'Show more options': '顯示更多選項',
    'Recently used': '最近使用',
    'Owned by': '擁有者',

    // 应用授权详情（与授权页共用）
    'Organization access': '組織存取權',
    'Organizations and teams': '組織和團隊',
    'Profile information (read-only)': '個人檔案資訊（唯讀）',
    'User public keys': '使用者公開金鑰',
    'Repository hooks': '儲存庫 Web 鉤子',
    'Organization hooks': '組織 Web 鉤子',
    'Security events': '安全性事件',
    'Repository delete': '刪除儲存庫',
    'Commit status': '提交狀態',
    Workflow: '工作流程',
    // 访问级别：read / write access → 讀取權限 / 寫入權限（与 auth/oauth.ts 一致）
    'Read-only access': '唯讀權限',
    'Read and write access': '讀取和寫入權限',
    'Full access': '完整權限',
    'Public and': '公開和',
    private: '私人',
    '(read)': '（唯讀）',
    'Deploy keys': '部署金鑰',
    'Webhooks and services': 'Web 鉤子和服務',
    'Collaboration invites': '協作邀請',
    Grant: '授予',
    Request: '請求',
    Requested: '已請求',
    'Currently:': '目前：',
    'Grant access': '授予存取權',
    'Deny access': '拒絕存取',
    'organization.': '組織。'
  },
  regexp: [
    // 已授权的应用：数量、使用情况、拥有者
    [/^You have granted (\d+) applications? access to your account\.$/, '你已授權 $1 個應用程式存取你的帳號。'],
    [/^You have authorized (\d+) applications? to access your account\.$/, '你已授權 $1 個應用程式存取你的帳號。'],
    [/^(\d+) applications?$/, '$1 個應用程式'],
    [new RegExp(`^(${USAGE_SOURCE}) · Owned by$`), (_, usage: string) => `${translateUsage(usage)} · 擁有者`],
    [
      new RegExp(`^(${USAGE_SOURCE}) · Owned by ([\\w.-]+)$`),
      (_, usage: string, owner: string) => `${translateUsage(usage)} · 擁有者 ${owner}`
    ],
    [/^Owned by ([\w.-]+)$/, '擁有者 $1'],
    [
      /^(.+) will no longer be able to access your GitHub account\. You cannot undo this action\.$/,
      '$1 將無法再存取你的 GitHub 帳號。你無法復原此動作。'
    ],
    [
      /^(.+) will no longer be able to access the GitHub API\. You cannot undo this action\.$/,
      '$1 將無法再存取 GitHub API。你無法復原此動作。'
    ],
    [/^(.+) has been revoked from your account\.$/, '已從你的帳號撤銷 $1。'],
    // 已授权的 OAuth 应用：每个应用的操作菜单与确认对话框（应用名原样保留）
    [/^Reporting (.+) will contact Support about abuse on the application\.$/, '檢舉 $1 會就該應用程式的濫用行為聯絡支援團隊。'],
    [new RegExp(`^Report ${APP_NAME_SOURCE}$`), '檢舉 $1'],
    [new RegExp(`^Revoke ${APP_NAME_SOURCE}$`), '撤銷 $1'],

    // 安装配置页
    [new RegExp(`^Installed (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '安裝')],
    [
      new RegExp(`^Your installation was suspended by you on (${SUSPEND_TIME_SOURCE})\\.$`),
      (_, time: string) => `你已於 ${translateSuspendTime(time)}暫停此安裝。`
    ],
    [
      new RegExp(`^Your installation was suspended by you on (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk(joinCjk('你已於', translateTime(date)), '暫停此安裝')}${dot ? '。' : ''}`
    ],
    // 应用名两侧的引号随原文，作「」
    [/^Uninstall ["“](.+)["”]$/, '解除安裝「$1」'],
    [
      /^This action cannot be undone\. Are you sure you want to uninstall this GitHub App from (\d+) repositor(?:y|ies)\?$/,
      '此動作無法復原。確定要從 $1 個儲存庫解除安裝此 GitHub 應用程式嗎？'
    ],
    [
      /^This action cannot be undone\. Are you sure you want to uninstall this GitHub App from all repositories\?$/,
      '此動作無法復原。確定要從所有儲存庫解除安裝此 GitHub 應用程式嗎？'
    ],
    [/^You['’]re all set! (.+) has been uninstalled\.$/, '已解除安裝 $1。'],
    [/^You['’]re all set! A job has been queued to uninstall the ['‘](.+)['’] app\.$/, '已將解除安裝「$1」應用程式的作業排入佇列。'],
    [/^Okay, (.+) was installed on the (@[\w-]+) account\.$/, '已將 $1 安裝到 $2 帳號。'],
    [/^Okay, (.+) was updated for the (@[\w-]+) account\.$/, '已更新 $2 帳號的 $1。'],

    // 权限更新请求（原文无逗号，译文不加）
    [/^(.+) is requesting updated permissions$/, '$1 正在請求更新權限'],
    [
      /^The (.+) app will retain its current permissions if you choose not to accept the new permissions\.$/,
      '$1 應用程式會在你不接受新權限時保留目前的權限。'
    ],

    // 应用授权详情：组织访问
    [/^(.+) is authorized to access this organization['’]s resources$/, '$1 已獲授權存取此組織的資源'],
    [/^(.+) is denied access (?:to )?this organization['’]s resources$/, '$1 已被拒絕存取此組織的資源']
    // 「Created <time>」由 common-ui 的时间词条翻译
  ]
} satisfies PageDictionary
