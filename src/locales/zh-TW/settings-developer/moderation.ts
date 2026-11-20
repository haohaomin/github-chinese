import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

const DURATION_UNIT: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分鐘',
  hour: '小時',
  day: '天',
  week: '週',
  month: '個月',
  year: '年'
}

const DURATION_QUALIFIER: Readonly<Record<string, string>> = { about: '約 ', almost: '將近 ', over: '超過 ' }

const DURATION_RE = /^(?:(about|almost|over) )?(\d+|an?|one) (second|minute|hour|day|week|month|year)s?$/

/** 剩余时长片段（不含捕获组）：less than a minute、about 23 hours、1 day 等 */
const DURATION_SOURCE = '(?:less than a minute|(?:(?:about|almost|over) )?(?:\\d+|an?|one) (?:second|minute|hour|day|week|month|year)s?)'

/** 剩余时长：“about 23 hours” → 約 23 小時；无法识别时原样返回 */
export function translateDuration(text: string): string {
  if (text === 'less than a minute') return '不到 1 分鐘'
  const match = DURATION_RE.exec(text)
  if (!match) return text
  const amount = /^\d+$/.test(match[2]!) ? match[2]! : '1'
  const qualifier = match[1] === undefined ? '' : (DURATION_QUALIFIER[match[1]] ?? '')
  return `${qualifier}${amount} ${DURATION_UNIT[match[3]!] ?? match[3]}`
}

const LOGIN = '@([\\w-]+)'

/**
 * 组织（/settings/organizations）、企业（/settings/enterprises）、
 * 调解（Moderation，繁体译「內容審核」）：已阻止的用户、交互限制、代码审查限制（/settings/blocked_users、interaction_limits、code_review_limits）。
 * 阻止用户、交互限制中与组织设置相同的句子已由 org-settings 收录（全站生效），这里只收个人设置独有的句子；
 * 阻止用户表格等短词放 scoped，译法与组织设置一致（block 译「封鎖」，unblock 译「解除封鎖」）。
 * leave（组织）译「離開」，与 common-ui 的 Leave 一致。
 */
