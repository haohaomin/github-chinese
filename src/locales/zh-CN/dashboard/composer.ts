import { lookupTable, mergeTables } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import { COMPOSER_SHARED_RULES as AGENT_RULES, TASK_FAILURE_RULES } from '../copilot/agents'
import { COMPOSER_SHARED_RULES as CHAT_RULES } from '../copilot/chat'
import composer from '../copilot/composer'
import models from '../copilot/models'
import { COMPOSER_SHARED_RULES as SKILL_RULES } from '../copilot/skills'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/** 问候语 */
const GREETINGS: Readonly<Record<string, string>> = {
  morning: '早上好',
  afternoon: '下午好',
  evening: '晚上好'
}

/** models 词典的全局词条（任务创建失败横幅的计费提示从这里取译文） */
const modelText = lookupTable(models.static)

/** 横幅说明：计费提示取 models 词典译文，其余按 agents 的横幅规则翻译，都不命中时保留原文 */
function translateTaskFailure(description: string): string {
  const billing = modelText(description)
  if (billing !== undefined) return billing
  const rule = TASK_FAILURE_RULES.find(([pattern]) => pattern.test(description))
  return rule ? description.replace(rule[0], rule[1]) : description
}

/**
 * 首页 Copilot 输入框：问候语、模式菜单与快捷提示、模型选择器、推理强度、使用情况横幅、
 * 附件与引用选择器、环境条、任务创建失败横幅与读屏播报、粘贴代码块的读屏播报。
 * 与 Copilot 页共用的组件沿用 copilot 词典：models、composer 整体，agents、chat、skills 导出的共用规则
 * （COMPOSER_SHARED_RULES：环境条、图片附件、任务创建失败横幅、粘贴代码块的读屏播报），译法保持一致。
 */
export default {
  static: {
    'Ask anything or type @ to add context with Copilot': '向 Copilot 提问或输入 @ 添加上下文',
    'Hide until limits reset': '隐藏至限额重置',
    'Error sending message': '消息发送失败',
    // 标点随原文：两句之间用句号
    'There was an error sending your message. Please try again.': '消息发送出错。请重试。',
    // 存储库选择面板（与 copilot 词典的“Search repositories…”同译，省略号随原文）
    'Search repositories...': '搜索存储库...',
    'Fetching repositories…': '正在获取存储库…',
    // 空间选择与工具权限的出错提示（与 copilot 词典的“Tool permissions are not ready.”一致）
    'Authorize SSO for this space, then try again.': '为此空间授权 SSO 后重试。',
    'Tool permissions are not ready. Wait for them to load before starting a session.': '工具权限尚未就绪。请等待加载完成后再开始会话。'
  },
  // 本页词条在前，其后沿用 copilot 的 composer、models 词典：同一原文先出现者优先，本页的译法优先
  scoped: mergeTables([
    {
      // 模式菜单（与 copilot 词典一致；Task 与智能体模型名 Auto 只在首页收录，Auto 与全局“Model: Auto”的“模型：自动”同译）
      Ask: '询问',
      Task: '任务',
      Agent: '智能体',
      Chat: '聊天',
      Cloud: '云端',
      Mode: '模式',
      Auto: '自动',
      Debug: '调试',
      Item: '条目',

      // 快捷提示（其余提示由 copilot 词典的全局词条翻译）
      'Create an issue with sub-issues': '创建带子议题的议题',
      'Improve test coverage': '提高测试覆盖率',

      // 附件按钮、引用选择器
      Attachments: '附件',
      'No issues found': '未找到议题',

      // 环境条：范围、环境、工具权限（与 copilot 词典一致）
      Personal: '个人',
      Environment: '环境',
      Remote: '远程',
      NEW: '新',
      Unsupported: '不受支持',
      Interactive: '交互式',
      Autopilot: '自动驾驶',
      Assisted: '辅助',
      'Allow all': '全部允许',
      // 环境菜单中不可用环境的状态标签（Offline 由全局词条翻译；单独的进度动名词作“X中”，与 copilot/agents 一致）
      Degraded: '降级',
      Waking: '唤醒中',
      Draining: '排空中'
    },
    composer.scoped,
    models.scoped
  ]),
  regexp: [
    // 问候语：Good morning, Mona! / Welcome to GitHub, Mona!
    [/^Good (morning|afternoon|evening), (.+)!$/, (_, time, name) => `${GREETINGS[time] ?? time}，${name}！`],
    [/^Welcome to GitHub, (.+)!$/, '欢迎来到 GitHub，$1！'],

    // 免费计划额度用尽：输入框横幅（Limit resets on November 1, 2026.）与首页提示（It will reset on May 07, 2026.）
    // 须排在 copilot 规则之前：后者的 (.+) 会把“计划升级暂不可用”尾句吞进日期
    [
      new RegExp(
        `^You have reached your free plan limit\\. (?:Limit resets on|It will reset on) (${DATE_SOURCE})\\.( Plan upgrades are temporarily unavailable\\.)?$`
      ),
      (_, date, freeze) => `已达免费计划上限。${joinCjk('限额将于', translateTime(date))}重置。${freeze ? '计划升级暂不可用。' : ''}`
    ],
    // 任务创建失败的读屏播报：Task creation failed. + 横幅说明
    [/^Task creation failed\. (.+)$/, (_, description) => `任务创建失败。${translateTaskFailure(description)}`],
    // 模型选择器、推理强度、使用情况横幅，附件与引用选择器（沿用 copilot 词典）
    ...(models.regexp ?? []),
    ...(composer.regexp ?? []),
    // 环境条、图片附件、任务创建失败横幅、粘贴代码块的读屏播报（copilot 的 agents、chat、skills 导出的共用规则）
    ...AGENT_RULES,
    ...CHAT_RULES,
    ...SKILL_RULES
  ]
} satisfies PageDictionary
