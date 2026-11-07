import type { PageDictionary } from '../../../core/types'
import { joinCjk, RELATIVE_SOURCE, translateTime } from '../helpers'

/** 评论入口：Add comment / Suggest change */
const LINE_ACTION: Readonly<Record<string, string>> = {
  'Add comment': '新增留言',
  'Suggest change': '建議變更'
}

/** 行范围前缀：修改后 / 原始（与 commits 词典的行操作菜单同译） */
const LINE_SIDE: Readonly<Record<string, string>> = { modified: '修改後的', original: '原始的' }

/** 注释级别（annotation → 標註） */
const ANNOTATION_LEVEL: Readonly<Record<string, string>> = {
  warning: '警告',
  notice: '提示',
  failure: '失敗'
}

/** 面板名称（Close comments panel 等） */
const PANEL_NAME: Readonly<Record<string, string>> = {
  comments: '留言',
  alerts: '警示',
  Copilot: 'Copilot',
  'merge status': '合併狀態',
  description: '描述',
  overview: '總覽',
  activity: '活動',
  side: '側邊',
  'manage batch': '批次管理'
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
const PAGE_LIMIT_UNIT: Readonly<Record<string, string>> = { files: '個檔案', comments: '則留言', alerts: '個警示' }

/**
 * first 300 files and latest 100 comments → 前 300 個檔案和最新 100 則留言；
 * 原文只有 and、没有逗号时不加标点（与合并框的检查汇总同一写法），有逗号时用顿号
 */
function pageLimits(list: string): string {
  const parts = [...list.matchAll(PAGE_LIMIT_RE)].map(
    ([, which, count, unit]) => `${which === 'latest' ? '最新' : '前'} ${count} ${PAGE_LIMIT_UNIT[unit!] ?? unit}`
  )
  return list.includes(',') ? parts.join('、') : parts.join('和')
}

/** 文件树中的评论数与注释提示：有 3 則留言和警告標註（原文无标点，译文不加；与 commits 词典同译） */
function fileTreeHint(count: string | undefined, level: string | undefined): string {
  const parts = [count ? `${count} 則留言` : '', level ? `${ANNOTATION_LEVEL[level] ?? level}標註` : '']
  return joinCjk('有', parts.filter(Boolean).join('和'))
}

/**
 * “已更改的文件”标签页：新版（React）与经典版的工具栏、提交范围选择、文件筛选、文件树、
 * 文件头与文件菜单、差异设置、差异内容提示、行操作菜单、侧边面板（评论、警报）。
 * 与提交详情页共用的差异视图文字，译法与 commits 词典的 diff.ts 一致。
 */
export default {
  static: {
    // 工具栏
    'Clear Hide whitespace filter': '清除隱藏空白字元篩選器',
    'Diff comparison toolbar': '差異比較工具列',
    'Previous file (K)': '上一個檔案 (K)',
    'Next file (J)': '下一個檔案 (J)',
    'Due to the large number of changes in this pull request, only one file is being shown at a time.':
      '此拉取請求的變更過多，一次只顯示一個檔案。',
    'buttons to move between files.': '按鈕在檔案之間切換。',
    // 单文件模式提示：Use the <strong>Previous</strong> and <strong>Next</strong> buttons …（mergeText 整段合并；
    // Previous / Next 指工具栏的文件导航按钮，不是分页的上一頁 / 下一頁）
    'Use the Previous and Next buttons to move between files.': '請使用上一個和下一個按鈕在檔案之間切換。',
    'Organize changes into groups with Copilot': '使用 Copilot 將變更整理成群組',
    'Show changes by group': '依群組顯示變更',
    'Open comments panel': '開啟留言面板',
    'Close comments panel': '關閉留言面板',
    'The comments panel cannot currently be opened.': '目前無法開啟留言面板。',
    'Open alerts panel': '開啟警示面板',
    'Close alerts panel': '關閉警示面板',
    'The alerts panel cannot currently be opened.': '目前無法開啟警示面板。',
    'Open Copilot panel': '開啟 Copilot 面板',
    'Close Copilot panel': '關閉 Copilot 面板',
    'The Copilot panel cannot currently be opened.': '目前無法開啟 Copilot 面板。',
    'Close merge status panel': '關閉合併狀態面板',
    'Close manage batch panel': '關閉批次管理面板',
    'Close side panel': '關閉側邊面板',
    'Loading description': '正在載入描述',
    'Filter alerts': '篩選警示',
    'Expand annotation': '展開標註',
    'Collapse annotation': '摺疊標註',
    'Jump to the alert in the diff': '跳至差異中的警示',
    'No alerts match the current filter': '沒有符合目前篩選器的警示',
    'No alerts on changes yet': '變更中尚無警示',
    'No comments match the current filter': '沒有符合目前篩選器的留言',
    'No comments on changes yet': '變更中尚無留言',
    // 经典版工具栏：代码空间入口、“对话”下拉菜单、概述侧边面板
    'Review in codespace': '在程式碼空間中審查',
    'Jump to conversation': '跳至對話',
    'All of your conversations have been resolved.': '你的所有對話皆已解決。',
    'Review conversations will show up here.': '審查對話會顯示在這裡。',
    'Open overview side panel': '開啟總覽側邊面板',

    // 提交范围（新版与经典版）
    'No previous review found': '找不到先前的審查',
    'No commits available': '沒有可用的提交',
    'No new commits since last review': '上次審查後沒有新提交',
    'Changes since your last review': '自你上次審查以來的變更',
    'Show changes since your last review': '顯示自你上次審查以來的變更',
    // 经典版：上一条不可用时的说明；单个提交视图中上一个 / 下一个提交按钮的禁用提示
    'You haven’t reviewed this pull request yet': '你尚未審查此拉取請求',
    'You are viewing the earliest commit': '你正在查看最早的提交',
    'You are viewing the latest commit': '你正在查看最新的提交',
    'Select a range of commits': '選取提交範圍',
    'No commits selected': '未選取提交',
    'Select commits to view': '選取要查看的提交',
    'Show all changes': '顯示所有變更',
    'Hold shift + click to select a range': '按住 Shift 並按一下以選取範圍',
    'Due to the large number of changes in the selected commit, only one file is being shown at a time.':
      '選取的提交變更過多，一次只顯示一個檔案。',
    'Due to the large number of changes in the selected commit range, only one file is being shown at a time.':
      '選取的提交範圍變更過多，一次只顯示一個檔案。',

    // 文件筛选
    'Filter by extension': '依副檔名篩選',
    'Filter by file extension': '依副檔名篩選',
    'Only files owned by you': '僅限你擁有的檔案',
    'Only manifest files': '僅限資訊清單檔案',
    'Vendored files': '第三方檔案',
    'No files matched your search': '沒有符合搜尋條件的檔案',
    'Filter changed files': '篩選變更的檔案',
    'Filter files…': '篩選檔案…',
    'Filter files...': '篩選檔案...',
    'Failed to load comments.': '無法載入留言。',
    'Jump to file': '跳至檔案',
    'No files found.': '找不到檔案。',
    'Failed to load files.': '無法載入檔案。',

    // 文件树
    'Groups by Copilot': 'Copilot 群組',
    'Loading change groups': '正在載入變更群組',
    'No groups created': '未建立群組',
    'Clear active group': '清除目前群組',
    'Please help us improve Groups by Copilot by sharing more details about these generated groups.':
      '請分享這些產生的群組的更多詳細資料以協助我們改善 Copilot 群組。',
    'File tree failed to load.': '無法載入檔案樹。',
    'Show file tree': '顯示檔案樹',
    'Hide file tree': '隱藏檔案樹',

    // 文件头与文件菜单
    'Copy file name to clipboard': '複製檔案名稱到剪貼簿',
    'Display the source diff': '顯示原始碼差異',
    'Display the rich diff': '顯示豐富差異',
    'Ask about this diff': '針對此差異提問',
    'Comment on this file': '對此檔案留言',
    'Copy file name': '複製檔案名稱',
    'Collapse non-diff lines': '摺疊無差異的行',
    'Action unavailable': '動作無法使用',
    'You must be signed in and have push access to make changes.': '你必須登入並具有推送權限才能變更。',
    'You must be signed in and have push access to delete this file.': '你必須登入並具有推送權限才能刪除此檔案。',
    'You must be signed in to make or propose changes': '你必須登入才能修改或提議變更',
    'Open this file in GitHub Desktop': '在 GitHub 桌面版中開啟此檔案',
    'Toggle diff contents': '切換差異內容',
    'Collapse expanded lines': '摺疊已展開的行',
    'Collapse added diff lines': '摺疊新增的差異行',
    'Toggle all file notes': '切換所有檔案附註',
    'Toggle all file annotations': '切換所有檔案標註',
    'This file can only be marked as viewed on the “All files” page': '只能在「所有檔案」頁面將此檔案標示為已查看',
    'There are no files selected for viewing': '沒有選取要查看的檔案',
    // 经典版已查看进度的提示（原文无句末标点）
    'Marking files as viewed can help keep track of your progress, but will not affect your submitted review':
      '將檔案標示為已查看有助於追蹤你的進度，但不會影響你已送出的審查',
    'Unchanged files with check annotations': '有檢查標註的未變更檔案',
    'View workflow job for this annotation': '查看此標註的工作流程作業',

    // 差异设置
    'Open diff view settings': '開啟差異檢視設定',
    'Minimize comments': '最小化留言',
    'Customizable line height': '可自訂行高',
    'The default line height has been increased for improved accessibility. You can choose to enable a more compact line height from the view settings menu.':
      '預設行高已加大以改善無障礙體驗。你可以在檢視設定選單中啟用較緊密的行高。',
    'Enable compact line height': '啟用緊密行高',
    'Compact line height': '緊密行高',
    'Show in all files.': '在所有檔案中顯示。',
    'Always show': '一律顯示',
    'Hide in all files.': '在所有檔案中隱藏。',
    'Always hide': '一律隱藏',
    'Other diffs stay unchanged.': '其他差異維持不變。',
    'Hide for this diff only': '僅在此差異中隱藏',
    'Whitespace changes': '空白字元變更',
    'Apply and reload': '套用並重新載入',

    // 差异内容提示（render 按 commits 词典译「顯示」）
    'Large diffs are not rendered by default.': '預設不顯示大型差異。',
    'Some generated files are not rendered by default.': '部分產生的檔案預設不顯示。',
    'Some generated files are not rendered by default. Learn more about': '部分產生的檔案預設不顯示。瞭解',
    'customizing how changed files appear on GitHub.': '如何自訂變更的檔案在 GitHub 上的顯示方式。',
    'how customized files appear on GitHub': '自訂檔案在 GitHub 上的顯示方式',
    'Diff is too big to render. To view,': '差異過大而無法顯示。若要查看，請',
    'check out this pull request locally.': '在本機簽出此拉取請求。',
    "The contents of the file couldn't be loaded.": '無法載入檔案內容。',
    'The contents of the file couldn’t be loaded.': '無法載入檔案內容。',
    'Binary file not shown.': '不顯示二進位檔案。',
    'File renamed without changes.': '檔案已重新命名且內容未變更。',
    'File copied without changes.': '檔案已複製且內容未變更。',
    'File mode changed.': '檔案模式已變更。',
    'Whitespace-only changes.': '僅有空白字元變更。',
    'Empty file.': '空白檔案。',
    'There was an issue loading this file': '載入此檔案時發生問題',
    'Try refreshing the page or if the problem persists': '請嘗試重新整理頁面或在問題持續發生時',
    'Loading Dependency Review...': '正在載入相依性審查...',
    'Loading Dependency Review…': '正在載入相依性審查…',
    'This rich diff is not supported at the moment.': '目前不支援此豐富差異。',
    'This diff could not be loaded automatically because of too many other changes.': '此差異因其他變更過多而無法自動載入。',
    'This diff could not be loaded automatically because of too many other files to display.':
      '此差異因要顯示的其他檔案過多而無法自動載入。',
    'maximum diff size exceeded.': '超出差異大小上限。',
    'maximum number of lines exceeded.': '超出行數上限。',
    'No changes to show': '沒有可顯示的變更',
    'This commit does not include any file changes': '此提交不包含任何檔案變更',
    // 经典版空状态（带句号）
    'No changes to show.': '沒有可顯示的變更。',
    'This commit has no content.': '此提交沒有內容。',
    // 经典版所选范围只有合并提交时的空状态：… but you can still <view the diff.>
    'This merge commit was added into this branch cleanly.': '此合併提交已無衝突地加入此分支。',
    'These merge commits were added into this branch cleanly.': '這些合併提交已無衝突地加入此分支。',
    'There are no new changes to show, but you can still': '沒有可顯示的新變更，但你仍然可以',
    'There are no new changes to show.': '沒有可顯示的新變更。',
    'This page has been optimized for large pull requests. Some browser features (like Find on Page or Select All) may not work as expected.':
      '此頁面已針對大型拉取請求最佳化。部分瀏覽器功能（例如在頁面中尋找或全選）可能無法正常運作。',

    // 行操作
    'Continue comment in progress': '繼續撰寫未完成的留言',
    'Expand above': '向上展開',
    'Expand below': '向下展開',
    'Collapse comments': '摺疊留言',
    'Expand comments': '展開留言',
    'Selection Cleared': '已清除選取範圍',
    'Return to code': '返回程式碼',
    // 新版差异全部加载、滚动到底时（两只章鱼猫击掌动画下方）
    'You made it to the end!': '你已經看到最後了！'
  },
  scoped: {
    // 工具栏与面板（短词）
    'Previous file': '上一個檔案',
    'Next file': '下一個檔案',
    'OK, got it': '好，我知道了',
    Comments: '留言',
    Alerts: '警示',
    Line: '行',
    'Manage batch': '管理批次',
    'Change groups': '變更群組',
    'Open panel': '開啟面板',
    'Edit description': '編輯描述',
    'Diff settings': '差異設定',
    'Diff view': '差異檢視',
    Layout: '版面配置',
    Format: '格式',
    Unified: '統一',
    Split: '分割',
    'Hide whitespace': '隱藏空白字元',
    'Show whitespace': '顯示空白字元',
    // 经典版“对话”下拉菜单全部解决时的标题；概述侧边面板中评论线程无回复时的标签
    'Nice work!': '做得好！',
    'No replies': '尚無回覆',

    // 提交范围
    'All commits': '所有提交',
    'Changes from': '變更來自',
    'all commits': '所有提交',
    'Select commit': '選取提交',
    'Select commits': '選取提交',
    Selection: '選取範圍',

    // 文件筛选
    'File filter': '檔案篩選器',
    'Deleted files': '已刪除的檔案',
    'Viewed files': '已查看的檔案',
    Conversations: '對話',

    // 文件树
    'All files': '所有檔案',
    'File Tree': '檔案樹',
    'File Tree Navigation': '檔案樹導覽',
    Directory: '目錄',
    File: '檔案',
    modified: '已修改',
    renamed: '已重新命名',
    copied: '已複製',
    // 文件状态 added 与时间线片段同形，由 timeline.ts 统一处理
    deleted: '已刪除',

    // 文件头与文件菜单
    'renamed to': '重新命名為',
    'Expand file': '展開檔案',
    'Collapse file': '摺疊檔案',
    'File view': '檔案檢視',
    'Source diff': '原始碼差異',
    'Rich diff': '豐富差異',
    'Expand all lines': '展開所有行',
    'View file': '查看檔案',
    'Edit file': '編輯檔案',
    'Delete file': '刪除檔案',
    'Open in desktop': '在桌面版中開啟',
    'Show comments': '顯示留言',
    'Hide comments': '隱藏留言',
    'Show annotations': '顯示標註',
    'Hide annotations': '隱藏標註',
    'Copy file path': '複製檔案路徑',
    'Expand Up': '向上展開',
    'Expand Down': '向下展開',
    'Expand All': '全部展開',
    Viewed: '已查看',
    'Not Viewed': '未查看',
    'Not viewed': '未查看',
    'Mark as viewed': '標示為已查看',
    'Mark as not viewed': '標示為未查看',
    'files viewed': '個檔案已查看',
    'file viewed': '個檔案已查看',
    // 已查看进度：<3> / <5> viewed
    viewed: '已查看',
    // CODEOWNERS 徽章：Owned by <@octocat> along with <@octo-org/core> (from CODEOWNERS line 3)
    'Owned by': '擁有者為',
    'along with': '和',
    'This file': '此檔案',

    // 差异内容
    'Load diff': '載入差異',
    'Load Diff': '載入差異',
    'Expand diff': '展開差異',
    'Collapse diff': '摺疊差異',
    'This file was deleted.': '此檔案已刪除。',
    'No newline at end of file': '檔案結尾沒有換行字元',
    // 合并提交空状态的链接：… but you can still <view the diff.>
    'view the diff.': '查看差異。',
    'Comment view': '留言檢視',
    'View comments': '查看留言',
    'Suggest change': '建議變更',
    Submodule: '子模組',
    'Single file mode': '單一檔案模式'
  },
  regexp: [
    // 已查看文件进度：1 of 3 files viewed（经典版：1 / 3 files viewed）
    [/^(\d+) of (\d+) files? viewed$/, '已查看 $1/$2 個檔案'],
    [/^(\d+) ?\/ ?(\d+) files? viewed$/, '已查看 $1/$2 個檔案'],
    [/^\/ (\d+) files? viewed$/, '/ $1 個檔案已查看'],
    // 提交范围选择
    [/^(\d+) commits? selected$/, '已選取 $1 個提交'],
    [/^Commit (\d+) selected$/, '已選取第 $1 個提交'],
    [/^Commits (\d+) to (\d+) selected$/, '已選取第 $1 至 $2 個提交'],
    [
      new RegExp(`^([\\w-]+(?:\\[bot\\])?) committed (${RELATIVE_SOURCE})$`),
      (_, login, time) => `${login} ${joinCjk('提交於', translateTime(time))}`
    ],
    [/^All (\d+) file types? selected$/, '已選取全部 $1 種檔案類型'],
    // 侧边面板
    [
      new RegExp(`^(Open|Close) (${PANEL_SOURCE}) panel$`),
      (_, action, name) => `${action === 'Open' ? '開啟' : '關閉'}${panelName(name)}面板`
    ],
    [new RegExp(`^The (${PANEL_SOURCE}) panel cannot currently be opened\\.$`), (_, name) => `目前無法開啟${panelName(name)}面板。`],
    [/^(\d+) alerts?$/, '$1 個警示'],
    // 页面上限提示：Only the first 300 files and latest 100 comments are currently being shown.
    [
      new RegExp(`^Only the (${PAGE_LIMIT_ITEM}(?:(?:, and |, | and )${PAGE_LIMIT_ITEM}){0,2}) are currently being shown\\.$`),
      (_, list) => `目前僅顯示${pageLimits(list)}。`
    ],
    // 文件头（路径不含空白，避免误伤标题）
    [/^(\S+) renamed to (\S+)$/, '$1 重新命名為 $2'],
    [
      /^(Collapse non-diff lines|Expand all lines): (.+)$/,
      (_, action, path) => `${action === 'Expand all lines' ? '展開所有行' : '摺疊無差異的行'}：${path}`
    ],
    [/^\(from CODEOWNERS line (\d+)\)$/, '（來自 CODEOWNERS 第 $1 行）'],
    [/^Owned by (.+) \(from CODEOWNERS line (\d+)\)$/, '擁有者為 $1（來自 CODEOWNERS 第 $2 行）'],
    // 与 commits 词典同译：Diff for: src/app.ts → src/app.ts 的差異
    [/^Diff for: (.+)$/, '$1 的差異'],
    [/^Loading (\S+\.\w+)$/, '正在載入 $1'],
    // 文件树：src/app.ts has 3 comments and has warning annotations
    [
      /^(\S+) has (\d+|9\+) comments?(?: and has (warning|notice|failure) annotations)?$/,
      (_, file, count, level) => `${file} ${fileTreeHint(count, level)}`
    ],
    [/^(\S+) has (warning|notice|failure) annotations$/, (_, file, level) => `${file} ${fileTreeHint(undefined, level)}`],
    // 展开隐藏行（与 commits 词典同译）
    [/^Expand file from line (\d+) to line (\d+)$/, '展開檔案第 $1 至 $2 行'],
    [/^Expand file down from line (\d+)$/, '從第 $1 行向下展開檔案'],
    [/^Expand file up from line (\d+)$/, '從第 $1 行向上展開檔案'],
    // 行操作菜单：Add comment on line R12 / Suggest change, modified lines R3-R5（行范围与 commits 词典同译「第 R3 至 R5 行」）
    [
      /^(Add comment|Suggest change)(?: on lines? |, (modified|original) lines? )([LR]\d+(?:-[LR]\d+)?)$/,
      (_, action, side, range) => `在${side ? LINE_SIDE[side] : ''}第 ${range.replace('-', ' 至 ')} 行${LINE_ACTION[action] ?? action}`
    ],
    [/^([LR]\d+) selected\.$/, '已選取 $1。'],
    [/^([LR]\d+) to ([LR]\d+) selected\.$/, '已選取 $1 至 $2。'],
    // pending indicator 作「待處理指示器」（不用「標記」，与 tag 的译名分开）
    [/^([\w-]+(?:\[bot\])?)'s avatar image with pending indicator$/, '$1 的頭像帶有待處理指示器']
  ],
  inline: [
    // 依赖项审查富差异底部：Give feedback on <a>dependency review</a>（同 commits/diff.ts，整句未命中时按其 static 片段翻译）
    ['Give feedback on {}', '提供{}的意見回饋']
  ],
  // 单文件模式提示的段落（Popover 内容区的类名是 CSS 模块哈希，按前缀匹配）
  mergeText: ['[class*="PopoverContent__"] > p']
} satisfies PageDictionary
