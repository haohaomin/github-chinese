/** 扩展生效的站点（含 GitHub 状态页），与 wxt.config.ts 的 host_permissions 保持一致 */
export const GITHUB_ORIGINS: readonly string[] = [
  'https://github.com/*',
  'https://gist.github.com/*',
  'https://www.githubstatus.com/*',
  'https://help.github.com/*',
  'https://support.github.com/*'
]

const GITHUB_HOSTS: ReadonlySet<string> = new Set([
  'github.com',
  'gist.github.com',
  'www.githubstatus.com',
  'help.github.com',
  'support.github.com'
])

/** GitHub 自己的站点：github.com、githubusercontent.com、githubassets.com、githubstatus.com 及其子域名 */
const GITHUB_SITES = ['github.com', 'githubusercontent.com', 'githubassets.com', 'githubstatus.com']

export function isGitHubSite(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return GITHUB_SITES.some(site => host === site || host.endsWith(`.${site}`))
}

/** 解析网页地址（http、https）；其他协议、无效地址返回 undefined */
export function parseWebUrl(url: string | undefined): URL | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed : undefined
  } catch {
    return undefined
  }
}

/** 解析扩展生效站点的页面地址；不是 github.com / gist.github.com / www.githubstatus.com / 支持站点时返回 undefined */
export function parseGitHubUrl(url: string | undefined): URL | undefined {
  const parsed = parseWebUrl(url)
  return parsed?.protocol === 'https:' && GITHUB_HOSTS.has(parsed.hostname) ? parsed : undefined
}
