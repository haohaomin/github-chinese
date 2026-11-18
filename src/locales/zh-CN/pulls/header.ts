import type { PageDictionary } from '../../../core/types'

const STATE_LABEL: Readonly<Record<string, string>> = {
  Open: '打开',
  Closed: '已关闭',
  Merged: '已合并',
  Draft: '草稿',
  Queued: '已排队'
}

/** 标签页名称（切换标签页按钮的当前项） */
const TAB_LABEL: Readonly<Record<string, string>> = {
  Conversation: '对话',
  Commits: '提交',
  Checks: '检查',
  'Files changed': '已更改的文件'
}

/** 取消堆叠对话框的说明，也跟在“此堆栈的自动合并将被禁用。”之后 */
const UNSTACK_NOTE: Readonly<Record<string, string>> = {
  'Pull requests queued for merge or already merged will remain in the stack. For pull requests that are removed, base branches will not be retargeted and commit histories will remain the same.':
    '已排队合并或已合并的拉取请求将保留在堆栈中。从堆栈中删除的拉取请求不会重新指定基础分支且提交历史记录保持不变。',
  'All pull requests will be removed from the stack. Their base branches will not be retargeted and their commit histories will remain the same.':
    '所有拉取请求都将从堆栈中删除。其基础分支不会重新指定且提交历史记录保持不变。'
}

/**
 * 拉取请求详情页头部：标题、状态、分支、标签页、代码按钮、堆栈导航、顶部横幅、状态切换操作。
 * 头部句子（X wants to merge N commits into A from B）按片段收录，React 渲染的整句用正则。
 */
