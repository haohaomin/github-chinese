import { lookupTable } from '../../../core/table'
import type { PageDictionary, RegExpRule } from '../../../core/types'
import models from './models'

/** 会话列表的筛选标签 / 状态（单词放 scoped，全局导航已有 Working / Idle / Needs attention） */
const PERMISSION_MODE: Readonly<Record<string, string>> = {
  'Always ask': '始终询问',
  Assisted: '辅助',
  'Allow all': '全部允许',
  Interactive: '交互式',
  Autopilot: '自动驾驶',
  Plan: '计划'
}

/** 选择器里的占位值与聊天模式 */
const PICKER_VALUE: Readonly<Record<string, string>> = {
  'Select repository': '选择存储库',
  'Select branch': '选择分支',
  'Loading branch...': '正在加载分支...',
  Personal: '个人',
  Ask: '询问',
  Agent: '代理'
}

/** 日志详细程度 */
const VERBOSITY: Readonly<Record<string, string>> = {
  Minimal: '精简',
  Balanced: '均衡',
  Detailed: '详细'
}

/** 环境状态 */
const ENV_STATUS: Readonly<Record<string, string>> = {
  Online: '在线',
  Offline: '离线',
  Ready: '就绪',
  Degraded: '降级',
  Waking: '唤醒中',
  Draining: '排空中',
  Connecting: '连接中',
  Connected: '已连接',
  Disconnected: '已断开'
}

/** 代理显示名（Copilot、Claude、OpenAI Codex 等，最多 4 个词），避免匹配会话标题等长文本 */
const AGENT_NAME = '[\\w.+-]+(?: [\\w.+-]+){0,3}'

function pickerValue(value: string): string {
  return PICKER_VALUE[value] ?? PERMISSION_MODE[value] ?? value
}

/** 括号：内容含中文用全角，否则用半角并与前文空一格 */
function paren(text: string): string {
  return /[一-鿿]/.test(text) ? `（${text}）` : ` (${text})`
}

/** 任务创建失败横幅的说明（字符串替换）；读屏播报“Task creation failed. <说明>”与首页输入框（dashboard/composer）沿用 */
export const TASK_FAILURE_RULES: readonly (readonly [RegExp, string])[] = [
  [/^Unable to start task for '(.+)'\. Please try again\.$/, '无法为“$1”启动任务。请重试。'],
  [/^Unable to start task for '(.+?)': (.+)$/, '无法为“$1”启动任务：$2']
]

/** models 词典的全局词条（任务创建失败横幅的计费提示从这里取译文） */
const modelText = lookupTable(models.static)

/** 横幅说明：计费提示取 models 词典译文，其余按横幅规则翻译，都不命中时保留原文 */
function translateTaskFailure(description: string): string {
  const billing = modelText(description)
  if (billing !== undefined) return billing
  const rule = TASK_FAILURE_RULES.find(([pattern]) => pattern.test(description))
  return rule ? description.replace(rule[0], rule[1]) : description
}

const composerRules: RegExpRule[] = []

/**
 * 首页 Copilot 输入框（dashboard/composer）与本页共用组件的规则：环境条、任务创建失败横幅、图片附件。
 * 在本词典的规则列表中用 composerRule 原地标出，按列表中的先后顺序收集；两处引用同一份
 */
export const COMPOSER_SHARED_RULES: readonly RegExpRule[] = composerRules

/** 标出首页输入框沿用的规则：原样返回，并收进 COMPOSER_SHARED_RULES */
function composerRule(rule: RegExpRule): RegExpRule {
  composerRules.push(rule)
  return rule
}

/**
 * Copilot 代理：代理会话列表与筛选、会话页头部与详细信息、分享 / 置顶 / 存档 / 删除、引导（steering）限制、
 * 继续于其他客户端、新建任务与分配给代理、任务创建失败的横幅与读屏播报、
 * 代理 / 范围 / 存储库 / 环境 / 权限选择器、授权与第三方代理设置。
 * 页面：/copilot/agents（代理首页）、/{owner}/{repo}/agents（存储库代理页）、
 * /{owner}/{repo}/tasks/{id}（代理会话页）；会话页也出现在拉取请求下（/pull/N/agent-sessions/…），长句放 static。
 */
