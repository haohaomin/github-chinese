import type { PageDictionary } from '../../../core/types'

const LOGIN = '@([\\w-]+)'

const DURATION_UNIT: Readonly<Record<string, string>> = {
  second: '秒',
  minute: '分鐘',
  hour: '小時',
  day: '天',
  week: '週',
  month: '個月',
  year: '年'
}

const DURATION_QUALIFIER: Readonly<Record<string, string>> = { about: '約', almost: '將近', over: '超過' }

/** 交互限制剩余时长：“about 23 hours” → 已啟用剩餘約 23 小時；原文无逗号，译文不加；句号随原文 */
function enabledRemaining(qualifier: string | undefined, amount: string, unit: string, dot: string): string {
  const prefix = qualifier ? (DURATION_QUALIFIER[qualifier] ?? '') : ''
  const count = /^\d+$/.test(amount) ? amount : '1'
  return `已啟用剩餘${prefix} ${count} ${DURATION_UNIT[unit] ?? unit}${dot ? '。' : ''}`
}

/**
 * 调解（Moderation，繁体译「內容審核」）：已阻止的用户、交互限制、代码审查限制、版主；
 * 导入/导出（占位帐户、归属邀请）。
 * 阻止用户、交互限制、代码审查限制中与个人设置共用的句子放 static（个人设置依赖这里）；
 * 存储库设置、个人设置已收录为 static 的句子（Temporary interaction limits、Limit to …、
 * Code review limits are currently、Additionally, blocked users are not able to: 等）不再重复。
 * 阻止用户表格等短词放 scoped，译法与个人设置一致（block 一律译「封鎖」，unblock 译「解除封鎖」）。
 * mannequin 译「佔位帳號」（占字繁体作「佔」）。
 */
