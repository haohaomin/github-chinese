import type { PageDictionary, RegExpRule } from '../../../core/types'

/**
 * 「<名称> branch / tag」里不是分支名、标记名的常见词（首字母大小写都排除）。
 * 分支选择器按钮的无障碍名称是「main branch」「v1.0.0 tag」，这些词开头的短语交给其它词条。
 */
const NOT_REF_WORDS: readonly string[] = [
  'a active all an annotated another any archived at base by child choose compare container create current',
  'default delete deleted deploy deployment different docker each edit empty every existing feature filter find',
  'first for fork from git head her his image immutable in into invalid its last latest lightweight local locked',
  'matching merge merged merging missing my new next no of old on one onto original orphan other our package',
  'parent per pick previous primary protected publish published push pushed release remote remove rename renamed',
  'required restore same search select selected semantic signed some source specific stale switch target that the',
  'their this to topic tracking unknown unprotected unverified update upstream valid verified version view which',
  'with working your'
]
  .join(' ')
  .split(' ')

const NOT_REF_SOURCE = NOT_REF_WORDS.map(word => `[${word.charAt(0).toUpperCase()}${word.charAt(0)}]${word.slice(1)}`).join('|')

/**
 * 许可证名之前不是许可证名的常见词（「View license」「Add license」等交给其它词条；
 * 「Exclude license」是存储库筛选框的排除建议项）
 */
const NOT_LICENSE_SOURCE =
  'Add|An?|Any|Change|Choose|Custom|Default|Detected|Edit|Exclude|Invalid|Missing|New|No|Other|Remove|Same|Select|The|This|Unknown|Update|Valid|View|Your'

/** 代码空间使用量的付费方：their enterprise → 所屬企業；企业名原样保留，与两侧中文之间补空格 */
function codespacesPayer(payer: string): string {
  return payer === 'their enterprise' ? '所屬企業' : ` ${payer} `
}

/** Code 下拉可启动的桌面应用：客户端名 GitHub Desktop 译出（GitHub 桌面版），第三方应用名原样保留 */
const DESKTOP_APPS: Readonly<Record<string, string>> = {
  'GitHub Desktop': 'GitHub 桌面版'
}

const REF_TYPES: Readonly<Record<string, string>> = {
  branch: '分支',
  branches: '分支',
  tag: '標記',
  tags: '標記'
}

/** 检查状态徽章的状态值（术语表：Pending → 擱置中） */
const CHECK_STATES: Readonly<Record<string, string>> = {
  failure: '失敗',
  success: '成功',
  pending: '擱置中',
  error: '錯誤'
}

/** 文件列表行的类型：<名称>, (Directory) */
const ENTRY_TYPES: Readonly<Record<string, string>> = {
  Directory: '目錄',
  File: '檔案',
  Submodule: '子模組',
  'Symlink to directory': '指向目錄的符號連結',
  'Symlink to file': '指向檔案的符號連結'
}

