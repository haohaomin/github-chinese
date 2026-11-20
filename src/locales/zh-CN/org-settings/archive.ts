import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/** 审核日志搜索建议「action: filter by action」中的筛选对象（与个人安全日志一致） */
const FILTER_TARGET: Readonly<Record<string, string>> = {
  action: '操作',
  actor: '参与者',
  country: '国家/地区',
  'created date': '创建日期',
  operation: '操作类型',
  organization: '组织',
  repository: '存储库',
  team: '团队',
  user: '用户'
}

/** 审核日志令牌策略事件中的令牌类型 */
const TOKEN_KIND: Readonly<Record<string, string>> = {
  'personal access tokens (classic)': '个人访问令牌（经典）',
  'fine-grained personal access tokens': '精细个人访问令牌'
}
const TOKENS = '(personal access tokens \\(classic\\)|fine-grained personal access tokens)'

/** 令牌有效期事件末尾的「(Not exempting administrators)」 */
const EXEMPT: Readonly<Record<string, string>> = { 'Not exempting': '不豁免管理员', Exempting: '豁免管理员' }

/** 双因素要求事件的动作 */
const TWO_FACTOR_VERB: Readonly<Record<string, string>> = { removed: '移除了', cleared: '清除了', enabled: '启用了', disabled: '禁用了' }

/** Dependabot 规则事件中的规则名称（未收录的照原文） */
const DEPENDABOT_RULE: Readonly<Record<string, string>> = { 'Dismiss package malware alerts': '消除软件包恶意软件警报' }

/**
 * 存档与日志：预定提醒（组织）、赞助日志、审核日志、源 IP 显示、已删除的存储库。
 * 个人设置已收录的审核日志、赞助日志、已删除存储库的通用文字不再重复；这里只补组织独有的部分和本页正则。
 * 审核日志搜索建议等短语在个人设置是 scoped，本页面类型另收一份，译法一致。
 */
