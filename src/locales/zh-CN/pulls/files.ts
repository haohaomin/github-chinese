import type { PageDictionary } from '../../../core/types'
import { joinCjk, RELATIVE_SOURCE, translateTime } from '../helpers'

/** 评论入口：Add comment / Suggest change */
const LINE_ACTION: Readonly<Record<string, string>> = {
  'Add comment': '添加评论',
  'Suggest change': '建议更改'
}

/** 行范围前缀：修改后 / 原始 */
const LINE_SIDE: Readonly<Record<string, string>> = { modified: '修改后的 ', original: '原始的 ' }

/** 注释级别 */
const ANNOTATION_LEVEL: Readonly<Record<string, string>> = {
  warning: '警告',
  notice: '提示',
  failure: '失败'
}

/** 面板名称（Close comments panel 等） */
const PANEL_NAME: Readonly<Record<string, string>> = {
  comments: '评论',
  alerts: '警报',
  Copilot: 'Copilot',
  'merge status': '合并状态',
  description: '描述',
  overview: '概述',
  activity: '活动',
  side: '侧边',
  'manage batch': '管理批次'
}

const PANEL_SOURCE = Object.keys(PANEL_NAME).join('|')

/** 面板名以英文开头时与动词之间加空格 */
function panelName(name: string): string {
  const translated = PANEL_NAME[name] ?? name
  return /^[A-Za-z]/.test(translated) ? ` ${translated} ` : translated
}

/** 页面上限：first 300 files / latest 100 comments / first 50 alerts */
const PAGE_LIMIT_ITEM = '(?:first|latest) \\d+ (?:files|comments|alerts)'
const PAGE_LIMIT_RE = /(first|latest) (\d+) (files|comments|alerts)/g
const PAGE_LIMIT_UNIT: Readonly<Record<string, string>> = { files: '个文件', comments: '条评论', alerts: '条警报' }

/**
 * first 300 files and latest 100 comments → 前 300 个文件和最新 100 条评论；
 * 原文只有 and、没有逗号时不加标点（与合并框的检查汇总同一写法），有逗号时用顿号
 */
function pageLimits(list: string): string {
  const parts = [...list.matchAll(PAGE_LIMIT_RE)].map(
    ([, which, count, unit]) => `${which === 'latest' ? '最新' : '前'} ${count} ${PAGE_LIMIT_UNIT[unit!] ?? unit}`
  )
  return list.includes(',') ? parts.join('、') : parts.join('和')
}

/** 文件树中的评论数与注释提示：有 3 条评论和警告注释（原文无标点，译文不加） */
function fileTreeHint(count: string | undefined, level: string | undefined): string {
  const parts = [count ? `${count} 条评论` : '', level ? `${ANNOTATION_LEVEL[level] ?? level}注释` : '']
  return joinCjk('有', parts.filter(Boolean).join('和'))
}

/**
 * “已更改的文件”标签页：新版（React）与经典版的工具栏、提交范围选择、文件筛选、文件树、
 * 文件头与文件菜单、差异设置、差异内容提示、行操作菜单、侧边面板（评论、警报）。
 */
