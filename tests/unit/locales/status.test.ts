import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { translateTitleText } from '../../../src/core/title'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import cnStatus from '../../../src/locales/zh-CN/status'
import { zhTW } from '../../../src/locales/zh-TW/index'
import twStatus from '../../../src/locales/zh-TW/status'

/** 期望译文：[简体, 繁体] */
type Pair = readonly [cn: string, tw: string]

/** www.githubstatus.com 的作用域（见 core/page.ts） */
const STATUS: readonly PageKey[] = ['common', 'status']
const HOST = 'www.githubstatus.com'

interface Locale {
  readonly name: string
  /** 期望译文在 Pair 中的下标 */
  readonly index: 0 | 1
  readonly dict: PageDictionary
  readonly bundle: LocaleBundle
  /** 只含本词典：检查词条本身 */
  readonly own: Matcher
  /** 完整语言包：检查页面上的实际效果（common 的词条也生效） */
  readonly full: Matcher
}

const LOCALES: readonly Locale[] = [
  {
    name: 'zh-CN',
    index: 0,
    dict: cnStatus,
    bundle: zhCN,
    own: createMatcher([['status', cnStatus]]),
    full: createMatcher(zhCN)
  },
  {
    name: 'zh-TW',
    index: 1,
    dict: twStatus,
    bundle: zhTW,
    own: createMatcher([['status', twStatus]]),
    full: createMatcher(zhTW)
  }
]

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, Pair])[]
  /** 反例：只用本词典不命中 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 标签页标题：页面名、可译的事件标题；译不了的事件标题保持原文
  {
    hits: [
      ['GitHub Status - Incident History', ['GitHub 状态 - 事件历史记录', 'GitHub 狀態 - 事件歷史記錄']],
      ['GitHub Status - Uptime History', ['GitHub 状态 - 正常运行时间历史记录', 'GitHub 狀態 - 正常運作時間歷史記錄']],
      [
        'GitHub Status - Incident with Actions, Issues, and Pull Requests',
        ['GitHub 状态 - 操作、议题和拉取请求故障', 'GitHub 狀態 - 動作、議題和拉取請求故障']
      ],
      [
        'GitHub Status - Disruption with some GitHub services',
        ['GitHub 状态 - 部分 GitHub 服务中断', 'GitHub 狀態 - 部分 GitHub 服務中斷']
      ],
      ['GitHub Status - Sample text', ['GitHub 状态 - Sample text', 'GitHub 狀態 - Sample text']]
    ],
    misses: ['GitHub Status', 'GitHub Status History - Atom Feed', 'Sample text - Incident History']
  },
  // 事件标题：Incident with <组件列表>
  {
    hits: [
      ['Incident with Actions, Issues, and Pull Requests', ['操作、议题和拉取请求故障', '動作、議題和拉取請求故障']],
      [
        'Incident with Git Operations, Issues, Actions and Pull Requests',
        ['Git 操作、议题、操作和拉取请求故障', 'Git 操作、議題、動作和拉取請求故障']
      ],
      ['Incident With Webhooks', ['Web 钩子故障', 'Web 鉤子故障']],
      ['Incident with Copilot AI Model Providers', ['Copilot AI 模型提供商故障', 'Copilot AI 模型提供者故障']]
    ],
    misses: [
      'Incident with Spark',
      'Incident with Actions Results',
      'Incident with Actions, we are investigating reports of degraded availability'
    ]
  },
  // 事件标题：Degradation with <组件列表>
  {
    hits: [
      ['Degradation with Webhooks, Pull Requests and Actions', ['Web 钩子、拉取请求和操作降级', 'Web 鉤子、拉取請求和動作降級']],
      ['Degradation With Copilot', ['Copilot 降级', 'Copilot 降級']]
    ],
    misses: ['Degradation with Gemini 3.8 Flash', 'Degradation in repos contents API']
  },
  // 事件页底部的受影响组件
  {
    hits: [
      [
        'This incident affected: API Requests, Issues, Actions, and Pages.',
        ['此事件影响了：API 请求、议题、操作和页面。', '此事件影響了：API 請求、議題、動作和頁面。']
      ],
      [
        'This incident affected: Copilot AI Model Providers.',
        ['此事件影响了：Copilot AI 模型提供商。', '此事件影響了：Copilot AI 模型提供者。']
      ],
      ['This scheduled maintenance affects: Codespaces.', ['此次计划维护影响：代码空间。', '此次排定維護影響：程式碼空間。']]
    ],
    misses: ['This incident affected: Sample text.', 'This incident affected: Actions']
  },
  // 组件说明按钮的 aria-label：名称表外的名称保持原文
  {
    hits: [
      ['More information about Git Operations', ['关于 Git 操作的更多信息', '關於 Git 操作的詳細資訊']],
      ['More information about Copilot', ['关于 Copilot 的更多信息', '關於 Copilot 的詳細資訊']],
      ['More information about Sample text', ['关于 Sample text 的更多信息', '關於 Sample text 的詳細資訊']]
    ],
    misses: ['More information about', 'Information about Git Operations']
  },
  // 组件组提示框的计数
  {
    hits: [
      ['2 components', ['2 个组件', '2 個元件']],
      ['1 component', ['1 个组件', '1 個元件']]
    ],
    misses: ['components', 'Two components']
  },
  // 提示框中的停机时长
  {
    hits: [
      ['1 hrs', ['1 小时', '1 小時']],
      ['0 mins', ['0 分钟', '0 分鐘']]
    ],
    misses: ['5 minutes', 'hrs']
  },
  // 短信订阅的国家/地区代码选项
  {
    hits: [
      ['Hong Kong (+852)', ['中国香港 (+852)', '香港 (+852)']],
      ['Australia/Cocos/Christmas Island (+61)', ['澳大利亚/科科斯群岛/圣诞岛 (+61)', '澳洲/科克斯群島/聖誕島 (+61)']],
      ['Korea, Republic of (+82)', ['韩国 (+82)', '南韓 (+82)']],
      ['Georgia (+995)', ['格鲁吉亚 (+995)', '喬治亞 (+995)']]
    ],
    misses: ['Atlantis (+999)', 'Hong Kong +852', 'Georgia']
  },
  // 更新模板：We are investigating reports of degraded … for <组件列表>（GitHub 原文不带句点）
  {
    hits: [
      [
        'We are investigating reports of degraded performance for Actions',
        ['我们正在调查有关操作性能降低的报告', '我們正在調查有關動作效能降低的回報']
      ],
      [
        'We are investigating reports of degraded availability for Actions, Pull Requests and Webhooks',
        ['我们正在调查有关操作、拉取请求和 Web 钩子可用性降低的报告', '我們正在調查有關動作、拉取請求和 Web 鉤子可用性降低的回報']
      ],
      [
        'We are investigating reports of degraded performance for Copilot AI Model Providers',
        ['我们正在调查有关 Copilot AI 模型提供商性能降低的报告', '我們正在調查有關 Copilot AI 模型提供者效能降低的回報']
      ]
    ],
    misses: [
      'We are investigating reports of degraded performance for Spark',
      'We are investigating reports of degraded performance for Actions.'
    ]
  },
  // 更新模板：<组件列表> is / are experiencing degraded …
  {
    hits: [
      ['Actions is experiencing degraded performance.', ['操作出现性能降低。', '動作出現效能降低。']],
      [
        'Issues and Pull Requests are experiencing degraded availability.',
        ['议题和拉取请求出现可用性降低。', '議題和拉取請求出現可用性降低。']
      ]
    ],
    misses: ['Actions is experiencing degraded performance', 'Spark is experiencing degraded performance.']
  },
  // 更新模板：<组件列表> is / are operating normally.
  {
    hits: [
      ['Webhooks is operating normally.', ['Web 钩子运行正常。', 'Web 鉤子運作正常。']],
      ['Actions and Pages are operating normally.', ['操作和页面运行正常。', '動作和頁面運作正常。']]
    ],
    misses: ['Spark is operating normally.', 'Actions is operating normally']
  },
  // 更新模板：The degradation affecting <组件列表> has been mitigated.
  {
    hits: [
      [
        'The degradation affecting Actions, Issues and Pull Requests has been mitigated.',
        ['影响操作、议题和拉取请求的降级问题已缓解。', '影響動作、議題和拉取請求的降級問題已緩解。']
      ]
    ],
    misses: ['The degradation affecting Spark has been mitigated.', 'The degradation affecting Actions has been mitigated']
  },
  // 更新模板：issues with service(s)（服务名不是组件时保持原文）
  {
    hits: [
      [
        'We are investigating reports of issues with service(s): Spark.',
        ['我们正在调查有关以下服务问题的报告：Spark。', '我們正在調查有關以下服務問題的回報：Spark。']
      ],
      [
        'We are investigating reports of issues with service(s): Actions, Pages and Webhooks.',
        ['我们正在调查有关以下服务问题的报告：操作、页面和 Web 钩子。', '我們正在調查有關以下服務問題的回報：動作、頁面和 Web 鉤子。']
      ]
    ],
    misses: [
      'We are investigating reports of issues with service(s): Spark',
      'We are investigating reports of issues with service(s): Spark. Sample text.'
    ]
  },
  // 合并到其他事件：链接保持原文
  {
    hits: [
      [
        'Please refer to the combined summary in this related incident: https://www.githubstatus.com/incidents/abc123',
        [
          '请参阅此相关事件中的综合摘要：https://www.githubstatus.com/incidents/abc123',
          '請參閱此相關事件中的綜合摘要：https://www.githubstatus.com/incidents/abc123'
        ]
      ]
    ],
    misses: [
      'Please refer to the combined summary in this related incident: Sample text',
      'Please refer to the combined summary in this related incident:'
    ]
  },
  // Copilot 模型可用性降低：模型名保持原文
  {
    hits: [
      [
        'We are experiencing degraded availability for the Model A model in Copilot products and IDE surfaces.',
        ['Copilot 产品和 IDE 中的 Model A 模型可用性降低。', 'Copilot 產品和 IDE 中的 Model A 模型可用性降低。']
      ],
      [
        'We are experiencing degraded availability for Model A, Model B, and Model C in Copilot products and IDE surfaces.',
        [
          'Copilot 产品和 IDE 中的 Model A、Model B 和 Model C 模型可用性降低。',
          'Copilot 產品和 IDE 中的 Model A、Model B 和 Model C 模型可用性降低。'
        ]
      ]
    ],
    misses: [
      'We are experiencing degraded availability for Copilot.',
      'We are experiencing degraded availability for Model A in Copilot products and IDE surfaces'
    ]
  },
  // Copilot 模型恢复
  {
    hits: [
      [
        'The issues with our upstream model provider have been resolved, and Model A is once again available in Copilot products and IDE surfaces.',
        [
          '上游模型提供商的问题已解决，Model A 已在 Copilot 产品和 IDE 中恢复可用。',
          '上游模型提供者的問題已解決，Model A 已在 Copilot 產品和 IDE 中恢復可用。'
        ]
      ],
      [
        'The issues with our upstream model provider have been mitigated, and Model A and Model B are once again available in Copilot products and IDE surfaces.',
        [
          '上游模型提供商的问题已缓解，Model A 和 Model B 已在 Copilot 产品和 IDE 中恢复可用。',
          '上游模型提供者的問題已緩解，Model A 和 Model B 已在 Copilot 產品和 IDE 中恢復可用。'
        ]
      ]
    ],
    misses: [
      'The issues with our upstream model provider have been resolved.',
      'The issues with our upstream model provider have been fixed, and Model A is once again available in Copilot products and IDE surfaces.'
    ]
  }
]

/** 本词典的代表词条（scoped） */
const SCOPED_CASES: readonly (readonly [string, Pair])[] = [
  ['Subscribe to Updates', ['订阅更新', '訂閱更新']],
  ['Subscribe via webhook', ['通过 Web 钩子订阅', '透過 Web 鉤子訂閱']],
  ['Close subscribe form', ['关闭订阅表单', '關閉訂閱表單']],
  ["Didn't receive the OTP?", ['没有收到验证码？', '沒有收到驗證碼？']],
  ['Webhook URL:', ['Web 钩子 URL：', 'Web 鉤子 URL：']],
  ['Atom Feed', ['Atom 订阅源', 'Atom 摘要']],
  ['All Systems Operational', ['所有系统运行正常', '所有系統正常運作']],
  ['Some services are degraded', ['部分服务降级', '部分服務降級']],
  ['Check GitHub Enterprise Cloud status by region:', ['按区域查看 GitHub 企业云状态：', '依區域查看 GitHub 企業雲端狀態：']],
  ['Workflows, Compute and Orchestration for GitHub Actions', ['GitHub 操作的工作流、计算和编排', 'GitHub 動作的工作流程、運算和協調流程']],
  ['Degraded Performance', ['性能降低', '效能降低']],
  ['No downtime recorded on this day.', ['当天没有停机记录。', '當天沒有停機記錄。']],
  ['Investigating', ['调查中', '調查中']],
  ['Scheduled', ['已计划', '已排定']],
  ['Powered by Atlassian Statuspage', ['由 Atlassian Statuspage 提供支持', '由 Atlassian Statuspage 提供支援']],
  ['Disruption with some GitHub services', ['部分 GitHub 服务中断', '部分 GitHub 服務中斷']],
  ['Codespaces Scheduled Maintenance', ['代码空间计划维护', '程式碼空間排定維護']],
  ['We are investigating reports of degraded performance.', ['我们正在调查有关性能降低的报告。', '我們正在調查有關效能降低的回報。']],
  [
    "We recommend choosing another model or selecting 'Auto' to continue using Copilot.",
    ['建议选择其他模型或选择“自动”以继续使用 Copilot。', '建議改用其他模型或選擇「自動」以繼續使用 Copilot。']
  ],
  ['October', ['10月', '10月']]
]

