import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary } from '../../../src/core/types'
import code from '../../../src/locales/zh-CN/code'
import banners from '../../../src/locales/zh-CN/code/banners'
import blob from '../../../src/locales/zh-CN/code/blob'
import edit from '../../../src/locales/zh-CN/code/edit'
import licenses from '../../../src/locales/zh-CN/code/licenses'
import templates from '../../../src/locales/zh-CN/code/templates'
import tree from '../../../src/locales/zh-CN/code/tree'
import checkSummary from '../../../src/locales/zh-CN/commits/check-summary'
import checks from '../../../src/locales/zh-CN/commits/checks'
import pullsFiles from '../../../src/locales/zh-CN/pulls/files'
import repository from '../../../src/locales/zh-CN/repository'
import codeTW from '../../../src/locales/zh-TW/code'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = code

const matcher = createMatcher([['code', code]])

/** 代码页的作用域：common → repository → code */
const SCOPE = ['common', 'repository', 'code'] as const

function translate(text: string): string | undefined {
  return matcher.translate(text, SCOPE)
}

/** 检查弹层的词条由 commits 词典维护（译文在 commits.test.ts 校验），这里取它在提交页的译文作期望 */
const commitsMatcher = createMatcher([
  ['commits', checkSummary],
  ['commits', checks]
])

function commitsTranslation(text: string): string {
  const result = commitsMatcher.translate(text, ['commits'])
  if (result === undefined) throw new Error(`commits 检查弹层词条未命中：${text}`)
  return result
}

interface RegExpCase {
  readonly hits: readonly (readonly [string, string])[]
  readonly misses: readonly string[]
}

