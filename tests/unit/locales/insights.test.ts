import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import { formatDate } from '../../../src/locales/zh-CN/helpers'
import insights from '../../../src/locales/zh-CN/insights'
import { translateChartTitle } from '../../../src/locales/zh-CN/insights/charts'
import { translateDuration } from '../../../src/locales/zh-CN/insights/pulse'
import { zhTW } from '../../../src/locales/zh-TW/index'

const matcher = createMatcher([['insights', insights]])
const PAGES = ['common', 'repository', 'insights'] as const

/** 日期由 helpers 生成，期望按同一格式拼出 */
const day = (year: number, month: number, date: number): string => formatDate(year, month, date)

/** 贡献者图周统计说明：日期前（中文接数字）加空格，日期后（接中文）不加 */
const WEEKLY = `每周统计 ${day(2026, 7, 25)}至 ${day(2026, 10, 25)}`

function translate(text: string): string | undefined {
  return matcher.translate(text, PAGES)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // Pulse
  {
    hits: [
      ['October 18, 2026 – October 25, 2026', `${day(2026, 10, 18)} – ${day(2026, 10, 25)}`],
      ['Oct 18, 2026 - Oct 25, 2026', `${day(2026, 10, 18)} – ${day(2026, 10, 25)}`]
    ],
    misses: ['October 18 – the end']
  },
  {
    hits: [
      ['1 week', '1周'],
      ['12 hours', '12小时'],
      ['24 hours', '24小时'],
      ['3 days', '3天'],
      ['1 month', '1个月'],
      ['6 months', '6个月'],
      ['2 years', '2年']
    ],
    misses: ['1 decade']
  },
  {
    hits: [
      ['3 authors', '3 个作者'],
      ['1 author', '1 个作者']
    ],
    misses: ['many authors']
  },
  {
    hits: [
      ['128 files', '128 个文件'],
      ['1 file', '1 个文件']
    ],
    misses: ['several files']
  },
  { hits: [['to main and', '到 main 以及']], misses: ['to all of them and'] },
  { hits: [['On main,', '在 main 上，']], misses: ['On main'] },
  {
    hits: [
      ['12 commits authored by octocat', 'octocat 编写了 12 个提交'],
      ['1 commit authored by renovate[bot]', 'renovate[bot] 编写了 1 个提交'],
      ['3 commits authored by Unknown user', 'Unknown user 编写了 3 个提交']
    ],
    misses: ['commits authored by octocat']
  },
  {
    hits: [
      ['• 3 new comments', '• 3 条新评论'],
      ['• 1 new comment', '• 1 条新评论']
    ],
    misses: ['• new comments']
  },
  {
    hits: [
      [
        "There hasn't been any commit activity on octo-org/hello-world over the last 1 week",
        '过去 1周内 octo-org/hello-world 没有任何提交活动'
      ],
      [
        'There hasn’t been any commit activity on octo-org/hello-world over the last 24 hours',
        '过去 24小时内 octo-org/hello-world 没有任何提交活动'
      ]
    ],
    misses: ["There hasn't been any commit activity on octo-org over the last week"]
  },
  {
    hits: [
      ['Committer data path is not available', '提交者数据路径不可用'],
      ['Overview data path is not available', '概述数据路径不可用']
    ],
    misses: ['Commit data path is not available']
  },
  // 侧栏、标题、贡献者
  { hits: [['Insights: octo-org/hello-world', '洞察：octo-org/hello-world']], misses: ['Insights: octo-org'] },
  {
    hits: [['Contributors to octo-org/hello-world', 'octo-org/hello-world 的贡献者']],
    misses: ['Contributors to octo-org']
  },
  {
    hits: [
      ['Contributions per week to main, excluding merge commits', '每周对 main 的贡献，不含合并提交'],
      ['Contributions per week to release/v1.2, excluding merge commits', '每周对 release/v1.2 的贡献，不含合并提交']
    ],
    misses: ['Contributions per week to main']
  },
  {
    hits: [
      [
        'Contributions per week to main, line counts have been omitted because commit count exceeds 10,000.',
        '每周对 main 的贡献，因提交数超过 10,000 而省略了行数统计。'
      ]
    ],
    misses: ['Contributions per week to main, line counts have been omitted.']
  },
  // 拼接失败时的单节点兜底：分支名之后的句尾
  {
    hits: [
      [', line counts have been omitted because commit count exceeds 10,000.', '，因提交数超过 10,000 而省略了行数统计。'],
      [', line counts have been omitted because commit count exceeds 500.', '，因提交数超过 500 而省略了行数统计。']
    ],
    misses: [
      ', line counts have been omitted.',
      'line counts have been omitted because commit count exceeds 10,000.',
      ', line counts have been omitted because commit count exceeds many.'
    ]
  },
  {
    hits: [
      [': Last 3 months', '：最近 3 个月'],
      [': All', '：全部'],
      [': Last month', '：最近 1 个月'],
      [': Custom range', '：自定义范围']
    ],
    misses: [': Last week']
  },
  { hits: [['Last 12 months', '最近 12 个月']], misses: ['Last few months'] },
  {
    hits: [
      ['Commits over time', '提交趋势'],
      ['Additions over time', '新增趋势']
    ],
    misses: ['Stars over time']
  },
  {
    hits: [
      ["octocat's Commits", 'octocat 的提交'],
      ["renovate[bot]'s Deletions", 'renovate[bot] 的删除']
    ],
    misses: ["the team's Commits"]
  },
  {
    hits: [
      ['Weekly from Jul 25, 2026 to Oct 25, 2026', WEEKLY],
      // 浏览器语言为英式英语时的日月年格式
      ['Weekly from 25 Jul 2026 to 25 Oct 2026', WEEKLY],
      // 浏览器语言为中文时的本地格式（原生无空格），按 helpers 的日期格式输出
      ['Weekly from 2026年7月25日 to 2026年10月25日', WEEKLY],
      ['Weekly from 2026年7月25日 to 2026年10月25日', WEEKLY]
    ],
    misses: ['Weekly from yesterday to today']
  },
  {
    hits: [
      ['12 commits', '12 个提交'],
      ['1 commit', '1 个提交'],
      ['1,234 commits', '1,234 个提交']
    ],
    misses: ['many commits']
  },
  // 图表无障碍文字
  {
    hits: [
      ['Commits over time. Interactive chart.', '提交趋势。交互式图表。'],
      ["octocat's Commits. Interactive chart.", 'octocat 的提交。交互式图表。'],
      ['Top committers. Interactive chart.', '主要提交者。交互式图表。'],
      ['Velocity. Interactive chart.', 'Velocity。交互式图表。']
    ],
    misses: ['Interactive chart for commits']
  },
  {
    hits: [
      ['Commits over time Axis zoom', '提交趋势的坐标轴缩放'],
      ['Velocity Axis zoom', 'Velocity 的坐标轴缩放']
    ],
    misses: ['Axis zoom']
  },
  {
    hits: [
      ['Show Additions', '显示新增'],
      ['Show Deletions', '显示删除']
    ],
    misses: ['Show Stars']
  },
  {
    hits: [
      ['Bar chart with 14 bars.', '包含 14 个柱的柱状图。'],
      ['Bar chart with 2 data series.', '包含 2 个数据系列的柱状图。'],
      ['Combination chart with 2 data series.', '包含 2 个数据系列的组合图。'],
      ['Line chart with 1 data point.', '包含 1 个数据点的折线图。']
    ],
    misses: ['Bar chart with many bars.']
  },
  {
    hits: [
      [
        'The chart has 1 X axis displaying Time. Data ranges from 2026-07-26 00:00:00 to 2026-10-25 00:00:00.',
        '图表有 1 条显示时间的 X 轴。数据范围从 2026-07-26 00:00:00 到 2026-10-25 00:00:00。'
      ],
      [
        'The chart has 1 Y axis displaying Frequency. Data ranges from -30722 to 60130.',
        '图表有 1 条显示频率的 Y 轴。数据范围从 -30722 到 60130。'
      ],
      ['The chart has 1 X axis displaying categories.', '图表有 1 条显示类别的 X 轴。'],
      ['The chart has 1 X axis displaying Values. Data range: 7 days.', '图表有 1 条显示 Values 的 X 轴。数据范围：7 天。'],
      ['The chart has 1 X axis displaying categories. Data range: 15 categories.', '图表有 1 条显示类别的 X 轴。数据范围：15 个类别。']
    ],
    misses: ['The chart has 1 Z axis displaying Time.']
  },
  {
    hits: [
      ['The chart has 2 X axes displaying Time, and navigator-x-axis.', '图表的 2 条 X 轴分别显示时间、导航 X 轴。'],
      ['The chart has 2 Y axes displaying Contributions, and navigator-y-axis.', '图表的 2 条 Y 轴分别显示贡献、导航 Y 轴。'],
      ['The chart has 3 X axes displaying Time, Values, and navigator-x-axis.', '图表的 3 条 X 轴分别显示时间、Values、导航 X 轴。']
    ],
    misses: ['The chart has many X axes displaying Time.']
  },
  // 依赖项关系图
  {
    hits: [
      ['· Detected automatically on Oct 18, 2026 · MIT', `· 自动检测于 ${day(2026, 10, 18)} · MIT`],
      ['· Detected automatically on Sep 16, 2026', `· 自动检测于 ${day(2026, 9, 16)}`],
      ['· Detected automatically on Aug 11, 2024 · Apache-2.0 OR MIT', `· 自动检测于 ${day(2024, 8, 11)} · Apache-2.0 OR MIT`]
    ],
    misses: ['· Detected automatically yesterday']
  },
  {
    hits: [
      ['Paths for @pnpm/exe.android-arm64 12.11.2', '@pnpm/exe.android-arm64 12.11.2 的路径'],
      ['Paths for vite catalog:', 'vite catalog: 的路径']
    ],
    misses: ['Paths']
  },
  {
    hits: [
      ['Showing 0 paths. Export SBOM to view all paths.', '显示 0 条路径。导出 SBOM 以查看所有路径。'],
      ['Showing 1 path. Export SBOM to view all paths.', '显示 1 条路径。导出 SBOM 以查看所有路径。']
    ],
    misses: ['Showing all paths. Export SBOM to view all paths.']
  },
  { hits: [['80 Total', '共 80 个']], misses: ['80 total'] },
  {
    hits: [
      ['0 Repositories', '0 个存储库'],
      ['3 Packages', '3 个软件包'],
      ['1,907,154 Repositories', '1,907,154 个存储库'],
      ['1 Package', '1 个软件包']
    ],
    misses: ['Many Repositories']
  },
  {
    hits: [
      ['@octo-org/compat repositories', '依赖 @octo-org/compat 的存储库'],
      ['@vue/shared packages', '依赖 @vue/shared 的软件包'],
      ['lodash repositories', '依赖 lodash 的存储库'],
      ['Newtonsoft.Json packages', '依赖 Newtonsoft.Json 的软件包'],
      ['github.com/octo-org/hello-world repositories', '依赖 github.com/octo-org/hello-world 的存储库']
    ],
    misses: ['@vue/shared users', '12 repositories', '1,234 packages', 'Public repositories', 'Forked repositories']
  },
  // 网络图与复刻
  {
    hits: [['The repository network shows the 50 most recently pushed forks.', '存储库网络显示最近推送的 50 个复刻。']],
    misses: ['The repository network shows the most recently pushed forks.']
  },
  { hits: [['12 ahead, 3 behind', '领先 12，落后 3']], misses: ['12 ahead, many behind'] },
  {
    hits: [
      ['12 ahead', '领先 12'],
      ['3 behind', '落后 3']
    ],
    misses: ['12 ahead of main']
  },
  { hits: [['2 commits ahead of main', '领先 main 2 个提交']], misses: ['2 commits ahead'] },
  { hits: [['1 commit behind main', '落后 main 1 个提交']], misses: ['1 commit behind'] },
  {
    hits: [
      ['25 commits loaded.', '已加载 25 个提交。'],
      ['1 commit loaded.', '已加载 1 个提交。']
    ],
    misses: ['commits loaded.']
  },
  {
    hits: [
      ['Active, Archived', '活跃、已存档'],
      ['Inactive, Network, Starred', '不活跃、网络、已加星标']
    ],
    misses: ['Active, Pending']
  },
  // 标星者 / 关注者
  { hits: [['Follow octocat', '关注 octocat']], misses: ['Follow the guide below'] },
  { hits: [['Unfollow monalisa', '取消关注 monalisa']], misses: ['Unfollow all users'] },
  {
    hits: [
      ['Joined on Apr 13, 2014', `加入于 ${day(2014, 4, 13)}`],
      ['Joined on Dec 28, 2010', `加入于 ${day(2010, 12, 28)}`]
    ],
    misses: ['Joined on GitHub']
  },
  { hits: [['Works for @octo-org', '就职于 @octo-org']], misses: ['Works for the team'] },
  { hits: [['Is from San Francisco', '来自 San Francisco']], misses: ['Is from'] },
  // 流量
  {
    hits: [
      ['Clones in last 14 days', '过去 14 天的克隆数'],
      ['Unique visitors in last 14 days', '过去 14 天的独立访问者']
    ],
    misses: ['Clones in last week']
  },
  {
    hits: [
      ['12 Clones', '12 次克隆'],
      ['1 Unique visitor', '1 个独立访问者'],
      ['3,456 Views', '3,456 次浏览']
    ],
    misses: ['Many Clones']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('insights 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(insights.static?.[input]).toBeUndefined()
    expect(insights.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = insights.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    const joined = (parts: readonly string[]): string | undefined => translate(normalizeText(parts.join('')))
    expect(joined(['Contributions per week to ', 'main', ', excluding merge commits'])).toBe('每周对 main 的贡献，不含合并提交')
    expect(joined(['1,234', ' commit', 's'])).toBe('1,234 个提交')
    expect(joined(['3', ' ', 'authors'])).toBe('3 个作者')
    expect(joined([' to ', 'main', ' and '])).toBe('到 main 以及')
    expect(joined([' ', 'pull requests merged', ' by', ' '])).toBe('个拉取请求已合并 来自')
    expect(joined([' ', 'have', ' changed and there have been '])).toBe('发生了更改 共有')
    expect(joined([' • ', '3', ' ', 'new comments'])).toBe('• 3 条新评论')
    expect(joined(['Commits', ' over time'])).toBe('提交趋势')
    expect(joined(['Weekly from ', 'Jul 25, 2026', ' to ', 'Oct 25, 2026'])).toBe(WEEKLY)
    expect(joined(["There hasn't been any commit activity on ", 'octo-org', '/', 'hello-world', ' over the last ', '1 week'])).toBe(
      '过去 1周内 octo-org/hello-world 没有任何提交活动'
    )
  })

  it('统计摘要片段按顺序读通', () => {
    const parts = ['Excluding merges,', '3 authors', 'have pushed', '12 commits', 'to main and', '40 commits', 'to all branches.']
    expect(parts.map(part => translate(part) ?? part).join(' ')).toBe(
      '不计合并提交， 3 个作者 推送了 12 个提交 到 main 以及 40 个提交 到所有分支。'
    )
  })

  it('跨元素片段按顺序读通', () => {
    const read = (parts: readonly string[]): string => parts.map(part => translate(part) ?? part).join(' ')
    expect(read(['On main,', '5 files', 'have changed and there have been', '100', 'additions', 'and', '20', 'deletions'])).toBe(
      '在 main 上， 5 个文件 发生了更改 共有 100 行新增 and 20 行删除'
    )
    expect(read(['Commits over the last year of', 'octo-org/hello-world'])).toBe('以下存储库过去一年的提交 octo-org/hello-world')
    expect(read(['Repositories that depend on', '@vue/shared'])).toBe('依赖以下软件包的存储库 @vue/shared')
    expect(read(['3', 'Active pull requests'])).toBe('3 个活跃拉取请求')
    expect(read(['12', 'commits authored by', 'octocat'])).toBe('12 个提交的作者为 octocat')
    expect(read(['Contributions per week to', 'main', ', excluding merge commits'])).toBe('每周贡献到 main ，不含合并提交')
    expect(read(['Contributions per week to', 'main', ', line counts have been omitted because commit count exceeds 10,000.'])).toBe(
      '每周贡献到 main ，因提交数超过 10,000 而省略了行数统计。'
    )
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw(' have pushed ', PAGES)).toBe(' 推送了 ')
    expect(matcher.translateRaw(' to all branches.', PAGES)).toBe(' 到所有分支。')
    // 译文以全角逗号开头：开头的空白不保留
    expect(matcher.translateRaw(' , line counts have been omitted because commit count exceeds 10,000.', PAGES)).toBe(
      '，因提交数超过 10,000 而省略了行数统计。'
    )
  })
})

