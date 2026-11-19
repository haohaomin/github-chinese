import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import { formatDate } from '../../../src/locales/zh-CN/helpers'
import security from '../../../src/locales/zh-CN/security'

const matcher = createMatcher([['security', security]])

/** 安全页的作用域：common → repository → security */
const SCOPE = ['common', 'repository', 'security'] as const

function translate(text: string): string | undefined {
  return matcher.translate(text, SCOPE)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 概述、严重性
  { hits: [['Security: octo-org/hello-world', '安全：octo-org/hello-world']], misses: ['Security: octo-org'] },
  {
    hits: [['octo-org/hello-world (filters applied)', 'octo-org/hello-world（已应用筛选器）']],
    misses: ['hello-world (filters applied)']
  },
  {
    hits: [
      ['Severity: critical', '严重性：严重'],
      ['Severity: High', '严重性：高']
    ],
    misses: ['Severity: extreme']
  },
  {
    hits: [
      ['High severity', '高危'],
      ['Critical severity', '严重']
    ],
    misses: ['Extreme severity']
  },
  // 组织安全概述表格的全选文字
  {
    hits: [
      ['Select all 12 repositories', '选择全部 12 个存储库'],
      ['Select all 1,234 repositories', '选择全部 1,234 个存储库']
    ],
    misses: ['Select all repositories']
  },
  // 警报通用
  { hits: [['Max 280 characters', '最多 280 个字符']], misses: ['Max many characters'] },
  // 状态标签的 title
  {
    hits: [
      ['Status: Fixed', '状态：已修复'],
      ['Status: Auto-dismissed', '状态：已自动消除']
    ],
    misses: ['Status: Pending']
  },
  {
    hits: [
      ['Status: Dismissed as false positive', '状态：已消除（误报）'],
      ["Status: Closed as won't fix", '状态：已关闭（不予修复）']
    ],
    misses: ['Status: Open as false positive']
  },
  {
    hits: [
      ['Dismiss findings', '消除发现'],
      ['Dismiss finding', '消除发现']
    ],
    misses: ['Dismiss all']
  },
  {
    hits: [
      ['Select a reason to dismiss these alerts.', '选择消除这些警报的原因。'],
      ['Select a reason to dismiss this finding.', '选择消除此发现的原因。']
    ],
    misses: ['Select a reason to dismiss the alert.']
  },
  { hits: [['Request to dismiss alerts', '请求消除警报']], misses: ['Request to dismiss everything'] },
  {
    hits: [
      [
        'These alerts need approval before they can be dismissed. Requests are sent to all approvers.',
        '这些警报需经批准才能消除。请求将发送给所有审批者。'
      ],
      [
        'These findings need approval before they can be dismissed. Requests are sent to all approvers.',
        '这些发现需经批准才能消除。请求将发送给所有审批者。'
      ]
    ],
    misses: ['This alert needs approval before it can be closed. Requests are sent to all approvers.']
  },
  {
    hits: [
      ['This alert is not valid', '此警报无效'],
      ['These alerts are mitigated by a compensating control', '这些警报已由补偿性控制缓解']
    ],
    misses: ['This alert is fine']
  },
  {
    hits: [['Assign up to 10 people to this alert', '最多可为此警报分配 10 人']],
    misses: ['Assign up to many people to this alert']
  },
  {
    hits: [['You have reached the limit of 10 assignees', '已达到 10 个受理人的上限']],
    misses: ['You have reached the limit of assignees']
  },
  { hits: [['Tracked in issue #42', '在议题 #42 中跟踪']], misses: ['Tracked in issue 42'] },
  {
    hits: [
      ["Filter alerts by 'high' severity.", '筛选严重性为“高”的警报。'],
      ['Filter alerts by critical severity', '筛选严重性为严重的警报']
    ],
    misses: ['Filter alerts by extreme severity']
  },
  {
    hits: [['Error fetching details for CWE-79.', '获取 CWE-79 详细信息时出错。']],
    misses: ['Error fetching details for CWE-X.']
  },
  { hits: [['Dismissal requested as false positive', '已请求以误报为由消除']], misses: ['Dismissal requested'] },
  {
    hits: [['requested to dismiss this as used in tests', '请求以用于测试为由消除此警报']],
    misses: ['requested to dismiss this']
  },
  // 存储库安全公告
  {
    hits: [
      ['3 Draft', '3 个草稿'],
      ['1,024 Published', '1,024 个已发布的'],
      ['2 Closed', '2 个已关闭的']
    ],
    misses: ['3 Drafts']
  },
  {
    hits: [
      ["There aren't any published security advisories.", '暂无已发布的安全公告。'],
      ['There aren’t any triage security advisories', '暂无待分类的安全公告']
    ],
    misses: ["There aren't any security advisories."]
  },
  {
    hits: [
      ['Exact package name not found on npm. You can still submit this report.', '在 npm 上未找到完全匹配的软件包名称。仍可提交此报告。']
    ],
    misses: ['Exact package name not found. You can still submit this report.']
  },
  // GitHub Advisory Database
  {
    hits: [
      ['1 advisory', '1 条公告'],
      ['1,234 advisories', '1,234 条公告']
    ],
    misses: ['many advisories']
  },
  {
    hits: [
      ['Filter by severity - Critical', '按严重性筛选 - 严重'],
      ['Filter by severity - All severities', '按严重性筛选 - 所有严重性']
    ],
    misses: ['Filter by severity - Extreme']
  },
  { hits: [['Sort by - Recently updated', '排序依据 - 最近更新']], misses: ['Sort by - Most stars'] },
  {
    hits: [
      ['Credited to octocat', '致谢 octocat'],
      ['Credited to alice, bob, and carol', '致谢 alice、bob 和 carol'],
      ['Credited to alice and bob', '致谢 alice 和 bob']
    ],
    misses: ['Credited to the team!']
  },
  {
    hits: [
      ['This advisory was withdrawn on Oct 5, 2026.', `此公告已于 ${formatDate(2026, 10, 5)}撤回。`],
      ['This advisory was withdrawn on October 5, 2026', `此公告已于 ${formatDate(2026, 10, 5)}撤回`]
    ],
    misses: ['This advisory was withdrawn yesterday.']
  },
  // 公告表单
  {
    hits: [
      ['e.g. CVE-2026-######', '例如 CVE-2026-######'],
      ['e.g. < 1.2.3', '例如 < 1.2.3']
    ],
    misses: ['e.g.']
  },
  // CVSS / EPSS
  {
    hits: [
      ['(85th percentile)', '（第 85 百分位）'],
      ['(1st percentile)', '（第 1 百分位）']
    ],
    misses: ['(85 percentile)']
  },
  // CVSS 计算器
  {
    hits: [
      ['Attack Vector - Network', '攻击向量 - 网络'],
      ['Scope - Unchanged', '范围 - 未改变']
    ],
    misses: ['Attack Vector - Remote']
  },
  {
    hits: [
      ['Attack Vector (AV) - Network (N)', '攻击向量 (AV) - 网络 (N)'],
      ['User Interaction (UI) - Passive (P)', '用户交互 (UI) - 被动 (P)']
    ],
    misses: ['Attack Vector (XX) - Network (N)']
  },
  {
    hits: [
      ['Attack Requirements (AT)', '攻击要求 (AT)'],
      ['Confidentiality (VC)', '机密性 (VC)']
    ],
    misses: ['Attack Vector (XX)']
  },
  {
    hits: [
      ['Network (N)', '网络 (N)'],
      ['None (N)', '无 (N)']
    ],
    misses: ['Remote (R)']
  },
  // Dependabot
  {
    hits: [
      ['#38 opened', '#38 打开于'],
      ['#7 auto-dismissed', '#7 自动消除于']
    ],
    misses: ['#38 merged']
  },
  {
    hits: [
      ['Upgrade lodash to fix 3 Dependabot alerts in package-lock.json', '升级 lodash 以修复 package-lock.json 中的 3 个 Dependabot 警报'],
      ['Upgrade lodash to fix 1 Dependabot alert in yarn.lock', '升级 lodash 以修复 yarn.lock 中的 1 个 Dependabot 警报']
    ],
    misses: ['Upgrade lodash to fix Dependabot alerts in package-lock.json']
  },
  {
    hits: [['Upgrade lodash to version 4.17.21 or later. For example:', '将 lodash 升级到 4.17.21 或更高版本。例如：']],
    misses: ['Upgrade lodash to the latest version. For example:']
  },
  {
    hits: [['Dependabot cannot update lodash to a non-vulnerable version', 'Dependabot 无法将 lodash 更新到无漏洞的版本']],
    misses: ['Dependabot cannot update lodash']
  },
  {
    hits: [
      ['3 Dependabot alerts', '3 个 Dependabot 警报'],
      ['1 Dependabot alert', '1 个 Dependabot 警报']
    ],
    misses: ['many Dependabot alerts']
  },
  {
    hits: [['Filter alerts by Potentially reachable reachability', '筛选可达性为可能可达的警报']],
    misses: ['Filter alerts by Maybe reachability']
  },
  // 代码扫描
  { hits: [['via pull request #1234', '通过拉取请求 #1234']], misses: ['via pull request 1234'] },
  { hits: [['via commit 1a2b3c4d', '通过提交 1a2b3c4d']], misses: ['via commit XYZ'] },
  {
    hits: [['Merging pull request #12 may fix the alert in this branch.', '合并拉取请求 #12 可能会修复此分支中的警报。']],
    misses: ['Merging pull request may fix the alert in this branch.']
  },
  {
    hits: [
      ['+ at least 12 branches (not shown)', '+ 至少 12 个分支（未显示）'],
      ['+ 3 branches (not shown)', '+ 3 个分支（未显示）'],
      ['+ more branches (not shown)', '+ 更多分支（未显示）']
    ],
    misses: ['+ several branches (not shown)']
  },
  { hits: [['#12 was closed', '#12 已关闭']], misses: ['#12 was reopened'] },
  { hits: [['#12 was merged into', '#12 已合并到']], misses: ['#12 was merged'] },
  {
    hits: [
      ['Commit autofixes to new branch', '将自动修复提交到新分支'],
      ['Commit autofix to new branch', '将自动修复提交到新分支'],
      ['Commit autofix to branch', '将自动修复提交到分支']
    ],
    misses: ['Commit fixes to new branch']
  },
  {
    hits: [
      ['Copilot failed to create a pull request. Repository rule violation.', 'Copilot 创建拉取请求失败。Repository rule violation。']
    ],
    misses: ['Copilot failed to create a pull request.']
  },
  {
    hits: [['Failed to create pull request: Repository rule violation.', '创建拉取请求失败：Repository rule violation。']],
    misses: ['Failed to create pull request: timeout']
  },
  {
    hits: [
      [
        'There are no AI credits available to start a deep scan. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner.',
        '没有可用于启动深度扫描的 AI 额度。可能是预算已超出或存储库所有者尚未设置按流量计费。'
      ]
    ],
    misses: [
      'There are no AI credits available to start a scan. This may be because the budget has been exceeded or because metered billing has not been set up by the repository owner.'
    ]
  },
  {
    hits: [
      [
        'Before you can start a standard scan, you need to pick a "Usage billed to" option in your',
        '启动标准扫描前，需要在以下设置中选择“使用量计费对象”'
      ]
    ],
    misses: ['Before you can start a scan, you need to pick a "Usage billed to" option in your']
  },
  { hits: [['12 of 340 functions scanned', '已扫描 12/340 个函数']], misses: ['some of 340 functions scanned'] },
  { hits: [['3 of 5 findings validated', '已验证 3/5 个发现']], misses: ['3 of 5 findings'] },
  {
    hits: [
      ['Scan started by octocat', '由 octocat 启动扫描'],
      ['Scan started by dependabot[bot]', '由 dependabot[bot] 启动扫描']
    ],
    misses: ['Scan started by @octocat']
  },
  {
    hits: [
      ['12/30 files scanned', '已扫描 12/30 个文件'],
      ['1/1 file scanned', '已扫描 1/1 个文件']
    ],
    misses: ['12 files scanned']
  },
  {
    hits: [
      ['3 steps in src/index.js', 'src/index.js 中的 3 个步骤'],
      ['1 step in app.py', 'app.py 中的 1 个步骤']
    ],
    misses: ['3 steps in']
  },
  { hits: [['Step 2', '步骤 2']], misses: ['Step two'] },
  // 机密扫描
  {
    hits: [
      ['Closed as revoked', '以已撤销为由关闭'],
      ["Closed as won't fix", '以不予修复为由关闭'],
      ['Closed as False positive', '以误报为由关闭']
    ],
    misses: ['Closed as duplicate']
  },
  {
    hits: [
      ['Advanced filter dialog: 1 valid filter', '高级筛选器对话框：1 个有效筛选器'],
      ['Advanced filter dialog: 3 valid filters', '高级筛选器对话框：3 个有效筛选器']
    ],
    misses: ['Advanced filter dialog: no valid filter']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)

describe('security 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(security.static?.[input]).toBeUndefined()
    expect(security.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = security.regexp ?? []
    const covered = new Set(HITS.map(([input]) => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Upgrade ', 'lodash', ' to fix ', '3', ' Dependabot alerts in ', 'package-lock.json'].join('')))).toBe(
      '升级 lodash 以修复 package-lock.json 中的 3 个 Dependabot 警报'
    )
    expect(translate(normalizeText(['12', ' of ', '340', ' functions scanned'].join('')))).toBe('已扫描 12/340 个函数')
    expect(translate(normalizeText(['#', '38', ' ', 'opened'].join('')))).toBe('#38 打开于')
    expect(translate(normalizeText(['+', ' ', 'at least', ' ', '12', ' branches (not shown)'].join('')))).toBe('+ 至少 12 个分支（未显示）')
    expect(translate(normalizeText(['Merging pull request #', '12', ' may fix the alert in this branch.'].join('')))).toBe(
      '合并拉取请求 #12 可能会修复此分支中的警报。'
    )
  })

  it('跨元素片段按顺序读通', () => {
    const read = (parts: readonly string[]): string => parts.map(part => translate(part) ?? part).join(' ')
    expect(read(['Learn more about advisories related to', 'octo-org/hello-world', 'in the', 'GitHub Advisory Database'])).toBe(
      '了解 octo-org/hello-world 的相关公告请访问 GitHub 公告数据库'
    )
    expect(read(['CodeQL is reporting errors. Check the', 'status page', 'for help.'])).toBe('CodeQL 报告了错误。查看 状态页 以获取帮助。')
    expect(read(['This project has not set up a', 'SECURITY.md', 'file yet.'])).toBe('此项目尚未设置 SECURITY.md 文件。')
    expect(
      read([
        'A call that chooses its function at runtime, such as',
        'obj[name]()',
        ", could reach the vulnerable function. The call is in your code or in one of your dependencies. Analysis reads code without running it, so it can't tell which function the call chooses."
      ])
    ).toBe(
      '在运行时才确定调用目标的调用，例如 obj[name]() ，可能会调用存在漏洞的函数。该调用位于你的代码或某个依赖项中。分析只读取代码而不运行，因此无法判断该调用会选择哪个函数。'
    )
    expect(
      read([
        'reachability analysis run',
        'for this repository reached its time limit before it finished checking this alert. Each run reuses the work earlier runs completed, so a later run might finish checking it.'
      ])
    ).toBe('可达性分析运行 在此存储库中完成此警报的检查前已达到时间上限。每次运行都会复用之前已完成的工作，后续运行可能会完成检查。')
  })
})

