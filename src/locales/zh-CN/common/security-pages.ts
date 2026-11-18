import type { PageDictionary } from '../../../core/types'

/**
 * 案例问答句型中间的客户名槽位：首尾两个客户之间的每个客户在句型键里是「,槽位」，译文各加一个「、{}」
 * （只有两个客户时为空）
 */
function middleCustomers(middle: string): string {
  return '、{}'.repeat(middle.split(',').length - 1)
}

/**
 * GitHub 安全产品介绍页正文（页面类型只有 common，词条全站生效）：/security、/security/advanced-security 及其子页
 * code-security、secret-protection、software-supply-chain，以及 /security/plans。只收这几页特有的句子与短语。
 * 产品名译成中文：GitHub Advanced Security / Secret Protection / Code Security → GitHub 高级安全 / 机密保护 / 代码安全，
 * Supply Chain Security → 供应链安全，Copilot Autofix → Copilot 自动修复；品牌词 CodeQL、Dependabot 与缩写 GHAS、
 * DevSecOps、AppSec、SAST、EPSS、SBOM、SLSA、SARIF 保留。
 * /security/plans 的功能对比表与 /pricing 比较表（new/plans.ts 的 scoped）同名的行名、说明沿用其译法。
 * 不收录：客户名、人名（logo 的 svg title 在跳过标签内，引擎不处理）；统计数字 4.4M、39M 与货币代码 USD（照原文）；
 * 资源卡片标签 Demo（易与部署环境名等用户内容同形）；CodeQL（品牌词）。
 * 对比表表头 Free / Team / Enterprise 由 marketing 的全局词条翻译（Team / Enterprise 作“团队 / 企业”，
 * 这几页没有单独的页面类型，不能改作方案名）。页顶 GitHub Universe 横幅与营销页头页脚归 marketing.ts。
 */
