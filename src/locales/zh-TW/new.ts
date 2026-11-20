import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import plans from './new/plans'

/** 创建提示里的存储库可见性 */
const VISIBILITY: Readonly<Record<string, string>> = {
  public: '公開',
  private: '私人',
  internal: '內部'
}

/** 邀请页「擁有者將能看到 / 可能會看到」的语气 */
const VISIBILITY_VERB: Readonly<Record<string, string>> = {
  will: '將能看到',
  may: '可能會看到'
}

/**
 * 新建类页面（页面类型 new，路由见 page.ts）：
 * - 新建存储库：/new、/organizations/:org/repositories/new（新版分区表单与经典表单）
 * - 从模板创建：/:owner/:repo/generate
 * - 导入存储库：/new/import；导入进度：/:owner/:repo/import
 * - 复刻：/:owner/:repo/fork
 * - 新建组织：/organizations/plan、/organizations/new、/account/organizations/new
 * - 定价页：/pricing（计划卡片与比较表同选择计划页）
 * - 存储库转让：/:owner/:repo/transfer
 * - 邀请：/:owner/:repo/invitations、/orgs/:org/invitation、/users/:user/succession/invitation
 *
 * static 收句子和较长的独特片段（任何页面译法相同）；通用短词和依赖语境的片段放 scoped，只在 new 生效。
 * 组织创建后的「開始協作」页路由未确认，相关词条仍放 static。
 * 选择计划页的比较功能表见 new/plans.ts。
 * 产品名、方案名译成中文（用户决定，2026-10-27）：计划名 Free / Team / Enterprise → 免費版 / 團隊版 / 企業版（scoped），
 * GitHub Actions / Codespaces / Packages / Pages / Marketplace → GitHub 動作 / 程式碼空間 / 套件 / 頁面 / 市集，
 * Enterprise Cloud / Server → 企業雲端 / 企業伺服器，Copilot Business / cloud agent / coding agent → Copilot 商務版 / 雲端代理 / 程式開發代理。
 * 自造品牌词（GitHub、Copilot、Dependabot、CodeQL、Git）与技术缩写（SSO、SCIM、USD）保留。
 */
