import type { PageDictionary } from '../../../core/types'

/** 计费周期 */
const PERIOD: Readonly<Record<string, string>> = {
  month: '月',
  year: '年'
}

/**
 * 方案名：按 product-names.md 译成「X 版」（Copilot Free → Copilot 免费版）；Copilot Max 尚无既定译名，保留原文。
 * 侧栏方案标签（app.ts）、模型升级提示与额度横幅（models.ts）共用
 */
export const COPILOT_PLANS: Readonly<Record<string, string>> = {
  'Copilot Free': 'Copilot 免费版',
  'Copilot Pro': 'Copilot 专业版',
  'Copilot Pro+': 'Copilot 专业增强版',
  'Copilot Business': 'Copilot 商业版',
  'Copilot Enterprise': 'Copilot 企业版',
  'Copilot Student': 'Copilot 学生版'
}

/** 方案名的译名；未收录的保留原文 */
export function copilotPlan(name: string): string {
  return Object.hasOwn(COPILOT_PLANS, name) ? (COPILOT_PLANS[name] ?? name) : name
}

/**
 * Copilot 订阅与试用页（/github-copilot/signup、/github-copilot/pro、/github-copilot/free_signup）：
 * 计划介绍、计费周期、结账说明、开通完成后的引导。方案名按 product-names.md 译出（见 COPILOT_PLANS）；
 * 单独的 Free 指方案时作“免费版”，价格义 free 作“免费”；GitHub Mobile → GitHub 移动版。
 */
