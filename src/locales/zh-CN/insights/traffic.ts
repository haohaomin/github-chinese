import type { PageDictionary } from '../../../core/types'

/** 流量图表标题：Clones in last 14 days */
const TRAFFIC_METRIC: Readonly<Record<string, string>> = {
  Clones: '克隆数',
  'Unique cloners': '独立克隆者',
  'Total views': '总浏览量',
  'Unique visitors': '独立访问者'
}

/** 流量计数单位：12 Clones */
const TRAFFIC_UNIT: Readonly<Record<string, string>> = {
  clone: '次克隆',
  'unique cloner': '个独立克隆者',
  view: '次浏览',
  'unique visitor': '个独立访问者'
}

/**
 * 流量（/graphs/traffic，需推送权限）与 Actions 使用 / 性能指标标题。
 * 指标页属于 actions 页面类型（组织级属于 organization），只有 static 生效；
 * 指标页的列名、筛选等由 actions 词典收录，这里只保留标题与组织洞察侧栏。
 */
export default {
  static: {
    Traffic: '流量',
    'Git clones': 'Git 克隆',
    Clones: '克隆',
    'Unique cloners': '独立克隆者',
    Visitors: '访问者',
    'Unique visitors': '独立访问者',
    'Referring sites': '推荐站点',
    'Popular content': '热门内容',
    'Unique Visits': '独立访问',
    "We don't have enough data to show anything useful.": '数据不足以显示有效信息。',
    'We don’t have enough data to show anything useful.': '数据不足以显示有效信息。',
    'It usually takes about a week to populate this graph.': '通常需要约一周时间才能生成此图表。',
    'It usually takes about a week to populate this table.': '通常需要约一周时间才能生成此表格。',
    'It looks like traffic to your repository is a little light. Go spread the word and check back later!':
      '此存储库的流量较少。宣传一下并稍后再来查看！',
    "Referring sites and popular content are temporarily unavailable or may not display accurately. We're actively working to resolve the issue.":
      '推荐站点和热门内容暂时不可用或可能显示不准确。我们正在积极解决此问题。',
    'Referring sites and popular content are temporarily unavailable or may not display accurately. We’re actively working to resolve the issue.':
      '推荐站点和热门内容暂时不可用或可能显示不准确。我们正在积极解决此问题。',

    // Actions 使用 / 性能指标（存储库 /actions/metrics/*、组织 /insights/actions/*）
    'Actions usage metrics': '操作使用情况指标',
    'Actions performance metrics': '操作性能指标',
    'Actions Usage Metrics': '操作使用情况指标',
    'Actions Performance Metrics': '操作性能指标',

    // 组织洞察侧栏
    'Insights navigation': '洞察导航',
    'Copilot impact': 'Copilot 影响',
    'Code generation': '代码生成'
  },
  scoped: {
    Views: '浏览量',
    Site: '站点',
    Content: '内容',
    Domains: '域',
    Visits: '访问',
    Path: '路径',
    Cloners: '克隆者',
    'Total views': '总浏览量',
    Total: '总计',
    Unique: '独立',
    // 图表提示里的计数单位：<strong>12</strong> clones
    clones: '次克隆',
    clone: '次克隆',
    'unique cloners': '个独立克隆者',
    'unique cloner': '个独立克隆者',
    views: '次浏览',
    view: '次浏览',
    'unique visitors': '个独立访问者',
    'unique visitor': '个独立访问者'
  },
  regexp: [
    // 图表标题：Clones in last 14 days
    [
      /^(Clones|Unique cloners|Total views|Unique visitors) in last (\d+) days$/,
      (_, metric: string, days: string) => `过去 ${days} 天的${TRAFFIC_METRIC[metric]}`
    ],
    // 计数：12 Clones / 1 Unique visitor
    [
      /^([\d,]+) (Clones?|Unique cloners?|Views?|Unique visitors?)$/,
      (_, count: string, unit: string) => `${count} ${TRAFFIC_UNIT[unit.toLowerCase().replace(/s$/, '')]}`
    ]
  ]
} satisfies PageDictionary