/** 与 code.regexp 一一对应（tree → blob → banners → licenses（无正则）→ edit → templates → commits/check-summary → commits/checks 的合并顺序） */
const REGEXP_CASES: readonly RegExpCase[] = [
  // tree：页面标题分段（原文无标点，引用名不加括号）
  {
    hits: [['Blaming core/package.json at main', '追溯 main 上的 core/package.json']],
    misses: ['Blaming core/package.json']
  },
  {
    hits: [['Editing core/README.md at main', '编辑 main 上的 core/README.md']],
    misses: ['Editing']
  },
  {
    hits: [['Deleting core/README.md at v3.5.0', '删除 v3.5.0 上的 core/README.md']],
    misses: ['Deleting core/README.md']
  },
  {
    hits: [
      ['New File at /', '新建文件'],
      ['New File at src/utils', '在 src/utils 中新建文件']
    ],
    misses: ['New File']
  },
  {
    hits: [
      ['core/packages at main', 'main 上的 core/packages'],
      ['cli/pkg at trunk', 'trunk 上的 cli/pkg']
    ],
    misses: ['Fix crash at startup', 'core at main']
  },
  // tree：文件树、目录截断
  {
    hits: [['12 entries not shown', '另有 12 项未显示']],
    misses: ['entries not shown']
  },
  {
    hits: [
      [
        'Sorry, we had to truncate this directory to 1,000 files. 2,345 entries were omitted from the list. Latest commit info may be omitted.',
        '此目录已截断为 1,000 个文件，另有 2,345 个条目未列出。最新提交信息可能不完整。'
      ],
      [
        'Sorry, we had to truncate this directory to 1,000 files. 1 entry was omitted from the list. Latest commit info may be omitted.',
        '此目录已截断为 1,000 个文件，另有 1 个条目未列出。最新提交信息可能不完整。'
      ]
    ],
    // 不带末句的版本由 repository 词典处理
    misses: ['Sorry, we had to truncate this directory to 1,000 files. 2,345 entries were omitted from the list.']
  },
  // tree：贡献者
  {
    hits: [
      ['Show 31 contributors"', '显示 31 个贡献者'],
      ['Show 1 contributor', '显示 1 个贡献者']
    ],
    misses: ['Show contributors']
  },
  {
    hits: [
      ['31 contributors', '31 个贡献者'],
      ['1 contributor', '1 个贡献者']
    ],
    misses: ['contributors']
  },
  {
    hits: [
      ['12 commits by octocat', 'octocat 的 12 个提交'],
      ['1 commit by dependabot[bot]', 'dependabot[bot] 的 1 个提交']
    ],
    misses: ['commits by octocat']
  },
  {
    hits: [
      ['Ask Copilot about this file', '向 Copilot 询问此文件'],
      ['Ask Copilot about this symbol', '向 Copilot 询问此符号']
    ],
    // 存储库级由 repository 词典的 static 处理
    misses: ['Ask Copilot about this repository']
  },
  // tree：存储库概述侧栏的引用对话框
  {
    hits: [
      ['Copy APA', '复制 APA'],
      ['Copy BibTeX', '复制 BibTeX']
    ],
    misses: ['Copy MLA', 'Copy']
  },
  // blob：文件大小
  {
    hits: [
      ['117 lines (117 loc) · 5.03 KB', '117 行（117 行代码）· 5.03 KB'],
      ['1,204 lines (1,033 loc) · 41.2 KB', '1,204 行（1,033 行代码）· 41.2 KB'],
      ['12.3k lines (10.1k loc) · 410 KB', '12.3k 行（10.1k 行代码）· 410 KB'],
      ['3 lines (3 loc) · 99 Bytes', '3 行（3 行代码）· 99 字节']
    ],
    misses: ['117 lines', 'lines (loc) · 5.03 KB']
  },
  // blob：不可预览文件只显示大小（KB、MB 原样保留）
  {
    hits: [
      ['504 Bytes', '504 字节'],
      ['1 Byte', '1 字节']
    ],
    misses: ['Bytes', '1.2 KB']
  },
  // blob：代码所有者（原文无标点，译文不加冒号、顿号；与 pulls 差异视图的同一提示同译「所有者为 X」）
  {
    hits: [
      ['Owned by you', '所有者为你'],
      ['Owned by you along with @org/team (from CODEOWNERS line 3)', '所有者为你和 @org/team（来自 CODEOWNERS 第 3 行）'],
      ['Owned by younull (from CODEOWNERS line 7)', '所有者为你（来自 CODEOWNERS 第 7 行）']
    ],
    misses: ['Owned by']
  },
  {
    hits: [
      ['Owned by @octocat @org/team', '所有者为 @octocat @org/team'],
      ['Owned by @org/docs (from CODEOWNERS line 12)', '所有者为 @org/docs（来自 CODEOWNERS 第 12 行）'],
      ['Owned by youngster', '所有者为 youngster']
    ],
    misses: ['Owned']
  },
  {
    hits: [['Code owners: You, @org/team', '代码所有者：你、@org/team']],
    misses: ['Code owners:']
  },
  {
    hits: [['Code owner: You', '代码所有者：你']],
    misses: ['Code owner:']
  },
  {
    hits: [['Code owner: @octocat', '代码所有者：@octocat']],
    misses: ['Code owner']
  },
  // blob：行菜单
  { hits: [['Line 12 options', '第 12 行选项']], misses: ['Line options'] },
  { hits: [['Copied line 5.', '已复制第 5 行。']], misses: ['Copied line.'] },
  { hits: [['Copied lines 5-9.', '已复制第 5-9 行。']], misses: ['Copied lines.'] },
  // blob：文件内查找（kbd 整句；快捷键文字随系统变化）
  {
    hits: [
      ["Press Ctrl F again to open the browser's find menu", '再次按 Ctrl F 打开浏览器的查找菜单'],
      ["Press ⌘ F again to open the browser's find menu", '再次按 ⌘ F 打开浏览器的查找菜单']
    ],
    misses: ["Press again to open the browser's find menu"]
  },
  // blob：追溯（日期由 helpers 生成，与前面的中文隔空格；原文只有逗号，译文不换成括号）
  {
    hits: [['Blame prior to change 20ea62d, made on Feb 3, 2023', '追溯 20ea62d 之前的版本，该更改提交于 2023 年 2 月 3 日']],
    misses: ['Blame prior to change 20ea62d']
  },
  // blob：符号面板
  {
    hits: [
      ['12 symbols found', '找到 12 个符号'],
      ['1 symbol found\u200B\u200B', '找到 1 个符号']
    ],
    misses: ['symbols found']
  },
  {
    hits: [
      ['5 References', '5 个引用'],
      ['1 Reference', '1 个引用']
    ],
    // 单独的 References 由 scoped 词条译为「引用」
    misses: ['References found', '5 Referees']
  },
  {
    hits: [
      ['Definitions in this file', '此文件中的定义'],
      ['References in src/core/index.ts', 'src/core/index.ts 中的引用'],
      ['Results in this file', '此文件中的结果']
    ],
    misses: ['Definitions in']
  },
  // blob：错误页
  {
    hits: [['An unexpected 500 error occurred. Try', '发生意外的 500 错误。请尝试']],
    misses: ['An unexpected 50 error occurred. Try']
  },
  // blob：计划限制（方案名译「X 版」）
  {
    hits: [
      [
        'Upgrade to GitHub Pro or make this repository public to enable CODEOWNERS.',
        '升级到 GitHub 专业版或将此存储库设为公共以启用 CODEOWNERS。'
      ],
      [
        'Upgrade to GitHub Team or make this repository public to enable this feature.',
        '升级到 GitHub 团队版或将此存储库设为公共以启用此功能。'
      ]
    ],
    misses: ['Upgrade to GitHub Enterprise or make this repository public to enable CODEOWNERS.']
  },
  {
    hits: [
      [
        'This repository is a fork, and inherits the features of the parent repository. Contact the owner of the root repository to enable CODEOWNERS',
        '此存储库是复刻，继承父存储库的功能。联系根存储库所有者以启用 CODEOWNERS'
      ],
      [
        'This repository is a fork, and inherits the features of the parent repository. Contact the owner of the root repository to enable this feature.',
        '此存储库是复刻，继承父存储库的功能。联系根存储库所有者以启用此功能。'
      ]
    ],
    misses: ['This repository is a fork']
  },
  {
    hits: [['Contact the owner of the repository to enable CODEOWNERS.', '联系存储库所有者以启用 CODEOWNERS。']],
    misses: ['Contact the owner of the repository']
  },
  // blob：实验性代码视图
  { hits: [['Line 12 annotations', '第 12 行注释']], misses: ['Line annotations'] },
  {
    hits: [
      ['Line 12 annotations: Hidden Unicode', '第 12 行注释：隐藏 Unicode'],
      ['Line 3 annotations: Hidden Unicode, CODEOWNERS error', '第 3 行注释：隐藏 Unicode、CODEOWNERS 错误']
    ],
    misses: ['Line 3 annotations: Unknown kind', 'Line 3 annotations:']
  },
  { hits: [['Line 12 actions', '第 12 行操作']], misses: ['Line actions'] },
  { hits: [['Lines 3–8 actions', '第 3–8 行操作']], misses: ['Lines actions'] },
  { hits: [['Expand section at line 10', '展开第 10 行处的代码段']], misses: ['Expand section'] },
  { hits: [['Collapse section at line 10', '折叠第 10 行处的代码段']], misses: ['Collapse section'] },
  { hits: [['Expand row 10', '展开第 10 行']], misses: ['Expand row ten'] },
  { hits: [['Line 4 highlighted.', '已高亮第 4 行。']], misses: ['Line highlighted.'] },
  { hits: [['Lines 4 to 9 highlighted.', '已高亮第 4 至 9 行。']], misses: ['Lines highlighted.'] },
  {
    hits: [['Find in file: 3 results. Result 1 of 3, line 12.', '文件内查找：共 3 个结果。第 1 个，第 12 行。']],
    misses: ['Find in file: 3 results.']
  },
  // 原文只有一个逗号：译文不多加逗号、冒号
  { hits: [['Result 2 of 3, line 40.', '共 3 个结果中的第 2 个，第 40 行。']], misses: ['Result 2 of 3.'] },
  { hits: [['Line 12', '第 12 行']], misses: ['Line twelve', 'Line 12a'] },
  {
    hits: [
      ['12 text references to useState.', 'useState 的 12 处文本引用。'],
      ['1 text reference to foo bar.', 'foo bar 的 1 处文本引用。']
    ],
    misses: ['text references to foo.']
  },
  {
    hits: [
      ['3 sections collapsed. 40 of 120 source lines visible.', '已折叠 3 个代码段。120 行源代码中可见 40 行。'],
      [
        '1 section collapsed. 98 of 100 source lines visible. Caret moved to visible line 7.',
        '已折叠 1 个代码段。100 行源代码中可见 98 行。光标已移到可见的第 7 行。'
      ]
    ],
    misses: ['sections collapsed. source lines visible.']
  },
  {
    hits: [['Source preparation failed. Worker crashed', '源代码准备失败。Worker crashed']],
    misses: ['Source preparation failed.']
  },
  {
    hits: [['Loading symbol details for useState.', '正在加载 useState 的符号详细信息。']],
    misses: ['Loading symbol details for']
  },
  {
    hits: [['Unable to load symbol details for useState.', '无法加载 useState 的符号详细信息。']],
    misses: ['Unable to load symbol details']
  },
  {
    hits: [['Loading references for useState.', '正在加载 useState 的引用。']],
    misses: ['Loading references']
  },
  {
    hits: [['Unable to load references for useState.', '无法加载 useState 的引用。']],
    misses: ['Unable to load references']
  },
  {
    hits: [
      ['2 definitions and 5 references for useState.', 'useState 的 2 个定义和 5 个引用。'],
      ['1 definition and 1 reference for foo.', 'foo 的 1 个定义和 1 个引用。']
    ],
    misses: ['definitions and references for foo.']
  },
  // banners：许可证
  {
    hits: [
      ['octo-org/hello-world is licensed under the', 'octo-org/hello-world 采用以下许可证'],
      ['octocat/hello-world is licensed under', 'octocat/hello-world 采用以下许可证']
    ],
    misses: ['is licensed under the']
  },
  // banners：问题模板错误
  { hits: [['Learn more about error 2.', '了解错误 2。']], misses: ['Learn more about error.'] },
  // banners：CSV 解析出错（未收录的错误原样保留）
  {
    hits: [
      ['if this error is corrected: No commas found in this CSV file in line 0.', '：此 CSV 文件第 0 行中未找到逗号。'],
      ['if this error is corrected: Illegal quoting in line 3.', '：第 3 行的引号不合法。'],
      ['if this error is corrected: Unclosed quoted field in line 12.', '：第 12 行有未闭合的引号字段。'],
      ["if this error is corrected: Any value after quoted field isn't allowed in line 5.", '：第 5 行的引号字段后不允许有值。'],
      ['if this error is corrected: Field size exceeded in line 7.', '：第 7 行的字段过大。'],
      [
        'if this error is corrected: Unquoted fields do not allow new line <"\\r"> in line 2.',
        '：Unquoted fields do not allow new line <"\\r"> in line 2.'
      ]
    ],
    misses: ['if this error is corrected:']
  },
  // banners：Copilot Spaces
  {
    hits: [['Space owner. Required. Selected owner: @octocat', '空间所有者。必填。已选所有者：@octocat']],
    misses: ['Space owner. Required. Selected owner: @']
  },
  {
    hits: [['File added to My space successfully.', '文件已添加到 My space。']],
    misses: ['File added to successfully.']
  },
  // banners：Copilot 申请被拒（日期可缺省；功能名按 product-names.md 译出，与两侧中文按 joinCjk 补空格）
  {
    hits: [
      [
        'Your request for Copilot Business was declined by an admin on Mar 3, 2025.',
        '你的 Copilot 商业版申请已于 2025 年 3 月 3 日被管理员拒绝。'
      ],
      // 无法解析的日期原样保留，与两侧中文各空一格
      [
        'Your request for Copilot Business was declined by an admin on 2025-03-03.',
        '你的 Copilot 商业版申请已于 2025-03-03 被管理员拒绝。'
      ],
      ['Your request for Copilot Business was declined by an admin.', '你的 Copilot 商业版申请已被管理员拒绝。'],
      // 品牌词 Copilot 保留，与后文中文隔空格；未收录的功能名原样保留
      ['Your request for Copilot was declined by an admin.', '你的 Copilot 申请已被管理员拒绝。'],
      ['Your request for Sample feature was declined by an admin.', '你的 Sample feature 申请已被管理员拒绝。']
    ],
    misses: ['Your request for  was declined by an admin.', 'Your request for Copilot Business was declined by an admin on Mar 3, 2025']
  },
  // banners：空存储库引导卡片的功能申请已提交（功能名按 product-names.md 译出）
  {
    hits: [
      [
        "You've successfully submitted a request to your organization's admins for access to Copilot. An admin will need to approve your request before you can use this feature.",
        '你已成功向组织管理员申请访问 Copilot。管理员批准后才能使用此功能。'
      ],
      [
        'You’ve successfully submitted a request to your organization’s admins for access to GitHub Codespaces. An admin will need to approve your request before you can use this feature.',
        '你已成功向组织管理员申请访问 GitHub 代码空间。管理员批准后才能使用此功能。'
      ],
      [
        "You've successfully submitted a request to your organization's admins for access to Codespaces. An admin will need to approve your request before you can use this feature.",
        '你已成功向组织管理员申请访问代码空间。管理员批准后才能使用此功能。'
      ]
    ],
    misses: [
      "You've successfully submitted a request to your organization's admins for access to. An admin will need to approve your request before you can use this feature."
    ]
  },
  // edit：编辑器屏幕阅读器标题（英文类型名与两侧中文隔空格）
  {
    hits: [
      ['Creating a new file in core', '在 core 中新建文件'],
      ['Creating a new workflow file in core', '在 core 中新建工作流文件'],
      ['Creating a new dependabot file in hello-world', '在 hello-world 中新建 Dependabot 文件']
    ],
    misses: ['Creating a new file']
  },
  {
    hits: [
      ['Editing README.md in core', '编辑 core 中的文件 README.md'],
      ['Editing workflow file ci.yml in core', '编辑 core 中的工作流文件 ci.yml'],
      ['Editing devcontainer file devcontainer.json in hello-world', '编辑 hello-world 中的 devcontainer 文件 devcontainer.json']
    ],
    misses: ['Editing README.md']
  },
  { hits: [['Editing README.md file contents', '编辑 README.md 文件内容']], misses: ['Editing contents'] },
  // edit：CodeMirror 搜索播报（原文只有句号，译文不加冒号、逗号）
  {
    hits: [['current match. const foo = 1 on line 3.', '当前匹配。第 3 行的 const foo = 1。']],
    misses: ['current match.']
  },
  {
    hits: [
      ['replaced 3 matches.', '已替换 3 处匹配。'],
      ['replaced 1 match.', '已替换 1 处匹配。']
    ],
    misses: ['replaced matches.']
  },
  { hits: [['replaced match on line 7.', '已替换第 7 行的匹配。']], misses: ['replaced match on line.'] },
  // edit：赞助文件预览（文件名是相邻文本节点）
  {
    hits: [['Some errors were encountered when parsing the FUNDING.yml file:', '解析 FUNDING.yml 文件时出错：']],
    misses: ['Some errors were encountered when parsing the file:']
  },
  {
    hits: [['The FUNDING.yml file does not currently contain valid funding links.', 'FUNDING.yml 文件当前不包含有效的赞助链接。']],
    misses: ['The file does not currently contain valid funding links.']
  },
  {
    hits: [['Learn more about formatting FUNDING.yml', '了解 FUNDING.yml 的格式']],
    misses: ['Learn more about formatting']
  },
  // edit：帮助面板（Marketplace → 市场）
  {
    hits: [['Search Marketplace for Docker Actions', '在市场中搜索 Docker 操作']],
    misses: ['Search Marketplace for']
  },
  { hits: [['Search for Node.js features', '搜索 Node.js 功能']], misses: ['Search for'] },
  { hits: [['Code snippet for actions/checkout', 'actions/checkout 的代码片段']], misses: ['Code snippet'] },
  {
    hits: [
      ['Your search has returned 3 results.', '搜索返回 3 个结果。'],
      ['Your search has returned 1 result.', '搜索返回 1 个结果。']
    ],
    misses: ['Your search has returned results.']
  },
  // edit：提交对话框、推送保护（签署说明整句由 inline 处理，此为未拼成整句时的片段：原文无标点，译文不加逗号、冒号）
  {
    hits: [['on this commit as octocat@users.noreply.github.com', '此提交并署名为 octocat@users.noreply.github.com']],
    misses: ['on this commit as']
  },
  {
    hits: [['octocat has committed since you started editing.', 'octocat 在你开始编辑后提交了更改。']],
    misses: ['has committed since you started editing.']
  },
  { hits: [['line 42', '第 42 行']], misses: ['line'] },
  // edit：删除页
  {
    hits: [
      ['Deleting core/README.md. Commit changes to save.', '正在删除 core/README.md。提交更改后生效。'],
      ['Deleting directory core/docs. Commit changes to save.', '正在删除目录 core/docs。提交更改后生效。']
    ],
    misses: ['Commit changes to save.']
  },
  { hits: [['Failed to load diff: 500', '差异加载失败：500']], misses: ['Failed to load diff:'] },
  // edit：上传页文件列表、屏幕阅读器标题
  {
    hits: [
      ['Remove hello.py', '删除 hello.py'],
      ['Remove Makefile', '删除 Makefile']
    ],
    misses: ['Remove the selected files']
  },
  {
    hits: [['Uploading files to hello-world', '上传文件到 hello-world']],
    misses: ['Uploading files to']
  },
  // templates：选定许可证 / 行为准则模板后的编辑器提示
  {
    hits: [
      [
        'Your license is ready. Please review it below and either commit it to the main branch or to a new branch.',
        '许可证已就绪。审查后提交到 main 分支或新分支。'
      ],
      [
        'Your code of conduct is ready. Please review it below and either commit it to the dev branch or to a new branch.',
        '行为准则已就绪。审查后提交到 dev 分支或新分支。'
      ]
    ],
    misses: [
      'Your license is ready.',
      'Your readme is ready. Please review it below and either commit it to the main branch or to a new branch.'
    ]
  },
  // commits/check-summary：最新提交行的检查弹层（期望取 commits 词典的译文）
  {
    hits: [['1 failing, 2 skipped, and 15 successful checks', commitsTranslation('1 failing, 2 skipped, and 15 successful checks')]],
    misses: ['1 failing, 2 skipped, and 15 successful']
  },
  { hits: [['3 checks', commitsTranslation('3 checks')]], misses: ['checks'] },
  {
    hits: [
      ['Successful in 41s', commitsTranslation('Successful in 41s')],
      ['Completed in 1m 30s', commitsTranslation('Completed in 1m 30s')]
    ],
    misses: ['Successful in']
  },
  { hits: [['Failing after 2m 5s', commitsTranslation('Failing after 2m 5s')]], misses: ['Failing after'] },
  // commits/checks：检查弹层的待批准工作流横幅
  {
    hits: [['2 workflows awaiting approval', commitsTranslation('2 workflows awaiting approval')]],
    misses: ['workflows awaiting approval']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('code 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('提交消息占位符不翻译', () => {
    expect(translate('Update README.md')).toBeUndefined()
    expect(translate('Create index.ts')).toBeUndefined()
    expect(translate('Delete docs/guide.md')).toBeUndefined()
  })

  it('代码所有者提示与拉取请求差异视图（pulls/files）的同一提示同译', () => {
    const pullsMatcher = createMatcher([['pulls', pullsFiles]])
    for (const text of ['Owned by @org/docs (from CODEOWNERS line 12)', 'Owned by @octocat @org/team (from CODEOWNERS line 3)']) {
      expect(translate(text), text).toBe(pullsMatcher.translate(text, ['common', 'repository', 'pulls']))
    }
  })
})

