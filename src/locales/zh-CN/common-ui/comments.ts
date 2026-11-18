import type { PageDictionary } from '../../../core/types'
import { formatDate, joinCjk, MONTH_SOURCE } from '../helpers'
import { ARIA_DATE_SOURCE, COMPACT_DATE_SOURCE, formatMonthYear, translateAriaDate, translateCompactDate } from './time'

/**
 * 评论：评论头部、评论操作菜单、隐藏 / 举报 / 阻止对话框、编辑历史、反应、未登录时的评论提示、评论出错提示。
 * 「Leave a comment」「Block user」「Unblock user」「Report abuse」「contributing guidelines」由其它词典收录。
 * 阻止对话框开头的「Blocking」与议题依赖关系同形，两处都译“阻止”；个人阻止对话框正文按整句（inline）翻译。
 * 表情别名（heart、rocket、eyes、confused、+1、smile 等）出现在表情选择器与自动补全中，保持英文，不收录。
 */

/** 反应名称（经典页面的 aria-label 与反应摘要） */
const REACTIONS: Readonly<Record<string, string>> = {
  'thumbs up': '点赞',
  'thumbs down': '点踩',
  laugh: '大笑',
  hooray: '欢呼',
  confused: '困惑',
  heart: '爱心',
  rocket: '火箭',
  eyes: '眼睛'
}
const REACTION_SOURCE = '(thumbs up|thumbs down|laugh|hooray|confused|heart|rocket|eyes)'
/** React 反应按钮中的表情字符 */
const EMOJI_SOURCE = '(👍|👎|😄|🎉|😕|❤️|🚀|👀)'

/** 隐藏评论的原因（菜单项为首字母大写，评论头部为小写连字符） */
const HIDE_REASONS: Readonly<Record<string, string>> = {
  Spam: '垃圾信息',
  Abuse: '滥用',
  'Off-topic': '偏离主题',
  'Off Topic': '偏离主题',
  Outdated: '过时',
  Duplicate: '重复',
  Resolved: '已解决',
  'Low quality': '低质量',
  spam: '垃圾信息',
  abuse: '滥用',
  'off-topic': '偏离主题',
  outdated: '过时',
  duplicate: '重复',
  resolved: '已解决',
  'low-quality': '低质量'
}

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  comment: '评论',
  reply: '回复',
  issue: '议题',
  'pull request': '拉取请求',
  discussion: '讨论',
  commit: '提交',
  content: '内容'
}

const LOGIN = '([\\w.-]+(?:\\[bot\\])?)'

