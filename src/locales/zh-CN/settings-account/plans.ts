import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/** 剩余时长前缀与单位：“Expires in almost 2 years” */
const QUALIFIERS: Readonly<Record<string, string>> = { about: '约 ', almost: '将近 ', over: '超过 ' }
const UNITS: Readonly<Record<string, string>> = { day: '天', month: '个月', year: '年' }

/** 教育福利申请失败的原因；用 Map 避免命中原型链键 */
const DISCOUNT_ERRORS: ReadonlyMap<string, string> = new Map([
  ['School email must be verified on your GitHub account', '学校电子邮件必须在你的 GitHub 帐户中完成验证']
])

/**
 * 方案名按用户规定译成「X 版」（取消订阅提示、取消 Copilot 订阅对话框）；
 * Copilot Max 尚无既定译名，保留原文。
 */
const PLAN_NAMES: Readonly<Record<string, string>> = {
  'GitHub Free': 'GitHub 免费版',
  'GitHub Pro': 'GitHub 专业版',
  'GitHub Team': 'GitHub 团队版',
  'GitHub Enterprise': 'GitHub 企业版',
  'Copilot Free': 'Copilot 免费版',
  'Copilot Pro': 'Copilot 专业版',
  'Copilot Pro+': 'Copilot 专业增强版',
  'Copilot Business': 'Copilot 商业版',
  'Copilot Enterprise': 'Copilot 企业版',
  'Copilot Student': 'Copilot 学生版'
}

/** 方案名的译名；未收录的（如 Marketplace 应用的计划名）保留原文 */
function planName(name: string): string {
  return Object.hasOwn(PLAN_NAMES, name) ? PLAN_NAMES[name]! : name
}

/**
 * 许可与计划（/settings/billing/licensing、/account/upgrade、计划比较）、付款信息（账单信息、付款方式、
 * 优惠券、附加信息、发票、Azure 订阅）、付款历史记录、其他计费详细信息（组织、市场应用、赞助）、
 * 教育福利（/settings/education/benefits）。
 * 组织计费页面与此共用，词条放 static；「Unlimited public/private repos」等组织设置已收录的条目为 scoped，此处补 static。
 * 计划比较表中的短功能名放 scoped，长说明放 static。
 * 产品名、方案名按用户规定译成中文（Actions → 操作、Codespaces → 代码空间、Packages → 软件包、Pages → 页面、
 * Marketplace → 市场、Pro → 专业版 等）；品牌词 Copilot、Dependabot、PayPal 保留。
 * 「The basics for organizations and developers」「Learn more about GitHub Sponsors」「Switch to invoiced billing」
 * 由其他词典收录。
 */
