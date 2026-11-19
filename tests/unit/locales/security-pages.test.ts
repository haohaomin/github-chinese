import { afterEach, describe, expect, it } from 'vitest'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { translateTitleText } from '../../../src/core/title'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import cnSecurityPages from '../../../src/locales/zh-CN/common/security-pages'
import { zhCN } from '../../../src/locales/zh-CN/index'
import twSecurityPages from '../../../src/locales/zh-TW/common/security-pages'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 期望译文：[简体, 繁体] */
type Pair = readonly [cn: string, tw: string]

const SECURITY_URL = 'https://github.com/security'
const ADVANCED_URL = 'https://github.com/security/advanced-security'
const CODE_URL = 'https://github.com/security/advanced-security/code-security'
const SECRET_URL = 'https://github.com/security/advanced-security/secret-protection'
const SUPPLY_URL = 'https://github.com/security/advanced-security/software-supply-chain'
const PLANS_URL = 'https://github.com/security/plans'
const URLS: readonly string[] = [SECURITY_URL, ADVANCED_URL, CODE_URL, SECRET_URL, SUPPLY_URL, PLANS_URL]

/** 安全产品介绍页只有 common 作用域 */
const COMMON: readonly PageKey[] = ['common']

interface Locale {
  readonly name: string
  /** 期望译文在 Pair 中的下标 */
  readonly index: 0 | 1
  readonly dict: PageDictionary
  /** 只含本词典：检查词条本身 */
  readonly own: Matcher
  /** 正式语言包：检查页面上的实际效果 */
  readonly full: Matcher
}

const LOCALES: readonly Locale[] = [
  {
    name: 'zh-CN',
    index: 0,
    dict: cnSecurityPages,
    own: createMatcher([['common', cnSecurityPages]]),
    full: createMatcher(zhCN)
  },
  {
    name: 'zh-TW',
    index: 1,
    dict: twSecurityPages,
    own: createMatcher([['common', twSecurityPages]]),
    full: createMatcher(zhTW)
  }
]

/** 本词典的代表词条 */
const STATIC_CASES: readonly (readonly [string, Pair])[] = [
  ['Supply Chain Security', ['供应链安全', '供應鏈安全性']],
  ['Plans & pricing', ['计划与定价', '方案和定價']],
  ['Request a demo', ['申请演示', '預約示範']],
  ['Contact sales', ['联系销售', '聯絡銷售人員']],
  ['Prevent accidental secret exposure', ['防止机密意外泄露', '防止機密意外外洩']],
  ["Adopted by the world's leading organizations", ['全球领先组织纷纷采用', '全球領先組織紛紛採用']],
  ['Head of development services and tools at SAP', ['SAP 开发服务与工具负责人', 'SAP 開發服務和工具負責人']],
  ['Lead developer', ['首席开发人员', '首席開發人員']],
  ['community manager of security at Otto GmbH & Co. KGaA', ['Otto GmbH & Co. KGaA 安全社区经理', 'Otto GmbH & Co. KGaA 安全性社群經理']],
  ['per active committer/month', ['每个活跃提交者/月', '每位活躍提交者/月']],
  ['Add-on', ['附加组件', '附加元件']],
  ['28 min', ['28 分钟', '28 分鐘']],
  ['3X', ['3 倍', '3 倍']],
  ['Of alert types include AI-powered code suggestions', ['警报类型提供 AI 驱动的代码建议', '警示類型提供 AI 驅動的程式碼建議']],
  ['Secrets prevented from leaking on GitHub in 2024', ['2024 年在 GitHub 上阻止泄露的机密', '2024 年在 GitHub 上成功阻止外洩的機密']],
  ['What is GitHub Advanced Security?', ['什么是 GitHub 高级安全？', '什麼是 GitHub 進階安全性？']],
  ['What is SLSA and SLSA level 3?', ['什么是 SLSA 和 SLSA 级别 3？', '什麼是 SLSA 和 SLSA 等級 3？']],
  ['GitHub Code Security', ['GitHub 代码安全', 'GitHub 程式碼安全性']],
  ['Push protection', ['推送保护', '推送保護']],
  ['Copilot Autofix', ['Copilot 自动修复', 'Copilot 自動修正']],
  ['Dependency review action', ['依赖项审查操作', '相依性審查動作']],
  ['Included', ['包含', '包含']],
  ['Not included', ['不包含', '不包含']],
  ['REPORT', ['报告', '報告']],
  ['Videos', ['视频', '影片']],
  [
    'Use AI to detect unstructured like passwords—without the noise.',
    ['使用 AI 检测密码等非结构化机密——免受误报干扰。', '使用 AI 偵測密碼等非結構化機密——免受誤報干擾。']
  ],
  [
    'Play video. Thumbnail description: What is GitHub Secret Protection?',
    ['播放视频。缩略图说明：什么是 GitHub 机密保护？', '播放影片。縮圖說明：什麼是 GitHub 機密保護？']
  ],
  ['Supply-chain Levels for Software Artifacts (SLSA)', ['软件产物供应链级别 (SLSA)', '軟體成品供應鏈等級 (SLSA)']],
  [
    'GitHub’s API stays secure with ISO, SOC 2, and GDPR.',
    ['GitHub 的 API 符合 ISO、SOC 2 和 GDPR 要求，始终安全。', 'GitHub 的 API 符合 ISO、SOC 2 和 GDPR 規範，安全無虞。']
  ],
  [
    'Postmates uses GitHub Advanced Security to catch vulnerabilities',
    ['Postmates 使用 GitHub 高级安全发现漏洞', 'Postmates 使用 GitHub 進階安全性揪出漏洞']
  ],
  [
    'Providers get real-time alerts when their tokens appear in public code, enabling them to notify, quarantine, or revoke secrets.',
    [
      '提供程序的令牌出现在公共代码中时，提供程序会实时收到警报，以便通知、隔离或撤销机密。',
      '提供者的權杖出現在公開程式碼中時，提供者會即時收到警示，以便通知、隔離或撤銷機密。'
    ]
  ],
  // DOM 切分的变体（结尾句点单独成节点）与片段兜底（逐个节点匹配）
  ['Learn more about GitHub security risk assessments', ['了解 GitHub 安全风险评估', '瞭解 GitHub 安全性風險評估']],
  [
    'GitHub Actions and Artifact Attestations greatly simplify the journey to SLSA Level 3',
    ['GitHub 操作和产物证明可大大简化达到 SLSA 级别 3 的过程', 'GitHub 動作和成品證明可大幅簡化達成 SLSA 等級 3 的過程']
  ],
  ['empowers our developers', ['为我们的开发人员提供有力支持', '為我們的開發人員提供強大助力']],
  ['GitHub security risk assessments', ['GitHub 安全风险评估', 'GitHub 安全性風險評估']]
]