describe('code 静态词条', () => {
  it.each([
    // tree
    ['Collapse file tree', '折叠文件树'],
    ['Expand file tree', '展开文件树'],
    ['Search this repository', '搜索此存储库'],
    ['Directory actions', '目录操作'],
    ['File Finder', '文件查找器'],
    ['No matching files found.', '未找到匹配的文件。'],
    // blob
    ['More file actions', '更多文件操作'],
    ['Copy raw file', '复制原始文件'],
    ['Download raw file', '下载原始文件'],
    ['Copy file permalink', '复制文件永久链接'],
    ['Edit this file', '编辑此文件'],
    ['Edit in place', '就地编辑'],
    ['View git blame', '查看追溯'],
    ['Reference in new issue', '在新议题中引用'],
    ['View file in different branch/tag', '在其他分支/标签中查看文件'],
    ['View raw', '查看原始文件'],
    // 渲染器错误（显示在 Error rendering embedded code 下）
    ['Invalid PDF', 'PDF 无效'],
    ['(Sorry about that, but we can’t show files that are this big right now.)', '（文件过大，无法显示。）'],
    ['Sorry about that, but we can’t show files that are this big right now.', '文件过大，无法显示。'],
    ['Open symbols panel', '打开符号面板'],
    ['Filter symbols', '筛选符号'],
    ['Jump to line', '跳转到行'],
    ['Ignoring revisions in', '已忽略以下文件中的修订'],
    ['executable file', '可执行文件'],
    ['No source lines available.', '没有可用的源代码行。'],
    ['Customize the issue creation experience with a', '自定义议题创建体验可使用'],
    ['Expand code section', '展开代码段'],
    ['Collapse code section', '折叠代码段'],
    ['No lockfile found', '未找到锁定文件'],
    // banners
    ['This is not legal advice.', '此信息不构成法律建议。'],
    ['This CODEOWNERS file is valid.', '此 CODEOWNERS 文件有效。'],
    // 问题模板横幅：problem 译作「错误」，不与「问题模板」混淆
    ['There is a problem with this template', '此模板有一个错误'],
    ['Create new issue to see results', '新建议题以查看结果'],
    ['. An admin will need to approve your request before you can use this feature.', '。管理员批准后才能使用此功能。'],
    ['We can make this file', '更正以下错误后可使此文件'],
    ['beautiful and searchable', '美观且可搜索'],
    // 组织演示存储库的工作流说明：opened 译作「创建」，不写成「打开问题」
    [
      'happens to add reviewers and assignees to issues and pull requests when they’re opened in this repository.',
      '会在此存储库中创建议题和拉取请求时为其添加审查者和受理人。'
    ],
    // edit（省略号随原文）
    ['Commit changes...', '提交更改...'],
    ['Cancel changes', '取消更改'],
    // 经典提交表单的扩展描述：标签与无省略号的占位符
    ['Extended commit message', '扩展提交消息'],
    ['Add an optional extended description', '添加可选的扩展描述'],
    ['Name your file...', '为文件命名...'],
    ['Editing file contents', '编辑文件内容'],
    [
      'Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.',
      '使用 Control + Shift + m 切换 tab 键是否移动焦点。也可以按 esc 再按 tab 移到页面上的下一个交互元素。'
    ],
    ['Use Control + Space to trigger autocomplete in most situations.', '使用 Control + Space 可在大多数情况下触发自动补全。'],
    [
      'Use Control + Space or Option + Space to trigger autocomplete in most situations.',
      '使用 Control + Space 或 Option + Space 可在大多数情况下触发自动补全。'
    ],
    ['Use Tab to navigate to the next placeholder.', '使用 Tab 可跳到下一个占位符。'],
    ['The requested page could not be found.', '找不到请求的页面。'],
    // 附件出错：<Try again> with …（与 common-ui 的文件类型片段同用「并改用」）
    ['with a file size less than 10MB.', '并改用小于 10MB 的文件。'],
    ['with a file that’s not empty.', '并改用非空文件。'],
    ['with another file.', '并改用其他文件。'],
    ['Indent mode', '缩进模式'],
    ['Soft wrap', '软换行'],
    ['Show diff', '显示差异'],
    ['Unable to load this preview, sorry.', '无法加载此预览。'],
    ['Propose changes', '提议更改'],
    ['Commit directly to the', '直接提交到'],
    // 拉取请求语境的 start 与 open 同作「创建」
    ['for this commit and start a pull request', '用于此提交并创建拉取请求'],
    ['for this commit and start a pull request.', '用于此提交并创建拉取请求。'],
    ['A file with the same name already exists. Please choose a different name and try again.', '已存在同名文件。请换个名称重试。'],
    ['See what changed', '查看更改'],
    ['Drag files here to add them to your repository', '将文件拖到此处以添加到存储库'],
    ['Select a branch to upload files', '选择要上传文件的分支'],
    ["It's a false positive", '误报'],
    ['Yowza, that’s a lot of files. Try uploading fewer than 100 at a time.', '文件过多。请一次上传少于 100 个文件。'],
    ['Remove this file', '删除此文件'],
    ['Commit choice', '提交方式'],
    // 分支保护未生效横幅：方案名译「X 版」；原文只有句号，译文不加冒号、逗号
    [
      "branch won't be enforced on this private repository until you move to a GitHub Team or Enterprise account.",
      '分支在转为 GitHub 团队版或企业版帐户之前不会在此专用存储库中强制实施。'
    ],
    [
      "branch won't be enforced on this private repository until your organization admins upgrade this organization account to GitHub Team.",
      '分支在组织管理员将此组织帐户升级到 GitHub 团队版之前不会在此专用存储库中强制实施。'
    ],
    // write access → 写入访问权限（术语表 permission 行）；整句由 inline 调整语序，此为片段（原文无逗号）：
    // 复刻名接在「复刻」之后，不放在「新分支」之后（否则会被读成分支名）
    [
      'You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork',
      '你正在更改没有写入访问权限的项目。提交的更改将写入新分支。新分支位于你的复刻'
    ],
    // 原文只有破折号连接两个分句：译作 ——，不另加逗号
    [
      'Sorry, you’re not able to edit this repository directly—you need to fork it and propose your changes from there instead.',
      '无法直接编辑此存储库——须先复刻再在复刻中提议更改。'
    ],
    // 原文只有句号、问号：译文不把句号换成逗号
    ['You have unsaved changes. Do you want to discard them?', '有未保存的更改。是否放弃？'],
    ['No results found. Try a different search.', '未找到结果。请尝试其他搜索。'],
    ['An error occurred when allowing your secret. Please try again.', '允许机密时出错。请重试。'],
    // 推送保护：自定义模式后的插入语，逗号随原文，不改写成括号
    [', defined by your admins, on', '，由管理员定义，位于'],
    // 产品名按 product-names.md 译出：Marketplace → 市场、Codespaces → 代码空间、Sponsors → 赞助、Actions → 操作
    ['Search Marketplace for Actions', '在市场中搜索操作'],
    ['Browse all actions on the GitHub Marketplace', '在 GitHub 市场中浏览所有操作'],
    ['View full Marketplace listing', '查看完整的市场上架信息'],
    ['Some users provided are not enrolled in GitHub Sponsors.', '部分用户未加入 GitHub 赞助。'],
    ['Apply to Sponsors.', '申请加入赞助。'],
    [
      'are configuration files used by Codespaces and tools implementing the dev container specification.',
      '是代码空间及实现了开发容器规范的工具所使用的配置文件。'
    ],
    ['Help us improve GitHub Codespaces', '帮助我们改进 GitHub 代码空间'],
    [
      'Tell us how to make GitHub Codespaces work better for you with three quick questions.',
      '通过三个简短问题告诉我们如何改进 GitHub 代码空间。'
    ],
    ['Auto-assign new issue with GitHub Actions', '使用 GitHub 操作自动分配新议题'],
    ['your repository’s “Actions” tab.', '存储库的“操作”标签页中查看。'],
    ['You can publish this Action to the GitHub Marketplace', '可将此操作发布到 GitHub 市场'],
    [
      "We noticed that you're personally paying for GitHub Copilot. Instead, ask your organization admin to purchase the business version of GitHub Copilot.",
      '你正在个人付费使用 GitHub Copilot。可请组织管理员购买 Copilot 商业版。'
    ],
    // 特殊存储库横幅：profile 译作「个人资料」
    ['will appear on your public organization profile, visible to anyone.', '将显示在组织的公开个人资料中，所有人可见。'],
    // templates
    ['Add a license to your project', '为项目添加许可证'],
    ['Choose a license to add to your project', '选择要添加到项目的许可证'],
    ['Choose a code of conduct to add to your project', '选择要添加到项目的行为准则'],
    ['Review and submit', '审查并提交'],
    ['The current year', '当前年份'],
    ['Recommended for projects of all sizes', '推荐用于各种规模的项目']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('长句许可证说明整句匹配（原文没有的逗号、冒号、括号不加）', () => {
    expect(
      translate(
        'A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.'
      )
    ).toBe('一种仅以保留版权和许可证声明为条件的简短宽松许可证。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。')
    expect(
      translate(
        'This commercially-friendly copyleft license provides the ability to commercially license binaries; a modern royalty-free patent license grant; and the ability for linked works to use other licenses, including commercial ones.'
      )
    ).toBe(
      '这种对商业友好的 Copyleft 许可证允许对二进制文件进行商业授权；提供现代的免版税专利许可；并允许链接作品使用其他许可证，包括商业许可证。'
    )
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Raw file content \n', SCOPE)).toBe('  原始文件内容 \n')
    expect(matcher.translateRaw(' Blame ', SCOPE)).toBe(' 追溯 ')
  })
})

describe('code 页面词条', () => {
  it.each([
    ['Raw', '原始'],
    ['Blame', '追溯'],
    ['Symbols', '符号'],
    ['Top', '顶部'],
    ['Up', '上一个'],
    ['Down', '下一个'],
    ['View blame', '查看追溯'],
    ['Copy raw content', '复制原始内容'],
    ['Copy path', '复制路径'],
    ['Copy permalink', '复制永久链接'],
    ['Delete file', '删除文件'],
    ['Commit message', '提交消息'],
    ['Commit summary', '提交摘要'],
    ['Extended description', '扩展描述'],
    ['Optional extended description', '可选的扩展描述'],
    ['Add files via upload', '通过上传添加文件'],
    ['Limitations', '限制'],
    ['Commercial use', '商业用途'],
    ['References', '引用'],
    ['Copying', '复制中'],
    ['Labels', '标签'],
    ['File not found', '找不到文件'],
    ['forward slash', '正斜杠'],
    ['By', '来自'],
    ['Tasks', '任务'],
    ['Open pull request', '创建拉取请求'],
    ['Diagnostics', '诊断'],
    ['Try again.', '重试。'],
    ['Requesting...', '申请中...'],
    ['Cancelling...', '取消中...'],
    // 编辑器缩进模式下拉框
    ['Spaces', '空格'],
    ['Tabs', '制表符'],
    ['An unexpected error occurred. Please try again.', '发生意外错误。请重试。'],
    ['Year', '年份'],
    ['Contact method', '联系方式'],
    ['Governing body', '管理机构']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('被元素隔开的片段单独命中', () => {
    // On <code>main</code> branch
    expect(translate('On')).toBe('在')
    expect(translate('branch')).toBe('分支')
    // The <BranchName/> branch of <strong>repo</strong> does not contain the path <strong>path</strong>
    expect(translate('The')).toBe('该')
    expect(translate('branch of')).toBe('分支在')
    expect(translate('does not contain the path')).toBe('中不包含路径')
    // Your <a>.git-blame-ignore-revs</a> file is invalid.
    expect(translate('Your')).toBe('你的')
    expect(translate('file is invalid.')).toBe('文件无效。')
    // Press <kbd>Ctrl F</kbd> again to open the browser's find menu
    expect(translate('Press')).toBe('按')
    expect(translate("again to open the browser's find menu")).toBe('键再次打开浏览器的查找菜单')
    // Create a <strong>new branch</strong> for this commit
    expect(translate('Create a')).toBe('创建')
    expect(translate('new branch')).toBe('新分支')
    expect(translate('for this commit')).toBe('用于此提交')
    // You are <a>signing off</a> on this commit as <email>
    expect(translate('You are')).toBe('你正在')
    expect(translate('signing off')).toBe('签署')
    // Secret scanning found a <b>…</b> secret on <a>line 3</a>.
    expect(translate('found a')).toBe('发现了')
    expect(translate('secret on')).toBe('机密位于')
    // Uploading <span>1</span> of <span>3</span> files
    expect(translate('Uploading')).toBe('正在上传')
    expect(translate('of')).toBe('/')
    expect(translate('files')).toBe('个文件')
    // Use <kbd>Control + Shift + m</kbd> to toggle the <kbd>tab</kbd> key moving focus. Alternatively, use <kbd>esc</kbd> then …
    expect(translate('Use')).toBe('使用')
    expect(translate('to toggle the')).toBe('切换')
    expect(translate('key moving focus. Alternatively, use')).toBe('键是否移动焦点。也可以按')
    expect(translate('to move to the next interactive element on the page.')).toBe('移到页面上的下一个交互元素。')
    // Use <kbd>Control + Space</kbd> to trigger autocomplete in most situations.
    expect(translate('to trigger autocomplete in most situations.')).toBe('可在大多数情况下触发自动补全。')
    // Attach files by + dragging & dropping, + selecting or pasting them.
    expect(translate('Attach files by')).toBe('附加文件可')
    expect(translate('dragging & dropping,')).toBe('拖放、')
    expect(translate('selecting or pasting them.')).toBe('选择或粘贴。')
    expect(translate('Attach files by dragging & dropping, selecting or pasting them.')).toBe('拖放、选择或粘贴文件以附加。')
    // The <span>auto-assign.yml</span> file below lives inside your <span>demo-repository</span> and defines …
    expect(translate('file below lives inside your')).toBe('文件位于你的')
    expect(translate('“Auto Assign” workflow')).toBe('“Auto Assign”工作流')
    expect(translate('issue')).toBe('议题')
    expect(translate('pull request')).toBe('拉取请求')
    // Secret scanning found a <b>…</b> secret in your attempted push on <a>line 3</a>.（命令行推送）
    expect(translate('secret in your attempted push on')).toBe('机密在你尝试的推送中位于')
    // Secret scanning used AI to flag a <b>likely secret</b> on <a>line 3</a>.
    expect(translate('on')).toBe('位于')
    // You can’t commit to <pre>main</pre> because it is a <a>protected branch</a>
    expect(translate('because it is a')).toBe('因为它是')
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.
    // （整句由 inline 调整语序，此为整句未命中时的片段：原文无逗号，译文不加逗号）
    expect(translate('A variant of the')).toBe('一种')
    expect(translate('that explicitly does not grant any patent rights.')).toBe('变体且明确不授予任何专利权。')
    // To adopt <strong>MIT License</strong>, enter your details. You’ll have a chance to review before committing a
    // <code>LICENSE</code> file to a new branch or the root of your project.（后半句原文无标点，译文不加逗号）
    expect(translate('To adopt')).toBe('要采用')
    expect(translate(', enter your details. You’ll have a chance to review before committing a')).toBe('，填写以下信息。你可以先审查再将')
    expect(translate(", enter your details. You'll have a chance to review before committing a")).toBe('，填写以下信息。你可以先审查再将')
    expect(translate("You'll have a chance to review before committing a")).toBe('你可以先审查再将')
    expect(translate('file to a new branch or the root of your project.')).toBe('文件提交到新分支或项目根目录。')
    // Learn more about <a>what a code of conduct is</a> and how to enforce it.
    expect(translate('what a code of conduct is')).toBe('什么是行为准则')
    expect(translate('and how to enforce it.')).toBe('以及如何执行。')
  })

  it('许可证、行为准则模板选择页属于代码页', () => {
    const community = ['common', 'repository', 'insights', 'code'] as const
    expect(matcher.translate('Year', community)).toBe('年份')
    expect(matcher.translate('Commercial use', community)).toBe('商业用途')
    expect(matcher.translate('Year', ['common', 'repository', 'insights'])).toBeUndefined()
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Blame', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Raw', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('117 lines (117 loc) · 5.03 KB', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('core/packages at main', ['common', 'repository', 'commits'])).toBeUndefined()
    expect(matcher.translate('Line 12', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('Copying', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('Down', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('504 Bytes', ['common', 'repository', 'releases'])).toBeUndefined()
  })

  it('语言名 Go 不被当作按钮翻译', () => {
    // 复刻存储库侧栏的语言列表不在链接内，不受全局忽略规则保护
    expect(translate('Go')).toBeUndefined()
  })

  it('复刻信息条「贡献」弹层的 Open pull request：代码页译为动作，优先于全局 static，不进入存储库作用域', () => {
    // 全局 static（pulls 等词典）是状态义「打开的拉取请求」
    const withStatic = createMatcher([
      ['common', { static: { 'Open pull request': '打开的拉取请求' } }],
      ['code', code]
    ])
    expect(withStatic.translate('Open pull request', SCOPE)).toBe('创建拉取请求')
    expect(withStatic.translate('Open pull request', ['common', 'repository'])).toBe('打开的拉取请求')
    expect(withStatic.translate('Open pull request', ['common', 'repository', 'pulls'])).toBe('打开的拉取请求')
  })
})

describe('code 繁体词条（zh-TW）', () => {
  const twDict: PageDictionary = codeTW
  const twMatcher = createMatcher([['code', codeTW]])

  it.each([
    ['Copy file permalink', '複製檔案永久連結'],
    ['Invalid PDF', 'PDF 無效'],
    ['Extended commit message', '詳細提交訊息'],
    ['Add an optional extended description', '新增選填的詳細描述']
  ])('静态：%s → %s', (input, expected) => {
    expect(twDict.static?.[input]).toBe(expected)
    expect(twMatcher.translate(input, SCOPE)).toBe(expected)
  })
})

describe('code 不收录由公共词典处理的词条', () => {
  it('页头面包屑、Share feedback、附件类型片段由 common / common-ui 处理', () => {
    expect(dict.static?.['GitHub Breadcrumb']).toBeUndefined()
    expect(dict.static?.['Show more breadcrumb items']).toBeUndefined()
    expect(dict.scoped?.['Share feedback']).toBeUndefined()
    expect(translate('Share feedback')).toBeUndefined()
    // <Try again> with a GIF, JPEG, or PNG.
    expect(translate('with a GIF, JPEG, JPG, PNG, or MOV.')).toBeUndefined()
    expect(translate('with a PNG.')).toBeUndefined()
  })

  it('Type 不收录：与页头「Type / to search」的片段同形', () => {
    expect(dict.static?.Type).toBeUndefined()
    expect(dict.scoped?.Type).toBeUndefined()
    expect(translate('Type')).toBeUndefined()
  })
})

describe('code 合并的检查弹层词条（commits/check-summary、commits/checks）', () => {
  it('与 commits 共用同一组规则，不另存副本', () => {
    const rules = [...(checkSummary.regexp ?? []), ...(checks.regexp ?? [])]
    expect(rules.length).toBeGreaterThan(0)
    for (const rule of rules) expect(dict.regexp).toContain(rule)
  })

  it.each([
    ['1 failing, 2 skipped, and 15 successful checks', '检查'],
    ['Successful in 41s', '成功']
  ])('存储库首页最新提交的检查弹层：%s', (text, word) => {
    const expected = commitsTranslation(text)
    expect(translate(text)).toBe(expected)
    expect(expected).toContain(word)
  })

  it.each(['In progress', 'Skipped', 'Expected', 'Successful', 'Failing', 'Timed out', 'Pending'])(
    '检查弹层的单独状态词与提交页同译：%s',
    text => {
      expect(translate(text)).toBe(commitsTranslation(text))
    }
  )

  it('检查弹层的 Pending 按检查状态译为「挂起」（commits/checks 的页面词条）', () => {
    expect(translate('Pending')).toBe('挂起')
  })

  it('commits/checks 的页面词条在代码页全部生效', () => {
    const entries = Object.entries(checks.scoped ?? {})
    expect(entries.length).toBeGreaterThan(0)
    for (const [text, expected] of entries) expect(translate(text), text).toBe(expected)
  })
})

describe('code 被 <kbd> 拆开的提示（引擎整句匹配，按 kbd 文字切分写回）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each([
    // CodeMirror 面板，kbd 是宿主的直接子元素
    [
      '编辑区焦点提示',
      'Use <kbd>Control + Shift + m</kbd> to toggle the <kbd>tab</kbd> key moving focus. Alternatively, use <kbd>esc</kbd> then <kbd>tab</kbd> to move to the next interactive element on the page.',
      '使用 Control + Shift + m 切换 tab 键是否移动焦点。也可以按 esc 再按 tab 移到页面上的下一个交互元素。'
    ],
    // lit-html 渲染，片段间有注释节点；macOS 多一个快捷键
    [
      '自动补全提示',
      '\n  Use <kbd>Control + Space</kbd>\n  <!--?lit$1$--><!----> to trigger autocomplete in most situations.\n',
      '使用 Control + Space 可在大多数情况下触发自动补全。'
    ],
    [
      '自动补全提示（macOS）',
      '\n  Use <kbd>Control + Space</kbd>\n  <!--?lit$1$-->or <kbd>Option + Space</kbd><!----> to trigger autocomplete in most situations.\n',
      '使用 Control + Space 或 Option + Space 可在大多数情况下触发自动补全。'
    ],
    ['占位符提示', ' Use <kbd>Tab</kbd> to navigate to the next placeholder. ', '使用 Tab 可跳到下一个占位符。'],
    ['文件内查找提示', "Press <kbd>Ctrl F</kbd> again to open the browser's find menu", '再次按 Ctrl F 打开浏览器的查找菜单']
  ])('%s', (_, html, expected) => {
    document.body.innerHTML = `<div id="hint">${html}</div>`
    const hint = document.getElementById('hint')!
    const keys = [...hint.querySelectorAll('kbd')].map(kbd => kbd.textContent)
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(hint.textContent?.replace(/\s+/g, ' ').trim()).toBe(expected)
    expect([...hint.querySelectorAll('kbd')].map(kbd => kbd.textContent)).toEqual(keys)
  })
})

describe('code 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('忽略选择器与属性规则选择器不依赖 aria-label 的取值', () => {
    const selectors = [...(dict.ignore ?? []), ...(dict.attributeRules ?? []).map(([selector]) => selector)]
    expect(selectors.filter(selector => /\[aria-label[~|^$*]?=/.test(selector))).toEqual([])
  })

  it('选择器只对代码页生效', () => {
    const own = dict.ignore ?? []
    expect(matcher.ignoreSelectors(SCOPE)).toEqual(own)
    expect(matcher.ignoreSelectors(['common', 'repository', 'issues'])).toEqual([])
  })

  it('用户内容被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <nav data-testid="breadcrumbs">
        <h2>Breadcrumbs</h2>
        <ol><li><a href="/o/r">repo-name</a></li><li><a class="directoryLink__x1">dir-name</a></li></ol>
      </nav>
      <section>
        <h3>Outline</h3>
        <a><div class="TocLevel2__x2">Readme heading</div></a>
      </section>
      <div class="treeContent__x3"><span>symbolName</span></div>
      <a class="jumpToLink__x4">jumpSymbol</a>
      <h3 class="definitionHeader__x5">definitionSymbol</h3>
      <div class="codeContainer__x6">const referenceCode = 1</div>
      <div class="fileHeader__x7"><div class="repoName__x8">other-repo</div><button>In this file</button></div>
      <table><tbody><tr><td class="react-csv-cell">csv-value</td></tr></tbody></table>
      <div class="templateWrapper__x9">
        <table><thead><tr><th class="tableCell__y1">Labels</th></tr></thead>
        <tbody><tr><td class="tableCell__y1">template-labels</td></tr></tbody></table>
        <div><label>template-input-label</label></div>
      </div>
      <label class="fileCheckboxLabel__y2">changed/file.ts</label>
      <a href="#diff-entry-0">deleted/file.ts</a>
      <div class="diffContentCollapsed__y3">deleted-line</div>
      <div class="cm-tooltip-autocomplete"><li>completion</li></div>
      <ul><li class="envItem__y4"><a class="label__y5">env-name</a><span>inactive</span></li></ul>
      <virtual-filter-input><div><span class="bold"><a href="/o/r">finder-repo</a></span> /</div></virtual-filter-input>
      <ul><li><a class="contributorLink__z1"><span>contributor-login</span></a><a>12 commits</a></li></ul>
      <div class="js-manifest-file-list-root">
        <div class="js-manifest-file-entry Box-row">
          <div class="js-filename">uploaded-name.py</div>
          <button>Remove this file</button>
        </div>
      </div>
      <div class="js-upload-meter-text">
        <div class="js-upload-meter-filename">uploading-name.py</div>
        <div>Uploading files</div>
      </div>
      <div data-testid="editor-side-panel">
        <h2 class="SectionHeader__a1">Featured actions</h2>
        <ul><li class="prc-ActionList-ActionListItem-So4vC">
          <span class="prc-ActionList-ItemLabel-81ohH">marketplace-action<span class="Owner__b2"> by action-owner</span></span>
          <span class="prc-ActionList-Description-Z-EZJ">marketplace-description</span>
        </li></ul>
        <nav><ol><li><button>Marketplace</button></li>
          <li><span aria-current="page"><span class="prc-Truncate-Truncate-2G1eo" title="detail-crumb">detail-crumb</span></span></li></ol></nav>
        <h2 class="prc-Heading-Heading-MtWFE" data-variant="small" data-component="Heading">detail-name</h2>
        <span class="text-small fgColor-muted">by <span>detail-owner</span></span>
        <div class="fgColor-muted">detail-description</div>
        <h3 class="prc-Heading-Heading-MtWFE" data-variant="small" data-component="Heading">Installation</h3>
        <div class="text-small fgColor-muted">Copy and paste the following snippet into your <span class="text-mono">.yml</span> file.</div>
      </div>
      <button>Blame</button>`

    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      if (!element) throw new Error(`找不到元素：${text}`)
      return Boolean(element.closest(selector))
    }
    for (const text of [
      'repo-name',
      'dir-name',
      'Readme heading',
      'symbolName',
      'jumpSymbol',
      'definitionSymbol',
      'const referenceCode = 1',
      'other-repo',
      'csv-value',
      'template-labels',
      'template-input-label',
      'changed/file.ts',
      'deleted/file.ts',
      'deleted-line',
      'completion',
      'env-name',
      'finder-repo',
      'contributor-login',
      'uploaded-name.py',
      'uploading-name.py',
      'marketplace-description',
      'detail-crumb',
      'detail-name',
      'detail-owner',
      'detail-description'
    ]) {
      expect(ignored(text), text).toBe(true)
    }
    for (const text of [
      'Breadcrumbs',
      'Outline',
      'In this file',
      'Labels',
      'inactive',
      '12 commits',
      'Remove this file',
      'Uploading files',
      'Featured actions',
      'Marketplace',
      'Installation',
      'Blame'
    ]) {
      expect(ignored(text), text).toBe(false)
    }
    // Marketplace 搜索结果的名称与作者在同一标签内，整体忽略
    expect(document.querySelector('[class*="Owner__"]')?.closest(selector)).not.toBeNull()
    // 安装说明保留翻译
    expect(document.querySelector('.text-small.fgColor-muted:not(span)')?.closest(selector)).toBeNull()
  })

  it('文件树子目录列表：aria-label 是目录名，加载完成后忽略；加载中、有截断提示时保留界面文字', () => {
    document.body.innerHTML = `
      <div data-testid="repos-file-tree-container"><nav><ul role="tree">
        <li id="Settings-item"><span class="PRIVATE_TreeView-item-content-text">Settings</span>
          <ul role="group" aria-label="Settings" id="loaded"><li id="Settings/a.ts-item"><span>a.ts</span></li></ul></li>
        <li id="Assets-item"><ul role="group" aria-label="Assets" id="loading">
          <li data-loading="true"><span>Loading...</span></li></ul></li>
        <li id="big-item"><ul role="group" aria-label="big" id="truncated">
          <li id="error-tree-row"><div>1,234 entries not shown</div></li></ul></li>
      </ul></nav></div>
      <ul role="group" aria-label="Elsewhere" id="outside"><li>item</li></ul>`
    const selector = (dict.ignore ?? []).join(', ')
    const ignoredById = (id: string): boolean => document.getElementById(id)?.closest(selector) !== null
    expect(ignoredById('loaded')).toBe(true)
    expect(ignoredById('loading')).toBe(false)
    expect(ignoredById('truncated')).toBe(false)
    expect(ignoredById('outside')).toBe(false)
  })
})

/** 目录列表的一行（每行按窄屏、宽屏各渲染一次文件名单元格；结构取自 .harvest/scratch/code/tree.html） */
function directoryRow(id: string, link: string): string {
  const cell = (screen: string): string =>
    `<td class="react-directory-row-name-cell-${screen}-screen"><div class="react-directory-filename-column">` +
    '<svg aria-hidden="true" class="octicon octicon-file-directory-fill icon-directory" viewBox="0 0 16 16"><path d="M1.75 1"></path></svg>' +
    `<div class="overflow-hidden"><div class="react-directory-filename-cell"><div class="react-directory-truncate">${link.replace('id=""', `id="${id}-${screen}"`)}</div></div></div></div></td>`
  return `<tr class="react-directory-row">${cell('small')}${cell('large')}<td class="react-directory-row-commit-cell"><div class="react-directory-commit-message"><a href="/octo-org/hello-world/commit/0ff253b">Sample text</a></div></td></tr>`
}

/** 目录列表（存储库目录页 /octo-org/hello-world/tree/main/packages） */
const DIRECTORY_LISTING =
  '<table aria-labelledby="folders-and-files"><tbody>' +
  directoryRow(
    'dir',
    '<a id="" title="Tasks" aria-label="Tasks, (Directory)" class="Link--primary" href="/octo-org/hello-world/tree/main/packages/Tasks">Tasks</a>'
  ) +
  directoryRow(
    'file',
    '<a id="" title="README.md" aria-label="README.md, (File)" class="Link--primary" href="/octo-org/hello-world/blob/main/packages/README.md">README.md</a>'
  ) +
  directoryRow(
    'submodule',
    '<a id="" title="vendor" aria-label="vendor, (Submodule)" class="Link--primary" href="/octo-org/vendor/tree/0ff253b">vendor</a>'
  ) +
  directoryRow(
    'symlink',
    '<a id="" title="current" aria-label="current, (Symlink to directory)" class="Link--primary" href="/octo-org/hello-world/tree/main/packages/current">current</a>'
  ) +
  directoryRow(
    'merged',
    '<a id="" title="This path skips through empty directories" aria-label=".licenses/npm, (Directory)" class="Link--primary" href="/octo-org/hello-world/tree/main/packages/.licenses/npm">' +
      '<span class="react-directory-default-color" data-testid="path-name-segment">.licenses/</span><span class="" data-testid="path-name-segment">npm</span></a>'
  ) +
  '</tbody></table>'

describe('code 目录列表文件名链接（忽略区域根元素的属性按规则改写，文字不动）', () => {
  /** 代码页的作用域含 repository：合并路径链接的 title 由 repository 词典的全站词条翻译 */
  const fullMatcher = createMatcher([
    ['repository', repository],
    ['code', code]
  ])
  let translator: Translator | undefined

  function attribute(id: string, name: string): string | null {
    return document.getElementById(id)?.getAttribute(name) ?? null
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('普通文件名链接整段忽略：aria-label 改写为「<名称>（类型）」，名称、title 与链接文字保持原文，停止后还原', () => {
    // 存储库首页与目录页用同一组件，两者的作用域都含 code，属性规则在两处都生效
    for (const path of ['/octo-org/hello-world', '/octo-org/hello-world/tree/main/packages']) {
      expect(detectPages(new URL(`https://github.com${path}`))).toEqual(SCOPE)
    }
    document.body.innerHTML = DIRECTORY_LISTING
    // 目录名 Tasks 与本词典的页面词条同形，整段忽略后不会被译成「任务」
    expect(translate('Tasks')).toBe('任务')
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => SCOPE,
      collectUntranslated: true
    })
    translator.start()
    for (const screen of ['small', 'large']) {
      expect(document.getElementById(`dir-${screen}`)?.textContent).toBe('Tasks')
      expect(attribute(`dir-${screen}`, 'aria-label')).toBe('Tasks（目录）')
      expect(attribute(`dir-${screen}`, 'title')).toBe('Tasks')
      expect(attribute(`file-${screen}`, 'aria-label')).toBe('README.md（文件）')
      expect(attribute(`submodule-${screen}`, 'aria-label')).toBe('vendor（子模块）')
      expect(attribute(`symlink-${screen}`, 'aria-label')).toBe('current（指向目录的符号链接）')
      expect(document.getElementById(`file-${screen}`)?.textContent).toBe('README.md')
    }
    const untranslated = translator.drainUntranslated().map(([text]) => text)
    for (const text of ['Tasks', 'README.md', 'Tasks, (Directory)', 'README.md, (File)']) {
      expect(untranslated).not.toContain(text)
    }
    translator.stop()
    translator = undefined
    expect(attribute('dir-small', 'aria-label')).toBe('Tasks, (Directory)')
    expect(attribute('file-large', 'aria-label')).toBe('README.md, (File)')
  })

  it('合并显示的空目录路径：只忽略路径片段，aria-label 按同一规则改写，title 译出', () => {
    document.body.innerHTML = DIRECTORY_LISTING
    translator = createTranslator({ matcher: fullMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    for (const screen of ['small', 'large']) {
      const link = document.getElementById(`merged-${screen}`)!
      expect(link.getAttribute('aria-label')).toBe('.licenses/npm（目录）')
      expect(link.getAttribute('title')).toBe('此路径跳过了空目录')
      expect([...link.querySelectorAll('[data-testid="path-name-segment"]')].map(span => span.textContent)).toEqual(['.licenses/', 'npm'])
    }
  })

  it('属性规则只在含 code 作用域的页面生效（存储库首页与目录页都含 code）：其他页面类型的同结构链接 aria-label 保持原文', () => {
    document.body.innerHTML = DIRECTORY_LISTING
    translator = createTranslator({ matcher, host: window, resolvePages: () => ['common', 'repository', 'issues'] })
    translator.start()
    expect(attribute('dir-small', 'aria-label')).toBe('Tasks, (Directory)')
    expect(attribute('file-large', 'aria-label')).toBe('README.md, (File)')
  })

  it('五种类型的改写结果与 repository 词典文件列表行无障碍名称的正则一致（两处的类型译名须同步）', () => {
    const types = ['Directory', 'File', 'Submodule', 'Symlink to directory', 'Symlink to file']
    const repositoryMatcher = createMatcher([['repository', repository]])
    document.body.innerHTML = `<table><tbody>${types
      .map((type, index) =>
        directoryRow(
          `type${index}`,
          `<a id="" title="Sample" aria-label="Sample, (${type})" class="Link--primary" href="/octo-org/hello-world/tree/main/Sample">Sample</a>`
        )
      )
      .join('')}</tbody></table>`
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    types.forEach((type, index) => {
      const label = `Sample, (${type})`
      const expected = repositoryMatcher.translate(label, ['common', 'repository'])
      expect(expected, type).toMatch(/^Sample（[一-鿿]+）$/)
      expect(attribute(`type${index}-small`, 'aria-label'), type).toBe(expected)
    })
  })
})

