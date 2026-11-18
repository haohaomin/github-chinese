import type { PageDictionary } from '../../../core/types'

const TOGGLE: Readonly<Record<string, string>> = { enable: '啟用', disable: '停用' }

/**
 * 代码安全（/settings/security_analysis）：个人推送保护、专用漏洞报告、依赖项关系图、Dependabot、机密扫描，
 * 以及「全部啟用 / 全部停用」确认对话框。
 * 与存储库安全设置相同的功能说明已由 repo-settings 收录（全站生效）；“你的所有存储库”等个人设置独有的句子放 static。
 * 与组织设置（org-settings/security.ts）同键同译：Security & analysis → 安全性和分析，dependency graph → 相依性圖表，
 * private vulnerability reporting → 私下回報漏洞，Actions runners → 動作執行器，self-hosted → 自架，eligible → 符合資格；
 * 阻挡提交、推送作「阻擋」（封鎖只用于用户）。
 */
export default {
  static: {
    'Security and analysis features help keep your repositories secure and updated. By enabling these features, you’re granting us permission to perform read-only analysis on your repositories.':
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對你的儲存庫執行唯讀分析。',
    "Security and analysis features help keep your repositories secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repositories.":
      '安全性和分析功能可協助你的儲存庫保持安全和最新。啟用這些功能即表示你授權我們對你的儲存庫執行唯讀分析。',
    'Security and analysis features help keep you secure and updated, wherever you are.':
      '無論你身在何處，安全性和分析功能都能協助你保持安全和最新。',

    // 个人推送保护
    'Push protection for yourself': '個人推送保護',
    'Keep your public pushes safe with push protection': '使用推送保護確保你的公開推送安全',
    // 「Block commits that contain <a>supported secrets</a> across all public repositories on GitHub.」整句（未拆开时）：
    // 原文无逗号，译文不加；拆开的片段见 scoped
    'Block commits that contain supported secrets across all public repositories on GitHub.':
      '在 GitHub 上的所有公開儲存庫中阻擋含有支援的機密的提交。',
    'Enable push protection for yourself': '為自己啟用推送保護',
    'Disable push protection for yourself': '為自己停用推送保護',
    'GitHub will enable push protection for all GitHub Free individuals in January 2024. Enable below to try it now in beta.':
      'GitHub 將於 2024年1月為所有 GitHub 免費版個人使用者啟用推送保護。在下方啟用以立即試用測試版。',
    "Pushes that contain secrets will be blocked on public repositories. You'll have the option to bypass the block.":
      '公開儲存庫中含有機密的推送將遭到阻擋。你可以選擇繞過阻擋。',
    'Pushes that contain secrets will be blocked on public repositories. You’ll have the option to bypass the block.':
      '公開儲存庫中含有機密的推送將遭到阻擋。你可以選擇繞過阻擋。',
    'Pushes that contain secrets will not be blocked.': '含有機密的推送不會遭到阻擋。',

    // 全部启用 / 全部停用：确认对话框（与 org-settings/security.ts 的组织版句式一致）
    "You're about to enable dependency graph on all your private repositories.": '你即將為你的所有私人儲存庫啟用相依性圖表。',
    'You’re about to enable dependency graph on all your private repositories.': '你即將為你的所有私人儲存庫啟用相依性圖表。',
    "You're about to disable dependency graph on all your private repositories. This will also disable Dependabot alerts and Dependabot security updates on those repositories.":
      '你即將為你的所有私人儲存庫停用相依性圖表。這也會停用這些儲存庫的 Dependabot 警示和 Dependabot 安全性更新。',
    'You’re about to disable dependency graph on all your private repositories. This will also disable Dependabot alerts and Dependabot security updates on those repositories.':
      '你即將為你的所有私人儲存庫停用相依性圖表。這也會停用這些儲存庫的 Dependabot 警示和 Dependabot 安全性更新。',
    "You're about to enable Dependabot alerts on all your repositories. Alerts require the dependency graph, so we'll also turn that on for all repositories. No notifications will be sent while Dependabot alerts are being enabled.":
      '你即將為你的所有儲存庫啟用 Dependabot 警示。警示需要相依性圖表，因此我們也會為所有儲存庫開啟相依性圖表。啟用 Dependabot 警示期間不會傳送通知。',
    'You’re about to enable Dependabot alerts on all your repositories. Alerts require the dependency graph, so we’ll also turn that on for all repositories. No notifications will be sent while Dependabot alerts are being enabled.':
      '你即將為你的所有儲存庫啟用 Dependabot 警示。警示需要相依性圖表，因此我們也會為所有儲存庫開啟相依性圖表。啟用 Dependabot 警示期間不會傳送通知。',
    "You're about to disable Dependabot alerts on all your repositories. This will also disable Dependabot security updates on those repositories.":
      '你即將為你的所有儲存庫停用 Dependabot 警示。這也會停用這些儲存庫的 Dependabot 安全性更新。',
    'You’re about to disable Dependabot alerts on all your repositories. This will also disable Dependabot security updates on those repositories.':
      '你即將為你的所有儲存庫停用 Dependabot 警示。這也會停用這些儲存庫的 Dependabot 安全性更新。',
    "You're about to enable Dependabot security updates on all your repositories. Dependabot security updates require the dependency graph and Dependabot alerts, so we'll also turn that on for all repositories.":
      '你即將為你的所有儲存庫啟用 Dependabot 安全性更新。Dependabot 安全性更新需要相依性圖表和 Dependabot 警示，因此我們也會為所有儲存庫開啟這些功能。',
    'You’re about to enable Dependabot security updates on all your repositories. Dependabot security updates require the dependency graph and Dependabot alerts, so we’ll also turn that on for all repositories.':
      '你即將為你的所有儲存庫啟用 Dependabot 安全性更新。Dependabot 安全性更新需要相依性圖表和 Dependabot 警示，因此我們也會為所有儲存庫開啟這些功能。',
    "You're about to disable Dependabot security updates on all your repositories.": '你即將為你的所有儲存庫停用 Dependabot 安全性更新。',
    'You’re about to disable Dependabot security updates on all your repositories.': '你即將為你的所有儲存庫停用 Dependabot 安全性更新。',
    "You're about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts and Dependabot security updates, so we'll also turn that on for all repositories.":
      '你即將為你的所有儲存庫啟用分組安全性更新。分組安全性更新需要相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會為所有儲存庫開啟這些功能。',
    'You’re about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts and Dependabot security updates, so we’ll also turn that on for all repositories.':
      '你即將為你的所有儲存庫啟用分組安全性更新。分組安全性更新需要相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會為所有儲存庫開啟這些功能。',
    // 原文把 Dependabot security updates 重复写了两次，译文只写一次
    "You're about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we'll also turn that on for all repositories.":
      '你即將為你的所有儲存庫啟用分組安全性更新。分組安全性更新需要相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會為所有儲存庫開啟這些功能。',
    'You’re about to enable grouped security updates on all your repositories. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we’ll also turn that on for all repositories.':
      '你即將為你的所有儲存庫啟用分組安全性更新。分組安全性更新需要相依性圖表、Dependabot 警示和 Dependabot 安全性更新，因此我們也會為所有儲存庫開啟這些功能。',
    "You're about to disable grouped security updates on all your repositories.": '你即將為你的所有儲存庫停用分組安全性更新。',
    'You’re about to disable grouped security updates on all your repositories.': '你即將為你的所有儲存庫停用分組安全性更新。',
    // 原文 so 前无逗号：改用「所需的」定语，不加逗号；Actions 前补「GitHub」以免与一般的「動作」混淆
    "You're about to enable dependabot on actions on all your repositories. Dependabot on actions requires Actions so we'll also turn that on for all repositories.":
      '你即將為你的所有儲存庫啟用動作執行器上的 Dependabot。此功能所需的 GitHub 動作也會為所有儲存庫開啟。',
    'You’re about to enable dependabot on actions on all your repositories. Dependabot on actions requires Actions so we’ll also turn that on for all repositories.':
      '你即將為你的所有儲存庫啟用動作執行器上的 Dependabot。此功能所需的 GitHub 動作也會為所有儲存庫開啟。',
    "You're about to disable dependabot on actions on all your repositories.": '你即將為你的所有儲存庫停用動作執行器上的 Dependabot。',
    'You’re about to disable dependabot on actions on all your repositories.': '你即將為你的所有儲存庫停用動作執行器上的 Dependabot。',
    "You're about to enable dependabot self-hosted on all your repositories. Dependabot self-hosted depends on Dependabot on Actions so we'll also turn that on for all repositories.":
      '你即將為你的所有儲存庫啟用自架執行器上的 Dependabot。此功能所需的動作執行器上的 Dependabot 也會為所有儲存庫開啟。',
    'You’re about to enable dependabot self-hosted on all your repositories. Dependabot self-hosted depends on Dependabot on Actions so we’ll also turn that on for all repositories.':
      '你即將為你的所有儲存庫啟用自架執行器上的 Dependabot。此功能所需的動作執行器上的 Dependabot 也會為所有儲存庫開啟。',
    "You're about to disable dependabot self-hosted on all your repositories.": '你即將為你的所有儲存庫停用自架執行器上的 Dependabot。',
    'You’re about to disable dependabot self-hosted on all your repositories.': '你即將為你的所有儲存庫停用自架執行器上的 Dependabot。',
    'Enable dependency graph': '啟用相依性圖表',
    'Disable dependency graph': '停用相依性圖表',
    'Disable Dependabot alerts': '停用 Dependabot 警示',
    'Enable Dependabot security updates': '啟用 Dependabot 安全性更新',
    'Disable Dependabot security updates': '停用 Dependabot 安全性更新',
    'Enable grouped security updates': '啟用分組安全性更新',
    'Disable grouped security updates': '停用分組安全性更新',
    'Enable dependabot on actions': '啟用動作執行器上的 Dependabot',
    'Disable dependabot on actions': '停用動作執行器上的 Dependabot',
    'Enable dependabot self-hosted': '啟用自架執行器上的 Dependabot',
    'Disable dependabot self-hosted': '停用自架執行器上的 Dependabot'
  },
  scoped: {
    'Security & analysis': '安全性和分析',
    'Disable all': '全部停用',
    'Enable all': '全部啟用',
    'Security and analysis features help keep your repositories secure and updated.': '安全性和分析功能可協助你的儲存庫保持安全和最新。',
    // 「Block commits that contain <a>supported secrets</a> across all public repositories on GitHub.」
    // 范围状语并入句首片段，句尾片段只剩「的提交。」；supported secrets 与存储库、组织安全设置同译
    'Block commits that contain': '在 GitHub 上的所有公開儲存庫中阻擋含有',
    'supported secrets': '支援的機密',
    'across all public repositories on GitHub.': '的提交。',

    // 专用漏洞报告（功能说明与 Enable private vulnerability reporting 由 repo-settings 收录）
    'Automatically enable for new public repositories': '為新的公開儲存庫自動啟用',
    'Disable private vulnerability reporting': '停用私下回報漏洞',
    'Enable by default for new public repositories': '為新的公開儲存庫預設啟用',

    // 依赖项关系图
    'Automatically enable for new private repositories': '為新的私人儲存庫自動啟用',
    'Enable by default for new private repositories': '為新的私人儲存庫預設啟用',

    // Dependabot（Dependabot alerts 见 permissions.ts）
    'Automatically enable for new repositories': '為新儲存庫自動啟用',
    'Enable by default for new repositories': '為新儲存庫預設啟用',
    'Dependabot security updates': 'Dependabot 安全性更新',
    'Grouped security updates': '分組安全性更新',
    'Learn how to group updates.': '瞭解如何將更新分組。',
    'Dependabot on Actions runners': '動作執行器上的 Dependabot',
    'Dependabot on self-hosted runners': '自架執行器上的 Dependabot',

    // 「全部啟用 / 全部停用」按钮的无障碍标签（与组织设置一致）
    'Enable all private vulnerability reporting': '全部啟用私下回報漏洞',
    'Disable all private vulnerability reporting': '全部停用私下回報漏洞',
    'Enable all dependency graph': '全部啟用相依性圖表',
    'Disable all dependency graph': '全部停用相依性圖表',
    'Enable all Dependabot alerts': '全部啟用 Dependabot 警示',
    'Disable all Dependabot alerts': '全部停用 Dependabot 警示',
    'Enable all Dependabot security updates': '全部啟用 Dependabot 安全性更新',
    'Disable all Dependabot security updates': '全部停用 Dependabot 安全性更新',
    'Enable all grouped security updates': '全部啟用分組安全性更新',
    'Disable all grouped security updates': '全部停用分組安全性更新',
    'Enable all dependabot on actions': '全部啟用動作執行器上的 Dependabot',
    'Disable all dependabot on actions': '全部停用動作執行器上的 Dependabot',
    'Enable all dependabot self-hosted': '全部啟用自架執行器上的 Dependabot',
    'Disable all dependabot self-hosted': '全部停用自架執行器上的 Dependabot',

    // 机密扫描与推送保护
    'Secret scanning': '機密掃描',
    'Enable secret scanning for eligible repositories?': '為符合資格的儲存庫啟用機密掃描？',
    'This will turn on secret scanning for all public repositories.': '這會為所有公開儲存庫開啟機密掃描。',
    'Enable for eligible repositories': '為符合資格的儲存庫啟用',
    'Disable secret scanning?': '停用機密掃描？',
    'This will disable secret scanning on all repositories where it is enabled.': '這會在所有已啟用機密掃描的儲存庫上停用此功能。',
    'Disable secret scanning': '停用機密掃描',
    'Push protection': '推送保護',
    'Automatically enable for repositories added to secret scanning': '為加入機密掃描的儲存庫自動啟用',
    'Enable push protection for eligible repositories?': '為符合資格的儲存庫啟用推送保護？',
    'This will turn on push protection for all repositories that have secret scanning enabled.':
      '這會為所有已啟用機密掃描的儲存庫開啟推送保護。',
    'Disable push protection?': '停用推送保護？',
    'This will disable push protection on all repositories where it is enabled.': '這會在所有已啟用推送保護的儲存庫上停用此功能。',
    'You can still enable push protection at the repository level.': '你仍可在儲存庫層級啟用推送保護。',
    'Enable push protection': '啟用推送保護',
    'Disable push protection': '停用推送保護'
  },
  regexp: [
    [
      /^You['’]re about to (enable|disable) private vulnerability reporting on all public repositories in (\S+)\.$/,
      (_, action: string, owner: string) => `你即將為 ${owner} 的所有公開儲存庫${TOGGLE[action] ?? action}私下回報漏洞。`
    ],
    [/^Security settings updated for (\S+?)['’]s repositories\.$/, '已更新 $1 的儲存庫安全性設定。']
  ]
} satisfies PageDictionary
