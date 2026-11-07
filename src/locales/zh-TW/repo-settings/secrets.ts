import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'
import type { PageDictionary } from '../../../core/types'

/** 机密 / 变量列表行按钮：英文 → 中文 */
const ROW_ACTION: Readonly<Record<string, string>> = {
  Edit: '編輯',
  Delete: '刪除',
  Update: '更新',
  Remove: '移除'
}

/**
 * 存储库设置 · 机密和变量（Actions、Codespaces、Dependabot、代理）、部署密钥、自定义属性。
 * 译法沿用组织设置机密页（org-settings/secrets.ts）。
 * 术语：Actions → 動作（原文只写 actions 而指整个产品的句子作「GitHub 動作」），credential → 認證資訊，
 * alphanumeric → 英數字元，underscore → 底線，prefix → 前置詞，passphrase → 複雜密碼（同 gist.ts），
 * private registry → 私人登錄庫，readonly → 唯讀，This action cannot be undone → 此動作無法復原。
 */
export default {
  static: {
    // Actions 机密和变量
    'New repository secret': '新增儲存庫機密',
    'New repository variable': '新增儲存庫變數',
    'Anyone with collaborator access to this repository can use these secrets and variables for actions. They are not passed to workflows that are triggered by a pull request from a fork.':
      '對此儲存庫具有協作者存取權的任何人都可以在 GitHub 動作中使用這些機密和變數。這些機密和變數不會傳遞給由來自分叉的拉取請求觸發的工作流程。',
    'Secret names must not start with GITHUB_.': '機密名稱不能以 GITHUB_ 開頭。',
    'Manage environment secrets': '管理環境機密',
    'Manage environment variables': '管理環境變數',
    'Repository secrets': '儲存庫機密',
    'This repository has no secrets.': '此儲存庫沒有機密。',
    'Repository variables': '儲存庫變數',
    'This repository has no variables.': '此儲存庫沒有變數。',
    'Secrets can also be created at the organization level and authorized for use in this repository.':
      '機密也可以在組織層級建立並授權此儲存庫使用。',
    'Variables can also be created at the organization level and authorized for use in this repository.':
      '變數也可以在組織層級建立並授權此儲存庫使用。',
    'Manage organization secrets': '管理組織機密',
    'Manage organization variables': '管理組織變數',
    'Organization secrets can only be used by public repositories on your plan.': '你的方案只允許公開儲存庫使用組織機密。',
    'If you would like to use organization secrets in a private repository, you will need to upgrade your plan.':
      '如需在私人儲存庫中使用組織機密，必須升級方案。',
    'Yes, delete this secret': '是，刪除此機密',
    'Yes, delete this variable': '是，刪除此變數',
    'Repository secret added.': '已新增儲存庫機密。',
    'Repository variable added.': '已新增儲存庫變數。',
    // 原文三句，句号随原文（不并成逗号句；与 org-settings/secrets.ts 同译）
    'Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '機密名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。不允許使用空格。必須以字母 ([a-z], [A-Z]) 或底線 (_) 開頭。',

    // 代理（Copilot 云代理）机密和变量
    'Anyone with collaborator access to this repository can use these secrets and variables for the Copilot cloud agent.':
      '對此儲存庫具有協作者存取權的任何人都可以在 Copilot 雲端代理中使用這些機密和變數。',

    // Codespaces / Dependabot 机密
    'Repository development environment secrets': '儲存庫開發環境機密',
    'Organization development environment secrets': '組織開發環境機密',
    'This repository has no development environment secrets.': '此儲存庫沒有開發環境機密。',
    'access to this repository can use these secrets for Dependabot.': '存取權的任何人都可以在 Dependabot 中使用這些機密。',
    'Encrypted secrets allow you to store private access tokens so that Dependabot can update dependencies from private registries.':
      '加密機密可用來儲存私密存取權杖，讓 Dependabot 能更新來自私人登錄庫的相依項目。',
    'No organization secrets have been authorized for this repository.': '尚未授權此儲存庫使用任何組織機密。',
    'No organization variables have been authorized for this repository.': '尚未授權此儲存庫使用任何組織變數。',

    // 部署密钥
    // 「We recommend using」+「GitHub Apps」+「instead for fine grained control over repositories and」+「enhanced security」
    'instead for fine grained control over repositories and': '以精細控制儲存庫並獲得',
    // 「Deploy keys」+ 本段 +「GitHub Apps」+「instead.」：instead 前移到本段末尾（改用），末段只留句号
    'use an SSH key to grant readonly or write access to a single repository. They are not protected by a passphrase and can be a security risk if your server is compromised. If you have a complex project or want more fine-grain control over permissions, consider using':
      '使用 SSH 金鑰授予單一儲存庫的唯讀或寫入權限。部署金鑰不受複雜密碼保護，伺服器遭入侵時可能帶來安全性風險。如果專案較複雜或需要更精細的權限控制，請考慮改用',
    'Add deploy key': '新增部署金鑰',
    'There are no deploy keys for this repository': '此儲存庫沒有部署金鑰',
    'guide on deploy keys': '部署金鑰指南',
    'Last used within the last week': '最近一週內使用過',
    // 「This action」+「cannot」+ 本段
    'be undone. This will permanently delete the SSH key, and if you’d like to use it in the future, you will need to upload it again.':
      '復原。這將永久刪除此 SSH 金鑰，日後如需使用，必須重新上傳。',
    "be undone. This will permanently delete the SSH key, and if you'd like to use it in the future, you will need to upload it again.":
      '復原。這將永久刪除此 SSH 金鑰，日後如需使用，必須重新上傳。',
    'Allow write access': '允許寫入權限',
    // 「Can this key be used to」+「push」+ 本段
    'Can this key be used to': '此金鑰是否可用於',
    'to this repository? Deploy keys always have pull access.': '到此儲存庫？部署金鑰一律具有拉取權限。',
    'Add key': '新增金鑰',

    // 自定义属性（新版页面标题与说明在前）
    'Repository custom properties': '儲存庫自訂屬性',
    'Add metadata to your repositories, such as compliance frameworks, data sensitivity, or project details.':
      '為儲存庫加上中繼資料，例如合規性架構、資料敏感度或專案詳細資料。',
    'Custom properties allow you to decorate your repository with information such as compliance frameworks, data sensitivity, or project details.':
      '自訂屬性可讓你為儲存庫加上合規性架構、資料敏感度或專案詳細資料等資訊。',
    'No custom properties have been set for this repository': '此儲存庫尚未設定自訂屬性',
    'No custom properties set for this repository.': '此儲存庫未設定自訂屬性。',
    'No custom properties have been defined for this organization': '此組織尚未定義自訂屬性',
    'Learn more about custom properties': '瞭解自訂屬性',
    // 「Learn more about custom properties」链接 +「and how to set them at the organization level.」
    'and how to set them at the organization level.': '以及如何在組織層級設定。',
    'Repository properties updated.': '已更新儲存庫屬性。'
  },
  scoped: {
    'We recommend using': '建議改用',
    'enhanced security': '更強的安全性',
    // 「Check out our」+「guide on deploy keys」+「to learn more.」
    'Check out our': '查看我們的',
    'to learn more.': '以瞭解詳情。',
    // 部署密钥表单：「Begins with 'ssh-rsa', …」
    'Begins with': '開頭為',
    'Actions secrets and variables': '動作機密和變數',
    'Secrets or variables tab': '機密或變數分頁',
    'New secret': '新增機密',
    'Secrets and variables allow you to manage reusable configuration data. Secrets are':
      '機密和變數可讓你管理可重複使用的設定資料。機密經過',
    encrypted: '加密',
    'and are used for sensitive data.': '並用於敏感資料。',
    'Learn more about encrypted secrets': '瞭解加密機密',
    '. Variables are shown as plain text and are used for': '。變數以純文字顯示並用於',
    'non-sensitive': '非敏感',
    'data.': '資料。',
    'Learn more about variables': '瞭解變數',
    Secrets: '機密',
    Variables: '變數',
    Value: '值',
    'Last updated': '上次更新',
    Updated: '更新於',
    Environment: '環境',
    // 原文四句，句号随原文（与 org-settings/secrets.ts 同译）
    'Failed to add secret. Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '無法新增機密。機密名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。不允許使用空格。必須以字母 ([a-z], [A-Z]) 或底線 (_) 開頭。',
    'Secret added.': '已新增機密。',
    'Secret updated.': '已更新機密。',
    'Secret deleted.': '已刪除機密。',
    'Variable added.': '已新增變數。',
    'Variable updated.': '已更新變數。',
    'Variable deleted.': '已刪除變數。',
    'Delete secret': '刪除機密',
    'Delete variable': '刪除變數',
    'Are you sure you want to delete': '確定要刪除',
    'Yes, delete this': '是，刪除此',
    secret: '機密',
    variable: '變數',
    '/ New variable': '/ 新增變數',
    '/ Update variable': '/ 更新變數',
    'Add secret': '新增機密',
    'Add variable': '新增變數',
    'Update secret': '更新機密',
    'Update variable': '更新變數',
    'Adding…': '新增中…',
    'Adding...': '新增中...',
    // 原文只有 but 前一个逗号（与 settings-developer/codespaces.ts 同译）
    'Secret values are encrypted and cannot be displayed, but you can': '機密值已加密且無法顯示，但你可以',
    'enter a new value.': '輸入新值。',
    'Name and value are required': '名稱和值為必填',
    // 「…If you need to encrypt and mask sensitive information,」+「create a secret」+「instead.」：instead 前移到第一段（改為）
    'Note: Variable values are exposed as plain text. If you need to encrypt and mask sensitive information,':
      '注意：變數值會以純文字公開。如需加密並遮罩敏感資訊，請改為',
    'create a secret': '建立機密',
    // 变量说明与部署密钥说明共用：instead 已并入前一段，只留句号
    'instead.': '。',
    'Variable names may only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_).':
      '變數名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。',
    'Variable names cannot start with a number.': '變數名稱不能以數字開頭。',
    // 「Variable names cannot start with」+ GITHUB_ +「prefix.」
    'Variable names cannot start with': '變數名稱不能以',
    'prefix.': '前置詞開頭。',
    // 「Development environment secrets are environment variables that are」+「encrypted」+「. Secrets are not passed to forks.」
    'Development environment secrets are environment variables that are': '開發環境機密是經過',
    '. Secrets are not passed to forks.': '的環境變數。機密不會傳遞給分叉。',
    'Development environment secrets': '開發環境機密',
    // 「Secrets are credentials that are」+「encrypted」+「. Anyone with」+「collaborator」+「access to this repository …」
    'Secrets are credentials that are': '機密是經過',
    '. Anyone with': '的認證資訊。對此儲存庫具有',
    collaborator: '協作者',
    'Secrets are not passed to forks.': '機密不會傳遞給分叉。',
    Key: '金鑰',
    push: '推送',
    cannot: '無法',
    'This action': '此動作',
    'Never used': '從未使用'
  },
  regexp: [
    // 机密 / 变量列表：更新时间
    [new RegExp(`^Updated (${DATE_SOURCE})$`), (_, date: string) => joinCjk('更新於', translateDate(date) ?? date)],
    // 部署密钥：添加时间、最近使用
    [new RegExp(`^Added on (${DATE_SOURCE})$`), (_, date: string) => joinCjk('新增於', translateDate(date) ?? date)],
    [
      /^Last used within the last (\d+) (week|month)s?$/,
      (_, count: string, unit: string) => `最近 ${count} ${unit === 'week' ? '週' : '個月'}內使用過`
    ],
    // 部署密钥列表的权限标记：原文破折号不计入检查脚本的原文标点，用正则保留破折号
    [/^— Read(\/write)?$/, (_, write: string | undefined) => (write ? '— 讀寫' : '— 唯讀')],
    // 删除确认
    [/^Are you sure you want to delete ([A-Z_][A-Z0-9_]{0,99})\?$/, '確定要刪除 $1 嗎？'],
    // 机密 / 变量列表行按钮的读屏名称：Edit NPM_TOKEN、Delete NPM_TOKEN
    [/^(Edit|Delete|Update|Remove) ([A-Z_][A-Z0-9_]{1,99})$/, (_, verb: string, name: string) => `${ROW_ACTION[verb] ?? verb} ${name}`]
  ]
} satisfies PageDictionary