export default {
  static: {
    // 会话类型与客户端
    'Cloud agents': '云代理',
    'Cloud session': '云端会话',
    'Environment session': '环境会话',
    'CLI session': 'CLI 会话',
    'CLI session connected': 'CLI 会话已连接',
    'Private session connected': '私密会话已连接',
    'Private remote session': '私密远程会话',
    'VS Code session': 'VS Code 会话',
    'VS Code session connected': 'VS Code 会话已连接',
    'JetBrains session': 'JetBrains 会话',
    'JetBrains session connected': 'JetBrains 会话已连接',
    'Copilot in VS Code': 'VS Code 中的 Copilot',
    'Copilot in JetBrains': 'JetBrains 中的 Copilot',
    'Copilot Code Review': 'Copilot 代码审查',
    'Copilot app': 'Copilot 应用',
    'Actions session': '操作会话',
    'Local machine': '本地计算机',
    'New chat session': '新建聊天会话',
    'New remote session': '新建远程会话',
    'Runs on GitHub-managed compute.': '在 GitHub 托管的计算资源上运行。',
    'Runs on a user-managed device — Copilot CLI or an IDE-embedded client (VS Code / JetBrains).':
      '在用户管理的设备上运行——Copilot CLI 或 IDE 内嵌客户端 (VS Code / JetBrains)。',

    // 新建任务
    'New task': '新建任务',
    'Give Copilot cloud agent a background task': '给 Copilot 云代理分配后台任务',
    'Give Copilot a background task to work on': '给 Copilot 分配一个后台任务',
    'Explain this repository and help me understand the codebase': '解释此存储库并帮我理解代码库',
    'Analyze test coverage and add missing tests': '分析测试覆盖率并补充缺失的测试',
    'Create a detailed implementation plan for a feature': '为某个功能制定详细的实现计划',
    'Coding task prompt': '编程任务提示',
    'What would you like to do next?': '接下来想做什么？',
    'Setting up your cloud session…': '正在设置云端会话…',
    'Preparing repository…': '正在准备存储库…',
    'Repository preparation failed.': '存储库准备失败。',
    'Starting agent…': '正在启动代理…',
    'Copilot is working…': 'Copilot 正在工作…',
    'Copilot is working...': 'Copilot 正在工作...',
    'Waking compute…': '正在唤醒计算资源…',
    'Waiting for session…': '正在等待会话…',
    'Waiting for agent to start session...': '正在等待代理开始会话...',
    'Retry starting agent': '重试启动代理',
    'Agent startup did not finish': '代理启动未完成',
    'Task creation failed': '任务创建失败',
    'Task started': '任务已开始',
    'Starting task…': '正在开始任务…',
    'Failed to start task in this environment.': '无法在此环境中启动任务。',
    'Failed to start Chat.': '无法开始聊天。',
    'The selected owner changed. Please submit again.': '所选所有者已更改。请重新提交。',
    'This chat was not submitted. Start a new chat to continue.': '此聊天未提交。请开始新聊天以继续。',
    'Automation task cannot start in Sandbox': '自动化任务无法在沙盒中启动',
    'Go back to the Automations page, then choose Create manually.': '返回自动化页面，然后选择手动创建。',
    'Task cannot start in Sandbox': '任务无法在沙盒中启动',
    'Go back and try again from the previous page.': '返回上一页后重试。',
    'Go back to Automations': '返回自动化页面',
    'Chat is only available for Cloud sessions. Choose a repository to create a task.': '聊天仅适用于云端会话。请选择存储库以创建任务。',
    'Submission error': '提交出错',
    'Startup may already have reached the environment. Restarting may send the first message again.':
      '启动请求可能已到达环境。重新启动可能会再次发送第一条消息。',
    'Startup recovery expired. Restart startup to try again.': '启动恢复已过期。请重新启动以重试。',
    'Startup may have reached the environment. Retry explicitly before sending the first message again.':
      '启动请求可能已到达环境。请先明确重试，再重新发送第一条消息。',
    'Submission status checking is unavailable. Your draft is still available.': '无法检查提交状态。你的草稿仍然保留。',
    'Status unavailable': '状态不可用',
    'Loading status': '正在加载状态',
    'Try asking Copilot to plan before implementing': '试着让 Copilot 先规划再实现',
    'Reference specific files to give Copilot better context': '引用具体文件为 Copilot 提供更好的上下文',
    'You can ask Copilot to explain its approach before making changes': '你可以让 Copilot 在修改前先解释其方案',
    'Add a .github/agents.md file to customize Copilot for your repository': '添加 .github/agents.md 文件，为存储库自定义 Copilot',
    'Copilot can work on multiple tasks in parallel across different repos': 'Copilot 可以在不同存储库中并行处理多个任务',
    'Use the Copilot CLI to start tasks from your terminal': '使用 Copilot CLI 从终端启动任务',
    'Ask Copilot to write tests for its own changes before finishing': '让 Copilot 在完成前为自己的更改编写测试',
    "You can approve or reject Copilot's plan before it starts coding": '你可以在 Copilot 开始编码前批准或拒绝其计划',
    'Spinning up dev environment…': '正在启动开发环境…',
    'Fueling the runtime engines…': '正在为运行时引擎加油…',
    'Clearing the airspace for MCP traffic…': '正在为 MCP 流量清理空域…',
    'Cabin pressure stable. Almost ready…': '舱压稳定。即将就绪…',
    'Reticulating goggles...': '正在调校护目镜...',
    'Calibrating flux capacitor...': '正在校准通量电容器...',
    'Adjusting seatbelt…': '正在调整安全带…',
    'Waiting for clearance from GitHub tower…': '正在等待 GitHub 塔台放行…',
    'Final systems check, standing by…': '最终系统检查，待命中…',
    'Takeoff soon™…': '即将起飞™…',

    // 范围、存储库、环境选择器
    'Start a session': '开始会话',
    'Select session scope for Chat': '选择聊天的会话范围',
    'Scope determines which repositories the session can access': '范围决定会话可以访问哪些存储库',
    'Search user or organizations': '搜索用户或组织',
    'Searching owners': '正在搜索所有者',
    'SSO required': '需要 SSO',
    '(single sign-on required)': '（需要单一登录）',
    'Ask anything across repositories': '跨存储库提问',
    'Work in a repository': '在存储库中工作',
    'Could not load repositories': '无法加载存储库',
    'Searching repositories…': '正在搜索存储库…',
    'Repository selection information': '存储库选择信息',
    'Resolving repository owner': '正在解析存储库所有者',
    'Change Chat scope, current:': '更改聊天范围，当前：',
    'Your repositories and public repositories': '你的存储库和公共存储库',
    'Cloud sessions are disabled by this organization': '此组织已禁用云端会话',
    "Chats can't be run on Actions": '聊天无法在操作上运行',
    'No Mission Control environments available': '没有可用的任务控制中心环境',
    'No custom environments available.': '没有可用的自定义环境。',
    'Set one up': '设置一个',
    'Selected environment is no longer available. Switched to the default environment.': '所选环境已不可用。已切换到默认环境。',
    'Mode: Chat': '模式：聊天',
    'Choose Chat or a repository': '选择聊天或存储库',
    'Start a general chat for Personal or an organization, or select a repository to give Copilot project context.':
      '为个人或组织开始普通聊天，或选择存储库为 Copilot 提供项目上下文。',
    'Start a general chat, or select a repository to give Copilot project context.':
      '开始普通聊天，或选择存储库为 Copilot 提供项目上下文。',
    'Set the session scope': '设置会话范围',
    'Choose Personal or an organization to set which repositories are available to your session.':
      '选择个人或组织，以设置会话可用的存储库。',
    'Choose where Copilot runs': '选择 Copilot 的运行位置',
    'Use the environment picker to run your session in new, fast Cloud sessions or in Actions.':
      '使用环境选择器，在全新快速的云端会话或操作中运行会话。',
    'Branch: None available': '分支：无可用分支',
    'Loading branch...': '正在加载分支...',
    'Loading branches…': '正在加载分支…',
    'Please select a repository and branch.': '请选择存储库和分支。',
    'Please select a valid base branch.': '请选择有效的基础分支。',
    'Spaces can only be attached when starting a new cloud session.': '只能在开始新的云端会话时附加空间。',
    'Could not load spaces': '无法加载空间',
    'Could not select this space. Try again.': '无法选择此空间。请重试。',
    'No space': '无空间',
    'No matching spaces': '没有匹配的空间',
    'No spaces available': '没有可用的空间',
    'Filter spaces by name or owner': '按名称或所有者筛选空间',
    'Find a space': '查找空间',
    'Resolving…': '解析中…',

    // 代理选择器
    'Select an agent': '选择代理',
    'Custom agents': '自定义代理',
    'Custom agent': '自定义代理',
    'Create a custom agent': '创建自定义代理',
    'This repository has no custom agents': '此存储库没有自定义代理',
    'No custom agents available': '没有可用的自定义代理',
    'Custom agents are reusable instructions and tools in your repository.': '自定义代理是存储库中可复用的说明和工具。',
    'Custom agents come from a repository. Select one to use its agents.': '自定义代理来自存储库。选择一个存储库以使用其中的代理。',
    'Loading agents': '正在加载代理',
    'Loading agent': '正在加载代理',
    'Loading agent…': '正在加载代理…',
    'Agent unavailable': '代理不可用',
    'Requires authorization': '需要授权',
    'Your organization has removed access for this agent. Contact your administrator for more information.':
      '你的组织已删除此代理的访问权限。请联系管理员了解详情。',

    // 模式与工具权限
    'Step-by-step collaboration': '逐步协作',
    'Plan first, execute when ready': '先规划，准备好后执行',
    'End-to-end execution without interruption': '不间断地端到端执行',
    'Ask for permission': '请求权限',
    'Run all tools without asking': '无需询问即运行所有工具',
    'Switching mode...': '正在切换模式...',
    'Your mode could not be updated. Please try again.': '无法更新模式。请重试。',
    'Tool permissions': '工具权限',
    'Currently enforced:': '当前强制实施：',
    'Set by this session and cannot be changed here': '由此会话设置且无法在此更改',
    "Not allowed by this session's permission policy.": '此会话的权限策略不允许。',
    'Autopilot works best with fewer approvals': '自动驾驶在审批较少时效果最佳',
    'Continue with Always ask': '继续使用始终询问',
    'Change approval setting': '更改审批设置',
    'Always ask': '始终询问',
    'Require approval for each request.': '每个请求都需要批准。',
    'Automatically approve tool requests that pass an LLM safety check. Ask otherwise.': '自动批准通过 LLM 安全检查的工具请求。否则询问。',
    'Auto-approve all tool, path, and URL requests.': '自动批准所有工具、路径和 URL 请求。',
    'Show the current permission status.': '显示当前权限状态。',
    'Configure tool permissions': '配置工具权限',
    'Configure automatic tool approval': '配置自动批准工具',
    'Auto-approve all tool calls this session': '本会话中自动批准所有工具调用',
    'Stop auto-approving tool calls': '停止自动批准工具调用',
    'Show whether auto-approve is on': '显示是否已开启自动批准',
    'Loading tool permissions': '正在加载工具权限',
    'Tool permissions could not be loaded. Only Always ask is available.': '无法加载工具权限。仅可使用始终询问。',
    "Tool permissions: No options are available for this session, so it can't be started.": '工具权限：此会话没有可用选项，因此无法启动。',
    'No permitted tool permissions are available for this session.': '此会话没有允许的工具权限。',
    'Disabled by your organization. Contact your administrator': '已被你的组织禁用。请联系管理员',
    'Tool permissions are not ready.': '工具权限尚未就绪。',
    'Could not change tool permissions. Try again.': '无法更改工具权限。请重试。',
    'Tool permissions cannot be changed for this session.': '无法更改此会话的工具权限。',
    'Tool permissions are not reported for this session.': '此会话未报告工具权限。',

    // 会话页头部与详细信息
    'Agent session header': '代理会话标题栏',
    'Manage session': '管理会话',
    'Task actions': '任务操作',
    'Toggle sidebar': '切换侧栏',
    'Rename task': '重命名任务',
    'Edit task': '编辑任务',
    'Failed to rename. Please try again.': '重命名失败。请重试。',
    'Failed to rename task. Please try again.': '重命名任务失败。请重试。',
    'Something went wrong renaming the task. Please try again.': '重命名任务时出错。请重试。',
    'Session status': '会话状态',
    'Session ID': '会话 ID',
    'Copy session ID': '复制会话 ID',
    'Environment ID': '环境 ID',
    'Copy environment ID': '复制环境 ID',
    'Host name': '主机名',
    'Copy host name': '复制主机名',
    'Host software': '主机软件',
    'Active sessions': '活动会话',
    'Session spend': '会话花费',
    'Most recent model': '最近使用的模型',
    'Excludes turns not yet loaded': '不含尚未加载的轮次',
    'Status freshness': '状态新鲜度',
    'AHP version': 'AHP 版本',
    'Working directory': '工作目录',
    'Staff session details': '员工会话详细信息',
    'Visible to anyone with access to this repository': '有权访问此存储库的任何人可见',
    'Only visible to you': '仅你可见',
    'Only you can see this session.': '仅你可见此会话。',
    'Remote mode enabled': '已启用远程模式',
    'Learn more about remote session privacy': '了解远程会话隐私',
    'Dismiss remote session banner': '关闭远程会话横幅',
    'Connection is active and ready to use': '连接已激活并可以使用',
    'Anything you do here will be sent to your connected terminal. This session is private to you.':
      '你在此处的任何操作都会发送到已连接的终端。此会话仅你可见。',
    'started a CLI session': '开始了 CLI 会话',
    'started a cloud session': '开始了云端会话',
    'started an environment session': '开始了环境会话',
    'created this session': '创建了此会话',
    'created the session': '创建了会话',
    'started a task': '开始了任务',
    // <login> 发起此会话的渠道为 <Slack> · Copilot
    'started this session via': '发起此会话的渠道为',
    'Session started via': '会话发起渠道为',
    'discussion comment': '讨论评论',
    'pull request comment': '拉取请求评论',
    'pull request review': '拉取请求审查',
    'scheduled trigger': '定时触发',
    'code scanning alert': '代码扫描警报',
    'secret scanning alert': '机密扫描警报',
    'Dependabot alert': 'Dependabot 警报',
    'merge conflict': '合并冲突',
    'from the legacy chat': '来自旧版聊天',
    'legacy chat': '旧版聊天',
    'Failed to fetch triggering comment': '获取触发评论失败',
    'Failed to fetch problem statement': '获取问题描述失败',
    'Go to pull request': '转到拉取请求',
    'View pull request': '查看拉取请求',
    'View files changed': '查看已更改的文件',
    'View changes': '查看更改',
    'View changed files': '查看已更改的文件',
    'Collapse changed files': '折叠已更改的文件',
    'Failed to create pull request': '创建拉取请求失败',
    'Error creating pull request': '创建拉取请求出错',
    'View verbose logs': '查看详细日志',
    'Copy original prompt': '复制原始提示',
    'View run': '查看运行',
    'Go to parent conversation': '转到父对话',
    'Open in GitHub Copilot App': '在 GitHub Copilot 应用中打开',
    'Hide intermediate steps': '隐藏中间步骤',
    'Show key steps': '显示关键步骤',
    'Show every tool call': '显示每个工具调用',
    'Tool verbosity': '工具详细程度',

    // 继续于其他客户端
    'Continue in…': '在…中继续',
    'Continue in Copilot CLI': '在 Copilot CLI 中继续',
    'Open in VS Code': '在 VS Code 中打开',
    'Open in VS Code Insiders': '在 VS Code Insiders 中打开',
    'Create a codespace': '创建代码空间',
    'Only session creator can resume': '只有会话创建者可以恢复',
    'Continue this session where it was started': '在开始此会话的位置继续',
    'This session is offline': '此会话已离线',
    'You can view updates here. Start a new session in the cloud to work from the web.':
      '你可以在此查看更新。在云端开始新会话即可在网页上工作。',
    'You can view updates here.': '你可以在此查看更新。',
    'Open this session where it was started to continue, or start a new session in the cloud.':
      '在开始此会话的位置打开它以继续，或在云端开始新会话。',
    'Open this session where it was started to continue.': '在开始此会话的位置打开它以继续。',
    'New cloud session': '新建云端会话',
    'Respond to the agent prompt in your local CLI session to continue.': '请在本地 CLI 会话中回复代理的提示以继续。',

    // 重新连接与只读
    "We couldn't reconnect": '无法重新连接',
    "This session can't be resumed": '此会话无法恢复',
    'Environment authentication is unavailable': '环境身份验证不可用',
    'A Copilot license is required to reconnect this session': '需要 Copilot 许可证才能重新连接此会话',
    'This session requires a newer compatible version of Copilot': '此会话需要更新的兼容版 Copilot',
    'This session is read-only': '此会话为只读',
    'The session could not finish preparing its environment': '会话未能完成环境准备',
    'Try connecting to this session again.': '请再次尝试连接此会话。',
    'The environment it ran in is no longer available. Start a new session in the cloud.': '其运行环境已不可用。请在云端开始新会话。',
    'You can still view its history. To send messages, start a new session in the cloud.':
      '你仍可查看其历史记录。要发送消息，请在云端开始新会话。',
    'Reopen this session after a compatible version of Copilot is available.': '有兼容版本的 Copilot 后，请重新打开此会话。',
    'Check that Copilot access is available, then reopen this session.': '请确认可以访问 Copilot，然后重新打开此会话。',
    'This session is open in read-only mode.': '此会话以只读模式打开。',
    'Resuming session…': '正在恢复会话…',
    'Reconnecting this session and catching up on its conversation.': '正在重新连接此会话并同步对话。',
    'The session connection was lost.': '会话连接已断开。',
    'The active AHP session could not be connected.': '无法连接活动的 AHP 会话。',
    'The live conversation is unavailable. Reconnect to continue.': '实时对话不可用。重新连接以继续。',
    'This conversation is missing valid creation metadata. Retry to load it again.': '此对话缺少有效的创建元数据。请重试加载。',
    'Activity cannot be loaded': '无法加载活动',
    'The activity on this task is temporarily unavailable due to a system error. Try reloading the page, or if the problem persists, contact support.':
      '由于系统错误，此任务的活动暂时不可用。请尝试重新加载页面；如果问题仍然存在，请联系支持。',
    'This task is not viewable': '无法查看此任务',
    'Unable to connect to the session': '无法连接到会话',
    'Environment offline': '环境已离线',
    'Environment is offline': '环境已离线',
    'Environment offline. The environment for this session is offline. Steering will resume when the host reconnects.':
      '环境已离线。此会话的环境已离线。主机重新连接后将恢复引导。',
    'The environment for this session is offline. Steering will resume when the host reconnects.':
      '此会话的环境已离线。主机重新连接后将恢复引导。',
    'First message recovery failed': '首条消息恢复失败',
    'Error loading session.': '加载会话出错。',
    "We couldn't load the session history": '无法加载会话历史记录',
    'Loading session history…': '正在加载会话历史记录…',
    'Opening previous chat…': '正在打开上一个聊天…',

    // 引导（steering）
    'Steering is not available for this session': '此会话不支持引导',
    'Only the session owner can steer this session': '只有会话所有者才能引导此会话',
    'Steer active session while agent is working': '在代理工作时引导当前会话',
    'Steer active turn': '引导当前轮次',
    'Steering Copilot requires an active subscription': '引导 Copilot 需要有效的订阅',
    'Steering Copilot requires an active subscription.': '引导 Copilot 需要有效的订阅。',
    'Only the task owner can steer this session.': '只有任务所有者才能引导此会话。',
    'Sessions created by organizations cannot be steered.': '无法引导由组织创建的会话。',
    'Only the author of the task can ask for changes.': '只有任务作者可以请求更改。',
    'Steering disabled. Contact your administrator to enable steering on local sessions.': '引导已禁用。请联系管理员为本地会话启用引导。',
    'This session has been archived': '此会话已存档',
    'This session has been archived.': '此会话已存档。',
    'You do not have write permission on the repository': '你没有此存储库的写入权限',
    'This pull request was merged. Start a new session to continue iterating.': '此拉取请求已合并。开始新会话以继续迭代。',
    'This pull request was merged. To continue iterating,': '此拉取请求已合并。要继续迭代，请',
    'start a new session': '开始新会话',
    'This pull request was closed. To continue iterating, reopen the pull request.': '此拉取请求已关闭。要继续迭代，请重新打开拉取请求。',
    'This pending prompt has expired. Start a new task to continue.': '此待处理提示已过期。请开始新任务以继续。',
    'Send a message to the CLI session...': '向 CLI 会话发送消息...',
    'Failed to submit latest message': '提交最新消息失败',
    'Failed to submit command. Please try again.': '提交命令失败。请重试。',
    'upgrade your plan': '升级计划',
    'Upgrade your plan': '升级计划',

    // 排队的消息
    'Queued messages': '排队的消息',
    'Message queued': '消息已排队',
    'Message queued. It will be sent after the current response finishes.': '消息已排队。将在当前回复完成后发送。',
    'Queued message removed.': '已删除排队的消息。',
    'Queued message sent now.': '排队的消息已立即发送。',
    'Queued message could not be removed.': '无法删除排队的消息。',
    'Queued message could not be sent now.': '无法立即发送排队的消息。',
    'Queued in saved history.': '已在保存的历史记录中排队。',
    'Queued message waiting for agent': '排队的消息正在等待代理',
    'Remove from queue': '从队列中删除',
    'Removing queued message': '正在删除排队的消息',
    'Sending queued message now': '正在立即发送排队的消息',
    'The message was sent now, but could not be removed from the queue. It may be delivered twice.':
      '消息已立即发送，但无法从队列中删除。可能会重复发送。',
    'Queued for Copilot': '已排队等待 Copilot',
    'Message with attachments': '带附件的消息',
    'Steering message': '引导消息',
    'Steering message waiting for agent': '引导消息正在等待代理',

    // 分享
    'Share session': '分享会话',
    'Session shared': '会话已分享',
    'Session sharing': '会话分享',
    'Sharing settings': '分享设置',
    'This session is private': '此会话为私密会话',
    'This session is visible to anyone with access to this repository who has the link.':
      '有权访问此存储库且获得链接的任何人都可查看此会话。',
    'When shared, this session and future messages will be visible to anyone with repository access as view only.':
      '分享后，有存储库访问权限的任何人都能以只读方式查看此会话及后续消息。',
    'Sharing session...': '正在分享会话...',
    'Unsharing session...': '正在取消分享会话...',
    'Failed to share session. Please try again.': '分享会话失败。请重试。',
    'Failed to unshare session. Please try again.': '取消分享会话失败。请重试。',
    'View shared session (opens in a new tab)': '查看分享的会话（在新标签页中打开）',
    'Your session has expired. Sign in again to change sharing settings.': '会话已过期。请重新登录以更改分享设置。',
    "You don't have permission to access this session's sharing settings.": '你无权访问此会话的分享设置。',
    'This session could not be found or you no longer have access to it.': '找不到此会话，或你已无权访问。',
    'Invalid usage. Use /share, /share link, or /share off.': '用法无效。请使用 /share、/share link 或 /share off。',
    'You must be signed in to share a session.': '必须登录才能分享会话。',
    'Session sharing is not available.': '会话分享不可用。',
    'This session is not attached to a web task and cannot be shared here.': '此会话未关联网页任务，无法在此分享。',
    'Could not load session sharing settings. Please try again.': '无法加载会话分享设置。请重试。',
    'Could not change session sharing settings. Please try again.': '无法更改会话分享设置。请重试。',
    'Session sharing turned off.': '会话分享已关闭。',
    'Session shared with repository readers.': '会话已与存储库读者分享。',
    'Only the task owner can change session sharing settings.': '只有任务所有者可以更改会话分享设置。',
    'Sharing requires a session attached to a repository.': '分享需要关联到存储库的会话。',
    'Sharing settings cannot be changed for this session.': '无法更改此会话的分享设置。',

    // 置顶、存档、删除
    'Pin session': '置顶会话',
    'Unpin session': '取消置顶会话',
    'Session pinned.': '会话已置顶。',
    'Session unpinned.': '已取消置顶会话。',
    'Loading pinned sessions.': '正在加载置顶会话。',
    'Couldn’t update pinned session': '无法更新置顶会话',
    'Couldn’t update the pinned session. Please try again.': '无法更新置顶会话。请重试。',
    'You can pin up to 20 sessions. Unpin a session before pinning another.': '最多可置顶 20 个会话。请先取消置顶一个会话再置顶其他会话。',
    'This session is no longer available to pin. It may have been deleted or you may have lost access.':
      '此会话已无法置顶。可能已被删除或你已失去访问权限。',
    'Archive only': '仅存档',
    'Archive and close': '存档并关闭',
    // 存档确认：Copilot 页由行内句整句翻译（见 inline），其他页面按片段：……在我的会话页面的 <已完成> 标签页中找到并恢复它。
    'This session will be removed from your active sessions. You can find and restore it anytime from the':
      '此会话将从你的活动会话中移除。你可以随时在我的会话页面的',
    'This session has an open pull request. Would you like to close it? You can find and restore this session anytime from the':
      '此会话有一个打开的拉取请求。要关闭它吗？你可以随时在我的会话页面的',
    'tab in My sessions.': '标签页中找到并恢复它。',
    'Failed to archive the session. Please try again.': '存档会话失败。请重试。',
    'The session was archived, but the pull request could not be closed. Please close it manually.':
      '会话已存档，但无法关闭拉取请求。请手动关闭。',
    'The session was unarchived, but the pull request could not be reopened. Please reopen it manually.':
      '会话已取消存档，但无法重新打开拉取请求。请手动重新打开。',
    'Failed to unarchive the session. Please try again.': '取消存档会话失败。请重试。',
    'Delete session': '删除会话',
    'Are you sure you want to delete this session? This action cannot be undone.': '确定要删除此会话吗？此操作无法撤销。',
    'Failed to delete session. Please try again.': '删除会话失败。请重试。',

    // 分配给代理
    'Assign to Agent': '分配给代理',
    'Target repository': '目标存储库',
    'Base branch': '基础分支',
    'Optional prompt': '可选提示',
    'Select base branch': '选择基础分支',
    // 输入框占位文字（原文无冒号）
    'Optionally provide additional context for the agent, like constraints, priorities, or areas to avoid':
      '可为代理提供更多上下文，如约束、优先级或需避免的方面',
    'A new branch will be created based on the selected branch': '将基于所选分支创建新分支',
    'The agent will use the issue description, comments, and any additional prompt you provide to get started. Select a custom agent for specialized tasks.':
      '代理将根据议题描述、评论以及你提供的额外提示开始工作。处理专门任务时可选择自定义代理。',
    "You're assigning the agent to perform work in a different organization. The issue description will be visible to users outside this repository.":
      '你正在分配代理到其他组织中工作。议题描述将对此存储库以外的用户可见。',
    "You're assigning the agent to perform work in a public repository. The issue description will be visible to users outside this repository.":
      '你正在分配代理到公共存储库中工作。议题描述将对此存储库以外的用户可见。',
    "The selected repo has no commits or branches so there's no valid base branch to create a PR against.":
      '所选存储库没有任何提交或分支，没有可用于创建 PR 的有效基础分支。',
    'Insufficient quota. Assignment is temporarily unavailable until additional usage is available.':
      '配额不足。在获得额外使用量前，暂时无法分配。',

    // 授权
    'Authorization required': '需要授权',
    Authenticate: '验证身份',
    'Authorizing…': '授权中…',
    'to complete authentication, then returned here.': '完成身份验证，然后返回此处。',

    // Copilot 设置：dotfiles、存储库访问、第三方代理
    'Failed to save changes': '保存更改失败',
    'Repository access': '存储库访问权限',
    'Failed to update third-party agent settings, please try again later.': '更新第三方代理设置失败，请稍后重试。',
    "Agent installation is blocked because the partner agent's app is already installed": '已安装合作方代理的应用，因此无法安装此代理',
    'Learn more about Claude on GitHub': '了解 GitHub 上的 Claude',
    'Learn more about Codex on GitHub': '了解 GitHub 上的 Codex',
    'Using this alongside the Claude app may cause conflicts or confusion. Since both use "@Claude" for mentions, enabling both may lead to mixed or incorrect responses.':
      '与 Claude 应用同时使用可能导致冲突或混淆。两者都使用“@Claude”提及，同时启用可能导致回复混杂或出错。',
    'Using this alongside the chatgpt-codex-connector app may cause conflicts or confusion. Since both use “@Codex” mentions, enabling both may lead to mixed or incorrect responses.':
      '与 chatgpt-codex-connector 应用同时使用可能导致冲突或混淆。两者都使用“@Codex”提及，同时启用可能导致回复混杂或出错。',

    // 后台云端会话（聊天中的工具）
    'Start a cloud session': '开始云端会话',
    'Start a cloud agent session?': '开始云代理会话？',
    'Start session': '开始会话',
    'Started a cloud agent session': '已开始云代理会话',
    'Failed to start a session': '无法开始会话',
    'Did not start a session': '未开始会话',
    'Open a session': '打开会话',
    'Opened the session': '已打开会话',
    'Failed to open the session': '无法打开会话',
    'List sessions': '列出会话',
    'Listed 1 session': '已列出 1 个会话',
    'Failed to list sessions': '无法列出会话',

    // 文件附件
    'File diff': '文件差异',
    'Code snippet': '代码片段',
    'Workflow job': '工作流作业',
    'Issue (not planned)': '议题（未计划）',
    'Filter views': '筛选视图',
    'Filter views (filters applied)': '筛选视图（已应用筛选器）',
    'Reset filters': '重置筛选器',
    'Collapse question': '折叠问题',
    'Expand question': '展开问题',
    'Shell mode disabled': 'Shell 模式已禁用',
    'Shell mode enabled': 'Shell 模式已启用',
    'Enter shell command': '输入 shell 命令',
    'Shell command': 'Shell 命令',

    // Chronicle 命令
    'Chronicle command suggestions': 'Chronicle 命令建议',
    'View session history and activity': '查看会话历史记录和活动',
    'Get a report on your work from the last day': '获取过去一天的工作报告',
    'Search all session content by keyword or topic': '按关键字或主题搜索所有会话内容',
    'Get personalized tips based on usage patterns': '根据使用模式获取个性化建议',
    'Get personalized tips to reduce token usage and cost': '获取降低令牌使用量和费用的个性化建议',
    'Suggest improvements to copilot-instructions.md': '为 copilot-instructions.md 提出改进建议',

    // 调试日志
    'View debug log': '查看调试日志',
    'Debug log': '调试日志',
    'Debug output': '调试输出',
    'No debug events captured yet.': '尚未捕获调试事件。',
    'Download logs': '下载日志',
    'Debug log copied to the clipboard.': '调试日志已复制到剪贴板。',
    'Could not copy the debug log.': '无法复制调试日志。',
    'Debug log downloaded.': '调试日志已下载。',
    'Could not download the debug log.': '无法下载调试日志。',
    'Bug report created.': '已创建错误报告。',
    'Could not create the bug report.': '无法创建错误报告。',
    'Copy this session’s debug log to the clipboard': '将此会话的调试日志复制到剪贴板',
    'Collect this session’s debug logs': '收集此会话的调试日志',
    'Report a bug — the argument becomes the issue title': '报告错误并以参数作为议题标题',
    'Download the debug log archive': '下载调试日志存档',
    'Add a bug title after /report-bug.': '请在 /report-bug 后添加错误标题。',

    // 引导提示
    'Close tour': '关闭导览',
    'Could not save your dismissal.': '无法保存关闭操作。'
  },
  scoped: {
    // 会话状态与筛选
    Done: '已完成',
    Failed: '失败',
    Cancelled: '已取消',
    'Timed out': '已超时',
    'Ready for review': '可供审查',
    Unsuccessful: '未成功',
    'Queued to merge': '已排队等待合并',
    Running: '运行中',
    Finished: '已完成',
    Connecting: '连接中',
    Connected: '已连接',
    Disconnected: '已断开',
    Unavailable: '不可用',
    Online: '在线',
    Degraded: '降级',
    Waking: '唤醒中',
    Draining: '排空中',
    Resuming: '恢复中',
    // 选择器
    Personal: '个人',
    Cloud: '云端',
    Remote: '远程',
    NEW: '新',
    Unsupported: '不受支持',
    Automation: '自动化',
    Mode: '模式',
    Interactive: '交互式',
    Autopilot: '自动驾驶',
    Assisted: '辅助',
    'Allow all': '全部允许',
    Minimal: '精简',
    Balanced: '均衡',
    Detailed: '详细',
    Shared: '已分享',
    Tokens: '令牌',
    Context: '上下文',
    Sessions: '会话',
    Folder: '文件夹',
    Choices: '选项',
    Background: '后台',
    Step: '步骤',
    Finish: '完成'
  },
  regexp: [
    // 范围、存储库、分支、环境（composerRule：首页输入框沿用）
    composerRule([/^Personal \(([\w.-]+)\)$/, '个人 ($1)']),
    composerRule([/^Select conversation scope, current: (.+)$/, (_, value: string) => `选择对话范围，当前：${pickerValue(value)}`]),
    [/^(\d+) owners?$/, '$1 个所有者'],
    [/^(\d+) repositor(?:y|ies)$/, '$1 个存储库'],
    composerRule([
      /^Repositories in @([\w.-]+)( and public repositories)?$/,
      (_, owner: string, more: string) => `@${owner} 中的存储库${more ? '和公共存储库' : ''}`
    ]),
    composerRule([
      /^Repositories are limited to (.+)\. Change the Chat scope to work in another owner['’]s repositories\.$/,
      (_, owner: string) =>
        `存储库仅限于${owner === 'your personal account' ? '你的个人帐户' : ` ${owner}`}。更改聊天范围以在其他所有者的存储库中工作。`
    ]),
    composerRule([/^Cloud sessions are disabled for ([\w.-]+)$/, '$1 已禁用云端会话']),
    [/^Private repository selection is restricted to ([\w.-]+)\.$/, '专用存储库只能从 $1 中选择。'],
    composerRule([/^Repository: (.+)$/, (_, value: string) => `存储库：${pickerValue(value)}`]),
    composerRule([/^Branch: (.+)$/, (_, value: string) => `分支：${pickerValue(value)}`]),
    composerRule([/^Remove ([\w.-]+\/[\w.-]+)$/, '删除 $1']),
    composerRule([
      /^Environment: (.+?)(?: \((.+)\))?$/,
      (_, name: string, status: string) => `环境：${name === 'Cloud' ? '云端' : name}${status ? paren(ENV_STATUS[status] ?? status) : ''}`
    ]),
    [/^Environment status: (.+)$/, (_, status: string) => `环境状态：${ENV_STATUS[status] ?? status}`],
    [/^(.+) environment details$/, '$1 环境详细信息'],
    composerRule([/^Chat \((.+)\)$/, (_, owner: string) => `聊天${paren(pickerValue(owner))}`]),
    composerRule([/^Mode: Chat \((.+)\)$/, (_, owner: string) => `模式：聊天${paren(pickerValue(owner))}`]),
    composerRule([
      /^Space: (.+)$/,
      (_, name: string) => `空间：${name === 'Resolving…' ? '解析中…' : name === 'No space' ? '无空间' : name}`
    ]),
    composerRule([/^Resolving space: (.+)$/, '正在解析空间：$1']),
    composerRule([/^Space selected: (.+)$/, '已选择空间：$1']),

    // 代理与模式
    composerRule([
      /^(Agent|Custom agent): (.+)$/,
      (_, kind: string, name: string) => `${kind === 'Agent' ? '代理' : '自定义代理'}：${name}`
    ]),
    composerRule([/^Mode: (.+)$/, (_, mode: string) => `模式：${pickerValue(mode)}`]),
    composerRule([
      /^Select (CLI agent|MCP permission) mode, current: (.+)$/,
      (_, kind: string, mode: string) => `选择${kind === 'CLI agent' ? ' CLI 代理' : ' MCP 权限'}模式，当前：${pickerValue(mode)}`
    ]),
    [/^Tool permissions (?:are )?set to “(.+)”\.$/, (_, mode: string) => `工具权限已设为“${pickerValue(mode)}”。`],
    composerRule([
      /^Tool permissions: "(.+)" isn['’]t available for this session\. Choose an available option to continue\.$/,
      (_, mode: string) => `工具权限：“${pickerValue(mode)}”不适用于此会话。请选择可用选项以继续。`
    ]),
    [/^Log verbosity: (Minimal|Balanced|Detailed)$/, (_, level: string) => `日志详细程度：${VERBOSITY[level] ?? level}`],
    [/^Information about the (.+) agent$/, '关于 $1 代理的信息'],
    [
      new RegExp(`^(${AGENT_NAME}) requires authorization( first\\.)?$`),
      (_, agent: string, first: string) => `${agent} 需要${first ? '先' : ''}授权${first ? '。' : ''}`
    ],
    [/^Couldn['’]t start authorization for (.+)\. Please try again\.$/, '无法开始 $1 的授权。请重试。'],

    // 任务与分配
    [/^Creating task in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中创建任务'],
    [/^New agent (?:session|task) in ([\w.-]+\/[\w.-]+)$/, '在 $1 中新建代理会话'],
    ...TASK_FAILURE_RULES.map(composerRule),
    // 任务创建失败的读屏播报：Task creation failed. + 横幅说明
    [/^Task creation failed\. (.+)$/, (_, description: string) => `任务创建失败。${translateTaskFailure(description)}`],
    [/^Assign (\d+) issues to (.+)$/, '将 $1 个议题分配给 $2'],
    [/^Assign (.+) to issue$/, '将 $1 分配给议题'],
    [/^Assignment failed for #(\d+)$/, '#$1 分配失败'],
    [/^Assignment failed for #(\d+) and #(\d+)$/, '#$1 和 #$2 分配失败'],
    [/^Assignment failed for #(\d+), #(\d+) and (\d+) others?$/, '#$1、#$2 及其他 $3 个议题分配失败'],
    [
      /^Instructions must be ([\d,]+) characters or fewer\. Current length: ([\d,]+) characters\.$/,
      '说明不能超过 $1 个字符。当前长度：$2 个字符。'
    ],
    [
      /^Choose which repositories (.+) should be enabled in\. (.+) will only be available where it is enabled for the repository and in the Copilot license policies\.$/,
      '选择要在哪些存储库中启用 $1。仅当存储库已启用且 Copilot 许可证策略允许时，$2 才可用。'
    ],

    // 会话状态与操作
    [new RegExp(`^(${AGENT_NAME}) is working…$`), '$1 正在工作…'],
    [new RegExp(`^(${AGENT_NAME})['’]s work was cancelled$`), '$1 的工作已取消'],
    [new RegExp(`^(${AGENT_NAME}) stopped work due to an error$`), '$1 因出错而停止工作'],
    [new RegExp(`^(${AGENT_NAME}) timed out$`), '$1 已超时'],
    [
      /^Only (.+) can steer this session$/,
      (_, who: string) => `只有${who === 'the session owner' ? '会话所有者' : ` ${who} `}可以引导此会话`
    ],
    [/^Wait until the session is complete before steering (.+) sessions$/, '请等待会话完成后再引导 $1 会话'],
    [/^This session is steered from (.+)$/, '此会话由 $1 引导'],
    [/^Continue the conversation in the originating (.+) channel\.$/, '在原始 $1 频道中继续对话。'],
    [
      /^You can['’]t view this task because you do not have any active sessions( for this pull request)?\.$/,
      (_, forPull: string) => `你无法查看此任务，因为你${forPull ? '在此拉取请求中' : ''}没有任何活动会话。`
    ],
    [/^Remote (.+) session$/, '远程 $1 会话'],
    [/^(.+) session \(read only\)$/, '$1 会话（只读）'],
    [/^(.+?)(?: —)? session details$/, '$1 会话详细信息'],
    [/^Copy branch name (.+)$/, '复制分支名 $1'],
    [/^Context window (.+) used$/, '已使用上下文窗口的 $1'],
    [/^([\d.]+[kM]?) cached$/, '$1 已缓存'],
    [/^([\d.]+[kM]?) reasoning$/, '$1 推理'],
    [/^View PR #(\d+)$/, '查看 PR #$1'],
    [/^(\d+) of (\d+)$/, '$1/$2'],
    [/^(\d+) results?$/, '$1 个结果'],
    [/^(\d+) messages queued$/, '$1 条消息已排队'],
    [/^(\d+) messages queued\. They will be sent after the current response finishes\.$/, '$1 条消息已排队。将在当前回复完成后发送。'],
    [/^Queued message removed: (.+)\.$/, '已删除排队的消息：$1。'],
    [/^(\d+) queued messages removed\.$/, '已删除 $1 条排队的消息。'],
    [/^(\d+) queued messages sent now\.$/, '$1 条排队的消息已立即发送。'],
    [/^(\d+) recent sessions? available for the attached context$/, '附加的上下文有 $1 个最近会话'],
    [/^Listed (\d+) sessions$/, '已列出 $1 个会话'],
    [
      /^Copilot will start a background cloud agent session on ([\w.-]+\/[\w.-]+)( and open a pull request)?\. It works independently of this chat\.$/,
      (_, repo: string, pull: string) => `Copilot 将在 ${repo} 上开始后台云代理会话${pull ? '并创建拉取请求' : ''}。它独立于此聊天运行。`
    ],
    // 代码审查会话的标题：Review of <拉取请求标题>
    [/^Review of (.+)$/, '审查 $1'],
    // 步骤计数（引导弹窗页脚 Step 1 of 3，句末可带句点）：与 repo-settings 的“步骤 N/M”一致
    [/^Step (\d+) of (\d+)(\.?)$/, (_, step: string, total: string, period: string) => `步骤 ${step}/${total}${period ? '。' : ''}`],
    [/^View debug log \((\d+) events?\)$/, '查看调试日志（$1 个事件）'],
    [/^Request failed with status (\d+)(\.)?$/, (_, status: string, period = '') => `请求以状态码 ${status} 失败${period ? '。' : ''}`],
    [
      /^Unknown \/collect-debug-logs option “(.+)”\. Try \/collect-debug-logs download\.$/,
      '未知的 /collect-debug-logs 选项“$1”。请尝试 /collect-debug-logs download。'
    ],
    [
      /^(\S+) needs a repository, and this session doesn['’]t have one\. Start a session from a repository to use it\.$/,
      '$1 需要存储库，但此会话没有存储库。请从存储库开始会话后再使用。'
    ],
    [/^issue #(\d+)$/, '议题 #$1'],
    [/^pull request #(\d+)$/, '拉取请求 #$1'],
    [/^discussion #(\d+)$/, '讨论 #$1'],

    // 附件
    [/^Uploading (.+)$/, '正在上传 $1'],
    [/^Upload of (.+) failed: (.+)$/, '$1 上传失败：$2'],
    [/^Upload failed: (.+)$/, '上传失败：$1'],
    [/^Retry upload of (.+)$/, '重试上传 $1'],
    composerRule([/^Image: (.+)$/, '图片：$1']),
    composerRule([/^Image limit reached \((\d+)\)$/, '已达图片上限 ($1)']),
    composerRule([/^You can attach up to (\d+) images per task$/, '每个任务最多可附加 $1 张图片']),
    composerRule([
      /^(\d+) files could not be attached: (.+)\. Text and PDF files must be (.+) or smaller, and you can attach up to (\d+) text, PDF, or image files at a time\.$/,
      '$1 个文件无法附加：$2。文本和 PDF 文件不能超过 $3，且一次最多可附加 $4 个文本、PDF 或图片文件。'
    ]),
    composerRule([
      /^(.+) could not be attached\. Text and PDF files must be (.+) or smaller, and you can attach up to (\d+) text, PDF, or image files at a time\.$/,
      '无法附加 $1。文本和 PDF 文件不能超过 $2，且一次最多可附加 $3 个文本、PDF 或图片文件。'
    ])
  ],
  // 存档确认对话框（agent-sessions 的 ArchiveConfirmationDialog，正文是 Primer Dialog.Body 的直接子节点）：
  // 仅存档为“文字、{' '} 空格、<strong>Completed</strong>、文字”，有打开的拉取请求时空格在第一段文字末尾。
  // 标签页名由 <strong> 突出，原文无引号，整句翻译后中文之间不留空格
  inline: [
    [
      'This session will be removed from your active sessions. You can find and restore it anytime from the {} tab in My sessions.',
      '此会话将从你的活动会话中移除。你可以随时在我的会话页面的{}标签页中找到并恢复它。'
    ],
    [
      'This session has an open pull request. Would you like to close it? You can find and restore this session anytime from the {} tab in My sessions.',
      '此会话有一个打开的拉取请求。要关闭它吗？你可以随时在我的会话页面的{}标签页中找到并恢复此会话。'
    ]
  ]
} satisfies PageDictionary
