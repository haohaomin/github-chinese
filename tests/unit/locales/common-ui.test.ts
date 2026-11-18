import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText, type Matcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import { formatPeople } from '../../../src/locales/zh-CN/common-ui/comments'
import { formatClock, translateAriaDate, translateCompactDate } from '../../../src/locales/zh-CN/common-ui/time'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'

const matcher = createMatcher([['common', commonUi]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

const ATTACHMENT_NOTICE =
  'attachment in your text may not be visible to all the viewers of the repository due to being from a repository with restricted access.'

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 通用操作：复制、星标按钮
  { hits: [['Copy "a1b2c3d" to clipboard', '复制“a1b2c3d”到剪贴板']], misses: ['Copy a1b2c3d to clipboard'] },
  {
    hits: [
      ['Star this repository (0)', '为此存储库加星标 (0)'],
      ['Star this repository (1.2k)', '为此存储库加星标 (1.2k)']
    ],
    misses: ['Star this repository (many)']
  },
  { hits: [['Unstar this repository (12)', '取消此存储库的星标 (12)']], misses: ['Unstar this repo (12)'] },
  {
    hits: [['Starred, click to unstar this repository (54.9k)', '已加星标，单击可取消此存储库的星标 (54.9k)']],
    misses: ['Starred, click to unstar (5)']
  },
  {
    hits: [
      ['0 users starred this repository', '0 个用户为此存储库加了星标'],
      ['1 user starred this repository', '1 个用户为此存储库加了星标']
    ],
    misses: ['Many users starred this repository']
  },
  // 分页
  {
    hits: [
      ['Page 2', '第 2 页'],
      ['Page 7...', '第 7 页...'],
      ['Page 40…', '第 40 页…']
    ],
    misses: ['Page two', 'Pages 2']
  },
  // DataTable 分页：读屏播报、合并后的可见范围（‒ 为 U+2012）
  {
    hits: [
      ['Showing 1 through 10 of 24', '显示 24 个中的第 1 至 10 个'],
      ['Showing 1,001 through 1,025 of 2,345', '显示 2,345 个中的第 1,001 至 1,025 个']
    ],
    misses: ['Showing 1 through 10', 'Showing 1 to 10 of 24']
  },
  {
    hits: [
      ['1 through ‒10 of 24', '24 个中的第 1‒10 个'],
      ['21 through ‒24 of 24', '24 个中的第 21‒24 个']
    ],
    misses: ['1 through 10 of 24', '1‒10 of 24']
  },
  // 选择面板的读屏播报
  {
    hits: [
      ['5 items available, 2 selected.', '5 个可用条目，已选择 2 个。'],
      ['1 item available, 0 selected.', '1 个可用条目，已选择 0 个。']
    ],
    misses: ['5 items available']
  },
  { hits: [['Focused item: bug', '当前条目：bug']], misses: ['Focused item'] },
  {
    hits: [['Labels, filter text box and list of items', 'Labels，筛选文本框和条目列表']],
    misses: ['filter text box and list of items']
  },
  { hits: [['Currently selected: main', '当前选择：main']], misses: ['Currently selected'] },
  { hits: [['Selected: bug, docs', '已选择：bug, docs']], misses: ['Selected bug'] },
  // 列表条目的无障碍名称与读屏播报（状态后原文是句号，不改冒号）
  {
    hits: [
      ['Static value is lost. More information available below.', 'Static value is lost。更多信息见下方。'],
      ['Selected. Fix the bug. New activity. More information available below.', '已选择。Fix the bug。有新动态。更多信息见下方。'],
      ['Selected. Fix the bug. More information available below.', '已选择。Fix the bug。更多信息见下方。'],
      ['Fix the bug. New activity. More information available below.', 'Fix the bug。有新动态。更多信息见下方。']
    ],
    misses: ['Static value is lost. More information available below']
  },
  { hits: [['Select: Fix the bug', '选择：Fix the bug']], misses: ['Select:'] },
  {
    hits: [
      ['Selected. Fix the bug.', '已选择。Fix the bug。'],
      ['Unselected. Fix the bug.', '未选择。Fix the bug。'],
      ['Selected. Fix the bug. New activity.', '已选择。Fix the bug。有新动态。']
    ],
    misses: ['Selected.', 'Unselected. Fix the bug']
  },
  { hits: [['Fix the bug. New activity.', 'Fix the bug。有新动态。']], misses: ['New activity.'] },
  {
    hits: [
      ['Select all list items: Repositories', '全选列表项：Repositories'],
      ['Select all issues and pull requests: Inbox', '全选议题和拉取请求：Inbox'],
      ['Select all list items:', '全选列表项']
    ],
    misses: ['Select all files: src']
  },
  {
    hits: [
      ['3 list items selected', '已选择 3 个列表项'],
      ['1 issue or pull request selected', '已选择 1 个议题或拉取请求']
    ],
    misses: ['3 files selected']
  },
  { hits: [['3 list items of 25 selected', '25 个列表项中已选择 3 个']], misses: ['3 list items of many selected'] },
  // 窗格、面包屑、标签组、字数统计
  { hits: [['Pane width 320 pixels', '窗格宽度 320 像素']], misses: ['Pane width auto'] },
  { hits: [['3 more breadcrumb items', '另外 3 个面包屑导航项']], misses: ['more breadcrumb items'] },
  { hits: [['All 12 labels', '全部 12 个标签']], misses: ['All labels'] },
  {
    hits: [
      ['Show +3 more', '再显示 3 个'],
      ['Show 12 more', '再显示 12 个']
    ],
    misses: ['Show many more']
  },
  {
    hits: [
      ['20 characters remaining', '还可输入 20 个字符'],
      ['1 character remaining', '还可输入 1 个字符']
    ],
    misses: ['No characters remaining']
  },
  { hits: [['5 characters over', '超出 5 个字符']], misses: ['characters over'] },
  {
    hits: [
      ['You can enter up to 250 characters', '最多可输入 250 个字符'],
      ['You can enter up to 1 character', '最多可输入 1 个字符']
    ],
    misses: ['You can enter up to many characters']
  },
  { hits: [['3 selected', '已选择 3 个']], misses: ['All selected'] },
  { hits: [['3 of 10 selected', '10 个中已选择 3 个']], misses: ['3 of many selected'] },
  // 反馈对话框
  {
    hits: [['Please keep your feedback within 1,000 characters or less.', '反馈内容不能超过 1,000 个字符。']],
    misses: ['Please keep your feedback short.']
  },
  { hits: [['Request ID: 9F3C:1A2B:3C4D', '请求 ID：9F3C:1A2B:3C4D']], misses: ['Request ID'] },

  // 登录提示
  {
    hits: [['You must be logged in to sponsor octocat', '登录后才能赞助 octocat']],
    misses: ['You must be logged in to sponsor']
  },

  // 状态与标签 title
  {
    hits: [
      ['Status: Open', '状态：打开'],
      ['Status: Not planned', '状态：未计划']
    ],
    misses: ['Status: Unknown']
  },
  {
    hits: [
      ['Label: Verified', '标签：已验证'],
      ['Label: Public archive', '标签：公共存档']
    ],
    misses: ['Label: bug']
  },
  // 作者关系说明
  {
    hits: [
      ['This user is a member of the octo-org organization.', '此用户是 octo-org 组织的成员。'],
      ['You are a member of the octo-org organization', '你是 octo-org 组织的成员']
    ],
    misses: ['This user is a member of an organization.']
  },
  {
    hits: [
      ['This user is the owner of the hello-world repository.', '此用户是 hello-world 存储库的所有者。'],
      ['You are the owner of this repository.', '你是此存储库的所有者。']
    ],
    misses: ['This user is the owner of the repository.']
  },
  {
    hits: [['This user has been invited to collaborate on the hello-world repository.', '此用户已受邀协作 hello-world 存储库。']],
    misses: ['This user has been invited to collaborate.']
  },
  {
    hits: [
      ['This user has previously committed to the hello-world repository.', '此用户曾向 hello-world 存储库提交过代码。'],
      ['You have previously committed to this repository', '你曾向此存储库提交过代码']
    ],
    misses: ['This user has previously committed to the hello-world project.']
  },
  {
    hits: [['This user is a first-time contributor to the hello-world repository.', '此用户是 hello-world 存储库的首次贡献者。']],
    misses: ['This user is a first-time contributor.']
  },
  {
    hits: [
      ['This user is a maintainer on this repository.', '此用户是此存储库的维护者。'],
      ['This user is a collaborator on this repository.', '此用户是此存储库的协作者。']
    ],
    misses: ['This user is an admin on this repository.']
  },
  {
    hits: [
      ['This user is the author of this issue', '此用户是此议题的作者'],
      ['This user is the author of this discussion.', '此用户是此讨论的作者。'],
      ['You are the author of this pull request.', '你是此拉取请求的作者。'],
      ['This user is the author', '此用户是作者'],
      ['You are the author.', '你是作者。']
    ],
    misses: ['This user is the author of this commit.']
  },

  // 相对时间与日期
  {
    hits: [
      ['3 days ago', '3天前'],
      ['about 1 year ago', '约1年前'],
      ['last week', '上周'],
      ['yesterday', '昨天'],
      ['Oct 26, 2026', '2026年10月26日'],
      ['on Jul 1', '7月1日']
    ],
    misses: ['days ago', '3 eons ago']
  },
  {
    hits: [
      ['2d ago', '前天'],
      ['19m ago', '19分钟前'],
      ['12h ago', '12小时前'],
      ['3mo ago', '3个月前']
    ],
    misses: ['2x ago', 'd ago']
  },
  {
    hits: [
      ['Updated 3 days ago', '3天前更新'],
      ['updated on Jan 5', '1月5日更新'],
      ['Updated Oct 26, 2026', '2026年10月26日更新'],
      ['Updated yesterday', '昨天更新']
    ],
    misses: ['Updated recently']
  },
  { hits: [['Last updated 2 hours ago', '2小时前最后更新']], misses: ['Last updated by octocat'] },
  { hits: [['Created 5 minutes ago', '5分钟前创建']], misses: ['Created by octocat'] },
  { hits: [['Edited 3 days ago', '3天前编辑']], misses: ['Edited sometime'] },
  // 带时刻的完整时间：本地时区（测试固定为 GMT+8）不写，其他时区写在时刻后的括号里
  {
    hits: [
      ['Oct 26, 2026, 10:03 AM GMT+8', '2026年10月26日 10:03'],
      ['Oct 26, 2026, 8:33 PM GMT+8', '2026年10月26日 20:33'],
      ['Oct 26, 2026, 8:03 AM GMT+8', '2026年10月26日 08:03'],
      ['Oct 26, 2026, 12:05 AM UTC', '2026年10月26日 00:05 (UTC)'],
      ['Oct 26, 9:05 AM GMT-5:30', '10月26日 09:05 (GMT-5:30)'],
      // 零时区与 en-US 的美洲时区缩写：按 zh-CN Intl 写成 GMT / GMT 偏移
      ['Jan 15, 2026, 6:05 PM GMT', '2026年1月15日 18:05 (GMT)'],
      ['Jul 15, 2026, 11:05 AM PDT', '2026年7月15日 11:05 (GMT-7)'],
      ['Jan 15, 2026, 9:05 AM AKST', '2026年1月15日 09:05 (GMT-9)'],
      ['Jan 15, 2026, 8:05 AM HST', '2026年1月15日 08:05 (GMT-10)'],
      // en-US 给 America/Adak 用的缩写
      ['Jan 15, 2026, 12:05 AM HAST', '2026年1月15日 00:05 (GMT-10)'],
      ['Jul 15, 2026, 1:05 AM HADT', '2026年7月15日 01:05 (GMT-9)'],
      ['on Oct 26, 2026, 10:03 AM', '2026年10月26日 10:03'],
      ['October 26, 2026 02:03', '2026年10月26日 2:03']
    ],
    misses: ['Oct 26, 2026, 25:61 AM', 'Octopus 26, 2026, 10:03 AM GMT+8', 'Oct 26, 2026, 10:03 AM XST']
  },
  {
    hits: [
      ['7:05 AM on October 19', '10月19日 7:05'],
      ['3:00 AM on July 1, 2025', '2025年7月1日 3:00'],
      ['11:30 PM yesterday', '昨天 23:30'],
      ['12:00 PM today', '今天 12:00']
    ],
    misses: ['7:05 on October 19']
  },
  {
    hits: [
      ['07:51AM on October 16', '10月16日 7:51'],
      ['05:49PM on December 22, 2024', '2024年12月22日 17:49']
    ],
    misses: ['07:51 on October 16']
  },
  {
    hits: [
      ['Today at 9:03 AM', '今天 9:03'],
      ['Yesterday at 11:45 PM', '昨天 23:45']
    ],
    misses: ['Tomorrow at 9:03 AM']
  },
  {
    hits: [
      ['Last 7 days', '最近 7 天'],
      ['Past 24 hours', '过去 24 小时'],
      ['Last 3 months', '最近 3 个月'],
      ['Past 1 year', '过去 1 年']
    ],
    misses: ['Last few days']
  },
  {
    hits: [
      ['24 hours', '24 小时'],
      ['30 days', '30 天'],
      ['1 week', '1 周'],
      ['1 month', '1 个月'],
      ['5 minutes', '5 分钟']
    ],
    misses: ['several days', '30 days left']
  },
  // 编辑历史
  {
    hits: [
      ['Edited 2 times', '已编辑 2 次'],
      ['Edited 1 time', '已编辑 1 次']
    ],
    misses: ['Edited many times']
  },
  {
    hits: [
      ['edited by monalisa', '由 monalisa 编辑'],
      ['edited by dependabot[bot]', '由 dependabot[bot] 编辑']
    ],
    misses: ['edited by the team']
  },

  // 通用计数
  {
    hits: [
      ['1.1k stars', '1.1k 个星标'],
      ['1 star', '1 个星标']
    ],
    misses: ['many stars', 'stars']
  },
  { hits: [['351 forks', '351 个复刻']], misses: ['forks'] },
  {
    hits: [
      ['7 comments', '7 条评论'],
      ['1 comment', '1 条评论']
    ],
    misses: ['No comments']
  },
  {
    hits: [
      ['24 replies', '24 条回复'],
      ['1 reply', '1 条回复']
    ],
    misses: ['Show replies']
  },
  { hits: [['3 items', '3 个项']], misses: ['3 starry items'] },
  { hits: [['3 files', '3 个文件']], misses: ['files'] },
  { hits: [['12 commits', '12 个提交']], misses: ['12 commits ahead'] },
  { hits: [['5 branches', '5 个分支']], misses: ['branches'] },
  { hits: [['20 tags', '20 个标签']], misses: ['tags'] },
  { hits: [['3 labels', '3 个标签']], misses: ['3 labels selected'] },
  { hits: [['2 releases', '2 个发行版']], misses: ['releases'] },
  {
    hits: [
      ['103 downloads', '103 次下载'],
      ['1 download', '1 次下载']
    ],
    misses: ['downloads']
  },
  { hits: [['1 package', '1 个软件包']], misses: ['packages'] },
  {
    hits: [
      ['124 repositories', '124 个存储库'],
      ['1 repository', '1 个存储库']
    ],
    misses: ['Popular repositories']
  },
  { hits: [['4 projects', '4 个项目']], misses: ['projects'] },
  { hits: [['2 milestones', '2 个里程碑']], misses: ['milestones'] },
  { hits: [['1,234 issues', '1,234 个议题']], misses: ['issues'] },
  { hits: [['8 pull requests', '8 个拉取请求']], misses: ['pull requests'] },
  { hits: [['6 discussions', '6 个讨论']], misses: ['discussions'] },
  { hits: [['15 results', '15 个结果']], misses: ['15 results found'] },
  { hits: [['73 members', '73 个成员']], misses: ['members'] },
  { hits: [['2.5k followers', '2.5k 个关注者']], misses: ['followers only'] },
  { hits: [['412 contributors', '412 个贡献者']], misses: ['Top contributors'] },
  { hits: [['1 participant', '1 个参与者']], misses: ['participants'] },
  { hits: [['190 reactions', '190 个反应']], misses: ['reactions'] },
  { hits: [['12 watching', '12 个关注者']], misses: ['watching'] },
  { hits: [['5 hidden items', '5 个隐藏项']], misses: ['hidden items'] },
  {
    hits: [
      ['4 lines changed', '4 行更改'],
      ['1 line changed', '1 行更改']
    ],
    misses: ['lines changed recently']
  },
  { hits: [['160 remaining', '剩余 160']], misses: ['remaining'] },
  { hits: [[', and 3 more', '，以及其他 3 个']], misses: [', and more'] },
  { hits: [['and 2 more', '以及其他 2 个']], misses: ['and more'] },

  // 评论编辑器
  {
    hits: [
      ['Markdown input: edit mode selected.', 'Markdown 输入：已选择编辑模式。'],
      ['Markdown input: preview mode selected.', 'Markdown 输入：已选择预览模式。']
    ],
    misses: ['Markdown input: split mode selected.']
  },
  { hits: [['Heading 2', '2 级标题']], misses: ['Heading 7'] },
  {
    hits: [
      ['Add bold text, <Ctrl+b>', '添加粗体文本，<Ctrl+b>'],
      ['Add a bulleted list, <Cmd+Shift+8>', '添加项目符号列表，<Cmd+Shift+8>'],
      ['Add a suggestion, <Ctrl+g>', '添加建议，<Ctrl+g>']
    ],
    misses: ['Add bold text, Ctrl+b']
  },
  {
    hits: [
      ['1 column', '1 列'],
      ['5 rows', '5 行']
    ],
    misses: ['0 rows', 'columns']
  },
  { hits: [['Uploading your files... (1/3)', '正在上传文件... (1/3)']], misses: ['Uploading your files... (1)'] },
  {
    hits: [
      ['Uploading "image.png"...', '正在上传“image.png”...'],
      ['Uploading "image.png"…', '正在上传“image.png”…']
    ],
    misses: ['Uploading image.png']
  },
  { hits: [['Failed to upload "image.png"', '“image.png”上传失败']], misses: ['Failed to upload'] },
  {
    hits: [
      ['File type .exe not supported. See the', '不支持文件类型 .exe。请参阅'],
      ['File types .exe, .dll not supported. See the', '不支持文件类型 .exe, .dll。请参阅']
    ],
    misses: ['File type not supported.']
  },
  {
    hits: [['Try again with GIF, JPEG, PNG or ZIP.', '请改用 GIF、JPEG、PNG 或 ZIP 格式的文件重试。']],
    misses: ['Try again with a smaller file.']
  },
  {
    hits: [
      ['with a GIF, JPEG, or PNG.', '并改用 GIF、JPEG 或 PNG 格式的文件。'],
      ['with a GIF, JPEG, JPG, MOV, MP4, PNG, SVG, WEBM or WEBP.', '并改用 GIF、JPEG、JPG、MOV、MP4、PNG、SVG、WEBM 或 WEBP 格式的文件。'],
      ['with a PNG.', '并改用 PNG 格式的文件。'],
      ['with an MP4.', '并改用 MP4 格式的文件。']
    ],
    misses: ['with a smaller file.', 'with a GIF, JPEG, or PNG', 'with GIF or PNG.']
  },
  {
    hits: [['Please upload a picture smaller than 10,000x10,000.', '请上传小于 10,000x10,000 的图片。']],
    misses: ['Please upload a smaller picture.']
  },
  {
    hits: [
      ['There was an error creating your PullRequest.', '创建拉取请求时出错。'],
      ['There was an error creating your Discussion.', '创建讨论时出错。'],
      // Gist 与中文之间加空格
      ['There was an error creating your Gist.', '创建代码片段时出错。']
    ],
    misses: ['There was an error creating your account.']
  },
  {
    hits: [
      [`1 ${ATTACHMENT_NOTICE}`, '你文本中的 1 个附件来自访问受限的存储库，可能并非对此存储库的所有查看者可见。'],
      [
        `3 ${ATTACHMENT_NOTICE.replace('attachment', 'attachments')}`,
        '你文本中的 3 个附件来自访问受限的存储库，可能并非对此存储库的所有查看者可见。'
      ]
    ],
    misses: ['Attachments in your text may not be visible.']
  },
  {
    hits: [
      ['smile emoji', 'smile 表情符号'],
      ['+1 emoji', '+1 表情符号']
    ],
    misses: ['Custom emoji', 'smile emoji pack']
  },

  // 评论操作与对话框
  {
    hits: [
      ["Actions for octocat's comment, 7:05 AM on October 19", 'octocat 的评论操作，10月19日 7:05'],
      ['Actions for octocat’s reply, 12:05 PM today', 'octocat 的回复操作，今天 12:05']
    ],
    misses: ["Actions for octocat's comment"]
  },
  {
    hits: [
      ['today commented', 'today 评论于'],
      ['octocat replied', 'octocat 回复了'],
      ['dependabot[bot] commented', 'dependabot[bot] 评论于']
    ],
    misses: ['octocat and hubot commented']
  },
  {
    hits: [
      ["@octocat's profile", '@octocat 的个人资料'],
      ['@renovate[bot]’s profile', '@renovate[bot] 的个人资料']
    ],
    misses: ["Update John's profile"]
  },
  {
    hits: [
      ["octo-org's sponsor since January 2024", '自 2024年1月起赞助 octo-org'],
      ["octo-org's sponsor since 一月 2024", '自 2024年1月起赞助 octo-org'],
      ['octo-org’s sponsor since 十二月 2023', '自 2023年12月起赞助 octo-org'],
      ["octo-org's sponsor since 3月 2025", '自 2025年3月起赞助 octo-org']
    ],
    misses: ["octo-org's sponsor since 2024", "octo-org's sponsor since 十三月 2024", "octo-org's sponsor since 13月 2024"]
  },
  {
    hits: [
      ['Hide comment as Off-topic', '以偏离主题为由隐藏评论'],
      ['Hide comment as Outdated', '以过时为由隐藏评论']
    ],
    misses: ['Hide comment as Rude']
  },
  {
    hits: [
      ['Hidden as off-topic', '因偏离主题而隐藏'],
      ['Hidden as low-quality', '因低质量而隐藏'],
      ['Hidden as outdated', '因过时而隐藏']
    ],
    misses: ['Hidden as rude']
  },
  {
    hits: [
      ['Report comment', '举报评论'],
      ['Report pull request', '举报拉取请求']
    ],
    misses: ['Report bug']
  },
  {
    hits: [['Unable to submit report: Network error', '无法提交举报：Network error']],
    misses: ['Unable to submit report now']
  },
  // 举报对话框
  {
    hits: [
      ['Where would you like to report this comment to?', '你想向何处举报此评论？'],
      ['Where would you like to report this content to?', '你想向何处举报此内容？']
    ],
    misses: ['Where would you like to report this to?']
  },
  {
    hits: [
      ['This comment violates', '此评论违反了'],
      ['This pull request violates', '此拉取请求违反了']
    ],
    misses: ['This rule violates']
  },
  {
    hits: [
      ["@octocat's", '@octocat 的'],
      ['@octo-org’s', '@octo-org 的']
    ],
    misses: ["octocat's"]
  },
  {
    hits: [['Choose a reason for reporting this issue', '选择举报此议题的原因']],
    misses: ['Choose a reason for reporting this']
  },
  // 经典页面的编辑历史对话框
  {
    hits: [
      ["monalisa's edit", 'monalisa 的编辑'],
      ['github-actions[bot]’s edit', 'github-actions[bot] 的编辑']
    ],
    misses: ["monalisa's edits"]
  },
  { hits: [['octocat deleted this content', 'octocat 删除了此内容']], misses: ['The admin team deleted this content'] },
  { hits: [['View profile for @octocat', '查看 @octocat 的个人资料']], misses: ['View profile for octocat'] },
  { hits: [['Block @octocat', '阻止 @octocat']], misses: ['Block octocat'] },
  { hits: [['Unblock @octocat', '取消阻止 @octocat']], misses: ['Unblock everyone now'] },
  {
    hits: [['Block octocat from octo-org', '在 octo-org 中阻止 octocat']],
    misses: ['Block octocat from the organization']
  },
  { hits: [['Unblock octocat from octo-org', '在 octo-org 中取消阻止 octocat']], misses: ['Unblock octocat'] },
  {
    hits: [
      ['For 1 day', '1 天'],
      ['For 30 days', '30 天']
    ],
    misses: ['For a day']
  },
  {
    hits: [
      ['Block a user: For 7 days', '阻止用户：7 天'],
      ['Block a user: Until I unblock them', '阻止用户：直到我取消阻止']
    ],
    misses: ['Block a user: Forever']
  },
  {
    hits: [['Are you sure you want to unblock @octocat?', '确定要取消阻止 @octocat 吗？']],
    misses: ['Are you sure you want to unblock octocat?']
  },
  {
    hits: [['A maintainer of the @octo-org organization has blocked you because of', '@octo-org 组织的一个维护者阻止你的原因是']],
    misses: ['A maintainer has blocked you because of']
  },
  // 无法评论
  {
    hits: [
      ['You do not have permissions to comment on this issue.', '你没有评论此议题的权限。'],
      ['You do not have permissions to comment on this pull request.', '你没有评论此拉取请求的权限。']
    ],
    misses: ['You do not have permissions to comment on this gist.']
  },
  {
    hits: [['There was an error posting your comment: Body is too long', '发布评论时出错：Body is too long']],
    misses: ['There was an error posting your comment']
  },
  // 反应（经典页面）
  {
    hits: [
      ['react with heart', '添加爱心反应'],
      ['react with thumbs up', '添加点赞反应']
    ],
    misses: ['react with smile']
  },
  {
    hits: [
      ['octocat reacted with thumbs up emoji', 'octocat 做出了点赞反应'],
      ['monalisa and hubot reacted with rocket emoji', 'monalisa 和 hubot 做出了火箭反应'],
      ['octocat, monalisa, and hubot reacted with laugh emoji', 'octocat、monalisa 和 hubot 做出了大笑反应'],
      [
        'octocat, monalisa, heart-octo, and 180 more reacted with hooray emoji',
        'octocat、monalisa、heart-octo 以及其他 180 人做出了欢呼反应'
      ],
      ['You reacted with heart emoji', '你做出了爱心反应'],
      ['You and octocat reacted with rocket emoji', '你和 octocat 做出了火箭反应']
    ],
    misses: ['octocat reacted with smile emoji']
  },
  {
    hits: [['thumbs up (21): github-actions[bot], 07:51AM on October 16', '点赞 (21)：github-actions[bot]，10月16日 7:51']],
    misses: ['thumbs up (21): github-actions[bot]']
  },
  {
    hits: [
      ['27 people reacted', '27 人做出了反应'],
      ['1 person reacted', '1 人做出了反应']
    ],
    misses: ['Some people reacted']
  },
  {
    hits: [
      ['You and 2 others reacted', '你和其他 2 人做出了反应'],
      ['You and 1 other reacted', '你和其他 1 人做出了反应'],
      ['You and 1,024 others reacted', '你和其他 1,024 人做出了反应']
    ],
    misses: ['You and others reacted']
  },
  // 反应（React）
  {
    hits: [
      ['👍 4 reactions', '👍 4 个反应'],
      ['👀 1 reaction', '👀 1 个反应']
    ],
    misses: ['🐛 4 reactions']
  },
  {
    hits: [
      ['React with 👀', '添加 👀 反应'],
      ['Unreact with 🚀', '取消 🚀 反应']
    ],
    misses: ['React with 🐛']
  },
  { hits: [['People who reacted with ❤️', '做出 ❤️ 反应的人']], misses: ['People who reacted'] },
  {
    hits: [
      ['Reacted by octocat, 小红, monalisa and Zoë Octo', 'octocat、小红、monalisa 和 Zoë Octo 做出了反应'],
      ['Reacted by octocat', 'octocat 做出了反应'],
      ['Reacted by a, b, c and 22 more', 'a、b、c 以及其他 22 人做出了反应'],
      ['Reacted by You and octocat', '你和 octocat 做出了反应']
    ],
    misses: ['Reacted']
  },
  {
    hits: [
      ['+3 more people', '还有 3 人'],
      ['+1 more person', '还有 1 人']
    ],
    misses: ['+ more people']
  },
  // 反应按钮与反应栏的上下文
  {
    hits: [
      ["React to octocat's comment, 7:05 AM today", '为 octocat 的评论添加反应，今天 7:05'],
      ['React to review, 3:00 AM on July 1, 2025', '为审查添加反应，2025年7月1日 3:00']
    ],
    misses: ["React to octocat's comment"]
  },
  {
    hits: [["Reactions are currently unavailable for octocat's review, 11:30 PM yesterday", 'octocat 审查的反应当前不可用，昨天 23:30']],
    misses: ['Reactions are currently unavailable for this comment']
  },
  {
    hits: [
      ['Reactions for octocat’s comment, 7:05 AM on October 19', 'octocat 评论的反应，10月19日 7:05'],
      ['Reactions for comment, 7:05 AM today', '评论的反应，今天 7:05']
    ],
    misses: ['Reactions for everyone']
  },

  // 悬停卡片
  {
    hits: [
      ['Committed to this repository in the past week', '过去一周内曾向此存储库提交代码'],
      ['Committed to this repository in the past month', '过去一个月内曾向此存储库提交代码']
    ],
    misses: ['Committed to this repository in the past decade']
  },
  {
    hits: [
      ['Opened this issue (their first in @octo-org)', '打开了此议题（在 @octo-org 中的第一个议题）'],
      ['Opened this pull request (their first in @octo-org)', '创建了此拉取请求（在 @octo-org 中的第一个拉取请求）'],
      ['Opened this discussion (their first in @octo-org)', '发起了此讨论（在 @octo-org 中的第一个讨论）']
    ],
    misses: ['Opened this issue (their first)']
  },
  {
    hits: [['Started 1 discussion in octo-org/hello-world', '在 octo-org/hello-world 中发起了 1 个讨论']],
    misses: ['Started 1 discussion in octo-org']
  },
  {
    hits: [['Answered 37 discussions in octo-org/hello-world', '在 octo-org/hello-world 中回答了 37 个讨论']],
    misses: ['Answered 37 discussions']
  },
  { hits: [['Sponsor @octocat', '赞助 @octocat']], misses: ['Sponsor octocat'] },
  {
    hits: [
      ['View all commits by monalisa', '查看 monalisa 的所有提交'],
      ['View all commits by renovate[bot]', '查看 renovate[bot] 的所有提交']
    ],
    misses: ['View all commits']
  },

  // 表单校验错误
  {
    hits: [
      ["Name can't be blank", '名称不能为空'],
      ['Name can’t be blank', '名称不能为空'],
      ['Domain is not properly formatted.', '域格式不正确。'],
      ['Callback URL is not a valid URL', '回调 URL 不是有效的 URL'],
      ['Login has already been taken', '用户名已被使用'],
      ['Description is too long (maximum is 350 characters).', '描述过长（最多 350 个字符）。'],
      ['Password is too short (minimum is 1 character)', '密码太短（最少 1 个字符）'],
      ['Key is the wrong length (should be 40 characters)', '密钥长度不正确（应为 40 个字符）']
    ],
    misses: [
      'Nickname is invalid',
      'Name is very invalid',
      'Name is invalid..',
      'Name is too long (maximum is many characters)',
      'name is invalid'
    ]
  },

  // 标签：Dependabot 生态标签的说明（标签选择器、拉取请求侧栏令牌的 title；产品名按术语表译出，其余生态名保持原文）
  {
    hits: [
      ['Pull requests that update javascript code', '更新 javascript 代码的拉取请求'],
      ['Pull requests that update GitHub Actions code', '更新 GitHub 操作代码的拉取请求']
    ],
    misses: ['Pull requests that update docs']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('common-ui 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(commonUi.static?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = commonUi.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('正则均以 ^ 开头、$ 结尾且不带 g / y 标志', () => {
    for (const [pattern] of commonUi.regexp ?? []) {
      expect(pattern.source.startsWith('^') && pattern.source.endsWith('$')).toBe(true)
      expect(pattern.global || pattern.sticky).toBe(false)
    }
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    const join = (parts: readonly string[]): string | undefined => translate(normalizeText(parts.join('')))
    expect(join(['Reacted by ', 'octocat, 小红 and monalisa'])).toBe('octocat、小红和 monalisa 做出了反应')
    expect(join(['Uploading your files... (', '1', '/', '3', ')'])).toBe('正在上传文件... (1/3)')
    expect(join(['3', ' of 10 selected'])).toBe('10 个中已选择 3 个')
    expect(join(['Updated ', '3 days ago'])).toBe('3天前更新')
    expect(join(['Page ', '7', '...'])).toBe('第 7 页...')
    expect(join([', \n  ', 'and 3 more\n'])).toBe('，以及其他 3 个')
    expect(join(['Show +', '3', ' more'])).toBe('再显示 3 个')
    expect(join(['You can enter up to ', '250', ' ', 'characters'])).toBe('最多可输入 250 个字符')
    expect(join(['Hidden as', ' ', 'off-topic'])).toBe('因偏离主题而隐藏')
    expect(join(['Block a user: ', 'For 3 days'])).toBe('阻止用户：3 天')
    expect(join(['Are you sure you want to unblock @', 'octocat', '?'])).toBe('确定要取消阻止 @octocat 吗？')
    expect(join(['A maintainer of the @', 'octo-org', ' organization has blocked you because of', ' '])).toBe(
      '@octo-org 组织的一个维护者阻止你的原因是'
    )
    expect(join(['today', ' commented'])).toBe('today 评论于')
    expect(join(['Select all ', 'list items', ': ', 'Repositories'])).toBe('全选列表项：Repositories')
  })

  it('几条校验错误拼成一段时逐句翻译', () => {
    expect(translate('Domain is not a valid public domain.. Domain is not properly formatted.')).toBe(
      '域不是有效的公共域名。域格式不正确。'
    )
    expect(translate("Name can't be blank. Description is too long (maximum is 350 characters).")).toBe(
      '名称不能为空。描述过长（最多 350 个字符）。'
    )
    expect(translate("Name can't be blank. Name is invalid")).toBe('名称不能为空。名称无效')
    expect(translate("Name can't be blank. Nickname is invalid.")).toBeUndefined()
    expect(translate('Loading... Try again.')).toBe('加载中... 请重试。')
    expect(translate('Saved!. Domain is not properly formatted.')).toBe('已保存！域格式不正确。')
  })

  it('时间与人名列表工具', () => {
    expect(formatClock('12', '05', 'AM', true)).toBe('00:05')
    expect(formatClock('8', '03', 'PM')).toBe('20:03')
    expect(formatClock('02', '03')).toBe('2:03')
    expect(translateAriaDate('9:15 AM on October 19, 2025')).toBe('2025年10月19日 9:15')
    expect(translateCompactDate('11:45AM on June 9, 2014')).toBe('2014年6月9日 11:45')
    expect(() => translateAriaDate('sometime')).toThrow()
    expect(formatPeople('a')).toBe('a')
    expect(formatPeople('a and b')).toBe('a 和 b')
    expect(formatPeople('a, b, and c')).toBe('a、b 和 c')
    expect(formatPeople('a, b, and 3 more')).toBe('a、b 以及其他 3 人')
    expect(formatPeople('You')).toBe('你')
    expect(formatPeople('You and a')).toBe('你和 a')
    expect(formatPeople('a and You')).toBe('a 和你')
    expect(formatPeople('You, a, and 2 more')).toBe('你、a 以及其他 2 人')
    expect(formatPeople('小红 and 小明')).toBe('小红和小明')
    expect(formatPeople('José and Zoë')).toBe('José 和 Zoë')
  })
})

