import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/** “Added Oct 1, 2024 | Last used Oct 26, 2025” 中的时间：never → 從未使用，其余为「上次使用於 <时间>」 */
function usedTime(time: string): string {
  return time === 'never' ? '從未使用' : joinCjk('上次使用於', translateTime(time))
}

/** 双因素方法各行按钮的动作与方法名（“Edit Authenticator app”“Show GitHub Mobile”） */
const METHOD_ACTIONS: Readonly<Record<string, string>> = {
  Add: '新增',
  Edit: '編輯',
  Show: '顯示',
  Hide: '隱藏',
  View: '查看'
}
const METHODS: Readonly<Record<string, string>> = {
  'Authenticator app': '驗證器應用程式',
  'SMS/Text message': '簡訊',
  'Security keys': '安全金鑰',
  // 产品名按用户规定译成中文：GitHub Mobile → GitHub 行動版
  'GitHub Mobile': 'GitHub 行動版',
  'Recovery codes': '復原碼'
}

/** 动作与方法名相接，方法名是英文时中间加空格 */
function methodAction(action: string, method: string): string {
  return joinCjk(METHOD_ACTIONS[action] ?? action, METHODS[method] ?? method)
}

/** 密码校验错误的各项（不含开头的 Password） */
const PASSWORD_PART_SOURCE =
  "(?:is too short \\(minimum is \\d+ characters\\)|is too long \\(maximum is \\d+ characters\\)|needs at least (?:1|one) (?:number|lowercase letter)|cannot include your login|is in a list of passwords commonly used on other websites|can['’]t be blank|is invalid)"

