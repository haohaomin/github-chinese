import type { PageDictionary } from '../../../core/types'

/**
 * 登录时的双因素身份验证（/sessions/two-factor/*）、设备验证（/sessions/verified-device）、
 * 帐户恢复（/sessions/recovery）、无密码身份验证提示、帐户恢复设置复查、sudo 确认。
 * sudo 确认对话框出现在设置页等任意页面，相关词条放 static。
 */
export default {
  static: {
    // 双因素身份验证：验证器应用
    'Two-factor authentication': '雙重驗證',
    'Authentication code': '驗證碼',
    'More information about Authentication Codes': '關於驗證碼的詳細資訊',
    '6-digit code': '6 位數驗證碼',
    'Open the two-factor authenticator (TOTP) app on your mobile device to view your authentication code.':
      '開啟行動裝置上的雙重驗證器 (TOTP) 應用程式以查看驗證碼。',
    'Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code.':
      '開啟雙重驗證器 (TOTP) 應用程式或瀏覽器擴充功能以查看驗證碼。',
    'Use this method for future logins': '日後登入都使用此方式',
    'Future logins on this device will prompt you to use': '日後在此裝置登入時預設會提示你使用',
    'an authentication code': '驗證碼',
    'Future logins on this device will prompt you to use an authentication code by default.':
      '日後在此裝置登入時，預設會提示你使用驗證碼。',
    'Having problems?': '遇到問題嗎？',
    'Use your passkey': '使用你的密碼金鑰',
    'Use a passkey': '使用密碼金鑰',
    'Authenticate with GitHub Mobile': '使用 GitHub 行動版驗證',
    'Use a recovery code or begin 2FA account recovery': '使用復原碼或開始 2FA 帳號復原',
    'Two-factor authentication failed.': '雙重驗證失敗。',
    'Enter two-factor authentication code': '輸入雙重驗證碼',

    // 双因素身份验证：GitHub Mobile（产品名按用户规定译成中文：GitHub Mobile → GitHub 行動版，与 settings-account 一致）
    'We sent you a sign-in request on your GitHub Mobile app. Approve the request to verify your identity.':
      '我們已向你的 GitHub 行動版應用程式傳送登入請求。核准請求以驗證你的身分。',
    'We sent you a sign-in request on your GitHub Mobile app. Enter the digits shown below to verify your identity.':
      '我們已向你的 GitHub 行動版應用程式傳送登入請求。輸入下方顯示的數字以驗證你的身分。',
    'We could not verify your identity': '無法驗證你的身分',
    'Unable to verify with GitHub Mobile?': '無法使用 GitHub 行動版驗證？',
    'Sign-in request timed out.': '登入請求已逾時。',

    // 双因素身份验证：通行密钥
    Passkey: '密碼金鑰',
    'When you are ready, authenticate using the button below.': '準備就緒後，使用下方按鈕驗證。',
    'Authenticate using your passkey.': '使用密碼金鑰驗證。',
    'Use passkey': '使用密碼金鑰',
    '2FA recovery code': '2FA 復原碼',
    'Authentication failed.': '身分驗證失敗。',
    'Retry passkey': '重試密碼金鑰',
    'Unable to verify with your passkey?': '無法使用密碼金鑰驗證？',

    // 双因素身份验证：恢复代码
    'Two-factor recovery': '雙重驗證復原',
    'Recovery code': '復原碼',
    'If you are unable to access your mobile device, enter one of your recovery codes to verify your identity.':
      '如果無法使用行動裝置，請輸入其中一組復原碼以驗證你的身分。',
    "Don't have a recovery code?": '沒有復原碼嗎？',
    'Don’t have a recovery code?': '沒有復原碼嗎？',
    'Where to find recovery codes': '在哪裡找到復原碼',
    'Locked out?': '無法存取帳號？',
    // unlink → 取消連結（GLOSSARY.zh-TW link 行）
    'Try recovering your account, or unlink your account email address(es)': '嘗試復原帳號，或取消連結帳號的電子郵件地址',

    // 恢复帐户对话框
    'Recovering your account': '復原你的帳號',
    'If you can’t access a verified device or recovery codes you can request a reset of your authentication settings. For security reasons':
      '如果無法使用已驗證的裝置或復原碼，可以申請重設身分驗證設定。基於安全考量，',
    "If you can't access a verified device or recovery codes you can request a reset of your authentication settings. For security reasons":
      '如果無法使用已驗證的裝置或復原碼，可以申請重設身分驗證設定。基於安全考量，',
    'this can take 1-3 days': '這可能需要 1-3 天',
    'Verify an email associated with this account.': '驗證與此帳號關聯的電子郵件。',
    'Verify a device, SSH key or personal access token.': '驗證裝置、SSH 金鑰或個人存取權杖。',
    // 「GitHub support will review your request <strong>within 1-3 days</strong>.」拼成「…審查你的請求預計 1-3 天內完成。」
    'GitHub support will review your request': 'GitHub 支援團隊審查你的請求',
    'within 1-3 days': '預計 1-3 天內完成',
    'I understand, get started': '我瞭解，開始',

    // 帐户恢复 /sessions/recovery
    'Account recovery': '帳號復原',
    'The account recovery process can take 1-3 business days. We recommend one of the following if possible.':
      '帳號復原流程可能需要 1-3 個工作天。如果可以，建議改用下列其中一種方式。',
    'Enter a recovery code': '輸入復原碼',
    'The file containing your recovery codes may exist on your computer - check for a file named':
      '復原碼檔案可能存放在你的電腦上 - 請尋找檔案',
    'It looks like you have a GitHub Mobile session that could be used for two-factor authentication. If you have access to your mobile device, you may be able to use it to login.':
      '你似乎有可用於雙重驗證的 GitHub 行動版工作階段。如果你能使用行動裝置，或許可以用它登入。',
    'First we need to verify an email address': '首先需要驗證電子郵件地址',
    'by sending a one-time password to all addresses associated with this account.':
      '，我們會向此帳號關聯的所有電子郵件地址傳送一次性密碼。',
    'Send one-time password': '傳送一次性密碼',
    'Recovery email sent': '已傳送復原電子郵件',
    'One-time password': '一次性密碼',
    'Verify email address': '驗證電子郵件地址',
    'We sent an email to all addresses associated with this account containing a one-time password.':
      '我們已向此帳號關聯的所有電子郵件地址傳送含有一次性密碼的電子郵件。',
    'Next we need to verify an alternative factor.': '接下來需要驗證另一個因素。',
    'This can be a verified device, an SSH key or a personal access token associated with this account.':
      '可以是與此帳號關聯的已驗證裝置、SSH 金鑰或個人存取權杖。',
    'Verify with this device': '使用此裝置驗證',
    'Cannot verify this device': '無法驗證此裝置',
    'SSH key': 'SSH 金鑰',
    'Personal access token': '個人存取權杖',
    'Unable to verify an alternative factor?': '無法驗證其他因素？',
    'Begin account or email recovery': '開始帳號或電子郵件復原',
    'Verify a personal access token': '驗證個人存取權杖',
    "you've used in the past to verify your account. The token must have": '（須為你過去用過的）以驗證帳號。權杖必須具有',
    'you’ve used in the past to verify your account. The token must have': '（須為你過去用過的）以驗證帳號。權杖必須具有',
    'Verify and submit for review': '驗證並送出審查',
    'Unable to verify personal access token': '無法驗證個人存取權杖',

    // 设备验证 /sessions/verified-device
    'Device verification': '裝置驗證',
    'Device Verification Code': '裝置驗證碼',
    'Having trouble verifying via email?': '透過電子郵件驗證時遇到問題？',
    'Re-send the authentication code': '重新傳送驗證碼',
    'Try GitHub Mobile for simplified device verification': '試用 GitHub 行動版以簡化裝置驗證',
    "If you'd like to require verification on every sign in, consider enabling": '如果希望每次登入都要驗證，可考慮為帳號啟用',
    'If you’d like to require verification on every sign in, consider enabling': '如果希望每次登入都要驗證，可考慮為帳號啟用',
    'Incorrect verification code provided.': '驗證碼不正確。',

    // 无密码身份验证提示 /sessions/trusted-device
    'Configure passwordless authentication': '設定無密碼身分驗證',
    'Add a passkey': '新增密碼金鑰',
    'Your device supports passkeys, a password replacement that validates your identity using touch, facial recognition, a device password, or a PIN.':
      '你的裝置支援密碼金鑰。密碼金鑰可取代密碼，透過觸控、臉部辨識、裝置密碼或 PIN 碼驗證你的身分。',
    'Passkeys can be used for sign-in as a simple and secure alternative to your password and two-factor credentials.':
      '密碼金鑰可用於登入，簡單又安全地取代密碼和雙重驗證認證資訊。',
    'Add passkey': '新增密碼金鑰',
    'Passkey registration failed.': '密碼金鑰註冊失敗。',
    'Not interested?': '沒有興趣？',
    "Don't ask again for this browser": '此瀏覽器不再詢問',
    'Don’t ask again for this browser': '此瀏覽器不再詢問',
    'Successfully added a passkey': '已新增密碼金鑰',
    'From now on, you can use this passkey to sign-in to GitHub.': '從現在起，你可以使用此密碼金鑰登入 GitHub。',
    'Passkey nickname': '密碼金鑰暱稱',

    // 帐户恢复设置复查
    'Confirm your account recovery settings': '確認你的帳號復原設定',
    'Are your account recovery settings up to date? If not, you risk getting locked out of your account.':
      '你的帳號復原設定是最新的嗎？如果不是，你可能會無法存取帳號。',
    'View and update your email addresses': '查看並更新你的電子郵件地址',
    'Verified emails give you access to more features on GitHub.': '已驗證的電子郵件可讓你使用 GitHub 的更多功能。',
    'Unverified emails cannot receive notifications or be used to reset your password.':
      '未驗證的電子郵件無法接收通知，也無法用來重設密碼。',
    'Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a device password, or a PIN. They can be used as a password replacement or as a 2FA method.':
      '密碼金鑰是 WebAuthn 認證資訊，透過觸控、臉部辨識、裝置密碼或 PIN 碼驗證你的身分，可用來取代密碼或作為 2FA 方式。',
    'Your preferred 2FA method is': '你偏好的 2FA 方式為',
    'Use an authentication app or browser extension to get two-factor authentication codes when prompted.':
      '出現提示時，使用驗證應用程式或瀏覽器擴充功能取得雙重驗證碼。',
    'You will receive one-time codes at this phone number:': '你會透過此電話號碼收到一次性驗證碼：',
    'Security keys': '安全金鑰',
    'Security keys are hardware devices that can be used as your second factor of authentication.':
      '安全金鑰是硬體裝置，可作為身分驗證的第二因素。',
    'GitHub Mobile can be used for two-factor authentication by installing the GitHub Mobile app and signing in to your account.':
      '安裝 GitHub 行動版應用程式並登入帳號後，可將 GitHub 行動版用於雙重驗證。',
    'Recovery codes': '復原碼',
    'Recovery codes can be used to access your account in the event you lose access to your device and cannot receive two-factor authentication codes.':
      '無法使用裝置、也收不到雙重驗證碼時，可以用復原碼存取帳號。',

    // sudo 确认
    'Confirm access': '確認存取',
    'Confirm password to continue': '確認密碼以繼續',
    'Confirm password': '確認密碼',
    'More information about sudo mode authentication': '關於 sudo 模式身分驗證的詳細資訊',
    'Your authentication code has been sent.': '已傳送驗證碼。',
    // sudo 确认的 GitHub 行動版标题与帐户恢复设置复查的方法名（产品名按用户规定译成中文；settings 页另有同值 scoped）
    'GitHub Mobile': 'GitHub 行動版',
    'Use GitHub Mobile': '使用 GitHub 行動版',
    'Use your authenticator app': '使用驗證器應用程式',
    'Send a code via email': '透過電子郵件傳送驗證碼',
    'Send a code via SMS': '透過簡訊傳送驗證碼',
    'Resend SMS': '重新傳送簡訊',
    'Use your password': '使用密碼',
    'Creating a verification request for your GitHub Mobile app.': '正在為你的 GitHub 行動版應用程式建立驗證請求。',
    'When your phone is ready, click the button below.': '手機準備就緒後，按一下下方按鈕。',
    'We sent you a verification request on your GitHub Mobile app. Enter the digits shown below to enter sudo mode.':
      '我們已向你的 GitHub 行動版應用程式傳送驗證請求。輸入下方顯示的數字以進入 sudo 模式。',
    'We sent you a verification request on your GitHub Mobile app. Approve the request to enter sudo mode.':
      '我們已向你的 GitHub 行動版應用程式傳送驗證請求。核准請求以進入 sudo 模式。',
    'We just sent you a message via SMS with your authentication code. Enter the code in the form above to verify your identity.':
      '我們剛透過簡訊將驗證碼傳送給你。在上方表單輸入驗證碼以驗證你的身分。',
    // sudo 确认：电子邮件验证。含电子邮件地址的整句（Enter the verification code sent to …）要全站生效，放在 common/dialogs.ts 的 regexp
    'Verify via email': '透過電子郵件驗證',
    'When you are ready, trigger a mailer to verify your identity.': '準備就緒後，傳送電子郵件以驗證你的身分。',
    'Enter the verification code': '輸入驗證碼',
    'Verifying…': '驗證中…',
    'You are entering': '你正在進入',
    'sudo mode': 'sudo 模式',
    ". After you've performed a sudo-protected action, you'll only be asked to re-authenticate again after a few hours of inactivity.":
      '。執行受 sudo 保護的動作後，只有在閒置數小時後才會再次要求你重新驗證。',
    '. After you’ve performed a sudo-protected action, you’ll only be asked to re-authenticate again after a few hours of inactivity.':
      '。執行受 sudo 保護的動作後，只有在閒置數小時後才會再次要求你重新驗證。'
  },
  scoped: {
    Verify: '驗證',
    Verifying: '驗證中',
    Retry: '重試',
    Email: '電子郵件',
    Confirm: '確認',
    Configured: '已設定',
    'Not configured': '未設定',
    Viewed: '已查看',
    'Continue...': '繼續...',
    'Continue…': '繼續…',
    // 「…consider enabling <two-factor authentication> on your account.」
    'on your account.': '。',
    // 「…prompt you to use <an authentication code> by default.」
    'by default.': '。',
    // 帐户恢复页片段
    'or verify a': '或驗證',
    scope: '範圍',
    'scope.': '範圍。',
    'More options': '更多選項',
    'Remind me later': '稍後提醒我',
    'Make changes': '變更',
    'Ask me later': '稍後再問我',
    'No devices': '沒有裝置',
    'Resend email': '重新傳送電子郵件',
    'Authenticator app': '驗證器應用程式',
    'SMS/Text message': '簡訊',
    'Recovery options': '復原選項',
    'Two-factor methods': '雙重驗證方式',
    'SMS number': '手機號碼',
    Passkeys: '密碼金鑰',
    Emails: '電子郵件',
    'Verified emails': '已驗證的電子郵件',
    'Unverified emails': '未驗證的電子郵件',
    'Password Alternatives': '密碼替代方式'
  },
  regexp: [
    // 恢复帐户对话框步骤
    [/^Step (\d)$/, '第 $1 步'],
    // 设备验证：通过电子邮件发送的验证码
    [
      /^We just sent your authentication code via email to (\S+@\S+)\. The code will expire at (.+)\.$/,
      '驗證碼已透過電子郵件傳送至 $1，將於 $2 到期。'
    ],
    // 帐户恢复设置复查：计数
    [/^(\d+) verified emails?$/, '$1 個已驗證的電子郵件'],
    [/^(\d+) unverified emails?$/, '$1 個未驗證的電子郵件'],
    [/^(\d+) keys?$/, '$1 個金鑰'],
    // 设备的量词用「部」（GLOSSARY.zh-TW 第 2 节：`2 部裝置`）
    [/^(\d+) devices?$/, '$1 部裝置'],
    [/^You will receive one-time codes at this phone number: (.+)$/, '你會透過此電話號碼收到一次性驗證碼：$1']
  ]
} satisfies PageDictionary
