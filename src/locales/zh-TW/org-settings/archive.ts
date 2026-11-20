import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * 审核日志搜索建议「action: filter by action」中的筛选对象（与个人安全日志一致）。
 * actor 按术语表作「執行者」；operation 作「操作類型」，不用微软的「作業」（与 Actions 的 job 撞词）
 */
const FILTER_TARGET: Readonly<Record<string, string>> = {
  action: '動作',
  actor: '執行者',
  country: '國家/地區',
  'created date': '建立日期',
  operation: '操作類型',
  organization: '組織',
  repository: '儲存庫',
  team: '團隊',
  user: '使用者'
}

/** 审核日志令牌策略事件中的令牌类型 */
const TOKEN_KIND: Readonly<Record<string, string>> = {
  'personal access tokens (classic)': '個人存取權杖（傳統）',
  'fine-grained personal access tokens': '精細個人存取權杖'
}
const TOKENS = '(personal access tokens \\(classic\\)|fine-grained personal access tokens)'

/** 令牌有效期事件末尾的「(Not exempting administrators)」 */
const EXEMPT: Readonly<Record<string, string>> = { 'Not exempting': '不豁免管理員', Exempting: '豁免管理員' }

/** 双因素要求事件的动作 */
const TWO_FACTOR_VERB: Readonly<Record<string, string>> = { removed: '移除了', cleared: '清除了', enabled: '啟用了', disabled: '停用了' }

/** Dependabot 规则事件中的规则名称（未收录的照原文） */
const DEPENDABOT_RULE: Readonly<Record<string, string>> = { 'Dismiss package malware alerts': '解除套件惡意軟體警示' }

/**
 * 存档与日志：预定提醒（组织）、赞助日志、审核日志、源 IP 显示、已删除的存储库。
 * 个人设置已收录的审核日志、赞助日志、已删除存储库的通用文字不再重复；这里只补组织独有的部分和本页正则。
 * 审核日志搜索建议等短语在个人设置是 scoped，本页面类型另收一份，译法一致。
 * 术语：scheduled reminders → 排定的提醒，audit log → 稽核記錄，restore → 還原，disclosure → 揭露。
 */
