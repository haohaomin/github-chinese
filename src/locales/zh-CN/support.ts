import type { PageDictionary } from '../../core/types'

/**
 * GitHub 支持站点（help.github.com；support.github.com 跳转到这里）：首页、登录引导页、
 * 举报滥用行为页（/contact/report-abuse）、页头页脚、搜索、Copilot 聊天、404。
 *
 * - 文字来自站点的 React 组件（i18next 默认文案）；被链接拆开的句子用 inline 整句收录，链接文字另收。
 * - 页头导航、Cookie 横幅的按钮、Privacy Statement、Terms of Service、Create an account 等由 common 收录。
 * - 搜索框轮播的示例问题（逐字打出的 placeholder）、虚拟助手的流程不收。
 */
export default {
  scoped: {
    // 页头、页脚
    'Open user account menu': '打开用户帐户菜单',
    'Your avatar image': '你的头像',
    'Switch to your github.com account': '切换到你的 github.com 帐户',
    'Data residency': '数据驻留',
    "Can't find what you're looking for?": '找不到所需内容？',
    'Contact us': '联系我们',
    News: '新闻',

    // 首页
    'How can we help you?': '有什么可以帮你？',
    'Choose one of the following options to get help with your request': '选择以下方式之一获取帮助',
    'Ask Copilot in GitHub Support': '在 GitHub 支持中询问 Copilot',
    'Learn more about Copilot': '详细了解 Copilot',
    'Create a ticket': '创建工单',
    'Get in touch with GitHub Support via a ticket': '通过工单联系 GitHub 支持',
    'Explore our official GitHub documentation.': '浏览 GitHub 官方文档。',
    'Ask questions, swap stories, share ideas.': '提问、交流经验、分享想法。',
    'Get in touch with us for assistance.': '联系我们获取帮助。',
    'Get in touch with our sales team.': '联系我们的销售团队。',
    'Still need help?': '仍需帮助？',
    'No worries, we got you covered.': '别担心，我们来帮你。',
    'Community Discussions & Product Feedback': '社区讨论和产品反馈',
    // GitHub 状态横幅：<strong>GitHub status:</strong> All systems operational
    'GitHub status:': 'GitHub 状态：',
    'All systems operational': '所有系统运行正常',
    'Undergoing maintenance': '正在维护',
    'Behavior and performance may be affected.': '功能和性能可能受到影响。',

    // 搜索
    'These resources might be helpful': '这些资源可能有帮助',
    'Are these results helpful?': '这些结果有帮助吗？',
    'Your search did not match any results. Please change your filters or try again.': '没有与搜索匹配的结果。请更改筛选条件或重试。',
    'Your search did not match any results. Please try again.': '没有与搜索匹配的结果。请重试。',
    'Filter by': '筛选依据',
    'Recommended resources': '推荐资源',
    'No suggestions available.': '暂无建议。',
    'Suggested searches available': '有搜索建议',
    'Suggested Searches': '搜索建议',
    'Try adjusting your request subject for more options': '调整请求主题以查看更多选项',

    // Copilot 聊天
    'Copilot in GitHub Support': 'GitHub 支持中的 Copilot',
    'Copilot chat assistant': 'Copilot 聊天助手',
    'Open immersive mode': '打开沉浸模式',
    'Send now': '立即发送',
    'Send positive feedback': '发送正面反馈',
    'Send negative feedback': '发送负面反馈',
    'Give positive feedback': '给出正面反馈',
    'Give negative feedback': '给出负面反馈',
    'Scroll to bottom': '滚动到底部',
    'Thank you! We received your feedback.': '谢谢！我们已收到你的反馈。',
    'Feedback not registered. Please try again.': '反馈未记录。请重试。',
    'This helped me': '这对我有帮助',
    'Chat temporarily unavailable. Please refresh the page to try again.': '聊天暂时不可用。请刷新页面后重试。',
    'Chat messages': '聊天消息',
    'Chat has started': '聊天已开始',
    'List of sources used to generate response': '生成回复所用的来源列表',
    'More sources': '更多来源',
    'Copilot avatar': 'Copilot 头像',

    // 登录引导页（/request/landing：未登录时打开举报页、新建工单会跳到这里）
    'Sign in to GitHub Help': '登录 GitHub 帮助',
    'Get help with anything on GitHub. Create a ticket or check an existing one.': '获取 GitHub 相关的任何帮助。创建工单或查看已有工单。',
    'Sign in with GitHub': '使用 GitHub 登录',
    'Sign in with GHE': '使用 GHE 登录',
    'Unable to sign in?': '无法登录？',
    'Get help': '获取帮助',

    // 404
    "Didn't find anything here!": '这里什么也没有！',
    'Return to Support': '返回支持首页',

    // 举报滥用行为页
    'Report abuse or spam': '举报滥用行为或垃圾信息',
    'Report abuse form': '举报滥用行为表单',
    'Want to block a user?': '想要阻止某个用户？',
    'personal account': '个人帐户',
    'The content you are reporting will be included in your report:': '你举报的内容将包含在举报中：',
    'Please select a category for your issue:': '请选择问题的类别：',
    'Select a category': '选择类别',
    'Please provide the username, repository, or GitHub Pages URL you wish to report.':
      '请提供你要举报的用户名、存储库或 GitHub Pages URL。',
    'Please provide a direct and working link to the content or behavior on GitHub you wish to report.':
      '请提供指向你要举报的 GitHub 内容或行为的直接有效链接。',
    'e.g. https://github.com/monalisa/octocat/blob/master/file.md': '例如 https://github.com/monalisa/octocat/blob/master/file.md',
    "I'd also like to report this content as illegal in a European member state under Article 16 of the DSA.":
      '我还要根据《数字服务法》（DSA）第 16 条，举报此内容在某个欧盟成员国属于违法内容。',
    'I am a resident of the EU.': '我是欧盟居民。',
    'I have a bona fide belief that the information and allegations contained within this report are accurate and complete.':
      '我真诚地相信，本举报中的信息和陈述准确且完整。',
    'Please provide a direct URL that identifies the exact GitHub content you wish to report.':
      '请提供能准确指向你要举报的 GitHub 内容的直接 URL。',
    'Add another URL': '添加其他 URL',
    'What would you like to report?': '你要举报什么？',
    'Please provide a detailed explanation of the reasons why you believe the content you’re reporting is illegal, including the specific law you believe is being violated and in what jurisdiction, and any additional information you’d like to share.':
      '请详细说明你认为所举报内容违法的理由，包括你认为被违反的具体法律、所在的司法管辖区，以及你想提供的其他信息。',
    "Please provide as much detail as possible about the account or behavior you're reporting. It's especially helpful to include specific examples in the form of URLs or screenshots.":
      '请尽可能详细地描述你举报的帐户或行为。附上 URL 或屏幕截图形式的具体示例尤其有帮助。',
    'Please select at least one category': '请至少选择一个类别',
    'Please enter a valid username, repository, or GitHub Pages URL.': '请输入有效的用户名、存储库或 GitHub Pages URL。',
    'Please enter a valid GitHub content URL.': '请输入有效的 GitHub 内容 URL。',
    'You must be a resident of the EU to submit a report regarding Illegal Content within the EU.':
      '只有欧盟居民才能举报欧盟境内的违法内容。',
    'Reporting Abuse or Spam': '举报滥用行为或垃圾信息',
    'Copyright - DMCA Takedown Policy': '版权 - DMCA 下架政策',
    'Guide to Submitting a DMCA Takedown Notice': '提交 DMCA 下架通知指南',
    here: '此处',
    'searching our support site': '搜索我们的支持站点',
    'Private Information Removal Policy': '私人信息删除政策',
    'Trademark policy': '商标政策',
    'support documentation': '支持文档',
    'GitHub Community Forum': 'GitHub 社区论坛',

    // 举报类别：名称、说明
    'Sexual Exploitation of Minors': '对未成年人的性剥削',
    'Sexually explicit or suggestive content including minors.': '涉及未成年人的色情或性暗示内容。',
    'NCII and Intimate Extortion': '未经同意的私密图像与性勒索',
    'Unauthorized posting of sexually intimate images without the consent of the individual depicted.':
      '未经当事人同意，擅自发布其私密性图像。',
    'Gratuitously Violent Content': '无端暴力内容',
    'Content that depicts or glorifies violence or physical harm against human beings or animals.':
      '描绘或美化针对人或动物的暴力、身体伤害的内容。',
    'Hate Speech or Discrimination': '仇恨言论或歧视',
    'Conduct or content that promotes hate toward an individual or group of people on the basis of who they are.':
      '基于身份煽动对个人或群体仇恨的行为或内容。',
    'Suicide and Self-injury': '自杀和自残',
    'Someone is either encouraging someone else or has indicated that they intend to harm themselves.':
      '有人在鼓励他人伤害自己，或表示自己打算自残。',
    'Terrorist or Violent Extremist Content': '恐怖主义或暴力极端主义内容',
    'Content that indicates affiliation with or that promotes, glorifies or recruits for known terrorist or violent extremist organizations.':
      '表明与已知恐怖主义或暴力极端主义组织有关联，或为其宣传、美化、招募的内容。',
    'Threats of Violence': '暴力威胁',
    'Organizing, promoting, encouraging or threatening acts of violence.': '组织、宣扬、鼓励暴力行为或以暴力相威胁。',
    'Sexual Content': '色情内容',
    'Material that is sexually explicit, pornographic, or suggestive, or otherwise contains adult-oriented content.':
      '露骨的色情、淫秽或性暗示材料，或其他面向成人的内容。',
    'Spam or inauthentic Activity': '垃圾信息或虚假活动',
    'Inauthentic use of the service such as rank abuse, star abuse, the use of bots, fake accounts or other deceptive uses of the service.':
      '虚假使用服务，如刷排名、刷星标、使用机器人、虚假帐户或其他欺骗性使用。',
    'Disruptive Content': '扰乱性内容',
    'Off-topic comments, using platform features to cause disruption.': '离题评论，利用平台功能制造干扰。',
    'Active Malware or Exploits': '活跃的恶意软件或漏洞利用',
    'Actively running malicious software or the active exploitation of vulnerabilities for the purpose of compromising security or causing harm.':
      '为破坏安全或造成损害而运行恶意软件或利用漏洞。',
    Phishing: '网络钓鱼',
    'Using GitHub or its features to impersonate a legitimate entity for the purposes of stealing sensitive information.':
      '利用 GitHub 或其功能冒充合法实体，以窃取敏感信息。',
    'Bullying or Harassment': '欺凌或骚扰',
    'Targeted personal attacks, abuse, piling on, harassment, or intimidation.': '有针对性的人身攻击、辱骂、围攻、骚扰或恐吓。',
    'Doxxing or Invasion of privacy': '人肉搜索或侵犯隐私',
    'Posting others’ personal information.': '发布他人的个人信息。',
    'Misinformation or Disinformation': '错误信息或虚假信息',
    'Inaccurate, false, or deceptive information related to public health, safety, or civic engagement.':
      '与公共卫生、安全或公民参与有关的不准确、虚假或误导性信息。',
    'Underage User': '未成年用户',
    'Report a user under age 13.': '举报未满 13 岁的用户。',
    Impersonation: '冒充他人',
    'Misrepresenting your identity or association with another person or organization.': '虚假陈述身份，或虚称与他人或组织有关联。',
    'Synthetic Media - Non Consensual Intimate Imagery': '合成媒体 - 未经同意的私密图像',
    'Unauthorized posting of computer generated sexually intimate images without the consent of the individual depicted.':
      '未经当事人同意，擅自发布计算机生成的其私密性图像。',
    'Copyright Infringement': '版权侵权',
    'Someone is infringing my copyrighted work.': '有人侵犯了我享有版权的作品。',
    'Trademark Infringement': '商标侵权',
    'A user is infringing a trademark that I own.': '有用户侵犯了我拥有的商标。',
    'Private Information Removal': '私人信息删除',
    'A user has posted high-risk confidential content that poses a security risk.': '有用户发布了带来安全风险的高风险机密内容。',
    'Data Protection and Privacy Violations': '数据保护和隐私侵犯',
    "Questions regarding GitHub's Privacy Statement or information practices.": '有关 GitHub 隐私声明或信息处理做法的问题。',
    "I don't see my problem here": '这里没有我的问题',
    'None of the above.': '以上都不是。'
  },
  inline: [
    // 举报页说明：<a>Terms of Service</a>（common 译为“服务条款”）
    [
      "Code collaboration should be safe for everyone, so we take abuse and harassment seriously at GitHub. We want to hear about harmful behavior on the site that violates GitHub's {}. Let us know about a user or content you're concerned with. Rest assured, we'll keep your identifying information private.",
      '代码协作应当对每个人都是安全的，因此 GitHub 严肃对待滥用和骚扰行为。如果站内有违反 GitHub {}的有害行为，请告诉我们。向我们报告你担心的用户或内容。请放心，我们会对你的身份信息保密。'
    ],
    // <a1>personal account</a1>、<a2>organization</a2>
    [
      "You can hide a user's content and notifications. Read more about blocking a user from your {} or {}.",
      '你可以隐藏某个用户的内容和通知。详细了解如何从你的{}或{}阻止用户。'
    ],
    // <i>举报对象</i>
    ['You are submitting a report regarding {}.', '你正在提交关于 {} 的举报。'],
    [
      'So that we can accurately identify the user or content you wish to report please return to {} and follow the instructions in the {} article.',
      '为了准确识别你要举报的用户或内容，请返回 {}，按照“{}”一文中的说明操作。'
    ],
    // 选择类别后的提示
    [
      'If you believe that content on GitHub infringes a valid copyright you own, please see our {} and our {}.',
      '如果你认为 GitHub 上的内容侵犯了你拥有的有效版权，请参阅我们的{}和{}。'
    ],
    [
      "Questions regarding GitHub's Privacy Statement or information practices? Please contact us {}.",
      '对 GitHub 隐私声明或信息处理做法有疑问？请在{}联系我们。'
    ],
    ['Find additional answers and resources by {}.', '{}，查找更多答案和资源。'],
    [
      'If you believe private data, such as access credentials, AWS tokens, or passwords that should have been kept confidential, and whose public availability poses a specific or targeted security risk to you or your organization has been shared without your permission on GitHub, please visit our {}.',
      '如果你认为本应保密、公开后会对你或你的组织造成具体或针对性安全风险的私人数据（如访问凭据、AWS 令牌或密码）未经你的许可在 GitHub 上被共享，请访问我们的{}。'
    ],
    [
      'If you believe a user is violating a trademark that you own, please visit our {}.',
      '如果你认为有用户侵犯了你拥有的商标，请访问我们的{}。'
    ],
    // 首页：<link>Learn more about Copilot …</link>
    ['Get instant answers for your query. {}', '即时获取问题解答。{}'],
    // Copilot 的提示：<a>GitHub Privacy Statement</a>
    [
      'AI can make mistakes. For information on how we collect and use your data, see the {}.',
      'AI 可能会出错。有关我们如何收集和使用你的数据，请参阅{}。'
    ],
    [
      'AI generated this answer, it may not be perfect. For information on how we use your data see the {}.',
      '此回答由 AI 生成，可能不完美。有关我们如何使用你的数据，请参阅{}。'
    ],
    ['You can find answers to frequently asked questions in our {} or the {}.', '你可以在我们的{}或{}中找到常见问题的解答。'],
    // Cookie 横幅：<a>Privacy Statement</a>
    [
      'GitHub websites rely on cookies for storing data on your device, enabling functions like preferences, sign-ins, and website performance analysis. Details can be found in our {}. These preferences are retained for a period of 180 days.',
      'GitHub 网站依靠 Cookie 在你的设备上存储数据，以实现首选项、登录和网站性能分析等功能。详情请参阅我们的{}。这些首选项将保留 180 天。'
    ]
  ],
  regexp: [
    // 状态横幅：Behavior and performance may be affected. Last updated <时间>
    [/^Behavior and performance may be affected\. Last updated (.+)$/, '功能和性能可能受到影响。最后更新于 $1']
  ]
} satisfies PageDictionary
