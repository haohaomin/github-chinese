import type { PageDictionary } from '../../../core/types'
import { pangu, translateFieldName } from './fields'
import { joinCjk } from '../helpers'

/**
 * 项目（新版 Projects）：洞察（图表）。
 * 默认图表、图表侧栏与菜单、配置面板（布局、X / Y 轴、分组）、时间段、升级提示、
 * 图表卡片（自定义设置、导出）、错误与空状态。
 */

const OPERATIONS: Readonly<Record<string, string>> = {
  Count: '计数',
  Sum: '总和',
  Average: '平均值',
  Minimum: '最小值',
  Maximum: '最大值'
}

/**
 * Y 轴聚合标签：Sum of Estimate → 估算总和；Count of items → 项计数。
 * 无分组图表的系列名（图例、提示框、以表格查看的列头）是 Count of Items，同译“项计数”
 */
function aggregateLabel(operation: string, field: string): string {
  const subject = /^items$/i.test(field) ? '项' : field === 'a field' ? '字段' : translateFieldName(field)
  return pangu(`${subject}${OPERATIONS[operation] ?? operation}`)
}

const PERIODS: Readonly<Record<string, string>> = {
  '2 weeks': '2 周',
  '1 month': '1 个月',
  '3 months': '3 个月',
  Max: '全部'
}

/** 默认图表名称（可被用户改名） */
const CHART_TITLES: Readonly<Record<string, string>> = {
  'Burn up': '燃起图',
  'Status chart': '状态图表'
}

function chartTitle(title: string): string {
  return CHART_TITLES[title] ?? title
}

/** Highcharts 无障碍描述：图表类型（与存储库洞察页一致） */
const CHART_TYPES: Readonly<Record<string, string>> = {
  'Combination chart': '组合图',
  'Line chart': '折线图',
  'Bar chart': '柱状图',
  'Pie chart': '饼图',
  Chart: '图表'
}

/** Highcharts 无障碍描述：计数单位 */
const CHART_UNITS: Readonly<Record<string, string>> = {
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
  pies: '个饼图'
}

const RANGE_UNITS: Readonly<Record<string, string>> = {
  days: '天',
  hours: '小时',
  minutes: '分钟',
  seconds: '秒'
}

/**
 * 坐标轴默认名：历史图表的 Date / items；计数图 Y 轴的 Count；
 * X 轴不带标题，读屏描述用 Highcharts 的默认名 categories
 */
const AXIS_NAMES: Readonly<Record<string, string>> = {
  Date: '日期',
  items: '项',
  Count: '计数',
  categories: '类别'
}

/** 坐标轴名：默认名、聚合标签（Count of items）、字段名 */
function axisName(name: string): string {
  if (Object.hasOwn(AXIS_NAMES, name)) return AXIS_NAMES[name] ?? name
  const aggregate = /^(Count|Sum|Average|Minimum|Maximum) of (.+)$/.exec(name)
  return aggregate ? aggregateLabel(aggregate[1] ?? '', aggregate[2] ?? '') : translateFieldName(name)
}

/** “显示”后接坐标轴名：英文名前加空格 */
function displaying(name: string): string {
  const text = axisName(name)
  return /^[A-Za-z0-9]/.test(text) ? `显示 ${text}` : `显示${text}`
}

/** 坐标轴取值：数字或 2026-07-26 00:00:00 */
const AXIS_VALUE = '(-?[\\d,.]+|\\d{4}-\\d{2}-\\d{2}(?: \\d{2}:\\d{2}:\\d{2})?)'

