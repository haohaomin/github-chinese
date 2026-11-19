import type { PageDictionary } from '../../../core/types'

/**
 * 注册（/signup）、电子邮件验证（/account_verifications，不属于 auth 页面类型）、找回密码与更改密码（/password_reset）。
 */

/** 「a, b, or c」→「a、b、c」 */
function joinNames(list: string): string {
  return list
    .split(/,? or |, /)
    .filter(Boolean)
    .join('、')
}

export default {
  static: {
    // 注册页：左侧说明（产品名按用户规定译成中文：GitHub Actions → GitHub 操作；Copilot 是品牌词，保留）
    'Create your free account': '创建免费帐户',
    "Explore GitHub's core features for individuals and organizations.": '探索 GitHub 面向个人和组织的核心功能。',
    'Explore GitHub’s core features for individuals and organizations.': '探索 GitHub 面向个人和组织的核心功能。',
    'Access to GitHub Copilot': '使用 GitHub Copilot',
    'Increase your productivity and accelerate software development.': '提高生产力，加快软件开发。',
    'Collaborate securely on public and private projects.': '在公共和专用项目上安全协作。',
    'Boost code quality with built-in review tools.': '使用内置审查工具提升代码质量。',
    'Save time with CI/CD integrations and GitHub Actions.': '借助 CI/CD 集成和 GitHub 操作节省时间。',
    'Connect with developers worldwide for instant feedback and insights.': '与全球开发人员交流，即时获取反馈和洞察。',

    // 注册表单
    'Already have an account?': '已有帐户？',
    'Sign in →': '登录 →',
    'Sign up for GitHub': '注册 GitHub',
    'Sign up to GitHub': '注册 GitHub',
    // /join 的标签页标题首段
    'Join GitHub': '加入 GitHub',
    'Email*': '电子邮件*',
    'Password*': '密码*',
    'Username*': '用户名*',
    'Email is invalid or already taken': '电子邮件无效或已被使用',
    'Email cannot be blank': '电子邮件不能为空',
    'The email you have provided is already associated with an account.': '该电子邮件已关联其他帐户。',
    'Password is too short': '密码太短',
    'Password needs a number and lowercase letter': '密码需包含数字和小写字母',
    'Password is strong': '密码强度高',
    'Password may be compromised': '密码可能已泄露',
    'Password is in a list of passwords commonly used on other websites': '此密码在其他网站的常用密码列表中',
    'Password cannot be blank': '密码不能为空',
    'Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.':
      '密码至少 15 个字符，或至少 8 个字符且包含数字和小写字母。',
    'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.':
      '用户名只能包含字母、数字或单个连字符，且不能以连字符开头或结尾。',
    'Username cannot be blank': '用户名不能为空',
    'Your Country/Region': '国家/地区',
    'Your Country/Region*': '国家/地区*',
    'Select Country/Region': '选择国家/地区',
    "For compliance reasons, we're required to collect country information to send you occasional updates and announcements.":
      '出于合规要求，我们需要收集国家/地区信息，以便向你发送不定期的更新和公告。',
    'For compliance reasons, we’re required to collect country information to send you occasional updates and announcements.':
      '出于合规要求，我们需要收集国家/地区信息，以便向你发送不定期的更新和公告。',
    'Receive occasional product updates and announcements': '接收不定期的产品更新和公告',
    'Create account': '创建帐户',
    'By creating an account, you agree to the': '创建帐户即表示你同意',
    ". We'll occasionally send you account-related emails.": '。我们会不定期向你发送帐户相关电子邮件。',
    '. We’ll occasionally send you account-related emails.': '。我们会不定期向你发送帐户相关电子邮件。',

    // 电子邮件验证 /account_verifications
    'Confirm your email address': '确认电子邮件地址',
    'We have sent a code to': '验证码已发送至',
    "Didn't get your email?": '没有收到电子邮件？',
    'Didn’t get your email?': '没有收到电子邮件？',
    'update your email address': '更新电子邮件地址',
    'Enter code': '输入验证码',
    'Resend the code': '重新发送验证码',

    // 找回密码 /password_reset
    'Reset your password': '重置密码',
    "Enter your user account's verified email address and we will send you a password reset link.":
      '输入帐户的已验证电子邮件地址，我们会向你发送密码重置链接。',
    'Enter your user account’s verified email address and we will send you a password reset link.':
      '输入帐户的已验证电子邮件地址，我们会向你发送密码重置链接。',
    'Enter your email address': '输入电子邮件地址',
    'Send password reset email': '发送密码重置电子邮件',
    'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.':
      '请查收电子邮件中的密码重置链接。如果几分钟内未收到，请检查垃圾邮件文件夹。',
    "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.":
      '请查收电子邮件中的密码重置链接。如果几分钟内未收到，请检查垃圾邮件文件夹。',
    'Return to Sign in': '返回登录',
    'Return to sign in': '返回登录',

    // 更改密码 /password_reset/<token>
    "Make sure it's at least 15 characters OR at least 8 characters including a number and a lowercase letter.":
      '至少 15 个字符，或至少 8 个字符且包含数字和小写字母。',
    'Make sure it’s at least 15 characters OR at least 8 characters including a number and a lowercase letter.':
      '至少 15 个字符，或至少 8 个字符且包含数字和小写字母。'
  },
  scoped: {
    Username: '用户名',
    'Change password': '更改密码',
    'Change your password': '更改密码',
    'reset your password': '重置密码',
    // 「<a>, <b>, or <c> are available.」
    'are available.': '可用。',
    'Email preferences': '电子邮件首选项',
    'Unlimited repositories': '无限存储库',
    'Integrated code reviews': '集成代码审查',
    'Automated workflows': '自动化工作流',
    'Community support': '社区支持',
    "See what's included": '查看包含内容',
    'See what’s included': '查看包含内容'
  },
  regexp: [
    [
      /^Username (\S+) is not available\. (.+) are available\.$/,
      (_, name: string, list: string) => `用户名 ${name} 不可用。${joinNames(list)} 可用。`
    ],
    [/^Username (\S+) is not available\.$/, '用户名 $1 不可用。'],
    [/^(\S+) is available\.$/, '$1 可用。'],
    [/^Change password for @?([\w-]+)$/, '更改 @$1 的密码']
  ]
} satisfies PageDictionary
