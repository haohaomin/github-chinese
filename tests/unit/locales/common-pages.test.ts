import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { translateTitleText } from '../../../src/core/title'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import pagesDictionary from '../../../src/locales/zh-CN/common/pages'
import regionsDictionary from '../../../src/locales/zh-CN/common/regions'
import { zhCN } from '../../../src/locales/zh-CN/index'
import twPagesDictionary from '../../../src/locales/zh-TW/common/pages'
import twRegionsDictionary from '../../../src/locales/zh-TW/common/regions'
import { zhTW } from '../../../src/locales/zh-TW/index'

const pages: PageDictionary = pagesDictionary
const regions: PageDictionary = regionsDictionary
const matcher = createMatcher([
  ['common', pages],
  ['common', regions]
])
const twPages: PageDictionary = twPagesDictionary
const twMatcher = createMatcher([
  ['common', twPages],
  ['common', twRegionsDictionary]
])
/** 正式语言包：检查与其他文件词条、其他页面类型正则的配合 */
const cnFull = createMatcher(zhCN)
const twFull = createMatcher(zhTW)
const COMMON: readonly PageKey[] = ['common']
const SETTINGS: readonly PageKey[] = ['common', 'settings']

function translate(text: string, scope: readonly PageKey[] = COMMON): string | undefined {
  return matcher.translate(text, scope)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  {
    hits: [
      ['Select country for phone number. Currently selected: US +1', '选择电话号码所属国家/地区。当前选择：US +1'],
      ['Select country for phone number. Currently selected: CN +86', '选择电话号码所属国家/地区。当前选择：CN +86']
    ],
    misses: ['Select country for phone number', 'Select country for phone number. Currently selected:']
  },
  {
    hits: [
      ['Payment due Nov 11, 2026', '应付款日期 2026年11月11日'],
      ['Payment due January 3, 2027', '应付款日期 2027年1月3日']
    ],
    misses: ['Payment due', 'Payment due soon', 'Next payment due Nov 11, 2026']
  },
  {
    hits: [
      ['By clicking “Upgrade to GitHub Pro”, you agree to our', '单击“升级到 GitHub 专业版”即表示你同意我们的'],
      ['By clicking "Sign up for GitHub", you agree to our', '单击“注册 GitHub”即表示你同意我们的'],
      ['By clicking “Purchase Copilot Pro”, you agree to our', '单击“Purchase Copilot Pro”即表示你同意我们的'],
      ['By clicking “constructor”, you agree to our', '单击“constructor”即表示你同意我们的']
    ],
    misses: [
      'By clicking “Purchase”, you agree to our terms',
      'By clicking “”, you agree to our',
      'By clicking “Purchase”, you agree to the',
      'By clicking Purchase, you agree to our'
    ]
  },
  {
    // 营销同意复选框的第二句：示例字段列表由 Intl.ListFormat 按浏览器语言拼接（en-US、en-GB、zh、zh-HK）
    hits: [
      [
        'The information used includes, but is not limited to, name, email address, and country.',
        '所使用的信息包括但不限于姓名、电子邮件地址和国家/地区。'
      ],
      [
        'The information used includes, but is not limited to, name, email address and country.',
        '所使用的信息包括但不限于姓名、电子邮件地址和国家/地区。'
      ],
      [
        'The information used includes, but is not limited to, name、email address和country.',
        '所使用的信息包括但不限于姓名、电子邮件地址和国家/地区。'
      ],
      [
        'The information used includes, but is not limited to, name、email address及country.',
        '所使用的信息包括但不限于姓名、电子邮件地址和国家/地区。'
      ]
    ],
    misses: ['The information used includes, but is not limited to', 'The information used includes name.']
  }
]

describe('common/pages 正则', () => {
  it('每条正则都有测试用例，且锚定、不带 g / y 标志', () => {
    const rules = pages.regexp ?? []
    expect(rules).toHaveLength(REGEXP_CASES.length)
    for (const [pattern] of rules) {
      expect(pattern.source.startsWith('^')).toBe(true)
      expect(pattern.source.endsWith('$')).toBe(true)
      expect(pattern.global || pattern.sticky).toBe(false)
    }
  })

  it.each(REGEXP_CASES.flatMap(item => item.hits))('%s → %s', (source, expected) => {
    expect(translate(source)).toBe(expected)
  })

  it.each(REGEXP_CASES.flatMap(item => item.misses))('不命中：%s', source => {
    expect(translate(source)).toBeUndefined()
  })

  it('营销同意复选框的第二句：共用组件，全站生效（繁体同）', () => {
    const source = 'The information used includes, but is not limited to, name, email address, and country.'
    for (const scope of [COMMON, SETTINGS, ['common', 'copilot']] as const) {
      expect(cnFull.translate(source, scope)).toBe('所使用的信息包括但不限于姓名、电子邮件地址和国家/地区。')
      expect(twFull.translate(source, scope)).toBe('所使用的資訊包括但不限於姓名、電子郵件地址和國家/地區。')
    }
  })
})