/** 多句正文：整段没有词条时逐句匹配 */
const SENTENCE_CASES: readonly (readonly [string, Pair])[] = [
  [
    'This incident has been resolved. Thank you for your patience and understanding as we addressed this issue. A detailed root cause analysis will be shared as soon as it is available.',
    [
      '此事件已解决。感谢你在我们处理此问题期间的耐心与理解。详细的根本原因分析完成后将尽快分享。',
      '此事件已解決。感謝你在我們處理此問題期間的耐心和體諒。詳細的根本原因分析完成後將盡快分享。'
    ]
  ],
  [
    'Actions is experiencing degraded performance. We are continuing to investigate.',
    ['操作出现性能降低。我们正在继续调查。', '動作出現效能降低。我們正在繼續調查。']
  ],
  [
    'The degradation affecting Actions has been mitigated. We are monitoring to ensure stability.',
    ['影响操作的降级问题已缓解。我们正在监控以确保稳定。', '影響動作的降級問題已緩解。我們正在監控以確保穩定。']
  ],
  [
    'We are investigating reports of degraded performance. We are continuing to investigate.',
    ['我们正在调查有关性能降低的报告。我们正在继续调查。', '我們正在調查有關效能降低的回報。我們正在繼續調查。']
  ],
  [
    'We are investigating reports of issues with service(s): Spark. We will continue to keep users updated on progress towards mitigation.',
    [
      '我们正在调查有关以下服务问题的报告：Spark。我们将持续向用户通报缓解进展。',
      '我們正在調查有關以下服務問題的回報：Spark。我們將持續向使用者通報緩解進度。'
    ]
  ],
  [
    "We are experiencing degraded availability for the Model A model in Copilot products and IDE surfaces. This is due to an issue with an upstream model provider. While we work with them to resolve the issue, we recommend choosing another model or selecting 'Auto' to continue using Copilot.",
    [
      'Copilot 产品和 IDE 中的 Model A 模型可用性降低。这是由于上游模型提供商出现问题。在我们与其合作解决问题期间，建议选择其他模型或选择“自动”以继续使用 Copilot。',
      'Copilot 產品和 IDE 中的 Model A 模型可用性降低。這是因為上游模型提供者發生問題。在我們與對方合作解決問題期間，建議改用其他模型或選擇「自動」以繼續使用 Copilot。'
    ]
  ]
]

/** common 已收录、本词典不重复收录的词条 */
const COMMON_ENTRIES: readonly string[] = [
  'GitHub Status',
  'Help',
  'Community',
  'Status',
  'Subscribe',
  'Email address:',
  'Contact support',
  'Privacy Policy',
  'Terms of Service',
  'Issues',
  'Actions',
  'Packages',
  'Codespaces',
  'Today',
  'Resolved',
  'Update',
  'Completed',
  'Previous page',
  'Next page'
]

/** 保持原文：主机名、产品名，以及 GitHub 页面脚本按英文查找的组件名 */
const KEPT_ENTRIES: readonly string[] = ['Visit www.githubstatus.com for more information', 'GitHub.com', 'Copilot', 'au.githubstatus.com']

/** 标签页标题：[标题, 路径, 译文] */
const TITLE_CASES: readonly (readonly [string, string, Pair])[] = [
  ['GitHub Status', '/', ['GitHub 状态', 'GitHub 狀態']],
  ['GitHub Status - Incident History', '/history', ['GitHub 状态 - 事件历史记录', 'GitHub 狀態 - 事件歷史記錄']],
  ['GitHub Status - Uptime History', '/uptime', ['GitHub 状态 - 正常运行时间历史记录', 'GitHub 狀態 - 正常運作時間歷史記錄']],
  [
    'GitHub Status - Incident with Actions, Issues, API Requests and Pull Requests',
    '/incidents/abc123',
    ['GitHub 状态 - 操作、议题、API 请求和拉取请求故障', 'GitHub 狀態 - 動作、議題、API 請求和拉取請求故障']
  ],
  [
    'GitHub Status - Codespaces Scheduled Maintenance',
    '/incidents/abc123',
    ['GitHub 状态 - 代码空间计划维护', 'GitHub 狀態 - 程式碼空間排定維護']
  ],
  ['GitHub Status - Sample text', '/incidents/abc123', ['GitHub 状态 - Sample text', 'GitHub 狀態 - Sample text']]
]

describe('status 作用域', () => {
  it.each([
    'https://www.githubstatus.com/',
    'https://www.githubstatus.com/history',
    'https://www.githubstatus.com/uptime',
    'https://www.githubstatus.com/incidents/abc123'
  ])('%s → common、status', url => {
    expect(detectPages(new URL(url))).toEqual(STATUS)
  })
})

describe.each(LOCALES)('$name status 正则词条', ({ index, dict, own, full }) => {
  it('每条正则都有测试用例，且锚定、不带 g / y 标志', () => {
    const rules = dict.regexp ?? []
    expect(rules).toHaveLength(REGEXP_CASES.length)
    for (const [pattern] of rules) {
      expect(pattern.source.startsWith('^')).toBe(true)
      expect(pattern.source.endsWith('$')).toBe(true)
      expect(pattern.global || pattern.sticky).toBe(false)
    }
  })

  it.each(REGEXP_CASES.flatMap(item => item.hits))('%s', (source, pair) => {
    expect(own.translate(source, STATUS)).toBe(pair[index])
    expect(full.translate(source, STATUS)).toBe(pair[index])
  })

  it('每组正例最先命中的都是对应位置的正则', () => {
    const rules = dict.regexp ?? []
    REGEXP_CASES.forEach(({ hits }, position) => {
      for (const [source] of hits) expect(rules.findIndex(([pattern]) => pattern.test(source))).toBe(position)
    })
  })

  it.each(REGEXP_CASES.flatMap(item => item.misses))('不命中：%s', source => {
    expect(own.translate(source, STATUS)).toBeUndefined()
  })
})

