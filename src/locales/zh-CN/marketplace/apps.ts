import type { PageDictionary } from '../../../core/types'

/** 订单页的提交按钮（同意条款句中引用按钮名） */
const ORDER_BUTTONS: Readonly<Record<string, string>> = {
  'Complete order and begin installation': '完成订单并开始安装',
  'Issue plan changes and begin installation': '提交计划变更并开始安装',
  'Complete order': '完成订单'
}

/**
 * GitHub 应用页（/apps/<name>）、安装与授权（/apps/<name>/installations/…）、
 * 订单页（/marketplace/<name>/order/<id>）、待处理订单与待安装（/marketplace/orders/pending、/marketplace/installations/pending）。
 */
export default {
  static: {
    // 订单页：按钮、安装范围、跳转、已安装提示（第三方应用名照录）
    'Issue plan changes and begin installation': '提交计划变更并开始安装',
    'Complete order': '完成订单',
    'This applies to all current and future repositories owned by the resource owner. Also includes public repositories (read-only).':
      '适用于资源所有者拥有的所有当前和未来存储库。同时包括公共存储库（只读）。',
    'If your browser does not redirect you automatically, please visit this setup page to continue.':
      '如果浏览器没有自动跳转，请访问此设置页面继续。',
    'Marketplace Terms of Service.': '市场服务条款。',
    // Render 上架项的计划说明（第三方内容，按用户要求收录）
    'Sign up to auto-deploy web apps for free': '注册即可免费自动部署 Web 应用',
    'Free. Sign up to auto-deploy web apps for free': '免费。注册即可免费自动部署 Web 应用',
    'Free web services': '免费 Web 服务',
    'Free static sites': '免费静态网站',
    'Free Postgres databases': '免费 Postgres 数据库',
    'Free Key Value (Redis-compatible) caches': '免费键值（兼容 Redis）缓存',
    // 上架页「<计划名> plan available.」：Render 的计划名是一句说明，整句收录（不加原文没有的引号，按语义拆成两句）
    'Free. Sign up to auto-deploy web apps for free plan available.': '提供免费计划。注册即可免费自动部署 Web 应用。',
    // Codecov 上架项的计划说明（第三方内容，按用户要求收录；计划名 Umbrella 见 listing 的 PLAN_NAMES）
    'Unlimited public repositories': '无限公共存储库',
    "Use Codecov's standard plan with all features and unlimited private repositories":
      '使用包含全部功能和无限专用存储库的 Codecov 标准计划',
    // 应用页 /apps/<name>
    'Read more about this app on the Marketplace': '在市场中了解此应用',
    'Manage your installation settings.': '管理安装设置。',
    'Learn more about GitHub Apps': '了解 GitHub 应用',

    // 选择安装目标 /apps/<name>/installations/select_target
    'Install & Authorize': '安装并授权',
    'Authorize & Request': '授权并申请',
    'Install & Authorize on your personal account': '安装并授权到个人帐户',
    'Install & Authorize on your organization': '安装并授权到组织',
    'Install on your personal account': '安装到个人帐户',
    'Install on your organization': '安装到组织',
    'Request on your organization': '向组织申请',
    'Authorize & Request on your organization': '授权并向组织申请',

    // 存储库访问
    'for these repositories:': '用于以下存储库：',
    'This applies to all current': '适用于资源所有者拥有的所有当前',
    'future repositories owned by the resource owner.': '未来的存储库。',
    'Also includes public repositories (read-only).': '同时包括公共存储库（只读）。',

    // 权限
    'with these permissions:': '具有以下权限：',
    "can also request users' permission to the following resources. These permissions will be requested and authorized on an individual-user basis.":
      '还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。',
    'can also request users’ permission to the following resources. These permissions will be requested and authorized on an individual-user basis.':
      '还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。',
    'These permissions will also be requested and authorized as needed on an individual-user basis.':
      '这些权限也将按需针对单个用户请求和授权。',
    // 按钮提交后的进度文字（另见 scoped 的 Installing、Requesting）
    'Installing & Authorizing': '安装并授权中',

    // 安装后跳转
    "Next: you'll be redirected to": '下一步：你将被重定向到',
    'Next: you’ll be redirected to': '下一步：你将被重定向到',
    'Next: you’ll be directed to the GitHub App’s site to complete setup.': '下一步：你将前往 GitHub 应用的网站完成设置。',
    "Next: you'll be directed to the GitHub App's site to complete setup.": '下一步：你将前往 GitHub 应用的网站完成设置。',

    // 订单页 /marketplace/<name>/order/<id>
    'To complete this installation, you must': '要完成安装，必须',
    'grant this app access': '授予此应用访问',
    'to your GitHub account.': '你的 GitHub 帐户的权限。',
    // 第二句之后接链接「签署」the「GitHub 客户协议」（整句见 inline）；原文没有逗号，译文用“若要…请”承接
    'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by':
      '组织所有者或账单管理员必须将个人账单信息链接到此组织帐户。若要切换为企业帐户以使用企业账单信息请',
    'Complete order and begin installation': '完成订单并开始安装',
    // 原文按钮名带引号、引号后有逗号，译文照录
    'By clicking “Complete order and begin installation”, you agree to the': '单击“完成订单并开始安装”，即表示你同意',
    'By clicking "Complete order and begin installation", you agree to the': '单击“完成订单并开始安装”，即表示你同意',

    // 待处理订单 /marketplace/orders/pending
    'Pending orders': '待处理订单',
    'Review and complete your orders': '查看并完成订单',
    // 后接链接“计费概述页”+ 句号：链接作“前往”的宾语；原文第二句没有逗号，译文不加
    'We noticed you started setting up some new plans but didn’t finish. You can complete your pending orders below or review any active subscriptions on the':
      '你有尚未完成设置的新计划。可在下方完成待处理订单或前往可查看有效订阅的',
    "We noticed you started setting up some new plans but didn't finish. You can complete your pending orders below or review any active subscriptions on the":
      '你有尚未完成设置的新计划。可在下方完成待处理订单或前往可查看有效订阅的',
    'Remove from pending orders': '从待处理订单中删除',
    'This will not affect your existing subscriptions.': '这不会影响现有订阅。',

    // 待安装 /marketplace/installations/pending
    'Pending installations': '待安装',
    "We noticed you’ve purchased some apps but didn't finish installing them. You can review and install them below.":
      '你购买的部分应用尚未完成安装。可在下方查看并安装。',
    'We noticed you’ve purchased some apps but didn’t finish installing them. You can review and install them below.':
      '你购买的部分应用尚未完成安装。可在下方查看并安装。',
    "We noticed you've purchased some apps but didn't finish installing them. You can review and install them below.":
      '你购买的部分应用尚未完成安装。可在下方查看并安装。',
    // 后接链接“计费概述页”+ 句号；原文没有标点，译文不加逗号
    'View or cancel any active subscriptions on the': '如需查看或取消有效订阅请前往',
    'Grant this app access to your GitHub account to complete installation.': '授予此应用访问你的 GitHub 帐户的权限以完成安装。'
  },
  scoped: {
    Website: '网站',
    // 订单页「已安装」对话框里的链接文字（整句见 inline）
    'current installation': '当前安装',
    Request: '申请',
    request: '申请',
    Installing: '安装中',
    Requesting: '申请中',
    signing: '签署',
    'Only select repositories': '仅选定的存储库',
    'Search for a repository': '搜索存储库',
    'Select at least one repository.': '至少选择一个存储库。',
    'User permissions': '用户权限',
    'App settings': '应用设置',
    'Save and continue': '保存并继续',
    'Order summary': '订单摘要',
    'New plan': '新计划',
    'Due today': '今日应付',
    'Edit your plan': '编辑计划',
    'Review your order': '查看订单',
    'Cancel this plan': '取消此计划',
    'billing overview page': '计费概述页',
    '(current plan)': '（当前计划）',
    // 订单完成后的跳转说明里的链接（整句见 inline）
    'setup page': '设置页面'
  },
  regexp: [
    // 订单页：下一步、按比例计费区间、跳转、已安装 / 取消 / 卸载确认（第三方应用名、组织名、日期照录）
    [/^Next: Authorize (.+) to access your account\.$/, '下一步：授权 $1 访问你的帐户。'],
    [
      /^Prorated for (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})(?:st|nd|rd|th)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})(?:st|nd|rd|th)$/,
      (_, m1: string, d1: string, m2: string, d2: string) => {
        const months = 'JanFebMarAprMayJunJulAugSepOctNovDec'
        return `${months.indexOf(m1) / 3 + 1}月${d1}日至${months.indexOf(m2) / 3 + 1}月${d2}日按比例计费`
      }
    ],
    [/^You are being redirected to (.+) to continue installation\.$/, '正在重定向到 $1 以继续安装。'],
    [
      /^You have already installed and set up a plan for (.+) on ([\w.-]+)\. To proceed, please select a different plan or account\.$/,
      '你已在 $2 上安装 $1 并设置了计划。如需继续，请选择其他计划或帐户。'
    ],
    [
      /^Cancelling this plan will end your subscription to this app on (\d{4}-\d{2}-\d{2})\. Are you sure you wish to continue\?$/,
      '取消此计划将于 $1 终止你对此应用的订阅。确定继续吗？'
    ],
    [
      /^It looks like (.+) has already been installed on your account\. You can view your current installation or continue with setting up this plan\.$/,
      '$1 似乎已安装在你的帐户上。可以查看当前安装或继续设置此计划。'
    ],
    [
      /^This action cannot be undone\. Are you sure you want to uninstall this GitHub App from (\d+) repositor(?:y|ies)\?$/,
      '此操作无法撤消。确定从 $1 个存储库卸载此 GitHub 应用吗？'
    ],
    [/^You[’']re all set! A job has been queued to uninstall the [‘']?(.+?)[’']? app\.$/, '已完成！卸载“$1”应用的作业已加入队列。'],
    // 页面标题
    [/^GitHub Apps - (.+)$/, 'GitHub 应用 - $1'],

    // 安装目标
    [/^Install & Authorize on your personal account (\S+)$/, '安装并授权到个人帐户 $1'],
    [/^Install & Authorize on your organization (\S+)$/, '安装并授权到组织 $1'],
    [/^Install on your personal account (\S+)$/, '安装到个人帐户 $1'],
    [/^Install on your organization (\S+)$/, '安装到组织 $1'],
    [/^Authorize & Request on your organization (\S+)$/, '授权并向组织 $1 申请'],
    [/^Request on your organization (\S+)$/, '向组织 $1 申请'],
    [/^Where do you want to install (.+)\?$/, '要将 $1 安装到哪里？'],
    [/^(.+) is installed\. Click to configure\.$/, '$1 已安装。单击进行配置。'],
    // 原文末尾的句号照录
    [/^Selected (\d+) repositor(?:y|ies)(\.?)$/, (_, count: string, period: string) => `已选择 ${count} 个存储库${period ? '。' : ''}`],
    [
      /^Installing and authorizing (.+) immediately grants these permissions on your account:$/,
      '安装并授权 $1 会立即在你的帐户上授予以下权限：'
    ],
    [
      /^(.+) can also request users['’] permission to the following resources\. These permissions will be requested and authorized on an individual-user basis\.$/,
      '$1 还可以请求用户对以下资源的权限。这些权限将按单个用户请求和授权。'
    ],
    // 订单页「已安装」对话框的标题（读屏可见）
    [/^You already have (.+) installed\.$/, '你已安装 $1。'],
    [/^Install (.+)$/, '安装 $1']
  ],
  inline: [
    // 订单页「已安装」对话框：「… You can view your <a>current installation</a> or continue with setting up this plan.」
    [
      /^It looks like (.+) has already been installed on your account\. You can view your \{\} or continue with setting up this plan\.$/,
      '$1 似乎已安装在你的帐户上。可以查看{}或继续设置此计划。'
    ],
    // 订单完成后的跳转说明：「… please visit this <a>setup page</a> to continue.」
    ['If your browser does not redirect you automatically, please visit this {} to continue.', '如果浏览器没有自动跳转，请访问此{}继续。'],
    // 订单页同意条款：「By clicking "…", you are agreeing to Render’s <a>服务条款</a> and the <a>隐私政策</a>. You previously agreed to the <details>市场服务条款。</details>」
    [
      /^By clicking ["“](Complete order and begin installation|Issue plan changes and begin installation|Complete order)["”], you are agreeing to (.+?)[’']s \{\} and(?: the)? \{\}\. You previously agreed to the \{\}$/,
      (_, button: string, app: string) => `单击“${ORDER_BUTTONS[button] ?? button}”即表示你同意 ${app} 的{}和{}。你之前已同意{}`
    ],
    // 订单页：首段 + 链接 signing + the + 链接 GitHub Customer Agreement + 句号；整句命中时去掉 the，
    // 显示为“…请签署 GitHub 客户协议。”。不命中时按 static 首段与 scoped 的 signing 逐段翻译
    [
      'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by {} the {}.',
      '组织所有者或账单管理员必须将个人账单信息链接到此组织帐户。若要切换为企业帐户以使用企业账单信息请{} {}。'
    ]
  ],
  ignore: [
    // 订单页「市场服务条款」弹窗正文（法律文本，不翻译；全局对 details-dialog 法律文本的 .markdown-body 已放行，见 core/ignore.ts）
    '.js-marketplace-form-wrapper details-dialog > .Box-body',
    // 应用页名称
    '.Layout-main h1.f1',
    // 侧栏：开发人员帐户名、第三方说明中的应用名
    '.Layout-sidebar img.avatar + a',
    '.Layout-sidebar > ul + p > strong'
  ]
} satisfies PageDictionary
