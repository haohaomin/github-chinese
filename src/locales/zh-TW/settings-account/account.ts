import type { PageDictionary } from '../../../core/types'

const LOGIN = '@?([\\w-]+)'

/** 推荐的可用使用者名称：「foo-1, foo-2, or foo-3」→「foo-1、foo-2 或 foo-3」 */
export function joinNames(list: string): string {
  const names = list.split(/,? or |, /)
  if (names.length < 2) return list
  return `${names.slice(0, -1).join('、')} 或 ${names[names.length - 1]}`
}

/**
 * 帐号（/settings/admin）：变更使用者名称及确认对话方块、变更使用者名称的完成页（/users/<使用者>/rename）、Patreon、
 * 汇出帐号资料、继任者、删除帐号及确认对话方块。
 * 组织设定已收录的重新命名警告片段（unintended side effects、set up redirects for …、Renaming may take …）
 * 与 Patreon 说明、赞助词典已收录的 Patreon 按钮（Link / Unlink Patreon account、Connect with Patreon）、
 * 「Start export」不再重复；删除确认短语（delete my account）须原样输入，不收录。
 * 只在本页成句的短片段（You must、to a、We will 等）放 scoped，避免在其他页面误译。
 * 术语：username → 使用者名稱，successor → 繼任者，transfer → 轉移，export → 匯出，metadata → 中繼資料。
 */