describe.each(LOCALES)('$name status 词条', ({ index, dict, own, full }) => {
  it('只有 scoped 词条：不影响 github.com', () => {
    expect(dict.static).toBeUndefined()
    expect(own.translate('Subscribe via webhook', ['common'])).toBeUndefined()
  })

  it.each(SCOPED_CASES)('%s', (source, pair) => {
    expect(dict.scoped?.[source]).toBe(pair[index])
    expect(full.translate(source, STATUS)).toBe(pair[index])
  })

  it.each(SENTENCE_CASES)('逐句匹配：%s', (source, pair) => {
    expect(full.translate(source, STATUS)).toBe(pair[index])
  })

  it.each(COMMON_ENTRIES)('common 已收录：%s', source => {
    expect(dict.scoped?.[source]).toBeUndefined()
    expect(own.translate(source, STATUS)).toBeUndefined()
    expect(full.translate(source, STATUS)).toBeDefined()
  })

  it.each(KEPT_ENTRIES)('保持原文：%s', source => {
    expect(full.translate(source, STATUS)).toBeUndefined()
  })

  it.each(TITLE_CASES)('标签页标题：%s', (title, pathname, pair) => {
    const translate = (text: string): string | undefined => full.translate(text, STATUS)
    expect(translateTitleText(title, translate, pathname, HOST)).toBe(pair[index])
  })
})

// ---------- DOM ----------

/** 页头与订阅下拉框（结构同 www.githubstatus.com 首页的服务端 HTML；表单令牌等属性已删） */
const HEADER_HTML = `
<div class="header">
  <a href="https://github.com" aria-label="GitHub Octicon logo" id="logo"><svg><title>GitHub Octicon logo</title></svg></a>
  <nav class="f4 list-style-none py-2 mt-2 mt-md-0">
    <a class="mr-3 mr-lg-4 py-2" href="https://help.github.com" id="nav-help">Help</a>
    <a class="mr-3 mr-lg-4 py-2" href="https://github.community" id="nav-community">Community</a>
    <a class="mr-3 py-2 text-gray " href="/" id="nav-status">Status</a>
  </nav>
  <nav class="f4 list-style-none py-2 text-md-right">
    <a class="py-2" href="https://github.com" id="nav-dotcom">GitHub.com</a>
  </nav>
</div>
<img src="data:," class="illo-mobile-header" alt="GitHub header" id="header-image">
<div class="updates-dropdown-container">
  <a href="#" id="show-updates-dropdown" class="show-updates-dropdown" aria-label="Subscribe to updates" role="button">
    <span class="subscribe-text-full" id="subscribe-full">Subscribe to Updates</span><span class="subscribe-text-short" id="subscribe-short">Subscribe</span>
  </a>
  <div class="updates-dropdown" id="updates-dropdown" role="dialog" aria-modal="false" aria-label="Subscribe to updates">
    <div class="updates-dropdown-nav nav-items-7" role="tablist" aria-label="Subscribe to updates">
        <a href="#updates-dropdown-email" aria-label="Subscribe via email" role="tab" id="updates-dropdown-email-btn">
          <span class="icon-container email"></span>
        </a>
        <a href="#updates-dropdown-sms" aria-label="Subscribe via SMS" role="tab" id="updates-dropdown-sms-btn">
          <span class="icon-container sms"></span>
        </a>
        <a href="#updates-dropdown-slack" aria-label="Subscribe via slack" role="tab" id="updates-dropdown-slack-btn">
          <span class="icon-container slack"></span>
        </a>
        <a href="#updates-dropdown-webhook" aria-label="Subscribe via webhook" role="tab" id="updates-dropdown-webhook-btn">
          <span class="icon-container webhook"></span>
        </a>
        <a href="#updates-dropdown-support" aria-label="Contact support" role="tab" id="updates-dropdown-support-btn">
          <span class="icon-container support"></span>
        </a>
        <a href="#updates-dropdown-atom" aria-label="Subscribe via RSS" role="tab" id="updates-dropdown-atom-btn">
          <span class="icon-container rss"></span>
        </a>
      <button aria-label="Close subscribe form" id="updates-dropdown-close-btn">
        x
      </button>
    </div>
    <div class="updates-dropdown-sections-container">
        <div class="updates-dropdown-section email" id="updates-dropdown-email" role="tabpanel">
          <div class="directions" id="email-directions">
            Get email notifications whenever GitHub <strong>creates</strong>,  <strong>updates</strong> or <strong>resolves</strong> an incident.
          </div>
          <form id="subscribe-form-email" action="/subscriptions/new-email" method="post">
              <label for="email" id="email-label">Email address:</label>
              <input name="email" id="email" type="text" class="full-width">
              <div class="opt-container-section" id="email-otp-container" style="display:none" >
                <label for="email-otp" id="email-otp-label">Enter OTP:</label>
                <input name="otp" id="email-otp" type="text" value="" class="prepend full-width">
                <p id="email-otp-timer">Resend OTP in: <span id="email-otp-countdown"></span> seconds </p>
                <p id="resend-email-otp">
                  Didn't receive the OTP?
                  <a href="#" id="resend-email-otp-btn" >Resend OTP </a>
                </p>
              </div>
                <input type="submit" value="Subscribe via Email" class="flat-button full-width g-recaptcha" id="subscribe-btn-email" data-disabled-text="Subscribing...">
                <div class="terms_and_privacy_information bottom small" id="email-terms"><div class="privacy_policy_information small">By subscribing you agree to our <a target="_blank" rel="noopener" class="accessible-link" href="https://help.github.com/articles/github-privacy-statement/">Privacy Policy</a>.</div> This site is protected by reCAPTCHA and the Google <a target="_blank" rel="noopener" class="accessible-link" href="https://policies.google.com/privacy">Privacy Policy</a> and <a target="_blank" rel="noopener" class="accessible-link" href="https://policies.google.com/terms">Terms of Service</a> apply.</div>
          </form>
        </div>
        <div class="updates-dropdown-section phone" id="updates-dropdown-sms" style="display:none" role="tabpanel">
          <div class="directions" id="sms-directions">
              Get text message notifications whenever GitHub <strong>creates</strong> or <strong>resolves</strong> an incident.
          </div>
          <form id="subscribe-form-sms" action="/subscriptions/new-sms" method="post">
            <div class="control-group">
              <div class="controls externalities-sms-container">
                <label for="phone-country" id="country-label">Country code:</label>
                <div id="phone-number-country-code" class="phone-country-wrapper">
                    <select name="phone_country" id="phone-country" class="phone-country"><option value="au">Australia/Cocos/Christmas Island (+61)</option>
<option value="hk">Hong Kong (+852)</option>
<option value="us">United States (+1)</option></select>
                </div>
                <label for="phone-number" id="phone-label">Phone number:</label>
                <input name="phone_number" id="phone-number" type="text" class="prepend full-width">
                <div class="opt-container-section" id="otp-container" style="display:none">
                  <a href="#" id="btn-subcriber-change-number">Change number</a>
                  <label for="otp">Enter OTP:</label>
                  <input name="otp" id="otp" type="text" class="prepend full-width">
                  <p id="timer">Resend OTP in: <span id="countdown">30</span> seconds </p>
                  <p id="resend">
                    Didn't receive the OTP?
                    <a href="#" id="resend-otp-btn" >Resend OTP </a>
                  </p>
                  </div>
              </div>
            </div>
              <input type="submit" value="Subscribe via Text Message" class="flat-button full-width g-recaptcha" id="subscribe-btn-sms" data-disabled-text="Subscribing...">
            <div class="terms_and_privacy_information bottom small" id="sms-terms">Message and data rates may apply. By subscribing you agree to our <a target="_blank" rel="noopener" class="accessible-link" href="https://help.github.com/articles/github-privacy-statement/">Privacy Policy</a>, the Atlassian <a target="_blank" rel="noopener" class="accessible-link" href="https://www.atlassian.com/legal/product-specific-terms#statuspage-specific-terms">Terms of Service</a>, and the Atlassian <a target="_blank" rel="noopener" class="accessible-link" href="https://www.atlassian.com/legal/privacy-policy">Privacy Policy</a>. This site is protected by reCAPTCHA and the Google <a target="_blank" rel="noopener" class="accessible-link" href="https://policies.google.com/privacy">Privacy Policy</a> and <a target="_blank" rel="noopener" class="accessible-link" href="https://policies.google.com/terms">Terms of Service</a> apply.</div>
          </form>
        </div>
        <div class="updates-dropdown-section slack" id="updates-dropdown-slack" style="display:none" role="tabpanel">
          <div class="directions" id="slack-directions">
            Get incident updates and maintenance status messages in Slack.
          </div>
          <a value="Subscribe via Slack" class="flat-button full-width" id="subscribe-btn-slack" href="https://subscriptions.statuspage.io/slack_authentication/kickoff">Subscribe via Slack</a>
          <div class="terms_and_privacy_information bottom small" id="slack-terms">By subscribing you acknowledge our <a target="_blank" rel="noopener" class="accessible-link" href="https://help.github.com/articles/github-privacy-statement/">Privacy Policy</a>. In addition, you agree to the Atlassian <a target="_blank" rel="noopener" class="accessible-link" href="https://www.atlassian.com/legal/cloud-terms-of-service">Cloud Terms of Service</a> and acknowledge Atlassian's <a target="_blank" rel="noopener" class="accessible-link" href="https://www.atlassian.com/legal/privacy-policy">Privacy Policy</a>.</div>
        </div>
        <div class="updates-dropdown-section webhook" id="updates-dropdown-webhook" style="display:none" role="tabpanel">
          <div class="directions" id="webhook-directions">
            Get webhook notifications whenever GitHub <strong>creates</strong> an incident, <strong>updates</strong> an incident, <strong>resolves</strong> an incident or <strong>changes</strong> a component status.
          </div>
          <form id="subscribe-form-webhook" action="/subscriptions/webhook.json" method="post">
            <div class="control-group">
              <div class="controls">
                <label for="endpoint-webhooks" id="webhook-label">Webhook URL:</label>
                <input type="text" name="endpoint" id="endpoint-webhooks" class="full-width" aria-describedby="url-help-block" />
                <p class="help-block" id="url-help-block">The URL we should send the webhooks to</p>
              </div>
            </div>
            <div class="control-group">
              <div class="controls">
                <label for="email-webhooks">Email address:</label>
                <input type="text" name="email" id="email-webhooks" class="full-width" aria-describedby="email-help-block" />
                <p class="help-block" id="email-help-block">We'll send you email if your endpoint fails</p>
              </div>
            </div>
              <input type="submit" value=Subscribe To Notifications class="flat-button full-width g-recaptcha" id="subscribe-btn-webhook" data-disabled-text="Subscribing...">
              <div class="terms_and_privacy_information bottom small" id="webhook-terms"><div class="privacy_policy_information small">By subscribing you agree to our <a target="_blank" rel="noopener" class="accessible-link" href="https://help.github.com/articles/github-privacy-statement/">Privacy Policy</a>.</div> This site is protected by reCAPTCHA and the Google <a target="_blank" rel="noopener" class="accessible-link" href="https://policies.google.com/privacy">Privacy Policy</a> and <a target="_blank" rel="noopener" class="accessible-link" href="https://policies.google.com/terms">Terms of Service</a> apply.</div>
          </form>
        </div>
        <div class="updates-dropdown-section support" id="updates-dropdown-support" style="display:none" role="tabpanel">
          Visit our <a href="https://github.com/support">support site</a>.
        </div>
        <div class="updates-dropdown-section atom" id="updates-dropdown-atom" role="tabpanel">
          Get the <a href="https://www.githubstatus.com/history.atom" target="_blank">Atom Feed</a> or <a href="https://www.githubstatus.com/history.rss" target="_blank">RSS Feed</a>.
        </div>
    </div>
  </div>
</div>`

