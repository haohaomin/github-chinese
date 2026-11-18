/**
 * Actions 词典共用的格式工具（不是词典）：时长、状态、事件名。
 * 时长的数字与单位之间、各段之间加空格（术语表：中文与数字之间加空格）：1m 44s → 1 分钟 44 秒。
 */

/** 时长片段（不含捕获组）：45s、1m 44s、9h 55m 51s、1d 2h 3m 4s */
export const DURATION_SOURCE = '\\d+[dhms](?: \\d+[dhms]){0,3}'

const DURATION_UNITS: Readonly<Record<string, string>> = { d: '天', h: '小时', m: '分钟', s: '秒' }
const DURATION_PART_RE = /(\d+)([dhms])/g

/** 1m 44s → 1分钟 44秒；2m 0s → 2分钟 0秒；6h0m0s → 6小时 0分钟 0秒 */
export function formatDuration(text: string): string {
  const parts = Array.from(text.matchAll(DURATION_PART_RE), ([, amount, unit]) => `${amount}${DURATION_UNITS[unit!]}`)
  return parts.join(' ')
}

/** 运行与作业状态（首字母大写）：运行摘要、运行列表耗时栏、作业筛选 */
export const RUN_STATUS: Readonly<Record<string, string>> = {
  Success: '成功',
  Successful: '成功',
  Failure: '失败',
  Failed: '失败',
  Cancelled: '已取消',
  Canceled: '已取消',
  Skipped: '已跳过',
  'In progress': '正在进行',
  Queued: '已排队',
  Waiting: '等待中',
  Pending: '挂起',
  Requested: '已请求',
  Completed: '已完成',
  'Action required': '需要操作',
  Neutral: '中性',
  'Timed out': '已超时',
  'Startup failure': '启动失败',
  Stale: '已过时'
}

/** 运行列表状态图标的无障碍前缀（带冒号） */
export const RUN_STATUS_LABELS: Readonly<Record<string, string>> = {
  'neutral:': '中性：',
  'completed successfully:': '成功完成：',
  'failed:': '失败：',
  'cancelled:': '已取消：',
  'requires action with the application:': '需要操作：',
  'timed out:': '已超时：',
  'skipped:': '已跳过：',
  'marked stale by GitHub because it took too long:': '因耗时过长已被 GitHub 标记为过时：',
  'failed at startup:': '启动失败：',
  'status unavailable:': '状态不可用：',
  'requested:': '已请求：',
  'waiting for another serialized run to finish:': '正在等待另一个串行运行完成：',
  'waiting:': '等待中：',
  'queued:': '已排队：',
  'currently running:': '正在运行：'
}

/** 状态前缀的正则片段（不含冒号与捕获组），长者在前 */
export const RUN_STATUS_LABEL_SOURCE = Object.keys(RUN_STATUS_LABELS)
  .map(label => label.slice(0, -1))
  .sort((a, b) => b.length - a.length)
  .join('|')

/** 触发事件（Triggered via push 等，小写或产品名） */
export const TRIGGER_EVENTS: Readonly<Record<string, string>> = {
  push: '推送',
  'pull request': '拉取请求',
  'pull request target': '拉取请求目标',
  'pull request review': '拉取请求审查',
  'pull request review comment': '拉取请求审查评论',
  schedule: '计划',
  'workflow run': '工作流运行',
  'workflow dispatch': '手动调度',
  'workflow call': '工作流调用',
  'repository dispatch': '存储库调度',
  issue: '议题',
  issues: '议题',
  'issue comment': '议题评论',
  release: '发行版',
  discussion: '讨论',
  'discussion comment': '讨论评论',
  'merge group': '合并组',
  'check run': '检查运行',
  'check suite': '检查套件',
  create: '创建',
  delete: '删除',
  deployment: '部署',
  'deployment status': '部署状态',
  fork: '复刻',
  label: '标签',
  milestone: '里程碑',
  // public 事件：存储库由专用改为公共（可见性 → 公共，Make public → 设为公共），补主语“存储库”：由存储库设为公共触发
  public: '存储库设为公共',
  status: '状态',
  watch: '星标',
  'registry package': '注册表软件包',
  'page build': '页面构建',
  dynamic: '动态工作流',
  // 产品名（Pages 构建部署的运行）：GitHub Pages → GitHub 页面
  'GitHub Pages': 'GitHub 页面'
}

/** 部署状态（Status: Deployed (completed).） */
export const DEPLOYMENT_STATES: Readonly<Record<string, string>> = {
  Deployed: '已部署',
  'Failed to deploy': '部署失败',
  // 单独的进度动名词作“X中”
  Deploying: '部署中',
  Pending: '挂起',
  Queued: '已排队',
  Waiting: '等待中',
  'In progress': '正在进行',
  Inactive: '不活跃',
  Error: '出错',
  Failure: '失败',
  Abandoned: '已放弃',
  Destroyed: '已销毁',
  Success: '成功',
  Active: '活跃'
}

/** 部署进度（括号内） */
export const DEPLOYMENT_PHASES: Readonly<Record<string, string>> = {
  completed: '已完成',
  'in progress': '正在进行',
  in_progress: '正在进行',
  queued: '已排队',
  pending: '挂起',
  waiting: '等待中',
  inactive: '不活跃'
}

/** 状态：已部署（已完成）。未知取值保留原文，进度为英文时用半角括号：状态：已部署 (done) */
export function deploymentStatus(state: string, phase: string): string {
  const stateText = DEPLOYMENT_STATES[state] ?? state
  const phaseText = DEPLOYMENT_PHASES[phase]
  return phaseText === undefined ? `状态：${stateText} (${phase})` : `状态：${stateText}（${phaseText}）`
}
