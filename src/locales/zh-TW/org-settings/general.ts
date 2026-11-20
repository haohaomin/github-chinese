import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * 组织设置「一般」页：组织个人资料表单、产品内消息、服务条款、Patreon、开发人员计划、
 * 危险区域（重命名、存档、取消存档、删除）及确认对话框。
 * 个人设置已收录为 static 的同名词条（Profile picture、Update profile、Upload a photo…、
 * Link to social profile、开发人员计划标题与按钮等）不再重复。
 * 重命名警告片段、Patreon 片段与开发人员计划说明为个人设置共用，放 static。
 */
export default {
  static: {
    // 产品指南和推荐
    'Allow GitHub to use product usage data to provide members of your organization with personalized product guidance and recommendations.':
      '允許 GitHub 使用產品使用資料，為組織成員提供個人化的產品指引和建議。',
    'Unsaved changes to your info form may be lost.': '資訊表單中未儲存的變更可能會遺失。',
    'Social account': '社群帳號',
    // 接受 GitHub 客户协议（「This business — not <strong>用户</strong> (your user account), …」见 inline）
    'Accept GitHub customer agreement': '接受 GitHub 客戶合約',
    'Do you want to give ownership of your organization to your business?': '是否要將組織的擁有權轉讓給你的企業？',
    'Yes, I want to sign the GitHub customer agreement on behalf of my business.': '是，我要代表我的企業簽署 GitHub 客戶合約。',
    'What is the name of the business that owns this account?': '擁有此帳號的企業名稱是什麼？',
    'The name of the company that owns this account': '擁有此帳號的公司名稱',
    'e.g, Acme, Inc.': '例如：Acme, Inc.',
    'Accepting terms...': '正在接受條款...',
    'GitHub customer agreement': 'GitHub 客戶合約',
    "GitHub's customer agreement requires you to transfer the ownership of your organization to your business. Enter your business details below to continue. You can change these at any time by accessing your organization’s billing information.":
      'GitHub 客戶合約要求你將組織的擁有權轉讓給你的企業。請在下方輸入企業詳細資料以繼續。你可以隨時在組織的帳單資訊中變更這些資料。',
    'Business/Institution name': '企業/機構名稱',
    // 重命名、存档
    'Rename your organization?': '重新命名組織？',
    'Type in the name of the organization to confirm that you want to archive this organization.': '輸入組織名稱以確認封存此組織。',
    // 重命名进度与完成页（「Remember to <a>…</a> to point to the new location.」「View <strong>组织</strong> settings」见 inline）
    'Renaming your organization…': '正在重新命名組織…',
    'Renaming your organization...': '正在重新命名組織...',
    'This may take a few minutes to complete.': '這可能需要幾分鐘才能完成。',
    'Your organization has been renamed': '你的組織已重新命名',
    // 组织个人资料
    'Organization display name': '組織顯示名稱',
    'Email (will be public)': '電子郵件（將會公開）',
    '(will be public)': '（將會公開）',
    'Billing email': '帳單電子郵件',
    'Add more billing email recipients in the': '新增更多帳單電子郵件收件者請至',
    'billing page': '帳務頁面',
    'Gravatar email': 'Gravatar 電子郵件',
    // 赞助语境的 updates → 「動態」（标签与说明同译）
    'Sponsors update email': '贊助動態電子郵件',
    'The developers and organizations that your organization sponsors can send you updates to this email.':
      '你的組織贊助的開發人員和組織可以透過此電子郵件地址傳送動態給你。',
    "Note: To apply for a publisher verification your organization's profile picture should not be irrelevant, abusive or vulgar. It should not be a default image provided by GitHub.":
      '注意：若要申請發行者驗證，組織頭像不得與組織無關、具冒犯性或低俗。頭像也不得是 GitHub 提供的預設圖片。',
    'Note: To apply for a publisher verification your organization’s profile picture should not be irrelevant, abusive or vulgar. It should not be a default image provided by GitHub.':
      '注意：若要申請發行者驗證，組織頭像不得與組織無關、具冒犯性或低俗。頭像也不得是 GitHub 提供的預設圖片。',

    // 产品内消息
    'In-product messages': '產品內訊息',
    'Notify account admins about exclusive GitHub products, services, offers, and events.':
      '向帳號管理員通知 GitHub 的獨家產品、服務、優惠和活動。',
    'Allow members in your organization to request access to products, budget, or features.': '允許組織成員申請使用產品、預算或功能。',
    'Show your organization members tips about enabled products and features.': '向組織成員顯示已啟用產品和功能的提示。',
    'Customer Research': '客戶研究',
    'Allow GitHub to contact members in your organization for research and feedback surveys.':
      '允許 GitHub 聯絡組織成員參與研究和意見回饋調查。',
    'Product guidance and recommendations': '產品指引和建議',
    "Your enterprise has disabled these emails. This organization's preference cannot enable them.":
      '你的企業已停用這些電子郵件。此組織的偏好設定無法將其啟用。',
    'Your enterprise has disabled these emails. This organization’s preference cannot enable them.':
      '你的企業已停用這些電子郵件。此組織的偏好設定無法將其啟用。',

    // 服务条款
    'Best for individuals wanting the freedom to move data and remain independent of a corporation.':
      '最適合想要自由轉移資料且不受企業約束的個人。',
    'Read the Standard Terms of Service': '閱讀標準服務條款',
    'Best for businesses that need to protect their intellectual property and secure visibility into their data.':
      '最適合需要保護智慧財產並確保資料可見度的企業。',
    'Read the GitHub customer agreement': '閱讀 GitHub 客戶合約',
    'Read the GitHub Customer Agreement': '閱讀 GitHub 客戶合約',
    'Sign GitHub customer terms': '簽署 GitHub 客戶條款',
    'Yes, I want to sign these terms on behalf of my business.': '是，我要代表我的公司簽署這些條款。',
    'Accept terms': '接受條款',

    // Patreon（个人设置共用片段）：connect → 「連接」，link → 「連結」
    'Connect a Patreon account for': '為',
    'to sponsor maintainers with. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile.':
      '連接 Patreon 帳號以贊助維護者。如果受贊助者也已連結 Patreon 和 GitHub，且擁有公開的 GitHub 贊助個人檔案，你在 Patreon 上的贊助也會在 GitHub 上獲得認可。',

    // 开发人员计划（个人设置共用）：「Check out the Developer site」+「for guides, …」，片段间原文无逗号，译文不加
    'for guides, our API reference, and other resources for building applications that integrate with GitHub. Make sure your contact information is up-to-date below. Thanks for being a member!':
      '以取得指南、API 參考資料和其他用於建置 GitHub 整合應用程式的資源。請確認下方的聯絡資訊是最新的。感謝你的加入！',
    'Thanks for updating your Developer Program contact information!': '感謝你更新開發人員計畫聯絡資訊！',

    // 危险区域：重命名（个人设置共用片段）
    'Rename organization': '重新命名組織',
    'Renaming your organization can have': '重新命名組織可能會產生',
    'unintended side effects': '非預期的副作用',
    'This organization cannot be renamed because it is archived.': '此組織因已封存而無法重新命名。',
    'Really rename your organization?': '確定要重新命名組織嗎？',
    // 原文无逗号，译文不加；与 projects/settings.ts 同句一致
    'Unexpected bad things will happen if you don’t read this!': '不讀完以下內容可能會造成意想不到的後果！',
    "Unexpected bad things will happen if you don't read this!": '不讀完以下內容可能會造成意想不到的後果！',
    'set up redirects for your old profile page.': '為你的舊個人檔案頁面設定重新導向。',
    'set up redirects for Pages sites.': '為頁面網站設定重新導向。',
    'create redirects for your repositories (web and git access).': '為你的儲存庫建立重新導向（網頁和 Git 存取）。',
    'You will need to update your local repositories to point to the new location.': '你需要更新本機儲存庫以指向新位置。',
    'Renaming may take a few minutes to complete.': '重新命名可能需要幾分鐘才能完成。',
    'I understand, let’s rename my organization': '我瞭解，重新命名我的組織',
    "I understand, let's rename my organization": '我瞭解，重新命名我的組織',
    'Rename your organization': '重新命名組織',
    'Change organization’s name': '變更組織名稱',
    "Change organization's name": '變更組織名稱',
    'Organization name may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen':
      '組織名稱只能包含英數字元或單一連字號，且不能以連字號開頭或結尾',
    'Organization name is not available': '此組織名稱無法使用',

    // 危险区域：存档
    'Archive this organization': '封存此組織',
    'Mark this organization and all its repositories as archived and read-only.': '將此組織及其所有儲存庫標示為已封存和唯讀。',
    'Archive organization': '封存組織',
    'Archive the organization': '封存組織',
    'This organization will be archived.': '此組織將會封存。',
    'Modifying settings will be limited and creating new repositories will be blocked.': '修改設定將受到限制且無法建立新儲存庫。',
    'All repositories will be': '所有儲存庫都將',
    'and be read-only.': '並設為唯讀。',
    'Before you archive, please consider:': '封存前，請考慮：',
    'Updating any organization settings': '更新任何組織設定',
    'Making a note in your': '新增說明至你的',
    'organization README': '組織讀我檔案',
    'I understand the consequences, archive this organization': '我瞭解後果，封存此組織',
    'Unarchive this organization': '取消封存此組織',
    'Mark this organization as unarchived and read-write.': '將此組織標示為未封存且可讀寫。',
    'Unarchive organization': '取消封存組織',
    'Unarchive the organization': '取消封存組織',
    'This organization will be unarchived.': '此組織將會取消封存。',
    'Modifying settings will be possible and creating new repositories will be unblocked.': '將可修改設定並建立新儲存庫。',
    // 「Repositories will remain」+ <strong>archived</strong> +「and need to be unarchived separately.」：原文无逗号，译文不加
    'Repositories will be remain': '儲存庫將保持',
    'Repositories will remain': '儲存庫將保持',
    'and need to be unarchived separately.': '狀態並需要分別取消封存。',
    'I understand the consequences, unarchive this organization': '我瞭解後果，取消封存此組織',
    'Most organization settings are hidden for an archived organization. This organization must be unarchived to change them.':
      '已封存組織的大多數設定都會隱藏。必須先取消封存此組織才能變更這些設定。',
    'This organization has been archived.': '此組織已封存。',
    'This organization has been archived and is read-only.': '此組織已封存且為唯讀。',

    // 危险区域：删除
    'Delete this organization': '刪除此組織',
    'Once deleted, it will be gone forever. Please be certain.': '刪除後將無法復原。請務必確定。',
    'Are you sure you want to delete this?': '確定要刪除嗎？',
    'Deleting the': '刪除',
    'organization will delete all of its repositories. The': '組織將刪除其所有儲存庫。同時',
    'username will be unavailable for 90 days.': '使用者名稱將在 90 天內無法使用。',
    'Before proceeding, please be sure to review the': '繼續之前，請務必查看',
    'regarding account deletion.': '中有關刪除帳號的內容。',
    'Enter this organization’s name to confirm': '輸入此組織的名稱以確認',
    "Enter this organization's name to confirm": '輸入此組織的名稱以確認',
    'Cancel plan and delete the organization': '取消方案並刪除組織',
    'Delete organization': '刪除組織'
  },
  scoped: {
    // 开关的状态文字（Primer ToggleSwitch）
    On: '開',
    Off: '關',
    // 保存个人资料后的提示
    'Profile updated.': '組織資料已更新。',
    // 与个人设置共用的表单词（「Upload new picture」「Danger zone」团队设置页也用，由 teams 收录为 static）
    Email: '電子郵件',
    Location: '所在地',
    'Select a location': '選擇所在地',
    'Find a location...': '尋找所在地...',
    'Find a location…': '尋找所在地…',
    'Clear Location': '清除所在地',
    'Social accounts': '社群帳號',
    // 「Billing email」+「(Private)」；整段在同一文本节点时另收。非可见度义 private → 「不公開」（与「不公開我的電子郵件地址」一致）
    '(Private)': '（不公開）',
    'Billing email (Private)': '帳單電子郵件（不公開）',
    'Gravatar email (Private)': 'Gravatar 電子郵件（不公開）',
    'Sponsors update email (Private)': '贊助動態電子郵件（不公開）',
    // 原文无逗号，与「Add more billing email recipients in the」+「billing page」+「.」拼读结果一致
    'Add more billing email recipients in the billing page.': '新增更多帳單電子郵件收件者請至帳務頁面。',
    'Patreon account': 'Patreon 帳號',
    'Disconnect Patreon': '中斷 Patreon 連接',
    'Danger Zone': '危險區域',
    // 重命名
    'Renaming your organization can have unintended side effects.': '重新命名組織可能會產生非預期的副作用。',
    'set up redirects for your Pages sites.': '為你的頁面網站設定重新導向。',
    'New organization name': '新組織名稱',
    'Enter a new name': '輸入新名稱',
    'Organization was successfully renamed.': '已成功重新命名組織。',
    'Your organization has been renamed.': '你的組織已重新命名。',
    'Your organization is being renamed.': '正在重新命名你的組織。',
    // 删除受阻
    'This organization cannot be deleted because it has an active sponsorship.': '此組織因有持續中的贊助而無法刪除。',
    'Your organization is currently sponsoring': '你的組織目前正在贊助',
    'Cancel your sponsorships before deleting this organization.': '刪除此組織前請先取消贊助。',
    'This organization is part of an enterprise account': '此組織隸屬於企業帳號',
    'Remove organization from enterprise': '從企業移除組織',
    Promotions: '促銷',
    'Member requests': '成員請求',
    Tips: '提示',
    Emails: '電子郵件',
    'Unable to update': '無法更新',
    // 全站 static 为「個人檔案」译法，组织设置页另收「組織資料」
    'Profile updated successfully': '組織資料已更新',
    Standard: '標準',
    Corporate: '公司',
    // 重命名警告句首的「We」由 inline 整句译出，不单收（与计费日期选择器的星期表头同形）
    archived: '封存',
    'Please provide': '請就此功能提供',
    feedback: '意見回饋',
    'on this feature.': '。',
    'Please type': '請輸入',
    'to confirm.': '以確認。'
  },
  regexp: [
    // 重命名完成页的按钮未拆开时：View <组织> settings（排除常见词，免得误伤“View organization settings”之类）
    [/^View (?!(?:organization|repository|team|account|all|your|the|my)\b)([\w.-]+) settings$/, '查看 $1 的設定'],
    [/^Link to social profile (\d+)$/, '社群帳號連結 $1'],
    [new RegExp(`^Your organization ${ORG} is being archived\\.$`), '正在封存組織 $1。'],
    [new RegExp(`^Your organization ${ORG} has been unarchived\\.$`), '組織 $1 已取消封存。'],
    [new RegExp(`^Please type ${ORG} to confirm\\.$`), '請輸入 $1 以確認。'],
    [new RegExp(`^To confirm, type "${ORG}" in the box below$`), '若要確認，請在下方方塊中輸入「$1」'],
    [
      new RegExp(
        `^Deleting the ${ORG} organization will delete all of its repositories\\. The ${ORG} username will be unavailable for 90 days\\.$`
      ),
      '刪除 $1 組織將刪除其所有儲存庫。$2 使用者名稱將在 90 天內無法使用。'
    ],
    [
      new RegExp(
        `^Connect a Patreon account for ${ORG} to sponsor maintainers with\\. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile\\.$`
      ),
      '為 $1 連接 Patreon 帳號以贊助維護者。如果受贊助者也已連結 Patreon 和 GitHub，且擁有公開的 GitHub 贊助個人檔案，你在 Patreon 上的贊助也會在 GitHub 上獲得認可。'
    ]
  ],
  // 重新命名警告：「We」+ <strong>will</strong> / <strong>will not</strong> + 后半句，槽位里的 will / will not
  // 由 billing.ts 的 static 译成「將 / 不會」，拼读为「我們不會為你的舊個人檔案頁面設定重新導向。」
  inline: [
    [
      'This business — not {} (your user account), will own and/or control any content posted to the organization',
      '此企業（而非你的使用者帳號 {}）將擁有和/或控制發佈到組織的任何內容'
    ],
    ['By clicking “Accept terms”, you agree to the {} and the {}{}.', '點擊「接受條款」即表示你同意 {}和{}{}。'],
    ['I agree to the {} and the {}{}.', '我同意{}和{}{}。'],
    ['Remember to {} to point to the new location.', '記得{}，使其指向新位置。'],
    ['View {} settings', '查看 {} 的設定'],
    ['We {} create redirects for your repositories (web and git access).', '我們{}為你的儲存庫建立重新導向（網頁和 Git 存取）。'],
    ['We {} set up redirects for your old profile page.', '我們{}為你的舊個人檔案頁面設定重新導向。'],
    ['We {} set up redirects for Pages sites.', '我們{}為頁面網站設定重新導向。'],
    ['We {} set up redirects for your Pages sites.', '我們{}為你的頁面網站設定重新導向。']
  ]
} satisfies PageDictionary
