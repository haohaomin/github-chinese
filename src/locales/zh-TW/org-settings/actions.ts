import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'

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
    // 操作设置保存后的提示
    'Allowed actions policy updated.': '允許的動作政策已更新。',
    'Custom image retention settings updated successfully!': '自訂映像保留設定已更新！',
    'Standard hosted runners setting saved.': '標準託管執行器設定已儲存。',
    'Job debugger self-hosted runners settings changed.': '自架執行器的作業偵錯工具設定已變更。',
    'Retention setting saved.': '保留設定已儲存。',
    'Subject claim configuration saved successfully.': '主體宣告設定已儲存。',
    // 操作策略（settings/actions/rules）
    'Protect your most important actions workflows': '保護最重要的動作工作流程',
    'Policies define whether actions can run in specific contexts.': '政策定義動作能否在特定情境中執行。',
    'New actions policy': '新增動作政策',
    'This policy does not target any resources and will not be applied.': '此政策未針對任何資源，不會生效。',
    'Workflows that match the matching pattern will be targeted by this policy.': '符合比對模式的工作流程將成為此政策的目標。',
    'Workflow execution protections': '工作流程執行保護',
    'GitHub features such as Dependabot, code scanning, Codespaces prebuilds, and Pages are exempt from these protections.':
      'Dependabot、程式碼掃描、程式碼空間預建和 GitHub 頁面等 GitHub 功能不受這些保護限制。',
    'Restrict actors': '限制執行者',
    'Choose specific actors that are authorized to trigger Actions workflows.': '選擇有權觸發動作工作流程的特定執行者。',
    'Restrict events': '限制事件',
    'Choose specific GitHub events that will trigger Actions workflows.': '選擇會觸發動作工作流程的特定 GitHub 事件。',
    'Require lockfile': '需要鎖定檔',
    'Require workflows to use a lockfile.': '要求工作流程使用鎖定檔。',
    'Allowed events': '允許的事件',
    'Caution: This event runs with write permissions and access to secrets, even when triggered from a fork. Use with care.':
      '注意：即使由分叉觸發，此事件也會以寫入權限執行並可存取機密。請謹慎使用。',
    'Learn more about pull_request_target': '瞭解 pull_request_target',
    // 运行器组：公共存储库警告、工作流限制
    'Runners can be used by public repositories. Allowing self-hosted or image-generation runners on public repositories and allowing workflows on public forks introduces a significant security risk. Learn more about self-hosted runners.':
      '公開儲存庫可以使用執行器。允許公開儲存庫使用自架或映像產生執行器，以及允許在公開分叉上執行工作流程，會帶來重大安全性風險。瞭解自架執行器。',
    'Runners can be used by public repositories. Allowing self-hosted or image-generation runners on public repositories and allowing workflows on public forks introduces a significant security risk.':
      '公開儲存庫可以使用執行器。允許公開儲存庫使用自架或映像產生執行器，以及允許在公開分叉上執行工作流程，會帶來重大安全性風險。',
    'Learn more about self-hosted runners.': '瞭解自架執行器。',
    'Control how these runners are used by restricting them to specific workflows. Learn more about managing runner groups.':
      '將這些執行器限制為特定工作流程，以控制其使用方式。瞭解如何管理執行器群組。',
    'Control how these runners are used by restricting them to specific workflows.': '將這些執行器限制為特定工作流程，以控制其使用方式。',
    'Learn more about managing runner groups.': '瞭解如何管理執行器群組。',
    'Restrict these runners to specific workflow files.': '將這些執行器限制為特定工作流程檔案。',
    'Any workflow can use these runners.': '任何工作流程都可以使用這些執行器。',
    'Enter the workflow files allowed to use this runner group:': '輸入允許使用此執行器群組的工作流程檔案：',
    'References are mandatory: branches, tags, and SHAs are allowed.': '必須指定參考：可以使用分支、標記和 SHA。',
    'managing access to runner groups': '管理執行器群組的存取權',
    // OIDC 主题声明模板校验
    'The template has one or more unsupported claim keys.': '範本包含一個或多個不支援的宣告索引鍵。',
    'Template must not be empty': '範本不得為空',
    'Template is valid.': '範本有效。',
    // 常规：存储库自托管运行器、自定义映像保留（「Your enterprise has set a maximum limit of <strong>100</strong> …」见 inline）
    'Repository self-hosted runners': '儲存庫自架執行器',
    'Choose the default settings for custom image retention in this enterprise.': '選擇此企業中自訂映像檔保留的預設設定。',
    'Maximum versions per image': '每個映像檔的版本數上限',
    'Unused version retention': '未使用版本的保留期限',
    'Maximum version age': '版本最長存在時間',
    // 标准托管运行器（「<strong>Note:</strong> Once disabled …」各节点分别匹配）
    'Standard hosted runners': '標準託管執行器',
    'Choose if repositories are allowed to use standard hosted runner labels. If disabled, hosted runners can only be accessed via a runner group.':
      '選擇是否允許儲存庫使用標準託管執行器標籤。停用後，只能透過執行器群組存取託管執行器。',
    'Once disabled you will lose any concurrency settings you have set up.': '停用後將遺失已設定的所有並行設定。',
    'For more information on concurrency see our documentation.': '有關並行的詳細資訊，請參閱我們的說明文件。',
    // 自托管运行器的实时调试
    'Allow live debugging on self-hosted runners. Repositories must individually opt in.':
      '允許在自架執行器上進行即時偵錯。儲存庫須個別選擇啟用。',
    'Allow live debugging on self-hosted runners': '允許在自架執行器上進行即時偵錯',
    'Do not allow live debugging on self-hosted runners': '不允許在自架執行器上進行即時偵錯',
    // 保留期、复刻拉取请求工作流（专用和内部存储库）
    'Choose the default repository settings for checks, workflow runs, statuses, artifacts, and logs.':
      '選擇檢查、工作流程執行、狀態、成品和記錄的預設儲存庫設定。',
    'Duration must be 400 or less': '期限不得超過 400',
    'Fork pull request workflows in private and internal repositories': '私人和內部儲存庫中的分叉拉取請求工作流程',
    'These settings apply to private and internal repositories. Repository administrators will only be able to change the settings that are enabled here.':
      '這些設定適用於私人和內部儲存庫。儲存庫管理員只能變更此處已啟用的設定。',
    'Save fork pull request workflows settings': '儲存分叉拉取請求工作流程設定',
    // OIDC：主题声明模板、自定义属性声明
    'Subject claim template': '主體宣告範本',
    'Order-dependent list of comma-separated template variables.': '以逗號分隔、區分順序的範本變數清單。',
    'List of available template variables.': '可用範本變數清單。',
    'Custom property claims': '自訂屬性宣告',
    'Specify which custom properties should be included as claims in the OIDC token.': '指定要作為宣告包含在 OIDC 權杖中的自訂屬性。',
    'No custom properties defined': '未定義自訂屬性',
    'Define custom properties to include them as claims in OIDC tokens.': '定義自訂屬性，以將其作為宣告包含在 OIDC 權杖中。',
    'Learn more about repository custom properties.': '瞭解儲存庫自訂屬性。',
    'Manage custom properties': '管理自訂屬性',
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
    // 操作策略：包含 / 排除模式的路径前缀「path: 」
    path: '路徑',
    Saving: '儲存中',
    // 实时调试下拉的选项、自定义映像保留输入框后的单位
    'Not allowed': '不允許',
    versions: '個版本',
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
    // 操作策略列表计数、包含 / 排除模式与事件的删除按钮提示（事件名是标识符，照原文）
    [/^(\d+) actions? polic(?:y|ies)$/, '$1 個動作政策'],
    [/^Delete include of (.+)$/, '刪除包含項目 $1'],
    [/^Delete exclude of (.+)$/, '刪除排除項目 $1'],
    [/^Delete ([a-z]+(?:_[a-z]+)*)$/, '刪除 $1'],
    // 运行器组：工作流文件格式错误
    [/^Workflow "([^"]+)" is malformed\. Format should be:$/, '工作流程「$1」格式錯誤。格式應為：'],
    // 复刻拉取请求：需要批准的外部贡献者（组织名在句中）
    [
      /^All users that are not a member or owner of the repository and not a member of the ([\w.-]+) organization will require approval to run workflows\.$/,
      '所有不是儲存庫成員或擁有者、也不是 $1 組織成員的使用者都需要核准才能執行工作流程。'
    ],
    // 策略：pull_request_target 限制公告的前半句（同存储库设置，后半句由存储库设置的 static 匹配）
    [
      new RegExp(`^On (${DATE_SOURCE}), GitHub will restrict$`),
      (_, date: string) => `${joinCjk(translateDate(date) ?? date, '起')}，GitHub 將預設在公開儲存庫中限制`
    ],
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
  inline: [
    // 操作策略列表空状态：「<Policies> define whether actions can run in specific contexts.」
    ['{} define whether actions can run in specific contexts.', '{}定義動作能否在特定情境中執行。'],
    ['Your enterprise has set a maximum limit of {#} versions per image.', '企業設定的上限為每個映像檔 {#} 個版本。'],
    ['Your enterprise has set a maximum limit of {#} days for unused version retention.', '企業設定的未使用版本保留期限上限為 {#} 天。'],
    ['Your enterprise has set a maximum limit of {#} days for maximum version age.', '企業設定的版本最長存在時間上限為 {#} 天。'],
    ['Applies to {} repositories only', '僅適用於{}儲存庫']
  ],
  ignore: [
    // 操作策略的事件、参与者、包含 / 排除列表中的名称（事件名是标识符；带警告图标的 pull_request_target 行不忽略，提示文字照常翻译）
    '[class*="settingsEditable"] li.Box-row > span.wb-break-word:not(:has(> button))'
  ]
} satisfies PageDictionary