/**
 * 首页组件区（GitHub 的页面脚本运行之后：清空 component-status、追加 status-msg、隐藏「Visit …」组件）、
 * 可用率条图例、提示框（脚本写入时长、计数、日期）、页脚（关于本站一段被移到「事件历史记录」链接之后）
 */
const COMPONENTS_HTML = `
<div class="container" role="main">
  <div class="page-status status-none">
    <h2 class="status font-large" id="page-status">
      All Systems Operational
    </h2>
    <span class="last-updated-stamp  font-small"></span>
  </div>
  <div class="components-section font-regular">
    <i class="component-status hidden major_outage"></i>
    <div class="components-uptime-link history-footer-link" id="uptime-link">
      Uptime over the past <var data-var="num" data-pluralize="90">90</var> days. <a href="/uptime">View historical uptime.</a>
    </div>
    <div class="components-container two-columns">
      <div class="component-container border-color">
        <div data-component-id="c1" class="component-inner-container status-green showcased" data-component-status="operational">
          <span class="name" role="heading" aria-level="2" id="name-git">
            Git Operations
          </span>
          <button type="button" class="tooltip-base tool" aria-label="More information about Git Operations" data-original-title="Performance of git clones, pulls, pushes, and associated operations" id="info-git">?</button>
          <span class="component-status " title=""></span>
          <button type="button" class="tool icon-indicator fa fa-check status-icon-button" aria-label="Operational" data-original-title="Operational" id="icon-git"></button>
          <div class="shared-partial uptime-90-days-wrapper">
            <div class="legend legend-group">
              <div class="legend-item light legend-item-date-range" id="legend-days"><span class="availability-time-line-legend-day-count">90</span> days ago</div>
              <div class="spacer"></div>
              <div class="legend-item legend-item-uptime-value legend-item-c1" id="legend-uptime"><span id="uptime-percent-c1">99.95</span> % uptime</div>
              <div class="spacer"></div>
              <div class="legend-item light legend-item-date-range" id="legend-today">Today</div>
            </div>
          </div>
          <span class="status-msg" id="msg-git">Normal</span>
        </div>
      </div>
      <div class="component-container border-color" style="display: none;">
        <div data-component-id="c2" class="component-inner-container status-green">
          <span class="name" role="heading" aria-level="2" id="name-visit">
            Visit www.githubstatus.com for more information
          </span>
          <span class="component-status " title=""></span>
          <span class="status-msg">Normal</span>
        </div>
      </div>
      <div class="component-container border-color">
        <div data-component-id="c3" class="component-inner-container status-yellow showcased">
          <span class="name" role="heading" aria-level="2" id="name-actions">
            Actions
          </span>
          <button type="button" class="tooltip-base tool" aria-label="More information about Actions" id="info-actions">?</button>
          <span class="component-status " title=""></span>
          <button type="button" class="tool icon-indicator fa fa-minus-square status-icon-button" aria-label="Degraded Performance" id="icon-actions"></button>
          <span class="status-msg" id="msg-actions">Degraded</span>
        </div>
      </div>
      <div class="component-container border-color">
        <div data-component-id="c4" class="component-inner-container status-red showcased">
          <span class="name" role="heading" aria-level="2" id="name-copilot">
            Copilot
          </span>
          <span class="component-status " title=""></span>
          <span class="status-msg" id="msg-copilot">Incident</span>
        </div>
      </div>
      <div class="component-container border-color">
        <div data-component-id="c5" class="component-inner-container status-blue showcased">
          <span class="name" role="heading" aria-level="2" id="name-codespaces">
            Codespaces
          </span>
          <span class="status-msg" id="msg-codespaces">Maintenance</span>
        </div>
      </div>
    </div>
  </div>
  <div id="uptime-tooltip">
    <div class="tooltip-box">
      <div class="tooltip-content">
        <div class="date" id="tooltip-date">28 Oct 2026</div>
        <div class="outages">
          <div class="outage-field major">
            <span class="label" id="label-major">Incident</span>
            <span class="value-hrs" id="major-hrs">1 hrs</span>
            <span class="value-mins" id="major-mins">5 mins</span>
          </div>
          <div class="outage-field partial">
            <span class="label" id="label-partial">Degradation</span>
            <span class="value-hrs">0 hrs</span>
            <span class="value-mins">30 mins</span>
          </div>
          <div class="no-outages-msg" id="no-outages">
            No downtime recorded on this day.
          </div>
          <div class="no-data-msg" id="no-data">
            No data exists for this day.
          </div>
          <div id="major-outage-group-count" class="outage-count">
            <i class="component-status page-colors text-color major_outage"></i>
            <span class="count">2 components</span>
            had a major outage.
          </div>
          <div id="partial-outage-group-count" class="outage-count">
            <i class="component-status page-colors text-color partial_outage"></i>
            <span class="count">1 component</span>
            had a partial outage.
          </div>
        </div>
        <div class="related-events">
          <h3 id="related-event-header">Related</h3>
          <ul id="related-events-list"><li class="related-event"><a class="related-event-link" href="/incidents/abc123" id="related-event">Incident with Actions</a></li></ul>
        </div>
        <div class="no-related-msg">
          <p id="no-related">No incidents or maintenance related to this downtime.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="tooltipster-base"><div class="tooltipster-content" id="tooltipster">Performance of git clones, pulls, pushes, and associated operations</div></div>
  <div class="page-footer border-color font-small">
      <a href="/history" class="history-footer-link" id="history-link"><span style="font-family:arial" aria-hidden="true">&larr;</span> Incident History</a>
    <p class="color-secondary font-regular" id="regions">
      Check GitHub Enterprise Cloud status by region:<br>- Australia: <a href="https://au.githubstatus.com">au.githubstatus.com</a><br>- EU: <a href="https://eu.githubstatus.com">eu.githubstatus.com</a><br>- Japan: <a href="https://jp.githubstatus.com">jp.githubstatus.com</a><br>- US: <a href="https://us.githubstatus.com/">us.githubstatus.com</a>
    </p>
    <span class="color-secondary powered-by"><a class="color-secondary" target="_blank" href="https://www.atlassian.com/software/statuspage" id="powered-by">Powered by Atlassian Statuspage</a></span>
  </div>
</div>
<div class="footer mt-6 border-top" role="contentinfo">
  <img src="data:," class="illo-mobile-footer" alt="GitHub footer" id="footer-image">
  <a href="https://github.com/" class="text-gray-dark" aria-label="GitHub text logo" id="footer-logo"><svg></svg></a>
</div>`

