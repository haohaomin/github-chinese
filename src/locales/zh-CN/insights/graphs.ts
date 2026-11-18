import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, formatDate, joinCjk, translateTime } from '../helpers'
import { METRIC } from './charts'

const REPO = '([\\w.-]+\\/[\\w.-]+)'

/**
 * 贡献者图说明（Weekly from … to …）里的日期：toLocaleDateString 按浏览器语言输出，
 * 英文（Jul 25, 2026 / 25 Jul 2026）或中文本地格式（原生无空格，也接受带空格的写法）
 */
const WEEK_DATE = `(${DATE_SOURCE}|\\d{4} ?年 ?\\d{1,2} ?月 ?\\d{1,2} ?日)`
const CJK_DATE_RE = /^(\d{4}) ?年 ?(\d{1,2}) ?月 ?(\d{1,2}) ?日$/

/** 说明里的日期统一按 helpers 的日期格式输出 */
function weekDate(text: string): string {
  const cjk = CJK_DATE_RE.exec(text)
  return cjk ? formatDate(Number(cjk[1]), Number(cjk[2]), Number(cjk[3])) : translateTime(text)
}

/** 贡献者图周期选项 */
function translatePeriod(name: string): string {
  if (name === 'All') return '全部'
  if (name === 'Last month') return '最近 1 个月'
  if (name === 'Custom range') return '自定义范围'
  const months = /^Last (\d+) months$/.exec(name)
  return months ? `最近 ${months[1]} 个月` : name
}

/**
 * 见解侧栏、页面标题，以及贡献者（graphs/contributors）、
 * 提交活动（graphs/commit-activity）、代码频率（graphs/code-frequency）三个 React 图表页。
 */
export default {
  static: {
    // 侧栏
    Contributors: '贡献者',
    'Code frequency': '代码频率',

    // 贡献者
    Period: '周期',
    'Contributions:': '贡献：',
    "'s Commits": '的提交',
    "'s Additions": '的新增',
    "'s Deletions": '的删除',
    // 原文无标点（撇号不算），译文不加逗号
    "We don't have enough data to generate this graph": '数据不足以生成此图表',
    'We don’t have enough data to generate this graph': '数据不足以生成此图表',
    'We need at least one non-empty commit with an email to generate this graph': '至少需要一个带电子邮件的非空提交才能生成此图表',
    'There was an error generating this graph': '生成此图表时出错',
    'Graph could not be rendered': '无法渲染图表',
    'Crunching the latest data, just for you. Hang tight…': '正在计算最新数据，请稍候…',
    'Loading contributions…': '正在加载贡献…',
    'Loading contributions...': '正在加载贡献...',
    'Filter contributions': '筛选贡献',
    'Crunching the latest data, just for you. Hang tight...': '正在计算最新数据，请稍候...',

    // 提交活动
    // Commits over the last year of <strong>owner/repo</strong>
    'Commits over the last year of': '以下存储库过去一年的提交',
    'Number of commits per week': '每周提交数',
    'Sorry, No Data Found': '未找到数据',
    'This repository has no recorded commit activity.': '此存储库没有提交活动记录。',
    'Graph data path is not available': '图表数据路径不可用',

    // 代码频率
    // Code frequency over the history of <strong>owner/repo</strong>
    'Code frequency over the history of': '以下存储库全部历史记录的代码频率',
    'Additions and deletions per week': '每周新增与删除',
    'There are too many commits to generate this graph.': '提交过多而无法生成此图表。',
    // More information about this data can be found in the <activity documentation>.
    'More information about this data can be found in the': '有关此数据的更多信息请参阅',
    'activity documentation': '活动文档'
  },
  scoped: {
    'Last month': '最近 1 个月',
    'Custom range': '自定义范围',
    Additions: '新增',
    Deletions: '删除',
    // 拼接失败时的单节点兜底：Contributions per week to <main>, excluding merge commits
    'Contributions per week to': '每周贡献到',
    ', excluding merge commits': '，不含合并提交',
    'over time': '趋势'
  },
  regexp: [
    // 无障碍标题与页面标题
    [new RegExp(`^Insights: ${REPO}$`), '见解：$1'],
    [new RegExp(`^Contributors to ${REPO}$`), '$1 的贡献者'],

    // 贡献者页说明（分支名在独立文本节点，拼接后匹配）；原文只有一个逗号，译文不多加
    [/^Contributions per week to (\S+), excluding merge commits$/, '每周对 $1 的贡献，不含合并提交'],
    [
      /^Contributions per week to (\S+), line counts have been omitted because commit count exceeds ([\d,]+)\.$/,
      '每周对 $1 的贡献，因提交数超过 $2 而省略了行数统计。'
    ],
    // 拼接失败时的单节点兜底（同 scoped 的「, excluding merge commits」）
    [/^, line counts have been omitted because commit count exceeds ([\d,]+)\.$/, '，因提交数超过 $1 而省略了行数统计。'],
    // 周期按钮：<span>Period</span>: Last 3 months
    [/^: (All|Last month|Last \d+ months|Custom range)$/, (_, name) => `：${translatePeriod(name)}`],
    [/^Last (\d+) months$/, '最近 $1 个月'],
    // 汇总图标题与说明
    [/^(Commits|Additions|Deletions) over time$/, (_, metric) => `${METRIC[metric]}趋势`],
    // 单个贡献者图表的数据表对话框标题：octocat's Commits
    [/^([\w.-]+(?:\[bot\])?)'s (Commits|Additions|Deletions)$/, (_, login, metric) => `${login} 的${METRIC[metric]}`],
    // 周统计说明：Weekly from Jul 25, 2026 to Oct 25, 2026（原文无冒号，译文不加）；前缀与日期用 joinCjk 拼接
    [
      new RegExp(`^Weekly from ${WEEK_DATE} to ${WEEK_DATE}$`),
      (_, from, to) => `${joinCjk('每周统计', weekDate(from))}${joinCjk('至', weekDate(to))}`
    ],
    // 提交数：Pulse 摘要、贡献者卡片
    [/^([\d,]+) commits?$/, '$1 个提交']
  ],
  // 贡献者卡片标题里的用户名链接
  ignore: ['[class*="chartListItem"] h2 a']
} satisfies PageDictionary
