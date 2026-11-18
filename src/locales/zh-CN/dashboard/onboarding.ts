import type { PageDictionary } from '../../../core/types'

/**
 * 首页新手引导与推广卡片：新版入门清单、文档与资源卡片、下载推荐、入门视频，
 * 旧版“通过教程项目学习 / 开始编写代码 / 使用行业工具”卡片，以及 GitHub 教育推广。
 * 产品名按用户要求译成中文（.harvest/scratch/followups/product-names.md）：Copilot Chat → Copilot 聊天、
 * GitHub Desktop → GitHub 桌面版、GitHub Pages → GitHub 页面、Codespaces → 代码空间、GitHub Education → GitHub 教育；
 * GitHub、Copilot、Git 与第三方产品名（Visual Studio、VS Code、YouTube）保留。
 */
export default {
  static: {
    // 入门清单
    'You finished your onboarding tasks!': '你已完成入门任务！',
    'Now the real magic begins when you ship something amazing. Continue to check out tutorials, best practices, and docs to get the most out of GitHub.':
      '交付出色作品，真正的精彩才刚开始。继续查看教程、最佳实践和文档，充分用好 GitHub。',
    'Remove from dashboard': '从仪表板删除',
    'Create your first code project': '创建你的第一个代码项目',
    'It’s your own space to experiment, learn, and share code with the world.': '这是你自己的空间，可以尝试、学习，并与世界分享代码。',
    'Introduction to GitHub tutorial': 'GitHub 入门教程',
    'Create a personal README.md': '创建个人 README.md',
    'Blank project': '空白项目',
    'Start a Copilot chat': '开始 Copilot 聊天',
    'Ask Copilot questions about coding or GitHub and get instant help with your first project.':
      '向 Copilot 询问编程或 GitHub 相关问题，为你的第一个项目获得即时帮助。',
    'Complete your profile': '完善个人资料',
    'Add a bio, upload an avatar, and personalize your details — building your social coding presence and connecting with others.':
      '添加简介、上传头像并完善个人信息，打造社交编程形象，与他人建立联系。',
    'Complete profile': '完善个人资料',
    'All tasks completed!': '所有任务已完成！',
    'Item progress': '任务进度',

    // 文档与资源卡片
    'GitHub Documentation': 'GitHub 文档',
    'Help for wherever you are on your journey': '无论处在哪个阶段都能找到帮助',
    'About GitHub and Git': '关于 GitHub 和 Git',
    'How to create your first repository': '如何创建第一个存储库',
    'Creating a pull request': '创建拉取请求',
    'What is GitHub Copilot?': '什么是 GitHub Copilot？',
    'GitHub flow': 'GitHub 流程',
    'Hello World exercise': 'Hello World 练习',
    'Copilot Chat Cookbook': 'Copilot 聊天实用手册',
    'Start with GitHub Docs': '从 GitHub 文档开始',
    'Tutorials · 150+ guides': '教程 · 150+ 篇指南',
    'Getting started playlist': '入门播放列表',
    'Explore community': '探索社区',
    "Browse others' code and open source projects": '浏览他人的代码和开源项目',

    // 下载推荐
    'Download Visual Studio with Copilot': '下载集成 Copilot 的 Visual Studio',
    'Chat with Copilot to build your first website, troubleshoot your code, or guide you through your GitHub journey.':
      '与 Copilot 聊天，搭建你的第一个网站、排查代码问题，或在 GitHub 之旅中获得指引。',
    'Download GitHub for Desktop': '下载 GitHub 桌面版',
    'GitHub Desktop simplifies Git workflows and brings core GitHub features to your desktop, helping developers of all levels focus on building and collaborating effectively.':
      'GitHub 桌面版简化 Git 工作流程，把 GitHub 核心功能带到桌面，帮助各水平的开发人员专注构建、高效协作。',
    "Whether you're new to Git or a seasoned user, GitHub Desktop enables collaboration from your desktop and can simplify your development workflow.":
      '无论你是 Git 新手还是老手，GitHub 桌面版都能让你在桌面上协作，简化开发工作流程。',
    'Visual Studio Code with Copilot': '集成 Copilot 的 Visual Studio Code',
    'Customizable. Contextual. AI-powerful. GitHub Copilot can use your code and custom instructions to code the way you prefer.':
      '可定制，懂上下文，AI 驱动。GitHub Copilot 能结合你的代码和自定义说明，按你喜欢的方式编写代码。',

    // 入门视频
    'GitHub for beginners on YouTube': 'YouTube 上的 GitHub 新手教程',
    "Designed to help you master the basics of GitHub, whether you're new to coding or looking to enhance your version control skills.":
      '帮你掌握 GitHub 基础，无论你是编程新手，还是想提升版本控制技能。',
    'Start playlist': '开始播放',
    'Watch video': '观看视频',
    'Video thumbnail': '视频缩略图',

    // 旧版首页：欢迎与教程项目（分句间的 — 译作 ——，两侧不加空格）
    'The home for all developers — including you.': '所有开发人员的家园——也包括你。',
    'Welcome to your personal dashboard, where you can find an introduction to how GitHub works, tools to help you build software, and help merging your first lines of code.':
      '欢迎来到你的个人仪表板。在这里了解 GitHub 的工作方式，获取构建软件的工具，并在合并第一行代码时获得帮助。',
    'Learn with a tutorial project': '通过教程项目学习',
    'Introduction to GitHub': 'GitHub 入门',
    'Get started using GitHub in less than an hour.': '一小时内上手 GitHub。',
    'Create a site or blog from your GitHub repositories with GitHub Pages.': '使用 GitHub 页面从 GitHub 存储库创建网站或博客。',
    'Code with Copilot': '使用 Copilot 编程',
    'Develop with AI-powered code suggestions using GitHub Copilot, Codespaces, and VS Code.':
      '借助 GitHub Copilot、代码空间和 VS Code 的 AI 代码建议进行开发。',
    // 教程项目 Hello GitHub Actions（同 Introduction to GitHub → GitHub 入门）
    'Hello GitHub Actions': 'GitHub 操作入门',
    'Create a GitHub Action and use it in a workflow.': '创建 GitHub 操作并在工作流中使用。',
    'See more tutorial projects': '查看更多教程项目',

    // 旧版首页：开始编写代码
    'Start writing code': '开始编写代码',
    "A repository contains all of your project's files, revision history, and collaborator discussion.":
      '存储库包含项目的所有文件、修订历史记录和协作者讨论。',
    'name your new repository...': '为新存储库命名...',
    'Anyone on the internet can see this repository': '互联网上的任何人都能看到此存储库',
    'You choose who can see and commit to this repository': '由你决定谁能查看和提交到此存储库',
    // 卡片显示原因：标点随原文，不加冒号
    "You're seeing this because you haven't created a repository in a while.": '你看到此内容是因为你有一段时间没有创建存储库了。',
    "You're seeing this because you haven't used repositories, issues, and pull requests recently.":
      '你看到此内容是因为你最近没有使用存储库、议题和拉取请求。',
    'Repositories that need your help': '需要你帮助的存储库',
    'See more repos with good first issues': '查看更多带有适合新手议题的存储库',

    // 旧版首页：使用行业工具（拉取请求的动词 open → 创建）
    'Use tools of the trade': '使用行业工具',
    "You're seeing this because you haven't opened a pull request in a while.": '你看到此内容是因为你有一段时间没有创建拉取请求了。',
    'Simplify your development workflow with a GUI': '用图形界面简化开发工作流程',
    'Install GitHub Desktop': '安装 GitHub 桌面版',
    'to visualize, commit, and push changes without ever touching the command line.': '，无需命令行即可可视化、提交和推送更改。',
    'Get AI-based coding suggestions': '获取 AI 编程建议',
    'Try GitHub Copilot free for 30 days,': '免费试用 GitHub Copilot 30 天，',
    'which suggests entire functions in real time, right from your editor.': '它能在编辑器中实时建议完整函数。',
    'Write code in your web browser': '在浏览器中编写代码',
    'the github.dev web-based editor': '基于网页的 github.dev 编辑器',
    'from your repository or pull request to create and commit changes.': '，在存储库或拉取请求中创建并提交更改。',
    'Install a powerful code editor': '安装强大的代码编辑器',
    'is a multi-platform code editor optimized for building and debugging software.': '是一款为构建和调试软件而优化的跨平台代码编辑器。',
    'Set up your local dev environment': '设置本地开发环境',
    'set up Git': '设置 Git',
    ', simplify your dev workflow with': '，简化开发工作流程可使用',
    'bring GitHub to the command line': '把 GitHub 带到命令行',

    // 旧版首页：开始使用 GitHub
    'Get started on GitHub': '开始使用 GitHub',
    "You're seeing this because you haven't used GitHub's core features, yet.": '你看到此内容是因为你还没有使用过 GitHub 的核心功能。',
    'Introduce yourself with a profile README': '用个人资料自述文件介绍自己',
    'Share information about yourself by creating a profile README, which appears at the top of your profile page.':
      '创建个人资料自述文件分享你的信息，它会显示在个人资料页顶部。',
    'Follow this exercise to try the GitHub flow': '跟随此练习体验 GitHub 流程',
    'GitHub’s “Hello World” tutorial teaches you essentials, where you create your own repository and learn GitHub’s pull request workflow for creating and reviewing code.':
      'GitHub 的“Hello World”教程讲解基础知识，你将创建自己的存储库，并学习用于创建和审查代码的拉取请求工作流程。',
    "GitHub's “Hello World” tutorial teaches you essentials, where you create your own repository and learn GitHub's pull request workflow for creating and reviewing code.":
      'GitHub 的“Hello World”教程讲解基础知识，你将创建自己的存储库，并学习用于创建和审查代码的拉取请求工作流程。',
    'Try the GitHub flow': '体验 GitHub 流程',
    'About version control and Git': '关于版本控制和 Git',
    'Learn about the version control system, Git, and how it works with GitHub.': '了解版本控制系统 Git，以及它如何与 GitHub 配合使用。',
    'The GitHub Flow': 'GitHub 流程',
    "Adopt GitHub's lightweight, branch-based workflow to collaborate on projects.": '采用 GitHub 基于分支的轻量工作流程协作开发项目。',

    // 旧版新手提示
    'Learn Git and GitHub without any code!': '无需编写代码即可学习 Git 和 GitHub！',
    'Using the Hello World guide, you’ll create a repository, start a branch,': '跟随 Hello World 指南，你将创建存储库、新建分支、',
    'write comments, and open a pull request.': '撰写评论并创建拉取请求。',
    "Let's get started!": '开始吧！',
    'Hide this notice forever': '不再显示此提示',
    'Welcome to GitHub! What’s next?': '欢迎来到 GitHub！下一步做什么？',
    'Tell us about yourself': '介绍一下你自己',
    'Browse interesting repositories': '浏览有趣的存储库',
    'You don’t have any repositories yet!': '你还没有任何存储库！',
    'Create your first repository': '创建你的第一个存储库',
    'Learn more about Git and GitHub': '了解 Git 和 GitHub',

    // GitHub 教育推广
    'Join GitHub Education!': '加入 GitHub 教育！',
    'GitHub Education opens doors to new skills, tools, and a collaborative community eager to drive innovation. Join us and build a foundation for your future in technology.':
      'GitHub 教育为你打开通往新技能、新工具和创新协作社区的大门。加入我们，为你的技术未来打下基础。',
    'Join GitHub Education': '加入 GitHub 教育',
    'Learn. Collaborate. Grow.': '学习。协作。成长。',
    'GitHub Education gives you the tools and community support to take on tech challenges and turn them into opportunities. Your future in tech starts here!':
      'GitHub 教育为你提供工具和社区支持，迎接技术挑战并化为机遇。你的技术未来从这里开始！',
    'Go to GitHub Education': '转到 GitHub 教育'
  },
  scoped: {
    'Getting started': '入门',
    Playlist: '播放列表',
    // 清单进度未拼接时的尾段：<数字>/<数字> + complete
    complete: '已完成',
    // 旧版首页：开始编写代码的表单标签；Use + <the github.dev web-based editor> + from your repository …
    'Repository name': '存储库名称',
    Use: '使用'
  },
  regexp: [
    // 入门清单进度：2/3 completed（新手清单）/ 2/3 complete（共享清单组件）
    [/^(\d+)\/(\d+) completed?$/, '已完成 $1/$2'],
    // 资源卡片：Read · Est. 5m / Watch · 9 videos
    [/^Read · Est\. (\d+)m$/, '阅读 · 约$1 分钟'],
    [/^Watch · (\d+) videos?$/, '观看 · $1 个视频']
  ]
} satisfies PageDictionary
