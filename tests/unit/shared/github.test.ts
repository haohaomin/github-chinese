import { GITHUB_ORIGINS, isGitHubSite, parseGitHubUrl, parseWebUrl } from '../../../src/shared/github'

describe('parseGitHubUrl', () => {
  it.each([
    'https://github.com/',
    'https://github.com/vuejs/core/issues?q=is%3Aopen#top',
    'https://gist.github.com/octocat/123',
    'https://www.githubstatus.com/incidents/abc123',
    'https://help.github.com/contact/report-abuse',
    'https://support.github.com/'
  ])('%s 是 GitHub 页面', url => {
    expect(parseGitHubUrl(url)?.href).toBe(new URL(url).href)
  })

  it.each([
    undefined,
    '',
    'not a url',
    'http://github.com/vuejs/core',
    'https://docs.github.com/zh',
    'https://githubstatus.com/',
    'https://eu.githubstatus.com/',
    'https://github.com.evil.example/',
    'https://example.com/github.com',
    'chrome://extensions/'
  ])('%s 不是 GitHub 页面', url => {
    expect(parseGitHubUrl(url)).toBeUndefined()
  })

  it('站点列表与 host_permissions（wxt.config.ts）一致', async () => {
    expect(GITHUB_ORIGINS).toEqual([
      'https://github.com/*',
      'https://gist.github.com/*',
      'https://www.githubstatus.com/*',
      'https://help.github.com/*',
      'https://support.github.com/*'
    ])
    const config = await import('../../../wxt.config')
    expect(config.GITHUB_ORIGINS).toEqual(GITHUB_ORIGINS)
  })
})

describe('parseWebUrl', () => {
  it.each(['https://github.example.com/octocat', 'http://10.0.0.5/', 'https://octo-corp.ghe.com/'])('%s 是网页', url => {
    expect(parseWebUrl(url)?.href).toBe(new URL(url).href)
  })

  it.each([undefined, '', 'not a url', 'chrome://extensions/', 'about:blank', 'file:///C:/a.html', 'ftp://example.com/'])(
    '%s 不是网页',
    url => {
      expect(parseWebUrl(url)).toBeUndefined()
    }
  )
})

describe('isGitHubSite', () => {
  it.each(['github.com', 'gist.github.com', 'docs.github.com', 'raw.githubusercontent.com', 'GitHub.com', 'www.githubstatus.com'])(
    '%s → GitHub 的站点',
    host => {
      expect(isGitHubSite(host)).toBe(true)
    }
  )

  it.each(['example.com', 'octocat.github.io', 'notgithub.com', 'github.com.example.com', 'vuejs.org', 'octo-corp.ghe.com'])(
    '%s → 不是',
    host => {
      expect(isGitHubSite(host)).toBe(false)
    }
  )
})
