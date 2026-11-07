import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 评论编辑器：写入 / 预览标签页、Markdown 工具栏、输入框占位文字、评论按钮、已保存回复、斜杠命令、附件上传提示与错误、提及 / 引用建议。
 * 「Saved replies」「Attach files」「Add files」「Paste, drop, or click to add files」「Leave a comment」
 * 「Styling with Markdown is supported」及部分上传错误由其它词典的 static 收录。
 */

/** 被附加内容的类型（There was an error creating your PullRequest.） */
const SUBJECTS: Readonly<Record<string, string>> = {
  Issue: '议题',
  PullRequest: '拉取请求',
  Discussion: '讨论',
  Release: '发行版',
  Comment: '评论',
  Commit: '提交',
  Gist: '代码片段'
}

/** Markdown 编辑器视图模式 */
const MODES: Readonly<Record<string, string>> = {
  edit: '编辑',
  preview: '预览',
  hybrid: '混合'
}

/** 经典 Markdown 工具栏按钮（aria-label 带快捷键：Add bold text, <Ctrl+b>） */
const TOOLBAR: Readonly<Record<string, string>> = {
  'Add heading text': '添加标题文本',
  'Add bold text': '添加粗体文本',
  'Add italic text': '添加斜体文本',
  'Add a quote': '添加引用',
  'Add code': '添加代码',
  'Add a link': '添加链接',
  'Add a bulleted list': '添加项目符号列表',
  'Add a numbered list': '添加编号列表',
  'Add a task list': '添加任务列表',
  'Add a suggestion': '添加建议'
}
const TOOLBAR_SOURCE = `(${Object.keys(TOOLBAR).join('|')})`

