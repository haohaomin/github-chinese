import type { PageDictionary } from '../../../core/types'

const ENTITY: Readonly<Record<string, string>> = {
  alert: '警报',
  alerts: '警报',
  finding: '发现',
  findings: '发现'
}

const REASON: Readonly<Record<string, string>> = {
  'not valid': '无效',
  'not in production code': '不在生产代码中',
  'not relevant': '不相关',
  'mitigated by a compensating control': '已由补偿性控制缓解'
}

/** 消除原因（小写形式出现在「requested to dismiss this as …」里） */
const RESOLUTION: Readonly<Record<string, string>> = {
  'false positive': '误报',
  'used in tests': '用于测试',
  "won't fix": '不予修复',
  'won’t fix': '不予修复',
  mitigated: '已缓解',
  'a fix has already been started': '已开始修复',
  'no bandwidth to fix this': '无暇修复',
  'risk is tolerable to this project': '风险可容忍',
  'this alert is inaccurate or incorrect': '警报不准确',
  'vulnerable code is not actually used': '未使用存在漏洞的代码',
  'tolerable risk': '风险可容忍',
  inaccurate: '不准确',
  'not used': '未使用',
  'fix started': '已开始修复',
  'no bandwidth': '无暇修复'
}

const SEVERITY_LABEL: Readonly<Record<string, string>> = {
  critical: '严重',
  high: '高',
  medium: '中',
  moderate: '中',
  low: '低',
  error: '错误',
  warning: '警告',
  note: '注意',
  unknown: '未知'
}

/** 警报状态（状态标签的 title） */
const ALERT_STATE: Readonly<Record<string, string>> = {
  Open: '未解决',
  Fixed: '已修复',
  Closed: '已关闭',
  Dismissed: '已消除',
  'Auto-dismissed': '已自动消除'
}

function resolution(text: string): string {
  return RESOLUTION[text.toLowerCase()] ?? text
}

/**
 * Dependabot、代码扫描、机密扫描共用的警报界面：
 * 警报页头部、消除 / 重新打开、消除原因、受理人、跟踪议题、元数据侧栏。
 */
