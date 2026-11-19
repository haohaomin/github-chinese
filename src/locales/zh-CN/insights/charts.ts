import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 贡献者图、代码频率图的指标名（数据系列名） */
export const METRIC: Readonly<Record<string, string>> = {
  Commits: '提交',
  Additions: '新增',
  Deletions: '删除'
}

/** 洞察页 ChartCard 的固定标题 */
const CHART_TITLE: Readonly<Record<string, string>> = {
  'Top committers': '主要提交者',
  'Code frequency': '代码频率',
  Commits: '提交'
}

const OVER_TIME_RE = /^(Commits|Additions|Deletions) over time$/
const AUTHOR_METRIC_RE = /^(.+)'s (Commits|Additions|Deletions)$/

/** 图表标题：固定标题、「Commits over time」、「user's Commits」；其余原样保留 */
export function translateChartTitle(title: string): string {
  const known = CHART_TITLE[title]
  if (known) return known
  const overTime = OVER_TIME_RE.exec(title)
  if (overTime) return `${METRIC[overTime[1]!]}趋势`
  const author = AUTHOR_METRIC_RE.exec(title)
  if (author) return `${author[1]} 的${METRIC[author[2]!]}`
  return title
}

/** Highcharts 无障碍描述：图表类型 */
const CHART_TYPE: Readonly<Record<string, string>> = {
  'Combination chart': '组合图',
  'Line chart': '折线图',
  'Bar chart': '柱状图',
  'Pie chart': '饼图',
  'Scatter chart': '散点图',
  'Bubble chart': '气泡图',
  Boxplot: '箱线图',
  Chart: '图表'
}

/** Highcharts 无障碍描述：计数单位 */
const CHART_UNIT: Readonly<Record<string, string>> = {
  'data series': '个数据系列',
  'data point': '个数据点',
  'data points': '个数据点',
  line: '条线',
  lines: '条线',
  bar: '个柱',
  bars: '个柱',
  slice: '个扇区',
  slices: '个扇区',
  pie: '个饼图',
  pies: '个饼图',
  point: '个点',
  points: '个点',
  bubble: '个气泡',
  bubbles: '个气泡',
  box: '个箱体',
  boxes: '个箱体'
}

/** Highcharts 无障碍描述：坐标轴名 */
const AXIS_NAME: Readonly<Record<string, string>> = {
  Time: '时间',
  Contributions: '贡献',
  Commits: '提交',
  Frequency: '频率',
  categories: '类别',
  'navigator-x-axis': '导航 X 轴',
  'navigator-y-axis': '导航 Y 轴'
}

const RANGE_UNIT: Readonly<Record<string, string>> = {
  days: '天',
  hours: '小时',
  minutes: '分钟',
  seconds: '秒'
}

function axisName(name: string): string {
  return AXIS_NAME[name] ?? name
}

/** 「显示」后接坐标轴名：用 joinCjk 拼接（英文名前加空格） */
function displaying(names: readonly string[]): string {
  return joinCjk('显示', names.map(axisName).join('、'))
}

/** 「显示时间的 X 轴」：坐标轴名是英文时两侧各留一个空格 */
function axisDisplaying(name: string, axis: string): string {
  return `${joinCjk(displaying([name]), '的')} ${axis} 轴`
}

/** 坐标轴取值：数字或 2026-07-26 00:00:00 */
const AXIS_VALUE = '(-?[\\d,.]+|\\d{4}-\\d{2}-\\d{2}(?: \\d{2}:\\d{2}:\\d{2})?)'

/**
 * ChartCard（洞察页各图表的卡片外壳）与 Highcharts 无障碍文字：
 * 图表菜单、自定义设置对话框、屏幕阅读器描述、导航器手柄。
 * SVG 内的坐标轴标签、提示框不在翻译范围内。
 */
