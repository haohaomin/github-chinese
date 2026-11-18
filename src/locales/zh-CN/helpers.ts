/**
 * 词典公用工具：日期、相对时间、中英文拼接（共用部分见 locales/shared/helpers.ts）。
 * 相对时间与日期不加空格（如“3天前”“2024年1月5日”），与引擎对 <relative-time> 输出的处理一致。
 *
 * *_SOURCE 常量是不含捕获组的正则片段，可拼进词典规则：
 *   [new RegExp(`^Updated (${TIME_SOURCE})$`), (_, time) => `${translateTime(time)}更新`]
 */

import { createTimeHelpers } from '../shared/helpers'

export {
  DATE_SOURCE,
  formatDate,
  isLocalZone,
  joinCjk,
  mergeDictionaries,
  MONTH_SOURCE,
  RELATIVE_SOURCE,
  spaceDigits,
  TIME_SOURCE,
  translateDate
} from '../shared/helpers'

export const { relativeTime, translateRelativeTime, translateTime } = createTimeHelpers({
  locale: 'zh-CN',
  namedDays: { now: '刚刚', 'just now': '刚刚', yesterday: '昨天', today: '今天', tomorrow: '明天' },
  // 与 projects 词典的距离前缀一致
  qualifiers: { about: '约', almost: '将近', over: '超过' }
})
