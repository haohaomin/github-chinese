import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 贡献者图、代码频率图的指标名（数据系列名） */
export const METRIC: Readonly<Record<string, string>> = {
  Commits: '提交',
  Additions: '新增',
  Deletions: '刪除'
}

/** 见解页 ChartCard 的固定标题 */
const CHART_TITLE: Readonly<Record<string, string>> = {
  'Top committers': '主要提交者',
  'Code frequency': '程式碼頻率',
  Commits: '提交'
}

const OVER_TIME_RE = /^(Commits|Additions|Deletions) over time$/
const AUTHOR_METRIC_RE = /^(.+)'s (Commits|Additions|Deletions)$/

/** 图表标题：固定标题、「Commits over time」、「user's Commits」；其余原样保留 */
export function translateChartTitle(title: string): string {
  const known = CHART_TITLE[title]
  if (known) return known
  const overTime = OVER_TIME_RE.exec(title)
  if (overTime) return `${METRIC[overTime[1]!]}趨勢`
  const author = AUTHOR_METRIC_RE.exec(title)
  if (author) return `${author[1]} 的${METRIC[author[2]!]}`
  return title
}

/** Highcharts 无障碍描述：图表类型（按台湾通行的图表名） */
const CHART_TYPE: Readonly<Record<string, string>> = {
  'Combination chart': '組合圖',
  'Line chart': '折線圖',
  'Bar chart': '長條圖',
  'Pie chart': '圓餅圖',
  'Scatter chart': '散佈圖',
  'Bubble chart': '泡泡圖',
  Boxplot: '盒鬚圖',
  Chart: '圖表'
}

/** Highcharts 无障碍描述：计数单位 */
const CHART_UNIT: Readonly<Record<string, string>> = {
  'data series': '個資料數列',
  'data point': '個資料點',
  'data points': '個資料點',
  line: '條線',
  lines: '條線',
  bar: '個長條',
  bars: '個長條',
  slice: '個扇形',
  slices: '個扇形',
  pie: '個圓餅',
  pies: '個圓餅',
  point: '個點',
  points: '個點',
  bubble: '個泡泡',
  bubbles: '個泡泡',
  box: '個盒形',
  boxes: '個盒形'
}

/** Highcharts 无障碍描述：坐标轴名 */
const AXIS_NAME: Readonly<Record<string, string>> = {
  Values: '值',
  Actor: '執行者',
  'Number of bypasses': '繞過次數',
  Time: '時間',
  Contributions: '貢獻',
  Commits: '提交',
  Frequency: '頻率',
  categories: '類別',
  'navigator-x-axis': '導覽器 X 軸',
  'navigator-y-axis': '導覽器 Y 軸'
}

const RANGE_UNIT: Readonly<Record<string, string>> = {
  days: '天',
  hours: '小時',
  minutes: '分鐘',
  seconds: '秒'
}

function axisName(name: string): string {
  return AXIS_NAME[name] ?? name
}

/** 「顯示」后接坐标轴名：用 joinCjk 拼接（英文名前加空格） */
function displaying(names: readonly string[]): string {
  return joinCjk('顯示', names.map(axisName).join('、'))
}

/** 「顯示時間的 X 軸」：坐标轴名是英文时两侧各留一个空格 */
function axisDisplaying(name: string, axis: string): string {
  return `${joinCjk(displaying([name]), '的')} ${axis} 軸`
}

/** 坐标轴取值：数字或 2026-07-26 00:00:00 */
const AXIS_VALUE = '(-?[\\d,.]+|\\d{4}-\\d{2}-\\d{2}(?: \\d{2}:\\d{2}:\\d{2})?)'

