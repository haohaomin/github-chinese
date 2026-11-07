import type { PageDictionary } from '../../core/types'

/**
 * GitHub 支援網站（help.github.com；support.github.com 跳转到这里）：首页、登录引导页、
 * 检举滥用页（/contact/report-abuse）、页头页脚、搜索、Copilot 聊天、404。
 *
 * - 文字来自站点的 React 组件（i18next 默认文案）；被链接拆开的句子用 inline 整句收录，链接文字另收。
 * - 页头导航、Cookie 横幅的按钮、Privacy Statement、Terms of Service、Create an account 等由 common 收录。
 * - 搜索框轮播的示例问题（逐字打出的 placeholder）、虚拟助手的流程不收。
 */
export default {
  scoped: {
    // 页头、页脚
    'Open user account menu': '開啟使用者帳號選單',
    'Your avatar image': '你的大頭貼',
    'Switch to your github.com account': '切換到你的 github.com 帳號',
    'Data residency': '資料落地',
    "Can't find what you're looking for?": '找不到需要的內容？',
    'Contact us': '聯絡我們',
    News: '新聞',

    // 首页
    'How can we help you?': '需要什麼協助？',
    'Choose one of the following options to get help with your request': '選擇以下其中一種方式取得協助',
    'Ask Copilot in GitHub Support': '在 GitHub 支援中詢問 Copilot',
    'Learn more about Copilot': '進一步瞭解 Copilot',
    'Create a ticket': '建立工單',
    'Get in touch with GitHub Support via a ticket': '透過工單聯絡 GitHub 支援',
    'Explore our official GitHub documentation.': '瀏覽 GitHub 官方文件。',
    'Ask questions, swap stories, share ideas.': '提問、交流經驗、分享想法。',
    'Get in touch with us for assistance.': '聯絡我們取得協助。',
    'Get in touch with our sales team.': '聯絡我們的業務團隊。',
    'Still need help?': '仍需要協助？',
    'No worries, we got you covered.': '別擔心，交給我們。',
    'Community Discussions & Product Feedback': '社群討論與產品意見回饋',
    // GitHub 状态横幅：<strong>GitHub status:</strong> All systems operational
    'GitHub status:': 'GitHub 狀態：',
    'All systems operational': '所有系統運作正常',
    'Undergoing maintenance': '正在維護',
    'Behavior and performance may be affected.': '功能和效能可能受到影響。',

    // 搜索
    'These resources might be helpful': '這些資源可能有幫助',
    'Are these results helpful?': '這些結果有幫助嗎？',
    'Your search did not match any results. Please change your filters or try again.': '沒有符合搜尋的結果。請變更篩選條件或再試一次。',
    'Your search did not match any results. Please try again.': '沒有符合搜尋的結果。請再試一次。',
    'Filter by': '篩選依據',
    'Recommended resources': '推薦資源',
    'No suggestions available.': '沒有建議。',
    'Suggested searches available': '有搜尋建議',
    'Suggested Searches': '搜尋建議',
    'Try adjusting your request subject for more options': '調整要求主旨以查看更多選項',

    // Copilot 聊天
    'Copilot in GitHub Support': 'GitHub 支援中的 Copilot',
    'Copilot chat assistant': 'Copilot 聊天助理',
    'Open immersive mode': '開啟沉浸模式',
    'Send now': '立即傳送',
    'Send positive feedback': '傳送正面意見回饋',
    'Send negative feedback': '傳送負面意見回饋',
    'Give positive feedback': '提供正面意見回饋',
    'Give negative feedback': '提供負面意見回饋',
    'Scroll to bottom': '捲動到底部',
    'Thank you! We received your feedback.': '謝謝！我們已收到你的意見回饋。',
    'Feedback not registered. Please try again.': '未記錄意見回饋。請再試一次。',
    'This helped me': '這對我有幫助',
    'Chat temporarily unavailable. Please refresh the page to try again.': '聊天暫時無法使用。請重新整理頁面再試一次。',
    'Chat messages': '聊天訊息',
    'Chat has started': '聊天已開始',
    'List of sources used to generate response': '產生回覆所用的來源清單',
    'More sources': '更多來源',
    'Copilot avatar': 'Copilot 大頭貼',

    // 登录引导页（/request/landing：未登录时打开检举页、新建工单会跳到这里）
    'Sign in to GitHub Help': '登入 GitHub 說明',
    'Get help with anything on GitHub. Create a ticket or check an existing one.': '取得 GitHub 相關的任何協助。建立工單或查看現有工單。',
    'Sign in with GitHub': '使用 GitHub 登入',
    'Sign in with GHE': '使用 GHE 登入',
    'Unable to sign in?': '無法登入？',
    'Get help': '取得協助',

    // 404
    "Didn't find anything here!": '這裡什麼都沒有！',
    'Return to Support': '返回支援首頁',

    // 检举滥用页
    'Report abuse or spam': '檢舉濫用或垃圾內容',
    'Report abuse form': '檢舉濫用表單',
    'Want to block a user?': '想要封鎖某位使用者？',
    'personal account': '個人帳號',
    'The content you are reporting will be included in your report:': '你檢舉的內容將包含在檢舉中：',
    'Please select a category for your issue:': '請選擇問題的類別：',
    'Select a category': '選擇類別',
    'Please provide the username, repository, or GitHub Pages URL you wish to report.':
      '請提供你要檢舉的使用者名稱、儲存庫或 GitHub Pages URL。',
    'Please provide a direct and working link to the content or behavior on GitHub you wish to report.':
      '請提供指向你要檢舉的 GitHub 內容或行為的直接有效連結。',
    'e.g. https://github.com/monalisa/octocat/blob/master/file.md': '例如 https://github.com/monalisa/octocat/blob/master/file.md',
    "I'd also like to report this content as illegal in a European member state under Article 16 of the DSA.":
      '我也要依據《數位服務法》（DSA）第 16 條，檢舉此內容在某個歐盟成員國屬於違法內容。',
    'I am a resident of the EU.': '我是歐盟居民。',
    'I have a bona fide belief that the information and allegations contained within this report are accurate and complete.':
      '我真誠相信本檢舉中的資訊和陳述正確且完整。',
    'Please provide a direct URL that identifies the exact GitHub content you wish to report.':
      '請提供能準確指向你要檢舉的 GitHub 內容的直接 URL。',
    'Add another URL': '新增其他 URL',
    'What would you like to report?': '你要檢舉什麼？',
    'Please provide a detailed explanation of the reasons why you believe the content you’re reporting is illegal, including the specific law you believe is being violated and in what jurisdiction, and any additional information you’d like to share.':
      '請詳細說明你認為所檢舉內容違法的理由，包括你認為被違反的具體法律、所在的司法管轄區，以及你想提供的其他資訊。',
    "Please provide as much detail as possible about the account or behavior you're reporting. It's especially helpful to include specific examples in the form of URLs or screenshots.":
      '請盡可能詳細描述你檢舉的帳號或行為。附上 URL 或螢幕擷取畫面形式的具體範例特別有幫助。',
    'Please select at least one category': '請至少選擇一個類別',
    'Please enter a valid username, repository, or GitHub Pages URL.': '請輸入有效的使用者名稱、儲存庫或 GitHub Pages URL。',
    'Please enter a valid GitHub content URL.': '請輸入有效的 GitHub 內容 URL。',
    'You must be a resident of the EU to submit a report regarding Illegal Content within the EU.':
      '只有歐盟居民才能檢舉歐盟境內的違法內容。',
    'Reporting Abuse or Spam': '檢舉濫用或垃圾內容',
    'Copyright - DMCA Takedown Policy': '著作權 - DMCA 下架政策',
    'Guide to Submitting a DMCA Takedown Notice': '提交 DMCA 下架通知指南',
    here: '這裡',
    'searching our support site': '搜尋我們的支援網站',
    'Private Information Removal Policy': '私人資訊移除政策',
    'Trademark policy': '商標政策',
    'support documentation': '支援文件',
    'GitHub Community Forum': 'GitHub 社群論壇',

    // 检举类别：名称、说明
    'Sexual Exploitation of Minors': '對未成年人的性剝削',
    'Sexually explicit or suggestive content including minors.': '涉及未成年人的色情或性暗示內容。',
    'NCII and Intimate Extortion': '未經同意的私密影像與性勒索',
    'Unauthorized posting of sexually intimate images without the consent of the individual depicted.':
      '未經當事人同意，擅自發布其私密性影像。',
    'Gratuitously Violent Content': '無端暴力內容',
    'Content that depicts or glorifies violence or physical harm against human beings or animals.':
      '描繪或美化對人或動物施加暴力、身體傷害的內容。',
    'Hate Speech or Discrimination': '仇恨言論或歧視',
    'Conduct or content that promotes hate toward an individual or group of people on the basis of who they are.':
      '基於身分煽動對個人或群體仇恨的行為或內容。',
    'Suicide and Self-injury': '自殺與自傷',
    'Someone is either encouraging someone else or has indicated that they intend to harm themselves.':
      '有人在鼓勵他人傷害自己，或表示自己打算自傷。',
    'Terrorist or Violent Extremist Content': '恐怖主義或暴力極端主義內容',
    'Content that indicates affiliation with or that promotes, glorifies or recruits for known terrorist or violent extremist organizations.':
      '顯示與已知恐怖主義或暴力極端主義組織有關聯，或為其宣傳、美化、招募的內容。',
    'Threats of Violence': '暴力威脅',
    'Organizing, promoting, encouraging or threatening acts of violence.': '組織、宣揚、鼓勵暴力行為或以暴力相威脅。',
    'Sexual Content': '色情內容',
    'Material that is sexually explicit, pornographic, or suggestive, or otherwise contains adult-oriented content.':
      '露骨的色情、猥褻或性暗示素材，或其他成人取向的內容。',
    'Spam or inauthentic Activity': '垃圾內容或虛假活動',
    'Inauthentic use of the service such as rank abuse, star abuse, the use of bots, fake accounts or other deceptive uses of the service.':
      '以不實方式使用服務，例如灌排名、灌星號、使用機器人、假帳號或其他欺騙性使用。',
    'Disruptive Content': '擾亂性內容',
    'Off-topic comments, using platform features to cause disruption.': '離題留言，利用平台功能製造干擾。',
    'Active Malware or Exploits': '活躍的惡意軟體或漏洞利用',
    'Actively running malicious software or the active exploitation of vulnerabilities for the purpose of compromising security or causing harm.':
      '為破壞安全或造成損害而執行惡意軟體或利用漏洞。',
    Phishing: '網路釣魚',
    'Using GitHub or its features to impersonate a legitimate entity for the purposes of stealing sensitive information.':
      '利用 GitHub 或其功能冒充合法實體，以竊取敏感資訊。',
    'Bullying or Harassment': '霸凌或騷擾',
    'Targeted personal attacks, abuse, piling on, harassment, or intimidation.': '針對性的人身攻擊、辱罵、圍攻、騷擾或恐嚇。',
    'Doxxing or Invasion of privacy': '肉搜或侵犯隱私',
    'Posting others’ personal information.': '公開他人的個人資訊。',
    'Misinformation or Disinformation': '錯誤資訊或假訊息',
    'Inaccurate, false, or deceptive information related to public health, safety, or civic engagement.':
      '與公共衛生、安全或公民參與有關的不正確、虛假或誤導性資訊。',
    'Underage User': '未成年使用者',
    'Report a user under age 13.': '檢舉未滿 13 歲的使用者。',
    Impersonation: '冒充他人',
    'Misrepresenting your identity or association with another person or organization.': '虛報身分，或謊稱與他人或組織有關聯。',
    'Synthetic Media - Non Consensual Intimate Imagery': '合成媒體 - 未經同意的私密影像',
    'Unauthorized posting of computer generated sexually intimate images without the consent of the individual depicted.':
      '未經當事人同意，擅自發布電腦產生的其私密性影像。',
    'Copyright Infringement': '著作權侵權',
    'Someone is infringing my copyrighted work.': '有人侵犯了我享有著作權的作品。',
    'Trademark Infringement': '商標侵權',
    'A user is infringing a trademark that I own.': '有使用者侵犯了我擁有的商標。',
    'Private Information Removal': '私人資訊移除',
    'A user has posted high-risk confidential content that poses a security risk.': '有使用者發布了帶來安全風險的高風險機密內容。',
    'Data Protection and Privacy Violations': '資料保護與隱私侵害',
    "Questions regarding GitHub's Privacy Statement or information practices.": '有關 GitHub 隱私權聲明或資訊處理做法的問題。',
    "I don't see my problem here": '這裡沒有我的問題',
    'None of the above.': '以上皆非。'
  },
  inline: [
    // 检举页说明：<a>Terms of Service</a>（common 译为“服務條款”）
    [
      "Code collaboration should be safe for everyone, so we take abuse and harassment seriously at GitHub. We want to hear about harmful behavior on the site that violates GitHub's {}. Let us know about a user or content you're concerned with. Rest assured, we'll keep your identifying information private.",
      '程式碼協作應該對每個人都是安全的，因此 GitHub 嚴肅看待濫用和騷擾行為。如果站上有違反 GitHub {}的有害行為，請告訴我們。向我們回報你擔心的使用者或內容。請放心，我們會對你的身分資訊保密。'
    ],
    // <a1>personal account</a1>、<a2>organization</a2>
    [
      "You can hide a user's content and notifications. Read more about blocking a user from your {} or {}.",
      '你可以隱藏某位使用者的內容和通知。進一步瞭解如何從你的{}或{}封鎖使用者。'
    ],
    // <i>检举对象</i>
    ['You are submitting a report regarding {}.', '你正在提交關於 {} 的檢舉。'],
    [
      'So that we can accurately identify the user or content you wish to report please return to {} and follow the instructions in the {} article.',
      '為了準確識別你要檢舉的使用者或內容，請返回 {}，依照「{}」一文中的說明操作。'
    ],
    // 选择类别后的提示
    [
      'If you believe that content on GitHub infringes a valid copyright you own, please see our {} and our {}.',
      '如果你認為 GitHub 上的內容侵犯了你擁有的有效著作權，請參閱我們的{}和{}。'
    ],
    [
      "Questions regarding GitHub's Privacy Statement or information practices? Please contact us {}.",
      '對 GitHub 隱私權聲明或資訊處理做法有疑問？請在{}聯絡我們。'
    ],
    ['Find additional answers and resources by {}.', '{}，尋找更多解答和資源。'],
    [
      'If you believe private data, such as access credentials, AWS tokens, or passwords that should have been kept confidential, and whose public availability poses a specific or targeted security risk to you or your organization has been shared without your permission on GitHub, please visit our {}.',
      '如果你認為本應保密、公開後會對你或你的組織造成具體或針對性安全風險的私人資料（例如存取憑證、AWS 權杖或密碼）未經你的許可在 GitHub 上被分享，請前往我們的{}。'
    ],
    [
      'If you believe a user is violating a trademark that you own, please visit our {}.',
      '如果你認為有使用者侵犯了你擁有的商標，請前往我們的{}。'
    ],
    // 首页：<link>Learn more about Copilot …</link>
    ['Get instant answers for your query. {}', '立即取得問題解答。{}'],
    // Copilot 的提示：<a>GitHub Privacy Statement</a>
    [
      'AI can make mistakes. For information on how we collect and use your data, see the {}.',
      'AI 可能會出錯。有關我們如何蒐集和使用你的資料，請參閱{}。'
    ],
    [
      'AI generated this answer, it may not be perfect. For information on how we use your data see the {}.',
      '此回答由 AI 產生，可能不完美。有關我們如何使用你的資料，請參閱{}。'
    ],
    ['You can find answers to frequently asked questions in our {} or the {}.', '你可以在我們的{}或{}中找到常見問題的解答。'],
    // Cookie 横幅：<a>Privacy Statement</a>
    [
      'GitHub websites rely on cookies for storing data on your device, enabling functions like preferences, sign-ins, and website performance analysis. Details can be found in our {}. These preferences are retained for a period of 180 days.',
      'GitHub 網站使用 Cookie 在你的裝置上儲存資料，以提供偏好設定、登入和網站效能分析等功能。詳情請參閱我們的{}。這些偏好設定會保留 180 天。'
    ]
  ],
  regexp: [
    // 状态横幅：Behavior and performance may be affected. Last updated <时间>
    [/^Behavior and performance may be affected\. Last updated (.+)$/, '功能和效能可能受到影響。最後更新於 $1']
  ]
} satisfies PageDictionary
