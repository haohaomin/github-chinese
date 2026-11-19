import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { translateTitleText } from '../../../src/core/title'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import pages from '../../../src/locales/zh-CN/common/pages'
import { zhCN } from '../../../src/locales/zh-CN/index'

const matcher = createMatcher([['common', common]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 营销头部与页脚
  { hits: [['© 2026 GitHub, Inc.', '© 2026 GitHub, Inc.']], misses: ['© GitHub, Inc.'] },
  {
    hits: [['Search or jump to, type / to search', '搜索或跳转，按 / 搜索']],
    misses: ['Search or jump to, press / to search']
  },
  // Universe 横幅
  {
    hits: [['Day 1: Opening Keynote begins in', '第 1 天：开幕主题演讲距开始还有']],
    misses: ['Day 1: Opening Keynote begins soon']
  },
  {
    hits: [
      ['Day 1: Opening Keynote begins October 28 at 9 AM Pacific Time', '第 1 天：开幕主题演讲将于太平洋时间 10月28日上午 9 点开始'],
      ['Day 2: Opening Keynote begins Oct 29 at 1 PM Pacific Time', '第 2 天：开幕主题演讲将于太平洋时间 10月29日下午 1 点开始']
    ],
    misses: ['Day 1: Opening Keynote begins October 28 at 9 AM Eastern Time']
  },
  // 全局导航
  {
    hits: [['Open quick search dialog, type / to search', '打开快速搜索对话框，按 / 搜索']],
    misses: ['Open quick search dialog']
  },
  {
    hits: [
      ['Type s to search', '按 s 搜索'],
      ['Type ctrl+k to search', '按 ctrl+k 搜索']
    ],
    misses: ['Type to search', 'Type s to search here', 'Type a name to search']
  },
  {
    hits: [
      ['Invite someone to acme', '邀请成员加入 acme'],
      ['Add someone to my-org', '添加成员到 my-org']
    ],
    misses: ['Invite someone to the team']
  },
  { hits: [['New team in acme', '在 acme 中新建团队']], misses: ['New team in the acme org'] },
  { hits: [['New repository in acme.dev', '在 acme.dev 中新建存储库']], misses: ['New repository in my org'] },
  {
    hits: [['Data residency: EU - Viewing as octocat', '数据驻留：EU - 以 octocat 身份查看']],
    misses: ['Data residency: EU']
  },
  {
    hits: [['Data residency: EU - Users managed by Acme Corp', '数据驻留：EU - 由 Acme Corp 托管的用户']],
    misses: ['Data residency: EU - Owned by Acme Corp']
  },
  { hits: [['Viewing as octocat', '以 octocat 身份查看']], misses: ['Viewing as the owner'] },
  { hits: [['Users managed by Acme Corp', '由 Acme Corp 托管的用户']], misses: ['Users owned by Acme Corp'] },
  {
    hits: [
      ['3 recent sessions', '3 个最近的会话'],
      ['1 recent session', '1 个最近的会话']
    ],
    misses: ['Many recent sessions']
  },
  {
    hits: [['Creating task in octo-org/hello-world', '正在 octo-org/hello-world 中创建任务']],
    misses: ['Creating task in progress']
  },
  // 全局搜索与命令面板（产品名译中文：GitHub Actions → GitHub 操作、Codespaces → 代码空间）
  {
    hits: [
      ['Explore Blog', '探索博客'],
      ['Explore Why GitHub', '探索为什么选择 GitHub'],
      ['Explore GitHub Actions', '探索 GitHub 操作'],
      ['Explore Codespaces', '探索代码空间'],
      ['Explore GitHub Desktop', '探索 GitHub 桌面版'],
      ['Explore CI/CD', '探索 CI/CD']
    ],
    misses: ['Explore the universe']
  },
  { hits: [['Search GitHub for react hooks', '在 GitHub 中搜索 react hooks']], misses: ['Search GitLab for react'] },
  { hits: [['Search this directory for main', '在此目录中搜索 main']], misses: ['Search this folder for main'] },
  {
    hits: [
      ['Search Organization acme for button', '在组织 acme 中搜索 button'],
      ['Search Enterprise big-co for auth', '在企业 big-co 中搜索 auth'],
      ['Search Owner octocat for dotfiles', '在所有者 octocat 中搜索 dotfiles']
    ],
    misses: ['Search Team acme for button']
  },
  {
    hits: [['Search octo-org/hello-world for ref', '在 octo-org/hello-world 中搜索 ref']],
    misses: ['Search octo-org for ref']
  },
  { hits: [['Recent search: is:open', '最近搜索：is:open']], misses: ['Recent searches: is:open'] },
  {
    hits: [
      ['Jump to octo-org/hello-world, repository', '跳转到 octo-org/hello-world（存储库）'],
      ['Jump to acme, organization', '跳转到 acme（组织）']
    ],
    misses: ['Jump to octo-org/hello-world, user']
  },
  {
    hits: [
      ['Autocomplete org:acme scope, organization', '自动补全 org:acme 范围（组织）'],
      ['Autocomplete language:"Objective C" scope, language', '自动补全 language:"Objective C" 范围（语言）']
    ],
    misses: ['Autocomplete org:acme scope, team']
  },
  {
    hits: [
      ['Autocomplete is: qualifier value', '自动补全 is: 限定符值'],
      ['Autocomplete license:"MIT License" qualifier value', '自动补全 license:"MIT License" 限定符值']
    ],
    misses: ['Autocomplete is: qualifier']
  },
  {
    hits: [
      ['saved:mine, Autocomplete', 'saved:mine，自动补全'],
      ['saved:"my search", Autocomplete', 'saved:"my search"，自动补全']
    ],
    misses: ['mine, Autocomplete']
  },
  { hits: [['useState, jump to this code', 'useState，跳转到此代码']], misses: ['useState, jump to code'] },
  {
    hits: [
      [
        'Limit of 50 saved searches reached. Please delete an existing saved search before creating a new one.',
        '已达到 50 个已保存搜索的上限。请先删除现有的已保存搜索再创建新的。'
      ]
    ],
    misses: ['Limit of many saved searches reached. Please delete an existing saved search before creating a new one.']
  },
  // 快捷键提示：含“再按”时用全角括号，只有按键名时保留半角
  {
    hits: [
      ['(g then d)', '（g 再按 d）'],
      ['(alt shift r)', '(alt shift r)'],
      ['(control shift right angle bracket)', '(control shift right angle bracket)']
    ],
    misses: ['(then)', '(enter)', '(G then D)', '(a then)']
  },
  {
    hits: [
      ['g then n', 'g 再按 n'],
      ['control k then shift question mark', 'control k 再按 shift question mark'],
      ['alt shift r', 'alt shift r']
    ],
    misses: ['enter', 'Go then do', 'shift', 'cats then dogs', 'g then d then']
  },
  // 用户状态与功能预览对话框
  {
    hits: [
      ['In 30 minutes', '30分钟后'],
      ['In 4 hours', '4小时后'],
      ['In 3 days', '3天后']
    ],
    misses: ['In 2 years', 'In progress']
  },
  { hits: [['Select an emoji: :+1:', '选择表情符号：:+1:']], misses: ['Select an emoji: smile'] },
  {
    hits: [
      ['Enable the Command palette feature preview', '启用 Command palette 功能预览'],
      ['Disable the New Files Changed Experience feature preview', '禁用 New Files Changed Experience 功能预览']
    ],
    misses: ['Enable the feature preview']
  },
  // sudo 确认对话框：电子邮件验证
  {
    hits: [
      [
        'Enter the verification code sent to o*******@example.com. If it doesn’t appear within a few minutes, check your spam folder.',
        '输入发送至 o*******@example.com 的验证码。如果几分钟内未收到，请检查垃圾邮件文件夹。'
      ],
      [
        "Enter the verification code sent to octocat@example.com. If it doesn't appear within a few minutes, check your spam folder.",
        '输入发送至 octocat@example.com 的验证码。如果几分钟内未收到，请检查垃圾邮件文件夹。'
      ]
    ],
    misses: [
      'Enter the verification code sent to your email. If it doesn’t appear within a few minutes, check your spam folder.',
      'Enter the verification code sent to a@b@example.com. If it doesn’t appear within a few minutes, check your spam folder.',
      'Enter the verification code sent to octocat@example.com.'
    ]
  },
  // 错误页标签页标题
  { hits: [['Error 503', '错误 503']], misses: ['Error 50', 'Error code 503'] },
  // 单一登录横幅
  {
    hits: [
      ['and 2 other organizations.', '以及其他 2 个组织。'],
      ['and 1 other organization.', '以及其他 1 个组织。']
    ],
    misses: ['and 2 other']
  },
  {
    hits: [['Single sign-on to see results in 5 other organizations.', '单一登录以查看其他 5 个组织中的结果。']],
    misses: ['Single sign-on to see results in many other organizations.']
  },
  { hits: [[', and 2 more organizations', '，以及其他 2 个组织']], misses: [', and more organizations'] },
  // 强制 2FA 横幅的后半句（前半句 GitHub users are <strong>now required</strong> 见 static）
  {
    hits: [
      [
        'to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to enable two-factor authentication on your account before March 15, 2027, or be restricted from account actions.',
        '启用双因素身份验证作为额外的安全措施。你在 GitHub 上的活动使你也在此要求范围内。你需要在 2027年3月15日之前为帐户启用双因素身份验证，否则帐户操作将受到限制。'
      ]
    ],
    misses: [
      'to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to enable two-factor authentication on your account before soon, or be restricted from account actions.'
    ]
  },
  // Copilot 预算横幅（组织、企业预算用尽；个人预算用尽见行内句测试）
  {
    hits: [
      [
        'has used all its AI credits. Access resumes on December 1. Contact your admins to increase it.',
        '已用完全部 AI 额度。将于 12月1日恢复使用。请联系你的管理员提高额度。'
      ]
    ],
    misses: ['has used all its storage. Access resumes on December 1. Contact your admins to increase it.']
  },
  {
    hits: [
      ['Request sent. Your org admins will be notified.', '申请已发送。你的组织管理员将收到通知。'],
      ['Request sent. Your enterprise account owners will be notified.', '申请已发送。你的企业帐户所有者将收到通知。']
    ],
    misses: ['Request sent. Your team will be notified.', 'Request sent. Your org admins will be notified']
  },
  {
    hits: [
      [
        'Your enterprise account owners will be notified that you need additional Copilot AI credits.',
        '你的企业帐户所有者将收到你需要更多 Copilot AI 额度的通知。'
      ]
    ],
    misses: ['Your team will be notified that you need additional AI credits.']
  },
  {
    hits: [
      ['Your request for additional Copilot budget was declined by an admin.', '你申请更多 Copilot 预算的请求已被管理员拒绝。'],
      [
        'Your request for additional AI credits was declined by an enterprise account owner on',
        '你申请更多 AI 额度的请求已被企业帐户所有者拒绝于'
      ]
    ],
    misses: ['Your request for additional AI credits was declined by octocat.']
  },
  // Copilot 预算申请审批卡片
  {
    hits: [
      ['Requested 3 days ago', '3天前申请'],
      ['Requested about 1 hour ago', '约1小时前申请'],
      ['Requested yesterday', '昨天申请']
    ],
    misses: ['Requested changes', 'Requested 3 days']
  },
  {
    hits: [
      ['Approve request from octocat (Copilot AI credits)', '批准 octocat 的申请（Copilot AI 额度）'],
      ['Deny request from mona-lisa', '拒绝 mona-lisa 的申请']
    ],
    misses: ['Approve request from the team', 'Deny request from octocat (storage)']
  },
  {
    hits: [
      ['New budget in dollars for octocat (Universal AI credits)', 'octocat 的新预算美元金额（通用 AI 额度）'],
      ['New budget in dollars for mona', 'mona 的新预算美元金额']
    ],
    misses: ['New budget in euros for octocat']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('common 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(common.static?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = common.regexp ?? []
    // 自有页面正文的正则见 common-pages.test.ts
    const pageRules = new Set((pages.regexp ?? []).map(([pattern]) => pattern))
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter(([pattern], index) => !covered.has(index) && !pageRules.has(pattern)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    const join = (parts: readonly string[]): string | undefined => translate(normalizeText(parts.join('')))
    expect(join(['and ', '2', ' other', ' ', 'organizations', '.'])).toBe('以及其他 2 个组织。')
    expect(join([', and ', '3', ' more', ' ', 'organizations'])).toBe('，以及其他 3 个组织')
    expect(join(['Limit of ', '50', ' saved searches reached. Please delete an existing saved search before creating a new one.'])).toBe(
      '已达到 50 个已保存搜索的上限。请先删除现有的已保存搜索再创建新的。'
    )
    expect(join(['Start a task with ', 'Copilot cloud agent'])).toBe('使用 Copilot 云端智能体开始任务')
    expect(join(['(', 'g then d', ')'])).toBe('（g 再按 d）')
    expect(join(['Requested ', '3 days', ' ago'])).toBe('3天前申请')
    // Copilot 预算横幅：<strong> 前后的文字各自拼接
    expect(join([' Your ', 'org admins', ' will be notified that you need additional', ' ', 'AI credits', '.'])).toBe(
      '你的组织管理员将收到你需要更多 AI 额度的通知。'
    )
    expect(join([' ', 'has used all its AI credits', '. Access resumes on ', 'Dec 1', '. Contact your admins to increase it.'])).toBe(
      '已用完全部 AI 额度。将于 12月1日恢复使用。请联系你的管理员提高额度。'
    )
    expect(join(['Single sign-on to see results in ', 'the '])).toBe('单一登录以查看')
    expect(join([' ', 'and ', '2', ' other', ' ', 'organizations', '.'])).toBe('以及其他 2 个组织。')
  })
})

describe('common 静态词条', () => {
  it.each([
    ['Skip to content', '跳到内容'],
    ['Sign in', '登录'],
    ['Sign out', '退出登录'],
    ['Type / to search', '按 / 搜索'],
    ['to search', '搜索'],
    // 命令面板提示：整句（引擎按 kbd 整句匹配）与片段兜底
    ['Type / to search files', '按 / 搜索文件'],
    ['Type @ to search repositories', '按 @ 搜索存储库'],
    ['Type @ to search organizations, repositories, and users', '按 @ 搜索组织、存储库和用户'],
    ['Type # to search issues and pull requests', '按 # 搜索议题和拉取请求'],
    ['to search files', '搜索文件'],
    ['to search repositories', '搜索存储库'],
    ['to search organizations, repositories, and users', '搜索组织、存储库和用户'],
    ['to search issues and pull requests', '搜索议题和拉取请求'],
    ['Type author:@me to search your issues and pull requests', '输入 author:@me 搜索你的议题和拉取请求'],
    ['Press Tab on a repository to search within it', '在存储库上按 Tab 可在其中搜索'],
    ['Press Tab on an account or repository to search within it', '在帐户或存储库上按 Tab 可在其中搜索'],
    // 旧版命令面板的提示：整句与片段兜底；进入命令模式与帮助项 Activate command mode 同用“进入”
    ['Type # to search discussions', '按 # 搜索讨论'],
    ['Type ! to search projects', '按 ! 搜索项目'],
    ['Type @ to search people and organizations', '按 @ 搜索人员和组织'],
    ['to search teams', '搜索团队'],
    ['Type > to activate command mode', '按 > 进入命令模式'],
    ['to activate command mode', '进入命令模式'],
    ['Activate command mode', '进入命令模式'],
    ['Search for issues, pull requests, discussions, and projects', '搜索议题、拉取请求、讨论和项目'],
    ['Search for projects', '搜索项目'],
    // # 模式的筛选提示：is:project 与 is:issue、is:pr 同句式
    ['Type is:issue to filter to issues', '输入 is:issue 仅筛选议题'],
    ['Type is:pr to filter to pull requests', '输入 is:pr 仅筛选拉取请求'],
    ['Type is:project to filter to projects', '输入 is:project 仅筛选项目'],
    ['Type is:open to filter to open content', '输入 is:open 仅筛选打开的内容'],
    // 底部搜索项的片段兜底（整句见行内句）
    ['across all of GitHub', '在整个 GitHub 中'],
    // 旧版命令面板的命令：破折号前缀随原文；作用域标记里截断的命令名，省略号随原文
    ['– New repository', '– 新建存储库'],
    ['– Switch theme', '– 切换主题'],
    ['Change tab size r...', '更改制表符渲染宽度...'],
    ['12 spaces', '12 个空格'],
    // 切换主题的子页：主题名、跟随系统同外观设置
    ['Default dark', '深色默认'],
    ['Switch theme to dark high contrast', '将主题切换为深色高对比度'],
    ['Sync with system settings', '跟随系统设置'],
    ['Clone repository: Copy SSH', '克隆存储库：复制 SSH'],
    // 旧版命令面板左下角的提示条：运行命令、复制出错
    ['Failed to run command', '运行命令失败'],
    ['Copy failed', '复制失败'],
    // 页头面包屑、全站标题标语
    ['GitHub Breadcrumb', 'GitHub 面包屑导航'],
    ['Show more breadcrumb items', '显示更多面包屑导航项'],
    ['Where software is built', '构建软件的地方'],
    // 用户状态对话框：直引号与弯引号两种写法
    ["What's happening?", '近况如何？'],
    ['What’s happening?', '近况如何？'],
    ["What's happening", '近况'],
    ['What’s happening', '近况'],
    ['Clear status after', '状态清除时间'],
    ['Explore', '探索'],
    ['Error', '错误'],
    ['Keyboard shortcuts', '键盘快捷方式'],
    ['then', '再按'],
    ['Settings > Appearance', '设置 > 外观'],
    ['Whoa there!', '慢一点！'],
    ['You have exceeded a secondary rate limit.', '你已超出辅助速率限制。'],
    ['Didn’t find anything here!', '这里什么也没有！'],
    // 省略号随原文
    ['Search code, repositories, users, issues, pull requests...', '搜索代码、存储库、用户、议题、拉取请求...'],
    ['Search code, repositories, users, issues, pull requests…', '搜索代码、存储库、用户、议题、拉取请求…'],
    ['Search or jump to...', '搜索或跳转到...'],
    ['Search or jump to…', '搜索或跳转到…'],
    ['Loading repositories...', '正在加载存储库...'],
    // 导航项 Sponsors 指赞助功能；产品名、方案名按用户要求译成中文，品牌词 Copilot 保留
    ['Sponsors', '赞助'],
    ['Marketplace', '市场'],
    ['GitHub Marketplace', 'GitHub 市场'],
    ['Actions', '操作'],
    ['Codespaces', '代码空间'],
    ['GitHub Advanced Security', 'GitHub 高级安全'],
    ['Copilot for Business', 'Copilot 商业版'],
    ['GitHub Skills', 'GitHub 技能'],
    ['GitHub Sponsors', 'GitHub 赞助'],
    ['GitHub Desktop', 'GitHub 桌面版'],
    ['Code Security', '代码安全'],
    ['Secret Protection', '机密保护'],
    ['Code Quality', '代码质量'],
    ['Code security', '代码安全'],
    ['Copilot Chat', 'Copilot 聊天'],
    ['Open Copilot Chat (immersive mode)', '打开 Copilot 聊天（沉浸模式）'],
    ['Copilot cloud agent', 'Copilot 云端智能体'],
    ['Learn more about Copilot cloud agent', '了解 Copilot 云端智能体'],
    ['Free', '免费版'],
    // Copilot 菜单的计划标签（教育福利身份选项 Student 由 settings-account 的 scoped 译“学生”）
    ['Student', '学生版'],
    ['Pro', '专业版'],
    ['Pro+', '专业增强版'],
    ['Try Enterprise', '试用企业版'],
    ['New codespace', '新建代码空间'],
    ['Open in codespace', '在代码空间中打开'],
    ['Go to Actions', '转到操作'],
    ['Actions main view search bar', '操作主视图搜索栏'],
    ['Install GitHub Mobile for Android', '安装适用于 Android 的 GitHub 移动版'],
    ['GitHub Mobile for Android', '适用于 Android 的 GitHub 移动版'],
    [
      'Copilot works in the cloud and opens a pull request for your review. Enjoy up to 5 free uses this month with your Copilot Free plan.',
      'Copilot 在云端工作，并创建拉取请求供你审查。本月你的 Copilot 免费版计划可免费使用最多 5 次。'
    ],
    // 全局导航栏目 Enterprise、Team 仍作普通名词
    ['Enterprise', '企业'],
    ['Team', '团队'],
    ['Accessibility', '辅助功能'],
    ['Emoji', '表情符号'],
    ['Private repository', '专用存储库'],
    ['Public repository', '公共存储库'],
    ['Settings > Developer settings > GitHub Apps', '设置 > 开发人员设置 > GitHub 应用'],
    ['Settings > Developer settings > OAuth Apps', '设置 > 开发人员设置 > OAuth 应用'],
    ['Go to GitHub homepage', '转到 GitHub 主页'],
    ['Billing budget alert', '计费预算警报'],
    ['Manage cookie preferences', '管理 Cookie 首选项'],
    ['Security and quality', '安全和质量'],
    ['Navigate downstack', '在堆栈中向下导航'],
    // 原文未给界面名加引号，译文也不加
    [
      "Start a session or revisit recent sessions from the navigation bar. Choose Learn more for a quick tour of what's new.",
      '在导航栏中开始会话或重新打开最近的会话。选择了解更多可快速浏览新功能。'
    ],
    ['You signed in with another tab or window.', '你已在其他标签页或窗口中登录。'],
    ['to refresh your session.', '以刷新会话。'],
    ['Single sign-on to see results in the', '单一登录以查看'],
    ['to see results in the', '以查看'],
    ['organization.', '组织。'],
    ['Join Universe virtually, from anywhere.', '随时随地线上参加 Universe。'],
    ['Save your seat', '预留席位'],
    ['Register virtually', '线上报名'],
    ['Copilot budget setup', 'Copilot 预算设置'],
    ['GitHub Copilot billing for', 'GitHub Copilot 对'],
    ['is now usage-based. Set a per-user budget to manage costs.', '现已改为基于使用情况的计费。设置每个用户的预算以控制成本。'],
    ['Copilot AI credits', 'Copilot AI 额度'],
    ['Request removed.', '申请已撤回。'],
    ['Download link sent.', '下载链接已发送。'],
    ["Couldn't dismiss this announcement. Your announcement is still available. Try again.", '无法关闭此公告。公告仍会显示。请重试。'],
    // 原文两句，译文也是两句，不并成逗号句
    ['Something went wrong. Try again.', '出错了。请重试。'],
    ['Unable to save changes. Please try again.', '无法保存更改。请重试。'],
    ['An error occurred while switching accounts. Please try again.', '切换帐户时出错。请重试。'],
    ['Could not save your search. Please check your connection and try again.', '无法保存搜索。请检查网络连接后重试。'],
    ['GitHub is temporarily unavailable. Please try again in a few minutes.', 'GitHub 暂时不可用。请几分钟后重试。'],
    ['Announcement', '公告'],
    ['Close banner', '关闭横幅'],
    ['Toggle play', '播放/暂停'],
    ['Announcement dismissed', '公告已关闭'],
    ['Collapse or expand all files instead of just the current one', '折叠或展开全部文件'],
    // 快捷方式对话框：item → 项；名词 filter → 筛选器
    ['Item pickers', '项选择器'],
    ['Open focused item', '打开所聚焦的项'],
    ['Select multiple items', '选择多个项'],
    ['Select item', '选择项'],
    ['Focus filter field', '聚焦筛选器字段'],
    ['Focus file tree filter', '聚焦文件树筛选器'],
    // 拉取请求的动词 open → 创建
    [
      'Describe your task in natural language. Copilot will work in the background and open a pull request for your review.',
      '用自然语言描述任务。Copilot 会在后台工作，并创建拉取请求供你审查。'
    ],
    // 原文没有逗号、冒号，译文不加；分句间的破折号作“——”
    [
      'Enable high contrast for light or dark mode (or both) based on your system settings',
      '根据系统设置为浅色或深色模式（或两者）启用高对比度'
    ],
    [
      'The event for developers, by developers — talks, workshops, and what’s next for GitHub.',
      '由开发人员打造、为开发人员举办的盛会——演讲、工作坊，以及 GitHub 的未来。'
    ],
    // 帐户安全横幅：locked out 同 auth、settings 页的“无法访问帐户”；换机横幅的 this season 指节假日
    ["Don't get locked out of your account.", '避免无法访问帐户。'],
    [
      "Don't get locked out - if you get a new phone this season, be sure to transfer your authenticator app data to the new phone. Enable cloud back up if your authenticator app supports it and consider",
      '避免无法访问帐户——如果你在这个假期换了新手机，请务必将身份验证器应用的数据转移到新手机。如果你的身份验证器应用支持云备份，请启用云备份，并考虑'
    ],
    // 接在链接后、以全角逗号开头的结尾片段
    [', just to be safe.', '，以防万一。'],
    // 停用功能预览后的提示：两句按句拆开，Please 是全局词条
    ['Feature disabled. Please', '功能已禁用。请'],
    // 由页面 scoped 扩为全局的词条：强制 2FA 横幅的前半句、Spark 页脚
    ['GitHub users are', 'GitHub 用户'],
    ['now required', '现在必须'],
    ['Terms of service', '服务条款'],
    ['504 Gateway Time-out', '504 网关超时'],
    ['Access has been restricted', '访问已受限']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('原文没有引号的章节名，译文不加引号', () => {
    const cookies =
      'Most GitHub websites use cookies. Cookies are small text files placed on your device to store data so web servers can use it later. GitHub and our third-party partners use cookies to remember your preferences and settings, help you sign in, show you personalized ads, and analyze how well our websites are working. For more info, see the Cookies and similar technologies section of the'
    expect(translate(cookies)).toMatch(/详情请参阅包含 Cookie 及类似技术部分的$/)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw(' Reload ', ['common'])).toBe(' 重新加载 ')
  })

  it('错误页标签页标题按分段翻译', () => {
    const title = (text: string): string => translateTitleText(text, translate)
    expect(title('Page not found · GitHub · GitHub')).toBe('找不到页面 · GitHub · GitHub')
    expect(title('Rate limit · GitHub')).toBe('速率限制 · GitHub')
    expect(title('Unicorn! · GitHub')).toBe('独角兽！ · GitHub')
    expect(title('404 Page not found · GitHub')).toBe('404 找不到页面 · GitHub')
    expect(title('Error 503 · GitHub')).toBe('错误 503 · GitHub')
    expect(title('GitHub · Where software is built')).toBe('GitHub · 构建软件的地方')
    // 未登录首页：两端的站点名段保持原样，中间的标语段翻译
    expect(title('GitHub · Build and ship software on a single, collaborative platform · GitHub')).toBe(
      'GitHub · 在统一的协作平台上构建和交付软件 · GitHub'
    )
  })

  it('通用组件词与易与用户内容同形的词不收录（归 common-ui 或不翻译）', () => {
    // projects、users 与搜索页的类型词同形：旧版命令面板帮助项按整句翻译，不收片段
    const words = ['More', 'items', 'Never', 'Today', 'This week', 'Something went wrong', 'Type', 'Build']
    for (const word of [...words, 'projects', 'users']) {
      expect(common.static?.[word]).toBeUndefined()
    }
    // Type 与“类型”同形：搜索提示的 Type 片段只随整句翻译，单独出现时不翻译
    expect(translate('Type')).toBeUndefined()
  })
})

describe('common 全局产品名（整包词典）', () => {
  const full = createMatcher(zhCN)
  /** 存储库标签页 Actions、代码按钮下拉与全局导航侧栏的 Codespaces、营销头部与页脚的产品项 */
  const PRODUCTS: readonly (readonly [string, string])[] = [
    ['Actions', '操作'],
    ['Codespaces', '代码空间'],
    ['GitHub Advanced Security', 'GitHub 高级安全'],
    ['Copilot for Business', 'Copilot 商业版'],
    ['GitHub Skills', 'GitHub 技能'],
    ['GitHub Sponsors', 'GitHub 赞助'],
    ['GitHub Desktop', 'GitHub 桌面版'],
    ['GitHub Actions', 'GitHub 操作'],
    ['GitHub Codespaces', 'GitHub 代码空间'],
    ['GitHub Pages', 'GitHub 页面'],
    ['GitHub Packages', 'GitHub 软件包'],
    ['GitHub Models', 'GitHub 模型'],
    ['Advanced Security', '高级安全'],
    ['Copilot coding agent', 'Copilot 编码智能体'],
    ['Copilot Code review', 'Copilot 代码审查'],
    ['GitHub Stars', 'GitHub 之星'],
    ['Beta', '测试版'],
    ['GitHub Pro', 'GitHub 专业版'],
    ['GitHub Enterprise', 'GitHub 企业版'],
    ['Copilot Pro+', 'Copilot 专业增强版'],
    ['Copilot Business', 'Copilot 商业版'],
    ['GitHub Copilot Enterprise', 'GitHub Copilot 企业版']
  ]

  it.each<readonly [string, readonly PageKey[]]>([
    ['code', ['common', 'repository', 'code']],
    ['issues', ['common', 'repository', 'issues']],
    ['pulls', ['common', 'repository', 'pulls']],
    ['actions', ['common', 'repository', 'actions']],
    ['insights', ['common', 'repository', 'insights']],
    ['security', ['common', 'repository', 'security']],
    ['profile', ['common', 'profile', 'organization']],
    ['codespaces', ['common', 'codespaces']],
    ['explore', ['common', 'explore']],
    ['dashboard', ['common', 'dashboard']],
    ['copilot', ['common', 'copilot']]
  ])('%s 页面类型也译出', (_, scope) => {
    for (const [source, expected] of PRODUCTS) expect(full.translate(source, scope)).toBe(expected)
  })
})

describe('common 被 <kbd> 拆开的搜索提示（引擎整句匹配，按 kbd 文字切分写回）', () => {
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

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('Type <kbd>@</kbd> to search repositories → 按 @ 搜索存储库，kbd 保留', () => {
    const span = start('<span>Type <kbd>@</kbd> to search repositories</span>').firstElementChild!
    expect(span.textContent).toBe('按 @ 搜索存储库')
    expect(ownTexts(span)).toEqual(['按 ', ' 搜索存储库'])
    expect(span.querySelector('kbd')?.textContent).toBe('@')
    expect(span.childNodes).toHaveLength(3)
  })

  it.each([
    ['Type <kbd>/</kbd> to search files', '按 / 搜索文件'],
    ['Type <kbd>@</kbd> to search organizations, repositories, and users', '按 @ 搜索组织、存储库和用户'],
    ['Type <kbd>#</kbd> to search issues and pull requests', '按 # 搜索议题和拉取请求'],
    ['Type <kbd>?</kbd> for help and tips', '按 ? 查看帮助和提示'],
    // 头部搜索按钮：/ 走静态整句，其他快捷键走正则
    ['Type <kbd>/</kbd> to search', '按 / 搜索'],
    ['Type <kbd>s</kbd> to search', '按 s 搜索'],
    // 旧版命令面板的提示
    ['Type <kbd>#</kbd> to search discussions', '按 # 搜索讨论'],
    ['Type <kbd>!</kbd> to search projects', '按 ! 搜索项目'],
    ['Type <kbd>@</kbd> to search teams', '按 @ 搜索团队'],
    ['Type <kbd>&gt;</kbd> to activate command mode', '按 > 进入命令模式']
  ])('%s → %s', (html, expected) => {
    const span = start(`<span>${html}</span>`).firstElementChild!
    expect(span.textContent).toBe(expected)
    expect(span.querySelector('kbd')).not.toBeNull()
  })

  it('命令面板 Tip 行：Tip: 单独翻译；React 拆出的相邻文本节点并入整句；全角冒号后不留原文空白', () => {
    // <strong>Tip:</strong>{' '}Type <kbd>@</kbd>{' '}{text}：kbd 两侧各是两个相邻文本节点
    const body = start('<span id="tip"><strong>Tip:</strong> Type <kbd>@</kbd> to search repositories</span>', root => {
      const tip = root.querySelector('#tip')!
      ;(tip.childNodes[1] as Text).splitText(1)
      ;(tip.lastChild as Text).splitText(1)
    })
    const tip = body.querySelector('#tip')!
    expect(tip.childNodes).toHaveLength(6)
    expect(tip.textContent).toBe('提示：按 @ 搜索存储库')
    expect(tip.querySelector('kbd')?.textContent).toBe('@')
  })
})

describe('common 旧版命令面板（catalyst 实现，被 <strong> 拆开的标题）', () => {
  let translator: Translator | undefined

  function start(html: string): HTMLElement {
    document.body.innerHTML = html
    translator = createTranslator({ matcher, host: window, resolvePages: () => ['common'] })
    translator.start()
    return document.body
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  const HELP_TITLE = '[data-target="command-palette-help.titleElement"]'
  const ITEM_TITLE = '[data-target="command-palette-item.titleElement"]'

  /** 服务端模板 <command-palette-help> 与据此渲染的列表项（标题以 innerHTML 写入内层 span） */
  function helpHtml(title: string): string {
    return (
      `<command-palette-help hidden><span data-target="command-palette-help.titleElement">${title}</span>` +
      '<span data-target="command-palette-help.hintElement"><kbd class="hx_kbd">#</kbd></span></command-palette-help>' +
      `<command-palette-item><span data-target="command-palette-item.titleElement"><span>${title}</span></span>` +
      '</command-palette-item>'
    )
  }

  it.each([
    ['Search for <strong>issues</strong> and <strong>pull requests</strong>', '搜索议题和拉取请求'],
    ['Search for <strong>issues, pull requests, discussions,</strong> and <strong>projects</strong>', '搜索议题、拉取请求、讨论和项目'],
    ['Search for <strong>organizations, repositories,</strong> and <strong>users</strong>', '搜索组织、存储库和用户'],
    ['Search for <strong>projects</strong>', '搜索项目'],
    ['Search for <strong>files</strong>', '搜索文件'],
    // 与提示 Type > to activate command mode 同用“进入”
    ['Activate <strong>command mode</strong>', '进入命令模式']
  ])('帮助项 %s → %s：模板与列表项都整段合并', (title, expected) => {
    const body = start(helpHtml(title))
    expect(body.querySelector(HELP_TITLE)?.textContent).toBe(expected)
    expect(body.querySelector(ITEM_TITLE)?.textContent).toBe(expected)
    expect(body.querySelector('kbd')?.textContent).toBe('#')
  })

  it('其他位置同样被 <strong> 拆开的句子不整段合并，类型词 users 不单独翻译', () => {
    const body = start('<span id="other">Search for <strong>organizations, repositories,</strong> and <strong>users</strong></span>')
    const strongs = [...body.querySelectorAll('#other strong')].map(strong => strong.textContent)
    expect(strongs).toEqual(['organizations, repositories,', 'users'])
  })

  it.each([
    [`Search<strong> 'button' </strong>across all of GitHub`, "在整个 GitHub 中搜索 'button' "],
    [`Search<strong> 'button' </strong>in octo-org/hello-world`, "在 octo-org/hello-world 中搜索 'button' "],
    [`Search<strong> 'button' </strong>in octo-org`, "在 octo-org 中搜索 'button' "]
  ])('底部搜索项 %s → %s：查询词在 strong 中保持原样', (html, expected) => {
    const title = start(`<span data-target="command-palette-item.titleElement">${html}</span>`).firstElementChild!
    expect(title.textContent).toBe(expected)
    expect(title.querySelector('strong')?.textContent).toBe(" 'button' ")
  })

  it('底部搜索项的句型只认全局、所有者、存储库三种范围', () => {
    const inline = (key: string): string | undefined => matcher.translateInline(patternKey(key), ['common'])
    expect(inline('Search {} across all of GitHub')).toBe('在整个 GitHub 中搜索{}')
    expect(inline('Search {} in octo-org/hello-world')).toBe('在 octo-org/hello-world 中搜索{}')
    expect(inline('Search {} in octo-org')).toBe('在 octo-org 中搜索{}')
    expect(inline('Search {} in this repository')).toBeUndefined()
    expect(inline('Search {} in octo-org/hello-world/docs')).toBeUndefined()
  })

  it('# 模式的筛选提示（服务端模板 <command-palette-tip>）：Tip: 与整句分别翻译，限定符保持原样', () => {
    const body = start(
      '<command-palette-tip data-mode="#" hidden><div class="d-flex"><div>' +
        '<span class="text-bold">Tip:</span>\n      Type is:project to filter to projects\n    </div>' +
        '<div class="ml-2">Type <kbd class="hx_kbd">?</kbd> for help and tips</div></div></command-palette-tip>'
    )
    expect(body.querySelector('.text-bold')?.parentElement?.textContent?.trim()).toBe('提示：输入 is:project 仅筛选项目')
    expect(body.querySelector('.ml-2')?.textContent).toBe('按 ? 查看帮助和提示')
  })

  it.each([
    "We’ve encountered an error and some results aren't",
    "We've encountered an error and some results aren't",
    'We’ve encountered an error and some results aren’t'
  ])('报错条（<command-palette-tip data-on-error>）%s …：两句同一文本节点，整句翻译，图标保留', head => {
    const body = start(
      '<command-palette-tip class="flash flash-error" data-on-error hidden><div><svg aria-hidden="true"></svg></div>' +
        `<div class="px-2">\n      ${head} available at this time. Type a new search or try again later.\n    </div>` +
        '</command-palette-tip>'
    )
    expect(body.querySelector('.px-2')?.textContent?.trim()).toBe('出错了，部分结果暂时不可用。请重新搜索或稍后重试。')
    expect(body.querySelector('svg')).not.toBeNull()
  })

  it('提示条（.js-command-palette-toasts）：脚本写入的运行命令、复制出错文字', async () => {
    const body = start(
      '<div class="js-command-palette-toasts"><div hidden class="Toast Toast--error">' + '<span class="Toast-content"></span></div></div>'
    )
    const content = body.querySelector('.Toast-content')!
    content.textContent = 'Failed to run command'
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(content.textContent).toBe('运行命令失败')
    content.textContent = 'Copy failed'
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(content.textContent).toBe('复制失败')
  })
})

describe('common 被链接、<strong> 拆开的横幅与提示（逐段翻译）', () => {
  /** 整包词典：链接文字 Download your recovery codes、contact support 等由其他文件的全局词条翻译 */
  const full = createMatcher(zhCN)
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each([
    [
      '停用功能预览：两句按句拆开，Please 是全局词条',
      '<p>Feature disabled. Please <a href="#">give feedback</a> so we can improve it!</p>',
      '功能已禁用。请 提供反馈 以便我们改进！'
    ],
    [
      '恢复手段提醒',
      '<div>Don\'t get locked out of your account. <a href="#">Download your recovery codes</a> or <a href="#">add a passkey</a> so you don\'t lose access when you get a new device.</div>',
      '避免无法访问帐户。下载恢复代码 或 添加通行密钥 以免换用新设备后无法访问帐户。'
    ],
    [
      '换机提醒：链接后的全角逗号前不留空白',
      '<div>Don\'t get locked out - if you get a new phone this season, be sure to transfer your authenticator app data to the new phone. Enable cloud back up if your authenticator app supports it and consider <a href="#">redownloading your recovery codes</a>, just to be safe.</div>',
      '避免无法访问帐户——如果你在这个假期换了新手机，请务必将身份验证器应用的数据转移到新手机。如果你的身份验证器应用支持云备份，请启用云备份，并考虑 重新下载恢复代码，以防万一。'
    ],
    [
      '组织被标记',
      '<p>Because of that, your organization is hidden from the public. If you believe this is a mistake, <a href="#">contact support</a> to have your organization’s status reviewed.</p>',
      '因此，你的组织已对公众隐藏。如果你认为这是误判，请 联系支持 以复核组织状态。'
    ],
    ['网络出错', '<p>Failed to fetch data, <a href="#">click here to reload the page.</a></p>', '获取数据失败，单击此处重新加载页面。'],
    [
      '强制 2FA',
      '<p>GitHub users are <strong>now required</strong> to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to enable two-factor authentication on your account before March 15, 2027, or be restricted from account actions.</p>',
      'GitHub 用户 现在必须 启用双因素身份验证作为额外的安全措施。你在 GitHub 上的活动使你也在此要求范围内。你需要在 2027年3月15日之前为帐户启用双因素身份验证，否则帐户操作将受到限制。'
    ]
  ])('%s', (_, html, expected) => {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: full, host: window, resolvePages: () => ['common'] })
    translator.start()
    expect(document.body.textContent).toBe(expected)
  })
})

describe('common 被 <strong> 拆开的 Copilot 预算横幅（CopilotBudgetRequestBanner）', () => {
  let translator: Translator | undefined

  /** 片段：字符串是 React 渲染出的相邻文本节点，[标签, 文字] 是元素 */
  type Part = string | readonly [tag: string, text: string]

  /** 按 React 的渲染结果拼出横幅描述 <span class="text-normal"> 并开始翻译 */
  function render(parts: readonly Part[]): HTMLElement {
    const host = document.createElement('span')
    host.className = 'text-normal'
    host.append(
      ...parts.map(part => {
        if (typeof part === 'string') return document.createTextNode(part)
        const element = document.createElement(part[0])
        element.textContent = part[1]
        return element
      })
    )
    document.body.replaceChildren(host)
    translator = createTranslator({ matcher, host: window, resolvePages: () => ['common'] })
    translator.start()
    return host
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each<readonly [string, readonly Part[], string]>([
    [
      '个人预算用尽：来源移到句中',
      [
        "You've used all your AI credits",
        ' from ',
        ['strong', 'octo-org'],
        '. Access resumes on ',
        'Nov 1, 2026',
        '. Your ',
        'org admins',
        ' can increase it sooner.'
      ],
      '你已用完来自 octo-org 的全部 AI 额度。将于 2026年11月1日恢复使用。你的组织管理员可以提前提高额度。'
    ],
    [
      '个人预算用尽（旧版预算名、企业预算、无法解析的日期原样保留）',
      [
        "You've used your full Copilot budget",
        ' from ',
        ['strong', 'big-co'],
        '. Access resumes on ',
        '11/1/2026',
        '. Your ',
        'enterprise account owners',
        ' can increase it sooner.'
      ],
      '你已用完来自 big-co 的全部 Copilot 预算。将于 11/1/2026 恢复使用。你的企业帐户所有者可以提前提高额度。'
    ],
    [
      '组织预算用尽：<strong> 前后分别翻译',
      [
        'Your ',
        'organization',
        ' ',
        ['strong', 'octo-org'],
        ' ',
        'has used all its Copilot AI credits',
        '. Access resumes on ',
        'Dec 1',
        '. Contact your admins to increase it.'
      ],
      '你的组织 octo-org 已用完全部 Copilot AI 额度。将于 12月1日恢复使用。请联系你的管理员提高额度。'
    ],
    [
      '申请已发送',
      [['strong', 'Request sent.'], ' Your ', 'org admins', ' will be notified that you need additional', ' ', 'AI credits', '.'],
      '申请已发送。你的组织管理员将收到你需要更多 AI 额度的通知。'
    ]
  ])('%s', (_, parts, expected) => {
    const host = render(parts)
    expect(host.textContent).toBe(expected)
  })

  it('来源名在 <strong> 中保持原样', () => {
    const host = render([
      "You've used all your Copilot AI credits",
      ' from ',
      ['strong', 'octo-org'],
      '. Access resumes on ',
      'Nov 1, 2026',
      '. Your ',
      'org admins',
      ' can increase it sooner.'
    ])
    expect(host.querySelector('strong')?.textContent).toBe('octo-org')
    expect(host.textContent).toBe(
      '你已用完来自 octo-org 的全部 Copilot AI 额度。将于 2026年11月1日恢复使用。你的组织管理员可以提前提高额度。'
    )
  })
})
