import type { PageDictionary } from '../../../core/types'

/** 检查状态（合并框检查汇总、分组标题） */
const CHECK_STATE: Readonly<Record<string, string>> = {
  failing: '失败',
  failed: '失败',
  errored: '出错',
  neutral: '中性',
  'timed out': '已超时',
  cancelled: '已取消',
  stale: '已过时',
  pending: '挂起',
  'in progress': '正在进行',
  requested: '已请求',
  queued: '已排队',
  skipped: '已跳过',
  expected: '等待报告',
  successful: '成功',
  'action required': '需要操作'
}

const CHECK_STATE_SOURCE = Object.keys(CHECK_STATE).join('|')
const CHECK_PART_SOURCE = `\\d+ (?:${CHECK_STATE_SOURCE})`
const CHECK_PART_RE = new RegExp(`(\\d+) (${CHECK_STATE_SOURCE})`, 'g')

/**
 * 1 failing, 2 skipped, and 15 successful → 1 个检查失败、2 个已跳过、15 个成功；
 * 原文只有 and、没有逗号时不加标点：2 failing and 3 successful → 2 个检查失败和 3 个成功（与 commits 词典的检查汇总一致）
 */
function checkSummary(list: string): string {
  const parts = [...list.matchAll(CHECK_PART_RE)].map(
    ([, count, state], i) => `${count} 个${i === 0 ? '检查' : ''}${CHECK_STATE[state!] ?? state}`
  )
  return list.includes(',') ? parts.join('、') : parts.join('和 ')
}

/** 检查耗时：2m / 30s / 1h 5m → 2 分钟 / 30 秒 / 1 小时 5 分钟 */
const DURATION_UNIT: Readonly<Record<string, string>> = { s: '秒', m: '分钟', h: '小时', d: '天' }
export const DURATION_SOURCE = '\\d+[smhd](?: \\d+[smhd]){0,2}'

export function duration(text: string): string {
  return text
    .split(' ')
    .map(part => part.replace(/^(\d+)([smhd])$/, (_, amount: string, unit: string) => `${amount}${DURATION_UNIT[unit]}`))
    .join(' ')
}

/** 检查结论（Failing after 30s 中的状态词） */
const CHECK_CONCLUSION: Readonly<Record<string, string>> = {
  Failing: '失败',
  Failed: '失败',
  Failure: '失败',
  Cancelled: '取消',
  Canceled: '取消',
  Errored: '出错',
  Error: '出错',
  'Timed out': '超时',
  'Startup failure': '启动失败',
  // 原文无标点：Neutral after 41s → 41 秒后结果为中性（与 checks.ts 的“结果为中性”一致）
  Neutral: '结果为中性',
  Skipped: '跳过',
  Stale: '过时',
  'Action required': '需要操作'
}

const CHECK_CONCLUSION_SOURCE = Object.keys(CHECK_CONCLUSION).join('|')

/** 审查分组（复数 / 单数） */
const REVIEW_GROUP: Readonly<Record<string, string>> = {
  approvals: '个批准',
  approval: '个批准',
  'requested changes': '个更改请求',
  'requested change': '个更改请求',
  'pending reviews': '个待处理的审查',
  'pending review': '个待处理的审查'
}

const REVIEW_GROUP_SOURCE = Object.keys(REVIEW_GROUP).join('|')

/** 审查者状态（合并框审查者列表；无障碍名称首字母小写） */
const REVIEW_STATUS: Readonly<Record<string, string>> = {
  'approved these changes': '批准了这些更改',
  'requested changes': '请求了更改',
  commented: '发表了评论'
}

/** 合并要求摘要（审查部分副标题） */
const REVIEW_REQUIREMENT: Readonly<Record<string, string>> = {
  'At least 1 approving review is required': '至少需要 1 个具有写入访问权限的审查者批准。',
  'An approval on the most recent push is required': '最近一次推送需要获得具有写入访问权限的审查者批准。',
  'Code owner review required': '需要具有写入访问权限的代码所有者审查。',
  'A review from a compliance team is required': '需要具有写入访问权限的合规团队审查。'
}

const REVIEW_REQUIREMENT_SOURCE = Object.keys(REVIEW_REQUIREMENT).join('|')

/** 服务端下发的必需状态检查状态（Pending 按术语表作“挂起”） */
const REQUIRED_CHECK_STATE: Readonly<Record<string, string>> = {
  expected: '尚未报告',
  failing: '失败',
  'in progress': '正在进行',
  pending: '处于挂起状态'
}

/** 1 change requested, 2 approving reviews → 1 个更改请求、2 个批准审查 */
function reviewSummary(text: string): string {
  return text
    .split(', ')
    .map(part => part.replace(/^(\d+) changes? requested$/, '$1 个更改请求').replace(/^(\d+) approving reviews?$/, '$1 个批准审查'))
    .join('、')
}

