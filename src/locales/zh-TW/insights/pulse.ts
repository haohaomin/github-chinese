import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

const DURATION_UNIT: Readonly<Record<string, string>> = {
  hour: '小時',
  day: '天',
  week: '週',
  month: '個月',
  year: '年'
}

/** 「3 days」→「3 天」；数字与单位之间加空格（术语表） */
export function translateDuration(amount: string, unit: string): string {
  return `${amount} ${DURATION_UNIT[unit.replace(/s$/, '')] ?? unit}`
}

const DURATION_SOURCE = '(\\d+) (hours?|days?|weeks?|months?|years?)'

/** 数据加载失败提示里的数据类型 */
const DATA_TYPE: Readonly<Record<string, string>> = {
  Committer: '提交者',
  Diffstat: '差異統計',
  Overview: '總覽'
}

/**
 * Pulse（/owner/repo/pulse，React 应用 repos-pulse）。
 * 数字都在独立的 <strong> / <span> 里，文字片段按 React 拆分的文本节点收录；
 * 同一元素内的相邻文本节点会先拼接匹配（如「pull requests merged」+「 by」）。
 */
export default {
  static: {
    Pulse: '統計',
    'Period:': '期間：',
    'Merged pull requests': '已合併的拉取請求',
    'Open pull requests': '開放中的拉取請求',
    'Closed issues': '已關閉的議題',
    'New issues': '新議題',
    'View merged pull requests': '查看已合併的拉取請求',
    'View open pull requests': '查看開放中的拉取請求',
    'View closed issues': '查看已關閉的議題',
    'View open issues': '查看開放中的議題',

    // 摘要
    'Excluding merges,': '不計合併提交，',
    'to all branches.': '到所有分支。',
    // On main, <5 files> have changed and there have been <100 additions> and <20 deletions>.（原文无标点，译文不加逗号）
    'have changed and there have been': '已變更且共有',
    'has changed and there have been': '已變更且共有',
    'Top committers': '主要提交者',

    // 各区块标题：<strong>3</strong> pull requests merged by <strong>2</strong> people（拉取请求、议题的 open 都作「建立」；
    // people 各标题共用「人」，by 作「來自」，拼成「3 個已合併的拉取請求來自 2 人」）
    'pull requests merged by': '個已合併的拉取請求來自',
    'pull request merged by': '個已合併的拉取請求來自',
    'pull requests opened by': '個已建立的拉取請求來自',
    'pull request opened by': '個已建立的拉取請求來自',
    'issues closed by': '個已關閉的議題來自',
    'issue closed by': '個已關閉的議題來自',
    'issues opened by': '個已建立的議題來自',
    'issue opened by': '個已建立的議題來自',
    'releases published by': '個已發布的發行版本來自',
    'release published by': '個已發布的發行版本來自',
    "Sometimes conversations happen on old items that aren't yet closed. Here is a list of all the Issues and Pull Requests with unresolved conversations.":
      '尚未關閉的舊議題和拉取請求中有時也會出現對話。以下列出所有含有未解決對話的議題和拉取請求。',
    'Sometimes conversations happen on old items that aren’t yet closed. Here is a list of all the Issues and Pull Requests with unresolved conversations.':
      '尚未關閉的舊議題和拉取請求中有時也會出現對話。以下列出所有含有未解決對話的議題和拉取請求。',

    // 空状态与错误
    'Want to help out?': '想幫忙嗎？',
    'Fork this repository': '分叉此儲存庫',
    'There was an error fetching the data': '擷取資料時發生錯誤',
    'Server error occurred. Please try again later.': '發生伺服器錯誤。請稍後再試。',
    'Data not found.': '找不到資料。',
    'Bad request. Please refresh the page and try again.': '請求無效。請重新整理頁面後再試一次。',
    'Data is unusable': '資料無法使用',
    'Request was cancelled. Please try again.': '請求已取消。請再試一次。',
    'An unexpected error occurred while fetching the data': '擷取資料時發生未預期的錯誤'
  },
  scoped: {
    Summary: '摘要',
    // Overview 区块：<span>3</span> Active pull requests（数字在前面的独立元素里）
    'Active pull requests': '個活躍的拉取請求',
    'Active pull request': '個活躍的拉取請求',
    'Active issues': '個活躍的議題',
    'Active issue': '個活躍的議題',
    // 仅在 Pulse 语境下成立的片段（前面紧跟独立元素里的数字）
    'have pushed': '推送了',
    'has pushed': '推送了',
    additions: '行新增',
    addition: '行新增',
    deletions: '行刪除',
    deletion: '行刪除',
    people: '人',
    person: '人',
    merged: '合併於',
    // 条目「#12 opened <时间>」：拉取请求与议题的条目结构相同，繁体两者的 open 都作「建立」，不必区分
    opened: '建立於',
    closed: '關閉於',
    published: '發布於',
    'commented on': '留言於',
    'Unresolved conversations': '個未解決的對話',
    'Unresolved conversation': '個未解決的對話',
    'pull requests merged': '個已合併的拉取請求',
    'pull request merged': '個已合併的拉取請求',
    'pull requests opened': '個已建立的拉取請求',
    'pull request opened': '個已建立的拉取請求',
    'issues closed': '個已關閉的議題',
    'issue closed': '個已關閉的議題',
    'issues opened': '個已建立的議題',
    'issue opened': '個已建立的議題',
    'releases published': '個已發布的發行版本',
    'release published': '個已發布的發行版本',
    // 首字母大写的区块标题（数量为 0 时的旧版写法）
    'Pull requests merged by': '個已合併的拉取請求來自',
    'Pull request merged by': '個已合併的拉取請求來自',
    'Pull requests opened by': '個已建立的拉取請求來自',
    'Pull request opened by': '個已建立的拉取請求來自',
    'Issues closed by': '個已關閉的議題來自',
    'Issue closed by': '個已關閉的議題來自',
    'Issues opened by': '個已建立的議題來自',
    'Issue opened by': '個已建立的議題來自',
    'Releases published by': '個已發布的發行版本來自',
    'Release published by': '個已發布的發行版本來自',
    'Top Committers': '主要提交者',
    // 拼接失败时的单节点兜底
    'changed and there have been': '已變更且共有',
    'new comments': '則新留言',
    'new comment': '則新留言',
    // 旧版提交图提示：<strong>12</strong> commits authored by <strong>octocat</strong>
    'commits authored by': '個提交的作者為',
    'commit authored by': '個提交的作者為',
    // 无数据时的示例条目
    '[Example issue]': '[範例議題]',
    '[Example PR]': '[範例 PR]',
    '[Example discussion]': '[範例討論]',
    'commented on yesterday • -- new comment(s)': '留言於昨天 • -- 則新留言'
  },
  regexp: [
    // 页头日期范围：October 18, 2026 – October 25, 2026
    [new RegExp(`^(${DATE_SOURCE}) [–-] (${DATE_SOURCE})$`), (_, from, to) => `${translateTime(from)} – ${translateTime(to)}`],
    // 周期选项（Pulse：3 days / 1 week / 1 month；复刻页：1 month … 5 years）。24 hours 由 common 的静态词条先行命中
    [new RegExp(`^${DURATION_SOURCE}$`), (_, amount, unit) => translateDuration(amount, unit)],
    // 摘要（数字与单位在同一个 <strong> 里，拼接后匹配；作者是人，量词作「位」）
    [/^([\d,]+) authors?$/, '$1 位作者'],
    [/^([\d,]+) files?$/, '$1 個檔案'],
    [/^to (\S+) and$/, '到 $1 和'],
    [/^On (\S+),$/, '在 $1 上，'],
    // 主要提交者图表提示：12 commits authored by octocat
    [/^([\d,]+) commits? authored by (.+)$/, '$2 撰寫了 $1 個提交'],
    // 未解决对话条目：• 3 new comments
    [/^• ([\d,]+) new comments?$/, '• $1 則新留言'],
    // 空状态
    [
      new RegExp(`^There hasn['’]t been any commit activity on ([\\w.-]+\\/[\\w.-]+) over the last ${DURATION_SOURCE}$`),
      (_, repo, amount, unit) => `${joinCjk('過去', translateDuration(amount, unit))}內 ${repo} 沒有任何提交活動`
    ],
    // 数据加载失败
    [/^(Committer|Diffstat|Overview) data path is not available$/, (_, type) => `${DATA_TYPE[type]}資料路徑無法使用`]
  ]
} satisfies PageDictionary