const base = {
  static: {
    // 创建组织后的等待页
    'Creating your organization': '正在建立組織',
    'You will continue automatically when your organization is ready.': '組織就緒後將自動繼續。',
    // 新建存储库：页头
    'Create a new repository': '建立新儲存庫',
    "Repositories contain a project's files and version history.": '儲存庫包含專案的檔案和版本歷史記錄。',
    'Repositories contain a project’s files and version history.': '儲存庫包含專案的檔案和版本歷史記錄。',
    'Have a project elsewhere?': '在其他地方有專案嗎？',
    'Import a repository': '匯入儲存庫',
    'Import a repository.': '匯入儲存庫。',
    "Repositories contain a project's files and version history. Have a project elsewhere? Import a repository.":
      '儲存庫包含專案的檔案和版本歷史記錄。在其他地方有專案嗎？匯入儲存庫。',
    'Repositories contain a project’s files and version history. Have a project elsewhere? Import a repository.':
      '儲存庫包含專案的檔案和版本歷史記錄。在其他地方有專案嗎？匯入儲存庫。',
    'A repository contains all project files, including the revision history.': '儲存庫包含專案的所有檔案，包括修訂歷史記錄。',
    'Already have a project repository elsewhere?': '在其他地方已有專案儲存庫嗎？',
    'Required fields are marked with an asterisk (*).': '必填欄位以星號 (*) 標示。',
    'Switch back to classic experience': '切換回傳統體驗',
    'Try the new experience': '試用新體驗',
    '🎉 Try the new experience': '🎉 試用新體驗',

    // 新建存储库：常规（所有者、名称与可用性）
    'Choose an owner': '選擇擁有者',
    'Repository owner and name': '儲存庫擁有者和名稱',
    'Great repository names are short and memorable. How about': '好的儲存庫名稱簡短好記。不妨試試',
    'Great repository names are short and memorable. Need inspiration? How about': '好的儲存庫名稱簡短好記。需要靈感嗎？不妨試試',
    'Checking availability…': '正在檢查可用性…',
    'Checking availability...': '正在檢查可用性...',
    'Your new repository will be created as': '你的新儲存庫將建立為',
    'New repository name must not be blank': '新儲存庫名稱不能空白',
    'New repository name must not be blank.': '新儲存庫名稱不能空白。',
    'The repository name can only contain ASCII letters, digits, and the characters ., -, and _.':
      '儲存庫名稱只能包含 ASCII 字母、數字和 .、-、_ 字元。',
    'The repository name can only contain ASCII letters, digits, and the characters': '儲存庫名稱只能包含 ASCII 字母、數字和字元',
    'Name already exists on this account': '此帳號已有同名儲存庫',
    'Repository creation failed.': '儲存庫建立失敗。',

    // 新建存储库：配置（可见性、模板、自述文件、.gitignore、许可证）
    'Choose visibility': '選擇可見度',
    'Choose who can see and commit to this repository': '選擇誰可以查看並提交到此儲存庫',
    'Choose who can see and commit to this repository.': '選擇誰可以查看並提交到此儲存庫。',
    'Anyone on the internet can see this repository. You choose who can commit.':
      '網際網路上的任何人都可以查看此儲存庫。由你選擇誰可以提交。',
    'You choose who can see and commit to this repository.': '由你選擇誰可以查看並提交到此儲存庫。',
    'Enterprise members can see this repository. You choose who can commit.': '企業成員可以查看此儲存庫。由你選擇誰可以提交。',
    'You may not create private repositories by organization policy.': '依組織政策，你不能建立私人儲存庫。',
    'Start with a template': '從範本開始',
    'Templates pre-configure your repository with files.': '範本會以檔案預先設定你的儲存庫。',
    'Repository template': '儲存庫範本',
    'No template': '無範本',
    'Fetching templates…': '正在擷取範本…',
    'Fetching templates...': '正在擷取範本...',
    'No templates available.': '沒有可用的範本。',
    "Start your repository with a template repository's contents.": '以範本儲存庫的內容建立你的儲存庫。',
    'Start your repository with a template repository’s contents.': '以範本儲存庫的內容建立你的儲存庫。',
    'Include all branches': '包含所有分支',
    'Copy all branches from': '複製',
    'and not just the default branch.': '的所有分支，而不只是預設分支。',
    'If enabled, all branches from the template repository will be included.': '啟用後，將包含範本儲存庫的所有分支。',
    'Create repository from template': '從範本建立儲存庫',
    'Add README': '新增讀我檔案',
    'READMEs can be used as longer descriptions.': '讀我檔案可用作較長的描述。',
    'About READMEs': '關於讀我檔案',
    'Add a README file': '新增讀我檔案',
    'This is where you can write a long description for your project.': '你可以在這裡為專案撰寫詳細描述。',
    'Learn more about READMEs.': '瞭解讀我檔案。',
    'Initialize this repository with:': '使用下列內容初始化此儲存庫：',
    'Skip this step if you’re importing an existing repository.': '如果要匯入現有儲存庫，請略過此步驟。',
    "Skip this step if you're importing an existing repository.": '如果要匯入現有儲存庫，請略過此步驟。',
    'Add .gitignore': '新增 .gitignore',
    '.gitignore tells git which files not to track.': '.gitignore 會告訴 Git 不要追蹤哪些檔案。',
    'About ignoring files': '關於忽略檔案',
    'Choose a .gitignore template': '選擇 .gitignore 範本',
    'No .gitignore': '無 .gitignore',
    '.gitignore template:': '.gitignore 範本：',
    '.gitignore template': '.gitignore 範本',
    'Choose which files not to track from a list of templates.': '從範本清單中選擇不要追蹤哪些檔案。',
    'Learn more about ignoring files.': '瞭解忽略檔案。',
    'Add license': '新增授權條款',
    'Licenses explain how others can use your code.': '授權條款說明他人可以如何使用你的程式碼。',
    'About licenses': '關於授權條款',
    'Choose a license': '選擇授權條款',
    'Search licenses': '搜尋授權條款',
    'No license': '無授權條款',
    'License:': '授權條款：',
    "A license tells others what they can and can't do with your code.": '授權條款會告訴他人可以用你的程式碼做什麼、不可以做什麼。',
    'A license tells others what they can and can’t do with your code.': '授權條款會告訴他人可以用你的程式碼做什麼、不可以做什麼。',
    'Learn more about licenses.': '瞭解授權條款。',

    // 新建存储库：GitHub 应用（所有者名在 <strong> 中）
    'Connect GitHub Apps': '連接 GitHub 應用程式',
    'Connect this repository to apps': '將此儲存庫連接到',
    'Choose GitHub Apps': '選擇 GitHub 應用程式',
    'Grant your Marketplace apps access to this repository': '授予你的市集應用程式存取此儲存庫的權限',

    // 新建存储库：Copilot 快速启动（链接文字“Copilot cloud agent”由 common 翻译）
    'Jumpstart your project with Copilot': '使用 Copilot 快速啟動專案',
    'Jumpstart your project with Copilot (optional)': '使用 Copilot 快速啟動專案（選填）',
    "what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it's ready.":
      '你想在此儲存庫中建置什麼。儲存庫建立後，Copilot 會建立拉取請求，其中包含產生的檔案（例如基本應用程式、起始程式碼或你描述的其他功能），並在準備就緒後請求你審查。',
    'what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it’s ready.':
      '你想在此儲存庫中建置什麼。儲存庫建立後，Copilot 會建立拉取請求，其中包含產生的檔案（例如基本應用程式、起始程式碼或你描述的其他功能），並在準備就緒後請求你審查。',
    "Tell Copilot cloud agent what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it's ready.":
      '告訴 Copilot 雲端代理你想在此儲存庫中建置什麼。儲存庫建立後，Copilot 會建立拉取請求，其中包含產生的檔案（例如基本應用程式、起始程式碼或你描述的其他功能），並在準備就緒後請求你審查。',
    'Tell Copilot cloud agent what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it’s ready.':
      '告訴 Copilot 雲端代理你想在此儲存庫中建置什麼。儲存庫建立後，Copilot 會建立拉取請求，其中包含產生的檔案（例如基本應用程式、起始程式碼或你描述的其他功能），並在準備就緒後請求你審查。',
    'About Copilot coding agent': '關於 Copilot 程式開發代理',
    'About Copilot cloud agent': '關於 Copilot 雲端代理',
    'Describe what you want Copilot to build': '描述你想讓 Copilot 建置的內容',

    // 新建存储库：组织必填的自定义属性
    'Required properties': '必填屬性',
    'This organization requires the following custom properties': '此組織要求設定下列自訂屬性',
    'Continue: Configuration': '繼續：設定',

    // 新建存储库：底部提示与提交（组织名被 <strong> 拆开时，句尾 organization. 由 common 翻译）
    'Change the default name in': '若要變更預設名稱請前往',
    'Change the default name in your settings.': '可在你的設定中變更預設名稱。',
    'You are creating a public repository in your personal account.': '你正在個人帳號中建立公開儲存庫。',
    'You are creating a private repository in your personal account.': '你正在個人帳號中建立私人儲存庫。',
    'You are creating a public repository in the': '你正在建立的公開儲存庫將位於',
    'You are creating a private repository in the': '你正在建立的私人儲存庫將位於',
    'You are creating an internal repository in the': '你正在建立的內部儲存庫將位於',
    'Create repository': '建立儲存庫',
    // 三点写法 Creating repository... / Creating fork... 由 codespaces 收录
    'Creating repository…': '正在建立儲存庫…',

    // 新建存储库：与用户名 / .github 同名的特殊存储库（文字被 <strong> / <code> 拆开；片段不加原文没有的标点）
    'You found a secret!': '你發現了一個祕密！',
    'is a ✨': '是一個 ✨',
    '✨ repository that you can use to add a': '✨ 儲存庫供你將',
    'to your GitHub profile. Make sure it’s public and initialize it with a': '新增到你的 GitHub 個人檔案。請確認它是公開的，並使用',
    "to your GitHub profile. Make sure it's public and initialize it with a": '新增到你的 GitHub 個人檔案。請確認它是公開的，並使用',
    // 组织的 .github 存储库：README 放在 profile 目录，片段语序见 scoped 的 in the、directory to get started.
    "to your organization's GitHub profile. Make sure it’s public and initialize it with a":
      '新增到你的 GitHub 組織資料。請確認它是公開的，並在初始化時將',
    'to your organization’s GitHub profile. Make sure it’s public and initialize it with a':
      '新增到你的 GitHub 組織資料。請確認它是公開的，並在初始化時將',
    "to your organization's GitHub profile. Make sure it's public and initialize it with a":
      '新增到你的 GitHub 組織資料。請確認它是公開的，並在初始化時將',

    // 导入存储库（/new/import）
    'Import your project to GitHub': '將你的專案匯入 GitHub',
    'Import all the files, including revision history, from another version control system.':
      '從其他版本控制系統匯入所有檔案，包括修訂歷史記錄。',
    'Import all the files, including the revision history, from another version control system.':
      '從其他版本控制系統匯入所有檔案，包括修訂歷史記錄。',
    'Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the':
      '匯入 Mercurial、Subversion 和 Team Foundation Version Control (TFVC) 儲存庫的支援已於 2024年4月12日終止。如需詳細資訊，請參閱',
    'Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the changelog.':
      '匯入 Mercurial、Subversion 和 Team Foundation Version Control (TFVC) 儲存庫的支援已於 2024年4月12日終止。如需詳細資訊，請參閱變更記錄。',
    'Your source repository details': '來源儲存庫詳細資料',
    'The URL for your source repository': '來源儲存庫的 URL',
    'Learn more about the types of': '瞭解',
    'supported VCS': '支援的 VCS 類型',
    'supported VCS.': '支援的 VCS 類型。',
    'importing git repositories': '匯入 Git 儲存庫',
    'Please enter your credentials if required for cloning your remote repository.': '如果複製遠端儲存庫需要認證資訊，請在此輸入。',
    'Your username for your source repository': '你在來源儲存庫的使用者名稱',
    'Your access token or password for your source repository': '你在來源儲存庫的存取權杖或密碼',
    'Your new repository details': '新儲存庫詳細資料',
    'Begin import': '開始匯入',
    'Preparing import…': '正在準備匯入…',
    'Preparing import...': '正在準備匯入...',
    'Importing commits and revision history to GitHub…': '正在將提交和修訂歷史記錄匯入 GitHub…',
    'Importing commits and revision history to GitHub...': '正在將提交和修訂歷史記錄匯入 GitHub...',
    'Your old repository’s clone URL': '舊儲存庫的複製用 URL',
    "Your old repository's clone URL": '舊儲存庫的複製用 URL',
    'Your existing repository': '你的現有儲存庫',

    // 导入进度（/:owner/:repo/import）
    'Your import will begin shortly…': '即將開始匯入…',
    'Your import will begin shortly...': '即將開始匯入...',
    'Preparing your new repository': '正在準備你的新儲存庫',
    'There is no need to keep this window open, we’ll email you when the import is done.':
      '不需要讓此視窗保持開啟，匯入完成後我們會以電子郵件通知你。',
    "There is no need to keep this window open, we'll email you when the import is done.":
      '不需要讓此視窗保持開啟，匯入完成後我們會以電子郵件通知你。',
    "There is no need to keep this window open. We'll email you when the import is done.":
      '不需要讓此視窗保持開啟。匯入完成後我們會以電子郵件通知你。',
    'There is no need to keep this window open. We’ll email you when the import is done.':
      '不需要讓此視窗保持開啟。匯入完成後我們會以電子郵件通知你。',
    'Detecting your project’s version control system…': '正在偵測專案的版本控制系統…',
    "Detecting your project's version control system…": '正在偵測專案的版本控制系統…',
    "Detecting your project's version control system...": '正在偵測專案的版本控制系統...',
    'Importing commits and revision history…': '正在匯入提交和修訂歷史記錄…',
    'Importing commits and revision history...': '正在匯入提交和修訂歷史記錄...',
    'Optimizing repository and pushing commits to GitHub…': '正在最佳化儲存庫並將提交推送到 GitHub…',
    'Optimizing repository and pushing commits to GitHub...': '正在最佳化儲存庫並將提交推送到 GitHub...',
    'Importing complete! Your new repository': '匯入完成！你的新儲存庫',
    'Cancel import': '取消匯入',

    // 复刻（/:owner/:repo/fork）
    'Create a new fork': '建立新分叉',
    'is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.':
      '是儲存庫的副本。分叉儲存庫可讓你自由試驗變更，而不會影響原始專案。',
    'A fork is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.':
      '分叉是儲存庫的副本。分叉儲存庫可讓你自由試驗變更，而不會影響原始專案。',
    'View existing forks.': '查看現有分叉。',
    'By default, forks are named the same as their upstream repository. You can customize the name to distinguish it further.':
      '預設情況下，分叉與其上游儲存庫同名。你可以自訂名稱來進一步區分。',
    'You are creating a fork in your personal account.': '你正在個人帳號中建立分叉。',
    'You are creating a fork in the': '你正在建立的分叉將位於',
    'Create fork': '建立分叉',
    'Creating fork…': '正在建立分叉…',
    'No available destinations to fork this repository.': '沒有可分叉此儲存庫的目的地。',
    "You can't fork this repository at this time.": '你目前無法分叉此儲存庫。',
    'You can’t fork this repository at this time.': '你目前無法分叉此儲存庫。',
    '(fork already exists)': '（分叉已存在）',
    '(repository already exists)': '（儲存庫已存在）',
    'It should only take a few seconds.': '這應該只需要幾秒鐘。',

    // 新建组织：选择计划（/organizations/plan；卡片内容见 scoped）
    'Pick a plan for your organization': '為你的組織選擇方案',
    'Pick a plan': '選擇方案',
    'The basics for organizations and developers': '適用於組織和開發人員的基本功能',
    'The basics for individuals and organizations': '適用於個人和組織的基本功能',
    'Advanced collaboration for individuals and organizations': '適用於個人和組織的進階協作',
    'Security, compliance, and flexible deployment': '安全性、合規性和彈性部署',
    'Create a free organization': '建立免費組織',
    'Continue with Team': '選擇團隊版',

    // 新建组织：组织信息（/account/organizations/new）
    'Set up your organization': '設定你的組織',
    'Tell us about your organization': '介紹一下你的組織',
    'Organization name': '組織名稱',
    'This will be the name of your account on GitHub.': '這將是你在 GitHub 上的帳號名稱。',
    'Your URL will be: https://github.com/': '你的 URL 將是：https://github.com/',
    'Contact email': '聯絡電子郵件',
    'Email is invalid': '電子郵件無效',
    'This organization belongs to:': '此組織屬於：',
    'My personal account': '我的個人帳號',
    'A business or institution': '企業或機構',
    'For example: GitHub, Inc., Example Institute, American Red Cross': '例如：GitHub, Inc.、Example Institute、American Red Cross',
    'Name of business or institution this organization belongs to': '此組織所屬的企業或機構名稱',
    // This business or institution — not <strong>user</strong> (your personal account) — will control this organization.
    'This business or institution — not': '將由此企業或機構而非',
    '(your personal account) — will control this organization.': '（你的個人帳號）控制此組織。',
    'Verify your account': '驗證你的帳號',
    'Get GitHub Copilot Business in this organization': '在此組織中取得 GitHub Copilot 商務版',
    'See Copilot Business docs.': '查看 Copilot 商務版說明文件。',
    // I hereby accept the <a>GitHub Customer Agreement</a> on behalf of my organization and confirm that I have the authority to do so
    // → 我在此接受 GitHub 客戶合約 並確認我有權代表我的組織這麼做
    'I hereby accept the': '我在此接受',
    ". For more information about GitHub's privacy practices, see the": '。如需 GitHub 隱私權做法的詳細資訊，請參閱',
    '. For more information about GitHub’s privacy practices, see the': '。如需 GitHub 隱私權做法的詳細資訊，請參閱',
    'GitHub Privacy Statement': 'GitHub 隱私權聲明',
    'GitHub Customer Agreement': 'GitHub 客戶合約',
    'on behalf of my organization and confirm that I have the authority to do so': '並確認我有權代表我的組織這麼做',

    // 新建组织：邀请成员
    'Start collaborating': '開始協作',
    'Add organization members': '新增組織成員',
    'Organization members will be able to view repositories, organize into teams, review code, and tag other members using @mentions.':
      '組織成員將可查看儲存庫、組成團隊、審查程式碼，並使用 @提及標記其他成員。',
    'Learn more about permissions for organizations →': '瞭解組織權限 →',
    'Search by username, full name or email address': '依使用者名稱、全名或電子郵件地址搜尋',
    'Complete setup': '完成設定',
    'Skip this step': '略過此步驟',

    // 存储库转让（/:owner/:repo/transfer）
    'Transfer repository': '轉移儲存庫',
    'Transfer repository:': '轉移儲存庫：',
    'Transfer this repository to another user or to an organization where you have the ability to create repositories.':
      '將此儲存庫轉移給其他使用者，或轉移到你有權建立儲存庫的組織。',
    'To understand admin access, teams, issue assignments, and redirects after a repository is transferred, see':
      '若要瞭解儲存庫轉移後的管理員存取權、團隊、議題指派和重新導向，請參閱',
    'Transferring a repository': '轉移儲存庫',
    'Transferring may be delayed until the new owner approves the transfer.': '轉移可能會延遲，直到新擁有者核准轉移為止。',
    'that may be affected by this transfer.': '可能會受到這次轉移影響。',
    'New owner': '新擁有者',
    'Select one of my organizations': '選擇我的組織',
    'Specify an organization or username': '指定組織或使用者名稱',
    'and accepts the transfer, they will lose access to private repository features:': '並接受轉移，將無法再使用下列私人儲存庫功能：',
    // 其后是 and <strong>Forks</strong>：「和」前不加顿号
    'Pulse, Contributors, Community, Traffic, Commits, Code Frequency, Network,': '統計、貢獻者、社群、流量、提交、程式碼頻率、網路',
    'Multiple assignees': '多位負責人',
    'Multiple reviewers': '多位審查者',
    'Branch and tag protection rules': '分支和標記保護規則',
    'their plan before accepting the transfer to avoid losing access.': '其方案再接受轉移，以免失去存取權。',
    'Individual users, teams, and apps will be removed from the following options:': '個別使用者、團隊和應用程式將從下列選項中移除：',
    'Repository ruleset bypassers': '可繞過儲存庫規則集的執行者',
    'Protected branch pull request bypassers': '受保護分支中可繞過拉取請求要求的執行者',
    'Protected branch authorized pull request review dismissers': '受保護分支中有權駁回拉取請求審查的執行者',
    'Protected branch authorized pushers': '受保護分支中有權推送的執行者',
    'Protected branch allowed force pushers': '受保護分支中可強制推送的執行者',
    'Warning: This is a potentially destructive action.': '警告：這是可能具有破壞性的動作。',
    'I understand, transfer this repository.': '我瞭解，轉移此儲存庫。',

    // 存储库协作邀请（/:owner/:repo/invitations）
    'invited you to collaborate on': '邀請你協作開發',
    'invited you to collaborate': '邀請你協作',
    'Accept invitation': '接受邀請',
    'Decline invitation': '拒絕邀請',
    'Your public profile information': '你的公開個人檔案資訊',
    'Country of request origin': '請求來源國家/地區',
    'Your access level for this repository': '你對此儲存庫的存取層級',
    'Your IP address': '你的 IP 位址',
    'Is this user sending spam or malicious content?': '此使用者是否在傳送垃圾內容或惡意內容？',

    // 组织邀请（/orgs/:org/invitation）
    'You’ve been invited to the': '你已受邀加入',
    "You've been invited to the": '你已受邀加入',
    'Your access level to repositories within the organization': '你對組織內儲存庫的存取層級',
    'of future invitations from this organization.': '此組織日後的邀請。',

    // 帐户继任邀请（/users/:user/succession/invitation）。链接文字不带句号；带句号的写法由 settings-account 收录
    'invited you to be their account successor': '邀請你成為其帳號繼任者',
    'Learn more about account successors': '瞭解帳號繼任者',
    // 句首「我同意在使用和維護其帳號內容時遵守 GitHub 的」见 regexp，链接为 Terms of Service（common 翻译）
    "and the user's written requests, if any, in my use and maintaining of their account's content.": '和該使用者的書面請求（如有）。',
    'and the user’s written requests, if any, in my use and maintaining of their account’s content.': '和該使用者的書面請求（如有）。',
    "I understand that accepting this appointment as successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will, and I agree to comply or assist with a valid request by an individual with legal authority over the user's property (such as next-of-kin, an estate's executor, and/or a beneficiary of their will).":
      '我瞭解，接受繼任者的指定並不會凌駕任何相關司法管轄區具有法律約束力的近親規定或遺產法，也不構成具有約束力的遺囑；我同意配合或協助處理對該使用者財產具有法定權限的個人（例如近親、遺囑執行人和/或其遺囑受益人）提出的有效請求。',
    'I understand that accepting this appointment as successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will, and I agree to comply or assist with a valid request by an individual with legal authority over the user’s property (such as next-of-kin, an estate’s executor, and/or a beneficiary of their will).':
      '我瞭解，接受繼任者的指定並不會凌駕任何相關司法管轄區具有法律約束力的近親規定或遺產法，也不構成具有約束力的遺囑；我同意配合或協助處理對該使用者財產具有法定權限的個人（例如近親、遺囑執行人和/或其遺囑受益人）提出的有效請求。',
    'This invitation has already been accepted.': '此邀請已接受。',
    'This invitation has already been declined.': '此邀請已拒絕。',
    'Invitation not found': '找不到邀請',
    'Your invitation could not be found, or is not valid.': '找不到你的邀請，或邀請無效。',

    // 将个人帐户的工作移至组织（/move_work/new）
    'Move your work into an organization': '將你的工作移至組織',
    'Move your work progress': '工作移動進度',
    'What do you want to move?': '要移動哪些內容？',
    'Select all repositories': '全選儲存庫',
    'You do not have any projects': '你沒有任何專案',
    'Return to your personal profile': '返回個人檔案'
  },
  scoped: {
    // 新版表单分区与字段（Owner、Visibility、Description、(required)、(optional) 由 common-ui 翻译）
    General: '一般',
    Configuration: '設定',
    'Repository name': '儲存庫名稱',
    characters: '個字元',
    Next: '下一步',
    // 开关状态（可见性选项 Public / Private / Internal 与 None 由 common-ui 翻译）
    On: '開啟',
    Off: '關閉',
    // 选择浮层（Cancel and close、Filter… 由 common-ui 翻译）
    'Search owners': '搜尋擁有者',
    'Search templates': '搜尋範本',
    'Search apps': '搜尋應用程式',
    "You haven't created any items yet": '你尚未建立任何項目',
    'You haven’t created any items yet': '你尚未建立任何項目',
    'Please add or create new items to populate the list.': '請新增或建立項目以填入清單。',
    'Change repository': '變更儲存庫',

    // 名称可用性：存储库名在 <strong> 中（already exists on this account 由 repo-settings 收录）
    'The repository': '儲存庫',
    'is available.': '可用。',
    // 默认分支提示：This will set <strong>main</strong> as the default branch. Change the default name in <a>your settings</a>.
    // 不单独收录 your、settings：与存储库名同名时会误译
    'This will set': '這會將',
    'as the default branch.': '設為預設分支。',
    'as the default branch. Change the default name in': '設為預設分支。若要變更預設名稱，請前往',
    'your settings': '你的設定',
    // 创建提示：可见性单词单独包在元素里时（You are creating a <strong>public</strong> repository in…）
    'You are creating a': '你正在建立的',
    'You are creating an': '你正在建立的',
    public: '公開',
    private: '私人',
    internal: '內部',
    'repository in your personal account.': '儲存庫將位於你的個人帳號中。',
    'repository in the': '儲存庫將位於',
    // 企业名单独包在元素里时
    'enterprise members can see this repository. You choose who can commit.': '企業成員可以查看此儲存庫。由你選擇誰可以提交。',
    // GitHub 应用：Connect this repository to apps <strong>owner</strong> is subscribed to
    'is subscribed to': '訂閱的應用程式',
    // Copilot：Tell <a>Copilot cloud agent</a> what you want to build…
    Tell: '告訴',
    Prompt: '提示',
    // 特殊存储库：…initialize it with a <strong>README</strong> in the <code>profile</code> directory to get started.
    // → 並在初始化時將讀我檔案放在 profile 目錄中即可開始。
    special: '特殊',
    README: '讀我檔案',
    'in the': '放在',
    'directory to get started.': '目錄中即可開始。',
    'to get started.': '初始化即可開始。',

    // 导入：Learn more about <a>importing git repositories</a>（Learn more about 由 common-ui 翻译）
    changelog: '變更記錄',
    'is ready.': '已就緒。',

    // 复刻：A <a>fork</a> is a copy of a repository…；Contribute back to <strong>owner/repo</strong> by adding your own branch.
    A: '所謂',
    fork: '分叉',
    'Contribute back to': '透過新增你自己的分支向',
    'by adding your own branch.': '回饋貢獻。',
    'Copy the': '僅複製',
    'branch only': '分支',

    // 新建组织：计划卡片（与 /pricing 页卡片相同）。与 /account/upgrade 比较表相同的功能说明由 settings-account 收录（static），
    // 此处不重复；Recommended 由 common-ui、per month 与 per user/month 由 settings-account 翻译
    // 计划名译「X 版」：卡片标题、比较表列头、窄屏计划选择菜单（小写 free / team / enterprise 见 new/plans.ts）。
    // 全局 static 的 Team / Enterprise 是导航义的「團隊」「企業」：/pricing 页头的 Enterprise 栏目由 inline 规则保持「企業」；
    // 页脚链接（/enterprise、/team 方案页）只有文字，无法与计划名区分，本页显示「企業版」「團隊版」。
    // Free 在 common 是 Copilot 计划标签的译法，此处保留 scoped，不依赖该词条
    Free: '免費版',
    Team: '團隊版',
    Enterprise: '企業版',
    'Most popular': '最受歡迎',
    // 标语被 <br> 拆成两行，片段不加原文没有的标点
    'The basics for individuals': '適用於個人',
    'and organizations': '和組織的基本功能',
    'Advanced collaboration for': '進階協作',
    'individuals and organizations': '適用於個人和組織',
    'Security, compliance,': '安全性、合規性',
    'and flexible deployment': '和彈性部署',
    // 组织计划页企业版卡片的隐藏副标题
    'Security & flexible deployment': '安全性和彈性部署',
    forever: '永久',
    'for the first 12 months': '前 12 個月',
    'Starting at': '起價',
    'Start a free trial': '開始免費試用',
    'Contact Sales': '聯絡銷售人員',
    'Show features': '顯示功能',
    'Everything included in Free, plus...': '包含免費版的所有功能，另外還有...',
    'Everything included in Free, plus…': '包含免費版的所有功能，另外還有…',
    'Everything included in Team, plus...': '包含團隊版的所有功能，另外還有...',
    'Everything included in Team, plus…': '包含團隊版的所有功能，另外還有…',
    'Featured add-ons': '精選附加元件',
    'Exclusive add-on': '專屬附加元件',
    'Unlimited public/private repositories': '無限量的公開/私人儲存庫',
    'Dependabot security and version updates': 'Dependabot 安全性更新和版本更新',
    'Keep projects secure by automatically opening pull requests to update vulnerable dependencies and keep them up to date.':
      '自動建立拉取請求來更新有漏洞的相依項目並使其保持最新，確保專案安全。',
    'Use execution minutes with GitHub Actions to automate your software development workflows. Write tasks and combine them to build, test, and deploy any code project on GitHub.':
      '使用 GitHub 動作的執行分鐘數自動化軟體開發工作流程。撰寫任務並加以組合，即可在 GitHub 上建置、測試、部署任何程式碼專案。',
    'Host your own software packages or use them as dependencies in other projects. Both private and public hosting available.':
      '代管你自己的軟體套件，或在其他專案中將其作為相依項目使用。提供私人和公開代管。',
    'Issues & Projects': '議題和專案',
    'Give your developers flexible features for project management that adapts to any team, project, and workflow — all alongside your code.':
      '為開發人員提供彈性的專案管理功能，能配合任何團隊、專案和工作流程——全都與程式碼整合在一起。',
    'GitHub Codespaces Access': 'GitHub 程式碼空間存取權',
    With: '透過',
    ', get an instant dev environment in the cloud, so you can code anywhere on any device.':
      '，即可在雲端取得即時開發環境，隨時隨地在任何裝置上撰寫程式碼。',
    'Access to GitHub Codespaces': '可使用 GitHub 程式碼空間',
    'Repository rules': '儲存庫規則',
    'Enforce restrictions on how code branches and tags are merged across your organization, including requiring reviews by selected collaborators, or allowing only specific contributors to work on a particular branch.':
      '在整個組織中限制程式碼分支和標記的合併方式，包括要求由選定的協作者審查，或只允許特定貢獻者在特定分支上工作。',
    'Assign multiple users or a team to review a pull request.': '指派多位使用者或一個團隊審查拉取請求。',
    'Draft pull requests': '草稿拉取請求',
    'Automatically request reviews—or require approval—by selected contributors when changes are made to sections of code that they own.':
      '選定貢獻者負責的程式碼區段有變更時，自動請求其審查或要求其核准。',
    'Ensure that pull requests have a specific number of approving reviews before collaborators can make changes to a protected branch.':
      '確保拉取請求獲得指定數量的核准審查後，協作者才能變更受保護的分支。',
    'Pages and Wikis': '頁面和 Wiki',
    'Environment deployment branches and secrets': '環境部署分支和機密',
    'GitHub Support can help you troubleshoot issues you run into while using GitHub.': 'GitHub 支援可協助你排除使用 GitHub 時遇到的問題。',
    'Ensure your secrets stay secure. Mitigate risk associated with exposed secrets in your repositories, while preventing new leaks before they happen with push protection.':
      '確保機密安全。降低儲存庫中機密外洩的風險，同時透過推送保護在新的外洩發生前加以防止。',
    'Find and fix vulnerabilities in your code before they reach production. Prioritize your Dependabot alerts with automated triage rules.':
      '在程式碼中的漏洞進入正式環境前找出並修正。使用自動分類規則排定 Dependabot 警示的優先順序。',
    'Data residency': '資料落地',
    'GitHub Enterprise Cloud offers a multi-tenant enterprise SaaS solution on Microsoft Azure, allowing you to choose a regional cloud deployment for data residency, so your in-scope data is stored at rest in a designated location.':
      'GitHub 企業雲端在 Microsoft Azure 上提供多租戶企業 SaaS 解決方案，讓你選擇區域雲端部署以實現資料落地，使範圍內的待用資料儲存在指定位置。',
    'today or': '或',
    'contact our sales team': '聯絡我們的銷售團隊',
    'Own and control the user accounts of your enterprise members through your identity provider (IdP).':
      '透過身分識別提供者 (IdP) 擁有並控制企業成員的使用者帳號。',
    'User provisioning through SCIM': '透過 SCIM 佈建使用者',
    "Automatically invite members to join your organization when you grant access on your IdP. If you remove a member's access to your GitHub organization on your SAML IdP, the member will be automatically removed from the GitHub organization.":
      '在 IdP 上授予存取權時，自動邀請成員加入你的組織。如果你在 SAML IdP 上移除成員對 GitHub 組織的存取權，該成員會自動從 GitHub 組織中移除。',
    'Enterprise Account to centrally manage multiple organizations': '以企業帳號集中管理多個組織',
    'GitHub Enterprise Cloud includes the option to create an enterprise account, which enables collaboration between multiple organizations, gives administrators a single point of visibility and management and brings license cost savings for identical users in multiple organizations.':
      'GitHub 企業雲端可建立企業帳號，讓多個組織之間能夠協作，為管理員提供單一的檢視和管理入口，並為同時屬於多個組織的使用者節省授權費用。',
    'Environment protection rules': '環境保護規則',
    'Enforce branch and tag protections, as well as push rules across your enterprise. Rule insights allow you to assess impact of rules before and during enforcement.':
      '在整個企業中強制執行分支保護、標記保護和推送規則。規則洞察可讓你在強制執行前和強制執行期間評估規則的影響。',
    'Audit Log API': '稽核記錄 API',
    'As a GitHub Enterprise Cloud organization administrator, you can now access log events using our GraphQL API and monitor the activity in your organization.':
      '身為 GitHub 企業雲端組織管理員，你現在可以使用我們的 GraphQL API 存取記錄事件，並監控組織中的活動。',
    'SOC1, SOC2, type 2 reports annually': '每年提供 SOC1、SOC2 Type 2 報告',
    'GitHub offers AICPA System and Organization Controls (SOC) 1 Type 2 and SOC 2 Type 2 reports with IAASB International Standards on Assurance Engagements, ISAE 3000, and ISAE 3402.':
      'GitHub 提供 AICPA 系統和組織控制 (SOC) 1 Type 2 和 SOC 2 Type 2 報告，符合 IAASB 國際確信業務準則 ISAE 3000 和 ISAE 3402。',
    'FedRAMP Tailored Authority to Operate (ATO)': 'FedRAMP Tailored 營運授權 (ATO)',
    'Government users can host projects on GitHub Enterprise Cloud with the confidence that our platform meets the low impact software-as-a-service (SaaS) baseline of security standards set by our U.S. federal government partners.':
      '政府使用者可以放心在 GitHub 企業雲端上代管專案：我們的平台符合美國聯邦政府合作夥伴所訂定的低影響等級軟體即服務 (SaaS) 安全性標準基準。',
    'Use an identity provider to manage the identities of GitHub users and applications.':
      '使用身分識別提供者管理 GitHub 使用者和應用程式的身分。',
    'Advanced auditing': '進階稽核',
    'Quickly review the actions performed by members of your organization. Keep copies of audit log data to ensure secure IP and maintain compliance for your organization.':
      '快速查看組織成員執行的動作。保留稽核記錄資料副本，以保護智慧財產並維持組織合規。',
    'Share features and workflows between your GitHub Enterprise Server instance and GitHub Enterprise Cloud.':
      '在 GitHub 企業伺服器執行個體和 GitHub 企業雲端之間共用功能和工作流程。',
    'Premium support': '進階支援',
    'With Premium, get a 30-minute SLA on Urgent tickets and 24/7 web and phone support via callback request. With Premium Plus, get everything in Premium, assigned Customer Reliability Engineer and more.':
      '進階支援提供緊急工單 30 分鐘 SLA，並可透過回電請求取得 24/7 網頁和電話支援。進階增強支援包含進階支援的所有內容，另有指派的客戶可靠性工程師等服務。',
    'Learn more about Premium Support': '瞭解進階支援',

    // 新建组织：组织信息（I.e., <strong>user</strong> (your personal account)）
    'I.e.,': '即',
    '(your personal account)': '（你的個人帳號）',

    // 存储库转让：被 <strong> / 链接拆开的片段
    'in GitHub Help.': '（GitHub 說明）。',
    There: '目前',
    are: '有',
    is: '有',
    If: '如果',
    username: '使用者名稱',
    'is using': '正在使用',
    'Any existing': '任何現有的',
    wikis: 'Wiki',
    'on the': '位於',
    tab: '分頁',
    PRs: '拉取請求',
    'for issues and PRs': '用於議題和 PR',
    'for PRs': '用於 PR',
    can: '可先',
    upgrade: '升級',
    // Type <strong>owner/repo</strong> to confirm.
    Type: '輸入',
    'to confirm.': '以確認。',

    // 邀请页片段
    'Invited by': '邀請者',
    'organization!': '組織！',
    'Certain activity': '某些活動',
    'within this repository': '在此儲存庫內',
    'within this organization': '在此組織內',
    'If you have': '你的',
    'two-factor authentication': '雙重驗證',
    'enabled or not': '啟用狀態',
    'Opt out': '選擇不接收'
  },
  regexp: [
    // 存储库名称可用性（React 拆分的名称与文字拼接后）；句号随原文
    [/^([\w.-]+) is available\.$/, '$1 可用。'],
    [
      /^The repository ([\w.-]+) already exists on this account(\.?)$/,
      (_, name, period) => `此帳號已有名為 ${name} 的儲存庫${period ? '。' : ''}`
    ],
    [/^Your new repository will be created as ([\w.-]+?)(\.?)$/, (_, name, period) => `你的新儲存庫將建立為 ${name}${period ? '。' : ''}`],
    [
      /^Great repository names are short and memorable\.( Need inspiration\?)? How about ([\w.-]+)\?$/,
      (_, inspiration, name) => `好的儲存庫名稱簡短好記。${inspiration ? '需要靈感嗎？' : ''}不妨試試 ${name}？`
    ],
    // 所有者按钮与建议名称（无障碍标签）
    [/^([\w-]+), Owner \(Required\)$/, '$1，擁有者（必填）'],
    [/^Use suggested repository name ([\w.-]+)$/, '使用建議的儲存庫名稱 $1'],
    // 描述字数
    [/^(\d+) ?\/ ?(\d+) characters$/, '$1/$2 個字元'],
    // 可见性按钮（无障碍标签）
    [
      /^Choose visibility: (Public|Private|Internal)$/,
      (_, visibility) => `選擇可見度：${VISIBILITY[visibility.toLowerCase()] ?? visibility}`
    ],
    // 可见性与默认分支提示
    [
      /^You are creating an? (public|private|internal) repository in the ([\w.-]+) organization\.$/,
      (_, visibility, org) => `你正在 ${org} 組織中建立${VISIBILITY[visibility] ?? visibility}儲存庫。`
    ],
    [
      /^(.+?) enterprise members can see this repository\. You choose who can commit\.$/,
      '$1 企業成員可以查看此儲存庫。由你選擇誰可以提交。'
    ],
    [/^This will set (\S+) as the default branch\.$/, '這會將 $1 設為預設分支。'],
    [
      /^This will set (\S+) as the default branch\. Change the default name in your settings\.$/,
      '這會將 $1 設為預設分支。可在你的設定中變更預設名稱。'
    ],
    // 模板与 GitHub 应用
    [/^Copy all branches from ([\w.-]+\/[\w.-]+) and not just the default branch\.$/, '複製 $1 的所有分支，而不只是預設分支。'],
    [
      /^Connect this repository to apps ([\w.-]+) is subscribed to(\.?)$/,
      (_, owner, period) => `將此儲存庫連接到 ${owner} 訂閱的應用程式${period ? '。' : ''}`
    ],
    [/^You are subscribed to (\d+) Marketplace apps?(\.?)$/, (_, count, period) => `你訂閱了 ${count} 個市集應用程式${period ? '。' : ''}`],
    [/^(\d+) apps? selected$/, '已選取 $1 個應用程式'],
    [/^Auto-installed by ([\w.-]+)$/, '由 $1 自動安裝'],
    // 与用户名 / .github 同名的特殊存储库（整句渲染时）
    [
      /^([\w.-]+\/[\w.-]+) is a ✨special✨ repository that you can use to add a README\.md to your GitHub profile\. Make sure it[’']s public and initialize it with a README to get started\.$/,
      '$1 是一個 ✨特殊✨ 儲存庫，可用來將 README.md 新增到你的 GitHub 個人檔案。請確認它是公開的，並使用讀我檔案初始化即可開始。'
    ],
    [
      /^([\w.-]+\/\.github) is a ✨special✨ repository that you can use to add a README\.md to your organization[’']s GitHub profile\. Make sure it[’']s public and initialize it with a README in the profile directory to get started\.$/,
      '$1 是一個 ✨特殊✨ 儲存庫，可用來將 README.md 新增到你的 GitHub 組織資料。請確認它是公開的，並在初始化時將讀我檔案放在 profile 目錄中即可開始。'
    ],
    // 复刻
    [/^Copy the (\S+) branch only$/, '僅複製 $1 分支'],
    [/^Contribute back to ([\w.-]+\/[\w.-]+) by adding your own branch\.$/, '透過新增你自己的分支向 $1 回饋貢獻。'],
    [/^You are creating a fork in the ([\w.-]+) organization\.$/, '你正在 $1 組織中建立分叉。'],
    [/^Fork ([\w.-]+\/[\w.-]+)$/, '分叉 $1'],
    [/^Forking ([\w.-]+\/[\w.-]+)$/, '正在分叉 $1'],
    // 导入
    [/^Updating branches and (\d+) commit authors?(…|\.\.\.)$/, '正在更新分支和 $1 位提交作者$2'],
    [
      /^No source repositories were detected at (\S+)\. Please check the URL and try again\.$/,
      '在 $1 未偵測到來源儲存庫。請檢查 URL 後再試一次。'
    ],
    [/^Importing complete! Your new repository ([\w.-]+\/[\w.-]+) is ready\.$/, '匯入完成！你的新儲存庫 $1 已就緒。'],
    // 新建组织：名称校验、网址、Copilot Business 价格
    [/^The name '([^']+)' is already taken\.$/, '名稱「$1」已被使用。'],
    [
      /^The name '(.+)' may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen\.$/,
      '名稱「$1」只能包含英數字元或單一連字號，且不能以連字號開頭或結尾。'
    ],
    [/^Organization name '(.+)' is unavailable\.$/, '組織名稱「$1」無法使用。'],
    [/^Your URL will be: (https:\/\/github\.com\/\S*)$/, '你的 URL 將是：$1'],
    [/^I\.e\., ([\w-]+) \(your personal account\)$/, '即 $1（你的個人帳號）'],
    [
      /^Boost developer productivity for (\$\d+(?:\.\d+)?)\/user\/month\. Pay only for assigned seats after setup\.$/,
      '以每位使用者每月 $1 的價格提升開發人員生產力。設定後只需為已指派的席次付費。'
    ],
    // 新建组织：计划卡片中的使用量（与 settings-account 的 500MB / 2GB 静态词条、「每月 2,000 動作分鐘數」同一译法）
    [/^([\d,]+) CI\/CD minutes\/month$/, '每月 $1 CI/CD 分鐘數'],
    [/^(\d+(?:\.\d+)? ?[MG]B) of Packages storage$/, '$1 套件儲存空間'],
    [
      /^Blazing fast cloud developer environments with flexible compute and pre-configured containers, developers can code, collaborate, and debug from any browser\. Pay only for what you use with compute fees starting at (\$[\d.]+)\/hr and storage fees at (\$[\d.]+)\/GB per month\.$/,
      '極速雲端開發環境，具備彈性運算和預先設定的容器，開發人員可在任何瀏覽器中撰寫程式碼、協作並偵錯。依使用量付費，運算費用每小時 $1 起，儲存費用為每月每 GB $2。'
    ],
    // 转让与邀请页
    [/^Transfer repository: ([\w.-]+\/[\w.-]+)$/, '轉移儲存庫：$1'],
    [/^There (?:is|are) (\d+) codespaces? that may be affected by this transfer\.$/, '有 $1 個程式碼空間可能會受到這次轉移影響。'],
    [/^There (?:is|are)$/, '目前有'],
    [/^(\d+) codespaces?$/, '$1 個程式碼空間'],
    [/^Type ([\w.-]+\/[\w.-]+) to confirm\.$/, '輸入 $1 以確認。'],
    [/^([\w-]+) invited you to collaborate on ([\w.-]+\/[\w.-]+)$/, '$1 邀請你協作開發 $2'],
    [/^of ([\w.-]+(?:\/[\w.-]+)?) (will|may) be able to see:$/, (_, owner, verb) => `(${owner}) ${VISIBILITY_VERB[verb] ?? verb}：`],
    [/^Block ([\w-]+)$/, '封鎖 $1'],
    [/^Join ([\w.-]+)$/, '加入 $1'],
    [
      /^As an account successor, you would be able to manage ([\w-]+)[’']s repositories if they[’']re not able to\.$/,
      '身為帳號繼任者，你可以在 $1 無法管理其儲存庫時代為管理。'
    ],
    [
      /^By clicking ["“]Accept invitation["”] below, I acknowledge that I agree to serve as the successor for ([\w-]+), in such ways authorized by their successor request\. I agree to abide by GitHub[’']s$/,
      '按一下下方的「接受邀請」，即表示我同意依照 $1 的繼任者請求所授權的方式擔任其繼任者。我同意在使用和維護其帳號內容時遵守 GitHub 的'
    ],
    // 将工作移至组织：进度
    [/^(\d+)% complete$/, '已完成 $1%']
  ],
  inline: [
    // 定价页营销页头的 Enterprise 栏目按钮：<button>Enterprise<svg/></button>（计划名元素里只有文字，不命中）。
    // 全局导航栏目仍译「企業」，不用本页 scoped 的计划名「企業版」
    ['Enterprise {}', '企業{}']
  ],
  // 将工作移至组织：页头的帐户名，勾选项的存储库名、项目名（用户内容）
  ignore: [
    'move-work-container .flex-auto > p.h3:first-child',
    'move-work-container label[for^="repository-"]',
    'move-work-container label[for^="project-"]'
  ]
} satisfies PageDictionary

export default mergeDictionaries(base, plans) satisfies PageDictionary