describe('common/regions 国家/地区与州/省', () => {
  it.each([
    ['China', '中国'],
    ['Taiwan', '中国台湾'],
    ['Hong Kong', '中国香港'],
    ['Hong Kong SAR China', '中国香港特别行政区'],
    ['Macao', '中国澳门'],
    ['Macau', '中国澳门'],
    ['Côte d’Ivoire', '科特迪瓦'],
    ["Côte d'Ivoire", '科特迪瓦'],
    ['Congo - Kinshasa', '刚果民主共和国'],
    ['Congo (Brazzaville)', '刚果共和国'],
    ['Korea, South', '韩国'],
    ['Virgin Islands, U.S.', '美属维尔京群岛'],
    ['United States of America', '美国'],
    ['Türkiye', '土耳其'],
    ['California', '加利福尼亚州'],
    ['Washington DC', '华盛顿哥伦比亚特区'],
    ['British Columbia', '不列颠哥伦比亚省'],
    ['Choose your country/region', '选择你的国家/地区']
  ])('%s → %s', (source, expected) => {
    expect(translate(source)).toBe(expected)
    expect(translate(source, SETTINGS)).toBe(expected)
  })

  it.each(['Georgia', 'Chad', 'Jordan'])('有歧义或与人名同形的地名不收录：%s', source => {
    expect(translate(source)).toBeUndefined()
  })
})

describe('common/pages 代表性静态词条', () => {
  it.each([
    ['GitHub Premium Support', 'GitHub 高级支持'],
    ['Initial response time', '首次响应时间'],
    ['4 hours for High', '高优先级 4 小时'],
    ['30 minutes for Urgent (including initial troubleshooting)', '紧急优先级 30 分钟（含初步故障排查）'],
    // 括号内全是英文、缩写或符号：半角，与两侧中文各空一格
    ['Customer Reliability Engineers (CREs)', '客户可靠性工程师 (CRE)'],
    // 课程名括号里的 Server / Cloud 指企业服务器 / 企业云，译成中文后用全角括号
    ['GitHub for admins (Server)', '面向管理员的 GitHub（服务器）'],
    ['GitHub for admins (Cloud)', '面向管理员的 GitHub（云）'],
    ['GitHub Enterprise Implementation (Cloud)', 'GitHub 企业版实施（云）'],
    ['Start by choosing an enterprise type', '首先选择企业类型'],
    ['Enterprise with managed users', '使用托管用户的企业'],
    ['Username shortcode (cannot be edited later)', '用户名短代码（之后无法编辑）'],
    ['Talk to our sales team', '联系我们的销售团队'],
    ['All fields marked with an asterisk (*) are required.', '标有星号 (*) 的字段为必填项。'],
    // 方案名、产品名按用户要求译成中文；可见性 private → 专用
    ['Choose an Enterprise plan', '选择企业版计划'],
    ['Not a GitHub Enterprise customer yet?', '还不是 GitHub 企业版客户？'],
    ['Included with Enterprise Cloud and Enterprise Server', '包含在企业云和企业服务器中'],
    ['Set up your GitHub Enterprise Managed Users trial', '设置 GitHub 企业托管用户试用'],
    ['GitHub Premium Plus Support', 'GitHub 高级增强支持'],
    ['Enterprise:', '企业版：'],
    ['Advanced Security:', '高级安全：'],
    ['Upgrade your account from GitHub Free to GitHub Pro', '将你的帐户从 GitHub 免费版升级到 GitHub 专业版'],
    ['Pages in private repos', '专用存储库中的页面'],
    ['3,000 minutes for GitHub Actions', '3,000 分钟 GitHub 操作时长'],
    ['Code owners in private repos', '专用存储库中的代码所有者'],
    ['Back to billing settings', '返回计费设置'],
    // profile → 个人资料（同组织个人资料）
    ['This will be your enterprise profile URL.', '这将是你的企业个人资料 URL。'],
    ['GitHub Copilot - Checkout', 'GitHub Copilot - 结账'],
    ['Pay yearly', '按年付款'],
    ['Features on', '功能'],
    // 原文没有冒号、逗号，译文不加
    ['e.g. Software Engineer', '例如软件工程师'],
    ['Host on GitHub.com without data residency', '托管在 GitHub.com 上且不使用数据驻留'],
    // email 义作“电子邮件”
    ['This email should send and receive emails.', '此电子邮件地址应能收发电子邮件。'],
    ['GHEC/GHES dual use + GHAS', 'GHEC/GHES 同时使用 + GHAS'],
    ['Prepaid debit and credit cards are not accepted as a valid form of payment.', '不接受预付借记卡和预付信用卡作为有效的付款方式。']
  ])('%s → %s', (source, expected) => {
    expect(translate(source)).toBe(expected)
  })

  it('多空白原文先规范化再匹配，保留首尾空白', () => {
    expect(matcher.translateRaw('  Pay   monthly ', COMMON)).toBe('  按月付款 ')
  })

  it('高级支持页的 submit：繁体作“送出”（commit 才作“提交”）', () => {
    expect(translate('Support via online ticket submission')).toBe('通过在线提交工单获得支持')
    expect(twMatcher.translate('Support via online ticket submission', COMMON)).toBe('透過線上送出工單取得支援')
  })

  it.each(['Free', 'Team', 'Enterprise', 'Business', 'Required', 'Premium', 'Standard', 'Theme', 'At', 'With', 'Checkout'])(
    '易冲突的短词与 Actions 步骤名同形词不在 pages 收录：%s',
    source => {
      expect(translate(source)).toBeUndefined()
    }
  )

  it.each(['Message'])('common-ui 已收录的通用词不重复收录：%s', source => {
    expect(pages.static?.[source]).toBeUndefined()
  })
})

