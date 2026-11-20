import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, RELATIVE_SOURCE, translateTime } from '../helpers'

/** Copilot 预算横幅：预算名称 */
const BUDGET_LABEL: Readonly<Record<string, string>> = {
  'Copilot budget': 'Copilot 預算',
  'AI credits': 'AI 點數',
  'Copilot AI credits': 'Copilot AI 點數'
}

/** Copilot 预算横幅：用尽描述中的预算名称（「全部 …」） */
const BUDGET_EXHAUSTED: Readonly<Record<string, string>> = {
  'your full Copilot budget': '全部 Copilot 預算',
  'all your AI credits': '全部 AI 點數',
  'all your Copilot AI credits': '全部 Copilot AI 點數',
  'its full Copilot budget': '全部 Copilot 預算',
  'all its AI credits': '全部 AI 點數',
  'all its Copilot AI credits': '全部 Copilot AI 點數'
}

/** Copilot 预算横幅：审批人 */
const BUDGET_APPROVER: Readonly<Record<string, string>> = {
  'org admins': '組織管理員',
  'enterprise account owners': '企業帳號擁有者',
  'an admin': '管理員',
  'an enterprise account owner': '企業帳號擁有者'
}

const BUDGET_LABEL_SOURCE = '(Copilot budget|AI credits|Copilot AI credits)'
const APPROVERS_SOURCE = '(org admins|enterprise account owners)'
const APPROVER_SOURCE = '(an admin|an enterprise account owner)'
/** 个人预算用尽描述的开头（You've used …） */
const PERSONAL_EXHAUSTED_SOURCE = '(your full Copilot budget|all your AI credits|all your Copilot AI credits)'

/** Copilot 预算申请审批：申请的额度类型（附在无障碍名称末尾的括号内） */
const BUDGET_TARGET: Readonly<Record<string, string>> = {
  'Universal AI credits': '通用 AI 點數',
  'Copilot AI credits': 'Copilot AI 點數'
}
const BUDGET_TARGET_SOURCE = '(?: \\((Universal AI credits|Copilot AI credits)\\))?'

function budgetTarget(label: string): string {
  return label ? `（${BUDGET_TARGET[label] ?? label}）` : ''
}

/** 「將於 <日期>恢復使用」：日期由 helpers 生成，前后按 joinCjk 规则拼接（数字开头补空格） */
function resumesOn(date: string): string {
  return joinCjk(joinCjk('將於', translateTime(date)), '恢復使用')
}

