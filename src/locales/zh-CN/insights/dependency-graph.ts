import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * 依赖项关系图：依赖项（/network/dependencies）、被依赖（/network/dependents）、
 * Dependabot 更新（/network/updates）、依赖路径对话框、SBOM 导出、未启用状态。
 */
export default {
  static: {
    'Dependency graph': '依赖项关系图',
    'Dependency Insights menu': '依赖项洞察菜单',
    Dependencies: '依赖项',
    Dependents: '被依赖',
    'Network Dependents': '被依赖',
    'Export SBOM': '导出 SBOM',
    'Dependency files checked': '依赖文件检查于',
    'Tell us how to make the Dependency Graph work better for you with a few quick questions.':
      '通过几个简短的问题告诉我们如何改进依赖项关系图。',

    // 依赖项列表
    'Search all dependencies': '搜索所有依赖项',
    'Filter ecosystems': '筛选生态系统',
    'Filter by ecosystem': '按生态系统筛选',
    'Filter by ecosystem options': '按生态系统筛选选项',
    'No ecosystems found.': '未找到生态系统。',
    Transitive: '传递',
    Direct: '直接',
    'Learn more about SBOMS.': '了解 SBOM。',
    'Supported ecosystems will have transitivity labels on their packages.': '受支持的生态系统会在软件包上显示传递性标签。',
    'View transitive paths': '查看传递路径',
    'You can view transitive paths for packages within supported ecosystems.': '可以查看受支持生态系统中软件包的传递路径。',
    'Show dependency options': '显示依赖项选项',
    'No dependencies found.': '未找到依赖项。',
    // To view your dependency graph, … define dependencies in <one of the supported manifest file types>, like …
    'To view your dependency graph, your repository must define dependencies in': '要查看依赖项关系图，存储库须将依赖项定义在',
    'Detect additional dependencies with GitHub Actions': '使用 GitHub 操作检测更多依赖项',
    // … GitHub Actions adds your dependencies using the <dependency submission API> so you can receive …
    'Not all dependencies are automatically detected for ecosystems like Gradle. GitHub Actions adds your dependencies using the':
      'Gradle 等生态系统的依赖项并非都能被自动检测。GitHub 操作可使用',
    'so you can receive Dependabot alerts for known vulnerabilities.': '添加依赖项，以便接收已知漏洞的 Dependabot 警报。',
    'View in Marketplace': '在市场中查看',
    // These dependencies are defined in <owner/repo>’s manifest files, such as …
    'These dependencies are defined in': '这些依赖项定义在',
    '’s manifest files, such as': '的清单文件中，例如',
    "'s manifest files, such as": '的清单文件中，例如',
    'Dependencies defined in': '依赖项定义于',
    'Dependencies defined in these manifest files have known security vulnerabilities and should be updated:':
      '以下清单文件中定义的依赖项存在已知安全漏洞且应予以更新：',
    'Known security vulnerability in': '已知安全漏洞位于',
    'Known vulnerability found': '发现已知漏洞',
    'update suggested:': '建议更新：',
    'Always verify the validity and compatibility of suggestions with your codebase.': '请始终验证建议的有效性及其与代码库的兼容性。',
    'What’s not been updated': '尚未更新的内容',
    "What's not been updated": '尚未更新的内容',

    // 未启用：The owner of this repository has not yet enabled … Once enabled, you can <track this repository’s dependencies>.
    'Dependency graph is disabled': '依赖项关系图已禁用',
    'The owner of this repository has not yet enabled the dependency graph. Once enabled, you can':
      '此存储库的所有者尚未启用依赖项关系图。启用后，可以',
    'Dependency graph has not been enabled by an organization owner or a user with admin permissions for this repository. Once enabled, you can':
      '组织所有者或拥有此存储库管理员权限的用户尚未启用依赖项关系图。启用后，可以',
    'track this repository’s dependencies': '跟踪此存储库的依赖项',
    "track this repository's dependencies": '跟踪此存储库的依赖项',
    'Learn more about how we use your data.': '了解我们如何使用你的数据。',
    'Learn more about how we use your data': '了解我们如何使用你的数据',
    'Enable the dependency graph': '启用依赖项关系图',
    // Track this repository’s <dependencies and sub-dependencies>
    'Track this repository’s': '跟踪此存储库的',
    "Track this repository's": '跟踪此存储库的',
    'dependencies and sub-dependencies': '依赖项和子依赖项',
    'is not enabled for this repository. Click on "Enable the dependency graph" below to enable it.':
      '未在此存储库中启用。单击下方的“启用依赖项关系图”即可启用。',
    // If you’d like to enable the <dependency graph> and <vulnerability alerting>, click on "Allow access" below …
    'If you’d like to enable the': '如需启用',
    "If you'd like to enable the": '如需启用',
    'click on "Allow access" below to enable it.': '请单击下方的“允许访问”以启用。',
    ', click on "Allow access" below to enable it.': '，请单击下方的“允许访问”以启用。',

    // 被依赖列表：Repositories that depend on <软件包>
    'Filter by Package': '按软件包筛选',
    'Package:': '软件包：',
    'Repositories that depend on': '依赖以下软件包的存储库',
    'Packages that depend on': '依赖以下软件包的软件包',
    'These counts are approximate and may not exactly match the dependents shown below.':
      '这些计数为近似值且可能与下方显示的被依赖项不完全一致。',
    'Filter by Owner': '按所有者筛选',
    'Filter by owner': '按所有者筛选',
    'Filter by owner menu': '按所有者筛选菜单',
    'Filter by owner list': '按所有者筛选列表',
    'Enter a user name': '输入用户名',
    'Filter by this user': '按此用户筛选',
    'We haven’t found any dependents for this repository yet.': '尚未发现此存储库的被依赖项。',
    "We haven't found any dependents for this repository yet.": '尚未发现此存储库的被依赖项。',
    'We’ll keep looking!': '我们会继续查找！',
    "We'll keep looking!": '我们会继续查找！',
    'GitHub does not currently determine the dependents of private repositories': 'GitHub 目前不会确定专用存储库的被依赖项',

    // Dependabot 更新（/network/updates）
    'Enable Dependabot': '启用 Dependabot',
    "Dependabot isn't enabled": '未启用 Dependabot',
    'Dependabot isn’t enabled': '未启用 Dependabot',
    "Dependabot isn't enabled on forks by default": '复刻默认不启用 Dependabot',
    'Dependabot isn’t enabled on forks by default': '复刻默认不启用 Dependabot',
    "Dependabot version updates aren't configured yet": '尚未配置 Dependabot 版本更新',
    'Dependabot version updates aren’t configured yet': '尚未配置 Dependabot 版本更新',
    'Dependabot creates pull requests to keep your dependencies up-to-date.': 'Dependabot 会创建拉取请求以使依赖项保持最新。',
    'Create config file': '创建配置文件',
    'Recent update jobs': '最近的更新作业',
    // <Dependabot version updates> automatically keep your application up-to-date …
    'automatically keep your application up-to-date by periodically updating dependencies to their latest versions.':
      '会通过定期将依赖项更新到最新版本让应用程序自动保持最新。',
    'can also help keep dependencies updated.': '也可以帮助保持依赖项为最新。',
    'Monitored dependency files': '受监控的依赖文件',
    'Check for updates': '检查更新',
    'Recent jobs': '最近的作业'
  },
  scoped: {
    'one of the supported manifest file types': '任一受支持的清单文件中',
    ', like': '，例如',
    'dependency submission API': '依赖项提交 API',
    'dependency graph': '依赖项关系图',
    'vulnerability alerting': '漏洞警报',
    'Allow access': '允许访问',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Dependabot security updates': 'Dependabot 安全更新',
    'view logs': '查看日志',
    'Secret scanning': '机密扫描',
    // 生态系统筛选项（与 npm 并列）；产品名按用户规定译出，同 security 公告的生态系统选项
    'GitHub Actions': 'GitHub 操作'
  },
  regexp: [
    // 依赖条目元信息：· Detected automatically on Oct 18, 2026 · MIT
    [
      new RegExp(`^· Detected automatically on (${DATE_SOURCE})(?: · (.+))?$`),
      (_, date, license) => `${joinCjk('· 自动检测于', translateTime(date))}${license ? ` · ${license}` : ''}`
    ],
    // 依赖路径对话框
    [/^Paths for (.+)$/, '$1 的路径'],
    [/^Showing ([\d,]+) paths?\. Export SBOM to view all paths\.$/, '显示 $1 条路径。导出 SBOM 以查看所有路径。'],
    // 计数
    [/^([\d,]+) Total$/, '共 $1 个'],
    [/^([\d,]+) (Repositor(?:y|ies)|Packages?)$/, (_, count, kind) => `${count} 个${kind.startsWith('Repositor') ? '存储库' : '软件包'}`],
    // 页面标题片段：Network Dependents · owner/repo · @scope/name repositories
    // 软件包名须像软件包名（@scope/name、小写开头，或含 . : /），避免误命中「12 repositories」「Public repositories」
    [
      /^(@[\w.-]+\/[\w.-]+|[a-z][\w.:/-]*|[A-Z0-9][\w-]*[.:/][\w.:/-]*) (repositories|packages)$/,
      (_, name, kind) => `依赖 ${name} 的${kind === 'repositories' ? '存储库' : '软件包'}`
    ]
  ],
  ignore: [
    // 软件包名、清单文件路径
    'a[data-hovercard-type="dependendency_graph_package"]',
    'a[data-hovercard-type="dependency_graph_package"]',
    'a[data-test-selector="dg-repo-pkg-manifest"]',
    '#dependents .select-menu-item-text',
    '#dependents p[role="status"] > strong'
  ]
} satisfies PageDictionary
