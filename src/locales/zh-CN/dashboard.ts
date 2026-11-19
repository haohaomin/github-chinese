import type { PageDictionary } from '../../core/types'
import composer from './dashboard/composer'
import feed from './dashboard/feed'
import home from './dashboard/home'
import onboarding from './dashboard/onboarding'
import { mergeDictionaries } from './helpers'

/**
 * 登录后首页：/、/dashboard、/dashboard-feed、/feed 与组织仪表板 /orgs/<组织>/dashboard。
 * 包含上下文切换、左右侧栏、Copilot 输入框、智能体会话 / 拉取请求 / 议题分区、动态与筛选、新手引导卡片。
 */
export default mergeDictionaries(home, feed, onboarding, composer) satisfies PageDictionary
