import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText, type Matcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import copilot from '../../../src/locales/zh-CN/copilot'
import twCommon from '../../../src/locales/zh-TW/common'
import twCommonUi from '../../../src/locales/zh-TW/common-ui'
import twCopilot from '../../../src/locales/zh-TW/copilot'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = copilot

const matcher = createMatcher([['copilot', copilot]])
/** 含通用词典，与实际页面一致：横幅标题等通用词由 common / common-ui 翻译 */
const fullMatcher = createMatcher([
  ['common', common],
  ['common', commonUi],
  ['copilot', copilot]
])

/** Copilot 页的作用域：common → copilot */
function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'copilot'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/**
 * 按合并顺序排列（chat → models → skills → workbench → agents → session-log → spaces → code → composer → app → plans），
 * 每条正则至少一个正例、一个反例
 */
const REGEXP_CASES: readonly RegExpCase[] = [
  {
    hits: [['Delete conversation: "Refactor login"', '删除对话：“Refactor login”']],
    misses: ['Delete conversation now']
  },
  { hits: [['12 repositories found', '找到 12 个存储库']], misses: ['Some repositories found'] },
  {
    hits: [
      ['3 references', '3 个引用'],
      ['1 reference', '1 个引用']
    ],
    misses: ['No references yet']
  },
  {
    hits: [['You can add up to 5 image files per message.', '每条消息最多可添加 5 个图片文件。']],
    misses: ['You can add image files per message.']
  },
  {
    hits: [['An error occurred uploading the attachment screenshot.png', '上传附件 screenshot.png 时出错']],
    misses: ['An error occurred uploading']
  },
  {
    hits: [['Attached text files must be smaller than 100KB', '附加的文本文件必须小于 100 KB']],
    misses: ['Attached text files must be smaller than 1 MB']
  },
  {
    hits: [
      [
        '"notes.bin" has an unsupported file type. Please try again with a plain text file',
        '“notes.bin”的文件类型不受支持。请改用纯文本文件重试'
      ]
    ],
    misses: ['Unsupported file type']
  },
  {
    hits: [['Personal instructions must be 4000 characters or fewer.', '个人说明不能超过 4000 个字符。']],
    misses: ['Personal instructions must be short.']
  },
  {
    hits: [
      [
        'The GPT-4o model currently doesn’t support external context from ongoing conversations. Start a new conversation to chat with this model.',
        'GPT-4o 模型目前不支持来自进行中对话的外部上下文。开始新对话以使用此模型。'
      ]
    ],
    misses: ['The model currently doesn’t support external context.']
  },
  {
    hits: [
      [
        'The o3 model doesn’t support answering questions about images. Start a new conversation without images to chat with this model.',
        'o3 模型不支持回答有关图片的问题。开始不含图片的新对话以使用此模型。'
      ]
    ],
    misses: ['The model doesn’t support images.']
  },
  {
    hits: [
      [
        "The o3 model doesn't support answering questions about images. Select a different model and try again.",
        'o3 模型不支持回答有关图片的问题。请选择其他模型后重试。'
      ]
    ],
    misses: ['Select a different model']
  },
  { hits: [['Connect with Docker', '连接 Docker']], misses: ['Connecting soon'] },
  {
    hits: [
      [
        'To use the Docker extension, you’ll need to connect your GitHub account to your Docker account.',
        '要使用 Docker 扩展，需要将你的 GitHub 帐户连接到 Docker 帐户。'
      ]
    ],
    misses: ['To use the extension, connect your account.']
  },
  {
    hits: [['Click connect to be redirected to https://example.com/auth', '单击连接后将跳转到 https://example.com/auth']],
    misses: ['Click connect']
  },
  {
    hits: [['Dismissed the connection with Docker.', '已取消与 Docker 的连接。']],
    misses: ['Dismissed the connection']
  },
  {
    hits: [['I was unable to connect you to Docker because you cancelled the authentication.', '你取消了身份验证，无法连接到 Docker。']],
    misses: ['I was unable to connect you']
  },
  {
    hits: [
      ['Ran tool call and 2 other tool calls', '已运行工具调用及另外 2 个'],
      ['Running tool call and 1 other tool call', '正在运行工具调用及另外 1 个']
    ],
    misses: ['Running tool calls']
  },
  { hits: [['No sessions matching "auth"', '没有与“auth”匹配的会话']], misses: ['No sessions matching'] },
  { hits: [['Recent sessions on octo/repo#12', 'octo/repo#12 的最近会话']], misses: ['Recent sessions'] },
  {
    hits: [
      ['3 results.', '3 个结果。'],
      ['1 result.', '1 个结果。']
    ],
    misses: ['Some results.']
  },
  {
    hits: [
      ['5 conversations loaded.', '已加载 5 个对话。'],
      ['1 conversation loaded.', '已加载 1 个对话。']
    ],
    misses: ['Conversations loaded.']
  },
  // 确认卡片的处理结果：用户名与状态、the action 是相邻文本节点，整段匹配
  { hits: [['octocat accepted the action', 'octocat 允许了此操作']], misses: ['accepted the action'] },
  { hits: [['octocat dismissed the action', 'octocat 拒绝了此操作']], misses: ['octocat dismissed the actions'] },
  {
    hits: [['Are you sure you wish to execute the "Get file contents" tool?', '确定要执行“Get file contents”工具吗？']],
    misses: ['Are you sure you wish to execute this tool?']
  },
  {
    hits: [
      ['Model: GPT-5, applying optimization', '模型：GPT-5，正在应用优化'],
      ['Model: GPT-5, selected for the next message', '模型：GPT-5，已为下一条消息选择']
    ],
    misses: ['Model GPT-5 applying optimization']
  },
  { hits: [['Model: Claude Sonnet 4', '模型：Claude Sonnet 4']], misses: ['Model selection'] },
  { hits: [['Retry with Claude Sonnet 4', '使用 Claude Sonnet 4 重试']], misses: ['Retry'] },
  { hits: [['Auto is currently using GPT-5 mini', 'Auto 当前使用 GPT-5 mini']], misses: ['Auto is currently using'] },
  {
    hits: [
      ['Upgrade to Copilot Pro+ to access this model', '升级到 Copilot 专业增强版以使用此模型'],
      // 未收录的方案名保留原文
      ['Upgrade to Copilot Max to access this model', '升级到 Copilot Max 以使用此模型']
    ],
    misses: ['Upgrade to access this model']
  },
  { hits: [['This model requires Copilot Pro', '此模型需要 Copilot 专业版']], misses: ['This model requires a plan'] },
  {
    hits: [
      ['Upgrade to Copilot Max', '升级到 Copilot Max'],
      ['Upgrade to Copilot Business', '升级到 Copilot 商业版']
    ],
    misses: ['Upgrade to Enterprise']
  },
  { hits: [['10% off', '优惠 10%']], misses: ['Ten percent off'] },
  {
    hits: [
      ['Use of this model through Auto will be billed at a 10% discount.', '通过 Auto 使用此模型可享受 10% 的计费折扣。'],
      ['Model use through Auto will be billed at a 7.5% discount.', '通过 Auto 使用模型可享受 7.5% 的计费折扣。']
    ],
    misses: ['Billed at a discount.']
  },
  {
    hits: [
      ['Optimized for: Efficiency', '优化方向：效率'],
      // 原文无冒号，译文不加
      ['Optimized for Intelligence', '针对智能优化']
    ],
    misses: ['Optimized for: Speed']
  },
  { hits: [['Balance optimization applied.', '已应用均衡优化。']], misses: ['Speed optimization applied.'] },
  { hits: [['Applying Intelligence…', '正在应用智能优化…']], misses: ['Applying Speed…'] },
  {
    hits: [['Optimized for Efficiency · Applying Balance…', '针对效率优化 · 正在应用均衡优化…']],
    misses: ['Optimized for Efficiency · Applying Speed…']
  },
  { hits: [['Balance applying', '正在应用均衡优化']], misses: ['Speed applying'] },
  {
    hits: [['Intelligence selected for the next message', '已为下一条消息选择智能优化']],
    misses: ['Speed selected for the next message']
  },
  {
    hits: [
      ['Reasoning effort: Extra High', '推理强度：超高'],
      ['Reasoning effort: Default', '推理强度：默认']
    ],
    misses: ['Reasoning effort: Ultra']
  },
  { hits: [['High reasoning', '高强度推理']], misses: ['Ultra reasoning'] },
  {
    hits: [
      ['GPT-5 (Medium reasoning)', 'GPT-5（中强度推理）'],
      ['o3 (No reasoning)', 'o3（不推理）']
    ],
    misses: ['GPT-5 (Ultra reasoning)']
  },
  { hits: [['Low (Default)', '低（默认）']], misses: ['Ultra (Default)'] },
  {
    hits: [
      ['1.5 AI credits', '1.5 AI 额度'],
      ['1,234.50 AI credits', '1,234.50 AI 额度'],
      ['1.00 AI credit', '1.00 AI 额度']
    ],
    misses: ['Some AI credits']
  },
  { hits: [['1,234.5 AI credits used', '已使用 1,234.5 AI 额度']], misses: ['AI credits used'] },
  { hits: [['12.5 / 300 AI credits', '12.5 / 300 AI 额度']], misses: ['Some / many AI credits'] },
  {
    hits: [
      ['1,234 tokens', '1,234 个令牌'],
      ['1 token', '1 个令牌']
    ],
    misses: ['Many tokens']
  },
  {
    hits: [
      ['300 premium requests', '300 个高级请求'],
      ['1 premium request', '1 个高级请求']
    ],
    misses: ['Premium requests']
  },
  // 代理会话页标题栏：分隔符、数字与单位拼成一段（单数也写作 requests）
  {
    hits: [
      ['· 3 premium requests', '· 3 个高级请求'],
      ['· 1 premium requests', '· 1 个高级请求']
    ],
    misses: ['· premium requests']
  },
  { hits: [['Included credits: 45% used', '包含的额度：已使用 45%']], misses: ['Included credits: many used'] },
  { hits: [['Additional usage: 12.5% used', '额外使用量：已使用 12.5%']], misses: ['Additional usage: lots used'] },
  { hits: [['Monthly limit: 80% used', '每月上限：已使用 80%']], misses: ['Monthly limit: most used'] },
  { hits: [['Copilot chat messages quota usage', 'Copilot 聊天消息配额使用情况']], misses: ['Copilot quota usage'] },
  {
    hits: [
      ['Resets on Nov 1', '11月1日重置'],
      ['Resets in 3 days', '3天后重置'],
      ['Resets tomorrow', '明天重置']
    ],
    misses: ['Resets soon']
  },
  {
    hits: [
      ['Limit resets on December 1.', '限额将于 12月1日重置。'],
      // 中文开头的时间不补空格
      ['Limit resets tomorrow.', '限额将于明天重置。']
    ],
    misses: ['Limit resets soon.']
  },
  {
    hits: [
      ["You've used 75% of your included AI credits.", '你已使用包含的 AI 额度的 75%。'],
      ["You've used 90% of your included AI credits. Limit resets on Nov 1.", '你已使用包含的 AI 额度的 90%。限额将于 11月1日重置。']
    ],
    misses: ["You've used most of your included AI credits."]
  },
  {
    hits: [['You have used 80% of your monthly usage limit.', '你已使用每月使用限制的 80%。']],
    misses: ['You have used most of your monthly usage limit.']
  },
  {
    hits: [["You've used 75% of your budget for additional AI credits.", '你已使用额外 AI 额度预算的 75%。']],
    misses: ["You've used your budget."]
  },
  {
    hits: [
      ['You have used 90% of your premium requests this month.', '你已使用本月高级请求的 90%。'],
      ["You've used 80% of your premium requests this month.", '你已使用本月高级请求的 80%。'],
      [
        'You have used 75% of your free requests this month. Upgrade to increase your limit.',
        '你已使用本月免费请求的 75%。升级以提高限额。'
      ],
      [
        'You have used 80% of your premium responses this month. Enable additional requests to get more usage after the limit is reached.',
        '你已使用本月高级回复的 80%。启用额外请求，达到上限后仍可继续使用。'
      ]
    ],
    misses: ['You have used most of your requests this month.', 'You used 80% of your premium requests this month.']
  },
  {
    hits: [
      ["You're almost out of your included usage with the free plan.", '免费计划包含的使用量即将用完。'],
      [
        "You're out of your included usage with the free plan. Limit resets on Nov 1.",
        '免费计划包含的使用量已用完。限额将于 11月1日重置。'
      ]
    ],
    misses: ["You're out of usage."]
  },
  {
    hits: [
      [
        "You've run out of your included AI credits for the month. Limit resets on Dec 1.",
        '本月包含的 AI 额度已用完。限额将于 12月1日重置。'
      ]
    ],
    misses: ["You've run out of credits."]
  },
  {
    hits: [
      [
        'Usage paused until your monthly limit resets on Nov 1. Request your administrator for additional usage.',
        '使用已暂停，每月上限将于 11月1日重置。如需额外使用量，请联系管理员。'
      ]
    ],
    misses: ['Usage paused until later.']
  },
  {
    hits: [
      ['You have used all requests available this month. Limit resets on November 1.', '本月可用请求已全部用完。限额将于 11月1日重置。'],
      [
        'You have used all premium requests available this month. Upgrade your plan to increase your limit. Limit resets on Nov 1, 2026.',
        '本月可用高级请求已全部用完。升级计划可提高限额。限额将于 2026年11月1日重置。'
      ],
      [
        'You have used all requests available this month. Limit resets on Nov 1. Plan upgrades are temporarily unavailable.',
        '本月可用请求已全部用完。限额将于 11月1日重置。计划升级暂不可用。'
      ]
    ],
    misses: ['You have used all requests.']
  },
  {
    hits: [
      [
        'You have used all premium requests available this month. Enable additional requests to get more. Limit resets on Nov 1.',
        '本月可用高级请求已全部用完。启用额外请求可获取更多使用量。限额将于 11月1日重置。'
      ]
    ],
    misses: ['Enable additional requests to get more.']
  },
  {
    hits: [
      [
        'You have reached your monthly limit for premium requests. Ask your admin to increase your limit. Limit resets on Nov 1.',
        '本月高级请求已达上限。请管理员提高限额。限额将于 11月1日重置。'
      ],
      // 无法识别的日期原样保留，与两侧中文之间补空格
      [
        'You have reached your monthly limit for premium requests. Ask your admin to increase your limit. Limit resets on 2026-11-01.',
        '本月高级请求已达上限。请管理员提高限额。限额将于 2026-11-01 重置。'
      ]
    ],
    misses: ['Ask your admin to increase your limit.']
  },
  {
    hits: [
      [
        'You have used all premium requests available this month. You will be charged per additional premium request until the limit resets on Nov 1.',
        '本月可用高级请求已全部用完。在限额于 11月1日重置前，每个额外的高级请求将单独计费。'
      ],
      [
        'You have used all premium requests available this month. You will be charged per additional premium request until the limit resets on 2026-11-01.',
        '本月可用高级请求已全部用完。在限额于 2026-11-01 重置前，每个额外的高级请求将单独计费。'
      ]
    ],
    misses: ['You will be charged per additional premium request.']
  },
  {
    hits: [
      ['You have reached your free plan limit. Limit resets on Nov 1.', '已达免费计划上限。限额将于 11月1日重置。'],
      [
        'You have reached your free plan limit. Limit resets on Nov 1. Plan upgrades are temporarily unavailable.',
        '已达免费计划上限。限额将于 11月1日重置。计划升级暂不可用。'
      ]
    ],
    misses: ['You have reached your free plan limit.']
  },
  {
    hits: [
      [
        "You don't have enough AI credits to start a session. Limit resets on Nov 1.",
        'AI 额度不足，无法开始会话。限额将于 11月1日重置。'
      ]
    ],
    misses: ['Not enough AI credits. Limit resets on Nov 1.']
  },
  {
    hits: [
      [
        "You've hit your session limit. Please upgrade your plan or wait for your limit to reset.",
        '已达会话上限。请升级计划，或等待限额重置。'
      ],
      [
        "You've hit your session limit. Please upgrade your plan or wait 3 hours for your limit to reset.",
        '已达会话上限。请升级计划，或等待 3小时后限额重置。'
      ]
    ],
    misses: ["You've hit your session limit."]
  },
  {
    hits: [
      [
        "You've exceeded your weekly usage limit. Please upgrade your plan or wait for your limit to reset.",
        '已超出每周使用限制。请升级计划或等待限额重置。'
      ],
      [
        "You've exceeded your weekly usage limit. Your limit will reset in 5 hours. Please upgrade your plan or wait for your limit to reset.",
        '已超出每周使用限制。限额将在 5小时后重置。请升级计划或等待限额重置。'
      ]
    ],
    misses: ["You've exceeded your weekly usage limit."]
  },
  {
    hits: [
      [
        "You've reached your additional usage limit for your plan. Pay for your additional usage to continue. Otherwise, wait until your credits reset on November 1.",
        '已达计划的额外使用量上限。请为额外使用量付费以继续。否则，请等待额度于 11月1日重置。'
      ]
    ],
    misses: ["You've reached your additional usage limit for your plan."]
  },
  {
    hits: [
      [
        '. Upgrade to Copilot Pro+ for $39.00 to get an additional $10.00 in credits, or pay $5.00 to continue on Copilot Pro. Credits reset November 1.',
        '。以 $39.00 升级到 Copilot 专业增强版可额外获得 $10.00 额度，或支付 $5.00 继续使用 Copilot 专业版。额度将于 11月1日重置。'
      ]
    ],
    misses: ['. Upgrade to Copilot Pro+ for $39.00.']
  },
  {
    hits: [
      [
        '. Upgrade to Copilot Pro+ for $39.00 and cut additional usage from $25.00 to $15.00, or pay $25.00 to continue on Copilot Pro. Credits reset November 1.',
        '。以 $39.00 升级到 Copilot 专业增强版可将额外使用量从 $25.00 降至 $15.00，或支付 $25.00 继续使用 Copilot 专业版。额度将于 11月1日重置。'
      ]
    ],
    misses: ['. Upgrade to Copilot Pro+ and cut additional usage.']
  },
  {
    hits: [
      [
        "You're now using additional usage until your included credits reset on Nov 1.",
        '你正在使用额外使用量直到包含的额度于 11月1日重置。'
      ],
      ["You're now using additional usage until your included credits reset.", '你正在使用额外使用量直到包含的额度重置。']
    ],
    misses: ["You're now using additional usage until your included credits reset soon."]
  },
  {
    hits: [['An error occurred when searching for “react hooks”', '搜索“react hooks”时出错']],
    misses: ['An error occurred when searching']
  },
  { hits: [['Searching the web for “react hooks”', '正在网页上搜索“react hooks”']], misses: ['Searching the web'] },
  {
    hits: [['No web search results for “react hooks” were found', '未找到“react hooks”的网页搜索结果']],
    misses: ['No web search results were found']
  },
  {
    hits: [['Using web search results for “react hooks”', '正在使用“react hooks”的网页搜索结果']],
    misses: ['Using web search results']
  },
  {
    hits: [['Searching support documents for “billing”', '正在搜索与“billing”相关的支持文档']],
    misses: ['Searching support documents']
  },
  {
    hits: [['No support documents for “billing” were found', '未找到与“billing”相关的支持文档']],
    misses: ['No support documents were found']
  },
  {
    hits: [['Using support search results for “billing”', '正在使用“billing”的支持搜索结果']],
    misses: ['Using support search results']
  },
  { hits: [['Search for "auth" in "repo:octo/app"', '在“repo:octo/app”中搜索“auth”']], misses: ['Search for auth'] },
  {
    hits: [['Search results for "auth" in "repo:octo/app"', '“auth”在“repo:octo/app”中的搜索结果']],
    misses: ['Search results for auth']
  },
  {
    hits: [['An error occurred when finding “src/app.ts” in octo/app', '在 octo/app 中查找“src/app.ts”时出错']],
    misses: ['An error occurred when finding a file in octo/app']
  },
  {
    hits: [['An error occurred when finding file changes for “src/app.ts” in octo/app', '在 octo/app 中查找“src/app.ts”的文件更改时出错']],
    misses: ['An error occurred when finding file changes']
  },
  {
    hits: [['File results for “src/app.ts” in octo/app', '“src/app.ts”在 octo/app 中的文件结果']],
    misses: ['File results']
  },
  {
    hits: [['No files matching “*.md” in octo/app were found', '在 octo/app 中未找到与“*.md”匹配的文件']],
    misses: ['No files matching were found']
  },
  {
    hits: [['No files changes were found for “src/app.ts” in octo/app', '在 octo/app 中未找到“src/app.ts”的文件更改']],
    misses: ['No files changes were found']
  },
  {
    hits: [['Using results for “src/app.ts” in octo/app', '正在使用“src/app.ts”在 octo/app 中的结果']],
    misses: ['Using results']
  },
  {
    hits: [['File changes for src/app.ts in octo/app', 'octo/app 中 src/app.ts 的文件更改']],
    misses: ['File changes for src/app.ts']
  },
  { hits: [['View file src/app.ts', '查看文件 src/app.ts']], misses: ['View files'] },
  { hits: [['View file changes for src/app.ts', '查看 src/app.ts 的文件更改']], misses: ['View file changes'] },
  { hits: [['View directory src/components', '查看目录 src/components']], misses: ['View directory'] },
  { hits: [['Fetching discussion 42', '正在获取讨论 42']], misses: ['Fetching discussion general'] },
  { hits: [['Unable to fetch discussion 42', '无法获取讨论 42']], misses: ['Unable to fetch discussion general'] },
  { hits: [['Using discussion #42', '正在使用讨论 #42']], misses: ['Using discussion general'] },
  { hits: [['Details about discussion #42', '讨论 #42 的详细信息']], misses: ['Details about discussion'] },
  {
    hits: [
      ['Fetching logs for job 123 in octo/app', '正在获取 octo/app 中作业 123 的日志'],
      ['An error occurred when fetching logs for workflow run 456 in octo/app', '获取 octo/app 中工作流运行 456 的日志时出错']
    ],
    misses: ['Fetching logs for job 123']
  },
  {
    hits: [['Fetching endpoint /repos/octo/app/issues', '正在获取端点 /repos/octo/app/issues']],
    misses: ['Fetching endpoint']
  },
  {
    hits: [['Using endpoint /repos/octo/app/issues', '正在使用端点 /repos/octo/app/issues']],
    misses: ['Using endpoint']
  },
  {
    hits: [['Unable to fetch from /repos/octo/app/issues', '无法从 /repos/octo/app/issues 获取']],
    misses: ['Unable to fetch']
  },
  {
    hits: [['An error occurred when fetching from /repos/octo/app/issues', '从 /repos/octo/app/issues 获取时出错']],
    misses: ['An error occurred when fetching']
  },
  { hits: [['Fetching /repos/octo/app/releases', '正在获取 /repos/octo/app/releases']], misses: ['Fetching releases'] },
  {
    hits: [['Results of /repos/octo/app/releases', '/repos/octo/app/releases 的结果']],
    misses: ['Results of releases']
  },
  {
    hits: [
      ['Using the GitHub API to list releases', '正在通过 GitHub API 执行 list releases'],
      ['Unable to use the GitHub API to list releases', '无法通过 GitHub API 执行 list releases'],
      ['An error occurred when using the GitHub API to list releases', '通过 GitHub API 执行 list releases 时出错']
    ],
    misses: ['Using the GitHub API']
  },
  { hits: [['Retrieving job 123 in octo/app', '正在检索 octo/app 中的作业 123']], misses: ['Retrieving job 123'] },
  {
    hits: [
      ['Job 123 in octo/app', 'octo/app 中的作业 123'],
      ['Workflow run 456 in octo/app', 'octo/app 中的工作流运行 456']
    ],
    misses: ['Job 123 in the repository']
  },
  { hits: [['Get file src/app.ts', '获取文件 src/app.ts']], misses: ['Get the file'] },
  { hits: [['Get file changes for src/app.ts', '获取 src/app.ts 的文件更改']], misses: ['Get changes'] },
  { hits: [['Get data from /repos/octo/app', '从 /repos/octo/app 获取数据']], misses: ['Get data'] },
  {
    hits: [['View search results for auth middleware', '查看 auth middleware 的搜索结果']],
    misses: ['View search results']
  },
  {
    hits: [['Drafting update for @octo/app/issues/12', '正在为 octo/app#12 起草更新']],
    misses: ['Drafting update for octo/app']
  },
  {
    hits: [['Drafted update for @octo/app/issues/12', '已为 octo/app#12 起草更新']],
    misses: ['Drafted update for octo/app']
  },
  { hits: [['Drafting issue in octo/app', '正在 octo/app 中起草议题']], misses: ['Drafting issue in the repository'] },
  { hits: [['Drafted issue in octo/app', '已在 octo/app 中起草议题']], misses: ['Drafted issue in the repository'] },
  { hits: [['Fetching metadata from octo/app', '正在获取 octo/app 的元数据']], misses: ['Fetching metadata'] },
  { hits: [['Using metadata from octo/app', '正在使用 octo/app 的元数据']], misses: ['Using metadata'] },
  { hits: [['Creating agent task in octo/app', '正在 octo/app 中创建代理任务']], misses: ['Creating agent task'] },
  { hits: [['Created agent task in octo/app', '已在 octo/app 中创建代理任务']], misses: ['Created agent task'] },
  { hits: [['Researching octo/app', '正在研究 octo/app']], misses: ['Researching the repository'] },
  { hits: [['Research completed for octo/app', '已完成对 octo/app 的研究']], misses: ['Research completed'] },
  {
    hits: [
      ['An error occurred while searching Bing', '搜索必应时出错'],
      ['An error occurred while getting job logs', '获取作业日志时出错']
    ],
    misses: ['An error occurred while thinking']
  },
  { hits: [['Explain why job 123 failed.', '解释作业 123 失败的原因。']], misses: ['Explain why the job failed.'] },
  {
    hits: [
      ['Positive feedback submitted', '已提交正面反馈'],
      ['negative feedback submitted', '已提交负面反馈']
    ],
    misses: ['Neutral feedback submitted']
  },
  {
    hits: [['Are you sure you want to unshare all 3 conversations?', '确定要取消分享全部 3 个对话吗？']],
    misses: ['Are you sure you want to unshare all conversations?']
  },
  {
    hits: [['Authenticate with SSO to access octo-org', '通过 SSO 验证以访问 octo-org']],
    misses: ['Authenticate with SSO']
  },
  { hits: [['Single sign-on for octo-org', 'octo-org 的单一登录']], misses: ['Single sign-on'] },
  {
    hits: [['GitHub Docs (opens a new page)', 'GitHub Docs（打开新页面）']],
    misses: ['GitHub Docs (opens in a new tab)']
  },
  { hits: [['Pasted content 2', '粘贴的内容 2']], misses: ['Pasted contents'] },
  { hits: [['Pasted Image 2', '粘贴的图片 2']], misses: ['Pasted Images'] },
  {
    hits: [
      ['Expand Pasted content 2', '展开粘贴的内容 2'],
      ['Remove Pasted content 1', '删除粘贴的内容 1']
    ],
    misses: ['Expand Pasted content']
  },
  {
    hits: [['Attach Pasted content 2 as file', '将粘贴的内容 2 附加为文件']],
    misses: ['Attach Pasted content as file']
  },
  {
    hits: [
      ['Block pasted, 3 total', '已添加代码块，共 3 个'],
      ['Code block added, 2 total', '已添加代码块，共 2 个']
    ],
    misses: ['Block pasted']
  },
  {
    hits: [
      ['Block removed, 2 left', '已删除代码块，剩余 2 个'],
      ['Code block removed, 1 remaining', '已删除代码块，剩余 1 个']
    ],
    misses: ['Block removed']
  },
  { hits: [['Opened app.ts in Workbench.', '已在工作台中打开 app.ts。']], misses: ['Opened in Workbench'] },
  { hits: [['Create 3 issues', '创建 3 个议题']], misses: ['Create issues'] },
  { hits: [['Saved 3 issues', '已保存 3 个议题']], misses: ['Saved issues'] },
  {
    hits: [['Issue update failed: 2 operations failed', '议题更新失败：2 项操作失败']],
    misses: ['Issue update failed']
  },
  { hits: [['Use the octo/app repository', '使用 octo/app 存储库']], misses: ['Use the repository'] },
  { hits: [["Changing template to 'Bug report'…", '正在将模板更改为“Bug report”…']], misses: ['Changing template…'] },
  { hits: [["Use the 'Bug report' template", '使用“Bug report”模板']], misses: ['Use the template'] },
  { hits: [['octo/app is not found', '未找到 octo/app']], misses: ['The repository is not found'] },
  {
    hits: [
      [
        'You cannot create more than 25 new issues at a time. Please remove some draft issues from the tree and try again.',
        '一次最多只能创建 25 个新议题。请从树中删除部分草稿议题后重试。'
      ]
    ],
    misses: ['You cannot create more new issues.']
  },
  {
    hits: [
      [
        'You cannot add more than 8 levels of sub-issues. Please remove some issues from the tree and try again.',
        '子议题最多只能有 8 层。请从树中删除部分议题后重试。'
      ]
    ],
    misses: ['You cannot add more levels of sub-issues.']
  },
  {
    hits: [
      [
        "The selected repository (octo/app) doesn't match the repository Copilot suggested (octo/web). Please select a repository you have access to.",
        '所选存储库 (octo/app) 与 Copilot 建议的存储库 (octo/web) 不一致。请选择你有权访问的存储库。'
      ]
    ],
    misses: ["The selected repository doesn't match."]
  },
  { hits: [['View file: src/app.ts', '查看文件：src/app.ts']], misses: ['View files:'] },
  {
    // 文件 / 差异预览工具栏：相邻文本节点整段匹配，新增、删除的文件带前缀
    hits: [
      ['12 lines · 1 KB', '12 行 · 1 KB'],
      ['1 line · 504 bytes', '1 行 · 504 字节'],
      ['Added: 12 lines · 1 KB', '已添加：12 行 · 1 KB'],
      ['Deleted: 1 line · 1 byte', '已删除：1 行 · 1 字节']
    ],
    misses: ['12 lines', 'Added: 12 lines']
  },
  { hits: [['Issue #12', '议题 #12']], misses: ['Issue #abc'] },
  {
    hits: [
      ['3 assignees', '3 个受理人'],
      ['1 assignee', '1 个受理人']
    ],
    misses: ['No assignees']
  },
  { hits: [['Show 5 more', '再显示 5 个']], misses: ['Show more items'] },
  { hits: [['3 similar code snippets found', '找到 3 个相似的代码片段']], misses: ['Similar code snippets found'] },
  {
    hits: [
      ['Public code references from 2 repositories', '来自 2 个存储库的公共代码引用'],
      ['Public code references from 1 repository', '来自 1 个存储库的公共代码引用']
    ],
    misses: ['Public code references']
  },
  {
    hits: [
      ['3 vulnerabilities detected', '检测到 3 个漏洞'],
      ['1 vulnerability detected', '检测到 1 个漏洞']
    ],
    misses: ['Vulnerabilities detected']
  },
  { hits: [['Image not available: diagram', '图片不可用：diagram']], misses: ['Image not found'] },
  {
    hits: [['Draft a PR comment for: Use a constant here', '起草 PR 评论：Use a constant here']],
    misses: ['Draft a PR comment for']
  },
  {
    hits: [['Send suggestion (hold Alt to insert)', '发送建议（按住 Alt 键插入）']],
    misses: ['Send suggestion (hold Ctrl to insert)']
  },
  { hits: [['Version 3', '版本 3']], misses: ['Version three'] },
  { hits: [['HTML preview: dashboard.html', 'HTML 预览：dashboard.html']], misses: ['HTML preview'] },
  { hits: [['Personal (octocat)', '个人 (octocat)']], misses: ['Personal account'] },
  {
    hits: [['Select conversation scope, current: octo-org', '选择对话范围，当前：octo-org']],
    misses: ['Select conversation scope']
  },
  {
    hits: [
      ['3 owners', '3 个所有者'],
      ['1 owner', '1 个所有者']
    ],
    misses: ['Owners']
  },
  {
    hits: [
      ['3 repositories', '3 个存储库'],
      ['1 repository', '1 个存储库']
    ],
    misses: ['Repositories found']
  },
  {
    hits: [
      ['Repositories in @octo-org', '@octo-org 中的存储库'],
      ['Repositories in @octo-org and public repositories', '@octo-org 中的存储库和公共存储库']
    ],
    misses: ['Repositories in octo-org']
  },
  {
    hits: [
      [
        "Repositories are limited to octo-org. Change the Chat scope to work in another owner's repositories.",
        '存储库仅限于 octo-org。更改聊天范围以在其他所有者的存储库中工作。'
      ]
    ],
    misses: ['Repositories are limited.']
  },
  {
    hits: [['Cloud sessions are disabled for octo-org', 'octo-org 已禁用云端会话']],
    misses: ['Cloud sessions are disabled']
  },
  {
    hits: [['Private repository selection is restricted to octo-org.', '专用存储库只能从 octo-org 中选择。']],
    misses: ['Private repository selection is restricted.']
  },
  {
    hits: [
      ['Repository: octo/app', '存储库：octo/app'],
      ['Repository: Select repository', '存储库：选择存储库']
    ],
    misses: ['Repository:']
  },
  { hits: [['Branch: main', '分支：main']], misses: ['Branch:'] },
  { hits: [['Remove octo/app', '删除 octo/app']], misses: ['Remove the repository'] },
  {
    hits: [
      ['Environment: Copilot (Ready)', '环境：Copilot（就绪）'],
      ['Environment: Cloud (Waking)', '环境：云端（唤醒中）'],
      ['Environment: Codespace', '环境：Codespace'],
      // 未知状态保留原文，括号内全为英文时用半角
      ['Environment: Cloud (Paused)', '环境：云端 (Paused)']
    ],
    misses: ['Environment:']
  },
  {
    hits: [
      ['Environment status: Ready', '环境状态：就绪'],
      ['Environment status: Offline', '环境状态：离线'],
      ['Environment status: Draining', '环境状态：排空中']
    ],
    misses: ['Environment status:']
  },
  { hits: [['Copilot environment details', 'Copilot 环境详细信息']], misses: ['Environment details'] },
  {
    hits: [
      ['Chat (octo-org)', '聊天 (octo-org)'],
      ['Chat (Personal)', '聊天（个人）']
    ],
    misses: ['Chat now']
  },
  { hits: [['Mode: Chat (octo-org)', '模式：聊天 (octo-org)']], misses: ['Mode Chat (octo-org)'] },
  { hits: [['Space: Docs space', '空间：Docs space']], misses: ['Space:'] },
  { hits: [['Resolving space: Docs space', '正在解析空间：Docs space']], misses: ['Resolving space'] },
  { hits: [['Space selected: Docs space', '已选择空间：Docs space']], misses: ['Space selected'] },
  {
    hits: [
      ['Agent: Copilot', '代理：Copilot'],
      ['Custom agent: Reviewer', '自定义代理：Reviewer']
    ],
    misses: ['Agent:']
  },
  { hits: [['Mode: Plan', '模式：计划']], misses: ['Mode:'] },
  {
    hits: [
      ['Select CLI agent mode, current: Plan', '选择 CLI 代理模式，当前：计划'],
      ['Select MCP permission mode, current: Ask', '选择 MCP 权限模式，当前：询问']
    ],
    misses: ['Select CLI agent mode']
  },
  {
    hits: [
      ['Tool permissions set to “Allow all”.', '工具权限已设为“全部允许”。'],
      ['Tool permissions are set to “Ask”.', '工具权限已设为“询问”。']
    ],
    misses: ['Tool permissions set.']
  },
  {
    hits: [
      [
        'Tool permissions: "Allow all" isn\'t available for this session. Choose an available option to continue.',
        '工具权限：“全部允许”不适用于此会话。请选择可用选项以继续。'
      ]
    ],
    misses: ['Tool permissions are not available.']
  },
  { hits: [['Log verbosity: Detailed', '日志详细程度：详细']], misses: ['Log verbosity: Loud'] },
  {
    hits: [['Information about the Reviewer agent', '关于 Reviewer 代理的信息']],
    misses: ['Information about the agent']
  },
  {
    hits: [
      ['Claude requires authorization', 'Claude 需要授权'],
      ['Claude requires authorization first.', 'Claude 需要先授权。']
    ],
    misses: ['Authorization pending']
  },
  {
    hits: [["Couldn't start authorization for Claude. Please try again.", '无法开始 Claude 的授权。请重试。']],
    misses: ["Couldn't start authorization."]
  },
  { hits: [['Creating task in octo/app', '正在 octo/app 中创建任务']], misses: ['Creating tasks'] },
  {
    hits: [
      ['New agent session in octo/app', '在 octo/app 中新建代理会话'],
      ['New agent task in octo/app', '在 octo/app 中新建代理会话']
    ],
    misses: ['New agent session']
  },
  {
    hits: [["Unable to start task for 'Fix login'. Please try again.", '无法为“Fix login”启动任务。请重试。']],
    misses: ['Unable to start task.']
  },
  {
    hits: [["Unable to start task for 'Fix login': rate limited", '无法为“Fix login”启动任务：rate limited']],
    misses: ['Unable to start task for Fix login']
  },
  {
    hits: [
      [
        "Task creation failed. Unable to start task for 'Fix login'. Please try again.",
        '任务创建失败。无法为“Fix login”启动任务。请重试。'
      ],
      [
        "Task creation failed. Unable to start task for 'Fix login': Repository not found",
        '任务创建失败。无法为“Fix login”启动任务：Repository not found'
      ],
      [
        'Task creation failed. Before you can use Copilot cloud agent, you need to pick a "Usage billed to" option in your Copilot settings.',
        '任务创建失败。使用 Copilot 云代理前，需在 Copilot 设置中选择“使用量计费对象”。'
      ],
      ['Task creation failed. Internal error', '任务创建失败。Internal error'],
      ['Task creation failed. constructor', '任务创建失败。constructor']
    ],
    misses: ['Task creation failed.', 'Task creation failed now']
  },
  { hits: [['Assign 3 issues to Copilot', '将 3 个议题分配给 Copilot']], misses: ['Assign issues to Copilot'] },
  { hits: [['Assign Copilot to issue', '将 Copilot 分配给议题']], misses: ['Assign to issue now'] },
  { hits: [['Assignment failed for #12', '#12 分配失败']], misses: ['Assignment failed twice'] },
  {
    hits: [['Assignment failed for #12 and #13', '#12 和 #13 分配失败']],
    misses: ['Assignment failed for some issues']
  },
  {
    hits: [
      ['Assignment failed for #12, #13 and 2 others', '#12、#13 及其他 2 个议题分配失败'],
      ['Assignment failed for #12, #13 and 1 other', '#12、#13 及其他 1 个议题分配失败']
    ],
    misses: ['Assignment failed for all']
  },
  {
    hits: [
      [
        'Instructions must be 4,000 characters or fewer. Current length: 4,200 characters.',
        '说明不能超过 4,000 个字符。当前长度：4,200 个字符。'
      ]
    ],
    misses: ['Instructions must be short.']
  },
  {
    hits: [
      [
        'Choose which repositories Claude should be enabled in. Claude will only be available where it is enabled for the repository and in the Copilot license policies.',
        '选择要在哪些存储库中启用 Claude。仅当存储库已启用且 Copilot 许可证策略允许时，Claude 才可用。'
      ]
    ],
    misses: ['Choose which repositories to enable.']
  },
  { hits: [['Claude is working…', 'Claude 正在工作…']], misses: ['Working…'] },
  { hits: [["Copilot's work was cancelled", 'Copilot 的工作已取消']], misses: ['Work was cancelled'] },
  { hits: [['Copilot stopped work due to an error', 'Copilot 因出错而停止工作']], misses: ['Stopped work'] },
  { hits: [['Copilot timed out', 'Copilot 已超时']], misses: ['Timeout'] },
  { hits: [['Only octocat can steer this session', '只有 octocat 可以引导此会话']], misses: ['Only owners can steer'] },
  {
    hits: [['Wait until the session is complete before steering Claude sessions', '请等待会话完成后再引导 Claude 会话']],
    misses: ['Wait until the session is complete']
  },
  { hits: [['This session is steered from Slack', '此会话由 Slack 引导']], misses: ['This session is steered'] },
  {
    hits: [['Continue the conversation in the originating Slack channel.', '在原始 Slack 频道中继续对话。']],
    misses: ['Continue the conversation.']
  },
  {
    hits: [
      ["You can't view this task because you do not have any active sessions.", '你无法查看此任务，因为你没有任何活动会话。'],
      [
        "You can't view this task because you do not have any active sessions for this pull request.",
        '你无法查看此任务，因为你在此拉取请求中没有任何活动会话。'
      ]
    ],
    misses: ["You can't view this task."]
  },
  { hits: [['Remote CLI session', '远程 CLI 会话']], misses: ['Remote session'] },
  { hits: [['VS Code session (read only)', 'VS Code 会话（只读）']], misses: ['Session (read only)'] },
  {
    hits: [
      ['Fix login bug session details', 'Fix login bug 会话详细信息'],
      ['Fix login bug — session details', 'Fix login bug 会话详细信息']
    ],
    misses: ['Session detail']
  },
  { hits: [['Copy branch name copilot/fix-login', '复制分支名 copilot/fix-login']], misses: ['Copy branch name'] },
  { hits: [['Context window 45% used', '已使用上下文窗口的 45%']], misses: ['Context window used'] },
  { hits: [['12.5k cached', '12.5k 已缓存']], misses: ['Some cached'] },
  { hits: [['3.2k reasoning', '3.2k 推理']], misses: ['Some reasoning'] },
  { hits: [['View PR #42', '查看 PR #42']], misses: ['View PR'] },
  { hits: [['2 of 5', '2/5']], misses: ['Two of five'] },
  {
    hits: [
      ['3 results', '3 个结果'],
      ['1 result', '1 个结果']
    ],
    misses: ['No results']
  },
  { hits: [['3 messages queued', '3 条消息已排队']], misses: ['Messages queued'] },
  {
    hits: [['3 messages queued. They will be sent after the current response finishes.', '3 条消息已排队。将在当前回复完成后发送。']],
    misses: ['Messages queued. They will be sent later.']
  },
  {
    hits: [['Queued message removed: Fix tests.', '已删除排队的消息：Fix tests。']],
    misses: ['Queued message removed']
  },
  { hits: [['2 queued messages removed.', '已删除 2 条排队的消息。']], misses: ['Queued messages removed.'] },
  { hits: [['2 queued messages sent now.', '2 条排队的消息已立即发送。']], misses: ['Queued messages sent now.'] },
  {
    hits: [
      ['3 recent sessions available for the attached context', '附加的上下文有 3 个最近会话'],
      ['1 recent session available for the attached context', '附加的上下文有 1 个最近会话']
    ],
    misses: ['Recent sessions available']
  },
  { hits: [['Listed 4 sessions', '已列出 4 个会话']], misses: ['Listed many sessions'] },
  {
    hits: [
      [
        'Copilot will start a background cloud agent session on octo/app. It works independently of this chat.',
        'Copilot 将在 octo/app 上开始后台云代理会话。它独立于此聊天运行。'
      ],
      [
        'Copilot will start a background cloud agent session on octo/app and open a pull request. It works independently of this chat.',
        'Copilot 将在 octo/app 上开始后台云代理会话并创建拉取请求。它独立于此聊天运行。'
      ]
    ],
    misses: ['Copilot will start a background cloud agent session.']
  },
  // 单独的 Review 由 app.ts 的 scoped 翻译
  { hits: [['Review of Fix login bug', '审查 Fix login bug']], misses: ['Review of'] },
  {
    // 与 repo-settings 的“步骤 N/M”一致；引导弹窗页脚的计数不带句点
    hits: [
      ['Step 2 of 4.', '步骤 2/4。'],
      ['Step 1 of 3', '步骤 1/3']
    ],
    misses: ['Step two.', 'Step 1 of 3 done']
  },
  {
    hits: [
      ['View debug log (3 events)', '查看调试日志（3 个事件）'],
      ['View debug log (1 event)', '查看调试日志（1 个事件）']
    ],
    misses: ['View debug logs']
  },
  {
    hits: [
      ['Request failed with status 500.', '请求以状态码 500 失败。'],
      ['Request failed with status 404', '请求以状态码 404 失败']
    ],
    misses: ['Request failed']
  },
  {
    hits: [
      [
        'Unknown /collect-debug-logs option “zip”. Try /collect-debug-logs download.',
        '未知的 /collect-debug-logs 选项“zip”。请尝试 /collect-debug-logs download。'
      ]
    ],
    misses: ['Unknown /collect-debug-logs option.']
  },
  {
    hits: [
      [
        "/pr needs a repository, and this session doesn't have one. Start a session from a repository to use it.",
        '/pr 需要存储库，但此会话没有存储库。请从存储库开始会话后再使用。'
      ]
    ],
    misses: ['This command needs a repository.']
  },
  { hits: [['issue #12', '议题 #12']], misses: ['issue twelve'] },
  { hits: [['pull request #12', '拉取请求 #12']], misses: ['pull request twelve'] },
  { hits: [['discussion #12', '讨论 #12']], misses: ['discussion twelve'] },
  { hits: [['Uploading notes.txt', '正在上传 notes.txt']], misses: ['Uploading'] },
  {
    hits: [['Upload of notes.txt failed: network error', 'notes.txt 上传失败：network error']],
    misses: ['Upload of notes.txt failed']
  },
  { hits: [['Upload failed: network error', '上传失败：network error']], misses: ['Upload failed twice'] },
  { hits: [['Retry upload of notes.txt', '重试上传 notes.txt']], misses: ['Retry upload'] },
  { hits: [['Image: screenshot.png', '图片：screenshot.png']], misses: ['Image:'] },
  { hits: [['Image limit reached (3)', '已达图片上限 (3)']], misses: ['Image limit reached'] },
  {
    hits: [['You can attach up to 3 images per task', '每个任务最多可附加 3 张图片']],
    misses: ['You can attach images per task']
  },
  {
    hits: [
      [
        '2 files could not be attached: a.bin, b.bin. Text and PDF files must be 32 MB or smaller, and you can attach up to 10 text, PDF, or image files at a time.',
        '2 个文件无法附加：a.bin, b.bin。文本和 PDF 文件不能超过 32 MB，且一次最多可附加 10 个文本、PDF 或图片文件。'
      ]
    ],
    misses: ['Files could not be attached.']
  },
  {
    hits: [
      [
        'a.bin could not be attached. Text and PDF files must be 32 MB or smaller, and you can attach up to 10 text, PDF, or image files at a time.',
        '无法附加 a.bin。文本和 PDF 文件不能超过 32 MB，且一次最多可附加 10 个文本、PDF 或图片文件。'
      ]
    ],
    misses: ['a.bin could not be attached.']
  },
  {
    hits: [
      ['3 tool calls', '3 个工具调用'],
      ['1 tool call', '1 个工具调用']
    ],
    misses: ['Tool calls']
  },
  {
    hits: [
      ['2 tool calls failed', '2 个工具调用失败'],
      ['1 tool call failed', '1 个工具调用失败']
    ],
    misses: ['Tool calls failed']
  },
  {
    hits: [
      ['Edited app.ts', '编辑了 app.ts'],
      ['Read app.ts and index.ts', '读取了 app.ts 和 index.ts'],
      ['Created a.ts, b.ts, and 3 more files', '创建了 a.ts、b.ts 及另外 3 个文件'],
      ['Listed src, docs, and 1 more directory', '列出了 src、docs 及另外 1 个目录'],
      ['Searched 3 queries', '搜索了 3 次'],
      ['Fetched 2 pages and 1 other tool call', '获取了 2 个网页及另外 1 个工具调用'],
      ['Updated plan, 1 failed', '更新了计划，1 个失败'],
      ['Used 4 tools', '使用了 4 个工具'],
      ['Ran npm test and 2 other tool calls, 1 failed', '运行了 npm test 及另外 2 个工具调用，1 个失败']
    ],
    misses: ['Edited the plan', 'Updated the plan', 'Read more']
  },
  {
    hits: [
      ['Search 3 times', '搜索 3 次'],
      ['Web search 2 times', '网页搜索 2 次'],
      ['Thought 4 times', '思考 4 次']
    ],
    misses: ['Search many times']
  },
  {
    hits: [
      ['Apply 3 patches', '应用 3 个补丁'],
      ['Edit 2 files', '编辑 2 个文件'],
      ['Run 2 subagent tasks', '运行 2 个子代理任务'],
      ['Reply to 3 comments', '回复 3 条评论']
    ],
    misses: ['Apply 3 files']
  },
  { hits: [['Insert at 3 locations', '在 3 处插入']], misses: ['Insert at locations'] },
  { hits: [['3 progress updates', '3 次进度更新']], misses: ['Progress updates'] },
  { hits: [['4 operations', '4 项操作']], misses: ['Operations'] },
  {
    hits: [
      ['Run Bash command: npm test', '运行 Bash 命令：npm test'],
      ['Web fetch: https://example.com', '网页获取：https://example.com'],
      ['Subagent: Explore', '子代理：Explore']
    ],
    misses: ['Run Bash command:']
  },
  { hits: [['Activate pdf skill', '激活技能 pdf']], misses: ['Activate skill'] },
  {
    hits: [['Run "Install dependencies" custom setup step', '运行“Install dependencies”自定义设置步骤']],
    misses: ['Run custom setup']
  },
  { hits: [['Read pull request (diff)', '读取拉取请求 (diff)']], misses: ['Read pull request diff'] },
  {
    hits: [
      ['Read pull request on octo/app#12', '读取拉取请求 octo/app#12'],
      ['Read pull request (diff) on octo/app#12', '读取拉取请求 (diff) octo/app#12']
    ],
    misses: ['Read pull request on octo/app']
  },
  { hits: [['Call to list_issues', '调用 list_issues']], misses: ['Call to'] },
  {
    hits: [
      ['Send input to Bash session shell-1', '向 Bash 会话 shell-1 发送输入'],
      ['Read logs from PowerShell session ps-2', '读取 PowerShell 会话 ps-2 的日志'],
      ['Stop Bash session shell-1', '停止 Bash 会话 shell-1']
    ],
    misses: ['Stop session shell-1']
  },
  {
    hits: [['Start or send input to long-running Bash session shell-1', '启动长时间运行的 Bash 会话 shell-1 或向其发送输入']],
    misses: ['Start long-running Bash session']
  },
  {
    hits: [['View logs from long-running Bash session shell-1', '查看长时间运行的 Bash 会话 shell-1 的日志']],
    misses: ['View logs from long-running Bash session']
  },
  {
    hits: [['Stop long-running Bash session shell-1', '停止长时间运行的 Bash 会话 shell-1']],
    misses: ['Stop long-running Bash session']
  },
  {
    hits: [["Couldn't compact the conversation: context too large", '无法压缩对话：context too large']],
    misses: ["Couldn't compact the conversation"]
  },
  {
    hits: [
      ['Conversation compacted, removing 12k tokens.', '对话已压缩，删除了 12k 个令牌。'],
      ['Conversation compacted, removing 1,024 tokens.', '对话已压缩，删除了 1,024 个令牌。'],
      ['Conversation compacted, removing 5 messages.', '对话已压缩，删除了 5 条消息。'],
      ['Conversation compacted, removing 12,345 tokens and 1 message.', '对话已压缩，删除了 12,345 个令牌和 1 条消息。']
    ],
    misses: ['Conversation compacted, removing tokens']
  },
  {
    hits: [['The model could not run: quota exceeded', '模型无法运行：quota exceeded']],
    misses: ['The model could not run']
  },
  { hits: [['GPT-5 could not run: quota exceeded', 'GPT-5 无法运行：quota exceeded']], misses: ['Could not run'] },
  {
    hits: [
      ['Explore subagent timeline', 'Explore 子代理时间线'],
      ['Explore subagent activity', 'Explore 子代理活动']
    ],
    misses: ['Subagent timeline']
  },
  { hits: [['Expand diff to show all 120 lines', '展开差异以显示全部 120 行']], misses: ['Expand diff'] },
  { hits: [['Collapse 80 lines', '折叠 80 行']], misses: ['Collapse lines'] },
  { hits: [['Show all 120 lines', '显示全部 120 行']], misses: ['Show all lines'] },
  { hits: [['Created repository octo/new-app', '已创建存储库 octo/new-app']], misses: ['Created a repository'] },
  {
    hits: [['Loading tools from github, playwright...', '正在从 github, playwright 加载工具...']],
    misses: ['Loading tools...']
  },
  {
    hits: [
      ['octocat reviewed', 'octocat 审查了'],
      ['copilot-pull-request-reviewer[bot] commented', 'copilot-pull-request-reviewer[bot] 发表了评论'],
      ['octocat requested changes', 'octocat 请求了更改']
    ],
    misses: ['octocat approved']
  },
  {
    hits: [
      ['3 review comments', '3 条审查评论'],
      ['1 review comment', '1 条审查评论']
    ],
    misses: ['Review comments']
  },
  {
    hits: [["Allow and don't ask again for `git`, `npm`", '允许且不再询问 `git`, `npm`']],
    misses: ["Allow and don't ask again"]
  },
  {
    hits: [['Allow `Create issue` for this session', '本会话中允许 `Create issue`']],
    misses: ['Allow for this session only']
  },
  {
    hits: [
      ['Permission request 1 of 3', '权限请求 1/3'],
      ['Permission request 2 of 3: Run npm test', '权限请求 2/3：Run npm test']
    ],
    misses: ['Permission request']
  },
  { hits: [['Question table 1 of 2', '问题表格 1/2']], misses: ['Question table one'] },
  {
    hits: [
      ['3 files changed', '已更改 3 个文件'],
      ['1 file changed', '已更改 1 个文件']
    ],
    misses: ['Many files changed']
  },
  {
    hits: [
      ['3 files with matches', '3 个文件有匹配项'],
      ['1 file with matches', '1 个文件有匹配项']
    ],
    misses: ['Files with matches']
  },
  {
    hits: [['Could not load the diff for 3 files.', '无法加载 3 个文件的差异。']],
    misses: ['Could not load the diff.']
  },
  {
    hits: [['Could not load the diff for src/app.ts.', '无法加载 src/app.ts 的差异。']],
    misses: ['Could not load the diff for']
  },
  { hits: [['Loading diff for src/app.ts', '正在加载 src/app.ts 的差异']], misses: ['Loading diff'] },
  { hits: [['Exited with code 1', '以退出码 1 退出']], misses: ['Exited with code'] },
  {
    hits: [['npm test output is no longer updating.', 'npm test 输出已停止更新。']],
    misses: ['Output is no longer updating']
  },
  { hits: [['Open npm test output', '打开 npm test 输出']], misses: ['Open output'] },
  { hits: [['Preview of report.html', 'report.html 的预览']], misses: ['Preview of'] },
  {
    hits: [
      ['2 new artifacts available.', '有 2 个新工件可用。'],
      ['1 new artifact available.', '有 1 个新工件可用。']
    ],
    misses: ['New artifacts available.']
  },
  {
    hits: [
      ['Unable to submit message', '无法提交消息'],
      ['Unable to submit messages', '无法提交消息']
    ],
    misses: ['Unable to submit']
  },
  {
    hits: [
      ['Copilot finished the session before it could pick up this message', 'Copilot 在处理该消息前已结束会话'],
      ['Copilot finished the session before it could pick up these messages', 'Copilot 在处理该消息前已结束会话']
    ],
    misses: ['Copilot finished the session']
  },
  {
    hits: [
      ['Private resources owned by octo-org will not be duplicated to the new space.', '归属于 octo-org 的专用资源不会复制到新空间。']
    ],
    misses: ['Private resources will not be duplicated.']
  },
  { hits: [['120 entries not shown', '另有 120 项未显示']], misses: ['Entries not shown'] },
  {
    hits: [['45 / 50 possible sources selected, add fewer files.', '已选择 45 / 50 个可用来源，请减少文件。']],
    misses: ['Too many sources selected.']
  },
  {
    hits: [
      ['Up to 10 files can be added at a time.', '一次最多可添加 10 个文件。'],
      ['Up to 20 items can be added at a time.', '一次最多可添加 20 项。']
    ],
    misses: ['Up to ten files can be added.']
  },
  { hits: [['Add files from octo/app', '从 octo/app 添加文件']], misses: ['Add more files'] },
  {
    hits: [['Copilot failed to create a pull request. Rate limited.', 'Copilot 创建拉取请求失败。Rate limited.']],
    misses: ['Copilot failed to create a pull request.']
  },
  {
    hits: [
      [
        'Model options loaded. Model selection changed to GPT-5 because the previous model is unavailable.',
        '模型选项已加载。之前的模型不可用，已改为 GPT-5。'
      ]
    ],
    misses: ['Model options changed.']
  },
  {
    hits: [
      [
        'Copilot reviewed 3 out of 4 changed files in this pull request and generated 2 comments.',
        'Copilot 审查了此拉取请求 4 个已更改文件中的 3 个，生成了 2 条评论。'
      ],
      [
        'Copilot reviewed 1 out of 1 changed files in this pull request and generated no comments.',
        'Copilot 审查了此拉取请求 1 个已更改文件中的 1 个，未生成评论。'
      ],
      [
        'Copilot reviewed 1 out of 1 changed file in this pull request and generated 1 comment.',
        'Copilot 审查了此拉取请求 1 个已更改文件中的 1 个，生成了 1 条评论。'
      ]
    ],
    misses: ['Copilot reviewed this pull request and generated 2 comments.']
  },
  {
    hits: [
      ['Copilot started work on behalf of octocat', 'Copilot 代表 octocat 开始工作'],
      ['Copilot finished work on behalf of octocat', 'Copilot 代表 octocat 完成了工作'],
      ['Copilot stopped work on behalf of octocat due to an error', 'Copilot 代表 octocat 因出错停止了工作']
    ],
    // 不带用户名的整句 Copilot started work 由 code.ts 的 static 翻译
    misses: ['Copilot started work on behalf of']
  },
  {
    hits: [
      ['Files and folders › app ›', '文件和文件夹 › app ›'],
      ['Issues ›', '议题 ›']
    ],
    misses: ['Labels › app ›']
  },
  { hits: [['Select folders and files in app', '在 app 中选择文件夹和文件']], misses: ['Select folders'] },
  {
    hits: [
      ['Adding issue 12 as a reference.', '正在将议题 12 添加为引用。'],
      ['Removing pull-request 7 as a reference.', '正在从引用中删除拉取请求 7。']
    ],
    misses: ['Adding as a reference.']
  },
  {
    hits: [
      ['Displayed 3 GitHub references', '已显示 3 个 GitHub 引用'],
      ['Displayed 1 GitHub reference', '已显示 1 个 GitHub 引用']
    ],
    misses: ['Displayed GitHub references']
  },
  {
    hits: [["Couldn't attach a.exe. This file type is unsupported.", '无法附加 a.exe。文件类型不受支持。']],
    misses: ["Couldn't attach a.exe."]
  },
  {
    hits: [["Couldn't attach big.pdf. This file must be 32 MB or smaller.", '无法附加 big.pdf。文件不能超过 32 MB。']],
    misses: ["Couldn't attach big.pdf. This file is too big."]
  },
  {
    hits: [
      ["Couldn't attach a.pdf, b.pdf. You can attach up to 5 documents at a time.", '无法附加 a.pdf, b.pdf。一次最多可附加 5 个文档。'],
      ["Couldn't attach a.png. You can attach up to 10 files at a time.", '无法附加 a.png。一次最多可附加 10 个文件。']
    ],
    misses: ["Couldn't attach a.pdf. You can attach more later."]
  },
  {
    hits: [["Couldn't attach empty.txt. This file is empty.", '无法附加 empty.txt。文件为空。']],
    misses: ["Couldn't attach empty.txt. This file is blank."]
  },
  {
    hits: [["Couldn't attach a.txt, b.txt. These files could not be read.", '无法附加 a.txt, b.txt。文件无法读取。']],
    misses: ["Couldn't attach a.txt. Unreadable."]
  },
  {
    hits: [["Couldn't attach a.zip. You can upload up to 250 MB of files at a time.", '无法附加 a.zip。一次最多可上传 250 MB 的文件。']],
    misses: ["Couldn't attach a.zip. Upload less."]
  },
  {
    hits: [
      [
        "Couldn't paste a.bmp. Only PNG, JPEG, GIF, and WebP images can be pasted. Drag in or attach this file instead.",
        '无法粘贴 a.bmp。仅可粘贴 PNG、JPEG、GIF 和 WebP 图片。请改为拖入或附加。'
      ]
    ],
    misses: ["Couldn't paste a.bmp."]
  },
  {
    hits: [
      [
        "Couldn't upload a.txt. This session doesn't allow writing files to the workspace.",
        '无法上传 a.txt。此会话不允许向工作区写入文件。'
      ]
    ],
    misses: ["Couldn't upload a.txt."]
  },
  {
    hits: [["Couldn't upload a.txt to the workspace. Try attaching it again.", '无法将 a.txt 上传到工作区。请重新附加。']],
    misses: ["Couldn't upload a.txt to the workspace."]
  },
  {
    hits: [
      ['Send now, queued message 1 of 2: Fix tests', '立即发送，排队消息 1/2：Fix tests'],
      ['Removing from queue, queued message 2 of 2: Add docs', '正在从队列中删除，排队消息 2/2：Add docs']
    ],
    misses: ['Send now, queued message']
  },
  {
    hits: [['3 command suggestions available. /plan selected.', '有 3 条命令建议。已选择 /plan。']],
    misses: ['Command suggestions available.']
  },
  {
    hits: [
      ["Model locked. You've used all free requests this month.", '模型已锁定。本月免费请求已用完。'],
      ['Model locked. Upgrade to Copilot Pro+ to access this model', '模型已锁定。升级到 Copilot 专业增强版以使用此模型'],
      ['Model locked. This model requires Copilot Max', '模型已锁定。此模型需要 Copilot Max'],
      ['Model locked. Upgrade to use this model.', '模型已锁定。Upgrade to use this model.']
    ],
    misses: ['Model locked.']
  },
  { hits: [['Saved session abc123', '已保存的会话 abc123']], misses: ['Saved session'] },
  { hits: [['Explore repository octo/app', '浏览存储库 octo/app']], misses: ['Explore repository'] },
  {
    hits: [['Unable to load this repository. Select a repository owned by octo-org.', '无法加载此存储库。请选择 octo-org 拥有的存储库。']],
    misses: ['Unable to load this repository.']
  },
  // app：侧栏用户菜单的方案标签与用户按钮的无障碍名称（方案名按 product-names.md 译出）
  {
    hits: [
      ['Copilot Free ·', 'Copilot 免费版 ·'],
      ['Copilot Pro+ ·', 'Copilot 专业增强版 ·']
    ],
    misses: ['Copilot Max ·']
  },
  {
    hits: [
      ['octocat, Copilot Free', 'octocat，Copilot 免费版'],
      ['octocat, Copilot Enterprise', 'octocat，Copilot 企业版']
    ],
    misses: ['octocat, Copilot Max']
  },
  // plans
  {
    hits: [['300 premium requests to use the latest models and code review', '300 个高级请求可用于最新模型和代码审查']],
    misses: ['Premium requests to use the latest models and code review']
  },
  {
    hits: [
      ['Save $20.00', '节省 $20.00'],
      ['Save $20!', '节省 $20！']
    ],
    misses: ['Save changes', 'Save 20%']
  },
  {
    hits: [
      // 中文之间不留空格：金额不用“$10.00/月”写法
      ['You will be billed $10.00/month starting', '按每月 $10.00 计费的起始日期为'],
      ['You will be billed $100.00/year starting', '按每年 $100.00 计费的起始日期为']
    ],
    misses: ['You will be billed monthly starting']
  }
  // 营销同意复选框的第二句由 common/pages.ts 的全站正则翻译（见 common-pages.test.ts）
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('copilot 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(
      translate(
        normalizeText(
          [
            'The ',
            'GPT-4o',
            ' model currently doesn’t support external context from ongoing conversations. Start a new conversation to chat with this model.'
          ].join('')
        )
      )
    ).toBe('GPT-4o 模型目前不支持来自进行中对话的外部上下文。开始新对话以使用此模型。')
    expect(
      translate(normalizeText(['Private resources owned by ', 'octo-org', ' will not be duplicated to the new space.'].join('')))
    ).toBe('归属于 octo-org 的专用资源不会复制到新空间。')
    expect(
      translate(
        normalizeText(
          [
            '. Upgrade to ',
            'Copilot Pro+',
            ' for ',
            '$39.00',
            ' to get an additional ',
            '$10.00',
            ' in credits, or pay ',
            '$5.00',
            ' to continue on ',
            'Copilot Pro',
            '. Credits reset ',
            'November 1',
            '.'
          ].join('')
        )
      )
    ).toBe('。以 $39.00 升级到 Copilot 专业增强版可额外获得 $10.00 额度，或支付 $5.00 继续使用 Copilot 专业版。额度将于 11月1日重置。')
    expect(translate(normalizeText(['Connect with ', 'Docker'].join('')))).toBe('连接 Docker')
  })

  it('被元素隔开的片段单独命中', () => {
    expect(translate('Private resources owned by')).toBe('归属于')
    expect(translate('will not be duplicated to the new space.')).toBe('的专用资源不会复制到新空间。')
    expect(translate("Allow and don't ask again for")).toBe('允许且不再询问')
    expect(translate('for this session')).toBe('在本会话中')
    expect(translate("You've reached your")).toBe('你已达到')
    expect(translate('additional usage limit')).toBe('额外使用量上限')
    expect(translate('Access to')).toBe('访问')
    expect(translate('has been disabled by your administrator.')).toBe('的权限已被管理员禁用。')
    expect(translate('handles routine tasks so you can focus on core work')).toBe('处理日常任务让你专注于核心工作')
    expect(translate('Up to')).toBe('最多')
    expect(translate('files can be added at a time.')).toBe('个文件可同时添加。')
    expect(translate('Part of an organization? Upgrade to')).toBe('属于某个组织？升级到')
    expect(translate('to enable across teams.')).toBe('以在团队中启用。')
    expect(
      translate(
        'model currently doesn’t support external context from ongoing conversations. Start a new conversation to chat with this model.'
      )
    ).toBe('模型目前不支持来自进行中对话的外部上下文。开始新对话以使用此模型。')
  })

  it('工具调用汇总不把普通短语当成文件名', () => {
    expect(translate('Read more')).toBeUndefined()
    expect(translate('Created by')).toBeUndefined()
    expect(translate('Listed in')).toBeUndefined()
    expect(translate('View file changes')).toBeUndefined()
    expect(translate('Apply 3 files')).toBeUndefined()
  })
})

