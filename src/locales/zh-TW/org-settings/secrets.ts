import type { PageDictionary } from '../../../core/types'

/**
 * 组织机密和变量：Actions 机密 / 变量、Codespaces 机密、Dependabot 机密、Private registry（产品名译法见 nav.ts 文件头）。
 * 与存储库设置共用的列表、表单、删除对话框文字放 scoped。
 * 术语：Actions → 動作（原文只写 Actions 的句子作「GitHub 動作」），private registry → 私人登錄庫，
 * credential → 認證資訊，alphanumeric → 英數字元，underscore → 底線，prefix → 前置詞。
 */
export default {
  static: {
    // 机密和变量：选项卡（无障碍名称）、智能体机密说明
    'Secrets or variables tab': '機密或變數分頁',
    'Anyone with collaborator access to the repositories with access to a secret or variable can use it for the Copilot cloud agent.':
      '對可存取機密或變數的儲存庫具有協作者存取權的任何人，都可以將其用於 Copilot 雲端代理。',
    // Actions 机密
    'Organization secrets': '組織機密',
    'This organization has no secrets.': '此組織沒有機密。',
    'New organization secret': '新增組織機密',
    'Organization secrets and variables cannot be used by private repositories with your plan.':
      '你的方案不支援私人儲存庫使用組織機密和變數。',
    'This secret may be used by public repositories in the organization. Paid GitHub plans include private repositories.':
      '組織中的公開儲存庫可以使用此機密。付費 GitHub 方案包含私人儲存庫。',
    'Organization secrets cannot be used by private repositories with your plan.': '你的方案不支援私人儲存庫使用組織機密。',
    'This secret may only be used by specifically selected repositories.': '只有指定的儲存庫才能使用此機密。',
    'Secret repository access': '機密的儲存庫存取權',
    'Select the organization repositories that may use this secret.': '選取可以使用此機密的組織儲存庫。',
    'This secret may be used by any repository in the organization.': '組織中的任何儲存庫都可以使用此機密。',
    'This secret may be used by any private repository in the organization.': '組織中的任何私人儲存庫都可以使用此機密。',

    // Actions 变量
    'New organization variable': '新增組織變數',
    'Create new organization variable': '建立新的組織變數',
    'Organization variables': '組織變數',
    'This organization has no variables.': '此組織沒有變數。',
    'This variable may be used by public repositories in the organization. Paid GitHub plans include private repositories.':
      '組織中的公開儲存庫可以使用此變數。付費 GitHub 方案包含私人儲存庫。',
    'Organization variables cannot be used by private repositories with your plan.': '你的方案不支援私人儲存庫使用組織變數。',
    'This variable may only be used by specifically selected repositories.': '只有指定的儲存庫才能使用此變數。',
    'Variable repository access': '變數的儲存庫存取權',
    'Select the organization repositories that may use this variable.': '選取可以使用此變數的組織儲存庫。',

    // Codespaces 机密
    'This organization has no development environment secrets.': '此組織沒有開發環境機密。',

    // 专用注册表
    'Private registry configurations include passwords or tokens that are handled as encrypted secrets. Access to private registry configurations is limited to':
      '私人登錄庫設定包含以加密機密處理的密碼或權杖。私人登錄庫設定僅限',
    'for analyzing code. The automatically-generated name for a private registry configuration is visible to users in log files for debugging. No other information is accessible to users.':
      '在分析程式碼時存取。私人登錄庫設定自動產生的名稱會顯示在記錄檔中，供使用者偵錯。使用者無法存取其他任何資訊。',
    'Private registry secrets': '私人登錄庫機密',
    'New private registry': '新增私人登錄庫',
    'Select registry type': '選擇登錄庫類型',
    'Add Registry': '新增登錄庫',
    'Edit private registry': '編輯私人登錄庫'
  },
  scoped: {
    // 页头说明（与存储库设置共用，片段间原文无逗号，译文不加）
    'Actions secrets and variables': '動作機密和變數',
    'Secrets and variables allow you to manage reusable configuration data. Secrets are':
      '機密和變數可讓你管理可重複使用的設定資料。機密經過',
    encrypted: '加密',
    'and are used for sensitive data.': '並用於敏感資料。',
    'Learn more about encrypted secrets': '瞭解加密機密',
    '. Variables are shown as plain text and are used for': '。變數以純文字顯示並用於',
    'non-sensitive': '非敏感',
    'data.': '資料。',
    'Learn more about variables': '瞭解變數',
    'Anyone with collaborator access to the repositories with access to a secret or variable can use it for Actions. They are not passed to workflows that are triggered by a pull request from a fork.':
      '對可存取機密或變數的儲存庫具有協作者存取權的任何人，都可以在 GitHub 動作中使用它們。這些機密和變數不會傳遞給由來自分叉的拉取請求觸發的工作流程。',
    // 「Please consider」+「upgrading your plan」+「if you require this functionality.」：条件前移，末段只留句号
    'Please consider': '如需此功能請考慮',
    'upgrading your plan': '升級方案',
    'if you require this functionality.': '。',
    Secrets: '機密',
    Variables: '變數',

    // 列表与提示
    Value: '值',
    'Last updated': '上次更新',
    Environment: '環境',
    'all repositories': '所有儲存庫',
    'private and internal repositories': '私人和內部儲存庫',
    'Host setup': '主機設定',
    'Development environment': '開發環境',
    'Private registry': '私人登錄庫',
    'Codespace user': '程式碼空間使用者',
    // 原文四句，句号随原文（不并成逗号句）
    'Failed to add secret. Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '無法新增機密。機密名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。不允許使用空格。必須以字母 ([a-z], [A-Z]) 或底線 (_) 開頭。',
    'Secret added.': '已新增機密。',
    'Secret updated.': '已更新機密。',
    'Secret deleted.': '已刪除機密。',
    'Variable added.': '已新增變數。',
    'Variable updated.': '已更新變數。',
    'Variable deleted.': '已刪除變數。',

    // 删除对话框
    'Delete secret': '刪除機密',
    'Delete variable': '刪除變數',
    'Are you sure you want to delete': '確定要刪除',
    'Unable to delete': '無法刪除',
    'Yes, delete this': '是，刪除此',
    secret: '機密',
    variable: '變數',

    // 新建 / 更新机密
    'Add secret': '新增機密',
    'New secret': '新增機密',
    'Remove secret': '移除機密',
    Variable: '變數',
    'Adding…': '新增中…',
    'Adding...': '新增中...',
    'Public repositories': '公開儲存庫',
    'Private repositories': '私人儲存庫',
    'Update selection': '更新選取範圍',
    'Update secret': '更新機密',
    // 原文 and 处无逗号，译文不加；与 repo-settings、settings-developer 同句一致
    'Secret values are encrypted and cannot be displayed, but you can': '機密值已加密且無法顯示，但你可以',
    'enter a new value.': '輸入新值。',
    'Name and value are required': '名稱和值為必填',
    'Re-authentication required': '需要重新驗證身分',
    'Secret encryption failed: missing public key': '機密加密失敗：缺少公開金鑰',

    // 新建 / 更新变量
    '/ New variable': '/ 新增變數',
    // 「…If you need to encrypt and mask sensitive information,」+「create a secret」+「instead.」：instead 前移到第一段
    'Note: Variable values are exposed as plain text. If you need to encrypt and mask sensitive information,':
      '注意：變數值會以純文字公開。如需加密並遮罩敏感資訊，請改為',
    'create a secret': '建立機密',
    'instead.': '。',
    'Variable names may only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_).':
      '變數名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。',
    'Variable names cannot start with a number.': '變數名稱不能以數字開頭。',
    'Variable names cannot start with': '變數名稱不能以',
    'prefix.': '前置詞開頭。',
    'Variable name can only contain alphanumeric characters. Special characters and spaces are not allowed.':
      '變數名稱只能包含英數字元。不允許使用特殊字元和空格。',
    'Variable name can only start with a letter or underscore.': '變數名稱只能以字母或底線開頭。',
    'Variable name cannot start with "GITHUB_" prefix.': '變數名稱不能以「GITHUB_」前置詞開頭。',
    'Add variable': '新增變數',
    '/ Update variable': '/ 更新變數',
    'Update variable': '更新變數',
    'Save variable': '儲存變數',

    // Codespaces 机密
    'Development environment secrets are environment variables that are': '開發環境機密是經過',
    '. They are available to any codespace user with': '的環境變數。對可存取該機密的儲存庫具有',
    collaborator: '協作者',
    'access to the repositories with access to that secret.': '存取權的任何程式碼空間使用者都可以使用它們。',
    'Development environment secrets': '開發環境機密',
    'New codespace secret': '新增程式碼空間機密',

    // Dependabot 机密
    'Secrets are credentials that are': '機密是經過',
    '. Anyone with': '的認證資訊。對可存取各機密的儲存庫具有',
    'access to the repositories with access to each secret can use it for Dependabot.': '存取權的任何人都可以在 Dependabot 中使用它們。',
    'Secrets are not passed to forks.': '機密不會傳遞給分叉。',

    // 专用注册表
    'CodeQL default setup': 'CodeQL 預設設定',
    'Registry type': '登錄庫類型',
    'Add registry': '新增登錄庫',
    'Maven Repository': 'Maven 儲存庫',
    // feed 取微软繁中（Azure Artifacts、Visual Studio）的「摘要」
    'NuGet Feed': 'NuGet 摘要',
    Token: '權杖',
    'Username and password': '使用者名稱和密碼',
    Username: '使用者名稱',
    // 专用注册表：OIDC 与匿名身份验证（云服务商字段名，服务商名称保留英文）
    Anonymous: '匿名',
    'Tenant ID': '租戶 ID',
    'AWS Region': 'AWS 區域',
    'Account ID': '帳號 ID',
    'Role Name': '角色名稱',
    Domain: '網域',
    'Domain Owner': '網域擁有者',
    Audience: '受眾',
    Namespace: '命名空間',
    // slug 取台湾常见的「代稱」（WordPress 繁中）
    'Service Account Slug': '服務帳號代稱',
    'API Host': 'API 主機',
    'Workload Identity Provider': '工作負載身分識別提供者',
    'Service Account': '服務帳號',
    'OIDC Provider Name': 'OIDC 提供者名稱',
    'Identity Mapping Name': '身分對應名稱'
  }
} satisfies PageDictionary