export default {
  static: {
    // Copilot 专业版试用与结账（/github-copilot/pro）
    'Try Copilot Pro for 30 days free': '免费试用 Copilot 专业版 30 天',
    'Everything in Copilot Free and:': 'Copilot 免费版的全部功能，以及：',
    'Unlimited agent mode and chat with GPT-4.1': '无限次使用 GPT-4.1 的智能体模式和聊天',
    'Unlimited code completions': '无限次代码补全',
    'Access to Anthropic Claude Sonnet 4, GPT-5, Gemini 2.5 Pro, and more':
      '可使用 Anthropic Claude Sonnet 4、GPT-5、Gemini 2.5 Pro 等模型',
    // 属于某个组织？升级到 <Copilot 商业版> 以在团队中启用。（链接文字由 app.ts 的方案名 scoped 翻译）
    'Part of an organization? Upgrade to': '属于某个组织？升级到',
    'to enable across teams.': '以在团队中启用。',
    'Copilot Pro checkout': 'Copilot 专业版结账',
    'Subscribe to GitHub Copilot Pro': '订阅 GitHub Copilot 专业版',
    'Everything in Free, plus unlimited chats and code completions, premium model access (Claude 3.7/4 and more), and 6x more premium requests.':
      '包含免费版的全部功能，另有无限次聊天和代码补全、高级模型访问权限（Claude 3.7/4 等），以及多 6 倍的高级请求。',
    'To prevent abuse, we require billing information upfront. Your 30-day free trial will automatically convert to a paid plan after the trial ends. You can cancel anytime from settings before the trial expires to avoid being billed.':
      '为防止滥用，我们要求预先提供账单信息。30 天免费试用结束后将自动转为付费计划。你可以在试用期结束前随时在设置中取消，以免被收费。',
    'Participation requires transferring your personal data to other countries in which GitHub operates, including the United States. By submitting this form, you agree to the transfer of your data outside of China.':
      '参与需要将你的个人数据传输到 GitHub 运营所在的其他国家/地区，包括美国。提交此表单即表示你同意将你的数据传输到中国境外。',

    // Copilot 个人版注册（/github-copilot/signup）
    'GitHub Copilot Individual': 'GitHub Copilot 个人版',
    'For developers who want unlimited access to GitHub Copilot.': '适合希望无限制使用 GitHub Copilot 的开发人员。',
    'Start your 30-day free trial': '开始 30 天免费试用',
    'Copilot Pro includes everything you get for free, plus:': 'Copilot 专业版包含免费获得的全部功能，另有：',
    'Unlimited code completions and chat interactions': '无限次代码补全和聊天交互',
    'Access to more models, like OpenAI o1 and Gemini 1.5 Pro': '可使用更多模型，如 OpenAI o1 和 Gemini 1.5 Pro',
    'Works in GitHub Mobile, CLI, and Windows Terminal': '可在 GitHub 移动版、CLI 和 Windows Terminal 中使用',
    'Cancel anytime before the trial ends to avoid getting billed': '在试用结束前随时取消即可免于计费',
    'Or get GitHub Copilot from an organization': '或通过组织获取 GitHub Copilot',
    'Access Copilot from an organization': '通过组织使用 Copilot',
    'Get access to GitHub Copilot': '获取 GitHub Copilot 使用权限',
    'Next: Confirm your payment details': '下一步：确认付款信息',
    // ……请查看 <免费使用常见问题>
    'GitHub Copilot is free for maintainers of popular open source software on GitHub and verified students. Check out the':
      'GitHub 上热门开源软件的维护者和经过验证的学生可免费使用 GitHub Copilot。请查看',
    'You can change these at any time from your account settings.': '你可以随时在帐户设置中更改这些设置。',
    'GitHub Copilot is now ready': 'GitHub Copilot 已就绪',
    'Add it to your editor and start building.': '将其添加到编辑器中并开始构建。',
    'Install the GitHub Copilot extension': '安装 GitHub Copilot 扩展',
    'You can now use GitHub Copilot on the GitHub website. To use Copilot in your IDE, you first need to install the GitHub Copilot extension. To install for your preferred code editor, check out these Getting Started guides:':
      '现在你可以在 GitHub 网站上使用 GitHub Copilot。要在 IDE 中使用 Copilot，需要先安装 GitHub Copilot 扩展。要为你偏好的代码编辑器安装，请查看以下入门指南：',
    'If you have the extension already installed for your code editor and have it open, please restart your editor in order to access GitHub Copilot.':
      '如果你已为代码编辑器安装了此扩展且编辑器处于打开状态，请重新启动编辑器以使用 GitHub Copilot。',

    // 免费资格（/github-copilot/free_signup）
    'Use GitHub Copilot for free': '免费使用 GitHub Copilot',
    '🎉 Congratulations! You are eligible to use GitHub Copilot for free.': '🎉 恭喜！你有资格免费使用 GitHub Copilot。',
    'Get code suggestions in more than a dozen coding languages including Python, JavaScript, TypeScript, Go, and Ruby':
      '在 Python、JavaScript、TypeScript、Go 和 Ruby 等十多种编程语言中获取代码建议',
    'Plugs into IDEs including VS Code, Visual Studio, Neovim, and JetBrains': '可接入 VS Code、Visual Studio、Neovim 和 JetBrains 等 IDE',
    'GitHub Copilot is free to use for open source maintainers, teachers and students. We check eligibility monthly, per our policies.':
      '开源维护者、教师和学生可免费使用 GitHub Copilot。我们会根据政策每月检查资格。'
  },
  scoped: {
    'Try now': '立即试用',
    'Free for 30 days': '30 天免费',
    'Billing frequency': '计费周期',
    'Pay frequency after trial': '试用后的付费周期',
    'Monthly plan': '月度计划',
    'Yearly plan': '年度计划',
    '/month': '/月',
    '/year': '/年',
    '/ month': '/ 月',
    '- Free trial': '- 免费试用',
    'Activate now': '立即激活',
    'free use FAQ': '免费使用常见问题',
    'Select your preferences': '选择你的首选项',
    'Save and complete setup': '保存并完成设置',
    'Eligibility requirements': '资格要求'
  },
  regexp: [
    [/^(\d+) premium requests to use the latest models and code review$/, '$1 个高级请求可用于最新模型和代码审查'],
    [/^Save (\$[\d,]+(?:\.\d+)?)(!?)$/, (_, amount: string, bang: string) => `节省 ${amount}${bang ? '！' : ''}`],
    // 结账页的计费说明，其后的开始日期单独成节点：按每月 $10.00 计费的起始日期为 <日期>（原文无标点；
    // 金额不用“$10.00/月”写法，避免“月”与“计费”之间留空格）
    [
      /^You will be billed (\$[\d,]+(?:\.\d+)?)\/(month|year) starting$/,
      (_, amount: string, period: string) => `按每${PERIOD[period] ?? period} ${amount} 计费的起始日期为`
    ]
    // 营销同意复选框的两句由 common/pages.ts 翻译（共用组件，全站生效）
  ]
} satisfies PageDictionary