export default {
  static: {
    // 变更使用者名称
    'Change username': '變更使用者名稱',
    'Changing your username can have': '變更使用者名稱可能會產生',
    'Really change your username?': '確定要變更使用者名稱嗎？',
    'I understand, let’s change my username': '我瞭解，變更我的使用者名稱',
    "I understand, let's change my username": '我瞭解，變更我的使用者名稱',
    'Enter a new username': '輸入新的使用者名稱',
    'Choose a new username': '選擇新的使用者名稱',
    'Change my username': '變更我的使用者名稱',
    'Trademark Policy': '商標政策',
    // 「…You can find them in the <Password and authentication> page.」（page. 见 scoped）
    'Looking to manage account security settings? You can find them in the': '想管理帳號安全性設定嗎？這些設定位於',
    // 完成页：标题现无句号，旧版带句号；提示句被链接拆开时见 inline（与组织设定的同句一致：以指向新位置）
    'Your account has been renamed': '你的帳號已重新命名',
    'Your account has been renamed.': '你的帳號已重新命名。',
    'Remember to update your local repositories to point to the new location.': '記得更新本機儲存庫以指向新位置。',
    'update your local repositories': '更新本機儲存庫',

    // Patreon（组织设定收录了「Connect a Patreon account for …」两个片段）：connect → 連接，link → 連結
    'Successfully connected your GitHub account with Patreon.': '已將你的 GitHub 帳號與 Patreon 連接。',
    // 「Disconnect the Patreon account <电子邮件> for <@帐号> to sponsor maintainers with. …」
    // → 「中斷用於贊助維護者的 Patreon 帳號 <电子邮件> 與 <@帐号> 的連接。…」（for 见 scoped）
    'Disconnect the Patreon account': '中斷用於贊助維護者的 Patreon 帳號',
    'to sponsor maintainers with. Any sponsorships made on Patreon will no longer receive recognition on GitHub.':
      '的連接。在 Patreon 上的贊助將不再於 GitHub 上獲得認可。',
    'Successfully disconnected your GitHub account from Patreon.': '已中斷你的 GitHub 帳號與 Patreon 的連接。',

    // 汇出帐号资料：帐号名在 <strong> 中，前后文字分别匹配（「匯出帳號 @octocat 的所有儲存庫…」）
    'Export account data': '匯出帳號資料',
    'Export all repositories and profile metadata for': '匯出帳號',
    '. Exports will be available for 7 days.': '的所有儲存庫和個人檔案中繼資料。匯出檔案將保留 7 天。',
    'Recent exports': '最近的匯出',
    'New export': '新增匯出',
    "We're preparing your export! We'll send you an email when it's finished.": '正在準備匯出檔案！完成後我們會傳送電子郵件給你。',
    'We’re preparing your export! We’ll send you an email when it’s finished.': '正在準備匯出檔案！完成後我們會傳送電子郵件給你。',
    'New exports cannot be requested while an export is currently in progress': '匯出期間無法要求新的匯出',
    'Resend email with link': '重新傳送含連結的電子郵件',
    'Download deleted': '下載檔案已刪除',
    'Job queued to delete file.': '刪除檔案的作業已排入佇列。',

    // 继任者：帐号名在 <strong> 中、「designated below」是链接，句子被拆成多段
    'Successor settings': '繼任者設定',
    // 继任者搜寻框的无障碍名称
    'Designate Successor': '指定繼任者',
    'By clicking "Add Successor" below, I acknowledge that I am the owner of the': '按一下下方的「新增繼任者」，即表示我確認自己是',
    'By clicking “Add Successor” below, I acknowledge that I am the owner of the': '按一下下方的「新增繼任者」，即表示我確認自己是',
    'account, and am authorizing GitHub to transfer content within that account to my GitHub Successor,':
      '帳號的擁有者，並授權 GitHub 在我身故時將該帳號中的內容轉移給我的 GitHub 繼任者，',
    'designated below': '即下方指定的人',
    ', in the event of my death. I understand that this appointment of a successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will.':
      '。我瞭解指定繼任者並不會凌駕任何相關司法管轄區具有法律約束力的近親規定或遺產法，也不構成具有約束力的遺囑。',
    'Learn more about account successors.': '瞭解帳號繼任者。',
    'Add Successor': '新增繼任者',
    'Add successor': '新增繼任者',
    'Search by username, full name, or email address': '依使用者名稱、全名或電子郵件地址搜尋',
    'You have not designated a successor.': '你尚未指定繼任者。',
    'Copy invite link': '複製邀請連結',

    // 删除帐号：「You must remove yourself, transfer ownership, or delete these organizations before you can …」
    // →「你必須先將自己移除、轉移擁有權或刪除這些組織，才能刪除你的帳號。」（末段以全形逗号开头，与前面的链接之间不留空格）
    'Delete account': '刪除帳號',
    'Once you delete your account, there is no going back. Please be certain.': '帳號一經刪除便無法復原。請務必確定。',
    'Your account is currently an owner in these organizations:': '你的帳號目前是下列組織的擁有者：',
    'remove yourself': '將自己移除',
    'remove yourself from these organizations': '將自己從這些組織中移除',
    'transfer ownership': '轉移擁有權',
    'delete these organizations': '刪除這些組織',
    'before you can delete your user.': '，才能刪除你的帳號。',
    'Delete your account': '刪除你的帳號',
    // 「Are you sure you don’t want to just [downgrade your account] to a FREE account? …」
    'Are you sure you don’t want to just': '你確定不想只',
    "Are you sure you don't want to just": '你確定不想只',
    'downgrade your account': '將你的帳號降級',
    'account? We won’t charge your credit card anymore.': '帳號嗎？我們將不再從你的信用卡扣款。',
    "account? We won't charge your credit card anymore.": '帳號嗎？我們將不再從你的信用卡扣款。',
    'account? We won’t charge your payment information anymore.': '帳號嗎？我們將不再透過你的付款資訊扣款。',
    "account? We won't charge your payment information anymore.": '帳號嗎？我們將不再透過你的付款資訊扣款。',
    'account? We won’t charge your PayPal account anymore.': '帳號嗎？我們將不再從你的 PayPal 帳戶扣款。',
    "account? We won't charge your PayPal account anymore.": '帳號嗎？我們將不再從你的 PayPal 帳戶扣款。',

    // 删除确认对话方块：储存库数在 <strong> 中（产品名按用户规定译成中文：GitHub Pages → GitHub 頁面）
    'Are you sure you want to do this?': '確定要這麼做嗎？',
    'Make sure you want to do this': '確認你要這麼做',
    'This is extremely important.': '這非常重要。',
    ', along with all of your forks, wikis, issues, pull requests, and GitHub Pages sites.':
      '，以及你的所有分叉、Wiki、議題、拉取請求和 GitHub 頁面網站。',
    'You will no longer be billed, and after 90 days your username will be available to anyone on GitHub.':
      '我們將不再向你收費，90 天後 GitHub 上的任何人都可以使用你的使用者名稱。',
    // 文章名是链接，后面紧跟原文的「".」：结尾引号不会被翻译，开引号随原文写法与之配对（直引号、弯引号各一条）
    'For more help, read our article "': '如需更多協助，請參閱我們的文章"',
    'For more help, read our article “': '如需更多協助，請參閱我們的文章“',
    'Deleting your user account': '刪除你的使用者帳號',
    'Your username or email:': '你的使用者名稱或電子郵件：',
    // 「To verify, type <delete my account> exactly as it appears:」（旧版结尾为 below:）
    'To verify, type': '請依照原樣輸入',
    "You'll be prompted to verify your identity before account deletion.": '刪除帳號前，系統會提示你驗證身分。',
    'You’ll be prompted to verify your identity before account deletion.': '刪除帳號前，系統會提示你驗證身分。',
    'Confirm your password:': '確認你的密碼：',
    'Cancel plan and delete this account': '取消方案並刪除此帳號',
    'Delete this account': '刪除此帳號',
    // 删除帐户：仍是企业所有者时的说明（「You must <a>…</a>, and if required, <a>…</a>, before you can delete your user.」见 inline）
    'remove yourself from these enterprises': '退出這些企業',
    'invite a new enterprise owner': '邀請新的企業擁有者'
  },
  scoped: {
    // 重新命名警告「We will create … / We will not set up …」中的 We 不收：计量使用量等页面的日期选择器
    // 也有星期缩写 We（週三），同在 settings 页面类型内，两种译法无法兼顾；will / will not 由组织设定收录
    // 「…You can find them in the <Password and authentication> page.」「…on our <Trending Repositories> page.」
    'page.': '頁面。',
    // 使用者名称可用性检查被 <strong>、建议按钮拆开时：
    // 「Username <foo> is not available. <foo-1>, <foo-2>, or <foo-3> are available.」「<foo> is available.」
    Username: '使用者名稱',
    'is not available.': '無法使用。',
    'are available.': '可供使用。',
    'is available.': '可供使用。',
    // Patreon：「Disconnect the Patreon account <电子邮件> for <@帐号> to sponsor maintainers with. …」
    // 设定页内独立的 for 只见于此句
    for: '與',
    // 删除帐号：「You must remove yourself, transfer ownership, or delete …」
    'You must': '你必須先',
    // 降级提示：「… downgrade your account to a FREE account? …」（FREE 指方案，译「免費版」）
    'to a': '為',
    FREE: '免費版',
    // 删除确认：「We will immediately delete …」「To verify, type delete my account exactly as it appears:」
    'We will': '我們將',
    'exactly as it appears:': '以完成驗證：',
    'below:': '：',
    // 继任者状态（邀请待对方接受；pending 同术语表作「待處理」）
    Pending: '待處理',
    Declined: '已拒絕',
    Accepted: '已接受',
    // 危险区域
    'Danger zone': '危險區域',
    'Danger Zone': '危險區域'
  },
  regexp: [
    // 变更使用者名称：可用性检查（标点随原文：句号不改成逗号）
    [
      new RegExp(`^Username ${LOGIN} is not available\\. Please choose another\\. To submit a trademark claim, please see our$`),
      '使用者名稱 $1 無法使用。請另選一個。若要提出商標申訴，請參閱我們的'
    ],
    [
      new RegExp(`^Username ${LOGIN} is not available\\. ([\\w-]+(?:, [\\w-]+)*(?:,? or [\\w-]+)?) are available\\.$`),
      (_, name: string, list: string) => `使用者名稱 ${name} 無法使用。${joinNames(list)} 可供使用。`
    ],
    [new RegExp(`^Username ${LOGIN} is not available\\.$`), '使用者名稱 $1 無法使用。'],
    [new RegExp(`^${LOGIN} is available\\.$`), '$1 可供使用。'],
    [
      // 句号随原文；与组织名称的同句一致：alphanumeric characters → 英數字元
      /^Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen(\.?)$/,
      (_, dot: string) => `使用者名稱只能包含英數字元或單一連字號，且不能以連字號開頭或結尾${dot ? '。' : ''}`
    ],
    // 变更使用者名称的完成页：按钮文字含新使用者名称（未被元素拆开时）
    [new RegExp(`^View ${LOGIN} settings$`), '查看 $1 的設定'],
    // Patreon：帐号名未被拆开时（GitHub Sponsors profile → GitHub 贊助個人檔案，与组织设定的片段同译）
    [
      new RegExp(
        `^Connect a Patreon account for ${LOGIN} to sponsor maintainers with\\. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile\\.$`
      ),
      '為 $1 連接 Patreon 帳號以贊助維護者。如果受贊助者也已連結 Patreon 和 GitHub，且擁有公開的 GitHub 贊助個人檔案，你在 Patreon 上的贊助也會在 GitHub 上獲得認可。'
    ],
    // 汇出：帐号名未被拆开时
    [
      new RegExp(`^Export all repositories and profile metadata for ${LOGIN}\\. Exports will be available for (\\d+) days?\\.$`),
      '匯出 $1 的所有儲存庫和個人檔案中繼資料。匯出檔案將保留 $2 天。'
    ],
    // 继任者说明的前半句（「designated below」链接之前）
    [
      new RegExp(
        `^By clicking ["“]Add Successor["”] below, I acknowledge that I am the owner of the ${LOGIN} account, and am authorizing GitHub to transfer content within that account to my GitHub Successor,$`
      ),
      '按一下下方的「新增繼任者」，即表示我確認自己是 $1 帳號的擁有者，並授權 GitHub 在我身故時將該帳號中的內容轉移給我的 GitHub 繼任者，'
    ],
    [new RegExp(`^This link will only work for ${LOGIN}\\.$`), '此連結僅適用於 $1。'],
    [new RegExp(`^You have successfully sent the successor invitation to ${LOGIN}\\.$`), '已將繼任者邀請傳送給 $1。'],
    [new RegExp(`^You have revoked the successor invitation to ${LOGIN}\\.$`), '已撤銷對 $1 的繼任者邀請。'],
    [new RegExp(`^You have canceled the invitation to ${LOGIN} to be your designated successor\\.$`), '已取消邀請 $1 成為你指定的繼任者。'],
    // 删除确认：储存库数在 <strong> 中；整句未被拆开时
    [/^immediately delete all of your repositor(?:y|ies) \((\d[\d,]*)\)$/, '立即刪除你的所有儲存庫（$1 個）'],
    [
      /^We will immediately delete all of your repositor(?:y|ies) \((\d[\d,]*)\), along with all of your forks, wikis, issues, pull requests, and GitHub Pages sites\.$/,
      '我們將立即刪除你的所有儲存庫（$1 個），以及你的所有分叉、Wiki、議題、拉取請求和 GitHub 頁面網站。'
    ]
  ],
  // 变更使用者名称的完成页：「Remember to <a>update your local repositories</a> to point to the new location.」，
  // 链接文字由 static 译出，拼读为「記得更新本機儲存庫以指向新位置。」；按钮里的使用者名称包在元素中时见第二条
  inline: [
    ['Remember to {} to point to the new location.', '記得{}以指向新位置。'],
    ['View {} settings', '查看 {} 的設定'],
    // 更改用户名的警告（与组织设置一致；单独的 We 不收，见 scoped 的说明）
    ['We {} create redirects for your repositories (web and git access).', '我們{}為你的儲存庫建立重新導向（網頁和 Git 存取）。'],
    ['We {} set up redirects for your old profile page.', '我們{}為你的舊個人檔案頁面設定重新導向。'],
    ['We {} set up redirects for Pages sites.', '我們{}為頁面網站設定重新導向。'],
    ['We {} set up redirects for your Pages sites.', '我們{}為你的頁面網站設定重新導向。'],
    // 删除帐户：仍是企业所有者（企业名在 <strong> 里）
    ['Your account is currently an owner in these enterprises: {}', '你的帳號目前是下列企業的擁有者：{}'],
    ['You must {}, and if required, {}, before you can delete your user.', '你必須先{}，並在需要時{}，才能刪除你的使用者。']
  ]
} satisfies PageDictionary
