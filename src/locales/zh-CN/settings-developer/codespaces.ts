import type { PageDictionary } from '../../../core/types'

/**
 * 代码空间设置（/settings/codespaces、/settings/codespaces/secrets/…）：
 * Dotfiles、代码空间机密、GPG 验证、设置同步、可信存储库、访问与安全、编辑器首选项、
 * 默认空闲超时、默认保留期、主机映像版本、区域。
 * 产品名按用户要求译成中文（Codespaces / codespace → 代码空间，Beta → 测试版）；
 * 编辑器名（Visual Studio Code、JetBrains Gateway、JupyterLab）保留英文。
 */
export default {
  static: {
    // Dotfiles
    'Automatically install dotfiles': '自动安装 dotfiles',
    'Codespaces can automatically install your dotfiles into every codespace you create.':
      '代码空间可以自动将你的 dotfiles 安装到你创建的每个代码空间中。',
    'Learn how to set up your dotfiles for Codespaces.': '了解如何为代码空间设置 dotfiles。',
    'Learn how to set up your dotfiles.': '了解如何设置 dotfiles。',
    'This setting installs your dotfiles in environments created by Copilot in the cloud and Codespaces.':
      '此设置会将你的 dotfiles 安装到云端 Copilot 和代码空间创建的环境中。',
    'This setting installs your dotfiles in environments created by Copilot in the cloud.':
      '此设置会将你的 dotfiles 安装到云端 Copilot 创建的环境中。',
    'Dotfiles repository': 'Dotfiles 存储库',
    'Select a repository you own to use as your dotfiles repository.': '选择一个你拥有的存储库作为 dotfiles 存储库。',
    'Failed to update your dotfiles settings. Please try again.': '无法更新 dotfiles 设置。请重试。',

    // 代码空间机密
    'Codespace user secrets': '代码空间用户机密',
    'Development environment secrets are environment variables that are encrypted. They are available to any codespace you create using repositories with access to that secret.':
      '开发环境机密是加密的环境变量。使用有权访问该机密的存储库创建的任何代码空间都可以使用它们。',
    'There are no Codespace secrets.': '暂无代码空间机密。',
    'There are no Codespaces secrets.': '暂无代码空间机密。',
    'Secrets created at the user level can be shared with specified repositories.': '在用户级别创建的机密可以与指定存储库共享。',
    '/ New secret': '/ 新建机密',
    '/ Update secret': '/ 更新机密',
    'Secret name is required and must not start with GITHUB': '机密名称必填且不能以 GITHUB 开头',
    'This secret will not be active until at least 1 repository is selected.': '至少选择 1 个存储库后此机密才会生效。',

    // GPG 验证与设置同步
    'GPG verification': 'GPG 验证',
    'Codespaces can have GPG commit signing capabilities so that GitHub can verify that commits made in the codespace come from a trusted source. When enabled, this setting will be applied to your list of trusted repositories.':
      '代码空间可以具备 GPG 提交签名功能以便 GitHub 验证在代码空间中所做的提交来自可信来源。启用后，此设置将应用于你的可信存储库列表。',
    'GPG signing will be available in Codespaces': '代码空间中将可以使用 GPG 签名',
    'Settings Sync': '设置同步',
    'By enabling, your codespaces will be able to pull from VS Code Settings Sync service and push only for the trusted repositories you specify. Only enable this for repositories that you trust.':
      '启用后，你的代码空间将能从 VS Code 设置同步服务拉取设置并只为你指定的可信存储库推送。请仅为你信任的存储库启用。',
    'VS Code Settings Sync will be available in Codespaces': '代码空间中将可以使用 VS Code 设置同步',
    'When enabled, you will receive emails when your codespaces are nearing deletion due to inactivity.':
      '启用后，你会在代码空间因长期未使用即将被删除时收到电子邮件。',
    'Warning notifications for codespace deletions will be enabled': '将启用代码空间删除警告通知',
    'Trusted repositories': '可信存储库',
    'The following repositories will be referenced by GPG verification and Settings Sync.': 'GPG 验证和设置同步将使用以下存储库。',
    'GPG signing and VS Code Settings Sync will be available for codespaces for all repositories':
      '所有存储库的代码空间都将可以使用 GPG 签名和 VS Code 设置同步',
    'GPG signing and VS Code Settings Sync will be available for codespaces from the selected repositories':
      '所选存储库的代码空间将可以使用 GPG 签名和 VS Code 设置同步',
    'GPG and VS Code Settings Sync will be available for Codespaces from these repositories.':
      '这些存储库的代码空间将可以使用 GPG 和 VS Code 设置同步。',

    // 访问与安全（已弃用）
    'Access and security': '访问与安全',
    'Codespaces you create for your personal account can either be restricted to accessing the repository it was opened for, or granted read access to other repositories you own.':
      '你为个人帐户创建的代码空间可以仅限访问打开它的存储库，也可以获得你拥有的其他存储库的读取访问权限。',
    'Limit access of personal Codespaces to the repository they were opened for': '将个人代码空间的访问限制为打开它的存储库',
    'All Codespaces can access other repositories I own': '所有代码空间都可以访问我拥有的其他存储库',
    'Personal Codespaces created for specific repositories can access other repositories I own':
      '为特定存储库创建的个人代码空间可以访问我拥有的其他存储库',

    // 编辑器首选项
    'Editor preference': '编辑器首选项',
    'Connect to the cloud from your local desktop client. Requires': '从本地桌面客户端连接到云端。需要',
    'Connect to the cloud from your local desktop client. Requires the': '从本地桌面客户端连接到云端。需要',
    'plugin, and a JetBrains license.': '插件和 JetBrains 许可证。',
    'Visual Studio Code for the Web': '网页版 Visual Studio Code',
    'Edit and preview changes straight from the browser.': '直接在浏览器中编辑和预览更改。',
    'Edit and run notebooks from the browser with JupyterLab.': '使用 JupyterLab 在浏览器中编辑和运行笔记本。',

    // 默认空闲超时、保留期
    'Default idle timeout': '默认空闲超时',
    'A codespace will suspend after a period of inactivity. You can specify a default idle timeout value, which will apply to all codespaces created after the default is changed. You will be charged for the entire time your codespace is running, even if it is idle. The maximum value is':
      '代码空间将在一段时间无活动后暂停。你可以指定默认空闲超时值，它将应用于更改默认值后创建的所有代码空间。代码空间运行的全部时间都会计费，即使处于空闲状态。最大值为',
    'minutes (4 hours).': '分钟（4 小时）。',
    'Default retention period': '默认保留期',
    'Inactive codespaces are automatically deleted 30 days after the last time they were stopped. A shorter retention period can be set, and will apply to all codespaces created going forward. The default and maximum value is':
      '非活动的代码空间会在最后一次停止 30 天后自动删除。你可以设置更短的保留期，它将应用于今后创建的所有代码空间。默认值和最大值均为',
    'Learn about retention setting': '了解保留期设置',
    'Timeout must be 5 minutes or more.': '超时时间不能少于 5 分钟。',
    'Timeout must be 240 minutes or less.': '超时时间不能超过 240 分钟。',
    'Retention period must be 30 days or less.': '保留期不能超过 30 天。',
    'Retention period must be between 0 and 30 days.': '保留期必须介于 0 到 30 天之间。',

    // 主机映像版本首选项
    'Host image version preference': '主机映像版本首选项',
    'The host image defines the operating system in which development containers run. These images receive periodic upgrades for security, functionality, and performance. GitHub Codespaces offers early access to beta images to ensure compatibility with existing development container configurations. Any codespace created or resumed after changing this setting will use the specified image configuration.':
      '主机映像定义了开发容器运行所在的操作系统。这些映像会定期升级以提升安全性、功能和性能。GitHub 代码空间提供测试版映像的抢先体验以确保与现有开发容器配置兼容。更改此设置后创建或恢复的所有代码空间都将使用指定的映像配置。',
    'Learn more about host images': '了解主机映像',
    'Always use the latest stable configuration.': '始终使用最新的稳定配置。',
    'Use a beta image configuration when available. Otherwise, use the latest stable configuration.':
      '可用时使用测试版映像配置。否则，使用最新的稳定配置。',

    // 区域
    'Your default region will be used to designate compute resources to your codespaces. GitHub can set your region automatically based on your location, or you can set it yourself. Codespaces are deployed to a subset of Azure regions.':
      '默认区域用于为你的代码空间分配计算资源。GitHub 可以根据你的位置自动设置区域，你也可以自行设置。代码空间部署在部分 Azure 区域中。',
    'Set automatically': '自动设置',
    'We will determine the closest available region based on your location (IP address) at codespace creation time.':
      '我们将在创建代码空间时根据你的位置（IP 地址）确定最近的可用区域。',
    'Set manually': '手动设置',
    'Choose your default region': '选择默认区域'
  },
  scoped: {
    // Dotfiles、机密（与存储库、组织设置共用的短语；Secrets 见 permissions.ts，Select repository 由 common-ui 收录）
    'New secret': '新建机密',
    'Add secret': '添加机密',
    'Update secret': '更新机密',
    'Adding…': '添加中…',
    'Adding...': '添加中...',
    'Secret added.': '已添加机密。',
    'Secret deleted.': '已删除机密。',
    'Secret updated.': '已更新机密。',
    Value: '值',
    'Available to': '可用于',
    'Secret values are encrypted and cannot be displayed, but you can': '机密值已加密且无法显示，但你可以',
    'enter a new value.': '输入新值。',
    'Selected repositories': '所选存储库',

    // 编辑器首选项：「Requires <a>Visual Studio Code</a> with the <a>GitHub Codespaces</a> extension.」
    // 「Requires the <a>JetBrains Gateway</a> with the <a>GitHub Codespaces</a> plugin, and a JetBrains license.」
    // 链接文字 GitHub Codespaces 是扩展名，产品名按用户要求译成中文
    'with the': '及',
    'extension.': '扩展。',
    'GitHub Codespaces': 'GitHub 代码空间',

    // 时长单位、映像、区域（US West 等区域名由 repo-settings 收录，国家名由 common 收录）
    minutes: '分钟',
    days: '天',
    'days.': '天。',
    Stable: '稳定版',
    Beta: '测试版',
    Region: '区域',
    'Asia Pacific': '亚太'
  },
  regexp: [
    [/^(\d+) repositor(?:y|ies)$/, '$1 个存储库'],
    [/^Selected (\d+) repositor(?:y|ies)(\.?)$/, (_, count: string, dot: string) => `已选择 ${count} 个存储库${dot ? '。' : ''}`],
    // 机密名为大写标识符
    [/^Are you sure you want to delete ([A-Z][A-Z0-9_]*)\?$/, '确定要删除 $1 吗？'],
    [/^Remove ([A-Z][A-Z0-9_]*)$/, '删除 $1'],
    [/^Update ([A-Z][A-Z0-9_]*)$/, '更新 $1']
  ]
} satisfies PageDictionary