/** 会话提醒、全局横幅、Cookie 同意、单一登录横幅、错误页 */
export default {
  static: {
    // 会话提醒横幅：句子被链接拆成 “… window.” + “Reload” + “to refresh your session.”
    'You signed in with another tab or window.': '你已在其他分頁或視窗登入。',
    'You signed out in another tab or window.': '你已在其他分頁或視窗登出。',
    'You switched accounts on another tab or window.': '你已在其他分頁或視窗切換帳號。',
    Reload: '重新載入',
    'to refresh your session.': '以更新工作階段。',
    'Dismiss alert': '關閉提示',
    'Dismiss error': '關閉錯誤訊息',
    'Dismiss this message': '關閉此訊息',
    'You can’t perform that action at this time.': '你目前無法執行此動作。',
    "You can't perform this action at this time.": '你目前無法執行此動作。',
    'Close dialog': '關閉對話方塊',
    'Your account has been flagged.': '你的帳號已遭標記。',
    'Because of that, your profile is hidden from the public. If you believe this is a mistake, contact support to have your account status reviewed.':
      '因此，你的個人檔案已對外隱藏。如果你認為這是誤判，請聯絡支援團隊審查帳號狀態。',
    // 组织被标记横幅：链接 contact support 把句子拆成前后两段
    'Because of that, your organization is hidden from the public. If you believe this is a mistake,':
      '因此，你的組織已對外隱藏。如果你認為這是誤判，請',
    'to have your organization’s status reviewed.': '審查組織狀態。',
    'Important update': '重要更新',
    "Couldn't dismiss this announcement": '無法關閉此公告',
    'Your announcement is still available. Try again.': '公告仍會顯示。請再試一次。',
    'Retry dismissal': '重試關閉',
    // 关闭失败时的屏幕阅读器播报（announce 写入 aria-live 区域）
    "Couldn't dismiss this announcement. Your announcement is still available. Try again.": '無法關閉此公告。公告仍會顯示。請再試一次。',

    // 单一登录横幅：组织名在 <strong> 中，前后文字分别匹配
    'Single sign-on information': '單一登入資訊',
    'Single sign-on to see results': '使用單一登入查看結果',
    'Single sign-on to see results in the': '使用單一登入查看',
    'Single sign-on to see results in': '使用單一登入查看',
    'to see results in the': '以查看',
    organization: '組織',
    organizations: '組織',
    'organization.': '組織。',
    'organizations.': '組織。',
    'Single sign-on to see results in your organizations': '使用單一登入查看你所屬組織的結果',
    'Select an organization': '選擇組織',
    and: '和',
    ', and': '和',

    // 帐户安全提醒横幅。恢复手段：句子被链接 Download your recovery codes、add a passkey 拆开（前者与 or 已全站收录）
    "Don't get locked out of your account.": '避免無法存取帳號。',
    'add a passkey': '新增密碼金鑰',
    "so you don't lose access when you get a new device.": '以免換用新裝置後無法存取帳號。',
    // 强制 2FA：GitHub users are <strong>now required</strong> + 后半句（含截止日期，见正则）
    'GitHub users are': 'GitHub 使用者',
    'now required': '現在必須',
    'Enable 2FA': '啟用 2FA',
    // 只有一个已验证电子邮件（按钮 Email settings 已全站收录）、恢复代码一年未保存、电子邮件未验证
    'You only have a single verified email address. We recommend verifying at least one more email address to ensure you can recover your account if you lose access to your primary email.':
      '你只有一個已驗證的電子郵件地址。我們建議至少再驗證一個電子郵件地址，以確保無法存取主要電子郵件時仍能復原帳號。',
    'Your recovery codes have not been saved in the past year. Make sure you still have them stored somewhere safe by viewing and downloading them again.':
      '你在過去一年內未曾儲存復原碼。請重新查看並下載復原碼，確保仍將其存放在安全的地方。',
    'View recovery codes': '查看復原碼',
    "Please verify your email address to access all of GitHub's features.": '請驗證你的電子郵件地址以使用 GitHub 的所有功能。',
    'Configure email settings': '調整電子郵件設定',
    'Your email was verified.': '你的電子郵件已驗證。',
    // 节假日换机提醒：前段 + 链接 redownloading your recovery codes + 结尾片段（“ - ”作破折号）
    "Don't get locked out - if you get a new phone this season, be sure to transfer your authenticator app data to the new phone. Enable cloud back up if your authenticator app supports it and consider":
      '避免無法存取帳號——如果你在這個假期換了新手機，請務必將驗證器應用程式的資料轉移到新手機。如果你的驗證器應用程式支援雲端備份，請啟用雲端備份，並考慮',
    'redownloading your recovery codes': '重新下載復原碼',
    ', just to be safe.': '，以防萬一。',

    // Android 应用安装横幅（GitHub Mobile → GitHub 行動版；for Android 作「適用於 Android 的」，
    // 不写「Android 版 GitHub 行動版」，同 settings-account 的 2FA 说明）
    'Install GitHub Mobile for Android': '安裝適用於 Android 的 GitHub 行動版',
    'GitHub Mobile for Android': '適用於 Android 的 GitHub 行動版',
    'Download GitHub Mobile for Android': '下載適用於 Android 的 GitHub 行動版',

    // Copilot 应用推广横幅
    'Download for macOS': '下載 macOS 版',
    'Download for Windows': '下載 Windows 版',
    'Download for Linux': '下載 Linux 版',
    'Sending download link': '正在傳送下載連結',
    'Download link sent': '已傳送下載連結',
    'Download link sent.': '已傳送下載連結。',
    'Something went wrong. Try again.': '發生錯誤。請再試一次。',

    // 计费横幅（in-product-targeting）
    'Billing budget alert': '帳務預算警示',
    'Manage budgets': '管理預算',
    'Copilot budget exhausted': 'Copilot 預算已用完',
    'AI credits exhausted': 'AI 點數已用完',
    'Copilot AI credits exhausted': 'Copilot AI 點數已用完',
    'Request more budget': '請求更多預算',
    'Request sent': '請求已送出',
    'Request sent.': '請求已送出。',
    'Remove request': '移除請求',
    'Request removed.': '請求已移除。',
    'You can re-request after this is reviewed.': '審查完成後可重新請求。',
    'Budget request declined': '預算請求遭拒',
    'Contact an admin': '聯絡管理員',
    'Contact an enterprise account owner': '聯絡企業帳號擁有者',
    'for more details.': '以瞭解詳情。',
    'Your organization': '你的組織',
    // Copilot 预算设置横幅：组织名在 <strong> 中，前后文字分别匹配
    'Copilot budget setup': 'Copilot 預算設定',
    'GitHub Copilot billing for': 'GitHub Copilot 在',
    'is now usage-based. Set a per-user budget to manage costs.': '現已改為依用量計費。設定每位使用者的預算以控管成本。',
    'Set your budget': '設定預算',
    // Copilot 预算申请审批卡片
    'Member requests for additional Copilot budget': '額外 Copilot 預算的成員請求',
    'No pending budget requests': '沒有待處理的預算請求',
    'When members request additional Copilot budget, their requests will appear here.': '成員提出的額外 Copilot 預算請求會顯示在這裡。',
    'Select all requests': '選取所有請求',
    'Approve and increase': '核准並提高預算',
    'Select at least one request to approve.': '至少選取一個要核准的請求。',
    'Current budget:': '目前預算：',
    'New budget: $': '新預算：$',
    'Universal AI credits': '通用 AI 點數',
    'Copilot AI credits': 'Copilot AI 點數',

    // 产品公告横幅与弹窗（无障碍名称）
    'Close banner': '關閉橫幅',
    'Close modal': '關閉對話方塊',
    'Toggle play': '播放/暫停',
    'Toggle tab': '切換分頁',
    'Announcement dismissed': '公告已關閉',
    // 增长推广横幅（如 Copilot 调查卡片）关闭按钮
    'Close GrowthBanner': '關閉橫幅',

    // Cookie 同意横幅与首选项对话框
    'We use optional cookies to improve your experience on our websites and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services listed above will be used. You may change your selection on which cookies to accept by clicking "Manage Cookies" at the bottom of the page to change your selection. This selection is maintained for 180 days. Please review your selections regularly.':
      '我們使用選用 Cookie 來改善你在我們網站上的體驗，並根據你的線上活動顯示個人化廣告。如果你拒絕選用 Cookie，則只會使用為你提供上述服務所需的 Cookie。你可以按一下頁面底部的「管理 Cookie」來變更要接受哪些 Cookie。此選擇會保留 180 天。請定期檢查你的選擇。',
    'How to manage cookie preferences': '如何管理 Cookie 偏好設定',
    'Third-Party Cookies': '第三方 Cookie',
    Accept: '接受',
    Reject: '拒絕',
    'Manage cookie preferences': '管理 Cookie 偏好設定',
    'Most GitHub websites use cookies. Cookies are small text files placed on your device to store data so web servers can use it later. GitHub and our third-party partners use cookies to remember your preferences and settings, help you sign in, show you personalized ads, and analyze how well our websites are working. For more info, see the Cookies and similar technologies section of the':
      '大多數 GitHub 網站都使用 Cookie。Cookie 是放在你裝置上的小型文字檔案，用來儲存資料，供網頁伺服器日後使用。GitHub 和我們的第三方合作夥伴使用 Cookie 來記住你的偏好和設定、協助你登入、向你顯示個人化廣告，並分析我們網站的運作狀況。如需詳細資訊，請參閱包含 Cookie 和類似技術一節的',
    'GitHub uses required cookies to perform essential website functions and to provide the services. For example, cookies are used to log you in, save your language preferences, provide a shopping cart experience, improve performance, route traffic between web servers, detect the size of your screen, determine page load times, improve user experience, and for audience measurement. These cookies are necessary for our websites to work.':
      'GitHub 使用必要 Cookie 來執行網站的基本功能並提供服務。例如，Cookie 用於讓你登入、儲存你的語言偏好設定、提供購物車體驗、提升效能、在網頁伺服器之間路由流量、偵測螢幕大小、判斷頁面載入時間、改善使用者體驗，並評估受眾。這些 Cookie 是我們網站運作所必需的。',
    Analytics: '分析',
    'We allow third parties to use analytics cookies to understand how you use our websites so we can make them better. For example, cookies are used to gather information about the pages you visit and how many clicks you need to accomplish a task. We also use some analytics cookies to provide personalized advertising.':
      '我們允許第三方使用分析 Cookie 來瞭解你如何使用我們的網站，讓我們能加以改善。例如，Cookie 用於收集你造訪了哪些頁面、完成一項工作需要按幾下等資訊。我們也會使用部分分析 Cookie 來提供個人化廣告。',
    'Social Media': '社群媒體',
    "GitHub and third parties use social media cookies to show you ads and content based on your social media profiles and activity on GitHub's websites. This ensures that the ads and content you see on our websites and on social media will better reflect your interests. This also enables third parties to develop and improve their products, which they may use on websites that are not owned or operated by GitHub.":
      'GitHub 和第三方使用社群媒體 Cookie，根據你的社群媒體個人檔案和你在 GitHub 網站上的活動，向你顯示廣告和內容。這可確保你在我們網站和社群媒體上看到的廣告和內容更符合你的興趣。這也讓第三方能夠開發並改進自家產品，這些產品可能會用於並非由 GitHub 擁有或經營的網站。',
    Advertising: '廣告',
    "In addition, GitHub and third parties use advertising cookies to show you new ads based on ads you've already seen. Cookies also track which ads you click or purchases you make after clicking an ad. This is done to show you ads that are more relevant to you and for business purposes with our advertising partners. For example, cookies are used to detect when you click an ad and to show you ads based on your social media interests and website browsing history.":
      '此外，GitHub 和第三方使用廣告 Cookie，根據你已看過的廣告向你顯示新廣告。Cookie 也會追蹤你按了哪些廣告，或按一下廣告後購買了什麼。這是為了向你顯示與你更相關的廣告，也用於與我們廣告合作夥伴之間的商業用途。例如，Cookie 用於偵測你何時按一下廣告，並根據你的社群媒體興趣和網站瀏覽記錄向你顯示廣告。',
    'Reset all': '全部重設',

    // 全站标签页标题「GitHub · Where software is built」的标语段（标题按 “ · ” 分段翻译）
    'Where software is built': '打造軟體的地方',
    // 未登录首页标签页标题「GitHub · Build and ship software on a single, collaborative platform · GitHub」的标语段
    'Build and ship software on a single, collaborative platform': '在單一協作平台上打造並交付軟體',

    // 错误页标题（标签页标题按 “ · ” 分段翻译）
    'Page not found': '找不到頁面',
    'Server Error': '伺服器錯誤',
    'Unicorn!': '獨角獸！',
    'Rate limit': '速率限制',
    '404 Error': '404 錯誤',
    '500 Error': '500 錯誤',
    // React 应用请求出错时设置的标签页标题（其余状态码为 “Error 503”，由正则处理）
    '404 Page not found': '404 找不到頁面',
    '500 Internal server error': '500 內部伺服器錯誤',
    // 404 / 500 页面
    'Find code, projects, and people on GitHub:': '在 GitHub 上尋找程式碼、專案和人員：',
    'Contact Support': '聯絡支援團隊',
    'Contact support': '聯絡支援團隊',
    Error: '錯誤',
    'Didn’t find anything here!': '這裡什麼都沒有！',
    'Looks like something went wrong!': '似乎發生錯誤！',
    'Looks like network is down!': '網路似乎中斷了！',
    'Unable to load page.': '無法載入頁面。',
    'Please reload page and try again': '請重新載入頁面後再試一次',
    'We track these errors automatically, but if the problem persists feel free to contact us. In the meantime, try refreshing.':
      '我們會自動追蹤這些錯誤，但如果問題持續發生，歡迎與我們聯絡。在此期間，請試著重新整理。',
    // 独角兽页（服务暂不可用、超时）
    'No server is currently available to service your request.': '目前沒有可處理你請求的伺服器。',
    'This page is taking too long to load.': '此頁面載入時間過長。',
    'We had issues producing the response to your request.': '為你的請求產生回應時發生問題。',
    'Sorry about that. Please try refreshing and contact us if the problem persists.':
      '很抱歉。請試著重新整理，如果問題持續發生，請與我們聯絡。',
    // 片段加载超时（如付款模块）时显示的网关错误文字
    '504 Gateway Time-out': '504 閘道逾時',
    // 网络出错提示：Failed to fetch data, <a>click here to reload the page.</a>
    'Failed to fetch data,': '無法擷取資料，',
    'click here to reload the page.': '按一下這裡重新載入頁面。',
    // 422
    'The change you wanted was rejected.': '你想要的變更已遭拒絕。',
    "Maybe you tried to change something you didn't have access to.": '你可能嘗試變更了無權存取的內容。',
    'Maybe you tried to change something you didn’t have access to.': '你可能嘗試變更了無權存取的內容。',
    // 429 静态页：段落以 <br> 分隔
    'Whoa there!': '慢一點！',
    'Access has been restricted': '存取已受到限制',
    'You have triggered a rate limit.': '你觸發了速率限制。',
    'You have exceeded a secondary rate limit.': '你已超過次要速率限制。',
    'You have triggered an abuse detection mechanism.': '你觸發了濫用偵測機制。',
    'Please wait a few minutes before you try again;': '請等幾分鐘後再試；',
    'in some cases this may take up to an hour.': '某些情況下可能需要長達一小時。',
    // 访问受限页
    'Access to this site has been restricted.': '此網站的存取已受到限制。',
    'If you believe this is an error, please contact Support.': '如果你認為這是錯誤，請聯絡支援團隊。',
    'If you believe this is an error, please contact': '如果你認為這是錯誤，請聯絡',
    // React 错误页（410 / 420 / 429 / 502 / 503 / 维护 / 离线）
    Offline: '離線',
    'Feature Gone': '功能已移除',
    'Sorry, but this feature has been retired. Check out the': '抱歉，此功能已停止提供。請查看',
    'GitHub Blog': 'GitHub 部落格',
    'for more information.': '以瞭解詳情。',
    'Too many requests are being made from your IP address. Wait a minute or two and try again.':
      '你的 IP 位址發出的請求過多。請等一兩分鐘後再試一次。',
    'Increase this rate limit by': '若要提高此速率限制可以',
    'signing in': '登入',
    'Bad gateway': '閘道錯誤',
    'GitHub is taking too long to respond. Please try again in a few minutes.': 'GitHub 回應時間過長。請幾分鐘後再試一次。',
    'Service unavailable': '服務無法使用',
    'GitHub is temporarily unavailable. Please try again in a few minutes.': 'GitHub 暫時無法使用。請幾分鐘後再試一次。',
    'Maintenance in progress': '維護中',
    'GitHub is currently undergoing scheduled maintenance. Please check GitHub Status for updates.':
      'GitHub 目前正在執行排定的維護。請查看 GitHub 狀態頁面以取得最新資訊。',
    'You are offline': '你已離線',
    'It looks like you are offline. Check your connection and try again.': '你似乎已離線。請檢查網路連線後再試一次。',
    'Switching runtime': '正在切換執行環境',
    'GitHub is switching runtime environments. Please refresh this page in a few moments.':
      'GitHub 正在切換執行環境。請稍後重新整理此頁面。',
    'Too many requests': '請求過多',
    'You have exceeded a secondary rate limit. Please wait a few minutes before you try again; in some cases this may take up to an hour.':
      '你已超過次要速率限制。請等幾分鐘後再試；某些情況下可能需要長達一小時。',
    'Signing in': '登入',
    'may provide a higher rate limit if you are not already signed in. For more on scraping GitHub and how it may affect your rights, please review our':
      '可望提高速率限制（如果你尚未登入）。如需瞭解抓取 GitHub 資料的詳細資訊和對你權利的可能影響，請參閱我們的',
    'You have exceeded a secondary rate limit. Please wait a few minutes before you try again. For more on scraping GitHub and how it may affect your rights, please review our':
      '你已超過次要速率限制。請等幾分鐘後再試。如需瞭解抓取 GitHub 資料的詳細資訊和對你權利的可能影響，請參閱我們的',
    'Terms of Service': '服務條款',
    // Spark 等页脚的链接（小写写法）
    'Terms of service': '服務條款',
    // <relative-time> 的 prefix 属性（如 Actions 运行列表的「Today at 9:04」）
    'Today at': '今天',
    'Yesterday at': '昨天',

    // 组织升级为企业未完成时的提示（/account/upgrade 跳回首页、组织帐务页；链接 checkout page 拆开的整句见 inline）
    'You cannot change your plan because this organization is currently being upgraded to an Enterprise Account. Return to the checkout page to complete or cancel the upgrade.':
      '此組織正在升級為企業帳號，無法變更方案。請返回結帳頁面完成或取消升級。',
    'An organization upgrade to GitHub Enterprise has been initiated but not completed. Return to the checkout page to complete or cancel the upgrade.':
      '組織升級為 GitHub 企業版的作業已開始但尚未完成。請返回結帳頁面完成或取消升級。',
    'checkout page': '結帳頁面',
    // 表单提交失败的通用提示
    'Validation failed': '驗證失敗'
  },
  regexp: [
    // React 应用错误页标签页标题：Error 503
    [/^Error (\d{3})$/, '錯誤 $1'],
    // 单一登录横幅：其余组织数（React 拆分的数字与文字拼接后）
    [/^and (\d+) other organizations?\.$/, '和其他 $1 個組織。'],
    [/^Single sign-on to see results in (\d+) other organizations?\.$/, '使用單一登入查看其他 $1 個組織中的結果。'],
    [/^, and (\d+) more organizations?$/, '，和其他 $1 個組織'],
    // 强制 2FA 横幅的后半句（前半句 GitHub users are <strong>now required</strong> 见 static）
    [
      new RegExp(
        `^to enable two-factor authentication as an additional security measure\\. Your activity on GitHub includes you in this requirement\\. You will need to enable two-factor authentication on your account before (${DATE_SOURCE}), or be restricted from account actions\\.$`
      ),
      (_, date: string) =>
        joinCjk(
          joinCjk('啟用雙重驗證作為額外的安全措施。根據你在 GitHub 上的活動，你也在此要求範圍內。你必須在', translateTime(date)),
          '之前為帳號啟用雙重驗證，否則帳號操作將受到限制。'
        )
    ],
    // Copilot 预算横幅（组织、企业预算用尽）：Your organization <strong>名称</strong> has used …。
    // <strong> 前的 Your organization / Your enterprise 由 static 翻译，其后的文字整段匹配。个人预算用尽的句子见 inline
    [
      /^has used (its full Copilot budget|all its AI credits|all its Copilot AI credits)\. Access resumes on (.+?)\. Contact your admins to increase it\.$/,
      (_, budget, date) => `已用完${BUDGET_EXHAUSTED[budget] ?? budget}。${resumesOn(date)}。請聯絡你的管理員提高額度。`
    ],
    // 申请发送成功后的屏幕阅读器播报
    [
      new RegExp(`^Request sent\\. Your ${APPROVERS_SOURCE} will be notified\\.$`),
      (_, approvers) => `請求已送出。你的${BUDGET_APPROVER[approvers] ?? approvers}將會收到通知。`
    ],
    [
      new RegExp(`^Your ${APPROVERS_SOURCE} will be notified that you need additional ${BUDGET_LABEL_SOURCE}\\.$`),
      (_, approvers, label) =>
        `你的${BUDGET_APPROVER[approvers] ?? approvers}將會收到通知，得知你需要額外的 ${BUDGET_LABEL[label] ?? label}。`
    ],
    [
      new RegExp(`^Your request for additional ${BUDGET_LABEL_SOURCE} was declined by ${APPROVER_SOURCE}( on|\\.)$`),
      (_, label, approver, tail) =>
        `你對額外 ${BUDGET_LABEL[label] ?? label}的請求已遭${BUDGET_APPROVER[approver] ?? approver}拒絕${tail === '.' ? '。' : '於'}`
    ],
    // Copilot 预算申请审批卡片：申请时间（React 拆分的时长与文字拼接后）、每行控件的无障碍名称
    [new RegExp(`^Requested (${RELATIVE_SOURCE})$`), (_, time) => joinCjk(translateTime(time), '提出請求')],
    [
      new RegExp(`^(Approve|Deny) request from ([\\w-]+)${BUDGET_TARGET_SOURCE}$`),
      (_, verb, login, label) => `${verb === 'Approve' ? '核准' : '拒絕'} ${login} 的請求${budgetTarget(label)}`
    ],
    [
      new RegExp(`^New budget in dollars for ([\\w-]+)${BUDGET_TARGET_SOURCE}$`),
      (_, login, label) => `${login} 的新預算美元金額${budgetTarget(label)}`
    ],
    // 组织升级为企业未完成（企业代称照录）
    [
      /^Your upgrade for ([\w.-]+) is incomplete\. Please complete the purchase to upgrade your account\.$/,
      '你對 $1 的升級尚未完成。請完成購買以升級帳號。'
    ]
  ],
  inline: [
    // 组织升级为企业未完成：「… Return to the <a>checkout page</a> to complete or cancel the upgrade.」；企业代称在元素里时
    [
      /^(You cannot change your plan because this organization is currently being upgraded to an Enterprise Account|An organization upgrade to GitHub Enterprise has been initiated but not completed)\. Return to the \{\} to complete or cancel the upgrade\.$/,
      (_, lead: string) =>
        `${lead.startsWith('You') ? '此組織正在升級為企業帳號，無法變更方案' : '組織升級為 GitHub 企業版的作業已開始但尚未完成'}。請返回{}完成或取消升級。`
    ],
    [
      /^Your upgrade for \{\} is incomplete\. Please complete the purchase to upgrade your account\.$/,
      '你對 {} 的升級尚未完成。請完成購買以升級帳號。'
    ],
    // 取消市集应用方案后的提示：You've cancelled your subscription to <方案> for <应用>. This plan change will take effect on <日期>
    // （方案名、应用名照录）
    [
      /^You[’']ve cancelled your subscription to (.+?) for (.+?)\. This plan change will take effect on \{\}\.?$/,
      '你已取消 $2 的 $1 方案訂閱。此方案變更將於{}生效。'
    ],
    // Copilot 预算横幅（个人预算用尽）：<span>You've used … from <strong>来源</strong>. Access resumes on <日期>.
    // Your org admins can increase it sooner.</span>。来源（组织或企业名）移到句中，整句收录
    [
      new RegExp(
        `^You've used ${PERSONAL_EXHAUSTED_SOURCE} from \\{\\}\\. Access resumes on (.+?)\\. Your ${APPROVERS_SOURCE} can increase it sooner\\.$`
      ),
      (_, budget, date, approvers) =>
        `你已用完來自 {} 的${BUDGET_EXHAUSTED[budget] ?? budget}。${resumesOn(date)}。你的${BUDGET_APPROVER[approvers] ?? approvers}可以提前提高額度。`
    ]
  ]
} satisfies PageDictionary