export default {
  static: {
    // 默认图表
    'Add a name for this chart': '为此图表命名',
    'Burn up': '燃起图',
    'The Burn up chart shows the progress of your project items over time, showing how much work has been completed and how much is left to do. Use this chart to view progress, spot trends, and identify bottlenecks to help move the project forward.':
      '燃起图展示项目项随时间的进度，包括已完成和剩余的工作量。可用于查看进度、发现趋势和识别瓶颈以推进项目。',
    'Status chart': '状态图表',
    'This chart shows the current status for the total number of items in your project.': '此图表显示项目中所有项的当前状态。',
    'Missing field': '字段缺失',
    'The selected field no longer exists': '所选字段已不存在',

    // 图表侧栏与菜单
    'New chart': '新建图表',
    'Default charts': '默认图表',
    'Custom charts': '自定义图表',
    'Historical charts are currently in limited feature preview.': '历史图表目前处于有限功能预览阶段。',
    'Get unlimited charts': '获取无限图表',
    'Unlimited custom charts for private projects': '专用项目可创建无限自定义图表',
    // 方案名按用户要求译成中文（product-names.md）：Team / Enterprise → 团队版 / 企业版
    'Historical insights (Team or Enterprise plans only)': '历史洞察（仅限团队版或企业版计划）',
    'Save to new chart': '保存到新图表',
    'Save changes to new chart': '将更改保存到新图表',
    'Duplicate chart': '复制图表',
    'Delete chart': '删除图表',
    'Delete chart?': '删除图表？',
    'Edit chart name': '编辑图表名称',
    'Chart name': '图表名称',

    // 配置面板
    'Configure chart': '配置图表',
    'Close configuration pane': '关闭配置面板',
    'Y-axis field': 'Y 轴字段',
    'Chart filters': '图表筛选器',

    // 错误与空状态
    'This chart configuration is no longer valid': '此图表配置已失效',
    'A required field may have been deleted. You will need to delete and re-create this chart.':
      '必需字段可能已被删除。需删除并重新创建此图表。',
    'A required field may have been deleted. Update the configuration or delete the chart.': '必需字段可能已被删除。请更新配置或删除图表。',
    'This insight chart no longer exists': '此洞察图表已不存在',
    'Select another chart to view insights': '选择其他图表以查看洞察',
    'You do not have access to all project items. Your chart visualization might differ from others.':
      '你无权访问所有项目项。你看到的图表可能与他人不同。'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'Upgrade your plan to get:': '升级计划可获得：',
    'All the additional perks of a premium GitHub plan': 'GitHub 付费计划的其他所有权益',
    'Upgrade plan': '升级计划',
    'Group by (optional)': '分组依据（可选）',
    'Time period': '时间段',
    'Custom range': '自定义范围',
    'Stacked area': '堆积面积图',
    'Stacked bar': '堆积条形图',
    'Stacked column': '堆积柱状图',
    'Update configuration': '更新配置',
    'No results were returned.': '没有返回结果。',
    Configure: '配置',
    'X-axis': 'X 轴',
    'Y-axis': 'Y 轴',
    Historical: '历史',
    Time: '时间',
    None: '无',
    Line: '折线图',
    'No data available': '暂无数据',
    'Error loading data': '数据加载失败',
    'Unable to render chart.': '无法渲染图表。',
    Unlabeled: '无标签',
    'Y value': 'Y 值',
    // 图表卡片
    'Chart options': '图表选项',
    'View as table': '以表格查看',
    'Download CSV': '下载 CSV',
    'Download PNG': '下载 PNG',
    'Customization settings': '自定义设置',
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
    'Interactive chart.': '交互式图表。',
    // 历史图表的状态分组
    'Closed pull requests': '已关闭的拉取请求',
    ...PERIODS
  },
  regexp: [
    // 字段名不以数字开头：避开 Maximum of 5 pins reached… 之类的数量上限提示
    [/^(Count|Sum|Average|Minimum|Maximum) of (?!\d)(.+)$/, (_, operation: string, field: string) => aggregateLabel(operation, field)],
    [
      /^Private projects are limited to (\d+) custom charts\. Make your project public or upgrade your plan to add more charts\.$/,
      '专用项目最多只能有 $1 个自定义图表。将项目设为公共或升级计划可添加更多图表。'
    ],
    [
      /^Displaying results for (.+)$/,
      (_, period: string) => {
        const translated = PERIODS[period]
        // 全部 → 显示全部结果；时长与未知时间段 → 显示 2 周的结果、显示 Q3 2026 的结果
        if (translated && !/^\d/.test(translated)) return `显示${translated}结果`
        return joinCjk(joinCjk('显示', translated ?? period), '的结果')
      }
    ],
    [/^Are you sure you want to delete "(.+)"\?$/, '确定要删除“$1”吗？'],
    [/^(.+)\. Interactive chart\.$/, (_, title: string) => `${chartTitle(title)}。交互式图表。`],
    [/^(.+) Axis zoom$/, (_, title: string) => joinCjk(chartTitle(title), '的坐标轴缩放')],

    // Highcharts 无障碍描述（读屏文本）：原文没有逗号、冒号的不加，改语序代替标点
    [
      /^(Combination chart|Line chart|Bar chart|Pie chart|Chart) with ([\d,]+) (data series|data points?|lines?|bars?|slices?|pies?)\.$/,
      (_, type: string, count: string, unit: string) => `包含 ${count} ${CHART_UNITS[unit] ?? unit}的${CHART_TYPES[type] ?? type}。`
    ],
    [
      new RegExp(
        `^The chart has 1 (X|Y) axis displaying ([^.]+)\\.(?: Data ranges from ${AXIS_VALUE} to ${AXIS_VALUE}\\.| Data range: ([\\d,.]+) (categories|days|hours|minutes|seconds)\\.)?$`
      ),
      (_, axis: string, name: string, from: string, to: string, amount: string, unit: string) => {
        let range = ''
        if (from) range = `数据范围从 ${from} 到 ${to}。`
        else if (amount) range = `数据范围：${unit === 'categories' ? `${amount} 个类别` : `${amount} ${RANGE_UNITS[unit] ?? unit}`}。`
        return `图表有 1 条${joinCjk(displaying(name), `的 ${axis} 轴`)}。${range}`
      }
    ],
    [/^View as data table, (.+)$/, (_, title: string) => `以数据表查看，${chartTitle(title)}`],
    [/^Toggle series visibility, (.+)$/, (_, title: string) => `切换数据系列显示，${chartTitle(title)}`]
  ]
} satisfies PageDictionary