describe('insights 贡献者页说明（繁体）', () => {
  const tw = createMatcher(zhTW)

  it.each([
    ['Contributions per week to main, excluding merge commits', '每週對 main 的貢獻，不含合併提交'],
    [
      'Contributions per week to main, line counts have been omitted because commit count exceeds 10,000.',
      '每週對 main 的貢獻，因提交數超過 10,000 而省略行數統計。'
    ],
    // 拼接失败时的单节点兜底
    [', line counts have been omitted because commit count exceeds 10,000.', '，因提交數超過 10,000 而省略行數統計。'],
    [', excluding merge commits', '，不含合併提交']
  ])('%s → %s', (input, expected) => {
    expect(tw.translate(input, PAGES)).toBe(expected)
  })

  it('兜底规则不在其他页面生效', () => {
    expect(tw.translate(', line counts have been omitted because commit count exceeds 10,000.', ['common', 'repository'])).toBeUndefined()
    expect(tw.translate(', line counts have been omitted.', PAGES)).toBeUndefined()
  })
})

describe('insights 静态词条', () => {
  it.each([
    // 产品名、功能名按用户规定译成中文（洞察侧栏的 Pulse、操作指标、市场）
    ['Pulse', '统计'],
    ['View in Marketplace', '在市场中查看'],
    ['Detect additional dependencies with GitHub Actions', '使用 GitHub 操作检测更多依赖项'],
    [
      'Upgrade to GitHub Pro or make this repository public to enable this feature.',
      '升级到 GitHub 专业版或将此存储库设为公共以启用此功能。'
    ],
    [
      'Contact an administrator to upgrade to GitHub Team or make this repository public to enable this feature.',
      '请联系管理员升级到 GitHub 团队版或将此存储库设为公共以启用此功能。'
    ],
    // 星标、反应按术语表（为此存储库加星标、做出反应）
    ['No one you follow has starred this repository yet.', '你关注的人中还没有人为此存储库加星标。'],
    [
      'Count of unique users who have reacted, upvoted, marked an answer, commented, or posted in the selected period.',
      '所选时间段内做出反应、投票、标记答案、评论或发帖的独立用户数。'
    ],
    // 原文没有的逗号不加
    ["We don't have enough data to generate this graph", '数据不足以生成此图表'],
    ['We don’t have enough data to show anything useful.', '数据不足以显示有效信息。'],
    ['Contributors', '贡献者'],
    ['Code frequency', '代码频率'],
    ['Dependency graph', '依赖项关系图'],
    ['Network', '网络'],
    ['Forks', '复刻'],
    ['Community standards', '社区标准'],
    ['Traffic', '流量'],
    ['Period:', '周期：'],
    ['Top committers', '主要提交者'],
    ['pull requests opened by', '个拉取请求已创建 来自'],
    ['issues opened by', '个议题已打开 来自'],
    ['Contributions:', '贡献：'],
    ["'s Commits", '的提交'],
    ['Crunching the latest data, just for you. Hang tight…', '正在计算最新数据，请稍候…'],
    ['Chart options', '图表选项'],
    ['Customization settings', '自定义设置'],
    ['End of interactive chart.', '交互式图表结束。'],
    ['View as data table, Chart', '以数据表查看，图表'],
    ['Export SBOM', '导出 SBOM'],
    ['Transitive', '传递'],
    ['Dependency files checked', '依赖文件检查于'],
    ['We’ll keep looking!', '我们会继续查找！'],
    ['Switch to tree view', '切换到树状视图'],
    ['Most starred', '星标最多'],
    ['Nothing to show', '暂无内容'],
    ['No forked repositories found', '未找到复刻存储库'],
    ['Here’s how this project compares to', '以下是此项目对照'],
    ["Here's how this project compares to", '以下是此项目对照'],
    ['Not added yet', '尚未添加'],
    ['Unique visitors', '独立访问者'],
    ['Save Defaults', '保存默认设置'],
    ['Writing a README', '编写自述文件'],
    ['Dependency graph is disabled', '依赖项关系图已禁用'],
    ['No one has forked this repository yet.', '还没有人复刻此存储库。'],
    ['Insights navigation', '洞察导航'],
    ['Code generation', '代码生成'],
    ['Actions usage metrics', '操作使用情况指标'],
    ['Try changing your filters, or search for', '尝试更改筛选器，或搜索'],
    ['Repository admins accept content reports', '存储库管理员接受内容报告']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })
})