/** 常见问题长段答案：只断言关键译法（revoke 作“撤销”，easier / as they go 不漏译） */
const FAQ_PHRASE_CASES: readonly (readonly [string, Pair])[] = [
  [
    'GitHub Advanced Security (GHAS) encompasses GitHub’s application security products comprising GitHub Secret Protection and GitHub Code Security. GHAS adds cutting-edge tools for static analysis, software composition analysis, and secret scanning to the GitHub platform that developers already know and love. Unlike traditional application security packages that burden the software development toolchain with complex workflows that inhibit adoption, GHAS makes it easy for developers to find and fix vulnerabilities earlier in the software development life cycle.',
    ['更早、更轻松地发现并修复漏洞。', '更早、更輕鬆地找出並修正漏洞。']
  ],
  [
    'Unlike third-party security add-ons, GitHub Advanced Security operates entirely in the native GitHub workflows that developers already know and love. By making it easier for developers to remediate vulnerabilities as they go, GitHub Advanced Security frees time for security teams to focus on critical strategies that protect businesses, customers, and communities from application-based vulnerabilities.',
    ['GitHub 高级安全让开发人员能够更轻松地边开发边修复漏洞，', 'GitHub 進階安全性讓開發人員能更輕鬆地邊開發邊修復漏洞，']
  ],
  [
    'Unlike third-party security add-ons, GitHub’s supply chain features operate entirely in the native GitHub workflows that developers already know and love. By making it easier for developers to remediate vulnerabilities as they go, GitHub frees time for security teams to focus on critical strategies that protect businesses, customers, and communities from application-based vulnerabilities.',
    ['GitHub 让开发人员能够更轻松地边开发边修复漏洞，', 'GitHub 讓開發人員能更輕鬆地邊開發邊修復漏洞，']
  ],
  [
    'GitHub Secret Protection detects and prevents secret leaks continuously in real-time, proactively blocking sensitive credentials from being pushed to a repository with push protection. With a remarkably low false positive rate and approximately 150 service provider integrations, it enables rapid credential revocation and rotation, enhancing developer productivity.',
    ['快速撤销和轮换凭据', '快速撤銷和輪替認證資訊']
  ]
]

