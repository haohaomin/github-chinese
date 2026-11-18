import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import commits from '../../../src/locales/zh-CN/commits'
import checkSummary from '../../../src/locales/zh-CN/commits/check-summary'
import { formatDate } from '../../../src/locales/zh-CN/helpers'
import commitsTW from '../../../src/locales/zh-TW/commits'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = commits

const matcher = createMatcher([['commits', commits]])

/** 提交、分支、活动页的作用域：common → repository → commits */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'commits']
/** 比较页的作用域另含 pulls */
const COMPARE_SCOPE: readonly PageKey[] = ['common', 'repository', 'commits', 'pulls']

function translate(text: string): string | undefined {
  return matcher.translate(text, [...SCOPE])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/**
 * 按词典中的正则顺序排列（list → check-summary → checks → date-picker → commit → diff → branches → activity → compare），
 * 每条正则至少一个正例、一个反例
 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 提交列表：日期分组标题
  {
    hits: [
      ['Commits on Jan 5, 2024', `${formatDate(2024, 1, 5)}的提交`],
      ['Commits on Oct 23, 2026', `${formatDate(2026, 10, 23)}的提交`]
    ],
    misses: ['Commits on yesterday']
  },
  {
    hits: [
      ['Copy full SHA for 0ff253b', '复制 0ff253b 的完整 SHA'],
      ['Copy full SHA for 0ff253b2c1a4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', '复制 0ff253b2c1a4e5f6a7b8c9d0e1f2a3b4c5d6e7f8 的完整 SHA']
    ],
    misses: ['Copy full SHA for main']
  },
  {
    hits: [
      ['Show description for 0ff253b', '显示 0ff253b 的描述'],
      ['Hide description for 0ff253b', '隐藏 0ff253b 的描述']
    ],
    misses: ['Show description for feature']
  },
  {
    hits: [
      ['View 3 commit comments', '查看 3 条提交评论'],
      ['View 1 commit comment', '查看 1 条提交评论']
    ],
    misses: ['View commit comments']
  },
  { hits: [['2 people', '2 人']], misses: ['people'] },
  { hits: [['Show 3 authors', '显示 3 个作者']], misses: ['Show authors'] },
  { hits: [['3 authors', '3 个作者']], misses: ['1 author'] },
  // 组织作者链接
  {
    hits: [
      ["octo-org's org home page", 'octo-org 的组织主页'],
      ['octo-org’s org home page', 'octo-org 的组织主页']
    ],
    misses: ['octo-org org home page']
  },
  // 提交消息中的关闭关键字提示
  {
    hits: [
      ['This commit closes issue #12.', '此提交关闭议题 #12。'],
      ['This commit fixes pull request octo-org/hello-world#123.', '此提交关闭拉取请求 octo-org/hello-world#123。'],
      ['This commit resolves issue #7.', '此提交关闭议题 #7。']
    ],
    misses: ['This commit closes issue 12.', 'This commit references issue #12.']
  },
  // 文件历史
  {
    hits: [['History for src/index.ts - octo-org/hello-world', 'src/index.ts 的历史记录 - octo-org/hello-world']],
    misses: ['History for src/index.ts']
  },
  { hits: [['Renamed to src/new.ts', '已重命名为 src/new.ts']], misses: ['Renamed'] },
  { hits: [['Renamed from src/old.ts', '重命名自 src/old.ts']], misses: ['Renamed from'] },
  // 签名弹层
  {
    hits: [
      ['verified: 0ff253b', '已验证：0ff253b'],
      ['unverified: 0ff253b', '未验证：0ff253b'],
      ['partially verified: 0ff253b', '部分验证：0ff253b']
    ],
    misses: ['verified: main']
  },
  { hits: [['Verification error: 0ff253b', '验证错误：0ff253b']], misses: ['Verification error: main'] },
  {
    hits: [
      ['Upload your public signing GPG key', '上传你的 GPG 签名公钥'],
      ['Upload your public signing SSH key', '上传你的 SSH 签名公钥']
    ],
    misses: ['Upload your public signing key']
  },
  {
    hits: [
      ['’s contribution has been verified via SSH key.', '的贡献已通过 SSH 密钥验证。'],
      ["'s contribution has been verified via GPG key.", '的贡献已通过 GPG 密钥验证。']
    ],
    misses: ['’s contribution has been verified.']
  },
  // 提交回顾：规模标签
  {
    hits: [
      ['size: M', '规模：M'],
      ['size: XL', '规模：XL']
    ],
    misses: ['size: XXL']
  },
  {
    hits: [
      ['12 results', '12 个结果'],
      ['1 result', '1 个结果'],
      ['1,234 results', '1,234 个结果']
    ],
    misses: ['results']
  },
  {
    hits: [
      ['docs: update README (#123). More information available below.', 'docs: update README (#123)。更多信息见下方。'],
      ['release: v1.2.3. More information available below.', 'release: v1.2.3。更多信息见下方。']
    ],
    misses: ['More information available below.']
  },
  // 检查汇总与耗时（check-summary.ts）
  {
    hits: [
      ['1 failing, 2 skipped, and 15 successful checks', '1 个检查失败、2 个已跳过、15 个成功'],
      ['1 failing and 1 successful check', '1 个检查失败和 1 个成功'],
      ['3 successful checks', '3 个检查成功'],
      ['2 in progress, 1 queued checks', '2 个检查正在进行、1 个已排队'],
      ['1 neutral, 1 timed out, and 2 pending checks', '1 个检查中性、1 个已超时、2 个挂起']
    ],
    misses: ['1 failing, 2 unknown checks']
  },
  {
    hits: [
      ['3 checks', '3 个检查'],
      ['1 check', '1 个检查']
    ],
    misses: ['checks']
  },
  {
    hits: [
      ['Successful in 41s', '成功用时 41秒'],
      ['Successful in 1m 30s', '成功用时 1分钟 30秒'],
      ['Success in 2m', '成功用时 2分钟'],
      ['Completed in 2h 5m', '完成用时 2小时 5分钟']
    ],
    misses: ['Successful in a minute']
  },
  {
    hits: [
      ['Failing after 2m 5s', '2分钟 5秒后失败'],
      ['Failed after 1h 2m 3s', '1小时 2分钟 3秒后失败'],
      ['Cancelled after 12s', '12秒后取消'],
      ['Canceled after 3m', '3分钟后取消'],
      ['Timed out after 6h', '6小时后超时'],
      ['Startup failure after 1s', '1秒后启动失败']
    ],
    misses: ['Failing after retry', 'Failed after']
  },
  // 检查弹层（checks.ts）
  {
    hits: [
      ['2 workflows awaiting approval', '2 个工作流等待批准'],
      ['1 workflow awaiting approval', '1 个工作流等待批准']
    ],
    misses: ['workflows awaiting approval']
  },
  // 日期范围选择器（date-picker.ts）
  {
    hits: [
      ['Oct 1 - Oct 26', `${formatDate(undefined, 10, 1)} - ${formatDate(undefined, 10, 26)}`],
      ['Dec 1, 2025 - Jan 5, 2026', `${formatDate(2025, 12, 1)} - ${formatDate(2026, 1, 5)}`]
    ],
    misses: ['Oct 1 - yesterday']
  },
  { hits: [['Oct 1 -', `${formatDate(undefined, 10, 1)} -`]], misses: ['yesterday -'] },
  {
    hits: [
      ['Week 1', '第 1 周'],
      ['Week 6', '第 6 周']
    ],
    misses: ['Week 12']
  },
  {
    hits: [
      ['Monday, October 26', `${formatDate(undefined, 10, 26)}星期一`],
      ['Monday, October 26 (Today)', `${formatDate(undefined, 10, 26)}星期一（今天）`],
      [
        'Sunday, Nov 1 (Start of selected range) (Maximum allowed date)',
        `${formatDate(undefined, 11, 1)}星期日（所选范围开始）（允许的最晚日期）`
      ]
    ],
    misses: ['Monday, October 26 (Holiday)', 'Funday, October 26']
  },
  {
    hits: [['Must be on or after Oct 1, 2025', `不能早于 ${formatDate(2025, 10, 1)}`]],
    misses: ['Must be on or after yesterday']
  },
  {
    hits: [['Must be on or before Oct 26, 2026', `不能晚于 ${formatDate(2026, 10, 26)}`]],
    misses: ['Must be on or before yesterday']
  },
  // 提交详情页（commit.ts）
  {
    hits: [
      ['2 parents', '2 个父提交'],
      ['1 parent', '1 个父提交']
    ],
    misses: ['parents']
  },
  { hits: [['3 tags', '3 个标签']], misses: ['1 tag'] },
  {
    hits: [
      ['2 files changed', '已更改 2 个文件'],
      ['1 file changed', '已更改 1 个文件']
    ],
    misses: ['files changed']
  },
  {
    hits: [
      ['3 commit comments', '3 条提交评论'],
      ['1 commit comment', '1 条提交评论']
    ],
    misses: ['no commit comments']
  },
  {
    hits: [
      ['0 comments on commit', '0 条提交评论'],
      ['1 comment on commit', '1 条提交评论']
    ],
    misses: ['comments on commit']
  },
  { hits: [['3 comments on commit 0ff253b', '提交 0ff253b 的 3 条评论']], misses: ['3 comments on commit main'] },
  { hits: [['Comments on commit 0ff253b', '提交 0ff253b 的评论']], misses: ['Comments on commit main'] },
  {
    hits: [['Only the first 50 replies are currently being shown.', '当前仅显示前 50 条回复。']],
    misses: ['Only the first replies are currently being shown.']
  },
  { hits: [['Reply 2 to Comment 1', '评论 1 的第 2 条回复']], misses: ['Reply to Comment 1'] },
  { hits: [['Reply 3', '第 3 条回复']], misses: ['Reply #3'] },
  { hits: [['Comment 5', '第 5 条评论']], misses: ['Comment #5'] },
  // 过时评论线程的差异预览标题
  {
    hits: [
      ['Line +12, commit', '第 +12 行，提交'],
      ['Line -3 to +5, commit', '第 -3 至 +5 行，提交']
    ],
    misses: ['Line +12, commits']
  },
  // 应用建议对话框：提交失败
  {
    hits: [['There was an error trying to commit changes: Head branch was modified.', '提交更改时出错：Head branch was modified.']],
    misses: ['There was an error trying to commit changes:']
  },
  // 差异视图（diff.ts）：原文无逗号，译文不加（& 译“和”）
  {
    hits: [['Lines changed: 10 additions & 2 deletions', '更改行数：新增 10 行和删除 2 行']],
    misses: ['Lines changed: none']
  },
  {
    hits: [
      ['12 changes: 10 additions & 2 deletions', '12 处更改：新增 10 行和删除 2 行'],
      ['1 change: 1 addition & 0 deletions', '1 处更改：新增 1 行和删除 0 行']
    ],
    misses: ['12 changes']
  },
  {
    hits: [
      [
        'Showing 698 changed files with 199,850 additions and 8,959 deletions.',
        '显示包含新增 199,850 行和删除 8,959 行的 698 个已更改的文件。'
      ],
      ['Showing 1 changed file with 1 addition and 0 deletions.', '显示包含新增 1 行和删除 0 行的 1 个已更改的文件。']
    ],
    misses: ['Showing 698 changed files']
  },
  {
    hits: [
      ['698 changed files', '698 个已更改的文件'],
      ['1 changed file', '1 个已更改的文件']
    ],
    misses: ['changed files']
  },
  {
    hits: [
      ['199,850 additions', '新增 199,850 行'],
      ['1 addition', '新增 1 行']
    ],
    misses: ['additions']
  },
  { hits: [['8,959 deletions', '删除 8,959 行']], misses: ['deletions'] },
  {
    hits: [['Diff for: src/a.ts renamed to src/b.ts', 'src/a.ts 重命名为 src/b.ts 的差异']],
    misses: ['Diff for:']
  },
  { hits: [['Diff for: src/index.ts', 'src/index.ts 的差异']], misses: ['Diff for'] },
  { hits: [['Expand all lines: src/index.ts', '展开所有行：src/index.ts']], misses: ['Expand all lines'] },
  {
    hits: [['Collapse non-diff lines: src/index.ts', '折叠无差异的行：src/index.ts']],
    misses: ['Collapse non-diff lines']
  },
  { hits: [['collapse file: src/index.ts', '折叠文件：src/index.ts']], misses: ['collapse file'] },
  { hits: [['src/a.ts renamed to src/b.ts', 'src/a.ts 重命名为 src/b.ts']], misses: ['renamed to src/b.ts'] },
  // 文件树条目的屏幕阅读器文字
  {
    hits: [
      ['src/app.ts has 3 comments', 'src/app.ts 有 3 条评论'],
      ['This file has 1 comment', '此文件有 1 条评论'],
      ['src/app.ts has 9+ comments and has warning annotations', 'src/app.ts 有 9+ 条评论和警告注释']
    ],
    misses: ['src/app.ts has comments']
  },
  {
    hits: [
      ['src/app.ts has failure annotations', 'src/app.ts 有失败注释'],
      ['This file has notice annotations', '此文件有提示注释']
    ],
    misses: ['src/app.ts has annotations']
  },
  { hits: [['Expand file up from line 12', '从第 12 行向上展开文件']], misses: ['Expand file up'] },
  { hits: [['Expand file down from line 30', '从第 30 行向下展开文件']], misses: ['Expand file down'] },
  { hits: [['Expand file from line 12 to line 30', '展开文件第 12 至 30 行']], misses: ['Expand file from line 12'] },
  {
    hits: [
      ['L12 selected.', '已选择 L12。'],
      ['R5 selected.', '已选择 R5。']
    ],
    misses: ['selected.']
  },
  { hits: [['L12 to L20 selected.', '已选择 L12 至 L20。']], misses: ['L12 to selected.'] },
  { hits: [['Line 12', '第 12 行']], misses: ['Line L12'] },
  { hits: [['Add a comment on line R12', '在第 R12 行添加评论']], misses: ['Add a comment on line'] },
  { hits: [['Add a comment on lines L3 to L5', '在第 L3 至 L5 行添加评论']], misses: ['Add a comment on lines'] },
  { hits: [['Comment on line R12', '评论第 R12 行']], misses: ['Comment on line twelve'] },
  { hits: [['Comment on lines R3-R5', '评论第 R3 至 R5 行']], misses: ['Comment on lines R3'] },
  // 行操作菜单（右键）
  {
    hits: [
      ['Add comment on line R12', '在第 R12 行添加评论'],
      ['Suggest change on lines R3-R5', '在第 R3 至 R5 行建议更改'],
      ['Suggest change, modified lines R3-R5', '在修改后的第 R3 至 R5 行建议更改'],
      ['Add comment, original line L7', '在原始的第 L7 行添加评论']
    ],
    misses: ['Add comment on line 12', 'Suggest change, unchanged line R3']
  },
  {
    hits: [
      ['3 files remain', '剩余 3 个文件'],
      ['1 file remains', '剩余 1 个文件']
    ],
    misses: ['files remain']
  },
  // 子模块
  {
    hits: [
      ['Submodule vendor/lib added at', '子模块 vendor/lib 添加于'],
      ['Submodule vendor/lib added at 0ff253b', '子模块 vendor/lib 添加于 0ff253b'],
      ['Submodule vendor/lib deleted from 0ff253b', '子模块 vendor/lib 删除自 0ff253b']
    ],
    misses: ['Submodule vendor/lib', 'Submodule vendor/lib added at main']
  },
  {
    hits: [
      ['Submodule vendor/lib updated', '子模块 vendor/lib 已更新'],
      ['Submodule vendor/lib updated from 0ff253b to 1a2b3c4', '子模块 vendor/lib 已从 0ff253b 更新到 1a2b3c4']
    ],
    misses: ['Submodule vendor/lib updated from main to dev']
  },
  {
    hits: [['updated from 0ff253b to 1a2b3c4', '已从 0ff253b 更新到 1a2b3c4']],
    misses: ['updated from main to dev']
  },
  { hits: [['added at 0ff253b', '添加于 0ff253b']], misses: ['added at main'] },
  { hits: [['deleted from 0ff253b', '删除自 0ff253b']], misses: ['deleted from main'] },
  { hits: [['from 0ff253b to 1a2b3c4', '从 0ff253b 到 1a2b3c4']], misses: ['from main to dev'] },
  // 分支页（branches.ts）
  {
    hits: [['Ahead and behind counts: 3 ahead, 12 behind', '领先和落后计数：领先 3，落后 12']],
    misses: ['Ahead and behind counts']
  },
  {
    hits: [
      ['Open pull request #123', '打开的拉取请求 #123'],
      ['Merged pull request #45', '已合并的拉取请求 #45'],
      ['Draft pull request #7', '草稿拉取请求 #7']
    ],
    misses: ['Open pull request']
  },
  {
    hits: [
      ["Rename branch 'feature/login'", '重命名分支“feature/login”'],
      ['Rename branch ‘main’', '重命名分支“main”']
    ],
    misses: ['Rename branch main']
  },
  {
    hits: [
      ["Your main branch isn't protected", '你的 main 分支未受保护'],
      ['Your dev branch isn’t protected', '你的 dev 分支未受保护']
    ],
    misses: ['Your branch isn’t protected']
  },
  {
    hits: [['There are 3 pull requests in the merge queue', '合并队列中有 3 个拉取请求']],
    misses: ['There are pull requests in the merge queue']
  },
  {
    hits: [
      ['12 results found', '找到 12 个结果'],
      ['1 result found', '找到 1 个结果']
    ],
    misses: ['results found']
  },
  // 重命名对话框：名称校验结果、重命名成功提示
  { hits: [['Your branch name will be feature-x', '分支名称将为 feature-x']], misses: ['Your branch name will be'] },
  {
    hits: [['Branch main will be renamed to trunk shortly.', '分支 main 即将重命名为 trunk。']],
    misses: ['Branch main will be renamed shortly.']
  },
  // 活动页（activity.ts）
  {
    hits: [
      ['Filter by time: Last week', '按时间筛选：过去一周'],
      ['Filter by time: All time', '按时间筛选：全部时间']
    ],
    misses: ['Filter by time: Yesterday']
  },
  {
    hits: [['Filter by activity type: Force pushes', '按活动类型筛选：强制推送']],
    misses: ['Filter by activity type: Tags']
  },
  {
    hits: [
      ['Filter by branch: main', '按分支筛选：main'],
      ['Filter by branch: All branches', '按分支筛选：所有分支']
    ],
    misses: ['Filter by branch:']
  },
  {
    hits: [
      ['Filter by user: octocat', '按用户筛选：octocat'],
      ['Filter by user: All users', '按用户筛选：所有用户']
    ],
    misses: ['Filter by user']
  },
  { hits: [['View octocat profile', '查看 octocat 的个人资料']], misses: ['View profile'] },
  {
    hits: [
      ['pushed 3 commits to', '推送了 3 个提交到'],
      ['pushed 1 commit to', '推送了 1 个提交到']
    ],
    misses: ['pushed commits to']
  },
  { hits: [['pushed 3 commits', '推送了 3 个提交']], misses: ['pushed commits'] },
  {
    hits: [
      ['adding 3 commits', '新增 3 个提交'],
      ['removing 2 commits', '删除 2 个提交'],
      ['removing 2 commits and adding 1 commit', '删除 2 个提交并新增 1 个提交']
    ],
    misses: ['adding commits']
  },
  {
    hits: [
      ['pushed adding 3 commits', '推送时新增 3 个提交'],
      ['force pushed removing 2 commits and adding 3 commits', '强制推送时删除 2 个提交并新增 3 个提交']
    ],
    misses: ['force pushed adding commits']
  },
  // 比较页（compare.ts）
  {
    hits: [
      ['Comparing main...feature', '比较 main...feature'],
      ['Comparing v1.0..v2.0', '比较 v1.0..v2.0']
    ],
    misses: ['Comparing main']
  },
  {
    hits: [
      ['12 contributors', '12 个贡献者'],
      ['1 contributor', '1 个贡献者']
    ],
    misses: ['contributors']
  },
  {
    hits: [
      ['This comparison is big! We’re only showing the most recent 250 commits', '此比较较大！仅显示最近 250 个提交'],
      ["This comparison is big! We're only showing the most recent 1,000 commits", '此比较较大！仅显示最近 1,000 个提交']
    ],
    misses: ['This comparison is big!']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('commits 正则词条', () => {
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
})

describe('commits 检查汇总共享模块', () => {
  it('只含正则，规则对象全部并入 commits', () => {
    expect(Object.keys(checkSummary)).toEqual(['regexp'])
    const rules = new Set(RULES)
    expect(checkSummary.regexp.filter(rule => !rules.has(rule)).map(([pattern]) => String(pattern))).toEqual([])
  })

  it('由其他页面类型合并后同样生效（存储库首页作用域不含 commits）', () => {
    const code = createMatcher([['code', checkSummary]])
    const scope: readonly PageKey[] = ['common', 'repository', 'code']
    expect(code.translate('1 failing, 2 skipped, and 15 successful checks', [...scope])).toBe('1 个检查失败、2 个已跳过、15 个成功')
    expect(code.translate('3 checks', [...scope])).toBe('3 个检查')
  })
})

describe('commits 静态词条', () => {
  it.each([
    ['Commit history', '提交历史记录'],
    ['All users', '所有用户'],
    ['View commit details', '查看提交详细信息'],
    ['Browse repository at this point', '浏览此提交时的存储库'],
    ['There isn’t any commit history to show here.', '这里没有可显示的提交历史记录。'],
    [
      'GitHub supports GPG and S/MIME signatures. We don’t know what type of signature this is.',
      'GitHub 支持 GPG 和 S/MIME 签名。无法识别此签名的类型。'
    ],
    ['Find a user...', '查找用户...'],
    ['Find a user…', '查找用户…'],
    // 签名弹层：经典版 SSH 指纹标签（与 GPG key ID: 成对）
    ['SSH key Fingerprint:', 'SSH 密钥指纹：'],
    ['Analyzing…', '分析中…'],
    ['Analyzing...', '分析中...'],
    // 原文无逗号，译文不加
    [
      'Groups together commits to cut through noise with summarized changes and linked pull requests.',
      '将提交分组并通过汇总的更改和链接的拉取请求过滤无关信息。'
    ],
    ['This commit was created on GitHub.com and signed with GitHub’s', '此提交在 GitHub.com 上创建并使用 GitHub 的'],
    // 产品名译中文：GitHub Enterprise Server → GitHub 企业服务器
    ['This commit was created on GitHub Enterprise Server and signed with a', '此提交在 GitHub 企业服务器上创建并使用'],
    ['Authenticated', '已通过身份验证'],
    ['See all checks', '查看所有检查'],
    ['Approving workflows', '正在批准工作流'],
    // 检查运行条目的说明（破折号与说明在同一文本节点）
    ['— This check has started...', '— 此检查已开始...'],
    ['Load diff', '加载差异'],
    ['Loading dependency review...', '正在加载依赖项审查...'],
    // 依赖项审查富差异；无句号的文件状态提示
    ['No dependencies changed.', '依赖项未更改。'],
    ['The changes to this file likely do not affect the dependencies', '对此文件的更改可能不影响依赖项'],
    ['File renamed without changes', '文件已重命名且内容无更改'],
    ['Left (L)', '左侧 (L)'],
    ['Comment on line', '评论行'],
    // 首句原文无逗号，译文改语序不加
    [
      'This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.',
      '此文件包含解释或编译结果可能与下方显示不同的隐藏或双向 Unicode 文本。要审查，请在能显示隐藏 Unicode 字符的编辑器中打开此文件。'
    ],
    ['It may be too large to display on GitHub.', '它可能过大而无法在 GitHub 上显示。'],
    ['Sorry, this diff is temporarily unavailable due to heavy server load.', '抱歉，此差异因服务器负载过高而暂时不可用。'],
    ['Thanks for everything, Jim.', '感谢你所做的一切，Jim。'],
    ['More suggestion batching options', '更多建议批处理选项'],
    ['There was an error trying to commit changes.', '提交更改时出错。'],
    // 「X. Please try again.」句号随原文，不并成逗号句
    ['There was an error locking this conversation. Please try again.', '锁定此对话时出错。请重试。'],
    ['There was an error unlocking this conversation. Please try again.', '解锁此对话时出错。请重试。'],
    ['We had a problem verifying this signature. Please try again later.', '验证此签名时出现问题。请稍后重试。'],
    ['We had a problem checking for revoked certificates. Please try again later.', '检查已吊销证书时出现问题。请稍后重试。'],
    ['AI-generated content may be inaccurate. Please verify important information.', 'AI 生成的内容可能不准确。请核实重要信息。'],
    ['The comment editor failed to load. Try reloading the page.', '评论编辑器加载失败。请尝试重新加载页面。'],
    // GLOSSARY：suggested change → 建议更改
    ['Suggested change cannot be the same as the original line', '建议更改不能与原始行相同'],
    ['You’re now subscribed to this thread.', '你已订阅此线程。'],
    ['Show all tags', '显示所有标签'],
    ['Loading branch information', '正在加载分支信息'],
    ['Comment on this commit', '评论此提交'],
    ['Search branches…', '搜索分支…'],
    ['Search branches...', '搜索分支...'],
    ['View more branches', '查看更多分支'],
    ['View the merge queue', '查看合并队列'],
    ['View all rules', '查看所有规则'],
    ['There is 1 pull request in the merge queue', '合并队列中有 1 个拉取请求'],
    ['Branch could not be deleted', '无法删除分支'],
    ["You can't delete this branch because it is being renamed.", '此分支因正在重命名而无法删除。'],
    // GLOSSARY：protected branch → 受保护分支
    ["You can't delete this protected branch.", '无法删除此受保护分支。'],
    ['You can’t delete this protected branch.', '无法删除此受保护分支。'],
    ['Are you sure you want to delete this branch?', '确定要删除此分支吗？'],
    ['draft releases targeting this branch.', '个以此分支为目标的发行版草稿。'],
    // 产品名译中文：GitHub Pages → GitHub 页面
    ['Show details on unpublishing GitHub Pages site', '显示取消发布 GitHub 页面站点的详细信息'],
    ['Checking if branch name is valid', '正在检查分支名称是否有效'],
    ['Direct pushes', '直接推送'],
    ['Deleted tag', '已删除标签'],
    ['Share feedback about this page', '提供有关此页面的反馈'],
    ['Comparing changes', '比较更改'],
    ['Open a pull request', '创建拉取请求'],
    [
      'Choose two branches to see what’s changed or to start a new pull request. If you need to, you can also',
      '选择两个分支以查看更改或创建新的拉取请求。如有需要，你也可以'
    ],
    ['Collapse comments, modified line', '折叠评论，修改后的行'],
    ['Expand comments, original line', '展开评论，原始行'],
    ['Find a tag', '查找标签'],
    ['Could not load tags', '无法加载标签'],
    ['Able to merge.', '可以合并。'],
    ['Can’t automatically merge.', '无法自动合并。'],
    ['Checking mergeability...', '正在检查能否合并...'],
    ['There isn’t anything to compare.', '没有可比较的内容。'],
    // 两点比较的页头说明（片段见下）、创建拉取请求区的说明
    [
      'This is a direct comparison between two commits made in this repository or its related repositories.',
      '这是对此存储库或其相关存储库中两个提交的直接比较。'
    ],
    ['View the default comparison', '查看此范围的默认比较'],
    ['Create another pull request to discuss and review the changes again.', '创建另一个拉取请求以再次讨论和审查这些更改。']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Load diff \n', [...SCOPE])).toBe('  加载差异 \n')
  })
})

describe('commits 被元素隔开的片段', () => {
  it.each([
    // <作者> 编写并由 <提交者> 提交于 <时间>（提交于由 common-ui 收录）
    ['authored and', '编写并由'],
    // 历史记录 <路径> 位于 <分支>
    ['History for', '历史记录'],
    ['on', '位于'],
    // <用户> 对此提交进行身份验证的方式为 <在场证明>
    ['authenticated this commit with', '对此提交进行身份验证的方式为'],
    // 提交反馈后：谢谢。我们正在开发此功能并期待你的 <详细反馈>！（原文无逗号，译文不加）
    ['Thank you. This feature is under development and', '谢谢。我们正在开发此功能并期待你的'],
    ['detailed feedback', '详细反馈'],
    ['is appreciated!', '！'],
    // 显示 <N 个已更改的文件> 包含 <新增 N 行> 和 <删除 N 行>
    ['Showing', '显示'],
    ['with', '包含'],
    // 评论行 <L3> 至 <R5>
    ['Comment on lines', '评论行'],
    ['to', '至'],
    // 规模：<M>
    ['size:', '规模：'],
    // 将更新 <3> 个以此分支为目标并分布在 <2> 个存储库中的拉取请求。
    ['Will update', '将更新'],
    ['pull requests targeting this', '个以此'],
    ['branch.', '分支为目标的拉取请求。'],
    ['branch across', '分支为目标并分布在'],
    ['repositories.', '个存储库中的拉取请求。'],
    ['branch protections that explicitly target', '条明确针对以下分支的分支保护规则'],
    // 分支 <名称> 将被永久删除。
    ['The branch', '分支'],
    ['will be permanently deleted.', '将被永久删除。'],
    // 依赖项审查富差异底部：整句未命中时的片段（原文无标点，译文不加冒号）
    ['Give feedback on', '提供反馈'],
    ['dependency review', '依赖项审查'],
    // <main> 已包含来自 <v3.0.0> 的所有提交。请尝试 <切换基础分支> 进行比较。
    ['is up to date with all commits from', '已包含来自'],
    ['. Try', '的所有提交。请尝试'],
    ['switching the base', '切换基础分支'],
    ['for your comparison.', '进行比较。'],
    // 这是对此存储库或其相关存储库中两个提交的直接比较。<查看此范围的默认比较> 或 <了解差异比较>。
    ['for this range or', '或']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('依赖项审查富差异底部整句：提交页与比较页生效，其他页面不生效', () => {
    const key = patternKey('Give feedback on {}')
    expect(matcher.translateInline(key, [...SCOPE])).toBe('对{}提供反馈')
    expect(matcher.translateInline(key, [...COMPARE_SCOPE])).toBe('对{}提供反馈')
    expect(matcher.translateInline(key, ['common', 'repository'])).toBeUndefined()
  })
})

describe('commits 行内句（DOM）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('依赖项审查富差异底部：整句调语序，链接文字照常翻译', () => {
    // 服务端渲染的片段（include-fragment 载入）：链接后有换行文本，整句的末段写在这里
    document.body.innerHTML = '<div id="feedback">\n  Give feedback on <a href="#feedback">dependency review</a>\n</div>'
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(document.getElementById('feedback')?.textContent?.trim()).toBe('对依赖项审查提供反馈')
    expect(document.querySelector('#feedback > a')?.textContent).toBe('依赖项审查')
  })
})

describe('commits 两点比较页头说明（DOM）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('说明句、两个链接与链接间片段按原文顺序拼读，句末孤立句点转全角', () => {
    // 结构同 /compare/<a>..<b> 服务端渲染的 Subhead-description
    document.body.innerHTML = [
      '<div class="Subhead-description" id="two-dot">          This is a direct comparison between two commits made in this repository or its related repositories.',
      '          <a class="Link--inTextBlock" href="/octo-org/hello-world/compare/main...feature">View the default comparison</a> for this range or',
      '          <a class="Link--inTextBlock Link" href="https://docs.github.com/">learn more about diff comparisons</a>.',
      '</div>'
    ].join('\n')
    translator = createTranslator({ matcher, host: window, resolvePages: () => COMPARE_SCOPE })
    translator.start()
    const text = document.getElementById('two-dot')?.textContent?.replace(/\s+/g, ' ').trim()
    expect(text).toBe('这是对此存储库或其相关存储库中两个提交的直接比较。查看此范围的默认比较 或 了解差异比较。')
    expect(translator.drainUntranslated()).toEqual([])
  })
})

describe('commits 页面词条', () => {
  it.each([
    ['Revoked', '已撤销'],
    ['verified', '已验证'],
    ['Copy full SHA', '复制完整 SHA'],
    ['Status checks', '状态检查'],
    ['Pending', '挂起'],
    ['In progress', '正在进行'],
    ['Neutral', '中性'],
    ['Expected', '等待报告'],
    ['Timed out', '已超时'],
    ['Start date', '开始日期'],
    ['Oct', '10 月'],
    ['Mo', '一'],
    // 原文 like 前无逗号，译文改语序不加
    [
      'Use arrow keys to select a date, or type a date like "Dec 28, 2020" or "12/28/2020".',
      '用方向键选择日期，或输入如“Dec 28, 2020”或“12/28/2020”的日期。'
    ],
    ['Browse files', '浏览文件'],
    ['commit', '提交'],
    ['commit comments', '提交评论'],
    ['Comments on commit', '提交评论'],
    ['Failed to react to comment', '添加反应失败'],
    ['Commit message', '提交消息'],
    ['Extended description', '扩展描述'],
    ['Split', '拆分'],
    ['Unified', '统一'],
    ['Whitespace', '空白'],
    ['Diff settings', '差异设置'],
    // 原文无逗号，译文不加
    ['File renamed without changes.', '文件已重命名且内容无更改。'],
    ['File copied without changes.', '文件已复制且内容无更改。'],
    ['This diff could not be loaded automatically because of too many other changes.', '此差异因其他更改过多而无法自动加载。'],
    [
      'This diff could not be loaded automatically because of too many other files to display.',
      '此差异因要显示的其他文件过多而无法自动加载。'
    ],
    [
      'The default line height has been increased for improved accessibility. You can choose to enable a more compact line height from the view settings menu.',
      '默认行高已为改善辅助功能而增加。你可以在视图设置菜单中启用更紧凑的行高。'
    ],
    ['The page is unavailable due to a system error.', '页面因系统错误而不可用。'],
    ['Check failure on line', '检查失败位于行'],
    ['Add a comment on', '添加评论于'],
    ['updated', '已更新'],
    ['Overview', '概述'],
    ['Stale', '过时'],
    ['Updated', '更新时间'],
    ['Last quarter', '过去一个季度'],
    ['Files changed', '已更改的文件'],
    ['File changed', '已更改的文件']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('common-ui 已收录的通用词条不重复收录', () => {
    const common = [
      'authored',
      'committed',
      'More actions',
      'Commit',
      'Verified',
      'Unverified',
      'Partially verified',
      'Expired',
      'Preview',
      'Comment',
      'Unsubscribe',
      'Reply',
      'Add a comment',
      'Copy link',
      'Expand all',
      'All',
      'Default',
      'Pull request',
      'Restore',
      'Rename',
      'Activity',
      'Share feedback',
      "Failed to save comment: Body can't be blank"
    ]
    for (const text of common) {
      expect(dict.static?.[text]).toBeUndefined()
      expect(dict.scoped?.[text]).toBeUndefined()
    }
  })

  it('与 pulls、code、repository 等词典共用的文字按页面收录，不进入全局 static', () => {
    const shared = [
      'Display the source diff',
      'Large diffs are not rendered by default.',
      'Hide for this diff only',
      'Delete branch',
      'Restore branch',
      'pushed to',
      'Protect this branch'
    ]
    for (const text of shared) {
      expect(dict.static?.[text]).toBeUndefined()
      expect(dict.scoped?.[text]).toBeDefined()
    }
    expect(translate('Display the source diff')).toBe('显示源差异')
  })

  it('比较页作用域同样生效', () => {
    expect(matcher.translate('base:', [...COMPARE_SCOPE])).toBe('基础：')
    expect(matcher.translate('Comparing main...feature', [...COMPARE_SCOPE])).toBe('比较 main...feature')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Overview', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Oct', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('. Try', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Will update', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Copy full SHA for 0ff253b', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('12 results', ['common', 'repository', 'releases'])).toBeUndefined()
    expect(matcher.translate('Successful in 41s', ['common', 'repository', 'releases'])).toBeUndefined()
    expect(matcher.translate('Week 1', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('commit', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Pending', ['common', 'repository', 'issues'])).toBeUndefined()
  })

  it('现行分支页、活动页没有的旧文字不收录', () => {
    // 分支页（repos-branches）：删除行为 Deleted <时间>，活动入口为 Activity，空列表为 No branches，新建分支对话框为 Source；
    // 活动页菜单项为 Restore branch。Branch source、Choose a source branch 属议题开发区，由 issues 词典收录
    const obsolete = [
      'View branch activity',
      'Deleted just now by',
      "You haven't pushed any branches to this repository.",
      'You haven’t pushed any branches to this repository.',
      "There aren't any active branches.",
      'There aren’t any active branches.',
      "There aren't any stale branches.",
      'There aren’t any stale branches.',
      'Branch source',
      'Choose a source branch',
      'Restore Branch'
    ]
    for (const text of obsolete) {
      expect(dict.static?.[text]).toBeUndefined()
      expect(dict.scoped?.[text]).toBeUndefined()
    }
  })
})

describe('commits 繁体词条（zh-TW）', () => {
  const twDict: PageDictionary = commitsTW
  const twMatcher = createMatcher([['commits', commitsTW]])

  it.each([
    ['SSH key Fingerprint:', 'SSH 金鑰指紋：'],
    ['— This check has started...', '— 此檢查已開始...'],
    ['Loading branch information', '正在載入分支資訊'],
    ['Comment on this commit', '對此提交留言'],
    ['No dependencies changed.', '相依項目未變更。'],
    ['The changes to this file likely do not affect the dependencies', '此檔案的變更可能不會影響相依項目'],
    ['File renamed without changes', '檔案已重新命名且內容未變更'],
    ['View all rules', '查看所有規則'],
    // 依赖项审查富差异底部：整句未命中时的片段（整句见 inline）
    ['Give feedback on', '提供意見回饋'],
    ['dependency review', '相依性審查'],
    // 两点比较的页头说明、创建拉取请求区的说明
    [
      'This is a direct comparison between two commits made in this repository or its related repositories.',
      '這是對此儲存庫或其相關儲存庫中兩個提交的直接比較。'
    ],
    ['View the default comparison', '查看此範圍的預設比較'],
    ['Create another pull request to discuss and review the changes again.', '建立另一個拉取請求以再次討論並審查這些變更。']
  ])('静态：%s → %s', (input, expected) => {
    expect(twDict.static?.[input]).toBe(expected)
    expect(twMatcher.translate(input, [...SCOPE])).toBe(expected)
  })

  it.each([
    ['Stale', '過時'],
    ['File changed', '變更的檔案'],
    ['for this range or', '或']
  ])('页面：%s → %s', (input, expected) => {
    expect(twDict.scoped?.[input]).toBe(expected)
    expect(twMatcher.translate(input, [...SCOPE])).toBe(expected)
  })

  it('页面词条不在其他页面生效', () => {
    expect(twMatcher.translate('Stale', ['common', 'repository'])).toBeUndefined()
  })

  it('依赖项审查富差异底部整句：提供 <相依性審查> 的意見回饋', () => {
    const key = patternKey('Give feedback on {}')
    expect(twMatcher.translateInline(key, [...SCOPE])).toBe('提供{}的意見回饋')
    expect(twMatcher.translateInline(key, ['common', 'repository'])).toBeUndefined()
  })
})

/** 提交详情页头的服务端渲染结构（.harvest/scratch/e-requests/pre-svg/notes.md）；parents 为 <pre> 开头到 commit 文本为止的内容 */
function commitHeader(parents: string, sha: string): string {
  return [
    '<div class="commitBranchContainer__wieILg" data-files-changed-active="true">',
    '<div class="d-flex flex-row flex-items-center"><a class="mx-1 prc-BranchName-BranchName-CMTaU" data-component="BranchName" href="/octo-org/hello-world/compare/main">main</a>(<a href="/octo-org/hello-world/pull/1">#1</a>)</div>',
    `<pre class="color-fg-muted d-flex flex-items-center" id="parents">${parents}<span class="fgColor-default">${sha}</span>`,
    '<div><button data-component="IconButton" type="button" class="prc-Button-ButtonBase-9n-Xk ml-2 prc-Button-IconButton-fyge7" aria-labelledby="copy-sha"><svg class="octicon octicon-copy" aria-hidden="true"><path d="M0 0h16v16H0z"></path></svg></button>',
    `<span class="tooltip__XwO6MO prc-TooltipV2-Tooltip-tLeuB" data-direction="sw" data-component="Tooltip" aria-label="Copy full SHA for ${sha}" aria-hidden="true" id="copy-sha">Copy full SHA for ${sha}</span></div>`,
    '</pre></div>'
  ].join('')
}

/** 父提交链接：第一个快捷键 p，第二个 o */
function parentLink(sha: string, hotkey: 'p' | 'o'): string {
  return `<a class="color-fg-default Link--inTextBlock prc-Link-Link-9ZwDx" data-component="Link" data-hotkey="${hotkey}" href="/octo-org/hello-world/commit/${sha}">${sha}</a>`
}

describe('commits 提交页头父提交行（<pre> 由引擎放行）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function start(html: string): Translator {
    document.body.innerHTML = html
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE, collectUntranslated: true })
    translator.start()
    return translator
  }

  /** <pre> 的直接子文本节点 */
  function preTexts(): string[] {
    const pre = document.getElementById('parents')!
    return [...pre.childNodes].flatMap(node => (node instanceof Text ? [node.data] : []))
  }

  it('合并提交：父提交数与 commit 译出，哈希、分支名原样，复制提示框文字与无障碍名称译出', () => {
    const t = start(commitHeader(`2 parents ${parentLink('0ff253b', 'p')} + ${parentLink('1a2b3c4', 'o')} commit `, '5d6e7f8'))
    expect(preTexts()).toEqual(['2 个父提交 ', ' + ', ' 提交 '])
    expect(document.querySelector('[data-hotkey="p"]')?.textContent).toBe('0ff253b')
    expect(document.querySelector('[data-hotkey="o"]')?.textContent).toBe('1a2b3c4')
    expect(document.querySelector('#parents .fgColor-default')?.textContent).toBe('5d6e7f8')
    expect(document.querySelector('[data-component="BranchName"]')?.textContent).toBe('main')
    const tip = document.getElementById('copy-sha')!
    expect(tip.textContent).toBe('复制 5d6e7f8 的完整 SHA')
    expect(tip.getAttribute('aria-label')).toBe('复制 5d6e7f8 的完整 SHA')
    expect(t.drainUntranslated()).toEqual([])
  })

  it('普通提交：1 个父提交', () => {
    start(commitHeader(`1 parent ${parentLink('0ff253b', 'p')} commit `, '5d6e7f8'))
    expect(preTexts()).toEqual(['1 个父提交 ', ' 提交 '])
    expect(document.getElementById('parents')?.textContent).toBe('1 个父提交 0ff253b 提交 5d6e7f8复制 5d6e7f8 的完整 SHA')
  })

  it('根提交：没有父提交链接，两段文字之间只隔服务端渲染的注释', () => {
    start(commitHeader('0 parents <!-- --> commit ', '5d6e7f8'))
    expect(preTexts()).toEqual(['0 个父提交 ', ' 提交 '])
  })

  it('停止后还原原文', () => {
    const t = start(commitHeader(`2 parents ${parentLink('0ff253b', 'p')} + ${parentLink('1a2b3c4', 'o')} commit `, '5d6e7f8'))
    t.stop()
    translator = undefined
    expect(preTexts()).toEqual(['2 parents ', ' + ', ' commit '])
    expect(document.getElementById('copy-sha')?.getAttribute('aria-label')).toBe('Copy full SHA for 5d6e7f8')
  })
})