export default {
  static: {
    // 标签页与视图模式
    Write: '写入',
    Hybrid: '混合',
    'View mode': '视图模式',
    'Rendered Markdown Preview': 'Markdown 渲染预览',
    'Nothing to preview': '没有可预览的内容',
    'Error rendering preview': '渲染预览时出错',
    'Markdown preview unavailable': 'Markdown 预览不可用',

    // 工具栏；窄时收起的按钮在溢出菜单里（Primer ActionBar：More <名称> items）
    'Formatting tools': '格式工具',
    'Markdown toolbar': 'Markdown 工具栏',
    'More Markdown toolbar items': '更多 Markdown 工具栏项',
    Heading: '标题',
    'Increase heading level': '提升标题级别',
    'Decrease heading level': '降低标题级别',
    Bold: '粗体',
    Italic: '斜体',
    Strikethrough: '删除线',
    Quote: '引用',
    'Code block': '代码块',
    Link: '链接',
    'Numbered list': '编号列表',
    'Ordered list': '有序列表',
    'Unordered list': '无序列表',
    'Task list': '任务列表',
    Mention: '提及',
    Reference: '交叉引用',
    'Slash commands': '斜杠命令',
    Attachment: '附件',
    'Add a suggestion': '添加建议',
    'Toggle preview': '切换预览',
    'Add heading text': '添加标题文本',
    'Directly mention a user or team': '直接提及用户或团队',
    'Reference an issue, pull request or discussion': '引用议题、拉取请求或讨论',
    // 小屏工具栏的插入链接对话框
    'Insert Link': '插入链接',
    'Link Text': '链接文本',

    // 编辑器命令说明（键盘快捷方式对话框）
    'Insert a heading': '插入标题',
    'Toggle bold formatting on the selected text': '切换所选文本的粗体格式',
    'Toggle italic formatting on the selected text': '切换所选文本的斜体格式',
    'Insert a block quote': '插入引用块',
    'Insert inline code or a code block': '插入行内代码或代码块',
    'Insert a link': '插入链接',
    'Insert an unordered (bulleted) list': '插入无序（项目符号）列表',
    'Insert an ordered (numbered) list': '插入有序（编号）列表',
    'Insert a task list': '插入任务列表',
    'Insert a mention': '插入提及',
    'Insert a reference': '插入交叉引用',
    'Open the saved replies picker': '打开已保存回复选择器',
    'Toggle between edit and preview modes': '在编辑与预览模式之间切换',

    // 输入框
    'Markdown Editor': 'Markdown 编辑器',
    'Markdown value': 'Markdown 内容',
    'Add a comment': '添加评论',
    Comment: '评论',
    'Add your comment here...': '在此添加评论...',
    'Add your comment here…': '在此添加评论…',
    // 问答讨论的答案输入框
    'Add your answer here...': '在此添加答案...',
    'Use Markdown to format your comment': '使用 Markdown 设置评论格式',
    'Comment can not be empty': '评论不能为空',
    'Update comment': '更新评论',
    'Generating text': '正在生成文本',
    'Write a comment': '编写评论',
    'Add a body': '添加正文',
    'Add your description here...': '在此添加描述...',
    'Add an optional description...': '添加可选描述...',
    'Type your description here…': '在此输入描述…',
    'Text field is empty': '文本框为空',
    "Failed to save comment: Body can't be blank": '保存评论失败：正文不能为空',
    'Markdown is supported': '支持 Markdown',
    'Styling with Markdown is supported.': '支持 Markdown 样式。',
    'is supported': '受支持',
    'The content you are editing has changed. Please copy your edits and exit the editor.':
      '你正在编辑的内容已更改。请复制你的修改并退出编辑器。',
    'The content you are editing has changed. Please copy your edits and refresh the page.':
      '你正在编辑的内容已更改。请复制你的修改并刷新页面。',

    // 评论按钮
    'Close and comment': '关闭并评论',
    'Reopen and comment': '重新打开并评论',
    'Reopen with comment': '评论并重新打开',

    // 混合编辑器出错：…Please <a>report this error</a> to the team along with…
    'The hybrid Markdown editing experience is temporarily unavailable due to an unknown error. Please':
      '混合 Markdown 编辑器因未知错误暂时不可用。请',
    'report this error': '向团队报告此错误',
    'to the team along with browser console logs, if possible.': '，如有可能请附上浏览器控制台日志。',

    // 已保存回复
    'Select a reply': '选择回复',
    'Create a new saved reply': '新建已保存回复',
    'Search saved replies': '搜索已保存回复',
    'Filter saved replies': '筛选已保存回复',
    'No saved replies': '没有已保存回复',
    // 已保存回复为空时：You can create one in your <a>settings</a>.
    'You can create one in your': '如需创建请前往',

    // 斜杠命令：/code、/details、/saved-replies、/table、/templates
    'Insert a code block formatted for a chosen syntax': '插入按所选语法格式化的代码块',
    'No Syntax': '无语法',
    'Add a details tag to hide content behind a visible heading': '添加 details 标签以将内容折叠在可见标题下',
    'Insert one of your saved replies': '插入一条已保存回复',
    Table: '表格',
    'Add markdown table': '添加 Markdown 表格',
    Columns: '列',
    Rows: '行',
    'Insert one of your issue templates': '插入一个议题模板',
    'issue templates': '议题模板',
    'No issue templates': '没有议题模板',
    'Add a markdown alert to emphasize important information': '添加 Markdown 提示块以强调重要信息',

    // 附件上传
    'Add Files': '添加文件',
    'Drop to add files': '拖放以添加文件',
    'Uploading your file...': '正在上传文件...',
    'Uploading your file…': '正在上传文件…',
    'Uploading your files...': '正在上传文件...',
    'This video is too big.': '此视频过大。',
    'Failed to get image size from file': '无法获取图片尺寸',
    'Inaccessible attachments': '无法访问的附件',
    'Try again with a file that’s not empty.': '请使用非空文件重试。',
    "Try again with a file that's not empty.": '请使用非空文件重试。',
    'Try again with another file.': '请使用其他文件重试。',
    'File contents don’t match the file extension.': '文件内容与扩展名不符。',
    "File contents don't match the file extension.": '文件内容与扩展名不符。',
    // File type .exe not supported. See the <a>documentation</a> for supported file types.
    'for supported file types.': '了解支持的文件类型。',

    // 自动补全建议
    'Autocomplete suggestions': '自动补全建议',
    'Loading autocomplete suggestions…': '正在加载自动补全建议…',
    'Filter emoji': '筛选表情符号'
  },
  regexp: [
    [/^Markdown input: (edit|preview|hybrid) mode selected\.$/, (_, mode: string) => `Markdown 输入：已选择${MODES[mode]!}模式。`],
    [/^Heading ([1-6])$/, '$1 级标题'],
    [new RegExp(`^${TOOLBAR_SOURCE}, <([^<>]+)>$`), (_, label: string, keys: string) => `${TOOLBAR[label]!}，<${keys}>`],
    // 斜杠命令 /table 的行列数
    [/^([1-9]\d?) (columns?|rows?)$/, (_, count: string, unit: string) => `${count} ${unit.startsWith('c') ? '列' : '行'}`],

    // 上传进度与错误
    [/^Uploading your files\.\.\. \((\d+)\/(\d+)\)$/, '正在上传文件... ($1/$2)'],
    [/^Uploading "(.+)"(\.\.\.|…)$/, '正在上传“$1”$2'],
    [/^Failed to upload "(.+)"$/, '“$1”上传失败'],
    [/^File types? (.+) not supported\. See the$/, '不支持文件类型 $1。请参阅'],
    [
      /^Try again with ([A-Z0-9, ]+) or ([A-Z0-9]+)\.$/,
      (_, types: string, last: string) => `请改用 ${types.split(', ').join('、')} 或 ${last} 格式的文件重试。`
    ],
    // 附件类型错误：We don’t support that file type. <a>Try again</a> with a GIF, JPEG, or PNG.
    [
      /^with an? ((?:[A-Z0-9]+, )*[A-Z0-9]+,? or [A-Z0-9]+|[A-Z0-9]+)\.$/,
      (_, list: string) => `并改用 ${list.replace(/,? or /, ' 或 ').replace(/, /g, '、')} 格式的文件。`
    ],
    [/^Please upload a picture smaller than ([\d,]+x[\d,]+)\.$/, '请上传小于 $1 的图片。'],
    [
      /^There was an error creating your (Issue|PullRequest|Discussion|Release|Comment|Commit|Gist)\.$/,
      // 类型译文与中文之间按需补空格：创建代码片段时出错。
      (_, subject: string) => joinCjk(joinCjk('创建', SUBJECTS[subject] ?? subject), '时出错。')
    ],
    [
      /^(\d[\d,]*) attachments? in your text may not be visible to all the viewers of the repository due to being from a repository with restricted access\.$/,
      '你文本中的 $1 个附件来自访问受限的存储库，可能并非对此存储库的所有查看者可见。'
    ],

    // 表情符号建议：smile emoji
    [/^([a-z0-9_+-]+) emoji$/, '$1 表情符号']
  ]
} satisfies PageDictionary
