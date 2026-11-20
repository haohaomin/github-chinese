import type { PageDictionary } from '../../../core/types'
import { DURATION_SOURCE, formatDuration, RUN_STATUS, RUN_STATUS_LABEL_SOURCE, RUN_STATUS_LABELS } from './format'

/**
 * Actions 标签页：侧栏、工作流运行列表、筛选栏、单个工作流页（菜单、状态徽章、禁用 / 启用、横幅）、
 * 手动运行（workflow_dispatch）对话框、删除运行对话框。
 * 末尾的 Pin X、Download X、Delete X 等宽泛规则须排在其他文件的具体规则之后。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 筛选键（小写） */
const FILTER_KEYS: Readonly<Record<string, string>> = {
  workflow: '工作流程',
  event: '事件',
  status: '狀態',
  branch: '分支',
  actor: '執行者'
}

const FILTER_KEY_SOURCE = Object.keys(FILTER_KEYS).join('|')

/** 筛选建议的提供方名称（建议项 aria-label 末尾：ci, Workflow） */
const FILTER_PROVIDERS: Readonly<Record<string, string>> = {
  Workflow: '工作流程',
  Event: '事件',
  Status: '狀態',
  Branch: '分支',
  Actor: '執行者'
}

/** 排除建议的筛选键：Exclude workflow、Exclude is */
const EXCLUDE_KEYS: Readonly<Record<string, string>> = { ...FILTER_KEYS, is: '狀態', key: '鍵' }

/** 取值为用户内容的提供方：筛选框建议项（按 aria-label 原文或译文识别）与表头筛选面板（按输入框 aria-label 识别） */
const USER_VALUE_PROVIDERS = ['Workflow', 'Event', 'Branch', 'Actor']
const USER_VALUE_FILTERS = ['workflow', 'event', 'branch', 'actor']

// 译文写法须与 suggestionLabel 的输出（ci，工作流程）、static 的 Filter workflow options → 篩選工作流程選項 逐字一致
const SUGGESTION_VALUE_IGNORE =
  `li[role="option"]:is(${USER_VALUE_PROVIDERS.flatMap(name => [
    `[aria-label$=", ${name}"]`,
    `[aria-label$="，${FILTER_PROVIDERS[name]}"]`
  ]).join(', ')})` + ' :is([class*="displayName__"], [data-component="ActionList.Description"])'

const HEADER_FILTER_VALUE_IGNORE =
  `[data-component="SelectPanel"]:has(input:is(${USER_VALUE_FILTERS.flatMap(key => [
    `[aria-label="Filter ${key} options"]`,
    `[aria-label="篩選${FILTER_KEYS[key]}選項"]`
  ]).join(', ')}))` + ' [role="option"] :is([data-component="ActionList.Item.Label"], [data-component="ActionList.Description"])'

/** 筛选建议项的 aria-label：ci, Workflow；Success, Status；main (default), Branch */
function suggestionLabel(value: string, provider: string): string {
  const text = provider === 'Status' ? (pick(RUN_STATUS, value) ?? value) : value.replace(/ \(default\)$/, '（預設）')
  return `${text}，${pick(FILTER_PROVIDERS, provider)}`
}

/** completed successfully: Run 27404 of ci. perf(...) → 成功完成：ci 第 27404 次執行。perf(...) */
function runLabel(status: string, number: string, workflow: string, title: string): string {
  const prefix = pick(RUN_STATUS_LABELS, `${status}:`) ?? `${status}：`
  return `${prefix}${workflow} 第 ${number} 次執行。${title}`
}

/** 入门引导任务名（服务端数据，组织概述的入门任务列表同样展示）：已知任务用中文，其余保留原文 */
const ONBOARDING_TASKS: Readonly<Record<string, string>> = {
  'Run a continuous integration test': '執行持續整合測試',
  'Invite your first member': '邀請第一位成員',
  "Customize members' permissions": '自訂成員權限',
  'Customize members’ permissions': '自訂成員權限',
  'Create a pull request': '建立拉取請求',
  'Create a branch protection rule': '建立分支保護規則',
  'Auto-assign new issues': '自動指派新議題'
}

