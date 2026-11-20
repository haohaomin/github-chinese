import type { PageDictionary } from '../../../core/types'

/** Web 钩子事件：名称与说明（组织与存储库 Web 钩子表单共用） */
const EVENTS: Readonly<Record<string, string>> = {
  'Branch protection rules': '分支保护规则',
  'Check runs': '检查运行',
  'Commit comments': '提交评论',
  'Custom property': '自定义属性',
  Memberships: '成员身份',
  Meta: 'Web 钩子本身',
  'this discussion': '此讨论',
  Pushes: '推送',
  Statuses: '状态',
  Watches: '关注',
  'Personal access token requests': '个人访问令牌请求',
  'Personal access token request created, approved, denied, or cancelled.': '个人访问令牌请求被创建、批准、拒绝或取消。',
  Sponsorships: '赞助',
  Deployments: '部署',
  Milestones: '里程碑',
  Releases: '发行版'
}

/**
 * 组织 Web 钩子：列表、添加 / 编辑表单、事件选择、最近交付。
 * 表单与存储库 Web 钩子相同；存储库设置已收录为 static 的表单文字与事件名不再重复，
 * 这里只放存储库设置未收录为 static 的短词与事件，全部放 scoped。
 */
export default {
  scoped: {
    // Web 钩子网址校验：<网址> is missing a scheme
    'is missing a scheme': '缺少协议',
    // 事件：项目 v2 状态更新（「Feedback is welcome in <a> this discussion</a>.」见 inline）
    'Projects v2 status updates': '项目 v2 状态更新',
    'Projects v2 feedback discussion': '项目 v2 反馈讨论',
    'Projects v2 status update feedback discussion': '项目 v2 状态更新反馈讨论',
    'Webhooks /': 'Web 钩子 /',
    '/ Add webhook': '/ 添加 Web 钩子',
    // 列表项 URL 后：「(all events)」
    '(all events)': '（所有事件）',
    'all events': '所有事件',
    etc: '等',
    '). More information can be found in': '）。更多信息请参阅',
    'Content type': '内容类型',
    Secret: '机密',
    '(not recommended)': '（不推荐）',
    'not recommended': '不推荐',
    'Disable (not recommended)': '禁用（不推荐）',
    // 「Just the」+「push」+「event.」；「Send me」+「everything」+「.」；整句在同一文本节点时另收
    'Just the': '仅',
    'event.': '事件。',
    'Just the push event.': '仅 push 事件。',
    'Send me': '发送',
    everything: '所有事件',
    'Send me everything.': '发送所有事件。',
    'Okay, that hook was successfully created.': '已成功创建该 Web 钩子。',
    'Okay, this hook was successfully updated.': '已成功更新该 Web 钩子。',
    'Recent deliveries': '最近交付',
    redelivery: '重新传递',
    Request: '请求',
    Response: '响应',
    // 请求详情的区块名 Headers / Payload / Body 照原文（用户定）
    // 请求详情标签页的读屏名称（原文拼写如此，兼收正确拼写）
    'Hook request and reponse': 'Web 钩子请求和响应',
    'Hook request and response': 'Web 钩子请求和响应',
    // 重新传递失败提示
    'Oops, there was an error while trying to redeliver this payload.': '重新传递此有效负载时出错。',
    Redeliver: '重新传递',
    ...EVENTS
  },
  regexp: [
    [/^(\S+) is missing a scheme$/, '$1 缺少协议'],
    // 交付耗时（句号随原文，与存储库 Web 钩子一致）
    [/^Completed in (\d+(?:\.\d+)?) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗时 ${seconds} 秒${dot ? '。' : ''}`],
    [/^(\d+) webhooks?$/, '$1 个 Web 钩子']
  ],
  inline: [['Feedback is welcome in {}.', '欢迎反馈至{}。']]
} satisfies PageDictionary