const PASSWORD_PARTS: readonly (readonly [RegExp, string])[] = [
  [/^is too short \(minimum is (\d+) characters\)$/, '太短（至少 $1 個字元）'],
  [/^is too long \(maximum is (\d+) characters\)$/, '太長（最多 $1 個字元）'],
  [/^needs at least (?:1|one) number$/, '至少需要 1 個數字'],
  [/^needs at least (?:1|one) lowercase letter$/, '至少需要 1 個小寫字母'],
  [/^cannot include your login$/, '不能包含你的登入名稱'],
  [/^is in a list of passwords commonly used on other websites$/, '列於其他網站的常用密碼清單中'],
  [/^can['’]t be blank$/, '不能為空白'],
  [/^is invalid$/, '無效']
]

/**
 * 密码校验错误的各项拼成一句：两项用“且”，三项以上用“，”并在最后一项前加“且”。
 * “is too short (minimum is 8 characters), needs at least 1 number, and cannot include your login”
 * → “太短（至少 8 個字元），至少需要 1 個數字，且不能包含你的登入名稱”
 */
export function passwordProblems(list: string): string {
  const parts = list.split(/,? and |, /).map(part => {
    const rule = PASSWORD_PARTS.find(([pattern]) => pattern.test(part))
    return rule ? part.replace(rule[0], rule[1]) : part
  })
  if (parts.length < 3) return parts.join('且')
  return `${parts.slice(0, -1).join('，')}，且${parts[parts.length - 1]}`
}

/**
 * 密码和身份验证（/settings/security）：更改密码、通行密钥、登录方式、双因素身份验证（首选方法、身份验证器应用、短信、
 * 安全密钥、GitHub 行動版、恢复选项）；恢复代码页（/settings/auth/recovery-codes）；启用 2FA 向导
 * （/settings/two_factor_authentication/setup/…）；2FA 复查与强制启用提示。
 * auth 已收录的 static（Two-factor authentication、Security keys、Recovery codes、Add a passkey、部分支持通行密钥提示、
 * Waiting for input from browser interaction… 等）不再重复；
 * auth 中只在登录页生效的 scoped（Authenticator app、SMS/Text message 等）在此补 scoped。
 */
export default {
  static: {
    // 双因素身份验证已启用时访问设置向导的提示
    'Two-factor authentication is already enabled, You can manage your configuration from this page.':
      '雙重驗證已啟用，可在此頁面管理設定。',
    // 更改密码：要求说明被 <strong> 拆开
    'Old password': '舊密碼',
    'New password': '新密碼',
    'Confirm new password': '確認新密碼',
    "Make sure it's": '請確保密碼',
    'Make sure it’s': '請確保密碼',
    'at least 15 characters': '至少 15 個字元',
    'at least 8 characters': '至少 8 個字元',
    'including a number': '且包含數字',
    'and a lowercase letter': '和小寫字母',
    'Update password': '更新密碼',
    'I forgot my password': '我忘記密碼了',
    'Password changed successfully.': '已變更密碼。',
    'Strengthen your account by ensuring your password is strong.': '確保使用高強度密碼，強化帳號安全。',
    'Learn more about creating a strong password': '瞭解如何建立高強度密碼',
    // 「Learn more」链接的无障碍名称
    'Learn more about strong passwords': '瞭解高強度密碼',
    'Password is too short (minimum is 8 characters)': '密碼太短（至少 8 個字元）',
    'Password is too short (minimum is 8 characters) and is in a list of passwords commonly used on other websites':
      '密碼太短（至少 8 個字元）且列於其他網站的常用密碼清單中',
    'Password needs at least 1 lowercase letter and is in a list of passwords commonly used on other websites':
      '密碼至少需要 1 個小寫字母且列於其他網站的常用密碼清單中',
    'Password is too short (minimum is 8 characters), needs at least 1 lowercase letter, and is in a list of passwords commonly used on other websites':
      '密碼太短（至少 8 個字元），至少需要 1 個小寫字母，且列於其他網站的常用密碼清單中',
    'Password is too short (minimum is 8 characters), needs at least 1 lowercase letter, cannot include your login, and is in a list of passwords commonly used on other websites':
      '密碼太短（至少 8 個字元），至少需要 1 個小寫字母，不能包含你的登入名稱，且列於其他網站的常用密碼清單中',
    'Password is too short (minimum is 8 characters), needs at least 1 number, cannot include your login, and is in a list of passwords commonly used on other websites':
      '密碼太短（至少 8 個字元），至少需要 1 個數字，不能包含你的登入名稱，且列於其他網站的常用密碼清單中',
    "Password confirmation doesn't match the password": '兩次輸入的密碼不一致',
    'Password confirmation doesn’t match the password': '兩次輸入的密碼不一致',
    'Old password isn’t valid': '舊密碼無效',
    "Old password isn't valid": '舊密碼無效',

    // 通行密钥
    'Passwordless sign-in with passkeys': '使用密碼金鑰免密碼登入',
    'Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a device password, or a PIN. They can be used as a password replacement or as a 2FA method. Passkeys can be used for sign-in as a simple and secure alternative to your password and two-factor credentials.':
      '密碼金鑰是 WebAuthn 認證資訊，透過觸控、臉部辨識、裝置密碼或 PIN 碼驗證你的身分，可用來取代密碼或作為 2FA 方式。密碼金鑰可用於登入，簡單又安全地取代密碼和雙重驗證認證資訊。',
    'This browser or device does not fully support passkeys - you may be able to use a passkey from another device.':
      '此瀏覽器或裝置未完整支援密碼金鑰，你或許可以使用其他裝置上的密碼金鑰。',
    'Learn more about passkeys': '瞭解密碼金鑰',
    'Your passkeys': '你的密碼金鑰',
    'Edit passkey nickname': '編輯密碼金鑰暱稱',
    'Delete passkey?': '刪除密碼金鑰？',
    'You will no longer be able to use it to sign-in to your account.': '你將無法再使用它登入帳號。',
    "Note: You may continue to see this passkey as an option during sign-in until you also delete it from your browser, device or associated account's password management settings.":
      '注意：除非你也從瀏覽器、裝置或關聯帳號的密碼管理設定中刪除此密碼金鑰，否則登入時可能仍會看到這個選項。',
    'Note: You may continue to see this passkey as an option during sign-in until you also delete it from your browser, device or associated account’s password management settings.':
      '注意：除非你也從瀏覽器、裝置或關聯帳號的密碼管理設定中刪除此密碼金鑰，否則登入時可能仍會看到這個選項。',
    'Deleting…': '刪除中…',
    'Seen from this browser': '曾在此瀏覽器上使用',
    'Upgrade to a passkey': '升級為密碼金鑰',
    'Upgrade to passkey': '升級為密碼金鑰',
    'Upgrade your security key registration to a passkey': '將已註冊的安全金鑰升級為密碼金鑰',

    // 登录方式
    'Sign in methods': '登入方式',
    'Passwordless sign-in with biometrics or security keys': '使用生物辨識或安全金鑰免密碼登入',
    'Sign in with your Google account': '使用你的 Google 帳號登入',
    'Sign in with your Apple account': '使用你的 Apple 帳號登入',
    'Google sign in method dropdown': 'Google 登入方式下拉式選單',

    // 双因素身份验证
    'You can now manage your two-factor authentication methods from this page.': '你現在可以在此頁面管理雙重驗證方式。',
    'Two-factor authentication successfully disabled.': '已停用雙重驗證。',
    'SMS/Text message successfully configured.': '已設定簡訊。',
    'SMS/Text message successfully disabled.': '已停用簡訊。',
    'Authenticator app successfully reconfigured.': '已重新設定驗證器應用程式。',
    'Two-factor authentication is not enabled yet.': '尚未啟用雙重驗證。',
    'Enable two-factor authentication': '啟用雙重驗證',
    // 双因素身份验证管理页的标签页标题
    'Manage two-factor authentication': '管理雙重驗證',
    'Disable two-factor authentication': '停用雙重驗證',
    // 禁用 2FA 的确认对话框：「Some GitHub users are <strong>now required</strong> to enable …」（后半句见正则）
    'Are you sure you want to disable two-factor authentication?': '確定要停用雙重驗證嗎？',
    'Some GitHub users are': '部分 GitHub 使用者',
    'GitHub highly recommends that you keep two-factor authentication enabled on your account. If you need to change your configuration, or generate new recovery codes, you can do that in the settings below.':
      'GitHub 強烈建議你的帳號保持啟用雙重驗證。如需變更設定或產生新的復原碼，可在下方設定中完成。',
    'Disabling...': '停用中...',
    'Disabling…': '停用中…',
    'Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.':
      '雙重驗證會在登入時要求密碼以外的驗證，為你的帳號多加一層安全保護。',
    'Learn more about two-factor authentication': '瞭解雙重驗證',
    'Learn more about two-factor authentication.': '瞭解雙重驗證。',
    'Because of your contributions on GitHub, two-factor authentication is required for your account. Thank you for helping keep the ecosystem safe!':
      '由於你在 GitHub 上的貢獻，你的帳號必須啟用雙重驗證。感謝你協助維護生態系統的安全！',
    // 日期在单独元素中：「… starting <date>. Thank you …」→ “…你的帳號將自 <日期> 起必須啟用雙重驗證。感謝…”
    'Because of your contributions on GitHub, two-factor authentication will be required for your account starting':
      '由於你在 GitHub 上的貢獻，你的帳號將自',
    '. Thank you for helping keep the ecosystem safe!': '起必須啟用雙重驗證。感謝你協助維護生態系統的安全！',
    'Learn more about our two-factor authentication initiative': '瞭解我們的雙重驗證計畫',
    "Two-factor authentication is required for at least one organization or enterprise account you're affiliated with.":
      '你所屬的組織或企業帳號中，至少有一個要求啟用雙重驗證。',
    'Two-factor authentication is required for at least one organization or enterprise account you’re affiliated with.':
      '你所屬的組織或企業帳號中，至少有一個要求啟用雙重驗證。',
    'Preferred 2FA method': '偏好的 2FA 方式',
    'Set your preferred method to use for two-factor authentication when signing into GitHub.':
      '設定登入 GitHub 時偏好使用的雙重驗證方式。',
    'Passkeys should be used primarily for standalone, password-less authentication.': '密碼金鑰應主要用於獨立的無密碼身分驗證。',

    // 身份验证器应用
    'Use an authentication app or browser extension to generate one-time codes.': '使用驗證應用程式或瀏覽器擴充功能產生一次性驗證碼。',
    'Manage Authenticator app': '管理驗證器應用程式',
    'Authenticator apps and browser extensions like': '驗證器應用程式和瀏覽器擴充功能如',
    ', etc. generate one-time passwords that are used as a second factor to verify your identity when prompted during sign-in.':
      '等，會產生一次性密碼，在登入時依提示作為第二因素驗證你的身分。',
    'Scan the QR code': '掃描 QR 圖碼',
    'Re-scan the QR code': '重新掃描 QR 圖碼',
    'Use an authenticator app or browser extension to scan.': '使用驗證器應用程式或瀏覽器擴充功能掃描。',
    'Learn more about enabling 2FA': '瞭解如何啟用 2FA',
    'Learn more about enabling 2FA.': '瞭解如何啟用 2FA。',
    'Unable to scan? You can use the': '無法掃描？你可以使用',
    'setup key': '設定金鑰',
    'Setup key': '設定金鑰',
    'to manually configure your authenticator app.': '手動設定驗證器應用程式。',
    'Your two-factor secret': '你的雙重驗證金鑰',
    'Verify the code from the app': '驗證應用程式中的驗證碼',
    'Verify the code from the app.': '驗證應用程式中的驗證碼。',
    // 句号随原文
    'Two-factor code verification failed. Please try again.': '雙重驗證碼驗證失敗。請再試一次。',

    // 短信（原文没有的冒号不加；because → 因為）
    'Manage SMS/Text message': '管理簡訊',
    'Less secure': '安全性較低',
    'Get one-time codes sent to your phone via SMS to complete authentication requests. We strongly advise against using SMS because it is susceptible to interception, does not provide resistance against phishing attacks, and deliverability can be unreliable. It is recommended to use an Authenticator app instead of SMS.':
      '透過簡訊將一次性驗證碼傳送到你的手機，以完成身分驗證請求。我們強烈建議不要使用簡訊，因為簡訊容易遭到攔截、無法抵禦網路釣魚攻擊，且可能無法穩定送達。建議使用驗證器應用程式代替簡訊。',
    'Get one-time codes sent to your phone via SMS to complete authentication requests.':
      '透過簡訊將一次性驗證碼傳送到你的手機，以完成身分驗證請求。',
    'We strongly advise against using SMS because it is susceptible to interception, does not provide resistance against phishing attacks, and deliverability can be unreliable. Instead, we recommend configuring an authenticator app and disabling SMS as a 2FA method. You will receive one-time codes at this phone number:':
      '我們強烈建議不要使用簡訊，因為簡訊容易遭到攔截、無法抵禦網路釣魚攻擊，且可能無法穩定送達。建議改為設定驗證器應用程式，並停用簡訊這項 2FA 方式。你會透過此電話號碼收到一次性驗證碼：',
    // 「Make sure that <a>your country or region is supported</a> for SMS delivery.」
    // → “請確認你所在的國家/地區支援簡訊傳送。”（链接文字只译主语，谓语放在后半句）
    'Get authentication codes by SMS on your mobile phone when signing into GitHub. Make sure that':
      '登入 GitHub 時透過手機簡訊取得驗證碼。請確認',
    'your country or region is supported': '你所在的國家/地區',
    'your country is supported': '你所在的國家',
    'for SMS delivery.': '支援簡訊傳送。',
    'Verify account': '驗證帳號',
    "Before setting up SMS, please verify that you're a human.": '設定簡訊前，請先驗證你是真人。',
    'Before setting up SMS, please verify that you’re a human.': '設定簡訊前，請先驗證你是真人。',
    'Country or region code': '國家/地區代碼',
    'Country code': '國碼',
    'Your phone number': '你的電話號碼',
    'Send authentication code': '傳送驗證碼',
    'Sent. It may take a minute for the SMS to arrive.': '已傳送。簡訊可能需要一分鐘才會送達。',
    'Verify the code sent to your phone': '驗證傳送到你手機的驗證碼',

    // 安全密钥与 GitHub 行動版
    'Security keys are webauthn credentials that can only be used as a second factor of authentication.':
      '安全金鑰是只能作為身分驗證第二因素的 WebAuthn 認證資訊。',
    'No security keys': '沒有安全金鑰',
    'Register new security key': '註冊新的安全金鑰',
    'Enter a nickname for this security key': '輸入此安全金鑰的暱稱',
    'Security key registration failed.': '安全金鑰註冊失敗。',
    "This browser doesn't support security keys yet.": '此瀏覽器尚不支援安全金鑰。',
    'This browser doesn’t support security keys yet.': '此瀏覽器尚不支援安全金鑰。',
    'This security key has already been registered.': '此安全金鑰已註冊。',
    'Security key': '安全金鑰',
    'Use your device with Touch ID, Windows Hello, etc. or a physical security key (e.g. YubiKey)':
      '使用支援 Touch ID、Windows Hello 等功能的裝置，或實體安全金鑰（例如 YubiKey）',
    'Manage GitHub Mobile': '管理 GitHub 行動版',

    // 恢复选项与恢复代码页
    'Your two-factor authentication recovery codes have not been downloaded or printed in the last one year. Make sure your recovery codes are up-to-date by viewing and downloading or printing them again.':
      '你的雙重驗證復原碼在過去一年內未曾下載或列印。請重新查看並下載或列印復原碼，確保復原碼是最新的。',
    'Your two-factor authentication recovery codes have not been downloaded or printed in the last one year. Make sure your recovery codes are up-to-date by downloading or printing them again.':
      '你的雙重驗證復原碼在過去一年內未曾下載或列印。請重新下載或列印復原碼，確保復原碼是最新的。',
    'Two-factor recovery codes': '雙重驗證復原碼',
    'New two-factor recovery codes successfully generated. Save them in a safe, durable location and discard your previous codes.':
      '已產生新的雙重驗證復原碼。請將其存放在安全且可長期保留的地方，並捨棄先前的復原碼。',
    // 「such as <a>1Password</a>, …」：例如 前保留一个逗号，否则读不通
    'Keep your recovery codes as safe as your password. We recommend saving them with a password manager such as':
      '請像保護密碼一樣妥善保管復原碼。建議使用密碼管理工具儲存，例如',
    'Keep your recovery codes in a safe spot.': '請將復原碼存放在安全的地方。',
    'These new codes have replaced your old codes. Save them in a safe spot.': '這些新的復原碼已取代舊的復原碼。請存放在安全的地方。',
    'These codes are the last resort for accessing your account in case you lose your password and second factors. If you cannot find these codes, you':
      '這些復原碼是你遺失密碼和第二因素時存取帳號的最後手段。如果找不到這些復原碼，你',
    'lose access to your account.': '無法再存取帳號。',
    'Generate new recovery codes': '產生新的復原碼',
    'When you generate new recovery codes, you must download or print the new codes.': '產生新的復原碼後，必須下載或列印新的復原碼。',
    "Your old codes won't work anymore.": '舊的復原碼將會失效。',
    'Your old codes won’t work anymore.': '舊的復原碼將會失效。',
    'Back to settings': '返回設定',

    // 启用 2FA 向导
    'Enable two-factor authentication (2FA)': '啟用雙重驗證 (2FA)',
    'Setup authenticator app': '設定驗證器應用程式',
    'Set up authenticator app': '設定驗證器應用程式',
    'Setup SMS authentication': '設定簡訊驗證',
    'Alternative 2FA option:': '其他 2FA 方式：',
    'SMS authentication': '簡訊驗證',
    'Download your recovery codes': '下載復原碼',
    'Save your recovery codes': '儲存復原碼',
    'You can use recovery codes as a second factor to authenticate in case you lose access to your device. We recommend saving them with a secure password manager such as':
      '無法使用裝置時，你可以用復原碼作為第二因素來驗證身分。建議使用安全的密碼管理工具儲存，例如',
    'Keep your recovery codes in a safe spot': '請將復原碼存放在安全的地方',
    "If you lose your device and don't have the recovery codes, you will lose access to your account.":
      '如果遺失裝置又沒有復原碼，你將無法存取帳號。',
    'If you lose your device and don’t have the recovery codes, you will lose access to your account.':
      '如果遺失裝置又沒有復原碼，你將無法存取帳號。',
    'I have saved my recovery codes': '我已儲存復原碼',
    'Two-factor authentication (2FA) is now enabled for your GitHub account': '你的 GitHub 帳號已啟用雙重驗證 (2FA)',
    'You have enabled two-factor authentication using SMS.': '你已使用簡訊啟用雙重驗證。',
    'You have enabled two-factor authentication using your authenticator app.': '你已使用驗證器應用程式啟用雙重驗證。',
    "Don't get locked out, configure additional authentication methods": '避免無法存取帳號，請設定更多身分驗證方式',
    'Don’t get locked out, configure additional authentication methods': '避免無法存取帳號，請設定更多身分驗證方式',
    "Configuring additional authentication methods will help you gain access to your account in case you lose your device and don't have your recovery codes.":
      '設定更多身分驗證方式，可在你遺失裝置又沒有復原碼時協助你存取帳號。',
    'Configuring additional authentication methods will help you gain access to your account in case you lose your device and don’t have your recovery codes.':
      '設定更多身分驗證方式，可在你遺失裝置又沒有復原碼時協助你存取帳號。',
    // 「… installing the GitHub Mobile app for <a>iOS</a> or <a>Android</a> and signing in to your account.」
    'The GitHub Mobile app on your phone can be used as a 2FA method. Enable it by installing the GitHub Mobile app for':
      '手機上的 GitHub 行動版應用程式可作為 2FA 方式。安裝適用於',
    'and signing in to your account.': '的 GitHub 行動版應用程式並登入帳號以啟用。',

    // 2FA 复查
    'Verify your two-factor authentication (2FA) settings': '驗證你的雙重驗證 (2FA) 設定',
    'This is a one-time verification of your recent configured 2FA credentials.': '這是對你最近設定的 2FA 認證資訊所做的一次性驗證。',
    "Make sure that 2FA is correctly configured, and avoid a potential account lockout disaster. If you're having trouble verifying, you'll be able to reconfigure 2FA for your account.":
      '請確認 2FA 設定正確，以免日後無法存取帳號。如果驗證時遇到問題，你可以為帳號重新設定 2FA。',
    'Make sure that 2FA is correctly configured, and avoid a potential account lockout disaster. If you’re having trouble verifying, you’ll be able to reconfigure 2FA for your account.':
      '請確認 2FA 設定正確，以免日後無法存取帳號。如果驗證時遇到問題，你可以為帳號重新設定 2FA。',
    'Verify 2FA now': '立即驗證 2FA',
    // 「You can choose to <a>skip 2FA verification</a> at this moment, …」：at this moment 译作「暫時」，移到链接前
    'You can choose to': '你可以選擇暫時',
    'skip 2FA verification': '略過 2FA 驗證',
    "at this moment, we'll remind you again tomorrow.": '，我們明天會再次提醒你。',
    'at this moment, we’ll remind you again tomorrow.': '，我們明天會再次提醒你。',
    'Verify your 2FA setup tomorrow': '明天再驗證 2FA 設定',
    'Reconfigure 2FA on this account': '為此帳號重新設定 2FA',
    '2FA verification successful!': '2FA 驗證成功！',
    'Keep your recovery codes safe and easy to access': '妥善保管復原碼並確保隨時可取用',
    "As a reminder, recovery codes can be used as a second factor to authenticate in case you lose your device. If you don't have your recovery codes, you may lose access to your account.":
      '提醒你，遺失裝置時可以使用復原碼作為第二因素來驗證身分。如果沒有復原碼，你可能會無法存取帳號。',
    'As a reminder, recovery codes can be used as a second factor to authenticate in case you lose your device. If you don’t have your recovery codes, you may lose access to your account.':
      '提醒你，遺失裝置時可以使用復原碼作為第二因素來驗證身分。如果沒有復原碼，你可能會無法存取帳號。',
    'Not sure where you saved them?': '不確定存放在哪裡？',

    // 强制启用 2FA 提示：句子被 <strong> 拆开（句号随原文）
    'Two-factor authentication (2FA)': '雙重驗證 (2FA)',
    'is required for your GitHub account': '是你的 GitHub 帳號必須啟用的功能',
    'This will only take a minute.': '只需要一分鐘。',
    "Enable 2FA now. You'll be able to continue on with your work right after.": '立即啟用 2FA。完成後馬上就能繼續工作。',
    'Enable 2FA now. You’ll be able to continue on with your work right after.': '立即啟用 2FA。完成後馬上就能繼續工作。',
    'Two-factor authentication adds an': '雙重驗證能為帳號增加一層',
    'additional layer of account security': '額外的安全保護',
    '. It is a proven method of keeping you safe from hackers and account takeover, even if your password is stolen or compromised.':
      '。這是經過證實的方法，即使密碼遭竊或外洩，也能保護你免受駭客入侵和帳號盜用。',
    'Enable 2FA now': '立即啟用 2FA',
    'left to enable 2FA. Take action now to avoid additional interruptions.': '可以啟用 2FA。請立即採取行動，以免再受到干擾。',
    'Remind me tomorrow': '明天提醒我'
  },
  scoped: {
    // 更改密码
    'Change password': '變更密碼',
    OR: '或',
    // 登录方式中的密码行 Password 由 auth 的全站 static 收录
    // 通行密钥、登录方式
    Passkeys: '密碼金鑰',
    Synced: '已同步',
    // 禁用 2FA 确认对话框中 <strong> 内的片段 now required 由 common/site.ts 的全局词条翻译
    // 双因素方法（auth 中的同名词条只在登录页生效）；GitHub Mobile 行的方法名按用户规定译成中文
    'Two-factor methods': '雙重驗證方式',
    'Authenticator app': '驗證器應用程式',
    'SMS/Text message': '簡訊',
    'GitHub Mobile': 'GitHub 行動版',
    'Recovery options': '復原選項',
    Configured: '已設定',
    'Not configured': '未設定',
    Viewed: '已查看',
    Preferred: '偏好',
    Nickname: '暱稱',
    // 按钮
    View: '查看',
    Print: '列印',
    'You have': '你還有'
  },
  regexp: [
    [/^(\d+) devices?$/, '$1 部裝置'],
    [/^(\d+) security keys?$/, '$1 個安全金鑰'],
    // 安全密钥行的数量：1 key
    [/^(\d+) keys?$/, '$1 個金鑰'],
    [/^(\d+) verified emails? configured$/, '已設定 $1 個已驗證的電子郵件'],
    [/^(\d+) passkeys? configured$/, '已設定 $1 個密碼金鑰'],
    [/^(\d+) accounts? connected$/, '已連接 $1 個帳號'],
    [
      new RegExp(`^Added (${TIME_SOURCE}) \\| Last used (${TIME_SOURCE}|never)$`),
      (_, added: string, used: string) => `${joinCjk('新增於', translateTime(added))} | ${usedTime(used)}`
    ],
    [/^Delete [`'"“‘](.+?)[`'"”’] passkey$/, '刪除密碼金鑰「$1」'],
    [/^Are you sure you want to delete your [`'"“‘](.+?)[`'"”’] passkey\?$/, '確定要刪除密碼金鑰「$1」嗎？'],
    [/^You will receive one-time codes at this phone number: (.+)$/, '你會透過此電話號碼收到一次性驗證碼：$1'],
    // 更改密码的校验错误：各项组合多样，逐项翻译后拼接（句号随原文）
    [
      new RegExp(`^Password (${PASSWORD_PART_SOURCE}(?:, ${PASSWORD_PART_SOURCE})*(?:,? and ${PASSWORD_PART_SOURCE})?)(\\.?)$`),
      (_, list: string, dot: string) => `密碼${passwordProblems(list)}${dot ? '。' : ''}`
    ],
    // 强制启用 2FA：日期未被拆开时
    [
      new RegExp(
        `^Because of your contributions on GitHub, two-factor authentication will be required for your account starting (${DATE_SOURCE})\\. Thank you for helping keep the ecosystem safe!$`
      ),
      (_, date: string) =>
        joinCjk(
          joinCjk('由於你在 GitHub 上的貢獻，你的帳號將自', translateTime(date)),
          '起必須啟用雙重驗證。感謝你協助維護生態系統的安全！'
        )
    ],
    // 禁用 2FA 确认对话框的后半句（前半句「Some GitHub users are <strong>now required</strong>」见 static / scoped）
    [
      new RegExp(
        `^to enable two-factor authentication as an additional security measure\\. Your activity on GitHub includes you in this requirement\\. You will need to re-enable two-factor authentication on your account before (${DATE_SOURCE}), otherwise your account will be restricted on that date\\.$`
      ),
      (_, date: string) =>
        joinCjk(
          joinCjk('啟用雙重驗證作為額外的安全措施。根據你在 GitHub 上的活動，你也在此要求範圍內。你必須在', translateTime(date)),
          '之前為帳號重新啟用雙重驗證，否則你的帳號將在當天受到限制。'
        )
    ],
    // 双因素方法各行按钮的无障碍名称：Edit Authenticator app、Add SMS/Text message、View Recovery codes
    [
      new RegExp(`^(${Object.keys(METHOD_ACTIONS).join('|')}) (${Object.keys(METHODS).join('|')})$`),
      (_, action: string, method: string) => methodAction(action, method)
    ]
  ]
} satisfies PageDictionary