const DURATION_RE = new RegExp(`^${DURATION_SOURCE}$`)

/** 自动刷新间隔：30s、1m、Off */
function refreshInterval(label: string): string {
  if (label === 'Off') return '關閉'
  return DURATION_RE.test(label) ? formatDuration(label) : label
}

/** 运行数量：2500+ workflow runs → 2500+ 次工作流程執行；37 workflow run results → 37 項工作流程執行結果 */
function runCount(count: string, results: string): string {
  return results ? `${count} 項工作流程執行結果` : `${count} 次工作流程執行`
}

export default {
  static: {
    // 侧栏
    'Show more workflows...': '顯示更多工作流程...',
    'Show more workflows…': '顯示更多工作流程…',
    'Actions workflows': '動作工作流程',
    'Actions management': '動作管理',
    'Open Actions': '開啟動作',
    'Usage metrics': '使用量指標',
    'Performance metrics': '效能指標',
    Attestations: '證明',
    Lockfile: '鎖定檔',
    'Filter workflows...': '篩選工作流程...',
    'Filter workflows…': '篩選工作流程…',
    'Search workflows': '搜尋工作流程',
    'Sort workflows': '排序工作流程',
    'Name (A–Z)': '名稱 (A–Z)',
    'Name (Z–A)': '名稱 (Z–A)',
    'Last run (Newest first)': '上次執行（由新到舊）',
    'Last run (Oldest first)': '上次執行（由舊到新）',
    'Loading workflows…': '正在載入工作流程…',
    'Loading workflows...': '正在載入工作流程...',
    'Try loading workflows again': '重新載入工作流程',
    'Could not load workflows': '無法載入工作流程',
    'Could not load workflows. Try again.': '無法載入工作流程。請再試一次。',
    'No matching workflows': '沒有相符的工作流程',
    'No matching workflows.': '沒有相符的工作流程。',
    'No workflows found': '找不到工作流程',
    'Pin workflow': '釘選工作流程',
    'Unpin workflow': '取消釘選工作流程',
    'Unpin this workflow?': '要取消釘選此工作流程嗎？',
    'This action will unpin the workflow for all viewers of this repository.': '此動作會為此儲存庫的所有檢視者取消釘選該工作流程。',
    'Yes, unpin': '是，取消釘選',
    'This workflow does not exist.': '此工作流程不存在。',
    'The workflow may have been renamed or deleted.': '此工作流程可能已重新命名或刪除。',
    'View all workflows': '查看所有工作流程',
    'Unable to load workflow runs': '無法載入工作流程執行',
    'There was a problem loading workflow runs. Reload the page to try again.': '載入工作流程執行時發生問題。請重新載入頁面再試一次。',
    'Reload page': '重新載入頁面',

    // 运行列表
    'Showing runs from all workflows': '顯示所有工作流程的執行',
    'Filter workflow runs': '篩選工作流程執行',
    'Search runs': '搜尋執行',
    Workflows: '工作流程',
    'Workflow runs': '工作流程執行',
    'Workflow runs results': '工作流程執行結果',
    'Workflow run filters': '工作流程執行篩選器',
    'Auto-refresh': '自動重新整理',
    'Auto-refresh is only available on the first page': '僅第一頁可自動重新整理',
    'Every 10 seconds': '每 10 秒',
    'Every 30 seconds': '每 30 秒',
    'Every minute': '每分鐘',
    'Every 5 minutes': '每 5 分鐘',
    'Refresh now': '立即重新整理',
    'Loading workflow runs': '正在載入工作流程執行',
    'No workflow runs found': '找不到工作流程執行',
    'You have hit the limit of pages.': '已達頁數上限。',
    'You could filter by': '你可以依',
    'to continue reviewing older workflow runs.': '篩選，以繼續查看較早的工作流程執行。',
    'You could search': '你可以搜尋',
    'all workflow runs': '所有工作流程執行',
    'or try different filters.': '或嘗試其他篩選器。',
    'This workflow has no runs yet.': '此工作流程尚未執行過。',
    'There are no workflow runs yet.': '尚無工作流程執行。',
    'You can narrow down the results and go further in time using the': '你可以使用',
    'filter or the other filters available.': '篩選器或其他可用的篩選器縮小結果範圍，並查看更早的執行。',
    'Help us improve GitHub Actions': '協助我們改善 GitHub 動作',
    'Tell us how to make GitHub Actions work better for you with three quick questions.':
      '透過三個簡短問題告訴我們如何讓 GitHub 動作更適合你。',
    'Codespaces Prebuilds': '程式碼空間預先建置',
    'Showing all prebuild configuration runs for Codespaces. Learn about': '顯示程式碼空間所有預先建置設定的執行。瞭解',
    'prebuilding your codespaces.': '如何預先建置程式碼空間。',
    'Run duration': '執行時間',
    'This is the workflow execution time which may be different than the billed time.': '這是工作流程的執行時間，可能與計費時間不同。',
    'Disruptive workflow run': '干擾性工作流程執行',
    'This workflow run has been marked as disruptive': '此工作流程執行已標示為干擾性執行',
    '(Unknown event)': '（未知事件）',

    // 运行状态图标的无障碍前缀
    ...RUN_STATUS_LABELS,

    // 运行菜单与删除对话框
    'Cancel run': '取消執行',
    'View workflow file': '查看工作流程檔案',
    'Delete workflow run': '刪除工作流程執行',
    'Are you sure you want to permanently delete this workflow run?': '確定要永久刪除此工作流程執行嗎？',
    'Yes, delete this workflow run': '是，刪除此工作流程執行',
    'Workflow run deleted successfully.': '已刪除工作流程執行。',
    'Loading workflow run delete warning': '正在載入工作流程執行的刪除警告',
    'Invalid workflow run delete warning response': '工作流程執行的刪除警告回應無效',
    'The following pull request may not be able to be merged if this run is deleted:': '刪除此執行後，下列拉取請求可能無法合併：',
    'The following pull requests may not be able to be merged if this run is deleted:': '刪除此執行後，下列拉取請求可能無法合併：',
    'Open pull request:': '開放中的拉取請求：',
    'Closed pull request:': '已關閉的拉取請求：',
    'The workflow run action could not be completed.': '無法完成工作流程執行的動作。',
    'The workflow run action returned an invalid response.': '工作流程執行的動作傳回無效的回應。',

    // 筛选栏
    'Filter by Workflow': '依工作流程篩選',
    'Filter by Event': '依事件篩選',
    'Filter by Status': '依狀態篩選',
    'Filter by Branch': '依分支篩選',
    'Filter by Actor': '依執行者篩選',
    'Filter workflow options': '篩選工作流程選項',
    'Filter event options': '篩選事件選項',
    'Filter status options': '篩選狀態選項',
    'Filter branch options': '篩選分支選項',
    'Filter actor options': '篩選執行者選項',
    'Filter by workflow': '依工作流程篩選',
    'Filter by the event that triggered a workflow run': '依觸發工作流程執行的事件篩選',
    'Filter by workflow run status': '依工作流程執行狀態篩選',
    'Filter by the workflow run branch': '依工作流程執行的分支篩選',
    'Filter by the actor who triggered a workflow run': '依觸發工作流程執行的執行者篩選',
    'Filter menus are not available for complex queries.': '複雜查詢無法使用篩選器選單。',
    'Adding this filter would make your query too long. Use the filter input instead.': '加入此篩選器會使查詢過長。請改用篩選器輸入框。',
    'No matching events.': '沒有相符的事件。',
    'Find an event': '尋找事件',
    'Find a status': '尋找狀態',
    'Find a user': '尋找使用者',
    // 筛选框建议列表中筛选键的组合 aria-label：<名称>, Filter, <说明>（Filter 为名词，作「篩選器」）
    'Workflow, Filter, Filter by workflow': '工作流程，篩選器，依工作流程篩選',
    'Event, Filter, Filter by the event that triggered a workflow run': '事件，篩選器，依觸發工作流程執行的事件篩選',
    'Status, Filter, Filter by workflow run status': '狀態，篩選器，依工作流程執行狀態篩選',
    'Branch, Filter, Filter by the workflow run branch': '分支，篩選器，依工作流程執行的分支篩選',
    'Actor, Filter, Filter by the actor who triggered a workflow run': '執行者，篩選器，依觸發工作流程執行的執行者篩選',
    'Creation date, Filter, Creation date': '建立日期，篩選器，建立日期',
    // 缓存筛选
    'Key, Filter, Filter by cache key': '鍵，篩選器，依快取鍵篩選',
    'Branch, Filter, Filter by branch': '分支，篩選器，依分支篩選',

    // 单个工作流页
    'Workflow options': '工作流程選項',
    'Show workflow options': '顯示工作流程選項',
    'More workflow actions': '更多工作流程動作',
    'Create status badge': '建立狀態徽章',
    'Disable workflow': '停用工作流程',
    'Disabling this workflow prevents future runs until it is enabled again.': '停用此工作流程後，重新啟用前都不會再執行。',
    'Enable workflow': '啟用工作流程',
    'Enabling workflow': '正在啟用工作流程',
    'Continue running workflow': '繼續執行工作流程',
    'Workflow disabled successfully.': '已停用工作流程。',
    'Workflow enabled successfully.': '已啟用工作流程。',
    'There was an error disabling this workflow.': '停用此工作流程時發生錯誤。',
    'There was an error enabling this workflow.': '啟用此工作流程時發生錯誤。',
    'Required by ruleset': '規則集要求',
    'This scheduled workflow is disabled because scheduled workflows are disabled by default in forks.':
      '此排程工作流程已停用，因為分叉中預設會停用排程工作流程。',
    'This workflow was disabled manually.': '此工作流程已手動停用。',
    'This workflow will be disabled soon because there’s no recent activity in the repository.':
      '由於此儲存庫近期沒有活動，此工作流程即將停用。',
    "This workflow will be disabled soon because there's no recent activity in the repository.":
      '由於此儲存庫近期沒有活動，此工作流程即將停用。',
    'GitHub Actions is currently disabled for this workflow.': '此工作流程目前已停用 GitHub 動作。',
    'GitHub Actions is currently disabled for your account.': '你的帳號目前已停用 GitHub 動作。',
    'GitHub Actions is currently disabled for this repository.': '此儲存庫目前已停用 GitHub 動作。',
    'Please reach out to': '請聯絡',
    'for assistance.': '以取得協助。',

    // 状态徽章
    'Status badge configuration': '狀態徽章設定',
    'Loading status badge configuration': '正在載入狀態徽章設定',
    'Status badge configuration could not be loaded.': '無法載入狀態徽章設定。',
    'The status badge URLs returned by the server were invalid.': '伺服器傳回的狀態徽章 URL 無效。',
    'Try loading the status badge configuration again.': '請重新載入狀態徽章設定。',
    'Use default branch': '使用預設分支',
    'Copy status badge Markdown': '複製狀態徽章 Markdown',

    // 手动运行
    'Run workflow': '執行工作流程',
    'Retry run': '重試執行',
    'Running workflow': '正在執行工作流程',
    'Running workflow...': '正在執行工作流程...',
    'Workflow run was successfully requested.': '已成功請求執行工作流程。',
    'This workflow has a workflow_dispatch event trigger.': '此工作流程有 workflow_dispatch 事件觸發條件。',
    'This workflow has a': '此工作流程有',
    'event trigger.': '事件觸發條件。',
    'Use workflow from': '工作流程來源',
    'Loading workflow details.': '正在載入工作流程詳細資料。',
    'Workflow details could not be loaded.': '無法載入工作流程詳細資料。',
    'Try loading the workflow details again.': '請重新載入工作流程詳細資料。',
    'Workflow details could not be loaded. Try loading the workflow details again.': '無法載入工作流程詳細資料。請重新載入詳細資料。',
    'Workflow dispatch': '工作流程分派',
    'Workflow inputs': '工作流程輸入',
    'Workflow dispatch failed': '工作流程分派失敗',
    'Workflow could not be run.': '無法執行工作流程。',
    'Workflow could not be run. Please try again.': '無法執行工作流程。請再試一次。',
    'Workflow dispatch unavailable': '無法分派工作流程',
    // Workflow does not exist or does not have a <code>workflow_dispatch</code> trigger in this branch / tag.
    // 首段两种句子共用，分支、标记合称「此參考」（同对话框 Select ref → 選擇參考），末段不加原文没有的括号
    'Workflow does not exist or does not have a': '工作流程不存在或此參考中沒有',
    'trigger in this branch.': '觸發條件。',
    'trigger in this tag.': '觸發條件。',
    'Workflow dispatch unavailable. Workflow does not exist or does not have a workflow_dispatch trigger in this branch.':
      '無法分派工作流程。工作流程不存在或此分支中沒有 workflow_dispatch 觸發條件。',
    'Workflow dispatch unavailable. Workflow does not exist or does not have a workflow_dispatch trigger in this tag.':
      '無法分派工作流程。工作流程不存在或此標記中沒有 workflow_dispatch 觸發條件。',
    'This input expects a number.': '此輸入項須為數字。',
    'No environments are configured.': '尚未設定環境。',
    'Configure environments': '設定環境',
    'Learn more about manual workflows': '瞭解手動工作流程',
    'Select ref': '選擇參考',

    // 横幅
    'Workflows aren’t being run on this forked repository': '此分叉儲存庫的工作流程未執行',
    "Workflows aren't being run on this forked repository": '此分叉儲存庫的工作流程未執行',
    'Workflows aren’t being run on this repository': '此儲存庫的工作流程未執行',
    "Workflows aren't being run on this repository": '此儲存庫的工作流程未執行',
    'Because this repository contained workflow files when it was forked, we have disabled them from running on this fork. Make sure you understand the configured workflows and their expected usage before enabling Actions on this repository.':
      '此儲存庫在分叉時包含工作流程檔案，因此我們已在此分叉中停用這些工作流程。在此儲存庫啟用動作前，請確認你瞭解所設定的工作流程及其預期用途。',
    'Because this repository contained workflow files when it was forked, we have disabled them from running on this fork. Make sure you understand the configured workflows and their expected usage before enabling Actions on this repository. Some GitHub features that depend on Actions may still be able to run.':
      '此儲存庫在分叉時包含工作流程檔案，因此我們已在此分叉中停用這些工作流程。在此儲存庫啟用動作前，請確認你瞭解所設定的工作流程及其預期用途。部分仰賴動作的 GitHub 功能可能仍可執行。',
    'I understand my workflows, go ahead and enable them': '我瞭解我的工作流程，啟用它們',
    'Enable Actions on this repository': '在此儲存庫啟用動作',
    'Enabling Actions': '正在啟用動作',
    'View the workflows directory': '查看工作流程目錄',
    'GitHub Actions is not currently enabled on this repository. Some GitHub features that depend on Actions may still be able to run.':
      '此儲存庫目前未啟用 GitHub 動作。部分仰賴動作的 GitHub 功能可能仍可執行。',
    'GitHub Actions has been enabled': '已啟用 GitHub 動作',
    'There was an error enabling GitHub Actions': '啟用 GitHub 動作時發生錯誤',
    'Actions Enabled.': '已啟用動作。',
    'GitHub Actions usage limit': 'GitHub 動作使用量上限',
    // Your account has reached its current usage limit for <b>Actions</b>.（与「動作」拼成「…的產品為動作。」，原文无标点，不加冒号）
    'Your account has reached its current usage limit for': '你的帳號已達到目前使用量上限的產品為',
    'Get in touch with our customer support team to continue.': '聯絡我們的客戶支援團隊以繼續。',
    'Please contact your admin to continue.': '請聯絡管理員以繼續。',
    'GitHub Actions is not available for private repositories on legacy per-repository billing plans.':
      '採用舊版依儲存庫計費方案的私人儲存庫無法使用 GitHub 動作。',
    'Please visit your billing settings to upgrade your account.': '請前往帳務設定升級帳號。',
    'GitHub Actions is not available for private repositories on legacy per-repository billing plans. Please visit your billing settings to upgrade your account.':
      '採用舊版依儲存庫計費方案的私人儲存庫無法使用 GitHub 動作。請前往帳務設定升級帳號。',
    // The billing plan for <span>拥有者</span> does not include access to GitHub Actions. …（拼成「帳號 octocat 的計費方案…」）
    'The billing plan for': '帳號',
    'does not include access to GitHub Actions. Please contact the organization owner or billing manager for questions about the current billing plan':
      '的計費方案不包含 GitHub 動作的使用權。如對目前的計費方案有疑問，請聯絡組織擁有者或帳務管理員',
    'Your account’s billing is currently locked. Please update your payment information.': '你帳號的帳務目前已鎖定。請更新付款資訊。',
    "Your account's billing is currently locked. Please update your payment information.": '你帳號的帳務目前已鎖定。請更新付款資訊。',
    'GitHub Actions workflows can’t be executed on this repository.': '無法在此儲存庫執行 GitHub 動作工作流程。',
    "GitHub Actions workflows can't be executed on this repository.": '無法在此儲存庫執行 GitHub 動作工作流程。',
    'Learn more about GitHub Actions': '瞭解 GitHub 動作',
    'Learn more about GitHub Actions limits': '瞭解 GitHub 動作的限制',
    'GitHub-hosted runner capacity': 'GitHub 代管的執行器容量',
    'Upcoming change to GitHub App installation token format': 'GitHub 應用程式安裝權杖格式即將變更',
    'GitHub App installation tokens will soon use a new stateless format (ghs_...) and may be longer (~520 characters). Apps with hardcoded length assumptions may break.':
      'GitHub 應用程式安裝權杖即將改用新的無狀態格式 (ghs_...)，長度可能更長（約 520 個字元）。以硬式編碼假設長度的應用程式可能會出錯。',
    // Validate … detailed in this <a>GitHub Changelog</a>.（链接文字由 common/search 译为「GitHub 變更記錄」，原文无标点，不加逗号）
    'Validate your apps and workflows with the per-request override header detailed in this':
      '使用個別請求覆寫標頭驗證你的應用程式和工作流程的方法詳見',

    // 试用入门引导卡片
    ...ONBOARDING_TASKS,
    'This is your repository’s "Actions" tab, where you can find the jobs most recently run by your workflows. Your demo-repository includes the':
      '這是你儲存庫的「動作」分頁，可在此查看工作流程最近執行的作業。你的 demo-repository 包含',
    'workflow, which allows developers to continuously integrate new code while automatically checking for invalid HTML.':
      '工作流程，可讓開發人員在持續整合新程式碼的同時自動檢查無效的 HTML。',
    'workflow in your repository is currently configured to run automatically whenever someone pushes code, or to run manually; which you can do from this page. Just select':
      '工作流程目前設定為有人推送程式碼時自動執行，也可以在此頁面手動執行。只要選取下方的',
    'below to see it in action.': '就能查看實際執行情形。',
    'Back to onboarding': '返回入門導覽',
    'Continuous integration docs': '持續整合說明文件',
    'You completed a task!': '你完成了一項任務！',
    'Creating demo repository': '正在建立示範儲存庫',
    'See all tasks': '查看所有任務',
    'You’ve completed all your tasks!': '你已完成所有任務！',
    "You've completed all your tasks!": '你已完成所有任務！',
    'Discover more GitHub features or upgrade your plan.': '探索更多 GitHub 功能或升級方案。'
  },

  scoped: {
    Workflow: '工作流程',
    Actor: '執行者',
    Management: '管理',
    Lab: '實驗室',
    Off: '關閉',
    Excluded: '已排除',
    'See details': '查看詳細資料',
    'This action cannot be undone': '此動作無法復原',
    'Default branch': '預設分支',
    // 工作流不存在页的标题
    'Not found': '找不到',
    // 手动运行对话框：引用选择器按钮的前缀与分支名拆开时（合在一起的由正则处理）
    'Branch:': '分支：',

    // 运行描述：Commit de7a4dc pushed by octocat
    by: '由',
    'Issue comment': '議題留言',
    Scheduled: '排程執行',
    'Manually run by': '手動執行者',
    // 「Manually run」与「by」分在两个元素里时
    'Manually run': '手動執行',
    'Merge group': '合併群組',
    Discussion: '討論',
    'Discussion comment': '討論留言',
    Deployment: '部署',
    pushed: '推送',
    // 采集到的运行描述中 opened 都在 Pull request #N opened by X 里（拉取请求动词 open → 建立）
    opened: '建立',
    reopened: '重新開啟',
    closed: '關閉',
    created: '建立',
    completed: '完成',
    requested: '請求',
    rerequested: '重新請求',
    synchronize: '同步',
    stacked: '堆疊',
    labeled: '加上標籤',
    unlabeled: '移除標籤',
    edited: '編輯',
    deleted: '刪除',
    published: '發布',
    released: '發行',
    prereleased: '發布為發行前版本',
    submitted: '送出',
    // 触发事件里只有审查（pull_request_review）带 dismissed：审查 → 駁回
    dismissed: '駁回',
    assigned: '指派',
    unassigned: '取消指派',
    enqueued: '加入佇列',
    'ready for review': '標示為可供審查',
    'review requested': '請求審查',
    'checks requested': '請求檢查',
    'commented on': '留言於',
    mannequin: '佔位帳號',
    Spammy: '疑似垃圾帳號',

    // 试用入门引导卡片的功能链接与按钮
    'Client apps': '用戶端應用程式',
    'Project management': '專案管理',
    'Team administration': '團隊管理',
    'Talk to us': '聯絡我們'
  },

  regexp: [
    // 运行条目的无障碍名称
    [
      new RegExp(`^(${RUN_STATUS_LABEL_SOURCE}): Run (\\d+) of (.+?)\\.(?: (.+))?$`),
      (_, status: string, number: string, workflow: string, title: string) => runLabel(status, number, workflow, title)
    ],
    [/^(More )?actions for workflow run (\d+)$/, (_, more: string, number: string) => `工作流程執行 ${number} 的${more ? '更多' : ''}動作`],
    [/^View pull request #(\d+)$/, '查看拉取請求 #$1'],
    [/^#(\d+) \(comment\)$/, '#$1（留言）'],
    // 运行数量
    [/^([\d,]+\+?) workflow runs?( results?)?$/, (_, count: string, results: string) => runCount(count, results)],
    [/^([\d,]+) workflow runs? loaded$/, '已載入 $1 次工作流程執行'],
    [/^Workflow runs for (.+?)( results)?$/, (_, name: string, results: string) => `${name} 的工作流程執行${results ? '結果' : ''}`],
    [/^([\d,]+) workflows? shown$/, '顯示 $1 個工作流程'],
    [/^Auto-refresh: (.+)$/, (_, label: string) => `自動重新整理：${refreshInterval(label)}`],
    [
      new RegExp(`^(${DURATION_SOURCE})\\. Show run duration details$`),
      (_, duration: string) => `${formatDuration(duration)}。顯示執行時間詳細資料`
    ],
    [
      /^This workflow run has been marked as disruptive\. Workflow run ID (\d+)\.$/,
      '此工作流程執行已標示為干擾性執行。工作流程執行 ID $1。'
    ],
    [/^(\d+) pull requests? may be affected\.$/, '可能影響 $1 個拉取請求。'],
    // 筛选栏
    [
      new RegExp(`^Unable to load (${FILTER_KEY_SOURCE}) filters(\\. Try again\\.|\\.)?$`),
      (_, key: string, suffix: string) =>
        `無法載入${pick(FILTER_KEYS, key) ?? key}篩選器${suffix ? (suffix === '.' ? '。' : '。請再試一次。') : ''}`
    ],
    [/^(.+) will be ignored since log searching is not yet available$/, '因尚不支援記錄搜尋而忽略 $1'],
    [/^(.+), Excluded$/, '$1，已排除'],
    // 筛选框建议项的 aria-label：ci, Workflow；Exclude workflow
    [
      new RegExp(`^(.+), (${Object.keys(FILTER_PROVIDERS).join('|')})$`),
      (_, value: string, provider: string) => suggestionLabel(value, provider)
    ],
    [new RegExp(`^Exclude (${Object.keys(EXCLUDE_KEYS).join('|')})$`), (_, key: string) => `排除${pick(EXCLUDE_KEYS, key) ?? key}`],
    // 计划工作流因不活跃被禁用
    [
      /^This scheduled workflow is disabled because there hasn['’]t been activity in this repository for at least (\d+) days\.( Enable this workflow to resume scheduled runs\.)?$/,
      (_, days: string, resume: string) =>
        `此排程工作流程已停用，因為此儲存庫已至少 ${days} 天沒有活動。${resume ? '啟用此工作流程以恢復排程執行。' : ''}`
    ],
    [
      /^Workflow (.+) (pinned|unpinned)\.$/,
      (_, name: string, action: string) => `工作流程 ${name} 已${action === 'pinned' ? '釘選' : '取消釘選'}。`
    ],
    // 入门引导：Up next: <任务名>
    [/^Up next:(?: (.+))?$/, (_, task: string | undefined) => `下一步：${task ? (pick(ONBOARDING_TASKS, task) ?? task) : ''}`],
    // 手动运行、状态徽章的引用选择器
    [/^Use workflow from: (.+)$/, '工作流程來源：$1'],
    [/^(Branch|Tag): (.+)$/, (_, kind: string, name: string) => `${kind === 'Branch' ? '分支' : '標記'}：${name}`],
    [/^(.+) \(default\)$/, '$1（預設）'],
    // 宽泛规则：须在其他文件的具体规则之后
    [/^(Pin|Unpin) (.+)$/, (_, action: string, name: string) => `${action === 'Pin' ? '釘選' : '取消釘選'} ${name}`],
    [/^Download (.+?)(?: \(opens in a new tab\))?$/, '下載 $1'],
    [/^Delete (.+)$/, '刪除 $1']
  ],

  ignore: [
    // 侧栏工作流名
    'a[href*="/actions/workflows/"] [data-component="ActionList.Item.Label"]',
    // 单个工作流页标题
    '[data-component="PageHeader"]:has(a[href*="/.github/workflows/"]) [data-component="PH_Title"]',
    // 筛选框建议与表头筛选面板中的工作流名、事件标识符、分支名、用户名
    SUGGESTION_VALUE_IGNORE,
    HEADER_FILTER_VALUE_IGNORE
  ]
} satisfies PageDictionary