describe('code 提交对话框的签署说明（被链接拆开的整句，邮箱作身份提到动词之前）', () => {
  let translator: Translator | undefined

  /** 元素的直接子文本节点 */
  function ownTexts(element: Element): string[] {
    return [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => (node as Text).data)
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('多个提交邮箱：Choose an email address for <signing off> on this commit', () => {
    // React 把 {' '} 渲染成单独的文本节点（WebCommitDialog：FormControl.Caption）
    document.body.innerHTML =
      '<span id="caption" class="prc-FormControl-Caption-abc">Choose an email address for <a href="/docs" target="_blank" rel="noreferrer" class="prc-Link-Link-9ZwDx">signing off</a> on this commit</span>'
    const caption = document.getElementById('caption')!
    const [first, , last] = caption.childNodes
    ;(first as Text).splitText('Choose an email address for'.length)
    ;(last as Text).splitText(1)
    expect(caption.childNodes).toHaveLength(5)
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE, collectUntranslated: true })
    translator.start()
    expect(caption.textContent).toBe('选择用于签署此提交的电子邮件地址')
    expect(caption.querySelector('a')?.textContent).toBe('签署')
    expect(ownTexts(caption).filter(Boolean)).toEqual(['选择用于', '此提交的电子邮件地址'])
    expect(translator.drainUntranslated()).toEqual([])
  })

  it('单个提交邮箱：You are <signing off> on this commit as <邮箱>', () => {
    // children: ["You are", " ", <a>, " ", "on this commit as ", email]
    document.body.innerHTML =
      '<div id="signoff" class="commitEmailFormControl-abc">You are <a href="/docs" target="_blank" rel="noreferrer" class="prc-Link-Link-9ZwDx">signing off</a> on this commit as octocat@example.com</div>'
    const host = document.getElementById('signoff')!
    const [first, , last] = host.childNodes
    ;(first as Text).splitText('You are'.length)
    ;(last as Text).splitText(1).splitText('on this commit as '.length)
    expect(host.childNodes).toHaveLength(6)
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE, collectUntranslated: true })
    translator.start()
    expect(host.textContent).toBe('你正在以 octocat@example.com 的身份签署此提交')
    expect(host.querySelector('a')?.textContent).toBe('签署')
    expect(translator.drainUntranslated()).toEqual([])
    translator.stop()
    translator = undefined
    expect(host.textContent).toBe('You are signing off on this commit as octocat@example.com')
  })

  it('整句未命中时各片段单独翻译（原文无标点，译文不加逗号、冒号）', () => {
    expect(translate('You are')).toBe('你正在')
    expect(translate('signing off')).toBe('签署')
    expect(translate('on this commit as octocat@example.com')).toBe('此提交并署名为 octocat@example.com')
    expect(translate('Choose an email address for')).toBe('选择用于')
    expect(translate('on this commit')).toBe('此提交的电子邮件地址')
  })
})

