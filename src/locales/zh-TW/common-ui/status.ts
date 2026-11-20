import type { PageDictionary } from '../../../core/types'

/**
 * 状态与徽章：议题 / 拉取请求状态、可见性、生命周期标签、审查与讨论状态、签名验证、作者角色徽章及其说明。
 * 「Public archive」「Public template」等组合标签、「Mannequin」「Label: Pro」由其它词典的 static 收录。
 * 状态 Open 按术语表译「開放中」（与「已關閉」对称）；动词 open 由各页面词典译「開啟」「建立」。
 */

/** 状态标签（State 组件 title：Status: Open） */
const STATES: Readonly<Record<string, string>> = {
  Open: '開放中',
  Closed: '已關閉',
  Merged: '已合併',
  Draft: '草稿',
  Queued: '已排入佇列',
  Completed: '已完成',
  'Not planned': '不予處理',
  Duplicate: '重複',
  Archived: '已封存'
}

/** Primer Label 的 title：Label: Verified */
const LABELS: Readonly<Record<string, string>> = {
  Verified: '已驗證',
  Unverified: '未驗證',
  'GitHub Sponsor': 'GitHub 贊助者',
  Public: '公開',
  Private: '私人',
  Internal: '內部',
  'Public archive': '公開封存',
  'Private archive': '私人封存',
  'Public template': '公開範本',
  'Private template': '私人範本',
  'Public mirror': '公開鏡像',
  Preview: '預覽',
  'Public preview': '公開預覽',
  Staff: '員工',
  // 未设置时的占位（如存储库访问页的基本角色）
  None: '無'
}

/** 作者关系说明的主语：This user is → 此使用者；You are → 你 */
function subject(phrase: string): string {
  return phrase.startsWith('You') ? '你' : '此使用者'
}

/** 存储库：the core repository → 「 core 儲存庫」（前置空格接中文）；this repository → 此儲存庫 */
function repository(name: string): string {
  return name ? ` ${name} 儲存庫` : '此儲存庫'
}

/** 原文句末有句号时译文加句号 */
function period(dot: string): string {
  return dot ? '。' : ''
}

const ROLES: Readonly<Record<string, string>> = {
  maintainer: '維護者',
  collaborator: '協作者',
  contributor: '貢獻者'
}

const ITEM_KINDS: Readonly<Record<string, string>> = {
  issue: '議題',
  'pull request': '拉取請求',
  discussion: '討論'
}

export default {
  static: {
    // 议题与拉取请求状态
    Open: '開放中',
    Closed: '已關閉',
    Merged: '已合併',
    Draft: '草稿',
    Completed: '已完成',
    'Not planned': '不予處理',
    'not planned': '不予處理',
    Duplicate: '重複',
    'In merge queue': '在合併佇列中',
    Queued: '已排入佇列',
    Archived: '已封存',
    // 经典页面（时间线交叉引用、悬停卡片等）状态图标的 aria-label
    'Closed as not planned issue': '已關閉並標示為不予處理的議題',
    'Open Pull Request': '開放中的拉取請求',
    'Draft Pull Request': '草稿拉取請求',
    'Merged Pull Request': '已合併的拉取請求',
    'Closed Pull Request': '已關閉的拉取請求',

    // 可见性与存储库类型
    Public: '公開',
    Private: '私人',
    Internal: '內部',
    Template: '範本',
    Fork: '分叉',
    Mirror: '鏡像',

    // 生命周期
    Preview: '預覽',
    'Public preview': '公開預覽',
    Deprecated: '已淘汰',
    Experimental: '實驗性',

    // 审查、对话与讨论状态
    Approved: '已核准',
    'Changes requested': '已要求變更',
    'Change requested': '已要求變更',
    'Review required': '需要審查',
    Locked: '已鎖定',
    Unlocked: '未鎖定',
    Hidden: '已隱藏',
    Deleted: '已刪除',
    Answered: '已回答',
    Unanswered: '未回答',
    Unresolved: '未解決',
    'Read-only': '唯讀',
    'Read only': '唯讀',

    // 推荐标记
    Recommended: '推薦',
    Popular: '熱門',
    Featured: '精選',

    // 提交签名验证
    Verified: '已驗證',
    Unverified: '未驗證',
    'Partially verified': '部分驗證',
    Expired: '已過期',

    // 作者角色徽章
    Author: '作者',
    Owner: '擁有者',
    Member: '成員',
    Collaborator: '協作者',
    Contributor: '貢獻者',
    'First-time contributor': '首次貢獻者',
    'First-time GitHub contributor': 'GitHub 首次貢獻者',
    Maintainer: '維護者',
    Admin: '管理員',
    Moderator: '版主',
    Bot: '機器人',
    // 议题正文与评论头部的作者标签（小写；AI 保持原文）
    bot: '機器人',
    mannequin: '佔位帳號',
    Staff: '員工',
    // 审查评论的待提交徽章；检查、作业、部署的 Pending（擱置中）由页面词典收录
    Pending: '待處理',
    'This review comment is pending': '此審查留言尚未送出',
    'This is a mannequin user.': '這是佔位帳號。',
    'This is your first pull request on GitHub.': '這是你在 GitHub 上的第一個拉取請求。',
    "This user's first pull request on GitHub.": '這是此使用者在 GitHub 上的第一個拉取請求。',
    'This user’s first pull request on GitHub.': '這是此使用者在 GitHub 上的第一個拉取請求。'
  },
  regexp: [
    // 状态与标签 title
    [
      /^Status: (Open|Closed|Merged|Draft|Queued|Completed|Not planned|Duplicate|Archived)$/,
      (_, state: string) => `狀態：${STATES[state]!}`
    ],
    [
      /^Label: (Verified|Unverified|GitHub Sponsor|Public|Private|Internal|Public archive|Private archive|Public template|Private template|Public mirror|Preview|Public preview|Staff|None)$/,
      (_, label: string) => `標籤：${LABELS[label]!}`
    ],

    // 作者关系说明（评论头部徽章的 tooltip；原文有的带句号，有的不带）
    [
      /^(This user is|You are) a member of the ([\w.-]+) organization(\.?)$/,
      (_, who: string, org: string, dot: string) => `${subject(who)}是 ${org} 組織的成員${period(dot)}`
    ],
    [
      /^(This user is|You are) the owner of (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}是${repository(repo)}的擁有者${period(dot)}`
    ],
    [
      /^(This user has|You have) been invited to collaborate on (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}已受邀成為${repository(repo)}的協作者${period(dot)}`
    ],
    [
      /^(This user has|You have) previously committed to (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}曾提交至${repository(repo)}${period(dot)}`
    ],
    [
      /^(This user is|You are) a first-time contributor to (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}是${repository(repo)}的首次貢獻者${period(dot)}`
    ],
    [
      /^(This user is|You are) a (maintainer|collaborator|contributor) on this repository(\.?)$/,
      (_, who: string, role: string, dot: string) => `${subject(who)}是此儲存庫的${ROLES[role]!}${period(dot)}`
    ],
    [
      /^(This user is|You are) the author(?: of this (issue|pull request|discussion))?(\.?)$/,
      (_, who: string, kind: string | undefined, dot: string) =>
        `${subject(who)}是${kind ? `此${ITEM_KINDS[kind]!}的` : ''}作者${period(dot)}`
    ]
  ]
} satisfies PageDictionary
