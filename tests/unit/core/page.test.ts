import { describe, expect, it } from 'vitest'
import { accountLogin, detectPages, pageSite, repositoryName } from '../../../src/core/page'

function pages(url: string): string[] {
  return detectPages(new URL(url))
}

describe('detectPages', () => {
  it.each([
    ['https://github.com/', ['common', 'dashboard']],
    ['https://github.com/dashboard', ['common', 'dashboard']],
    ['https://github.com/notifications?query=reason%3Amention', ['common', 'notifications']],
    ['https://github.com/settings/profile', ['common', 'settings']],
    ['https://github.com/search?q=vue', ['common', 'search']],
    ['https://github.com/login', ['common', 'auth']],
    ['https://github.com/topics/javascript', ['common', 'explore']],
    ['https://github.com/marketplace/actions/checkout', ['common', 'marketplace']],
    ['https://github.com/apps/dependabot', ['common', 'marketplace']],
    ['https://github.com/stars/octocat', ['common', 'profile']],
    ['https://github.com/pricing', ['common', 'new']],
    ['https://github.com/octocat', ['common', 'profile', 'organization']],
    ['https://github.com/vuejs/core', ['common', 'repository', 'code']],
    ['https://github.com/vuejs/core/tree/main/packages', ['common', 'repository', 'code']],
    ['https://github.com/vuejs/core/issues/123', ['common', 'repository', 'issues']],
    ['https://github.com/vuejs/core/pull/1/files', ['common', 'repository', 'pulls']],
    ['https://github.com/vuejs/core/compare/a...b', ['common', 'repository', 'commits', 'pulls']],
    ['https://github.com/vuejs/core/Issues', ['common', 'repository', 'issues']],
    ['https://github.com/vuejs/core/unknown-tab', ['common', 'repository']],
    ['https://github.com/vuejs/core/settings/rules', ['common', 'repository', 'repo-settings']],
    ['https://github.com/orgs/vuejs/people', ['common', 'organization']],
    ['https://github.com/orgs/vuejs/projects', ['common', 'organization', 'projects']],
    ['https://github.com/orgs/vuejs/settings', ['common', 'organization', 'org-settings']],
    ['https://github.com/users/octocat/projects/1', ['common', 'profile', 'projects']],
    ['https://github.com/organizations/vuejs/settings/profile', ['common', 'org-settings']],
    ['https://github.com/organizations/vuejs', ['common', 'organization']],
    ['https://github.com/organizations/new', ['common', 'new']],
    ['https://github.com/organizations/plan', ['common', 'new']],
    ['https://github.com/vuejs/core/generate', ['common', 'repository', 'new']],
    ['https://github.com/vuejs/core/import', ['common', 'repository', 'new']],
    ['https://github.com/vuejs/core/invitations', ['common', 'repository', 'new']],
    ['https://github.com/vuejs/core/transfer', ['common', 'repository', 'new']],
    ['https://github.com/orgs/vuejs/invitation', ['common', 'organization', 'new']],
    ['https://github.com/users/octocat/succession/invitation', ['common', 'profile', 'new']],
    ['https://github.com/users/octocat/rename', ['common', 'profile', 'settings']],
    ['https://github.com/organizations/vuejs/repositories/new', ['common', 'new']],
    ['https://github.com/organizations/vuejs/repositories', ['common', 'organization']],
    ['https://github.com/account/organizations/new', ['common', 'new']],
    // 帐户页都属个人设置（创建组织除外）：付款历史等计费页与 /settings/billing 同一组词典
    ['https://github.com/account/billing', ['common', 'settings']],
    ['https://github.com/account/billing/history', ['common', 'settings']],
    ['https://github.com/Account/Billing/History/', ['common', 'settings']],
    ['https://github.com/open-source/sponsors', ['common', 'sponsors']],
    ['https://github.com/open-source', ['common']],
    ['https://github.com/vuejs/core/agents', ['common', 'repository', 'copilot']],
    ['https://github.com/vuejs/core/pull/1/changes', ['common', 'repository', 'pulls']],
    ['https://github.com/pulls/inbox', ['common', 'pulls']],
    ['https://gist.github.com/octocat/1', ['common', 'gist']],
    // GitHub 状态页：各路径同一作用域
    ['https://www.githubstatus.com/', ['common', 'status']],
    ['https://www.githubstatus.com/history', ['common', 'status']],
    ['https://www.githubstatus.com/incidents/abc123', ['common', 'status']],
    // GitHub 支持站点：各路径同一作用域
    ['https://help.github.com/', ['common', 'support']],
    ['https://help.github.com/contact/report-abuse', ['common', 'support']],
    ['https://support.github.com/contact/report-abuse', ['common', 'support']],
    // GitHub 自有的顶级页面，不是用户主页或仓库
    ['https://github.com/mcp', ['common', 'mcp']],
    ['https://github.com/mcp/vuejs/server', ['common', 'mcp']],
    ['https://github.com/spark', ['common']],
    ['https://github.com/education', ['common', 'education']],
    ['https://github.com/education/', ['common', 'education']],
    ['https://github.com/education/students', ['common', 'education']],
    ['https://github.com/education/teachers', ['common', 'education']],
    ['https://github.com/education/schools', ['common', 'education']],
    ['https://github.com/education/partners', ['common', 'education']],
    ['https://github.com/education/benefits', ['common', 'education']],
    // education 账号的仓库页不可访问，同名路径都是站点页
    ['https://github.com/education/classroom', ['common', 'education']],
    ['https://github.com/education/classroom/pull/1', ['common', 'education']],
    ['https://github.com/mobile', ['common']],
    ['https://github.com/solutions/industry/healthcare', ['common']],
    ['https://github.com/why-github', ['common']],
    ['https://github.com/premium-support', ['common']],
    ['https://github.com/installations/new', ['common']],
    ['https://github.com/developer/register', ['common']],
    ['https://github.com/resources/articles', ['common']],
    ['https://github.com/resources/events', ['common', 'explore']],
    ['https://github.com/showcases', ['common', 'explore']],
    ['https://github.com/dashboard-feed', ['common', 'dashboard']],
    ['https://github.com/orgs/vuejs/dashboard', ['common', 'organization', 'dashboard']],
    ['https://github.com/github-copilot/pro/signup', ['common', 'copilot']],
    ['https://github.com/projects', ['common', 'projects']],
    ['https://github.com/sponsoring', ['common', 'sponsors']],
    ['https://github.com/import', ['common', 'new']],
    ['https://github.com/move_work/new', ['common', 'new']],
    ['https://github.com/account_verifications', ['common', 'auth']],
    ['https://github.com/account/upgrade', ['common', 'settings']],
    ['https://github.com/account/choose?action=upgrade', ['common', 'settings']],
    ['https://github.com/organizations/vuejs/billing/plans', ['common', 'settings', 'org-settings']],
    ['https://github.com/vuejs/core/community', ['common', 'repository', 'insights']],
    ['https://github.com/vuejs/core/community/license/new', ['common', 'repository', 'insights', 'code']],
    ['https://github.com/vuejs/core/community/code-of-conduct/new', ['common', 'repository', 'insights', 'code']],
    ['https://github.com/vuejs/settings-tools', ['common', 'repository', 'code']],
    // Copilot 智能体会话页在仓库下的地址
    ['https://github.com/vuejs/core/tasks/0a1b2c3d?session_id=4e5f', ['common', 'repository', 'copilot']],
    ['https://github.com/vuejs/core/tasks', ['common', 'repository', 'copilot']],
    ['https://github.com/vuejs/core/pull/16031/files', ['common', 'repository', 'pulls']],
    // 个人仓库列表与组织仓库页同一列表组件
    ['https://github.com/repos', ['common', 'organization']],
    ['https://github.com/repos?q=owner%3A%40me', ['common', 'organization']],
    // 企业版试用计划选择页不是组织
    ['https://github.com/organizations/enterprise_plan', ['common']],
    ['https://github.com/organizations/enterprise_plan?ref_cta=Start+a+free+trial', ['common']],
    // 检查运行页、制品证明归 Actions
    ['https://github.com/vuejs/core/runs/53077813215', ['common', 'repository', 'actions']],
    ['https://github.com/vuejs/core/attestations', ['common', 'repository', 'actions']],
    ['https://github.com/vuejs/core/attestations/1234567', ['common', 'repository', 'actions']],
    // 与原型属性同名的路径段不命中查表
    ['https://github.com/vuejs/core/constructor', ['common', 'repository']],
    ['https://github.com/vuejs/core/pull/1/constructor', ['common', 'repository', 'pulls']],
    ['https://github.com/vuejs/core/__proto__', ['common', 'repository']],
    ['https://github.com/orgs/vuejs/constructor', ['common', 'organization']],
    ['https://github.com/users/octocat/__proto__', ['common', 'profile']],
    ['https://github.com/organizations/vuejs/constructor', ['common', 'organization']],
    // 组织 / 企业安全概览
    ['https://github.com/orgs/vuejs/security', ['common', 'organization', 'security']],
    ['https://github.com/orgs/vuejs/security/overview', ['common', 'organization', 'security']],
    ['https://github.com/orgs/vuejs/security/alerts/secret-scanning', ['common', 'organization', 'security']],
    ['https://github.com/orgs/vuejs/security/campaigns/new', ['common', 'organization', 'security']],
    ['https://github.com/enterprises/acme/security', ['common', 'security']],
    ['https://github.com/enterprises/acme/security/coverage', ['common', 'security']],
    ['https://github.com/enterprises/acme', ['common']],
    ['https://github.com/enterprises/acme/settings/security_analysis', ['common']],
    ['https://github.com/enterprises/acme/constructor', ['common']],
    ['https://github.com/organizations/vuejs/settings/security_products', ['common', 'org-settings']],
    // 个人主页的项目标签页
    ['https://github.com/octocat?tab=projects', ['common', 'profile', 'organization', 'projects']],
    ['https://github.com/octocat?tab=projects&query=is%3Aopen', ['common', 'profile', 'organization', 'projects']],
    ['https://github.com/octocat?tab=repositories', ['common', 'profile', 'organization']],
    ['https://github.com/octocat?tab=constructor', ['common', 'profile', 'organization']],
    ['https://github.com/vuejs/core?tab=readme-ov-file', ['common', 'repository', 'code']],
    // 拉取请求的智能体会话页、检查页
    ['https://github.com/vuejs/core/pull/16031/agent-sessions', ['common', 'repository', 'pulls', 'copilot']],
    ['https://github.com/vuejs/core/pull/16031/agent-sessions/0a1b2c3d', ['common', 'repository', 'pulls', 'copilot']],
    ['https://github.com/vuejs/core/pull/16031/checks', ['common', 'repository', 'actions', 'pulls']],
    ['https://github.com/vuejs/core/pull/16031/checks?check_run_id=121444227923', ['common', 'repository', 'actions', 'pulls']],
    ['https://github.com/vuejs/core/issues/16031/checks', ['common', 'repository', 'issues']],
    // 堆栈列表与堆栈详情属拉取请求仪表板
    ['https://github.com/vuejs/core/stacks', ['common', 'repository', 'pulls']],
    ['https://github.com/vuejs/core/stacks?state=completed&sort=oldest&page=2', ['common', 'repository', 'pulls']],
    ['https://github.com/vuejs/core/stack/12', ['common', 'repository', 'pulls']],
    ['https://github.com/vuejs/core/Stack/12/', ['common', 'repository', 'pulls']],
    // 定价页与新建组织的选择计划页同一张表；子页不算
    ['https://github.com/pricing/', ['common', 'new']],
    ['https://github.com/pricing?ref_cta=x', ['common', 'new']],
    ['https://github.com/pricing/calculator', ['common']]
  ])('%s', (url, expected) => {
    expect(pages(url)).toEqual(expected)
  })

  it('没有 search 字段时按路径判断', () => {
    expect(detectPages({ hostname: 'github.com', pathname: '/octocat' })).toEqual(['common', 'profile', 'organization'])
  })

  it('非法转义的路径段按原样小写', () => {
    expect(detectPages({ hostname: 'github.com', pathname: '/%E0%A4%A/x/ISSUES' })).toEqual(['common', 'repository', 'issues'])
  })

  it.each([
    // 企业版站点（GHES 自有域名、GHE.com）：与 github.com 相同的路径
    ['https://github.example.com/', ['common', 'dashboard']],
    ['https://github.example.com/vuejs/core/pull/1/changes', ['common', 'repository', 'pulls']],
    ['https://octo-corp.ghe.com/settings/profile', ['common', 'settings']],
    ['http://10.0.0.5/octocat?tab=repositories', ['common', 'profile', 'organization']],
    // 代码片段：子域名隔离时在 gist 子域名，否则在主站的 /gist 下
    ['https://gist.github.example.com/octocat/1', ['common', 'gist']],
    ['https://github.example.com/gist/octocat/1', ['common', 'gist']],
    ['https://github.example.com/gist', ['common', 'gist']],
    // 不是 /gist 段
    ['https://github.example.com/gists/sample', ['common', 'repository', 'code']],
    // github.com 上的 /gist 是账号
    ['https://github.com/gist', ['common', 'profile', 'organization']]
  ])('企业版站点：%s', (url, expected) => {
    expect(pages(url)).toEqual(expected)
  })
})

