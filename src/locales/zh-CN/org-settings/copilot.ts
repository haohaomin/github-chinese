import type { PageDictionary } from '../../../core/types'

/** 内容排除继承规则的层级、下载记忆对话框的实体类型 */
const ENTITY_TYPES: Readonly<Record<string, string>> = { enterprise: '企业', organization: '组织' }

/**
 * 组织 Copilot 设置：访问（席位分配）、策略、模型、云代理（存储库访问、合作伙伴代理、互联网访问、
 * 运行器类型）、代码审查、内容排除、Copilot Memory 管理。
 * 与个人 Copilot 设置、存储库 Copilot 设置同名的条目放 scoped；
 * 个人设置、存储库设置已收录为 static 的策略名、审查力度文案等不再重复，译法以那里为准。
 */
export default {
  static: {
    // 未启用 Copilot 时的引导
    'The AI powered pair programmer for your organization. Once you complete onboarding, you’ll have the ability to manage policies and control which users or teams will have access to':
      '面向组织的 AI 结对编程助手。完成入门设置后，你可以管理策略，并控制组织内哪些用户或团队可以使用',
    "The AI powered pair programmer for your organization. Once you complete onboarding, you'll have the ability to manage policies and control which users or teams will have access to":
      '面向组织的 AI 结对编程助手。完成入门设置后，你可以管理策略，并控制组织内哪些用户或团队可以使用',

    // 访问：席位分配
    'Copilot Business is active in your organization': '你的组织已启用 Copilot 商业版',
    'Copilot Enterprise is active in your organization': '你的组织已启用 Copilot 企业版',
    'Access management': '访问管理',
    'Enabled for all members': '已为所有成员启用',
    'Enabled for selected members': '已为选定成员启用',
    'Enabled For:': '启用对象：',
    'selected members': '选定成员',
    'all members': '所有成员',
    'Allow this organization to assign seats': '允许此组织分配席位',
    'Start adding seats': '开始添加席位',
    'Purchase for all members': '为所有成员购买',
    'Purchase for selected members': '为选定成员购买',
    'Confirm seats purchase for all members': '确认为所有成员购买席位',
    'Enable Copilot access for users and teams': '为用户和团队启用 Copilot 访问权限',
    'Upload CSV': '上传 CSV',
    'Choose CSV to upload': '选择要上传的 CSV',
    'Continue to purchase': '继续购买',
    'Remove Copilot access': '删除 Copilot 访问权限',
    'Confirm and remove seats': '确认并删除席位',
    'Confirm policy update': '确认策略更新',
    'Renew seats': '续订席位',
    'Cancel seat': '取消席位',
    'Confirm seat removal': '确认删除席位',
    'Go to policies': '转到策略',
    'Add people': '添加人员',
    'Add teams': '添加团队',
    'Last activity': '最近活动',
    'No activity yet': '暂无活动',
    'Members awaiting Copilot access': '等待 Copilot 访问权限的成员',
    // 「3 members」+「will get … — no action needed. …」：分句间的破折号译“——”
    'will get Copilot access automatically within 24 hours — no action needed. Need it sooner? Pay now.':
      '将在 24 小时内自动获得 Copilot 访问权限——无需任何操作。需要更快？请立即付款。',
    'Pay now': '立即付款',
    'Confirm purchase': '确认购买',
    'Please confirm you are purchasing the previously assigned licenses.': '请确认你要为之前分配的许可证付款。',
    'Purchase licenses': '购买许可证',
    'Purchase failed': '购买失败',
    'Something went wrong while starting your purchase. Please try again.': '发起购买时出错。请重试。',
    'Due today': '今日应付',
    'Covered by account credits': '由帐户额度支付',
    // 「This organization is part of」+ 企业名 +「and is billed at the enterprise level.」：原文无逗号，译文不加
    'This organization is part of': '此组织隶属于',
    'and is billed at the enterprise level.': '并在企业级别计费。',
    'Get activity report': '获取活动报告',
    'Get reports': '获取报告',
    'View policies': '查看策略',

    // Copilot Memory 管理
    'Download user memories': '下载用户记忆',
    'Delete user memories': '删除用户记忆',
    'Delete user memories?': '删除用户记忆？',
    'Download user memories?': '下载用户记忆？',
    'Delete memories': '删除记忆',
    'Download memories': '下载记忆',
    'This action cannot be undone. Deleted memories cannot be recovered.': '此操作无法撤销。删除的记忆无法恢复。',
    // 原文按钮名无引号，译文不加
    'By clicking Delete memories, you confirm you have permission to perform this action on behalf of these users.':
      '单击删除记忆即表示你确认有权代表这些用户执行此操作。',
    'By clicking Download memories, you confirm you have permission to access this information on behalf of users in this':
      '单击下载记忆即表示你确认有权代表用户访问这些信息，这些用户属于此',
    'Checking delete status...': '正在检查删除状态...',
    'Checking delete status…': '正在检查删除状态…',
    'Deleting memories...': '正在删除记忆...',
    'Deleting memories…': '正在删除记忆…',
    'Checking export status...': '正在检查导出状态...',
    'Checking export status…': '正在检查导出状态…',
    'Generating report...': '正在生成报告...',
    'Generating report…': '正在生成报告…',
    'Memory delete completed': '记忆已删除',
    'Memory delete is taking longer than expected': '删除记忆的时间比预期长',
    'Memory delete failed': '删除记忆失败',
    'Memory export is taking longer than expected': '导出记忆的时间比预期长',
    'Memory export failed': '导出记忆失败',
    'User memories have been permanently deleted.': '用户记忆已永久删除。',
    'This delete is taking longer than expected. You can close this dialog and check again later.':
      '删除时间比预期长。你可以关闭此对话框，稍后再查看。',
    'This export is taking longer than expected. You can close this dialog and check again later.':
      '导出时间比预期长。你可以关闭此对话框，稍后再查看。',
    "We couldn't delete these memories. Please try again later.": '无法删除这些记忆。请稍后重试。',
    'We couldn’t delete these memories. Please try again later.': '无法删除这些记忆。请稍后重试。',
    "We couldn't check the delete status. Please try again later.": '无法检查删除状态。请稍后重试。',
    'We couldn’t check the delete status. Please try again later.': '无法检查删除状态。请稍后重试。',
    'A memory delete is already in progress for this scope.': '此范围已有正在进行的记忆删除。',
    "You've made too many delete requests. Please try again later.": '删除请求过多。请稍后重试。',
    'You’ve made too many delete requests. Please try again later.': '删除请求过多。请稍后重试。',
    "We couldn't generate your export. Please try again later.": '无法生成导出文件。请稍后重试。',
    'We couldn’t generate your export. Please try again later.': '无法生成导出文件。请稍后重试。',
    "We couldn't check your export status. Please try again later.": '无法检查导出状态。请稍后重试。',
    'We couldn’t check your export status. Please try again later.': '无法检查导出状态。请稍后重试。',

    // 内容排除（组织）
    'Choose the repositories and paths that GitHub Copilot should exclude.': '选择 GitHub Copilot 应排除的存储库和路径。',
    'All exclusions defined will apply to all members of your organization.': '定义的所有排除项都将适用于组织的所有成员。',
    'Repositories and paths to exclude:': '要排除的存储库和路径：',

    // 运行器类型（组织级）
    'Runner type configuration': '运行器类型配置',
    'Edit runner type': '编辑运行器类型',
    'Standard GitHub runner': '标准 GitHub 运行器',
    'Labeled runner': '带标签的运行器',
    'Save runner selection': '保存运行器选择',
    'Allow repositories to customize the runner type': '允许存储库自定义运行器类型',

    // 合作伙伴代理
    'Partner agents': '合作伙伴代理',
    'Allow automations': '允许自动化',

    // 编码代理 / 云代理：存储库访问
    'Choose which repositories Copilot coding agent should be enabled in. Copilot coding agent will only be available where it is enabled for the repository and in the Copilot license policies.':
      '选择要在哪些存储库中启用 Copilot 编码代理。只有在存储库和 Copilot 许可证策略中都已启用的地方，才能使用 Copilot 编码代理。',
    'Choose which repositories Coding agent should be enabled in. Coding agent will only be available where it is enabled for the repository and in the Copilot license policies.':
      '选择要在哪些存储库中启用编码代理。只有在存储库和 Copilot 许可证策略中都已启用的地方，才能使用编码代理。',
    'Choose which repositories Copilot cloud agent should be enabled in. Copilot cloud agent will only be available where it is enabled for the repository and in the Copilot license policies.':
      '选择要在哪些存储库中启用 Copilot 云代理。只有在存储库和 Copilot 许可证策略中都已启用的地方，才能使用 Copilot 云代理。',

    // 策略、模型
    'Configure custom models': '配置自定义模型',
    'Configure models': '配置模型',
    'Restrict MCP access to registry servers': '将 MCP 访问限制为注册表中的服务器',
    'Allow use of Copilot CLI billed to the organization': '允许使用计费到组织的 Copilot CLI',
    'Default availability': '默认可用性',
    'Default availability for released models': '已发布模型的默认可用性',
    'Delegate to Default Policy': '委托给默认策略',
    'Enable custom models': '启用自定义模型',
    'Add API key': '添加 API 密钥',
    'Available models': '可用模型',
    'Deployment URL': '部署 URL',
    'Enable GitHub Copilot': '启用 GitHub Copilot'
  },
  scoped: {
    // 「…will have access to」+「Copilot」+「inside your organization.」
    'inside your organization.': '。',
    'Pending cancellation': '待取消',
    'API key': 'API 密钥',
    // 席位与访问（与企业 / 个人设置同名）
    'Copilot access': 'Copilot 访问权限',
    'Users and teams': '用户和团队',
    'Assign seats': '分配席位',

    // 策略（与个人 Copilot 设置同名）
    'Opt in to preview features': '选择加入预览功能',
    'Opt in to user feedback collection': '选择加入用户反馈收集',
    'If enabled, users will see options to provide feedback on selected Copilot features.':
      '启用后，用户将看到对部分 Copilot 功能提供反馈的选项。',
    'If enabled, users can test new Copilot features that are not yet generally available. Be aware that previews of features may have flaws, and the features may be changed or discontinued at any time.':
      '启用后，用户可以试用尚未正式发布的 Copilot 新功能。请注意，预览功能可能存在缺陷，并可能随时更改或停用。',
    'Agent apps': '代理应用',
    // 状态用“已+动词”，与规则集见解一致
    Allowed: '已允许',
    Blocked: '已阻止',
    Unconfigured: '未配置',
    'No policy': '无策略',
    'Select an option': '选择选项',
    'Failed to update setting': '无法更新设置',
    'Failed to update setting, please try again later.': '无法更新设置，请稍后重试。',
    Unavailable: '不可用',
    'Requires preview features': '需要预览功能',
    'Preview features are disabled by your enterprise.': '你的企业已禁用预览功能。',
    'Preview features are not enabled for this organization.': '此组织未启用预览功能。',
    'Manage preview features': '管理预览功能',

    // 代码审查（与存储库设置共用）
    'General settings': '常规设置',
    'Limits the review effort Copilot can use in this organization. Repositories can only set a stricter limit.':
      '限制 Copilot 在此组织中可使用的审查力度。存储库只能设置更严格的限制。',
    'Organization default': '组织默认值',
    'Inherit the review effort level set for the organization': '继承组织设置的审查力度',
    'Enterprise default': '企业默认值',
    'Inherit the GitHub default review effort level': '继承 GitHub 默认审查力度',
    'Use the default review effort level': '使用默认审查力度',
    'No limit': '无限制',
    'Copilot can use any available review effort': 'Copilot 可以使用任何可用的审查力度',
    'Use the maximum review effort set for the organization': '使用组织设置的最高审查力度',
    'Use the maximum review effort set at a higher level': '使用上级设置的最高审查力度',
    Lite: '轻量',
    Balanced: '均衡',
    Max: '最高',
    Auto: '自动',

    // 云代理（与存储库设置共用）
    'No repositories': '无存储库',
    'Only selected repositories': '仅选定的存储库',
    'Enable firewall': '启用防火墙',
    'Recommended allowlist': '推荐的允许列表',
    'Custom allowlist': '自定义允许列表',
    'Add rule': '添加规则',
    'Delete rule': '删除规则',
    'No rules yet': '暂无规则',
    'Validation tools': '验证工具',
    'Model Context Protocol (MCP)': '模型上下文协议 (MCP)',
    'MCP configuration': 'MCP 配置',
    // 「Use of Copilot coding agent is subject to the」+「pre-release terms」
    'pre-release terms': '预发行条款',

    // 内容排除（与存储库设置共用）
    'Use separate lines to choose which folders and files will be excluded by GitHub Copilot':
      '每行填写一个要让 GitHub Copilot 排除的文件夹或文件',
    'Excluded paths not updated, check the errors and try again.': '排除路径未更新，请检查错误后重试。',
    'Excluded paths updated.': '已更新排除路径。',
    'Delete excluded paths': '删除排除路径',
    'You are about to delete all excluded paths. Are you sure you want to proceed?': '你即将删除所有排除路径。确定要继续吗？',
    'Copilot won’t be able to access or utilize the contents located in those specified paths.':
      'Copilot 将无法访问或使用这些指定路径中的内容。',
    "Copilot won't be able to access or utilize the contents located in those specified paths.":
      'Copilot 将无法访问或使用这些指定路径中的内容。',
    'Learn more about setup and usage.': '了解设置和用法。',
    'Excluded paths inherited from': '排除路径继承自',
    'Values defined by': '值的定义者',
    'last edited': '最后编辑于',

    // 选择存储库对话框：筛选按钮与计数片段（item → 项）
    Exclude: '排除',
    'items shown.': '个项已显示。',
    'No filter': '无筛选器',
    'Error loading repositories.': '加载存储库时出错。',
    'No repositories to show.': '没有可显示的存储库。',

    // 未启用 Copilot、试用与购买（与个人 Copilot 设置一致）
    'Not enabled': '未启用',
    'Get started': '开始使用',
    'Getting started': '入门',
    'to get started.': '即可开始使用。',
    'Start free trial': '开始免费试用',
    'Start a free trial': '开始免费试用',
    'Create an organization': '创建组织',
    'Requesting...': '申请中...',
    'Requesting…': '申请中…',
    'Cancelling...': '取消中...',
    'Cancelling…': '取消中…',
    'Read more.': '了解更多。',
    'Upgrade plan': '升级计划',
    'Purchase Copilot': '购买 Copilot',
    'Enable Copilot': '启用 Copilot',
    'Disable Copilot': '禁用 Copilot',
    'Contact an enterprise owner to enable them.': '请联系企业所有者启用。',
    'Contact an organization owner to enable them.': '请联系组织所有者启用。',

    // 访问：席位
    'Seat management': '席位管理',
    'Copilot seat assignment': 'Copilot 席位分配',
    'Disabled for all members': '已为所有成员禁用',

    // 策略、功能名
    'Copilot in the IDE': '在 IDE 中使用 Copilot',
    'MCP servers in Copilot CLI': 'Copilot CLI 中的 MCP 服务器',
    'Copilot metrics API access': 'Copilot 指标 API 访问',
    'Copilot usage metrics': 'Copilot 使用情况指标',
    'Enabled everywhere': '全部启用',
    'Enabled for all repositories': '已为所有存储库启用',
    'Enabled for selected repositories': '已为选定的存储库启用',
    'Disabled for all repositories': '已为所有存储库禁用',
    'Review effort': '审查力度',
    'Default (Balanced)': '默认（均衡）',

    // 云代理、内容排除
    'Coding agent policies': '编码代理策略',
    'Third-party agents': '第三方代理',
    Firewall: '防火墙',
    Allowlist: '允许列表',
    'Paths to exclude': '要排除的路径',
    'Repositories and paths to exclude': '要排除的存储库和路径'
  },
  regexp: [
    [/^(\d+) seats? assigned$/, '已分配 $1 个席位'],
    // 省略号随原文
    [/^(\d+) members? selected(\.\.\.|…)$/, '已选择 $1 个成员$2'],
    [/^(\d+) teams? selected$/, '已选择 $1 个团队'],
    [
      /^You have (\d+) characters, but the maximum is (\d+)(\.?)$/,
      (_, count: string, max: string, dot: string) => `当前 ${count} 个字符，上限为 ${max} 个${dot ? '。' : ''}`
    ],
    // 模型策略说明（与个人 Copilot 设置一致）
    [/^If enabled, you can access and send data to ([\w .()/:-]{1,100})\.$/, '启用后，你可以访问 $1 并向其发送数据。'],
    // 存储库选择器只显示部分结果：「10」+「 of 」+「1.2k」+「 items shown.」
    [/^(\d[\d,]*) of (\d[\d,.]*[kKmM]?) items shown\.$/, '显示 $2 个项中的 $1 个。'],
    // 确认购买对话框的金额明细（“今日应付”旁、各计划明细行），单个文本节点
    [/^(\d[\d,]*) users?, (\$[\d,]+(?:\.\d+)?) per user\/month$/, '$1 个用户，每用户 $2/月'],
    // 删除、下载记忆对话框首段：整句是一个文本节点（登录名、计费的组织或企业）
    [
      /^This will permanently delete user-scoped Copilot memories for ([\w-]+) that are billed to (.+)\.$/,
      '这将永久删除计费到 $2 的 $1 用户范围 Copilot 记忆。'
    ],
    [
      /^This will permanently delete user-scoped Copilot memories for all users with Copilot seats billed to (.+)\.$/,
      '这将永久删除 Copilot 席位计费到 $1 的所有用户的用户范围 Copilot 记忆。'
    ],
    [
      /^This will download user-scoped Copilot memories for ([\w-]+) that are billed to (.+)\.$/,
      '这将下载计费到 $2 的 $1 用户范围 Copilot 记忆。'
    ],
    [
      /^This will download user-scoped Copilot memories for all users with Copilot seats billed to (.+)\.$/,
      '这将下载 Copilot 席位计费到 $1 的所有用户的用户范围 Copilot 记忆。'
    ],
    // 下载记忆对话框第二段：「… in this 」+ 实体类型 +「.」三个相邻文本节点，整段拼读
    [
      /^By clicking Download memories, you confirm you have permission to access this information on behalf of users in this (organization|enterprise)\.$/,
      (_, entity: string) => `单击下载记忆即表示你确认有权代表此${ENTITY_TYPES[entity]}的用户访问这些信息。`
    ],
    // 内容排除的继承规则说明：图标 +「 Values defined by 」+ 名称 +「's administrators can't be edited」，整段拼读
    [/^Values defined by (.+?)['’]s administrators can['’]t be edited$/, '由 $1 的管理员定义的值无法编辑'],
    // 继承规则标签：「Excluded paths inherited from 」+ 层级 +「 」+ 名称 +「:」。名称有链接时前三段拼读、
    // 冒号是孤立标点（拼读为“排除路径继承自企业 <a>octo-ent</a>：”）；没有链接时名称也是文本，整段拼读
    [/^Excluded paths inherited from (enterprise|organization)$/, (_, level: string) => `排除路径继承自${ENTITY_TYPES[level]}`],
    [
      /^Excluded paths inherited from (enterprise|organization) (.+):$/,
      (_, level: string, name: string) => `排除路径继承自${ENTITY_TYPES[level]} ${name}：`
    ]
  ]
} satisfies PageDictionary
