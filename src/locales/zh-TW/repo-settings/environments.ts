import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 环境：环境列表、新建 / 删除、部署保护规则（必需审查者、等待计时器、自定义规则）、
 * 部署分支和标记、环境机密 / 变量。
 * 机密与变量的通用对话框文字（Add secret、Delete secret 等）见 secrets.ts。
 * 术语：required reviewers → 必要審查者，ref → 參考，context → 上下文，alphanumeric → 英數字元，
 * underscore → 底線（与 org-settings/secrets.ts 一致）；保护规则、机密、变量的计数量词作「個」，审查者作「位」。
 */
export default {
  static: {
    // 列表
    'New environment': '新增環境',
    'You can configure environments with protection rules, variables, and secrets.': '你可以為環境設定保護規則、變數和機密。',
    'You can configure environments with protection rules and secrets.': '你可以為環境設定保護規則和機密。',
    'Learn more about configuring environments.': '瞭解如何設定環境。',
    'There are no environments for this repository': '此儲存庫沒有環境',
    'Environments are used by your workflows for deployments.': '工作流程使用環境來部署。',
    'Delete environment': '刪除環境',
    'Are you sure you want to delete this environment?': '確定要刪除此環境嗎？',
    'Deleting an environment will delete all associated secrets, variables, and protection rules.':
      '刪除環境將一併刪除所有相關聯的機密、變數和保護規則。',
    'I understand, delete this environment': '我瞭解，刪除此環境',
    'Environment deleted.': '已刪除環境。',
    'There was an error saving your new environment.': '儲存新環境時發生錯誤。',

    // 新建 / 配置
    'Configure environment': '設定環境',
    'Configure reviewers, timers, and custom rules that must pass before deployments to this environment can proceed.':
      '設定部署到此環境前必須通過的審查者、計時器和自訂規則。',
    'Specify people or teams that may approve workflow runs when they access this environment.':
      '指定在工作流程執行存取此環境時可以核准的人員或團隊。',
    'Search for people or teams...': '搜尋人員或團隊...',
    'Search for people or teams…': '搜尋人員或團隊…',
    'Prevent self-review': '禁止自我審查',
    'Require a different approver than the user who triggered the workflow run.': '要求由觸發工作流程執行的使用者以外的人核准。',
    'Wait timer': '等待計時器',
    'Set an amount of time to wait before allowing deployments to proceed.': '設定允許部署繼續前要等待的時間。',
    'Enable custom rules with GitHub Apps': '使用 GitHub 應用程式啟用自訂規則',
    'Learn about existing apps': '瞭解現有的應用程式',
    'create your own protection rules': '建立你自己的保護規則',
    'so you can deploy with confidence.': '讓你能放心部署。',
    'Allow administrators to bypass configured protection rules': '允許管理員繞過已設定的保護規則',
    'Save protection rules': '儲存保護規則',

    // 部署分支和标记
    'Deployment branches and tags': '部署分支和標記',
    'Limit which branches and tags can deploy to this environment based on rules or naming patterns.':
      '依據規則或命名模式，限制哪些分支和標記可以部署到此環境。',
    'No restriction': '無限制',
    'No restriction to which branch or tag from this repository can deploy.': '不限制此儲存庫的哪些分支或標記可以部署。',
    'Protected branches only': '僅限受保護的分支',
    'Deployment limited to branches with protection rules.': '僅允許具有保護規則的分支部署。',
    'Selected branches and tags': '選取的分支和標記',
    'Specify a list of branches and tags using naming patterns.': '使用命名模式指定分支和標記清單。',
    '. Based on the existing': '。依據現有的',
    'repository branch protection rules': '儲存庫分支保護規則',
    'No branch or tag rules applied yet:': '尚未套用分支或標記規則：',
    'all branches and tags are still allowed to deploy.': '所有分支和標記仍可部署。',
    'Add deployment branch or tag rule': '新增部署分支或標記規則',
    'Ref type:': '參考類型：',
    'Name pattern:': '名稱模式：',
    'Update deployment branch rule': '更新部署分支規則',
    'Environment changes successfully saved: all branches can deploy.': '已儲存環境變更：所有分支都可以部署。',
    'Environment changes successfully saved: only protected branches can deploy.': '已儲存環境變更：僅受保護的分支可以部署。',
    'Environment changes successfully saved: only selected branches and tags can deploy.': '已儲存環境變更：僅選取的分支和標記可以部署。',

    // 环境机密 / 变量
    'Secrets are encrypted environment variables. They are accessible only by GitHub Actions in the context of this environment by using the':
      '機密是經過加密的環境變數。只有 GitHub 動作能在此環境的上下文中存取這些機密，方式是使用',
    'secret context': '機密上下文',
    'This environment has no secrets.': '此環境沒有機密。',
    'Add environment secret': '新增環境機密',
    'Secret value': '機密值',
    // 名称校验错误：原文冒号后三句，句号随原文（不并成逗号句；与 secrets.ts、org-settings/secrets.ts 同一写法）
    'Failed to add secret: Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '無法新增機密：機密名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。不允許使用空格。必須以字母 ([a-z], [A-Z]) 或底線 (_) 開頭。',
    'Variables are used for non-sensitive configuration data. They are accessible only by GitHub Actions in the context of this environment by using the':
      '變數用於非敏感的設定資料。只有 GitHub 動作能在此環境的上下文中存取這些變數，方式是使用',
    'variable context': '變數上下文',
    'This environment has no variables.': '此環境沒有變數。',
    'Add environment variable': '新增環境變數',
    'Variable value': '變數值',
    'Failed to add variable: Variable names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '無法新增變數：變數名稱只能包含英數字元 ([a-z], [A-Z], [0-9]) 或底線 (_)。不允許使用空格。必須以字母 ([a-z], [A-Z]) 或底線 (_) 開頭。'
  },
  scoped: {
    // 与 Actions 部署审查对话框共用（actions 词典可能以 static 收录）
    'Deployment protection rules': '部署保護規則',
    '/ Add': '/ 新增',
    '/ Configure': '/ 設定',
    "Name can't be blank": '名稱不能為空白',
    'Name can’t be blank': '名稱不能為空白',
    // 「Add up to」+ <strong>5</strong> +「more reviewers」：最多還可新增 5 位審查者
    'Add up to': '最多還可新增',
    'more reviewers': '位審查者',
    reviewers: '審查者',
    Branch: '分支',
    'Update rule': '更新規則',
    'Environment secrets': '環境機密',
    'Environment variables': '環境變數'
  },
  regexp: [
    // 环境列表：保护规则 / 机密 / 变量数
    [/^(\d+) protection rules?$/, '$1 個保護規則'],
    [/^(\d+) secrets?$/, '$1 個機密'],
    [/^(\d+) variables?$/, '$1 個變數'],
    // 必需审查者
    [/^Add up to (\d+) more reviewers?$/, '最多還可新增 $1 位審查者'],
    // 部署分支：受保护分支数
    [
      /^Applies to (\d+) branch(?:es)?\. Based on the existing repository branch protection rules\.$/,
      '適用於 $1 個分支。依據現有的儲存庫分支保護規則。'
    ],
    // 新建环境后的提示（环境名照录）
    [/^Environment ["“](.{1,255})["”] created\.$/, '已建立環境「$1」。']
  ]
} satisfies PageDictionary
