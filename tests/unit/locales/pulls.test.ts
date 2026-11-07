import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import pulls from '../../../src/locales/zh-CN/pulls'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = pulls

const matcher = createMatcher([['pulls', pulls]])
/** 简体完整语言包：检查与通用词典、其他页面词典的配合 */
const cnFull = createMatcher(zhCN)

/** 存储库拉取请求页的作用域：common → repository → pulls */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'pulls']

function translate(text: string): string | undefined {
  return matcher.translate(text, SCOPE)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列（与合并顺序一致），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // header：头部摘要
  {
    hits: [
      ['wants to merge 3 commits into', '想要将 3 个提交合并到'],
      ['wants to merge 1 commit into', '想要将 1 个提交合并到'],
      ['wants to merge 1,024 commits into', '想要将 1,024 个提交合并到']
    ],
    misses: ['wants to merge some commits into']
  },
  { hits: [['merged 2 commits into', '已将 2 个提交合并到']], misses: ['merged commits into'] },
  { hits: [['5 commits merged into', '5 个提交已合并到']], misses: ['All commits merged into'] },
  { hits: [['wants to merge', '想要合并']], misses: ['wants to merge into'] },
  {
    hits: [
      ['commits into', '个提交到'],
      ['commit into', '个提交到']
    ],
    misses: ['commits onto']
  },
  {
    hits: [
      ['and merged', '并合并于'],
      ['and closed', '并关闭于']
    ],
    misses: ['and reopened']
  },
  {
    hits: [
      ['; merged', '；合并于'],
      ['; closed', '；关闭于']
    ],
    misses: ['; reopened']
  },
  // header：行数统计（& 译“和”，与 commits 词典一致）
  {
    hits: [
      ['Lines changed: 120 additions & 4 deletions', '更改行数：新增 120 行和删除 4 行'],
      ['Lines changed: 1 addition & 1 deletion', '更改行数：新增 1 行和删除 1 行']
    ],
    misses: ['Lines changed: many additions & 4 deletions']
  },
  {
    hits: [['124 changes: 120 additions & 4 deletions', '124 处更改：新增 120 行和删除 4 行']],
    misses: ['Many changes: 120 additions & 4 deletions']
  },
  // header：状态与标签页
  {
    hits: [
      ['Pull request state: Draft', '拉取请求状态：草稿'],
      ['Pull request state: Merged', '拉取请求状态：已合并']
    ],
    misses: ['Pull request state: Archived']
  },
  {
    hits: [
      ['Switch tab (current: Files changed)', '切换标签页（当前：已更改的文件）'],
      ['Switch tab (current: Checks)', '切换标签页（当前：检查）'],
      ['Switch tab (current: Insights)', '切换标签页（当前：Insights）']
    ],
    misses: ['Switch tab (current)']
  },
  {
    hits: [["Title can't be longer than 256 characters (currently 300 characters)", '标题不能超过 256 个字符（当前 300 个字符）']],
    misses: ["Title can't be longer than 256 characters"]
  },
  { hits: [['Pull Request #123', '拉取请求 #123']], misses: ['Pull Request #abc'] },
  {
    hits: [
      ['Create codespace on feature-branch', '在 feature-branch 上创建代码空间'],
      ['Create a codespace on main', '在 main 上创建代码空间']
    ],
    misses: ['Create codespace on my branch']
  },
  // header：堆栈
  {
    hits: [['Navigate pull request stack, position 2 of 5', '浏览拉取请求堆栈，5 个中的第 2 个']],
    misses: ['Navigate pull request stack']
  },
  {
    hits: [['Pull request stack, position 1 of 3', '拉取请求堆栈，3 个中的第 1 个']],
    misses: ['Pull request stack, position one of 3']
  },
  {
    hits: [
      ['Stack #4', '堆栈 #4'],
      ['stack #12', '堆栈 #12']
    ],
    misses: ['Stack #abc']
  },
  { hits: [['Stack #', '堆栈 #']], misses: ['Stacks #'] },
  { hits: [['Already in stack #4', '已在堆栈 #4 中']], misses: ['Already in stack'] },
  { hits: [['Remove #42 from preview stack', '从预览堆栈中删除 #42']], misses: ['Remove from preview stack'] },
  {
    hits: [
      ['Proposed stack loaded with 3 pull requests.', '已加载包含 3 个拉取请求的建议堆栈。'],
      ['Proposed stack loaded with 1 pull request.', '已加载包含 1 个拉取请求的建议堆栈。']
    ],
    misses: ['Proposed stack loaded with 3 pull requests']
  },
  { hits: [['Pull requests in stack #4', '堆栈 #4 中的拉取请求']], misses: ['Pull requests in stack'] },
  {
    hits: [
      [
        'Auto-merge will be disabled for this stack. All pull requests will be removed from the stack. Their base branches will not be retargeted and their commit histories will remain the same.',
        '此堆栈的自动合并将被禁用。所有拉取请求都将从堆栈中删除。其基础分支不会重新指定且提交历史记录保持不变。'
      ],
      ['Auto-merge will be disabled for this stack. Review the stack first.', '此堆栈的自动合并将被禁用。Review the stack first.']
    ],
    misses: ['Auto-merge will be disabled for this stack.']
  },
  {
    hits: [
      ['Stack Created Banner', '堆栈已创建横幅'],
      ['Stack Updated Banner', '堆栈已更新横幅']
    ],
    misses: ['Stack Deleted Banner']
  },
  // header：Dependabot 横幅
  {
    hits: [
      ['on lodash including a', '涉及 lodash 并包括一个'],
      ['on @babel/core including a', '涉及 @babel/core 并包括一个']
    ],
    misses: ['on lodash including an']
  },
  {
    hits: [
      ['on lodash', '涉及 lodash'],
      ['on @babel/core', '涉及 @babel/core']
    ],
    misses: ['on GitHub', 'on 2026-10-26', 'on the main branch']
  },
  {
    hits: [
      ['This pull request resolved a Dependabot alert on lodash.', '此拉取请求已解决 lodash 的一个 Dependabot 警报。'],
      ['This pull request would resolve a Dependabot alert on @babel/core.', '此拉取请求将解决 @babel/core 的一个 Dependabot 警报。']
    ],
    misses: ['This pull request resolved a Dependabot alert on lodash']
  },
  {
    hits: [
      ['This pull request would resolve a Dependabot alert', '此拉取请求将解决一个 Dependabot 警报'],
      ['This pull request resolved a Dependabot alert', '此拉取请求已解决一个 Dependabot 警报']
    ],
    misses: ['This pull request resolved 2 Dependabot alerts']
  },

  // mergebox：检查汇总
  {
    hits: [
      ['1 failing, 2 skipped, and 15 successful checks', '1 个检查失败、2 个已跳过、15 个成功'],
      // 原文只有 and、没有逗号：不加顿号（与 commits 词典的检查汇总一致）
      ['2 failing and 3 successful checks', '2 个检查失败和 3 个成功'],
      ['1 failing, 2 neutral and 3 successful checks', '1 个检查失败、2 个中性、3 个成功'],
      ['15 successful checks', '15 个检查成功'],
      ['1 in progress check', '1 个检查正在进行'],
      ['2 pending and 1 timed out checks', '2 个检查挂起和 1 个已超时'],
      ['1 neutral check', '1 个检查中性']
    ],
    misses: ['3 flaky checks']
  },
  {
    hits: [
      ['18 checks', '18 个检查'],
      ['1 check', '1 个检查']
    ],
    misses: ['Many checks']
  },
  {
    hits: [
      ['Collapse 1 failing check group', '折叠分组 1 个检查失败'],
      ['Expand 15 successful checks group', '展开分组 15 个检查成功']
    ],
    misses: ['Collapse failing checks group']
  },
  { hits: [['Expand 3 checks group', '展开分组 3 个检查']], misses: ['Expand all checks group'] },
  // mergebox：检查耗时
  {
    hits: [
      ['Successful in 2m', '成功用时 2 分钟'],
      ['Successful in 1h 5m', '成功用时 1 小时 5 分钟'],
      ['Completed in 30s', '完成用时 30 秒'],
      ['Success in 1d 2h 3m', '成功用时 1 天 2 小时 3 分钟']
    ],
    misses: ['Successful in two minutes']
  },
  {
    hits: [
      ['Failing after 30s', '30 秒后失败'],
      ['Failing after 2m 5s', '2 分钟 5 秒后失败'],
      ['Cancelled after 1m 2s', '1 分钟 2 秒后取消'],
      ['Timed out after 6h', '6 小时后超时'],
      ['Neutral after 41s', '41 秒后结果为中性']
    ],
    misses: ['Failing after a while']
  },
  {
    hits: [
      ['2 checks are failing and need attention.', '2 个检查失败且需要处理。'],
      ['1 check is failing and needs attention.', '1 个检查失败且需要处理。']
    ],
    misses: ['2 checks are failing and need attention']
  },
  {
    hits: [
      ['2 workflows awaiting approval', '2 个工作流等待批准'],
      ['1 workflow awaiting approval', '1 个工作流等待批准']
    ],
    misses: ['Workflows awaiting approval']
  },
  {
    hits: [
      ['Ready to merge when you are. Click to view details in the merge panel.', '随时可以合并。单击可在合并面板中查看详细信息。'],
      [
        '2 checks are failing and need attention. Click to view details in the merge panel.',
        '2 个检查失败且需要处理。单击可在合并面板中查看详细信息。'
      ],
      ['Merge queue is paused. Click to view details in the merge panel.', 'Merge queue is paused. 单击可在合并面板中查看详细信息。']
    ],
    misses: ['Click to view details in the merge panel.']
  },
  // mergebox：审查分组
  {
    hits: [
      ['2 approvals', '2 个批准'],
      ['1 approval', '1 个批准'],
      ['3 requested changes', '3 个更改请求'],
      ['1 pending review', '1 个待处理的审查']
    ],
    misses: ['2 approvers']
  },
  {
    hits: [
      ['Expand 2 approvals group', '展开分组 2 个批准'],
      ['Collapse 1 pending review group', '折叠分组 1 个待处理的审查']
    ],
    misses: ['Expand approvals group']
  },
  {
    hits: [
      ['list of approvals', '批准列表'],
      ['list of requested changes', '更改请求列表'],
      ['list of pending reviews', '待处理的审查列表']
    ],
    misses: ['list of reviewers']
  },
  // mergebox：审查者状态
  {
    hits: [
      ['Approved these changes', '批准了这些更改'],
      ['Commented with read-only permissions', '以只读权限发表了评论'],
      ['Approved these changes with read-only permissions for octo-org/core', '代表 octo-org/core 以只读权限批准了这些更改'],
      ['Requested changes for octo-org/core', '代表 octo-org/core 请求了更改']
    ],
    misses: ['Approved some changes']
  },
  {
    hits: [
      ['octocat approved these changes', 'octocat 批准了这些更改'],
      ['copilot-pull-request-reviewer[bot] commented', 'copilot-pull-request-reviewer[bot] 发表了评论'],
      ['hubot requested changes with read-only permissions', 'hubot 以只读权限请求了更改'],
      ['octocat approved these changes for octo-org/core', 'octocat 代表 octo-org/core 批准了这些更改']
    ],
    misses: ['Mona Lisa approved these changes']
  },
  {
    hits: [
      ['octocat was requested for review', 'octocat 被请求审查'],
      ['hubot was requested for review as a codeowner', 'hubot 被请求以代码所有者身份审查']
    ],
    misses: ['Mona Lisa was requested for review']
  },
  {
    hits: [
      ["octocat's avatar image", 'octocat 的头像'],
      ["dependabot[bot]'s avatar image", 'dependabot[bot] 的头像']
    ],
    misses: ["Mona Lisa's avatar image"]
  },
  // mergebox：审查要求
  {
    hits: [['At least 2 approving reviews are required', '至少需要 2 个批准审查']],
    misses: ['At least two approving reviews are required']
  },
  {
    hits: [
      ['At least 2 approving reviews are required by reviewers with write access.', '至少需要 2 个具有写入访问权限的审查者批准。'],
      ['At least 1 approving review is required by reviewers with write access.', '至少需要 1 个具有写入访问权限的审查者批准。']
    ],
    misses: ['At least 2 approving reviews are required by reviewers.']
  },
  {
    hits: [['At least 2 approving reviews are required to merge this pull request.', '合并此拉取请求至少需要 2 个批准审查。']],
    misses: ['At least 2 approving reviews are required to merge.']
  },
  {
    hits: [
      ['Code owner review required by reviewers with write access.', '需要具有写入访问权限的代码所有者审查。'],
      [
        'An approval on the most recent push is required by reviewers with write access.',
        '最近一次推送需要获得具有写入访问权限的审查者批准。'
      ],
      ['A review from a compliance team is required by reviewers with write access.', '需要具有写入访问权限的合规团队审查。']
    ],
    misses: ['Security review required by reviewers with write access.']
  },
  {
    hits: [['No applicable reviews submitted by reviewers with write access.', '具有写入访问权限的审查者没有提交适用的审查。']],
    misses: ['No applicable reviews submitted by reviewers.']
  },
  {
    hits: [
      [
        '1 change requested, 2 approving reviews by reviewers with write access.',
        '具有写入访问权限的审查者提交了 1 个更改请求、2 个批准审查。'
      ],
      ['2 changes requested by reviewers with write access.', '具有写入访问权限的审查者提交了 2 个更改请求。'],
      ['3 approving reviews by reviewers with write access.', '具有写入访问权限的审查者提交了 3 个批准审查。']
    ],
    misses: ['Some approving reviews by reviewers with write access.']
  },
  {
    hits: [['2 reviews requesting changes by reviewers with write access.', '2 个具有写入访问权限的审查者请求更改。']],
    misses: ['Reviews requesting changes by reviewers with write access.']
  },
  {
    hits: [
      ['2 changes requested', '2 个更改请求'],
      ['1 change requested', '1 个更改请求']
    ],
    misses: ['No changes requested']
  },
  {
    hits: [
      ['2 approving reviews', '2 个批准审查'],
      ['1 approving review', '1 个批准审查']
    ],
    misses: ['No approving reviews']
  },
  {
    hits: [
      ['3 pending reviewers', '3 个待审查者'],
      ['1 pending reviewer', '1 个待审查者']
    ],
    misses: ['Pending reviewers']
  },
  {
    hits: [['Waiting on code owner review from octo-org/core.', '正在等待代码所有者 octo-org/core 的审查。']],
    misses: ['Waiting on code owner review.']
  },
  // mergebox：更新分支
  {
    hits: [
      [
        'Merge the latest changes from main into this branch. This merge commit will be associated with octocat.',
        '将 main 的最新更改合并到此分支。此合并提交将与 octocat 关联。'
      ]
    ],
    misses: ['Merge the latest changes from main into this branch. This merge commit will be associated with Mona Lisa.']
  },
  {
    hits: [['Merge the latest changes from main into this branch.', '将 main 的最新更改合并到此分支。']],
    misses: ['Merge the latest changes from main into that branch.']
  },
  { hits: [['Merge the latest changes from', '将']], misses: ['Merge the latest changes'] },
  { hits: [['into this branch.', '的最新更改合并到此分支。']], misses: ['into this branch'] },
  // mergebox：命令行合并步骤
  {
    hits: [
      ['Step 1:', '第 1 步：'],
      ['Step 2', '第 2 步']
    ],
    misses: ['Step one:']
  },
  // mergebox：合并方式说明
  {
    hits: [
      [
        'The 3 commits from this branch will be combined into one commit in the base branch.',
        '此分支的 3 个提交将压缩为基础分支中的一个提交。'
      ]
    ],
    misses: ['The commits from this branch will be combined into one commit in the base branch.']
  },
  {
    hits: [['The 3 commits from this branch will be rebased and added to the base branch.', '此分支的 3 个提交将变基后添加到基础分支。']],
    misses: ['The 3 commits from this branch will be rebased.']
  },
  {
    hits: [['The 5 commits from this branch will be added to the base branch.', '此分支的 5 个提交将添加到基础分支。']],
    misses: ['The five commits from this branch will be added to the base branch.']
  },
  {
    hits: [
      [
        'All commits from these 3 branches will be added to the base branch via merge commits.',
        '这 3 个分支的所有提交将通过合并提交添加到基础分支。'
      ]
    ],
    misses: ['All commits from these branches will be added to the base branch via merge commits.']
  },
  {
    hits: [
      [
        'The commits from these 3 branches will be combined into one commit per branch in the base branch.',
        '这 3 个分支的提交将在基础分支中按分支各压缩为一个提交。'
      ]
    ],
    misses: ['The commits from these branches will be combined into one commit per branch in the base branch.']
  },
  {
    hits: [
      ['All commits from these 2 branches will be rebased and added to the base branch.', '这 2 个分支的所有提交将变基后添加到基础分支。']
    ],
    misses: ['All commits from these 2 branches will be rebased.']
  },
  {
    hits: [
      ['Merging is blocked due to failing merge requirements', '因合并要求未满足而无法合并'],
      ['Merging is blocked due to pending merge requirements', '因合并要求尚未完成而无法合并']
    ],
    misses: ['Merging is blocked due to unknown merge requirements']
  },
  {
    hits: [['This commit will be authored by octocat@github.com.', '此提交的作者电子邮件为 octocat@github.com。']],
    misses: ['This commit will be authored by Mona Lisa.']
  },
  {
    hits: [['This will rebase your changes and merge them into main.', '这将变基你的更改并合并到 main。']],
    misses: ['This will rebase your changes.']
  },
  {
    hits: [['This will squash your changes and merge them into main.', '这将压缩你的更改并合并到 main。']],
    misses: ['This will squash your changes.']
  },
  // mergebox：规则失败原因
  {
    hits: [
      ['Required status check "build" is expected.', '必需的状态检查“build”尚未报告。'],
      ['Required status check "ci / test" is in progress.', '必需的状态检查“ci / test”正在进行。'],
      ['Required status check "build" is pending.', '必需的状态检查“build”处于挂起状态。']
    ],
    misses: ['Required status check "build" is flaky.']
  },
  {
    hits: [['1 of 2 required status checks has not succeeded: build.', '2 个必需的状态检查中有 1 个未成功：build。']],
    misses: ['1 of 2 required status checks has not succeeded.']
  },
  {
    hits: [['2 of 3 required status checks are expected.', '3 个必需的状态检查中有 2 个尚未报告。']],
    misses: ['Some required status checks are expected.']
  },
  {
    hits: [
      ['1 of 3 required status checks is pending.', '3 个必需的状态检查中有 1 个处于挂起状态。'],
      ['2 of 3 required status checks are in progress.', '3 个必需的状态检查中有 2 个正在进行。']
    ],
    misses: ['1 of 3 required status checks is queued.']
  },
  // mergebox：网址为纯文本时的无权推送原因（链接时的前半由 static 收录）
  {
    hits: [
      [
        "You're not authorized to push to this branch. Visit https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches for more information.",
        '你无权推送到此分支。请访问 https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches 了解详细信息。'
      ],
      [
        'You’re not authorized to push to this branch. Visit https://docs.github.com/ for more information.',
        '你无权推送到此分支。请访问 https://docs.github.com/ 了解详细信息。'
      ]
    ],
    misses: ["You're not authorized to push to this branch. Visit the branch settings for more information."]
  },

  // merge-flow：合并队列
  {
    hits: [['for all merges into the main branch.', '来合并所有更改到 main 分支。']],
    misses: ['for all merges into the main branch']
  },
  {
    hits: [
      ['There is 1 pull request ahead of this one in the', '此拉取请求在以下队列中前面还有 1 个拉取请求'],
      ['There are 3 pull requests ahead of this one in the', '此拉取请求在以下队列中前面还有 3 个拉取请求']
    ],
    misses: ['There is 1 pull request ahead of this one', 'There are many pull requests ahead of this one in the']
  },
  {
    hits: [
      [
        'This pull request will be automatically grouped with other pull requests and merged into main.',
        '此拉取请求将自动与其他拉取请求分组并合并到 main。'
      ]
    ],
    misses: ['This pull request will be automatically grouped with other pull requests.']
  },
  {
    hits: [['This pull request will be merged into main by itself.', '此拉取请求将单独合并到 main。']],
    misses: ['This pull request will be merged into main.']
  },
  // merge-flow：自动合并
  {
    hits: [
      [
        'This pull request and 2 others in the stack will automatically merge when they all meet the merge requirements.',
        '此拉取请求与堆栈中的其他 2 个拉取请求将在全部满足合并要求后自动合并。'
      ],
      [
        'This pull request and 1 other in the stack will be added to the merge queue when they all meet the merge requirements.',
        '此拉取请求与堆栈中的其他 1 个拉取请求将在全部满足合并要求后加入合并队列。'
      ]
    ],
    misses: ['This pull request and others in the stack will automatically merge when they all meet the merge requirements.']
  },
  {
    hits: [['Are you sure you want to disable auto-merge for 3 pull requests?', '确定要为 3 个拉取请求禁用自动合并吗？']],
    misses: ['Are you sure you want to disable auto-merge?']
  },
  // merge-flow：codespace 清理
  {
    hits: [
      ['Delete 2 codespaces', '删除 2 个代码空间'],
      ['Delete codespace', '删除代码空间']
    ],
    misses: ['Delete all codespaces']
  },
  {
    hits: [
      ['Deleting 2 codespaces.', '正在删除 2 个代码空间。'],
      ['Deleting codespace.', '正在删除代码空间。']
    ],
    misses: ['Deleting codespaces']
  },
  {
    hits: [
      ["Couldn't delete 2 codespaces", '无法删除 2 个代码空间'],
      ['Couldn’t delete codespace', '无法删除代码空间']
    ],
    misses: ['Could not delete codespace']
  },
  {
    hits: [
      [
        'You’re all set — the 2 codespaces for head branch can be safely deleted. You can also manage your codespaces in',
        '一切就绪——头部分支的 2 个代码空间可以安全删除。你也可以在以下位置管理代码空间'
      ]
    ],
    misses: ['You’re all set — the 2 codespaces for head branch can be safely deleted.']
  },
  {
    hits: [['Are you sure you want to delete 2 codespaces for the head branch?', '确定要删除头部分支的 2 个代码空间吗？']],
    misses: ['Are you sure you want to delete codespaces for the head branch?']
  },
  // merge-flow：堆栈合并与变基
  {
    hits: [['3 pull requests are being merged.', '正在合并 3 个拉取请求。']],
    misses: ['Pull requests are being merged.']
  },
  {
    hits: [['Merging this pull request will also merge 2 pull requests below it.', '合并此拉取请求还将合并其下方的 2 个拉取请求。']],
    misses: ['Merging this pull request will also merge pull requests below it.']
  },
  { hits: [['2 of 5 pull requests loading', '正在加载 2/5 个拉取请求']], misses: ['Pull requests loading'] },
  { hits: [['2 of 4 branches rebased', '已变基 2/4 个分支']], misses: ['All branches rebased'] },
  {
    hits: [
      [
        'Resolve the merge conflicts in pull request #12, then try to rebase this stack again.',
        '请先解决拉取请求 #12 中的合并冲突，然后重新变基此堆栈。'
      ]
    ],
    misses: ['Resolve the merge conflicts in pull request #12.']
  },
  {
    hits: [
      ['Check pull request #12 for any issues, then try to rebase this stack again.', '请检查拉取请求 #12 是否有问题，然后重新变基此堆栈。']
    ],
    misses: ['Check pull request #12 for any issues.']
  },
  {
    hits: [['Rebase this stack onto the latest version of main.', '将此堆栈变基到 main 的最新版本。']],
    misses: ['Rebase this stack onto main.']
  },
  // merge-flow：在场证明
  {
    hits: [['This requirement was satisfied by octocat', '此要求已由 octocat 满足']],
    misses: ['This requirement was satisfied by Mona Lisa']
  },

  // timeline：审查强度
  {
    hits: [
      ['requested a balanced review from', '请求均衡审查者'],
      ['requested a Lite review from', '请求轻量审查者'],
      ['requested an auto review from', '请求自动审查者']
    ],
    misses: ['requested a quick review from']
  },
  {
    hits: [
      ['and a thorough review from', '以及深度审查者'],
      ['and a max review from', '以及最高审查者']
    ],
    misses: ['and a review from']
  },
  // timeline：提交
  {
    hits: [
      ['added 3 commits', '添加了 3 个提交'],
      ['added 1 commit', '添加了 1 个提交']
    ],
    misses: ['added some commits']
  },
  { hits: [['and others added 5 commits', '等人添加了 5 个提交']], misses: ['and others added commits'] },
  // timeline：自动合并与合并队列
  { hits: [['enabled auto-merge (squash)', '启用了自动合并（压缩）']], misses: ['enabled auto-merge (fast-forward)'] },
  {
    hits: [['enabled auto-merge for pull request #12 (rebase)', '为拉取请求 #12 启用了自动合并（变基）']],
    misses: ['enabled auto-merge for pull request #12']
  },
  {
    hits: [
      ['removed from the queue due to failed status checks', '因状态检查失败从队列中删除'],
      ['removed from the queue due to a conflict with the base branch', '因与基础分支冲突从队列中删除']
    ],
    misses: ['removed from the queue due to cosmic rays']
  },
  {
    hits: [['removed this pull request from the merge queue due to a manual request', '因手动请求将此拉取请求移出合并队列']],
    misses: ['removed this pull request from the merge queue']
  },
  // 原因在链接后：removed this pull request from the <merge queue> due to …
  {
    hits: [
      ['due to failed status checks', '原因是状态检查失败'],
      ['because a manual request', '原因是手动请求']
    ],
    misses: ['due to a typo']
  },
  // timeline：堆栈
  {
    hits: [['added this pull request to stack #4', '将此拉取请求添加到堆栈 #4']],
    misses: ['added this pull request to stack']
  },
  {
    hits: [['removed this pull request from stack #4', '将此拉取请求移出堆栈 #4']],
    misses: ['removed this pull request from stack']
  },
  // timeline：项目状态（原文无标点，与问题时间线同一写法：状态名不加引号，项目链接前用“于”）
  {
    hits: [
      ['moved this from Todo to In Progress in', '将此拉取请求从 Todo 移至 In Progress 于'],
      ['moved this from No status to Done in', '将此拉取请求从无状态移至 Done 于']
    ],
    misses: ['moved this from Todo to In Progress']
  },
  { hits: [['moved this to Done in', '将此拉取请求移至 Done 于']], misses: ['moved this to Done'] },
  // timeline：交叉引用
  {
    hits: [
      ['mentioned this in 3 issues', '在 3 个议题中提及了此拉取请求'],
      ['mentioned this in 2 pull requests', '在 2 个拉取请求中提及了此拉取请求']
    ],
    misses: ['mentioned this in an issue']
  },
  // timeline：锁定
  {
    hits: [
      ['locked and limited conversation to collaborators', '锁定了对话并限制为仅协作者可评论'],
      ['locked as off-topic and limited conversation to collaborators', '以偏离主题为由锁定了对话并限制为仅协作者可评论'],
      ['locked as too heated and limited conversation to collaborators', '以争论过激为由锁定了对话并限制为仅协作者可评论']
    ],
    misses: ['locked as rude and limited conversation to collaborators']
  },
  {
    hits: [['locked this conversation as spam', '以垃圾信息为由锁定了此对话']],
    misses: ['locked this conversation as rude']
  },
  // 单独的原因片段（与问题时间线同一写法）
  {
    hits: [
      ['as off topic', '以偏离主题为由'],
      ['as resolved', '以已解决为由']
    ],
    misses: ['as rude']
  },
  // timeline：检查结果
  { hits: [['12 of 15 checks passed', '12/15 个检查通过']], misses: ['All checks passed'] },
  {
    hits: [
      ['3 checks passed', '3 个检查通过'],
      ['1 check passed', '1 个检查通过']
    ],
    misses: ['Checks passed']
  },
  { hits: [['2 checks failed', '2 个检查失败']], misses: ['Checks failed'] },
  // timeline：评论
  { hits: [['3 similar comments', '3 条相似评论']], misses: ['Similar comments'] },
  { hits: [['5 previous comments', '5 条之前的评论']], misses: ['Previous comments'] },
  {
    hits: [
      ["Reason for dismissing octocat's review", '消除 octocat 审查的原因'],
      ['Reason for dismissing hubot’s review', '消除 hubot 审查的原因']
    ],
    misses: ['Reason for dismissing the review']
  },
  // timeline：活动面板
  { hits: [['Showing 20 of 45 loaded events', '显示 20/45 条已加载事件']], misses: ['Showing all loaded events'] },
  {
    hits: [
      ['12 activities', '12 条活动'],
      ['1 activity', '1 条活动']
    ],
    misses: ['Recent activities']
  },
  { hits: [['Expand 3 activities', '展开 3 条活动']], misses: ['Expand activities'] },
  { hits: [['Collapse 1 activity', '折叠 1 条活动']], misses: ['Collapse activities'] },
  { hits: [['Activity filters (2 active)', '活动筛选器（2 个已激活）']], misses: ['Activity filters (none active)'] },
  { hits: [['Activity (12)', '活动 (12)']], misses: ['Activity 12'] },
  { hits: [['Filter activity: commits', '筛选活动：commits']], misses: ['Filter activity'] },
  {
    hits: [
      ['Sort comments: Oldest', '评论排序：最早'],
      ['Sort activity: Newest', '活动排序：最新']
    ],
    misses: ['Sort comments: Popular']
  },
  // timeline：活动筛选报错
  {
    hits: [
      ['Enter a value for type:.', '请输入 type: 的值。'],
      ['Enter a value for since:.', '请输入 since: 的值。']
    ],
    misses: ['Enter a value for author:.']
  },
  {
    hits: [
      [
        'Use an available since: preset or an ISO timestamp, such as 2026-10-01T00:00:00Z.',
        '请使用可用的 since: 预设或 ISO 时间戳，例如 2026-10-01T00:00:00Z。'
      ]
    ],
    misses: ['Use an available since: preset or an ISO timestamp.']
  },
  {
    hits: [['View session cdd1a9dd-ca4f-4c64-9b37-08e6eb49d588', '查看会话 cdd1a9dd-ca4f-4c64-9b37-08e6eb49d588']],
    misses: ['View session details']
  },

  // review
  {
    hits: [
      ['3 pending comments', '3 条待处理的评论'],
      ['1 pending comment', '1 条待处理的评论']
    ],
    misses: ['Many pending comments']
  },
  {
    hits: [
      ['Comment on line R12', '评论第 R12 行'],
      ['Commenting on lines +12 to +14', '评论第 +12 至 +14 行'],
      ['Comment on lines L3 to L5', '评论第 L3 至 L5 行']
    ],
    misses: ['Comment on this line']
  },
  { hits: [['Commit 3 suggestions', '提交 3 条建议']], misses: ['Commit all suggestions'] },
  {
    hits: [
      ['2 suggestions in batch', '批次中有 2 条建议'],
      ['1 suggestion in batch', '批次中有 1 条建议']
    ],
    misses: ['Suggestions in batch']
  },
  // review：放弃批次（数量后是独立的 <suggestions> 片段）
  {
    hits: [['Are you sure you want to discard this batch? This will remove all 3', '确定要放弃此批次吗？此操作会将全部 3 条']],
    misses: ['Are you sure you want to discard this batch?']
  },
  // review：提交建议失败的原因
  {
    hits: [['There was an error trying to commit changes: Head branch was modified.', '提交更改时出错：Head branch was modified.']],
    misses: ['There was an error trying to commit changes:']
  },
  // review：自动审查警报的消除状态
  {
    hits: [
      ['requested to dismiss', '请求消除'],
      ['requested to close as false positive', '请求以误报为由关闭'],
      ["requested to dismiss as won't fix", '请求以不予修复为由消除']
    ],
    misses: ['requested to reopen']
  },
  {
    hits: [
      ['This alert was dismissed', '此警报已被消除'],
      ['This finding was dismissed as used in tests', '此发现已以用于测试为由消除']
    ],
    misses: ['This alert was fixed']
  },
  {
    hits: [
      ['dismissed this alert as false positive', '以误报为由消除了此警报'],
      ['closed this finding', '关闭了此发现']
    ],
    misses: ['reopened this alert']
  },
  {
    hits: [
      ['Dismissing the alert will mark this conversation as resolved.', '消除此警报会将此对话标记为已解决。'],
      ['Dismissing the finding will mark this conversation as resolved.', '消除此发现会将此对话标记为已解决。']
    ],
    misses: ['Dismissing the review will mark this conversation as resolved.']
  },

  // sidebar：审查者
  {
    hits: [
      ['Awaiting requested review from octocat', '正在等待 octocat 的审查'],
      ['Awaiting requested review from copilot-pull-request-reviewer[bot]', '正在等待 copilot-pull-request-reviewer[bot] 的审查']
    ],
    misses: ['Awaiting requested review from Mona Lisa']
  },
  {
    hits: [
      ['Awaiting requested review from octo-org/core', '正在等待 octo-org/core 的审查'],
      ['Awaiting requested review from @octo-org/core', '正在等待 @octo-org/core 的审查']
    ],
    misses: ['Awaiting requested review']
  },
  {
    hits: [['octocat is a code owner automatically assigned from octo-org/core', 'octocat 是从 octo-org/core 自动分配的代码所有者']],
    misses: ['octocat is a code owner automatically assigned']
  },
  {
    hits: [
      ['octo-org/docs is a code owner automatically assigned from octo-org/core', 'octo-org/docs 是从 octo-org/core 自动分配的代码所有者']
    ],
    misses: ['Docs team is a code owner automatically assigned from octo-org/core']
  },
  { hits: [['octocat is a code owner', 'octocat 是代码所有者']], misses: ['Mona Lisa is a code owner'] },
  {
    hits: [['@octo-org/core is a code owner', '@octo-org/core 是代码所有者']],
    misses: ['octo-org core is a code owner']
  },
  { hits: [['octocat left review comments', 'octocat 留下了审查评论']], misses: ['Mona Lisa left review comments'] },
  {
    hits: [
      ['3 more reviewers', '另外 3 个审查者'],
      ['1 more reviewer', '另外 1 个审查者']
    ],
    misses: ['More reviewers']
  },
  { hits: [['Re-request review from octocat', '重新请求 octocat 审查']], misses: ['Re-request review from Mona Lisa'] },
  { hits: [['Request review from hubot', '请求 hubot 审查']], misses: ['Request review from Mona Lisa'] },
  { hits: [['Request up to 15 reviewers', '最多请求 15 个审查者']], misses: ['Request up to many reviewers'] },
  // sidebar：经典侧栏审查者区无审查时的提示（— 连接两分句）
  {
    hits: [
      ['No reviews—at least 1 approving review is required.', '暂无审查——至少需要 1 个批准审查。'],
      ['No reviews—at least 2 approving reviews are required.', '暂无审查——至少需要 2 个批准审查。']
    ],
    misses: ['No reviews—at least one approving review is required.']
  },
  // sidebar：请求审查的进度与结果
  {
    hits: [
      ['Re-requesting review from octocat', '正在重新请求 octocat 审查'],
      ['Re-requesting review from @octo-org/core', '正在重新请求 @octo-org/core 审查']
    ],
    misses: ['Re-requesting review']
  },
  { hits: [['Requesting review from Copilot', '正在请求 Copilot 审查']], misses: ['Requesting review from'] },
  { hits: [['Request a review from octocat now', '立即请求 octocat 审查']], misses: ['Request a review now'] },
  { hits: [['Review requested from octocat', '已请求 octocat 审查']], misses: ['Review requested from'] },
  {
    hits: [['Failed to re-request review from octocat.', '重新请求 octocat 审查失败。']],
    misses: ['Failed to re-request review from octocat']
  },
  { hits: [['Members of @octo-org/core', '@octo-org/core 的成员']], misses: ['Members of'] },
  {
    hits: [
      ['Copilot will automatically review once the pull request is marked ready for review', 'Copilot 将在拉取请求标记为可供审查后自动审查']
    ],
    misses: ['Someone will automatically review once marked ready']
  },
  {
    hits: [['octocat will be requested when the pull request is marked ready for review', '将在拉取请求标记为可供审查后请求 octocat 审查']],
    misses: ['octocat will be requested soon']
  },
  {
    hits: [
      ['Reviewing', '正在审查'],
      ['Reviewing at balanced effort', '正在以均衡强度审查'],
      ['Reviewing at thorough effort · Last completed: lite', '正在以深度强度审查 · 上次完成：轻量']
    ],
    misses: ['Reviewing at extreme effort']
  },
  // sidebar：受理人
  {
    hits: [['Assign up to 10 people to this pull request', '最多为此拉取请求分配 10 人']],
    misses: ['Assign up to 10 people to this issue']
  },

  // files：已查看进度
  { hits: [['1 of 3 files viewed', '已查看 1/3 个文件']], misses: ['All files viewed'] },
  {
    hits: [
      ['1 / 3 files viewed', '已查看 1/3 个文件'],
      ['2/5 files viewed', '已查看 2/5 个文件']
    ],
    misses: ['1 / many files viewed']
  },
  { hits: [['/ 3 files viewed', '/ 3 个文件已查看']], misses: ['/ many files viewed'] },
  // files：提交范围
  {
    hits: [
      ['3 commits selected', '已选择 3 个提交'],
      ['1 commit selected', '已选择 1 个提交']
    ],
    misses: ['Some commits selected']
  },
  { hits: [['Commit 2 selected', '已选择第 2 个提交']], misses: ['Commit selected'] },
  { hits: [['Commits 2 to 5 selected', '已选择第 2 至 5 个提交']], misses: ['Commits 2 to 5'] },
  {
    hits: [
      ['octocat committed 3 days ago', 'octocat 提交于 3 天前'],
      ['dependabot[bot] committed 3 days ago', 'dependabot[bot] 提交于 3 天前'],
      ['octocat committed yesterday', 'octocat 提交于昨天'],
      ['octocat committed about 1 year ago', 'octocat 提交于约 1 年前']
    ],
    misses: ['octocat committed recently']
  },
  { hits: [['All 3 file types selected', '已选择全部 3 种文件类型']], misses: ['All file types selected'] },
  // files：侧边面板
  {
    hits: [
      ['Open merge status panel', '打开合并状态面板'],
      ['Close description panel', '关闭描述面板'],
      ['Open activity panel', '打开活动面板']
    ],
    misses: ['Open settings panel']
  },
  {
    hits: [
      ['The description panel cannot currently be opened.', '暂时无法打开描述面板。'],
      ['The merge status panel cannot currently be opened.', '暂时无法打开合并状态面板。']
    ],
    misses: ['The settings panel cannot currently be opened.']
  },
  {
    hits: [
      ['3 alerts', '3 条警报'],
      ['1 alert', '1 条警报']
    ],
    misses: ['No alerts']
  },
  {
    hits: [
      ['Only the first 300 files are currently being shown.', '当前仅显示前 300 个文件。'],
      // 原文只有 and、没有逗号：不加顿号
      ['Only the first 300 files and latest 100 comments are currently being shown.', '当前仅显示前 300 个文件和最新 100 条评论。'],
      [
        'Only the first 300 files, latest 100 comments, and first 50 alerts are currently being shown.',
        '当前仅显示前 300 个文件、最新 100 条评论、前 50 条警报。'
      ]
    ],
    misses: ['Only the first files are currently being shown.']
  },
  // files：文件头
  {
    hits: [['src/old.ts renamed to src/new.ts', 'src/old.ts 重命名为 src/new.ts']],
    misses: ['old file renamed to new file']
  },
  {
    hits: [
      ['Expand all lines: src/app.ts', '展开所有行：src/app.ts'],
      ['Collapse non-diff lines: README.md', '折叠无差异的行：README.md']
    ],
    misses: ['Expand some lines: src/app.ts']
  },
  { hits: [['(from CODEOWNERS line 12)', '（来自 CODEOWNERS 第 12 行）']], misses: ['(from CODEOWNERS)'] },
  {
    hits: [['Owned by @octo-org/core (from CODEOWNERS line 12)', '所有者为 @octo-org/core（来自 CODEOWNERS 第 12 行）']],
    misses: ['Owned by @octo-org/core']
  },
  { hits: [['Diff for: src/app.ts', '差异：src/app.ts']], misses: ['Diff for src/app.ts'] },
  { hits: [['Loading src/app.ts', '正在加载 src/app.ts']], misses: ['Loading Makefile'] },
  // files：文件树提示
  {
    hits: [
      ['src/app.ts has 3 comments', 'src/app.ts 有 3 条评论'],
      ['src/app.ts has 9+ comments and has warning annotations', 'src/app.ts 有 9+ 条评论和警告注释']
    ],
    misses: ['src/app.ts has no comments']
  },
  {
    hits: [['src/app.ts has failure annotations', 'src/app.ts 有失败注释']],
    misses: ['src/app.ts has error annotations']
  },
  // files：展开隐藏行
  {
    hits: [['Expand file from line 10 to line 30', '展开文件第 10 行至第 30 行']],
    misses: ['Expand file from line 10']
  },
  { hits: [['Expand file down from line 42', '从第 42 行向下展开文件']], misses: ['Expand file down'] },
  { hits: [['Expand file up from line 7', '从第 7 行向上展开文件']], misses: ['Expand file up'] },
  // files：行操作
  {
    hits: [
      ['Add comment on line R12', '在 R12 行添加评论'],
      ['Suggest change, modified lines R3-R5', '在修改后的 R3-R5 行建议更改'],
      ['Add comment, original line L7', '在原始的 L7 行添加评论']
    ],
    misses: ['Add comment on line 12']
  },
  { hits: [['R12 selected.', '已选择 R12。']], misses: ['R12 selected'] },
  { hits: [['L3 to R5 selected.', '已选择 L3 至 R5。']], misses: ['L3 to R5 selected'] },
  {
    hits: [["octocat's avatar image with pending indicator", 'octocat 的头像带有待处理标记']],
    misses: ["Mona Lisa's avatar image with pending indicator"]
  },

  // commits
  {
    hits: [
      ['Commits on Oct 26, 2026', '2026 年 10 月 26 日的提交'],
      ['Commits on Jan 5', '1 月 5 日的提交']
    ],
    misses: ['Commits on main']
  },
  { hits: [['Copy full SHA for 1a2b3c4', '复制 1a2b3c4 的完整 SHA']], misses: ['Copy full SHA for main'] },
  {
    hits: [
      ['Show description for 0ff253b', '显示 0ff253b 的描述'],
      ['Hide description for 0ff253bcd', '隐藏 0ff253bcd 的描述']
    ],
    misses: ['Show description for main']
  },
  {
    hits: [
      ['View 2 commit comments', '查看 2 条提交评论'],
      ['View 1 commit comment', '查看 1 条提交评论']
    ],
    misses: ['View commit comments']
  },
  { hits: [['3 people', '3 人']], misses: ['many people'] },
  {
    hits: [
      ['verified: 0ff253b', '已验证：0ff253b'],
      ['partially verified: 0ff253b', '部分验证：0ff253b']
    ],
    misses: ['verified: main']
  },
  { hits: [['Verification error: 0ff253b', '验证错误：0ff253b']], misses: ['Verification error'] },

  // checks
  {
    hits: [
      ['This check passed', '此检查已通过'],
      ['This job was skipped', '此作业已跳过'],
      ['This check had a startup failure', '此检查启动失败'],
      // Pending（检查）→ 挂起，整句作“处于挂起状态”
      ['This check is pending', '此检查处于挂起状态']
    ],
    misses: ['This check exploded']
  },
  {
    hits: [
      ['in 30s', '用时 30 秒'],
      ['in 1m 5s', '用时 1 分钟 5 秒']
    ],
    misses: ['in 30 seconds']
  },
  { hits: [['View more details on Codecov', '在 Codecov 上查看更多详细信息']], misses: ['View more details'] },
  {
    hits: [
      ['3 errors', '3 个错误'],
      ['1 warning', '1 个警告'],
      ['2 notices', '2 个提示'],
      // 原文只有 and：不加顿号（与 actions 词典同译）
      ['2 errors and 6 notices', '2 个错误和 6 个提示'],
      ['1 error, 2 warnings, and 3 notices', '1 个错误、2 个警告和 3 个提示']
    ],
    misses: ['3 failures']
  },
  {
    hits: [
      // 原文只有句号：不加逗号（与 actions 词典同译）
      ['Process completed with exit code 1.', '进程以退出代码 1 完成。'],
      ['Process completed with exit code -1.', '进程以退出代码 -1 完成。']
    ],
    misses: ['Process completed with exit code one.']
  },

  // compare
  {
    hits: [
      [
        'Pull request creation failed. Validation failed: A pull request already exists for octocat:feature.',
        '拉取请求创建失败。验证失败：octocat:feature 已存在拉取请求。'
      ]
    ],
    misses: ['Pull request creation failed.']
  },
  {
    hits: [['No commits between main and feature', 'main 和 feature 之间没有提交']],
    misses: ['No commits between these branches']
  },

  // overview：迷你合并状态
  { hits: [['2 of 3 approvals', '2/3 个批准']], misses: ['2 of 3 approvals pending'] },
  {
    hits: [['1 of 2 required approvals received', '已获得 1/2 个必需的批准']],
    misses: ['required approvals received']
  },
  { hits: [['1 of 2 reviews approved', '1/2 个审查已批准']], misses: ['all reviews approved'] },
  { hits: [['5 of 7 successful checks', '5/7 个检查成功']], misses: ['all successful checks'] },
  { hits: [['3 of 4 resolved comments', '已解决 3/4 条评论']], misses: ['all resolved comments'] },
  // overview：活动摘要
  {
    hits: [
      ['2 approved with 1 comment', '2 个批准含 1 条评论'],
      ['1 approved with 3 comments', '1 个批准含 3 条评论']
    ],
    misses: ['approved with comments']
  },
  {
    hits: [['1 requested changes with 2 comments', '1 个更改请求含 2 条评论']],
    misses: ['requested changes with comments']
  },
  {
    hits: [
      ['3 approved', '3 个批准'],
      ['1 approved', '1 个批准']
    ],
    misses: ['all approved']
  },
  {
    hits: [
      ['4 new commits', '4 个新提交'],
      ['1 new commit', '1 个新提交']
    ],
    misses: ['new commits']
  },
  {
    hits: [
      ['2 review comments', '2 条审查评论'],
      ['1 review comment', '1 条审查评论']
    ],
    misses: ['review comments']
  },
  {
    hits: [
      ['2 requested reviewers changed', '已更改 2 个请求的审查者'],
      ['1 requested reviewer changed', '已更改 1 个请求的审查者']
    ],
    misses: ['requested reviewers changed']
  },
  {
    hits: [
      ['3 Copilot events', '3 个 Copilot 事件'],
      ['1 Copilot event', '1 个 Copilot 事件']
    ],
    misses: ['all Copilot events']
  },
  {
    hits: [
      ['2 base changes, 1 force push', '2 次基础分支更改、1 次强制推送'],
      ['1 base change, 3 force pushes', '1 次基础分支更改、3 次强制推送']
    ],
    misses: ['base changes, force pushes']
  },
  {
    hits: [
      ['2 base changes', '2 次基础分支更改'],
      ['1 base change', '1 次基础分支更改']
    ],
    misses: ['base changes']
  },
  {
    hits: [
      ['2 force pushes', '2 次强制推送'],
      ['1 force push', '1 次强制推送']
    ],
    misses: ['force pushes']
  },
  {
    hits: [
      ['3 unsubmitted items — only visible to you until submitted', '3 个未提交的项——提交前仅你可见'],
      ['1 unsubmitted item — only visible to you until submitted', '1 个未提交的项——提交前仅你可见']
    ],
    misses: ['unsubmitted items — only visible to you until submitted']
  },
  { hits: [['+3 more', '另外 3 个']], misses: ['+ more'] },
  {
    hits: [['Feedback is too long. Use 1000 characters or fewer.', '反馈过长。最多 1000 个字符。']],
    misses: ['Feedback is too long.']
  },

  // comments：评论列表
  {
    hits: [
      ['Showing 3 of 10 comments', '显示 3/10 条评论'],
      ['Showing 3 of 10 loaded comments', '显示 3/10 条已加载的评论'],
      ['Showing 3 of 10 review comments', '显示 3/10 条审查评论']
    ],
    misses: ['Showing all comments']
  },
  {
    hits: [['Only the 200 latest comments are being shown.', '仅显示最新的 200 条评论。']],
    misses: ['Only the latest comments are being shown.']
  },
  {
    hits: [
      ['2 earlier comments', '2 条更早的评论'],
      ['1 earlier comment', '1 条更早的评论']
    ],
    misses: ['earlier comments']
  },
  {
    hits: [
      ['1 later reply', '1 条后续回复'],
      ['4 later replies', '4 条后续回复']
    ],
    misses: ['later replies']
  },
  // comments：折叠的提交
  { hits: [['3 additional commits', '另外 3 个提交']], misses: ['additional commits'] },
  { hits: [['3 additional commits by', '另外 3 个提交来自']], misses: ['additional commits by'] },
  {
    hits: [
      ['3 additional commits by alice, bob, starting at commit 0ff253b', '另外 3 个提交来自 alice, bob，从提交 0ff253b 开始'],
      ['2 additional commits, starting at commit 0ff253b', '另外 2 个提交，从提交 0ff253b 开始']
    ],
    misses: ['additional commits, starting at commit 0ff253b']
  },
  { hits: [['Commit: Fix the login redirect', '提交：Fix the login redirect']], misses: ['Commit:'] },
  // comments：条目加载与更新失败
  {
    hits: [
      ['Failed to load comment', '加载评论失败'],
      ['Failed to load review', '加载审查失败']
    ],
    misses: ['Failed to load pull request']
  },
  {
    hits: [
      ['This comment cannot be displayed. Please reload the page to try again.', '无法显示此评论。请重新加载页面后重试。'],
      ['This review cannot be displayed. Please reload the page to try again.', '无法显示此审查。请重新加载页面后重试。']
    ],
    misses: ['This file cannot be displayed. Please reload the page to try again.']
  },
  {
    hits: [
      ['Failed to update comment', '更新评论失败'],
      ['Failed to update review', '更新审查失败']
    ],
    misses: ['Failed to update pull request']
  },
  {
    hits: [
      ['Review comment by octocat', 'octocat 的审查评论'],
      ['Review comment by unknown user', '未知用户的审查评论']
    ],
    misses: ['Review comment by']
  },
  // comments：线程标题
  { hits: [['Line 12', '第 12 行']], misses: ['Line twelve'] },
  { hits: [['Lines 3 - 5', '第 3 - 5 行']], misses: ['Lines 3 to 5'] },
  {
    hits: [
      ['Resolved as Addressed', '已解决为已处理'],
      ["Resolved as Won't fix", '已解决为不予修复'],
      ['Resolved as Incorrect', '已解决为不正确']
    ],
    misses: ['Resolved as duplicate']
  },
  // comments：带线程位置的读屏名称
  {
    hits: [
      ['Open review comment in src/app.ts, line 5', '展开 src/app.ts 第 5 行的审查评论'],
      ['Close review comment in docs/a b.md', '收起 docs/a b.md 的审查评论']
    ],
    misses: ['Open review comment in']
  },
  {
    hits: [['Jump to the comment in the diff for src/app.ts, line 5', '跳转到差异中 src/app.ts 第 5 行的评论']],
    misses: ['Jump to the comment']
  },
  {
    hits: [
      ['Resolve comment in src/app.ts, line 5', '解决 src/app.ts 第 5 行的评论'],
      ['Unresolve conversation in src/app.ts, lines 3 to 5', '取消解决 src/app.ts 第 3 至 5 行的对话'],
      ['Resolve conversation in docs/a b.md', '解决 docs/a b.md 的对话']
    ],
    misses: ['Resolve comment in']
  },
  {
    hits: [['Resolve with reason in src/app.ts, line 5', '附理由解决 src/app.ts 第 5 行的评论']],
    misses: ['Resolve with reason in']
  },
  {
    hits: [
      ['Write a reply in src/app.ts, line 5', '在 src/app.ts 第 5 行中回复'],
      ['Write a reply in README.md', '在 README.md 中回复']
    ],
    misses: ['Write a reply']
  },
  {
    hits: [
      ['View comment in diff for src/app.ts, line 5, 2 previous comments', '在差异中查看 src/app.ts 第 5 行的评论，之前有 2 条评论'],
      [
        'View comment in diff for src/app.ts, lines 3 to 5, 1 previous comment',
        '在差异中查看 src/app.ts 第 3 至 5 行的评论，之前有 1 条评论'
      ]
    ],
    misses: ['View comment in diff for src/app.ts']
  },
  {
    hits: [
      ["More actions for octocat's comment, 3:45 PM today", 'octocat 的评论的更多操作，今天 15:45'],
      ['More actions for review, 10:02 AM on October 26, 2025', '审查的更多操作，2025 年 10 月 26 日 10:02']
    ],
    misses: ["More actions for octocat's comment"]
  },
  {
    hits: [
      ["for octocat's review, 9:15 PM yesterday", '关于 octocat 的审查，昨天 21:15'],
      ['for comment, 3:45 PM on Oct 26', '关于评论，10 月 26 日 15:45']
    ],
    misses: ['for octocat']
  },
  // comments：批次管理
  {
    hits: [['View src/app.ts:12-14 in Files changed', '在已更改的文件中查看 src/app.ts:12-14']],
    misses: ['View in Files changed']
  },
  { hits: [['View comment on src/app.ts:12', '查看 src/app.ts:12 上的评论']], misses: ['View comment on'] },
  {
    hits: [['View full comment by octocat on src/app.ts', '查看 octocat 在 src/app.ts 上的完整评论']],
    misses: ['View full comment by octocat']
  },
  {
    hits: [['Remove src/app.ts:12-14 from batch (outdated)', '从批次中删除 src/app.ts:12-14（过时）']],
    misses: ['Remove from batch (outdated)']
  },
  { hits: [['Remove src/app.ts from batch', '从批次中删除 src/app.ts']], misses: ['Remove src/app.ts from the batch'] },
  {
    hits: [
      [
        'This batch doesn’t contain any suggestions to commit, and Fix with Copilot isn’t available on your account. You can still publish your review from the review menu.',
        '此批次不包含可提交的建议，且你的帐户不支持使用 Copilot 修复。你仍可在审查菜单中发布审查。'
      ],
      [
        'This batch contains items other than committable suggestions, so it can’t be committed, and Fix with Copilot isn’t available on pull requests from a fork. You can still publish your review from the review menu.',
        '此批次包含可提交建议以外的项，无法提交，且来自复刻的拉取请求不支持使用 Copilot 修复。你仍可在审查菜单中发布审查。'
      ]
    ],
    misses: ['This batch doesn’t contain any suggestions to commit. You can still publish your review from the review menu.']
  },

  // conflicts
  {
    hits: [
      ['2 conflicting files', '2 个冲突文件'],
      ['1 conflicting file', '1 个冲突文件']
    ],
    misses: ['many conflicting files']
  },
  {
    hits: [
      ['1 conflict', '1 处冲突'],
      ['4 conflicts', '4 处冲突']
    ],
    misses: ['no conflicts']
  },
  {
    hits: [['on this commit as Mona Lisa <mona@example.com>', '此提交并署名为 Mona Lisa <mona@example.com>']],
    misses: ['on this commit']
  },
  {
    hits: [['I understand, sign off and update feature', '我已了解，签署并更新 feature']],
    misses: ['I understand, sign off and update the branch']
  },

  // dashboard：全局 /pulls 收件箱
  {
    hits: [
      ['About the “Needs your review” section', '关于“需要你审查”分区'],
      ["About the “Needs your teams' review” section", '关于“需要你的团队审查”分区']
    ],
    misses: ['About the “Inbox” section']
  },
  // 原文无引号：补“分区”，不加“”
  {
    hits: [
      ['More options for Merging', '合并中分区的更多选项'],
      ['More options for Needs your teams’ review', '需要你的团队审查分区的更多选项']
    ],
    misses: ['More options for Inbox']
  },
  {
    hits: [
      ['Expand Needs your review', '展开需要你审查分区'],
      ["Collapse Needs your teams' review", '折叠需要你的团队审查分区']
    ],
    misses: ['Expand Inbox']
  },
  {
    hits: [
      ['Default to this view when visiting /pulls', '访问 /pulls 时默认打开此视图'],
      ['Default to this view when visiting github.com/pulls', '访问 github.com/pulls 时默认打开此视图']
    ],
    misses: ['Default to this view']
  },
  {
    hits: [
      ['Updated: Last month', '更新时间：过去一个月'],
      ['Updated: Any time', '更新时间：任意时间']
    ],
    misses: ['Updated: Last decade']
  },
  {
    hits: [
      ['Filter by age: Last 3 months', '按更新时间筛选：过去 3 个月'],
      ['Filter by age: Last year', '按更新时间筛选：过去一年']
    ],
    misses: ['Filter by age: Last decade']
  },
  {
    hits: [
      ['3 repositories selected', '已选择 3 个存储库'],
      ['1 repository selected', '已选择 1 个存储库']
    ],
    misses: ['All repositories selected']
  },
  // dashboard：选择存储库筛选框中组织自定义属性的 Exclude 建议项
  // 属性名为空时不命中（不带点的 Exclude <key> 由列表末尾的筛选框规则处理）
  { hits: [['Exclude props.cost-center', '排除属性：cost-center']], misses: ['Exclude props.'] },
  // dashboard：选择存储库筛选框中筛选键的 aria-label（同 organization 词典）
  {
    hits: [
      ['Fork, Filter', '复刻，筛选器'],
      ['Admin Access, Filter', '管理员权限，筛选器'],
      ['Total stars, Filter', '星标总数，筛选器'],
      ['Created, Filter, Creation date', '创建日期，筛选器，创建日期'],
      ['Sort, Filter, Order of results', '排序，筛选器，结果顺序'],
      ['Language, Filter, Programming language', '语言，筛选器，编程语言'],
      // 自定义属性子键
      ['Property: team, Filter', '属性：team，筛选器'],
      ['Property: cost-center, Filter', '属性：cost-center，筛选器']
    ],
    misses: ['Fork Filter']
  },
  // 选择存储库筛选框中取值的 aria-label 由属性规则处理（见“选择存储库筛选框（全局 /pulls，DOM）”）
  // 非必填自定义属性的 Has / No 建议项（选择存储库筛选框不出；先于 <值>, Property: <属性名> 命中）
  {
    hits: [
      ['Has property: team', '有属性：team'],
      ['No property: cost center', '无属性：cost center'],
      ['Has Property: team, Property: team', '有属性：team，属性：team'],
      ['No Property: team, Property: team', '无属性：team，属性：team']
    ],
    misses: ['Has property:', 'Had property: team']
  },
  {
    hits: [
      ['True, Property: team', '是，属性：team'],
      ['False, Property: team', '否，属性：team'],
      // 组织自定义的取值保留原文
      ['Production, Property: environment', 'Production，属性：environment']
    ],
    misses: [', Property: team', 'True, Property:']
  },
  {
    hits: [
      ['Property: team', '属性：team'],
      ['Property: cost center', '属性：cost center']
    ],
    misses: ['Property:', 'Properties: team']
  },

  // list：计数
  {
    hits: [
      ['546 Open', '546 个打开的'],
      ['1,234 Open', '1,234 个打开的']
    ],
    misses: ['All Open']
  },
  { hits: [['12,345 Closed', '12,345 个已关闭的']], misses: ['All Closed'] },
  { hits: [['42 Total', '共 42 个']], misses: ['Grand Total'] },
  // list：列表项
  { hits: [['#123 opened', '#123 创建于']], misses: ['#abc opened'] },
  { hits: [['#123 by', '#123 由']], misses: ['#abc by'] },
  {
    hits: [['Open pull requests created by octocat', 'octocat 创建的打开的拉取请求']],
    misses: ['Open pull requests created by Mona Lisa']
  },
  // list：空状态
  {
    hits: [['No issues and pull requests matched your search', '没有匹配的议题和拉取请求']],
    misses: ['No issues matched your search']
  },
  {
    hits: [
      ['Search for pull requests.', '搜索拉取请求。'],
      ['Search for issues and pull requests.', '搜索议题和拉取请求。']
    ],
    misses: ['Search for issues.']
  },
  // list：首次贡献横幅标题（存储库名是相邻文本节点，拼接后整句匹配）
  {
    hits: [['👋 Want to contribute to vuejs/core?', '👋 想为 vuejs/core 做贡献吗？']],
    misses: ['👋 Want to contribute to this repository?']
  },
  { hits: [['3 pull requests in this stack', '此堆栈中有 3 个拉取请求']], misses: ['Pull requests in this stack'] },
  // list：筛选
  { hits: [['Filter by author octocat', '按作者 octocat 筛选']], misses: ['Filter by author Mona Lisa'] },
  { hits: [['Filter by assignee hubot', '按受理人 hubot 筛选']], misses: ['Filter by assignee Mona Lisa'] },
  { hits: [['Filter by label good first issue', '按标签 good first issue 筛选']], misses: ['Filter by labeling'] },
  {
    hits: [['Filter by repository octo-org/octo-repo', '按存储库 octo-org/octo-repo 筛选']],
    misses: ['Filter by repository octo-repo']
  },
  {
    hits: [
      ['Filter by review: Approved', '按审查筛选：已批准'],
      ['Filter by review: Awaiting review from you or your team', '按审查筛选：等待你或你的团队审查']
    ],
    misses: ['Filter by review: Pending']
  },
  // list：排序
  {
    hits: [
      ['Sort by Newest descending', '按最新降序排序'],
      ['Sort by Total comments ascending', '按评论总数升序排序']
    ],
    misses: ['Sort by Newest random']
  },
  {
    hits: [
      ['Sort by Last updated', '按最后更新排序'],
      ['Sort by Comments', '按评论数排序']
    ],
    misses: ['Sort by Priority']
  },
  // list：审查与检查状态
  {
    hits: [
      ['2 review approvals', '2 个批准'],
      ['1 review approval', '1 个批准']
    ],
    misses: ['Review approvals']
  },
  { hits: [['1 review requesting changes', '1 个审查请求更改']], misses: ['Reviews requesting changes'] },
  { hits: [['3/5 checks passing', '3/5 个检查通过']], misses: ['3 of 5 checks passing'] },
  {
    hits: [
      ['5 / 5 checks OK', '5/5 个检查正常'],
      ['4/5 checks OK', '4/5 个检查正常']
    ],
    misses: ['All checks OK']
  },
  {
    hits: [
      ['Status checks: success', '状态检查：成功'],
      ['Status checks: pending', '状态检查：挂起']
    ],
    misses: ['Status checks: unknown']
  },
  // list：任务列表（量词用“个”，与问题、个人主页贡献同译）
  {
    hits: [
      ['2 of 5 tasks', '5 个任务中已完成 2 个'],
      ['1 of 1 task', '1 个任务中已完成 1 个']
    ],
    misses: ['2 of many tasks']
  },
  { hits: [['3 tasks done', '3 个任务已完成']], misses: ['All tasks done'] },
  {
    hits: [
      ['3 tasks', '3 个任务'],
      ['1 task', '1 个任务']
    ],
    misses: ['Some tasks']
  },
  // list：链接的问题与反应
  {
    hits: [
      ['2 linked issues', '2 个链接的议题'],
      ['1 linked issue', '1 个链接的议题']
    ],
    misses: ['Linked issues']
  },
  {
    hits: [
      [
        '2 linked issues for pull request octo-org/octo-repo#12: Fix login bug',
        '拉取请求 octo-org/octo-repo#12 的 2 个链接的议题：Fix login bug'
      ]
    ],
    misses: ['2 linked issues for pull request #12: Fix login bug']
  },
  {
    hits: [
      ['3 Thumbs up reactions', '👍 3 个反应'],
      ['12 total reactions', '12 个反应'],
      ['1 Heart reaction', '❤️ 1 个反应']
    ],
    misses: ['5 Sparkles reactions']
  },
  { hits: [['Milestone: v2.0', '里程碑：v2.0']], misses: ['Milestone v2.0'] },
  { hits: [['+3, show all 5 assignees', '+3，显示全部 5 个受理人']], misses: ['+3 assignees'] },
  // list：无障碍名称
  {
    hits: [
      ['Status: Open.', '状态：打开。'],
      ['Status: Merged (completed).', '状态：已合并（已完成）。'],
      ['Status: Draft (not ready).', '状态：草稿（未就绪）。'],
      ['Status: Open (in progress).', '状态：打开（正在进行）。'],
      ['Status: Not planned (skipped).', '状态：未计划（已跳过）。'],
      ['Status: Duplicate of an existing item.', '状态：与已有项重复。']
    ],
    misses: ['Status: Pending.']
  },
  {
    hits: [
      ['Select: Fix login bug', '选择：Fix login bug'],
      ['Select:', '选择']
    ],
    misses: ['Select Fix login bug']
  },
  { hits: [['Selected. Fix login bug.', '已选择。Fix login bug。']], misses: ['Selected. Fix login bug'] },
  { hits: [['Unselected. Fix login bug.', '未选择。Fix login bug。']], misses: ['Unselected. Fix login bug'] },
  // list：全选与已选计数
  {
    hits: [
      ['Select all pull requests: Open pull requests', '全选拉取请求：Open pull requests'],
      ['Select all pull requests:', '全选拉取请求']
    ],
    misses: ['Select all issues: Open issues']
  },
  {
    hits: [
      ['3 pull requests selected', '已选择 3 个拉取请求'],
      ['1 pull request of 25 selected', '25 个拉取请求中已选择 1 个']
    ],
    misses: ['pull requests selected']
  },
  // 计数在独立节点中时的后半段（与问题列表同一写法）
  { hits: [['of 25 selected', '/25 已选择']], misses: ['of many selected'] },
  // list：批量更新
  {
    hits: [['2 pull requests returned to the list', '2 个拉取请求已返回列表']],
    misses: ['Pull requests returned to the list']
  },
  {
    hits: [
      ['Updating 10 pull requests', '正在更新 10 个拉取请求'],
      ['Updating 1 pull request', '正在更新 1 个拉取请求']
    ],
    misses: ['Updating pull requests']
  },
  { hits: [['Bulk update is in progress 40 %', '批量更新进行中 40%']], misses: ['Bulk update is in progress'] },
  {
    hits: [['Could not update 2 of 10 pull requests', '10 个拉取请求中有 2 个无法更新']],
    misses: ['Could not update some pull requests']
  },
  {
    hits: [
      ['10 pull requests updated', '已更新 10 个拉取请求'],
      ['1 pull request updated', '已更新 1 个拉取请求']
    ],
    misses: ['Pull requests updated']
  },
  // list：筛选框（与议题列表同一组件，规则取自 issues/filter.ts）
  {
    hits: [
      ['Author, Filter, The author of the item', '作者，筛选器，项的作者'],
      ['Base, Filter, Pull Request base branch', '基础分支，筛选器，拉取请求的基础分支']
    ],
    misses: ['Author Filter']
  },
  { hits: [['@me, Signed-in user', '@me，已登录用户']], misses: ['@octocat, Signed-in user'] },
  // 键与选择存储库筛选框的数据键同名时仍由本条处理（dashboard 的取值规则不收 Has / No 开头的）
  {
    hits: [
      ['Has Label, Label', '有标签，标签'],
      ['Has Language, Language', '有语言，语言']
    ],
    misses: ['Has Label, Milestone']
  },
  {
    hits: [
      ['No Milestone, Milestone', '无里程碑，里程碑'],
      ['No Organization, Organization', '无组织，组织']
    ],
    misses: ['No Milestone, Label']
  },
  {
    hits: [
      ['Has label', '有标签'],
      ['Has parent issue', '有父议题']
    ],
    misses: ['Has Label']
  },
  {
    hits: [
      ['Exclude author', '排除作者'],
      ['Exclude review-requested', '排除已请求审查'],
      ['Exclude merged', '排除合并日期']
    ],
    misses: ['Exclude Author']
  },
  {
    hits: [
      ['No assignee', '无受理人'],
      ['No label', '无标签']
    ],
    misses: ['No priority']
  },
  {
    hits: [
      ['Advanced filter dialog', '高级筛选器对话框'],
      ['Advanced filter dialog: 2 valid filters', '高级筛选器对话框：2 个有效筛选器']
    ],
    misses: ['Advanced filter dialog: no valid filters']
  },
  { hits: [['Row 2', '第 2 行']], misses: ['Row two'] },
  { hits: [['Delete filter 1: label:bug', '删除筛选器 1：label:bug']], misses: ['Delete filter: label:bug'] },
  {
    hits: [
      ['Qualifier 1', '限定符 1'],
      ['Label, Qualifier 2', '标签，限定符 2']
    ],
    misses: ['Qualifier one']
  },
  {
    hits: [
      ['Operator 1', '运算符 1'],
      ['is one of, Operator 1', '是以下之一，运算符 1']
    ],
    misses: ['Operator one']
  },
  {
    hits: [
      ['Value 1 From', '值 1 起始'],
      ['Value 2 To', '值 2 结束']
    ],
    misses: ['Value 1 Until']
  },
  {
    hits: [
      ['Value 1', '值 1'],
      ['True, Value 2', '是，值 2']
    ],
    misses: ['Value one']
  },
  { hits: [['Enter a number', '输入数字']], misses: ['Enter a color'] },
  { hits: [['Filter contains 2 issues:', '筛选器有 2 处错误：']], misses: ['Filter contains 2 issues'] },
  { hits: [["Filter 'reason' not supported", '不支持筛选器“reason”']], misses: ['Filter reason not supported'] },
  {
    hits: [["Filter 'involves' is deprecated and will be removed in the future", '筛选器“involves”已弃用且将来会被删除']],
    misses: ["Filter 'involves' is deprecated"]
  },
  { hits: [['Maximum nested groups of 5 exceeded', '嵌套分组超过上限 5']], misses: ['Maximum nested groups exceeded'] },
  {
    hits: [['Authenticate with SAML SSO to access', '使用 SAML SSO 进行身份验证以访问']],
    misses: ['Authenticate to access']
  },
  { hits: [['SSO required for octo-org', 'octo-org 需要 SSO']], misses: ['SSO required'] },
  {
    hits: [['label:bug is invalid', 'label:bug 无效']],
    misses: ['Title is invalid', "Name can't be blank. Name is invalid"]
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('pulls 正则词条', () => {
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

  it('审查者正则不把 previously 当作用户名', () => {
    // 已消除审查的状态标签（评论列表审查头部、时间线面板）由 timeline.ts 的页面词条收录
    const labels = [
      ...['previously approved', 'previously recommended approval', 'previously suggested changes'],
      ...['previously commented', 'previously reviewed', 'previously requested changes'],
      'previously approved these changes'
    ]
    expect(labels.filter(label => firstRule(label) !== -1)).toEqual([])
    expect(labels.filter(label => dict.scoped?.[label] === undefined)).toEqual([])
  })

  it('正则均锚定且不带 g / y 标志', () => {
    const invalid = RULES.map(([pattern]) => pattern).filter(
      pattern => !pattern.source.startsWith('^') || !pattern.source.endsWith('$') || /[gy]/.test(pattern.flags)
    )
    expect(invalid.map(String)).toEqual([])
  })

  it('长输入不会触发回溯爆炸', () => {
    const inputs = [
      `${'1 failing, '.repeat(300)}x checks`,
      `Collapse ${'1 failing, '.repeat(300)}x check group`,
      `moved this from ${'a to '.repeat(300)}!`,
      `${'a '.repeat(300)}Click to view details in the merge panel!`,
      `Owned by ${'x ('.repeat(300)}from CODEOWNERS line x)`,
      `Only the ${'first 1 files, '.repeat(300)}x are currently being shown.`,
      `${'a'.repeat(600)} has 3 comments and has x annotations`,
      `octocat ${'approved these changes '.repeat(100)}for !`,
      `Successful in ${'1m '.repeat(300)}x`,
      `View comment in diff for ${'a, 1 previous comments, '.repeat(200)}x`,
      `on this commit as ${'a@'.repeat(300)} `,
      `3 additional commits by ${'a, starting at commit 0ff253b, '.repeat(200)}!`,
      `Resolve comment in ${'src/a.ts, line 1, '.repeat(300)}`
    ]
    const start = performance.now()
    for (const input of inputs) translate(input)
    expect(performance.now() - start).toBeLessThan(500)
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['wants to merge ', '3', ' commits into'].join('')))).toBe('想要将 3 个提交合并到')
    expect(translate(normalizeText('wants to merge\n      3\n      commits into'))).toBe('想要将 3 个提交合并到')
    expect(translate(normalizeText(['Lines changed: ', '120', ' additions & ', '4', ' deletions'].join('')))).toBe(
      '更改行数：新增 120 行和删除 4 行'
    )
    expect(translate(normalizeText(['1', ' failing', ', ', '2', ' skipped', ', and ', '15', ' successful', ' checks'].join('')))).toBe(
      '1 个检查失败、2 个已跳过、15 个成功'
    )
    expect(translate(normalizeText(['There are ', '3', ' pull requests ahead of this one in the'].join('')))).toBe(
      '此拉取请求在以下队列中前面还有 3 个拉取请求'
    )
    expect(translate(normalizeText(['1', ' / ', '3', ' files viewed'].join('')))).toBe('已查看 1/3 个文件')
    expect(translate(normalizeText(['Bulk update is in progress ', '40', ' %'].join('')))).toBe('批量更新进行中 40%')
    expect(translate(normalizeText(['Commits on ', 'Oct 26, 2026'].join('')))).toBe('2026 年 10 月 26 日的提交')
    // Showing {3} of {10}{ loaded}{ comments}、This {comment} cannot be displayed. …
    expect(translate(normalizeText(['Showing ', '3', ' of ', '10', ' loaded', ' comments'].join('')))).toBe('显示 3/10 条已加载的评论')
    expect(translate(normalizeText(['This ', 'review', ' cannot be displayed. Please reload the page to try again.'].join('')))).toBe(
      '无法显示此审查。请重新加载页面后重试。'
    )
    expect(translate(normalizeText(['3 additional commits', ' by '].join('')))).toBe('另外 3 个提交来自')
    // 审查菜单 comments 模式：Submit {comments} / Discard {comments}
    expect(translate(normalizeText(['Submit ', 'comments'].join('')))).toBe('提交评论')
    expect(translate(normalizeText(['Discard ', 'comments'].join('')))).toBe('放弃评论')
    expect(translate(normalizeText(['Discard ', 'review'].join('')))).toBe('放弃审查')
    expect(dict.scoped?.comments).toBeUndefined()
  })

  it('被元素隔开的片段单独命中', () => {
    // octocat wants to merge <3> commits into <main> from <feature>
    expect(translate('wants to merge')).toBe('想要合并')
    expect(translate('commits into')).toBe('个提交到')
    expect(translate('from')).toBe('来自')
    // octocat force-pushed the <feature> branch from <sha> to <sha>
    expect(translate('force-pushed the')).toBe('强制推送了分支')
    // 经典时间线：<force-pushed>（比较链接） the <feature> branch from <sha> to <sha>
    expect(translate('force-pushed')).toBe('强制推送了')
    expect(translate('the')).toBe('分支')
    expect(translate('branch from')).toBe('从')
    expect(translate('to')).toBe('至')
    // octocat changed the base branch from <main> to <dev>
    expect(translate('changed the base branch from')).toBe('更改了基础分支从')
    // octocat merged commit <sha> into <main>
    expect(translate('merged commit')).toBe('合并了提交')
    expect(translate('into')).toBe('到')
    // This repository uses the <merge queue> for all merges into the <main> branch.
    expect(translate('This repository uses the')).toBe('此存储库使用')
    expect(translate('merge queue')).toBe('合并队列')
    expect(translate('for all merges into the')).toBe('来合并所有更改到')
    expect(translate('branch.')).toBe('分支。')
    // 冲突编辑器：Commit updates to the <feature> branch.
    expect(translate('Commit updates to the')).toBe('提交更改到')
    // Resolving conflicts between <main> and <feature> and committing changes
    expect(translate('Resolving conflicts')).toBe('正在解决冲突')
    expect(translate('between')).toBe('介于')
    expect(translate('and committing changes')).toBe('之间并提交更改')
    // Add more commits by pushing to the <feature> branch on <octo-org/octo-repo>.
    expect(translate('Add more commits by pushing to the')).toBe('推送更多提交到')
    expect(translate('branch on')).toBe('分支位于')
    // ProTip! Filter pull requests by the default branch with <base:main>.
    expect(translate('Filter pull requests by the default branch with')).toBe('按默认分支筛选拉取请求可用')
    expect(translate('Exclude your own pull requests with')).toBe('排除你自己的拉取请求可用')
  })
})

