import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * 组织 Actions 设置：常规（策略、存储库级自托管运行器、产物与日志保留、复刻拉取请求工作流、
 * 工作流权限）、运行器、运行器组、缓存。
 * 与存储库 Actions 设置同名的短词放 scoped；存储库设置已收录为 static 的句子（Actions 策略、产物和日志保留、
 * 复刻拉取请求工作流、工作流权限、运行器说明等）不再重复，译法以那里为准。
 * 产品名、方案名译成中文（见 nav.ts 文件头）：Actions / GitHub Actions → 操作 / GitHub 操作，Team / Enterprise → 团队版 / 企业版。
 */
export default {
  static: {
    // 常规：策略
    'General actions permissions': '常规操作权限',
    'Choose which repositories are permitted to use GitHub Actions.': '选择允许使用 GitHub 操作的存储库。',
    'Actions can be run by any repository in the organization': '组织中的任何存储库都可以运行 GitHub 操作',
    'Actions can only be run by specifically selected repositories': '只有明确选定的存储库才能运行 GitHub 操作',
    'Select the organization repositories that may use Actions.': '选择可以使用 GitHub 操作的组织存储库。',
    'GitHub Actions is disabled for all repositories in the organization': '已为组织中的所有存储库禁用 GitHub 操作',
    'Disable for all repositories': '为所有存储库禁用',

    // 常规：存储库级自托管运行器
    'Choose which repositories are allowed to create repository-level self-hosted runners.': '选择允许创建存储库级自托管运行器的存储库。',
    'Repo-level self-hosted runners can be used by any repository in the organization': '组织中的任何存储库都可以使用存储库级自托管运行器',
    'Repo-level self-hosted runners can be used by specifically selected repositories': '明确选定的存储库可以使用存储库级自托管运行器',
    'Select the organization repositories that may use repository-level self-hosted runners.':
      '选择可以使用存储库级自托管运行器的组织存储库。',
    'Repo-level self-hosted runners are disabled for all repositories in the organization':
      '已为组织中的所有存储库禁用存储库级自托管运行器',
    'Repo-level self-hosted runners settings changed.': '已更改存储库级自托管运行器设置。',

    // 常规：保留、复刻拉取请求
    'Choose the default repository settings for artifacts and logs.': '选择产物和日志的默认存储库设置。',
    'Fork pull request workflows in private repositories': '专用存储库中的复刻拉取请求工作流',
    'These settings apply to private repositories. Repository administrators will only be able to change the settings that are enabled here.':
      '这些设置适用于专用存储库。存储库管理员只能更改此处已启用的设置。',
    'Send secrets and variables to workflows from fork pull requests.': '向来自复刻拉取请求的工作流发送机密和变量。',
    'This tells Actions to send repository secrets and variables to workflows from pull requests originating from repository forks.':
      '这会让 GitHub 操作向来自存储库复刻的拉取请求所触发的工作流发送存储库机密和变量。',
    'Require approval for fork pull request workflows.': '复刻拉取请求工作流需要批准。',
    'Fork pull requests from users without write access will require approval to run workflows.':
      '来自无写入访问权限用户的复刻拉取请求需要批准才能运行工作流。',
    'Fork pull request workflow settings saved.': '已保存复刻拉取请求工作流设置。',
    'Fork pull request outside collaborators settings saved.': '已保存复刻拉取请求外部协作者设置。',

    // 常规：工作流权限
    'Choose the default permissions granted to the GITHUB_TOKEN when running workflows in this organization. You can specify more granular permissions in the workflow using YAML.':
      '选择在此组织中运行工作流时授予 GITHUB_TOKEN 的默认权限。你可以在工作流中使用 YAML 指定更精细的权限。',
    'Repository administrators will only be able to change the default permissions to a more restrictive setting.':
      '存储库管理员只能将默认权限改为更严格的设置。',
    'Required workflows': '必需工作流',
    'Set required workflows to run in your organization’s repositories. These workflows will run alongside the repository workflows and branch merging will be blocked until the required checks succeed.':
      '设置在组织存储库中运行的必需工作流。这些工作流将与存储库工作流一起运行，在必需检查通过之前将阻止合并分支。',
    "Set required workflows to run in your organization's repositories. These workflows will run alongside the repository workflows and branch merging will be blocked until the required checks succeed.":
      '设置在组织存储库中运行的必需工作流。这些工作流将与存储库工作流一起运行，在必需检查通过之前将阻止合并分支。',
    'Learn more about required workflows.': '了解必需工作流。',
    'There are no required workflows in this organization.': '此组织中暂无必需工作流。',

    // 运行器
    'Includes all runners across self-hosted and GitHub-hosted runners.': '包括所有自托管运行器和 GitHub 托管的运行器。',
    'Host your own runners and customize the environment used to run jobs in your GitHub Actions workflows. Runners added to this organization can be used to process jobs in multiple repositories in your organization.':
      '托管你自己的运行器，并自定义运行 GitHub 操作工作流作业的环境。添加到此组织的运行器可以处理组织中多个存储库的作业。',
    'New GitHub-hosted runner': '新建 GitHub 托管的运行器',
    'Bring your own infrastructure': '使用你自己的基础设施',
    'Pay-as-you-go, customizable, secure, scaled &': '按需付费、可自定义、安全、可扩展，并',
    'managed by GitHub': '由 GitHub 管理',
    'Only available on paid Team or Enterprise plans': '仅适用于付费的团队版或企业版计划',
    'All jobs usage': '所有作业使用情况',
    'To increase your concurrency limit, upgrade your': '要提高并发上限，请升级',
    'GitHub plan.': 'GitHub 计划。',
    'Larger GitHub-hosted runners': '更大的 GitHub 托管运行器',
    Unprovisioned: '未预配',
    'Team & Enterprise': '团队版和企业版',
    'Set up larger runners': '设置更大的运行器',
    'View larger runner docs': '查看更大运行器的文档',
    'See pricing': '查看价格',
    'Sizes up to:': '最大规格：',
    'Shared with this repository': '与此存储库共享',
    'Shared runner list': '共享运行器列表',
    'Runner scale sets': '运行器规模集',
    'Runner scale set list': '运行器规模集列表',
    'Maximum concurrency': '最大并发数',
    'Enable this runner to generate custom images': '允许此运行器生成自定义映像',
    'Create runner': '创建运行器',
    'Assign unique & static public IP address ranges for this runner': '为此运行器分配唯一的静态公共 IP 地址范围',
    'Force remove this runner': '强制删除此运行器',
    'Find or create a label': '查找或创建标签',
    'Create new label': '创建新标签',
    'Use dedicated runner groups for image generation.': '使用专用运行器组生成映像。',
    'Do not allow public repositories to access image-generation runners.': '不允许公共存储库访问用于生成映像的运行器。',
    'Apply least privilege to repositories.': '对存储库应用最小权限。',

    // 运行器组
    'Control access to your runners by specifying the repositories that are able to use your shared organization runners. New runners will be automatically assigned to the default group if no other group is specified. Upgrade to an Enterprise plan to create groups.':
      '通过指定可以使用组织共享运行器的存储库来控制运行器的访问权限。未指定其他组时，新运行器将自动分配到默认组。升级到企业版计划即可创建组。',
    'Control access to your runners by specifying the repositories that are able to use your shared organization runners. New runners will be automatically assigned to the default group if no other group is specified.':
      '通过指定可以使用组织共享运行器的存储库来控制运行器的访问权限。未指定其他组时，新运行器将自动分配到默认组。',
    'Search runner groups': '搜索运行器组',
    'Shared by the Enterprise': '由企业共享',
    'New runner group': '新建运行器组',
    // 原文是一句，句中不加句号
    'This group cannot be deleted and new runners will be automatically assigned to this group if no other group is specified.':
      '此组无法删除，未指定其他组时新运行器将自动分配到此组。',
    // 逗号随原文，结尾不加括号
    'All repositories, excluding public repositories': '所有存储库，不含公共存储库',
    'Group name': '组名称',
    'Create group': '创建组',
    'Save group': '保存组',
    'Remove group': '删除组',
    'Remove this runner group': '删除此运行器组',
    'Move runner to group': '将运行器移至组',
    'Allow public repositories': '允许公共存储库',
    'Workflow access': '工作流访问权限',
    'All workflows': '所有工作流',
    'Selected workflows': '选定的工作流',
    'Select the network configuration for this runner group. Only available for GitHub-hosted runners.':
      '为此运行器组选择网络配置。仅适用于 GitHub 托管的运行器。',
    'Learn more about network configurations.': '了解网络配置。',
    'Note: Network configurations are not supported for macOS runners. Any macOS runners assigned to runner groups with network configurations will fail to come online.':
      '注意：macOS 运行器不支持网络配置。分配到带网络配置的运行器组的 macOS 运行器将无法上线。',
    'This group contains a macOS runner and cannot be assigned a network configuration.': '此组包含 macOS 运行器，无法分配网络配置。',
    'No configuration': '无配置',
    'Disabled configuration': '已禁用的配置',
    'No network configuration found': '未找到网络配置',
    'Select network configuration': '选择网络配置',
    'This network configuration is disabled': '此网络配置已禁用',
    'This group contains a runner using a public IP and cannot be assigned a network configuration.':
      '此组包含使用公共 IP 的运行器，无法分配网络配置。',

    // 缓存
    'You can use caches for dependencies and other commonly reused files to speed up your workflows. The data on this page have at least 5 minutes of latency.':
      '你可以为依赖项和其他常用文件使用缓存，以加快工作流速度。此页面的数据至少有 5 分钟延迟。',
    'Learn more about caches': '了解缓存',
    'Filter caches': '筛选缓存',
    'Largest size': '从大到小',
    'Smallest size': '从小到大',
    'No repository uses caches': '没有存储库使用缓存',
    'Nothing has been cached by workflows running in any repositories of this organization.':
      '此组织中的存储库运行的工作流尚未缓存任何内容。',
    'Learn more about caching': '了解如何缓存',
    'dependencies and build outputs to improve workflow execution time.': '依赖项和构建输出，以缩短工作流执行时间。'
  },
  scoped: {
    // 「Applies to」+ <public> +「repositories only」：整句由 inline 收录（仅适用于公共存储库），这两条是片段后备；
    // 「Applies to」与合并进来的规则集词典共用，译法一致
    'Applies to': '适用于',
    'repositories only': '存储库',

    // 与存储库 Actions 设置共用（「Allow actions by Marketplace」+「verified creators」，译法与存储库设置一致）
    'Actions permissions': '操作权限',
    'verified creators': '已验证创建者的操作',
    'Selected repositories': '所选存储库',
    'selected repository': '个所选存储库',
    'selected repositories': '个所选存储库',
    'Filter repositories': '筛选存储库',
    'No repositories found.': '未找到存储库。',
    'No repositories selected': '未选择存储库',
    '1 selected repository': '1 个所选存储库',
    days: '天',
    'You can set a maximum limit of': '你可以设置的上限为',
    'days.': '天。',
    write: '写入',
    'Workflow permissions': '工作流权限',
    'Learn more about managing permissions.': '了解如何管理权限。',
    'This controls whether GitHub Actions can create pull requests or submit approving pull request reviews.':
      '控制 GitHub 操作能否创建拉取请求或提交批准性审查。',
    'Add workflow': '添加工作流',

    // 运行器（运行器列表的通用文字由 actions 词典的 static 收录）
    'Search runners': '搜索运行器',
    // 运行器状态与规则集强制实施状态同译；Active jobs 按官方界面名作“活动作业”
    Active: '活动',
    Labels: '标签',
    'Active jobs': '活动作业',
    'Runner group': '运行器组',
    'Runner image': '运行器映像',
    Architecture: '架构',
    Image: '映像',
    'Image version': '映像版本',
    Size: '规格',
    Latest: '最新',
    Custom: '自定义',
    'GitHub-owned': 'GitHub 拥有',
    Partner: '合作伙伴',
    'GPU-powered': 'GPU 加速',
    Capacity: '容量',
    Networking: '网络',
    Group: '组',
    'Sort:': '排序：',
    Online: '在线',
    'Public IP': '公共 IP',
    'Larger runners': '更大的运行器',
    'Create new runner': '创建新运行器',
    'Remove runner': '删除运行器',

    // 常规：策略与复刻拉取请求（整句在同一文本节点时）
    'Allow actions by Marketplace verified creators': '允许市场已验证创建者的操作',
    'Repo-level self-hosted runners': '存储库级自托管运行器',
    'Access policy': '访问策略',
    'Send write tokens to workflows from fork pull requests': '向来自复刻拉取请求的工作流发送写入令牌',
    'Send secrets and variables to workflows from fork pull requests': '向来自复刻拉取请求的工作流发送机密和变量',

    // 缓存
    'Last used': '最后使用',
    'Recently used': '最近使用',
    'Delete all caches': '删除所有缓存',

    // 运行器列表、新建自托管运行器（与存储库设置译法一致）
    'Learn more about using runners': '了解如何使用运行器',
    'Runners are the machines that execute GitHub Actions workflows.': '运行器是执行 GitHub 操作工作流的机器。',
    'Standard GitHub-hosted runners': '标准 GitHub 托管的运行器',
    'Ready-to-use runners managed by GitHub.': '由 GitHub 管理、开箱即用的运行器。',
    'Learn more about GitHub-hosted runners.': '了解 GitHub 托管的运行器。',
    '/ GitHub-hosted runners': '/ GitHub 托管的运行器',
    '/ Create self-hosted runner': '/ 创建自托管运行器',
    'macOS-arm64 runners are currently in pre-release status and subject to change.':
      'macOS-arm64 运行器目前处于预发行状态，可能会有变动。',
    // 「Add `」+ 标签 +「` to your workflow's YAML to send jobs to …」（原文无逗号，译文不加，与存储库设置一致）
    'Add `': '将 `',
    "` to your workflow's YAML to send jobs to GitHub-hosted runners.": '` 添加到工作流 YAML 即可将作业发送到 GitHub 托管的运行器。',
    '` to your workflow’s YAML to send jobs to GitHub-hosted runners.': '` 添加到工作流 YAML 即可将作业发送到 GitHub 托管的运行器。',
    "` to your workflow's YAML to send jobs to this runner.": '` 添加到工作流 YAML 即可将作业发送到此运行器。',
    '` to your workflow’s YAML to send jobs to this runner.': '` 添加到工作流 YAML 即可将作业发送到此运行器。'
  },
  regexp: [
    [/^(\d+) selected repositor(?:y|ies)$/, '$1 个所选存储库'],
    // 「Allow all actions and reusable workflows」由存储库设置的 static 收录，组织名排除 all
    [new RegExp(`^Allow (?!all )${ORG} actions and reusable workflows$`), '允许 $1 的操作和可复用工作流'],
    [
      new RegExp(`^Any action or reusable workflow defined in a repository within the ${ORG} organization can be used\\.$`),
      '可以使用 $1 组织内任何存储库中定义的操作或可复用工作流。'
    ],
    [new RegExp(`^Allow ${ORG}, and select non-${ORG}, actions and reusable workflows$`), '允许 $1 的以及所选的非 $2 的操作和可复用工作流'],
    [
      new RegExp(
        `^Any action or reusable workflow that matches the specified criteria, plus those defined in a repository within the ${ORG} organization, can be used\\.$`
      ),
      '可以使用符合指定条件的操作或可复用工作流，以及 $1 组织内存储库中定义的操作或可复用工作流。'
    ],
    [/^(\d+) active jobs?$/, '$1 个活动作业'],
    [/^(\d+) caches?$/, '$1 个缓存'],
    [/^(\d+) runners?$/, '$1 个运行器'],
    [/^(\d+) runner groups?$/, '$1 个运行器组'],
    [/^Copy (ubuntu-latest|windows-latest|macos-latest)$/, '复制 $1'],
    [/^(\d+) repositor(?:y|ies) with caches?$/, '$1 个存储库有缓存'],
    // 运行器：把标签加入工作流 YAML（同一文本节点时）
    [
      /^Add `([^`]{1,100})` to your workflow[’']s YAML to send jobs to (this runner|GitHub-hosted runners)\.$/,
      (_, label: string, target: string) =>
        `将 \`${label}\` 添加到工作流 YAML 即可将作业发送到${target === 'this runner' ? '此运行器' : ' GitHub 托管的运行器'}。`
    ]
  ],
  // 策略说明：Applies to <strong>public</strong> repositories only，only 在片段里译不出来，整句收录
  inline: [['Applies to {} repositories only', '仅适用于{}存储库']]
} satisfies PageDictionary