export default {
  static: {
    // 组织
    'You are not a member of any organizations.': '你不是任何組織的成員。',
    'Leave organization': '離開組織',
    'Transform account': '轉換帳號',
    'You cannot transform this account into an organization until you leave all organizations that you’re a member of.':
      '在離開你所屬的所有組織之前無法將此帳號轉換為組織。',
    "You cannot transform this account into an organization until you leave all organizations that you're a member of.":
      '在離開你所屬的所有組織之前無法將此帳號轉換為組織。',
    'You cannot transform this account into an organization because you have an active GitHub Sponsors account.':
      '你因擁有有效的 GitHub 贊助帳號而無法將此帳號轉換為組織。',
    'Move to an organization': '移至組織',
    'Move work to an organization': '將工作移至組織',
    'Your personal account cannot be converted to an organization. You must create a new organization and transfer your repositories and projects to it instead. You can then rename your personal account and the organization if you want your organization to have the same name that you are currently using for your personal account.':
      '個人帳號無法轉換為組織。你必須改為建立新組織並將儲存庫和專案轉移到該組織。如果希望組織使用你個人帳號目前的名稱則可以接著重新命名個人帳號和組織。',
    'Account Transformation Warning': '帳號轉換警告',
    'What you are about to do is an irreversible and destructive process. Please be aware:':
      '你即將執行的動作無法復原且具有破壞性。請注意：',
    'Any user-specific information (OAuth tokens, SSH keys, Job Profile, etc) will be erased':
      '所有使用者專屬資訊（OAuth 權杖、SSH 金鑰、求職個人檔案等）都將被清除',
    'You will no longer be able to create or modify gists owned by the converted personal account':
      '你將無法再建立或修改轉換後的個人帳號所擁有的程式碼片段',
    'create a new personal account': '建立新的個人帳號',
    'The total amount of collaborators across private repositories will be the total amount of seats for the organization':
      '所有私人儲存庫的協作者總數將成為組織的席次總數',
    // 单一登录组织列表（dismissal：横幅的关闭）
    'SSO banner settings': 'SSO 橫幅設定',
    'Reset SSO banner': '重設 SSO 橫幅',
    'Reset SSO Banner': '重設 SSO 橫幅',
    'Are you sure you want to reset your dismissal of the single sign-on banner on this device?':
      '確定要在此裝置上重設單一登入橫幅的關閉狀態嗎？',
    'This will clear your dismissal preferences and the SSO banner may appear again for organizations that require single sign-on authentication.':
      '這將清除你的關閉偏好設定並可能讓 SSO 橫幅在要求單一登入身分驗證的組織中再次出現。',

    // 企业
    "You don't have any enterprises": '你沒有任何企業',
    'You don’t have any enterprises': '你沒有任何企業',
    'Designed for businesses or teams who collaborate on GitHub.com': '專為在 GitHub.com 上協作的企業或團隊設計',
    'Start free for 30 days': '免費試用 30 天',
    'Learn more about enterprises': '瞭解企業',
    'Learn more about enterprise accounts': '瞭解企業帳號',
    'New Enterprise': '新增企業',

    // 已阻止的用户（个人）
    'You are about to block:': '你即將封鎖：',
    'Maximum 250 characters. Please don’t include any personal information such as legal names or email addresses. This note will only be visible to you.':
      '最多 250 個字元。請勿包含法定姓名或電子郵件地址等個人資料。此備註只有你看得到。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. This note will only be visible to you.":
      '最多 250 個字元。請勿包含法定姓名或電子郵件地址等個人資料。此備註只有你看得到。',
    'Additionally, blocked users are not able to:': '此外，被封鎖的使用者無法：',
    'invite you as a collaborator to their repositories': '邀請你成為其儲存庫的協作者',
    'follow your account’s public activity': '追蹤你帳號的公開活動',
    "follow your account's public activity": '追蹤你帳號的公開活動',
    'send you notifications by @mentioning your username in public repositories': '在公開儲存庫中透過 @提及你的使用者名稱傳送通知給你',
    'Warn me when a blocked user is a prior contributor to a repository': '被封鎖的使用者曾為儲存庫做出貢獻時警告我',
    'Warn me when blocked users have contributed to a repository': '被封鎖的使用者曾為儲存庫做出貢獻時警告我',
    'We will show this warning each time you visit a repository where someone you blocked has committed code, unless you own the repository or have also contributed a commit. This warning does not restrict your access.':
      '每次造訪你封鎖的使用者曾提交過程式碼的儲存庫時都會顯示此警告，除非你擁有該儲存庫或也曾提交過程式碼。此警告不會限制你的存取權。',
    'On repositories you haven’t contributed to yet, we’ll warn you when a user you’ve blocked has previously made contributions.':
      '在你尚未貢獻過的儲存庫中，我們會在你封鎖的使用者曾做出貢獻時警告你。',
    "On repositories you haven't contributed to yet, we'll warn you when a user you've blocked has previously made contributions.":
      '在你尚未貢獻過的儲存庫中，我們會在你封鎖的使用者曾做出貢獻時警告你。',
    "Please don't include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.":
      '請勿包含法定姓名或電子郵件地址等任何個人資訊。支援 Markdown。只有你能看到此備註。',
    'Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.':
      '請勿包含法定姓名或電子郵件地址等任何個人資訊。支援 Markdown。只有你能看到此備註。',
    'Markdown is supported. This note will only be visible to you.': '支援 Markdown。只有你能看到此備註。',

    // 交互限制（个人）：与组织设置同句写法一致
    'Temporarily restrict which external users can interact with your repositories (comment, open issues, or create pull requests) for a configurable period of time.':
      '在可設定的期間內暫時限制哪些外部使用者能與你的儲存庫互動（留言、建立議題或建立拉取請求）。',
    // 「… your account's <a>public repositories</a>. Any changes here will override those limits.」后两段由 org-settings 收录
    "Interaction limits may already exist in your account's": '互動限制可能已存在於你帳號的',
    'Interaction limits may already exist in your account’s': '互動限制可能已存在於你帳號的',
    'Users that have recently created their account will be unable to interact with your repositories.':
      '最近建立帳號的使用者將無法與你的儲存庫互動。',
    'Users that have not previously committed to the default branch of one of your repositories will be unable to interact with that repository.':
      '從未向你某個儲存庫的預設分支提交過的使用者將無法與該儲存庫互動。',
    'Users that are not collaborators of one of your repositories will not be able to interact with that repository.':
      '不是你某個儲存庫協作者的使用者將無法與該儲存庫互動。',

    // 代码审查限制（个人）
    'Restrict users who are permitted to approve or request changes on pull requests in your public repositories.':
      '限制哪些使用者可以在你的公開儲存庫中核准拉取請求或要求變更。',
    // 「Code review limits are currently」+ 状态（已啟用 / 已停用）+「for all repositories. …」
    'Code review limits are currently': '所有儲存庫的程式碼審查限制目前',
    'for all repositories. Only users explicitly granted access to these repositories may submit pull request reviews that "approve" or "request changes". All users able to submit comment pull request reviews continue to be able to do so.':
      '。只有已明確獲得這些儲存庫存取權的使用者才能送出「核准」或「要求變更」審查。所有能送出留言審查的使用者仍可繼續送出。',
    'for all repositories. All users are able to submit pull request reviews, including those that "approve" or "request changes". Limit reviews to only permit users who have explicitly been granted access to each repository to submit reviews that "approve" or "request changes".':
      '。所有使用者都能送出拉取請求審查，包括「核准」或「要求變更」審查。將審查限制為僅允許已明確獲得各儲存庫存取權的使用者送出「核准」或「要求變更」審查。',
    'Code review limit settings saved.': '已儲存程式碼審查限制設定。'
  },
  scoped: {
    // 阻止成功的提示：「<strong>用户</strong> has been successfully blocked.」
    'has been successfully blocked.': '已遭封鎖。',
    // 组织（Leave 由 common-ui 收录，Billing manager 由 org-settings 收录）
    'Compare plans': '比較方案',
    // 单一登录横幅的关闭状态
    Dismissed: '已關閉',

    // 企业
    'Start a free trial': '開始免費試用',

    // 已阻止的用户（与组织设置共用的表格、对话框；译法与 org-settings 一致）
    'Search by username, full name, or public email': '依使用者名稱、全名或公開電子郵件搜尋',
    'Learn more about blocking a user': '瞭解如何封鎖使用者',
    'Learn more about blocking a user.': '瞭解如何封鎖使用者。',
    'For 1 day': '1 天',
    'For 3 days': '3 天',
    'For 7 days': '7 天',
    'For 30 days': '30 天',
    'Until unblocked': '直到解除封鎖',
    'You have not blocked any users.': '你尚未封鎖任何使用者。',
    'You have not blocked anyone.': '你尚未封鎖任何人。',
    'No blocked users match your search.': '沒有相符的已封鎖使用者。',
    'Blocked by': '封鎖者',
    'Blocked until': '封鎖期限',
    Indefinitely: '無限期',
    'Date blocked': '封鎖日期',
    Label: '標籤',
    Notes: '備註',
    Note: '備註',
    'Block settings': '封鎖設定',
    'Close all content': '關閉所有內容',
    'Currently blocked': '目前已封鎖',
    'Find blocked users': '尋找已封鎖的使用者',
    'Blocked users pagination': '已封鎖使用者分頁',
    'Blocked Duration': '封鎖期間',
    'Restriction ends': '限制結束時間',
    'Add a label': '新增標籤',
    'Select one or more reasons for blocking.': '選擇一個或多個封鎖原因。',
    'Add a note': '新增備註',
    'Add Note': '新增備註',
    'Saving block settings': '正在儲存封鎖設定',
    'Block settings saved': '已儲存封鎖設定',
    'Block settings summary': '封鎖設定摘要',
    'Unable to save block settings. Please try again.': '無法儲存封鎖設定。請再試一次。',
    'Block settings may have been saved, but the server returned an unexpected response. Refresh the page to confirm.':
      '封鎖設定可能已儲存，但伺服器傳回未預期的回應。重新整理頁面以確認。',
    'Something went wrong while saving. Please try again.': '儲存時發生錯誤。請再試一次。',
    Misconduct: '不當行為',
    Harassment: '騷擾',
    // 封锁原因 Entitlement：指对维护者提出理所当然式的要求，与组织设置同译「無理要求」
    Entitlement: '無理要求',

    // 交互限制（与组织、存储库设置共用的短词；24 hours 由 common 收录）
    'New users': '新使用者',
    Collaborators: '協作者',
    '3 days': '3 天',
    '1 week': '1 週',
    '1 month': '1 個月',
    '6 months': '6 個月',

    // 代码审查限制
    enabled: '已啟用',
    disabled: '已停用',
    Unset: '取消設定'
  },
  regexp: [
    // 组织：退出确认、外部协作者身份
    [
      /^Are you positive you want to leave (\S+)\? You will lose access to all repositories and teams\.$/,
      '確定要離開 $1 嗎？你將失去其所有儲存庫和團隊的存取權。'
    ],
    [
      /^Are you positive you want to leave (\S+)\? You will lose access to all repositories\.$/,
      '確定要離開 $1 嗎？你將失去其所有儲存庫的存取權。'
    ],
    [/^You left (\S+)\. It may take a few minutes to process\.$/, '你已離開 $1。處理可能需要幾分鐘。'],
    [/^Outside collaborator on (\d+) repositor(?:y|ies)$/, '$1 個儲存庫的外部協作者'],
    [/^Member and collaborator on (\d+) repositor(?:y|ies)$/, '$1 個儲存庫的成員和協作者'],
    // 组织：帐户转换警告
    [/^Turn (\S+) into an organization$/, '將 $1 轉換為組織'],
    [
      /^You will no longer be able to sign in to (\S+) \(all administrative privileges will be bestowed upon the owners you choose\)$/,
      '你將無法再登入 $1（所有管理權限都將授予你選擇的擁有者）'
    ],
    [
      /^Any commits and comments credited to (\S+) will no longer be linked to this GitHub account$/,
      '歸屬於 $1 的提交和留言將不再連結到此 GitHub 帳號'
    ],
    [/^Any GitHub Apps installed on (\S+) will be uninstalled$/, '安裝在 $1 上的所有 GitHub 應用程式都將被解除安裝'],
    [/^If you are using (\S+) as a personal account, you should$/, '如果你將 $1 當作個人帳號使用，應先'],
    // 句首片段原文无逗号，译文不加
    [/^before transforming (\S+) into an organization\.$/, '再將 $1 轉換為組織。'],

    // 已阻止的用户：React 表格与对话框
    [new RegExp(`^Note for ${LOGIN}$`), '@$1 的備註'],
    [new RegExp(`^View note for ${LOGIN}$`), '查看 @$1 的備註'],
    [new RegExp(`^Edit block for ${LOGIN}$`), '編輯對 @$1 的封鎖'],
    [new RegExp(`^Block settings for ${LOGIN}$`), '@$1 的封鎖設定'],
    [new RegExp(`^Block user ${LOGIN}$`), '封鎖使用者 @$1'],
    [new RegExp(`^Block actions for ${LOGIN}$`), '@$1 的封鎖動作'],
    [new RegExp(`^${LOGIN} has been unblocked$`), '已解除封鎖 @$1'],
    [new RegExp(`^Unblocking ${LOGIN}$`), '正在解除封鎖 @$1'],
    [new RegExp(`^Closing content from ${LOGIN}$`), '正在關閉 @$1 的內容'],
    [new RegExp(`^Unable to unblock ${LOGIN}\\. Please try again\\.$`), '無法解除封鎖 @$1。請再試一次。'],
    [new RegExp(`^Unable to close content from ${LOGIN}\\. Please try again\\.$`), '無法關閉 @$1 的內容。請再試一次。'],
    [new RegExp(`^Content created by ${LOGIN} is being closed\\.$`), '正在關閉 @$1 建立的內容。'],
    // 同一句不带 @ 的写法（个人设置的阻止用户页），用户名照原文
    [/^Content created by ([\w-]+) is being closed\.$/, '正在關閉 $1 建立的內容。'],
    // 企业列表：设置按钮的无障碍名称（企业标识）
    [/^Settings for ([\w.-]+)$/, '$1 的設定'],
    // 人用量词「位」
    [/^(\d+) users? found$/, '找到 $1 位使用者'],
    [/^(\d+) blocked users?$/, '$1 位已封鎖的使用者'],
    // 阻止备注输入框的剩余字数
    [/^(\d+) characters? remaining\.$/, '還可輸入 $1 個字元。'],

    // 交互限制：剩余时间（原文无逗号，译文不加；句号随原文）
    [
      new RegExp(`^Enabled with (${DURATION_SOURCE}) remaining(\\.?)$`),
      (_, remaining: string, dot: string) => `${joinCjk('已啟用剩餘', translateDuration(remaining))}${dot ? '。' : ''}`
    ]
  ],
  ignore: [
    // 单一登录组织列表：组织登录名、显示名是用户内容
    '[data-testid^="sso-org-link-"]',
    '[data-testid^="sso-org-row-"] [class*="profileName__"]'
  ]
} satisfies PageDictionary
