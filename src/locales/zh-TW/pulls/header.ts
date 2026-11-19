import type { PageDictionary } from '../../../core/types'

const STATE_LABEL: Readonly<Record<string, string>> = {
  Open: '開放中',
  Closed: '已關閉',
  Merged: '已合併',
  Draft: '草稿',
  Queued: '已排入佇列'
}

/** 标签页名称（切换标签页按钮的当前项） */
const TAB_LABEL: Readonly<Record<string, string>> = {
  Conversation: '對話',
  Commits: '提交',
  Checks: '檢查',
  'Files changed': '變更的檔案'
}

/** 取消堆叠对话框的说明，也跟在「此堆疊的自動合併將會停用。」之后 */
const UNSTACK_NOTE: Readonly<Record<string, string>> = {
  'Pull requests queued for merge or already merged will remain in the stack. For pull requests that are removed, base branches will not be retargeted and commit histories will remain the same.':
    '已排入合併佇列或已合併的拉取請求將保留在堆疊中。移除的拉取請求不會重新指定基底分支，提交歷史記錄也會維持不變。',
  'All pull requests will be removed from the stack. Their base branches will not be retargeted and their commit histories will remain the same.':
    '所有拉取請求都將從堆疊中移除。其基底分支不會重新指定且提交歷史記錄維持不變。'
}

/**
 * 拉取请求详情页头部：标题、状态、分支、标签页、代码按钮、堆栈导航、顶部横幅、状态切换操作。
 * 头部句子（X wants to merge N commits into A from B）按片段收录，React 渲染的整句用正则。
 * head / base branch 作「來源分支 / 基底分支」，stack 作「堆疊」，checkout 作「簽出」，classic 作「傳統」。
 */
