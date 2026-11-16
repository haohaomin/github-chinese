import type { PageDictionary, RegExpRule } from '../../../core/types'

/**
 * 「<名称> branch / tag」里不是分支名、标签名的常见词（首字母大小写都排除）。
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

/** 代码空间使用量的付费方：their enterprise → 其企业；企业名原样保留，与两侧中文之间补空格 */
function codespacesPayer(payer: string): string {
  return payer === 'their enterprise' ? '其企业' : ` ${payer} `
}

/** Code 下拉可启动的桌面应用：客户端名 GitHub Desktop 译出（GitHub 桌面版），第三方应用名原样保留 */
const DESKTOP_APPS: Readonly<Record<string, string>> = {
  'GitHub Desktop': 'GitHub 桌面版'
}

const REF_TYPES: Readonly<Record<string, string>> = {
  branch: '分支',
  branches: '分支',
  tag: '标签',
  tags: '标签'
}

/** 检查状态徽章的状态值（术语表：Pending → 挂起） */
const CHECK_STATES: Readonly<Record<string, string>> = {
  failure: '失败',
  success: '成功',
  pending: '挂起',
  error: '出错'
}

/** 文件列表行的类型：<名称>, (Directory) */
const ENTRY_TYPES: Readonly<Record<string, string>> = {
  Directory: '目录',
  File: '文件',
  Submodule: '子模块',
  'Symlink to directory': '指向目录的符号链接',
  'Symlink to file': '指向文件的符号链接'
}

