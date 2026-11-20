import { tableEntries } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import apps from '../settings-developer/apps'
import permissions from '../settings-developer/permissions'
import { APP_DELIVERY_KEYS } from '../org-apps'

/**
 * 不从个人开发人员设置复用的原文：全站 static 或组织设置其他文件已收录且译文相同的（导航、Web 钩子、
 * IP 允许列表、机密和变量、角色等），以及组织设置页保留现有译法的（Required 为“必填”、Added 为“已添加”、all 语境不定）
 */
const NOT_REUSED: ReadonlySet<string> = new Set([
  // 全站 static
  'Discussion',
  // nav
  'Custom properties',
  'GitHub Apps',
  'Issue Fields',
  'OAuth Apps',
  'Pages',
  'Personal access tokens',
  'Webhooks',
  // webhooks
  'Custom property',
  'Deployments',
  'Meta',
  'Personal access token requests',
  'Personal access token request created, approved, denied, or cancelled.',
  'Secret',
  '(not recommended)',
  'not recommended',
  'Response',
  'Headers',
  'Payload',
  'Body',
  'Hook request and reponse',
  'Hook request and response',
  // security
  'Dependabot alerts',
  'IP allow list',
  'IP address or range in CIDR notation',
  'Short description of IP address or range',
  'Check IP address',
  // secrets、roles、privileges、actions、third-party
  'Secrets',
  'Variables',
  'Members',
  'Read',
  'No access',
  'write',
  'Installed on',
  // 保留组织设置页现有译法
  'Required',
  'Added',
  'all'
])

/** 个人开发人员设置的 scoped 词条去掉不复用的原文与 Web 钩子请求记录（组织应用设置页由 org-apps 叠加） */
function reuse(entries: readonly (readonly [string, string])[]): Record<string, string> {
  return Object.fromEntries(entries.filter(([key]) => !NOT_REUSED.has(key) && !APP_DELIVERY_KEYS.has(key)))
}

/** 交付耗时由 webhooks 收录 */
const appRules = (apps.regexp ?? []).filter(([pattern]) => !pattern.test('Completed in 1 second'))

/**
 * 组织开发人员设置（/organizations/<组织>/settings/apps、applications、publisher_verification…）：
 * 组织拥有的 GitHub 应用、OAuth 应用列表与发布者验证；注册表单、应用设置页、权限选择器与可订阅事件
 * 与个人开发人员设置同一组件，沿用 settings-developer 的 apps、permissions 词典（scoped 与正则），译法保持一致。
 */
export default {
  static: {
    // GitHub 应用、OAuth 应用列表
    'No Organization Owned Apps': '暂无组织拥有的应用',
    'Do you want to develop an App that uses the GitHub API? Register an App to generate OAuth tokens.':
      '想开发使用 GitHub API 的应用？注册应用以生成 OAuth 令牌。',
    'Want to build something that integrates with and extends GitHub? Register a new GitHub App to get started developing on the GitHub API.':
      '想构建与 GitHub 集成并扩展 GitHub 的工具？注册新的 GitHub 应用，开始基于 GitHub API 开发。',

    // 发布者验证
    'There must be 1 or more GitHub/OAuth App registered by the organization to request publisher verification':
      '组织至少需要注册 1 个 GitHub 应用或 OAuth 应用才能申请发布者验证',
    'You can request publisher verification for your organization. A': '你可以为组织申请发布者验证。验证后，你在市场中发布的应用将添加',
    'badge will be added to your apps published in the marketplace, recognizing that apps and other published materials were created by you.':
      '徽章，表明这些应用和其他发布内容由你创建。',
    'Learn more about publisher verification.': '了解发布者验证。'
  },
  scoped: {
    ...reuse(tableEntries(apps.scoped)),
    ...reuse(tableEntries(permissions.scoped)),
    // 权限名 Watching：settings-developer 不放进 scoped（个人设置由 settings-account 收录），
    // 本区按权限名译“关注”，与权限名拼接（删除关注）一致
    Watching: '关注'
  },
  regexp: [...appRules, ...(permissions.regexp ?? [])]
} satisfies PageDictionary
