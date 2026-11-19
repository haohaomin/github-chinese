import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import access from './repo-settings/access'
import actions from './repo-settings/actions'
import branches from './repo-settings/branches'
import codespaces from './repo-settings/codespaces'
import copilot from './repo-settings/copilot'
import dangerZone from './repo-settings/danger-zone'
import environments from './repo-settings/environments'
import general from './repo-settings/general'
import nav from './repo-settings/nav'
import pages from './repo-settings/pages'
import rulesetImport from './repo-settings/ruleset-import'
import rulesetInsights from './repo-settings/ruleset-insights'
import rulesetRules from './repo-settings/ruleset-rules'
import rulesets from './repo-settings/rulesets'
import secrets from './repo-settings/secrets'
import security from './repo-settings/security'
import webhooks from './repo-settings/webhooks'

/**
 * 存储库设置：页面类型 repo-settings 覆盖 /<owner>/<repo>/settings/… 与 /<owner>/<repo>/rules/…。
 * 包括常规（含危险区域）、协作者和团队、调解选项、分支 / 标签保护、规则集（编辑器、规则、洞察、导入）、操作、
 * Web 钩子与集成、环境、代码空间、页面、高级安全、部署密钥、机密和变量、Copilot。
 * 产品名、功能名、方案名的译法见 repo-settings/nav.ts 文件头。
 * static 全局生效（组织设置的规则集、Web 钩子等页面也会用到）；scoped 与 regexp 只在存储库设置页生效。
 * 正则按合并顺序匹配：含固定措辞的具体规则在前，纯计数规则在后。
 */
export default mergeDictionaries(
  nav,
  general,
  dangerZone,
  access,
  branches,
  rulesets,
  rulesetRules,
  rulesetInsights,
  rulesetImport,
  actions,
  webhooks,
  environments,
  codespaces,
  pages,
  security,
  secrets,
  copilot
) satisfies PageDictionary