describe('commits 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('活动事件中的分支名链接被忽略，动词不被忽略', () => {
    document.body.innerHTML = `
      <div data-testid="action-text">pushed to <a href="/octo-org/hello-world/tree/main">main</a></div>
    `
    const ignored = (dict.ignore ?? []).join(', ')
    const link = document.querySelector('[data-testid="action-text"] > a')
    const text = document.querySelector('[data-testid="action-text"]')
    expect(link?.matches(ignored)).toBe(true)
    expect(text?.matches(ignored)).toBe(false)
  })

  it('提交历史“History for”面包屑：存储库名与路径段被忽略，前面的界面文字不被忽略', () => {
    document.body.innerHTML = `
      <span id="label">History for</span>
      <nav data-component="Breadcrumbs"><ol>
        <li><a data-component="Breadcrumbs.Item" id="repo" href="/octocat/hello-world/commits">hello-world</a></li>
        <li><a data-component="Breadcrumbs.Item" id="dir" href="/octocat/hello-world/commits/main/docs">documentation</a></li>
        <li><a data-component="Breadcrumbs.Item" aria-current="page" id="leaf" href="/octocat/hello-world/commits/main/docs/invalid">invalid</a></li>
      </ol></nav>
    `
    const ignored = (dict.ignore ?? []).join(', ')
    for (const id of ['#repo', '#dir', '#leaf']) expect(document.querySelector(id)?.matches(ignored)).toBe(true)
    expect(document.querySelector('#label')?.matches(ignored)).toBe(false)
  })

  it('比较页摘要下的文件路径被忽略，差异统计链接不被忽略', () => {
    document.body.innerHTML = `
      <ol class="content collapse js-transitionable">
        <li>
          <span class="diffstat float-right">
            <a id="stat" href="#diff-89b4766" class="tooltipped tooltipped-s" aria-label="2 lines changed"></a>
          </span>
          <a id="path" href="#diff-89b4766">docs/Notes</a>
        </li>
      </ol>
    `
    const ignored = (dict.ignore ?? []).join(', ')
    expect(document.querySelector('#path')?.matches(ignored)).toBe(true)
    expect(document.querySelector('#stat')?.matches(ignored)).toBe(false)
  })
})
