import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · Web 钩子 / 集成：Web 钩子列表、添加 / 编辑表单、事件列表、最近传递与重新传递，
 * 电子邮件通知、自动链接引用、已安装的 GitHub 应用。
 * 译法沿用组织设置 Web 钩子页（org-settings/webhooks.ts，均为 scoped）。
 * 术语：webhook / hook → Web 鉤子，payload → 承載，delivery → 傳遞，endpoint → 端點，header → 標頭，
 * dismiss（警示）→ 解除、dismiss（审查、回应）→ 駁回，open（议题、拉取请求）→ 建立，prefix → 前置詞，
 * alphanumeric → 英數字元，mailing list → 郵寄清單，moderated → 受審核。
 * 事件说明按状态写作「X 已建立、編輯或刪除。」。
 */
export default {
  static: {
    // 列表
    'Add webhook': '新增 Web 鉤子',
    // 后接「Webhooks Guide」链接与句号
    "Webhooks allow external services to be notified when certain events happen. When the specified events happen, we'll send a POST request to each of the URLs you provide. Learn more in our":
      'Web 鉤子可在特定事件發生時通知外部服務。發生指定的事件時，我們會向你提供的每個 URL 傳送 POST 請求。詳情請參閱我們的',
    'Webhooks allow external services to be notified when certain events happen. When the specified events happen, we’ll send a POST request to each of the URLs you provide. Learn more in our':
      'Web 鉤子可在特定事件發生時通知外部服務。發生指定的事件時，我們會向你提供的每個 URL 傳送 POST 請求。詳情請參閱我們的',
    'Webhooks Guide': 'Web 鉤子指南',
    'We will also send events from this repository to your': '我們也會將此儲存庫的事件傳送到你的',
    'organization webhooks': '組織 Web 鉤子',
    'This hook has never been triggered.': '此 Web 鉤子從未觸發過。',
    'Last delivery was successful.': '上次傳遞成功。',
    'Last delivery was not successful.': '上次傳遞失敗。',
    // 列表项状态图标的链接（指向最近传递）
    Deliveries: '傳遞記錄',
    'Delete webhook?': '刪除 Web 鉤子？',
    'This action cannot be undone. Future events will no longer be delivered to this webhook':
      '此動作無法復原。之後的事件將不再傳遞到此 Web 鉤子',
    'Yes, delete webhook': '是，刪除 Web 鉤子',

    // 添加 / 编辑表单
    // 「We'll send a」+ POST +「request to the URL below …」：「下方 URL」前移到第一段
    "We'll send a": '我們會向下方 URL 傳送',
    'We’ll send a': '我們會向下方 URL 傳送',
    "request to the URL below with details of any subscribed events. You can also specify which data format you'd like to receive (JSON,":
      '請求，其中包含所訂閱事件的詳細資料。你也可以指定要接收的資料格式（JSON、',
    'request to the URL below with details of any subscribed events. You can also specify which data format you’d like to receive (JSON,':
      '請求，其中包含所訂閱事件的詳細資料。你也可以指定要接收的資料格式（JSON、',
    'our developer documentation': '開發人員說明文件',
    'Payload URL': '承載 URL',
    'Leave blank to remove secret': '留空以移除機密',
    "There is currently a secret configured for this webhook. If you've lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated.":
      '此 Web 鉤子目前已設定機密。如果你遺失或忘記了此機密，可以變更它，但使用此機密的所有整合都必須更新。',
    'There is currently a secret configured for this webhook. If you’ve lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated.':
      '此 Web 鉤子目前已設定機密。如果你遺失或忘記了此機密，可以變更它，但使用此機密的所有整合都必須更新。',
    // 末尾「 —」后接「Change secret」按钮：全形句号后不留空格
    "If you've lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated. —":
      '如果你遺失或忘記了此機密，可以變更它，但使用此機密的所有整合都必須更新。—',
    'If you’ve lost or forgotten this secret, you can change it, but be aware that any integrations using this secret will need to be updated. —':
      '如果你遺失或忘記了此機密，可以變更它，但使用此機密的所有整合都必須更新。—',
    'Change secret': '變更機密',
    'Change Secret': '變更機密',
    'SSL verification': 'SSL 驗證',
    'By default, we verify SSL certificates when delivering payloads.': '我們預設會在傳遞承載時驗證 SSL 憑證。',
    'Enable SSL verification': '啟用 SSL 驗證',
    ': Disabling SSL verification has serious implications.': '：停用 SSL 驗證會帶來嚴重後果。',
    // 后接「not recommended」：「停用此選項並」+「不建議」
    'SSL verification helps ensure that hook payloads are delivered to your URL endpoint securely, keeping your data away from prying eyes. Disabling this option is':
      'SSL 驗證有助於確保 Web 鉤子承載安全地傳遞到你的 URL 端點，避免資料遭到窺探。停用此選項並',
    'Disable, I understand my webhooks may not be secure': '停用，我瞭解我的 Web 鉤子可能不安全',
    'Which events would you like to trigger this webhook?': '要讓哪些事件觸發此 Web 鉤子？',
    'Let me select individual events.': '讓我選取個別事件。',
    'We will deliver event details when this hook is triggered.': '我們會在此 Web 鉤子觸發時傳遞事件詳細資料。',
    'Okay, that hook was successfully created. We sent a ping payload to test it out! Read more about it at https://docs.github.com/webhooks/#ping-event.':
      '已成功建立該 Web 鉤子。我們已傳送一個 ping 承載來測試它！詳情請參閱 https://docs.github.com/webhooks/#ping-event。',
    'Manage webhook': '管理 Web 鉤子',
    'Update webhook': '更新 Web 鉤子',
    'Okay, the hook was successfully updated.': '已成功更新該 Web 鉤子。',
    'Okay, that hook was successfully deleted.': '已成功刪除該 Web 鉤子。',
    'Hook already exists on this repository': '此儲存庫已存在相同的 Web 鉤子',
    'Delete webhook': '刪除 Web 鉤子',

    // 最近传递
    'Recent Deliveries': '最近傳遞',
    'Loading deliveries…': '正在載入傳遞記錄…',
    'Loading deliveries...': '正在載入傳遞記錄...',
    'Detailed delivery information will be shown here once the hook has been triggered.': 'Web 鉤子觸發後，詳細的傳遞資訊會顯示在這裡。',
    'Redeliver payload?': '重新傳遞承載？',
    // 「The payload will be delivered to」+ <code>URL</code> +「using the current webhook configuration.」：后半句的意思并入前一段，只留句号
    'The payload will be delivered to': '承載將依目前的 Web 鉤子設定傳遞到',
    'using the current webhook configuration.': '。',
    'Yes, redeliver this payload': '是，重新傳遞此承載',
    'Delivering payload…': '正在傳遞承載…',
    'Delivering payload...': '正在傳遞承載...',

    // 事件
    'Branch or tag creation': '分支或標記建立',
    'Branch or tag created.': '已建立分支或標記。',
    'Branch or tag deletion': '分支或標記刪除',
    'Branch or tag deleted.': '已刪除分支或標記。',
    'Branch protection configurations': '分支保護設定',
    'All branch protections disabled or enabled for a repository.': '儲存庫的所有分支保護已停用或啟用。',
    'Branch protection rule created, deleted or edited.': '分支保護規則已建立、刪除或編輯。',
    'Bypass requests for push rulesets': '推送規則集的繞過請求',
    // 回应被 dismiss 作「駁回」（同审查）
    'Push ruleset bypass request was created, cancelled, completed, received a response, or a response was dismissed.':
      '推送規則集繞過請求已建立、取消、完成、收到回應，或回應已被駁回。',
    'Bypass requests for secret scanning push protections': '機密掃描推送保護的繞過請求',
    'Secret scanning push protection bypass request was created, cancelled, completed, received a response, or a response was dismissed. Note: Delegated bypass for push protection is currently in beta and subject to change.':
      '機密掃描推送保護繞過請求已建立、取消、完成、收到回應，或回應已被駁回。注意：推送保護的委派繞過目前為測試版，可能會有變動。',
    'Secret scanning push protection bypass request was created, cancelled, completed, received a response, or a response was dismissed.':
      '機密掃描推送保護繞過請求已建立、取消、完成、收到回應，或回應已被駁回。',
    'Check run is created, requested, rerequested, or completed.': '檢查執行已建立、請求、重新請求或完成。',
    'Check suite is requested, rerequested, or completed.': '檢查套件已請求、重新請求或完成。',
    'Code scanning alerts': '程式碼掃描警示',
    'Code Scanning alert created, fixed in branch, or closed': '程式碼掃描警示已建立、在分支中修正或關閉',
    'Code Scanning alert updated. This event is triggered when the assignees or state of the alert changes. The state can be created, fixed in branch, or closed.':
      '程式碼掃描警示已更新。警示的負責人或狀態變更時會觸發此事件。狀態可以是已建立、已在分支中修正或已關閉。',
    'Dismissal requests for code scanning alerts': '程式碼掃描警示的解除請求',
    'Code scanning alert dismissal request was created, or received a response (approved or rejected).':
      '程式碼掃描警示解除請求已建立或收到回應（核准或拒絕）。',
    'Collaborator add, remove, or changed': '協作者新增、移除或變更',
    'Collaborator added to, removed from, or has changed permissions for a repository.':
      '協作者已新增至儲存庫、從儲存庫移除，或其儲存庫權限已變更。',
    'Commit or diff commented on.': '提交或差異收到留言。',
    'Custom property is created, updated, or deleted.': '自訂屬性已建立、更新或刪除。',
    'Custom property values': '自訂屬性值',
    'Custom property values are changed for a repository': '儲存庫的自訂屬性值已變更',
    'Dependabot alert auto_dismissed, auto_reopened, created, dismissed, reopened, fixed, or reintroduced.':
      'Dependabot 警示已自動解除、自動重新開啟、建立、解除、重新開啟、修正或重新引入。',
    'Dependabot alert assignees_changed, auto_dismissed, auto_reopened, created, dismissed, reopened, fixed, reintroduced, or withdrawn.':
      'Dependabot 警示的負責人已變更，或警示已自動解除、自動重新開啟、建立、解除、重新開啟、修正、重新引入或撤回。',
    'Dismissal requests for dependabot alerts': 'Dependabot 警示的解除請求',
    'Dependabot alert dismissal request was created, cancelled, or received a response (approved or rejected).':
      'Dependabot 警示解除請求已建立、取消或收到回應（核准或拒絕）。',
    'A deploy key is created or deleted from a repository.': '儲存庫中的部署金鑰已建立或刪除。',
    'Deployment statuses': '部署狀態',
    'Deployment status updated from the API.': '已透過 API 更新部署狀態。',
    'Repository was deployed or a deployment was deleted.': '儲存庫已部署或部署已刪除。',
    'Discussion comments': '討論留言',
    'Discussion comment created, edited, or deleted.': '討論留言已建立、編輯或刪除。',
    'Discussion created, edited, closed, reopened, pinned, unpinned, locked, unlocked, transferred, answered, unanswered, labeled, unlabeled, had its category changed, or was deleted.':
      '討論已建立、編輯、關閉、重新開啟、釘選、取消釘選、鎖定、解除鎖定、轉移、標示答案、取消標示答案、加上標籤、移除標籤、變更類別或刪除。',
    'Repository forked.': '儲存庫已分叉。',
    'Issue comments': '議題留言',
    'Issue comment created, edited, or deleted.': '議題留言已建立、編輯或刪除。',
    'Issue opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, milestoned, demilestoned, locked, or unlocked.':
      '議題已建立、編輯、刪除、轉移、釘選、取消釘選、關閉、重新開啟、指派、取消指派、加上標籤、移除標籤、設定里程碑、移除里程碑、鎖定或解除鎖定。',
    'Issue opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, milestoned, demilestoned, locked, unlocked, typed, untyped, field_added, or field_removed.':
      '議題已建立、編輯、刪除、轉移、釘選、取消釘選、關閉、重新開啟、指派、取消指派、加上標籤、移除標籤、設定里程碑、移除里程碑、鎖定、解除鎖定、設定類型、移除類型、新增欄位或移除欄位。',
    'Label created, edited or deleted.': '標籤已建立、編輯或刪除。',
    'Label created, edited, deleted, archived, or unarchived.': '標籤已建立、編輯、刪除、封存或取消封存。',
    'Team membership added or removed.': '團隊成員已新增或移除。',
    'Merge groups': '合併群組',
    'Merge Group requested checks, or was destroyed.': '合併群組已請求檢查或已銷毀。',
    'This particular hook is deleted.': '此 Web 鉤子已刪除。',
    'Milestone created, closed, opened, edited, or deleted.': '里程碑已建立、關閉、開啟、編輯或刪除。',
    'Org blocks': '組織封鎖',
    'A user has been blocked or unblocked.': '使用者已被封鎖或解除封鎖。',
    'Organization deleted, renamed, member invited, member added, or member removed.': '組織已刪除或重新命名，或已邀請、新增或移除成員。',
    'GitHub Packages published or updated in a repository.': '儲存庫中已發布或更新 GitHub 套件。',
    'Page builds': '頁面建置',
    'Pages site built.': '已建置頁面網站。',
    'Project cards': '專案卡片',
    'Project card created, updated, or deleted.': '專案卡片已建立、更新或刪除。',
    // 看板的 column 作「欄」
    'Project columns': '專案欄',
    'Project column created, updated, moved or deleted.': '專案欄已建立、更新、移動或刪除。',
    'Project v2 items': '專案 v2 項目',
    'Projects v2': '專案 v2',
    // 后接「this discussion」链接
    'Project item created, edited, deleted, archived, restored, converted, or reordered. Feedback is welcome in':
      '專案項目已建立、編輯、刪除、封存、還原、轉換或重新排序。歡迎將意見回饋發表於',
    'Project created, updated, or deleted.': '專案已建立、更新或刪除。',
    'Project created, updated, deleted, closed, or reopened. Feedback is welcome in':
      '專案已建立、更新、刪除、關閉或重新開啟。歡迎將意見回饋發表於',
    'Pull request review comments': '拉取請求審查留言',
    'Pull request diff comment created, edited, or deleted.': '拉取請求差異留言已建立、編輯或刪除。',
    'Pull request review threads': '拉取請求審查討論串',
    'A pull request review thread was resolved or unresolved.': '拉取請求審查討論串已解決或取消解決。',
    'Pull request reviews': '拉取請求審查',
    // 审查的 dismiss 作「駁回」
    'Pull request review submitted, edited, or dismissed.': '拉取請求審查已送出、編輯或駁回。',
    'Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, synchronized, unassigned, unlabeled, or unlocked.':
      '拉取請求已指派、停用或啟用自動合併、關閉、轉換為草稿、移除里程碑、移出佇列、編輯、加入佇列、加上標籤、鎖定、設定里程碑、建立、標示為可供審查、重新開啟、移除審查請求、請求審查、同步、取消指派、移除標籤或解除鎖定。',
    'Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, stacked, synchronized, unassigned, unlabeled, or unlocked.':
      '拉取請求已指派、停用或啟用自動合併、關閉、轉換為草稿、移除里程碑、移出佇列、編輯、加入佇列、加上標籤、鎖定、設定里程碑、建立、標示為可供審查、重新開啟、移除審查請求、請求審查、堆疊、同步、取消指派、移除標籤或解除鎖定。',
    'Git push to a repository.': '儲存庫收到 Git 推送。',
    'Registry packages': '登錄庫套件',
    'Registry package published or updated in a repository.': '儲存庫中已發布或更新登錄庫套件。',
    'Release created, edited, published, unpublished, or deleted.': '發行版本已建立、編輯、發布、取消發布或刪除。',
    'Repository created, deleted, archived, unarchived, publicized, privatized, edited, renamed, or transferred.':
      '儲存庫已建立、刪除、封存、取消封存、設為公開、設為私人、編輯、重新命名或轉移。',
    'Repository advisories': '儲存庫公告',
    'Repository advisory published or reported.': '儲存庫公告已發布或回報。',
    'Repository imports': '儲存庫匯入',
    'Repository import succeeded, failed, or cancelled.': '儲存庫匯入成功、失敗或已取消。',
    'Repository rulesets': '儲存庫規則集',
    'Repository ruleset created, deleted or edited.': '儲存庫規則集已建立、刪除或編輯。',
    'Repository vulnerability alerts': '儲存庫漏洞警示',
    'Dependabot alert (aka dependency vulnerability alert) created, resolved, or dismissed on a repository.':
      '儲存庫中的 Dependabot 警示（即相依項目漏洞警示）已建立、解決或解除。',
    'Secret scanning alert locations': '機密掃描警示位置',
    'Secrets scanning alert location created.': '已建立機密掃描警示位置。',
    'Secret scanning alerts': '機密掃描警示',
    'Secrets scanning alert created, resolved, reopened, validated, or publicly leaked.':
      '機密掃描警示已建立、解決、重新開啟、驗證或公開外洩。',
    'Secret scanning alert created, resolved, reopened, validated, publicly leaked, assigned, or unassigned.':
      '機密掃描警示已建立、解決、重新開啟、驗證、公開外洩、指派或取消指派。',
    'Dismissal requests for secret scanning alerts': '機密掃描警示的解除請求',
    'Secret scanning alert dismissal request was created, cancelled, or received a response.':
      '機密掃描警示解除請求已建立、取消或收到回應。',
    'Security and analyses': '安全性和分析',
    'Code security features enabled or disabled for a repository.': '儲存庫的程式碼安全性功能已啟用或停用。',
    // 事件名与 settings-developer/permissions.ts 的「Secret scanning scan」同译，与功能名「機密掃描」区分
    'Secret scanning scans': '機密掃描作業',
    'Secrets scanning scan completed.': '機密掃描作業已完成。',
    'A star is created or deleted from a repository.': '儲存庫已加星號或移除星號。',
    'Commit status updated from the API.': '已透過 API 更新提交狀態。',
    'Team adds': '團隊加入',
    'Team added or modified on a repository.': '團隊已加入儲存庫或已在儲存庫中修改。',
    'Team is created, deleted, edited, or added to/removed from a repository.': '團隊已建立、刪除、編輯，或已加入儲存庫/從儲存庫移除。',
    'Visibility changes': '可見度變更',
    'Repository changes from private to public.': '儲存庫從私人變更為公開。',
    'User stars a repository.': '使用者為儲存庫加星號。',
    'Wiki page updated.': 'Wiki 頁面已更新。',
    'Workflow jobs': '工作流程作業',
    'Workflow job queued, waiting, in progress, or completed on a repository.':
      '儲存庫中的工作流程作業已排入佇列、等待中、進行中或已完成。',
    'Workflow run requested or completed on a repository.': '儲存庫中的工作流程執行已請求或完成。',
    'Sub issues': '子議題',
    'Sub-issues added or removed, and parent issues added or removed.': '子議題已新增或移除，父議題已新增或移除。',
    // 议题之间的依赖作「相依關係」（同 issues/metadata.ts）；原文两个 - 夹注改作括号
    'Issue dependencies': '議題相依關係',
    'Issue dependencies - such as blocked by or blocking - added or removed.': '議題相依關係（例如受阻於或阻擋）已新增或移除。',
    'Related issues': '相關議題',
    'Related issues - such as relates to - added or removed.': '相關議題關係（例如相關）已新增或移除。',

    // 电子邮件通知
    'Setup email addresses to receive notifications when push events are triggered.': '設定在推送事件觸發時接收通知的電子郵件地址。',
    'Asterisk (*) denotes a required field': '星號 (*) 表示必填欄位',
    'Whitespace separated email addresses (at most two).': '以空白分隔的電子郵件地址（最多兩個）。',
    'Approved header': 'Approved 標頭',
    // 「Sets the」+ <code>Approved</code> + 本段
    'header to automatically approve the message in a read-only or moderated mailing list.':
      '標頭以在唯讀或受審核的郵寄清單中自動核准訊息。',
    // 「We will send notification emails to the listed addresses when a」+ <code>push</code> +「event is triggered.」：条件前移
    'We will send notification emails to the listed addresses when a': '發生',
    'event is triggered.': '事件時，我們會將通知電子郵件傳送到列出的地址。',
    'Setup notifications': '設定通知',

    // 自动连结参考
    'Add autolink reference': '新增自動連結參考',
    'References to GitHub issues, pull requests, and commits are automatically converted into links. Configure your own autolink references for non-GitHub URLs.':
      '對 GitHub 議題、拉取請求和提交的參考會自動轉換為連結。為非 GitHub 的 URL 設定你自己的自動連結參考。',
    'Learn more about automatic autolinks.': '瞭解自動連結。',
    'Autolinks can be either alphanumeric or numeric.': '自動連結可以是英數字元或純數字。',
    'Read more about the differences between the two.': '瞭解兩者的差異。',
    'No custom autolink references have been created yet.': '尚未建立自訂的自動連結參考。',
    // 「Alphanumeric autolinks match」+ <code>…</code> +「. They are not case sensitive.」
    'Alphanumeric autolinks match': '英數字元自動連結會比對',
    '. They are not case sensitive.': '。不區分大小寫。',
    'Numeric autolinks only match': '數字自動連結只會比對',
    'Reference prefix': '參考前置詞',
    'This prefix appended by a string will generate a link any time it is found in an issue, pull request, or commit.':
      '只要議題、拉取請求或提交中出現此前置詞加上字串，就會產生連結。',
    'Target URL': '目標 URL',
    // 「The URL must contain」+ <code>&lt;num&gt;</code> +「for the reference number.」
    'The URL must contain': 'URL 必須包含',
    'for the reference number.': '作為參考編號。',

    // 已安装的 GitHub 应用程序
    'Installed GitHub Apps': '已安裝的 GitHub 應用程式',
    'GitHub Apps augment and extend your workflows on GitHub with commercial, open source, and homegrown tools.':
      'GitHub 應用程式透過商業、開源和自行開發的工具，增強並擴充你在 GitHub 上的工作流程。',
    "There aren't any GitHub Apps installed on this repository.": '此儲存庫未安裝任何 GitHub 應用程式。',
    'There aren’t any GitHub Apps installed on this repository.': '此儲存庫未安裝任何 GitHub 應用程式。'
  },
  scoped: {
    'Webhooks /': 'Web 鉤子 /',
    '/ Add webhook': '/ 新增 Web 鉤子',
    // 列表项 URL 后：「(all events)」
    '(all events)': '（所有事件）',
    'all events': '所有事件',
    etc: '等',
    '). More information can be found in': '）。詳細資訊請參閱',
    'Content type': '內容類型',
    Secret: '機密',
    '(not recommended)': '（不建議）',
    'not recommended': '不建議',
    // 「Just the」+「push」+「event.」；「Send me」+「everything」+「.」
    'Just the': '僅',
    'event.': '事件。',
    'Send me': '傳送',
    everything: '所有事件',
    'Recent deliveries': '最近傳遞',
    redelivery: '重新傳遞',
    Request: '請求',
    Response: '回應',
    Redeliver: '重新傳遞',
    Headers: '標頭',
    Payload: '承載',
    Body: '內文',
    // 请求详情标签页的读屏名称（原文拼写如此，兼收正确拼写）
    'Hook request and reponse': 'Web 鉤子請求和回應',
    'Hook request and response': 'Web 鉤子請求和回應',
    // 重新传递失败提示
    'Oops, there was an error while trying to redeliver this payload.': '重新傳遞此承載時發生錯誤。',
    'Check runs': '檢查執行',
    'Check suites': '檢查套件',
    'Commit comments': '提交留言',
    'Custom property': '自訂屬性',
    'Deploy key': '部署金鑰',
    Deployments: '部署',
    Memberships: '成員身分',
    Meta: 'Web 鉤子本身',
    'this discussion': '此討論',
    Statuses: '狀態',
    Watches: '關注',
    'Workflow runs': '工作流程執行',
    'Sets the': '設定',
    Alphanumeric: '英數字元',
    Numeric: '數字',
    '/ Add new': '/ 新增',
    Suspended: '已暫停',
    'Developed by': '開發人員'
  },
  regexp: [
    // 列表：传递失败原因、删除确认（含 URL）
    [/^Last delivery was not successful\. (.+)$/, '上次傳遞失敗。$1'],
    [
      /^This action cannot be undone\. Future events will no longer be delivered to this webhook \((\S+)\)(\.?)$/,
      (_, url: string, dot: string) => `此動作無法復原。之後的事件將不再傳遞到此 Web 鉤子 (${url})${dot ? '。' : ''}`
    ],
    // 传递详细资料
    [/^Completed in ([\d.]+) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗時 ${seconds} 秒${dot ? '。' : ''}`],
    [/^The payload will be delivered to (\S+) using the current webhook configuration\.$/, '承載將依目前的 Web 鉤子設定傳遞到 $1。'],
    // 已安装的 GitHub 应用程序：整句在同一文本节点时按中文语序；被链接拆开时见 scoped 的「Developed by」
    [/^Developed by ([\w.-]+)$/, '由 $1 開發']
  ]
} satisfies PageDictionary
