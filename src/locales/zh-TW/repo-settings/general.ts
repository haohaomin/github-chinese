import type { PageDictionary } from '../../../core/types'

const NAME = '([\\w.-]+)'
const BRANCH = '(\\S+)'

/**
 * 存储库设置 · 常规：存储库名称、模板存储库、提交签署与提交评论、默认分支（重命名与切换对话框）、
 * 发行版不可变、社交预览、功能（Wiki、议题、复刻、赞助、存档计划、讨论、项目、拉取请求）、
 * 拉取请求合并设置、存档、推送、议题自动关闭。
 * 危险区域及其对话框见 danger-zone.ts。
 * 术语：head / base branch → 來源分支 / 基底分支，squash → 壓縮，rebase → 重定基底，social preview → 社群預覽，
 * source code archive → 原始碼封存檔，funding links → 贊助連結，Pages site → 頁面網站，sign off → 簽署
 * （与 org-settings/code.ts 一致），immutable → 不可變。
 * 默认分支重命名对话框的片段与分支页（commits/branches.ts）「個以此分支為目標的草稿發行版本」同一写法：
 * 將更新 <3> 個以此分支為目標的拉取請求。分支保护规则片段同译「個明確針對下列分支的分支保護規則」。
 */
export default {
  static: {
    // 功能：Wiki、讨论
    'Contact the owner of the repository to enable GitHub Wikis.': '請聯絡儲存庫擁有者啟用 GitHub Wiki。',
    'Update organization discussion settings': '更新組織討論設定',
    // 存储库访问：可见性、组织访问
    'Only those with access to this repository can view it': '只有擁有此儲存庫存取權的人員才能檢視',
    'Organization access': '組織存取權',
    'Search by name': '依名稱搜尋',
    'No people or teams have organization-based access to this repository': '沒有人員或團隊透過組織存取此儲存庫',
    'Assigned individuals and teams will appear here once an organization owner grants them access':
      '組織擁有者授予存取權後指派的個人和團隊會顯示在此處',
    'Set base role': '設定基本角色',
    // 代码质量（存储库）
    'Code quality findings': '程式碼品質發現',
    'Automatically detect code quality issues in your codebase': '自動偵測程式碼庫中的程式碼品質問題',
    'Enable code quality': '啟用程式碼品質',
    'Code Quality cannot currently be enabled for this repository.': '目前無法為此儲存庫啟用程式碼品質。',
    'Ensure your codebases are reliable, maintainable, and efficient by proactively scanning for best practices, reducing bugs, improving readability, and enabling easier testing, collaboration, and scalability. Enabling this feature will incur charges in':
      '主動掃描最佳做法、減少錯誤、提高可讀性，讓測試、協作和擴充更輕鬆，確保程式碼庫可靠、可維護且有效率。啟用此功能將產生費用，計入',
    'A pull request will also be opened to merge an AI-generated workflow YAML file that is needed to enable code coverage analysis.':
      '還會建立一個拉取請求，用於合併啟用程式碼涵蓋範圍分析所需的 AI 產生工作流程 YAML 檔案。',
    'Additionally, to enable code coverage analysis, a workflow YAML file is generated using AI that will need to be reviewed and merged manually from the pull request that is opened.':
      '此外，為啟用程式碼涵蓋範圍分析，將使用 AI 產生工作流程 YAML 檔案，需要在所建立的拉取請求中手動審查並合併。',
    // Dependabot 运行器类型
    'Select the runner type used by Dependabot for scans, versions and security updates.':
      '選擇 Dependabot 用於掃描、版本更新和安全性更新的執行器類型。',
    // 存储库名称
    'Repository name was not changed': '儲存庫名稱未變更',
    'already exists on this account.': '已存在於此帳號中。',
    'already exists on this account': '已存在於此帳號中',

    // 模板存储库
    'Template repository': '範本儲存庫',
    'Template repositories let users generate new repositories with the same directory structure and files.':
      '範本儲存庫可讓使用者產生具有相同目錄結構和檔案的新儲存庫。',
    'Learn more about template repositories': '瞭解範本儲存庫',
    'Learn more about template repositories.': '瞭解範本儲存庫。',
    'A repository with LFS content cannot be used as a template.': '包含 LFS 內容的儲存庫無法作為範本。',

    // 提交：签署与提交评论（「Require contributors to sign off on web-based commits」等由 org-settings 收录）
    "Enabling this setting will require contributors to sign off on commits made through GitHub's web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the":
      '啟用此設定後，貢獻者必須簽署透過 GitHub 網頁介面所做的提交。簽署是貢獻者確認其提交符合儲存庫條款的一種方式，通常是',
    "Enabling this setting will require contributors to sign off on commits made through GitHub’s web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the":
      '啟用此設定後，貢獻者必須簽署透過 GitHub 網頁介面所做的提交。簽署是貢獻者確認其提交符合儲存庫條款的一種方式，通常是',
    'Enabling this setting will require contributors to sign off on commits made through GitHub’s web interface. Signing off is a way for contributors to affirm that their commit complies with the repository’s terms, commonly the':
      '啟用此設定後，貢獻者必須簽署透過 GitHub 網頁介面所做的提交。簽署是貢獻者確認其提交符合儲存庫條款的一種方式，通常是',
    'Learn more about signing off on commits.': '瞭解提交簽署。',
    'This setting is enabled on the upstream repository. Disabling this setting may block commits from being merged upstream.':
      '上游儲存庫已啟用此設定。停用此設定可能導致提交無法合併到上游。',
    'Allow comments on individual commits': '允許對個別提交留言',
    // 原文无标点，译文不加：啟用此設定將允許任何能查看此儲存庫的人新增 <提交留言>。現有的提交留言…
    'Enabling this setting will allow anyone who can view this repository to add': '啟用此設定將允許任何能查看此儲存庫的人新增',
    '. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '。現有的提交留言不受此設定影響，仍可查看、編輯和刪除。',

    // 默认分支
    'The default branch is considered the “base” branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch.':
      '預設分支被視為儲存庫中的「基底」分支，除非另行指定其他分支，否則所有拉取請求和程式碼提交都會自動以它為目標。',
    'The default branch is considered the "base" branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch.':
      '預設分支被視為儲存庫中的「基底」分支，除非另行指定其他分支，否則所有拉取請求和程式碼提交都會自動以它為目標。',

    // 发行版
    'Enable release immutability': '啟用不可變發行版本',
    'Immutable releases': '不可變發行版本',
    'Disallow assets and tags from being modified once a release is published.': '發行版本發布後，不允許修改其資產和標記。',

    // 社交预览
    'Social preview': '社群預覽',
    'Upload an image to customize your repository’s social media preview.': '上傳圖片以自訂儲存庫在社群媒體上的預覽。',
    "Upload an image to customize your repository's social media preview.": '上傳圖片以自訂儲存庫在社群媒體上的預覽。',
    'Images should be at least 640×320px (1280×640px for best display).': '圖片尺寸至少應為 640×320 像素（1280×640 像素顯示效果最佳）。',
    'Download template': '下載範本',
    'Upload an image…': '上傳圖片…',
    'Upload an image...': '上傳圖片...',
    'Remove image': '移除圖片',
    // 「…while」+ <strong>owner/repo</strong> +「is private.」
    'You can upload a social image, but it will not be visible publicly while': '你可以上傳社群圖片，但圖片不會公開顯示，因為',

    // 功能：Wiki
    'Wikis host documentation for your repository.': 'Wiki 用來存放儲存庫的說明文件。',
    'Restrict editing to collaborators only': '僅限協作者編輯',
    'Restrict editing to users in teams with push access only': '僅限具有推送權限的團隊中的使用者編輯',
    'Public wikis will still be readable by everyone.': '所有人仍可閱讀公開 Wiki。',
    'Upgrade or make this repository public to enable Wikis': '升級或將此儲存庫設為公開以啟用 Wiki',
    'GitHub Wikis is a simple way to let others contribute content. Any GitHub user can create and edit pages to use for documentation, examples, support, or anything you wish.':
      'GitHub Wiki 讓其他人能輕鬆貢獻內容。任何 GitHub 使用者都可以建立並編輯頁面，用於說明文件、範例、支援或任何你想要的用途。',
    'Learn more about wikis': '瞭解 Wiki',

    // 功能：议题
    'Issues integrate lightweight task tracking into your repository. Keep projects on track with issue labels and milestones, and reference them in commit messages.':
      '議題為儲存庫整合了輕量級的任務追蹤。使用議題標籤和里程碑讓專案保持正軌，並可在提交訊息中參考議題。',
    'Issue permissions': '議題權限',
    'Anyone can create an issue': '任何人都可以建立議題',
    'Only collaborators can create issues': '僅協作者可以建立議題',
    'If restricted, issues will still be readable by everyone who can see this repository.':
      '即使設有限制，所有能看到此儲存庫的人仍可閱讀議題。',
    'Get organized with issue templates': '使用議題範本整理議題',
    'Give contributors issue templates that help you cut through the noise and help them push your project forward.':
      '為貢獻者提供議題範本，幫你排除干擾，也幫助他們推動專案前進。',
    'Set up templates': '設定範本',
    // 保存议题模板后的提示横幅
    'Updated issue templates for this repository': '已更新此儲存庫的議題範本',

    // 功能：复刻
    'Allow forking': '允許分叉',
    'If disabled, existing forks will be unaffected.': '停用後，現有分叉不受影響。',

    // 功能：赞助
    'Sponsorships help your community know how to financially support this repository.': '贊助功能讓社群瞭解如何為此儲存庫提供資金支持。',
    'Display a "Sponsor" button': '顯示「贊助」按鈕',
    'Display a “Sponsor” button': '顯示「贊助」按鈕',
    'Add links to GitHub Sponsors or third-party methods your repository accepts for financial contributions to your project.':
      '新增 GitHub 贊助或儲存庫接受的第三方管道連結，讓專案能獲得資金贊助。',
    'Set up sponsor button': '設定贊助按鈕',
    'Edit funding links': '編輯贊助連結',
    'Override funding links': '覆寫贊助連結',

    // 功能：存档计划
    'Preserve this repository': '保留此儲存庫',
    'Include this code in the': '將此程式碼納入',
    'GitHub Archive Program': 'GitHub 封存計畫',

    // 功能：目录
    'Autogenerate table of contents for markdown files in this repository. the table of contents will be displayed near the top of the file.':
      '為此儲存庫中的 Markdown 檔案自動產生目錄。目錄將顯示在檔案頂端附近。',
    'Autogenerate table of contents for markdown files in this repository. The table of contents will be displayed near the top of the file.':
      '為此儲存庫中的 Markdown 檔案自動產生目錄。目錄將顯示在檔案頂端附近。',

    // 功能：讨论
    'Discussions is the space for your community to have conversations, ask questions and post answers without opening issues.':
      '討論是社群交流、提問和張貼解答的空間，不需要建立議題。',
    'Get started with Discussions': '開始使用討論',
    'Engage your community by having discussions right in your repository, where your community already lives':
      '直接在社群所在的儲存庫中展開討論，與社群互動',
    'Set up discussions': '設定討論',

    // 功能：项目
    "Projects on GitHub are created at the repository owner's level (organization or user) and can be linked to a repository's Projects tab. Projects are suitable for cross-repository development efforts such as feature work, complex product roadmaps or even Issue triage.":
      'GitHub 上的專案是在儲存庫擁有者（組織或使用者）層級建立，可以連結到儲存庫的專案分頁。專案適用於跨儲存庫的開發工作，例如功能開發、複雜的產品藍圖，甚至議題分類。',
    'Projects on GitHub are created at the repository owner’s level (organization or user) and can be linked to a repository’s Projects tab. Projects are suitable for cross-repository development efforts such as feature work, complex product roadmaps or even Issue triage.':
      'GitHub 上的專案是在儲存庫擁有者（組織或使用者）層級建立，可以連結到儲存庫的專案分頁。專案適用於跨儲存庫的開發工作，例如功能開發、複雜的產品藍圖，甚至議題分類。',

    // 功能：拉取请求
    'Pull requests allow others to suggest changes to your repository.': '拉取請求可讓其他人向你的儲存庫建議變更。',
    'Pull request permissions': '拉取請求權限',
    'Creation allowed by:': '允許建立的使用者：',
    'Anyone can create a pull request': '任何人都可以建立拉取請求',
    'Collaborators only': '僅限協作者',
    'Only collaborators can create PRs': '僅協作者可以建立 PR',
    'If restricted, pull requests will still be readable by everyone who can see this repository.':
      '即使設有限制，所有能看到此儲存庫的人仍可閱讀拉取請求。',

    // 拉取请求合并设置
    'When merging pull requests, you can allow any combination of merge commits, squashing, or rebasing. At least one option must be enabled. If you have linear history requirement enabled on any protected branch, you must enable squashing or rebasing.':
      '合併拉取請求時，你可以允許合併提交、壓縮或重定基底的任意組合。至少必須啟用一個選項。如果任何受保護的分支啟用了線性歷史記錄要求，就必須啟用壓縮或重定基底。',
    'You must select at least one option': '至少必須選取一個選項',
    'You must select squashing or rebasing option. This is because linear history is required on at least one protected branch.':
      '必須選取壓縮或重定基底選項。這是因為至少有一個受保護的分支要求線性歷史記錄。',
    'Allow merge commits': '允許合併提交',
    'Add all commits from the head branch to the base branch with a merge commit.': '透過合併提交，將來源分支的所有提交加入基底分支。',
    'Default commit message': '預設提交訊息',
    'Presented when merging a pull request with merge.': '以合併方式合併拉取請求時顯示。',
    'Default message': '預設訊息',
    'Pull request title and commit details': '拉取請求標題和提交詳細資料',
    'Pull request title and description': '拉取請求標題和描述',
    'Allow squash merging': '允許壓縮合併',
    'Combine all commits from the head branch into a single commit in the base branch.': '將來源分支的所有提交合併為基底分支中的單一提交。',
    'Presented when merging a pull request with squash.': '以壓縮方式合併拉取請求時顯示。',
    'Default to pull request title and commit details': '預設使用拉取請求標題和提交詳細資料',
    'Default to PR title for squash merge commits': '壓縮合併提交預設使用 PR 標題',
    'This will pre-populate the commit message with the PR title when performing a squash merge.':
      '執行壓縮合併時，會以 PR 標題預先填入提交訊息。',
    'Allow rebase merging': '允許重定基底合併',
    'Add all commits from the head branch onto the base branch individually.': '將來源分支的所有提交逐一加入基底分支。',
    'Control how and when users are prompted to update their branches if there are new changes available in the base branch.':
      '控制基底分支有新變更時，以何種方式、在何時提示使用者更新其分支。',
    'Always suggest updating pull request branches': '一律建議更新拉取請求分支',
    'Whenever there are new changes available in the base branch, present an “update branch” option in the pull request.':
      '每當基底分支有新變更時，在拉取請求中顯示「更新分支」選項。',
    'Whenever there are new changes available in the base branch, present an "update branch" option in the pull request.':
      '每當基底分支有新變更時，在拉取請求中顯示「更新分支」選項。',
    'You can allow setting pull requests to merge automatically once all required reviews and status checks have passed.':
      '你可以允許將拉取請求設為在所有必要審查和狀態檢查通過後自動合併。',
    'Allow auto-merge': '允許自動合併',
    'Waits for merge requirements to be met and then merges automatically.': '等待符合合併要求後自動合併。',
    'Learn more about auto-merge': '瞭解自動合併',
    'After pull requests are merged, you can have head branches deleted automatically.': '拉取請求合併後，可以自動刪除來源分支。',
    'Automatically delete head branches': '自動刪除來源分支',
    'Deleted branches will still be able to be restored.': '已刪除的分支仍可還原。',

    // 存档（源代码存档中的 Git LFS）
    'When creating source code archives, you can choose to include files stored using Git LFS in the archive.':
      '建立原始碼封存檔時，可以選擇在封存檔中包含使用 Git LFS 儲存的檔案。',
    'Include Git LFS objects in archives': '在封存檔中包含 Git LFS 物件',
    'Git LFS usage in archives is billed at the same rate as usage with the client.':
      '封存檔中的 Git LFS 使用量與用戶端使用量以相同費率計費。',

    // 推送
    'Limit how many branches and tags can be updated in a single push': '限制單次推送可更新的分支和標記數量',
    'Pushes will be rejected if they attempt to update more than this.': '推送嘗試更新的數量超過此值時將遭到拒絕。',
    'Learn more about this setting': '瞭解此設定',
    // 「Learn more about this setting」+「, and send us your」+「feedback」
    ', and send us your': '，並向我們提供',
    // 「Up to」+ <input> +「branches and tags can be updated in a push」：最多 <5> 個分支和標記可在一次推送中更新
    'branches and tags can be updated in a push': '個分支和標記可在一次推送中更新',
    'Must be a whole number between 2 and 1000': '必須是 2 到 1000 之間的整數',

    // 议题自动关闭
    'After merging a pull request, linked issues can be closed automatically.': '合併拉取請求後，可以自動關閉已連結的議題。',
    'Auto-close issues with merged linked pull requests': '已連結的拉取請求合併後自動關閉議題',
    'Whenever linked pull requests have merged, auto-close the issue.': '每當已連結的拉取請求合併時，自動關閉議題。',

    // 默认分支：重命名对话框
    'Most projects name the default branch': '大多數專案將預設分支命名為',
    'Your branch name will be': '分支名稱將為',
    'pull request targeting this branch.': '個以此分支為目標的拉取請求。',
    'pull requests targeting this branch.': '個以此分支為目標的拉取請求。',
    'branch protection rule that explicitly targets': '個明確針對下列分支的分支保護規則',
    'branch protection rules that explicitly target': '個明確針對下列分支的分支保護規則',
    'open pull request for this branch.': '個來自此分支的開放中拉取請求。',
    'open pull requests for this branch.': '個來自此分支的開放中拉取請求。',
    'Will unpublish current GitHub Pages site.': '將取消發布目前的 GitHub 頁面網站。',
    'Your current GitHub Pages site will become unpublished. A new commit on the renamed branch will publish the GitHub Pages site again.':
      '目前的 GitHub 頁面網站將取消發布。在重新命名後的分支上建立新提交，就會再次發布 GitHub 頁面網站。',
    "Renaming this branch will not update your members' local environments.": '重新命名此分支不會更新成員的本機環境。',
    'Renaming this branch will not update your members’ local environments.': '重新命名此分支不會更新成員的本機環境。',

    // 默认分支：切换对话框
    'Switch default branch to another branch': '將預設分支切換為其他分支',
    'Choose another branch to use as the default branch of': '選擇另一個分支作為下列儲存庫的預設分支',
    'Switch default branch': '切換預設分支',
    'Update default branch': '更新預設分支',
    'Changing your default branch': '變更預設分支',
    'can have unintended consequences that can affect new pull requests and clones.':
      '可能會產生非預期的後果，影響新的拉取請求和儲存庫複製。',
    'I understand, update the default branch.': '我瞭解，更新預設分支。'
  },
  scoped: {
    'Repository name': '儲存庫名稱',
    'Repository Name': '儲存庫名稱',
    'Renaming…': '重新命名中…',
    'Renaming...': '重新命名中...',
    'The repository': '儲存庫',
    'is available.': '可用。',
    'commit comments': '提交留言',
    'Default branch': '預設分支',
    'Switch to another branch': '切換到其他分支',
    'to:': '為：',
    'Will update': '將更新',
    'Will close': '將關閉',
    'is already the branch name.': '已是目前的分支名稱。',
    'instead of': '以取代',
    'Filter branches': '篩選分支',
    default: '預設',
    'Uploading...': '上傳中...',
    'Uploading…': '上傳中…',
    Releases: '發行版本',
    'is private.': '是私人儲存庫。',
    Sponsorships: '贊助',
    'Table of contents': '目錄',
    'Pull Requests': '拉取請求',
    'Pull request title': '拉取請求標題',
    Archives: '封存檔',
    Pushes: '推送',
    'Up to': '最多',
    feedback: '意見回饋'
  },
  regexp: [
    // 讨论设为组织成员讨论来源时无法禁用；组织策略限制设置
    [
      /^Discussions cannot be disabled because they are set as the source for the ([\w.-]+) organization[’']s member discussions\.$/,
      '討論無法停用，因為已設為 $1 組織成員討論的來源。'
    ],
    [
      /^Some settings on this page can[’']t be changed because of a ([\w.-]+) policy\. We recommend using$/,
      '由於 $1 的政策，此頁面上的部分設定無法變更。建議使用'
    ],
    // 运行器类型对话框标题：Edit runner type for Dependabot
    [
      /^Edit runner type for (Dependabot|code scanning)$/,
      (_, name: string) => `編輯${name === 'Dependabot' ? ' Dependabot ' : '程式碼掃描'}的執行器類型`
    ],
    // 存储库名称可用性
    [new RegExp(`^${NAME} is available\\.$`), '$1 可用。'],
    [
      new RegExp(`^The repository ${NAME} already exists on this account(\\.?)$`),
      // 与 new.ts 的同一句同译
      (_, name: string, dot: string) => `此帳號已有名為 ${name} 的儲存庫${dot ? '。' : ''}`
    ],
    // 默认分支：重命名对话框（片段被 <code> 隔开时由 static 分别匹配）
    [new RegExp(`^Rename ${BRANCH} to:$`), '將 $1 重新命名為：'],
    [new RegExp(`^${BRANCH} is already the branch name\\.$`), '$1 已是目前的分支名稱。'],
    [/^Will update (\d+) pull requests? targeting this branch\.$/, '將更新 $1 個以此分支為目標的拉取請求。'],
    [
      new RegExp(`^Will update (\\d+) branch protection rules? that explicitly targets? (\\S+?)(\\.?)$`),
      (_, count: string, branch: string, dot: string) => `將更新 ${count} 個明確針對 ${branch} 的分支保護規則${dot ? '。' : ''}`
    ],
    [/^Will close (\d+) open pull requests? for this branch\.$/, '將關閉 $1 個來自此分支的開放中拉取請求。'],
    // 默认分支：切换对话框
    [
      new RegExp(`^Choose another branch to use as the default branch of ${NAME}(?:/${NAME})? instead of ${BRANCH}$`),
      (_, owner: string, repo: string, branch: string) =>
        `選擇另一個分支取代 ${branch} 作為 ${repo ? `${owner}/${repo}` : owner} 的預設分支`
    ],
    [new RegExp(`^Default branch (?:changed|updated) to ${BRANCH}$`), '預設分支已變更為 $1'],
    // 社交预览（私人存储库、删除确认）
    [
      new RegExp(`^You can upload a social image, but it will not be visible publicly while ${NAME}(?:/${NAME})? is private\\.$`),
      (_, owner: string, repo: string) => `你可以上傳社群圖片，但 ${repo ? `${owner}/${repo}` : owner} 是私人儲存庫，圖片不會公開顯示。`
    ],
    [new RegExp(`^Are you sure you want to remove ${NAME}/${NAME}[’']s promotional image\\?$`), '確定要移除 $1/$2 的宣傳圖片嗎？']
  ],
  inline: [
    // 存储库访问页：未设基本角色、组织访问说明（<a>owners</a>、<a>Set base role</a>、<a>Manage</a> 拆开的句子）
    [
      'No base role set. Only {} and those with direct access can access this repository. {}.',
      '未設定基本角色。只有{}和擁有直接存取權的人員可以存取此儲存庫。{}。'
    ],
    [
      'No base role set. Only {} and those with direct access can access this repository. {}',
      '未設定基本角色。只有{}和擁有直接存取權的人員可以存取此儲存庫。{}'
    ],
    [
      /^(\d+) users? and \{\} can access this repository through the organization\. \{\}\.$/,
      '$1 位使用者和{}可以透過組織存取此儲存庫。{}。'
    ],
    ['{} and {} can access this repository through the organization. {}.', '{}和{}可以透過組織存取此儲存庫。{}。'],
    // 新版结构：「No base role set.」在 <strong> 里；「0 users and」与团队链接各在一个 <strong> 里（片段见 access.ts）
    ['{} Only {} and those with direct access can access this repository. {}.', '{}只有{}和擁有直接存取權的人員可以存取此儲存庫。{}。'],
    ['{}{} can access this repository through the organization. {}.', '{} {}可以透過組織存取此儲存庫。{}。'],
    // 代码质量：「We will support … found in this <a>open source repository</a>. …」；组织策略禁用：Disabled by <组织>
    [
      'We will support quality rules and languages found in this {}. The languages supported with CodeQL for standard findings are: C#, Java, JavaScript/TypeScript, Python, Ruby, and Go. Other languages may be scanned with AI, but will not generate standard findings with CodeQL.',
      '我們將支援此{}中的品質規則和語言。CodeQL 支援產生標準發現的語言有：C#、Java、JavaScript/TypeScript、Python、Ruby 和 Go。其他語言可能會使用 AI 掃描，但不會透過 CodeQL 產生標準發現。'
    ],
    ['Disabled by {}', '已被 {} 停用']
  ]
} satisfies PageDictionary
