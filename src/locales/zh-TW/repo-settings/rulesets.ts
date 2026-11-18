import type { PageDictionary } from '../../../core/types'

/** 规则集类型：英文 → 中文 */
const RULE_KIND: Readonly<Record<string, string>> = {
  branch: '分支',
  tag: '標記',
  push: '推送',
  repository: '儲存庫'
}

/** 强制执行状态：英文 → 中文（Active 与 org-settings 的执行器状态同译「作用中」） */
const ENFORCEMENT: Readonly<Record<string, string>> = {
  Active: '作用中',
  Evaluate: '評估',
  Disabled: '已停用'
}

/** 强制执行状态说明（只读页「Active - This ruleset will be enforced」）：英文 → 中文 */
const ENFORCEMENT_DESCRIPTION: Readonly<Record<string, string>> = {
  'This ruleset will be enforced': '將強制執行此規則集',
  'Evaluate this ruleset to trial rules and view insights': '評估此規則集以試用規則並查看洞察',
  'This ruleset will not be enforced': '不會強制執行此規則集'
}

/** 可绕过的执行者分类：英文 → 中文 */
const ACTOR_CATEGORY: Readonly<Record<string, string>> = {
  All: '全部',
  Roles: '角色',
  Teams: '團隊',
  Apps: '應用程式',
  Users: '使用者',
  Others: '其他',
  roles: '角色',
  teams: '團隊',
  apps: '應用程式',
  users: '使用者',
  agents: '代理',
  'other actors': '其他執行者'
}

/** 条件缺失提示的对象：英文 → 中文 */
const CONDITION_OBJECT: Readonly<Record<string, string>> = {
  Branch: '分支',
  Tag: '標記',
  Repository: '儲存庫',
  Organization: '組織',
  Workflow: '工作流程'
}

/** 计数对象：英文（单复数）→ 中文量词 + 名词 */
function countNoun(noun: string): string {
  if (noun.startsWith('branch condition')) return '個分支條件'
  if (noun.startsWith('branch')) return '個分支'
  if (noun.startsWith('tag')) return '個標記'
  if (noun.startsWith('repositor')) return '個儲存庫'
  if (noun.startsWith('organization')) return '個組織'
  return '個目標'
}

/** 计数：超过 100 时显示 100+ */
const COUNT = String.raw`(\d+\+?)`
const NOUN = '(branch(?:es)?|branch conditions?|tags?|repositor(?:y|ies)|organizations?|targets?)'
/** 目标短语：N 个对象 / 所有推送 / 分支过多无法显示 */
const TARGET = String.raw`(?:${COUNT} ${NOUN}|(all pushes)|(branches \(too many to display\)))`

/** 「針對」+ 目标短语的译文；数字前加空格 */
function targeting(count: string, noun: string, all: string, many: string, inRepo = ''): string {
  const where = inRepo ? '針對此儲存庫中的' : '針對'
  if (all) return `${where}所有推送`
  if (many) return `${where}分支（過多無法顯示）`
  return `${where} ${count} ${countNoun(noun)}`
}

/**
 * 存储库设置 · 规则集：规则集列表、新建 / 导入 / 导出 / 删除、编辑器（名称、强制执行状态、绕过清单、
 * 目标分支 / 标记 / 存储库 / 组织 / 工作流）、保存提示、历史记录、升级提示。
 * 规则与参数见 ruleset-rules.ts，规则洞察见 ruleset-insights.ts，导入 / 转换分支保护规则见 ruleset-import.ts。
 * 组织设置的规则集页面同样使用这些文字（static 全局生效；scoped 与 regexp 只在存储库设置页生效）；
 * 与经典分支保护同名的规则（Require signed commits 等）见 branches.ts；
 * 「Filter items」「Select items」「Default」「None」等选择面板通用词由 common-ui 收录。
 * 术语：enforce → 強制執行，bypass list → 繞過清單，actor → 執行者，app → 應用程式，insights → 洞察，
 * target（动词）→ 針對 / 以…為目標，matching pattern → 比對模式，restore / revert → 還原；规则计数量词作「個」。
 */
