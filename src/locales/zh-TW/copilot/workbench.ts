import type { PageDictionary } from '../../../core/types'

/** 差异预览中新增、删除文件的前缀 */
const FILE_CHANGE: Readonly<Record<string, string>> = {
  Added: '已新增',
  Deleted: '已刪除'
}

/** 预览工具栏的文件大小：「504 bytes」→「504 位元組」，KB / MB 等单位原样保留 */
function previewSize(size: string): string {
  return size.replace(/^(\d+) bytes?$/, '$1 位元組')
}

/**
 * Copilot 沉浸式聊天的工作台（内容预览面板）与资源面板：文件 / 差异 / 图片 / Markdown 预览、
 * Copilot 起草议题的预览与批量创建、聊天中的议题列表卡片，以及附件查看器（HTML 预览、版本历史记录、链接）。
 */
export default {
  static: {
    // 工作台
    Workbench: '工作台',
    'Workbench items': '工作台項目',
    'Open workbench': '開啟工作台',
    'Close workbench': '關閉工作台',
    'Collapse workbench': '摺疊工作台',
    'Expand workbench': '展開工作台',
    'Download all files': '下載所有檔案',
    'Close all tabs': '關閉所有分頁',
    'Press Delete to close the focussed tab.': '按 Delete 鍵關閉目前聚焦的分頁。',
    'Content preview': '內容預覽',
    'Content preview panel': '內容預覽面板',
    'View files directly within Copilot': '直接在 Copilot 中查看檔案',
    'Ask to generate a file or app, or use the button below to try it yourself.': '讓 Copilot 產生檔案或應用程式，或使用下方按鈕親自試試。',
    'Files, diffs, and issues you open will appear here.': '你開啟的檔案、差異和議題會顯示在這裡。',
    // Google 繁中的「I'm Feeling Lucky」按钮
    'I’m feeling lucky': '好手氣',
    "I'm feeling lucky": '好手氣',

    // 资源面板
    'Open resource panel': '開啟資源面板',
    'Close resource panel': '關閉資源面板',
    'Unable to load repository files': '無法載入儲存庫檔案',
    'Select a repository to view files': '選擇儲存庫以查看檔案',
    'Loading repository...': '正在載入儲存庫...',
    'Loading repository…': '正在載入儲存庫…',

    // 文件与差异预览
    'file contents': '檔案內容',
    'original file contents': '原始檔案內容',
    'modified file contents': '修改後的檔案內容',
    'unified diff view': '統一差異檢視',
    'Open file in a new tab': '在新分頁中開啟檔案',
    'Download code': '下載程式碼',
    'Reload preview page': '重新載入預覽頁面',
    'Switch to the latest version to edit this file.': '切換到最新版本以編輯此檔案。',
    // 编辑文件后的提示：你已编辑 <文件名>，后接撤销 / 还原按钮
    'You’ve edited': '你已編輯',
    "You've edited": '你已編輯',
    "HTML preview isn't available here": '這裡無法使用 HTML 預覽',
    'HTML preview isn’t available here': '這裡無法使用 HTML 預覽',
    "You can still read the file's source in the Code view.": '你仍可在程式碼檢視中閱讀檔案的原始碼。',
    'You can still read the file’s source in the Code view.': '你仍可在程式碼檢視中閱讀檔案的原始碼。',
    'Loading image…': '正在載入圖片…',
    // 無法載入 <檔名>。圖片可能已不存在，或你沒有存取權。
    'Unable to load': '無法載入',
    '. The image may no longer exist or you may not have access.': '。圖片可能已不存在，或你沒有存取權。',
    'Failed to load markdown preview': '無法載入 Markdown 預覽',
    'Loading Markdown preview…': '正在載入 Markdown 預覽…',
    'Markdown rendering failed': 'Markdown 轉譯失敗',
    'Refresh the page or check the markdown code': '重新整理頁面或檢查 Markdown 程式碼',
    'raw markdown contents': 'Markdown 原始內容',
    'Failed to load job results': '無法載入作業結果',
    'No mermaid code to preview': '沒有可預覽的 Mermaid 程式碼',
    'Mermaid diagram loading': '正在載入 Mermaid 圖表',
    'Mermaid diagram rendered output container': 'Mermaid 圖表轉譯輸出容器',
    'Image not available': '圖片無法使用',
    'No details available.': '沒有可用的詳細資料。',
    'Code insights': '程式碼洞察',
    'Find matches across our platform.': '在整個平台中尋找相符項目。',
    'Find matches across our platform or check for code vulnerabilities.': '在整個平台中尋找相符項目或檢查程式碼漏洞。',
    'Similar to public code': '與公開程式碼相似',
    'No code matches found.': '找不到相符的程式碼。',
    '1 similar code snippet found': '找到 1 個相似的程式碼片段',

    // 附件查看器：HTML 预览、版本历史记录、链接
    'Open artifacts': '開啟附件',
    'More artifacts': '更多附件',
    'Copy artifact content': '複製附件內容',
    'HTML artifact view': 'HTML 附件檢視',
    'HTML preview settings': 'HTML 預覽設定',
    'Show preview by default': '預設顯示預覽',
    'Automatically run HTML artifacts when you open them.': '開啟 HTML 附件時自動執行。',
    'Previewing runs this code, which may send its contents to external sites.': '預覽會執行此程式碼，可能會將其內容傳送到外部網站。',
    'Artifact HTML preview.': '附件 HTML 預覽。',
    'Artifact HTML source': '附件 HTML 原始碼',
    'HTML rendering failed': 'HTML 轉譯失敗',
    'Refresh the page or check the HTML': '重新整理頁面或檢查 HTML',
    'Loading edit history…': '正在載入編輯歷史記錄…',
    'Unable to load edit history': '無法載入編輯歷史記錄',
    'No version history available': '沒有可用的版本歷史記錄',
    'Unable to add link': '無法新增連結',
    'Unable to update link': '無法更新連結',
    'Use a full URL, like https://github.com/owner/repo.': '使用完整 URL，例如 https://github.com/owner/repo。',
    'Enter a valid URL that starts with http:// or https://.': '輸入以 http:// 或 https:// 開頭的有效 URL。',
    'Slack conversation': 'Slack 對話',
    'Artifact names must be 255 characters or fewer, start and end with a letter or number, and contain only letters, numbers, spaces, periods, hyphens, and underscores.':
      '附件名稱不得超過 255 個字元，必須以字母或數字開頭和結尾，且只能包含字母、數字、空格、句點、連字號和底線。',

    // 起草议题：按钮与确认
    'Review and update': '審查並更新',
    'Review and create': '審查並建立',
    'Update existing issues?': '要更新現有議題嗎？',
    // 原文按钮名无引号，译文不加引号，后接「按鈕」
    'Clicking Update will update the relationships between the issues shown below.': '按一下更新按鈕將更新下方議題之間的關係。',
    'Update issues': '更新議題',
    'Create all linked draft issues?': '要建立所有已連結的草稿議題嗎？',
    "Clicking Create will publish all Copilot draft issues shown below. Existing sub-issues aren't displayed and remain unchanged.":
      '按一下建立按鈕將發布下方所有 Copilot 草稿議題。現有子議題不會顯示，也不會變更。',
    'Clicking Create will publish the Copilot draft issues shown below.': '按一下建立按鈕將發布下方的 Copilot 草稿議題。',
    'These drafts are linked. Creating a sub-issue automatically publishes its parent and any nested drafts.':
      '這些草稿互相連結。建立子議題時會自動發布其父議題和所有巢狀草稿。',
    'Create 1 issue': '建立 1 個議題',
    'Fill out missing required fields to create all of these issues.': '填寫缺少的必填欄位以建立所有這些議題。',
    'Validating issues': '正在驗證議題',
    'Validation errors': '驗證錯誤',
    'New sub-issues': '新子議題',
    'Select a template': '選擇範本',
    'This repository requires all issues to have a template. To create this issue, first select the appropriate template from the template dropdown.':
      '此儲存庫要求所有議題都使用範本。若要建立此議題，請先從範本下拉式選單中選擇適當的範本。',
    'Repository required': '需要儲存庫',
    'Please select a repository above to continue creating your issue.': '請在上方選擇儲存庫以繼續建立議題。',
    'Copilot failed to use the issue template, retrying…': 'Copilot 無法使用議題範本，正在重試…',
    'Copilot failed to create an issue': 'Copilot 無法建立議題',
    'Copilot failed to use the issue template. Please retry or choose a different template.':
      'Copilot 無法使用議題範本。請重試或選擇其他範本。',
    'Issues are disabled': '議題已停用',
    'Issues are disabled on this repository. Please select a different repository above to continue creating your issue.':
      '此儲存庫已停用議題。請在上方選擇其他儲存庫以繼續建立議題。',
    'Issues are disabled on this repository. Please select a different repository above to continue updating your issue.':
      '此儲存庫已停用議題。請在上方選擇其他儲存庫以繼續更新議題。',
    'You cannot create issues in this repository': '你無法在此儲存庫中建立議題',
    'You cannot update issues in this repository': '你無法更新此儲存庫中的議題',
    'Open issue in new tab': '在新分頁中開啟議題',
    'Please verify if the repository exists and is accessible before trying again.': '請先確認儲存庫存在且可以存取，再重試。',

    // 起草议题：关系与模板
    'Newly blocked by': '新增的受阻於關係',
    'Newly blocking': '新增的阻擋關係',
    'Remove dependency': '移除相依關係',
    'Remove the blocking dependency from the issue': '移除議題的阻擋相依關係',
    'Unlink the sub-issue from its parent issue': '取消子議題與父議題的連結',
    'Unlink sub-issue': '取消連結子議題',
    'Removing template…': '正在移除範本…',
    'Remove the template': '移除範本',

    // 起草议题：错误
    'Project update failed': '專案更新失敗',
    'Assignment failed': '指派失敗',
    'Failed to update labels': '無法更新標籤',
    'Could not update issue labels. Please try again.': '無法更新議題標籤。請再試一次。',
    'Could not update issue assignees. Please try again.': '無法更新議題負責人。請再試一次。',
    'Could not assign Copilot to the issue. Please try again.': '無法將議題指派給 Copilot。請再試一次。',
    'Failed to update milestone': '無法更新里程碑',
    'Could not update issue milestone. Please try again.': '無法更新議題里程碑。請再試一次。',
    'Could not update issue type. Please try again.': '無法更新議題類型。請再試一次。',
    'Failed to update projects': '無法更新專案',
    'Could not update project assignments. Please try again.': '無法更新專案指派。請再試一次。',
    'Failed to update content': '無法更新內容',
    'Could not update issue title or body. Please try again.': '無法更新議題標題或內文。請再試一次。',
    'Permission Denied': '權限遭拒',
    "You don't have permission to update this issue. Please contact the repo owner.": '你沒有更新此議題的權限。請聯絡儲存庫擁有者。',
    'Issue Not Found': '找不到議題',
    'The issue you are trying to update could not be found or no longer exists.': '找不到你要更新的議題，或該議題已不存在。',
    'Invalid issue title': '議題標題無效',
    'Invalid form inputs': '表單輸入無效',
    'Issue Outdated': '議題已過時',
    'The issue you are editing has changed. Please copy your edits and have Copilot draft a new update.':
      '你正在編輯的議題已變更。請複製你的編輯內容，並讓 Copilot 草擬新的更新。',
    'Failed to update project assignment': '無法更新專案指派',
    'The issue was updated successfully, but there were problems with project assignments.': '議題已成功更新，但專案指派發生問題。',
    'An error has occurred': '發生錯誤',
    'Malformed draft issue': '草稿議題格式錯誤',
    'The drafted issue contains malformed data and the preview is not available. Please retry.':
      '草擬的議題包含格式錯誤的資料，因此無法預覽。請重試。',
    'Errors in issue creation': '建立議題時發生錯誤',
    'Validation errors in issue content': '議題內容驗證錯誤',
    'Please select a repository for the issue before creating it.': '請先為議題選擇儲存庫再建立。',
    'Please fix the validation errors in the form': '請修正表單中的驗證錯誤',
    'Project assignment errors': '專案指派錯誤',
    'Dependency errors': '相依關係錯誤',
    'Partial update errors': '部分更新錯誤',
    'Other errors': '其他錯誤',
    'Failed to update assignees': '無法更新負責人',
    'Issue title is invalid': '議題標題無效',
    'Issue body is invalid': '議題內文無效',
    'Select Repo': '選擇儲存庫',

    // 聊天中的议题列表卡片
    'Closed issue': '已關閉的議題',
    'Closed draft issue': '已關閉的草稿議題',
    'Task queued': '任務已排入佇列',
    'Task pending': '任務擱置中',
    'Task running': '任務執行中',
    'Task completed': '任務已完成',
    'Task waiting for user input': '任務正在等待使用者輸入',
    'Task failed': '任務失敗',
    'Task cancelled': '任務已取消',
    'Task inactive': '任務閒置中',
    'Unknown task': '未知任務',
    'Unknown issue': '未知議題',
    'Assignee avatar': '負責人頭像',
    'Draft a PR comment': '草擬 PR 留言',
    'Turn this PR review point into a comment.': '將此 PR 審查要點轉為留言。',
    'Insert into the input': '插入到輸入框'
  },
  scoped: {
    Unassigned: '未指派',
    Layout: '版面配置',
    Unified: '統一',
    Split: '分割',
    'Is blocking': '阻擋',
    // 预览工具栏的行数单位：整段由 regexp 翻译，未命中时逐节点兜底
    lines: '行',
    line: '行',
    // 附件查看器
    Artifacts: '附件',
    Current: '目前',
    Source: '原始碼',
    'Edit history': '編輯歷史記錄',
    'Unknown user': '未知使用者',
    'Back to issue': '返回議題',
    'Add link': '新增連結',
    'Edit link': '編輯連結',
    'Link title': '連結標題'
  },
  regexp: [
    [/^Opened (.+) in Workbench\.$/, '已在工作台中開啟 $1。'],
    [/^Create (\d+) issues$/, '建立 $1 個議題'],
    [/^Saved (\d+) issues$/, '已儲存 $1 個議題'],
    [/^Issue update failed: (\d+) operations failed$/, '議題更新失敗：$1 項操作失敗'],
    [/^Use the ([\w.-]+\/[\w.-]+) repository$/, '使用 $1 儲存庫'],
    [/^Changing template to '(.+)'…$/, '正在將範本變更為「$1」…'],
    [/^Use the '(.+)' template$/, '使用「$1」範本'],
    [/^([\w.-]+\/[\w.-]+) is not found$/, '找不到 $1'],
    [
      /^You cannot create more than (\d+) new issues at a time\. Please remove some draft issues from the tree and try again\.$/,
      '一次最多只能建立 $1 個新議題。請從樹狀結構中移除部分草稿議題後再試一次。'
    ],
    [
      /^You cannot add more than (\d+) levels of sub-issues\. Please remove some issues from the tree and try again\.$/,
      '子議題最多只能有 $1 層。請從樹狀結構中移除部分議題後再試一次。'
    ],
    [
      /^The selected repository \(([\w.-]+\/[\w.-]+)\) doesn['’]t match the repository Copilot suggested \(([\w.-]+\/[\w.-]+)\)\. Please select a repository you have access to\.$/,
      '選取的儲存庫 ($1) 與 Copilot 建議的儲存庫 ($2) 不符。請選擇你有存取權的儲存庫。'
    ],
    [/^View file: (.+)$/, '查看檔案：$1'],
    // 文件 / 差异预览工具栏：[Added: |Deleted: ]<12> lines · <1 KB>（相邻文本节点整段匹配；新增、删除的文件带前缀）
    [
      /^(?:(Added|Deleted): )?(\d+) lines? · (\S.*)$/,
      (_, change: string, count: string, size: string) =>
        `${change ? `${FILE_CHANGE[change] ?? change}：` : ''}${count} 行 · ${previewSize(size)}`
    ],
    [/^Issue #(\d+)$/, '議題 #$1'],
    [/^(\d+) assignees?$/, '$1 位負責人'],
    [/^Show (\d+) more$/, '再顯示 $1 個'],
    [/^(\d+) similar code snippets found$/, '找到 $1 個相似的程式碼片段'],
    [/^Public code references from (\d+) repositor(?:y|ies)$/, '來自 $1 個儲存庫的公開程式碼參考'],
    [/^(\d+) vulnerabilit(?:y|ies) detected$/, '偵測到 $1 個漏洞'],
    [/^Image not available: (.+)$/, '圖片無法使用：$1'],
    [/^Draft a PR comment for: (.+)$/, '草擬 PR 留言：$1'],
    [/^Send suggestion \(hold (Option|Alt) to insert\)$/, '傳送建議（按住 $1 鍵插入）'],
    // 附件查看器
    [/^Version (\d+)$/, '版本 $1'],
    [/^HTML preview: (.+)$/, 'HTML 預覽：$1']
  ]
} satisfies PageDictionary