export default {
  static: {
    // 标签页
    'Pull request navigation': '拉取请求导航',
    'Pull request navigation (compact)': '拉取请求导航（紧凑）',
    'Pull request tabs': '拉取请求标签页',
    'Pull request toolbar': '拉取请求工具栏',

    // 标题
    'Edit pull request title': '编辑拉取请求标题',
    'Edit pull request body': '编辑拉取请求正文',
    'Pull request actions': '拉取请求操作',
    'Updating the pull request title timed out. Please try again.': '更新拉取请求标题超时。请重试。',

    // 分支
    'Copy head branch name to clipboard': '复制头部分支名称到剪贴板',
    'Copy base branch name to clipboard': '复制基础分支名称到剪贴板',
    'Base branch:': '基础分支：',
    'Head branch:': '头部分支：',
    'Change base branch': '更改基础分支',
    'Cannot change base branch of stacked pull request': '无法更改堆叠式拉取请求的基础分支',
    'Are you sure you want to change the base?': '确定要更改基础分支吗？',
    'Change base': '更改基础分支',
    'Some commits from the old base branch may be removed from the timeline, and old review comments may become outdated.':
      '旧基础分支的部分提交可能会从时间线中删除，旧的审查评论可能会过时。',
    'Base branch update in progress.': '正在更新基础分支。',
    'Unable to refetch commits. Please refresh the page.': '无法重新获取提交。请刷新页面。',
    'Choose a base branch': '选择基础分支',
    'The head ref may contain hidden characters:': '头部引用可能包含隐藏字符：',
    'Hidden characters warning banner': '隐藏字符警告横幅',
    'Hidden character warning': '隐藏字符警告',

    // 代码按钮
    'Checkout with GitHub CLI': '使用 GitHub CLI 检出',
    'Checkout with GitHub Desktop': '使用 GitHub 桌面版检出',
    'Local checkout options': '本地检出选项',
    'Open in a new github.dev tab': '在新的 github.dev 标签页中打开',
    // 代码按钮的代码空间标签页：拉取请求已关闭
    'This pull request must be reopened to create new codespaces on it.': '必须重新打开此拉取请求，才能在其上创建新的代码空间。',

    // 状态切换
    'Convert to draft': '转换为草稿',
    'Mark ready for review': '标记为可供审查',
    'Pull request converted to draft': '拉取请求已转换为草稿',
    'Pull request marked as ready for review': '拉取请求已标记为可供审查',
    // 经典页“可供审查”操作后的闪现提示
    'Marked pull request as ready for review.': '已将拉取请求标记为可供审查。',
    'Failed to convert to draft': '转换为草稿失败',
    'An error occurred while converting this pull request to a draft. Please try again.': '将此拉取请求转换为草稿时出错。请重试。',
    'Failed to mark ready for review': '标记为可供审查失败',
    'An error occurred while marking this pull request as ready for review. Please try again.':
      '将此拉取请求标记为可供审查时出错。请重试。',
    'Marking ready for review': '正在标记为可供审查',
    'Close pull request': '关闭拉取请求',
    'Reopen pull request': '重新打开拉取请求',
    'Pull request closed': '拉取请求已关闭',
    'Pull request reopened': '拉取请求已重新打开',
    'Closing pull request': '正在关闭拉取请求',
    'Reopening pull request': '正在重新打开拉取请求',
    'Failed to close pull request': '关闭拉取请求失败',
    'Failed to reopen pull request': '重新打开拉取请求失败',
    'An error occurred while closing this pull request. Please try again.': '关闭此拉取请求时出错。请重试。',
    'An error occurred while reopening this pull request. Please try again.': '重新打开此拉取请求时出错。请重试。',
    'Merged pull requests cannot be reopened': '已合并的拉取请求无法重新打开',
    'This pull request cannot be reopened because the head branch has been deleted.': '此拉取请求因头部分支已删除而无法重新打开。',

    // 页面错误
    'Changes cannot be loaded': '无法加载更改',

    // 堆叠式拉取请求
    'Can Stack Banner': '可堆叠横幅',
    'This pull request can be stacked with other pull requests.': '此拉取请求可以与其他拉取请求堆叠。',
    'This pull request can be stacked with other pull requests. Review and create the stack when you’re ready.':
      '此拉取请求可以与其他拉取请求堆叠。准备好后审查并创建堆栈。',
    'This pull request can be added to': '此拉取请求可添加到',
    'This pull request and other pull requests can be added to': '此拉取请求及其他拉取请求可添加到',
    '. Review and update the stack when you’re ready.': '。准备好后审查并更新堆栈。',
    'Learn more about stacks': '了解堆栈',
    'Preview stack': '预览堆栈',
    'Add to stack': '添加到堆栈',
    'Create stack': '创建堆栈',
    'Adding to stack': '正在添加到堆栈',
    'Creating stack': '正在创建堆栈',
    'Reset stack': '重置堆栈',
    'Reset to the original proposed stack': '重置为最初建议的堆栈',
    'Proposed stack of pull requests': '建议的拉取请求堆栈',
    'Loading proposed stack': '正在加载建议的堆栈',
    'Preview failed to generate': '预览生成失败',
    'Preview failed to generate. Try refreshing the page.': '预览生成失败。请刷新页面。',
    'Something unexpected happened. Please refresh the page.': '发生意外错误。请刷新页面。',
    'Failed to create stack.': '创建堆栈失败。',
    // 预览堆栈对话框中“从预览堆栈中删除 #N”按钮的禁用说明（remove 指移出堆栈，不是删除拉取请求）
    "You can't remove the currently viewed pull request": '无法从堆栈中删除当前查看的拉取请求',
    'You can’t remove the currently viewed pull request': '无法从堆栈中删除当前查看的拉取请求',
    'This pull request was added to': '此拉取请求已添加到',
    'was created successfully': '已成功创建',
    'Maximum stack size reached': '已达堆栈大小上限',
    'to navigate down/up the stack': '在堆栈中向下/向上导航',
    'Unmergeable due to a closed PR': '因有已关闭的拉取请求而无法合并',
    'Copy pull request links': '复制拉取请求链接',
    'Pull request links copied': '拉取请求链接已复制',
    'Failed to copy pull request links': '复制拉取请求链接失败',
    'Unstack pull requests': '取消堆叠拉取请求',
    'Are you sure you want to unstack these pull requests?': '确定要取消堆叠这些拉取请求吗？',
    'Unstacking pull requests in progress.': '正在取消堆叠拉取请求。',
    'Checking whether auto-merge is enabled for this stack.': '正在检查此堆栈是否启用了自动合并。',
    ...UNSTACK_NOTE,
    'This stack cannot be unstacked': '此堆栈无法取消堆叠',
    'Failed to load stack data.': '加载堆栈数据失败。',

    // 处理指示
    'Recent push is being processed and will appear soon': '正在处理最近的推送',
    'Processing updates': '正在处理更新',

    // 审查请求横幅
    'This pull request is waiting on your review.': '此拉取请求正在等待你的审查。',
    'requested your review on this pull request.': '请求你审查此拉取请求。',
    'Add your review': '添加你的审查',
    'Review request banner': '审查请求横幅',

    // Dependabot 横幅
    'Automated security update banner': '自动安全更新横幅',
    'Merging this pull request will resolve a': '合并此拉取请求将解决一个',
    'Merging this pull request will resolve': '合并此拉取请求将解决',
    'Merging this pull request will resolve a Dependabot alert': '合并此拉取请求将解决一个 Dependabot 警报',
    "We noticed you haven't used Dependabot in a while, so we've paused automated Dependabot updates for this repository.":
      '你已有一段时间未使用 Dependabot，此存储库的 Dependabot 自动更新已暂停。',
    'We noticed you haven’t used Dependabot in a while, so we’ve paused automated Dependabot updates for this repository.':
      '你已有一段时间未使用 Dependabot，此存储库的 Dependabot 自动更新已暂停。',
    'To resume updates, merge a Dependabot pull request or use': '要恢复更新，请合并一个 Dependabot 拉取请求或使用',
    'See open Dependabot pull requests': '查看打开的 Dependabot 拉取请求',
    'learn more about pausing of activity.': '了解活动暂停。',

    // 文件更改新体验横幅
    'Welcome to the upgraded Files Changed experience': '欢迎使用新版已更改的文件页面',
    'View in the classic experience': '在经典体验中查看',
    // 原文界面名无引号，译文不加
    'Some comments aren’t visible on the classic Files Changed page.': '部分评论在经典已更改的文件页面不可见。',
    "Some comments aren't visible on the classic Files Changed page.": '部分评论在经典已更改的文件页面不可见。',
    'This page has been optimized for large pull requests.': '此页面已针对大型拉取请求优化。',
    'Switch to single file mode': '切换到单文件模式',
    'Due to the size of this pull request, only one file can be shown at a time.': '此拉取请求过大，一次只能显示一个文件。',
    'To view all files in a single page,': '要在一个页面中查看所有文件，',
    'try a new experimental mode': '试用新的实验模式'
  },
  scoped: {
    // 标签页与导航
    Conversation: '对话',
    'Files changed': '已更改的文件',
    Walkthrough: '导览',
    Findings: '发现',
    Artifacts: '工件',

    // 标题与分支
    "Title can't be blank": '标题不能为空',
    'Title can’t be blank': '标题不能为空',
    from: '来自',
    'base:': '基础：',
    'compare:': '比较：',
    'Find a branch': '查找分支',
    'Find a branch...': '查找分支...',
    'Find a branch…': '查找分支…',
    Branches: '分支',
    Tags: '标签',
    'This repository has been deleted': '此存储库已删除',
    'unknown repository': '未知存储库',
    merged: '合并了',
    closed: '关闭了',
    'Switch to the classic experience': '切换到经典体验',

    // 代码按钮
    'Copy command to clipboard': '复制命令到剪贴板',
    'Work fast with our official CLI.': '使用官方 CLI 高效工作。',
    'Learn more about the GitHub CLI': '了解 GitHub CLI',
    'Open with GitHub Desktop': '使用 GitHub 桌面版打开',

    // 提交导航（Commits 标签页内查看单个提交）
    'No previous commit': '没有上一个提交',
    'No next commit': '没有下一个提交',
    Prev: '上一个',
    'Browse files': '浏览文件',

    // 状态切换
    'Ready for review': '可供审查',

    // 页面错误
    'The page is unavailable due to a system error.': '页面因系统错误而不可用。',
    'Try reloading the page, or if the problem persists, contact support.': '请重新加载页面，或在问题持续存在时联系支持。',
    'Refresh page': '刷新页面',
    'Try refreshing the page.': '请刷新页面。',

    // 堆栈
    Unstack: '取消堆叠',
    Use: '使用',
    'Links copied!': '链接已复制！',
    'Failed to copy': '复制失败',
    "You don't have permission": '你没有权限',
    'You don’t have permission': '你没有权限',

    // Dependabot 横幅片段（与 security 词典同译，作用域内兜底）
    'Your first automated security update': '你的第一个自动安全更新',
    'Dependabot security updates keep your projects secure and up-to-date.': 'Dependabot 安全更新让你的项目保持安全和最新。',
    'Automated security update': '自动安全更新',
    'You can opt out at any time in': '可随时在以下位置退出',
    'this repository’s settings': '此存储库的设置',
    "this repository's settings": '此存储库的设置',
    'Learn more about Dependabot security updates': '了解 Dependabot 安全更新',
    'Dependabot updates are paused': 'Dependabot 更新已暂停',
    'Dependabot Alert': 'Dependabot 警报',
    'Dependabot Alerts': 'Dependabot 警报',
    'Dependabot alert': 'Dependabot 警报',
    severity: '严重性',
    'severity alert': '严重性警报',
    'severity alert.': '严重性警报。',
    critical: '严重',
    high: '高',
    moderate: '中',
    low: '低',
    // 严重性标签的提示（与 security 词典的严重性筛选正则同译）
    "Filter alerts by 'critical' severity.": '筛选严重性为“严重”的警报。',
    "Filter alerts by 'high' severity.": '筛选严重性为“高”的警报。',
    "Filter alerts by 'moderate' severity.": '筛选严重性为“中”的警报。',
    "Filter alerts by 'low' severity.": '筛选严重性为“低”的警报。',
    // 旧版横幅：This automated pull request fixes a <security vulnerability> …
    'This automated pull request fixes a': '此自动拉取请求修复了一个',
    'security vulnerability': '安全漏洞',
    'Only users with access to Dependabot alerts can see this message.': '只有有权访问 Dependabot 警报的用户才能看到此消息。',
    'opt out': '选择退出',
    'Opted out of Dependabot security updates.': '已选择退出 Dependabot 安全更新。'
  },
  regexp: [
    // 头部摘要（React 整句；经典版数字在独立元素中，按片段收录于下方）
    [/^wants to merge (\d[\d,]*) commits? into$/, '想要将 $1 个提交合并到'],
    [/^merged (\d[\d,]*) commits? into$/, '已将 $1 个提交合并到'],
    [/^(\d[\d,]*) commits? merged into$/, '$1 个提交已合并到'],
    [/^wants to merge$/, '想要合并'],
    [/^commits? into$/, '个提交到'],
    [/^and (merged|closed)$/, (_, verb) => (verb === 'merged' ? '并合并于' : '并关闭于')],
    [/^; (merged|closed)$/, (_, verb) => (verb === 'merged' ? '；合并于' : '；关闭于')],
    // 行数统计（& 译“和”，与 commits、wiki 词典一致；原文无逗号）
    [/^Lines changed: ([\d,]+) additions? & ([\d,]+) deletions?$/, '更改行数：新增 $1 行和删除 $2 行'],
    [/^([\d,]+) changes?: ([\d,]+) additions? & ([\d,]+) deletions?$/, '$1 处更改：新增 $2 行和删除 $3 行'],
    // 状态标签
    [/^Pull request state: (Open|Closed|Merged|Draft|Queued)$/, (_, state) => `拉取请求状态：${STATE_LABEL[state] ?? state}`],
    [/^Switch tab \(current: (.+)\)$/, (_, tab) => `切换标签页（当前：${TAB_LABEL[tab] ?? tab}）`],
    // 标题校验
    [/^Title can't be longer than (\d+) characters \(currently (\d+) characters\)$/, '标题不能超过 $1 个字符（当前 $2 个字符）'],
    // 标签页标题片段：Pull Request #123
    [/^Pull Request #(\d+)$/, '拉取请求 #$1'],
    // 代码按钮：Create codespace on feature-branch（产品名按 product-names.md：codespace → 代码空间）
    [/^Create (?:a )?codespace on (\S+)$/, '在 $1 上创建代码空间'],
    // 堆栈（原文只有一个逗号，位置不另加标点）
    [/^Navigate pull request stack, position (\d+) of (\d+)$/, '浏览拉取请求堆栈，$2 个中的第 $1 个'],
    [/^Pull request stack, position (\d+) of (\d+)$/, '拉取请求堆栈，$2 个中的第 $1 个'],
    // 堆栈编号；堆栈创建横幅的堆栈引用不是链接时与前文是相邻的文本节点，整段命中（按片段会在“到”后留空格）
    [/^(This pull request was added to )?[Ss]tack #(\d+)$/, (_, added, n) => `${added ? '此拉取请求已添加到' : ''}堆栈 #${n}`],
    [/^[Ss]tack #$/, '堆栈 #'],
    [/^Already in stack #(\d+)$/, '已在堆栈 #$1 中'],
    [/^Remove #(\d+) from preview stack$/, '从预览堆栈中删除 #$1'],
    // 原文只有句号：改语序代替逗号
    [/^Proposed stack loaded with (\d+) pull requests?\.$/, '已加载包含 $1 个拉取请求的建议堆栈。'],
    [/^Pull requests in stack #(\d+)$/, '堆栈 #$1 中的拉取请求'],
    [/^Auto-merge will be disabled for this stack\. (.+)$/, (_, note) => `此堆栈的自动合并将被禁用。${UNSTACK_NOTE[note] ?? note}`],
    [/^Stack (Created|Updated) Banner$/, (_, verb) => (verb === 'Created' ? '堆栈已创建横幅' : '堆栈已更新横幅')],
    // Dependabot 横幅：… severity <Dependabot Alert> on lodash / <Dependabot Alerts> on lodash including a …
    // 整句由下方 inline 处理；不命中时按片段拼读（原文无标点，不加逗号）
    [/^on ([@\w./:-]+) including a$/, '涉及 $1 并包括一个'],
    [/^on (?!GitHub$)(?=[@\w./:-]*[A-Za-z])([@\w./:-]+)$/, '涉及 $1'],
    // Dependabot 横幅（非打开状态）
    [
      /^This pull request (would resolve|resolved) a Dependabot alert on ([@\w./:-]+)\.$/,
      (_, verb, pkg) => `此拉取请求${verb === 'resolved' ? '已解决' : '将解决'} ${pkg} 的一个 Dependabot 警报。`
    ],
    [
      /^This pull request (would resolve|resolved) a Dependabot alert$/,
      (_, verb) => `此拉取请求${verb === 'resolved' ? '已解决' : '将解决'}一个 Dependabot 警报`
    ]
  ],
  inline: [
    // Dependabot 安全更新横幅（React，<span> 内为 HTML 字符串）：包名提到警报链接之前；原文无标点，不加逗号。
    // 严重性写作“严重性为 X 的”（同 security 词典），避免 critical 译出“严重严重性”。
    // Merging this pull request will resolve a <strong>high</strong> severity <a>Dependabot Alert</a> on lodash
    [/^Merging this pull request will resolve a \{\} severity \{\} on ([@\w./:-]+)$/, '合并此拉取请求将解决 $1 的一个严重性为{}的 {}'],
    // Merging this pull request will resolve <a>Dependabot Alerts</a> on lodash including a <strong>high</strong> severity alert
    // 不加逗号时“警报其中包括”连读不通，改作“将解决的警报涉及 X 并包括…”；槽位两侧的空白按译文
    [
      /^Merging this pull request will resolve \{\} on ([@\w./:-]+) including a \{\} severity alert$/,
      '合并此拉取请求将解决的 {}涉及 $1 并包括一个严重性为{}的警报'
    ]
  ]
} satisfies PageDictionary