describe('insights 页面词条', () => {
  it.each([
    ['Summary', '摘要'],
    ['have pushed', '推送了'],
    ['people', '人'],
    ['merged', '合并于'],
    ['opened', '打开于'],
    ['pull requests opened', '个拉取请求已创建'],
    ['commented on', '评论于'],
    ['Unresolved conversations', '个未解决的对话'],
    ['Active pull requests', '个活跃拉取请求'],
    ['Active issues', '个活跃议题'],
    ['commits authored by', '个提交的作者为'],
    ['[Example PR]', '[示例 PR]'],
    ['commented on yesterday • -- new comment(s)', '评论于昨天 • -- 条新评论'],
    ['Last month', '最近 1 个月'],
    ['Additions', '新增'],
    [', excluding merge commits', '，不含合并提交'],
    ['Category', '类别'],
    ['Up to date', '已是最新'],
    ['Active', '活跃'],
    ['Created', '创建于'],
    ['Updated', '更新于'],
    ['Sort:', '排序：'],
    ['Security policy', '安全策略'],
    ['README', '自述文件'],
    ['Stargazers', '标星者'],
    ['Watchers', '关注者'],
    ['Views', '浏览量'],
    ['On', '开'],
    ['Off', '关'],
    ['Chart', '图表'],
    ['Total', '总计'],
    ['Allow access', '允许访问'],
    // 依赖项关系图的生态系统筛选项（与 npm 并列）；产品名按用户规定译出，同 security 公告的生态系统选项
    ['GitHub Actions', 'GitHub 操作']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    for (const input of [
      'Summary',
      'people',
      'Active',
      'Active issues',
      'Created',
      'Additions',
      'Last month',
      'On',
      'Off',
      'GitHub Actions'
    ]) {
      expect(matcher.translate(input, ['common', 'repository', 'issues'])).toBeUndefined()
    }
    expect(matcher.translate('12 commits', ['common', 'repository', 'issues'])).toBeUndefined()
  })
})

