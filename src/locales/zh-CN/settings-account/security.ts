import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/** “Added Oct 1, 2024 | Last used Oct 26, 2025” 中的时间：never → 从未 */
function usedTime(time: string): string {
  return time === 'never' ? '从未使用' : joinCjk(translateTime(time), '使用')
}

/** 双因素方法各行按钮的动作与方法名（“Edit Authenticator app”“Show GitHub Mobile”） */
const METHOD_ACTIONS: Readonly<Record<string, string>> = {
  Add: '添加',
  Edit: '编辑',
  Show: '显示',
  Hide: '隐藏',
  View: '查看'
}
const METHODS: Readonly<Record<string, string>> = {
  'Authenticator app': '身份验证器应用',
  'SMS/Text message': '短信',
  'Security keys': '安全密钥',
  // 产品名按用户规定译成中文：GitHub Mobile → GitHub 移动版
  'GitHub Mobile': 'GitHub 移动版',
  'Recovery codes': '恢复代码'
}

/** 动作与方法名相接，方法名是英文时中间加空格 */
function methodAction(action: string, method: string): string {
  return joinCjk(METHOD_ACTIONS[action] ?? action, METHODS[method] ?? method)
}

/** 密码校验错误的各项（不含开头的 Password） */
const PASSWORD_PART_SOURCE =
  "(?:is too short \\(minimum is \\d+ characters\\)|is too long \\(maximum is \\d+ characters\\)|needs at least (?:1|one) (?:number|lowercase letter)|cannot include your login|is in a list of passwords commonly used on other websites|can['’]t be blank|is invalid)"

