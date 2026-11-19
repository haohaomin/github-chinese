import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 工具调用汇总：动词 */
const FILE_VERB: Readonly<Record<string, string>> = {
  Edited: '编辑了',
  Created: '创建了',
  Read: '读取了',
  Listed: '列出了'
}

/** 工具调用汇总：计数动词 + 单位 */
const COUNT_VERB: Readonly<Record<string, readonly [string, string]>> = {
  Searched: ['搜索了', '次'],
  'Searched the web': ['在网页上搜索了', '次'],
  Fetched: ['获取了', '个网页'],
  Ran: ['运行了', '个技能'],
  Asked: ['提出了', '个问题']
}

/** 工具显示名（工具调用标题“工具名: 参数”） */
const TOOL_NAME: Readonly<Record<string, string>> = {
  'Run Bash command': '运行 Bash 命令',
  'View file': '查看文件',
  'Edit file': '编辑文件',
  'Create file': '创建文件',
  Search: '搜索',
  'Search code': '搜索代码',
  'Find files': '查找文件',
  'Apply patch': '应用补丁',
  'Web search': '网页搜索',
  'Web fetch': '网页获取',
  'Fetch URL': '获取 URL',
  Thinking: '思考',
  'Commit changes': '提交更改',
  'Progress update': '进度更新',
  'Start next task': '开始下一个任务',
  'Propose work': '提议工作',
  'Proposed work': '提议的工作',
  Subagent: '子智能体',
  'Read agent': '读取智能体',
  'Message agent': '向智能体发送消息'
}

/** 不是文件名的常见词（避免把 “Read more” 之类当成工具调用汇总） */
const NOT_FILE = '(?!(?:more|less|only|by|from|on|at|in|to|for|the|a|an|all|this|that|it|here|now|yet)(?: |$))'

/** 工具调用汇总的开头部分 */
const SUMMARY_HEAD = [
  `(?:Edited|Created|Read|Listed) ${NOT_FILE}\\S+(?: and \\S+|, \\S+, and \\d+ more (?:files?|director(?:y|ies)))?`,
  '(?:Searched the web|Searched|Fetched|Ran|Asked) \\d+ (?:quer(?:y|ies)|pages?|skills?|questions?)',
  'Updated plan',
  'Used \\d+ tools?',
  'Ran .+?'
].join('|')

/** 按次数汇总的工具调用 */
const TIMES_VERB: Readonly<Record<string, string>> = {
  Search: '搜索',
  'Search code': '搜索代码',
  'Web search': '网页搜索',
  Thought: '思考',
  'Read agents': '读取智能体',
  'Message agents': '向智能体发送消息',
  'List agents': '列出智能体'
}

/** 按数量汇总的工具调用：原文模板 → 译文模板（# 为数量） */
const COUNT_ACTION: Readonly<Record<string, string>> = {
  'Apply # patches': '应用 # 个补丁',
  'Edit # files': '编辑 # 个文件',
  'Create # files': '创建 # 个文件',
  'View # files': '查看 # 个文件',
  'Undo # edits': '撤销 # 处编辑',
  'Fetch # URLs': '获取 # 个 URL',
  'Commit # changes': '提交 # 次更改',
  'Review # changes': '审查 # 次更改',
  'Activate # skills': '激活 # 个技能',
  'Reply to # comments': '回复 # 条评论',
  'Run # subagent tasks': '运行 # 个子智能体任务'
}

const COUNT_ACTION_SOURCE = Object.keys(COUNT_ACTION)
  .map(key => key.replace('#', '\\d+'))
  .join('|')

const TOOL_NAME_SOURCE = Object.keys(TOOL_NAME)
  .sort((a, b) => b.length - a.length)
  .join('|')

