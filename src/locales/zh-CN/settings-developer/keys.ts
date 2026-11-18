import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

const UNIT_LABEL: Readonly<Record<string, string>> = { week: '周', month: '个月', year: '年' }

/** “Last used within the last 3 weeks” → 最近 3 周内使用过；不带数字时 → 最近一周内使用过 */
export function lastUsedLabel(amount: string | undefined, unit: string): string {
  const label = UNIT_LABEL[unit] ?? unit
  return amount ? `最近 ${amount}${label}内使用过` : `最近一${label}内使用过`
}

/** 最近使用时间片段（不含捕获组），供其他文件拼接 */
export const LAST_USED_SOURCE = 'Last used within the last (?:\\d+ )?(?:week|month|year)s?'

const LAST_USED_RE = /^Last used within the last (?:(\d+) )?(week|month|year)s?$/

/** 解析最近使用时间片段；不匹配时返回 undefined */
export function translateLastUsed(text: string): string | undefined {
  const match = LAST_USED_RE.exec(text)
  return match ? lastUsedLabel(match[1], match[2]!) : undefined
}

/** 使用情况片段：“Never used”或“Last used within the last week”（不含捕获组） */
export const USAGE_SOURCE = `(?:Never used|${LAST_USED_SOURCE})`

/** 使用情况 → 从未使用 / 最近一周内使用过；无法识别时原样返回 */
export function translateUsage(text: string): string {
  return text === 'Never used' ? '从未使用' : (translateLastUsed(text) ?? text)
}

const KEY_ACCESS: Readonly<Record<string, string>> = { 'Read/write': '读写', 'Read-only': '只读' }

/**
 * SSH 与 GPG 密钥（/settings/keys、/settings/ssh/new、/settings/gpg/new）、警戒模式，
 * 以及凭据汇总页（/settings/credentials）。
 * 句子被链接、<strong> 拆开时按片段收录。
 */