const PASSWORD_PARTS: readonly (readonly [RegExp, string])[] = [
  [/^is too short \(minimum is (\d+) characters\)$/, '太短（最少 $1 个字符）'],
  [/^is too long \(maximum is (\d+) characters\)$/, '太长（最多 $1 个字符）'],
  [/^needs at least (?:1|one) number$/, '至少需要 1 个数字'],
  [/^needs at least (?:1|one) lowercase letter$/, '至少需要 1 个小写字母'],
  [/^cannot include your login$/, '不能包含你的登录名'],
  [/^is in a list of passwords commonly used on other websites$/, '在其他网站的常用密码列表中'],
  [/^can['’]t be blank$/, '不能为空'],
  [/^is invalid$/, '无效']
]

/**
 * 密码校验错误的各项拼成一句：两项用“且”，三项以上用“，”并在最后一项前加“且”。
 * “is too short (minimum is 8 characters), needs at least 1 number, and cannot include your login”
 * → “太短（最少 8 个字符），至少需要 1 个数字，且不能包含你的登录名”
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
 * 安全密钥、GitHub 移动版、恢复选项）；恢复代码页（/settings/auth/recovery-codes）；启用 2FA 向导
 * （/settings/two_factor_authentication/setup/…）；2FA 复查与强制启用提示。
 * auth 已收录的 static（Two-factor authentication、Security keys、Recovery codes、Add a passkey、部分支持通行密钥提示、
 * Waiting for input from browser interaction… 等）不再重复；
 * auth 中只在登录页生效的 scoped（Authenticator app、SMS/Text message 等）在此补 scoped。
 */
export default {
  static: {
    // 双因素身份验证已启用时访问设置向导的提示
    'Two-factor authentication is already enabled, You can manage your configuration from this page.':
      '双因素身份验证已启用，可在此页面管理配置。',
    // 更改密码：要求说明被 <strong> 拆开
    'Old password': '旧密码',
    'New password': '新密码',
    'Confirm new password': '确认新密码',
    "Make sure it's": '请确保密码',
    'Make sure it’s': '请确保密码',
    'at least 15 characters': '至少 15 个字符',
    'at least 8 characters': '至少 8 个字符',
    'including a number': '且包含数字',
    'and a lowercase letter': '和小写字母',
    'Update password': '更新密码',
    'I forgot my password': '我忘记了密码',
    'Password changed successfully.': '密码已更改。',
    'Strengthen your account by ensuring your password is strong.': '通过设置高强度密码增强帐户安全。',
    'Learn more about creating a strong password': '了解如何创建高强度密码',
    // 「Learn more」链接的无障碍名称
    'Learn more about strong passwords': '了解高强度密码',
    'Password is too short (minimum is 8 characters)': '密码太短（最少 8 个字符）',
    'Password is too short (minimum is 8 characters) and is in a list of passwords commonly used on other websites':
      '密码太短（最少 8 个字符）且在其他网站的常用密码列表中',
    'Password needs at least 1 lowercase letter and is in a list of passwords commonly used on other websites':
      '密码至少需要 1 个小写字母且在其他网站的常用密码列表中',
    'Password is too short (minimum is 8 characters), needs at least 1 lowercase letter, and is in a list of passwords commonly used on other websites':
      '密码太短（最少 8 个字符），至少需要 1 个小写字母，且在其他网站的常用密码列表中',
    'Password is too short (minimum is 8 characters), needs at least 1 lowercase letter, cannot include your login, and is in a list of passwords commonly used on other websites':
      '密码太短（最少 8 个字符），至少需要 1 个小写字母，不能包含你的登录名，且在其他网站的常用密码列表中',
    'Password is too short (minimum is 8 characters), needs at least 1 number, cannot include your login, and is in a list of passwords commonly used on other websites':
      '密码太短（最少 8 个字符），至少需要 1 个数字，不能包含你的登录名，且在其他网站的常用密码列表中',
    "Password confirmation doesn't match the password": '两次输入的密码不一致',
    'Password confirmation doesn’t match the password': '两次输入的密码不一致',
    'Old password isn’t valid': '旧密码无效',
    "Old password isn't valid": '旧密码无效',

    // 通行密钥（原文没有的逗号不加，用定语代替）
    'Passwordless sign-in with passkeys': '使用通行密钥免密码登录',
    'Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a device password, or a PIN. They can be used as a password replacement or as a 2FA method. Passkeys can be used for sign-in as a simple and secure alternative to your password and two-factor credentials.':
      '通行密钥是通过触摸、面部识别、设备密码或 PIN 验证身份的 WebAuthn 凭据。它们可替代密码或用作 2FA 方法。通行密钥可用于登录以简单安全地替代密码和双因素凭据。',
    'This browser or device does not fully support passkeys - you may be able to use a passkey from another device.':
      '此浏览器或设备不完全支持通行密钥，你也许可以使用其他设备上的通行密钥。',
    'Learn more about passkeys': '了解通行密钥',
    'Your passkeys': '你的通行密钥',
    'Edit passkey nickname': '编辑通行密钥昵称',
    'Delete passkey?': '删除通行密钥？',
    'You will no longer be able to use it to sign-in to your account.': '你将无法再用它登录帐户。',
    "Note: You may continue to see this passkey as an option during sign-in until you also delete it from your browser, device or associated account's password management settings.":
      '注意：登录时可能仍会看到此通行密钥选项直到你也从浏览器、设备或关联帐户的密码管理设置中将其删除。',
    'Note: You may continue to see this passkey as an option during sign-in until you also delete it from your browser, device or associated account’s password management settings.':
      '注意：登录时可能仍会看到此通行密钥选项直到你也从浏览器、设备或关联帐户的密码管理设置中将其删除。',
    'Deleting…': '删除中…',
    'Seen from this browser': '在此浏览器中使用过',
    'Upgrade to a passkey': '升级为通行密钥',
    'Upgrade to passkey': '升级为通行密钥',
    'Upgrade your security key registration to a passkey': '将安全密钥注册升级为通行密钥',

    // 登录方式
    'Sign in methods': '登录方式',
    'Passwordless sign-in with biometrics or security keys': '使用生物识别或安全密钥免密码登录',
    'Sign in with your Google account': '使用 Google 帐户登录',
    'Sign in with your Apple account': '使用 Apple 帐户登录',
    'Google sign in method dropdown': 'Google 登录方式下拉菜单',

    // 双因素身份验证
    'You can now manage your two-factor authentication methods from this page.': '现在可以在此页面管理双因素身份验证方法。',
    'Two-factor authentication successfully disabled.': '已禁用双因素身份验证。',
    'SMS/Text message successfully configured.': '已配置短信。',
    'SMS/Text message successfully disabled.': '已禁用短信。',
    'Authenticator app successfully reconfigured.': '已重新配置身份验证器应用。',
    'Two-factor authentication is not enabled yet.': '尚未启用双因素身份验证。',
    'Enable two-factor authentication': '启用双因素身份验证',
    // 双因素身份验证管理页的标签页标题
    'Manage two-factor authentication': '管理双因素身份验证',
    'Disable two-factor authentication': '禁用双因素身份验证',
    // 禁用 2FA 的确认对话框：「Some GitHub users are <strong>now required</strong> to enable …」（后半句见正则）
    'Are you sure you want to disable two-factor authentication?': '确定要禁用双因素身份验证吗？',
    'Some GitHub users are': '部分 GitHub 用户',
    'GitHub highly recommends that you keep two-factor authentication enabled on your account. If you need to change your configuration, or generate new recovery codes, you can do that in the settings below.':
      'GitHub 强烈建议你的帐户保持启用双因素身份验证。如需更改配置或生成新的恢复代码，可在下方设置中操作。',
    'Disabling...': '禁用中...',
    'Disabling…': '禁用中…',
    'Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.':
      '双因素身份验证通过要求登录时除密码外还需其他验证来为帐户增加一层安全保护。',
    'Learn more about two-factor authentication': '了解双因素身份验证',
    'Learn more about two-factor authentication.': '了解双因素身份验证。',
    'Because of your contributions on GitHub, two-factor authentication is required for your account. Thank you for helping keep the ecosystem safe!':
      '鉴于你在 GitHub 上的贡献，你的帐户必须启用双因素身份验证。感谢你帮助维护生态安全！',
    // 日期在单独元素中：「… starting <date>. Thank you …」→ “…你的帐户将从 <日期> 起需要启用双因素身份验证。感谢…”
    'Because of your contributions on GitHub, two-factor authentication will be required for your account starting':
      '鉴于你在 GitHub 上的贡献，你的帐户将从',
    '. Thank you for helping keep the ecosystem safe!': '起需要启用双因素身份验证。感谢你帮助维护生态安全！',
    'Learn more about our two-factor authentication initiative': '了解我们的双因素身份验证计划',
    "Two-factor authentication is required for at least one organization or enterprise account you're affiliated with.":
      '你所属的至少一个组织或企业帐户要求启用双因素身份验证。',
    'Two-factor authentication is required for at least one organization or enterprise account you’re affiliated with.':
      '你所属的至少一个组织或企业帐户要求启用双因素身份验证。',
    'Preferred 2FA method': '首选 2FA 方法',
    'Set your preferred method to use for two-factor authentication when signing into GitHub.':
      '设置登录 GitHub 时首选的双因素身份验证方法。',
    'Passkeys should be used primarily for standalone, password-less authentication.': '通行密钥主要用于独立的免密码身份验证。',

    // 身份验证器应用
    'Use an authentication app or browser extension to generate one-time codes.': '使用身份验证应用或浏览器扩展生成一次性验证码。',
    'Manage Authenticator app': '管理身份验证器应用',
    'Authenticator apps and browser extensions like': '身份验证器应用和浏览器扩展如',
    ', etc. generate one-time passwords that are used as a second factor to verify your identity when prompted during sign-in.':
      '等会生成一次性密码，在登录时按提示作为第二因素验证你的身份。',
    'Scan the QR code': '扫描二维码',
    'Re-scan the QR code': '重新扫描二维码',
    'Use an authenticator app or browser extension to scan.': '使用身份验证器应用或浏览器扩展扫描。',
    'Learn more about enabling 2FA': '了解如何启用 2FA',
    'Learn more about enabling 2FA.': '了解如何启用 2FA。',
    'Unable to scan? You can use the': '无法扫描？你可以使用',
    'setup key': '设置密钥',
    'Setup key': '设置密钥',
    'to manually configure your authenticator app.': '手动配置身份验证器应用。',
    'Your two-factor secret': '你的双因素密钥',
    'Verify the code from the app': '验证应用中的验证码',
    'Verify the code from the app.': '验证应用中的验证码。',
    // 句号随原文
    'Two-factor code verification failed. Please try again.': '双因素验证码验证失败。请重试。',

    // 短信（原文没有的冒号不加；because → 因为）
    'Manage SMS/Text message': '管理短信',
    'Less secure': '安全性较低',
    'Get one-time codes sent to your phone via SMS to complete authentication requests. We strongly advise against using SMS because it is susceptible to interception, does not provide resistance against phishing attacks, and deliverability can be unreliable. It is recommended to use an Authenticator app instead of SMS.':
      '通过短信将一次性验证码发送到你的手机以完成身份验证请求。我们强烈建议不要使用短信，因为短信容易被拦截、无法抵御网络钓鱼攻击且送达不可靠。建议使用身份验证器应用代替短信。',
    'Get one-time codes sent to your phone via SMS to complete authentication requests.':
      '通过短信将一次性验证码发送到你的手机以完成身份验证请求。',
    'We strongly advise against using SMS because it is susceptible to interception, does not provide resistance against phishing attacks, and deliverability can be unreliable. Instead, we recommend configuring an authenticator app and disabling SMS as a 2FA method. You will receive one-time codes at this phone number:':
      '我们强烈建议不要使用短信，因为短信容易被拦截、无法抵御网络钓鱼攻击且送达不可靠。建议改为配置身份验证器应用并停用短信 2FA 方法。你将通过以下号码接收一次性验证码：',
    // 「Make sure that <a>your country or region is supported</a> for SMS delivery.」
    // → “请确保你所在的国家或地区支持短信发送。”（链接文字只译主语，谓语放在后半句）
    'Get authentication codes by SMS on your mobile phone when signing into GitHub. Make sure that':
      '登录 GitHub 时通过手机短信获取验证码。请确保',
    'your country or region is supported': '你所在的国家或地区',
    'your country is supported': '你所在的国家',
    'for SMS delivery.': '支持短信发送。',
    'Verify account': '验证帐户',
    "Before setting up SMS, please verify that you're a human.": '设置短信前，请验证你是真人。',
    'Before setting up SMS, please verify that you’re a human.': '设置短信前，请验证你是真人。',
    'Country or region code': '国家或地区代码',
    'Country code': '国家代码',
    'Your phone number': '你的手机号码',
    'Send authentication code': '发送验证码',
    'Sent. It may take a minute for the SMS to arrive.': '已发送。短信可能需要一分钟才能送达。',
    'Verify the code sent to your phone': '验证发送到你手机的验证码',

    // 安全密钥与 GitHub 移动版
    'Security keys are webauthn credentials that can only be used as a second factor of authentication.':
      '安全密钥是只能用作身份验证第二因素的 WebAuthn 凭据。',
    'No security keys': '没有安全密钥',
    'Register new security key': '注册新安全密钥',
    'Enter a nickname for this security key': '输入此安全密钥的昵称',
    'Security key registration failed.': '安全密钥注册失败。',
    "This browser doesn't support security keys yet.": '此浏览器尚不支持安全密钥。',
    'This browser doesn’t support security keys yet.': '此浏览器尚不支持安全密钥。',
    'This security key has already been registered.': '此安全密钥已注册。',
    'Security key': '安全密钥',
    'Use your device with Touch ID, Windows Hello, etc. or a physical security key (e.g. YubiKey)':
      '使用支持 Touch ID、Windows Hello 等功能的设备或物理安全密钥（如 YubiKey）',
    'Manage GitHub Mobile': '管理 GitHub 移动版',

    // 恢复选项与恢复代码页（原文没有的逗号不加）
    'Your two-factor authentication recovery codes have not been downloaded or printed in the last one year. Make sure your recovery codes are up-to-date by viewing and downloading or printing them again.':
      '你的双因素身份验证恢复代码在过去一年中未被下载或打印。请重新查看并下载或打印以确保恢复代码为最新。',
    'Your two-factor authentication recovery codes have not been downloaded or printed in the last one year. Make sure your recovery codes are up-to-date by downloading or printing them again.':
      '你的双因素身份验证恢复代码在过去一年中未被下载或打印。请重新下载或打印以确保恢复代码为最新。',
    'Two-factor recovery codes': '双因素恢复代码',
    'New two-factor recovery codes successfully generated. Save them in a safe, durable location and discard your previous codes.':
      '已生成新的双因素恢复代码。请将其保存在安全、持久的位置并丢弃之前的恢复代码。',
    // 「such as <a>1Password</a>, …」：例如 前保留一个逗号，否则读不通
    'Keep your recovery codes as safe as your password. We recommend saving them with a password manager such as':
      '请像保护密码一样妥善保管恢复代码。建议使用密码管理器保存，例如',
    'Keep your recovery codes in a safe spot.': '请将恢复代码保存在安全的地方。',
    'These new codes have replaced your old codes. Save them in a safe spot.': '这些新恢复代码已替换旧恢复代码。请保存在安全的地方。',
    'These codes are the last resort for accessing your account in case you lose your password and second factors. If you cannot find these codes, you':
      '这些恢复代码是你丢失密码和第二因素时访问帐户的最后手段。如果找不到这些恢复代码，你',
    'lose access to your account.': '无法再访问你的帐户。',
    'Generate new recovery codes': '生成新的恢复代码',
    'When you generate new recovery codes, you must download or print the new codes.': '生成新的恢复代码后，必须下载或打印新的恢复代码。',
    "Your old codes won't work anymore.": '旧恢复代码将失效。',
    'Your old codes won’t work anymore.': '旧恢复代码将失效。',
    'Back to settings': '返回设置',

    // 启用 2FA 向导
    'Enable two-factor authentication (2FA)': '启用双因素身份验证 (2FA)',
    'Setup authenticator app': '设置身份验证器应用',
    'Set up authenticator app': '设置身份验证器应用',
    'Setup SMS authentication': '设置短信身份验证',
    'Alternative 2FA option:': '其他 2FA 方法：',
    'SMS authentication': '短信身份验证',
    'Download your recovery codes': '下载恢复代码',
    'Save your recovery codes': '保存恢复代码',
    'You can use recovery codes as a second factor to authenticate in case you lose access to your device. We recommend saving them with a secure password manager such as':
      '无法使用设备时可以用恢复代码作为第二因素进行身份验证。建议使用安全的密码管理器保存，例如',
    'Keep your recovery codes in a safe spot': '请将恢复代码保存在安全的地方',
    "If you lose your device and don't have the recovery codes, you will lose access to your account.":
      '如果丢失设备且没有恢复代码，你将无法访问帐户。',
    'If you lose your device and don’t have the recovery codes, you will lose access to your account.':
      '如果丢失设备且没有恢复代码，你将无法访问帐户。',
    'I have saved my recovery codes': '我已保存恢复代码',
    'Two-factor authentication (2FA) is now enabled for your GitHub account': '你的 GitHub 帐户已启用双因素身份验证 (2FA)',
    'You have enabled two-factor authentication using SMS.': '你已通过短信启用双因素身份验证。',
    'You have enabled two-factor authentication using your authenticator app.': '你已通过身份验证器应用启用双因素身份验证。',
    "Don't get locked out, configure additional authentication methods": '为防止无法访问帐户，请配置更多身份验证方法',
    'Don’t get locked out, configure additional authentication methods': '为防止无法访问帐户，请配置更多身份验证方法',
    "Configuring additional authentication methods will help you gain access to your account in case you lose your device and don't have your recovery codes.":
      '配置更多身份验证方法可在丢失设备且没有恢复代码时帮助你访问帐户。',
    'Configuring additional authentication methods will help you gain access to your account in case you lose your device and don’t have your recovery codes.':
      '配置更多身份验证方法可在丢失设备且没有恢复代码时帮助你访问帐户。',
    // 「… installing the GitHub Mobile app for <a>iOS</a> or <a>Android</a> and signing in to your account.」
    'The GitHub Mobile app on your phone can be used as a 2FA method. Enable it by installing the GitHub Mobile app for':
      '手机上的 GitHub 移动版应用可用作 2FA 方法。安装适用于',
    'and signing in to your account.': '的 GitHub 移动版应用并登录帐户即可启用。',

    // 2FA 复查
    'Verify your two-factor authentication (2FA) settings': '验证你的双因素身份验证 (2FA) 设置',
    'This is a one-time verification of your recent configured 2FA credentials.': '这是对你最近配置的 2FA 凭据的一次性验证。',
    "Make sure that 2FA is correctly configured, and avoid a potential account lockout disaster. If you're having trouble verifying, you'll be able to reconfigure 2FA for your account.":
      '请确认 2FA 配置正确，避免帐户被锁定。如果验证遇到问题，可以为帐户重新配置 2FA。',
    'Make sure that 2FA is correctly configured, and avoid a potential account lockout disaster. If you’re having trouble verifying, you’ll be able to reconfigure 2FA for your account.':
      '请确认 2FA 配置正确，避免帐户被锁定。如果验证遇到问题，可以为帐户重新配置 2FA。',
    'Verify 2FA now': '立即验证 2FA',
    'You can choose to': '你可以选择',
    'skip 2FA verification': '跳过 2FA 验证',
    "at this moment, we'll remind you again tomorrow.": '，我们明天会再次提醒你。',
    'at this moment, we’ll remind you again tomorrow.': '，我们明天会再次提醒你。',
    'Verify your 2FA setup tomorrow': '明天再验证 2FA 设置',
    'Reconfigure 2FA on this account': '为此帐户重新配置 2FA',
    '2FA verification successful!': '2FA 验证成功！',
    'Keep your recovery codes safe and easy to access': '请妥善保管恢复代码并确保随时可以取用',
    "As a reminder, recovery codes can be used as a second factor to authenticate in case you lose your device. If you don't have your recovery codes, you may lose access to your account.":
      '提醒一下，丢失设备时可以用恢复代码作为第二因素进行身份验证。如果没有恢复代码，你可能会无法访问帐户。',
    'As a reminder, recovery codes can be used as a second factor to authenticate in case you lose your device. If you don’t have your recovery codes, you may lose access to your account.':
      '提醒一下，丢失设备时可以用恢复代码作为第二因素进行身份验证。如果没有恢复代码，你可能会无法访问帐户。',
    'Not sure where you saved them?': '不确定保存在哪里？',

    // 强制启用 2FA 提示：句子被 <strong> 拆开（句号随原文）
    'Two-factor authentication (2FA)': '双因素身份验证 (2FA)',
    'is required for your GitHub account': '是你的 GitHub 帐户的必需设置',
    'This will only take a minute.': '只需一分钟。',
    "Enable 2FA now. You'll be able to continue on with your work right after.": '立即启用 2FA。之后即可继续工作。',
    'Enable 2FA now. You’ll be able to continue on with your work right after.': '立即启用 2FA。之后即可继续工作。',
    'Two-factor authentication adds an': '双因素身份验证为帐户增加一层',
    'additional layer of account security': '额外的安全保护',
    '. It is a proven method of keeping you safe from hackers and account takeover, even if your password is stolen or compromised.':
      '。即使密码被盗或泄露，这也是防止黑客入侵和帐户被盗的有效方法。',
    'Enable 2FA now': '立即启用 2FA',
    'left to enable 2FA. Take action now to avoid additional interruptions.': '时间启用 2FA。请立即操作以免受到更多干扰。',
    'Remind me tomorrow': '明天提醒我'
  },
  scoped: {
    // 更改密码
    'Change password': '更改密码',
    OR: '或',
    // 登录方式中的密码行 Password 由 auth 的全站 static 收录
    // 通行密钥、登录方式
    Passkeys: '通行密钥',
    Synced: '已同步',
    // 禁用 2FA 确认对话框中 <strong> 内的片段 now required 由 common/site.ts 的全局词条翻译
    // 双因素方法（auth 中的同名词条只在登录页生效）；GitHub Mobile 行的方法名按用户规定译成中文
    'Two-factor methods': '双因素方法',
    'Authenticator app': '身份验证器应用',
    'SMS/Text message': '短信',
    'GitHub Mobile': 'GitHub 移动版',
    'Recovery options': '恢复选项',
    Configured: '已配置',
    'Not configured': '未配置',
    Viewed: '已查看',
    Preferred: '首选',
    Nickname: '昵称',
    // 按钮
    View: '查看',
    Print: '打印',
    'You have': '你还有'
  },
  regexp: [
    [/^(\d+) devices?$/, '$1 台设备'],
    [/^(\d+) security keys?$/, '$1 个安全密钥'],
    // 安全密钥行的数量：1 key
    [/^(\d+) keys?$/, '$1 个密钥'],
    [/^(\d+) verified emails? configured$/, '已配置 $1 个已验证电子邮件'],
    [/^(\d+) passkeys? configured$/, '已配置 $1 个通行密钥'],
    [/^(\d+) accounts? connected$/, '已连接 $1 个帐户'],
    [
      new RegExp(`^Added (${TIME_SOURCE}) \\| Last used (${TIME_SOURCE}|never)$`),
      (_, added: string, used: string) => `${joinCjk(translateTime(added), '添加')} | ${usedTime(used)}`
    ],
    [/^Delete [`'"“‘](.+?)[`'"”’] passkey$/, '删除通行密钥“$1”'],
    [/^Are you sure you want to delete your [`'"“‘](.+?)[`'"”’] passkey\?$/, '确定要删除通行密钥“$1”吗？'],
    [/^You will receive one-time codes at this phone number: (.+)$/, '你将通过此号码接收一次性验证码：$1'],
    // 更改密码的校验错误：各项组合多样，逐项翻译后拼接（句号随原文）
    [
      new RegExp(`^Password (${PASSWORD_PART_SOURCE}(?:, ${PASSWORD_PART_SOURCE})*(?:,? and ${PASSWORD_PART_SOURCE})?)(\\.?)$`),
      (_, list: string, dot: string) => `密码${passwordProblems(list)}${dot ? '。' : ''}`
    ],
    // 强制启用 2FA：日期未被拆开时
    [
      new RegExp(
        `^Because of your contributions on GitHub, two-factor authentication will be required for your account starting (${DATE_SOURCE})\\. Thank you for helping keep the ecosystem safe!$`
      ),
      (_, date: string) =>
        joinCjk(
          joinCjk('鉴于你在 GitHub 上的贡献，你的帐户将从', translateTime(date)),
          '起需要启用双因素身份验证。感谢你帮助维护生态安全！'
        )
    ],
    // 禁用 2FA 确认对话框的后半句（前半句「Some GitHub users are <strong>now required</strong>」见 static / scoped）
    [
      new RegExp(
        `^to enable two-factor authentication as an additional security measure\\. Your activity on GitHub includes you in this requirement\\. You will need to re-enable two-factor authentication on your account before (${DATE_SOURCE}), otherwise your account will be restricted on that date\\.$`
      ),
      (_, date: string) =>
        joinCjk(
          joinCjk('启用双因素身份验证作为额外的安全措施。你在 GitHub 上的活动使你也在此要求范围内。你需要在', translateTime(date)),
          '之前为帐户重新启用双因素身份验证，否则你的帐户将在当天受到限制。'
        )
    ],
    // 双因素方法各行按钮的无障碍名称：Edit Authenticator app、Add SMS/Text message、View Recovery codes
    [
      new RegExp(`^(${Object.keys(METHOD_ACTIONS).join('|')}) (${Object.keys(METHODS).join('|')})$`),
      (_, action: string, method: string) => methodAction(action, method)
    ]
  ]
} satisfies PageDictionary
