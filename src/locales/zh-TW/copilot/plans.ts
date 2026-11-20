import type { PageDictionary } from '../../../core/types'

/** 计费周期 */
const PERIOD: Readonly<Record<string, string>> = {
  month: '月',
  year: '年'
}

/**
 * 方案名：按 product-names.md 译成「X 版」（Copilot Free → Copilot 免費版）；Copilot Max 尚无既定译名，保留原文。
 * 侧栏方案标签（app.ts）、模型升级提示与额度横幅（models.ts）共用
 */
export const COPILOT_PLANS: Readonly<Record<string, string>> = {
  'Copilot Free': 'Copilot 免費版',
  'Copilot Pro': 'Copilot 專業版',
  'Copilot Pro+': 'Copilot 專業增強版',
  'Copilot Business': 'Copilot 商務版',
  'Copilot Enterprise': 'Copilot 企業版',
  'Copilot Student': 'Copilot 學生版'
}

/** 方案名的译名；未收录的保留原文 */
export function copilotPlan(name: string): string {
  return Object.hasOwn(COPILOT_PLANS, name) ? (COPILOT_PLANS[name] ?? name) : name
}

/**
 * Copilot 订阅与试用页（/github-copilot/signup、/github-copilot/pro、/github-copilot/free_signup）与商业版结账页（/github-copilot/purchase）：
 * 计划介绍、计费周期、结账说明、开通完成后的引导。方案名按 product-names.md 译出（见 COPILOT_PLANS）；
 * 单独的 Free 指方案时作「免費版」，价格义 free 作「免費」；GitHub Mobile → GitHub 行動版。
 */
