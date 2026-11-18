import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 检查汇总中的状态词（与拉取请求合并框同一套译法） */
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
 * 原文只有 and、没有逗号时不加标点：1 failing and 1 successful → 1 个检查失败和 1 个成功
 */
function checkSummary(list: string): string {
  const parts = [...list.matchAll(CHECK_PART_RE)].map(
    ([, count, state], index) => `${count} 个${index === 0 ? '检查' : ''}${CHECK_STATE[state!] ?? state}`
  )
  return list.includes(',') ? parts.join('、') : parts.join('和 ')
}

/** 检查耗时：41s / 1m 30s / 2h 5m → 41 秒 / 1 分钟 30 秒 / 2 小时 5 分钟 */
const DURATION_UNIT: Readonly<Record<string, string>> = { s: '秒', m: '分钟', h: '小时', d: '天' }
const DURATION_SOURCE = '\\d+[smhd](?: \\d+[smhd]){0,2}'

function duration(text: string): string {
  return text.replace(/(\d+)([smhd])/g, (_, amount: string, unit: string) => `${amount}${DURATION_UNIT[unit] ?? unit}`)
}

/** 检查结论（Failing after 30s 中的状态词） */
const CHECK_CONCLUSION: Readonly<Record<string, string>> = {
  Failing: '失败',
  Failed: '失败',
  Cancelled: '取消',
  Canceled: '取消',
  Errored: '出错',
  'Timed out': '超时',
  'Startup failure': '启动失败',
  Skipped: '跳过',
  Stale: '过时',
  'Action required': '需要操作'
}

const CHECK_CONCLUSION_SOURCE = Object.keys(CHECK_CONCLUSION).join('|')

const regexp: readonly RegExpRule[] = [
  // 检查对话框副标题：1 failing, 2 skipped, and 15 successful checks
  [new RegExp(`^(${CHECK_PART_SOURCE}(?:(?:, and |, | and )${CHECK_PART_SOURCE})*) checks?$`), (_, list: string) => checkSummary(list)],
  [/^(\d+) checks?$/, '$1 个检查'],
  // 检查运行耗时：Successful in 41s / Failing after 2m 5s（原文无标点，译文不加逗号）
  [
    new RegExp(`^(Successful|Success|Completed) in (${DURATION_SOURCE})$`),
    (_, state: string, time: string) => joinCjk(`${state === 'Completed' ? '完成' : '成功'}用时`, duration(time))
  ],
  [
    new RegExp(`^(${CHECK_CONCLUSION_SOURCE}) after (${DURATION_SOURCE})$`),
    (_, state: string, time: string) => joinCjk(duration(time), `后${CHECK_CONCLUSION[state] ?? state}`)
  ]
]

/**
 * 提交检查弹层的汇总与耗时：检查对话框副标题（1 failing, 2 skipped, and 15 successful checks）、
 * 检查数（N checks）、检查运行耗时（Successful in 41s、Failing after 30s）。
 * 只含正则：由 commits.ts 合并；存储库首页最新提交行也有同一弹层，作用域 common → repository → code
 * 不含 commits，code.ts 也合并本文件（先例：codespaces/repo-rules.ts 由 repository.ts 合并）。
 */
export default { regexp } satisfies PageDictionary
