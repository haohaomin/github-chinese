import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { compileIgnoreIndex } from '../../../src/core/selectors'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import codespacesRepoRules from '../../../src/locales/zh-CN/codespaces/repo-rules'
import common from '../../../src/locales/zh-CN/common'
import repository from '../../../src/locales/zh-CN/repository'
import repositoryTW from '../../../src/locales/zh-TW/repository'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = repository

const matcher = createMatcher([['repository', repository]])

/** 存储库首页的作用域：common → repository → code */
const HOME: readonly PageKey[] = ['common', 'repository', 'code']

function translate(text: string): string | undefined {
  return matcher.translate(text, HOME)
}

interface RegExpCase {
  readonly hits: readonly (readonly [string, string])[]
  readonly misses: readonly string[]
}

const WATCH_TAIL = 'Click to change subscription settings.'

/** 与本词典自有正则一一对应（顺序同 header → overview → banners → empty → sidebar → pages） */
const REGEXP_CASES: readonly RegExpCase[] = [
  // —— 存储库头部 ——
  // 存档横幅（原文两句，译文两句；原文有 repository、repo 两种写法）
  {
    hits: [
      [
        'This repo was archived by the owner on Sep 3, 2024. It is now read-only.',
        '此存储库已由所有者于 2024年9月3日存档。现为只读。'
      ],
      [
        'This repository was archived by the owner on Mar 3, 2023. It is now read-only.',
        '此存储库已由所有者于 2023年3月3日存档。现为只读。'
      ]
    ],
    misses: [
      'This repository was archived by the owner. It is now read-only.',
      'This repos was archived by the owner on Sep 3, 2024. It is now read-only.'
    ]
  },
  // 关注按钮的无障碍名称
  {
    hits: [
      [
        `Watch: Participating in octocat/hello-world. 12 users are watching this repository. ${WATCH_TAIL}`,
        '关注：octocat/hello-world（参与）。12 个用户正在关注此存储库。单击可更改订阅设置。'
      ],
      [
        `Unwatch: All Activity in octocat/Spoon-Knife. 1 user is watching this repository. ${WATCH_TAIL}`,
        '取消关注：octocat/Spoon-Knife（所有活动）。1 个用户正在关注此存储库。单击可更改订阅设置。'
      ],
      [
        `Unwatch: Custom in a.b/c-d. 1,024 users are watching this repository. ${WATCH_TAIL}`,
        '取消关注：a.b/c-d（自定义）。1,024 个用户正在关注此存储库。单击可更改订阅设置。'
      ]
    ],
    misses: ['Watch: Participating. 12 users are watching this repository.']
  },
  {
    hits: [
      [
        `Stop ignoring in octocat/hello-world. 3 users are watching this repository. ${WATCH_TAIL}`,
        '停止忽略 octocat/hello-world。3 个用户正在关注此存储库。单击可更改订阅设置。'
      ]
    ],
    misses: [`Stop ignoring in octocat. 3 users are watching this repository. ${WATCH_TAIL}`]
  },
  // 自定义订阅对话框
  {
    hits: [['Subscribe to events for octocat/hello-world', '订阅 octocat/hello-world 的事件']],
    misses: ['Subscribe to events for']
  },
  {
    hits: [
      ['Discussions are not enabled for this repository', '此存储库未启用讨论'],
      ['Pull requests are not enabled for this repository', '此存储库未启用拉取请求']
    ],
    misses: ['Wikis are not enabled for this repository']
  },
  // 复刻按钮
  {
    hits: [
      ['Cannot fork because octocat/hello-world has forking disabled', 'octocat/hello-world 已禁用复刻'],
      ['Cannot fork because a/b is unavailable due to a DMCA takedown', '无法复刻已被 DMCA 下架的 a/b'],
      ['Cannot fork because a/b is empty', '无法复刻空存储库 a/b'],
      ['Cannot fork because a.b/c-d is locked', '无法复刻已锁定的 a.b/c-d']
    ],
    misses: ['Cannot fork because octocat/hello-world is archived', 'Cannot fork because repository is archived']
  },
  {
    hits: [['You own octocat/hello-world and are not a member of any organizations', '你拥有 octocat/hello-world 且未加入任何组织']],
    misses: ['You own this repository and are not a member of any organizations']
  },
  {
    hits: [['Cannot fork octocat/hello-world', '无法复刻 octocat/hello-world']],
    misses: ['Cannot fork this repository']
  },
  {
    hits: [['Fork your own copy of octocat/hello-world', '创建 octocat/hello-world 的复刻']],
    misses: ['Fork your own copy of this repository']
  },
  // 星标按钮
  {
    hits: [['Star octocat/hello-world', '为 octocat/hello-world 加星标']],
    misses: ['Star octocat']
  },
  {
    hits: [['Unstar octocat/hello-world', '取消 octocat/hello-world 的星标']],
    misses: ['Unstar octocat']
  },
  {
    hits: [
      ["You can't star octocat/hello-world", '无法为 octocat/hello-world 加星标'],
      ['You can’t star a/b', '无法为 a/b 加星标']
    ],
    misses: ["You can't star"]
  },
  {
    hits: [
      [
        "This will remove octocat/hello-world from the 2 lists that it's been added to.",
        '此操作会将 octocat/hello-world 从其所在的 2 个列表中删除。'
      ],
      ['This will remove a/b from the 1 list that it’s been added to.', '此操作会将 a/b 从其所在的 1 个列表中删除。']
    ],
    misses: ["This will remove octocat/hello-world from the lists that it's been added to."]
  },
  // 置顶按钮
  {
    hits: [['Pin octocat/hello-world to your profile', '在个人资料中置顶 octocat/hello-world']],
    misses: ['Pin octocat to your profile']
  },
  {
    hits: [['Unpin octocat/hello-world from your profile', '在个人资料中取消置顶 octocat/hello-world']],
    misses: ['Unpin octocat from your profile']
  },
  {
    hits: [
      ['Failed to pin repository', '置顶存储库失败'],
      ['Failed to unpin repository', '取消置顶存储库失败']
    ],
    misses: ['Failed to star repository']
  },
  // 赞助按钮
  {
    hits: [
      ['Sponsor octocat/hello-world', '赞助 octocat/hello-world'],
      ['Sponsoring a/b', '正在赞助 a/b']
    ],
    misses: ['Sponsor octocat']
  },
  // 置顶按钮的无障碍名称
  {
    hits: [
      ['Pin octo-org/hello-world', '置顶 octo-org/hello-world'],
      ['Unpin a.b/c-d', '取消置顶 a.b/c-d']
    ],
    misses: ['Pin octocat', 'Pin this repository']
  },
  // 存储库类型说明
  {
    hits: [
      ['Public repository · Forked from', '公共存储库 · 复刻自'],
      ['Public repository · Generated from', '公共存储库 · 生成自'],
      ['Public archive repository', '公共存档存储库'],
      ['Public archive repository · Forked from', '公共存档存储库 · 复刻自'],
      ['Private template repository · Mirrored from', '专用模板存储库 · 镜像自'],
      ['Internal mirror repository', '内部镜像存储库']
    ],
    misses: ['Public repository · Forked from octocat/hello-world', 'Secret repository']
  },
  // 自定义订阅对话框：已选标签摘要
  {
    hits: [
      ['bug, docs, help wanted +2 more', 'bug, docs, help wanted 及另外 2 个'],
      ['bug, documentation, enhanceme... +3 more', 'bug, documentation, enhanceme... 及另外 3 个'],
      ['good first issue... +1 more', 'good first issue... 及另外 1 个']
    ],
    misses: ['+2 more', 'bug +more', 'bug, docs and 2 more']
  },
  // 旧版页头（窄屏）：上下文按钮的无障碍名称
  {
    hits: [
      ['Page context: octo-org / hello-world', '页面上下文：octo-org / hello-world'],
      ['Page context: octocat / Spoon-Knife', '页面上下文：octocat / Spoon-Knife']
    ],
    // 只收录「所有者 / 存储库」两级
    misses: ['Page context', 'Page context: octocat', 'Page context: octocat/hello-world']
  },

  // —— 首页代码区 ——
  // 分支选择器按钮
  {
    hits: [
      ['main branch', 'main 分支'],
      ['v1.0.0 tag', 'v1.0.0 标签'],
      ['feature/login-page branch', 'feature/login-page 分支']
    ],
    misses: [
      'Default branch',
      'default branch',
      'This branch',
      'New tag',
      'the branch',
      'main Branch',
      'Annotated tag',
      'from branch',
      'Choose branch',
      // 计数交给通用词典
      '1 tag',
      '1,024 branch'
    ]
  },
  {
    hits: [
      ['3 branches found', '找到 3 个分支'],
      ['1 tag found', '找到 1 个标签']
    ],
    misses: ['branches found']
  },
  // 最新提交行
  {
    hits: [
      ['978 Commits', '978 个提交'],
      ['1 Commit', '1 个提交'],
      ['5,166 Commits', '5,166 个提交'],
      ['2 commits', '2 个提交']
    ],
    misses: ['Commits']
  },
  {
    hits: [['Commit 57b9acc', '提交 57b9acc']],
    misses: ['Commit changes']
  },
  {
    hits: [
      ['commits by monalisa', 'monalisa 的提交'],
      ['commits by octocat and hubot', 'octocat 和 hubot 的提交']
    ],
    misses: ['commits by']
  },
  // 多个作者
  {
    hits: [['Show 3 authors', '显示 3 个作者']],
    misses: ['Show authors']
  },
  {
    hits: [['12 authors', '12 个作者']],
    misses: ['authors', '1 author']
  },
  {
    hits: [
      ["octo-org's org home page", 'octo-org 的组织主页'],
      ['my-org’s org home page', 'my-org 的组织主页']
    ],
    misses: ["org's home page"]
  },
  {
    hits: [
      ['Status checks: failure', '状态检查：失败'],
      ['Status checks: pending', '状态检查：挂起'],
      ['Status checks: error', '状态检查：出错']
    ],
    misses: ['Status checks: unknown']
  },
  {
    hits: [
      ['3 / 5 checks OK', '3/5 个检查正常'],
      ['12/12 checks OK', '12/12 个检查正常']
    ],
    misses: ['checks OK', '3 of 5 checks OK']
  },
  // 转到文件
  {
    hits: [['First 50 files shown.', '仅显示前 50 个文件。']],
    misses: ['First files shown.']
  },
  {
    hits: [
      ['Showing 12 files.', '显示 12 个文件。'],
      ['Showing 1 file.', '显示 1 个文件。']
    ],
    misses: ['Showing files.']
  },
  // 文件列表
  {
    hits: [
      ['.devcontainer, (Directory)', '.devcontainer（目录）'],
      ['README.md, (File)', 'README.md（文件）'],
      ['vendor/grammars, (Submodule)', 'vendor/grammars（子模块）']
    ],
    misses: ['README.md, (Unknown)']
  },
  {
    hits: [
      [
        'Sorry, we had to truncate this directory to 1,000 files. 1,234 entries were omitted from the list.',
        '此目录已截断为 1,000 个文件，另有 1,234 个条目未列出。'
      ],
      [
        'Sorry, we had to truncate this directory to 1,000 files. 1 entry was omitted from the list.',
        '此目录已截断为 1,000 个文件，另有 1 个条目未列出。'
      ]
    ],
    misses: [
      'Sorry, we had to truncate this directory to 1,000 files.',
      // 带「Latest commit info may be omitted.」的版本由 code 词典处理
      'Sorry, we had to truncate this directory to 1,000 files. 1,234 entries were omitted from the list. Latest commit info may be omitted.'
    ]
  },
  {
    hits: [['1 entry was omitted from the list.', '另有 1 个条目未列出。']],
    misses: ['entries were omitted from the list.']
  },
  // 许可证
  {
    hits: [
      ['MIT license', 'MIT 许可证'],
      ['Apache-2.0 license', 'Apache-2.0 许可证'],
      ['BSD-3-Clause license', 'BSD-3-Clause 许可证']
    ],
    // Exclude license 是存储库筛选框的排除建议项，不当作许可证名
    misses: ['Other license', 'No license', 'Add license', 'Choose license', 'other license', 'a license', 'Exclude license']
  },
  {
    hits: [
      ['MIT and 2 other licenses found', '找到 MIT 及另外 2 个许可证'],
      ['Apache-2.0 and 1 other license found', '找到 Apache-2.0 及另外 1 个许可证'],
      ['Unknown and 1 other license found', '找到未知许可证及另外 1 个许可证']
    ],
    misses: ['MIT and 2 other licences found']
  },
  {
    hits: [['MIT, Apache-2.0 licenses found', '找到 MIT、Apache-2.0 许可证']],
    misses: ['licenses found', 'MIT licenses found', 'MIT, Apache-2.0, GPL-3.0 licenses found']
  },
  // Code 下拉：客户端名 GitHub Desktop 译出，第三方应用名原样保留
  {
    hits: [
      ['Launching GitHub Desktop', '正在启动 GitHub 桌面版'],
      ['Launching Xcode', '正在启动 Xcode'],
      ['Launching Visual Studio', '正在启动 Visual Studio']
    ],
    misses: ['Launching Atom']
  },
  {
    hits: [
      ['download GitHub Desktop', '下载 GitHub 桌面版'],
      ['download Xcode', '下载 Xcode']
    ],
    misses: ['download Atom']
  },
  {
    hits: [
      ['must have their Codespaces usage paid for by their enterprise.', '的代码空间使用量必须由其企业支付。'],
      ['must have their Codespaces usage paid for by Acme Corp.', '的代码空间使用量必须由 Acme Corp 支付。']
    ],
    misses: ['must have their Codespaces usage paid for by their enterprise']
  },

  // —— 横幅与复刻信息条 ——
  {
    hits: [
      ['2 commits ahead of', '领先 2 个提交'],
      ['1 commit ahead of', '领先 1 个提交']
    ],
    misses: ['commits ahead of']
  },
  {
    hits: [['1,812 commits behind', '落后 1,812 个提交']],
    misses: ['many commits behind']
  },
  {
    hits: [
      [
        'Update branch to keep this branch up-to-date by syncing 12 commits from the upstream repository.',
        '更新分支以同步上游存储库的 12 个提交并使此分支保持最新。'
      ]
    ],
    misses: ['Update branch to keep this branch up-to-date by syncing commits from the upstream repository.']
  },
  {
    hits: [
      [
        'Discard 2 commits to make this branch match the upstream repository. 2 commits will be removed from this branch.',
        '放弃 2 个提交以使此分支与上游存储库一致。2 个提交将从此分支中删除。'
      ]
    ],
    misses: ['Discard commits to make this branch match the upstream repository.']
  },
  {
    hits: [
      ['Discard 3 commits', '放弃 3 个提交'],
      ['Discard 1 commit', '放弃 1 个提交']
    ],
    misses: ['Discard changes']
  },
  {
    hits: [
      ["Your main branch isn't protected", '你的 main 分支未受保护'],
      ['Your develop branch isn’t protected', '你的 develop 分支未受保护']
    ],
    misses: ["Your branch isn't protected"]
  },
  {
    hits: [
      ['Deploy your Vite app to GitHub Pages', '将你的 Vite 应用部署到 GitHub 页面'],
      ['Deploy your project to GitHub Pages', '将你的项目部署到 GitHub 页面'],
      // 未收录的框架名原样保留，与两侧中文之间补空格
      ['Deploy your Hugo site to GitHub Pages', '将你的 Hugo site 部署到 GitHub 页面'],
      // 原型链上的键不当作框架名
      ['Deploy your constructor to GitHub Pages', '将你的 constructor 部署到 GitHub 页面']
    ],
    misses: ['Deploy to GitHub Pages']
  },
  {
    hits: [['Deploy your Next.js app to GitHub Pages in a matter of minutes', '几分钟内即可将你的 Next.js 应用部署到 GitHub 页面']],
    misses: ['Deploy to GitHub Pages in a matter of minutes']
  },
  {
    hits: [
      ['had recent pushes 5 minutes ago', '5分钟前有新推送'],
      ['had recent pushes yesterday', '昨天有新推送'],
      ['had recent pushes on Mar 3', '3月3日有新推送'],
      ['had recent pushes less than a minute ago', '刚刚有新推送'],
      // 超过一个月的日期由浏览器按本地语言格式化，中文与数字之间补空格
      ['had recent pushes on 10月26日', '10月26日有新推送'],
      ['had recent pushes on 2023年10月26日', '2023年10月26日有新推送']
    ],
    misses: ['had recent pushes']
  },
  {
    hits: [
      ['23 hours remaining', '剩余 23小时'],
      ['1 day remaining', '剩余 1天'],
      ['about 1 month remaining', '剩余约 1个月'],
      ['almost 2 weeks remaining', '剩余将近 2周'],
      ['less than a minute remaining', '剩余不到 1分钟'],
      ['an hour remaining', '剩余 1小时']
    ],
    misses: ['a few hours remaining', '23 hours']
  },
  {
    hits: [
      [
        'to the main branch of this repository will be unable to interact with the repository.',
        '此存储库 main 分支的用户将无法与此存储库交互。'
      ]
    ],
    misses: ['to the branch of this repository will be unable to interact with the repository.']
  },
  {
    hits: [['3 users you’ve blocked have previously contributed to this repository.', '你阻止的 3 个用户曾为此存储库做过贡献。']],
    misses: ['users you’ve blocked have previously contributed to this repository.']
  },
  {
    hits: [['This repository is missing 2 required custom property values', '此存储库缺少 2 个必填的自定义属性值']],
    misses: ['This repository is missing required custom property values']
  },
  // 不可变 Action 迁移对话框
  {
    hits: [
      ['3 out of 10 tags', '10 个标签中的 3 个'],
      ['1 out of 1 tag', '1 个标签中的 1 个']
    ],
    misses: ['out of 10 tags', '3 out of 10 releases']
  },
  {
    hits: [
      ['5 versions', '5 个版本'],
      ['1 version', '1 个版本']
    ],
    misses: ['versions', 'v1 version']
  },
  // 同步复刻后的提示
  {
    hits: [
      ['Successfully fetched and fast-forwarded from upstream octocat:main.', '已成功从上游 octocat:main 获取并快进。'],
      ['Successfully fetched and merged from upstream octocat:main', '已成功从上游 octocat:main 获取并合并'],
      [
        'Successfully discarded changes and synchronized branch to match upstream octocat:master.',
        '已成功放弃更改并将分支同步为与上游 octocat:master 一致。'
      ],
      // 原文无标点时译文也不带标点
      [
        'Successfully discarded changes and synchronized branch to match upstream octocat:main',
        '已成功放弃更改并将分支同步为与上游 octocat:main 一致'
      ]
    ],
    misses: ['Successfully fetched from upstream octocat:main.', 'Successfully fetched and merged from upstream']
  },

  // —— 空存储库 ——
  {
    hits: [
      [
        'This page will automatically refresh in 10 seconds to check if the repository is ready.',
        '此页面将在 10秒后自动刷新以检查存储库是否就绪。'
      ]
    ],
    misses: ['This page will automatically refresh to check if the repository is ready.']
  },
  // 功能名：产品名译出（Codespaces → 代码空间），Copilot 等品牌词原样保留，英文名与两侧中文之间补空格
  {
    hits: [
      ['Request for Copilot submitted successfully', '已提交 Copilot 的申请'],
      ['Request for Codespaces submitted successfully', '已提交代码空间的申请'],
      // 原型链上的键不当作功能名
      ['Request for constructor submitted successfully', '已提交 constructor 的申请']
    ],
    misses: ['Request submitted successfully']
  },
  {
    hits: [
      ['Request for Codespaces failed, please try again', '代码空间的申请提交失败，请重试'],
      ['Request for GitHub Codespaces failed, please try again', 'GitHub 代码空间的申请提交失败，请重试'],
      ['Request for GitHub Copilot failed, please try again', 'GitHub Copilot 的申请提交失败，请重试']
    ],
    misses: ['Request failed, please try again']
  },
  {
    hits: [
      ['Request for Copilot removed', '已撤回 Copilot 的申请'],
      ['Request for Codespaces removed', '已撤回代码空间的申请']
    ],
    misses: ['Request removed']
  },
  {
    hits: [
      ['Removing request for Copilot failed, please try again', '撤回 Copilot 的申请失败，请重试'],
      ['Removing request for Codespaces failed, please try again', '撤回代码空间的申请失败，请重试']
    ],
    misses: ['Removing request failed, please try again']
  },

  // —— 侧栏 ——
  {
    hits: [
      ['350 characters remaining', '还剩 350 个字符'],
      ['1 character remaining', '还剩 1 个字符']
    ],
    misses: ['characters remaining']
  },
  {
    hits: [
      ['+ 62 contributors', '+ 62 个贡献者'],
      ['+ 1 release', '+ 1 个发行版'],
      ['+ 3 deployments', '+ 3 个部署'],
      ['+ 2 packages', '+ 2 个软件包'],
      ['+ 4 environments', '+ 4 个环境']
    ],
    misses: ['+ 62 stargazers']
  },
  {
    hits: [['+ 5 more', '还有 5 个']],
    misses: ['+ more']
  },
  {
    hits: [
      ['Other: 1.2%', '其他：1.2%'],
      ['Other: 3%', '其他：3%']
    ],
    misses: ['Other: n/a']
  },
  {
    hits: [['APA citation copied to clipboard', 'APA 引用已复制到剪贴板']],
    misses: ['MLA citation copied to clipboard']
  },
  {
    hits: [
      ['Copy APA citation', '复制 APA 引用'],
      ['Copy BibTeX citation', '复制 BibTeX 引用']
    ],
    misses: ['Copy MLA citation', 'Copy citation']
  },
  {
    hits: [
      [
        'You can display README.md from this repository on your public GitHub profile.',
        '你可以在 GitHub 公开个人资料中显示此存储库的 README.md。'
      ]
    ],
    misses: ['You can display from this repository on your public GitHub profile.']
  },
  {
    hits: [
      [
        'will appear on the organization’s member profile, visible only to organization members.',
        '将显示在组织的成员个人资料中，仅组织成员可见。'
      ],
      // 创建 <README.md> 后它将显示在…（and it 原文无逗号，译文不加）
      [
        "and it will appear on the organization's member profile, visible only to organization members.",
        '后它将显示在组织的成员个人资料中，仅组织成员可见。'
      ],
      [
        "will appear on GitHub's member profile, visible only to organization members.",
        '将显示在 GitHub 的成员个人资料中，仅组织成员可见。'
      ]
    ],
    misses: ['will appear on your member profile.']
  },

  // —— 存储库级整页 ——
  // 贡献入口页的标签页标题
  {
    hits: [
      ['Contribute to octo-org/hello-world', '参与贡献 octo-org/hello-world'],
      ['Contribute to octocat/Spoon-Knife', '参与贡献 octocat/Spoon-Knife']
    ],
    misses: ['Contribute to this repository', 'Contribute to octocat']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []
const MERGED_RULES = codespacesRepoRules.regexp
/** 本词典自有的正则（codespaces 的存储库规则合并在末尾） */
const OWN_RULES = RULES.slice(0, RULES.length - MERGED_RULES.length)

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('repository 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与自有正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(OWN_RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条自有正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = OWN_RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('合并 codespaces 的 Code 下拉规则', () => {
    expect(RULES.slice(OWN_RULES.length)).toEqual(MERGED_RULES)
    expect(translate('2-core')).toBe('2 核')
    expect(translate('3 commits ahead')).toBe('领先 3 个提交')
    // 译文以 codespaces 词典为准（该词典由 codespaces-copilot 组维护）：存储库页与它输出相同
    const codespaces = createMatcher([['codespaces', codespacesRepoRules]])
    for (const input of ['2-core', '3 commits ahead', 'Create codespace on develop']) {
      expect(codespaces.translate(input, ['codespaces']), input).toBeDefined()
      expect(translate(input), input).toBe(codespaces.translate(input, ['codespaces']))
    }
  })

  it('被元素隔开的片段单独命中', () => {
    // This branch is <2 commits ahead of> and <1812 commits behind> <base>.
    expect(translate('This branch is')).toBe('此分支')
    expect(translate('This branch is up to date with')).toBe('此分支已同步至')
    // 计数与单位分属两个元素：<strong>2.4k</strong> stars
    expect(translate('stars')).toBe('个星标')
    expect(translate('watching')).toBe('个关注者')
    expect(translate('forks')).toBe('个复刻')
    // 新建分支：Create branch <名称> from <来源>
    expect(translate('Create branch')).toBe('创建分支')
    expect(translate('from')).toBe('来自')
    // 如果没有反应，<download GitHub Desktop> 后重试。（整句由 inline 处理，此为未拼成整句时的片段）
    expect(translate('If nothing happens,')).toBe('如果没有反应，')
    expect(translate('and try again.')).toBe('后重试。')
    // 快速设置：README, LICENSE, and .gitignore
    expect(translate(', and')).toBe('，以及')
    // and 由 common 处理
    expect(translate('and')).toBeUndefined()
  })
})