/** 其他文件已收录、这几页沿用的全局词条：本词典不重复收录 */
const EXISTING_CASES: readonly (readonly [string, Pair])[] = [
  ['GitHub Security', ['GitHub 安全', 'GitHub 安全性']],
  ['GitHub Advanced Security', ['GitHub 高级安全', 'GitHub 進階安全性']],
  ['Secret Protection', ['机密保护', '機密保護']],
  ['Code Security', ['代码安全', '程式碼安全性']],
  ['Frequently asked questions', ['常见问题', '常見問題']],
  ['Provider patterns', ['提供程序模式', '提供者模式']],
  ['Dependency graph', ['依赖项关系图', '相依性圖表']],
  ['See pricing', ['查看价格', '查看定價']],
  ['documentation', ['文档', '說明文件']]
]

/** 不收录：营销横幅（归 marketing.ts）、可能与用户内容同形的单词、数字与货币代码、品牌词 */
const NOT_ADDED: readonly string[] = [
  'Demo',
  '4.4M',
  'USD',
  'CodeQL',
  'DevSecOps',
  'Register virtually',
  'Day 1: Opening Keynote begins in'
]

/** 相邻文本节点拼成的整段（链接未渲染成元素）：按句查词条，句数 2～6 */
const JOINED_CASES: readonly (readonly [string, Pair])[] = [
  [
    'GitHub offers a range of features to help you understand the dependencies and secure the dependencies in your environment, and to secure your GitHub accounts and build system.',
    [
      'GitHub 提供一系列功能，帮助你了解并保护环境中的依赖项，以及保护你的 GitHub 帐户和构建系统。',
      'GitHub 提供一系列功能，協助你瞭解並保護環境中的相依項目，以及保護你的 GitHub 帳號和建置系統。'
    ]
  ],
  [
    'GitHub offers a range of features to help you understand the dependencies and secure the dependencies in your environment, and to secure your GitHub accounts and build system',
    [
      'GitHub 提供一系列功能，帮助你了解并保护环境中的依赖项，以及保护你的 GitHub 帐户和构建系统',
      'GitHub 提供一系列功能，協助你瞭解並保護環境中的相依項目，以及保護你的 GitHub 帳號和建置系統'
    ]
  ],
  [
    'You can export a software bill of materials or SBOM for your repository from the GitHub dependency graph. SBOMs allow transparency into your open source usage and help expose supply chain vulnerabilities, reducing supply chain risks.',
    [
      '你可以从 GitHub 依赖项关系图为存储库导出软件物料清单 (SBOM)。SBOM 让你清楚了解开源组件的使用情况，并帮助发现供应链漏洞，降低供应链风险。',
      '你可以從 GitHub 相依性圖表為儲存庫匯出軟體物料清單 (SBOM)。SBOM 能讓你清楚掌握開源元件的使用情形，並協助揭露供應鏈漏洞，降低供應鏈風險。'
    ]
  ],
  [
    'Most of GitHub’s supply chain features are available for free to all users. A select few advanced features are available to private repos only in GitHub Code Security. See pricing.',
    [
      'GitHub 的大多数供应链功能对所有用户免费开放。少数高级功能仅在 GitHub 代码安全中面向专用存储库提供。查看价格。',
      'GitHub 大部分的供應鏈功能都免費提供給所有使用者。少數進階功能僅在 GitHub 程式碼安全性中提供給私人儲存庫。查看定價。'
    ]
  ],
  [
    'The Code Security Risk Assessment is a free evaluation that analyzes repositories to identify potential code-level vulnerabilities and highlight areas where GitHub Code Security can help improve security posture. Learn more about GitHub security risk assessments.',
    [
      '代码安全风险评估是一项免费评估，它会分析存储库，找出潜在的代码级漏洞，并指出 GitHub 代码安全可以帮助改善安全态势的方面。了解 GitHub 安全风险评估。',
      '程式碼安全性風險評估是一項免費評估，會分析儲存庫以找出潛在的程式碼層級漏洞，並指出 GitHub 程式碼安全性可協助改善安全態勢的地方。瞭解 GitHub 安全性風險評估。'
    ]
  ]
]

/** 被链接拆开的字符串句型：{} 为元素槽位 */
const INLINE_CASES: readonly (readonly [string, Pair])[] = [
  ['{} empowers our developers', ['{}为我们的开发人员提供有力支持', '{}為我們的開發人員提供強大助力']],
  [
    'Yes. GitHub Advanced Security is available as an {} for Azure DevOps.',
    ['是的。GitHub 高级安全可作为 Azure DevOps 的{}使用。', '是的。GitHub 進階安全性可作為 Azure DevOps 的{}使用。']
  ],
  [
    'Yes. As with all GitHub products, {} for GitHub Advanced Security is publicly available.',
    ['是的。与所有 GitHub 产品一样，GitHub 高级安全的{}也是公开的。', '是的。與所有 GitHub 產品一樣，GitHub 進階安全性的{}也是公開的。']
  ],
  ['Yes! Please visit {} to learn more.', ['是的！请访问{}了解更多。', '是的！請造訪{}以瞭解詳情。']]
]

