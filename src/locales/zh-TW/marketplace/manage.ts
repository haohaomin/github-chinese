import type { PageDictionary } from '../../../core/types'

/**
 * 市集上架资讯的建立与管理：新增上架资讯草稿（/marketplace/new、/marketplace/new/<类型>/<id>）、
 * 编辑页各步骤（/marketplace/<上架资讯>/edit、edit/contact、edit/description、edit/plans、security_compliance、hook）、
 * 交易（/marketplace/<上架资讯>/insights/transactions）。
 * 开发人员协议正文、语言选择列表不翻译（见 ignore）。术语：listing → 上架資訊，logo → 標誌，plan → 方案。
 */
export default {
  static: {
    // 新增上架资讯草稿
    'Create a draft GitHub Marketplace listing from one of your tools': '使用你的工具建立 GitHub 市集上架資訊草稿',
    'Create a new GitHub Marketplace draft listing': '建立新的 GitHub 市集上架資訊草稿',
    'Create draft listing': '建立上架資訊草稿',
    'A human-friendly name for your listing.': '方便辨識的上架資訊名稱。',
    'Save and add more details': '儲存並新增更多詳細資料',
    // 「Your tool must <a>meet the requirements</a> for GitHub Marketplace in order to be approved.」
    'Your tool must': '你的工具必須',
    'meet the requirements': '符合要求',
    'for GitHub Marketplace in order to be approved.': '才能在 GitHub 市集獲得核准。',
    'Could not create a Marketplace listing: Name is unavailable. The listing name cannot be the same as an existing GitHub account unless it is your own user or organization name.':
      '無法建立市集上架資訊：名稱無法使用。上架資訊名稱不能與你本人或你的組織以外的現有 GitHub 帳號同名。',
    "Could not create a Marketplace listing: Slug can't be blank": '無法建立市集上架資訊：簡短名稱不能為空白',
    'Could not create a Marketplace listing: Slug can’t be blank': '無法建立市集上架資訊：簡短名稱不能為空白',
    'A draft of your Marketplace listing has been saved. You can customize your listing further.':
      '已儲存市集上架資訊草稿。你可以進一步自訂上架資訊。',

    // 编辑页：侧栏与概览
    'Marketplace dashboard menu': '市集儀表板選單',
    'Listing settings': '上架資訊設定',
    'Preview listing': '預覽上架資訊',
    'Contact info': '聯絡資訊',
    'Listing description': '上架資訊說明',
    'Security and compliance': '安全性與合規性',
    'Publish your app to Marketplace': '將應用程式發佈到市集',
    'To publish your app to GitHub Marketplace, complete the following items. Once completed, you can submit your listing to us for review. More information can be found in':
      '若要將應用程式發佈到 GitHub 市集，請完成下列項目。完成後即可提交上架資訊供我們審查。詳細資訊請參閱',
    'This listing has not been published to Marketplace.': '此上架資訊尚未發佈到市集。',
    'This listing is a draft and has not yet been published on GitHub Marketplace.': '此上架資訊是尚未在 GitHub 市集發佈的草稿。',
    'Add your contact info': '新增聯絡資訊',
    'Fill out your listing description': '填寫上架資訊說明',
    'Create plans': '建立方案',
    'Add security and compliance information': '新增安全性與合規性資訊',
    'Set up webhook': '設定 Web 鉤子',
    // 「Sign <details>GitHub Marketplace Developer Agreement</details>」
    'GitHub Marketplace Developer Agreement': 'GitHub 市集開發人員協議',
    'Accept the Marketplace Developer Agreement prior to submitting your listing': '提交上架資訊前須接受市集開發人員協議',
    'Please check to make sure that you are agreeing to these terms on behalf of the correct account.':
      '請確認你是代表正確的帳號同意這些條款。',
    "After submission, your listing will be reviewed by GitHub for publishing. We'll notify you via email with updates. Any existing subscriptions will be removed.":
      '提交後，GitHub 會審查你的上架資訊以決定是否發佈。我們會以電子郵件通知你最新進度。所有現有訂閱都會被移除。',
    'After submission, your listing will be reviewed by GitHub for publishing. We’ll notify you via email with updates. Any existing subscriptions will be removed.':
      '提交後，GitHub 會審查你的上架資訊以決定是否發佈。我們會以電子郵件通知你最新進度。所有現有訂閱都會被移除。',
    'Request publish': '申請發佈',

    // 各步骤底部「Next: …」
    'Fill out your listing description.': '填寫上架資訊說明。',
    'Add plans and pricing.': '新增方案和定價。',
    'Add a webhook.': '新增 Web 鉤子。',
    'Submit for review!': '提交審查！',
    'Next Page: Fill out your listing description.': '下一頁：填寫上架資訊說明。',
    'Next Page: Add plans and pricing.': '下一頁：新增方案和定價。',
    'Next Page: Security and compliance': '下一頁：安全性與合規性',
    'Next Page: Add a webhook.': '下一頁：新增 Web 鉤子。',
    'Next Page: Submit for review!': '下一頁：提交審查！',

    // 联络资讯
    'Contact information': '聯絡資訊',
    'We will use these contacts for official correspondence to your team about updates to GitHub Marketplace as it affects your listing.':
      '我們會透過這些聯絡人，就 GitHub 市集中影響你上架資訊的更新與你的團隊正式聯繫。',
    'Note: We will not share this information with the public as it is used for our internal records. However, in the case of an enterprise customer introduction, we will use your marketing email.':
      '注意：我們不會公開這些僅供內部紀錄使用的資訊。但在引介企業客戶時，我們會使用你的行銷電子郵件。',
    'Technical lead email': '技術負責人電子郵件',
    'Marketing lead email': '行銷負責人電子郵件',
    'Finance lead email': '財務負責人電子郵件',
    'Security lead email': '安全性負責人電子郵件',
    'Save contact info': '儲存聯絡資訊',

    // 上架资讯说明：名称和连结
    'This information will be shown in the Marketplace when your listing is approved. More information can be found in':
      '這些資訊會在上架資訊核准後顯示在市集中。詳細資訊請參閱',
    'Naming and links': '名稱和連結',
    'Listing name': '上架資訊名稱',
    'A human-friendly name for your listing. Changing this name will change the URL for your listing.':
      '方便辨識的上架資訊名稱。變更名稱會變更上架資訊的 URL。',
    'Very short description': '一句話說明',
    'Cannot end with punctuation': '不能以標點符號結尾',
    'This description will be shown under your listing’s name in search results, the home page and category pages.':
      '此說明會顯示在搜尋結果、首頁和類別頁面中的上架資訊名稱下方。',
    "This description will be shown under your listing's name in search results, the home page and category pages.":
      '此說明會顯示在搜尋結果、首頁和類別頁面中的上架資訊名稱下方。',
    'Primary category': '主要類別',
    'Secondary category': '次要類別',
    // 「Choose languages (<span>0</span>/10)」整句见 inline
    'Choose languages (': '選擇語言（',
    'Filter languages': '篩選語言',
    'You can only select up to 10 languages.': '最多只能選擇 10 種語言。',
    'Customer support URL': '客戶支援 URL',
    ', required': '，必填',
    'Installation URL': '安裝 URL',
    "The URL we'll redirect to after they install the app on GitHub. More information on this can be found in":
      '使用者在 GitHub 上安裝應用程式後重新導向的 URL。詳細資訊請參閱',
    'The URL we’ll redirect to after they install the app on GitHub. More information on this can be found in':
      '使用者在 GitHub 上安裝應用程式後重新導向的 URL。詳細資訊請參閱',
    'Company URL': '公司 URL',
    'Status URL': '狀態 URL',
    'Documentation URL': '說明文件 URL',
    'Save naming and links': '儲存名稱和連結',

    // 标志和精选卡片
    'Logo and feature card': '標誌和精選卡片',
    'Logo image file upload': '上傳標誌圖片檔案',
    'Background image': '背景圖片',
    'Background image file upload': '上傳背景圖片檔案',
    'Please upload an image smaller than 1 MB.': '請上傳小於 1 MB 的圖片。',
    'We only support PNG, GIF, and JPG images.': '僅支援 PNG、GIF 和 JPG 圖片。',
    'Something went really wrong and we can’t process that image.': '因嚴重錯誤而無法處理該圖片。',
    "Something went really wrong and we can't process that image.": '因嚴重錯誤而無法處理該圖片。',
    'The hex value of the badge background color.': '徽章背景顏色的十六進位值。',
    'Text color': '文字顏色',
    'Light text': '淺色文字',
    'Dark text': '深色文字',
    'Save logo and feature card': '儲存標誌和精選卡片',
    'Changes may take a few moments to update across the entire site.': '變更可能需要一些時間才會在全站生效。',
    'Guidelines for your feature card:': '精選卡片指南：',
    'Background image measures 965px by 482px (width x height).': '背景圖片尺寸為 965px × 482px（寬 × 高）。',
    'Text shows up clearly over the art.': '文字在圖片上清楚可見。',
    'Background image contains a bit of texture.': '背景圖片帶有一些紋理。',
    'Feature card captures your brand personality.': '精選卡片展現品牌個性。',
    // 「For examples, see the <a>Marketplace homepage</a>.」
    'For examples, see the': '範例請參閱',
    'Marketplace homepage': '市集首頁',

    // 上架资讯详细资料、萤幕撷取画面
    'Listing details': '上架資訊詳細資料',
    'Introductory description': '簡介',
    'This is shown on your listing page at the top of your listing.': '顯示在上架資訊頁面頂端。',
    'Detailed description': '詳細說明',
    'Displayed below the introduction. Clear and well-formatted submissions are more likely to be approved.':
      '顯示在簡介下方。清楚且格式良好的內容較容易獲得核准。',
    'Must provide at least 400 and no more than 2,000 characters.': '須提供 400 到 2,000 個字元。',
    'Save listing details': '儲存上架資訊詳細資料',
    'Product screenshots': '產品螢幕擷取畫面',
    'Use a high resolution image, at least 1200px wide. Images should all be the same height and width (aspect ratio) to avoid page jumps when users navigate from one image to the next. At least one image is required.':
      '請使用寬度至少 1200px 的高解析度圖片。所有圖片應保持相同的寬高（長寬比）以免使用者切換圖片時頁面跳動。至少需要一張圖片。',
    'Screenshot file upload': '上傳螢幕擷取畫面檔案',
    'Please upload a picture smaller than 5 MB.': '請上傳小於 5 MB 的圖片。',

    // 方案和定价
    'New draft plan': '新增方案草稿',
    // 「Add and modify your pricing plans for <strong>上架资讯</strong>. More information can be found in <a>…</a>.」整句见 inline
    'Add and modify your pricing plans for': '新增和修改定價方案',
    '. More information can be found in': '。詳細資訊請參閱',
    'No pricing plans': '沒有定價方案',
    'You need at least one plan to publish your app to GitHub Marketplace': '至少需要一個方案才能將應用程式發佈到 GitHub 市集',

    // 新建方案（edit/plans/new）：编辑器、定价模式与适用对象菜单的说明
    'More information can be found in': '詳細資訊請參閱',
    'Plan editing mode': '方案編輯模式',
    'Plan editor': '方案編輯器',
    'Plan name': '方案名稱',
    'Pricing model': '定價模式',
    'This plan will cost nothing. Free trials will be disabled.': '此方案免費。將停用免費試用。',
    'Example: $10 / month': '範例：$10 / 月',
    'Example: $10 per user / month': '範例：每位使用者 $10 / 月',
    'Name of the unit': '單位名稱',
    'Example: user, seat, or person': '範例：使用者、席位或人',
    'Must be a whole dollar amount': '須為整數美元金額',
    'This plan can be subscribed to by both personal users and organizations': '個人使用者和組織皆可訂閱此方案',
    'This plan can only be subscribed to by personal user accounts only': '僅個人使用者帳號可訂閱此方案',
    'This plan can only be subscribed to by organizations only': '僅組織可訂閱此方案',

    // 安全性与合规性
    // 「Some of this information … See <a>development documentation for more details.</a>」
    "Some of this information will be displayed on your marketplace listing once it's published. See":
      '部分資訊會在上架資訊發佈後顯示在上架資訊頁面上。請參閱',
    'Some of this information will be displayed on your marketplace listing once it’s published. See':
      '部分資訊會在上架資訊發佈後顯示在上架資訊頁面上。請參閱',
    'development documentation for more details.': '開發說明文件以瞭解詳細資訊。',
    'EU Digital Services Act Compliance': '歐盟數位服務法合規性',
    "Under the EU Digital Services Act, GitHub must collect and display information for paid app publishers classified as traders. If you don’t process payments on GitHub Marketplace, this doesn't apply. For traders, business ID, address, domain, and country will be publicly displayed on your listing. Learn more about":
      '根據歐盟《數位服務法》，GitHub 必須收集並顯示被歸類為經營者的付費應用程式發行者資訊。如果你不在 GitHub 市集處理付款，則不適用。經營者的企業 ID、地址、網域和國家/地區會公開顯示在上架資訊中。瞭解',
    'DSA compliance': '數位服務法合規性',
    'Trader Self-Certification *': '經營者自我認證 *',
    // 「Declare your status … European Commission (EC) <a>notice</a> on what constitutes a trader. …」整句见 inline
    'Declare your status under EU Digital Services Act. European Commission (EC)': '聲明你在歐盟《數位服務法》下的身分。歐盟執委會 (EC)',
    'on what constitutes a trader. See Section 2.2. "Concept of Trader".': '說明了經營者的認定標準。見第 2.2 節「經營者的概念」。',
    'I do operate as a trader under EU regulations': '我在歐盟法規下以經營者身分營運',
    'I do not operate as a trader under EU regulations': '我在歐盟法規下不以經營者身分營運',
    'Business Address *': '營業地址 *',
    'Company address and country. Individual traders can use a P.O. Box.': '公司地址和國家/地區。個人經營者可以使用郵政信箱。',
    'Business ID *': '企業 ID *',
    'ID type': 'ID 類型',
    'DUNS Number': 'DUNS 編號',
    'VAT Number': '加值稅號碼',
    'Other unique identifier (specify)': '其他唯一識別碼（請註明）',
    'Business ID Type': '企業 ID 類型',
    'Unique ID Type': '唯一 ID 類型',
    'Attestation of EU Law Compliance *': '歐盟法律合規聲明 *',
    'I agree to comply with applicable EU regulations in operating my app': '我同意在營運應用程式時遵守適用的歐盟法規',
    // 「… consult Article 30 and 31 of the EU <a>Digital Services Act</a>.」整句见 inline
    'This certification applies to products and services offered through your GitHub Marketplace listing. For guidance on DSA compliance, consult Article 30 and 31 of the EU':
      '此認證適用於透過你的 GitHub 市集上架資訊提供的產品和服務。如需《數位服務法》合規性指引，請參閱第 30 條和第 31 條所在的歐盟',
    'Digital Services Act': '數位服務法',
    'Privacy Policy URL *': '隱私權政策 URL *',
    'Describe your app’s data practices.': '說明應用程式的資料處理做法。',
    "Describe your app's data practices.": '說明應用程式的資料處理做法。',
    'Terms of Service URL': '服務條款 URL',
    'Provide information on your app’s content moderation policies, intended uses and limitations.':
      '提供應用程式的內容審核政策、預期用途和限制等資訊。',
    "Provide information on your app's content moderation policies, intended uses and limitations.":
      '提供應用程式的內容審核政策、預期用途和限制等資訊。',
    'Third-party services required *': '所需的第三方服務 *',
    'List third-party dependencies that your app uses and shares data with, or “None” if there are no dependencies.':
      '列出應用程式使用並與之共用資料的第三方相依項目，沒有則填「None」。',
    'Specify whether or not the source code for your listing is public (open-source) or private':
      '說明上架資訊的原始碼是公開（開放原始碼）還是非公開',
    'Public repository URL': '公開儲存庫 URL',
    'Optional link to the public repository for your app’s codebase.': '應用程式程式碼所在公開儲存庫的選用連結。',
    "Optional link to the public repository for your app's codebase.": '應用程式程式碼所在公開儲存庫的選用連結。',
    'Transparency disclosures': '透明度揭露',
    // 「Provide an overview … see the <a>GitHub Marketplace Developer Agreement</a> and Articles 6 and 8-17 of the <a>EU AI Act (PDF)</a>. Please specify …」
    'Provide an overview of your app’s security and safety mechanisms. Extensions classified as high-risk or those requiring elevated permissions must provide more detailed information on risk management, data governance, and compliance in order to be approved for publishing. For more info, see the':
      '概述應用程式的安全性與防護機制。被歸類為高風險或需要提高權限的擴充功能必須提供風險管理、資料治理和合規性的更詳細資訊，才能獲准發佈。詳細資訊請參閱',
    'and Articles 6 and 8-17 of the': '以及',
    'EU AI Act (PDF)': '歐盟《人工智慧法》(PDF)',
    '. Please specify all types of compliance offered and links to reports for verification.':
      '第 6 條和第 8-17 條。請註明提供的所有合規類型，以及用於驗證的報告連結。',
    // 「All listing information must comply with the <a>GitHub Marketplace Developer Agreement</a>.」
    'All listing information must comply with the': '所有上架資訊都必須遵守',

    // Web 钩子（其余片段与存储库 Web 钩子共用 repo-settings 的 static）
    "request to the URL below with details of any Marketplace events. You can also specify which data format you'd like to receive (JSON,":
      '請求並附帶所有市集事件的詳細資料。你也可以指定要接收的資料格式（JSON、',
    'request to the URL below with details of any Marketplace events. You can also specify which data format you’d like to receive (JSON,':
      '請求並附帶所有市集事件的詳細資料。你也可以指定要接收的資料格式（JSON、',
    'Enter post-receive hook URL': '輸入接收事件的 URL',
    'We require SSL and verify SSL certificates when delivering payloads.': '我們在傳遞承載時要求使用 SSL 並驗證 SSL 憑證。',
    'Create webhook': '建立 Web 鉤子',

    // 交易
    'Past Day': '過去一天',
    'Past Week': '過去一週',
    'Past Month': '過去一個月',
    'Check back soon': '稍後再來查看',
    'If this listing was recently added to the GitHub Marketplace, check back soon. Data is synced daily.':
      '如果此上架資訊是最近才新增到 GitHub 市集的，請稍後再來查看。資料每天同步一次。',
    // 「Check the <a>Marketplace Documentation</a> for more information on this page.」
    'Check the': '請參閱',
    'Marketplace Documentation': '市集說明文件',
    'for more information on this page.': '以瞭解此頁面的詳細資訊。'
  },
  scoped: {
    // 侧栏、步骤名（短词）
    Transactions: '交易',
    Incomplete: '未完成',
    Webhook: 'Web 鉤子',
    'Next:': '下一步：',
    // 「Sign <details>GitHub Marketplace Developer Agreement</details>」
    Sign: '簽署',
    Logo: '標誌',
    'Upload file': '上傳檔案',
    'Uploading...': '上傳中...',
    'Uploading…': '上傳中…',
    // 列表页的方案数「<strong>3</strong> plans available.」
    'plans available.': '個方案可用。',
    README: '讀我檔案',
    'OAuth App': 'OAuth 應用程式',
    notice: '通知',
    // Web 钩子表单（同 repo-settings/webhooks.ts）
    etc: '等',
    '). More information can be found in': '）。詳細資訊請參閱',
    'Content type': '內容類型',
    Secret: '機密',
    Active: '啟用',
    // 新建方案：定价模式、价格标签「Price <span>per unit </span>/ month」、适用对象
    'Flat rate': '固定費率',
    'Per unit': '按單位計費',
    Price: '價格',
    'per unit': '每單位',
    'Available for': '適用於',
    'Personal accounts and organizations': '個人帳號和組織',
    'Personal accounts only': '僅限個人帳號',
    'Organizations only': '僅限組織',
    'Short description': '簡短描述',
    // 方案预览：「For <span>personal accounts and organizations</span>」（整句见 inline）、「1 <span>seat</span>(s) in this plan」
    'personal accounts and organizations': '適用於個人帳號和組織',
    'personal accounts only': '僅限個人帳號',
    'organizations only': '僅限組織',
    '(s) in this plan': '（此方案內）'
  },
  regexp: [
    // 标题：「Edit 上架资讯 - GitHub Marketplace」、页头「Edit 上架资讯」、「上架资讯 Transactions」
    [/^Edit (.+) - GitHub Marketplace$/, '編輯 $1 - GitHub 市集'],
    [/^Edit (.+)$/, '編輯 $1'],
    [/^(.+) Transactions$/, '$1 交易'],
    [/^Create draft listing for (.+)$/, '為 $1 建立上架資訊草稿'],
    // 字数限制与剩余（「Limit 255 characters.」「242 remaining.」）
    [/^Limit (\d[\d,]*) characters\.$/, '限 $1 個字元。'],
    [/^(\d[\d,]*) remaining\.$/, '還剩 $1 個字元。'],
    [/^Limit (\d[\d,]*) characters\. (\d[\d,]*) remaining\.$/, '限 $1 個字元。還剩 $2 個字元。'],
    // 步骤进度「1 of 5」
    [/^(\d) of (\d)$/, '$1 / $2'],
    // 开发人员协议
    [/^GitHub Marketplace Developer Agreement (v[\d.]+)$/, 'GitHub 市集開發人員協議 $1'],
    // 「<a>用户</a> signed the GitHub Marketplace Developer Agreement version v2.3 <relative-time>.」
    [/^signed the GitHub Marketplace Developer Agreement version (v[\d.]+)$/, '簽署 GitHub 市集開發人員協議 $1 版於'],
    [/^This is a list of the financial transactions for (.+)\.$/, '$1 的財務交易清單。'],
    // 新建方案：免费试用天数、要点编号
    [/^Enable (\d+) day free trial for this plan$/, '為此方案啟用 $1 天免費試用'],
    [/^Plan bullet (\d+)$/, '方案要點 $1']
  ],
  inline: [
    // 方案预览「<svg> For <span>personal accounts and organizations</span>」：For 并入适用对象（同详情页 For organizations only → 僅限組織）
    ['{} For {}', '{}{}'],
    ['Add and modify your pricing plans for {}. More information can be found in {}.', '為 {} 新增和修改定價方案。詳細資訊請參閱{}。'],
    ['Choose languages ({#}/10)', '選擇語言（{#}/10）'],
    [
      'Declare your status under EU Digital Services Act. European Commission (EC) {} on what constitutes a trader. See Section 2.2. "Concept of Trader".',
      '聲明你在歐盟《數位服務法》下的身分。經營者的認定請見歐盟執委會 (EC) {}第 2.2 節「經營者的概念」。'
    ],
    [
      'This certification applies to products and services offered through your GitHub Marketplace listing. For guidance on DSA compliance, consult Article 30 and 31 of the EU {}.',
      '此認證適用於透過你的 GitHub 市集上架資訊提供的產品和服務。如需《數位服務法》合規性指引，請參閱歐盟{}第 30 條和第 31 條。'
    ]
  ],
  ignore: [
    // 语言选择列表：语言名
    '.js-languages-menu .select-menu-item-text',
    // 开发人员协议正文（法律文本）
    'details-dialog > .Box-body.markdown-body'
  ]
} satisfies PageDictionary