/** 审查状态，可带“只读权限”与“代表团队”：代表 org/team 以只读权限批准了这些更改 */
function reviewStatus(status: string, readOnly: string | undefined, teams: string | undefined): string {
  const base = REVIEW_STATUS[status.toLowerCase()] ?? status
  return `${teams ? `代表 ${teams} ` : ''}${readOnly ? '以只读权限' : ''}${base}`
}

const collapseOrExpand = (action: string): string => (action === 'Collapse' ? '折叠' : '展开')

/** 合并状态摘要：合并状态按钮的提示与侧边面板副标题 */
const MERGE_STATUS_MESSAGE: Readonly<Record<string, string>> = {
  'Ready to merge when you are.': '随时可以合并。',
  'Some optional checks are failing, but merging is still available.': '部分可选检查失败，但仍可合并。',
  'Still taking shape. Draft pull requests cannot be merged.': '仍在完善中。草稿拉取请求无法合并。',
  'Queued for merge.': '已排队等待合并。',
  'Waiting for checks to finish.': '正在等待检查完成。',
  // 原文无逗号：and 译“且”
  'Checks are failing and need attention.': '检查失败且需要处理。',
  "Waiting for a reviewer's approval.": '正在等待审查者批准。',
  'Waiting for a reviewer’s approval.': '正在等待审查者批准。',
  'Reviewers have requested changes.': '审查者已请求更改。',
  'Merge conflicts need to be resolved.': '需要解决合并冲突。',
  'Merging is currently blocked.': '合并当前被阻止。',
  'This pull request has been merged.': '此拉取请求已合并。',
  'This pull request has been closed.': '此拉取请求已关闭。',
  'Some required conversations still need resolution.': '部分必需的对话仍需解决。',
  'Some review requirements still need attention.': '部分审查要求仍需处理。',
  'Ready to merge. Workflow approval is still pending.': '可以合并。工作流仍在等待批准。',
  'Workflow approval is still pending.': '工作流仍在等待批准。',
  'Ready to merge. Some optional checks have not passed.': '可以合并。部分可选检查未通过。',
  'Some optional checks have not passed.': '部分可选检查未通过。',
  'Some optional checks are failing.': '部分可选检查失败。',
  'An authorized user must authenticate to merge.': '必须由获授权的用户完成身份验证才能合并。'
}

/** 2 checks are failing and need attention. */
const FAILING_CHECKS_RE = /^(\d+) checks? (?:is|are) failing and needs? attention\.$/

/** 合并状态按钮提示：<状态摘要> Click to view details in the merge panel. */
function mergeStatusHint(message: string): string {
  const failing = FAILING_CHECKS_RE.exec(message)
  const translated = failing ? `${failing[1]} 个检查失败且需要处理。` : MERGE_STATUS_MESSAGE[message]
  return translated ? `${translated}单击可在合并面板中查看详细信息。` : `${message} 单击可在合并面板中查看详细信息。`
}

/**
 * 合并框：新版（React）与经典版的合并状态面板、审查、检查、冲突与更新分支、命令行说明、
 * 合并方式与确认、绕过规则、合并被阻止。
 * 自动合并、合并队列、草稿、关闭与合并后、部署、堆栈合并、在场证明见 merge-flow.ts。
 * 被链接、分支名拆开的句子片段放在 scoped，避免影响其他页面。
 */