function summaryHead(head: string): string {
  const many = /^(Edited|Created|Read|Listed) (\S+), (\S+), and (\d+) more (files?|director(?:y|ies))$/.exec(head)
  if (many) {
    const unit = many[5]!.startsWith('file') ? '文件' : '目录'
    return `${FILE_VERB[many[1]!]} ${many[2]}、${many[3]} 及另外 ${many[4]} 个${unit}`
  }
  const two = /^(Edited|Created|Read|Listed) (\S+) and (\S+)$/.exec(head)
  if (two) return `${FILE_VERB[two[1]!]} ${two[2]} 和 ${two[3]}`
  const one = /^(Edited|Created|Read|Listed) (\S+)$/.exec(head)
  if (one) return `${FILE_VERB[one[1]!]} ${one[2]}`
  const counted = /^(Searched the web|Searched|Fetched|Ran|Asked) (\d+) (?:quer(?:y|ies)|pages?|skills?|questions?)$/.exec(head)
  if (counted) {
    const [verb, unit] = COUNT_VERB[counted[1]!] ?? [counted[1]!, '']
    return `${verb} ${counted[2]} ${unit}`
  }
  if (head === 'Updated plan') return '更新了计划'
  const used = /^Used (\d+) tools?$/.exec(head)
  if (used) return `使用了 ${used[1]} 个工具`
  const ran = /^Ran (.+)$/.exec(head)
  return ran ? `运行了 ${ran[1]}` : head
}

/** 压缩对话时删除的内容：N token(s)、N message(s)，或二者以 and 相连 */
function removedParts(removed: string): string {
  return removed
    .split(' and ')
    .map(part => part.replace(/^([\d.,]+[kKmM]?) tokens?$/, '$1 个令牌').replace(/^([\d.,]+[kKmM]?) messages?$/, '$1 条消息'))
    .join('和 ')
}

/**
 * Copilot 智能体会话日志：工具调用标题与汇总、计划审查、权限请求、问答、差异面板、后台 shell / 子智能体、
 * 取消 / 超时 / 出错状态、附件预览、内置工具（Playwright、GitHub MCP、Slack、Teams）的显示名。
 */