/** 首页未解决事件（span.ago 由页面脚本填入）与计划维护（含跨日的维护时段、<var>Posted on</var>） */
const ACTIVE_HTML = `
<div class="unresolved-incidents">
  <div class="unresolved-incident impact-minor">
    <div class="incident-title font-large">
      <a class="whitespace-pre-wrap actual-title with-ellipsis" href="/incidents/abc123" id="unresolved-title">Incident with Actions</a>
      <a data-toggle="modal" role="button" class="subscribe" href="#subscribe-modal-abc123" id="unresolved-subscribe">Subscribe</a>
    </div>
    <div class="updates font-regular">
        <div class="update">
          <strong id="unresolved-status">Investigating</strong> - <span class="whitespace-pre-wrap" id="unresolved-body">We are investigating reports of degraded performance for Actions</span>
          <br>
            <small id="unresolved-time"><span class="ago" data-datetime-unix="1793170937000"><var data-var="num">23</var> hours ago. </span>Oct <var data-var='date'>27</var>, <var data-var='year'>2026</var> - <var data-var='time'>08:01</var> UTC</small>
        </div>
    </div>
  </div>
</div>
<div class="scheduled-maintenances-container">
  <h2 class="font-largest" id="maintenance-heading">Scheduled Maintenance</h2>
    <div class="scheduled-maintenance">
      <h3 class="incident-title font-large border-color">
        <a href="/incidents/xyz789" class="color-primary" title="Codespaces Scheduled Maintenance" id="maintenance-link">
         <span class="whitespace-pre-wrap" id="maintenance-title">Codespaces Scheduled Maintenance</span>
        </a>
        <small class="pull-right" data-unix-time="1793185200" id="maintenance-window">
          Oct <var data-var='date'>28</var>, <var data-var='year'>2026</var> <var data-var='time'>04:00</var>-<var data-var='time'>06:00</var> UTC
        </small>
      </h3>
      <div class="updates-container font-regular">
          <div class="update">
            <span class="whitespace-pre-wrap"><p>Sample text</p></span>
            <br>
            <small id="maintenance-posted">
                <var data-var="posted-on">Posted on</var>
              <span class="ago" data-datetime-unix="1792602310000"><var data-var="num">7</var> days ago. </span>Oct <var data-var='date'>21</var>, <var data-var='year'>2026</var> - <var data-var='time'>10:05</var> UTC
            </small>
          </div>
      </div>
    </div>
    <div class="scheduled-maintenance">
      <h3 class="incident-title font-large border-color">
        <small class="pull-right" data-unix-time="1793242800" id="maintenance-window-days">
          Oct <var data-var='date'>28</var>, <var data-var='year'>2026</var> <var data-var='time'>23:00</var> - Oct <var data-var='date'>29</var>, <var data-var='year'>2026</var> <var data-var='time'>01:00</var> UTC
        </small>
      </h3>
    </div>
</div>`

/** 事件历史页（React 渲染，客户端渲染时相邻文本节点之间没有注释） */
const HISTORY_HTML = `
<div class="history-nav border-color">
  <ul>
    <li><a class="button current border-color" href="/history" aria-label="Incidents" aria-current="page" id="nav-incidents">Incidents</a></li>
    <li><a class="button border-color" href="/uptime" aria-label="Uptime" id="nav-uptime">Uptime</a></li>
  </ul>
</div>
<div class="history-backpage">
  <div class="history-header">
    <div class="component-selector"><span aria-expanded="false" class="show-filter color-secondary border-color" role="button" tabindex="0" id="filter">Filter Components</span></div>
    <div class="pagination-container"><div class="pagination"><a href="#back" class="previous-page border-color color-secondary" aria-label="Previous page" id="previous-page"><i class="left-arrow"></i></a><span class="current" id="range"><span>August</span><var data-var="start-date-year"> 2026</var> to <span>October</span><var data-var="end-date-year"> 2026</var></span><a href="#forward" class="next-page border-color color-secondary disabled" aria-label="Next page" id="next-page"><i class="right-arrow"></i></a></div></div>
  </div>
  <div class="months-container">
    <div class="month"><h4 class="month-title font-largest border-color" id="month-october">October <var data-var="year">2026</var></h4>
      <div class="month-content"><div class="incident-history"><div class="incident-list" id="incidents1">
        <div class="incident-data incident-container"><a href="/incidents/abc123" class="impact-minor incident-title font-large" id="title-1">Incident with Actions, Issues, API Requests and Pull Requests</a><div class="message incident-body color-primary" id="message-1">This incident has been resolved. Thank you for your patience and understanding as we addressed this issue. A detailed root cause analysis will be shared as soon as it is available.</div><div class="secondary font-small color-secondary" id="time-1">Oct <var data-var='date'>26</var>, <var data-var='time'>18:48</var> - <var data-var='time'>18:57</var> UTC</div></div>
        <div class="incident-data incident-container"><a href="/incidents/def456" class="impact-minor incident-title font-large" id="title-2">Sample text</a><div class="message incident-body color-primary" id="message-2">Sample text</div><div class="secondary font-small color-secondary" id="time-2">Oct <var data-var='date'>23</var>, <var data-var='time'>23:41</var> - Oct <var data-var='date'>24</var>, <var data-var='time'>00:23</var> UTC</div></div>
      </div><div aria-expanded="false" aria-controls="incidents1" class="expand-incidents font-small border-color color-secondary custom-focus" role="button" tabindex="0" id="expand"><span><var data-var="show-all">+ Show All</var><var data-var="num-incidents"> 20 </var><var data-var="incidents">Incidents</var></span></div></div></div>
    </div>
    <div class="month"><h4 class="month-title font-largest border-color" id="month-september">September <var data-var="year">2026</var></h4>
      <div class="month-content"><div class="incident-history"><div class="incident-list" id="incidents2"><span class="small" id="empty-month">No incidents reported for this month.</span></div><div class="expand-incidents" id="collapse"><span>- Collapse Incidents</span></div></div></div>
    </div>
  </div>
</div>
<div class="page-footer border-color font-small">
  <a href="/" aria-label="Back to current status" id="back-link"><span style="font-family:arial">&larr;</span> Current Status</a>
</div>`

/** 事件报告页：副标题、更新（span.ago 由页面脚本填入）、受影响组件、订阅事件弹窗 */
const INCIDENT_HTML = `
<div class="page-title">
  <h1 class="color-primary incident-name whitespace-pre-wrap impact-minor" id="incident-name">Incident with Actions</h1>
  <div class="font-largest color-secondary subheader " id="subheader">
        Incident

      Report for <a class="color-secondary" href="/">GitHub</a>
  </div>
</div>
<div class="incident-updates-container">
    <div class="row update-row">
      <h2 class="update-title span3 font-large" id="update-title-1">
        Resolved
      </h2>
      <div class="update-container span9">
        <div class="update-body font-regular">
          <span class="whitespace-pre-wrap" id="update-body-1">This incident has been resolved. Thank you for your patience and understanding as we addressed this issue. A detailed root cause analysis will be shared as soon as it is available.</span>
        </div>
        <div class="update-timestamp font-small color-secondary" id="posted-1">
          Posted <span class="ago" data-datetime-unix="1793088000000"><var data-var="num">21</var> hours ago. </span>Oct <var data-var='date'>27</var>, <var data-var='year'>2026</var> - <var data-var='time'>08:01</var> UTC
        </div>
      </div>
    </div>
    <div class="row update-row">
      <h2 class="update-title span3 font-large" id="update-title-2">
        Investigating
      </h2>
      <div class="update-container span9">
        <div class="update-body font-regular">
          <span class="whitespace-pre-wrap" id="update-body-2">We are investigating reports of degraded performance for Actions</span>
        </div>
        <div class="update-timestamp font-small color-secondary" id="posted-2">
          Posted <span class="ago" data-datetime-unix="1793000000000"><var data-var="num">1</var> day ago. </span>Oct <var data-var='date'>26</var>, <var data-var='year'>2026</var> - <var data-var='time'>18:48</var> UTC
        </div>
      </div>
    </div>
    <div class="components-affected font-small color-secondary border-color" id="affected">
        This incident affected: Actions, Issues, API Requests, and Pull Requests.
    </div>
</div>
<div class="modal hide fade modal-open-incident-subscribe" id="subscribe-modal-abc123" role="dialog">
  <form class="modal-content" id="subscribe-form-abc123" action="/subscriptions/incident.json" method="post">
    <div class="modal-header">
      <a href="#" data-dismiss="modal" class="close" aria-label="close" role="button" id="modal-close">×</a>
<h1 id="incident-subscription-dialog-header"> Subscribe to Incident </h1>
    </div>
    <div class="modal-body">
      <p style="margin-bottom:25px" id="incident-subscription-dialog-description">
        Subscribe to updates for <strong>Sample text</strong> via email and/or text message. You'll receive email notifications when incidents are updated, and text message notifications whenever GitHub <strong>creates</strong> or <strong>resolves</strong> an incident.
      </p>
        <div class="control-group">
          <label for="email-abc123" id="via-email">VIA EMAIL:</label>
            <div class="controls"><input type="text" name="email" id="email-abc123" class="full-width" /></div>
        </div>
        <div class="control-group">
          <label class="phone-country-code" for=phone-country-abc123 id="via-sms">VIA SMS:</label>
          <label class="sub-label" for="phone-number-abc123" id="enter-mobile">Enter mobile number</label>
          <div class="controls phone-number">
            <div class="flex-container">
              <input type="text" name="phone_number" id="phone-number-abc123" />
              <a class="btn-change-number-incident" id="btn-change-number-incident-abc123" style="display: none;" href="#">
                Edit number
</a>              <a class="btn-subcriber-send-otp" id="btn-subcriber-send-otp-abc123" style="display: none;" href="#">
                Send OTP
</a>            </div>
          </div>
          <div class="opt-container-section" id='otp-container-incident-abc123' style="display:none">
            <label class="sub-label" for="otp" id="enter-otp-sent">Enter the OTP sent</label>
            <div class="flex-container">
              <input name="otp" id='otp-field-abc123' type="text" class="prepend" disabled>
              <a class="resend-otp" id="resend-otp-abc123" style="display: none;" href="#">
                Resend OTP
</a>              <span class="timer-incident" id='timer-incident-abc123' style="display:none">&nbsp;in <span id='countdown-incident-abc123'>30</span> seconds</span>
            </div>
            <div class="info-row flex-container">
              <div class="info-icon"><svg></svg></div>
              <div id="sms-info">To receive SMS updates, please verify your number. To proceed with just email click ‘Subscribe’ </div>
            </div>
          </div>
        </div>
    </div>
    <div class="modal-footer incident-subscribe">
        <button name="button" type="submit" class="flat-button cpt-button incident-subscribe-btn-captcha" id="subscribe-btn-abc123">Subscribe to Incident</button>
    </div>
  </form>
</div>`

