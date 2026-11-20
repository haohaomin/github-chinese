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

/**
 * 存档与日志：预定提醒（组织）、赞助日志、审核日志、源 IP 显示、已删除的存储库。
 * 个人设置已收录的审核日志、赞助日志、已删除存储库的通用文字不再重复；这里只补组织独有的部分和本页正则。
 * 事件说明与个人安全日志共用，见 audit-events.ts。
 * 审核日志搜索建议等短语在个人设置是 scoped，本页面类型另收一份，译法一致。
 */
export default {
  static: {
    // 审核日志设置：源 IP 显示开关的保存提示
    'Audit log source IP disclosure enabled.': '已启用审核日志源 IP 显示。',
    'Audit log source IP disclosure disabled.': '已禁用审核日志源 IP 显示。',
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
    [
      'Exported results are truncated. Size limit reached for the requested time range. Please, try a smaller time range or the {} for complete results.',
      '导出结果已截断。所请求的时间范围已达到大小上限。请缩小时间范围，或使用 {} 获取完整结果。'
    ],
    // 预算事件（动作「updated」见 scoped）
    ['Budget was {} with a limit of {#} ({}). {}', '{}预算，限额为 {#}（{}）。{}']
  ],
  ignore: [
    // 审核日志条目展开后的原始字段表（字段名与取值照原文）
    '.entry-details-table'
  ]
} satisfies PageDictionary
