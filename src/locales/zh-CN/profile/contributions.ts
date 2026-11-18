import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, formatDate, joinCjk, translateTime } from '../helpers'

/** 月份全称 → 月份数字（贡献图提示、时间线标题） */
const MONTH_NUMBERS: Readonly<Record<string, number>> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12
}

const MONTH_FULL_SOURCE = Object.keys(MONTH_NUMBERS).join('|')
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'] as const

/** 贡献图月份与星期标签：全称（读屏）与缩写（可见）都收录；月份格式由 helpers 生成（1 月） */
const CALENDAR_LABELS: Readonly<Record<string, string>> = Object.fromEntries([
  ...Object.entries(MONTH_NUMBERS).map(([name, month]) => [name, formatDate(undefined, month, undefined)]),
  ...MONTH_SHORT.map((name, index) => [name, formatDate(undefined, index + 1, undefined)]),
  ...WEEKDAYS.map((name, index) => [name, `星期${WEEKDAY_NAMES[index]}`]),
  ...WEEKDAYS.map((name, index) => [name.slice(0, 3), `周${WEEKDAY_NAMES[index]}`])
])

const NUM = '(\\d[\\d,]*)'
const REPOS = 'repositor(?:y|ies)'
/** 组织登录名 */
const ORG = '([\\w.-]+)'

/** 月份全称 → 10 月；year 给出时 → 2026年10月；不在表中时原样返回 */
function monthName(month: string, year?: string): string {
  const number = MONTH_NUMBERS[month]
  if (number === undefined) return year === undefined ? month : `${month} ${year}`
  return formatDate(year === undefined ? undefined : Number(year), number, undefined)
}

/** October 28 → 10月28日 */
function monthDay(month: string, day: string): string {
  const number = MONTH_NUMBERS[month]
  return number === undefined ? `${month} ${day}` : formatDate(undefined, number, Number(day))
}

/**
 * 贡献图、贡献设置、活动概述、贡献活动时间线。
 * 数字计数（N commits、N comments 等）与日期（Oct 18、October 2026）由 common-ui 的通用规则翻译。
 */
