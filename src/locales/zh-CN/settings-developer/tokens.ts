import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, MONTH_SOURCE, RELATIVE_SOURCE, formatDate, joinCjk, translateTime } from '../helpers'
import { USAGE_SOURCE, translateUsage } from './keys'

const WEEKDAYS: Readonly<Record<string, string>> = {
  Sun: '周日',
  Mon: '周一',
  Tue: '周二',
  Wed: '周三',
  Thu: '周四',
  Fri: '周五',
  Sat: '周六'
}

const MONTH_NUMBERS: Readonly<Record<string, number>> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
}

/** 令牌页的日期格式：“Tue, Nov 25 2025”（不含捕获组） */
export const WEEKDAY_DATE_SOURCE = `(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat), ${MONTH_SOURCE} \\d{1,2},? \\d{4}`

const WEEKDAY_DATE_RE = new RegExp(`^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (${MONTH_SOURCE}) (\\d{1,2}),? (\\d{4})$`)

/** 令牌日期：带星期 → 2025 年 11 月 25 日周二；其余交给 translateTime */
export function translateTokenDate(text: string): string {
  const match = WEEKDAY_DATE_RE.exec(text)
  if (!match) return translateTime(text)
  const month = MONTH_NUMBERS[match[2]!.slice(0, 3).toLowerCase()]
  if (month === undefined) return text
  return `${formatDate(Number(match[4]), month, Number(match[3]))}${WEEKDAYS[match[1]!] ?? ''}`
}

const ANY_DATE_SOURCE = `(?:${WEEKDAY_DATE_SOURCE}|${DATE_SOURCE})`

/** 中文前后缀与令牌日期拼接：已于 + 2025 年 11 月 25 日 + 过期 → 已于 2025 年 11 月 25 日过期 */
function datePhrase(prefix: string, date: string, suffix = ''): string {
  return joinCjk(joinCjk(prefix, translateTokenDate(date)), suffix)
}

/** 句号：原文有则补全角句号 */
function period(dot: string): string {
  return dot ? '。' : ''
}

const OWNER_KIND: Readonly<Record<string, string>> = { organization: '组织', enterprise: '企业' }

/** 令牌策略的设定方：“acme organization” → acme 组织；名称原样保留 */
function policyOwner(name: string): string {
  const match = /^(.+) (organization|enterprise)$/.exec(name)
  return match ? `${match[1]} ${OWNER_KIND[match[2]!] ?? match[2]}` : name
}

/**
 * 个人访问令牌：精细（/settings/personal-access-tokens…）与经典（/settings/tokens…）的
 * 列表、新建表单、详情、重新生成，以及经典令牌的作用域说明。
 * 作用域代码（repo、workflow 等）保留英文，只翻译说明文字。
 */
