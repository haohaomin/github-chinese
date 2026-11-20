import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import { zhCN } from '../../../src/locales/zh-CN/index'
import settingsAccount from '../../../src/locales/zh-CN/settings-account'
import { joinNames } from '../../../src/locales/zh-CN/settings-account/account'
import { passwordProblems } from '../../../src/locales/zh-CN/settings-account/security'
import { joinCjk } from '../../../src/locales/zh-CN/helpers'
import { groupedBy } from '../../../src/locales/zh-CN/settings-account/billing'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = settingsAccount

const matcher = createMatcher([['settings', settingsAccount]])

/** 个人设置页的作用域：common → settings */
function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'settings'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列（与合并顺序一致），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 公开个人资料
  {
    hits: [
      ['Link to social profile 1', '社交帐户链接 1'],
      ['Link to social profile 4', '社交帐户链接 4']
    ],
    misses: ['Link to social profile five']
  },
  // 公开个人资料：时区下拉框
  {
    hits: [
      // 括号内只有英文和数字：半角，与后面的中文隔一个空格
      ['(GMT+08:00) Beijing', '(GMT+08:00) 北京'],
      ['(GMT-08:00) Pacific Time (US & Canada)', '(GMT-08:00) 太平洋时间（美国和加拿大）'],
      ['(UTC+05:30) New Delhi', '(UTC+05:30) 新德里'],
      ['(GMT+00:00) UTC', '(GMT+00:00) UTC'],
      ["(GMT+13:00) Nuku'alofa", '(GMT+13:00) 努库阿洛法']
    ],
    misses: ['(GMT+08:00) Atlantis', 'Beijing', '(GMT+08:00)Beijing']
  },

  // 帐户：更改用户名（句号随原文，不改成逗号）
  {
    hits: [
      [
        'Username octocat is not available. Please choose another. To submit a trademark claim, please see our',
        '用户名 octocat 不可用。请另选一个。如需提交商标申诉，请参阅我们的'
      ]
    ],
    misses: ['Username octocat is not available. Please choose another.']
  },
  {
    hits: [
      [
        'Username octocat is not available. octocat-1, octocat-dev, or octocat-cn are available.',
        '用户名 octocat 不可用。octocat-1、octocat-dev 或 octocat-cn 可用。'
      ],
      ['Username mona is not available. mona-1 or mona-gh are available.', '用户名 mona 不可用。mona-1 或 mona-gh 可用。']
    ],
    misses: ['Username octocat is not available. Something else is available.']
  },
  {
    hits: [['Username octocat is not available.', '用户名 octocat 不可用。']],
    misses: ['Username is not available.']
  },
  {
    hits: [
      ['octocat-2 is available.', 'octocat-2 可用。'],
      ['@mona is available.', 'mona 可用。']
    ],
    misses: ['octocat is not available.']
  },
  {
    hits: [
      // 原文只有一个逗号，译文不拆出顿号
      [
        'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen',
        '用户名只能包含字母数字字符或单个连字符，且不能以连字符开头或结尾'
      ],
      [
        'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
        '用户名只能包含字母数字字符或单个连字符，且不能以连字符开头或结尾。'
      ]
    ],
    misses: ['Username may only contain letters']
  },
  // 帐户：更改用户名的完成页（/users/<用户>/rename）的按钮
  {
    hits: [
      ['View octocat settings', '查看 octocat 的设置'],
      ['View mona-lisa settings', '查看 mona-lisa 的设置']
    ],
    misses: ['View octocat profile', 'View your account settings']
  },
  // 帐户：Patreon、导出、继任者（GitHub Sponsors profile → GitHub 赞助个人资料）
  {
    hits: [
      [
        'Connect a Patreon account for octocat to sponsor maintainers with. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile.',
        '为 octocat 连接 Patreon 帐户以赞助维护者。如果被赞助者也链接了 Patreon 和 GitHub，并且拥有公开的 GitHub 赞助个人资料，你在 Patreon 上的赞助也会在 GitHub 上得到认可。'
      ]
    ],
    misses: ['Connect a Patreon account for octocat']
  },
  {
    hits: [
      [
        'Export all repositories and profile metadata for octocat. Exports will be available for 7 days.',
        '导出 octocat 的所有存储库和个人资料元数据。导出文件将保留 7 天。'
      ]
    ],
    misses: ['Export all repositories and profile metadata for octocat.']
  },
  {
    hits: [
      [
        'By clicking "Add Successor" below, I acknowledge that I am the owner of the octocat account, and am authorizing GitHub to transfer content within that account to my GitHub Successor,',
        '单击下方“添加继任者”，即表示我确认自己是 octocat 帐户的所有者，并授权 GitHub 在我去世后将该帐户中的内容转让给我的 GitHub 继任者，'
      ],
      [
        'By clicking “Add Successor” below, I acknowledge that I am the owner of the mona account, and am authorizing GitHub to transfer content within that account to my GitHub Successor,',
        '单击下方“添加继任者”，即表示我确认自己是 mona 帐户的所有者，并授权 GitHub 在我去世后将该帐户中的内容转让给我的 GitHub 继任者，'
      ]
    ],
    misses: ['By clicking "Add Successor" below, I acknowledge that I am the owner']
  },
  {
    hits: [['This link will only work for octocat.', '此链接仅对 octocat 有效。']],
    misses: ['This link will only work for you and your team.']
  },
  {
    hits: [['You have successfully sent the successor invitation to octocat.', '已向 octocat 发送继任者邀请。']],
    misses: ['You have successfully sent the successor invitation.']
  },
  {
    hits: [['You have revoked the successor invitation to octocat.', '已撤销对 octocat 的继任者邀请。']],
    misses: ['You have revoked the successor invitation.']
  },
  {
    hits: [['You have canceled the invitation to octocat to be your designated successor.', '已取消邀请 octocat 成为你指定的继任者。']],
    misses: ['You have canceled the invitation.']
  },
  // 帐户：删除确认
  {
    hits: [
      ['immediately delete all of your repositories (12)', '立即删除你的所有存储库（12 个）'],
      ['immediately delete all of your repository (1)', '立即删除你的所有存储库（1 个）']
    ],
    misses: ['immediately delete all of your repositories']
  },
  {
    hits: [
      [
        'We will immediately delete all of your repositories (3), along with all of your forks, wikis, issues, pull requests, and GitHub Pages sites.',
        '我们将立即删除你的所有存储库（3 个），以及你的所有复刻、Wiki、议题、拉取请求和 GitHub 页面站点。'
      ]
    ],
    misses: ['We will immediately delete all of your repositories.']
  },

  // 外观与辅助功能
  {
    hits: [
      ['8 (Default)', '8（默认）'],
      ['4 (Default)', '4（默认）']
    ],
    misses: ['Eight (Default)']
  },
  {
    hits: [
      ['control + k or control + alt + k (default)', 'control + k 或 control + alt + k（默认）'],
      ['command + k or command + option + k (default)', 'command + k 或 command + option + k（默认）']
    ],
    misses: ['control + k or nothing (default)']
  },
  {
    hits: [['control + k (default)', 'control + k（默认）']],
    misses: ['k (default)']
  },

  // 通知设置
  {
    hits: [
      ['on GitHub, Email, CLI', 'GitHub、电子邮件、CLI'],
      ['On GitHub, Email', 'GitHub、电子邮件']
    ],
    misses: ['Email, Slack']
  },
  {
    hits: [
      ['Email. (Failed workflows only)', '电子邮件（仅失败的工作流）'],
      ['on GitHub, Email. (Failed workflows only)', 'GitHub、电子邮件（仅失败的工作流）']
    ],
    misses: ['Slack. (Failed workflows only)', 'Email (Failed workflows only)']
  },
  {
    hits: [
      ['Reviews, Pushes, Comments', '审查、推送、评论'],
      ['Comments, My own updates', '评论、我自己的更新'],
      ['Pushes', '推送']
    ],
    misses: ['Reviews, Issues']
  },
  {
    hits: [['mona@example.com is your current default email for notifications.', 'mona@example.com 是你当前默认的通知电子邮件。']],
    misses: ['Your email is your current default email for notifications.']
  },

  // 电子邮件（“e.g. edits and merges” 作“编辑和合并等”，不加括号；句号不改成逗号）
  {
    hits: [
      [
        "Emails you can use to sign in to your account. Your emails will not be used as the 'from' address for web-based Git operations, e.g. edits and merges. All web-based Git operations will be linked to 123+mona@users.noreply.github.com.",
        '可用于登录帐户的电子邮件。这些电子邮件不会用作编辑和合并等网页端 Git 操作的“发件人”地址。所有网页端 Git 操作都将关联到 123+mona@users.noreply.github.com。'
      ],
      [
        'Emails you can use to sign in to your account. Your emails will not be used as the ‘from’ address for web-based Git operations, e.g. edits and merges. All web-based Git operations will be linked to 123+mona@users.noreply.github.com',
        '可用于登录帐户的电子邮件。这些电子邮件不会用作编辑和合并等网页端 Git 操作的“发件人”地址。所有网页端 Git 操作都将关联到 123+mona@users.noreply.github.com'
      ]
    ],
    misses: ['Emails you can use to sign in to your account.']
  },
  {
    hits: [
      [
        'We sent a verification email to mona@example.com. Please follow the instructions in it.',
        '已向 mona@example.com 发送验证电子邮件。请按照其中的说明操作。'
      ]
    ],
    misses: ['We sent a verification email. Please follow the instructions in it.']
  },
  {
    hits: [['Your primary email was changed to mona@example.com.', '你的主要电子邮件地址已更改为 mona@example.com。']],
    misses: ['Your primary email was changed.']
  },
  {
    hits: [
      [
        'Because you have email privacy enabled, mona@example.com will be used for account-related notifications as well as password resets. 123+mona@users.noreply.github.com will be used for web-based Git operations, e.g., edits and merges.',
        '由于你已启用电子邮件隐私，mona@example.com 将用于帐户相关通知和重置密码。123+mona@users.noreply.github.com 将用于编辑和合并等网页端 Git 操作。'
      ]
    ],
    misses: ['Because you have email privacy enabled, nothing changes.']
  },
  {
    hits: [['Removed email mona@example.com from your account.', '已从你的帐户中移除电子邮件 mona@example.com。']],
    misses: ['Removed email from your account.']
  },
  {
    hits: [['Subscription preferences for mona@example.com', 'mona@example.com 的订阅首选项']],
    misses: ['Subscription preferences for everyone']
  },
  {
    hits: [['Manage email mona@example.com', '管理电子邮件 mona@example.com']],
    misses: ['Manage email settings']
  },
  {
    hits: [['Delete mona@example.com', '删除 mona@example.com']],
    misses: ['Delete mona']
  },
  {
    hits: [
      [
        'This will disconnect mona@example.com from your social identity provider. You will no longer be able to use it as a password alternative.',
        '这将断开 mona@example.com 与社交标识提供者的连接。你将无法再用它代替密码登录。'
      ]
    ],
    misses: ['This will disconnect your account from your social identity provider.']
  },
  {
    hits: [
      ['Error adding mona@example.com: email is already in use', '添加 mona@example.com 时出错：电子邮件已被使用'],
      // 未收录的原因保留原文
      ['Error adding mona@example.com: Email domain is blocked', '添加 mona@example.com 时出错：Email domain is blocked'],
      ['Error adding mona@example.com: constructor', '添加 mona@example.com 时出错：constructor']
    ],
    misses: ['Error adding email: email is already in use']
  },

  // 密码和身份验证
  {
    hits: [
      ['2 devices', '2 台设备'],
      ['1 device', '1 台设备']
    ],
    misses: ['Two devices']
  },
  {
    hits: [
      ['3 security keys', '3 个安全密钥'],
      ['1 security key', '1 个安全密钥']
    ],
    misses: ['Many security keys']
  },
  {
    hits: [
      ['1 key', '1 个密钥'],
      ['2 keys', '2 个密钥']
    ],
    misses: ['Two keys']
  },
  {
    hits: [['2 verified emails configured', '已配置 2 个已验证电子邮件']],
    misses: ['verified emails configured']
  },
  {
    hits: [['1 passkey configured', '已配置 1 个通行密钥']],
    misses: ['passkeys configured']
  },
  {
    hits: [['2 accounts connected', '已连接 2 个帐户']],
    misses: ['accounts connected']
  },
  {
    hits: [
      ['Added Oct 1, 2024 | Last used Oct 26, 2025', '2024年10月1日添加 | 2025年10月26日使用'],
      ['Added 3 days ago | Last used never', '3天前添加 | 从未使用'],
      ['Added on Jan 5, 2024 | Last used yesterday', '2024年1月5日添加 | 昨天使用']
    ],
    misses: ['Added Oct 1, 2024']
  },
  {
    hits: [
      ["Delete 'MacBook' passkey", '删除通行密钥“MacBook”'],
      ['Delete “YubiKey 5” passkey', '删除通行密钥“YubiKey 5”']
    ],
    misses: ['Delete passkey']
  },
  {
    hits: [["Are you sure you want to delete your 'MacBook' passkey?", '确定要删除通行密钥“MacBook”吗？']],
    misses: ['Are you sure you want to delete your passkey?']
  },
  {
    hits: [['You will receive one-time codes at this phone number: +1 555-0100', '你将通过此号码接收一次性验证码：+1 555-0100']],
    misses: ['You will receive one-time codes at this phone number']
  },
  {
    hits: [
      [
        'Password needs at least 1 number, cannot include your login, and is in a list of passwords commonly used on other websites',
        '密码至少需要 1 个数字，不能包含你的登录名，且在其他网站的常用密码列表中'
      ],
      ['Password is too short (minimum is 15 characters) and needs at least one number', '密码太短（最少 15 个字符）且至少需要 1 个数字'],
      ['Password needs at least 1 lowercase letter', '密码至少需要 1 个小写字母'],
      ["Password can't be blank.", '密码不能为空。'],
      [
        'Password is too long (maximum is 72 characters), is invalid, and cannot include your login',
        '密码太长（最多 72 个字符），无效，且不能包含你的登录名'
      ]
    ],
    misses: ['Password is too weak', 'Password needs at least 1 symbol', 'Password needs at least 1 number and more']
  },
  {
    hits: [
      // 日期未被拆开时与拆开后的片段拼读一致：“…将从 <日期> 起需要启用…”
      [
        'Because of your contributions on GitHub, two-factor authentication will be required for your account starting Nov 15, 2025. Thank you for helping keep the ecosystem safe!',
        '鉴于你在 GitHub 上的贡献，你的帐户将从 2025年11月15日起需要启用双因素身份验证。感谢你帮助维护生态安全！'
      ]
    ],
    misses: [
      'Because of your contributions on GitHub, two-factor authentication will be required for your account starting soon. Thank you for helping keep the ecosystem safe!'
    ]
  },
  {
    hits: [
      [
        'to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to re-enable two-factor authentication on your account before September 28, 2023, otherwise your account will be restricted on that date.',
        '启用双因素身份验证作为额外的安全措施。你在 GitHub 上的活动使你也在此要求范围内。你需要在 2023年9月28日之前为帐户重新启用双因素身份验证，否则你的帐户将在当天受到限制。'
      ]
    ],
    misses: [
      'to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to re-enable two-factor authentication on your account before soon, otherwise your account will be restricted on that date.'
    ]
  },
  {
    hits: [
      ['Edit Authenticator app', '编辑身份验证器应用'],
      ['Add SMS/Text message', '添加短信'],
      ['Edit Security keys', '编辑安全密钥'],
      // 产品名译成中文：GitHub Mobile → GitHub 移动版
      ['Show GitHub Mobile', '显示 GitHub 移动版'],
      ['View Recovery codes', '查看恢复代码']
    ],
    misses: ['Remove Authenticator app', 'Edit Passkeys']
  },

  // 会话
  {
    hits: [
      // 中文前缀接时间：数字开头补空格，中文开头不加
      ['Last accessed on Oct 26, 2026', '上次访问于 2026年10月26日'],
      ['Last accessed - 2 hours ago', '上次访问于 2小时前'],
      ['Last accessed yesterday', '上次访问于昨天']
    ],
    misses: ['Last accessed on someday']
  },
  {
    hits: [
      ['Registered - Oct 1, 2025', '注册于 2025年10月1日'],
      ['Registered - 2 years ago', '注册于 2年前'],
      ['Registered - yesterday', '注册于昨天']
    ],
    misses: ['Registered - unknown']
  },
  {
    hits: [['Last used for authentication - 5 minutes ago', '上次身份验证于 5分钟前']],
    misses: ['Last used for authentication - never']
  },
  {
    hits: [['Seen in Taipei, Taiwan', '曾在 Taipei, Taiwan 使用']],
    misses: ['Seen at Taipei']
  },
  {
    hits: [
      // 国家/地区名沿用 common/regions 的译名
      [
        'View details of session from Hong Kong last accessed October 26, 2026',
        '查看来自中国香港且上次访问于 2026年10月26日的会话详细信息'
      ],
      ['View details of session from Atlantis last accessed 2 days ago', '查看来自 Atlantis 且上次访问于前天的会话详细信息']
    ],
    misses: ['View details of session from Hong Kong']
  },
  {
    hits: [
      ['Chrome on Windows 10', 'Windows 10 上的 Chrome'],
      ['Firefox 128.0 on Ubuntu', 'Ubuntu 上的 Firefox 128.0'],
      ['Safari on Mac OS X 10_15_7', 'Mac OS X 10_15_7 上的 Safari'],
      // GitHub 客户端名译成中文，浏览器名保留
      ['GitHub Mobile 1.2 on iOS 17', 'iOS 17 上的 GitHub 移动版 1.2'],
      ['GitHub Desktop on macOS', 'macOS 上的 GitHub 桌面版']
    ],
    misses: ['Chrome on Plan 9']
  },

  // 许可、付款、其他计费详细信息、教育福利
  {
    hits: [
      ['In addition to your personal account, you manage 3 organizations.', '除个人帐户外，你还管理 3 个组织。'],
      ['In addition to your personal account, you manage 1 organization.', '除个人帐户外，你还管理 1 个组织。']
    ],
    misses: ['In addition to your personal account, you manage nothing.']
  },
  {
    hits: [
      // 方案名译成「X 版」；未收录的（Marketplace 应用的计划名）保留原文
      [
        "You've cancelled your subscription to Copilot Pro. This plan change will take effect on Nov 1, 2025.",
        '你已取消订阅 Copilot 专业版。此计划变更将于 2025年11月1日生效。'
      ],
      [
        "You've cancelled your subscription to Codecov. This plan change will take effect on Nov 1, 2025.",
        '你已取消订阅 Codecov。此计划变更将于 2025年11月1日生效。'
      ]
    ],
    misses: ["You've cancelled your subscription to Copilot Pro."]
  },
  // 兑换优惠券（/redeem）：优惠码与句子在同一文本节点
  {
    hits: [
      ['Sorry, we couldn’t find a coupon with the code: ZZZZTESTCODE', '抱歉，未找到此优惠码对应的优惠券：ZZZZTESTCODE'],
      ["Sorry, we couldn't find a coupon with the code: abc-123", '抱歉，未找到此优惠码对应的优惠券：abc-123']
    ],
    misses: ['Sorry, we couldn’t find a coupon']
  },
  {
    hits: [
      ['$4.00 off per month until Dec 31, 2026', '2026年12月31日前每月减免 $4.00'],
      ['$4.00 off per month until Dec 31, 2026.', '2026年12月31日前每月减免 $4.00。']
    ],
    misses: ['$4.00 off per month until further notice']
  },
  {
    hits: [
      ['$4.00 off per month', '每月减免 $4.00'],
      ['$1,200 off per month', '每月减免 $1,200']
    ],
    misses: ['4.00 off per month']
  },
  {
    hits: [
      ['until Dec 31, 2026.', '至 2026年12月31日。'],
      ['until Jan 2027', '至 2027年1月']
    ],
    misses: ['until further notice']
  },
  {
    hits: [
      ['· 1 year remaining', '· 剩余 1 年'],
      ['· 3 months remaining', '· 剩余 3 个月']
    ],
    misses: ['· forever remaining']
  },
  {
    hits: [
      ['Submitted 3 days ago', '提交于 3天前'],
      ['Submitted 2 days ago', '提交于前天'],
      ['Submitted on Oct 1, 2025', '提交于 2025年10月1日']
    ],
    misses: ['Submitted']
  },
  {
    hits: [
      ['Expires in 2 years', '2年后过期'],
      ['Expires in almost 3 months', '将近 3个月后过期'],
      ['Expires in about 2 months', '约 2个月后过期'],
      ['Expires in 3 days', '3天后过期'],
      ['Expires in 1 day', '1天后过期']
    ],
    misses: ['Expires in a week']
  },
  {
    hits: [
      ['Visa ending in 4242', 'Visa 尾号 4242'],
      ['American Express ending in 0005', 'American Express 尾号 0005']
    ],
    misses: ['Card ending in 4242']
  },
  {
    hits: [
      ['Expires 12/2027', '有效期至 12/2027'],
      ['Expires 3/27', '有效期至 3/27']
    ],
    misses: ['Expires soon']
  },
  {
    hits: [
      ['$4/month', '$4/月'],
      ['$21.00 / month', '$21.00/月']
    ],
    misses: ['4/month']
  },
  {
    hits: [['$48/year', '$48/年']],
    misses: ['48/year']
  },
  {
    hits: [['$10 per month', '每月 $10']],
    misses: ['10 per month']
  },
  {
    hits: [['$100 per year', '每年 $100']],
    misses: ['per year']
  },
  {
    hits: [['$0 spend limit', '$0 支出上限']],
    misses: ['No spend limit']
  },
  {
    hits: [
      ['Cancel Copilot Pro', '取消 Copilot 专业版'],
      ['Cancel Copilot Pro+', '取消 Copilot 专业增强版'],
      // Copilot Max 尚无既定译名
      ['Cancel Copilot Max', '取消 Copilot Max']
    ],
    misses: ['Cancel Copilot Business']
  },
  {
    hits: [
      ['Sourcery support', 'Sourcery 支持'],
      ['Codecov | Code Coverage support', 'Codecov | Code Coverage 支持']
    ],
    misses: ['Contact support', 'contact support', 'support']
  },
  {
    hits: [
      [
        'There was an error creating the discount request. Errors: Discount request could not be created. Discount request errors: School email must be verified on your GitHub account',
        '创建折扣申请时出错。错误：无法创建折扣申请。折扣申请错误：学校电子邮件必须在你的 GitHub 帐户中完成验证'
      ],
      [
        'There was an error creating the discount request. Errors: Discount request could not be created. Discount request errors: Proof is unreadable',
        '创建折扣申请时出错。错误：无法创建折扣申请。折扣申请错误：Proof is unreadable'
      ]
    ],
    misses: ['There was an error creating the discount request.']
  },

  // 计费概述、按流量计费的使用情况
  {
    hits: [
      // 与组织计费页一致
      ['Gross metered usage for Oct 1 - Oct 31, 2025.', '10月1日 - 2025年10月31日的按流量计费的使用情况总额。'],
      ['Included usage discounts for Oct 1 - Oct 31, 2025', '10月1日 - 2025年10月31日的包含的使用量折扣'],
      // 采集到的写法：完整月份名（与组织计费页同为“…的按流量计费的使用情况总额”）
      ['Gross metered usage for October 1 - October 30, 2026.', '10月1日 - 2026年10月30日的按流量计费的使用情况总额。']
    ],
    misses: ['Gross metered usage for this month.']
  },
  {
    hits: [
      [
        'Current usage for Oct 1 - Oct 31, 2025. Monthly quota resets in 5 day(s).',
        '10月1日 - 2025年10月31日的当前使用情况。每月配额将在 5天后重置。'
      ]
    ],
    misses: ['Current usage for Oct 1 - Oct 31, 2025.']
  },
  {
    hits: [['Resets in 5 days on Nov 1, 2025', '5天后于 2025年11月1日重置']],
    misses: ['Resets in 5 days']
  },
  {
    hits: [['Included usage limits reset in 5 days.', '包含的使用量限制将在 5天后重置。']],
    misses: ['Included usage limits reset soon']
  },
  {
    hits: [
      ['30 days', '30 天'],
      ['1 day', '1 天']
    ],
    misses: ['a few days']
  },
  {
    hits: [
      ['$12.50 off', '减免 $12.50'],
      // 约数符号与脚注星号随原文
      ['~$3.00 off*', '减免约 $3.00*']
    ],
    misses: ['12.50 off']
  },
  {
    hits: [['$4.00 off per month for 1 year', '1 年内每月减免 $4.00']],
    misses: ['$4.00 off per month for a year']
  },
  {
    hits: [['1,200 min used / 2,000 min included', '已用 1,200 分钟 / 包含 2,000 分钟']],
    misses: ['min used / min included']
  },
  {
    hits: [['0.5 GB used / 2 GB included', '已用 0.5 GB / 包含 2 GB']],
    misses: ['GB used / GB included']
  },
  {
    hits: [['2,000 included Actions minutes', '包含 2,000 操作分钟数']],
    misses: ['included Actions minutes']
  },
  {
    hits: [
      ['2 GB included Packages storage', '包含 2 GB 软件包存储'],
      ['10 GB included Git LFS bandwidth', '包含 10 GB Git LFS 带宽']
    ],
    misses: ['2 GB included Copilot storage']
  },
  {
    hits: [['120 included Codespaces core hours', '包含 120 代码空间核心小时数']],
    misses: ['included Codespaces core hours']
  },
  {
    hits: [['Discount for usage in public repositories (100% off)', '公共存储库使用量折扣（减免 100%）']],
    misses: ['Discount for usage in public repositories']
  },
  {
    hits: [['Based on 12 additional premium requests beyond your included usage.', '基于超出包含的使用量的 12 个额外高级请求。']],
    misses: ['Based on additional premium requests beyond your included usage.']
  },
  {
    hits: [['Based on 1,500 additional AI credits beyond your included usage.', '基于超出包含的使用量的 1,500 个额外 AI 额度。']],
    misses: ['Based on some additional AI credits beyond your included usage.']
  },
  {
    hits: [
      [
        'Cost calculated based on additional 30 premium requests for Copilot and Spark.',
        '费用按 Copilot 和 Spark 的 30 个额外高级请求计算。'
      ]
    ],
    misses: ['Cost calculated based on additional premium requests for Copilot and Spark.']
  },
  {
    hits: [['Cost calculated based on additional 30 premium requests.', '费用按 30 个额外高级请求计算。']],
    misses: ['Cost calculated based on usage.']
  },
  {
    hits: [['Cost calculated based on additional 4 token units', '费用按 4 个额外令牌单位计算']],
    misses: ['Cost calculated based on additional token units']
  },
  {
    hits: [
      [
        'Cost calculated based on 25 Spark premium requests that exceed the premium request usage included with your Copilot licenses.',
        '费用按超出 Copilot 许可证包含的高级请求使用量的 25 个 Spark 高级请求计算。'
      ]
    ],
    misses: ['Cost calculated based on Spark premium requests.']
  },
  {
    hits: [['/ 3,000 AI credits', '/ 3,000 AI 额度']],
    misses: ['/ unlimited AI credits']
  },
  // 使用情况按 SKU 分组时核数可变的 SKU 名
  {
    hits: [
      ['Actions macOS 3-core', '操作 macOS 3 核'],
      ['Actions Linux 4-core', '操作 Linux 4 核'],
      ['Actions Windows 8-core', '操作 Windows 8 核']
    ],
    misses: ['Actions macOS', 'Actions Linux 4-core ARM']
  },
  {
    hits: [['Codespaces compute 2-core', '代码空间计算 2 核']],
    misses: ['Codespaces compute 2 cores']
  },
  {
    hits: [
      ['300 requests', '300 个请求'],
      ['1 request', '1 个请求']
    ],
    misses: ['Pending requests']
  },
  {
    hits: [['1,250 min', '1,250 分钟']],
    misses: ['min']
  },
  {
    hits: [['12.5 hr', '12.5 小时']],
    misses: ['hr']
  },
  {
    hits: [['0.75 GB-hr', '0.75 GB·小时']],
    misses: ['GB-hr']
  },
  {
    hits: [
      ['Timeframe: Current month', '时间范围：本月'],
      ['Timeframe: This year (2025)', '时间范围：今年 (2025)'],
      ['Time frame: Last month', '时间范围：上个月']
    ],
    misses: ['Timeframe: Next month']
  },
  {
    hits: [['Last year (2024)', '去年 (2024)']],
    misses: ['Next year (2027)']
  },
  {
    hits: [
      ['Group: Product', '分组：产品'],
      // Group by → 分组依据
      ['Group by: Repository', '分组依据：存储库'],
      ['Group: None', '分组：无'],
      ['Group by: Cost centers', '分组依据：成本中心']
    ],
    misses: ['Group: Workflow']
  },
  {
    hits: [
      ['Metered usage grouped by Product', '按产品分组的按流量计费的使用情况'],
      ['Actions usage grouped by SKU', '按 SKU 分组的操作使用情况'],
      ['Premium requests usage grouped by Model', '按模型分组的高级请求使用情况'],
      // 分组名大小写混用
      ['Advanced Security usage grouped by skus', '按 SKU 分组的高级安全使用情况']
    ],
    misses: ['Metered usage grouped by Day', 'Metered usage grouped by SKUS']
  },
  {
    hits: [['Top three repositories this month', '本月排名前三的存储库']],
    misses: ['Top ten repositories this month']
  },
  {
    hits: [['Oct 26, 2025 (All times in UTC)', '2025年10月26日（UTC 时间）']],
    misses: ['Today (All times in UTC)']
  },
  {
    hits: [
      ['Usage for Oct 26, 2025', '2025年10月26日的使用情况'],
      ['Usage for Oct 26, 2025.', '2025年10月26日的使用情况。'],
      ['Usage for Oct 1 - Oct 31, 2026.', '10月1日 - 2026年10月31日的使用情况。']
    ],
    misses: ['Usage for today', 'Usage for Oct 1 - later.']
  },
  {
    hits: [
      [
        'Usage for Oct 1 - Oct 31, 2026. For license-based products, the price/unit is a prorated portion of the monthly price.',
        '10月1日 - 2026年10月31日的使用情况。对于按许可证计费的产品，单价为月价按比例折算的部分。'
      ]
    ],
    misses: ['Usage for today. For license-based products, the price/unit is a prorated portion of the monthly price.']
  },
  {
    hits: [
      ['Oct 1 - Oct 31, 2025', '10月1日 - 2025年10月31日'],
      ['Sep 1, 2025 - Sep 30, 2025', '2025年9月1日 - 2025年9月30日']
    ],
    misses: ['Oct 1 - later']
  },
  {
    hits: [['Metered usage before the billing transition, until April 04, 2025', '计费过渡前按流量计费的使用情况，截至 2025年4月4日']],
    misses: ['Metered usage before the billing transition, until further notice']
  },
  // 使用情况图表的无障碍描述（原文无逗号、冒号，译文不加：“X 图表显示 Y 的数据。找到 N 个数据点。”）
  {
    hits: [
      [
        'Metered usage chart showing data for Current month. 26 data points found.',
        '按流量计费的使用情况图表显示本月的数据。找到 26 个数据点。'
      ],
      [
        'AI usage chart showing data for Oct 1 - Oct 31, 2026. 1 data point found.',
        'AI 使用情况图表显示 10月1日 - 2026年10月31日的数据。找到 1 个数据点。'
      ],
      [
        'Actions usage grouped by SKU chart showing data for Last month. 3 data points found.',
        '按 SKU 分组的操作使用情况图表显示上个月的数据。找到 3 个数据点。'
      ]
    ],
    misses: ['Metered usage chart showing data.']
  },
  {
    hits: [
      ['Metered usage. Interactive chart.', '按流量计费的使用情况。交互式图表。'],
      ['Copilot usage. Interactive chart.', 'Copilot 使用情况。交互式图表。']
    ],
    misses: ['Interactive chart.']
  },
  {
    hits: [
      ['Line chart with 26 data points.', '包含 26 个数据点的折线图。'],
      ['Bar chart with 1 data point.', '包含 1 个数据点的条形图。']
    ],
    misses: ['Radar chart with 5 data points.']
  },
  {
    hits: [
      [
        'The chart has 1 X axis displaying Time. Data ranges from 2026-10-01 00:00:00 to 2026-10-26 00:00:00.',
        '图表有 1 条显示时间的 X 轴。数据范围为 2026-10-01 00:00:00 至 2026-10-26 00:00:00。'
      ],
      [
        'The chart has 1 Y axis displaying Billing. Data ranges from 0.8 to 44.18.',
        '图表有 1 条显示计费金额的 Y 轴。数据范围为 0.8 至 44.18。'
      ],
      // 未收录的坐标轴名保留原文
      ['The chart has 1 Y axis displaying Requests. Data ranges from 0 to 5.', '图表有 1 条显示 Requests 的 Y 轴。数据范围为 0 至 5。']
    ],
    misses: ['The chart has 1 X axis displaying Time.']
  },

  // 预算
  {
    hits: [
      ['3 budgets', '3 个预算'],
      ['1 budget', '1 个预算']
    ],
    misses: ['Some budgets']
  },
  {
    hits: [['$12.34 spent', '已支出 $12.34']],
    misses: ['Nothing spent']
  },
  {
    hits: [['/ $0.00 spent', '/ 已支出 $0.00']],
    misses: ['/ nothing spent']
  },
  {
    hits: [['$50 budget', '预算 $50']],
    misses: ['Monthly budget']
  },
  {
    hits: [['2 selected', '已选择 2 项']],
    misses: ['None selected']
  },
  {
    hits: [
      // 原文无标点，译文不加逗号
      ['Showing 1 to 5 of 5 budgets', '显示 5 个预算中的第 1 至 5 个'],
      ['Showing 1 to 1 of 1 budget', '显示 1 个预算中的第 1 至 1 个']
    ],
    misses: ['Showing all budgets']
  },
  {
    hits: [
      ['1-5 of 5', '5 项中的第 1-5 项'],
      ['11-20 of 42', '42 项中的第 11-20 项']
    ],
    misses: ['1-5 of many']
  },
  {
    hits: [['Budget utilization for mona', 'mona 的预算使用率']],
    misses: ['Budget utilization']
  },
  {
    hits: [
      // 预算名是产品名时译成中文，品牌词 Git LFS 保留
      ['View actions for Actions budget for Account mona', '查看帐户 mona 的操作预算的操作'],
      ['View actions for Codespaces budget for Account mona', '查看帐户 mona 的代码空间预算的操作'],
      ['View actions for All AI Credit SKUs budget for Account mona', '查看帐户 mona 的所有 AI 额度 SKU 预算的操作'],
      ['View actions for Git LFS budget for Organization acme', '查看组织 acme 的 Git LFS 预算的操作']
    ],
    misses: ['View actions for Actions budget', 'View actions for Actions budget for Team core']
  },

  // 使用情况报告（句号随原文）
  {
    hits: [
      [
        "We're preparing your usage report. It may take ~30 minutes to see usage in your report. We'll send an email to mona@example.com when it's ready.",
        '正在准备使用情况报告。使用情况可能约30分钟后才会出现在报告中。报告就绪后会发送电子邮件至 mona@example.com。'
      ]
    ],
    misses: ["We're preparing your usage report."]
  },
  {
    hits: [
      [
        'We’re preparing your usage report. We’ll send an email to mona@example.com when it’s ready.',
        '正在准备使用情况报告。报告就绪后会发送电子邮件至 mona@example.com。'
      ]
    ],
    misses: ["We're preparing your usage report. We'll send an email when it's ready."]
  },
  {
    hits: [
      [
        "Your usage report request is already in progress. Check mona@example.com for the report when it's ready.",
        '你的使用情况报告请求正在处理中。报告就绪后请查收 mona@example.com。'
      ]
    ],
    misses: ['Your usage report request is already in progress.']
  },
  {
    hits: [["The usage report will be emailed when it's ready to mona@example.com.", '报告就绪后将通过电子邮件发送至 mona@example.com。']],
    misses: ["The usage report will be emailed when it's ready."]
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('settings-account 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Link to social profile ', '2'].join('')))).toBe('社交帐户链接 2')
    expect(translate(normalizeText(['$', '12.34', ' spent'].join('')))).toBe('已支出 $12.34')
    expect(translate(normalizeText(['3', ' budgets'].join('')))).toBe('3 个预算')
    expect(translate(normalizeText(['1,200', ' min used / ', '2,000', ' min included'].join('')))).toBe('已用 1,200 分钟 / 包含 2,000 分钟')
  })

  it('被元素隔开的片段单独命中', () => {
    // 更改密码要求：Make sure it's <strong>at least 15 characters</strong> OR …
    expect(translate("Make sure it's")).toBe('请确保密码')
    expect(translate('at least 15 characters')).toBe('至少 15 个字符')
    expect(translate('OR')).toBe('或')
    expect(translate('including a number')).toBe('且包含数字')
    // 导出：Export all repositories and profile metadata for <strong>octocat</strong>. Exports …
    expect(translate('Export all repositories and profile metadata for')).toBe('导出帐户')
    expect(translate('. Exports will be available for 7 days.')).toBe('的所有存储库和个人资料元数据。导出文件将保留 7 天。')
    // 电子邮件隐私：Because you have email privacy enabled, <strong>电子邮件</strong> will be used for …
    expect(translate('Because you have email privacy enabled,')).toBe('由于你已启用电子邮件隐私，')
    expect(translate('will be used for account-related notifications as well as password resets.')).toBe('将用于帐户相关通知和重置密码。')
    // 计费卡片：Gross metered usage for <span>Oct 1 - Oct 31, 2025</span>.
    expect(translate('Gross metered usage for')).toBe('按流量计费的使用情况总额')
    expect(translate('Oct 1 - Oct 31, 2025')).toBe('10月1日 - 2025年10月31日')
    // 教育福利：We require applicants of <strong>学校</strong> to use one of these …
    expect(translate('We require applicants of')).toBe('我们要求')
    expect(translate('to use one of these school-issues email addresses to apply:')).toBe('的申请人使用以下学校电子邮件地址之一进行申请：')
    // 字符键：<a>GitHub shortcuts</a> that don't use … the <kbd>g n</kbd> shortcut …, or <kbd>?</kbd> to view …
    expect(translate("that don't use modifier keys in their activation. For example, the")).toBe('中无需修饰键即可触发的快捷方式。例如')
    expect(translate('shortcut to navigate notifications, or')).toBe('快捷方式用于前往通知，或')
    // 继任者：…to my GitHub Successor, <a>designated below</a>, in the event of my death. …
    expect(translate('designated below')).toBe('即下方指定的人')
    // Patreon：Disconnect the Patreon account <电子邮件> for <@帐户> to sponsor maintainers with. …
    expect(translate('Disconnect the Patreon account')).toBe('断开用于赞助维护者的 Patreon 帐户')
    expect(translate('for')).toBe('与')
    expect(translate('to sponsor maintainers with. Any sponsorships made on Patreon will no longer receive recognition on GitHub.')).toBe(
      '的连接。在 Patreon 上的赞助将不再在 GitHub 上获得认可。'
    )
    // 删除确认：To verify, type <delete my account> exactly as it appears:
    expect(translate('To verify, type')).toBe('请原样输入')
    expect(translate('exactly as it appears:')).toBe('以完成验证：')
    // 删除帐户：You must <a>remove yourself</a>, … before you can delete your user.
    expect(translate('before you can delete your user.')).toBe('才能删除你的帐户。')
    // 电子邮件隐私：We’ll remove your public profile email and use <strong>noreply</strong> when performing …（原文无逗号）
    expect(translate('We’ll remove your public profile email and use')).toBe('我们将移除个人资料中的公开电子邮件并使用')
    // 禁用 2FA：Some GitHub users are <strong>now required</strong> to enable …
    expect(translate('Some GitHub users are')).toBe('部分 GitHub 用户')
    // now required 由 common/site.ts 的全局词条翻译，本词典不收
    expect(dict.scoped?.['now required']).toBeUndefined()
    expect(
      createMatcher([
        ['common', common],
        ['settings', settingsAccount]
      ]).translate('now required', ['common', 'settings'])
    ).toBe('现在必须')
    // 教育福利：<span>Good</span> proof requires …
    expect(translate('Good')).toBe('良好')
    expect(translate('proof types may lower your chances of being approved.')).toBe('证明类型可能会降低你获得批准的几率。')
    // 计划价格：$0 <span>per</span> <span>month</span>
    expect(translate('per')).toBe('/')
    expect(translate('month')).toBe('月')
    // 强制启用 2FA：日期在单独元素中「… starting <date>. Thank you …」→ “…将从 <日期> 起需要启用…”
    expect(translate('Because of your contributions on GitHub, two-factor authentication will be required for your account starting')).toBe(
      '鉴于你在 GitHub 上的贡献，你的帐户将从'
    )
    expect(translate('. Thank you for helping keep the ecosystem safe!')).toBe('起需要启用双因素身份验证。感谢你帮助维护生态安全！')
    // 教育福利：You are unlikely to be verified until you have completed your <a>GitHub user profile</a> with …
    // → “你需要先在 <GitHub 用户个人资料> 中填写…全名才有可能通过验证。”
    expect(translate('You are unlikely to be verified until you have completed your')).toBe('你需要先在')
    expect(
      translate(
        'with your full name exactly as it appears in your academic affiliation document. Please do not use a variation of your name or a nickname. Once you have updated your profile information log out and log back into GitHub before re-applying.'
      )
    ).toBe(
      '中填写与学术证明文件完全一致的全名才有可能通过验证。请勿使用姓名的变体或昵称。更新个人资料信息后请先退出并重新登录 GitHub 再重新申请。'
    )
  })

  it('日期选择器的星期缩写 We 与改名警告的 We 冲突，两者都不翻译', () => {
    expect(translate('We')).toBeUndefined()
  })

  it('原文无标点的片段，译文不加标点', () => {
    expect(translate('Authenticator apps and browser extensions like')).toBe('身份验证器应用和浏览器扩展如')
    expect(translate('Last accessed on')).toBe('上次访问于')
    expect(translate('Registered -')).toBe('注册于')
    expect(translate('Keep your recovery codes safe and easy to access')).toBe('请妥善保管恢复代码并确保随时可以取用')
    expect(translate('Strengthen your account by ensuring your password is strong.')).toBe('通过设置高强度密码增强帐户安全。')
    expect(translate('automatically receive notifications when a new vulnerability is found in one of your dependencies.')).toBe(
      '的访问权限后将自动收到你的依赖项中发现新漏洞的通知。'
    )
  })

  it('句号随原文，不改成逗号', () => {
    expect(translate('Two-factor code verification failed. Please try again.')).toBe('双因素验证码验证失败。请重试。')
    expect(translate('Once you delete your account, there is no going back. Please be certain.')).toBe(
      '帐户一旦删除便无法恢复。请谨慎操作。'
    )
    expect(translate('Your profile picture has been reset. It may take a few minutes to update across the site.')).toBe(
      '你的个人资料图片已重置。全站更新可能需要几分钟。'
    )
    expect(translate("Enable 2FA now. You'll be able to continue on with your work right after.")).toBe('立即启用 2FA。之后即可继续工作。')
  })
})

