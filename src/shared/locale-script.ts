/**
 * 词典脚本的注册（后台）：把当前语言的词典脚本注册为 document_start 内容脚本，与内容脚本同一组站点
 * （GitHub 自己的站点，及已授权的企业版站点）。
 * 页面开始解析前语言包已登记（见 locale-loader.ts），内容脚本不用等动态导入，打开页面即显示中文。
 * 自动语言按 pageLanguageEnvironment 识别，与内容脚本同一来源。
 * 不翻译（总开关或汉化关闭）时注销：这时内容脚本也不加载语言包（见 content.ts），页面不执行词典脚本。
 * 注册的持久与补回见 script-registration.ts；没有 scripting API 时不处理，内容脚本动态导入
 */
import { browser } from 'wxt/browser'
import { GITHUB_ORIGINS } from './github'
import { pageLanguageEnvironment } from './language-env'
import { resolvePageLocale } from './locale'
import { LOCALE_SCRIPT_FILES } from './locale-loader'
import { syncRegisteredScript } from './script-registration'
import { isTranslationOn, type Settings } from './settings'

/** 注册的词典内容脚本 ID */
export const LOCALE_SCRIPT_ID = 'gcn-locale'

/** 按设置注册、更新或注销词典脚本；enterpriseMatches 为已授权的企业版站点（见 enterprise.ts） */
export async function syncLocaleScript(settings: Settings, enterpriseMatches: readonly string[] = []): Promise<void> {
  if (typeof browser.scripting?.registerContentScripts !== 'function') return
  if (!isTranslationOn(settings)) return syncRegisteredScript(LOCALE_SCRIPT_ID, undefined)
  const locale = resolvePageLocale(settings.language, await pageLanguageEnvironment())
  await syncRegisteredScript(LOCALE_SCRIPT_ID, {
    js: [LOCALE_SCRIPT_FILES[locale]],
    matches: [...GITHUB_ORIGINS, ...enterpriseMatches]
  })
}