describe('pulls 静态词条', () => {
  it.each([
    // header
    ['Convert to draft', '转换为草稿'],
    ['Mark ready for review', '标记为可供审查'],
    ['Close pull request', '关闭拉取请求'],
    ['Copy head branch name to clipboard', '复制头部分支名称到剪贴板'],
    ["You can't remove the currently viewed pull request", '无法从堆栈中删除当前查看的拉取请求'],
    // mergebox
    ['Merge pull request', '合并拉取请求'],
    ['Squash and merge', '压缩并合并'],
    ['Rebase and merge', '变基并合并'],
    ['All checks have passed', '所有检查均已通过'],
    ['This branch has no conflicts with the base branch', '此分支与基础分支没有冲突'],
    ['Ready to merge when you are.', '随时可以合并。'],
    ['Update with rebase', '使用变基更新'],
    // merge-flow
    ['Delete branch', '删除分支'],
    ['Restore branch', '恢复分支'],
    ['Auto-merge enabled', '已启用自动合并'],
    ['Merge when ready', '准备就绪时合并'],
    // timeline
    ['linked an issue that may be closed by this pull request', '链接了一个可能被此拉取请求关闭的议题'],
    // review
    ['Review changes', '审查更改'],
    ['Submit review', '提交审查'],
    ['Finish your comments', '完成评论'],
    ['Resolve conversation', '解决对话'],
    ['Commit suggestion', '提交建议'],
    ['Sign off and commit suggestion', '签署并提交建议'],
    ['Sign off and commit suggestions', '签署并提交建议'],
    ['This code change can be committed by users with write permissions.', '具有写入权限的用户可以提交此代码更改。'],
    // comments
    ['There was an error trying to commit changes', '提交更改时出错'],
    // sidebar
    ['Allow edits by maintainers', '允许维护者编辑'],
    ['Successfully merging this pull request may close these issues.', '成功合并此拉取请求可能会关闭这些议题。'],
    // files
    ['Open comments panel', '打开评论面板'],
    ['Previous file (K)', '上一个文件 (K)'],
    ['Large diffs are not rendered by default.', '大型差异默认不渲染。'],
    // commits / checks / compare
    ['There are no commits in this pull request.', '此拉取请求中没有提交。'],
    ['Check suites', '检查套件'],
    ['Create pull request', '创建拉取请求'],
    // list
    ['New pull request', '新建拉取请求'],
    ['Search pull requests', '搜索拉取请求'],
    ['Pull requests requesting your review', '请求你审查的拉取请求'],
    // write access → 写入访问权限；原文界面名无引号，译文不加；Pending（检查）→ 挂起；Filter → 筛选器
    ['Head branch was pushed to by a user without write access', '没有写入访问权限的用户推送了头部分支'],
    ['Only reviews by reviewers with write access count toward mergeability', '只有具有写入访问权限的审查者的审查计入可合并性'],
    ['Some comments aren’t visible on the classic Files Changed page.', '部分评论在经典已更改的文件页面不可见。'],
    ['Fix with Copilot isn’t available.', '使用 Copilot 修复不可用。'],
    [
      'Command-line conflict-resolution instructions are available below. Select Done to proceed.',
      '下方提供了命令行解决冲突的说明。选择完成以继续。'
    ],
    ['Some of the pull requests in this stack have pending status checks.', '此堆栈中部分拉取请求有挂起的状态检查。'],
    ['No alerts match the current filter', '没有匹配当前筛选器的警报'],
    ['No comments match the current filter', '没有匹配当前筛选器的评论'],
    // ready for review → 可供审查
    ['Mark this pull request as ready when you want reviews.', '在需要审查时将此拉取请求标记为可供审查。'],
    ['This pull request is not ready for review yet.', '此拉取请求尚不可供审查。'],
    // 标点随原文：原文没有的逗号不加（句间句号照译，因果、条件改语序）
    ['An error occurred while closing this pull request. Please try again.', '关闭此拉取请求时出错。请重试。'],
    ['This pull request cannot be reopened because the head branch has been deleted.', '此拉取请求因头部分支已删除而无法重新打开。'],
    ['This pull request will be automatically merged when all requirements are met.', '此拉取请求将在满足所有要求时自动合并。'],
    ['Checks are failing and need attention.', '检查失败且需要处理。'],
    ["This pull request is big! We're only showing the most recent 250 commits", '此拉取请求较大！仅显示最近 250 个提交'],
    [
      'This page has been optimized for large pull requests. Some browser features (like Find on Page or Select All) may not work as expected.',
      '此页面已针对大型拉取请求优化。部分浏览器功能（如页面查找或全选）可能无法正常使用。'
    ],
    // open 指打开状态；名词 Filter → 筛选器
    ['Author has reached the open pull request limit', '作者已达到打开的拉取请求上限'],
    ['Change the pull requests type filter', '更改拉取请求类型筛选器'],
    // 产品名按 product-names.md 译出
    ['Batch sent to Copilot cloud agent.', '批次已发送给 Copilot 云代理。'],
    ['Copilot code review comment', 'Copilot 代码审查评论'],
    // 审查者列表中 Copilot 头像链接的读屏文字（与时间线的小写 copilot code review 同译）
    ['Copilot code review', 'Copilot 代码审查'],
    ['Some codespaces could not be deleted.', '部分代码空间无法删除。'],
    [
      'Copilot can monitor this pull request for failed Actions workflows and merge conflicts and fix them automatically.',
      'Copilot 可以监视此拉取请求中失败的操作工作流和合并冲突并自动修复。'
    ],
    // list：经典列表筛选菜单、空状态与首次贡献说明、全局 /pulls
    ['Filter Issues', '筛选议题'],
    // Search all X 与全站同作“搜索所有X”
    ['Search all issues', '搜索所有议题'],
    ['Search all pull requests', '搜索所有拉取请求'],
    ['Click a checkbox on the left to edit multiple issues at once.', '单击左侧的复选框可一次编辑多个议题。'],
    ['No projects found. Sorry about that.', '未找到项目。'],
    ['Awaiting review from you specifically', '等待你本人审查'],
    ['If you know how to fix an', '如果你知道如何修复某个'],
    [', consider opening a pull request for it.', '，可以考虑为其创建拉取请求。'],
    [
      'If you would like to submit code to this repository, consider opening a pull request.',
      '如果你想向此存储库提交代码，可以考虑创建拉取请求。'
    ],
    ['You can read this repository’s', '你可以阅读此存储库的'],
    ['to learn how to open a good pull request.', '以了解如何创建优质的拉取请求。'],
    ['Pull Requests mentioning you', '提及你的拉取请求'],
    ['Pull Requests requesting your review', '请求你审查的拉取请求'],
    ['Private repositories only', '仅专用存储库'],
    // files：经典版工具栏、提交范围、空状态、注释链接
    ['Review in codespace', '在代码空间中审查'],
    ['Jump to conversation', '跳转到对话'],
    ['All of your conversations have been resolved.', '你的所有对话均已解决。'],
    ['Review conversations will show up here.', '审查对话会显示在这里。'],
    ['Open overview side panel', '打开概述侧边面板'],
    ['You haven’t reviewed this pull request yet', '你尚未审查此拉取请求'],
    ['You are viewing the earliest commit', '你正在查看最早的提交'],
    ['You are viewing the latest commit', '你正在查看最新的提交'],
    ['No files found.', '未找到文件。'],
    [
      'Marking files as viewed can help keep track of your progress, but will not affect your submitted review',
      '将文件标记为已查看有助于跟踪你的进度，但不会影响你已提交的审查'
    ],
    ['View workflow job for this annotation', '查看此注释的工作流作业'],
    ['This merge commit was added into this branch cleanly.', '此合并提交已无冲突地添加到此分支。'],
    ['These merge commits were added into this branch cleanly.', '这些合并提交已无冲突地添加到此分支。'],
    ['There are no new changes to show, but you can still', '没有可显示的新更改，但你仍然可以'],
    ['There are no new changes to show.', '没有可显示的新更改。'],
    // review：经典审查菜单与批次建议
    ['Submit feedback approving these changes.', '提交批准这些更改的反馈。'],
    ['Pull request authors can’t approve their own pull request.', '拉取请求作者无法批准自己的拉取请求。'],
    ['Pull request authors can’t request changes on their own pull request.', '拉取请求作者无法对自己的拉取请求请求更改。'],
    [
      'Only users with explicit access to this repository may request changes to pull requests',
      '只有对此存储库具有明确访问权限的用户才能对拉取请求请求更改'
    ],
    ['You need to leave a comment indicating the requested changes.', '你需要发表评论说明所请求的更改。'],
    ['Commenting on lines', '评论行'],
    ['Suggestions cannot be applied on outdated comments.', '无法在过时的评论上应用建议。'],
    ['Batching suggestions must be done from the files tab.', '必须在已更改的文件标签页中批量处理建议。'],
    ['Remove this suggestion from those to be applied in batch', '从要批量应用的建议中删除此建议'],
    ['Apply all batched suggestions as a single commit', '将批次中的所有建议作为单个提交应用'],
    [
      'Multiple suggested changes can be batched together in a single commit. Each suggestion author will be attributed in the commit as a co-author.',
      '多个建议更改可以批量放入单个提交。每个建议作者都会在提交中被列为共同作者。'
    ],
    ['Applying commit...', '正在应用提交...'],
    ['This diff has recently been updated.', '此差异最近已更新。'],
    // sidebar：审查者、经典通知设置对话框、维护者编辑说明、经典锁定对话框
    ['Recently edited these files', '最近编辑过这些文件'],
    ['Requested changes must be addressed to merge this pull request.', '必须处理所请求的更改才能合并此拉取请求。'],
    [
      'Only receive notifications from this pull request when you have participated or have been @mentioned.',
      '仅在你参与或被 @提及时接收此拉取请求的通知。'
    ],
    ['Receive all notifications from this pull request.', '接收此拉取请求的所有通知。'],
    ['You will only be notified for the events selected from the list below.', '仅接收下方所选事件的通知。'],
    ['If you participate or are @mentioned you will be subscribed.', '你参与或被 @提及时将自动订阅。'],
    ['Receive a notification when this pull request has been merged.', '此拉取请求合并时接收通知。'],
    ['Receive a notification when this pull request has been closed.', '此拉取请求关闭时接收通知。'],
    ['Receive a notification when this pull request has been reopened.', '此拉取请求重新打开时接收通知。'],
    ['You can always change this setting later.', '你随时可以更改此设置。'],
    [
      "Note: By granting write access, maintainers could potentially edit your repository's workflows to reveal values of secrets and gain access to other branches.",
      '注意：授予写入访问权限后，维护者可能会编辑你存储库中的工作流以泄露机密的值并获得其他分支的访问权限。'
    ],
    ['will be able to comment on this pull request once more.', '都可以再次对此拉取请求发表评论。'],
    ['You can always unlock this pull request again in the future.', '你随时可以再次解锁此拉取请求。'],
    ['You can always lock this pull request again in the future.', '你随时可以再次锁定此拉取请求。'],
    ['Reason for locking', '锁定原因'],
    [
      'Optionally, choose a reason for locking that others can see. Learn more about when it’s appropriate to',
      '可选择其他人可见的锁定原因。了解何时适合'
    ],
    ['lock conversations', '锁定对话'],
    // merge-flow：草稿拉取请求推广、还原提示、状态链接
    ['Learn about draft PRs', '了解草稿 PR'],
    ['Try draft pull requests', '试用草稿拉取请求'],
    [
      "Open an in-progress pull request without asking for formal review or risking an unwanted merge. When you're ready for code review, you can mark your draft pull request as ready for review, which will request reviews from any code owners.",
      '创建进行中的拉取请求而不必请求正式审查或担心意外合并。准备好接受代码审查时，你可以将草稿拉取请求标记为可供审查，这将向所有代码所有者请求审查。'
    ],
    ['Create a new pull request to revert these changes', '创建新的拉取请求以还原这些更改'],
    ['View status', '查看状态'],
    // timeline：经典时间线隐去操作者的事件
    ['Repository owner locked and limited conversation to collaborators', '存储库所有者锁定了对话并限制为仅协作者可评论'],
    ['Repository owner deleted a comment', '存储库所有者删除了一条评论'],
    ['Repository owner deleted a comment from', '存储库所有者删除了以下用户的一条评论'],
    // header：正文编辑按钮、经典页闪现提示
    ['Edit pull request body', '编辑拉取请求正文'],
    ['Marked pull request as ready for review.', '已将拉取请求标记为可供审查。'],
    // mergebox：服务端下发的合并失败原因（方式名无引号，译文不加）
    ["You're not authorized to push to this branch. Visit", '你无权推送到此分支。请访问'],
    ['You’re not authorized to push to this branch. Visit', '你无权推送到此分支。请访问'],
    ['Merge is not an allowed merge method in this repository.', '合并不是此存储库允许的合并方式。'],
    ['Squash is not an allowed merge method in this repository.', '压缩不是此存储库允许的合并方式。'],
    ['Rebase is not an allowed merge method in this repository.', '变基不是此存储库允许的合并方式。'],
    ['User does not have push access to the repository.', '用户没有此存储库的推送权限。'],
    // review：经典页闪现提示、解决对话按钮提交中
    ['Your review was submitted successfully.', '你的审查已成功提交。'],
    ['Your review was submitted on a merged pull request.', '你在已合并的拉取请求上提交了审查。'],
    ['Resolving conversation…', '正在解决对话…'],
    ['Unresolving conversation…', '正在取消解决对话…'],
    // sidebar：Copilot 代码审查引导、开发分区提示、维护者编辑弹出框
    ['Copilot can review pull requests', 'Copilot 可以审查拉取请求'],
    [
      'Request a review from Copilot to get fast, actionable feedback on your code, so you can start iterating before you receive a human review.',
      '请求 Copilot 审查，快速获得针对你代码的可操作反馈，以便在收到人工审查前开始迭代。'
    ],
    ['Use Closing keywords to add a closing reference', '使用关闭关键词添加关闭引用'],
    ['Allowing edits by maintainers', '允许维护者编辑'],
    [
      "Maintainers could potentially edit this repository's workflows to reveal values of secrets and gain access to other branches.",
      '维护者可能会编辑此存储库的工作流以泄露机密的值并获得其他分支的访问权限。'
    ],
    ['Maintainers are allowed to edit this pull request.', '维护者可以编辑此拉取请求。'],
    // files：经典版空状态（带句号）
    ['No changes to show.', '没有可显示的更改。'],
    ['This commit has no content.', '此提交没有内容。'],
    // compare：创建选项说明、空描述、提交到新分支的提示、首次贡献提示
    ['Automatically requests reviews from code owners', '自动请求代码所有者审查'],
    ["Doesn't request code owners review and cannot be merged", '不请求代码所有者审查且无法合并'],
    ['No description available', '暂无描述'],
    ['The change you just made was written to a new branch named', '你刚才所做的更改已写入新分支'],
    ['. Create a pull request below to propose these changes.', '。在下方创建拉取请求以提议这些更改。'],
    ['Reporting a security vulnerability?', '要报告安全漏洞？'],
    ['Looking for help?', '需要帮助？'],
    ["Check out the project's", '请查看此项目的'],
    ['Check out the project’s', '请查看此项目的'],
    ['instructions for getting support', '支持说明']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('有贡献指南时的空状态说明按句拼读，不另收整句', () => {
    // If you would like to submit code … consider opening a pull request. You can read this repository’s <contributing guidelines> …
    const lead = 'If you would like to submit code to this repository, consider opening a pull request. You can read this repository’s'
    expect(dict.static?.[lead]).toBeUndefined()
    expect(translate(lead)).toBe('如果你想向此存储库提交代码，可以考虑创建拉取请求。你可以阅读此存储库的')
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Merge pull request \n', ['common', 'repository', 'pulls'])).toBe('  合并拉取请求 \n')
  })
})

/** 全局 /pulls 选择存储库筛选框的筛选键与说明（与组织页同一组件） */
const REPO_PICKER_TEXTS = [
  ...['Topic', 'Total stars', 'Total help-wanted issues', 'Total good-first issues', 'Total forks', 'Size (Kb)'],
  ...['Total topics', 'Custom properties', 'Order of results', 'Programming language', 'Filter by custom properties']
]

/** 选择存储库筛选框的取值（README、Size 不收，见下方用例） */
const REPO_PICKER_VALUES = [
  ...['Recently pushed', 'Relevance', 'Funding file', 'At least 1', 'Name', 'Language', 'License', 'Topics'],
  ...['Recently pushed (descending)', 'Name (descending)', 'Language (descending)', 'License (descending)'],
  ...['Topics (ascending)', 'Size (ascending)', 'Total stars (ascending)', 'Total forks (ascending)'],
  ...['Help-wanted issues (ascending)', 'Help-wanted issues (descending)', 'Me', 'Public', 'Private', 'Internal'],
  ...['Description', 'True', 'False', 'Today', 'This month', 'This year', 'More than 10']
]

/** 选择存储库筛选框中自定义属性子键的 aria-label 与子键名（按文字翻译） */
const REPO_PICKER_LABELS = ['Property: team, Filter', 'True, Property: team', 'Production, Property: environment', 'Property: team']

/** 选择存储库筛选框中取值的 aria-label：属性规则只改该对话框的建议项（README 见下方用例） */
const REPO_PICKER_VALUE_LABELS = [
  ...['Public, Visibility', 'Recently pushed, Sort', 'Total stars (ascending), Sort', 'Me, Owner', 'Funding file, Has'],
  ...['True, Template', 'Today, Created', 'More than 10, Total forks', 'TypeScript, Language', 'MIT License, License'],
  ...['octo-org, Organization', 'Property: team, Custom properties', 'Me, Admin Access', 'This month, Created']
]

/** 拉取请求列表的筛选框（与议题列表同一组件）里与选择存储库筛选框同形的取值 aria-label */
const PULLS_FILTER_VALUE_LABELS = [
  'Public, Is',
  'Private, Is',
  'Open, Is',
  'True, Archived',
  'octo-org, Organization',
  'TypeScript, Language'
]

/**
 * 按 /pulls 作用域翻译后各建议项的 aria-label。结构按 filter 的 SuggestionsList 简化：建议列表 id 为 <筛选框 id>-results，
 * 选择存储库对话框的筛选框 id 是 picker-filter
 */
function suggestionLabels(using: typeof cnFull, labels: readonly string[], listId = 'picker-filter-results'): string[] {
  const list = document.createElement('ul')
  list.id = listId
  list.setAttribute('role', 'listbox')
  for (const label of labels) {
    const option = document.createElement('li')
    option.setAttribute('role', 'option')
    option.setAttribute('aria-label', label)
    list.append(option)
  }
  document.body.replaceChildren(list)
  const translator = createTranslator({ matcher: using, host: window, resolvePages: () => ['common', 'pulls'] })
  translator.start()
  const result = [...list.children].map(option => option.getAttribute('aria-label') ?? '')
  translator.stop()
  document.body.innerHTML = ''
  return result
}

describe('pulls 页面词条', () => {
  it.each([
    // header
    ['Conversation', '对话'],
    ['Files changed', '已更改的文件'],
    ['from', '来自'],
    ['merged', '合并了'],
    ['Ready for review', '可供审查'],
    // mergebox / merge-flow
    ['Required', '必需'],
    ['Merge conflicts', '合并冲突'],
    ['Update branch', '更新分支'],
    ['Resolve conflicts', '解决冲突'],
    ['Revert', '还原'],
    // timeline
    ['force-pushed the', '强制推送了分支'],
    ['the', '分支'],
    ['added', '添加了'],
    ['Active', '活跃'],
    ['changed the title from', '更改了标题从'],
    ['Have a question about this project?', '对此项目有疑问？'],
    ['By clicking “Sign up for GitHub”, you agree to our', '单击“注册 GitHub”即表示你同意我们的'],
    ['to your account', '到你的帐户'],
    // 已消除审查的状态标签：不再被 mergebox 的审查者正则当作“用户名 + commented”
    ['previously commented', '先前评论于'],
    ['previously approved', '先前批准于'],
    ['previously reviewed', '先前审查于'],
    ['previously suggested changes', '先前建议更改于'],
    // 消除审查：dismissed <user>’s stale review via <sha>（原文无逗号，via 前不加标点）
    ['’s stale review via', '的过时审查因提交'],
    ["'s review via", '的审查因提交'],
    ['via', '因提交'],
    // 移出合并队列：原因在按钮里时 due to 单独成段
    ['due to', '原因是'],
    ['because', '原因是'],
    // review / sidebar
    ['Pending comments', '待处理的评论'],
    ['from the batch.', '从批次中删除。'],
    ['Submit comments', '提交评论'],
    ['Discard comments', '放弃评论'],
    ['Reviewers', '审查者'],
    ['Development', '开发'],
    // files / checks / compare
    ['Viewed', '已查看'],
    ['Unified', '统一'],
    ['Split', '拆分'],
    ['Summary', '摘要'],
    ['Create draft pull request', '创建草稿拉取请求'],
    // overview / comments / conflicts / dashboard
    ['Ready to merge', '可以合并'],
    ['Reopen or remove', '请重新打开或从堆栈中删除'],
    ['Newest first', '最新优先'],
    ['eyes', '眼睛'],
    ['confused', '困惑'],
    ['Mark as resolved', '标记为已解决'],
    ['conflicts', '处冲突'],
    ['Needs your review', '需要你审查'],
    ['Views', '视图'],
    // list
    ['Label', '标签'],
    ['Eyes', '眼睛'],
    ['was merged', '合并于'],
    ['Review requests', '审查请求'],
    ['Mentioned', '提及我的'],
    // 拉取请求的动词 open 译“创建”；单独的进度动名词作“X中”；堆栈进度的数字不在独立元素中时
    ['opened', '创建于'],
    ['Adding', '添加'],
    ['unmerged', '未合并'],
    // 当前审查的状态标签（后接时间，与 actions 词典的 approved 同译）
    ['approved', '批准于'],
    ['recommended approval', '建议批准于'],
    ['changes requested', '请求更改于'],
    // 冲突编辑器缩进方式
    ['Spaces', '空格'],
    ['Tabs', '制表符'],
    // write access → 写入访问权限；原文界面名无引号，译文不加；中文之间的斜杠两侧不加空格
    ['write access', '写入访问权限'],
    ['view the Checks tab.', '查看检查标签页。'],
    ['Select Done to proceed.', '选择完成以继续。'],
    ['branch on', '分支位于'],
    // 自动合并说明的片段兜底：原文无括号、逗号，条件作句末状语（整句由行内句处理，见下方 DOM 用例）
    ['when all requirements are met.', '于满足所有要求时。'],
    ['You’re receiving notifications because you modified the open/close state.', '你因更改了打开/关闭状态而收到通知。'],
    // 标点随原文：原文没有的逗号、分号不加
    ['You’re receiving notifications because you’re subscribed to this thread.', '你因已订阅此线程而收到通知。'],
    ['Try reloading the page, or if the problem persists', '请重新加载页面，或在问题持续存在时'],
    ['The page is unavailable due to a system error.', '页面因系统错误而不可用。'],
    ['Unable to load more activity. Try again.', '无法加载更多活动。请重试。'],
    ['Mix and match filters to narrow down what you’re looking for.', '组合使用筛选器以缩小查找范围。'],
    ['to resolve conflicts before continuing.', '解决冲突后再继续。'],
    // 产品名按 product-names.md 译出；名词 Filter → 筛选器
    ['Open with GitHub Desktop', '使用 GitHub 桌面版打开'],
    ['copilot code review', 'Copilot 代码审查'],
    ['Delete Codespace?', '要删除代码空间吗？'],
    ['Fix the filter query to show activity.', '修正筛选器查询以显示活动。'],
    // dashboard：选择存储库筛选框的筛选键
    ['Contributions', '贡献'],
    // files：经典版“对话”下拉菜单、概述侧边面板、合并提交空状态的链接
    ['Nice work!', '干得好！'],
    ['No replies', '暂无回复'],
    ['view the diff.', '查看差异。'],
    // review：经典审查菜单标题 Finish your <review>
    ['Finish your', '完成'],
    ['review', '审查'],
    // sidebar：里程碑选择器、经典通知设置选项名、比较页维护者编辑说明与经典锁定对话框的片段
    ['Past due by', '逾期'],
    ['Due by', '截止于'],
    ['No due date', '无截止日期'],
    ['Not subscribed', '未订阅'],
    ['Subscribed', '已订阅'],
    ['Custom', '自定义'],
    ['If checked,', '勾选后，'],
    ['users with write access to', '对'],
    ['can add new commits', '具有写入访问权限的用户可以添加新提交'],
    ['to your', '到你的'],
    ['Other users', '其他用户'],
    ['can’t add new comments', '将无法'],
    ["can't add new comments", '将无法'],
    ['to this pull request.', '对此拉取请求发表新评论。'],
    // list：经典列表标签菜单页脚、批量操作、无结果
    ['to exclude labels', '排除标签'],
    ['for logical OR', '表示逻辑或'],
    ['Assign someone', '分配给某人'],
    ['or try an', '或尝试'],
    ['advanced search', '高级搜索'],
    // 首次贡献说明的链接 If you know how to fix an <issue>, …
    ['issue', '议题'],
    // timeline：没有审查者链接的消除事件、经典锁定事件的片段与锁定原因
    ['dismissed a stale review via', '消除了一项过时审查因提交'],
    ['locked as', '将对话锁定为'],
    ['Repository owner locked as', '存储库所有者将对话锁定为'],
    ['off-topic', '偏离主题'],
    ['off topic', '偏离主题'],
    ['too heated', '争论过激'],
    ['resolved', '已解决'],
    ['spam', '垃圾信息'],
    // header：Dependabot 横幅严重性标签的提示（与 security 词典同译）
    ["Filter alerts by 'critical' severity.", '筛选严重性为“严重”的警报。'],
    ["Filter alerts by 'high' severity.", '筛选严重性为“高”的警报。'],
    ["Filter alerts by 'moderate' severity.", '筛选严重性为“中”的警报。'],
    ["Filter alerts by 'low' severity.", '筛选严重性为“低”的警报。'],
    // timeline：不带分支名的删除事件、编码代理事件（原文无标点，“以下用户”指后接的用户名）、会话状态
    ['deleted the branch', '删除了分支'],
    ['finished work on behalf of', '代表以下用户完成了工作'],
    ['stopped work on behalf of', '代表以下用户停止了工作'],
    ['finished reviewing on behalf of', '代表以下用户完成了审查'],
    ['created this pull request from a session', '从会话创建了此拉取请求'],
    ['completed after', '完成用时'],
    ['failed after', '失败前已运行'],
    ['closed this by deleting the head repository', '通过删除头部存储库关闭了此拉取请求'],
    ['New changes since you last viewed', '你上次查看后的新更改'],
    // timeline：消除审查与先前审查的片段
    ['’s', '的'],
    ['stale review', '过时审查'],
    ['previously', '先前'],
    ['See review', '查看审查'],
    // sidebar：维护者编辑弹出框片段、经典受理人按钮
    ['can add new commits to', '具有写入访问权限的用户可以添加新提交到'],
    ['unassign me', '取消分配给自己'],
    // dashboard：选择存储库筛选框的筛选键、说明与 Exclude <key> 建议项
    ['Admin Access', '管理员权限'],
    ['Topic', '主题'],
    ['Total stars', '星标总数'],
    ['Total good-first issues', '适合新手的议题总数'],
    ['Size (Kb)', '大小 (Kb)'],
    ['Custom properties', '自定义属性'],
    ['Order of results', '结果顺序'],
    ['Programming language', '编程语言'],
    ['Filter by custom properties', '按自定义属性筛选'],
    ['Exclude fork', '排除复刻'],
    ['Exclude mirror', '排除镜像'],
    ['Exclude license', '排除许可证'],
    ['Exclude visibility', '排除可见性'],
    ['Exclude topic', '排除主题'],
    ['Exclude language', '排除语言'],
    ['Exclude is', '排除是'],
    ['Exclude admin', '排除管理员权限'],
    ['Exclude contributed-by', '排除贡献'],
    // 与议题筛选框同译（拉取请求列表的筛选框也出这一项）
    ['Exclude created', '排除创建日期'],
    ['Exclude pushed', '排除最后更新'],
    ['Exclude owner', '排除所有者'],
    ['Exclude', '排除'],
    // dashboard：选择存储库筛选框的取值（排序取值含带方向的、has: 与计数筛选器的取值，与 organization 词典同译）
    ['Recently pushed', '最近推送'],
    ['Relevance', '相关性'],
    ['Funding file', '赞助文件'],
    ['At least 1', '至少 1'],
    ['Recently pushed (descending)', '最近推送（降序）'],
    ['Total stars (ascending)', '星标总数（升序）'],
    ['Size (ascending)', '大小（升序）'],
    ['Help-wanted issues (descending)', '需要帮助的议题（降序）'],
    // list：筛选框（与议题列表同一组件，词条取自 issues/filter.ts）
    ['Base', '基础分支'],
    ['Reviewed by', '审查者'],
    ['Review state', '审查状态'],
    ['The author of the item', '项的作者'],
    ['Pull Request base branch', '拉取请求的基础分支'],
    ['is one of', '是以下之一'],
    ['Qualifier', '限定符'],
    ['Unbalanced quotation marks', '引号不匹配'],
    // 议题页由 issues/metadata.ts 收录的筛选器名称
    ['Parent issue', '父议题'],
    ['Blocked by', '被阻止']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('筛选框的词条与规则同议题列表：建议项、筛选器名称与说明同译', () => {
    const issues: readonly PageKey[] = ['common', 'repository', 'issues']
    const inputs = [
      ...['Exclude author', 'Exclude created', 'Exclude org', 'Exclude review-requested', 'Has label', 'No assignee'],
      ...['Has Label, Label', 'Author, Filter, The author of the item', 'Base', 'Head', 'Linked', 'Involves'],
      ...['Value 1 From', 'Filter contains 2 issues:', 'label:bug is invalid'],
      // 键名与选择存储库筛选框的数据键同名、或含逗号的：不被 dashboard 的选择存储库筛选框规则抢先
      ...['Code language, Filter, Language', 'Has Language, Language', 'No Organization, Organization'],
      'Property: team, Qualifier 1'
    ]
    for (const input of inputs) {
      const expected = cnFull.translate(input, issues)
      expect(expected).toBeDefined()
      expect(cnFull.translate(input, SCOPE)).toBe(expected)
      expect(cnFull.translate(input, ['common', 'pulls'])).toBe(expected)
    }
    expect(cnFull.translateInline(patternKey('Invalid value {} for {}'), SCOPE)).toBe('无效值 {} 用于筛选器 {}')
  })

  it('筛选框中取值的 aria-label 同议题列表：选择存储库筛选框的取值规则不在拉取请求列表生效', () => {
    const issues: readonly PageKey[] = ['common', 'repository', 'issues']
    for (const input of PULLS_FILTER_VALUE_LABELS) {
      const expected = cnFull.translate(input, issues)
      expect(cnFull.translate(input, SCOPE)).toBe(expected)
      expect(cnFull.translate(input, ['common', 'pulls'])).toBe(expected)
      expect(cnFull.translate(input, ['common', 'issues'])).toBe(expected)
    }
    // 其他筛选框的建议列表（id 不是 picker-filter-results）：aria-label 与议题列表一致
    expect(suggestionLabels(cnFull, PULLS_FILTER_VALUE_LABELS, '_R_3lko5_-results')).toEqual(
      PULLS_FILTER_VALUE_LABELS.map(input => cnFull.translate(input, issues) ?? input)
    )
  })

  it('筛选框不收 No、Pending：拉取请求页沿用通用词典', () => {
    for (const key of ['No', 'Pending']) expect(dict.scoped?.[key]).toBeUndefined()
    expect(cnFull.translate('No', SCOPE)).toBe('否')
    expect(cnFull.translate('Pending', SCOPE)).toBe('待处理')
    // 议题页的筛选器名称 No、提交状态 Pending 照旧
    expect(cnFull.translate('No', ['common', 'repository', 'issues'])).toBe('无')
    expect(cnFull.translate('Pending', ['common', 'repository', 'issues'])).toBe('挂起')
  })

  it('选择存储库筛选框：/pulls 生效；存储库作用域内不被许可证名正则改成“Exclude 许可证”', () => {
    expect(cnFull.translate('Exclude fork', ['common', 'pulls'])).toBe('排除复刻')
    expect(cnFull.translate('Admin Access', ['common', 'pulls'])).toBe('管理员权限')
    expect(cnFull.translate('Exclude license', SCOPE)).toBe('排除许可证')
    // 其余 key 与 organization 词典同译；archived 由 search 词典的全局词条翻译
    const organization: readonly PageKey[] = ['common', 'organization']
    for (const key of ['topic', 'sponsorable', 'template', 'sort', 'has', 'in', 'org', 'user', 'archived', 'created']) {
      const expected = cnFull.translate(`Exclude ${key}`, organization)
      expect(expected).toMatch(/^排除/)
      expect(cnFull.translate(`Exclude ${key}`, ['common', 'pulls'])).toBe(expected)
    }
    expect(cnFull.translate('Exclude props.team', ['common', 'pulls'])).toBe('排除属性：team')
  })

  it('选择存储库筛选框中筛选键的 aria-label：与组织页同译；说明不在该筛选框中的仍按议题筛选框处理', () => {
    const organization: readonly PageKey[] = ['common', 'organization']
    const inputs = [
      'Fork, Filter',
      'Topic, Filter',
      'Size (Kb), Filter',
      'Custom properties, Filter, Filter by custom properties',
      'Created, Filter, Creation date',
      'Last updated, Filter, Last updated date',
      'Sort, Filter, Order of results'
    ]
    for (const input of inputs) {
      const expected = cnFull.translate(input, organization)
      expect(expected).toContain('，筛选器')
      expect(expected?.startsWith(input.split(', ')[0]!)).toBe(false)
      expect(cnFull.translate(input, ['common', 'pulls'])).toBe(expected)
    }
    // 拉取请求列表筛选框的同名键带另一组说明
    expect(cnFull.translate('Sort, Filter, Sort results', SCOPE)).toBe('排序，筛选器，排序结果')
    expect(cnFull.translate('Organization, Filter, Filter by organization', ['common', 'pulls'])).toBe('组织，筛选器，按组织筛选')
    expect(cnFull.translate('Author, Filter, The author of the item', ['common', 'pulls'])).toBe('作者，筛选器，项的作者')
  })

  it('选择存储库筛选框的筛选键与说明：/pulls 与组织页同译', () => {
    const organization: readonly PageKey[] = ['common', 'organization']
    for (const input of REPO_PICKER_TEXTS) {
      const expected = cnFull.translate(input, organization)
      expect(expected).toBeDefined()
      expect(cnFull.translate(input, ['common', 'pulls'])).toBe(expected)
    }
  })

  it('选择存储库筛选框的取值、自定义属性子键：/pulls 与组织页同译', () => {
    const organization: readonly PageKey[] = ['common', 'organization']
    for (const input of [...REPO_PICKER_VALUES, ...REPO_PICKER_LABELS]) {
      const expected = cnFull.translate(input, organization)
      expect(expected).toBeDefined()
      expect(cnFull.translate(input, ['common', 'pulls'])).toBe(expected)
    }
  })

  it('选择存储库筛选框中取值的 aria-label：对话框的建议项与组织页同译', () => {
    const expected = REPO_PICKER_VALUE_LABELS.map(input => cnFull.translate(input, ['common', 'organization']))
    expect(expected).not.toContain(undefined)
    expect(suggestionLabels(cnFull, REPO_PICKER_VALUE_LABELS)).toEqual(expected)
  })

  it('选择存储库筛选框：README、Size 不收，aria-label 中同样保留原文；Created 仍按 list.ts 的经典 /pulls 标签翻译', () => {
    for (const key of ['README', 'Size']) {
      expect(dict.scoped?.[key]).toBeUndefined()
      expect(cnFull.translate(key, ['common', 'pulls'])).toBeUndefined()
    }
    expect(suggestionLabels(cnFull, ['README, In', 'Size, Sort', 'Size (ascending), Sort'])).toEqual([
      'README，范围',
      'Size，排序',
      '大小（升序），排序'
    ])
    // 筛选框的建议项与经典标签都是单独一段文字，按结构区分不了；aria-label 与组织页同译
    expect(cnFull.translate('Created', ['common', 'pulls'])).toBe('已创建')
    expect(cnFull.translate('Created, Filter, Creation date', ['common', 'pulls'])).toBe('创建日期，筛选器，创建日期')
  })

  it('片段词条不在议题页生效', () => {
    const scope: readonly PageKey[] = ['common', 'repository', 'issues']
    for (const key of ['’s', 'stale review', 'previously', 'See review', 'unassign me', 'completed after']) {
      expect(cnFull.translate(key, scope)).toBeUndefined()
    }
  })

  it('全局 /pulls 与比较页同样生效', () => {
    expect(matcher.translate('Review requests', ['common', 'pulls'])).toBe('审查请求')
    expect(matcher.translate('546 Open', ['common', 'pulls'])).toBe('546 个打开的')
    expect(matcher.translate('Create draft pull request', ['common', 'repository', 'commits', 'pulls'])).toBe('创建草稿拉取请求')
  })

  it('不覆盖比较页提交词典的通用片段', () => {
    for (const key of ['with', 'and', 'of']) {
      expect(dict.scoped?.[key]).toBeUndefined()
      expect(dict.static?.[key]).toBeUndefined()
    }
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Conversation', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Review requests', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('wants to merge 3 commits into', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('Files changed', ['common', 'repository', 'commits'])).toBeUndefined()
  })

  it('产品名不在拉取请求词典中单独收录，自造品牌词保留英文', () => {
    // 产品名的中文译名（product-names.md）由通用词典统一提供，拉取请求词典只在句中译出
    for (const name of ['Actions', 'Copilot', 'Dependabot', 'GitHub Actions', 'Codespaces']) {
      expect(dict.static?.[name]).toBeUndefined()
      expect(dict.scoped?.[name]).toBeUndefined()
    }
    for (const name of ['Copilot', 'Dependabot']) expect(translate(name)).toBeUndefined()
  })

  it('通用文字不在拉取请求词典中', () => {
    const keys = [
      ...['Cancel', 'Save', 'Edit', 'Delete', 'Close', 'Learn more', 'Load more', 'Loading…', 'Commits'],
      ...['Review required', 'Approve', 'No description provided.', 'Refresh', 'Discard', 'Customize']
    ]
    for (const key of keys) {
      expect(dict.static?.[key]).toBeUndefined()
      expect(dict.scoped?.[key]).toBeUndefined()
    }
  })

  it('common-ui 的全局正则不在拉取请求词典中重复', () => {
    // 取消阻止确认框：Are you sure you want to unblock @user?
    expect(translate('Are you sure you want to unblock @octocat?')).toBeUndefined()
  })

  it('与全局词条同译的片段不收 scoped 副本，拉取请求页照常翻译', () => {
    const curly = '. We’ll occasionally send you account related emails.'
    const straight = ". We'll occasionally send you account related emails."
    for (const key of ['and the', curly, 'You can also']) expect(dict.scoped?.[key]).toBeUndefined()
    expect(cnFull.translate('and the', SCOPE)).toBe('和')
    expect(cnFull.translate(curly, SCOPE)).toBe('。我们会不定期向你发送帐户相关电子邮件。')
    expect(cnFull.translate('You can also', SCOPE)).toBe('你也可以')
    // 直撇号版全局没有词条，仍由本词典收录，与弯撇号版同译
    expect(dict.scoped?.[straight]).toBe('。我们会不定期向你发送帐户相关电子邮件。')
    expect(cnFull.translate(straight, SCOPE)).toBe(cnFull.translate(curly, SCOPE))
  })
})

/** 按存储库拉取请求页的作用域翻译 html */
function render(html: string, pages: readonly PageKey[] = SCOPE): Translator {
  document.body.innerHTML = html
  const translator = createTranslator({ matcher, host: window, resolvePages: () => pages })
  translator.start()
  return translator
}

/** 显示文字：时间元素的文字由元素自己在 shadowRoot 里渲染，这里记作「<时间>」 */
function shown(id: string): string {
  const clone = document.getElementById(id)?.cloneNode(true) as Element | undefined
  for (const time of clone?.querySelectorAll('relative-time') ?? []) time.textContent = '<时间>'
  return (clone?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('pulls 行内句', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('合并描述：单独包在 span 里的句号随中文语境转全角', () => {
    // MergedDescription：["This pull request was merged", " ", <RelativeTime/>, <span class="ml-n1">.</span>]
    translator = render(`
      <span class="d-inline-flex flex-items-center flex-wrap gap-1" id="plain"
        >This pull request was merged <relative-time datetime="2026-10-20T15:17:16Z">Oct 20, 2026</relative-time
        ><span class="ml-n1">.</span></span>
      <span class="d-inline-flex flex-items-center flex-wrap gap-1" id="merger"
        ><a href="/octocat">octocat</a> merged in <a class="text-mono" href="/vuejs/core/commit/abc1234">abc1234</a>
        <relative-time datetime="2026-10-20T15:17:16Z">Oct 20, 2026</relative-time><span class="ml-n1">.</span></span>`)
    expect(shown('plain')).toBe('此拉取请求合并于 <时间>。')
    expect(shown('merger')).toBe('octocat 合并于提交 abc1234 <时间>。')
  })

  it('堆栈进度：<span><span>3</span> merged</span>', () => {
    // StackProgress：数字在独立 span 中；不按整句时 merged 会落到头部片段“合并了”
    translator = render(`
      <div class="progressCounts__fiet_A">
        <span id="merged"><span class="progressCount__hw0GIB">3</span> merged</span>
        <span id="unmerged"><span class="progressCount__hw0GIB">2</span> unmerged</span>
      </div>`)
    expect(shown('merged')).toBe('3 个已合并')
    expect(shown('unmerged')).toBe('2 个未合并')
  })

  it('经典时间线：<作者> changed the base branch from <main> to <dev> <时间>', () => {
    // 采集到的拉取请求页中的事件结构：头像在宿主外，分支名是 span.branch-name，时间链接在句末
    translator = render(`
      <div class="TimelineItem-body">
        <div class="d-flex">
          <div class="flex-shrink-0 mr-1">
            <a class="d-inline-block" href="/octocat"><img class="avatar avatar-user" alt="@octocat" width="20" height="20"></a>
          </div>
          <div class="flex-auto d-flex flex-column flex-md-row">
            <div class="flex-auto" id="event">
              <a class="author Link--primary text-bold" href="/octocat">octocat</a>


              changed the base branch from
    <span class="branch-name">
      <span class="css-overflow-wrap-anywhere">main</span>
    </span>
    to
    <span class="branch-name">
      <span class="css-overflow-wrap-anywhere">dev</span>
    </span>

          <a href="#event-1" class="css-truncate css-truncate-target Link--secondary Link"><relative-time tense="past" datetime="2026-10-24T18:51:08Z">October 24, 2026 18:51</relative-time></a>
            </div>
          </div>
        </div>
      </div>`)
    expect(shown('event')).toBe('octocat 将基础分支从 main 更改为 dev <时间>')
  })

  it('经典时间线：头像与作者同在宿主中、没有时间链接', () => {
    translator = render(`
      <div class="TimelineItem-body" id="event">
        <a class="d-inline-block" href="/octocat"><img class="avatar avatar-user" alt="@octocat" width="20" height="20"></a>
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        changed the base branch from
        <span class="commit-ref"><span class="css-truncate">main</span></span>
        to
        <span class="commit-ref"><span class="css-truncate">release/v2</span></span>
      </div>`)
    expect(shown('event')).toBe('octocat 将基础分支从 main 更改为 release/v2')
  })

  it('活动面板：<作者> removed this pull request from the <merge queue> due to <原因>', () => {
    // RemovedFromMergeQueueText：连接词与原因是相邻的文本节点，原因也可在按钮里（CommitChecksLink）；
    // 作者是 TimelineAuthor 的 span.mr-1，与后文之间没有空白文本。不按整句时会拼成“移出 合并队列 原因是…”
    document.body.innerHTML = `<span class="flex-1 min-width-0 mr-2" id="text"></span><span class="flex-1 min-width-0 mr-2" id="button"></span>`
    const author = (): HTMLSpanElement => {
      const span = Object.assign(document.createElement('span'), { className: 'mr-1' })
      span.innerHTML = '<a href="/octocat"><strong class="fgColor-default ml-1">octocat</strong></a>'
      return span
    }
    const queue = (): HTMLAnchorElement =>
      Object.assign(document.createElement('a'), {
        href: '/octo-org/hello-world/queue/main',
        textContent: 'merge queue'
      })
    const checks = Object.assign(document.createElement('button'), { textContent: 'failed status checks' })
    const lead = ['removed this pull request from the ', ' due to ']
    document.getElementById('text')?.append(author(), lead[0]!, queue(), lead[1]!, 'failed status checks')
    document.getElementById('button')?.append(author(), lead[0]!, queue(), lead[1]!, checks)
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('text')).toBe('octocat因状态检查失败将此拉取请求移出合并队列')
    expect(shown('button')).toBe('octocat将此拉取请求移出合并队列的原因是状态检查失败')
  })

  it('自动合并：This pull request will <方式> when all requirements are met. <了解更多>', () => {
    // DisableAutoMergeInstructions：方式在 span.text-semibold 中，句末接文档链接
    translator = render(`
      <div class="flex-1" id="merge">This pull request will <span class="text-semibold">merge automatically</span> when all requirements are met. <a class="prc-Link-Link-85e08" href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request">Learn more about automatically merging a pull request.</a></div>
      <div class="flex-1" id="queue">This pull request will <span class="text-semibold">be added to the merge queue</span> when all requirements are met. <a href="https://docs.github.com/">Learn more about automatically merging a pull request.</a></div>
      <p id="squash">This pull request will <span class="text-semibold">squash automatically</span> when all requirements are met.</p>`)
    expect(shown('merge')).toBe('此拉取请求将在满足所有要求时自动合并。了解自动合并拉取请求。')
    expect(shown('queue')).toBe('此拉取请求将在满足所有要求时加入合并队列。了解自动合并拉取请求。')
    expect(shown('squash')).toBe('此拉取请求将在满足所有要求时自动压缩合并。')
  })

  it('Dependabot 横幅：多个警报', () => {
    // PullRequestAutomatedSecurityUpdateBanner：链接、严重性由 VerifiedHTMLText 渲染在同一 span 中
    translator = render(`
      <div class="Banner-description"><span id="banner">Merging this pull request will resolve <a class="Link Link--underline" href="/octo-org/hello-world/security/dependabot">Dependabot Alerts</a> on lodash including a <strong>high</strong> severity alert</span></div>`)
    expect(shown('banner')).toBe('合并此拉取请求将解决的 Dependabot 警报涉及 lodash 并包括一个严重性为高的警报')
  })

  it('Dependabot 横幅：单个警报', () => {
    translator = render(`
      <div class="Banner-description"><span id="banner">Merging this pull request will resolve a <strong>critical</strong> severity <a class="Link Link--underline" href="/octo-org/hello-world/security/dependabot">Dependabot Alert</a> on @babel/core</span></div>`)
    expect(shown('banner')).toBe('合并此拉取请求将解决 @babel/core 的一个严重性为严重的 Dependabot 警报')
  })

  it('评论头部的读屏标题：<用户名> commented <时间>', () => {
    // ActivityHeader：<h3 class="sr-only">{login} {'commented'}{' '}<RelativeTime>on Oct 26, 2026 </RelativeTime></h3>，
    // 用户名、动词、空格是相邻的文本节点；合并框审查者列表的读屏名称不带时间，作“发表了评论”
    document.body.innerHTML = `
      <h3 class="sr-only" id="heading"><relative-time datetime="2026-10-26T10:00:00Z">on Oct 26, 2026 </relative-time></h3>
      <h3 class="sr-only" id="bot">github-actions[bot] commented <relative-time datetime="2026-10-26T10:00:00Z">on Oct 26, 2026 </relative-time></h3>
      <ul><li id="reviewer" aria-label="octocat commented"></li></ul>`
    document.getElementById('heading')?.prepend(...['octocat', ' ', 'commented', ' '].map(text => document.createTextNode(text)))
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('heading')).toBe('octocat 评论于 <时间>')
    expect(shown('bot')).toBe('github-actions[bot] 评论于 <时间>')
    expect(document.getElementById('reviewer')?.getAttribute('aria-label')).toBe('octocat 发表了评论')
  })

  it('合并后（跨存储库）：You’re all set — the <分支> branch … delete this fork of <strong> in the <a>settings</a>.', () => {
    // ClosedOrMergedStateMergeBox：副标题 <p> 中的文字是 React 拆开的相邻文本节点；原文一个逗号，译文一个
    document.body.innerHTML = `<p class="fgColor-muted mb-0 " id="cross"></p><p class="fgColor-muted mb-0 " id="same"></p>`
    const branch = (): HTMLAnchorElement =>
      Object.assign(document.createElement('a'), { className: 'BranchName', textContent: 'feature-branch' })
    const repo = Object.assign(document.createElement('strong'), { textContent: 'octo-org/hello-world' })
    const settings = Object.assign(document.createElement('a'), {
      href: '/octocat/hello-world/settings',
      textContent: 'settings'
    })
    document
      .getElementById('cross')
      ?.append(
        ...["You're all set — the", ' ', branch(), ' ', 'branch can be safely deleted.', ' '],
        ...['If you wish, you can also delete this fork of', ' ', repo, ' in the', ' ', settings, '.']
      )
    document.getElementById('same')?.append("You're all set — the", ' ', branch(), ' ', 'branch can be safely deleted.')
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('cross')).toBe('一切就绪——feature-branch 分支可以安全删除。如有需要也可以删除 octo-org/hello-world 的此复刻，入口在设置。')
    // 同一存储库时只有前半句，同样整句收录（按片段翻译时“——”后的空白文本节点会留下空格）
    expect(shown('same')).toBe('一切就绪——feature-branch 分支可以安全删除。')
  })

  it('经典时间线锁定事件：<作者> locked as <strong>原因</strong> and limited conversation to collaborators <时间>', () => {
    // 原因提到句首（与锁定正则同一写法）；隐去操作者时作者处为文字 Repository owner
    translator = render(`
      <div class="TimelineItem-body" id="event">
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        locked as <strong>off-topic</strong> and limited conversation to collaborators
        <a href="#event-1" class="Link--secondary"><relative-time datetime="2026-10-24T18:51:08Z">October 24, 2026 18:51</relative-time></a>
      </div>
      <div class="TimelineItem-body" id="owner">
        Repository owner locked as <strong>spam</strong> and limited conversation to collaborators
      </div>`)
    expect(shown('event')).toBe('octocat 以偏离主题为由锁定了对话并限制为仅协作者可评论 <时间>')
    expect(shown('owner')).toBe('存储库所有者以垃圾信息为由锁定了对话并限制为仅协作者可评论')
  })

  it('锁定事件结构对不上整句时按片段拼读', () => {
    translator = render(`
      <span id="split"><span>locked as</span> <strong>too heated</strong> <span>and limited conversation to collaborators</span></span>`)
    expect(shown('split')).toBe('将对话锁定为 争论过激 并限制为仅协作者可评论')
  })

  it('经典锁定对话框与比较页维护者编辑说明：片段按原文顺序拼读', () => {
    // 片段之间保留原文的空白（与提交页锁定对话框相同）
    translator = render(`
      <ul><li id="lock">Other users <strong>can’t add new comments</strong> to this pull request.</li></ul>
      <p id="maintainer">If checked, <strong>users with write access to</strong> octo-org/hello-world
        <strong>can add new commits</strong> to your <span class="branch-name">feature</span> branch.</p>`)
    expect(shown('lock')).toBe('其他用户 将无法 对此拉取请求发表新评论。')
    expect(shown('maintainer')).toBe('勾选后，对 octo-org/hello-world 具有写入访问权限的用户可以添加新提交 到你的 feature 分支。')
  })

  it('经典列表首次贡献说明：If you know how to fix an <issue>, … 片段拼读', () => {
    translator = render(`
      <p id="contribute">If you know how to fix an <a href="/vuejs/core/issues">issue</a>, consider opening a pull request for it.</p>`)
    expect(shown('contribute')).toBe('如果你知道如何修复某个 议题，可以考虑为其创建拉取请求。')
  })

  it('行内句只在拉取请求页面类型生效', () => {
    translator = render(`<span id="merged"><span class="progressCount__hw0GIB">3</span> merged</span>`, ['common', 'repository', 'issues'])
    expect(shown('merged')).toBe('3 merged')
  })

  it('依赖项审查富差异底部：Give feedback on <a>dependency review</a> 整句调语序（同提交页）', () => {
    // 服务端渲染的片段：链接后有换行文本，整句的末段写在这里；链接文字由提交页词典的全局词条翻译
    document.body.innerHTML = '<div id="feedback">\n  Give feedback on <a href="#feedback">dependency review</a>\n</div>'
    translator = createTranslator({ matcher: cnFull, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('feedback')).toBe('对依赖项审查提供反馈')
    expect(cnFull.translateInline(patternKey('Give feedback on {}'), ['common', 'repository'])).toBeUndefined()
  })

  it('侧栏维护者编辑弹出框：If checked, users with write access to <存储库> can add new commits to <分支> branch.', () => {
    translator = render(`
      <p id="popover">If checked, users with write access to <strong>octo-org/hello-world</strong> can add new commits to <span class="branch-name">octocat:feature</span> branch.</p>`)
    expect(shown('popover')).toBe('勾选后，对 octo-org/hello-world 具有写入访问权限的用户可以添加新提交到 octocat:feature 分支。')
  })

  it('消除审查：stale review 是链接时 ’s 单独成段，片段按原文顺序拼读', () => {
    translator = render(`
      <span id="dismissed">dismissed <a href="/octocat">octocat</a>’s <a href="#pullrequestreview-1">stale review</a> via <a href="/vuejs/core/commit/0ff253b">0ff253b</a></span>`)
    expect(shown('dismissed')).toBe('消除了 octocat的 过时审查 因提交 0ff253b')
  })

  it('经典时间线编码代理事件：<Copilot> finished work on behalf of <用户> <时间> 整句调语序', () => {
    // 用户名提到动词前（与 copilot/code.ts 的整句正则同一写法）；出错原因并入句中，句末时间链接可有可无
    translator = render(`
      <div class="TimelineItem-body" id="finished">
        <a class="author Link--primary text-bold" href="/apps/copilot-swe-agent">Copilot</a>
        finished work on behalf of
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        <a href="#event-1" class="Link--secondary"><relative-time datetime="2026-10-24T18:51:08Z">October 24, 2026 18:51</relative-time></a>
      </div>
      <div class="TimelineItem-body" id="stopped">
        <a class="author Link--primary text-bold" href="/apps/copilot-swe-agent">Copilot</a>
        stopped work on behalf of
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        due to an error
        <a href="#event-2" class="Link--secondary"><relative-time datetime="2026-10-24T18:52:08Z">October 24, 2026 18:52</relative-time></a>
      </div>
      <div class="TimelineItem-body" id="reviewed">
        <a class="author Link--primary text-bold" href="/apps/copilot-pull-request-reviewer">Copilot</a>
        finished reviewing on behalf of
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
      </div>`)
    expect(shown('finished')).toBe('Copilot 代表 octocat 完成了工作 <时间>')
    expect(shown('stopped')).toBe('Copilot 代表 octocat 因出错停止了工作 <时间>')
    expect(shown('reviewed')).toBe('Copilot 代表 octocat 完成了审查')
  })

  it('编码代理事件：用户链接后没有文本节点时按片段拼读', () => {
    // 整句写不进去：动词与 on behalf of 合成的片段用“以下用户”指后接的用户名
    translator = render(`
      <span id="agent"><a href="/apps/copilot-swe-agent">Copilot</a> finished work on behalf of <a href="/octocat">octocat</a></span>`)
    expect(shown('agent')).toBe('Copilot 代表以下用户完成了工作 octocat')
  })

  it('比较页：网页编辑器提交到新分支的提示按片段拼读', () => {
    translator = render(`
      <p id="quick">The change you just made was written to a new branch named <strong>patch-1</strong>. Create a pull request below to propose these changes.</p>`)
    expect(shown('quick')).toBe('你刚才所做的更改已写入新分支 patch-1。在下方创建拉取请求以提议这些更改。')
  })

  it('比较页首次贡献提示：问句与 Check out the project’s 在同一文本节点时按句拼读', () => {
    // 链接文字 security policy 由 common-ui 的全局词条翻译
    document.body.innerHTML = `
      <p id="security">Reporting a security vulnerability? Check out the project’s <a href="/vuejs/core/security/policy">security policy</a>.</p>
      <p id="support">Looking for help? Check out the project’s <a href="/vuejs/core/blob/main/SUPPORT.md">instructions for getting support</a>.</p>`
    translator = createTranslator({ matcher: cnFull, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('security')).toBe('要报告安全漏洞？请查看此项目的 安全策略。')
    expect(shown('support')).toBe('需要帮助？请查看此项目的 支持说明。')
  })

  it('合并框无权推送原因：网址自动成链接时前后两段拼读', () => {
    // for more information. 由 common/site.ts 的全局词条翻译
    document.body.innerHTML = `
      <div id="reason">You're not authorized to push to this branch. Visit <a href="https://docs.github.com/">https://docs.github.com/</a> for more information.</div>`
    translator = createTranslator({ matcher: cnFull, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('reason')).toBe('你无权推送到此分支。请访问 https://docs.github.com/ 了解详细信息。')
  })
})

/** 繁体完整语言包：按存储库拉取请求页的作用域查词（片段与通用词典拼读） */
const twMatcher = createMatcher(zhTW)

describe('选择存储库筛选框（全局 /pulls，DOM）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  // 结构按 filter 的 SuggestionItem 简化：建议项只有名称一段文字；选择存储库对话框的建议列表 id 为 picker-filter-results
  const PICKER_HTML = `
    <ul role="listbox" id="picker-filter-results">
      <li id="sort" role="option" aria-label="Total stars (ascending), Sort"><span class="displayName__x1">Total stars (ascending)</span></li>
      <li id="pushed" role="option" aria-label="Recently pushed, Sort"><span class="displayName__x1">Recently pushed</span></li>
      <li id="visibility" role="option" aria-label="Public, Visibility"><span class="displayName__x1">Public</span></li>
      <li id="property" role="option" aria-label="Property: team, Filter"><span class="displayName__x1">Property: team</span></li>
      <li id="value" role="option" aria-label="True, Property: team"><span class="displayName__x1">True</span></li>
      <li id="readme" role="option" aria-label="README, In"><span class="displayName__x1">README</span></li>
      <li id="size" role="option" aria-label="Size, Sort"><span class="displayName__x1">Size</span></li>
      <li id="license" role="option" aria-label="MIT License, License"><span class="displayName__x1">MIT License</span></li>
    </ul>`

  it.each([
    [
      '简体',
      cnFull,
      [
        ['sort', '星标总数（升序）', '星标总数（升序），排序'],
        ['pushed', '最近推送', '最近推送，排序'],
        ['visibility', '公共', '公共，可见性'],
        ['property', '属性：team', '属性：team，筛选器'],
        ['value', '是', '是，属性：team'],
        ['readme', 'README', 'README，范围'],
        ['size', 'Size', 'Size，排序'],
        ['license', 'MIT 许可证', 'MIT 许可证，许可证']
      ]
    ],
    [
      '繁体',
      twMatcher,
      [
        ['sort', '星號總數（遞增）', '星號總數（遞增），排序'],
        ['pushed', '最近推送', '最近推送，排序'],
        ['visibility', '公開', '公開，可見度'],
        ['property', '屬性：team', '屬性：team，篩選器'],
        ['value', '是', '是，屬性：team'],
        ['readme', 'README', 'README，範圍'],
        ['size', 'Size', 'Size，排序'],
        ['license', 'MIT 授權條款', 'MIT 授權條款，授權條款']
      ]
    ]
  ] as const)(
    '%s：排序取值、可见性取值、自定义属性子键、许可证名的文字与 aria-label；README、Size 的文字与 aria-label 都保留原文',
    (_, using, expected) => {
      document.body.innerHTML = PICKER_HTML
      translator = createTranslator({ matcher: using, host: window, resolvePages: () => ['common', 'pulls'] })
      translator.start()
      for (const [id, text, label] of expected) {
        expect(shown(id)).toBe(text)
        expect(document.getElementById(id)?.getAttribute('aria-label')).toBe(label)
      }
    }
  )

  it.each([
    ['简体', cnFull],
    ['繁体', twMatcher]
  ] as const)('%s：拉取请求列表筛选框的同形取值 aria-label 不按选择存储库筛选框改写，与议题列表一致', (_, using) => {
    const expected = PULLS_FILTER_VALUE_LABELS.map(input => using.translate(input, ['common', 'issues']) ?? input)
    expect(suggestionLabels(using, PULLS_FILTER_VALUE_LABELS, '_R_3lko5_-results')).toEqual(expected)
    // 同样的 aria-label 在选择存储库对话框里按组织页译出（Open, Is 不是该筛选框的取值）
    expect(suggestionLabels(using, PULLS_FILTER_VALUE_LABELS)).toEqual(
      PULLS_FILTER_VALUE_LABELS.map(input => (input === 'Open, Is' ? input : using.translate(input, ['common', 'organization'])))
    )
  })

  it('属性规则选择器不依赖 aria-label 的取值', () => {
    const selectors = (dict.attributeRules ?? []).map(([selector]) => selector)
    expect(selectors.length).toBeGreaterThan(0)
    expect(selectors.filter(selector => /\[aria-label[~|^$*]?=/.test(selector))).toEqual([])
    for (const selector of selectors) expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })
})

describe('pulls 繁体词条（zh-TW）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each([
    // list
    ['Pull Requests mentioning you', '提及你的拉取請求'],
    ['Private repositories only', '僅限私人儲存庫'],
    ['Click a checkbox on the left to edit multiple issues at once.', '按一下左側的核取方塊可一次編輯多個議題。'],
    ['No projects found. Sorry about that.', '找不到專案。'],
    ['If you know how to fix an', '如果你知道如何修正某個'],
    ['issue', '議題'],
    [
      'If you would like to submit code to this repository, consider opening a pull request. You can read this repository’s',
      '如果你想向此儲存庫提交程式碼，可以考慮建立拉取請求。你可以閱讀此儲存庫的'
    ],
    ['to exclude labels', '排除標籤'],
    ['advanced search', '進階搜尋'],
    ['Assign someone', '指派給某人'],
    ['👋 Want to contribute to vuejs/core?', '👋 想為 vuejs/core 做出貢獻嗎？'],
    // files
    ['You haven’t reviewed this pull request yet', '你尚未審查此拉取請求'],
    ['Jump to conversation', '跳至對話'],
    ['Open overview side panel', '開啟總覽側邊面板'],
    ['View workflow job for this annotation', '查看此標註的工作流程作業'],
    ['This merge commit was added into this branch cleanly.', '此合併提交已無衝突地加入此分支。'],
    ['Nice work!', '做得好！'],
    ['No replies', '尚無回覆'],
    // review
    ['Pull request authors can’t approve their own pull request.', '拉取請求作者無法核准自己的拉取請求。'],
    ['Commenting on lines', '留言位於行'],
    ['Apply all batched suggestions as a single commit', '將批次中的所有建議作為單一提交套用'],
    ['Finish your', '完成'],
    ['review', '審查'],
    // sidebar
    ['No reviews—at least 2 approving reviews are required.', '尚無審查——至少需要 2 個核准審查。'],
    ['You will only be notified for the events selected from the list below.', '你只會收到下方清單中所選事件的通知。'],
    ['Receive a notification when this pull request has been reopened.', '此拉取請求重新開啟時接收通知。'],
    ['Custom', '自訂'],
    ['can’t add new comments', '將無法'],
    // 与同文件整段译文同作「在此拉取請求中…留言」
    ['to this pull request.', '在此拉取請求中新增留言。'],
    ['will be able to comment on this pull request once more.', '都能再次在此拉取請求中留言。'],
    ['You can always unlock this pull request again in the future.', '你隨時可以再次解除鎖定此拉取請求。'],
    ['can add new commits', '具有寫入權限的使用者可以加入新的提交'],
    ['Due by', '截止於'],
    // merge-flow / dashboard
    ['Learn about draft PRs', '瞭解草稿 PR'],
    ['Create a new pull request to revert these changes', '建立新的拉取請求以還原這些變更'],
    ['Contributions', '貢獻'],
    // timeline
    ['Repository owner deleted a comment from', '儲存庫擁有者刪除了以下使用者的一則留言'],
    ['dismissed a stale review via', '駁回了一項過時審查因提交'],
    ['locked as', '將對話鎖定為'],
    ['spam', '垃圾內容'],
    ['finished work on behalf of', '代表以下使用者完成了工作'],
    ['created this pull request from a session', '從工作階段建立了此拉取請求'],
    ['completed after', '完成耗時'],
    ['closed this by deleting the head repository', '透過刪除來源儲存庫關閉了此拉取請求'],
    ['New changes since you last viewed', '你上次查看後的新變更'],
    ['stale review', '過時審查'],
    // header / mergebox
    ['Edit pull request body', '編輯拉取請求內文'],
    ["Filter alerts by 'critical' severity.", '篩選嚴重性為「重大」的警示。'],
    ['Rebase is not an allowed merge method in this repository.', '重定基底不是此儲存庫允許的合併方式。'],
    ['User does not have push access to the repository.', '使用者沒有此儲存庫的推送權限。'],
    [
      "You're not authorized to push to this branch. Visit https://docs.github.com/ for more information.",
      '你無權推送到此分支。請造訪 https://docs.github.com/ 以瞭解詳情。'
    ],
    // review / sidebar / files
    ['Your review was submitted successfully.', '你的審查已成功送出。'],
    ['Unresolving conversation…', '正在取消解決對話…'],
    ['Copilot can review pull requests', 'Copilot 可以審查拉取請求'],
    ['Maintainers are allowed to edit this pull request.', '維護者可以編輯此拉取請求。'],
    ['unassign me', '取消指派給自己'],
    ['This commit has no content.', '此提交沒有內容。'],
    // compare：首次贡献提示按句拼读、创建选项说明、空描述
    ['Reporting a security vulnerability? Check out the project’s', '要回報安全性漏洞嗎？請查看此專案的'],
    ['instructions for getting support', '支援說明'],
    ["Doesn't request code owners review and cannot be merged", '不請求程式碼擁有者審查且無法合併'],
    ['No description available', '沒有描述'],
    // dashboard：选择存储库筛选框
    ['Admin Access', '管理員權限'],
    ['Topic', '主題'],
    ['Total stars', '星號總數'],
    ['Total help-wanted issues', '需要協助的議題總數'],
    ['Total forks', '分叉總數'],
    ['Total topics', '主題總數'],
    ['Custom properties', '自訂屬性'],
    ['Order of results', '結果順序'],
    ['Programming language', '程式語言'],
    ['Filter by custom properties', '依自訂屬性篩選'],
    ['Exclude license', '排除授權條款'],
    ['Exclude topic', '排除主題'],
    ['Exclude template', '排除範本'],
    ['Exclude contributed-by', '排除貢獻'],
    ['Exclude created', '排除建立日期'],
    ['Exclude pushed', '排除上次更新'],
    ['Exclude user', '排除使用者'],
    ['Exclude', '排除'],
    ['Exclude props.team', '排除屬性：team'],
    // dashboard：选择存储库筛选框中筛选键的 aria-label（同 organization 词典）
    ['Fork, Filter', '分叉，篩選器'],
    ['Created, Filter, Creation date', '建立日期，篩選器，建立日期'],
    ['Sort, Filter, Order of results', '排序，篩選器，結果順序'],
    // 拉取请求列表筛选框的同名键带另一组说明，仍按议题筛选框处理
    ['Sort, Filter, Sort results', '排序，篩選器，排序結果'],
    // dashboard：选择存储库筛选框的取值、自定义属性子键（同 organization 词典；取值的 aria-label 见 DOM 用例）
    ['Recently pushed', '最近推送'],
    ['Relevance', '相關性'],
    ['Funding file', '贊助檔案'],
    ['At least 1', '至少 1'],
    ['Total stars (ascending)', '星號總數（遞增）'],
    ['Help-wanted issues (descending)', '需要協助的議題（遞減）'],
    ['Property: team, Filter', '屬性：team，篩選器'],
    ['True, Property: team', '是，屬性：team'],
    ['Property: team', '屬性：team'],
    ['Has Property: team, Property: team', '有屬性：team，屬性：team'],
    // 议题筛选框的 Has / No 建议项、含逗号的筛选键 aria-label 仍按议题筛选框处理
    ['Has Language, Language', '有語言，語言'],
    ['Code language, Filter, Language', '程式碼語言，篩選器，語言'],
    // list：筛选框（与议题列表同一组件）
    ['Exclude author', '排除作者'],
    ['Exclude merged', '排除合併日期'],
    ['Has label', '有標籤'],
    ['No assignee', '無負責人'],
    ['Has Label, Label', '有標籤，標籤'],
    ['Author, Filter, The author of the item', '作者，篩選器，項目的作者'],
    ['Base', '基底分支'],
    ['Head', '來源分支'],
    ['Parent issue', '父議題'],
    ['Blocked by', '受阻於'],
    ['Row 2', '第 2 列'],
    ['No', '否'],
    ['Pending', '待處理']
  ])('%s → %s', (input, expected) => {
    expect(twMatcher.translate(input, SCOPE)).toBe(expected)
  })

  it.each(['No reviews—at least one approving review is required.', '👋 Want to contribute to this repository?'])('不命中：%s', input => {
    expect(twMatcher.translate(input, SCOPE)).toBeUndefined()
  })

  it('选择存储库筛选框的筛选键与说明：/pulls 与组织页同译', () => {
    const organization: readonly PageKey[] = ['common', 'organization']
    for (const input of REPO_PICKER_TEXTS) {
      const expected = twMatcher.translate(input, organization)
      expect(expected).toBeDefined()
      expect(twMatcher.translate(input, ['common', 'pulls'])).toBe(expected)
    }
  })

  it('选择存储库筛选框的取值、自定义属性子键：/pulls 与组织页同译', () => {
    const organization: readonly PageKey[] = ['common', 'organization']
    for (const input of [...REPO_PICKER_VALUES, ...REPO_PICKER_LABELS]) {
      const expected = twMatcher.translate(input, organization)
      expect(expected).toBeDefined()
      expect(twMatcher.translate(input, ['common', 'pulls'])).toBe(expected)
    }
  })

  it('选择存储库筛选框中取值的 aria-label：对话框的建议项与组织页同译', () => {
    const expected = REPO_PICKER_VALUE_LABELS.map(input => twMatcher.translate(input, ['common', 'organization']))
    expect(expected).not.toContain(undefined)
    expect(suggestionLabels(twMatcher, REPO_PICKER_VALUE_LABELS)).toEqual(expected)
  })

  it('筛选框中取值的 aria-label 同议题列表：选择存储库筛选框的取值规则不在拉取请求列表生效', () => {
    const issues: readonly PageKey[] = ['common', 'repository', 'issues']
    for (const input of PULLS_FILTER_VALUE_LABELS) {
      const expected = twMatcher.translate(input, issues)
      expect(twMatcher.translate(input, SCOPE)).toBe(expected)
      expect(twMatcher.translate(input, ['common', 'pulls'])).toBe(expected)
      expect(twMatcher.translate(input, ['common', 'issues'])).toBe(expected)
    }
  })

  it('选择存储库筛选框：README、Size 不收，aria-label 中同样保留原文；Created 仍按 list.ts 的经典 /pulls 标签翻译', () => {
    for (const key of ['README', 'Size']) expect(twMatcher.translate(key, ['common', 'pulls'])).toBeUndefined()
    expect(suggestionLabels(twMatcher, ['README, In', 'Size, Sort', 'Size (ascending), Sort'])).toEqual([
      'README，範圍',
      'Size，排序',
      '大小（遞增），排序'
    ])
    expect(twMatcher.translate('Created', ['common', 'pulls'])).toBe('已建立')
    expect(twMatcher.translate('Created, Filter, Creation date', ['common', 'pulls'])).toBe('建立日期，篩選器，建立日期')
  })

  it('经典时间线锁定事件：原因提到句首', () => {
    document.body.innerHTML = `
      <div class="TimelineItem-body" id="event">
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        locked as <strong>off-topic</strong> and limited conversation to collaborators
        <a href="#event-1" class="Link--secondary"><relative-time datetime="2026-10-24T18:51:08Z">October 24, 2026 18:51</relative-time></a>
      </div>
      <div class="TimelineItem-body" id="owner">
        Repository owner locked as <strong>spam</strong> and limited conversation to collaborators
      </div>`
    translator = createTranslator({ matcher: twMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('event')).toBe('octocat 以離題為由鎖定了對話並限制為僅協作者可留言 <时间>')
    expect(shown('owner')).toBe('儲存庫擁有者以垃圾內容為由鎖定了對話並限制為僅協作者可留言')
  })

  it('经典锁定对话框与首次贡献说明：片段按原文顺序拼读', () => {
    document.body.innerHTML = `
      <ul><li id="lock">Other users <strong>can’t add new comments</strong> to this pull request.</li></ul>
      <p id="contribute">If you know how to fix an <a href="/vuejs/core/issues">issue</a>, consider opening a pull request for it.</p>`
    translator = createTranslator({ matcher: twMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('lock')).toBe('其他使用者 將無法 在此拉取請求中新增留言。')
    expect(shown('contribute')).toBe('如果你知道如何修正某個 議題，可以考慮為其建立拉取請求。')
  })

  it('依赖项审查富差异底部：提供 <相依性審查> 的意見回饋', () => {
    document.body.innerHTML = '<div id="feedback">\n  Give feedback on <a href="#feedback">dependency review</a>\n</div>'
    translator = createTranslator({ matcher: twMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('feedback')).toBe('提供相依性審查的意見回饋')
  })

  it('驳回审查与侧栏维护者编辑弹出框：片段按原文顺序拼读', () => {
    document.body.innerHTML = `
      <span id="dismissed">dismissed <a href="/octocat">octocat</a>’s <a href="#pullrequestreview-1">stale review</a> via <a href="/vuejs/core/commit/0ff253b">0ff253b</a></span>
      <p id="popover">If checked, users with write access to <strong>octo-org/hello-world</strong> can add new commits to <span class="branch-name">octocat:feature</span> branch.</p>`
    translator = createTranslator({ matcher: twMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('dismissed')).toBe('駁回了 octocat的 過時審查 因提交 0ff253b')
    expect(shown('popover')).toBe('勾選後，對 octo-org/hello-world 具有寫入權限的使用者可以加入新的提交到 octocat:feature 分支。')
  })

  it('经典时间线编码代理事件：用户名提到动词前；结构对不上时按片段拼读', () => {
    document.body.innerHTML = `
      <div class="TimelineItem-body" id="finished">
        <a class="author Link--primary text-bold" href="/apps/copilot-swe-agent">Copilot</a>
        finished work on behalf of
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        <a href="#event-1" class="Link--secondary"><relative-time datetime="2026-10-24T18:51:08Z">October 24, 2026 18:51</relative-time></a>
      </div>
      <div class="TimelineItem-body" id="stopped">
        <a class="author Link--primary text-bold" href="/apps/copilot-swe-agent">Copilot</a>
        stopped work on behalf of
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
        due to an error
      </div>
      <div class="TimelineItem-body" id="reviewed">
        <a class="author Link--primary text-bold" href="/apps/copilot-pull-request-reviewer">Copilot</a>
        finished reviewing on behalf of
        <a class="author Link--primary text-bold" href="/octocat">octocat</a>
      </div>
      <span id="agent"><a href="/apps/copilot-swe-agent">Copilot</a> finished work on behalf of <a href="/octocat">octocat</a></span>`
    translator = createTranslator({ matcher: twMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('finished')).toBe('Copilot 代表 octocat 完成了工作 <时间>')
    expect(shown('stopped')).toBe('Copilot 代表 octocat 因發生錯誤而停止了工作')
    expect(shown('reviewed')).toBe('Copilot 代表 octocat 完成了審查')
    expect(shown('agent')).toBe('Copilot 代表以下使用者完成了工作 octocat')
  })

  it('与全局词条同译的片段：拉取请求页照常翻译', () => {
    expect(twMatcher.translate('and the', SCOPE)).toBe('和')
    expect(twMatcher.translate('. We’ll occasionally send you account related emails.', SCOPE)).toBe(
      '。我們會不定期傳送與帳號相關的電子郵件給你。'
    )
    // 直撇号版由本词典收录，与弯撇号版同译
    expect(twMatcher.translate(". We'll occasionally send you account related emails.", SCOPE)).toBe(
      '。我們會不定期傳送與帳號相關的電子郵件給你。'
    )
    expect(twMatcher.translate('You can also', SCOPE)).toBe('你也可以')
  })
})
