import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { archivedLabelName } from './labels'
import { joinName } from './list'

/** 选择器中「目前無法編輯 X」的对象名 */
const PICKER_SUBJECT: Readonly<Record<string, string>> = {
  assignees: '負責人',
  labels: '標籤',
  milestone: '里程碑',
  milestones: '里程碑',
  projects: '專案',
  'issue type': '議題類型',
  'issue types': '議題類型'
}

/** 依赖关系上限提示中的关系名 */
const RELATION_NAME: Readonly<Record<string, string>> = { 'blocked by': '受阻於', blocking: '阻擋' }

/** 侧栏分区标题旁「編輯」按钮的读屏文字：Edit Assignees */
const SECTION_NAME: Readonly<Record<string, string>> = {
  Assignees: '負責人',
  Labels: '標籤',
  Type: '類型',
  'Issue type': '議題類型',
  Projects: '專案',
  Milestone: '里程碑',
  Relationships: '關係',
  Development: '開發',
  Fields: '欄位',
  Participants: '參與者'
}

const SECTION_NAME_SOURCE = Object.keys(SECTION_NAME).join('|')

/** 议题字段：组织预置字段名（与组织设置一致）；组织自定义的字段名是用户内容，照录 */
const PRESET_FIELDS: Readonly<Record<string, string>> = {
  Priority: '優先順序',
  'Start date': '開始日期',
  'Target date': '目標日期',
  Effort: '工作量'
}

const PRESET_FIELD_SOURCE = Object.keys(PRESET_FIELDS).join('|')

/** 字段名：预置字段译出，其余照录 */
function fieldName(name: string): string {
  return PRESET_FIELDS[name] ?? name
}

/**
 * 默认议题类型（组织预置）的名称：默认类型名称表（PageDictionary.issueTypes），只在议题类型名称区域内整段匹配；
 * 组织自定义的类型名是用户内容，不收
 */
const ISSUE_TYPE_NAMES: Readonly<Record<string, string>> = {
  Task: '任務',
  Bug: '錯誤',
  Feature: '功能'
}

/** 看板卡片存储库按钮中的存储库状态 */
const REPOSITORY_STATUS: Readonly<Record<string, string>> = {
  public: '公開',
  private: '私人',
  fork: '分叉',
  archived: '已封存'
}

/**
 * 议题侧栏：受理人、标签、类型、项目、里程碑、议题字段、关系、开发（分支与拉取请求）、参与者，
 * 以及侧栏中的各类选择器、子议题列表。
 */
