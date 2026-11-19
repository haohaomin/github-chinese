import type { PageDictionary } from '../../../core/types'
import { MONTH_SOURCE, TIME_SOURCE, joinCjk, translateDate, translateTime } from '../helpers'

/** 暂停时间：「October 1st, 2026 at 00:36 (CST)」（不含捕获组） */
export const SUSPEND_TIME_SOURCE = `${MONTH_SOURCE} \\d{1,2}(?:st|nd|rd|th)?, \\d{4} at \\d{1,2}:\\d{2}(?: [AP]M)? \\([^()]+\\)`

const SUSPEND_TIME_RE = new RegExp(
  `^(${MONTH_SOURCE}) (\\d{1,2})(?:st|nd|rd|th)?, (\\d{4}) at (\\d{1,2}):(\\d{2})(?: ([AP]M))? \\(([^()]+)\\)$`
)

/** 「October 1st, 2026 at 00:36 (CST)」→ 2026年10月1日 00:36（CST）；12 小时制换成 24 小时制 */
export function translateSuspendTime(text: string): string {
  const match = SUSPEND_TIME_RE.exec(text)
  const month = match ? translateDate(`${match[1]} ${match[2]}, ${match[3]}`) : undefined
  if (!match || month === undefined) return text
  const hour = (Number(match[4]) % (match[6] ? 12 : 24)) + (match[6] === 'PM' ? 12 : 0)
  return `${month} ${String(hour).padStart(2, '0')}:${match[5]}（${match[7]}）`
}

/**
 * 开发人员设置：GitHub 应用（/settings/apps、/settings/apps/new、/settings/apps/…）与
 * OAuth 应用（/settings/developers、/settings/applications/new、/settings/applications/…）。
 * 包括注册表单、常规设置（client secret、private key、显示信息、IP 允许列表）、安装、高级（转移、删除、公开/私人）、
 * 可选功能、Copilot 配置。权限与可订阅事件见 permissions.ts。
 * 术语：client ID / client secret → 用戶端 ID / 用戶端密碼，private key → 私密金鑰，callback URL → 回呼 URL，
 * redirect → 重新導向，wildcard matching → 萬用字元比對，device flow → 裝置流程，refresh token → 重新整理權杖，
 * user-to-server → 使用者對伺服器，logo → 標誌，badge → 徽章，listing → 上架資訊，expire → 到期，
 * optional features → 選用功能，opt-in / opt-out → 選擇加入 / 選擇退出，Copilot Extension → Copilot 擴充功能。
 */