describe('common/pages 行内句', () => {
  /** 模拟计划页（页面类型 new）对小写计划名的 scoped 译法（见 new/plans.ts） */
  const planNames: PageDictionary = { scoped: { team: '团队版' } }
  const planMatcher = createMatcher([
    ['common', pages],
    ['common', regions],
    ['new', planNames]
  ])
  const NEW: readonly PageKey[] = ['common', 'new']
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('窄屏计划选择：Features on <span>计划名</span> → 计划名在前、后面不留空格；计划名由所在页面的 scoped 翻译', () => {
    // /pricing、选择计划页的窄屏计划选择（.harvest/scratch/e-requests/pages/fetched/pricing/pricing.html）
    document.body.innerHTML = `
      <summary class="f3-mktg text-normal color-fg-muted tmp-p-3" aria-haspopup="true">
        <div class="d-flex flex-items-center flex-justify-between">
          <span id="features">
            Features on <span class="h6-mktg color-fg-accent js-compare-features-selected" data-default-plan="team" style="text-transform: capitalize;">team</span>
          </span>
          <span id="switch" class="f5 color-fg-accent d-flex flex-items-center ml-2"><svg aria-hidden="true" class="octicon octicon-arrow-switch"></svg>Switch plans</span>
        </div>
      </summary>`
    translator = createTranslator({ matcher: planMatcher, host: window, resolvePages: () => NEW })
    translator.start()
    const features = document.querySelector('#features')!
    expect(features.textContent?.replace(/\s+/g, ' ').trim()).toBe('团队版功能')
    expect(features.querySelector('.js-compare-features-selected')?.textContent).toBe('团队版')
    expect(document.querySelector('#switch')?.textContent).toBe('切换计划')
  })

  it('整句未命中时片段 Features on 单独翻译', () => {
    expect(translate('Features on')).toBe('功能')
    expect(translate('Features on team')).toBeUndefined()
  })
})

/** [原文, 简体, 繁体] */
type PairCase = readonly [source: string, cn: string, tw: string]

