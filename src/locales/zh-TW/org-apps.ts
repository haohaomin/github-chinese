import { tableEntries } from '../../core/table'
import type { PageDictionary } from '../../core/types'
import apps from './settings-developer/apps'

/** 应用设置页 Web 钩子请求记录的原文：组织 Web 钩子页与应用设置页同属 org-settings，译法不同，由 org-apps 区分 */
export const APP_DELIVERY_KEYS: ReadonlySet<string> = new Set([
  'Recent deliveries',
  'Recent Deliveries',
  'Redeliver',
  'redelivery',
  'Redeliver payload?',
  'Yes, redeliver this payload',
  'Oops, there was an error while trying to redeliver this payload.'
])

/**
 * 组织拥有的 GitHub 应用、OAuth 应用设置页（/organizations/<组织>/settings/apps/*、applications/*）：
 * 叠加在 org-settings 之上，Web 钩子请求记录沿用个人应用设置页（settings-developer/apps）的译法
 */
export default {
  scoped: Object.fromEntries(tableEntries(apps.scoped).filter(([key]) => APP_DELIVERY_KEYS.has(key)))
} satisfies PageDictionary
