/**
 * 付款表单：GitHub 的信用卡表单是 Zuora 托管页（www.zuora.com），以跨源 iframe 嵌在 GitHub 页面里，
 * GitHub 页面上的内容脚本进不去。托管页的主机权限随 GitHub 的站点在安装时申请，用户可在浏览器里撤销
 * （Chrome 的网站访问权限、Firefox 的附加组件管理器），设置页的「汉化付款表单」开启时可重新申请。
 * 设置「汉化付款表单」（默认开启）且有权限时，后台为托管页注册付款表单脚本（所有框架，document_start），
 * 脚本只在嵌在 github.com 页面里的托管页翻译，只替换文字（见 entrypoints/payment-form.content.ts）
 */
import { browser } from 'wxt/browser'
import type { ScriptPublicPath } from 'wxt/utils/inject-script'
import { syncRegisteredScript } from './script-registration'

/** 托管页的主机与路径 */
export const PAYMENT_FORM_HOST = 'www.zuora.com'
export const PAYMENT_FORM_PATH = '/apps/PublicHostedPageLite.do'

/** 托管页的主机权限（同 wxt.config.ts 的 PAYMENT_FORM_ORIGINS，在清单的 host_permissions 里） */
export const PAYMENT_FORM_ORIGINS: readonly string[] = [`https://${PAYMENT_FORM_HOST}/*`]

/** 付款表单脚本的匹配模式：只匹配托管页（路径之后的查询串由 * 匹配） */
export const PAYMENT_FORM_MATCHES: readonly string[] = [`https://${PAYMENT_FORM_HOST}${PAYMENT_FORM_PATH}*`]

/** 嵌入托管页的 GitHub 页面的来源 */
export const PAYMENT_FORM_PARENT_ORIGIN = 'https://github.com'

/** 付款表单脚本的构建产物：路径类型由 WXT 按实际产物生成，改名时类型检查报错 */
export const PAYMENT_FORM_SCRIPT_FILE: ScriptPublicPath = '/content-scripts/payment-form.js'

/** 付款表单脚本的注册 ID */
export const PAYMENT_FORM_SCRIPT_ID = 'gcn-payment-form'

/** 有托管页的主机权限（安装时授予，未被用户撤销）；读取失败时按没有 */
export async function isPaymentFormGranted(): Promise<boolean> {
  try {
    return await browser.permissions.contains({ origins: [...PAYMENT_FORM_ORIGINS] })
  } catch {
    return false
  }
}

/** 生效（设置开启且有权限）时注册（所有框架：托管页是 GitHub 页面里的 iframe），否则注销 */
export async function syncPaymentFormScript(active: boolean): Promise<void> {
  await syncRegisteredScript(
    PAYMENT_FORM_SCRIPT_ID,
    active ? { js: [PAYMENT_FORM_SCRIPT_FILE], matches: PAYMENT_FORM_MATCHES, allFrames: true } : undefined
  )
}

/** 地址的来源；不是 http(s) 地址时为 undefined */
function originOf(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.origin : undefined
  } catch {
    return undefined
  }
}

/** 判断用到的框架信息 */
export interface FrameContext {
  readonly location: Pick<Location, 'href'> & { readonly ancestorOrigins?: { readonly length: number; readonly [index: number]: string } }
  /** 是否是顶层框架 */
  readonly top: boolean
  readonly referrer: string
}

/** 当前框架的信息 */
export function currentFrame(win: Window): FrameContext {
  return { location: win.location, top: win.top === win.self, referrer: win.document.referrer }
}

/**
 * 框架是嵌在 github.com 页面里的托管页：地址是托管页，且是子框架，父框架来自 github.com。
 * 父框架的来源：Chromium 读 location.ancestorOrigins；没有时取托管页地址的 host 参数（GitHub 传入嵌入页的地址），
 * 再没有时取来源页（GitHub 的来源页策略只带来源）。其他网站嵌入的 Zuora 托管页不翻译
 */
export function isPaymentFormFrame(frame: FrameContext): boolean {
  let url: URL
  try {
    url = new URL(frame.location.href)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' || url.hostname !== PAYMENT_FORM_HOST || url.pathname !== PAYMENT_FORM_PATH) return false
  if (frame.top) return false
  const ancestors = frame.location.ancestorOrigins
  const parent = ancestors && ancestors.length > 0 ? ancestors[0] : (originOf(url.searchParams.get('host')) ?? originOf(frame.referrer))
  return parent === PAYMENT_FORM_PARENT_ORIGIN
}