export default {
  static: {
    // 工具栏
    'Clear Hide whitespace filter': '清除隐藏空白筛选器',
    'Diff comparison toolbar': '差异比较工具栏',
    'Previous file (K)': '上一个文件 (K)',
    'Next file (J)': '下一个文件 (J)',
    'Due to the large number of changes in this pull request, only one file is being shown at a time.':
      '此拉取请求的更改过多，一次只显示一个文件。',
    'buttons to move between files.': '按钮在文件之间切换。',
    // 单文件模式提示：Use the <strong>Previous</strong> and <strong>Next</strong> buttons …（mergeText 整段合并；
    // Previous / Next 指工具栏的文件导航按钮，不是分页的上一页 / 下一页）
    'Use the Previous and Next buttons to move between files.': '请使用上一个和下一个按钮在文件之间切换。',
    'Organize changes into groups with Copilot': '使用 Copilot 将更改整理为分组',
    'Show changes by group': '按分组显示更改',
    'Open comments panel': '打开评论面板',
    'Close comments panel': '关闭评论面板',
    'The comments panel cannot currently be opened.': '暂时无法打开评论面板。',
    'Open alerts panel': '打开警报面板',
    'Close alerts panel': '关闭警报面板',
    'The alerts panel cannot currently be opened.': '暂时无法打开警报面板。',
    'Open Copilot panel': '打开 Copilot 面板',
    'Close Copilot panel': '关闭 Copilot 面板',
    'The Copilot panel cannot currently be opened.': '暂时无法打开 Copilot 面板。',
    'Close merge status panel': '关闭合并状态面板',
    'Close manage batch panel': '关闭批次管理面板',
    'Close side panel': '关闭侧边面板',
    'Loading description': '正在加载描述',
    'Filter alerts': '筛选警报',
    'Expand annotation': '展开注释',
    'Collapse annotation': '折叠注释',
    'Jump to the alert in the diff': '跳转到差异中的警报',
    'No alerts match the current filter': '没有匹配当前筛选器的警报',
    'No alerts on changes yet': '更改中暂无警报',
    'No comments match the current filter': '没有匹配当前筛选器的评论',
    'No comments on changes yet': '更改中暂无评论',
    // 经典版工具栏：代码空间入口、“对话”下拉菜单、概述侧边面板
    'Review in codespace': '在代码空间中审查',
    'Jump to conversation': '跳转到对话',
    'All of your conversations have been resolved.': '你的所有对话均已解决。',
    'Review conversations will show up here.': '审查对话会显示在这里。',
    'Open overview side panel': '打开概述侧边面板',

    // 提交范围（新版与经典版）
    'No previous review found': '未找到之前的审查',
    'No commits available': '没有可用的提交',
    'No new commits since last review': '上次审查后没有新提交',
    'Changes since your last review': '自你上次审查以来的更改',
    'Show changes since your last review': '显示自你上次审查以来的更改',
    // 经典版：上一条不可用时的说明；单个提交视图中上一个 / 下一个提交按钮的禁用提示
    'You haven’t reviewed this pull request yet': '你尚未审查此拉取请求',
    'You are viewing the earliest commit': '你正在查看最早的提交',
    'You are viewing the latest commit': '你正在查看最新的提交',
    'Select a range of commits': '选择提交范围',
    'No commits selected': '未选择提交',
    'Select commits to view': '选择要查看的提交',
    'Show all changes': '显示所有更改',
    'Hold shift + click to select a range': '按住 Shift 并单击以选择范围',
    'Due to the large number of changes in the selected commit, only one file is being shown at a time.':
      '所选提交的更改过多，一次只显示一个文件。',
    'Due to the large number of changes in the selected commit range, only one file is being shown at a time.':
      '所选提交范围的更改过多，一次只显示一个文件。',

    // 文件筛选
    'Filter by extension': '按扩展名筛选',
    'Filter by file extension': '按文件扩展名筛选',
    'Only files owned by you': '仅你拥有的文件',
    'Only manifest files': '仅清单文件',
    'Vendored files': '第三方文件',
    'No files matched your search': '没有匹配的文件',
    'Filter changed files': '筛选已更改的文件',
    'Filter files…': '筛选文件…',
    'Filter files...': '筛选文件...',
    'Failed to load comments.': '加载评论失败。',
    'Jump to file': '跳转到文件',
    'No files found.': '未找到文件。',
    'Failed to load files.': '加载文件失败。',

    // 文件树
    'Groups by Copilot': 'Copilot 分组',
    'Loading change groups': '正在加载更改分组',
    'No groups created': '未创建分组',
    'Clear active group': '清除当前分组',
    'Please help us improve Groups by Copilot by sharing more details about these generated groups.':
      '请分享这些生成分组的更多详细信息以帮助我们改进 Copilot 分组。',
    'File tree failed to load.': '文件树加载失败。',
    'Show file tree': '显示文件树',
    'Hide file tree': '隐藏文件树',

    // 文件头与文件菜单
    'Copy file name to clipboard': '复制文件名到剪贴板',
    'Display the source diff': '显示源差异',
    'Display the rich diff': '显示富差异',
    'Ask about this diff': '询问此差异',
    'Comment on this file': '评论此文件',
    'Copy file name': '复制文件名',
    'Collapse non-diff lines': '折叠无差异的行',
    'Action unavailable': '操作不可用',
    'You must be signed in and have push access to make changes.': '你必须登录并拥有推送权限才能进行更改。',
    'You must be signed in and have push access to delete this file.': '你必须登录并拥有推送权限才能删除此文件。',
    'You must be signed in to make or propose changes': '你必须登录才能进行或提议更改',
    'Open this file in GitHub Desktop': '在 GitHub 桌面版中打开此文件',
    'Toggle diff contents': '切换差异内容',
    'Collapse expanded lines': '折叠已展开的行',
    'Collapse added diff lines': '折叠添加的差异行',
    'Toggle all file notes': '切换所有文件备注',
    'Toggle all file annotations': '切换所有文件注释',
    'This file can only be marked as viewed on the “All files” page': '只能在“所有文件”页面将此文件标记为已查看',
    'There are no files selected for viewing': '没有选择要查看的文件',
    // 经典版已查看进度的提示（原文无句末标点）
    'Marking files as viewed can help keep track of your progress, but will not affect your submitted review':
      '将文件标记为已查看有助于跟踪你的进度，但不会影响你已提交的审查',
    'Unchanged files with check annotations': '有检查注释的未更改文件',
    'View workflow job for this annotation': '查看此注释的工作流作业',

    // 差异设置
    'Open diff view settings': '打开差异视图设置',
    'Minimize comments': '最小化评论',
    'Customizable line height': '可自定义行高',
    'The default line height has been increased for improved accessibility. You can choose to enable a more compact line height from the view settings menu.':
      '默认行高已增加以改善辅助功能。你可以在视图设置菜单中启用更紧凑的行高。',
    'Enable compact line height': '启用紧凑行高',
    'Compact line height': '紧凑行高',
    'Show in all files.': '在所有文件中显示。',
    'Always show': '始终显示',
    'Hide in all files.': '在所有文件中隐藏。',
    'Always hide': '始终隐藏',
    'Other diffs stay unchanged.': '其他差异保持不变。',
    'Hide for this diff only': '仅在此差异中隐藏',
    'Whitespace changes': '空白更改',
    'Apply and reload': '应用并重新加载',

    // 差异内容提示
    'Large diffs are not rendered by default.': '大型差异默认不渲染。',
    'Some generated files are not rendered by default.': '部分生成的文件默认不渲染。',
    'Some generated files are not rendered by default. Learn more about': '部分生成的文件默认不渲染。了解',
    'customizing how changed files appear on GitHub.': '如何自定义已更改的文件在 GitHub 上的显示方式。',
    'how customized files appear on GitHub': '自定义文件在 GitHub 上的显示方式',
    'Diff is too big to render. To view,': '差异因过大而无法渲染。要查看，请',
    'check out this pull request locally.': '在本地检出此拉取请求。',
    "The contents of the file couldn't be loaded.": '无法加载文件内容。',
    'The contents of the file couldn’t be loaded.': '无法加载文件内容。',
    'Binary file not shown.': '不显示二进制文件。',
    'File renamed without changes.': '文件已重命名但内容无更改。',
    'File copied without changes.': '文件已复制但内容无更改。',
    'File mode changed.': '文件模式已更改。',
    'Whitespace-only changes.': '仅有空白更改。',
    'Empty file.': '空文件。',
    'There was an issue loading this file': '加载此文件时出现问题',
    'Try refreshing the page or if the problem persists': '刷新页面或在问题持续存在时',
    'Loading Dependency Review...': '正在加载依赖项审查...',
    'Loading Dependency Review…': '正在加载依赖项审查…',
    'This rich diff is not supported at the moment.': '暂不支持此富差异。',
    'This diff could not be loaded automatically because of too many other changes.': '此差异因其他更改过多而无法自动加载。',
    'This diff could not be loaded automatically because of too many other files to display.':
      '此差异因要显示的其他文件过多而无法自动加载。',
    'maximum diff size exceeded.': '超出最大差异大小。',
    'maximum number of lines exceeded.': '超出最大行数。',
    'No changes to show': '没有可显示的更改',
    'This commit does not include any file changes': '此提交不包含任何文件更改',
    // 经典版空状态（带句号）
    'No changes to show.': '没有可显示的更改。',
    'This commit has no content.': '此提交没有内容。',
    // 经典版所选范围只有合并提交时的空状态：… but you can still <view the diff.>
    'This merge commit was added into this branch cleanly.': '此合并提交已无冲突地添加到此分支。',
    'These merge commits were added into this branch cleanly.': '这些合并提交已无冲突地添加到此分支。',
    'There are no new changes to show, but you can still': '没有可显示的新更改，但你仍然可以',
    'There are no new changes to show.': '没有可显示的新更改。',
    'This page has been optimized for large pull requests. Some browser features (like Find on Page or Select All) may not work as expected.':
      '此页面已针对大型拉取请求优化。部分浏览器功能（如页面查找或全选）可能无法正常使用。',

    // 行操作
    'Continue comment in progress': '继续未完成的评论',
    'Expand above': '向上展开',
    'Expand below': '向下展开',
    'Collapse comments': '折叠评论',
    'Expand comments': '展开评论',
    'Selection Cleared': '已清除选择',
    'Return to code': '返回代码',
    // 新版差异全部加载、滚动到底时（两只章鱼猫击掌动画下方）
    'You made it to the end!': '你已看到最后！'
  },
  scoped: {
    // 工具栏与面板（短词）
    'Previous file': '上一个文件',
    'Next file': '下一个文件',
    'OK, got it': '好的，知道了',
    Comments: '评论',
    Alerts: '警报',
    Line: '行',
    'Manage batch': '管理批次',
    'Change groups': '更改分组',
    'Open panel': '打开面板',
    'Edit description': '编辑描述',
    'Diff settings': '差异设置',
    'Diff view': '差异视图',
    Layout: '布局',
    Format: '格式',
    Unified: '统一',
    Split: '拆分',
    'Hide whitespace': '隐藏空白',
    'Show whitespace': '显示空白',
    // 经典版“对话”下拉菜单全部解决时的标题；概述侧边面板中评论线程无回复时的标签
    'Nice work!': '干得好！',
    'No replies': '暂无回复',

    // 提交范围
    'All commits': '所有提交',
    'Changes from': '更改来自',
    'all commits': '所有提交',
    'Select commit': '选择提交',
    'Select commits': '选择提交',
    Selection: '选择',

    // 文件筛选
    'File filter': '文件筛选器',
    'Deleted files': '已删除的文件',
    'Viewed files': '已查看的文件',
    Conversations: '对话',

    // 文件树
    'All files': '所有文件',
    'File Tree': '文件树',
    'File Tree Navigation': '文件树导航',
    Directory: '目录',
    File: '文件',
    modified: '已修改',
    renamed: '已重命名',
    copied: '已复制',
    // 文件状态 added 与时间线片段同形，由 timeline.ts 的“添加了”统一处理
    deleted: '已删除',

    // 文件头与文件菜单
    'renamed to': '重命名为',
    'Expand file': '展开文件',
    'Collapse file': '折叠文件',
    'File view': '文件视图',
    'Source diff': '源差异',
    'Rich diff': '富差异',
    'Expand all lines': '展开所有行',
    'View file': '查看文件',
    'Edit file': '编辑文件',
    'Delete file': '删除文件',
    'Open in desktop': '在桌面版中打开',
    'Show comments': '显示评论',
    'Hide comments': '隐藏评论',
    'Show annotations': '显示注释',
    'Hide annotations': '隐藏注释',
    'Copy file path': '复制文件路径',
    'Expand Up': '向上展开',
    'Expand Down': '向下展开',
    'Expand All': '全部展开',
    Viewed: '已查看',
    'Not Viewed': '未查看',
    'Not viewed': '未查看',
    'Mark as viewed': '标记为已查看',
    'Mark as not viewed': '标记为未查看',
    'files viewed': '个文件已查看',
    'file viewed': '个文件已查看',
    // 已查看进度：<3> / <5> viewed
    viewed: '已查看',
    'Owned by': '所有者',
    'along with': '以及',
    'This file': '此文件',

    // 差异内容
    'Load diff': '加载差异',
    'Load Diff': '加载差异',
    'Expand diff': '展开差异',
    'Collapse diff': '折叠差异',
    'This file was deleted.': '此文件已删除。',
    'No newline at end of file': '文件末尾没有换行符',
    // 合并提交空状态的链接：… but you can still <view the diff.>
    'view the diff.': '查看差异。',
    'Comment view': '评论视图',
    'View comments': '查看评论',
    'Suggest change': '建议更改',
    Submodule: '子模块',
    'Single file mode': '单文件模式'
  },
  regexp: [
    // 已查看文件进度：1 of 3 files viewed（经典版：1 / 3 files viewed）
    [/^(\d+) of (\d+) files? viewed$/, '已查看 $1/$2 个文件'],
    [/^(\d+) ?\/ ?(\d+) files? viewed$/, '已查看 $1/$2 个文件'],
    [/^\/ (\d+) files? viewed$/, '/ $1 个文件已查看'],
    // 提交范围选择
    [/^(\d+) commits? selected$/, '已选择 $1 个提交'],
    [/^Commit (\d+) selected$/, '已选择第 $1 个提交'],
    [/^Commits (\d+) to (\d+) selected$/, '已选择第 $1 至 $2 个提交'],
    [
      new RegExp(`^([\\w-]+(?:\\[bot\\])?) committed (${RELATIVE_SOURCE})$`),
      (_, login, time) => `${login} ${joinCjk('提交于', translateTime(time))}`
    ],
    [/^All (\d+) file types? selected$/, '已选择全部 $1 种文件类型'],
    // 侧边面板
    [
      new RegExp(`^(Open|Close) (${PANEL_SOURCE}) panel$`),
      (_, action, name) => `${action === 'Open' ? '打开' : '关闭'}${panelName(name)}面板`
    ],
    [new RegExp(`^The (${PANEL_SOURCE}) panel cannot currently be opened\\.$`), (_, name) => `暂时无法打开${panelName(name)}面板。`],
    [/^(\d+) alerts?$/, '$1 条警报'],
    // 页面上限提示：Only the first 300 files and latest 100 comments are currently being shown.
    [
      new RegExp(`^Only the (${PAGE_LIMIT_ITEM}(?:(?:, and |, | and )${PAGE_LIMIT_ITEM}){0,2}) are currently being shown\\.$`),
      (_, list) => `当前仅显示${pageLimits(list)}。`
    ],
    // 文件头（路径不含空白，避免误伤标题）
    [/^(\S+) renamed to (\S+)$/, '$1 重命名为 $2'],
    [
      /^(Collapse non-diff lines|Expand all lines): (.+)$/,
      (_, action, path) => `${action === 'Expand all lines' ? '展开所有行' : '折叠无差异的行'}：${path}`
    ],
    [/^\(from CODEOWNERS line (\d+)\)$/, '（来自 CODEOWNERS 第 $1 行）'],
    [/^Owned by (.+) \(from CODEOWNERS line (\d+)\)$/, '所有者为 $1（来自 CODEOWNERS 第 $2 行）'],
    [/^Diff for: (.+)$/, '差异：$1'],
    [/^Loading (\S+\.\w+)$/, '正在加载 $1'],
    // 文件树：src/app.ts has 3 comments and has warning annotations
    [
      /^(\S+) has (\d+|9\+) comments?(?: and has (warning|notice|failure) annotations)?$/,
      (_, file, count, level) => `${file} ${fileTreeHint(count, level)}`
    ],
    [/^(\S+) has (warning|notice|failure) annotations$/, (_, file, level) => `${file} ${fileTreeHint(undefined, level)}`],
    // 展开隐藏行
    [/^Expand file from line (\d+) to line (\d+)$/, '展开文件第 $1 行至第 $2 行'],
    [/^Expand file down from line (\d+)$/, '从第 $1 行向下展开文件'],
    [/^Expand file up from line (\d+)$/, '从第 $1 行向上展开文件'],
    // 行操作菜单：Add comment on line R12 / Suggest change, modified lines R3-R5
    [
      /^(Add comment|Suggest change)(?: on lines? |, (modified|original) lines? )([LR]\d+(?:-[LR]\d+)?)$/,
      (_, action, side, range) => `在${side ? LINE_SIDE[side] : ' '}${range} 行${LINE_ACTION[action] ?? action}`
    ],
    [/^([LR]\d+) selected\.$/, '已选择 $1。'],
    [/^([LR]\d+) to ([LR]\d+) selected\.$/, '已选择 $1 至 $2。'],
    [/^([\w-]+(?:\[bot\])?)'s avatar image with pending indicator$/, '$1 的头像带有待处理标记']
  ],
  inline: [
    // 依赖项审查富差异底部：Give feedback on <a>dependency review</a>（同 commits/diff.ts，整句未命中时按其 static 片段翻译）
    ['Give feedback on {}', '对{}提供反馈']
  ],
  // 单文件模式提示的段落（Popover 内容区的类名是 CSS 模块哈希，按前缀匹配）
  mergeText: ['[class*="PopoverContent__"] > p']
} satisfies PageDictionary