describe('settings-account 工具函数', () => {
  it('joinNames 用顿号和“或”连接推荐用户名', () => {
    expect(joinNames('octocat-1, octocat-2, or octocat-3')).toBe('octocat-1、octocat-2 或 octocat-3')
    expect(joinNames('octocat-1 or octocat-2')).toBe('octocat-1 或 octocat-2')
    expect(joinNames('octocat-1')).toBe('octocat-1')
  })

  it('groupedBy 为英文分组名加空格，未知分组保留原文', () => {
    expect(groupedBy('Repositories')).toBe('按存储库分组')
    expect(groupedBy('SKU')).toBe('按 SKU 分组')
    expect(groupedBy('skus')).toBe('按 SKU 分组')
    expect(groupedBy('Workflow')).toBe('按 Workflow 分组')
  })

  it('joinCjk（helpers）拼接中文前缀：后接数字或英文时补空格，后接中文时直接相连', () => {
    expect(joinCjk('提交于', '3天前')).toBe('提交于 3天前')
    expect(joinCjk('提交于', '昨天')).toBe('提交于昨天')
    expect(joinCjk('按产品分组的', 'Actions 使用情况')).toBe('按产品分组的 Actions 使用情况')
    expect(joinCjk('按', 'SKU')).toBe('按 SKU')
    expect(joinCjk('', '使用情况')).toBe('使用情况')
  })

  it('passwordProblems 两项用“且”连接，三项以上用逗号并在最后一项前加“且”', () => {
    expect(passwordProblems('cannot include your login')).toBe('不能包含你的登录名')
    expect(passwordProblems('is too short (minimum is 8 characters) and is invalid')).toBe('太短（最少 8 个字符）且无效')
    expect(passwordProblems('is too short (minimum is 8 characters), needs at least 1 number, and cannot include your login')).toBe(
      '太短（最少 8 个字符），至少需要 1 个数字，且不能包含你的登录名'
    )
  })
})