describe('common/pages 营销页、开发人员计划注册页与 Spark', () => {
  it.each([
    'https://github.com/features',
    'https://github.com/sitemap',
    'https://github.com/developer/register',
    'https://github.com/spark'
  ])('%s 只有 common 作用域，词条收 static', url => {
    expect(detectPages(new URL(url))).toEqual(COMMON)
  })

  const STATIC_CASES: readonly PairCase[] = [
    // 未登录首页：首屏、轮播与 AI 分区
    ['The future of building happens together', '构建的未来在于协作', '開發的未來在於協作'],
    ['Enter your email', '输入电子邮件', '輸入電子郵件'],
    ['Download GitHub Copilot app', '下载 GitHub Copilot 应用', '下載 GitHub Copilot 應用程式'],
    ['Automate', '自动化', '自動化'],
    [
      'Leverage tooling to detect, review, and fix vulnerabilities before they reach production.',
      '利用工具在漏洞进入生产环境前完成检测、审查和修复。',
      '運用工具，在漏洞進入正式環境前加以偵測、審查並修正。'
    ],
    ['Your AI partner everywhere.', '你的 AI 伙伴，无处不在。', '你的 AI 夥伴，無所不在。'],
    [
      '2025 Gartner® Magic Quadrant™ for AI Code Assistants',
      '2025 年 Gartner® AI 代码助手魔力象限™',
      '2025 年 Gartner® AI 程式碼助理魔力象限™'
    ],
    // 首页：自动化与安全分区（产品名译成中文；统计数字按“万”换算）
    ['Explore GitHub Codespaces', '探索 GitHub 代码空间', '探索 GitHub 程式碼空間'],
    ['Explore GitHub Marketplace', '探索 GitHub 市场', '探索 GitHub 市集'],
    ['Built-in application security where found means fixed', '发现即修复的内置应用安全', '找到即修正的內建應用程式安全性'],
    ['70% MTTR reduction', 'MTTR 缩短 70%', 'MTTR 縮短 70%'],
    ['8.3M secret leaks stopped', '阻止 830 万次机密泄露', '阻止 830 萬次機密外洩'],
    ['Learn about GitHub Secret Protection', '了解 GitHub 机密保护', '瞭解 GitHub 機密保護'],
    // 首页：协作分区、客户案例与脚注（客户名、公司名保留原文；人的量词简体“个”、繁体“位”）
    ['Explore GitHub Issues', '探索 GitHub 议题', '探索 GitHub 議題'],
    ['Explore code review', '探索代码审查', '探索程式碼審查'],
    ['Application manager at Mercedes-Benz', 'Mercedes-Benz 应用经理', 'Mercedes-Benz 應用程式經理'],
    ['Technology', '科技', '科技'],
    [
      'Accenture customizes GitHub Copilot for its 12,000 developers',
      'Accenture 为其 12,000 个开发人员定制 GitHub Copilot',
      'Accenture 為旗下 12,000 位開發人員自訂 GitHub Copilot'
    ],
    ['TELUS saves $16.9M with GitHub', 'TELUS 借助 GitHub 节省 1690 万美元', 'TELUS 透過 GitHub 節省 1690 萬美元'],
    ['GitHub internal customer data, 2025.', 'GitHub 内部客户数据，2025 年。', 'GitHub 內部客戶資料，2025 年。'],
    // 功能页：卡片链接、分区标题的键按现行的单个文本节点改写（旧版拆成两段或带句号）；锚点导航为小写写法
    ['The tools you need to build what you want', '构建你想要的一切所需的工具', '打造你想要的一切所需的工具'],
    ['Experience AI with Copilot Chat', '借助 Copilot 聊天体验 AI', '透過 Copilot 聊天體驗 AI'],
    ['The latest GitHub previews', 'GitHub 最新功能预览', 'GitHub 最新功能預覽'],
    ['Collaborative Coding', '协作编码', '協作程式開發'],
    ['Collaborative coding', '协作编码', '協作程式開發'],
    ['Code search & code view', '代码搜索与代码视图', '程式碼搜尋和程式碼檢視'],
    // 开发人员计划注册页
    ['Register for the GitHub Developer Program', '注册 GitHub 开发人员计划', '註冊 GitHub 開發人員計畫'],
    ['Select an account to register', '选择要注册的帐户', '選擇要註冊的帳號'],
    ['You don’t belong to any organizations.', '你不属于任何组织。', '你不屬於任何組織。'],
    [
      'By clicking “Register for the GitHub Developer Program” below, you agree to the',
      '单击下方的“注册 GitHub 开发人员计划”即表示你同意',
      '按一下下方的「註冊 GitHub 開發人員計畫」即表示你同意'
    ],
    ['and the', '和', '和'],
    // occasionally 作“不定期”
    [
      '. We’ll occasionally send you account related emails.',
      '。我们会不定期向你发送帐户相关电子邮件。',
      '。我們會不定期傳送與帳號相關的電子郵件給你。'
    ],
    ['Eligibility for development licenses for GitHub products', '获取 GitHub 产品开发许可证的资格', '取得 GitHub 產品開發授權的資格'],
    // 组织升级与结账：账单信息与组织关联
    ['This organization is linked with your billing information:', '此组织已链接到你的账单信息：', '此組織已連結到你的帳單資訊：'],
    ['Confirm your details shown below. To make changes,', '确认下方显示的详细信息。如需更改，请', '確認下方顯示的詳細資料。如需變更，請'],
    // Spark：首页、列表与编辑器
    [
      'Spark is currently only available to Copilot Pro+ and Enterprise users.',
      'Spark 目前仅向 Copilot 专业增强版和企业版用户开放。',
      'Spark 目前僅開放給 Copilot 專業增強版和企業版使用者。'
    ],
    ['Favorite this spark', '收藏此 Spark', '將此 Spark 加入我的最愛'],
    ['Nothing to see here… yet.', '暂无内容。', '尚無內容。'],
    ['Delete spark', '删除 Spark', '刪除 Spark'],
    ['Show mobile view', '显示移动端视图', '顯示行動裝置檢視'],
    // 进度提示带主语，用“正在”
    ['Action loading', '正在加载操作', '正在載入動作'],
    ['Expand prompt', '展开提示', '展開提示'],
    ['Border radius Medium', '中等圆角', '中等圓角'],
    ['Select a font', '选择字体', '選擇字型'],
    ['Data', '数据', '資料'],
    ["We couldn't load your data", '无法加载你的数据', '無法載入你的資料'],
    // 繁体动作并列用「並」，名词并列用「和」
    [
      'Add data storage by asking in the Iterate panel. View and edit the associated tables and data here.',
      '在迭代面板中提出要求以添加数据存储。在此查看和编辑关联的数据表和数据。',
      '在迭代面板中提出要求以新增資料儲存。在此查看並編輯關聯的資料表和資料。'
    ],
    [
      'Add AI capabilities by asking in the Iterate panel. View and edit the prompts powering those features here.',
      '在迭代面板中提出要求以添加 AI 功能。在此查看和编辑驱动这些功能的提示。',
      '在迭代面板中提出要求以新增 AI 功能。在此查看並編輯驅動這些功能的提示。'
    ]
  ]

  it.each(STATIC_CASES)('%s → %s / %s', (source, cn, tw) => {
    expect(translate(source)).toBe(cn)
    expect(twMatcher.translate(source, COMMON)).toBe(tw)
  })

  /** [本文件原文, 其他文件收录的同一句]：只差缩写或连字符，全站同译 */
  it.each([
    ['You don’t belong to any organizations.', 'You do not belong to any organizations.'],
    ['. We’ll occasionally send you account related emails.', '. We’ll occasionally send you account-related emails.']
  ] as const)('与其他文件的同一句同译：%s', (source, other) => {
    for (const full of [cnFull, twFull]) {
      expect(full.translate(other, COMMON)).toBeDefined()
      expect(full.translate(source, COMMON)).toBe(full.translate(other, COMMON))
    }
  })

  /** 功能页、网站地图按现行原文改写的键：正式语言包中同样生效 */
  const REKEYED_CASES: readonly PairCase[] = [
    ['The tools you need to build what you want', '构建你想要的一切所需的工具', '打造你想要的一切所需的工具'],
    ['Experience AI with Copilot Chat', '借助 Copilot 聊天体验 AI', '透過 Copilot 聊天體驗 AI'],
    ['The latest GitHub previews', 'GitHub 最新功能预览', 'GitHub 最新功能預覽'],
    ['Collaborative Coding', '协作编码', '協作程式開發'],
    ['GitHub Sitemap', 'GitHub 网站地图', 'GitHub 網站地圖']
  ]

  it.each(REKEYED_CASES)('正式语言包：%s → %s / %s', (source, cn, tw) => {
    expect(cnFull.translate(source, COMMON)).toBe(cn)
    expect(twFull.translate(source, COMMON)).toBe(tw)
  })

  it('正式语言包：网站地图标签页标题按段翻译', () => {
    const title = 'GitHub Sitemap · GitHub'
    expect(translateTitleText(title, text => cnFull.translate(text, COMMON), '/sitemap')).toBe('GitHub 网站地图 · GitHub')
    expect(translateTitleText(title, text => twFull.translate(text, COMMON), '/sitemap')).toBe('GitHub 網站地圖 · GitHub')
  })

  it.each(['Experience AI', 'The latest GitHub', 'Collaborative', 'The tools you need to build what you want.'])(
    '旧版拆分片段与带句号的写法不收录：%s',
    source => {
      expect(pages.static?.[source]).toBeUndefined()
      expect(twPages.static?.[source]).toBeUndefined()
    }
  )

  it('Spark 标签 Theme 不收录：项目自定义字段名 Theme 单独出现时保持原文', () => {
    const scope: readonly PageKey[] = ['common', 'organization', 'projects']
    expect(cnFull.translate('Theme', scope)).toBeUndefined()
    expect(twFull.translate('Theme', scope)).toBeUndefined()
  })

  it('多句文本按句拼接：Spark 标语', () => {
    expect(translate('Dream it. See it. Ship it.')).toBe('构想。预览。发布。')
    expect(twMatcher.translate('Dream it. See it. Ship it.', COMMON)).toBe('構想。預覽。發布。')
  })

  it('移除账单信息的确认框：后句由 settings-account 的全局词条翻译，整段按句拼接', () => {
    const source = 'You are about to remove the billing information for this organization. Are you sure you want to do this?'
    expect(cnFull.translate(source, COMMON)).toBe('你即将删除此组织的账单信息。确定要执行此操作吗？')
    expect(twFull.translate(source, COMMON)).toBe('你即將移除此組織的帳單資訊。確定要這麼做嗎？')
  })

  it('注册页标题拆开时：前段由本文件、后段由 settings-account 的全局词条翻译', () => {
    expect(cnFull.translate('Register for the', COMMON)).toBe('注册')
    expect(cnFull.translate('GitHub Developer Program', COMMON)).toBe('GitHub 开发人员计划')
    expect(twFull.translate('Register for the', COMMON)).toBe('註冊')
    expect(twFull.translate('GitHub Developer Program', COMMON)).toBe('GitHub 開發人員計畫')
  })

  /** [标题, 路径, 简体, 繁体] */
  it.each([
    ['GitHub Sitemap · GitHub', '/sitemap', 'GitHub 网站地图 · GitHub', 'GitHub 網站地圖 · GitHub'],
    [
      'Register for the GitHub Developer Program · GitHub',
      '/developer/register',
      '注册 GitHub 开发人员计划 · GitHub',
      '註冊 GitHub 開發人員計畫 · GitHub'
    ],
    ['Signup to GitHub Copilot', '/github-copilot/signup', '注册 GitHub Copilot', '註冊 GitHub Copilot']
  ])('标签页标题：%s', (title, path, cn, tw) => {
    expect(translateTitleText(title, text => translate(text), path)).toBe(cn)
    expect(translateTitleText(title, text => twMatcher.translate(text, COMMON), path)).toBe(tw)
  })

  /**
   * [页面类型, 原文, 简体, 繁体]：这些页面类型的通用正则会把原文半译（“来自 industry”“删除 spark”“展开 prompt”），
   * 全局 static 优先于正则
   */
  it.each([
    ['actions', 'By industry', '按行业', '依產業'],
    ['codespaces', 'By size', '按规模', '依規模'],
    ['actions', 'By use case', '按使用场景', '依使用情境'],
    ['actions', 'Download GitHub Copilot app', '下载 GitHub Copilot 应用', '下載 GitHub Copilot 應用程式'],
    [
      'actions',
      'By clicking “Register for the GitHub Developer Program” below, you agree to the',
      '单击下方的“注册 GitHub 开发人员计划”即表示你同意',
      '按一下下方的「註冊 GitHub 開發人員計畫」即表示你同意'
    ],
    ['actions', 'Delete spark', '删除 Spark', '刪除 Spark'],
    ['issues', 'Expand prompt', '展开提示', '展開提示'],
    ['issues', 'Collapse prompt', '折叠提示', '摺疊提示']
  ] as const)('%s 作用域：%s', (page, source, cn, tw) => {
    const scope: readonly PageKey[] = ['common', page]
    expect(cnFull.translate(source, scope)).toBe(cn)
    expect(twFull.translate(source, scope)).toBe(tw)
  })
})

