import type { PageDictionary } from '../../../core/types'
import { formatDate, joinCjk, MONTH_SOURCE } from '../helpers'
import { ARIA_DATE_SOURCE, COMPACT_DATE_SOURCE, formatMonthYear, translateAriaDate, translateCompactDate } from './time'

/**
 * 评论：评论头部、评论操作菜单、隐藏 / 举报 / 阻止对话框、编辑历史、反应、未登录时的评论提示、评论出错提示。
 * 「Leave a comment」「Block user」「Unblock user」「Report abuse」「contributing guidelines」由其它词典收录。
 * 阻止对话框开头的「Blocking」与议题依赖关系同形：全局词条按本文件的阻止对话框语境译「封鎖」；
 * 议题依赖关系的 Blocking 按术语表作「阻擋」，由 issues/filter.ts、projects/views.ts 的 scoped 键覆盖
 * （拉取请求列表的筛选框经 pulls/list.ts 取用 issues/filter.ts 的词条，同样覆盖）；
 * 个人阻止对话框正文按整句（inline）翻译，在这些页面类型下同样译「封鎖」。
 * 表情别名（heart、rocket、eyes、confused、+1、smile 等）出现在表情选择器与自动补全中，保持英文，不收录。
 */

/** 反应名称（经典页面的 aria-label 与反应摘要） */
const REACTIONS: Readonly<Record<string, string>> = {
  'thumbs up': '讚',
  'thumbs down': '倒讚',
  laugh: '大笑',
  hooray: '歡呼',
  confused: '困惑',
  heart: '愛心',
  rocket: '火箭',
  eyes: '眼睛'
}
const REACTION_SOURCE = '(thumbs up|thumbs down|laugh|hooray|confused|heart|rocket|eyes)'
/** React 反应按钮中的表情字符 */
const EMOJI_SOURCE = '(👍|👎|😄|🎉|😕|❤️|🚀|👀)'

/** 隐藏评论的原因（菜单项为首字母大写，评论头部为小写连字符） */
const HIDE_REASONS: Readonly<Record<string, string>> = {
  Spam: '垃圾內容',
  Abuse: '濫用',
  'Off-topic': '離題',
  'Off Topic': '離題',
  Outdated: '過時',
  Duplicate: '重複',
  Resolved: '已解決',
  'Low quality': '低品質',
  spam: '垃圾內容',
  abuse: '濫用',
  'off-topic': '離題',
  outdated: '過時',
  duplicate: '重複',
  resolved: '已解決',
  'low-quality': '低品質'
}

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  comment: '留言',
  reply: '回覆',
  issue: '議題',
  'pull request': '拉取請求',
  discussion: '討論',
  commit: '提交',
  content: '內容'
}

const LOGIN = '([\\w.-]+(?:\\[bot\\])?)'

/** 反应按钮的上下文：octocat's comment, 7:05 AM today（没有作者时只有 comment, …） */
const REACTION_CONTEXT = `(?:${LOGIN}['’]s )?(comment|review), (${ARIA_DATE_SOURCE})`
const REACTION_SUBJECTS: Readonly<Record<string, string>> = {
  comment: '留言',
  review: '審查'
}

/** 赞助徽章的月份随浏览器语言本地化：January、一月、1月 */
const SPONSOR_MONTH_SOURCE = `${MONTH_SOURCE}|(?:十[一二]?|[一二三四五六七八九])月|(?:1[0-2]|[1-9])月`
const CHINESE_MONTHS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

/** January 2024 / 一月 2024 / 1月 2024 → 2024年1月 */
function sponsorSince(month: string, year: string): string {
  if (!month.endsWith('月')) return formatMonthYear(month, year)
  const name = month.slice(0, -1)
  const index = CHINESE_MONTHS.indexOf(name)
  return formatDate(Number(year), index >= 0 ? index + 1 : Number(name), undefined)
}

/** 中日韩文字与全角标点 */
const CJK_RE = /[⺀-鿿가-힯＀-￯]/u

/** 与中文相邻不加空格，与其它文字相邻加空格 */
function gap(char: string | undefined): string {
  return char && !CJK_RE.test(char) ? ' ' : ''
}

/** 末尾接中文时按需补空格 */
function spaced(text: string): string {
  return `${text}${gap(text.at(-1))}`
}

/** 做出反应的人：You → 你 */
function person(name: string): string {
  return name === 'You' ? '你' : name
}