describe('common-ui 完整时间随本地时区', () => {
  afterEach(() => {
    process.env.TZ = 'Asia/Shanghai'
  })

  it('本地时区为 America/Adak：HAST、HADT 是本地时区，不写', () => {
    process.env.TZ = 'America/Adak'
    // 匹配器按原文缓存译文：换了时区要新建
    const adak = createMatcher([['common', commonUi]])

    expect(adak.translate('Jan 15, 2026, 12:05 AM HAST', ['common'])).toBe('2026年1月15日 00:05')
    expect(adak.translate('Jul 15, 2026, 1:05 AM HADT', ['common'])).toBe('2026年7月15日 01:05')
    expect(adak.translate('Jan 15, 2026, 12:05 AM HST', ['common'])).toBe('2026年1月15日 00:05')
  })
})

describe('common-ui 静态词条', () => {
  it.each([
    // 按钮与菜单
    ['Cancel', '取消'],
    ['Save changes', '保存更改'],
    ['Copied!', '已复制！'],
    ['Copy to clipboard', '复制到剪贴板'],
    ['Show less', '显示更少'],
    ['Load more…', '加载更多…'],
    ['More options', '更多选项'],
    ['Open in new tab', '在新标签页中打开'],
    ['Try again.', '请重试。'],
    ['Got it!', '知道了！'],
    ['Star', '星标'],
    ['Starred', '已加星标'],
    ['Lists are currently in beta.', '列表目前为测试版。'],
    ['ProTip!', '提示！'],
    ['Watch', '关注'],
    ['Enable', '启用'],
    ['Disabled', '已禁用'],
    ['Copy path', '复制路径'],
    ['Copy full SHA', '复制完整 SHA'],
    ['Issue', '议题'],
    ['Discussion', '讨论'],
    ['Block', '阻止'],
    ['Unblock', '取消阻止'],
    ['Get started', '开始使用'],
    ['Model', '模型'],
    ['Other', '其他'],
    ['Share feedback', '提供反馈'],
    ['Share feedback and report bugs.', '提供反馈并报告错误。'],
    ['Saving…', '保存中…'],
    ['Saving...', '保存中...'],
    ['Load more...', '加载更多...'],
    ['Remove', '删除'],
    ['View details', '查看详细信息'],
    ['Details', '详细信息'],
    ['History', '历史记录'],
    ['Unlink', '取消链接'],
    ['Starred, click to unstar this repository', '已加星标，单击可取消此存储库的星标'],
    ['to add emoji to the name or description.', '可为名称或描述添加表情符号。'],
    ['Activate', '激活'],
    ['Close settings', '关闭设置'],
    ['Expand side panel', '展开侧边面板'],
    ['Collapse side panel', '折叠侧边面板'],
    ['More Options', '更多选项'],
    ['Display options', '显示选项'],
    ['Dismiss hint', '关闭提示'],
    ['Copy file contents', '复制文件内容'],
    // 筛选、选择面板、分页
    ['Sort by:', '排序依据：'],
    ['Most commented', '评论最多'],
    ['Least commented', '评论最少'],
    ['Filter', '筛选器'],
    ['Clear filters', '清除筛选器'],
    ['Filter items', '筛选条目'],
    ['Search...', '搜索...'],
    ['Fetching items...', '正在获取条目...'],
    ['Remove token', '删除标记'],
    ['(press backspace or delete to remove)', '（按退格键或删除键移除）'],
    ['No matches found', '未找到匹配项'],
    ['Clear selection', '清除选择'],
    ['Select repository', '选择存储库'],
    ['Select an option', '选择选项'],
    ['Select…', '选择…'],
    ['selected', '已选择'],
    ['New activity', '新动态'],
    ['More information available below.', '更多信息见下方。'],
    ['Pagination', '分页'],
    ['Table pagination', '表格分页'],
    ['Previous', '上一页'],
    ['Next Page', '下一页'],
    ['(optional)', '（可选）'],
    ['Suggested', '建议'],
    ['Discard changes?', '放弃更改？'],
    ['Rating', '评分'],
    ['Edit this row', '编辑此行'],
    ['Edit value', '编辑值'],
    // 加载与错误
    ['Loading…', '加载中…'],
    ['Loading...', '加载中...'],
    ['Loading content...', '正在加载内容...'],
    ['Loading details…', '正在加载详细信息…'],
    ['Updating', '更新中'],
    ['Creating...', '创建中...'],
    ['Submitting…', '提交中…'],
    ['Uh oh!', '糟糕！'],
    ['There was an error while loading.', '加载时出错。'],
    ['Sorry, something went wrong.', '抱歉，出错了。'],
    ['Oops, something went wrong.', '糟糕，出错了。'],
    ['Are you sure?', '确定吗？'],
    ['Loading suggestions…', '正在加载建议…'],
    ['Submitting...', '提交中...'],
    ['Changes saved', '更改已保存'],
    ["Couldn't load", '无法加载'],
    ['Unknown error occurred', '发生未知错误'],
    ['Something went wrong, please refresh the page to try again.', '出错了，请刷新页面后重试。'],
    // 两句之间原文是句号，不改逗号
    ['Something went wrong. Please try again.', '出错了。请重试。'],
    ['Something went wrong. Please try again later.', '出错了。请稍后重试。'],
    ['An error occurred. Please try again.', '出错了。请重试。'],
    ['An error occurred, please try again.', '出错了，请重试。'],
    ['An unknown error occurred. Please try again later.', '发生未知错误。请稍后重试。'],
    ['A new version of GitHub is available. Please refresh the page.', 'GitHub 有新版本。请刷新页面。'],
    ['If the problem persists, check the', '如果问题仍然存在，请查看'],
    ['GitHub status page', 'GitHub 状态页'],
    ['This action cannot be undone.', '此操作无法撤销。'],
    ['This cannot be undone', '此操作无法撤销'],
    ['Sign in to view', '登录后查看'],
    ['Hm, something went wrong', '嗯，出错了'],
    ['Runtime error', '运行时错误'],
    // 状态与徽章
    ['Open', '打开'],
    ['Closed', '已关闭'],
    ['Merged', '已合并'],
    ['Draft', '草稿'],
    ['Not planned', '未计划'],
    ['Public', '公共'],
    ['Private', '专用'],
    ['Internal', '内部'],
    ['Verified', '已验证'],
    ['Partially verified', '部分验证'],
    ['Author', '作者'],
    ['First-time contributor', '首次贡献者'],
    ['Bot', '机器人'],
    ['bot', '机器人'],
    ['mannequin', '占位帐户'],
    ['This is a mannequin user.', '这是一个占位帐户。'],
    ['Approved', '已批准'],
    ['Changes requested', '已请求更改'],
    ['Change requested', '已请求更改'],
    ['Locked', '已锁定'],
    ['Answered', '已回答'],
    ['Admin', '管理员'],
    ['Read only', '只读'],
    // 经典页面状态图标的 aria-label（首字母大写版与小写版同译）
    ['Closed as not planned issue', '以未计划关闭的议题'],
    ['Open Pull Request', '打开的拉取请求'],
    ['Draft Pull Request', '草稿拉取请求'],
    ['Merged Pull Request', '已合并的拉取请求'],
    ['Closed Pull Request', '已关闭的拉取请求'],
    // 时间片段
    ['Updated', '更新于'],
    ['on', '于'],
    ['authored', '编写于'],
    ['commented', '评论于'],
    ['Today', '今天'],
    ['Never', '从不'],
    // 评论编辑器
    ['Write', '写入'],
    ['Preview', '预览'],
    ['Heading', '标题'],
    ['Numbered list', '编号列表'],
    ['Reference', '交叉引用'],
    ['Slash commands', '斜杠命令'],
    ['Add a comment', '添加评论'],
    ['Add your comment here...', '在此添加评论...'],
    ['Uploading your files...', '正在上传文件...'],
    ['Filter emoji', '筛选表情符号'],
    ['Markdown is supported', '支持 Markdown'],
    ['is supported', '受支持'],
    ['Table', '表格'],
    ['Insert one of your saved replies', '插入一条已保存回复'],
    ['Filter saved replies', '筛选已保存回复'],
    ['Reopen and comment', '重新打开并评论'],
    ['Try again with a file that’s not empty.', '请使用非空文件重试。'],
    ['for supported file types.', '了解支持的文件类型。'],
    ['Toggle bold formatting on the selected text', '切换所选文本的粗体格式'],
    ["Failed to save comment: Body can't be blank", '保存评论失败：正文不能为空'],
    ['Error rendering preview', '渲染预览时出错'],
    ['Insert Link', '插入链接'],
    ['Link Text', '链接文本'],
    ['Add your answer here...', '在此添加答案...'],
    ['You can create one in your', '如需创建请前往'],
    // 评论菜单、隐藏、举报
    ['Quote reply', '引用回复'],
    ['Copy Markdown', '复制 Markdown'],
    ['Copy markdown', '复制 Markdown'],
    ['Reference in a new issue', '在新议题中引用'],
    ['Issue title', '议题标题'],
    ['Issue body', '议题正文'],
    ['Hide comment', '隐藏评论'],
    ['Report content', '报告内容'],
    ['Report to repository admins', '向存储库管理员报告'],
    ['requesting that maintainers moderate content.', '请求维护者管理内容。'],
    ['Outdated', '过时'],
    ['Off Topic', '偏离主题'],
    ['Choose a reason for hiding this comment', '选择隐藏此评论的原因'],
    ['Cancel hiding comment', '放弃隐藏评论'],
    ['Comment options', '评论选项'],
    ['via email', '通过电子邮件'],
    ['— with', '— 通过'],
    // 评论所指对象已变更：You can also <a>view this object as it appeared at the time of the comment</a>
    ['You can also', '你也可以'],
    ['view this object as it appeared at the time of the comment', '查看此对象在评论时的版本'],
    ['Hidden comment', '已隐藏的评论'],
    ['Spammy', '疑似垃圾帐户'],
    [
      'This user is marked as spammy. Their comments will only show in staff mode.',
      '此用户已被标记为疑似垃圾帐户。其评论仅在员工模式下显示。'
    ],
    [
      'Code of Conduct and should be submitted to the maintainers of this repository for review.',
      '行为准则，应提交给此存储库的维护者审查。'
    ],
    ['blocking a user', '阻止用户'],
    ['Blocking', '阻止'],
    ['Block options', '阻止选项'],
    ['Block a user:', '阻止用户：'],
    ['Until I unblock them', '直到我取消阻止'],
    ['Blocking user…', '正在阻止用户…'],
    ['Unable to block user. Please try again.', '无法阻止用户。请重试。'],
    [
      'prevents them from interacting with your repositories, such as opening or commenting on pull requests or issues, starring, forking, or watching. Learn more about',
      '后，其将无法与你的存储库互动，例如创建或评论拉取请求和议题、加星标、复刻或关注。了解'
    ],
    [
      'Blocking a user prevents them from interacting with repositories of this organization, such as opening or commenting on pull requests or issues. Learn more about',
      '阻止用户后，其将无法与此组织的存储库互动，例如创建或评论拉取请求和议题。了解'
    ],
    [
      'Content in repositories owned by this organization where you have write access will be closed.',
      '此组织拥有且你有写入访问权限的存储库中的相关内容将被关闭。'
    ],
    ['Failed to block user', '阻止用户失败'],
    ['Failed to block user from organization', '在组织中阻止用户失败'],
    ['Failed to unblock user from organization', '在组织中取消阻止用户失败'],
    // 编辑历史
    ['Last edited by', '最后编辑者'],
    ['Most recent', '最新'],
    ['Delete revision', '删除修订'],
    ['(most recent)', '（最新）'],
    ['(deleted)', '（已删除）'],
    ['deleted this content', '删除了此内容'],
    [
      'The most recent revision cannot be deleted. Need to delete sensitive information? Go to the specific edit where the information was added.',
      '无法删除最新修订。需要删除敏感信息？请转到添加该信息的那次编辑。'
    ],
    ['This edit’s content will no longer be visible.', '此编辑的内容将不再可见。'],
    ['This edit’s content will no longer be visible', '此编辑的内容将不再可见'],
    ["This edit's content will no longer be visible.", '此编辑的内容将不再可见。'],
    ["This edit's content will no longer be visible", '此编辑的内容将不再可见'],
    ["Couldn't display edit history diff", '无法显示编辑历史记录差异'],
    // 评论出错（两句之间原文是句号）
    ['There was a problem saving your comment. Please try again.', '保存评论时出现问题。请重试。'],
    ['There was a problem saving your comment. Please reload the page and try again.', '保存评论时出现问题。请重新加载页面后重试。'],
    ['Could not add reaction. Please try again.', '无法添加反应。请重试。'],
    ['Could not subscribe. Please try again.', '无法订阅。请重试。'],
    ['Could not unsubscribe. Please try again.', '无法取消订阅。请重试。'],
    // 反应
    ['thumbs up', '点赞'],
    ['hooray', '欢呼'],
    ['Add or remove reactions', '添加或删除反应'],
    ['All reactions', '所有反应'],
    ['Thumbs up', '点赞'],
    ['Pick your reaction', '选择反应'],
    ['Reacted by', '反应来自'],
    ['You reacted', '你做出了反应'],
    // 线程订阅
    ['You’re not receiving notifications from this thread.', '你不会收到此线程的通知。'],
    ['You’ve been unsubscribed from this thread.', '你已取消订阅此线程。'],
    // 未登录评论区
    ['Sign up for free', '免费注册'],
    ['. Already have an account?', '。已有帐户？'],
    ['Sign in to comment', '登录后评论'],
    ['to subscribe to this conversation on GitHub', '以订阅 GitHub 上的此对话'],
    // 锁定横幅、底部赞助提示（被 strong 拆开的片段）
    ['This conversation has been locked as', '此对话已锁定为'],
    ['and limited to collaborators.', '并限制为仅协作者可评论。'],
    ['Show your support for', '赞助'],
    ['by sponsoring them.', '以示支持。'],
    // 悬停卡片
    ['Press escape to close this hovercard', '按 Esc 关闭此悬停卡片'],
    ['Repository Hovercard', '存储库悬停卡片'],
    ['User Hovercard', '用户悬停卡片'],
    ['Pull Request Hovercard', '拉取请求悬停卡片'],
    ['Hovercard is unavailable', '悬停卡片不可用'],
    ['Owns this repository', '拥有此存储库'],
    // 方案名 Pro 译“专业版”（product-names.md）
    ['User pro badge', '专业版徽章'],
    ['Opened this issue', '打开了此议题'],
    ['Opened this pull request', '创建了此拉取请求'],
    ['Opened this pull request (their first ever)', '创建了此拉取请求（其第一个拉取请求）'],
    ['Opened this discussion', '发起了此讨论'],
    ['Started this discussion', '发起了此讨论'],
    ['Member of', '所属组织'],
    ['You left a review', '你提交了审查'],
    ['Left a review', '提交了审查'],
    // 你与议题、拉取请求的关系
    ['You opened this issue', '你打开了此议题'],
    ['You commented on this issue', '你评论了此议题'],
    ['You commented on and opened this issue', '你打开并评论了此议题'],
    ['You were mentioned on and commented on this issue', '你在此议题中被提及并发表了评论'],
    ['You opened this pull request', '你创建了此拉取请求'],
    ['You commented on this pull request', '你评论了此拉取请求'],
    ['You commented on and opened this pull request', '你创建并评论了此拉取请求'],
    ['You were mentioned on and commented on this pull request', '你在此拉取请求中被提及并发表了评论'],
    ['You were mentioned on and opened this pull request', '你创建了此拉取请求并在其中被提及'],
    ['You are assigned to this pull request', '你是此拉取请求的受理人'],
    ['You are assigned to and opened this pull request', '你创建了此拉取请求且是其受理人'],
    ['Git-commit', '提交'],
    ['Check-circle', '已回答']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Cancel\n', ['common'])).toBe('  取消\n')
  })

  it('不收录其它词典已有或易与用户内容同形的词', () => {
    for (const word of [
      'Saved replies',
      'Leave a comment',
      'Attach files',
      'Paste, drop, or click to add files',
      'Block user',
      'Mannequin',
      'Label: Pro',
      'Sponsor',
      'Follow',
      'Code',
      'Search',
      'Error',
      'Notifications',
      'Subscribe',
      'Revoked',
      'Type',
      'Beta',
      'Less',
      'open',
      'React',
      'Alerts',
      'On',
      'Off',
      'Run',
      // 表情别名保持英文
      'heart',
      'rocket',
      'eyes',
      'confused',
      'smile',
      '+1',
      // 过于常见的片段
      'from',
      // 被元素拆开的句子只按整句收录（行内句、整段合并），片段不单独收录
      'Are you sure you want to unblock',
      'Showing',
      'through',
      'of',
      // DataTable 页码按钮里读屏用的词，与可见页码分属不同节点
      'Page',
      'page'
    ]) {
      expect(commonUi.static?.[word]).toBeUndefined()
    }
  })

  it('悬停卡片中的简介、所在地、个人状态与正文摘要整块忽略', () => {
    expect(matcher.ignoreSelectors(['common'])).toEqual(
      expect.arrayContaining([
        '.markdown-body-short',
        '.js-hovercard-content .dashboard-break-word',
        '.js-hovercard-content address',
        '.js-hovercard-content .user-status-message-wrapper'
      ])
    )
  })
})

