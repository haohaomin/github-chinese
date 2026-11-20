import { describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import copilot from '../../../src/locales/zh-CN/copilot'
import agents from '../../../src/locales/zh-CN/copilot/agents'
import app from '../../../src/locales/zh-CN/copilot/app'
import chat from '../../../src/locales/zh-CN/copilot/chat'
import code from '../../../src/locales/zh-CN/copilot/code'
import copilotComposer from '../../../src/locales/zh-CN/copilot/composer'
import models from '../../../src/locales/zh-CN/copilot/models'
import skills from '../../../src/locales/zh-CN/copilot/skills'
import dashboard from '../../../src/locales/zh-CN/dashboard'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'

const matcher = createMatcher([['dashboard', dashboard]])
/** 含通用词典，与实际页面一致：通用按钮、计数等由 common / common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['dashboard', dashboard]
])
/** 完整语言包：其他页面词典的全局 static 也生效 */
const bundleMatcher = createMatcher(zhCN)
/** Copilot 页：首页输入框沿用的 copilot 规则与 Copilot 页同译 */
const copilotMatcher = createMatcher([['copilot', copilot]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'dashboard'])
}

function translateFull(text: string): string | undefined {
  return fullMatcher.translate(text, ['common', 'dashboard'])
}

function translateBundle(text: string): string | undefined {
  return bundleMatcher.translate(text, ['common', 'dashboard'])
}

/** Copilot 页对同一原文的译文（具体译文由 copilot 词典的测试逐条覆盖） */
function copilotText(text: string): string {
  const result = copilotMatcher.translate(text, ['common', 'copilot'])
  if (result === undefined || result === text) throw new Error(`Copilot 页未翻译：${text}`)
  return result
}

/** 沿用 copilot 规则的样例：期望译文取 Copilot 页的译文 */
function sameAsCopilot(texts: readonly string[]): readonly (readonly [string, string])[] {
  return texts.map(text => [text, copilotText(text)] as const)
}

