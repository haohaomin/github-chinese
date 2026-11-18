import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * “By clicking “<按钮名>”, you agree to our” 中的按钮名：已知按钮按界面译法替换，其余保留原文。
 * 用 Map 查找，constructor 等原型链键不会命中。
 */
const AGREE_BUTTONS: ReadonlyMap<string, string> = new Map([
  ['Upgrade to GitHub Pro', '升级到 GitHub 专业版'],
  ['Sign up for GitHub', '注册 GitHub']
])

/** 营销同意复选框的示例字段 */
const CONSENT_FIELD: Readonly<Record<string, string>> = {
  name: '姓名',
  'email address': '电子邮件地址',
  country: '国家/地区'
}

/**
 * 示例字段列表由 Intl.ListFormat 按浏览器语言拼接：name, email address, and country（en-US）、
 * name, email address and country（en-GB）、name、email address和country（中文）；未收录的字段保留原文
 */
function consentFields(list: string): string {
  const fields = list.split(/,? and |, |、|和|及/).map(field => {
    const name = field.trim()
    return Object.hasOwn(CONSENT_FIELD, name) ? (CONSENT_FIELD[name] ?? name) : name
  })
  const last = fields[fields.length - 1] ?? ''
  return fields.length > 1 ? `${fields.slice(0, -1).join('、')}和${last}` : last
}

/**
 * GitHub 自有页面正文（页面类型 common）：地址与联系表单，
 * 高级支持（/premium-support）、企业试用（/enterprise/trial、试用计划选择 /organizations/enterprise_plan 与创建企业表单）、
 * 联系销售表单、Copilot 结账与购买流程、升级到专业版等。国家/地区、州/省列表见 regions.ts。
 * 另有未登录首页（/）与功能页（/features）的营销正文、网站地图（/sitemap）标题、开发人员计划注册页（/developer/register）、
 * Spark（/spark：首页、列表与编辑器）。这些页面只有 common 作用域（首页另有 dashboard），一律收 static。
 * 产品名、方案名按用户要求译成中文（GitHub Enterprise → GitHub 企业版、Enterprise Cloud / Server → 企业云 / 企业服务器、
 * Premium Plus → 高级增强）；品牌词 GitHub、Copilot、Spark、Dependabot 与缩写 GHEC / GHES / GHAS / CRE 保留；
 * 客户名、公司名保留原文。
 * 不收录：易与其他页面冲突的短词（Free、Team、Enterprise、Business、Standard 等）；
 * Spark 侧边面板标签 Theme（与项目自定义字段名同形）；
 * 结账页标题 Checkout（与 Actions 常见步骤名同形）；引言片段 At、With（过短，整句见 inline）。
 */