export default {
  static: {
    // 审核日志设置：源 IP 显示开关的保存提示
    'Audit log source IP disclosure enabled.': '已啟用稽核記錄來源 IP 揭露。',
    'Audit log source IP disclosure disabled.': '已停用稽核記錄來源 IP 揭露。',
    // 审核日志事件（无槽位）
    'Updated codespace access and security settings to disable access to all repositories':
      '將程式碼空間存取和安全性設定更新為停用所有儲存庫的存取權',
    // 审核日志：导出截断提示（「… or the <a>REST API</a> for complete results.」见 inline）、预算事件
    'Budget alerts are enabled.': '預算警示已啟用。',
    // 预定提醒（组织）
    'No scheduled reminders created.': '尚未建立排定的提醒。',
    'To keep projects moving, you can now remind your teams about pull requests they need to review.':
      '你現在可以提醒團隊處理需要他們審查的拉取請求，讓專案持續推進。',
    'Connect a Slack workspace to get started': '連接 Slack 工作區以開始使用',
    'Add Slack workspace': '新增 Slack 工作區',
    // 句尾接链接「here.」：…移轉的詳細資訊請參閱此處。
    'We have rolled out a new version of the GitHub app in Slack. If you are currently on the old app, please consider switching over to the new app! More info about migration can be found':
      '我們已在 Slack 中推出新版 GitHub 應用程式。如果你目前仍在使用舊版應用程式，請考慮改用新版！移轉的詳細資訊請參閱',
    "1. Clicking on 'Add' will configure your Slack workspace with the new GitHub app.":
      '1. 按一下「新增」會使用新版 GitHub 應用程式設定你的 Slack 工作區。',
    '2. If you already have the old app in Slack, it will uninstall the legacy app and install the new one.':
      '2. 如果 Slack 中已有舊版應用程式，將會解除安裝舊版並安裝新版。',

    // 预定提醒表单（组织与团队共用）
    'Add your first reminder': '新增第一個提醒',
    'Delete this reminder': '刪除此提醒',
    'Slack channel': 'Slack 頻道',
    Weekdays: '平日',
    'Tracked repositories': '追蹤的儲存庫',
    'Filter by team assigned to review code': '依指派審查程式碼的團隊篩選',
    'Ignore drafts': '忽略草稿',
    'Require review requests': '需要審查請求',
    'Remind authors after reviews': '審查後提醒作者',
    'Ignore approved pull requests': '忽略已核准的拉取請求',
    'Ignore with 1 or more approvals': '有 1 個或更多核准時忽略',
    'Minimum age': '最短存在時間',
    'Minimum staleness': '最短閒置時間',
    'Ignored terms': '忽略的字詞',
    'Ignored labels': '忽略的標籤',
    // 规则要求义 required 按术语表作「必要」
    'Required labels': '必要標籤',

    // 审核日志（组织）
    'Export Git Events': '匯出 Git 事件',
    'Export Git events': '匯出 Git 事件',
    'Export file will be limited to 100 Mb.': '匯出檔案上限為 100 MB。',
    'Disclose actor IP addresses in audit logs': '在稽核記錄中揭露執行者的 IP 位址',
    'Enable source IP disclosure': '啟用來源 IP 揭露',
    "Enabling will allow you to view IP addresses of current members for organization audit log events. As this feature makes your users' IP addresses automatically available, you should review this change with your legal team to determine whether any user notification is required. When enabled at the enterprise level it will be automatically enabled for all organizations owned by the enterprise, the reverse is not true.":
      '啟用後，你可以在組織稽核記錄事件中查看目前成員的 IP 位址。此功能會自動提供使用者的 IP 位址，你應與法務團隊評估此變更，確認是否需要通知使用者。在企業層級啟用時，企業擁有的所有組織都會自動啟用；反之則不然。',
    'Enabling will allow you to view IP addresses of current members for organization audit log events. As this feature makes your users’ IP addresses automatically available, you should review this change with your legal team to determine whether any user notification is required. When enabled at the enterprise level it will be automatically enabled for all organizations owned by the enterprise, the reverse is not true.':
      '啟用後，你可以在組織稽核記錄事件中查看目前成員的 IP 位址。此功能會自動提供使用者的 IP 位址，你應與法務團隊評估此變更，確認是否需要通知使用者。在企業層級啟用時，企業擁有的所有組織都會自動啟用；反之則不然。'
  },
  scoped: {
    'first-time contributors': '首次貢獻者',
    'first-time contributors new to GitHub': 'GitHub 新使用者中的首次貢獻者',
    // 审核日志事件槽位里的取值（read / write / private 由同页面类型的其他词条译出）
    'users without write access': '沒有寫入權限的使用者',
    'all outside collaborators': '所有外部協作者',
    'not set': '未設定',
    themselves: '自己',
    none: '無',
    // 预算事件「Budget was <strong>updated</strong> …」中的动作；created / deleted 用规则集洞察的「建立了」「刪除了」
    updated: '更新了',
    // 预定提醒
    'here.': '此處。',
    'Add workspace': '新增工作區',
    Days: '星期',
    Times: '時間',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    Sunday: '星期日',

    // 审核日志
    'Organization membership': '組織成員身分',
    'Team management': '團隊管理',
    'Hook activity': 'Web 鉤子活動',
    // 「Select events from: <日期> To: <日期>」
    'Select events from:': '事件開始日期：',
    'To:': '結束日期：',
    'Download Results': '下載結果',
    Exporting: '匯出中',
    Export: '匯出',
    'Clear current search query': '清除目前的搜尋查詢',
    'Show more details': '顯示更多詳細資料',
    'Period:': '期間：',
    // 下拉按钮，同 Sort by → 排序依據
    'Filter by': '篩選依據',
    'Source IP disclosure': '來源 IP 揭露',
    'filter by action': '依動作篩選',
    'filter by actor': '依執行者篩選',
    'filter by country': '依國家/地區篩選',
    'filter by created date': '依建立日期篩選',
    'filter by operation': '依操作類型篩選',
    'filter by team': '依團隊篩選',
    'filter by user': '依使用者篩選',

    // 赞助日志
    'Past Day': '過去一天',
    'Past Week': '過去一週',
    'Past Month': '過去一個月',
    'Past Year': '過去一年',

    // 已删除的存储库（「Restore」由全站 static 收录）
    Deleted: '刪除於',
    'Done!': '完成！',
    'These repositories were deleted by members of this organization. Repositories can be restored for 90 days after deletion.':
      '這些儲存庫已由此組織的成員刪除。儲存庫刪除後 90 天內可以還原。'
  },
  regexp: [
    // 审核日志事件：更新组织头像；条目头像链接的无障碍名称
    [/^Updated profile picture for ([\w.-]+)$/, '更新了 $1 的大頭貼'],
    [/^View ([\w.-]+)'s profile$/, '檢視 $1 的個人檔案'],
    [/^Ignore with (\d+) or more approvals?$/, '有 $1 個或更多核准時忽略'],
    [/^Found (\d+) events?$/, '找到 $1 個事件'],
    // 审核日志搜索建议的无障碍标签：「action: filter by action」（限定符与半角冒号原样保留）
    [
      /^([a-z_]+): filter by (action|actor|country|created date|operation|organization|repository|team|user)$/,
      (_, qualifier: string, target: string) => `${qualifier}: 依${FILTER_TARGET[target] ?? target}篩選`
    ],
    [new RegExp(`^This is where you can review activity from ${ORG}[’']s sponsorships\\.$`), '你可以在這裡查看 $1 的贊助活動。'],
    [new RegExp(`^No recoverable repositories were found for ${ORG}\\.$`), '找不到 $1 可還原的儲存庫。'],
    [/^Are you sure you want to restore ([\w.-]+(?:\/[\w.-]+)?)\?$/, '確定要還原 $1 嗎？']
  ],
  inline: [
    // 提示条：<svg> <strong>ProTip!</strong> Exclude events created by you with <a>-actor:…</a>
    ['{} {} Exclude events created by you with {}', '{} {} 使用 {} 排除你建立的事件'],
    // 存储库、依赖项更新、源 IP 显示
    ['Renamed the repository {} to {}', '將儲存庫 {} 重新命名為 {}'],
    ['Created the repository {}', '建立了儲存庫 {}'],
    ['Enabled GitHub Actions for {}', '為 {} 啟用了 GitHub 動作'],
    ['Disabled dependency updates on self-hosted actions for {}', '為 {} 停用了自架動作的相依性更新'],
    ['Enabled dependency updates on self-hosted actions for {}', '為 {} 啟用了自架動作的相依性更新'],
    ['Disabled source ip disclosure for the {} organization.', '為 {} 組織停用了來源 IP 揭露。'],
    ['Enabled source ip disclosure for the {} organization.', '為 {} 組織啟用了來源 IP 揭露。'],
    // 令牌策略（开头的 <strong> 是参与者；有效期、访问限制见下方正则）
    [
      '{} requires now that fine-grained personal access token requests made by organization members are subject to administrator review',
      '{} 現在要求組織成員的精細個人存取權杖請求須經管理員審查'
    ],
    [
      '{} allows fine-grained personal access token requests made by organization members to no longer be subject to administrator review',
      '{} 已允許組織成員的精細個人存取權杖請求無需管理員審查'
    ],
    [
      new RegExp(`^\\{\\} unset ${TOKENS} expiration limit$`),
      (_: string, kind: string) => `{} 取消了${TOKEN_KIND[kind] ?? kind}的到期限制`
    ],
    [
      new RegExp(`^\\{\\} set ${TOKENS} maximum lifetime to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`),
      (_: string, kind: string, days: string, exempt: string) =>
        `{} 將${TOKEN_KIND[kind] ?? kind}的最長有效期設為 ${days} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(
        `^\\{\\} changed ${TOKENS} maximum lifetime from (\\d+) days? to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`
      ),
      (_: string, kind: string, from: string, to: string, exempt: string) =>
        `{} 將${TOKEN_KIND[kind] ?? kind}的最長有效期從 ${from} 天改為 ${to} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(`^\\{\\} maximum lifetime for ${TOKENS} is (not )?exempting administrators now\\.$`),
      (_: string, kind: string, not: string) => `{} 已將${TOKEN_KIND[kind] ?? kind}的最長有效期設為${not ? '不' : ''}豁免管理員。`
    ],
    [
      new RegExp(`^\\{\\} has (permitted|restricted) access via ${TOKENS} to the organization$`),
      (_: string, verb: string, kind: string) => `{} 已${verb === 'permitted' ? '允許' : '限制'}透過${TOKEN_KIND[kind] ?? kind}存取組織`
    ],
    // 双因素要求（开头是参与者的登录名，纯文本）
    [
      /^([\w-]+) (removed|cleared|enabled) secure two-factor requirement for \{\} organization\.$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 組織的安全雙重驗證要求。`
    ],
    [
      /^([\w-]+) (enabled|disabled) two-factor authentication requirement for \{\} organization$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 組織的雙重驗證要求`
    ],
    // 第三方应用访问限制、集成、机密
    ['Enabled third-party application access restrictions for the {} organization', '為 {} 組織啟用了第三方應用程式存取限制'],
    ['Disabled third-party application access restrictions for the {} organization', '為 {} 組織停用了第三方應用程式存取限制'],
    ['Uninstalled the {} integration', '解除安裝了 {} 整合'],
    ['Installed the {} integration.', '安裝了 {} 整合。'],
    ['Removed {} secret {} for {}', '移除了 {} 機密 {} 於 {}'],
    ['Created {} secret {} available to {} repositories for {}', '建立了 {} 機密 {} 可用於 {} 儲存庫 於 {}'],
    // 域（域名是纯文本）、部署密钥、推送保护的自定义消息、Dependabot 规则
    [/^Removed the ([\w.-]+) domain from the \{\} organization\.$/, '從 {} 組織中移除了網域 $1。'],
    [/^Approved the ([\w.-]+) domain for the \{\} organization\.$/, '為 {} 組織核准了網域 $1。'],
    [/^Added the ([\w.-]+) domain to the \{\} organization\.$/, '在 {} 組織中新增了網域 $1。'],
    [/^Verified the ([\w.-]+) domain for the \{\} organization\.$/, '為 {} 組織驗證了網域 $1。'],
    [
      'Members can now create and use deploy keys to repositories in the {} organization.',
      '成員現在可以為 {} 組織中的儲存庫建立和使用部署金鑰。'
    ],
    [
      'Updated the custom message to display when GitHub detects and blocks a secret {}',
      '為 {} 更新了 GitHub 偵測並封鎖機密時顯示的自訂訊息'
    ],
    [
      'Enabled the custom message to display when GitHub detects and blocks a secret {}',
      '為 {} 啟用了 GitHub 偵測並封鎖機密時顯示的自訂訊息'
    ],
    [
      'Disabled the custom message to display when GitHub detects and blocks a secret {}',
      '為 {} 停用了 GitHub 偵測並封鎖機密時顯示的自訂訊息'
    ],
    [
      /^Force (enabled|disabled) Dependabot rule "([^"]+)" for \{\}$/,
      (_: string, verb: string, rule: string) =>
        `為 {} 強制${verb === 'enabled' ? '啟用' : '停用'}了 Dependabot 規則「${DEPENDABOT_RULE[rule] ?? rule}」`
    ],
    // Web 钩子、操作策略
    ['Installed {} for {} with {} events', '安裝了 {} 於 {} 並訂閱 {} 事件'],
    ['Uninstalled {} for {}', '解除安裝了 {} 於 {}'],
    [
      'Set policy to default workflow token can create or approve PR to true for {}',
      '為 {} 將預設工作流程權杖可建立或核准 PR 政策設為 true'
    ],
    ['Set policy to default workflow token permission to write for {}', '為 {} 將預設工作流程權杖權限政策設為寫入'],
    [
      'Set policy to require approval for private fork pull request workflows from {} for {}.',
      '將政策設為來自 {} 的私人分叉拉取請求工作流程需經核准，適用於 {}。'
    ],
    [
      'Set policy to require approval for fork pull request workflows from {} for {}.',
      '將政策設為來自 {} 的分叉拉取請求工作流程需經核准，適用於 {}。'
    ],
    ['Set fork pull request workflows policy to {}', '將分叉拉取請求工作流程政策設為 {}'],
    ['Set artifact and log retention duration to {}', '將成品和記錄保留期限設為 {}'],
    ['Updated list of allowed actions and workflows for {}', '為 {} 更新了允許的動作和工作流程清單'],
    [
      'Updated allowed select actions and workflows to allow actions created by GitHub and allow verified actions for {}',
      '為 {} 將允許的選定動作和工作流程更新為允許 GitHub 建立的動作和已驗證的動作'
    ],
    ['Updated allowed actions and workflows to all actions and workflows for {}', '為 {} 將允許的動作和工作流程更新為所有動作和工作流程'],
    [
      'Updated the repo-level self-hosted runners policy from {} entities to {} entities',
      '將儲存庫層級自架執行器政策從 {} 實體更新為 {} 實體'
    ],
    // Copilot 代码审查、项目、代码空间、自定义属性
    ['Copilot review effort default changed from {} to {} for the {} organization', 'Copilot 審查強度預設值從 {} 變更為 {} 於 {} 組織'],
    ['Created project {} in {}', '建立了專案 {} 於 {}'],
    ['Closed project {} in {}', '關閉了專案 {} 於 {}'],
    ['Reopened project {} in {}', '重新開啟了專案 {} 於 {}'],
    ['Created a view in project {} in {}', '為專案 {} 建立了檢視 於 {}'],
    ['Created a field in project {} in {}', '為專案 {} 建立了欄位 於 {}'],
    ['Deleted a field in project {} in {}', '刪除了專案 {} 的欄位 於 {}'],
    [
      'Updated Codespaces access to all members and collaborators on all internal and private repositories in {}',
      '將 {} 中程式碼空間的存取權更新為所有內部和私人儲存庫的所有成員和協作者'
    ],
    [
      'Updated Codespaces access to all members on all internal and private repositories in {}',
      '將 {} 中程式碼空間的存取權更新為所有內部和私人儲存庫的所有成員'
    ],
    [
      'Updated Codespaces access to selected users on all internal and private repositories in {}',
      '將 {} 中程式碼空間的存取權更新為所有內部和私人儲存庫的選定使用者'
    ],
    ['Allowed themselves to use Codespaces for the {} organization', '允許自己在 {} 組織中使用程式碼空間'],
    ['Stopped allowing themselves to use Codespaces for the {} organization', '不再允許自己在 {} 組織中使用程式碼空間'],
    ['Created custom property {}', '建立了自訂屬性 {}'],
    ['Deleted custom property {}', '刪除了自訂屬性 {}'],
    // 成员权限、版主、组织角色（槽位：成员或团队、角色、组织）
    ['Added themselves as a moderator for the {} organization', '將自己新增為 {} 組織的版主'],
    ['Removed themselves as a moderator for the {} organization', '將自己從 {} 組織的版主中移除'],
    ['Members can now delete issues in the {} organization.', '成員現在可以刪除 {} 組織中的議題。'],
    ['Members can no longer delete issues in the {} organization.', '成員無法再刪除 {} 組織中的議題。'],
    ['Members cannot create new teams for the {} organization.', '成員無法為 {} 組織建立新團隊。'],
    [
      'Repository admins can now install GitHub Apps on their repositories in {}',
      '{} 中的儲存庫管理員現在可以在其儲存庫上安裝 GitHub 應用程式'
    ],
    [
      'App access requests are now allowed for members and outside collaborators in {}',
      '{} 中的成員和外部協作者現在可以提出應用程式存取要求'
    ],
    ['Members can no longer publish private GitHub Pages in the {} organization.', '成員無法再發佈 {} 組織中的私人 GitHub 頁面。'],
    ['Disabled forking of private repositories in the {} organization.', '停用了 {} 組織中私人儲存庫的分叉。'],
    [
      '{} the creation of only public and private repositories by members of the {} organization',
      '{} {} 組織的成員僅可建立公開和私人儲存庫'
    ],
    [
      'Changed the base repository permission setting from {} to {} for the {} organization.',
      '將基本儲存庫權限設定從 {} 變更為 {}，適用於 {} 組織。'
    ],
    ['assigned {} to the {} organization role in the {} organization', '將 {} 指派到 {} 組織角色 於 {} 組織'],
    ['assigned the {} team to the {} organization role in the {} organization', '將 {} 團隊指派到 {} 組織角色 於 {} 組織'],
    ['unassigned {} from the {} organization role in the {} organization', '將 {} 從 {} 組織角色中取消指派 於 {} 組織'],
    ['unassigned the {} team from the {} organization role in the {} organization', '將 {} 團隊從 {} 組織角色中取消指派 於 {} 組織'],
    // 分支保护（第一个槽位是分支名称模式）
    ['Enabled branch protection for {} on {}', '為 {} 啟用了分支保護 於 {}'],
    ['Disabled branch protection for {} on {}', '為 {} 停用了分支保護 於 {}'],
    [
      'Exported results are truncated. Size limit reached for the requested time range. Please, try a smaller time range or the {} for complete results.',
      '匯出結果已截斷。所要求的時間範圍已達大小上限。請縮小時間範圍，或使用 {} 取得完整結果。'
    ],
    // 审核日志事件说明（槽位顺序不能调换）
    ['Added themselves to the {} team', '將自己加入 {} 團隊'],
    ['Created the team {}', '建立了團隊 {}'],
    ['Renamed organization from {} to {}', '將組織從 {} 重新命名為 {}'],
    ['Created the ruleset {} in {}', '建立了規則集 {} 於 {}'],
    ['Budget was {} with a limit of {#} ({}). {}', '{}預算，限額為 {#}（{}）。{}'],
    ['Updated Codespaces ownership to User in {}', '在 {} 中將程式碼空間擁有權更新為使用者'],
    ['Created the {} organization', '建立了 {} 組織'],
    ['Added themselves to the {} organization with {} permission', '將自己加入 {} 組織並取得 {} 權限'],
    ['Created the label {}', '建立了標籤 {}'],
    ['Set policy to default workflow token permission to read for {}', '為 {} 將預設工作流程權杖權限政策設為讀取'],
    [
      'Set policy to default workflow token can create or approve PR to false for {}',
      '為 {} 將預設工作流程權杖可建立或核准 PR 政策設為 false'
    ],
    [
      'Members can no longer create and use deploy keys to repositories in the {} organization.',
      '成員無法再為 {} 組織中的儲存庫建立和使用部署金鑰。'
    ]
  ],
  ignore: [
    // 审核日志条目展开后的原始字段表（字段名与取值照原文）
    '.entry-details-table'
  ]
} satisfies PageDictionary