export default {
  static: {
    // 审核日志设置：源 IP 显示开关的保存提示
    'Audit log source IP disclosure enabled.': '已启用审核日志源 IP 显示。',
    'Audit log source IP disclosure disabled.': '已禁用审核日志源 IP 显示。',
    // 审核日志事件（无槽位）
    'Updated codespace access and security settings to disable access to all repositories':
      '将代码空间访问和安全设置更新为禁止访问所有存储库',
    // 审核日志：导出截断提示（「… or the <a>REST API</a> for complete results.」见 inline）、预算事件
    'Budget alerts are enabled.': '预算警报已启用。',
    // 预定提醒（组织）
    'No scheduled reminders created.': '暂无预定提醒。',
    'To keep projects moving, you can now remind your teams about pull requests they need to review.':
      '你现在可以提醒团队处理需要他们审查的拉取请求，让项目保持推进。',
    'Connect a Slack workspace to get started': '连接 Slack 工作区以开始使用',
    'Add Slack workspace': '添加 Slack 工作区',
    'We have rolled out a new version of the GitHub app in Slack. If you are currently on the old app, please consider switching over to the new app! More info about migration can be found':
      '我们已在 Slack 中推出新版 GitHub 应用。如果你仍在使用旧版应用，请考虑切换到新版！迁移详情请参阅',
    "1. Clicking on 'Add' will configure your Slack workspace with the new GitHub app.":
      '1. 单击“添加”将使用新版 GitHub 应用配置你的 Slack 工作区。',
    '2. If you already have the old app in Slack, it will uninstall the legacy app and install the new one.':
      '2. 如果 Slack 中已有旧版应用，将卸载旧版应用并安装新版。',

    // 预定提醒表单（组织与团队共用）
    'Add your first reminder': '添加第一个提醒',
    'Delete this reminder': '删除此提醒',
    'Slack channel': 'Slack 频道',
    Weekdays: '工作日',
    'Tracked repositories': '跟踪的存储库',
    'Filter by team assigned to review code': '按分配审查代码的团队筛选',
    'Ignore drafts': '忽略草稿',
    'Require review requests': '需要审查请求',
    'Remind authors after reviews': '审查后提醒作者',
    'Ignore approved pull requests': '忽略已批准的拉取请求',
    'Ignore with 1 or more approvals': '有 1 个或更多批准时忽略',
    'Minimum age': '最短存在时间',
    'Minimum staleness': '最短无活动时间',
    'Ignored terms': '忽略的关键词',
    'Ignored labels': '忽略的标签',
    'Required labels': '必需的标签',

    // 审核日志（组织）
    'Export Git Events': '导出 Git 事件',
    'Export Git events': '导出 Git 事件',
    'Export file will be limited to 100 Mb.': '导出文件最大 100 MB。',
    'Disclose actor IP addresses in audit logs': '在审核日志中显示参与者的 IP 地址',
    'Enable source IP disclosure': '启用源 IP 显示',
    "Enabling will allow you to view IP addresses of current members for organization audit log events. As this feature makes your users' IP addresses automatically available, you should review this change with your legal team to determine whether any user notification is required. When enabled at the enterprise level it will be automatically enabled for all organizations owned by the enterprise, the reverse is not true.":
      '启用后，你可以在组织审核日志事件中查看当前成员的 IP 地址。此功能会自动公开用户的 IP 地址，你应与法务团队评估此更改，确定是否需要通知用户。在企业级别启用后，企业拥有的所有组织都会自动启用；反之则不然。',
    'Enabling will allow you to view IP addresses of current members for organization audit log events. As this feature makes your users’ IP addresses automatically available, you should review this change with your legal team to determine whether any user notification is required. When enabled at the enterprise level it will be automatically enabled for all organizations owned by the enterprise, the reverse is not true.':
      '启用后，你可以在组织审核日志事件中查看当前成员的 IP 地址。此功能会自动公开用户的 IP 地址，你应与法务团队评估此更改，确定是否需要通知用户。在企业级别启用后，企业拥有的所有组织都会自动启用；反之则不然。'
  },
  scoped: {
    'first-time contributors': '首次贡献者',
    'first-time contributors new to GitHub': 'GitHub 新用户中的首次贡献者',
    // 审核日志事件槽位里的取值（read / write / private 由同页面类型的其他词条译出）
    'users without write access': '没有写入权限的用户',
    'all outside collaborators': '所有外部协作者',
    'not set': '未设置',
    themselves: '自己',
    none: '无',
    // 预算事件「Budget was <strong>updated</strong> …」中的动作；created / deleted 用规则集洞察的「创建了」「删除了」
    updated: '更新了',
    // 预定提醒
    'here.': '此处。',
    'Add workspace': '添加工作区',
    Days: '星期',
    Times: '时间',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    Sunday: '星期日',

    // 审核日志
    'Organization membership': '组织成员身份',
    'Team management': '团队管理',
    'Hook activity': 'Web 钩子活动',
    'Select events from:': '事件起始日期：',
    'To:': '截止日期：',
    'Download Results': '下载结果',
    Exporting: '导出中',
    Export: '导出',
    'Clear current search query': '清除当前搜索查询',
    'Show more details': '显示更多详细信息',
    'Period:': '时间段：',
    'Filter by': '筛选条件',
    'Source IP disclosure': '源 IP 显示',
    'filter by action': '按操作筛选',
    'filter by actor': '按参与者筛选',
    'filter by country': '按国家/地区筛选',
    'filter by created date': '按创建日期筛选',
    'filter by operation': '按操作类型筛选',
    'filter by team': '按团队筛选',
    'filter by user': '按用户筛选',

    // 赞助日志
    'Past Day': '过去一天',
    'Past Week': '过去一周',
    'Past Month': '过去一个月',
    'Past Year': '过去一年',

    // 已删除的存储库（「Restore」由全站 static 收录）
    Deleted: '删除于',
    'Done!': '完成！',
    'These repositories were deleted by members of this organization. Repositories can be restored for 90 days after deletion.':
      '这些存储库已被此组织的成员删除。存储库删除后 90 天内可以恢复。'
  },
  regexp: [
    // 审核日志事件：更新组织头像；条目头像链接的无障碍名称
    [/^Updated profile picture for ([\w.-]+)$/, '更新了 $1 的头像'],
    [/^View ([\w.-]+)'s profile$/, '查看 $1 的个人资料'],
    [/^Ignore with (\d+) or more approvals?$/, '有 $1 个或更多批准时忽略'],
    [/^Found (\d+) events?$/, '找到 $1 个事件'],
    // 审核日志搜索建议的无障碍标签：「action: filter by action」
    [
      /^([a-z_]+): filter by (action|actor|country|created date|operation|organization|repository|team|user)$/,
      (_, qualifier: string, target: string) => `${qualifier}: 按${FILTER_TARGET[target] ?? target}筛选`
    ],
    [new RegExp(`^This is where you can review activity from ${ORG}[’']s sponsorships\\.$`), '你可以在这里查看 $1 的赞助活动。'],
    [new RegExp(`^No recoverable repositories were found for ${ORG}\\.$`), '未找到 $1 可恢复的存储库。'],
    [/^Are you sure you want to restore ([\w.-]+(?:\/[\w.-]+)?)\?$/, '确定要恢复 $1 吗？']
  ],
  inline: [
    // 提示条：<svg> <strong>ProTip!</strong> Exclude events created by you with <a>-actor:…</a>
    ['{} {} Exclude events created by you with {}', '{} {} 使用 {} 排除你创建的事件'],
    // 存储库、依赖项更新、源 IP 显示
    ['Renamed the repository {} to {}', '将存储库 {} 重命名为 {}'],
    ['Created the repository {}', '创建了存储库 {}'],
    ['Enabled GitHub Actions for {}', '为 {} 启用了 GitHub 操作'],
    ['Disabled dependency updates on self-hosted actions for {}', '为 {} 禁用了自托管操作的依赖项更新'],
    ['Enabled dependency updates on self-hosted actions for {}', '为 {} 启用了自托管操作的依赖项更新'],
    ['Disabled source ip disclosure for the {} organization.', '为 {} 组织禁用了源 IP 显示。'],
    ['Enabled source ip disclosure for the {} organization.', '为 {} 组织启用了源 IP 显示。'],
    // 令牌策略（开头的 <strong> 是参与者；有效期、访问限制见下方正则）
    [
      '{} requires now that fine-grained personal access token requests made by organization members are subject to administrator review',
      '{} 现在要求组织成员的精细个人访问令牌请求须经管理员审查'
    ],
    [
      '{} allows fine-grained personal access token requests made by organization members to no longer be subject to administrator review',
      '{} 已允许组织成员的精细个人访问令牌请求无需管理员审查'
    ],
    [
      new RegExp(`^\\{\\} unset ${TOKENS} expiration limit$`),
      (_: string, kind: string) => `{} 取消了${TOKEN_KIND[kind] ?? kind}的有效期限制`
    ],
    [
      new RegExp(`^\\{\\} set ${TOKENS} maximum lifetime to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`),
      (_: string, kind: string, days: string, exempt: string) =>
        `{} 将${TOKEN_KIND[kind] ?? kind}的最长有效期设为 ${days} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(
        `^\\{\\} changed ${TOKENS} maximum lifetime from (\\d+) days? to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`
      ),
      (_: string, kind: string, from: string, to: string, exempt: string) =>
        `{} 将${TOKEN_KIND[kind] ?? kind}的最长有效期从 ${from} 天改为 ${to} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(`^\\{\\} maximum lifetime for ${TOKENS} is (not )?exempting administrators now\\.$`),
      (_: string, kind: string, not: string) => `{} 已将${TOKEN_KIND[kind] ?? kind}的最长有效期设为${not ? '不' : ''}豁免管理员。`
    ],
    [
      new RegExp(`^\\{\\} has (permitted|restricted) access via ${TOKENS} to the organization$`),
      (_: string, verb: string, kind: string) => `{} 已${verb === 'permitted' ? '允许' : '限制'}通过${TOKEN_KIND[kind] ?? kind}访问组织`
    ],
    // 双因素要求（开头是参与者的登录名，纯文本）
    [
      /^([\w-]+) (removed|cleared|enabled) secure two-factor requirement for \{\} organization\.$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 组织的安全双因素要求。`
    ],
    [
      /^([\w-]+) (enabled|disabled) two-factor authentication requirement for \{\} organization$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 组织的双因素身份验证要求`
    ],
    // 第三方应用访问限制、集成、机密
    ['Enabled third-party application access restrictions for the {} organization', '为 {} 组织启用了第三方应用访问限制'],
    ['Disabled third-party application access restrictions for the {} organization', '为 {} 组织禁用了第三方应用访问限制'],
    ['Uninstalled the {} integration', '卸载了 {} 集成'],
    ['Installed the {} integration.', '安装了 {} 集成。'],
    ['Removed {} secret {} for {}', '移除了 {} 机密 {} 于 {}'],
    ['Created {} secret {} available to {} repositories for {}', '创建了 {} 机密 {} 可用于 {} 存储库 于 {}'],
    // 域（域名是纯文本）、部署密钥、推送保护的自定义消息、Dependabot 规则
    [/^Removed the ([\w.-]+) domain from the \{\} organization\.$/, '从 {} 组织中移除了域 $1。'],
    [/^Approved the ([\w.-]+) domain for the \{\} organization\.$/, '为 {} 组织批准了域 $1。'],
    [/^Added the ([\w.-]+) domain to the \{\} organization\.$/, '向 {} 组织添加了域 $1。'],
    [/^Verified the ([\w.-]+) domain for the \{\} organization\.$/, '为 {} 组织验证了域 $1。'],
    [
      'Members can now create and use deploy keys to repositories in the {} organization.',
      '成员现在可以为 {} 组织中的存储库创建和使用部署密钥。'
    ],
    [
      'Updated the custom message to display when GitHub detects and blocks a secret {}',
      '为 {} 更新了 GitHub 检测并阻止机密时显示的自定义消息'
    ],
    [
      'Enabled the custom message to display when GitHub detects and blocks a secret {}',
      '为 {} 启用了 GitHub 检测并阻止机密时显示的自定义消息'
    ],
    [
      'Disabled the custom message to display when GitHub detects and blocks a secret {}',
      '为 {} 禁用了 GitHub 检测并阻止机密时显示的自定义消息'
    ],
    [
      /^Force (enabled|disabled) Dependabot rule "([^"]+)" for \{\}$/,
      (_: string, verb: string, rule: string) =>
        `为 {} 强制${verb === 'enabled' ? '启用' : '禁用'}了 Dependabot 规则“${DEPENDABOT_RULE[rule] ?? rule}”`
    ],
    // Web 钩子、操作策略
    ['Installed {} for {} with {} events', '安装了 {} 于 {} 并订阅 {} 事件'],
    ['Uninstalled {} for {}', '卸载了 {} 于 {}'],
    ['Set policy to default workflow token can create or approve PR to true for {}', '为 {} 将默认工作流令牌可创建或批准 PR 策略设为 true'],
    ['Set policy to default workflow token permission to write for {}', '为 {} 将默认工作流令牌权限策略设为写入'],
    [
      'Set policy to require approval for private fork pull request workflows from {} for {}.',
      '将策略设为来自 {} 的专用复刻拉取请求工作流需经批准，适用于 {}。'
    ],
    [
      'Set policy to require approval for fork pull request workflows from {} for {}.',
      '将策略设为来自 {} 的复刻拉取请求工作流需经批准，适用于 {}。'
    ],
    ['Set fork pull request workflows policy to {}', '将复刻拉取请求工作流策略设为 {}'],
    ['Set artifact and log retention duration to {}', '将产物和日志保留期限设为 {}'],
    ['Updated list of allowed actions and workflows for {}', '为 {} 更新了允许的操作和工作流列表'],
    [
      'Updated allowed select actions and workflows to allow actions created by GitHub and allow verified actions for {}',
      '为 {} 将允许的选定操作和工作流更新为允许 GitHub 创建的操作和经过验证的操作'
    ],
    ['Updated allowed actions and workflows to all actions and workflows for {}', '为 {} 将允许的操作和工作流更新为所有操作和工作流'],
    [
      'Updated the repo-level self-hosted runners policy from {} entities to {} entities',
      '将存储库级自托管运行器策略从 {} 实体更新为 {} 实体'
    ],
    // Copilot 代码审查、项目、代码空间、自定义属性
    ['Copilot review effort default changed from {} to {} for the {} organization', 'Copilot 审查强度默认值从 {} 更改为 {} 于 {} 组织'],
    ['Created project {} in {}', '创建了项目 {} 于 {}'],
    ['Closed project {} in {}', '关闭了项目 {} 于 {}'],
    ['Reopened project {} in {}', '重新打开了项目 {} 于 {}'],
    ['Created a view in project {} in {}', '为项目 {} 创建了视图 于 {}'],
    ['Created a field in project {} in {}', '为项目 {} 创建了字段 于 {}'],
    ['Deleted a field in project {} in {}', '删除了项目 {} 的字段 于 {}'],
    [
      'Updated Codespaces access to all members and collaborators on all internal and private repositories in {}',
      '将 {} 中代码空间的访问权限更新为所有内部和专用存储库的所有成员和协作者'
    ],
    [
      'Updated Codespaces access to all members on all internal and private repositories in {}',
      '将 {} 中代码空间的访问权限更新为所有内部和专用存储库的所有成员'
    ],
    [
      'Updated Codespaces access to selected users on all internal and private repositories in {}',
      '将 {} 中代码空间的访问权限更新为所有内部和专用存储库的选定用户'
    ],
    ['Allowed themselves to use Codespaces for the {} organization', '允许自己在 {} 组织中使用代码空间'],
    ['Stopped allowing themselves to use Codespaces for the {} organization', '不再允许自己在 {} 组织中使用代码空间'],
    ['Created custom property {}', '创建了自定义属性 {}'],
    ['Deleted custom property {}', '删除了自定义属性 {}'],
    // 成员权限、版主、组织角色（槽位：成员或团队、角色、组织）
    ['Added themselves as a moderator for the {} organization', '将自己添加为 {} 组织的版主'],
    ['Removed themselves as a moderator for the {} organization', '将自己从 {} 组织的版主中移除'],
    ['Members can now delete issues in the {} organization.', '成员现在可以删除 {} 组织中的议题。'],
    ['Members can no longer delete issues in the {} organization.', '成员不能再删除 {} 组织中的议题。'],
    ['Members cannot create new teams for the {} organization.', '成员不能为 {} 组织创建新团队。'],
    [
      'Repository admins can now install GitHub Apps on their repositories in {}',
      '{} 中的存储库管理员现在可以在其存储库上安装 GitHub 应用'
    ],
    ['App access requests are now allowed for members and outside collaborators in {}', '{} 中的成员和外部协作者现在可以提出应用访问请求'],
    ['Members can no longer publish private GitHub Pages in the {} organization.', '成员不能再发布 {} 组织中的专用 GitHub 页面。'],
    ['Disabled forking of private repositories in the {} organization.', '禁用了 {} 组织中专用存储库的复刻。'],
    [
      '{} the creation of only public and private repositories by members of the {} organization',
      '{} {} 组织的成员仅可创建公共和专用存储库'
    ],
    [
      'Changed the base repository permission setting from {} to {} for the {} organization.',
      '将基本存储库权限设置从 {} 更改为 {}，适用于 {} 组织。'
    ],
    ['assigned {} to the {} organization role in the {} organization', '将 {} 分配到 {} 组织角色 于 {} 组织'],
    ['assigned the {} team to the {} organization role in the {} organization', '将 {} 团队分配到 {} 组织角色 于 {} 组织'],
    ['unassigned {} from the {} organization role in the {} organization', '将 {} 从 {} 组织角色中取消分配 于 {} 组织'],
    ['unassigned the {} team from the {} organization role in the {} organization', '将 {} 团队从 {} 组织角色中取消分配 于 {} 组织'],
    // 分支保护（第一个槽位是分支名称模式）
    ['Enabled branch protection for {} on {}', '为 {} 启用了分支保护 于 {}'],
    ['Disabled branch protection for {} on {}', '为 {} 禁用了分支保护 于 {}'],
    [
      'Exported results are truncated. Size limit reached for the requested time range. Please, try a smaller time range or the {} for complete results.',
      '导出结果已截断。所请求的时间范围已达到大小上限。请缩小时间范围，或使用 {} 获取完整结果。'
    ],
    // 审核日志事件说明（槽位顺序不能调换）
    ['Added themselves to the {} team', '将自己添加到 {} 团队'],
    ['Created the team {}', '创建了团队 {}'],
    ['Renamed organization from {} to {}', '将组织从 {} 重命名为 {}'],
    ['Created the ruleset {} in {}', '创建了规则集 {} 于 {}'],
    ['Budget was {} with a limit of {#} ({}). {}', '{}预算，限额为 {#}（{}）。{}'],
    ['Updated Codespaces ownership to User in {}', '在 {} 中将代码空间所有权更新为用户'],
    ['Created the {} organization', '创建了 {} 组织'],
    ['Added themselves to the {} organization with {} permission', '将自己添加到 {} 组织并获得 {} 权限'],
    ['Created the label {}', '创建了标签 {}'],
    ['Set policy to default workflow token permission to read for {}', '为 {} 将默认工作流令牌权限策略设为读取'],
    [
      'Set policy to default workflow token can create or approve PR to false for {}',
      '为 {} 将默认工作流令牌可创建或批准 PR 策略设为 false'
    ],
    [
      'Members can no longer create and use deploy keys to repositories in the {} organization.',
      '成员不能再为 {} 组织中的存储库创建和使用部署密钥。'
    ]
  ],
  ignore: [
    // 审核日志条目展开后的原始字段表（字段名与取值照原文）
    '.entry-details-table'
  ]
} satisfies PageDictionary