const regexp: readonly RegExpRule[] = [
  // 分支选择器按钮的无障碍名称：main branch / v1.0.0 tag（排除常见词开头的短语与 1 tag 这类计数）
  [
    new RegExp(`^(?!(?:${NOT_REF_SOURCE}) |\\d[\\d,]* )(\\S+) (branch|tag)$`),
    (_, name: string, type: string) => `${name} ${REF_TYPES[type] ?? type}`
  ],
  // 分支选择器筛选结果播报
  [/^(\d[\d,]*) (branch|branches|tag|tags) found$/, (_, count: string, type: string) => `找到 ${count} 个${REF_TYPES[type] ?? type}`],
  // 最新提交行：提交总数；复刻信息条：提交数片段
  [/^(\d[\d,]*) [Cc]ommits?$/, '$1 个提交'],
  [/^Commit ([0-9a-f]{7,40})$/, '提交 $1'],
  [/^commits by (\S+)(?: and (\S+))?$/, (_, first: string, second: string) => `${second ? `${first} 和 ${second}` : first} 的提交`],
  // 多个作者（与 commits 词典一致；存储库首页的作用域不含 commits）
  [/^Show (\d+) authors$/, '显示 $1 个作者'],
  [/^(\d+) authors$/, '$1 个作者'],
  [/^([\w.-]+)['’]s org home page$/, '$1 的组织主页'],
  [/^Status checks: (failure|success|pending|error)$/, (_, state: string) => `状态检查：${CHECK_STATES[state] ?? state}`],
  // 检查状态徽章的汇总（术语表：N checks → N 个检查）
  [/^(\d+) ?\/ ?(\d+) checks OK$/, '$1/$2 个检查正常'],
  // 转到文件：搜索结果数
  [/^First (\d[\d,]*) files shown\.$/, '仅显示前 $1 个文件。'],
  [/^Showing (\d[\d,]*) files?\.$/, '显示 $1 个文件。'],
  // 文件列表行的无障碍名称
  [
    /^(.+), \((Directory|File|Submodule|Symlink to directory|Symlink to file)\)$/,
    (_, name: string, type: string) => `${name}（${ENTRY_TYPES[type] ?? type}）`
  ],
  // 目录条目过多被截断（文件列表表格内；带「Latest commit info may be omitted.」的版本由 code 词典处理）
  [
    /^Sorry, we had to truncate this directory to (\d[\d,]*) files\. (\d[\d,]*) (?:entry was|entries were) omitted from the list\.$/,
    '此目录已截断为 $1 个文件，另有 $2 个条目未列出。'
  ],
  [/^(\d[\d,]*) (?:entry was|entries were) omitted from the list\.$/, '另有 $1 个条目未列出。'],
  // 许可证：README 标签页与 About 侧栏（MIT license、Apache-2.0 license）；许可证名以大写字母或数字开头
  [new RegExp(`^(?!(?:${NOT_LICENSE_SOURCE})\\b)([A-Z0-9][\\w.+-]*) license$`), '$1 许可证'],
  // 多个许可证：MIT and 2 other licenses found（无名称时为 Unknown）；恰好两个时 MIT, Apache-2.0 licenses found
  [
    /^(.+) and (\d+) other licenses? found$/,
    (_, name: string, count: string) => `找到${name === 'Unknown' ? '未知许可证' : ` ${name} `}及另外 ${count} 个许可证`
  ],
  [/^([^,]+), ([^,]+) licenses found$/, '找到 $1、$2 许可证'],
  // Code 下拉：启动桌面应用
  [/^Launching (GitHub Desktop|Visual Studio|Xcode)$/, (_, app: string) => `正在启动 ${DESKTOP_APPS[app] ?? app}`],
  [/^download (GitHub Desktop|Visual Studio|Xcode)$/, (_, app: string) => `下载 ${DESKTOP_APPS[app] ?? app}`],
  // Code 下拉的 Codespaces 标签页：企业托管用户（句首为链接；整句由 inline 处理，此为未拼成整句时的片段）
  [/^must have their Codespaces usage paid for by (.+)\.$/, (_, payer: string) => `的代码空间使用量必须由${codespacesPayer(payer)}支付。`]
]

/**
 * 存储库首页与目录页的代码区：分支选择器、分支 / 标签计数、转到文件、添加文件、
 * Code 下拉（本地克隆、Codespaces 标签页的错误提示）、最新提交行、文件列表、README 标签页与大纲、向 Copilot 提问。
 * 分支选择器、文件列表等组件也出现在目录页（页面类型 code），共用的短词与组件文字放在 scoped，
 * 只在存储库首页出现的整句放在 static。
 * 分支名、标签名、新建分支名与文件搜索结果属于用户内容，由 ignore 排除。
 */
export default {
  static: {
    // 分支选择器的标签搜索框（整句，全站生效）
    'Search for a tag': '搜索标签',

    // README 标签页
    'Repository files navigation': '存储库文件导航',
    'Add a README': '添加自述文件',
    'Add a README with an overview of your project.': '添加自述文件以概述你的项目。',
    'Help people interested in this repository understand your project.': '帮助对此存储库感兴趣的人了解你的项目。',
    'Help people interested in this repository understand your project by adding a README.':
      '通过添加自述文件帮助对此存储库感兴趣的人了解你的项目。',

    // 向 Copilot 提问
    'Ask Copilot about this repository': '向 Copilot 询问此存储库',
    "This repository doesn't have a README yet. Ask Copilot to learn how this project works.":
      '此存储库还没有自述文件。向 Copilot 提问以了解此项目的工作原理。',
    'This repository doesn’t have a README yet. Ask Copilot to learn how this project works.':
      '此存储库还没有自述文件。向 Copilot 提问以了解此项目的工作原理。',
    'Give me a high-level overview': '概述此存储库',
    'Give me a high-level overview of this repository.': '概述此存储库。',
    'How can I contribute?': '我该如何贡献？',
    'How can I contribute to this repository?': '我该如何为此存储库做贡献？',
    'Summarize latest changes': '总结最新更改',
    'Summarize the latest changes in this repository.': '总结此存储库的最新更改。',
    'Generate a README': '生成自述文件',
    'Generate a README for this repository.': '为此存储库生成自述文件。',

    // Code 下拉：本地克隆
    'Code access options': '代码访问选项',
    'Which remote URL should I use?': '应使用哪个远程 URL？',
    'Remote URL selector': '远程 URL 选择器',
    'Clone with HTTPS': '使用 HTTPS 克隆',
    'Clone with SSH': '使用 SSH 克隆',
    'Clone with GitHub CLI': '使用 GitHub CLI 克隆',
    'Clone with HTTPS url': 'HTTPS 克隆 URL',
    'Clone with SSH url': 'SSH 克隆 URL',
    'Clone with GitHub CLI command': 'GitHub CLI 克隆命令',
    'Copy URL to clipboard': '复制 URL 到剪贴板',
    'Copy command to clipboard': '复制命令到剪贴板',
    'Clone using the web URL.': '使用 Web URL 克隆。',
    'Use a password-protected SSH key.': '使用受密码保护的 SSH 密钥。',
    'Use a password-protected SSH key or certificate.': '使用受密码保护的 SSH 密钥或证书。',
    'Use a password-protected SSH certificate.': '使用受密码保护的 SSH 证书。',
    // 没有 SSH 公钥：…你可以 <添加新公钥>，或尝试通过 HTTPS 克隆此存储库。（整句由 inline 处理，此为未拼成整句时的片段）
    "You don't have any public SSH keys in your GitHub account. You can": '你的 GitHub 帐户中没有 SSH 公钥。你可以',
    'You don’t have any public SSH keys in your GitHub account. You can': '你的 GitHub 帐户中没有 SSH 公钥。你可以',
    "You don't have any public SSH keys in your GitHub account.": '你的 GitHub 帐户中没有 SSH 公钥。',
    'You don’t have any public SSH keys in your GitHub account.': '你的 GitHub 帐户中没有 SSH 公钥。',
    'add a new public key': '添加新公钥',
    ', or try cloning this repository via HTTPS.': '，或尝试通过 HTTPS 克隆此存储库。',
    'Work fast with our official CLI.': '使用官方 CLI 高效工作。',
    'Learn more about the GitHub CLI': '了解 GitHub CLI',
    'Repository actions': '存储库操作',
    'Open with GitHub Desktop': '使用 GitHub 桌面版打开',
    'Open with Visual Studio': '使用 Visual Studio 打开',
    'Open with Xcode': '使用 Xcode 打开',
    'Download ZIP': '下载 ZIP',
    // Code 下拉：旧版 Copilot 推广横幅（Don't show again 由 code 词典收录）
    'Code 55% faster with AI pair programming.': '借助 AI 结对编程将编码速度提升 55%。',
    'Start my free trial': '开始免费试用',

    // Code 下拉：Codespaces 标签页的错误提示（被链接拆开的整句由 inline 处理，以下为未拼成整句时的片段）
    'Codespaces data failed to load.': '代码空间数据加载失败。',
    'Refresh the page and try again.': '请刷新页面后重试。',
    'Loading codespaces': '正在加载代码空间',
    'Sign in required': '需要登录',
    // 请 <登录> 后使用代码空间。
    'to use Codespaces.': '后使用代码空间。',
    'Codespace access limited': '代码空间访问受限',
    'Repository access limited': '存储库访问受限',
    'You do not have access to push to this repository and its owner has disabled forking.':
      '你没有推送到此存储库的权限且其所有者已禁用复刻。',
    'Your enterprise has disabled Codespaces at this time. Please contact your enterprise administrator for more information.':
      '你的企业目前已禁用代码空间。请联系企业管理员了解详情。',
    'Your organization has disabled Codespaces on this repository. Please contact your organization administrator for more information.':
      '你的组织已在此存储库禁用代码空间。请联系组织管理员了解详情。',
    'Enterprise-managed users': '企业托管用户',
    // 你的组织或企业强制实施了代码空间目前不支持的 <IP 允许列表>。（片段原文无逗号，译文不加）
    'Your organization or enterprise enforces': '你的组织或企业强制实施了',
    'IP allow lists': 'IP 允许列表',
    'which are unsupported by Codespaces at this time.': '但代码空间目前不支持。',
    // 发生意外错误。请 <联系支持> 了解详情。
    'An unexpected error occurred. Please': '发生意外错误。请'
  },
  scoped: {
    // 分支选择器
    'Switch branches/tags': '切换分支/标签',
    'Switch branches': '切换分支',
    'Switch tags': '切换标签',
    'Find a branch...': '查找分支...',
    'Find a branch…': '查找分支…',
    'Find or create a branch...': '查找或创建分支...',
    'Find or create a branch…': '查找或创建分支…',
    // 旧版分支选择器
    'Find a tag...': '查找标签...',
    'Find a tag…': '查找标签…',
    'Filter branches/tags': '筛选分支/标签',
    'Sorry, that branch already exists.': '抱歉，该分支已存在。',
    'Search or create a new tag': '搜索或创建新标签',
    'Filter branches': '筛选分支',
    'Filter tags': '筛选标签',
    'Select a tag': '选择标签',
    'Ref type': '引用类型',
    Branches: '分支',
    Tags: '标签',
    Branch: '分支',
    // 引用类型选项；创建标签对话框的字段名
    Tag: '标签',
    branches: '个分支',
    tags: '个标签',
    tag: '个标签',
    default: '默认',
    'View all branches': '查看全部分支',
    'View all tags': '查看全部标签',
    'All branches': '所有分支',
    'All tags': '所有标签',
    'Loading branches...': '正在加载分支...',
    'Loading tags...': '正在加载标签...',
    // 新建分支：创建分支 <名称> 来自 <当前分支>
    'Create branch': '创建分支',
    from: '来自',
    'A tag already exists with the provided branch name. Many Git commands accept both tag and branch names, so creating this branch may cause unexpected behavior. Are you sure you want to create this branch?':
      '已存在与该分支同名的标签。许多 Git 命令同时接受标签名和分支名，因此创建此分支可能导致意外行为。确定要创建此分支吗？',
    // 选择器的创建标签按钮与对话框（CreateTagDialog）：存储库首页不启用，发行版表单的标签选择器启用；
    // 按钮与对话框标题、输入框的无障碍名称。校验提示（Tag cannot be blank、与分支同名等）由 releases 词典收录
    'Create new tag': '创建新标签',
    'Tag name': '标签名称',
    'Created on publish': '发布时创建',

    // 工具栏：分支 / 标签页面、转到文件、添加文件
    'Go to Branches page': '转到分支页面',
    'Go to Tags page': '转到标签页面',
    'Go to file': '转到文件',
    'Go to folder': '转到文件夹',
    'See all results': '查看所有结果',
    'Failed to search': '搜索失败',
    'Open more actions menu': '打开更多操作菜单',
    'Add file': '添加文件',
    'Create new file': '创建新文件',
    'Upload files': '上传文件',
    'Upload file': '上传文件',

    // Code 下拉
    Clone: '克隆',
    'You can': '你可以',
    // 如果没有反应，<下载 GitHub 桌面版> 后重试。（整句由 inline 处理，此为未拼成整句时的片段）
    'If nothing happens,': '如果没有反应，',
    'and try again.': '后重试。',
    // Please 由 common/dialogs.ts 的全局词条翻译
    'sign in': '登录',
    'contact support': '联系支持',

    // 最新提交行（History 由 common-ui 收录）
    'Latest commit': '最新提交',
    'View commit history for this file.': '查看此文件的提交历史记录。',
    'Open commit details': '打开提交详细信息',
    'Cannot retrieve latest commit at this time.': '暂时无法获取最新提交。',
    'Failed to load latest commit information.': '无法加载最新提交信息。',
    // 检查状态徽章（图标按钮的名称是状态值）
    failure: '失败',
    success: '成功',
    pending: '挂起',
    error: '出错',

    // 文件列表
    'Folders and files': '文件夹和文件',
    'Last commit message': '最后提交消息',
    'Last commit date': '最后提交日期',
    'Parent directory': '上级目录',
    'parent directory': '上级目录',
    'View all files': '查看所有文件',
    'Expand list': '展开列表',
    'Collapse list': '收起列表',
    'This path skips through empty directories': '此路径跳过了空目录',
    'No commit message': '无提交消息',
    'Invalid date': '无效日期',
    'Drop to upload your files': '拖放到此处以上传文件',
    Directory: '目录',
    File: '文件',
    Submodule: '子模块',
    'Symlink to directory': '指向目录的符号链接',
    'Symlink to file': '指向文件的符号链接',
    'Learn more about configuring a template chooser.': '了解如何配置模板选择器。',
    'This commit does not belong to any branch on this repository, and may belong to a fork outside of the repository.':
      '此提交不属于此存储库的任何分支，可能属于存储库外的复刻。',

    // README 标签页与大纲
    README: '自述文件',
    'Code of conduct': '行为准则',
    Contributing: '贡献指南',
    'Security policy': '安全策略',
    'View license': '查看许可证',
    'Edit file': '编辑文件',
    Outline: '大纲',
    'Close outline': '关闭大纲',
    'Filter headings': '筛选标题'
  },
  regexp,
  // 被链接拆开的整句（React 把 {' '} 渲染成单独的文本节点）：整句命中后不再逐段翻译，链接文字照常翻译
  inline: [
    // Code 下拉：没有 SSH 公钥（LocalTab）
    [
      "You don't have any public SSH keys in your GitHub account. You can {}, or try cloning this repository via HTTPS.",
      '你的 GitHub 帐户中没有 SSH 公钥。你可以{}，或尝试通过 HTTPS 克隆此存储库。'
    ],
    [
      'You don’t have any public SSH keys in your GitHub account. You can {}, or try cloning this repository via HTTPS.',
      '你的 GitHub 帐户中没有 SSH 公钥。你可以{}，或尝试通过 HTTPS 克隆此存储库。'
    ],
    // Code 下拉：启动桌面应用后的提示（LocalTab 的 LaunchingPlatformContents）：
    // 链接文字是「下载 GitHub 桌面版」或「下载 Xcode」，结尾可能是中文或英文，放在句末紧接句号，两种都不需要空格
    ['If nothing happens, {} and try again.', '如果没有反应，请在重试前{}。'],
    // Code 下拉：Codespaces 标签页的错误提示（CodespacesTab）
    ['Please {} to use Codespaces.', '请{}后使用代码空间。'],
    [
      'Your organization or enterprise enforces {} which are unsupported by Codespaces at this time.',
      '你的组织或企业强制实施了代码空间目前不支持的 {}。'
    ],
    ['An unexpected error occurred. Please {} for more information.', '发生意外错误。请{}了解详情。'],
    [
      /^\{\} must have their Codespaces usage paid for by (.+)\.$/,
      (_, payer: string) => `{}的代码空间使用量必须由${codespacesPayer(payer)}支付。`
    ]
  ],
  ignore: [
    // 类名有 名称__哈希、模块-module_哈希_名称 两种写法，各写一条
    // 分支选择器按钮上的当前分支名；发行版表单的标签、目标、上一个标签按钮里，灰色的字段名（Tag: 等）照常翻译，
    // 只忽略其后的值（未选择时的 Select tag、Auto 照常翻译，见 core/ignore 的 PLACEHOLDER_TEXTS）
    '[class*="RefSelectorText__"]:not(:has(.fgColor-muted))',
    '[class*="_RefSelectorText"]:not(:has(.fgColor-muted))',
    '[class*="RefSelectorText__"] > span:not(.fgColor-muted)',
    '[class*="_RefSelectorText"] > span:not(.fgColor-muted)',
    // 列表中的分支 / 标签名、新建分支的名称与来源
    '[class*="HighlightedText__"]',
    '[class*="_HighlightedText"]',
    '[class*="RefActionText__"]',
    '[class*="_RefActionText"]',
    // 转到文件的搜索结果路径
    '[class*="HighlightMatch__"]',
    '[class*="_HighlightMatch"]'
  ]
} satisfies PageDictionary
