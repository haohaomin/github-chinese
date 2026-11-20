import type { PageDictionary } from '../../../core/types'

/**
 * 通用操作：按钮、复制、菜单、星标按钮与星标列表、筛选排序、选择面板（Primer SelectPanel / ActionList / Token）、
 * 未保存更改提示、反馈对话框、分页。加载、错误与确认提示见 messages.ts。
 * 单词级通用词放 static；页面需要不同译法时由页面词典用 scoped 覆盖。
 * select 按术语表分译：选中列表项、勾选框、表格行 → 「選取」；从选项里挑一个（按钮、下拉菜单、选择器）→ 「選擇」。
 */

/** 选择计数：3 selected、3 of 10 selected */
const COUNT = '(\\d[\\d,]*)'
/** 星标数：可带 k / m 缩写 */
const STAT = '(\\d[\\d,.]*[kKmM]?)'

/** 列表选择的单位（ListView / NestedListView 的 singularUnits / pluralUnits） */
const UNITS: Readonly<Record<string, string>> = {
  'list item': '清單項目',
  'list items': '清單項目',
  issue: '議題',
  issues: '議題',
  'pull request': '拉取請求',
  'pull requests': '拉取請求',
  'issue or pull request': '議題或拉取請求',
  'issues and pull requests': '議題和拉取請求'
}
const UNIT_SOURCE = '(list items?|issue or pull request|issues and pull requests|issues?|pull requests?)'

