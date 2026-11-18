import { describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { translateTitleText } from '../../../src/core/title'
import type { PageDictionary } from '../../../src/core/types'
import auth from '../../../src/locales/zh-CN/auth'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = auth

const matcher = createMatcher([['auth', auth]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'auth'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 登录
  {
    hits: [
      ['Use a different Google account', '使用其他 Google 帐户'],
      ['Use a different Apple account', '使用其他 Apple 帐户']
    ],
    misses: ['Use a different GitLab account']
  },

  // 双因素身份验证、设备验证、帐户恢复
  {
    hits: [
      ['Step 1', '第 1 步'],
      ['Step 3', '第 3 步']
    ],
    misses: ['Step 10']
  },
  {
    hits: [
      [
        'We just sent your authentication code via email to octocat@example.com. The code will expire at 10:43PM UTC.',
        '验证码已通过电子邮件发送至 octocat@example.com，将于 10:43PM UTC 过期。'
      ]
    ],
    misses: ['We just sent your authentication code via email.']
  },
  {
    hits: [
      ['2 verified emails', '2 个已验证电子邮件'],
      ['1 verified email', '1 个已验证电子邮件']
    ],
    misses: ['verified emails']
  },
  { hits: [['1 unverified email', '1 个未验证电子邮件']], misses: ['unverified emails'] },
  {
    hits: [
      ['2 keys', '2 个密钥'],
      ['1 key', '1 个密钥']
    ],
    misses: ['keys']
  },
  { hits: [['3 devices', '3 台设备']], misses: ['devices'] },
  {
    hits: [['You will receive one-time codes at this phone number: +1 *** *** 1234', '你将通过此号码接收一次性验证码：+1 *** *** 1234']],
    misses: ['You will receive one-time codes at this phone number']
  },

  // OAuth 应用 / GitHub 应用授权
  {
    hits: [
      ['Authorize GitHub CLI', '授权 GitHub CLI'],
      ['Authorize octocat', '授权 octocat']
    ],
    misses: ['Authorizing will redirect']
  },
  { hits: [['Continue as octocat', '以 octocat 身份继续']], misses: ['Continue as'] },
  { hits: [['Select user to authorize GitHub CLI', '选择要授权 GitHub CLI 的用户']], misses: ['Select user'] },
  {
    hits: [
      ['More than 1K', '超过 1K'],
      ['More than 10', '超过 10']
    ],
    misses: ['More than a few']
  },
  {
    hits: [
      ['Fewer than 10', '少于 10'],
      ['Less than 1K', '少于 1K']
    ],
    misses: ['Fewer than ten']
  },
  { hits: [['More than 1K GitHub users', '超过 1K 个 GitHub 用户']], misses: ['More than 1K GitLab users'] },
  {
    hits: [
      ['Fewer than 10 GitHub users', '少于 10 个 GitHub 用户'],
      ['Less than 1K GitHub users', '少于 1K 个 GitHub 用户']
    ],
    misses: ['Fewer than ten GitHub users']
  },
  {
    hits: [
      ['Verify your GitHub identity (octocat)', '验证你的 GitHub 身份 (octocat)'],
      ['Verify your GitHub identity (octo-org)', '验证你的 GitHub 身份 (octo-org)']
    ],
    misses: ['Verify your GitHub identity (octo cat)', 'Verify your GitHub identity octocat']
  },
  {
    hits: [
      ['Created 3 years ago', '创建于 3年前'],
      ['Created on Jan 5, 2024', '创建于 2024年1月5日'],
      ['Created about 1 year ago', '创建于约1年前'],
      ['Created yesterday', '创建于昨天']
    ],
    misses: ['Created by octocat']
  },

  // 注册、更改密码
  {
    hits: [
      [
        'Username octocat is not available. octocat1, octocat-2, or octocat-dev are available.',
        '用户名 octocat 不可用。octocat1、octocat-2、octocat-dev 可用。'
      ]
    ],
    misses: ['Username is not available.']
  },
  {
    hits: [['Username octocat is not available.', '用户名 octocat 不可用。']],
    misses: ['Username octocat is available']
  },
  { hits: [['octocat-2 is available.', 'octocat-2 可用。']], misses: ['octocat is available'] },
  {
    hits: [
      ['Change password for @octocat', '更改 @octocat 的密码'],
      ['Change password for octocat', '更改 @octocat 的密码']
    ],
    misses: ['Change password for']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('auth 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = auth.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(
      translate(normalizeText(['Username ', 'octocat', ' is not available. ', 'octocat1, or octocat-2', ' are available.'].join('')))
    ).toBe('用户名 octocat 不可用。octocat1、octocat-2 可用。')
    expect(translate(normalizeText(['Created ', '3 years ago'].join('')))).toBe('创建于 3年前')
    expect(translate(normalizeText(['More than ', '1K', ' GitHub users'].join('')))).toBe('超过 1K 个 GitHub 用户')
    expect(translate(normalizeText(['Fewer than ', '10', ' GitHub users'].join('')))).toBe('少于 10 个 GitHub 用户')
  })
})