describe('repository 静态词条', () => {
  it.each([
    ['Public template', '公共模板'],
    ['Navigate back to', '返回到'],
    ['Private mirror', '专用镜像'],
    ['Internal mirror', '内部镜像'],
    ['forked from', '复刻自'],
    ['This repository has been archived by the owner. It is now read-only.', '此存储库已由所有者存档。现为只读。'],
    ['You must be signed in to change notification settings', '登录后才能更改通知设置'],
    ['You must be signed in to fork a repository', '登录后才能复刻存储库'],
    ['Participating and @mentions', '参与和 @提及'],
    ['All Activity', '所有活动'],
    ['Star this repository', '为此存储库加星标'],
    ['Unstar this repository?', '取消此存储库的星标？'],
    ['Edit Pins', '编辑置顶项'],
    ['Open in a codespace', '在代码空间中打开'],
    // 分支选择器的标记搜索框（整句，全站生效）
    ['Search for a tag', '搜索标签'],
    ['Repository files navigation', '存储库文件导航'],
    ['Which remote URL should I use?', '应使用哪个远程 URL？'],
    ['Copy URL to clipboard', '复制 URL 到剪贴板'],
    ['Download ZIP', '下载 ZIP'],
    ['Ask Copilot about this repository', '向 Copilot 询问此存储库'],
    ['Protect this branch', '保护此分支'],
    ['Compare & pull request', '比较和拉取请求'],
    ['This repository is empty.', '此存储库为空。'],
    ["You don't have write access to this repository yet", '你还没有此存储库的写入访问权限'],
    ['You don’t have write access to this repository yet', '你还没有此存储库的写入访问权限'],
    ['Quick setup', '快速设置'],
    ['— if you’ve done this kind of thing before', '— 如果你以前做过类似操作'],
    ['No description, website, or topics provided.', '未提供描述、网站或主题。'],
    ['Report repository', '举报存储库'],
    ['Sponsor this project', '赞助此项目'],
    ['Cite this repository', '引用此存储库'],
    ['Readme', '自述文件'],
    ['Cannot fork because repository is offline', '无法复刻离线存储库'],
    ['Cannot fork because repository is empty.', '无法复刻空存储库。'],
    // 原文无逗号的整句，译文改语序不加逗号；原文两句的译文也分两句
    [
      'Cannot fork because you own this repository and are not a member of any organizations.',
      '因你拥有此存储库且未加入任何组织而无法复刻。'
    ],
    ['Error. Please try again.', '出错了。请重试。'],
    ['Unable to pin repository. Please try again.', '无法置顶存储库。请重试。'],
    ['Enabling this makes the list visible only to you.', '启用后列表仅你自己可见。'],
    ['which are unsupported by Codespaces at this time.', '但代码空间目前不支持。'],
    ["and it will appear on the organization's profile.", '后它将显示在组织的个人资料中。'],
    [
      'You can see this message because you have been granted access to Dependabot alerts for this repository.',
      '你能看到此消息是因为你有权访问此存储库的 Dependabot 警报。'
    ],
    [
      'Make your first contribution to this repository by tackling one of the issues listed below.',
      '通过解决下方列出的任一议题完成你对此存储库的首次贡献。'
    ],
    ['No existing forks', '暂无复刻'],
    ['No pin slots remaining in your profile', '个人资料置顶项已满'],
    ['has invited you to collaborate on this repository', '邀请你成为此存储库的协作者'],
    ['The default branch on the parent repository has been renamed!', '父存储库的默认分支已重命名！'],
    // 句末是 <分支设置> 链接：原文无逗号、句号，译文不加（整句由 inline 处理，此为片段）
    ["You can rename this fork's default branch to match in", '如需重命名此复刻的默认分支以保持一致可前往'],
    ['You can rename this fork’s default branch to match in', '如需重命名此复刻的默认分支以保持一致可前往'],
    // 原文的逗号都在并列项之间（译作顿号），译文不另加逗号
    [
      'Add a README file and start coding in a secure, configurable, and dedicated development environment.',
      '添加自述文件并在安全、可配置的专用开发环境中开始编码。'
    ],
    [
      'This repository contains malicious content that may cause technical harms. We have decided to preserve this content for security research purposes. Please exercise CAUTION when clicking links, downloading releases, or otherwise interacting with this repository.',
      '此存储库包含可能造成技术危害的恶意内容。我们决定保留这些内容以供安全研究。请在单击链接、下载发行版或以其他方式与此存储库交互时务必谨慎。'
    ],
    ['Code 55% faster with AI pair programming.', '借助 AI 结对编程将编码速度提升 55%。'],
    ['Use the URL for this page when adding GitHub as a remote.', '添加 GitHub 远程存储库时使用此页面的 URL。'],
    ['Suggested:', '推荐：'],
    ["This isn't relevant", '不相关'],
    ['I just don’t like it', '不喜欢'],
    ["Couldn't load subscription status.", '无法加载订阅状态。'],
    [
      "This repository doesn't have a README yet. Ask Copilot to learn how this project works.",
      '此存储库还没有自述文件。向 Copilot 提问以了解此项目的工作原理。'
    ],
    ['Only the first 100 invalid tags are listed.', '仅列出前 100 个无效标签。'],
    ['Make your GitHub Action Immutable', '将你的 GitHub 操作设为不可变'],
    ['View on Marketplace', '在市场中查看'],
    // 产品名、客户端名译中文：Codespaces → 代码空间，GitHub Desktop → GitHub 桌面版，GitHub Pages → GitHub 页面，
    // GitHub Actions → GitHub 操作，GitHub Sponsors → GitHub 赞助
    ['Open with GitHub Desktop', '使用 GitHub 桌面版打开'],
    ['Set up in GitHub Desktop', '在 GitHub 桌面版中设置'],
    ['Set up in Desktop', '在桌面版中设置'],
    ['Start coding with Codespaces', '使用代码空间开始编码'],
    ['Codespaces data failed to load.', '代码空间数据加载失败。'],
    ['Loading codespaces', '正在加载代码空间'],
    ['Codespace access limited', '代码空间访问受限'],
    ['to use Codespaces.', '后使用代码空间。'],
    [
      'Your enterprise has disabled Codespaces at this time. Please contact your enterprise administrator for more information.',
      '你的企业目前已禁用代码空间。请联系企业管理员了解详情。'
    ],
    [
      'Your organization has disabled Codespaces on this repository. Please contact your organization administrator for more information.',
      '你的组织已在此存储库禁用代码空间。请联系组织管理员了解详情。'
    ],
    ['Use your GitHub Pages website', '使用你的 GitHub 页面网站'],
    ['Deploy to Pages', '部署到页面'],
    [
      'Upgrade to a newer, more secure, and more reliable way of releasing and referencing GitHub Actions by recreating your existing tags as immutable package versions.',
      '通过将现有标签重新创建为不可变软件包版本来升级到更新、更安全、更可靠的 GitHub 操作发布与引用方式。'
    ],
    ['Learn more about GitHub Sponsors', '了解 GitHub 赞助'],
    // 交互限制（与组织、个人设置的同类句子一致）
    [
      'Users that have recently created their account will be unable to interact with the repository.',
      '最近创建帐户的用户将无法与此存储库交互。'
    ],
    ['See Dependabot alerts', '查看 Dependabot 警报'],
    ["A user you've blocked has previously contributed to this repository.", '你阻止的一个用户曾为此存储库做过贡献。'],
    ['Manage blocked users', '管理已阻止的用户'],
    ['Invite a successor', '邀请继任者'],
    ['This repository has been disabled.', '此存储库已被禁用。'],
    ['Repository unavailable due to DMCA takedown.', '存储库因 DMCA 下架而不可用。'],
    ['Contribute to', '参与贡献'],
    ["This repo doesn't have any good first issues, yet", '此存储库暂时还没有适合新手的议题'],
    ['Additional resources', '其他资源'],
    ['Discover other projects on GitHub', '发现 GitHub 上的其他项目']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Quick setup \n', HOME)).toBe('  快速设置 \n')
  })
})

