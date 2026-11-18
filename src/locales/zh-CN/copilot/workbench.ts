import type { PageDictionary } from '../../../core/types'

/** 差异预览中新增、删除文件的前缀 */
const FILE_CHANGE: Readonly<Record<string, string>> = {
  Added: '已添加',
  Deleted: '已删除'
}

/** 预览工具栏的文件大小：「504 bytes」→「504 字节」，KB / MB 等单位原样保留 */
function previewSize(size: string): string {
  return size.replace(/^(\d+) bytes?$/, '$1 字节')
}

/**
 * Copilot 沉浸式聊天的工作台（内容预览面板）与资源面板：文件 / 差异 / 图片 / Markdown 预览、
 * Copilot 起草议题的预览与批量创建、聊天中的议题列表卡片，以及工件查看器（HTML 预览、版本历史记录、链接）。
 */
export default {
  static: {
    // 工作台
    Workbench: '工作台',
    'Workbench items': '工作台条目',
    'Open workbench': '打开工作台',
    'Close workbench': '关闭工作台',
    'Collapse workbench': '折叠工作台',
    'Expand workbench': '展开工作台',
    'Download all files': '下载所有文件',
    'Close all tabs': '关闭所有标签页',
    'Press Delete to close the focussed tab.': '按 Delete 键关闭当前聚焦的标签页。',
    'Content preview': '内容预览',
    'Content preview panel': '内容预览面板',
    'View files directly within Copilot': '直接在 Copilot 中查看文件',
    'Ask to generate a file or app, or use the button below to try it yourself.': '让 Copilot 生成文件或应用，或使用下方按钮亲自试试。',
    'Files, diffs, and issues you open will appear here.': '你打开的文件、差异和议题会显示在这里。',
    'I’m feeling lucky': '手气不错',
    "I'm feeling lucky": '手气不错',

    // 资源面板
    'Open resource panel': '打开资源面板',
    'Close resource panel': '关闭资源面板',
    'Unable to load repository files': '无法加载存储库文件',
    'Select a repository to view files': '选择存储库以查看文件',
    'Loading repository...': '正在加载存储库...',
    'Loading repository…': '正在加载存储库…',

    // 文件与差异预览
    'file contents': '文件内容',
    'original file contents': '原始文件内容',
    'modified file contents': '修改后的文件内容',
    'unified diff view': '统一差异视图',
    'Open file in a new tab': '在新标签页中打开文件',
    'Download code': '下载代码',
    'Reload preview page': '重新加载预览页面',
    'Switch to the latest version to edit this file.': '切换到最新版本以编辑此文件。',
    // 编辑文件后的提示：你已编辑 <文件名>，后接撤销 / 还原按钮
    'You’ve edited': '你已编辑',
    "You've edited": '你已编辑',
    "HTML preview isn't available here": '此处无法预览 HTML',
    'HTML preview isn’t available here': '此处无法预览 HTML',
    "You can still read the file's source in the Code view.": '仍可在代码视图中查看文件源码。',
    'You can still read the file’s source in the Code view.': '仍可在代码视图中查看文件源码。',
    'Loading image…': '正在加载图片…',
    'Unable to load': '无法加载',
    '. The image may no longer exist or you may not have access.': '。图片可能已不存在，或你无权访问。',
    'Failed to load markdown preview': '加载 Markdown 预览失败',
    'Loading Markdown preview…': '正在加载 Markdown 预览…',
    'Markdown rendering failed': 'Markdown 渲染失败',
    'Refresh the page or check the markdown code': '请刷新页面或检查 Markdown 代码',
    'raw markdown contents': 'Markdown 原始内容',
    'Failed to load job results': '加载作业结果失败',
    'No mermaid code to preview': '没有可预览的 Mermaid 代码',
    'Mermaid diagram loading': '正在加载 Mermaid 图表',
    'Mermaid diagram rendered output container': 'Mermaid 图表渲染输出容器',
    'Image not available': '图片不可用',
    'No details available.': '没有可用的详细信息。',
    'Code insights': '代码见解',
    'Find matches across our platform.': '在整个平台中查找匹配项。',
    'Find matches across our platform or check for code vulnerabilities.': '在整个平台中查找匹配项或检查代码漏洞。',
    'Similar to public code': '与公共代码相似',
    'No code matches found.': '未找到匹配的代码。',
    '1 similar code snippet found': '找到 1 个相似的代码片段',

    // 工件查看器：HTML 预览、版本历史记录、链接
    'Open artifacts': '打开工件',
    'More artifacts': '更多工件',
    'Copy artifact content': '复制工件内容',
    'HTML artifact view': 'HTML 工件视图',
    'HTML preview settings': 'HTML 预览设置',
    'Show preview by default': '默认显示预览',
    'Automatically run HTML artifacts when you open them.': '打开 HTML 工件时自动运行。',
    'Previewing runs this code, which may send its contents to external sites.': '预览会运行此代码，可能会将其内容发送到外部网站。',
    'Artifact HTML preview.': '工件 HTML 预览。',
    'Artifact HTML source': '工件 HTML 源码',
    'HTML rendering failed': 'HTML 渲染失败',
    'Refresh the page or check the HTML': '请刷新页面或检查 HTML',
    'Loading edit history…': '正在加载编辑历史记录…',
    'Unable to load edit history': '无法加载编辑历史记录',
    'No version history available': '没有可用的版本历史记录',
    'Unable to add link': '无法添加链接',
    'Unable to update link': '无法更新链接',
    'Use a full URL, like https://github.com/owner/repo.': '请使用完整 URL，例如 https://github.com/owner/repo。',
    'Enter a valid URL that starts with http:// or https://.': '请输入以 http:// 或 https:// 开头的有效 URL。',
    'Slack conversation': 'Slack 对话',
    'Artifact names must be 255 characters or fewer, start and end with a letter or number, and contain only letters, numbers, spaces, periods, hyphens, and underscores.':
      '工件名称不得超过 255 个字符，须以字母或数字开头和结尾，且只能包含字母、数字、空格、句点、连字符和下划线。',

    // 起草议题：按钮与确认
    'Review and update': '审查并更新',
    'Review and create': '审查并创建',
    'Update existing issues?': '更新现有议题？',
    // 原文按钮名无引号，译文不加引号，后接“按钮”
    'Clicking Update will update the relationships between the issues shown below.': '单击更新按钮将更新下方议题之间的关系。',
    'Update issues': '更新议题',
    'Create all linked draft issues?': '创建所有链接的草稿议题？',
    "Clicking Create will publish all Copilot draft issues shown below. Existing sub-issues aren't displayed and remain unchanged.":
      '单击创建按钮将发布下方所有 Copilot 草稿议题。现有子议题不会显示，也不会更改。',
    'Clicking Create will publish the Copilot draft issues shown below.': '单击创建按钮将发布下方的 Copilot 草稿议题。',
    'These drafts are linked. Creating a sub-issue automatically publishes its parent and any nested drafts.':
      '这些草稿相互链接。创建子议题时会自动发布其父议题及所有嵌套草稿。',
    'Create 1 issue': '创建 1 个议题',
    'Fill out missing required fields to create all of these issues.': '填写缺少的必填字段后才能创建这些议题。',
    'Validating issues': '正在验证议题',
    'Validation errors': '验证错误',
    'New sub-issues': '新子议题',
    'Select a template': '选择模板',
    'This repository requires all issues to have a template. To create this issue, first select the appropriate template from the template dropdown.':
      '此存储库要求所有议题都使用模板。要创建此议题，请先从模板下拉菜单中选择合适的模板。',
    'Repository required': '需要存储库',
    'Please select a repository above to continue creating your issue.': '请在上方选择存储库以继续创建议题。',
    'Copilot failed to use the issue template, retrying…': 'Copilot 未能使用议题模板，正在重试…',
    'Copilot failed to create an issue': 'Copilot 创建议题失败',
    'Copilot failed to use the issue template. Please retry or choose a different template.':
      'Copilot 未能使用议题模板。请重试或选择其他模板。',
    'Issues are disabled': '议题已禁用',
    'Issues are disabled on this repository. Please select a different repository above to continue creating your issue.':
      '此存储库已禁用议题。请在上方选择其他存储库以继续创建议题。',
    'Issues are disabled on this repository. Please select a different repository above to continue updating your issue.':
      '此存储库已禁用议题。请在上方选择其他存储库以继续更新议题。',
    'You cannot create issues in this repository': '你无法在此存储库中创建议题',
    'You cannot update issues in this repository': '你无法更新此存储库中的议题',
    'Open issue in new tab': '在新标签页中打开议题',
    'Please verify if the repository exists and is accessible before trying again.': '请确认存储库存在且可访问后再重试。',

    // 起草议题：关系与模板
    'Newly blocked by': '新增被阻止关系',
    'Newly blocking': '新增阻止关系',
    'Remove dependency': '删除依赖关系',
    'Remove the blocking dependency from the issue': '删除议题的阻止依赖关系',
    'Unlink the sub-issue from its parent issue': '取消子议题与父议题的链接',
    'Unlink sub-issue': '取消链接子议题',
    'Removing template…': '正在删除模板…',
    'Remove the template': '删除模板',

    // 起草议题：错误
    'Project update failed': '项目更新失败',
    'Assignment failed': '分配失败',
    'Failed to update labels': '更新标签失败',
    'Could not update issue labels. Please try again.': '无法更新议题标签。请重试。',
    'Could not update issue assignees. Please try again.': '无法更新议题受理人。请重试。',
    'Could not assign Copilot to the issue. Please try again.': '无法将 Copilot 分配到议题。请重试。',
    'Failed to update milestone': '更新里程碑失败',
    'Could not update issue milestone. Please try again.': '无法更新议题里程碑。请重试。',
    'Could not update issue type. Please try again.': '无法更新议题类型。请重试。',
    'Failed to update projects': '更新项目失败',
    'Could not update project assignments. Please try again.': '无法更新项目分配。请重试。',
    'Failed to update content': '更新内容失败',
    'Could not update issue title or body. Please try again.': '无法更新议题标题或正文。请重试。',
    'Permission Denied': '权限被拒绝',
    "You don't have permission to update this issue. Please contact the repo owner.": '你无权更新此议题。请联系存储库所有者。',
    'Issue Not Found': '未找到议题',
    'The issue you are trying to update could not be found or no longer exists.': '找不到要更新的议题，或该议题已不存在。',
    'Invalid issue title': '议题标题无效',
    'Invalid form inputs': '表单输入无效',
    'Issue Outdated': '议题已过时',
    'The issue you are editing has changed. Please copy your edits and have Copilot draft a new update.':
      '你正在编辑的议题已更改。请复制你的编辑内容，并让 Copilot 起草新的更新。',
    'Failed to update project assignment': '更新项目分配失败',
    'The issue was updated successfully, but there were problems with project assignments.': '议题已成功更新，但项目分配出错。',
    'An error has occurred': '发生错误',
    'Malformed draft issue': '草稿议题格式错误',
    'The drafted issue contains malformed data and the preview is not available. Please retry.':
      '起草的议题包含格式错误的数据，无法预览。请重试。',
    'Errors in issue creation': '创建议题时出错',
    'Validation errors in issue content': '议题内容验证错误',
    'Please select a repository for the issue before creating it.': '创建议题前，请先选择存储库。',
    'Please fix the validation errors in the form': '请修正表单中的验证错误',
    'Project assignment errors': '项目分配错误',
    'Dependency errors': '依赖关系错误',
    'Partial update errors': '部分更新错误',
    'Other errors': '其他错误',
    'Failed to update assignees': '更新受理人失败',
    'Issue title is invalid': '议题标题无效',
    'Issue body is invalid': '议题正文无效',
    'Select Repo': '选择存储库',

    // 聊天中的议题列表卡片
    'Closed issue': '已关闭的议题',
    'Closed draft issue': '已关闭的草稿议题',
    'Task queued': '任务已排队',
    'Task pending': '任务待处理',
    'Task running': '任务运行中',
    'Task completed': '任务已完成',
    'Task waiting for user input': '任务等待用户输入',
    'Task failed': '任务失败',
    'Task cancelled': '任务已取消',
    'Task inactive': '任务未活动',
    'Unknown task': '未知任务',
    'Unknown issue': '未知议题',
    'Assignee avatar': '受理人头像',
    'Draft a PR comment': '起草 PR 评论',
    'Turn this PR review point into a comment.': '将此 PR 审查要点转为评论。',
    'Insert into the input': '插入到输入框'
  },
  scoped: {
    Unassigned: '未分配',
    Layout: '布局',
    Unified: '统一',
    Split: '拆分',
    'Is blocking': '阻止',
    // 预览工具栏的行数单位：整段由 regexp 翻译，未命中时逐节点兜底
    lines: '行',
    line: '行',
    // 工件查看器
    Artifacts: '工件',
    Current: '当前',
    Source: '源码',
    'Edit history': '编辑历史记录',
    'Unknown user': '未知用户',
    'Back to issue': '返回议题',
    'Add link': '添加链接',
    'Edit link': '编辑链接',
    'Link title': '链接标题'
  },
  regexp: [
    [/^Opened (.+) in Workbench\.$/, '已在工作台中打开 $1。'],
    [/^Create (\d+) issues$/, '创建 $1 个议题'],
    [/^Saved (\d+) issues$/, '已保存 $1 个议题'],
    [/^Issue update failed: (\d+) operations failed$/, '议题更新失败：$1 项操作失败'],
    [/^Use the ([\w.-]+\/[\w.-]+) repository$/, '使用 $1 存储库'],
    [/^Changing template to '(.+)'…$/, '正在将模板更改为“$1”…'],
    [/^Use the '(.+)' template$/, '使用“$1”模板'],
    [/^([\w.-]+\/[\w.-]+) is not found$/, '未找到 $1'],
    [
      /^You cannot create more than (\d+) new issues at a time\. Please remove some draft issues from the tree and try again\.$/,
      '一次最多只能创建 $1 个新议题。请从树中删除部分草稿议题后重试。'
    ],
    [
      /^You cannot add more than (\d+) levels of sub-issues\. Please remove some issues from the tree and try again\.$/,
      '子议题最多只能有 $1 层。请从树中删除部分议题后重试。'
    ],
    [
      /^The selected repository \(([\w.-]+\/[\w.-]+)\) doesn['’]t match the repository Copilot suggested \(([\w.-]+\/[\w.-]+)\)\. Please select a repository you have access to\.$/,
      '所选存储库 ($1) 与 Copilot 建议的存储库 ($2) 不一致。请选择你有权访问的存储库。'
    ],
    [/^View file: (.+)$/, '查看文件：$1'],
    // 文件 / 差异预览工具栏：[Added: |Deleted: ]<12> lines · <1 KB>（相邻文本节点整段匹配；新增、删除的文件带前缀）
    [
      /^(?:(Added|Deleted): )?(\d+) lines? · (\S.*)$/,
      (_, change: string, count: string, size: string) =>
        `${change ? `${FILE_CHANGE[change] ?? change}：` : ''}${count} 行 · ${previewSize(size)}`
    ],
    [/^Issue #(\d+)$/, '议题 #$1'],
    [/^(\d+) assignees?$/, '$1 个受理人'],
    [/^Show (\d+) more$/, '再显示 $1 个'],
    [/^(\d+) similar code snippets found$/, '找到 $1 个相似的代码片段'],
    [/^Public code references from (\d+) repositor(?:y|ies)$/, '来自 $1 个存储库的公共代码引用'],
    [/^(\d+) vulnerabilit(?:y|ies) detected$/, '检测到 $1 个漏洞'],
    [/^Image not available: (.+)$/, '图片不可用：$1'],
    [/^Draft a PR comment for: (.+)$/, '起草 PR 评论：$1'],
    [/^Send suggestion \(hold (Option|Alt) to insert\)$/, '发送建议（按住 $1 键插入）'],
    // 工件查看器
    [/^Version (\d+)$/, '版本 $1'],
    [/^HTML preview: (.+)$/, 'HTML 预览：$1']
  ]
} satisfies PageDictionary
