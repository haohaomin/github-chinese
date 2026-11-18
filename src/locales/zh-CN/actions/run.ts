import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, TIME_SOURCE, translateDate, translateTime } from '../helpers'
import { DURATION_SOURCE, formatDuration, RUN_STATUS, TRIGGER_EVENTS } from './format'

/**
 * 工作流运行详情：摘要页、作业列表、运行图、注释、工件、部署保护规则、
 * 作业日志页（步骤、工具栏）、重新运行对话框、使用情况页、工作流文件页、锁定文件页。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 触发事件：已知事件用中文，未知事件保留原文；与英文、数字之间留空格（由 GitHub 页面触发） */
function triggeredVia(event: string): string {
  return joinCjk(joinCjk('由', pick(TRIGGER_EVENTS, event) ?? event), '触发')
}

const ANNOTATION_UNITS: Readonly<Record<string, string>> = { error: '错误', warning: '警告', notice: '提示' }
const ANNOTATION_ITEM_RE = /(\d+) (error|warning|notice)s?/g

/** 2 errors and 6 notices → 2 个错误和 6 个提示 */
function annotationCounts(text: string): string {
  const items = [...text.matchAll(ANNOTATION_ITEM_RE)].map(([, count, unit]) => `${count} 个${ANNOTATION_UNITS[unit!]}`)
  if (items.length < 2) return items.join('')
  return `${items.slice(0, -1).join('、')}和 ${items.at(-1)}`
}

const ATTEMPT_LABELS: Readonly<Record<string, string>> = {
  'Latest attempt': '最新尝试',
  Attempt: '尝试',
  Latest: '最新'
}

/** 作业标题的结论：succeeded <时间> in 1m 41s */
const JOB_CONCLUSIONS: Readonly<Record<string, string>> = {
  succeeded: '成功于',
  failed: '失败于',
  cancelled: '取消于',
  skipped: '跳过于',
  completed: '完成于',
  'timed out': '超时于'
}

const JOB_CONCLUSION_SOURCE = Object.keys(JOB_CONCLUSIONS).join('|')

/** 作业状态筛选的“X jobs”标题 */
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

const RUNNER_KINDS: Readonly<Record<string, string>> = { hosted: '托管运行器', 'self-hosted': '自托管运行器' }

/** The self-hosted runner: name lost communication with the server. … */
function lostCommunication(kind: string, name: string | undefined, verify: string | undefined): string {
  return (
    `${pick(RUNNER_KINDS, kind)}${name ? ` ${name} ` : ''}与服务器失去连接。` +
    `${verify ? '请确认该机器正在运行且网络连接正常。' : ''}` +
    '工作流中终止运行器进程、耗尽其 CPU 或内存、阻断其网络访问的任何操作都可能导致此错误。'
  )
}

