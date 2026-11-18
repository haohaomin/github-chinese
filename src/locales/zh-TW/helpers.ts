/**
 * 繁体词典公用工具：日期、相对时间、中英文拼接（共用部分见 locales/shared/helpers.ts）。
 * 中文与数字之间加空格（如“3 天前”“2024年1月5日”），与引擎对 <relative-time lang="zh-TW"> 输出的处理一致。
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
  locale: 'zh-TW',
  namedDays: { now: '剛剛', 'just now': '剛剛', yesterday: '昨天', today: '今天', tomorrow: '明天' },
  qualifiers: { about: '約', almost: '將近', over: '超過' }
})
