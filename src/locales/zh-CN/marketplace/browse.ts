import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 市场（Marketplace）首页、导航、搜索与筛选、类别、搜索结果、上架新工具页（/marketplace/new）。
 * 类别名多为常见单词，放 scoped 只在市场页生效；类别说明是长句，放 static。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：Marketplace → 市场、GitHub Marketplace → GitHub 市场、
 * Actions → 操作、GitHub Sponsors → GitHub 赞助；Copilot 是品牌词，保留。
 */

/** 侧栏类别名 */
export const CATEGORIES: Readonly<Record<string, string>> = {
  'Agent apps': '智能体应用',
  'AI Assisted': 'AI 辅助',
  'API management': 'API 管理',
  'Backup Utilities': '备份工具',
  Chat: '聊天',
  'Code quality': '代码质量',
  'Code review': '代码审查',
  'Code Scanning Ready': '支持代码扫描',
  'Code search': '代码搜索',
  'Container CI': '容器 CI',
  'Continuous integration': '持续集成',
  'Dependency management': '依赖管理',
  Deployment: '部署',
  'Deployment Protection Rules': '部署保护规则',
  'Desktop tools': '桌面工具',
  IDEs: 'IDE',
  Learning: '学习',
  Localization: '本地化',
  Mobile: '移动端',
  'Mobile CI': '移动端 CI',
  Monitoring: '监控',
  'Open Source management': '开源管理',
  'Project management': '项目管理',
  Publishing: '发布',
  'Recently added': '最近添加',
  Reporting: '报告',
  Security: '安全',
  Support: '支持',
  Sustainability: '可持续性',
  Testing: '测试',
  'Time tracking': '时间跟踪',
  Utilities: '实用工具',
  'Game CI': '游戏 CI',
  'GitHub Sponsors': 'GitHub 赞助'
}

/** 类别名的正则片段（已转义） */
const CATEGORY_NAMES = Object.keys(CATEGORIES)
  .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|')

/** 「<类别> apps / actions」标题：代码质量应用、IDE 应用、GitHub 赞助操作 */
function categoryHeading(name: string, kind: string): string {
  return joinCjk(CATEGORIES[name] ?? name, kind === 'apps' ? '应用' : '操作')
}

/** 首页与筛选用到的单词；Security、Support、Code review 与 common 的全局译文相同，不进 scoped */
const CATEGORY_SCOPED = Object.fromEntries(
  Object.entries(CATEGORIES).filter(([name, label]) => name !== label && !['Security', 'Support', 'Code review'].includes(name))
)