export default {
  static: {
    // Copilot 商业版结账（/github-copilot/purchase）：帐户、计划、账单信息、摘要
    Checkout: '結帳',
    'Pick an account': '選擇帳號',
    'Copilot plan': 'Copilot 方案',
    'For organizations ready to improve engineering velocity, code quality, and developer experience. See all features on Business plan.':
      '適合希望提升工程效率、程式碼品質和開發人員體驗的組織。查看商務版方案的所有功能。',
    'Billing Information': '帳單資訊',
    // Copilot 专业版试用与结账（/github-copilot/pro）
    'Try Copilot Pro for 30 days free': '免費試用 Copilot 專業版 30 天',
    'Everything in Copilot Free and:': 'Copilot 免費版的所有功能，以及：',
    'Unlimited agent mode and chat with GPT-4.1': '無限次使用 GPT-4.1 的代理模式和聊天',
    'Unlimited code completions': '無限次程式碼自動完成',
    'Access to Anthropic Claude Sonnet 4, GPT-5, Gemini 2.5 Pro, and more':
      '可使用 Anthropic Claude Sonnet 4、GPT-5、Gemini 2.5 Pro 等模型',
    // 屬於某個組織？升級到 <Copilot 商務版> 以在各團隊中啟用。（链接文字由 app.ts 的方案名 scoped 翻译）
    'Part of an organization? Upgrade to': '屬於某個組織？升級到',
    'to enable across teams.': '以在各團隊中啟用。',
    'Copilot Pro checkout': 'Copilot 專業版結帳',
    'Subscribe to GitHub Copilot Pro': '訂閱 GitHub Copilot 專業版',
    'Everything in Free, plus unlimited chats and code completions, premium model access (Claude 3.7/4 and more), and 6x more premium requests.':
      '包含免費版的所有功能，另有無限次聊天和程式碼自動完成、進階模型存取權（Claude 3.7/4 等），以及多 6 倍的進階請求。',
    'To prevent abuse, we require billing information upfront. Your 30-day free trial will automatically convert to a paid plan after the trial ends. You can cancel anytime from settings before the trial expires to avoid being billed.':
      '為防止濫用，我們會預先要求提供帳單資訊。30 天免費試用結束後，將自動轉為付費方案。你可以在試用期滿前隨時從設定中取消，以免被收費。',
    'Participation requires transferring your personal data to other countries in which GitHub operates, including the United States. By submitting this form, you agree to the transfer of your data outside of China.':
      '參與需要將你的個人資料傳輸到 GitHub 營運所在的其他國家/地區，包括美國。送出此表單即表示你同意將你的資料傳輸到中國境外。',

    // Copilot 个人版注册（/github-copilot/signup）
    'GitHub Copilot Individual': 'GitHub Copilot 個人版',
    'For developers who want unlimited access to GitHub Copilot.': '適合想要無限制使用 GitHub Copilot 的開發人員。',
    'Start your 30-day free trial': '開始 30 天免費試用',
    'Copilot Pro includes everything you get for free, plus:': 'Copilot 專業版包含免費提供的所有功能，另有：',
    'Unlimited code completions and chat interactions': '無限次程式碼自動完成和聊天互動',
    'Access to more models, like OpenAI o1 and Gemini 1.5 Pro': '可使用更多模型，例如 OpenAI o1 和 Gemini 1.5 Pro',
    'Works in GitHub Mobile, CLI, and Windows Terminal': '可在 GitHub 行動版、CLI 和 Windows Terminal 中使用',
    // 原文无标点，译文不加
    'Cancel anytime before the trial ends to avoid getting billed': '在試用結束前隨時取消以免被收費',
    'Or get GitHub Copilot from an organization': '或透過組織取得 GitHub Copilot',
    'Access Copilot from an organization': '透過組織使用 Copilot',
    'Get access to GitHub Copilot': '取得 GitHub Copilot 存取權',
    'Next: Confirm your payment details': '下一步：確認付款資訊',
    // ……請查看 <免費使用常見問題> 以瞭解詳情。
    'GitHub Copilot is free for maintainers of popular open source software on GitHub and verified students. Check out the':
      'GitHub 上熱門開源軟體的維護者和已驗證的學生可以免費使用 GitHub Copilot。請查看',
    'You can change these at any time from your account settings.': '你可以隨時在帳號設定中變更這些設定。',
    'GitHub Copilot is now ready': 'GitHub Copilot 已就緒',
    'Add it to your editor and start building.': '將它加入編輯器並開始開發。',
    'Install the GitHub Copilot extension': '安裝 GitHub Copilot 擴充功能',
    'You can now use GitHub Copilot on the GitHub website. To use Copilot in your IDE, you first need to install the GitHub Copilot extension. To install for your preferred code editor, check out these Getting Started guides:':
      '現在你可以在 GitHub 網站上使用 GitHub Copilot。若要在 IDE 中使用 Copilot，必須先安裝 GitHub Copilot 擴充功能。若要為你慣用的程式碼編輯器安裝，請參閱以下入門指南：',
    'If you have the extension already installed for your code editor and have it open, please restart your editor in order to access GitHub Copilot.':
      '如果你已為程式碼編輯器安裝此擴充功能且編輯器已開啟，請重新啟動編輯器以存取 GitHub Copilot。',

    // 免费资格（/github-copilot/free_signup）
    'Use GitHub Copilot for free': '免費使用 GitHub Copilot',
    '🎉 Congratulations! You are eligible to use GitHub Copilot for free.': '🎉 恭喜！你符合免費使用 GitHub Copilot 的資格。',
    'Get code suggestions in more than a dozen coding languages including Python, JavaScript, TypeScript, Go, and Ruby':
      '在 Python、JavaScript、TypeScript、Go 和 Ruby 等十多種程式語言中取得程式碼建議',
    'Plugs into IDEs including VS Code, Visual Studio, Neovim, and JetBrains':
      '可整合到 VS Code、Visual Studio、Neovim 和 JetBrains 等 IDE',
    'GitHub Copilot is free to use for open source maintainers, teachers and students. We check eligibility monthly, per our policies.':
      '開源維護者、教師和學生可以免費使用 GitHub Copilot。我們會依政策每月檢查資格。'
  },
  scoped: {
    // 结账页的短词与链接（signing 是账单链接说明中的链接，整句见 inline）
    Account: '帳號',
    Switch: '切換',
    Summary: '摘要',
    signing: '簽署',
    here: '這裡',
    'contact our sales team': '聯絡我們的銷售團隊',
    'Try now': '立即試用',
    'Free for 30 days': '免費 30 天',
    'Billing frequency': '計費頻率',
    'Pay frequency after trial': '試用後的付款頻率',
    'Monthly plan': '月費方案',
    'Yearly plan': '年費方案',
    '/month': '/月',
    '/year': '/年',
    '/ month': '/ 月',
    '- Free trial': '- 免費試用',
    'Activate now': '立即啟用',
    'free use FAQ': '免費使用常見問題',
    'Select your preferences': '選擇你的偏好設定',
    'Save and complete setup': '儲存並完成設定',
    'Eligibility requirements': '資格條件'
  },
  regexp: [
    // 结账页：帐户类型与成员数、每用户价格、计费周期与席位、链接账单信息后的提示（组织名照录）
    [/^Organization • (\d+) members?$/, '組織 • $1 名成員'],
    [/^(\$[\d,.]+) \/ user$/, '$1 / 使用者'],
    [/^(Monthly|Yearly) • No seats assigned yet$/, (_, cycle: string) => `${cycle === 'Monthly' ? '每月' : '每年'} • 尚未指派席次`],
    [/^Billing information successfully linked to (\S+)$/, '已將帳單資訊連結到 $1'],
    [/^(\d+) premium requests to use the latest models and code review$/, '$1 個進階請求可用於最新模型和程式碼審查'],
    [/^Save (\$[\d,]+(?:\.\d+)?)(!?)$/, (_, amount: string, bang: string) => `節省 ${amount}${bang ? '！' : ''}`],
    // 结账页的计费说明，其后的开始日期单独成节点：按每月 $10.00 計費的起始日期為 <日期>（原文无标点；
    // 金额不用「$10.00/月」写法，避免「月」与「計費」之间留空格）
    [
      /^You will be billed (\$[\d,]+(?:\.\d+)?)\/(month|year) starting$/,
      (_, amount: string, period: string) => `按每${PERIOD[period] ?? period} ${amount} 計費的起始日期為`
    ]
    // 营销同意复选框的两句由 common/pages.ts 翻译（共用组件，全站生效）
  ],
  inline: [
    // 结账页：付款方式提示（链接：联系支持）、条款与发票说明（链接：此处、联系我们的销售团队）
    [
      'Update your payment method information to enable GitHub Copilot. If you are unable to do so, {}.',
      '更新付款方式資訊以啟用 GitHub Copilot。如果無法更新，請{}。'
    ],
    [
      'Your existing agreement with GitHub governs your use of GitHub Copilot. See GitHub Copilot specific terms {}. If you require invoices, {}.',
      '你對 GitHub Copilot 的使用受你與 GitHub 的現有協議約束。GitHub Copilot 的專用條款請見{}。如需發票，請{}。'
    ],
    // 账单未链接时：首段 + 链接 signing + the + 链接 GitHub Customer Agreement + 句号（同市场订单页，首段见 marketplace/apps.ts 的 static）
    [
      'An organization owner or billing manager must link their personal billing information with this organization account. You can switch to a business account to use your business’ billing information by {} the {}.',
      '組織擁有者或帳務管理員必須將個人帳單資訊連結到此組織帳號。若要切換到商業帳號以使用公司的帳單資訊請{} {}。'
    ]
  ]
} satisfies PageDictionary
