/**
 * 付款表单：GitHub 的信用卡表单是 Zuora 托管页（www.zuora.com），以跨源 iframe 嵌在 GitHub 页面里，
 * GitHub 页面上的内容脚本进不去。以 www.zuora.com 的可选主机权限为准：授权即启用，撤销即停用
 * （设置页的「汉化付款表单」开关申请、移除；安装、更新时不申请）。
 * 授权后后台为托管页注册付款表单脚本（所有框架，document_start），脚本只在嵌在 github.com 页面里的托管页翻译
 * （见 entrypoints/payment-form.content.ts）
 */
import { browser } from 'wxt/browser'
import type { ScriptPublicPath } from 'wxt/utils/inject-script'
import { syncRegisteredScript } from './script-registration'

/** 托管页的主机与路径 */
export const PAYMENT_FORM_HOST = 'www.zuora.com'
export const PAYMENT_FORM_PATH = '/apps/PublicHostedPageLite.do'

/** 申请的主机权限 */
export const PAYMENT_FORM_ORIGINS: readonly string[] = [`https://${PAYMENT_FORM_HOST}/*`]

/** 付款表单脚本的匹配模式：只匹配托管页（路径之后的查询串由 * 匹配） */
export const PAYMENT_FORM_MATCHES: readonly string[] = [`https://${PAYMENT_FORM_HOST}${PAYMENT_FORM_PATH}*`]

/** 嵌入托管页的 GitHub 页面的来源 */
export const PAYMENT_FORM_PARENT_ORIGIN = 'https://github.com'

/** 付款表单脚本的构建产物：路径类型由 WXT 按实际产物生成，改名时类型检查报错 */
export const PAYMENT_FORM_SCRIPT_FILE: ScriptPublicPath = '/content-scripts/payment-form.js'

/** 付款表单脚本的注册 ID */
export const PAYMENT_FORM_SCRIPT_ID = 'gcn-payment-form'

/** 已授予托管页的主机权限（含覆盖它的通配授权）；读取失败时按未授权 */
export async function isPaymentFormGranted(): Promise<boolean> {
  try {
    return await browser.permissions.contains({ origins: [...PAYMENT_FORM_ORIGINS] })
  } catch {
    return false
  }
}

/** 已授权时注册（所有框架：托管页是 GitHub 页面里的 iframe），未授权时注销 */
export async function syncPaymentFormScript(granted: boolean): Promise<void> {
  await syncRegisteredScript(
    PAYMENT_FORM_SCRIPT_ID,
    granted ? { js: [PAYMENT_FORM_SCRIPT_FILE], matches: PAYMENT_FORM_MATCHES, allFrames: true } : undefined
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
