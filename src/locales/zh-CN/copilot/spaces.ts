import type { PageDictionary } from '../../../core/types'

/**
 * Copilot 空间（Spaces）：空间列表页、新建 / 编辑 / 复制空间、所有者选择、颜色与图标、文件树选择器、
 * 聊天输入框中的空间选择器。产品名按 product-names.md 译出：Copilot Spaces → Copilot 空间。
 */
export default {
  static: {
    // 空间列表（/copilot/spaces）
    'Search spaces': '搜索空间',
    'Filter spaces': '筛选空间',
    'Space options': '空间选项',
    'Start your first space': '创建你的第一个空间',
    'Spaces you create will appear here.': '你创建的空间会显示在这里。',
    'Need help? Read the docs': '需要帮助？阅读文档',
    "Produce code that follows your team's patterns.": '生成遵循团队模式的代码。',
    'Produce code that follows your team’s patterns.': '生成遵循团队模式的代码。',
    'Centralize docs so your team can quickly find answers.': '集中管理文档，让团队快速找到答案。',
    'Create requirements and issues your team can ship.': '编写团队可交付的需求和议题。',
    'Spaces organize your files, pull requests, issues, and standards so Copilot can give more relevant help for your work.':
      '空间可整理你的文件、拉取请求、议题和规范，让 Copilot 为你的工作提供更相关的帮助。',
    'Spaces are available in VS Code! Get started using Spaces with the GitHub MCP server.':
      'VS Code 中现已支持空间！通过 GitHub MCP 服务器开始使用空间。',
    'Try Spaces in VS Code': '在 VS Code 中试用空间',
    'Copilot Spaces documentation': 'Copilot 空间文档',
    // 旧版空间介绍
    'Set context once. Chat again and again': '设置一次上下文。反复聊天',
    'Create and share a custom Copilot experience using a collection of GitHub repositories, files, and other content.':
      '使用一组 GitHub 存储库、文件和其他内容，创建并分享自定义的 Copilot 体验。',
    'Spaces lets you create shared research environments where you and your team can collaborate, explore topics, and exchange insights—all powered by AI-driven search and summarization.':
      '借助空间，你可以创建共享的研究环境，与团队一起协作、探索主题并交流洞察——这一切都由 AI 驱动的搜索和总结提供支持。',

    // 新建空间
    'New Space': '新建空间',
    'New space': '新建空间',
    'Create space': '创建空间',
    'Create Space': '创建空间',
    'Edit space': '编辑空间',
    'Manage space': '管理空间',
    'Share space': '分享空间',
    'Duplicate space': '复制空间',
    'Duplicate Space': '复制空间',
    'Space settings': '空间设置',
    'Delete space': '删除空间',
    'Are you sure you want to delete this space? This action cannot be undone.': '确定要删除此空间吗？此操作无法撤销。',
    'Some resources will not be duplicated': '部分资源不会被复制',
    'Private resources owned by': '归属于',
    'will not be duplicated to the new space.': '的专用资源不会复制到新空间。',
    'Error saving space': '保存空间出错',
    'Something went wrong while saving.': '保存时出错。',
    'Space name': '空间名称',
    'Choose a name that describes your project or use case': '选择能描述项目或用途的名称',
    'Memorable name that helps you find your space.': '便于你找到空间的易记名称。',
    'Space owner. Required. Selected owner: @': '空间所有者。必填。已选所有者：@',
    'Where we will store your space. Once created the space is not transferable.': '空间的存储位置。创建后无法转让。',
    'Pick a color to make your space more recognizable.': '选择颜色，让空间更易识别。',
    'Select a color': '选择颜色',
    'Filter colors': '筛选颜色',
    'Displays beneath the title on your spaces overview page without impacting responses.': '显示在空间概述页的标题下方，不影响回复。',
    'Changes how Copilot responds on specific questions or tasks.': '改变 Copilot 回答特定问题或处理任务的方式。',
    // 描述、说明输入框的占位符
    "Add a short description to explain this space's purpose (e.g., 'Frontend design system' or 'API docs hub').":
      '添加简短描述，说明此空间的用途（例如“前端设计系统”或“API 文档中心”）。',
    'Define Copilot’s role, focus, and what to avoid in this space. Ex. “You are a [role]. Follow our [framework/patterns] to [type of task]. Avoid [practices or tools] unless specified”.':
      '定义 Copilot 在此空间中的角色、关注点和需要避免的事项。例如：“你是 [角色]。遵循我们的 [框架/模式] 来 [任务类型]。除非另有说明，否则避免 [做法或工具]”。',
    'Add text, code files, or GitHub data to set a permanent context': '添加文本、代码文件或 GitHub 数据以设置持久上下文',
    "You've exceeded the size limit for this space. Remove some references to continue.": '已超出此空间的大小上限。请删除部分引用后继续。',
    'The size of the space exceeds the current limit': '空间大小超出当前上限',
    'Copilot Space not found': '未找到 Copilot 空间',
    'Copilot Space SSO error': 'Copilot 空间 SSO 错误',
    // 空间不存在页
    'Space not found': '未找到空间',
    "This URL may be incorrect, you're signed out of your organization, or the Space may have been deleted.":
      '此 URL 可能有误，你可能已退出组织登录，或空间可能已被删除。',

    // 空间资源（来源）
    'Add sources': '添加来源',
    'Add instructions': '添加说明',
    'Add a text file': '添加文本文件',
    'Give the file a title': '为文件添加标题',
    'Enter content here': '在此输入内容',
    'Resource actions': '资源操作',
    'View all attachments': '查看所有附件',
    "One or more files can't be submitted:": '一个或多个文件无法提交：',
    'One or more files can’t be submitted:': '一个或多个文件无法提交：',
    'File extensions': '文件扩展名',
    'No extension': '无扩展名',
    // 添加来源菜单（带存储库名的 Add files from <owner/repo> 见 regexp）
    'Add files from repository': '从存储库添加文件',
    'Link files, pull requests, and issues': '链接文件、拉取请求和议题',
    'Upload a file': '上传文件',
    'Add text content': '添加文本内容',
    // 来源区、对话区的空状态
    'Add sources to get started': '添加来源以开始使用',
    'Provide files, docs, issues, or repositories so Copilot can give more relevant answers.':
      '提供文件、文档、议题或存储库，让 Copilot 给出更相关的回答。',
    'Start a new conversation in this space by typing in the input box at the top.': '在顶部输入框中输入内容，在此空间开始新对话。',

    // 文件树选择器：最多 <N> 个文件可同时添加。
    'Add files, folders...': '添加文件、文件夹...',
    'Add files, folders…': '添加文件、文件夹…',
    'Select folders and files': '选择文件夹和文件',
    'files can be added at a time.': '个文件可同时添加。',
    'Fetching files...': '正在获取文件...',
    "Couldn't load.": '无法加载。',
    "This file can't be submitted:": '此文件无法提交：',
    'This file was filtered out:': '此文件已被过滤：',
    "These files can't be submitted:": '这些文件无法提交：',
    'These files were filtered out:': '这些文件已被过滤：',
    '. Only supported file types are allowed.': '。仅允许受支持的文件类型。',

    // 空间选择器
    'Recent spaces': '最近的空间',
    // 聊天附件菜单的空间入口
    'Spaces…': '空间…'
  },
  scoped: {
    'Never mind': '取消',
    Directory: '目录',
    File: '文件',
    'Go to file': '转到文件',
    'An unknown error occurred': '发生未知错误',
    // 空间列表的分组与用途卡片
    Yours: '你的',
    'Shared with me': '与我共享',
    'Owned by': '归属于',
    'Generate code': '生成代码',
    'Share knowledge': '共享知识',
    'Plan projects': '规划项目',
    // 空间表单与分享
    Icon: '图标',
    'Color:': '颜色：',
    Content: '内容',
    Size: '大小',
    Sources: '来源',
    'Up to': '最多',
    Viewer: '查看者',
    Editor: '编辑者',
    'Can view': '可查看',
    'Can edit': '可编辑',
    // 空间颜色
    auburn: '赤褐色',
    blue: '蓝色',
    brown: '棕色',
    coral: '珊瑚色',
    cyan: '青色',
    gray: '灰色',
    green: '绿色',
    indigo: '靛蓝色',
    lemon: '柠檬黄',
    lime: '青柠色',
    olive: '橄榄色',
    orange: '橙色',
    pine: '松绿色',
    pink: '粉色',
    plum: '梅红色',
    purple: '紫色',
    red: '红色',
    teal: '蓝绿色',
    yellow: '黄色'
  },
  regexp: [
    [/^Private resources owned by (.+) will not be duplicated to the new space\.$/, '归属于 $1 的专用资源不会复制到新空间。'],
    [/^(\d+) entries not shown$/, '另有 $1 项未显示'],
    [/^(\d+) \/ (\d+) possible sources selected, add fewer files\.$/, '已选择 $1 / $2 个可用来源，请减少文件。'],
    [
      /^Up to (\d+) (files|items) can be added at a time\.$/,
      (_, count: string, kind: string) => `一次最多可添加 ${count} ${kind === 'files' ? '个文件' : '项'}。`
    ],
    [/^Add files from ([\w.-]+\/[\w.-]+)$/, '从 $1 添加文件']
  ]
} satisfies PageDictionary
