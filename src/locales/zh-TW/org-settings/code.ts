import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

const ORG = '([\\w.-]+)'
const BRANCH = '([\\w./-]+)'

/** 自定义属性类型（类型菜单按钮的无障碍名称「Type: <类型>」） */
const PROPERTY_TYPES: Readonly<Record<string, string>> = {
  Text: '文字',
  'Single select': '單選',
  'Multi select': '多選',
  'True/false': '真/假',
  URL: 'URL'
}

/** 议题字段：预置字段名、预置单选选项（组织自定义的是用户内容，照录） */
const PRESET_FIELDS: Readonly<Record<string, string>> = {
  Priority: '優先順序',
  'Start date': '開始日期',
  'Target date': '目標日期',
  Effort: '工作量'
}
const PRESET_OPTIONS: Readonly<Record<string, string>> = { Urgent: '緊急', High: '高', Medium: '中', Low: '低' }
/** 议题类型：默认类型名（与 scoped 的类型名一致） */
const PRESET_TYPES: Readonly<Record<string, string>> = { Task: '任務', Bug: '錯誤', Feature: '功能' }
/** 字段名与选项名（类型的置顶字段、字段的单选选项共用操作按钮的读屏名称） */
const PRESET_NAMES: Readonly<Record<string, string>> = { ...PRESET_FIELDS, ...PRESET_OPTIONS }

/** 查表：键可能是用户内容（选项名），不取原型链上的键 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/**
 * 代码、规划和自动化（Copilot、Actions、Web 钩子除外）：存储库常规设置（默认分支、提交签署、默认标签）、
 * 自定义属性、规划（议题类型、议题字段）、Codespaces、沙盒、讨论、软件包、Pages、项目、
 * 托管计算网络。
 * 个人设置、存储库设置、项目、议题标签已收录为 static 的词条（默认分支说明、软件包与 Pages 域验证、
 * 项目字段、标签表单等）不再重复，译法以那里为准。
 */
