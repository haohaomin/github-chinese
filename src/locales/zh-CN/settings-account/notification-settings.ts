import type { PageDictionary } from '../../../core/types'

/** 通知渠道摘要中的渠道名（“Notify me:” 下拉按钮：on GitHub, Email, CLI） */
const CHANNELS: Readonly<Record<string, string>> = {
  'on GitHub': 'GitHub',
  'On GitHub': 'GitHub',
  Email: '电子邮件',
  CLI: 'CLI'
}

/** 自定义电子邮件更新摘要中的事件名（Reviews, Pushes, Comments, My own updates） */
const EMAIL_EVENTS: Readonly<Record<string, string>> = {
  Reviews: '审查',
  Pushes: '推送',
  Comments: '评论',
  'My own updates': '我自己的更新'
}

const CHANNEL_SOURCE = '(?:[oO]n GitHub|Email|CLI)'
const EVENT_SOURCE = '(?:Reviews|Pushes|Comments|My own updates)'

function joinItems(list: string, names: Readonly<Record<string, string>>): string {
  return list
    .split(', ')
    .map(item => names[item] ?? item)
    .join('、')
}

/**
 * 通知设置（/settings/notifications、/settings/notifications/custom_routing）：默认通知电子邮件、自动关注、
 * 订阅（正在关注、参与和 @提及、自定义电子邮件更新、已忽略的存储库）、系统（Actions、Dependabot、安全活动、部署密钥、智能体任务）、
 * 自定义路由。「Subscriptions」「Notification settings」由 notifications 收录，「In-product messages」由组织设置收录。
 */