describe('pageSite', () => {
  it.each([
    ['https://github.com/vuejs/core', 'github', '/vuejs/core'],
    ['https://gist.github.com/octocat', 'gist', '/octocat'],
    ['https://www.githubstatus.com/history', 'status', '/history'],
    ['https://help.github.com/contact/report-abuse', 'support', '/contact/report-abuse'],
    ['https://SUPPORT.github.com/', 'support', '/'],
    ['https://github.example.com/vuejs/core', 'github', '/vuejs/core'],
    ['https://GIST.github.example.com/octocat', 'gist', '/octocat'],
    ['https://github.example.com/gist/octocat/1', 'gist', '/octocat/1'],
    ['https://github.example.com/GIST/', 'gist', '/'],
    ['https://github.example.com/gist', 'gist', '/'],
    ['https://github.example.com/gists', 'github', '/gists'],
    ['https://github.com/gist/octocat', 'github', '/gist/octocat']
  ])('%s → %s，站内路径 %s', (url, kind, pathname) => {
    expect(pageSite(new URL(url))).toEqual({ kind, pathname })
  })
})

describe('accountLogin', () => {
  it.each([
    ['/octocat', 'octocat'],
    ['/OctoCat/Hello-World/issues', 'octocat'],
    ['/users/octocat/projects/1', 'octocat'],
    ['/orgs/github/people', 'github'],
    ['/education', undefined],
    ['/education/students', undefined],
    ['/education/teachers', undefined],
    ['/education/classroom', undefined],
    ['/settings/profile', undefined],
    ['/organizations/new', undefined],
    ['/organizations/plan', undefined],
    ['/organizations/enterprise_plan', undefined],
    ['/organizations/VueJS/settings/rules', 'vuejs'],
    ['/organizations', undefined],
    ['/', undefined],
    ['', undefined]
  ])('%s → %s', (pathname, expected) => {
    expect(accountLogin(pathname)).toBe(expected)
  })
})

describe('repositoryName', () => {
  it.each([
    ['/vuejs/core', 'core'],
    ['/VueJS/Core/settings/rules', 'core'],
    ['/octocat/%E6%96%87%E6%A1%A3/rules', '文档'],
    ['/octocat', undefined],
    ['/orgs/vuejs/settings/rules', undefined],
    ['/users/octocat/projects', undefined],
    ['/settings/profile', undefined],
    ['/topics/vue', undefined],
    ['/', undefined]
  ])('%s → %s', (pathname, expected) => {
    expect(repositoryName(pathname)).toBe(expected)
  })
})