export default {
  static: {
    // SSH 密钥列表
    'SSH keys': 'SSH 密钥',
    'New SSH key': '新建 SSH 密钥',
    'Authentication keys': '身份验证密钥',
    'Signing keys': '签名密钥',
    'Authentication key': '身份验证密钥',
    'Signing key': '签名密钥',
    'This is a list of SSH keys associated with your account. Remove any keys that you do not recognize.':
      '以下是与你的帐户关联的 SSH 密钥。请删除你无法识别的密钥。',
    'There are no SSH keys associated with your account.': '你的帐户没有关联任何 SSH 密钥。',
    // 「Check out our guide to <a>connecting to GitHub using SSH keys</a> or troubleshoot <a>common SSH problems</a>.」
    'Check out our guide to': '请参阅',
    'connecting to GitHub using SSH keys': '使用 SSH 密钥连接 GitHub 的指南',
    'generating SSH keys': '生成 SSH 密钥的指南',
    'or troubleshoot': '或排查',
    'common SSH problems': '常见 SSH 问题',
    'Check out our guide to connecting to GitHub using SSH keys or troubleshoot common SSH problems.':
      '请参阅使用 SSH 密钥连接 GitHub 的指南或排查常见 SSH 问题。',
    'Check out our guide to generating SSH keys or troubleshoot common SSH problems.': '请参阅生成 SSH 密钥的指南或排查常见 SSH 问题。',
    'Read/write': '读写',
    'SSH key fingerprint': 'SSH 密钥指纹',
    'This key has not been used in over a year': '此密钥已超过一年未使用',
    // 要求 SAML 单一登录的组织：「Configure SSO」下拉菜单
    'Configure SSO': '配置 SSO',
    'Single sign-on organizations': '单一登录组织',

    // 删除 SSH 密钥：「This action <strong>CANNOT</strong> be undone. …」（原文只有一个逗号，译文不多加）
    'Are you sure you want to delete this SSH key?': '确定要删除此 SSH 密钥吗？',
    'be undone. This will permanently delete the SSH key and if you’d like to use it in the future, you will need to upload it again.':
      '撤销。这将永久删除此 SSH 密钥，以后如需使用必须重新上传。',
    "be undone. This will permanently delete the SSH key and if you'd like to use it in the future, you will need to upload it again.":
      '撤销。这将永久删除此 SSH 密钥，以后如需使用必须重新上传。',
    'This action cannot be undone. This will permanently delete the SSH key and if you’d like to use it in the future, you will need to upload it again.':
      '此操作无法撤销。这将永久删除此 SSH 密钥，以后如需使用必须重新上传。',
    "This action cannot be undone. This will permanently delete the SSH key and if you'd like to use it in the future, you will need to upload it again.":
      '此操作无法撤销。这将永久删除此 SSH 密钥，以后如需使用必须重新上传。',
    'I understand, delete this SSH key': '我已了解，删除此 SSH 密钥',
    'Delete SSH key': '删除 SSH 密钥',
    'Okay, you have successfully deleted that key.': '已成功删除该密钥。',

    // 添加 SSH 密钥 /settings/ssh/new
    'Add new SSH Key': '添加新的 SSH 密钥',
    'Add new SSH key': '添加新的 SSH 密钥',
    'Key type': '密钥类型',
    'Authentication Key': '身份验证密钥',
    'Signing Key': '签名密钥',
    'Add SSH key': '添加 SSH 密钥',
    'Add SSH Key': '添加 SSH 密钥',
    "Begins with 'ssh-rsa', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521', 'ssh-ed25519', 'sk-ecdsa-sha2-nistp256@openssh.com', or 'sk-ssh-ed25519@openssh.com'":
      "以 'ssh-rsa'、'ecdsa-sha2-nistp256'、'ecdsa-sha2-nistp384'、'ecdsa-sha2-nistp521'、'ssh-ed25519'、'sk-ecdsa-sha2-nistp256@openssh.com' 或 'sk-ssh-ed25519@openssh.com' 开头",
    'Key is invalid. You must supply a key in OpenSSH public key format': '密钥无效。必须提供 OpenSSH 公钥格式的密钥',
    'Key is invalid. You must supply a key in OpenSSH public key format.': '密钥无效。必须提供 OpenSSH 公钥格式的密钥。',
    'Key is already in use': '密钥已被使用',
    'Key is already in use.': '密钥已被使用。',
    "Key can't be blank": '密钥不能为空',
    'Key can’t be blank': '密钥不能为空',
    'We got an error doing that.': '操作出错。',

    // GPG 密钥列表
    'GPG keys': 'GPG 密钥',
    'New GPG key': '新建 GPG 密钥',
    'This is a list of GPG keys associated with your account. Remove any keys that you do not recognize.':
      '以下是与你的帐户关联的 GPG 密钥。请删除你无法识别的密钥。',
    'There are no GPG keys associated with your account.': '你的帐户没有关联任何 GPG 密钥。',
    // 「Learn how to <a>generate a GPG key and add it to your account</a>.」
    'generate a GPG key and add it to your account': '生成 GPG 密钥并将其添加到你的帐户',
    'Learn how to generate a GPG key and add it to your account.': '了解如何生成 GPG 密钥并将其添加到你的帐户。',
    'Key ID:': '密钥 ID：',
    'Subkeys:': '子密钥：',
    'Email address:': '电子邮件地址：',
    'Email addresses:': '电子邮件地址：',

    // 删除 GPG 密钥
    'Are you sure you want to delete this GPG key?': '确定要删除此 GPG 密钥吗？',
    'be undone. This will permanently delete the GPG key, and if you’d like to use it in the future, you will need to upload it again.':
      '撤销。这将永久删除此 GPG 密钥，以后如需使用，必须重新上传。',
    "be undone. This will permanently delete the GPG key, and if you'd like to use it in the future, you will need to upload it again.":
      '撤销。这将永久删除此 GPG 密钥，以后如需使用，必须重新上传。',
    'This action cannot be undone. This will permanently delete the GPG key, and if you’d like to use it in the future, you will need to upload it again.':
      '此操作无法撤销。这将永久删除此 GPG 密钥，以后如需使用，必须重新上传。',
    "This action cannot be undone. This will permanently delete the GPG key, and if you'd like to use it in the future, you will need to upload it again.":
      '此操作无法撤销。这将永久删除此 GPG 密钥，以后如需使用，必须重新上传。',
    'Any commits you signed with this key will become unverified after removing it.': '你用此密钥签名的所有提交在删除后都将变为未验证。',
    'Commits you signed with this key may become unverified after removing it.': '你用此密钥签名的提交在删除后可能会变为未验证。',
    'Learn more about persistent commit signature verification.': '了解持久提交签名验证。',
    'I understand, delete this GPG key': '我已了解，删除此 GPG 密钥',
    'Delete GPG key': '删除 GPG 密钥',

    // 添加 GPG 密钥 /settings/gpg/new
    'Add new GPG key': '添加新的 GPG 密钥',
    'Add new GPG Key': '添加新的 GPG 密钥',
    'Add GPG key': '添加 GPG 密钥',
    "Begins with '-----BEGIN PGP PUBLIC KEY BLOCK-----'": "以 '-----BEGIN PGP PUBLIC KEY BLOCK-----' 开头",
    'We got an error adding your GPG key. Please verify the input is a valid GPG key.':
      '添加 GPG 密钥时出错。请确认输入的是有效的 GPG 密钥。',

    // 警戒模式
    'Vigilant mode': '警戒模式',
    'Enable Vigilant mode': '启用警戒模式',
    'Flag unsigned commits as unverified': '将未签名的提交标记为未验证',
    'This will include any commit attributed to your account but not signed with your GPG or S/MIME key.':
      '这将包括所有归属于你的帐户但未使用你的 GPG 或 S/MIME 密钥签名的提交。',
    'Note that this will include your existing unsigned commits.': '注意这也包括你现有的未签名提交。',
    'This will include any commit attributed to your account but not signed with your GPG or S/MIME key. Note that this will include your existing unsigned commits.':
      '这将包括所有归属于你的帐户但未使用你的 GPG 或 S/MIME 密钥签名的提交。注意这也包括你现有的未签名提交。',

    // 凭据汇总 /settings/credentials
    'View and manage all the credentials generated or authorized by your personal account.': '查看和管理你的个人帐户生成或授权的所有凭据。',
    'Fine-grained personal access tokens generated by your personal account.': '你的个人帐户生成的精细个人访问令牌。',
    'Personal access tokens (classic) generated by your personal account.': '你的个人帐户生成的个人访问令牌（经典）。',
    'Authorized OAuth apps': '授权的 OAuth 应用',
    'OAuth apps that have been authorized to access your account.': '已获授权访问你帐户的 OAuth 应用。',
    'GitHub Apps that have been authorized to access your account.': '已获授权访问你帐户的 GitHub 应用。',
    'SSH keys associated with your account.': '与你的帐户关联的 SSH 密钥。',
    // 撤销凭据对话框
    'GitHub App and OAuth app user access tokens': 'GitHub 应用和 OAuth 应用的用户访问令牌',
    'User SSH keys': '用户 SSH 密钥',
    'Credential type': '凭据类型',
    'All credential types': '所有凭据类型'
  },
  scoped: {
    Key: '密钥',
    'GPG key': 'GPG 密钥',
    // 密钥图标下方的类型标记（身份验证密钥显示 SSH）
    Signing: '签名',
    Authorize: '授权',
    Deauthorize: '取消授权',
    'Added on': '添加于',
    'Never used': '从未使用',
    'Learn how to': '了解如何',
    'This action': '此操作',
    CANNOT: '无法',
    cannot: '无法',
    "Title can't be blank": '标题不能为空',
    'Title can’t be blank': '标题不能为空'
  },
  regexp: [
    [new RegExp(`^Added on (${DATE_SOURCE})$`), (_, date: string) => joinCjk('添加于', translateTime(date))],
    [LAST_USED_RE, (_, amount: string, unit: string) => lastUsedLabel(amount || undefined, unit)],
    // 「Never used — Read/write」：破折号与访问级别在同一文本节点
    [/^— (Read\/write|Read-only)$/, (_, access: string) => `— ${KEY_ACCESS[access] ?? access}`],
    [
      /^You have successfully added the key ['‘"“](.+)['’"”](\.?)$/,
      (_, title: string, dot: string) => `已成功添加密钥“${title}”${dot ? '。' : ''}`
    ],
    // 凭据汇总：各类凭据数量
    [/^(\d+) tokens?$/, '$1 个令牌'],
    [/^(\d+) OAuth apps?$/i, '$1 个 OAuth 应用'],
    [/^(\d+) GitHub Apps?$/, '$1 个 GitHub 应用'],
    [/^(\d+) SSH keys?$/, '$1 个 SSH 密钥'],
    [/^(\d+) keys?$/, '$1 个密钥']
  ]
} satisfies PageDictionary