export default {
  static: {
    // GitHub 应用列表
    'Job queued to revoke all user tokens': '已將撤銷所有使用者權杖的作業排入佇列',
    'Want to build something that integrates with and extends GitHub?': '想建置能與 GitHub 整合並擴充 GitHub 的工具嗎？',
    'Register a new GitHub App': '註冊新的 GitHub 應用程式',
    'to get started developing on the GitHub API. You can also read more about building GitHub Apps in our':
      '以開始使用 GitHub API 開發。如需建置 GitHub 應用程式的詳細資訊請參閱我們的',
    'A GitHub App can act on its own behalf, taking actions via the API directly instead of impersonating a user. Read more in our':
      'GitHub 應用程式能以自身身分行事，直接透過 API 執行動作而不必模擬使用者。詳情請參閱我們的',
    'developer documentation': '開發人員說明文件',

    // 注册 GitHub 应用
    'Register new GitHub App': '註冊新的 GitHub 應用程式',
    'GitHub App name': 'GitHub 應用程式名稱',
    'The name of your GitHub App.': '你的 GitHub 應用程式名稱。',
    'Markdown supported': '支援 Markdown',
    'This is displayed to users of your GitHub App': '這會顯示給你的 GitHub 應用程式使用者',
    'Homepage URL': '首頁 URL',
    'The full URL to your GitHub App’s website.': '你的 GitHub 應用程式網站的完整 URL。',
    "The full URL to your GitHub App's website.": '你的 GitHub 應用程式網站的完整 URL。',
    'Identifying and authorizing users': '識別並授權使用者',
    'The full URL to redirect to after a user authorizes an installation.': '使用者授權安裝後要重新導向的完整 URL。',
    'The URIs to redirect to after a user authorizes your application. You may add up to 10 redirect URIs. Wildcard matching allows tokens to be sent to all subdomains and additional paths of the redirect URI. Only enable this if you are sure you have control over all possible matches.':
      '使用者授權你的應用程式後要重新導向的 URI。最多可新增 10 個重新導向 URI。萬用字元比對允許將權杖傳送到重新導向 URI 的所有子網域和其他路徑。僅在確定你能掌控所有可能相符的 URI 時啟用。',
    'Callback URL documentation': '回呼 URL 說明文件',
    'Add Callback URL': '新增回呼 URL',
    'Callback URL': '回呼 URL',
    'Expire user authorization tokens': '使用者授權權杖自動到期',
    // 「This will provide a <code>refresh_token</code> which can be used to …」：原文无逗号，用「用於」接续
    'This will provide a': '這會提供',
    'which can be used to request an updated access token when this access token expires.': '用於在此存取權杖到期時請求新的存取權杖。',
    'Request user authorization (OAuth) during installation': '安裝期間請求使用者授權 (OAuth)',
    'Requests that the installing user grants access to their identity during installation of your App':
      '安裝你的應用程式時請求安裝者授權存取其身分',
    // 「Requests that the installing user <a>grants access to their identity</a> during installation of your App.」
    'Requests that the installing user': '安裝你的應用程式時請求安裝者',
    'grants access to their identity': '授權存取其身分',
    'during installation of your App.': '。',
    'Identifying and authorizing users for GitHub Apps documentation': 'GitHub 應用程式的使用者識別和授權說明文件',
    'Enable Device Flow': '啟用裝置流程',
    'Allow this GitHub App to authorize users via the Device Flow.': '允許此 GitHub 應用程式透過裝置流程授權使用者。',
    // 「Allow this GitHub App to authorize users via the <a>device flow</a>.」：「授權使用者」前移到本段
    'Allow this GitHub App to authorize users via the': '允許此 GitHub 應用程式授權使用者時使用',
    'Device Flow documentation': '裝置流程說明文件',
    'Post installation': '安裝後',
    'Setup URL (optional)': '設定 URL（選填）',
    'Setup URL': '設定 URL',
    'Users will be redirected to this URL after installing your GitHub App to complete additional setup.':
      '使用者安裝你的 GitHub 應用程式後會重新導向到此 URL 以完成其他設定。',
    'Unavailable when requesting OAuth during installation.': '安裝期間請求 OAuth 時無法使用。',
    "Users will be redirected to the 'User authorization callback URL' to complete additional setup.":
      '使用者會重新導向到「使用者授權回呼 URL」以完成其他設定。',
    'Redirect on update': '更新時重新導向',
    "Redirect users to the 'Setup URL' after installations are updated (E.g. repositories added/removed).":
      '安裝更新後（例如新增/移除儲存庫）將使用者重新導向到「設定 URL」。',
    "Redirect users to the 'User authorization callback URL' after installations are updated (E.g repositories added/removed).":
      '安裝更新後（例如新增/移除儲存庫）將使用者重新導向到「使用者授權回呼 URL」。',
    "Redirect users to the 'User authorization callback URL' after installations are updated (E.g. repositories added/removed).":
      '安裝更新後（例如新增/移除儲存庫）將使用者重新導向到「使用者授權回呼 URL」。',
    'Events will POST to this URL. Read our': '事件會以 POST 方式傳送到此 URL。請參閱我們的',
    // 「Events will POST to this URL with a <a>webhook</a>.」「Set a secret to <a>secure your webhooks</a>.」
    'Events will POST to this URL with a': '事件會以 POST 方式傳送到此 URL 並使用',
    'Set a secret to': '設定機密以',
    'secure your webhooks': '保護你的 Web 鉤子',
    'webhook documentation': 'Web 鉤子說明文件',
    'Webhook secret (optional)': 'Web 鉤子機密（選填）',
    'webhook secret documentation': 'Web 鉤子機密說明文件',
    'Where can this GitHub App be installed?': '此 GitHub 應用程式可以安裝在哪裡？',
    'Only on this account': '僅限此帳號',
    'Any account': '任何帳號',
    'Allow this GitHub App to be installed by any user or organization.': '允許任何使用者或組織安裝此 GitHub 應用程式。',
    'Create GitHub App': '建立 GitHub 應用程式',
    'Registration successful. You must': '註冊成功。你必須',
    'generate a private key': '產生私密金鑰',
    'in order to install your GitHub App.': '才能安裝你的 GitHub 應用程式。',
    'Got it. Your GitHub App has been updated.': '你的 GitHub 應用程式已更新。',
    'The GitHub App is now public. Anyone is free to install it.': '此 GitHub 應用程式現已設為公開。任何人都可以安裝。',
    'The GitHub App is now private. It can only be installed on this account.': '此 GitHub 應用程式現已設為私人。只能安裝在此帳號上。',

    // GitHub 应用设置：侧边栏、常规
    'Permissions & events': '權限和事件',
    'Install App': '安裝應用程式',
    'Optional features': '選用功能',
    'Public page': '公開頁面',
    'Owned by:': '擁有者：',
    'App ID:': '應用程式 ID：',
    'Client ID:': '用戶端 ID：',
    'Client ID': '用戶端 ID',
    'Using your App ID to get installation tokens? You can now': '正在使用應用程式 ID 取得安裝權杖嗎？現在你可以',
    'use your Client ID instead': '改用用戶端 ID',
    'Revoke all user tokens': '撤銷所有使用者權杖',
    'GitHub Apps can use OAuth credentials to identify users. Learn more about identifying users by reading our':
      'GitHub 應用程式可以使用 OAuth 認證資訊識別使用者。如需識別使用者的詳細資訊請參閱我們的',
    'integration developer documentation': '整合開發人員說明文件',
    'Public link': '公開連結',
    'Revoke all user tokens?': '撤銷所有使用者權杖？',
    // 「Are you sure you want to revoke <strong>all</strong> user tokens for this application?」
    'Are you sure you want to revoke': '確定要撤銷此應用程式的',
    'user tokens for this application?': '使用者權杖嗎？',
    'All users of this application will be forced back through the': '此應用程式的所有使用者都必須重新完成',
    'authorization flow': '授權流程',
    'before they can use your application again.': '才能再次使用你的應用程式。',
    'All SSH keys created by this application will also be deleted.': '此應用程式建立的所有 SSH 金鑰也會一併刪除。',
    'This action is not reversible.': '此動作無法復原。',
    'I understand, revoke all user tokens': '我瞭解，撤銷所有使用者權杖',
    'Client secrets': '用戶端密碼',
    'Client secret': '用戶端密碼',
    'Generate a new client secret': '產生新的用戶端密碼',
    'You need a client secret to authenticate as the application to the API.': '你需要用戶端密碼才能以應用程式的身分向 API 驗證。',
    'Make sure to copy your new client secret now. You won’t be able to see it again.':
      '請務必立即複製新的用戶端密碼。之後將無法再次查看。',
    "Make sure to copy your new client secret now. You won't be able to see it again.":
      '請務必立即複製新的用戶端密碼。之後將無法再次查看。',
    'Basic information': '基本資訊',
    'Display information': '顯示資訊',
    'Drag & drop': '拖放',
    'Upload a logo...': '上傳標誌...',
    'Upload a logo…': '上傳標誌…',
    'You can also drag and drop a picture from your computer.': '你也可以從電腦拖放圖片。',
    // 上传错误：原文两句，第二句「Try again.」单独成句（与下方 Whoops! 等同组提示一致）
    'Only images, please. Try again.': '僅限圖片。請再試一次。',
    '1MB or less, please. Try again.': '圖片不得超過 1MB。請再試一次。',
    'Whoops! Try again.': '發生錯誤！請再試一次。',
    'File contents don’t match the file extension. Try again.': '檔案內容與副檔名不符。請再試一次。',
    "File contents don't match the file extension. Try again.": '檔案內容與副檔名不符。請再試一次。',
    'Badge background color': '徽章背景顏色',
    'The hex value of the badge background color. Hex colors should only contain numbers and letters from a-f.':
      '徽章背景顏色的十六進位值。十六進位色碼只能包含數字和字母 a-f。',
    // 「List your GitHub App in the <a>GitHub Marketplace</a> so that other users can discover it.」（原文无逗号，译文不加）
    'List your GitHub App in the': '將你的 GitHub 應用程式上架到',
    'so that other users can discover it.': '以便其他使用者找到它。',
    'List in Marketplace': '在市集上架',
    'Edit how your GitHub App is presented in the Marketplace directory, including screenshots and links.':
      '編輯你的 GitHub 應用程式在市集目錄中的呈現方式，包括螢幕截圖和連結。',
    'Edit Marketplace listing': '編輯市集上架資訊',
    'Private keys': '私密金鑰',
    'Generate a private key': '產生私密金鑰',
    'You need a private key to sign access token requests.': '你需要私密金鑰才能簽署存取權杖請求。',
    'Learn more about private keys': '瞭解私密金鑰',
    'Private key': '私密金鑰',
    // 「Enter the IP addresses … with <a>IP allow lists</a> to selectively inherit …」
    'Enter the IP addresses of your GitHub App to allow organizations with': '輸入 GitHub 應用程式的 IP 位址可讓啟用',
    "to selectively inherit the App's IP allow list when installed.": '的組織在安裝時選擇性繼承該應用程式的 IP 允許清單。',
    'to selectively inherit the App’s IP allow list when installed.': '的組織在安裝時選擇性繼承該應用程式的 IP 允許清單。',
    'Learn more about App IP allow lists': '瞭解應用程式 IP 允許清單',
    'There are no IP addresses on the allow list yet.': '允許清單中尚無 IP 位址。',

    // 权限更新
    'Add a note to users': '為使用者新增附註',
    'This note will be displayed on the permissions update approval page.': '此附註會顯示在權限更新核准頁面上。',
    'Add a note to your users explaining why you are requesting these changes.': '新增附註向使用者說明你請求這些變更的原因。',
    'Are you sure you want to update permissions?': '確定要更新權限嗎？',
    'Current users will be prompted to accept these changes and enable the new permissions on their installation.':
      '系統會提示現有使用者接受這些變更並在其安裝中啟用新權限。',

    // 高级：转移、删除、公开/私人
    'Transfer ownership of this GitHub App': '轉移此 GitHub 應用程式的擁有權',
    'Type the name of the GitHub App to confirm': '輸入 GitHub 應用程式的名稱以確認',
    'New owner’s GitHub username or organization name': '新擁有者的 GitHub 使用者名稱或組織名稱',
    "New owner's GitHub username or organization name": '新擁有者的 GitHub 使用者名稱或組織名稱',
    'Transfer this GitHub App': '轉移此 GitHub 應用程式',
    'Delete this GitHub App': '刪除此 GitHub 應用程式',
    'Delete GitHub App': '刪除 GitHub 應用程式',
    'Delete GitHub App?': '刪除 GitHub 應用程式？',
    // 「This action <strong>CANNOT</strong> be undone. This will permanently delete the <strong>应用</strong> GitHub App.」
    'be undone. This will permanently delete the': '復原。這將永久刪除',
    // 「This will also uninstall the GitHub App from <strong>3 accounts</strong>.」：原文无逗号，译文不加
    'This will also uninstall the GitHub App from': '這也會解除安裝此 GitHub 應用程式並影響',
    'Please type in the name of the GitHub App to confirm.': '請輸入 GitHub 應用程式的名稱以確認。',
    'Please type in the name of the GitHub App to confirm': '請輸入 GitHub 應用程式的名稱以確認',
    'Type the name of the GitHub App to confirm:': '輸入 GitHub 應用程式的名稱以確認：',
    "New owner's GitHub username, organization, or enterprise name:": '新擁有者的 GitHub 使用者名稱、組織或企業名稱：',
    'New owner’s GitHub username, organization, or enterprise name:': '新擁有者的 GitHub 使用者名稱、組織或企業名稱：',
    'Search for new owner': '搜尋新擁有者',
    'Job queued to delete GitHub App. It may take a few minutes to complete.':
      '已將刪除 GitHub 應用程式的作業排入佇列。可能需要幾分鐘才能完成。',
    'Job queued to delete application. It may take a few minutes to complete.': '已將刪除應用程式的作業排入佇列。可能需要幾分鐘才能完成。',

    // 常规设置：保存失败、用户端密码、私密金钥（金钥组）
    'Application could not be saved. Please check the form for errors.': '無法儲存應用程式。請檢查表單中的錯誤。',
    'You have no client secrets': '沒有用戶端密碼',
    'Client secrets authenticate this GitHub App using the OAuth client flow.':
      '用戶端密碼會透過 OAuth 用戶端流程驗證此 GitHub 應用程式的身分。',
    'Delete client secret?': '刪除用戶端密碼？',
    'This action cannot be undone. This client secret will stop working immediately. Are you sure you want to delete this client secret?':
      '此動作無法復原。此用戶端密碼將立即失效。確定要刪除此用戶端密碼嗎？',
    'Client secret removed': '已刪除用戶端密碼',
    'You have no key pairs': '沒有金鑰組',
    'Private key (generating)': '私密金鑰（產生中）',
    'Delete private key?': '刪除私密金鑰？',
    'This action cannot be undone. This key will stop working immediately. Are you sure you want to delete this private key?':
      '此動作無法復原。此金鑰將立即失效。確定要刪除此私密金鑰嗎？',
    'You cannot delete the only private key. Generate a new key first.': '無法刪除唯一的私密金鑰。請先產生新金鑰。',

    // IP 允许清单
    'IP address or CIDR range': 'IP 位址或 CIDR 範圍',
    'IP allow list entry created. IP allow list modifications can take a few minutes to go into effect.':
      '已建立 IP 允許清單項目。IP 允許清單的修改可能需要幾分鐘才會生效。',
    'IP allow list entry updated. IP allow list modifications can take a few minutes to go into effect.':
      '已更新 IP 允許清單項目。IP 允許清單的修改可能需要幾分鐘才會生效。',
    'IP allow list entry deleted. IP allow list modifications can take a few minutes to go into effect.':
      '已刪除 IP 允許清單項目。IP 允許清單的修改可能需要幾分鐘才會生效。',
    'Are you sure you want to delete this entry?': '確定要刪除此項目嗎？',
    // 「This will permanently delete the IP allow list entry for <strong>IP</strong>.」
    'This will permanently delete the IP allow list entry for': '這將永久刪除 IP 允許清單中的項目',
    'Yes, delete this IP allow list entry': '是，刪除此 IP 允許清單項目',
    // 检查 IP 地址的结果（IP 在前面的元素里）
    'is not permitted by the IP allow list.': '未獲 IP 允許清單允許。',
    'not permitted by the IP allow list.': '未獲 IP 允許清單允許。',
    'is permitted by the IP allow list.': '已獲 IP 允許清單允許。',

    // OAuth 应用：「You can list your application in the <a>GitHub Marketplace</a> so that other users can discover it.」
    'You can list your application in the': '你可以將應用程式上架到',
    'List this application in the Marketplace': '將此應用程式上架到市集',
    'Hex color code': '十六進位色碼',
    'Hex colors should only contain numbers and letters from a-f': '十六進位色碼只能包含數字和字母 a-f',
    'I understand the consequences, delete this GitHub App': '我瞭解後果，刪除此 GitHub 應用程式',
    'Make this GitHub App public': '將此 GitHub 應用程式設為公開',
    'Allow this GitHub App to be installed on other accounts.': '允許在其他帳號上安裝此 GitHub 應用程式。',
    'Make this GitHub App private': '將此 GitHub 應用程式設為私人',
    'Private GitHub Apps cannot be installed on other accounts.': '私人 GitHub 應用程式無法安裝在其他帳號上。',
    'This integration cannot be made private since it is already installed on other accounts.':
      '此整合因已安裝在其他帳號上而無法設為私人。',
    'Make this application private': '將此應用程式設為私人',
    'Private applications cannot be installed on other accounts.': '私人應用程式無法安裝在其他帳號上。',

    // 可选功能
    'User-to-server token expiration': '使用者對伺服器權杖到期',
    'User-to-server access tokens will expire after 8 hours. A Refresh Token will be provided which can be exchanged for a new access token.':
      '使用者對伺服器存取權杖會在 8 小時後到期。同時會提供可用來換取新存取權杖的重新整理權杖。',
    'Disable user-to-server token expiration for this app.': '為此應用程式停用使用者對伺服器權杖到期。',

    // Copilot 配置
    'A Copilot configuration allows your GitHub App to integrate with Copilot. Learn more about building GitHub Copilot Extensions in the':
      'Copilot 設定可讓你的 GitHub 應用程式與 Copilot 整合。如需建置 GitHub Copilot 擴充功能的詳細資訊請參閱',
    'Accept the Marketplace Developer agreement to create your Copilot Extension': '接受市集開發人員協議以建立你的 Copilot 擴充功能',
    // 「By clicking "Accept Terms" below, you agree to the <a>…Policy</a> and <a>Pre-release License terms</a>. …」
    'By clicking "Accept Terms" below, you agree to the': '按一下下方的「接受條款」即表示你同意',
    'By clicking “Accept Terms” below, you agree to the': '按一下下方的「接受條款」即表示你同意',
    'GitHub Copilot Extension Developer Policy': 'GitHub Copilot 擴充功能開發人員政策',
    'Pre-release License terms': '發行前版本授權條款',
    '. Please check to make sure that you are agreeing to these terms on behalf of the correct account.':
      '。請確認你是代表正確的帳號同意這些條款。',
    'Accept Terms': '接受條款',
    'To enable Copilot functionality, you must first accept the Marketplace Developer agreement':
      '若要啟用 Copilot 功能，必須先接受市集開發人員協議',
    // 原文界面名无引号，译文不加
    'To enable Copilot functionality, you must first grant your app permission to read Copilot Messages. To do so, navigate to Permissions & Events > Account Permissions > Read-only for Copilot Chat':
      '若要啟用 Copilot 功能，必須先授予應用程式讀取 Copilot 訊息的權限。若要這麼做，請前往權限和事件 > 帳號權限 > 將 Copilot 聊天設為唯讀',

    // OAuth 应用列表
    'No OAuth applications': '沒有 OAuth 應用程式',
    'OAuth applications are used to access the GitHub API.': 'OAuth 應用程式用於存取 GitHub API。',
    'Read the docs': '閱讀說明文件',
    'to find out more.': '以瞭解詳情。',
    'Register a new application': '註冊新應用程式',
    'No OAuth apps': '沒有 OAuth 應用程式',
    'OAuth apps are used to access the GitHub API. Read the docs to find out more.':
      'OAuth 應用程式用於存取 GitHub API。閱讀說明文件以瞭解詳情。',
    'Developer applications': '開發人員應用程式',
    // 「These are applications you have registered to use the <a>GitHub API</a>.」
    'These are applications you have registered to use the': '你註冊的這些應用程式可使用',
    'New OAuth Application': '新增 OAuth 應用程式',

    // 注册 / 编辑 OAuth 应用
    'Register a new OAuth app': '註冊新的 OAuth 應用程式',
    'Register a new OAuth application': '註冊新的 OAuth 應用程式',
    'Application name': '應用程式名稱',
    'Something users will recognize and trust.': '使用者能辨識並信任的名稱。',
    'The full URL to your application homepage.': '應用程式首頁的完整 URL。',
    'Application description': '應用程式描述',
    'Application description is optional': '應用程式描述為選填',
    'This is displayed to all users of your application.': '這會顯示給應用程式的所有使用者。',
    'Authorization callback URL': '授權回呼 URL',
    'Your application’s callback URL. Read our': '應用程式的回呼 URL。請參閱我們的',
    "Your application's callback URL. Read our": '應用程式的回呼 URL。請參閱我們的',
    'OAuth documentation': 'OAuth 說明文件',
    'Allow this OAuth App to authorize users via the Device Flow.': '允許此 OAuth 應用程式透過裝置流程授權使用者。',
    // 「Allow this OAuth App to authorize users via the <a>device flow</a>.」
    'Allow this OAuth App to authorize users via the': '允許此 OAuth 應用程式授權使用者時使用',
    'Register application': '註冊應用程式',
    'Update application': '更新應用程式',
    'Application logo': '應用程式標誌',
    'Upload new logo': '上傳新標誌',
    'Delete application': '刪除應用程式',
    'Transfer ownership of this application': '轉移此應用程式的擁有權',
    'Delete this OAuth application': '刪除此 OAuth 應用程式',
    'Are you sure you want to delete this application?': '確定要刪除此應用程式嗎？',

    // OAuth 应用设置页（React）
    'OAuth app settings': 'OAuth 應用程式設定',
    'OAuth application settings': 'OAuth 應用程式設定',
    'Application settings': '應用程式設定',
    // 「<a>用户</a> owns this application.」
    'owns this application.': '擁有此應用程式。',
    // 「You can edit how <strong>应用</strong> is presented on <a>GitHub Marketplace</a>, including …」
    'You can edit how': '你可以編輯',
    'is presented on': '在',
    ', including description, screenshots, and pricing information.': '上的呈現方式，包括描述、螢幕截圖和定價資訊。',
    'You cannot delete the only client secret. Generate a new client secret first.': '無法刪除唯一的用戶端密碼。請先產生新的用戶端密碼。',
    'Label: Client secret': '標籤：用戶端密碼',
    'Redirect URIs': '重新導向 URI',
    'Redirect URI': '重新導向 URI',
    'Add redirect URI': '新增重新導向 URI',
    'Allow wildcard matching': '允許萬用字元比對',
    'The URIs to redirect to after a user authorizes an app. You may add up to 10 redirect URIs. Wildcard matching allows tokens to be sent to all subdomains and additional paths of the redirect URI. Only enable this if you are sure you have control over all possible matches.':
      '使用者授權應用程式後要重新導向的 URI。最多可新增 10 個重新導向 URI。萬用字元比對允許將權杖傳送到重新導向 URI 的所有子網域和其他路徑。僅在確定你能掌控所有可能相符的 URI 時啟用。',
    'Learn more about secure use of redirect URIs': '瞭解如何安全使用重新導向 URI',
    'e.g. https://example.com/auth': '例如 https://example.com/auth',
    'Token expiration': '權杖到期',
    'Expire user access tokens': '使用者存取權杖自動到期',
    'Access tokens will expire after 8 hours. A refresh token will be provided which can be used to request an updated access token. Existing tokens are not affected.':
      '存取權杖會在 8 小時後到期。同時會提供可用來請求新存取權杖的重新整理權杖。現有權杖不受影響。',
    'Transfer this application': '轉移此應用程式',
    'Type the name of the application to confirm': '輸入應用程式名稱以確認',
    'Type in the name of the application to confirm that you want to transfer this repository.': '輸入應用程式名稱以確認轉移。',
    'Type in the username of the new owner.': '輸入新擁有者的使用者名稱。',
    'Delete application?': '刪除應用程式？',
    'Delete OAuth application': '刪除 OAuth 應用程式',
    'Fewer than 10 users are currently using this application. It will not be able to be used after deletion.':
      '目前使用此應用程式的使用者少於 10 位。刪除後將無法再使用。',
    'Please note that deleting the OAuth application will invalidate any access tokens authorized by users.':
      '請注意刪除 OAuth 應用程式會讓使用者授權的所有存取權杖失效。'
  },
  scoped: {
    // 列表（与组织开发人员设置共用；Developer settings 菜单项由 settings-account 收录）
    'GitHub Apps': 'GitHub 應用程式',
    'OAuth Apps': 'OAuth 應用程式',
    'New GitHub App': '新增 GitHub 應用程式',
    'New OAuth App': '新增 OAuth 應用程式',
    'New OAuth app': '新增 OAuth 應用程式',
    'No GitHub Apps': '沒有 GitHub 應用程式',
    'View documentation': '查看說明文件',
    'device flow': '裝置流程',

    // 表单（与组织、存储库 Web 钩子共用的短语，译法同 repo-settings/webhooks.ts；SSL 验证等说明由 repo-settings 收录）
    'Read the': '請參閱',
    // Web 钩子分节标题、字段名；「Events will POST to this URL with a <a>webhook</a>.」
    Webhook: 'Web 鉤子',
    'Webhook URL': 'Web 鉤子 URL',
    webhook: 'Web 鉤子',
    Secret: '機密',
    '(not recommended)': '（不建議）',
    // 「Disabling this option is <a>not recommended</a>.」
    'not recommended': '不建議',
    'Recent deliveries': '最近傳遞',
    'Recent Deliveries': '最近傳遞',
    Response: '回應',
    Redeliver: '重新傳遞',
    // 重新傳遞過的紀錄的標記、確認對話框
    redelivery: '重新傳遞',
    'Redeliver payload?': '重新傳遞承載？',
    'Yes, redeliver this payload': '是，重新傳遞此承載',
    Headers: '標頭',
    Payload: '承載',

    // 设置页（General、Install 由 settings-account、common-ui 收录）
    Advanced: '進階',
    Added: '新增於',
    'IP allow list': 'IP 允許清單',
    'IP address or range in CIDR notation': '以 CIDR 標記法表示的 IP 位址或範圍',
    'Short description of IP address or range': 'IP 位址或範圍的簡短描述',
    'Check IP address': '檢查 IP 位址',
    'Enter an IP address to check whether it is permitted by enabled entries on the IP allow list.':
      '輸入 IP 位址以檢查 IP 允許清單中已啟用的項目是否允許該位址。',
    // 应用标志的上传、裁切、删除（avatar 指应用标志）
    'Crop your new avatar': '裁切新標誌',
    'Set new avatar': '設定新標誌',
    'Your avatar has been updated. It may take a few minutes to update across the site.': '標誌已更新。全站更新可能需要幾分鐘。',
    'This avatar has been deleted.': '已刪除此標誌。',
    'Delete this image': '刪除此標誌',
    'Key pairs': '金鑰組',
    'New key': '新增金鑰',
    'Short description': '簡短描述',
    'contact GitHub': '聯絡 GitHub',
    'Uploading...': '上傳中...',
    'Uploading…': '上傳中…',
    // 「Are you sure you want to revoke <strong>all</strong> user tokens for this application?」
    all: '所有',
    'Make private': '設為私人',
    'This cannot be undone. Please be certain.': '此動作無法復原。請務必確定。',
    'Opt-out': '選擇退出',
    'Opt-in': '選擇加入',
    'Installed on': '安裝於'
  },
  regexp: [
    [/^Only allow this GitHub App to be installed on the (@[\w-]+) account\.$/, '只允許將此 GitHub 應用程式安裝在 $1 帳號上。'],
    [/^Choose an account to install (.+) on:$/, '選擇要安裝 $1 的帳號：'],
    [/^Install (.+) on this account\.$/, '將 $1 安裝到此帳號。'],
    [/^(.+) is installed on this account\.$/, '$1 已安裝在此帳號上。'],
    [/^Where should we transfer (.+)\?$/, '要將 $1 轉移給誰？'],
    [
      /^Any user or organization will be able to install this GitHub App\. Are you sure you want to make (.+) public\?$/,
      '任何使用者或組織都將能安裝此 GitHub 應用程式。確定要將 $1 設為公開嗎？'
    ],
    [
      /^This GitHub [Aa]pp will only be installable on the (\S+) account\. Are you sure you want to make (.+) private\?$/,
      '此 GitHub 應用程式將只能安裝在 $1 帳號上。確定要將 $2 設為私人嗎？'
    ],
    [/^(\d+) accounts?$/, '$1 個帳號'],
    [/^(\d+) users?$/, '$1 位使用者'],
    // 用户端密码、私密金钥：「Added just now by <a>octocat</a>」
    [new RegExp(`^Added (${TIME_SOURCE}) by$`), (_, time: string) => joinCjk(translateTime(time), '新增，新增者')],
    // 检查 IP 位址的结果
    [/^(\S+) is not permitted by the IP allow list\.$/, '$1 未獲 IP 允許清單允許。'],
    [/^(\S+) is permitted by the IP allow list\.$/, '$1 已獲 IP 允許清單允許。'],
    // 被 GitHub 暂停的应用
    [
      new RegExp(`^This GitHub App was suspended by GitHub staff on (${SUSPEND_TIME_SOURCE})\\.$`),
      (_, time: string) => `此 GitHub 應用程式已於 ${translateSuspendTime(time)}遭 GitHub 工作人員暫停。`
    ],
    // 客户端密钥：「Added 3 days ago by octocat」
    [
      new RegExp(`^Added (${TIME_SOURCE}) by ([\\w-]+)$`),
      (_, time: string, user: string) => joinCjk(translateTime(time), `由 ${user} 新增`)
    ],
    [/^This will also uninstall the GitHub App from (\d+) accounts?\.$/, '這也會從 $1 個帳號解除安裝此 GitHub 應用程式。'],
    [/^Activate optional features for (.+)$/, '為 $1 啟用選用功能'],
    [/^Choose a feature to activate for (.+):$/, '選擇要為 $1 啟用的功能：'],
    // 最近传递：传递耗时（与存储库 Web 钩子一致）
    [/^Completed in ([\d.]+) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗時 ${seconds} 秒${dot ? '。' : ''}`]
  ],
  // 删除 GitHub 应用对话框：整句调整语序，未命中时按 static 的片段译文
  inline: [
    ['This will also uninstall the GitHub App from {}.', '這也會從 {}解除安裝此 GitHub 應用程式。'],
    // OAuth 应用的使用者数：「<span>0</span> users」
    ['{#} users', '{#} 位使用者'],
    ['{#} user', '{#} 位使用者']
  ]
} satisfies PageDictionary