export default {
  static: {
    // 消除对话框
    'Dismiss alerts': '消除警报',
    'Select a reason to dismiss this alert.': '选择消除此警报的原因。',
    'Request to dismiss alert': '请求消除警报',
    'This alert needs approval before it can be dismissed. Requests are sent to all approvers.':
      '此警报需经批准才能消除。请求将发送给所有审批者。',
    'Submit request': '提交请求',
    'Request comment (required)': '请求说明（必填）',
    'Dismissal reason': '消除原因',
    'Dismissal comment': '消除说明',
    'Add a comment about this dismissal': '添加关于此次消除的说明',
    'Comment cannot be empty': '说明不能为空',
    'Dismissal reason is required': '必须选择消除原因',
    'Submitting your request': '正在提交请求',
    'False positive': '误报',
    'Used in tests': '用于测试',
    "Won't fix": '不予修复',
    'Won’t fix': '不予修复',
    Mitigated: '已缓解',

    // 重新打开、消除请求
    'Reopen alert': '重新打开警报',
    'Reopen alerts': '重新打开警报',
    'Reopening alert': '正在重新打开警报',
    'Request pending': '请求待处理',
    'Dismissal request pending': '消除请求待处理',
    'Cancel dismissal request': '取消消除请求',
    'Cancelling dismissal request': '正在取消消除请求',
    'There was an issue cancelling the dismissal request. Please try again.': '取消消除请求时出错。请重试。',
    'There was an issue reopening the alert. Please try again.': '重新打开警报时出错。请重试。',
    'Approve dismissal': '批准消除',
    'Deny dismissal': '拒绝消除',
    'Dismissal request': '消除请求',
    'Dismissal requests': '消除请求',

    // 元数据侧栏
    'Alert metadata': '警报元数据',
    'View all fields': '查看所有字段',
    'There was an error rendering this section.': '渲染此部分时出错。',
    Weakness: '弱点',
    Weaknesses: '弱点',
    'No CWEs': '无 CWE',
    'Loading CWE…': '正在加载 CWE…',
    'Learn more on MITRE.': '在 MITRE 上了解更多。',
    'Runtime risks': '运行时风险',
    'Active deployment records impacted by this vulnerability have been detected and tagged with runtime risks.':
      '已检测到受此漏洞影响的活跃部署记录并已标记运行时风险。',
    'Learn more about runtime risks': '了解运行时风险',
    'Security campaign': '安全活动',
    'No campaign is currently tracking this alert.': '当前没有活动在跟踪此警报。',

    // 受理人
    'Successfully assigned to Copilot to generate a fix. Copilot will open a pull request.':
      '已分配给 Copilot 生成修复。Copilot 将创建拉取请求。',
    'Successfully assigned to Copilot to apply the autofix for this alert. Copilot will open a PR.':
      '已分配给 Copilot 为此警报应用自动修复。Copilot 将创建 PR。',
    'Failed to assign Copilot': '分配 Copilot 失败',
    'Failed to assign to Copilot': '分配给 Copilot 失败',
    'Failed to assign to Copilot. Please try again.': '分配给 Copilot 失败。请重试。',
    'Assign agent to alert': '为警报分配智能体',
    'The agent will analyze this vulnerability and open a draft pull request with a proposed fix, including updating the dependency and resolving any breaking changes introduced by the update.':
      '智能体将分析此漏洞并创建包含修复方案的草稿拉取请求，包括更新依赖项并解决更新引入的破坏性变更。',
    'Assignee limit reached': '已达受理人上限',
    'Ensure a fix has been generated.': '请确认已生成修复。',
    'Unable to complete the search for assignees. Try again later.': '无法完成受理人搜索。请稍后重试。',
    'Assignee search results': '受理人搜索结果',
    'Unable to save your selection due to server error. Try again later.': '因服务器出错无法保存所选内容。请稍后重试。',
    'Unable to save your selection due to server error. Try a moment later.': '因服务器出错无法保存所选内容。请稍后重试。',
    'Learn more about alert assignees': '了解警报受理人',

    // 跟踪议题
    'Link an issue to this alert.': '将议题链接到此警报。',
    'Add existing GitHub issue': '添加现有 GitHub 议题',
    'Change or remove issue': '更改或删除议题',
    Tracking: '跟踪'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    'Security campaigns': '安全活动',
    'Dismiss alert': '消除警报',
    Dismiss: '消除',
    'Filter assignees': '筛选受理人',
    // 受理人：No one - <Assign yourself>
    Assignees: '受理人',
    'No one -': '无人 -',
    'Assign yourself': '分配给自己',
    'No one assigned': '无受理人',
    'Search error': '搜索出错',
    'Save error': '保存出错',
    'Sorry, something went wrong. Please try again.': '抱歉，出错了。请重试。',
    Tags: '标签',
    Development: '开发',
    // 警报列表与详情的状态（Closed 由 common 译作「已关闭」）
    Open: '未解决'
  },
  regexp: [
    [/^Max ([\d,]+) characters$/, '最多 $1 个字符'],
    // 状态标签的 title：Status: Fixed、Status: Dismissed as false positive
    [/^Status: (Open|Fixed|Closed|Dismissed|Auto-dismissed)$/, (_, state: string) => `状态：${ALERT_STATE[state]!}`],
    [/^Status: (Closed|Dismissed) as (.+)$/, (_, state: string, reason: string) => `状态：${ALERT_STATE[state]!}（${resolution(reason)}）`],
    // 消除对话框（单复数、警报 / 发现）
    [/^Dismiss (alerts?|findings?)$/, (_, entity) => `消除${ENTITY[entity]}`],
    [
      /^Select a reason to dismiss (this|these) (alerts?|findings?)\.$/,
      (_, which, entity) => `选择消除${which === 'this' ? '此' : '这些'}${ENTITY[entity]}的原因。`
    ],
    [/^Request to dismiss (alerts?|findings?)$/, (_, entity) => `请求消除${ENTITY[entity]}`],
    [
      /^(?:This (alert|finding) needs|These (alerts|findings) need) approval before (?:it|they) can be dismissed\. Requests are sent to all approvers\.$/,
      (_, one, many) => `${one ? '此' : '这些'}${ENTITY[one || many]}需经批准才能消除。请求将发送给所有审批者。`
    ],
    [
      /^(This|These) (alerts?|findings?) (?:is|are) (not valid|not in production code|not relevant|mitigated by a compensating control)$/,
      (_, which, entity, reason) => `${which === 'This' ? '此' : '这些'}${ENTITY[entity]}${REASON[reason]}`
    ],
    // 受理人
    [/^Assign up to (\d+) people to this alert$/, '最多可为此警报分配 $1 人'],
    [/^You have reached the limit of (\d+) assignees$/, '已达到 $1 个受理人的上限'],
    // 跟踪议题、严重性筛选、CWE（GitHub 原文带引号和句号，译文随原文）
    [/^Tracked in issue #(\d+)$/, '在议题 #$1 中跟踪'],
    [
      /^Filter alerts by ('?)(critical|high|medium|moderate|low|error|warning|note|unknown)'? severity(\.?)$/,
      (_, quote, level, period) => {
        const label = SEVERITY_LABEL[level]
        return `筛选严重性为${quote ? `“${label}”` : label}的警报${period ? '。' : ''}`
      }
    ],
    [/^Error fetching details for CWE-(\d+)\.$/, '获取 CWE-$1 详细信息时出错。'],
    // 警报页头部的消除请求说明（React 拆分后拼接）
    [/^Dismissal requested as (.+)$/, (_, reason) => `已请求以${resolution(reason)}为由消除`],
    [/^requested to dismiss this as (.+)$/, (_, reason) => `请求以${resolution(reason)}为由消除此警报`]
  ]
} satisfies PageDictionary
