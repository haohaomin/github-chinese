import type { PageDictionary } from '../../../core/types'

/** AI 扫描类型（提示文案里的 {scanName}） */
const SCAN_NAME: Readonly<Record<string, string>> = {
  'standard scan': '标准扫描',
  'deep scan': '深度扫描'
}

/**
 * 代码扫描：列表（筛选、空状态、提示、工具按钮、AI 扫描）、工具状态页、
 * 警报详情（React 局部组件）、受影响分支、开发区、自动修复。
 */
export default {
  static: {
    // 列表与工具状态
    'Automatically detect vulnerabilities in your code.': '自动检测代码中的漏洞。',
    // Configure tools … Learn more about <Code Scanning>
    'Configure tools that integrate with Code Scanning to keep the quality of your code under control. Learn more about':
      '配置与代码扫描集成的工具以控制代码质量。了解',
    'Add tool': '添加工具',
    'Configure scanning tool': '配置扫描工具',
    'Tool status': '工具状态',
    Tools: '工具',
    'All tools are working as expected': '所有工具运行正常',
    'Sorry, something went wrong loading this data': '加载此数据时出错',
    'All tools working correctly': '所有工具运行正常',
    'Loading tools': '正在加载工具',
    'Manage tools': '管理工具',
    'Tools, failed to load tool status': '工具，加载工具状态失败',
    'Tools, one or more tools failed': '工具，一个或多个工具失败',
    'Tools, one or more tools have warnings': '工具，一个或多个工具有警告',
    'Run completed with warnings': '运行完成但有警告',
    'Last run failed': '上次运行失败',
    'Last run succeeded': '上次运行成功',
    'Last run cancelled': '上次运行已取消',
    'Run in progress': '正在运行',
    'No code scanning alerts here!': '这里没有代码扫描警报！',
    'Looking good!': '一切正常！',
    'No new code scanning alerts.': '没有新的代码扫描警报。',
    'Keep up the good work!': '继续保持！',
    'No code scanning alerts found.': '未找到代码扫描警报。',
    "We'll keep watching out for new ones.": '我们会继续关注新的警报。',
    'We’ll keep watching out for new ones.': '我们会继续关注新的警报。',
    'Detected by': '检测工具',
    'CodeQL is reporting errors.': 'CodeQL 报告了错误。',
    Rule: '规则',
    'Rule ID': '规则 ID',
    Precision: '精确度',
    'Security severity': '安全严重性',
    Recommendation: '建议',
    Example: '示例',
    'Show paths': '显示路径',
    'Generate fix': '生成修复',
    'Generating fix': '正在生成修复',
    'Commit to new branch': '提交到新分支',
    Warning: '警告',

    // 搜索框自动补全的限定词说明
    'filter by open/closed state': '按未解决/已关闭状态筛选',
    'filter by tool': '按工具筛选',
    'filter by branch name': '按分支名称筛选',
    'filter by pr number': '按 PR 编号筛选',
    'filter by ref (e.g. branches/tags)': '按引用筛选（例如分支/标签）',
    'filter by rule': '按规则筛选',
    'filter by rule tag': '按规则标签筛选',
    'filter by severity': '按严重性筛选',
    'only show alerts in application code': '仅显示应用程序代码中的警报',
    'filter by closure reason': '按关闭原因筛选',
    'filter by file path (e.g. lib/crypto or *_test.js)': '按文件路径筛选（例如 lib/crypto 或 *_test.js）',
    'filter by language': '按语言筛选',
    'filter by assignee': '按受理人筛选',
    'filter by presence of a property': '按属性存在筛选',
    'filter by absence of a property': '按属性缺失筛选',
    'Filter by tool': '按工具筛选',
    'Filter by branch': '按分支筛选',
    'Filter by rule': '按规则筛选',
    'Filter rules': '筛选规则',

    // 列表底部提示
    'You can run CodeQL locally from the command line.': '可以从命令行在本地运行 CodeQL。',
    'You can run CodeQL locally using Visual Studio Code.': '可以使用 Visual Studio Code 在本地运行 CodeQL。',
    // CodeQL queries are developed by an open-source coalition called the <GitHub Security Lab>.
    'CodeQL queries are developed by an open-source coalition called the': 'CodeQL 查询由以下开源联盟开发',
    // 团队名由英文普通词构成，按产品名规则译出
    'GitHub Security Lab': 'GitHub 安全实验室',
    'The libraries and queries that power CodeQL are open-source.': '支持 CodeQL 的库和查询是开源的。',
    'You can upload code scanning analyses from other third-party tools using GitHub Actions.':
      '可以使用 GitHub 操作上传其他第三方工具的代码扫描分析。',
    'You can configure CodeQL to run with additional queries.': '可以配置 CodeQL 运行其他查询。',

    // 工具状态页
    'Scanned files': '已扫描的文件',
    'Download language CSV report': '下载语言 CSV 报告',
    'Setup types': '设置类型',
    'Setup type': '设置类型',
    '· Last scan': '· 上次扫描',
    'View setup type': '查看设置类型',
    'This setup is working as expected.': '此设置运行正常。',
    'This configuration is working as expected.': '此配置运行正常。',
    'First scan': '首次扫描',
    'Push to': '推送到',
    'Pull request to': '拉取请求到',
    'Download list of rules used': '下载所用规则列表',
    'Tool version': '工具版本',

    // AI 扫描
    'AI scan': 'AI 扫描',
    'Deep AI Scan': '深度 AI 扫描',
    'AI scan options': 'AI 扫描选项',
    'AI scan type': 'AI 扫描类型',
    'Manage AI scan settings': '管理 AI 扫描设置',
    'AI scan, one or more scans failed': 'AI 扫描，一项或多项扫描失败',
    'AI scan, one or more scans cancelled': 'AI 扫描，一项或多项扫描已取消',
    'AI scan in progress': 'AI 扫描正在进行',
    'Deep scan': '深度扫描',
    'Cancelling Deep scan': '正在取消深度扫描',
    'Cancelling deep scan': '正在取消深度扫描',
    'Deep scan in progress · Click to stop': '深度扫描正在进行 · 单击停止',
    'Stopping deep scan': '正在停止深度扫描',
    'Deep scan in progress': '深度扫描正在进行',
    'Deep scan is running': '深度扫描正在运行',
    'Start deep scan': '开始深度扫描',
    'Starting deep scan': '正在启动深度扫描',
    'Cancel deep scan': '取消深度扫描',
    'How deep scans work': '深度扫描的工作原理',
    'about deep scans': '关于深度扫描',
    'Deep scans can consume significant time, compute resources, and AI credits. Results appear only after completing a deep scan.':
      '深度扫描可能消耗大量时间、计算资源和 AI 额度，结果仅在扫描完成后显示。',
    'Canceling will lose any progress made so far.': '取消将丢失目前的全部进度。',
    'Continue scan': '继续扫描',
    'Cancel scan': '取消扫描',
    // Advanced AI security scan on <分支>. Powered by MDASH. Scans may take over an hour …
    'Advanced AI security scan on': '对以下分支进行高级 AI 安全扫描',
    '. Scans can consume a large number of AI credits. Powered by MDASH.': '。扫描可能消耗大量 AI 额度。由 MDASH 提供支持。',
    '. Scans may take over an hour and consume a large number of AI credits. Powered by MDASH.':
      '。扫描可能耗时超过一小时并消耗大量 AI 额度。由 MDASH 提供支持。',
    '. Powered by MDASH. Scans may take over an hour and consume a large number of AI credits.':
      '。由 MDASH 提供支持。扫描可能耗时超过一小时并消耗大量 AI 额度。',
    // Full-repo AI-powered security scan on <分支>. Available for any programming language.
    'Full-repo AI-powered security scan on': '对以下分支进行基于 AI 的全存储库安全扫描',
    'Standard scan': '标准扫描',
    'Standard scan in progress': '标准扫描正在进行',
    'Start standard scan': '开始标准扫描',
    'Standard scan completed': '标准扫描已完成',
    'Standard scan failed': '标准扫描失败',
    'Standard scan cancelled': '标准扫描已取消',
    '. Available for any programming language.': '。适用于任何编程语言。',
    'Enable Actions for this repository to run standard scans.': '为此存储库启用操作以运行标准扫描。',
    'Enable Actions for this repository to run deep scans.': '为此存储库启用操作以运行深度扫描。',
    // There are no AI credits … See <GitHub Advanced Security license billing> for more information …
    'There are no AI credits available to start an AI scan. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner. See':
      '没有可用于启动 AI 扫描的 AI 额度。可能是预算已超出或存储库所有者尚未设置按流量计费。请参阅',
    'for more information about how AI-powered scans are billed.': '了解 AI 扫描的计费方式。',
    'Before you can start an AI scan, you need to pick a "Usage billed to" option in your':
      '启动 AI 扫描前，需要在以下设置中选择“使用量计费对象”',
    'Scan progress': '扫描进度',
    'Scan in progress': '扫描正在进行',
    'Scan is running': '扫描正在运行',
    'Starting scan': '正在启动扫描',
    'Start scan': '开始扫描',
    Scanning: '扫描中',
    'Failed to stop scan': '停止扫描失败',
    'You don’t have permission to run this scan': '你无权运行此扫描',
    "You don't have permission to run this scan": '你无权运行此扫描',
    'Analyzing code': '正在分析代码',
    'Scanning functions': '正在扫描函数',
    'Validating findings': '正在验证发现',
    'Preparing results': '正在准备结果',
    'Preparing scan': '正在准备扫描',
    'Preparing source code': '正在准备源代码',
    'Scanning code': '正在扫描代码',
    'Processing results': '正在处理结果',
    'Pending cancellation': '等待取消',
    Interrupted: '已中断',
    'Not started': '未开始',
    'Scan failed to start': '扫描启动失败',
    'Last scan completed': '上次扫描已完成',
    'Last scan failed to complete': '上次扫描未能完成',
    'Last scan was cancelled': '上次扫描已取消',
    'See job': '查看作业',
    'View job': '查看作业',
    'View results': '查看结果',
    'Started:': '开始时间：',
    'Last run:': '上次运行：',
    ', completed:': '，完成时间：',
    ', cancelled:': '，取消时间：',
    'Actions disabled': '操作已禁用',
    'Budget exceeded': '超出预算',
    'Customer selection required': '需要选择计费对象',
    'Scan failed to start, budget exceeded': '扫描启动失败，超出预算',
    'Scan failed to start, enable Actions': '扫描启动失败，请启用操作',
    'Scan failed to start, customer selection required': '扫描启动失败，需要选择计费对象',

    // 警报详情头部与侧栏
    '← Code scanning alerts': '← 代码扫描警报',
    'In pull request': '位于拉取请求',
    'On branch': '位于分支',
    'First detected in commit': '首次检测于提交',
    'Appeared in branch': '出现于分支',
    'Affected branches': '受影响的分支',
    'branches (not shown)': '个分支（未显示）',
    'First detected': '首次检测于',
    'No configurations analyzing': '没有正在分析的配置',
    // … If this was done by mistake, learn how to fix it by <rerunning a code scan analysis …>.
    'All configurations for the default branch have been deleted. If this was done by mistake, learn how to fix it by':
      '默认分支的所有配置均已删除。如果是误操作，可通过',
    'rerunning a code scan analysis to restore all alerts': '重新运行代码扫描分析以恢复所有警报',
    'Failed to load branches': '加载分支失败',
    'Only in Pull Request': '仅在拉取请求中',
    'Configurations analyzing': '正在分析的配置',
    'Deleting a configuration': '删除配置',
    'may have an impact on the status of other alerts on the same branch.': '可能会影响同一分支上其他警报的状态。',
    'All configurations deleted': '已删除所有配置',
    'Deleting all configurations will close this alert as fixed.': '删除所有配置会将此警报作为已修复关闭。',
    'The following configurations have reported this alert.': '以下配置报告了此警报。',
    'API upload': 'API 上传',
    'Delete configuration': '删除配置',

    // 自动修复
    // Speed up the remediation of this alert with <agentic autofix | Copilot Autofix for CodeQL>
    'Speed up the remediation of this alert with': '使用以下功能加快此警报的修复',
    'Speed up the remediation of this alert with agentic autofix': '使用智能体自动修复加快此警报的修复',
    'Copilot Autofix for CodeQL': 'CodeQL 的 Copilot 自动修复',
    'Agentic fixes use AI credits.': '智能体修复会消耗 AI 额度。',
    'Learn more about AI credit usage': '了解 AI 额度使用情况',
    'Agentic autofix': '智能体自动修复',
    // <Copilot> is creating a pull request…
    'is creating a pull request…': '正在创建拉取请求…',
    'is creating a pull request...': '正在创建拉取请求...',
    'created a pull request': '创建了拉取请求',
    'Failed to create pull request.': '创建拉取请求失败。',
    'Successfully assigned to Copilot to generate fixes for the selected alerts. Copilot will open a pull request.':
      '已分配给 Copilot 为所选警报生成修复。Copilot 将创建拉取请求。',
    'Copilot is already assigned': '已分配 Copilot',
    'You have reached your monthly limit for AI credits. Enable additional credits to get more usage.':
      '已达到本月 AI 额度上限。启用额外额度后可继续使用。',
    'GitHub Advanced Security license billing': 'GitHub 高级安全许可证计费',
    'AI usage, like scanning and fixing, is blocked by your organization.': '你的组织已禁止扫描、修复等 AI 用途。',
    'There are no AI credits available to start an agentic autofix. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner. See':
      '没有可用于启动智能体自动修复的 AI 额度。可能是预算已超出或存储库所有者尚未设置按流量计费。请参阅',
    'for more information about how agentic autofix is billed.': '了解智能体自动修复的计费方式。',
    'Before you can use agentic autofix, you need to pick a "Usage billed to" option in your Copilot settings.':
      '使用智能体自动修复前，需要在 Copilot 设置中选择“使用量计费对象”。',
    'Agentic autofix encountered an error and was unable to start working on the alert. This may be caused by a repository ruleset violation. See':
      '智能体自动修复出错且无法开始处理此警报。可能是违反了存储库规则集。请参阅',
    'granting bypass permissions for the agent': '为智能体授予绕过权限',
    'Manage rulesets': '管理规则集',
    'Agentic autofix encountered an error and was unable to start working on the alert. You have exceeded the maximum number of queued jobs. Please try again later.':
      '智能体自动修复出错且无法开始处理此警报。排队作业已超过上限。请稍后重试。',
    'Agentic autofix could not be started because you do not have access to Copilot.': '因你无权使用 Copilot 而无法启动智能体自动修复。',
    'Agentic autofix could not be started because Copilot cloud agent is not enabled for you or this repository. See':
      '因你或此存储库未启用 Copilot 云端智能体而无法启动智能体自动修复。请参阅',
    'Copilot cloud agent access management': 'Copilot 云端智能体访问管理',

    // 分支：在 GitHub Desktop 中打开 / 本地检出
    'Opening branch in GitHub Desktop...': '正在 GitHub 桌面版中打开分支...',
    // If nothing happens, make sure <GitHub Desktop> is installed and set up properly, then <try again>.
    // 整句见 inline，这里是整句未命中时的片段
    'If nothing happens, make sure': '如果没有反应，请确认',
    'is installed and set up properly, then': '已正确安装并设置，然后',
    'Run the following commands in your local clone.': '在本地克隆中运行以下命令。',
    'Checkout in your local repository': '在本地存储库中检出',
    'Closed and fixed alerts will not be included in this branch': '已关闭和已修复的警报不会包含在此分支中',
    'This commit will be co-authored by Copilot Autofix': '此提交将由 Copilot 自动修复共同署名',
    'Checkout locally': '本地检出',
    'Open branch with GitHub Desktop': '用 GitHub 桌面版打开分支',
    'Commit Copilot Autofix to a new branch': '将 Copilot 自动修复提交到新分支',
    'create a new branch': '创建新分支',

    // 开发区：Link a branch, pull request, or <create a new branch> to start working on this alert.
    'Link a branch, pull request, or': '链接分支、拉取请求，或',
    'to start working on this alert.': '以开始处理此警报。',
    'to start working this alert.': '以开始处理此警报。',
    'or link a branch or pull request to address this alert.': '或链接分支或拉取请求来处理此警报。',
    'No linked branches or pull requests.': '没有关联的分支或拉取请求。',
    'Link a branch or pull request': '链接分支或拉取请求',
    'Group selected': '已选择分组',
    'Pull request and branch search results': '拉取请求与分支搜索结果',
    'Unable to complete the search for pull requests and branches. Try a moment later.': '无法完成拉取请求与分支搜索。请稍后重试。',
    'Invalid item type': '无效的项类型'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Code Scanning': '代码扫描',
    Note: '注意',
    Test: '测试',
    default: '默认',
    'at least': '至少',
    'View less': '收起',
    'Create a new branch': '创建新分支',
    'Something went wrong, please try again.': '出错了，请重试。',
    'Check the': '查看',
    'sort by': '排序依据',
    Tool: '工具',
    'View source': '查看源代码',
    // 数据流路径：Source → Sink
    Source: '源',
    Sink: '汇点',
    'Default setup': '默认设置',
    Configuration: '配置',
    Configurations: '配置',
    'last scan': '上次扫描',
    // #12 opened <时间> merges into <分支>；整句见 inline，这里是整句未命中时的片段
    'merges into': '合并到',
    See: '请参阅',
    Complete: '已完成',
    Failed: '失败',
    'In progress': '正在进行',
    Cancelling: '取消中',
    'Manage settings': '管理设置',
    'Branch name': '分支名称',
    'Commit message': '提交消息',
    'Extended description': '扩展描述',
    "What's next?": '下一步做什么？',
    'What’s next?': '下一步做什么？',
    'Sorry, something went wrong': '抱歉，出错了',
    'try again': '重试',
    Issue: '议题',
    // 「在 GitHub Desktop 中打开」对话框里的链接文字；产品名按用户规定译出
    'GitHub Desktop': 'GitHub 桌面版'
  },
  regexp: [
    // 受影响分支的修复位置：Fixed <时间> via pull request #12
    [/^via pull request #(\d+)$/, '通过拉取请求 #$1'],
    [/^via commit ([0-9a-f]{7,40})$/, '通过提交 $1'],
    [/^Merging pull request #(\d+) may fix the alert in this branch\.$/, '合并拉取请求 #$1 可能会修复此分支中的警报。'],
    // 未显示的分支数：+ at least 12 branches (not shown) / + more branches (not shown)
    [
      /^\+ (at least )?([\d,]+|more) branches \(not shown\)$/,
      (_, atLeast: string | undefined, count: string) =>
        count === 'more' ? '+ 更多分支（未显示）' : `+ ${atLeast ? '至少 ' : ''}${count} 个分支（未显示）`
    ],
    // 开发区的拉取请求条目
    [/^#(\d+) was closed$/, '#$1 已关闭'],
    [/^#(\d+) was merged into$/, '#$1 已合并到'],
    // 自动修复
    [/^Commit autofix(?:es)? to (new )?branch$/, (_, isNew: string | undefined) => `将自动修复提交到${isNew ? '新' : ''}分支`],
    [/^Copilot failed to create a pull request\. (.+)\.$/, 'Copilot 创建拉取请求失败。$1。'],
    // 智能体自动修复横幅：Failed to create pull request: <错误信息>.
    [/^Failed to create pull request: (.+)\.$/, '创建拉取请求失败：$1。'],
    // AI 扫描不可用的说明（{scanName} = standard scan / deep scan）
    [
      /^There are no AI credits available to start an? (standard scan|deep scan)\. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner\.$/,
      (_, scan: string) => `没有可用于启动${SCAN_NAME[scan]}的 AI 额度。可能是预算已超出或存储库所有者尚未设置按流量计费。`
    ],
    [
      /^Before you can start an? (standard scan|deep scan), you need to pick a "Usage billed to" option in your$/,
      (_, scan: string) => `启动${SCAN_NAME[scan]}前，需要在以下设置中选择“使用量计费对象”`
    ],
    // AI 深度扫描进度
    [/^([\d,]+) of ([\d,]+) functions scanned$/, '已扫描 $1/$2 个函数'],
    [/^([\d,]+) of ([\d,]+) findings validated$/, '已验证 $1/$2 个发现'],
    [/^Scan started by ([\w-]+(?:\[bot\])?)$/, '由 $1 启动扫描'],
    // 工具状态页：12/30 files scanned
    [/^([\d,]+)\/([\d,]+) files? scanned$/, '已扫描 $1/$2 个文件'],
    // 代码路径：3 steps in src/index.js、Step 2
    [/^([\d,]+) steps? in (\S+)$/, '$2 中的 $1 个步骤'],
    [/^Step (\d+)$/, '步骤 $1']
  ],
  // 被元素拆开的整句（结构见 code-scanning-shared、code-scanning-development-section 组件源码）
  inline: [
    // 开发区的拉取请求条目：#12 opened <relative-time> merges into <span>main</span>；拉取请求的 open 作“创建”，时间后接中文不加空格
    [/^#(\d+) opened \{\} merges into \{\}$/, '#$1 创建于 {}合并到 {}'],
    // #12 was closed <relative-time>：时间后面没有文本节点，文字只能放在槽位前；没有时间时由 regexp 译成“#12 已关闭”
    [/^#(\d+) was closed \{\}$/, '#$1 关闭于 {}'],
    // 受影响分支的修复位置：Fixed <relative-time> via pull request #12 / via commit <sha>；单独的 Fixed 是状态徽章，不改
    [/^Fixed \{\} via pull request #(\d+)$/, '于 {}通过拉取请求 #$1 修复'],
    [/^Fixed \{\} via commit ([0-9a-f]{7,40})$/, '于 {}通过提交 $1 修复'],
    ['Fixed {}', '修复于 {}'],
    // 在 GitHub Desktop 中打开分支：… make sure <a>GitHub Desktop</a> is installed …, then <a>try again</a>.
    ['If nothing happens, make sure {} is installed and set up properly, then {}.', '如果没有反应，请确认 {}已正确安装并设置，然后{}。']
  ]
} satisfies PageDictionary