export default {
  static: {
    // 列表与新建
    'New ruleset': '新增規則集',
    'New branch ruleset': '新增分支規則集',
    'New tag ruleset': '新增標記規則集',
    'New push ruleset': '新增推送規則集',
    'Import a ruleset': '匯入規則集',
    'Organization rulesets': '組織規則集',
    'Enterprise rulesets': '企業規則集',
    'Upstream rulesets': '上游規則集',
    'Choose a JSON file to upload': '選擇要上傳的 JSON 檔案',
    "You haven't created any rulesets": '你尚未建立任何規則集',
    'You haven’t created any rulesets': '你尚未建立任何規則集',
    'No rulesets have been added yet': '尚未新增規則集',
    'No rulesets matched your search': '沒有與搜尋相符的規則集',
    'Try expanding your search or creating a new ruleset': '嘗試擴大搜尋範圍或建立新規則集',
    'Define whether collaborators can delete or force push and set requirements for any pushes, such as passing status checks or a linear commit history.':
      '決定協作者能否刪除或強制推送，並為所有推送設定要求，例如通過狀態檢查或保持線性提交歷史記錄。',
    'define whether collaborators can delete or force push and set requirements for any pushes, such as passing status checks or a linear commit history.':
      '決定協作者能否刪除或強制推送，並為所有推送設定要求，例如通過狀態檢查或保持線性提交歷史記錄。',
    'Ruleset menu': '規則集選單',
    'Export ruleset': '匯出規則集',
    'Delete ruleset': '刪除規則集',
    'Delete ruleset?': '要刪除規則集嗎？',
    'Are you sure you want to delete this ruleset? This action cannot be undone.': '確定要刪除此規則集嗎？此動作無法復原。',
    'Open additional options': '開啟更多選項',
    'Error deleting ruleset': '刪除規則集時發生錯誤',
    'Error exporting ruleset': '匯出規則集時發生錯誤',
    'Cannot delete a ruleset while restoring. Save or cancel and try again.': '還原期間無法刪除規則集。請儲存或取消後再試一次。',
    'Cannot export a ruleset while restoring. Save or cancel and try again.': '還原期間無法匯出規則集。請儲存或取消後再試一次。',
    'Push rulesets apply to these repositories and their forks.': '推送規則集適用於這些儲存庫及其分叉。',
    'Push rulesets only apply to non-fork private or internal repositories and forks of those repositories.':
      '推送規則集僅適用於非分叉的私人或內部儲存庫，以及這些儲存庫的分叉。',
    // 列表分隔片段（旧版列表中「• targeting」单独成节点）
    '• targeting': '• 針對',
    ', targeting': '，針對',

    // 导入 JSON
    'Cannot import an empty ruleset': '無法匯入空白規則集',
    'Error importing ruleset': '匯入規則集時發生錯誤',
    'No file specified': '未指定檔案',
    'Invalid file type': '檔案類型無效',
    'Invalid ruleset specified': '指定的規則集無效',

    // 升级提示（move to 作「改用」，与 code/edit.ts 一致）
    "Your rulesets won't be enforced on this private repository until you upgrade this organization account to GitHub Team.":
      '在你將此組織帳號升級到 GitHub 團隊版之前，規則集不會在此私人儲存庫上強制執行。',
    'Your rulesets won’t be enforced on this private repository until you upgrade this organization account to GitHub Team.':
      '在你將此組織帳號升級到 GitHub 團隊版之前，規則集不會在此私人儲存庫上強制執行。',
    "Your rulesets won't be enforced on this private repository until you move to GitHub Team organization account.":
      '在你改用 GitHub 團隊版組織帳號之前，規則集不會在此私人儲存庫上強制執行。',
    "Your rulesets won't be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.":
      '在你改用 GitHub 團隊版或企業版組織帳號之前，規則集不會在此私人儲存庫上強制執行。',
    'Your rulesets won’t be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.':
      '在你改用 GitHub 團隊版或企業版組織帳號之前，規則集不會在此私人儲存庫上強制執行。',
    "Your rulesets won't be enforced on this private repository until your organization account admins upgrade this organization account to GitHub Team.":
      '在組織帳號管理員將此組織帳號升級到 GitHub 團隊版之前，規則集不會在此私人儲存庫上強制執行。',
    "Organization rulesets won't be enforced until you upgrade this organization account to GitHub Team.":
      '在你將此組織帳號升級到 GitHub 團隊版之前，組織規則集不會強制執行。',
    // 升级链接与前文分属不同节点
    "Your rulesets won't be enforced on this private repository until you": '規則集不會在此私人儲存庫上強制執行，除非你',
    'upgrade this organization account to GitHub Team.': '將此組織帳號升級到 GitHub 團隊版。',
    'move to GitHub Team organization account.': '改用 GitHub 團隊版組織帳號。',
    'until you upgrade this organization account to GitHub Enterprise.': '，除非你將此組織帳號升級到 GitHub 企業版。',

    // 可删除 / 可转换的分支保护规则
    'You have branch protection rules that can be removed': '你有可以移除的分支保護規則',
    "This repository has branch protection rules that are fully covered by rulesets and can be removed without affecting your repository's protection.":
      '此儲存庫有部分分支保護規則已完全由規則集涵蓋，移除後不會影響儲存庫的保護。',
    'Manage protected branches': '管理受保護的分支',

    // 编辑器：名称与强制执行状态
    'Ruleset Name': '規則集名稱',
    'Ruleset name': '規則集名稱',
    'Ruleset name cannot be empty': '規則集名稱不可空白',
    'Name cannot be empty': '名稱不可空白',
    'Name must be unique': '名稱不可重複',
    'Enforcement status': '強制執行狀態',
    'This ruleset will be enforced': '將強制執行此規則集',
    'Rules will be enforced': '將強制執行規則',
    'Enable Organization Ruleset': '啟用組織規則集',
    'Enforce this ruleset on targeted repositories.': '對目標儲存庫強制執行此規則集。',
    'I want rules enforced on targeted repositories in this ruleset.': '我要在此規則集的目標儲存庫上強制執行規則。',
    'Evaluate this ruleset to trial rules and view insights': '評估此規則集以試用規則並查看洞察',
    'Evaluate Rulesets to trial rules and view insights': '評估規則集以試用規則並查看洞察',
    'Evaluate mode is only available to Enterprise organizations.': '評估模式僅供企業版組織使用。',
    'Upgrade to Enterprise to use this mode.': '升級到企業版以使用此模式。',
    'Do not evaluate or enforce rules': '不評估也不強制執行規則',
    'This ruleset will not be enforced': '不會強制執行此規則集',

    // 绕过清单
    'Bypass list': '繞過清單',
    'Allow list': '允許清單',
    'Allowed actors': '允許的執行者',
    'Exempt roles, teams, and apps from this ruleset by adding them to the bypass list.':
      '將角色、團隊和應用程式加入繞過清單，使其不受此規則集約束。',
    'Exempt roles, teams, or apps from this ruleset by adding them to the bypass list.':
      '將角色、團隊或應用程式加入繞過清單，使其不受此規則集約束。',
    'Exempt roles, teams, agents, apps, and users from this ruleset by adding them to the bypass list.':
      '將角色、團隊、代理、應用程式和使用者加入繞過清單，使其不受此規則集約束。',
    'Exempt roles, teams, agents, and apps from this ruleset by adding them to the bypass list.':
      '將角色、團隊、代理和應用程式加入繞過清單，使其不受此規則集約束。',
    'Exempt roles, teams, agents, and apps from this ruleset by adding them to the allow list.':
      '將角色、團隊、代理和應用程式加入允許清單，使其不受此規則集約束。',
    // 原文无标点，译文不加
    'Exempt roles or teams from this ruleset by adding them to the bypass list': '加入繞過清單的角色或團隊不受此規則集約束',
    'Select the roles and teams that can bypass and also approve bypass requests. Add the bots and agents that can bypass this ruleset.':
      '選擇可以繞過並核准繞過請求的角色和團隊。新增可以繞過此規則集的機器人和代理。',
    'Select the roles that can bypass and also approve bypass requests.': '選擇可以繞過並核准繞過請求的角色。',
    'Add bypass': '新增繞過',
    'Add actors': '新增執行者',
    'Choose which roles, teams, and apps can bypass this ruleset': '選擇可以繞過此規則集的角色、團隊和應用程式',
    'Choose which roles, teams, agents, apps, and users can bypass this ruleset':
      '選擇可以繞過此規則集的角色、團隊、代理、應用程式和使用者',
    'Choose which roles, teams, agents, and apps can bypass this ruleset': '選擇可以繞過此規則集的角色、團隊、代理和應用程式',
    'Filter actors': '篩選執行者',
    'Filter bypass actors': '篩選可繞過的執行者',
    'Filter actors by category': '依類別篩選執行者',
    'No suggestions': '沒有建議',
    'Adjust your search term to find other actors': '調整搜尋字詞以尋找其他執行者',
    'No actors have been added.': '尚未新增執行者。',
    'Organization admin': '組織管理員',
    'Repository admin': '儲存庫管理員',
    'Enterprise team': '企業團隊',
    'Add selected': '新增選取項目',
    'Add Selected': '新增選取項目',
    'Always allow': '一律允許',
    'Allow for pull requests only': '僅允許用於拉取請求',
    'For pull requests only': '僅限拉取請求',
    'Select bypass mode': '選擇繞過模式',
    'Bypass actor actions': '可繞過執行者的動作',
    // 与 org-settings 推送保护的绕过执行者说明同一句式；原文无逗号，译文不加
    'The ruleset will be evaluated and the selected actor(s) will be prompted to bypass': '將評估規則集並向選取的執行者顯示繞過提示',
    'The ruleset will not be evaluated and no bypass prompt will be shown': '不會評估規則集也不會顯示繞過提示',
    'The ruleset will be enforced on command line changes and the selected actor(s) will be prompted to bypass only in a pull request':
      '將對命令列變更強制執行規則集並僅在拉取請求中向選取的執行者顯示繞過提示',
    'Delete bypass': '刪除繞過',
    'Bypass list is empty': '繞過清單是空的',
    'Allow list is empty': '允許清單是空的',

    // 目标：存储库 / 组织（组织、企业规则集）
    'Which branches should be matched?': '要比對哪些分支？',
    'Which tags should be matched?': '要比對哪些標記？',
    'Which repositories should be matched?': '要比對哪些儲存庫？',
    'Which organizations should be matched?': '要比對哪些組織？',
    'Which workflows should be matched?': '要比對哪些工作流程？',
    'Which branches do you want to make a ruleset for?': '要為哪些分支建立規則集？',
    'Which tags do you want to make a ruleset for?': '要為哪些標記建立規則集？',
    'Which repositories and branches do you want to make a ruleset for?': '要為哪些儲存庫和分支建立規則集？',
    'Target repositories': '目標儲存庫',
    'Target organizations': '目標組織',
    'Target workflows': '目標工作流程',
    'Repository targeting determines which repositories will be protected by this ruleset. Use inclusion patterns to expand the list of repositories under this ruleset. Use exclusion patterns to exclude repositories.':
      '儲存庫目標設定決定此規則集保護哪些儲存庫。使用包含模式擴充此規則集涵蓋的儲存庫清單。使用排除模式排除儲存庫。',
    'Repository targeting determines which repositories will be protected by this ruleset.': '儲存庫目標設定決定此規則集保護哪些儲存庫。',
    'Organization targeting determines which repositories will be protected by this ruleset.': '組織目標設定決定此規則集保護哪些儲存庫。',
    'Target all repositories within the organization': '針對組織內的所有儲存庫',
    'Target all organizations within the enterprise': '針對企業內的所有組織',
    'Dynamic list by name': '依名稱的動態清單',
    'Target repositories based on name': '依名稱選擇目標儲存庫',
    'Target organizations based on name': '依名稱選擇目標組織',
    'Dynamic list by property': '依屬性的動態清單',
    'Target repositories based on properties': '依屬性選擇目標儲存庫',
    'Target organizations based on properties': '依屬性選擇目標組織',
    'Target a specific list of selected repositories': '針對選取的特定儲存庫清單',
    'Target a specific list of selected organizations': '針對選取的特定組織清單',
    'All organizations': '所有組織',
    // 目标选项：从清单中逐个选取组织
    'Select organizations': '選取組織',
    'Targeting criteria': '目標條件',
    'Repository targeting criteria': '儲存庫目標條件',
    'Repositories matching a name': '名稱相符的儲存庫',
    'No repository targets have been added yet': '尚未新增儲存庫目標',
    'No organization targets have been added yet': '尚未新增組織目標',
    'Target all enterprise managed user accounts': '針對所有企業受控使用者帳號',
    'If enabled, this ruleset will also apply to all repositories owned by enterprise managed users.':
      '啟用後，此規則集也會套用到企業受控使用者擁有的所有儲存庫。',
    'Prevent renaming of target repositories': '禁止重新命名目標儲存庫',
    'When checked, target repositories can only be renamed by those with bypass permission.':
      '勾選後，只有具有繞過權限的人才能重新命名目標儲存庫。',
    'Repositories that match the matching pattern will be targeted by this ruleset.': '符合比對模式的儲存庫將成為此規則集的目標。',
    'Repositories that do not match the matching pattern will be targeted by this ruleset.': '不符合比對模式的儲存庫將成為此規則集的目標。',
    'Organizations that match the matching pattern will be targeted by this ruleset.': '符合比對模式的組織將成為此規則集的目標。',
    'Organizations that do not match the matching pattern will be targeted by this ruleset.': '不符合比對模式的組織將成為此規則集的目標。',
    'Target by repository properties': '依儲存庫屬性選擇目標',
    'Target by organization properties': '依組織屬性選擇目標',
    'Include by property': '依屬性包含',
    'Exclude by property': '依屬性排除',
    'Include repositories by property': '依屬性包含儲存庫',
    'Exclude repositories by property': '依屬性排除儲存庫',
    'Include organizations by property': '依屬性包含組織',
    'Exclude organizations by property': '依屬性排除組織',
    'Include repositories by custom property': '依自訂屬性包含儲存庫',
    'Custom properties allow you to create your own metadata for repositories': '自訂屬性可讓你為儲存庫建立自己的中繼資料',
    'Select property': '選擇屬性',
    'Search for properties': '搜尋屬性',
    'Please select a property': '請選擇屬性',
    'Please select at least one value': '請至少選擇一個值',
    'Select a value': '選擇值',
    'Search for values': '搜尋值',
    'The count is based on repositories visible to an organization administrator.': '計數以組織管理員可見的儲存庫為準。',

    // 目标：分支 / 标记
    'Target branches': '目標分支',
    'Target tags': '目標標記',
    'Add a target': '新增目標',
    'Add target': '新增目標',
    'Branch targeting determines which branches will be protected by this ruleset. Use inclusion patterns to expand the list of branches under this ruleset. Use exclusion patterns to exclude branches.':
      '分支目標設定決定此規則集保護哪些分支。使用包含模式擴充此規則集涵蓋的分支清單。使用排除模式排除分支。',
    'Tag targeting determines which tags will be protected by this ruleset. Use inclusion patterns to expand the list of tags under this ruleset. Use exclusion patterns to exclude tags.':
      '標記目標設定決定此規則集保護哪些標記。使用包含模式擴充此規則集涵蓋的標記清單。使用排除模式排除標記。',
    'Branch targeting criteria': '分支目標條件',
    'Tag targeting criteria': '標記目標條件',
    'Include default branch': '包含預設分支',
    'Include all tags': '包含所有標記',
    'Target by inclusion or exclusion pattern': '依包含或排除模式選擇目標',
    'Include by pattern': '依模式包含',
    'Exclude by pattern': '依模式排除',
    'Branch targeting has not been configured': '尚未設定分支目標',
    'Tag targeting has not been configured': '尚未設定標記目標',
    'Targets have changed and branch match list will update on save.': '目標已變更，分支比對清單將於儲存時更新。',
    'Targets have changed and tag match list will update on save.': '目標已變更，標記比對清單將於儲存時更新。',
    'Targets have changed and repository match list will update on save.': '目標已變更，儲存庫比對清單將於儲存時更新。',
    'Targets have changed and organization match list will update on save.': '目標已變更，組織比對清單將於儲存時更新。',
    // 「Targets have changed and」+ 对象（分支、標記…）+「match list will update on save.」；原文无标点，译文不加
    'Targets have changed and': '目標已變更且',
    'match list will update on save.': '比對清單將於儲存時更新。',
    'Branches that match the matching pattern will be targeted by this ruleset.': '符合比對模式的分支將成為此規則集的目標。',
    'Tags that match the matching pattern will be targeted by this ruleset.': '符合比對模式的標記將成為此規則集的目標。',
    'Branches that do not match the matching pattern will be targeted by this ruleset.': '不符合比對模式的分支將成為此規則集的目標。',
    'Tags that do not match the matching pattern will be targeted by this ruleset.': '不符合比對模式的標記將成為此規則集的目標。',
    'Pattern cannot be empty': '模式不可空白',
    'Invalid pattern': '無效的模式',
    'Branch naming pattern': '分支命名模式',
    'Tag naming pattern': '標記命名模式',
    'Repository naming pattern': '儲存庫命名模式',
    'Organization naming pattern': '組織命名模式',
    'Example patterns:': '模式範例：',
    'Learn more about fnmatch': '瞭解 fnmatch',
    'Add Inclusion pattern': '新增包含模式',
    'Add Exclusion pattern': '新增排除模式',

    // 目标：工作流程（组织、企业的动作规则集）
    'Workflow path pattern': '工作流程路徑模式',
    'Workflows that match the matching pattern will be targeted by this ruleset.': '符合比對模式的工作流程將成為此規則集的目標。',
    'Workflows that do not match the matching pattern will be targeted by this ruleset.': '不符合比對模式的工作流程將成為此規則集的目標。',
    'Workflow targeting criteria': '工作流程目標條件',
    'No workflow targets have been added yet': '尚未新增工作流程目標',
    'Add an include or exclude pattern to target workflow files with this ruleset.': '新增包含或排除模式，讓此規則集以工作流程檔案為目標。',
    'All workflows are targeted': '已針對所有工作流程',
    'Target a centrally managed required workflow': '針對集中管理的必要工作流程',
    'Choose a centrally managed required workflow without entering its internal execution path.':
      '選擇集中管理的必要工作流程，不需輸入其內部執行路徑。',
    'Include required workflow': '包含必要工作流程',
    'Exclude required workflow': '排除必要工作流程',
    'Required workflow': '必要工作流程',
    'Please select a workflow': '請選擇工作流程',
    'The saved workflow targeting condition is incomplete and cannot be displayed. It will be preserved when you save other changes.':
      '已儲存的工作流程目標條件不完整，無法顯示。儲存其他變更時會保留此條件。',

    // 保存与提示
    'Reverting...': '還原中...',
    'Reverting…': '還原中…',
    'Ruleset created': '已建立規則集',
    'Ruleset imported': '已匯入規則集',
    'Ruleset updated': '已更新規則集',
    'Ruleset restored': '已還原規則集',
    'Ruleset deleted': '已刪除規則集',
    'Failed to save ruleset': '無法儲存規則集',
    'Failed to get saved ruleset': '無法取得已儲存的規則集',
    'Changes reverted': '已還原變更',
    'No changes have been made': '未做任何變更',
    "Invalid rules: 'Required status checks'": '無效的規則：「必要狀態檢查」',
    'This ruleset has been restored to a previous version but the changes have not been saved.':
      '此規則集已還原到先前的版本，但變更尚未儲存。',
    'Review and save the changes below.': '審查並儲存下方的變更。',
    'This ruleset has been imported but the changes have not been saved.': '此規則集已匯入，但變更尚未儲存。',
    'This ruleset does not target any resources and will not be applied.': '此規則集沒有任何目標資源，不會套用。',
    'does not target any resources and will not be applied.': '沒有任何目標資源，不會套用。',
    // 「See the」+ 链接「latest version」+「.」
    'You are viewing a previous version of this ruleset. This ruleset has been modified since this version. See the':
      '你正在查看此規則集的先前版本。此版本之後規則集已有修改。查看',
    'latest version': '最新版本',
    // 末尾接链接「visit the forks page」
    'Push rulesets are applied to a repository and its downstream repositories. To review the downstream repositories that will inherit this ruleset,':
      '推送規則集會套用到儲存庫及其下游儲存庫。若要查看將繼承此規則集的下游儲存庫，請',
    'visit the forks page': '前往分叉頁面',

    // 历史版本
    'Ruleset history': '規則集歷史記錄',
    'Restore ruleset': '還原規則集',
    'Restore the ruleset to this version': '將規則集還原到此版本',
    'No ruleset history available': '尚無規則集歷史記錄',
    'History menu': '歷史記錄選單',
    'View a diff of these changes': '查看這些變更的差異'
  },
  scoped: {
    Ruleset: '規則集',
    ruleset: '規則集',
    rulesets: '規則集',
    rules: '個規則',
    protections: '保護',
    Active: '作用中',
    Evaluate: '評估',
    Exempt: '豁免',
    App: '應用程式',
    Apps: '應用程式',
    Roles: '角色',
    Others: '其他',
    Actors: '執行者',
    Always: '一律',
    Target: '目標',
    'Target:': '目標：',
    Repos: '儲存庫',
    Property: '屬性',
    include: '包含',
    exclude: '排除',
    'Applies to': '適用於',
    'Applies To': '適用於',
    // 适用目标摘要：Applies to <a>3 targets</a> including main, dev and others.
    including: '包括',
    'and others': '等',
    // 只读规则集页的目标条件：Include: main、Exclude: release/*
    'Include:': '包含：',
    'Exclude:': '排除：',
    // 规则页（/rules）：「Managed by」+ 链接 <owner>；「All」标签的读屏名称
    'Managed by': '管理者',
    'All branch': '所有分支',
    'target:': '個目標：',
    'targets:': '個目標：',
    'targets including': '個目標包括',
    'naming pattern': '命名模式',
    'All branches': '所有分支',
    'All tags': '所有標記',
    branch: '分支',
    branches: '分支',
    tag: '標記',
    Tag: '標記',
    tags: '標記',
    Export: '匯出',
    Revert: '還原',
    // 保存 / 还原按钮：Save<span> changes</span>
    changes: '變更',
    // 历史记录：octocat edited <relative-time>
    edited: '編輯於',
    Unauthorized: '未授權'
  },
  regexp: [
    // 规则集列表：6 branch rules • targeting 1 branch（超过 100 显示 100+）
    [
      new RegExp(String.raw`^${COUNT} (branch|tag|push|repository) rules?(?: [•·] targeting ${TARGET})?$`),
      (_, count: string, kind: string, targets: string, noun: string, all: string, many: string) => {
        const rules = `${count} 個${RULE_KIND[kind] ?? kind}規則`
        return targets || all || many ? `${rules} • ${targeting(targets, noun, all, many)}` : rules
      }
    ],
    // 旧版列表：「• targeting 1 branch」单独成节点
    [
      new RegExp(String.raw`^[•·,] targeting ${COUNT} ${NOUN}$`),
      (match: string, targets: string, noun: string) => `${match.startsWith(',') ? '，' : '• '}針對 ${targets} ${countNoun(noun)}`
    ],
    // Copilot 代码审查页：3 Copilot code review rules • targeting 2 branches in this repository
    [
      new RegExp(String.raw`^${COUNT} Copilot code review rules?(?: [•·] targeting ${TARGET}( in this repository)?)?$`),
      (_, count: string, targets: string, noun: string, all: string, many: string, inRepo: string) => {
        const rules = `${count} 個 Copilot 程式碼審查規則`
        return targets || all || many ? `${rules} • ${targeting(targets, noun, all, many, inRepo)}` : rules
      }
    ],
    [
      new RegExp(String.raw`^targeting ${TARGET}( in this repository)?$`),
      (_, targets: string, noun: string, all: string, many: string, inRepo: string) => targeting(targets, noun, all, many, inRepo)
    ],
    // 规则集计数：3 rulesets、1 organization ruleset
    [
      new RegExp(String.raw`^${COUNT} (?:(repository|organization) )?rulesets?$`),
      (_, count: string, owner: string) => `${count} 個${owner === 'repository' ? '儲存庫' : owner === 'organization' ? '組織' : ''}規則集`
    ],
    [new RegExp(String.raw`^${COUNT} rules?$`), '$1 個規則'],
    // 编辑器：适用目标数（数量在链接中时由 scoped「Applies to」「including」与下一条分别匹配）
    [
      new RegExp(String.raw`^Applies to ${COUNT} targets?(:| including)?$`),
      (_, count: string, tail: string) => `適用於 ${count} 個目標${tail === ':' ? '：' : tail ? '包括' : ''}`
    ],
    [
      new RegExp(String.raw`^${COUNT} targets?(:| including)?$`),
      (_, count: string, tail: string) => `${count} 個目標${tail === ':' ? '：' : tail ? '包括' : ''}`
    ],
    // 编辑器：强制执行状态、可绕过的执行者分类的读屏名称
    [/^(Active|Evaluate|Disabled), Enforcement status$/, (_, status: string) => `${ENFORCEMENT[status] ?? status}，強制執行狀態`],
    [
      /^(All|Roles|Teams|Apps|Users|Others), Filter actors by category$/,
      (_, category: string) => `${ACTOR_CATEGORY[category] ?? category}，依類別篩選執行者`
    ],
    // 只读规则集页：Active - This ruleset will be enforced
    [
      /^- (This ruleset will be enforced|Evaluate this ruleset to trial rules and view insights|This ruleset will not be enforced)$/,
      (_, description: string) => `- ${ENFORCEMENT_DESCRIPTION[description] ?? description}`
    ],
    // 绕过清单按类别筛选后为空
    [
      /^No (roles|teams|apps|users|agents|other actors) in (bypass|allow) list$/,
      (_, category: string, list: string) => `${list === 'allow' ? '允許清單' : '繞過清單'}中沒有${ACTOR_CATEGORY[category] ?? category}`
    ],
    // 新增绕过面板候选项的说明：Team • @devs、App • octo-org（团队名、应用程式拥有者原样保留）
    [/^(Team|App) • (.{1,100})$/, (_, type: string, name: string) => `${type === 'Team' ? '團隊' : '應用程式'} • ${name}`],
    // 列表：缺少目标条件
    [
      /^(Branch|Tag|Repository|Organization|Workflow) conditions missing$/,
      (_, object: string) => `缺少${CONDITION_OBJECT[object] ?? object}條件`
    ],
    // 添加目标对话框：Example patterns: "main", "releases/**/*", "users/**/*".
    // 引号内是模式本身，照原文保留；直引号按繁体术语表第 2 节转成「」，逗号转成顿号：模式範例：「main」、「releases/**/*」。
    [
      /^Example patterns: ("[^"]{1,80}"(?:, "[^"]{1,80}"){0,5})\.$/,
      (_, patterns: string) =>
        `模式範例：${patterns
          .slice(1, -1)
          .split('", "')
          .map(pattern => `「${pattern}」`)
          .join('、')}。`
    ],
    // 按属性添加目标：已选多个值
    [/^(\d+) values selected$/, '已選取 $1 個值'],
    // 动作选单读屏名称：View history for the ruleset named main-protection
    [
      /^View (history|insights) for the ruleset named (.{1,100})$/,
      (_, kind: string, name: string) => `查看規則集 ${name} 的${kind === 'history' ? '歷史記錄' : '洞察'}`
    ],
    // 导入失败：Error importing ruleset: <服务端消息>
    [/^Error importing ruleset: (.{1,200})$/, '匯入規則集時發生錯誤：$1'],
    // 继承来源分组
    [/^Managed by ([\w.-]+)$/, '由 $1 管理'],
    [/^As an? ([\w.-]+) admin, you can$/, '身為 $1 管理員，你可以'],
    [
      /^manage ([\w.-]+) rulesets in (organization|enterprise) settings\.$/,
      (_, name: string, owner: string) => `在${owner === 'enterprise' ? '企業' : '組織'}設定中管理 ${name} 規則集。`
    ]
  ]
} satisfies PageDictionary