describe('code 复刻编辑横幅（被 <b> 拆开的整句，复刻名提到「新分支」之前）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /**
   * EditingForkBanner：<Flash aria-live="polite">[句子, <b>owner/repo</b>, 「, so you can send a pull request」, 「.」]</Flash>，
   * React 把各段字符串渲染成单独的文本节点；不能创建拉取请求时没有中间一段
   */
  function forkBanner(canCreatePullRequest: boolean): HTMLElement {
    const tail = canCreatePullRequest ? ', so you can send a pull request.' : '.'
    document.body.innerHTML = `<div id="fork-banner" aria-live="polite" class="Banner__x1 flash-warn">You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork <b>octocat/hello-world</b>${tail}</div>`
    const banner = document.getElementById('fork-banner')!
    if (canCreatePullRequest) (banner.lastChild as Text).splitText(', so you can send a pull request'.length)
    return banner
  }

  it.each([
    [true, '你正在更改没有写入访问权限的项目。提交的更改将写入你的复刻 octocat/hello-world 中的新分支，之后可发送拉取请求。'],
    [false, '你正在更改没有写入访问权限的项目。提交的更改将写入你的复刻 octocat/hello-world 中的新分支。']
  ])('可创建拉取请求：%s', (canCreatePullRequest, expected) => {
    const banner = forkBanner(canCreatePullRequest)
    const original = banner.textContent
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(banner.textContent).toBe(expected)
    expect(banner.querySelector('b')?.textContent).toBe('octocat/hello-world')
    translator.stop()
    translator = undefined
    expect(banner.textContent).toBe(original)
  })
})

