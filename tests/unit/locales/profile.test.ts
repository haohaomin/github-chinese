import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { LIST_NAME_SELECTORS } from '../../../src/core/ignore'
import { createMatcher, normalizeText, type Matcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import counts from '../../../src/locales/zh-CN/common-ui/counts'
import time from '../../../src/locales/zh-CN/common-ui/time'
import { zhCN } from '../../../src/locales/zh-CN/index'
import organization from '../../../src/locales/zh-CN/organization'
import profile from '../../../src/locales/zh-CN/profile'
import { STAR_LIST_NAMES } from '../../../src/locales/zh-CN/profile/tabs'
import { zhTW } from '../../../src/locales/zh-TW/index'
import { STAR_LIST_NAMES as TW_STAR_LIST_NAMES } from '../../../src/locales/zh-TW/profile/tabs'

const matcher = createMatcher([['profile', profile]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'profile'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 头部与侧栏
  {
    hits: [
      ['12 following', '正在关注 12 人'],
      ['1.2k following', '正在关注 1.2k 人']
    ],
    // N followers 由 common-ui 的通用计数规则翻译
    misses: ['many following', '329k followers']
  },
  { hits: [['Sponsor @sindresorhus', '赞助 @sindresorhus']], misses: ['Sponsor sindresorhus'] },
  { hits: [['Block or report octocat', '阻止或举报 octocat']], misses: ['Block or report the user'] },
  {
    hits: [
      ['Organization: Linux Foundation', '组织：Linux Foundation'],
      ['Organization: @vercel | @nuxt', '组织：@vercel | @nuxt']
    ],
    misses: ['Organizations: Linux Foundation']
  },
  { hits: [['Home location: Portland, OR', '所在地：Portland, OR']], misses: ['Home: Portland, OR'] },
  { hits: [['Email: octocat@github.com', '电子邮件：octocat@github.com']], misses: ['Email: not provided'] },
  {
    hits: [
      ['- 1h ahead', '- 快1小时'],
      ['- 7h behind', '- 慢7小时'],
      // 脚本写入的半小时时区：时与分之间没有空格
      ['- 2h30m behind', '- 慢2小时 30分钟'],
      ['- 5h30m ahead', '- 快5小时 30分钟'],
      ['- 5h 30m ahead', '- 快5小时 30分钟'],
      ['- 5.5h ahead', '- 快5.5小时'],
      ['- 30m behind', '- 慢30分钟']
    ],
    // 时间相同时脚本整段写入「- same time」，不带前导 - 的写法不收录
    misses: ['- 1 hour ahead', '- 2h30 behind', 'same time']
  },
  { hits: [['+ 12 more', '另有 12 个']], misses: ['+ more'] },
  {
    hits: [
      ['3 security advisory credits', '3 次安全公告致谢'],
      ['1 security advisory credit', '1 次安全公告致谢']
    ],
    misses: ['security advisory credits: 3']
  },
  { hits: [['Link to social profile 1', '社交帐户链接 1']], misses: ['Link to social profile'] },
  {
    hits: [
      ['Move hello-world up', '上移 hello-world'],
      ['Move Spoon-Knife down', '下移 Spoon-Knife']
    ],
    misses: ['Move up', 'Move to top']
  },

  // 贡献图
  {
    hits: [
      ['3,928 contributions in the last year', '过去一年共 3,928 次贡献'],
      ['1 contribution in the last year', '过去一年共 1 次贡献']
    ],
    misses: ['Many contributions in the last year']
  },
  {
    hits: [['12 contributions in the last year in vuejs', '过去一年在 vuejs 中共 12 次贡献']],
    misses: ['contributions in the last year in vuejs']
  },
  { hits: [['4 contributions in 2011', '2011年共 4 次贡献']], misses: ['4 contributions in 11'] },
  {
    hits: [['1 contribution in 2024 in octo-org', '2024年在 octo-org 中共 1 次贡献']],
    misses: ['1 contribution in 2024 in the octo-org organization']
  },
  {
    hits: [
      ['2 contributions on October 28th.', '10月28日有 2 次贡献。'],
      ['1 contribution on September 21st.', '9月21日有 1 次贡献。'],
      ['47 contributions on February 2nd.', '2月2日有 47 次贡献。']
    ],
    misses: ['2 contributions on Oct 28th.']
  },
  {
    hits: [['No contributions on December 15th.', '12月15日没有贡献。']],
    misses: ['No contributions on 15 December.']
  },
  {
    hits: [['Contribution activity in 2026, 1 of 16', '2026年贡献活动，16 项中的第 1 项']],
    misses: ['Contribution activity in 2026']
  },

  // 活动概述
  {
    hits: [
      ['and 566 other repositories', '以及其他 566 个存储库'],
      ['and 1 other repository', '以及其他 1 个存储库']
    ],
    misses: ['and other repositories']
  },

  // 贡献活动时间线
  {
    hits: [
      ['Created 403 commits in 2 repositories', '在 2 个存储库中创建了 403 个提交'],
      ['Created 1,080 commits in 44 repositories', '在 44 个存储库中创建了 1,080 个提交'],
      ['Created 1 commit in 1 repository', '在 1 个存储库中创建了 1 个提交']
    ],
    misses: ['Created commits in 2 repositories']
  },
  {
    hits: [
      ['Created 5 repositories', '创建了 5 个存储库'],
      ['Created 1 other repository', '创建了 1 个其他存储库']
    ],
    misses: ['Created a repository']
  },
  {
    // 拉取请求的 open 作“创建”，问题仍作“打开”
    hits: [
      ['Opened 148 other pull requests in 3 repositories', '在 3 个存储库中创建了 148 个其他拉取请求'],
      ['Opened 1 pull request in 1 repository', '在 1 个存储库中创建了 1 个拉取请求']
    ],
    misses: ['Opened pull requests in 3 repositories']
  },
  {
    hits: [
      ['Opened 6 other issues in 4 repositories', '在 4 个存储库中打开了 6 个其他议题'],
      ['Opened 2 issues in 1 repository', '在 1 个存储库中打开了 2 个议题']
    ],
    misses: ['Opened 6 issues']
  },
  {
    hits: [['Reviewed 2 pull requests in 2 repositories', '在 2 个存储库中审查了 2 个拉取请求']],
    misses: ['Reviewed 2 pull requests']
  },
  {
    hits: [
      ['Started 3 discussions in 2 repositories', '在 2 个存储库中发起了 3 个讨论'],
      ['Started 1 other discussion in 1 repository', '在 1 个存储库中发起了 1 个其他讨论']
    ],
    misses: ['Started a discussion in vuejs/core']
  },
  {
    hits: [['Answered 4 discussions in 3 repositories', '在 3 个存储库中回答了 4 个讨论']],
    misses: ['Answered 4 discussions']
  },
  { hits: [['19 repositories not shown', '另有 19 个存储库未显示']], misses: ['Some repositories not shown'] },
  {
    hits: [['2 contributions in private repositories', '专用存储库中的 2 次贡献']],
    misses: ['Many contributions in private repositories']
  },
  { hits: [['that received 10 comments', '收到 10 条评论']], misses: ['that received comments'] },
  {
    hits: [
      ['Created a pull request in torvalds/linux that received 10 comments', '在 torvalds/linux 中创建的拉取请求收到 10 条评论'],
      ['Created an issue in octo-org/hello-world that received 1 comment', '在 octo-org/hello-world 中创建的议题收到 1 条评论']
    ],
    misses: ['Created a pull request in torvalds/linux']
  },
  { hits: [['Joined the vuejs organization', '加入了 vuejs 组织']], misses: ['Joined the organization'] },
  { hits: [['1 of 3 tasks', '3 个任务中已完成 1 个']], misses: ['one of three tasks'] },
  { hits: [['1 task', '1 个任务']], misses: ['tasks'] },
  { hits: [['Progress: 0.0%', '进度：0.0%']], misses: ['Progress: done'] },
  {
    hits: [['81% of commits in October were made to octo-org/hello-world', '10月的提交中有 81% 提交到 octo-org/hello-world']],
    misses: ['81% of commits were made to octo-org/hello-world']
  },
  {
    hits: [['Only people who can see torvalds/linux can see this contribution', '只有能查看 torvalds/linux 的人才能看到此贡献']],
    misses: ['Only people who can see this contribution']
  },
  {
    hits: [['octocat has no activity yet for this period.', 'octocat 在此期间暂无活动。']],
    misses: ['No activity yet for this period.']
  },
  {
    hits: [['octocat had no activity during this period.', 'octocat 在此期间没有活动。']],
    misses: ['No activity during this period.']
  },
  {
    hits: [['octocat has no activity in vuejs yet for this period.', 'octocat 在此期间暂未在 vuejs 中活动。']],
    misses: ['octocat has no activity in the vuejs organization yet.']
  },
  {
    hits: [['octocat had no activity in vuejs during this period.', 'octocat 在此期间未在 vuejs 中活动。']],
    misses: ['octocat had no activity in vuejs.']
  },
  {
    hits: [
      ["@octocat's activity is private", '@octocat 的活动为私密'],
      ['@mona-lisa’s activity is private', '@mona-lisa 的活动为私密']
    ],
    misses: ["octocat's activity is private"]
  },
  {
    hits: [['This contribution was made on Oct 21', '此贡献发生于 10月21日']],
    misses: ['This contribution was made yesterday']
  },
  {
    hits: [['Oct 1 – Oct 25', '10月1日 – 10月25日']],
    misses: ['Oct 1 - Oct 25']
  },
  {
    hits: [['octocat (The Octocat) / September 2026', 'octocat (The Octocat) / 2026年9月']],
    misses: ['octocat / Sept 2026']
  },

  // 星标标签页
  {
    hits: [
      ['Type: Forks', '类型：复刻'],
      ['Type: All', '类型：全部'],
      ['Type: Can be sponsored', '类型：可赞助']
    ],
    misses: ['Type: Unknown']
  },
  {
    hits: [
      ['Language: Swift', '语言：Swift'],
      ['Language: All', '语言：全部']
    ],
    misses: ['Languages: Swift']
  },
  {
    hits: [
      ['Sort by: Recently starred', '排序依据：最近星标'],
      ['Sort by: Most stars', '排序依据：星标最多']
    ],
    misses: ['Sort by: Name']
  },

  // 存储库条目
  {
    hits: [
      ['1 issue needs help', '1 个议题需要帮助'],
      ['3 issues need help', '3 个议题需要帮助']
    ],
    misses: ['issues need help']
  },

  // 空状态
  {
    hits: [
      ['torvalds doesn’t have any repositories that match.', 'torvalds 没有匹配的存储库。'],
      ['monalisa doesn’t have any public repositories yet.', 'monalisa 还没有公共存储库。'],
      ["You don't have any repositories yet.", '你还没有存储库。']
    ],
    misses: ['torvalds has no repositories.']
  },
  {
    hits: [['sindresorhus doesn’t have any starred repositories yet.', 'sindresorhus 还没有已加星标的存储库。']],
    misses: ['No starred repositories yet.']
  },
  {
    hits: [
      ['monalisa doesn’t have any followers yet.', 'monalisa 还没有关注者。'],
      ["You don't have any followers yet.", '你还没有关注者。']
    ],
    misses: ['monalisa has no followers.']
  },
  {
    hits: [
      ['torvalds isn’t following anybody.', 'torvalds 还没有关注任何人。'],
      ["You aren't following anybody.", '你还没有关注任何人。']
    ],
    misses: ['torvalds is following nobody.']
  },
  {
    hits: [["That's it. You've reached the end of sindresorhus's stars.", '已显示 sindresorhus 的全部星标。']],
    misses: ["That's it."]
  },
  {
    // 原文只有 and、没有逗号：用“和”，不加顿号
    hits: [
      ['0 open and 0 closed projects found.', '找到 0 个打开和 0 个已关闭的项目。'],
      ['3 open and 1 closed project found.', '找到 3 个打开和 1 个已关闭的项目。']
    ],
    misses: ['No projects found.']
  },

  // 赞助标签页
  {
    hits: [['Sponsoring since January 31, 2022', '赞助始于 2022年1月31日']],
    misses: ['Sponsoring since last year']
  },
  {
    hits: [['Sponsored on October 31, 2021', '赞助于 2021年10月31日']],
    misses: ['Sponsored yesterday']
  },

  // 包标签页
  {
    hits: [
      ['Learn more about Apache Maven', '了解 Apache Maven'],
      ['Learn more about Containers', '了解容器']
    ],
    misses: ['Learn more about Gradle']
  },

  // 标签页标题段
  {
    hits: [
      ['torvalds (Linus Torvalds) / Repositories', 'torvalds (Linus Torvalds) / 存储库'],
      ['sindresorhus / Sponsoring', 'sindresorhus / 正在赞助'],
      ['antfu (Anthony Fu) / Achievements', 'antfu (Anthony Fu) / 成就'],
      ['sindresorhus (Sindre Sorhus) / starred topics', 'sindresorhus (Sindre Sorhus) / 已加星标的主题']
    ],
    misses: ['torvalds / Gists']
  },
  {
    hits: [
      ["sindresorhus's list / My open-source apps", 'sindresorhus 的列表 / My open-source apps'],
      // 预置列表名与列表名区域同译；与原型属性同名的列表名保持原文
      ["octocat's list / ✨ Inspiration", 'octocat 的列表 / ✨ 灵感'],
      ['octocat’s list / 🔮 Future ideas', 'octocat 的列表 / 🔮 未来构想'],
      ["octocat's list / constructor", 'octocat 的列表 / constructor'],
      // 列表名与标签页同名时仍按列表页翻译
      ["octocat's list / Projects", 'octocat 的列表 / Projects'],
      ["octocat's list / Ideas / Projects", 'octocat 的列表 / Ideas / Projects']
    ],
    misses: ['sindresorhus list / apps']
  },

  // 成就
  { hits: [['Pull Shark details', 'Pull Shark 详细信息']], misses: ['Unknown Badge details'] },
  { hits: [['Achievement: YOLO', '成就：YOLO']], misses: ['Achievement: Unknown'] },
  { hits: [['100% unlocked', '已解锁 100%']], misses: ['unlocked'] },
  {
    hits: [
      ['2nd pull request merged', '第 2 个合并的拉取请求'],
      ['1024th pull request merged', '第 1024 个合并的拉取请求']
    ],
    misses: ['pull request merged']
  },
  { hits: [['1st sponsorship', '第 1 次赞助']], misses: ['first sponsorship'] },
  { hits: [['32nd accepted answer', '第 32 个被采纳的回答']], misses: ['accepted answer'] },
  {
    hits: [
      ['⭐️ 16 stars', '⭐️ 16 个星标'],
      ['⭐ 4096 stars', '⭐️ 4096 个星标']
    ],
    misses: ['🌟 16 stars']
  },
  {
    hits: [['@antfu opened pull requests that have been merged.', '@antfu 创建的拉取请求已被合并。']],
    misses: ['antfu opened pull requests that have been merged.']
  },
  {
    hits: [['@antfu is sponsoring 12 organizations or users.', '@antfu 正在赞助 12 个组织或用户。']],
    misses: ['@antfu is sponsoring many users.']
  },
  {
    hits: [['@antfu coauthored commits on merged pull requests.', '@antfu 在已合并的拉取请求中合著了提交。']],
    misses: ['@antfu coauthored commits.']
  },
  { hits: [['@antfu answered discussions.', '@antfu 回答了讨论。']], misses: ['@antfu answered questions.'] },
  {
    hits: [['@antfu created a repository that has many stars.', '@antfu 创建了获得大量星标的存储库。']],
    misses: ['@antfu created a repository.']
  },
  {
    hits: [['@antfu contributed code to several repositories in the', '@antfu 贡献过代码的多个存储库收录于']],
    misses: ['@antfu contributed code to several repositories']
  },
  {
    hits: [['@torvalds contributed code to 1 repository used in the', '@torvalds 贡献过代码的 1 个存储库用于']],
    misses: ['@torvalds contributed code to a repository used in the']
  },
  {
    hits: [['The Pull Shark achievement will now be hidden from your profile.', 'Pull Shark 成就将不再显示在你的个人资料中。']],
    misses: ['The achievement will now be hidden from your profile.']
  },
  {
    hits: [['The YOLO achievement will now be shown in your profile.', 'YOLO 成就将显示在你的个人资料中。']],
    misses: ['The Unknown achievement will now be shown in your profile.']
  },

  // 编辑资料：时区下拉
  {
    hits: [
      ['(GMT+08:00) Beijing', '(GMT+08:00) 北京'],
      ['(GMT-08:00) Pacific Time (US & Canada)', '(GMT-08:00) 太平洋时间（美国和加拿大）'],
      ['(GMT+05:30) New Delhi', '(GMT+05:30) 新德里']
    ],
    misses: ['(GMT+08:00) Atlantis', 'GMT+08:00 Beijing']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('profile 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(profile.static?.[input]).toBeUndefined()
    expect(profile.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = profile.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['3,928', ' contributions in the last year'].join('')))).toBe('过去一年共 3,928 次贡献')
    expect(translate(normalizeText(['20.8k', ' following'].join('')))).toBe('正在关注 20.8k 人')
  })

  it('拆开的片段单独命中', () => {
    expect(translate('followers')).toBe('个关注者')
    expect(translate('follower')).toBe('个关注者')
    expect(translate('following')).toBe('正在关注')
    expect(translate('that received 10 comments')).toBe('收到 10 条评论')
  })
})