export default {
  static: {
    // 受理人 / 标签 / 里程碑 / 项目
    'Apply labels to this issue': '為此議題套用標籤',
    'Archived in project:': '已在專案中封存：',
    'Issue could not be restored in project': '無法在專案中還原議題',
    'Issue restored in project': '已在專案中還原議題',
    'Move card to column': '將卡片移至欄',
    'Show more project fields': '顯示更多專案欄位',
    'Hide project fields': '隱藏專案欄位',
    'Could not update projects': '無法更新專案',
    'Projects are currently unavailable': '專案目前無法使用',
    'You may only link 10 pull requests to this issue across all repositories.': '此議題在所有儲存庫中最多只能連結 10 個拉取請求。',
    'This project has reached the maximum of 50,000 items. To add more, please delete existing items from the project.':
      '此專案已達 50,000 個項目的上限。若要新增更多項目，請先從專案中刪除現有項目。',
    'Project items limit reached dialog': '專案項目上限對話方塊',
    'Project limits reached': '已達專案上限',
    'One or more of the projects you selected has reached the maximum of 50,000 items. To add more, please delete existing items from the selected project(s).':
      '你選取的專案中有一個或多個已達 50,000 個項目的上限。若要新增更多項目，請先從選取的專案中刪除現有項目。',
    'Failed to update issue labels': '無法更新議題標籤',
    'Failed to update issue milestone': '無法更新議題里程碑',
    'Failed to update issue type': '無法更新議題類型',
    'Failed to add issue to project': '無法將議題加入專案',
    'Failed to remove issue from project': '無法從專案中移除議題',
    'Could not update issue type': '無法更新議題類型',
    'No issue type': '無議題類型',
    'Filter issue types': '篩選議題類型',
    'Issue Type results': '議題類型結果',
    'No issue types were found': '找不到議題類型',
    // 分配代理对话框的默认标题（具名代理见正则）
    'Assign agent to issue': '將代理指派給議題',

    // 议题字段
    'Something went wrong while setting the field value. Please try again.': '設定欄位值時發生錯誤。請再試一次。',
    "Couldn't load issue fields": '無法載入議題欄位',
    "We couldn't load the issue fields. Please try again later or if the problem persists contact support":
      '無法載入議題欄位。請稍後再試，若問題持續發生，請聯絡支援團隊',
    // <新增欄位> to track more details about your issues.（链接后的片段，原文无逗号）
    'to track more details about your issues.': '以追蹤議題的更多詳細資料。',
    'Reload site? Changes you made might not be saved.': '要重新載入網站嗎？你所做的變更可能不會儲存。',
    'Must contain only numbers, decimals, and optional negative sign': '只能包含數字、小數點和選用的負號',
    'There was an error updating this value. Please try again.': '更新此值時發生錯誤。請再試一次。',
    'No fields configured for issues without a type.': '無類型的議題未設定欄位。',
    'Field is visible to the public.': '此欄位公開可見。',
    'Field is visible to all organizations in this enterprise.': '此企業中的所有組織都能看到此欄位。',
    'This status automatically assigns the issue to an agent.': '此狀態會自動將議題指派給代理。',
    'Issue field option results': '議題欄位選項結果',
    'No fields added. Choose Fields to add one.': '尚未新增欄位。選擇「欄位」以新增。',
    'All available fields have been added.': '已新增所有可用欄位。',
    'Fields: add a field': '欄位：新增欄位',

    // 关系
    'Relationships are currently unavailable': '關係目前無法使用',
    'Mark issues that relate to the current issue…': '標示與目前議題相關的議題…',
    "We couldn't load the related issues. Try reloading the page, or if the problem persists, contact support.":
      '無法載入相關議題。請嘗試重新載入頁面，若問題持續發生，請聯絡支援團隊。',
    "We couldn't load the issues. Try reloading the page, or if the problem persists, contact support.":
      '無法載入議題。請嘗試重新載入頁面，若問題持續發生，請聯絡支援團隊。',
    'No blocked by issues found': '找不到阻擋此議題的議題',
    'No blocking issues found': '找不到受此議題阻擋的議題',
    'No linked security alerts found': '找不到已連結的安全性警示',
    'No related issues found': '找不到相關議題',
    'Mark current issue as blocked by…': '將目前議題標示為受阻於…',
    'Mark current issue as blocking…': '將目前議題標示為阻擋…',
    'Private issues are hidden.': '已隱藏私人議題。',
    'Failed to remove parent issue': '無法移除父議題',
    'Unable to remove parent issue': '無法移除父議題',
    'Failed to set parent': '無法設定父議題',
    'Failed to add related issue': '無法新增相關議題',
    'Failed to remove related issue': '無法移除相關議題',
    'An issue may not be blocked by an issue that it is already blocking. Please remove the existing relationship before adding this one.':
      '議題不能受阻於它正在阻擋的議題。請先移除現有關係再新增此關係。',
    "You do not have permission to take this action for the selected issue. A repository role of 'triage' or higher is required on the selected issue.":
      '你沒有對選取的議題執行此動作的權限。必須在選取議題的儲存庫中擁有「分類」或更高的角色。',
    "You do not have permission to take this action for the selected issue. A repository role of 'triage' or higher is required.":
      '你沒有對選取的議題執行此動作的權限。必須擁有「分類」或更高的儲存庫角色。',
    'An issue cannot have more than 50 links': '議題最多只能有 50 個連結',

    // 开发
    'No branches or linked pull requests': '沒有分支或已連結的拉取請求',
    'Development is currently unavailable': '開發資訊目前無法使用',
    // <建立分支> for this issue or link a pull request.（链接后的片段，原文无逗号）
    'for this issue or link a pull request.': '用於此議題或連結拉取請求。',
    'Select a repository to search for branches and pull requests or': '選擇要搜尋分支和拉取請求的儲存庫或',
    'Edit the pull request description to unlink': '編輯拉取請求描述以取消連結',
    'Create a branch for this issue': '為此議題建立分支',
    'Shows branches and pull requests linked to this issue.': '顯示連結到此議題的分支和拉取請求。',
    'When branches are created from issues, their pull requests are automatically linked.': '從議題建立分支時，其拉取請求會自動連結。',
    'Link a pull request from this repository': '連結此儲存庫中的拉取請求',
    'Search for branches or pull requests': '搜尋分支或拉取請求',
    // 产品名按用户要求译成中文（product-names.md）：codespace → 程式碼空間
    'Start a codespace with Copilot agent mode for this issue in another repository.':
      '在其他儲存庫中為此議題啟動使用 Copilot 代理模式的程式碼空間。',
    'Could not update linked pull requests': '無法更新已連結的拉取請求',
    'Could not update linked branches': '無法更新已連結的分支',

    // 参与者 / 通知
    'Only the first 100 participants are shown in this list.': '此清單僅顯示前 100 位參與者。',
    'Participants are currently unavailable': '參與者清單目前無法使用',
    'Notifications are currently unavailable': '通知目前無法使用',

    // 子议题
    'Create sub-issue': '建立子議題',
    'Convert to sub-issue': '轉換為子議題',
    'View more sub-issue options': '查看更多子議題選項',
    'Sub-issue options': '子議題選項',
    'Remove sub-issue': '移除子議題',
    'Failed to remove sub-issue': '無法移除子議題',
    'Failed to reorder sub-issue': '無法調整子議題順序',
    'Closed sub-issues hidden': '已隱藏已關閉的子議題',
    'All sub-issues shown': '已顯示所有子議題',
    'Sub-issues are limited to one parent. Confirm you want to proceed with this change.':
      '子議題只能有一個父議題。請確認是否要繼續此變更。',
    'Sub-issue added': '已新增子議題',
    'Failed to add sub-issue': '無法新增子議題',
    'Sub-issue limit reached': '已達子議題上限',
    'Sub-issue circular dependency': '子議題循環相依性',
    'A parent may not be a sub-issue of itself. To add it as a sub-issue, remove it as a parent in the tree.':
      '父議題不能成為自身的子議題。若要將其新增為子議題，請先在樹狀結構中移除其父議題身分。',
    'Duplicate sub-issue': '重複的子議題',
    'A parent may not have duplicate sub-issues.': '父議題不能有重複的子議題。',
    'A sub-issue must belong to the same organization or user as the parent.': '子議題必須與父議題屬於同一個組織或使用者。',
    // 子议题列表（嵌套列表）的错误与管理对话框
    'An error occured while loading items': '載入項目時發生錯誤',
    'An error occurred while loading items': '載入項目時發生錯誤',
    'There was an issue loading Sub issues': '載入子議題時發生問題',
    'Manage this item': '管理此項目'
  },
  scoped: {
    // 分区标题与空状态
    Assignees: '負責人',
    Assignee: '負責人',
    'No one assigned': '無負責人',
    'No one -': '無人 -',
    'Assign yourself': '指派給自己',
    Labels: '標籤',
    Label: '標籤',
    'No labels': '無標籤',
    Type: '類型',
    'No type': '無類型',
    'Issue type': '議題類型',
    Project: '專案',
    'No projects': '無專案',
    Milestone: '里程碑',
    'No milestone': '無里程碑',
    Relationships: '關係',
    Development: '開發',
    'No branches or pull requests': '沒有分支或拉取請求',
    Participants: '參與者',
    Participant: '參與者',
    'No participants': '無參與者',
    Fields: '欄位',
    Field: '欄位',
    'Add fields': '新增欄位',
    'Add a field': '新增欄位',
    // 组织预置的议题字段名与单选选项（侧栏、时间线、字段菜单；Start date 见日期选择器词典，High / Medium / Low 由通用词典处理）
    Priority: '優先順序',
    'Target date': '目標日期',
    Effort: '工作量',
    Urgent: '緊急',
    'No status': '無狀態',
    'Awaiting triage': '等待分類',
    'Select projects': '選取專案',
    'Filter projects': '篩選專案',
    'Please try again later': '請稍後再試',

    // 关系名称与操作
    'Parent issue': '父議題',
    'Blocked by': '受阻於',
    'Is blocking': '阻擋',
    'Relates to': '相關',
    'Security alert': '安全性警示',
    'Add relates to': '新增相關議題',
    'Change or remove parent': '變更或移除父議題',
    'Add parent': '新增父議題',
    'Select parent issue': '選擇父議題',
    'Mark as blocked by': '標示為受阻於',
    'Mark as blocking': '標示為阻擋',
    'Change or add security alerts': '變更或新增安全性警示',
    'Add security alert': '新增安全性警示',
    'Loading related items...': '正在載入相關項目...',
    'Unable to load more issues': '無法載入更多議題',
    'Dependency limit reached': '已達相依關係上限',
    'Circular dependency': '循環相依性',
    'Access denied': '存取遭拒',
    'Unexpected error': '未預期的錯誤',
    'Failed to add dependency': '無法新增相依關係',
    'Failed to remove dependency': '無法移除相依關係',
    'No alerts found': '找不到警示',
    'Search alerts...': '搜尋警示...',
    'Search repositories...': '搜尋儲存庫...',
    'Failed to link alert': '無法連結警示',
    'Failed to unlink alert': '無法取消連結警示',
    'Invalid owner': '擁有者無效',
    'Change parent issue': '變更父議題',

    // 子议题
    'Add existing issue': '新增現有議題',
    'Draft with Copilot': '使用 Copilot 草擬',
    'Issues to include': '要包含的議題',
    'Open and closed': '開放中和已關閉',
    'Open only': '僅開放中',
    'Manage item': '管理項目',
    // 正文任务清单项菜单
    'Convert to issue': '轉換為議題',

    // 议题字段编辑
    'Enter text…': '輸入文字…',
    'Enter number…': '輸入數字…',
    'Choose a date': '選擇日期',
    'Choose an option': '選擇選項',
    'Choose options': '選擇選項',
    'Choose an iteration': '選擇迭代',
    'Text cannot be empty.': '文字不可空白。',
    'This value must be between -2147483647 and 2147483647': '此值必須介於 -2147483647 和 2147483647 之間',
    'This floating point value is too precise': '此浮點數值的精確度過高',
    'This value is too long': '此值過長',
    'No date': '無日期',
    Current: '目前',
    'No option found': '找不到選項',
    'Auto-assign to agent': '自動指派給代理',
    'Filter option': '篩選選項',
    'Try searching with a different query for results.': '請嘗試使用其他搜尋字詞。',

    // 选择器（Popular 由通用词典处理，Copilot 的说明 Your AI pair programmer 见 filter.ts）
    'Select assignees': '選取負責人',
    'Filter assignees': '篩選負責人',
    'User results': '使用者結果',
    'No assignees were found': '找不到負責人',
    'Try searching for a different name for results.': '請嘗試搜尋其他名稱。',
    'Edit labels': '編輯標籤',
    'Select labels': '選取標籤',
    'Filter labels': '篩選標籤',
    'Selected labels': '已選取的標籤',
    'Copilot suggestions': 'Copilot 建議',
    'Label results': '標籤結果',
    'No labels were found': '找不到標籤',
    'Back to labels': '返回標籤',
    'Create a new label': '建立新標籤',
    'Set milestone': '設定里程碑',
    'Select milestone': '選擇里程碑',
    'Filter milestones': '篩選里程碑',
    'Milestone results': '里程碑結果',
    'No milestones were found': '找不到里程碑',
    'Currently selected:': '目前選擇：',
    // 里程碑说明：Past due by <relative-time>（逾期时长由时间元素输出）
    'Past due by': '逾期',
    'Due by': '截止於',
    'No due date': '無截止日期',
    ', not started': '，未開始',
    'No projects were found': '找不到專案',
    'No projects were found. Please try a different search query.': '找不到專案。請嘗試其他搜尋字詞。',
    'Project results': '專案結果',
    'Please try a different search query.': '請嘗試其他搜尋字詞。',
    'Choose issue': '選擇議題',
    'Select issue': '選擇議題',
    'issue results': '議題結果',
    'Select issue field': '選擇議題欄位',
    // Select an option、Select repository 由通用词典处理
    'Select options': '選取選項',
    'Filter types': '篩選類型',
    'Filter organizations': '篩選組織',
    'Select a pull request': '選擇拉取請求',
    'no pull request': '無拉取請求',
    'No issues found': '找不到議題',
    'Try changing your search term or selecting a different repository.': '請嘗試變更搜尋字詞或選擇其他儲存庫。',
    'Back to repository selection': '返回儲存庫選擇',
    'No repositories match': '沒有相符的儲存庫',
    'Repository results': '儲存庫結果',
    '(private)': '（私人）',
    'private repository': '私人儲存庫',
    'Could not update assignees': '無法更新負責人',
    'Could not search assignees': '無法搜尋負責人',
    'Could not update labels': '無法更新標籤',
    'Could not search labels': '無法搜尋標籤',
    'Could not update milestone': '無法更新里程碑',
    'Could not update type': '無法更新類型',
    'Could not search milestones': '無法搜尋里程碑',
    'Could not search repositories': '無法搜尋儲存庫',
    'Could not search pull requests': '無法搜尋拉取請求',
    'Could not search projects': '無法搜尋專案',
    'Could not search branches': '無法搜尋分支',
    'Could not create branch': '無法建立分支',
    'Could not create label': '無法建立標籤',
    'Could not create milestone': '無法建立里程碑',
    'Failed to update assignees': '無法更新負責人',
    'Updating assignees was cancelled': '已取消更新負責人',

    // 开发：分支与拉取请求
    'Create a branch': '建立分支',
    'create a branch': '建立分支',
    'Link a branch, pull request, or': '連結分支、拉取請求，或',
    'Link a branch or pull request': '連結分支或拉取請求',
    'Link pull requests': '連結拉取請求',
    'Creating branch…': '正在建立分支…',
    'Branch created': '已建立分支',
    'Branch not created': '未建立分支',
    'Return to repository picker': '返回儲存庫選擇器',
    // 产品名按用户要求译成中文（product-names.md）：Copilot Workspace → 工作區、codespace → 程式碼空間
    'Open in Workspace': '在工作區中開啟',
    'Code with agent mode': '使用代理模式撰寫程式碼',
    'Codespace creation failed.': '程式碼空間建立失敗。',
    'Codespace creation failed': '程式碼空間建立失敗',
    'Failed to link branches': '無法連結分支',
    'Failed to link pull requests': '無法連結拉取請求',
    'Unable to load repositories': '無法載入儲存庫',
    'Select branch': '選擇分支',
    'No branches were found': '找不到分支',
    'Branch results': '分支結果',
    'Pull request results': '拉取請求結果',
    'No pull requests or branches were found': '找不到拉取請求或分支',
    'Branch name': '分支名稱',
    'Repository destination': '目標儲存庫',
    'Branch source': '分支來源',
    'Change branch source': '變更分支來源',
    'Choose a source branch': '選擇來源分支',
    'Create branch': '建立分支',
    "What's next?": '接下來要做什麼？',
    'What’s next?': '接下來要做什麼？',
    'Copy branch name to clipboard': '複製分支名稱到剪貼簿',
    'Run the following commands in your local clone.': '在本機複本中執行以下命令。',
    'Checkout in your local repository': '在本機儲存庫中簽出',
    'If nothing happens, make sure': '如果沒有反應，請確認',
    'is installed and set up properly, then': '已正確安裝並設定，然後',
    'try again': '再試一次',
    'Select code repository': '選擇程式碼儲存庫',
    'Failed to fetch repository data. Please try again.': '無法擷取儲存庫資料。請再試一次。',
    'Linked branch not found': '找不到已連結的分支',
    Releases: '發行版本',
    Latest: '最新',
    'Pre-release': '發行前版本',
    'No releases found': '找不到發行版本'
  },
  regexp: [
    // 分区标题旁的编辑按钮（读屏）：Edit Assignees
    [new RegExp(`^Edit (${SECTION_NAME_SOURCE})$`), (_, name) => `編輯${SECTION_NAME[name] ?? name}`],
    // 标签删除提示
    [/^Removing label: (.+)\.$/, '正在移除標籤：$1。'],
    [/^Could not remove label: (.+)\. The label was restored\.$/, '無法移除標籤：$1。標籤已還原。'],
    [/^Removed label: (.+)\.$/, '已移除標籤：$1。'],
    // 删除按钮的提示文字（常态下按钮没有 aria-label，名称取自提示）：默认标签名与令牌同译，已存档的 Archived 译出，
    // 自定义标签名保持原文（见 issues/labels.ts 的 archivedLabelName）
    [/^Remove label: (?:(Archived) )?(.+)$/, (_, archived: string, name: string) => `移除標籤：${archivedLabelName(archived, name)}`],
    // 项目分区展开（Show 5 more 由通用词典处理）
    [/^Show (\d+) closed projects?$/, '顯示 $1 個已關閉的專案'],
    [/^Show (\d+) more \((\d+) closed\)$/, '再顯示 $1 個（$2 個已關閉）'],
    // 里程碑进度（侧栏）
    [/^, (\d+)% complete$/, '，已完成 $1%'],
    // 议题字段（字段名是用户内容，原文无引号，译文不加；与中文之间按 joinName 留空格）
    [/^Value cannot be more than (\d+) characters \((\d+)\)$/, '值不能超過 $1 個字元（目前 $2 個）'],
    [/^The value for the (.+) field$/, (_, name: string) => joinName(fieldName(name), '欄位的值')],
    [/^Toolbar for (.+) field$/, (_, name: string) => joinName(fieldName(name), '欄位工具列')],
    [/^Cannot be greater than (-?[\d.,]+)$/, '不能大於 $1'],
    [/^Cannot be less than (-?[\d.,]+)$/, '不能小於 $1'],
    [/^Remove field (.+)$/, (_, name: string) => joinName('移除欄位', fieldName(name))],
    [/^Update field (.+) \(press enter to submit\)$/, (_, name: string) => `${joinName('更新欄位', fieldName(name))}（按 Enter 送出）`],
    [/^No fields configured for (.+)\.$/, (_, name) => `${joinName(name, '未設定欄位')}。`],
    [/^Set (.+), none$/, (_, name: string) => `${joinName('設定', fieldName(name))}，目前為空`],
    // 字段值选择器的占位文字：Select Effort（预置字段）
    [new RegExp(`^Select (${PRESET_FIELD_SOURCE})$`), (_, name: string) => `選擇${fieldName(name)}`],
    [/^(.+) \(edited\)$/, '$1（已編輯）'],
    // 选择器
    [/^Cannot edit (.+) right now$/, (_, subject) => joinCjk('目前無法編輯', PICKER_SUBJECT[subject] ?? subject)],
    [/^You have reached the limit of (\d+) assignees?$/, '已達 $1 位負責人的上限'],
    // 分配代理对话框标题（copilot/agents.ts 的同类规则只在 Copilot 页生效；默认标题 Assign agent to issue 见 static）
    [/^Assign (Copilot|Claude|Codex) to issue$/, '將 $1 指派給議題'],
    [/^Create new label: "(.+)"$/, '建立新標籤：「$1」'],
    [/^Created and selected label: (.+)\.$/, '已建立並選取標籤：$1。'],
    [/^Create new milestone: "(.+)"$/, '建立新里程碑：「$1」'],
    [/^Filter milestones \((\d+) milestones loaded\)$/, '篩選里程碑（已載入 $1 個）'],
    [/^(\d+) pull requests? selected$/, '已選取 $1 個拉取請求'],
    [/^The branch (.+) already exists\.$/, '分支 $1 已存在。'],
    [
      /^Repository: ([\w.-]+\/[\w.-]+)(?: \((public|private|fork|archived)\))?$/,
      (_, repo, status) => `儲存庫：${repo}${status ? `（${REPOSITORY_STATUS[status] ?? status}）` : ''}`
    ],
    [/^Change destination, current repository: ([\w.-]+\/[\w.-]+)$/, '變更目標，目前的儲存庫：$1'],
    // 开发
    [/^Creating in ([\w.-]+\/[\w.-]+)…$/, '正在 $1 中建立…'],
    [/^Creating branch (.+) in ([\w.-]+\/[\w.-]+)\.$/, '正在 $2 中建立分支 $1。'],
    [/^Codespace creation failed\. (.+)$/, '程式碼空間建立失敗。$1'],
    // 关系
    [
      /^Issues have a limit of (\d+) (?:"(blocked by|blocking)" )?relationships\. To add more, an existing one must be removed\.$/,
      (_, limit, relation) =>
        `每個議題最多可有 ${limit} 個${relation ? `「${RELATION_NAME[relation] ?? relation}」` : ''}關係。若要新增，必須先移除現有關係。`
    ],
    [/^Failed to save (\d+) issues?$/, '無法儲存 $1 個議題'],
    [/^Failed to save (\d+) alerts?$/, '無法儲存 $1 個警示'],
    [/^An unexpected error occurred\. (.+)$/, '發生未預期的錯誤。$1'],
    // 参与者
    [/^and (\d+) other participants, click to see the full list$/, '和其他 $1 位參與者，按一下可查看完整清單'],
    // 子议题
    [/^Loading (\d+) sub-issues$/, '正在載入 $1 個子議題'],
    [/^(\d+) sub-issues loaded$/, '已載入 $1 個子議題'],
    // 子议题列表标题的折叠按钮：Collapse Sub-issues
    [/^(Collapse|Expand) Sub-issues$/, (_, action) => `${action === 'Collapse' ? '摺疊' : '展開'}子議題`],
    [/^(.+), blocked$/, '$1，受阻擋'],
    [
      /^Parents have a limit of (\d+) sub-issues\. To add more, an existing one must be removed\.$/,
      '每個父議題最多可有 $1 個子議題。若要新增，必須先移除現有子議題。'
    ],
    [
      /^You can[’'`]t add more than (\d+) layers of sub-issues\. To add a sub-issue, remove a parent issue at any level\.$/,
      '子議題最多只能有 $1 層。若要新增子議題，請移除任一層級的父議題。'
    ],
    [/^You can[’'`]t add more than (\d+) layers of sub-issues$/, '子議題最多只能有 $1 層'],
    [/^(\d+) tasks?$/, '$1 項任務'],
    // 受理人选择器中代理的任务数（读屏，后接状态图标）：2 tasks,
    [/^(\d+) tasks,$/, '$1 項任務，'],
    [/^(\d+) of (\d+)$/, '$1/$2'],
    // 子议题列表项的无障碍名称（标题、状态等在前，以句号结尾）：Fix bug. Press Control, Shift, U for more actions.
    [
      /^(?:(.+)\. )?Press (Command|Control), Shift, U for more actions(\.?)$/,
      (_, head, key, dot) => `${head ? `${head}。` : ''}按 ${key}、Shift、U 查看更多動作${dot ? '。' : ''}`
    ],
    // 正文任务清单项（清单文字是用户内容，原文无标点，译文不加冒号、引号）
    [/^Open (.+) task options$/, (_, title) => joinName(joinName('開啟', title), '的工作選項')],
    [/^(.+) checklist item$/, (_, title) => joinName(title, '檢查清單項目')]
  ],
  issueTypes: ISSUE_TYPE_NAMES
} satisfies PageDictionary