describe('code 含链接的许可证说明（许可证选择页 div.VerifiedHTMLBox__*，HTML 取自 choosealicense.com 数据）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each([
    [
      'BSD 3-Clause：链接文字（许可证名）译出，以中文结尾，其后不留空格',
      'A permissive license similar to the <a href="/licenses/bsd-2-clause/">BSD 2-Clause License</a>, but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.',
      '一种类似于 BSD 2-Clause 许可证的宽松许可证，但增加的第三条禁止他人未经书面同意使用版权所有者或其贡献者的名义推广衍生产品。'
    ],
    [
      'BSD 3-Clause Clear：定语提到链接之前，不加逗号',
      'A variant of the <a href="/licenses/bsd-3-clause/">BSD 3-Clause License</a> that explicitly does not grant any patent rights.',
      '一种明确不授予任何专利权的 BSD 3-Clause 许可证变体。'
    ],
    [
      'EUPL 1.2：不加逗号，链接后的中文不留空格',
      'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in <a href="https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12">23 official languages</a> of the European Union.',
      '欧盟公共许可证 (EUPL) 是由欧盟委员会发起并以欧盟 23 种官方语言版本批准的 Copyleft 自由/开源软件许可证。'
    ],
    [
      'CC BY-SA 4.0：「兼容」两侧不留空格',
      'Similar to <a href="/licenses/cc-by-4.0/">CC-BY-4.0</a> but requires derivatives be distributed under the same or a similar, <a href="https://creativecommons.org/compatiblelicenses">compatible</a> license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.',
      '类似于 CC-BY-4.0 但要求衍生作品以相同或类似的兼容许可证分发。常用于媒体资源和教育材料。其旧版本是维基百科等维基媒体项目的默认许可证。不建议用于软件。'
    ]
  ])('%s', (_, html, expected) => {
    // 许可证卡片：<div class="Box_2__…">[标题区, <VerifiedHTMLBox html={description}>]</div>，说明 HTML 是宿主的直接子节点
    document.body.innerHTML = `<div class="Box_2__M8iAnv"><div id="description" class="VerifiedHTMLBox__4GHziY">${html}</div></div>`
    const host = document.getElementById('description')!
    const hrefs = [...host.querySelectorAll('a')].map(link => link.getAttribute('href'))
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(host.textContent).toBe(expected)
    expect([...host.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(hrefs)
    translator.stop()
    translator = undefined
    expect(host.innerHTML).toBe(html)
  })

  it('整句未命中时片段照常翻译（原文没有的逗号不加）', () => {
    expect(
      translate(
        'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in'
      )
    ).toBe('欧盟公共许可证 (EUPL) 是由欧盟委员会发起并以欧盟')
    expect(translate('of the European Union.')).toBe('版本批准的 Copyleft 自由/开源软件许可证。')
    expect(translate('but requires derivatives be distributed under the same or a similar,')).toBe('但要求衍生作品以相同或类似的')
  })
})

