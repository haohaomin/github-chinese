import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { copilotPlan } from './plans'

/** 引用选择器的分类名 */
const ENTITY: Readonly<Record<string, string>> = {
  'Files and folders': '文件和文件夹',
  Issues: '议题',
  'Pull requests': '拉取请求',
  Discussions: '讨论',
  Repositories: '存储库'
}

/** 引用增删的读屏公告（Adding issue 12 as a reference.）中的引用类型 */
const REFERENCE_TYPE: Readonly<Record<string, string>> = {
  issue: '议题',
  'pull-request': '拉取请求',
  discussion: '讨论'
}

/** 英文列表（Intl.ListFormat('en')：GIF, JPEG, PNG, and WEBP）改用顿号与“和”连接 */
function formatList(list: string): string {
  return list.replace(/,? and /, ' 和 ').replace(/, /g, '、')
}

/** 排队消息的操作 */
const QUEUE_ACTION: Readonly<Record<string, string>> = {
  'Send now': '立即发送',
  'Sending now': '正在立即发送',
  'Remove from queue': '从队列中删除',
  'Removing from queue': '正在从队列中删除'
}

/** 模型选择器锁定项的提示（Model locked. + 原因）中的固定原因句，译文与 models.ts 一致 */
const LOCKED_REASON: Readonly<Record<string, string>> = {
  "You've used all free requests this month.": '本月免费请求已用完。',
  "You've reached your premium request limit this month.": '本月高级请求已达上限。',
  'This model is not available on your plan.': '你的计划不支持此模型。'
}

/** 锁定原因：固定句查表，升级、方案要求两种句型按方案名拼接（原文带句号才补“。”）；都不中保留原文 */
function lockedReason(reason: string): string {
  const text = reason.replace(/’/g, "'")
  if (Object.hasOwn(LOCKED_REASON, text)) return LOCKED_REASON[text] ?? reason
  const upgrade = /^Upgrade to (Copilot [\w+]+) to access this model(\.?)$/.exec(text)
  if (upgrade) return `${joinCjk(joinCjk('升级到', copilotPlan(upgrade[1]!)), '以使用此模型')}${upgrade[2] ? '。' : ''}`
  const requires = /^This model requires (Copilot [\w+]+)(\.?)$/.exec(text)
  if (requires) return `${joinCjk('此模型需要', copilotPlan(requires[1]!))}${requires[2] ? '。' : ''}`
  return reason
}

/**
 * Copilot 聊天输入框：附件与粘贴、引用选择器、文件选择面板、排队消息、命令建议，
 * 以及停靠聊天面板中被变量拆开的提示片段。
 */
