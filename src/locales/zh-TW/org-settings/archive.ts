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

/**
 * 存档与日志：预定提醒（组织）、赞助日志、审核日志、源 IP 显示、已删除的存储库。
 * 个人设置已收录的审核日志、赞助日志、已删除存储库的通用文字不再重复；这里只补组织独有的部分和本页正则。
 * 审核日志搜索建议等短语在个人设置是 scoped，本页面类型另收一份，译法一致。
 * 术语：scheduled reminders → 排定的提醒，audit log → 稽核記錄，restore → 還原，disclosure → 揭露。
 */
export default {
  static: {
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
  ]
} satisfies PageDictionary
