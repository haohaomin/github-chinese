import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, TIME_SOURCE, translateDate, translateTime } from '../helpers'
import { DURATION_SOURCE, formatDuration, RUN_STATUS, TRIGGER_EVENTS } from './format'

/**
 * 工作流运行详情：摘要页、作业列表、运行图、注释、产物、部署保护规则、
 * 作业日志页（步骤、工具栏）、重新运行对话框、使用情况页、工作流文件页、锁定文件页。
 * Actions 的 annotation 按术语表作「標註」（不作「註解」），artifact 作「成品」。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 触发事件：已知事件用中文，未知事件保留原文；与英文、数字之间留空格（由 GitHub 頁面觸發） */
function triggeredVia(event: string): string {
  return joinCjk(joinCjk('由', pick(TRIGGER_EVENTS, event) ?? event), '觸發')
}

const ANNOTATION_UNITS: Readonly<Record<string, string>> = { error: '錯誤', warning: '警告', notice: '提示' }
const ANNOTATION_ITEM_RE = /(\d+) (error|warning|notice)s?/g

/** 2 errors and 6 notices → 2 個錯誤和 6 個提示 */
function annotationCounts(text: string): string {
  const items = [...text.matchAll(ANNOTATION_ITEM_RE)].map(([, count, unit]) => `${count} 個${ANNOTATION_UNITS[unit!]}`)
  if (items.length < 2) return items.join('')
  return `${items.slice(0, -1).join('、')}和 ${items.at(-1)}`
}

const ATTEMPT_LABELS: Readonly<Record<string, string>> = {
  'Latest attempt': '最新嘗試',
  Attempt: '嘗試',
  Latest: '最新'
}

/** 作业标题的结论：succeeded <时间> in 1m 41s */
const JOB_CONCLUSIONS: Readonly<Record<string, string>> = {
  succeeded: '成功於',
  failed: '失敗於',
  cancelled: '取消於',
  skipped: '略過於',
  completed: '完成於',
  'timed out': '逾時於'
}

const JOB_CONCLUSION_SOURCE = Object.keys(JOB_CONCLUSIONS).join('|')

/** 作业状态筛选的「X jobs」标题 */
const JOB_FILTER_STATUS_SOURCE = Object.keys(RUN_STATUS)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 作业日志中由 GitHub 生成的步骤名以外的步骤，名称属于用户内容（Post 前缀的后置步骤同样保留原名） */
const GENERATED_STEP_NAMES = ['Set up job', 'Complete job', 'Initialize containers', 'Stop containers', 'Parallel group']

/** 未命名的 uses 步骤：Run actions/checkout@v4、Run docker://…、Run ./…（及其 Post Run 后置步骤）照常翻译；run 命令步骤属于用户内容 */
const ACTION_STEP_NAMES = ['Run ', 'Post Run '].flatMap(prefix => [
  `[data-name^="${prefix}"][data-name*="@"]`,
  `[data-name^="${prefix}docker://"]`,
  `[data-name^="${prefix}./"]`
])

const STEP_NAME_IGNORE = `check-step:not(${[...GENERATED_STEP_NAMES.map(name => `[data-name="${name}"]`), ...ACTION_STEP_NAMES].join(
  ', '
)}) .CheckStep-titleName`

const RUNNER_KINDS: Readonly<Record<string, string>> = { hosted: '代管執行器', 'self-hosted': '自架執行器' }

/** The self-hosted runner: name lost communication with the server. … */
function lostCommunication(kind: string, name: string | undefined, verify: string | undefined): string {
  return (
    `${pick(RUNNER_KINDS, kind)}${name ? ` ${name} ` : ''}與伺服器失去連線。` +
    `${verify ? '確認機器正在執行且網路連線正常。' : ''}` +
    '工作流程中任何會終止執行器處理程序、耗盡其 CPU 或記憶體、阻斷其網路存取的操作都可能導致此錯誤。'
  )
}

