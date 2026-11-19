import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 工具调用汇总：动词 */
const FILE_VERB: Readonly<Record<string, string>> = {
  Edited: '編輯了',
  Created: '建立了',
  Read: '讀取了',
  Listed: '列出了'
}

/** 工具调用汇总：计数动词 + 单位 */
const COUNT_VERB: Readonly<Record<string, readonly [string, string]>> = {
  Searched: ['搜尋了', '次'],
  'Searched the web': ['在網路上搜尋了', '次'],
  Fetched: ['擷取了', '個網頁'],
  Ran: ['執行了', '個技能'],
  Asked: ['提出了', '個問題']
}

/** 工具显示名（工具调用标题“工具名: 参数”） */
const TOOL_NAME: Readonly<Record<string, string>> = {
  'Run Bash command': '執行 Bash 命令',
  'View file': '查看檔案',
  'Edit file': '編輯檔案',
  'Create file': '建立檔案',
  Search: '搜尋',
  'Search code': '搜尋程式碼',
  'Find files': '尋找檔案',
  'Apply patch': '套用修補檔',
  'Web search': '網頁搜尋',
  'Web fetch': '網頁擷取',
  'Fetch URL': '擷取 URL',
  Thinking: '思考',
  'Commit changes': '提交變更',
  'Progress update': '進度更新',
  'Start next task': '開始下一項任務',
  'Propose work': '提議工作',
  'Proposed work': '提議的工作',
  Subagent: '子代理',
  'Read agent': '讀取代理',
  'Message agent': '傳送訊息給代理'
}

/** 不是文件名的常见词（避免把 “Read more” 之类当成工具调用汇总） */
const NOT_FILE = '(?!(?:more|less|only|by|from|on|at|in|to|for|the|a|an|all|this|that|it|here|now|yet)(?: |$))'

/** 工具调用汇总的开头部分 */
const SUMMARY_HEAD = [
  `(?:Edited|Created|Read|Listed) ${NOT_FILE}\\S+(?: and \\S+|, \\S+, and \\d+ more (?:files?|director(?:y|ies)))?`,
  '(?:Searched the web|Searched|Fetched|Ran|Asked) \\d+ (?:quer(?:y|ies)|pages?|skills?|questions?)',
  'Updated plan',
  'Used \\d+ tools?',
  'Ran .+?'
].join('|')

/** 按次数汇总的工具调用 */
const TIMES_VERB: Readonly<Record<string, string>> = {
  Search: '搜尋',
  'Search code': '搜尋程式碼',
  'Web search': '網頁搜尋',
  Thought: '思考',
  'Read agents': '讀取代理',
  'Message agents': '傳送訊息給代理',
  'List agents': '列出代理'
}

/** 按数量汇总的工具调用：原文模板 → 译文模板（# 为数量） */
const COUNT_ACTION: Readonly<Record<string, string>> = {
  'Apply # patches': '套用 # 個修補檔',
  'Edit # files': '編輯 # 個檔案',
  'Create # files': '建立 # 個檔案',
  'View # files': '查看 # 個檔案',
  'Undo # edits': '復原 # 處編輯',
  'Fetch # URLs': '擷取 # 個 URL',
  'Commit # changes': '提交 # 個變更',
  'Review # changes': '審查 # 個變更',
  'Activate # skills': '啟用 # 個技能',
  'Reply to # comments': '回覆 # 則留言',
  'Run # subagent tasks': '執行 # 項子代理任務'
}

const COUNT_ACTION_SOURCE = Object.keys(COUNT_ACTION)
  .map(key => key.replace('#', '\\d+'))
  .join('|')

const TOOL_NAME_SOURCE = Object.keys(TOOL_NAME)
  .sort((a, b) => b.length - a.length)
  .join('|')

