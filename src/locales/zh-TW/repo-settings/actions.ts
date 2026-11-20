import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'
import type { PageDictionary } from '../../../core/types'

const OWNER = '([\\w.-]+)'

/**
 * 存储库设置 · 操作：常规（操作权限、产物和日志保留、缓存、复刻拉取请求工作流、工作流权限、访问）、
 * 运行器（列表、详细信息、新建自托管运行器）、策略、OIDC、模型。
 * 与组织设置共用的文字沿用 org-settings 的译法；组织设置只放 scoped 的条目在此以 static 收录。
 * 运行器列表与操作运行器页（actions 页面类型）共用的说明放 scoped。
 * 术语（与 org-settings/actions.ts 一致）：Actions → 動作（原文只写 Actions 而指整个产品时作「GitHub 動作」），
 * reusable workflow → 可重複使用的工作流程，self-hosted → 自架，GitHub-hosted → GitHub 代管，artifact → 成品，
 * log → 記錄，retention → 保留 / 保留期限，evict → 清除（与 actions/manage.ts 一致），wildcard → 萬用字元，
 * prefix → 前置詞，policy → 政策，trigger → 觸發條件，claim → 宣告，subject → 主體，block → 封鎖，
 * pin（锁定到某个提交）→ 固定（GLOSSARY.zh-TW 繁体补充，与界面上的「釘選」分开）。
 */