export default {
  static: {
    // 默认通知电子邮件：说明可能被链接拆开（句号随原文）
    'Default notifications email': '默认通知电子邮件',
    "Choose where you'd like emails to be sent. You can add more email addresses. Use custom routes to specify different email addresses to be used for individual organizations.":
      '选择接收电子邮件的地址。你可以添加更多电子邮件地址。使用自定义路由为各个组织指定不同的电子邮件地址。',
    'Choose where you’d like emails to be sent. You can add more email addresses. Use custom routes to specify different email addresses to be used for individual organizations.':
      '选择接收电子邮件的地址。你可以添加更多电子邮件地址。使用自定义路由为各个组织指定不同的电子邮件地址。',
    "Choose where you'd like emails to be sent. You can": '选择接收电子邮件的地址。你可以',
    'Choose where you’d like emails to be sent. You can': '选择接收电子邮件的地址。你可以',
    'add more email addresses': '添加更多电子邮件地址',
    '. Use': '。使用',
    'custom routes': '自定义路由',
    'to specify different email addresses to be used for individual organizations.': '为各个组织指定不同的电子邮件地址。',
    'Custom routing': '自定义路由',
    'Custom Routing': '自定义路由',

    // 自动关注
    'Automatically watch repositories': '自动关注存储库',
    "When you're given push access to a repository, automatically receive notifications for it.":
      '获得存储库推送权限时，自动接收该存储库的通知。',
    'When you’re given push access to a repository, automatically receive notifications for it.':
      '获得存储库推送权限时，自动接收该存储库的通知。',
    'Automatically watch teams': '自动关注团队',
    'Anytime you join a new team, you will automatically be subscribed to updates and receive notification when that team is @mentioned.':
      '每当你加入新团队，都会自动订阅其更新并在该团队被 @提及 时收到通知。',

    // 订阅：关注
    "Notifications for all repositories, teams, or conversations you're watching.": '你关注的所有存储库、团队或对话的通知。',
    'Notifications for all repositories, teams, or conversations you’re watching.': '你关注的所有存储库、团队或对话的通知。',
    'View watched repositories': '查看已关注的存储库',
    'Select notification channels': '选择通知渠道',
    'On GitHub': '在 GitHub 上',
    'on GitHub': '在 GitHub 上',
    "Don't notify": '不通知',
    'Don’t notify': '不通知',

    // 订阅：参与、@提及和自定义
    'Participating, @mentions and custom': '参与、@提及和自定义',
    'Notifications for the conversations you are participating in, or if someone cites you with an @mention. Also for all activity when subscribed to specific events.':
      '你参与的对话或有人 @提及 你时的通知。订阅特定事件后，相关的所有活动也会通知你。',

    // 订阅：自定义电子邮件更新
    'Customize email updates': '自定义电子邮件更新',
    "Choose which additional events you'll receive emails for when participating or watching.":
      '选择参与或关注时还要通过电子邮件接收哪些事件。',
    'Choose which additional events you’ll receive emails for when participating or watching.':
      '选择参与或关注时还要通过电子邮件接收哪些事件。',
    'Select events': '选择事件',
    'Pull Request reviews': '拉取请求审查',
    'Pull Request pushes': '拉取请求推送',
    'Comments on Issues and Pull Requests': '议题和拉取请求中的评论',
    'Includes your own updates': '包括你自己的更新',

    // 订阅：已忽略的存储库
    'Ignored repositories': '已忽略的存储库',
    "You'll never be notified.": '你将不会收到任何通知。',
    'You’ll never be notified.': '你将不会收到任何通知。',
    'View ignored repositories': '查看已忽略的存储库',

    // 系统：Actions（说明被 “GitHub Actions” 链接拆开；产品名按用户规定译成中文：GitHub Actions → GitHub 操作）
    'Notifications for workflow runs on repositories set up with': '已设置以下功能的存储库中的工作流运行通知',
    'Notifications for workflow runs on repositories set up with GitHub Actions.': '已设置 GitHub 操作的存储库中的工作流运行通知。',
    'Only notify for failed workflows': '仅在工作流失败时通知',
    'Failed workflows only': '仅失败的工作流',
    'Agent tasks': '智能体任务',
    'Notifications for agent sessions that you started.': '你启动的智能体会话的通知。',

    // 系统：Dependabot（说明被 “Dependabot alerts” 链接拆开，链接后无逗号，译文不加）
    // → “当你获得 <Dependabot 警报> 的访问权限后将自动收到你的依赖项中发现新漏洞的通知。”
    'Dependabot alerts: New vulnerabilities': 'Dependabot 警报：新漏洞',
    "When you're given access to": '当你获得',
    'When you’re given access to': '当你获得',
    'automatically receive notifications when a new vulnerability is found in one of your dependencies.':
      '的访问权限后将自动收到你的依赖项中发现新漏洞的通知。',
    'Dependabot alerts: Email digest': 'Dependabot 警报：电子邮件摘要',
    'Email a regular summary of Dependabot alerts for up to 10 of your repositories.':
      '定期通过电子邮件发送最多 10 个存储库的 Dependabot 警报摘要。',
    "Don't send": '不发送',
    'Don’t send': '不发送',
    'Send weekly': '每周发送',
    'Send daily': '每天发送',

    // 系统：安全活动、部署密钥、产品内消息
    'Security campaign emails': '安全活动电子邮件',
    'Receive email notifications about security campaigns in repositories where you have access to security alerts.':
      '接收你有权查看安全警报的存储库中安全活动的电子邮件通知。',
    "'Deploy key' alert email": '“部署密钥”警报电子邮件',
    '‘Deploy key’ alert email': '“部署密钥”警报电子邮件',
    '“Deploy key” alert email': '“部署密钥”警报电子邮件',
    '"Deploy key" alert email': '“部署密钥”警报电子邮件',
    'When you are given admin permissions to an organization, automatically receive notifications when a new deploy key is added.':
      '获得组织的管理员权限后，每当添加新的部署密钥时自动收到通知。',
    'Get tips, solutions and exclusive offers from GitHub about products, services and events we think you might find interesting.':
      '接收 GitHub 推送的你可能感兴趣的产品、服务和活动的提示、解决方案及专属优惠。',

    // 自定义路由页：句子被 “verified” 链接拆开，默认电子邮件在 <strong> 中
    '/ Custom Routing': '/ 自定义路由',
    '/ Custom routing': '/ 自定义路由',
    'You can send notifications to different': '你可以根据存储库所属的组织将通知发送到不同的',
    'email addresses depending on the organization that owns the repository.': '电子邮件地址。',
    'is your current default email for notifications.': '是你当前默认的通知电子邮件。',
    'No custom routes yet.': '暂无自定义路由。',
    'Add new route': '添加新路由',
    'Pick organization': '选择组织',
    'Search organizations': '搜索组织',
    'Select Email': '选择电子邮件'
  },
  scoped: {
    // 订阅分组名；settings-developer 的权限名 Watching 同在 settings 页面类型，共用此条
    Watching: '正在关注',
    'Notify me:': '通知我：',
    Email: '电子邮件',
    System: '系统',
    verified: '已验证',
    // 产品名按用户规定译成中文：系统分组的 Actions 标题、计费页的产品名、GitHub 应用权限名同用；
    // 说明中的 “GitHub Actions” 链接
    Actions: '操作',
    'GitHub Actions': 'GitHub 操作'
  },
  regexp: [
    // “Notify me:” 下拉按钮的渠道摘要：on GitHub, Email, CLI
    [new RegExp(`^(${CHANNEL_SOURCE}(?:, ${CHANNEL_SOURCE})+)$`), (_, list: string) => joinItems(list, CHANNELS)],
    // Actions 通知勾选“仅失败的工作流”时的摘要：Email. (Failed workflows only)
    [
      new RegExp(`^(${CHANNEL_SOURCE}(?:, ${CHANNEL_SOURCE})*)\\. \\(Failed workflows only\\)$`),
      (_, list: string) => `${joinItems(list, CHANNELS)}（仅失败的工作流）`
    ],
    // 自定义电子邮件更新的事件摘要：Reviews, Pushes, Comments
    [new RegExp(`^(${EVENT_SOURCE}(?:, ${EVENT_SOURCE})*)$`), (_, list: string) => joinItems(list, EMAIL_EVENTS)],
    // 自定义路由：默认电子邮件未被拆开时
    [/^(\S+@\S+) is your current default email for notifications\.$/, '$1 是你当前默认的通知电子邮件。']
  ]
} satisfies PageDictionary