describe('profile 静态词条', () => {
  it.each([
    ['Overview', '概述'],
    ['Edit profile', '编辑个人资料'],
    ['Follow', '关注'],
    ['Unfollow', '取消关注'],
    ['Pinned', '置顶'],
    ['Popular repositories', '热门存储库'],
    ['Customize your pins', '自定义置顶项'],
    ['Drag to reorder', '拖动以调整顺序'],
    ['Block or Report', '阻止或举报'],
    ['Block or report user', '阻止或举报用户'],
    // 大写 R 的写法同译
    ['Block or Report user', '阻止或举报用户'],
    ['Block user', '阻止用户'],
    ['Unblock user', '取消阻止用户'],
    ['You have blocked this user', '你已阻止此用户'],
    ['Unblock or report user', '取消阻止或举报用户'],
    ['blocking users', '阻止用户'],
    ['You must be logged in to block users.', '登录后才能阻止用户。'],
    ['Add an optional note', '添加可选备注'],
    [
      'Maximum 250 characters. Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.',
      '最多 250 个字符。请勿包含法定姓名或电子邮件地址等个人信息。支持 Markdown。此备注仅你可见。'
    ],
    ['Report abuse', '举报滥用行为'],
    ['Edit your profile readme file', '编辑个人资料自述文件'],
    ['GitHub profile guide', 'GitHub 个人资料指南'],
    ['Contribution activity', '贡献活动'],
    ['Learn how we count contributions', '了解我们如何统计贡献'],
    ['Show more activity', '显示更多活动'],
    ['Opened their first pull request on GitHub in', '在 GitHub 上首次创建拉取请求于'],
    ['Opened their first pull request on GitHub in a private repository', '在 GitHub 上首次创建拉取请求于一个专用存储库'],
    ['Opened their first issue on GitHub in', '在 GitHub 上首次打开议题于'],
    ['Activity overview', '活动概述'],
    ['Contribution settings', '贡献设置'],
    ['Private contributions', '私密贡献'],
    // 原文句中没有逗号，译文用语序代替
    [
      'Turning on private contributions will show anonymized private activity on your profile.',
      '开启私密贡献将在你的个人资料中显示匿名化的私密活动。'
    ],
    ['Turning off private contributions will show only public activity on your profile.', '关闭私密贡献将在你的个人资料中只显示公开活动。'],
    [
      'Turning on the activity overview will show an overview of your activity across organizations and repositories.',
      '开启活动概述将显示你在各组织和存储库中的活动概述。'
    ],
    ['Turning off the activity overview will hide the section on your profile.', '关闭活动概述将在你的个人资料中隐藏此部分。'],
    ['Your popular repositories will now be shown instead of your pins.', '现在将显示你的热门存储库而不是置顶项。'],
    ['Year:', '年份：'],
    ['Achievements', '成就'],
    ['Earned achievements', '已获得的成就'],
    ['Bronze unlocked', '已解锁青铜'],
    ['Hide from profile', '从个人资料中隐藏'],
    // 后接「设置」链接；原文句中没有逗号，译文用语序代替
    [
      'You unlocked new Achievements with private contributions! Show them off by including private contributions in your Profile in',
      '你通过私密贡献解锁了新成就！要在个人资料中包含私密贡献来展示它们可前往'
    ],
    [
      'You unlocked new Achievements! Show them off by including achievements and private contributions in your Profile in',
      '你解锁了新成就！要在个人资料中包含成就和私密贡献来展示它们可前往'
    ],
    ['Highlights', '亮点'],
    ['Developer Program Member', '开发人员计划成员'],
    ['Label: Pro', '标签：专业版'],
    ['This repository is private', '此存储库为专用存储库'],
    ['Find a repository…', '查找存储库…'],
    ['Public archive', '公共存档'],
    // 存储库条目活动曲线的提示
    ['Past year of activity', '过去一年的活动'],
    ['Name ascending (A-Z)', '名称升序 (A-Z)'],
    ['Show all lists...', '显示所有列表...'],
    ['Show all lists…', '显示所有列表…'],
    // 带句号的链接与无句号的同译
    ['Create your first list.', '创建你的第一个列表。'],
    // 本人星标搜索结果末尾：直撇号与弯撇号同译
    ['That’s it. You’ve reached the end of your stars.', '已显示你的全部星标。'],
    ["That's it. You've reached the end of your stars.", '已显示你的全部星标。'],
    // 星标列表页的空状态（原文句中没有逗号，译文不加）
    ['Add repositories to this list', '将存储库添加到此列表'],
    [
      'Star repositories on GitHub to keep track of your favorite projects and inspirational code.',
      '为 GitHub 上的存储库加星标来跟踪你喜爱的项目和富有启发性的代码。'
    ],
    ['Explore repositories.', '探索存储库。'],
    ['Can be sponsored', '可赞助'],
    ['Starred repositories', '已加星标的存储库'],
    ['Starred Topics', '已加星标的主题'],
    ['Search stars…', '搜索星标…'],
    ['You must be signed in to star a topic', '登录后才能为主题加星标'],
    ['Your Repositories', '你的存储库'],
    ['Your Stars', '你的星标'],
    // 本人主页的标签页标题（原文为弯撇号）
    ['Your Achievements', '你的成就'],
    ['Your Followers', '你的关注者'],
    ['Who You’re Following', '你关注的人'],
    ['Your starred repositories', '你已加星标的存储库'],
    ['Your starred topics', '你已加星标的主题'],
    // 星标页与已加星标的主题页的页头：本人视图与他人视图
    ['Your Starred Repositories', '你已加星标的存储库'],
    ['Browse your starred repositories and topics', '浏览你已加星标的存储库和主题'],
    ['Browse your starred repositories', '浏览你已加星标的存储库'],
    ['Your Starred Topics', '你已加星标的主题'],
    ['Browse your starred topics', '浏览你已加星标的主题'],
    ['Starred Repositories', '已加星标的存储库'],
    ['Browse starred repositories and topics', '浏览已加星标的存储库和主题'],
    ['Browse starred repositories', '浏览已加星标的存储库'],
    ['See all starred repositories', '查看所有已加星标的存储库'],
    // 已加星标的主题页的本人空状态：直撇号与弯撇号同译
    ['You don’t have any starred topics, yet.', '你还没有已加星标的主题。'],
    ["You don't have any starred topics, yet.", '你还没有已加星标的主题。'],
    [", star topics to save them for later and they'll show up here.", '时为主题加星标留待以后查看，它们会显示在这里。'],
    ["There aren't any projects yet", '暂无项目'],
    ['Create your first GitHub project', '创建你的第一个 GitHub 项目'],
    // 产品名译出：GitHub Packages → GitHub 包
    ['Get started with GitHub Packages', '开始使用 GitHub 软件包'],
    [
      'A single place for your team to manage Docker images and decide who can see and access your images.',
      '集中管理 Docker 映像并决定谁可以查看和访问你的映像。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })
})

describe('profile 页面词条', () => {
  it.each([
    ['Less', '较少'],
    ['January', '1月'],
    ['Jan', '1月'],
    ['Dec', '12月'],
    ['Sunday', '星期日'],
    ['Mon', '周一'],
    ['merged', '个已合并的'],
    ['open', '个打开的'],
    ['closed', '个已关闭的'],
    ['Last updated', '最后更新'],
    ['Type', '类型'],
    ['Sort:', '排序：'],
    ['Followers', '关注者'],
    ['Sponsors', '赞助者'],
    ['Retry.', '重试。'],
    ['type', '输入'],
    ['Type:', '类型：'],
    ['Published', '发布于'],
    ['public', '公共'],
    ['private', '专用'],
    // 包标签页搜索无结果：Try <a>…</a> to find what you're looking for.（原文无逗号，译文不加）
    ['Try', '试试'],
    ["to find what you're looking for.", '来查找你需要的内容。'],
    ['to find what you’re looking for.', '来查找你需要的内容。']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Less', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Mon', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('by', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Sponsors', ['common', 'repository'])).toBeUndefined()
  })

  it('赞助摘要片段按顺序读通', () => {
    const read = (parts: readonly string[]): string => parts.map(part => translate(part) ?? part).join(' ')
    expect(read(['sindresorhus', 'is sponsoring', '12', 'organizations and maintainers and has sponsored', '22', 'in the past'])).toBe(
      'sindresorhus 正在赞助 12 个组织和维护者并曾赞助过 22 个'
    )
    expect(read(['octocat', 'has sponsored', '3', 'organizations and maintainers in the past'])).toBe('octocat 曾赞助过 3 个组织和维护者')
    expect(matcher.translate('in the past', ['common', 'repository'])).toBeUndefined()
  })

  it('筛选摘要片段按顺序读通', () => {
    const parts = ['1', 'result for', 'source', 'repositories matching', 'linux', 'written in', 'C', 'sorted by', 'name']
    expect(parts.map(part => translate(part) ?? part).join(' ')).toBe('1 个结果 类型为 源 的存储库 匹配 linux 语言为 C 排序依据为 名称')
    expect(translate('results for repositories matching')).toBe('个结果 存储库匹配')
    expect(translate('starred repositories matching')).toBe('的已加星标的存储库 匹配')
    expect(translate('results for starred repositories matching')).toBe('个结果 已加星标的存储库匹配')
    expect(translate('stars matching')).toBe('个星标匹配')
    expect(translate('stars written in')).toBe('个星标 语言为')
    // 只有类型词：17 results for <forked> starred repositories
    expect(['17', 'results for', 'forked', 'starred repositories'].map(part => translate(part) ?? part).join(' ')).toBe(
      '17 个结果 类型为 复刻 的已加星标的存储库'
    )
    expect(matcher.translate('starred repositories', ['common', 'repository'])).toBeUndefined()
  })

  it.each([
    [
      'As you {}, star repositories to save them for later and they’ll show up here.',
      '在你{} 时为存储库加星标留待以后查看，它们会显示在这里。'
    ],
    [
      "As you {}, star repositories to save them for later and they'll show up here.",
      '在你{} 时为存储库加星标留待以后查看，它们会显示在这里。'
    ],
    ['As you {}, star topics to save them for later and they’ll show up here.', '在你{} 时为主题加星标留待以后查看，它们会显示在这里。'],
    ["As you {}, star topics to save them for later and they'll show up here.", '在你{} 时为主题加星标留待以后查看，它们会显示在这里。']
  ])('星标空状态整句：%s', (pattern, expected) => {
    expect(matcher.translateInline(patternKey(pattern), ['common', 'profile'])).toBe(expected)
    expect(matcher.translateInline(patternKey(pattern), ['common', 'repository'])).toBeUndefined()
  })

  it('星标空状态的片段仍可单独命中（整句不成立时兜底）', () => {
    expect(translate('As you')).toBe('在你')
    expect(translate('explore GitHub')).toBe('探索 GitHub')
    expect(translate(', star topics to save them for later and they’ll show up here.')).toBe(
      '时为主题加星标留待以后查看，它们会显示在这里。'
    )
  })
})

describe('profile 词条（繁体）', () => {
  const tw = createMatcher(zhTW)
  const scope: readonly PageKey[] = ['common', 'profile', 'organization']

  it.each([
    ['Block or Report user', '封鎖或檢舉使用者'],
    ['- 2h30m behind', '- 慢 2 小時 30 分鐘'],
    ['Your Achievements', '你的成就'],
    ['Your Followers', '你的追蹤者'],
    ['Who You’re Following', '你追蹤的人'],
    ['Your starred topics', '你已加星號的主題'],
    ['Browse your starred repositories and topics', '瀏覽你已加星號的儲存庫和主題'],
    ['Starred Repositories', '已加星號的儲存庫'],
    ['See all starred repositories', '查看所有已加星號的儲存庫'],
    ['You don’t have any starred topics, yet.', '你還沒有已加星號的主題。'],
    ['Past year of activity', '過去一年的活動'],
    ['Create your first list.', '建立你的第一個清單。'],
    ['That’s it. You’ve reached the end of your stars.', '已顯示你的所有星號。'],
    ["That's it. You've reached the end of your stars.", '已顯示你的所有星號。'],
    ['Add repositories to this list', '將儲存庫加入此清單'],
    [
      'Star repositories on GitHub to keep track of your favorite projects and inspirational code.',
      '為 GitHub 上的儲存庫加星號來隨時掌握你喜愛的專案和啟發靈感的程式碼。'
    ],
    ['Explore repositories.', '探索儲存庫。'],
    // 星号筛选摘要只有类型词时的末段
    ['starred repositories', '的已加星號儲存庫']
  ])('%s → %s', (input, expected) => {
    expect(tw.translate(input, scope)).toBe(expected)
  })

  it('主题空状态的句尾片段以全角逗号开头：前面的空白不保留', () => {
    const tail = '，為主題加星號後會顯示在這裡供日後查看。'
    expect(tw.translate(', star topics to save them for later and they’ll show up here.', scope)).toBe(tail)
    expect(tw.translateRaw(" , star topics to save them for later and they'll show up here.", scope)).toBe(tail)
    expect(tw.translate('As you', scope)).toBe('當你')
  })
})

describe('计数与日期交给 common-ui', () => {
  const withCommon = createMatcher([
    ['common', counts],
    ['common', time],
    ['profile', profile]
  ])

  it.each([
    ['325 commits', '325 个提交'],
    ['10 comments', '10 条评论'],
    ['3 repositories', '3 个存储库'],
    ['16 stars', '16 个星标'],
    ['329k followers', '329k 个关注者'],
    ['1 follower', '1 个关注者'],
    ['32 remaining', '剩余 32'],
    // 日期格式由 helpers 生成（中文与数字之间加空格）
    ['Oct 18', '10月18日'],
    ['on Sep 19, 2025', '2025年9月19日'],
    ['October 2026', '2026年10月']
  ])('%s → %s', (input, expected) => {
    expect(withCommon.translate(input, ['common', 'profile'])).toBe(expected)
  })
})

describe('个人主页同时套用 organization 词典', () => {
  const both = createMatcher([
    ['common', counts],
    ['profile', profile],
    ['organization', organization]
  ])
  const scope = ['common', 'profile', 'organization'] as const

  it('两边共用的词条译文一致', () => {
    const org: PageDictionary = organization
    const shared = Object.keys(profile.scoped ?? {}).filter(key => key in (org.scoped ?? {}))
    for (const key of shared) expect(org.scoped?.[key]).toBe(profile.scoped?.[key])
  })

  it('组织规则不抢占个人主页文本', () => {
    expect(both.translate('Popular repositories', scope)).toBe('热门存储库')
    expect(both.translate('Starred repositories', scope)).toBe('已加星标的存储库')
    expect(both.translate('3 repositories', scope)).toBe('3 个存储库')
    expect(both.translate('Created 5 repositories', scope)).toBe('创建了 5 个存储库')
    expect(both.translate('Follow octocat', scope)).toBe('关注 octocat')
  })
})

describe('profile 忽略选择器', () => {
  it.each(profile.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('列表名（全局的星标列表名称区域）、列表描述、列表存储库名、主题、软件包名被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <turbo-frame id="user-profile-frame">
        <div class="tmp-my-3">
          <div class="d-flex flex-justify-between flex-items-center mb-2"><h1>My open-source apps</h1></div>
          <div class="f4 mt-2 tmp-mb-3">Sample text</div>
          <div class="color-fg-muted">3 repositories</div>
        </div>
        <div class="text-center"><h1 class="mb-2">Get started with GitHub Packages</h1></div>
        <div id="user-list-repositories">
          <div class="col-12"><h2 class="h3"><a href="/wulkano/Plug"><span class="text-normal">wulkano / </span>Plug</a></h2></div>
        </div>
        <div id="profile-lists-container"><div class="Box">
          <a class="d-block Box-row" href="/stars/u/lists/x">
            <div class="d-flex flex-row"><h3>React</h3><div class="color-fg-muted text-small no-wrap">18 repositories</div></div>
            <span class="Truncate">Hooks and components</span>
          </a>
          <div class="blankslate"><h3>Create your first list</h3><a class="btn" href="#"><span>Create list</span></a></div>
        </div></div>
        <ul id="package-results"><li class="Box-row">
          <a class="text-bold f4 Link--primary" href="/users/u/packages/container/package/app">rtorrent</a>
          <div class="f6 color-fg-muted">Published by <a href="/u">CrazyMax</a> in <strong><a href="/u/repo">u/repo</a></strong></div>
        </li></ul>
      </turbo-frame>
      <ul class="repo-list"><li>
        <a class="d-flex" href="/topics/npm"><div class="d-flex flex-column"><p class="f3">npm</p><p class="f5">npm is a package manager.</p></div></a>
      </li></ul>`
    const selector = [...(profile.ignore ?? []), ...LIST_NAME_SELECTORS].join(', ')
    // 取文本完全相同的最内层元素
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].filter(node => node.textContent?.trim() === text).at(-1)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('My open-source apps')).toBe(true)
    expect(ignored('Sample text')).toBe(true)
    expect(ignored('wulkano / Plug')).toBe(true)
    expect(ignored('wulkano /')).toBe(true)
    expect(ignored('Hooks and components')).toBe(true)
    expect(ignored('React')).toBe(true)
    expect(ignored('npm is a package manager.')).toBe(true)
    expect(ignored('rtorrent')).toBe(true)
    expect(ignored('CrazyMax')).toBe(true)
    expect(ignored('3 repositories')).toBe(false)
    expect(ignored('18 repositories')).toBe(false)
    expect(ignored('Create your first list')).toBe(false)
    expect(ignored('Create list')).toBe(false)
    expect(ignored('Get started with GitHub Packages')).toBe(false)
  })

  it('页头面包屑首项与 README 标题中的用户名被忽略，用户名是 today 这类常见词时也不翻译', () => {
    document.body.innerHTML = `
      <header aria-label="Global navigation menu" class="GlobalNav styles-module__appHeader__YzYWk">
        <nav aria-label="Breadcrumbs" data-component="Breadcrumbs"><ol>
          <li><a class="styles-module__contextCrumb__IzGIq" data-component="Breadcrumbs.Item" href="/today"><span>today</span></a></li>
          <li><a class="styles-module__contextCrumb__IzGIq" data-component="Breadcrumbs.Item" href="/stars/today">Stars</a></li>
        </ol></nav>
      </header>
      <div class="Box mt-4 profile-readme"><div class="Box-body p-4">
        <div class="d-flex flex-justify-between">
          <div class="text-mono text-small mb-3">
            <a class="Link--secondary" href="/today/today">today</a><span class="color-fg-muted">/</span><span>README</span><span class="color-fg-muted">.md</span>
          </div>
          <a aria-label="Edit your profile readme file" class="Link--secondary" href="/today/today/edit/main/README.md"></a>
        </div>
      </div></div>`
    const selector = (profile.ignore ?? []).join(', ')
    /** 文字等于 text 的最内层元素（同一名称可能出现多次） */
    const owners = (text: string): Element[] =>
      [...document.querySelectorAll('*')].filter(
        node => node.textContent?.trim() === text && ![...node.children].some(child => child.textContent?.trim() === text)
      )
    const ignored = (text: string): boolean[] => owners(text).map(node => node.closest(selector) !== null)

    // 不忽略时 today 会被时间词条译成“今天”
    expect(createMatcher([['common', time]]).translate('today', ['common'])).toBe('今天')
    expect(ignored('today')).toEqual([true, true])
    expect(ignored('README')).toEqual([true])
    expect(ignored('Stars')).toEqual([false])
    expect(document.querySelector('[aria-label="Edit your profile readme file"]')?.closest(selector)).toBeNull()
  })
})

describe('个人主页（DOM）', () => {
  // 与真实页面一致：/<用户> 依次套用 common、profile、organization
  const PAGES: readonly PageKey[] = ['common', 'profile', 'organization']
  const pageMatcher = createMatcher([
    ['common', common],
    ['common', commonUi],
    ['profile', profile],
    ['organization', organization]
  ])
  let translator: Translator | undefined

  function start(html: string): HTMLElement {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: pageMatcher, host: window, resolvePages: () => PAGES })
    translator.start()
    return document.body
  }

  /** 合并空白后的文字 */
  function text(element: Element | null | undefined): string {
    return (element?.textContent ?? '').replace(/\s+/g, ' ').trim()
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each([
    ['31', '正在关注 31 人'],
    ['1.2k', '正在关注 1.2k 人']
  ])('名片关注数：<span>%s</span> following 整句译为“%s”，关注者逐段翻译', (count, expected) => {
    // 采集自 /<用户> 名片：followers 链接带图标，following 链接内只有 <span>N</span> 与文字
    const body = start(`
      <div class="tmp-mb-3">
        <a class="Link--secondary no-underline no-wrap" href="/octocat?tab=followers">
          <svg aria-hidden="true" class="octicon octicon-people"><path d="M2 5.5"></path></svg>
          <span class="text-bold color-fg-default">85.1k</span>
          followers
        </a>        · <a class="Link--secondary no-underline no-wrap" href="/octocat?tab=following">
          <span class="text-bold color-fg-default">${count}</span>
          following
        </a>
      </div>`)
    const [followers, following] = body.querySelectorAll('a')
    expect(text(followers)).toBe('85.1k 个关注者')
    expect(text(following)).toBe(expected)
    expect(following?.querySelector('span')?.textContent).toBe(count)
    expect(text(body.querySelector('div'))).toBe(`85.1k 个关注者 · ${expected}`)
  })

  it('贡献时间线月份标题整段合并后翻译：October <span>2026</span> → 2026年10月', () => {
    const body = start(`
      <div class="contribution-activity-listing float-left col-12">
        <div class="width-full tmp-pb-4">
          <h3 class="h6 pr-2 py-1 border-bottom tmp-mb-3" style="height: 14px;">
            <span class="color-bg-default pl-2 tmp-pr-3" data-sr-feedback="" tabindex="-1">October <span class="color-fg-muted">2026</span></span>
          </h3>
        </div>
      </div>`)
    expect(text(body.querySelector('h3'))).toBe('2026年10月')
  })

  it('侧栏赞助者列表标题译“赞助者”，其他页面的 Sponsors 仍作“赞助”', () => {
    const body = start(`
      <div class="border-top color-border-muted tmp-pt-3 tmp-mt-3 clearfix hide-sm hide-md">
        <h2 class="h4 d-flex flex-items-start mb-2">Sponsors</h2>
        <div class="d-flex flex-wrap">
          <div class="d-flex mb-1 mr-1"><a class="d-inline-block" data-hovercard-type="user" href="/octocat"><img class="avatar avatar-user" alt="@octocat"></a></div>
        </div>
      </div>`)
    expect(text(body.querySelector('h2'))).toBe('赞助者')
    expect(pageMatcher.translate('Sponsors', ['common', 'repository'])).toBe('赞助')
  })

  it('亮点里的 PRO 徽章：可见文字与 title 都译成“专业版”', () => {
    // 采集自 /<用户> 侧栏亮点：徽章文字 Pro 由 CSS 转大写显示；可见文字走 common 的全局词条，title 走本词典
    const body = start(`
      <div class="border-top color-border-muted tmp-pt-3 tmp-mt-3 d-none d-md-block"><h2 class="h4 mb-2">Highlights</h2><ul class="list-style-none"><li class="mt-2">
        <svg aria-hidden="true" data-component="Octicon" class="octicon octicon-star color-fg-muted"><path d="M8 .25"></path></svg>
        <span title="Label: Pro" data-view-component="true" class="Label Label--purple text-uppercase">
          Pro
        </span>
      </li><li class="mt-2">Developer Program Member</li></ul></div>`)
    expect(text(body.querySelector('h2'))).toBe('亮点')
    const badge = body.querySelector('span.Label')
    expect(text(badge)).toBe('专业版')
    expect(badge?.getAttribute('title')).toBe('标签：专业版')
    expect(text(body.querySelectorAll('li')[1])).toBe('开发人员计划成员')
  })

  it('活动概述雷达图：四个标签有译文，百分比与说明不动', () => {
    const body = start(`
      <div class="js-activity-overview-graph-container" data-percentages="{&quot;Commits&quot;:82,&quot;Pull requests&quot;:16,&quot;Code review&quot;:2,&quot;Issues&quot;:0}">
        <svg class="js-activity-overview-graph mx-auto d-block" xmlns="http://www.w3.org/2000/svg" width="285" height="261">
          <title>A graph representing octocat's contributions from October 26, 2025 to October 26, 2026. The contributions are 82% commits, 16% pull requests, 2% code review, 0% issues.</title>
          <g transform="translate(-18.25, -38.453125)">
            <text text-anchor="middle" class="activity-overview-percentage js-highlight-percent-top" dx="169.5" dy="51.453125">2%</text>
            <text text-anchor="middle" class="text-small activity-overview-label js-highlight-label-top" dx="169.5" dy="67.453125">Code review</text>
            <text text-anchor="start" class="activity-overview-percentage js-highlight-percent-right" dy="157.5" dx="285.671875">&nbsp;</text>
            <text text-anchor="start" class="text-small activity-overview-label js-highlight-label-right" dy="173.5" dx="271.546875">Issues</text>
            <text text-anchor="middle" class="activity-overview-percentage js-highlight-percent-bottom" dx="169.5" dy="279.546875">16%</text>
            <text text-anchor="middle" class="text-small activity-overview-label js-highlight-label-bottom" dx="169.5" dy="295.546875">Pull requests</text>
            <text text-anchor="end" class="activity-overview-percentage js-highlight-percent-left" dy="168" dx="53.3203125">82%</text>
            <text text-anchor="end" class="text-small activity-overview-label js-highlight-label-left" dy="184" dx="65.453125">Commits</text>
          </g>
        </svg>
      </div>`)
    expect([...body.querySelectorAll('.activity-overview-label')].map(label => label.textContent)).toEqual([
      '代码审查',
      '议题',
      '拉取请求',
      '提交'
    ])
    expect([...body.querySelectorAll('.activity-overview-percentage')].map(value => text(value))).toEqual(['2%', '', '16%', '82%'])
    expect(body.querySelector('svg title')?.textContent).toContain("octocat's contributions")
  })

  it('赞助标签页：赞助时间照常翻译，赞助对象名称不动', () => {
    // 采集自 /<用户>?tab=sponsoring：赞助时间在 span 里，关注者列表的忽略规则不覆盖 span
    const body = start(`
      <turbo-frame id="user-profile-frame">
        <div class="d-table table-fixed col-12 width-full tmp-py-4 border-bottom color-border-muted">
          <div class="d-table-cell col-8 v-align-top tmp-pr-3">
            <a class="d-inline-block no-underline mb-1" data-hovercard-type="user" href="/octocat">
              <span class="f4 Link--primary">The Octocat</span>
              <span class="Link--secondary pl-1">octocat</span>
            </a>
            <div>
              <span class="color-fg-muted text-small">
                  Sponsoring since
                January 31, 2022
              </span>
            </div>
          </div>
        </div>
      </turbo-frame>`)
    expect(text(body.querySelector('.d-table-cell > div > span'))).toBe('赞助始于 2022年1月31日')
    expect(text(body.querySelector('a[data-hovercard-type="user"]'))).toBe('The Octocat octocat')
  })
})

describe('星标空状态整句（DOM）', () => {
  // /<用户>?tab=stars 与 /stars/<用户>/topics 的本人空状态：As you <a>explore GitHub</a>, star … show up here.
  const SCOPE: readonly PageKey[] = ['common', 'profile', 'organization']
  const cn = createMatcher(zhCN)
  const tw = createMatcher(zhTW)
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 渲染空状态说明，返回段落的原样文字（不合并空白） */
  function render(using: Matcher, noun: string, apostrophe: string): string | null | undefined {
    document.body.innerHTML = `<div class="blankslate"><p>As you <a href="/explore">explore GitHub</a>, star ${noun} to save them for later and they${apostrophe}ll show up here.</p></div>`
    translator = createTranslator({ matcher: using, host: window, resolvePages: () => SCOPE })
    translator.start()
    return document.querySelector('p')?.textContent
  }

  it.each([
    ['repositories', '’', '在你探索 GitHub 时为存储库加星标留待以后查看，它们会显示在这里。'],
    ['repositories', "'", '在你探索 GitHub 时为存储库加星标留待以后查看，它们会显示在这里。'],
    ['topics', '’', '在你探索 GitHub 时为主题加星标留待以后查看，它们会显示在这里。'],
    ['topics', "'", '在你探索 GitHub 时为主题加星标留待以后查看，它们会显示在这里。']
  ])('简体：star %s（撇号 %s）', (noun, apostrophe, expected) => {
    expect(render(cn, noun, apostrophe)).toBe(expected)
    expect(document.querySelector('p a')?.textContent).toBe('探索 GitHub')
  })

  it.each([
    ['repositories', '’', '當你探索 GitHub，為儲存庫加星號後會顯示在這裡供日後查看。'],
    ['topics', "'", '當你探索 GitHub，為主題加星號後會顯示在這裡供日後查看。']
  ])('繁体：star %s（撇号 %s）', (noun, apostrophe, expected) => {
    expect(render(tw, noun, apostrophe)).toBe(expected)
  })
})

describe('星标列表的预置名称', () => {
  const cn = createMatcher(zhCN)
  const tw = createMatcher(zhTW)
  /** 星标菜单所在的页面（存储库页头）：区域外的同名文字由 static 兜底 */
  const MENU: readonly PageKey[] = ['common', 'repository', 'code']

  it('简繁同键；列表名区域（listNames）与区域外的兜底词条（static）同译', () => {
    expect(Object.keys(TW_STAR_LIST_NAMES)).toEqual(Object.keys(STAR_LIST_NAMES))
    for (const [using, names] of [
      [cn, STAR_LIST_NAMES],
      [tw, TW_STAR_LIST_NAMES]
    ] as const) {
      for (const [source, target] of Object.entries(names)) {
        expect(using.translateLabel(source, 'list'), source).toBe(target)
        expect(using.translate(source, MENU), source).toBe(target)
      }
    }
  })

  it('自定义列表名不在表里', () => {
    for (const source of ['Inspiration', 'My stack', '✨ inspiration', 'constructor', 'bug']) {
      expect(cn.translateLabel(source, 'list'), source).toBeUndefined()
      expect(tw.translateLabel(source, 'list'), source).toBeUndefined()
    }
  })

  it('列表页标题：列表名与标签页同名时按列表页翻译，标签页标题照常（简繁）', () => {
    const PROFILE: readonly PageKey[] = ['common', 'profile']
    for (const [using, list, tab] of [
      [cn, 'octocat 的列表 / Projects', 'octocat / 项目'],
      [tw, 'octocat 的清單 / Projects', 'octocat / 專案']
    ] as const) {
      expect(using.translate("octocat's list / Projects", PROFILE)).toBe(list)
      expect(using.translate('octocat / Projects', PROFILE)).toBe(tab)
    }
  })
})
