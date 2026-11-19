import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * 组织 Actions 设置：常规（策略、存储库级自托管运行器、产物与日志保留、复刻拉取请求工作流、
 * 工作流权限）、运行器、运行器组、缓存。
 * 与存储库 Actions 设置同名的短词放 scoped；存储库设置已收录为 static 的句子（Actions 策略、产物和日志保留、
 * 复刻拉取请求工作流、工作流权限、运行器说明等）不再重复，译法以那里为准。
 * 产品名、方案名译成中文（见 nav.ts 文件头）：Actions / GitHub Actions → 動作 / GitHub 動作，Team / Enterprise → 團隊版 / 企業版。
 * 原文只写 Actions 的句子译作「GitHub 動作」，避免「執行動作」被读成一般动词。
 * 术语：self-hosted → 自架，GitHub-hosted → GitHub 代管，larger runners → 較大型執行器，runner group → 執行器群組，
 * reusable workflow → 可重複使用的工作流程，fork pull request → 分叉拉取請求，public IP → 公用 IP（微软繁中）。
 */
export default {
  static: {
    // 常规：策略
    'General actions permissions': '一般動作權限',
    'Choose which repositories are permitted to use GitHub Actions.': '選擇允許使用 GitHub 動作的儲存庫。',
    'Actions can be run by any repository in the organization': '組織中的任何儲存庫都可以執行 GitHub 動作',
    'Actions can only be run by specifically selected repositories': '只有指定的儲存庫才能執行 GitHub 動作',
    'Select the organization repositories that may use Actions.': '選取可以使用 GitHub 動作的組織儲存庫。',
    'GitHub Actions is disabled for all repositories in the organization': '已為組織中的所有儲存庫停用 GitHub 動作',
    'Disable for all repositories': '為所有儲存庫停用',

    // 常规：存储库级自托管运行器
    'Choose which repositories are allowed to create repository-level self-hosted runners.': '選擇允許建立儲存庫層級自架執行器的儲存庫。',
    'Repo-level self-hosted runners can be used by any repository in the organization':
      '組織中的任何儲存庫都可以使用儲存庫層級的自架執行器',
    'Repo-level self-hosted runners can be used by specifically selected repositories': '指定的儲存庫可以使用儲存庫層級的自架執行器',
    'Select the organization repositories that may use repository-level self-hosted runners.':
      '選取可以使用儲存庫層級自架執行器的組織儲存庫。',
    'Repo-level self-hosted runners are disabled for all repositories in the organization':
      '已為組織中的所有儲存庫停用儲存庫層級的自架執行器',
    'Repo-level self-hosted runners settings changed.': '已變更儲存庫層級自架執行器設定。',

    // 常规：保留、复刻拉取请求
    'Choose the default repository settings for artifacts and logs.': '選擇成品和記錄的預設儲存庫設定。',
    'Fork pull request workflows in private repositories': '私人儲存庫中的分叉拉取請求工作流程',
    'These settings apply to private repositories. Repository administrators will only be able to change the settings that are enabled here.':
      '這些設定適用於私人儲存庫。儲存庫管理員只能變更此處已啟用的設定。',
    'Send secrets and variables to workflows from fork pull requests.': '將機密和變數傳送給來自分叉拉取請求的工作流程。',
    'This tells Actions to send repository secrets and variables to workflows from pull requests originating from repository forks.':
      '這會讓 GitHub 動作將儲存庫機密和變數傳送給來自儲存庫分叉之拉取請求的工作流程。',
    'Require approval for fork pull request workflows.': '分叉拉取請求工作流程需要核准。',
    'Fork pull requests from users without write access will require approval to run workflows.':
      '沒有寫入權限的使用者所提出的分叉拉取請求需要核准才能執行工作流程。',
    'Fork pull request workflow settings saved.': '已儲存分叉拉取請求工作流程設定。',
    'Fork pull request outside collaborators settings saved.': '已儲存分叉拉取請求的外部協作者設定。',

    // 常规：工作流权限（required workflows 按术语表作「必要」）
    'Choose the default permissions granted to the GITHUB_TOKEN when running workflows in this organization. You can specify more granular permissions in the workflow using YAML.':
      '選擇在此組織中執行工作流程時授予 GITHUB_TOKEN 的預設權限。你可以在工作流程中使用 YAML 指定更精細的權限。',
    'Repository administrators will only be able to change the default permissions to a more restrictive setting.':
      '儲存庫管理員只能將預設權限變更為更嚴格的設定。',
    'Required workflows': '必要工作流程',
    'Set required workflows to run in your organization’s repositories. These workflows will run alongside the repository workflows and branch merging will be blocked until the required checks succeed.':
      '設定要在組織儲存庫中執行的必要工作流程。這些工作流程會與儲存庫工作流程一起執行，必要檢查成功前將阻擋分支合併。',
    "Set required workflows to run in your organization's repositories. These workflows will run alongside the repository workflows and branch merging will be blocked until the required checks succeed.":
      '設定要在組織儲存庫中執行的必要工作流程。這些工作流程會與儲存庫工作流程一起執行，必要檢查成功前將阻擋分支合併。',
    'Learn more about required workflows.': '瞭解必要工作流程。',
    'There are no required workflows in this organization.': '此組織中沒有必要工作流程。',

    // 运行器
    'Includes all runners across self-hosted and GitHub-hosted runners.': '包含所有自架執行器和 GitHub 代管的執行器。',
    'Host your own runners and customize the environment used to run jobs in your GitHub Actions workflows. Runners added to this organization can be used to process jobs in multiple repositories in your organization.':
      '架設你自己的執行器，並自訂執行 GitHub 動作工作流程作業的環境。新增到此組織的執行器可用來處理組織中多個儲存庫的作業。',
    'New GitHub-hosted runner': '新增 GitHub 代管的執行器',
    'Bring your own infrastructure': '使用你自己的基礎架構',
    // 「Pay-as-you-go, customizable, secure, scaled &」+「managed by GitHub」
    'Pay-as-you-go, customizable, secure, scaled &': '隨用隨付、可自訂、安全、可調整規模，並',
    'managed by GitHub': '由 GitHub 管理',
    'Only available on paid Team or Enterprise plans': '僅適用於付費的團隊版或企業版方案',
    'All jobs usage': '所有作業使用量',
    // 「To increase your concurrency limit, upgrade your」+「GitHub plan.」
    'To increase your concurrency limit, upgrade your': '若要提高並行上限，請升級你的',
    'GitHub plan.': 'GitHub 方案。',
    'Larger GitHub-hosted runners': '較大型 GitHub 代管的執行器',
    Unprovisioned: '未佈建',
    'Team & Enterprise': '團隊版和企業版',
    'Set up larger runners': '設定較大型執行器',
    'View larger runner docs': '查看較大型執行器說明文件',
    'See pricing': '查看定價',
    'Sizes up to:': '最大規格：',
    'Shared with this repository': '與此儲存庫共用',
    'Shared runner list': '共用執行器清單',
    // scale set：自动扩缩的一组执行器，作「擴充集」（「擴展」命中大陆用语警告）
    'Runner scale sets': '執行器擴充集',
    'Runner scale set list': '執行器擴充集清單',
    'Maximum concurrency': '最大並行數',
    'Enable this runner to generate custom images': '允許此執行器產生自訂映像檔',
    'Create runner': '建立執行器',
    'Assign unique & static public IP address ranges for this runner': '為此執行器指派唯一的靜態公用 IP 位址範圍',
    'Force remove this runner': '強制移除此執行器',
    'Find or create a label': '尋找或建立標籤',
    'Create new label': '建立新標籤',
    'Use dedicated runner groups for image generation.': '使用專用的執行器群組產生映像檔。',
    'Do not allow public repositories to access image-generation runners.': '不允許公開儲存庫存取產生映像檔的執行器。',
    'Apply least privilege to repositories.': '對儲存庫套用最低權限。',

    // 运行器组
    'Control access to your runners by specifying the repositories that are able to use your shared organization runners. New runners will be automatically assigned to the default group if no other group is specified. Upgrade to an Enterprise plan to create groups.':
      '指定可以使用組織共用執行器的儲存庫，以控制執行器的存取權。未指定其他群組時，新執行器會自動指派到預設群組。升級到企業版方案以建立群組。',
    'Control access to your runners by specifying the repositories that are able to use your shared organization runners. New runners will be automatically assigned to the default group if no other group is specified.':
      '指定可以使用組織共用執行器的儲存庫，以控制執行器的存取權。未指定其他群組時，新執行器會自動指派到預設群組。',
    'Search runner groups': '搜尋執行器群組',
    'Shared by the Enterprise': '由企業共用',
    'New runner group': '新增執行器群組',
    // 原文是一句，句中不加句号
    'This group cannot be deleted and new runners will be automatically assigned to this group if no other group is specified.':
      '此群組無法刪除，未指定其他群組時新執行器會自動指派到此群組。',
    // 逗号随原文，结尾不加括号
    'All repositories, excluding public repositories': '所有儲存庫，不含公開儲存庫',
    'Group name': '群組名稱',
    'Create group': '建立群組',
    'Save group': '儲存群組',
    'Remove group': '移除群組',
    'Remove this runner group': '移除此執行器群組',
    'Move runner to group': '將執行器移至群組',
    'Allow public repositories': '允許公開儲存庫',
    'Workflow access': '工作流程存取權',
    'All workflows': '所有工作流程',
    'Selected workflows': '選取的工作流程',
    'Select the network configuration for this runner group. Only available for GitHub-hosted runners.':
      '為此執行器群組選擇網路設定。僅適用於 GitHub 代管的執行器。',
    'Learn more about network configurations.': '瞭解網路設定。',
    'Note: Network configurations are not supported for macOS runners. Any macOS runners assigned to runner groups with network configurations will fail to come online.':
      '注意：macOS 執行器不支援網路設定。指派到具有網路設定之執行器群組的 macOS 執行器將無法上線。',
    'This group contains a macOS runner and cannot be assigned a network configuration.': '此群組包含 macOS 執行器，無法指派網路設定。',
    'No configuration': '無設定',
    'Disabled configuration': '已停用的設定',
    'No network configuration found': '找不到網路設定',
    'Select network configuration': '選擇網路設定',
    'This network configuration is disabled': '此網路設定已停用',
    'This group contains a runner using a public IP and cannot be assigned a network configuration.':
      '此群組包含使用公用 IP 的執行器，無法指派網路設定。',

    // 缓存
    'You can use caches for dependencies and other commonly reused files to speed up your workflows. The data on this page have at least 5 minutes of latency.':
      '你可以為相依項目和其他常用檔案使用快取，以加快工作流程速度。此頁面的資料至少有 5 分鐘延遲。',
    'Learn more about caches': '瞭解快取',
    'Filter caches': '篩選快取',
    'Largest size': '由大到小',
    'Smallest size': '由小到大',
    'No repository uses caches': '沒有儲存庫使用快取',
    'Nothing has been cached by workflows running in any repositories of this organization.':
      '此組織中的儲存庫所執行的工作流程尚未快取任何內容。',
    // 「Learn more about caching」+「dependencies and build outputs to improve workflow execution time.」（原文无逗号，译文不加）
    'Learn more about caching': '瞭解如何快取',
    'dependencies and build outputs to improve workflow execution time.': '相依項目和建置輸出以縮短工作流程執行時間。'
  },
  scoped: {
    // 「Applies to」+ <public> +「repositories only」：整句由 inline 收录（僅適用於公開儲存庫），这两条是片段后备；
    // 「Applies to」与合并进来的规则集词典共用，译法一致
    'Applies to': '適用於',
    'repositories only': '儲存庫',

    // 与存储库 Actions 设置共用（「Allow actions by Marketplace」+「verified creators」，译法与存储库设置一致）
    'Actions permissions': '動作權限',
    'verified creators': '已驗證創作者的動作',
    'Selected repositories': '選取的儲存庫',
    'selected repository': '個選取的儲存庫',
    'selected repositories': '個選取的儲存庫',
    'Filter repositories': '篩選儲存庫',
    'No repositories found.': '找不到儲存庫。',
    'No repositories selected': '未選取儲存庫',
    '1 selected repository': '1 個選取的儲存庫',
    days: '天',
    'You can set a maximum limit of': '你可以設定的上限為',
    'days.': '天。',
    write: '寫入',
    'Workflow permissions': '工作流程權限',
    'Learn more about managing permissions.': '瞭解如何管理權限。',
    'This controls whether GitHub Actions can create pull requests or submit approving pull request reviews.':
      '這會控制 GitHub 動作能否建立拉取請求或送出核准的拉取請求審查。',
    'Add workflow': '新增工作流程',

    // 运行器（运行器列表的通用文字由 actions 词典的 static 收录）
    'Search runners': '搜尋執行器',
    // 运行器状态与规则集强制执行状态同译「作用中」；Active jobs 作「作用中的作業」
    Active: '作用中',
    Labels: '標籤',
    'Active jobs': '作用中的作業',
    'Runner group': '執行器群組',
    'Runner image': '執行器映像檔',
    Architecture: '架構',
    Image: '映像檔',
    'Image version': '映像檔版本',
    // 较大型执行器的机器规格（核心数、内存、存储）
    Size: '規格',
    Latest: '最新',
    Custom: '自訂',
    'GitHub-owned': 'GitHub 擁有',
    Partner: '合作夥伴',
    'GPU-powered': 'GPU 加速',
    Capacity: '容量',
    Networking: '網路',
    Group: '群組',
    'Sort:': '排序：',
    Online: '線上',
    'Public IP': '公用 IP',
    'Larger runners': '較大型執行器',
    'Create new runner': '建立新執行器',
    'Remove runner': '移除執行器',

    // 常规：策略与复刻拉取请求（整句在同一文本节点时）
    'Allow actions by Marketplace verified creators': '允許市集已驗證創作者的動作',
    'Repo-level self-hosted runners': '儲存庫層級的自架執行器',
    'Access policy': '存取政策',
    'Send write tokens to workflows from fork pull requests': '將寫入權杖傳送給來自分叉拉取請求的工作流程',
    'Send secrets and variables to workflows from fork pull requests': '將機密和變數傳送給來自分叉拉取請求的工作流程',

    // 缓存
    'Last used': '上次使用',
    'Recently used': '最近使用',
    'Delete all caches': '刪除所有快取',

    // 运行器列表、新建自托管运行器（与存储库设置译法一致）
    'Learn more about using runners': '瞭解如何使用執行器',
    'Runners are the machines that execute GitHub Actions workflows.': '執行器是執行 GitHub 動作工作流程的機器。',
    'Standard GitHub-hosted runners': '標準 GitHub 代管的執行器',
    'Ready-to-use runners managed by GitHub.': '由 GitHub 管理的立即可用執行器。',
    'Learn more about GitHub-hosted runners.': '瞭解 GitHub 代管的執行器。',
    '/ GitHub-hosted runners': '/ GitHub 代管的執行器',
    '/ Create self-hosted runner': '/ 建立自架執行器',
    'macOS-arm64 runners are currently in pre-release status and subject to change.':
      'macOS-arm64 執行器目前為發行前版本，可能會有所變更。',
    // 「Add `」+ 标签 +「` to your workflow's YAML to send jobs to …」（原文无逗号，译文不加）
    'Add `': '將 `',
    "` to your workflow's YAML to send jobs to GitHub-hosted runners.": '` 加入工作流程 YAML 以傳送作業至 GitHub 代管的執行器。',
    '` to your workflow’s YAML to send jobs to GitHub-hosted runners.': '` 加入工作流程 YAML 以傳送作業至 GitHub 代管的執行器。',
    "` to your workflow's YAML to send jobs to this runner.": '` 加入工作流程 YAML 以傳送作業至此執行器。',
    '` to your workflow’s YAML to send jobs to this runner.': '` 加入工作流程 YAML 以傳送作業至此執行器。'
  },
  regexp: [
    [/^(\d+) selected repositor(?:y|ies)$/, '$1 個選取的儲存庫'],
    // 「Allow all actions and reusable workflows」由存储库设置的 static 收录，组织名排除 all
    [new RegExp(`^Allow (?!all )${ORG} actions and reusable workflows$`), '允許 $1 的動作和可重複使用的工作流程'],
    [
      new RegExp(`^Any action or reusable workflow defined in a repository within the ${ORG} organization can be used\\.$`),
      '可以使用 $1 組織內任何儲存庫中定義的動作或可重複使用的工作流程。'
    ],
    [
      new RegExp(`^Allow ${ORG}, and select non-${ORG}, actions and reusable workflows$`),
      '允許 $1 以及選定的非 $2 動作和可重複使用的工作流程'
    ],
    [
      new RegExp(
        `^Any action or reusable workflow that matches the specified criteria, plus those defined in a repository within the ${ORG} organization, can be used\\.$`
      ),
      '可以使用符合指定條件的動作或可重複使用的工作流程，以及 $1 組織內儲存庫中定義的動作或可重複使用的工作流程。'
    ],
    [/^(\d+) active jobs?$/, '$1 個作用中的作業'],
    [/^(\d+) caches?$/, '$1 個快取'],
    [/^(\d+) runners?$/, '$1 個執行器'],
    [/^(\d+) runner groups?$/, '$1 個執行器群組'],
    [/^Copy (ubuntu-latest|windows-latest|macos-latest)$/, '複製 $1'],
    [/^(\d+) repositor(?:y|ies) with caches?$/, '$1 個有快取的儲存庫'],
    // 运行器：把标签加入工作流 YAML（同一文本节点时）
    [
      /^Add `([^`]{1,100})` to your workflow[’']s YAML to send jobs to (this runner|GitHub-hosted runners)\.$/,
      (_, label: string, target: string) =>
        `將 \`${label}\` 加入工作流程 YAML 以傳送作業至${target === 'this runner' ? '此執行器' : ' GitHub 代管的執行器'}。`
    ]
  ],
  // 策略说明：Applies to <strong>public</strong> repositories only，only 在片段里译不出来，整句收录
  inline: [['Applies to {} repositories only', '僅適用於{}儲存庫']]
} satisfies PageDictionary
