import type { PageDictionary } from '../../../core/types'

const TOGGLE: Readonly<Record<string, string>> = { enable: '启用', disable: '禁用' }

/**
 * 代码安全（/settings/security_analysis）：个人推送保护、专用漏洞报告、依赖项关系图、Dependabot、机密扫描，
 * 以及“全部启用 / 全部禁用”确认对话框。
 * 与存储库安全设置相同的功能说明已由 repo-settings 收录（全站生效）；“你的所有存储库”等个人设置独有的句子放 static。
 */
export default {
  static: {
    'Security and analysis features help keep your repositories secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repositories.':
      '安全与分析功能可帮助你的存储库保持安全和最新。启用这些功能即表示你授权我们对你的存储库执行只读分析。',
    "Security and analysis features help keep your repositories secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repositories.":
      '安全与分析功能可帮助你的存储库保持安全和最新。启用这些功能即表示你授权我们对你的存储库执行只读分析。',
    'Security and analysis features help keep you secure and updated, wherever you are.':
      '无论身在何处，安全与分析功能都能帮助你保持安全和最新。',

    // 个人推送保护
    'Push protection for yourself': '个人推送保护',
    'Keep your public pushes safe with push protection': '使用推送保护确保公开推送的安全',
    // 「Block commits that contain <a>supported secrets</a> across all public repositories on GitHub.」整句（未拆开时）：
    // 原文无逗号，译文不加；拆开的片段见 scoped
    'Block commits that contain supported secrets across all public repositories on GitHub.':
      '在 GitHub 上的所有公共存储库中阻止提交中出现受支持的机密。',
    'Enable push protection for yourself': '为自己启用推送保护',
    'Disable push protection for yourself': '为自己禁用推送保护',
    'GitHub will enable push protection for all GitHub Free individuals in January 2024. Enable below to try it now in beta.':
      'GitHub 将于 2024年1月为所有 GitHub 免费版个人用户启用推送保护。可在下方启用以抢先体验测试版。',
    "Pushes that contain secrets will be blocked on public repositories. You'll have the option to bypass the block.":
      '包含机密的推送在公共存储库中将被阻止。你可以选择绕过阻止。',
    'Pushes that contain secrets will be blocked on public repositories. You’ll have the option to bypass the block.':
      '包含机密的推送在公共存储库中将被阻止。你可以选择绕过阻止。',
    'Pushes that contain secrets will not be blocked.': '包含机密的推送将不会被阻止。',

    // 全部启用 / 全部禁用：确认对话框
    "You're about to enable dependency graph on all your private repositories.": '你即将为你的所有专用存储库启用依赖项关系图。',
    'You’re about to enable dependency graph on all your private repositories.': '你即将为你的所有专用存储库启用依赖项关系图。',
    "You're about to disable dependency graph on all your private repositories. This will also disable Dependabot alerts and Dependabot security updates on those repositories.":
      '你即将为你的所有专用存储库禁用依赖项关系图。这也会禁用这些存储库的 Dependabot 警报和 Dependabot 安全更新。',
    'You’re about to disable dependency graph on all your private repositories. This will also disable Dependabot alerts and Dependabot security updates on those repositories.':
      '你即将为你的所有专用存储库禁用依赖项关系图。这也会禁用这些存储库的 Dependabot 警报和 Dependabot 安全更新。',
    "You're about to enable Dependabot alerts on all your repositories. Alerts require the dependency graph, so we'll also turn that on for all repositories. No notifications will be sent while Dependabot alerts are being enabled.":
      '你即将为你的所有存储库启用 Dependabot 警报。警报需要依赖项关系图，因此也会为所有存储库开启依赖项关系图。启用期间不会发送任何通知。',
    'You’re about to enable Dependabot alerts on all your repositories. Alerts require the dependency graph, so we’ll also turn that on for all repositories. No notifications will be sent while Dependabot alerts are being enabled.':
      '你即将为你的所有存储库启用 Dependabot 警报。警报需要依赖项关系图，因此也会为所有存储库开启依赖项关系图。启用期间不会发送任何通知。',
    "You're about to disable Dependabot alerts on all your repositories. This will also disable Dependabot security updates on those repositories.":
      '你即将为你的所有存储库禁用 Dependabot 警报。这也会禁用这些存储库的 Dependabot 安全更新。',
    'You’re about to disable Dependabot alerts on all your repositories. This will also disable Dependabot security updates on those repositories.':
      '你即将为你的所有存储库禁用 Dependabot 警报。这也会禁用这些存储库的 Dependabot 安全更新。',
    "You're about to enable Dependabot security updates on all your repositories. Dependabot security updates require the dependency graph and Dependabot alerts, so we'll also turn that on for all repositories.":
      '你即将为你的所有存储库启用 Dependabot 安全更新。此功能需要依赖项关系图和 Dependabot 警报，因此也会为所有存储库开启它们。',
    'You’re about to enable Dependabot security updates on all your repositories. Dependabot security updates require the dependency graph and Dependabot alerts, so we’ll also turn that on for all repositories.':
      '你即将为你的所有存储库启用 Dependabot 安全更新。此功能需要依赖项关系图和 Dependabot 警报，因此也会为所有存储库开启它们。',
    "You're about to disable Dependabot security updates on all your repositories.": '你即将为你的所有存储库禁用 Dependabot 安全更新。',
    'You’re about to disable Dependabot security updates on all your repositories.': '你即将为你的所有存储库禁用 Dependabot 安全更新。',
    "You're about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts and Dependabot security updates, so we'll also turn that on for all repositories.":
      '你即将为你的所有存储库启用分组安全更新。此功能需要依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此也会为所有存储库开启它们。',
    'You’re about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts and Dependabot security updates, so we’ll also turn that on for all repositories.':
      '你即将为你的所有存储库启用分组安全更新。此功能需要依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此也会为所有存储库开启它们。',
    "You're about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we'll also turn that on for all repositories.":
      '你即将为你的所有存储库启用分组安全更新。此功能需要依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此也会为所有存储库开启它们。',
    'You’re about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we’ll also turn that on for all repositories.':
      '你即将为你的所有存储库启用分组安全更新。此功能需要依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此也会为所有存储库开启它们。',
    "You're about to disable grouped security updates on all your repositories.": '你即将为你的所有存储库禁用分组安全更新。',
    'You’re about to disable grouped security updates on all your repositories.': '你即将为你的所有存储库禁用分组安全更新。',
    // 原文 so 前无逗号：改用“所需的 / 所依赖的”定语，不加逗号
    "You're about to enable dependabot on actions on all your repositories. Dependabot on actions requires Actions so we'll also turn that on for all repositories.":
      '你即将为你的所有存储库启用操作运行器上的 Dependabot。此功能所需的 GitHub 操作也会为所有存储库开启。',
    'You’re about to enable dependabot on actions on all your repositories. Dependabot on actions requires Actions so we’ll also turn that on for all repositories.':
      '你即将为你的所有存储库启用操作运行器上的 Dependabot。此功能所需的 GitHub 操作也会为所有存储库开启。',
    "You're about to disable dependabot on actions on all your repositories.": '你即将为你的所有存储库禁用操作运行器上的 Dependabot。',
    'You’re about to disable dependabot on actions on all your repositories.': '你即将为你的所有存储库禁用操作运行器上的 Dependabot。',
    "You're about to enable dependabot self-hosted on all your repositories. Dependabot self-hosted depends on Dependabot on Actions so we'll also turn that on for all repositories.":
      '你即将为你的所有存储库启用自托管运行器上的 Dependabot。此功能所依赖的操作运行器上的 Dependabot 也会为所有存储库开启。',
    'You’re about to enable dependabot self-hosted on all your repositories. Dependabot self-hosted depends on Dependabot on Actions so we’ll also turn that on for all repositories.':
      '你即将为你的所有存储库启用自托管运行器上的 Dependabot。此功能所依赖的操作运行器上的 Dependabot 也会为所有存储库开启。',
    "You're about to disable dependabot self-hosted on all your repositories.": '你即将为你的所有存储库禁用自托管运行器上的 Dependabot。',
    'You’re about to disable dependabot self-hosted on all your repositories.': '你即将为你的所有存储库禁用自托管运行器上的 Dependabot。',
    'Enable dependency graph': '启用依赖项关系图',
    'Disable dependency graph': '禁用依赖项关系图',
    'Disable Dependabot alerts': '禁用 Dependabot 警报',
    'Enable Dependabot security updates': '启用 Dependabot 安全更新',
    'Disable Dependabot security updates': '禁用 Dependabot 安全更新',
    'Enable grouped security updates': '启用分组安全更新',
    'Disable grouped security updates': '禁用分组安全更新',
    'Enable dependabot on actions': '启用操作运行器上的 Dependabot',
    'Disable dependabot on actions': '禁用操作运行器上的 Dependabot',
    'Enable dependabot self-hosted': '启用自托管运行器上的 Dependabot',
    'Disable dependabot self-hosted': '禁用自托管运行器上的 Dependabot'
  },
  scoped: {
    'Security & analysis': '安全与分析',
    'Disable all': '全部禁用',
    'Enable all': '全部启用',
    'Security and analysis features help keep your repositories secure and updated.': '安全与分析功能可帮助你的存储库保持安全和最新。',
    // 「Block commits that contain <a>supported secrets</a> across all public repositories on GitHub.」
    // 范围状语并入句首片段，句尾片段只剩句号；supported secrets 与存储库安全设置同译
    'Block commits that contain': '在 GitHub 上的所有公共存储库中阻止提交中出现',
    'supported secrets': '受支持的机密',
    'across all public repositories on GitHub.': '。',

    // 专用漏洞报告（功能说明与 Enable private vulnerability reporting 由 repo-settings 收录）
    'Automatically enable for new public repositories': '为新的公共存储库自动启用',
    'Disable private vulnerability reporting': '禁用专用漏洞报告',
    'Enable by default for new public repositories': '为新的公共存储库默认启用',

    // 依赖项关系图
    'Automatically enable for new private repositories': '为新的专用存储库自动启用',
    'Enable by default for new private repositories': '为新的专用存储库默认启用',

    // Dependabot（Dependabot alerts 见 permissions.ts）
    'Automatically enable for new repositories': '为新存储库自动启用',
    'Enable by default for new repositories': '为新存储库默认启用',
    'Dependabot security updates': 'Dependabot 安全更新',
    'Grouped security updates': '分组安全更新',
    'Learn how to group updates.': '了解如何分组更新。',
    'Dependabot on Actions runners': '操作运行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自托管运行器上的 Dependabot',

    // 「全部启用 / 全部禁用」按钮的无障碍标签
    'Enable all private vulnerability reporting': '全部启用专用漏洞报告',
    'Disable all private vulnerability reporting': '全部禁用专用漏洞报告',
    'Enable all dependency graph': '全部启用依赖项关系图',
    'Disable all dependency graph': '全部禁用依赖项关系图',
    'Enable all Dependabot alerts': '全部启用 Dependabot 警报',
    'Disable all Dependabot alerts': '全部禁用 Dependabot 警报',
    'Enable all Dependabot security updates': '全部启用 Dependabot 安全更新',
    'Disable all Dependabot security updates': '全部禁用 Dependabot 安全更新',
    'Enable all grouped security updates': '全部启用分组安全更新',
    'Disable all grouped security updates': '全部禁用分组安全更新',
    'Enable all dependabot on actions': '全部启用操作运行器上的 Dependabot',
    'Disable all dependabot on actions': '全部禁用操作运行器上的 Dependabot',
    'Enable all dependabot self-hosted': '全部启用自托管运行器上的 Dependabot',
    'Disable all dependabot self-hosted': '全部禁用自托管运行器上的 Dependabot',

    // 机密扫描与推送保护
    'Secret scanning': '机密扫描',
    'Enable secret scanning for eligible repositories?': '为符合条件的存储库启用机密扫描？',
    'This will turn on secret scanning for all public repositories.': '这将为所有公共存储库开启机密扫描。',
    'Enable for eligible repositories': '为符合条件的存储库启用',
    'Disable secret scanning?': '禁用机密扫描？',
    'This will disable secret scanning on all repositories where it is enabled.': '这将在所有已启用机密扫描的存储库中禁用它。',
    'Disable secret scanning': '禁用机密扫描',
    'Push protection': '推送保护',
    'Automatically enable for repositories added to secret scanning': '为新加入机密扫描的存储库自动启用',
    'Enable push protection for eligible repositories?': '为符合条件的存储库启用推送保护？',
    'This will turn on push protection for all repositories that have secret scanning enabled.':
      '这将为所有已启用机密扫描的存储库开启推送保护。',
    'Disable push protection?': '禁用推送保护？',
    'This will disable push protection on all repositories where it is enabled.': '这将在所有已启用推送保护的存储库中禁用它。',
    'You can still enable push protection at the repository level.': '你仍可在存储库级别启用推送保护。',
    'Enable push protection': '启用推送保护',
    'Disable push protection': '禁用推送保护'
  },
  regexp: [
    [
      /^You['’]re about to (enable|disable) private vulnerability reporting on all public repositories in (\S+)\.$/,
      (_, action: string, owner: string) => `你即将为 ${owner} 的所有公共存储库${TOGGLE[action] ?? action}专用漏洞报告。`
    ],
    [/^Security settings updated for (\S+?)['’]s repositories\.$/, '已更新 $1 存储库的安全设置。']
  ]
} satisfies PageDictionary
