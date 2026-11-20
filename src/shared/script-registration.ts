/**
 * 动态内容脚本的注册（后台）：按要求注册、更新或注销一份脚本，与已注册的相同时不改动。
 * 注册、更新都显式写持久：Chromium 的更新不带该标志时把注册降为仅本次会话，重启浏览器后不恢复。
 * 安装、更新扩展时浏览器清空注册（Chromium、Firefox 都是），由后台的安装、更新事件与启动时的同步补回。
 * 没有 scripting API 时不处理
 */
import { browser } from 'wxt/browser'

/** 一份 document_start 的内容脚本 */
export interface ScriptRegistration {
  /** 扩展内路径；开头的 / 可有可无 */
  readonly js: readonly string[]
  readonly matches: readonly string[]
  /** 主世界；缺省为隔离环境 */
  readonly world?: 'MAIN'
  /** 注入所有框架（含跨源 iframe）；缺省只注入顶层框架 */
  readonly allFrames?: boolean
}

/** 注册时的脚本路径不带开头的 /；浏览器返回的路径可能带 */
export function scriptPath(path: string): string {
  return path.replace(/^\//, '')
}

function sameList(a: readonly string[] | undefined, b: readonly string[]): boolean {
  return a !== undefined && a.length === b.length && a.every((value, i) => value === b[i])
}

/** 同一组站点，不计顺序与重复：Chromium 按字符串排序返回 */
function sameSet(a: readonly string[] | undefined, b: readonly string[]): boolean {
  if (a === undefined) return false
  const have = new Set(a)
  const want = new Set(b)
  return have.size === want.size && [...want].every(value => have.has(value))
}

/** 注册报 ID 已存在 */
function isDuplicateId(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Duplicate script ID')
}

/** 注册、更新（script 有值）或注销（script 为 undefined）这个 ID 的内容脚本 */
export async function syncRegisteredScript(id: string, script: ScriptRegistration | undefined): Promise<void> {
  const scripting = browser.scripting
  if (typeof scripting?.registerContentScripts !== 'function') return
  const [current] = await scripting.getRegisteredContentScripts({ ids: [id] })
  if (!script) {
    if (current) await scripting.unregisterContentScripts({ ids: [id] })
    return
  }
  const js = script.js.map(scriptPath)
  if (
    current &&
    current.runAt === 'document_start' &&
    // 已降为仅本次会话的注册改回持久；不返回该字段的浏览器按持久
    current.persistAcrossSessions !== false &&
    (current.world ?? 'ISOLATED') === (script.world ?? 'ISOLATED') &&
    (current.allFrames ?? false) === (script.allFrames ?? false) &&
    sameList(current.js?.map(scriptPath), js) &&
    sameSet(current.matches, script.matches)
  ) {
    return
  }
  const registration = {
    id,
    matches: [...script.matches],
    js,
    runAt: 'document_start' as const,
    persistAcrossSessions: true,
    ...(script.world ? { world: script.world } : {}),
    // 开启时写入；由开改关时写 false（更新不带该字段时沿用原值）
    ...(script.allFrames || current?.allFrames ? { allFrames: script.allFrames ?? false } : {})
  }
  if (current) {
    await scripting.updateContentScripts([registration])
    return
  }
  try {
    await scripting.registerContentScripts([registration])
  } catch (error) {
    // 浏览器启动初期持久注册还在加载：查询不到，注册却报 ID 已存在。按已注册处理，之后的同步再核对
    if (!isDuplicateId(error)) throw error
  }
}