export default {
  static: {
    // 模型与扩展提示（模型名、扩展名单独成节点）
    'model currently doesn’t support external context from ongoing conversations. Start a new conversation to chat with this model.':
      '模型目前不支持来自进行中对话的外部上下文。开始新对话以使用此模型。',
    'model doesn’t support answering questions about images. Start a new conversation without images to chat with this model.':
      '模型不支持回答有关图片的问题。开始不含图片的新对话以使用此模型。',
    'Connect with': '连接',
    'extension, you’ll need to connect your GitHub account to your': '扩展，需要将你的 GitHub 帐户连接到你的',
    'Click connect to be redirected to': '单击连接后将跳转到',
    'Figma logo': 'Figma 徽标',

    // 文件选择面板
    "Couldn't load files. Something went wrong. Check your connection and try again.": '无法加载文件。出错了。请检查网络连接后重试。',
    "Couldn't load repositories. Something went wrong. Check your connection and try again.":
      '无法加载存储库。出错了。请检查网络连接后重试。',
    'Files loaded.': '文件已加载。',
    'Repositories loaded.': '存储库已加载。',
    'Search repositories…': '搜索存储库…',
    'Searching repositories': '正在搜索存储库',

    // 排队消息
    'message with attachments': '带附件的消息',

    // 上传与开始会话的错误
    'The cloud session is no longer available': '云端会话已不可用',
    'This turn has reached its upload limit': '本轮对话已达上传上限',
    'Try again, or open Copilot to start the session.': '请重试，或打开 Copilot 开始会话。'
  },
  scoped: {
    'Show more...': '显示更多...',
    'Upgrade plan': '升级计划',
    'An unexpected error occurred. Please try again.': '发生意外错误。请重试。'
  },
  regexp: [
    // 引用选择器
    [
      /^(Files and folders|Issues|Pull requests|Discussions|Repositories) ›(?: (.+) ›)?$/,
      (_, entity: string, repo: string) => `${ENTITY[entity] ?? entity} ›${repo ? ` ${repo} ›` : ''}`
    ],
    [/^Select folders and files in (.+)$/, '在 $1 中选择文件夹和文件'],
    [
      /^(Adding|Removing) (\S+) (\S+) as a reference\.$/,
      (_, action: string, type: string, id: string) => {
        const kind = Object.hasOwn(REFERENCE_TYPE, type) ? (REFERENCE_TYPE[type] ?? type) : type
        return action === 'Adding' ? `${joinCjk('正在将', kind)} ${id} 添加为引用。` : `${joinCjk('正在从引用中删除', kind)} ${id}。`
      }
    ],
    [/^Displayed (\d+) GitHub references?$/, '已显示 $1 个 GitHub 引用'],

    // 附件
    [/^Couldn['’]t attach (.+?)\. (?:This file type is|These file types are) unsupported\.$/, '无法附加 $1。文件类型不受支持。'],
    [/^Couldn['’]t attach (.+?)\. (?:This file|These files) must be ([\d.]+ ?[KMG]B) or smaller\.$/, '无法附加 $1。文件不能超过 $2。'],
    [
      /^Couldn['’]t attach (.+?)\. You can attach up to (\d+) (documents|files) at a time\.$/,
      (_, names: string, count: string, kind: string) =>
        `无法附加 ${names}。一次最多可附加 ${count} 个${kind === 'documents' ? '文档' : '文件'}。`
    ],
    [/^Couldn['’]t attach (.+?)\. (?:This file is|These files are) empty\.$/, '无法附加 $1。文件为空。'],
    [/^Couldn['’]t attach (.+?)\. (?:This file|These files) could not be read\.$/, '无法附加 $1。文件无法读取。'],
    [/^Couldn['’]t attach (.+?)\. You can upload up to ([\d.]+ ?[KMG]B) of files at a time\.$/, '无法附加 $1。一次最多可上传 $2 的文件。'],
    [
      /^Couldn['’]t paste (.+?)\. Only (.+) images can be pasted\. Drag in or attach (?:this file|these files) instead\.$/,
      (_, names: string, formats: string) => `无法粘贴 ${names}。仅可粘贴 ${formatList(formats)} 图片。请改为拖入或附加。`
    ],
    [
      /^Couldn['’]t upload (.+?)\. This session doesn['’]t allow writing files to the workspace\.$/,
      '无法上传 $1。此会话不允许向工作区写入文件。'
    ],
    [/^Couldn['’]t upload (.+?) to the workspace\. Try attaching (?:it|them) again\.$/, '无法将 $1 上传到工作区。请重新附加。'],

    // 排队消息与命令建议
    [
      /^(Send now|Sending now|Remove from queue|Removing from queue), queued message (\d+) of (\d+): (.+)$/,
      (_, action: string, index: string, total: string, label: string) =>
        `${QUEUE_ACTION[action] ?? action}，排队消息 ${index}/${total}：${label}`
    ],
    [/^(\d+) command suggestions available\. (.+) selected\.$/, '有 $1 条命令建议。已选择 $2。'],
    [/^Model locked\. (.+)$/, (_, reason: string) => `模型已锁定。${lockedReason(reason)}`],

    // 会话与存储库浏览
    [/^Saved session (\S+)$/, '已保存的会话 $1'],
    [/^Explore repository (.+)$/, '浏览存储库 $1'],
    [/^Unable to load this repository\. Select a repository owned by (.+)\.$/, '无法加载此存储库。请选择 $1 拥有的存储库。']
  ]
} satisfies PageDictionary
