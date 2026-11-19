import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'
import { copilotPlan } from './plans'

/** 自动模式优化方向 */
const AUTO_TIER: Readonly<Record<string, string>> = {
  Efficiency: '效率',
  Balance: '均衡',
  Intelligence: '智能'
}

/** 优化方向的短语：效率 → 效率优化（原文无引号，译文不加引号） */
function tierPhrase(tier: string): string {
  return `${AUTO_TIER[tier] ?? tier}优化`
}

/** 推理强度 */
const EFFORT: Readonly<Record<string, string>> = {
  Default: '默认',
  None: '无',
  Low: '低',
  Medium: '中',
  High: '高',
  'Extra High': '超高',
  Max: '最高'
}

/** 使用量类别 */
const QUOTA_KIND: Readonly<Record<string, string>> = {
  'free requests': '免费请求',
  'premium requests': '高级请求',
  'premium responses': '高级回复'
}

/** 可选的「限额重置」尾句：Limit resets on Nov 1. */
const RESET = `(?: Limit resets (${TIME_SOURCE})\\.)?`

/** 暂停升级时追加的尾句（其后的“Read more”链接单独成节点） */
const FREEZE = '( Plan upgrades are temporarily unavailable\\.)?'
const FREEZE_TEXT = '计划升级暂不可用。'

/** 使用量计量横幅的升级提示尾句 */
const UPGRADE_TAIL: Readonly<Record<string, string>> = {
  ' Upgrade to increase your limit.': '升级以提高限额。',
  ' Enable additional requests to get more usage after the limit is reached.': '启用额外请求，达到上限后仍可继续使用。'
}

/** 升级提示尾句的正则片段（可选） */
const UPGRADE = `(${Object.keys(UPGRADE_TAIL)
  .map(tail => tail.replaceAll('.', '\\.'))
  .join('|')})?`

/** 限额重置尾句：限额将于 11月1日重置。无时间时为空 */
function resetTail(time: string): string {
  return time ? joinCjk(joinCjk('限额将于', translateTime(time)), '重置。') : ''
}

/** 额度重置尾句：额度将于 11月1日重置。 */
function creditResetTail(time: string): string {
  return joinCjk(joinCjk('额度将于', translateTime(time)), '重置。')
}

/** 升级到 <方案>：方案名按 product-names.md 译成“X 版”（未收录的保留原文），与前后中文按 joinCjk 补空格 */
function upgradeTo(plan: string, rest = ''): string {
  return joinCjk(joinCjk('升级到', copilotPlan(plan)), rest)
}

/**
 * Copilot 模型选择器、推理强度、使用量与计费提示（高级请求、AI 额度、预算、升级）。
 * 停靠聊天面板在各页面复用，整句放 static；含数字、日期的整句用正则（仅 Copilot 页），
 * 其他页面靠拆开的文本片段逐个匹配。
 */