/** Primer ConfirmationDialog（组织取消阻止）：标题、正文（Dialog.Body）、底部按钮 */
const UNBLOCK_FROM_ORG_DIALOG =
  '<div role="alertdialog" aria-modal="true" class="prc-Dialog-Dialog-G8cDF" data-component="ConfirmationDialog">' +
  '<div class="prc-Dialog-Header-f7Me-" data-component="Dialog.Header"><div class="prc-Dialog-HeaderInner-H-fFY">' +
  '<div class="prc-Dialog-HeaderContent-mjAsn"><h1 class="prc-Dialog-Title-M-iPn" data-component="Dialog.Title">' +
  'Unblock octocat from octo-org</h1></div></div></div>' +
  '<div class="prc-Dialog-Body-bB903" data-component="Dialog.Body">' +
  'Are you sure you want to unblock <strong>octocat</strong> from <strong>octo-org</strong>?</div>' +
  '<div class="prc-Dialog-Footer-a1b2c" data-component="Dialog.Footer"><button type="button">Cancel</button></div></div>'

/** 个人阻止对话框正文中 strong 与链接之间的文字 */
const BLOCK_PROSE =
  ' prevents them from interacting with your repositories, such as opening or commenting on pull requests or issues, starring, forking, or watching. Learn more about'

