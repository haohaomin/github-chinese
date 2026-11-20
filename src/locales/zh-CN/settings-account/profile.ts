import type { PageDictionary } from '../../../core/types'

/**
 * 公开个人资料（/settings/profile）：个人资料表单、个人资料图片、ORCID iD、贡献与活动、个人资料设置、
 * 开发人员计划、求职个人资料、趋势设置、保存提示。
 * 与个人主页「编辑个人资料」表单、组织个人资料共用的单词标签（Bio、Location 等）放 scoped，译法与之一致；
 * 「@mention」「other users and organizations to link to them.」「Company」「You can manage verified email
 * addresses in your」与「Visitors will now see …」保存提示由其他词典收录。
 */
export default {
  static: {
    // 个人资料表单
    'Your name may appear around GitHub where you contribute or are mentioned. You can remove it at any time.':
      '你的名称可能会出现在 GitHub 上你参与贡献或被提及的地方。你可以随时删除它。',
    'Public email': '公开电子邮件',
    'Select a verified email to display': '选择要显示的已验证电子邮件',
    'You can add or remove verified email addresses in your': '添加或删除已验证的电子邮件地址请前往',
    'personal email settings': '个人电子邮件设置',
    'You have set your email address to private. To toggle email privacy, go to': '你已将电子邮件地址设为私密。如需更改，请转到',
    // 结尾引号在句号之后：标点随原文，结尾不加句号
    'and uncheck "Keep my email address private."': '并取消勾选“对我的电子邮件地址保密”',
    'and uncheck “Keep my email address private.”': '并取消勾选“对我的电子邮件地址保密”',
    'Tell us a little bit about yourself': '简单介绍一下自己',
    'your company’s GitHub organization to link it.': '你公司的 GitHub 组织以链接到其主页。',
    "your company's GitHub organization to link it.": '你公司的 GitHub 组织以链接到其主页。',
    'You can @mention your company’s GitHub organization to link it.': '你可以 @提及 你公司的 GitHub 组织以链接到其主页。',
    "You can @mention your company's GitHub organization to link it.": '你可以 @提及 你公司的 GitHub 组织以链接到其主页。',
    'Link to social profile': '社交帐户链接',
    'Other users will see the time difference from their local time.': '其他用户将看到与其本地时间的时差。',
    "All of the fields on this page are optional and can be deleted at any time, and by filling them out, you're giving us consent to share this data wherever your user profile appears. Please see our":
      '此页面上的所有字段均为可选且可随时删除，填写这些字段即表示你同意我们在你的个人资料出现的任何地方共享这些数据。请参阅我们的',
    'All of the fields on this page are optional and can be deleted at any time, and by filling them out, you’re giving us consent to share this data wherever your user profile appears. Please see our':
      '此页面上的所有字段均为可选且可随时删除，填写这些字段即表示你同意我们在你的个人资料出现的任何地方共享这些数据。请参阅我们的',
    'privacy statement': '隐私声明',
    'to learn more about how we use this information.': '以了解我们如何使用这些信息。',
    'Update profile': '更新个人资料',
    'Profile updated successfully': '个人资料已更新',
    // 「Profile updated successfully — <a>view your profile.</a>」：破折号连接两个分句，译作「——」，
    // 引擎不保留其后的原文空白
    'Profile updated successfully —': '个人资料已更新——',
    'view your profile.': '查看个人资料。',

    // 个人资料图片（avatar 仍作“头像”）
    'Profile picture': '个人资料图片',
    'Profile Picture': '个人资料图片',
    'Upload a photo…': '上传照片…',
    'Upload a photo...': '上传照片...',
    'Remove photo': '删除照片',
    'Revert to Gravatar': '恢复为 Gravatar 头像',
    'Are you sure you want to reset your current avatar?': '确定要重置当前头像吗？',
    // 句号随原文
    'Your profile picture has been reset. It may take a few minutes to update across the site.':
      '你的个人资料图片已重置。全站更新可能需要几分钟。',
    'Your profile picture has been updated. It may take a few minutes to update across the site.':
      '你的个人资料图片已更新。全站更新可能需要几分钟。',
    'Crop your new profile picture': '裁剪新的个人资料图片',
    'This profile picture has been deleted.': '此个人资料图片已删除。',
    'Set new profile picture': '设置新的个人资料图片',
    // 个人资料图片上传失败提示（原文无逗号，译文不加）
    'We only support PNG, GIF, or JPG pictures.': '仅支持 PNG、GIF 或 JPG 图片。',
    'Please upload a picture smaller than 1 MB.': '请上传小于 1 MB 的图片。',
    'Please upload a picture with smaller dimensions.': '请上传尺寸更小的图片。',
    'Something went really wrong and we can’t process that picture.': '出现严重错误导致无法处理该图片。',
    "Something went really wrong and we can't process that picture.": '出现严重错误导致无法处理该图片。',

    // ORCID iD
    'ORCID provides a persistent identifier - an ORCID iD - that distinguishes you from other researchers. Learn more at':
      'ORCID 提供一个持久标识符——ORCID iD——用于将你与其他研究人员区分开来。详见',
    // connect → 连接（官方正文：连接 ORCID iD）
    'Connect your ORCID iD': '连接 ORCID iD',
    'Successfully connected your GitHub account with ORCID.': '已将你的 GitHub 帐户与 ORCID 连接。',
    'You have a connected ORCID iD': '你已连接 ORCID iD',
    'for the account': '对应帐户',
    'Display your ORCID iD on your GitHub profile': '在 GitHub 个人资料上显示 ORCID iD',
    'Disconnecting your ORCID iD may affect areas of your profile where your ORCID iD is displayed.':
      '断开 ORCID iD 连接可能会影响个人资料中显示 ORCID iD 的区域。',
    'Disconnect your ORCID iD': '断开 ORCID iD 连接',
    'Successfully disconnected ORCID from your GitHub Account.': '已断开 ORCID 与你的 GitHub 帐户的连接。',

    // 贡献与活动
    'Contributions & activity': '贡献与活动',
    'Contributions & Activity': '贡献与活动',
    'Make profile private and hide activity': '将个人资料设为私密并隐藏活动',
    'Enabling this will hide your contributions and activity from your GitHub profile and from social features like followers, stars, feeds, leaderboards and releases.':
      '启用后你的贡献和活动将从 GitHub 个人资料以及关注者、星标、动态、排行榜和发行版等社交功能中隐藏。',
    'Include private contributions on my profile': '在个人资料中包含私密贡献',
    'Your contribution graph, achievements, and activity overview will show your private contributions without revealing any repository or organization information.':
      '你的贡献图、成就和活动概述将显示私密贡献，但不会透露任何存储库或组织信息。',
    'Update preferences': '更新首选项',

    // 个人资料设置（PRO 徽章指 Pro 方案，与个人主页徽章的“专业版”一致）
    'Profile settings': '个人资料设置',
    'Display PRO badge': '显示专业版徽章',
    'This will display the': '这将在你的公开个人资料页上显示',
    'badge on your public profile page.': '徽章。',
    'Show Achievements on my profile': '在个人资料中显示成就',
    'Your achievements will be shown on your profile.': '你的成就将显示在个人资料中。',

    // 开发人员计划（组织设置页的同名词条为 scoped）
    'GitHub Developer Program': 'GitHub 开发人员计划',
    'Building an application, service, or tool that integrates with GitHub?': '正在构建与 GitHub 集成的应用、服务或工具？',
    // 「Building …? [Join the GitHub Developer Program], or read more about it at our [Developer site].」
    'Join the GitHub Developer Program': '加入 GitHub 开发人员计划',
    ', or read more about it at our': '，详情请访问我们的',
    'GitHub developer program': 'GitHub 开发人员计划',
    'Developer site': '开发人员网站',
    'Check out the Developer site': '查看开发人员网站',
    'has guides, API and webhook references, information about creating GitHub Apps and other resources for building applications that integrate with GitHub. Make sure your contact information is up-to-date below. Thanks for being a member!':
      '提供指南、API 和 Web 钩子参考、GitHub 应用创建说明以及构建与 GitHub 集成的应用所需的其他资源。请确保下方联系信息是最新的。感谢你的加入！',
    'Support email address': '支持电子邮件地址',
    'An email address where GitHub users can contact you for support.': 'GitHub 用户可通过此电子邮件地址联系你获取支持。',
    'Product or company website': '产品或公司网站',
    'The URL for the product, company, or service that integrates with GitHub.': '与 GitHub 集成的产品、公司或服务的 URL。',
    'Update contact information': '更新联系信息',
    'Leave the program': '退出计划',

    // 求职个人资料（profile → 个人资料）
    'Jobs profile': '求职个人资料',
    'Available for hire': '接受工作机会',
    'Save jobs profile': '保存求职个人资料',

    // 趋势设置：句子被链接拆成 “… lists on” + “our” + “Trending Repositories” + “page.”
    // → “此语言首选项将用于筛选我们的趋势存储库页面。”
    'Trending settings': '趋势设置',
    'Preferred spoken language': '首选语言',
    'No Preference': '无首选项',
    'No preference': '无首选项',
    "We'll use this language preference to filter the trending repository lists on": '此语言首选项将用于筛选',
    'We’ll use this language preference to filter the trending repository lists on': '此语言首选项将用于筛选',
    'Trending Repositories': '趋势存储库',
    'Save Trending settings': '保存趋势设置'
  },
  scoped: {
    // 与个人主页编辑个人资料表单、组织个人资料同名的字段
    Bio: '个人简介',
    Pronouns: '代词',
    "Don't specify": '不指定',
    'Don’t specify': '不指定',
    // 代词下拉选项：只在设置页翻译，个人主页侧栏显示的所选代词不受影响
    'they/them': 'TA',
    'she/her': '她',
    'he/him': '他',
    Custom: '自定义',
    'Social accounts': '社交帐户',
    // 社交帐户输入框的无障碍名称
    'Social account': '社交帐户',
    Location: '所在地',
    'Display current local time': '显示当前本地时间',
    'Time zone': '时区',
    'You can': '你可以',
    'email settings': '电子邮件设置',
    // 贡献设置说明后「Read more」链接（可见文字由 common-ui 收录）的无障碍名称
    'Read more about viewing contributions on your profile': '了解如何在个人资料中查看贡献',
    our: '我们的'
    // 「page.」与帐户页共用，由 account.ts 收录
  },
  regexp: [
    // 社交帐户输入框的无障碍名称
    [/^Link to social profile (\d)$/, '社交帐户链接 $1']
  ]
} satisfies PageDictionary