export default {
  static: {
    // 模型选择器（输入框旁的标签：模型：<Auto>）
    'Model:': '模型：',
    'Switch model': '切换模型',
    'Loading models': '正在加载模型',
    'Loading models…': '正在加载模型…',
    'Model unavailable': '模型不可用',
    'Back to models': '返回模型列表',
    'Fast and cost-efficient': '快速且经济',
    'Versatile and highly intelligent': '全能且高度智能',
    'Most powerful at complex tasks': '最擅长复杂任务',
    'Org default': '组织默认',
    'Max context': '最大上下文',
    'Cost / 1M tokens': '费用 / 100 万个令牌',
    'Cached input:': '缓存输入：',
    'Retry with…': '换用模型重试…',
    'Retry with model': '换用模型重试',
    'This model is not available on your plan.': '你的计划不支持此模型。',
    'Auto selects the best model for each request based on its complexity and real-time model availability.':
      'Auto 会根据每个请求的复杂度和模型的实时可用性，为其选择最合适的模型。',
    'Auto model optimization': 'Auto 模型优化',
    'Prioritizes speed and efficiency': '优先考虑速度和效率',
    'Balances speed and intelligence': '兼顾速度和智能',
    'Prioritizes intelligence': '优先考虑智能',
    'Choose an optimization for the next message': '为下一条消息选择优化方向',
    'Optimized for:': '优化方向：',
    'will be used for the next message.': '将用于下一条消息。',
    'The selected model is unavailable. Choose another model and try again.': '所选模型不可用。请选择其他模型后重试。',
    "No supported model is currently available. This may be caused by your organization's model policy. Contact your organization administrator or try again later.":
      '目前没有可用的受支持模型。可能是组织的模型策略所致。请联系组织管理员或稍后重试。',
    'You were rate limited on the selected model. Please try again using another model.':
      '你在所选模型上的请求已被限流。请换用其他模型重试。',
    'Preparing model selection…': '正在准备模型选择…',
    'Model selection ready.': '模型选择已就绪。',
    'Model options could not be loaded.': '无法加载模型选项。',
    'Model options loaded.': '模型选项已加载。',
    'Loading model options.': '正在加载模型选项。',
    'No model options were available. Model selection changed to Auto.': '没有可用的模型选项。模型选择已改为 Auto。',
    'No model options were available. Auto is still available.': '没有可用的模型选项。仍可使用 Auto。',
    'Model options could not be loaded. Model selection changed to Auto.': '无法加载模型选项。模型选择已改为 Auto。',
    'Model options could not be loaded. Auto is still available.': '无法加载模型选项。仍可使用 Auto。',

    // 模型说明（按模型名和系列匹配的固定文案）
    'Microsoft AI model optimized for coding and software development tasks.': '针对编码和软件开发任务优化的 Microsoft AI 模型。',
    'Excellent for complex analysis, coding tasks, and nuanced creative writing.': '擅长复杂分析、编码任务和细腻的创意写作。',
    'Balanced Claude model offering strong performance for everyday coding and chat tasks at faster speeds.':
      '均衡的 Claude 模型，在日常编码和聊天任务中以更快的速度提供强劲性能。',
    'Fastest and most compact Claude model. Ideal for quick responses and simple tasks.':
      '最快、最精简的 Claude 模型。适合快速响应和简单任务。',
    'Versatile Claude model for coding and general assistance.': '适用于编码和通用辅助的全能 Claude 模型。',
    'OpenAI Codex model specialized for code generation, debugging, and software development tasks.':
      '专用于代码生成、调试和软件开发任务的 OpenAI Codex 模型。',
    'Lightweight GPT model for quick responses and simple tasks with low latency.': '轻量级 GPT 模型，适合低延迟的快速响应和简单任务。',
    'GPT model fine-tuned for Copilot code completions.': '针对 Copilot 代码补全微调的 GPT 模型。',
    'Optimized GPT-4 model with faster responses and multimodal capabilities.': '经过优化的 GPT-4 模型，响应更快，具备多模态能力。',
    'Enhanced GPT-4 model with improved instruction following and coding performance.': '增强版 GPT-4 模型，指令遵循和编码性能更佳。',
    'OpenAI GPT model for coding and general assistance.': '适用于编码和通用辅助的 OpenAI GPT 模型。',
    'Fast and efficient Gemini model optimized for quick responses and high throughput.':
      '快速高效的 Gemini 模型，针对快速响应和高吞吐量优化。',
    "Google's advanced Gemini Pro model with strong reasoning and coding capabilities.":
      'Google 的高级 Gemini Pro 模型，具备强大的推理和编码能力。',
    'Google Gemini model with balanced performance for coding and general assistance.':
      '在编码和通用辅助方面表现均衡的 Google Gemini 模型。',
    'xAI Grok model optimized for fast code generation and development tasks.': '针对快速代码生成和开发任务优化的 xAI Grok 模型。',

    // 推理强度
    'Reasoning effort': '推理强度',
    'Let the model pick its default reasoning effort': '由模型决定默认推理强度',
    'No reasoning': '不推理',
    'No reasoning for the simplest tasks': '最简单的任务无需推理',
    'Faster responses for simpler tasks': '适合较简单任务的快速响应',
    'Balanced reasoning for most tasks': '适合大多数任务的均衡推理',
    'More reasoning for complex tasks': '适合复杂任务的更多推理',
    'Extended reasoning for harder tasks': '适合更难任务的深入推理',
    'Maximum reasoning for the hardest tasks': '适合最难任务的最大推理',

    // 令牌使用情况（GLOSSARY usage 行：Token usage → 令牌使用情况；数量、金额义才作“使用量”）
    'View message info': '查看消息信息',
    'Message info': '消息信息',
    'View message token usage': '查看消息令牌使用情况',
    'Message token usage': '消息令牌使用情况',
    'View token usage': '查看令牌使用情况',
    'Token usage': '令牌使用情况',
    'Session token usage': '会话令牌使用情况',
    'AI Credits cost unavailable': 'AI 额度费用不可用',

    // 使用情况面板
    'AI credits': 'AI 额度',
    'Manage budget': '管理预算',
    'Manage billing': '管理计费',
    'Manage overage': '管理超额使用量',
    'Code completions': '代码补全',
    'Chat messages': '聊天消息',
    // 各项标题旁信息按钮的无障碍名称：Learn more about <标题>
    'Learn more about Included credits': '了解包含的额度',
    'Learn more about Additional usage': '了解额外使用量',
    'Learn more about Monthly limit': '了解每月上限',

    // 使用量横幅：标题
    'Limit reached': '已达上限',
    'Limit reached soon': '即将达到上限',
    'Approaching limit': '即将达到上限',
    'Almost out': '即将用完',
    'Almost at limit': '即将达到上限',
    'Approaching budget limit': '即将达到预算上限',
    'Almost out of budget': '预算即将用完',
    'Budget reached': '已达预算上限',
    'Additional usage active': '额外使用量生效中',
    'Usage paused': '使用已暂停',
    'Usage limit warning': '使用限制警告',
    'Insufficient AI credits': 'AI 额度不足',
    'Additional usage budget reached': '已达额外使用量预算上限',
    'Additional usage limit reached': '已达额外使用量上限',
    'Setting up your Copilot license': '正在设置你的 Copilot 许可证',
    "You're out of premium requests": '高级请求已用完',
    'You’re out of premium requests': '高级请求已用完',
    "You've run out of AI credits for the month": '本月 AI 额度已用完',
    'You’ve run out of AI credits for the month': '本月 AI 额度已用完',

    // 使用量横幅：说明
    "You're approaching the limit of your included usage with the free plan.": '免费计划包含的使用量即将达到上限。',
    'You’re approaching the limit of your included usage with the free plan.': '免费计划包含的使用量即将达到上限。',
    "You've run out of your budget for additional AI credits.": '额外 AI 额度的预算已用完。',
    'You’ve run out of your budget for additional AI credits.': '额外 AI 额度的预算已用完。',
    "You've run out of your budget for additional usage of AI credits.": '额外 AI 额度使用量的预算已用完。',
    'Usage is currently blocked by your organization. Contact your administrator to resume usage.':
      '你的组织目前已阻止使用。请联系管理员恢复使用。',
    'Cleared for takeoff soon—your Copilot license is on its way. Please check back in a few minutes.':
      '即将就绪——你的 Copilot 许可证正在发放。请几分钟后再来查看。',
    "You've used all free requests this month.": '本月免费请求已用完。',
    'You’ve used all free requests this month.': '本月免费请求已用完。',
    "You've reached your premium request limit this month.": '本月高级请求已达上限。',
    'You’ve reached your premium request limit this month.': '本月高级请求已达上限。',
    "You've run out of Copilot premium quota.": 'Copilot 高级配额已用完。',
    "You don't have enough AI credits to start a session.": 'AI 额度不足，无法开始会话。',
    "You don't have enough AI credits to start a session. Contact your administrator for more information.":
      'AI 额度不足，无法开始会话。请联系管理员了解详情。',
    'You have used all requests available this month.': '本月可用请求已全部用完。',
    'You have used all premium requests available this month.': '本月可用高级请求已全部用完。',
    'You have reached your monthly limit for premium requests.': '本月高级请求已达上限。',
    'Upgrade to increase your limit.': '升级以提高限额。',
    'Enable additional requests to get more usage after the limit is reached.': '启用额外请求，达到上限后仍可继续使用。',
    'Ask your admin to upgrade to increase your limit.': '请管理员升级以提高限额。',
    'Payment is needed to continue usage.': '需要付款才能继续使用。',
    'Contact your administrator to keep your services running.': '请联系管理员以保持服务运行。',
    'Pay for your usage': '为使用量付费',
    'Pay for your usage to keep using your services.': '为使用量付费以继续使用服务。',
    'Pay to continue': '付费以继续',
    'additional usage limit': '额外使用量上限',
    'You have Copilot licenses from multiple organizations or enterprises. To use premium requests, please select a billing entity in your':
      '你拥有来自多个组织或企业的 Copilot 许可证。要使用高级请求，请选择计费实体，参见',
    'Copilot billing settings': 'Copilot 计费设置',
    'The billing entity you have selected has no premium quota remaining.': '所选计费实体已没有剩余的高级配额。',
    'Before you can use Copilot cloud agent, you need to pick a "Usage billed to" option in your Copilot settings.':
      '使用 Copilot 云端智能体前，需在 Copilot 设置中选择“使用量计费对象”。',

    // 使用量横幅：被链接拆开的片段
    'Enable additional usage': '启用额外使用量',
    'enable additional usage': '启用额外使用量',
    'Enable additional requests': '启用额外请求',
    'enable additional requests': '启用额外请求',
    'Increase your budget': '提高预算',
    'Increase budget': '提高预算',
    'Ask your admin to upgrade': '请管理员升级',
    'to access more models and higher limits.': '以使用更多模型并获得更高限额。',
    'to access higher limits and premium models.': '以获得更高限额和高级模型。',
    'to increase your limit.': '以提高限额。',
    'to increase your limit or': '以提高限额或',
    'to get more.': '以获取更多使用量。',
    'to get more usage.': '以获取更多使用量。',
    'to get more usage after the limit is reached.': '以便达到上限后仍可继续使用。',
    'to increase your limit. Limit resets on': '以提高限额。限额重置日期为',
    'to get more. Limit resets on': '以获取更多使用量。限额重置日期为',
    'to get more usage. Limit resets on': '以获取更多使用量。限额重置日期为',
    'Limit resets on': '限额重置日期为',
    "You've used": '你已使用',
    'You’ve used': '你已使用',
    'You have used': '你已使用',
    "You've reached your": '你已达到',
    'You’ve reached your': '你已达到',
    '% of your included AI credits.': '% 的包含 AI 额度。',
    '% of your included AI credits. Ask your admin to': '% 的包含 AI 额度。请管理员',
    '% of your free requests this month.': '% 的本月免费请求。',
    '% of your premium requests this month.': '% 的本月高级请求。',
    '% of your premium requests this month. Ask your admin to': '% 的本月高级请求。请管理员',
    'You have reached your monthly limit for premium requests. Ask your admin to': '本月高级请求已达上限。请管理员',
    'You have reached your monthly limit for premium requests. Enable additional requests or switch to the default model. Limit resets on':
      '本月高级请求已达上限。请启用额外请求或切换到默认模型。限额重置日期为',
    'You have used all premium requests available this month. Limit resets on': '本月可用高级请求已全部用完。限额重置日期为',
    'You have used all premium requests available this month. You will be charged per premium request until the limit resets on':
      '本月可用高级请求已全部用完。限额重置前将按高级请求次数计费，重置日期为',
    'You have reached your monthly limit for': '你已用完本月的',
    'premium requests': '高级请求',
    'for Copilot code review.': '额度（用于 Copilot 代码审查）。',
    'Copilot code review is available again when your limit resets on': 'Copilot 代码审查恢复可用的日期为',

    // 套餐推广
    'Available on Copilot Pro': 'Copilot 专业版可用',
    'Try Copilot code review for 30 days free.': '免费试用 Copilot 代码审查 30 天。'
  },
  scoped: {
    Efficiency: '效率',
    Balance: '均衡',
    Intelligence: '智能',
    'Optimized for': '优化方向',
    Applying: '正在应用',
    'Extra High': '超高',
    Resets: '重置时间',
    Exceeded: '已超出',
    Ends: '结束于',
    '(current)': '（当前）'
  },
  regexp: [
    // 模型
    [
      /^Model: (.+), (applying optimization|selected for the next message)$/,
      (_, model: string, state: string) => `模型：${model}，${state === 'applying optimization' ? '正在应用优化' : '已为下一条消息选择'}`
    ],
    [/^Model: (.+)$/, '模型：$1'],
    [/^Retry with (.+)$/, '使用 $1 重试'],
    [/^Auto is currently using (.+)$/, 'Auto 当前使用 $1'],
    // 方案名按 product-names.md 译成“X 版”（Copilot Max 等未收录的保留原文）
    [/^Upgrade to (Copilot [\w+]+) to access this model$/, (_, plan: string) => upgradeTo(plan, '以使用此模型')],
    [/^This model requires (Copilot [\w+]+)$/, (_, plan: string) => joinCjk('此模型需要', copilotPlan(plan))],
    [/^Upgrade to (Copilot [\w+]+)$/, (_, plan: string) => upgradeTo(plan)],
    [/^(\d+)% off$/, '优惠 $1%'],
    [
      /^(Use of this model|Model use) through Auto will be billed at a (\d+(?:\.\d+)?%) discount\.$/,
      (_, subject: string, discount: string) =>
        `${subject === 'Model use' ? '通过 Auto 使用模型' : '通过 Auto 使用此模型'}可享受 ${discount} 的计费折扣。`
    ],
    [
      /^Optimized for(:)? (Efficiency|Balance|Intelligence)$/,
      (_, colon = '', tier: string) => (colon ? `优化方向：${AUTO_TIER[tier] ?? tier}` : `针对${AUTO_TIER[tier] ?? tier}优化`)
    ],
    [/^(Efficiency|Balance|Intelligence) optimization applied\.$/, (_, tier: string) => `已应用${tierPhrase(tier)}。`],
    [/^Applying (Efficiency|Balance|Intelligence)…$/, (_, tier: string) => `正在应用${tierPhrase(tier)}…`],
    [
      /^Optimized for (Efficiency|Balance|Intelligence) · Applying (Efficiency|Balance|Intelligence)…$/,
      (_, current: string, pending: string) => `针对${AUTO_TIER[current] ?? current}优化 · 正在应用${tierPhrase(pending)}…`
    ],
    [/^(Efficiency|Balance|Intelligence) applying$/, (_, tier: string) => `正在应用${tierPhrase(tier)}`],
    [/^(Efficiency|Balance|Intelligence) selected for the next message$/, (_, tier: string) => `已为下一条消息选择${tierPhrase(tier)}`],
    [/^Reasoning effort: (Default|None|Low|Medium|High|Extra High|Max)$/, (_, effort: string) => `推理强度：${EFFORT[effort] ?? effort}`],
    [/^(Low|Medium|High|Extra High|Max) reasoning$/, (_, effort: string) => `${EFFORT[effort] ?? effort}强度推理`],
    [
      /^(.+) \((?:(Low|Medium|High|Extra High|Max) reasoning|No reasoning)\)$/,
      (_, model: string, effort: string) => `${model}（${effort ? `${EFFORT[effort] ?? effort}强度推理` : '不推理'}）`
    ],
    [/^(None|Low|Medium|High|Extra High|Max) \(Default\)$/, (_, effort: string) => `${EFFORT[effort] ?? effort}（默认）`],

    // 使用量
    [/^([\d,]+(?:\.\d+)?) AI credits?$/, '$1 AI 额度'],
    [/^([\d,.]+) AI credits used$/, '已使用 $1 AI 额度'],
    [/^([\d,.]+) \/ ([\d,.]+) AI credits$/, '$1 / $2 AI 额度'],
    // 会话令牌使用情况：输入：<1,234 tokens>
    [/^([\d,]+) tokens?$/, '$1 个令牌'],
    [/^(\d+) premium requests?$/, '$1 个高级请求'],
    // 智能体会话页标题栏的用量：分隔符、数字与单位是同一 span 里的相邻文本节点
    [/^· (\d+) premium requests?$/, '· $1 个高级请求'],
    [/^Included credits: (\d+(?:\.\d+)?)% used$/, '包含的额度：已使用 $1%'],
    [/^Additional usage: (\d+(?:\.\d+)?)% used$/, '额外使用量：已使用 $1%'],
    [/^Monthly limit: (\d+(?:\.\d+)?)% used$/, '每月上限：已使用 $1%'],
    [
      /^Copilot (code completions|chat messages) quota usage$/,
      (_, kind: string) => `Copilot ${kind === 'chat messages' ? '聊天消息' : '代码补全'}配额使用情况`
    ],
    [new RegExp(`^Resets (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '重置')],
    [new RegExp(`^Limit resets (${TIME_SOURCE})\\.$`), (_, time: string) => resetTail(time)],

    // 使用量横幅整句
    [
      new RegExp(`^You['’]ve used (\\d+(?:\\.\\d+)?)% of your included AI credits\\.${RESET}$`),
      (_, percent: string, time = '') => `你已使用包含的 AI 额度的 ${percent}%。${resetTail(time)}`
    ],
    [
      /^You have used (\d+(?:\.\d+)?)% of your (included AI credits|additional AI credit usage|monthly usage limit)\.$/,
      (_, percent: string, kind: string) =>
        `你已使用${kind === 'included AI credits' ? '包含的 AI 额度' : kind === 'monthly usage limit' ? '每月使用限制' : '额外 AI 额度使用量'}的 ${percent}%。`
    ],
    [/^You['’]ve used (\d+(?:\.\d+)?)% of your budget for additional AI credits\.$/, '你已使用额外 AI 额度预算的 $1%。'],
    [
      new RegExp(`^You(?: have|['’]ve) used (\\d+)% of your (free requests|premium requests|premium responses) this month\\.${UPGRADE}$`),
      (_, percent: string, kind: string, tail = '') => `你已使用本月${QUOTA_KIND[kind] ?? kind}的 ${percent}%。${UPGRADE_TAIL[tail] ?? ''}`
    ],
    [
      new RegExp(`^You['’]re (almost out of|out of) your included usage with the free plan\\.${RESET}$`),
      (_, state: string, time = '') => `免费计划包含的使用量${state === 'out of' ? '已用完' : '即将用完'}。${resetTail(time)}`
    ],
    [
      new RegExp(`^You['’]ve run out of your included (usage with the free plan|AI credits for the month)\\.${RESET}$`),
      (_, kind: string, time = '') =>
        `${kind.startsWith('usage') ? '免费计划包含的使用量' : '本月包含的 AI 额度'}已用完。${resetTail(time)}`
    ],
    [
      new RegExp(`^Usage paused until your monthly limit resets (${TIME_SOURCE})\\. Request your administrator for additional usage\\.$`),
      (_, time: string) => `使用已暂停，${joinCjk(joinCjk('每月上限将于', translateTime(time)), '重置。')}如需额外使用量，请联系管理员。`
    ],
    [
      new RegExp(
        `^You have used all (premium )?requests available this month\\.( Upgrade your plan to increase your limit\\.)? Limit resets on (.+?)\\.${FREEZE}$`
      ),
      (_, premium: string, upgrade: string, date: string, freeze = '') =>
        `本月可用${premium ? '高级' : ''}请求已全部用完。${upgrade ? '升级计划可提高限额。' : ''}${resetTail(date)}${freeze ? FREEZE_TEXT : ''}`
    ],
    [
      /^You have used all premium requests available this month\. Enable additional requests to get more\. Limit resets on (.+)\.$/,
      (_, date: string) => `本月可用高级请求已全部用完。启用额外请求可获取更多使用量。${resetTail(date)}`
    ],
    [
      /^You have reached your monthly limit for premium requests\. Ask your admin to increase your limit\. Limit resets on (.+)\.$/,
      (_, date: string) => `本月高级请求已达上限。请管理员提高限额。${resetTail(date)}`
    ],
    [
      /^You have used all premium requests available this month\. You will be charged per additional premium request until the limit resets on (.+)\.$/,
      (_, date: string) =>
        `本月可用高级请求已全部用完。${joinCjk(joinCjk('在限额于', translateTime(date)), '重置前')}，每个额外的高级请求将单独计费。`
    ],
    [
      new RegExp(`^You have reached your free plan limit\\. Limit resets on (.+?)\\.${FREEZE}$`),
      (_, date: string, freeze = '') => `已达免费计划上限。${resetTail(date)}${freeze ? FREEZE_TEXT : ''}`
    ],
    [
      /^You don['’]t have enough AI credits to start a session\. Limit resets on (.+)\.$/,
      (_, date: string) => `AI 额度不足，无法开始会话。${resetTail(date)}`
    ],
    [
      /^You['’]ve hit your session limit\. Please upgrade your plan or wait (?:(\d+) (hour|minute)s? )?for your limit to reset\.$/,
      (_, amount: string, unit: string) =>
        `已达会话上限。请升级计划，或等待${amount ? ` ${amount}${unit === 'hour' ? '小时' : '分钟'}后` : ''}限额重置。`
    ],
    [
      /^You['’]ve exceeded your weekly usage limit\.(?: Your limit will reset in (\d+) (hour|minute)s?\.)? Please upgrade your plan or wait for your limit to reset\.$/,
      (_, amount = '', unit = '') =>
        `已超出每周使用限制。${amount ? `限额将在 ${amount}${unit === 'hour' ? '小时' : '分钟'}后重置。` : ''}请升级计划或等待限额重置。`
    ],

    // 额外使用量上限横幅（“额外使用量上限”链接之后的整段）
    [
      new RegExp(
        `^You['’]ve reached your additional usage limit for your plan\\. Pay for your additional usage to continue\\. Otherwise, wait until your credits reset (${TIME_SOURCE})\\.$`
      ),
      (_, time: string) =>
        `已达计划的额外使用量上限。请为额外使用量付费以继续。否则，${joinCjk(joinCjk('请等待额度于', translateTime(time)), '重置。')}`
    ],
    [
      new RegExp(
        `^\\. Upgrade to (.+?) for (\\S+) to get an additional (\\S+) in credits, or pay (\\S+) to continue on (.+?)\\. Credits reset (${TIME_SOURCE})\\.$`
      ),
      (_, plan: string, price: string, credit: string, pay: string, current: string, time: string) =>
        `。以 ${price} ${upgradeTo(plan, '可额外获得')} ${credit} 额度，或支付 ${pay} ${joinCjk('继续使用', copilotPlan(current))}。${creditResetTail(time)}`
    ],
    [
      new RegExp(
        `^\\. Upgrade to (.+?) for (\\S+) and cut additional usage from (\\S+) to (\\S+), or pay (\\S+) to continue on (.+?)\\. Credits reset (${TIME_SOURCE})\\.$`
      ),
      (_, plan: string, price: string, from: string, to: string, pay: string, current: string, time: string) =>
        `。以 ${price} ${upgradeTo(plan, '可将额外使用量从')} ${from} 降至 ${to}，或支付 ${pay} ${joinCjk('继续使用', copilotPlan(current))}。${creditResetTail(time)}`
    ],
    // 额外使用量生效横幅：包含的额度重置前改用额外使用量（重置日期可省略）
    [
      new RegExp(`^You['’]re now using additional usage until your included credits reset(?: (${TIME_SOURCE}))?\\.$`),
      (_, time = '') => `你正在使用额外使用量直到包含的额度${time ? joinCjk(joinCjk('于', translateTime(time)), '重置。') : '重置。'}`
    ]
  ]
} satisfies PageDictionary
