import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 技能执行中的动作（“An error occurred while …”的后半句） */
const ACTIVE_SKILL: Readonly<Record<string, string>> = {
  'searching Bing': '搜索必应',
  'searching the codebase': '搜索代码库',
  'getting alert': '获取警报',
  'getting data': '获取数据',
  'getting job logs': '获取作业日志',
  'getting discussion': '获取讨论',
  'searching for file': '搜索文件',
  'searching for file changes': '搜索文件更改',
  'searching for support documents': '搜索支持文档',
  'analyzing Figma file': '分析 Figma 文件'
}

/** 日志对象名词 */
const LOG_NOUN: Readonly<Record<string, string>> = {
  job: '作业',
  'workflow run': '工作流运行',
  'pull request': '拉取请求',
  workflow: '工作流'
}

/** 粘贴内容的展开 / 折叠 / 删除 */
const PASTED_ACTION: Readonly<Record<string, string>> = {
  Expand: '展开',
  Collapse: '折叠',
  Remove: '删除'
}

/** 日志对象：job 123 / workflow run 456 / pull request 7 / workflow ci.yml */
function logTopic(topic: string): string {
  const match = /^(job|workflow run|pull request|workflow) (.+)$/.exec(topic)
  if (!match) return topic
  return `${LOG_NOUN[match[1]!] ?? match[1]} ${match[2]}`
}

const ACTIVE_SKILL_SOURCE = Object.keys(ACTIVE_SKILL).join('|')

/** 首页 Copilot 输入框（dashboard/composer）沿用的规则：粘贴代码块的读屏播报，展开在本词典的规则列表末尾，两处引用同一份 */
export const COMPOSER_SHARED_RULES: readonly RegExpRule[] = [
  [/^(?:Code block|Block) (?:pasted|added), (\d+) total$/, '已添加代码块，共 $1 个'],
  [/^(?:Code block|Block) removed, (\d+) (?:left|remaining)$/, '已删除代码块，剩余 $1 个']
]

/**
 * Copilot 聊天的技能 / 工具调用状态（网页搜索、代码搜索、获取文件、作业日志、GitHub API、起草议题等）、
 * 接口错误提示，以及停靠聊天面板按页面给出的推荐问题。
 */