export default {
  static: {
    // 标签页标题
    'Fine-grained Personal Access Tokens': '精细个人访问令牌',
    'New Fine-grained Personal Access Token': '新建精细个人访问令牌',
    'Personal Access Tokens (Classic)': '个人访问令牌（经典）',
    'New Personal Access Token (Classic)': '新建个人访问令牌（经典）',

    // 精细令牌列表
    'Generate new token': '生成新令牌',
    'Generate new token (classic)': '生成新令牌（经典）',
    'Fine-grained, repo-scoped': '精细、存储库范围',
    'For general use': '通用',
    // 「These are fine-grained, repository-scoped tokens suitable for personal <a>API</a> use and for using Git over HTTPS.」
    // 原文只有形容词间的逗号（译作顿号），定语整体后置
    'These are fine-grained, repository-scoped tokens suitable for personal': '这些是适用于个人',
    'use and for using Git over HTTPS.': '使用以及通过 HTTPS 使用 Git 的精细、存储库范围令牌。',
    'These are fine-grained, repository-scoped tokens suitable for personal API use and for using Git over HTTPS.':
      '这些是适用于个人 API 使用以及通过 HTTPS 使用 Git 的精细、存储库范围令牌。',
    'No fine-grained tokens created': '尚未创建精细令牌',
    'Need an API token for scripts or testing? Generate a personal access token for quick access to the GitHub API.':
      '需要用于脚本或测试的 API 令牌？生成个人访问令牌以快速访问 GitHub API。',
    'Loading expiration ...': '正在加载过期时间...',
    'Loading expiration...': '正在加载过期时间...',
    'Loading expiration…': '正在加载过期时间…',
    'This token has expired.': '此令牌已过期。',
    'This token has expired': '此令牌已过期',
    'To set a new expiration date, you must regenerate the token.': '要设置新的过期时间，必须重新生成令牌。',
    'Make sure to copy your personal access token now as you will not be able to see this again.':
      '请立即复制你的个人访问令牌以免之后无法再次查看。',
    'Are you sure you want to delete this token?': '确定要删除此令牌吗？',
    'Any applications or scripts using this token will no longer be able to access the GitHub API. You cannot undo this action.':
      '使用此令牌的应用或脚本将无法再访问 GitHub API。此操作无法撤销。',
    'I understand, delete this token': '我已了解，删除此令牌',
    'Deleted personal access token': '已删除个人访问令牌',
    'Copy token': '复制令牌',

    // 新建精细令牌
    'New fine-grained personal access token': '新建精细个人访问令牌',
    'Create a fine-grained, repository-scoped token suitable for personal API use and for using Git over HTTPS.':
      '创建适用于个人 API 使用以及通过 HTTPS 使用 Git 的精细、存储库范围令牌。',
    'Token name': '令牌名称',
    'A unique name for this token. May be visible to resource owners or users with possession of the token.':
      '此令牌的唯一名称。资源所有者或持有该令牌的用户可能会看到它。',
    "' is available.": "' 可用。",
    "' is not available. The token name has already been taken.": "' 不可用。令牌名称已被使用。",
    'Resource owner': '资源所有者',
    'The token will only be able to make changes to resources owned by the selected resource owner. Tokens can always read all public repositories.':
      '令牌只能更改所选资源所有者拥有的资源。令牌始终可以读取所有公共存储库。',
    'Select resource owner': '选择资源所有者',
    'You may only select resource owners with fine-grained PATs enabled.': '只能选择已启用精细 PAT 的资源所有者。',
    'Authorizing...': '授权中...',
    'Select date *': '选择日期 *',
    "Expiration date can't be blank": '过期时间不能为空',
    'Expiration date can’t be blank': '过期时间不能为空',
    'No expiration': '永不过期',
    'The token will expire on the selected date': '令牌将在所选日期过期',
    // 「The token will expire on <strong>日期</strong>」
    'The token will expire on': '令牌过期日期',
    'GitHub strongly recommends that you set an expiration date for your token to help keep your information secure.':
      'GitHub 强烈建议为令牌设置过期时间以保护你的信息安全。',
    'Select the repositories this token can access. Personal access tokens can always read from all public repositories on GitHub.com':
      '选择此令牌可以访问的存储库。个人访问令牌始终可以读取 GitHub.com 上的所有公共存储库',
    'Select the repositories this token can access. Personal access tokens can always read from all public repositories on GitHub.com.':
      '选择此令牌可以访问的存储库。个人访问令牌始终可以读取 GitHub.com 上的所有公共存储库。',
    'Read-only access to public repositories.': '对公共存储库的只读访问权限。',
    'This applies to all current and future repositories you own. Also includes public repositories (read-only).':
      '适用于你拥有的所有现有和将来的存储库。同时包括公共存储库（只读）。',
    'This applies to all current and future repositories that you can access in this organization. Also includes public repositories (read-only).':
      '适用于你在此组织中可以访问的所有现有和将来的存储库。同时包括公共存储库（只读）。',
    'Select at least one repository. Max 50 repositories. Also includes public repositories (read-only).':
      '至少选择一个存储库。最多 50 个存储库。同时包括公共存储库（只读）。',
    'This token will be ready for use immediately.': '此令牌将立即可用。',
    'Generate token': '生成令牌',
    'Generating...': '生成中...',
    'Generating…': '生成中…',
    'Your new personal access token': '你的新个人访问令牌',
    // 「Your new personal access token <strong>名称</strong> will be ready for use immediately. It will expire on <strong>日期</strong>.」
    'will be ready for use immediately. It will expire on': '将立即可用。过期日期为',
    'will be ready for use immediately.': '将立即可用。',

    // 精细令牌详情 / 重新生成：「Access on <a>@用户</a>」「Access on the <strong>组织</strong> organization」
    'Access on': '访问范围',
    'Access on the': '访问范围',
    'Your personal access token has been updated': '你的个人访问令牌已更新',
    'Your personal access token has been updated.': '你的个人访问令牌已更新。',
    'Regenerate fine-grained personal access token': '重新生成精细个人访问令牌',
    'Regenerate token': '重新生成令牌',
    'Submitting this form will generate a new token. Be aware that any scripts or applications using this token will need to be updated.':
      '提交此表单将生成新令牌。注意所有使用此令牌的脚本或应用都需要更新。',
    // 资源所有者为要求 SAML 单一登录等条件的组织时的授权检查
    'Something went wrong while checking. Please retry.': '检查时出错。请重试。',
    'At this time, you do not meet all requirements to access this organization.': '你目前不满足访问此组织的全部要求。',

    // 经典令牌列表
    'Personal access tokens (classic)': '个人访问令牌（经典）',
    'No personal access token created': '尚未创建个人访问令牌',
    // 「Tokens you have generated that can be used to access the <a>GitHub API</a>.」
    'Tokens you have generated that can be used to access the': '你生成的令牌可用于访问',
    'Tokens you have generated that can be used to access the GitHub API.': '你生成的可用于访问 GitHub API 的令牌。',
    'This token has no expiration date': '此令牌没有过期时间',
    'This token has no expiration date.': '此令牌没有过期时间。',
    'Confirm token deletion': '确认删除令牌',
    'Make sure to copy your personal access token now. You won’t be able to see it again!':
      '请立即复制你的个人访问令牌。之后将无法再次查看！',
    "Make sure to copy your personal access token now. You won't be able to see it again!":
      '请立即复制你的个人访问令牌。之后将无法再次查看！',
    'Personal access tokens (classic) function like ordinary OAuth access tokens. They can be used instead of a password for Git over HTTPS, or can be used to':
      '个人访问令牌（经典）的作用与普通 OAuth 访问令牌相同。它们可代替密码通过 HTTPS 使用 Git，也可用于',
    'authenticate to the API over Basic Authentication': '通过基本身份验证向 API 进行身份验证',

    // 新建 / 编辑经典令牌
    'New personal access token': '新建个人访问令牌',
    'New personal access token (classic)': '新建个人访问令牌（经典）',
    'Edit personal access token (classic)': '编辑个人访问令牌（经典）',
    'Regenerate personal access token (classic)': '重新生成个人访问令牌（经典）',
    "Note can't be blank": '备注不能为空',
    'Note can’t be blank': '备注不能为空',
    'Note has already been taken': '备注已被使用',
    'What’s this token for?': '此令牌的用途是什么？',
    "What's this token for?": '此令牌的用途是什么？',
    // 「This token expires on <strong>日期</strong>. To set a new expiration date, you must <a>regenerate the token</a>.」
    'This token expires on': '此令牌过期日期',
    '. To set a new expiration date, you must': '。要设置新的过期时间，必须',
    'regenerate the token': '重新生成令牌',
    'regenerate the token.': '重新生成令牌。',
    'Select scopes': '选择作用域',
    'Scopes define the access for personal tokens.': '作用域定义个人令牌的访问权限。',
    'Read more about OAuth scopes.': '了解 OAuth 作用域。',
    'Some of the scopes you’ve selected are included in other scopes. Only the minimum set of necessary scopes has been saved.':
      '你选择的部分作用域已包含在其他作用域中。仅保存了所需的最小作用域集。',
    "Some of the scopes you've selected are included in other scopes. Only the minimum set of necessary scopes has been saved.":
      '你选择的部分作用域已包含在其他作用域中。仅保存了所需的最小作用域集。',
    'Update token': '更新令牌',

    // 经典令牌作用域说明（也用于 OAuth 应用授权详情）
    'Full control of private repositories': '完全控制专用存储库',
    'Access commit status': '访问提交状态',
    'Access deployment status': '访问部署状态',
    'Access public repositories': '访问公共存储库',
    'Access repository invitations': '访问存储库邀请',
    'Read and write security events': '读写安全事件',
    'Update GitHub Action workflows': '更新 GitHub 操作工作流',
    'Update github action workflows': '更新 GitHub 操作工作流',
    'Upload packages to GitHub Package Registry': '向 GitHub 软件包注册表上传软件包',
    'Download packages from GitHub Package Registry': '从 GitHub 软件包注册表下载软件包',
    'Delete packages from GitHub Package Registry': '从 GitHub 软件包注册表删除软件包',
    'Full control of orgs and teams, read and write org projects': '完全控制组织和团队，读写组织项目',
    'Read and write org and team membership, read and write org projects': '读写组织和团队成员身份，读写组织项目',
    'Read org and team membership, read org projects': '读取组织和团队成员身份，读取组织项目',
    'Manage org runners and runner groups': '管理组织运行器和运行器组',
    'Full control of user public keys': '完全控制用户公钥',
    'Write user public keys': '写入用户公钥',
    'Read user public keys': '读取用户公钥',
    'Full control of repository hooks': '完全控制存储库 Web 钩子',
    'Write repository hooks': '写入存储库 Web 钩子',
    'Read repository hooks': '读取存储库 Web 钩子',
    'Full control of organization hooks': '完全控制组织 Web 钩子',
    'Create gists': '创建代码片段',
    'Access notifications': '访问通知',
    'Update ALL user data': '更新所有用户数据',
    'Update all user data': '更新所有用户数据',
    'Read ALL user profile data': '读取所有用户个人资料数据',
    'Read all user profile data': '读取所有用户个人资料数据',
    'Access user email addresses (read-only)': '访问用户电子邮件地址（只读）',
    'Access public information (read-only)': '访问公开信息（只读）',
    'Follow and unfollow users': '关注和取消关注用户',
    'Delete repositories': '删除存储库',
    'Read and write team discussions': '读写团队讨论',
    'Read team discussions': '读取团队讨论',
    'Full control of enterprises': '完全控制企业',
    'Manage enterprise runners and runner groups': '管理企业运行器和运行器组',
    'Read and write enterprise billing data': '读写企业计费数据',
    'Read enterprise profile data': '读取企业个人资料数据',
    'Provisioning of users and groups via SCIM': '通过 SCIM 预配用户和组',
    'Full control of audit log': '完全控制审核日志',
    'Read access of audit log': '读取审核日志',
    'Full control of codespaces': '完全控制代码空间',
    'Ability to create, read, update, and delete codespace secrets': '创建、读取、更新和删除代码空间机密',
    'Full control of GitHub Copilot settings and seat assignments': '完全控制 GitHub Copilot 设置和席位分配',
    'View and edit Copilot Business seat assignments': '查看和编辑 Copilot 商业版席位分配',
    'Write org hosted compute network configurations': '写入组织托管计算网络配置',
    'Read org hosted compute network configurations': '读取组织托管计算网络配置',
    'Full control of projects': '完全控制项目',
    'Read access of projects': '读取项目',
    'Full control of public user GPG keys': '完全控制用户公开 GPG 密钥',
    '(Developer Preview)': '（开发人员预览）',
    'Write public user GPG keys': '写入用户公开 GPG 密钥',
    'Read public user GPG keys': '读取用户公开 GPG 密钥',
    'Full control of public user SSH signing keys': '完全控制用户公开 SSH 签名密钥',
    'Write public user SSH signing keys': '写入用户公开 SSH 签名密钥',
    'Read public user SSH signing keys': '读取用户公开 SSH 签名密钥',
    // 作用域复选框的无障碍标签：说明首字母大写、其余小写
    'Upload packages to github package registry': '向 GitHub 软件包注册表上传软件包',
    'Download packages from github package registry': '从 GitHub 软件包注册表下载软件包',
    'Delete packages from github package registry': '从 GitHub 软件包注册表删除软件包',
    'Provisioning of users and groups via scim': '通过 SCIM 预配用户和组',
    'Full control of github copilot settings and seat assignments': '完全控制 GitHub Copilot 设置和席位分配',
    'View and edit copilot business seat assignments': '查看和编辑 Copilot 商业版席位分配',
    'Full control of public user gpg keys': '完全控制用户公开 GPG 密钥',
    'Write public user gpg keys': '写入用户公开 GPG 密钥',
    'Read public user gpg keys': '读取用户公开 GPG 密钥',
    'Full control of public user ssh signing keys': '完全控制用户公开 SSH 签名密钥',
    'Write public user ssh signing keys': '写入用户公开 SSH 签名密钥',
    'Read public user ssh signing keys': '读取用户公开 SSH 签名密钥'
  },
  scoped: {
    // 与组织令牌策略共用（Personal access tokens 见 permissions.ts，Note 见 moderation.ts，Custom 由 settings-account 收录）
    'Fine-grained tokens': '精细令牌',
    'Tokens (classic)': '令牌（经典）',
    'Fine-grained personal access tokens': '精细个人访问令牌',
    Expires: '有效期至',
    'No description': '暂无描述',
    Created: '创建于',
    today: '今天',
    '7 days': '7 天',
    '30 days': '30 天',
    '60 days': '60 天',
    '90 days': '90 天',
    'Custom...': '自定义...',
    'Custom…': '自定义…',
    'between 1 and 366 days': '介于 1 到 366 天之间',
    'Public repositories': '公共存储库',
    'Repository access': '存储库访问权限',
    'Select at least one repository.': '至少选择一个存储库。',
    'No repositories found.': '未找到存储库。',
    'User permissions': '用户权限',
    "Name can't be blank": '名称不能为空',
    'Name can’t be blank': '名称不能为空',
    'Token name *': '令牌名称 *',
    'Expiration *': '过期时间 *',
    // 新建令牌页的区块无障碍名称
    'personal access token': '个人访问令牌',
    'Authorization check': '授权检查',
    'Authorization failed': '授权失败',
    'Retry check': '重新检查',
    'See the documentation': '查看文档'
  },
  regexp: [
    // 过期时间
    [
      new RegExp(`^(Expires|Expired) on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, state: string, date: string, dot: string) =>
        state === 'Expires' ? `${datePhrase('有效期至', date)}${period(dot)}` : `${datePhrase('已于', date, '过期')}${period(dot)}`
    ],
    [
      new RegExp(`^This token expires on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${datePhrase('此令牌将于', date, '过期')}${period(dot)}`
    ],
    [
      new RegExp(`^This token expired on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${datePhrase('此令牌已于', date, '过期')}${period(dot)}`
    ],
    [
      new RegExp(`^The token will expire on (${ANY_DATE_SOURCE})(\\.?)$`),
      (_, date: string, dot: string) => `${datePhrase('令牌将于', date, '过期')}${period(dot)}`
    ],
    [
      new RegExp(`^Expires (${RELATIVE_SOURCE})(\\.?)$`),
      (_, time: string, dot: string) => `${joinCjk(translateTime(time), '过期')}${period(dot)}`
    ],
    [
      new RegExp(`^(\\d+) days? \\((${ANY_DATE_SOURCE})\\)$`),
      (_, days: string, date: string) => `${days} 天（${translateTokenDate(date)}）`
    ],
    // 日期单独在 <strong> 等元素中
    [new RegExp(`^(${WEEKDAY_DATE_SOURCE})(\\.?)$`), (_, date: string, dot: string) => `${translateTokenDate(date)}${period(dot)}`],
    [/^Limit set by ([\w.-]+) organization$/, '由 $1 组织设定的限制'],
    // 组织或企业的令牌有效期策略（名称为空时原文为「The requires …」；豁免句原文无逗号，译文不加）
    [
      /^The (?:(.+?) )?requires a maximum lifetime of (\d+) days? for fine-grained personal access tokens\.( As an enterprise administrator you are exempted from this requirement\.)?$/,
      (_, owner: string, days: string, exempt: string) => {
        const subject = owner ? joinCjk(policyOwner(owner), '要求') : '要求'
        const note = exempt ? '你作为企业管理员不受此要求限制。' : ''
        return `${subject}精细个人访问令牌的最长有效期为 ${days} 天。${note}`
      }
    ],

    // 使用情况
    [new RegExp(`^(${USAGE_SOURCE}) •$`), (_, usage: string) => `${translateUsage(usage)} •`],

    // 令牌名称校验（原文有引号；第二句原文是句号，译文不改成逗号）
    [/^['‘](.+)['’] is available\.$/, '“$1”可用。'],
    [/^['‘](.+)['’] is not available\. The token name has already been taken\.$/, '“$1”不可用。令牌名称已被使用。'],

    // 生成前的权限汇总；句末冒号随原文
    [
      /^(\d+) permissions? for all repositories(:?)$/,
      (_, count: string, colon: string) => `所有存储库的 ${count} 项权限${colon ? '：' : ''}`
    ],
    [
      /^(\d+) permissions? for (\d+) repositor(?:y|ies)(:?)$/,
      (_, count: string, repos: string, colon: string) => `${repos} 个存储库的 ${count} 项权限${colon ? '：' : ''}`
    ],
    [/^(\d+) account permissions?$/, '$1 项帐户权限'],
    [/^(\d+) organization permissions?$/, '$1 项组织权限'],
    [/^(\d+) repository permissions?$/, '$1 项存储库权限']
  ]
} satisfies PageDictionary