describe('common/pages 企业版试用计划选择页', () => {
  it('/organizations/enterprise_plan 只有 common 作用域，词条收 static', () => {
    expect(detectPages(new URL('https://github.com/organizations/enterprise_plan'))).toEqual(COMMON)
  })

  const TRIAL_CASES: readonly PairCase[] = [
    ['Pick your trial plan', '选择试用计划', '選擇試用方案'],
    [
      'Build and deploy to GitHub-hosted cloud environments, directly from your repositories.',
      '直接从存储库构建并部署到 GitHub 托管的云环境。',
      '直接從儲存庫建置並部署到 GitHub 代管的雲端環境。'
    ],
    // 按参考词库原文收录（末尾 GC 疑为截断）；括号内有中文用全角
    [
      'Manage and deploy GitHub Enterprise on your own servers, including AWS, Azure, or GC',
      '在你自己的服务器（包括 AWS、Azure 或 GC）上管理并部署 GitHub 企业版',
      '在你自己的伺服器（包括 AWS、Azure 或 GC）上管理並部署 GitHub 企業版'
    ],
    ['Why teams', '团队为何', '團隊為何'],
    [
      'it: Control where your code and data live in a private cloud.',
      '它：在私有云中掌控代码和数据的存放位置。',
      '它：在私人雲端中掌控程式碼和資料的存放位置。'
    ]
  ]

  it.each(TRIAL_CASES)('%s → %s / %s', (source, cn, tw) => {
    expect(translate(source)).toBe(cn)
    expect(twMatcher.translate(source, COMMON)).toBe(tw)
  })

  const PRODUCT_CASES: readonly PairCase[] = [
    ['Enterprise Cloud', '企业云', '企業雲端'],
    ['Enterprise Server', '企业服务器', '企業伺服器']
  ]

  it.each(PRODUCT_CASES)('产品名全站同译：%s → %s / %s（计划页 new 的 scoped 译法相同）', (source, cn, tw) => {
    for (const scope of [COMMON, SETTINGS, ['common', 'organization'], ['common', 'new']] as const) {
      expect(cnFull.translate(source, scope)).toBe(cn)
      expect(twFull.translate(source, scope)).toBe(tw)
    }
  })

  describe('卡片底部 Why teams <心形图标> it: …', () => {
    const CARD =
      '<p id="why">Why teams <svg aria-hidden="true" class="octicon octicon-heart-fill"></svg> it: Get started in minutes, and leave the infrastructure to us.</p>'
    let translator: Translator | undefined

    afterEach(() => {
      translator?.stop()
      translator = undefined
      document.body.innerHTML = ''
    })

    it.each([
      ['zh-CN', matcher, '团队为何 它：几分钟即可上手，基础设施交给我们。'],
      ['zh-TW', twMatcher, '團隊為何 它：幾分鐘即可上手，基礎架構交給我們。']
    ] as const)('%s：图标两侧的片段分别翻译，连读成句', (_, target, expected) => {
      document.body.innerHTML = CARD
      translator = createTranslator({ matcher: target, host: window, resolvePages: () => COMMON })
      translator.start()
      const card = document.querySelector('#why')
      expect(card?.querySelector('svg')).not.toBeNull()
      expect(card?.textContent?.replace(/\s+/g, ' ')).toBe(expected)
    })
  })
})

describe('common/pages 整段合并', () => {
  /** /features 的时间线条目（Primer Brand Timeline，类名带 CSS 模块哈希） */
  const TIMELINE =
    '<span id="item" class="Primer_Brand__Timeline-module__Timeline__item-text___5BcIe"><em>Build community</em> around your code.</span>'
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function run(html: string, target: Matcher): string | null | undefined {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: target, host: window, resolvePages: () => COMMON })
    translator.start()
    return document.querySelector('#item')?.textContent
  }

  it.each([
    ['zh-CN', matcher, '围绕你的代码建立社区。'],
    ['zh-TW', twMatcher, '圍繞你的程式碼打造社群。']
  ] as const)('%s：<em> 拆开的时间线条目整段翻译', (_, target, expected) => {
    expect(run(TIMELINE, target)).toBe(expected)
  })

  it('类名不含 Timeline__item-text 时不合并，两段都没有词条，保持原文', () => {
    expect(run(TIMELINE.replace('Timeline__item-text', 'Timeline__item'), matcher)).toBe('Build community around your code.')
  })
})