describe('settings-account 静态词条', () => {
  it.each([
    // 导航与页头
    ['Public profile', '公开个人资料'],
    ['Password and authentication', '密码和身份验证'],
    ['SSH and GPG keys', 'SSH 和 GPG 密钥'],
    ['Go to settings page', '转到设置页面'],
    ['Your Profile', '你的个人资料'],
    // 公开个人资料
    ['Update profile', '更新个人资料'],
    ['Upload a photo…', '上传照片…'],
    ['Upload a photo...', '上传照片...'],
    ['Remove photo', '删除照片'],
    ['Revert to Gravatar', '恢复为 Gravatar 头像'],
    ['Contributions & activity', '贡献与活动'],
    ['Make profile private and hide activity', '将个人资料设为私密并隐藏活动'],
    ['Include private contributions on my profile', '在个人资料中包含私密贡献'],
    ['Show Achievements on my profile', '在个人资料中显示成就'],
    ['Available for hire', '接受工作机会'],
    ['We only support PNG, GIF, or JPG pictures.', '仅支持 PNG、GIF 或 JPG 图片。'],
    // 帐户
    ['Change username', '更改用户名'],
    ['Your account has been renamed', '你的帐户已重命名'],
    ['Your account has been renamed.', '你的帐户已重命名。'],
    ['Remember to update your local repositories to point to the new location.', '记得更新本地存储库，使其指向新位置。'],
    ['Export account data', '导出帐户数据'],
    ['Successor settings', '继任者设置'],
    ['Delete account', '删除帐户'],
    // 外观与辅助功能
    ['Theme preferences', '主题首选项'],
    ['Single theme', '单一主题'],
    ['Light Protanopia & Deuteranopia', '浅色红绿色盲'],
    ['Dark dimmed', '深色柔和'],
    ['Tab size preference', '制表符宽度首选项'],
    ['Autoplay animated images', '自动播放动图'],
    ['URL paste behavior', 'URL 粘贴行为'],
    // 通知设置
    ['Default notifications email', '默认通知电子邮件'],
    ['Participating, @mentions and custom', '参与、@提及和自定义'],
    ['Only notify for failed workflows', '仅在工作流失败时通知'],
    ['Dependabot alerts: Email digest', 'Dependabot 警报：电子邮件摘要'],
    ['Notification Settings', '通知设置'],
    // 电子邮件
    ['Keep my email addresses private', '对我的电子邮件地址保密'],
    ['Block command line pushes that expose my email', '阻止会暴露我电子邮件的命令行推送'],
    ['Receive all emails, except those I unsubscribe from.', '接收所有电子邮件，已取消订阅的除外。'],
    ['Save email preferences', '保存电子邮件首选项'],
    // 密码和身份验证
    ['I forgot my password', '我忘记了密码'],
    ['Preferred 2FA method', '首选 2FA 方法'],
    ['Passwordless sign-in with passkeys', '使用通行密钥免密码登录'],
    ['Generate new recovery codes', '生成新的恢复代码'],
    // 会话
    ['Web sessions', '网页会话'],
    ['Your current session', '你的当前会话'],
    // 计费与许可
    ['Current metered usage', '当前按流量计费的使用情况'],
    ['Compare base plans', '比较基础计划'],
    ['Budget amount', '预算金额'],
    ['Save invoice preference', '保存发票首选项'],
    ['Learn more about billing', '了解计费'],
    ['Actions usage', '操作使用情况'],
    // 本轮补齐
    ['Settings menu', '设置菜单'],
    ['Profile updated successfully', '个人资料已更新'],
    ["GitHub's standard light theme with full color contrast and brightness.", '具有完整色彩对比度和亮度的 GitHub 标准浅色主题。'],
    ['Light tritanopia', '浅色蓝黄色盲'],
    ['Medium-Light Skin Tone', '中等-浅肤色'],
    ['Selected theme:', '所选主题：'],
    ['Connected to Google', '已连接 Google'],
    ['Disconnect from Google', '断开与 Google 的连接'],
    ['Delete: At least one non-backup email is required.', '删除：至少需要一个非备用电子邮件地址。'],
    ['Are you sure you want to disable two-factor authentication?', '确定要禁用双因素身份验证吗？'],
    ["This browser doesn't support security keys yet.", '此浏览器尚不支持安全密钥。'],
    ['Disabling...', '禁用中...'],
    ['Spent', '已支出'],
    ['Included usage alerts: On', '包含的使用量警报：开'],
    ['Search or filter usage (chart updates as you type)', '搜索或筛选使用情况（图表随输入更新）'],
    ['Confirm removing payment method', '确认删除付款方式'],
    ['Upgrade Individual Plan', '升级个人计划'],
    ['Code owners, required reviewers, GitHub Pages,', '代码所有者、必需审查者、GitHub 页面'],
    // 按 GLOSSARY 统一（术语、进度提示、省略号与破折号随原文）
    ['Primary email address', '主要电子邮件地址'],
    ['Payment method', '付款方式'],
    ['Profile picture', '个人资料图片'],
    ['Show details', '显示详细信息'],
    ['Required status checks', '必需的状态检查'],
    ['Marketplace apps', '市场应用'],
    ['Deleting…', '删除中…'],
    ['Loading Actions data...', '正在加载操作数据...'],
    ['Profile updated successfully —', '个人资料已更新——'],
    ['Enable two-factor authentication (2FA)', '启用双因素身份验证 (2FA)'],
    // connect / link → 连接 / 链接；email → 电子邮件；2FA method → 2FA 方法；profile → 个人资料
    ['Successfully connected your GitHub account with Patreon.', '已将你的 GitHub 帐户与 Patreon 连接。'],
    ['Successfully disconnected your GitHub account from Patreon.', '已断开你的 GitHub 帐户与 Patreon 的连接。'],
    ['Connect your ORCID iD', '连接 ORCID iD'],
    ['Disconnect your ORCID iD', '断开 ORCID iD 连接'],
    ['Resend verification email', '重新发送验证电子邮件'],
    ['Customize email updates', '自定义电子邮件更新'],
    ['Email me the report', '通过电子邮件发送报告'],
    ["Don't get locked out, configure additional authentication methods", '为防止无法访问帐户，请配置更多身份验证方法'],
    ['Alternative 2FA option:', '其他 2FA 方法：'],
    ['Jobs profile', '求职个人资料'],
    // 原文无冒号，译文不加
    ['e.g. 2 hours ago', '例如 2小时前'],
    // 产品名、方案名按用户规定译成中文（Actions → 操作、Codespaces → 代码空间、Packages → 软件包、Pages → 页面、
    // Marketplace → 市场、GitHub Mobile → GitHub 移动版、Pro → 专业版、Free → 免费版、Business → 商业版）
    ['2,000 Actions minutes/month', '每月 2,000 操作分钟数'],
    ['500MB of Packages storage', '500MB 软件包存储'],
    ['20GB of Codespaces storage', '20GB 代码空间存储'],
    ['180 core-hours of Codespaces compute', '180 核心小时的代码空间计算'],
    ['Billable spend for Codespaces for the selected timeframe.', '所选时间范围内代码空间的可计费支出。'],
    ['Free use of GitHub Actions', 'GitHub 操作的免费使用'],
    ['GitHub Models rate limits', 'GitHub 模型速率限制'],
    ['Pages for static website hosting', '用于托管静态网站的页面'],
    ['Marketplace and integrations', '市场和集成'],
    ['Downgrade to Free', '降级到免费版'],
    ['Upgrade to Pro', '升级到专业版'],
    ['Upgrade to GitHub Pro', '升级到 GitHub 专业版'],
    ['Upgrade to Copilot Pro+', '升级到 Copilot 专业增强版'],
    ['Upgrade to Business', '升级到商业版'],
    ['Learn more about GitHub Enterprise', '了解 GitHub 企业版'],
    ['We hope you enjoy your GitHub Education benefits.', '希望你喜欢 GitHub 教育福利。'],
    // 「180 monthly Codespaces hours」带“的”，避免“小时代码”连读
    [
      'Get Copilot for free, 180 monthly Codespaces hours for cloud coding, unlimited private repositories with GitHub Pro or Team, and dozens of premium tools in the Student Developer Pack.',
      '免费使用 Copilot，每月 180 小时的代码空间云端编程时长，通过 GitHub 专业版或团队版使用无限专用存储库，以及学生开发人员包中的数十种高级工具。'
    ],
    ['GitHub Mobile sessions', 'GitHub 移动版会话'],
    ['Manage GitHub Mobile', '管理 GitHub 移动版'],
    // 功能名 playground 按官方文档译“操场”
    [
      'The playground and free API usage are rate limited by requests per minute, requests per day, tokens per request, and concurrent requests.',
      '操场和免费 API 的使用受每分钟请求数、每天请求数、每个请求的令牌数和并发请求数限制。'
    ],
    // 原文没有的括号、逗号不加，用定语代替
    [
      'This email address is the default for GitHub notifications, such as replies to issues, pull requests, and similar activity.',
      '此电子邮件地址是对议题、拉取请求的回复及类似活动等 GitHub 通知的默认地址。'
    ],
    // 价格义 Free 仍作“免费”；品牌词保留
    ['Free for public repositories', '公共存储库免费'],
    ['You are eligible to use GitHub Copilot for free.', '你有资格免费使用 GitHub Copilot。'],
    ['Upgrade to Copilot Max', '升级到 Copilot Max'],
    // PRO 徽章指 Pro 方案
    ['Display PRO badge', '显示专业版徽章'],
    // 计费使用情况按 SKU 分组时的 SKU 名（组织计费页同样生效）
    ['Actions Linux', '操作 Linux'],
    ['Actions Windows', '操作 Windows'],
    ['Copilot Premium Request', 'Copilot 高级请求'],
    // 选择要升级的帐户、兑换页（/redeem 只有 common 作用域，放 static）
    ['Which do you want to upgrade?', '要升级哪个帐户？'],
    ['Enter coupon code', '输入优惠码'],
    ['Redeem', '兑换'],
    // 双因素身份验证管理页的标签页标题
    ['Manage two-factor authentication', '管理双因素身份验证'],
    // 教育福利申请未通过的原因
    [
      'The image you captured appears to be a screen display. Please take a clear, live photo of physical documentation confirming your academic enrollment.',
      '你拍摄的图片似乎是屏幕画面。请为能证明你在读身份的实体文件现场拍摄一张清晰的照片。'
    ],
    [
      'The image you selected does not appear to contain your school name. Your complete school name must appear in your document, not only the school logo. You may include multiple documents together. If your official document is not in English then you may photograph the original next to an English translation.',
      '你选择的图片中似乎没有学校名称。文件中必须出现学校的完整名称，而不仅仅是校徽。你可以将多份文件放在一起。如果你的正式文件不是英文的，可以将原件与英文译本并排拍照。'
    ],
    // 位置原因的现行版本（前面多两句）
    [
      'You appear not to be near any campus location for the school you have selected. Your academic affiliation documentation must indicate virtual learning if you are remote. You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect e.g. missing campus location(s), then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.',
      '你似乎不在所选学校的任何校园位置附近。如果你远程上课，学术证明文件中必须注明为线上学习。你必须配置浏览器和操作系统以允许访问位置信息。不得使用 VPN。如果你认为我们掌握的学校信息不完整或不正确，例如缺少校园位置，请在提交 GitHub 教育支持工单时选择“我选择的学校信息不正确或不完整，例如域或校园位置”选项。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Update profile \n', ['common', 'settings'])).toBe('  更新个人资料 \n')
  })

  it('不重复收录 common 的全站词条', () => {
    const commonStatic = common.static ?? {}
    const duplicated = Object.keys(dict.static ?? {}).filter(key => key in commonStatic)
    expect(duplicated).toEqual([])
  })

  it('兑换页（/redeem）只有 common 作用域：词条放 static 才生效', () => {
    expect(matcher.translate('Enter coupon code', ['common'])).toBe('输入优惠码')
    expect(matcher.translate('Redeem', ['common'])).toBe('兑换')
    expect(dict.scoped?.Redeem).toBeUndefined()
  })
})

