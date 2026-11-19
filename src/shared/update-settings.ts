/**
 * 自动检查新版本的设置（设置项 updateCheck、updateInterval；检查见 shared/update-check）。
 * 单独成模块：设置（内容脚本也用）只引入这里的类型与常量，不带上检查新版本的代码
 */

/** 检查频率 */
export type UpdateInterval = 'daily' | 'weekly' | 'monthly'

export const UPDATE_INTERVALS: readonly UpdateInterval[] = ['daily', 'weekly', 'monthly']

export const DEFAULT_UPDATE_INTERVAL: UpdateInterval = 'daily'

const DAY_MS = 24 * 60 * 60 * 1000

/** 各频率两次自动检查的最短间隔 */
export const UPDATE_INTERVAL_MS: Readonly<Record<UpdateInterval, number>> = {
  daily: DAY_MS,
  weekly: 7 * DAY_MS,
  monthly: 30 * DAY_MS
}

export function isUpdateInterval(value: unknown): value is UpdateInterval {
  return (UPDATE_INTERVALS as readonly unknown[]).includes(value)
}