export default {
  static: {
    // 许可：Copilot 与当前计划
    'Your AI pair programmer': '你的 AI 结对程序员',
    'You are eligible to use GitHub Copilot for free.': '你有资格免费使用 GitHub Copilot。',
    'Current plan': '当前计划',
    'Compare all plans': '比较所有计划',
    'per month': '每月',
    'per user/month': '每用户/月',
    'The basics for all developers': '面向所有开发人员的基础功能',
    'Unlimited public/private repos': '不限数量的公共/专用存储库',
    'Unlimited collaborators': '不限数量的协作者',
    // Actions minutes → 操作分钟数（与计费页「包含 $1 操作分钟数」一致）；core-hours of … 带“的”，避免“小时代码”连读
    '2,000 Actions minutes/month': '每月 2,000 操作分钟数',
    '3,000 Actions minutes/month': '每月 3,000 操作分钟数',
    '500MB of Packages storage': '500MB 软件包存储',
    '2GB of Packages storage': '2GB 软件包存储',
    '120 core-hours of Codespaces compute per developer': '每个开发人员 120 核心小时的代码空间计算',
    '15GB of Codespaces storage per developer': '每个开发人员 15GB 代码空间存储',
    '180 core-hours of Codespaces compute': '180 核心小时的代码空间计算',
    '20GB of Codespaces storage': '20GB 代码空间存储',
    'Community support': '社区支持',
    'Downgrade to Free': '降级到免费版',
    // 「Code owners, required reviewers, GitHub Pages, <a>and more</a> advanced tools」
    'Code owners, required reviewers, GitHub Pages,': '代码所有者、必需审查者、GitHub 页面',
    'and more': '等',
    'advanced tools': '高级工具',
    'Not included:': '不包含：',
    'Protected branches on all repos': '所有存储库的受保护分支',
    'Increase Codespaces': '提高代码空间',
    'spend limits': '支出上限',
    'Multiple reviewers in pull requests': '拉取请求的多个审查者',
    'Required status checks': '必需的状态检查',
    'Code owners': '代码所有者',
    'Required reviewers': '必需审查者',
    'Pages for static website hosting': '用于托管静态网站的页面',
    'Web-based support': '网页支持',
    'See all features and compare plans': '查看所有功能并比较计划',
    'Active subscription': '有效订阅',
    'Upgrade Copilot': '升级 Copilot',
    'You can upgrade to Copilot Pro at any time. Check out this': '你可以随时升级到 Copilot 专业版。查看此',
    'Current GitHub base plan': '当前 GitHub 基础计划',
    'Compare base plans': '比较基础计划',
    'Upgrade to GitHub Pro': '升级到 GitHub 专业版',
    'Switch to yearly billing': '切换为按年计费',
    'Switch to monthly billing': '切换为按月计费',
    'Switch to annual billing': '切换为按年计费',
    'Current Copilot plan': '当前 Copilot 计划',
    'Monthly payment': '按月付款',
    'Yearly payment': '按年付款',
    'Next payment': '下次付款',
    'You can upgrade your subscription to yearly billing or cancel any time.': '你可以随时将订阅升级为按年计费或取消订阅。',
    'Read billing documentation': '阅读计费文档',
    'Compare Copilot plans': '比较 Copilot 计划',
    'Upgrade to Copilot Pro': '升级到 Copilot 专业版',
    'Upgrade to Copilot Pro+': '升级到 Copilot 专业增强版',
    'Upgrade to Copilot Max': '升级到 Copilot Max',
    'Upgrade Individual Plan': '升级个人计划',
    'Upgrade to Business': '升级到商业版',
    'Manage subscription': '管理订阅',
    'Cancel subscription': '取消订阅',

    // 计划比较、升级与降级
    'All the basics': '全部基础功能',
    'Advanced tools for private repos': '专用存储库的高级工具',
    'Advanced tools for teams': '面向团队的高级工具',
    'Upgrade to Pro': '升级到专业版',
    'Upgrade now': '立即升级',
    'Edit plan': '编辑计划',
    'Downgrade plan': '降级计划',
    // 句号随原文
    'I understand. Continue with downgrade': '我已了解。继续降级',
    'Upgrade summary': '升级摘要',
    'Show details': '显示详细信息',
    'Upgrade my account': '升级我的帐户',
    // 选择要升级的帐户（/account/choose?action=upgrade）
    'Which do you want to upgrade?': '要升级哪个帐户？',
    'Your new plan': '你的新计划',
    'Redeem your coupon': '兑换优惠券',
    'Free for public repositories': '公共存储库免费',
    'With policies and controls': '附带策略和控制',
    '180 core-hours compute/month and 20GB storage': '每月 180 核心小时计算和 20GB 存储',
    '2,000 minutes/month': '每月 2,000 分钟',
    '3,000 minutes/month': '每月 3,000 分钟',

    // 计划比较表：分组与功能说明（原文没有的逗号、冒号不加，用定语或“以”“并”连接）
    'Code management': '代码管理',
    'Code workflow': '代码工作流',
    'Platform security and compliance': '平台安全与合规',
    'Marketplace and integrations': '市场和集成',
    'Support and deployment': '支持与部署',
    'Host open source projects in public GitHub repositories, accessible via web or command line. Public repositories are accessible to anyone at GitHub.com.':
      '在公共 GitHub 存储库中托管开源项目，可通过网页或命令行访问。GitHub.com 上的任何人都可以访问公共存储库。',
    'Host code in private GitHub repositories, accessible via appliance, web, and command line. Private repositories are only accessible to you and people you share them with.':
      '在专用 GitHub 存储库中托管代码，可通过设备、网页和命令行访问。专用存储库只有你和你共享的人可以访问。',
    'Spin up fully configured dev environments in the cloud with the power of your favorite editor. A "core hour" denotes compute usage. On a 2-core machine, you would get 60 hours free. On a 4-core machine, you would get 30 hours free, etc. Free hours are assigned to personal accounts, rather than free organizations.':
      '借助你喜欢的编辑器在云端启动完全配置好的开发环境。“核心小时”表示计算使用量。2 核机器可免费使用 60 小时。4 核机器可免费使用 30 小时，依此类推。免费时长分配给个人帐户，而不是免费组织。',
    'Spin up fully configured dev environments in the cloud with the power of your favorite editor. A “core hour” denotes compute usage. On a 2-core machine, you would get 60 hours free. On a 4-core machine, you would get 30 hours free, etc. Free hours are assigned to personal accounts, rather than free organizations.':
      '借助你喜欢的编辑器在云端启动完全配置好的开发环境。“核心小时”表示计算使用量。2 核机器可免费使用 60 小时。4 核机器可免费使用 30 小时，依此类推。免费时长分配给个人帐户，而不是免费组织。',
    'Use execution minutes with GitHub Actions to automate your software development workflows. Write tasks and combine them to build, test, and deploy any code project on GitHub. Minutes are free for public repositories.':
      '使用 GitHub 操作的执行分钟数自动化软件开发工作流。编写任务并加以组合，即可构建、测试和部署 GitHub 上的任何代码项目。公共存储库免费使用分钟数。',
    'Learn more about billing': '了解计费',
    'Host your own software packages or use them as dependencies in other projects. Both private and public hosting available. Packages are free for public repositories.':
      '托管你自己的软件包或在其他项目中将其用作依赖项。支持专用和公共托管。公共存储库免费使用软件包。',
    'Review new code, see visual code changes, and confidently merge code changes with automated status checks.':
      '审查新代码、查看可视化的代码更改，并借助自动状态检查放心合并代码更改。',
    "Allow contributors to easily notify you of changes they've pushed to a repository – with access limited to the contributors you specify. Easily merge changes you accept.":
      '让贡献者轻松通知你他们推送到存储库的更改，访问权限仅限于你指定的贡献者。轻松合并你接受的更改。',
    'Allow contributors to easily notify you of changes they’ve pushed to a repository – with access limited to the contributors you specify. Easily merge changes you accept.':
      '让贡献者轻松通知你他们推送到存储库的更改，访问权限仅限于你指定的贡献者。轻松合并你接受的更改。',
    'Enforce restrictions on how code branches are merged, including requiring reviews by selected collaborators, or allowing only specific contributors to work on a particular branch.':
      '限制代码分支的合并方式，包括要求指定协作者审查，或只允许特定贡献者在某个分支上工作。',
    'Automatically request reviews – or require approval – by selected contributors when changes are made to sections of code that they own.':
      '指定贡献者所负责的代码部分发生更改时，自动请求其审查或要求其批准。',
    'Easily discuss and collaborate on pull requests before submitting to formal review.': '在提交正式审查前轻松讨论和协作处理拉取请求。',
    'Assign more than one person to a pull request.': '为一个拉取请求分配多人。',
    'See data about activity and contributions within your repositories, including trends. You can use this data to improve collaboration and make development faster and more effective.':
      '查看存储库中活动和贡献的数据，包括趋势。你可以利用这些数据改进协作并让开发更快更高效。',
    'Send scheduled messages to you or your team listing open pull requests.': '定时向你或你的团队发送包含打开的拉取请求列表的消息。',
    'Automatically assign code reviews to members of your team based on one of two algorithms.':
      '根据两种算法之一自动将代码审查分配给团队成员。',
    "When a workflow job references an environment, the job won't start until all of the environment's protection rules pass.":
      '工作流作业引用环境时，作业须等到该环境的所有保护规则通过后才会开始。',
    'When a workflow job references an environment, the job won’t start until all of the environment’s protection rules pass.':
      '工作流作业引用环境时，作业须等到该环境的所有保护规则通过后才会开始。',
    'A job cannot access secrets that are defined in an environment unless it is running on the specified branch.':
      '作业只有在指定分支上运行时才能访问环境中定义的机密。',
    'Invite any GitHub member, or all GitHub members, to work with you on code in a public repository you control – including making changes and opening issues.':
      '邀请任意或所有 GitHub 成员，与你一起处理你控制的公共存储库中的代码，包括进行更改和创建议题。',
    'Invite any GitHub member, or all GitHub members, to work with you on code in a private repository you control – including making changes and opening issues.':
      '邀请任意或所有 GitHub 成员，与你一起处理你控制的专用存储库中的代码，包括进行更改和创建议题。',
    'Track bugs, enhancements, and other requests, prioritize work, and communicate with stakeholders as changes are proposed and merged.':
      '跟踪缺陷、改进和其他请求，确定工作优先级，并在提出和合并更改时与相关人员沟通。',
    'Visualize and manage issues and pull requests across tables, boards, and roadmaps with custom fields and views that you can arrange to suit your workflow.':
      '在表格、看板和路线图中可视化并管理议题和拉取请求，自定义字段和视图可按你的工作流编排。',
    'Track progress on groups of issues or pull requests in a repository, and map groups to overall project goals.':
      '跟踪存储库中各组议题或拉取请求的进度，并将其对应到项目的总体目标。',
    'Discuss any topic, unattached to a specific project or issue. Control who has access, notify discussion participants with updates, and link from anywhere.':
      '讨论任何话题，无需关联特定项目或议题。控制访问人员，向讨论参与者通知更新，并可从任何位置链接。',
    'Manage access to projects on a team-by-team, or individual user, basis.': '按团队或个人用户管理项目访问权限。',
    'Host documentation and simple websites for your project in a wiki format that contributors can easily edit either on the web or command line.':
      '以贡献者可通过网页或命令行轻松编辑的 Wiki 形式托管项目的文档和简单网站。',
    'Assign more than one person to an issue.': '为一个议题分配多人。',
    'GitHub organizations give you team-based access control and discussions.': 'GitHub 组织提供基于团队的访问控制和讨论。',
    'Learn more about organizations': '了解组织',
    'Enforce consistent code standards, security, and compliance across branches and tags.':
      '在各分支和标签中强制实施一致的代码标准、安全性和合规性。',
    'Export a software bill of materials (SBOM) for your repository.': '为存储库导出软件物料清单 (SBOM)。',
    'Ensure unfalsifiable provenance and integrity for your software.': '确保软件来源不可伪造且完整。',
    "Define users' level of access to your code, data and settings.": '定义用户对你的代码、数据和设置的访问级别。',
    'Define users’ level of access to your code, data and settings.': '定义用户对你的代码、数据和设置的访问级别。',
    'Use an extra layer of security with two factor authentication (2FA) when logging into GitHub.':
      '登录 GitHub 时使用双因素身份验证 (2FA) 增加一层安全保护。',
    'Quickly review the actions performed by members of your organization.': '快速查看组织成员执行的操作。',
    'Enterprises can connect to advanced systems like LDAP and SAML single sign-on (SSO).':
      '企业可连接 LDAP 和 SAML 单一登录 (SSO) 等高级系统。',
    'Learn more about GitHub Enterprise': '了解 GitHub 企业版',
    "Install apps that integrate directly with GitHub's API to improve development workflows – or build your own for private use or publication in the GitHub Marketplace.":
      '安装直接与 GitHub API 集成的应用以改进开发工作流，或自行构建应用供私人使用或在 GitHub 市场发布。',
    'Install apps that integrate directly with GitHub’s API to improve development workflows – or build your own for private use or publication in the GitHub Marketplace.':
      '安装直接与 GitHub API 集成的应用以改进开发工作流，或自行构建应用供私人使用或在 GitHub 市场发布。',
    'Define tests that GitHub automatically runs against code being committed to your repository, and get details about failures and what is causing them.':
      '定义 GitHub 对提交到存储库的代码自动运行的测试，并获取失败的详细信息及原因。',
    'Enterprise Server customers create pre-receive hooks to automatically accept or reject a push.':
      '企业服务器客户可创建预接收钩子以自动接受或拒绝推送。',
    'Learn more about pre-receive hooks': '了解预接收钩子',
    'Get help with most of your GitHub questions and issues in our Community Forum.': '在社区论坛中获取大多数 GitHub 问题的帮助。',
    'GitHub Support can help you troubleshoot issues you run into while using GitHub. Get support via the web.':
      'GitHub 支持可帮助你排查使用 GitHub 时遇到的问题。通过网页获取支持。',
    'Enterprises also get Premium Support, invoice billing, and self-hosted deployment.': '企业还可获得高级支持、发票付款和自托管部署。',

    // 付款信息：账单信息
    'Billing information': '账单信息',
    'You have not added any billing information.': '你尚未添加账单信息。',
    'Add your information to show on every invoice': '添加要显示在每张发票上的信息',
    'First name': '名字',
    "First name can't be blank.": '名字不能为空。',
    "First name can't be blank": '名字不能为空',
    'Last name': '姓氏',
    "Last name can't be blank.": '姓氏不能为空。',
    "Last name can't be blank": '姓氏不能为空',
    Address: '地址',
    '(Street, P.O. box)': '（街道、邮政信箱）',
    "Address can't be blank.": '地址不能为空。',
    "Address can't be blank": '地址不能为空',
    'Address line 2': '地址第 2 行',
    '(Apartment, suite, unit)': '（公寓、套房、单元）',
    City: '城市',
    "City can't be blank.": '城市不能为空。',
    "City can't be blank": '城市不能为空',
    'Country/Region': '国家/地区',
    'State/Province': '州/省',
    'Required for certain countries': '部分国家/地区必填',
    'Postal/Zip code': '邮政编码',
    '(9-digit zip code for US)': '（美国为 9 位邮政编码）',
    'VAT/GST ID': 'VAT/GST 税号',
    'Save billing information': '保存账单信息',
    'Save and continue': '保存并继续',
    'Successfully updated billing information.': '已更新账单信息。',
    'An error occurred while saving billing information.': '保存账单信息时出错。',
    'Remove your billing information?': '删除你的账单信息？',
    'Remove billing information': '删除账单信息',
    'Successfully removed billing information.': '已删除账单信息。',
    'Please confirm your billing details to continue. You only need to do this once.': '请确认账单详细信息以继续。只需确认一次。',

    // 付款信息：付款方式
    'Payment method': '付款方式',
    'Payment Method': '付款方式',
    'payment method': '付款方式',
    'You have not added a payment method.': '你尚未添加付款方式。',
    'Pay with': '付款方式',
    'Loading payment information…': '正在加载付款信息…',
    'Credit or debit card': '信用卡或借记卡',
    'Card Number *': '卡号 *',
    'Expiration Date (YYYY) *': '有效期 (YYYY) *',
    '- Select One -': '- 请选择 -',
    'Save payment information': '保存付款信息',
    // 「You are currently paying with your PayPal account <strong>电子邮件</strong>, but you can switch …」
    'You are currently paying with your PayPal account': '你目前使用的付款方式为 PayPal 帐户',
    ', but you can switch to using a credit or debit card at any time.': '，但可以随时改用信用卡或借记卡。',
    'PayPal account': 'PayPal 帐户',
    'Paypal account': 'PayPal 帐户',
    'Sign in to PayPal to use a different account.': '登录 PayPal 以使用其他帐户。',
    'Connecting to PayPal…': '正在连接 PayPal…',
    'Sorry, we’re having trouble with PayPal right now, please try again a bit later.': '抱歉，PayPal 暂时出现问题，请稍后重试。',
    'You are currently paying with a credit card, but you can switch to using PayPal at any time.':
      '你目前使用信用卡付款，但可以随时改用 PayPal。',
    'An error occurred while saving payment information.': '保存付款信息时出错。',
    'Your PayPal account has been successfully added.': '已添加你的 PayPal 帐户。',
    'Your credit card has been successfully updated.': '已更新你的信用卡。',
    'We may place a temporary hold on your payment method to verify its validity. This is not a charge, and it will be released automatically after verification.':
      '我们可能会对你的付款方式进行临时预授权以验证其有效性。这不是扣款，验证后将自动释放。',
    'Bank card or PayPal': '银行卡或 PayPal',
    'Update payment method': '更新付款方式',
    'Please update your billing information in order to add a payment method.': '请先更新账单信息再添加付款方式。',
    // 删除付款方式的确认对话框（原文没有的逗号不加）
    'Edit payment method': '编辑付款方式',
    'Remove payment method': '删除付款方式',
    'Confirm removing payment method': '确认删除付款方式',
    'Removing the payment method will result in your user account losing access to paid features and services billed against this payment method.':
      '删除付款方式后你的用户帐户将无法使用通过此付款方式计费的付费功能和服务。',
    'Important considerations:': '重要注意事项：',
    'Instead of removing, you can edit and add a different payment method to your account in order to continue to use paid features and avoid any product interruptions.':
      '你也可以不删除，而是编辑并为帐户添加其他付款方式以继续使用付费功能并避免产品中断。',
    'Removing the payment method does not impact any other settings and configurations for your account.':
      '删除付款方式不会影响帐户的其他设置和配置。',
    'Once removed, you can add another payment method at anytime to resume using paid features and services.':
      '删除后，你可以随时添加其他付款方式以恢复使用付费功能和服务。',

    // 付款信息：上次付款、优惠券、附加信息
    'Last payment': '上次付款',
    'You have not made any payments.': '你尚未付过款。',
    Coupon: '优惠券',
    'Redeem a coupon': '兑换优惠券',
    // 兑换页（/redeem，只有 common 作用域）
    'Enter coupon code': '输入优惠码',
    Redeem: '兑换',
    "You don't have an active coupon.": '你没有有效的优惠券。',
    'You don’t have an active coupon.': '你没有有效的优惠券。',
    '* Discount only applies for GitHub Pro': '* 折扣仅适用于 GitHub 专业版',
    'Additional information': '附加信息',
    'Add specific contact or tax information to your receipts, like your full business name, VAT/GST identification number, or address of record here. We’ll make sure it shows up on every receipt.':
      '在此为收据添加具体的联系或税务信息，例如企业全称、VAT/GST 识别号或登记地址。我们会确保它显示在每张收据上。',
    "Add specific contact or tax information to your receipts, like your full business name, VAT/GST identification number, or address of record here. We'll make sure it shows up on every receipt.":
      '在此为收据添加具体的联系或税务信息，例如企业全称、VAT/GST 识别号或登记地址。我们会确保它显示在每张收据上。',
    'Add information': '添加信息',
    'No additional information added to your receipts.': '尚未向收据添加附加信息。',
    'Extra information': '附加信息',
    'Extra billing information': '额外账单信息',
    'This information will appear on all your receipts.': '此信息将显示在你的所有收据上。',
    'For your security, do not include any confidential or financial information (like credit card numbers).':
      '为了你的安全，请勿包含任何机密或财务信息（如信用卡号）。',
    'To update the information that appears on': '要更新显示在',
    invoices: '发票',
    '(if enabled), visit the': '（如已启用）上的信息，请前往',
    'Full business name or address of record': '企业全称或登记地址',
    'Save contact information': '保存联系信息',
    'Saving contact information…': '正在保存联系信息…',
    'Updated your optional contact information, it will show up on your next receipt.': '已更新可选联系信息，将显示在你的下一张收据上。',

    // 付款信息：发票、Azure 订阅（“billing information section” 为链接）
    'Receive an invoice for your GitHub purchases': '接收 GitHub 购买的发票',
    'The data from Billing Information, such as your address and VAT/GST ID will appear on your invoices.':
      '账单信息中的地址和 VAT/GST 税号等数据将显示在发票上。',
    'Update your information displayed on your invoices in the': '更新发票上显示的信息请前往',
    'billing information section': '账单信息部分',
    'Automatically receive an invoice alongside the payment receipt': '随付款收据自动接收发票',
    '* Enables invoices for all NEW payments.': '* 为所有新付款启用发票。',
    'Save invoice preference': '保存发票首选项',
    'To manage metered billing for this account through Microsoft Azure an Azure Subscription ID must be added to your account.':
      '通过 Microsoft Azure 管理此帐户的按流量计费需要向帐户添加 Azure 订阅 ID。',

    // 付款历史记录
    'Amounts shown in USD': '金额以美元显示',
    'Download receipt': '下载收据',
    Receipt: '收据',
    Refunded: '已退款',
    'Partially refunded': '部分退款',

    // 其他计费详细信息
    'Manage your organizations': '管理你的组织',
    'Create a new organization': '创建新组织',
    'Start your first organization': '创建你的第一个组织',
    "With CI/CD, Dependabot, and the world's largest developer community, GitHub gives your team everything they need to ship better software faster":
      '借助 CI/CD、Dependabot 和全球最大的开发人员社区，GitHub 为你的团队提供更快交付更好软件所需的一切',
    'With CI/CD, Dependabot, and the world’s largest developer community, GitHub gives your team everything they need to ship better software faster':
      '借助 CI/CD、Dependabot 和全球最大的开发人员社区，GitHub 为你的团队提供更快交付更好软件所需的一切',
    'Marketplace apps': '市场应用',
    'Change plan': '更改计划',
    'Cancel plan': '取消计划',
    'Are you sure you want to cancel this integration?': '确定要取消此集成吗？',
    'Do you have any questions? Contact': '有任何问题？请联系',
    'Connect with the community that builds the tools you use': '与构建你所用工具的社区建立联系',
    'Start sponsoring': '开始赞助',
    "You're currently not sponsoring anyone.": '你目前没有赞助任何人。',
    'You’re currently not sponsoring anyone.': '你目前没有赞助任何人。',

    // 教育福利
    'Free GitHub developer resources for students and teachers': '面向学生和教师的免费 GitHub 开发人员资源',
    'Education Benefits': '教育福利',
    'Complete a teacher or student application to unlock tools and resources for your educational journey.':
      '完成教师或学生申请以解锁学习之路所需的工具和资源。',
    // 「You have a current student coupon applied. Find more information on your benefits <a>here</a>.」（here 见 billing 的 scoped）
    'You have a current student coupon applied. Find more information on your benefits': '你当前已使用学生优惠券。福利详情请见',
    'Start an application': '开始申请',
    'You have not submitted an application for education benefits.': '你尚未提交教育福利申请。',
    'Education Benefits Application': '教育福利申请',
    'Select your role in education: *': '选择你的教育身份：*',
    Teacher: '教师',
    'What is the name of your school? *': '你的学校名称是什么？*',
    'If your school is not listed, then enter the full school name and continue. You will be asked to provide further information about your school on the next page. A minimum of two characters is required to find your school.':
      '如果列表中没有你的学校，请输入学校全称后继续。下一页将要求你提供学校的更多信息。至少输入两个字符才能查找学校。',
    'What is your school email address?': '你的学校电子邮件地址是什么？',
    'Have a different email address you use with your school?': '在学校使用其他电子邮件地址？',
    'Add it here.': '在此添加。',
    'Unselect this school': '取消选择此学校',
    'Share Location': '共享位置',
    'Location shared': '已共享位置',
    'Please select the type of proof you would like to provide *': '请选择要提供的证明类型 *',
    'What is a valid proof of education?': '什么是有效的教育证明？',
    'Application Type:': '申请类型：',
    'Coupon applied': '已使用优惠券',
    'Your academic status has been verified. Congratulations!': '你的学术身份已验证。恭喜！',
    'Your academic benefits, including Partner offers, will become available after 72 hours of your verification.':
      '你的学术福利，包括合作伙伴优惠，将在验证通过 72 小时后生效。',
    'Once the benefits become available, you will be able to access the Students Developer Pack offers':
      '福利生效后，你可以在以下位置使用学生开发人员包优惠',
    'To redeem your Copilot Pro coupon, please sign up via this': '要兑换 Copilot 专业版优惠券，请通过此',
    'We hope you enjoy your GitHub Education benefits.': '希望你喜欢 GitHub 教育福利。',
    'Congratulations! Your application has been approved and the coupon code has been applied to your account.':
      '恭喜！你的申请已获批准并且优惠码已应用到你的帐户。',
    'Developer Pack': '开发人员包',
    'page to view your benefits.': '页面查看你的福利。',
    'Your benefits will expire on': '你的福利到期日为',
    'Loading details': '正在加载详细信息',
    'Reason(s):': '原因：',
    'GitHub billing information': 'GitHub 账单信息',
    'GitHub user profile': 'GitHub 用户个人资料',
    // 教育福利：申请条件与未通过原因（学校名、电子邮件、链接在其他元素中）
    'We require applicants of': '我们要求',
    'to use one of these school-issues email addresses to apply:': '的申请人使用以下学校电子邮件地址之一进行申请：',
    'to use one of these school-issued email addresses to apply:': '的申请人使用以下学校电子邮件地址之一进行申请：',
    'add and verify your': '添加并验证你的',
    'school-issued email address': '学校电子邮件地址',
    'in your account settings -- or a contact email if you do not have one. Once your email is verified, you can try applying again.':
      '在帐户设置中完成——如果没有学校电子邮件则添加联系电子邮件。电子邮件验证后，可再次尝试申请。',
    // 「You have verified the email address <电子邮件> on your GitHub account. This academic domain is associated with the school <学校>.」
    'You have verified the email address': '你在 GitHub 帐户中验证的电子邮件地址',
    'on your GitHub account. This academic domain is associated with the school': '所属的学术域关联的学校为',
    '1. Dated school ID - Good': '1. 带日期的学生证 - 良好',
    // 证明类型图例：「<span>Good</span> proof requires …」（Good / Fair / Poor 见 scoped）
    'proof requires infinite academic affiliation documentation most likely to help you be approved.':
      '证明需提供最有可能帮助你获得批准的完整学术身份证明文件。',
    'proof types may lower your chances of being approved.': '证明类型可能会降低你获得批准的几率。',
    'proof types are unlikely to be acceptable.': '证明类型通常不会被接受。',
    'Gathering available school information...': '正在收集可用的学校信息...',
    'Gathering available school information…': '正在收集可用的学校信息…',
    // 「180 monthly Codespaces hours」带“的”，避免“小时代码”连读（同计划卡片的 core-hours of …）
    'Get Copilot for free, 180 monthly Codespaces hours for cloud coding, unlimited private repositories with GitHub Pro or Team, and dozens of premium tools in the Student Developer Pack.':
      '免费使用 Copilot，每月 180 小时的代码空间云端编程时长，通过 GitHub 专业版或团队版使用无限专用存储库，以及学生开发人员包中的数十种高级工具。',
    // “Please complete your [GitHub billing information] with your full name …”
    'Please complete your': '请在',
    'with your full name exactly as it appears in your academic affiliation document. You do not have to add a payment method. You may need to log out and log back in to GitHub before reapplying. If you have only a single legal name, enter it in both the first and last name fields.':
      '中填写与学术证明文件完全一致的全名。无需添加付款方式。重新申请前可能需要退出并重新登录 GitHub。如果你只有一个法定姓名，请在名字和姓氏字段中都填写它。',
    // “You are unlikely to be verified until you have completed your [GitHub user profile] with your full name …”
    // → “你需要先在 <GitHub 用户个人资料> 中填写…全名才有可能通过验证。”（原文无逗号，译文不加）
    'You are unlikely to be verified until you have completed your': '你需要先在',
    'with your full name exactly as it appears in your academic affiliation document. Please do not use a variation of your name or a nickname. Once you have updated your profile information log out and log back into GitHub before re-applying.':
      '中填写与学术证明文件完全一致的全名才有可能通过验证。请勿使用姓名的变体或昵称。更新个人资料信息后请先退出并重新登录 GitHub 再重新申请。',
    // 其他未通过原因（被链接拆开的句子按片段收录）
    'You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect, then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.':
      '你必须配置浏览器和操作系统以允许访问位置信息。不得使用 VPN。如果你认为我们掌握的学校信息不完整或不正确，请在提交 GitHub 教育支持工单时选择“我选择的学校信息不正确或不完整，例如域或校园位置”选项。',
    // 上一条的现行版本：前面多两句，后半句多“e.g. missing campus location(s)”（旧版仍可能出现，保留）
    'You appear not to be near any campus location for the school you have selected. Your academic affiliation documentation must indicate virtual learning if you are remote. You must configure your browser and operating system to allow location access. You may not use a VPN. If you believe that our information about your school is incomplete or incorrect e.g. missing campus location(s), then please select ‘My selected school has incorrect or incomplete information e.g. domains or campus location’ option when submitting a GitHub Education support ticket.':
      '你似乎不在所选学校的任何校园位置附近。如果你远程上课，学术证明文件中必须注明为线上学习。你必须配置浏览器和操作系统以允许访问位置信息。不得使用 VPN。如果你认为我们掌握的学校信息不完整或不正确，例如缺少校园位置，请在提交 GitHub 教育支持工单时选择“我选择的学校信息不正确或不完整，例如域或校园位置”选项。',
    // 「… can be found <a>here</a>. You may also try …」（here 见 billing 的 scoped）
    'Please use your device camera to submit your academic affiliation documents. If you’re having trouble using your device camera, please allow camera access for the application website on your browser. The steps for this will vary depending on which browser you are using. Information on browsers supported by GitHub can be found':
      '请使用设备摄像头拍摄并提交你的学术证明文件。如果在使用设备摄像头时遇到问题，请在浏览器中允许申请网站访问摄像头。具体步骤因你使用的浏览器而异。有关 GitHub 支持的浏览器的信息，请参阅',
    '. You may also try applying from a different computer or mobile device.': '。你也可以尝试换用其他电脑或移动设备申请。',
    // 「… exactly as it appears in your <a>GitHub billing information</a>. …」
    // → “请确保学术证明文件中的姓氏与你的 GitHub 账单信息中的完全一致。…”
    'Please ensure that your academic affiliation document contains your last name exactly as it appears in your':
      '请确保学术证明文件中的姓氏与你的',
    '. If you have only a single legal name, enter it in both the first and last name fields of your GitHub billing information.':
      '中的完全一致。如果你只有一个法定姓名，请在 GitHub 账单信息的名字和姓氏字段中都填写它。',
    'The image you selected does not appear to contain your school name. Your complete school name must appear in your document, not only the school logo. You may include multiple documents together. If your official document is not in English then you may photograph the original next to an English translation.':
      '你选择的图片中似乎没有学校名称。文件中必须出现学校的完整名称，而不仅仅是校徽。你可以将多份文件放在一起。如果你的正式文件不是英文的，可以将原件与英文译本并排拍照。',
    'Please ensure that your academic affiliation document contains your first name exactly as it appears in your':
      '请确保学术证明文件中的名字与你的',
    '. Variations of your name and nicknames are unacceptable.': '中的完全一致。不接受姓名的变体或昵称。',
    'The image you captured appears to be a screen display. Please take a clear, live photo of physical documentation confirming your academic enrollment.':
      '你拍摄的图片似乎是屏幕画面。请为能证明你在读身份的实体文件现场拍摄一张清晰的照片。'
  },
  scoped: {
    Sponsorships: '赞助',
    Plan: '计划',
    Downgrade: '降级',
    Denied: '已拒绝',
    // 全站 static 由 security 词典提供，此处固定本页译法
    Revoked: '已撤销',
    Failed: '失败',
    link: '链接',
    'Please visit the': '请访问',
    // 发票、Azure 订阅（与组织设置译法一致）
    Invoice: '发票',
    'Metered billing via Azure': '通过 Azure 进行按流量计费',
    'Add Azure Subscription': '添加 Azure 订阅',
    'Azure subscription': 'Azure 订阅',
    'Select a subscription': '选择订阅',
    'Edit the subscription': '编辑订阅',
    // connect → 连接（与 Azure 订阅的“连接”按钮一致）
    'Disconnect the subscription': '断开订阅连接',
    // 计划比较表：功能名
    Unlimited: '无限制',
    Collaboration: '协作',
    'Private repositories': '专用存储库',
    'Code reviews': '代码审查',
    'Protected branches': '受保护分支',
    'Repository rules': '存储库规则',
    'Draft pull requests': '草稿拉取请求',
    'Multiple pull request assignees': '拉取请求的多个受理人',
    'Repository insights': '存储库见解',
    'Automatic code review assignment': '自动分配代码审查',
    'Environment protection rules': '环境保护规则',
    'Environment deployment branches and secrets': '环境部署分支和机密',
    'Collaborators for public repositories': '公共存储库的协作者',
    'Collaborators for private repositories': '专用存储库的协作者',
    Milestones: '里程碑',
    'Organization and team management': '组织和团队管理',
    'Pages and wikis': '页面和 Wiki',
    'Multiple issue assignees': '议题的多个受理人',
    'Repository rulesets': '存储库规则集',
    'Artifact attestations': '工件证明',
    'GitHub Security Advisories': 'GitHub 安全公告',
    'Role-based access control': '基于角色的访问控制',
    'Required 2FA': '强制 2FA',
    'Status checks': '状态检查',
    'Pre-receive hooks': '预接收钩子',
    'Community Support': '社区支持',
    'Standard Support': '标准支持',
    // 教育福利：证明类型图例标签
    Good: '良好',
    Fair: '一般',
    Poor: '较差',
    // 教育福利申请的身份选项（与 Teacher 并列）。全局 Student 是 Copilot 菜单的计划标签，设置页固定为身份义
    Student: '学生',
    // 计费页、教育福利页单独显示的产品名
    'GitHub Sponsors': 'GitHub 赞助',
    'GitHub Education': 'GitHub 教育',
    // 许可页单独显示的方案名（当前计划、Copilot 计划）与计费页的产品名：按用户规定译成中文；
    // 组织提供的 Copilot 席位与团队、企业方案同 PLAN_NAMES，与组织计费页一致
    'GitHub Free': 'GitHub 免费版',
    'GitHub Pro': 'GitHub 专业版',
    'GitHub Team': 'GitHub 团队版',
    'GitHub Enterprise': 'GitHub 企业版',
    'Copilot Free': 'Copilot 免费版',
    'Copilot Pro': 'Copilot 专业版',
    'Copilot Pro+': 'Copilot 专业增强版',
    'Copilot Business': 'Copilot 商业版',
    'Copilot Enterprise': 'Copilot 企业版',
    // 计费概述“订阅”卡片的学生方案
    'Copilot Student': 'Copilot 学生版',
    'Advanced Security': '高级安全'
    // 付款方式「Sign in to <PayPal 标志>」：Sign in to 由 auth 的全站 static 收录
  },
  regexp: [
    // 其他计费详细信息
    [/^In addition to your personal account, you manage (\d+) organizations?\.$/, '除个人帐户外，你还管理 $1 个组织。'],
    [
      new RegExp(`^You['’]ve cancelled your subscription to (.+?)\\. This plan change will take effect on (${DATE_SOURCE})\\.$`),
      (_, name: string, date: string) =>
        joinCjk(joinCjk(joinCjk('你已取消订阅', planName(name)), '。此计划变更将于'), translateTime(date)) + '生效。'
    ],
    // 优惠券与教育福利（句号随原文）
    [
      new RegExp(`^(\\$[\\d,]+(?:\\.\\d{2})?) off per month until (${DATE_SOURCE})(\\.?)$`),
      (_, amount: string, date: string, dot: string) => `${joinCjk(translateTime(date), '前每月减免')} ${amount}${dot ? '。' : ''}`
    ],
    // 优惠券期限在单独元素中：“$4.00 off per month” + “until Dec 31, 2026.”
    [/^(\$[\d,]+(?:\.\d{2})?) off per month$/, '每月减免 $1'],
    [
      new RegExp(`^until (${DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${joinCjk('至', translateTime(date))}${dot ? '。' : ''}`
    ],
    [/^· (\d+) (day|month|year)s? remaining$/, (_, amount: string, unit: string) => `· 剩余 ${amount} ${UNITS[unit] ?? unit}`],
    [new RegExp(`^Submitted (${TIME_SOURCE})$`), (_, time: string) => joinCjk('提交于', translateTime(time))],
    // 与开发人员设置的令牌有效期一致，用“过期”
    [
      /^Expires in (?:(about|almost|over) )?(\d+) (day|month|year)s?$/,
      (_, qualifier: string, amount: string, unit: string) => `${QUALIFIERS[qualifier] ?? ''}${amount}${UNITS[unit] ?? unit}后过期`
    ],
    // 付款方式：卡片尾号与有效期
    [/^(Visa|Mastercard|MasterCard|American Express|Amex|Discover|JCB|Diners Club|UnionPay) ending in (\d{4})$/, '$1 尾号 $2'],
    [/^Expires (\d{1,2}\/\d{2,4})$/, '有效期至 $1'],
    // 计划价格
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?month$/, '$1/月'],
    [/^(\$[\d,]+(?:\.\d{2})?) ?\/ ?year$/, '$1/年'],
    [/^(\$[\d,]+(?:\.\d{2})?) per month$/, '每月 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) per year$/, '每年 $1'],
    [/^(\$[\d,]+(?:\.\d{2})?) spend limit$/, '$1 支出上限'],
    // 取消 Copilot 订阅对话框：Cancel Copilot Pro / Pro+ / Max（方案名译成「X 版」，Max 保留）
    [/^Cancel (Copilot (?:Pro\+?|Max))$/, (_, name: string) => joinCjk('取消', planName(name))],
    // 其他计费详细信息：Marketplace 应用的支持链接「Codecov | Code Coverage support」；常见的通用支持名称排除在外
    [/^(?!(?:Contact|Community|Web-based|Standard|Premium|Priority|Customer|Enterprise|Email) support$)([A-Z0-9].*) support$/, '$1 支持'],
    // 教育福利：提交申请失败（错误原因未收录时保留原文）
    [
      /^There was an error creating the discount request\. Errors: Discount request could not be created\. Discount request errors: (.+)$/,
      (_, reason: string) => `创建折扣申请时出错。错误：无法创建折扣申请。折扣申请错误：${DISCOUNT_ERRORS.get(reason) ?? reason}`
    ]
  ]
} satisfies PageDictionary
