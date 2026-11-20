import type { PageDictionary } from '../../core/types'

/**
 * GitHub 功能介绍页（/features 及子页）：分区标题、功能卡片、Copilot 应用介绍、页尾号召。
 * 产品名按用户要求译成中文（Copilot、Dependabot、GitHub CLI 等品牌名保留）；
 * 页面是 Primer Brand 渲染的 React 页面，被 <b> / <span> 拆开的句子按片段收录。
 */
export default {
  scoped: {
    // 营销头部下拉菜单的分组名（只在本页面类型收录：Build 等短词全站收录会误译用户内容）
    Build: '构建',
    // 页头与分区标题
    'GitHub Features': 'GitHub 功能',
    'Explore the GitHub Platform': '探索 GitHub 平台',
    'See GitHub Copilot': '了解 GitHub Copilot',
    Plan: '规划',
    Review: '审查',
    Ship: '交付',
    'Turn ideas into roadmap items your team can act on.': '将想法转化为团队可执行的路线图项。',
    'Build with Copilot using the right model for every task across any surface.':
      '在任何界面中使用 Copilot 构建，为每项任务选用合适的模型。',
    'Improve every change before it merges.': '在合并前完善每项更改。',
    'Test and deploy every change automatically.': '自动测试和部署每项更改。',
    // 规划：卡片
    'Capture requests, prioritize work, and track progress through delivery.': '收集需求、确定工作优先级，并跟踪进度直至交付。',
    'Plan and track work in flexible tables and boards connected to your code.': '在与代码关联的灵活表格和看板中规划和跟踪工作。',
    'Charts and insights': '图表和洞察',
    'Turn project data into charts that help your team see progress.': '将项目数据转化为图表，帮助团队掌握进度。',
    'Repository insights': '存储库洞察',
    'Understand activity and contribution trends across a repository.': '了解存储库中的活动和贡献趋势。',
    // 代码：GitHub Copilot 应用（标题与「<b>GitHub Copilot app:</b> from issue to merge」）、要点、卡片
    'GitHub Copilot app: from issue to merge': 'GitHub Copilot 应用：从议题到合并',
    'GitHub Copilot app:': 'GitHub Copilot 应用：',
    'from issue to merge': '从议题到合并',
    'Download the app': '下载应用',
    'Delegate to agents.': '委派给智能体。',
    'Start a session from an issue, a prompt, or a PR already in flight.': '从议题、提示或进行中的 PR 启动会话。',
    'Centralized inbox.': '集中式收件箱。',
    'Triage issues and PRs across repos, without leaving the app.': '无需离开应用，即可跨存储库分类处理议题和 PR。',
    'Review and merge.': '审查与合并。',
    'Review diffs, check CI, and fix failing checks. Merge when you’re ready from the same window the agent works in.':
      '审查差异、查看 CI 并修复失败的检查。准备就绪后，直接在智能体工作的同一窗口中合并。',
    "Review diffs, check CI, and fix failing checks. Merge when you're ready from the same window the agent works in.":
      '审查差异、查看 CI 并修复失败的检查。准备就绪后，直接在智能体工作的同一窗口中合并。',
    'Get AI assistance as you write, understand, and improve code.': '在编写、理解和改进代码时获得 AI 帮助。',
    'Plan, build, and debug with Copilot right from your terminal.': '直接在终端中使用 Copilot 进行规划、构建和调试。',
    'Store your code, history, and docs together, with access for your whole team.': '将代码、历史记录和文档存放在一起，供整个团队访问。',
    APIs: 'API',
    'Build integrations and automate work with GitHub data and events.': '利用 GitHub 数据和事件构建集成并自动化工作。',
    'Manage repositories, issues, and pull requests from your terminal.': '在终端中管理存储库、议题和拉取请求。',
    'Visualize changes, commit code, and work with Git from a desktop app.': '在桌面应用中可视化更改、提交代码并使用 Git。',
    // 审查：卡片
    'Propose changes, discuss them with teammates, and merge when ready.': '提出更改、与队友讨论，准备就绪后合并。',
    'Stacked pull requests': '堆叠式拉取请求',
    'Break large changes into a chain of small pull requests that are easier to review and merge.':
      '将大型更改拆分为一系列更易审查和合并的小型拉取请求。',
    'Get AI feedback on every pull request before a teammate reviews it.': '在队友审查之前，为每个拉取请求获取 AI 反馈。',
    'Protected branches': '受保护分支',
    'Set requirements for reviews, checks, and who can merge changes.': '为审查、检查以及谁可以合并更改设置要求。',
    'Get alerts for vulnerable dependencies, plus pull requests that keep them up to date.':
      '获取易受攻击依赖项的警报，以及使依赖项保持最新的拉取请求。',
    'GitHub Copilot Autofix': 'GitHub Copilot 自动修复',
    'Get suggested fixes for supported code scanning alerts.': '为支持的代码扫描警报获取修复建议。',
    'Code scanning': '代码扫描',
    'Find vulnerabilities and coding errors before they reach production.': '在漏洞和编码错误进入生产环境之前发现它们。',
    'Detect exposed credentials and other secrets in repositories.': '检测存储库中暴露的凭据和其他机密。',
    'Coordinate fixes for groups of security alerts across repositories.': '跨存储库协调修复成组的安全警报。',
    'Repository rules': '存储库规则',
    'Apply consistent protections to branches and tags across repositories.': '跨存储库为分支和标签应用一致的保护。',
    // 交付：卡片
    'Automate builds, tests, deployments, and other development workflows.': '自动化构建、测试、部署和其他开发工作流。',
    Webhooks: 'Web 钩子',
    'Trigger integrations when events happen in your repositories or organizations.': '存储库或组织中发生事件时触发集成。',
    'Run workflows on managed Linux, macOS, Windows, and other environments.': '在托管的 Linux、macOS、Windows 和其他环境中运行工作流。',
    'Run workflows on infrastructure you manage for greater control.': '在自己管理的基础设施上运行工作流，获得更多控制权。',
    'Workflow templates': '工作流模板',
    'Help teams start from shared, preconfigured workflows.': '帮助团队从共享的预配置工作流起步。',
    'Find actions and apps that extend your development workflow.': '查找可扩展开发工作流的操作和应用。',
    // 页尾号召
    'Ready to get started?': '准备好开始了吗？',
    'Explore all the plans to find the solution that fits your needs.': '浏览所有计划，找到适合你需求的方案。',
    'View pricing plans': '查看定价计划',
    // 链接的无障碍名称
    'Navigate to the GitHub Copilot feature page': '前往 GitHub Copilot 功能页'
  }
} satisfies PageDictionary
