import type { PageDictionary } from '../../../core/types'

/**
 * 登录时的双因素身份验证（/sessions/two-factor/*）、设备验证（/sessions/verified-device）、
 * 帐户恢复（/sessions/recovery）、无密码身份验证提示、帐户恢复设置复查、sudo 确认。
 * sudo 确认对话框出现在设置页等任意页面，相关词条放 static。
 */
export default {
  static: {
    // 双因素身份验证：验证器应用
    'Two-factor authentication': '双因素身份验证',
    'Authentication code': '验证码',
    'More information about Authentication Codes': '关于验证码的更多信息',
    '6-digit code': '6 位验证码',
    'Open the two-factor authenticator (TOTP) app on your mobile device to view your authentication code.':
      '打开移动设备上的双因素身份验证器 (TOTP) 应用查看验证码。',
    'Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code.':
      '打开双因素身份验证器 (TOTP) 应用或浏览器扩展查看验证码。',
    'Use this method for future logins': '以后登录都使用此方法',
    'Future logins on this device will prompt you to use': '此设备以后登录时将默认提示使用',
    'an authentication code': '验证码',
    'Future logins on this device will prompt you to use an authentication code by default.': '此设备以后登录时将默认提示使用验证码。',
    'Having problems?': '遇到问题？',
    'Use your passkey': '使用通行密钥',
    'Use a passkey': '使用通行密钥',
    'Authenticate with GitHub Mobile': '使用 GitHub 移动版验证',
    'Use a recovery code or begin 2FA account recovery': '使用恢复代码或开始 2FA 帐户恢复',
    'Two-factor authentication failed.': '双因素身份验证失败。',
    'Enter two-factor authentication code': '输入双因素验证码',

    // 双因素身份验证：GitHub Mobile（产品名按用户规定译成中文：GitHub Mobile → GitHub 移动版，与 settings-account 一致）
    'We sent you a sign-in request on your GitHub Mobile app. Approve the request to verify your identity.':
      '已向你的 GitHub 移动版应用发送登录请求。批准请求以验证身份。',
    'We sent you a sign-in request on your GitHub Mobile app. Enter the digits shown below to verify your identity.':
      '已向你的 GitHub 移动版应用发送登录请求。输入下方数字以验证身份。',
    'We could not verify your identity': '无法验证你的身份',
    'Unable to verify with GitHub Mobile?': '无法使用 GitHub 移动版验证？',
    'Sign-in request timed out.': '登录请求已超时。',

    // 双因素身份验证：通行密钥
    Passkey: '通行密钥',
    'When you are ready, authenticate using the button below.': '准备就绪后，使用下方按钮验证。',
    'Authenticate using your passkey.': '使用通行密钥验证。',
    'Use passkey': '使用通行密钥',
    '2FA recovery code': '2FA 恢复代码',
    'Authentication failed.': '身份验证失败。',
    'Retry passkey': '重试通行密钥',
    'Unable to verify with your passkey?': '无法使用通行密钥验证？',

    // 双因素身份验证：恢复代码
    'Two-factor recovery': '双因素恢复',
    'Recovery code': '恢复代码',
    'If you are unable to access your mobile device, enter one of your recovery codes to verify your identity.':
      '如果无法使用移动设备，请输入一个恢复代码以验证身份。',
    "Don't have a recovery code?": '没有恢复代码？',
    'Don’t have a recovery code?': '没有恢复代码？',
    'Where to find recovery codes': '在哪里找到恢复代码',
    'Locked out?': '无法访问帐户？',
    // unlink → 取消链接（GLOSSARY link 行，与 common-ui、packages、sponsors 一致）
    'Try recovering your account, or unlink your account email address(es)': '尝试恢复帐户，或取消链接帐户电子邮件地址',

    // 恢复帐户对话框
    'Recovering your account': '恢复你的帐户',
    'If you can’t access a verified device or recovery codes you can request a reset of your authentication settings. For security reasons':
      '如果无法使用已验证的设备或恢复代码，可以请求重置身份验证设置。出于安全原因，',
    "If you can't access a verified device or recovery codes you can request a reset of your authentication settings. For security reasons":
      '如果无法使用已验证的设备或恢复代码，可以请求重置身份验证设置。出于安全原因，',
    'this can take 1-3 days': '这可能需要 1-3 天',
    'Verify an email associated with this account.': '验证与此帐户关联的电子邮件。',
    'Verify a device, SSH key or personal access token.': '验证设备、SSH 密钥或个人访问令牌。',
    'GitHub support will review your request': 'GitHub 支持团队将审查你的请求',
    'within 1-3 days': '1-3 天内',
    'I understand, get started': '我已了解，开始',

    // 帐户恢复 /sessions/recovery
    'Account recovery': '帐户恢复',
    'The account recovery process can take 1-3 business days. We recommend one of the following if possible.':
      '帐户恢复可能需要 1-3 个工作日。如有可能，建议使用以下方式之一。',
    'Enter a recovery code': '输入恢复代码',
    'The file containing your recovery codes may exist on your computer - check for a file named':
      '恢复代码文件可能保存在你的电脑上 - 请查找文件',
    'It looks like you have a GitHub Mobile session that could be used for two-factor authentication. If you have access to your mobile device, you may be able to use it to login.':
      '你有可用于双因素身份验证的 GitHub 移动版会话。如果能使用移动设备，可以用它登录。',
    'First we need to verify an email address': '首先需要验证电子邮件地址',
    'by sending a one-time password to all addresses associated with this account.':
      '，我们会向此帐户关联的所有电子邮件地址发送一次性密码。',
    'Send one-time password': '发送一次性密码',
    'Recovery email sent': '恢复电子邮件已发送',
    'One-time password': '一次性密码',
    'Verify email address': '验证电子邮件地址',
    'We sent an email to all addresses associated with this account containing a one-time password.':
      '已向此帐户关联的所有电子邮件地址发送包含一次性密码的电子邮件。',
    'Next we need to verify an alternative factor.': '接下来需要验证另一个因素。',
    'This can be a verified device, an SSH key or a personal access token associated with this account.':
      '可以是与此帐户关联的已验证设备、SSH 密钥或个人访问令牌。',
    'Verify with this device': '使用此设备验证',
    'Cannot verify this device': '无法验证此设备',
    'SSH key': 'SSH 密钥',
    'Personal access token': '个人访问令牌',
    'Unable to verify an alternative factor?': '无法验证其他因素？',
    'Begin account or email recovery': '开始帐户或电子邮件恢复',
    'Verify a personal access token': '验证个人访问令牌',
    "you've used in the past to verify your account. The token must have": '（过去使用过的）以验证帐户。令牌须具有',
    'you’ve used in the past to verify your account. The token must have': '（过去使用过的）以验证帐户。令牌须具有',
    'Verify and submit for review': '验证并提交审查',
    'Unable to verify personal access token': '无法验证个人访问令牌',

    // 设备验证 /sessions/verified-device
    'Device verification': '设备验证',
    'Device Verification Code': '设备验证码',
    'Having trouble verifying via email?': '通过电子邮件验证遇到问题？',
    'Re-send the authentication code': '重新发送验证码',
    'Try GitHub Mobile for simplified device verification': '试用 GitHub 移动版简化设备验证',
    "If you'd like to require verification on every sign in, consider enabling": '如需每次登录都验证，可考虑为帐户启用',
    'If you’d like to require verification on every sign in, consider enabling': '如需每次登录都验证，可考虑为帐户启用',
    'Incorrect verification code provided.': '验证码错误。',

    // 无密码身份验证提示 /sessions/trusted-device
    'Configure passwordless authentication': '配置无密码身份验证',
    'Add a passkey': '添加通行密钥',
    'Your device supports passkeys, a password replacement that validates your identity using touch, facial recognition, a device password, or a PIN.':
      '你的设备支持通行密钥。通行密钥可替代密码，通过触摸、面部识别、设备密码或 PIN 验证身份。',
    'Passkeys can be used for sign-in as a simple and secure alternative to your password and two-factor credentials.':
      '通行密钥可用于登录，简单安全地替代密码和双因素凭据。',
    'Add passkey': '添加通行密钥',
    'Passkey registration failed.': '通行密钥注册失败。',
    'Not interested?': '不感兴趣？',
    "Don't ask again for this browser": '此浏览器不再询问',
    'Don’t ask again for this browser': '此浏览器不再询问',
    'Successfully added a passkey': '已添加通行密钥',
    'From now on, you can use this passkey to sign-in to GitHub.': '今后可使用此通行密钥登录 GitHub。',
    'Passkey nickname': '通行密钥昵称',

    // 帐户恢复设置复查
    'Confirm your account recovery settings': '确认帐户恢复设置',
    'Are your account recovery settings up to date? If not, you risk getting locked out of your account.':
      '你的帐户恢复设置是否为最新？否则可能无法访问帐户。',
    'View and update your email addresses': '查看并更新电子邮件地址',
    'Verified emails give you access to more features on GitHub.': '验证电子邮件后可使用 GitHub 的更多功能。',
    'Unverified emails cannot receive notifications or be used to reset your password.': '未验证电子邮件无法接收通知，也不能用于重置密码。',
    'Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a device password, or a PIN. They can be used as a password replacement or as a 2FA method.':
      '通行密钥是 WebAuthn 凭据，通过触摸、面部识别、设备密码或 PIN 验证身份，可替代密码或用作 2FA 方法。',
    'Your preferred 2FA method is': '你的首选 2FA 方法为',
    'Use an authentication app or browser extension to get two-factor authentication codes when prompted.':
      '使用身份验证应用或浏览器扩展，按提示获取双因素验证码。',
    'You will receive one-time codes at this phone number:': '你将通过此号码接收一次性验证码：',
    'Security keys': '安全密钥',
    'Security keys are hardware devices that can be used as your second factor of authentication.':
      '安全密钥是硬件设备，可用作身份验证的第二因素。',
    'GitHub Mobile can be used for two-factor authentication by installing the GitHub Mobile app and signing in to your account.':
      '安装 GitHub 移动版应用并登录帐户后，即可用于双因素身份验证。',
    'Recovery codes': '恢复代码',
    'Recovery codes can be used to access your account in the event you lose access to your device and cannot receive two-factor authentication codes.':
      '无法使用设备、收不到双因素验证码时，可用恢复代码访问帐户。',

    // sudo 确认
    'Confirm access': '确认访问',
    'Confirm password to continue': '确认密码以继续',
    'Confirm password': '确认密码',
    'More information about sudo mode authentication': '关于 sudo 模式身份验证的更多信息',
    'Your authentication code has been sent.': '验证码已发送。',
    // sudo 确认的 GitHub 移动版标题与帐户恢复设置复查的方法名（产品名按用户规定译成中文；settings 页另有同值 scoped）
    'GitHub Mobile': 'GitHub 移动版',
    'Use GitHub Mobile': '使用 GitHub 移动版',
    'Use your authenticator app': '使用身份验证器应用',
    'Send a code via email': '通过电子邮件发送验证码',
    'Send a code via SMS': '通过短信发送验证码',
    'Resend SMS': '重新发送短信',
    'Use your password': '使用密码',
    'Creating a verification request for your GitHub Mobile app.': '正在为你的 GitHub 移动版应用创建验证请求。',
    'When your phone is ready, click the button below.': '手机准备就绪后，单击下方按钮。',
    'We sent you a verification request on your GitHub Mobile app. Enter the digits shown below to enter sudo mode.':
      '已向你的 GitHub 移动版应用发送验证请求。输入下方数字进入 sudo 模式。',
    'We sent you a verification request on your GitHub Mobile app. Approve the request to enter sudo mode.':
      '已向你的 GitHub 移动版应用发送验证请求。批准请求以进入 sudo 模式。',
    'We just sent you a message via SMS with your authentication code. Enter the code in the form above to verify your identity.':
      '已通过短信向你发送验证码。在上方表单中输入验证码以验证身份。',
    // sudo 确认：电子邮件验证。含电子邮件地址的整句（Enter the verification code sent to …）要全站生效，放在 common/dialogs.ts 的 regexp
    'Verify via email': '通过电子邮件验证',
    'When you are ready, trigger a mailer to verify your identity.': '准备就绪后，发送电子邮件以验证身份。',
    'Enter the verification code': '输入验证码',
    'Verifying…': '验证中…',
    'You are entering': '你正在进入',
    'sudo mode': 'sudo 模式',
    ". After you've performed a sudo-protected action, you'll only be asked to re-authenticate again after a few hours of inactivity.":
      '。执行受 sudo 保护的操作后，只有在数小时无操作后才会再次要求验证。',
    '. After you’ve performed a sudo-protected action, you’ll only be asked to re-authenticate again after a few hours of inactivity.':
      '。执行受 sudo 保护的操作后，只有在数小时无操作后才会再次要求验证。'
  },
  scoped: {
    Verify: '验证',
    Verifying: '验证中',
    Retry: '重试',
    Email: '电子邮件',
    Confirm: '确认',
    Configured: '已配置',
    'Not configured': '未配置',
    Viewed: '已查看',
    'Continue...': '继续...',
    'Continue…': '继续…',
    // 「…consider enabling <two-factor authentication> on your account.」
    'on your account.': '。',
    // 「…prompt you to use <an authentication code> by default.」
    'by default.': '。',
    // 帐户恢复页片段
    'or verify a': '或验证',
    scope: '作用域',
    'scope.': '作用域。',
    'More options': '更多选项',
    'Remind me later': '稍后提醒',
    'Make changes': '更改',
    'Ask me later': '稍后询问',
    'No devices': '暂无设备',
    'Resend email': '重新发送电子邮件',
    'Authenticator app': '身份验证器应用',
    'SMS/Text message': '短信',
    'Recovery options': '恢复选项',
    'Two-factor methods': '双因素方法',
    'SMS number': '短信号码',
    Passkeys: '通行密钥',
    Emails: '电子邮件',
    'Verified emails': '已验证电子邮件',
    'Unverified emails': '未验证电子邮件',
    'Password Alternatives': '密码替代方式'
  },
  regexp: [
    // 恢复帐户对话框步骤
    [/^Step (\d)$/, '第 $1 步'],
    // 设备验证：通过电子邮件发送的验证码
    [
      /^We just sent your authentication code via email to (\S+@\S+)\. The code will expire at (.+)\.$/,
      '验证码已通过电子邮件发送至 $1，将于 $2 过期。'
    ],
    // 帐户恢复设置复查：计数
    [/^(\d+) verified emails?$/, '$1 个已验证电子邮件'],
    [/^(\d+) unverified emails?$/, '$1 个未验证电子邮件'],
    [/^(\d+) keys?$/, '$1 个密钥'],
    [/^(\d+) devices?$/, '$1 台设备'],
    [/^You will receive one-time codes at this phone number: (.+)$/, '你将通过此号码接收一次性验证码：$1']
  ]
} satisfies PageDictionary