/** Highcharts 无障碍描述：图表类型、坐标轴（组织规则集仪表板等其他页面的图表复用） */
export const CHART_A11Y_RULES: readonly RegExpRule[] = [
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
      if (from) range = `資料範圍從 ${from} 到 ${to}。`
      else if (amount) range = `資料範圍：${unit === 'categories' ? `${amount} 個類別` : `${amount} ${RANGE_UNIT[unit]}`}。`
      return `圖表有 1 條${axisDisplaying(name, axis)}。${range}`
    }
  ],
  // 多条坐标轴：The chart has 2 X axes displaying Time, and navigator-x-axis.（原文的逗号只在名称列表里，译作顿号；不另加逗号）
  [
    /^The chart has (\d+) (X|Y) axes displaying ([^.]+)\.$/,
    (_, count, axis, names) => `圖表的 ${count} 條 ${axis} 軸分別${displaying(names.split(/, and |, | and /))}。`
  ]
]

/**
 * ChartCard（见解页各图表的卡片外壳）与 Highcharts 无障碍文字：
 * 图表菜单、自定义设置对话框、屏幕阅读器描述、导航器手柄。
 * SVG 内的图例、坐标轴标题、提示框按 core/ignore.ts 放行后照常翻译（数据系列名等由各页面词典收录）。
 */
export default {
  static: {
    // 卡片菜单
    'Chart options': '圖表選項',
    'Customization settings': '自訂設定',
    'View as table': '以表格查看',
    'Download CSV': '下載 CSV',
    'Download PNG': '下載 PNG',
    DateTime: '日期時間',

    // 自定义设置对话框（column chart / bar chart 按台湾用法分作「直條圖」「橫條圖」）
    'Chart settings': '圖表設定',
    'Column & bar chart settings': '直條圖和橫條圖設定',
    'Line chart settings': '折線圖設定',
    'Adds gradients and outlines to increase contrast in charts.': '為圖表加上漸層和外框以提高對比度。',
    'Show data labels': '顯示資料標籤',
    'Show labels for each data point in column and bar charts.': '在直條圖和橫條圖中顯示每個資料點的標籤。',
    'Show labels for each data point in line chart.': '在折線圖中顯示每個資料點的標籤。',
    'Show labels for each data point in chart.': '在圖表中顯示每個資料點的標籤。',
    'Differentiate by line style': '依線條樣式區分',
    'Use unique line styles (dashed, dotted, etc.) to differentiate lines in charts.':
      '使用不同的線條樣式（虛線、點線等）區分圖表中的線條。',

    // 屏幕阅读器
    'Interactive chart': '互動式圖表',
    'Interactive chart.': '互動式圖表。',
    'End of interactive chart.': '互動式圖表結束。',
    'View as data table, Chart': '以資料表查看，圖表',
    'Toggle series visibility, Chart': '切換數列顯示，圖表',
    'Start of selected range': '所選範圍起點',
    'End of selected range': '所選範圍終點'
  },
  scoped: {
    Category: '類別',
    // 自定义设置对话框：分组标题与开关状态（Increase Contrast 同外观设置的「增加對比」）
    Chart: '圖表',
    On: '開啟',
    Off: '關閉',
    'Increase Contrast': '增加對比',
    // 图表加载 / 渲染失败（render 是显示义，按术语表作「顯示」）
    'Error loading data': '資料載入失敗',
    'Unable to render chart.': '無法顯示圖表。',
    'This chart data can only be accessed as a table.': '此圖表資料只能以表格形式存取。',
    'Malformed input. Failed to render component': '輸入格式錯誤。無法顯示元件',
    'Data cannot contain null values': '資料不能包含空值',
    'Graph could not be drawn due to a network problem.': '因網路問題而無法繪製圖表。',
    Unlabeled: '無標籤',
    'Y value': 'Y 值'
  },
  regexp: [
    // 图表容器标签：Commits over time. Interactive chart.
    [/^(.+)\. Interactive chart\.$/, (_, title) => `${translateChartTitle(title)}。互動式圖表。`],
    // 范围导航器分组标签：Commits over time Axis zoom（原文无标点，译文不加冒号）
    [/^(.+) Axis zoom$/, (_, title) => joinCjk(translateChartTitle(title), '的座標軸縮放')],
    // 图例条目：Show Additions
    [/^Show (Commits|Additions|Deletions)$/, (_, metric) => `顯示${METRIC[metric]}`],
    ...CHART_A11Y_RULES
  ]
} satisfies PageDictionary