export default {
  static: {
    // 技能状态
    'An error occurred when searching the web': '搜索网页时出错',
    'An error occurred when searching code': '搜索代码时出错',
    'An error occurred when finding a file': '查找文件时出错',
    'An error occurred when finding the file changes': '查找文件更改时出错',
    'An error occurred when fetching alert information': '获取警报信息时出错',
    'An error occurred when fetching discussion': '获取讨论时出错',
    'An error occurred when fetching a commit': '获取提交时出错',
    'An error occurred when fetching data from the GitHub API': '从 GitHub API 获取数据时出错',
    'An error occurred when searching support documents': '搜索支持文档时出错',
    // 未知技能时逐段翻译：执行以下操作时出错 <技能动作>
    'An error occurred while': '执行以下操作时出错',
    'Get file': '获取文件',
    'Get file changes': '获取文件更改',
    'Get alert information': '获取警报信息',
    'Fetching alert information': '正在获取警报信息',
    'Unable to fetch alert information': '无法获取警报信息',
    'Using alert information': '正在使用警报信息',
    'Get discussion': '获取讨论',
    'Get job logs': '获取作业日志',
    'Coming up with a plan': '正在制定计划',
    'Try modifying your query by reframing your question.': '请尝试换种方式提问。',
    'API endpoint returned results successfully': 'API 端点已成功返回结果',
    'API results': 'API 结果',
    'Information on using Copilot in GitHub Support': '在 GitHub 支持中使用 Copilot 的相关信息',
    'Support Search': '支持搜索',
    'Support search': '支持搜索',
    'Retrieving information about alerts': '正在检索警报信息',
    'Including information about alerts': '正在纳入警报信息',
    'Searching for file': '正在搜索文件',
    'Using results of get file': '正在使用获取文件的结果',
    'Searching for file changes': '正在搜索文件更改',
    'Planning response...': '正在规划回复...',
    'Planning response…': '正在规划回复…',
    'Plan created': '计划已创建',
    'Searching for support documents': '正在搜索支持文档',
    'Using results of support search': '正在使用支持搜索的结果',
    'Analyzing Figma file': '正在分析 Figma 文件',
    'Using results of Figma file': '正在使用 Figma 文件的结果',
    'Using the code search agent': '正在使用代码搜索智能体',
    'Using results of code search agent': '正在使用代码搜索智能体的结果',
    'Drafting update': '正在起草更新',
    'Drafted update': '已起草更新',
    'Drafting issue': '正在起草议题',
    'Drafted issue': '已起草议题',
    'Fetching issues': '正在获取议题',
    'Fetching issue': '正在获取议题',
    'Fetched issues': '已获取议题',
    'Fetched issue': '已获取议题',
    'Gathering what I need...': '正在收集所需信息...',
    'Gathered additional information': '已收集更多信息',
    'Gathering agent logs...': '正在收集智能体日志...',
    'Gathered agent logs': '已收集智能体日志',
    'Searching agent sessions...': '正在搜索智能体会话...',
    'Searched agent sessions': '已搜索智能体会话',
    'Searching GitHub': '正在搜索 GitHub',
    'Searched GitHub': '已搜索 GitHub',
    'GitHub search failed': 'GitHub 搜索失败',
    'No result details returned.': '未返回结果详细信息。',
    'Search warnings': '搜索警告',
    'searching Bing': '搜索必应',
    'searching the codebase': '搜索代码库',
    'getting alert': '获取警报',
    'getting data': '获取数据',
    'getting job logs': '获取作业日志',
    'getting discussion': '获取讨论',
    'searching for file': '搜索文件',
    'searching for file changes': '搜索文件更改',
    'searching for support documents': '搜索支持文档',
    'analyzing Figma file': '分析 Figma 文件',
    'Mona and Copilot flying a Hubot-themed spaceship': 'Mona 和 Copilot 驾驶着 Hubot 主题的飞船',
    'Copilot badge': 'Copilot 徽章',
    'First, create a new draft issue. Then ask for additional information to fill out the issue.':
      '首先，创建新的草稿议题。然后询问补充信息以完善议题。',
    'First, create an issue with sub issues. Then ask for additional information to fill out these issues.':
      '首先，创建带子议题的议题。然后询问补充信息以完善这些议题。',

    // 接口错误
    'This message could not be processed.': '无法处理此消息。',
    'You’re not authorized to use Copilot.': '你无权使用 Copilot。',
    "You're not authorized to use Copilot.": '你无权使用 Copilot。',
    'Your usage quota has been exceeded. Please wait for your quota to reset or upgrade your plan.':
      '已超出使用配额。请等待配额重置或升级计划。',
    'Access denied. You do not have permission to view this. For more on scraping GitHub and how it may affect your rights, please review our Terms of Service (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)':
      '拒绝访问。你无权查看此内容。有关抓取 GitHub 及其对你权利的影响，请查阅服务条款 (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)',
    'GitHub API rate limit exceeded. Please wait and try again. For more on scraping GitHub and how it may affect your rights, please review our Terms of Service (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)':
      '已超出 GitHub API 速率限制。请稍后重试。有关抓取 GitHub 及其对你权利的影响，请查阅服务条款 (https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)',
    'Resource not found. Please try again.': '未找到资源。请重试。',
    'Your network connection was interrupted. Please try again.': '网络连接中断。请重试。',
    'Message too large. Please shorten it or remove some references and try again.': '消息过大。请缩短内容或删除部分引用后重试。',
    'Copilot extensions can’t be used in shared conversations. Please unshare the conversation and try again.':
      '分享的对话中无法使用 Copilot 扩展。请取消分享对话后重试。',
    "I'm sorry but there was an error. Please try again.": '抱歉，出现错误。请重试。',

    // 推荐问题：标题
    'What can I ask': '我可以问什么',
    'What does this do': '这有什么用',
    'About this repo': '关于此存储库',
    Summarize: '总结',
    'Main points': '要点',
    Explain: '解释',
    Improve: '改进',
    'What it does': '作用',
    'Explain changes': '解释更改',
    'User comments': '用户评论',
    'Key decisions': '关键决策',
    'Repo overview': '存储库概述',
    'Performance issues': '性能问题',
    'Recent PRs': '最近的 PR',
    'Summarize changes': '总结更改',
    'Help me review': '帮我审查',
    'Identify risks': '识别风险',
    'Create PR': '创建 PR',
    'Walk me through': '带我了解',
    'File structure': '文件结构',
    'Ask questions': '提问',
    'Unresolved feedback': '未解决的反馈',
    // 沉浸式聊天首页的推荐任务：分类与示例
    'Write code': '编写代码',
    'Profile README': '个人资料自述文件',
    'Simple calculator': '简易计算器',
    'Pong game': 'Pong 游戏',
    'Mermaid architecture overview': 'Mermaid 架构概述',
    'Create a profile README': '创建个人资料自述文件',
    'Generate a simple calculator': '生成简易计算器',
    'Make a Pong game': '制作 Pong 游戏',
    'Design a Mermaid architecture overview': '设计 Mermaid 架构概述',
    'My open pull requests': '我的打开的拉取请求',
    'Summarize my latest PR': '总结我最新的 PR',
    'Issues assigned to me': '分配给我的议题',
    'Create a new issue': '创建新议题',
    'Summarize my latest issue': '总结我最新的议题',
    'Basic Git commands': 'Git 基础命令',
    'Git branching': 'Git 分支',
    'Advanced Git commands': 'Git 高级命令',

    // 推荐问题：内容
    'What questions can I ask?': '我可以问哪些问题？',
    'What does this repository do?': '这个存储库是做什么的？',
    'How should I get started exploring this repo?': '我应该如何开始探索这个存储库？',
    'Can you tell me about this repository?': '能介绍一下这个存储库吗？',
    'Summarize this issue.': '总结此议题。',
    'What are the main points being discussed here?': '这里讨论的要点是什么？',
    'Suggest next steps for this issue.': '为此议题建议后续步骤。',
    'Summarize this alert.': '总结此警报。',
    'Explain this file.': '解释此文件。',
    'Summarize this file for me.': '为我总结此文件。',
    'How can I improve this file?': '如何改进此文件？',
    'Explain this code.': '解释这段代码。',
    'How can I improve this code?': '如何改进这段代码？',
    'What does this code do?': '这段代码有什么作用？',
    'Explain these changes.': '解释这些更改。',
    'What does this diff do?': '这个差异有什么作用？',
    'Summarize the changes in this file.': '总结此文件中的更改。',
    'Summarize this pull request.': '总结此拉取请求。',
    'What commits are included in this PR?': '此 PR 包含哪些提交？',
    'Can you tell me about the changes in this PR?': '能介绍一下此 PR 中的更改吗？',
    'Summarize this discussion.': '总结此讨论。',
    'Summarize the comments made by user in a discussion.': '总结讨论中用户发表的评论。',
    'What were some key decisions made in this discussion?': '此讨论中做出了哪些关键决策？',
    'Summarize this discussion. What were some key decisions made in this discussion?': '总结此讨论。此讨论中做出了哪些关键决策？',
    'Summarize the comments made on this discussion.': '总结此讨论中的评论。',
    'Suggest next steps based on this discussion': '根据此讨论建议后续步骤',
    'Why did this job fail?': '此作业为什么失败？',
    'How can I fix this build?': '如何修复此构建？',
    'Explain why this job failed.': '解释此作业失败的原因。',
    'Explain this snippet': '解释这段代码片段',
    'Suggest improvements to this code.': '为这段代码提出改进建议。',
    'Explain this diff': '解释此差异',
    'Why should I enable secret protection?': '为什么要启用机密保护？',
    'What kind of credentials does secret scanning find?': '机密扫描能发现哪些凭据？',
    'What is the impact of leaked secret in one of my repositories?': '存储库中泄露的机密会造成什么影响？',
    'Why should I enable code security?': '为什么要启用代码安全？',
    'What kind of vulnerabilities does code security scanning find?': '代码安全扫描能发现哪些漏洞？',
    'What is the impact of a vulnerability in my repo?': '存储库中的漏洞会造成什么影响？',
    'What is the difference between a Code Security Risk Assessment and a Secret Risk Assessment?':
      '代码安全风险评估和机密风险评估有什么区别？',
    'How is my data used during a Risk Assessment?': '风险评估期间如何使用我的数据？',
    'Who will be notified of findings from a Risk Assessment?': '风险评估的发现会通知谁？',
    'What is the best way to get started with Copilot?': '开始使用 Copilot 的最佳方式是什么？',
    'How do I clone this repository?': '如何克隆此存储库？',
    'How do I revert a commit?': '如何还原提交？',
    'How do I add myself as a reviewer?': '如何将自己添加为审查者？',
    'How do I create a repository?': '如何创建存储库？',
    'How do I create an issue?': '如何创建议题？',
    'How do I filter issues by label?': '如何按标签筛选议题？',
    'What are the most recently updated issues?': '最近更新的议题有哪些？',
    'How do I create a pull request?': '如何创建拉取请求？',
    'How do I filter pull requests by label?': '如何按标签筛选拉取请求？',
    'How do I reopen a closed pull request?': '如何重新打开已关闭的拉取请求？',
    'How do I start a new discussion?': '如何开始新讨论？',
    'How do I filter discussions by category or tag?': '如何按类别或标签筛选讨论？',
    'How do I search for a specific discussion?': '如何搜索特定讨论？',
    'Give me a high level overview of this repo': '概括介绍一下此存储库',
    'What are potential performance issues in this code?': '这段代码可能有哪些性能问题？',
    'Summarize the last 3 merged PRs in this repo': '总结此存储库最近合并的 3 个 PR',
    'Summarize the high level changes made': '概括总结所做的更改',
    'Help me review this pull request': '帮我审查此拉取请求',
    'Help me review this pull request.': '帮我审查此拉取请求。',
    'Identify potential risks from this change.': '找出此更改的潜在风险。',
    'Create a PR to solve this issue.': '创建 PR 来解决此议题。',
    'List and define the functions and variables in this file': '列出并说明此文件中的函数和变量',
    "What's new in Copilot?": 'Copilot 有哪些新功能？',
    'What feedback is unresolved?': '哪些反馈尚未解决？'
  },
  scoped: {
    Debug: '调试',
    Changes: '更改'
  },
  regexp: [
    // 网页 / 支持文档搜索
    [/^An error occurred when searching for “(.+)”$/, '搜索“$1”时出错'],
    [/^Searching the web for “(.+)”$/, '正在网页上搜索“$1”'],
    [/^No web search results for “(.+)” were found$/, '未找到“$1”的网页搜索结果'],
    [/^Using web search results for “(.+)”$/, '正在使用“$1”的网页搜索结果'],
    [/^Searching support documents for “(.+)”$/, '正在搜索与“$1”相关的支持文档'],
    [/^No support documents for “(.+)” were found$/, '未找到与“$1”相关的支持文档'],
    [/^Using support search results for “(.+)”$/, '正在使用“$1”的支持搜索结果'],
    [/^Search for "(.+)" in "(.+)"$/, '在“$2”中搜索“$1”'],
    [/^Search results for "(.+)" in "(.+)"$/, '“$1”在“$2”中的搜索结果'],

    // 文件
    [/^An error occurred when finding “(.+)” in (\S+)$/, '在 $2 中查找“$1”时出错'],
    [/^An error occurred when finding file changes for “(.+)” in (\S+)$/, '在 $2 中查找“$1”的文件更改时出错'],
    [/^File results for “(.+)” in (\S+)$/, '“$1”在 $2 中的文件结果'],
    [/^No files matching “(.+)” in (\S+) were found$/, '在 $2 中未找到与“$1”匹配的文件'],
    [/^No files changes were found for “(.+)” in (\S+)$/, '在 $2 中未找到“$1”的文件更改'],
    [/^Using results for “(.+)” in (\S+)$/, '正在使用“$1”在 $2 中的结果'],
    [/^File changes for (.+) in (\S+)$/, '$2 中 $1 的文件更改'],
    [/^View file (?!changes$)(\S+)$/, '查看文件 $1'],
    [/^View file changes for (\S+)$/, '查看 $1 的文件更改'],
    [/^View directory (\S+)$/, '查看目录 $1'],

    // 讨论、作业日志、API
    [/^Fetching discussion (\d+)$/, '正在获取讨论 $1'],
    [/^Unable to fetch discussion (\d+)$/, '无法获取讨论 $1'],
    [/^Using discussion #(\d+)$/, '正在使用讨论 #$1'],
    [/^Details about discussion #(\d+)$/, '讨论 #$1 的详细信息'],
    [
      /^(Fetching logs for|Unable to fetch logs for|Using logs for|An error occurred when fetching logs for) (.+) in (\S+)$/,
      (_, lead: string, topic: string, repo: string) => {
        const target = `${repo} ${joinCjk('中', logTopic(topic))} 的日志`
        if (lead === 'Fetching logs for') return `正在获取 ${target}`
        if (lead === 'Using logs for') return `正在使用 ${target}`
        if (lead === 'Unable to fetch logs for') return `无法获取 ${target}`
        return `获取 ${target}时出错`
      }
    ],
    [/^Fetching endpoint (\S+)$/, '正在获取端点 $1'],
    [/^Using endpoint (\S+)$/, '正在使用端点 $1'],
    [/^Unable to fetch from (\S+)$/, '无法从 $1 获取'],
    [/^An error occurred when fetching from (\S+)$/, '从 $1 获取时出错'],
    [/^Fetching (\/\S+)$/, '正在获取 $1'],
    [/^Results of (\/\S+)$/, '$1 的结果'],
    // 接口说明由模型生成（英文），原样保留；原文无冒号，译文不加
    [
      /^(Using the GitHub API to|Unable to use the GitHub API to|An error occurred when using the GitHub API to) (.+)$/,
      (_, lead: string, action: string) => {
        if (lead.startsWith('Using')) return `正在通过 GitHub API 执行 ${action}`
        if (lead.startsWith('Unable')) return `无法通过 GitHub API 执行 ${action}`
        return joinCjk(`通过 GitHub API 执行 ${action}`, '时出错')
      }
    ],
    [/^Retrieving (.+) in ([\w.-]+\/[\w.-]+)$/, (_, topic: string, repo: string) => `正在检索 ${repo} ${joinCjk('中的', logTopic(topic))}`],
    [
      /^(Job|Workflow run|Pull request|Workflow) (.+) in ([\w.-]+\/[\w.-]+)$/,
      (_, noun: string, id: string, repo: string) => `${repo} 中的${logTopic(`${noun.toLowerCase()} ${id}`)}`
    ],
    [/^Get file (\S+)$/, '获取文件 $1'],
    [/^Get file changes for (\S+)$/, '获取 $1 的文件更改'],
    [/^Get data from (\S+)$/, '从 $1 获取数据'],
    [/^View search results for (.+)$/, '查看 $1 的搜索结果'],

    // 起草议题与智能体任务
    [/^Drafting update for @([\w.-]+\/[\w.-]+)\/issues\/(\d+)$/, '正在为 $1#$2 起草更新'],
    [/^Drafted update for @([\w.-]+\/[\w.-]+)\/issues\/(\d+)$/, '已为 $1#$2 起草更新'],
    [/^Drafting issue in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中起草议题'],
    [/^Drafted issue in ([\w.-]+\/[\w.-]+)$/, '已在 $1 中起草议题'],
    [/^Fetching metadata from ([\w.-]+\/[\w.-]+)$/, '正在获取 $1 的元数据'],
    [/^Using metadata from ([\w.-]+\/[\w.-]+)$/, '正在使用 $1 的元数据'],
    [/^Creating agent task in ([\w.-]+\/[\w.-]+)$/, '正在 $1 中创建智能体任务'],
    [/^Created agent task in ([\w.-]+\/[\w.-]+)$/, '已在 $1 中创建智能体任务'],
    [/^Researching ([\w.-]+\/[\w.-]+)$/, '正在研究 $1'],
    [/^Research completed for ([\w.-]+\/[\w.-]+)$/, '已完成对 $1 的研究'],
    [new RegExp(`^An error occurred while (${ACTIVE_SKILL_SOURCE})$`), (_, skill: string) => `${ACTIVE_SKILL[skill] ?? skill}时出错`],

    // 其他
    [/^Explain why job (\d+) failed\.$/, '解释作业 $1 失败的原因。'],
    [
      /^([Pp]ositive|[Nn]egative) feedback submitted$/,
      (_, kind: string) => `已提交${kind.toLowerCase() === 'positive' ? '正面' : '负面'}反馈`
    ],
    [/^Are you sure you want to unshare all (\d+) conversations\?$/, '确定要取消分享全部 $1 个对话吗？'],
    [/^Authenticate with SSO to access ([\w.-]+)$/, '通过 SSO 验证以访问 $1'],
    [/^Single sign-on for ([\w.-]+)$/, '$1 的单一登录'],
    [/^(.+) \(opens a new page\)$/, '$1（打开新页面）'],
    [/^Pasted content (\d+)$/, '粘贴的内容 $1'],
    [/^Pasted Image (\d+)$/, '粘贴的图片 $1'],
    [
      /^(Expand|Collapse|Remove) Pasted content (\d+)$/,
      (_, action: string, index: string) => `${PASTED_ACTION[action] ?? action}粘贴的内容 ${index}`
    ],
    [/^Attach Pasted content (\d+) as file$/, '将粘贴的内容 $1 附加为文件'],
    ...COMPOSER_SHARED_RULES
  ]
} satisfies PageDictionary