export default {
  static: {
    // 运行页导航
    'Workflow run': '工作流运行',
    'Workflow run summary': '工作流运行摘要',
    'Workflow run graph': '工作流运行图',
    'All jobs': '所有作业',
    'Filter by job status': '按作业状态筛选',
    'There are no jobs with this status': '没有此状态的作业',
    'Run details': '运行详细信息',
    'Workflow file': '工作流文件',
    'Agentic Workflow file': '代理工作流文件',
    'Re-run job': '重新运行作业',
    'Show all jobs': '显示所有作业',
    'Sign in to view logs': '登录以查看日志',
    'Currently running': '正在运行',

    // 运行操作
    'Re-run jobs': '重新运行作业',
    'Re-run all jobs': '重新运行所有作业',
    'Re-run failed jobs': '重新运行失败的作业',
    'Re-run single job': '重新运行单个作业',
    'Re-run this job': '重新运行此作业',
    'Re-run all checks': '重新运行所有检查',
    'Re-run triggered': '已触发重新运行',
    'Re-running...': '重新运行中...',
    'Re-running…': '重新运行中…',
    'Re-running jobs...': '正在重新运行作业...',
    'Re-running jobs…': '正在重新运行作业…',
    'A new attempt of this workflow will be started, including': '将启动此工作流的新尝试，包括',
    'all the jobs': '所有作业',
    'all failed jobs': '所有失败的作业',
    'and dependents:': '及其依赖作业：',
    'debug logging': '调试日志',
    'Cancel workflow': '取消工作流',
    'You have successfully requested the workflow to be canceled.': '已请求取消工作流。',
    'Workflow run options': '工作流运行选项',
    'View workflow runs': '查看工作流运行',
    'Delete all logs': '删除所有日志',
    'Are you sure you want to delete all logs for this run?': '确定要删除此运行的所有日志吗？',
    'Logs deleted successfully.': '日志已删除。',
    'Approve and run': '批准并运行',

    // 摘要
    'Manually triggered': '手动触发',
    'Total duration': '总时长',
    'Billable time': '计费时间',
    'Run and billable time': '运行和计费时间',
    'Produced during runtime': '运行期间生成',
    'Copy artifact digest': '复制工件摘要',
    'This artifact has expired and you can no longer download it': '此工件已过期且无法再下载',
    'Open job annotations': '展开作业注释',
    'Close job annotations': '收起作业注释',
    'Job summary generated at run-time': '运行时生成的作业摘要',
    'Unable to load summary': '无法加载摘要',
    'This job summary has expired and is no longer available': '此作业摘要已过期且不再可用',
    'View job summary': '查看作业摘要',
    'View job logs': '查看作业日志',
    'View raw markdown': '查看原始 Markdown',
    'This workflow graph cannot be shown': '无法显示此工作流图',
    'A graph will be generated the next time this workflow is run.': '下次运行此工作流时将生成图表。',
    'This run and associated checks have been archived and are scheduled for deletion.': '此运行及相关检查已存档并计划删除。',
    'Learn more about checks retention': '了解检查保留期',
    'This workflow is waiting for': '此工作流正在等待',
    'to complete before running.': '完成后再运行。',
    'Learn more about concurrency': '了解并发',
    'Oh hello! Nice to see you.': '你好呀！很高兴见到你。',
    'Made with ❤️ by': '由以下成员用 ❤️ 打造',

    // 等待批准（复刻拉取请求）
    'This workflow is': '此工作流正在',
    'awaiting approval': '等待维护者批准',
    'from a maintainer in': '所在拉取请求',

    // 部署保护规则（标题见 scoped，与存储库设置的环境页共用）
    'Reviewers, timers, and other rules protecting deployments in this run': '保护此运行中部署的审查者、计时器和其他规则',
    'The deployment was rejected or didn’t satisfy other protection rules.': '部署被拒绝或未满足其他保护规则。',
    "The deployment was rejected or didn't satisfy other protection rules.": '部署被拒绝或未满足其他保护规则。',

    // 作业页与步骤
    'This job was skipped': '此作业已跳过',
    'This job failed': '此作业失败',
    'This job was cancelled': '此作业已取消',
    'Starting job': '正在启动作业',
    'Waiting for pending jobs': '正在等待挂起的作业',
    'Set up job': '设置作业',
    'Complete job': '完成作业',
    'Initialize containers': '初始化容器',
    'Stop containers': '停止容器',
    'Parallel group': '并行组',
    'No steps available yet.': '暂无步骤。',
    'This step passed': '此步骤已通过',
    'This step failed': '此步骤失败',
    'This step was skipped': '此步骤已跳过',
    'This step was neutral': '此步骤结果为中性',
    'This step was cancelled': '此步骤已取消',
    'This step timed out': '此步骤已超时',
    'This step requires action with the application': '此步骤需要在应用中执行操作',
    'This step has been truncated due to its large size. View the raw logs from the': '此步骤因过大已被截断。工作流运行完成后可从',
    'menu once the workflow run has completed.': '菜单查看原始日志。',
    'This step has been truncated due to its large size. View the raw logs from the menu once the workflow run has completed.':
      '此步骤因过大已被截断。工作流运行完成后可从菜单查看原始日志。',
    'The logs for this run have expired and are no longer available.': '此运行的日志已过期且不再可用。',
    // 步骤日志加载失败
    'We are currently unable to download the log. Please try again later.': '当前无法下载日志。请稍后重试。',
    'The log was not found. It may have been deleted based on retention settings.': '未找到日志。可能已按保留设置删除。',
    'The logs for this run have expired and are no longer available. Logs may have been removed based on retention settings on the repo at the time the run was started.':
      '此运行的日志已过期且不再可用。日志可能已按运行开始时存储库的保留设置删除。',
    'The operation was canceled.': '操作已取消。',
    'The runner has received a shutdown signal. This can happen when the runner service is stopped, or a manually started runner is canceled.':
      '运行器收到关闭信号。运行器服务停止或手动启动的运行器被取消时会出现这种情况。',
    "The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings":
      '作业因最近的帐户付款失败或支出限额需要提高而未启动。请检查设置中的“计费和计划”部分',
    'The run was canceled by': '运行已被以下用户取消',
    'Due to capacity constraints, jobs targeting macOS arm64 runners may experience longer queue times.':
      '受容量限制，面向 macOS arm64 运行器的作业可能需要更长的排队时间。',

    // 日志工具栏
    'Search logs': '搜索日志',
    'Job log options': '作业日志选项',
    'Show timestamps': '显示时间戳',
    'Show full screen (Shift+F)': '全屏显示 (Shift+F)',
    'Download log archive': '下载日志存档',
    'View raw logs': '查看原始日志',
    'Try broadening your search filters.': '尝试放宽搜索筛选器。',

    // 使用情况页、工作流文件页、锁定文件页
    'Learn about OS pricing on GitHub Actions': '了解 GitHub 操作的操作系统定价',
    'Run time': '运行时间',
    'Workflow file for this run': '此运行的工作流文件',
    'Edit workflow file': '编辑工作流文件',
    'Lockfile for this run': '此运行的锁定文件',
    'Lockfile not found': '未找到锁定文件',
    'No lockfile was found for this workflow run. Lock your workflow dependencies by running': '此工作流运行没有锁定文件。在存储库中运行',
    'in your repository.': '以锁定工作流依赖项。'
  },

  scoped: {
    Summary: '摘要',
    Usage: '使用情况',
    Jobs: '作业',
    Job: '作业',
    Annotations: '注释',
    Artifacts: '工件',
    Size: '大小',
    Digest: '摘要',
    Event: '事件',
    'Error:': '错误：',
    'Notice:': '提示：',
    'Filter by status': '按状态筛选',
    'Copy permalink': '复制永久链接',
    'Fit to window': '适应窗口',
    'Zoom in': '放大',
    'Zoom out': '缩小',
    'Go to next result': '转到下一个结果',
    'Go to previous result': '转到上一个结果',
    Billable: '计费',
    time: '时间',
    at: '位于',
    'Deployment protection rules': '部署保护规则',

    // 运行状态（摘要、作业筛选）；Success / Queued / Completed 由公共词典提供
    // 公共词典的 Pending 是审查评论徽章（待处理），运行与作业状态作“挂起”
    Successful: '成功',
    Failure: '失败',
    Failed: '失败',
    Cancelled: '已取消',
    Canceled: '已取消',
    Skipped: '已跳过',
    'In progress': '正在进行',
    Waiting: '等待中',
    Pending: '挂起',
    Requested: '已请求',
    'Action required': '需要操作',
    Neutral: '中性',
    'Timed out': '已超时',
    'Startup failure': '启动失败',
    Stale: '已过时',

    // 作业标题后接时间：succeeded <时间> in 1m 41s
    succeeded: '成功于',
    failed: '失败于',
    cancelled: '取消于',
    Started: '开始于',
    ago: '前',

    // 部署保护规则：approved <时间>
    approved: '批准于',
    rejected: '拒绝于',
    passed: '通过于',

    // 步骤类型标签
    background: '后台',
    wait: '等待',
    'wait-all': '等待全部',
    cancel: '取消',
    parallel: '并行',

    // 等待步骤所引用步骤的结论（success / failure 不显示）
    neutral: '中性',
    skipped: '已跳过',
    'timed out': '已超时',
    'action required': '需要操作',
    stale: '已过时',
    'startup failure': '启动失败'
  },

  regexp: [
    // 摘要：Triggered via push
    [/^Triggered via (.+)$/, (_, event: string) => triggeredVia(event)],
    // 注释数量：2 errors and 6 notices
    [
      /^\d+ (?:error|warning|notice)s?(?:(?:,| and|, and) \d+ (?:error|warning|notice)s?){0,2}$/,
      (match: string) => annotationCounts(match)
    ],
    // 注释内容（GitHub 生成）
    [/^Process completed with exit code (-?\d+)\.$/, '进程以退出代码 $1 完成。'],
    [/^The process '(.+)' failed with exit code (-?\d+)$/, "进程 '$1' 以退出代码 $2 失败"],
    [/^Canceling since a higher priority waiting request for (.+) exists$/, '因 $1 存在更高优先级的等待请求而取消'],
    [
      /^Node\.js (\d+) is deprecated\. The following actions target Node\.js (\d+) but are being forced to run on Node\.js (\d+): (.+?)\. For more information see:$/,
      'Node.js $1 已弃用。以下操作以 Node.js $2 为目标但被强制在 Node.js $3 上运行：$4。详见：'
    ],
    [
      /^Node\.js (\d+) actions are deprecated\. Please update the following actions to use Node\.js (\d+): (.+?)\. For more information see:$/,
      'Node.js $1 操作已弃用。请将以下操作更新为使用 Node.js $2：$3。详见：'
    ],
    [
      new RegExp(`^("?)The (\\S+) label will migrate to (.+?) beginning (${DATE_SOURCE})\\. For more information, see$`),
      (_, quote: string, label: string, target: string, date: string) =>
        `${quote}${label} ${joinCjk(joinCjk('标签将于', translateDate(date) ?? date), '开始迁移到')} ${target}。详见`
    ],
    [
      new RegExp(`^The job has exceeded the maximum execution time of (\\d+[dhms](?: ?\\d+[dhms]){0,3})$`),
      (_, duration: string) => `作业已超过最长执行时间 ${formatDuration(duration)}`
    ],
    [
      /^The job running on runner (.+) has exceeded the maximum execution time of (\d+) minutes\.$/,
      '运行器 $1 上运行的作业已超过最长执行时间 $2 分钟。'
    ],
    [/^The job was canceled because "(.+)" failed\.$/, '作业因“$1”失败而取消。'],
    [/^The strategy configuration was canceled because "(.+)" failed$/, '策略配置因“$1”失败而取消'],
    [/^Input required and not supplied: (.+)$/, '缺少必需的输入：$1'],
    [
      /^No files were found with the provided path: (.+)\. No artifacts will be uploaded\.$/,
      '在提供的路径中未找到文件：$1。不会上传任何工件。'
    ],
    [/^Branch "(.+)" is not allowed to deploy to (.+) due to environment protection rules\.$/, '分支“$1”因环境保护规则不允许部署到 $2。'],
    [
      /^The (hosted|self-hosted) runner(?:: (.+?))? lost communication with the server\.( Verify the machine is running and has a healthy network connection\.)? Anything in your workflow that terminates the runner process, starves it for CPU\/Memory, or blocks its network access can cause this error\.$/,
      (_, kind: string, name: string | undefined, verify: string | undefined) => lostCommunication(kind, name, verify)
    ],
    [
      /^This request was automatically failed because there were no enabled runners online to process the request for more than (\d+) days?\.$/,
      '此请求因超过 $1 天没有已启用的在线运行器处理而自动失败。'
    ],
    [
      /^The job was not acquired by Runner of type (hosted|self-hosted) even after multiple attempts$/,
      (_, kind: string) => `多次尝试后作业仍未被${kind === 'hosted' ? '托管' : '自托管'}运行器获取`
    ],
    // 并行组标题：· 3 steps
    [/^· (\d+) steps$/, '· $1 个步骤'],
    // 步骤名：Run actions/checkout@v4、Post Run actions/checkout@v4
    [
      /^(Post )?Run ([\w.-]+\/[\w./-]+@[\w./-]+|docker:\/\/\S+|\.\/[\w./-]+)$/,
      (_, post: string, action: string) => `${post ? '后置运行' : '运行'} ${action}`
    ],
    // 作业标题整段：succeeded 5 minutes ago in 1m 41s → 成功于 5 分钟前 用时 1 分钟 41 秒
    // 原文无标点：结论与时间用 joinCjk 拼接（成功于昨天），时间与“用时”之间以空格分隔
    [
      new RegExp(`^(${JOB_CONCLUSION_SOURCE}) (${TIME_SOURCE}) in (${DURATION_SOURCE})$`),
      (_, conclusion: string, time: string, duration: string) =>
        `${joinCjk(pick(JOB_CONCLUSIONS, conclusion) ?? conclusion, translateTime(time))} 用时 ${formatDuration(duration)}`
    ],
    // 正在进行的作业：Started 5m ago、Started 5 minutes ago、Started just now
    [
      new RegExp(`^Started (?:(${DURATION_SOURCE}) ago|(${TIME_SOURCE}))$`),
      (_, duration: string, time: string) => joinCjk('开始于', duration ? `${formatDuration(duration)}前` : translateTime(time))
    ],
    // 作业标题：in 1m 41s
    [new RegExp(`^in (${DURATION_SOURCE})$`), (_, duration: string) => `用时 ${formatDuration(duration)}`],
    // 作业列表
    [/^(\d+(?:\/\d+)?) jobs? completed$/, '已完成 $1 个作业'],
    [/^Matrix: (.+)$/, '矩阵：$1'],
    [
      /^(Latest attempt|Attempt|Latest) #(\d+)$/,
      (_, label: string, number: string) => `${pick(ATTEMPT_LABELS, label) ?? label} #${number}`
    ],
    [/^Back to pull request #(\d+)$/, '返回拉取请求 #$1'],
    [new RegExp(`^(${JOB_FILTER_STATUS_SOURCE}) jobs$`), (_, status: string) => `${pick(RUN_STATUS, status) ?? status}的作业`],
    // 部署保护规则：production 和其他 2 个
    [/^(\d+) more$/, '其他 $1 个'],
    // 时长：1m 44s → 1 分钟 44 秒
    [new RegExp(`^(${DURATION_SOURCE})$`), (_, duration: string) => formatDuration(duration)]
  ],

  ignore: [
    // 矩阵作业分组名
    'li[data-has-subitem="true"]:has(a[href*="/job/"]) > button [data-component="ActionList.Item.Label"]',
    // 用户命名的步骤（GitHub 生成的步骤名照常翻译）
    STEP_NAME_IGNORE,
    // 等待步骤引用的步骤名；单个引用时标题摘要即步骤名（并行组标题的“· N steps”照常翻译）
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
    // 注释标题（作业名 / 步骤名）
    'annotation-message a > strong',
    // 使用情况页的作业名
    'a[href*="check_suite_focus=true"]',
    // 工件名
    'tr[data-artifact-id] > td:first-child :is(a, .text-bold)',
    // 工件文件浏览器的文件路径（下载时按此文本匹配文件，不能改动）
    '.js-artifact-files-list .flex-auto',
    // 部署保护规则中的环境名
    'a[href*="/deployments/activity_log?environment="]'
  ]
} satisfies PageDictionary