export default {
  static: {
    // 操作权限（产品名译法见 nav.ts 文件头：复合词里的 Actions → 動作，句中指整个产品写 GitHub 動作）
    'Allow all actions and reusable workflows': '允許所有動作和可重複使用的工作流程',
    'Any action or reusable workflow can be used, regardless of who authored it or where it is defined.':
      '可以使用任何動作或可重複使用的工作流程，無論其作者是誰或定義於何處。',
    'Disable actions': '停用 GitHub 動作',
    'The Actions tab is hidden and no workflows can run.': '動作分頁將隱藏且無法執行任何工作流程。',
    'Learn more about allowing specific actions and reusable workflows to run.': '瞭解如何允許執行特定的動作和可重複使用的工作流程。',
    'Allow actions created by GitHub': '允許 GitHub 建立的動作',
    'Allow actions by Marketplace': '允許市集',
    'Allow specified actions and reusable workflows': '允許指定的動作和可重複使用的工作流程',
    'Allow or block specified actions and reusable workflows': '允許或封鎖指定的動作和可重複使用的工作流程',
    'Enter a comma-separated list of actions and reusable workflows': '輸入以逗號分隔的動作和可重複使用的工作流程清單',
    'Wildcards, tags, and SHAs are allowed.': '可以使用萬用字元、標記和 SHA。',
    'Wildcards, tags, and SHAs are allowed. Use': '可以使用萬用字元、標記和 SHA。使用',
    'prefix to block.': '前置詞表示封鎖。',
    'Action examples:': '動作範例：',
    'Reusable workflow examples:': '可重複使用的工作流程範例：',
    'Entire organization or repository examples:': '整個組織或儲存庫範例：',
    'Your list contains a': '你的清單包含',
    'wildcard pattern, which will': '萬用字元模式，這會',
    // 「…wildcard pattern, which will」+ <strong>allow all actions and reusable workflows</strong> +「except those that are explicitly blocked.」：
    // 除外条件并入加粗段，末段只留句号（原文无逗号）
    'allow all actions and reusable workflows': '允許除明確封鎖者以外的所有動作和可重複使用的工作流程',
    'except those that are explicitly blocked.': '。',
    'Your list contains': '你的清單',
    'only blocked patterns': '只包含封鎖模式',
    '. By default, only allowed patterns specified in the list can be used. To allow all actions and reusable workflows except those that are explicitly blocked, add a':
      '。根據預設，只能使用清單中指定的允許模式。若要允許除明確封鎖者以外的所有動作和可重複使用的工作流程，請新增',
    'wildcard pattern.': '萬用字元模式。',
    'Require actions to be pinned to a full-length commit SHA': '要求將動作固定到完整長度的提交 SHA',
    'Actions policy updated.': '已更新動作政策。',
    'This setting has been disabled by organization administrators.': '組織管理員已停用此設定。',
    'This setting has been disabled by enterprise administrators.': '企業管理員已停用此設定。',

    // 检查、工作流运行、状态、产物和日志保留，缓存
    'Artifact and log retention': '成品和記錄保留',
    'Choose the repository settings for artifacts and logs.': '選擇成品和記錄的儲存庫設定。',
    'Check, workflow run, status, artifact and log retention': '檢查、工作流程執行、狀態、成品和記錄保留',
    'Choose the repository settings for checks, workflow runs, statuses, artifacts, and logs.':
      '選擇檢查、工作流程執行、狀態、成品和記錄的儲存庫設定。',
    'Save artifact and log retention setting': '儲存成品和記錄保留設定',
    'There is a maximum limit of': '上限為',
    'Your organization has set a maximum limit of': '你的組織設定的上限為',
    'Learn more about the artifact and log retention policy.': '瞭解成品和記錄保留政策。',
    'Learn more about the check, workflow run, status, artifact and log retention policy.':
      '瞭解檢查、工作流程執行、狀態、成品和記錄保留政策。',
    'Duration must be 1 or more.': '期限不得少於 1。',
    'Duration must be 90 or less': '期限不得超過 90',
    'Choose the repository settings for cache.': '選擇快取的儲存庫設定。',
    'Cache retention': '快取保留',
    'Cache retention limit': '快取保留期限',
    'Save default cache retention.': '儲存預設快取保留期限。',
    'Retention can be set up to': '保留期限最多可設為',
    'Cache size eviction limit': '快取大小清除上限',
    'Save default cache size limit': '儲存預設快取大小上限',
    'Use this limit to control when cache evictions occur. Exceeding this limit will trigger evictions of the least recently used cache. Note this limit should not be used for controlling costs.':
      '使用此上限控制何時清除快取。超過此上限會清除最久未使用的快取。請注意此上限不應用於控制費用。',
    'Total cache size can be set up to': '快取總大小最多可設為',
    'Save fork pull request workflows setting': '儲存分叉拉取請求工作流程設定',

    // 复刻拉取请求工作流（actor → 執行者）
    'Approval for running fork pull request workflows from contributors': '執行貢獻者的分叉拉取請求工作流程前需要核准',
    'Choose which subset of users will require approval before running workflows on their pull requests. Both the pull request author and the actor of the pull request event triggering the workflow will be checked to determine if approval is required. If approval is required, a user with write access to the repository must':
      '選擇哪些使用者在其拉取請求上執行工作流程前需要核准。拉取請求的作者和觸發工作流程之拉取請求事件的執行者都會納入檢查，以判斷是否需要核准。若需要核准，必須由具有儲存庫寫入權限的使用者',
    'approve the pull request workflow to be run.': '核准拉取請求工作流程後才能執行。',
    'Fork pull request workflows from outside collaborators': '來自外部協作者的分叉拉取請求工作流程',
    'Choose which subset of outside collaborators will require approval to run workflows on their pull requests.':
      '選擇哪些外部協作者在其拉取請求上執行工作流程需要核准。',
    'Learn more about approving workflow runs from public forks.': '瞭解如何核准來自公開分叉的工作流程執行。',
    'Require approval for first-time contributors who are new to GitHub': '首次貢獻者為 GitHub 新使用者時需要核准',
    'Only first-time contributors who recently created a GitHub account will require approval to run workflows.':
      '只有最近建立 GitHub 帳號的首次貢獻者需要核准才能執行工作流程。',
    'Only users who are both new on GitHub and who have never had a commit or pull request merged into this repository will require approval to run workflows.':
      '只有同時是 GitHub 新使用者且從未有提交或拉取請求合併到此儲存庫的使用者需要核准才能執行工作流程。',
    'Require approval for first-time contributors': '首次貢獻者需要核准',
    'Only first-time contributors will require approval to run workflows.': '只有首次貢獻者需要核准才能執行工作流程。',
    'Only users who have never had a commit or pull request merged into this repository will require approval to run workflows.':
      '只有從未有提交或拉取請求合併到此儲存庫的使用者需要核准才能執行工作流程。',
    'Require approval for all outside collaborators': '所有外部協作者都需要核准',
    'All outside collaborators will always require approval to run workflows on their pull requests.':
      '所有外部協作者在其拉取請求上執行工作流程時一律需要核准。',
    'Require approval for all external contributors': '所有外部貢獻者都需要核准',
    'All users that are not a member or owner of this repository will require approval to run workflows.':
      '所有不是此儲存庫成員或擁有者的使用者都需要核准才能執行工作流程。',
    'Run workflows from fork pull requests': '執行來自分叉拉取請求的工作流程',
    'This tells Actions to run workflows from pull requests originating from repository forks. Note that doing so will give maintainers of those forks the ability to use tokens with read permissions on the source repository.':
      '這會讓 GitHub 動作執行來自儲存庫分叉之拉取請求的工作流程。請注意這樣做會讓這些分叉的維護者能夠使用具有來源儲存庫讀取權限的權杖。',
    'Send write tokens to workflows from fork pull requests.': '將寫入權杖傳送給來自分叉拉取請求的工作流程。',
    'This tells Actions to send tokens with': '這會讓 GitHub 動作將具有',
    'permissions to workflows from pull requests originating from repository forks. Note that doing so will give maintainers of those forks':
      '權限的權杖傳送給來自儲存庫分叉之拉取請求的工作流程。請注意這樣做會讓這些分叉的維護者獲得來源儲存庫的',
    'permissions against the source repository.': '權限。',
    'Send secrets to workflows from fork pull requests.': '將機密傳送給來自分叉拉取請求的工作流程。',
    'This tells Actions to send repository secrets to workflows from pull requests originating from repository forks.':
      '這會讓 GitHub 動作將儲存庫機密傳送給來自儲存庫分叉之拉取請求的工作流程。',
    // 私人存储库的复刻拉取请求工作流（带句号的写法由 org-settings 收录）
    'Fork pull request workflows': '分叉拉取請求工作流程',
    'Require approval for fork pull request workflows': '分叉拉取請求工作流程需要核准',

    // 工作流权限（scope → 範圍）
    'Choose the default permissions granted to the GITHUB_TOKEN when running workflows in this repository. You can specify more granular permissions in the workflow using YAML.':
      '選擇在此儲存庫中執行工作流程時授予 GITHUB_TOKEN 的預設權限。你可以在工作流程中使用 YAML 指定更精細的權限。',
    'Read and write permissions': '讀取和寫入權限',
    'Workflows have read and write permissions in the repository for all scopes.': '工作流程在儲存庫中對所有範圍都具有讀取和寫入權限。',
    'Read repository contents and packages permissions': '讀取儲存庫內容和套件權限',
    'Workflows have read permissions in the repository for the contents and packages scopes only.':
      '工作流程在儲存庫中僅對內容和套件範圍具有讀取權限。',
    'Choose whether GitHub Actions can create pull requests or submit approving pull request reviews.':
      '選擇 GitHub 動作能否建立拉取請求或送出核准的拉取請求審查。',
    'Allow GitHub Actions to create and approve pull requests': '允許 GitHub 動作建立並核准拉取請求',
    'Default workflow permissions settings saved.': '已儲存預設工作流程權限設定。',
    'Save workflow permissions settings': '儲存工作流程權限設定',

    // 访问（私人存储库中的操作与可复用工作流共享）
    'Not accessible': '無法存取',
    'Workflows in other repositories cannot access this repository.': '其他儲存庫中的工作流程無法存取此儲存庫。',
    'Controls how this repository can be used by GitHub Actions workflows in other repositories.':
      '控制其他儲存庫中的 GitHub 動作工作流程如何使用此儲存庫。',
    'Control how this repository is used by GitHub Actions workflows in other repositories.':
      '控制其他儲存庫中的 GitHub 動作工作流程如何使用此儲存庫。',
    'Learn more about allowing other repositories to access to Actions components in this repository.':
      '瞭解如何允許其他儲存庫存取此儲存庫中的動作元件。',
    'Save access setting': '儲存存取設定',

    // 运行器列表
    'Self-hosted runners were disabled by your organization admin.': '組織管理員已停用自架執行器。',
    'New self-hosted runner': '新增自架執行器',
    'Host your own runners and customize the environment used to run jobs in your GitHub Actions workflows.':
      '架設你自己的執行器，並自訂執行 GitHub 動作工作流程作業的環境。',
    'Learn more about self-hosted runners': '瞭解自架執行器',
    'There are no runners configured': '尚未設定執行器',
    // 「Learn more about using runners」链接 +「to run actions on your own servers.」
    'to run actions on your own servers.': '在你自己的伺服器上執行動作。',

    // 运行器详细信息
    'Labels are values used with the': '標籤是與',
    "key in your workflow's YAML to send jobs to specific runners. To copy a label, click on it.":
      '鍵一起在工作流程 YAML 中使用的值，用於將作業傳送到特定執行器。若要複製標籤，請按一下標籤。',
    'key in your workflow’s YAML to send jobs to specific runners. To copy a label, click on it.':
      '鍵一起在工作流程 YAML 中使用的值，用於將作業傳送到特定執行器。若要複製標籤，請按一下標籤。',
    'Learn more about labels.': '瞭解標籤。',
    'Active Job': '作用中的作業',
    'There are currently no running jobs': '目前沒有執行中的作業',
    // 「Add `」+ 标签 +「` to your workflow's YAML …」：与 org-settings/actions.ts 同译
    "` to your workflow's YAML to send jobs to this runner.": '` 加入工作流程 YAML 以傳送作業至此執行器。',
    '` to your workflow’s YAML to send jobs to this runner.': '` 加入工作流程 YAML 以傳送作業至此執行器。',

    // 新建自托管运行器（volume licensing → 大量授權）
    'Add new self-hosted runner': '新增自架執行器',
    'Adding a self-hosted runner requires that you download, configure, and execute the GitHub Actions Runner. By downloading and configuring the GitHub Actions Runner, you agree to the':
      '新增自架執行器需要下載、設定並執行 GitHub 動作執行器。下載並設定 GitHub 動作執行器即表示你同意',
    'Adding a self-hosted runner requires that you download, configure, and execute the GitHub Actions Runner. If you do not already have an existing volume licensing agreement for your GitHub purchases, by downloading and configuring the GitHub Actions Runner, you agree to the':
      '新增自架執行器需要下載、設定並執行 GitHub 動作執行器。如果你尚未就購買的 GitHub 產品簽訂大量授權合約，下載並設定 GitHub 動作執行器即表示你同意',
    'GitHub Terms of Service': 'GitHub 服務條款',
    'GitHub Corporate Terms of Service': 'GitHub 企業服務條款',
    ', as applicable.': '，以適用者為準。',
    'We recommend configuring the runner under "\\actions-runner". This will help avoid issues related to service identity folder permissions and long path restrictions on Windows.':
      '建議在「\\actions-runner」下設定執行器。這有助於避免 Windows 上與服務身分資料夾權限和長路徑限制相關的問題。',
    'Using your self-hosted runner': '使用你的自架執行器',
    'For additional details about configuring, running, or shutting down the runner, please check out our':
      '如需設定、執行或關閉執行器的其他詳細資料，請參閱我們的',
    'product docs': '產品說明文件',
    'Using self-hosted runners in public repositories is not recommended.': '不建議在公開儲存庫中使用自架執行器。',
    'Forks of your public repository can potentially run dangerous code on your self-hosted runner by creating a pull request.':
      '公開儲存庫的分叉可能會透過建立拉取請求在你的自架執行器上執行危險程式碼。',
    'Learn more about security hardening for self-hosted runners': '瞭解自架執行器的安全性強化',
    'Win-arm64 runners are currently in pre-release status and subject to change.': 'Win-arm64 執行器目前為發行前版本，可能會有所變更。',

    // 模型
    'Models in this repository': '此儲存庫中的模型',
    'If disabled, the Models tab will be hidden, and the prompt editor and comparison tooling evaluations will be unavailable.':
      '停用後，模型分頁將隱藏，且無法使用提示編輯器和比較工具評估。',

    // 策略（日期在前的公告由 regexp 处理；context → 情境）
    'Define whether actions can run in specific contexts.': '定義動作能否在特定情境中執行。',
    'Learn more about policies.': '瞭解政策。',
    'Learn more about pull_request_target restrictions': '瞭解 pull_request_target 限制',
    'on public repositories by default. To continue allowing the event trigger, configure an Actions policy.':
      '事件。若要繼續允許此事件觸發條件，請設定動作政策。',

    // OIDC
    'Customize claims included in the OIDC token.': '自訂 OIDC 權杖中包含的宣告。',
    'Learn more about OIDC tokens.': '瞭解 OIDC 權杖。',
    'Subject claim': '主體宣告',
    'Customize the subject (sub) claim in the OIDC token, used to identify the workflow run context.':
      '自訂 OIDC 權杖中的主體 (sub) 宣告，用於識別工作流程執行的情境。',
    'Use default template': '使用預設範本',
    'When selected, use upstream template for the subject claim. Unselect to set a custom template.':
      '選取時，主體宣告使用上游範本。取消選取可設定自訂範本。',
    'Use immutable subject claim': '使用不可變的主體宣告',
    'Improve security by including unique identifiers in the subject claim, ensuring that trust policies cannot be assumed by a different repository or organization with the same name.':
      '在主體宣告中包含唯一識別碼以提升安全性，確保同名的其他儲存庫或組織無法冒用信任政策。',
    'Learn more about immutable subject claims.': '瞭解不可變的主體宣告。',
    'Default subject claim prefix': '預設主體宣告前置詞',
    'Use this prefix when configuring trust policies in your cloud provider.': '在雲端提供者中設定信任政策時使用此前置詞。',
    'Copy subject claim prefix': '複製主體宣告前置詞',
    'Save subject claim': '儲存主體宣告'
  },
  scoped: {
    'Actions permissions': '動作權限',
    // 「Allow actions by Marketplace」+ <strong>verified creators</strong>
    'verified creators': '已驗證創作者的動作',
    Cache: '快取',
    days: '天',
    'days.': '天。',
    'GB.': 'GB。',
    'Workflow permissions': '工作流程權限',
    'Learn more about managing permissions.': '瞭解如何管理權限。',
    'GitHub-hosted runners': 'GitHub 代管的執行器',
    'Self-hosted runners': '自架執行器',
    'New runner': '新增執行器',
    'Search runners': '搜尋執行器',
    'Runner group': '執行器群組',
    'Runner image': '執行器映像檔',
    Architecture: '架構',
    Image: '映像檔',
    Size: '規格',
    'Copy label': '複製標籤',
    Configuration: '設定',
    'In progress': '進行中',
    'Cancel run': '取消執行',
    'View workflow file': '查看工作流程檔案',
    'Remove runner': '移除執行器',
    'Add `': '將 `',
    'Learn more about Models.': '瞭解模型。',
    // 运行器列表：与操作运行器页共用的说明（actions 词典可能以 static 收录，这里用 scoped 避免冲突）
    'Learn more about using runners': '瞭解如何使用執行器',
    'Runners are the machines that execute GitHub Actions workflows.': '執行器是執行 GitHub 動作工作流程的機器。',
    'Standard GitHub-hosted runners': '標準 GitHub 代管的執行器',
    'Ready-to-use runners managed by GitHub.': '由 GitHub 管理的立即可用執行器。',
    'Learn more about GitHub-hosted runners.': '瞭解 GitHub 代管的執行器。'
  },
  regexp: [
    // 操作权限：仅允许本组织 / 用户的动作
    [new RegExp(`^Allow ${OWNER} actions and reusable workflows$`), '允許 $1 的動作和可重複使用的工作流程'],
    [
      new RegExp(`^Allow ${OWNER}, and select non-${OWNER}, actions and reusable workflows$`),
      '允許 $1 以及選定的非 $2 動作和可重複使用的工作流程'
    ],
    [
      new RegExp(`^Any action or reusable workflow defined in a repository within ${OWNER} can be used\\.$`),
      '可以使用 $1 中任何儲存庫定義的動作或可重複使用的工作流程。'
    ],
    [
      new RegExp(
        `^Any action or reusable workflow that matches the specified criteria, plus those defined in a repository within ${OWNER}, can be used\\.$`
      ),
      '可以使用符合指定條件的動作或可重複使用的工作流程，以及 $1 中任何儲存庫定義的動作或可重複使用的工作流程。'
    ],
    // 保留期上限
    [/^There is a maximum limit of (\d+) days(\.?)$/, (_, days: string, dot: string) => `上限為 ${days} 天${dot ? '。' : ''}`],
    [
      /^Your organization has set a maximum limit of (\d+) days(\.?)$/,
      (_, days: string, dot: string) => `你的組織設定的上限為 ${days} 天${dot ? '。' : ''}`
    ],
    [/^Retention can be set up to (\d+) days(\.?)$/, (_, days: string, dot: string) => `保留期限最多可設為 ${days} 天${dot ? '。' : ''}`],
    [
      /^Total cache size can be set up to (\d+) ?GB(\.?)$/,
      (_, size: string, dot: string) => `快取總大小最多可設為 ${size} GB${dot ? '。' : ''}`
    ],
    // 保留期 / 缓存大小的输入校验
    [
      /^Retention period must be (?:less than or equal to (\d+) days|(\d+) days? or more)\.$/,
      (_, max: string | undefined, min: string | undefined) => (max ? `保留期限不得超過 ${max} 天。` : `保留期限不得少於 ${min ?? ''} 天。`)
    ],
    [
      /^Cache size must be (?:less than or equal to (\d+) ?GB|(\d+) ?GB or more)\.$/,
      (_, max: string | undefined, min: string | undefined) => (max ? `快取大小不得超過 ${max} GB。` : `快取大小不得少於 ${min ?? ''} GB。`)
    ],
    // 访问
    [/^Accessible from repositories owned by the user ['‘’"“”]?([\w.-]+)['‘’"“”]?$/, '可從使用者 $1 擁有的儲存庫存取'],
    [/^Accessible from repositories in the ['‘’"“”]?([\w.-]+)['‘’"“”]? organization$/, '可從 $1 組織中的儲存庫存取'],
    [/^Accessible from repositories in the ['‘’"“”]?([\w.-]+)['‘’"“”]? enterprise$/, '可從 $1 企業中的儲存庫存取'],
    // 策略：pull_request_target 限制公告（事件名在 <code> 中时由 static 匹配后半句）
    [
      new RegExp(`^On (${DATE_SOURCE}), GitHub will restrict$`),
      (_, date: string) => `${joinCjk(translateDate(date) ?? date, '起')}，GitHub 將預設在公開儲存庫中限制`
    ],
    [
      new RegExp(
        `^On (${DATE_SOURCE}), GitHub will restrict ([\\w-]+) on public repositories by default\\. To continue allowing the event trigger, configure an Actions policy\\.$`
      ),
      (_, date: string, event: string) =>
        `${joinCjk(translateDate(date) ?? date, '起')}，GitHub 將預設在公開儲存庫中限制 ${event} 事件。若要繼續允許此事件觸發條件，請設定動作政策。`
    ],
    // 运行器详细信息：把标签加入工作流 YAML
    [/^Add `([^`]{1,100})` to your workflow[’']s YAML to send jobs to this runner\.$/, '將 `$1` 加入工作流程 YAML 以傳送作業至此執行器。'],
    // 新建自托管运行器：页面标题文本（含 owner/repo）
    [/^Add new self-hosted runner · ([\w.-]+\/[\w.-]+)$/, '新增自架執行器 · $1'],
    // 产物和日志保留：上级设置的上限（「期限不得少於 1。」等校验在同一段落）
    [
      /^The (organization|enterprise) has set a maximum duration of (\d+) days?$/,
      (_, owner: string, days: string) => `${owner === 'organization' ? '組織' : '企業'}設定的最長期限為 ${days} 天`
    ],
    // OIDC：不可变主题声明自动启用（其后的链接「瞭解不可變的主體宣告。」由 static 翻译）
    [
      new RegExp(
        `^Automatically enabled for this repository\\. Repositories created or renamed after (${DATE_SOURCE}) use immutable subject claims\\.$`
      ),
      (_, date: string) =>
        `已為此儲存庫自動啟用。${joinCjk(translateDate(date) ?? date, '之後')}建立或重新命名的儲存庫使用不可變的主體宣告。`
    ]
  ],
  inline: [
    // 策略列表空状态：「<a>Policies</a> define whether actions can run in specific contexts.」（同组织设置）
    ['{} define whether actions can run in specific contexts.', '{}定義動作能否在特定情境中執行。']
  ]
} satisfies PageDictionary