/** 客户案例句型的开头与结尾：中间是客户名槽位 */
const CUSTOMERS_HEAD = 'Read our {} to learn how customers like'
const CUSTOMERS_TAIL = 'use GitHub Advanced Security to secure applications and accelerate the software development lifecycle.'

/** 客户案例句型（正则）：客户名个数不定，and 前可有逗号 */
const CUSTOMER_CASES: readonly (readonly [string, Pair])[] = [
  [
    `${CUSTOMERS_HEAD} {} and {} ${CUSTOMERS_TAIL}`,
    [
      '阅读我们的{}，了解 {} 和 {} 等客户如何使用 GitHub 高级安全保护应用并加快软件开发生命周期。',
      '閱讀我們的{}，瞭解 {} 和 {} 等客戶如何使用 GitHub 進階安全性保護應用程式並加速軟體開發生命週期。'
    ]
  ],
  [
    `${CUSTOMERS_HEAD} {}, {}, and {} ${CUSTOMERS_TAIL}`,
    [
      '阅读我们的{}，了解 {}、{} 和 {} 等客户如何使用 GitHub 高级安全保护应用并加快软件开发生命周期。',
      '閱讀我們的{}，瞭解 {}、{} 和 {} 等客戶如何使用 GitHub 進階安全性保護應用程式並加速軟體開發生命週期。'
    ]
  ],
  [
    `${CUSTOMERS_HEAD} {}, {} and {} ${CUSTOMERS_TAIL}`,
    [
      '阅读我们的{}，了解 {}、{} 和 {} 等客户如何使用 GitHub 高级安全保护应用并加快软件开发生命周期。',
      '閱讀我們的{}，瞭解 {}、{} 和 {} 等客戶如何使用 GitHub 進階安全性保護應用程式並加速軟體開發生命週期。'
    ]
  ],
  [
    `${CUSTOMERS_HEAD} {}, {}, {}, and {} ${CUSTOMERS_TAIL}`,
    [
      '阅读我们的{}，了解 {}、{}、{} 和 {} 等客户如何使用 GitHub 高级安全保护应用并加快软件开发生命周期。',
      '閱讀我們的{}，瞭解 {}、{}、{} 和 {} 等客戶如何使用 GitHub 進階安全性保護應用程式並加速軟體開發生命週期。'
    ]
  ]
]

const CUSTOMER_MISSES: readonly string[] = [
  `${CUSTOMERS_HEAD} {} ${CUSTOMERS_TAIL}`,
  `Read our customer stories to learn how customers like {} and {} ${CUSTOMERS_TAIL}`,
  `${CUSTOMERS_HEAD} {} and {} use GitHub Advanced Security.`,
  `${CUSTOMERS_HEAD} {} or {} ${CUSTOMERS_TAIL}`
]

/** 标签页标题：[标题, 路径, 期望] */
const TITLE_CASES: readonly (readonly [string, string, Pair])[] = [
  ['GitHub Security', '/security', ['GitHub 安全', 'GitHub 安全性']],
  [
    'GitHub Advanced Security · Built-in protection for every repository',
    '/security/advanced-security',
    ['GitHub 高级安全 · 为每个存储库提供内置保护', 'GitHub 進階安全性 · 為每個儲存庫提供內建保護']
  ],
  [
    'GitHub Advanced Security · Built-in protection for every repository',
    '/security/plans',
    ['GitHub 高级安全 · 为每个存储库提供内置保护', 'GitHub 進階安全性 · 為每個儲存庫提供內建保護']
  ],
  ['GitHub Code Security', '/security/advanced-security/code-security', ['GitHub 代码安全', 'GitHub 程式碼安全性']],
  ['GitHub Secret Protection', '/security/advanced-security/secret-protection', ['GitHub 机密保护', 'GitHub 機密保護']],
  ['GitHub Supply Chain Security', '/security/advanced-security/software-supply-chain', ['GitHub 供应链安全', 'GitHub 供應鏈安全性']]
]

describe('安全产品介绍页作用域', () => {
  it.each(URLS)('%s 只有 common', url => {
    expect(detectPages(new URL(url))).toEqual(COMMON)
  })
})

describe('简繁词条一致', () => {
  it('static 键与 inline 句型相同', () => {
    expect(Object.keys(twSecurityPages.static ?? {})).toEqual(Object.keys(cnSecurityPages.static ?? {}))
    const sources = (dict: PageDictionary): string[] =>
      (dict.inline ?? []).map(([pattern]) => (typeof pattern === 'string' ? pattern : pattern.source))
    expect(sources(twSecurityPages)).toEqual(sources(cnSecurityPages))
  })
})

