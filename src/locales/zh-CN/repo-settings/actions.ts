import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'
import type { PageDictionary } from '../../../core/types'

const OWNER = '([\\w.-]+)'

/**
 * 存储库设置 · 操作：常规（操作权限、工件和日志保留、缓存、复刻拉取请求工作流、工作流权限、访问）、
 * 运行器（列表、详细信息、新建自托管运行器）、策略、OIDC、模型。
 * 与组织设置共用的文字沿用 org-settings 的译法；组织设置只放 scoped 的条目在此以 static 收录。
 * 运行器列表与操作运行器页（actions 页面类型）共用的说明放 scoped。
 */
export default {
  static: {
    // 操作权限（产品名译法见 nav.ts 文件头：复合词里的 Actions → 操作，句中指整个产品写 GitHub 操作）
    'Allow all actions and reusable workflows': '允许所有操作和可复用工作流',
    'Any action or reusable workflow can be used, regardless of who authored it or where it is defined.':
      '可以使用任何操作或可复用工作流，无论其作者是谁、定义在何处。',
    'Disable actions': '禁用 GitHub 操作',
    'The Actions tab is hidden and no workflows can run.': '操作标签页将被隐藏，任何工作流都无法运行。',
    'Learn more about allowing specific actions and reusable workflows to run.': '了解如何允许运行特定的操作和可复用工作流。',
    'Allow actions created by GitHub': '允许 GitHub 创建的操作',
    'Allow actions by Marketplace': '允许市场',
    'Allow specified actions and reusable workflows': '允许指定的操作和可复用工作流',
    'Allow or block specified actions and reusable workflows': '允许或阻止指定的操作和可复用工作流',
    'Enter a comma-separated list of actions and reusable workflows': '输入以逗号分隔的操作和可复用工作流列表',
    'Wildcards, tags, and SHAs are allowed.': '允许使用通配符、标签和 SHA。',
    'Wildcards, tags, and SHAs are allowed. Use': '允许使用通配符、标签和 SHA。使用',
    'prefix to block.': '前缀表示阻止。',
    'Action examples:': '操作示例：',
    'Reusable workflow examples:': '可复用工作流示例：',
    'Entire organization or repository examples:': '整个组织或存储库示例：',
    'Your list contains a': '你的列表包含',
    'wildcard pattern, which will': '通配符模式，这将',
    // 「…wildcard pattern, which will」+ <strong>allow all actions and reusable workflows</strong> +「except those that are explicitly blocked.」：
    // 除外条件并入加粗段，末段只留句号（原文无逗号）
    'allow all actions and reusable workflows': '允许除明确阻止之外的所有操作和可复用工作流',
    'except those that are explicitly blocked.': '。',
    'Your list contains': '你的列表',
    'only blocked patterns': '只包含阻止模式',
    '. By default, only allowed patterns specified in the list can be used. To allow all actions and reusable workflows except those that are explicitly blocked, add a':
      '。默认情况下，只能使用列表中指定的允许模式。要允许除明确阻止之外的所有操作和可复用工作流，请添加',
    'wildcard pattern.': '通配符模式。',
    'Require actions to be pinned to a full-length commit SHA': '要求将操作固定到完整的提交 SHA',
    'Actions policy updated.': '已更新操作策略。',
    'This setting has been disabled by organization administrators.': '组织管理员已禁用此设置。',
    'This setting has been disabled by enterprise administrators.': '企业管理员已禁用此设置。',

    // 检查、工作流运行、状态、工件和日志保留，缓存
    'Artifact and log retention': '工件和日志保留',
    'Choose the repository settings for artifacts and logs.': '选择工件和日志的存储库设置。',
    'Check, workflow run, status, artifact and log retention': '检查、工作流运行、状态、工件和日志保留',
    'Choose the repository settings for checks, workflow runs, statuses, artifacts, and logs.':
      '选择检查、工作流运行、状态、工件和日志的存储库设置。',
    'Save artifact and log retention setting': '保存工件和日志保留设置',
    'There is a maximum limit of': '上限为',
    'Your organization has set a maximum limit of': '你的组织设置的上限为',
    'Learn more about the artifact and log retention policy.': '了解工件和日志保留策略。',
    'Learn more about the check, workflow run, status, artifact and log retention policy.':
      '了解检查、工作流运行、状态、工件和日志保留策略。',
    'Duration must be 1 or more.': '时长不能少于 1。',
    'Duration must be 90 or less': '时长不能超过 90',
    'Choose the repository settings for cache.': '选择缓存的存储库设置。',
    'Cache retention': '缓存保留',
    'Cache retention limit': '缓存保留期限',
    'Save default cache retention.': '保存默认缓存保留期限。',
    'Retention can be set up to': '保留期最多可设为',
    'Cache size eviction limit': '缓存大小逐出上限',
    'Save default cache size limit': '保存默认缓存大小上限',
    'Use this limit to control when cache evictions occur. Exceeding this limit will trigger evictions of the least recently used cache. Note this limit should not be used for controlling costs.':
      '使用此上限控制何时逐出缓存。超过上限时，将逐出最近最少使用的缓存。注意，此上限不应用于控制费用。',
    'Total cache size can be set up to': '缓存总大小最多可设为',
    'Save fork pull request workflows setting': '保存复刻拉取请求工作流设置',

    // 复刻拉取请求工作流
    'Approval for running fork pull request workflows from contributors': '运行贡献者的复刻拉取请求工作流前需要批准',
    'Choose which subset of users will require approval before running workflows on their pull requests. Both the pull request author and the actor of the pull request event triggering the workflow will be checked to determine if approval is required. If approval is required, a user with write access to the repository must':
      '选择哪些用户在其拉取请求上运行工作流前需要批准。拉取请求的作者和触发工作流的拉取请求事件的参与者都会被检查，以确定是否需要批准。如需批准，必须由对存储库拥有写入访问权限的用户',
    'approve the pull request workflow to be run.': '批准拉取请求工作流后才能运行。',
    'Fork pull request workflows from outside collaborators': '来自外部协作者的复刻拉取请求工作流',
    'Choose which subset of outside collaborators will require approval to run workflows on their pull requests.':
      '选择哪些外部协作者在其拉取请求上运行工作流需要批准。',
    'Learn more about approving workflow runs from public forks.': '了解如何批准来自公共复刻的工作流运行。',
    'Require approval for first-time contributors who are new to GitHub': 'GitHub 新用户首次贡献时需要批准',
    'Only first-time contributors who recently created a GitHub account will require approval to run workflows.':
      '只有最近创建 GitHub 帐户的首次贡献者需要批准才能运行工作流。',
    'Only users who are both new on GitHub and who have never had a commit or pull request merged into this repository will require approval to run workflows.':
      '只有既是 GitHub 新用户、又从未有提交或拉取请求合并到此存储库的用户，才需要批准才能运行工作流。',
    'Require approval for first-time contributors': '首次贡献者需要批准',
    'Only first-time contributors will require approval to run workflows.': '只有首次贡献者需要批准才能运行工作流。',
    'Only users who have never had a commit or pull request merged into this repository will require approval to run workflows.':
      '只有从未有提交或拉取请求合并到此存储库的用户，才需要批准才能运行工作流。',
    'Require approval for all outside collaborators': '所有外部协作者都需要批准',
    'All outside collaborators will always require approval to run workflows on their pull requests.':
      '所有外部协作者在其拉取请求上运行工作流始终需要批准。',
    'Require approval for all external contributors': '所有外部贡献者都需要批准',
    'All users that are not a member or owner of this repository will require approval to run workflows.':
      '不是此存储库成员或所有者的所有用户都需要批准才能运行工作流。',
    'Run workflows from fork pull requests': '运行来自复刻拉取请求的工作流',
    'This tells Actions to run workflows from pull requests originating from repository forks. Note that doing so will give maintainers of those forks the ability to use tokens with read permissions on the source repository.':
      '这会让 GitHub 操作运行来自存储库复刻的拉取请求所触发的工作流。注意，这样做会让这些复刻的维护者能够使用对源存储库具有读取权限的令牌。',
    'Send write tokens to workflows from fork pull requests.': '向来自复刻拉取请求的工作流发送写入令牌。',
    'This tells Actions to send tokens with': '这会让 GitHub 操作向来自存储库复刻的拉取请求所触发的工作流发送具有',
    'permissions to workflows from pull requests originating from repository forks. Note that doing so will give maintainers of those forks':
      '权限的令牌。注意，这样做会让这些复刻的维护者获得对源存储库的',
    'permissions against the source repository.': '权限。',
    'Send secrets to workflows from fork pull requests.': '向来自复刻拉取请求的工作流发送机密。',
    'This tells Actions to send repository secrets to workflows from pull requests originating from repository forks.':
      '这会让 GitHub 操作向来自存储库复刻的拉取请求所触发的工作流发送存储库机密。',
    // 专用存储库的复刻拉取请求工作流（带句号的写法由 org-settings 收录）
    'Fork pull request workflows': '复刻拉取请求工作流',
    'Require approval for fork pull request workflows': '复刻拉取请求工作流需要批准',

    // 工作流权限
    'Choose the default permissions granted to the GITHUB_TOKEN when running workflows in this repository. You can specify more granular permissions in the workflow using YAML.':
      '选择在此存储库中运行工作流时授予 GITHUB_TOKEN 的默认权限。你可以在工作流中使用 YAML 指定更精细的权限。',
    'Read and write permissions': '读取和写入权限',
    'Workflows have read and write permissions in the repository for all scopes.': '工作流在存储库中对所有作用域都有读取和写入权限。',
    'Read repository contents and packages permissions': '读取存储库内容和软件包权限',
    'Workflows have read permissions in the repository for the contents and packages scopes only.':
      '工作流在存储库中仅对内容和软件包作用域有读取权限。',
    'Choose whether GitHub Actions can create pull requests or submit approving pull request reviews.':
      '选择 GitHub 操作能否创建拉取请求或提交批准性审查。',
    'Allow GitHub Actions to create and approve pull requests': '允许 GitHub 操作创建和批准拉取请求',
    'Default workflow permissions settings saved.': '已保存默认工作流权限设置。',
    'Save workflow permissions settings': '保存工作流权限设置',

    // 访问（专用存储库中的操作与可复用工作流共享）
    'Not accessible': '不可访问',
    'Workflows in other repositories cannot access this repository.': '其他存储库中的工作流无法访问此存储库。',
    'Controls how this repository can be used by GitHub Actions workflows in other repositories.':
      '控制其他存储库中的 GitHub 操作工作流如何使用此存储库。',

    // 运行器列表
    'New self-hosted runner': '新建自托管运行器',
    'Host your own runners and customize the environment used to run jobs in your GitHub Actions workflows.':
      '托管你自己的运行器，并自定义运行 GitHub 操作工作流作业的环境。',
    'Learn more about self-hosted runners': '了解自托管运行器',
    'There are no runners configured': '尚未配置运行器',
    // 「Learn more about using runners」链接 +「to run actions on your own servers.」
    'to run actions on your own servers.': '在你自己的服务器上运行操作。',

    // 运行器详细信息
    'Labels are values used with the': '标签是与',
    "key in your workflow's YAML to send jobs to specific runners. To copy a label, click on it.":
      '键一起在工作流 YAML 中使用的值，用于将作业发送到特定运行器。单击标签即可复制。',
    'key in your workflow’s YAML to send jobs to specific runners. To copy a label, click on it.':
      '键一起在工作流 YAML 中使用的值，用于将作业发送到特定运行器。单击标签即可复制。',
    'Learn more about labels.': '了解标签。',
    'Active Job': '活动作业',
    'There are currently no running jobs': '当前没有正在运行的作业',
    "` to your workflow's YAML to send jobs to this runner.": '` 添加到工作流 YAML 即可将作业发送到此运行器。',
    '` to your workflow’s YAML to send jobs to this runner.': '` 添加到工作流 YAML 即可将作业发送到此运行器。',

    // 新建自托管运行器
    'Add new self-hosted runner': '添加新的自托管运行器',
    'Adding a self-hosted runner requires that you download, configure, and execute the GitHub Actions Runner. By downloading and configuring the GitHub Actions Runner, you agree to the':
      '添加自托管运行器需要下载、配置并运行 GitHub 操作运行器。下载并配置 GitHub 操作运行器即表示你同意',
    'Adding a self-hosted runner requires that you download, configure, and execute the GitHub Actions Runner. If you do not already have an existing volume licensing agreement for your GitHub purchases, by downloading and configuring the GitHub Actions Runner, you agree to the':
      '添加自托管运行器需要下载、配置并运行 GitHub 操作运行器。如果你尚未就所购 GitHub 产品签订批量许可协议，下载并配置 GitHub 操作运行器即表示你同意',
    'GitHub Terms of Service': 'GitHub 服务条款',
    'GitHub Corporate Terms of Service': 'GitHub 企业服务条款',
    ', as applicable.': '，以适用者为准。',
    'We recommend configuring the runner under "\\actions-runner". This will help avoid issues related to service identity folder permissions and long path restrictions on Windows.':
      '建议在“\\actions-runner”下配置运行器，以避免 Windows 上与服务身份文件夹权限和长路径限制相关的问题。',
    'Using your self-hosted runner': '使用自托管运行器',
    'For additional details about configuring, running, or shutting down the runner, please check out our':
      '有关配置、运行或关闭运行器的更多信息，请参阅',
    'product docs': '产品文档',
    'Using self-hosted runners in public repositories is not recommended.': '不建议在公共存储库中使用自托管运行器。',
    'Forks of your public repository can potentially run dangerous code on your self-hosted runner by creating a pull request.':
      '公共存储库的复刻可能通过创建拉取请求，在你的自托管运行器上运行危险代码。',
    'Learn more about security hardening for self-hosted runners': '了解自托管运行器的安全加固',
    'Win-arm64 runners are currently in pre-release status and subject to change.': 'Win-arm64 运行器目前处于预发行阶段，可能会有变动。',

    // 模型
    'Models in this repository': '此存储库中的模型',
    'If disabled, the Models tab will be hidden, and the prompt editor and comparison tooling evaluations will be unavailable.':
      '禁用后，模型标签页将被隐藏，提示编辑器和比较评估工具将不可用。',

    // 策略（日期在前的公告由 regexp 处理）
    'Define whether actions can run in specific contexts.': '定义操作能否在特定上下文中运行。',
    'Learn more about policies.': '了解策略。',
    'Learn more about pull_request_target restrictions': '了解 pull_request_target 限制',
    'on public repositories by default. To continue allowing the event trigger, configure an Actions policy.':
      '事件。如需继续允许此事件触发器，请配置操作策略。',

    // OIDC
    'Customize claims included in the OIDC token.': '自定义 OIDC 令牌中包含的声明。',
    'Learn more about OIDC tokens.': '了解 OIDC 令牌。',
    'Subject claim': '主题声明',
    'Customize the subject (sub) claim in the OIDC token, used to identify the workflow run context.':
      '自定义 OIDC 令牌中的主题 (sub) 声明，用于标识工作流运行的上下文。',
    'Use default template': '使用默认模板',
    'When selected, use upstream template for the subject claim. Unselect to set a custom template.':
      '选中时，主题声明使用上游模板。取消选中可设置自定义模板。',
    'Use immutable subject claim': '使用不可变主题声明',
    'Improve security by including unique identifiers in the subject claim, ensuring that trust policies cannot be assumed by a different repository or organization with the same name.':
      '在主题声明中包含唯一标识符以提高安全性，确保信任策略不会被同名的其他存储库或组织冒用。',
    'Learn more about immutable subject claims.': '了解不可变主题声明。',
    'Default subject claim prefix': '默认主题声明前缀',
    'Use this prefix when configuring trust policies in your cloud provider.': '在云提供商中配置信任策略时使用此前缀。',
    'Copy subject claim prefix': '复制主题声明前缀',
    'Save subject claim': '保存主题声明'
  },
  scoped: {
    'Actions permissions': '操作权限',
    // 「Allow actions by Marketplace」+ <strong>verified creators</strong>
    'verified creators': '已验证创建者的操作',
    Cache: '缓存',
    days: '天',
    'days.': '天。',
    'GB.': 'GB。',
    'Workflow permissions': '工作流权限',
    'Learn more about managing permissions.': '了解如何管理权限。',
    'GitHub-hosted runners': 'GitHub 托管的运行器',
    'Self-hosted runners': '自托管运行器',
    'New runner': '新建运行器',
    'Search runners': '搜索运行器',
    'Runner group': '运行器组',
    'Runner image': '运行器映像',
    Architecture: '架构',
    Image: '映像',
    Size: '规格',
    'Copy label': '复制标签',
    Configuration: '配置',
    'In progress': '正在进行',
    'Cancel run': '取消运行',
    'View workflow file': '查看工作流文件',
    'Remove runner': '删除运行器',
    'Add `': '将 `',
    'Learn more about Models.': '了解模型。',
    // 运行器列表：与操作运行器页共用的说明（actions 词典可能以 static 收录，这里用 scoped 避免冲突）
    'Learn more about using runners': '了解如何使用运行器',
    'Runners are the machines that execute GitHub Actions workflows.': '运行器是执行 GitHub 操作工作流的机器。',
    'Standard GitHub-hosted runners': '标准 GitHub 托管的运行器',
    'Ready-to-use runners managed by GitHub.': '由 GitHub 管理、开箱即用的运行器。',
    'Learn more about GitHub-hosted runners.': '了解 GitHub 托管的运行器。'
  },
  regexp: [
    // 操作权限：仅允许本组织 / 用户的操作
    [new RegExp(`^Allow ${OWNER} actions and reusable workflows$`), '允许 $1 的操作和可复用工作流'],
    [
      new RegExp(`^Allow ${OWNER}, and select non-${OWNER}, actions and reusable workflows$`),
      '允许 $1 以及选定的非 $2 的操作和可复用工作流'
    ],
    [
      new RegExp(`^Any action or reusable workflow defined in a repository within ${OWNER} can be used\\.$`),
      '可以使用 $1 中任何存储库定义的操作或可复用工作流。'
    ],
    [
      new RegExp(
        `^Any action or reusable workflow that matches the specified criteria, plus those defined in a repository within ${OWNER}, can be used\\.$`
      ),
      '可以使用符合指定条件的操作或可复用工作流，以及 $1 中任何存储库定义的操作或可复用工作流。'
    ],
    // 保留期上限
    [/^There is a maximum limit of (\d+) days(\.?)$/, (_, days: string, dot: string) => `上限为 ${days} 天${dot ? '。' : ''}`],
    [
      /^Your organization has set a maximum limit of (\d+) days(\.?)$/,
      (_, days: string, dot: string) => `你的组织设置的上限为 ${days} 天${dot ? '。' : ''}`
    ],
    [/^Retention can be set up to (\d+) days(\.?)$/, (_, days: string, dot: string) => `保留期最多可设为 ${days} 天${dot ? '。' : ''}`],
    [
      /^Total cache size can be set up to (\d+) ?GB(\.?)$/,
      (_, size: string, dot: string) => `缓存总大小最多可设为 ${size} GB${dot ? '。' : ''}`
    ],
    // 保留期 / 缓存大小的输入校验
    [
      /^Retention period must be (?:less than or equal to (\d+) days|(\d+) days? or more)\.$/,
      (_, max: string | undefined, min: string | undefined) => (max ? `保留期不能超过 ${max} 天。` : `保留期不能少于 ${min ?? ''} 天。`)
    ],
    [
      /^Cache size must be (?:less than or equal to (\d+) ?GB|(\d+) ?GB or more)\.$/,
      (_, max: string | undefined, min: string | undefined) => (max ? `缓存大小不能超过 ${max} GB。` : `缓存大小不能少于 ${min ?? ''} GB。`)
    ],
    // 访问
    [/^Accessible from repositories owned by the user ['‘’"“”]?([\w.-]+)['‘’"“”]?$/, '可从用户 $1 拥有的存储库访问'],
    [/^Accessible from repositories in the ['‘’"“”]?([\w.-]+)['‘’"“”]? organization$/, '可从 $1 组织中的存储库访问'],
    [/^Accessible from repositories in the ['‘’"“”]?([\w.-]+)['‘’"“”]? enterprise$/, '可从 $1 企业中的存储库访问'],
    // 策略：pull_request_target 限制公告（事件名在 <code> 中时由 static 匹配后半句）
    [
      new RegExp(`^On (${DATE_SOURCE}), GitHub will restrict$`),
      (_, date: string) => `${joinCjk(translateDate(date) ?? date, '起')}，GitHub 将默认在公共存储库中限制`
    ],
    [
      new RegExp(
        `^On (${DATE_SOURCE}), GitHub will restrict ([\\w-]+) on public repositories by default\\. To continue allowing the event trigger, configure an Actions policy\\.$`
      ),
      (_, date: string, event: string) =>
        `${joinCjk(translateDate(date) ?? date, '起')}，GitHub 将默认在公共存储库中限制 ${event} 事件。如需继续允许此事件触发器，请配置操作策略。`
    ],
    // 运行器详细信息：把标签加入工作流 YAML
    [
      /^Add `([^`]{1,100})` to your workflow[’']s YAML to send jobs to this runner\.$/,
      '将 `$1` 添加到工作流 YAML 即可将作业发送到此运行器。'
    ],
    // 新建自托管运行器：页面标题文本（含 owner/repo）
    [/^Add new self-hosted runner · ([\w.-]+\/[\w.-]+)$/, '添加新的自托管运行器 · $1']
  ]
} satisfies PageDictionary