/** 首页 Copilot 输入框沿用的 copilot 规则（由 copilot 词典自己的测试逐条覆盖） */
const IMPORTED_RULES: ReadonlySet<unknown> = new Set([
  ...(models.regexp ?? []),
  ...(copilotComposer.regexp ?? []),
  ...(agents.regexp ?? []),
  ...(chat.regexp ?? []),
  ...(skills.regexp ?? [])
])

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按合并后的正则顺序排列（home → feed → onboarding → composer），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 首页框架与分区列表
  { hits: [['Switch dashboard: octocat', '切换仪表板：octocat']], misses: ['Switch dashboard'] },
  { hits: [['Go to octocat dashboard', '前往 octocat 的仪表板']], misses: ['Go to the dashboard', 'Go to octocat'] },
  // 拉取请求与问题条目共用同一模板，拉取请求的动词 open → 创建，问题条目随同句一致
  {
    hits: [
      ['octo-org/hello-world#123 · Opened by octocat · Updated', 'octo-org/hello-world#123 · 由 octocat 创建 · 更新于'],
      ['octo-org/hello#5 · Opened by Copilot · Created', 'octo-org/hello#5 · 由 Copilot 创建 · 创建于']
    ],
    misses: ['octo-org/hello-world#123 · Opened by octocat']
  },
  {
    hits: [
      ['· Working', '· 工作中'],
      ['· 2 revisions · Ready for review', '· 2 次修订 · 可供审查'],
      ['· Queued to merge', '· 已排队等待合并']
    ],
    misses: ['· Sleeping']
  },
  {
    hits: [['octocat/hello-world · Initializing session...', 'octocat/hello-world · 正在初始化会话...']],
    misses: ['Initializing session...']
  },
  {
    hits: [['Please keep your feedback within 1,000 characters or less.', '反馈请控制在 1,000 个字符以内。']],
    misses: ['Please keep your feedback short.']
  },
  {
    hits: [
      ['More options for Agent sessions', '智能体会话的更多选项'],
      ['More options for Top repositories', 'Top repositories 的更多选项']
    ],
    misses: ['More options']
  },
  {
    hits: [
      ['Show Agent sessions', '显示智能体会话'],
      ['Show Pull requests', '显示拉取请求']
    ],
    misses: ['Show Top repositories']
  },

  // 组织仪表板
  {
    hits: [['You’re an owner of the octo-org organization!', '你是 octo-org 组织的所有者！']],
    misses: ['You’re an owner of this organization!']
  },
  { hits: [['Create a repository for octo-org', '为 octo-org 创建存储库']], misses: ['Create a repository'] },
  { hits: [["Edit octo-org's settings", '编辑 octo-org 的设置']], misses: ['Edit settings'] },
  {
    hits: [['Check out octo-org’s public profile', '查看 octo-org 的公开个人资料']],
    misses: ['Check out the public profile']
  },
  // 顶部提示：删除存储库、继任者邀请
  {
    hits: [
      ['Your repository "octocat/hello-world" was successfully deleted.', '存储库“octocat/hello-world”已删除。'],
      ['Your repository “octo-org/docs” was successfully deleted.', '存储库“octo-org/docs”已删除。']
    ],
    misses: ['Your repository was successfully deleted.']
  },
  {
    hits: [["You are now the designated successor for octocat's account.", '你已成为 octocat 帐户的指定继任者。']],
    misses: ['You are now the designated successor.']
  },
  {
    hits: [['You have declined to become the designated successor for mona’s account.', '已拒绝成为 mona 帐户的指定继任者。']],
    misses: ['You have declined to become the designated successor.']
  },

  // 动态（推荐原因：标点随原文，不加冒号）
  {
    hits: [
      ["You're seeing this because you starred octo-org/hello-world", '你看到此内容是因为你为 octo-org/hello-world 加了星标'],
      ['You’re seeing this because you follow mona', '你看到此内容是因为你关注了 mona'],
      ["You're seeing this because you collaborated with octocat", '你看到此内容是因为你与 octocat 协作过'],
      ["You're seeing this because you starred", '你看到此内容是因为你加了星标']
    ],
    misses: ["You're seeing this because you forked octo-org/hello-world"]
  },
  { hits: [['and 3 more', '以及另外 3 个']], misses: ['and more'] },
  {
    hits: [
      ['5 more commits »', '另有 5 个提交 »'],
      ['1 more commit »', '另有 1 个提交 »']
    ],
    misses: ['more commits »']
  },
  {
    hits: [
      ['3 commits to', '3 个提交到'],
      ['1 commit to', '1 个提交到']
    ],
    misses: ['commits to']
  },
  { hits: [['added 2 repositories to', '将 2 个存储库添加到']], misses: ['added repositories to'] },
  { hits: [['3 of your repositories', '你的 3 个存储库']], misses: ['all of your repositories'] },
  {
    hits: [
      ['4 issues need help', '4 个议题需要帮助'],
      ['1 issue needs help', '1 个议题需要帮助']
    ],
    misses: ['issues need help']
  },
  {
    hits: [["Support octocat's open source work", '支持 octocat 的开源工作']],
    misses: ['Support open source work']
  },
  // 旧版动态卡片：“不感兴趣”菜单与反馈
  {
    hits: [
      ["I'm not interested in starred repositories from octocat", '对 octocat 加星标的存储库不感兴趣'],
      ['I’m not interested in forked repositories from mona', '对 mona 复刻的存储库不感兴趣']
    ],
    misses: ["I'm not interested in watched repositories from octocat"]
  },
  {
    hits: [["I'm not interested in octo-org/hello-world", '对 octo-org/hello-world 不感兴趣']],
    misses: ["I'm not interested in this"]
  },
  {
    hits: [
      // starred repositories → 已加星标的存储库（GLOSSARY star 行）
      ['I want to see fewer starred repositories', '减少已加星标的存储库动态'],
      ['I want to see fewer forked repositories', '减少复刻存储库动态'],
      ['I want to see fewer trending repositories', '减少趋势存储库动态']
    ],
    misses: ['I want to see fewer repositories']
  },
  {
    hits: [
      ['Dismissed a repository from octo-org/hello-world. Thank you for the feedback!', '已从动态中删除 octo-org/hello-world。感谢反馈！']
    ],
    misses: ['Dismissed a repository. Thank you for the feedback!']
  },
  { hits: [['repository body 0', '存储库内容 0']], misses: ['repository body'] },
  { hits: [['Repo Details 3', '存储库详细信息 3']], misses: ['Repo Details: 3'] },
  {
    hits: [
      ['523 stargazers', '523 个标星者'],
      ['1 stargazer', '1 个标星者']
    ],
    misses: ['stargazers']
  },
  {
    hits: [
      ['Follow octocat', '关注 octocat'],
      ['Unfollow mona-lisa', '取消关注 mona-lisa']
    ],
    misses: ['Follow me on Mastodon']
  },

  // 新手引导
  {
    hits: [
      ['2/3 completed', '已完成 2/3'],
      ['1/4 complete', '已完成 1/4']
    ],
    misses: ['two of three completed']
  },
  { hits: [['Read · Est. 5m', '阅读 · 约 5分钟']], misses: ['Read · 5 minutes'] },
  {
    hits: [
      ['Watch · 9 videos', '观看 · 9 个视频'],
      ['Watch · 1 video', '观看 · 1 个视频']
    ],
    misses: ['Watch · videos']
  },

  // Copilot 输入框：问候语
  {
    hits: [
      ['Good morning, Mona!', '早上好，Mona！'],
      ['Good afternoon, octocat!', '下午好，octocat！'],
      ['Good evening, The Octocat!', '晚上好，The Octocat！']
    ],
    misses: ['Good night, Mona!']
  },
  { hits: [['Welcome to GitHub, octocat!', '欢迎来到 GitHub，octocat！']], misses: ['Welcome to GitHub!'] },
  // 免费计划额度用尽：输入框横幅与首页提示
  {
    hits: [
      ['You have reached your free plan limit. Limit resets on November 1, 2026.', '已达免费计划上限。限额将于 2026年11月1日重置。'],
      ['You have reached your free plan limit. It will reset on May 07, 2026.', '已达免费计划上限。限额将于 2026年5月7日重置。'],
      [
        'You have reached your free plan limit. Limit resets on November 1, 2026. Plan upgrades are temporarily unavailable.',
        '已达免费计划上限。限额将于 2026年11月1日重置。计划升级暂不可用。'
      ],
      // 缺年份的日期同样以数字开头，前缀后补空格
      ['You have reached your free plan limit. Limit resets on Dec 31.', '已达免费计划上限。限额将于 12月31日重置。']
    ],
    misses: ['You have reached your free plan limit.']
  },
  // 任务创建失败的读屏播报：说明沿用 agents 的横幅规则与 models 的计费提示（与 Copilot 页同译），其余保留原文
  {
    hits: [
      ...[
        "Unable to start task for 'Fix the login bug'. Please try again.",
        "Unable to start task for 'Fix the login bug': Repository not found",
        'Before you can use Copilot cloud agent, you need to pick a "Usage billed to" option in your Copilot settings.'
      ].map(description => [`Task creation failed. ${description}`, `任务创建失败。${copilotText(description)}`] as const),
      ['Task creation failed. Internal error', '任务创建失败。Internal error'],
      ['Task creation failed. constructor', '任务创建失败。constructor']
    ],
    misses: ['Task creation failed.', 'Task creation failed']
  },
  // 沿用的 copilot 规则：模型选择器、推理强度、引用选择器与附件
  {
    hits: sameAsCopilot([
      'Optimized for: Balance',
      'Model: Claude Sonnet 4.5',
      'Reasoning effort: High',
      'Files and folders › octocat/hello-world ›',
      "Couldn't attach setup.exe. This file type is unsupported."
    ]),
    misses: ['Optimized for: Speed', 'Files and folders']
  },
  // 沿用的 copilot 规则：环境条、图片附件、任务创建失败横幅、粘贴代码块的读屏播报
  {
    hits: sameAsCopilot([
      'Personal (octocat)',
      'Select conversation scope, current: Personal',
      'Repositories in @octo-org and public repositories',
      "Repositories are limited to your personal account. Change the Chat scope to work in another owner's repositories.",
      'Cloud sessions are disabled for octo-org',
      'Repository: octocat/hello-world',
      'Branch: Select branch',
      'Remove octocat/hello-world',
      'Environment: Cloud',
      'Chat (Personal)',
      'Mode: Chat (octo-org)',
      'Space: Resolving…',
      'Resolving space: Docs',
      'Space selected: Docs',
      'Custom agent: Reviewer',
      'Select MCP permission mode, current: Allow all',
      'Tool permissions: "Autopilot" isn\'t available for this session. Choose an available option to continue.',
      "Unable to start task for 'Fix the login bug'. Please try again.",
      "Unable to start task for 'Fix the login bug': Repository not found",
      'Image: screenshot.png',
      'Image limit reached (3)',
      'You can attach up to 3 images per task',
      'notes.txt could not be attached. Text and PDF files must be 10 MB or smaller, and you can attach up to 10 text, PDF, or image files at a time.',
      "The GPT-5 model doesn't support answering questions about images. Select a different model and try again.",
      'Block pasted, 2 total',
      'Block removed, 1 left'
    ]),
    misses: [
      'Repositories in octo-org',
      'Image limit reached',
      "Unable to start task for 'Fix the login bug'",
      'Block pasted',
      'Block removed, none left'
    ]
  },
  {
    hits: [
      ['Dismissed a push from octo-org/hello-world. Thank you for the feedback!', '已忽略来自 octo-org/hello-world 的推送。感谢你的反馈！']
    ],
    misses: ['Dismissed a push. Thank you for the feedback!']
  },
  {
    hits: [
      ['@octocat profile', '@octocat 的个人资料'],
      ['@dependabot[bot] profile', '@dependabot[bot] 的个人资料']
    ],
    misses: ['octocat profile', '@octocat profile picture']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('dashboard 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dashboard.static?.[input]).toBeUndefined()
    expect(dashboard.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = dashboard.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((rule, index) => !IMPORTED_RULES.has(rule) && !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('沿用的 agents / chat / skills 规则只取输入框用到的部分', () => {
    const agentAndChatRules: ReadonlySet<unknown> = new Set([...(agents.regexp ?? []), ...(chat.regexp ?? [])])
    const imported = (dashboard.regexp ?? []).filter(rule => agentAndChatRules.has(rule))
    expect(imported.length).toBeGreaterThan(0)
    expect(imported.length).toBeLessThan((agents.regexp ?? []).length)
    const skillRules: ReadonlySet<unknown> = new Set(skills.regexp ?? [])
    const importedSkills = (dashboard.regexp ?? []).filter(rule => skillRules.has(rule))
    expect(importedSkills).toHaveLength(2)
    // 代理会话页专用的规则不带到首页
    expect(translate('octocat is working…')).toBeUndefined()
    expect(translate('Uploading notes.txt')).toBeUndefined()
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    // `${repo}#${number} · Opened by ${author} · ` + 'Updated '，其后是 <relative-time>
    expect(translate(normalizeText(['octo-org/hello-world#123 · Opened by octocat · ', 'Updated '].join('')))).toBe(
      'octo-org/hello-world#123 · 由 octocat 创建 · 更新于'
    )
    // <relative-time> 之后：' · ' + '2 revisions ·' + ' ' + 状态
    expect(translate(normalizeText([' · ', '2 revisions ·', ' ', 'Merged'].join('')))).toBe('· 2 次修订 · 已合并')
    expect(translate(normalizeText([' · ', ' ', 'Failed'].join('')))).toBe('· 失败')
    // 免费计划横幅：'You have reached your free plan limit. Limit resets on ' + 日期 + '.'
    expect(translate(normalizeText(['You have reached your free plan limit. Limit resets on ', 'June 1, 2026', '.'].join('')))).toBe(
      '已达免费计划上限。限额将于 2026年6月1日重置。'
    )
    // 清单进度：'1' + '/' + '4' + ' complete'
    expect(translate(normalizeText(['1', '/', '4', ' complete'].join('')))).toBe('已完成 1/4')
  })

  it('拆开的片段单独命中', () => {
    // View all<span class="sr-only"> sessions</span>
    expect(translateFull('View all')).toBe('查看全部')
    expect(translate('sessions')).toBe('会话')
    expect(translate('pull requests')).toBe('拉取请求')
    // Started + <relative-time>
    expect(translate('Started')).toBe('开始于')
    // <span>3</span><span class="sr-only"> comments</span>
    expect(translate('comments')).toBe('条评论')
    // <用户> starred a repository / <用户> starred <存储库> / <用户> pushed to <分支> / Popular among + <people you follow>
    expect(translate('starred a repository')).toBe('为存储库加了星标')
    expect(translate('starred')).toBe('加了星标')
    expect(translate('pushed to')).toBe('推送到')
    expect(translate('Popular among')).toBe('热门于')
    expect(translate('people you follow')).toBe('你关注的人')
    // You’ve been added to the + <组织> + organization!
    expect(translate('You’ve been added to the')).toBe('你已被添加到')
    expect(translate('organization!')).toBe('组织！')
    // 个人上下文 ( + <用户名> + ) 和你所属的组织之间切换。（括号内是英文用户名，用半角括号）
    expect(translate('Use the switch context button in the upper left corner of this page to switch between your personal context (')).toBe(
      '使用页面左上角的上下文切换按钮，在你的个人上下文 ('
    )
    expect(translate(') and organizations you are a member of.')).toBe(') 和你所属的组织之间切换。')
    // 隐私说明 + <Privacy Policy> + .
    expect(
      translateFull(
        "Please don't include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our"
      )
    ).toBe('请勿包含敏感、机密或个人数据。你的反馈将用于改进我们的服务，并遵循我们的')
    expect(translateFull('Privacy Policy')).toBe('隐私政策')
    // 模型选择器按钮：<span class="sr-only">Model: </span> + 模型名（models 词典的全局词条）
    expect(translateBundle(normalizeText('Model: '))).toBe(models.static?.['Model:'])
  })

  it('关注者计数由 common-ui 的通用计数翻译', () => {
    expect(translateFull('12.3k followers')).toBe('12.3k 个关注者')
    expect(dashboard.regexp?.some(([pattern]) => pattern.test('12.3k followers'))).toBe(false)
  })
})

describe('dashboard 静态词条', () => {
  it.each([
    ['Latest changes', '最新变更'],
    ['View changelog →', '查看更新日志 →'],
    ['Explore repositories', '探索存储库'],
    ['Your teams', '你的团队'],
    ['Recent activity', '最近活动'],
    ['New', '新建'],
    ['Switch dashboard context', '切换仪表板上下文'],
    ['Agent sessions options', '智能体会话选项'],
    ['Hide section', '隐藏分区'],
    ['Hidden', '已隐藏'],
    ['3 months', '3 个月'],
    ['Assigned to Copilot', '已分配给 Copilot'],
    ['Involves me', '与我有关'],
    ['No pull requests found, try a different filter.', '未找到拉取请求，请尝试其他筛选器。'],
    ['For you', '为你推荐'],
    ['Following', '正在关注'],
    ['Feed filters', '动态筛选器'],
    ['Events', '事件'],
    ['Sponsors', '赞助'],
    ['Include events from starred repositories', '包含已加星标存储库的事件'],
    ['Repositories being starred by people', '被他人加星标的存储库'],
    ['made this repository public', '将此存储库设为公共'],
    ['opened a pull request', '创建了拉取请求'],
    // 原文没有给界面名加引号，译文也不加
    [
      'We’ve combined the power of the Following feed with the For you feed so there’s one place to discover content on GitHub. There’s improved filtering so you can customize your feed exactly how you like it, and a shiny new visual design. ✨',
      '我们把正在关注动态与为你推荐动态合二为一，在同一处发现 GitHub 上的内容。筛选功能已改进，可按喜好定制动态，还换上了全新的视觉设计。✨'
    ],
    ['One moment please...', '请稍候...'],
    ['Loading activity...', '正在加载活动...'],
    ['Filters are loading', '正在加载筛选器'],
    ['Repo Details', '存储库详细信息'],
    // 喜好义的 preferences 不按设置义译“首选项”
    ['Tell us more about your preferences', '告诉我们你的偏好'],
    ['Feed item options', '动态条目选项'],
    // 推荐原因：标点随原文，不加冒号
    ["You're seeing this because of your activity.", '你看到此内容是因为你的活动。'],
    ['You’re seeing this based on GitHub-wide trends.', '你看到此内容是基于 GitHub 全站趋势。'],
    ['Recommended for you', '为你推荐'],
    ['Latest from our changelog', '更新日志最新动态'],
    ['Popular projects among', '热门项目于'],
    ['Agent sessions status filter', '智能体会话状态筛选器'],
    // 产品名按用户要求译成中文（product-names.md）
    ['Open in Copilot Chat', '在 Copilot 聊天中打开'],
    ['Go to organization dashboard', '转到组织仪表板'],
    ['Remove from dashboard', '从仪表板删除'],
    ['Getting started', '入门'],
    ['You finished your onboarding tasks!', '你已完成入门任务！'],
    ['Complete profile', '完善个人资料'],
    ['Copilot Chat Cookbook', 'Copilot 聊天实用手册'],
    ['Download GitHub for Desktop', '下载 GitHub 桌面版'],
    ['Install GitHub Desktop', '安装 GitHub 桌面版'],
    ['Create a site or blog from your GitHub repositories with GitHub Pages.', '使用 GitHub 页面从 GitHub 存储库创建网站或博客。'],
    [
      'Develop with AI-powered code suggestions using GitHub Copilot, Codespaces, and VS Code.',
      '借助 GitHub Copilot、代码空间和 VS Code 的 AI 代码建议进行开发。'
    ],
    ['Learn with a tutorial project', '通过教程项目学习'],
    // 分句间的 — 译作 ——，两侧不加空格
    ['The home for all developers — including you.', '所有开发人员的家园——也包括你。'],
    // 教程项目标题：产品名按用户要求译成中文（同 Introduction to GitHub → GitHub 入门）
    ['Hello GitHub Actions', 'GitHub 操作入门'],
    ['Create a GitHub Action and use it in a workflow.', '创建 GitHub 操作并在工作流中使用。'],
    ['name your new repository...', '为新存储库命名...'],
    ["You're seeing this because you haven't opened a pull request in a while.", '你看到此内容是因为你有一段时间没有创建拉取请求了。'],
    ['write comments, and open a pull request.', '撰写评论并创建拉取请求。'],
    ['Try GitHub Copilot free for 30 days,', '免费试用 GitHub Copilot 30 天，'],
    ['Repository name', '存储库名称'],
    ['Use', '使用'],
    ['Join GitHub Education', '加入 GitHub 教育'],
    ['Go to GitHub Education', '转到 GitHub 教育'],
    // Copilot 输入框
    ['Ask', '询问'],
    ['Create an issue with sub-issues', '创建带子议题的议题'],
    ['Ask anything or type @ to add context with Copilot', '向 Copilot 提问或输入 @ 添加上下文'],
    // 标点随原文：两句之间用句号
    ['There was an error sending your message. Please try again.', '消息发送出错。请重试。'],
    ['Upgrade plan', '升级计划'],
    ['Efficiency', '效率'],
    ['Attachments', '附件'],
    ['Search repositories...', '搜索存储库...'],
    ['Fetching repositories…', '正在获取存储库…'],
    ['Select repository', '选择存储库'],
    ['Personal', '个人'],
    ['Environment', '环境'],
    ['NEW', '新'],
    ['Autopilot', '自动驾驶'],
    ['Allow all', '全部允许'],
    ['Waking', '唤醒中'],
    ['Draining', '排空中'],
    ['Offline', '离线']
  ])('%s → %s', (input, expected) => {
    expect(translateFull(input)).toBe(expected)
  })

  it('动态筛选对话框的事件类型 Sponsors 由 common 的全局词条翻译，不收 scoped 副本', () => {
    expect(dashboard.static?.Sponsors).toBeUndefined()
    expect(dashboard.scoped?.Sponsors).toBeUndefined()
    expect(translateFull('Sponsors')).toBe('赞助')
  })

  it('新版侧边栏的主页切换：Home 作「首页」，Feed 作「动态」，pin 作「置顶」；繁体同义', () => {
    const tw = createMatcher(zhTW)
    const scopes = ['common', 'dashboard'] as const
    const cases = [
      ['Make Home your homepage', '将首页设为主页', '將首頁設為主頁'],
      ['Make Feed your homepage', '将动态设为主页', '將動態設為主頁'],
      ['Pin your homepage', '置顶主页', '釘選主頁'],
      [
        'Choose whether github.com opens to Home or Feed. Select the pin next to either one.',
        '选择 github.com 打开时显示首页还是动态。选择其中一项旁边的置顶图标。',
        '選擇 github.com 開啟時顯示首頁或動態。選取其中一項旁的釘選圖示。'
      ]
    ] as const
    for (const [source, cn, hant] of cases) {
      expect(bundleMatcher.translate(source, scopes)).toBe(cn)
      expect(tw.translate(source, scopes)).toBe(hant)
    }
  })

  it('繁体：教程项目标题与同卡片说明', () => {
    const tw = createMatcher(zhTW)
    expect(tw.translate('Hello GitHub Actions', ['common', 'dashboard'])).toBe('GitHub 動作入門')
    expect(tw.translate('Introduction to GitHub', ['common', 'dashboard'])).toBe('GitHub 入門')
    expect(tw.translate('Create a GitHub Action and use it in a workflow.', ['common', 'dashboard'])).toBe(
      '建立 GitHub 動作並在工作流程中使用。'
    )
  })

  it('页面专属词条不影响其它页面', () => {
    const elsewhere = createMatcher([['dashboard', dashboard]])
    expect(elsewhere.translate('For you', ['common', 'profile'])).toBeUndefined()
    expect(elsewhere.translate('Recent activity', ['common', 'repository'])).toBeUndefined()
    expect(elsewhere.translate('Personal', ['common', 'settings'])).toBeUndefined()
    expect(elsewhere.translate('Good morning, Mona!', ['common', 'copilot'])).toBeUndefined()
  })

  it('输入框模式菜单、环境条的 scoped 副本与 Copilot 页同译（copilot 改译后须同步 composer.ts）', () => {
    const copied = [
      'Ask',
      'Agent',
      'Chat',
      'Cloud',
      'Mode',
      'Debug',
      'Item',
      'Attachments',
      'No issues found',
      'Personal',
      'Environment',
      'Remote',
      'NEW',
      'Unsupported',
      'Interactive',
      'Autopilot',
      'Assisted',
      'Allow all',
      'Degraded',
      'Waking',
      'Draining'
    ]
    for (const text of copied) expect([text, translate(text)]).toEqual([text, copilotText(text)])
  })

  it('Copilot 页未收录的 Task、代理模型名 Auto 只在首页收录：Auto 与全局“Model: Auto”同译', () => {
    expect(translate('Task')).toBe('任务')
    expect(translate('Auto')).toBe('自动')
    expect(translateBundle('Model: Auto')).toBe(`模型：${translate('Auto')}`)
  })

  it('存储库选择器的“Select repository”由 common-ui 全局词条翻译，不收 scoped 副本', () => {
    expect(dashboard.static?.['Select repository']).toBeUndefined()
    expect(dashboard.scoped?.['Select repository']).toBeUndefined()
    expect(commonUi.static?.['Select repository']).toBeDefined()
    expect(translateFull('Select repository')).toBe(commonUi.static?.['Select repository'])
  })

  it('与 copilot 共用的词条不重复收录，由其全局词条翻译', () => {
    const shared: readonly (readonly [string, Readonly<Record<string, string>> | undefined])[] = [
      ['Write code', skills.static],
      ['Make a Pong game', skills.static],
      ['Summarize my latest PR', skills.static],
      ['Summarize my latest issue', skills.static],
      ['Model:', models.static],
      ['Agent sessions', app.static],
      ['Assign to Copilot', code.static]
    ]
    for (const [text, owner] of shared) {
      expect(dashboard.static?.[text]).toBeUndefined()
      expect(dashboard.scoped?.[text]).toBeUndefined()
      expect(owner?.[text]).toBeDefined()
      expect(translateBundle(text)).toBe(owner?.[text])
    }
  })
})

describe('dashboard 忽略规则', () => {
  it.each(dashboard.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('分区列表的条目标题被忽略，空状态与说明照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<ul><li><a class="ItemTitle__EGVYZ_" href="/octo-org/hello-world/issues/1">',
      '<span class="ItemTitleInner__vXJ_4I">Update README</span></a>',
      '<div class="ItemDescription__MNF-Pl">octo-org/hello-world#1 · Opened by octocat · Updated </div></li></ul>',
      '<p class="ItemTitle__EGVYZ_ emptyTitle__J8HcTG"><span class="ItemTitleInner__vXJ_4I">',
      'No issues found, try a different filter.</span></p>'
    ].join('')
    const selector = (dashboard.ignore ?? []).join(', ')
    expect(root.querySelector('a span')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('p span')?.closest(selector)).toBeNull()
    expect(root.querySelector('[class*="ItemDescription__"]')?.closest(selector)).toBeNull()
  })

  it('截断标题的完整标题提示框被忽略，其他提示框照常翻译', () => {
    const root = document.createElement('div')
    root.innerHTML = [
      '<a class="ItemTitle__EGVYZ_" href="/octo-org/hello-world/pull/2" aria-labelledby="t1">',
      '<span class="ItemTitleInner__vXJ_4I">Fix the login bug in the settings page</span></a>',
      '<span class="prc-TooltipV2-Tooltip-cYMVY" id="t1" aria-hidden="true" popover="auto">',
      'Fix the login bug in the settings page</span>',
      '<button aria-labelledby="t2">x</button>',
      '<span class="prc-TooltipV2-Tooltip-cYMVY" id="t2" aria-hidden="true" popover="auto">Hide section</span>'
    ].join('')
    const selector = (dashboard.ignore ?? []).join(', ')
    expect(root.querySelector('#t1')?.closest(selector)).not.toBeNull()
    expect(root.querySelector('#t2')?.closest(selector)).toBeNull()
  })
})