export default {
  static: {
    // 合并状态按钮与侧边面板
    'Merge status': '合并状态',
    'Loading merge status': '正在加载合并状态',
    'Close merge status': '关闭合并状态',
    'Merge info': '合并信息',
    'Merge status cannot be loaded': '无法加载合并状态',
    ...MERGE_STATUS_MESSAGE,

    // 审查
    'Changes approved': '更改已获批准',
    'Changes reviewed': '更改已审查',
    'No applicable reviews submitted': '没有提交适用的审查',
    'At least 1 approving review is required': '至少需要 1 个批准审查',
    'An approval on the most recent push is required': '最近一次推送需要获得批准',
    'Code owner review required': '需要代码所有者审查',
    'A review from a compliance team is required': '需要合规团队审查',
    'Review has been requested on this pull request. It is not required to merge.': '已请求审查此拉取请求。合并不要求此审查。',
    'Learn more about requesting a pull request review.': '了解请求拉取请求审查。',
    'Learn more about pull request reviews.': '了解拉取请求审查。',
    'At least 1 approving review is required to merge this pull request.': '合并此拉取请求至少需要 1 个批准审查。',
    'New changes require approval from someone other than the last pusher.': '新的更改需要由最后推送者以外的人批准。',
    'Dismiss review': '消除审查',
    'Re-request review': '重新请求审查',
    'Dismissing review': '正在消除审查',
    'Please provide a reason for dismissing the review': '请提供消除审查的原因',
    'This reason will appear in the timeline so other users will know why the review was dismissed.':
      '此原因将显示在时间线中以便其他用户了解审查被消除的原因。',
    'Show all reviewers': '显示所有审查者',
    'Hide all reviewers': '隐藏所有审查者',

    // 检查
    'All checks have passed': '所有检查均已通过',
    "Some checks haven't completed yet": '部分检查尚未完成',
    'Some checks haven’t completed yet': '部分检查尚未完成',
    'Some checks are waiting for approval': '部分检查正在等待批准',
    'Some checks were not successful': '部分检查未成功',
    'All checks have failed': '所有检查均失败',
    'Checks awaiting conflict resolution': '检查正在等待冲突解决',
    'Checks status is unknown': '检查状态未知',
    'No checks available.': '没有可用的检查。',
    'Checks settings': '检查设置',
    'Show all checks': '显示所有检查',
    'Hide all checks': '隐藏所有检查',
    'Checks cannot be loaded right now': '暂时无法加载检查',
    'Loading status checks…': '正在加载状态检查…',
    'Loading status checks...': '正在加载状态检查...',
    'Approve workflows to run': '批准运行工作流',
    'Approve and run workflows': '批准并运行工作流',
    'Re-running workflows': '正在重新运行工作流',
    'Successfully approved and re-requested workflows.': '已批准并重新请求运行工作流。',
    'Unable to re-run one or more workflows because they were created over a month ago.':
      '一个或多个工作流因创建于一个多月前而无法重新运行。',
    'Learn more about approving workflows.': '了解批准工作流。',
    'This workflow requires approval from a maintainer.': '此工作流需要维护者批准。',
    'First-time contributors need a maintainer to approve running workflows.': '首次贡献者需要维护者批准才能运行工作流。',
    'Copilot failure analysis': 'Copilot 失败分析',
    'is analyzing CI failures': '正在分析 CI 失败',
    'View failure analysis': '查看失败分析',
    'Failure analysis unavailable': '失败分析不可用',
    'Continuous integration has not been set up': '尚未设置持续集成',
    'GitHub Actions and several other apps can be used to automatically catch bugs and enforce style.':
      'GitHub 操作和其他多种应用可用于自动发现错误并统一代码风格。',
    'Waiting for status to be reported': '正在等待状态上报',
    'Waiting to run this check...': '正在等待运行此检查...',
    'Waiting to run this check…': '正在等待运行此检查…',
    'This check has started...': '此检查已开始...',
    'This check has started…': '此检查已开始…',

    // 冲突与更新分支
    'No conflicts with base branch': '与基础分支没有冲突',
    'Merging can be performed automatically.': '可以自动合并。',
    'Checking for the ability to merge automatically...': '正在检查能否自动合并...',
    'Checking for the ability to merge automatically…': '正在检查能否自动合并…',
    'Checking for ability to merge automatically…': '正在检查能否自动合并…',
    'Checking for ability to merge automatically...': '正在检查能否自动合并...',
    "Hang in there while we check the branch's status.": '检查分支状态期间请稍候。',
    'Hang in there while we check the branch’s status.': '检查分支状态期间请稍候。',
    'This branch is out-of-date with the base branch': '此分支落后于基础分支',
    'This branch has conflicts that must be resolved': '此分支存在必须解决的冲突',
    'This branch cannot be rebased due to conflicts': '此分支因冲突无法变基',
    'This branch has no conflicts with the base branch': '此分支与基础分支没有冲突',
    'This branch has no conflicts with the base branch when rebasing': '变基时此分支与基础分支没有冲突',
    'Rebase and merge can be performed automatically.': '可以自动变基并合并。',
    'Use the command line to resolve conflicts before continuing.': '请先使用命令行解决冲突再继续。',
    'or the command line to resolve conflicts before continuing.': '或命令行解决冲突后再继续。',
    'Use the web editor or the command line to resolve conflicts.': '使用 Web 编辑器或命令行解决冲突。',
    'Use the command line to resolve conflicts within the stack before continuing.': '请先使用命令行解决堆栈中的冲突再继续。',
    'Changes can be cleanly merged.': '更改可以无冲突合并。',
    'Conflicting files': '冲突的文件',
    'Retry loading Agent Merge': '重试加载代理合并',
    'Load Agent Merge settings to try again.': '加载代理合并设置后重试。',
    'Could not update Agent Merge': '无法更新代理合并',
    'Automatic merge conflict resolution is already enabled.': '已启用自动解决合并冲突。',
    'Automatically resolve merge conflicts in this pull request.': '自动解决此拉取请求中的合并冲突。',
    'Failed to start an agent session. Please try again.': '启动代理会话失败。请重试。',
    'Update with merge commit': '使用合并提交更新',
    'Update with rebase': '使用变基更新',
    'The merge commit will be associated with your account.': '合并提交将与你的帐户关联。',
    'This pull request will be rebased on top of the latest changes and then force pushed.': '此拉取请求将先变基到最新更改之上再强制推送。',
    'This branch cannot be rebased at this time.': '此分支暂时无法变基。',
    'Update branch options': '更新分支选项',
    "Couldn't update branch": '无法更新分支',
    'Couldn’t update branch': '无法更新分支',
    'Resolve conflicts via the command line': '通过命令行解决冲突',
    'Resolve Conflicts with CLI': '使用 CLI 解决冲突',
    'Stacked pull requests rely on rebasing rather than merge commits to update your branch. Instead of merging upstream changes into your branch, a rebase will replay the commits from your head branch on top of the latest base.':
      '堆叠式拉取请求依靠变基而不是合并提交来更新分支。变基不会把上游更改合并到你的分支，而是在最新的基础分支之上重放头部分支的提交。',
    // Use the <gh stack> CLI to resolve conflicts within your stack of branches.
    'CLI to resolve conflicts within your stack of branches.': 'CLI 解决分支堆栈中的冲突。',
    'Checkout the stack of branches locally.': '在本地检出分支堆栈。',
    'Rebase the stack with changes from the base branch.': '使用基础分支的更改变基堆栈。',
    'Fix any conflicts and commit the result.': '修复所有冲突并提交结果。',
    // See <Resolving a merge conflict> for step-by-step instructions on resolving merge conflicts.
    'for step-by-step instructions on resolving merge conflicts.': '中的分步说明。',
    'Copy checkout command to clipboard': '复制检出命令到剪贴板',
    'Copy rebase command to clipboard': '复制变基命令到剪贴板',
    'Copy push command to clipboard': '复制推送命令到剪贴板',

    // 命令行合并说明
    'Merging via command line': '通过命令行合并',
    'Checkout via command line': '通过命令行检出',
    'If you do not want to use the merge button or an automatic merge cannot be performed, you can perform a manual merge on the command line. However, the following steps are not applicable if the base branch is protected.':
      '如果不想使用合并按钮或无法自动合并，可以在命令行中手动合并。但如果基础分支受保护，以下步骤不适用。',
    'If you cannot merge a pull request automatically here, you have the option of checking it out via command line to resolve conflicts and perform a manual merge.':
      '如果无法在此自动合并拉取请求，可以通过命令行检出以解决冲突并手动合并。',
    'Clone the repository or update your local repository with the latest changes.': '克隆存储库或将本地存储库更新到最新。',
    'Switch to the base branch of the pull request.': '切换到拉取请求的基础分支。',
    'Switch to the head branch of the pull request.': '切换到拉取请求的头部分支。',
    'Merge the head branch into the base branch.': '将头部分支合并到基础分支。',
    'Merge the base branch into the head branch.': '将基础分支合并到头部分支。',
    'Fix the conflicts and commit the result.': '修复冲突并提交结果。',
    'From your project repository, check out a new branch and test the changes.': '在项目存储库中检出一个新分支并测试更改。',
    'Merge the changes and update on GitHub.': '合并更改并在 GitHub 上更新。',
    // 旧版合并框的命令行说明与冲突提示
    'Checkout via the command line': '通过命令行检出',
    'If the conflicts on this branch are too complex to resolve in the web editor, you can check it out via command line to resolve the conflicts.':
      '如果此分支上的冲突过于复杂而无法在 Web 编辑器中解决，可以通过命令行检出并解决冲突。',
    'These conflicts are too complex to resolve in the web editor.': '这些冲突过于复杂而无法在 Web 编辑器中解决。',
    'Resolve conflicts then push again. These conflicts are too complex to resolve in the web editor. Actions workflows will not trigger on activity from this pull request while it has merge conflicts.':
      '请解决冲突后重新推送。这些冲突过于复杂而无法在 Web 编辑器中解决。此拉取请求有合并冲突时其活动不会触发操作工作流。',
    'or the command line to resolve conflicts before continuing. Actions workflows will not trigger on activity from this pull request while it has merge conflicts.':
      '或命令行解决冲突后再继续。此拉取请求有合并冲突时其活动不会触发操作工作流。',
    'You do not have permission to push to the head branch.': '你没有推送到头部分支的权限。',
    'Pull request cannot be merged because it has a merge conflict.': '拉取请求因存在合并冲突而无法合并。',
    'This branch cannot be rebased due to conflicts.': '此分支因冲突无法变基。',
    'Resolving a merge conflict using the command line': '使用命令行解决合并冲突',
    'Copy clone URL': '复制克隆 URL',
    'Copy clone command': '复制克隆命令',
    'Copy checkout command': '复制检出命令',
    'Copy merge command': '复制合并命令',
    'Copy push command': '复制推送命令',

    // 合并方式与合并按钮
    'Merge pull request': '合并拉取请求',
    'Squash and merge': '压缩并合并',
    'Rebase and merge': '变基并合并',
    'Create a merge commit': '创建合并提交',
    'Confirm merge': '确认合并',
    'Confirm squash and merge': '确认压缩并合并',
    'Confirm rebase and merge': '确认变基并合并',
    'Merge stack': '合并堆栈',
    'Confirm merge stack': '确认合并堆栈',
    'Squash and merge stack': '压缩并合并堆栈',
    'Confirm squash and merge stack': '确认压缩并合并堆栈',
    'Rebase and merge stack': '变基并合并堆栈',
    'Confirm rebase and merge stack': '确认变基并合并堆栈',
    'Enable auto-merge': '启用自动合并',
    'Confirm auto-merge': '确认自动合并',
    'Enable auto-merge (squash)': '启用自动合并（压缩）',
    'Enable auto-merge (rebase)': '启用自动合并（变基）',
    'Confirm auto-merge (squash)': '确认自动合并（压缩）',
    'Confirm auto-merge (rebase)': '确认自动合并（变基）',
    'Bypass rules and merge': '绕过规则并合并',
    'Confirm bypass rules and merge': '确认绕过规则并合并',
    'Bypass rules and merge (squash)': '绕过规则并合并（压缩）',
    'Bypass rules and merge (rebase)': '绕过规则并合并（变基）',
    'Confirm bypass rules and merge (squash)': '确认绕过规则并合并（压缩）',
    'Confirm bypass rules and merge (rebase)': '确认绕过规则并合并（变基）',
    'Select merge method': '选择合并方式',
    'All commits from this branch will be added to the base branch via a merge commit.': '此分支的所有提交将通过合并提交添加到基础分支。',
    'The 1 commit from this branch will be added to the base branch.': '此分支的 1 个提交将添加到基础分支。',
    'The 1 commit from this branch will be rebased and added to the base branch.': '此分支的 1 个提交将变基后添加到基础分支。',
    'Merge commits are not allowed on this repository.': '此存储库不允许合并提交。',
    'Squash merges are not allowed on this repository.': '此存储库不允许压缩合并。',
    'Rebase merges are not allowed on this repository.': '此存储库不允许变基合并。',
    'This branch cannot be rebased safely.': '此分支无法安全变基。',
    'Checking for the ability to merge stack': '正在检查能否合并堆栈',
    'Merging is blocked due to failing stack merge requirements': '因堆栈合并要求未满足而无法合并',
    'Checking for the ability to merge automatically': '正在检查能否自动合并',
    'You can also merge this with the command line.': '你也可以通过命令行合并。',
    'View command line instructions.': '查看命令行说明。',
    'to this repository can merge pull requests.': '的用户才能合并拉取请求。',
    'to this repository can mark a draft pull request as ready for review.': '的用户才能将草稿拉取请求标记为可供审查。',

    // 确认合并
    'Add an optional extended description…': '添加可选的扩展描述…',
    'Add an optional extended description...': '添加可选的扩展描述...',
    'Select commit author email': '选择提交作者电子邮件',
    'Repository rule violations found': '发现违反存储库规则的情况',
    'Merge error warning banner': '合并错误警告横幅',
    'Base branch was modified. Review and try the merge again.': '基础分支已修改。请检查后重试合并。',
    'Head branch was modified. Review and try the merge again.': '头部分支已修改。请检查后重试合并。',
    'Pull Request is not mergeable': '拉取请求无法合并',
    'Pull request is not mergeable': '拉取请求无法合并',

    // 绕过规则
    'Merge without waiting for requirements to be met (bypass rules)': '不等待满足要求即合并（绕过规则）',
    'Merge without waiting for requirements to be met (bypass branch protections)': '不等待满足要求即合并（绕过分支保护）',
    'Skip the queue and merge directly.': '跳过队列直接合并。',
    'Use the selected merge method without waiting.': '立即使用所选合并方式。',

    // 合并被阻止（规则失败原因由服务端下发）
    'Merging is blocked': '合并被阻止',
    'The base branch restricts merging to authorized users.': '基础分支仅允许获授权的用户合并。',
    'Learn more about protected branches.': '了解受保护分支。',
    'Merging can be performed automatically once the requested changes are addressed.': '处理所请求的更改后即可自动合并。',
    'The base branch requires all commits to be signed.': '基础分支要求所有提交都已签名。',
    'Commits must have verified signatures.': '提交必须有经过验证的签名。',
    'Learn more about signing commits.': '了解提交签名。',
    'The base branch requires all conversations on code to be resolved.': '基础分支要求解决所有代码对话。',
    'All comments must be resolved.': '必须解决所有评论。',
    'Changes must be made through a pull request.': '必须通过拉取请求进行更改。',
    'Changes must be made through the merge queue': '必须通过合并队列进行更改',
    'Changes must be made through the merge queue.': '必须通过合并队列进行更改。',
    'This branch must not contain merge commits.': '此分支不得包含合并提交。',
    'Required deployments must succeed before merging.': '必需的部署成功后才能合并。',
    'Required status checks must pass before merging.': '必需的状态检查通过后才能合并。',
    'Required status checks must pass before merging': '必需的状态检查通过后才能合并',
    'Required statuses must pass before merging': '必需的状态检查通过后才能合并',
    "You're not authorized to push to this branch.": '你无权推送到此分支。',
    'You’re not authorized to push to this branch.': '你无权推送到此分支。',
    // 网址自动成链接时的前半：… Visit <网址> for more information.（for more information. 由 common/site.ts 收录；纯文本整句见正则）
    "You're not authorized to push to this branch. Visit": '你无权推送到此分支。请访问',
    'You’re not authorized to push to this branch. Visit': '你无权推送到此分支。请访问',
    'Required approving review count not met.': '未达到所需的批准审查数量。',
    // 规则集限制合并方式（原文方式名无引号，译文不加）
    'Merge is not an allowed merge method in this repository.': '合并不是此存储库允许的合并方式。',
    'Squash is not an allowed merge method in this repository.': '压缩不是此存储库允许的合并方式。',
    'Rebase is not an allowed merge method in this repository.': '变基不是此存储库允许的合并方式。',
    'User does not have push access to the repository.': '用户没有此存储库的推送权限。'
  },
  scoped: {
    // 合并框里的短词与句子片段（被链接、分支名拆开）
    Mergeable: '可合并',
    'Able to merge': '可以合并',
    'Unable to merge': '无法合并',
    'Cannot merge': '无法合并',
    'Checks pending': '检查挂起',
    'Review requested': '已请求审查',
    'Merge is blocked': '合并被阻止',
    'Merge method': '合并方式',
    'Merge options': '合并选项',
    'Merge error': '合并错误',
    Required: '必需',
    Started: '开始于',
    Skipped: '已跳过',
    'In progress': '正在进行',
    Neutral: '中性',
    Expected: '等待报告',
    Stale: '已过时',
    Cancelled: '已取消',
    Successful: '成功',
    Failing: '失败',
    Waiting: '等待中',
    Requested: '已请求',
    Unknown: '未知',
    'Startup failure': '启动失败',
    'Action required': '需要操作',
    'failing checks': '失败的检查',
    'successful checks': '成功的检查',
    'pending checks': '挂起的检查',
    'in progress checks': '正在进行的检查',
    'skipped checks': '已跳过的检查',
    'neutral checks': '中性的检查',
    'all checks': '全部检查',
    'Group by status': '按状态分组',
    'No grouping': '不分组',
    'Approve and run': '批准并运行',
    'Creating task…': '正在创建任务…',
    'review options': '审查选项',
    'was requested for review': '被请求审查',
    'was requested for review as a codeowner': '被请求以代码所有者身份审查',
    'write access': '写入访问权限',
    'contact support': '联系支持',
    'Try reloading the page, or if the problem persists': '请重新加载页面，或在问题持续存在时',
    'Try again or if the problem persists': '重试或在问题持续存在时',
    // 原文界面名无引号，译文不加
    'view the Checks tab.': '查看检查标签页。',
    'Only those with': '只有拥有此存储库',
    // You can also <a>open this in GitHub Desktop</a> or view <a>command line instructions</a>.（You can also 由 common-ui 翻译）
    'open this in GitHub Desktop': '在 GitHub 桌面版中打开',
    'or view': '或查看',
    'command line instructions': '命令行说明',
    'You will be able to merge this pull request after you': '合并此拉取请求前需要先',
    'verify your email address': '验证电子邮件地址',
    'Merging must be performed from the': '必须从',
    'advisory.': '公告中执行合并。',
    'Use the': '请使用',
    'web editor': 'Web 编辑器',
    'or the': '或',
    'command line': '命令行',
    'to resolve conflicts.': '解决冲突。',
    'Use the command line': '请使用命令行',
    'to resolve conflicts before continuing.': '解决冲突后再继续。',
    'These conflicts are too complex to resolve in the web editor': '这些冲突过于复杂而无法在 Web 编辑器中解决',
    Conflicts: '冲突',
    'Merge conflicts': '合并冲突',
    'merge conflicts': '合并冲突',
    'Resolve conflicts': '解决冲突',
    'Edit on the web': '在网页上编辑',
    'Watch with Copilot': '由 Copilot 监视',
    'Update branch': '更新分支',
    'Rebase branch': '变基分支',
    'Updating branch': '正在更新分支',
    'Rebasing branch': '正在变基分支',
    'CLI Instructions': 'CLI 说明',
    Step: '步骤',
    See: '请参阅',
    'Resolving a merge conflict': '解决合并冲突',
    'Push the changes.': '推送更改。',
    'Copy command': '复制命令',
    'Commit message': '提交消息',
    'Extended description': '扩展描述',
    'Commit email': '提交电子邮件',
    'Optional override': '可选覆盖',
    'Bypass requirements': '绕过要求',
    'Confirming...': '确认中...',
    'Confirming…': '确认中…',
    'Merging...': '合并中...',
    'Merging…': '合并中…'
  },
  regexp: [
    // 检查汇总：1 failing, 2 skipped, 15 successful checks（经典版：… and 3 successful checks）
    [new RegExp(`^(${CHECK_PART_SOURCE}(?:(?:, and |, | and )${CHECK_PART_SOURCE})*) checks?$`), (_, list) => checkSummary(list)],
    [/^(\d+) checks?$/, '$1 个检查'],
    [
      new RegExp(`^(Collapse|Expand) (${CHECK_PART_SOURCE}) checks? group$`),
      (_, action, part) => `${collapseOrExpand(action)}分组 ${checkSummary(part)}`
    ],
    [/^(Collapse|Expand) (\d+) checks? group$/, (_, action, count) => `${collapseOrExpand(action)}分组 ${count} 个检查`],
    // 检查耗时：Successful in 2m / Failing after 30s（原文无标点，译文不加逗号）
    [
      new RegExp(`^(Successful|Success|Completed) in (${DURATION_SOURCE})$`),
      (_, state, time) => `${state === 'Completed' ? '完成' : '成功'}用时 ${duration(time)}`
    ],
    [
      new RegExp(`^(${CHECK_CONCLUSION_SOURCE}) after (${DURATION_SOURCE})$`),
      (_, state, time) => `${duration(time)}后${CHECK_CONCLUSION[state] ?? state}`
    ],
    [FAILING_CHECKS_RE, '$1 个检查失败且需要处理。'],
    [/^(\d+) workflows? awaiting approval$/, '$1 个工作流等待批准'],
    [/^(.+) Click to view details in the merge panel\.$/, (_, message) => mergeStatusHint(message)],
    // 审查分组：2 approvals / 1 pending review
    [new RegExp(`^(\\d+) (${REVIEW_GROUP_SOURCE})$`), (_, count, group) => `${count} ${REVIEW_GROUP[group] ?? group}`],
    [
      new RegExp(`^(Collapse|Expand) (\\d+) (${REVIEW_GROUP_SOURCE}) group$`),
      (_, action, count, group) => `${collapseOrExpand(action)}分组 ${count} ${REVIEW_GROUP[group] ?? group}`
    ],
    [/^list of (approvals|requested changes|pending reviews)$/, (_, group) => `${(REVIEW_GROUP[group] ?? group).replace(/^个/, '')}列表`],
    // 审查者状态：Approved these changes [with read-only permissions] [for org/team]
    // 合并框审查者列表的状态不带时间：commented 作“发表了评论”；后接时间的 commented 作“评论于”
    // （审查头部的状态标签见 common-ui，评论头部的读屏标题 <用户名> commented <时间> 见 comments.ts 的行内句）
    [
      /^(Approved these changes|Requested changes|Commented)( with read-only permissions)?(?: for (.+))?$/,
      (_, status, readOnly, teams) => reviewStatus(status, readOnly, teams)
    ],
    // 排除 previously：评论列表审查头部的已消除审查标签（previously commented 等）由 timeline.ts 收录
    [
      /^(?!previously )([\w-]+(?:\[bot\])?) (approved these changes|requested changes|commented)( with read-only permissions)?(?: for (.+))?$/,
      (_, login, status, readOnly, teams) => `${login} ${reviewStatus(status, readOnly, teams)}`
    ],
    [
      /^([\w-]+(?:\[bot\])?) was requested for review( as a codeowner)?$/,
      (_, login, owner) => `${login} ${owner ? '被请求以代码所有者身份审查' : '被请求审查'}`
    ],
    [/^([\w-]+(?:\[bot\])?)['’]s avatar image$/, '$1 的头像'],
    // 审查要求
    [/^At least (\d+) approving reviews are required$/, '至少需要 $1 个批准审查'],
    [
      /^At least (\d+) approving reviews? (?:is|are) required by reviewers with write access\.$/,
      '至少需要 $1 个具有写入访问权限的审查者批准。'
    ],
    [/^At least (\d+) approving reviews are required to merge this pull request\.$/, '合并此拉取请求至少需要 $1 个批准审查。'],
    [
      new RegExp(`^(${REVIEW_REQUIREMENT_SOURCE}) by reviewers with write access\\.$`),
      (_, summary) => REVIEW_REQUIREMENT[summary] ?? summary
    ],
    [/^No applicable reviews submitted by reviewers with write access\.$/, '具有写入访问权限的审查者没有提交适用的审查。'],
    // 原文无冒号：改语序
    [
      /^(\d+ changes? requested(?:, \d+ approving reviews?)?|\d+ approving reviews?) by reviewers with write access\.$/,
      (_, summary) => `具有写入访问权限的审查者提交了 ${reviewSummary(summary)}。`
    ],
    [/^(\d+) reviews? requesting changes by reviewers with write access\.$/, '$1 个具有写入访问权限的审查者请求更改。'],
    [/^(\d+) changes? requested$/, '$1 个更改请求'],
    [/^(\d+) approving reviews?$/, '$1 个批准审查'],
    [/^(\d+) pending reviewers?$/, '$1 个待审查者'],
    [/^Waiting on code owner review from (.+)\.$/, '正在等待代码所有者 $1 的审查。'],
    // 冲突与更新分支
    [
      /^Merge the latest changes from (.+) into this branch\. This merge commit will be associated with ([\w-]+)\.$/,
      '将 $1 的最新更改合并到此分支。此合并提交将与 $2 关联。'
    ],
    [/^Merge the latest changes from (.+) into this branch\.$/, '将 $1 的最新更改合并到此分支。'],
    [/^Merge the latest changes from$/, '将'],
    [/^into this branch\.$/, '的最新更改合并到此分支。'],
    // 命令行说明步骤：Step 1 / Step 1:
    [/^Step (\d+)(:?)$/, (_, step, colon) => `第 ${step} 步${colon ? '：' : ''}`],
    // 合并方式说明
    [
      /^The (\d+) commits from this branch will be combined into one commit in the base branch\.$/,
      '此分支的 $1 个提交将压缩为基础分支中的一个提交。'
    ],
    [/^The (\d+) commits from this branch will be rebased and added to the base branch\.$/, '此分支的 $1 个提交将变基后添加到基础分支。'],
    [/^The (\d+) commits from this branch will be added to the base branch\.$/, '此分支的 $1 个提交将添加到基础分支。'],
    [
      /^All commits from these (\d+) branches will be added to the base branch via merge commits\.$/,
      '这 $1 个分支的所有提交将通过合并提交添加到基础分支。'
    ],
    [
      /^The commits from these (\d+) branches will be combined into one commit per branch in the base branch\.$/,
      '这 $1 个分支的提交将在基础分支中按分支各压缩为一个提交。'
    ],
    [
      /^All commits from these (\d+) branches will be rebased and added to the base branch\.$/,
      '这 $1 个分支的所有提交将变基后添加到基础分支。'
    ],
    [
      /^Merging is blocked due to (failing|pending) merge requirements$/,
      (_, verb) => (verb === 'pending' ? '因合并要求尚未完成而无法合并' : '因合并要求未满足而无法合并')
    ],
    [/^This commit will be authored by (\S+)\.$/, '此提交的作者电子邮件为 $1。'],
    [/^This will rebase your changes and merge them into (.+)\.$/, '这将变基你的更改并合并到 $1。'],
    [/^This will squash your changes and merge them into (.+)\.$/, '这将压缩你的更改并合并到 $1。'],
    // 服务端下发的规则失败原因
    [
      /^Required status check "(.+)" is (expected|failing|in progress|pending)\.$/,
      (_, name, state) => `必需的状态检查“${name}”${REQUIRED_CHECK_STATE[state] ?? state}。`
    ],
    [/^(\d+) of (\d+) required status checks? (?:has|have) not succeeded: (.+)\.$/, '$2 个必需的状态检查中有 $1 个未成功：$3。'],
    [/^(\d+) of (\d+) required status checks? (?:is|are) expected\.$/, '$2 个必需的状态检查中有 $1 个尚未报告。'],
    [
      /^(\d+) of (\d+) required status checks? (?:is|are) (pending|in progress)\.$/,
      (_, count, total, state) => `${total} 个必需的状态检查中有 ${count} 个${REQUIRED_CHECK_STATE[state] ?? state}。`
    ],
    // 网址为纯文本时整句（链接时的前半见 static）
    [
      /^You['’]re not authorized to push to this branch\. Visit (\S+) for more information\.$/,
      '你无权推送到此分支。请访问 $1 了解详细信息。'
    ]
  ]
} satisfies PageDictionary
