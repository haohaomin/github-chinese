import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import applications from './settings-developer/applications'
import apps from './settings-developer/apps'
import codeSecurity from './settings-developer/code-security'
import codespaces from './settings-developer/codespaces'
import copilot from './settings-developer/copilot'
import keys from './settings-developer/keys'
import logs from './settings-developer/logs'
import auditEvents from './org-settings/audit-events'
import moderation from './settings-developer/moderation'
import permissions from './settings-developer/permissions'
import repositories from './settings-developer/repositories'
import tokens from './settings-developer/tokens'

/**
 * 个人设置的其余页面（/settings/…）：SSH 与 GPG 密钥、组织、企业、调解、存储库、代码空间、模型、包、
 * Copilot、页面、已保存回复、代码安全、安全日志与赞助日志、应用、预定提醒、开发人员设置（GitHub 应用、OAuth 应用、个人访问令牌）。
 * 产品名、方案名按用户要求译成中文（.harvest/scratch/followups/product-names.md）。
 * 左侧导航菜单见 settings-account。
 * 正则按顺序匹配：各文件内的具体规则在前，通用的计数、日期规则在后。
 */
export default mergeDictionaries(
  keys,
  moderation,
  repositories,
  codeSecurity,
  codespaces,
  copilot,
  logs,
  auditEvents,
  applications,
  apps,
  tokens,
  permissions
) satisfies PageDictionary