describe('copilot 静态词条', () => {
  it.each([
    ['Switch model', '切换模型'],
    ['Reasoning effort', '推理强度'],
    ['Ask Copilot', '询问 Copilot'],
    ['New chat', '新建聊天'],
    ['Thinking…', '思考中…'],
    ['Thinking', '思考中'],
    ['Workbench', '工作台'],
    ['Searching GitHub', '正在搜索 GitHub'],
    ['Copilot is working…', 'Copilot 正在工作…'],
    ['Plan ready for review', '计划待审查'],
    ['Allow all edits this session', '本会话中允许所有编辑'],
    ['Session timed out', '会话超时'],
    ['Apply patch', '应用补丁'],
    ['Navigate Playwright web browser to a URL', '在 Playwright 浏览器中导航到 URL'],
    ['Post a Slack message', '发布 Slack 消息'],
    ['Create space', '创建空间'],
    ['Files loaded.', '文件已加载。'],
    ['Fix with Copilot', '使用 Copilot 修复'],
    ['Generate pull request title with Copilot', '使用 Copilot 生成拉取请求标题'],
    ['Comment is not helpful', '评论没有帮助'],
    ['View agent session', '查看代理会话'],
    ['Ask Copilot about this diff', '向 Copilot 询问此差异'],
    ['The AI assistant that builds with you', '与你一起构建的 AI 助手'],
    ['Ask Copilot about this snippet', '向 Copilot 询问此代码片段'],
    ['Ask about the repository:', '就此存储库提问：'],
    ['Explain code', '解释代码'],
    ['Request review from Copilot', '请求 Copilot 审查'],
    ['Assign to Copilot', '分配给 Copilot'],
    ['Coding agent', '编码代理'],
    ['Agent sessions', '代理会话'],
    ['Copilot navigation', 'Copilot 导航'],
    ['Filter by status', '按状态筛选'],
    ['Copilot cloud agent access disabled', 'Copilot 云代理访问已禁用'],
    ['Search spaces', '搜索空间'],
    ['Edit space', '编辑空间'],
    ['HTML preview settings', 'HTML 预览设置'],
    ['GPT model fine-tuned for Copilot code completions.', '针对 Copilot 代码补全微调的 GPT 模型。'],
    ['The session disconnected. Retry to connect.', '会话已断开。请重试连接。'],
    ['Model:', '模型：'],
    ['Write code', '编写代码'],
    ['Agents (opens a new page)', '代理（打开新页面）'],
    ['Create draft pull request', '创建草稿拉取请求'],
    ['Create all linked draft issues?', '创建所有链接的草稿议题？'],
    ['Share conversation', '分享对话'],
    ['Duplicate space', '复制空间'],
    ['Try Copilot Pro for 30 days free', '免费试用 Copilot 专业版 30 天'],
    // GLOSSARY usage 行：Token usage → 令牌使用情况（数量、金额义才作“使用量”）
    ['Token usage', '令牌使用情况'],
    ['Session token usage', '会话令牌使用情况'],
    ['Copilot Code Review', 'Copilot 代码审查'],
    ['Try Copilot code review for 30 days free.', '免费试用 Copilot 代码审查 30 天。'],
    ['Changed files', '已更改的文件'],
    ['Personal instructions', '个人说明'],
    ['Browse marketplace', '浏览市场'],
    ['Loading conversation...', '正在加载对话...'],
    ['Resolving…', '解析中…'],
    ['Session details', '会话详细信息'],
    ['Manage billing', '管理计费'],
    ['Remove attachments', '删除附件'],
    ['Additional usage active', '额外使用量生效中'],
    ['Cost / 1M tokens', '费用 / 100 万个令牌'],
    ['· Last updated', '· 最后更新'],
    // 拉取请求的动词 open → 创建
    ['Fix and open pull request', '修复并创建拉取请求'],
    // 状态义的 open 作“打开的”
    ['My open pull requests', '我的打开的拉取请求'],
    // 原文没有引号的界面名不加引号
    ['Go back to the Automations page, then choose Create manually.', '返回自动化页面，然后选择手动创建。'],
    ['Tool permissions could not be loaded. Only Always ask is available.', '无法加载工具权限。仅可使用始终询问。'],
    ['Clicking Update will update the relationships between the issues shown below.', '单击更新按钮将更新下方议题之间的关系。'],
    [
      'GitHub Copilot app did not open. Use Open the app to retry or Download to install.',
      'GitHub Copilot 应用未打开。单击打开应用以重试，或单击下载以安装。'
    ],
    ["This response has been filtered because it violates GitHub's safety policies.", '此回复因违反 GitHub 的安全政策已被过滤。'],
    ["your organization's Copilot settings", '你组织的 Copilot 设置'],
    // 未被链接拆开时与行内句译文一致
    [
      'This response cannot be shown because it references public code, which is restricted by your Copilot settings.',
      '无法显示此回复，因为它引用了公共代码，而这受限于你的 Copilot 设置。'
    ],
    ['How do I start a new discussion?', '如何开始新讨论？'],
    ['Unlink sub-issue', '取消链接子议题'],
    ['Trying again…', '重试中…'],
    ['No sessions match your filters', '没有与筛选器匹配的会话'],
    [
      'This conversation may contain private content. Viewers must have access to all referenced content.',
      '此对话可能包含私密内容。查看者必须有权访问所有引用的内容。'
    ],
    // 原文没有冒号，译文不加
    [
      'Optionally provide additional context for the agent, like constraints, priorities, or areas to avoid',
      '可为代理提供更多上下文，如约束、优先级或需避免的方面'
    ],
    // 产品名、功能名、方案名按 product-names.md 译出
    ['Actions session', '操作会话'],
    ['Give Copilot cloud agent a background task', '给 Copilot 云代理分配后台任务'],
    ["Chats can't be run on Actions", '聊天无法在操作上运行'],
    ['Create a codespace', '创建代码空间'],
    ['Copilot coding agent now uses fewer premium requests!', 'Copilot 编码代理现在消耗的高级请求更少了！'],
    ['Delegate tasks to GitHub Copilot coding agent', '将任务委派给 GitHub Copilot 编码代理'],
    ['View Copilot Coding Agent capabilities', '查看 Copilot 编码代理的功能'],
    [
      'Save time by offloading testing, dependency upgrades, migrations and maintenance to agents. Create pull requests from Copilot Chat, CLI, IDEs or assign an Issue to Copilot to get started.',
      '将测试、依赖升级、迁移和维护工作交给代理，节省时间。可从 Copilot 聊天、CLI、IDE 创建拉取请求，或将议题分配给 Copilot 来开始使用。'
    ],
    [
      'Fix the selected review comments with Copilot cloud agent. You will be added as co-author on any new commits.',
      '使用 Copilot 云代理修复所选审查评论。你将成为所有新提交的共同作者。'
    ],
    [
      'Before you can use Copilot cloud agent, you need to pick a "Usage billed to" option in your Copilot settings.',
      '使用 Copilot 云代理前，需在 Copilot 设置中选择“使用量计费对象”。'
    ],
    ['Available on Copilot Pro', 'Copilot 专业版可用'],
    ['Copilot Pro+ activated', 'Copilot 专业增强版已激活'],
    ['Everything in Copilot Free and:', 'Copilot 免费版的全部功能，以及：'],
    ['Subscribe to GitHub Copilot Pro', '订阅 GitHub Copilot 专业版'],
    ['Works in GitHub Mobile, CLI, and Windows Terminal', '可在 GitHub 移动版、CLI 和 Windows Terminal 中使用'],
    ['Get GitHub Actions job logs', '获取 GitHub 操作作业日志'],
    [
      'The session timed out before work could be completed. For more details, see the detailed logs in GitHub Actions.',
      '会话在工作完成前超时。如需了解详细信息，请查看 GitHub 操作中的详细日志。'
    ],
    ['Check new dependencies against the GitHub Advisory Database', '对照 GitHub 公告数据库检查新依赖项'],
    ['Review changes with Copilot code review', '使用 Copilot 代码审查来审查更改'],
    ['Copilot Spaces documentation', 'Copilot 空间文档'],
    ['Browse the marketplace to find extensions for the tools and services you rely on', '浏览市场查找适用于你常用工具和服务的扩展'],
    [
      'Copilot Chat in GitHub.com must be enabled to upload images. Please request access from your administrator and try again.',
      '必须启用 GitHub.com 中的 Copilot 聊天才能上传图片。请向管理员申请访问权限后重试。'
    ],
    // 破折号连接两个分句：译作“——”，不改成冒号或逗号
    [
      'Runs on a user-managed device — Copilot CLI or an IDE-embedded client (VS Code / JetBrains).',
      '在用户管理的设备上运行——Copilot CLI 或 IDE 内嵌客户端 (VS Code / JetBrains)。'
    ],
    [
      'Cleared for takeoff soon—your Copilot license is on its way. Please check back in a few minutes.',
      '即将就绪——你的 Copilot 许可证正在发放。请几分钟后再来查看。'
    ],
    ['Available on paid plans. Try it with Copilot Pro — free for 30 days.', '付费计划可用。试用 Copilot 专业版——30 天免费。'],
    // 标点随原文：两句保持两句
    ['Failed to rename. Please try again.', '重命名失败。请重试。'],
    ['Could not select this space. Try again.', '无法选择此空间。请重试。'],
    ['Some threads failed to load. Please refresh the page to try again.', '部分对话加载失败。请刷新页面重试。'],
    ["Couldn't load files. Something went wrong. Check your connection and try again.", '无法加载文件。出错了。请检查网络连接后重试。'],
    ["Copilot couldn't regenerate this summary. The previous summary is shown.", 'Copilot 无法重新生成此摘要。显示的是之前的摘要。'],
    ['Copilot uses AI. Check for mistakes.', 'Copilot 使用 AI。请检查是否有误。'],
    ['Could not update issue labels. Please try again.', '无法更新议题标签。请重试。'],
    ['There was an error loading the logs. Please try again later.', '加载日志时出错。请稍后重试。'],
    ['Resource not found. Please try again.', '未找到资源。请重试。'],
    // chat：个人说明模板、函数调用页脚、引用预览、确认卡片、附件、存档确认
    ['Communication', '沟通'],
    ['Code preferences', '代码首选项'],
    ['Issue API', '议题 API'],
    ['Pull Request API', '拉取请求 API'],
    ['tool', '工具'],
    ['Show content above', '显示上方内容'],
    ['Show content below', '显示下方内容'],
    [
      'Are you sure you wish to execute the "Create pull request with Copilot coding agent" tool?',
      '确定要执行“使用 Copilot 编码代理创建拉取请求”工具吗？'
    ],
    ['Attach image', '附加图片'],
    ['Are you sure you want to archive this session?', '确定要存档此会话吗？'],
    ['Yes, archive', '是，存档'],
    // 被元素拆开的片段（Copilot 页另有行内句整句翻译）
    ['The system prompt for', '适用于'],
    [
      'is a set of instructions that guides the LLM to provide enhanced functionality and output quality based on user input.',
      '的系统提示是一组指令，用于引导 LLM 根据用户输入增强功能、提升输出质量。'
    ],
    // models：使用情况面板信息按钮的无障碍名称
    ['Learn more about Included credits', '了解包含的额度'],
    ['Learn more about Monthly limit', '了解每月上限'],
    // workbench：直撇号、弯撇号两种写法
    ['You’ve edited', '你已编辑'],
    ["You've edited", '你已编辑'],
    // code
    ['Ask about the tree comparison:', '就此比较提问：'],
    ['Copilot actions', 'Copilot 操作'],
    ['More fix options', '更多修复选项'],
    ['Customize prompt', '自定义提示'],
    ['Copilot is loading...', 'Copilot 正在加载...'],
    ['Copilot started work', 'Copilot 开始工作'],
    ['Mention @copilot in a comment to make changes to this pull request.', '在评论中提及 @copilot 以更改此拉取请求。'],
    // code：编码代理会话状态
    ['Copilot is done', 'Copilot 已完成'],
    ['Copilot has failed', 'Copilot 已失败'],
    // spaces：标题大小写变体、添加来源菜单、空状态、空间不存在页
    ['Create Space', '创建空间'],
    ['Duplicate Space', '复制空间'],
    ['Spaces…', '空间…'],
    ['Add files from repository', '从存储库添加文件'],
    ['Link files, pull requests, and issues', '链接文件、拉取请求和议题'],
    ['Add sources to get started', '添加来源以开始使用'],
    ['Space not found', '未找到空间'],
    // 原文的单引号示例译作中文引号
    [
      "Add a short description to explain this space's purpose (e.g., 'Frontend design system' or 'API docs hub').",
      '添加简短描述，说明此空间的用途（例如“前端设计系统”或“API 文档中心”）。'
    ],
    // plans：方案名译成“X 版”
    ['GitHub Copilot Individual', 'GitHub Copilot 个人版']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('静态词条在存储库与拉取请求页同样生效', () => {
    expect(matcher.translate('Fix with Copilot', ['common', 'repository', 'pulls'])).toBe('使用 Copilot 修复')
    expect(matcher.translate('Ask Copilot about this diff', ['common', 'repository', 'pulls'])).toBe('向 Copilot 询问此差异')
    expect(matcher.translate('Plan ready for review', ['common', 'repository', 'pulls'])).toBe('计划待审查')
    expect(matcher.translate('Request review from Copilot', ['common', 'repository', 'pulls'])).toBe('请求 Copilot 审查')
    // 拉取请求时间线的编码代理会话状态
    expect(matcher.translate('Copilot has failed', ['common', 'repository', 'pulls'])).toBe('Copilot 已失败')
    expect(matcher.translate('Ask Copilot about this snippet', ['common', 'repository', 'code'])).toBe('向 Copilot 询问此代码片段')
    expect(matcher.translate('Agent session', ['common', 'repository', 'issues'])).toBe('代理会话')
    // 停靠聊天的引用预览、经典评论框与失败作业的 Copilot 入口
    expect(matcher.translate('Show content above', ['common', 'repository', 'code'])).toBe('显示上方内容')
    expect(matcher.translate('Copilot actions', ['common', 'repository', 'pulls'])).toBe('Copilot 操作')
    expect(matcher.translate('More fix options', ['common', 'repository', 'actions'])).toBe('更多修复选项')
    // 停靠聊天的个人说明模板标签
    expect(matcher.translate('Communication', ['common', 'repository'])).toBe('沟通')
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Fix with Copilot \n', ['common', 'copilot'])).toBe('  使用 Copilot 修复 \n')
  })

  it('原文没有引号的界面名，译文不加引号', () => {
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    // 原文的单引号示例（'Frontend design system'）算引号；词中的撇号（space's）不算
    const quoted = /["“”]|(?:^|[\s(])'[^']+'/
    expect(entries.filter(([key, value]) => /[“”]/.test(value) && !quoted.test(key))).toEqual([])
  })

  it('产品名 Copilot 保留英文', () => {
    expect(dict.static?.Copilot).toBeUndefined()
    expect(translate('Copilot')).toBeUndefined()
    expect(translate('GitHub Copilot')).toBeUndefined()
  })

  it('产品名、功能名、方案名按 product-names.md 译出：译文不再保留英文', () => {
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    const english =
      /[Cc]odespace|[Mm]arketplace|GitHub (?:Actions|Mobile|Advisory Database)|\bActions\b|Copilot (?:Chat|Spaces?\b|Free|Pro\b|Business|Enterprise|Student|[Cc]ode [Rr]eview|[Cc]loud [Aa]gent|[Cc]oding [Aa]gent)/
    expect(entries.filter(([, value]) => english.test(value))).toEqual([])
  })
})

describe('copilot 页面词条', () => {
  it.each([
    ['Wrap', '自动换行'],
    ['Unwrap', '取消自动换行'],
    ['Efficiency', '效率'],
    ['Plan', '计划'],
    ['Never mind', '取消'],
    ['Upgrade plan', '升级计划'],
    ['Layout', '布局'],
    ['Revert', '还原'],
    ['Spaces', '空间'],
    ['Personal', '个人'],
    ['Agent', '代理'],
    ['Directory', '目录'],
    ['Model', '模型'],
    ['Active', '进行中'],
    ['View session', '查看会话'],
    ['Input:', '输入：'],
    ['Yours', '你的'],
    ['Artifacts', '工件'],
    ['teal', '蓝绿色'],
    ['In progress', '正在进行'],
    ['Files changed', '已更改的文件'],
    ['Edit history', '编辑历史记录'],
    ['Connecting…', '连接中…'],
    ['Find a branch...', '查找分支...'],
    ['Last updated', '最后更新'],
    // 单独的进度动名词作“X中”（环境、会话状态）
    ['Waking', '唤醒中'],
    ['Draining', '排空中'],
    ['Connecting', '连接中'],
    ['Resuming', '恢复中'],
    // 唤起应用的按钮：Opening 后接应用名（<span>GitHub Copilot app</span>），带宾语作“正在”
    ['Opening', '正在打开'],
    ['Try adjusting your search or filters.', '请尝试调整搜索或筛选器。'],
    // 标点随原文：两句保持两句（与 code/edit.ts、security/advisories.ts 同译）
    ['An unexpected error occurred. Please try again.', '发生意外错误。请重试。'],
    // 侧栏用户菜单的方案标签：方案名按 product-names.md 译成“X 版”
    ['Copilot Free', 'Copilot 免费版'],
    ['Copilot Pro+', 'Copilot 专业增强版'],
    ['Copilot Business', 'Copilot 商业版'],
    // 推广横幅正文的片段与链接文字（Copilot 页另有行内句整句翻译）
    ['Discover all the', '了解全球领先的 AI 开发人员工具的所有'],
    ['benefits', '优势'],
    ['of the world’s leading AI developer tool.', '。'],
    // 预览工具栏的行数单位（整段未命中时逐节点兜底）
    ['lines', '行'],
    ['line', '行'],
    // 专业版结账页的步骤名（核对订单）、公告横幅的链接
    ['Review', '确认'],
    ['See what’s new', '查看新功能'],
    ["See what's new", '查看新功能']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Wrap', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Plan', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Model: GPT-5', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('3 tool calls', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Edited app.ts', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Active', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Model', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Copilot started work on behalf of octocat', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Review', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('lines', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('benefits', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Discover all the', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('of the world’s leading AI developer tool.', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Added: 12 lines · 1 KB', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('octocat accepted the action', ['common', 'repository'])).toBeUndefined()
  })

  it('Share feedback、Select repository 不收 scoped，由 common-ui 翻译', () => {
    expect(dict.scoped?.['Share feedback']).toBeUndefined()
    expect(dict.scoped?.['Select repository']).toBeUndefined()
    expect(translate('Share feedback')).toBeUndefined()
    expect(translate('Select repository')).toBeUndefined()
    expect(commonUi.static?.['Share feedback']).toBeDefined()
    expect(commonUi.static?.['Select repository']).toBeDefined()
  })
})

describe('copilot 错误横幅（行内句）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  const TERMS_URL = 'https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot'

  /**
   * 结构同 Primer Banner（copilot-chat 的 ErrorMessage：title="Error" hideTitle）：说明在 Banner.Description 中，
   * 子节点依次是 JSX 的各段文字（每段一个文本节点，{' '} 也是）与链接
   */
  function renderBanner(parts: readonly (string | readonly [string, string])[], pages: readonly PageKey[]): HTMLElement {
    document.body.innerHTML =
      '<section data-component="Banner" data-variant="warning" data-title-hidden="">' +
      '<div data-component="Banner.Icon"></div><div><div data-component="Banner.Content">' +
      '<span class="sr-only"><h2 data-component="Banner.Title" data-banner-title="">Error</h2></span>' +
      '<div class="BannerDescription" data-component="Banner.Description"></div></div></div></section>'
    const description = document.querySelector<HTMLElement>('[data-component="Banner.Description"]')!
    for (const part of parts) {
      if (typeof part === 'string') {
        description.append(document.createTextNode(part))
        continue
      }
      const link = document.createElement('a')
      link.href = part[1]
      link.textContent = part[0]
      description.append(link)
    }
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => pages,
      collectUntranslated: true
    })
    translator.start()
    return description
  }

  it('内容被过滤：Copilot 页整句翻译，链接文字单独翻译，不记未翻译', () => {
    const description = renderBanner(
      ['This response has been filtered because it violates ', ["GitHub's safety policies", TERMS_URL], '.'],
      ['common', 'copilot']
    )
    expect(description.textContent).toBe('此回复因违反 GitHub 的安全政策已被过滤。')
    expect(description.querySelector('a')?.textContent).toBe('GitHub 的安全政策')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('引用公共代码：链接前单独的空格节点置空，中文之间不留空格', () => {
    const settings = 'https://docs.github.com/en/copilot'
    const personal = renderBanner(
      [
        'This response cannot be shown because it references public code, which is restricted by',
        ' ',
        ['your Copilot settings', settings],
        '.'
      ],
      ['common', 'copilot']
    )
    expect(personal.textContent).toBe('无法显示此回复，因为它引用了公共代码，而这受限于你的 Copilot 设置。')
    expect(translator?.drainUntranslated()).toEqual([])
    translator?.stop()
    const organization = renderBanner(
      [
        'This response cannot be shown because it references public code, which is restricted by',
        ' ',
        ["your organization's Copilot settings", settings],
        '.'
      ],
      ['common', 'copilot']
    )
    expect(organization.textContent).toBe('无法显示此回复，因为它引用了公共代码，而这受限于你组织的 Copilot 设置。')
  })

  it('行内句只在 Copilot 页生效：其他页面的停靠聊天按片段翻译', () => {
    const description = renderBanner(
      ['This response has been filtered because it violates ', ["GitHub's safety policies", TERMS_URL], '.'],
      ['common', 'repository']
    )
    expect(description.textContent).toBe('此回复被过滤的原因是违反了 GitHub 的安全政策。')
  })
})

describe('copilot 存档确认对话框（行内句）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  const ARCHIVE_LEAD = 'This session will be removed from your active sessions. You can find and restore it anytime from the'
  const CLOSE_LEAD =
    'This session has an open pull request. Would you like to close it? You can find and restore this session anytime from the'
  /** 仅存档：JSX 的文字与 {' '} 空格是两个文本节点 */
  const ARCHIVE_TEXTS = [ARCHIVE_LEAD, ' ']
  /** 有打开的拉取请求：JSX 跨行的文字以“from the ”结尾，空格在同一文本节点内 */
  const CLOSE_TEXTS = [`${CLOSE_LEAD} `]

  /**
   * 结构同 Primer Dialog（agent-sessions 的 ArchiveConfirmationDialog）：正文是 Dialog.Body 的直接子节点，
   * 依次为 leading 各文本节点、<strong>Completed</strong>、" tab in My sessions."
   */
  function renderDialog(leading: readonly string[], pages: readonly PageKey[]): HTMLElement {
    document.body.innerHTML =
      '<div role="dialog" aria-modal="true" data-component="Dialog">' +
      '<div><h1 data-component="Dialog.Title">Archive session</h1></div>' +
      '<div class="prc-Dialog-Body-bB903" data-component="Dialog.Body"></div>' +
      '<div data-component="Dialog.Footer"><button type="button">Cancel</button><button type="button">Archive</button></div></div>'
    const body = document.querySelector<HTMLElement>('[data-component="Dialog.Body"]')!
    const tab = document.createElement('strong')
    tab.textContent = 'Completed'
    body.append(...leading.map(text => document.createTextNode(text)), tab, document.createTextNode(' tab in My sessions.'))
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => pages,
      collectUntranslated: true
    })
    translator.start()
    return body
  }

  it('仅存档：整句翻译，标签页名由 strong 单独翻译，中文之间不留空格', () => {
    const body = renderDialog(ARCHIVE_TEXTS, ['common', 'copilot'])
    expect(body.textContent).toBe('此会话将从你的活动会话中移除。你可以随时在我的会话页面的已完成标签页中找到并恢复它。')
    expect(body.querySelector('strong')?.textContent).toBe('已完成')
    expect(document.querySelector('[data-component="Dialog.Title"]')?.textContent).toBe('存档会话')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('有打开的拉取请求：整句翻译', () => {
    const body = renderDialog(CLOSE_TEXTS, ['common', 'copilot'])
    expect(body.textContent).toBe('此会话有一个打开的拉取请求。要关闭它吗？你可以随时在我的会话页面的已完成标签页中找到并恢复此会话。')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('行内句只在 Copilot 页生效：其他页面按片段翻译，保留原文的空格', () => {
    const body = renderDialog(ARCHIVE_TEXTS, ['common', 'repository'])
    expect(body.textContent).toBe('此会话将从你的活动会话中移除。你可以随时在我的会话页面的 已完成 标签页中找到并恢复它。')
  })
})

describe('copilot 唤起应用按钮', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('Opening 与应用名分属两个 span：译作“正在打开”+“GitHub Copilot 应用”', () => {
    // 结构同 copilot-app-launcher-shared 的 OpeningLabel（等待唤起时的按钮文字）
    document.body.innerHTML =
      '<button type="button"><span data-state="waiting"><span class="OpeningLabel">' +
      '<span class="OpeningWordShimmer"><span class="OpeningWordInner">Opening</span></span>' +
      '<span>GitHub Copilot app</span></span></span></button>'
    translator = createTranslator({
      matcher: fullMatcher,
      host: window,
      resolvePages: () => ['common', 'copilot'],
      collectUntranslated: true
    })
    translator.start()
    const label = document.querySelector('.OpeningLabel')
    expect(label?.querySelector('.OpeningWordInner')?.textContent).toBe('正在打开')
    expect(label?.lastElementChild?.textContent).toBe('GitHub Copilot 应用')
    expect(translator.drainUntranslated()).toEqual([])
  })
})

/** 宿主的子节点：一段文字（一个文本节点），或 [标签名, 元素文字] */
type SentencePart = string | readonly [tag: string, text: string]

/** 依次追加文本节点与元素 */
function appendParts(host: Element, parts: readonly SentencePart[]): void {
  for (const part of parts) {
    if (typeof part === 'string') {
      host.append(document.createTextNode(part))
      continue
    }
    const element = document.createElement(part[0])
    element.textContent = part[1]
    host.append(element)
  }
}

/** 写入 html，在 hostSelector 选中的元素里追加 parts 后按 pages 翻译 */
function renderParts(
  html: string,
  hostSelector: string,
  parts: readonly SentencePart[],
  pages: readonly PageKey[],
  sentenceMatcher: Matcher
): { readonly host: HTMLElement; readonly translator: Translator } {
  document.body.innerHTML = html
  const host = document.querySelector<HTMLElement>(hostSelector)!
  appendParts(host, parts)
  const translator = createTranslator({
    matcher: sentenceMatcher,
    host: window,
    resolvePages: () => pages,
    collectUntranslated: true
  })
  translator.start()
  return { host, translator }
}

/** 系统提示说明：名称元素前后各一段文字 */
const SYSTEM_PROMPT: readonly SentencePart[] = [
  'The system prompt for ',
  ['strong', 'GitHub Copilot'],
  ' is a set of instructions that guides the LLM to provide enhanced functionality and output quality based on user input.'
]

/** 推广横幅正文：链接 benefits 前后各一段文字 */
const BENEFITS_BANNER: readonly SentencePart[] = ['Discover all the ', ['a', 'benefits'], ' of the world’s leading AI developer tool.']

describe('copilot 系统提示说明与推广横幅（行内句）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(parts: readonly SentencePart[], pages: readonly PageKey[]): HTMLElement {
    const rendered = renderParts('<p></p>', 'p', parts, pages, fullMatcher)
    translator = rendered.translator
    return rendered.host
  }

  it('系统提示说明：Copilot 页整句翻译，名称元素保持原文', () => {
    const paragraph = render(SYSTEM_PROMPT, ['common', 'copilot'])
    expect(paragraph.textContent).toBe('GitHub Copilot 的系统提示是一组指令，用于引导 LLM 根据用户输入增强功能、提升输出质量。')
    expect(translator?.drainUntranslated().map(([text]) => text)).toEqual(['GitHub Copilot'])
  })

  it('系统提示说明：其他页面的停靠聊天按片段翻译', () => {
    const paragraph = render(SYSTEM_PROMPT, ['common', 'repository'])
    expect(paragraph.textContent).toBe('适用于 GitHub Copilot 的系统提示是一组指令，用于引导 LLM 根据用户输入增强功能、提升输出质量。')
  })

  it('推广横幅：Copilot 页整句翻译，链接文字由 scoped 翻译，中文之间不留空格', () => {
    const paragraph = render(BENEFITS_BANNER, ['common', 'copilot'])
    expect(paragraph.textContent).toBe('了解全球领先的 AI 开发人员工具的所有优势。')
    expect(paragraph.querySelector('a')?.textContent).toBe('优势')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('推广横幅：片段与链接文字只在 Copilot 页生效，其他页面整段保持原文', () => {
    const paragraph = render(BENEFITS_BANNER, ['common', 'repository'])
    expect(paragraph.textContent).toBe('Discover all the benefits of the world’s leading AI developer tool.')
  })
})

describe('copilot 相邻文本节点（DOM）', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(html: string, hostSelector: string, parts: readonly SentencePart[]): HTMLElement {
    const rendered = renderParts(html, hostSelector, parts, ['common', 'copilot'], fullMatcher)
    translator = rendered.translator
    return rendered.host
  }

  it('引用预览的展开按钮：图标后的 Show content 与方向整段匹配', () => {
    // 结构同 copilot-reference-preview 的展开按钮：<div>{图标}Show content {direction}</div>
    const label = render('<button type="button"><div class="label"><svg></svg></div></button>', '.label', ['Show content ', 'below'])
    expect(label.textContent).toBe('显示下方内容')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('确认卡片的处理结果：用户名、状态与 the action 整段匹配', () => {
    // 结构同 copilot-immersive-v1 的 ClientConfirmations：<CheckIcon /> {authorName} {confirmationState} the action
    const text = render('<div><span class="text"><svg></svg></span></div>', '.text', [' ', 'octocat', ' ', 'accepted', ' the action'])
    expect(text.textContent?.trim()).toBe('octocat 允许了此操作')
  })

  it('函数调用结果的页脚：工具名链接两侧的片段分别翻译', () => {
    // 结构同 copilot-chat 的 FunctionCallButton：Copilot used the{' '}<a>{toolName}</a>{' '}tool
    const footer = render('<span class="footer"></span>', '.footer', ['Copilot used the', ' ', ['a', 'Issue API'], ' ', 'tool'])
    expect(footer.textContent).toBe('Copilot 使用了 议题 API 工具')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('差异预览工具栏：新增、删除文件的前缀与行数、大小整段匹配', () => {
    // 结构同 copilot-immersive-v1 的 DiffPreview：<p>{lineLabel} {line|lines} · {size}</p>，
    // lineLabel 为 `${'Added: ' | 'Deleted: ' | ''} ${linesOfCode} `
    const added = render('<p class="loc"></p>', '.loc', ['Added:  12 ', ' ', 'lines', ' · ', '1 KB'])
    expect(added.textContent).toBe('已添加：12 行 · 1 KB')
    translator?.stop()
    const modified = render('<p class="loc"></p>', '.loc', [' 12 ', ' ', 'lines', ' · ', '504 bytes'])
    expect(modified.textContent?.trim()).toBe('12 行 · 504 字节')
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('营销同意复选框：字段列表按浏览器语言拼接，两句分别命中后拼成整段', () => {
    // 结构同结账页的营销同意组件：<p>{第一句}{' '}{第二句}{' '}<span>See the <a>…</a> for more details.</span></p>
    const lead =
      "Yes please, I'd like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness."
    for (const list of ['name, email address, and country', 'name、email address和country']) {
      translator?.stop()
      const paragraph = render('<p class="consent"></p>', '.consent', [
        lead,
        ' ',
        `The information used includes, but is not limited to, ${list}.`,
        ' ',
        ['span', 'for more details.']
      ])
      const texts = [...paragraph.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent)
        .join('')
      expect(texts).toBe(
        '好的，我希望 GitHub 及其关联公司使用我的信息进行个性化沟通、定向广告和营销活动效果评估。所使用的信息包括但不限于姓名、电子邮件地址和国家/地区。'
      )
    }
  })
})

/** 繁体：只含 Copilot 词典；DOM 用例另含通用词典 */
const twDict: PageDictionary = twCopilot
const twMatcher = createMatcher([['copilot', twCopilot]])
const twFullMatcher = createMatcher([
  ['common', twCommon],
  ['common', twCommonUi],
  ['copilot', twCopilot]
])

describe('copilot 繁体词条（zh-TW）', () => {
  function translateTW(text: string): string | undefined {
    return twMatcher.translate(text, ['common', 'copilot'])
  }

  it.each([
    ['Communication', '溝通'],
    ['Code preferences', '程式碼偏好設定'],
    ['Issue API', '議題 API'],
    ['Release API', '發行版本 API'],
    ['Show content above', '顯示上方內容'],
    ['Show content below', '顯示下方內容'],
    [
      'Are you sure you wish to execute the "Create pull request with Copilot coding agent" tool?',
      '確定要執行「使用 Copilot 程式開發代理建立拉取請求」工具嗎？'
    ],
    ['Are you sure you want to archive this session?', '確定要封存此工作階段嗎？'],
    ['Yes, archive', '是，封存'],
    ['The system prompt for', '適用於'],
    ['Learn more about Included credits', '瞭解包含的點數'],
    ["You've edited", '你已編輯'],
    ['Ask about the tree comparison:', '針對此比較提問：'],
    ['Copilot actions', 'Copilot 動作'],
    ['More fix options', '更多修正選項'],
    ['Customize prompt', '自訂提示'],
    ['Mention @copilot in a comment to make changes to this pull request.', '在留言中提及 @copilot 以變更此拉取請求。'],
    ['Copilot is done', 'Copilot 已完成'],
    ['Copilot has failed', 'Copilot 已失敗'],
    ['Spaces…', '空間…'],
    ['Add files from repository', '從儲存庫新增檔案'],
    ['Space not found', '找不到空間'],
    [
      "This URL may be incorrect, you're signed out of your organization, or the Space may have been deleted.",
      '此 URL 可能有誤，你可能已登出組織，或空間可能已刪除。'
    ],
    // 原文的单引号示例译作「」；docs 作「說明文件」
    [
      "Add a short description to explain this space's purpose (e.g., 'Frontend design system' or 'API docs hub').",
      '新增簡短描述，說明此空間的用途（例如「前端設計系統」或「API 說明文件中心」）。'
    ],
    [
      'Provide files, docs, issues, or repositories so Copilot can give more relevant answers.',
      '提供檔案、說明文件、議題或儲存庫，讓 Copilot 的回答更切題。'
    ],
    ['GitHub Copilot Individual', 'GitHub Copilot 個人版']
  ])('static：%s → %s', (input, expected) => {
    expect(twDict.static?.[input]).toBe(expected)
    expect(translateTW(input)).toBe(expected)
  })

  it.each([
    ['Discover all the', '瞭解全球領先的 AI 開發人員工具的所有'],
    ['benefits', '優勢'],
    ['lines', '行'],
    ['Review', '確認'],
    ['See what’s new', '查看新功能']
  ])('scoped：%s → %s', (input, expected) => {
    expect(twDict.scoped?.[input]).toBe(expected)
    expect(translateTW(input)).toBe(expected)
  })

  it.each([
    ['octocat accepted the action', 'octocat 允許了此動作'],
    ['octocat dismissed the action', 'octocat 拒絕了此動作'],
    ['Are you sure you wish to execute the "Get file contents" tool?', '確定要執行「Get file contents」工具嗎？'],
    ['· 3 premium requests', '· 3 個進階請求'],
    ['Added: 12 lines · 1 KB', '已新增：12 行 · 1 KB'],
    ['1 line · 504 bytes', '1 行 · 504 位元組']
  ])('regexp：%s → %s', (input, expected) => {
    expect(twDict.static?.[input]).toBeUndefined()
    expect(translateTW(input)).toBe(expected)
  })

  it('页面词条与正则不在其他页面生效', () => {
    expect(twMatcher.translate('Review', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(twMatcher.translate('Discover all the', ['common', 'repository'])).toBeUndefined()
    expect(twMatcher.translate('octocat accepted the action', ['common', 'repository'])).toBeUndefined()
  })

  describe('行内句（DOM）', () => {
    let translator: Translator | undefined

    afterEach(() => {
      translator?.stop()
      translator = undefined
      document.body.innerHTML = ''
    })

    function render(parts: readonly SentencePart[], pages: readonly PageKey[]): HTMLElement {
      const rendered = renderParts('<p></p>', 'p', parts, pages, twFullMatcher)
      translator = rendered.translator
      return rendered.host
    }

    it('系统提示说明：Copilot 页整句翻译，其他页面按片段翻译', () => {
      expect(render(SYSTEM_PROMPT, ['common', 'copilot']).textContent).toBe(
        'GitHub Copilot 的系統提示是一組指示，用來引導 LLM 根據使用者輸入強化功能並提升輸出品質。'
      )
      translator?.stop()
      expect(render(SYSTEM_PROMPT, ['common', 'repository']).textContent).toBe(
        '適用於 GitHub Copilot 的系統提示是一組指示，用來引導 LLM 根據使用者輸入強化功能並提升輸出品質。'
      )
    })

    it('推广横幅：Copilot 页整句翻译，链接文字由 scoped 翻译', () => {
      const paragraph = render(BENEFITS_BANNER, ['common', 'copilot'])
      expect(paragraph.textContent).toBe('瞭解全球領先的 AI 開發人員工具的所有優勢。')
      expect(translator?.drainUntranslated()).toEqual([])
    })

    it('营销同意复选框：字段列表按浏览器语言拼接，两句分别命中后拼成整段', () => {
      const paragraph = render(
        [
          "Yes please, I'd like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness.",
          ' ',
          'The information used includes, but is not limited to, name、email address和country.',
          ' ',
          ['span', 'for more details.']
        ],
        ['common', 'copilot']
      )
      const texts = [...paragraph.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent)
        .join('')
      expect(texts).toBe(
        '好的，我希望 GitHub 和關係企業使用我的資訊，用於個人化溝通、精準廣告和行銷活動成效評估。所使用的資訊包括但不限於姓名、電子郵件地址和國家/地區。'
      )
    })
  })
})