export default {
  static: {
    // 时间线
    'Session timeline': '会话时间线',
    'Conversation turn queued for sending': '对话轮次已排队等待发送',
    '· Only you can see this session': '· 仅你可以查看此会话',
    'Stop session': '停止会话',
    'Run Bash command': '运行 Bash 命令',
    'Create file': '创建文件',
    'Find files': '查找文件',
    'Apply patch': '应用补丁',
    'Web search': '网页搜索',
    'Fetch URL': '获取 URL',
    'Commit changes': '提交更改',
    Thinking: '思考中',
    'Channel session history': '频道会话历史记录',
    'User message': '用户消息',
    'Assistant response': '助手回复',
    'Time elapsed in this turn': '本轮已用时间',
    'Input requested': '请求输入',
    'Unanswered in saved history': '保存的历史记录中未回答',
    'Referenced content was not included in the saved history:': '引用的内容未包含在保存的历史记录中：',
    'Reasoning complete': '推理完成',
    'Waiting for confirmation': '正在等待确认',
    'Conversation compacted': '对话已压缩',
    'Conversation compacted.': '对话已压缩。',
    "Couldn't compact the conversation.": '无法压缩对话。',
    'Persisted subagent history is unavailable.': '已保存的子智能体历史记录不可用。',
    ', intermediate steps': '，中间步骤',
    'No logs to display': '没有可显示的日志',
    'There was an error loading the logs. Please try again later.': '加载日志时出错。请稍后重试。',
    'No events to display': '没有可显示的事件',
    'There’s no activity to show for this session.': '此会话没有可显示的活动。',
    'This session’s environment is offline. Its history will be available in an upcoming release.':
      '此会话的环境已离线。其历史记录将在后续版本中提供。',
    'Error parsing tool call arguments': '解析工具调用参数出错',
    'Subagent prompt': '子智能体提示',

    // 取消、超时、出错
    'Session cancelled': '会话已取消',
    'Session error': '会话出错',
    'Session timed out': '会话超时',
    'Session aborted': '会话已中止',
    'The session was cancelled.': '会话已取消。',
    "The session was cancelled because you don't have enough AI credits to continue. Top up your quota or wait for it to reset to start a new session.":
      '由于 AI 额度不足，会话已取消。请充值配额或等待配额重置后再开始新会话。',
    "The session was cancelled because you don't have enough AI credits to continue. Contact your organization admin to request additional usage.":
      '由于 AI 额度不足，会话已取消。请联系组织管理员申请额外使用量。',
    'The session timed out before work could be completed. For more details, see the detailed logs in GitHub Actions.':
      '会话在工作完成前超时。如需了解详细信息，请查看 GitHub 操作中的详细日志。',
    'An unexpected error occurred. For more details, see the detailed logs in GitHub Actions.':
      '发生意外错误。如需了解详细信息，请查看 GitHub 操作中的详细日志。',
    'Aborted by user': '已被用户中止',
    'The session disconnected. Retry to connect.': '会话已断开。请重试连接。',
    'This session does not support live changesets.': '此会话不支持实时变更集。',

    // 工具调用
    'Running tool call': '正在运行工具调用',
    'Ran tool call': '已运行工具调用',
    'Updated plan': '更新了计划',
    'Tool result': '工具结果',
    'Tool output': '工具输出',
    'Tool execution failed': '工具执行失败',
    'Authentication is required to continue.': '需要身份验证才能继续。',
    'Run shell command': '运行 shell 命令',
    'Run command': '运行命令',
    'Run PowerShell command': '运行 PowerShell 命令',
    'List PowerShell sessions': '列出 PowerShell 会话',
    'List Bash sessions': '列出 Bash 会话',
    Thought: '思考',
    'Progress update': '进度更新',
    'Reply to comment': '回复评论',
    'File deleted': '文件已删除',
    'Renamed from': '重命名自',
    '(from': '（来自',
    'Edit file(s)': '编辑文件',
    'Task complete': '任务完成',
    'Create draft pull request': '创建草稿拉取请求',
    'List agents': '列出智能体',
    'Insert lines at': '插入行于',
    'Undo edit': '撤销编辑',
    'with matches': '有匹配项',
    'Propose work': '提议工作',
    'Searched the codebase': '已搜索代码库',
    'Setting up environment': '正在设置环境',
    'Custom setup step': '自定义设置步骤',
    'Run custom setup step': '运行自定义设置步骤',
    'Read pull request': '读取拉取请求',
    'Get pull request': '获取拉取请求',
    'Get diff': '获取差异',
    'Get status': '获取状态',
    'Get changed files': '获取已更改的文件',
    'Get reviews': '获取审查',
    'Get review comments': '获取审查评论',
    'Get comments': '获取评论',
    'Review changes with Copilot code review': '使用 Copilot 代码审查来审查更改',
    'Run CodeQL security scan on changed files': '对已更改的文件运行 CodeQL 安全扫描',
    'Check changes with Copilot code review and CodeQL': '使用 Copilot 代码审查和 CodeQL 检查更改',
    'Create a draft pull request': '创建草稿拉取请求',
    'Created a draft pull request': '已创建草稿拉取请求',
    'Could not create a draft pull request': '无法创建草稿拉取请求',
    'Could not create a draft pull request.': '无法创建草稿拉取请求。',
    'No pull request was created.': '未创建拉取请求。',
    'Create a repository': '创建存储库',
    'Could not create a repository': '无法创建存储库',
    'Creates a pull request for the current workspace branch, using the captured branch status and change summary.':
      '使用捕获的分支状态和更改摘要，为当前工作区分支创建拉取请求。',
    'The user declined to create the pull request.': '用户拒绝创建拉取请求。',
    'Pull request creation was cancelled.': '已取消创建拉取请求。',
    'Timed out waiting for the pull request to be created.': '等待创建拉取请求超时。',
    'Copilot finished without creating a pull request. Check the chat for details.':
      'Copilot 已完成，但未创建拉取请求。请在聊天中查看详细信息。',
    'Display GitHub references': '显示 GitHub 引用',
    'Could not display the GitHub references': '无法显示 GitHub 引用',
    'Displayed the GitHub references': '已显示 GitHub 引用',
    'GitHub references': 'GitHub 引用',
    'External resource': '外部资源',
    'Preview of the viewed file': '所查看文件的预览',
    'Screenshot captured by the browser automation tool': '浏览器自动化工具截取的屏幕截图',
    'Generated image': '生成的图片',
    // 标题后接查询词：GitHub 搜索失败 <query>
    'GitHub search failed for': 'GitHub 搜索失败',
    'Searching GitHub for': '正在 GitHub 上搜索',
    'Searched GitHub for': '已在 GitHub 上搜索',
    'Collapse section': '折叠部分',
    'Expand section': '展开部分',
    'Collapse diff content': '折叠差异内容',

    // 日志条目的无障碍标签
    'File edit:': '文件编辑：',
    'CLI output:': 'CLI 输出：',
    'Copilot thought:': 'Copilot 思考：',
    'File creation:': '文件创建：',
    'View file:': '查看文件：',
    'Web search:': '网页搜索：',
    'Web fetch:': '网页获取：',
    'Find files:': '查找文件：',
    'Custom setup run:': '自定义设置运行：',
    'Propose work:': '提议工作：',
    'Code review:': '代码审查：',
    'CodeQL scan:': 'CodeQL 扫描：',
    'Create pull request:': '创建拉取请求：',
    'Parallel validation:': '并行验证：',
    'Read agent:': '读取智能体：',
    'Message agent:': '向智能体发送消息：',
    'List agents:': '列出智能体：',
    'Tool output:': '工具输出：',
    'MCP tool:': 'MCP 工具：',

    // 计划审查
    'Plan ready for review': '计划待审查',
    'View full plan': '查看完整计划',
    'Review plan in full Copilot view': '在完整 Copilot 视图中审查计划',
    'Suggest changes': '建议更改',
    'Suggest changes...': '建议更改...',
    'Approve plan and start work': '批准计划并开始工作',
    'Accept plan and build on autopilot': '接受计划并以自动驾驶模式构建',
    'Accept plan and build interactively': '接受计划并以交互方式构建',
    'Accept plan and build on autopilot fleet': '接受计划并以自动驾驶集群模式构建',
    'Exit plan mode and I will prompt myself': '退出计划模式并由我自行提示',
    'Copilot will implement the plan end-to-end': 'Copilot 将端到端实现该计划',
    'Copilot will implement the plan autonomously': 'Copilot 将自主实现该计划',
    'Copilot will ask for confirmation at each step': 'Copilot 将在每一步征求确认',
    'You will take over and prompt Copilot yourself': '由你接手并自行提示 Copilot',
    'Run plan across multiple agents in parallel': '由多个智能体并行执行计划',
    'Plan review': '计划审查',
    'Plan approved': '计划已批准',
    'Plan dismissed': '计划已关闭',
    'Exited plan mode': '已退出计划模式',
    'Requested plan changes': '已请求更改计划',
    'User requested changes but did not provide specific feedback.': '用户请求了更改，但未提供具体反馈。',
    'Plan approval is handled by the established session plan surface.': '计划审批由已建立的会话计划界面处理。',
    'Established AHP session plan': '已建立的 AHP 会话计划',

    // 权限请求与问答
    'Waiting for approval': '正在等待批准',
    'Awaiting approval': '等待批准',
    'Request timed out': '请求超时',
    'Blocked by repository policy': '被存储库策略阻止',
    'Blocked by content exclusion policy': '被内容排除策略阻止',
    'No approval rule configured': '未配置审批规则',
    'The user rejected this tool call': '用户拒绝了此工具调用',
    'Action failed': '操作失败',
    'No decision yet': '尚未决定',
    'Allow all edits this session': '本会话中允许所有编辑',
    'Allow for session': '本会话中允许',
    "Allow and don't ask again for": '允许且不再询问',
    'Allow and don’t ask again for': '允许且不再询问',
    // 允许 <mcp> 在本会话中
    'for this session': '在本会话中',
    'Show previous permission request': '显示上一个权限请求',
    'Show next permission request': '显示下一个权限请求',
    'Permission choices': '权限选项',
    'Tool confirmation choices': '工具确认选项',
    'Waiting for the session to confirm your response.': '正在等待会话确认你的回复。',
    'Confirmation response could not be sent.': '无法发送确认回复。',
    'Input required': '需要输入',
    'Answer choices': '回答选项',
    'Type your answer...': '输入你的回答...',
    'Freeform answer': '自由回答',
    'Other (type your answer)': '其他（输入你的回答）',
    'Response submitted': '回复已提交',
    'Checklist item': '清单项',
    'Question table': '问题表格',

    // 差异面板
    'Changed files': '已更改的文件',
    'Changes the agent makes will appear here.': '智能体所做的更改将显示在这里。',
    'No changes found.': '未发现更改。',
    'Loading diff…': '正在加载差异…',
    'Could not load the diff for this file.': '无法加载此文件的差异。',
    'Binary file or no patch available.': '二进制文件或无可用补丁。',
    'File contents are unavailable. Reconnect to the environment to load the diff.': '文件内容不可用。重新连接到环境以加载差异。',
    'Connection lost. Diffs will keep loading automatically once reconnected.': '连接已断开。重新连接后将自动继续加载差异。',
    'Connection restored.': '连接已恢复。',
    'Changed file information is unavailable': '无法获取已更改文件的信息',
    'Changed file information needs refreshing': '已更改文件的信息需要刷新',
    'Some information about changed files may be incomplete. Reconnect to refresh the changed files.':
      '部分已更改文件的信息可能不完整。重新连接以刷新已更改的文件。',
    'Close file tree': '关闭文件树',
    'Resize file tree': '调整文件树大小',
    'File tree position': '文件树位置',
    'Close diff overlay': '关闭差异浮层',
    'Expand all changed files': '展开所有已更改的文件',
    'Collapse all changed files': '折叠所有已更改的文件',
    'Diff view options': '差异视图选项',
    'Unified view': '统一视图',
    'Split view': '拆分视图',
    'Hide whitespace': '隐藏空白',
    'Failed to apply a changeset update.': '应用变更集更新失败。',
    'Failed to subscribe to the changeset.': '订阅变更集失败。',

    // 附件与预览
    'Task artifacts': '任务附件',
    'Show artifacts': '显示附件',
    'Hide artifacts': '隐藏附件',
    'This artifact is unavailable': '此附件不可用',
    'Azure DevOps resource': 'Azure DevOps 资源',
    'No preview available for this file.': '此文件无法预览。',
    'Unable to load the latest content for this file.': '无法加载此文件的最新内容。',
    'Preview is unavailable for this file format.': '此文件格式无法预览。',
    'Preview is unavailable for this binary file.': '此二进制文件无法预览。',
    'This file is too large to preview.': '此文件过大，无法预览。',
    'The repository revision is unavailable.': '存储库修订版本不可用。',
    'This image does not have a supported preview URL.': '此图片没有受支持的预览 URL。',
    'Preview is unavailable for this file format. Download the original file instead.': '此文件格式无法预览。请改为下载原始文件。',
    'Unable to load this file. It may no longer exist or you may not have access.': '无法加载此文件。文件可能已不存在，或你无权访问。',
    'File contents are unavailable.': '文件内容不可用。',
    'Unable to load this uploaded file.': '无法加载此上传的文件。',
    'This file is too large to preview. Download the original file instead.': '此文件过大，无法预览。请改为下载原始文件。',
    'Unable to load this file. Please try again.': '无法加载此文件。请重试。',
    'Repository exploration is unavailable until the conversation owner is known.': '确定对话所有者之前，无法浏览存储库。',
    'Select repository to explore': '选择要浏览的存储库',
    'Close repo explorer': '关闭存储库浏览器',

    // 后台 shell 与子智能体
    'Background activity': '后台活动',
    'Loading output…': '正在加载输出…',
    'No output yet': '暂无输出',
    'No longer updating': '已停止更新',
    'Shell output is no longer available.': 'Shell 输出已不可用。',

    // 内置工具：Playwright
    'Navigate Playwright web browser to a URL': '在 Playwright 浏览器中导航到 URL',
    'Navigate back in Playwright web browser': '在 Playwright 浏览器中后退',
    'Navigate forward in Playwright web browser': '在 Playwright 浏览器中前进',
    'Click element in Playwright web browser': '在 Playwright 浏览器中单击元素',
    'Take screenshot of Playwright web browser': '截取 Playwright 浏览器的屏幕截图',
    'Type in Playwright web browser': '在 Playwright 浏览器中输入',
    'Wait for text to appear/disappear in Playwright web browser': '在 Playwright 浏览器中等待文本出现或消失',
    'Run JavaScript in Playwright web browser': '在 Playwright 浏览器中运行 JavaScript',
    'Take snapshot of page in Playwright web browser': '在 Playwright 浏览器中截取页面快照',
    'Resize Playwright web browser window': '调整 Playwright 浏览器窗口大小',
    'Close Playwright web browser': '关闭 Playwright 浏览器',
    'Press key in Playwright web browser': '在 Playwright 浏览器中按键',
    'Select option in Playwright web browser': '在 Playwright 浏览器中选择选项',
    'Interact with dialog in Playwright web browser': '在 Playwright 浏览器中与对话框交互',
    'Get console messages from Playwright web browser': '获取 Playwright 浏览器的控制台消息',
    'Drag mouse between elements in Playwright web browser': '在 Playwright 浏览器中于元素之间拖动鼠标',
    'Upload file in Playwright web browser': '在 Playwright 浏览器中上传文件',
    'Hover mouse over element in Playwright web browser': '在 Playwright 浏览器中将鼠标悬停在元素上',
    'Get network requests from Playwright web browser': '获取 Playwright 浏览器的网络请求',

    // 内置工具：GitHub MCP
    'Get file contents from GitHub': '从 GitHub 获取文件内容',
    'Get pull request from GitHub': '从 GitHub 获取拉取请求',
    'Get issue from GitHub': '从 GitHub 获取议题',
    'Get pull request changed files from GitHub': '从 GitHub 获取拉取请求已更改的文件',
    'List pull requests on GitHub': '列出 GitHub 上的拉取请求',
    'List branches on GitHub': '列出 GitHub 上的分支',
    'Get pull request diff from GitHub': '从 GitHub 获取拉取请求差异',
    'Get pull request comments from GitHub': '从 GitHub 获取拉取请求评论',
    'Get commit from GitHub': '从 GitHub 获取提交',
    'Search repositories on GitHub': '在 GitHub 上搜索存储库',
    'Search code on GitHub': '在 GitHub 上搜索代码',
    'Get issue comments from GitHub': '从 GitHub 获取议题评论',
    'List issues on GitHub': '列出 GitHub 上的议题',
    'Search pull requests on GitHub': '在 GitHub 上搜索拉取请求',
    'List commits on GitHub': '列出 GitHub 上的提交',
    'Get pull request status from GitHub': '从 GitHub 获取拉取请求状态',
    'Search issues on GitHub': '在 GitHub 上搜索议题',
    'Get pull request reviews from GitHub': '从 GitHub 获取拉取请求审查',
    'Download GitHub Actions workflow run artifact': '下载 GitHub 操作工作流运行产物',
    'Get GitHub Actions job logs': '获取 GitHub 操作作业日志',
    'Get GitHub Actions workflow run': '获取 GitHub 操作工作流运行',
    'Get GitHub Actions workflow run logs': '获取 GitHub 操作工作流运行日志',
    'Get GitHub Actions workflow usage': '获取 GitHub 操作工作流使用情况',
    'List GitHub Actions workflow jobs': '列出 GitHub 操作工作流作业',
    'List GitHub Actions workflow run artifacts': '列出 GitHub 操作工作流运行产物',
    'List GitHub Actions workflow runs': '列出 GitHub 操作工作流运行',
    'List GitHub Actions workflows': '列出 GitHub 操作工作流',
    'Check new dependencies against the GitHub Advisory Database': '对照 GitHub 公告数据库检查新依赖项',
    'Store memory': '存储记忆',
    'Read code': '读取代码',
    'Store comment': '存储评论',
    'Remove comment': '删除评论',
    'Store fix': '存储修复',
    'Skip fix': '跳过修复',
    'Semantic issue search': '语义议题搜索',
    'Search directory': '搜索目录',
    'List directory': '列出目录',
    'Search file': '搜索文件',

    // 内置工具：Slack、Microsoft Teams
    'Post a Slack message': '发布 Slack 消息',
    'Add a Slack reaction': '添加 Slack 反应',
    'Remove a Slack reaction': '删除 Slack 反应',
    'Upload a file to Slack': '上传文件到 Slack',
    'Switch the thread to a different repo': '将对话切换到其他存储库',
    'Create a Slack code channel': '创建 Slack 代码频道',
    "Update a code channel's status and context bar": '更新代码频道的状态和上下文栏',
    "Show a diff in a code channel's diff tab": '在代码频道的差异标签页中显示差异',
    'Show an HTML report in a code channel view tab': '在代码频道的视图标签页中显示 HTML 报告',
    'Archive a Slack code channel': '存档 Slack 代码频道',
    'Post a Microsoft Teams message': '发布 Microsoft Teams 消息',
    'Add a Microsoft Teams reaction': '添加 Microsoft Teams 反应',
    'Remove a Microsoft Teams reaction': '删除 Microsoft Teams 反应',
    'Post an image to Microsoft Teams': '向 Microsoft Teams 发布图片',
    'Switch this conversation to a different repository': '将此对话切换到其他存储库',
    'Show or update the Microsoft Teams task plan': '显示或更新 Microsoft Teams 任务计划',
    'Switch the model for this conversation': '切换此对话的模型',
    'Choose a model for this conversation': '为此对话选择模型'
  },
  scoped: {
    Plan: '计划',
    Revise: '修改',
    Rejected: '已拒绝',
    Accepted: '已接受',
    Declined: '已拒绝',
    Question: '问题',
    Answer: '回答',
    Started: '已开始',
    Output: '输出',
    Input: '输入',
    Removed: '已删除',
    Listed: '已列出',
    Searched: '已搜索',
    Fetched: '已获取',
    Ran: '已运行',
    Asked: '已询问',
    Left: '左侧',
    Right: '右侧'
  },
  regexp: [
    // 工具调用汇总
    [/^(\d+) tool calls?$/, '$1 个工具调用'],
    [/^(\d+) tool calls? failed$/, '$1 个工具调用失败'],
    [
      new RegExp(`^(${SUMMARY_HEAD})(?: and (\\d+) other tool calls?)?(?:, (\\d+) failed)?$`),
      // 原文 and 处无标点：以“及另外”连接；逗号随原文
      (_, head: string, others: string, failed: string) =>
        `${others ? joinCjk(summaryHead(head), `及另外 ${others} 个工具调用`) : summaryHead(head)}${failed ? `，${failed} 个失败` : ''}`
    ],
    [
      /^(Search|Search code|Web search|Thought|Read agents|Message agents|List agents) (\d+) times$/,
      (_, verb: string, count: string) => `${TIMES_VERB[verb] ?? verb} ${count} 次`
    ],
    [
      new RegExp(`^(?:${COUNT_ACTION_SOURCE})$`),
      (match: string) => {
        const count = /\d+/.exec(match)?.[0] ?? ''
        return (COUNT_ACTION[match.replace(count, '#')] ?? '').replace('#', count)
      }
    ],
    [/^Insert at (\d+) locations$/, '在 $1 处插入'],
    [/^(\d+) progress updates$/, '$1 次进度更新'],
    [/^(\d+) operations$/, '$1 项操作'],

    // 工具调用标题
    [new RegExp(`^(${TOOL_NAME_SOURCE}): (.+)$`), (_, tool: string, detail: string) => `${TOOL_NAME[tool] ?? tool}：${detail}`],
    [/^Activate (.+) skill$/, '激活技能 $1'],
    [/^Run "(.+)" custom setup step$/, '运行“$1”自定义设置步骤'],
    [/^Read pull request \((.+)\)$/, '读取拉取请求 ($1)'],
    [
      /^Read pull request(?: \((.+?)\))? on ([\w.-]+\/[\w.-]+)#(\d+)$/,
      (_, method: string, repo: string, number: string) => `读取拉取请求${method ? ` (${method})` : ''} ${repo}#${number}`
    ],
    [/^Call to (.+)$/, '调用 $1'],
    [
      /^(Send input to|Read logs from|Stop) (Bash|PowerShell) session (\S+)$/,
      (_, action: string, shell: string, id: string) =>
        `${action === 'Stop' ? '停止' : action === 'Read logs from' ? '读取' : '向'} ${shell} 会话 ${id}${action === 'Send input to' ? ' 发送输入' : action === 'Read logs from' ? ' 的日志' : ''}`
    ],
    [/^Start or send input to long-running Bash session (\S+)$/, '启动长时间运行的 Bash 会话 $1 或向其发送输入'],
    [/^View logs from long-running Bash session (\S+)$/, '查看长时间运行的 Bash 会话 $1 的日志'],
    [/^Stop long-running Bash session (\S+)$/, '停止长时间运行的 Bash 会话 $1'],
    [/^Couldn['’]t compact the conversation: (.+)$/, '无法压缩对话：$1'],
    [/^Conversation compacted, removing (.+)\.$/, (_, removed: string) => `对话已压缩，删除了 ${removedParts(removed)}。`],
    [/^The model could not run: (.+)$/, '模型无法运行：$1'],
    [/^(.+) could not run: (.+)$/, '$1 无法运行：$2'],
    [
      /^(.+) subagent (timeline|activity)$/,
      (_, name: string, kind: string) => `${name} 子智能体${kind === 'timeline' ? '时间线' : '活动'}`
    ],
    [/^Expand diff to show all (\d+) lines$/, '展开差异以显示全部 $1 行'],
    [/^Collapse (\d+) lines$/, '折叠 $1 行'],
    [/^Show all (\d+) lines$/, '显示全部 $1 行'],
    [/^Created repository ([\w.-]+\/[\w.-]+)$/, '已创建存储库 $1'],
    [/^Loading tools from (.+)\.\.\.$/, '正在从 $1 加载工具...'],
    [
      /^([\w-]+(?:\[bot\])?) (reviewed|commented|requested changes)$/,
      (_, login: string, action: string) =>
        `${login} ${action === 'reviewed' ? '审查了' : action === 'commented' ? '发表了评论' : '请求了更改'}`
    ],
    [/^(\d+) review comments?$/, '$1 条审查评论'],

    // 权限请求
    [/^Allow and don['’]t ask again for (.+)$/, '允许且不再询问 $1'],
    [/^Allow (.+) for this session$/, '本会话中允许 $1'],
    [
      /^Permission request (\d+) of (\d+)(?:: (.+))?$/,
      (_, current: string, total: string, title: string) => `权限请求 ${current}/${total}${title ? `：${title}` : ''}`
    ],
    [/^Question table (\d+) of (\d+)$/, '问题表格 $1/$2'],

    // 差异与输出
    [/^(\d+) files? changed$/, '已更改 $1 个文件'],
    // grep 计数模式的结果头：数字、<span>file|files</span>、with matches 由 mergeText 合并后整句翻译
    [/^(\d+) files? with matches$/, '$1 个文件有匹配项'],
    [/^Could not load the diff for (\d+) files\.$/, '无法加载 $1 个文件的差异。'],
    [/^Could not load the diff for (.+)\.$/, '无法加载 $1 的差异。'],
    [/^Loading diff for (.+)$/, '正在加载 $1 的差异'],
    [/^Exited with code (\d+)$/, '以退出码 $1 退出'],
    [/^(.+) output is no longer updating\.$/, '$1 输出已停止更新。'],
    [/^Open (.+) output$/, '打开 $1 输出'],
    [/^Preview of (.+)$/, '$1 的预览'],
    [/^(\d+) new artifacts? available\.$/, '有 $1 个新附件可用。'],
    [/^Unable to submit messages?$/, '无法提交消息'],
    [/^Copilot finished the session before it could pick up (?:this|these) messages?$/, 'Copilot 在处理该消息前已结束会话']
  ],
  // grep 计数模式的结果头（3 <span>files</span> with matches）：数字与 file、files 分属不同节点，整段合并后匹配
  mergeText: ['.tmp-p-3 > span.fgColor-muted.d-block.text-small']
} satisfies PageDictionary
