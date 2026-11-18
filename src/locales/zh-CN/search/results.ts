import { lookupTable, mergeTables } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import common from '../common'
import commonUi from '../common-ui'
import { formatDate } from '../helpers'
import { CATEGORIES } from '../marketplace/browse'

/** 结果页 sr-only 标题中的类型参数（type=…）→ 页面名 */
const RESULT_HEADINGS: Readonly<Record<string, string>> = {
  code: '代码搜索结果',
  repositories: '存储库搜索结果',
  issues: '议题搜索结果',
  pullrequests: '拉取请求搜索结果',
  discussions: '讨论搜索结果',
  users: '用户搜索结果',
  commits: '提交搜索结果',
  registrypackages: '软件包搜索结果',
  wikis: 'Wiki 搜索结果',
  topics: '主题搜索结果',
  // 产品名译中文（用户定）：Marketplace → 市场
  marketplace: '市场搜索结果'
}

/** 排序菜单（各结果类型的并集），排序按钮复用 */
const SORT_OPTIONS: Readonly<Record<string, string>> = {
  'Best match': '最佳匹配',
  'Most stars': '星标最多',
  'Fewest stars': '星标最少',
  'Most forks': '复刻最多',
  'Fewest forks': '复刻最少',
  'Recently updated': '最近更新',
  'Least recently updated': '最久未更新',
  'Most commented': '评论最多',
  'Least commented': '评论最少',
  Newest: '最新',
  Oldest: '最早',
  'Highest score': '得分最高',
  'Lowest score': '得分最低',
  'Most downloads': '下载最多',
  'Fewest downloads': '下载最少',
  'Most followers': '关注者最多',
  'Fewest followers': '关注者最少',
  'Most recently joined': '最近加入',
  'Least recently joined': '最早加入',
  'Most repositories': '存储库最多',
  'Fewest repositories': '存储库最少',
  'Recently committed': '最近提交',
  'Least recently committed': '最早提交',
  'Recently authored': '最近编写',
  'Least recently authored': '最早编写'
}

const SORT_SOURCE = Object.keys(SORT_OPTIONS).join('|')

/** common 与 common-ui 的全站词条（同一原文 common 优先） */
const commonText = lookupTable(mergeTables([common.static, commonUi.static]))

/** 去掉译文与原文相同、或与 common 全站词条译文相同的词条，避免重复收录 */
function pageOnly(entries: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(entries).filter(([source, target]) => source !== target && commonText(source) !== target))
}

/** 提交结果的检查摘要：20 successful, 1 skipped, and 1 failing checks（状态词与句式同 commits 的检查摘要） */
const CHECK_STATES: Readonly<Record<string, string>> = {
  successful: '成功',
  failing: '失败',
  failed: '失败',
  skipped: '已跳过',
  pending: '挂起',
  queued: '已排队',
  'in progress': '正在进行',
  cancelled: '已取消',
  canceled: '已取消',
  neutral: '中性',
  expected: '等待报告',
  errored: '出错',
  'timed out': '已超时',
  'action required': '需要操作',
  stale: '已过时',
  'startup failure': '启动失败'
}

const CHECK_PART = `\\d+ (?:${Object.keys(CHECK_STATES).join('|')})`
const CHECK_SEPARATOR_RE = /,? and |, /

/**
 * 20 successful, 1 skipped, and 1 failing → 20 个检查成功、1 个已跳过、1 个失败；
 * 标点随原文：原文只有 and、没有逗号时不加标点，3 successful and 1 failing → 3 个检查成功和 1 个失败
 */
function checkSummary(list: string): string {
  const parts = list.split(CHECK_SEPARATOR_RE).map((part, index) => {
    const space = part.indexOf(' ')
    const state = part.slice(space + 1)
    return `${part.slice(0, space)} 个${index === 0 ? '检查' : ''}${CHECK_STATES[state] ?? state}`
  })
  return parts.join(list.includes(',') ? '、' : '和 ')
}

/** 软件包结果的类型图标说明：npm type */
const PACKAGE_TYPES: Readonly<Record<string, string>> = {
  container: '容器类型',
  docker: 'Docker 类型',
  npm: 'npm 类型',
  maven: 'Maven 类型',
  nuget: 'NuGet 类型',
  rubygems: 'RubyGems 类型',
  gradle: 'Gradle 类型'
}

/** 1.1M results / 1 result / 1.2k files（common-ui 的计数规则不含 B） */
function countLabel(count: string, kind: string): string {
  return `${count} 个${kind.startsWith('file') ? '文件' : '结果'}`
}

