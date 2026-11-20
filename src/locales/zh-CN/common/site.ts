import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, RELATIVE_SOURCE, translateTime } from '../helpers'

/** Copilot 预算横幅：预算名称 */
const BUDGET_LABEL: Readonly<Record<string, string>> = {
  'Copilot budget': 'Copilot 预算',
  'AI credits': 'AI 额度',
  'Copilot AI credits': 'Copilot AI 额度'
}

/** Copilot 预算横幅：用尽描述中的预算名称（“全部 …”） */
const BUDGET_EXHAUSTED: Readonly<Record<string, string>> = {
  'your full Copilot budget': '全部 Copilot 预算',
  'all your AI credits': '全部 AI 额度',
  'all your Copilot AI credits': '全部 Copilot AI 额度',
  'its full Copilot budget': '全部 Copilot 预算',
  'all its AI credits': '全部 AI 额度',
  'all its Copilot AI credits': '全部 Copilot AI 额度'
}

/** Copilot 预算横幅：审批人 */
const BUDGET_APPROVER: Readonly<Record<string, string>> = {
  'org admins': '组织管理员',
  'enterprise account owners': '企业帐户所有者',
  'an admin': '管理员',
  'an enterprise account owner': '企业帐户所有者'
}

const BUDGET_LABEL_SOURCE = '(Copilot budget|AI credits|Copilot AI credits)'
const APPROVERS_SOURCE = '(org admins|enterprise account owners)'
const APPROVER_SOURCE = '(an admin|an enterprise account owner)'
/** 个人预算用尽描述的开头（You've used …） */
const PERSONAL_EXHAUSTED_SOURCE = '(your full Copilot budget|all your AI credits|all your Copilot AI credits)'

/** Copilot 预算申请审批：申请的额度类型（附在无障碍名称末尾的括号内） */
const BUDGET_TARGET: Readonly<Record<string, string>> = {
  'Universal AI credits': '通用 AI 额度',
  'Copilot AI credits': 'Copilot AI 额度'
}
const BUDGET_TARGET_SOURCE = '(?: \\((Universal AI credits|Copilot AI credits)\\))?'

function budgetTarget(label: string): string {
  return label ? `（${BUDGET_TARGET[label] ?? label}）` : ''
}

/** “将于 <日期>恢复使用”：日期由 helpers 生成，前后按 joinCjk 规则拼接（数字开头补空格） */
function resumesOn(date: string): string {
  return joinCjk(joinCjk('将于', translateTime(date)), '恢复使用')
}

