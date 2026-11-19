import type { PageDictionary } from '../../../core/types'

/**
 * 市场上架项的创建与管理：新建上架项草稿（/marketplace/new、/marketplace/new/<类型>/<id>）、
 * 编辑页各步骤（/marketplace/<上架项>/edit、edit/contact、edit/description、edit/plans、security_compliance、hook）、
 * 交易（/marketplace/<上架项>/insights/transactions）。
 * 开发人员协议正文、语言选择列表不翻译（见 ignore）。logo 按用户规定作“图标”（与应用设置页一致）。
 */
export default {
  static: {
    // 新建上架项草稿
    'Create a draft GitHub Marketplace listing from one of your tools': '用你的某个工具创建 GitHub 市场上架项草稿',
    'Create a new GitHub Marketplace draft listing': '新建 GitHub 市场上架项草稿',
    'Create draft listing': '创建上架项草稿',
    'A human-friendly name for your listing.': '便于识别的上架项名称。',
    'Save and add more details': '保存并添加更多详细信息',
    // 「Your tool must <a>meet the requirements</a> for GitHub Marketplace in order to be approved.」
    'Your tool must': '你的工具必须',
    'meet the requirements': '满足要求',
    'for GitHub Marketplace in order to be approved.': '才能在 GitHub 市场获得批准。',
    'Could not create a Marketplace listing: Name is unavailable. The listing name cannot be the same as an existing GitHub account unless it is your own user or organization name.':
      '无法创建市场上架项：名称不可用。上架项名称不能与你本人或你的组织以外的现有 GitHub 帐户同名。',
    "Could not create a Marketplace listing: Slug can't be blank": '无法创建市场上架项：短名称不能为空',
    'Could not create a Marketplace listing: Slug can’t be blank': '无法创建市场上架项：短名称不能为空',
    'A draft of your Marketplace listing has been saved. You can customize your listing further.':
      '已保存市场上架项草稿。你可以进一步自定义上架项。',

    // 编辑页：侧栏与概览
    'Marketplace dashboard menu': '市场仪表板菜单',
    'Listing settings': '上架项设置',
    'Preview listing': '预览上架项',
    'Contact info': '联系信息',
    'Listing description': '上架项描述',
    'Security and compliance': '安全与合规',
    'Publish your app to Marketplace': '将应用发布到市场',
    'To publish your app to GitHub Marketplace, complete the following items. Once completed, you can submit your listing to us for review. More information can be found in':
      '要将应用发布到 GitHub 市场，请完成以下各项。完成后即可提交上架项供我们审核。更多信息请参阅',
    'This listing has not been published to Marketplace.': '此上架项尚未发布到市场。',
    'This listing is a draft and has not yet been published on GitHub Marketplace.': '此上架项是尚未在 GitHub 市场发布的草稿。',
    'Add your contact info': '添加联系信息',
    'Fill out your listing description': '填写上架项描述',
    'Create plans': '创建计划',
    'Add security and compliance information': '添加安全与合规信息',
    'Set up webhook': '设置 Web 钩子',
    // 「Sign <details>GitHub Marketplace Developer Agreement</details>」
    'GitHub Marketplace Developer Agreement': 'GitHub 市场开发人员协议',
    'Accept the Marketplace Developer Agreement prior to submitting your listing': '提交上架项前须接受市场开发人员协议',
    'Please check to make sure that you are agreeing to these terms on behalf of the correct account.':
      '请确认你是代表正确的帐户同意这些条款。',
    "After submission, your listing will be reviewed by GitHub for publishing. We'll notify you via email with updates. Any existing subscriptions will be removed.":
      '提交后，GitHub 将审核你的上架项以决定是否发布。我们会通过电子邮件通知你进展。所有现有订阅都将被移除。',
    'After submission, your listing will be reviewed by GitHub for publishing. We’ll notify you via email with updates. Any existing subscriptions will be removed.':
      '提交后，GitHub 将审核你的上架项以决定是否发布。我们会通过电子邮件通知你进展。所有现有订阅都将被移除。',
    'Request publish': '申请发布',

    // 各步骤底部「Next: …」
    'Fill out your listing description.': '填写上架项描述。',
    'Add plans and pricing.': '添加计划和定价。',
    'Add a webhook.': '添加 Web 钩子。',
    'Submit for review!': '提交审核！',
    'Next Page: Fill out your listing description.': '下一页：填写上架项描述。',
    'Next Page: Add plans and pricing.': '下一页：添加计划和定价。',
    'Next Page: Security and compliance': '下一页：安全与合规',
    'Next Page: Add a webhook.': '下一页：添加 Web 钩子。',
    'Next Page: Submit for review!': '下一页：提交审核！',

    // 联系信息
    'Contact information': '联系信息',
    'We will use these contacts for official correspondence to your team about updates to GitHub Marketplace as it affects your listing.':
      '我们将通过这些联系人与你的团队正式沟通 GitHub 市场中影响你的上架项的更新。',
    'Note: We will not share this information with the public as it is used for our internal records. However, in the case of an enterprise customer introduction, we will use your marketing email.':
      '注意：我们不会公开这些仅供内部记录使用的信息。但在引荐企业客户时，我们会使用你的市场营销电子邮件。',
    'Technical lead email': '技术负责人电子邮件',
    'Marketing lead email': '市场营销负责人电子邮件',
    'Finance lead email': '财务负责人电子邮件',
    'Security lead email': '安全负责人电子邮件',
    'Save contact info': '保存联系信息',

    // 上架项描述：名称和链接
    'This information will be shown in the Marketplace when your listing is approved. More information can be found in':
      '这些信息将在上架项获批后显示在市场中。更多信息请参阅',
    'Naming and links': '名称和链接',
    'Listing name': '上架项名称',
    'A human-friendly name for your listing. Changing this name will change the URL for your listing.':
      '便于识别的上架项名称。更改名称会更改上架项的 URL。',
    'Very short description': '一句话描述',
    'Cannot end with punctuation': '不能以标点结尾',
    'This description will be shown under your listing’s name in search results, the home page and category pages.':
      '此描述将显示在搜索结果、首页和类别页中的上架项名称下方。',
    "This description will be shown under your listing's name in search results, the home page and category pages.":
      '此描述将显示在搜索结果、首页和类别页中的上架项名称下方。',
    'Primary category': '主要类别',
    'Secondary category': '次要类别',
    // 「Choose languages (<span>0</span>/10)」整句见 inline
    'Choose languages (': '选择语言（',
    'Filter languages': '筛选语言',
    'You can only select up to 10 languages.': '最多只能选择 10 种语言。',
    'Customer support URL': '客户支持 URL',
    ', required': '，必填',
    'Installation URL': '安装 URL',
    "The URL we'll redirect to after they install the app on GitHub. More information on this can be found in":
      '用户在 GitHub 上安装应用后重定向到的 URL。更多信息请参阅',
    'The URL we’ll redirect to after they install the app on GitHub. More information on this can be found in':
      '用户在 GitHub 上安装应用后重定向到的 URL。更多信息请参阅',
    'Company URL': '公司 URL',
    'Status URL': '状态 URL',
    'Documentation URL': '文档 URL',
    'Save naming and links': '保存名称和链接',

    // 图标和特色卡片
    'Logo and feature card': '图标和特色卡片',
    'Logo image file upload': '上传图标图片文件',
    'Background image': '背景图片',
    'Background image file upload': '上传背景图片文件',
    'Please upload an image smaller than 1 MB.': '请上传小于 1 MB 的图片。',
    'We only support PNG, GIF, and JPG images.': '仅支持 PNG、GIF 和 JPG 图片。',
    'Something went really wrong and we can’t process that image.': '因严重错误无法处理该图片。',
    "Something went really wrong and we can't process that image.": '因严重错误无法处理该图片。',
    'The hex value of the badge background color.': '徽章背景色的十六进制值。',
    'Text color': '文字颜色',
    'Light text': '浅色文字',
    'Dark text': '深色文字',
    'Save logo and feature card': '保存图标和特色卡片',
    'Changes may take a few moments to update across the entire site.': '更改可能需要一些时间才能在全站生效。',
    'Guidelines for your feature card:': '特色卡片指南：',
    'Background image measures 965px by 482px (width x height).': '背景图片尺寸为 965px × 482px（宽 × 高）。',
    'Text shows up clearly over the art.': '文字在图片上清晰可见。',
    'Background image contains a bit of texture.': '背景图片带有一些纹理。',
    'Feature card captures your brand personality.': '特色卡片体现品牌个性。',
    // 「For examples, see the <a>Marketplace homepage</a>.」
    'For examples, see the': '示例请参阅',
    'Marketplace homepage': '市场首页',

    // 上架项详细信息、截图
    'Listing details': '上架项详细信息',
    'Introductory description': '简介',
    'This is shown on your listing page at the top of your listing.': '显示在上架项页面顶部。',
    'Detailed description': '详细描述',
    'Displayed below the introduction. Clear and well-formatted submissions are more likely to be approved.':
      '显示在简介下方。清晰且格式良好的内容更容易获批。',
    'Must provide at least 400 and no more than 2,000 characters.': '须提供 400 到 2,000 个字符。',
    'Save listing details': '保存上架项详细信息',
    'Product screenshots': '产品截图',
    'Use a high resolution image, at least 1200px wide. Images should all be the same height and width (aspect ratio) to avoid page jumps when users navigate from one image to the next. At least one image is required.':
      '使用宽度至少 1200px 的高分辨率图片。所有图片应保持相同的宽高（纵横比）以免用户切换图片时页面跳动。至少需要一张图片。',
    'Screenshot file upload': '上传截图文件',
    'Please upload a picture smaller than 5 MB.': '请上传小于 5 MB 的图片。',

    // 计划和定价
    'New draft plan': '新建计划草稿',
    // 「Add and modify your pricing plans for <strong>上架项</strong>. More information can be found in <a>…</a>.」整句见 inline
    'Add and modify your pricing plans for': '添加和修改定价计划',
    '. More information can be found in': '。更多信息请参阅',
    'No pricing plans': '暂无定价计划',
    'You need at least one plan to publish your app to GitHub Marketplace': '至少需要一个计划才能将应用发布到 GitHub 市场',

    // 安全与合规
    // 「Some of this information … See <a>development documentation for more details.</a>」
    "Some of this information will be displayed on your marketplace listing once it's published. See":
      '部分信息将在上架项发布后显示在上架项页面上。请参阅',
    'Some of this information will be displayed on your marketplace listing once it’s published. See':
      '部分信息将在上架项发布后显示在上架项页面上。请参阅',
    'development documentation for more details.': '开发文档了解详情。',
    'EU Digital Services Act Compliance': '欧盟数字服务法合规',
    "Under the EU Digital Services Act, GitHub must collect and display information for paid app publishers classified as traders. If you don’t process payments on GitHub Marketplace, this doesn't apply. For traders, business ID, address, domain, and country will be publicly displayed on your listing. Learn more about":
      '根据欧盟《数字服务法》，GitHub 必须收集并显示被归类为经营者的付费应用发布者的信息。如果你不在 GitHub 市场处理付款，则不适用。经营者的企业 ID、地址、域名和国家/地区将公开显示在上架项中。了解',
    'DSA compliance': '数字服务法合规',
    'Trader Self-Certification *': '经营者自我认证 *',
    // 「Declare your status … European Commission (EC) <a>notice</a> on what constitutes a trader. …」整句见 inline
    'Declare your status under EU Digital Services Act. European Commission (EC)': '声明你在欧盟《数字服务法》下的身份。欧盟委员会 (EC)',
    'on what constitutes a trader. See Section 2.2. "Concept of Trader".': '说明了经营者的认定标准。见第 2.2 节“经营者的概念”。',
    'I do operate as a trader under EU regulations': '我在欧盟法规下以经营者身份运营',
    'I do not operate as a trader under EU regulations': '我在欧盟法规下不以经营者身份运营',
    'Business Address *': '企业地址 *',
    'Company address and country. Individual traders can use a P.O. Box.': '公司地址和国家/地区。个人经营者可以使用邮政信箱。',
    'Business ID *': '企业 ID *',
    'ID type': 'ID 类型',
    'DUNS Number': 'DUNS 编号',
    'VAT Number': '增值税号',
    'Other unique identifier (specify)': '其他唯一标识符（请注明）',
    'Business ID Type': '企业 ID 类型',
    'Unique ID Type': '唯一 ID 类型',
    'Attestation of EU Law Compliance *': '欧盟法律合规声明 *',
    'I agree to comply with applicable EU regulations in operating my app': '我同意在运营应用时遵守适用的欧盟法规',
    // 「… consult Article 30 and 31 of the EU <a>Digital Services Act</a>.」整句见 inline
    'This certification applies to products and services offered through your GitHub Marketplace listing. For guidance on DSA compliance, consult Article 30 and 31 of the EU':
      '此认证适用于通过你的 GitHub 市场上架项提供的产品和服务。有关《数字服务法》合规的指导，请参阅第 30 条和第 31 条所在的欧盟',
    'Digital Services Act': '数字服务法',
    'Privacy Policy URL *': '隐私政策 URL *',
    'Describe your app’s data practices.': '描述应用的数据处理做法。',
    "Describe your app's data practices.": '描述应用的数据处理做法。',
    'Terms of Service URL': '服务条款 URL',
    'Provide information on your app’s content moderation policies, intended uses and limitations.':
      '提供应用的内容审核政策、预期用途和限制等信息。',
    "Provide information on your app's content moderation policies, intended uses and limitations.":
      '提供应用的内容审核政策、预期用途和限制等信息。',
    'Third-party services required *': '所需的第三方服务 *',
    'List third-party dependencies that your app uses and shares data with, or “None” if there are no dependencies.':
      '列出应用使用并与之共享数据的第三方依赖项，没有则填“None”。',
    'Specify whether or not the source code for your listing is public (open-source) or private':
      '说明上架项的源代码是公开（开源）还是非公开',
    'Public repository URL': '公共存储库 URL',
    'Optional link to the public repository for your app’s codebase.': '应用代码所在公共存储库的可选链接。',
    "Optional link to the public repository for your app's codebase.": '应用代码所在公共存储库的可选链接。',
    'Transparency disclosures': '透明度披露',
    // 「Provide an overview … see the <a>GitHub Marketplace Developer Agreement</a> and Articles 6 and 8-17 of the <a>EU AI Act (PDF)</a>. Please specify …」
    'Provide an overview of your app’s security and safety mechanisms. Extensions classified as high-risk or those requiring elevated permissions must provide more detailed information on risk management, data governance, and compliance in order to be approved for publishing. For more info, see the':
      '概述应用的安全与防护机制。被归类为高风险或需要提升权限的扩展必须提供有关风险管理、数据治理和合规的更详细信息，才能获准发布。详情请参阅',
    'and Articles 6 and 8-17 of the': '以及',
    'EU AI Act (PDF)': '欧盟《人工智能法》(PDF)',
    '. Please specify all types of compliance offered and links to reports for verification.':
      '第 6 条和第 8-17 条。请注明提供的所有合规类型以及用于验证的报告链接。',
    // 「All listing information must comply with the <a>GitHub Marketplace Developer Agreement</a>.」
    'All listing information must comply with the': '所有上架信息都必须遵守',

    // Web 钩子（其余片段与存储库 Web 钩子共用 repo-settings 的 static）
    "request to the URL below with details of any Marketplace events. You can also specify which data format you'd like to receive (JSON,":
      '请求并附带所有市场事件的详细信息。你还可以指定想要接收的数据格式（JSON、',
    'request to the URL below with details of any Marketplace events. You can also specify which data format you’d like to receive (JSON,':
      '请求并附带所有市场事件的详细信息。你还可以指定想要接收的数据格式（JSON、',
    'Enter post-receive hook URL': '输入接收事件的 URL',
    'We require SSL and verify SSL certificates when delivering payloads.': '我们在传递有效负载时要求使用 SSL 并验证 SSL 证书。',
    'Create webhook': '创建 Web 钩子',

    // 交易
    'Past Day': '过去一天',
    'Past Week': '过去一周',
    'Past Month': '过去一个月',
    'Check back soon': '稍后再来查看',
    'If this listing was recently added to the GitHub Marketplace, check back soon. Data is synced daily.':
      '如果此上架项是最近才添加到 GitHub 市场的，请稍后再来查看。数据每天同步一次。',
    // 「Check the <a>Marketplace Documentation</a> for more information on this page.」
    'Check the': '请参阅',
    'Marketplace Documentation': '市场文档',
    'for more information on this page.': '了解此页面的更多信息。'
  },
  scoped: {
    // 侧栏、步骤名（短词）
    Transactions: '交易',
    Incomplete: '未完成',
    Webhook: 'Web 钩子',
    'Next:': '下一步：',
    // 「Sign <details>GitHub Marketplace Developer Agreement</details>」
    Sign: '签署',
    Logo: '图标',
    'Upload file': '上传文件',
    'Uploading...': '上传中...',
    'Uploading…': '上传中…',
    // 列表页的计划数「<strong>3</strong> plans available.」
    'plans available.': '个计划可用。',
    README: '自述文件',
    'OAuth App': 'OAuth 应用',
    notice: '通知',
    // Web 钩子表单（同 repo-settings/webhooks.ts）
    etc: '等',
    '). More information can be found in': '）。更多信息请参阅',
    'Content type': '内容类型',
    Secret: '机密',
    Active: '激活'
  },
  regexp: [
    // 标题：「Edit 上架项 - GitHub Marketplace」、页头「Edit 上架项」、「上架项 Transactions」
    [/^Edit (.+) - GitHub Marketplace$/, '编辑 $1 - GitHub 市场'],
    [/^Edit (.+)$/, '编辑 $1'],
    [/^(.+) Transactions$/, '$1 交易'],
    [/^Create draft listing for (.+)$/, '为 $1 创建上架项草稿'],
    // 字数限制与剩余（「Limit 255 characters.」「242 remaining.」）
    [/^Limit (\d[\d,]*) characters\.$/, '限 $1 个字符。'],
    [/^(\d[\d,]*) remaining\.$/, '还剩 $1 个字符。'],
    [/^Limit (\d[\d,]*) characters\. (\d[\d,]*) remaining\.$/, '限 $1 个字符。还剩 $2 个字符。'],
    // 步骤进度「1 of 5」
    [/^(\d) of (\d)$/, '$1 / $2'],
    // 开发人员协议
    [/^GitHub Marketplace Developer Agreement (v[\d.]+)$/, 'GitHub 市场开发人员协议 $1'],
    // 「<a>用户</a> signed the GitHub Marketplace Developer Agreement version v2.3 <relative-time>.」
    [/^signed the GitHub Marketplace Developer Agreement version (v[\d.]+)$/, '签署 GitHub 市场开发人员协议 $1 版于'],
    [/^This is a list of the financial transactions for (.+)\.$/, '$1 的财务交易列表。']
  ],
  inline: [
    ['Add and modify your pricing plans for {}. More information can be found in {}.', '为 {} 添加和修改定价计划。更多信息请参阅{}。'],
    ['Choose languages ({#}/10)', '选择语言（{#}/10）'],
    [
      'Declare your status under EU Digital Services Act. European Commission (EC) {} on what constitutes a trader. See Section 2.2. "Concept of Trader".',
      '声明你在欧盟《数字服务法》下的身份。经营者的认定见欧盟委员会 (EC) {}第 2.2 节“经营者的概念”。'
    ],
    [
      'This certification applies to products and services offered through your GitHub Marketplace listing. For guidance on DSA compliance, consult Article 30 and 31 of the EU {}.',
      '此认证适用于通过你的 GitHub 市场上架项提供的产品和服务。有关《数字服务法》合规的指导，请参阅欧盟{}第 30 条和第 31 条。'
    ]
  ],
  ignore: [
    // 语言选择列表：语言名
    '.js-languages-menu .select-menu-item-text',
    // 开发人员协议正文（法律文本）
    'details-dialog > .Box-body.markdown-body'
  ]
} satisfies PageDictionary
