import type { PageDictionary } from '../../../core/types'

/**
 * 公开个人档案（/settings/profile）：个人档案表单、头像、ORCID iD、贡献和活动、个人档案设定、
 * 开发人员计画、求职个人档案、热门页面设定、储存提示。
 * 与个人主页「編輯個人檔案」表单、组织资料共用的单词标签（Bio、Location 等）放 scoped，译法与 profile/sidebar.ts 一致；
 * 「@mention」「other users and organizations to link to them.」「Company」「You can manage verified email
 * addresses in your」与「Visitors will now see …」储存提示由其他词典收录。
 * 术语：profile → 個人檔案，profile picture、avatar → 頭像，photo → 相片（按术语表 profile 行）；
 * 隐私设定「Keep my email address private」→「不公開我的電子郵件地址」（按术语表 Public / Private 行）。
 */
export default {
  static: {
    // 个人档案表单
    'Your name may appear around GitHub where you contribute or are mentioned. You can remove it at any time.':
      '你的名稱可能會出現在 GitHub 上你參與貢獻或被提及的地方。你可以隨時移除。',
    'Public email': '公開電子郵件',
    'Select a verified email to display': '選擇要顯示的已驗證電子郵件',
    // 「You can add or remove verified email addresses in your <a>personal email settings</a>.」（原文无标点，译文不加逗号）
    'You can add or remove verified email addresses in your': '新增或移除已驗證的電子郵件地址可前往',
    'personal email settings': '個人電子郵件設定',
    // 「… To toggle email privacy, go to <a>email settings</a> and uncheck "Keep my email address private."」
    'You have set your email address to private. To toggle email privacy, go to':
      '你已將電子郵件地址設為不公開。若要切換電子郵件隱私設定，請前往',
    // 结尾引号在句号之后：标点随原文，结尾不加句号
    'and uncheck "Keep my email address private."': '並取消勾選「不公開我的電子郵件地址」',
    'and uncheck “Keep my email address private.”': '並取消勾選「不公開我的電子郵件地址」',
    'Tell us a little bit about yourself': '簡單介紹一下你自己',
    // 「You can <@mention> your company’s GitHub organization to link it.」（@mention 由 org-settings/teams.ts 译「@提及」）
    'your company’s GitHub organization to link it.': '你公司的 GitHub 組織以連結到該組織。',
    "your company's GitHub organization to link it.": '你公司的 GitHub 組織以連結到該組織。',
    'You can @mention your company’s GitHub organization to link it.': '你可以 @提及你公司的 GitHub 組織以連結到該組織。',
    "You can @mention your company's GitHub organization to link it.": '你可以 @提及你公司的 GitHub 組織以連結到該組織。',
    'Link to social profile': '社群帳號連結',
    'Other users will see the time difference from their local time.': '其他使用者會看到與其當地時間的時差。',
    "All of the fields on this page are optional and can be deleted at any time, and by filling them out, you're giving us consent to share this data wherever your user profile appears. Please see our":
      '此頁面上的所有欄位皆為選填且可隨時刪除，填寫這些欄位即表示你同意我們在你的使用者個人檔案出現的任何位置分享這些資料。請參閱我們的',
    'All of the fields on this page are optional and can be deleted at any time, and by filling them out, you’re giving us consent to share this data wherever your user profile appears. Please see our':
      '此頁面上的所有欄位皆為選填且可隨時刪除，填寫這些欄位即表示你同意我們在你的使用者個人檔案出現的任何位置分享這些資料。請參閱我們的',
    'privacy statement': '隱私權聲明',
    'to learn more about how we use this information.': '以瞭解我們如何使用這些資訊。',
    'Update profile': '更新個人檔案',
    'Profile updated successfully': '已更新個人檔案',
    // 「Profile updated successfully — <a>view your profile.</a>」：破折号连接两个分句，译作「——」，
    // 引擎不保留其后的原文空白
    'Profile updated successfully —': '已更新個人檔案——',
    'view your profile.': '查看你的個人檔案。',

    // 头像（profile picture 与 avatar 同作「頭像」）
    'Profile picture': '頭像',
    'Profile Picture': '頭像',
    'Upload a photo…': '上傳相片…',
    'Upload a photo...': '上傳相片...',
    'Remove photo': '移除相片',
    'Revert to Gravatar': '還原為 Gravatar 頭像',
    'Are you sure you want to reset your current avatar?': '確定要重設目前的頭像嗎？',
    // 句号随原文
    'Your profile picture has been reset. It may take a few minutes to update across the site.': '你的頭像已重設。全站更新可能需要幾分鐘。',
    'Your profile picture has been updated. It may take a few minutes to update across the site.':
      '你的頭像已更新。全站更新可能需要幾分鐘。',
    'Crop your new profile picture': '裁切新的頭像',
    'This profile picture has been deleted.': '此頭像已刪除。',
    'Set new profile picture': '設定新的頭像',
    // 头像上传失败提示（原文无逗号，译文不加）
    'We only support PNG, GIF, or JPG pictures.': '僅支援 PNG、GIF 或 JPG 圖片。',
    'Please upload a picture smaller than 1 MB.': '請上傳小於 1 MB 的圖片。',
    'Please upload a picture with smaller dimensions.': '請上傳尺寸較小的圖片。',
    'Something went really wrong and we can’t process that picture.': '發生嚴重錯誤導致無法處理該圖片。',
    "Something went really wrong and we can't process that picture.": '發生嚴重錯誤導致無法處理該圖片。',

    // ORCID iD（句中用作破折号的「 - 」译作「——」）
    'ORCID provides a persistent identifier - an ORCID iD - that distinguishes you from other researchers. Learn more at':
      'ORCID 提供永久識別碼——ORCID iD——用來區分你與其他研究人員。詳情請見',
    // connect → 連接（按术语表 link / connect 行；断开作「中斷連接」，同 common-ui 的 Disconnect）
    'Connect your ORCID iD': '連接 ORCID iD',
    'Successfully connected your GitHub account with ORCID.': '已將你的 GitHub 帳號與 ORCID 連接。',
    'You have a connected ORCID iD': '你已連接 ORCID iD',
    'for the account': '對應帳號',
    'Display your ORCID iD on your GitHub profile': '在你的 GitHub 個人檔案中顯示 ORCID iD',
    'Disconnecting your ORCID iD may affect areas of your profile where your ORCID iD is displayed.':
      '中斷 ORCID iD 連接可能會影響個人檔案中顯示 ORCID iD 的區域。',
    'Disconnect your ORCID iD': '中斷 ORCID iD 連接',
    'Successfully disconnected ORCID from your GitHub Account.': '已中斷 ORCID 與你的 GitHub 帳號的連接。',

    // 贡献和活动（& 按术语表译「和」）
    'Contributions & activity': '貢獻和活動',
    'Contributions & Activity': '貢獻和活動',
    'Make profile private and hide activity': '將個人檔案設為私人並隱藏活動',
    'Enabling this will hide your contributions and activity from your GitHub profile and from social features like followers, stars, feeds, leaderboards and releases.':
      '啟用後，你的貢獻和活動將不會顯示在 GitHub 個人檔案中，也不會出現在追蹤者、星號、動態、排行榜和發行版本等社群功能中。',
    'Include private contributions on my profile': '在我的個人檔案中包含私人貢獻',
    'Your contribution graph, achievements, and activity overview will show your private contributions without revealing any repository or organization information.':
      '你的貢獻圖表、成就和活動總覽將顯示私人貢獻，但不會透露任何儲存庫或組織資訊。',
    'Update preferences': '更新偏好設定',

    // 个人档案设定（PRO 徽章指 Pro 方案，徽章文字由全站 static 的 Pro 译「專業版」）
    'Profile settings': '個人檔案設定',
    'Display PRO badge': '顯示專業版徽章',
    'This will display the': '這會在你的公開個人檔案頁面上顯示',
    'badge on your public profile page.': '徽章。',
    'Show Achievements on my profile': '在我的個人檔案中顯示成就',
    'Your achievements will be shown on your profile.': '你的成就將顯示在個人檔案中。',

    // 开发人员计画（组织设定页的同名词条为 scoped）
    'GitHub Developer Program': 'GitHub 開發人員計畫',
    'Building an application, service, or tool that integrates with GitHub?': '正在建置與 GitHub 整合的應用程式、服務或工具嗎？',
    // 「Building …? [Join the GitHub Developer Program], or read more about it at our [Developer site].」
    'Join the GitHub Developer Program': '加入 GitHub 開發人員計畫',
    ', or read more about it at our': '，詳情請參閱我們的',
    'GitHub developer program': 'GitHub 開發人員計畫',
    'Developer site': '開發人員網站',
    'Check out the Developer site': '查看開發人員網站',
    'has guides, API and webhook references, information about creating GitHub Apps and other resources for building applications that integrate with GitHub. Make sure your contact information is up-to-date below. Thanks for being a member!':
      '提供指南、API 和 Web 鉤子參考資料、建立 GitHub 應用程式的資訊，以及建置與 GitHub 整合的應用程式所需的其他資源。請確認下方的聯絡資訊是最新的。感謝你的加入！',
    'Support email address': '支援電子郵件地址',
    'An email address where GitHub users can contact you for support.': 'GitHub 使用者可透過此電子郵件地址聯絡你以取得支援。',
    'Product or company website': '產品或公司網站',
    'The URL for the product, company, or service that integrates with GitHub.': '與 GitHub 整合的產品、公司或服務的 URL。',
    'Update contact information': '更新聯絡資訊',
    'Leave the program': '退出計畫',

    // 求职个人档案（profile → 個人檔案）
    'Jobs profile': '求職個人檔案',
    'Available for hire': '接受工作邀約',
    'Save jobs profile': '儲存求職個人檔案',

    // 热门页面设定：Trending 指热门页（/trending），单说「熱門設定」易读成常用设定，作「熱門頁面設定」；
    // spoken language 同 explore/trending.ts 作「自然語言」。
    // 句子被链接拆成 “… lists on” + “our” + “Trending Repositories” + “page.”
    // →「此語言偏好將用於篩選我們的熱門儲存庫頁面。」
    'Trending settings': '熱門頁面設定',
    'Preferred spoken language': '偏好的自然語言',
    'No Preference': '無偏好',
    'No preference': '無偏好',
    "We'll use this language preference to filter the trending repository lists on": '此語言偏好將用於篩選',
    'We’ll use this language preference to filter the trending repository lists on': '此語言偏好將用於篩選',
    'Trending Repositories': '熱門儲存庫',
    'Save Trending settings': '儲存熱門頁面設定'
  },
  scoped: {
    // 与个人主页编辑个人档案表单、组织资料同名的字段（与 profile/sidebar.ts 一致）
    Bio: '個人簡介',
    Pronouns: '代名詞',
    "Don't specify": '不指定',
    'Don’t specify': '不指定',
    // 代名词下拉选项：只在设定页翻译，个人主页侧栏显示的所选代名词不受影响；
    // they/them 作「他們」（Facebook 繁中中性代名词的写法）
    'they/them': '他們',
    'she/her': '她',
    'he/him': '他',
    Custom: '自訂',
    'Social accounts': '社群帳號',
    // 社群帐号输入框的无障碍名称
    'Social account': '社群帳號',
    Location: '所在地',
    'Display current local time': '顯示目前當地時間',
    'Time zone': '時區',
    'You can': '你可以',
    'email settings': '電子郵件設定',
    // 贡献设定说明后「Read more」链接（可见文字由 common-ui 收录）的无障碍名称
    'Read more about viewing contributions on your profile': '瞭解如何在個人檔案中查看貢獻',
    our: '我們的'
    // 「page.」与帐号页共用，由 account.ts 收录
  },
  regexp: [
    // 社群帐号输入框的无障碍名称（与 profile/sidebar.ts 一致）
    [/^Link to social profile (\d)$/, '社群帳號連結 $1']
  ]
} satisfies PageDictionary