export default {
  static: {
    // 子导航与首屏按钮（GitHub Security、Advanced Security、Secret Protection、Code Security、More 由 marketing 等收录）
    'Supply Chain Security': '供应链安全',
    'Plans & pricing': '计划与定价',
    'Request a demo': '申请演示',
    'See plans & pricing': '查看计划与定价',
    'Contact sales': '联系销售',
    'Ready to use it in your repositories?': '准备好在你的存储库中使用了吗？',
    'Get started now': '立即开始',

    // 标签页标题「GitHub Advanced Security · Built-in protection for every repository」（/security/plans 同）的第二段，
    // 子页标题「GitHub Code Security」「GitHub Secret Protection」「GitHub Supply Chain Security」
    'Built-in protection for every repository': '为每个存储库提供内置保护',
    'GitHub Code Security': 'GitHub 代码安全',
    'GitHub Secret Protection': 'GitHub 机密保护',
    'GitHub Supply Chain Security': 'GitHub 供应链安全',

    // /security：首屏与功能
    'Get enterprise-grade, built-in application security.': '获得企业级的内置应用安全。',
    'Find out how platform security strengthens your workflow.': '了解平台安全如何强化你的工作流。',
    'GitHub’s API stays secure with ISO, SOC 2, and GDPR.': 'GitHub 的 API 符合 ISO、SOC 2 和 GDPR 要求，始终安全。',
    'Security seamlessly integrated into your workflow': '安全无缝融入你的工作流',
    'Prevent accidental secret exposure': '防止机密意外泄露',
    'Push protection automatically blocks secrets before they reach your repository, keeping code clean without disrupting workflows.':
      '推送保护会在机密进入存储库前自动拦截，在不干扰工作流的同时保持代码干净。',
    'Explore GitHub Secret Protection': '探索 GitHub 机密保护',
    'Find and fix vulnerabilities in your code': '发现并修复代码中的漏洞',
    'Address security debt in your GitHub workflow with static analysis, AI remediation, and proactive vulnerability management.':
      '借助静态分析、AI 修复和主动漏洞管理，在 GitHub 工作流中解决安全债务。',
    'Explore GitHub Code Security': '探索 GitHub 代码安全',
    'Stay secure': '保持安全',
    'Securing the entire software supply chain': '保护整个软件供应链',
    'Enhance your security strategy with the GitHub Security Lab': '借助 GitHub 安全实验室强化你的安全策略',
    'Learn how the lab helps secure open source by finding vulnerabilities, building tools like CodeQL, and advancing security research.':
      '了解该实验室如何通过发现漏洞、构建 CodeQL 等工具和推进安全研究来保护开源。',
    'Visit the GitHub Security Lab': '访问 GitHub 安全实验室',
    'Stay ahead of threats with the Security Advisory Database': '借助安全公告数据库抢先应对威胁',
    'Access a security vulnerability database inclusive of CVEs and GitHub originated security advisories from the world of open source software.':
      '访问安全漏洞数据库，其中收录了 CVE 以及 GitHub 针对开源软件世界发布的安全公告。',
    'Visit the Security Database': '访问安全数据库',
    'Strengthen your software supply chain': '强化你的软件供应链',
    "GitHub's supply chain security reduces open source risks with auto-updates, dependency tracking, and build attestation.":
      'GitHub 的供应链安全通过自动更新、依赖项跟踪和构建证明降低开源风险。',
    'See supply chain security': '查看供应链安全',

    // /security：客户案例与评价（客户名、人名保持原文）
    "Adopted by the world's leading organizations": '全球领先组织纷纷采用',
    'View all customer stories': '查看全部客户案例',
    'Otto Group elevates developer engagement with GitHub Advanced Security': 'Otto Group 借助 GitHub 高级安全提升开发人员参与度',
    'Read customer story': '阅读客户案例',
    'SPH Media tames tool sprawl and secures code with GitHub': 'SPH Media 借助 GitHub 整治工具泛滥并保护代码',
    'Postmates uses GitHub Advanced Security to catch vulnerabilities': 'Postmates 使用 GitHub 高级安全发现漏洞',
    // 评价引言：<b>GitHub Advanced Security empowers our developers</b> to detect …（/security/advanced-security）；
    // /security 首页 <b> 内的产品名与其后文字分开，相邻文本节点整段匹配上一条，元素拆开时见 inline，此为片段。
    // 后半句以全角逗号开头：引擎不保留其前的空白
    'GitHub Advanced Security empowers our developers': 'GitHub 高级安全为我们的开发人员提供有力支持',
    'empowers our developers': '为我们的开发人员提供有力支持',
    'to detect and fix vulnerabilities earlier, accelerating our time to market and boosting developer satisfaction.':
      '，让他们能够更早地发现并修复漏洞，从而加快产品上市速度，提升开发人员满意度。',
    'Head of development services and tools at SAP': 'SAP 开发服务与工具负责人',
    'Built-in security for developer workflows': '为开发人员工作流内置安全',

    // 资源卡片（三个子页共用；卡片标签 Demo 不收录）
    'Resources to get started': '入门资源',
    'Explore the DevSecOps guide': '探索 DevSecOps 指南',
    'Learn how to write more secure code from the start with DevSecOps.': '了解如何借助 DevSecOps 从一开始就编写更安全的代码。',
    'Read the whitepaper': '阅读白皮书',
    'Avoid AppSec pitfalls': '避开 AppSec 陷阱',
    'Explore common application security pitfalls and how to avoid them.': '了解常见的应用安全陷阱及其规避方法。',
    'Adopting GitHub Advanced Security': '采用 GitHub 高级安全',
    'You can adopt GitHub Advanced Security at scale in your company.': '你可以在公司内大规模采用 GitHub 高级安全。',
    'View the docs': '查看文档',
    'Best practices for more secure software': '打造更安全软件的最佳实践',
    'Discover developer-first security': '探索开发人员优先的安全',
    'Discover developer-first application security': '探索开发人员优先的应用安全',
    'Take an in-depth look at the current state of application security.': '深入了解应用安全的现状。',
    'View the webinar': '观看网络研讨会',
    REPORT: '报告',
    Videos: '视频',

    // /security/advanced-security
    'Security that moves at the speed of development': '紧跟开发速度的安全',
    'Explore Secret Protection': '探索机密保护',
    'Fix vulnerabilities in your code': '修复代码中的漏洞',
    'Explore Code Security': '探索代码安全',
    'Companies using GitHub Advanced Security': '使用 GitHub 高级安全的公司',
    'Become a risk reduction warrior': '成为降低风险的先锋',
    'Stay ahead of threats with built-in security, secret protection, and dependency monitoring.':
      '借助内置安全、机密保护和依赖项监控，抢先应对威胁。',
    'Explore GitHub security risk assessments': '探索 GitHub 安全风险评估',
    'Strengthen your development with AI': '借助 AI 强化开发',
    'Empower your team with native AppSec': '借助原生 AppSec 为团队赋能',
    'Write secure code at scale with AI-driven insights and automated fixes from GitHub Copilot Autofix.':
      '借助 GitHub Copilot 自动修复提供的 AI 见解与自动化修复，大规模编写安全代码。',
    'Find and fix vulnerabilities in real time by integrating application security right into GitHub.':
      '将应用安全直接集成到 GitHub 中，实时发现并修复漏洞。',
    'Lead developer': '首席开发人员',
    'Two layers of powerful protection': '两层强大防护',
    'Combine Secret Protection and Code Security to safeguard your code from every angle.': '结合机密保护和代码安全，全方位保护你的代码。',
    // 价格卡片：价格数字与货币代码 USD 照原文
    'For teams and organizations serious about stopping secret leaks.': '适合致力于阻止机密泄露的团队和组织。',
    'per active committer/month': '每个活跃提交者/月',
    'For teams and organizations committed to fixing vulnerabilities before production.':
      '适合致力于在进入生产环境前修复漏洞的团队和组织。',
    'Get the most out of GitHub Advanced Security': '充分发挥 GitHub 高级安全的价值',
    'Maximize your defenses with industry-leading AppSec': '借助业界领先的 AppSec 全面加强防御',
    'Discover how our security solution can benefit your organization.': '了解我们的安全解决方案能为你的组织带来哪些益处。',
    'See how improved security drives business success': '了解提升安全性如何推动业务成功',
    'Explore the benefits of improving software security standards in organizations.': '了解在组织中提高软件安全标准的好处。',
    'Read the report': '阅读报告',
    'How top teams secure code while moving fast': '顶尖团队如何在快速推进的同时保障代码安全',
    'Learn how industry experts protect their code without sacrificing productivity.': '了解行业专家如何在不牺牲生产力的情况下保护代码。',
    'Watch the videos': '观看视频',

    // /security/advanced-security：常见问题（被链接拆开的答案见 inline）
    'What is GitHub Advanced Security?': '什么是 GitHub 高级安全？',
    'GitHub Advanced Security (GHAS) encompasses GitHub’s application security products comprising GitHub Secret Protection and GitHub Code Security. GHAS adds cutting-edge tools for static analysis, software composition analysis, and secret scanning to the GitHub platform that developers already know and love. Unlike traditional application security packages that burden the software development toolchain with complex workflows that inhibit adoption, GHAS makes it easy for developers to find and fix vulnerabilities earlier in the software development life cycle.':
      'GitHub 高级安全 (GHAS) 涵盖 GitHub 的应用安全产品，包括 GitHub 机密保护和 GitHub 代码安全。GHAS 为开发人员早已熟悉和喜爱的 GitHub 平台增添了用于静态分析、软件成分分析和机密扫描的前沿工具。传统应用安全方案以复杂的工作流拖累软件开发工具链，阻碍推广采用；GHAS 则让开发人员能够在软件开发生命周期中更早、更轻松地发现并修复漏洞。',
    'Why choose GitHub Advanced Security instead of a third-party AppSec product?':
      '为什么选择 GitHub 高级安全，而不是第三方 AppSec 产品？',
    'Unlike third-party security add-ons, GitHub Advanced Security operates entirely in the native GitHub workflows that developers already know and love. By making it easier for developers to remediate vulnerabilities as they go, GitHub Advanced Security frees time for security teams to focus on critical strategies that protect businesses, customers, and communities from application-based vulnerabilities.':
      '与第三方安全附加组件不同，GitHub 高级安全完全在开发人员早已熟悉和喜爱的原生 GitHub 工作流中运行。GitHub 高级安全让开发人员能够更轻松地边开发边修复漏洞，从而为安全团队腾出时间，专注于保护企业、客户和社区免受应用漏洞威胁的关键策略。',
    'What is DevSecOps?': '什么是 DevSecOps？',
    'DevSecOps refers to a combination of the development, security, and operations tools necessary to develop software applications.':
      'DevSecOps 是指开发软件应用所需的开发、安全和运维工具的组合。',
    'What is AppSec?': '什么是 AppSec？',
    'Application security (AppSec) is the process of finding, fixing, and preventing security vulnerabilities in applications. GitHub Advanced Security provides AppSec tools for static application security testing (SAST), which identifies vulnerabilities in the code itself.':
      '应用安全 (AppSec) 是发现、修复和预防应用中安全漏洞的过程。GitHub 高级安全提供用于静态应用安全测试 (SAST) 的 AppSec 工具，可识别代码本身的漏洞。',
    'Can I use GitHub Advanced Security with Microsoft Azure DevOps?': '我可以将 GitHub 高级安全与 Microsoft Azure DevOps 一起使用吗？',
    // 答案中的链接文字（整句见 inline）
    'add-on': '附加组件',
    'Where can I find case studies and reference customers?': '在哪里可以找到案例研究和参考客户？',
    'customer stories': '客户案例',
    'Can I review documentation before purchase?': '购买前可以查看文档吗？',
    'Does GitHub offer consulting, training, and other deployment services?': 'GitHub 是否提供咨询、培训和其他部署服务？',
    'Expert Services': '专家服务',

    // /security/advanced-security/code-security
    'Application security where found means fixed': '发现即修复的应用安全',
    'Secure your code as you build with GitHub Code Security. Detect vulnerabilities early and fix them with Copilot Autofix.':
      '借助 GitHub 代码安全，边构建边保护代码。及早发现漏洞，交由 Copilot 自动修复处理。',
    // 视频标题与播放按钮的 aria-label
    'What is GitHub code security?': '什么是 GitHub 代码安全？',
    'Play video. Thumbnail description: What is GitHub code security?': '播放视频。缩略图说明：什么是 GitHub 代码安全？',
    // 统计：大号数字 + 说明（数字与说明分两段显示）
    '28 min': '28 分钟',
    'From vulnerability detection to remediation': '从发现漏洞到完成修复',
    '3X': '3 倍',
    'Faster remediation on average with Copilot Autofix': 'Copilot 自动修复带来的平均修复提速',
    'Of alert types include AI-powered code suggestions': '警报类型提供 AI 驱动的代码建议',
    'How it works': '工作原理',
    'Detect and remediate vulnerabilities early with AI-powered fixes': '借助 AI 驱动的修复及早发现并修复漏洞',
    'Automate security checks': '自动执行安全检查',
    'Find security issues in real time with CodeQL’s powerful analysis that traces data flows throughout your application.':
      '借助 CodeQL 强大的分析能力追踪整个应用中的数据流，实时发现安全问题。',
    'Learn more about CodeQL': '了解 CodeQL',
    'Remediate at scale': '大规模修复',
    'Get contextual explanations and AI-powered fixes for CodeQL-detected alerts with Copilot Autofix.':
      '借助 Copilot 自动修复，为 CodeQL 检测到的警报获取上下文说明和 AI 驱动的修复。',
    'Explore Copilot Autofix': '探索 Copilot 自动修复',
    'Reduce security debt': '减少安全债务',
    'GitHub Code Security continuously scans your code as you build, helping detect vulnerabilities early, fix them fast with Copilot Autofix, and ship securely.':
      'GitHub 代码安全会在你构建时持续扫描代码，帮助你及早发现漏洞、借助 Copilot 自动修复快速解决，并安全地交付。',
    'One-click risk assessment': '一键风险评估',
    'Evaluate exposure to application vulnerabilities and leaked secrets in your codebase with our free risk assessment tool.':
      '使用我们的免费风险评估工具，评估代码库中应用漏洞和机密泄露的风险敞口。',
    // 评价引言：<b>Copilot Autofix streamlines security</b> by flagging …（原文结尾的右引号照录；后半句以全角逗号开头）
    'Copilot Autofix streamlines security': 'Copilot 自动修复简化了安全工作',
    'by flagging vulnerabilities and suggesting fixes instantly, keeping code secure while freeing teams for strategic work.”':
      '，它能即时标记漏洞并提出修复建议，在保障代码安全的同时，让团队腾出精力投入战略性工作。”',
    'community manager of security at Otto GmbH & Co. KGaA': 'Otto GmbH & Co. KGaA 安全社区经理',
    'Build secure software from day one': '从第一天起构建安全软件',
    'Security should be built in, not bolted on. With Code Security, you can find, fix, and prevent vulnerabilities seamlessly—keeping your software resilient from development to deployment.':
      '安全应当内置，而不是事后附加。借助代码安全，你可以无缝地发现、修复和预防漏洞——让软件从开发到部署始终保持韧性。',

    // /security/advanced-security/code-security：常见问题（原文部分答案结尾没有句点，译文照原文不加）
    'What is Code Security?': '什么是代码安全？',
    'GitHub Code Security empowers developers to secure their code without sacrificing speed. With built-in static analysis, AI-powered remediation, advanced dependency scanning, and proactive vulnerability management, teams can automatically detect, prioritize, and remediate security issues, all within their existing GitHub workflow—allowing them to deliver secure software faster and with greater confidence':
      'GitHub 代码安全让开发人员能够在不牺牲速度的前提下保护代码。借助内置的静态分析、AI 驱动的修复、高级依赖项扫描和主动漏洞管理，团队可以在现有 GitHub 工作流中自动检测安全问题、确定优先级并加以修复——从而更快、更有信心地交付安全的软件',
    'What is Copilot Autofix?': '什么是 Copilot 自动修复？',
    'Copilot Autofix uses AI-powered code suggestions to automatically fix security vulnerabilities identified by CodeQL. When a security vulnerability is detected, Copilot Autofix analyzes the code context, understands the underlying security issue, and generates a precise, contextually appropriate fix. This feature bridges the gap between vulnerability detection and remediation, enabling developers to review and apply AI-suggested fixes directly within their workflow.':
      'Copilot 自动修复利用 AI 驱动的代码建议，自动修复 CodeQL 识别出的安全漏洞。检测到安全漏洞时，Copilot 自动修复会分析代码上下文，理解潜在的安全问题，并生成精确且贴合上下文的修复。此功能弥合了漏洞检测与修复之间的鸿沟，让开发人员可以直接在工作流中审查并应用 AI 建议的修复。',
    'What are Security Campaigns?': '什么是安全活动？',
    // 原文重复的 With With 照录在键里
    'Security campaigns provide a structured framework for planning, tracking, and implementing security fixes across multiple repositories and teams allowing you to systematically burn down security debt. With With security campaigns, security teams can group related vulnerabilities, prioritize remediation efforts, assign ownership, and monitor progress through a unified dashboard. Security campaigns can be organized by vulnerability type, security initiative, compliance requirement, or any other logical grouping to coordinate security improvements at scale.':
      '安全活动提供了一个结构化框架，用于跨多个存储库和团队规划、跟踪和实施安全修复，让你系统地清偿安全债务。借助安全活动，安全团队可以将相关漏洞分组、确定修复工作的优先级、分配负责人，并通过统一的仪表板监控进度。安全活动可以按漏洞类型、安全举措、合规要求或任何其他逻辑分组进行组织，从而大规模协调安全改进。',
    'What is dependency analysis?': '什么是依赖项分析？',
    "Dependency review scans pull requests for vulnerable dependencies before they're introduced into your codebase. It evaluates the security impact of dependency changes, identifying vulnerable packages and their severity levels to prevent security issues from being merged. The tool shows detailed dependency changes by comparing the base and head branches, highlighting added, removed, and updated dependencies along with their known vulnerabilities":
      '依赖项审查会在存在漏洞的依赖项引入代码库之前扫描拉取请求。它评估依赖项更改对安全的影响，识别存在漏洞的软件包及其严重性级别，防止安全问题被合并。该工具通过比较基础分支和头部分支显示详细的依赖项更改，突出显示添加、删除和更新的依赖项及其已知漏洞',
    'What is EPSS?': '什么是 EPSS？',
    'Dependabot alerts now feature the Exploit Prediction Scoring System (EPSS) from the global Forum of Incident Response and Security Teams (FIRST), helping better assess vulnerability risks. EPSS helps organizations prioritize vulnerability remediation by predicting the likelihood of a vulnerability being exploited in the next 30 days. It provides a score ranging from 0 to 1 (0-100%), alongside a percentile ranking to indicate how the vulnerability compares to others.':
      'Dependabot 警报现已引入全球事件响应与安全团队论坛 (FIRST) 的漏洞利用预测评分系统 (EPSS)，帮助更好地评估漏洞风险。EPSS 通过预测漏洞在未来 30 天内被利用的可能性，帮助组织确定漏洞修复的优先级。它提供 0 到 1 (0-100%) 的评分，以及显示该漏洞与其他漏洞相比所处位置的百分位排名。',
    'What is the code security risk assessment?': '什么是代码安全风险评估？',
    // 风险评估答案：「… Learn more about」与「GitHub security risk assessments」是相邻文本节点（未渲染成链接），
    // 引擎整段匹配时按句查词条；逐个节点匹配时末句「Learn more about」由 common-ui 翻译
    'The Code Security Risk Assessment is a free evaluation that analyzes repositories to identify potential code-level vulnerabilities and highlight areas where GitHub Code Security can help improve security posture.':
      '代码安全风险评估是一项免费评估，它会分析存储库，找出潜在的代码级漏洞，并指出 GitHub 代码安全可以帮助改善安全态势的方面。',
    'Learn more about GitHub security risk assessments.': '了解 GitHub 安全风险评估。',
    'Learn more about GitHub security risk assessments': '了解 GitHub 安全风险评估',
    'GitHub security risk assessments': 'GitHub 安全风险评估',
    // 风险评估截图链接的 aria-label
    'Modal titled “Scan organization” showing a risk assessment setup with Secret Protection and Code Security selected, and Cancel and Continue buttons.':
      '标题为“扫描组织”的对话框，显示已选择机密保护和代码安全的风险评估设置，以及“取消”和“继续”按钮。',

    // /security/advanced-security/secret-protection
    'Keep your secrets secret': '守住你的机密',
    'GitHub Secret Protection continuously monitors your GitHub perimeter, helping prevent exposures, protect credentials, and ship securely.':
      'GitHub 机密保护持续监控你的 GitHub 边界，帮助防止泄露、保护凭据并安全交付。',
    'What is GitHub Secret Protection?': '什么是 GitHub 机密保护？',
    'Play video. Thumbnail description: What is GitHub Secret Protection?': '播放视频。缩略图说明：什么是 GitHub 机密保护？',
    // 统计说明（数字 4.4M、150+、39M 照原文）
    'Secrets prevented from leaking on GitHub in 2024': '2024 年在 GitHub 上阻止泄露的机密',
    'Industry partners, working together to mitigate risk for the developer community': '行业合作伙伴，携手为开发人员社区降低风险',
    'Secret leaks detected with Secret Protection in 2024': '2024 年机密保护检测到的机密泄露',
    'Prevent accidental secret exposure across your repositories': '防止存储库中的机密意外泄露',
    'Block leaks before they happen': '在泄露发生前加以阻止',
    'Find the threats that others miss': '发现他人遗漏的威胁',
    'Detect secrets in issues, discussions, and more with secret scanning. Metadata like validity checks and public leaks help prioritize active threats.':
      '借助机密扫描，检测议题、讨论等位置中的机密。有效性检查和公开泄露等元数据有助于优先处理仍然有效的威胁。',
    'Give Copilot the heavy lifting': '把繁重工作交给 Copilot',
    'GitHub Copilot finds elusive secrets like passwords without the false positives. It detects secrets that traditional secret detectors are less likely to catch, providing an additional layer of security.':
      'GitHub Copilot 能找出密码等难以发现的机密，且不会产生误报。它能检测到传统机密检测工具不易发现的机密，提供额外一层安全保护。',
    'GitHub partners with 150+ providers to mitigate risks and ensure the highest level of detection accuracy.':
      'GitHub 与 150 多家提供商合作，降低风险并确保最高水平的检测准确度。',
    'Learn about the secret scanning partner program': '了解机密扫描合作伙伴计划',
    'Safer code for everyone': '让每个人的代码更安全',
    "Whether you're securing an open source project or strengthening your enterprise codebase, Secret Protection helps you keep secrets out of your code.":
      '无论你是在保护开源项目，还是在强化企业代码库，机密保护都能帮你让机密远离代码。',
    'Learn how to build security into your code from day one with DevSecOps.': '了解如何借助 DevSecOps 从第一天起就将安全融入代码。',

    // /security/advanced-security/secret-protection：常见问题（首问与视频标题同文）
    'GitHub Secret Protection detects and prevents secret leaks continuously in real-time, proactively blocking sensitive credentials from being pushed to a repository with push protection. With a remarkably low false positive rate and approximately 150 service provider integrations, it enables rapid credential revocation and rotation, enhancing developer productivity.':
      'GitHub 机密保护持续实时检测并防止机密泄露，通过推送保护主动阻止敏感凭据被推送到存储库。凭借极低的误报率和约 150 项服务提供商集成，它能快速撤销和轮换凭据，提升开发人员的工作效率。',
    'What is the secret risk assessment?': '什么是机密风险评估？',
    // 答案末尾「Learn more about」+「GitHub security risk assessments」同代码安全页，按句收录
    'The secret risk assessment provides a free, comprehensive overview of an organization’s secret leak footprint across its GitHub repositories.':
      '机密风险评估免费提供组织在其 GitHub 存储库中机密泄露情况的全面概览。',
    'By analyzing repositories for exposed secrets, it helps admins and developers understand their exposure to potential security risks and offers actionable insights for remediation.':
      '它通过分析存储库中暴露的机密，帮助管理员和开发人员了解自身面临的潜在安全风险，并提供可付诸行动的修复见解。',
    'What is push protection?': '什么是推送保护？',
    'Push protection is designed to prevent sensitive information, such as secrets or tokens, from being pushed to your repository in the first place. It proactively scans your code for secrets during the push process and blocks the push if any are detected.':
      '推送保护旨在从源头上防止机密或令牌等敏感信息被推送到存储库。它会在推送过程中主动扫描代码中的机密，一旦检测到便阻止推送。',
    'What is delegated bypass for push protection?': '什么是推送保护的委托绕过？',
    'Delegated bypass introduces an approval process for developers to bypass push protection. Anyone opting to bypass a push protection block will need to submit a request to a designated group of reviewers, ensuring any risky secrets are not accidentally leaked.':
      '委托绕过为开发人员绕过推送保护引入了审批流程。任何想绕过推送保护拦截的人都需要向指定的审查者组提交请求，确保有风险的机密不会意外泄露。',
    'What are secret scanning validity checks?': '什么是机密扫描有效性检查？',
    'Validity checks help you determine whether detected secrets are still active, enabling developers and security teams to prioritize their response effectively. When a secret is flagged, the system verifies its validity to confirm whether the secret is active or inactive.':
      '有效性检查帮助你判断检测到的机密是否仍然有效，使开发人员和安全团队能够有效地确定响应的优先级。机密被标记后，系统会验证其有效性，确认该机密有效还是无效。',
    'What is the secret scanning partnership program?': '什么是机密扫描合作伙伴计划？',
    'The secret scanning partnership program allows service providers to secure their token formats by enabling GitHub to scan public repositories and npm packages for exposed secrets. When a secret is found in a public repo, GitHub sends an alert directly to the service provider, who can then validate and take appropriate action.':
      '机密扫描合作伙伴计划让服务提供商能够授权 GitHub 扫描公共存储库和 npm 软件包中暴露的机密，从而保护自己的令牌格式。在公共存储库中发现机密时，GitHub 会直接向服务提供商发送警报，由其验证并采取相应措施。',

    // /security/advanced-security/software-supply-chain
    'GitHub Supply Chain': 'GitHub 供应链',
    'Secure your software supply chain': '保护你的软件供应链',
    'Manage open source risks with GitHub’s supply chain security. Detect and fix threats early with automated scanning, updates, and policy enforcement—keeping your software resilient.':
      '借助 GitHub 的供应链安全管理开源风险。通过自动扫描、更新和策略强制实施，及早发现并修复威胁——让你的软件保持韧性。',
    'Secure your dependencies': '保护你的依赖项',
    'Automatically detect vulnerabilities and get trusted updates with Dependabot.': '借助 Dependabot 自动检测漏洞并获取可信更新。',
    'Prioritize what matters': '优先处理重要事项',
    'Dependabot surfaces the top 10% of your most critical alerts first using exploitation likelihood, severity scores, and triage rules.':
      'Dependabot 根据被利用的可能性、严重性评分和分类规则，优先呈现最关键的前 10% 警报。',
    'Distribute what you build': '分发你的构建成果',
    'Easily sign and verify your builds with artifact attestations—simplifying security and compliance.':
      '借助工件证明轻松签名和验证构建——简化安全与合规。',
    'From dependencies to deployment, lock down your supply chain.': '从依赖项到部署，全面守护你的供应链。',
    'Understand your supply chain': '了解你的供应链',
    'Identify critical risks faster with EPSS scores and automated alerts. Map dependencies and dependents, including transitive ones, with one-click SBOMs.':
      '借助 EPSS 评分和自动警报，更快识别关键风险。一键生成 SBOM，梳理依赖项和被依赖项（包括传递依赖）。',
    'Explore supply chain security': '探索供应链安全',
    'Make updates a breeze': '让更新轻而易举',
    'Stay secure with automatic pull requests for the latest dependencies. Dependabot groups updates for faster reviews and merges.':
      '自动创建拉取请求更新到最新依赖项，保持安全。Dependabot 会将更新分组，加快审查与合并。',
    'Explore Dependabot': '探索 Dependabot',
    'Prevent new risks': '防范新风险',
    'Enforce security and license compliance on pull requests with the dependency review action (available with GitHub Code Security).':
      '借助依赖项审查操作（GitHub 代码安全提供），在拉取请求上强制实施安全与许可证合规。',
    'Explore the Dependency Review Action': '探索依赖项审查操作',
    'Don’t just comply, be secure': '不只合规，更要安全',
    'Easily sign and verify builds with artifact attestations. Meet external compliance frameworks like SOC2 or strengthen internal security with SLSA—up to Build Level 3.':
      '借助工件证明轻松签名和验证构建。满足 SOC2 等外部合规框架，或借助 SLSA 强化内部安全——最高可达构建级别 3。',
    'Explore artifact attestations': '探索工件证明',
    'Secure software from the start': '从一开始就保障软件安全',
    'Whether you’re contributing to an open source project or choosing new tools for your team, your security needs are covered with GitHub.':
      '无论你是在为开源项目做贡献，还是在为团队挑选新工具，GitHub 都能满足你的安全需求。',
    'Chat with GitHub Copilot': '与 GitHub Copilot 聊天',
    'Securing your end-to-end supply chain': '保护端到端供应链',
    'Protect your entire GitHub workflow, from personal accounts to code and builds.': '保护整个 GitHub 工作流，从个人帐户到代码和构建。',
    'Read the guide': '阅读指南',

    // /security/advanced-security/software-supply-chain：常见问题
    'What is supply chain security?': '什么是供应链安全？',
    'When developing a software project, you likely use other software to build and run your application, such as open-source libraries, frameworks or other tools. These resources are collectively referred to as your “dependencies”, because your project depends on them to function properly. Your project could rely on hundreds of these dependencies, forming what is known as your "supply chain".':
      '开发软件项目时，你很可能会使用其他软件来构建和运行应用，例如开源库、框架或其他工具。这些资源统称为你的“依赖项”，因为项目要依靠它们才能正常运行。你的项目可能依赖数百个这样的依赖项，从而形成所谓的“供应链”。',
    'Your supply chain can pose a security risk. If one of your dependencies has a known security weakness or a bug, malicious actors could exploit this vulnerability to, for example, insert malicious code (malware), steal sensitive data, or cause some other type of disruption to your project. This type of threat is called a "supply chain attack". Having vulnerable dependencies in your supply chain compromises the security of your own project, and you put your users at risk, too.':
      '供应链可能带来安全风险。如果某个依赖项存在已知的安全弱点或缺陷，恶意行为者就可能利用该漏洞，例如插入恶意代码（恶意软件）、窃取敏感数据，或以其他方式破坏你的项目。这类威胁称为“供应链攻击”。供应链中存在有漏洞的依赖项，会危及你自己项目的安全，也会让你的用户面临风险。',
    'One of the most important things you can do to protect your supply chain is to patch your vulnerable dependencies.':
      '保护供应链最重要的措施之一，就是为存在漏洞的依赖项打补丁。',
    'Attackers don’t just target dependencies you use; they will also target user accounts and build processes as well. It’s important to secure both to ensure that the code you distribute hasn’t been tampered with.':
      '攻击者不只针对你使用的依赖项，还会针对用户帐户和构建流程。务必同时保护好两者，确保你分发的代码未被篡改。',
    // 以下几段答案由相邻文本节点组成（链接未渲染成 <a>），引擎整段匹配：收录整句或按句拆分后的各句；
    // 结尾句点是否单独成节点不确定，另收不带句点的写法
    'GitHub offers a range of features to help you understand the dependencies and secure the dependencies in your environment, and to secure your GitHub accounts and build system.':
      'GitHub 提供一系列功能，帮助你了解并保护环境中的依赖项，以及保护你的 GitHub 帐户和构建系统。',
    'GitHub offers a range of features to help you understand the dependencies and secure the dependencies in your environment, and to secure your GitHub accounts and build system':
      'GitHub 提供一系列功能，帮助你了解并保护环境中的依赖项，以及保护你的 GitHub 帐户和构建系统',
    'Why choose GitHub’s supply chain features instead of third-party products?': '为什么选择 GitHub 的供应链功能，而不是第三方产品？',
    'Unlike third-party security add-ons, GitHub’s supply chain features operate entirely in the native GitHub workflows that developers already know and love. By making it easier for developers to remediate vulnerabilities as they go, GitHub frees time for security teams to focus on critical strategies that protect businesses, customers, and communities from application-based vulnerabilities.':
      '与第三方安全附加组件不同，GitHub 的供应链功能完全在开发人员早已熟悉和喜爱的原生 GitHub 工作流中运行。GitHub 让开发人员能够更轻松地边开发边修复漏洞，从而为安全团队腾出时间，专注于保护企业、客户和社区免受应用漏洞威胁的关键策略。',
    'What is SLSA and SLSA level 3?': '什么是 SLSA 和 SLSA 级别 3？',
    // SLSA 答案首段文本节点（整段未命中时逐个节点匹配）
    'Supply-chain Levels for Software Artifacts (SLSA)': '软件工件供应链级别 (SLSA)',
    'Supply-chain Levels for Software Artifacts (SLSA) is a framework for improving the end-to-end integrity of a software artifact throughout its development lifecycle.':
      '软件工件供应链级别 (SLSA) 是一个框架，用于在软件工件的整个开发生命周期中提升其端到端完整性。',
    'It provides a comprehensive, step-by-step methodology for building integrity and provenance guarantees into your software supply chain.':
      '它提供一套全面、循序渐进的方法，帮助你在软件供应链中建立完整性和来源保证。',
    'SLSA Level 3 signifies a significantly hardened software supply chain where builds are highly isolated, source code history is verified, and provenance is strictly controlled, providing a strong guarantee against tampering and ensuring the integrity of software artifacts.':
      'SLSA 级别 3 代表经过显著加固的软件供应链：构建高度隔离、源代码历史记录经过验证、来源受到严格控制，从而有力防范篡改，确保软件工件的完整性。',
    'GitHub Actions and Artifact Attestations greatly simplify the journey to SLSA Level 3.':
      'GitHub 操作和工件证明可大大简化达到 SLSA 级别 3 的过程。',
    'GitHub Actions and Artifact Attestations greatly simplify the journey to SLSA Level 3':
      'GitHub 操作和工件证明可大大简化达到 SLSA 级别 3 的过程',
    'Can GitHub create software bill of materials or SBOMs?': 'GitHub 能否创建软件物料清单 (SBOM)？',
    'You can export a software bill of materials or SBOM for your repository from the GitHub dependency graph.':
      '你可以从 GitHub 依赖项关系图为存储库导出软件物料清单 (SBOM)。',
    'SBOMs allow transparency into your open source usage and help expose supply chain vulnerabilities, reducing supply chain risks.':
      'SBOM 让你清楚了解开源组件的使用情况，并帮助发现供应链漏洞，降低供应链风险。',
    'Are GitHub’s supply chain features paid or free?': 'GitHub 的供应链功能是付费的还是免费的？',
    'Most of GitHub’s supply chain features are available for free to all users.': 'GitHub 的大多数供应链功能对所有用户免费开放。',
    'A select few advanced features are available to private repos only in GitHub Code Security.':
      '少数高级功能仅在 GitHub 代码安全中面向专用存储库提供。',
    'See pricing.': '查看价格。',

    // /security/plans：计划卡片（价格数字与货币代码 USD 照原文；For teams …、per active committer/month 见上）
    'The perfect pair for complete protection': '全面防护的完美组合',
    'Add-on': '附加组件',
    'Explore platform security features': '探索平台安全功能',
    'Securing your code, end to end': '端到端保护你的代码',
    'GitHub safeguards user accounts, branches, tags, and pushes, and supports SBOMs and artifact attestations for SLSA L3 builds.':
      'GitHub 保护用户帐户、分支、标签和推送，并支持 SBOM 和工件证明，助力实现 SLSA L3 构建。',

    // /security/plans：功能对比表（与 new/plans.ts 的 scoped 同名同译；Provider patterns、Generic patterns、
    // Dependency graph 已由其他文件的 static 收录；单元格的屏幕阅读器文字 Included / Not included）
    'Public repositories': '公共存储库',
    Included: '包含',
    'Not included': '不包含',
    'Push protection': '推送保护',
    'Prevent secret exposures by proactively blocking secrets before they reach your code.': '在机密进入代码前主动拦截，防止机密泄露。',
    'Secret scanning': '机密扫描',
    'Detect and manage exposed secrets across git history, pull requests, issues, and wikis.':
      '在 Git 历史记录、拉取请求、议题和 Wiki 中检测并管理已泄露的机密。',
    'GitHub collaborates with AWS, Azure, and Google Cloud to detect secrets with high accuracy. This minimizes false positives, letting you focus on what matters.':
      'GitHub 与 AWS、Azure 和 Google Cloud 合作，高精度检测机密，尽量减少误报，让你专注于重要的事。',
    'Provider notification': '提供程序通知',
    'Providers get real-time alerts when their tokens appear in public code, enabling them to notify, quarantine, or revoke secrets.':
      '提供程序的令牌出现在公共代码中时，提供程序会实时收到警报，以便通知、隔离或撤销机密。',
    'Validity checks': '有效性检查',
    'Prioritize active secrets with validity checks for provider patterns.': '通过提供程序模式的有效性检查，优先处理仍有效的机密。',
    'Copilot secret scanning': 'Copilot 机密扫描',
    // 原文漏了 secrets（unstructured like passwords），按原意译
    'Use AI to detect unstructured like passwords—without the noise.': '使用 AI 检测密码等非结构化机密——免受误报干扰。',
    'Detect tokens from unknown providers, including HTTP authentication headers, connection strings, and private keys.':
      '检测来自未知提供程序的令牌，包括 HTTP 身份验证标头、连接字符串和私钥。',
    'Push protection bypass controls': '推送保护绕过控制',
    'Manage who can bypass push protection and when.': '管理谁可以在何时绕过推送保护。',
    'Insights in security overview': '安全概述见解',
    'Understand how risk is distributed across your organization with security metrics and insight dashboards.':
      '通过安全指标和见解仪表板，了解风险在组织中的分布。',
    'Scan history API': '扫描历史记录 API',
    'Review how and when GitHub scans your repositories for secrets.': '查看 GitHub 何时以及如何扫描存储库中的机密。',
    'Copilot Autofix': 'Copilot 自动修复',
    'Powered by GitHub Copilot, generate automatic fixes for 90% of alert types in JavaScript, Typescript, Java, and Python.':
      '由 GitHub Copilot 提供支持，为 JavaScript、TypeScript、Java 和 Python 中 90% 的警报类型自动生成修复。',
    'Third party extensibility for code scanning alerts': '代码扫描警报第三方扩展',
    'Centralize your findings across all your scanning tools via SARIF upload to GitHub.':
      '通过将 SARIF 上传到 GitHub，集中管理所有扫描工具的结果。',
    'Contextual vulnerability intelligence and advice': '上下文漏洞情报与建议',
    'Quickly remediate with context provided by Copilot Autofix.': '借助 Copilot 自动修复提供的上下文快速修复。',
    'Uncover vulnerabilities in your code with our industry-leading semantic code analysis.':
      '借助业界领先的语义代码分析发现代码中的漏洞。',
    'Security campaigns': '安全活动',
    'Reduce security debt and burn down your security backlog with security campaigns.': '通过安全活动减少安全债务，清理安全积压。',
    'Get a clear view of your project’s dependencies with a summary of manifest, lock files, and submitted dependencies via the API.':
      '通过清单、锁定文件和经 API 提交的依赖项摘要，清楚了解项目的依赖项。',
    'Dependency review action': '依赖项审查操作',
    'Catch insecure dependencies before adding them and get insights on licenses, dependents, and age.':
      '在添加不安全的依赖项前将其拦截，并了解许可证、被依赖和存在时长等信息。',
    'Dependabot custom auto-triage rules': 'Dependabot 自定义自动分类规则',
    'Define alert-centric policies to control how Dependabot handles alerts and pull requests.':
      '定义以警报为中心的策略，控制 Dependabot 处理警报和拉取请求的方式。',
    'Dependabot security updates with grouped updates': '支持分组更新的 Dependabot 安全更新',
    'Automated pull requests that batch dependency updates for known vulnerabilities.': '自动创建拉取请求，批量更新存在已知漏洞的依赖项。',
    'Dependabot version updates': 'Dependabot 版本更新',
    'Automated pull requests that keep your dependencies up to date.': '自动创建拉取请求，使依赖项保持最新。',
    'Get a clear view of risk distribution with security metrics and dashboards.': '通过安全指标和仪表板清楚了解风险分布。'
  },
  inline: [
    // 评价引言（/security）：<b><元素>GitHub Advanced Security</元素> empowers our developers</b>，产品名单独成元素时
    // 整句改写，产品名与译文之间不留空格（相邻文本节点时整段命中 static）
    ['{} empowers our developers', '{}为我们的开发人员提供有力支持'],
    // /security/advanced-security 常见问题：答案被链接拆开（p > a），链接文字由 static 翻译
    ['Yes. GitHub Advanced Security is available as an {} for Azure DevOps.', '是的。GitHub 高级安全可作为 Azure DevOps 的{}使用。'],
    [
      'Yes. As with all GitHub products, {} for GitHub Advanced Security is publicly available.',
      '是的。与所有 GitHub 产品一样，GitHub 高级安全的{}也是公开的。'
    ],
    ['Yes! Please visit {} to learn more.', '是的！请访问{}了解更多。'],
    // Read our <a>customer stories</a> to learn how customers like <a>客户</a>, <a>客户</a>, and <a>客户</a> use …：
    // 客户名是链接，数目不定（至少两个，and 前可有逗号；槽位两侧的空格不进句型键）；客户名保持原文，与中文之间留空格
    [
      /^Read our \{\} to learn how customers like \{\}((?:, \{\})*)(?:, )?and \{\} use GitHub Advanced Security to secure applications and accelerate the software development lifecycle\.$/,
      (_: string, middle: string) =>
        `阅读我们的{}，了解 {}${middleCustomers(middle)} 和 {} 等客户如何使用 GitHub 高级安全保护应用并加快软件开发生命周期。`
    ]
  ]
} satisfies PageDictionary
