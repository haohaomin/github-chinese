import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'
import { copilotPlan } from './plans'

/** 自动模式优化方向 */
const AUTO_TIER: Readonly<Record<string, string>> = {
  Efficiency: '效率',
  Balance: '平衡',
  Intelligence: '智慧'
}

/** 优化方向的短语：效率 → 效率最佳化（原文无引号，译文不加引号） */
function tierPhrase(tier: string): string {
  return `${AUTO_TIER[tier] ?? tier}最佳化`
}

/** 推理强度 */
const EFFORT: Readonly<Record<string, string>> = {
  Default: '預設',
  None: '無',
  Low: '低',
  Medium: '中',
  High: '高',
  'Extra High': '超高',
  Max: '最高'
}

/** 使用量类别 */
const QUOTA_KIND: Readonly<Record<string, string>> = {
  'free requests': '免費請求',
  'premium requests': '進階請求',
  'premium responses': '進階回應'
}

/** 可选的「限额重置」尾句：Limit resets on Nov 1. */
const RESET = `(?: Limit resets (${TIME_SOURCE})\\.)?`

/** 暂停升级时追加的尾句（其后的“Read more”链接单独成节点） */
const FREEZE = '( Plan upgrades are temporarily unavailable\\.)?'
const FREEZE_TEXT = '暫時無法升級方案。'

/** 使用量计量横幅的升级提示尾句 */
const UPGRADE_TAIL: Readonly<Record<string, string>> = {
  ' Upgrade to increase your limit.': '升級以提高限額。',
  ' Enable additional requests to get more usage after the limit is reached.': '啟用額外請求，達到上限後仍可繼續使用。'
}

/** 升级提示尾句的正则片段（可选） */
const UPGRADE = `(${Object.keys(UPGRADE_TAIL)
  .map(tail => tail.replaceAll('.', '\\.'))
  .join('|')})?`

/** 限额重置尾句：限額將於 11月1日重設。无时间时为空 */
function resetTail(time: string): string {
  return time ? joinCjk(joinCjk('限額將於', translateTime(time)), '重設。') : ''
}

/** 点数重置尾句：點數將於 11月1日重設。 */
function creditResetTail(time: string): string {
  return joinCjk(joinCjk('點數將於', translateTime(time)), '重設。')
}

/** 升级到 <方案>：方案名按 product-names.md 译成「X 版」（未收录的保留原文），与前后中文按 joinCjk 补空格 */
function upgradeTo(plan: string, rest = ''): string {
  return joinCjk(joinCjk('升級到', copilotPlan(plan)), rest)
}

/**
 * Copilot 模型选择器、推理强度、使用量与计费提示（进阶请求、AI 点数、预算、升级）。
 * 停靠聊天面板在各页面复用，整句放 static；含数字、日期的整句用正则（仅 Copilot 页），
 * 其他页面靠拆开的文本片段逐个匹配。
 */
