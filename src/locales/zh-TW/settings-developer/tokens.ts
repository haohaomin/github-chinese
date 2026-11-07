import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, MONTH_SOURCE, RELATIVE_SOURCE, formatDate, joinCjk, translateTime } from '../helpers'
import { USAGE_SOURCE, translateUsage } from './keys'

const WEEKDAYS: Readonly<Record<string, string>> = {
  Sun: '週日',
  Mon: '週一',
  Tue: '週二',
  Wed: '週三',
  Thu: '週四',
  Fri: '週五',
  Sat: '週六'
}

const MONTH_NUMBERS: Readonly<Record<string, number>> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
}

/** 令牌页的日期格式：“Tue, Nov 25 2025”（不含捕获组） */
export const WEEKDAY_DATE_SOURCE = `(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat), ${MONTH_SOURCE} \\d{1,2},? \\d{4}`

const WEEKDAY_DATE_RE = new RegExp(`^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (${MONTH_SOURCE}) (\\d{1,2}),? (\\d{4})$`)

/** 令牌日期：带星期 → 2025 年 11 月 25 日週二；其余交给 translateTime */
export function translateTokenDate(text: string): string {
  const match = WEEKDAY_DATE_RE.exec(text)
  if (!match) return translateTime(text)
  const month = MONTH_NUMBERS[match[2]!.slice(0, 3).toLowerCase()]
  if (month === undefined) return text
  return `${formatDate(Number(match[4]), month, Number(match[3]))}${WEEKDAYS[match[1]!] ?? ''}`
}

const ANY_DATE_SOURCE = `(?:${WEEKDAY_DATE_SOURCE}|${DATE_SOURCE})`

/** 中文前后缀与令牌日期拼接：已於 + 2025 年 11 月 25 日 + 過期 → 已於 2025 年 11 月 25 日過期 */
function datePhrase(prefix: string, date: string, suffix = ''): string {
  return joinCjk(joinCjk(prefix, translateTokenDate(date)), suffix)
}

/** 句号：原文有则补全角句号 */
function period(dot: string): string {
  return dot ? '。' : ''
}

const OWNER_KIND: Readonly<Record<string, string>> = { organization: '組織', enterprise: '企業' }

/** 令牌策略的设定方：“acme organization” → acme 組織；名称原样保留 */
function policyOwner(name: string): string {
  const match = /^(.+) (organization|enterprise)$/.exec(name)
  return match ? `${match[1]} ${OWNER_KIND[match[2]!] ?? match[2]}` : name
}

/**
 * 个人访问令牌：精细（/settings/personal-access-tokens…）与经典（/settings/tokens…）的
 * 列表、新建表单、详情、重新生成，以及经典令牌的作用域说明。
 * 作用域代码（repo、workflow 等）保留英文，只翻译说明文字。
 * 术语：token → 權杖，generate → 產生，expire / expiration → 到期（已过期作「過期」），scope → 範圍，
 * Full control → 完全控制（Windows 繁中权限名），provisioning → 佈建，seat → 席次。
 * 到期日的写法与 org-settings/third-party.ts 一致：Expires → 到期日，Expires on 日期 → 將於 日期 到期。
 */
