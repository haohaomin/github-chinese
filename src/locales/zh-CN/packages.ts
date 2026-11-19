import type { PageDictionary, RegExpRule } from '../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from './helpers'

/** “Learn more about …”中的注册表名；Containers 与 profile.ts 一致译为“容器”，其余是第三方品牌名，保留英文 */
const REGISTRY_SOURCE = '(?:Apache Maven|Maven or Gradle|Maven|Gradle|NuGet|RubyGems|npm|Docker|Containers)'

/** Learn more about npm packages → 了解 npm 软件包；Learn more about Maven or Gradle → 了解 Maven 或 Gradle */
function learnMoreAbout(registry: string, packages: boolean): string {
  if (registry === 'Containers') return packages ? '了解容器软件包' : '了解容器'
  const name = registry.replace(' or ', ' 或 ')
  return packages ? `了解 ${name} 软件包` : `了解 ${name}`
}

/** 软件包名：容器 / npm / NuGet / Maven / RubyGems 名称所用字符 */
const NAME_SOURCE = '[\\w.@/-]+'

/** 设置页提示中的存储库名、软件包名、用户名（不含空白） */
const ID_SOURCE = '[\\w.@/-]+'

/** “Remove <名称> from <软件包>”中名称不会是这些界面名词（Remove access from repository 等） */
const NOT_UI_NOUN = '(?!(?:access|collaborator|member|package|permission|repository|team|user|version)s? )'

/** “Package <名称>”标题段排除的界面词：Package settings、Package Details 等 */
const NOT_PACKAGE_WORD =
  '(?![A-Z][a-z]+$)(?!(?:access|details|description|downloads|history|name|owner|registry|settings|source|type|versions|visibility)$)'

/** “<名称> versions”标题段排除的界面词：首字母大写的单词（Show versions、Older versions）与小写的 all versions 等 */
const NOT_VERSIONS_WORD =
  '(?![A-Z][a-z]+ versions$)(?!(?:active|all|deleted|latest|more|new|newer|no|old|older|other|package|previous|recent|tagged|untagged|view) versions$)'

const regexp: readonly RegExpRule[] = [
  // 版本发布时间：Published 38 minutes ago · Digest / Published over 6 years ago
  [new RegExp(`^Published (${TIME_SOURCE}) · Digest$`), (_, time) => `${joinCjk(translateTime(time), '发布')} · 摘要`],
  [new RegExp(`^Published (${TIME_SOURCE})$`), (_, time) => joinCjk(translateTime(time), '发布')],
  // 版本列表标签页与筛选
  [/^(\d[\d,]*) tagged$/, '$1 个带标签版本'],
  [/^(\d[\d,]*) untagged$/, '$1 个无标签版本'],
  [/^(\d[\d,]*) active$/, '$1 个活跃版本'],
  [/^(\d[\d,]*) deleted$/, '$1 个已删除版本'],
  [/^Package versions of (.+)$/, '$1 的软件包版本'],
  // 详情侧栏
  [/^\+ (\d[\d,]*) contributors?$/, '+ $1 个贡献者'],
  [/^(\d[\d,]*) dependenc(?:y|ies)$/, '$1 个依赖项'],
  [new RegExp(`^Learn more about (${REGISTRY_SOURCE})( packages)?$`), (_, registry, suffix) => learnMoreAbout(registry, Boolean(suffix))],
  // 页面标题段：Package hello-world / hello-world versions
  [new RegExp(`^Package ${NOT_PACKAGE_WORD}(${NAME_SOURCE})$`), '软件包 $1'],
  [new RegExp(`^${NOT_VERSIONS_WORD}(${NAME_SOURCE}) versions$`), '$1 的版本'],
  // 设置：确认对话框
  [/^Please type (.+) to confirm([.:])$/, (_, name, mark) => `请输入 ${name} 以确认${mark === ':' ? '：' : '。'}`],
  [new RegExp(`^Are you sure you want to unlink (${ID_SOURCE}) from (${ID_SOURCE})\\?$`), '确定要取消 $1 与 $2 的链接吗？'],
  // 设置：访问权限列表
  [/^(\d[\d,]*) repositor(?:y|ies) selected(…|\.\.\.)$/, '已选择 $1 个存储库$2'],
  [/^Change the role of (\d[\d,]*) repositor(?:y|ies)\?$/, '要更改 $1 个存储库的角色吗？'],
  [/^(\d[\d,]*) members? selected(…|\.\.\.)$/, '已选择 $1 个成员$2'],
  [/^Change the role of (\d[\d,]*) members?\?$/, '要更改 $1 个成员的角色吗？'],
  [/^Change (\d[\d,]*) [Rr]oles?$/, '更改 $1 个角色'],
  [new RegExp(`^(${ID_SOURCE})'s access settings$`), '$1 的访问设置'],
  [new RegExp(`^Removed access from repository (${ID_SOURCE})\\.$`), '已移除存储库 $1 的访问权限。'],
  [new RegExp(`^Removed (${ID_SOURCE}) as a package collaborator\\.$`), '已将 $1 从软件包协作者中移除。'],
  [
    new RegExp(`^Remove ${NOT_UI_NOUN}(${ID_SOURCE}) from (${ID_SOURCE})(\\??)$`),
    (_, item, target, question) => (question ? `要从 ${target} 中移除 ${item} 吗？` : `从 ${target} 中移除 ${item}`)
  ]
]