describe('insights 辅助函数', () => {
  it('时长：数字与单位之间不加空格', () => {
    expect(translateDuration('3', 'days')).toBe('3天')
    expect(translateDuration('1', 'month')).toBe('1个月')
    expect(translateDuration('24', 'hours')).toBe('24小时')
  })

  it('图表标题', () => {
    expect(translateChartTitle('Code frequency')).toBe('代码频率')
    expect(translateChartTitle('Deletions over time')).toBe('删除趋势')
    expect(translateChartTitle("octocat's Additions")).toBe('octocat 的新增')
    expect(translateChartTitle('Velocity')).toBe('Velocity')
  })
})

describe('insights 忽略选择器', () => {
  it.each(insights.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })
})

describe('insights 统计拆分的文本节点', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 按 React 客户端渲染建元素：每个字符串子项是独立的文本节点 */
  function build(tag: string, children: readonly (string | Node)[]): HTMLElement {
    const element = document.createElement(tag)
    for (const child of children) element.append(typeof child === 'string' ? document.createTextNode(child) : child)
    return element
  }

  function text(element: HTMLElement): string {
    return (element.textContent ?? '').replace(/\s+/g, ' ').trim()
  }

  function run(...elements: HTMLElement[]): void {
    document.body.append(...elements)
    translator = createTranslator({ matcher, host: window, resolvePages: () => PAGES })
    translator.start()
  }

  it('摘要里的 have / pushed 随所在片段整体翻译', () => {
    // repos-pulse：<span>{" "}{has/have}{" pushed "}</span>，三个文本节点相邻
    const summary = build('p', [
      build('span', ['Excluding merges, ']),
      build('strong', ['3', ' ', 'authors']),
      build('span', [' ', 'have', ' pushed ']),
      build('strong', [build('span', ['12', ' ', 'commits'])]),
      build('span', [' to ', 'main', ' and ']),
      build('strong', ['40', ' ', 'commits']),
      build('span', [' to all branches.'])
    ])
    const files = build('p', [
      build('span', ['On ', 'main', ', ']),
      build('strong', ['5', ' ', 'files']),
      build('span', [' ', 'have', ' changed and there have been '])
    ])
    run(summary, files)
    expect(text(summary)).toBe('不计合并提交，3 个作者 推送了 12 个提交 到 main 以及 40 个提交 到所有分支。')
    expect(text(files)).toBe('在 main 上，5 个文件 发生了更改 共有')
  })

  it('服务端渲染的 <!-- --> 分隔不影响整体翻译', () => {
    const ssr = document.createElement('p')
    ssr.innerHTML =
      '<strong>3<!-- --> <!-- -->authors</strong><span> <!-- -->have<!-- --> pushed </span>' +
      '<strong><span>12<!-- --> <!-- -->commits</span></strong>'
    run(ssr)
    expect(text(ssr)).toBe('3 个作者 推送了 12 个提交')
  })

  it('区块标题里的 by / person 随所在片段整体翻译', () => {
    // <span><Icon/> <strong>1</strong> {"release published"}{" by"} <strong>1</strong> {"person"}</span>
    const strong = (count: string): HTMLElement => build('strong', [count])
    const release = build('span', [' ', strong('1'), ' ', 'release published', ' by', ' ', strong('1'), ' ', 'person'])
    const merged = build('span', [' ', strong('3'), ' ', 'pull requests merged', ' by', ' ', strong('2'), ' ', 'people'])
    run(release, merged)
    expect(text(release)).toBe('1 个发行版已发布 来自 1 人')
    expect(text(merged)).toBe('3 个拉取请求已合并 来自 2 人')
  })

  it('区块标题：拉取请求的 opened 作“已创建”，问题的 opened 作“已打开”', () => {
    const strong = (count: string): HTMLElement => build('strong', [count])
    const pulls = build('span', [' ', strong('33'), ' ', 'pull requests opened', ' by', ' ', strong('18'), ' ', 'people'])
    const issues = build('span', [' ', strong('8'), ' ', 'issues opened', ' by', ' ', strong('8'), ' ', 'people'])
    run(pulls, issues)
    expect(text(pulls)).toBe('33 个拉取请求已创建 来自 18 人')
    expect(text(issues)).toBe('8 个议题已打开 来自 8 人')
  })
})