export default {
  static: {
    // 标签页标题
    'Fine-grained Personal Access Tokens': '精細個人存取權杖',
    'New Fine-grained Personal Access Token': '新增精細個人存取權杖',
    'Personal Access Tokens (Classic)': '個人存取權杖（傳統）',
    'New Personal Access Token (Classic)': '新增個人存取權杖（傳統）',

    // 精细令牌列表
    'Generate new token': '產生新權杖',
    'Generate new token (classic)': '產生新權杖（傳統）',
    'Fine-grained, repo-scoped': '精細、儲存庫範圍',
    'For general use': '一般用途',
    // 「These are fine-grained, repository-scoped tokens suitable for personal <a>API</a> use and for using Git over HTTPS.」
    // 原文只有形容词间的逗号（译作顿号）；「使用」移到 API 之前
    'These are fine-grained, repository-scoped tokens suitable for personal': '這些精細、儲存庫範圍權杖適用於個人使用',
    'use and for using Git over HTTPS.': '以及透過 HTTPS 使用 Git。',
    'These are fine-grained, repository-scoped tokens suitable for personal API use and for using Git over HTTPS.':
      '這些精細、儲存庫範圍權杖適用於個人使用 API 以及透過 HTTPS 使用 Git。',
    'No fine-grained tokens created': '尚未建立精細權杖',
    'Need an API token for scripts or testing? Generate a personal access token for quick access to the GitHub API.':
      '需要用於指令碼或測試的 API 權杖嗎？產生個人存取權杖以快速存取 GitHub API。',
    'Loading expiration ...': '正在載入到期日...',
    'Loading expiration...': '正在載入到期日...',
    'Loading expiration…': '正在載入到期日…',
    'This token has expired.': '此權杖已過期。',
    'This token has expired': '此權杖已過期',
    'To set a new expiration date, you must regenerate the token.': '若要設定新的到期日，必須重新產生權杖。',
    'Make sure to copy your personal access token now as you will not be able to see this again.':
      '請立即複製你的個人存取權杖，之後將無法再次查看。',
    'Are you sure you want to delete this token?': '確定要刪除此權杖嗎？',
    'Any applications or scripts using this token will no longer be able to access the GitHub API. You cannot undo this action.':
      '使用此權杖的應用程式或指令碼將無法再存取 GitHub API。此動作無法復原。',
    'I understand, delete this token': '我瞭解，刪除此權杖',
    'Deleted personal access token': '已刪除個人存取權杖',
    'Copy token': '複製權杖',

    // 新建精细令牌
    'New fine-grained personal access token': '新增精細個人存取權杖',
    'Create a fine-grained, repository-scoped token suitable for personal API use and for using Git over HTTPS.':
      '建立適用於個人使用 API 以及透過 HTTPS 使用 Git 的精細、儲存庫範圍權杖。',
    'Token name': '權杖名稱',
    'A unique name for this token. May be visible to resource owners or users with possession of the token.':
      '此權杖的唯一名稱。資源擁有者或持有此權杖的使用者可能會看到。',
    // 「'<strong>名称</strong>' is available.」：开头的引号在另一个文本节点，引号照原文
    "' is available.": "' 可用。",
    "' is not available. The token name has already been taken.": "' 不可用。權杖名稱已被使用。",
    'Resource owner': '資源擁有者',
    'The token will only be able to make changes to resources owned by the selected resource owner. Tokens can always read all public repositories.':
      '權杖只能變更所選資源擁有者擁有的資源。權杖一律可以讀取所有公開儲存庫。',
    'Select resource owner': '選擇資源擁有者',
    'You may only select resource owners with fine-grained PATs enabled.': '只能選擇已啟用精細 PAT 的資源擁有者。',
    'Authorizing...': '授權中...',
    'Select date *': '選擇日期 *',
    "Expiration date can't be blank": '到期日不能為空白',
    'Expiration date can’t be blank': '到期日不能為空白',
    'No expiration': '無到期日',
    'The token will expire on the selected date': '權杖將於所選日期到期',
    // 「The token will expire on <strong>日期</strong>」
    'The token will expire on': '權杖到期日為',
    'GitHub strongly recommends that you set an expiration date for your token to help keep your information secure.':
      'GitHub 強烈建議你為權杖設定到期日，以確保資訊安全。',
    'Select the repositories this token can access. Personal access tokens can always read from all public repositories on GitHub.com':
      '選擇此權杖可以存取的儲存庫。個人存取權杖一律可以讀取 GitHub.com 上的所有公開儲存庫',
    'Select the repositories this token can access. Personal access tokens can always read from all public repositories on GitHub.com.':
      '選擇此權杖可以存取的儲存庫。個人存取權杖一律可以讀取 GitHub.com 上的所有公開儲存庫。',
    'Read-only access to public repositories.': '公開儲存庫的唯讀存取權。',
    'This applies to all current and future repositories you own. Also includes public repositories (read-only).':
      '適用於你擁有的所有現有和未來儲存庫。同時包含公開儲存庫（唯讀）。',
    'This applies to all current and future repositories that you can access in this organization. Also includes public repositories (read-only).':
      '適用於你在此組織中可以存取的所有現有和未來儲存庫。同時包含公開儲存庫（唯讀）。',
    'Select at least one repository. Max 50 repositories. Also includes public repositories (read-only).':
      '至少選取一個儲存庫。最多 50 個儲存庫。同時包含公開儲存庫（唯讀）。',
    'This token will be ready for use immediately.': '此權杖可立即使用。',
    'Generate token': '產生權杖',
    'Generating...': '產生中...',
    'Generating…': '產生中…',
    'Your new personal access token': '你的新個人存取權杖',
    // 「Your new personal access token <strong>名称</strong> will be ready for use immediately. It will expire on <strong>日期</strong>.」
    'will be ready for use immediately. It will expire on': '可立即使用。到期日為',
    'will be ready for use immediately.': '可立即使用。',

    // 精细令牌详情 / 重新生成：「Access on <a>@用户</a>」「Access on the <strong>组织</strong> organization」
    'Access on': '存取範圍',
    'Access on the': '存取範圍',
    'Your personal access token has been updated': '你的個人存取權杖已更新',
    'Your personal access token has been updated.': '你的個人存取權杖已更新。',
    'Regenerate fine-grained personal access token': '重新產生精細個人存取權杖',
    'Regenerate token': '重新產生權杖',
    'Submitting this form will generate a new token. Be aware that any scripts or applications using this token will need to be updated.':
      '送出此表單將產生新權杖。請注意，所有使用此權杖的指令碼或應用程式都需要更新。',
    // 资源所有者为要求 SAML 单一登录等条件的组织时的授权检查
    'Something went wrong while checking. Please retry.': '檢查時發生錯誤。請重試。',
    'At this time, you do not meet all requirements to access this organization.': '你目前未符合存取此組織的所有要求。',

    // 经典令牌列表
    'Personal access tokens (classic)': '個人存取權杖（傳統）',
    'No personal access token created': '尚未建立個人存取權杖',
    // 「Tokens you have generated that can be used to access the <a>GitHub API</a>.」
    'Tokens you have generated that can be used to access the': '你產生的權杖可用於存取',
    'Tokens you have generated that can be used to access the GitHub API.': '你產生且可用於存取 GitHub API 的權杖。',
    'This token has no expiration date': '此權杖沒有到期日',
    'This token has no expiration date.': '此權杖沒有到期日。',
    'Confirm token deletion': '確認刪除權杖',
    'Make sure to copy your personal access token now. You won’t be able to see it again!':
      '請立即複製你的個人存取權杖。之後將無法再次查看！',
    "Make sure to copy your personal access token now. You won't be able to see it again!":
      '請立即複製你的個人存取權杖。之後將無法再次查看！',
    'Personal access tokens (classic) function like ordinary OAuth access tokens. They can be used instead of a password for Git over HTTPS, or can be used to':
      '個人存取權杖（傳統）的作用與一般 OAuth 存取權杖相同。透過 HTTPS 使用 Git 時可用來代替密碼，也可用來',
    'authenticate to the API over Basic Authentication': '透過基本驗證向 API 驗證身分',

    // 新建 / 编辑经典令牌
    'New personal access token': '新增個人存取權杖',
    'New personal access token (classic)': '新增個人存取權杖（傳統）',
    'Edit personal access token (classic)': '編輯個人存取權杖（傳統）',
    'Regenerate personal access token (classic)': '重新產生個人存取權杖（傳統）',
    "Note can't be blank": '備註不能為空白',
    'Note can’t be blank': '備註不能為空白',
    'Note has already been taken': '備註已被使用',
    'What’s this token for?': '此權杖的用途是什麼？',
    "What's this token for?": '此權杖的用途是什麼？',
    // 「This token expires on <strong>日期</strong>. To set a new expiration date, you must <a>regenerate the token</a>.」
    'This token expires on': '此權杖到期日為',
    '. To set a new expiration date, you must': '。若要設定新的到期日，必須',
    'regenerate the token': '重新產生權杖',
    'regenerate the token.': '重新產生權杖。',
    // 「選取範圍」在繁中界面是 selection（名词），加「權杖」区分
    'Select scopes': '選取權杖範圍',
    'Scopes define the access for personal tokens.': '範圍定義個人權杖的存取權。',
    'Read more about OAuth scopes.': '瞭解 OAuth 範圍。',
    'Some of the scopes you’ve selected are included in other scopes. Only the minimum set of necessary scopes has been saved.':
      '你選取的部分範圍已包含在其他範圍中。只儲存了所需的最小範圍集合。',
    "Some of the scopes you've selected are included in other scopes. Only the minimum set of necessary scopes has been saved.":
      '你選取的部分範圍已包含在其他範圍中。只儲存了所需的最小範圍集合。',
    'Update token': '更新權杖',

    // 经典令牌作用域说明（也用于 OAuth 应用授权详情）
    'Full control of private repositories': '完全控制私人儲存庫',
    'Access commit status': '存取提交狀態',
    'Access deployment status': '存取部署狀態',
    'Access public repositories': '存取公開儲存庫',
    'Access repository invitations': '存取儲存庫邀請',
    'Read and write security events': '讀寫安全性事件',
    'Update GitHub Action workflows': '更新 GitHub 動作工作流程',
    'Update github action workflows': '更新 GitHub 動作工作流程',
    'Upload packages to GitHub Package Registry': '將套件上傳到 GitHub 套件登錄庫',
    'Download packages from GitHub Package Registry': '從 GitHub 套件登錄庫下載套件',
    'Delete packages from GitHub Package Registry': '從 GitHub 套件登錄庫刪除套件',
    'Full control of orgs and teams, read and write org projects': '完全控制組織和團隊，讀寫組織專案',
    'Read and write org and team membership, read and write org projects': '讀寫組織和團隊成員身分，讀寫組織專案',
    'Read org and team membership, read org projects': '讀取組織和團隊成員身分，讀取組織專案',
    'Manage org runners and runner groups': '管理組織執行器和執行器群組',
    'Full control of user public keys': '完全控制使用者公開金鑰',
    'Write user public keys': '寫入使用者公開金鑰',
    'Read user public keys': '讀取使用者公開金鑰',
    'Full control of repository hooks': '完全控制儲存庫 Web 鉤子',
    'Write repository hooks': '寫入儲存庫 Web 鉤子',
    'Read repository hooks': '讀取儲存庫 Web 鉤子',
    'Full control of organization hooks': '完全控制組織 Web 鉤子',
    'Create gists': '建立程式碼片段',
    'Access notifications': '存取通知',
    'Update ALL user data': '更新所有使用者資料',
    'Update all user data': '更新所有使用者資料',
    'Read ALL user profile data': '讀取所有使用者個人檔案資料',
    'Read all user profile data': '讀取所有使用者個人檔案資料',
    'Access user email addresses (read-only)': '存取使用者電子郵件地址（唯讀）',
    'Access public information (read-only)': '存取公開資訊（唯讀）',
    'Follow and unfollow users': '追蹤和取消追蹤使用者',
    'Delete repositories': '刪除儲存庫',
    'Read and write team discussions': '讀寫團隊討論',
    'Read team discussions': '讀取團隊討論',
    'Full control of enterprises': '完全控制企業',
    'Manage enterprise runners and runner groups': '管理企業執行器和執行器群組',
    'Read and write enterprise billing data': '讀寫企業帳務資料',
    // 企业的 profile 同组织作「資料」（GLOSSARY.zh-TW.md profile 行：organization profile → 組織資料）
    'Read enterprise profile data': '讀取企業資料',
    'Provisioning of users and groups via SCIM': '透過 SCIM 佈建使用者和群組',
    'Full control of audit log': '完全控制稽核記錄',
    'Read access of audit log': '讀取稽核記錄',
    'Full control of codespaces': '完全控制程式碼空間',
    'Ability to create, read, update, and delete codespace secrets': '可建立、讀取、更新並刪除程式碼空間機密',
    'Full control of GitHub Copilot settings and seat assignments': '完全控制 GitHub Copilot 設定和席次指派',
    'View and edit Copilot Business seat assignments': '查看並編輯 Copilot 商務版席次指派',
    'Write org hosted compute network configurations': '寫入組織代管運算網路設定',
    'Read org hosted compute network configurations': '讀取組織代管運算網路設定',
    'Full control of projects': '完全控制專案',
    'Read access of projects': '讀取專案',
    'Full control of public user GPG keys': '完全控制使用者公開 GPG 金鑰',
    '(Developer Preview)': '（開發人員預覽）',
    'Write public user GPG keys': '寫入使用者公開 GPG 金鑰',
    'Read public user GPG keys': '讀取使用者公開 GPG 金鑰',
    'Full control of public user SSH signing keys': '完全控制使用者公開 SSH 簽署金鑰',
    'Write public user SSH signing keys': '寫入使用者公開 SSH 簽署金鑰',
    'Read public user SSH signing keys': '讀取使用者公開 SSH 簽署金鑰',
    // 作用域复选框的无障碍标签：说明首字母大写、其余小写
    'Upload packages to github package registry': '將套件上傳到 GitHub 套件登錄庫',
    'Download packages from github package registry': '從 GitHub 套件登錄庫下載套件',
    'Delete packages from github package registry': '從 GitHub 套件登錄庫刪除套件',
    'Provisioning of users and groups via scim': '透過 SCIM 佈建使用者和群組',
    'Full control of github copilot settings and seat assignments': '完全控制 GitHub Copilot 設定和席次指派',
    'View and edit copilot business seat assignments': '查看並編輯 Copilot 商務版席次指派',
    'Full control of public user gpg keys': '完全控制使用者公開 GPG 金鑰',
    'Write public user gpg keys': '寫入使用者公開 GPG 金鑰',
    'Read public user gpg keys': '讀取使用者公開 GPG 金鑰',
    'Full control of public user ssh signing keys': '完全控制使用者公開 SSH 簽署金鑰',
    'Write public user ssh signing keys': '寫入使用者公開 SSH 簽署金鑰',
    'Read public user ssh signing keys': '讀取使用者公開 SSH 簽署金鑰'
  },
  scoped: {
    // 与组织令牌策略共用（Personal access tokens 见 permissions.ts，Note 见 moderation.ts，Custom 由 settings-account 收录）
    'Fine-grained tokens': '精細權杖',
    'Tokens (classic)': '權杖（傳統）',
    'Fine-grained personal access tokens': '精細個人存取權杖',
    Expires: '到期日',
    'No description': '沒有描述',
    Created: '建立於',
    today: '今天',
    '7 days': '7 天',
    '30 days': '30 天',
    '60 days': '60 天',
    '90 days': '90 天',
    'Custom...': '自訂...',
    'Custom…': '自訂…',
    'between 1 and 366 days': '介於 1 到 366 天之間',
    'Public repositories': '公開儲存庫',
    'Repository access': '儲存庫存取權',
    'Select at least one repository.': '至少選取一個儲存庫。',
    'No repositories found.': '找不到儲存庫。',
    'User permissions': '使用者權限',
    "Name can't be blank": '名稱不能為空白',
    'Name can’t be blank': '名稱不能為空白',
    'Token name *': '權杖名稱 *',
    'Expiration *': '到期日 *',
    // 新建令牌页的区块无障碍名称
    'personal access token': '個人存取權杖',
    'Authorization check': '授權檢查',
    'Authorization failed': '授權失敗',
    'Retry check': '重新檢查',
    'See the documentation': '查看說明文件'
  },
  regexp: [
    // 过期时间
    [
      new RegExp(`^(Expires|Expired) on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, state: string, date: string, dot: string) =>
        state === 'Expires' ? `${datePhrase('將於', date, '到期')}${period(dot)}` : `${datePhrase('已於', date, '過期')}${period(dot)}`
    ],
    [
      new RegExp(`^This token expires on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${datePhrase('此權杖將於', date, '到期')}${period(dot)}`
    ],
    [
      new RegExp(`^This token expired on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${datePhrase('此權杖已於', date, '過期')}${period(dot)}`
    ],
    [
      new RegExp(`^The token will expire on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${datePhrase('權杖將於', date, '到期')}${period(dot)}`
    ],
    [
      new RegExp(`^Expires (${RELATIVE_SOURCE})(\\.?)$`),
      (_, time: string, dot: string) => `${joinCjk(translateTime(time), '到期')}${period(dot)}`
    ],
    [
      new RegExp(`^(\\d+) days? \\((${ANY_DATE_SOURCE})\\)$`),
      (_, days: string, date: string) => `${days} 天（${translateTokenDate(date)}）`
    ],
    // 日期单独在 <strong> 等元素中
    [new RegExp(`^(${WEEKDAY_DATE_SOURCE})(\\.?)$`), (_, date: string, dot: string) => `${translateTokenDate(date)}${period(dot)}`],
    [/^Limit set by ([\w.-]+) organization$/, '由 $1 組織設定的限制'],
    // 组织或企业的令牌有效期策略（名称为空时原文为「The requires …」；豁免句原文无逗号，译文不加）
    [
      /^The (?:(.+?) )?requires a maximum lifetime of (\d+) days? for fine-grained personal access tokens\.( As an enterprise administrator you are exempted from this requirement\.)?$/,
      (_, owner: string, days: string, exempt: string) => {
        const subject = owner ? joinCjk(policyOwner(owner), '要求') : '要求'
        const note = exempt ? '你身為企業管理員不受此要求限制。' : ''
        return `${subject}精細個人存取權杖的最長有效期為 ${days} 天。${note}`
      }
    ],

    // 使用情况
    [new RegExp(`^(${USAGE_SOURCE}) •$`), (_, usage: string) => `${translateUsage(usage)} •`],

    // 令牌名称校验（原文有引号；第二句原文是句号，译文不改成逗号）
    [/^['‘](.+)['’] is available\.$/, '「$1」可用。'],
    [/^['‘](.+)['’] is not available\. The token name has already been taken\.$/, '「$1」不可用。權杖名稱已被使用。'],

    // 生成前的权限汇总；句末冒号随原文
    [
      /^(\d+) permissions? for all repositories(:?)$/,
      (_, count: string, colon: string) => `所有儲存庫的 ${count} 項權限${colon ? '：' : ''}`
    ],
    [
      /^(\d+) permissions? for (\d+) repositor(?:y|ies)(:?)$/,
      (_, count: string, repos: string, colon: string) => `${repos} 個儲存庫的 ${count} 項權限${colon ? '：' : ''}`
    ],
    [/^(\d+) account permissions?$/, '$1 項帳號權限'],
    [/^(\d+) organization permissions?$/, '$1 項組織權限'],
    [/^(\d+) repository permissions?$/, '$1 項儲存庫權限']
  ]
} satisfies PageDictionary