/** 计划维护的事件页：<var>Scheduled for</var> 副标题；完成后的副标题 */
const MAINTENANCE_HTML = `
<div class="font-largest color-secondary subheader scheduled-for" id="scheduled-for">
    <var data-var="scheduled-for">Scheduled for</var> Oct <var data-var='date'>28</var>, <var data-var='time'>04:00</var> - <var data-var='time'>06:00</var> UTC
</div>
<div class="font-largest color-secondary subheader scheduled-for" id="scheduled-for-days">
    <var data-var="scheduled-for">Scheduled for</var> Oct <var data-var='date'>28</var>, <var data-var='time'>23:00</var> - Oct <var data-var='date'>29</var>, <var data-var='time'>01:00</var> UTC
</div>
<h2 class="update-title span3 font-large" id="maintenance-update">
  In progress
</h2>
<div class="components-affected font-small color-secondary border-color" id="maintenance-affected">
    This scheduled maintenance affects: Codespaces.
</div>
<div class="font-largest color-secondary subheader " id="maintenance-report">
        Scheduled Maintenance

      Report for <a class="color-secondary" href="/">GitHub</a>
</div>`

/** 正常运行时间页（React 渲染）：组件选择框、月份标题、可用率条提示框 */
const UPTIME_HTML = `
<div class="uptime-calendar">
  <div class="uptime-header">
    <div class="component-selector"><div class="select"><input aria-label="Select Component" id="select-component"><span aria-label="open" id="select-open"></span></div></div>
  </div>
  <div class="uptime-calendar-display">
    <div class="calendar-month"><div class="month-header"><h2 class="month-name" id="month-name">September <var data-var="year">2026</var></h2><small class="month-uptime" id="month-uptime">99.95%</small></div></div>
    <div id="uptime-tooltip"><div class="tooltip-box"><div class="tooltip-content"><p class="date" id="react-date">28 Oct 2026</p>
      <div class="outages"><div id="react-group-count" class="outage-count"><i class="component-status page-colors text-color major_outage"></i><span class="count">2 components</span> had a major outage.</div></div>
    </div></div></div>
  </div>
</div>`

