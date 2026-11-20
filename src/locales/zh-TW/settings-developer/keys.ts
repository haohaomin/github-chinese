import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

const UNIT_LABEL: Readonly<Record<string, string>> = { week: '週', month: '個月', year: '年' }

/** “Last used within the last 3 weeks” → 最近 3 週內使用過；不带数字时 → 最近一週內使用過 */
export function lastUsedLabel(amount: string | undefined, unit: string): string {
  const label = UNIT_LABEL[unit] ?? unit
  return amount ? `最近 ${amount} ${label}內使用過` : `最近一${label}內使用過`
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

/** 使用情况 → 從未使用 / 最近一週內使用過；无法识别时原样返回 */
export function translateUsage(text: string): string {
  return text === 'Never used' ? '從未使用' : (translateLastUsed(text) ?? text)
}

/** 访问级别：Read/write → 讀寫，Read-only → 唯讀 */
const KEY_ACCESS: Readonly<Record<string, string>> = { 'Read/write': '讀寫', 'Read-only': '唯讀' }

/**
 * SSH 与 GPG 密钥（/settings/keys、/settings/ssh/new、/settings/gpg/new）、警戒模式，
 * 以及凭据汇总页（/settings/credentials）。
 * 句子被链接、<strong> 拆开时按片段收录。
 * 术语：key → 金鑰，signing → 簽署，credential → 認證資訊，fingerprint → 指紋，troubleshoot → 排解。
 */
export default {
  static: {
    // SSH 密钥列表
    'SSH keys': 'SSH 金鑰',
    'New SSH key': '新增 SSH 金鑰',
    'Authentication keys': '身分驗證金鑰',
    'Signing keys': '簽署金鑰',
    'Authentication key': '身分驗證金鑰',
    'Signing key': '簽署金鑰',
    'This is a list of SSH keys associated with your account. Remove any keys that you do not recognize.':
      '以下是與你的帳號關聯的 SSH 金鑰。移除任何你無法辨識的金鑰。',
    'There are no SSH keys associated with your account.': '你的帳號沒有關聯任何 SSH 金鑰。',
    // 「Check out our guide to <a>connecting to GitHub using SSH keys</a> or troubleshoot <a>common SSH problems</a>.」
    'Check out our guide to': '請參閱',
    'connecting to GitHub using SSH keys': '使用 SSH 金鑰連線到 GitHub 的指南',
    'generating SSH keys': '產生 SSH 金鑰的指南',
    'or troubleshoot': '或排解',
    'common SSH problems': '常見的 SSH 問題',
    'Check out our guide to connecting to GitHub using SSH keys or troubleshoot common SSH problems.':
      '請參閱使用 SSH 金鑰連線到 GitHub 的指南或排解常見的 SSH 問題。',
    'Check out our guide to generating SSH keys or troubleshoot common SSH problems.': '請參閱產生 SSH 金鑰的指南或排解常見的 SSH 問題。',
    'Read/write': '讀寫',
    'SSH key fingerprint': 'SSH 金鑰指紋',
    'This key has not been used in over a year': '此金鑰已超過一年未使用',
    // 要求 SAML 单一登录的组织：「Configure SSO」下拉菜单
    'Configure SSO': '設定 SSO',
    'Single sign-on organizations': '單一登入組織',

    // 删除 SSH 密钥：「This action <strong>CANNOT</strong> be undone. …」（原文只有一个逗号，译文不多加）
    'Are you sure you want to delete this SSH key?': '確定要刪除此 SSH 金鑰嗎？',
    'be undone. This will permanently delete the SSH key and if you’d like to use it in the future, you will need to upload it again.':
      '復原。這將永久刪除此 SSH 金鑰，日後如需使用必須重新上傳。',
    "be undone. This will permanently delete the SSH key and if you'd like to use it in the future, you will need to upload it again.":
      '復原。這將永久刪除此 SSH 金鑰，日後如需使用必須重新上傳。',
    'This action cannot be undone. This will permanently delete the SSH key and if you’d like to use it in the future, you will need to upload it again.':
      '此動作無法復原。這將永久刪除此 SSH 金鑰，日後如需使用必須重新上傳。',
    "This action cannot be undone. This will permanently delete the SSH key and if you'd like to use it in the future, you will need to upload it again.":
      '此動作無法復原。這將永久刪除此 SSH 金鑰，日後如需使用必須重新上傳。',
    'I understand, delete this SSH key': '我瞭解，刪除此 SSH 金鑰',
    'Delete SSH key': '刪除 SSH 金鑰',
    'Okay, you have successfully deleted that key.': '已成功刪除該金鑰。',

    // 添加 SSH 密钥 /settings/ssh/new（Add new X 的「新」已含在「新增」里）
    'Add new SSH Key': '新增 SSH 金鑰',
    'Add new SSH key': '新增 SSH 金鑰',
    'Key type': '金鑰類型',
    'Authentication Key': '身分驗證金鑰',
    'Signing Key': '簽署金鑰',
    'Add SSH key': '新增 SSH 金鑰',
    'Add SSH Key': '新增 SSH 金鑰',
    // 原文的单引号单独出现，转成「」
    "Begins with 'ssh-rsa', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521', 'ssh-ed25519', 'sk-ecdsa-sha2-nistp256@openssh.com', or 'sk-ssh-ed25519@openssh.com'":
      '以「ssh-rsa」、「ecdsa-sha2-nistp256」、「ecdsa-sha2-nistp384」、「ecdsa-sha2-nistp521」、「ssh-ed25519」、「sk-ecdsa-sha2-nistp256@openssh.com」或「sk-ssh-ed25519@openssh.com」開頭',
    'Key is invalid. You must supply a key in OpenSSH public key format': '金鑰無效。必須提供 OpenSSH 公開金鑰格式的金鑰',
    'Key is invalid. You must supply a key in OpenSSH public key format.': '金鑰無效。必須提供 OpenSSH 公開金鑰格式的金鑰。',
    'Key is already in use': '金鑰已在使用中',
    'Key is already in use.': '金鑰已在使用中。',
    "Key can't be blank": '金鑰不能空白',
    'Key can’t be blank': '金鑰不能空白',
    'We got an error doing that.': '執行時發生錯誤。',

    // GPG 密钥列表
    'GPG keys': 'GPG 金鑰',
    'New GPG key': '新增 GPG 金鑰',
    'This is a list of GPG keys associated with your account. Remove any keys that you do not recognize.':
      '以下是與你的帳號關聯的 GPG 金鑰。移除任何你無法辨識的金鑰。',
    'There are no GPG keys associated with your account.': '你的帳號沒有關聯任何 GPG 金鑰。',
    // 「Learn how to <a>generate a GPG key and add it to your account</a>.」
    'generate a GPG key and add it to your account': '產生 GPG 金鑰並將其加入你的帳號',
    'Learn how to generate a GPG key and add it to your account.': '瞭解如何產生 GPG 金鑰並將其加入你的帳號。',
    'Key ID:': '金鑰 ID：',
    'Subkeys:': '子金鑰：',
    'Email address:': '電子郵件地址：',
    'Email addresses:': '電子郵件地址：',

    // 删除 GPG 密钥
    'Are you sure you want to delete this GPG key?': '確定要刪除此 GPG 金鑰嗎？',
    'be undone. This will permanently delete the GPG key, and if you’d like to use it in the future, you will need to upload it again.':
      '復原。這將永久刪除此 GPG 金鑰，日後如需使用，必須重新上傳。',
    "be undone. This will permanently delete the GPG key, and if you'd like to use it in the future, you will need to upload it again.":
      '復原。這將永久刪除此 GPG 金鑰，日後如需使用，必須重新上傳。',
    'This action cannot be undone. This will permanently delete the GPG key, and if you’d like to use it in the future, you will need to upload it again.':
      '此動作無法復原。這將永久刪除此 GPG 金鑰，日後如需使用，必須重新上傳。',
    "This action cannot be undone. This will permanently delete the GPG key, and if you'd like to use it in the future, you will need to upload it again.":
      '此動作無法復原。這將永久刪除此 GPG 金鑰，日後如需使用，必須重新上傳。',
    'Any commits you signed with this key will become unverified after removing it.':
      '你用此金鑰簽署的所有提交在移除金鑰後都將變成未驗證。',
    'Commits you signed with this key may become unverified after removing it.': '你用此金鑰簽署的提交在移除金鑰後可能會變成未驗證。',
    'Learn more about persistent commit signature verification.': '瞭解持續性提交簽章驗證。',
    'I understand, delete this GPG key': '我瞭解，刪除此 GPG 金鑰',
    'Delete GPG key': '刪除 GPG 金鑰',

    // 添加 GPG 密钥 /settings/gpg/new
    'Add new GPG key': '新增 GPG 金鑰',
    'Add new GPG Key': '新增 GPG 金鑰',
    'Add GPG key': '新增 GPG 金鑰',
    "Begins with '-----BEGIN PGP PUBLIC KEY BLOCK-----'": '以「-----BEGIN PGP PUBLIC KEY BLOCK-----」開頭',
    'We got an error adding your GPG key. Please verify the input is a valid GPG key.':
      '新增 GPG 金鑰時發生錯誤。請確認輸入的是有效的 GPG 金鑰。',

    // 警戒模式
    'Vigilant mode': '警戒模式',
    'Enable Vigilant mode': '啟用警戒模式',
    'Flag unsigned commits as unverified': '將未簽署的提交標示為未驗證',
    'This will include any commit attributed to your account but not signed with your GPG or S/MIME key.':
      '這將包含所有歸屬於你的帳號但未使用你的 GPG 或 S/MIME 金鑰簽署的提交。',
    'Note that this will include your existing unsigned commits.': '請注意這也會包含你現有的未簽署提交。',
    'This will include any commit attributed to your account but not signed with your GPG or S/MIME key. Note that this will include your existing unsigned commits.':
      '這將包含所有歸屬於你的帳號但未使用你的 GPG 或 S/MIME 金鑰簽署的提交。請注意這也會包含你現有的未簽署提交。',

    // 凭据汇总 /settings/credentials
    'View and manage all the credentials generated or authorized by your personal account.':
      '查看並管理你的個人帳號產生或授權的所有認證資訊。',
    'Fine-grained personal access tokens generated by your personal account.': '你的個人帳號產生的精細個人存取權杖。',
    'Personal access tokens (classic) generated by your personal account.': '你的個人帳號產生的個人存取權杖（傳統）。',
    'Authorized OAuth apps': '已授權的 OAuth 應用程式',
    'OAuth apps that have been authorized to access your account.': '已獲授權存取你帳號的 OAuth 應用程式。',
    'GitHub Apps that have been authorized to access your account.': '已獲授權存取你帳號的 GitHub 應用程式。',
    'SSH keys associated with your account.': '與你的帳號關聯的 SSH 金鑰。',
    // 撤销凭据对话框
    'GitHub App and OAuth app user access tokens': 'GitHub 應用程式和 OAuth 應用程式的使用者存取權杖',
    'User SSH keys': '使用者 SSH 金鑰',
    'Credential type': '認證資訊類型',
    'All credential types': '所有認證資訊類型'
  },
  scoped: {
    Key: '金鑰',
    'GPG key': 'GPG 金鑰',
    // 密钥图标下方的类型标记（身份验证密钥显示 SSH）
    Signing: '簽署',
    Authorize: '授權',
    Deauthorize: '取消授權',
    'Added on': '新增於',
    'Never used': '從未使用',
    'Learn how to': '瞭解如何',
    'This action': '此動作',
    CANNOT: '無法',
    cannot: '無法',
    "Title can't be blank": '標題不能空白',
    'Title can’t be blank': '標題不能空白'
  },
  regexp: [
    [new RegExp(`^Added on (${DATE_SOURCE})$`), (_, date: string) => joinCjk('新增於', translateTime(date))],
    [LAST_USED_RE, (_, amount: string, unit: string) => lastUsedLabel(amount || undefined, unit)],
    // 「Never used — Read/write」：破折号与访问级别在同一文本节点
    [/^— (Read\/write|Read-only)$/, (_, access: string) => `— ${KEY_ACCESS[access] ?? access}`],
    [
      /^You have successfully added the key ['‘"“](.+)['’"”](\.?)$/,
      (_, title: string, dot: string) => `已成功新增金鑰「${title}」${dot ? '。' : ''}`
    ],
    // 凭据汇总：各类凭据数量
    [/^(\d+) tokens?$/, '$1 個權杖'],
    [/^(\d+) OAuth apps?$/i, '$1 個 OAuth 應用程式'],
    [/^(\d+) GitHub Apps?$/, '$1 個 GitHub 應用程式'],
    [/^(\d+) SSH keys?$/, '$1 個 SSH 金鑰'],
    [/^(\d+) keys?$/, '$1 個金鑰']
  ],
  attributeRules: [
    // SSH 密钥、GPG 密钥列表里删除按钮的无障碍名称「Delete <密钥标题>」：密钥标题是用户内容，照录
    ['li[id^="ssh-key-"] button[aria-label], li[id^="gpg-key-"] button[aria-label]', 'aria-label', /^Delete (.+)$/, '刪除 $1']
  ]
} satisfies PageDictionary
