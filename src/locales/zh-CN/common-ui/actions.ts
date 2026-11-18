import type { PageDictionary } from '../../../core/types'

/**
 * 通用操作：按钮、复制、菜单、星标按钮与星标列表、筛选排序、选择面板（Primer SelectPanel / ActionList / Token）、
 * 未保存更改提示、反馈对话框、分页。加载、错误与确认提示见 messages.ts。
 * 单词级通用词放 static；页面需要不同译法时由页面词典用 scoped 覆盖。
 */

/** 选择计数：3 selected、3 of 10 selected */
const COUNT = '(\\d[\\d,]*)'
/** 星标数：可带 k / m 缩写 */
const STAT = '(\\d[\\d,.]*[kKmM]?)'

/** 列表选择的单位（ListView / NestedListView 的 singularUnits / pluralUnits） */
const UNITS: Readonly<Record<string, string>> = {
  'list item': '列表项',
  'list items': '列表项',
  issue: '议题',
  issues: '议题',
  'pull request': '拉取请求',
  'pull requests': '拉取请求',
  'issue or pull request': '议题或拉取请求',
  'issues and pull requests': '议题和拉取请求'
}
const UNIT_SOURCE = '(list items?|issue or pull request|issues and pull requests|issues?|pull requests?)'

export default {
  static: {
    // 按钮
    Cancel: '取消',
    Save: '保存',
    'Save changes': '保存更改',
    'Saving…': '保存中…',
    'Saving...': '保存中...',
    Edit: '编辑',
    'Edit title': '编辑标题',
    Delete: '删除',
    Remove: '删除',
    Close: '关闭',
    'Close panel': '关闭面板',
    'Close sidebar': '关闭侧栏',
    'Close preview': '关闭预览',
    'Close settings': '关闭设置',
    Apply: '应用',
    Update: '更新',
    Confirm: '确认',
    Done: '完成',
    Back: '返回',
    'Go back': '返回',
    Continue: '继续',
    Submit: '提交',
    Retry: '重试',
    'Try again': '重试',
    'Try again.': '请重试。',
    Dismiss: '关闭',
    'Got it': '知道了',
    'Got it!': '知道了！',
    Yes: '是',
    No: '否',
    OK: '确定',
    Ok: '确定',
    Clear: '清除',
    'Clear all': '全部清除',
    Reset: '重置',
    Undo: '撤销',
    Redo: '重做',
    Add: '添加',
    Insert: '插入',
    Attach: '附加',
    Create: '创建',
    'Create new': '新建',
    New: '新建',
    Select: '选择',
    Selected: '已选择',
    'Select all': '全选',
    'Deselect all': '取消全选',
    Choose: '选择',
    Expand: '展开',
    Collapse: '折叠',
    'Expand all': '全部展开',
    'Collapse all': '全部折叠',
    'Expand side panel': '展开侧边面板',
    'Collapse side panel': '折叠侧边面板',
    View: '查看',
    'View all': '查看全部',
    'View more': '查看更多',
    'View details': '查看详细信息',
    Details: '详细信息',
    'Hide details': '隐藏详细信息',
    Hide: '隐藏',
    'Hide all': '全部隐藏',
    Show: '显示',
    'Show all': '显示全部',
    'Show more': '显示更多',
    'Show less': '显示更少',
    'See more': '查看更多',
    'See all': '查看全部',
    'Read more': '阅读更多',
    'Load more': '加载更多',
    'Load more…': '加载更多…',
    'Load more...': '加载更多...',
    'Load more items': '加载更多条目',
    'Learn more': '了解更多',
    'Learn More': '了解更多',
    'Learn more.': '了解更多。',
    'Learn more about': '了解',
    'More information': '更多信息',
    'Open in new tab': '在新标签页中打开',
    'Back to top': '返回顶部',
    'Jump to bottom': '跳到底部',
    Help: '帮助',
    'Coming soon': '即将推出',
    'Get started': '开始使用',

    // 开关、启用与常用动词
    Enable: '启用',
    Enabled: '已启用',
    Disable: '禁用',
    Disabled: '已禁用',
    Activate: '激活',
    'Turn on': '开启',
    'Turn off': '关闭',
    Allow: '允许',
    Deny: '拒绝',
    Approve: '批准',
    Decline: '拒绝',
    Download: '下载',
    Upload: '上传',
    Install: '安装',
    Uninstall: '卸载',
    Configure: '配置',
    Customize: '自定义',
    Manage: '管理',
    Change: '更改',
    Modify: '修改',
    Replace: '替换',
    Rename: '重命名',
    Move: '移动',
    Share: '分享',
    Send: '发送',
    Archive: '存档',
    Unarchive: '取消存档',
    Restore: '恢复',
    Refresh: '刷新',
    Sync: '同步',
    Skip: '跳过',
    Start: '开始',
    Stop: '停止',
    Pause: '暂停',
    Resume: '恢复',
    Publish: '发布',
    Unpublish: '取消发布',
    Connect: '连接',
    Disconnect: '断开连接',
    Unlink: '取消链接',
    Invite: '邀请',
    Join: '加入',
    Leave: '退出',
    Resend: '重新发送',
    Revoke: '撤销',
    Regenerate: '重新生成',
    Verify: '验证',
    Block: '阻止',
    Unblock: '取消阻止',

    // 关注（存储库通知订阅、用户）
    Watch: '关注',
    Unwatch: '取消关注',
    Following: '正在关注',

    // 菜单与溢出
    More: '更多',
    items: '项',
    'More items': '更多项',
    'More items, including current item': '更多项，包括当前项',
    'More options': '更多选项',
    'More Options': '更多选项',
    'More actions': '更多操作',
    Options: '选项',
    'Show options': '显示选项',
    'Display options': '显示选项',
    Menu: '菜单',
    'Dismiss banner': '关闭横幅',
    'Dismiss message': '关闭消息',
    'Dismiss hint': '关闭提示',
    'Press Command, Shift, U for more actions': '按 Command、Shift、U 查看更多操作',
    'Press Control, Shift, U for more actions': '按 Control、Shift、U 查看更多操作',

    // 复制
    Copy: '复制',
    Copied: '已复制',
    'Copied!': '已复制！',
    'Copy to clipboard': '复制到剪贴板',
    'Copied to clipboard': '已复制到剪贴板',
    'Copied to clipboard!': '已复制到剪贴板！',
    'Copy link': '复制链接',
    'Copy code': '复制代码',
    'Copy code to clipboard': '复制代码到剪贴板',
    'Copy URL': '复制 URL',
    'Copy url to clipboard': '复制 URL 到剪贴板',
    // 代码、提交、拉取请求等处的复制按钮
    'Copy path': '复制路径',
    'Copy full SHA': '复制完整 SHA',
    'Copy file contents': '复制文件内容',

    // 星标按钮与星标列表（存储库页、仪表板、探索、搜索等处的星标下拉菜单）
    Star: '星标',
    Unstar: '取消星标',
    Starred: '已加星标',
    'Starred, click to unstar this repository': '已加星标，单击可取消此存储库的星标',
    Lists: '列表',
    'Add to list': '添加到列表',
    'Search lists': '搜索列表',
    // 添加到列表菜单里 GitHub 建议的列表名（选中即按此名创建）：菜单在列表名区域，按 profile/tabs.ts 的
    // STAR_LIST_NAMES 翻译；这里兜底区域外的同名文字
    '🔮 Future ideas': '🔮 未来构想',
    '🚀 My stack': '🚀 我的技术栈',
    '✨ Inspiration': '✨ 灵感',
    "You don't have any lists yet.": '你还没有任何列表。',
    'to add emoji to the name or description.': '可为名称或描述添加表情符号。',
    // Beta 按 product-names.md 译“测试版”
    'Lists are currently in beta.': '列表目前为测试版。',
    'Share feedback and report bugs.': '提供反馈并报告错误。',

    // 通用名词与表单标签
    Title: '标题',
    Name: '名称',
    Description: '描述',
    Message: '消息',
    Reply: '回复',
    Reason: '原因',
    Role: '角色',
    Date: '日期',
    Time: '时间',
    Version: '版本',
    Language: '语言',
    Visibility: '可见性',
    Permissions: '权限',
    Activity: '活动',
    History: '历史记录',
    Commit: '提交',
    Release: '发行版',
    Issue: '议题',
    'Pull request': '拉取请求',
    Discussion: '讨论',
    Model: '模型',
    Other: '其他',
    results: '个结果',
    'Search results': '搜索结果',
    Breadcrumb: '面包屑导航',
    'ProTip!': '提示！',
    'Note:': '注意：',
    'Warning:': '警告：',
    'Important:': '重要：',

    // 筛选与排序
    Filter: '筛选器',
    'Filter…': '筛选…',
    Filters: '筛选器',
    'Filter options': '筛选选项',
    'Clear filter': '清除筛选器',
    'Clear filters': '清除筛选器',
    'Search…': '搜索…',
    'Search...': '搜索...',
    Sort: '排序',
    'Sort by': '排序依据',
    'Sort by:': '排序依据：',
    'Sort ascending': '升序排序',
    'Sort descending': '降序排序',
    Ascending: '升序',
    Descending: '降序',
    Newest: '最新',
    Oldest: '最早',
    Newer: '较新',
    Older: '较旧',
    'Recently updated': '最近更新',
    'Least recently updated': '最久未更新',
    // 筛选栏的排序项：与评论头部正则「<用户名> commented」同形，须由 static 先命中
    'Most commented': '评论最多',
    'Least commented': '评论最少',
    All: '全部',
    None: '无',
    'None yet': '暂无',
    'Not available': '不可用',
    // 表单字段；检查列表、规则集徽章的 Required（必需）由页面词典收录
    Required: '必填',
    Optional: '可选',
    Default: '默认',
    '(optional)': '（可选）',
    '(required)': '（必填）',
    'required field': '必填字段',

    // 选择面板、令牌输入框与表格
    'Filter items': '筛选条目',
    'Select items': '选择条目',
    'Select an item': '选择条目',
    'Select an option': '选择选项',
    'Select a repository': '选择存储库',
    'Select repositories': '选择存储库',
    'Select repository': '选择存储库',
    'Select a branch': '选择分支',
    'Select…': '选择…',
    'Select...': '选择...',
    'Clear selection': '清除选择',
    'Save and close': '保存并关闭',
    'Cancel and close': '取消并关闭',
    'Fetching items...': '正在获取条目...',
    'No items available': '无可用条目',
    'No selectable options': '无可选选项',
    'No items to show': '没有可显示的条目',
    'No items found': '未找到条目',
    Suggested: '建议',
    'Items will be filtered as you type': '输入时即筛选条目',
    'Focus on filter text box and list of items': '聚焦到筛选文本框和条目列表',
    'List updated': '列表已更新',
    selected: '已选择',
    'not selected': '未选择',
    'New activity': '新动态',
    // 列表条目（ListView）无障碍名称的结尾单独出现时
    'More information available below.': '更多信息见下方。',
    'Select rows': '选择行',
    'Select row': '选择行',
    // 数据表的行与单元格编辑
    'Edit this row': '编辑此行',
    'Edit value': '编辑值',
    'Remove token': '删除标记',
    // 原文含 delete（删除键）：remove 译“移除”，免得与“删除键”重复
    '(press backspace or delete to remove)': '（按退格键或删除键移除）',
    'No results': '无结果',
    'No results.': '无结果。',
    'No results found': '未找到结果',
    'No results matched your search': '没有匹配的结果',
    'No results matched your search.': '没有匹配的结果。',
    'No matches': '无匹配项',
    'No matches found': '未找到匹配项',
    'Try a different search term': '尝试其他搜索词',

    // 未保存更改
    Discard: '放弃',
    'Discard changes?': '放弃更改？',
    'Keep editing': '继续编辑',
    'Close and discard': '关闭并放弃',
    'You have unsaved changes': '你有未保存的更改',
    'You have unsaved changes. Are you sure you want to discard them?': '你有未保存的更改。确定要放弃吗？',
    'Are you sure you want to discard them?': '确定要放弃这些更改吗？',
    'Are you sure you want to discard your unsaved changes?': '确定要放弃未保存的更改吗？',

    // 反馈对话框
    'Share feedback': '提供反馈',
    'Give us your feedback': '向我们提供反馈',
    'Tell us what you liked or what could be better': '告诉我们你喜欢什么或哪里可以改进',
    "Please don't include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our":
      '请勿包含敏感、机密或个人数据。你的反馈将用于改进我们的服务，并遵循我们的',
    'Privacy Policy': '隐私政策',
    Rating: '评分',
    'Please select a rating.': '请选择评分。',
    'An error occurred while submitting your feedback.': '提交反馈时出错。',
    'Copy logs': '复制日志',
    'Copy logs to add in feedback': '复制日志以附加到反馈',
    'Failed to copy logs.': '日志复制失败。',

    // 分页
    Pagination: '分页',
    // DataTable 分页（Table.Pagination）的 aria-label
    'Table pagination': '表格分页',
    Previous: '上一页',
    Next: '下一页',
    'Previous page': '上一页',
    'Next page': '下一页',
    'Previous Page': '上一页',
    'Next Page': '下一页'
  },
  regexp: [
    // 复制按钮：Copy "a1b2c3d" to clipboard
    [/^Copy "(.+)" to clipboard$/, '复制“$1”到剪贴板'],
    // 星标按钮：Star this repository (0)、0 users starred this repository
    [new RegExp(`^Star this repository \\(${STAT}\\)$`), '为此存储库加星标 ($1)'],
    [new RegExp(`^Unstar this repository \\(${STAT}\\)$`), '取消此存储库的星标 ($1)'],
    [new RegExp(`^Starred, click to unstar this repository \\(${STAT}\\)$`), '已加星标，单击可取消此存储库的星标 ($1)'],
    [new RegExp(`^${STAT} users? starred this repository$`), '$1 个用户为此存储库加了星标'],
    // 分页按钮：Page 7...（省略号表示其后有省略的页码，随原文）
    [/^Page (\d+)(\.\.\.|…)?$/, (_, page: string, dots: string | undefined) => `第 ${page} 页${dots ?? ''}`],
    // DataTable 分页的读屏播报：<div>Showing <!-- -->1<!-- --> through <!-- -->10<!-- --> of <!-- -->24</div>
    [/^Showing (\d[\d,]*) through (\d[\d,]*) of (\d[\d,]*)$/, '显示 $3 个中的第 $1 至 $2 个'],
    // DataTable 分页的可见范围（mergeText 整段合并）：
    // 1<span>&nbsp;through&nbsp;</span><span aria-hidden="true">‒</span>10<!-- --> of <!-- -->24（‒ 为 U+2012）
    [/^(\d[\d,]*) through ‒(\d[\d,]*) of (\d[\d,]*)$/, '$3 个中的第 $1‒$2 个'],
    // 选择面板的读屏播报
    [
      new RegExp(`^${COUNT} items? available, ${COUNT} selected\\.$`),
      (_, total: string, selected: string) => `${total} 个可用条目，已选择 ${selected} 个。`
    ],
    [/^Focused item: (.+)$/, '当前条目：$1'],
    [/^(.+), filter text box and list of items$/, '$1，筛选文本框和条目列表'],
    // 选择器按钮的读屏说明：Currently selected: main；令牌输入框：Selected: bug, docs
    [/^Currently selected: (.+)$/, '当前选择：$1'],
    [/^Selected: (.+)$/, '已选择：$1'],
    // 列表条目（ListView）的无障碍名称：[Selected. ]<标题>[. New activity]. More information available below.
    // 状态后原文是句号，不改冒号（与 pulls/list.ts 同译）
    [
      /^(Selected\. )?(.+?)(\. New activity)?\. More information available below\.$/,
      (_, selected: string | undefined, title: string, activity: string | undefined) =>
        `${selected ? '已选择。' : ''}${title}${activity ? '。有新动态' : ''}。更多信息见下方。`
    ],
    // 列表条目勾选框与读屏播报：Select: <标题>、Selected. <标题>.、Unselected. <标题>.
    [/^Select: (.+)$/, '选择：$1'],
    [
      /^(Selected|Unselected)\. (.+?)(\. New activity)?\.$/,
      (_, state: string, title: string, activity: string | undefined) =>
        `${state === 'Selected' ? '已选择' : '未选择'}。${title}${activity ? '。有新动态' : ''}。`
    ],
    [/^(.+?)\. New activity\.$/, '$1。有新动态。'],
    // 全选勾选框：Select all list items: <列表标题>；已选计数：3 list items selected、3 list items of 25 selected
    [
      new RegExp(`^Select all ${UNIT_SOURCE}:(?: (.+))?$`),
      (_, unit: string, title: string | undefined) => `全选${UNITS[unit]!}${title ? `：${title}` : ''}`
    ],
    [new RegExp(`^${COUNT} ${UNIT_SOURCE} selected$`), (_, count: string, unit: string) => `已选择 ${count} 个${UNITS[unit]!}`],
    [
      new RegExp(`^${COUNT} ${UNIT_SOURCE} of ${COUNT} selected$`),
      (_, count: string, unit: string, total: string) => `${total} 个${UNITS[unit]!}中已选择 ${count} 个`
    ],
    // 窗格、面包屑、标签组、字数统计
    [/^Pane width (\d+) pixels$/, '窗格宽度 $1 像素'],
    [/^(\d+) more breadcrumb items$/, '另外 $1 个面包屑导航项'],
    [/^All (\d+) labels$/, '全部 $1 个标签'],
    // 标签组、折叠列表的展开按钮：Show +3 more、Show 3 more
    [/^Show \+?(\d[\d,]*) more$/, '再显示 $1 个'],
    [new RegExp(`^${COUNT} characters? remaining$`), '还可输入 $1 个字符'],
    [new RegExp(`^${COUNT} characters? over$`), '超出 $1 个字符'],
    [new RegExp(`^You can enter up to ${COUNT} characters?$`), '最多可输入 $1 个字符'],
    // 已选择计数：3 selected、3 of 10 selected
    [new RegExp(`^${COUNT} selected$`), '已选择 $1 个'],
    [new RegExp(`^${COUNT} of ${COUNT} selected$`), '$2 个中已选择 $1 个'],
    // 反馈对话框
    [/^Please keep your feedback within (\d[\d,]*) characters or less\.$/, '反馈内容不能超过 $1 个字符。'],
    [/^Request ID: ([\w:./-]+)$/, '请求 ID：$1']
  ],
  // DataTable 分页的可见范围：数字、读屏用的 through、‒ 与 of 分在多个节点，合并后整段翻译。
  // 页码按钮里读屏用的「Page」「page」与可见页码分属不同节点，合并会让页码移入隐藏文字，不收录
  mergeText: ['p[data-component="Table.Pagination.Range"]']
} satisfies PageDictionary