export default {
  static: {
    // 交互限制：打开的拉取请求数上限（「Currently, … up to <strong>1</strong> open pull request …」见 inline）与豁免规则
    'Restrict how many pull requests users without write access can have open at one time in any single public repository in this organization. A limit configured on an individual repository overrides this setting. This setting stays in effect until you change it.':
      '限制沒有寫入權限的使用者在此組織的任一公開儲存庫中同時可有多少個開放中的拉取請求。個別儲存庫設定的限制會覆寫此設定。此設定在你變更之前會持續生效。',
    'Enter a number from 1 to 1000. Users who have more open pull requests than the above limit will not be able to create new pull requests in the repository.':
      '輸入 1 到 1000 之間的數字。開放中拉取請求數量超過上述限制的使用者將無法在儲存庫中建立新的拉取請求。',
    'Save limit settings': '儲存限制設定',
    'Exemption rules': '豁免規則',
    'Users who meet any enabled rule can open pull requests regardless of the configured limit.':
      '符合任一已啟用規則的使用者建立拉取請求時不受設定的限制。',
    'Exempt users based on account age': '依帳號建立時長豁免使用者',
    'Minimum account age in days': '帳號最短建立天數',
    'Exempt users based on merged pull requests': '依已合併的拉取請求豁免使用者',
    'Minimum merged pull requests in each repository': '每個儲存庫中已合併拉取請求的最少數量',
    'Enter a number from 1 to 100': '輸入 1 到 100 之間的數字',
    'Save exemption rules': '儲存豁免規則',
    // 阻止用户：时长按钮前缀、备注说明（备注剩余字数见 regexp）
    'Block:': '封鎖：',
    'Maximum 250 characters. Please don’t include any personal information such as legal names or email addresses. All org admins and moderators can see this note.':
      '最多 250 個字元。請勿包含任何個人資訊，例如法定姓名或電子郵件地址。所有組織管理員和版主都能看到此備註。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. All org admins and moderators can see this note.":
      '最多 250 個字元。請勿包含任何個人資訊，例如法定姓名或電子郵件地址。所有組織管理員和版主都能看到此備註。',
    // 版主、导入/导出（无障碍名称）
    'Add a member or team as a moderator': '將成員或團隊新增為版主',
    'Import/Export Navigation': '匯入/匯出導覽',
    'Search mannequins by login or email': '依登入名稱或電子郵件搜尋佔位帳號',
    // 已阻止的用户
    'Block a user': '封鎖使用者',
    'Blocking a user prevents the following on all your repositories:': '封鎖使用者後，對方將無法在你的所有儲存庫中：',
    'opening or commenting on issues or pull requests': '建立議題和拉取請求或在其中留言',
    'starring, forking, or watching': '加星號、分叉或關注',
    'adding or editing wiki pages': '新增或編輯 Wiki 頁面',
    'You can block a user to deny them access to repositories and more.': '你可以封鎖使用者，拒絕對方存取儲存庫等。',
    'All blocked users': '所有已封鎖的使用者',
    'Block user from organization': '在組織中封鎖使用者',
    'Block user from organization and send message': '在組織中封鎖使用者並傳送訊息',
    'Close all open issues, pull requests, and discussions opened by this user': '關閉此使用者建立的所有開放中的議題、拉取請求和討論',
    'Hide this user’s comments': '隱藏此使用者的留言',
    "Hide this user's comments": '隱藏此使用者的留言',
    'Send a notification to this user': '傳送通知給此使用者',
    'Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to org admins.':
      '請勿包含任何個人資訊，例如法定姓名或電子郵件地址。支援 Markdown。只有組織管理員能看到此備註。',
    "Please don't include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to org admins.":
      '請勿包含任何個人資訊，例如法定姓名或電子郵件地址。支援 Markdown。只有組織管理員能看到此備註。',
    'Markdown is supported. This note will only be visible to org admins.': '支援 Markdown。只有組織管理員能看到此備註。',

    // 交互限制（原文括号外无逗号，译文不加；与 repo-settings/access.ts 同句一致）
    'Temporarily restrict which external users can interact with your repositories (comment, open issues, or create pull requests) for a configurable period of time. Users who are members of this organization will not be affected by these limits.':
      '在可設定的期間內暫時限制哪些外部使用者能與你的儲存庫互動（留言、建立議題或建立拉取請求）。此組織的成員不受這些限制影響。',
    "Interaction limits may already exist in your organization's": '互動限制可能已存在於你組織的',
    'Interaction limits may already exist in your organization’s': '互動限制可能已存在於你組織的',
    'public repositories': '公開儲存庫',
    '. Any changes here will override those limits.': '中。此處的任何變更都將覆寫這些限制。',
    "Users that have recently created their account will be unable to interact with this organization's repositories.":
      '最近建立帳號的使用者將無法與此組織的儲存庫互動。',
    'Users that have recently created their account will be unable to interact with this organization’s repositories.':
      '最近建立帳號的使用者將無法與此組織的儲存庫互動。',
    'Users that have not previously committed to the default branch of a repository in this organization will be unable to interact with that repository.':
      '從未向此組織中某個儲存庫的預設分支提交過的使用者將無法與該儲存庫互動。',
    'Users that are not collaborators of a repository in this organization will not be able to interact with that repository.':
      '不是此組織中某個儲存庫協作者的使用者將無法與該儲存庫互動。',
    'User interaction limit settings saved.': '已儲存使用者互動限制設定。',
    'Organization members': '組織成員',
    'Pull request limits': '拉取請求限制',
    'Count draft pull requests toward the limit': '草稿拉取請求計入限制',

    // 代码审查限制
    'Restrict users who are permitted to approve or request changes on pull requests in public repositories within this organization.':
      '限制哪些使用者可以在此組織的公開儲存庫中核准拉取請求或要求變更。',
    'Code review limits may already be specified by individual repositories. Any changes here will override those limits until unset.':
      '個別儲存庫可能已指定程式碼審查限制。此處的任何變更在取消設定前都會覆寫這些限制。',
    'Code review limits are currently managed individually for all repositories. Enable limits to permit only users who have explicitly been granted access to each repository to submit reviews that "approve" or "request changes". Remove limits to allow all users to submit pull request reviews. All users able to submit comment pull request reviews will continue to be able to do so.':
      '目前由各儲存庫個別管理程式碼審查限制。啟用限制後，只有已明確獲得各儲存庫存取權的使用者才能送出「核准」或「要求變更」審查。移除限制後，所有使用者都能送出拉取請求審查。所有能送出留言審查的使用者仍可繼續送出。',
    'Limit review on all repositories': '限制所有儲存庫的審查',
    'Limit reviews on all repositories': '限制所有儲存庫的審查',
    'Remove review limits from all repositories': '移除所有儲存庫的審查限制',

    // 版主（minimize comments 译「最小化留言」，与 pulls/comments.ts、commits/diff.ts、pulls/files.ts 一致）
    'You can add organization members or teams as moderators for your organization. Moderators can block and unblock users from the organization, minimize comments, and manage interaction limits for all public organization repositories.':
      '你可以將組織成員或團隊新增為組織的版主。版主可以在組織中封鎖和解除封鎖使用者、最小化留言，並管理組織所有公開儲存庫的互動限制。',
    'You may add up to': '最多可新增',
    'members or teams as moderators.': '個成員或團隊擔任版主。',
    'Add a member or team': '新增成員或團隊',
    "You don't have any moderators for this organization.": '此組織尚無版主。',
    'You don’t have any moderators for this organization.': '此組織尚無版主。',
    'Remove moderator': '移除版主',

    // 导入/导出
    Mannequins: '佔位帳號',
    'Search mannequins by login or email...': '依登入名稱或電子郵件搜尋佔位帳號...',
    'Search mannequins by login or email…': '依登入名稱或電子郵件搜尋佔位帳號…',
    'There are no mannequins in this organization': '此組織沒有佔位帳號',
    'Mannequins represent authors of imported contributions. They do not have profile pages and cannot sign in. Their contributions can be reattributed to other members of your organization.':
      '佔位帳號代表已匯入貢獻的作者。這些帳號沒有個人檔案頁面，也無法登入。其貢獻可以重新歸屬給組織中的其他成員。',
    'Attribution Invitations': '歸屬邀請',
    'Attribution invitations': '歸屬邀請',
    'Below are the mannequin reattribution invitations that have been sent within this organization. If the state is "invited," then the user has not yet replied; if it is "completed," then the user has accepted and their contributions have been reattributed, and if it is "rejected," then the user opted not to be credited for that mannequin\'s contributions.':
      '以下是此組織內已傳送的佔位帳號重新歸屬邀請。狀態為「invited」表示使用者尚未回覆；「completed」表示使用者已接受，其貢獻已重新歸屬；「rejected」表示使用者選擇不認領該佔位帳號的貢獻。',
    'Below are the mannequin reattribution invitations that have been sent within this organization. If the state is "invited," then the user has not yet replied; if it is "completed," then the user has accepted and their contributions have been reattributed, and if it is "rejected," then the user opted not to be credited for that mannequin’s contributions.':
      '以下是此組織內已傳送的佔位帳號重新歸屬邀請。狀態為「invited」表示使用者尚未回覆；「completed」表示使用者已接受，其貢獻已重新歸屬；「rejected」表示使用者選擇不認領該佔位帳號的貢獻。',
    'No attribution invitations have been sent': '尚未傳送歸屬邀請',
    Reattribute: '重新歸屬',
    'Reattribute contributions': '重新歸屬貢獻',
    Mannequin: '佔位帳號'
  },
  scoped: {
    // 阻止用户表格与对话框（与个人设置共用的短词）
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
    // 与个人设置共用的两句：句号随原文，与 settings-developer/moderation.ts 同译
    'Unable to save block settings. Please try again.': '無法儲存封鎖設定。請再試一次。',
    'Block settings may have been saved, but the server returned an unexpected response. Refresh the page to confirm.':
      '封鎖設定可能已儲存，但伺服器傳回未預期的回應。重新整理頁面以確認。',
    'Something went wrong while saving. Please try again.': '儲存時發生錯誤。請再試一次。',
    Misconduct: '不當行為',
    Harassment: '騷擾',
    // 封锁原因 Entitlement：指对维护者提出理所当然式的要求，译「無理要求」
    Entitlement: '無理要求',

    // 交互限制（与个人 / 存储库设置共用的短词）
    'New users': '新使用者',
    Collaborators: '協作者',
    '3 days': '3 天',
    '1 week': '1 週',
    '1 month': '1 個月',
    '6 months': '6 個月',

    // 代码审查限制：「Code review limits are currently」+ 状态 +「for all repositories. …」
    enabled: '已啟用',
    disabled: '已停用',
    Unset: '取消設定'
  },
  regexp: [
    // 阻止用户的备注：250 characters remaining.（带句号，common-ui 的规则不带）
    [/^(\d[\d,]*) characters? remaining\.$/, '還可輸入 $1 個字元。'],
    // 版主
    [/^Successfully added (@[\w.-]+(?:\/[\w.-]+)?) as a moderator$/, '已將 $1 新增為版主'],
    [/^Successfully removed (@[\w.-]+(?:\/[\w.-]+)?) as a moderator$/, '已將 $1 從版主中移除'],
    [/^You may add up to (\d+) members or teams as moderators\.$/, '最多可新增 $1 個成員或團隊擔任版主。'],

    // 已阻止的用户：计数、React 表格与对话框（与个人设置相同；人用量词「位」）
    [/^(\d+) blocked users?$/, '$1 位已封鎖的使用者'],
    [/^(\d+) users? found$/, '找到 $1 位使用者'],
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

    // 交互限制：剩余时间（原文无逗号，译文不加；句号随原文，与个人设置一致）
    [/^Enabled with less than a minute remaining(\.?)$/, (_, dot: string) => `已啟用剩餘不到 1 分鐘${dot ? '。' : ''}`],
    [
      /^Enabled with (?:(about|almost|over) )?(\d+|an?|one) (second|minute|hour|day|week|month|year)s? remaining(\.?)$/,
      (_, qualifier: string, amount: string, unit: string, dot: string) => enabledRemaining(qualifier, amount, unit, dot)
    ],

    // 导入/导出
    [/^(\d+) mannequins?$/, '$1 個佔位帳號']
  ],
  inline: [
    [
      'Currently, users without write access can have up to {#} open pull request at a time in each public repository in this organization. Draft pull requests do not count toward this limit.',
      '目前，沒有寫入權限的使用者在此組織的每個公開儲存庫中同時最多可有 {#} 個開放中的拉取請求。草稿拉取請求不計入此限制。'
    ],
    [
      'Currently, users without write access can have up to {#} open pull requests at a time in each public repository in this organization. Draft pull requests do not count toward this limit.',
      '目前，沒有寫入權限的使用者在此組織的每個公開儲存庫中同時最多可有 {#} 個開放中的拉取請求。草稿拉取請求不計入此限制。'
    ]
  ]
} satisfies PageDictionary
