import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 分支 / 标记：经典分支保护规则（列表、编辑器、删除对话框）、受保护标记（已弃用）与导入到规则集。
 * 规则集见 rulesets.ts。
 * 本文件的 Require … 规则名同时用于规则集的规则面板（见 ruleset-rules.ts 文件头），统一作「要求…」。
 * 术语：classic → 傳統，enforce → 強制執行，dismiss（审查核准）→ 駁回，matching → 相符，bypass list → 繞過清單，
 * actor → 執行者，required（规则要求）→ 必要，deprecated → 淘汰，migrate → 移轉，changelog → 變更記錄，
 * remove → 移除（与 Delete → 刪除 分开），target（动词）→ 針對。
 */
export default {
  static: {
    // 分支保护规则列表
    'Add branch ruleset': '新增分支規則集',
    'Add classic branch protection rule': '新增傳統分支保護規則',
    'Add branch protection rule': '新增分支保護規則',
    'Protect your branches with repository rulesets': '使用儲存庫規則集保護你的分支',
    'are the recommended way to protect branches, with required deployments, bypass lists, org-level enforcement, and more.':
      '是保護分支的建議方式，支援必要部署、繞過清單、組織層級強制執行等功能。',
    'Classic branch protections': '傳統分支保護',
    'are also available but offer fewer capabilities.': '也可使用，但功能較少。',
    'Classic branch protections have not been configured': '尚未設定傳統分支保護',
    "You haven't protected any of your branches": '你尚未保護任何分支',
    'You haven’t protected any of your branches': '你尚未保護任何分支',
    "You don't have any branches": '你沒有任何分支',
    'You don’t have any branches': '你沒有任何分支',
    'Before you can edit branch settings, you need to add a branch.': '必須先新增分支，才能編輯分支設定。',
    'Learn how to add a branch': '瞭解如何新增分支',
    'No branch protection rules defined yet.': '尚未定義分支保護規則。',
    'Define branch rules to disable force pushing, prevent branches from being deleted, or require pull requests before merging. Learn more about':
      '定義分支規則以停用強制推送、防止刪除分支或要求合併前先建立拉取請求。瞭解',
    'Define a protected branch rule to disable force pushing, prevent branches from being deleted, and optionally require status checks before merging.':
      '定義受保護分支規則以停用強制推送、防止刪除分支，並可選擇要求合併前通過狀態檢查。',
    'Define branch protection rules to disable force pushing, prevent branches from being deleted, and optionally require status checks before merging. New to branch protection rules?':
      '定義分支保護規則以停用強制推送、防止刪除分支，並可選擇要求合併前通過狀態檢查。初次使用分支保護規則？',
    'Learn more about protected branches': '瞭解受保護的分支',
    "Your protected branch rules won't be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.":
      '在你改用 GitHub 團隊版或企業版組織帳號之前，受保護分支規則不會在此私人儲存庫上強制執行。',
    'Your protected branch rules won’t be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.':
      '在你改用 GitHub 團隊版或企業版組織帳號之前，受保護分支規則不會在此私人儲存庫上強制執行。',
    "Rules on your private repos can't be enforced until you upgrade to GitHub Team or Enterprise.":
      '升級到 GitHub 團隊版或企業版之前，無法在私人儲存庫上強制執行規則。',
    'Rules on your private repos can’t be enforced until you upgrade to GitHub Team or Enterprise.':
      '升級到 GitHub 團隊版或企業版之前，無法在私人儲存庫上強制執行規則。',
    'Not enforced': '未強制執行',
    'Delete this branch protection rule?': '要刪除此分支保護規則嗎？',
    'I understand, delete this rule.': '我瞭解，刪除此規則。',
    'Branch protection rule settings saved.': '已儲存分支保護規則設定。',
    'Branch protection rule created.': '已建立分支保護規則。',
    'Branch protection rule was successfully deleted.': '已刪除分支保護規則。',

    // 分支保护规则编辑器：说明与方案限制
    'About branch protection rules': '關於分支保護規則',
    'Protect your most important branches': '保護你最重要的分支',
    'define whether collaborators can delete or force push to the branch and set requirements for any pushes to the branch, such as passing status checks or a linear commit history.':
      '決定協作者能否刪除或強制推送分支，並為分支的所有推送設定要求，例如通過狀態檢查或保持線性提交歷史記錄。',
    'Your GitHub Free plan': '你的 GitHub 免費版方案',
    "Your organization's GitHub Free plan": '你組織的 GitHub 免費版方案',
    'Your organization’s GitHub Free plan': '你組織的 GitHub 免費版方案',
    'can only enforce rules on its public repositories, like this one.': '只能對公開儲存庫強制執行規則，例如此儲存庫。',
    "Your rules won't be enforced on this private repository until you": '你的規則不會在此私人儲存庫上強制執行，除非你',
    'Your rules won’t be enforced on this private repository until you': '你的規則不會在此私人儲存庫上強制執行，除非你',
    'move to a GitHub Team or Enterprise organization account': '改用 GitHub 團隊版或企業版組織帳號',
    'upgrade this organization to GitHub Team or Enterprise': '將此組織升級到 GitHub 團隊版或企業版',
    'Branch name pattern': '分支名稱模式',
    'Protect matching branches': '保護相符的分支',

    // 要求拉取请求
    'Require a pull request before merging': '要求合併前先建立拉取請求',
    'When enabled, all commits must be made to a non-protected branch and submitted via a pull request before they can be merged into a branch that matches this rule.':
      '啟用後，所有提交都必須先提交到未受保護的分支並透過拉取請求送出，才能合併到符合此規則的分支。',
    'Require approvals': '要求核准',
    'When enabled, pull requests targeting a matching branch require a number of approvals and no changes requested before they can be merged.':
      '啟用後，以相符分支為目標的拉取請求必須獲得一定數量的核准且沒有變更要求，才能合併。',
    'Required number of approvals before merging:': '合併前所需的核准數：',
    'Dismiss stale pull request approvals when new commits are pushed': '推送新提交時駁回過時的拉取請求核准',
    'New reviewable commits pushed to a matching branch will dismiss pull request review approvals.':
      '推送到相符分支的新可審查提交會駁回拉取請求審查核准。',
    'Require review from Code Owners': '要求程式碼擁有者審查',
    'Require an approved review in pull requests including files with a designated code owner.':
      '拉取請求包含已指定程式碼擁有者的檔案時，要求取得核准的審查。',
    'Restrict who can dismiss pull request reviews': '限制誰可以駁回拉取請求審查',
    'Specify people, teams, or apps allowed to dismiss pull request reviews.': '指定允許駁回拉取請求審查的人員、團隊或應用程式。',
    'People, teams, or apps that can dismiss reviews.': '可以駁回審查的人員、團隊或應用程式。',
    'People, teams, or apps that can dismiss reviews': '可以駁回審查的人員、團隊或應用程式',
    'Organization and repository administrators': '組織和儲存庫管理員',
    'These members can always dismiss.': '這些成員一律可以駁回。',
    'These members cannot dismiss.': '這些成員無法駁回。',
    'Allow specified actors to bypass required pull requests': '允許指定的執行者繞過拉取請求要求',
    'Specify people, teams, or apps who are allowed to bypass required pull requests.': '指定允許繞過拉取請求要求的人員、團隊或應用程式。',
    'People, teams, or apps who can bypass required pull requests': '可以繞過拉取請求要求的人員、團隊或應用程式',
    'These members can always bypass required pull requests.': '這些成員一律可以繞過拉取請求要求。',
    'These members cannot bypass.': '這些成員無法繞過。',
    'Require approval of the most recent reviewable push': '要求核准最近一次可審查的推送',
    'Whether the most recent reviewable push must be approved by someone other than the person who pushed it.':
      '最近一次可審查的推送是否必須由推送者以外的人核准。',

    // 状态检查
    'Require status checks to pass before merging': '要求合併前通過狀態檢查',
    'must pass before branches can be merged into a branch that matches this rule. When enabled, commits must first be pushed to another branch, then merged or pushed directly to a branch that matches this rule after status checks have passed.':
      '必須通過，分支才能合併到符合此規則的分支。啟用後，提交必須先推送到其他分支，待狀態檢查通過後，再合併或直接推送到符合此規則的分支。',
    'Require branches to be up to date before merging': '要求合併前分支必須為最新狀態',
    'This ensures pull requests targeting a matching branch have been tested with the latest code. This setting will not take effect unless at least one status check is enabled (see below).':
      '這可確保以相符分支為目標的拉取請求已使用最新程式碼測試。至少啟用一項狀態檢查（見下方）後，此設定才會生效。',
    'Do not require status checks on creation': '建立時不要求狀態檢查',
    'Allow repositories and branches to be created if a check would otherwise prohibit it.': '即使檢查會禁止，仍允許建立儲存庫和分支。',
    'Search for status checks in the last week for this repository': '搜尋此儲存庫最近一週的狀態檢查',
    'Status checks that are required.': '必要的狀態檢查。',
    'Status checks that are required': '必要的狀態檢查',
    'No status checks found': '找不到狀態檢查',
    'Sorry, we couldn’t find any status checks in the last week for this repository.': '找不到此儲存庫最近一週的狀態檢查。',
    "Sorry, we couldn't find any status checks in the last week for this repository.": '找不到此儲存庫最近一週的狀態檢查。',
    'Learn more about status checks': '瞭解狀態檢查',

    // 对话解决、签署、线性历史记录
    'Require conversation resolution before merging': '要求合併前解決對話',
    'When enabled, all conversations on code must be resolved before a pull request can be merged into a branch that matches this rule.':
      '啟用後，必須先解決程式碼上的所有對話，拉取請求才能合併到符合此規則的分支。',
    'Learn more about requiring conversation completion before merging': '瞭解如何要求合併前完成對話',
    'Require signed commits': '要求已簽署的提交',
    'Commits pushed to matching branches must have verified signatures.': '推送到相符分支的提交必須具有已驗證的簽章。',
    'Require linear history': '要求線性歷史記錄',
    'Prevent merge commits from being pushed to matching branches.': '禁止將合併提交推送到相符的分支。',
    'Select the squash or rebase method for the associated merge queue to use this rule.':
      '必須為關聯的合併佇列選擇壓縮或重定基底方式，才能使用此規則。',

    // 合并队列
    'Require merge queue': '要求合併佇列',
    'Merges to matching branches must be performed via a merge queue.': '必須透過合併佇列合併到相符的分支。',
    'Make sure to configure your CI to build branches created by the queue.': '請確保已設定 CI 建置佇列建立的分支。',
    'Method to use when merging changes from queued pull requests.': '合併佇列中拉取請求的變更時使用的方式。',
    'Build concurrency': '建置並行數',
    'Limit the number of queued pull requests building at the same time.': '限制佇列中同時建置的拉取請求數量。',
    'Maximum pull requests to build:': '同時建置的拉取請求數上限：',
    'Merge limits': '合併數量限制',
    'Limit the number of pull requests merged into the protected branch in a single merge operation.':
      '限制單次合併時合併到受保護分支的拉取請求數量。',
    'Minimum pull requests to merge:': '合併的拉取請求數下限：',
    'Maximum pull requests to merge:': '合併的拉取請求數上限：',
    'Only merge non-failing pull requests': '僅合併未失敗的拉取請求',
    'Status check timeout': '狀態檢查逾時',
    'Time (in minutes) a required status check must report a conclusion within to not be considered failed.':
      '必要的狀態檢查須在此時間（分鐘）內回報結論，否則視為失敗。',
    'Consider check failed after:': '檢查在以下時間後視為失敗：',

    // 部署
    'Require deployments to succeed before merging': '要求合併前部署成功',
    'Choose which environments must be successfully deployed to before branches can be merged into a branch that matches this rule.':
      '選擇哪些環境必須部署成功，分支才能合併到符合此規則的分支。',
    'No deployment environments found': '找不到部署環境',
    'Sorry, we couldn’t find any deployments for this repository.': '找不到此儲存庫的部署。',
    "Sorry, we couldn't find any deployments for this repository.": '找不到此儲存庫的部署。',
    'Deployment environments found in this repository': '此儲存庫中的部署環境',

    // 锁定与推送限制
    'Lock branch': '鎖定分支',
    'Branch is read-only. Users cannot push to the branch.': '分支為唯讀。使用者無法推送到此分支。',
    'Do not allow bypassing the above settings': '不允許繞過上述設定',
    'The above settings will apply to administrators and custom roles with the "bypass branch protections" permission.':
      '上述設定也將適用於管理員和具有「繞過分支保護」權限的自訂角色。',
    'The above settings will apply to administrators and custom roles with the “bypass branch protections” permission.':
      '上述設定也將適用於管理員和具有「繞過分支保護」權限的自訂角色。',
    'Restrict who can push to matching branches': '限制誰可以推送到相符的分支',
    'Specify people, teams, or apps allowed to push to matching branches. Required status checks will still prevent these people, teams, and apps from merging if the checks fail.':
      '指定允許推送到相符分支的人員、團隊或應用程式。如果必要的狀態檢查失敗，這些人員、團隊和應用程式仍無法合併。',
    'Restrict pushes that create matching branches': '限制會建立相符分支的推送',
    'Only people, teams, or apps allowed to push will be able to create new branches matching this rule.':
      '只有允許推送的人員、團隊或應用程式才能建立符合此規則的新分支。',
    'People, teams, or apps with push access': '具有推送權限的人員、團隊或應用程式',
    'Organization administrators, repository administrators, and users with the Maintain role.':
      '組織管理員、儲存庫管理員和具有維護角色的使用者。',
    'Organization administrators, repository administrators, the merge queue, and users with the Maintain role.':
      '組織管理員、儲存庫管理員、合併佇列和具有維護角色的使用者。',
    'Admins can always push. Users with the Maintain role can push when required status checks pass.':
      '管理員一律可以推送。具有維護角色的使用者可在必要的狀態檢查通過時推送。',
    'These members can push when required status checks pass.': '這些成員可在必要的狀態檢查通過時推送。',

    // 适用于所有人的规则
    'Rules applied to everyone including administrators': '適用於包括管理員在內所有人的規則',
    'Allow force pushes': '允許強制推送',
    'Permit force pushes for all users with push access.': '允許所有具有推送權限的使用者強制推送。',
    'Specify who can force push': '指定誰可以強制推送',
    'Users who can force push': '可以強制推送的使用者',
    'Only these people, teams, or apps are allowed to force push.': '只有這些人員、團隊或應用程式可以強制推送。',
    'Search for people, teams, or apps': '搜尋人員、團隊或應用程式',
    'You have reached the maximum number of people, teams, and apps you can add.': '已達到可新增的人員、團隊和應用程式數量上限。',
    'View the protected branches documentation': '查看受保護分支說明文件',
    'People, teams, or apps who can force push': '可以強制推送的人員、團隊或應用程式',
    'Organization and repository administrators (automatic)': '組織和儲存庫管理員（自動）',
    'Allow deletions': '允許刪除',
    'Allow users with push access to delete matching branches.': '允許具有推送權限的使用者刪除相符的分支。',

    // 受保护标记（已淘汰）
    'Tag protection rule created.': '已建立標記保護規則。',
    'Tag protection rule deleted.': '已刪除標記保護規則。',
    'Level up your tag protections with Repository Rules': '使用儲存庫規則升級標記保護',
    // 「…You can learn more about the sunset in our」+ 链接「changelog」+「and can get started now by migrating to rulesets.」
    // （原文链接后无逗号，译文不加）
    'Protected tags are being deprecated. To continue protecting tags, please migrate to a tag ruleset by August 30th. You can learn more about the sunset in our':
      '受保護的標記即將淘汰。若要繼續保護標記，請在 8月30日前移轉到標記規則集。你可以在我們的',
    'and can get started now by migrating to rulesets.': '中瞭解停用詳情並立即開始移轉到規則集。',
    'Protected tags': '受保護的標記',
    'Protected tags are available to Pro, Team, and Enterprise users': '專業版、團隊版和企業版使用者可以使用受保護的標記',
    'Protected tags can only be created or deleted by users with enhanced permissions defined by your organization owners.':
      '只有具有組織擁有者所定義之增強權限的使用者才能建立或刪除受保護的標記。',
    'Learn more about protected tags': '瞭解受保護的標記',
    'No protected tag rules exist yet': '尚無受保護的標記規則',
    'Protected tags have been deprecated': '受保護的標記已淘汰',
    'Go to rulesets to create new tag rules': '前往規則集建立新的標記規則',
    'Import to rulesets': '匯入到規則集',
    'Import your tag protection rules into repository rules': '將標記保護規則匯入儲存庫規則',
    'Migrate your protected tags to one or more repository rulesets. This will implement the same tag protections you currently have today. Once created, the tag rulesets can take advantage of new ruleset features:':
      '將受保護的標記移轉到一個或多個儲存庫規則集。這會套用與你目前相同的標記保護。建立後，標記規則集可以使用新的規則集功能：',
    'Requiring status checks to pass': '要求通過狀態檢查',
    'Requiring linear history': '要求線性歷史記錄',
    'Create separate rulesets for creating and deleting protected tags': '為建立和刪除受保護的標記分別建立規則集',
    'Users and Teams with at least Maintainer role will be able to create new protected tags. Administrators will be able to delete protected tags. This is the same behavior as existing tag protections.':
      '至少具有維護角色的使用者和團隊可以建立新的受保護標記。管理員可以刪除受保護的標記。這與現有的標記保護行為相同。',
    'Create one ruleset for all protected tag operations': '為所有受保護標記操作建立單一規則集',
    'Administrators will be able to create and delete protected tags.': '管理員可以建立和刪除受保護的標記。',
    'Learn more about tag rulesets': '瞭解標記規則集',
    'Delete tag protection rule': '刪除標記保護規則',
    'Delete tag protection rule?': '要刪除標記保護規則嗎？',
    'Are you sure you want to delete this tag protection rule? Anyone who can write to this repository will be able to create tags with this pattern.':
      '確定要刪除此標記保護規則嗎？任何能寫入此儲存庫的人都將能建立符合此模式的標記。',
    // 删除对话框的确认按钮：Remove 按术语表作「移除」（标题、正文的 Delete 作「刪除」）
    'Yes, remove this tag protection rule': '是，移除此標記保護規則',
    'Tag name pattern': '標記名稱模式',
    'to target tags named': '來針對名為'
  },
  scoped: {
    'Choose which': '選擇哪些',
    'Branch protection rules': '分支保護規則',
    'Branch protection rule': '分支保護規則',
    'repository rules': '儲存庫規則',
    'protected branches': '受保護的分支',
    'status checks': '狀態檢查',
    'Merge method': '合併方式',
    'Method:': '方式：',
    'Merge commit': '合併提交',
    // 「Minimum pull requests to merge:」+ 输入框 +「or after」+ 输入框 +「minutes」
    'or after': '或經過',
    minutes: '分鐘',
    Required: '必要',
    changelog: '變更記錄',
    'Signed commits': '已簽署的提交',
    'New rule': '新增規則',
    '/ New rule': '/ 新增規則',
    Import: '匯入',
    'Add rule': '新增規則',
    // 「Example: You can use」+ <code>v*</code> +「to target tags named」+ <code>v1</code> +「,」+ <code>v2</code> +「, and so on.」
    'Example: You can use': '範例：你可以使用',
    ', and so on.': '等的標記。'
  },
  regexp: [
    // 规则列表与编辑器：相符的分支数
    [
      /^(Currently applies|Applies) to (\d+) branch(?:es)?(\.?)$/,
      (_, verb: string, count: string, dot: string) => `${verb === 'Applies' ? '' : '目前'}適用於 ${count} 個分支${dot ? '。' : ''}`
    ],
    [/^Applies to (\d+) branch(?:es)?:$/, '適用於 $1 個分支：'],
    [/^Applies to (\d+) tags?(\.?)$/, (_, count: string, dot: string) => `適用於 ${count} 個標記${dot ? '。' : ''}`]
  ]
} satisfies PageDictionary