/** 提交签名对话框的 sr-only 标题：verified: 06838a0 */
const SIGNATURE_STATES: Readonly<Record<string, string>> = {
  verified: '已验证',
  unverified: '未验证',
  'partially verified': '部分验证'
}

/**
 * 存储库结果中的语言名：<li class="footerItem__…"><span class="languageCircleWrapper__…">色块</span>
 * <span aria-label="Vue language">Vue</span></li>。名称不译（ignore），aria-label 由 attributeRules 改写，
 * 两处共用的选择器不依赖 aria-label
 */
const LANGUAGE_NAME = '[data-testid="results-list"] li[class*="footerItem__"] > [class*="languageCircleWrapper__"] + span'

/**
 * 搜索首页与结果页（React）：侧栏筛选、结果头部与排序、各类结果条目、
 * 赞助对话框、右侧推广与提示、代码结果、未登录代码搜索提示。
 * 通用按钮与状态（Star、Verified、Updated、分页、N stars 等计数）由 common 收录；
 * 提交签名弹层（verified signature、GPG Key ID: 等）由 commits 的 static 全站收录。
 */
export default {
  static: {
    // 标签页标题
    'Repository search results': '存储库搜索结果',
    'Code search results': '代码搜索结果',
    'Issue search results': '议题搜索结果',
    'Pull request search results': '拉取请求搜索结果',
    'Discussion search results': '讨论搜索结果',
    'User search results': '用户搜索结果',
    'Commit search results': '提交搜索结果',
    'Package search results': '软件包搜索结果',
    'Wiki search results': 'Wiki 搜索结果',
    'Topic search results': '主题搜索结果',
    'Marketplace search results': '市场搜索结果',

    // 侧栏与结果头部
    'Advanced search': '高级搜索',
    'More languages...': '更多语言...',
    'More languages…': '更多语言…',
    'More repositories...': '更多存储库...',
    'More repositories…': '更多存储库…',
    'More directories...': '更多目录...',
    'More directories…': '更多目录…',
    Wikis: 'Wiki',
    'Open column options': '打开列选项',
    'View search docs': '查看搜索文档',
    'Sort options': '排序选项',
    'Save search': '保存搜索',
    'How can we improve search?': '如何改进搜索？',

    // 侧栏「高级」限定符
    'Has linked pull request': '有链接的拉取请求',
    'Mentioned user': '提及的用户',
    'Mentioned team': '提及的团队',
    // involves: 限定符（议题页为 Involved user，讨论页为 Involves user）
    'Involved user': '涉及的用户',
    'Involves user': '涉及的用户',
    'Number of comments': '评论数',
    'Number of interactions': '交互数',
    'Number of followers': '关注者数',
    'Number of forks': '复刻数',
    'Number of stars': '星标数',
    'Number of repositories': '存储库数',
    'Date pushed': '推送日期',
    'Creation date': '创建日期',
    'Last updated date': '最后更新日期',
    'CI status': 'CI 状态',
    'Review status': '审查状态',
    'Not merged': '未合并',
    'Full name': '全名',
    Sponsorable: '可赞助',
    'Curated topics': '人工整理的主题',
    'Featured topics': '精选主题',
    'Author email': '作者电子邮件',
    'Committer email': '提交者电子邮件',
    'Merge commits': '合并提交',
    'Parent hash': '父提交哈希',
    'Tree hash': '树哈希',
    'Exclude archived': '排除已存档',
    'Exclude forks': '排除复刻',

    // 结果条目（Open linked issues 是按钮名，加“已”，避免读成“打开链接”的议题）
    'Copy full commit hash': '复制完整提交哈希',
    'Open linked issues': '打开已链接的议题',
    'View topic': '查看主题',
    'Related:': '相关：',

    // 存储库结果的赞助对话框：「Learn more」（common-ui）+ sr-only「about Sponsors」（Sponsors 指 GitHub Sponsors → 赞助）
    'External links': '外部链接',
    'Learn more about funding links in repositories': '了解存储库中的赞助链接',
    'about Sponsors': '赞助相关信息',

    // 右侧推广与提示（结果页 ProTip 的快捷键在 span.hx_kbd 中，不是 <kbd>，引擎按片段翻译）
    'Sponsor open source projects you depend on': '赞助你所依赖的开源项目',
    'Contributors are working behind the scenes to make open source better for everyone—give them the help and recognition they deserve.':
      '贡献者在幕后努力让开源变得更好——给他们应得的帮助与认可。',
    'Explore sponsorable projects': '探索可赞助的项目',
    'Press the': '按',
    'key to activate the search input again and adjust your query.': '键可再次激活搜索框并调整查询。',
    'Restrict your search to the title by using the in:title qualifier.': '使用 in:title 限定符可只搜索标题。',
    // 产品名译中文（用户定）：GitHub Issues → GitHub 议题、GitHub Packages → GitHub 软件包
    'Learn how you can use GitHub Issues to plan and track your work.': '了解如何使用 GitHub 议题规划和跟踪工作。',
    'Save views for sprints, backlogs, teams, or releases. Rank, sort, and filter issues to suit the occasion. The possibilities are endless.':
      '为冲刺、待办列表、团队或发行版保存视图，按需对议题排名、排序和筛选，用法不胜枚举。',
    'Learn more about GitHub Issues': '了解 GitHub 议题',
    'Learn GitHub Packages': '了解 GitHub 软件包',
    // 原文用逗号带出 including 短语，译文同样用逗号，不改成括号
    'GitHub Packages is a platform for hosting and managing packages, including containers and other dependencies. Get started with publishing or installing packages yourself.':
      'GitHub 软件包是托管和管理软件包的平台，包括容器和其他依赖项。立即开始发布或安装软件包。',
    'Learn more about GitHub Packages': '了解 GitHub 软件包',

    // 代码结果（登录后）
    'Files with identical content are grouped together.': '内容相同的文件已归为一组。',
    'Hide these extra files instead': '改为隐藏这些重复文件',
    'This file contains': '此文件另有',
    'not shown.': '未显示。',
    // See all + 数字 + matches in the full file 拆开时
    'matches in the full file': '处完整文件中的匹配',
    'match in the full file': '处完整文件中的匹配',

    // 未登录代码搜索（原文没有逗号，改语序，不加逗号）
    'Sign in to search code on GitHub': '登录 GitHub 以搜索代码',
    'Before you can access our code search functionality please sign in or create a free account.':
      '请先登录或创建免费帐户再使用代码搜索。',
    'Before you can access our code search functionality please sign in or sign up.': '请先登录或注册再使用代码搜索。',

    // 头部搜索框输入无法识别的限定符时的提示
    'Possible unrecognized qualifier, searching for this term literally': '可能是无法识别的限定符，将按字面搜索该词'
  },
  scoped: {
    ...pageOnly(SORT_OPTIONS),
    Tip: '提示',

    // 搜索首页：Tip For an advanced search, use our prefixes（片段只在本页成立）
    'For an': '如需',
    'advanced search': '高级搜索',
    ', use our': '，可使用',
    prefixes: '前缀',

    // 侧栏与结果头部（侧栏的 Filter by type 由 copilot 的 static 全站收录；窄屏类型选择前的 Filter: 是名词标签，
    // 同 discussions、marketplace 作“筛选器：”）
    'Filter by': '筛选条件',
    'Filter:': '筛选器：',
    Advanced: '高级',
    State: '状态',
    States: '状态',
    Types: '类型',
    Container: '容器',
    Paths: '路径',
    Size: '大小',
    Topic: '主题',
    'Date created': '创建日期',
    'Close reason': '关闭原因',
    Assignee: '受理人',
    Label: '标签',
    Milestone: '里程碑',
    Commenter: '评论者',
    Committer: '提交者',
    Hash: '哈希',
    Symbol: '符号',
    Location: '所在地',

    // 结果条目：Opened + 时间、posted + 时间、Last updated + 时间（Updated、committed 由 common 收录）
    Opened: '打开于',
    posted: '发布于',
    'Last updated': '最后更新于',
    // 签名弹层（句末带句号的版本，其余由 commits 收录）
    'Learn about vigilant mode.': '了解警戒模式。',
    // 主题结果：angular, react, storybook and 1 more
    more: '个其他',
    match: '处匹配',
    matches: '处匹配',

    // Marketplace 结果：发布者（By + 链接）、类型标签（Application / GitHub Action）
    ...pageOnly(CATEGORIES),
    By: '来自',
    Application: '应用',
    // 产品名译中文（用户定）：单个 GitHub Action → GitHub 操作，同 marketplace 词典
    'GitHub Action': 'GitHub 操作',
    'Verified by GitHub': '已由 GitHub 验证'
  },
  regexp: [
    // 结果页 sr-only 标题：repositories Search Results · vue（查询词原样保留）
    [
      new RegExp(`^(${Object.keys(RESULT_HEADINGS).join('|')}) Search Results · (.+)$`),
      (_, type, query) => `${RESULT_HEADINGS[type] ?? type} · ${query}`
    ],
    // 登录后可见类型为空、没有前缀的版本：Search Results · vue is:public
    [/^Search Results · (.+)$/, '搜索结果 · $1'],
    // 结果数（含 1.2B 这类缩写）
    [/^(\d[\d.,]*[kKMB]?) (results?|files?)$/, (_, count, kind) => countLabel(count, kind)],
    [/^More than (\d[\d.,]*[kKMB]?) (results?|files?)$/, (_, count, kind) => `超过 ${countLabel(count, kind)}`],
    // 耗时：React 把「 (」「210」「 」「ms」「)」拆成相邻文本节点，拼接后为 (210 ms)；数字与单位之间加空格：（210 毫秒）
    [/^\((\d+(?:\.\d+)?) ?(ms|s)\)$/, (_, amount, unit) => `（${amount} ${unit === 'ms' ? '毫秒' : '秒'}）`],
    // 排序按钮：「Sort by: 」「Best match」拼接
    [new RegExp(`^Sort by: (${SORT_SOURCE})$`), (_, option) => `排序依据：${SORT_OPTIONS[option] ?? option}`],
    // 浏览器语言为中文时 React 按本地格式输出日期，只剩英文前缀：on 1月23日、on 2017年4月7日；
    // 数字与年月日之间有无空格都匹配，日期按 helpers 的格式重写，与全站日期一致
    [
      /^on (?:(\d{4}) ?年 ?)?(\d{1,2}) ?月 ?(\d{1,2}) ?日$/,
      (_, year: string, month: string, day: string) => formatDate(year ? Number(year) : undefined, Number(month), Number(day))
    ],

    // 存储库结果
    [/^(\d[\d,]*) issues? needs? help$/, '$1 个议题需要帮助'],
    [/^Sponsor (@[\w-]+|[\w.-]+\/[\w.-]+)$/, '赞助 $1'],
    // 提交结果
    [new RegExp(`^(${CHECK_PART}(?:(?:,? and |, )${CHECK_PART})*) checks?$`), (_, list) => checkSummary(list)],
    [/^Copy full commit hash ([\da-f]{7,40})$/, '复制完整提交哈希 $1'],
    [
      new RegExp(`^(${Object.keys(SIGNATURE_STATES).join('|')}): ([\\da-f]{7,40})$`),
      (_, state, hash) => `${SIGNATURE_STATES[state] ?? state}：${hash}`
    ],
    // 软件包结果
    [new RegExp(`^(${Object.keys(PACKAGE_TYPES).join('|')}) type$`), (_, type) => PACKAGE_TYPES[type] ?? type],
    // 代码结果
    [/^Show (\d[\d,]*) more match(?:es)?$/, '再显示 $1 处匹配'],
    [/^This file contains (\d[\d,]*) more match(?:es)? not shown\.$/, '此文件另有 $1 处匹配未显示。'],
    [/^See all (\d[\d,]*) match(?:es)? in the full file$/, '查看完整文件中的全部 $1 处匹配'],
    // 搜索首页页脚：「GitHub, Inc. © 」「2026」拼接，品牌与年份保持原样（同 common 的全站页脚）
    [/^GitHub, Inc\. © (\d{4})$/, 'GitHub, Inc. © $1']
  ],
  ignore: [
    // 结果中的用户内容：摘要与描述（Marketplace 应用描述不带 search-match）、主题名、提交与讨论作者名、用户所在地
    '[data-testid="results-list"] :is([class^="Content__"], [class*=" Content__"])',
    '[data-testid="results-list"] a[href^="/topics/"]',
    '[data-testid="results-list"] :is([class^="authorName__"], [class*=" authorName__"])',
    '[data-testid="results-list"] [class*="contentColumn__"] [class*="footerItem__"] > span:not([aria-label])',
    // 议题、拉取请求结果的作者名：头像后的纯文本
    '[data-testid="results-list"] li[class*="footerItem__"]:has(> img:only-child)',
    // Marketplace 结果的发布者名：By + 链接
    '[data-testid="results-list"] li[class*="footerItem__"] > a[data-inline="true"]',
    // 存储库结果的赞助对话框：可赞助帐户名、外部赞助链接
    '[id^="funding-links-modal-"] a.color-fg-default',
    '[id^="funding-links-modal-"] a[target="_blank"]',
    // 编程语言名：侧栏语言筛选项、结果中的语言
    'a[href*="language%3A"]',
    LANGUAGE_NAME,
    // 头部搜索框按钮显示的当前查询（占位文字带 kbd，不忽略）；高亮层与尺寸层由全局忽略规则处理
    '#qb-input-query:not(:has(kbd))',
    // 搜索建议中的限定符取值（state:open 的 open 等，及存储库名、用户名）
    '[data-type="filter-item"] .ActionListItem-label'
  ],
  attributeRules: [
    // 结果中语言名的无障碍名称：Vue language → Vue 语言（语言名原样）
    [LANGUAGE_NAME, 'aria-label', /^(.+) language$/, '$1 语言']
  ]
} satisfies PageDictionary
