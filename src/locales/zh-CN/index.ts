import type { LocaleBundle } from '../../core/types'
import actions from './actions'
import auth from './auth'
import code from './code'
import codespaces from './codespaces'
import commits from './commits'
import common from './common'
import commonUi from './common-ui'
import copilot from './copilot'
import dashboard from './dashboard'
import discussions from './discussions'
import education from './education'
import explore from './explore'
import gist from './gist'
import insights from './insights'
import issues from './issues'
import marketplace from './marketplace'
import mcp from './mcp'
import newPages from './new'
import notifications from './notifications'
import orgSettings from './org-settings'
import organization from './organization'
import packages from './packages'
import profile from './profile'
import projects from './projects'
import pulls from './pulls'
import releases from './releases'
import repoSettings from './repo-settings'
import repository from './repository'
import search from './search'
import security from './security'
import settingsAccount from './settings-account'
import settingsDeveloper from './settings-developer'
import sponsors from './sponsors'
import status from './status'
import support from './support'
import wiki from './wiki'

/** 简体中文语言包；common 在前，页面词典按页面类型排列 */
export const zhCN: LocaleBundle = [
  ['common', common],
  ['common', commonUi],
  ['dashboard', dashboard],
  ['explore', explore],
  ['profile', profile],
  ['organization', organization],
  ['repository', repository],
  ['code', code],
  ['commits', commits],
  ['issues', issues],
  ['pulls', pulls],
  ['actions', actions],
  ['projects', projects],
  ['releases', releases],
  ['packages', packages],
  ['wiki', wiki],
  ['discussions', discussions],
  ['security', security],
  ['insights', insights],
  ['repo-settings', repoSettings],
  ['settings', settingsAccount],
  ['settings', settingsDeveloper],
  ['org-settings', orgSettings],
  ['notifications', notifications],
  ['search', search],
  ['new', newPages],
  ['gist', gist],
  ['codespaces', codespaces],
  ['copilot', copilot],
  ['auth', auth],
  ['marketplace', marketplace],
  ['sponsors', sponsors],
  ['education', education],
  ['mcp', mcp],
  ['status', status],
  ['support', support]
]