describe('auth 静态词条', () => {
  it.each([
    ['Sign in to GitHub', '登录 GitHub'],
    ['Sign in to', '登录'],
    ['Username or email address', '用户名或电子邮件地址'],
    ['Password', '密码'],
    ['Forgot password?', '忘记密码？'],
    ['Signing in…', '登录中…'],
    ['Signing in...', '登录中...'],
    ['Continuing with Google...', '正在使用 Google 继续...'],
    ['Continuing with Google…', '正在使用 Google 继续…'],
    ['Waiting for input from browser interaction...', '正在等待浏览器交互...'],
    ['Continue with passkey', '使用通行密钥继续'],
    ['This browser or device is reporting partial passkey support.', '此浏览器或设备仅部分支持通行密钥。'],
    [
      'Webauthn isn’t supported. Use a different browser or device to use your passkey.',
      '不支持 WebAuthn。请换用其他浏览器或设备使用通行密钥。'
    ],
    ['Device Activation', '设备激活'],
    ['Enter the code displayed on your device', '输入设备上显示的代码'],
    ['Are you sure you want to sign out?', '确定要退出登录吗？'],
    ['Sign out from all accounts', '从所有帐户退出登录'],
    ['Two-factor authentication', '双因素身份验证'],
    ['Use a recovery code or begin 2FA account recovery', '使用恢复代码或开始 2FA 帐户恢复'],
    ['Recovery code authentication failed.', '恢复代码身份验证失败。'],
    [
      'Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code.',
      '打开双因素身份验证器 (TOTP) 应用或浏览器扩展查看验证码。'
    ],
    ['GitHub support will review your request', 'GitHub 支持团队将审查你的请求'],
    ['within 1-3 days', '1-3 天内'],
    ['Enter a recovery code', '输入恢复代码'],
    [
      'The file containing your recovery codes may exist on your computer - check for a file named',
      '恢复代码文件可能保存在你的电脑上 - 请查找文件'
    ],
    ['Device verification', '设备验证'],
    ['Having trouble verifying via email?', '通过电子邮件验证遇到问题？'],
    // 产品名按用户规定译成中文：GitHub Mobile → GitHub 移动版
    ['Try GitHub Mobile for simplified device verification', '试用 GitHub 移动版简化设备验证'],
    ['Authenticate with GitHub Mobile', '使用 GitHub 移动版验证'],
    [
      'GitHub Mobile can be used for two-factor authentication by installing the GitHub Mobile app and signing in to your account.',
      '安装 GitHub 移动版应用并登录帐户后，即可用于双因素身份验证。'
    ],
    ['Configure passwordless authentication', '配置无密码身份验证'],
    ['Your preferred 2FA method is', '你的首选 2FA 方法为'],
    [
      'Security keys are hardware devices that can be used as your second factor of authentication.',
      '安全密钥是硬件设备，可用作身份验证的第二因素。'
    ],
    ['Confirm access', '确认访问'],
    ['sudo mode', 'sudo 模式'],
    ['Authorizing will redirect to', '授权后将重定向到'],
    ['Owned & operated by GitHub', '由 GitHub 拥有和运营'],
    ['Not owned or operated by GitHub', '非 GitHub 拥有或运营'],
    ['Learn more about OAuth', '了解 OAuth'],
    ['read and write all public and private repository data', '读写所有公共和专用存储库数据'],
    // 非可见性义的 private / public data → 私密数据 / 公开数据（与 org-settings、settings-developer 一致）
    [
      'Until access is granted by an owner, the application cannot access the organization’s private data or modify its public data.',
      '在所有者授予访问权限前，应用无法访问组织的私密数据，也无法修改其公开数据。'
    ],
    [
      "The application cannot access this organization's private data or modify its public data.",
      '应用无法访问此组织的私密数据，也无法修改其公开数据。'
    ],
    ['OAuth application authorized', 'OAuth 应用已授权'],
    ['Create your free account', '创建免费帐户'],
    // /join 的标签页标题首段
    ['Join GitHub', '加入 GitHub'],
    // 产品名按用户规定译成中文：GitHub Actions → GitHub 操作；Copilot 是品牌词，保留
    ['Save time with CI/CD integrations and GitHub Actions.', '借助 CI/CD 集成和 GitHub 操作节省时间。'],
    ['Access to GitHub Copilot', '使用 GitHub Copilot'],
    ['Connect with developers worldwide for instant feedback and insights.', '与全球开发人员交流，即时获取反馈和见解。'],
    ['Email preferences', '电子邮件首选项'],
    ['Your Country/Region*', '国家/地区*'],
    ['Reset your password', '重置密码'],
    // email 义的“邮件”→“电子邮件”；spam folder 仍作“垃圾邮件文件夹”
    ['Send password reset email', '发送密码重置电子邮件'],
    [
      "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.",
      '请查收电子邮件中的密码重置链接。如果几分钟内未收到，请检查垃圾邮件文件夹。'
    ],
    ['. We’ll occasionally send you account-related emails.', '。我们会不定期向你发送帐户相关电子邮件。'],
    ['Didn’t get your email?', '没有收到电子邮件？'],
    ['Recovery email sent', '恢复电子邮件已发送'],
    // 同一流程两处 all addresses associated with this account 同译“此帐户关联的所有电子邮件地址”
    [
      'by sending a one-time password to all addresses associated with this account.',
      '，我们会向此帐户关联的所有电子邮件地址发送一次性密码。'
    ],
    [
      'We sent an email to all addresses associated with this account containing a one-time password.',
      '已向此帐户关联的所有电子邮件地址发送包含一次性密码的电子邮件。'
    ],
    // 2FA method → 2FA 方法
    ['Use this method for future logins', '以后登录都使用此方法'],
    // unlink → 取消链接
    ['Try recovering your account, or unlink your account email address(es)', '尝试恢复帐户，或取消链接帐户电子邮件地址']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('/join 的标签页标题：首段译出，站点名段保留（简繁）', () => {
    const tw = createMatcher(zhTW)
    const title = 'Join GitHub · GitHub'
    expect(translateTitleText(title, translate, '/join')).toBe('加入 GitHub · GitHub')
    expect(translateTitleText(title, text => tw.translate(text, ['common', 'auth']), '/join')).toBe('加入 GitHub · GitHub')
    expect(tw.translate('Sign up to GitHub', ['common', 'auth'])).toBe('註冊 GitHub')
  })

  it('「Sign in to <…>」片段全站生效', () => {
    expect(matcher.translate('Sign in to', ['common'])).toBe('登录')
    expect(matcher.translate('Sign in to', ['common', 'sponsors'])).toBe('登录')
    // 设置页（settings 页面类型）同样取这两条全站 static
    expect(matcher.translate('Sign in to', ['common', 'settings'])).toBe('登录')
    expect(matcher.translate('Password', ['common', 'settings'])).toBe('密码')
  })

  it.each([
    ['Password', '密码'],
    ['Verifying…', '验证中…'],
    ['Send a code via email', '通过电子邮件发送验证码'],
    ['Verify via email', '通过电子邮件验证'],
    ['When you are ready, trigger a mailer to verify your identity.', '准备就绪后，发送电子邮件以验证身份。'],
    ['Enter the verification code', '输入验证码'],
    // 产品名按用户规定译成中文：GitHub Mobile → GitHub 移动版（标题与选项在任意页面生效）
    ['GitHub Mobile', 'GitHub 移动版'],
    ['Use GitHub Mobile', '使用 GitHub 移动版'],
    [
      'We sent you a verification request on your GitHub Mobile app. Approve the request to enter sudo mode.',
      '已向你的 GitHub 移动版应用发送验证请求。批准请求以进入 sudo 模式。'
    ]
  ])('sudo 确认对话框（任意页面）：%s → %s', (input, expected) => {
    expect(matcher.translate(input, ['common', 'repository', 'repo-settings'])).toBe(expected)
  })
})

describe('auth 页面词条', () => {
  it.each([
    ['Verify', '验证'],
    ['Created', '创建于'],
    ['GitHub users', '个 GitHub 用户'],
    ['Public and', '公共和'],
    ['private', '专用'],
    ['account', '帐户'],
    ['Request', '请求'],
    ['Not', '非'],
    ['owned or operated by GitHub', 'GitHub 拥有或运营'],
    ['Username', '用户名'],
    ['Change password', '更改密码'],
    ['Continue', '继续'],
    ['Emails', '电子邮件'],
    ['Two-factor methods', '双因素方法'],
    ['Continue...', '继续...'],
    ['on your account.', '。'],
    ['by default.', '。'],
    ['or verify a', '或验证'],
    ['are available.', '可用。'],
    ['Resend email', '重新发送电子邮件'],
    ['Repository delete', '删除存储库'],
    ['(read)', '（只读）'],
    // read / write access → 读取 / 写入访问权限，三档同用“访问权限”
    ['Read-only access', '只读访问权限'],
    ['Read and write access', '读取和写入访问权限'],
    ['Full access', '完全访问权限']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('页面词条只在 auth 页面生效', () => {
    expect(matcher.translate('Username', ['common'])).toBeUndefined()
    expect(matcher.translate('Authorize GitHub CLI', ['common'])).toBeUndefined()
    expect(matcher.translate('on your account.', ['common'])).toBeUndefined()
    expect(matcher.translate('are available.', ['common'])).toBeUndefined()
    expect(matcher.translate('or verify a', ['common'])).toBeUndefined()
    expect(matcher.translate('Read and write access', ['common'])).toBeUndefined()
  })

  it('电子邮件验证页（/account_verifications，非 auth 页面类型）的词条全局生效', () => {
    expect(matcher.translate('Enter code', ['common', 'profile'])).toBe('输入验证码')
    expect(matcher.translate('Resend the code', ['common', 'profile'])).toBe('重新发送验证码')
  })
})