export default {
  static: {
    // 头部
    'Enhance your workflow with extensions': '使用扩展增强你的工作流',
    'Tools from the community and partners to simplify tasks and automate processes': '来自社区和合作伙伴的任务简化与流程自动化工具',
    'Tools to improve your workflow': '改进工作流的工具',

    // 导航
    'Marketplace navigation': '市场导航',
    'Marketplace categories': '市场类别',
    'Open Marketplace categories': '打开市场类别',
    'All apps': '全部应用',
    'All actions': '全部操作',
    'Create a new extension': '创建新扩展',
    'Create extension': '创建扩展',

    // 搜索
    'Search Marketplace': '搜索市场',
    'Search for apps and actions': '搜索应用和操作',
    'Search for Copilot extensions, apps and actions': '搜索 Copilot 扩展、应用和操作',
    'Search in GitHub Marketplace': '在 GitHub 市场中搜索',

    // 筛选器
    'Apps only': '仅应用',
    'Actions only': '仅操作',
    'Copilot extensions only': '仅 Copilot 扩展',
    'Copilot extensions': 'Copilot 扩展',
    'Filter by listing type': '按类型筛选',
    // 搜索框筛选建议的组合 aria-label：<名称>, Filter, <说明>（两个筛选器结构相同）
    'Listing type, Filter, Filter by listing type': '类型，筛选器，按类型筛选',
    'Category, Filter, Filter by category or tag': '类别，筛选器，按类别或标签筛选',
    'Filter by category or tag': '按类别或标签筛选',
    'All creators': '全部创建者',
    'Verified creators': '已验证创建者',

    // 首页
    'Discover apps with Copilot extensions': '发现带 Copilot 扩展的应用',
    'Your favorite tools now work with GitHub Copilot.': '你喜爱的工具现已支持 GitHub Copilot。',
    'View recommended or recent marketplace listings': '查看推荐或最近添加的上架项',
    'View recommended or recent marketplace listings navigation': '查看推荐或最近添加的上架项',

    // 搜索结果
    'Copilot Extensions': 'Copilot 扩展',
    'Extend Copilot capabilities using third party tools, services, and data': '使用第三方工具、服务和数据扩展 Copilot 的能力',
    'Automate your workflow from idea to production': '自动化从构想到生产的工作流',
    'Build on your workflow with apps that integrate with GitHub': '使用与 GitHub 集成的应用拓展工作流',
    'Try searching by different keywords.': '尝试使用其他关键词搜索。',
    'No results. Try searching by different keywords.': '无结果。尝试使用其他关键词搜索。',

    // 类别说明（标点随原文：原文没有逗号的句子不加逗号、顿号）
    'Tools that are superpowered with AI (artificial intelligence) to help you be a better developer.':
      'AI（人工智能）加持的工具助你成为更好的开发人员。',
    'Structure your API infrastructure to enable various internet gateways to interact with your service.':
      '构建 API 基础设施使各类互联网网关能与你的服务交互。',
    'Utilities providing periodic backups of your GitHub data': '定期备份 GitHub 数据的工具',
    'Bring GitHub into your conversations.': '将 GitHub 带入你的对话。',
    'Automate your code review with style, quality, security, and test‑coverage checks when you need them.':
      '按需通过代码风格、质量、安全和测试覆盖率检查自动执行代码审查。',
    'Automate your code review with style, quality, security, and test-coverage checks when you need them.':
      '按需通过代码风格、质量、安全和测试覆盖率检查自动执行代码审查。',
    'Ensure your code meets quality standards and ship with confidence.': '确保代码符合质量标准并放心发布。',
    'Static analysis, dynamic analysis, container scanning, linting, and fuzzing tools that integrate with GitHub Code Scanning SARIF Upload':
      '与 GitHub 代码扫描 SARIF 上传集成的静态分析、动态分析、容器扫描、代码检查和模糊测试工具',
    'Query, index, or hash the semantics of your source code.': '查询、索引或哈希源代码的语义。',
    'Continuous integration for container applications.': '容器应用的持续集成。',
    'Automatically build and test your code as you push it to GitHub, preventing bugs from being deployed to production.':
      '推送到 GitHub 时自动构建和测试代码，防止缺陷部署到生产环境。',
    'Secure and manage your third-party dependencies.': '保护和管理第三方依赖。',
    'Streamline your code deployment so you can focus on your product.': '简化代码部署以便专注于产品。',
    'Enables custom protection rules to gate deployments with third-party services': '启用自定义保护规则以借助第三方服务管控部署',
    'Developer tools that are run natively on your local machine.': '在本地计算机上原生运行的开发人员工具。',
    'Tools for building a CI pipeline for game development': '为游戏开发构建 CI 流水线的工具',
    'Find the right interface to build, debug, and deploy your source code.': '找到合适的界面来构建、调试和部署源代码。',
    'Get the skills you need to level up.': '获取提升所需的技能。',
    "Extend your software's reach. Localize and translate continuously from GitHub.": '扩大软件的覆盖范围。在 GitHub 上持续本地化和翻译。',
    'Extend your software’s reach. Localize and translate continuously from GitHub.': '扩大软件的覆盖范围。在 GitHub 上持续本地化和翻译。',
    'Improve your workflow for the small screen.': '改进面向小屏幕的工作流。',
    'Continuous integration for Mobile applications': '移动应用的持续集成',
    'Monitor the impact of your code changes. Measure performance, track errors, and analyze your application.':
      '监控代码更改的影响。衡量性能、跟踪错误并分析应用。',
    'Running open source projects can be hard. Here are some tools to make that process a little more fun and a ton more manageable.':
      '运营开源项目并不容易。这些工具能让过程更有趣且更易管理。',
    'Organize, manage, and track your project with tools that build on top of issues and pull requests.':
      '使用基于议题和拉取请求的工具组织、管理和跟踪项目。',
    'Get your site ready for production so you can get the word out.': '让网站做好上线准备以便广而告之。',
    'The latest tools that help you and your team build software better, together.': '帮助你和团队更好地协作构建软件的最新工具。',
    'Get insights into how your teams are developing software using GitHub.': '深入了解团队如何使用 GitHub 开发软件。',
    'Find, fix, and prevent security vulnerabilities before they can be exploited.': '在安全漏洞被利用前发现、修复和预防。',
    'Get your team and customers the help they need.': '为团队和客户提供所需的帮助。',
    'Optimize your work to minimize impact on the environment.': '优化工作以减少对环境的影响。',
    'Eliminate bugs and ship with more confidence by adding these tools to your workflow.':
      '将这些工具加入工作流以消除缺陷并更放心地发布。',
    'Track your progress, and predict how long a task will take based on your coding activity.': '跟踪进度，并根据编码活动预测任务耗时。',
    'Auxiliary tools to enhance your experience on GitHub': '增强 GitHub 使用体验的辅助工具',

    // 上架新工具 /marketplace/new
    'New Marketplace Listing': '新建市场上架项',
    'List your tool': '上架你的工具',
    'List your tool on GitHub Marketplace': '在 GitHub 市场上架你的工具',
    'Is this your app?': '这是你的应用吗？',
    'You have no tools to list on GitHub Marketplace': '你没有可在 GitHub 市场上架的工具',
    'Learn more about the requirements': '了解相关要求',
    // 链接「了解相关要求」之后的片段：原文没有逗号，译文不加
    'to list a tool on GitHub Marketplace.': '以在 GitHub 市场上架工具。',
    'More about tools and GitHub Marketplace': '关于工具和 GitHub 市场的更多信息',
    'About GitHub Marketplace': '关于 GitHub 市场',
    'How to create and list tools on the GitHub Marketplace, including guidelines for listing content, artwork, and screenshots.':
      '如何在 GitHub 市场创建和上架工具，包括上架内容、图片和截图的指南。',
    'Adding webhooks for a GitHub Marketplace listing': '为 GitHub 市场上架项添加 Web 钩子',
    'Add webhooks for your app to notify you when specified events are triggered.': '为应用添加 Web 钩子以在指定事件触发时通知你。'
  },
  scoped: {
    ...CATEGORY_SCOPED,
    // 面包屑、页面标题（Marketplace · GitHub）里的 Marketplace、GitHub Marketplace 由 common 的全局 static 译“市场”
    Apps: '应用',
    // 侧栏分区标题、面包屑、搜索结果分区标题里的 Actions（复数、指可复用操作）；全局导航产品菜单里的 Actions 同译
    Actions: '操作',
    // App、Action 也是列表条目的类型标签；另一种标签 Copilot 是产品名，不译
    App: '应用',
    Action: '操作',
    'Collapse sidebar': '折叠侧栏',
    'Listing type': '类型',
    'Listing Type': '类型',
    Category: '类别',
    // 搜索框输入 type:、category: 时的有值建议项（与 issues 的「有<筛选器>」同式）
    'Has listing type': '有类型',
    'Has category': '有类别',
    'Most popular': '最受欢迎',
    'Filter:': '筛选器：',
    'By:': '创建者：',
    'Sort:': '排序：',
    'Free trial': '免费试用',
    Popularity: '热门程度',
    'Best match': '最佳匹配',
    // 类别说明「Tools to manage your <GitHub Sponsors> community」
    'Tools to manage your': '管理',
    community: '社区的工具'
  },
  regexp: [
    [/^Search results for “(.+)”$/, '“$1”的搜索结果'],
    // 原文末尾的句号照录
    [/^(\d[\d,]*) results?(\.?)$/, (_, count: string, period: string) => `${count} 个结果${period ? '。' : ''}`],
    [new RegExp(`^(${CATEGORY_NAMES}) (apps|actions)$`), (_, name: string, kind: string) => categoryHeading(name, kind)],
    // 分页：原文末尾的省略号照录
    [/^Page (\d+)(\.\.\.|…)?$/, '第 $1 页$2']
  ],
  ignore: [
    // 列表条目：名称、描述
    '[data-testid="marketplace-item"] h3',
    '[data-testid="marketplace-item"] p',
    // 搜索框内的查询文本叠加层（用户输入）
    '#marketplace-search-filter div[aria-hidden="true"]'
  ]
} satisfies PageDictionary