export default {
  static: {
    // 地址与联系表单
    'Choose your country/region': '选择你的国家/地区',
    'Select state': '选择州',
    'Select province': '选择省份',

    // 高级支持 /premium-support：首屏与权益
    'GitHub Premium Support': 'GitHub 高级支持',
    'GitHub Premium Plus Support': 'GitHub 高级增强支持',
    'Get 24/7 support for your business with GitHub Premium Support': 'GitHub 高级支持为你的业务提供 24/7 支持',
    'Protect your business': '保护你的业务',
    'and manage IT health with a comprehensive support plan.': '并借助全面的支持计划管理 IT 健康状况。',
    'Drive operational efficiency': '提升运营效率',
    'and boost uptime with dedicated GitHub experts.': '并借助专属 GitHub 专家提升正常运行时间。',
    'Empower your team': '为团队赋能',
    'and meet your goals with the resources to maximize your investment.': '并借助丰富资源实现目标，让投资发挥最大价值。',
    'Get a quote': '获取报价',
    'Looking for general support questions? Contact GitHub Support.': '有一般支持问题？请联系 GitHub 支持。',
    'Already an existing customer?': '已经是客户？',
    'Upgrade to GitHub Premium Support to drive impact quickly.': '升级到 GitHub 高级支持，快速见效。',
    'Experience faster responses 24/7 to maximize your uptime': '全天候更快响应以最大限度提高正常运行时间',
    'Receive expert support in one central location': '在一处集中获得专家支持',
    'Get a dedicated engineer who knows your account': '获得熟悉你帐户的专属工程师',
    'Discover all features': '了解全部功能',
    'Get GitHub Premium Support with your Microsoft Unified Support plan.': '通过 Microsoft Unified Support 计划获取 GitHub 高级支持。',
    'Provide your team with convenient, self-service tools': '为团队提供便捷的自助服务工具',
    'Ensure the reliability of your environment': '确保环境的可靠性',
    'Accelerate your goals with best-in-class support': '借助一流支持加速实现目标',
    'Check your benefits': '查看你的权益',
    'Not a GitHub Enterprise customer yet?': '还不是 GitHub 企业版客户？',
    'Learn more about GitHub Premium Support and GitHub Premium Plus Support to discover the plan that’s right for you.':
      '了解 GitHub 高级支持和 GitHub 高级增强支持，找到适合你的计划。',
    'Why choose GitHub Premium Support?': '为什么选择 GitHub 高级支持？',
    // 引言：“At <TSIA 链接>, we're seeing …”，整句见 inline；At 过短不收，此为整句未命中时的片段
    ", we're seeing technology leaders take an active role in helping their customers adopt new technologies. GitHub is demonstrating a thoughtful, deliberate approach to creating compelling service offerings.":
      '，我们看到技术领导者正积极帮助客户采用新技术。GitHub 在打造有吸引力的服务方面展现出深思熟虑、审慎周到的做法。',
    'With three tiers of service options, GitHub Premium Support provides customers with smart services at the right time to drive business goals, while simplifying customer choice and allowing for service expansion as needed.':
      'GitHub 高级支持提供三个级别的服务选项，在恰当的时机为客户提供智能服务以推动业务目标，同时简化客户选择，并可按需扩展服务。',
    // 署名：“Hal Stanley // VP …, <TSIA 链接>”
    'Hal Stanley // VP Service Offer Management Research & Advisory,': 'Hal Stanley // 服务产品管理研究与咨询副总裁，',

    // 高级支持：计划选择与比较表
    'Discover the plan that’s right for you': '找到适合你的计划',
    'Use the dropdown filters to reflect your organization’s properties.': '使用下拉筛选器匹配你组织的情况。',
    'GHEC/GHES dual use + GHAS': 'GHEC/GHES 同时使用 + GHAS',
    'License seats': '许可席位',
    Complexity: '复杂度',
    'No ticket SLAs': '无工单 SLA',
    'Already included with your Enterprise license:': '已包含在你的企业版许可证中：',
    'Already included with your Enterprise license': '已包含在你的企业版许可证中',
    'Support via online ticket submission': '通过在线提交工单获得支持',
    'Expert guidance from a shared support team': '来自共享支持团队的专家指导',
    '30 min': '30 分钟',
    '4 hours': '4 小时',
    '24 hours': '24 小时',
    '48 hours': '48 小时',
    '< 8 hours': '< 8 小时',
    'Initial response for urgent requests': '紧急请求的首次响应',
    'Initial response for high requests': '高优先级请求的首次响应',
    'Initial response for normal requests': '普通优先级请求的首次响应',
    'Initial response for low requests': '低优先级请求的首次响应',
    'Support entitlements': '支持权益',
    'Get everything in the Enterprise support plan, along with:': '包含企业版支持计划的全部内容，另有：',
    'Phone support in English via callback request': '通过回拨请求提供英语电话支持',
    'Guaranteed service level agreements (SLAs)': '有保障的服务等级协议 (SLA)',
    '20 support entitlement licenses': '20 个支持权益许可证',
    'Priority ticket handling': '工单优先处理',
    'Escalation management': '工单升级管理',
    'Unlimited automated health check reports for GHES': '无限量的 GHES 自动健康检查报告',
    'Access to premium training content': '访问高级培训内容',
    'Named CRE': '指定 CRE',
    'Per account': '每个帐户',
    '1 training': '1 次培训',
    'Per year': '每年',
    'Get everything in Premium support plan, along with:': '包含高级支持计划的全部内容，另有：',
    'Additional 20 support entitlement licenses': '额外 20 个支持权益许可证',
    'Designated Customer Reliability Engineer (CRE)': '指定的客户可靠性工程师 (CRE)',
    'Incident management': '事件管理',
    'Quarterly enhanced health checks with findings, interpretations, and recommendations from a CRE (by request)':
      '每季度增强健康检查，附 CRE 提供的发现、解读和建议（按需提供）',
    'Crisis prevention: Guided incident simulations that help you prepare for — and experience — an incident without risk (available for GitHub Enterprise Server)':
      '危机预防：通过引导式事件模拟，帮助你无风险地为事件做好准备并亲身体验（适用于 GitHub 企业服务器）',
    '1 virtual training class per year': '每年 1 次线上培训课程',
    '12 hours of technical advisory hours per quarter': '每季度 12 小时技术咨询时长',
    'Application upgrade assistance (by request)': '应用升级协助（按需提供）',
    'Cloud planning (by request)': '云规划（按需提供）',
    'Compare all features': '比较全部功能',
    // 窄屏计划选择：Features on <span>计划名</span>，整句见 inline；此为整句未命中时的片段
    'Features on': '功能',
    'Switch plans': '切换计划',
    'Select a plan to review its features': '选择计划以查看其功能',
    'How to get started?': '如何开始？',
    'Plan coverage': '计划涵盖范围',
    'Does not include:': '不包括：',
    'Included with Enterprise Cloud and Enterprise Server': '包含在企业云和企业服务器中',
    'Available for Enterprise Cloud and Enterprise Server': '适用于企业云和企业服务器',
    'Support hours': '支持时间',
    'Initial response time': '首次响应时间',
    '30 minutes for Urgent (including initial troubleshooting)': '紧急优先级 30 分钟（含初步故障排查）',
    '4 hours for High': '高优先级 4 小时',
    '24 hours for Normal': '普通优先级 24 小时',
    '48 hours for Normal': '普通优先级 48 小时',
    '48 hours for Low': '低优先级 48 小时',
    'n/a': '不适用',
    'Access to premium content': '访问高级内容',
    'One virtual training class is offered per year, with topics such as “GitHub for developers” and “GitHub for admins”.':
      '每年提供一次线上培训课程，主题包括“面向开发人员的 GitHub”和“面向管理员的 GitHub”等。',
    'Members with support entitlements': '拥有支持权益的成员',
    'These members determine if incoming inquiries can be addressed via their company’s admin or only by GitHub.':
      '这些成员决定收到的咨询可以由其公司的管理员处理，还是只能由 GitHub 处理。',
    'Dedicated resources': '专属资源',
    'Priority ticket handling + named Customer Reliability Engineer': '工单优先处理 + 指定的客户可靠性工程师',
    'For High and Urgent priority tickets': '适用于高优先级和紧急工单',
    'For Urgent priority tickets, as needed': '适用于紧急工单，按需提供',
    'Ensures you have the technical resources needed for case resolution, and is available 24/7.':
      '确保你拥有解决工单所需的技术资源，全天候提供。',
    'Health Checks': '健康检查',
    'Unlimited automated Health Check reports (see “Generating a Health Check for your enterprise”)':
      '无限量的自动健康检查报告（参见“为企业生成健康检查”）',
    'Crisis Prevention': '危机预防',
    'Up to four sessions about reliability best practices, preparing for a potential incident, and efficiently interacting with GitHub Support.':
      '最多四次会议，内容涵盖可靠性最佳实践、为潜在事件做准备，以及如何与 GitHub 支持高效沟通。',
    'Technical advisory hours': '技术咨询时长',
    '12 hours per quarter': '每季度 12 小时',
    'Hours can be scheduled at your discretion. You can use them for technical tasks, such as prepping for a GitHub Enterprise Server upgrade.':
      '时长可由你自行安排，可用于技术任务，例如为 GitHub 企业服务器升级做准备。',
    'Application upgrade assistance': '应用升级协助',
    'By request': '按需提供',
    'Delivered upon request via our Customer Reliability Engineers.': '应要求由我们的客户可靠性工程师提供。',
    'Cloud planning': '云规划',
    "GitHub's Special Events Support": 'GitHub 特殊活动支持',
    'Dedicated senior support engineer coverage for high-traffic or high-risk events. Support is available in 24-hour increments, with the most common packages offering 24- or 48-hour coverage.':
      '为高流量或高风险活动提供专属资深支持工程师保障。支持以 24 小时为单位提供，最常见的套餐提供 24 或 48 小时保障。',
    'Pre-event system checks and readiness planning': '活动前系统检查与就绪规划',
    'Real-time support via a dedicated channel': '通过专属渠道提供实时支持',
    'Post-event debriefs with actionable recommendations': '活动后复盘并提供可执行的建议',

    // 高级支持：客户评价与团队
    'See what customers are saying about GitHub Premium Support': '看看客户如何评价 GitHub 高级支持',
    'Our support engineer was very helpful in pointing me to the exact resource I needed in minutes.':
      '我们的支持工程师帮了大忙，几分钟内就为我找到了需要的资源。',
    'The support agent took care of the request with a great sense of urgency and addressed the issue well.':
      '支持人员处理请求非常及时，问题解决得很好。',
    "I'd like to applaud our engineer for how he exceptionally responded to our query. This ticket was not a simple, one-answer investigation and I was very happy with how he explored multiple angles to investigate.":
      '我要为我们的工程师点赞，他对我们问题的响应非常出色。这个工单并不是简单的一问一答式调查，他从多个角度深入排查，我非常满意。',
    'Our engineer was super helpful and spot on with figuring out the problem. The steps he suggested helped me figure out the problem quickly. Kudos!':
      '我们的工程师帮了大忙，精准地找出了问题。他建议的步骤让我很快弄清了问题。点赞！',
    'Meet your dedicated GitHub Premium Support team': '认识你的专属 GitHub 高级支持团队',
    'Premium Support Engineers': '高级支持工程师',
    'Premium Support Engineers, available only for GitHub Premium Support customers, are dedicated resources who manage and coordinate your entire GitHub Premium Support experience.':
      '高级支持工程师仅面向 GitHub 高级支持客户，是专门负责管理和协调你整个 GitHub 高级支持体验的专属资源。',
    'Support Incident Coordinators': '支持事件协调员',
    'Support Incident Coordinators are responsible for any major incident management, from initiation until resolution, and are available to you 24/7.':
      '支持事件协调员负责所有重大事件的管理，从发起直至解决，全天候为你服务。',
    'Customer Reliability Engineers (CREs)': '客户可靠性工程师 (CRE)',
    'Customer Reliability Engineers (CREs), available only for GitHub Premium Plus Support customers, know your customer account in detail and can provide answers faster than Premium Support Engineers.':
      '客户可靠性工程师 (CRE) 仅面向 GitHub 高级增强支持客户，他们详细了解你的客户帐户，能比高级支持工程师更快地给出解答。',

    // 高级支持：常见问题
    'About GitHub Premium Support': '关于 GitHub 高级支持',
    'What is GitHub Premium Support for?': 'GitHub 高级支持有什么用？',
    'GitHub Premium Support helps customers implement GitHub Enterprise quickly and effectively across the organization with 24/7 support.':
      'GitHub 高级支持通过 24/7 支持，帮助客户在整个组织中快速有效地实施 GitHub 企业版。',
    'How much does GitHub Premium Support cost?': 'GitHub 高级支持的费用是多少？',
    // “please get in touch with the <GitHub Premium Support Sales 链接> sales team.”
    'For pricing information, please get in touch with the': '如需了解价格信息，请联系',
    'GitHub Premium Support Sales': 'GitHub 高级支持',
    'sales team.': '销售团队。',
    'What are the levels of support in GitHub Premium Support?': 'GitHub 高级支持有哪些支持级别？',
    'There are three levels of support:': '共有三个支持级别：',
    'The basic plan included with your GitHub Enterprise license': '你的 GitHub 企业版许可证中包含的基础计划',
    'Please refer to our': '请参阅我们的',
    'plan comparison table': '计划比较表',
    'How do I contact GitHub Premium Support?': '如何联系 GitHub 高级支持？',
    'If you are an existing GitHub Premium Support customer, please sign in to our': '如果你已是 GitHub 高级支持客户，请登录我们的',
    'support portal': '支持门户',
    '. If you don’t already have GitHub Premium Support, please': '。如果你还没有 GitHub 高级支持，请',
    'contact sales': '联系销售',
    'Choosing your plan': '选择计划',
    'What is escalation and incident management?': '什么是工单升级与事件管理？',
    'Escalation and incident management is the ability to escalate ticket progression in the GitHub support portal. After someone escalates a ticket, Support Incident Coordinators orchestrate all necessary parties to resolve the ticket. Additionally, Senior Escalation Engineers (SEEs) facilitate GitHub-internal technical communications and liaise with the rest of GitHub to improve the support team’s capability in similar future circumstances.':
      '工单升级与事件管理是指在 GitHub 支持门户中升级工单处理进度的能力。工单升级后，支持事件协调员会协调所有必要的相关方来解决该工单。此外，资深升级工程师 (SEE) 会推动 GitHub 内部的技术沟通，并与 GitHub 其他团队联络，以提升支持团队今后应对类似情况的能力。',
    'What is incident response management?': '什么是事件响应管理？',
    'Incident response management helps manage the technical resources needed for case resolution. Support Incident Coordinators are available for incident response management 24/7.':
      '事件响应管理帮助管理解决工单所需的技术资源。支持事件协调员全天候提供事件响应管理。',
    'What are my SLAs for initial response?': '首次响应的 SLA 是多少？',
    'GitHub Premium Support and GitHub Premium Plus Support customers have SLAs. For urgent priority tickets, your SLA guarantees a 30-minute initial response time, which includes troubleshooting. For high priority tickets, your SLA provides a four-hour initial response time.':
      'GitHub 高级支持和 GitHub 高级增强支持客户享有 SLA。对于紧急工单，SLA 保证 30 分钟内首次响应，其中包括故障排查。对于高优先级工单，SLA 保证 4 小时内首次响应。',
    'What’s included in initial troubleshooting?': '初步故障排查包括哪些内容？',
    'For initial troubleshooting, the assigned Premium Support Engineer/Customer Reliability Engineer will review and acknowledge your ticket. To better understand the issue and start troubleshooting, the engineer may ask for additional information such as screenshots, error messages, log files, diagnostics files, support bundles, or the output of specific console commands. They may also collaborate with others in support, engineering, or in the regional incident commander.':
      '在初步故障排查中，分配的高级支持工程师/客户可靠性工程师会审查并确认你的工单。为更好地了解问题并开始排查，工程师可能会要求提供更多信息，例如屏幕截图、错误消息、日志文件、诊断文件、支持包或特定控制台命令的输出。他们也可能与支持团队、工程团队或区域事件指挥官协作。',
    'How do I get health check reports?': '如何获取健康检查报告？',
    'GitHub Premium Support and GitHub Premium Plus Support customers are entitled to unlimited automated health check reports. Additionally, GitHub Premium Plus Support customers can request quarterly enhanced health checks with findings, interpretations, and recommendations from a Customer Reliability Engineer (CRE).':
      'GitHub 高级支持和 GitHub 高级增强支持客户可获得无限量的自动健康检查报告。此外，GitHub 高级增强支持客户还可以申请每季度的增强健康检查，并获得客户可靠性工程师 (CRE) 提供的发现、解读和建议。',
    'What is crisis prevention?': '什么是危机预防？',
    'Crisis prevention allows GitHub Enterprise Server customers to prepare for — and experience — an incident without risk. Your Customer Reliability Engineer (CRE) guides your team through an incident simulation in a safe and controlled environment.':
      '危机预防让 GitHub 企业服务器客户能够无风险地为事件做好准备并亲身体验。你的客户可靠性工程师 (CRE) 会在安全可控的环境中引导团队完成事件模拟。',
    'Crisis Prevention consists of up to four sessions about reliability best practices, preparing for a potential incident, and efficiently interacting with GitHub Support. After the incident simulation, your CRE will run a detailed retrospective, uncovering lessons learned and improvement suggestions for the future.':
      '危机预防包括最多四次会议，内容涵盖可靠性最佳实践、为潜在事件做准备，以及如何与 GitHub 支持高效沟通。事件模拟结束后，CRE 会进行详细复盘，总结经验教训并提出今后的改进建议。',
    'How long does GitHub Premium Support take?': 'GitHub 高级支持的响应需要多长时间？',
    'GitHub Premium Support and GitHub Premium Plus Support Plus customers have service-level agreements (SLAs) for initial response. For urgent priority tickets, the initial response SLA guarantees a 30-minute initial response time, which includes troubleshooting. For high-priority tickets, the initial response SLA provides a four-hour time.':
      'GitHub 高级支持和 GitHub 高级增强支持客户享有首次响应的服务等级协议 (SLA)。对于紧急工单，首次响应 SLA 保证 30 分钟内首次响应，其中包括故障排查。对于高优先级工单，首次响应 SLA 保证 4 小时内响应。',
    'We currently do not provide estimates for time to resolution, as the complexity of tickets varies. However, we review these metrics on a regular basis and reduce times whenever possible.':
      '由于工单复杂度各不相同，我们目前不提供解决时间的预估。不过，我们会定期审查这些指标，并尽可能缩短时间。',
    'How do I resolve a problem in GitHub Enterprise?': '如何解决 GitHub 企业版中的问题？',
    'You can get support via online ticket submission if you’re using the basic plan included with your GitHub Enterprise license. If you have GitHub Premium Support or GitHub Premium Plus Support, you can submit a ticket online. For urgent tickets, GitHub Premium Support and GitHub Premium Plus Support customers can request a callback with one of our Premium Support Engineers or Customer Reliability Engineers (CREs). Please refer to our':
      '如果你使用的是 GitHub 企业版许可证中包含的基础计划，可以通过在线提交工单获得支持。如果你拥有 GitHub 高级支持或 GitHub 高级增强支持，可以在线提交工单。对于紧急工单，GitHub 高级支持和 GitHub 高级增强支持客户可以请求我们的高级支持工程师或客户可靠性工程师 (CRE) 回电。请参阅我们的',
    'Rules and policies': '规则与政策',
    'If I do not use all the technical advisory hours in a given quarter, can they be carried over?':
      '某季度未用完的技术咨询时长可以结转吗？',
    'Premium Plus customers may use up to 12 technical advisory hours per quarter. Unused technical advisory hours may not be carried over into the next quarter.':
      '高级增强支持客户每季度最多可使用 12 小时技术咨询时长。未使用的技术咨询时长不能结转到下一季度。',
    'How can the technical advisory support hours be used?': '技术咨询支持时长可以怎么用？',
    'There are multiple ways you can use technical advisory hours, including but not limited to:': '技术咨询时长有多种用法，包括但不限于：',
    'Consultations regarding GitHub best practices and general recommendations': '关于 GitHub 最佳实践和一般建议的咨询',
    'GitHub Enterprise Server upgrade preparation and assistance': 'GitHub 企业服务器升级准备与协助',
    'Does GitHub Premium Support provide service on weekends?': 'GitHub 高级支持在周末提供服务吗？',
    'Yes! GitHub Premium Support and GitHub Premium Plus Support customers receive 24/7 support.':
      '是的！GitHub 高级支持和 GitHub 高级增强支持客户可获得 24/7 支持。',
    'Upgrading your plan': '升级计划',
    'What virtual trainings are available with GitHub Premium Plus Support and who can participate?':
      'GitHub 高级增强支持提供哪些线上培训？谁可以参加？',
    'Customers get access to one virtual training class per year. Topics include:': '客户每年可参加一次线上培训课程。主题包括：',
    'GitHub for developers': '面向开发人员的 GitHub',
    // 课程名括号里的 Server / Cloud 指企业服务器 / 企业云（产品名译中文），括号内有中文用全角
    'GitHub for admins (Server)': '面向管理员的 GitHub（服务器）',
    'GitHub for admins (Cloud)': '面向管理员的 GitHub（云）',
    'GitHub for non-developers': '面向非开发人员的 GitHub',
    'GH API Training': 'GH API 培训',
    'GH Actions Fundamentals': 'GH 操作基础',
    'GH Actions Intermediate': 'GH 操作中级',
    'GH Copilot Fundamentals': 'GH Copilot 基础',
    'GH Copilot Intermediate': 'GH Copilot 中级',
    'GH Copilot Administration & Security': 'GH Copilot 管理与安全',
    'GitHub Enterprise Implementation (Cloud)': 'GitHub 企业版实施（云）',
    'We recommend limiting training sessions to a maximum of 16 participants to ensure an optimal provider-to-participant ratio and a high-quality delivery experience. However, in specific cases where it makes sense, we can accommodate up to 20–25 participants while maintaining our commitment to delivering a valuable training experience for your team.':
      '我们建议每次培训最多 16 人参加，以确保讲师与学员的最佳比例和高质量的授课体验。不过在合适的特定情况下，我们最多可容纳 20–25 个学员，同时仍致力于为你的团队提供有价值的培训体验。',
    'What value will I get by upgrading to GitHub Premium Plus Support?': '升级到 GitHub 高级增强支持能带来什么价值？',
    'GitHub Premium Plus Support customers get an assigned Customer Reliability Engineer (CRE), quarterly enhanced health checks, access to crisis prevention, technical advisory hours, and many additional benefits, which you can review in our':
      'GitHub 高级增强支持客户可获得分配的客户可靠性工程师 (CRE)、每季度增强健康检查、危机预防、技术咨询时长以及更多其他权益，详情请查看我们的',
    'What’s the benefit of having a Customer Reliability Engineer (CRE) over a Premium Support Engineer?':
      '相比高级支持工程师，客户可靠性工程师 (CRE) 有什么优势？',
    'A CRE knows your customer account in detail and can help you expedite case resolution faster than a Premium Support Engineer.':
      'CRE 详细了解你的客户帐户，能比高级支持工程师更快地帮你解决工单。',
    'Since I get GitHub Enterprise Support for free, why should I upgrade to GitHub Premium Support?':
      '既然可以免费获得 GitHub 企业版支持，为什么还要升级到 GitHub 高级支持？',
    'Most customers upgrade to GitHub Premium Support because they need initial response SLAs for urgent and high priority requests, phone support, and health checks. To see a full list of features for GitHub Premium Support packages, please refer to our':
      '大多数客户升级到 GitHub 高级支持，是因为需要紧急和高优先级请求的首次响应 SLA、电话支持和健康检查。如需查看 GitHub 高级支持套餐的完整功能列表，请参阅我们的',
    'Ready to maximize your investment?': '准备好让投资发挥最大价值了吗？',
    'Get in touch with a GitHub Premium Support specialist today.': '立即联系 GitHub 高级支持专家。',
    'Click below to fill out the form, and our management team will contact you within 48 hours.':
      '单击下方填写表单，我们的管理团队将在 48 小时内与你联系。',

    // 高级支持：图片替代文本
    'Page navigation': '页面导航',
    'Screenshot of video call interface showing high CPU load chart with urgent API request analysis for a slow GitHub Enterprise Server.':
      '视频通话界面截图，显示一台响应缓慢的 GitHub 企业服务器的高 CPU 负载图表和紧急 API 请求分析。',
    "Screenshot of a Health Check report interface with high-level instance health check and a primary call to action to 'Request Health Check'":
      '健康检查报告界面截图，包含实例健康状况概述和“请求健康检查”主操作按钮',
    'A smiling GitHub Support Engineer wearing headphones and a branded hoodie, monitoring the enterprise-premium-support Slack channel on a large desktop monitor.':
      '一位面带微笑的 GitHub 支持工程师戴着耳机、穿着品牌连帽衫，正在大屏显示器上关注 enterprise-premium-support Slack 频道。',
    'A woman from behind coding on a laptop.': '一位女士在笔记本电脑上编程的背影。',
    'A man working on a laptop at his desk.': '一位男士在办公桌前用笔记本电脑工作。',
    'Two men working on computers at neighboring desks.': '两位男士在相邻的办公桌前用电脑工作。',
    'A woman video calling with someone on a laptop while sitting at the table.': '一位女士坐在桌前用笔记本电脑与人视频通话。',
    'Spotify logo': 'Spotify 徽标',
    'Slack logo': 'Slack 徽标',
    'Arm logo': 'Arm 徽标',
    'Dow Jones logo': 'Dow Jones 徽标',
    'Ford logo': 'Ford 徽标',
    'Uber logo': 'Uber 徽标',
    'TSIA logo': 'TSIA 徽标',

    // 企业试用 /enterprise/trial
    'Try the GitHub platform': '试用 GitHub 平台',
    'The platform that powers more than 90% of the Fortune 100': '为超过 90% 的财富 100 强企业提供支持的平台',
    'Start a 30 day free trial': '开始 30 天免费试用',
    'Start a free 30 day trial': '开始 30 天免费试用',
    '30-day free trial': '30 天免费试用',
    Logos: '徽标',
    'Pause animation': '暂停动画',
    'Play animation': '播放动画',
    'What you get in your premium free trial': '高级免费试用包含的内容',
    'What you get in your premium free trial:': '高级免费试用包含：',
    "Unlock GitHub's premium features": '解锁 GitHub 的高级功能',
    'Try GitHub Enterprise Cloud, Advanced Security, and Copilot Business to see how they can transform your workflow.':
      '试用 GitHub 企业云、高级安全和 Copilot 商业版，看看它们如何改变你的工作流。',
    'Simplify management with an enterprise account': '使用企业帐户简化管理',
    'Manage multiple organizations with ease, streamline collaboration, and scale your development processes.':
      '轻松管理多个组织，简化协作，并扩展开发流程。',
    'Give up to 50 users risk-free access': '为最多 50 个用户提供无风险访问',
    'Invite up to 50 members of your team to utilize the best of GitHub free for 30 days.':
      '邀请最多 50 个团队成员免费使用 GitHub 的最佳功能 30 天。',
    'GitHub is more than just a place to store code,': 'GitHub 不仅仅是存放代码的地方，',
    'it’s a full-featured platform where we can manage the entire developer workflow.':
      '它是一个功能完备的平台，我们可以在上面管理整个开发人员工作流。',
    'Developer Tools Lead // EY Technology': '开发人员工具负责人 // EY Technology',
    'Build what’s next today': '立即构建未来',
    'With an all-in-one, end-to-end platform that’s beloved by developers, GitHub makes it simple to build what’s next faster, at scale, and more securely.':
      'GitHub 是深受开发人员喜爱的一体化端到端平台，让你更快、更大规模、更安全地构建未来。',
    'Find out how GitHub compares': '了解 GitHub 与其他平台的比较',
    // 比较项标签（方案名、产品名译中文）
    'Enterprise:': '企业版：',
    'Advanced Security:': '高级安全：',
    'Seamlessly plan, build, and ship great software with an extensible DevOps platform':
      '借助可扩展的 DevOps 平台，无缝规划、构建和交付出色的软件',
    'Spend less time fixing security vulnerabilities with AI-powered AppSec tools': '借助 AI 驱动的 AppSec 工具减少修复安全漏洞的时间',

    // 企业版试用计划选择 /organizations/enterprise_plan。产品名 Enterprise Cloud / Server 全站同译（new/plans.ts 同译）
    'Pick your trial plan': '选择试用计划',
    'Enterprise Cloud': '企业云',
    'Build and deploy to GitHub-hosted cloud environments, directly from your repositories.':
      '直接从存储库构建并部署到 GitHub 托管的云环境。',
    'Enterprise Server': '企业服务器',
    // 按参考词库原文收录：末尾 GC 疑为截断，现行全文未核实
    'Manage and deploy GitHub Enterprise on your own servers, including AWS, Azure, or GC':
      '在你自己的服务器（包括 AWS、Azure 或 GC）上管理并部署 GitHub 企业版',
    // 卡片底部 Why teams <心形图标> it: …，片段连读为“团队为何 ♥ 它：…”
    'Why teams': '团队为何',
    'it: Get started in minutes, and leave the infrastructure to us.': '它：几分钟即可上手，基础设施交给我们。',
    'it: Control where your code and data live in a private cloud.': '它：在私有云中掌控代码和数据的存放位置。',

    // 创建企业（试用）：企业类型
    'Choose an Enterprise plan': '选择企业版计划',
    'Set up your GitHub Enterprise Managed Users trial': '设置 GitHub 企业托管用户试用',
    'Start by choosing an enterprise type': '首先选择企业类型',
    'Your enterprise type determines whether members can contribute to public repositories and if they can use their personal GitHub accounts.':
      '企业类型决定成员能否向公共存储库贡献，以及能否使用其个人 GitHub 帐户。',
    'Learn more about enterprise types': '了解企业类型',
    'Enterprise icon': '企业图标',
    'Enterprise with managed users': '使用托管用户的企业',
    'Recommended for internal work': '推荐用于内部工作',
    'For private and internal work only, with member accounts provisioned from your identity provider.':
      '仅用于专用和内部工作，成员帐户由你的标识提供者预配。',
    'For private, internal work only, with member accounts provisioned from your identity provider.':
      '仅用于专用、内部工作，成员帐户由你的标识提供者预配。',
    'Get started with managed users': '开始使用托管用户',
    'Enterprise with personal accounts': '使用个人帐户的企业',
    'Recommended for public and private work': '推荐用于公共和专用工作',
    'For public, open source and private work, that allows members to access your repositories with their personal GitHub accounts.':
      '用于公共、开源和专用工作，允许成员使用其个人 GitHub 帐户访问你的存储库。',
    'Get started with personal accounts': '开始使用个人帐户',
    'Learn more about Enterprise Managed Users': '了解企业托管用户',
    'To bring your organization along or allow members to use their personal GitHub accounts, we recommend':
      '如需纳入现有组织或允许成员使用个人 GitHub 帐户，我们建议',

    // 创建企业：数据托管与企业信息
    'Data hosting': '数据托管',
    'Choose which geographical location to store your data': '选择存储数据的地理位置',
    'By default, GitHub stores data for GitHub.com in the United States.': '默认情况下，GitHub 将 GitHub.com 的数据存储在美国。',
    // “With <GitHub Enterprise Cloud with Data Residency 链接>, you can choose …”，整句见 inline；
    // With 过短不收，此为整句未命中时的片段
    'GitHub Enterprise Cloud with Data Residency': '具有数据驻留的 GitHub 企业云',
    ', you can choose where your company’s code and data are stored. Your enterprise will be hosted on a dedicated subdomain of GHE.com.':
      '，你可以选择公司代码和数据的存储位置。你的企业将托管在 GHE.com 的专用子域上。',
    // 原文只有域名里的点，没有逗号，译文不加
    'Host on GitHub.com without data residency': '托管在 GitHub.com 上且不使用数据驻留',
    Europe: '欧洲',
    'Enterprise name': '企业名称',
    'e.g. Acme, Inc.': '例如 Acme, Inc.',
    'Enterprise URL slug': '企业 URL 标识',
    'e.g. acme-inc.': '例如 acme-inc',
    'This will be your enterprise profile URL.': '这将是你的企业个人资料 URL。',
    Subdomain: '子域',
    'This will be your enterprise subdomain e.g. acme-inc.ghe.com': '这将是你的企业子域，例如 acme-inc.ghe.com',
    'Admin information': '管理员信息',
    'Admin name': '管理员姓名',
    'Admin work email': '管理员工作电子邮件',
    'This email should send and receive emails.': '此电子邮件地址应能收发电子邮件。',
    'This contact will be the first and only admin account responsible to configure the identity provider to provision user accounts and has unique recovery access in the event of an outage.':
      '此联系人将是第一个也是唯一一个管理员帐户，负责配置标识提供者以预配用户帐户，并在服务中断时拥有唯一的恢复访问权限。',
    'User responsible for configuring this enterprise.': '负责配置此企业的用户。',
    'Username shortcode (cannot be edited later)': '用户名短代码（之后无法编辑）',
    'e.g. usc for University of Southern California': '例如 usc 代表 University of Southern California',
    'What is a username shortcode?': '什么是用户名短代码？',
    'Members of this enterprise will be created with login handles like': '此企业成员的登录名将形如',
    'Your setup admin username will be:': '你的设置管理员用户名将是：',
    'You will set the password for this user in the next step.': '你将在下一步为此用户设置密码。',
    'Identity Provider': '标识提供者',
    "Select which identity provider you will use to manage your enterprise's user accounts.": '选择用于管理企业用户帐户的标识提供者。',
    'Custom or other': '自定义或其他',
    Industry: '行业',
    'Specify your industry': '指定你的行业',
    'Number of employees': '员工人数',
    'Agriculture & Mining': '农业与采矿',
    'Business Services': '商业服务',
    'Computers & Electronics': '计算机与电子',
    'Consumer Services': '消费者服务',
    'Energy & Utilities': '能源与公用事业',
    'Financial Services': '金融服务',
    'Food & Beverage': '食品与饮料',
    'Media & Entertainment': '媒体与娱乐',
    'Not For Profit': '非营利',
    'Real Estate & Construction': '房地产与建筑',
    Retail: '零售',
    'Software & Internet': '软件与互联网',
    Telecommunications: '电信',
    'Transportation & Storage': '交通运输与仓储',
    'Travel, Recreation, and Leisure': '旅游、娱乐与休闲',
    'Wholesale & Distribution': '批发与分销',
    'Create enterprise': '创建企业',
    'Trial terms': '试用条款',
    // “I understand that <certain features 链接> are unavailable during the trial experience.”
    'I understand that': '我了解',
    'certain features': '某些功能',
    'are unavailable during the trial experience.': '在试用期间不可用。',
    'If my organization does not already have a customer agreement for GitHub services, I hereby accept the':
      '如果我的组织尚未签订 GitHub 服务客户协议，我在此接受',
    'Corporate Terms of Service': '企业服务条款',
    'and confirm that I have the authority to do so on behalf of my organization.': '，并确认我有权代表我的组织这样做。',
    'Account verification.': '帐户验证。',
    'Account has been verified. Please continue.': '帐户已验证。请继续。',
    "Will take a few minutes to a few hours to process before it's available for use.": '需要几分钟到几小时的处理时间才能使用。',

    // 联系销售 /enterprise/contact（标签页标题：Enterprise · A smarter way to work together · GitHub）
    'A smarter way to work together': '更智能的协作方式',
    'Talk to our sales team': '联系我们的销售团队',
    'What you’ll get': '你将获得',
    'A free trial and demo, plus an overview of GitHub’s core products and plans.': '免费试用和演示，以及 GitHub 核心产品与计划的概述。',
    'Who it’s for': '适用对象',
    'Teams and leaders evaluating GitHub for development, security, or enterprise use.':
      '正在评估将 GitHub 用于开发、安全或企业用途的团队和领导者。',
    'Why it’s worth it': '价值所在',
    'Get clarity on which GitHub plan fits your goals and how to get started quickly.':
      '明确哪种 GitHub 计划符合你的目标，以及如何快速上手。',
    'Need customer support? For questions about your existing GitHub Enterprise installation,':
      '需要客户支持？如对现有 GitHub 企业版安装有疑问，',
    'contact Enterprise Support': '请联系企业版支持',
    'GitHub partners with industry leaders': 'GitHub 与行业领导者合作',
    'All fields marked with an asterisk (*) are required.': '标有星号 (*) 的字段为必填项。',
    'Job title': '职位',
    'e.g. Software Engineer': '例如软件工程师',
    'Work email': '工作电子邮件',
    'Number of developers': '开发人员人数',
    "I'm interested in": '我感兴趣的是',
    'Phone number': '电话号码',
    'Describe your project, needs, and timeline.': '描述你的项目、需求和时间表。',
    Country: '国家/地区',
    // “… See the <GitHub Privacy Statement 链接> for more details.”（列出示例字段时另有第二句，见 regexp）
    'Yes please, I’d like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness. See the':
      '好的，我希望 GitHub 及其关联公司使用我的信息进行个性化沟通、定向广告和营销活动效果评估。请参阅',
    "Yes please, I'd like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness.":
      '好的，我希望 GitHub 及其关联公司使用我的信息进行个性化沟通、定向广告和营销活动效果评估。',
    'See the': '请参阅',

    // Copilot 结账与购买（组织 / 企业）
    'GitHub Copilot - Checkout': 'GitHub Copilot - 结账',
    // 标签页标题：/github-copilot/signup
    'Signup to GitHub Copilot': '注册 GitHub Copilot',
    'Activate GitHub Copilot': '激活 GitHub Copilot',
    'GitHub Copilot plans require a valid organization or enterprise': 'GitHub Copilot 计划需要有效的组织或企业',
    "Make sure you're signed in as the owner of an Organization": '确保你以组织所有者身份登录',
    "Make sure you're signed in as the owner of an Enterprise": '确保你以企业所有者身份登录',
    'See the list of Organizations you own.': '查看你拥有的组织列表。',
    'See the list of Enterprises you own.': '查看你拥有的企业列表。',
    'Purchase GitHub Copilot Pro instead': '改为购买 GitHub Copilot 专业版',
    'For more information on purchasing GitHub Copilot,': '如需了解购买 GitHub Copilot 的更多信息，',
    'visit the documentation': '请访问文档',
    'To purchase and try latest Copilot features, including Chat-based assistance in the GitHub Platform, conversational search and summarization on internal documentation and skills for pull request:':
      '要购买并试用最新的 Copilot 功能（包括 GitHub 平台中基于聊天的协助、内部文档的对话式搜索和摘要，以及拉取请求技能）：',
    // “… is subject to your GitHub agreement and <the specific GitHub Copilot terms 链接>.”
    "Your organization or enterprise's use of GitHub Copilot is subject to your GitHub agreement and":
      '你的组织或企业对 GitHub Copilot 的使用须遵守你的 GitHub 协议以及',
    'the specific GitHub Copilot terms': '特定 GitHub Copilot 条款',

    // 结账：计划、付款周期与支付信息（Copilot Pro、升级到 GitHub Pro 共用）
    'Upgrade your account from GitHub Free to GitHub Pro': '将你的帐户从 GitHub 免费版升级到 GitHub 专业版',
    'Back to billing settings': '返回计费设置',
    'Plan details': '计划详细信息',
    Product: '产品',
    'Personal account': '个人帐户',
    '/ year': '/ 年',
    'Payment frequency': '付款频率',
    'Pay monthly': '按月付款',
    'Pay yearly': '按年付款',
    'Total amount': '总金额',
    'Charge to': '扣款至',
    'Edit billing information': '编辑账单信息',
    // 账单信息与组织关联：“Confirm your details shown below. To make changes, <edit your billing information 链接>”、
    // “<Update your billing information 链接> to be able to link it with this organization.”
    'This organization is linked with your billing information:': '此组织已链接到你的账单信息：',
    'Allow my billing information to be linked with this organization': '允许将我的账单信息链接到此组织',
    'Confirm your details shown below. To make changes,': '确认下方显示的详细信息。如需更改，请',
    'edit your billing information': '编辑你的账单信息',
    'Update your billing information': '更新你的账单信息',
    'to be able to link it with this organization.': '以便将其链接到此组织。',
    'You have successfully linked your billing information with this organization.': '已将你的账单信息链接到此组织。',
    // 确认框只收第一句：后句 Are you sure you want to do this? 由 settings-account/account.ts 收录，整段按句拼接
    'You are about to remove the billing information for this organization.': '你即将删除此组织的账单信息。',
    'PayPal update': '更新 PayPal',
    'Credit Card Form': '信用卡表单',
    'Prepaid debit and credit cards are not accepted as a valid form of payment.': '不接受预付借记卡和预付信用卡作为有效的付款方式。',
    'Note: Switching from monthly to yearly billing will also impact your other active subscriptions. Any necessary adjustments will be reflected on your invoice.':
      '注意：从按月计费切换为按年计费也会影响你的其他有效订阅。任何必要的调整都会体现在发票上。',
    // GitHub Pro 权益：“Includes everything in <Free>, plus:”
    'Includes everything in': '包含',
    'plus:': '的全部内容，另有：',
    'Code owners in private repos': '专用存储库中的代码所有者',
    'Pages in private repos': '专用存储库中的页面',
    'Protected branches in private repos': '专用存储库中的受保护分支',
    'Repository insights in private repos': '专用存储库中的存储库见解',
    'Required reviewers in private repos': '专用存储库中的必需审查者',
    'Wikis in private repos': '专用存储库中的 Wiki',
    '2GB of GitHub Packages storage': '2GB GitHub 软件包存储空间',
    '3,000 minutes for GitHub Actions': '3,000 分钟 GitHub 操作时长',
    // 营销电子邮件订阅：“If you change your mind, you can <unsubscribe 链接> at any time.”
    'Communication preferences': '沟通首选项',
    'If you change your mind, you can': '如果改变主意，你可以随时',
    unsubscribe: '取消订阅',
    'at any time.': '。',

    // 未登录首页 /：首屏、注册表单与轮播标签页（Code / Plan / Collaborate / Automate / Secure）
    'The future of building happens together': '构建的未来在于协作',
    'Tools and trends evolve, but collaboration endures. With GitHub, developers, agents, and code come together on one platform.':
      '工具与趋势不断演变，但协作恒久不变。在 GitHub 上，开发人员、代理和代码汇聚于同一平台。',
    'Enter your email': '输入电子邮件',
    'Download GitHub Copilot app': '下载 GitHub Copilot 应用',
    'Try GitHub Copilot free': '免费试用 GitHub Copilot',
    'Write, test, and fix code quickly with GitHub Copilot, from simple boilerplate to complex features.':
      '借助 GitHub Copilot，从简单的样板代码到复杂功能，都能快速编写、测试和修复。',
    'Align your team from idea to launch with tools that track work, visualize roadmaps, and gather insights.':
      '借助可跟踪工作、可视化路线图并收集见解的工具，让团队从构想到发布始终步调一致。',
    Collaborate: '协作',
    'Enable your team to collaborate with agents to plan, code, and test the next big thing.':
      '让团队与代理协作，规划、编码和测试下一个重大创新。',
    Automate: '自动化',
    'Improve your software development process by automating builds, tests, and deployments with CI/CD.':
      '借助 CI/CD 自动执行构建、测试和部署，改进软件开发流程。',
    'Leverage tooling to detect, review, and fix vulnerabilities before they reach production.':
      '利用工具在漏洞进入生产环境前完成检测、审查和修复。',

    // 首页：AI 分区与行业报告（AI 卡片的 h3 内，<span> 标题后接说明句）
    'Accelerate your entire workflow': '加速整个工作流',
    'From your first line of code to final deployment, GitHub provides AI and automation tools to help you build and ship better software faster.':
      '从第一行代码到最终部署，GitHub 提供 AI 和自动化工具，助你更快地构建和交付更好的软件。',
    'Your AI partner everywhere.': '你的 AI 伙伴，无处不在。',
    'Copilot is ready to work with you at each step of the software development lifecycle.':
      'Copilot 随时准备在软件开发生命周期的每个阶段与你协作。',
    'Duolingo boosts developer speed by 25% with GitHub Copilot': 'Duolingo 借助 GitHub Copilot 将开发速度提升 25%',
    '2025 Gartner® Magic Quadrant™ for AI Code Assistants': '2025 年 Gartner® AI 代码助手魔力象限™',
    'Read industry report': '阅读行业报告',

    // 首页：自动化分区与折叠项（代码空间、移动版、市场）
    'Automate your path to production': '自动化通往生产环境之路',
    'Ship faster with secure, reliable CI/CD.': '借助安全可靠的 CI/CD 更快交付。',
    'Code instantly from anywhere': '随时随地即刻编码',
    'Launch a full, cloud-based development environment in seconds.': '几秒内即可启动功能完整的云端开发环境。',
    'Explore GitHub Codespaces': '探索 GitHub 代码空间',
    'Keep momentum on the go': '移动中也能保持节奏',
    'Manage projects and assign tasks to Copilot, all from your mobile device.': '在移动设备上即可管理项目并为 Copilot 分配任务。',
    'Shape your toolchain': '打造你的工具链',
    'Extend your stack with apps, actions, and AI models.': '使用应用、操作和 AI 模型扩展你的技术栈。',
    'Explore GitHub Marketplace': '探索 GitHub 市场',

    // 首页：安全分区。统计的大字与说明分属两个元素，数字是固定营销文案
    'Built-in application security where found means fixed': '发现即修复的内置应用安全',
    'Use AI to find and fix vulnerabilities so your team can ship more secure software faster.':
      '利用 AI 发现并修复漏洞，让团队更快交付更安全的软件。',
    'Apply fixes in seconds.': '几秒内即可应用修复。',
    'Spend less time debugging and more time building features with Copilot Autofix.':
      '借助 Copilot 自动修复，减少调试时间，把更多时间用于构建功能。',
    'Explore GitHub Advanced Security': '探索 GitHub 高级安全',
    '70% MTTR reduction': 'MTTR 缩短 70%',
    'with Copilot Autofix': '借助 Copilot 自动修复',
    '8.3M secret leaks stopped': '阻止 830 万次机密泄露',
    'in the past 12 months with push protection': '过去 12 个月内借助推送保护',
    'Security debt, solved.': '安全债务，迎刃而解。',
    'Leverage security campaigns and Copilot Autofix to reduce application vulnerabilities.':
      '利用安全活动和 Copilot 自动修复减少应用漏洞。',
    'Learn about GitHub Code Security': '了解 GitHub 代码安全',
    'Dependencies you can depend on.': '值得依赖的依赖项。',
    'Update vulnerable dependencies with supported fixes for breaking changes.': '更新存在漏洞的依赖项，并针对破坏性更改提供受支持的修复。',
    'Learn about Dependabot': '了解 Dependabot',
    'Your secrets, your business.': '你的机密，你做主。',
    'Detect, prevent, and remediate leaked secrets across your organization.': '在整个组织中检测、预防并修复泄露的机密。',
    'Learn about GitHub Secret Protection': '了解 GitHub 机密保护',

    // 首页：协作分区与客户推荐语（省略号随原文）
    'Work together, achieve more': '携手协作，成就更多',
    'From planning and discussion to code review, GitHub keeps your team’s conversation and context next to your code.':
      '从规划、讨论到代码审查，GitHub 让团队的对话和上下文始终紧挨着代码。',
    'Plan with clarity.': '清晰规划。',
    'Organize everything from high-level roadmaps to everyday tasks.': '从宏观路线图到日常任务，一切有序管理。',
    'Explore GitHub Projects': '探索 GitHub 项目',
    'It helps us onboard new software engineers and get them productive right away. We have all our source code, issues, and pull requests in one place... GitHub is a complete platform that frees us from menial tasks and enables us to do our best work.':
      '它帮助我们让新的软件工程师顺利入职并立即投入高效工作。我们所有的源代码、议题和拉取请求都集中在一处... GitHub 是一个完整的平台，让我们摆脱琐碎事务，发挥最佳水平。',
    'Application manager at Mercedes-Benz': 'Mercedes-Benz 应用经理',
    'Keep track of your tasks': '跟踪你的任务',
    'Create issues and manage projects with tools that adapt to your code.': '借助贴合代码的工具创建议题、管理项目。',
    'Explore GitHub Issues': '探索 GitHub 议题',
    'Share ideas and ask questions': '分享想法并提问',
    'Create space for open-ended conversations alongside your project.': '在项目旁为开放式对话留出空间。',
    'Explore GitHub Discussions': '探索 GitHub 讨论',
    'Review code changes together': '一起审查代码更改',
    'Assign initial reviews to Copilot for greater speed and quality.': '将初步审查分配给 Copilot，提升速度和质量。',
    'Explore code review': '探索代码审查',
    'Fund open source projects': '资助开源项目',
    'Become an open source partner and support the tools and libraries that power your work.':
      '成为开源合作伙伴，支持驱动你工作的工具和库。',

    // 首页：客户案例。标题分两行；标签页 By industry / By size / By use case 在 actions、codespaces 会被 By 正则半译，
    // 全局 static 优先于正则
    'From startups to enterprises,': '从初创企业到大型企业，',
    'GitHub scales with teams of any size in any industry.': 'GitHub 可随各行各业、各种规模的团队一同扩展。',
    'By industry': '按行业',
    Technology: '科技',
    'Figma streamlines development and strengthens security': 'Figma 简化开发流程并加强安全',
    Automotive: '汽车',
    'Mercedes-Benz standardizes source code and automates onboarding': 'Mercedes-Benz 统一源代码并自动化入职流程',
    'Mercado Libre cuts coding time by 50%': 'Mercado Libre 将编码时间缩短 50%',
    'By size': '按规模',
    'Buffer enhances collaboration and control with GitHub Team': 'Buffer 借助 GitHub 团队版加强协作和管控',
    'Accenture customizes GitHub Copilot for its 12,000 developers': 'Accenture 为其 12,000 个开发人员定制 GitHub Copilot',
    'Philips reduces infrastructure costs by 80%': 'Philips 将基础设施成本降低 80%',
    'By use case': '按使用场景',
    'TELUS saves $16.9M with GitHub': 'TELUS 借助 GitHub 节省 1690 万美元',
    'Fullstory automates DevSecOps at scale with GitHub': 'Fullstory 借助 GitHub 大规模自动化 DevSecOps',
    'EY leverages GitHub and Microsoft Azure DevOps to outpace the competition': 'EY 借助 GitHub 和 Microsoft Azure DevOps 领先竞争对手',
    'Explore customer stories': '探索客户案例',

    // 首页：结尾与统计脚注
    'Millions of developers and businesses call GitHub home': '数百万开发人员和企业以 GitHub 为家',
    'Whether you’re scaling your development process or just learning how to code, GitHub is where you belong. Join the world’s most widely adopted developer platform to build the technologies that shape what’s next.':
      '无论你是在扩展开发流程，还是刚开始学习编程，GitHub 都是你的归属。加入全球采用最广泛的开发人员平台，构建引领未来的技术。',
    'GitHub internal customer data, 2025.': 'GitHub 内部客户数据，2025 年。',

    // 功能页 /features：首屏与协作编码分区（卡片链接、分区标题按现行的单个文本节点收录）
    'The tools you need to build what you want': '构建你想要的一切所需的工具',
    'Experience AI with Copilot Chat': '借助 Copilot 聊天体验 AI',
    'The latest GitHub previews': 'GitHub 最新功能预览',
    'Collaborative Coding': '协作编码',
    // 页内锚点导航
    'Collaborative coding': '协作编码',
    // 时间线条目：<em>Build community</em> around your code.，由 mergeText 整段合并
    'Build community around your code.': '围绕你的代码建立社区。',
    'Spin up fully configured dev environments in the cloud with the full power of your favorite editor.':
      '在云端启动配置完备的开发环境，享有你喜欢的编辑器的全部功能。',
    'Dedicated space for your community to come together, ask and answer questions, and have open-ended conversations.':
      '为你的社区提供专属空间，让成员汇聚一堂、提问解答，并展开开放式对话。',
    'Code search & code view': '代码搜索与代码视图',

    // 网站地图 /sitemap：标签页标题 GitHub Sitemap · GitHub
    'GitHub Sitemap': 'GitHub 网站地图',

    // 开发人员计划注册 /developer/register：标签页标题与页面标题
    'Register for the GitHub Developer Program': '注册 GitHub 开发人员计划',
    // 页面标题拆开时的前段，后段 GitHub Developer Program 由 settings-account 的全局词条翻译
    'Register for the': '注册',
    'The best way to integrate with GitHub.': '与 GitHub 集成的最佳方式。',
    'Select an account': '选择帐户',
    'Select an account to register': '选择要注册的帐户',
    'You don’t belong to any organizations.': '你不属于任何组织。',
    'Create Organization': '创建组织',
    // 条款：By clicking “…” below, you agree to the <developer terms of service 链接> and the <privacy statement 链接>
    // . We’ll occasionally …（末段以句点开头，与 auth/signup.ts 的 account-related 版同译）
    'By clicking “Register for the GitHub Developer Program” below, you agree to the': '单击下方的“注册 GitHub 开发人员计划”即表示你同意',
    'developer terms of service': '开发人员服务条款',
    'and the': '和',
    '. We’ll occasionally send you account related emails.': '。我们会不定期向你发送帐户相关电子邮件。',
    // 侧栏：计划权益
    'Program Benefits': '计划权益',
    'Notification of API changes': 'API 更改通知',
    'Early access eligibility on select features': '部分功能的抢先体验资格',
    'Eligibility for development licenses for GitHub products': '获取 GitHub 产品开发许可证的资格',
    'GitHub profile membership badge': 'GitHub 个人资料成员徽章',
    'Learn more about the program': '了解此计划',

    // Spark /spark：首页标语、提示输入框与列表（小写 spark 指作品，译作 Spark）
    'Dream it.': '构想。',
    'See it.': '预览。',
    'Ship it.': '发布。',
    'Transform ideas into full-stack intelligent apps in a snap. Publish with a click.': '瞬间将想法变成全栈智能应用。一键发布。',
    'Spark is currently only available to Copilot Pro+ and Enterprise users.': 'Spark 目前仅向 Copilot 专业增强版和企业版用户开放。',
    'Upgrade now to access Spark': '立即升级以使用 Spark',
    'Create web apps with React and TypeScript to prototype ideas, build tools, and more':
      '使用 React 和 TypeScript 创建 Web 应用，制作想法原型、打造工具等',
    'Submit prompt': '提交提示',
    Favorites: '收藏',
    'Favorite this spark': '收藏此 Spark',
    'Unfavorite this spark': '取消收藏此 Spark',
    'Nothing to see here… yet.': '暂无内容。',

    // Spark 编辑器：头部、视图切换与设置对话框
    'All sparks': '所有 Spark',
    'Live preview is interrupted. Try refreshing the page to reconnect.': '实时预览已中断。请刷新页面以重新连接。',
    'Preview mode': '预览模式',
    'Code mode': '代码模式',
    'Why not both?': '何不两者兼得？',
    'Open codespace': '打开代码空间',
    'Your spark will be published as': '你的 Spark 将发布为',
    'Generated by Spark': '由 Spark 生成',
    'Delete spark': '删除 Spark',
    'Once you delete a spark, there is no going back. Please be certain.': 'Spark 删除后无法恢复。请谨慎操作。',

    // Spark 编辑器：预览工具栏与代码编辑器
    'Action unavailable in this mode': '此模式下操作不可用',
    // 进度提示带主语，用“正在”，主语作宾语（同 Mermaid diagram loading、Filters are loading）
    'Action loading': '正在加载操作',
    'Select element to edit': '选择要编辑的元素',
    'Refresh preview': '刷新预览',
    'Show mobile view': '显示移动端视图',
    'Exit mobile view': '退出移动端视图',
    'Autofix error': '自动修复错误',
    'Cannot edit in read-only editor': '无法在只读编辑器中编辑',
    // 焦点提示被 <kbd> 拆开后的末段
    'to escape the editor.': '退出编辑器。',
    'Hide problems': '隐藏问题',
    'Show minimap': '显示缩略图',

    // Spark 侧边面板：迭代（标签 Iterate / Theme / Data / Prompts / Assets，Assets 见全局词条，Theme 不收录）
    Iterate: '迭代',
    'What do you want to change?': '你想更改什么？',
    'Expand prompt': '展开提示',
    'Collapse prompt': '折叠提示',
    'Copy prompt': '复制提示',
    'Manual edit': '手动编辑',
    'Fix all': '全部修复',

    // Spark 侧边面板：主题（圆角、间距选项的无障碍名称为“分组名 + 档位”）
    'Custom theme': '自定义主题',
    'Select a theme': '选择主题',
    'Filter themes': '筛选主题',
    'No themes found': '未找到主题',
    'Try changing the filter or selecting a different theme.': '请尝试更改筛选器或选择其他主题。',
    Typography: '排版',
    'Sans serif': '无衬线',
    Serif: '衬线',
    Monospace: '等宽',
    'Select a font': '选择字体',
    'Search colors...': '搜索颜色...',
    'Show all colors': '显示所有颜色',
    'Hide colors': '隐藏颜色',
    'Border radius': '圆角',
    'Border radius None': '无圆角',
    'Border radius Small': '小圆角',
    'Border radius Medium': '中等圆角',
    'Border radius Large': '大圆角',
    'Border radius Full': '全圆角',
    Spacing: '间距',
    'Spacing None': '无间距',
    'Spacing Small': '小间距',
    'Spacing Medium': '中等间距',

    // Spark 侧边面板：数据、提示、资产
    Data: '数据',
    'Add data storage by asking in the Iterate panel. View and edit the associated tables and data here.':
      '在迭代面板中提出要求以添加数据存储。在此查看和编辑关联的数据表和数据。',
    "We couldn't load your data": '无法加载你的数据',
    Prompts: '提示',
    'Add AI capabilities by asking in the Iterate panel. View and edit the prompts powering those features here.':
      '在迭代面板中提出要求以添加 AI 功能。在此查看和编辑驱动这些功能的提示。',
    'Upload assets here or in the Iterate panel. Assets support images, documents, audio, and video. Ask in the Iterate panel to add them to your app.':
      '在此处或迭代面板中上传资产。资产支持图片、文档、音频和视频。在迭代面板中提出要求，将其添加到你的应用中。'
  },
  regexp: [
    // 电话号码区号选择器：Select country for phone number. Currently selected: US +1
    [/^Select country for phone number\. Currently selected: (.+)$/, '选择电话号码所属国家/地区。当前选择：$1'],
    // 结账：Payment due Nov 11, 2026
    [new RegExp(`^Payment due (${DATE_SOURCE})$`), (_, date) => joinCjk('应付款日期', translateTime(date))],
    // 结账条款：By clicking “Upgrade to GitHub Pro”, you agree to our（弯引号、直引号均可）
    [
      /^By clicking ["“]([^"”]+)["”], you agree to our$/,
      (_, label: string) => `单击“${AGREE_BUTTONS.get(label) ?? label}”即表示你同意我们的`
    ],
    // 营销同意复选框（结账、联系表单共用的组件）的第二句：第一句见 static，相邻文本节点整段未命中时按句拆分后拼成一段
    [
      /^The information used includes, but is not limited to, (.+)\.$/,
      (_, list: string) => `所使用的信息包括但不限于${consentFields(list)}。`
    ]
  ],
  inline: [
    // 窄屏计划选择（/pricing、/organizations/plan、/account/organizations/new，页面类型都是 new）：
    // Features on <span>team</span>。计划名小写、由 CSS 首字母大写，由 new 的 scoped 译成“团队版”等；
    // 译文把计划名移到句首，计划名是中文，后面不留空格
    ['Features on {}', '{}功能'],
    // 高级支持引言（/enterprise/premium-support）：h3 的子节点依次为 At、<a>TSIA</a>、, we're … offerings.、
    // <br>、<br>、<div>With three tiers…</div>；尾部 3 个槽位不动，<div> 里的句子照常翻译
    [
      "At {}, we're seeing technology leaders take an active role in helping their customers adopt new technologies. GitHub is demonstrating a thoughtful, deliberate approach to creating compelling service offerings. {}{}{}",
      '在 {}，我们看到技术领导者正积极帮助客户采用新技术。GitHub 在打造有吸引力的服务方面展现出深思熟虑、审慎周到的做法。{}{}{}'
    ],
    // 创建企业表单的数据托管说明：With <GitHub Enterprise Cloud with Data Residency 链接>, you can choose …
    // 链接文字译成中文，{} 两侧不留空格。宿主按三段收录（表单需登录，结构未核对），
    // 另有元素子节点时不命中，各段照常翻译
    [
      'With {}, you can choose where your company’s code and data are stored. Your enterprise will be hosted on a dedicated subdomain of GHE.com.',
      '借助{}，你可以选择公司代码和数据的存储位置。你的企业将托管在 GHE.com 的专用子域上。'
    ]
  ],
  // 功能页时间线条目（Primer Brand Timeline，类名带 CSS 模块哈希，按片段匹配）：<em> 拆开的句子整段合并
  mergeText: ['[class*="Timeline__item-text"]']
} satisfies PageDictionary
