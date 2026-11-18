import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, formatDate, joinCjk, translateTime } from '../helpers'

/** 月份全称 → 月份数字（贡献图提示、时间轴标题） */
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

/** 贡献图月份与星期标签：全称（读屏）与缩写（可见）都收录；月份格式由 helpers 生成（1 月），星期缩写作「週一」 */
const CALENDAR_LABELS: Readonly<Record<string, string>> = Object.fromEntries([
  ...Object.entries(MONTH_NUMBERS).map(([name, month]) => [name, formatDate(undefined, month, undefined)]),
  ...MONTH_SHORT.map((name, index) => [name, formatDate(undefined, index + 1, undefined)]),
  ...WEEKDAYS.map((name, index) => [name, `星期${WEEKDAY_NAMES[index]}`]),
  ...WEEKDAYS.map((name, index) => [name.slice(0, 3), `週${WEEKDAY_NAMES[index]}`])
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
 * 贡献图、贡献设定、活动总览、贡献活动时间轴。
 * 数字计数（N commits、N comments 等）与日期（Oct 18、October 2026）由 common-ui 的通用规则翻译。
 */
export default {
  static: {
    // 贡献图
    'Skip to contributions year list': '跳至貢獻年份清單',
    'Contribution Graph': '貢獻圖表',
    'Day of Week': '星期',
    'Learn how we count contributions': '瞭解我們如何計算貢獻',
    'No contributions.': '沒有貢獻。',
    'Low contributions.': '貢獻較少。',
    'Medium-low contributions.': '貢獻中等偏少。',
    'Medium-high contributions.': '貢獻中等偏多。',
    'High contributions.': '貢獻較多。',
    // 窄屏的年份选择
    'Year:': '年份：',

    // 贡献设定（本人主页）
    'Contribution settings': '貢獻設定',
    'Private contributions': '私人貢獻',
    'Turning on private contributions will show anonymized private activity on your profile.':
      '開啟私人貢獻將在你的個人檔案中顯示匿名化的私人活動。',
    'Turning off private contributions will show only public activity on your profile.': '關閉私人貢獻將在你的個人檔案中只顯示公開活動。',
    'Turning on the activity overview will show an overview of your activity across organizations and repositories.':
      '開啟活動總覽將顯示你在各組織和儲存庫中的活動總覽。',
    'Turning off the activity overview will hide the section on your profile.': '關閉活動總覽將在你的個人檔案中隱藏此區段。',
    'Visitors will now see your public and anonymized private contributions.': '訪客現在會看到你的公開貢獻和匿名化的私人貢獻。',
    'Visitors will now see only your public contributions.': '訪客現在只會看到你的公開貢獻。',
    "Others will now see 'Activity overview' when they view your profile.": '其他人查看你的個人檔案時將看到「活動總覽」。',
    'Others will now see ‘Activity overview’ when they view your profile.': '其他人查看你的個人檔案時將看到「活動總覽」。',
    "The 'Activity overview' section will no longer appear on your profile.": '「活動總覽」區段將不再出現在你的個人檔案中。',
    'The ‘Activity overview’ section will no longer appear on your profile.': '「活動總覽」區段將不再出現在你的個人檔案中。',

    // 活动总览
    'Activity overview': '活動總覽',
    'Contributed to': '貢獻於',
    // 依组织筛选后：Activity in <组织>
    'Activity in': '活動於',
    'No activity overview available.': '尚無活動總覽。',

    // 贡献活动时间轴
    'Contribution activity': '貢獻活動',
    'Show more activity': '顯示更多活動',
    'Created a pull request in': '建立了拉取請求於',
    'Created an issue in': '建立了議題於',
    'lines changed': '行變更',
    'Some pull requests not shown.': '部分拉取請求未顯示。',
    'Some issues not shown.': '部分議題未顯示。',
    'Created their first repository': '建立了第一個儲存庫',
    'First repository': '第一個儲存庫',
    'Opened their first pull request on GitHub in': '在 GitHub 上首次建立拉取請求於',
    'Opened their first pull request on GitHub in a private repository': '在 GitHub 上首次建立拉取請求於私人儲存庫',
    'First pull request': '第一個拉取請求',
    'Opened their first issue on GitHub in': '在 GitHub 上首次建立議題於',
    'Opened their first issue on GitHub in a private repository': '在 GitHub 上首次建立議題於私人儲存庫',
    'a private repository': '私人儲存庫',
    'First issue': '第一個議題',
    'Joined GitHub': '加入 GitHub',
    'This repository is public': '此儲存庫為公開儲存庫',
    'This repository is private': '此儲存庫為私人儲存庫'
  },
  scoped: {
    ...CALENDAR_LABELS,
    // 图例「Less … More」；More 由 common 译为「更多」
    Less: '較少',
    // 活动总览的组织筛选
    'Search by name': '依名稱搜尋',
    'No organizations found': '找不到組織',
    // 拉取请求 / 议题分组中数字后的状态词（计数作定语：3 個已合併、1 個開放中）
    merged: '個已合併',
    open: '個開放中',
    closed: '個已關閉',
    'Joined the': '加入了'
  },
  regexp: [
    // 贡献图标题与提示；依组织筛选后带「in <组织>」
    [new RegExp(`^${NUM} contributions? in the last year$`), '過去一年共 $1 次貢獻'],
    [new RegExp(`^${NUM} contributions? in the last year in ${ORG}$`), '過去一年在 $2 中共 $1 次貢獻'],
    [new RegExp(`^${NUM} contributions? in (\\d{4})$`), '$2年共 $1 次貢獻'],
    [new RegExp(`^${NUM} contributions? in (\\d{4}) in ${ORG}$`), '$2年在 $3 中共 $1 次貢獻'],
    [
      new RegExp(`^${NUM} contributions? on (${MONTH_FULL_SOURCE}) (\\d{1,2})(?:st|nd|rd|th)\\.$`),
      (_, count, month, day) => joinCjk(monthDay(month, day), `有 ${count} 次貢獻。`)
    ],
    [
      new RegExp(`^No contributions on (${MONTH_FULL_SOURCE}) (\\d{1,2})(?:st|nd|rd|th)\\.$`),
      (_, month, day) => joinCjk(monthDay(month, day), '沒有貢獻。')
    ],
    [/^Contribution activity in (\d{4}), (\d+) of (\d+)$/, '$1年貢獻活動，$3 項中的第 $2 項'],

    // 活动总览
    [new RegExp(`^and ${NUM} other ${REPOS}$`), '和其他 $1 個儲存庫'],

    // 时间轴分组标题（议题、拉取请求的 open 作「建立」）
    [new RegExp(`^Created ${NUM} commits? in ${NUM} ${REPOS}$`), '在 $2 個儲存庫中建立了 $1 個提交'],
    [new RegExp(`^Created ${NUM} (other )?${REPOS}$`), (_, count, other) => `建立了 ${count} 個${other ? '其他' : ''}儲存庫`],
    [
      new RegExp(`^Opened ${NUM} (other )?pull requests? in ${NUM} ${REPOS}$`),
      (_, count, other, repos) => `在 ${repos} 個儲存庫中建立了 ${count} 個${other ? '其他' : ''}拉取請求`
    ],
    [
      new RegExp(`^Opened ${NUM} (other )?issues? in ${NUM} ${REPOS}$`),
      (_, count, other, repos) => `在 ${repos} 個儲存庫中建立了 ${count} 個${other ? '其他' : ''}議題`
    ],
    [new RegExp(`^Reviewed ${NUM} pull requests? in ${NUM} ${REPOS}$`), '在 $2 個儲存庫中審查了 $1 個拉取請求'],
    [
      new RegExp(`^Started ${NUM} (other )?discussions? in ${NUM} ${REPOS}$`),
      (_, count, other, repos) => `在 ${repos} 個儲存庫中發起了 ${count} 個${other ? '其他' : ''}討論`
    ],
    [new RegExp(`^Answered ${NUM} discussions? in ${NUM} ${REPOS}$`), '在 $2 個儲存庫中回答了 $1 個討論'],
    [new RegExp(`^${NUM} ${REPOS} not shown$`), '另有 $1 個儲存庫未顯示'],
    [new RegExp(`^${NUM} contributions? in private repositories$`), '私人儲存庫中的 $1 次貢獻'],

    // 时间轴条目；that received … 前接「建立了拉取請求於」与储存库链接，用「並」承接
    [new RegExp(`^that received ${NUM} comments?$`), '並收到 $1 則留言'],
    [
      new RegExp(`^Created (a pull request|an issue) in ([\\w.-]+/[\\w.-]+) that received ${NUM} comments?$`),
      (_, kind, repo, count) => `在 ${repo} 中建立的${kind === 'an issue' ? '議題' : '拉取請求'}收到 ${count} 則留言`
    ],
    [/^Joined the ([\w.-]+) organization$/, '加入了 $1 組織'],
    [/^(\d+) of (\d+) tasks?$/, '$2 項工作中已完成 $1 項'],
    [/^(\d+) tasks?$/, '$1 項工作'],
    [/^Progress: (\d+(?:\.\d+)?%)$/, '進度：$1'],
    [
      new RegExp(`^(\\d{1,3})% of commits in (${MONTH_FULL_SOURCE}) were made to ([\\w.-]+/[\\w.-]+)$`),
      (_, percent, month, repo) => joinCjk(monthName(month), `的提交中有 ${percent}% 提交至 ${repo}`)
    ],
    // 私人储存库中的贡献
    [/^Only people who can see (\S+) can see this contribution$/, '只有能查看 $1 的人才能看到此貢獻'],
    // 无活动：<使用者> has no activity yet for this period. / had no activity in <组织> during this period.
    [/^(\S+) has no activity yet for this period\.$/, '$1 在此期間尚無活動。'],
    [/^(\S+) had no activity during this period\.$/, '$1 在此期間沒有活動。'],
    [new RegExp(`^(\\S+) has no activity in ${ORG} yet for this period\\.$`), '$1 在此期間於 $2 尚無活動。'],
    [new RegExp(`^(\\S+) had no activity in ${ORG} during this period\\.$`), '$1 在此期間於 $2 沒有活動。'],
    // 非可见度义的 private 作「不公開」（与「不公開我的電子郵件地址」一致）
    [/^@([\w-]+)[’']s activity is private$/, '@$1 的活動不公開'],

    // 日期：贡献日期、私人贡献日期范围（单个日期由 common-ui 翻译）
    [new RegExp(`^This contribution was made on (${DATE_SOURCE})$`), (_, date) => joinCjk('此貢獻發生於', translateTime(date))],
    [new RegExp(`^(${DATE_SOURCE}) – (${DATE_SOURCE})$`), (_, from, to) => `${translateTime(from)} – ${translateTime(to)}`],
    // 载入更多活动时的页面标题：user (Name) / September 2026
    [new RegExp(`^(.+?) / (${MONTH_FULL_SOURCE}) (\\d{4})$`), (_, who, month, year) => `${who} / ${monthName(month, year)}`]
  ],
  ignore: [
    // 时间轴中的拉取请求 / 议题正文摘录
    '.contribution-activity-listing .Box p'
  ],
  // 时间轴月份标题：<span data-sr-feedback>October <span>2026</span></span>，合并后由 common-ui 的日期规则翻译
  mergeText: ['h3 > span[data-sr-feedback]']
} satisfies PageDictionary
