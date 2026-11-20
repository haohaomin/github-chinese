import type { PageDictionary } from '../../core/types'

/**
 * GitHub 功能介绍页（/features 及子页）：分区标题、功能卡片、Copilot 应用介绍、页尾号召。
 * 产品名按用户要求译成中文（Copilot、Dependabot、GitHub CLI 等品牌名保留）；
 * 页面是 Primer Brand 渲染的 React 页面，被 <b> / <span> 拆开的句子按片段收录。
 */
export default {
  scoped: {
    // 营销头部下拉菜单的分组名（只在本页面类型收录：Build 等短词全站收录会误译用户内容）
    Build: '建構',
    // 页头与分区标题
    'GitHub Features': 'GitHub 功能',
    'Explore the GitHub Platform': '探索 GitHub 平台',
    'See GitHub Copilot': '認識 GitHub Copilot',
    Plan: '規劃',
    Review: '審查',
    Ship: '交付',
    'Turn ideas into roadmap items your team can act on.': '將想法化為團隊可以執行的藍圖項目。',
    'Build with Copilot using the right model for every task across any surface.':
      '在任何介面使用 Copilot 建構，為每項任務選用合適的模型。',
    'Improve every change before it merges.': '在合併前改善每項變更。',
    'Test and deploy every change automatically.': '自動測試和部署每項變更。',
    // 规划：卡片
    'Capture requests, prioritize work, and track progress through delivery.': '收集需求、排定工作優先順序，並追蹤進度直到交付。',
    'Plan and track work in flexible tables and boards connected to your code.': '在與程式碼連結的彈性表格和看板中規劃和追蹤工作。',
    'Charts and insights': '圖表和洞察',
    'Turn project data into charts that help your team see progress.': '將專案資料轉化為圖表，協助團隊掌握進度。',
    'Repository insights': '儲存庫洞察',
    'Understand activity and contribution trends across a repository.': '了解儲存庫中的活動和貢獻趨勢。',
    // 代码：GitHub Copilot 应用（标题与「<b>GitHub Copilot app:</b> from issue to merge」）、要点、卡片
    'GitHub Copilot app: from issue to merge': 'GitHub Copilot 應用程式：從議題到合併',
    'GitHub Copilot app:': 'GitHub Copilot 應用程式：',
    'from issue to merge': '從議題到合併',
    'Download the app': '下載應用程式',
    'Delegate to agents.': '委派給代理。',
    'Start a session from an issue, a prompt, or a PR already in flight.': '從議題、提示或處理中的 PR 啟動工作階段。',
    'Centralized inbox.': '集中式收件匣。',
    'Triage issues and PRs across repos, without leaving the app.': '不必離開應用程式，即可跨儲存庫分類處理議題和 PR。',
    'Review and merge.': '審查與合併。',
    'Review diffs, check CI, and fix failing checks. Merge when you’re ready from the same window the agent works in.':
      '審查差異、檢查 CI 並修正失敗的檢查。準備就緒後，直接在代理工作的同一視窗中合併。',
    "Review diffs, check CI, and fix failing checks. Merge when you're ready from the same window the agent works in.":
      '審查差異、檢查 CI 並修正失敗的檢查。準備就緒後，直接在代理工作的同一視窗中合併。',
    'Get AI assistance as you write, understand, and improve code.': '撰寫、理解和改善程式碼時取得 AI 協助。',
    'Plan, build, and debug with Copilot right from your terminal.': '直接在終端機中使用 Copilot 規劃、建構和偵錯。',
    'Store your code, history, and docs together, with access for your whole team.': '將程式碼、歷程記錄和文件存放在一起，供整個團隊存取。',
    APIs: 'API',
    'Build integrations and automate work with GitHub data and events.': '運用 GitHub 資料和事件建構整合並自動化工作。',
    'Manage repositories, issues, and pull requests from your terminal.': '在終端機中管理儲存庫、議題和拉取請求。',
    'Visualize changes, commit code, and work with Git from a desktop app.': '在桌面應用程式中以視覺化方式檢視變更、提交程式碼並使用 Git。',
    // 审查：卡片
    'Propose changes, discuss them with teammates, and merge when ready.': '提出變更、與團隊成員討論，準備就緒後合併。',
    'Stacked pull requests': '堆疊式拉取請求',
    'Break large changes into a chain of small pull requests that are easier to review and merge.':
      '將大型變更拆分為一連串更容易審查和合併的小型拉取請求。',
    'Get AI feedback on every pull request before a teammate reviews it.': '在團隊成員審查之前，為每個拉取請求取得 AI 意見回饋。',
    'Protected branches': '受保護的分支',
    'Set requirements for reviews, checks, and who can merge changes.': '為審查、檢查以及可合併變更的人員設定要求。',
    'Get alerts for vulnerable dependencies, plus pull requests that keep them up to date.':
      '取得易受攻擊相依性的警示，以及讓相依性保持最新的拉取請求。',
    'GitHub Copilot Autofix': 'GitHub Copilot 自動修正',
    'Get suggested fixes for supported code scanning alerts.': '為支援的程式碼掃描警示取得修正建議。',
    'Code scanning': '程式碼掃描',
    'Find vulnerabilities and coding errors before they reach production.': '在弱點和程式碼錯誤進入生產環境前找出它們。',
    'Detect exposed credentials and other secrets in repositories.': '偵測儲存庫中外洩的認證和其他機密。',
    'Coordinate fixes for groups of security alerts across repositories.': '跨儲存庫協調修正成組的安全性警示。',
    'Repository rules': '儲存庫規則',
    'Apply consistent protections to branches and tags across repositories.': '跨儲存庫為分支和標記套用一致的保護。',
    // 交付：卡片
    'Automate builds, tests, deployments, and other development workflows.': '自動化建置、測試、部署和其他開發工作流程。',
    Webhooks: 'Web 鉤子',
    'Trigger integrations when events happen in your repositories or organizations.': '儲存庫或組織中發生事件時觸發整合。',
    'Run workflows on managed Linux, macOS, Windows, and other environments.':
      '在受管理的 Linux、macOS、Windows 和其他環境中執行工作流程。',
    'Run workflows on infrastructure you manage for greater control.': '在自己管理的基礎架構上執行工作流程，掌握更多控制權。',
    'Workflow templates': '工作流程範本',
    'Help teams start from shared, preconfigured workflows.': '協助團隊從共用的預先設定工作流程開始。',
    'Find actions and apps that extend your development workflow.': '尋找可擴充開發工作流程的動作和應用程式。',
    // 页尾号召
    'Ready to get started?': '準備好開始了嗎？',
    'Explore all the plans to find the solution that fits your needs.': '瀏覽所有方案，找到符合需求的解決方案。',
    'View pricing plans': '檢視定價方案',
    // 链接的无障碍名称
    'Navigate to the GitHub Copilot feature page': '前往 GitHub Copilot 功能頁面'
  }
} satisfies PageDictionary
