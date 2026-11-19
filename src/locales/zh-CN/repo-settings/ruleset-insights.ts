import type { PageDictionary } from '../../../core/types'

/** 规则集运行结果：英文 → 中文 */
const RESULT: Readonly<Record<string, string>> = {
  passed: '通过',
  failed: '失败',
  bypassed: '被绕过',
  skipped: '已跳过'
}

/** 单项结果：2 rulesets passed */
const RESULT_PART = /^(\d+\+?) rulesets? (passed|failed|bypassed|skipped)$/

/**
 * 「2 rulesets passed, 1 ruleset bypassed and 1 ruleset failed」→「2 个规则集通过、1 个规则集被绕过、1 个规则集失败」；
 * 原文只有 and、没有逗号时不加标点，分句用「且」连接：「2 rulesets passed and 1 ruleset failed」→「2 个规则集通过且 1 个规则集失败」
 */
function translateResults(match: string): string {
  return match
    .split(/, | and /)
    .map(part => {
      const [, count = '', result = ''] = RESULT_PART.exec(part) ?? []
      return `${count} 个规则集${RESULT[result] ?? result}`
    })
    .join(match.includes(',') ? '、' : '且 ')
}

/**
 * 存储库设置 · 规则洞察：筛选栏、规则运行记录（推送、创建、删除、合并队列、工作流运行）、
 * 运行详细信息对话框（规则集结果、堆栈与合并队列详细信息、评估耗时、绕过请求）、升级提示与空状态。
 * 规则显示名称（Restrict deletions 等）见 ruleset-rules.ts 与 branches.ts。
 */
