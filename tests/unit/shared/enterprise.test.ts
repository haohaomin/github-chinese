import { fakeBrowser } from 'wxt/testing/fake-browser'
import {
  enterpriseHosts,
  enterpriseMatches,
  enterpriseOrigins,
  enterpriseSiteOf,
  grantedOrigins,
  hasGitHubMarkers,
  isEnterpriseUrl,
  normalizeEnterpriseHost
} from '../../../src/shared/enterprise'
import { GITHUB_ORIGINS } from '../../../src/shared/github'
import { fakePermissions } from './fake-permissions'

afterEach(() => {
  vi.restoreAllMocks()
  document.head.innerHTML = ''
})

describe('normalizeEnterpriseHost', () => {
  it.each([
    ['github.example.com', 'github.example.com'],
    ['  GitHub.Example.com  ', 'github.example.com'],
    ['https://github.example.com/octocat/hello-world?tab=readme#top', 'github.example.com'],
    ['http://github.example.com:8080/', 'github.example.com'],
    ['github.example.com/octocat', 'github.example.com'],
    ['github.example.com.', 'github.example.com'],
    ['octo-corp.ghe.com', 'octo-corp.ghe.com'],
    ['10.0.0.5', '10.0.0.5'],
    ['github', 'github'],
    ['git_hub.example.com', 'git_hub.example.com'],
    ['例子.测试', 'xn--fsqu00a.xn--0zwm56d']
  ])('%j → %s', (input, expected) => {
    expect(normalizeEnterpriseHost(input)).toBe(expected)
  })

  it.each([
    '',
    '   ',
    'github example',
    '*.ghe.com',
    'ftp://github.example.com/',
    'file:///C:/github',
    '[::1]',
    // GitHub 自己的站点已默认启用
    'github.com',
    'https://gist.github.com/',
    'docs.github.com',
    'raw.githubusercontent.com',
    'www.githubstatus.com',
    // 付款表单的托管页（见 shared/payment-form）
    'www.zuora.com',
    'https://www.zuora.com/apps/PublicHostedPageLite.do'
  ])('%j → 不接受', input => {
    expect(normalizeEnterpriseHost(input)).toBeUndefined()
  })
})

describe('enterpriseSiteOf', () => {
  it('代码片段子域名以主站为准', () => {
    expect(enterpriseSiteOf('gist.github.example.com')).toBe('github.example.com')
    expect(enterpriseSiteOf('GitHub.Example.com')).toBe('github.example.com')
    expect(enterpriseSiteOf('github.com')).toBeUndefined()
    expect(enterpriseSiteOf('gist.github.com')).toBeUndefined()
  })
})

describe('enterpriseOrigins', () => {
  it('主站与代码片段子域名，http、https 都含；IP 地址只有主站', () => {
    expect(enterpriseOrigins('github.example.com')).toEqual(['*://github.example.com/*', '*://gist.github.example.com/*'])
    expect(enterpriseOrigins('10.0.0.5')).toEqual(['*://10.0.0.5/*'])
  })
})

describe('已授权的企业版站点', () => {
  const ORIGINS = [
    ...GITHUB_ORIGINS,
    '*://github.example.com/*',
    '*://gist.github.example.com/*',
    'https://octo-corp.ghe.com/*',
    '*://*/*',
    '<all_urls>',
    '*://*.example.com/*',
    'https://docs.github.com/*',
    'https://www.zuora.com/*',
    '*://github.example.com/*'
  ]

  it('enterpriseMatches：具体主机，不含 GitHub 自己的站点、付款表单的托管页与通配主机；去重，顺序不变', () => {
    expect(enterpriseMatches(ORIGINS)).toEqual(['*://github.example.com/*', '*://gist.github.example.com/*', 'https://octo-corp.ghe.com/*'])
  })

  it('enterpriseHosts：主机名，代码片段子域名并入主站；只有代码片段子域名时单列', () => {
    expect(enterpriseHosts(ORIGINS)).toEqual(['github.example.com', 'octo-corp.ghe.com'])
    expect(enterpriseHosts(['*://gist.github.example.com/*'])).toEqual(['gist.github.example.com'])
    expect(enterpriseHosts(GITHUB_ORIGINS)).toEqual([])
  })

  it.each([
    ['https://github.example.com/octocat', true],
    ['http://github.example.com/', true],
    ['https://GITHUB.example.com/', true],
    ['https://gist.github.example.com/octocat/1', true],
    ['https://octo-corp.ghe.com/', true],
    // 授权的是 https
    ['http://octo-corp.ghe.com/', false],
    ['https://raw.github.example.com/', false],
    ['https://example.com/', false],
    ['https://github.example.com.evil.test/', false],
    // GitHub 自己的站点不算企业版站点
    ['https://github.com/', false]
  ])('isEnterpriseUrl：%s → %s', (url, expected) => {
    expect(isEnterpriseUrl(new URL(url), ORIGINS)).toBe(expected)
  })
})

describe('grantedOrigins', () => {
  it('读取已授予的主机权限（含清单里的 GitHub 站点）', async () => {
    fakePermissions.granted.push('*://github.example.com/*')
    expect(await grantedOrigins()).toEqual([...GITHUB_ORIGINS, '*://github.example.com/*'])
  })

  it('读取失败、没有 origins 时为空', async () => {
    vi.spyOn(fakeBrowser.permissions, 'getAll').mockRejectedValueOnce(new Error('不支持'))
    expect(await grantedOrigins()).toEqual([])
    vi.spyOn(fakeBrowser.permissions, 'getAll').mockResolvedValueOnce({ permissions: [] } as never)
    expect(await grantedOrigins()).toEqual([])
  })
})

describe('hasGitHubMarkers', () => {
  it.each([
    [
      'hostname 与 fluid-icon',
      '<meta name="hostname" content="github.example.com"><link rel="fluid-icon" href="/fluidicon.png" title="GitHub">'
    ],
    ['hostname 与 html-safe-nonce', '<meta name="hostname" content="github.example.com"><meta name="html-safe-nonce" content="0">']
  ])('%s → 是 GitHub 页面', (_name, head) => {
    document.head.innerHTML = head
    expect(hasGitHubMarkers()).toBe(true)
  })

  it.each([
    ['没有标记', '<title>Example</title>'],
    ['只有 hostname', '<meta name="hostname" content="example.com">'],
    ['只有 fluid-icon', '<link rel="fluid-icon" href="/fluidicon.png" title="GitHub">'],
    ['fluid-icon 不是 GitHub 的', '<meta name="hostname" content="example.com"><link rel="fluid-icon" href="/icon.png" title="Example">']
  ])('%s → 不是', (_name, head) => {
    document.head.innerHTML = head
    expect(hasGitHubMarkers()).toBe(false)
  })
})
