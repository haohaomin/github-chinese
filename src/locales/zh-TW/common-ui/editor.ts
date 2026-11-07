import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 评论编辑器：写入 / 预览标签页（繁体 Write 按留言框分页语境译「撰寫」）、Markdown 工具栏、输入框占位文字、评论按钮、
 * 已保存回复、斜杠命令、附件上传提示与错误、提及 / 引用建议。
 * 「Saved replies」「Attach files」「Add files」「Paste, drop, or click to add files」「Leave a comment」
 * 「Styling with Markdown is supported」及部分上传错误由其它词典的 static 收录。
 */

/** 被附加内容的类型（There was an error creating your PullRequest.） */
const SUBJECTS: Readonly<Record<string, string>> = {
  Issue: '議題',
  PullRequest: '拉取請求',
  Discussion: '討論',
  Release: '發行版本',
  Comment: '留言',
  Commit: '提交',
  Gist: '程式碼片段'
}

/** Markdown 编辑器视图模式 */
const MODES: Readonly<Record<string, string>> = {
  edit: '編輯',
  preview: '預覽',
  hybrid: '混合'
}

/** 经典 Markdown 工具栏按钮（aria-label 带快捷键：Add bold text, <Ctrl+b>） */
const TOOLBAR: Readonly<Record<string, string>> = {
  'Add heading text': '新增標題文字',
  'Add bold text': '新增粗體文字',
  'Add italic text': '新增斜體文字',
  'Add a quote': '新增引用',
  'Add code': '新增程式碼',
  'Add a link': '新增連結',
  'Add a bulleted list': '新增項目符號清單',
  'Add a numbered list': '新增編號清單',
  'Add a task list': '新增工作清單',
  'Add a suggestion': '新增建議'
}
const TOOLBAR_SOURCE = `(${Object.keys(TOOLBAR).join('|')})`

