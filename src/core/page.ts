import type { PageKey } from './types'

/** github.com 顶级路径中不是用户名 / 组织名的保留段 */
const RESERVED_TOP = new Set([
  'about',
  'account',
  'account_verifications',
  'advisories',
  'apps',
  'codespaces',
  'collections',
  'contact',
  'copilot',
  'customer-stories',
  'dashboard',
  'dashboard-feed',
  'developer',
  'discussions',
  // education 账号的仓库页不可访问（404），二级段都是站点页
  'education',
  'enterprise',
  'enterprises',
  'events',
  'explore',
  'features',
  'feed',
  'git-guides',
  'github-copilot',
  'home',
  'import',
  'installations',
  'issues',
  'join',
  'login',
  'logout',
  'marketplace',
  'mcp',
  'mobile',
  'models',
  'move_work',
  'new',
  'notifications',
  'open-source',
  'organizations',
  'orgs',
  'partners',
  'password_reset',
  'premium-support',
  'pricing',
  'projects',
  'pulls',
  'readme',
  'redeem',
  'repos',
  'resources',
  'search',
  'security',
  'session',
  'sessions',
  'settings',
  'showcases',
  'signup',
  'site',
  'sitemap',
  'solutions',
  'spark',
  'sponsoring',
  'sponsors',
  'stars',
  'team',
  'topics',
  'trending',
  'trust-center',
  'users',
  'watching',
  'why-github'
])

/** 仓库二级路径段 → 页面类型 */
const REPO_SECTION: Readonly<Record<string, readonly PageKey[]>> = {
  '': ['code'],
  tree: ['code'],
  blob: ['code'],
  blame: ['code'],
  edit: ['code'],
  new: ['code'],
  upload: ['code'],
  delete: ['code'],
  find: ['code'],
  search: ['search'],
  commits: ['commits'],
  commit: ['commits'],
  branches: ['commits'],
  activity: ['commits'],
  compare: ['commits', 'pulls'],
  issues: ['issues'],
  labels: ['issues'],
  milestones: ['issues'],
  milestone: ['issues'],
  pull: ['pulls'],
  pulls: ['pulls'],
  // 堆栈列表与堆栈详情：/{owner}/{repo}/stacks、/{owner}/{repo}/stack/{编号}（拉取请求仪表板内的页面）
  stacks: ['pulls'],
  stack: ['pulls'],
  actions: ['actions'],
  deployments: ['actions'],
  environments: ['actions'],
  // 检查运行页（仓库导航选中 Actions）、制品证明
  runs: ['actions'],
  attestations: ['actions'],
  projects: ['projects'],
  releases: ['releases'],
  tags: ['releases'],
  pkgs: ['packages'],
  packages: ['packages'],
  wiki: ['wiki'],
  discussions: ['discussions'],
  security: ['security'],
  pulse: ['insights'],
  graphs: ['insights'],
  network: ['insights'],
  forks: ['insights'],
  community: ['insights'],
  stargazers: ['insights'],
  watchers: ['insights'],
  settings: ['repo-settings'],
  rules: ['repo-settings'],
  fork: ['new'],
  generate: ['new'],
  import: ['new'],
  invitations: ['new'],
  transfer: ['new'],
  codespaces: ['codespaces'],
  copilot: ['copilot'],
  agents: ['copilot'],
  // Copilot 智能体会话页：/{owner}/{repo}/tasks/{id}
  tasks: ['copilot']
}

/** 顶级保留路径 → 页面类型 */
const TOP_SECTION: Readonly<Record<string, readonly PageKey[]>> = {
  '': ['dashboard'],
  dashboard: ['dashboard'],
  'dashboard-feed': ['dashboard'],
  feed: ['dashboard'],
  explore: ['explore'],
  trending: ['explore'],
  topics: ['explore'],
  collections: ['explore'],
  events: ['explore'],
  showcases: ['explore'],
  notifications: ['notifications'],
  watching: ['notifications'],
  settings: ['settings'],
  search: ['search'],
  new: ['new'],
  import: ['new'],
  move_work: ['new'],
  login: ['auth'],
  logout: ['auth'],
  signup: ['auth'],
  join: ['auth'],
  session: ['auth'],
  sessions: ['auth'],
  password_reset: ['auth'],
  account_verifications: ['auth'],
  codespaces: ['codespaces'],
  copilot: ['copilot'],
  'github-copilot': ['copilot'],
  marketplace: ['marketplace'],
  apps: ['marketplace'],
  sponsors: ['sponsors'],
  sponsoring: ['sponsors'],
  projects: ['projects'],
  issues: ['issues'],
  pulls: ['pulls'],
  discussions: ['discussions'],
  advisories: ['security'],
  stars: ['profile'],
  // 个人仓库列表：与组织仓库页同一 React 列表组件
  repos: ['organization'],
  // GitHub Education 介绍页（学生、教师、学校、合作伙伴）
  education: ['education'],
  // MCP 服务器目录与服务器详情页
  mcp: ['mcp'],
  // 帐户页（创建组织除外）：升级计划、选择计划与个人设置的计划页同一组件，付款历史等计费页同 /settings/billing
  account: ['settings']
}