function summaryHead(head: string): string {
  const many = /^(Edited|Created|Read|Listed) (\S+), (\S+), and (\d+) more (files?|director(?:y|ies))$/.exec(head)
  if (many) {
    const unit = many[5]!.startsWith('file') ? '檔案' : '目錄'
    return `${FILE_VERB[many[1]!]} ${many[2]}、${many[3]} 和另外 ${many[4]} 個${unit}`
  }
  const two = /^(Edited|Created|Read|Listed) (\S+) and (\S+)$/.exec(head)
  if (two) return `${FILE_VERB[two[1]!]} ${two[2]} 和 ${two[3]}`
  const one = /^(Edited|Created|Read|Listed) (\S+)$/.exec(head)
  if (one) return `${FILE_VERB[one[1]!]} ${one[2]}`
  const counted = /^(Searched the web|Searched|Fetched|Ran|Asked) (\d+) (?:quer(?:y|ies)|pages?|skills?|questions?)$/.exec(head)
  if (counted) {
    const [verb, unit] = COUNT_VERB[counted[1]!] ?? [counted[1]!, '']
    return `${verb} ${counted[2]} ${unit}`
  }
  if (head === 'Updated plan') return '更新了計畫'
  const used = /^Used (\d+) tools?$/.exec(head)
  if (used) return `使用了 ${used[1]} 個工具`
  const ran = /^Ran (.+)$/.exec(head)
  return ran ? `執行了 ${ran[1]}` : head
}

/** 压缩对话时移除的内容：N token(s)、N message(s)，或二者以 and 相连 */
function removedParts(removed: string): string {
  return removed
    .split(' and ')
    .map(part => part.replace(/^([\d.,]+[kKmM]?) tokens?$/, '$1 個權杖').replace(/^([\d.,]+[kKmM]?) messages?$/, '$1 則訊息'))
    .join('和 ')
}

/**
 * Copilot 代理会话日志：工具调用标题与汇总、计划审查、权限请求、问答、差异面板、后台 shell / 子代理、
 * 取消 / 超时 / 出错状态、附件预览、内置工具（Playwright、GitHub MCP、Slack、Teams）的显示名。
 */
