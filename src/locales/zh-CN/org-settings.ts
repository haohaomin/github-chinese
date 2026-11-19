import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import actions from './org-settings/actions'
import archive from './org-settings/archive'
import billing from './org-settings/billing'
import code from './org-settings/code'
import copilot from './org-settings/copilot'
import developer from './org-settings/developer'
import general from './org-settings/general'
import moderation from './org-settings/moderation'
import nav from './org-settings/nav'
import people from './org-settings/people'
import privileges from './org-settings/privileges'
import roles from './org-settings/roles'
import secrets from './org-settings/secrets'
import security from './org-settings/security'
import teams from './org-settings/teams'
import thirdParty from './org-settings/third-party'
import webhooks from './org-settings/webhooks'
import rulesetImport from './repo-settings/ruleset-import'
import rulesetInsights from './repo-settings/ruleset-insights'
import rulesetRules from './repo-settings/ruleset-rules'
import rulesets from './repo-settings/rulesets'

/**
 * 组织设置（/organizations/<组织>/settings/…、/orgs/<组织>/settings/…）。
 * 人员、团队页属于 organization 页面类型，只能靠本区域的 static 词条生效。
 * 组织规则集页（/organizations/<组织>/settings/rules）与存储库规则集同一组件：合并存储库设置的规则集、规则、
 * 洞察、导入词典，放在本组子词典之后；同名 scoped 译法与规则集一致。
 */
export default mergeDictionaries(
  nav,
  general,
  roles,
  privileges,
  moderation,
  billing,
  code,
  copilot,
  actions,
  webhooks,
  security,
  secrets,
  thirdParty,
  developer,
  archive,
  people,
  teams,
  rulesets,
  rulesetRules,
  rulesetInsights,
  rulesetImport
) satisfies PageDictionary