export default {
  static: {
    // 标签页
    'Pull request navigation': '拉取請求導覽',
    'Pull request navigation (compact)': '拉取請求導覽（精簡）',
    'Pull request tabs': '拉取請求分頁',
    'Pull request toolbar': '拉取請求工具列',

    // 标题
    'Edit pull request title': '編輯拉取請求標題',
    'Edit pull request body': '編輯拉取請求內文',
    'Pull request actions': '拉取請求動作',
    'Updating the pull request title timed out. Please try again.': '更新拉取請求標題逾時。請再試一次。',

    // 分支
    'Copy head branch name to clipboard': '複製來源分支名稱到剪貼簿',
    'Copy base branch name to clipboard': '複製基底分支名稱到剪貼簿',
    'Base branch:': '基底分支：',
    'Head branch:': '來源分支：',
    'Change base branch': '變更基底分支',
    'Cannot change base branch of stacked pull request': '無法變更堆疊式拉取請求的基底分支',
    'Are you sure you want to change the base?': '確定要變更基底分支嗎？',
    'Change base': '變更基底分支',
    'Some commits from the old base branch may be removed from the timeline, and old review comments may become outdated.':
      '舊基底分支的部分提交可能會從時間軸中移除，舊的審查留言也可能會過時。',
    'Base branch update in progress.': '正在更新基底分支。',
    'Unable to refetch commits. Please refresh the page.': '無法重新擷取提交。請重新整理頁面。',
    'Choose a base branch': '選擇基底分支',
    'The head ref may contain hidden characters:': '來源參考可能包含隱藏字元：',
    'Hidden characters warning banner': '隱藏字元警告橫幅',
    'Hidden character warning': '隱藏字元警告',

    // 代码按钮
    'Checkout with GitHub CLI': '使用 GitHub CLI 簽出',
    'Checkout with GitHub Desktop': '使用 GitHub 桌面版簽出',
    'Local checkout options': '本機簽出選項',
    'Open in a new github.dev tab': '在新的 github.dev 分頁中開啟',
    // 代码按钮的代码空间标签页：拉取请求已关闭
    'This pull request must be reopened to create new codespaces on it.': '必須重新開啟此拉取請求，才能在其上建立新的程式碼空間。',

    // 状态切换
    'Convert to draft': '轉換為草稿',
    'Mark ready for review': '標示為可供審查',
    'Pull request converted to draft': '拉取請求已轉換為草稿',
    'Pull request marked as ready for review': '拉取請求已標示為可供審查',
    // 经典页“可供审查”操作后的闪现提示
    'Marked pull request as ready for review.': '已將拉取請求標示為可供審查。',
    'Failed to convert to draft': '無法轉換為草稿',
    'An error occurred while converting this pull request to a draft. Please try again.': '將此拉取請求轉換為草稿時發生錯誤。請再試一次。',
    'Failed to mark ready for review': '無法標示為可供審查',
    'An error occurred while marking this pull request as ready for review. Please try again.':
      '將此拉取請求標示為可供審查時發生錯誤。請再試一次。',
    'Marking ready for review': '正在標示為可供審查',
    'Close pull request': '關閉拉取請求',
    'Reopen pull request': '重新開啟拉取請求',
    'Pull request closed': '拉取請求已關閉',
    'Pull request reopened': '拉取請求已重新開啟',
    'Closing pull request': '正在關閉拉取請求',
    'Reopening pull request': '正在重新開啟拉取請求',
    'Failed to close pull request': '無法關閉拉取請求',
    'Failed to reopen pull request': '無法重新開啟拉取請求',
    'An error occurred while closing this pull request. Please try again.': '關閉此拉取請求時發生錯誤。請再試一次。',
    'An error occurred while reopening this pull request. Please try again.': '重新開啟此拉取請求時發生錯誤。請再試一次。',
    'Merged pull requests cannot be reopened': '已合併的拉取請求無法重新開啟',
    'This pull request cannot be reopened because the head branch has been deleted.': '此拉取請求因來源分支已刪除而無法重新開啟。',

    // 页面错误
    'Changes cannot be loaded': '無法載入變更',

    // 堆叠式拉取请求
    'Can Stack Banner': '可堆疊橫幅',
    'This pull request can be stacked with other pull requests.': '此拉取請求可以和其他拉取請求堆疊。',
    'This pull request can be stacked with other pull requests. Review and create the stack when you’re ready.':
      '此拉取請求可以和其他拉取請求堆疊。準備好後審查並建立堆疊。',
    'This pull request can be added to': '此拉取請求可加入',
    'This pull request and other pull requests can be added to': '此拉取請求和其他拉取請求可加入',
    '. Review and update the stack when you’re ready.': '。準備好後審查並更新堆疊。',
    'Learn more about stacks': '瞭解堆疊',
    'Preview stack': '預覽堆疊',
    'Add to stack': '加入堆疊',
    'Create stack': '建立堆疊',
    'Adding to stack': '正在加入堆疊',
    'Creating stack': '正在建立堆疊',
    'Reset stack': '重設堆疊',
    'Reset to the original proposed stack': '重設為原先建議的堆疊',
    'Proposed stack of pull requests': '建議的拉取請求堆疊',
    'Loading proposed stack': '正在載入建議的堆疊',
    'Preview failed to generate': '無法產生預覽',
    'Preview failed to generate. Try refreshing the page.': '無法產生預覽。請嘗試重新整理頁面。',
    'Something unexpected happened. Please refresh the page.': '發生未預期的狀況。請重新整理頁面。',
    'Failed to create stack.': '無法建立堆疊。',
    // 预览堆栈对话框中「從預覽堆疊中移除 #N」按钮的禁用说明（remove 指移出堆栈，不是删除拉取请求）
    "You can't remove the currently viewed pull request": '無法從堆疊中移除目前查看的拉取請求',
    'You can’t remove the currently viewed pull request': '無法從堆疊中移除目前查看的拉取請求',
    'This pull request was added to': '此拉取請求已加入',
    'was created successfully': '已成功建立',
    'Maximum stack size reached': '已達堆疊大小上限',
    'to navigate down/up the stack': '在堆疊中向下/向上瀏覽',
    'Unmergeable due to a closed PR': '因有已關閉的 PR 而無法合併',
    'Copy pull request links': '複製拉取請求連結',
    'Pull request links copied': '已複製拉取請求連結',
    'Failed to copy pull request links': '無法複製拉取請求連結',
    'Unstack pull requests': '取消堆疊拉取請求',
    'Are you sure you want to unstack these pull requests?': '確定要取消堆疊這些拉取請求嗎？',
    'Unstacking pull requests in progress.': '正在取消堆疊拉取請求。',
    'Checking whether auto-merge is enabled for this stack.': '正在檢查此堆疊是否已啟用自動合併。',
    ...UNSTACK_NOTE,
    'This stack cannot be unstacked': '此堆疊無法取消堆疊',
    'Failed to load stack data.': '無法載入堆疊資料。',

    // 处理指示
    'Recent push is being processed and will appear soon': '最近的推送正在處理並即將顯示',
    'Processing updates': '正在處理更新',

    // 审查请求横幅
    'This pull request is waiting on your review.': '此拉取請求正在等待你的審查。',
    'requested your review on this pull request.': '請求你審查此拉取請求。',
    'Add your review': '新增你的審查',
    'Review request banner': '審查請求橫幅',

    // Dependabot 横幅
    'Automated security update banner': '自動安全性更新橫幅',
    'Merging this pull request will resolve a': '合併此拉取請求將解決一個',
    'Merging this pull request will resolve': '合併此拉取請求將解決',
    'Merging this pull request will resolve a Dependabot alert': '合併此拉取請求將解決一個 Dependabot 警示',
    "We noticed you haven't used Dependabot in a while, so we've paused automated Dependabot updates for this repository.":
      '你已有一段時間沒有使用 Dependabot，因此我們暫停了此儲存庫的 Dependabot 自動更新。',
    'We noticed you haven’t used Dependabot in a while, so we’ve paused automated Dependabot updates for this repository.':
      '你已有一段時間沒有使用 Dependabot，因此我們暫停了此儲存庫的 Dependabot 自動更新。',
    'To resume updates, merge a Dependabot pull request or use': '若要繼續更新，請合併 Dependabot 拉取請求或使用',
    'See open Dependabot pull requests': '查看開放中的 Dependabot 拉取請求',
    'learn more about pausing of activity.': '瞭解活動暫停。',

    // 文件更改新体验横幅
    'Welcome to the upgraded Files Changed experience': '歡迎使用新版變更的檔案頁面',
    'View in the classic experience': '在傳統體驗中查看',
    // 原文界面名无引号，译文不加
    'Some comments aren’t visible on the classic Files Changed page.': '部分留言不會顯示在傳統版變更的檔案頁面上。',
    "Some comments aren't visible on the classic Files Changed page.": '部分留言不會顯示在傳統版變更的檔案頁面上。',
    'This page has been optimized for large pull requests.': '此頁面已針對大型拉取請求最佳化。',
    'Switch to single file mode': '切換到單一檔案模式',
    'Due to the size of this pull request, only one file can be shown at a time.': '此拉取請求過大，一次只能顯示一個檔案。',
    'To view all files in a single page,': '若要在單一頁面中查看所有檔案，',
    'try a new experimental mode': '請試用新的實驗性模式'
  },
  scoped: {
    // 标签页与导航（Walkthrough 取 VS Code 繁中「逐步解說」）
    Conversation: '對話',
    'Files changed': '變更的檔案',
    Walkthrough: '逐步解說',
    Findings: '發現項目',
    Artifacts: '附件',

    // 标题与分支
    "Title can't be blank": '標題不能空白',
    'Title can’t be blank': '標題不能空白',
    from: '來自',
    'base:': '基底：',
    'compare:': '比較：',
    'Find a branch': '尋找分支',
    'Find a branch...': '尋找分支...',
    'Find a branch…': '尋找分支…',
    Branches: '分支',
    Tags: '標記',
    'This repository has been deleted': '此儲存庫已刪除',
    'unknown repository': '未知的儲存庫',
    merged: '合併了',
    closed: '關閉了',
    'Switch to the classic experience': '切換到傳統體驗',

    // 代码按钮
    'Copy command to clipboard': '將命令複製到剪貼簿',
    'Work fast with our official CLI.': '透過官方 CLI 加快工作速度。',
    'Learn more about the GitHub CLI': '瞭解 GitHub CLI',
    'Open with GitHub Desktop': '使用 GitHub 桌面版開啟',

    // 提交导航（Commits 标签页内查看单个提交）
    'No previous commit': '沒有上一個提交',
    'No next commit': '沒有下一個提交',
    Prev: '上一個',
    'Browse files': '瀏覽檔案',

    // 状态切换
    'Ready for review': '可供審查',

    // 页面错误
    'The page is unavailable due to a system error.': '頁面因系統錯誤而無法使用。',
    'Try reloading the page, or if the problem persists, contact support.': '請嘗試重新載入頁面，若問題持續發生，請聯絡支援團隊。',
    'Refresh page': '重新整理頁面',
    'Try refreshing the page.': '請嘗試重新整理頁面。',

    // 堆栈
    Unstack: '取消堆疊',
    Use: '使用',
    'Links copied!': '已複製連結！',
    'Failed to copy': '無法複製',
    "You don't have permission": '你沒有權限',
    'You don’t have permission': '你沒有權限',

    // Dependabot 横幅片段（与 security 词典同译，作用域内兜底）
    'Your first automated security update': '你的第一個自動安全性更新',
    'Dependabot security updates keep your projects secure and up-to-date.': 'Dependabot 安全性更新可確保你的專案安全且保持最新。',
    'Automated security update': '自動安全性更新',
    'You can opt out at any time in': '你隨時可以在以下位置選擇退出',
    'this repository’s settings': '此儲存庫的設定',
    "this repository's settings": '此儲存庫的設定',
    'Learn more about Dependabot security updates': '瞭解 Dependabot 安全性更新',
    'Dependabot updates are paused': 'Dependabot 更新已暫停',
    'Dependabot Alert': 'Dependabot 警示',
    'Dependabot Alerts': 'Dependabot 警示',
    'Dependabot alert': 'Dependabot 警示',
    severity: '嚴重性',
    'severity alert': '嚴重性警示',
    'severity alert.': '嚴重性警示。',
    critical: '重大',
    high: '高',
    moderate: '中',
    low: '低',
    // 严重性标签的提示（与 security 词典的严重性筛选正则同译）
    "Filter alerts by 'critical' severity.": '篩選嚴重性為「重大」的警示。',
    "Filter alerts by 'high' severity.": '篩選嚴重性為「高」的警示。',
    "Filter alerts by 'moderate' severity.": '篩選嚴重性為「中」的警示。',
    "Filter alerts by 'low' severity.": '篩選嚴重性為「低」的警示。',
    // 旧版横幅：This automated pull request fixes a <security vulnerability> …
    'This automated pull request fixes a': '此自動拉取請求修正了一個',
    'security vulnerability': '安全性漏洞',
    'Only users with access to Dependabot alerts can see this message.': '只有具備 Dependabot 警示存取權的使用者才能看到此訊息。',
    'opt out': '選擇退出',
    'Opted out of Dependabot security updates.': '已選擇退出 Dependabot 安全性更新。'
  },
  regexp: [
    // 头部摘要（React 整句；经典版数字在独立元素中，按片段收录于下方）
    [/^wants to merge (\d[\d,]*) commits? into$/, '想要將 $1 個提交合併到'],
    [/^merged (\d[\d,]*) commits? into$/, '已將 $1 個提交合併到'],
    [/^(\d[\d,]*) commits? merged into$/, '$1 個提交已合併到'],
    [/^wants to merge$/, '想要合併'],
    [/^commits? into$/, '個提交到'],
    [/^and (merged|closed)$/, (_, verb) => (verb === 'merged' ? '並合併於' : '並關閉於')],
    [/^; (merged|closed)$/, (_, verb) => (verb === 'merged' ? '；合併於' : '；關閉於')],
    // 行数统计（& 译「和」，与 commits 词典一致；原文无逗号）
    [/^Lines changed: ([\d,]+) additions? & ([\d,]+) deletions?$/, '變更行數：新增 $1 行和刪除 $2 行'],
    [/^([\d,]+) changes?: ([\d,]+) additions? & ([\d,]+) deletions?$/, '$1 處變更：新增 $2 行和刪除 $3 行'],
    // 状态标签
    [/^Pull request state: (Open|Closed|Merged|Draft|Queued)$/, (_, state) => `拉取請求狀態：${STATE_LABEL[state] ?? state}`],
    [/^Switch tab \(current: (.+)\)$/, (_, tab) => `切換分頁（目前：${TAB_LABEL[tab] ?? tab}）`],
    // 标题校验
    [/^Title can't be longer than (\d+) characters \(currently (\d+) characters\)$/, '標題不能超過 $1 個字元（目前為 $2 個字元）'],
    // 标签页标题片段：Pull Request #123
    [/^Pull Request #(\d+)$/, '拉取請求 #$1'],
    // 代码按钮：Create codespace on feature-branch（产品名按 product-names.md：codespace → 程式碼空間）
    [/^Create (?:a )?codespace on (\S+)$/, '在 $1 上建立程式碼空間'],
    // 堆栈（原文只有一个逗号，位置不另加标点）
    [/^Navigate pull request stack, position (\d+) of (\d+)$/, '瀏覽拉取請求堆疊，共 $2 個中的第 $1 個'],
    [/^Pull request stack, position (\d+) of (\d+)$/, '拉取請求堆疊，共 $2 個中的第 $1 個'],
    // 堆栈编号；堆栈创建横幅的堆栈引用不是链接时与前文是相邻的文本节点，整段命中（按片段会在「加入」后留空格）
    [/^(This pull request was added to )?[Ss]tack #(\d+)$/, (_, added, n) => `${added ? '此拉取請求已加入' : ''}堆疊 #${n}`],
    [/^[Ss]tack #$/, '堆疊 #'],
    [/^Already in stack #(\d+)$/, '已在堆疊 #$1 中'],
    [/^Remove #(\d+) from preview stack$/, '從預覽堆疊中移除 #$1'],
    // 原文只有句号：改语序代替逗号
    [/^Proposed stack loaded with (\d+) pull requests?\.$/, '已載入包含 $1 個拉取請求的建議堆疊。'],
    [/^Pull requests in stack #(\d+)$/, '堆疊 #$1 中的拉取請求'],
    [/^Auto-merge will be disabled for this stack\. (.+)$/, (_, note) => `此堆疊的自動合併將會停用。${UNSTACK_NOTE[note] ?? note}`],
    [/^Stack (Created|Updated) Banner$/, (_, verb) => (verb === 'Created' ? '堆疊已建立橫幅' : '堆疊已更新橫幅')],
    // Dependabot 横幅：… severity <Dependabot Alert> on lodash / <Dependabot Alerts> on lodash including a …
    // 整句由下方 inline 处理；不命中时按片段拼读（原文无标点，不加逗号）
    [/^on ([@\w./:-]+) including a$/, '涉及 $1 並包括一個'],
    [/^on (?!GitHub$)(?=[@\w./:-]*[A-Za-z])([@\w./:-]+)$/, '涉及 $1'],
    // Dependabot 横幅（非打开状态）
    [
      /^This pull request (would resolve|resolved) a Dependabot alert on ([@\w./:-]+)\.$/,
      (_, verb, pkg) => `此拉取請求${verb === 'resolved' ? '已解決' : '將解決'} ${pkg} 的一個 Dependabot 警示。`
    ],
    [
      /^This pull request (would resolve|resolved) a Dependabot alert$/,
      (_, verb) => `此拉取請求${verb === 'resolved' ? '已解決' : '將解決'}一個 Dependabot 警示`
    ]
  ],
  inline: [
    // Dependabot 安全更新横幅（React，<span> 内为 HTML 字符串）：包名提到警报链接之前；原文无标点，不加逗号。
    // 严重性写作「嚴重性為 X 的」，避免 critical 译出「重大嚴重性」之类的叠词。
    // Merging this pull request will resolve a <strong>high</strong> severity <a>Dependabot Alert</a> on lodash
    [/^Merging this pull request will resolve a \{\} severity \{\} on ([@\w./:-]+)$/, '合併此拉取請求將解決 $1 的一個嚴重性為{}的 {}'],
    // Merging this pull request will resolve <a>Dependabot Alerts</a> on lodash including a <strong>high</strong> severity alert
    // 不加逗号时「警示其中包括」连读不通，改作「將解決的警示涉及 X 並包括…」；槽位两侧的空白按译文
    [
      /^Merging this pull request will resolve \{\} on ([@\w./:-]+) including a \{\} severity alert$/,
      '合併此拉取請求將解決的 {}涉及 $1 並包括一個嚴重性為{}的警示'
    ]
  ]
} satisfies PageDictionary
