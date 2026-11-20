import type { PageDictionary } from '../../../core/types'

/**
 * 状态与徽章：议题 / 拉取请求状态、可见性、生命周期标签、审查与讨论状态、签名验证、作者角色徽章及其说明。
 * 「Public archive」「Public template」等组合标签、「Mannequin」「Label: Pro」由其它词典的 static 收录。
 */

/** 状态标签（State 组件 title：Status: Open） */
const STATES: Readonly<Record<string, string>> = {
  Open: '打开',
  Closed: '已关闭',
  Merged: '已合并',
  Draft: '草稿',
  Queued: '已排队',
  Completed: '已完成',
  'Not planned': '未计划',
  Duplicate: '重复',
  Archived: '已存档'
}

/** Primer Label 的 title：Label: Verified */
const LABELS: Readonly<Record<string, string>> = {
  Verified: '已验证',
  Unverified: '未验证',
  'GitHub Sponsor': 'GitHub 赞助者',
  Public: '公共',
  Private: '专用',
  Internal: '内部',
  'Public archive': '公共存档',
  'Private archive': '专用存档',
  'Public template': '公共模板',
  'Private template': '专用模板',
  'Public mirror': '公共镜像',
  Preview: '预览',
  'Public preview': '公开预览',
  Staff: '员工',
  // 未设置时的占位（如存储库访问页的基本角色）
  None: '无'
}

/** 作者关系说明的主语：This user is → 此用户；You are → 你 */
function subject(phrase: string): string {
  return phrase.startsWith('You') ? '你' : '此用户'
}

/** 存储库：the core repository → 「 core 存储库」（前置空格接中文）；this repository → 此存储库 */
function repository(name: string): string {
  return name ? ` ${name} 存储库` : '此存储库'
}

/** 原文句末有句号时译文加句号 */
function period(dot: string): string {
  return dot ? '。' : ''
}

const ROLES: Readonly<Record<string, string>> = {
  maintainer: '维护者',
  collaborator: '协作者',
  contributor: '贡献者'
}

const ITEM_KINDS: Readonly<Record<string, string>> = {
  issue: '议题',
  'pull request': '拉取请求',
  discussion: '讨论'
}

export default {
  static: {
    // 议题与拉取请求状态
    Open: '打开',
    Closed: '已关闭',
    Merged: '已合并',
    Draft: '草稿',
    Completed: '已完成',
    'Not planned': '未计划',
    'not planned': '未计划',
    Duplicate: '重复',
    'In merge queue': '在合并队列中',
    Queued: '已排队',
    Archived: '已存档',
    // 经典页面（时间线交叉引用、悬停卡片等）状态图标的 aria-label
    'Closed as not planned issue': '以未计划关闭的议题',
    'Open Pull Request': '打开的拉取请求',
    'Draft Pull Request': '草稿拉取请求',
    'Merged Pull Request': '已合并的拉取请求',
    'Closed Pull Request': '已关闭的拉取请求',

    // 可见性与存储库类型
    Public: '公共',
    Private: '专用',
    Internal: '内部',
    Template: '模板',
    Fork: '复刻',
    Mirror: '镜像',

    // 生命周期
    Preview: '预览',
    'Public preview': '公开预览',
    Deprecated: '已弃用',
    Experimental: '实验性',

    // 审查、对话与讨论状态
    Approved: '已批准',
    'Changes requested': '已请求更改',
    'Change requested': '已请求更改',
    'Review required': '需要审查',
    Locked: '已锁定',
    Unlocked: '未锁定',
    Hidden: '已隐藏',
    Deleted: '已删除',
    Answered: '已回答',
    Unanswered: '未回答',
    Unresolved: '未解决',
    'Read-only': '只读',
    'Read only': '只读',

    // 推荐标记
    Recommended: '推荐',
    Popular: '热门',
    Featured: '精选',

    // 提交签名验证
    Verified: '已验证',
    Unverified: '未验证',
    'Partially verified': '部分验证',
    Expired: '已过期',

    // 作者角色徽章
    Author: '作者',
    Owner: '所有者',
    Member: '成员',
    Collaborator: '协作者',
    Contributor: '贡献者',
    'First-time contributor': '首次贡献者',
    'First-time GitHub contributor': 'GitHub 首次贡献者',
    Maintainer: '维护者',
    Admin: '管理员',
    Moderator: '版主',
    Bot: '机器人',
    // 议题正文与评论头部的作者标签（小写；AI 保持原文）
    bot: '机器人',
    mannequin: '占位帐户',
    Staff: '员工',
    // 审查评论的待提交徽章；检查、作业、部署的 Pending（挂起）由页面词典收录
    Pending: '待处理',
    'This review comment is pending': '此审查评论尚未提交',
    'This is a mannequin user.': '这是一个占位帐户。',
    'This is your first pull request on GitHub.': '这是你在 GitHub 上的第一个拉取请求。',
    "This user's first pull request on GitHub.": '这是此用户在 GitHub 上的第一个拉取请求。',
    'This user’s first pull request on GitHub.': '这是此用户在 GitHub 上的第一个拉取请求。'
  },
  regexp: [
    // 状态与标签 title
    [
      /^Status: (Open|Closed|Merged|Draft|Queued|Completed|Not planned|Duplicate|Archived)$/,
      (_, state: string) => `状态：${STATES[state]!}`
    ],
    [
      /^Label: (Verified|Unverified|GitHub Sponsor|Public|Private|Internal|Public archive|Private archive|Public template|Private template|Public mirror|Preview|Public preview|Staff|None)$/,
      (_, label: string) => `标签：${LABELS[label]!}`
    ],

    // 作者关系说明（评论头部徽章的 tooltip；原文有的带句号，有的不带）
    [
      /^(This user is|You are) a member of the ([\w.-]+) organization(\.?)$/,
      (_, who: string, org: string, dot: string) => `${subject(who)}是 ${org} 组织的成员${period(dot)}`
    ],
    [
      /^(This user is|You are) the owner of (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}是${repository(repo)}的所有者${period(dot)}`
    ],
    [
      /^(This user has|You have) been invited to collaborate on (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}已受邀协作${repository(repo)}${period(dot)}`
    ],
    [
      /^(This user has|You have) previously committed to (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}曾向${repository(repo)}提交过代码${period(dot)}`
    ],
    [
      /^(This user is|You are) a first-time contributor to (?:the ([\w.-]+)|this) repository(\.?)$/,
      (_, who: string, repo: string, dot: string) => `${subject(who)}是${repository(repo)}的首次贡献者${period(dot)}`
    ],
    [
      /^(This user is|You are) a (maintainer|collaborator|contributor) on this repository(\.?)$/,
      (_, who: string, role: string, dot: string) => `${subject(who)}是此存储库的${ROLES[role]!}${period(dot)}`
    ],
    [
      /^(This user is|You are) the author(?: of this (issue|pull request|discussion))?(\.?)$/,
      (_, who: string, kind: string | undefined, dot: string) =>
        `${subject(who)}是${kind ? `此${ITEM_KINDS[kind]!}的` : ''}作者${period(dot)}`
    ]
  ]
} satisfies PageDictionary
