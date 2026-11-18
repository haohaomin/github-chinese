import type { PageDictionary } from '../../../core/types'

const LIST_ACTION: Readonly<Record<string, string>> = {
  opened: '打开于',
  fixed: '修复于',
  dismissed: '消除于',
  'auto-dismissed': '自动消除于',
  closed: '关闭于',
  reopened: '重新打开于'
}

const REACHABILITY: Readonly<Record<string, string>> = {
  Reachable: '可达',
  'Potentially reachable': '可能可达',
  Unreachable: '不可达',
  Unavailable: '不可用'
}

/**
 * Dependabot 警报：列表（筛选、提示、禁用 / 刷新状态）、详情（React 局部组件）、
 * 消除原因、可达性分析、安全更新。
 * 筛选框自动补全里的取值提示（fix-started, no-bandwidth… / package-name 等）是要输入的筛选值，不翻译。
 */
export default {
  static: {
    // 列表
    'Search all Dependabot alerts': '搜索所有 Dependabot 警报',
    'Search Dependabot alerts': '搜索 Dependabot 警报',
    Manifest: '清单',
    'Manifest path': '清单路径',
    'Most important': '最重要',
    Runtime: '运行时',
    'Patch available': '有补丁',
    'Vulnerable function': '存在漏洞的函数',
    Reachable: '可达',
    'Potentially reachable': '可能可达',
    '• Detected in': '• 检测于',
    'Detected in': '检测于',
    'Alert settings': '警报设置',
    'Manage repository vulnerability settings': '管理存储库漏洞设置',
    'Manage account notification settings': '管理帐户通知设置',
    'Manage Dependabot rules': '管理 Dependabot 规则',
    'Dependabot rules': 'Dependabot 规则',
    'Auto-triage rules': '自动分类规则',
    'Refresh Dependabot alerts': '刷新 Dependabot 警报',
    "Reprocess your project's current dependency files.": '重新处理项目当前的依赖文件。',
    'Reprocess your project’s current dependency files.': '重新处理项目当前的依赖文件。',
    'Refresh queued, it may take several minutes to see changes reflected in your alerts.':
      '已加入刷新队列，警报可能需要几分钟才会反映更改。',
    'Refreshed recently, available again in about 1 hour.': '最近已刷新，约1小时后可再次刷新。',
    'Welcome to Dependabot alerts!': '欢迎使用 Dependabot 警报！',
    "Dependabot alerts track security vulnerabilities that apply to your repository's dependencies.":
      'Dependabot 警报跟踪影响存储库依赖项的安全漏洞。',
    'Dependabot alerts track security vulnerabilities that apply to your repository’s dependencies.':
      'Dependabot 警报跟踪影响存储库依赖项的安全漏洞。',
    "Dependabot alerts track security vulnerabilities that apply to your repository's dependencies. As alerts are created, they’ll appear here.":
      'Dependabot 警报跟踪影响存储库依赖项的安全漏洞。创建的警报会显示在这里。',
    "Dependabot alerts track security vulnerabilities that apply to your repository's dependencies. As alerts are created, they'll appear here.":
      'Dependabot 警报跟踪影响存储库依赖项的安全漏洞。创建的警报会显示在这里。',
    'Dependabot alerts track security vulnerabilities that apply to your repository’s dependencies. As alerts are created, they’ll appear here.':
      'Dependabot 警报跟踪影响存储库依赖项的安全漏洞。创建的警报会显示在这里。',

    // 未启用：To receive …, you must first enable Dependabot alerts in <this repository’s settings>.
    'Dependabot alerts are disabled.': 'Dependabot 警报已禁用。',
    'To receive Dependabot alerts, you must first enable Dependabot alerts in': '要接收 Dependabot 警报，须先启用 Dependabot 警报，前往',
    'this repository’s settings': '此存储库的设置',
    "this repository's settings": '此存储库的设置',

    // 自动消除、自动分类横幅
    'Ignore the false alarms': '忽略误报',
    'To help you focus on the alerts that matter, Dependabot now proactively dismisses low impact alerts. These alerts may only have limited effects (e.g. long-running builds or tests) or are unlikely to be exploitable.':
      '为帮助你专注于重要的警报，Dependabot 现在会主动消除低影响警报。这些警报的影响可能有限（例如长时间运行的构建或测试）或不太可能被利用。',
    'learn more about auto-dismissing alerts.': '了解自动消除警报。',
    'Auto-triage your alerts': '自动分类警报',
    'Control how Dependabot opens pull requests, ignores false positives and snoozes alerts. Rules can be enforced at the organization level. Free for open source and available for private repos through':
      '控制 Dependabot 如何创建拉取请求、忽略误报和暂停警报。规则可在组织级别强制实施。对开源项目免费且专用存储库可通过',
    'Learn more about auto-triage': '了解自动分类',

    // 搜索与筛选
    'CVE exploitation likelihood. `n`, `>n`, `<n`, `>=n`, `<=n`, or range `n..n`, where `n` is a number from 0.0 to 1.0':
      'CVE 被利用的可能性。`n`、`>n`、`<n`、`>=n`、`<=n` 或范围 `n..n`，其中 `n` 为 0.0 到 1.0 之间的数字',
    'Filter by resolution': '按处理结果筛选',
    'Clear resolution': '清除处理结果筛选器',
    'Filter by packages': '按软件包筛选',
    'Clear package filter': '清除软件包筛选器',
    'Clear ecosystem filter': '清除生态系统筛选器',
    'Filter by manifest': '按清单筛选',
    'Clear manifest filter': '清除清单筛选器',
    'Dismiss Alerts': '消除警报',
    'Select a reason to dismiss': '选择消除原因',
    'Clear current search filters.': '清除当前搜索筛选器。',
    // 提示：Add <code>-has:patch</code> to see alerts without an available fix.
    'to see alerts without an available fix.': '可查看没有可用修复的警报。',
    'to see alerts with calls to vulnerable functions.': '可查看调用了存在漏洞函数的警报。',
    'See auto-dismissed alerts with': '使用以下条件查看自动消除的警报',
    'Find alerts on your dev dependencies using': '使用以下条件查找开发依赖项的警报',

    // 消除原因
    'A fix has already been started': '已开始修复',
    'No bandwidth to fix this': '无暇修复',
    'Risk is tolerable to this project': '此项目可容忍该风险',
    'This alert is inaccurate or incorrect': '此警报不准确或有误',
    'Vulnerable code is not actually used': '实际未使用存在漏洞的代码',

    // 详情页头部：dismissed by <用户> <时间>
    'dismissed by': '消除者',
    'auto-dismissed by': '自动消除者',
    'to assign Dependabot alerts in this repository.': '以在此存储库中分配 Dependabot 警报。',

    // 修复建议与错误
    // The latest possible version that can be installed is <版本> because of the following conflicting dependency:
    'The latest possible version that can be installed is': '可安装的最新版本为',
    'because of the following conflicting dependency:': '，原因是存在以下冲突的依赖项：',
    'because of the following conflicting dependencies:': '，原因是存在以下冲突的依赖项：',
    'The earliest fixed version is': '最早的修复版本为',
    'about troubleshooting Dependabot errors': '关于排查 Dependabot 错误',
    // Transitive dependency <软件包> is introduced via <软件包>
    'is introduced via': '引入自',
    'or later. For example:': '或更高版本。例如：',
    'Update logs': '更新日志',

    // 安全更新
    'Create Dependabot security update': '创建 Dependabot 安全更新',
    'Review security update': '审查安全更新',
    'Dependabot is creating a security update to fix': 'Dependabot 正在创建安全更新以修复',
    'Merging this pull request would fix': '合并此拉取请求将修复',
    'Learn more about Dependabot security updates': '了解 Dependabot 安全更新',
    'Transitive dependency': '传递依赖',
    'Direct dependency': '直接依赖',
    'Related alerts': '相关警报',

    // 可达性分析：Prioritize this alert with signals like <severity>, <EPSS score>, or <…>.
    'Vulnerability metadata': '漏洞元数据',
    'Prioritize this alert with signals like': '可借助以下信号确定此警报的优先级',
    'whether the code is deployed to production': '代码是否已部署到生产环境',
    'Your code reaches the vulnerable function.': '你的代码会调用存在漏洞的函数。',
    "Analysis couldn't confirm whether your code reaches the vulnerable function.": '分析无法确认你的代码是否会调用存在漏洞的函数。',
    "We couldn't determine reachability because of an error on our side. We're continually improving reachability analysis, so you should see fewer of these errors over time.":
      '因我们这边出错而无法确定可达性。可达性分析在持续改进，此类错误会逐渐减少。',
    "We'll try again tomorrow as long as reachability analysis is enabled for this repository.":
      '我们会在此存储库启用可达性分析的前提下于明天重试。',
    'Reachability analysis needs a lockfile to know which version of this package is installed. Commit a lockfile to receive reachability results.':
      '可达性分析需要锁定文件来确定已安装的软件包版本。提交锁定文件即可获得可达性结果。',
    "Reachability can't be checked because GitHub hasn't identified which functions contain this vulnerability. When that information is added, this alert will be analyzed automatically.":
      '因 GitHub 尚未确定哪些函数包含此漏洞而无法检查可达性。补充该信息后，将自动分析此警报。',
    "We didn't find a call to the vulnerable function in this manifest's directory, but we found a call in another directory in your repository.":
      '此清单所在目录中未发现对存在漏洞函数的调用，但在存储库的其他目录中发现了调用。',
    "Right now, reachability analysis supports only JavaScript and TypeScript languages, so this alert wasn't analyzed.":
      '可达性分析目前仅支持 JavaScript 和 TypeScript，因此未分析此警报。',
    "Reachability analysis didn't complete, so call paths aren't available.": '可达性分析未完成，调用路径不可用。',
    'About reachability': '关于可达性',
    // … from the public npm registry and from <private registries configured for Dependabot>.
    'Reachability analysis supports dependencies from the public npm registry and from': '可达性分析支持的依赖项来自公共 npm 注册表以及',
    'private registries configured for Dependabot': '为 Dependabot 配置的专用注册表',
    // The <reachability analysis run> for this repository reached its time limit …
    'reachability analysis run': '可达性分析运行',
    'for this repository reached its time limit before it finished checking this alert. Each run reuses the work earlier runs completed, so a later run might finish checking it.':
      '在此存储库中完成此警报的检查前已达到时间上限。每次运行都会复用之前已完成的工作，后续运行可能会完成检查。',
    "The reachability analysis run for this repository reached its time limit before it finished checking this alert. Each run reuses the work earlier runs completed, so a later run might finish checking it. We'll try again tomorrow as long as reachability analysis is enabled for this repository.":
      '此存储库的可达性分析运行在完成此警报检查前已达到时间上限。每次运行都会复用之前已完成的工作，后续运行可能会完成检查。我们会在此存储库启用可达性分析的前提下于明天重试。',
    // A call that chooses its function at runtime, such as <code>obj[name]()</code>, could reach …
    'A call that chooses its function at runtime, such as': '在运行时才确定调用目标的调用，例如',
    ", could reach the vulnerable function. The call is in your code or in one of your dependencies. Analysis reads code without running it, so it can't tell which function the call chooses.":
      '，可能会调用存在漏洞的函数。该调用位于你的代码或某个依赖项中。分析只读取代码而不运行，因此无法判断该调用会选择哪个函数。',
    ', could reach the vulnerable function. The call is in your code or in one of your dependencies. Analysis reads code without running it, so it can’t tell which function the call chooses.':
      '，可能会调用存在漏洞的函数。该调用位于你的代码或某个依赖项中。分析只读取代码而不运行，因此无法判断该调用会选择哪个函数。',

    // 导出 CSV 报告
    'Export CSV': '导出 CSV',
    'Generating your report. Stay on this page to automatically download the report.': '正在生成报告。停留在此页面将自动下载报告。',
    "Your report is being generated. You will receive an email when it's ready. Stay on this page to automatically download the report.":
      '正在生成报告。完成后将通过电子邮件通知你。停留在此页面将自动下载报告。',
    'Your report is being generated. You will receive an email when it’s ready. Stay on this page to automatically download the report.':
      '正在生成报告。完成后将通过电子邮件通知你。停留在此页面将自动下载报告。',
    "We couldn't generate your report. Please try again later. If the problem persists, please contact support.":
      '无法生成报告。请稍后重试。如果问题仍然存在，请联系支持。',
    'We couldn’t generate your report. Please try again later. If the problem persists, please contact support.':
      '无法生成报告。请稍后重试。如果问题仍然存在，请联系支持。',
    'Your report is ready and the download has started.': '报告已就绪且已开始下载。',
    'Your report is ready and the download has started. An email with the report has also been sent to you.':
      '报告已就绪且已开始下载。报告也已通过电子邮件发送给你。',
    'Something went wrong while exporting your data. Please try again later. If the problem persists, please contact support.':
      '导出数据时出错。请稍后重试。如果问题仍然存在，请联系支持。'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Dependabot security updates': 'Dependabot 安全更新',
    'Dependabot version updates': 'Dependabot 版本更新',
    On: '位于',
    bot: '机器人',
    severity: '严重性',
    'Opt out': '退出',
    // … available for private repos through <GitHub Advanced Security.>
    'GitHub Advanced Security.': 'GitHub 高级安全使用。',
    'Closed as': '关闭原因',
    fixed: '已修复',
    Opened: '打开于',
    // dependabot opened this <时间>
    'opened this': '打开于',
    'View logs': '查看日志'
  },
  regexp: [
    // 列表条目：#38 opened 3 days ago • Detected in …
    [/^#(\d+) (opened|fixed|dismissed|auto-dismissed|closed|reopened)$/, (_, number, action) => `#${number} ${LIST_ACTION[action]}`],
    // 详情页修复建议
    [/^Upgrade (\S+) to fix (\d+) Dependabot alerts? in (\S+)$/, '升级 $1 以修复 $3 中的 $2 个 Dependabot 警报'],
    [/^Upgrade (\S+) to version (\S+) or later\. For example:$/, '将 $1 升级到 $2 或更高版本。例如：'],
    [/^Dependabot cannot update (\S+) to a non-vulnerable version$/, 'Dependabot 无法将 $1 更新到无漏洞的版本'],
    // 安全更新进度：Dependabot is creating a security update to fix <3 Dependabot alerts> on …
    [/^([\d,]+) Dependabot alerts?$/, '$1 个 Dependabot 警报'],
    // 侧栏可达性标记的 aria-label（原文无引号）
    [
      /^Filter alerts by (Reachable|Potentially reachable|Unreachable|Unavailable) reachability$/,
      (_, title) => `筛选可达性为${REACHABILITY[title]}的警报`
    ]
  ],
  // 被元素拆开的整句；整句未命中时由 static 的片段兜底
  inline: [
    // 可达性分析：Prioritize this alert with signals like <a>severity</a>, <a>EPSS score</a>, or <a>…</a>.
    ['Prioritize this alert with signals like {}, {}, or {}.', '可借助{}、{}或{}等信号确定此警报的优先级。']
  ]
} satisfies PageDictionary