export default {
  static: {
    // 卡片菜单
    'Chart options': '图表选项',
    'Customization settings': '自定义设置',
    'View as table': '以表格查看',
    'Download CSV': '下载 CSV',
    'Download PNG': '下载 PNG',
    DateTime: '日期时间',

    // 自定义设置对话框
    'Chart settings': '图表设置',
    'Column & bar chart settings': '柱状图与条形图设置',
    'Line chart settings': '折线图设置',
    'Adds gradients and outlines to increase contrast in charts.': '为图表添加渐变和轮廓以提高对比度。',
    'Show data labels': '显示数据标签',
    'Show labels for each data point in column and bar charts.': '在柱状图和条形图中显示每个数据点的标签。',
    'Show labels for each data point in line chart.': '在折线图中显示每个数据点的标签。',
    'Show labels for each data point in chart.': '在图表中显示每个数据点的标签。',
    'Differentiate by line style': '按线型区分',
    'Use unique line styles (dashed, dotted, etc.) to differentiate lines in charts.': '使用不同线型（虚线、点线等）区分图表中的线条。',

    // 屏幕阅读器
    'Interactive chart': '交互式图表',
    'Interactive chart.': '交互式图表。',
    'End of interactive chart.': '交互式图表结束。',
    'View as data table, Chart': '以数据表查看，图表',
    'Toggle series visibility, Chart': '切换数据系列显示，图表',
    'Start of selected range': '所选范围起点',
    'End of selected range': '所选范围终点'
  },
  scoped: {
    Category: '类别',
    // 自定义设置对话框：分组标题与开关状态
    Chart: '图表',
    On: '开',
    Off: '关',
    'Increase Contrast': '提高对比度',
    // 图表加载 / 渲染失败
    'Error loading data': '数据加载失败',
    'Unable to render chart.': '无法渲染图表。',
    'This chart data can only be accessed as a table.': '此图表数据只能以表格形式查看。',
    'Malformed input. Failed to render component': '输入格式有误。无法渲染组件',
    'Data cannot contain null values': '数据不能包含空值',
    'Graph could not be drawn due to a network problem.': '因网络问题无法绘制图表。',
    Unlabeled: '无标签',
    'Y value': 'Y 值'
  },
  regexp: [
    // 图表容器标签：Commits over time. Interactive chart.
    [/^(.+)\. Interactive chart\.$/, (_, title) => `${translateChartTitle(title)}。交互式图表。`],
    // 范围导航器分组标签：Commits over time Axis zoom（原文无标点，译文不加冒号）
    [/^(.+) Axis zoom$/, (_, title) => joinCjk(translateChartTitle(title), '的坐标轴缩放')],
    // 图例条目：Show Additions
    [/^Show (Commits|Additions|Deletions)$/, (_, metric) => `显示${METRIC[metric]}`],
    // 图表类型：Bar chart with 14 bars.（原文只有句号，译文不加逗号，改语序）
    [
      /^(Combination chart|Line chart|Bar chart|Pie chart|Scatter chart|Bubble chart|Boxplot|Chart) with ([\d,]+) (data series|data points?|lines?|bars?|slices?|pies?|points?|bubbles?|box(?:es)?)\.$/,
      (_, type, count, unit) => `包含 ${count} ${CHART_UNIT[unit]}的${CHART_TYPE[type]}。`
    ],
    // 坐标轴：The chart has 1 X axis displaying Time. Data ranges from A to B.（原文无逗号、冒号，译文不加；Data range: 的冒号随原文）
    [
      new RegExp(
        `^The chart has 1 (X|Y) axis displaying ([^.]+)\\.(?: Data ranges from ${AXIS_VALUE} to ${AXIS_VALUE}\\.| Data range: ([\\d,.]+) (categories|days|hours|minutes|seconds)\\.)?$`
      ),
      (_, axis, name, from, to, amount, unit) => {
        let range = ''
        if (from) range = `数据范围从 ${from} 到 ${to}。`
        else if (amount) range = `数据范围：${unit === 'categories' ? `${amount} 个类别` : `${amount} ${RANGE_UNIT[unit]}`}。`
        return `图表有 1 条${axisDisplaying(name, axis)}。${range}`
      }
    ],
    // 多条坐标轴：The chart has 2 X axes displaying Time, and navigator-x-axis.（原文的逗号只在名称列表里，译作顿号；不另加逗号）
    [
      /^The chart has (\d+) (X|Y) axes displaying ([^.]+)\.$/,
      (_, count, axis, names) => `图表的 ${count} 条 ${axis} 轴分别${displaying(names.split(/, and |, | and /))}。`
    ]
  ]
} satisfies PageDictionary