/** 顶级保留路径的前两段 → 页面类型（优先于 TOP_SECTION） */
const TOP_SUBSECTION: Readonly<Record<string, readonly PageKey[]>> = {
  'account/organizations': ['new'],
  // /events 跳转到这里
  'resources/events': ['explore'],
  // /sponsors 跳转到这里
  'open-source/sponsors': ['sponsors'],
  // 定价页（不含 /pricing/calculator 等子页）：计划卡片与比较表同新建组织的选择计划页
  'pricing/': ['new']
}

/** orgs / users 下的三级路径段 → 页面类型 */
const OWNER_SECTION: Readonly<Record<string, readonly PageKey[]>> = {
  projects: ['projects'],
  packages: ['packages'],
  discussions: ['discussions'],
  settings: ['org-settings'],
  dashboard: ['dashboard'],
  invitation: ['new'],
  succession: ['new'],
  // 更改用户名的完成页：/users/<用户>/rename，与帐户设置（/settings/admin）同词典
  rename: ['settings'],
  // 组织安全概览：/orgs/<org>/security/overview、coverage、alerts/…、campaigns/…
  security: ['security']
}

/** /enterprises/<企业>/ 下的三级路径段 → 页面类型 */
const ENTERPRISE_SECTION: Readonly<Record<string, readonly PageKey[]>> = {
  // 企业安全概览：/enterprises/<企业>/security/coverage 等
  security: ['security']
}

/** 个人主页 ?tab= 的取值 → 追加的页面类型 */
const PROFILE_TAB: Readonly<Record<string, readonly PageKey[]>> = {
  // 项目标签页（/users/<用户>/projects 跳转到这里）：与组织项目列表同一列表组件
  projects: ['projects']
}

/** 仓库子页：第三段/第五段 → 页面类型（优先于 REPO_SECTION，顺序即作用域顺序，靠后的优先） */
const REPO_SUBPAGE: Readonly<Record<string, readonly PageKey[]>> = {
  // 拉取请求的检查页：作业日志与运行详情由 actions 翻译；pulls 在后，同一原文以拉取请求页的译法为准
  'pull/checks': ['actions', 'pulls'],
  // 拉取请求下的 Copilot 智能体会话页
  'pull/agent-sessions': ['pulls', 'copilot']
}

/** /organizations/ 下不是组织名的二级段 */
const ORGANIZATIONS_PAGES = new Set(['new', 'plan', 'enterprise_plan'])

/** 社区标准页里新建这些文件时是文件编辑器（许可证、行为准则模板） */
const COMMUNITY_FILES = new Set(['license', 'code-of-conduct'])

/** URL 与 Location 都满足；search 可省略（只看路径的调用方） */
type UrlLike = Pick<URL, 'hostname' | 'pathname'> & Partial<Pick<URL, 'search'>>

function unique(keys: readonly PageKey[]): PageKey[] {
  return [...new Set(keys)]
}

/** 只取表自身的键：路径段可能是 constructor、__proto__ 等原型属性名 */
function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined
}

function detectOwnerScope(kind: string, parts: readonly string[]): readonly PageKey[] {
  const section = parts[2] ?? ''
  if (kind === 'organizations') {
    if (parts[1] === 'new' || parts[1] === 'plan') return ['new']
    // 企业版试用计划选择页（登录名不含下划线，不是组织）
    if (parts[1] === 'enterprise_plan') return []
    if (section === 'repositories' && parts[3] === 'new') return ['new']
    // 组织计划页与个人设置的计划页同一组件
    if (section === 'billing') return ['settings', 'org-settings']
    return section === 'settings' ? ['org-settings'] : ['organization']
  }
  const base: PageKey = kind === 'users' ? 'profile' : 'organization'
  return [base, ...(own(OWNER_SECTION, section) ?? [])]
}

