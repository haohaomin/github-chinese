import type { PageDictionary } from '../../../core/types'

/** 代理会话的状态 */
const SESSION_STATES: Readonly<Record<string, string>> = {
  Working: '工作中',
  'Ready for review': '可供審查',
  Done: '已完成',
  Failed: '失敗',
  Idle: '閒置',
  'Needs attention': '需要處理',
  'Timed out': '已逾時',
  Cancelled: '已取消',
  Queued: '已排入佇列',
  Unknown: '未知',
  Merged: '已合併',
  Closed: '已關閉',
  'Queued to merge': '已排入合併佇列'
}

/** 新版首页的分区名（自定义分区对话框的“更多选项”“显示”按钮） */
const SECTIONS: Readonly<Record<string, string>> = {
  'Agent sessions': '代理工作階段',
  'Pull requests': '拉取請求',
  Issues: '議題',
  Repositories: '儲存庫',
  Feed: '動態'
}

/**
 * 登录后首页 /、/dashboard 的框架与新版首页分区：
 * 仪表板上下文切换、左侧常用存储库与团队、右侧最新变更与探索存储库、
 * 代理会话 / 拉取请求 / 议题列表、反馈对话框，
 * 旧版首页的仪表板菜单与满意度反馈，组织仪表板的新成员提示。
 * Copilot 输入框见 composer.ts。
 */