export default {
  static: {
    // 按钮
    Cancel: '取消',
    Save: '儲存',
    'Save changes': '儲存變更',
    'Saving…': '儲存中…',
    'Saving...': '儲存中...',
    Edit: '編輯',
    'Edit title': '編輯標題',
    Delete: '刪除',
    Remove: '移除',
    Close: '關閉',
    'Close panel': '關閉面板',
    'Close sidebar': '關閉側邊欄',
    'Close preview': '關閉預覽',
    'Close settings': '關閉設定',
    Apply: '套用',
    Update: '更新',
    Confirm: '確認',
    Done: '完成',
    Back: '返回',
    'Go back': '返回',
    Continue: '繼續',
    Submit: '送出',
    Retry: '重試',
    'Try again': '再試一次',
    'Try again.': '請再試一次。',
    Dismiss: '關閉',
    'Got it': '我知道了',
    'Got it!': '我知道了！',
    Yes: '是',
    No: '否',
    OK: '確定',
    Ok: '確定',
    Clear: '清除',
    'Clear all': '全部清除',
    Reset: '重設',
    Undo: '復原',
    Redo: '重做',
    Add: '新增',
    Insert: '插入',
    Attach: '附加',
    Create: '建立',
    'Create new': '新增',
    New: '新增',
    Select: '選擇',
    Selected: '已選取',
    'Select all': '全選',
    'Deselect all': '取消全選',
    Choose: '選擇',
    Expand: '展開',
    Collapse: '摺疊',
    'Expand all': '全部展開',
    'Collapse all': '全部摺疊',
    'Expand side panel': '展開側邊面板',
    'Collapse side panel': '摺疊側邊面板',
    View: '查看',
    'View all': '查看全部',
    'View more': '查看更多',
    'View details': '查看詳細資料',
    Details: '詳細資料',
    'Hide details': '隱藏詳細資料',
    Hide: '隱藏',
    'Hide all': '全部隱藏',
    Show: '顯示',
    'Show all': '顯示全部',
    'Show more': '顯示更多',
    'Show less': '顯示較少',
    'See more': '查看更多',
    'See all': '查看全部',
    'Read more': '閱讀更多',
    'Load more': '載入更多',
    'Load more…': '載入更多…',
    'Load more...': '載入更多...',
    'Load more items': '載入更多項目',
    'Learn more': '瞭解詳情',
    'Learn More': '瞭解詳情',
    'Learn more.': '瞭解詳情。',
    'Learn more about': '瞭解',
    'More information': '更多資訊',
    'Open in new tab': '在新分頁中開啟',
    'Back to top': '回到頂端',
    'Jump to bottom': '跳至底部',
    Help: '說明',
    'Coming soon': '即將推出',
    'Get started': '開始使用',

    // 开关、启用与常用动词
    Enable: '啟用',
    Enabled: '已啟用',
    Disable: '停用',
    Disabled: '已停用',
    Activate: '啟用',
    'Turn on': '開啟',
    'Turn off': '關閉',
    Allow: '允許',
    Deny: '拒絕',
    Approve: '核准',
    Decline: '拒絕',
    Download: '下載',
    Upload: '上傳',
    Install: '安裝',
    Uninstall: '解除安裝',
    Configure: '設定',
    Customize: '自訂',
    Manage: '管理',
    Change: '變更',
    Modify: '修改',
    Replace: '取代',
    Rename: '重新命名',
    Move: '移動',
    Share: '分享',
    Send: '傳送',
    Archive: '封存',
    Unarchive: '取消封存',
    Restore: '還原',
    Refresh: '重新整理',
    Sync: '同步',
    Skip: '略過',
    Start: '開始',
    Stop: '停止',
    Pause: '暫停',
    Resume: '繼續',
    Publish: '發布',
    Unpublish: '取消發布',
    Connect: '連接',
    Disconnect: '中斷連接',
    Unlink: '取消連結',
    Invite: '邀請',
    Join: '加入',
    Leave: '離開',
    Resend: '重新傳送',
    Revoke: '撤銷',
    Regenerate: '重新產生',
    Verify: '驗證',
    Block: '封鎖',
    Unblock: '解除封鎖',

    // 关注（存储库通知订阅、用户）：watch 译「關注」，follow 译「追蹤」
    Watch: '關注',
    Unwatch: '取消關注',
    Following: '追蹤中',

    // 菜单与溢出
    More: '更多',
    // 常与 More 相邻（溢出按钮：More + 读屏用的 items），译「項目」，拼起来是「更多項目」
    items: '項目',
    'More items': '更多項目',
    'More items, including current item': '更多項目，包含目前項目',
    'More options': '更多選項',
    'More Options': '更多選項',
    'More actions': '更多動作',
    Options: '選項',
    'Show options': '顯示選項',
    'Display options': '顯示選項',
    Menu: '選單',
    'Dismiss banner': '關閉橫幅',
    'Dismiss message': '關閉訊息',
    'Dismiss hint': '關閉提示',
    'Press Command, Shift, U for more actions': '按 Command、Shift、U 查看更多動作',
    'Press Control, Shift, U for more actions': '按 Control、Shift、U 查看更多動作',

    // 复制
    Copy: '複製',
    Copied: '已複製',
    'Copied!': '已複製！',
    'Copy to clipboard': '複製到剪貼簿',
    'Copied to clipboard': '已複製到剪貼簿',
    'Copied to clipboard!': '已複製到剪貼簿！',
    'Copy link': '複製連結',
    'Copy code': '複製程式碼',
    'Copy code to clipboard': '將程式碼複製到剪貼簿',
    'Copy URL': '複製 URL',
    'Copy url to clipboard': '將 URL 複製到剪貼簿',
    // 代码、提交、拉取请求等处的复制按钮
    'Copy path': '複製路徑',
    'Copy full SHA': '複製完整 SHA',
    'Copy file contents': '複製檔案內容',

    // 星标按钮与星标列表（存储库页、仪表板、探索、搜索等处的星标下拉菜单）
    Star: '加星號',
    Unstar: '移除星號',
    Starred: '已加星號',
    'Starred, click to unstar this repository': '已加星號，按一下可移除此儲存庫的星號',
    Lists: '清單',
    'Add to list': '加入清單',
    'Search lists': '搜尋清單',
    // 新增到清单选单里 GitHub 建议的清单名（选取即按此名建立）：选单在清单名区域，按 profile/tabs.ts 的
    // STAR_LIST_NAMES 翻译；这里兜底区域外的同名文字
    '🔮 Future ideas': '🔮 未來構想',
    '🚀 My stack': '🚀 我的技術堆疊',
    '✨ Inspiration': '✨ 靈感',
    "You don't have any lists yet.": '你還沒有任何清單。',
    'to add emoji to the name or description.': '可在名稱或描述中加入表情符號。',
    // Beta 按术语表译「測試版」
    'Lists are currently in beta.': '清單目前為測試版。',
    'Share feedback and report bugs.': '提供意見回饋並回報錯誤。',

    // 通用名词与表单标签
    Title: '標題',
    Name: '名稱',
    Description: '描述',
    Message: '訊息',
    Reply: '回覆',
    Reason: '原因',
    Role: '角色',
    Date: '日期',
    Time: '時間',
    Version: '版本',
    Language: '語言',
    Visibility: '可見度',
    Permissions: '權限',
    Activity: '活動',
    History: '歷史記錄',
    Commit: '提交',
    Release: '發行版本',
    Issue: '議題',
    'Pull request': '拉取請求',
    Discussion: '討論',
    Model: '模型',
    Other: '其他',
    // 计数之后的片段（<span>15</span> results），量词按术语表用「項」
    results: '項結果',
    'Search results': '搜尋結果',
    Breadcrumb: '導覽路徑',
    'ProTip!': '提示！',
    'Note:': '注意：',
    'Warning:': '警告：',
    'Important:': '重要：',

    // 筛选与排序
    Filter: '篩選器',
    'Filter…': '篩選…',
    Filters: '篩選器',
    'Filter options': '篩選選項',
    'Clear filter': '清除篩選器',
    'Clear filters': '清除篩選器',
    'Search…': '搜尋…',
    'Search...': '搜尋...',
    Sort: '排序',
    'Sort by': '排序依據',
    'Sort by:': '排序依據：',
    'Sort ascending': '遞增排序',
    'Sort descending': '遞減排序',
    Ascending: '遞增',
    Descending: '遞減',
    Newest: '最新',
    Oldest: '最舊',
    Newer: '較新',
    Older: '較舊',
    'Recently updated': '最近更新',
    'Least recently updated': '最久未更新',
    // 筛选栏的排序项：与评论头部正则「<用户名> commented」同形，须由 static 先命中
    'Most commented': '最多留言',
    'Least commented': '最少留言',
    All: '全部',
    None: '無',
    'None yet': '尚無',
    'Not available': '無法使用',
    // 表单字段；检查列表、规则集徽章的 Required（必要）由页面词典收录
    Required: '必填',
    Optional: '選填',
    Default: '預設',
    '(optional)': '（選填）',
    '(required)': '（必填）',
    'required field': '必填欄位',

    // 选择面板、令牌输入框与表格
    'Filter items': '篩選項目',
    'Select items': '選取項目',
    'Select an item': '選擇項目',
    'Select an option': '選擇選項',
    'Select a repository': '選擇儲存庫',
    'Select repositories': '選取儲存庫',
    'Select repository': '選擇儲存庫',
    'Select a branch': '選擇分支',
    'Select…': '選擇…',
    'Select...': '選擇...',
    'Clear selection': '清除選取',
    'Save and close': '儲存並關閉',
    'Cancel and close': '取消並關閉',
    'Fetching items...': '正在擷取項目...',
    'No items available': '沒有可用的項目',
    'No selectable options': '沒有可選擇的選項',
    'No items to show': '沒有可顯示的項目',
    'No items found': '找不到項目',
    Suggested: '建議',
    'Items will be filtered as you type': '輸入時即篩選項目',
    'Focus on filter text box and list of items': '將焦點移至篩選文字方塊和項目清單',
    'List updated': '清單已更新',
    selected: '已選取',
    'not selected': '未選取',
    'New activity': '新動態',
    // 列表条目（ListView）无障碍名称的结尾单独出现时
    'More information available below.': '下方有更多資訊。',
    'Select rows': '選取列',
    'Select row': '選取列',
    // 数据表的行与单元格编辑
    'Edit this row': '編輯此列',
    'Edit value': '編輯值',
    // 输入框里的标记（Token，如标签、用户）的移除按钮；不译「權杖」（那是 access token）
    'Remove token': '移除項目',
    // 原文含 delete（Delete 键）：按键名照台湾习惯保留英文，remove 与全局 Remove 同译「移除」
    '(press backspace or delete to remove)': '（按 Backspace 或 Delete 鍵移除）',
    'No results': '沒有結果',
    'No results.': '沒有結果。',
    'No results found': '找不到結果',
    'No results matched your search': '沒有相符的結果',
    'No results matched your search.': '沒有相符的結果。',
    'No matches': '沒有相符項目',
    'No matches found': '找不到相符項目',
    'Try a different search term': '嘗試其他搜尋字詞',

    // 未保存更改
    Discard: '捨棄',
    'Discard changes?': '要捨棄變更嗎？',
    'Keep editing': '繼續編輯',
    'Close and discard': '關閉並捨棄',
    'You have unsaved changes': '你有未儲存的變更',
    'You have unsaved changes. Are you sure you want to discard them?': '你有未儲存的變更。確定要捨棄嗎？',
    'Are you sure you want to discard them?': '確定要捨棄這些變更嗎？',
    'Are you sure you want to discard your unsaved changes?': '確定要捨棄未儲存的變更嗎？',

    // 反馈对话框
    'Share feedback': '提供意見回饋',
    'Give us your feedback': '向我們提供意見回饋',
    'Tell us what you liked or what could be better': '告訴我們你喜歡的地方或可改進之處',
    "Please don't include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our":
      '請勿包含敏感、機密或個人資料。你的意見回饋將用於改善我們的服務，並遵循我們的',
    'Privacy Policy': '隱私權政策',
    Rating: '評分',
    'Please select a rating.': '請選擇評分。',
    'An error occurred while submitting your feedback.': '送出意見回饋時發生錯誤。',
    'Copy logs': '複製記錄',
    'Copy logs to add in feedback': '複製記錄以附加到意見回饋',
    'Failed to copy logs.': '無法複製記錄。',

    // 分页
    Pagination: '分頁',
    // DataTable 分页（Table.Pagination）的 aria-label
    'Table pagination': '表格分頁',
    Previous: '上一頁',
    Next: '下一頁',
    'Previous page': '上一頁',
    'Next page': '下一頁',
    'Previous Page': '上一頁',
    'Next Page': '下一頁'
  },
  regexp: [
    // 复制按钮：Copy "a1b2c3d" to clipboard
    [/^Copy "(.+)" to clipboard$/, '將「$1」複製到剪貼簿'],
    // 星标按钮：Star this repository (0)、0 users starred this repository
    [new RegExp(`^Star this repository \\(${STAT}\\)$`), '為此儲存庫加星號 ($1)'],
    [new RegExp(`^Unstar this repository \\(${STAT}\\)$`), '移除此儲存庫的星號 ($1)'],
    [new RegExp(`^Starred, click to unstar this repository \\(${STAT}\\)$`), '已加星號，按一下可移除此儲存庫的星號 ($1)'],
    [new RegExp(`^${STAT} users? starred this repository$`), '$1 位使用者為此儲存庫加了星號'],
    // 分页按钮：Page 7...（省略号表示其后有省略的页码，随原文）
    [/^Page (\d+)(\.\.\.|…)?$/, (_, page: string, dots: string | undefined) => `第 ${page} 頁${dots ?? ''}`],
    // DataTable 分页的读屏播报：<div>Showing <!-- -->1<!-- --> through <!-- -->10<!-- --> of <!-- -->24</div>
    // 表格的行是资料记录，量词按术语表用「筆」；原文无标点，译文不加逗号
    [/^Showing (\d[\d,]*) through (\d[\d,]*) of (\d[\d,]*)$/, '顯示 $3 筆中的第 $1 至 $2 筆'],
    // DataTable 分页的可见范围（mergeText 整段合并）：
    // 1<span>&nbsp;through&nbsp;</span><span aria-hidden="true">‒</span>10<!-- --> of <!-- -->24（‒ 为 U+2012）
    [/^(\d[\d,]*) through ‒(\d[\d,]*) of (\d[\d,]*)$/, '$3 筆中的第 $1‒$2 筆'],
    // 列表分页的可见范围（相邻文本节点整段合并）：1<!-- -->-<!-- -->4<!-- --> of <!-- -->4（组织预算列表）
    [/^(\d[\d,]*)-(\d[\d,]*) of (\d[\d,]*)$/, '$3 筆中的第 $1-$2 筆'],
    // 选择面板的读屏播报
    [
      new RegExp(`^${COUNT} items? available, ${COUNT} selected\\.$`),
      (_, total: string, selected: string) => `${total} 個可用項目，已選取 ${selected} 個。`
    ],
    [/^Focused item: (.+)$/, '焦點項目：$1'],
    [/^(.+), filter text box and list of items$/, '$1，篩選文字方塊和項目清單'],
    // 选择器按钮的读屏说明：Currently selected: main；令牌输入框：Selected: bug, docs
    [/^Currently selected: (.+)$/, '目前選擇：$1'],
    [/^Selected: (.+)$/, '已選取：$1'],
    // 列表条目（ListView）的无障碍名称：[Selected. ]<标题>[. New activity]. More information available below.
    // 状态后原文是句号，不改冒号（与 pulls/list.ts 同译）
    [
      /^(Selected\. )?(.+?)(\. New activity)?\. More information available below\.$/,
      (_, selected: string | undefined, title: string, activity: string | undefined) =>
        `${selected ? '已選取。' : ''}${title}${activity ? '。有新動態' : ''}。下方有更多資訊。`
    ],
    // 列表条目勾选框与读屏播报：Select: <标题>、Selected. <标题>.、Unselected. <标题>.
    [/^Select: (.+)$/, '選取：$1'],
    [
      /^(Selected|Unselected)\. (.+?)(\. New activity)?\.$/,
      (_, state: string, title: string, activity: string | undefined) =>
        `${state === 'Selected' ? '已選取' : '未選取'}。${title}${activity ? '。有新動態' : ''}。`
    ],
    [/^(.+?)\. New activity\.$/, '$1。有新動態。'],
    // 全选勾选框：Select all list items: <列表标题>；已选计数：3 list items selected、3 list items of 25 selected
    [
      new RegExp(`^Select all ${UNIT_SOURCE}:(?: (.+))?$`),
      (_, unit: string, title: string | undefined) => `全選${UNITS[unit]!}${title ? `：${title}` : ''}`
    ],
    [new RegExp(`^${COUNT} ${UNIT_SOURCE} selected$`), (_, count: string, unit: string) => `已選取 ${count} 個${UNITS[unit]!}`],
    [
      new RegExp(`^${COUNT} ${UNIT_SOURCE} of ${COUNT} selected$`),
      (_, count: string, unit: string, total: string) => `${total} 個${UNITS[unit]!}中已選取 ${count} 個`
    ],
    // 窗格、面包屑、标签组、字数统计
    [/^Pane width (\d+) pixels$/, '窗格寬度 $1 像素'],
    [/^(\d+) more breadcrumb items$/, '另有 $1 個導覽路徑項目'],
    [/^All (\d+) labels$/, '全部 $1 個標籤'],
    // 标签组、折叠列表的展开按钮：Show +3 more、Show 3 more
    [/^Show \+?(\d[\d,]*) more$/, '再顯示 $1 個'],
    [new RegExp(`^${COUNT} characters? remaining$`), '還可輸入 $1 個字元'],
    [new RegExp(`^${COUNT} characters? over$`), '超出 $1 個字元'],
    [new RegExp(`^You can enter up to ${COUNT} characters?$`), '最多可輸入 $1 個字元'],
    // 已选择计数：3 selected、3 of 10 selected
    [new RegExp(`^${COUNT} selected$`), '已選取 $1 個'],
    [new RegExp(`^${COUNT} of ${COUNT} selected$`), '$2 個中已選取 $1 個'],
    // 反馈对话框
    [/^Please keep your feedback within (\d[\d,]*) characters or less\.$/, '意見回饋不得超過 $1 個字元。'],
    [/^Request ID: ([\w:./-]+)$/, '請求 ID：$1']
  ],
  // DataTable 分页的可见范围：数字、读屏用的 through、‒ 与 of 分在多个节点，合并后整段翻译。
  // 页码按钮里读屏用的「Page」「page」与可见页码分属不同节点，合并会让页码移入隐藏文字，不收录
  mergeText: ['p[data-component="Table.Pagination.Range"]']
} satisfies PageDictionary
