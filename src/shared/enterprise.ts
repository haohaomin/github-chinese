/**
 * 企业版站点（GitHub Enterprise Server 的自有域名、GHE.com 的子域名）：页面与 github.com 相同，只是域名不同。
 * 以已授予的可选主机权限为准：授权即启用，撤销即停用（内容脚本的动态注册见 enterprise-scripts.ts）。
 * 每个站点授权主站与代码片段子域名两项：GHES 开启子域名隔离时代码片段在 gist.<主机名>。
 * 付款表单的托管页（www.zuora.com，见 payment-form.ts）的主机权限在清单里，不算企业版站点
 */
import { browser } from 'wxt/browser'
import { isGitHubSite } from './github'
import { PAYMENT_FORM_HOST } from './payment-form'

/** 不能作为企业版站点：GitHub 自己的站点（已默认启用）、付款表单的托管页 */
function isReservedHost(host: string): boolean {
  return isGitHubSite(host) || host === PAYMENT_FORM_HOST
}

/** 带协议的输入（复制自地址栏） */
const SCHEME_RE = /^[a-z][a-z\d+.-]*:\/\//i
/** 主机名：字母、数字、连字符、下划线，以点分隔（URL 解析后已转小写，国际化域名已转为 punycode） */
const HOST_RE = /^[a-z\d_-]+(?:\.[a-z\d_-]+)*$/
/** IPv4 地址：没有子域名 */
const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/
/** 主机权限的匹配模式：协议与主机 */
const PATTERN_RE = /^(\*|https?):\/\/([^/]+)\//
/** 代码片段子域名的前缀 */
const GIST_PREFIX = 'gist.'

/**
 * 规范化输入的企业版站点：主机名，或带协议、路径的地址。返回小写的主机名，不含端口与末尾的点；
 * 格式错误、GitHub 自己的站点（已默认启用）、付款表单的托管页返回 undefined
 */
export function normalizeEnterpriseHost(value: string): string | undefined {
  const text = value.trim()
  if (!text) return undefined
  let url: URL
  try {
    url = new URL(SCHEME_RE.test(text) ? text : `https://${text}`)
  } catch {
    return undefined
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
  const host = url.hostname.replace(/\.$/, '')
  return HOST_RE.test(host) && !isReservedHost(host) ? host : undefined
}

/** 页面所在的站点：代码片段子域名上的页面以主站为准（如 gist.github.example.com → github.example.com） */
export function enterpriseSiteOf(hostname: string): string | undefined {
  return normalizeEnterpriseHost(hostname.toLowerCase().replace(/^gist\./, ''))
}

/** 站点要申请的主机权限：主站与代码片段子域名（IP 地址只有主站），http、https 都含 */
export function enterpriseOrigins(host: string): string[] {
  return IPV4_RE.test(host) ? [`*://${host}/*`] : [`*://${host}/*`, `*://${GIST_PREFIX}${host}/*`]
}

/** 匹配模式的协议与主机（小写）；通配主机（*、*.example.com）、<all_urls> 等返回 undefined */
function parsePattern(pattern: string): { readonly scheme: string; readonly host: string } | undefined {
  const match = PATTERN_RE.exec(pattern)
  const host = match?.[2]?.toLowerCase()
  return match && host && !host.includes('*') ? { scheme: match[1]!, host } : undefined
}

/** 已授予的主机权限中企业版站点的匹配模式：具体主机，不含 GitHub 自己的站点与付款表单的托管页；去重，顺序不变 */
export function enterpriseMatches(origins: readonly string[]): string[] {
  return [
    ...new Set(
      origins.filter(origin => {
        const pattern = parsePattern(origin)
        return pattern !== undefined && !isReservedHost(pattern.host)
      })
    )
  ]
}

/** 已授权的企业版站点（主机名，按授权顺序）：代码片段子域名并入主站 */
export function enterpriseHosts(origins: readonly string[]): string[] {
  const hosts = new Set(enterpriseMatches(origins).map(origin => parsePattern(origin)!.host))
  return [...hosts].filter(host => !(host.startsWith(GIST_PREFIX) && hosts.has(host.slice(GIST_PREFIX.length))))
}

/** 地址是否在已授权的企业版站点上：协议、主机与某项匹配模式相符 */
export function isEnterpriseUrl(url: URL, origins: readonly string[]): boolean {
  const host = url.hostname.toLowerCase()
  return enterpriseMatches(origins).some(origin => {
    const pattern = parsePattern(origin)!
    return pattern.host === host && (pattern.scheme === '*' || `${pattern.scheme}:` === url.protocol)
  })
}

/** 已授予的主机权限（含清单里的 GitHub 站点）；读取失败时为空 */
export async function grantedOrigins(): Promise<string[]> {
  try {
    return (await browser.permissions.getAll()).origins ?? []
  } catch {
    return []
  }
}

/**
 * 页面是否是 GitHub 页面（尚未启用的企业版站点）：GitHub 页面头部的 hostname 标记，加上 fluid-icon 图标或 html-safe-nonce 标记。
 * 由 scripting.executeScript 在页面中执行：只用页面的全局对象，不引用模块内的变量
 */
export function hasGitHubMarkers(): boolean {
  return (
    document.querySelector('meta[name="hostname"]') !== null &&
    document.querySelector('link[rel="fluid-icon"][title="GitHub"], meta[name="html-safe-nonce"]') !== null
  )
}
