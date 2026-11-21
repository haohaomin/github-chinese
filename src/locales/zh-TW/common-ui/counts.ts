import type { PageDictionary } from '../../../core/types'

/**
 * 通用计数：N stars、N comments、N members 等。数字可带千分位与 k / m 缩写（1.2k）。
 * 页面词典里同形规则优先；这里只收各处通用、含义固定的计数。
 * 量词按术语表随名词：人用「位」，留言、回复用「則」，次数用「次」，星标用「顆」，结果用「項」，其余用「個」。
 */

const COUNT = '(\\d[\\d,]*(?:\\.\\d+)?[kKmM]?)'

/** 名词（单复数）→ 量词 + 名词 */
const NOUNS: readonly (readonly [string, string])[] = [
  ['stars?', '顆星'],
  ['forks?', '個分叉'],
  ['comments?', '則留言'],
  ['repl(?:y|ies)', '則回覆'],
  ['items?', '個項目'],
  ['files?', '個檔案'],
  ['commits?', '個提交'],
  ['branch(?:es)?', '個分支'],
  ['tags?', '個標記'],
  ['labels?', '個標籤'],
  ['releases?', '個發行版本'],
  ['downloads?', '次下載'],
  ['packages?', '個套件'],
  ['repositor(?:y|ies)', '個儲存庫'],
  ['projects?', '個專案'],
  ['milestones?', '個里程碑'],
  ['issues?', '個議題'],
  ['pull requests?', '個拉取請求'],
  ['discussions?', '個討論'],
  ['results?', '項結果'],
  ['members?', '位成員'],
  ['invitations?', '個邀請'],
  ['followers?', '位追蹤者'],
  ['contributors?', '位貢獻者'],
  ['participants?', '位參與者'],
  ['reactions?', '個表情回應'],
  ['watching', '位關注者'],
  ['hidden items?', '個隱藏項目'],
  ['lines? changed', '行變更']
]

export default {
  regexp: [
    ...NOUNS.map(([noun, unit]) => [new RegExp(`^${COUNT} ${noun}$`), `$1 ${unit}`] as const),
    // 读屏播报的结果数（带句号）：4 results.
    [/^(\d[\d,]*) results?\.$/, '$1 項結果。'],
    // 字数余量：160 remaining
    [/^(\d[\d,]*) remaining$/, '剩餘 $1'],
    // 列表省略：Member of Vue, Vite, and 2 more
    [/^, and (\d[\d,]*) more$/, '，和其他 $1 個'],
    [/^and (\d[\d,]*) more$/, '和其他 $1 個']
  ]
} satisfies PageDictionary