describe.each(LOCALES)('$name 安全产品介绍页词条', ({ index, dict, own, full }) => {
  it.each(STATIC_CASES)('本词典：%s', (source, pair) => {
    expect(own.translate(source, COMMON)).toBe(pair[index])
    expect(full.translate(source, COMMON)).toBe(pair[index])
  })

  it.each(FAQ_PHRASE_CASES)('常见问题关键译法：%s', (source, pair) => {
    expect(own.translate(source, COMMON)).toContain(pair[index])
    expect(full.translate(source, COMMON)).toContain(pair[index])
  })

  it.each(EXISTING_CASES)('沿用已有词条：%s', (source, pair) => {
    expect(dict.static).not.toHaveProperty([source])
    expect(full.translate(source, COMMON)).toBe(pair[index])
  })

  it.each(NOT_ADDED)('不收录：%s', source => {
    expect(own.translate(source, COMMON)).toBeUndefined()
  })

  it.each(JOINED_CASES)('整段按句匹配：%s', (source, pair) => {
    expect(full.translate(source, COMMON)).toBe(pair[index])
  })

  it.each(INLINE_CASES)('行内句：%s', (source, pair) => {
    expect(own.translateInline(patternKey(source), COMMON)).toBe(pair[index])
    expect(full.translateInline(patternKey(source), COMMON)).toBe(pair[index])
  })

  it.each(CUSTOMER_CASES)('客户案例句型：%s', (source, pair) => {
    expect(own.translateInline(patternKey(source), COMMON)).toBe(pair[index])
    expect(full.translateInline(patternKey(source), COMMON)).toBe(pair[index])
  })

  it.each(CUSTOMER_MISSES)('客户案例句型不匹配：%s', source => {
    expect(own.translateInline(patternKey(source), COMMON)).toBeUndefined()
  })

  it.each(TITLE_CASES)('标签页标题：%s（%s）', (title, pathname, pair) => {
    const translate = (text: string): string | undefined => full.translate(text, COMMON)
    expect(translateTitleText(title, translate, pathname)).toBe(pair[index])
  })
})

/** 去掉注释：客户端渲染时 React 的相邻文本节点之间没有服务端渲染插入的 <!-- --> */
function stripComments(node: Node): void {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.COMMENT_NODE) node.removeChild(child)
    else stripComments(child)
  }
}

/** 按 url 推断作用域，翻译 html；client 为 true 时按客户端渲染（相邻文本节点之间没有注释） */
function render(html: string, matcher: Matcher, url: string, client = false): Translator {
  document.body.innerHTML = html
  if (client) stripComments(document.body)
  const translator = createTranslator({ matcher, host: window, resolvePages: () => detectPages(new URL(url)) })
  translator.start()
  return translator
}

