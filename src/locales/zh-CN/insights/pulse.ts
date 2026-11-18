import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

const DURATION_UNIT: Readonly<Record<string, string>> = {
  hour: '小时',
  day: '天',
  week: '周',
  month: '个月',
  year: '年'
}

/** 「3 days」→「3天」 */
export function translateDuration(amount: string, unit: string): string {
  return `${amount}${DURATION_UNIT[unit.replace(/s$/, '')] ?? unit}`
}

const DURATION_SOURCE = '(\\d+) (hours?|days?|weeks?|months?|years?)'

/** 数据加载失败提示里的数据类型 */
const DATA_TYPE: Readonly<Record<string, string>> = {
  Committer: '提交者',
  Diffstat: '差异统计',
  Overview: '概述'
}

/**
 * Pulse（/owner/repo/pulse，React 应用 repos-pulse）。
 * 数字都在独立的 <strong> / <span> 里，文字片段按 React 拆分的文本节点收录；
 * 同一元素内的相邻文本节点会先拼接匹配（如「pull requests merged」+「 by」）。
 */
export default {
  static: {
    Pulse: '脉搏',
    'Period:': '周期：',
    'Merged pull requests': '已合并的拉取请求',
    'Open pull requests': '打开的拉取请求',
    'Closed issues': '已关闭的议题',
    'New issues': '新议题',
    'View merged pull requests': '查看已合并的拉取请求',
    'View open pull requests': '查看打开的拉取请求',
    'View closed issues': '查看已关闭的议题',
    'View open issues': '查看打开的议题',

    // 摘要
    'Excluding merges,': '不计合并提交，',
    'to all branches.': '到所有分支。',
    // On main, <5 files> have changed and there have been <100 additions> and <20 deletions>.
    'have changed and there have been': '发生了更改 共有',
    'has changed and there have been': '发生了更改 共有',
    'Top committers': '主要提交者',

    // 各区块标题：<strong>3</strong> pull requests merged by <strong>2</strong> people（拉取请求的 open 作“创建”，议题作“打开”）
    'pull requests merged by': '个拉取请求已合并 来自',
    'pull request merged by': '个拉取请求已合并 来自',
    'pull requests opened by': '个拉取请求已创建 来自',
    'pull request opened by': '个拉取请求已创建 来自',
    'issues closed by': '个议题已关闭 来自',
    'issue closed by': '个议题已关闭 来自',
    'issues opened by': '个议题已打开 来自',
    'issue opened by': '个议题已打开 来自',
    'releases published by': '个发行版已发布 来自',
    'release published by': '个发行版已发布 来自',
    "Sometimes conversations happen on old items that aren't yet closed. Here is a list of all the Issues and Pull Requests with unresolved conversations.":
      '尚未关闭的旧议题和拉取请求中也可能出现对话。以下是所有存在未解决对话的议题和拉取请求。',
    'Sometimes conversations happen on old items that aren’t yet closed. Here is a list of all the Issues and Pull Requests with unresolved conversations.':
      '尚未关闭的旧议题和拉取请求中也可能出现对话。以下是所有存在未解决对话的议题和拉取请求。',

    // 空状态与错误
    'Want to help out?': '想参与贡献？',
    'Fork this repository': '复刻此存储库',
    'There was an error fetching the data': '获取数据时出错',
    'Server error occurred. Please try again later.': '服务器出错。请稍后重试。',
    'Data not found.': '未找到数据。',
    'Bad request. Please refresh the page and try again.': '请求无效。请刷新页面后重试。',
    'Data is unusable': '数据不可用',
    'Request was cancelled. Please try again.': '请求已取消。请重试。',
    'An unexpected error occurred while fetching the data': '获取数据时发生意外错误'
  },
  scoped: {
    Summary: '摘要',
    // 概述：<span>3</span> Active pull requests（数字在前面的独立元素里）
    'Active pull requests': '个活跃拉取请求',
    'Active pull request': '个活跃拉取请求',
    'Active issues': '个活跃议题',
    'Active issue': '个活跃议题',
    // 仅在 Pulse 语境下成立的片段（前面紧跟独立元素里的数字）
    'have pushed': '推送了',
    'has pushed': '推送了',
    additions: '行新增',
    addition: '行新增',
    deletions: '行删除',
    deletion: '行删除',
    people: '人',
    person: '人',
    merged: '合并于',
    // 条目「#12 opened <时间>」：拉取请求与议题的条目结构相同，无法区分，按议题的说法
    opened: '打开于',
    closed: '关闭于',
    published: '发布于',
    'commented on': '评论于',
    'Unresolved conversations': '个未解决的对话',
    'Unresolved conversation': '个未解决的对话',
    'pull requests merged': '个拉取请求已合并',
    'pull request merged': '个拉取请求已合并',
    'pull requests opened': '个拉取请求已创建',
    'pull request opened': '个拉取请求已创建',
    'issues closed': '个议题已关闭',
    'issue closed': '个议题已关闭',
    'issues opened': '个议题已打开',
    'issue opened': '个议题已打开',
    'releases published': '个发行版已发布',
    'release published': '个发行版已发布',
    // 首字母大写的区块标题（数量为 0 时的旧版写法）
    'Pull requests merged by': '个拉取请求已合并 来自',
    'Pull request merged by': '个拉取请求已合并 来自',
    'Pull requests opened by': '个拉取请求已创建 来自',
    'Pull request opened by': '个拉取请求已创建 来自',
    'Issues closed by': '个议题已关闭 来自',
    'Issue closed by': '个议题已关闭 来自',
    'Issues opened by': '个议题已打开 来自',
    'Issue opened by': '个议题已打开 来自',
    'Releases published by': '个发行版已发布 来自',
    'Release published by': '个发行版已发布 来自',
    'Top Committers': '主要提交者',
    // 拼接失败时的单节点兜底
    'changed and there have been': '发生了更改 共有',
    'new comments': '条新评论',
    'new comment': '条新评论',
    // 旧版提交图提示：<strong>12</strong> commits authored by <strong>octocat</strong>
    'commits authored by': '个提交的作者为',
    'commit authored by': '个提交的作者为',
    // 无数据时的示例条目
    '[Example issue]': '[示例议题]',
    '[Example PR]': '[示例 PR]',
    '[Example discussion]': '[示例讨论]',
    'commented on yesterday • -- new comment(s)': '评论于昨天 • -- 条新评论'
  },
  regexp: [
    // 页头日期范围：October 18, 2026 – October 25, 2026
    [new RegExp(`^(${DATE_SOURCE}) [–-] (${DATE_SOURCE})$`), (_, from, to) => `${translateTime(from)} – ${translateTime(to)}`],
    // 周期选项（Pulse：3 days / 1 week / 1 month；复刻页：1 month … 5 years）。24 hours 由 common 的静态词条先行命中
    [new RegExp(`^${DURATION_SOURCE}$`), (_, amount, unit) => translateDuration(amount, unit)],
    // 摘要（数字与单位在同一个 <strong> 里，拼接后匹配）
    [/^([\d,]+) authors?$/, '$1 个作者'],
    [/^([\d,]+) files?$/, '$1 个文件'],
    [/^to (\S+) and$/, '到 $1 以及'],
    [/^On (\S+),$/, '在 $1 上，'],
    // 主要提交者图表提示：12 commits authored by octocat
    [/^([\d,]+) commits? authored by (.+)$/, '$2 编写了 $1 个提交'],
    // 未解决对话条目：• 3 new comments
    [/^• ([\d,]+) new comments?$/, '• $1 条新评论'],
    // 空状态
    [
      new RegExp(`^There hasn['’]t been any commit activity on ([\\w.-]+\\/[\\w.-]+) over the last ${DURATION_SOURCE}$`),
      (_, repo, amount, unit) => `${joinCjk('过去', translateDuration(amount, unit))}内 ${repo} 没有任何提交活动`
    ],
    // 数据加载失败
    [/^(Committer|Diffstat|Overview) data path is not available$/, (_, type) => `${DATA_TYPE[type]}数据路径不可用`]
  ]
} satisfies PageDictionary