export default {
  static: {
    // 页面与升级提示
    'Repository ruleset insights': '存储库规则集洞察',
    'See how rulesets are affecting this repository': '查看规则集对此存储库的影响',
    'See how rulesets are affecting this organization': '查看规则集对此组织的影响',
    'See how rulesets are affecting this enterprise': '查看规则集对此企业的影响',
    'Enterprise accounts enable you to review commits against rulesets to track pass, fail, or bypass status for greater oversight and understanding.':
      '企业帐户可让你根据规则集审查提交，跟踪通过、失败或绕过状态，以加强监督和了解。',

    // 筛选与空状态
    'Filter rules insights': '筛选规则洞察',
    'Rule status': '规则状态',
    'Commit SHA': '提交 SHA',
    'Filter by commit SHA': '按提交 SHA 筛选',
    'SHA must be 7-64 hexadecimal characters': 'SHA 必须为 7-64 个十六进制字符',
    'Specify the user': '指定用户',
    'No rule evaluations matched your search': '没有与搜索匹配的规则评估',
    'Try adjusting your filters or reducing the time range of your search': '尝试调整筛选器或缩小搜索的时间范围',
    'Try expanding your search or creating a new ruleset in evaluate mode': '尝试扩大搜索范围或以评估模式新建规则集',
    'Rule insights search timed out': '规则洞察搜索超时',
    "Rule insights couldn't be loaded": '无法加载规则洞察',
    'Something went wrong while loading rule evaluations. Try reloading in a few moments.': '加载规则评估时出错。请稍后重新加载。',
    "Rule insights couldn't be loaded. Something went wrong while loading rule evaluations. Try reloading in a few moments.":
      '无法加载规则洞察。加载规则评估时出错。请稍后重新加载。',
    'Successes, failures, and bypasses over time': '成功、失败与绕过趋势',
    'Top bypassers': '绕过最多的参与者',

    // 运行记录
    'View rule runs': '查看规则运行',
    'View rule run': '查看规则运行',
    'Pushed with a deploy key': '使用部署密钥推送',
    'Merge queue failed': '合并队列失败',
    'Would block': '将会阻止',
    'Added blobs': '已添加 Blob',
    'Added commits': '已添加提交',
    'Delete repository': '删除存储库',
    'Unknown repository operation': '未知存储库操作',
    'triggered a workflow run': '触发了工作流运行',

    // 运行详细信息对话框
    'Merge queue push failed': '合并队列推送失败',
    'Some rules did not pass': '部分规则未通过',
    'Some rules were bypassed': '部分规则被绕过',
    'Push rules passed': '推送规则已通过',
    'Rules passed, but PR stack failed': '规则已通过，但 PR 堆栈失败',
    'All rules passed': '所有规则均已通过',
    'No rulesets ran': '没有运行任何规则集',
    'Push rules blocked this update, preventing other rulesets from applying.': '推送规则阻止了此更新，其他规则集未能应用。',
    'Other updates in this push were blocked impacting this change.': '此推送中的其他更新被阻止，影响了此更改。',
    'This update was fast-forwarded. A new merge queue commit was not created and status checks were not re-evaluated during the merge queue.':
      '此更新已快进。合并队列中未创建新的合并队列提交，也未重新评估状态检查。',
    'This update failed because another PR in the stack failed to merge.': '堆栈中另一个 PR 合并失败，此更新随之失败。',
    'This update failed because the PR stack failed to merge.': 'PR 堆栈合并失败，此更新随之失败。',
    'Stack details': '堆栈详细信息',
    'View stack details': '查看堆栈详细信息',
    'Hide stack details': '隐藏堆栈详细信息',
    'Pull requests in this stack': '此堆栈中的拉取请求',
    'Pull requests in this merge queue': '此合并队列中的拉取请求',
    'Merge queue details': '合并队列详细信息',
    'Required checks run by the merge queue': '合并队列运行的必需检查',
    'Outdated ruleset details': '过时规则集详细信息',
    'The ruleset that ran for this push has changed.': '此推送运行的规则集已更改。',
    'Bypass request': '绕过请求',
    'Bypass request approved by': '绕过请求批准者',
    'Bypass request rejected by': '绕过请求拒绝者',
    'Did not run': '未运行',
    'Push blocked': '推送被阻止',
    'Explain aggregate duration': '说明合计耗时',
    'Total time for all runs of this rule type': '此类规则所有运行的总耗时',
    'Evaluation timings': '评估耗时',
    'View evaluation timings': '查看评估耗时',
    'Hide evaluation timings': '隐藏评估耗时',
    'Low time budget': '时间预算不足',
    'Time budget': '时间预算',
    'Other suites evaluated': '已评估的其他套件',
    'Rule loading': '规则加载',
    'Bypass calculation': '绕过计算',
    'Provider hooks': '提供程序钩子',
    'Rules had almost no time to run. The request used most of its time budget before rule evaluation started, so this is usually caused by upstream delays rather than by the rules themselves.':
      '规则几乎没有运行时间。请求在规则评估开始前已用掉大部分时间预算，这通常由上游延迟而非规则本身导致。',
    'View warning': '查看警告'
  },
  scoped: {
    Bypass: '绕过',
    Pass: '通过',
    Fail: '失败',
    Blocked: '已阻止',
    Unknown: '未知',
    'Timed out': '已超时',
    Actor: '参与者',
    'All rulesets': '所有规则集',
    'All actors': '所有参与者',
    'Time period': '时间段',
    'Failed to load': '加载失败',
    // 时间线分组：Activity on <relative-time>
    'Activity on': '活动日期',
    // 运行记录：octocat pushed <a>1a2b3c4..5d6e7f8</a> to main
    pushed: '推送了',
    created: '创建了',
    deleted: '删除了',
    blocked: '阻止了',
    to: '到',
    'from merge queue': '从合并队列',
    'in repo': '位于存储库',
    // 分支重命名注记的片段；整句见 inline
    '(renamed to': '（重命名为',
    '(renamed from': '（重命名自',
    // 绕过请求：<a>Bypass request</a> approved by <user>
    'approved by': '批准者',
    'rejected by': '拒绝者'
  },
  regexp: [
    // 详细信息对话框标题下的结果：2 rulesets passed and 1 ruleset failed
    [
      /^\d+\+? rulesets? (?:passed|failed|bypassed|skipped)(?:(?:, | and )\d+\+? rulesets? (?:passed|failed|bypassed|skipped)){0,3}$/,
      translateResults
    ],
    // 规则集行：2 rules failed
    [/^(\d+\+?) rules? (failed|bypassed|skipped)$/, (_, count: string, result: string) => `${count} 条规则${RESULT[result] ?? result}`],
    // 合并组被阻止：Merge group of 3 pull requests blocked
    [/^Merge group of (\d+) pull requests blocked$/, '包含 $1 个拉取请求的合并组被阻止'],
    // 工作流运行：triggered a pull_request workflow run
    [/^triggered an? ([\w-]+) workflow run$/, '触发了 $1 工作流运行'],
    // 堆栈详细信息
    [/^Stack position: (\d+)$/, '堆栈位置：$1'],
    [/^Final merge failed: (.{1,200})$/, (_, reason: string) => `最终合并失败：${reason === 'Unknown reason' ? '未知原因' : reason}`],
    // 绕过请求的其他处理人：and 2 others.
    [/^and (\d+) others\.$/, '及另外 $1 人。'],
    // 违规列表：Found 120 violations (showing first 100)
    [/^Found (\d+) violations \(showing first (\d+)\)$/, '发现 $1 处违规（显示前 $2 处）']
  ],
  // 运行记录的分支重命名注记：<span> (renamed to <BranchName>新分支</BranchName>)</span>，右括号是单独的文本
  inline: [
    ['(renamed to {})', '（重命名为 {}）'],
    ['(renamed from {})', '（重命名自 {}）']
  ]
} satisfies PageDictionary
