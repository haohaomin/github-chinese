import { browser } from 'wxt/browser'
import { downloadText } from '../../components/download'
import { createToastSource } from '../../components/toast'
import { useSettings } from '../../components/useSettings'
import {
  backupFileName,
  isEmptyBackup,
  mergeImportedEntries,
  mergeImportedRules,
  mergeImportedSettings,
  parseBackup,
  scopeBackup,
  serializeBackup,
  settingsOfScope,
  type BackupData,
  type BackupScope
} from '../../shared/backup'
import { enterpriseHosts } from '../../shared/enterprise'
import { githubTokenItem, normalizeToken } from '../../shared/github-api'
import {
  getCustomEntries,
  getSearchBlockRules,
  getSettings,
  pendingSitesItem,
  setCustomEntries,
  setSearchBlockRules
} from '../../shared/settings'
import { sendToBackground } from '../../shared/tab-messages'

export interface UseBackup {
  /** 导出范围内的设置；读取失败时提示 */
  exportScope(scope: BackupScope): Promise<boolean>
  /** 导入文件中范围内的部分；结果（已导入、格式错误、读取失败、保存失败）在页面顶部提示 */
  importScope(file: Blob, scope: BackupScope): Promise<boolean>
}

/** 已授权的企业版站点 */
async function grantedHosts(): Promise<readonly string[]> {
  return enterpriseHosts((await browser.permissions.getAll()).origins ?? [])
}

/** 已保存的令牌（下载次数设置）；没有时不写入文件 */
async function tokenPart(): Promise<Pick<BackupData, 'githubToken'>> {
  const token = normalizeToken(await githubTokenItem.getValue())
  return token ? { githubToken: token } : {}
}

/** 读取范围内的设置 */
async function collect(scope: BackupScope): Promise<BackupData> {
  const withSettings = scope !== 'enterprise'
  const settings = withSettings ? settingsOfScope(await getSettings(), scope) : undefined
  return {
    ...(settings ? { settings } : {}),
    ...(scope === 'all' ? { customEntries: await getCustomEntries() } : {}),
    ...(scope === 'all' || scope === 'purify' ? { searchBlockRules: await getSearchBlockRules() } : {}),
    ...(scope === 'all' || scope === 'enterprise' ? { enterpriseSites: await grantedHosts() } : {}),
    ...(scope === 'downloads' ? await tokenPart() : {})
  }
}

/** 已打开的 GitHub 页面重新读取词条、规则；失败时这些页面刷新后才用上 */
function notify(type: 'gcn:custom-entries-saved' | 'gcn:search-rules-saved'): void {
  sendToBackground({ type }).catch(() => undefined)
}

/** 设置备份的导出、导入。须在组件 setup 或 effectScope 内调用 */
export function useBackup(): UseBackup {
  const toast = createToastSource()
  const { update } = useSettings()

  async function exportScope(scope: BackupScope): Promise<boolean> {
    let data: BackupData
    try {
      data = await collect(scope)
    } catch {
      toast.show('danger', 'readFailed')
      return false
    }
    const now = new Date()
    downloadText(backupFileName(scope, now), serializeBackup(data, now))
    return true
  }

  /** 写入各部分；任一失败时为 false。设置项按写入前的最新设置合并（见 mergeImportedSettings） */
  async function apply(data: BackupData): Promise<boolean> {
    const { settings } = data
    if (settings && Object.keys(settings).length > 0 && !(await update(current => mergeImportedSettings(current, settings)))) return false
    try {
      if (data.customEntries) {
        await setCustomEntries(mergeImportedEntries(await getCustomEntries(), data.customEntries))
        notify('gcn:custom-entries-saved')
      }
      if (data.searchBlockRules) {
        await setSearchBlockRules(mergeImportedRules(await getSearchBlockRules(), data.searchBlockRules))
        notify('gcn:search-rules-saved')
      }
      if (data.enterpriseSites) {
        const granted = await grantedHosts().catch((): readonly string[] => [])
        const pending = await pendingSitesItem.getValue()
        const added = data.enterpriseSites.filter(host => !granted.includes(host) && !pending.includes(host))
        if (added.length > 0) await pendingSitesItem.setValue([...pending, ...added])
      }
      if (data.githubToken) await githubTokenItem.setValue(data.githubToken)
      return true
    } catch {
      return false
    }
  }

  async function importScope(file: Blob, scope: BackupScope): Promise<boolean> {
    let text: string
    try {
      text = await file.text()
    } catch {
      toast.show('danger', 'readFailed')
      return false
    }
    const parsed = parseBackup(text)
    const data = parsed && scopeBackup(parsed, scope)
    if (!data || isEmptyBackup(data)) {
      toast.show('danger', 'invalidFormat')
      return false
    }
    if (!(await apply(data))) {
      toast.show('danger', 'saveFailed')
      return false
    }
    toast.show('success', 'restored')
    return true
  }

  return { exportScope, importScope }
}
