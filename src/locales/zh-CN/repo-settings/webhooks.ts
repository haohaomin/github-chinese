import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · Web 钩子 / 集成：Web 钩子列表、添加 / 编辑表单、事件列表、最近交付与重新传递，
 * 电子邮件通知、自动链接引用、已安装的 GitHub 应用。
 * 译法沿用组织设置 Web 钩子页（org-settings/webhooks.ts，均为 scoped）。
 */
export default {
  static: {
    // 列表
    'Add webhook': '添加 Web 钩子',
    "Webhooks allow external services to be notified when certain events happen. When the specified events happen, we'll send a POST request to each of the URLs you provide. Learn more in our":
      'Web 钩子可以在特定事件发生时通知外部服务。当指定事件发生时，我们会向你提供的每个 URL 发送 POST 请求。详情请参阅',
    'Webhooks allow external services to be notified when certain events happen. When the specified events happen, we’ll send a POST request to each of the URLs you provide. Learn more in our':
      'Web 钩子可以在特定事件发生时通知外部服务。当指定事件发生时，我们会向你提供的每个 URL 发送 POST 请求。详情请参阅',
    'Webhooks Guide': 'Web 钩子指南',
    'We will also send events from this repository to your': '我们也会将此存储库的事件发送到你的',
    'organization webhooks': '组织 Web 钩子',
    'This hook has never been triggered.': '此 Web 钩子从未触发过。',
    'Last delivery was successful.': '最近一次交付成功。',
    'Last delivery was not successful.': '最近一次交付失败。',
    // 列表项状态图标的链接（指向最近交付）
    Deliveries: '交付记录',
    'Delete webhook?': '删除 Web 钩子？',
    'This action cannot be undone. Future events will no longer be delivered to this webhook':
      '此操作无法撤销。今后的事件将不再交付到此 Web 钩子',
    'Yes, delete webhook': '是，删除 Web 钩子',

    // 添加 / 编辑表单
    "We'll send a": '我们会向下方 URL 发送',
    'We’ll send a': '我们会向下方 URL 发送',
    "request to the URL below with details of any subscribed events. You can also specify which data format you'd like to receive (JSON,":
      '请求，其中包含所订阅事件的详细信息。你还可以指定想要接收的数据格式（JSON、',
    'request to the URL below with details of any subscribed events. You can also specify which data format you’d like to receive (JSON,':
      '请求，其中包含所订阅事件的详细信息。你还可以指定想要接收的数据格式（JSON、',
    'our developer documentation': '开发人员文档',
    'Payload URL': '有效负载 URL',
    'Leave blank to remove secret': '留空以移除机密',
    "There is currently a secret configured for this webhook. If you've lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated.":
      '此 Web 钩子当前已配置机密。如果遗失或忘记了此机密，可以更改它，但使用此机密的所有集成都需要更新。',
    'There is currently a secret configured for this webhook. If you’ve lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated.':
      '此 Web 钩子当前已配置机密。如果遗失或忘记了此机密，可以更改它，但使用此机密的所有集成都需要更新。',
    "If you've lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated. —":
      '如果遗失或忘记了此机密，可以更改它，但使用此机密的所有集成都需要更新。—',
    'If you’ve lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated. —':
      '如果遗失或忘记了此机密，可以更改它，但使用此机密的所有集成都需要更新。—',
    'Change secret': '更改机密',
    'Change Secret': '更改机密',
    'SSL verification': 'SSL 验证',
    'By default, we verify SSL certificates when delivering payloads.': '默认情况下，交付有效负载时会验证 SSL 证书。',
    'Enable SSL verification': '启用 SSL 验证',
    ': Disabling SSL verification has serious implications.': '：禁用 SSL 验证会带来严重后果。',
    'SSL verification helps ensure that hook payloads are delivered to your URL endpoint securely, keeping your data away from prying eyes. Disabling this option is':
      'SSL 验证有助于确保 Web 钩子有效负载安全地交付到你的 URL 端点，防止数据被窥探。禁用此选项',
    'Disable, I understand my webhooks may not be secure': '禁用，我了解我的 Web 钩子可能不安全',
    'Which events would you like to trigger this webhook?': '希望哪些事件触发此 Web 钩子？',
    'Let me select individual events.': '让我选择单个事件。',
    'We will deliver event details when this hook is triggered.': '触发此 Web 钩子时，我们将交付事件详细信息。',
    'Okay, that hook was successfully created. We sent a ping payload to test it out! Read more about it at https://docs.github.com/webhooks/#ping-event.':
      '已成功创建该 Web 钩子，并发送了一个 ping 有效负载用于测试！详情请参阅 https://docs.github.com/webhooks/#ping-event。',
    'Manage webhook': '管理 Web 钩子',
    'Update webhook': '更新 Web 钩子',
    'Okay, the hook was successfully updated.': '已成功更新该 Web 钩子。',
    'Okay, that hook was successfully deleted.': '已成功删除该 Web 钩子。',
    'Hook already exists on this repository': '此存储库已存在相同的 Web 钩子',
    'Delete webhook': '删除 Web 钩子',

    // 最近交付
    'Recent Deliveries': '最近交付',
    'Loading deliveries…': '正在加载交付记录…',
    'Loading deliveries...': '正在加载交付记录...',
    'Detailed delivery information will be shown here once the hook has been triggered.': 'Web 钩子触发后，这里将显示详细的交付信息。',
    'Redeliver payload?': '重新传递有效负载？',
    // 「The payload will be delivered to」+ <code>URL</code> +「using the current webhook configuration.」：后半句的意思并入前一段，只留句号
    'The payload will be delivered to': '有效负载将按当前 Web 钩子配置交付到',
    'using the current webhook configuration.': '。',
    'Yes, redeliver this payload': '是，重新传递此有效负载',
    'Delivering payload…': '正在交付有效负载…',
    'Delivering payload...': '正在交付有效负载...',

    // 事件
    'Branch or tag creation': '分支或标签创建',
    'Branch or tag created.': '已创建分支或标签。',
    'Branch or tag deletion': '分支或标签删除',
    'Branch or tag deleted.': '已删除分支或标签。',
    'Branch protection configurations': '分支保护配置',
    'All branch protections disabled or enabled for a repository.': '存储库的所有分支保护被禁用或启用。',
    'Branch protection rule created, deleted or edited.': '分支保护规则被创建、删除或编辑。',
    'Bypass requests for push rulesets': '推送规则集的绕过请求',
    'Push ruleset bypass request was created, cancelled, completed, received a response, or a response was dismissed.':
      '推送规则集绕过请求被创建、取消、完成、收到回复，或回复被消除。',
    'Bypass requests for secret scanning push protections': '机密扫描推送保护的绕过请求',
    'Secret scanning push protection bypass request was created, cancelled, completed, received a response, or a response was dismissed. Note: Delegated bypass for push protection is currently in beta and subject to change.':
      '机密扫描推送保护绕过请求被创建、取消、完成、收到回复，或回复被消除。注意：推送保护的委托绕过目前为测试版，可能会有变动。',
    'Secret scanning push protection bypass request was created, cancelled, completed, received a response, or a response was dismissed.':
      '机密扫描推送保护绕过请求被创建、取消、完成、收到回复，或回复被消除。',
    'Check run is created, requested, rerequested, or completed.': '检查运行被创建、请求、重新请求或完成。',
    'Check suite is requested, rerequested, or completed.': '检查套件被请求、重新请求或完成。',
    'Code scanning alerts': '代码扫描警报',
    'Code Scanning alert created, fixed in branch, or closed': '代码扫描警报被创建、在分支中修复或关闭',
    'Code Scanning alert updated. This event is triggered when the assignees or state of the alert changes. The state can be created, fixed in branch, or closed.':
      '代码扫描警报被更新。警报的受理人或状态变化时触发此事件。状态可以是已创建、已在分支中修复或已关闭。',
    'Dismissal requests for code scanning alerts': '代码扫描警报的消除请求',
    'Code scanning alert dismissal request was created, or received a response (approved or rejected).':
      '代码扫描警报消除请求被创建或收到回复（批准或拒绝）。',
    'Collaborator add, remove, or changed': '协作者添加、移除或更改',
    'Collaborator added to, removed from, or has changed permissions for a repository.':
      '协作者被添加到存储库、从存储库移除，或其存储库权限被更改。',
    'Commit or diff commented on.': '提交或差异收到评论。',
    'Custom property is created, updated, or deleted.': '自定义属性被创建、更新或删除。',
    'Custom property values': '自定义属性值',
    'Custom property values are changed for a repository': '存储库的自定义属性值被更改',
    'Dependabot alert auto_dismissed, auto_reopened, created, dismissed, reopened, fixed, or reintroduced.':
      'Dependabot 警报被自动消除、自动重新打开、创建、消除、重新打开、修复或重新引入。',
    'Dependabot alert assignees_changed, auto_dismissed, auto_reopened, created, dismissed, reopened, fixed, reintroduced, or withdrawn.':
      'Dependabot 警报的受理人被更改，或警报被自动消除、自动重新打开、创建、消除、重新打开、修复、重新引入或撤回。',
    'Dismissal requests for dependabot alerts': 'Dependabot 警报的消除请求',
    'Dependabot alert dismissal request was created, cancelled, or received a response (approved or rejected).':
      'Dependabot 警报消除请求被创建、取消或收到回复（批准或拒绝）。',
    'A deploy key is created or deleted from a repository.': '存储库中的部署密钥被创建或删除。',
    'Deployment statuses': '部署状态',
    'Deployment status updated from the API.': '通过 API 更新了部署状态。',
    'Repository was deployed or a deployment was deleted.': '存储库已部署或部署被删除。',
    'Discussion comments': '讨论评论',
    'Discussion comment created, edited, or deleted.': '讨论评论被创建、编辑或删除。',
    'Discussion created, edited, closed, reopened, pinned, unpinned, locked, unlocked, transferred, answered, unanswered, labeled, unlabeled, had its category changed, or was deleted.':
      '讨论被创建、编辑、关闭、重新打开、置顶、取消置顶、锁定、解锁、转移、标记答案、取消答案、添加标签、移除标签、更改类别或删除。',
    'Repository forked.': '存储库被复刻。',
    'Issue comments': '议题评论',
    'Issue comment created, edited, or deleted.': '议题评论被创建、编辑或删除。',
    'Issue opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, milestoned, demilestoned, locked, or unlocked.':
      '议题被打开、编辑、删除、转移、置顶、取消置顶、关闭、重新打开、分配、取消分配、添加标签、移除标签、设置里程碑、移除里程碑、锁定或解锁。',
    'Issue opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, milestoned, demilestoned, locked, unlocked, typed, untyped, field_added, or field_removed.':
      '议题被打开、编辑、删除、转移、置顶、取消置顶、关闭、重新打开、分配、取消分配、添加标签、移除标签、设置里程碑、移除里程碑、锁定、解锁、设置类型、移除类型、添加字段或移除字段。',
    'Label created, edited or deleted.': '标签被创建、编辑或删除。',
    'Label created, edited, deleted, archived, or unarchived.': '标签被创建、编辑、删除、存档或取消存档。',
    'Team membership added or removed.': '团队成员被添加或移除。',
    'Merge groups': '合并组',
    'Merge Group requested checks, or was destroyed.': '合并组请求检查或被销毁。',
    'This particular hook is deleted.': '此 Web 钩子被删除。',
    'Milestone created, closed, opened, edited, or deleted.': '里程碑被创建、关闭、打开、编辑或删除。',
    'Org blocks': '组织阻止',
    'A user has been blocked or unblocked.': '用户被阻止或取消阻止。',
    'Organization deleted, renamed, member invited, member added, or member removed.': '组织被删除或重命名，或有成员被邀请、添加或移除。',
    'GitHub Packages published or updated in a repository.': '存储库中发布或更新了 GitHub 软件包。',
    'Page builds': '页面构建',
    'Pages site built.': '页面站点已构建。',
    'Project cards': '项目卡片',
    'Project card created, updated, or deleted.': '项目卡片被创建、更新或删除。',
    'Project columns': '项目列',
    'Project column created, updated, moved or deleted.': '项目列被创建、更新、移动或删除。',
    'Project v2 items': '项目 v2 项',
    'Projects v2': '项目 v2',
    'Project item created, edited, deleted, archived, restored, converted, or reordered. Feedback is welcome in':
      '项目中的项被创建、编辑、删除、存档、恢复、转换或重新排序。欢迎反馈至',
    'Project created, updated, or deleted.': '项目被创建、更新或删除。',
    'Project created, updated, deleted, closed, or reopened. Feedback is welcome in': '项目被创建、更新、删除、关闭或重新打开。欢迎反馈至',
    'Pull request review comments': '拉取请求审查评论',
    'Pull request diff comment created, edited, or deleted.': '拉取请求差异评论被创建、编辑或删除。',
    'Pull request review threads': '拉取请求审查线程',
    'A pull request review thread was resolved or unresolved.': '拉取请求审查线程被解决或取消解决。',
    'Pull request reviews': '拉取请求审查',
    'Pull request review submitted, edited, or dismissed.': '拉取请求审查被提交、编辑或消除。',
    'Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, synchronized, unassigned, unlabeled, or unlocked.':
      '拉取请求被分配、禁用或启用自动合并、关闭、转为草稿、移除里程碑、移出队列、编辑、加入队列、添加标签、锁定、设置里程碑、创建、可供审查、重新打开、移除审查请求、请求审查、同步、取消分配、移除标签或解锁。',
    'Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, stacked, synchronized, unassigned, unlabeled, or unlocked.':
      '拉取请求被分配、禁用或启用自动合并、关闭、转为草稿、移除里程碑、移出队列、编辑、加入队列、添加标签、锁定、设置里程碑、创建、可供审查、重新打开、移除审查请求、请求审查、堆叠、同步、取消分配、移除标签或解锁。',
    'Git push to a repository.': '向存储库执行 Git 推送。',
    'Registry packages': '注册表软件包',
    'Registry package published or updated in a repository.': '存储库中发布或更新了注册表软件包。',
    'Release created, edited, published, unpublished, or deleted.': '发行版被创建、编辑、发布、取消发布或删除。',
    'Repository created, deleted, archived, unarchived, publicized, privatized, edited, renamed, or transferred.':
      '存储库被创建、删除、存档、取消存档、设为公共、设为专用、编辑、重命名或转让。',
    'Repository advisories': '存储库公告',
    'Repository advisory published or reported.': '存储库公告被发布或报告。',
    'Repository imports': '存储库导入',
    'Repository import succeeded, failed, or cancelled.': '存储库导入成功、失败或被取消。',
    'Repository rulesets': '存储库规则集',
    'Repository ruleset created, deleted or edited.': '存储库规则集被创建、删除或编辑。',
    'Repository vulnerability alerts': '存储库漏洞警报',
    'Dependabot alert (aka dependency vulnerability alert) created, resolved, or dismissed on a repository.':
      '存储库中的 Dependabot 警报（即依赖项漏洞警报）被创建、解决或消除。',
    'Secret scanning alert locations': '机密扫描警报位置',
    'Secrets scanning alert location created.': '已创建机密扫描警报位置。',
    'Secret scanning alerts': '机密扫描警报',
    'Secrets scanning alert created, resolved, reopened, validated, or publicly leaked.':
      '机密扫描警报被创建、解决、重新打开、验证或被公开泄露。',
    'Secret scanning alert created, resolved, reopened, validated, publicly leaked, assigned, or unassigned.':
      '机密扫描警报被创建、解决、重新打开、验证、公开泄露、分配或取消分配。',
    'Dismissal requests for secret scanning alerts': '机密扫描警报的消除请求',
    'Secret scanning alert dismissal request was created, cancelled, or received a response.':
      '机密扫描警报消除请求被创建、取消或收到回复。',
    'Security and analyses': '安全和分析',
    'Code security features enabled or disabled for a repository.': '存储库的代码安全功能被启用或禁用。',
    'Secret scanning scans': '机密扫描',
    'Secrets scanning scan completed.': '机密扫描已完成。',
    'A star is created or deleted from a repository.': '存储库被加星标或取消星标。',
    'Commit status updated from the API.': '通过 API 更新了提交状态。',
    'Team adds': '团队添加',
    'Team added or modified on a repository.': '团队被添加到存储库或在存储库中被修改。',
    'Team is created, deleted, edited, or added to/removed from a repository.': '团队被创建、删除、编辑，或被添加到存储库/从存储库移除。',
    'Visibility changes': '可见性更改',
    'Repository changes from private to public.': '存储库从专用变为公共。',
    'User stars a repository.': '用户为存储库加星标。',
    'Wiki page updated.': 'Wiki 页面已更新。',
    'Workflow jobs': '工作流作业',
    'Workflow job queued, waiting, in progress, or completed on a repository.': '存储库中的工作流作业排队、等待、进行中或完成。',
    'Workflow run requested or completed on a repository.': '存储库中的工作流运行被请求或完成。',
    'Sub issues': '子议题',
    'Sub-issues added or removed, and parent issues added or removed.': '子议题被添加或移除，父议题被添加或移除。',
    'Issue dependencies': '议题依赖',
    'Issue dependencies - such as blocked by or blocking - added or removed.': '议题依赖关系（如被阻止或阻止）被添加或移除。',
    'Related issues': '相关议题',
    'Related issues - such as relates to - added or removed.': '相关议题关系（如相关）被添加或移除。',

    // 电子邮件通知
    'Setup email addresses to receive notifications when push events are triggered.': '设置在触发推送事件时接收通知的电子邮件地址。',
    'Asterisk (*) denotes a required field': '星号 (*) 表示必填字段',
    'Whitespace separated email addresses (at most two).': '以空白分隔的电子邮件地址（最多两个）。',
    'Approved header': 'Approved 标头',
    'header to automatically approve the message in a read-only or moderated mailing list.':
      '标头以便在只读或受管理的邮件列表中自动批准消息。',
    'We will send notification emails to the listed addresses when a': '发生',
    'event is triggered.': '事件时，我们将向所列地址发送通知电子邮件。',
    'Setup notifications': '设置通知',

    // 自动链接引用
    'Add autolink reference': '添加自动链接引用',
    'References to GitHub issues, pull requests, and commits are automatically converted into links. Configure your own autolink references for non-GitHub URLs.':
      '对 GitHub 议题、拉取请求和提交的引用会自动转换为链接。你可以为非 GitHub URL 配置自己的自动链接引用。',
    'Learn more about automatic autolinks.': '了解自动链接。',
    'Autolinks can be either alphanumeric or numeric.': '自动链接可以是字母数字或纯数字。',
    'Read more about the differences between the two.': '了解两者的区别。',
    'No custom autolink references have been created yet.': '尚未创建自定义自动链接引用。',
    'Alphanumeric autolinks match': '字母数字自动链接匹配',
    '. They are not case sensitive.': '。不区分大小写。',
    'Numeric autolinks only match': '数字自动链接仅匹配',
    'Reference prefix': '引用前缀',
    'This prefix appended by a string will generate a link any time it is found in an issue, pull request, or commit.':
      '议题、拉取请求或提交中出现此前缀加字符串时，都会生成链接。',
    'Target URL': '目标 URL',
    'The URL must contain': 'URL 必须包含',
    'for the reference number.': '作为引用编号。',

    // 已安装的 GitHub 应用
    'Installed GitHub Apps': '已安装的 GitHub 应用',
    'GitHub Apps augment and extend your workflows on GitHub with commercial, open source, and homegrown tools.':
      'GitHub 应用通过商业、开源和自研工具增强和扩展你在 GitHub 上的工作流。',
    "There aren't any GitHub Apps installed on this repository.": '此存储库未安装任何 GitHub 应用。',
    'There aren’t any GitHub Apps installed on this repository.': '此存储库未安装任何 GitHub 应用。'
  },
  scoped: {
    'Webhooks /': 'Web 钩子 /',
    '/ Add webhook': '/ 添加 Web 钩子',
    // 列表项 URL 后：「(all events)」
    '(all events)': '（所有事件）',
    'all events': '所有事件',
    etc: '等',
    '). More information can be found in': '）。更多信息请参阅',
    'Content type': '内容类型',
    Secret: '机密',
    '(not recommended)': '（不推荐）',
    'not recommended': '不推荐',
    'Just the': '仅',
    'event.': '事件。',
    'Send me': '发送',
    everything: '所有事件',
    'Recent deliveries': '最近交付',
    redelivery: '重新传递',
    Request: '请求',
    Response: '响应',
    Redeliver: '重新传递',
    Headers: '标头',
    Payload: '有效负载',
    Body: '正文',
    // 请求详情标签页的读屏名称（原文拼写如此，兼收正确拼写）
    'Hook request and reponse': 'Web 钩子请求和响应',
    'Hook request and response': 'Web 钩子请求和响应',
    // 重新传递失败提示
    'Oops, there was an error while trying to redeliver this payload.': '重新传递此有效负载时出错。',
    'Check runs': '检查运行',
    'Check suites': '检查套件',
    'Commit comments': '提交评论',
    'Custom property': '自定义属性',
    'Deploy key': '部署密钥',
    Deployments: '部署',
    Memberships: '成员身份',
    Meta: 'Web 钩子本身',
    'this discussion': '此讨论',
    Statuses: '状态',
    Watches: '关注',
    'Workflow runs': '工作流运行',
    'Sets the': '设置',
    Alphanumeric: '字母数字',
    Numeric: '数字',
    '/ Add new': '/ 新增',
    Suspended: '已暂停',
    'Developed by': '开发人员'
  },
  regexp: [
    // 列表：交付失败原因、删除确认（含 URL）
    [/^Last delivery was not successful\. (.+)$/, '最近一次交付失败。$1'],
    [
      /^This action cannot be undone\. Future events will no longer be delivered to this webhook \((\S+)\)(\.?)$/,
      (_, url: string, dot: string) => `此操作无法撤销。今后的事件将不再交付到此 Web 钩子 (${url})${dot ? '。' : ''}`
    ],
    // 交付详细信息
    [/^Completed in ([\d.]+) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗时 ${seconds} 秒${dot ? '。' : ''}`],
    [/^The payload will be delivered to (\S+) using the current webhook configuration\.$/, '有效负载将按当前 Web 钩子配置交付到 $1。'],
    // 已安装的 GitHub 应用
    [/^Developed by ([\w.-]+)$/, '开发人员 $1']
  ]
} satisfies PageDictionary