/** 会话提醒、全局横幅、Cookie 同意、单一登录横幅、错误页 */
export default {
  static: {
    // 会话提醒横幅：句子被链接拆成 “… window.” + “Reload” + “to refresh your session.”
    'You signed in with another tab or window.': '你已在其他标签页或窗口中登录。',
    'You signed out in another tab or window.': '你已在其他标签页或窗口中退出登录。',
    'You switched accounts on another tab or window.': '你已在其他标签页或窗口中切换了帐户。',
    Reload: '重新加载',
    'to refresh your session.': '以刷新会话。',
    'Dismiss alert': '关闭提醒',
    'Dismiss error': '关闭错误提示',
    'Dismiss this message': '关闭此消息',
    'You can’t perform that action at this time.': '你目前无法执行该操作。',
    "You can't perform this action at this time.": '你目前无法执行此操作。',
    'Close dialog': '关闭对话框',
    'Your account has been flagged.': '你的帐户已被标记。',
    'Because of that, your profile is hidden from the public. If you believe this is a mistake, contact support to have your account status reviewed.':
      '因此，你的个人资料已对公众隐藏。如果你认为这是误判，请联系支持以复核帐户状态。',
    // 组织被标记横幅：链接 contact support 把句子拆成前后两段
    'Because of that, your organization is hidden from the public. If you believe this is a mistake,':
      '因此，你的组织已对公众隐藏。如果你认为这是误判，请',
    'to have your organization’s status reviewed.': '以复核组织状态。',
    'Important update': '重要更新',
    "Couldn't dismiss this announcement": '无法关闭此公告',
    'Your announcement is still available. Try again.': '公告仍会显示。请重试。',
    'Retry dismissal': '重试关闭',
    // 关闭失败时的屏幕阅读器播报（announce 写入 aria-live 区域）
    "Couldn't dismiss this announcement. Your announcement is still available. Try again.": '无法关闭此公告。公告仍会显示。请重试。',

    // 单一登录横幅：组织名在 <strong> 中，前后文字分别匹配
    'Single sign-on information': '单一登录信息',
    'Single sign-on to see results': '单一登录以查看结果',
    'Single sign-on to see results in the': '单一登录以查看',
    'Single sign-on to see results in': '单一登录以查看',
    'to see results in the': '以查看',
    organization: '组织',
    organizations: '组织',
    'organization.': '组织。',
    'organizations.': '组织。',
    'Single sign-on to see results in your organizations': '单一登录以查看你所在组织中的结果',
    'Select an organization': '选择组织',
    and: '和',
    ', and': '和',

    // 帐户安全提醒横幅。恢复手段：句子被链接 Download your recovery codes、add a passkey 拆开（前者与 or 已全站收录）
    "Don't get locked out of your account.": '避免无法访问帐户。',
    'add a passkey': '添加通行密钥',
    "so you don't lose access when you get a new device.": '以免换用新设备后无法访问帐户。',
    // 强制 2FA：GitHub users are <strong>now required</strong> + 后半句（含截止日期，见正则）
    'GitHub users are': 'GitHub 用户',
    'now required': '现在必须',
    'Enable 2FA': '启用 2FA',
    // 只有一个已验证电子邮件（按钮 Email settings 已全站收录）、恢复代码一年未保存、电子邮件未验证
    'You only have a single verified email address. We recommend verifying at least one more email address to ensure you can recover your account if you lose access to your primary email.':
      '你只有一个已验证电子邮件地址。我们建议至少再验证一个电子邮件地址，以确保在无法访问主要电子邮件地址时能恢复帐户。',
    'Your recovery codes have not been saved in the past year. Make sure you still have them stored somewhere safe by viewing and downloading them again.':
      '你在过去一年中未保存过恢复代码。请重新查看并下载恢复代码，确保它们仍存放在安全的地方。',
    'View recovery codes': '查看恢复代码',
    "Please verify your email address to access all of GitHub's features.": '请验证你的电子邮件地址以使用 GitHub 的全部功能。',
    'Configure email settings': '配置电子邮件设置',
    'Your email was verified.': '你的电子邮件已验证。',
    // 节假日换机提醒：前段 + 链接 redownloading your recovery codes + 结尾片段（“ - ”作破折号）
    "Don't get locked out - if you get a new phone this season, be sure to transfer your authenticator app data to the new phone. Enable cloud back up if your authenticator app supports it and consider":
      '避免无法访问帐户——如果你在这个假期换了新手机，请务必将身份验证器应用的数据转移到新手机。如果你的身份验证器应用支持云备份，请启用云备份，并考虑',
    'redownloading your recovery codes': '重新下载恢复代码',
    ', just to be safe.': '，以防万一。',

    // Android 应用安装横幅（GitHub Mobile → GitHub 移动版；for Android 作“适用于 Android 的”，
    // 不写“Android 版 GitHub 移动版”，同 settings-account 的 2FA 说明）
    'Install GitHub Mobile for Android': '安装适用于 Android 的 GitHub 移动版',
    'GitHub Mobile for Android': '适用于 Android 的 GitHub 移动版',
    'Download GitHub Mobile for Android': '下载适用于 Android 的 GitHub 移动版',

    // Copilot 应用推广横幅
    'Download for macOS': '下载 macOS 版',
    'Download for Windows': '下载 Windows 版',
    'Download for Linux': '下载 Linux 版',
    'Sending download link': '正在发送下载链接',
    'Download link sent': '下载链接已发送',
    'Download link sent.': '下载链接已发送。',
    'Something went wrong. Try again.': '出错了。请重试。',

    // 计费横幅（in-product-targeting）
    'Billing budget alert': '计费预算警报',
    'Manage budgets': '管理预算',
    'Copilot budget exhausted': 'Copilot 预算已用完',
    'AI credits exhausted': 'AI 额度已用完',
    'Copilot AI credits exhausted': 'Copilot AI 额度已用完',
    'Request more budget': '申请更多预算',
    'Request sent': '申请已发送',
    'Request sent.': '申请已发送。',
    'Remove request': '撤回申请',
    'Request removed.': '申请已撤回。',
    'You can re-request after this is reviewed.': '审查完成后可再次申请。',
    'Budget request declined': '预算申请被拒绝',
    'Contact an admin': '联系管理员',
    'Contact an enterprise account owner': '联系企业帐户所有者',
    'for more details.': '了解详细信息。',
    'Your organization': '你的组织',
    // Copilot 预算设置横幅：组织名在 <strong> 中，前后文字分别匹配
    'Copilot budget setup': 'Copilot 预算设置',
    'GitHub Copilot billing for': 'GitHub Copilot 对',
    'is now usage-based. Set a per-user budget to manage costs.': '现已改为基于使用情况的计费。设置每个用户的预算以控制成本。',
    'Set your budget': '设置预算',
    // Copilot 预算申请审批卡片
    'Member requests for additional Copilot budget': '成员的 Copilot 预算追加申请',
    'No pending budget requests': '没有待处理的预算申请',
    'When members request additional Copilot budget, their requests will appear here.': '成员申请追加 Copilot 预算后显示在这里。',
    'Select all requests': '全选申请',
    'Approve and increase': '批准并提高预算',
    'Select at least one request to approve.': '至少选择一个要批准的申请。',
    'Current budget:': '当前预算：',
    'New budget: $': '新预算：$',
    'Universal AI credits': '通用 AI 额度',
    'Copilot AI credits': 'Copilot AI 额度',

    // 产品公告横幅与弹窗（无障碍名称）
    'Close banner': '关闭横幅',
    'Close modal': '关闭对话框',
    'Toggle play': '播放/暂停',
    'Toggle tab': '切换标签页',
    'Announcement dismissed': '公告已关闭',
    // 增长推广横幅（如 Copilot 调查卡片）关闭按钮
    'Close GrowthBanner': '关闭横幅',

    // Cookie 同意横幅与首选项对话框
    'We use optional cookies to improve your experience on our websites and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services listed above will be used. You may change your selection on which cookies to accept by clicking "Manage Cookies" at the bottom of the page to change your selection. This selection is maintained for 180 days. Please review your selections regularly.':
      '我们使用可选 Cookie 来改善你在我们网站上的体验，并根据你的在线活动展示个性化广告。如果你拒绝可选 Cookie，将只使用提供上述服务所必需的 Cookie。你可以随时单击页面底部的“管理 Cookie”更改接受哪些 Cookie。此选择保留 180 天，请定期检查。',
    'How to manage cookie preferences': '如何管理 Cookie 首选项',
    'Third-Party Cookies': '第三方 Cookie',
    Accept: '接受',
    Reject: '拒绝',
    'Manage cookie preferences': '管理 Cookie 首选项',
    'Most GitHub websites use cookies. Cookies are small text files placed on your device to store data so web servers can use it later. GitHub and our third-party partners use cookies to remember your preferences and settings, help you sign in, show you personalized ads, and analyze how well our websites are working. For more info, see the Cookies and similar technologies section of the':
      '大多数 GitHub 网站都使用 Cookie。Cookie 是存放在你设备上的小型文本文件，用于存储数据，以便网络服务器稍后使用。GitHub 及我们的第三方合作伙伴使用 Cookie 来记住你的首选项和设置、帮助你登录、展示个性化广告，并分析网站的运行情况。详情请参阅包含 Cookie 及类似技术部分的',
    'GitHub uses required cookies to perform essential website functions and to provide the services. For example, cookies are used to log you in, save your language preferences, provide a shopping cart experience, improve performance, route traffic between web servers, detect the size of your screen, determine page load times, improve user experience, and for audience measurement. These cookies are necessary for our websites to work.':
      'GitHub 使用必需 Cookie 来执行网站的基本功能并提供服务。例如，Cookie 用于让你登录、保存语言首选项、提供购物车体验、提升性能、在网络服务器之间路由流量、检测屏幕尺寸、确定页面加载时间、改善用户体验以及进行受众统计。这些 Cookie 是网站正常运行所必需的。',
    Analytics: '分析',
    'We allow third parties to use analytics cookies to understand how you use our websites so we can make them better. For example, cookies are used to gather information about the pages you visit and how many clicks you need to accomplish a task. We also use some analytics cookies to provide personalized advertising.':
      '我们允许第三方使用分析 Cookie 来了解你如何使用我们的网站，以便改进网站。例如，Cookie 用于收集你访问的页面以及完成一项任务需要单击多少次等信息。我们也会使用部分分析 Cookie 来提供个性化广告。',
    'Social Media': '社交媒体',
    "GitHub and third parties use social media cookies to show you ads and content based on your social media profiles and activity on GitHub's websites. This ensures that the ads and content you see on our websites and on social media will better reflect your interests. This also enables third parties to develop and improve their products, which they may use on websites that are not owned or operated by GitHub.":
      'GitHub 及第三方使用社交媒体 Cookie，根据你的社交媒体个人资料和你在 GitHub 网站上的活动向你展示广告和内容。这可确保你在我们网站和社交媒体上看到的广告和内容更符合你的兴趣。这也使第三方能够开发和改进其产品，这些产品可能用于并非由 GitHub 拥有或运营的网站。',
    Advertising: '广告',
    "In addition, GitHub and third parties use advertising cookies to show you new ads based on ads you've already seen. Cookies also track which ads you click or purchases you make after clicking an ad. This is done to show you ads that are more relevant to you and for business purposes with our advertising partners. For example, cookies are used to detect when you click an ad and to show you ads based on your social media interests and website browsing history.":
      '此外，GitHub 及第三方使用广告 Cookie，根据你已看过的广告向你展示新广告。Cookie 还会跟踪你单击了哪些广告，或单击广告后进行了哪些购买。这样做是为了向你展示更相关的广告，并用于与广告合作伙伴开展业务。例如，Cookie 用于检测你何时单击广告，并根据你的社交媒体兴趣和网站浏览记录向你展示广告。',
    'Reset all': '全部重置',

    // 全站标签页标题「GitHub · Where software is built」的标语段（标题按 “ · ” 分段翻译）
    'Where software is built': '构建软件的地方',
    // 未登录首页标签页标题「GitHub · Build and ship software on a single, collaborative platform · GitHub」的标语段
    'Build and ship software on a single, collaborative platform': '在统一的协作平台上构建和交付软件',

    // 错误页标题（标签页标题按 “ · ” 分段翻译）
    'Page not found': '找不到页面',
    'Server Error': '服务器错误',
    'Unicorn!': '独角兽！',
    'Rate limit': '速率限制',
    '404 Error': '404 错误',
    '500 Error': '500 错误',
    // React 应用请求出错时设置的标签页标题（其余状态码为 “Error 503”，由正则处理）
    '404 Page not found': '404 找不到页面',
    '500 Internal server error': '500 服务器内部错误',
    // 404 / 500 页面
    'Find code, projects, and people on GitHub:': '在 GitHub 上查找代码、项目和人员：',
    'Contact Support': '联系支持',
    'Contact support': '联系支持',
    Error: '错误',
    'Didn’t find anything here!': '这里什么也没有！',
    'Looks like something went wrong!': '好像出了点问题！',
    'Looks like network is down!': '网络似乎断开了！',
    'Unable to load page.': '无法加载页面。',
    'Please reload page and try again': '请重新加载页面后重试',
    'We track these errors automatically, but if the problem persists feel free to contact us. In the meantime, try refreshing.':
      '我们会自动跟踪这些错误；如果问题仍然存在，请联系我们。在此期间，请尝试刷新。',
    // 独角兽页（服务暂不可用、超时）
    'No server is currently available to service your request.': '当前没有可用的服务器处理你的请求。',
    'This page is taking too long to load.': '此页面加载时间过长。',
    'We had issues producing the response to your request.': '生成请求响应时出现问题。',
    'Sorry about that. Please try refreshing and contact us if the problem persists.': '很抱歉。请尝试刷新；如果问题仍然存在，请联系我们。',
    // 片段加载超时（如付款模块）时显示的网关错误文字
    '504 Gateway Time-out': '504 网关超时',
    // 网络出错提示：Failed to fetch data, <a>click here to reload the page.</a>
    'Failed to fetch data,': '获取数据失败，',
    'click here to reload the page.': '单击此处重新加载页面。',
    // 422
    'The change you wanted was rejected.': '你想要的更改被拒绝了。',
    "Maybe you tried to change something you didn't have access to.": '你可能尝试更改了无权访问的内容。',
    'Maybe you tried to change something you didn’t have access to.': '你可能尝试更改了无权访问的内容。',
    // 429 静态页：段落以 <br> 分隔
    'Whoa there!': '慢一点！',
    'Access has been restricted': '访问已受限',
    'You have triggered a rate limit.': '你触发了速率限制。',
    'You have exceeded a secondary rate limit.': '你已超出辅助速率限制。',
    'You have triggered an abuse detection mechanism.': '你触发了滥用检测机制。',
    'Please wait a few minutes before you try again;': '请等待几分钟后再试；',
    'in some cases this may take up to an hour.': '某些情况下可能需要长达一小时。',
    // 访问受限页
    'Access to this site has been restricted.': '对本站的访问已受限。',
    'If you believe this is an error, please contact Support.': '如果你认为这有误，请联系支持。',
    'If you believe this is an error, please contact': '如果你认为这有误，请联系',
    // React 错误页（410 / 420 / 429 / 502 / 503 / 维护 / 离线）
    Offline: '离线',
    'Feature Gone': '功能已下线',
    'Sorry, but this feature has been retired. Check out the': '抱歉，此功能已停用。请查看',
    'GitHub Blog': 'GitHub 博客',
    'for more information.': '了解详细信息。',
    'Too many requests are being made from your IP address. Wait a minute or two and try again.':
      '你的 IP 地址发出的请求过多。请等待一两分钟后重试。',
    'Increase this rate limit by': '如需提高速率限制请',
    'signing in': '登录',
    'Bad gateway': '网关错误',
    'GitHub is taking too long to respond. Please try again in a few minutes.': 'GitHub 响应时间过长。请几分钟后重试。',
    'Service unavailable': '服务不可用',
    'GitHub is temporarily unavailable. Please try again in a few minutes.': 'GitHub 暂时不可用。请几分钟后重试。',
    'Maintenance in progress': '正在维护',
    'GitHub is currently undergoing scheduled maintenance. Please check GitHub Status for updates.':
      'GitHub 正在进行计划维护。请查看 GitHub 状态页了解最新进展。',
    'You are offline': '你已离线',
    'It looks like you are offline. Check your connection and try again.': '你似乎已离线。请检查网络连接后重试。',
    'Switching runtime': '正在切换运行环境',
    'GitHub is switching runtime environments. Please refresh this page in a few moments.': 'GitHub 正在切换运行环境。请稍后刷新此页面。',
    'Too many requests': '请求过多',
    'You have exceeded a secondary rate limit. Please wait a few minutes before you try again; in some cases this may take up to an hour.':
      '你已超出辅助速率限制。请等待几分钟后再试；某些情况下可能需要长达一小时。',
    'Signing in': '登录',
    'may provide a higher rate limit if you are not already signed in. For more on scraping GitHub and how it may affect your rights, please review our':
      '可获得更高的速率限制（如果你尚未登录）。有关抓取 GitHub 及其对你权利的影响，请查看我们的',
    'You have exceeded a secondary rate limit. Please wait a few minutes before you try again. For more on scraping GitHub and how it may affect your rights, please review our':
      '你已超出辅助速率限制。请等待几分钟后再试。有关抓取 GitHub 及其对你权利的影响，请查看我们的',
    'Terms of Service': '服务条款',
    // Spark 等页脚的链接（小写写法）
    'Terms of service': '服务条款',
    // <relative-time> 的 prefix 属性（如 Actions 运行列表的「Today at 9:04」）
    'Today at': '今天',
    'Yesterday at': '昨天',

    // 组织升级为企业未完成时的提示（/account/upgrade 跳回首页、组织计费页；链接 checkout page 拆开的整句见 inline）
    'You cannot change your plan because this organization is currently being upgraded to an Enterprise Account. Return to the checkout page to complete or cancel the upgrade.':
      '此组织正在升级为企业帐户，无法更改计划。请返回结账页面完成或取消升级。',
    'An organization upgrade to GitHub Enterprise has been initiated but not completed. Return to the checkout page to complete or cancel the upgrade.':
      '组织升级到 GitHub 企业版的操作已开始但尚未完成。请返回结账页面完成或取消升级。',
    'checkout page': '结账页面',
    // 表单提交失败的通用提示
    'Validation failed': '验证失败'
  },
  regexp: [
    // React 应用错误页标签页标题：Error 503
    [/^Error (\d{3})$/, '错误 $1'],
    // 单一登录横幅：其余组织数（React 拆分的数字与文字拼接后）
    [/^and (\d+) other organizations?\.$/, '以及其他 $1 个组织。'],
    [/^Single sign-on to see results in (\d+) other organizations?\.$/, '单一登录以查看其他 $1 个组织中的结果。'],
    [/^, and (\d+) more organizations?$/, '，以及其他 $1 个组织'],
    // 强制 2FA 横幅的后半句（前半句 GitHub users are <strong>now required</strong> 见 static）
    [
      new RegExp(
        `^to enable two-factor authentication as an additional security measure\\. Your activity on GitHub includes you in this requirement\\. You will need to enable two-factor authentication on your account before (${DATE_SOURCE}), or be restricted from account actions\\.$`
      ),
      (_, date: string) =>
        joinCjk(
          joinCjk('启用双因素身份验证作为额外的安全措施。你在 GitHub 上的活动使你也在此要求范围内。你需要在', translateTime(date)),
          '之前为帐户启用双因素身份验证，否则帐户操作将受到限制。'
        )
    ],
    // Copilot 预算横幅（组织、企业预算用尽）：Your organization <strong>名称</strong> has used …。
    // <strong> 前的 Your organization / Your enterprise 由 static 翻译，其后的文字整段匹配。个人预算用尽的句子见 inline
    [
      /^has used (its full Copilot budget|all its AI credits|all its Copilot AI credits)\. Access resumes on (.+?)\. Contact your admins to increase it\.$/,
      (_, budget, date) => `已用完${BUDGET_EXHAUSTED[budget] ?? budget}。${resumesOn(date)}。请联系你的管理员提高额度。`
    ],
    // 申请发送成功后的屏幕阅读器播报
    [
      new RegExp(`^Request sent\\. Your ${APPROVERS_SOURCE} will be notified\\.$`),
      (_, approvers) => `申请已发送。你的${BUDGET_APPROVER[approvers] ?? approvers}将收到通知。`
    ],
    [
      new RegExp(`^Your ${APPROVERS_SOURCE} will be notified that you need additional ${BUDGET_LABEL_SOURCE}\\.$`),
      (_, approvers, label) => `你的${BUDGET_APPROVER[approvers] ?? approvers}将收到你需要更多 ${BUDGET_LABEL[label] ?? label}的通知。`
    ],
    [
      new RegExp(`^Your request for additional ${BUDGET_LABEL_SOURCE} was declined by ${APPROVER_SOURCE}( on|\\.)$`),
      (_, label, approver, tail) =>
        `你申请更多 ${BUDGET_LABEL[label] ?? label}的请求已被${BUDGET_APPROVER[approver] ?? approver}拒绝${tail === '.' ? '。' : '于'}`
    ],
    // Copilot 预算申请审批卡片：申请时间（React 拆分的时长与文字拼接后）、每行控件的无障碍名称
    [new RegExp(`^Requested (${RELATIVE_SOURCE})$`), (_, time) => joinCjk(translateTime(time), '申请')],
    [
      new RegExp(`^(Approve|Deny) request from ([\\w-]+)${BUDGET_TARGET_SOURCE}$`),
      (_, verb, login, label) => `${verb === 'Approve' ? '批准' : '拒绝'} ${login} 的申请${budgetTarget(label)}`
    ],
    [
      new RegExp(`^New budget in dollars for ([\\w-]+)${BUDGET_TARGET_SOURCE}$`),
      (_, login, label) => `${login} 的新预算美元金额${budgetTarget(label)}`
    ],
    // 组织升级为企业未完成（企业标识照录）
    [
      /^Your upgrade for ([\w.-]+) is incomplete\. Please complete the purchase to upgrade your account\.$/,
      '你对 $1 的升级尚未完成。请完成购买以升级帐户。'
    ]
  ],
  inline: [
    // 组织升级为企业未完成：「… Return to the <a>checkout page</a> to complete or cancel the upgrade.」；企业标识在元素里时
    [
      /^(You cannot change your plan because this organization is currently being upgraded to an Enterprise Account|An organization upgrade to GitHub Enterprise has been initiated but not completed)\. Return to the \{\} to complete or cancel the upgrade\.$/,
      (_, lead: string) =>
        `${lead.startsWith('You') ? '此组织正在升级为企业帐户，无法更改计划' : '组织升级到 GitHub 企业版的操作已开始但尚未完成'}。请返回{}完成或取消升级。`
    ],
    [
      /^Your upgrade for \{\} is incomplete\. Please complete the purchase to upgrade your account\.$/,
      '你对 {} 的升级尚未完成。请完成购买以升级帐户。'
    ],
    // 取消市场应用计划后的提示：You've cancelled your subscription to <计划> for <应用>. This plan change will take effect on <日期>
    // （计划名、应用名照录）
    [
      /^You[’']ve cancelled your subscription to (.+?) for (.+?)\. This plan change will take effect on \{\}\.?$/,
      '你已取消 $2 的 $1 计划订阅。此计划变更将于{}生效。'
    ],
    // Copilot 预算横幅（个人预算用尽）：<span>You've used … from <strong>来源</strong>. Access resumes on <日期>.
    // Your org admins can increase it sooner.</span>。来源（组织或企业名）移到句中，整句收录
    [
      new RegExp(
        `^You've used ${PERSONAL_EXHAUSTED_SOURCE} from \\{\\}\\. Access resumes on (.+?)\\. Your ${APPROVERS_SOURCE} can increase it sooner\\.$`
      ),
      (_, budget, date, approvers) =>
        `你已用完来自 {} 的${BUDGET_EXHAUSTED[budget] ?? budget}。${resumesOn(date)}。你的${BUDGET_APPROVER[approvers] ?? approvers}可以提前提高额度。`
    ]
  ]
} satisfies PageDictionary