describe('security 静态词条', () => {
  it.each([
    ['Report a vulnerability', '报告漏洞'],
    // 产品名、功能名按用户规定译成中文（公告数据库、高级安全、桌面版、Copilot 自动修复）
    ['GitHub Advisory Database', 'GitHub 公告数据库'],
    ['Advanced Security is only available for Organizations', '高级安全仅适用于组织'],
    ['Open branch with GitHub Desktop', '用 GitHub 桌面版打开分支'],
    ['Copilot Autofix for CodeQL', 'CodeQL 的 Copilot 自动修复'],
    ['Actions disabled', '操作已禁用'],
    ['GitHub Security Lab', 'GitHub 安全实验室'],
    ['Private vulnerability reporting', '专用漏洞报告'],
    ['Security policy •', '安全策略 •'],
    ['Severity', '严重性'],
    ['Critical', '严重'],
    ['Affected versions', '受影响的版本'],
    ['Patched versions', '已修补的版本'],
    ['References', '参考资料'],
    ['Credits', '致谢'],
    ['Weaknesses', '弱点'],
    ['False positive', '误报'],
    ['Won’t fix', '不予修复'],
    ['Fixed', '已修复'],
    ['Dismissed', '已消除'],
    ['Withdrawn', '已撤回'],
    ['Validity', '有效性'],
    ['Unreviewed', '未审查'],
    ['GitHub Reviewed', 'GitHub 已审查'],
    ['GitHub reviewed advisories', 'GitHub 已审查公告'],
    ['Provider', '提供程序'],
    ['Filter by provider', '按提供程序筛选'],
    ['Learn more on MITRE.', '在 MITRE 上了解更多。'],
    ['Request CVE', '申请 CVE'],
    ['Publish advisory', '发布公告'],
    ['Draft Advisory', '公告草稿'],
    ['was published for', '已发布 影响'],
    ['Attack vector', '攻击向量'],
    ['Exploitability metrics', '可利用性指标'],
    ['Learn more about attack vector', '了解攻击向量'],
    ['Dependabot alerts are disabled.', 'Dependabot 警报已禁用。'],
    ['to see alerts without an available fix.', '可查看没有可用修复的警报。'],
    ['Code scanning is not enabled', '代码扫描未启用'],
    ['No secrets found.', '未找到机密。'],
    ['Advisory Details', '公告详细信息'],
    ['Needs setup', '待设置'],
    ['Detected by', '检测工具'],
    ['Customer selection required', '需要选择计费对象'],
    ['Failed to create pull request.', '创建拉取请求失败。'],
    ['Export CSV', '导出 CSV'],
    ['Your report is ready and the download has started.', '报告已就绪且已开始下载。'],
    ['Refreshed recently, available again in about 1 hour.', '最近已刷新，约1小时后可再次刷新。'],
    [
      'This score estimates the probability of this vulnerability being exploited within the next 30 days. Data by',
      '此评分估计该漏洞在未来 30 天内被利用的概率。数据来源'
    ],
    ['National Vulnerability Database', '美国国家漏洞数据库'],
    ['Common weakness enumerator (CWE)', '通用弱点枚举 (CWE)'],
    ['Advanced filter dialog', '高级筛选器对话框'],
    ['Clear package filter', '清除软件包筛选器'],
    ['Available filters', '可用筛选器'],
    ['Deep scan in progress', '深度扫描正在进行'],
    ['Run in progress', '正在运行'],
    ['Link a branch or pull request', '链接分支或拉取请求'],
    ['Link an issue to this alert.', '将议题链接到此警报。'],
    ['filter by open/closed state', '按未解决/已关闭状态筛选'],
    ['Invalid item type', '无效的项类型'],
    [
      'Before you can use agentic autofix, you need to pick a "Usage billed to" option in your Copilot settings.',
      '使用智能体自动修复前，需要在 Copilot 设置中选择“使用量计费对象”。'
    ],
    [
      ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the Vulnerable System are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the Vulnerable System.',
      '：性能下降或资源可用性中断。即使可以反复利用漏洞，攻击者也无法完全拒绝向合法用户提供服务。漏洞系统中的资源要么始终部分可用，要么仅在部分时间完全可用，但总体上不会对漏洞系统造成直接、严重的后果。'
    ],
    [
      'This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is greatest when no user interaction is required.',
      '此指标衡量成功攻破存在漏洞的组件是否需要攻击者以外的人类用户参与。它决定漏洞能否仅凭攻击者的意愿被利用，还是需要其他用户（或用户发起的进程）以某种方式参与。无需用户交互时基本分数最高。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw(' Severity ', ['common', 'security'])).toBe(' 严重性 ')
  })
})

describe('security 页面词条', () => {
  it.each([
    ['Security policy', '安全策略'],
    ['Security overview', '安全概述'],
    ['Code scanning', '代码扫描'],
    ['Secret scanning', '机密扫描'],
    ['Push protection', '推送保护'],
    ['Dependabot alerts', 'Dependabot 警报'],
    ['Dismiss alert', '消除警报'],
    ['Dismiss', '消除'],
    ['Triage', '待分类'],
    ['Inactive', '无效'],
    ['Findings', '发现'],
    ['Vulnerabilities', '漏洞'],
    ['by', '由'],
    ['in', '位于'],
    ['closed', '关闭于'],
    ['Assignees', '受理人'],
    ['No one assigned', '无受理人'],
    ['Tags', '标签'],
    ['Open', '未解决'],
    ['Summary', '摘要'],
    // 公告表单描述编辑器的已保存回复为空：You can create one in your <a>settings</a>.
    ['settings', '设置'],
    ['Branch name', '分支名称'],
    ["What's next?", '下一步做什么？'],
    ['What’s next?', '下一步做什么？'],
    ['Changed', '已改变'],
    ['Present', '存在'],
    ['Adjacent', '相邻'],
    ['Reviewed', '审查于'],
    // 产品名按用户规定译出：公告数据库的生态系统筛选项、代码扫描对话框的链接
    ['GitHub Actions', 'GitHub 操作'],
    ['GitHub Desktop', 'GitHub 桌面版']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    for (const input of [
      'Dismiss',
      'Security policy',
      'Triage',
      'Code scanning',
      'Findings',
      'by',
      'in the',
      'Changed',
      'Present',
      'Adjacent',
      'Open',
      'settings'
    ]) {
      expect(matcher.translate(input, ['common', 'repository', 'issues'])).toBeUndefined()
    }
  })
})

/** 按 security 页面类型的作用域翻译 html */
function render(html: string): Translator {
  document.body.innerHTML = html
  const translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
  translator.start()
  return translator
}

/** 显示文字：时间元素的文字由元素自己在 shadowRoot 里渲染，这里记作「<时间>」 */
function shown(id: string): string {
  const clone = document.getElementById(id)?.cloneNode(true) as Element | undefined
  for (const time of clone?.querySelectorAll('relative-time') ?? []) time.textContent = '<时间>'
  return (clone?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('security 忽略选择器', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each(security.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('公告列表的软件包名保持原文，同一行按整句翻译', () => {
    // /advisories 列表条目：<CVE> was published for <包> (<生态系统>) <时间>；包名与词条同形时也不翻译
    translator = render(`
      <div class="mt-1 text-small color-fg-muted" id="row">
        <span class="text-bold">
          CVE-2026-0001
        </span>

        was published
          for
          <span id="package">
            severity
          </span>
          (npm)
        <relative-time datetime="2026-10-23T22:28:41Z" class="no-wrap">Oct 23, 2026</relative-time>
      </div>
      <div class="mt-1 text-small color-fg-muted"><span id="label">severity</span></div>`)
    expect(document.getElementById('package')?.textContent?.trim()).toBe('severity')
    expect(shown('row')).toBe('CVE-2026-0001 针对 severity (npm) 发布于 <时间>')
    // 前面没有 CVE 编号的 span 照常翻译
    expect(document.getElementById('label')?.textContent).toBe('严重性')
  })
})

describe('security 公告条目整句', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('存储库安全公告详情页头：<用户> published <GHSA> <时间>', () => {
    translator = render(`
      <div class="TableObject-item TableObject-item--primary ws-normal" id="meta">
          <a class="author Link--secondary text-bold" data-hovercard-type="user" href="/octocat">octocat</a>
          published
          <span class="text-bold user-select-contain">GHSA-abcd-1234-wxyz</span>
          <relative-time datetime="2026-08-31T01:48:00Z" class="no-wrap">Aug 31, 2026</relative-time>

      </div>`)
    expect(shown('meta')).toBe('octocat 发布了 GHSA-abcd-1234-wxyz 于 <时间>')
  })

  it('存储库安全公告列表：GHSA <span>published <时间> by <用户></span>', () => {
    translator = render(`
      <div class="mt-1 text-small color-fg-muted" id="row">
          GHSA-abcd-1234-wxyz

          <span class="opened-by">
              published
              <relative-time datetime="2026-08-31T01:48:00Z" class="no-wrap">Aug 31, 2026</relative-time>
              by
              <a class="author Link--muted" data-hovercard-type="user" href="/octocat">octocat</a>
          </span>
      </div>`)
    expect(shown('row')).toBe('GHSA-abcd-1234-wxyz 于 <时间>由 octocat 发布')
  })

  it('GitHub 公告数据库详情时间线：Published by the <链接> <时间>', () => {
    translator = render(`
      <div class="TimelineItem-body" id="item">
          Published by the <a target="_blank" rel="noopener noreferrer" href="https://nvd.nist.gov/vuln/detail/CVE-2026-0001" class="Link--inTextBlock Link--primary Link">National Vulnerability Database</a>
        <relative-time datetime="2026-10-20T15:17:16Z" class="no-wrap">Oct 20, 2026</relative-time>
      </div>`)
    expect(shown('item')).toBe('由美国国家漏洞数据库发布于 <时间>')
  })

  it('GitHub 公告数据库详情时间线：<头像> <用户> published to <存储库> <时间>', () => {
    translator = render(`
      <div class="TimelineItem-body" id="item">
        <a class="d-inline-block" data-hovercard-type="user" href="/octocat"><img class="avatar avatar-user" width="20" height="20" alt="@octocat" /></a>
        <a class="ml-1 Link--primary text-bold" data-hovercard-type="user" href="/octocat">octocat</a>
        published to
        <a href="/octo-org/hello-world/security/advisories/GHSA-abcd-1234-wxyz" class="Link--primary text-underline">
          octo-org/hello-world
        </a>
      <relative-time datetime="2026-10-17T16:49:44Z" class="no-wrap">Oct 17, 2026</relative-time>
    </div>`)
    expect(shown('item')).toBe('octocat 发布到 octo-org/hello-world 于 <时间>')
  })

  it('GitHub 公告数据库详情时间线：Published to the GitHub Advisory Database <时间>', () => {
    translator = render(`
      <div class="TimelineItem-body" id="item">
        Published to the GitHub Advisory Database
      <relative-time datetime="2026-10-23T22:28:41Z" class="no-wrap">Oct 23, 2026</relative-time>
    </div>`)
    expect(shown('item')).toBe('于 <时间>发布到 GitHub 公告数据库')
  })

  it('整句只在 security 页面类型生效', () => {
    document.body.innerHTML = `
      <div id="meta"><a href="/octocat">octocat</a> published <span>GHSA-abcd-1234-wxyz</span> <relative-time datetime="2026-08-31T01:48:00Z">Aug 31, 2026</relative-time></div>`
    translator = createTranslator({ matcher, host: window, resolvePages: () => ['common', 'repository', 'issues'] })
    translator.start()
    expect(shown('meta')).toBe('octocat published GHSA-abcd-1234-wxyz <时间>')
  })
})

describe('security 被元素拆开的整句', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 按 React 客户端渲染建元素：每个字符串子项是独立的文本节点 */
  function build(tag: string, children: readonly (string | Node)[], id?: string): HTMLElement {
    const element = document.createElement(tag)
    if (id) element.id = id
    for (const child of children) element.append(typeof child === 'string' ? document.createTextNode(child) : child)
    return element
  }

  function time(datetime: string, text: string): HTMLElement {
    const element = build('relative-time', [text])
    element.setAttribute('datetime', datetime)
    return element
  }

  function start(...elements: HTMLElement[]): void {
    document.body.append(...elements)
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
  }

  it('开发区的拉取请求条目：opened 作“创建于”', () => {
    // code-scanning-development-section PullRequestItem：#{number} opened <RelativeTime/> merges into{' '}<BranchName/>
    const open = build(
      'span',
      ['#', '12', ' opened ', time('2026-10-20T15:17:16Z', 'Oct 20, 2026'), ' merges into', ' ', build('span', ['main'])],
      'open'
    )
    // 同一页面类型的 Dependabot 警报条目仍按警报的说法
    const alert = build('span', ['#', '38', ' ', 'opened'], 'alert')
    start(open, alert)
    expect(shown('open')).toBe('#12 创建于 <时间>合并到 main')
    expect(shown('alert')).toBe('#38 打开于')
  })

  it('在 GitHub Desktop 中打开分支的对话框', () => {
    // code-scanning-shared BranchNextStepDesktop：文字之间是 &nbsp;
    const dialog = build(
      'span',
      [
        'If nothing happens, make sure\u00a0',
        build('a', ['GitHub Desktop']),
        '\u00a0is installed and set up properly, then\u00a0',
        build('a', ['try again']),
        '.'
      ],
      'dialog'
    )
    start(dialog)
    expect(shown('dialog')).toBe('如果没有反应，请确认 GitHub 桌面版已正确安装并设置，然后重试。')
  })

  it('开发区的关闭条目：时间放在“关闭于”之后；没有时间时保留原译', () => {
    // code-scanning-development-section：#{number} was closed <RelativeTime/>
    const closed = build('span', ['#', '12', ' was closed ', time('2026-10-20T15:17:16Z', 'Oct 20, 2026')], 'closed')
    const bare = build('span', ['#', '12', ' was closed'], 'bare')
    start(closed, bare)
    expect(shown('closed')).toBe('#12 关闭于 <时间>')
    expect(shown('bare')).toBe('#12 已关闭')
  })

  it('受影响分支的修复位置：方式放在“修复”之前；单独的 Fixed 徽章不变', () => {
    // code-scanning-shared：Fixed <RelativeTime/> [ via pull request #N | via commit <sha> ]
    const at = (): HTMLElement => time('2026-10-20T15:17:16Z', 'Oct 20, 2026')
    const pull = build('span', ['Fixed ', at(), ' ', 'via pull request #12'], 'pull')
    const commit = build('span', ['Fixed ', at(), ' ', 'via commit abc1234'], 'commit')
    const plain = build('span', ['Fixed ', at()], 'plain')
    const badge = build('span', ['Fixed'], 'badge')
    start(pull, commit, plain, badge)
    expect(shown('pull')).toBe('于 <时间>通过拉取请求 #12 修复')
    expect(shown('commit')).toBe('于 <时间>通过提交 abc1234 修复')
    expect(shown('plain')).toBe('修复于 <时间>')
    expect(shown('badge')).toBe('已修复')
  })

  it('Dependabot 可达性分析：三个链接用顿号连接', () => {
    // PrioritizationSignals：React 把“,”与“ ”拆成两个文本节点
    const signals = build(
      'div',
      [
        'Prioritize this alert with signals like',
        ' ',
        build('a', ['severity']),
        ',',
        ' ',
        build('a', ['EPSS score']),
        ', or',
        ' ',
        build('a', ['whether the code is deployed to production']),
        '.'
      ],
      'signals'
    )
    start(signals)
    expect(shown('signals')).toBe('可借助严重性、EPSS 评分或代码是否已部署到生产环境等信号确定此警报的优先级。')
  })

  it('机密扫描修复步骤：“通过 …”放在“撤销”之前', () => {
    // 服务器渲染：Revoke this <a>类型</a> through <a>提供程序</a> to prevent unauthorized access.
    document.body.innerHTML = `
      <li id="revoke">
        Revoke this
        <a href="https://example.com/docs">Google API Key</a>
        through
        <a href="https://example.com/console">Google</a>
        to prevent unauthorized access.
      </li>`
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(shown('revoke')).toBe('将此 Google API Key 通过 Google 撤销，以防止未经授权的访问。')
  })
})