/** 做出反应的人列表：a, b, and 3 more → a、b 和其他 3 人；a, b and c → a、b 和 c；You and a → 你和 a */
export function formatPeople(list: string): string {
  const names = (text: string): string => text.split(', ').map(person).join('、')
  const more = /^(.+?),? and (\d[\d,]*) more$/.exec(list)
  if (more) return `${spaced(names(more[1]!))}和其他 ${more[2]!} 人`
  const pair = /^(.+?),? and (.+)$/.exec(list)
  if (pair) {
    const left = names(pair[1]!)
    const right = person(pair[2]!)
    return `${left}${gap(left.at(-1))}和${gap(right[0])}${right}`
  }
  return names(list)
}

export default {
  static: {
    // 评论头部
    commented: '留言於',
    replied: '回覆於',
    'via email': '透過電子郵件',
    '– with': '– 透過',
    '— with': '— 透過',
    'Hidden comment': '已隱藏的留言',
    'No description provided.': '未提供描述。',
    // 作者徽章：员工可见的垃圾帐户标记
    Spammy: '疑似垃圾帳號',
    'This user is marked as spammy. Their comments will only show in staff mode.':
      '此使用者已被標示為疑似垃圾帳號。其留言僅在員工模式下顯示。',
    // 评论所指对象已变更：You can also <a>view this object as it appeared at the time of the comment</a>
    'You can also': '你也可以',
    'view this object as it appeared at the time of the comment': '查看此物件在留言當時的版本',

    // 评论操作菜单
    'Comment options': '留言選項',
    'Quote reply': '引用回覆',
    'Copy Markdown': '複製 Markdown',
    'Copy markdown': '複製 Markdown',
    'See in timeline': '在時間軸中查看',
    'Reference in a new issue': '在新議題中參考',
    // 在新议题中引用对话框的字段
    'Issue title': '議題標題',
    'Issue body': '議題內文',
    'Edit comment': '編輯留言',
    'Delete comment': '刪除留言',
    "Are you sure you'd like to delete this comment?": '確定要刪除此留言嗎？',
    'Hide comment': '隱藏留言',
    'Unhide comment': '取消隱藏留言',
    'hide comment': '隱藏留言',
    'show comment': '顯示留言',
    'Show comment': '顯示留言',
    Unhide: '取消隱藏',
    Pin: '釘選',
    Unpin: '取消釘選',
    Report: '檢舉',
    'Report content': '檢舉內容',
    'Close with comment': '留言並關閉',
    Reopen: '重新開啟',
    'Comment must have a URL to be copied': '留言須有 URL 才能複製',

    // 隐藏评论
    Spam: '垃圾內容',
    Abuse: '濫用',
    'Off-topic': '離題',
    'Off Topic': '離題',
    'Off topic': '離題',
    Outdated: '過時',
    Resolved: '已解決',
    'Low quality': '低品質',
    'Choose a reason': '選擇原因',
    'Choose a reason for hiding this comment': '選擇隱藏此留言的原因',
    'The reason will be displayed to others.': '原因會向其他人顯示。',
    'The reason will be displayed to describe this comment to others.': '原因會向其他人顯示，用於說明此留言。',
    'Learn more about hiding comments': '瞭解隱藏留言',
    // 与 Unhide comment（取消隱藏留言）区分
    'Cancel hiding comment': '放棄隱藏留言',

    // 举报：This comment violates <a>@owner's</a> Code of Conduct and should be submitted…
    'Report to repository admins': '向儲存庫管理員檢舉',
    'Report abuse to GitHub support': '向 GitHub 支援團隊檢舉濫用',
    'To repository admins': '向儲存庫管理員',
    'To GitHub support': '向 GitHub 支援團隊',
    'Report submitted': '已送出檢舉',
    'Unable to submit report': '無法送出檢舉',
    'Code of Conduct and should be submitted to the maintainers of this repository for review.': '行為準則，應送交此儲存庫的維護者審查。',
    'This report, as well as your username as the reporter, will be viewable by all admins of this repository.':
      '此儲存庫的所有管理員都能看到此檢舉，也能看到你身為檢舉人的使用者名稱。',
    'requesting that maintainers moderate content.': '請求維護者審核內容。',
    "Contact GitHub Support about this user's spammy or abusive behavior.": '就此使用者的垃圾內容或濫用行為聯絡 GitHub 支援團隊。',
    'reporting abuse to GitHub support': '向 GitHub 支援團隊檢舉濫用',

    // 阻止用户：Blocking <b>@user</b> prevents them … Learn more about <a>blocking a user</a>.
    // 个人阻止对话框正文整句见下方 inline，不命中时按片段拼读
    Blocking: '封鎖',
    'Block options': '封鎖選項',
    // 组织阻止对话框的时长选择：Block a user: <For 7 days>
    'Block a user:': '封鎖使用者：',
    'Send user a notification and show activity in timeline': '通知該使用者並在時間軸中顯示此活動',
    'Until I unblock them': '直到我解除封鎖',
    'Blocking user…': '正在封鎖使用者…',
    'Unable to block user. Please try again.': '無法封鎖使用者。請再試一次。',
    'Content in repositories owned by this organization where you have write access will be closed.':
      '在此組織擁有且你有寫入權限的儲存庫中，相關內容將會關閉。',
    'prevents them from interacting with your repositories, such as opening or commenting on pull requests or issues, starring, forking, or watching. Learn more about':
      '後，對方將無法與你的儲存庫互動，例如建立拉取請求或議題、在其中留言、加星號、分叉或關注。瞭解',
    'Blocking a user prevents them from interacting with repositories of this organization, such as opening or commenting on pull requests or issues. Learn more about':
      '封鎖使用者後，對方將無法與此組織的儲存庫互動，例如建立拉取請求或議題、在其中留言。瞭解',
    'blocking a user': '封鎖使用者',
    'blocking a user.': '封鎖使用者。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. Markdown is supported. All org admins and moderators can see this note.":
      '最多 250 個字元。請勿包含任何個人資訊，例如法定姓名或電子郵件地址。支援 Markdown。所有組織管理員和版主都能看到此備註。',
    // You can notify <b>user</b> as to why they're being blocked. …
    'You can notify': '你可以告知',
    "as to why they're being blocked. A public timeline entry will show that this user was blocked. They will receive an email notification and a notice when they try to comment with the following message:":
      '為何遭到封鎖。公開的時間軸項目將顯示此使用者已遭封鎖。對方會收到電子郵件通知，並在嘗試留言時看到以下訊息：',
    // A maintainer of the @org organization has blocked you because of <a>this content</a>. For more information…
    'this content': '此內容',
    '. For more information please see': '。詳情請參閱',
    'the community guidelines': '社群守則',
    // All of their comments in this organization <a>will be hidden</a> to all users and will display a reason.
    'All of their comments in this organization': '對方在此組織中的所有留言',
    'will be hidden': '將會隱藏',
    'to all users and will display a reason.': '，對所有使用者生效並顯示原因。',
    'Failed to block user': '無法封鎖使用者',
    'Failed to block user from organization': '無法在組織中封鎖使用者',
    'Failed to unblock user from organization': '無法在組織中解除封鎖使用者',

    // 编辑历史：Last edited by <login>、Edits 菜单、查看修订对话框
    Edits: '編輯記錄',
    'Open edits': '開啟編輯記錄',
    'Last edited by': '上次編輯者',
    'edited by': '編輯者',
    'Viewing edit': '正在查看編輯內容',
    'Most recent': '最新',
    'This revision does not contain any content.': '此修訂版本不包含任何內容。',
    'deleted this revision': '刪除了此修訂版本',
    'Delete revision': '刪除修訂版本',
    'Delete revision from history': '從歷史記錄中刪除修訂版本',
    'Delete this edit revision': '刪除此次編輯的修訂版本',
    'Failed to delete this revision': '無法刪除此修訂版本',
    'Are you sure you want to delete this revision from the history?': '確定要從歷史記錄中刪除此修訂版本嗎？',
    'This edit’s content will no longer be visible. This action can not be undone.': '此次編輯的內容將不再顯示。此動作無法復原。',
    // 经典页面（gist 等）的编辑历史：<login> deleted this content（用户名单独成元素时）、(most recent)、(deleted)
    '(most recent)': '（最新）',
    '(deleted)': '（已刪除）',
    'deleted this content': '刪除了此內容',
    'The most recent revision cannot be deleted. Need to delete sensitive information? Go to the specific edit where the information was added.':
      '無法刪除最新的修訂版本。需要刪除敏感資訊？請前往新增該資訊的那次編輯。',
    'This edit’s content will no longer be visible.': '此次編輯的內容將不再顯示。',
    'This edit’s content will no longer be visible': '此次編輯的內容將不再顯示',
    "This edit's content will no longer be visible.": '此次編輯的內容將不再顯示。',
    "This edit's content will no longer be visible": '此次編輯的內容將不再顯示',
    "Couldn't display edit history diff": '無法顯示編輯歷史記錄差異',

    // 反应
    'thumbs up': '讚',
    'thumbs down': '倒讚',
    'Thumbs up': '讚',
    'Thumbs down': '倒讚',
    laugh: '大笑',
    hooray: '歡呼',
    Reactions: '表情回應',
    'All reactions': '所有表情回應',
    'Add reaction': '新增表情回應',
    'Add or remove reactions': '新增或移除表情回應',
    'Pick your reaction': '選擇表情回應',
    'Reactions are currently unavailable': '表情回應目前無法使用',
    'Reacted by': '表情回應來自',
    // 反应摘要（发行版卡片等）：只有自己做出反应时
    'You reacted': '你做出表情回應',

    // 未登录时的评论区
    'Sign up for free': '免費註冊',
    'to join this conversation on GitHub': '以加入 GitHub 上的此對話',
    'to join this conversation on GitHub.': '以加入 GitHub 上的此對話。',
    // 已锁定的对话：Sign up for free to subscribe to this conversation on GitHub. Already have an account?
    'to subscribe to this conversation on GitHub': '以訂閱 GitHub 上的此對話',
    '. Already have an account?': '。已有帳號？',
    'Sign in to comment': '登入後留言',
    'Remember, contributions to this repository should follow its': '請記得，對此儲存庫的貢獻應遵守其',
    // 仓库没有行为准则时：… should follow our <a>GitHub Community Guidelines</a>.
    'Remember, contributions to this repository should follow our': '請記得，對此儲存庫的貢獻應遵守我們的',
    'GitHub Community Guidelines': 'GitHub 社群守則',
    'code of conduct': '行為準則',
    'security policy': '安全性政策',

    // 底部赞助提示：Show your support for <strong>octocat</strong> by sponsoring them.
    'Show your support for': '贊助',
    'by sponsoring them.': '以示支持。',

    // 无法评论的原因与评论出错
    'You do not have permissions to comment.': '你沒有留言權限。',
    'This repository has been archived.': '此儲存庫已封存。',
    'This repository is being migrated.': '此儲存庫正在移轉。',
    // 锁定横幅：This conversation has been locked as <strong>off-topic</strong> and limited to collaborators.
    // 整句见下方 inline；不命中时按片段拼读：此對話已鎖定為 離題 並限制為僅協作者可留言。
    'This conversation has been locked as': '此對話已鎖定為',
    'and limited to collaborators.': '並限制為僅協作者可留言。',
    'Continue editing your comment…': '繼續編輯留言…',
    'new Comment': '新留言',
    // 两句之间原文是句号，不改逗号
    'There was a problem saving your comment. Please try again.': '儲存留言時發生問題。請再試一次。',
    'There was a problem saving your comment. Please reload the page and try again.': '儲存留言時發生問題。請重新載入頁面後再試一次。',
    'Could not edit issue comment': '無法編輯議題留言',
    'Could not update issue comment': '無法更新議題留言',
    'Could not delete this comment': '無法刪除此留言',
    'Could not add reaction. Please try again.': '無法新增表情回應。請再試一次。',
    'Could not subscribe. Please try again.': '無法訂閱。請再試一次。',
    'Could not unsubscribe. Please try again.': '無法取消訂閱。請再試一次。',

    // 线程订阅
    Unsubscribe: '取消訂閱',
    'You’re not receiving notifications from this thread.': '你不會收到此討論串的通知。',
    // 从通知邮件退订后的横幅
    'You’ve been unsubscribed from this thread.': '你已取消訂閱此討論串。'
  },
  regexp: [
    // 评论操作按钮：Actions for octocat's comment, 7:05 AM on October 19
    [
      new RegExp(`^Actions for ${LOGIN}['’]s (comment|reply), (${ARIA_DATE_SOURCE})$`),
      (_, login: string, kind: string, date: string) => `${login} 的${CONTENT_TYPES[kind]!}動作，${translateAriaDate(date)}`
    ],
    // 评论头部的读屏标题 octocat commented <relative-time>：整句匹配，免得用户名（如 today）被单独翻译。
    // 后接时间元素，与片段 commented、replied 同译「留言於 / 回覆於」（与 pulls/comments.ts 的行内句一致）
    [
      new RegExp(`^${LOGIN} (commented|replied)$`),
      (_, login: string, verb: string) => `${login} ${verb === 'commented' ? '留言於' : '回覆於'}`
    ],
    // 评论头部：头像链接 @octocat's profile；赞助徽章 octo-org's sponsor since January 2024（月份随浏览器语言）
    [new RegExp(`^@${LOGIN}['’]s profile$`), '@$1 的個人檔案'],
    [
      new RegExp(`^([\\w.-]+)['’]s sponsor since (${SPONSOR_MONTH_SOURCE}) (\\d{4})$`),
      (_, owner: string, month: string, year: string) => `${joinCjk('自', sponsorSince(month, year))}起贊助 ${owner}`
    ],
    [
      /^Hide comment as (Spam|Abuse|Off-topic|Off Topic|Outdated|Duplicate|Resolved|Low quality)$/,
      (_, reason: string) => `以${HIDE_REASONS[reason]!}為由隱藏留言`
    ],
    // 评论头部：Hidden as off-topic
    [
      /^Hidden as (spam|abuse|off-topic|outdated|duplicate|resolved|low-quality)$/,
      (_, reason: string) => `因${HIDE_REASONS[reason]!}而隱藏`
    ],
    [/^Report (comment|reply|issue|pull request|discussion)$/, (_, type: string) => `檢舉${CONTENT_TYPES[type]!}`],
    [/^Unable to submit report: (.+)$/, '無法送出檢舉：$1'],
    // 举报对话框：Where would you like to report this comment to? / This comment violates <a>@owner's</a> …
    [
      /^Where would you like to report this (comment|issue|pull request|content) to\?$/,
      (_, type: string) => `你要向誰檢舉此${CONTENT_TYPES[type]!}？`
    ],
    [/^This (comment|issue|pull request|content) violates$/, (_, type: string) => `此${CONTENT_TYPES[type]!}違反了`],
    [/^@([\w-]+)['’]s$/, '@$1 的'],
    [
      /^Choose a reason for reporting this (comment|issue|pull request|content)$/,
      (_, type: string) => `選擇檢舉此${CONTENT_TYPES[type]!}的原因`
    ],

    // 经典页面的编辑历史对话框：octocat's edit / octocat deleted this content <relative-time>.
    [new RegExp(`^${LOGIN}['’]s edit$`), '$1 的編輯'],
    [new RegExp(`^${LOGIN} deleted this content$`), '$1 刪除了此內容'],
    // 编辑历史对话框头部的头像链接
    [/^View profile for @([\w-]+)$/, '查看 @$1 的個人檔案'],

    // 阻止对话框
    [/^Block @([\w-]+)$/, '封鎖 @$1'],
    [/^Unblock @([\w-]+)$/, '解除封鎖 @$1'],
    [/^Block ([\w-]+) from ([\w.-]+)$/, '在 $2 中封鎖 $1'],
    [/^Unblock ([\w-]+) from ([\w.-]+)$/, '在 $2 中解除封鎖 $1'],
    [/^For (\d+) days?$/, '$1 天'],
    [
      /^Block a user: (?:For (\d+) days?|Until I unblock them)$/,
      (_, days: string | undefined) => `封鎖使用者：${days ? `${days} 天` : '直到我解除封鎖'}`
    ],
    [/^Are you sure you want to unblock @([\w-]+)\?$/, '確定要解除封鎖 @$1 嗎？'],
    // A maintainer of the @org organization has blocked you because of <a>this content</a>. …
    [/^A maintainer of the @([\w.-]+) organization has blocked you because of$/, '@$1 組織的一位維護者封鎖你的原因是'],

    // 无法评论：You do not have permissions to comment on this issue.
    [
      /^You do not have permissions to comment on this (issue|pull request|discussion|commit)\.$/,
      (_, type: string) => `你沒有在此${CONTENT_TYPES[type]!}留言的權限。`
    ],
    // 经典页面保存评论出错：There was an error posting your comment: <服务器返回的原因>
    [/^There was an error posting your comment: (.+)$/, '張貼留言時發生錯誤：$1'],

    // 反应（经典页面）：react with heart、octocat and monalisa reacted with laugh emoji
    [new RegExp(`^react with ${REACTION_SOURCE}$`), (_, name: string) => `以${REACTIONS[name]!}表情回應`],
    [
      new RegExp(`^(.+?) reacted with ${REACTION_SOURCE} emoji$`),
      (_, people: string, name: string) => `${spaced(formatPeople(people))}以${REACTIONS[name]!}表情回應`
    ],
    [
      new RegExp(`^${REACTION_SOURCE} \\((\\d[\\d,]*)\\): (.+?), (${COMPACT_DATE_SOURCE})$`),
      (_, name: string, count: string, author: string, date: string) =>
        `${REACTIONS[name]!} (${count})：${author}，${translateCompactDate(date)}`
    ],
    [/^(\d[\d,]*) (?:people|person) reacted$/, '$1 人做出表情回應'],
    // 反应摘要（发行版卡片等）：自己与他人都做出反应时
    [/^You and (\d[\d,]*) others? reacted$/, '你和其他 $1 人做出表情回應'],

    // 反应（React）：👍 4 reactions、React with 👀、Reacted by a, b and c、+3 more people
    [new RegExp(`^${EMOJI_SOURCE} (\\d[\\d,]*) reactions?$`), '$1 $2 個表情回應'],
    [
      new RegExp(`^(React|Unreact) with ${EMOJI_SOURCE}$`),
      (_, verb: string, emoji: string) => (verb === 'React' ? `以 ${emoji} 表情回應` : `取消 ${emoji} 表情回應`)
    ],
    [new RegExp(`^People who reacted with ${EMOJI_SOURCE}$`), '以 $1 表情回應的人'],
    [/^Reacted by (.+)$/, (_, people: string) => `${spaced(formatPeople(people))}做出表情回應`],
    [/^\+(\d[\d,]*) more (?:people|person)$/, '還有 $1 人'],
    // 反应按钮与反应栏的上下文（拉取请求差异评论等）：React to octocat's comment, 7:05 AM today
    [
      new RegExp(`^React to ${REACTION_CONTEXT}$`),
      (_, login: string | undefined, kind: string, date: string) =>
        `為${login ? ` ${login} 的` : ''}${REACTION_SUBJECTS[kind]!}新增表情回應，${translateAriaDate(date)}`
    ],
    [
      new RegExp(`^Reactions are currently unavailable for ${REACTION_CONTEXT}$`),
      (_, login: string | undefined, kind: string, date: string) =>
        `${login ? `${login} ` : ''}${REACTION_SUBJECTS[kind]!}的表情回應目前無法使用，${translateAriaDate(date)}`
    ],
    [
      new RegExp(`^Reactions for ${REACTION_CONTEXT}$`),
      (_, login: string | undefined, kind: string, date: string) =>
        `${login ? `${login} ` : ''}${REACTION_SUBJECTS[kind]!}的表情回應，${translateAriaDate(date)}`
    ]
  ],
  inline: [
    // 组织取消阻止对话框（Dialog.Body）：Are you sure you want to unblock <strong>user</strong> from <strong>org</strong>?
    // 个人取消阻止对话框（Are you sure you want to unblock @user?）没有元素子节点，由上面的正则处理
    ['Are you sure you want to unblock {} from {}?', '確定要解除 {} 在 {} 中的封鎖嗎？'],
    // 个人阻止对话框正文：Blocking <strong>@user</strong> prevents them … Learn more about <a>blocking a user</a>.
    // 按整句翻译：开头的 Blocking 不受页面词典 scoped 键（议题依赖关系）影响；链接文字由 static 翻译
    [
      'Blocking {} prevents them from interacting with your repositories, such as opening or commenting on pull requests or issues, starring, forking, or watching. Learn more about {}.',
      '封鎖 {} 後，對方將無法與你的儲存庫互動，例如建立拉取請求或議題、在其中留言、加星號、分叉或關注。瞭解{}。'
    ],
    // 经典拉取请求页的锁定横幅：This conversation has been locked as <strong>原因</strong> and limited to collaborators.
    // 前后的图标等元素原样带回；原因作“因…而”（同 Hidden as），原因词由 pulls 词典翻译，两侧不留空格
    [
      /^(\{\}*)This conversation has been locked as \{\} and limited to collaborators\.(\{\}*)$/,
      '$1 此對話已因{}而鎖定並限制為僅協作者可留言。$2'
    ]
  ]
} satisfies PageDictionary
