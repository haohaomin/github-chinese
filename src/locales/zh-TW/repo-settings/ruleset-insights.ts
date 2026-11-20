import type { PageDictionary } from '../../../core/types'
import { CHART_A11Y_RULES } from '../insights/charts'
import { WEEKDAY_DATE_SOURCE, translateTokenDate } from '../settings-developer/tokens'

/** 规则集运行结果：英文 → 中文 */
const RESULT: Readonly<Record<string, string>> = {
  passed: '通過',
  failed: '失敗',
  bypassed: '遭繞過',
  skipped: '已略過'
}

/** 单项结果：2 rulesets passed */
const RESULT_PART = /^(\d+\+?) rulesets? (passed|failed|bypassed|skipped)$/

/** 规则集仪表板图表的数据系列：规则套件的通过 / 失败 / 绕过 */
const RULE_SUITE_SERIES: Readonly<Record<string, string>> = { Passes: '通過', Failures: '失敗', Bypasses: '繞過' }
const SERIES = `(${Object.keys(RULE_SUITE_SERIES).join('|')})`

/**
 * 「2 rulesets passed, 1 ruleset bypassed and 1 ruleset failed」→「2 個規則集通過、1 個規則集遭繞過、1 個規則集失敗」；
 * 原文只有 and、没有逗号时不加标点，分句用「且」连接：「2 rulesets passed and 1 ruleset failed」→「2 個規則集通過且 1 個規則集失敗」
 */
function translateResults(match: string): string {
  return match
    .split(/, | and /)
    .map(part => {
      const [, count = '', result = ''] = RESULT_PART.exec(part) ?? []
      return `${count} 個規則集${RESULT[result] ?? result}`
    })
    .join(match.includes(',') ? '、' : '且 ')
}

/**
 * 存储库设置 · 规则洞察：筛选栏、规则运行记录（推送、创建、删除、合并队列、工作流运行）、
 * 运行详细信息对话框（规则集结果、堆栈与合并队列详细信息、评估耗时、绕过请求）、升级提示与空状态。
 * 规则显示名称（Restrict deletions 等）见 ruleset-rules.ts 与 branches.ts。
 * 术语：insights → 洞察，run → 執行，actor → 執行者，bypass → 繞過，stack → 堆疊，merge group → 合併群組；
 * 阻挡推送、更新作「阻擋」（封鎖只用于用户）。
 */