/** 反应按钮的上下文：octocat's comment, 7:05 AM today（没有作者时只有 comment, …） */
const REACTION_CONTEXT = `(?:${LOGIN}['’]s )?(comment|review), (${ARIA_DATE_SOURCE})`
const REACTION_SUBJECTS: Readonly<Record<string, string>> = {
  comment: '评论',
  review: '审查'
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

/** 做出反应的人列表：a, b, and 3 more → a、b 以及其他 3 人；a, b and c → a、b 和 c；You and a → 你和 a */
export function formatPeople(list: string): string {
  const names = (text: string): string => text.split(', ').map(person).join('、')
  const more = /^(.+?),? and (\d[\d,]*) more$/.exec(list)
  if (more) return `${spaced(names(more[1]!))}以及其他 ${more[2]!} 人`
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
    commented: '评论于',
    replied: '回复了',
    'via email': '通过电子邮件',
    '– with': '– 通过',
    '— with': '— 通过',
    'Hidden comment': '已隐藏的评论',
    'No description provided.': '未提供描述。',
    // 作者徽章：员工可见的垃圾帐户标记
    Spammy: '疑似垃圾帐户',
    'This user is marked as spammy. Their comments will only show in staff mode.':
      '此用户已被标记为疑似垃圾帐户。其评论仅在员工模式下显示。',
    // 评论所指对象已变更：You can also <a>view this object as it appeared at the time of the comment</a>
    'You can also': '你也可以',
    'view this object as it appeared at the time of the comment': '查看此对象在评论时的版本',

    // 评论操作菜单
    'Comment options': '评论选项',
    'Quote reply': '引用回复',
    'Copy Markdown': '复制 Markdown',
    'Copy markdown': '复制 Markdown',
    'See in timeline': '在时间线中查看',
    'Reference in a new issue': '在新议题中引用',
    // 在新议题中引用对话框的字段
    'Issue title': '议题标题',
    'Issue body': '议题正文',
    'Edit comment': '编辑评论',
    'Delete comment': '删除评论',
    "Are you sure you'd like to delete this comment?": '确定要删除此评论吗？',
    'Hide comment': '隐藏评论',
    'Unhide comment': '取消隐藏评论',
    'hide comment': '隐藏评论',
    'show comment': '显示评论',
    'Show comment': '显示评论',
    Unhide: '取消隐藏',
    Pin: '置顶',
    Unpin: '取消置顶',
    Report: '举报',
    'Report content': '报告内容',
    'Close with comment': '评论并关闭',
    Reopen: '重新打开',
    'Comment must have a URL to be copied': '评论须有 URL 才能复制',

    // 隐藏评论
    Spam: '垃圾信息',
    Abuse: '滥用',
    'Off-topic': '偏离主题',
    'Off Topic': '偏离主题',
    'Off topic': '偏离主题',
    Outdated: '过时',
    Resolved: '已解决',
    'Low quality': '低质量',
    'Choose a reason': '选择原因',
    'Choose a reason for hiding this comment': '选择隐藏此评论的原因',
    'The reason will be displayed to others.': '原因将向其他人显示。',
    'The reason will be displayed to describe this comment to others.': '原因将向其他人显示，用于说明此评论。',
    'Learn more about hiding comments': '了解隐藏评论',
    'Cancel hiding comment': '放弃隐藏评论',

    // 举报：This comment violates <a>@owner's</a> Code of Conduct and should be submitted…
    'Report to repository admins': '向存储库管理员报告',
    'Report abuse to GitHub support': '向 GitHub 支持举报滥用行为',
    'To repository admins': '向存储库管理员',
    'To GitHub support': '向 GitHub 支持',
    'Report submitted': '已提交举报',
    'Unable to submit report': '无法提交举报',
    'Code of Conduct and should be submitted to the maintainers of this repository for review.': '行为准则，应提交给此存储库的维护者审查。',
    'This report, as well as your username as the reporter, will be viewable by all admins of this repository.':
      '此举报以及你作为举报人的用户名将对此存储库的所有管理员可见。',
    'requesting that maintainers moderate content.': '请求维护者管理内容。',
    "Contact GitHub Support about this user's spammy or abusive behavior.": '就此用户的垃圾信息或滥用行为联系 GitHub 支持。',
    'reporting abuse to GitHub support': '向 GitHub 支持举报滥用行为',

    // 阻止用户：Blocking <b>@user</b> prevents them … Learn more about <a>blocking a user</a>.
    // 个人阻止对话框正文整句见下方 inline，不命中时按片段拼读
    Blocking: '阻止',
    'Block options': '阻止选项',
    // 组织阻止对话框的时长选择：Block a user: <For 7 days>
    'Block a user:': '阻止用户：',
    'Send user a notification and show activity in timeline': '通知该用户并在时间线中显示此活动',
    'Until I unblock them': '直到我取消阻止',
    'Blocking user…': '正在阻止用户…',
    'Unable to block user. Please try again.': '无法阻止用户。请重试。',
    'Content in repositories owned by this organization where you have write access will be closed.':
      '此组织拥有且你有写入访问权限的存储库中的相关内容将被关闭。',
    'prevents them from interacting with your repositories, such as opening or commenting on pull requests or issues, starring, forking, or watching. Learn more about':
      '后，其将无法与你的存储库互动，例如创建或评论拉取请求和议题、加星标、复刻或关注。了解',
    'Blocking a user prevents them from interacting with repositories of this organization, such as opening or commenting on pull requests or issues. Learn more about':
      '阻止用户后，其将无法与此组织的存储库互动，例如创建或评论拉取请求和议题。了解',
    'blocking a user': '阻止用户',
    'blocking a user.': '阻止用户。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. Markdown is supported. All org admins and moderators can see this note.":
      '最多 250 个字符。请勿包含任何个人信息，例如法定姓名或电子邮件地址。支持 Markdown。所有组织管理员和版主都能看到此备注。',
    // You can notify <b>user</b> as to why they're being blocked. …
    'You can notify': '你可以告知',
    "as to why they're being blocked. A public timeline entry will show that this user was blocked. They will receive an email notification and a notice when they try to comment with the following message:":
      '其被阻止的原因。公开的时间线条目将显示此用户已被阻止。该用户将收到电子邮件通知，并在尝试评论时看到以下消息：',
    // A maintainer of the @org organization has blocked you because of <a>this content</a>. For more information…
    'this content': '此内容',
    '. For more information please see': '。更多信息请参阅',
    'the community guidelines': '社区准则',
    // All of their comments in this organization <a>will be hidden</a> to all users and will display a reason.
    'All of their comments in this organization': '其在此组织中的所有评论',
    'will be hidden': '将被隐藏',
    'to all users and will display a reason.': '，对所有用户生效并显示原因。',
    'Failed to block user': '阻止用户失败',
    'Failed to block user from organization': '在组织中阻止用户失败',
    'Failed to unblock user from organization': '在组织中取消阻止用户失败',

    // 编辑历史：Last edited by <login>、Edits 菜单、查看修订对话框
    Edits: '编辑记录',
    'Open edits': '打开编辑记录',
    'Last edited by': '最后编辑者',
    'edited by': '编辑者',
    'Viewing edit': '正在查看编辑',
    'Most recent': '最新',
    'This revision does not contain any content.': '此修订不包含任何内容。',
    'deleted this revision': '删除了此修订',
    'Delete revision': '删除修订',
    'Delete revision from history': '从历史记录中删除修订',
    'Delete this edit revision': '删除此编辑修订',
    'Failed to delete this revision': '删除此修订失败',
    'Are you sure you want to delete this revision from the history?': '确定要从历史记录中删除此修订吗？',
    'This edit’s content will no longer be visible. This action can not be undone.': '此编辑的内容将不再可见。此操作无法撤销。',
    // 经典页面（gist 等）的编辑历史：<login> deleted this content（用户名单独成元素时）、(most recent)、(deleted)
    '(most recent)': '（最新）',
    '(deleted)': '（已删除）',
    'deleted this content': '删除了此内容',
    'The most recent revision cannot be deleted. Need to delete sensitive information? Go to the specific edit where the information was added.':
      '无法删除最新修订。需要删除敏感信息？请转到添加该信息的那次编辑。',
    'This edit’s content will no longer be visible.': '此编辑的内容将不再可见。',
    'This edit’s content will no longer be visible': '此编辑的内容将不再可见',
    "This edit's content will no longer be visible.": '此编辑的内容将不再可见。',
    "This edit's content will no longer be visible": '此编辑的内容将不再可见',
    "Couldn't display edit history diff": '无法显示编辑历史记录差异',

    // 反应
    'thumbs up': '点赞',
    'thumbs down': '点踩',
    'Thumbs up': '点赞',
    'Thumbs down': '点踩',
    laugh: '大笑',
    hooray: '欢呼',
    Reactions: '反应',
    'All reactions': '所有反应',
    'Add reaction': '添加反应',
    'Add or remove reactions': '添加或删除反应',
    'Pick your reaction': '选择反应',
    'Reactions are currently unavailable': '反应当前不可用',
    'Reacted by': '反应来自',
    // 反应摘要（发行版卡片等）：只有自己做出反应时
    'You reacted': '你做出了反应',

    // 未登录时的评论区
    'Sign up for free': '免费注册',
    'to join this conversation on GitHub': '以加入 GitHub 上的此对话',
    'to join this conversation on GitHub.': '以加入 GitHub 上的此对话。',
    // 已锁定的对话：Sign up for free to subscribe to this conversation on GitHub. Already have an account?
    'to subscribe to this conversation on GitHub': '以订阅 GitHub 上的此对话',
    '. Already have an account?': '。已有帐户？',
    'Sign in to comment': '登录后评论',
    'Remember, contributions to this repository should follow its': '请记住，对此存储库的贡献应遵守其',
    'code of conduct': '行为准则',
    'security policy': '安全策略',

    // 底部赞助提示：Show your support for <strong>octocat</strong> by sponsoring them.
    'Show your support for': '赞助',
    'by sponsoring them.': '以示支持。',

    // 无法评论的原因与评论出错
    'You do not have permissions to comment.': '你没有评论权限。',
    'This repository has been archived.': '此存储库已存档。',
    'This repository is being migrated.': '此存储库正在迁移。',
    // 锁定横幅：This conversation has been locked as <strong>off-topic</strong> and limited to collaborators.
    // 整句见下方 inline；不命中时按片段拼读：此对话已锁定为 偏离主题 并限制为仅协作者可评论。
    'This conversation has been locked as': '此对话已锁定为',
    'and limited to collaborators.': '并限制为仅协作者可评论。',
    'Continue editing your comment…': '继续编辑评论…',
    'new Comment': '新评论',
    // 两句之间原文是句号，不改逗号
    'There was a problem saving your comment. Please try again.': '保存评论时出现问题。请重试。',
    'There was a problem saving your comment. Please reload the page and try again.': '保存评论时出现问题。请重新加载页面后重试。',
    'Could not edit issue comment': '无法编辑议题评论',
    'Could not update issue comment': '无法更新议题评论',
    'Could not delete this comment': '无法删除此评论',
    'Could not add reaction. Please try again.': '无法添加反应。请重试。',
    'Could not subscribe. Please try again.': '无法订阅。请重试。',
    'Could not unsubscribe. Please try again.': '无法取消订阅。请重试。',

    // 线程订阅
    Unsubscribe: '取消订阅',
    'You’re not receiving notifications from this thread.': '你不会收到此线程的通知。',
    // 从通知邮件退订后的横幅
    'You’ve been unsubscribed from this thread.': '你已取消订阅此线程。'
  },
  regexp: [
    // 评论操作按钮：Actions for octocat's comment, 7:05 AM on October 19
    [
      new RegExp(`^Actions for ${LOGIN}['’]s (comment|reply), (${ARIA_DATE_SOURCE})$`),
      (_, login: string, kind: string, date: string) => `${login} 的${CONTENT_TYPES[kind]!}操作，${translateAriaDate(date)}`
    ],
    // 评论头部的读屏标题 octocat commented：整句匹配，免得用户名（如 today）被单独翻译
    [
      new RegExp(`^${LOGIN} (commented|replied)$`),
      (_, login: string, verb: string) => `${login} ${verb === 'commented' ? '评论于' : '回复了'}`
    ],
    // 评论头部：头像链接 @octocat's profile；赞助徽章 octo-org's sponsor since January 2024（月份随浏览器语言）
    [new RegExp(`^@${LOGIN}['’]s profile$`), '@$1 的个人资料'],
    [
      new RegExp(`^([\\w.-]+)['’]s sponsor since (${SPONSOR_MONTH_SOURCE}) (\\d{4})$`),
      (_, owner: string, month: string, year: string) => `${joinCjk('自', sponsorSince(month, year))}起赞助 ${owner}`
    ],
    [
      /^Hide comment as (Spam|Abuse|Off-topic|Off Topic|Outdated|Duplicate|Resolved|Low quality)$/,
      (_, reason: string) => `以${HIDE_REASONS[reason]!}为由隐藏评论`
    ],
    // 评论头部：Hidden as off-topic
    [
      /^Hidden as (spam|abuse|off-topic|outdated|duplicate|resolved|low-quality)$/,
      (_, reason: string) => `因${HIDE_REASONS[reason]!}而隐藏`
    ],
    [/^Report (comment|reply|issue|pull request|discussion)$/, (_, type: string) => `举报${CONTENT_TYPES[type]!}`],
    [/^Unable to submit report: (.+)$/, '无法提交举报：$1'],
    // 举报对话框：Where would you like to report this comment to? / This comment violates <a>@owner's</a> …
    [
      /^Where would you like to report this (comment|issue|pull request|content) to\?$/,
      (_, type: string) => `你想向何处举报此${CONTENT_TYPES[type]!}？`
    ],
    [/^This (comment|issue|pull request|content) violates$/, (_, type: string) => `此${CONTENT_TYPES[type]!}违反了`],
    [/^@([\w-]+)['’]s$/, '@$1 的'],
    [
      /^Choose a reason for reporting this (comment|issue|pull request|content)$/,
      (_, type: string) => `选择举报此${CONTENT_TYPES[type]!}的原因`
    ],

    // 经典页面的编辑历史对话框：octocat's edit / octocat deleted this content <relative-time>.
    [new RegExp(`^${LOGIN}['’]s edit$`), '$1 的编辑'],
    [new RegExp(`^${LOGIN} deleted this content$`), '$1 删除了此内容'],
    // 编辑历史对话框头部的头像链接
    [/^View profile for @([\w-]+)$/, '查看 @$1 的个人资料'],

    // 阻止对话框
    [/^Block @([\w-]+)$/, '阻止 @$1'],
    [/^Unblock @([\w-]+)$/, '取消阻止 @$1'],
    [/^Block ([\w-]+) from ([\w.-]+)$/, '在 $2 中阻止 $1'],
    [/^Unblock ([\w-]+) from ([\w.-]+)$/, '在 $2 中取消阻止 $1'],
    [/^For (\d+) days?$/, '$1 天'],
    [
      /^Block a user: (?:For (\d+) days?|Until I unblock them)$/,
      (_, days: string | undefined) => `阻止用户：${days ? `${days} 天` : '直到我取消阻止'}`
    ],
    [/^Are you sure you want to unblock @([\w-]+)\?$/, '确定要取消阻止 @$1 吗？'],
    // A maintainer of the @org organization has blocked you because of <a>this content</a>. …
    [/^A maintainer of the @([\w.-]+) organization has blocked you because of$/, '@$1 组织的一个维护者阻止你的原因是'],

    // 无法评论：You do not have permissions to comment on this issue.
    [
      /^You do not have permissions to comment on this (issue|pull request|discussion|commit)\.$/,
      (_, type: string) => `你没有评论此${CONTENT_TYPES[type]!}的权限。`
    ],
    // 经典页面保存评论出错：There was an error posting your comment: <服务器返回的原因>
    [/^There was an error posting your comment: (.+)$/, '发布评论时出错：$1'],

    // 反应（经典页面）：react with heart、octocat and monalisa reacted with laugh emoji
    [new RegExp(`^react with ${REACTION_SOURCE}$`), (_, name: string) => `添加${REACTIONS[name]!}反应`],
    [
      new RegExp(`^(.+?) reacted with ${REACTION_SOURCE} emoji$`),
      (_, people: string, name: string) => `${spaced(formatPeople(people))}做出了${REACTIONS[name]!}反应`
    ],
    [
      new RegExp(`^${REACTION_SOURCE} \\((\\d[\\d,]*)\\): (.+?), (${COMPACT_DATE_SOURCE})$`),
      (_, name: string, count: string, author: string, date: string) =>
        `${REACTIONS[name]!} (${count})：${author}，${translateCompactDate(date)}`
    ],
    [/^(\d[\d,]*) (?:people|person) reacted$/, '$1 人做出了反应'],
    // 反应摘要（发行版卡片等）：自己与他人都做出反应时
    [/^You and (\d[\d,]*) others? reacted$/, '你和其他 $1 人做出了反应'],

    // 反应（React）：👍 4 reactions、React with 👀、Reacted by a, b and c、+3 more people
    [new RegExp(`^${EMOJI_SOURCE} (\\d[\\d,]*) reactions?$`), '$1 $2 个反应'],
    [
      new RegExp(`^(React|Unreact) with ${EMOJI_SOURCE}$`),
      (_, verb: string, emoji: string) => (verb === 'React' ? `添加 ${emoji} 反应` : `取消 ${emoji} 反应`)
    ],
    [new RegExp(`^People who reacted with ${EMOJI_SOURCE}$`), '做出 $1 反应的人'],
    [/^Reacted by (.+)$/, (_, people: string) => `${spaced(formatPeople(people))}做出了反应`],
    [/^\+(\d[\d,]*) more (?:people|person)$/, '还有 $1 人'],
    // 反应按钮与反应栏的上下文（拉取请求差异评论等）：React to octocat's comment, 7:05 AM today
    [
      new RegExp(`^React to ${REACTION_CONTEXT}$`),
      (_, login: string | undefined, kind: string, date: string) =>
        `为${login ? ` ${login} 的` : ''}${REACTION_SUBJECTS[kind]!}添加反应，${translateAriaDate(date)}`
    ],
    [
      new RegExp(`^Reactions are currently unavailable for ${REACTION_CONTEXT}$`),
      (_, login: string | undefined, kind: string, date: string) =>
        `${login ? `${login} ` : ''}${REACTION_SUBJECTS[kind]!}的反应当前不可用，${translateAriaDate(date)}`
    ],
    [
      new RegExp(`^Reactions for ${REACTION_CONTEXT}$`),
      (_, login: string | undefined, kind: string, date: string) =>
        `${login ? `${login} ` : ''}${REACTION_SUBJECTS[kind]!}的反应，${translateAriaDate(date)}`
    ]
  ],
  inline: [
    // 组织取消阻止对话框（Dialog.Body）：Are you sure you want to unblock <strong>user</strong> from <strong>org</strong>?
    // 个人取消阻止对话框（Are you sure you want to unblock @user?）没有元素子节点，由上面的正则处理
    ['Are you sure you want to unblock {} from {}?', '确定要取消阻止 {} 访问 {} 吗？'],
    // 个人阻止对话框正文：Blocking <strong>@user</strong> prevents them … Learn more about <a>blocking a user</a>.
    // 按整句翻译：开头的 Blocking 不受页面词典 scoped 键（议题依赖关系）影响；链接文字由 static 翻译
    [
      'Blocking {} prevents them from interacting with your repositories, such as opening or commenting on pull requests or issues, starring, forking, or watching. Learn more about {}.',
      '阻止 {} 后，其将无法与你的存储库互动，例如创建或评论拉取请求和议题、加星标、复刻或关注。了解{}。'
    ],
    // 经典拉取请求页的锁定横幅：This conversation has been locked as <strong>原因</strong> and limited to collaborators.
    // 前后的图标等元素原样带回；原因作“因…而”（同 Hidden as），原因词由 pulls 词典翻译，两侧不留空格
    [
      /^(\{\}*)This conversation has been locked as \{\} and limited to collaborators\.(\{\}*)$/,
      '$1 此对话已因{}而锁定并限制为仅协作者可评论。$2'
    ]
  ]
} satisfies PageDictionary