export default {
  static: {
    // 仪表板上下文切换
    'Switch dashboard context': '切換儀表板帳號',
    // 新版首页侧栏：上下文区域的读屏名称（切换菜单、常用存储库图标的读屏名称见 scoped）
    'Account context': '帳號情境',
    'Manage organizations': '管理組織',
    'Create organization': '建立組織',
    'Try the new dashboard experience': '試用新版儀表板',
    'Switch to classic dashboard': '切換到傳統儀表板',

    // 新版儀表板側邊欄：主頁切換
    'Make Home your homepage': '將首頁設為主頁',
    'Make Feed your homepage': '將動態設為主頁',
    'Pin your homepage': '釘選主頁',
    'Choose whether github.com opens to Home or Feed. Select the pin next to either one.':
      '選擇 github.com 開啟時顯示首頁或動態。選取其中一項旁的釘選圖示。',

    // 左侧栏：常用存储库、团队、最近活动
    'Top Repositories': '常用儲存庫',
    'Your teams': '你的團隊',
    'You don’t belong to any teams yet!': '你尚未加入任何團隊！',
    "You don't belong to any teams yet!": '你尚未加入任何團隊！',
    'When you take actions across GitHub, we’ll provide links to that activity here.': '你在 GitHub 上的活動連結會顯示在這裡。',
    'Create your first project': '建立你的第一個專案',
    'Ready to start building? Create a repository for a new idea or bring over an existing repository to keep contributing to it.':
      '準備好開始開發了嗎？為新點子建立儲存庫，或匯入現有儲存庫繼續貢獻。',

    // 右侧栏：最新变更、探索存储库
    'Latest changes': '最新變更',
    'View changelog →': '查看變更記錄 →',
    'Explore repositories': '探索儲存庫',
    'Explore more →': '探索更多 →',

    // 代理会话列表
    'Start an agent session to create new work or iterate on an existing project.': '開始代理工作階段，建立新工作或迭代現有專案。',
    'No sessions found. Create one by sending a prompt above.': '找不到工作階段。在上方傳送提示來建立。',
    // 名词 filter → 筛选器（分区菜单里的筛选选项）
    'No sessions found. Try a different filter, or': '找不到工作階段。試試其他篩選器，或',
    'start a session': '開始工作階段',
    'Unable to load agent tasks, try again later.': '無法載入代理任務，請稍後再試。',
    'Agent sessions options': '代理工作階段選項',
    'Agent sessions to include': '要包含的代理工作階段',
    'Agent sessions status filter': '代理工作階段狀態篩選器',
    'Open session in VS Code': '在 VS Code 中開啟工作階段',

    // 拉取请求与议题列表
    'Pull request options': '拉取請求選項',
    'Pull requests to include': '要包含的拉取請求',
    'Unable to load pull requests, try again later.': '無法載入拉取請求，請稍後再試。',
    'No pull requests found, try a different filter.': '找不到拉取請求，試試其他篩選器。',
    'Open pull request in VS Code': '在 VS Code 中開啟拉取請求',
    'Unable to load issues, try again later.': '無法載入議題，請稍後再試。',
    'No issues found, try a different filter.': '找不到議題，試試其他篩選器。',
    'Assigned to Copilot': '已指派給 Copilot',
    // 产品名按用户要求译成中文：Copilot Chat → Copilot 聊天（.harvest/scratch/followups/product-names.md）
    'Open in Copilot Chat': '在 Copilot 聊天中開啟',
    'Number of results': '結果數量',
    'Maximum age of results': '結果時間範圍',
    'No maximum': '不限',

    // 反馈对话框（句末的隐私政策链接与句号单独成节点）
    'Tell us your feedback on the new dashboard experience': '告訴我們你對新版儀表板的意見回饋',
    'Please don’t include sensitive, confidential, or personal data. Your feedback helps us improve our services in line with our':
      '請勿包含敏感、機密或個人資料。你的意見回饋將用於改善我們的服務，並遵循我們的',

    // 新版首页：分区列表与自定义分区对话框（section 译“區段”，与 code/blob 的“區段”一致）
    'Error loading repositories': '載入儲存庫時發生錯誤',
    'Issue actions': '議題動作',
    'Hide section': '隱藏區段',
    'At least one section must remain visible': '至少須保留一個可見區段',

    // 旧版首页：仪表板菜单、新版预览、满意度反馈对话框
    'Dashboard menu': '儀表板選單',
    'Dashboard preview options': '儀表板預覽選項',
    'Try the new dashboard': '試用新版儀表板',
    'Give dashboard feedback': '提供儀表板意見回饋',
    'How satisfied are you with this dashboard?': '你對此儀表板的滿意度如何？',
    'What can we improve?': '我們有哪些地方可以改進？',
    'Thanks for sharing your dashboard feedback.': '感謝你提供儀表板意見回饋。',
    // 标签页标题段
    'GitHub Dashboard': 'GitHub 儀表板',

    // 组织仪表板：新成员提示（句子被组织名、用户名链接拆开；括号内是用户名，用半角括号）
    'You’ve been added to the': '你已加入',
    "You've been added to the": '你已加入',
    'Here are some quick tips for a first-time organization member.': '以下是給組織新成員的幾個小提示。',
    'Use the switch context button in the upper left corner of this page to switch between your personal context (':
      '使用此頁面左上角的帳號切換按鈕，在你的個人帳號 (',
    ') and organizations you are a member of.': ') 和你所屬的組織之間切換。',
    'After you switch contexts you’ll see an organization-focused dashboard that lists out organization repositories and activities.':
      '切換帳號後，你會看到以組織為主的儀表板，其中列出組織的儲存庫和活動。',
    "After you switch contexts you'll see an organization-focused dashboard that lists out organization repositories and activities.":
      '切換帳號後，你會看到以組織為主的儀表板，其中列出組織的儲存庫和活動。',
    'Go to organization dashboard': '前往組織儀表板',
    'Return to your personal dashboard': '返回你的個人儀表板',
    'View organization': '查看組織',
    "Browse organization's repositories": '瀏覽組織的儲存庫',
    'Browse organization’s repositories': '瀏覽組織的儲存庫',
    'See all owners': '查看所有擁有者',
    'View your teams': '查看你的團隊',
    'View and create teams': '查看並建立團隊',
    'Member statuses': '成員狀態'
  },
  scoped: {
    // 左侧栏
    'Recent activity': '最近活動',
    'Switch back': '切換回舊版',
    // 上下文切换菜单、常用存储库图标的读屏名称
    dashboards: '儀表板',
    Repository: '儲存庫',

    // 分区列表：“查看全部”后的读屏文字、筛选菜单（分区标题“Agent sessions”、时间范围由全局词条翻译）
    sessions: '工作階段',
    issues: '議題',
    'pull requests': '拉取請求',
    Active: '使用中',
    Authored: '我建立的',
    Mentioned: '提及我的',
    'Review requested': '請求我審查的',
    Reviewed: '我審查過的',
    'Assigned to me': '指派給我的',
    'Involves me': '與我有關',
    'Issues to include': '要包含的議題',
    // 会话时间前缀：Started + <relative-time>
    Started: '開始於',
    // 留言数后的读屏文字
    comment: '則留言',
    comments: '則留言',

    // 旧版首页：满意度评分
    'Very dissatisfied': '非常不滿意',
    Dissatisfied: '不滿意',
    Satisfied: '滿意',
    'Very satisfied': '非常滿意',

    // 新版首页：自定义分区对话框（“Assign to Copilot”“Hidden”由全局词条翻译）
    Visible: '已顯示',
    'Move up': '上移',
    'Move down': '下移',

    // 组织仪表板：Welcome to the / You’ve been added to the + <组织> + organization!
    'Welcome to the': '歡迎加入',
    'organization!': '組織！'
  },
  regexp: [
    // 上下文切换按钮
    [/^Switch dashboard: (.+)$/, '切換儀表板：$1'],
    // 新版首页侧栏的上下文切换按钮（读屏名称）：Go to octocat dashboard
    [/^Go to (?!(?:the|your|my) )([A-Za-z\d][\w-]*) dashboard$/, '前往 $1 的儀表板'],
    // 拉取请求 / 议题条目说明：owner/repo#12 · Opened by octocat · Updated + <relative-time>
    // 拉取请求与议题条目共用同一模板（IssueListItem / PullRequestListItem），无法区分；
    // 拉取请求、议题的动词 open 都作“建立”（GLOSSARY.zh-TW pull request、Open 行）
    [
      /^(\S+#\d+) · Opened by (\S+) · (Updated|Created)$/,
      (_, ref, author, label) => `${ref} · 由 ${author} 建立 · ${label === 'Updated' ? '更新於' : '建立於'}`
    ],
    // 代理会话条目说明：<relative-time> · 2 revisions · Ready for review
    [
      /^· (?:([\d,]+) revisions · )?(Working|Ready for review|Done|Failed|Idle|Needs attention|Timed out|Cancelled|Queued|Unknown|Merged|Closed|Queued to merge)$/,
      (_, revisions, state) => `· ${revisions ? `${revisions} 次修訂 · ` : ''}${SESSION_STATES[state] ?? state}`
    ],
    [/^(\S+) · Initializing session\.\.\.$/, '$1 · 正在初始化工作階段...'],
    // 反馈字数
    [/^Please keep your feedback within ([\d,]+) characters or less\.$/, '意見回饋請控制在 $1 個字元以內。'],
    // 自定义分区对话框：More options for Agent sessions / Show Agent sessions
    [/^More options for (.+)$/, (_, section) => (SECTIONS[section] ? `${SECTIONS[section]}的更多選項` : `${section} 的更多選項`)],
    [new RegExp(`^Show (${Object.keys(SECTIONS).join('|')})$`), (_, section) => `顯示${SECTIONS[section] ?? section}`],
    // 组织仪表板
    [/^You[’']re an owner of the (\S+) organization!$/, '你是 $1 組織的擁有者！'],
    [/^Create a repository for (\S+)$/, '為 $1 建立儲存庫'],
    [/^Edit (\S+)[’']s settings$/, '編輯 $1 的設定'],
    // 组织的 profile 作“組織資料”（GLOSSARY.zh-TW profile 行），这里只写“公開資料”
    [/^Check out (\S+)[’']s public profile$/, '查看 $1 的公開資料'],
    // 顶部提示：删除存储库、接受 / 拒绝继任者邀请后跳转到首页
    [/^Your repository ["“]([^"”]+)["”] was successfully deleted\.$/, '儲存庫「$1」已刪除。'],
    [/^You are now the designated successor for @?([\w-]+)[’']s account\.$/, '你現在是 $1 帳號的指定繼任者。'],
    [/^You have declined to become the designated successor for @?([\w-]+)[’']s account\.$/, '你已拒絕成為 $1 帳號的指定繼任者。']
  ],
  ignore: [
    // 分区列表中的议题、拉取请求、会话标题，以及标题截断时显示完整标题的提示框
    'a[class*="ItemTitle__"] [class*="ItemTitleInner__"]',
    'a[class*="ItemTitle__"] + [class*="prc-TooltipV2-Tooltip-"]'
  ]
} satisfies PageDictionary