export default {
  static: {
    // 页面与升级提示
    'Repository ruleset insights': '儲存庫規則集洞察',
    'See how rulesets are affecting this repository': '查看規則集對此儲存庫的影響',
    'See how rulesets are affecting this organization': '查看規則集對此組織的影響',
    'See how rulesets are affecting this enterprise': '查看規則集對此企業的影響',
    'Enterprise accounts enable you to review commits against rulesets to track pass, fail, or bypass status for greater oversight and understanding.':
      '企業帳號可讓你依據規則集審查提交，追蹤通過、失敗或繞過狀態，以加強監督和瞭解。',

    // 筛选与空状态
    'Filter rules insights': '篩選規則洞察',
    'Rule status': '規則狀態',
    'Commit SHA': '提交 SHA',
    'Filter by commit SHA': '依提交 SHA 篩選',
    'SHA must be 7-64 hexadecimal characters': 'SHA 必須為 7-64 個十六進位字元',
    'Specify the user': '指定使用者',
    'No rule evaluations matched your search': '沒有與搜尋相符的規則評估',
    'Try adjusting your filters or reducing the time range of your search': '嘗試調整篩選器或縮小搜尋的時間範圍',
    'Try expanding your search or creating a new ruleset in evaluate mode': '嘗試擴大搜尋範圍或以評估模式建立新規則集',
    'Rule insights search timed out': '規則洞察搜尋逾時',
    "Rule insights couldn't be loaded": '無法載入規則洞察',
    'Something went wrong while loading rule evaluations. Try reloading in a few moments.': '載入規則評估時發生錯誤。請稍後重新載入。',
    "Rule insights couldn't be loaded. Something went wrong while loading rule evaluations. Try reloading in a few moments.":
      '無法載入規則洞察。載入規則評估時發生錯誤。請稍後重新載入。',
    'Successes, failures, and bypasses over time': '成功、失敗和繞過的趨勢',
    'Top bypassers': '最常繞過的執行者',

    // 运行记录
    'View rule runs': '查看規則執行',
    'View rule run': '查看規則執行',
    'Pushed with a deploy key': '使用部署金鑰推送',
    'Merge queue failed': '合併佇列失敗',
    'Would block': '將會阻擋',
    'Added blobs': '新增的 Blob',
    'Added commits': '新增的提交',
    'Delete repository': '刪除儲存庫',
    'Unknown repository operation': '未知的儲存庫操作',
    'triggered a workflow run': '觸發了工作流程執行',

    // 运行详细信息对话框
    'Merge queue push failed': '合併佇列推送失敗',
    'Some rules did not pass': '部分規則未通過',
    'Some rules were bypassed': '部分規則遭繞過',
    'Push rules passed': '推送規則已通過',
    'Rules passed, but PR stack failed': '規則已通過，但 PR 堆疊失敗',
    'All rules passed': '所有規則都已通過',
    'No rulesets ran': '沒有執行任何規則集',
    'Push rules blocked this update, preventing other rulesets from applying.': '推送規則阻擋了此更新，其他規則集未能套用。',
    'Other updates in this push were blocked impacting this change.': '此推送中的其他更新遭阻擋，影響了此變更。',
    'This update was fast-forwarded. A new merge queue commit was not created and status checks were not re-evaluated during the merge queue.':
      '此更新已快轉。合併佇列期間未建立新的合併佇列提交，也未重新評估狀態檢查。',
    'This update failed because another PR in the stack failed to merge.': '此更新失敗，因為堆疊中另一個 PR 合併失敗。',
    'This update failed because the PR stack failed to merge.': '此更新失敗，因為 PR 堆疊合併失敗。',
    'Stack details': '堆疊詳細資料',
    'View stack details': '查看堆疊詳細資料',
    'Hide stack details': '隱藏堆疊詳細資料',
    'Pull requests in this stack': '此堆疊中的拉取請求',
    'Pull requests in this merge queue': '此合併佇列中的拉取請求',
    'Merge queue details': '合併佇列詳細資料',
    'Required checks run by the merge queue': '合併佇列執行的必要檢查',
    'Outdated ruleset details': '過時的規則集詳細資料',
    'The ruleset that ran for this push has changed.': '為此推送執行的規則集已變更。',
    'Bypass request': '繞過請求',
    'Bypass request approved by': '繞過請求核准者',
    'Bypass request rejected by': '繞過請求拒絕者',
    'Did not run': '未執行',
    'Push blocked': '推送遭阻擋',
    'Explain aggregate duration': '說明合計耗時',
    'Total time for all runs of this rule type': '此類規則所有執行的總耗時',
    'Evaluation timings': '評估耗時',
    'View evaluation timings': '查看評估耗時',
    'Hide evaluation timings': '隱藏評估耗時',
    'Low time budget': '時間預算不足',
    'Time budget': '時間預算',
    'Other suites evaluated': '已評估的其他套件',
    'Rule loading': '規則載入',
    'Bypass calculation': '繞過計算',
    // provider 与机密扫描的 Non-provider patterns（非提供者模式）同译「提供者」
    'Provider hooks': '提供者鉤子',
    'Rules had almost no time to run. The request used most of its time budget before rule evaluation started, so this is usually caused by upstream delays rather than by the rules themselves.':
      '規則幾乎沒有執行時間。請求在規則評估開始前已用掉大部分時間預算，這通常是上游延遲所致，而非規則本身造成。',
    'View warning': '查看警告'
  },
  scoped: {
    Bypass: '繞過',
    Pass: '通過',
    Fail: '失敗',
    Blocked: '已阻擋',
    Unknown: '未知',
    'Timed out': '已逾時',
    Actor: '執行者',
    'All rulesets': '所有規則集',
    'All actors': '所有執行者',
    'Time period': '時間範圍',
    'Failed to load': '載入失敗',
    // 时间线分组：Activity on <relative-time>
    'Activity on': '活動日期',
    // 运行记录：octocat pushed <a>1a2b3c4..5d6e7f8</a> to main
    pushed: '推送了',
    created: '建立了',
    deleted: '刪除了',
    blocked: '阻擋了',
    to: '到',
    'from merge queue': '從合併佇列',
    'in repo': '位於儲存庫',
    // 分支重命名注记的片段；整句见 inline
    '(renamed to': '（重新命名為',
    '(renamed from': '（重新命名自',
    // 绕过请求：<a>Bypass request</a> approved by <user>
    'approved by': '核准者',
    'rejected by': '拒絕者',
    // 仪表板图表（Highcharts SVG，见 core/ignore.ts 放行）：图例、Y 轴标题（组织规则集仪表板同一组件）
    Passes: '通過',
    Failures: '失敗',
    Bypasses: '繞過',
    Values: '值',
    // 仪表板指标卡片标题（规则集运行：允许 / 失败）
    Allowed: '已允許',
    Failed: '失敗'
  },
  regexp: [
    // 详细信息对话框标题下的结果：2 rulesets passed and 1 ruleset failed
    [
      /^\d+\+? rulesets? (?:passed|failed|bypassed|skipped)(?:(?:, | and )\d+\+? rulesets? (?:passed|failed|bypassed|skipped)){0,3}$/,
      translateResults
    ],
    // 规则集行：2 rules failed
    [/^(\d+\+?) rules? (failed|bypassed|skipped)$/, (_, count: string, result: string) => `${count} 個規則${RESULT[result] ?? result}`],
    // 合并组被阻挡：Merge group of 3 pull requests blocked
    [/^Merge group of (\d+) pull requests blocked$/, '包含 $1 個拉取請求的合併群組遭阻擋'],
    // 工作流运行：triggered a pull_request workflow run
    [/^triggered an? ([\w-]+) workflow run$/, '觸發了 $1 工作流程執行'],
    // 堆栈详细信息
    [/^Stack position: (\d+)$/, '堆疊位置：$1'],
    [/^Final merge failed: (.{1,200})$/, (_, reason: string) => `最終合併失敗：${reason === 'Unknown reason' ? '未知原因' : reason}`],
    // 绕过请求的其他处理人：and 2 others.
    [/^and (\d+) others\.$/, '和其他 $1 人。'],
    // 违规列表：Found 120 violations (showing first 100)
    [/^Found (\d+) violations \(showing first (\d+)\)$/, '發現 $1 項違規（顯示前 $2 項）'],
    // 仪表板图表（Highcharts SVG 放行后，组织规则集仪表板同一组件）：数据点、数据系列的无障碍名称，提示框的日期
    [
      new RegExp(`^(${WEEKDAY_DATE_SOURCE}), (-?[\\d,.]+)\\. ${SERIES}\\.$`),
      (_, date: string, value: string, series: string) => `${translateTokenDate(date)}，${value}。${RULE_SUITE_SERIES[series]}。`
    ],
    [
      new RegExp(`^${SERIES}, line (\\d+) of (\\d+) with (\\d+) data points?\\.$`),
      (_, series: string, index: string, total: string, points: string) =>
        `${RULE_SUITE_SERIES[series]}，第 ${index} 條線（共 ${total} 條），包含 ${points} 個資料點。`
    ],
    [new RegExp(`^(${WEEKDAY_DATE_SOURCE})$`), (_, date: string) => translateTokenDate(date)],
    // 仪表板图表的类型、坐标轴说明（同洞察页图表）
    ...CHART_A11Y_RULES
  ],
  // 运行记录的分支重命名注记：<span> (renamed to <BranchName>新分支</BranchName>)</span>，右括号是单独的文本
  inline: [
    ['(renamed to {})', '（重新命名為 {}）'],
    ['(renamed from {})', '（重新命名自 {}）']
  ]
} satisfies PageDictionary