/** 元素的显示文字（空白折叠） */
function shown(id: string): string {
  return (document.getElementById(id)?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function label(id: string): string | null | undefined {
  return document.getElementById(id)?.getAttribute('aria-label')
}

/** /security 评价引言：产品名与其后文字是 <b> 内的相邻文本节点 */
const SECURITY_QUOTE_TEXT_HTML = `
  <figure><blockquote><span id="quote"><b>GitHub Advanced Security<!-- --> empowers our developers</b> to detect and fix vulnerabilities earlier, accelerating our time to market and boosting developer satisfaction.</span></blockquote>
    <figcaption><span id="name">Sample text</span><span id="role">Head of development services and tools at SAP</span></figcaption></figure>`

/** /security 评价引言：产品名单独成元素 */
const SECURITY_QUOTE_ELEMENT_HTML = `
  <blockquote><span id="quote"><b><span>GitHub Advanced Security</span> empowers our developers</b> to detect and fix vulnerabilities earlier, accelerating our time to market and boosting developer satisfaction.</span></blockquote>`

/** /security/advanced-security：评价引言、统计后的问答（答案被链接拆开） */
const ADVANCED_HTML = `
  <blockquote><span id="quote"><b>GitHub Advanced Security empowers our developers</b> to detect and fix vulnerabilities earlier, accelerating our time to market and boosting developer satisfaction.</span></blockquote>
  <figcaption><span id="role">Lead developer</span></figcaption>
  <details><summary><h4 id="q-azure">Can I use GitHub Advanced Security with Microsoft Azure DevOps?</h4></summary>
    <div><p id="a-azure">Yes. GitHub Advanced Security is available as an <a href="/security/advanced-security">add-on</a> for Azure DevOps.</p></div></details>
  <details><summary><h4 id="q-customers">Where can I find case studies and reference customers?</h4></summary>
    <div><p id="a-customers">Read our <a href="/customer-stories">customer stories</a> to learn how customers like <a href="/customer-stories/octo">Octo Corp</a>, <a href="/customer-stories/sample">Sample Labs</a>, and <a href="/customer-stories/hubot">Hubot Inc</a> use GitHub Advanced Security to secure applications and accelerate the software development lifecycle.</p></div></details>
  <details><summary><h4 id="q-docs">Can I review documentation before purchase?</h4></summary>
    <div><p id="a-docs">Yes. As with all GitHub products, <a href="https://docs.github.com">documentation</a> for GitHub Advanced Security is publicly available.</p></div></details>
  <details><summary><h4 id="q-services">Does GitHub offer consulting, training, and other deployment services?</h4></summary>
    <div><p id="a-services">Yes! Please visit <a href="/services">Expert Services</a> to learn more.</p></div></details>
  <div><p id="price-unit"><span>$19</span> <span id="per">per active committer/month</span></p></div>`

/** /security/advanced-security/code-security：统计、评价引言、风险评估问答（链接文字是相邻文本节点） */
const CODE_HTML = `
  <button type="button" id="play" aria-label="Play video. Thumbnail description: What is GitHub code security?"><span id="video-title">What is GitHub code security?</span></button>
  <div><p id="stat-1">28 min</p><p><span id="stat-1-text">From vulnerability detection to remediation</span></p></div>
  <div><p id="stat-2">3X</p><p><span id="stat-2-text">Faster remediation on average with Copilot Autofix</span></p></div>
  <blockquote><span id="quote"><b>Copilot Autofix streamlines security</b> by flagging vulnerabilities and suggesting fixes instantly, keeping code secure while freeing teams for strategic work.”</span></blockquote>
  <figcaption><span id="role">community manager of security at Otto GmbH &amp; Co. KGaA</span></figcaption>
  <a href="/security/advanced-security/code-security" id="modal" aria-label="Modal titled “Scan organization” showing a risk assessment setup with Secret Protection and Code Security selected, and Cancel and Continue buttons."><img alt="" src="data:,"></a>
  <details><summary><h4 id="q-risk">What is the code security risk assessment?</h4></summary>
    <div><p id="a-risk">The Code Security Risk Assessment is a free evaluation that analyzes repositories to identify potential code-level vulnerabilities and highlight areas where GitHub Code Security can help improve security posture. Learn more about <!-- -->GitHub security risk assessments<!-- -->.</p></div></details>`

/** /security/advanced-security/secret-protection：风险评估问答（三句 + 相邻文本节点） */
const SECRET_HTML = `
  <div><p id="stat">4.4M</p><p><span id="stat-text">Secrets prevented from leaking on GitHub in 2024</span></p></div>
  <details><summary><h4 id="q-risk">What is the secret risk assessment?</h4></summary>
    <div><p id="a-risk">The secret risk assessment provides a free, comprehensive overview of an organization’s secret leak footprint across its GitHub repositories. By analyzing repositories for exposed secrets, it helps admins and developers understand their exposure to potential security risks and offers actionable insights for remediation. Learn more about <!-- -->GitHub security risk assessments<!-- -->.</p></div></details>`

/** /security/advanced-security/software-supply-chain：问答答案由相邻文本节点组成（链接未渲染成元素） */
const SUPPLY_HTML = `
  <div><p id="a-features">GitHub offers a range of features to help you <!-- -->understand the dependencies and secure the dependencies in your environment<!-- -->, and to <!-- -->secure your GitHub accounts and build system<!-- -->.</p></div>
  <div><p id="a-slsa">Supply-chain Levels for Software Artifacts (SLSA)<!-- --> is a framework for improving the end-to-end integrity of a software artifact throughout its development lifecycle. It provides a comprehensive, step-by-step methodology for building integrity and provenance guarantees into your software supply chain. SLSA Level 3 signifies a significantly hardened software supply chain where builds are highly isolated, source code history is verified, and provenance is strictly controlled, providing a strong guarantee against tampering and ensuring the integrity of software artifacts. GitHub Actions and Artifact Attestations<!-- --> greatly simplify the journey to SLSA Level 3<!-- -->.</p></div>
  <div><p id="a-sbom">You can <!-- -->export a software bill of materials or SBOM for your repository<!-- --> from the GitHub dependency graph. SBOMs allow transparency into your open source usage and help expose supply chain vulnerabilities, reducing supply chain risks.</p></div>
  <div><p id="a-pricing">Most of GitHub’s supply chain features are available for free to all users. A select few advanced features are available to private repos only in GitHub Code Security. See <!-- -->pricing<!-- -->.</p></div>`

/** /security/plans：计划卡片与功能对比表 */
const PLANS_HTML = `
  <h2 id="pair">The perfect pair for complete protection</h2>
  <span id="addon">Add-on</span>
  <table>
    <thead><tr><th id="col-free">Free</th><th id="col-team">Team</th><th id="col-enterprise">Enterprise</th></tr></thead>
    <tbody>
      <tr><th><span id="row-push">Push protection</span><p id="row-push-text">Prevent secret exposures by proactively blocking secrets before they reach your code.</p></th>
        <td><svg aria-hidden="true"></svg><span class="sr-only" id="cell-yes">Included</span></td>
        <td><span class="sr-only" id="cell-no">Not included</span></td></tr>
    </tbody>
  </table>`

describe.each(LOCALES)('$name 安全产品介绍页', ({ index, full }) => {
  const t = (pair: Pair): string => pair[index]
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  const securityQuote: Pair = [
    'GitHub 高级安全为我们的开发人员提供有力支持，让他们能够更早地发现并修复漏洞，从而加快产品上市速度，提升开发人员满意度。',
    'GitHub 進階安全性為我們的開發人員提供強大助力，讓他們能更早找出並修正漏洞，加快產品上市速度，並提升開發人員滿意度。'
  ]

  it.each([false, true])('/security 评价引言：<b> 内相邻文本节点（客户端渲染 %s）', client => {
    translator = render(SECURITY_QUOTE_TEXT_HTML, full, SECURITY_URL, client)
    expect(shown('quote')).toBe(t(securityQuote))
    expect(shown('name')).toBe('Sample text')
    expect(shown('role')).toBe(t(['SAP 开发服务与工具负责人', 'SAP 開發服務和工具負責人']))
  })

  it('/security 评价引言：产品名单独成元素', () => {
    translator = render(SECURITY_QUOTE_ELEMENT_HTML, full, SECURITY_URL)
    expect(shown('quote')).toBe(t(securityQuote))
  })

  it('/security/advanced-security：评价引言与被链接拆开的答案', () => {
    translator = render(ADVANCED_HTML, full, ADVANCED_URL)
    expect(shown('quote')).toBe(t(securityQuote))
    expect(shown('role')).toBe(t(['首席开发人员', '首席開發人員']))
    expect(shown('q-azure')).toBe(
      t(['我可以将 GitHub 高级安全与 Microsoft Azure DevOps 一起使用吗？', '我可以搭配 Microsoft Azure DevOps 使用 GitHub 進階安全性嗎？'])
    )
    expect(shown('a-azure')).toBe(
      t(['是的。GitHub 高级安全可作为 Azure DevOps 的附加组件使用。', '是的。GitHub 進階安全性可作為 Azure DevOps 的附加元件使用。'])
    )
    expect(shown('a-customers')).toBe(
      t([
        '阅读我们的客户案例，了解 Octo Corp、Sample Labs 和 Hubot Inc 等客户如何使用 GitHub 高级安全保护应用并加快软件开发生命周期。',
        '閱讀我們的客戶案例，瞭解 Octo Corp、Sample Labs 和 Hubot Inc 等客戶如何使用 GitHub 進階安全性保護應用程式並加速軟體開發生命週期。'
      ])
    )
    expect(shown('a-docs')).toBe(
      t([
        '是的。与所有 GitHub 产品一样，GitHub 高级安全的文档也是公开的。',
        '是的。與所有 GitHub 產品一樣，GitHub 進階安全性的說明文件也是公開的。'
      ])
    )
    expect(shown('a-services')).toBe(t(['是的！请访问专家服务了解更多。', '是的！請造訪專家服務以瞭解詳情。']))
    expect(shown('per')).toBe(t(['每个活跃提交者/月', '每位活躍提交者/月']))
  })

  it('/security/advanced-security/code-security：统计、评价引言、风险评估', () => {
    translator = render(CODE_HTML, full, CODE_URL)
    expect(label('play')).toBe(t(['播放视频。缩略图说明：什么是 GitHub 代码安全？', '播放影片。縮圖說明：什麼是 GitHub 程式碼安全性？']))
    expect(shown('video-title')).toBe(t(['什么是 GitHub 代码安全？', '什麼是 GitHub 程式碼安全性？']))
    expect([shown('stat-1'), shown('stat-1-text')]).toEqual([
      t(['28 分钟', '28 分鐘']),
      t(['从发现漏洞到完成修复', '從偵測漏洞到完成修復'])
    ])
    expect([shown('stat-2'), shown('stat-2-text')]).toEqual([
      '3 倍',
      t(['Copilot 自动修复带来的平均修复提速', 'Copilot 自動修正帶來的平均修復加速'])
    ])
    expect(shown('quote')).toBe(
      t([
        'Copilot 自动修复简化了安全工作，它能即时标记漏洞并提出修复建议，在保障代码安全的同时，让团队腾出精力投入战略性工作。”',
        'Copilot 自動修正簡化了安全性工作，它能即時標記漏洞並提出修正建議，在確保程式碼安全的同時，讓團隊騰出心力投入策略性工作。」'
      ])
    )
    expect(shown('role')).toBe(t(['Otto GmbH & Co. KGaA 安全社区经理', 'Otto GmbH & Co. KGaA 安全性社群經理']))
    expect(label('modal')).toBe(
      t([
        '标题为“扫描组织”的对话框，显示已选择机密保护和代码安全的风险评估设置，以及“取消”和“继续”按钮。',
        '標題為「掃描組織」的對話方塊，顯示已選取機密保護和程式碼安全性的風險評估設定，以及取消和繼續按鈕。'
      ])
    )
    expect(shown('q-risk')).toBe(t(['什么是代码安全风险评估？', '什麼是程式碼安全性風險評估？']))
    expect(shown('a-risk')).toBe(t(JOINED_CASES[4]![1]))
  })

  it('/security/advanced-security/secret-protection：统计数字照原文、风险评估三句', () => {
    translator = render(SECRET_HTML, full, SECRET_URL)
    expect([shown('stat'), shown('stat-text')]).toEqual([
      '4.4M',
      t(['2024 年在 GitHub 上阻止泄露的机密', '2024 年在 GitHub 上成功阻止外洩的機密'])
    ])
    expect(shown('a-risk')).toBe(
      t([
        '机密风险评估免费提供组织在其 GitHub 存储库中机密泄露情况的全面概览。它通过分析存储库中暴露的机密，帮助管理员和开发人员了解自身面临的潜在安全风险，并提供可付诸行动的修复洞察。了解 GitHub 安全风险评估。',
        '機密風險評估會免費提供組織在其 GitHub 儲存庫中機密外洩情況的全面總覽。它會分析儲存庫中暴露的機密，協助管理員和開發人員瞭解自身面臨的潛在安全性風險，並提供可據以修復的實用洞察。瞭解 GitHub 安全性風險評估。'
      ])
    )
  })

  it.each([false, true])('/security/advanced-security/software-supply-chain：相邻文本节点的答案（客户端渲染 %s）', client => {
    translator = render(SUPPLY_HTML, full, SUPPLY_URL, client)
    expect(shown('a-features')).toBe(t(JOINED_CASES[0]![1]))
    expect(shown('a-slsa')).toBe(
      t([
        '软件产物供应链级别 (SLSA) 是一个框架，用于在软件产物的整个开发生命周期中提升其端到端完整性。它提供一套全面、循序渐进的方法，帮助你在软件供应链中建立完整性和来源保证。SLSA 级别 3 代表经过显著加固的软件供应链：构建高度隔离、源代码历史记录经过验证、来源受到严格控制，从而有力防范篡改，确保软件产物的完整性。GitHub 操作和产物证明可大大简化达到 SLSA 级别 3 的过程。',
        '軟體成品供應鏈等級 (SLSA) 是一套架構，用於在軟體成品的整個開發生命週期中提升其端對端完整性。它提供一套全面且循序漸進的方法，協助你在軟體供應鏈中建立完整性和來源保證。SLSA 等級 3 代表經過大幅強化的軟體供應鏈：建置高度隔離、原始碼歷史記錄經過驗證、來源受到嚴格控管，能有效防範竄改，確保軟體成品的完整性。GitHub 動作和成品證明可大幅簡化達成 SLSA 等級 3 的過程。'
      ])
    )
    expect(shown('a-sbom')).toBe(t(JOINED_CASES[2]![1]))
    expect(shown('a-pricing')).toBe(t(JOINED_CASES[3]![1]))
  })

  it('/security/plans：计划卡片与功能对比表', () => {
    translator = render(PLANS_HTML, full, PLANS_URL)
    expect(shown('pair')).toBe(t(['全面防护的完美组合', '全面防護的完美組合']))
    expect(shown('addon')).toBe(t(['附加组件', '附加元件']))
    expect([shown('col-free'), shown('col-team'), shown('col-enterprise')]).toEqual([
      t(['免费版', '免費版']),
      t(['团队', '團隊']),
      t(['企业', '企業'])
    ])
    expect(shown('row-push')).toBe(t(['推送保护', '推送保護']))
    expect(shown('row-push-text')).toBe(t(['在机密进入代码前主动拦截，防止机密泄露。', '在機密進入程式碼前主動攔截，防止機密外洩。']))
    expect([shown('cell-yes'), shown('cell-no')]).toEqual(['包含', '不包含'])
  })
})