/**
 * 软件包（GitHub Packages）：组织 / 用户 / 存储库的软件包列表、软件包详情（各注册表安装说明）、版本列表、单个版本、
 * 链接存储库、软件包设置（访问权限、可见性、删除）。
 * 页面类型 packages 覆盖 /orgs/<org>/packages…、/users/<user>/packages…、/<owner>/<repo>/pkgs…、/<owner>/<repo>/packages。
 * 空状态（Get started with GitHub Packages、Choose a registry、各注册表说明）已由 profile 词典的 static 收录。
 */
export default {
  static: {
    // 列表与存储库首页侧栏（“Clear current search query, filters, and sorts”由 security 词典收录）
    'Search packages…': '搜索软件包…',
    'Search packages...': '搜索软件包...',
    'browsing all packages': '浏览所有软件包',
    'No packages published': '未发布软件包',
    'Publish your first package': '发布你的第一个软件包',
    // 原文用破折号补充说明容器，译文同用破折号，不改成括号
    'A software platform used for building applications based on containers — small and lightweight execution environments.':
      '基于容器构建应用的软件平台——容器即小巧轻量的执行环境。',

    // 软件包详情：安装说明
    'Install from the command line': '通过命令行安装',
    'Install from the command line:': '通过命令行安装：',
    'Install via package.json:': '通过 package.json 安装：',
    'Install via Gemfile:': '通过 Gemfile 安装：',
    'Install 1/2: Add this to pom.xml:': '安装 1/2：将以下内容添加到 pom.xml：',
    'Install 2/2: Run via command line': '安装 2/2：通过命令行运行',
    'Install 2/2: Run via command line:': '安装 2/2：通过命令行运行：',
    'Learn more about packages': '了解软件包',
    'Use as base image in Dockerfile:': '在 Dockerfile 中用作基础映像：',
    'Use as base image in DockerFile:': '在 Dockerfile 中用作基础映像：',

    // 软件包详情：版本与侧栏
    'About this package': '关于此软件包',
    'Recent tagged image versions': '最近带标签的映像版本',
    'View all tagged versions': '查看所有带标签的版本',
    'View and manage all versions': '查看并管理所有版本',
    'View all versions': '查看所有版本',
    'Recent Versions': '最近版本',
    'Version downloads': '版本下载量',
    'Last published': '最近发布',
    'Total downloads': '总下载量',
    'Downloads for the last 30 days': '最近 30 天的下载量',
    'Package settings': '软件包设置',
    'Add a Readme to the linked repository': '为链接的存储库添加自述文件',
    "The linked repository's Readme will be shown here.": '此处将显示所链接存储库的自述文件。',
    'The linked repository’s Readme will be shown here.': '此处将显示所链接存储库的自述文件。',

    // 未链接存储库的软件包
    'Link this package to a repository': '将此软件包链接到存储库',
    'By linking to a repository, you can automatically add a Readme, link discussions, and show contributors on this page.':
      '链接到存储库后，可以自动在此页面添加自述文件、链接讨论并显示贡献者。',
    'Connect Repository': '连接存储库',
    'Connect repository': '连接存储库',
    'Link to repository': '链接到存储库',
    'Select a repository to link to this package.': '选择要链接到此软件包的存储库。',

    // 单个版本
    'About this version': '关于此版本',
    'Container instructions': '容器使用说明',
    'OS / Arch': '操作系统/架构',
    'This package version was published': '此软件包版本发布于',
    'To provide a description, add the following line to your Dockerfile:': '如需提供描述，请在 Dockerfile 中添加以下行：',
    // For multi-arch images, set a value for the <code>…</code> key in the <code>…</code> field of the manifest:
    'For multi-arch images, set a value for the': '对于多架构映像，请为',
    'Learn more about labelling container images': '了解如何标注容器映像',
    'Download activity': '下载活动',
    'Download activity of this version': '此版本的下载活动',
    'Other tags on this version': '此版本的其他标签',
    'Delete version': '删除版本',
    // This cannot be undone. This will permanently delete the version <strong> so users and processes won’t …
    // 原文片段之间没有逗号，译文用“并”衔接
    'This cannot be undone. This will permanently delete the version': '此操作无法撤销。这将永久删除版本',
    'so users and processes won’t be able to download this version.': '并让用户和进程无法再下载此版本。',
    "so users and processes won't be able to download this version.": '并让用户和进程无法再下载此版本。',
    'I understand the consequences, delete this version': '我了解后果，删除此版本',

    // 软件包设置：存储库来源
    'Repository source': '存储库来源',
    // This is the repository … using the <code>repository</code> field.
    "This is the repository where the package's source code is stored. This is defined in the repository's package.json file using the":
      '这是存放软件包源代码的存储库。它由存储库 package.json 文件中的',
    'A GitHub repository has been identified as the source for this package. This package will be displayed in this repositories package list.':
      '已识别出此软件包的源存储库。此软件包将显示在该存储库的软件包列表中。',
    'You have referenced a non-GitHub source for this package that cannot be verified.': '你为此软件包引用了无法验证的非 GitHub 来源。',
    'Confirm you want to unlink this repository': '确认取消链接此存储库',
    'Yes, unlink this repository': '是，取消链接此存储库',

    // 软件包设置：Actions / Codespaces 访问权限（产品名译成中文：Actions → 操作，Codespaces → 代码空间）
    'Manage Actions access': '管理操作访问权限',
    'Actions repository access': '操作存储库访问权限',
    'Pick the repositories that can access this package using GitHub Actions.': '选择可通过 GitHub 操作访问此软件包的存储库。',
    // Pick the repositories that can access this package using <a>GitHub Actions</a>.
    'Pick the repositories that can access this package using': '选择可通过以下方式访问此软件包的存储库',
    'Select repository that can access this package using GitHub actions': '选择可通过 GitHub 操作访问此软件包的存储库',
    'Manage Codespaces access': '管理代码空间访问权限',
    'Codespaces repository access': '代码空间存储库访问权限',
    'Pick the repositories that can read this package using GitHub Codespaces.': '选择可通过 GitHub 代码空间读取此软件包的存储库。',
    'Pick the repositories that can read this package using': '选择可通过以下方式读取此软件包的存储库',
    'Select repository that can access this package using GitHub codespaces': '选择可通过 GitHub 代码空间访问此软件包的存储库',
    'Permissions added for selected repositories.': '已为所选存储库添加权限。',
    'Permissions updated for selected repositories.': '已更新所选存储库的权限。',
    'Confirm you want to remove this repository': '确认移除此存储库',
    // 访问权限列表中移除存储库的按钮（aria-label）
    'remove access to repository from this package': '移除存储库对此软件包的访问权限',

    // 软件包设置：角色说明（原文分句，译文同样分句）
    'Can download this package and read package metadata.': '可下载此软件包并读取软件包元数据。',
    'Can upload and download this package. Can read and write package metadata.': '可上传和下载此软件包。可读写软件包元数据。',
    'Can upload, download, and manage this package. Can read and write package metadata. Can delete and restore packages.':
      '可上传、下载和管理此软件包。可读写软件包元数据。可删除和恢复软件包。',
    'Can upload, download, and manage this package. Can read and write package metadata. Can grant package permissions.':
      '可上传、下载和管理此软件包。可读写软件包元数据。可授予软件包权限。',
    'Recommended for non-code contributors who want to view or discuss your package.': '推荐给希望查看或讨论软件包的非代码贡献者。',
    'Recommended for contributors who actively push to your package.': '推荐给积极向软件包推送的贡献者。',
    'Recommended for people who need full access to the package, including sensitive and destructive actions like managing security and package visibility.':
      '推荐给需要完全访问软件包的人员，包括管理安全设置和软件包可见性等敏感及破坏性操作。',

    // 软件包设置：继承的访问权限
    'Inherited access': '继承的访问权限',
    'Inherit access from source repository (recommended)': '从源存储库继承访问权限（推荐）',
    'Inherit access from repository (recommended)': '从存储库继承访问权限（推荐）',
    // Go to <a>owner/repo</a> to change access, or remove inherited access …
    'to change access, or remove inherited access to manage it separately. Inherited access is recommended.':
      '更改访问权限，或移除继承的访问权限以单独管理。推荐使用继承的访问权限。',

    // 软件包设置：危险区域
    'Change package visibility': '更改软件包可见性',
    'This package is currently public.': '此软件包当前为公共软件包。',
    'This package is currently private.': '此软件包当前为专用软件包。',
    'This package is currently internal.': '此软件包当前为内部软件包。',
    'Make this package visible to anyone.': '让任何人都能看到此软件包。',
    'Make this package visible privately, to organization members that have access.': '将此软件包设为专用，仅对有访问权限的组织成员可见。',
    'I understand the consequences, change package visibility': '我了解后果，更改软件包可见性',
    'I understand the consequences, change package visibility.': '我了解后果，更改软件包可见性。',
    'Delete this package': '删除此软件包',
    'Once you delete a package, there is no going back. Please be certain.': '删除软件包后，将无法恢复。请谨慎操作。',
    'Once this package is deleted, it will no longer be accessible.': '软件包删除后将无法再访问。',
    // This action will delete package <strong>name</strong>. Versions of this package …
    'This action will delete package': '此操作将删除软件包',
    '. Versions of this package will no longer be accessible, and it will not appear in searches or package listings.':
      '。此软件包的所有版本将无法再访问，也不会出现在搜索结果或软件包列表中。',
    'I understand the consequences, delete this package': '我了解后果，删除此软件包',
    // 存储库范围的软件包（继承存储库权限）
    'I understand, delete this package.': '我了解，删除此软件包。',
    'I understand, delete this package': '我了解，删除此软件包',
    'I understand the consequences, restore this package': '我了解后果，恢复此软件包',
    'I understand the consequences, restore this version.': '我了解后果，恢复此版本。',
    'I understand the consequences, restore this version': '我了解后果，恢复此版本'
  },
  scoped: {
    // 侧栏与筛选（组织软件包页侧栏：Packages 标题下的 GitHub Packages、Linked artifacts）
    Packages: '软件包',
    'GitHub Packages': 'GitHub 软件包',
    'Linked artifacts': '链接的产物',
    'Type:': '类型：',
    'Select type': '选择类型',
    'Close type options': '关闭类型选项',
    'Visibility:': '可见性：',
    'Select visibility': '选择可见性',
    'Close visibility options': '关闭可见性选项',
    'Select sort view': '选择排序依据',
    'Close sort options': '关闭排序选项',
    'Most downloads': '下载最多',
    'Least downloads': '下载最少',
    Container: '容器',
    Containers: '容器',
    // 搜索无结果：Try <a>browsing all packages</a> to find what you're looking for.（原文无逗号，译文不加）
    'No results matched your search.': '没有与搜索匹配的结果。',
    Try: '试试',
    "to find what you're looking for.": '来查找你需要的内容。',
    'to find what you’re looking for.': '来查找你需要的内容。',

    // 列表项：Published <时间> by <所有者> in <存储库>（标签式译法，避免片段间的标点）
    Published: '发布于',
    by: '发布者',
    in: '存储库',

    // 软件包详情
    Latest: '最新',
    'Latest version': '最新版本',
    'Label: Latest': '标签：最新',
    'Label: Latest version': '标签：最新版本',
    'Label: Visibility': '标签：可见性',
    'Recent versions': '最近版本',
    // 侧栏中指向链接的存储库自述文件的链接
    Readme: '自述文件',
    star: '星标',
    stars: '星标',
    Other: '其他',
    Contributors: '贡献者',
    'Open an issue': '提交议题',
    'Start a discussion': '开始讨论',
    Versions: '版本',
    'All versions': '所有版本',
    'Package versions': '软件包版本',
    // 版本列表右上角的视图切换（Tagged / Untagged、Active / Deleted）
    'Select versions view': '选择版本视图',
    // GitHub Enterprise Server 的软件包设置侧栏
    'Manage versions': '管理版本',
    'Actions access': '操作访问权限',
    Tagged: '带标签',
    Untagged: '无标签',
    Active: '活跃',
    Deleted: '已删除',
    Digest: '摘要',
    Manifest: '清单',

    // 单个版本
    Installation: '安装',
    'No description provided': '未提供描述',
    'key in the': '键在清单的',
    'field of the manifest:': '字段中设置值：',
    'Last 30 days': '最近 30 天',
    'Last week': '最近一周',

    // 软件包设置
    'Danger Zone': '危险区域',
    'Danger zone': '危险区域',
    'Change visibility': '更改可见性',
    'Manage access': '管理访问权限',
    'Add Repository': '添加存储库',
    'Add repository': '添加存储库',
    'Add repositories': '添加存储库',
    'Invite teams or people': '邀请团队或人员',
    // Invite teams or people to <strong>name</strong>
    'Invite teams or people to': '邀请团队或人员访问',
    'Search by username, full name, or email': '按用户名、全名或电子邮件搜索',
    'Confirm you want to remove this user': '确认移除此用户',
    'Role:': '角色：',
    'Choose role': '选择角色',
    'Change role': '更改角色',
    'Select a new role': '选择新角色',
    Read: '读取',
    Write: '写入',
    'Go to': '转到',
    'field.': '字段定义。',
    // Once removed, <strong>repo</strong> will no longer have access to the <strong>name</strong> package.
    'Once removed,': '移除后，',
    'will no longer have access to the': '将无法再访问',
    'package.': '软件包。',
    // Please type <strong>name</strong> to confirm:
    'Please type': '请输入',
    'to confirm:': '以确认：',
    'to confirm.': '以确认。',
    'Are you absolutely sure?': '你确定吗？'
  },
  regexp,
  ignore: [
    // 版本标签（如 latest、dev、2026.1.0）
    'a.Label',
    // 列表中的软件包名、所有者名与存储库名
    '#package-results .Box-row a.f4',
    '#package-results .Box-row .f6 a',
    // 软件包描述
    '.flex-md-row.mt-n1 > .col-12 > p',
    // 详情与版本页标题中的软件包名、版本标签
    'h1 > span.overflow-hidden.lh-condensed',
    // 面包屑：软件包名、当前版本的标签
    '.breadcrumb-item:first-child > a',
    '.breadcrumb-item-selected > a[href*="?tag="]',
    // 侧栏 Details：所有者、链接的存储库（星标数链接是界面文字）
    '.col-md-3 h4 + ul.list-style-none a.Link--primary',
    '.col-md-3 h4 + ul.list-style-none a.Link--muted:not([href$="/stargazers"])'
  ]
} satisfies PageDictionary