describe('code 标点随原文、产品名译中文（本组各子文件）', () => {
  const OWN: readonly PageDictionary[] = [tree, blob, banners, licenses, edit, templates]

  /** [名称, 原文中的该类标点, 译文中的该类标点]：原文没有的，译文也不加 */
  const KINDS: readonly (readonly [string, RegExp, RegExp])[] = [
    ['逗号', /[,，]/, /[，、,]/],
    ['冒号', /[:：]/, /[：:]/],
    ['引号', /["“”]/, /[“”"]/],
    ['分号', /[;；]/, /[；;]/],
    ['括号', /[()（）]/, /[（）()]/]
  ]

  /**
   * 已知例外：推送保护 <Link>Remove any detected secrets</Link>{' '}<span>from your commit and commit history.</span>
   * （AllowSecretBody.tsx）。两段各在一个元素内，行内句只能改元素之间的文字，调不了语序；
   * 地点状语只能写在链接之后，用括号补出（没有不加标点的通顺写法）
   */
  const EXCEPTIONS: ReadonlySet<string> = new Set(['from your commit and commit history.'])

  /** REGEXP_CASES 中本组规则的正例（合并顺序 tree → blob → banners → licenses（无正则）→ edit → templates 在前，commits 的规则在后） */
  const OWN_HITS = REGEXP_CASES.slice(
    0,
    OWN.reduce((count, part) => count + (part.regexp?.length ?? 0), 0)
  ).flatMap(item => item.hits)

  /** 原文没有、译文却有的标点 */
  function extraPunctuation(entries: readonly (readonly [string, string])[]): string[] {
    return entries.flatMap(([source, translation]) =>
      EXCEPTIONS.has(source)
        ? []
        : KINDS.filter(([, inSource, inTranslation]) => !inSource.test(source) && inTranslation.test(translation)).map(
            ([name]) => `${name}：${source} → ${translation}`
          )
    )
  }

  it('静态、页面词条与字符串行内句的译文不加原文没有的逗号、冒号、引号、分号、括号', () => {
    const entries = OWN.flatMap(part => [
      ...Object.entries(part.static ?? {}),
      ...Object.entries(part.scoped ?? {}),
      ...(part.inline ?? []).flatMap(([pattern, translation]) =>
        typeof pattern === 'string' && typeof translation === 'string' ? [[pattern, translation] as const] : []
      )
    ])
    expect(extraPunctuation(entries)).toEqual([])
  })

  it('正则与函数的输出同样不加原文没有的标点（本组规则的全部正例）', () => {
    expect(OWN_HITS.length).toBeGreaterThan(0)
    expect(extraPunctuation(OWN_HITS)).toEqual([])
  })

  it('产品名、方案名按 product-names.md 译出：译文不再保留英文 Marketplace、Codespaces、GitHub Team 等', () => {
    const values = [
      ...OWN.flatMap(part => [
        ...Object.values(part.static ?? {}),
        ...Object.values(part.scoped ?? {}),
        ...(part.inline ?? []).flatMap(([, translation]) => (typeof translation === 'string' ? [translation] : []))
      ]),
      ...OWN_HITS.map(([, expected]) => expected)
    ]
    const leftovers = values.filter(value =>
      /\b(?:Marketplace|Codespaces?|Sponsors|GitHub (?:Actions|Pro|Team|Enterprise)|Copilot (?:Business|Enterprise|Chat))\b|“Actions”/.test(
        value
      )
    )
    expect(leftovers).toEqual([])
  })
})