describe('settings-account 页面词条', () => {
  it.each([
    ['Access', '访问'],
    ['Archives', '存档'],
    ['Billing and licensing', '计费和许可'],
    ['Budgets and alerts', '预算和警报'],
    ['Emails', '电子邮件'],
    ['Sessions', '会话'],
    ['Danger zone', '危险区域'],
    ['Sync with system', '跟随系统'],
    ['Contrast', '对比度'],
    ['Watching', '正在关注'],
    ['Primary', '主要'],
    ['Backup', '备用'],
    ['Authenticator app', '身份验证器应用'],
    ['SMS/Text message', '短信'],
    ['Recovery options', '恢复选项'],
    ['Nickname', '昵称'],
    ['revoke', '撤销'],
    ['Invoice', '发票'],
    ['Protected branches', '受保护分支'],
    ['You must', '你必须先'],
    ['below:', '：'],
    ['Downgrade', '降级'],
    ['Timeframe', '时间范围'],
    // 本轮补齐
    ['settings', '设置'],
    ['Cloud', '云端'],
    ['they/them', 'TA'],
    ['she/her', '她'],
    ['he/him', '他'],
    ['Social account', '社交帐户'],
    ['Neutral', '中性'],
    ['Username', '用户名'],
    ['are available.', '可用。'],
    ['Fair', '一般'],
    ['here', '此处'],
    // 按 GLOSSARY 统一（与组织设置一致；设置侧栏 Pages 译“页面”）
    ['Blocked users', '已阻止的用户'],
    ['Pages', '页面'],
    ['Moderation', '调解'],
    ['Developer settings', '开发人员设置'],
    ['Payment information', '付款信息'],
    ['Payment history', '付款历史记录'],
    ['Metered usage', '按流量计费的使用情况'],
    ['Two-factor methods', '双因素方法'],
    ['Pending', '待定'],
    ['Billing and plans', '计费和计划'],
    // 计划比较表：与 new 计划页的同名功能一致
    ['Multiple pull request assignees', '拉取请求的多个受理人'],
    ['Multiple issue assignees', '议题的多个受理人'],
    // 产品名、方案名按用户规定译成中文：侧栏与计费页的产品名、许可页的方案名、2FA 方法名
    ['Codespaces', '代码空间'],
    ['Actions', '操作'],
    ['GitHub Actions', 'GitHub 操作'],
    ['Advanced Security', '高级安全'],
    ['Pages and wikis', '页面和 Wiki'],
    ['GitHub Free', 'GitHub 免费版'],
    ['GitHub Pro', 'GitHub 专业版'],
    ['GitHub Team', 'GitHub 团队版'],
    ['GitHub Enterprise', 'GitHub 企业版'],
    ['Copilot Free', 'Copilot 免费版'],
    ['Copilot Pro', 'Copilot 专业版'],
    ['Copilot Pro+', 'Copilot 专业增强版'],
    ['Copilot Business', 'Copilot 商业版'],
    ['Copilot Enterprise', 'Copilot 企业版'],
    ['GitHub Mobile', 'GitHub 移动版'],
    ['GitHub Sponsors', 'GitHub 赞助'],
    ['GitHub Education', 'GitHub 教育'],
    // 降级提示中的 FREE 指方案
    ['FREE', '免费版'],
    // 教育福利申请的身份选项：设置页固定为“学生”，不随全局的 Copilot 计划标签变
    ['Student', '学生'],
    // connect → 连接
    ['Disconnect the subscription', '断开订阅连接']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('公开个人资料的首选语言下拉框沿用趋势页的自然语言名', () => {
    expect(translate('Chinese')).toBe('中文')
    expect(translate('Interlingua (International Auxil...')).toBe('国际语（国际辅助语言协会）')
    expect(matcher.translate('Chinese', ['common', 'repository'])).toBeUndefined()
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Access', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Danger zone', ['common', 'org-settings'])).toBeUndefined()
    expect(matcher.translate('3 budgets', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('Chrome on Windows 10', ['common', 'code'])).toBeUndefined()
    expect(matcher.translate('octocat is available.', ['common', 'auth'])).toBeUndefined()
    // Pages、Actions、Codespaces 只放 scoped：放进全站 static 会误译同形的目录名、工作流名等用户内容
    expect(matcher.translate('Pages', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Actions', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Codespaces', ['common', 'repository'])).toBeUndefined()
  })

  it('品牌词保留英文，不收词条', () => {
    for (const name of ['Copilot', 'Spark', 'Git LFS', 'Dependabot', 'ORCID iD']) {
      expect(dict.static?.[name]).toBeUndefined()
      expect(dict.scoped?.[name]).toBeUndefined()
      expect(translate(name)).toBeUndefined()
    }
  })

  it('译文中不残留英文产品名、方案名', () => {
    const names =
      /(?<![A-Za-z])(Actions|Codespaces|codespaces?|Packages|Pages|Marketplace|Mobile|Desktop|Advanced Security|Enterprise Server|Pro\+?|Business|Models|Sponsors|Education|Playground)(?![A-Za-z+])/
    const leaked = Object.entries({ ...dict.static, ...dict.scoped })
      .filter(([, value]) => names.test(value))
      .map(([key]) => key)
    expect(leaked).toEqual([])
  })
})

describe('settings-account 页面渲染', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function run(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({
      matcher,
      host: window,
      resolvePages: () => ['common', 'settings'],
      collectUntranslated: true
    })
    translator.start()
  }

  it('保存个人资料的提示：破折号译作「——」，链接前不留空格', () => {
    // 结构同保存后的闪现提示：文本「Profile updated successfully — 」后接链接「view your profile.」
    run(`<div class="flash flash-full flash-notice"><div class="js-flash-alert" role="alert">
      Profile updated successfully — <a href="/octocat">view your profile.</a>
    </div></div>`)
    const alert = document.querySelector('.js-flash-alert')!
    expect(alert.textContent?.trim()).toBe('个人资料已更新——查看个人资料。')
    expect(alert.querySelector('a')?.textContent).toBe('查看个人资料。')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('停止后还原原文', () => {
    run(`<div class="js-flash-alert" role="alert">Profile updated successfully — <a href="/octocat">view your profile.</a></div>`)
    translator?.stop()
    expect(document.querySelector('.js-flash-alert')?.textContent).toBe('Profile updated successfully — view your profile.')
  })

  it('教育福利未通过原因：被链接拆开的句子按片段翻译，拼读通顺', () => {
    // 结构同 /settings/education/benefits「Reason(s):」下的列表：链接前后各是一个文本节点
    run(`<ul>
      <li id="camera">Please use your device camera to submit your academic affiliation documents. If you’re having trouble using your device camera, please allow camera access for the application website on your browser. The steps for this will vary depending on which browser you are using. Information on browsers supported by GitHub can be found <a href="https://docs.github.com/">here</a>. You may also try applying from a different computer or mobile device.</li>
      <li id="last-name">Please ensure that your academic affiliation document contains your last name exactly as it appears in your <a href="/settings/billing/payment_information">GitHub billing information</a>. If you have only a single legal name, enter it in both the first and last name fields of your GitHub billing information.</li>
      <li id="first-name">Please ensure that your academic affiliation document contains your first name exactly as it appears in your <a href="/settings/billing/payment_information">GitHub billing information</a>. Variations of your name and nicknames are unacceptable.</li>
    </ul>`)
    const shown = (id: string): string | undefined => document.getElementById(id)?.textContent ?? undefined
    expect(shown('camera')).toBe(
      '请使用设备摄像头拍摄并提交你的学术证明文件。如果在使用设备摄像头时遇到问题，请在浏览器中允许申请网站访问摄像头。具体步骤因你使用的浏览器而异。有关 GitHub 支持的浏览器的信息，请参阅 此处。你也可以尝试换用其他电脑或移动设备申请。'
    )
    expect(shown('last-name')).toBe(
      '请确保学术证明文件中的姓氏与你的 GitHub 账单信息中的完全一致。如果你只有一个法定姓名，请在 GitHub 账单信息的名字和姓氏字段中都填写它。'
    )
    expect(shown('first-name')).toBe('请确保学术证明文件中的名字与你的 GitHub 账单信息中的完全一致。不接受姓名的变体或昵称。')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('更改用户名的完成页：被链接拆开的提示句整句翻译，按钮里的用户名保持原文', () => {
    // 结构同 /users/<用户>/rename：标题、提示句（链接在句中）、按钮（用户名未拆开、包在元素中两种）
    run(`<div class="blankslate">
      <h2 id="title">Your account has been renamed</h2>
      <p id="hint">Remember to <a href="https://docs.github.com/">update your local repositories</a> to point to the new location.</p>
      <a id="plain" class="btn btn-primary" href="/settings/admin">View octocat settings</a>
      <a id="wrapped" class="btn btn-primary" href="/settings/admin">View <span>octocat</span> settings</a>
    </div>`)
    const shown = (id: string): string | undefined => document.getElementById(id)?.textContent ?? undefined
    expect(shown('title')).toBe('你的帐户已重命名')
    expect(shown('hint')).toBe('记得更新本地存储库，使其指向新位置。')
    expect(document.querySelector('#hint a')?.textContent).toBe('更新本地存储库')
    expect(shown('plain')).toBe('查看 octocat 的设置')
    expect(shown('wrapped')).toBe('查看 octocat 的设置')
    expect(document.querySelector('#wrapped span')?.textContent).toBe('octocat')
  })

  it('更改用户名的完成页：地址按 settings 作用域识别，页脚由 common 译出', () => {
    document.body.innerHTML = `<main>
      <h2 id="title">Your account has been renamed</h2>
      <a id="plain" class="btn btn-primary" href="/settings/admin">View octocat settings</a>
      <a id="enterprise" href="/enterprises/octo-inc/settings">View enterprise settings</a>
    </main>
    <footer><ul>
      <li><a id="terms" href="https://docs.github.com/site-policy">Terms</a></li>
      <li><a id="docs" href="https://docs.github.com/">Docs</a></li>
      <li><button id="cookies" type="button">Manage cookies</button></li>
      <li><button id="dnsmpi" type="button">Do not share my personal information</button></li>
    </ul></footer>`
    const pages = detectPages(new URL('https://github.com/users/octocat/rename'))
    translator = createTranslator({ matcher: createMatcher(zhCN), host: window, resolvePages: () => pages })
    translator.start()
    const shown = (id: string): string | undefined => document.getElementById(id)?.textContent ?? undefined
    expect(shown('title')).toBe('你的帐户已重命名')
    expect(shown('plain')).toBe('查看 octocat 的设置')
    // 已收录的同形原文以 static 为准，不走按钮的正则
    expect(shown('enterprise')).toBe('查看企业设置')
    expect(['terms', 'docs', 'cookies', 'dnsmpi'].map(shown)).toEqual(['条款', '文档', '管理 Cookie', '不要共享我的个人信息'])
  })
})

describe('settings-account 繁体（zh-TW 语言包）', () => {
  const twMatcher = createMatcher(zhTW)

  it.each([
    // 计费 SKU 名（regexp 与 static；核数 SKU 与 Codespaces compute 同带「的」）
    ['Actions Linux', '動作 Linux'],
    ['Copilot Premium Request', 'Copilot 進階請求'],
    ['Actions macOS 3-core', '動作 macOS 3 核心'],
    ['Codespaces compute', '程式碼空間的運算'],
    ['Codespaces compute 2-core', '程式碼空間的運算 2 核心'],
    // 升级、双因素身份验证管理页标题
    ['Which do you want to upgrade?', '要升級哪個帳號？'],
    ['Manage two-factor authentication', '管理雙重驗證'],
    // 教育权益申请未通过的原因（被链接拆开的片段）
    ['. Variations of your name and nicknames are unacceptable.', '中的完全一致。不接受姓名的其他寫法或暱稱。'],
    [
      'The image you captured appears to be a screen display. Please take a clear, live photo of physical documentation confirming your academic enrollment.',
      '你拍攝的圖片似乎是螢幕畫面。請為能證明你在學身分的實體文件現場拍攝一張清晰的相片。'
    ],
    // 位置原因：旧版与现行版（submit 作「送出」）
    [
      'You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect, then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.',
      '你必須將瀏覽器和作業系統設定為允許存取位置資訊。不得使用 VPN。如果你認為我們掌握的學校資訊不完整或不正確，請在送出 GitHub 教育支援工單時選擇「我選擇的學校資訊不正確或不完整，例如網域或校園位置」選項。'
    ],
    [
      'You appear not to be near any campus location for the school you have selected. Your academic affiliation documentation must indicate virtual learning if you are remote. You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect e.g. missing campus location(s), then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.',
      '你似乎不在所選學校的任何校園位置附近。如果你遠距上課，學術身分證明文件中必須註明為線上學習。你必須將瀏覽器和作業系統設定為允許存取位置資訊。不得使用 VPN。如果你認為我們掌握的學校資訊不完整或不正確，例如缺少校園位置，請在送出 GitHub 教育支援工單時選擇「我選擇的學校資訊不正確或不完整，例如網域或校園位置」選項。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(twMatcher.translate(input, ['common', 'settings'])).toBe(expected)
  })

  it('兑换页只有 common 作用域', () => {
    expect(twMatcher.translate('Enter coupon code', ['common'])).toBe('輸入優惠碼')
    expect(twMatcher.translate('Redeem', ['common'])).toBe('兌換')
  })

  it('组织计费页（org-settings）的 SKU 名同样生效', () => {
    expect(twMatcher.translate('Actions Windows', ['common', 'org-settings'])).toBe('動作 Windows')
    expect(twMatcher.translate('Actions Linux 4-core', ['common', 'org-settings'])).toBe('動作 Linux 4 核心')
    expect(twMatcher.translate('Codespaces compute 8-core', ['common', 'org-settings'])).toBe('程式碼空間的運算 8 核心')
  })

  it('变更使用者名称的完成页（/users/<使用者>/rename）', () => {
    const pages = detectPages(new URL('https://github.com/users/octocat/rename'))
    expect(twMatcher.translate('Your account has been renamed', pages)).toBe('你的帳號已重新命名')
    expect(twMatcher.translate('Remember to update your local repositories to point to the new location.', pages)).toBe(
      '記得更新本機儲存庫以指向新位置。'
    )
    expect(twMatcher.translate('View octocat settings', pages)).toBe('查看 octocat 的設定')
    document.body.innerHTML = `<p id="hint">Remember to <a href="https://docs.github.com/">update your local repositories</a> to point to the new location.</p>
      <a id="wrapped" href="/settings/admin">View <span>octocat</span> settings</a>`
    const translator = createTranslator({ matcher: twMatcher, host: window, resolvePages: () => pages })
    translator.start()
    try {
      expect(document.getElementById('hint')?.textContent).toBe('記得更新本機儲存庫以指向新位置。')
      expect(document.getElementById('wrapped')?.textContent).toBe('查看 octocat 的設定')
    } finally {
      translator.stop()
      document.body.innerHTML = ''
    }
  })
})

describe('切换设置对象与 Copilot 记忆（整包、按地址识别页面）', () => {
  /** 用整个语言包按地址渲染一段页面，返回各 id 元素的文字 */
  function render(bundle: typeof zhCN, url: string, html: string): (id: string) => string | undefined {
    document.body.innerHTML = html
    const pages = detectPages(new URL(url))
    const translator = createTranslator({ matcher: createMatcher(bundle), host: window, resolvePages: () => pages })
    translator.start()
    const shown = (id: string): string | undefined => document.getElementById(id)?.textContent?.trim()
    const snapshot = new Map([...document.querySelectorAll('[id]')].map(element => [element.id, shown(element.id)]))
    translator.stop()
    document.body.innerHTML = ''
    return id => snapshot.get(id)
  }

  // 结构：settings 单独包在元素里，整句不在同一文本节点
  const SWITCHER =
    '<button id="switch" type="button"><span>Switch <span>settings</span> context</span></button><h2 id="select">Select settings context</h2>'
  const SIDEBAR =
    '<nav><a id="features" href="/settings/copilot/features">Features</a><a id="memory" href="/settings/copilot/memory">Memory</a></nav>'

  it.each([
    ['https://github.com/settings/profile', '切换设置对象'],
    ['https://github.com/organizations/octo-org/settings/profile', '切换设置对象']
  ])('%s：被元素拆开的「Switch settings context」整句翻译', (url, expected) => {
    const shown = render(zhCN, url, SWITCHER)
    expect(shown('switch')).toBe(expected)
    expect(shown('select')).toBe('选择设置对象')
  })

  it.each([
    ['https://github.com/settings/profile', '切換要設定的帳號'],
    ['https://github.com/organizations/octo-org/settings/profile', '切換要設定的帳號']
  ])('繁体 %s：同上', (url, expected) => {
    const shown = render(zhTW, url, SWITCHER)
    expect(shown('switch')).toBe(expected)
    expect(shown('select')).toBe('選擇要設定的帳號')
  })

  it('Copilot 侧栏的 Memory 菜单项', () => {
    expect(render(zhCN, 'https://github.com/settings/copilot/features', SIDEBAR)('memory')).toBe('记忆')
    expect(render(zhTW, 'https://github.com/settings/copilot/features', SIDEBAR)('memory')).toBe('記憶')
  })
})