export default {
  static: {
    // 自定义属性：推荐属性的说明（属性名是标识符，不译）、新建 / 删除属性、设置值
    'What application does this support?': '此儲存庫支援哪個應用程式？',
    'Who owns this repository?': '誰擁有此儲存庫？',
    'Which compliance frameworks apply?': '適用哪些合規框架？',
    'Are personal identifiers present?': '是否包含個人識別資訊？',
    'Is this repository a monorepo?': '此儲存庫是否為單一存放庫？',
    'No properties': '尚無屬性',
    'No properties that match': '沒有符合的屬性',
    'A short description about this property': '此屬性的簡短描述',
    'Match regular expression': '比對規則運算式',
    'Use regular expression': '使用規則運算式',
    'Repository users and apps with the repository-level "custom properties" fine-grained permission can set and update the value for their repository.':
      '擁有儲存庫層級「自訂屬性」精細權限的儲存庫使用者和應用程式可以為其儲存庫設定和更新此值。',
    'Repository users and apps with the repository-level “custom properties” fine-grained permission can set and update the value for their repository.':
      '擁有儲存庫層級「自訂屬性」精細權限的儲存庫使用者和應用程式可以為其儲存庫設定和更新此值。',
    'Name contains invalid characters:': '名稱包含無效字元：',
    'Property definition successfully created.': '已建立屬性定義。',
    'Property attributes': '屬性特徵',
    'Additional options': '其他選項',
    'Permanently delete this property and its values from all repositories.': '從所有儲存庫中永久刪除此屬性及其值。',
    'No repositories found that use the property:': '找不到使用此屬性的儲存庫：',
    'No other GitHub features found that use the property:': '找不到使用此屬性的其他 GitHub 功能：',
    'This will permanently delete this property.': '這將永久刪除此屬性。',
    'Checking usages..': '正在檢查使用情況..',
    'Checking usages...': '正在檢查使用情況...',
    'Property definition successfully deleted.': '已刪除屬性定義。',
    // 代码空间：用户访问
    'Codespaces access updated': '程式碼空間存取權已更新',
    'Add user or team to Codespaces': '將使用者或團隊新增至程式碼空間',
    'No users or teams allowed to access Codespaces yet': '尚未允許任何使用者或團隊存取程式碼空間',
    'You can add any number of organization members or teams': '可以新增任意數量的組織成員或團隊',
    // 议题字段：编辑页（权限、置顶到议题）、删除确认
    'Unique name for your issue field': '議題欄位的唯一名稱',
    'Choose who should be able to see this field and its value': '選擇誰可以檢視此欄位及其值',
    'Field is visible to organization members and any repository collaborators': '組織成員和所有儲存庫協作者可以看到此欄位',
    'Field is visible to organization members and any repositorycollaborators': '組織成員和所有儲存庫協作者可以看到此欄位',
    'Field is visible to anyone viewing the issue': '檢視議題的任何人都可以看到此欄位',
    'Pin to issues': '釘選到議題',
    'Choose which issue types show this field when viewing and creating issues.': '選擇在檢視和建立議題時顯示此欄位的議題類型。',
    'Edit field visibility': '編輯欄位可見性',
    'Show this field on the selected issue types when viewing or creating issues.': '檢視或建立議題時，在所選議題類型上顯示此欄位。',
    'When the issue has no type': '議題沒有類型時',
    'Pin to selected types': '釘選到所選類型',
    'Edits to this field are global. Any changes apply to all of your issues and projects.':
      '對此欄位的編輯是全域性的，任何變更都會套用到你的所有議題和專案。',
    'Modifying this issue field will affect all of your issues and projects.': '修改此議題欄位將影響你的所有議題和專案。',
    'Apply to all issues and projects': '套用到所有議題和專案',
    'Save complete': '儲存完成',
    'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.':
      '若要拾取可拖曳項目，請按空白鍵。拖曳時，使用方向鍵移動該項目。再次按空白鍵將其放到新位置，或按 Esc 鍵取消。',
    // Slack 集成跳转（规则集仪表板图表的图例、数据点与坐标轴说明见 repo-settings/ruleset-insights.ts）
    'You are being redirected to Slack in order to authenticate.': '正在重新導向至 Slack 以驗證身分。',
    'click here': '按一下這裡',
    // 设置保存提示
    'Pages settings updated for this organization.': '已更新此組織的頁面設定。',
    'Packages settings updated for this organization.': '已更新此組織的套件設定。',
    // 代码空间：用户访问设置的保存按钮（无障碍名称）
    'Save user access settings': '儲存使用者存取設定',
    // 存储库自定义属性：分页、筛选、推荐属性（属性名 cloud_providers 等是标识符，不译）
    'Page selector navigation': '頁面選擇器導覽',
    'Page selector': '頁面選擇器',
    'Filter properties': '篩選屬性',
    'Suggested custom properties': '建議的自訂屬性',
    'See more suggested properties': '查看更多建議屬性',
    'Which cloud providers are used?': '使用了哪些雲端供應商？',
    'Are external packages used here?': '是否使用了外部套件？',
    'How protected is the default branch?': '預設分支的保護程度如何？',
    // 议题字段：说明、预置字段（名称、说明、无障碍名称与操作提示；自定义字段见 regexp）
    'Issue fields let you define structured data to capture for each issue, helping you keep information consistent across all of your repositories.':
      '議題欄位可用於定義每個議題要記錄的結構化資料，讓所有儲存庫中的資訊保持一致。',
    'Current importance level assigned to this issue': '為此議題指定的目前重要程度',
    'Date when work on issue will begin': '議題工作的開始日期',
    'Expected completion date for this issue': '此議題的預計完成日期',
    'Relative level of effort for completing this issue': '完成此議題所需的相對工作量',
    'Issue field: Priority': '議題欄位：優先順序',
    'Issue field: Start date': '議題欄位：開始日期',
    'Issue field: Target date': '議題欄位：目標日期',
    'Issue field: Effort': '議題欄位：工作量',
    'Open field options for Priority': '開啟優先順序欄位選項',
    'Open field options for Start date': '開啟開始日期欄位選項',
    'Open field options for Target date': '開啟目標日期欄位選項',
    'Open field options for Effort': '開啟工作量欄位選項',
    // 议题类型：说明、预置类型（Task / Bug / Feature，与议题页的默认类型名称表一致）
    'New type': '新增類型',
    'Customize your issue types. Issue types can be used to classify and manage issues in your repositories.':
      '自訂議題類型。議題類型可用於分類和管理儲存庫中的議題。',
    'List of issue types': '議題類型清單',
    '"Task" Issue type list item': '議題類型清單項目「任務」',
    '"Bug" Issue type list item': '議題類型清單項目「錯誤」',
    '"Feature" Issue type list item': '議題類型清單項目「功能」',
    'Open type options for Task': '開啟任務類型選項',
    'Open type options for Bug': '開啟錯誤類型選項',
    'Open type options for Feature': '開啟功能類型選項',
    // 存储库默认设置：不可变发行版、标签空状态（「Choose whether <a>commit comments</a> are …」见 inline）
    'Choose whether repositories will publish immutable releases. Immutable releases improve security by disallowing changes to assets and tags after the release is published.':
      '選擇儲存庫是否發佈不可變發行版本。不可變發行版本禁止在發佈後變更資產和標記，從而提升安全性。',
    'Require immutable releases for all repositories': '要求所有儲存庫使用不可變發行版本',
    'Require immutable releases for specifically selected repositories': '要求所選儲存庫使用不可變發行版本',
    'Each repository chooses whether to make releases immutable': '由各儲存庫選擇是否將發行版本設為不可變',
    'No labels!': '暫無標籤',
    'There aren’t any labels for this organization quite yet. Click on the "New Label" button above to create one.':
      '此組織暫無標籤。點擊上方的「新增標籤」按鈕建立標籤。',
    'There aren\'t any labels for this organization quite yet. Click on the "New Label" button above to create one.':
      '此組織暫無標籤。點擊上方的「新增標籤」按鈕建立標籤。',
    // 规则集仪表板（组织）：筛选、图表、绕过统计（图表的类型、坐标轴说明由 insights/charts.ts 的规则翻译）
    'Filter rule insights dashboard': '篩選規則洞察儀表板',
    'Rule Suites': '規則套件',
    'Rule Suites. Interactive chart.': '規則套件。互動式圖表。',
    'Show Passes': '顯示通過',
    'Show Failures': '顯示失敗',
    'Show Bypasses': '顯示繞過',
    'View allowed runs': '檢視允許的執行',
    'View failed runs': '檢視失敗的執行',
    'View bypassed runs': '檢視繞過的執行',
    'in the time period': '此時段內',
    'Bypasses by actor': '依執行者統計的繞過',
    'Bypasses by actor. Interactive chart.': '依執行者統計的繞過。互動式圖表。',
    'Members who have bypassed the most': '繞過次數最多的成員',
    'Top repositories by bypasses': '繞過次數最多的儲存庫',
    'No bypasses found': '找不到繞過',
    'No repositories have any rule bypasses for the selected filters': '所選篩選條件下沒有儲存庫有規則繞過',
    // 「按参与者统计的绕过」图表的纵轴标题（SVG 中，见 core/ignore.ts 的 Highcharts 放行）
    'Number of bypasses': '繞過次數',
    // 存储库：默认分支
    'Choose the default branch for new repositories in this organization. You might want to change the default name due to different workflows, or because your integrations still require “master” as the default branch name. You can always change the default branch name on individual repositories.':
      '為此組織中的新儲存庫選擇預設分支。你可能因為工作流程不同，或整合仍要求以「master」作為預設分支名稱，而想變更預設名稱。你隨時可以變更個別儲存庫的預設分支名稱。',
    'Change default branch name now': '立即變更預設分支名稱',

    // 存储库：提交签署
    'Commit signoff': '提交簽署',
    "Choose whether repositories will require contributors to sign off on commits they make through GitHub's web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the":
      '選擇儲存庫是否要求貢獻者簽署透過 GitHub 網頁介面所做的提交。簽署是貢獻者確認其提交符合儲存庫條款的一種方式，通常是',
    'Choose whether repositories will require contributors to sign off on commits they make through GitHub’s web interface. Signing off is a way for contributors to affirm that their commit complies with the repository’s terms, commonly the':
      '選擇儲存庫是否要求貢獻者簽署透過 GitHub 網頁介面所做的提交。簽署是貢獻者確認其提交符合儲存庫條款的一種方式，通常是',
    'Developer Certificate of Origin (DCO)': '開發人員來源證明 (DCO)',
    'Learn more about signing off on commits': '瞭解提交簽署',
    'Require signoff on web-based commits for all repositories in this organization': '此組織中的所有儲存庫都要求簽署網頁提交',
    'Each repository chooses whether to require signoff on web-based commits': '由各儲存庫自行選擇是否要求簽署網頁提交',
    'Commit signoff settings were updated.': '已更新提交簽署設定。',
    'Require contributors to sign off on web-based commits': '要求貢獻者簽署網頁提交',

    // 存储库：默认标签
    'Repository labels': '儲存庫標籤',
    'Set the labels that will be included when a new repository is created in this organization.':
      '設定在此組織中建立新儲存庫時要包含的標籤。',
    'Learn more about managing default labels for your organization.': '瞭解如何管理組織的預設標籤。',
    'Are you sure? Deleting a label will remove as a default, and no future repositories will receive this label when created.':
      '確定嗎？刪除後，此標籤將不再是預設標籤，日後建立的儲存庫都不會包含此標籤。',

    // 自定义属性
    'Custom properties allow you to decorate your repositories with information such as compliance frameworks, data sensitivity, or project details.':
      '自訂屬性可讓你為儲存庫加上合規架構、資料敏感度或專案詳細資料等資訊。',
    'New property': '新增屬性',
    'Set values': '設定值',
    'Save property': '儲存屬性',
    'Delete property': '刪除屬性',
    'Edit property': '編輯屬性',
    'Edit properties': '編輯屬性',
    'Allowed values': '允許的值',
    'Default value': '預設值',
    'Allow repository actors to set this property': '允許儲存庫執行者設定此屬性',
    'When enabled, repository users and apps with the repository-level "custom properties" fine-grained permission will be able to set and update the property value for their repository.':
      '啟用後，具有儲存庫層級「自訂屬性」精細權限的儲存庫使用者和應用程式可以為其儲存庫設定並更新屬性值。',
    'Require this property for all repositories': '要求所有儲存庫設定此屬性',
    'Repositories that don’t have an explicit value for this property will inherit the default value.':
      '未明確設定此屬性值的儲存庫將繼承預設值。',
    "Repositories that don't have an explicit value for this property will inherit the default value.":
      '未明確設定此屬性值的儲存庫將繼承預設值。',
    'Require explicit user-specified values': '要求使用者明確指定值',
    'Accept suggestion': '接受建議',
    'True/false': '真/假',
    'No custom properties': '沒有自訂屬性',
    'Repository custom property suggestions': '儲存庫自訂屬性建議',

    // 规划：议题类型、议题字段
    'Create new type': '建立新類型',
    'Type name': '類型名稱',
    'Customize the issue types for this organization. Issue types can be used to classify and manage issues in repositories across the organization.':
      '自訂此組織的議題類型。議題類型可用來分類及管理組織內各儲存庫的議題。',
    'Unique name for your issue type': '議題類型的唯一名稱',
    'What is this type for?': '這個類型的用途是什麼？',
    // 默认议题类型的说明（类型选择器、议题类型列表）
    'A specific piece of work': '一項具體工作',
    'An unexpected problem or behavior': '非預期的問題或行為',
    'A request, idea, or new functionality': '請求、構想或新功能',
    'Pinned issue fields': '已釘選的議題欄位',
    // 议题类型编辑页（组织与个人设置同一组件）：置顶字段、选择字段面板、禁用 / 启用 / 删除
    'The fields shown by default when this issue type is selected.': '選取此議題類型時預設顯示的欄位。',
    'Add new pinned issue field': '新增釘選的議題欄位',
    'No pinned fields yet': '尚無釘選的欄位',
    "You haven't added any fields for this type. Selected fields will appear here.": '尚未為此類型新增任何欄位。選取的欄位會顯示在這裡。',
    'You haven’t added any fields for this type. Selected fields will appear here.': '尚未為此類型新增任何欄位。選取的欄位會顯示在這裡。',
    'Pin issue field': '釘選議題欄位',
    'Filter fields': '篩選欄位',
    'Issue Fields results': '議題欄位結果',
    'No issue fields were found': '找不到議題欄位',
    'Try searching with a different query for results.': '請嘗試使用其他搜尋字詞。',
    'Disable issue type': '停用議題類型',
    'This will prevent the issue type from being used on new or existing issues.': '這將禁止在新的或現有的議題上使用此議題類型。',
    'Enable issue type': '啟用議題類型',
    'Re-enable the issue type to allow it to be added to new repositories and issues.':
      '重新啟用此議題類型，使其可新增至新的儲存庫和議題。',
    'Delete issue type': '刪除議題類型',
    'Deleting an issue type will remove it from all existing issues. This action cannot be undone.':
      '刪除議題類型會將其從所有現有議題中移除。此動作無法復原。',
    // 议题字段：个人设置的权限选项说明、空状态与入门字段
    'Field is visible to you and any repository collaborators': '你和所有儲存庫協作者都可以看到此欄位',
    'You don’t have any issue fields yet': '你還沒有任何議題欄位',
    "You don't have any issue fields yet": '你還沒有任何議題欄位',
    'Create your own field, or add a starter set with Priority, Start date, Target date, and Effort. You can edit or delete them anytime.':
      '建立自己的欄位，或新增包含優先順序、開始日期、目標日期和工作量的入門欄位。之後可隨時編輯或刪除。',
    'Add starter fields': '新增入門欄位',
    'Adding starter fields..': '正在新增入門欄位..',
    'Adding starter fields...': '正在新增入門欄位...',
    'Field Visibility': '欄位可見度',
    'Field visibility': '欄位可見度',
    'Organization only': '僅限組織',
    'Pin to types': '釘選到類型',
    'Issues without a type': '沒有類型的議題',
    'Save field': '儲存欄位',
    'Single-select': '單選',

    // Codespaces
    'To manage Codespace ownership settings, please': '若要管理程式碼空間擁有權設定，請',
    'to enable your organization.': '來為你的組織啟用。',
    'Codespaces access': '程式碼空間存取權',
    "Manage access to GitHub Codespaces for your organization's members on private and internal repositories. Codespaces are always available on public repositories.":
      '管理組織成員在私人和內部儲存庫中使用 GitHub 程式碼空間的存取權。公開儲存庫一律可以使用程式碼空間。',
    'Manage access to GitHub Codespaces for your organization’s members on private and internal repositories. Codespaces are always available on public repositories.':
      '管理組織成員在私人和內部儲存庫中使用 GitHub 程式碼空間的存取權。公開儲存庫一律可以使用程式碼空間。',
    // 「By enabling Codespaces, you agree to GitHub’s」<a>条款</a>「and approve of these terms …」：原文无逗号，译文不加
    'By enabling Codespaces, you agree to GitHub’s': '啟用程式碼空間即表示你同意 GitHub 的',
    "By enabling Codespaces, you agree to GitHub's": '啟用程式碼空間即表示你同意 GitHub 的',
    'additional products and features terms': '附加產品和功能條款',
    'and approve of these terms on behalf of your organization.': '並代表你的組織認可這些條款。',
    'Disable GitHub Codespaces for all organization owned private and internal repositories':
      '為組織擁有的所有私人和內部儲存庫停用 GitHub 程式碼空間',
    'Enable for specific members or teams': '為特定成員或團隊啟用',
    'Enable GitHub Codespaces for specific organization members or teams on all organization owned private and internal repositories':
      '為特定組織成員或團隊在組織擁有的所有私人和內部儲存庫中啟用 GitHub 程式碼空間',
    'Enable for all members': '為所有成員啟用',
    'Enable GitHub Codespaces for all organization members on all organization owned private and internal repositories':
      '為所有組織成員在組織擁有的所有私人和內部儲存庫中啟用 GitHub 程式碼空間',
    'Enable for all members and outside collaborators': '為所有成員和外部協作者啟用',
    'Enable GitHub Codespaces for all organization members and outside collaborators on all organization owned private and internal repositories':
      '為所有組織成員和外部協作者在組織擁有的所有私人和內部儲存庫中啟用 GitHub 程式碼空間',
    'Codespace ownership': '程式碼空間擁有權',
    'Control who owns codespaces created by your organization’s members on organization owned repositories. Codespace ownership dictates who is billed for usage, whose policies apply, and where audit logs are sent.':
      '控制組織成員在組織擁有的儲存庫中建立的程式碼空間歸誰所有。程式碼空間擁有權決定使用量向誰計費、適用誰的政策，以及稽核記錄傳送至何處。',
    "Control who owns codespaces created by your organization's members on organization owned repositories. Codespace ownership dictates who is billed for usage, whose policies apply, and where audit logs are sent.":
      '控制組織成員在組織擁有的儲存庫中建立的程式碼空間歸誰所有。程式碼空間擁有權決定使用量向誰計費、適用誰的政策，以及稽核記錄傳送至何處。',
    'Organization ownership': '組織擁有權',
    'All codespaces created by your organization’s members on your organization’s repositories are owned by the organization':
      '組織成員在組織儲存庫中建立的所有程式碼空間都歸組織所有',
    "All codespaces created by your organization's members on your organization's repositories are owned by the organization":
      '組織成員在組織儲存庫中建立的所有程式碼空間都歸組織所有',
    'User ownership': '使用者擁有權',
    'All codespaces created by your organization’s members on your organization’s repositories are owned by the creating member':
      '組織成員在組織儲存庫中建立的所有程式碼空間都歸建立者所有',
    "All codespaces created by your organization's members on your organization's repositories are owned by the creating member":
      '組織成員在組織儲存庫中建立的所有程式碼空間都歸建立者所有',
    'Any codespaces created on organization owned repositories and owned by organization members or collaborators with codespaces access will transfer ownership to your organization.':
      '在組織擁有的儲存庫中建立、且歸具有程式碼空間存取權的組織成員或協作者所有的程式碼空間，擁有權將轉移給你的組織。',
    'All codespaces currently owned by your organization will transfer ownership to the creating user.':
      '你的組織目前擁有的所有程式碼空間，擁有權都將轉移給建立者。',
    'Update GitHub Codespaces ownership settings?': '要更新 GitHub 程式碼空間擁有權設定嗎？',
    'Codespace policies': '程式碼空間政策',
    'Create Policy': '建立政策',
    'Create policy': '建立政策',
    'Policy name': '政策名稱',
    'Policy name is too long (maximum is 64 characters)': '政策名稱過長（上限為 64 個字元）',
    "Policy name can't be blank": '政策名稱不得空白',
    'Policy name can’t be blank': '政策名稱不得空白',
    'Add constraint': '新增限制條件',
    'Machine types': '機器類型',
    'Maximum codespaces per user': '每位使用者的程式碼空間數量上限',
    'Maximum idle timeout': '閒置逾時上限',
    'Retention period': '保留期限',
    'Base images': '基底映像檔',
    'Port visibility': '連接埠可見度',
    'Change policy target': '變更政策目標',
    'Delete policy': '刪除政策',

    // 沙盒
    'Cloud sandbox access': '雲端沙箱存取權',
    "Manage cloud sandbox access for your organization's members.": '管理組織成員的雲端沙箱存取權。',
    'Manage cloud sandbox access for your organization’s members.': '管理組織成員的雲端沙箱存取權。',
    'If preview features are enabled, you agree to the': '啟用預覽功能即表示你同意',
    'Pre-Release Terms': '發行前版本條款',
    'Cloud sandbox access is not available for organization members.': '組織成員無法使用雲端沙箱。',
    'Members of this organization can use cloud sandboxes.': '此組織的成員可以使用雲端沙箱。',

    // 讨论
    'Discussions for your organization': '組織討論',
    'Setting up Discussions for your organization will allow you to broadcast updates, answer questions, and hold conversations for the entire organization.':
      '為組織設定討論後，你可以向整個組織發布最新動態、回答問題和展開對話。',
    'Enable discussions for this organization': '為此組織啟用討論',
    'Choose a source repository that will host the discussions.': '選擇存放討論的來源儲存庫。',
    // 原文界面名无引号，译文不加
    'All discussions on the source repository will be surfaced to the organization Discussions tab.':
      '來源儲存庫中的所有討論都將顯示在組織的討論分頁中。',
    'Permissions from the repository will be applied to the organization Discussions. By default, all members of the organization will be able to create and comment on discussions.':
      '儲存庫的權限將套用至組織討論。預設情況下，組織的所有成員都可以建立討論並留言。',
    'Members can now share updates or ask questions to the entire organization.': '成員現在可以向整個組織分享最新動態或提問。',
    'For more information, see our documentation.': '詳情請參閱我們的說明文件。',
    'Choose a repository': '選擇儲存庫',
    'Search for a repository': '搜尋儲存庫',
    'Organization discussions has been set up!': '組織討論已設定完成！',

    // 项目
    'Projects on GitHub help you organize and prioritize your work. You can create projects for specific feature work, comprehensive roadmaps, or even release checklists.':
      'GitHub 上的專案可協助你整理工作並排定優先順序。你可以為特定功能的開發工作、完整的藍圖，甚至發行版本檢查清單建立專案。',
    'Enable Projects for the organization': '為組織啟用專案',
    'This allows members to create projects for the': '這可讓成員為',
    'organization. Members can create projects to organize and track issues from any': '組織建立專案。成員可以建立專案來整理並追蹤任何',
    '-owned repository.': '所擁有儲存庫中的議題。',
    'Allow members to change project visibilities for this organization': '允許成員變更此組織的專案可見度',
    'If enabled, members with admin permissions on a project can make the project public or private. If disabled, only organization owners can make the project public or private. All projects are private by default.':
      '啟用後，擁有專案管理員權限的成員可以將專案設為公開或私人。停用後，只有組織擁有者可以將專案設為公開或私人。所有專案預設為私人。',
    'Recommended templates': '建議的範本',
    'Customize a selection of recommended project templates for this organization. These templates will be surfaced first when a member of the organization creates a new project.':
      '為此組織自訂一組建議的專案範本。組織成員建立新專案時，會優先顯示這些範本。',
    'Create your first GitHub project template': '建立你的第一個 GitHub 專案範本',
    'Customize recommended templates': '自訂建議的範本',

    // 托管计算网络
    'Network configurations': '網路設定',
    'New network configuration': '新增網路設定',
    'Azure private network': 'Azure 私人網路',
    'Add Azure Virtual Network': '新增 Azure 虛擬網路',
    'Enable failover VNET': '啟用容錯移轉 VNET',
    'Disable failover VNET': '停用容錯移轉 VNET',
    'Add failover network': '新增容錯移轉網路',
    'Edit configuration': '編輯設定',
    'Network settings resource ID': '網路設定資源 ID',
    'Failover network': '容錯移轉網路'
  },
  scoped: {
    // 议题字段：类型按钮、权限选项、置顶对话框的分组、单选选项的文本框
    'Single Select': '單選',
    Restricted: '受限',
    Types: '類型',
    'Label text': '標籤文字',
    'issue types': '議題類型',
    // 自定义属性：批量设置值时保持原值的选项
    unchanged: '保持不變',
    // 自定义属性：新建属性表单的「Type」标签（全局搜索提示「Type <kbd>/</kbd> to search」由 kbd 整句处理，不受影响）
    Type: '類型',
    // 预置议题字段与议题类型的名称（组织自定义的名称是用户内容，不收）
    Priority: '優先順序',
    'Start date': '開始日期',
    'Target date': '目標日期',
    Effort: '工作量',
    Task: '任務',
    Bug: '錯誤',
    Feature: '功能',
    // 预置单选选项（High、Medium、Low 由全局词条译出）
    Urgent: '緊急',
    // 「Choose whether <a>commit comments</a> are …」里的链接
    'commit comments': '提交評論',
    // 与个人设置、存储库设置共用
    'Description (optional)': '描述（選填）',
    Color: '顏色',
    'Get a new color': '換一個顏色',
    'Choose from default colors:': '從預設顏色中選擇：',
    label: '個標籤',
    labels: '個標籤',
    Properties: '屬性',
    Text: '文字',
    Number: '數字',
    'Learn more about custom properties.': '瞭解自訂屬性。',

    // 存储库默认设置：默认分支、主题
    'Choose the default branch for new repositories in this organization.': '為此組織中的新儲存庫選擇預設分支。',
    'Repository topics': '儲存庫主題',

    // 自定义属性：定义、设置值、删除
    'Property name': '屬性名稱',
    'Add value': '新增值',
    'No value': '無值',
    'No default value': '無預設值',
    'Edit custom properties': '編輯自訂屬性',
    'Repository custom properties': '儲存庫自訂屬性',
    'Property values': '屬性值',
    'Set property values': '設定屬性值',
    'Update values': '更新值',
    'Values updated': '值已更新',
    'Property saved': '屬性已儲存',
    'Property deleted': '屬性已刪除',
    'Delete custom property': '刪除自訂屬性',
    'Are you sure you want to delete this property?': '確定要刪除此屬性嗎？',
    'This will remove the property and all its values from repositories.': '這會從儲存庫中移除此屬性及其所有值。',
    'Deleting this property will remove its values from all repositories.': '刪除此屬性會從所有儲存庫中移除其值。',

    // 规划：议题类型、议题字段
    'Create type': '建立類型',
    'Edit type': '編輯類型',
    'Save type': '儲存類型',
    'Enable type': '啟用類型',
    'Disable type': '停用類型',
    'Delete type': '刪除類型',
    'Disabled types': '已停用的類型',
    'Create field': '建立欄位',

    // Pages：已验证的域
    'Verify domain': '驗證網域',
    'Delete domain': '刪除網域',

    // 项目（经典）
    'Enable projects (classic) for the organization': '為組織啟用專案（傳統）',

    // 软件包（与个人设置共用）
    'Package creation': '套件建立',
    'Members will be able to publish only the selected visibility types for packages and containers. Outside collaborators can never publish packages or containers.':
      '成員只能發布所選可見度類型的套件和容器。外部協作者一律無法發布套件或容器。',
    'Members will be able to create public packages, visible to anyone.': '成員可以建立公開套件，任何人都能看見。',
    'Members will be able to create private packages, visible to organization members with permission.':
      '成員可以建立私人套件，只有具備權限的組織成員能看見。',
    'Members will be able to create internal packages, visible to all organization/enterprise members.':
      '成員可以建立內部套件，所有組織/企業成員都能看見。',
    'Default package settings': '預設套件設定',
    'Default Package Settings': '預設套件設定',
    'Deleted packages': '已刪除的套件',
    'These are packages that have been previously deleted belonging to this organization. You can restore a package deleted within the last 30 days.':
      '以下是此組織先前刪除的套件。你可以還原過去 30 天內刪除的套件。',

    // Pages（与个人设置共用）
    'There are no verified domains for this organization.': '此組織沒有已驗證的網域。',

    // 议题类型：颜色选择的提示；议题字段：单选选项的高级移动对话框（「<选项> will be first item in the list.」选项名在前一个元素里时的后半句）
    Gray: '灰色',
    Blue: '藍色',
    Green: '綠色',
    Yellow: '黃色',
    Orange: '橘色',
    Red: '紅色',
    Pink: '粉紅色',
    Purple: '紫色',
    Item: '項目',
    Action: '動作',
    'will be first item in the list.': '將成為清單第一項。',
    'will be last item in the list.': '將成為清單最後一項。'
  },
  regexp: [
    // 议题字段、议题类型编辑页：标题「<a>议题字段</a> / Effort」「<a>议题类型</a> / Task」的后半段，单选选项、置顶字段的操作与拖动按钮
    [
      new RegExp(`^/ (${Object.keys({ ...PRESET_FIELDS, ...PRESET_TYPES }).join('|')})$`),
      (_, name: string) => `/ ${pick(PRESET_FIELDS, name) ?? PRESET_TYPES[name]}`
    ],
    [/^Open field actions for (.+)$/, (_, name: string) => `開啟「${pick(PRESET_NAMES, name) ?? name}」的動作`],
    [new RegExp(`^Move (${Object.keys(PRESET_NAMES).join('|')})$`), (_, name: string) => `移動「${PRESET_NAMES[name]}」`],
    [/^Open edit dialog for (.+)$/, (_, name: string) => `開啟「${pick(PRESET_OPTIONS, name) ?? name}」的編輯對話方塊`],
    [/^Advanced move (.+?)(\.\.\.|…)$/, (_, name: string, dots: string) => `進階移動「${pick(PRESET_OPTIONS, name) ?? name}」${dots}`],
    [new RegExp(`^Remove (${Object.keys(PRESET_NAMES).join('|')})$`), (_, name: string) => `移除「${PRESET_NAMES[name]}」`],
    // 单选选项的高级移动对话框：移动结果预览
    [/^(.+) will be first item in the list\.$/, (_, name: string) => `「${pick(PRESET_OPTIONS, name) ?? name}」將成為清單第一項。`],
    [/^(.+) will be last item in the list\.$/, (_, name: string) => `「${pick(PRESET_OPTIONS, name) ?? name}」將成為清單最後一項。`],
    [
      /^(.+) will be between (.+) and (.+)\.$/,
      (_, name: string, first: string, second: string) =>
        `「${pick(PRESET_OPTIONS, name) ?? name}」將位於「${pick(PRESET_OPTIONS, first) ?? first}」和「${pick(PRESET_OPTIONS, second) ?? second}」之間。`
    ],
    // 议题类型：禁用、删除确认（类型名保留原文）
    [
      /^The "(.+)" issue type will no longer be available to use\. If it is re-enabled in the future, it will be preserved on existing issues of this type unless a different type has been added\.$/,
      '議題類型「$1」將無法再使用。日後重新啟用時，此類型的現有議題會保留它，除非已改為其他類型。'
    ],
    [
      /^This will remove the "(.+)" issue type from all issues\. This action cannot be undone\.$/,
      '這將從所有議題中移除議題類型「$1」。此動作無法復原。'
    ],
    // 自定义属性：设置值、删除前的使用情况、匹配的存储库数（筛选框计数「N repositories matching」由 org-policies 收录）
    [/^Set properties on (.+)$/, '設定 $1 的屬性'],
    [/^(\d+) repositor(?:y|ies) found that uses? the property:$/, '找到 $1 個使用此屬性的儲存庫：'],
    [/^Matching (\d+) repositor(?:y|ies)$/, '符合 $1 個儲存庫'],
    // 议题字段：删除确认（字段名是确认口令，保留原文）
    [/^Delete "(.+)" issue field$/, '刪除議題欄位「$1」'],
    [
      /^This will remove the "(.+)" issue field from all of your issues and projects\. This action cannot be undone\.$/,
      '這將從你的所有議題和專案中移除議題欄位「$1」。此動作無法復原。'
    ],
    [/^Please type "(.+)" to confirm$/, '請輸入「$1」以確認'],
    // 议题字段计数，自定义字段与类型的无障碍名称、操作提示
    [/^(\d+) Issue fields?$/, '$1 個議題欄位'],
    [/^Issue field: (.+)$/, '議題欄位：$1'],
    [/^Open field options for (.+)$/, (_, name: string) => joinCjk(joinCjk('開啟', name), '欄位選項')],
    [/^"(.+)" Issue type list item$/, '議題類型清單項目「$1」'],
    [/^Open type options for (.+)$/, (_, name: string) => joinCjk(joinCjk('開啟', name), '類型選項')],
    // 新建标签的颜色色块：Color #b60205
    [/^Color (#[\da-fA-F]{6})$/, '顏色 $1'],
    [
      new RegExp(`^New repositories created in ${ORG} will use ${BRANCH} as their default branch\\.$`),
      '在 $1 中建立的新儲存庫將使用 $2 作為預設分支。'
    ],
    [new RegExp(`^Your default branch name will be ${BRANCH}$`), '預設分支名稱將為 $1'],
    [/^(\d+) labels?$/, '$1 個標籤'],
    [/^(\d+) properties$/, '$1 個屬性'],
    [/^(\d+) property$/, '$1 個屬性'],
    [/^(\d+) issue types?$/, '$1 個議題類型'],
    // 议题类型列表标题：3 types (max 25)
    [/^(\d+) types?$/, '$1 個類型'],
    [/^\(max (\d+)\)$/, '（最多 $1 個）'],
    [/^(\d+) types? \(max (\d+)\)$/, '$1 個類型（最多 $2 個）'],
    [/^(\d+) issue fields?$/, '$1 個議題欄位'],
    [/^(\d+) network configurations?$/, '$1 個網路設定'],
    [new RegExp(`^No recoverable packages were found for ${ORG}\\.$`), '找不到 $1 可還原的套件。'],
    [/^Successfully verified ([\w-]+(?:\.[\w-]+)+?)(\.?)$/, (_, domain: string, dot: string) => `已成功驗證 ${domain}${dot ? '。' : ''}`],
    // 新建自定义属性：类型菜单按钮的无障碍名称
    [/^Type: (Text|Single select|Multi select|True\/false|URL)$/, (_, type: string) => `類型：${PROPERTY_TYPES[type]}`]
  ],
  inline: [
    // 议题字段计数：「<span>2</span> Issue fields」
    ['{} Issue fields', '{} 個議題欄位'],
    ['{} Issue field', '{} 個議題欄位'],
    // 议题字段「置顶到议题」说明：Choose which <a>issue types</a> show this field …
    ['Choose which {} show this field when viewing and creating issues.', '選擇在檢視和建立議題時顯示此欄位的{}。'],
    [
      'Choose whether {} are enabled or disabled by default for repositories in this organization. Individual repositories can override this default. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.',
      '選擇此組織的儲存庫預設啟用還是停用{}。各儲存庫可以覆寫此預設設定。現有的提交評論不受此設定影響，仍可檢視、編輯和刪除。'
    ]
  ]
} satisfies PageDictionary