/** 个人阻止对话框正文：Blocking <strong>@user</strong> prevents them … Learn more about <a>blocking a user</a>. */
const BLOCK_DIALOG_BODY = `<div role="dialog"><p>Blocking <strong>@octocat</strong>${BLOCK_PROSE} <a href="#">blocking a user</a>.</p></div>`

/** 按 React 的子节点拆开文本：["Blocking ", <strong>["@", 用户名]</strong>, 正文, " ", <a>…</a>, "."] */
function splitBlockDialog(body: HTMLElement): void {
  const strong = body.querySelector('p > strong')!
  const login = strong.firstChild as Text
  login.splitText(1)
  const prose = strong.nextSibling as Text
  prose.splitText(BLOCK_PROSE.length)
}

/** Primer DataTable 分页（组织赞助页 /orgs/<org>/sponsoring，采集自 .harvest/scratch/po/live/org-sponsoring2） */
const TABLE_PAGINATION =
  '<nav aria-label="Table pagination" class="TablePagination prc-DataTable-TablePagination-AJ0K7" data-component="Table.Pagination">' +
  '<span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB"><div>Showing <!-- -->1<!-- --> through <!-- -->10<!-- --> of <!-- -->24</div></span>' +
  '<p class="TablePaginationRange prc-DataTable-TablePaginationRange-R7KK2" data-component="Table.Pagination.Range">' +
  '1<span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB">&nbsp;through&nbsp;</span><span aria-hidden="true">‒</span>10<!-- --> of <!-- -->24</p>' +
  '<ol class="TablePaginationSteps prc-DataTable-TablePaginationSteps-Vxbth" data-hidden-viewport-ranges="narrow">' +
  '<li class="TablePaginationStep" data-component="Table.Pagination.Step"><button class="TablePaginationAction" type="button" aria-disabled="true" data-component="Table.Pagination.PreviousPageButton">' +
  '<span>Previous</span><span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB">&nbsp;page</span></button></li>' +
  '<li class="TablePaginationStep" data-component="Table.Pagination.Step"><button class="TablePaginationPage" type="button" data-active="true" aria-current="true" data-component="Table.Pagination.Page">' +
  '<span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB">Page&nbsp;</span>1</button></li>' +
  '<li class="TablePaginationStep" data-component="Table.Pagination.Step"><button class="TablePaginationAction" type="button" data-has-page="true" data-component="Table.Pagination.NextPageButton">' +
  '<span>Next</span><span class="prc-VisuallyHidden-VisuallyHidden-Q0qSB">&nbsp;page</span>' +
  '<svg aria-hidden="true" class="octicon octicon-chevron-right" viewBox="0 0 16 16" width="16" height="16"><path d="M6.22 3.22"></path></svg></button></li>' +
  '</ol></nav>'