export default {
  static: {
    // 运行页导航
    'Workflow run': '工作流程執行',
    'Workflow run summary': '工作流程執行摘要',
    'Workflow run graph': '工作流程執行圖表',
    'All jobs': '所有作業',
    'Filter by job status': '依作業狀態篩選',
    'There are no jobs with this status': '沒有此狀態的作業',
    'Run details': '執行詳細資料',
    'Workflow file': '工作流程檔案',
    'Agentic Workflow file': '代理式工作流程檔案',
    'Re-run job': '重新執行作業',
    'Show all jobs': '顯示所有作業',
    'Sign in to view logs': '登入以查看記錄',
    'Currently running': '正在執行',

    // 运行操作
    'Re-run jobs': '重新執行作業',
    'Re-run all jobs': '重新執行所有作業',
    'Re-run failed jobs': '重新執行失敗的作業',
    'Re-run single job': '重新執行單一作業',
    'Re-run this job': '重新執行此作業',
    'Re-run all checks': '重新執行所有檢查',
    'Re-run triggered': '已觸發重新執行',
    'Re-running...': '重新執行中...',
    'Re-running…': '重新執行中…',
    'Re-running jobs...': '正在重新執行作業...',
    'Re-running jobs…': '正在重新執行作業…',
    'A new attempt of this workflow will be started, including': '將啟動此工作流程的新嘗試，包括',
    'all the jobs': '所有作業',
    'all failed jobs': '所有失敗的作業',
    'and dependents:': '和相依的作業：',
    'debug logging': '偵錯記錄',
    'Cancel workflow': '取消工作流程',
    'You have successfully requested the workflow to be canceled.': '已成功請求取消工作流程。',
    'Workflow run options': '工作流程執行選項',
    'View workflow runs': '查看工作流程執行',
    'Delete all logs': '刪除所有記錄',
    'Are you sure you want to delete all logs for this run?': '確定要刪除此執行的所有記錄嗎？',
    'Logs deleted successfully.': '記錄已刪除。',
    'Approve and run': '核准並執行',

    // 摘要
    'Manually triggered': '手動觸發',
    'Total duration': '總耗時',
    'Billable time': '計費時間',
    'Run and billable time': '執行和計費時間',
    'Produced during runtime': '執行期間產生',
    'Copy artifact digest': '複製成品摘要',
    'This artifact has expired and you can no longer download it': '此成品已過期且無法再下載',
    'Open job annotations': '展開作業標註',
    'Close job annotations': '摺疊作業標註',
    'Job summary generated at run-time': '執行時產生的作業摘要',
    'Unable to load summary': '無法載入摘要',
    'This job summary has expired and is no longer available': '此作業摘要已過期且無法再取得',
    'View job summary': '查看作業摘要',
    'View job logs': '查看作業記錄',
    'View raw markdown': '查看原始 Markdown',
    'This workflow graph cannot be shown': '無法顯示此工作流程圖表',
    'A graph will be generated the next time this workflow is run.': '下次執行此工作流程時將產生圖表。',
    'This run and associated checks have been archived and are scheduled for deletion.': '此執行和相關檢查已封存並已排定刪除。',
    'Learn more about checks retention': '瞭解檢查保留期限',
    'This workflow is waiting for': '此工作流程正在等待',
    'to complete before running.': '完成後才會執行。',
    'Learn more about concurrency': '瞭解並行',
    'Oh hello! Nice to see you.': '你好！很高興見到你。',
    'Made with ❤️ by': '由下列成員用 ❤️ 打造',

    // 等待核准（分叉的拉取請求）：此工作流程正在 / 等待維護者核准 / 所屬拉取請求 / #123
    'This workflow is': '此工作流程正在',
    'awaiting approval': '等待維護者核准',
    'from a maintainer in': '於拉取請求',

    // 部署保护规则（标题见 scoped，与储存库设置的环境页共用）
    'Reviewers, timers, and other rules protecting deployments in this run': '保護此執行中部署的審查者、計時器和其他規則',
    'The deployment was rejected or didn’t satisfy other protection rules.': '部署遭到拒絕或未符合其他保護規則。',
    "The deployment was rejected or didn't satisfy other protection rules.": '部署遭到拒絕或未符合其他保護規則。',

    // 作业页与步骤
    'This job was skipped': '此作業已略過',
    'This job failed': '此作業失敗',
    'This job was cancelled': '此作業已取消',
    'Starting job': '正在啟動作業',
    'Waiting for pending jobs': '正在等待擱置中的作業',
    'Set up job': '設定作業',
    'Complete job': '完成作業',
    'Initialize containers': '初始化容器',
    'Stop containers': '停止容器',
    'Parallel group': '平行群組',
    'No steps available yet.': '尚無步驟。',
    'This step passed': '此步驟已通過',
    'This step failed': '此步驟失敗',
    'This step was skipped': '此步驟已略過',
    'This step was neutral': '此步驟結果為中性',
    'This step was cancelled': '此步驟已取消',
    'This step timed out': '此步驟已逾時',
    'This step requires action with the application': '此步驟需要在應用程式中採取動作',
    'This step has been truncated due to its large size. View the raw logs from the': '此步驟因內容過大已截斷。工作流程執行完成後可從',
    'menu once the workflow run has completed.': '選單查看原始記錄。',
    'This step has been truncated due to its large size. View the raw logs from the menu once the workflow run has completed.':
      '此步驟因內容過大已截斷。工作流程執行完成後可從選單查看原始記錄。',
    'The logs for this run have expired and are no longer available.': '此執行的記錄已過期且無法再取得。',
    // 步骤日志加载失败
    'We are currently unable to download the log. Please try again later.': '目前無法下載記錄。請稍後再試。',
    'The log was not found. It may have been deleted based on retention settings.': '找不到記錄。可能已依保留設定刪除。',
    'The logs for this run have expired and are no longer available. Logs may have been removed based on retention settings on the repo at the time the run was started.':
      '此執行的記錄已過期且無法再取得。記錄可能已依執行開始時儲存庫的保留設定移除。',
    'The operation was canceled.': '已取消操作。',
    'The runner has received a shutdown signal. This can happen when the runner service is stopped, or a manually started runner is canceled.':
      '執行器收到關閉訊號。執行器服務停止或手動啟動的執行器遭到取消時，就可能發生這種情況。',
    "The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings":
      '作業因帳號最近付款失敗或需要提高支出上限而未啟動。請檢查設定中的「帳務和方案」區段',
    'The run was canceled by': '此執行的取消者為',
    'Due to capacity constraints, jobs targeting macOS arm64 runners may experience longer queue times.':
      '由於容量限制，以 macOS arm64 執行器為目標的作業可能需要在佇列中等候較久。',

    // 日志工具栏
    'Search logs': '搜尋記錄',
    'Job log options': '作業記錄選項',
    'Show timestamps': '顯示時間戳記',
    'Show full screen (Shift+F)': '全螢幕顯示 (Shift+F)',
    'Download log archive': '下載記錄封存檔',
    'View raw logs': '查看原始記錄',
    'Try broadening your search filters.': '嘗試放寬搜尋篩選器。',

    // 使用情况页、工作流文件页、锁定文件页
    'Learn about OS pricing on GitHub Actions': '瞭解 GitHub 動作的作業系統定價',
    'Run time': '執行時間',
    'Workflow file for this run': '此執行的工作流程檔案',
    'Edit workflow file': '編輯工作流程檔案',
    'Lockfile for this run': '此執行的鎖定檔',
    'Lockfile not found': '找不到鎖定檔',
    'No lockfile was found for this workflow run. Lock your workflow dependencies by running': '此工作流程執行沒有鎖定檔。在儲存庫中執行',
    'in your repository.': '以鎖定工作流程的相依項目。'
  },

  scoped: {
    Summary: '摘要',
    Usage: '使用量',
    Jobs: '作業',
    Job: '作業',
    Annotations: '標註',
    Artifacts: '成品',
    Size: '大小',
    Digest: '摘要',
    Event: '事件',
    'Error:': '錯誤：',
    'Notice:': '提示：',
    'Filter by status': '依狀態篩選',
    'Copy permalink': '複製永久連結',
    'Fit to window': '符合視窗大小',
    'Zoom in': '放大',
    'Zoom out': '縮小',
    'Go to next result': '前往下一個結果',
    'Go to previous result': '前往上一個結果',
    Billable: '計費',
    time: '時間',
    at: '位於',
    'Deployment protection rules': '部署保護規則',

    // 运行状态（摘要、作业筛选）；Success / Queued / Completed 由公共词典提供
    // 公共词典的 Pending 是审查留言徽章（待處理），运行与作业状态作「擱置中」
    Successful: '成功',
    Failure: '失敗',
    Failed: '失敗',
    Cancelled: '已取消',
    Canceled: '已取消',
    Skipped: '已略過',
    'In progress': '進行中',
    Waiting: '等待中',
    Pending: '擱置中',
    Requested: '已請求',
    'Action required': '需要採取動作',
    Neutral: '中性',
    'Timed out': '已逾時',
    'Startup failure': '啟動失敗',
    Stale: '過時',

    // 作业标题后接时间：succeeded <时间> in 1m 41s
    succeeded: '成功於',
    failed: '失敗於',
    cancelled: '取消於',
    Started: '開始於',
    ago: '前',

    // 部署保护规则：approved <时间>
    approved: '核准於',
    rejected: '拒絕於',
    passed: '通過於',

    // 步骤类型标签
    background: '背景',
    wait: '等待',
    'wait-all': '等待全部',
    cancel: '取消',
    parallel: '平行',

    // 等待步骤所引用步骤的结论（success / failure 不显示）
    neutral: '中性',
    skipped: '已略過',
    'timed out': '已逾時',
    'action required': '需要採取動作',
    stale: '過時',
    'startup failure': '啟動失敗'
  },

  regexp: [
    // 摘要：Triggered via push
    [/^Triggered via (.+)$/, (_, event: string) => triggeredVia(event)],
    // 标注数量：2 errors and 6 notices
    [
      /^\d+ (?:error|warning|notice)s?(?:(?:,| and|, and) \d+ (?:error|warning|notice)s?){0,2}$/,
      (match: string) => annotationCounts(match)
    ],
    // 标注内容（GitHub 生成）
    [/^Process completed with exit code (-?\d+)\.$/, '處理程序以結束碼 $1 完成。'],
    [/^The process '(.+)' failed with exit code (-?\d+)$/, '處理程序「$1」以結束碼 $2 失敗'],
    [/^Canceling since a higher priority waiting request for (.+) exists$/, '因 $1 有優先順序更高的等待中請求而取消'],
    [
      /^Node\.js (\d+) is deprecated\. The following actions target Node\.js (\d+) but are being forced to run on Node\.js (\d+): (.+?)\. For more information see:$/,
      'Node.js $1 已淘汰。下列動作以 Node.js $2 為目標，但被強制在 Node.js $3 上執行：$4。如需詳細資訊，請參閱：'
    ],
    [
      /^Node\.js (\d+) actions are deprecated\. Please update the following actions to use Node\.js (\d+): (.+?)\. For more information see:$/,
      'Node.js $1 動作已淘汰。請將下列動作更新為使用 Node.js $2：$3。如需詳細資訊，請參閱：'
    ],
    [
      new RegExp(`^("?)The (\\S+) label will migrate to (.+?) beginning (${DATE_SOURCE})\\. For more information, see$`),
      (_, quote: string, label: string, target: string, date: string) =>
        `${quote}${label} ${joinCjk(joinCjk('標籤將於', translateDate(date) ?? date), '開始移轉到')} ${target}。如需詳細資訊，請參閱`
    ],
    [
      new RegExp(`^The job has exceeded the maximum execution time of (\\d+[dhms](?: ?\\d+[dhms]){0,3})$`),
      (_, duration: string) => `作業已超過最長執行時間 ${formatDuration(duration)}`
    ],
    [
      /^The job running on runner (.+) has exceeded the maximum execution time of (\d+) minutes\.$/,
      '在執行器 $1 上執行的作業已超過最長執行時間 $2 分鐘。'
    ],
    [/^The job was canceled because "(.+)" failed\.$/, '作業因「$1」失敗而取消。'],
    [/^The strategy configuration was canceled because "(.+)" failed$/, '策略設定因「$1」失敗而取消'],
    [/^Input required and not supplied: (.+)$/, '缺少必要的輸入：$1'],
    [
      /^No files were found with the provided path: (.+)\. No artifacts will be uploaded\.$/,
      '在提供的路徑中找不到檔案：$1。不會上傳任何成品。'
    ],
    [
      /^Branch "(.+)" is not allowed to deploy to (.+) due to environment protection rules\.$/,
      '分支「$1」因環境保護規則而不允許部署到 $2。'
    ],
    [
      /^The (hosted|self-hosted) runner(?:: (.+?))? lost communication with the server\.( Verify the machine is running and has a healthy network connection\.)? Anything in your workflow that terminates the runner process, starves it for CPU\/Memory, or blocks its network access can cause this error\.$/,
      (_, kind: string, name: string | undefined, verify: string | undefined) => lostCommunication(kind, name, verify)
    ],
    [
      /^This request was automatically failed because there were no enabled runners online to process the request for more than (\d+) days?\.$/,
      '此請求因超過 $1 天沒有已啟用的線上執行器可處理而自動失敗。'
    ],
    [
      /^The job was not acquired by Runner of type (hosted|self-hosted) even after multiple attempts$/,
      (_, kind: string) => `作業經多次嘗試仍未被${kind === 'hosted' ? '代管' : '自架'}執行器取得`
    ],
    // 平行群组标题：· 3 steps
    [/^· (\d+) steps$/, '· $1 個步驟'],
    // 步骤名：Run actions/checkout@v4、Post Run actions/checkout@v4
    [
      /^(Post )?Run ([\w.-]+\/[\w./-]+@[\w./-]+|docker:\/\/\S+|\.\/[\w./-]+)$/,
      (_, post: string, action: string) => `${post ? '後置執行' : '執行'} ${action}`
    ],
    // 作业标题整段：succeeded 5 minutes ago in 1m 41s → 成功於 5 分鐘前 耗時 1 分鐘 41 秒
    // 原文无标点：结论与时间用 joinCjk 拼接（成功於昨天），时间与「耗時」之间以空格分隔
    [
      new RegExp(`^(${JOB_CONCLUSION_SOURCE}) (${TIME_SOURCE}) in (${DURATION_SOURCE})$`),
      (_, conclusion: string, time: string, duration: string) =>
        `${joinCjk(pick(JOB_CONCLUSIONS, conclusion) ?? conclusion, translateTime(time))} 耗時 ${formatDuration(duration)}`
    ],
    // 进行中的作业：Started 5m ago、Started 5 minutes ago、Started just now
    [
      new RegExp(`^Started (?:(${DURATION_SOURCE}) ago|(${TIME_SOURCE}))$`),
      (_, duration: string, time: string) => joinCjk('開始於', duration ? `${formatDuration(duration)}前` : translateTime(time))
    ],
    // 作业标题：in 1m 41s
    [new RegExp(`^in (${DURATION_SOURCE})$`), (_, duration: string) => `耗時 ${formatDuration(duration)}`],
    // 作业列表
    [/^(\d+(?:\/\d+)?) jobs? completed$/, '已完成 $1 個作業'],
    [/^Matrix: (.+)$/, '矩陣：$1'],
    [
      /^(Latest attempt|Attempt|Latest) #(\d+)$/,
      (_, label: string, number: string) => `${pick(ATTEMPT_LABELS, label) ?? label} #${number}`
    ],
    [/^Back to pull request #(\d+)$/, '返回拉取請求 #$1'],
    [new RegExp(`^(${JOB_FILTER_STATUS_SOURCE}) jobs$`), (_, status: string) => `${pick(RUN_STATUS, status) ?? status}的作業`],
    // 部署保护规则：production 和其他 2 個
    [/^(\d+) more$/, '其他 $1 個'],
    // 时长：1m 44s → 1 分鐘 44 秒
    [new RegExp(`^(${DURATION_SOURCE})$`), (_, duration: string) => formatDuration(duration)]
  ],

  ignore: [
    // 矩阵作业分组名
    'li[data-has-subitem="true"]:has(a[href*="/job/"]) > button [data-component="ActionList.Item.Label"]',
    // 用户命名的步骤（GitHub 生成的步骤名照常翻译）
    STEP_NAME_IGNORE,
    // 等待步骤引用的步骤名；单个引用时标题摘要即步骤名（平行群组标题的「· N steps」照常翻译）
    '.CheckStep-inlineDetailsName',
    'check-step:not([data-parallel-group-header]) .CheckStep-titleSummary',
    // 日志行与时间戳
    '.js-check-line-content',
    '.CheckStep-line-timestamp',
    '.CheckRun-line-timestamp',
    // 作业页标题中的作业名（含窄屏标题，矩阵作业为“分组 / 作业”）；data-target 可能含多个值
    '#check-step-header-title',
    '.CheckRun-log-title .css-truncate',
    '[data-target~="streaming-graph-job.name"]',
    '[data-target~="streaming-graph-job.name"] ~ .css-truncate',
    // 窄屏导航对话框标题中的运行标题
    '.PageHeader-navigation .Overlay-title',
    // 运行标题对话框的无障碍标题（对话框内有 .markdown-title 的运行标题）
    '.Overlay-titleWrap:has(.markdown-title) > .Overlay-title',
    // 标注标题（作业名 / 步骤名）
    'annotation-message a > strong',
    // 使用情况页的作业名
    'a[href*="check_suite_focus=true"]',
    // 成品名
    'tr[data-artifact-id] > td:first-child :is(a, .text-bold)',
    // 成品文件浏览器的文件路径（下载时按此文本匹配文件，不能改动）
    '.js-artifact-files-list .flex-auto',
    // 部署保护规则中的环境名
    'a[href*="/deployments/activity_log?environment="]'
  ]
} satisfies PageDictionary