describe('repository 页面词条', () => {
  it.each([
    ['Participating', '参与'],
    ['Branches', '分支'],
    ['Tags', '标签'],
    ['Tag', '标签'],
    ['default', '默认'],
    ['Go to file', '转到文件'],
    ['Add file', '添加文件'],
    ['Latest commit', '最新提交'],
    ['pending', '挂起'],
    ['error', '出错'],
    ['Outline', '大纲'],
    // README 标签页（快速设置里的 README 链接同译）
    ['README', '自述文件'],
    ['Contribute', '贡献'],
    ['Sync fork', '同步复刻'],
    ['Watchers', '关注者'],
    ['Latest', '最新'],
    ['Used by', '使用者'],
    ['inactive', '不活跃'],
    ['queued', '已排队'],
    ['Other', '其他'],
    ['Ignoring', '已忽略'],
    ['collaborators', '协作者'],
    ['Find a tag...', '查找标签...'],
    ['Find a tag…', '查找标签…'],
    ['Discarding changes...', '正在放弃更改...'],
    ['Switch branches/tags', '切换分支/标签'],
    ['Go to Tags page', '转到标签页面'],
    // 分支选择器的创建标记对话框
    ['Create new tag', '创建新标签'],
    ['Tag name', '标签名称'],
    ['Open Contribute dropdown', '打开贡献下拉菜单'],
    // Codespaces 标签页错误提示中的链接（句子其余部分由 inline 处理）
    ['sign in', '登录'],
    ['contact support', '联系支持'],
    // 原文无逗号，译文用“以”连接
    ['Open a pull request to contribute your changes upstream.', '创建拉取请求以将你的更改贡献到上游。'],
    [
      'Update branch to merge the latest changes from the upstream repository into this branch.',
      '更新分支以将上游存储库的最新更改合并到此分支。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('在其他存储库页同样生效，不在存储库以外的页面生效', () => {
    expect(matcher.translate('Sync fork', ['common', 'repository', 'issues'])).toBe('同步复刻')
    expect(matcher.translate('Sync fork', ['common', 'dashboard'])).toBeUndefined()
    expect(matcher.translate('main branch', ['common', 'dashboard'])).toBeUndefined()
  })

  it('不重复收录通用词典已有的词条', () => {
    // 按钮文字与通用词由 common-ui 收录（译法相同），这里不再收录
    const shared = ['Watch', 'Unwatch', 'Fork', 'Star', 'Starred', 'Unstar', 'Pin', 'Unpin', 'Lists', 'Internal']
    const more = ['History', 'Name', 'Description', 'Create', 'More', 'Activity', 'Configure', 'Updating...', 'ProTip!']
    for (const key of [...shared, ...more]) {
      expect(dict.static?.[key], key).toBeUndefined()
      expect(dict.scoped?.[key], key).toBeUndefined()
    }
  })
})

describe('repository 繁体词条（zh-TW）', () => {
  const twDict: PageDictionary = repositoryTW
  const twMatcher = createMatcher([['repository', repositoryTW]])

  it.each([
    ['Search for a tag', '搜尋標記'],
    ['Additional resources', '其他資源'],
    ['Discover other projects on GitHub', '探索 GitHub 上的其他專案']
  ])('静态：%s → %s', (input, expected) => {
    expect(twDict.static?.[input]).toBe(expected)
    expect(twMatcher.translate(input, HOME)).toBe(expected)
  })

  it('许可证名正则：MIT license 译出，Exclude license 不当作许可证名', () => {
    expect(twMatcher.translate('MIT license', HOME)).toBe('MIT 授權條款')
    expect(twMatcher.translate('Exclude license', HOME)).toBeUndefined()
  })

  it('存档横幅：原文有 repository、repo 两种写法', () => {
    expect(twMatcher.translate('This repo was archived by the owner on Sep 3, 2024. It is now read-only.', HOME)).toBe(
      '此儲存庫已由擁有者於 2024年9月3日封存。目前為唯讀。'
    )
    expect(twMatcher.translate('This repository was archived by the owner on Mar 3, 2023. It is now read-only.', HOME)).toBe(
      '此儲存庫已由擁有者於 2023年3月3日封存。目前為唯讀。'
    )
  })
})

describe('repository 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('都能建索引，不退化为逐元素匹配', () => {
    const index = compileIgnoreIndex(dict.ignore ?? [], document.createElement('div'))
    expect(index.invalid).toEqual([])
    expect(index.universal).toEqual([])
  })

  describe('页头面包屑', () => {
    const selector = (): string => (dict.ignore ?? []).join(', ')
    /** 文字等于 text 的最内层元素（同一名称可能出现多次） */
    const owners = (text: string): Element[] =>
      [...document.querySelectorAll('*')].filter(
        node => node.textContent?.trim() === text && ![...node.children].some(child => child.textContent?.trim() === text)
      )
    const ignored = (text: string): boolean[] => owners(text).map(node => node.closest(selector()) !== null)

    it('新版页头：所有者名、存储库名保持原文，切换存储库按钮、提示与导航标题不被忽略', () => {
      // 登录后存储库名换成存储库选择器：切换按钮与面包屑项同带 contextCrumb__ 类
      document.body.innerHTML = `
        <header aria-label="Global navigation menu" class="GlobalNav styles-module__appHeader__YzYWk">
          <nav aria-label="Breadcrumbs" data-component="Breadcrumbs"><ol>
            <li><a class="contextCrumb__Q8nET8 prc-Breadcrumbs-Item-jcraJ" data-component="Breadcrumbs.Item" href="/octo-org"><span>octo-org</span></a></li>
            <li><a class="contextCrumb__Q8nET8 contextCrumbLast__l2P28s repoPickerCrumb__56N_WW" data-component="Breadcrumbs.Item" href="/octo-org/hello-world">hello-world</a>
              <button id="switch" class="contextCrumb__Q8nET8 repoPickerDropdownButton__o-JgKh" data-component="IconButton" type="button" aria-labelledby="tip"></button>
              <span data-component="Tooltip" aria-hidden="true"><span id="tip">Switch repository</span></span>
            </li>
          </ol></nav>
          <h2 class="sr-only">Repository navigation</h2>
        </header>`

      expect(ignored('octo-org')).toEqual([true])
      expect(ignored('hello-world')).toEqual([true])
      expect(ignored('Switch repository')).toEqual([false])
      expect(ignored('Repository navigation')).toEqual([false])
      expect(document.querySelector('#switch')?.closest(selector())).toBeNull()
      expect(document.querySelector('nav[aria-label="Breadcrumbs"]')?.closest(selector())).toBeNull()
    })

    it('旧版页头：完整导航、窄屏折叠按钮与返回菜单中的名称保持原文，菜单标题不被忽略', () => {
      document.body.innerHTML = `
        <context-region-controller class="AppHeader-context">
          <div class="AppHeader-context-compact">
            <button type="button" class="AppHeader-context-compact-trigger"><span class="Button-label">
              <span class="AppHeader-context-compact-lead"><span class="AppHeader-context-compact-parentItem">octo-org</span><span>&nbsp;/</span></span>
              <strong class="AppHeader-context-compact-mainItem"><span class="Truncate-text">hello-world</span></strong>
            </span></button>
            <h1 class="Overlay-title">Navigate back to</h1>
            <a href="/octo-org"><span class="AppHeader-context-item-label Truncate-text">octo-org</span></a>
          </div>
          <div class="AppHeader-context-full"><nav aria-label="Page context">
            <a class="AppHeader-context-item" href="/octo-org"><span class="AppHeader-context-item-label">octo-org</span></a>
            <a class="AppHeader-context-item" href="/octo-org/hello-world"><span class="AppHeader-context-item-label">hello-world</span></a>
          </nav></div>
        </context-region-controller>`

      expect(ignored('octo-org')).toEqual([true, true, true])
      expect(ignored('hello-world')).toEqual([true, true])
      expect(ignored('Navigate back to')).toEqual([false])
    })

    it('旧版页头（自适应）：截断提示与溢出菜单中的名称保持原文，溢出按钮提示不被忽略', () => {
      document.body.innerHTML = `
        <context-region-controller class="AppHeader-context responsive-context-region" data-max-items="5">
          <div class="AppHeader-context-full"><nav aria-label="GitHub Breadcrumb" role="navigation">
            <context-region role="list">
              <context-region-crumb data-crumb-id="contextregion-usercrumb-octo-org" data-targets="context-region.crumbs" role="listitem" hidden>
                <a class="AppHeader-context-item" id="contextregion-usercrumb-octo-org-link" href="/octo-org"><span class="AppHeader-context-item-label">octo-org</span></a>
                <tool-tip data-target="context-region-crumb.tooltip" for="contextregion-usercrumb-octo-org-link" class="sr-only" data-type="label" hidden>octo-org</tool-tip>
                <context-region-divider><span class="AppHeader-context-item-separator"><span class="sr-only">/</span></span></context-region-divider>
              </context-region-crumb>
              <li data-target="context-region-controller.overflowMenuContainer context-region.overflowMenuContainer" role="listitem">
                <button id="overflow" class="Button Button--iconOnly" type="button" aria-labelledby="overflow-tip"></button>
                <tool-tip id="overflow-tip" for="overflow" class="sr-only position-absolute" data-type="label">Show more breadcrumb items</tool-tip>
                <ul class="ActionListWrap" role="menu">
                  <li class="ActionListItem" data-crumb-id="contextregion-usercrumb-octo-org" data-targets="context-region.overflowCrumbs action-list.items" role="none">
                    <a class="ActionListContent" href="/octo-org" role="menuitem"><span class="ActionListItem-label">octo-org</span></a>
                  </li>
                  <li class="ActionListItem" data-crumb-id="contextregion-repositorycrumb-hello-world" data-targets="context-region.overflowCrumbs action-list.items" role="none" hidden>
                    <a class="ActionListContent" href="/octo-org/hello-world" role="menuitem"><span class="ActionListItem-label">hello-world</span></a>
                  </li>
                </ul>
              </li>
              <context-region-crumb data-crumb-id="contextregion-repositorycrumb-hello-world" data-targets="context-region.crumbs" role="listitem">
                <a class="AppHeader-context-item" id="contextregion-repositorycrumb-hello-world-link" href="/octo-org/hello-world"><span class="AppHeader-context-item-label">hello-world</span></a>
                <tool-tip data-target="context-region-crumb.tooltip" for="contextregion-repositorycrumb-hello-world-link" class="sr-only" data-type="label" hidden>hello-world</tool-tip>
              </context-region-crumb>
            </context-region>
          </nav></div>
        </context-region-controller>`

      expect(ignored('octo-org')).toEqual([true, true, true])
      expect(ignored('hello-world')).toEqual([true, true, true])
      expect(ignored('Show more breadcrumb items')).toEqual([false])
      expect(ignored('/')).toEqual([false])
      expect(document.querySelector('#overflow')?.closest(selector())).toBeNull()
    })
  })

  it('分支名、标记名与搜索结果路径被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <button data-testid="anchor-button" aria-label="main branch">
        <div class="ref-selector-button-text-container RefSelectorBtnTextContainer__U9K7hH">
          <span class="RefSelectorText__DKi677">Release</span>
        </div>
      </button>
      <ul role="menu">
        <li><div class="HighlightedText__WKM1D-">Latest</div><span>default</span></li>
        <li><span>Create branch</span><span class="RefActionText__buYlea">History</span><span>from</span><span class="RefActionText__buYlea">main</span></li>
      </ul>
      <div class="HighlightMatch__sV84Fj">src/Name</div>
      <h2>Switch branches/tags</h2>
      <button id="new-format" aria-label="Settings branch">
        <div class="ref-selector-button-text-container RefSelectorAnchoredOverlay-module_zwGJlW_RefSelectorBtnTextContainer">
          <span class="RefSelectorAnchoredOverlay-module_zwGJlW_RefSelectorText">Settings</span>
        </div>
      </button>
      <ul role="menu">
        <li><div class="HighlightedText-module_-IVSdq_Wrap"><div class="HighlightedText-module_-IVSdq_HighlightedText">Insights</div></div></li>
        <li><span class="RefSelectorV1-module_dy9Ica_RefActionText">Wiki</span></li>
        <li><a class="RefSelectorV1-module_dy9Ica_ViewAllRefsActionLink" href="/octo-org/hello-world/branches"><span class="RefSelectorV1-module_dy9Ica_ViewAllRefsActionText">View all branches</span></a></li>
      </ul>
      <div class="FileResultsList-module_ysudIa_HighlightMatch">docs/Guide</div>
      <button id="ref-picker-releases-target">
        <span class="RefSelectorText__DKi677"><span class="fgColor-muted">Target:</span><span>Code</span></span>
      </button>
      <button id="ref-picker-releases-tag">
        <span class="RefSelectorAnchoredOverlay-module_zwGJlW_RefSelectorText"><span class="fgColor-muted">Tag:</span><span>Projects</span></span>
      </button>`

    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Release')).toBe(true)
    expect(ignored('Latest')).toBe(true)
    expect(ignored('History')).toBe(true)
    expect(ignored('main')).toBe(true)
    expect(ignored('src/Name')).toBe(true)
    expect(ignored('default')).toBe(false)
    expect(ignored('Create branch')).toBe(false)
    expect(ignored('from')).toBe(false)
    expect(ignored('Switch branches/tags')).toBe(false)
    expect(document.querySelector('[data-testid="anchor-button"]')?.closest(selector)).toBeNull()
    // 类名的另一种写法（模块-module_哈希_名称）
    expect(ignored('Settings')).toBe(true)
    expect(ignored('Insights')).toBe(true)
    expect(ignored('Wiki')).toBe(true)
    expect(ignored('docs/Guide')).toBe(true)
    expect(ignored('View all branches')).toBe(false)
    expect(document.getElementById('new-format')?.closest(selector)).toBeNull()
    // 发行版表单：字段名照常翻译，其后的值忽略
    expect(ignored('Target:')).toBe(false)
    expect(ignored('Code')).toBe(true)
    expect(ignored('Tag:')).toBe(false)
    expect(ignored('Projects')).toBe(true)
  })

  it('侧栏软件包名被忽略，分节文字不被忽略', () => {
    document.body.innerHTML = `
      <div class="sidebarSection__oqw6Y8">
        <h2 class="sectionHeading__4n11uG">Packages</h2>
        <ul class="packageList__ZiGkIv">
          <li class="item__hSosLv packageItem__wID7Sd">
            <span class="icon__petVYe"><svg aria-hidden="true"></svg></span>
            <a class="label__YOY2FN" href="/orgs/acme/packages/container/package/Release">Release</a>
          </li>
        </ul>
        <div class="emptyState__1IMWLz"><span>No packages published</span></div>
        <a class="moreLink__jeEcgs" href="/orgs/acme/packages">+ 2 packages</a>
      </div>`

    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Release')).toBe(true)
    expect(ignored('Packages')).toBe(false)
    expect(ignored('No packages published')).toBe(false)
    expect(ignored('+ 2 packages')).toBe(false)
  })

  it('侧栏部署分节的环境名被忽略，状态文字不被忽略', () => {
    document.body.innerHTML = `
      <div class="sidebarSection__oqw6Y8">
        <h2 class="sectionHeading__4n11uG">Deployments</h2>
        <ul class="envList__77gXMn">
          <li class="item__hSosLv envItem__zhjtq5">
            <span class="icon__petVYe"><svg aria-hidden="true"></svg></span>
            <a class="label__YOY2FN" href="/acme/app/deployments/Preview" target="_blank">Preview</a>
            <span class="description__pm0c7B"><span>inactive</span></span>
          </li>
        </ul>
        <a class="moreLink__jeEcgs" href="/acme/app/deployments">+ 3 deployments</a>
      </div>`

    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Preview')).toBe(true)
    expect(ignored('Deployments')).toBe(false)
    expect(ignored('inactive')).toBe(false)
    expect(ignored('+ 3 deployments')).toBe(false)
  })

  describe('侧栏语言分节', () => {
    const LANGUAGES = `
      <ul class="languageList__0mbjU5">
        <li class="languageListItem__Y9dtVH">
          <span class="languageItem__H1dOD6">
            <span class="languageDot__gECl8O"></span>
            <span class="languageName__OweiHW" itemprop="keywords">Reason</span>
            <span>12.5%</span>
          </span>
        </li>
      </ul>`
    const isFork = (fork: boolean): void => {
      document.head.innerHTML = `<meta name="octolytics-dimension-repository_is_fork" content="${fork}">`
    }
    const selector = (): string => (dict.ignore ?? []).join(', ')
    const name = (): Element => document.querySelector('[itemprop="keywords"]')!

    afterEach(() => {
      document.head.innerHTML = ''
    })

    it('复刻存储库：不带链接的语言名被忽略', () => {
      isFork(true)
      document.body.innerHTML = LANGUAGES
      expect(name().closest(selector())).not.toBeNull()
    })

    it('非复刻存储库：不带链接的条目（Other）不被忽略', () => {
      isFork(false)
      document.body.innerHTML = LANGUAGES.replace('Reason', 'Other')
      expect(name().closest(selector())).toBeNull()
    })
  })

  it('最近推送横幅的分支名被忽略，按钮文字不被忽略', () => {
    document.body.innerHTML = `
      <div class="Flash__abc12 prc-Banner-Banner-xyz">
        <div class="Box__def34">
          <svg aria-hidden="true"></svg>
          <a class="text-bold" href="/acme/app/tree/Release">Release</a>
          <span>had recent pushes 5 minutes ago</span>
        </div>
        <a class="Button" href="/acme/app/compare/Release?expand=1">Compare &amp; pull request</a>
      </div>`

    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Release')).toBe(true)
    expect(ignored('had recent pushes 5 minutes ago')).toBe(false)
    expect(ignored('Compare & pull request')).toBe(false)
  })
})

describe('repository 旧版页头（窄屏）上下文按钮与对话框', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('无障碍名称与对话框标题译出，按钮和对话框中的所有者名、存储库名保持原文', () => {
    // 结构同旧版页头：context-region-controller > .AppHeader-context-compact > button + 对话框（名称在 span 中）
    document.body.innerHTML = `
      <context-region-controller class="AppHeader-context" data-max-items="5">
        <div class="AppHeader-context-compact" data-target="context-region-controller.compactContainer">
          <button aria-expanded="false" aria-haspopup="dialog" aria-label="Page context: octo-org / Latest" id="trigger" type="button" class="AppHeader-context-compact-trigger Truncate Button--secondary Button--medium Button box-shadow-none"><span class="Button-content">
            <span class="Button-label"><span class="AppHeader-context-compact-lead">
              <span class="AppHeader-context-compact-parentItem">octo-org</span>
              <span class="no-wrap">&nbsp;/</span>
            </span>
            <strong class="AppHeader-context-compact-mainItem d-flex flex-items-center Truncate"><span class="Truncate-text ">Latest</span></strong></span>
          </span></button>
          <dialog-helper>
            <dialog id="context-region-dialog" aria-modal="true" aria-labelledby="context-region-dialog-title" class="Overlay Overlay-whenNarrow Overlay--size-medium">
              <div class="Overlay-header"><div class="Overlay-headerContentWrap"><div class="Overlay-titleWrap">
                <h1 class="Overlay-title " id="context-region-dialog-title">
                  Navigate back to
                </h1>
              </div></div></div>
              <scrollable-region data-labelled-by="context-region-dialog-title">
                <div class="Overlay-body"><ul role="list" class="list-style-none">
                  <li><a href="/octo-org" class="Link--primary Truncate d-flex flex-items-center py-1"><span class="AppHeader-context-item-label Truncate-text ">
                    <svg aria-hidden="true" class="octicon octicon-person mr-1"></svg>
                    octo-org
                  </span></a></li>
                  <li><a href="/octo-org/Latest" class="Link--primary Truncate d-flex flex-items-center py-1"><span class="AppHeader-context-item-label Truncate-text ">
                    <svg aria-hidden="true" class="octicon octicon-repo mr-1"></svg>
                    Latest
                  </span></a></li>
                </ul></div>
              </scrollable-region>
            </dialog>
          </dialog-helper>
        </div>
      </context-region-controller>`

    translator = createTranslator({ matcher, host: window, resolvePages: () => HOME })
    translator.start()

    const trigger = document.getElementById('trigger')!
    expect(trigger.getAttribute('aria-label')).toBe('页面上下文：octo-org / Latest')
    expect(trigger.querySelector('.AppHeader-context-compact-parentItem')?.textContent).toBe('octo-org')
    // 存储库名与侧栏词条 Latest 同形，仍保持原文
    expect(trigger.querySelector('.AppHeader-context-compact-mainItem')?.textContent).toBe('Latest')
    expect(document.getElementById('context-region-dialog-title')?.textContent?.trim()).toBe('返回到')
    const names = [...document.querySelectorAll('dialog .AppHeader-context-item-label')].map(node => node.textContent?.trim())
    expect(names).toEqual(['octo-org', 'Latest'])
  })
})

/** 行内句宿主的子节点：字符串是一个文本节点（React 的 {' '}、{表达式} 都单独成节点），元组是只含文字的元素 */
type Part = string | readonly [tag: string, text: string]

interface SentenceCase {
  /** 所在组件与宿主 */
  readonly name: string
  readonly host: string
  readonly parts: readonly Part[]
  readonly expected: string
  /** 槽位元素译后的文字 */
  readonly slots: readonly string[]
}

const LINK_SENTENCES: readonly SentenceCase[] = [
  {
    name: 'Code 下拉 LocalTab：没有 SSH 公钥',
    host: 'div',
    parts: [
      "You don't have any public SSH keys in your GitHub account. ",
      'You can',
      ' ',
      ['a', 'add a new public key'],
      ', or try cloning this repository via HTTPS.'
    ],
    expected: '你的 GitHub 帐户中没有 SSH 公钥。你可以添加新公钥，或尝试通过 HTTPS 克隆此存储库。',
    slots: ['添加新公钥']
  },
  {
    name: 'Code 下拉 LocalTab：没有 SSH 公钥（弯撇号）',
    host: 'div',
    parts: [
      'You don’t have any public SSH keys in your GitHub account. ',
      'You can',
      ' ',
      ['a', 'add a new public key'],
      ', or try cloning this repository via HTTPS.'
    ],
    expected: '你的 GitHub 帐户中没有 SSH 公钥。你可以添加新公钥，或尝试通过 HTTPS 克隆此存储库。',
    slots: ['添加新公钥']
  },
  {
    name: 'Code 下拉 LocalTab：启动 GitHub 桌面版后的提示（链接移到句末）',
    host: 'p',
    parts: ['If nothing happens, ', ['a', 'download GitHub Desktop'], ' and try again.'],
    expected: '如果没有反应，请在重试前下载 GitHub 桌面版。',
    slots: ['下载 GitHub 桌面版']
  },
  {
    name: 'Code 下拉 LocalTab：启动 Xcode 后的提示（应用名原样保留）',
    host: 'p',
    parts: ['If nothing happens, ', ['a', 'download Xcode'], ' and try again.'],
    expected: '如果没有反应，请在重试前下载 Xcode。',
    slots: ['下载 Xcode']
  },
  {
    name: 'Codespaces 标签页 CodespacesTab：需要登录',
    host: 'span',
    parts: ['Please', ' ', ['a', 'sign in'], ' ', 'to use Codespaces.'],
    expected: '请登录后使用代码空间。',
    slots: ['登录']
  },
  {
    name: 'Codespaces 标签页 CodespacesTab：IP 允许列表（链接移到句末）',
    host: 'span',
    parts: [
      'Your organization or enterprise enforces',
      ' ',
      ['a', 'IP allow lists'],
      ' ',
      'which are unsupported by Codespaces at this time.'
    ],
    expected: '你的组织或企业强制实施了代码空间目前不支持的 IP 允许列表。',
    slots: ['IP 允许列表']
  },
  {
    name: 'Codespaces 标签页 CodespacesTab：意外错误',
    host: 'span',
    parts: ['An unexpected error occurred. Please', ' ', ['a', 'contact support'], ' ', 'for more information.'],
    expected: '发生意外错误。请联系支持了解详情。',
    slots: ['联系支持']
  },
  {
    name: 'Codespaces 标签页 CodespacesTab：企业托管用户（句首为链接，付费方为默认文字）',
    host: 'span',
    parts: [['a', 'Enterprise-managed users'], ' must have their Codespaces usage paid for by their enterprise.'],
    expected: '企业托管用户的代码空间使用量必须由其企业支付。',
    slots: ['企业托管用户']
  },
  {
    name: 'Codespaces 标签页 CodespacesTab：企业托管用户（付费方为企业名）',
    host: 'span',
    parts: [['a', 'Enterprise-managed users'], ' must have their Codespaces usage paid for by Octo Corp.'],
    expected: '企业托管用户的代码空间使用量必须由 Octo Corp 支付。',
    slots: ['企业托管用户']
  },
  {
    name: '关注菜单 NotificationsSubscriptionsMenu：关注数量达到上限',
    host: 'div',
    parts: ['You have reached the limit of 10,000 watched repositories. Update your', ' ', ['a', 'watch settings'], ' to continue.'],
    expected: '你关注的存储库数量已达 10,000 个上限。请更新你的关注设置后继续。',
    slots: ['关注设置']
  },
  {
    name: '父存储库默认分支改名弹层 ParentBranchRenamePopover（链接在句末）',
    host: 'p',
    parts: ["You can rename this fork's default branch to match in", ' ', ['a', 'branch settings']],
    expected: '如需重命名此复刻的默认分支以保持一致可前往分支设置',
    slots: ['分支设置']
  },
  {
    name: '父存储库默认分支改名弹层 ParentBranchRenamePopover（弯撇号）',
    host: 'p',
    parts: ['You can rename this fork’s default branch to match in', ' ', ['a', 'branch settings']],
    expected: '如需重命名此复刻的默认分支以保持一致可前往分支设置',
    slots: ['分支设置']
  },
  {
    name: '侧栏特殊存储库提示 SidebarConfigCallToAction：专用存储库',
    host: 'p',
    parts: ['If you ', ['strong', 'make this a public repository'], ', its ', ['code', 'README.md'], ' will appear on your profile.'],
    expected: '如果你将此存储库设为公共，其 README.md 将显示在你的个人资料中。',
    slots: ['将此存储库设为公共', 'README.md']
  }
]

describe('repository 被链接拆开的整句', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(tag: string, parts: readonly Part[]): HTMLElement {
    const host = document.createElement(tag)
    for (const part of parts) {
      if (typeof part === 'string') {
        host.append(document.createTextNode(part))
        continue
      }
      const [name, text] = part
      const element = document.createElement(name)
      if (name === 'a') element.setAttribute('href', '/docs')
      element.textContent = text
      host.append(element)
    }
    document.body.append(host)
    return host
  }

  it.each(LINK_SENTENCES)('$name', ({ host: tag, parts, expected, slots }) => {
    const host = render(tag, parts)
    const original = host.textContent
    expect(host.childNodes).toHaveLength(parts.length)
    translator = createTranslator({ matcher, host: window, resolvePages: () => HOME })
    translator.start()
    // 整句命中：语序按译文，中文与元素文字之间不留原文的空白
    expect(host.textContent).toBe(expected)
    expect([...host.children].map(element => element.textContent)).toEqual(slots)
    translator.stop()
    translator = undefined
    expect(host.textContent).toBe(original)
  })

  it('整句未命中时各片段单独翻译（原文无标点，译文不加逗号）', () => {
    expect(translate('Your organization or enterprise enforces')).toBe('你的组织或企业强制实施了')
    expect(translate('which are unsupported by Codespaces at this time.')).toBe('但代码空间目前不支持。')
    // Please 由 common/dialogs.ts 的全局词条翻译，本词典不收
    expect(dict.scoped?.Please).toBeUndefined()
    expect(
      createMatcher([
        ['common', common],
        ['repository', repository]
      ]).translate('Please', HOME)
    ).toBe('请')
    expect(translate('to use Codespaces.')).toBe('后使用代码空间。')
    expect(translate('must have their Codespaces usage paid for by their enterprise.')).toBe('的代码空间使用量必须由其企业支付。')
    expect(translate('to continue.')).toBe('后继续。')
    expect(translate('If you')).toBe('如果你')
    expect(translate(', its')).toBe('，其')
  })
})
