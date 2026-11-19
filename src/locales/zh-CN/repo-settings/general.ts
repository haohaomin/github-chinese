import type { PageDictionary } from '../../../core/types'

const NAME = '([\\w.-]+)'
const BRANCH = '(\\S+)'

/**
 * 存储库设置 · 常规：存储库名称、模板存储库、提交签署与提交评论、默认分支（重命名与切换对话框）、
 * 发行版不可变、社交预览、功能（Wiki、议题、复刻、赞助、存档计划、讨论、项目、拉取请求）、
 * 拉取请求合并设置、存档、推送、议题自动关闭。
 * 危险区域及其对话框见 danger-zone.ts。
 */
export default {
  static: {
    // 存储库名称
    'Repository name was not changed': '存储库名称未更改',
    'already exists on this account.': '已存在于此帐户中。',
    'already exists on this account': '已存在于此帐户中',

    // 模板存储库
    'Template repository': '模板存储库',
    'Template repositories let users generate new repositories with the same directory structure and files.':
      '模板存储库可让用户生成目录结构和文件相同的新存储库。',
    'Learn more about template repositories': '了解模板存储库',
    'Learn more about template repositories.': '了解模板存储库。',
    'A repository with LFS content cannot be used as a template.': '包含 LFS 内容的存储库不能用作模板。',

    // 提交：签署与提交评论（「Require contributors to sign off on web-based commits」等由 org-settings 收录）
    "Enabling this setting will require contributors to sign off on commits made through GitHub's web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the":
      '启用此设置后，贡献者须签署其通过 GitHub 网页界面所做的提交。签署是贡献者确认其提交符合存储库条款的一种方式，通常为',
    "Enabling this setting will require contributors to sign off on commits made through GitHub’s web interface. Signing off is a way for contributors to affirm that their commit complies with the repository's terms, commonly the":
      '启用此设置后，贡献者须签署其通过 GitHub 网页界面所做的提交。签署是贡献者确认其提交符合存储库条款的一种方式，通常为',
    'Enabling this setting will require contributors to sign off on commits made through GitHub’s web interface. Signing off is a way for contributors to affirm that their commit complies with the repository’s terms, commonly the':
      '启用此设置后，贡献者须签署其通过 GitHub 网页界面所做的提交。签署是贡献者确认其提交符合存储库条款的一种方式，通常为',
    'Learn more about signing off on commits.': '了解提交签署。',
    'This setting is enabled on the upstream repository. Disabling this setting may block commits from being merged upstream.':
      '上游存储库已启用此设置。禁用此设置可能导致提交无法合并到上游。',
    'Allow comments on individual commits': '允许对单个提交发表评论',
    'Enabling this setting will allow anyone who can view this repository to add': '启用此设置将允许任何能查看此存储库的人添加',
    '. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '。现有的提交评论不受此设置影响，仍可查看、编辑和删除。',

    // 默认分支
    'The default branch is considered the “base” branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch.':
      '默认分支是存储库中的“基础”分支，除非另行指定，所有拉取请求和代码提交都会自动以它为目标。',
    'The default branch is considered the "base" branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch.':
      '默认分支是存储库中的“基础”分支，除非另行指定，所有拉取请求和代码提交都会自动以它为目标。',

    // 发行版
    'Enable release immutability': '启用不可变发行版',
    'Immutable releases': '不可变发行版',
    'Disallow assets and tags from being modified once a release is published.': '发行版发布后，禁止修改其资产和标签。',

    // 社交预览
    'Social preview': '社交预览',
    'Upload an image to customize your repository’s social media preview.': '上传图片，自定义存储库在社交媒体上的预览。',
    "Upload an image to customize your repository's social media preview.": '上传图片，自定义存储库在社交媒体上的预览。',
    'Images should be at least 640×320px (1280×640px for best display).': '图片尺寸至少为 640×320 像素（1280×640 像素显示效果最佳）。',
    'Download template': '下载模板',
    'Upload an image…': '上传图片…',
    'Upload an image...': '上传图片...',
    'Remove image': '删除图片',
    'You can upload a social image, but it will not be visible publicly while': '你可以上传社交图片，但它不会公开显示，因为',

    // 功能：Wiki
    'Wikis host documentation for your repository.': 'Wiki 用于托管存储库的文档。',
    'Restrict editing to collaborators only': '仅允许协作者编辑',
    'Restrict editing to users in teams with push access only': '仅允许拥有推送权限的团队中的用户编辑',
    'Public wikis will still be readable by everyone.': '所有人仍可阅读公共 Wiki。',
    'Upgrade or make this repository public to enable Wikis': '升级或将此存储库设为公共以启用 Wiki',
    'GitHub Wikis is a simple way to let others contribute content. Any GitHub user can create and edit pages to use for documentation, examples, support, or anything you wish.':
      'GitHub Wiki 让他人可以轻松贡献内容。任何 GitHub 用户都可以创建和编辑页面，用于文档、示例、支持或任何用途。',
    'Learn more about wikis': '了解 Wiki',

    // 功能：议题
    'Issues integrate lightweight task tracking into your repository. Keep projects on track with issue labels and milestones, and reference them in commit messages.':
      '议题为存储库提供轻量级的任务跟踪。使用议题标签和里程碑推进项目，并可在提交消息中引用议题。',
    'Issue permissions': '议题权限',
    'Anyone can create an issue': '任何人都可以创建议题',
    'Only collaborators can create issues': '仅协作者可以创建议题',
    'If restricted, issues will still be readable by everyone who can see this repository.':
      '即使设置了限制，所有能看到此存储库的人仍可阅读议题。',
    'Get organized with issue templates': '使用议题模板整理议题',
    'Give contributors issue templates that help you cut through the noise and help them push your project forward.':
      '为贡献者提供议题模板，帮你过滤干扰，也帮他们推动项目前进。',
    'Set up templates': '设置模板',
    // 保存议题模板后的提示横幅
    'Updated issue templates for this repository': '已更新此存储库的议题模板',

    // 功能：复刻
    'Allow forking': '允许复刻',
    'If disabled, existing forks will be unaffected.': '禁用后，现有复刻不受影响。',

    // 功能：赞助
    'Sponsorships help your community know how to financially support this repository.': '赞助可让社区了解如何为此存储库提供资金支持。',
    'Display a "Sponsor" button': '显示“赞助”按钮',
    'Display a “Sponsor” button': '显示“赞助”按钮',
    'Add links to GitHub Sponsors or third-party methods your repository accepts for financial contributions to your project.':
      '添加 GitHub 赞助或第三方收款渠道的链接，接受对项目的资金捐助。',
    'Set up sponsor button': '设置赞助按钮',
    'Edit funding links': '编辑赞助链接',
    'Override funding links': '覆盖赞助链接',

    // 功能：存档计划
    'Preserve this repository': '保留此存储库',
    'Include this code in the': '将此代码纳入',
    'GitHub Archive Program': 'GitHub 存档计划',

    // 功能：目录
    'Autogenerate table of contents for markdown files in this repository. the table of contents will be displayed near the top of the file.':
      '为此存储库中的 Markdown 文件自动生成目录，目录将显示在文件顶部附近。',
    'Autogenerate table of contents for markdown files in this repository. The table of contents will be displayed near the top of the file.':
      '为此存储库中的 Markdown 文件自动生成目录，目录将显示在文件顶部附近。',

    // 功能：讨论
    'Discussions is the space for your community to have conversations, ask questions and post answers without opening issues.':
      '讨论是社区交流、提问和解答的空间，无需打开议题。',
    'Get started with Discussions': '开始使用讨论',
    'Engage your community by having discussions right in your repository, where your community already lives':
      '直接在社区所在的存储库中开展讨论，与社区互动',
    'Set up discussions': '设置讨论',

    // 功能：项目
    "Projects on GitHub are created at the repository owner's level (organization or user) and can be linked to a repository's Projects tab. Projects are suitable for cross-repository development efforts such as feature work, complex product roadmaps or even Issue triage.":
      'GitHub 上的项目在存储库所有者（组织或用户）层级创建，可以链接到存储库的项目标签页。项目适用于跨存储库的开发工作，例如功能开发、复杂的产品路线图，甚至议题分类。',
    'Projects on GitHub are created at the repository owner’s level (organization or user) and can be linked to a repository’s Projects tab. Projects are suitable for cross-repository development efforts such as feature work, complex product roadmaps or even Issue triage.':
      'GitHub 上的项目在存储库所有者（组织或用户）层级创建，可以链接到存储库的项目标签页。项目适用于跨存储库的开发工作，例如功能开发、复杂的产品路线图，甚至议题分类。',

    // 功能：拉取请求
    'Pull requests allow others to suggest changes to your repository.': '拉取请求可让他人向你的存储库提议更改。',
    'Pull request permissions': '拉取请求权限',
    'Creation allowed by:': '允许创建的用户：',
    'Anyone can create a pull request': '任何人都可以创建拉取请求',
    'Collaborators only': '仅协作者',
    'Only collaborators can create PRs': '仅协作者可以创建 PR',
    'If restricted, pull requests will still be readable by everyone who can see this repository.':
      '即使设置了限制，所有能看到此存储库的人仍可阅读拉取请求。',

    // 拉取请求合并设置
    'When merging pull requests, you can allow any combination of merge commits, squashing, or rebasing. At least one option must be enabled. If you have linear history requirement enabled on any protected branch, you must enable squashing or rebasing.':
      '合并拉取请求时，可以允许合并提交、压缩或变基的任意组合，但至少须启用一项。如果任何受保护分支要求线性历史记录，则必须启用压缩或变基。',
    'You must select at least one option': '至少须选择一项',
    'You must select squashing or rebasing option. This is because linear history is required on at least one protected branch.':
      '必须选择压缩或变基。这是因为至少有一个受保护分支要求线性历史记录。',
    'Allow merge commits': '允许合并提交',
    'Add all commits from the head branch to the base branch with a merge commit.': '通过合并提交将头部分支的所有提交添加到基础分支。',
    'Default commit message': '默认提交消息',
    'Presented when merging a pull request with merge.': '以合并方式合并拉取请求时显示。',
    'Default message': '默认消息',
    'Pull request title and commit details': '拉取请求标题和提交详细信息',
    'Pull request title and description': '拉取请求标题和描述',
    'Allow squash merging': '允许压缩合并',
    'Combine all commits from the head branch into a single commit in the base branch.': '将头部分支的所有提交压缩为基础分支中的一个提交。',
    'Presented when merging a pull request with squash.': '以压缩方式合并拉取请求时显示。',
    'Default to pull request title and commit details': '默认使用拉取请求标题和提交详细信息',
    'Default to PR title for squash merge commits': '压缩合并提交默认使用 PR 标题',
    'This will pre-populate the commit message with the PR title when performing a squash merge.':
      '执行压缩合并时，会用 PR 标题预填提交消息。',
    'Allow rebase merging': '允许变基合并',
    'Add all commits from the head branch onto the base branch individually.': '将头部分支的所有提交逐个添加到基础分支。',
    'Control how and when users are prompted to update their branches if there are new changes available in the base branch.':
      '控制基础分支有新更改时，以何种方式、在何时提示用户更新其分支。',
    'Always suggest updating pull request branches': '始终建议更新拉取请求分支',
    'Whenever there are new changes available in the base branch, present an “update branch” option in the pull request.':
      '基础分支有新更改时，在拉取请求中显示“更新分支”选项。',
    'Whenever there are new changes available in the base branch, present an "update branch" option in the pull request.':
      '基础分支有新更改时，在拉取请求中显示“更新分支”选项。',
    'You can allow setting pull requests to merge automatically once all required reviews and status checks have passed.':
      '可以允许将拉取请求设为在所有必需的审查和状态检查通过后自动合并。',
    'Allow auto-merge': '允许自动合并',
    'Waits for merge requirements to be met and then merges automatically.': '等待满足合并要求后自动合并。',
    'Learn more about auto-merge': '了解自动合并',
    'After pull requests are merged, you can have head branches deleted automatically.': '拉取请求合并后，可以自动删除头部分支。',
    'Automatically delete head branches': '自动删除头部分支',
    'Deleted branches will still be able to be restored.': '已删除的分支仍可恢复。',

    // 存档（源代码存档中的 Git LFS）
    'When creating source code archives, you can choose to include files stored using Git LFS in the archive.':
      '创建源代码存档时，可以选择在存档中包含使用 Git LFS 存储的文件。',
    'Include Git LFS objects in archives': '在存档中包含 Git LFS 对象',
    'Git LFS usage in archives is billed at the same rate as usage with the client.':
      '存档中的 Git LFS 使用量与客户端使用量按相同费率计费。',

    // 推送
    'Limit how many branches and tags can be updated in a single push': '限制单次推送可更新的分支和标签数量',
    'Pushes will be rejected if they attempt to update more than this.': '尝试更新的数量超过此值时，推送将被拒绝。',
    'Learn more about this setting': '了解此设置',
    ', and send us your': '，并向我们发送',
    'branches and tags can be updated in a push': '个分支和标签可在一次推送中更新',
    'Must be a whole number between 2 and 1000': '必须是 2 到 1000 之间的整数',

    // 议题自动关闭
    'After merging a pull request, linked issues can be closed automatically.': '合并拉取请求后，可以自动关闭链接的议题。',
    'Auto-close issues with merged linked pull requests': '链接的拉取请求合并后自动关闭议题',
    'Whenever linked pull requests have merged, auto-close the issue.': '链接的拉取请求合并后，自动关闭议题。',

    // 默认分支：重命名对话框
    'Most projects name the default branch': '大多数项目将默认分支命名为',
    'Your branch name will be': '你的分支名称将为',
    'pull request targeting this branch.': '个以此分支为目标的拉取请求。',
    'pull requests targeting this branch.': '个以此分支为目标的拉取请求。',
    'branch protection rule that explicitly targets': '条明确针对以下分支的分支保护规则',
    'branch protection rules that explicitly target': '条明确针对以下分支的分支保护规则',
    'open pull request for this branch.': '个来自此分支的打开的拉取请求。',
    'open pull requests for this branch.': '个来自此分支的打开的拉取请求。',
    'Will unpublish current GitHub Pages site.': '将取消发布当前的 GitHub 页面站点。',
    'Your current GitHub Pages site will become unpublished. A new commit on the renamed branch will publish the GitHub Pages site again.':
      '当前的 GitHub 页面站点将被取消发布。在重命名后的分支上提交新内容即可重新发布。',
    "Renaming this branch will not update your members' local environments.": '重命名此分支不会更新成员的本地环境。',
    'Renaming this branch will not update your members’ local environments.': '重命名此分支不会更新成员的本地环境。',

    // 默认分支：切换对话框
    'Switch default branch to another branch': '将默认分支切换为其他分支',
    'Choose another branch to use as the default branch of': '选择另一个分支作为以下存储库的默认分支',
    'Switch default branch': '切换默认分支',
    'Update default branch': '更新默认分支',
    'Changing your default branch': '更改默认分支',
    'can have unintended consequences that can affect new pull requests and clones.': '可能产生意外后果，影响新的拉取请求和克隆。',
    'I understand, update the default branch.': '我已了解，更新默认分支。'
  },
  scoped: {
    'Repository name': '存储库名称',
    'Repository Name': '存储库名称',
    'Renaming…': '重命名中…',
    'Renaming...': '重命名中...',
    'The repository': '存储库',
    'is available.': '可用。',
    'commit comments': '提交评论',
    'Default branch': '默认分支',
    'Switch to another branch': '切换到其他分支',
    'to:': '为：',
    'Will update': '将更新',
    'Will close': '将关闭',
    'is already the branch name.': '已是当前分支名称。',
    'instead of': '以替代',
    'Filter branches': '筛选分支',
    default: '默认',
    'Uploading...': '上传中...',
    'Uploading…': '上传中…',
    Releases: '发行版',
    'is private.': '为专用存储库。',
    Sponsorships: '赞助',
    'Table of contents': '目录',
    'Pull Requests': '拉取请求',
    'Pull request title': '拉取请求标题',
    Archives: '存档',
    Pushes: '推送',
    'Up to': '最多',
    feedback: '反馈'
  },
  regexp: [
    // 存储库名称可用性
    [new RegExp(`^${NAME} is available\\.$`), '$1 可用。'],
    [
      new RegExp(`^The repository ${NAME} already exists on this account(\\.?)$`),
      (_, name: string, dot: string) => `存储库 ${name} 已存在于此帐户中${dot ? '。' : ''}`
    ],
    // 默认分支：重命名对话框（片段被 <code> 隔开时由 static 分别匹配）
    [new RegExp(`^Rename ${BRANCH} to:$`), '将 $1 重命名为：'],
    [new RegExp(`^${BRANCH} is already the branch name\\.$`), '$1 已是当前分支名称。'],
    [/^Will update (\d+) pull requests? targeting this branch\.$/, '将更新 $1 个以此分支为目标的拉取请求。'],
    [
      new RegExp(`^Will update (\\d+) branch protection rules? that explicitly targets? (\\S+?)(\\.?)$`),
      (_, count: string, branch: string, dot: string) => `将更新 ${count} 条明确针对 ${branch} 的分支保护规则${dot ? '。' : ''}`
    ],
    [/^Will close (\d+) open pull requests? for this branch\.$/, '将关闭 $1 个来自此分支的打开的拉取请求。'],
    // 默认分支：切换对话框
    [
      new RegExp(`^Choose another branch to use as the default branch of ${NAME}(?:/${NAME})? instead of ${BRANCH}$`),
      (_, owner: string, repo: string, branch: string) =>
        `选择另一个分支替代 ${branch} 作为 ${repo ? `${owner}/${repo}` : owner} 的默认分支`
    ],
    [new RegExp(`^Default branch (?:changed|updated) to ${BRANCH}$`), '默认分支已更改为 $1'],
    // 社交预览（专用存储库、删除确认）
    [
      new RegExp(`^You can upload a social image, but it will not be visible publicly while ${NAME}(?:/${NAME})? is private\\.$`),
      (_, owner: string, repo: string) => `你可以上传社交图片，但 ${repo ? `${owner}/${repo}` : owner} 为专用存储库，图片不会公开显示。`
    ],
    [new RegExp(`^Are you sure you want to remove ${NAME}/${NAME}[’']s promotional image\\?$`), '确定要删除 $1/$2 的推广图片吗？']
  ]
} satisfies PageDictionary