function text(selector: string): string {
  return (document.querySelector(selector)?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function attribute(selector: string, name: string): string | null | undefined {
  return document.querySelector(selector)?.getAttribute(name)
}

/** 等待变动回调处理完 */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** 客户端渲染：React 把相邻的文字子节点渲染成相邻文本节点（服务端渲染时以注释隔开） */
function splitTexts(selector: string, parts: readonly string[]): void {
  const element = document.querySelector(selector)!
  const anchor = element.firstChild
  for (const part of parts) element.insertBefore(document.createTextNode(part), anchor)
  anchor?.remove()
}

describe.each(LOCALES)('$name status 页面 DOM', ({ index, bundle, full }) => {
  const t = (pair: Pair): string => pair[index]
  /** 浏览器本地时区不是 UTC（测试时区 GMT+8，见 vitest 配置）时时刻后写的时区 */
  const utc = index === 0 ? ' (UTC)' : ' [UTC]'
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function start(matcher: Matcher = full): void {
    translator = createTranslator({ matcher, host: window, resolvePages: () => STATUS })
    translator.start()
  }

  function render(html: string, matcher: Matcher = full): void {
    document.body.innerHTML = html
    start(matcher)
  }

  it('页头与订阅下拉框：导航、按钮与选项卡的 aria-label、提交按钮', () => {
    render(HEADER_HTML)
    expect(attribute('#logo', 'aria-label')).toBe(t(['GitHub Octicon 徽标', 'GitHub Octicon 標誌']))
    expect([text('#nav-help'), text('#nav-community'), text('#nav-status'), text('#nav-dotcom')]).toEqual([
      t(['帮助', '說明']),
      t(['社区', '社群']),
      t(['状态', '狀態']),
      'GitHub.com'
    ])
    // alt 不是可翻译属性（core/ignore 的 TRANSLATABLE_ATTRIBUTES）
    expect(attribute('#header-image', 'alt')).toBe('GitHub header')
    expect(attribute('#show-updates-dropdown', 'aria-label')).toBe(t(['订阅更新', '訂閱更新']))
    expect([text('#subscribe-full'), text('#subscribe-short')]).toEqual([t(['订阅更新', '訂閱更新']), t(['订阅', '訂閱'])])
    expect(attribute('[role="tablist"]', 'aria-label')).toBe(t(['订阅更新', '訂閱更新']))
    expect([...document.querySelectorAll('[role="tab"]')].map(tab => tab.getAttribute('aria-label'))).toEqual(
      index === 0
        ? ['通过电子邮件订阅', '通过短信订阅', '通过 Slack 订阅', '通过 Web 钩子订阅', '联系支持', '通过 RSS 订阅']
        : ['透過電子郵件訂閱', '透過簡訊訂閱', '透過 Slack 訂閱', '透過 Web 鉤子訂閱', '聯絡支援團隊', '透過 RSS 訂閱']
    )
    expect(attribute('#updates-dropdown-close-btn', 'aria-label')).toBe(t(['关闭订阅表单', '關閉訂閱表單']))
    expect(text('#updates-dropdown-close-btn')).toBe('x')
    expect(attribute('#subscribe-btn-email', 'value')).toBe(t(['通过电子邮件订阅', '透過電子郵件訂閱']))
    expect(attribute('#subscribe-btn-sms', 'value')).toBe(t(['通过短信订阅', '透過簡訊訂閱']))
    // value=Subscribe To Notifications 没加引号：value 只有 Subscribe
    expect(attribute('#subscribe-btn-webhook', 'value')).toBe(t(['订阅', '訂閱']))
    expect(text('#subscribe-btn-slack')).toBe(t(['通过 Slack 订阅', '透過 Slack 訂閱']))
  })

  it('订阅下拉框：邮件、短信、Web 钩子的方式说明（加粗动词是槽位）', () => {
    render(HEADER_HTML)
    expect(text('#email-directions')).toBe(
      t(['每当 GitHub 创建、更新或解决事件时，接收电子邮件通知。', '每當 GitHub 建立、更新或解決事件時，接收電子郵件通知。'])
    )
    expect(text('#sms-directions')).toBe(
      t(['每当 GitHub 创建或解决事件时，接收短信通知。', '每當 GitHub 建立或解決事件時，接收簡訊通知。'])
    )
    expect(text('#webhook-directions')).toBe(
      t([
        '每当 GitHub 创建事件、更新事件、解决事件或更改组件状态时，接收 Web 钩子通知。',
        '每當 GitHub 建立事件、更新事件、解決事件或變更元件狀態時，接收 Web 鉤子通知。'
      ])
    )
    expect(text('#slack-directions')).toBe(t(['在 Slack 中接收事件更新和维护状态消息。', '在 Slack 中接收事件更新和維護狀態訊息。']))
  })

  it('订阅下拉框：表单标签、验证码倒计时、国家/地区代码、帮助文字', async () => {
    render(HEADER_HTML)
    expect(text('#email-label')).toBe(t(['电子邮件地址：', '電子郵件地址：']))
    expect(text('#email-otp-label')).toBe(t(['输入验证码：', '輸入驗證碼：']))
    expect(text('#resend-email-otp')).toBe(t(['没有收到验证码？重新发送验证码', '沒有收到驗證碼？重新傳送驗證碼']))
    expect(text('#timer')).toBe(t(['30 秒后可重新发送验证码', '30 秒後可重新傳送驗證碼']))
    // 页面脚本倒计时时改写数字
    document.querySelector('#email-otp-countdown')!.textContent = '29'
    await settle()
    expect(text('#email-otp-timer')).toBe(t(['29 秒后可重新发送验证码', '29 秒後可重新傳送驗證碼']))
    expect(text('#country-label')).toBe(t(['国家/地区代码：', '國碼：']))
    expect([...document.querySelectorAll('#phone-country option')].map(option => option.textContent)).toEqual(
      index === 0
        ? ['澳大利亚/科科斯群岛/圣诞岛 (+61)', '中国香港 (+852)', '美国 (+1)']
        : ['澳洲/科克斯群島/聖誕島 (+61)', '香港 (+852)', '美國 (+1)']
    )
    expect(text('#phone-label')).toBe(t(['电话号码：', '電話號碼：']))
    expect(text('#btn-subcriber-change-number')).toBe(t(['更改号码', '變更號碼']))
    expect(text('#webhook-label')).toBe(t(['Web 钩子 URL：', 'Web 鉤子 URL：']))
    expect(text('#url-help-block')).toBe(t(['接收 Web 钩子的 URL', '接收 Web 鉤子的 URL']))
    expect(text('#email-help-block')).toBe(t(['端点失败时，我们会向你发送电子邮件', '端點失敗時，我們會傳送電子郵件給你']))
  })

  it('订阅下拉框：三种条款与隐私说明', () => {
    render(HEADER_HTML)
    const captcha = t([
      '本网站受 reCAPTCHA 保护，并适用 Google 隐私政策和服务条款。',
      '本網站受 reCAPTCHA 保護，並適用 Google 隱私權政策和服務條款。'
    ])
    const agree = t(['订阅即表示你同意我们的隐私政策。', '訂閱即表示你同意我們的隱私權政策。'])
    expect(text('#email-terms')).toBe(agree + captcha)
    expect(text('#webhook-terms')).toBe(agree + captcha)
    expect(text('#sms-terms')).toBe(
      t([
        '可能会产生短信和数据流量费用。订阅即表示你同意我们的隐私政策、Atlassian 服务条款和 Atlassian 隐私政策。',
        '可能需支付簡訊和資料傳輸費用。訂閱即表示你同意我們的隱私權政策、Atlassian 服務條款和 Atlassian 隱私權政策。'
      ]) + captcha
    )
    expect(text('#slack-terms')).toBe(
      t([
        '订阅即表示你已知悉我们的隐私政策。此外，你同意 Atlassian 云服务条款，并已知悉 Atlassian 的隐私政策。',
        '訂閱即表示你已知悉我們的隱私權政策。此外，你同意 Atlassian 雲端服務條款，並已知悉 Atlassian 的隱私權政策。'
      ])
    )
  })

  it('订阅下拉框：支持网站与订阅源', () => {
    render(HEADER_HTML)
    expect(text('#updates-dropdown-support')).toBe(t(['访问我们的支持网站。', '造訪我們的支援網站。']))
    expect(text('#updates-dropdown-atom')).toBe(t(['获取 Atom 订阅源或 RSS 订阅源。', '取得 Atom 摘要或 RSS 摘要。']))
  })

  it('首页组件区：总状态、组件名与状态、说明按钮、可用率条图例', () => {
    render(COMPONENTS_HTML)
    expect(text('#page-status')).toBe(t(['所有系统运行正常', '所有系統正常運作']))
    expect(text('#uptime-link')).toBe(
      t(['过去 90 天的正常运行时间。查看历史正常运行时间。', '過去 90 天的正常運作時間。查看歷史正常運作時間。'])
    )
    expect([text('#name-git'), text('#name-actions'), text('#name-copilot'), text('#name-codespaces')]).toEqual(
      index === 0 ? ['Git 操作', '操作', 'Copilot', '代码空间'] : ['Git 操作', '動作', 'Copilot', '程式碼空間']
    )
    // GitHub 的页面脚本按这句英文隐藏该组件
    expect(text('#name-visit')).toBe('Visit www.githubstatus.com for more information')
    expect(attribute('#info-git', 'aria-label')).toBe(t(['关于 Git 操作的更多信息', '關於 Git 操作的詳細資訊']))
    expect(attribute('#info-actions', 'aria-label')).toBe(t(['关于操作的更多信息', '關於動作的詳細資訊']))
    expect(attribute('#icon-git', 'aria-label')).toBe(t(['正常运行', '正常運作']))
    expect(attribute('#icon-actions', 'aria-label')).toBe(t(['性能降低', '效能降低']))
    expect([text('#msg-git'), text('#msg-actions'), text('#msg-copilot'), text('#msg-codespaces')]).toEqual(
      index === 0 ? ['正常', '降级', '故障', '维护中'] : ['正常', '已降級', '故障', '維護中']
    )
    expect([text('#legend-days'), text('#legend-uptime'), text('#legend-today')]).toEqual([
      '90 天前',
      t(['99.95% 正常运行时间', '99.95% 正常運作時間']),
      '今天'
    ])
    expect(text('#tooltipster')).toBe(t(['git 克隆、拉取、推送及相关操作的性能', 'git 複製、拉取、推送和相關操作的效能']))
  })

  it('首页可用率条提示框：日期、停机时长、组件组计数、相关事件', () => {
    render(COMPONENTS_HTML)
    expect(text('#tooltip-date')).toBe('2026年10月28日')
    expect([text('#label-major'), text('#major-hrs'), text('#major-mins'), text('#label-partial')]).toEqual(
      index === 0 ? ['故障', '1 小时', '5 分钟', '降级'] : ['故障', '1 小時', '5 分鐘', '降級']
    )
    expect(text('#no-outages')).toBe(t(['当天没有停机记录。', '當天沒有停機記錄。']))
    expect(text('#no-data')).toBe(t(['当天没有数据。', '當天沒有資料。']))
    expect(text('#major-outage-group-count')).toBe(t(['2 个组件出现严重中断。', '2 個元件發生嚴重中斷。']))
    expect(text('#partial-outage-group-count')).toBe(t(['1 个组件出现部分中断。', '1 個元件發生部分中斷。']))
    expect(text('#related-event-header')).toBe(t(['相关事件', '相關事件']))
    expect(text('#related-event')).toBe(t(['操作故障', '動作故障']))
    expect(text('#no-related')).toBe(t(['没有与此次停机相关的事件或维护。', '沒有與此次停機相關的事件或維護。']))
  })

  it('首页页脚：事件历史记录链接、按区域查看状态、Powered by', () => {
    render(COMPONENTS_HTML)
    expect(text('#history-link')).toBe(t(['← 事件历史记录', '← 事件歷史記錄']))
    expect(text('#regions')).toBe(
      t([
        '按区域查看 GitHub 企业云状态：- 澳大利亚：au.githubstatus.com- 欧盟：eu.githubstatus.com- 日本：jp.githubstatus.com- 美国：us.githubstatus.com',
        '依區域查看 GitHub 企業雲端狀態：- 澳洲：au.githubstatus.com- 歐盟：eu.githubstatus.com- 日本：jp.githubstatus.com- 美國：us.githubstatus.com'
      ])
    )
    expect(text('#powered-by')).toBe(t(['由 Atlassian Statuspage 提供支持', '由 Atlassian Statuspage 提供支援']))
    expect(attribute('#footer-logo', 'aria-label')).toBe(t(['GitHub 文字徽标', 'GitHub 文字標誌']))
    expect(attribute('#footer-image', 'alt')).toBe('GitHub footer')
  })

  it('首页未解决事件：标题、状态、模板正文，只有 span.ago 的时间戳', () => {
    render(ACTIVE_HTML)
    expect(text('#unresolved-title')).toBe(t(['操作故障', '動作故障']))
    expect(text('#unresolved-subscribe')).toBe(t(['订阅', '訂閱']))
    expect(text('#unresolved-status')).toBe(t(['调查中', '調查中']))
    expect(text('#unresolved-body')).toBe(t(['我们正在调查有关操作性能降低的报告', '我們正在調查有關動作效能降低的回報']))
    // 年份不能当作起始时刻
    expect(text('#unresolved-time')).toBe(t([`23 小时前。10月27日，2026 年 08:01${utc}`, `23 小時前。10月27日，2026 年 08:01${utc}`]))
  })

  it('首页计划维护：标题、维护时段（含跨日）、<var>Posted on</var> 的发布时间', () => {
    render(ACTIVE_HTML)
    expect(text('#maintenance-heading')).toBe(t(['计划维护', '排定維護']))
    expect(text('#maintenance-title')).toBe(t(['代码空间计划维护', '程式碼空間排定維護']))
    expect(attribute('#maintenance-link', 'title')).toBe(t(['代码空间计划维护', '程式碼空間排定維護']))
    expect(text('#maintenance-window')).toBe(`10月28日，2026 年 04:00-06:00${utc}`)
    expect(text('#maintenance-window-days')).toBe(`10月28日，2026 年 23:00 - 10月29日，2026 年 01:00${utc}`)
    // <var> 里的 Posted on 引擎不处理
    expect(text('#maintenance-posted')).toBe(
      t([`Posted on 7 天前。10月21日，2026 年 10:05${utc}`, `Posted on 7 天前。10月21日，2026 年 10:05${utc}`])
    )
  })

  it('事件历史页：导航、筛选、分页、月份标题、事件标题与正文、单日与跨日的起止时间', () => {
    render(HISTORY_HTML)
    expect([text('#nav-incidents'), text('#nav-uptime')]).toEqual([t(['事件', '事件']), t(['正常运行时间', '正常運作時間'])])
    expect([attribute('#nav-incidents', 'aria-label'), attribute('#nav-uptime', 'aria-label')]).toEqual([
      t(['事件', '事件']),
      t(['正常运行时间', '正常運作時間'])
    ])
    expect(text('#filter')).toBe(t(['筛选组件', '篩選元件']))
    expect(attribute('#previous-page', 'aria-label')).toBe(t(['上一页', '上一頁']))
    expect(attribute('#next-page', 'aria-label')).toBe(t(['下一页', '下一頁']))
    expect(text('#range')).toBe('8月 2026 至 10月 2026')
    expect([text('#month-october'), text('#month-september')]).toEqual(['10月 2026', '9月 2026'])
    expect(text('#title-1')).toBe(t(['操作、议题、API 请求和拉取请求故障', '動作、議題、API 請求和拉取請求故障']))
    expect(text('#message-1')).toBe(
      t([
        '此事件已解决。感谢你在我们处理此问题期间的耐心与理解。详细的根本原因分析完成后将尽快分享。',
        '此事件已解決。感謝你在我們處理此問題期間的耐心和體諒。詳細的根本原因分析完成後將盡快分享。'
      ])
    )
    expect(text('#time-1')).toBe(`10月26日 18:48 - 18:57${utc}`)
    // 工程师写的标题、正文保持原文
    expect([text('#title-2'), text('#message-2')]).toEqual(['Sample text', 'Sample text'])
    expect(text('#time-2')).toBe(`10月23日 23:41 - 10月24日 00:23${utc}`)
    // 整句在 <var> 里
    expect(text('#expand')).toBe('+ Show All 20 Incidents')
    expect(text('#empty-month')).toBe(t(['当月没有报告事件。', '當月沒有回報事件。']))
    expect(text('#collapse')).toBe(t(['- 收起事件', '- 摺疊事件']))
    expect(text('#back-link')).toBe(t(['← 当前状态', '← 目前狀態']))
    expect(attribute('#back-link', 'aria-label')).toBe(t(['返回当前状态', '返回目前狀態']))
  })

  it('正常运行时间页：React 客户端渲染的相邻文本节点', () => {
    document.body.innerHTML = UPTIME_HTML
    splitTexts('#month-name', ['September', ' '])
    splitTexts('#react-group-count .count', ['2', ' ', 'components'])
    const host = document.querySelector('#react-group-count')!
    host.lastChild?.remove()
    for (const part of [' had a ', 'major', ' outage.']) host.appendChild(document.createTextNode(part))
    start()
    expect(text('#month-name')).toBe('9月 2026')
    expect(text('#react-group-count')).toBe(t(['2 个组件出现严重中断。', '2 個元件發生嚴重中斷。']))
  })

  it('事件报告页：副标题、更新状态与正文、发布时间、受影响组件', () => {
    render(INCIDENT_HTML)
    expect(text('#incident-name')).toBe(t(['操作故障', '動作故障']))
    expect(text('#subheader')).toBe(t(['GitHub 事件报告', 'GitHub 事件報告']))
    expect([text('#update-title-1'), text('#update-title-2')]).toEqual([t(['已解决', '已解決']), t(['调查中', '調查中'])])
    expect(text('#update-body-1')).toBe(
      t([
        '此事件已解决。感谢你在我们处理此问题期间的耐心与理解。详细的根本原因分析完成后将尽快分享。',
        '此事件已解決。感謝你在我們處理此問題期間的耐心和體諒。詳細的根本原因分析完成後將盡快分享。'
      ])
    )
    expect(text('#update-body-2')).toBe(t(['我们正在调查有关操作性能降低的报告', '我們正在調查有關動作效能降低的回報']))
    expect(text('#posted-1')).toBe(
      t([`发布于 21 小时前。10月27日，2026 年 08:01${utc}`, `發布於 21 小時前。10月27日，2026 年 08:01${utc}`])
    )
    expect(text('#posted-2')).toBe(
      t([`发布于 1 天前。10月26日，2026 年 18:48${utc}`, `發布於 1 天前。10月26日，2026 年 18:48${utc}`])
    )
    expect(text('#affected')).toBe(t(['此事件影响了：操作、议题、API 请求和拉取请求。', '此事件影響了：動作、議題、API 請求和拉取請求。']))
  })

  it('发布时间：span.ago 在服务端 HTML 中为空，由页面脚本填入', async () => {
    render(`
      <div class="update-timestamp" id="posted">
        Posted <span class="ago" data-datetime-unix="1793088000000"></span>Oct <var data-var='date'>27</var>, <var data-var='year'>2026</var> - <var data-var='time'>08:01</var> UTC
      </div>
      <small id="posted-on">
          <var data-var="posted-on">Posted on</var>
        <span class="ago" data-datetime-unix="1792602310000"></span>Oct <var data-var='date'>21</var>, <var data-var='year'>2026</var> - <var data-var='time'>10:05</var> UTC
      </small>`)
    expect(text('#posted')).toBe(t([`发布于 10月27日，2026 年 08:01${utc}`, `發布於 10月27日，2026 年 08:01${utc}`]))
    expect(text('#posted-on')).toBe(`Posted on 10月21日，2026 年 10:05${utc}`)
    document.querySelector('#posted .ago')!.innerHTML = '<var data-var="num">21</var> hours ago. '
    document.querySelector('#posted-on .ago')!.innerHTML = '<var data-var="num">7</var> days ago. '
    await settle()
    expect(text('#posted')).toBe(
      t([`发布于 21 小时前。10月27日，2026 年 08:01${utc}`, `發布於 21 小時前。10月27日，2026 年 08:01${utc}`])
    )
    expect(text('#posted-on')).toBe(`Posted on 7 天前。10月21日，2026 年 10:05${utc}`)
  })

  it('事件报告页副标题：</a> 后没有空白文本节点时保持原文（实际页面都有换行缩进）', () => {
    render(`
      <div class="subheader" id="incident-tight">Incident Report for <a href="/">GitHub</a></div>
      <div class="subheader" id="maintenance-tight">Scheduled Maintenance Report for <a href="/">GitHub</a></div>`)
    expect(text('#incident-tight')).toBe('Incident Report for GitHub')
    expect(text('#maintenance-tight')).toBe('Scheduled Maintenance Report for GitHub')
  })

  it('事件报告页：订阅事件弹窗', () => {
    render(INCIDENT_HTML)
    expect(attribute('#modal-close', 'aria-label')).toBe(t(['关闭', '關閉']))
    expect(text('#incident-subscription-dialog-header')).toBe(t(['订阅事件', '訂閱事件']))
    expect(text('#incident-subscription-dialog-description')).toBe(
      t([
        '通过电子邮件和/或短信订阅“Sample text”的更新。事件更新时你会收到电子邮件通知，GitHub 创建或解决事件时你会收到短信通知。',
        '透過電子郵件和/或簡訊訂閱「Sample text」的更新。事件更新時你會收到電子郵件通知，GitHub 建立或解決事件時你會收到簡訊通知。'
      ])
    )
    expect([text('#via-email'), text('#via-sms'), text('#enter-mobile')]).toEqual(
      index === 0 ? ['通过电子邮件：', '通过短信：', '输入手机号码'] : ['透過電子郵件：', '透過簡訊：', '輸入手機號碼']
    )
    expect([text('#btn-change-number-incident-abc123'), text('#btn-subcriber-send-otp-abc123')]).toEqual(
      index === 0 ? ['编辑号码', '发送验证码'] : ['編輯號碼', '傳送驗證碼']
    )
    expect(text('#enter-otp-sent')).toBe(t(['输入收到的验证码', '輸入收到的驗證碼']))
    // 倒计时期间「重新发送验证码」链接置灰，与倒计时并排显示
    expect(text('#resend-otp-abc123')).toBe(t(['重新发送验证码', '重新傳送驗證碼']))
    expect(text('#timer-incident-abc123')).toBe(t(['30 秒后可用', '30 秒後可用']))
    // 与链接之间靠开头的 &nbsp; 隔开
    expect(document.querySelector('#timer-incident-abc123')?.textContent).toMatch(/^\u00a0\S/)
    expect(text('#sms-info')).toBe(
      t([
        '如需接收短信更新，请验证你的号码。如只使用电子邮件，请单击“订阅”',
        '若要接收簡訊更新，請驗證你的號碼。若只使用電子郵件，請按一下「訂閱」'
      ])
    )
    expect(text('#subscribe-btn-abc123')).toBe(t(['订阅事件', '訂閱事件']))
  })

  it('订阅事件弹窗：事件标题译成中文时引号两侧不留空格', () => {
    render(`
      <p id="description">
        Subscribe to updates for <strong>Incident with Actions</strong> via email and/or text message. You'll receive email notifications when incidents are updated, and text message notifications whenever GitHub <strong>creates</strong> or <strong>resolves</strong> an incident.
      </p>`)
    expect(text('#description')).toBe(
      t([
        '通过电子邮件和/或短信订阅“操作故障”的更新。事件更新时你会收到电子邮件通知，GitHub 创建或解决事件时你会收到短信通知。',
        '透過電子郵件和/或簡訊訂閱「動作故障」的更新。事件更新時你會收到電子郵件通知，GitHub 建立或解決事件時你會收到簡訊通知。'
      ])
    )
  })

  it('计划维护的事件页：<var>Scheduled for</var> 副标题、状态、受影响组件、维护报告', () => {
    render(MAINTENANCE_HTML)
    // <var> 里的 Scheduled for 引擎不处理，其后补空格
    expect(text('#scheduled-for')).toBe(`Scheduled for 10月28日 04:00 - 06:00${utc}`)
    expect(text('#scheduled-for-days')).toBe(`Scheduled for 10月28日 23:00 - 10月29日 01:00${utc}`)
    expect(text('#maintenance-update')).toBe(t(['正在进行', '進行中']))
    expect(text('#maintenance-affected')).toBe(t(['此次计划维护影响：代码空间。', '此次排定維護影響：程式碼空間。']))
    expect(text('#maintenance-report')).toBe(t(['GitHub 计划维护报告', 'GitHub 排定維護報告']))
  })

  it('正常运行时间页：组件选择框、月份标题、提示框', () => {
    render(UPTIME_HTML)
    expect(attribute('#select-component', 'aria-label')).toBe(t(['选择组件', '選擇元件']))
    expect(attribute('#select-open', 'aria-label')).toBe(t(['展开', '展開']))
    expect(text('#month-name')).toBe('9月 2026')
    expect(text('#month-uptime')).toBe('99.95%')
    expect(text('#react-date')).toBe('2026年10月28日')
    expect(text('#react-group-count')).toBe(t(['2 个组件出现严重中断。', '2 個元件發生嚴重中斷。']))
  })

  it('浏览器本地时区就是 UTC 时不写时区', () => {
    const zone = process.env.TZ
    process.env.TZ = 'UTC'
    try {
      // 新建匹配器：行内句的译文按句型键缓存
      render(HISTORY_HTML, createMatcher(bundle))
      expect(text('#time-1')).toBe('10月26日 18:48 - 18:57')
      expect(text('#time-2')).toBe('10月23日 23:41 - 10月24日 00:23')
    } finally {
      if (zone === undefined) delete process.env.TZ
      else process.env.TZ = zone
    }
  })

  it('停止后还原原文', () => {
    render(INCIDENT_HTML)
    translator?.stop()
    translator = undefined
    expect(text('#posted-1')).toBe('Posted 21 hours ago. Oct 27, 2026 - 08:01 UTC')
    expect(text('#subheader')).toBe('Incident Report for GitHub')
    expect(text('#timer-incident-abc123')).toBe('in 30 seconds')
  })
})