export default {
  static: {
    // 贡献图
    'Skip to contributions year list': '跳到贡献年份列表',
    'Contribution Graph': '贡献图',
    'Day of Week': '星期',
    'Learn how we count contributions': '了解我们如何统计贡献',
    'No contributions.': '无贡献。',
    'Low contributions.': '贡献较少。',
    'Medium-low contributions.': '贡献中等偏少。',
    'Medium-high contributions.': '贡献中等偏多。',
    'High contributions.': '贡献较多。',
    // 窄屏的年份选择
    'Year:': '年份：',

    // 贡献设置（本人主页）
    'Contribution settings': '贡献设置',
    'Private contributions': '私密贡献',
    'Turning on private contributions will show anonymized private activity on your profile.':
      '开启私密贡献将在你的个人资料中显示匿名化的私密活动。',
    'Turning off private contributions will show only public activity on your profile.': '关闭私密贡献将在你的个人资料中只显示公开活动。',
    'Turning on the activity overview will show an overview of your activity across organizations and repositories.':
      '开启活动概述将显示你在各组织和存储库中的活动概述。',
    'Turning off the activity overview will hide the section on your profile.': '关闭活动概述将在你的个人资料中隐藏此部分。',
    'Visitors will now see your public and anonymized private contributions.': '访客现在会看到你的公开贡献和匿名化的私密贡献。',
    'Visitors will now see only your public contributions.': '访客现在只会看到你的公开贡献。',
    "Others will now see 'Activity overview' when they view your profile.": '其他人查看你的个人资料时将看到“活动概述”。',
    'Others will now see ‘Activity overview’ when they view your profile.': '其他人查看你的个人资料时将看到“活动概述”。',
    "The 'Activity overview' section will no longer appear on your profile.": '“活动概述”部分将不再显示在你的个人资料中。',
    'The ‘Activity overview’ section will no longer appear on your profile.': '“活动概述”部分将不再显示在你的个人资料中。',

    // 活动概述
    'Activity overview': '活动概述',
    'Contributed to': '贡献于',
    // 按组织筛选后：Activity in <组织>
    'Activity in': '活动于',
    'No activity overview available.': '暂无活动概述。',

    // 贡献活动时间线
    'Contribution activity': '贡献活动',
    'Show more activity': '显示更多活动',
    'Created a pull request in': '创建了拉取请求于',
    'Created an issue in': '创建了议题于',
    'lines changed': '行更改',
    'Some pull requests not shown.': '部分拉取请求未显示。',
    'Some issues not shown.': '部分议题未显示。',
    'Created their first repository': '创建了第一个存储库',
    'First repository': '第一个存储库',
    'Opened their first pull request on GitHub in': '在 GitHub 上首次创建拉取请求于',
    'Opened their first pull request on GitHub in a private repository': '在 GitHub 上首次创建拉取请求于一个专用存储库',
    'First pull request': '第一个拉取请求',
    'Opened their first issue on GitHub in': '在 GitHub 上首次打开议题于',
    'Opened their first issue on GitHub in a private repository': '在 GitHub 上首次打开议题于一个专用存储库',
    'a private repository': '一个专用存储库',
    'First issue': '第一个议题',
    'Joined GitHub': '加入 GitHub',
    'This repository is public': '此存储库为公共存储库',
    'This repository is private': '此存储库为专用存储库'
  },
  scoped: {
    ...CALENDAR_LABELS,
    // 图例「Less … More」；More 由 common 译为“更多”
    Less: '较少',
    // 活动概述的组织筛选
    'Search by name': '按名称搜索',
    'No organizations found': '未找到组织',
    // 拉取请求 / 议题分组中数字后的状态词（计数作定语：3 个已合并的、1 个打开的）
    merged: '个已合并的',
    open: '个打开的',
    closed: '个已关闭的',
    'Joined the': '加入了'
  },
  regexp: [
    // 贡献图标题与提示；按组织筛选后带「in <组织>」
    [new RegExp(`^${NUM} contributions? in the last year$`), '过去一年共 $1 次贡献'],
    [new RegExp(`^${NUM} contributions? in the last year in ${ORG}$`), '过去一年在 $2 中共 $1 次贡献'],
    [new RegExp(`^${NUM} contributions? in (\\d{4})$`), '$2年共 $1 次贡献'],
    [new RegExp(`^${NUM} contributions? in (\\d{4}) in ${ORG}$`), '$2年在 $3 中共 $1 次贡献'],
    [
      new RegExp(`^${NUM} contributions? on (${MONTH_FULL_SOURCE}) (\\d{1,2})(?:st|nd|rd|th)\\.$`),
      (_, count, month, day) => joinCjk(monthDay(month, day), `有 ${count} 次贡献。`)
    ],
    [
      new RegExp(`^No contributions on (${MONTH_FULL_SOURCE}) (\\d{1,2})(?:st|nd|rd|th)\\.$`),
      (_, month, day) => joinCjk(monthDay(month, day), '没有贡献。')
    ],
    [/^Contribution activity in (\d{4}), (\d+) of (\d+)$/, '$1年贡献活动，$3 项中的第 $2 项'],

    // 活动概述
    [new RegExp(`^and ${NUM} other ${REPOS}$`), '以及其他 $1 个存储库'],

    // 时间线分组标题
    [new RegExp(`^Created ${NUM} commits? in ${NUM} ${REPOS}$`), '在 $2 个存储库中创建了 $1 个提交'],
    [new RegExp(`^Created ${NUM} (other )?${REPOS}$`), (_, count, other) => `创建了 ${count} 个${other ? '其他' : ''}存储库`],
    [
      new RegExp(`^Opened ${NUM} (other )?pull requests? in ${NUM} ${REPOS}$`),
      (_, count, other, repos) => `在 ${repos} 个存储库中创建了 ${count} 个${other ? '其他' : ''}拉取请求`
    ],
    [
      new RegExp(`^Opened ${NUM} (other )?issues? in ${NUM} ${REPOS}$`),
      (_, count, other, repos) => `在 ${repos} 个存储库中打开了 ${count} 个${other ? '其他' : ''}议题`
    ],
    [new RegExp(`^Reviewed ${NUM} pull requests? in ${NUM} ${REPOS}$`), '在 $2 个存储库中审查了 $1 个拉取请求'],
    [
      new RegExp(`^Started ${NUM} (other )?discussions? in ${NUM} ${REPOS}$`),
      (_, count, other, repos) => `在 ${repos} 个存储库中发起了 ${count} 个${other ? '其他' : ''}讨论`
    ],
    [new RegExp(`^Answered ${NUM} discussions? in ${NUM} ${REPOS}$`), '在 $2 个存储库中回答了 $1 个讨论'],
    [new RegExp(`^${NUM} ${REPOS} not shown$`), '另有 $1 个存储库未显示'],
    [new RegExp(`^${NUM} contributions? in private repositories$`), '专用存储库中的 $1 次贡献'],

    // 时间线条目
    [new RegExp(`^that received ${NUM} comments?$`), '收到 $1 条评论'],
    [
      new RegExp(`^Created (a pull request|an issue) in ([\\w.-]+/[\\w.-]+) that received ${NUM} comments?$`),
      (_, kind, repo, count) => `在 ${repo} 中创建的${kind === 'an issue' ? '议题' : '拉取请求'}收到 ${count} 条评论`
    ],
    [/^Joined the ([\w.-]+) organization$/, '加入了 $1 组织'],
    [/^(\d+) of (\d+) tasks?$/, '$2 个任务中已完成 $1 个'],
    [/^(\d+) tasks?$/, '$1 个任务'],
    [/^Progress: (\d+(?:\.\d+)?%)$/, '进度：$1'],
    [
      new RegExp(`^(\\d{1,3})% of commits in (${MONTH_FULL_SOURCE}) were made to ([\\w.-]+/[\\w.-]+)$`),
      (_, percent, month, repo) => joinCjk(monthName(month), `的提交中有 ${percent}% 提交到 ${repo}`)
    ],
    // 专用存储库中的贡献
    [/^Only people who can see (\S+) can see this contribution$/, '只有能查看 $1 的人才能看到此贡献'],
    // 无活动：<用户> has no activity yet for this period. / had no activity in <组织> during this period.
    [/^(\S+) has no activity yet for this period\.$/, '$1 在此期间暂无活动。'],
    [/^(\S+) had no activity during this period\.$/, '$1 在此期间没有活动。'],
    [new RegExp(`^(\\S+) has no activity in ${ORG} yet for this period\\.$`), '$1 在此期间暂未在 $2 中活动。'],
    [new RegExp(`^(\\S+) had no activity in ${ORG} during this period\\.$`), '$1 在此期间未在 $2 中活动。'],
    // 非可见性义的 private 作“私密”（与“将个人资料设为私密并隐藏活动”一致）
    [/^@([\w-]+)[’']s activity is private$/, '@$1 的活动为私密'],

    // 日期：贡献日期、私密贡献日期范围（单个日期由 common-ui 翻译）
    [new RegExp(`^This contribution was made on (${DATE_SOURCE})$`), (_, date) => joinCjk('此贡献发生于', translateTime(date))],
    [new RegExp(`^(${DATE_SOURCE}) – (${DATE_SOURCE})$`), (_, from, to) => `${translateTime(from)} – ${translateTime(to)}`],
    // 加载更多活动时的页面标题：user (Name) / September 2026
    [new RegExp(`^(.+?) / (${MONTH_FULL_SOURCE}) (\\d{4})$`), (_, who, month, year) => `${who} / ${monthName(month, year)}`]
  ],
  ignore: [
    // 时间线中的拉取请求 / 议题正文摘录
    '.contribution-activity-listing .Box p'
  ],
  // 时间线月份标题：<span data-sr-feedback>October <span>2026</span></span>，合并后由 common-ui 的日期规则翻译
  mergeText: ['h3 > span[data-sr-feedback]']
} satisfies PageDictionary