export default {
  static: {
    // 标签页与视图模式
    Write: '撰寫',
    Hybrid: '混合',
    'View mode': '檢視模式',
    'Rendered Markdown Preview': '轉譯後的 Markdown 預覽',
    'Nothing to preview': '沒有可預覽的內容',
    'Error rendering preview': '轉譯預覽時發生錯誤',
    'Markdown preview unavailable': 'Markdown 預覽無法使用',

    // 工具栏；窄时收起的按钮在溢出菜单里（Primer ActionBar：More <名称> items）
    'Formatting tools': '格式設定工具',
    'Markdown toolbar': 'Markdown 工具列',
    'More Markdown toolbar items': '更多 Markdown 工具列項目',
    Heading: '標題',
    'Increase heading level': '提高標題層級',
    'Decrease heading level': '降低標題層級',
    Bold: '粗體',
    Italic: '斜體',
    Strikethrough: '刪除線',
    Quote: '引用',
    'Code block': '程式碼區塊',
    Link: '連結',
    'Numbered list': '編號清單',
    'Ordered list': '有序清單',
    'Unordered list': '無序清單',
    'Task list': '工作清單',
    Mention: '提及',
    // 插入 #123 一类的议题、拉取请求、讨论参考（reference 按术语表译「參考」，quote 才是「引用」）
    Reference: '參考',
    'Slash commands': '斜線命令',
    Attachment: '附件',
    'Add a suggestion': '新增建議',
    'Toggle preview': '切換預覽',
    'Add heading text': '新增標題文字',
    'Directly mention a user or team': '直接提及使用者或團隊',
    'Reference an issue, pull request or discussion': '參考議題、拉取請求或討論',
    // 小屏工具栏的插入链接对话框
    'Insert Link': '插入連結',
    'Link Text': '連結文字',

    // 编辑器命令说明（键盘快捷方式对话框）
    'Insert a heading': '插入標題',
    'Toggle bold formatting on the selected text': '切換選取文字的粗體格式',
    'Toggle italic formatting on the selected text': '切換選取文字的斜體格式',
    'Insert a block quote': '插入區塊引用',
    'Insert inline code or a code block': '插入行內程式碼或程式碼區塊',
    'Insert a link': '插入連結',
    'Insert an unordered (bulleted) list': '插入無序（項目符號）清單',
    'Insert an ordered (numbered) list': '插入有序（編號）清單',
    'Insert a task list': '插入工作清單',
    'Insert a mention': '插入提及',
    'Insert a reference': '插入參考',
    'Open the saved replies picker': '開啟已儲存的回覆選擇器',
    'Toggle between edit and preview modes': '在編輯和預覽模式之間切換',

    // 输入框
    'Markdown Editor': 'Markdown 編輯器',
    'Markdown value': 'Markdown 內容',
    'Add a comment': '新增留言',
    Comment: '留言',
    'Add your comment here...': '在此新增留言...',
    'Add your comment here…': '在此新增留言…',
    // 问答讨论的答案输入框
    'Add your answer here...': '在此新增答案...',
    'Use Markdown to format your comment': '使用 Markdown 設定留言格式',
    'Comment can not be empty': '留言不可空白',
    'Update comment': '更新留言',
    'Generating text': '正在產生文字',
    'Write a comment': '撰寫留言',
    'Add a body': '新增內文',
    'Add your description here...': '在此新增描述...',
    'Add an optional description...': '新增選填的描述...',
    'Type your description here…': '在此輸入描述…',
    'Text field is empty': '文字欄位為空',
    "Failed to save comment: Body can't be blank": '無法儲存留言：內文不可空白',
    'Markdown is supported': '支援 Markdown',
    'Styling with Markdown is supported.': '支援使用 Markdown 設定樣式。',
    'is supported': '受支援',
    'The content you are editing has changed. Please copy your edits and exit the editor.':
      '你正在編輯的內容已變更。請複製你的修改並離開編輯器。',
    'The content you are editing has changed. Please copy your edits and refresh the page.':
      '你正在編輯的內容已變更。請複製你的修改並重新整理頁面。',

    // 评论按钮
    'Close and comment': '關閉並留言',
    'Reopen and comment': '重新開啟並留言',
    'Reopen with comment': '留言並重新開啟',

    // 混合编辑器出错：…Please <a>report this error</a> to the team along with…
    'The hybrid Markdown editing experience is temporarily unavailable due to an unknown error. Please':
      '混合 Markdown 編輯體驗因未知錯誤暫時無法使用。請',
    'report this error': '向團隊回報此錯誤',
    'to the team along with browser console logs, if possible.': '，如有可能請附上瀏覽器主控台記錄。',

    // 已保存回复
    'Select a reply': '選擇回覆',
    'Create a new saved reply': '建立新的已儲存回覆',
    'Search saved replies': '搜尋已儲存的回覆',
    'Filter saved replies': '篩選已儲存的回覆',
    'No saved replies': '沒有已儲存的回覆',
    // 已保存回复为空时：You can create one in your <a>settings</a>.
    'You can create one in your': '如需建立請前往',

    // 斜杠命令：/code、/details、/saved-replies、/table、/templates
    'Insert a code block formatted for a chosen syntax': '插入依所選語法設定格式的程式碼區塊',
    'No Syntax': '無語法',
    'Add a details tag to hide content behind a visible heading': '新增 details 標籤以將內容摺疊在可見標題下',
    'Insert one of your saved replies': '插入一則已儲存的回覆',
    Table: '表格',
    'Add markdown table': '新增 Markdown 表格',
    // 表格的 column / row 按台湾用法译「欄」「列」
    Columns: '欄',
    Rows: '列',
    'Insert one of your issue templates': '插入一個議題範本',
    'issue templates': '議題範本',
    'No issue templates': '沒有議題範本',
    'Add a markdown alert to emphasize important information': '新增 Markdown 警示以強調重要資訊',

    // 附件上传
    'Add Files': '新增檔案',
    'Drop to add files': '拖放以新增檔案',
    'Uploading your file...': '正在上傳檔案...',
    'Uploading your file…': '正在上傳檔案…',
    'Uploading your files...': '正在上傳檔案...',
    'This video is too big.': '此影片過大。',
    'Failed to get image size from file': '無法從檔案取得圖片尺寸',
    'Inaccessible attachments': '無法存取的附件',
    'Try again with a file that’s not empty.': '請改用非空白的檔案再試一次。',
    "Try again with a file that's not empty.": '請改用非空白的檔案再試一次。',
    'Try again with another file.': '請改用其他檔案再試一次。',
    'File contents don’t match the file extension.': '檔案內容與副檔名不符。',
    "File contents don't match the file extension.": '檔案內容與副檔名不符。',
    // File type .exe not supported. See the <a>documentation</a> for supported file types.
    'for supported file types.': '以瞭解支援的檔案類型。',

    // 自动补全建议
    'Autocomplete suggestions': '自動完成建議',
    'Loading autocomplete suggestions…': '正在載入自動完成建議…',
    'Filter emoji': '篩選表情符號'
  },
  regexp: [
    [/^Markdown input: (edit|preview|hybrid) mode selected\.$/, (_, mode: string) => `Markdown 輸入：已選擇${MODES[mode]!}模式。`],
    // 标题级别按 Word 繁中的样式名写作「標題 2」
    [/^Heading ([1-6])$/, '標題 $1'],
    [new RegExp(`^${TOOLBAR_SOURCE}, <([^<>]+)>$`), (_, label: string, keys: string) => `${TOOLBAR[label]!}，<${keys}>`],
    // 斜杠命令 /table 的行列数
    [/^([1-9]\d?) (columns?|rows?)$/, (_, count: string, unit: string) => `${count} ${unit.startsWith('c') ? '欄' : '列'}`],

    // 上传进度与错误
    [/^Uploading your files\.\.\. \((\d+)\/(\d+)\)$/, '正在上傳檔案... ($1/$2)'],
    [/^Uploading "(.+)"(\.\.\.|…)$/, '正在上傳「$1」$2'],
    [/^Failed to upload "(.+)"$/, '無法上傳「$1」'],
    [/^File types? (.+) not supported\. See the$/, '不支援檔案類型 $1。請參閱'],
    [
      /^Try again with ([A-Z0-9, ]+) or ([A-Z0-9]+)\.$/,
      (_, types: string, last: string) => `請改用 ${types.split(', ').join('、')} 或 ${last} 格式的檔案再試一次。`
    ],
    // 附件类型错误：We don’t support that file type. <a>Try again</a> with a GIF, JPEG, or PNG.
    [
      /^with an? ((?:[A-Z0-9]+, )*[A-Z0-9]+,? or [A-Z0-9]+|[A-Z0-9]+)\.$/,
      (_, list: string) => `並改用 ${list.replace(/,? or /, ' 或 ').replace(/, /g, '、')} 格式的檔案。`
    ],
    [/^Please upload a picture smaller than ([\d,]+x[\d,]+)\.$/, '請上傳小於 $1 的圖片。'],
    [
      /^There was an error creating your (Issue|PullRequest|Discussion|Release|Comment|Commit|Gist)\.$/,
      // 类型译文与中文之间按需补空格：建立程式碼片段時發生錯誤。
      (_, subject: string) => joinCjk(joinCjk('建立', SUBJECTS[subject] ?? subject), '時發生錯誤。')
    ],
    [
      /^(\d[\d,]*) attachments? in your text may not be visible to all the viewers of the repository due to being from a repository with restricted access\.$/,
      '你文字中的 $1 個附件來自存取受限的儲存庫，可能並非此儲存庫的所有檢視者都看得到。'
    ],

    // 表情符号建议：smile emoji
    [/^([a-z0-9_+-]+) emoji$/, '$1 表情符號']
  ]
} satisfies PageDictionary