/** 简体正式语言包：与页面词典配合的用例 */
const cnMatcher = createMatcher(zhCN)

describe('common-ui 被元素拆开的句子（DOM）', () => {
  let translator: Translator | undefined

  function start(html: string, prepare?: (body: HTMLElement) => void): HTMLElement {
    document.body.innerHTML = html
    prepare?.(document.body)
    translator = createTranslator({ matcher, host: window, resolvePages: () => ['common'] })
    translator.start()
    return document.body
  }

  /** 元素的直接子文本节点 */
  function ownTexts(element: Element): string[] {
    return [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => (node as Text).data)
  }

  /** 等待变动回调处理完 */
  function settle(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('组织取消阻止对话框：正文按行内句整句翻译，用户名与组织名不动', () => {
    const body = start(UNBLOCK_FROM_ORG_DIALOG)
    const dialogBody = body.querySelector('[data-component="Dialog.Body"]')!
    expect(dialogBody.textContent).toBe('确定要取消阻止 octocat 访问 octo-org 吗？')
    expect(ownTexts(dialogBody)).toEqual(['确定要取消阻止 ', ' 访问 ', ' 吗？'])
    expect([...dialogBody.querySelectorAll('strong')].map(strong => strong.textContent)).toEqual(['octocat', 'octo-org'])
    expect(body.querySelector('[data-component="Dialog.Title"]')?.textContent).toBe('在 octo-org 中取消阻止 octocat')
    expect(body.querySelector('[data-component="Dialog.Footer"] button')?.textContent).toBe('取消')
  })

  it('个人取消阻止对话框：React 拆出的三个相邻文本节点按整句正则翻译', () => {
    // children: ["Are you sure you want to unblock @", login, "?"]
    const body = start(
      '<div class="prc-Dialog-Body-bB903" data-component="Dialog.Body">Are you sure you want to unblock @octocat?</div>',
      root => {
        const first = root.querySelector('[data-component="Dialog.Body"]')!.firstChild as Text
        first.splitText('Are you sure you want to unblock @'.length).splitText('octocat'.length)
      }
    )
    const dialogBody = body.querySelector('[data-component="Dialog.Body"]')!
    expect(dialogBody.childNodes).toHaveLength(3)
    expect(dialogBody.textContent).toBe('确定要取消阻止 @octocat 吗？')
  })

  it('个人阻止对话框：正文按行内句整句翻译，用户名不动，链接文字照常翻译', () => {
    const prose = start(BLOCK_DIALOG_BODY, splitBlockDialog).querySelector('p')!
    expect(prose.textContent).toBe(
      '阻止 @octocat 后，其将无法与你的存储库互动，例如创建或评论拉取请求和议题、加星标、复刻或关注。了解阻止用户。'
    )
    expect(prose.querySelector('strong')?.textContent).toBe('@octocat')
    expect(prose.querySelector('a')?.textContent).toBe('阻止用户')
  })

  it('DataTable 分页：aria-label、读屏播报与合并后的可见范围；页码不动', () => {
    const nav = start(TABLE_PAGINATION).querySelector('nav')!
    expect(nav.getAttribute('aria-label')).toBe('表格分页')
    expect(nav.querySelector('span > div')?.textContent).toBe('显示 24 个中的第 1 至 10 个')
    const range = nav.querySelector('[data-component="Table.Pagination.Range"]')!
    expect(range.textContent).toBe('24 个中的第 1‒10 个')
    expect(range.firstChild?.textContent).toBe('24 个中的第 1‒10 个')
    expect(nav.querySelector('[data-component="Table.Pagination.PreviousPageButton"] > span')?.textContent).toBe('上一页')
    expect(nav.querySelector('[data-component="Table.Pagination.NextPageButton"] > span')?.textContent).toBe('下一页')
    expect(nav.querySelector('[data-component="Table.Pagination.Page"]')?.lastChild?.textContent).toBe('1')
  })

  it('DataTable 翻页：React 改写数字后读屏播报与可见范围整段重算', async () => {
    const nav = start(TABLE_PAGINATION).querySelector('nav')!
    const status = nav.querySelector('span > div')!
    const range = nav.querySelector('[data-component="Table.Pagination.Range"]')!
    // React 只改写变化的数字文本节点：播报中的 1 / 10，可见范围中的 1 / 10
    const statusNumbers = [...status.childNodes].filter(node => node.nodeType === Node.TEXT_NODE) as Text[]
    statusNumbers[1]!.data = '11'
    statusNumbers[3]!.data = '20'
    const rangeNumbers = [...range.childNodes].filter(node => node.nodeType === Node.TEXT_NODE) as Text[]
    rangeNumbers[0]!.data = '11'
    rangeNumbers[1]!.data = '20'
    await settle()
    expect(status.textContent).toBe('显示 24 个中的第 11 至 20 个')
    expect(range.textContent).toBe('24 个中的第 11‒20 个')
  })

  it('底部赞助提示：被 strong 拆开的前后两段按顺序拼读，用户名不动', () => {
    const body = start('<p>Show your support for <strong>octocat</strong> by sponsoring them.</p>')
    const prompt = body.querySelector('p')!
    expect(prompt.textContent).toBe('赞助 octocat 以示支持。')
    expect(prompt.querySelector('strong')?.textContent).toBe('octocat')
  })

  /** 用正式语言包按拉取请求页翻译：锁定原因词由 pulls 词典翻译 */
  function startPulls(html: string, full: Matcher): HTMLElement {
    document.body.innerHTML = html
    translator = createTranslator({
      matcher: full,
      host: window,
      resolvePages: () => ['common', 'repository', 'pulls']
    })
    translator.start()
    return document.body
  }

  const LOCK_BANNER = 'This conversation has been locked as <strong>spam</strong> and limited to collaborators.'

  it.each([
    ['无图标', '', '此对话已因垃圾信息而锁定并限制为仅协作者可评论。'],
    ['前有图标', '<svg aria-hidden="true" class="octicon octicon-lock"></svg> ', ' 此对话已因垃圾信息而锁定并限制为仅协作者可评论。']
  ])('锁定横幅（%s）：被 strong 拆开的整句按行内句翻译，原因词由 pulls 词典翻译', (_, icon, expected) => {
    const banner = startPulls(`<div class="flash">${icon}${LOCK_BANNER}</div>`, cnMatcher).querySelector('.flash')!
    expect(banner.textContent).toBe(expected)
    expect(banner.querySelector('strong')?.textContent).toBe('垃圾信息')
  })

  it('锁定横幅后接链接：句尾的元素原样带回，链接文字照常翻译', () => {
    const html = `<div class="flash">${LOCK_BANNER} <a href="#">Learn more</a></div>`
    const banner = startPulls(html, cnMatcher).querySelector('.flash')!
    expect(banner.textContent).toBe('此对话已因垃圾信息而锁定并限制为仅协作者可评论。了解更多')
    expect(banner.querySelector('strong')?.textContent).toBe('垃圾信息')
    expect(banner.querySelector('a')?.textContent).toBe('了解更多')
  })

  it('锁定横幅（繁体）：整句按行内句翻译', () => {
    const html = `<div class="flash">${LOCK_BANNER.replace('spam', 'off-topic')}</div>`
    expect(startPulls(html, twMatcher).querySelector('.flash')?.textContent).toBe('此對話已因離題而鎖定並限制為僅協作者可留言。')
  })

  /** 用正式语言包按议题页或拉取请求页翻译 */
  function startRepoPage(page: 'issues' | 'pulls', html: string, full: Matcher, prepare?: (body: HTMLElement) => void): HTMLElement {
    document.body.innerHTML = html
    prepare?.(document.body)
    translator = createTranslator({ matcher: full, host: window, resolvePages: () => ['common', 'repository', page] })
    translator.start()
    return document.body
  }

  it.each(['issues', 'pulls'] as const)(
    '个人阻止对话框（繁体，%s）：正文整句译「封鎖」，议题依赖关系的 Blocking 仍按 scoped 译「阻擋」',
    page => {
      const body = startRepoPage(page, `${BLOCK_DIALOG_BODY}<h3>Blocking</h3>`, twMatcher, splitBlockDialog)
      expect(body.querySelector('p')?.textContent).toBe(
        '封鎖 @octocat 後，對方將無法與你的儲存庫互動，例如建立拉取請求或議題、在其中留言、加星號、分叉或關注。瞭解封鎖使用者。'
      )
      expect(body.querySelector('p strong')?.textContent).toBe('@octocat')
      expect(body.querySelector('h3')?.textContent).toBe('阻擋')
    }
  )
})

/** 繁体：用正式语言包按 common 作用域翻译 */
const twMatcher = createMatcher(zhTW)

describe('common-ui 繁体词条', () => {
  it.each([
    // 按钮与菜单
    ['Activate', '啟用'],
    ['Close settings', '關閉設定'],
    ['Collapse side panel', '摺疊側邊面板'],
    ['Copy file contents', '複製檔案內容'],
    ['Edit this row', '編輯此列'],
    // 加载与错误
    ['Hm, something went wrong', '嗯，發生錯誤'],
    ['Runtime error', '執行階段錯誤'],
    // 状态与徽章
    ['Read only', '唯讀'],
    ['Change requested', '已要求變更'],
    ['Closed as not planned issue', '已關閉並標示為不予處理的議題'],
    ['Open Pull Request', '開放中的拉取請求'],
    // 评论编辑器
    ['Link Text', '連結文字'],
    ['Add your answer here...', '在此新增答案...'],
    ['You can create one in your', '如需建立請前往'],
    // 评论
    ['Issue body', '議題內文'],
    ['You can also', '你也可以'],
    ['view this object as it appeared at the time of the comment', '查看此物件在留言當時的版本'],
    ['You reacted', '你做出表情回應'],
    ['You and 2 others reacted', '你和其他 2 人做出表情回應'],
    ['You and 1 other reacted', '你和其他 1 人做出表情回應'],
    ['You’ve been unsubscribed from this thread.', '你已取消訂閱此討論串。'],
    ['to subscribe to this conversation on GitHub', '以訂閱 GitHub 上的此對話'],
    ['This conversation has been locked as', '此對話已鎖定為'],
    ['and limited to collaborators.', '並限制為僅協作者可留言。'],
    ['Show your support for', '贊助'],
    ['by sponsoring them.', '以示支持。'],
    // 悬停卡片
    ['Left a review', '送出了審查'],
    ['Opened this pull request (their first ever)', '建立了此拉取請求（其第一個拉取請求）'],
    ['You commented on and opened this issue', '你建立了此議題並留言'],
    ['You were mentioned on and commented on this pull request', '你在此拉取請求中被提及並留言'],
    ['You are assigned to this pull request', '你是此拉取請求的負責人']
  ])('%s → %s', (input, expected) => {
    expect(twMatcher.translate(input, ['common'])).toBe(expected)
  })
})
