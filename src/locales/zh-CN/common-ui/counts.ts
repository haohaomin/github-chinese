import type { PageDictionary } from '../../../core/types'

/**
 * 通用计数：N stars、N comments、N members 等。数字可带千分位与 k / m 缩写（1.2k）。
 * 页面词典里同形规则优先；这里只收各处通用、含义固定的计数。
 */

const COUNT = '(\\d[\\d,]*(?:\\.\\d+)?[kKmM]?)'

/** 名词（单复数）→ 量词 + 名词 */
const NOUNS: readonly (readonly [string, string])[] = [
  ['stars?', '个星标'],
  ['forks?', '个复刻'],
  ['comments?', '条评论'],
  ['repl(?:y|ies)', '条回复'],
  ['items?', '个项'],
  ['files?', '个文件'],
  ['commits?', '个提交'],
  ['branch(?:es)?', '个分支'],
  ['tags?', '个标签'],
  ['labels?', '个标签'],
  ['releases?', '个发行版'],
  ['downloads?', '次下载'],
  ['packages?', '个软件包'],
  ['repositor(?:y|ies)', '个存储库'],
  ['projects?', '个项目'],
  ['milestones?', '个里程碑'],
  ['issues?', '个议题'],
  ['pull requests?', '个拉取请求'],
  ['discussions?', '个讨论'],
  ['results?', '个结果'],
  ['members?', '个成员'],
  ['invitations?', '个邀请'],
  ['followers?', '个关注者'],
  ['contributors?', '个贡献者'],
  ['participants?', '个参与者'],
  ['reactions?', '个反应'],
  ['watching', '个关注者'],
  ['hidden items?', '个隐藏项'],
  ['lines? changed', '行更改']
]

export default {
  regexp: [
    ...NOUNS.map(([noun, unit]) => [new RegExp(`^${COUNT} ${noun}$`), `$1 ${unit}`] as const),
    // 读屏播报的结果数（带句号）：4 results.
    [/^(\d[\d,]*) results?\.$/, '$1 个结果。'],
    // 字数余量：160 remaining
    [/^(\d[\d,]*) remaining$/, '剩余 $1'],
    // 列表省略：Member of Vue, Vite, and 2 more
    [/^, and (\d[\d,]*) more$/, '，以及其他 $1 个'],
    [/^and (\d[\d,]*) more$/, '以及其他 $1 个']
  ]
} satisfies PageDictionary