export default {
  static: {
    // 模型选择器（输入框旁的标签：模型：<Auto>）
    'Model:': '模型：',
    'Switch model': '切換模型',
    'Loading models': '正在載入模型',
    'Loading models…': '正在載入模型…',
    'Model unavailable': '模型無法使用',
    'Back to models': '返回模型清單',
    'Fast and cost-efficient': '快速且具成本效益',
    'Versatile and highly intelligent': '用途廣泛且高度智慧',
    'Most powerful at complex tasks': '最擅長處理複雜任務',
    'Org default': '組織預設',
    'Max context': '最大上下文',
    'Cost / 1M tokens': '費用 / 100 萬個權杖',
    'Cached input:': '快取輸入：',
    'Retry with…': '改用模型重試…',
    'Retry with model': '改用模型重試',
    'This model is not available on your plan.': '你的方案無法使用此模型。',
    'Auto selects the best model for each request based on its complexity and real-time model availability.':
      'Auto 會根據每個請求的複雜度和模型的即時可用性，選擇最佳模型。',
    'Auto model optimization': 'Auto 模型最佳化',
    'Prioritizes speed and efficiency': '以速度和效率為優先',
    'Balances speed and intelligence': '兼顧速度和智慧',
    'Prioritizes intelligence': '以智慧為優先',
    'Choose an optimization for the next message': '為下一則訊息選擇最佳化方向',
    'Optimized for:': '最佳化方向：',
    'will be used for the next message.': '將用於下一則訊息。',
    'The selected model is unavailable. Choose another model and try again.': '所選模型無法使用。選擇其他模型後再試一次。',
    "No supported model is currently available. This may be caused by your organization's model policy. Contact your organization administrator or try again later.":
      '目前沒有可用的受支援模型。這可能是你組織的模型政策所致。聯絡組織管理員或稍後再試。',
    'You were rate limited on the selected model. Please try again using another model.':
      '你在所選模型上已達速率限制。請改用其他模型再試一次。',
    'Preparing model selection…': '正在準備模型選擇…',
    'Model selection ready.': '模型選擇已就緒。',
    'Model options could not be loaded.': '無法載入模型選項。',
    'Model options loaded.': '已載入模型選項。',
    'Loading model options.': '正在載入模型選項。',
    'No model options were available. Model selection changed to Auto.': '沒有可用的模型選項。模型選擇已變更為 Auto。',
    'No model options were available. Auto is still available.': '沒有可用的模型選項。仍可使用 Auto。',
    'Model options could not be loaded. Model selection changed to Auto.': '無法載入模型選項。模型選擇已變更為 Auto。',
    'Model options could not be loaded. Auto is still available.': '無法載入模型選項。仍可使用 Auto。',

    // 模型说明（按模型名和系列匹配的固定文案）
    'Microsoft AI model optimized for coding and software development tasks.': '針對程式撰寫和軟體開發任務最佳化的 Microsoft AI 模型。',
    'Excellent for complex analysis, coding tasks, and nuanced creative writing.': '擅長複雜分析、程式撰寫任務和細膩的創意寫作。',
    'Balanced Claude model offering strong performance for everyday coding and chat tasks at faster speeds.':
      '均衡的 Claude 模型，能以更快的速度在日常程式撰寫和聊天任務中提供強大效能。',
    'Fastest and most compact Claude model. Ideal for quick responses and simple tasks.':
      '速度最快、最精簡的 Claude 模型。適合快速回應和簡單任務。',
    'Versatile Claude model for coding and general assistance.': '適用於程式撰寫和一般協助的多用途 Claude 模型。',
    'OpenAI Codex model specialized for code generation, debugging, and software development tasks.':
      '專門用於程式碼產生、偵錯和軟體開發任務的 OpenAI Codex 模型。',
    'Lightweight GPT model for quick responses and simple tasks with low latency.': '輕量級 GPT 模型，適合低延遲的快速回應和簡單任務。',
    'GPT model fine-tuned for Copilot code completions.': '針對 Copilot 程式碼自動完成微調的 GPT 模型。',
    'Optimized GPT-4 model with faster responses and multimodal capabilities.': '經過最佳化的 GPT-4 模型，回應更快並具備多模態能力。',
    'Enhanced GPT-4 model with improved instruction following and coding performance.': '增強版 GPT-4 模型，指令遵循和程式撰寫效能更佳。',
    'OpenAI GPT model for coding and general assistance.': '適用於程式撰寫和一般協助的 OpenAI GPT 模型。',
    'Fast and efficient Gemini model optimized for quick responses and high throughput.':
      '快速高效的 Gemini 模型，針對快速回應和高輸送量最佳化。',
    "Google's advanced Gemini Pro model with strong reasoning and coding capabilities.":
      'Google 的進階 Gemini Pro 模型，具備強大的推理和程式撰寫能力。',
    'Google Gemini model with balanced performance for coding and general assistance.':
      '在程式撰寫和一般協助方面表現均衡的 Google Gemini 模型。',
    'xAI Grok model optimized for fast code generation and development tasks.': '針對快速程式碼產生和開發任務最佳化的 xAI Grok 模型。',

    // 推理强度
    'Reasoning effort': '推理強度',
    'Let the model pick its default reasoning effort': '由模型選擇預設的推理強度',
    'No reasoning': '不推理',
    'No reasoning for the simplest tasks': '最簡單的任務不需推理',
    'Faster responses for simpler tasks': '適合較簡單任務的快速回應',
    'Balanced reasoning for most tasks': '適合大多數任務的均衡推理',
    'More reasoning for complex tasks': '適合複雜任務的更多推理',
    'Extended reasoning for harder tasks': '適合較難任務的延伸推理',
    'Maximum reasoning for the hardest tasks': '適合最難任務的最大推理',

    // 权杖使用量（GLOSSARY.zh-TW usage 行：Token usage → 權杖使用量）
    'View message info': '查看訊息資訊',
    'Message info': '訊息資訊',
    'View message token usage': '查看訊息權杖使用量',
    'Message token usage': '訊息權杖使用量',
    'View token usage': '查看權杖使用量',
    'Token usage': '權杖使用量',
    'Session token usage': '工作階段權杖使用量',
    'AI Credits cost unavailable': '無法取得 AI 點數費用',

    // 使用情况面板
    'AI credits': 'AI 點數',
    'Manage budget': '管理預算',
    'Manage billing': '管理帳務',
    'Manage overage': '管理超額用量',
    'Code completions': '程式碼自動完成',
    'Chat messages': '聊天訊息',
    // 各项标题旁信息按钮的无障碍名称：Learn more about <标题>
    'Learn more about Included credits': '瞭解包含的點數',
    'Learn more about Additional usage': '瞭解額外使用量',
    'Learn more about Monthly limit': '瞭解每月上限',

    // 使用量横幅：标题
    'Limit reached': '已達上限',
    'Limit reached soon': '即將達到上限',
    'Approaching limit': '即將達到上限',
    'Almost out': '即將用完',
    'Almost at limit': '即將達到上限',
    'Approaching budget limit': '即將達到預算上限',
    'Almost out of budget': '預算即將用完',
    'Budget reached': '已達預算上限',
    'Additional usage active': '額外使用量生效中',
    'Usage paused': '使用已暫停',
    'Usage limit warning': '使用量上限警告',
    'Insufficient AI credits': 'AI 點數不足',
    'Additional usage budget reached': '已達額外使用量預算上限',
    'Additional usage limit reached': '已達額外使用量上限',
    'Setting up your Copilot license': '正在設定你的 Copilot 授權',
    "You're out of premium requests": '進階請求已用完',
    'You’re out of premium requests': '進階請求已用完',
    "You've run out of AI credits for the month": '本月 AI 點數已用完',
    'You’ve run out of AI credits for the month': '本月 AI 點數已用完',

    // 使用量横幅：说明
    "You're approaching the limit of your included usage with the free plan.": '免費方案包含的使用量即將達到上限。',
    'You’re approaching the limit of your included usage with the free plan.': '免費方案包含的使用量即將達到上限。',
    "You've run out of your budget for additional AI credits.": '額外 AI 點數的預算已用完。',
    'You’ve run out of your budget for additional AI credits.': '額外 AI 點數的預算已用完。',
    "You've run out of your budget for additional usage of AI credits.": '額外 AI 點數使用量的預算已用完。',
    'Usage is currently blocked by your organization. Contact your administrator to resume usage.':
      '你的組織目前已阻擋使用。聯絡管理員以恢復使用。',
    'Cleared for takeoff soon—your Copilot license is on its way. Please check back in a few minutes.':
      '即將獲准起飛——你的 Copilot 授權已在路上。請過幾分鐘再回來查看。',
    "You've used all free requests this month.": '本月的免費請求已全部用完。',
    'You’ve used all free requests this month.': '本月的免費請求已全部用完。',
    "You've reached your premium request limit this month.": '本月進階請求已達上限。',
    'You’ve reached your premium request limit this month.': '本月進階請求已達上限。',
    "You've run out of Copilot premium quota.": 'Copilot 進階配額已用完。',
    "You don't have enough AI credits to start a session.": 'AI 點數不足，無法開始工作階段。',
    "You don't have enough AI credits to start a session. Contact your administrator for more information.":
      'AI 點數不足，無法開始工作階段。聯絡管理員以瞭解詳情。',
    'You have used all requests available this month.': '本月可用的請求已全部用完。',
    'You have used all premium requests available this month.': '本月可用的進階請求已全部用完。',
    'You have reached your monthly limit for premium requests.': '本月進階請求已達上限。',
    'Upgrade to increase your limit.': '升級以提高限額。',
    'Enable additional requests to get more usage after the limit is reached.': '啟用額外請求，達到上限後仍可繼續使用。',
    'Ask your admin to upgrade to increase your limit.': '請管理員升級以提高限額。',
    'Payment is needed to continue usage.': '需要付款才能繼續使用。',
    'Contact your administrator to keep your services running.': '聯絡管理員以維持服務運作。',
    'Pay for your usage': '支付使用量費用',
    'Pay for your usage to keep using your services.': '支付使用量費用以繼續使用服務。',
    'Pay to continue': '付款以繼續',
    'additional usage limit': '額外使用量上限',
    'You have Copilot licenses from multiple organizations or enterprises. To use premium requests, please select a billing entity in your':
      '你擁有來自多個組織或企業的 Copilot 授權。若要使用進階請求，請在以下設定中選擇計費帳號',
    'Copilot billing settings': 'Copilot 帳務設定',
    'The billing entity you have selected has no premium quota remaining.': '你選擇的計費帳號已沒有剩餘的進階配額。',
    'Before you can use Copilot cloud agent, you need to pick a "Usage billed to" option in your Copilot settings.':
      '使用 Copilot 雲端代理前，必須在 Copilot 設定中選擇「使用量計費帳號」。',

    // 使用量横幅：被链接拆开的片段
    'Enable additional usage': '啟用額外使用量',
    'enable additional usage': '啟用額外使用量',
    'Enable additional requests': '啟用額外請求',
    'enable additional requests': '啟用額外請求',
    'Increase your budget': '提高預算',
    'Increase budget': '提高預算',
    'Ask your admin to upgrade': '請管理員升級',
    'to access more models and higher limits.': '以使用更多模型並取得更高的限額。',
    'to access higher limits and premium models.': '以取得更高的限額和進階模型。',
    'to increase your limit.': '以提高限額。',
    'to increase your limit or': '以提高限額或',
    'to get more.': '以取得更多使用量。',
    'to get more usage.': '以取得更多使用量。',
    'to get more usage after the limit is reached.': '以便在達到上限後繼續使用。',
    'to increase your limit. Limit resets on': '以提高限額。限額重設日期為',
    'to get more. Limit resets on': '以取得更多使用量。限額重設日期為',
    'to get more usage. Limit resets on': '以取得更多使用量。限額重設日期為',
    'Limit resets on': '限額重設日期為',
    "You've used": '你已使用',
    'You’ve used': '你已使用',
    'You have used': '你已使用',
    "You've reached your": '你已達到',
    'You’ve reached your': '你已達到',
    '% of your included AI credits.': '% 的方案內含 AI 點數。',
    '% of your included AI credits. Ask your admin to': '% 的方案內含 AI 點數。請管理員',
    '% of your free requests this month.': '% 的本月免費請求。',
    '% of your premium requests this month.': '% 的本月進階請求。',
    '% of your premium requests this month. Ask your admin to': '% 的本月進階請求。請管理員',
    'You have reached your monthly limit for premium requests. Ask your admin to': '本月進階請求已達上限。請管理員',
    'You have reached your monthly limit for premium requests. Enable additional requests or switch to the default model. Limit resets on':
      '本月進階請求已達上限。啟用額外請求或切換到預設模型。限額重設日期為',
    'You have used all premium requests available this month. Limit resets on': '本月可用的進階請求已全部用完。限額重設日期為',
    'You have used all premium requests available this month. You will be charged per premium request until the limit resets on':
      '本月可用的進階請求已全部用完。限額重設前將按進階請求次數計費，重設日期為',
    'You have reached your monthly limit for': '你已達到本月',
    'premium requests': '進階請求',
    'for Copilot code review.': '用於 Copilot 程式碼審查的上限。',
    'Copilot code review is available again when your limit resets on': 'Copilot 程式碼審查恢復可用的日期為',

    // 套餐推广
    'Available on Copilot Pro': '適用於 Copilot 專業版',
    'Try Copilot code review for 30 days free.': '免費試用 Copilot 程式碼審查 30 天。'
  },
  scoped: {
    Efficiency: '效率',
    Balance: '平衡',
    Intelligence: '智慧',
    'Optimized for': '最佳化方向',
    Applying: '正在套用',
    'Extra High': '超高',
    Resets: '重設時間',
    Exceeded: '已超出',
    Ends: '結束於',
    '(current)': '（目前）'
  },
  regexp: [
    // 模型
    [
      /^Model: (.+), (applying optimization|selected for the next message)$/,
      (_, model: string, state: string) => `模型：${model}，${state === 'applying optimization' ? '正在套用最佳化' : '已為下一則訊息選擇'}`
    ],
    [/^Model: (.+)$/, '模型：$1'],
    [/^Retry with (.+)$/, '改用 $1 重試'],
    [/^Auto is currently using (.+)$/, 'Auto 目前使用 $1'],
    // 方案名按 product-names.md 译成「X 版」（Copilot Max 等未收录的保留原文）
    [/^Upgrade to (Copilot [\w+]+) to access this model$/, (_, plan: string) => upgradeTo(plan, '以使用此模型')],
    [/^This model requires (Copilot [\w+]+)$/, (_, plan: string) => joinCjk('此模型需要', copilotPlan(plan))],
    [/^Upgrade to (Copilot [\w+]+)$/, (_, plan: string) => upgradeTo(plan)],
    [/^(\d+)% off$/, '減免 $1%'],
    [
      /^(Use of this model|Model use) through Auto will be billed at a (\d+(?:\.\d+)?%) discount\.$/,
      (_, subject: string, discount: string) =>
        `${subject === 'Model use' ? '透過 Auto 使用模型' : '透過 Auto 使用此模型'}可享 ${discount} 的計費折扣。`
    ],
    [
      /^Optimized for(:)? (Efficiency|Balance|Intelligence)$/,
      (_, colon = '', tier: string) => (colon ? `最佳化方向：${AUTO_TIER[tier] ?? tier}` : `針對${AUTO_TIER[tier] ?? tier}最佳化`)
    ],
    [/^(Efficiency|Balance|Intelligence) optimization applied\.$/, (_, tier: string) => `已套用${tierPhrase(tier)}。`],
    [/^Applying (Efficiency|Balance|Intelligence)…$/, (_, tier: string) => `正在套用${tierPhrase(tier)}…`],
    [
      /^Optimized for (Efficiency|Balance|Intelligence) · Applying (Efficiency|Balance|Intelligence)…$/,
      (_, current: string, pending: string) => `針對${AUTO_TIER[current] ?? current}最佳化 · 正在套用${tierPhrase(pending)}…`
    ],
    [/^(Efficiency|Balance|Intelligence) applying$/, (_, tier: string) => `正在套用${tierPhrase(tier)}`],
    [/^(Efficiency|Balance|Intelligence) selected for the next message$/, (_, tier: string) => `已為下一則訊息選擇${tierPhrase(tier)}`],
    [/^Reasoning effort: (Default|None|Low|Medium|High|Extra High|Max)$/, (_, effort: string) => `推理強度：${EFFORT[effort] ?? effort}`],
    [/^(Low|Medium|High|Extra High|Max) reasoning$/, (_, effort: string) => `${EFFORT[effort] ?? effort}強度推理`],
    [
      /^(.+) \((?:(Low|Medium|High|Extra High|Max) reasoning|No reasoning)\)$/,
      (_, model: string, effort: string) => `${model}（${effort ? `${EFFORT[effort] ?? effort}強度推理` : '不推理'}）`
    ],
    [/^(None|Low|Medium|High|Extra High|Max) \(Default\)$/, (_, effort: string) => `${EFFORT[effort] ?? effort}（預設）`],

    // 使用量
    [/^([\d,]+(?:\.\d+)?) AI credits?$/, '$1 AI 點數'],
    [/^([\d,.]+) AI credits used$/, '已使用 $1 AI 點數'],
    [/^([\d,.]+) \/ ([\d,.]+) AI credits$/, '$1 / $2 AI 點數'],
    // 工作階段權杖使用量：輸入：<1,234 tokens>
    [/^([\d,]+) tokens?$/, '$1 個權杖'],
    [/^(\d+) premium requests?$/, '$1 個進階請求'],
    // 代理会话页标题栏的用量：分隔符、数字与单位是同一 span 里的相邻文本节点
    [/^· (\d+) premium requests?$/, '· $1 個進階請求'],
    [/^Included credits: (\d+(?:\.\d+)?)% used$/, '包含的點數：已使用 $1%'],
    [/^Additional usage: (\d+(?:\.\d+)?)% used$/, '額外使用量：已使用 $1%'],
    [/^Monthly limit: (\d+(?:\.\d+)?)% used$/, '每月上限：已使用 $1%'],
    [
      /^Copilot (code completions|chat messages) quota usage$/,
      (_, kind: string) => `Copilot ${kind === 'chat messages' ? '聊天訊息' : '程式碼自動完成'}配額使用量`
    ],
    [new RegExp(`^Resets (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '重設')],
    [new RegExp(`^Limit resets (${TIME_SOURCE})\\.$`), (_, time: string) => resetTail(time)],

    // 使用量横幅整句
    [
      new RegExp(`^You['’]ve used (\\d+(?:\\.\\d+)?)% of your included AI credits\\.${RESET}$`),
      (_, percent: string, time = '') => `你已使用方案內含 AI 點數的 ${percent}%。${resetTail(time)}`
    ],
    [
      /^You have used (\d+(?:\.\d+)?)% of your (included AI credits|additional AI credit usage|monthly usage limit)\.$/,
      (_, percent: string, kind: string) =>
        `你已使用${kind === 'included AI credits' ? '方案內含 AI 點數' : kind === 'monthly usage limit' ? '每月使用量上限' : '額外 AI 點數使用量'}的 ${percent}%。`
    ],
    [/^You['’]ve used (\d+(?:\.\d+)?)% of your budget for additional AI credits\.$/, '你已使用額外 AI 點數預算的 $1%。'],
    [
      new RegExp(`^You(?: have|['’]ve) used (\\d+)% of your (free requests|premium requests|premium responses) this month\\.${UPGRADE}$`),
      (_, percent: string, kind: string, tail = '') => `你已使用本月${QUOTA_KIND[kind] ?? kind}的 ${percent}%。${UPGRADE_TAIL[tail] ?? ''}`
    ],
    [
      new RegExp(`^You['’]re (almost out of|out of) your included usage with the free plan\\.${RESET}$`),
      (_, state: string, time = '') => `免費方案包含的使用量${state === 'out of' ? '已用完' : '即將用完'}。${resetTail(time)}`
    ],
    [
      new RegExp(`^You['’]ve run out of your included (usage with the free plan|AI credits for the month)\\.${RESET}$`),
      (_, kind: string, time = '') =>
        `${kind.startsWith('usage') ? '免費方案包含的使用量' : '本月方案內含的 AI 點數'}已用完。${resetTail(time)}`
    ],
    [
      new RegExp(`^Usage paused until your monthly limit resets (${TIME_SOURCE})\\. Request your administrator for additional usage\\.$`),
      (_, time: string) => `${joinCjk(joinCjk('每月上限於', translateTime(time)), '重設前暫停使用。')}向管理員申請額外使用量。`
    ],
    [
      new RegExp(
        `^You have used all (premium )?requests available this month\\.( Upgrade your plan to increase your limit\\.)? Limit resets on (.+?)\\.${FREEZE}$`
      ),
      (_, premium: string, upgrade: string, date: string, freeze = '') =>
        `本月可用的${premium ? '進階' : ''}請求已全部用完。${upgrade ? '升級方案以提高限額。' : ''}${resetTail(date)}${freeze ? FREEZE_TEXT : ''}`
    ],
    [
      /^You have used all premium requests available this month\. Enable additional requests to get more\. Limit resets on (.+)\.$/,
      (_, date: string) => `本月可用的進階請求已全部用完。啟用額外請求以取得更多使用量。${resetTail(date)}`
    ],
    [
      /^You have reached your monthly limit for premium requests\. Ask your admin to increase your limit\. Limit resets on (.+)\.$/,
      (_, date: string) => `本月進階請求已達上限。請管理員提高限額。${resetTail(date)}`
    ],
    [
      /^You have used all premium requests available this month\. You will be charged per additional premium request until the limit resets on (.+)\.$/,
      (_, date: string) =>
        `本月可用的進階請求已全部用完。${joinCjk(joinCjk('限額於', translateTime(date)), '重設前，每個額外的進階請求都將個別計費。')}`
    ],
    [
      new RegExp(`^You have reached your free plan limit\\. Limit resets on (.+?)\\.${FREEZE}$`),
      (_, date: string, freeze = '') => `已達免費方案上限。${resetTail(date)}${freeze ? FREEZE_TEXT : ''}`
    ],
    [
      /^You don['’]t have enough AI credits to start a session\. Limit resets on (.+)\.$/,
      (_, date: string) => `AI 點數不足，無法開始工作階段。${resetTail(date)}`
    ],
    [
      /^You['’]ve hit your session limit\. Please upgrade your plan or wait (?:(\d+) (hour|minute)s? )?for your limit to reset\.$/,
      (_, amount: string, unit: string) =>
        `已達工作階段上限。請升級方案或等待${amount ? ` ${amount} ${unit === 'hour' ? '小時' : '分鐘'}後` : ''}限額重設。`
    ],
    [
      /^You['’]ve exceeded your weekly usage limit\.(?: Your limit will reset in (\d+) (hour|minute)s?\.)? Please upgrade your plan or wait for your limit to reset\.$/,
      (_, amount = '', unit = '') =>
        `已超出每週使用量上限。${amount ? `限額將在 ${amount} ${unit === 'hour' ? '小時' : '分鐘'}後重設。` : ''}請升級方案或等待限額重設。`
    ],

    // 额外使用量上限横幅（「額外使用量上限」链接之后的整段）
    [
      new RegExp(
        `^You['’]ve reached your additional usage limit for your plan\\. Pay for your additional usage to continue\\. Otherwise, wait until your credits reset (${TIME_SOURCE})\\.$`
      ),
      (_, time: string) =>
        `已達方案的額外使用量上限。支付額外使用量費用以繼續。否則，${joinCjk(joinCjk('請等到點數於', translateTime(time)), '重設。')}`
    ],
    [
      new RegExp(
        `^\\. Upgrade to (.+?) for (\\S+) to get an additional (\\S+) in credits, or pay (\\S+) to continue on (.+?)\\. Credits reset (${TIME_SOURCE})\\.$`
      ),
      (_, plan: string, price: string, credit: string, pay: string, current: string, time: string) =>
        `。以 ${price} ${upgradeTo(plan, '可額外獲得價值')} ${credit} 的點數，或支付 ${pay} ${joinCjk('繼續使用', copilotPlan(current))}。${creditResetTail(time)}`
    ],
    [
      new RegExp(
        `^\\. Upgrade to (.+?) for (\\S+) and cut additional usage from (\\S+) to (\\S+), or pay (\\S+) to continue on (.+?)\\. Credits reset (${TIME_SOURCE})\\.$`
      ),
      (_, plan: string, price: string, from: string, to: string, pay: string, current: string, time: string) =>
        `。以 ${price} ${upgradeTo(plan, '可將額外使用量費用從')} ${from} 降至 ${to}，或支付 ${pay} ${joinCjk('繼續使用', copilotPlan(current))}。${creditResetTail(time)}`
    ],
    // 额外使用量生效横幅：包含的点数重置前改用额外使用量（重置日期可省略）
    [
      new RegExp(`^You['’]re now using additional usage until your included credits reset(?: (${TIME_SOURCE}))?\\.$`),
      (_, time = '') => `你目前正在使用額外使用量，直到包含的點數${time ? joinCjk(joinCjk('於', translateTime(time)), '重設。') : '重設。'}`
    ]
  ]
} satisfies PageDictionary
