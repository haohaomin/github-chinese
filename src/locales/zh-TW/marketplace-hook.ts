import { tableEntries } from '../../core/table'
import type { PageDictionary } from '../../core/types'
import { APP_DELIVERY_KEYS } from './org-apps'
import apps from './settings-developer/apps'

/** 请求详情的标签页与区块名（同应用设置页） */
const DETAIL_KEYS: ReadonlySet<string> = new Set([
  'Response',
  'Headers',
  'Payload',
  'Body',
  'Hook request and reponse',
  'Hook request and response'
])

/**
 * 市场上架项的 Web 钩子页（/marketplace/<上架项>/hook）：叠加在 marketplace 之上。
 * 上架项的 Web 钩子属于应用，传递记录沿用应用设置页（settings-developer/apps）的译法：
 * Recent Deliveries → 最近傳遞，Redeliver → 重新傳遞。marketplace 的 Request 是“申請”，本页的请求标签页另译。
 */
export default {
  scoped: {
    ...Object.fromEntries(tableEntries(apps.scoped).filter(([key]) => APP_DELIVERY_KEYS.has(key) || DETAIL_KEYS.has(key))),
    Request: '請求',
    "Sorry, something went wrong and we weren't able to fetch this delivery's details.": '發生錯誤，無法取得此傳遞的詳細資料。',
    'Sorry, something went wrong and we weren’t able to fetch this delivery’s details.': '發生錯誤，無法取得此傳遞的詳細資料。'
  },
  regexp: [[/^Completed in ([\d.]+) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗時 ${seconds} 秒${dot ? '。' : ''}`]]
} satisfies PageDictionary
