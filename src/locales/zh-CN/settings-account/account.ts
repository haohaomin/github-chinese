import type { PageDictionary } from '../../../core/types'

const LOGIN = '@?([\\w-]+)'

/** 推荐的可用用户名：“foo-1, foo-2, or foo-3” → “foo-1、foo-2 或 foo-3” */
export function joinNames(list: string): string {
  const names = list.split(/,? or |, /)
  if (names.length < 2) return list
  return `${names.slice(0, -1).join('、')} 或 ${names[names.length - 1]}`
}

/**
 * 帐户（/settings/admin）：更改用户名及确认对话框、更改用户名的完成页（/users/<用户>/rename）、Patreon、导出帐户数据、
 * 继任者、删除帐户及确认对话框。
 * 组织设置已收录的重命名警告片段（unintended side effects、set up redirects for …、Renaming may take …）
 * 与 Patreon 说明、赞助词典已收录的 Patreon 按钮（Link / Unlink Patreon account、Connect with Patreon）、
 * 「Start export」不再重复；删除确认短语（delete my account）须原样输入，不收录。
 * 只在本页成句的短片段（You must、to a、We will 等）放 scoped，避免在其他页面误译。
 */
export default {
  static: {
    // 更改用户名
    'Change username': '更改用户名',
    'Changing your username can have': '更改用户名可能会产生',
    'Really change your username?': '确定要更改用户名吗？',
    'I understand, let’s change my username': '我已了解，更改我的用户名',
    "I understand, let's change my username": '我已了解，更改我的用户名',
    'Enter a new username': '输入新用户名',
    'Choose a new username': '选择新用户名',
    'Change my username': '更改我的用户名',
    'Trademark Policy': '商标政策',
    'Looking to manage account security settings? You can find them in the': '想管理帐户安全设置？请前往',
    // 完成页：标题现无句号，旧版带句号；提示句被链接拆开时见 inline
    'Your account has been renamed': '你的帐户已重命名',
    'Your account has been renamed.': '你的帐户已重命名。',
    'Remember to update your local repositories to point to the new location.': '记得更新本地存储库，使其指向新位置。',
    'update your local repositories': '更新本地存储库',

    // Patreon（组织设置收录了 “Connect a Patreon account for …” 两个片段）：connect → 连接，link → 链接
    'Successfully connected your GitHub account with Patreon.': '已将你的 GitHub 帐户与 Patreon 连接。',
    // 「Disconnect the Patreon account <电子邮件> for <@帐户> to sponsor maintainers with. …」
    // → “断开用于赞助维护者的 Patreon 帐户 <电子邮件> 与 <@帐户> 的连接。…”（for 见 scoped）
    'Disconnect the Patreon account': '断开用于赞助维护者的 Patreon 帐户',
    'to sponsor maintainers with. Any sponsorships made on Patreon will no longer receive recognition on GitHub.':
      '的连接。在 Patreon 上的赞助将不再在 GitHub 上获得认可。',
    'Successfully disconnected your GitHub account from Patreon.': '已断开你的 GitHub 帐户与 Patreon 的连接。',

    // 导出帐户数据：帐户名在 <strong> 中，前后文字分别匹配（“导出帐户 @octocat 的所有存储库…”）
    'Export account data': '导出帐户数据',
    'Export all repositories and profile metadata for': '导出帐户',
    '. Exports will be available for 7 days.': '的所有存储库和个人资料元数据。导出文件将保留 7 天。',
    'Recent exports': '最近的导出',
    'New export': '新建导出',
    "We're preparing your export! We'll send you an email when it's finished.": '正在准备导出！完成后会向你发送电子邮件。',
    'We’re preparing your export! We’ll send you an email when it’s finished.': '正在准备导出！完成后会向你发送电子邮件。',
    'New exports cannot be requested while an export is currently in progress': '导出进行中时无法请求新的导出',
    'Resend email with link': '重新发送含链接的电子邮件',
    'Download deleted': '下载文件已删除',
    'Job queued to delete file.': '已排队删除文件。',

    // 继任者：帐户名在 <strong> 中、“designated below” 是链接，句子被拆成多段
    'Successor settings': '继任者设置',
    // 继任者搜索框的无障碍名称
    'Designate Successor': '指定继任者',
    'By clicking "Add Successor" below, I acknowledge that I am the owner of the': '单击下方“添加继任者”，即表示我确认自己是',
    'By clicking “Add Successor” below, I acknowledge that I am the owner of the': '单击下方“添加继任者”，即表示我确认自己是',
    'account, and am authorizing GitHub to transfer content within that account to my GitHub Successor,':
      '帐户的所有者，并授权 GitHub 在我去世后将该帐户中的内容转让给我的 GitHub 继任者，',
    'designated below': '即下方指定的人',
    ', in the event of my death. I understand that this appointment of a successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will.':
      '。我理解，指定继任者并不凌驾于任何相关司法管辖区具有法律约束力的近亲属规则或遗产法，也不构成具有法律约束力的遗嘱。',
    'Learn more about account successors.': '了解帐户继任者。',
    'Add Successor': '添加继任者',
    'Add successor': '添加继任者',
    'Search by username, full name, or email address': '按用户名、全名或电子邮件地址搜索',
    'You have not designated a successor.': '你尚未指定继任者。',
    'Copy invite link': '复制邀请链接',

    // 删除帐户：「You must remove yourself, transfer ownership, or delete these organizations before you can …」
    // → “你必须先将自己移除、转让所有权或删除这些组织 才能删除你的帐户。”
    'Delete account': '删除帐户',
    'Once you delete your account, there is no going back. Please be certain.': '帐户一旦删除便无法恢复。请谨慎操作。',
    'Your account is currently an owner in these organizations:': '你的帐户目前是以下组织的所有者：',
    'remove yourself': '将自己移除',
    'remove yourself from these organizations': '将自己从这些组织中移除',
    'transfer ownership': '转让所有权',
    'delete these organizations': '删除这些组织',
    'before you can delete your user.': '才能删除你的帐户。',
    'Delete your account': '删除你的帐户',
    // 「Are you sure you don’t want to just [downgrade your account] to a FREE account? …」
    'Are you sure you don’t want to just': '你确定不想只',
    "Are you sure you don't want to just": '你确定不想只',
    'downgrade your account': '将你的帐户降级',
    'account? We won’t charge your credit card anymore.': '帐户吗？我们将不再从你的信用卡扣款。',
    "account? We won't charge your credit card anymore.": '帐户吗？我们将不再从你的信用卡扣款。',
    'account? We won’t charge your payment information anymore.': '帐户吗？我们将不再通过你的付款信息扣款。',
    "account? We won't charge your payment information anymore.": '帐户吗？我们将不再通过你的付款信息扣款。',
    'account? We won’t charge your PayPal account anymore.': '帐户吗？我们将不再从你的 PayPal 帐户扣款。',
    "account? We won't charge your PayPal account anymore.": '帐户吗？我们将不再从你的 PayPal 帐户扣款。',

    // 删除确认对话框：存储库数在 <strong> 中（产品名按用户规定译成中文：GitHub Pages → GitHub 页面）
    'Are you sure you want to do this?': '确定要执行此操作吗？',
    'Make sure you want to do this': '请确认你要执行此操作',
    'This is extremely important.': '这非常重要。',
    ', along with all of your forks, wikis, issues, pull requests, and GitHub Pages sites.':
      '，以及你的所有复刻、Wiki、议题、拉取请求和 GitHub 页面站点。',
    'You will no longer be billed, and after 90 days your username will be available to anyone on GitHub.':
      '我们将不再向你收费，90 天后 GitHub 上的任何人都可以使用你的用户名。',
    // 文章名是链接，后面紧跟原文的 “".”：直引号版本的开引号也用直引号，与结尾配对
    'For more help, read our article "': '如需更多帮助，请阅读我们的文章"',
    'For more help, read our article “': '如需更多帮助，请阅读我们的文章“',
    'Deleting your user account': '删除你的用户帐户',
    'Your username or email:': '你的用户名或电子邮件：',
    // 「To verify, type <delete my account> exactly as it appears:」（旧版结尾为 below:）
    'To verify, type': '请原样输入',
    "You'll be prompted to verify your identity before account deletion.": '删除帐户前系统会提示你验证身份。',
    'You’ll be prompted to verify your identity before account deletion.': '删除帐户前系统会提示你验证身份。',
    'Confirm your password:': '确认你的密码：',
    'Cancel plan and delete this account': '取消计划并删除此帐户',
    'Delete this account': '删除此帐户',
    // 删除帐户：仍是企业所有者时的说明（「You must <a>…</a>, and if required, <a>…</a>, before you can delete your user.」见 inline）
    'remove yourself from these enterprises': '退出这些企业',
    'invite a new enterprise owner': '邀请新的企业所有者'
  },
  scoped: {
    // 重命名警告「We will create … / We will not set up …」中的 We 不收：按流量计费的使用情况等页面的日期选择器
    // 也有星期缩写 We（周三），同在 settings 页面类型内，两种译法无法兼顾；will / will not 由组织设置收录
    'page.': '页面。',
    // 用户名可用性检查被 <strong>、建议按钮拆开时：
    // 「Username <foo> is not available. <foo-1>, <foo-2>, or <foo-3> are available.」「<foo> is available.」
    Username: '用户名',
    'is not available.': '不可用。',
    'are available.': '可用。',
    'is available.': '可用。',
    // Patreon：「Disconnect the Patreon account <电子邮件> for <@帐户> to sponsor maintainers with. …」
    // 设置页内独立的 for 只见于此句
    for: '与',
    // 删除帐户：「You must remove yourself, transfer ownership, or delete …」
    'You must': '你必须先',
    // 降级提示：「… downgrade your account to a FREE account? …」（FREE 指方案，译「免费版」）
    'to a': '为',
    FREE: '免费版',
    // 删除确认：「We will immediately delete …」「To verify, type delete my account exactly as it appears:」
    'We will': '我们将',
    'exactly as it appears:': '以完成验证：',
    'below:': '：',
    // 继任者状态（邀请待对方接受）
    Pending: '待定',
    Declined: '已拒绝',
    Accepted: '已接受',
    // 危险区域
    'Danger zone': '危险区域',
    'Danger Zone': '危险区域'
  },
  regexp: [
    // 更改用户名：可用性检查（标点随原文：句号不改成逗号）
    [
      new RegExp(`^Username ${LOGIN} is not available\\. Please choose another\\. To submit a trademark claim, please see our$`),
      '用户名 $1 不可用。请另选一个。如需提交商标申诉，请参阅我们的'
    ],
    [
      new RegExp(`^Username ${LOGIN} is not available\\. ([\\w-]+(?:, [\\w-]+)*(?:,? or [\\w-]+)?) are available\\.$`),
      (_, name: string, list: string) => `用户名 ${name} 不可用。${joinNames(list)} 可用。`
    ],
    [new RegExp(`^Username ${LOGIN} is not available\\.$`), '用户名 $1 不可用。'],
    [new RegExp(`^${LOGIN} is available\\.$`), '$1 可用。'],
    [
      // 句号随原文；原文只有一个逗号，“alphanumeric characters” 不拆成“字母、数字”
      /^Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen(\.?)$/,
      (_, dot: string) => `用户名只能包含字母数字字符或单个连字符，且不能以连字符开头或结尾${dot ? '。' : ''}`
    ],
    // 更改用户名的完成页：按钮文字含新用户名（未被元素拆开时）
    [new RegExp(`^View ${LOGIN} settings$`), '查看 $1 的设置'],
    // Patreon：帐户名未被拆开时（GitHub Sponsors profile → GitHub 赞助个人资料）
    [
      new RegExp(
        `^Connect a Patreon account for ${LOGIN} to sponsor maintainers with\\. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile\\.$`
      ),
      '为 $1 连接 Patreon 帐户以赞助维护者。如果被赞助者也链接了 Patreon 和 GitHub，并且拥有公开的 GitHub 赞助个人资料，你在 Patreon 上的赞助也会在 GitHub 上得到认可。'
    ],
    // 导出：帐户名未被拆开时
    [
      new RegExp(`^Export all repositories and profile metadata for ${LOGIN}\\. Exports will be available for (\\d+) days?\\.$`),
      '导出 $1 的所有存储库和个人资料元数据。导出文件将保留 $2 天。'
    ],
    // 继任者说明的前半句（“designated below” 链接之前）
    [
      new RegExp(
        `^By clicking ["“]Add Successor["”] below, I acknowledge that I am the owner of the ${LOGIN} account, and am authorizing GitHub to transfer content within that account to my GitHub Successor,$`
      ),
      '单击下方“添加继任者”，即表示我确认自己是 $1 帐户的所有者，并授权 GitHub 在我去世后将该帐户中的内容转让给我的 GitHub 继任者，'
    ],
    [new RegExp(`^This link will only work for ${LOGIN}\\.$`), '此链接仅对 $1 有效。'],
    [new RegExp(`^You have successfully sent the successor invitation to ${LOGIN}\\.$`), '已向 $1 发送继任者邀请。'],
    [new RegExp(`^You have revoked the successor invitation to ${LOGIN}\\.$`), '已撤销对 $1 的继任者邀请。'],
    [new RegExp(`^You have canceled the invitation to ${LOGIN} to be your designated successor\\.$`), '已取消邀请 $1 成为你指定的继任者。'],
    // 删除确认：存储库数在 <strong> 中；整句未被拆开时
    [/^immediately delete all of your repositor(?:y|ies) \((\d[\d,]*)\)$/, '立即删除你的所有存储库（$1 个）'],
    [
      /^We will immediately delete all of your repositor(?:y|ies) \((\d[\d,]*)\), along with all of your forks, wikis, issues, pull requests, and GitHub Pages sites\.$/,
      '我们将立即删除你的所有存储库（$1 个），以及你的所有复刻、Wiki、议题、拉取请求和 GitHub 页面站点。'
    ]
  ],
  // 更改用户名的完成页：「Remember to <a>update your local repositories</a> to point to the new location.」，
  // 链接文字由 static 译出，拼读为“记得更新本地存储库，使其指向新位置。”；按钮里的用户名包在元素中时见第二条
  inline: [
    ['Remember to {} to point to the new location.', '记得{}，使其指向新位置。'],
    ['View {} settings', '查看 {} 的设置'],
    // 更改用户名的警告（与组织设置一致；单独的 We 不收，见 scoped 的说明）
    ['We {} create redirects for your repositories (web and git access).', '我们{}为你的存储库创建重定向（网页和 Git 访问）。'],
    ['We {} set up redirects for your old profile page.', '我们{}为旧的个人资料页面设置重定向。'],
    ['We {} set up redirects for Pages sites.', '我们{}为页面站点设置重定向。'],
    ['We {} set up redirects for your Pages sites.', '我们{}为你的页面站点设置重定向。'],
    // 删除帐户：仍是企业所有者（企业名在 <strong> 里）
    ['Your account is currently an owner in these enterprises: {}', '你的帐户目前是以下企业的所有者：{}'],
    ['You must {}, and if required, {}, before you can delete your user.', '你必须先{}，并在需要时{}，然后才能删除你的用户。']
  ]
} satisfies PageDictionary