/** 顶级路径段是否是站点页面（不是用户名 / 组织名） */
function isSitePath(first: string): boolean {
  return first === '' || RESERVED_TOP.has(first)
}

/** 路径各段：去掉空段，解码并转小写 */
export function pathSegments(pathname: string): string[] {
  return pathname.split('/').filter(Boolean).map(decodeSegment)
}

/** 地址所属账号（用户、组织）的登录名，小写；站点页面返回 undefined */
export function accountLogin(pathname: string): string | undefined {
  const [first = '', second] = pathSegments(pathname)
  if (first === 'users' || first === 'orgs') return second
  if (first === 'organizations') return second && !ORGANIZATIONS_PAGES.has(second) ? second : undefined
  return isSitePath(first) ? undefined : first
}

/** 仓库页地址中的仓库名，小写；不是仓库页返回 undefined */
export function repositoryName(pathname: string): string | undefined {
  const [first = '', second] = pathSegments(pathname)
  return isSitePath(first) ? undefined : second
}

/** 页面所在的站点：github 为 github.com 与企业版主站，gist 为代码片段站点，status 为 GitHub 状态页，support 为 GitHub 支持站点 */
export type SiteKind = 'github' | 'gist' | 'status' | 'support'

export interface PageSite {
  readonly kind: SiteKind
  /** 站内路径：企业版主站 /gist 下的代码片段页去掉开头的 /gist */
  readonly pathname: string
}

const GITHUB_HOST = 'github.com'
const GIST_HOST = 'gist.github.com'
const STATUS_HOST = 'www.githubstatus.com'
/** 支持站点：support.github.com 跳转到 help.github.com */
const SUPPORT_HOSTS: ReadonlySet<string> = new Set(['help.github.com', 'support.github.com'])
/** 企业版主站上代码片段页的路径前缀（未开启子域名隔离时） */
const ENTERPRISE_GIST_PATH_RE = /^\/gist(?=\/|$)/i

/**
 * 页面所在的站点。内容脚本只在 GitHub 与已启用的企业版站点上运行：GitHub 自己的主机以外的都是企业版站点。
 * 企业版（GHES）的代码片段：开启子域名隔离时在 gist.<主机名>，否则在主站的 /gist 下
 */
export function pageSite(url: Pick<URL, 'hostname' | 'pathname'>): PageSite {
  const host = url.hostname.toLowerCase()
  const { pathname } = url
  if (host === STATUS_HOST) return { kind: 'status', pathname }
  if (SUPPORT_HOSTS.has(host)) return { kind: 'support', pathname }
  if (host === GITHUB_HOST) return { kind: 'github', pathname }
  if (host === GIST_HOST || host.startsWith('gist.')) return { kind: 'gist', pathname }
  if (ENTERPRISE_GIST_PATH_RE.test(pathname)) return { kind: 'gist', pathname: pathname.replace(ENTERPRISE_GIST_PATH_RE, '') || '/' }
  return { kind: 'github', pathname }
}

/**
 * 根据 URL 推断页面类型。
 * 返回值总以 'common' 开头，越靠后越具体。
 */
export function detectPages(url: UrlLike): PageKey[] {
  const site = pageSite(url).kind
  if (site === 'gist') return ['common', 'gist']
  if (site === 'status') return ['common', 'status']
  if (site === 'support') return ['common', 'support']

  const parts = pathSegments(url.pathname)
  const [first = '', second, third = ''] = parts

  if (first === 'orgs' || first === 'organizations' || first === 'users') {
    return unique(['common', ...detectOwnerScope(first, parts)])
  }
  if (first === 'enterprises') return unique(['common', ...(own(ENTERPRISE_SECTION, third) ?? [])])
  if (isSitePath(first)) {
    return unique(['common', ...(own(TOP_SUBSECTION, `${first}/${second ?? ''}`) ?? own(TOP_SECTION, first) ?? [])])
  }
  if (second === undefined) {
    const tab = new URLSearchParams(url.search ?? '').get('tab') ?? ''
    return unique(['common', 'profile', 'organization', ...(own(PROFILE_TAB, tab) ?? [])])
  }

  const subpage = own(REPO_SUBPAGE, `${third}/${parts[4] ?? ''}`)
  const keys: PageKey[] = ['common', 'repository', ...(subpage ?? own(REPO_SECTION, third) ?? [])]
  if (third === 'community' && COMMUNITY_FILES.has(parts[3] ?? '')) keys.push('code')
  return unique(keys)
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment).toLowerCase()
  } catch {
    return segment.toLowerCase()
  }
}