export default {
  static: {
    // 时间线
    'Session timeline': '工作階段時間軸',
    'Conversation turn queued for sending': '對話回合已排入佇列等待傳送',
    '· Only you can see this session': '· 只有你可以查看此工作階段',
    'Stop session': '停止工作階段',
    'Run Bash command': '執行 Bash 命令',
    'Create file': '建立檔案',
    'Find files': '尋找檔案',
    'Apply patch': '套用修補檔',
    'Web search': '網頁搜尋',
    'Fetch URL': '擷取 URL',
    'Commit changes': '提交變更',
    Thinking: '思考中',
    'Channel session history': '頻道工作階段歷史記錄',
    'User message': '使用者訊息',
    'Assistant response': '助理回應',
    'Time elapsed in this turn': '本回合經過時間',
    'Input requested': '已要求輸入',
    'Unanswered in saved history': '儲存的歷史記錄中未回答',
    'Referenced content was not included in the saved history:': '引用的內容未包含在儲存的歷史記錄中：',
    'Reasoning complete': '推理完成',
    'Waiting for confirmation': '正在等待確認',
    'Conversation compacted': '對話已壓縮',
    'Conversation compacted.': '對話已壓縮。',
    "Couldn't compact the conversation.": '無法壓縮對話。',
    'Persisted subagent history is unavailable.': '已儲存的子代理歷史記錄無法使用。',
    ', intermediate steps': '，中間步驟',
    'No logs to display': '沒有可顯示的記錄',
    'There was an error loading the logs. Please try again later.': '載入記錄時發生錯誤。請稍後再試。',
    'No events to display': '沒有可顯示的事件',
    'There’s no activity to show for this session.': '此工作階段沒有可顯示的活動。',
    'This session’s environment is offline. Its history will be available in an upcoming release.':
      '此工作階段的環境已離線。其歷史記錄將在後續版本中提供。',
    'Error parsing tool call arguments': '剖析工具呼叫引數時發生錯誤',
    'Subagent prompt': '子代理提示',

    // 取消、超时、出错
    'Session cancelled': '工作階段已取消',
    'Session error': '工作階段錯誤',
    'Session timed out': '工作階段已逾時',
    'Session aborted': '工作階段已中止',
    'The session was cancelled.': '工作階段已取消。',
    "The session was cancelled because you don't have enough AI credits to continue. Top up your quota or wait for it to reset to start a new session.":
      '由於 AI 點數不足以繼續，工作階段已取消。補充配額或等待配額重設後，再開始新的工作階段。',
    "The session was cancelled because you don't have enough AI credits to continue. Contact your organization admin to request additional usage.":
      '由於 AI 點數不足以繼續，工作階段已取消。聯絡組織管理員以申請額外使用量。',
    'The session timed out before work could be completed. For more details, see the detailed logs in GitHub Actions.':
      '工作階段在工作完成前逾時。如需詳細資訊，請查看 GitHub 動作中的詳細記錄。',
    'An unexpected error occurred. For more details, see the detailed logs in GitHub Actions.':
      '發生意外錯誤。如需詳細資訊，請查看 GitHub 動作中的詳細記錄。',
    'Aborted by user': '已由使用者中止',
    'The session disconnected. Retry to connect.': '工作階段已中斷連線。請重試連線。',
    'This session does not support live changesets.': '此工作階段不支援即時變更集。',

    // 工具调用
    'Running tool call': '正在執行工具呼叫',
    'Ran tool call': '已執行工具呼叫',
    'Updated plan': '更新了計畫',
    'Tool result': '工具結果',
    'Tool output': '工具輸出',
    'Tool execution failed': '工具執行失敗',
    'Authentication is required to continue.': '需要身分驗證才能繼續。',
    'Run shell command': '執行 shell 命令',
    'Run command': '執行命令',
    'Run PowerShell command': '執行 PowerShell 命令',
    'List PowerShell sessions': '列出 PowerShell 工作階段',
    'List Bash sessions': '列出 Bash 工作階段',
    Thought: '思考',
    'Progress update': '進度更新',
    'Reply to comment': '回覆留言',
    'File deleted': '檔案已刪除',
    'Renamed from': '重新命名自',
    '(from': '（來自',
    'Edit file(s)': '編輯檔案',
    'Task complete': '任務完成',
    'Create draft pull request': '建立草稿拉取請求',
    'List agents': '列出代理',
    'Insert lines at': '插入行於',
    'Undo edit': '復原編輯',
    'with matches': '有相符項目',
    'Propose work': '提議工作',
    'Searched the codebase': '已搜尋程式碼庫',
    'Setting up environment': '正在設定環境',
    'Custom setup step': '自訂設定步驟',
    'Run custom setup step': '執行自訂設定步驟',
    'Read pull request': '讀取拉取請求',
    'Get pull request': '取得拉取請求',
    'Get diff': '取得差異',
    'Get status': '取得狀態',
    'Get changed files': '取得變更的檔案',
    'Get reviews': '取得審查',
    'Get review comments': '取得審查留言',
    'Get comments': '取得留言',
    'Review changes with Copilot code review': '使用 Copilot 程式碼審查來審查變更',
    'Run CodeQL security scan on changed files': '對變更的檔案執行 CodeQL 安全性掃描',
    'Check changes with Copilot code review and CodeQL': '使用 Copilot 程式碼審查和 CodeQL 檢查變更',
    'Create a draft pull request': '建立草稿拉取請求',
    'Created a draft pull request': '已建立草稿拉取請求',
    'Could not create a draft pull request': '無法建立草稿拉取請求',
    'Could not create a draft pull request.': '無法建立草稿拉取請求。',
    'No pull request was created.': '未建立拉取請求。',
    'Create a repository': '建立儲存庫',
    'Could not create a repository': '無法建立儲存庫',
    'Creates a pull request for the current workspace branch, using the captured branch status and change summary.':
      '使用擷取的分支狀態和變更摘要，為目前的工作區分支建立拉取請求。',
    'The user declined to create the pull request.': '使用者拒絕建立拉取請求。',
    'Pull request creation was cancelled.': '已取消建立拉取請求。',
    'Timed out waiting for the pull request to be created.': '等待建立拉取請求時逾時。',
    'Copilot finished without creating a pull request. Check the chat for details.':
      'Copilot 已完成但未建立拉取請求。在聊天中查看詳細資料。',
    'Display GitHub references': '顯示 GitHub 參考',
    'Could not display the GitHub references': '無法顯示 GitHub 參考',
    'Displayed the GitHub references': '已顯示 GitHub 參考',
    'GitHub references': 'GitHub 參考',
    'External resource': '外部資源',
    'Preview of the viewed file': '所查看檔案的預覽',
    'Screenshot captured by the browser automation tool': '瀏覽器自動化工具擷取的螢幕截圖',
    'Generated image': '產生的圖片',
    // 标题后接查询词：無法在 GitHub 上搜尋 <query>
    'GitHub search failed for': '無法在 GitHub 上搜尋',
    'Searching GitHub for': '正在 GitHub 上搜尋',
    'Searched GitHub for': '已在 GitHub 上搜尋',
    'Collapse section': '摺疊區段',
    'Expand section': '展開區段',
    'Collapse diff content': '摺疊差異內容',

    // 日志条目的无障碍标签
    'File edit:': '檔案編輯：',
    'CLI output:': 'CLI 輸出：',
    'Copilot thought:': 'Copilot 思考：',
    'File creation:': '檔案建立：',
    'View file:': '查看檔案：',
    'Web search:': '網頁搜尋：',
    'Web fetch:': '網頁擷取：',
    'Find files:': '尋找檔案：',
    'Custom setup run:': '自訂設定執行：',
    'Propose work:': '提議工作：',
    'Code review:': '程式碼審查：',
    'CodeQL scan:': 'CodeQL 掃描：',
    'Create pull request:': '建立拉取請求：',
    'Parallel validation:': '平行驗證：',
    'Read agent:': '讀取代理：',
    'Message agent:': '傳送訊息給代理：',
    'List agents:': '列出代理：',
    'Tool output:': '工具輸出：',
    'MCP tool:': 'MCP 工具：',

    // 计划审查
    'Plan ready for review': '計畫可供審查',
    'View full plan': '查看完整計畫',
    'Review plan in full Copilot view': '在完整 Copilot 檢視中審查計畫',
    'Suggest changes': '建議變更',
    'Suggest changes...': '建議變更...',
    'Approve plan and start work': '核准計畫並開始工作',
    'Accept plan and build on autopilot': '接受計畫並以自動駕駛模式建置',
    'Accept plan and build interactively': '接受計畫並以互動方式建置',
    'Accept plan and build on autopilot fleet': '接受計畫並以自動駕駛機隊模式建置',
    'Exit plan mode and I will prompt myself': '退出規劃模式並由我自行提示',
    'Copilot will implement the plan end-to-end': 'Copilot 將端對端實作此計畫',
    'Copilot will implement the plan autonomously': 'Copilot 將自主實作此計畫',
    'Copilot will ask for confirmation at each step': 'Copilot 將在每個步驟徵求確認',
    'You will take over and prompt Copilot yourself': '由你接手並自行提示 Copilot',
    'Run plan across multiple agents in parallel': '由多個代理平行執行計畫',
    'Plan review': '計畫審查',
    'Plan approved': '計畫已核准',
    'Plan dismissed': '計畫已關閉',
    'Exited plan mode': '已退出規劃模式',
    'Requested plan changes': '已要求變更計畫',
    'User requested changes but did not provide specific feedback.': '使用者要求了變更但未提供具體意見回饋。',
    'Plan approval is handled by the established session plan surface.': '計畫核准由已建立的工作階段計畫介面處理。',
    'Established AHP session plan': '已建立的 AHP 工作階段計畫',

    // 权限请求与问答
    'Waiting for approval': '正在等待核准',
    'Awaiting approval': '等待核准',
    'Request timed out': '請求逾時',
    'Blocked by repository policy': '遭儲存庫政策阻擋',
    'Blocked by content exclusion policy': '遭內容排除政策阻擋',
    'No approval rule configured': '未設定核准規則',
    'The user rejected this tool call': '使用者拒絕了此工具呼叫',
    'Action failed': '動作失敗',
    'No decision yet': '尚未決定',
    'Allow all edits this session': '在此工作階段允許所有編輯',
    'Allow for session': '在此工作階段允許',
    "Allow and don't ask again for": '允許且不再詢問',
    'Allow and don’t ask again for': '允許且不再詢問',
    // 允許 <mcp> 在此工作階段中
    'for this session': '在此工作階段中',
    'Show previous permission request': '顯示上一個權限請求',
    'Show next permission request': '顯示下一個權限請求',
    'Permission choices': '權限選項',
    'Tool confirmation choices': '工具確認選項',
    'Waiting for the session to confirm your response.': '正在等待工作階段確認你的回應。',
    'Confirmation response could not be sent.': '無法傳送確認回應。',
    'Input required': '需要輸入',
    'Answer choices': '回答選項',
    'Type your answer...': '輸入你的回答...',
    'Freeform answer': '自由回答',
    'Other (type your answer)': '其他（輸入你的回答）',
    'Response submitted': '回應已送出',
    'Checklist item': '檢查清單項目',
    'Question table': '問題表格',

    // 差异面板
    'Changed files': '變更的檔案',
    'Changes the agent makes will appear here.': '代理所做的變更會顯示在這裡。',
    'No changes found.': '找不到變更。',
    'Loading diff…': '正在載入差異…',
    'Could not load the diff for this file.': '無法載入此檔案的差異。',
    'Binary file or no patch available.': '二進位檔案或沒有可用的修補檔。',
    'File contents are unavailable. Reconnect to the environment to load the diff.': '無法取得檔案內容。重新連線到環境以載入差異。',
    'Connection lost. Diffs will keep loading automatically once reconnected.': '連線中斷。重新連線後將自動繼續載入差異。',
    'Connection restored.': '連線已恢復。',
    'Changed file information is unavailable': '無法取得變更檔案的資訊',
    'Changed file information needs refreshing': '變更檔案的資訊需要重新整理',
    'Some information about changed files may be incomplete. Reconnect to refresh the changed files.':
      '部分變更檔案的資訊可能不完整。重新連線以重新整理變更的檔案。',
    'Close file tree': '關閉檔案樹',
    'Resize file tree': '調整檔案樹大小',
    'File tree position': '檔案樹位置',
    'Close diff overlay': '關閉差異覆疊',
    'Expand all changed files': '展開所有變更的檔案',
    'Collapse all changed files': '摺疊所有變更的檔案',
    'Diff view options': '差異檢視選項',
    'Unified view': '統一檢視',
    'Split view': '分割檢視',
    'Hide whitespace': '隱藏空白字元',
    'Failed to apply a changeset update.': '無法套用變更集更新。',
    'Failed to subscribe to the changeset.': '無法訂閱變更集。',

    // 附件与预览
    'Task artifacts': '任務附件',
    'Show artifacts': '顯示附件',
    'Hide artifacts': '隱藏附件',
    'This artifact is unavailable': '此附件無法使用',
    'Azure DevOps resource': 'Azure DevOps 資源',
    'No preview available for this file.': '此檔案無法預覽。',
    'Unable to load the latest content for this file.': '無法載入此檔案的最新內容。',
    'Preview is unavailable for this file format.': '此檔案格式無法預覽。',
    'Preview is unavailable for this binary file.': '此二進位檔案無法預覽。',
    'This file is too large to preview.': '此檔案過大而無法預覽。',
    'The repository revision is unavailable.': '無法取得儲存庫修訂版本。',
    'This image does not have a supported preview URL.': '此圖片沒有支援的預覽 URL。',
    'Preview is unavailable for this file format. Download the original file instead.': '此檔案格式無法預覽。請改為下載原始檔案。',
    'Unable to load this file. It may no longer exist or you may not have access.': '無法載入此檔案。檔案可能已不存在，或你沒有存取權。',
    'File contents are unavailable.': '無法取得檔案內容。',
    'Unable to load this uploaded file.': '無法載入此上傳的檔案。',
    'This file is too large to preview. Download the original file instead.': '此檔案過大而無法預覽。請改為下載原始檔案。',
    'Unable to load this file. Please try again.': '無法載入此檔案。請再試一次。',
    'Repository exploration is unavailable until the conversation owner is known.': '確定對話擁有者之前無法瀏覽儲存庫。',
    'Select repository to explore': '選擇要瀏覽的儲存庫',
    'Close repo explorer': '關閉儲存庫瀏覽器',

    // 后台 shell 与子代理
    'Background activity': '背景活動',
    'Loading output…': '正在載入輸出…',
    'No output yet': '尚無輸出',
    'No longer updating': '已停止更新',
    'Shell output is no longer available.': 'Shell 輸出已無法使用。',

    // 内置工具：Playwright
    'Navigate Playwright web browser to a URL': '在 Playwright 瀏覽器中前往 URL',
    'Navigate back in Playwright web browser': '在 Playwright 瀏覽器中返回上一頁',
    'Navigate forward in Playwright web browser': '在 Playwright 瀏覽器中前往下一頁',
    'Click element in Playwright web browser': '在 Playwright 瀏覽器中按一下元素',
    'Take screenshot of Playwright web browser': '擷取 Playwright 瀏覽器的螢幕截圖',
    'Type in Playwright web browser': '在 Playwright 瀏覽器中輸入',
    'Wait for text to appear/disappear in Playwright web browser': '在 Playwright 瀏覽器中等待文字出現/消失',
    'Run JavaScript in Playwright web browser': '在 Playwright 瀏覽器中執行 JavaScript',
    'Take snapshot of page in Playwright web browser': '在 Playwright 瀏覽器中擷取頁面快照',
    'Resize Playwright web browser window': '調整 Playwright 瀏覽器視窗大小',
    'Close Playwright web browser': '關閉 Playwright 瀏覽器',
    'Press key in Playwright web browser': '在 Playwright 瀏覽器中按下按鍵',
    'Select option in Playwright web browser': '在 Playwright 瀏覽器中選擇選項',
    'Interact with dialog in Playwright web browser': '在 Playwright 瀏覽器中與對話方塊互動',
    'Get console messages from Playwright web browser': '取得 Playwright 瀏覽器的主控台訊息',
    'Drag mouse between elements in Playwright web browser': '在 Playwright 瀏覽器中於元素之間拖曳滑鼠',
    'Upload file in Playwright web browser': '在 Playwright 瀏覽器中上傳檔案',
    'Hover mouse over element in Playwright web browser': '在 Playwright 瀏覽器中將滑鼠暫留在元素上',
    'Get network requests from Playwright web browser': '取得 Playwright 瀏覽器的網路請求',

    // 内置工具：GitHub MCP
    'Get file contents from GitHub': '從 GitHub 取得檔案內容',
    'Get pull request from GitHub': '從 GitHub 取得拉取請求',
    'Get issue from GitHub': '從 GitHub 取得議題',
    'Get pull request changed files from GitHub': '從 GitHub 取得拉取請求變更的檔案',
    'List pull requests on GitHub': '列出 GitHub 上的拉取請求',
    'List branches on GitHub': '列出 GitHub 上的分支',
    'Get pull request diff from GitHub': '從 GitHub 取得拉取請求差異',
    'Get pull request comments from GitHub': '從 GitHub 取得拉取請求留言',
    'Get commit from GitHub': '從 GitHub 取得提交',
    'Search repositories on GitHub': '在 GitHub 上搜尋儲存庫',
    'Search code on GitHub': '在 GitHub 上搜尋程式碼',
    'Get issue comments from GitHub': '從 GitHub 取得議題留言',
    'List issues on GitHub': '列出 GitHub 上的議題',
    'Search pull requests on GitHub': '在 GitHub 上搜尋拉取請求',
    'List commits on GitHub': '列出 GitHub 上的提交',
    'Get pull request status from GitHub': '從 GitHub 取得拉取請求狀態',
    'Search issues on GitHub': '在 GitHub 上搜尋議題',
    'Get pull request reviews from GitHub': '從 GitHub 取得拉取請求審查',
    'Download GitHub Actions workflow run artifact': '下載 GitHub 動作工作流程執行成品',
    'Get GitHub Actions job logs': '取得 GitHub 動作作業記錄',
    'Get GitHub Actions workflow run': '取得 GitHub 動作工作流程執行',
    'Get GitHub Actions workflow run logs': '取得 GitHub 動作工作流程執行記錄',
    'Get GitHub Actions workflow usage': '取得 GitHub 動作工作流程使用量',
    'List GitHub Actions workflow jobs': '列出 GitHub 動作工作流程作業',
    'List GitHub Actions workflow run artifacts': '列出 GitHub 動作工作流程執行成品',
    'List GitHub Actions workflow runs': '列出 GitHub 動作工作流程執行',
    'List GitHub Actions workflows': '列出 GitHub 動作工作流程',
    'Check new dependencies against the GitHub Advisory Database': '對照 GitHub 公告資料庫檢查新的相依項目',
    'Store memory': '儲存記憶',
    'Read code': '讀取程式碼',
    'Store comment': '儲存留言',
    'Remove comment': '移除留言',
    'Store fix': '儲存修正',
    'Skip fix': '略過修正',
    'Semantic issue search': '語意議題搜尋',
    'Search directory': '搜尋目錄',
    'List directory': '列出目錄',
    'Search file': '搜尋檔案',

    // 内置工具：Slack、Microsoft Teams
    'Post a Slack message': '發布 Slack 訊息',
    'Add a Slack reaction': '新增 Slack 表情回應',
    'Remove a Slack reaction': '移除 Slack 表情回應',
    'Upload a file to Slack': '上傳檔案到 Slack',
    'Switch the thread to a different repo': '將討論串切換到其他儲存庫',
    'Create a Slack code channel': '建立 Slack 程式碼頻道',
    "Update a code channel's status and context bar": '更新程式碼頻道的狀態和上下文列',
    "Show a diff in a code channel's diff tab": '在程式碼頻道的差異分頁中顯示差異',
    'Show an HTML report in a code channel view tab': '在程式碼頻道的檢視分頁中顯示 HTML 報告',
    'Archive a Slack code channel': '封存 Slack 程式碼頻道',
    'Post a Microsoft Teams message': '發布 Microsoft Teams 訊息',
    'Add a Microsoft Teams reaction': '新增 Microsoft Teams 表情回應',
    'Remove a Microsoft Teams reaction': '移除 Microsoft Teams 表情回應',
    'Post an image to Microsoft Teams': '發布圖片到 Microsoft Teams',
    'Switch this conversation to a different repository': '將此對話切換到其他儲存庫',
    'Show or update the Microsoft Teams task plan': '顯示或更新 Microsoft Teams 任務計畫',
    'Switch the model for this conversation': '切換此對話的模型',
    'Choose a model for this conversation': '為此對話選擇模型'
  },
  scoped: {
    Plan: '計畫',
    Revise: '修訂',
    Rejected: '已拒絕',
    Accepted: '已接受',
    Declined: '已拒絕',
    Question: '問題',
    Answer: '回答',
    Started: '已開始',
    Output: '輸出',
    Input: '輸入',
    Removed: '已移除',
    Listed: '已列出',
    Searched: '已搜尋',
    Fetched: '已擷取',
    Ran: '已執行',
    Asked: '已詢問',
    Left: '左側',
    Right: '右側'
  },
  regexp: [
    // 工具调用汇总
    [/^(\d+) tool calls?$/, '$1 個工具呼叫'],
    [/^(\d+) tool calls? failed$/, '$1 個工具呼叫失敗'],
    [
      new RegExp(`^(${SUMMARY_HEAD})(?: and (\\d+) other tool calls?)?(?:, (\\d+) failed)?$`),
      // 原文 and 处无标点：以「和另外」连接；逗号随原文
      (_, head: string, others: string, failed: string) =>
        `${others ? joinCjk(summaryHead(head), `和另外 ${others} 個工具呼叫`) : summaryHead(head)}${failed ? `，${failed} 個失敗` : ''}`
    ],
    [
      /^(Search|Search code|Web search|Thought|Read agents|Message agents|List agents) (\d+) times$/,
      (_, verb: string, count: string) => `${TIMES_VERB[verb] ?? verb} ${count} 次`
    ],
    [
      new RegExp(`^(?:${COUNT_ACTION_SOURCE})$`),
      (match: string) => {
        const count = /\d+/.exec(match)?.[0] ?? ''
        return (COUNT_ACTION[match.replace(count, '#')] ?? '').replace('#', count)
      }
    ],
    [/^Insert at (\d+) locations$/, '在 $1 處插入'],
    [/^(\d+) progress updates$/, '$1 次進度更新'],
    [/^(\d+) operations$/, '$1 項操作'],

    // 工具调用标题
    [new RegExp(`^(${TOOL_NAME_SOURCE}): (.+)$`), (_, tool: string, detail: string) => `${TOOL_NAME[tool] ?? tool}：${detail}`],
    [/^Activate (.+) skill$/, '啟用 $1 技能'],
    [/^Run "(.+)" custom setup step$/, '執行「$1」自訂設定步驟'],
    [/^Read pull request \((.+)\)$/, '讀取拉取請求 ($1)'],
    [
      /^Read pull request(?: \((.+?)\))? on ([\w.-]+\/[\w.-]+)#(\d+)$/,
      (_, method: string, repo: string, number: string) => `讀取拉取請求${method ? ` (${method})` : ''} ${repo}#${number}`
    ],
    [/^Call to (.+)$/, '呼叫 $1'],
    [
      /^(Send input to|Read logs from|Stop) (Bash|PowerShell) session (\S+)$/,
      (_, action: string, shell: string, id: string) =>
        `${action === 'Stop' ? '停止' : action === 'Read logs from' ? '讀取' : '向'} ${shell} 工作階段 ${id}${action === 'Send input to' ? ' 傳送輸入' : action === 'Read logs from' ? ' 的記錄' : ''}`
    ],
    [/^Start or send input to long-running Bash session (\S+)$/, '啟動長時間執行的 Bash 工作階段 $1 或向其傳送輸入'],
    [/^View logs from long-running Bash session (\S+)$/, '查看長時間執行的 Bash 工作階段 $1 的記錄'],
    [/^Stop long-running Bash session (\S+)$/, '停止長時間執行的 Bash 工作階段 $1'],
    [/^Couldn['’]t compact the conversation: (.+)$/, '無法壓縮對話：$1'],
    [/^Conversation compacted, removing (.+)\.$/, (_, removed: string) => `對話已壓縮，移除了 ${removedParts(removed)}。`],
    [/^The model could not run: (.+)$/, '模型無法執行：$1'],
    [/^(.+) could not run: (.+)$/, '$1 無法執行：$2'],
    [/^(.+) subagent (timeline|activity)$/, (_, name: string, kind: string) => `${name} 子代理${kind === 'timeline' ? '時間軸' : '活動'}`],
    [/^Expand diff to show all (\d+) lines$/, '展開差異以顯示全部 $1 行'],
    [/^Collapse (\d+) lines$/, '摺疊 $1 行'],
    [/^Show all (\d+) lines$/, '顯示全部 $1 行'],
    [/^Created repository ([\w.-]+\/[\w.-]+)$/, '已建立儲存庫 $1'],
    [/^Loading tools from (.+)\.\.\.$/, '正在從 $1 載入工具...'],
    [
      /^([\w-]+(?:\[bot\])?) (reviewed|commented|requested changes)$/,
      (_, login: string, action: string) =>
        `${login} ${action === 'reviewed' ? '審查了' : action === 'commented' ? '發表了留言' : '要求了變更'}`
    ],
    [/^(\d+) review comments?$/, '$1 則審查留言'],

    // 权限请求
    [/^Allow and don['’]t ask again for (.+)$/, '允許且不再詢問 $1'],
    [/^Allow (.+) for this session$/, '在此工作階段允許 $1'],
    [
      /^Permission request (\d+) of (\d+)(?:: (.+))?$/,
      (_, current: string, total: string, title: string) => `權限請求 ${current}/${total}${title ? `：${title}` : ''}`
    ],
    [/^Question table (\d+) of (\d+)$/, '問題表格 $1/$2'],

    // 差异与输出
    [/^(\d+) files? changed$/, '已變更 $1 個檔案'],
    // grep 计数模式的结果头：数字、<span>file|files</span>、with matches 由 mergeText 合并后整句翻译
    [/^(\d+) files? with matches$/, '$1 個檔案有相符項目'],
    [/^Could not load the diff for (\d+) files\.$/, '無法載入 $1 個檔案的差異。'],
    [/^Could not load the diff for (.+)\.$/, '無法載入 $1 的差異。'],
    [/^Loading diff for (.+)$/, '正在載入 $1 的差異'],
    [/^Exited with code (\d+)$/, '以結束碼 $1 結束'],
    [/^(.+) output is no longer updating\.$/, '$1 輸出已停止更新。'],
    [/^Open (.+) output$/, '開啟 $1 輸出'],
    [/^Preview of (.+)$/, '$1 的預覽'],
    [/^(\d+) new artifacts? available\.$/, '有 $1 個新附件可用。'],
    [/^Unable to submit messages?$/, '無法送出訊息'],
    [/^Copilot finished the session before it could pick up (?:this|these) messages?$/, 'Copilot 在處理訊息前已結束工作階段']
  ],
  // grep 计数模式的结果头（3 <span>files</span> with matches）：数字与 file、files 分属不同节点，整段合并后匹配
  mergeText: ['.tmp-p-3 > span.fgColor-muted.d-block.text-small']
} satisfies PageDictionary