const regexp: readonly RegExpRule[] = [
  // 分支选择器按钮的无障碍名称：main branch / v1.0.0 tag（排除常见词开头的短语与 1 tag 这类计数）
  [
    new RegExp(`^(?!(?:${NOT_REF_SOURCE}) |\\d[\\d,]* )(\\S+) (branch|tag)$`),
    (_, name: string, type: string) => `${name} ${REF_TYPES[type] ?? type}`
  ],
  // 分支选择器筛选结果播报
  [/^(\d[\d,]*) (branch|branches|tag|tags) found$/, (_, count: string, type: string) => `找到 ${count} 個${REF_TYPES[type] ?? type}`],
  // 最新提交行：提交总数；复刻信息条：提交数片段
  [/^(\d[\d,]*) [Cc]ommits?$/, '$1 個提交'],
  [/^Commit ([0-9a-f]{7,40})$/, '提交 $1'],
  [/^commits by (\S+)(?: and (\S+))?$/, (_, first: string, second: string) => `${second ? `${first} 和 ${second}` : first} 的提交`],
  // 多个作者（与 commits 词典一致；存储库首页的作用域不含 commits）
  [/^Show (\d+) authors$/, '顯示 $1 位作者'],
  [/^(\d+) authors$/, '$1 位作者'],
  [/^([\w.-]+)['’]s org home page$/, '$1 的組織首頁'],
  [/^Status checks: (failure|success|pending|error)$/, (_, state: string) => `狀態檢查：${CHECK_STATES[state] ?? state}`],
  // 检查状态徽章的汇总（术语表：N checks → N 項檢查）
  [/^(\d+) ?\/ ?(\d+) checks OK$/, '$1/$2 項檢查正常'],
  // 转到文件：搜索结果数
  [/^First (\d[\d,]*) files shown\.$/, '僅顯示前 $1 個檔案。'],
  [/^Showing (\d[\d,]*) files?\.$/, '顯示 $1 個檔案。'],
  // 文件列表行的无障碍名称
  [
    /^(.+), \((Directory|File|Submodule|Symlink to directory|Symlink to file)\)$/,
    (_, name: string, type: string) => `${name}（${ENTRY_TYPES[type] ?? type}）`
  ],
  // 目录条目过多被截断（文件列表表格内；带「Latest commit info may be omitted.」的版本由 code 词典处理）
  [
    /^Sorry, we had to truncate this directory to (\d[\d,]*) files\. (\d[\d,]*) (?:entry was|entries were) omitted from the list\.$/,
    '此目錄已截斷為 $1 個檔案，另有 $2 項未列出。'
  ],
  [/^(\d[\d,]*) (?:entry was|entries were) omitted from the list\.$/, '另有 $1 項未列出。'],
  // 许可证：README 标签页与 About 侧栏（MIT license、Apache-2.0 license）；许可证名以大写字母或数字开头
  [new RegExp(`^(?!(?:${NOT_LICENSE_SOURCE})\\b)([A-Z0-9][\\w.+-]*) license$`), '$1 授權條款'],
  // 多个许可证：MIT and 2 other licenses found（无名称时为 Unknown）；恰好两个时 MIT, Apache-2.0 licenses found
  [
    /^(.+) and (\d+) other licenses? found$/,
    (_, name: string, count: string) => `找到${name === 'Unknown' ? '未知的授權條款' : ` ${name} `}和其他 ${count} 個授權條款`
  ],
  [/^([^,]+), ([^,]+) licenses found$/, '找到 $1、$2 授權條款'],
  // Code 下拉：启动桌面应用
  [/^Launching (GitHub Desktop|Visual Studio|Xcode)$/, (_, app: string) => `正在啟動 ${DESKTOP_APPS[app] ?? app}`],
  [/^download (GitHub Desktop|Visual Studio|Xcode)$/, (_, app: string) => `下載 ${DESKTOP_APPS[app] ?? app}`],
  // Code 下拉的 Codespaces 标签页：企业托管用户（句首为链接；整句由 inline 处理，此为未拼成整句时的片段）
  [/^must have their Codespaces usage paid for by (.+)\.$/, (_, payer: string) => `的程式碼空間使用量必須由${codespacesPayer(payer)}支付。`]
]

/**
 * 存储库首页与目录页的代码区：分支选择器、分支 / 标记计数、转到文件、添加文件、
 * Code 下拉（本地克隆、Codespaces 标签页的错误提示）、最新提交行、文件列表、README 标签页与大纲、向 Copilot 提问。
 * 分支选择器、文件列表等组件也出现在目录页（页面类型 code），共用的短词与组件文字放在 scoped，
 * 只在存储库首页出现的整句放在 static。
 * 分支名、标记名、新建分支名与文件搜索结果属于用户内容，由 ignore 排除。
 */
export default {
  static: {
    // 分支选择器的标记搜索框（整句，全站生效）
    'Search for a tag': '搜尋標記',

    // README 标签页
    'Repository files navigation': '儲存庫檔案導覽',
    'Add a README': '新增讀我檔案',
    'Add a README with an overview of your project.': '新增讀我檔案以概述你的專案。',
    'Help people interested in this repository understand your project.': '協助對此儲存庫感興趣的人瞭解你的專案。',
    'Help people interested in this repository understand your project by adding a README.':
      '新增讀我檔案來協助對此儲存庫感興趣的人瞭解你的專案。',

    // 向 Copilot 提问
    'Ask Copilot about this repository': '向 Copilot 詢問此儲存庫',
    "This repository doesn't have a README yet. Ask Copilot to learn how this project works.":
      '此儲存庫還沒有讀我檔案。詢問 Copilot 以瞭解此專案的運作方式。',
    'This repository doesn’t have a README yet. Ask Copilot to learn how this project works.':
      '此儲存庫還沒有讀我檔案。詢問 Copilot 以瞭解此專案的運作方式。',
    'Give me a high-level overview': '提供整體概要',
    'Give me a high-level overview of this repository.': '提供此儲存庫的整體概要。',
    'How can I contribute?': '我該如何貢獻？',
    'How can I contribute to this repository?': '我該如何為此儲存庫做出貢獻？',
    'Summarize latest changes': '摘要最新變更',
    'Summarize the latest changes in this repository.': '摘要此儲存庫的最新變更。',
    'Generate a README': '產生讀我檔案',
    'Generate a README for this repository.': '為此儲存庫產生讀我檔案。',

    // Code 下拉：本地克隆
    'Code access options': '程式碼存取選項',
    'Which remote URL should I use?': '應該使用哪個遠端 URL？',
    'Remote URL selector': '遠端 URL 選擇器',
    'Clone with HTTPS': '使用 HTTPS 複製儲存庫',
    'Clone with SSH': '使用 SSH 複製儲存庫',
    'Clone with GitHub CLI': '使用 GitHub CLI 複製儲存庫',
    'Clone with HTTPS url': 'HTTPS 複製用 URL',
    'Clone with SSH url': 'SSH 複製用 URL',
    'Clone with GitHub CLI command': 'GitHub CLI 複製用命令',
    'Copy URL to clipboard': '將 URL 複製到剪貼簿',
    'Copy command to clipboard': '將命令複製到剪貼簿',
    'Clone using the web URL.': '使用網頁 URL 複製儲存庫。',
    'Use a password-protected SSH key.': '使用受密碼保護的 SSH 金鑰。',
    'Use a password-protected SSH key or certificate.': '使用受密碼保護的 SSH 金鑰或憑證。',
    'Use a password-protected SSH certificate.': '使用受密碼保護的 SSH 憑證。',
    // 没有 SSH 公钥：…你可以 <新增公開金鑰>，或嘗試透過 HTTPS 複製此儲存庫。（整句由 inline 处理，此为未拼成整句时的片段）
    "You don't have any public SSH keys in your GitHub account. You can": '你的 GitHub 帳號中沒有 SSH 公開金鑰。你可以',
    'You don’t have any public SSH keys in your GitHub account. You can': '你的 GitHub 帳號中沒有 SSH 公開金鑰。你可以',
    "You don't have any public SSH keys in your GitHub account.": '你的 GitHub 帳號中沒有 SSH 公開金鑰。',
    'You don’t have any public SSH keys in your GitHub account.': '你的 GitHub 帳號中沒有 SSH 公開金鑰。',
    'add a new public key': '新增公開金鑰',
    ', or try cloning this repository via HTTPS.': '，或嘗試透過 HTTPS 複製此儲存庫。',
    'Work fast with our official CLI.': '透過官方 CLI 加快工作速度。',
    'Learn more about the GitHub CLI': '瞭解 GitHub CLI',
    'Repository actions': '儲存庫動作',
    'Open with GitHub Desktop': '使用 GitHub 桌面版開啟',
    'Open with Visual Studio': '使用 Visual Studio 開啟',
    'Open with Xcode': '使用 Xcode 開啟',
    'Download ZIP': '下載 ZIP',
    // Code 下拉：旧版 Copilot 推广横幅（Don't show again 由 code 词典收录）
    'Code 55% faster with AI pair programming.': '透過 AI 結對程式設計讓寫程式速度提升 55%。',
    'Start my free trial': '開始免費試用',

    // Code 下拉：Codespaces 标签页的错误提示（被链接拆开的整句由 inline 处理，以下为未拼成整句时的片段）
    'Codespaces data failed to load.': '程式碼空間資料載入失敗。',
    'Refresh the page and try again.': '請重新整理頁面後再試一次。',
    'Loading codespaces': '正在載入程式碼空間',
    'Sign in required': '需要登入',
    // 請 <登入> 以使用程式碼空間。
    'to use Codespaces.': '以使用程式碼空間。',
    'Codespace access limited': '程式碼空間存取受限',
    'Repository access limited': '儲存庫存取受限',
    'You do not have access to push to this repository and its owner has disabled forking.':
      '你沒有此儲存庫的推送權限且其擁有者已停用分叉。',
    'Your enterprise has disabled Codespaces at this time. Please contact your enterprise administrator for more information.':
      '你的企業目前已停用程式碼空間。請聯絡企業管理員以瞭解詳情。',
    'Your organization has disabled Codespaces on this repository. Please contact your organization administrator for more information.':
      '你的組織已在此儲存庫停用程式碼空間。請聯絡組織管理員以瞭解詳情。',
    'Enterprise-managed users': '企業受控使用者',
    // 你的組織或企業強制執行了程式碼空間目前不支援的 <IP 允許清單>。（片段原文无逗号，译文不加）
    'Your organization or enterprise enforces': '你的組織或企業強制執行了',
    'IP allow lists': 'IP 允許清單',
    'which are unsupported by Codespaces at this time.': '但程式碼空間目前不支援。',
    // 發生未預期的錯誤。請 <聯絡支援團隊> 以瞭解詳情。
    'An unexpected error occurred. Please': '發生未預期的錯誤。請'
  },
  scoped: {
    // 分支选择器
    'Switch branches/tags': '切換分支/標記',
    'Switch branches': '切換分支',
    'Switch tags': '切換標記',
    'Find a branch...': '尋找分支...',
    'Find a branch…': '尋找分支…',
    'Find or create a branch...': '尋找或建立分支...',
    'Find or create a branch…': '尋找或建立分支…',
    // 旧版分支选择器
    'Find a tag...': '尋找標記...',
    'Find a tag…': '尋找標記…',
    'Filter branches/tags': '篩選分支/標記',
    'Sorry, that branch already exists.': '抱歉，此分支已存在。',
    'Search or create a new tag': '搜尋或建立新標記',
    'Filter branches': '篩選分支',
    'Filter tags': '篩選標記',
    'Select a tag': '選擇標記',
    'Ref type': '參考類型',
    Branches: '分支',
    Tags: '標記',
    Branch: '分支',
    // 引用类型选项；创建标记对话框的字段名
    Tag: '標記',
    branches: '個分支',
    tags: '個標記',
    tag: '個標記',
    default: '預設',
    'View all branches': '查看所有分支',
    'View all tags': '查看所有標記',
    'All branches': '所有分支',
    'All tags': '所有標記',
    'Loading branches...': '正在載入分支...',
    'Loading tags...': '正在載入標記...',
    // 新建分支：建立分支 <名称> 來自 <当前分支>
    'Create branch': '建立分支',
    from: '來自',
    'A tag already exists with the provided branch name. Many Git commands accept both tag and branch names, so creating this branch may cause unexpected behavior. Are you sure you want to create this branch?':
      '已有與此分支同名的標記。許多 Git 命令同時接受標記名稱和分支名稱，因此建立此分支可能導致非預期的行為。確定要建立此分支嗎？',
    // 选择器的创建标记按钮与对话框（CreateTagDialog）：存储库首页不启用，发行版表单的标记选择器启用；
    // 按钮与对话框标题、输入框的无障碍名称。校验提示（Tag cannot be blank、与分支同名等）由 releases 词典收录
    'Create new tag': '建立新標記',
    'Tag name': '標記名稱',
    'Created on publish': '發布時建立',

    // 工具栏：分支 / 标记页面、转到文件、添加文件
    'Go to Branches page': '前往分支頁面',
    'Go to Tags page': '前往標記頁面',
    'Go to file': '前往檔案',
    'Go to folder': '前往資料夾',
    'See all results': '查看所有結果',
    'Failed to search': '搜尋失敗',
    'Open more actions menu': '開啟更多動作選單',
    'Add file': '新增檔案',
    'Create new file': '建立新檔案',
    'Upload files': '上傳檔案',
    'Upload file': '上傳檔案',

    // Code 下拉
    Clone: '複製儲存庫',
    'You can': '你可以',
    // 如果沒有反應，<下載 GitHub 桌面版> 後再試一次。（整句由 inline 处理，此为未拼成整句时的片段）
    'If nothing happens,': '如果沒有反應，',
    'and try again.': '後再試一次。',
    // Please 由 common/dialogs.ts 的全局词条翻译
    'sign in': '登入',
    'contact support': '聯絡支援團隊',

    // 最新提交行（History 由 common-ui 收录）
    'Latest commit': '最新提交',
    'View commit history for this file.': '查看此檔案的提交歷史記錄。',
    'Open commit details': '開啟提交詳細資料',
    'Cannot retrieve latest commit at this time.': '目前無法取得最新提交。',
    'Failed to load latest commit information.': '無法載入最新提交資訊。',
    // 检查状态徽章（图标按钮的名称是状态值）
    failure: '失敗',
    success: '成功',
    pending: '擱置中',
    error: '錯誤',

    // 文件列表
    'Folders and files': '資料夾和檔案',
    'Last commit message': '上次提交訊息',
    'Last commit date': '上次提交日期',
    'Parent directory': '上層目錄',
    'parent directory': '上層目錄',
    'View all files': '查看所有檔案',
    'Expand list': '展開清單',
    'Collapse list': '摺疊清單',
    'This path skips through empty directories': '此路徑略過了空目錄',
    'No commit message': '沒有提交訊息',
    'Invalid date': '無效的日期',
    'Drop to upload your files': '拖放到這裡以上傳檔案',
    Directory: '目錄',
    File: '檔案',
    Submodule: '子模組',
    'Symlink to directory': '指向目錄的符號連結',
    'Symlink to file': '指向檔案的符號連結',
    'Learn more about configuring a template chooser.': '瞭解如何設定範本選擇器。',
    'This commit does not belong to any branch on this repository, and may belong to a fork outside of the repository.':
      '此提交不屬於此儲存庫的任何分支，可能屬於儲存庫外的分叉。',

    // README 标签页与大纲
    README: '讀我檔案',
    'Code of conduct': '行為準則',
    Contributing: '貢獻指南',
    'Security policy': '安全性政策',
    'View license': '查看授權條款',
    'Edit file': '編輯檔案',
    Outline: '大綱',
    'Close outline': '關閉大綱',
    'Filter headings': '篩選標題'
  },
  regexp,
  // 被链接拆开的整句（React 把 {' '} 渲染成单独的文本节点）：整句命中后不再逐段翻译，链接文字照常翻译
  inline: [
    // Code 下拉：没有 SSH 公钥（LocalTab）
    [
      "You don't have any public SSH keys in your GitHub account. You can {}, or try cloning this repository via HTTPS.",
      '你的 GitHub 帳號中沒有 SSH 公開金鑰。你可以{}，或嘗試透過 HTTPS 複製此儲存庫。'
    ],
    [
      'You don’t have any public SSH keys in your GitHub account. You can {}, or try cloning this repository via HTTPS.',
      '你的 GitHub 帳號中沒有 SSH 公開金鑰。你可以{}，或嘗試透過 HTTPS 複製此儲存庫。'
    ],
    // Code 下拉：启动桌面应用后的提示（LocalTab 的 LaunchingPlatformContents）：
    // 链接文字是「下載 GitHub 桌面版」或「下載 Xcode」，结尾可能是中文或英文，放在句末紧接句号，两种都不需要空格
    ['If nothing happens, {} and try again.', '如果沒有反應，請在重試前{}。'],
    // Code 下拉：Codespaces 标签页的错误提示（CodespacesTab）
    ['Please {} to use Codespaces.', '請{}以使用程式碼空間。'],
    [
      'Your organization or enterprise enforces {} which are unsupported by Codespaces at this time.',
      '你的組織或企業強制執行了程式碼空間目前不支援的 {}。'
    ],
    ['An unexpected error occurred. Please {} for more information.', '發生未預期的錯誤。請{}以瞭解詳情。'],
    [
      /^\{\} must have their Codespaces usage paid for by (.+)\.$/,
      (_, payer: string) => `{}的程式碼空間使用量必須由${codespacesPayer(payer)}支付。`
    ]
  ],
  ignore: [
    // 类名有 名称__哈希、模块-module_哈希_名称 两种写法，各写一条
    // 分支选择器按钮上的当前分支名；发行版表单的标记、目标、上一个标记按钮里，灰色的字段名（Tag: 等）照常翻译，
    // 只忽略其后的值（未选择时的 Select tag、Auto 照常翻译，见 core/ignore 的 PLACEHOLDER_TEXTS）
    '[class*="RefSelectorText__"]:not(:has(.fgColor-muted))',
    '[class*="_RefSelectorText"]:not(:has(.fgColor-muted))',
    '[class*="RefSelectorText__"] > span:not(.fgColor-muted)',
    '[class*="_RefSelectorText"] > span:not(.fgColor-muted)',
    // 列表中的分支 / 标记名、新建分支的名称与来源
    '[class*="HighlightedText__"]',
    '[class*="_HighlightedText"]',
    '[class*="RefActionText__"]',
    '[class*="_RefActionText"]',
    // 转到文件的搜索结果路径
    '[class*="HighlightMatch__"]',
    '[class*="_HighlightMatch"]'
  ]
} satisfies PageDictionary
