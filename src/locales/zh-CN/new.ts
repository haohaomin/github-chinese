import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import plans from './new/plans'

/** 创建提示里的存储库可见性 */
const VISIBILITY: Readonly<Record<string, string>> = {
  public: '公共',
  private: '专用',
  internal: '内部'
}

/** 邀请页“所有者将能够 / 可能会看到”的语气 */
const VISIBILITY_VERB: Readonly<Record<string, string>> = {
  will: '将能够看到',
  may: '可能会看到'
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
 * 组织创建后的“开始协作”页路由未确认，相关词条仍放 static。
 * 选择计划页的比较功能表见 new/plans.ts。
 * 产品名、方案名译成中文（用户决定，2026-10-27）：计划名 Free / Team / Enterprise → 免费版 / 团队版 / 企业版（scoped），
 * GitHub Actions / Codespaces / Packages / Pages / Marketplace → GitHub 操作 / 代码空间 / 软件包 / 页面 / 市场，
 * Enterprise Cloud / Server → 企业云 / 企业服务器，Copilot Business / cloud agent / coding agent → Copilot 商业版 / 云端智能体 / 编码智能体。
 * 自造品牌词（GitHub、Copilot、Dependabot、CodeQL、Git）与技术缩写（SSO、SCIM、USD）保留。
 */
const base = {
  static: {
    // 新建存储库：页头
    'Create a new repository': '新建存储库',
    "Repositories contain a project's files and version history.": '存储库包含项目的文件和版本历史记录。',
    'Repositories contain a project’s files and version history.': '存储库包含项目的文件和版本历史记录。',
    'Have a project elsewhere?': '项目托管在别处？',
    'Import a repository': '导入存储库',
    'Import a repository.': '导入存储库。',
    "Repositories contain a project's files and version history. Have a project elsewhere? Import a repository.":
      '存储库包含项目的文件和版本历史记录。项目托管在别处？导入存储库。',
    'Repositories contain a project’s files and version history. Have a project elsewhere? Import a repository.':
      '存储库包含项目的文件和版本历史记录。项目托管在别处？导入存储库。',
    'A repository contains all project files, including the revision history.': '存储库包含项目的所有文件，包括修订历史记录。',
    'Already have a project repository elsewhere?': '项目存储库托管在别处？',
    'Required fields are marked with an asterisk (*).': '带星号 (*) 的为必填字段。',
    'Switch back to classic experience': '切换回经典体验',
    'Try the new experience': '试用新体验',
    '🎉 Try the new experience': '🎉 试用新体验',

    // 新建存储库：常规（所有者、名称与可用性）
    'Choose an owner': '选择所有者',
    'Repository owner and name': '存储库所有者和名称',
    'Great repository names are short and memorable. How about': '好的存储库名称简短易记。不妨试试',
    'Great repository names are short and memorable. Need inspiration? How about': '好的存储库名称简短易记。需要灵感？不妨试试',
    'Checking availability…': '正在检查可用性…',
    'Checking availability...': '正在检查可用性...',
    'Your new repository will be created as': '你的新存储库将创建为',
    'New repository name must not be blank': '新存储库名称不能为空',
    'New repository name must not be blank.': '新存储库名称不能为空。',
    'The repository name can only contain ASCII letters, digits, and the characters ., -, and _.':
      '存储库名称只能包含 ASCII 字母、数字以及字符 .、- 和 _。',
    'The repository name can only contain ASCII letters, digits, and the characters': '存储库名称只能包含 ASCII 字母、数字以及字符',
    'Name already exists on this account': '此帐户中已存在同名存储库',
    'Repository creation failed.': '存储库创建失败。',

    // 新建存储库：配置（可见性、模板、自述文件、.gitignore、许可证）
    'Choose visibility': '选择可见性',
    'Choose who can see and commit to this repository': '选择谁可以查看此存储库并向其提交',
    'Choose who can see and commit to this repository.': '选择谁可以查看此存储库并向其提交。',
    'Anyone on the internet can see this repository. You choose who can commit.':
      '互联网上的任何人都可以查看此存储库。你可以选择谁能提交。',
    'You choose who can see and commit to this repository.': '你可以选择谁能查看此存储库并向其提交。',
    'Enterprise members can see this repository. You choose who can commit.': '企业成员可以查看此存储库。你可以选择谁能提交。',
    'You may not create private repositories by organization policy.': '根据组织策略，你不能创建专用存储库。',
    'Start with a template': '从模板开始',
    'Templates pre-configure your repository with files.': '模板会用文件预先配置你的存储库。',
    'Repository template': '存储库模板',
    'No template': '无模板',
    'Fetching templates…': '正在获取模板…',
    'Fetching templates...': '正在获取模板...',
    'No templates available.': '没有可用的模板。',
    "Start your repository with a template repository's contents.": '使用模板存储库的内容创建存储库。',
    'Start your repository with a template repository’s contents.': '使用模板存储库的内容创建存储库。',
    'Include all branches': '包含所有分支',
    'Copy all branches from': '复制',
    'and not just the default branch.': '的所有分支，而不仅仅是默认分支。',
    'If enabled, all branches from the template repository will be included.': '启用后，将包含模板存储库中的所有分支。',
    'Create repository from template': '从模板创建存储库',
    'Add README': '添加自述文件',
    'READMEs can be used as longer descriptions.': '自述文件可用作较长的描述。',
    'About READMEs': '关于自述文件',
    'Add a README file': '添加自述文件',
    'This is where you can write a long description for your project.': '你可以在这里为项目编写详细描述。',
    'Learn more about READMEs.': '了解自述文件。',
    'Initialize this repository with:': '使用以下内容初始化此存储库：',
    'Skip this step if you’re importing an existing repository.': '如果要导入现有存储库，请跳过此步骤。',
    "Skip this step if you're importing an existing repository.": '如果要导入现有存储库，请跳过此步骤。',
    'Add .gitignore': '添加 .gitignore',
    '.gitignore tells git which files not to track.': '.gitignore 用于告诉 Git 不跟踪哪些文件。',
    'About ignoring files': '关于忽略文件',
    'Choose a .gitignore template': '选择 .gitignore 模板',
    'No .gitignore': '无 .gitignore',
    '.gitignore template:': '.gitignore 模板：',
    '.gitignore template': '.gitignore 模板',
    'Choose which files not to track from a list of templates.': '从模板列表中选择不跟踪哪些文件。',
    'Learn more about ignoring files.': '了解忽略文件。',
    'Add license': '添加许可证',
    'Licenses explain how others can use your code.': '许可证说明他人可以如何使用你的代码。',
    'About licenses': '关于许可证',
    'Choose a license': '选择许可证',
    'Search licenses': '搜索许可证',
    'No license': '无许可证',
    'License:': '许可证：',
    "A license tells others what they can and can't do with your code.": '许可证说明他人可以和不可以用你的代码做什么。',
    'A license tells others what they can and can’t do with your code.': '许可证说明他人可以和不可以用你的代码做什么。',
    'Learn more about licenses.': '了解许可证。',

    // 新建存储库：GitHub 应用（所有者名在 <strong> 中）
    'Connect GitHub Apps': '连接 GitHub 应用',
    'Connect this repository to apps': '将此存储库连接到',
    'Choose GitHub Apps': '选择 GitHub 应用',
    'Grant your Marketplace apps access to this repository': '授予你的市场应用访问此存储库的权限',

    // 新建存储库：Copilot 快速启动（链接文字“Copilot cloud agent”由 common 翻译）
    'Jumpstart your project with Copilot': '使用 Copilot 快速启动项目',
    'Jumpstart your project with Copilot (optional)': '使用 Copilot 快速启动项目（可选）',
    "what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it's ready.":
      '你想在此存储库中构建什么。创建后，Copilot 会创建一个包含生成文件（如基础应用、起始代码或你描述的其他功能）的拉取请求，并在就绪后请求你审查。',
    'what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it’s ready.':
      '你想在此存储库中构建什么。创建后，Copilot 会创建一个包含生成文件（如基础应用、起始代码或你描述的其他功能）的拉取请求，并在就绪后请求你审查。',
    "Tell Copilot cloud agent what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it's ready.":
      '告诉 Copilot 云端智能体你想在此存储库中构建什么。创建后，Copilot 会创建一个包含生成文件（如基础应用、起始代码或你描述的其他功能）的拉取请求，并在就绪后请求你审查。',
    'Tell Copilot cloud agent what you want to build in this repository. After creation, Copilot will open a pull request with generated files - such as a basic app, starter code, or other features you describe - then request your review when it’s ready.':
      '告诉 Copilot 云端智能体你想在此存储库中构建什么。创建后，Copilot 会创建一个包含生成文件（如基础应用、起始代码或你描述的其他功能）的拉取请求，并在就绪后请求你审查。',
    'About Copilot coding agent': '关于 Copilot 编码智能体',
    'About Copilot cloud agent': '关于 Copilot 云端智能体',
    'Describe what you want Copilot to build': '描述你想让 Copilot 构建的内容',

    // 新建存储库：组织必填的自定义属性
    'Required properties': '必填属性',
    'This organization requires the following custom properties': '此组织要求设置以下自定义属性',
    'Continue: Configuration': '继续：配置',

    // 新建存储库：底部提示与提交（组织名被 <strong> 拆开时，句尾 organization. 由 common 翻译）
    'Change the default name in': '更改默认名称请前往',
    'Change the default name in your settings.': '可在你的设置中更改默认名称。',
    'You are creating a public repository in your personal account.': '你正在个人帐户中创建公共存储库。',
    'You are creating a private repository in your personal account.': '你正在个人帐户中创建专用存储库。',
    'You are creating a public repository in the': '你正在创建的公共存储库将位于',
    'You are creating a private repository in the': '你正在创建的专用存储库将位于',
    'You are creating an internal repository in the': '你正在创建的内部存储库将位于',
    'Create repository': '创建存储库',
    // 三点写法 Creating repository... / Creating fork... 由 codespaces 收录
    'Creating repository…': '正在创建存储库…',

    // 新建存储库：与用户名 / .github 同名的特殊存储库（文字被 <strong> / <code> 拆开；片段不加原文没有的标点）
    'You found a secret!': '你发现了一个秘密！',
    'is a ✨': '是一个 ✨',
    '✨ repository that you can use to add a': '✨ 存储库可用于将',
    'to your GitHub profile. Make sure it’s public and initialize it with a': '添加到你的 GitHub 个人资料。请确保它是公共的，并使用',
    "to your GitHub profile. Make sure it's public and initialize it with a": '添加到你的 GitHub 个人资料。请确保它是公共的，并使用',
    "to your organization's GitHub profile. Make sure it’s public and initialize it with a":
      '添加到你组织的 GitHub 个人资料。请确保它是公共的，并使用',
    'to your organization’s GitHub profile. Make sure it’s public and initialize it with a':
      '添加到你组织的 GitHub 个人资料。请确保它是公共的，并使用',
    "to your organization's GitHub profile. Make sure it's public and initialize it with a":
      '添加到你组织的 GitHub 个人资料。请确保它是公共的，并使用',

    // 导入存储库（/new/import）
    'Import your project to GitHub': '将你的项目导入到 GitHub',
    'Import all the files, including revision history, from another version control system.':
      '从其他版本控制系统导入所有文件，包括修订历史记录。',
    'Import all the files, including the revision history, from another version control system.':
      '从其他版本控制系统导入所有文件，包括修订历史记录。',
    'Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the':
      '已于 2024年4月12日停止支持导入 Mercurial、Subversion 和 Team Foundation Version Control (TFVC) 存储库。有关详细信息，请参阅',
    'Support for importing Mercurial, Subversion and Team Foundation Version Control (TFVC) repositories ended on April 12, 2024. For more details, see the changelog.':
      '已于 2024年4月12日停止支持导入 Mercurial、Subversion 和 Team Foundation Version Control (TFVC) 存储库。有关详细信息，请参阅更新日志。',
    'Your source repository details': '源存储库详细信息',
    'The URL for your source repository': '源存储库的 URL',
    'Learn more about the types of': '了解',
    'supported VCS': '支持的 VCS 类型',
    'supported VCS.': '支持的 VCS 类型。',
    'importing git repositories': '导入 Git 存储库',
    'Please enter your credentials if required for cloning your remote repository.': '如果克隆远程存储库需要凭据，请在此输入。',
    'Your username for your source repository': '源存储库的用户名',
    'Your access token or password for your source repository': '源存储库的访问令牌或密码',
    'Your new repository details': '新存储库详细信息',
    'Begin import': '开始导入',
    'Preparing import…': '正在准备导入…',
    'Preparing import...': '正在准备导入...',
    'Importing commits and revision history to GitHub…': '正在将提交和修订历史记录导入到 GitHub…',
    'Importing commits and revision history to GitHub...': '正在将提交和修订历史记录导入到 GitHub...',
    'Your old repository’s clone URL': '旧存储库的克隆 URL',
    "Your old repository's clone URL": '旧存储库的克隆 URL',
    'Your existing repository': '你的现有存储库',

    // 导入进度（/:owner/:repo/import）
    'Your import will begin shortly…': '导入即将开始…',
    'Your import will begin shortly...': '导入即将开始...',
    'Preparing your new repository': '正在准备你的新存储库',
    'There is no need to keep this window open, we’ll email you when the import is done.':
      '无需保持此窗口打开，导入完成后我们会通过电子邮件通知你。',
    "There is no need to keep this window open, we'll email you when the import is done.":
      '无需保持此窗口打开，导入完成后我们会通过电子邮件通知你。',
    "There is no need to keep this window open. We'll email you when the import is done.":
      '无需保持此窗口打开。导入完成后我们会通过电子邮件通知你。',
    'There is no need to keep this window open. We’ll email you when the import is done.':
      '无需保持此窗口打开。导入完成后我们会通过电子邮件通知你。',
    'Detecting your project’s version control system…': '正在检测项目的版本控制系统…',
    "Detecting your project's version control system…": '正在检测项目的版本控制系统…',
    "Detecting your project's version control system...": '正在检测项目的版本控制系统...',
    'Importing commits and revision history…': '正在导入提交和修订历史记录…',
    'Importing commits and revision history...': '正在导入提交和修订历史记录...',
    'Optimizing repository and pushing commits to GitHub…': '正在优化存储库并将提交推送到 GitHub…',
    'Optimizing repository and pushing commits to GitHub...': '正在优化存储库并将提交推送到 GitHub...',
    'Importing complete! Your new repository': '导入完成！你的新存储库',
    'Cancel import': '取消导入',

    // 复刻（/:owner/:repo/fork）
    'Create a new fork': '创建新复刻',
    'is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.':
      '是存储库的副本。复刻存储库后，你可以自由地试验更改，而不会影响原始项目。',
    'A fork is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.':
      '复刻是存储库的副本。复刻存储库后，你可以自由地试验更改，而不会影响原始项目。',
    'View existing forks.': '查看现有复刻。',
    'By default, forks are named the same as their upstream repository. You can customize the name to distinguish it further.':
      '默认情况下，复刻与其上游存储库同名。你可以自定义名称以便进一步区分。',
    'You are creating a fork in your personal account.': '你正在个人帐户中创建复刻。',
    'You are creating a fork in the': '你正在创建的复刻将位于',
    'Create fork': '创建复刻',
    'Creating fork…': '正在创建复刻…',
    'No available destinations to fork this repository.': '没有可复刻此存储库的目标位置。',
    "You can't fork this repository at this time.": '你目前无法复刻此存储库。',
    'You can’t fork this repository at this time.': '你目前无法复刻此存储库。',
    '(fork already exists)': '（复刻已存在）',
    '(repository already exists)': '（存储库已存在）',
    'It should only take a few seconds.': '这只需要几秒钟。',

    // 新建组织：选择计划（/organizations/plan；卡片内容见 scoped）
    'Pick a plan for your organization': '为你的组织选择计划',
    'Pick a plan': '选择计划',
    'The basics for organizations and developers': '面向组织和开发人员的基础功能',
    'The basics for individuals and organizations': '面向个人和组织的基础功能',
    'Advanced collaboration for individuals and organizations': '面向个人和组织的高级协作',
    'Security, compliance, and flexible deployment': '安全、合规与灵活部署',
    'Create a free organization': '创建免费组织',
    'Continue with Team': '选择团队版',

    // 新建组织：组织信息（/account/organizations/new）
    'Set up your organization': '设置你的组织',
    'Tell us about your organization': '介绍一下你的组织',
    'Organization name': '组织名称',
    'This will be the name of your account on GitHub.': '这将是你在 GitHub 上的帐户名称。',
    'Your URL will be: https://github.com/': '你的 URL 将是：https://github.com/',
    'Contact email': '联系电子邮件',
    'Email is invalid': '电子邮件无效',
    'This organization belongs to:': '此组织属于：',
    'My personal account': '我的个人帐户',
    'A business or institution': '企业或机构',
    'For example: GitHub, Inc., Example Institute, American Red Cross': '例如：GitHub, Inc.、Example Institute、American Red Cross',
    'Name of business or institution this organization belongs to': '此组织所属的企业或机构名称',
    // This business or institution — not <strong>user</strong> (your personal account) — will control this organization.
    'This business or institution — not': '将由此企业或机构而不是',
    '(your personal account) — will control this organization.': '（你的个人帐户）控制此组织。',
    'Verify your account': '验证你的帐户',
    'Get GitHub Copilot Business in this organization': '在此组织中使用 GitHub Copilot 商业版',
    'See Copilot Business docs.': '查看 Copilot 商业版文档。',
    'I hereby accept the': '我特此接受',
    ". For more information about GitHub's privacy practices, see the": '。有关 GitHub 隐私做法的更多信息，请参阅',
    '. For more information about GitHub’s privacy practices, see the': '。有关 GitHub 隐私做法的更多信息，请参阅',
    'GitHub Privacy Statement': 'GitHub 隐私声明',
    'GitHub Customer Agreement': 'GitHub 客户协议',
    'on behalf of my organization and confirm that I have the authority to do so': '代表我的组织并确认我有权这样做',

    // 新建组织：邀请成员
    'Start collaborating': '开始协作',
    'Add organization members': '添加组织成员',
    'Organization members will be able to view repositories, organize into teams, review code, and tag other members using @mentions.':
      '组织成员可以查看存储库、组建团队、审查代码，以及 @提及其他成员。',
    'Learn more about permissions for organizations →': '了解组织权限 →',
    'Search by username, full name or email address': '按用户名、全名或电子邮件地址搜索',
    'Complete setup': '完成设置',
    'Skip this step': '跳过此步骤',

    // 存储库转让（/:owner/:repo/transfer）
    'Transfer repository': '转让存储库',
    'Transfer repository:': '转让存储库：',
    'Transfer this repository to another user or to an organization where you have the ability to create repositories.':
      '将此存储库转让给其他用户，或转让给你有权创建存储库的组织。',
    'To understand admin access, teams, issue assignments, and redirects after a repository is transferred, see':
      '要了解存储库转让后的管理员访问权限、团队、议题分配和重定向，请参阅',
    'Transferring a repository': '转让存储库',
    'Transferring may be delayed until the new owner approves the transfer.': '在新所有者批准之前，转让可能会延迟。',
    'that may be affected by this transfer.': '可能会受到此次转让的影响。',
    'New owner': '新所有者',
    'Select one of my organizations': '选择我的组织',
    'Specify an organization or username': '指定组织或用户名',
    'and accepts the transfer, they will lose access to private repository features:': '并接受转让，将无法再使用以下专用存储库功能：',
    'Pulse, Contributors, Community, Traffic, Commits, Code Frequency, Network,': '统计、贡献者、社区、流量、提交、代码频率、网络',
    'Multiple assignees': '多个受理人',
    'Multiple reviewers': '多个审查者',
    'Branch and tag protection rules': '分支和标签保护规则',
    'their plan before accepting the transfer to avoid losing access.': '其计划再接受转让，以免失去访问权限。',
    'Individual users, teams, and apps will be removed from the following options:': '个人用户、团队和应用将从以下选项中删除：',
    'Repository ruleset bypassers': '存储库规则集绕过者',
    'Protected branch pull request bypassers': '受保护分支的拉取请求绕过者',
    'Protected branch authorized pull request review dismissers': '受保护分支中有权消除拉取请求审查的人员',
    'Protected branch authorized pushers': '受保护分支中有权推送的人员',
    'Protected branch allowed force pushers': '受保护分支中允许强制推送的人员',
    'Warning: This is a potentially destructive action.': '警告：这是一项可能具有破坏性的操作。',
    'I understand, transfer this repository.': '我已了解，转让此存储库。',

    // 存储库协作邀请（/:owner/:repo/invitations）
    'invited you to collaborate on': '邀请你协作开发',
    'invited you to collaborate': '邀请你协作',
    'Accept invitation': '接受邀请',
    'Decline invitation': '拒绝邀请',
    'Your public profile information': '你的公开个人资料信息',
    'Country of request origin': '请求来源国家/地区',
    'Your access level for this repository': '你对此存储库的访问级别',
    'Your IP address': '你的 IP 地址',
    'Is this user sending spam or malicious content?': '此用户是否在发送垃圾信息或恶意内容？',

    // 组织邀请（/orgs/:org/invitation）
    'You’ve been invited to the': '你已受邀加入',
    "You've been invited to the": '你已受邀加入',
    'Your access level to repositories within the organization': '你对组织内存储库的访问级别',
    'of future invitations from this organization.': '此组织今后的邀请。',

    // 帐户继任邀请（/users/:user/succession/invitation）。链接文字不带句号；带句号的写法由 settings-account 收录
    'invited you to be their account successor': '邀请你成为其帐户继任者',
    'Learn more about account successors': '了解帐户继任者',
    // 句首“我同意在使用和维护其帐户内容时遵守 GitHub 的”见 regexp，链接为 Terms of Service（common 翻译）
    "and the user's written requests, if any, in my use and maintaining of their account's content.": '以及该用户的书面请求（如有）。',
    'and the user’s written requests, if any, in my use and maintaining of their account’s content.': '以及该用户的书面请求（如有）。',
    "I understand that accepting this appointment as successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will, and I agree to comply or assist with a valid request by an individual with legal authority over the user's property (such as next-of-kin, an estate's executor, and/or a beneficiary of their will).":
      '我了解，接受继任者任命并不凌驾于任何相关司法管辖区具有法律约束力的近亲规则或遗产法，也不构成有约束力的遗嘱；我同意遵守或协助对该用户财产拥有合法权力的个人（例如近亲、遗产执行人和/或其遗嘱受益人）提出的有效请求。',
    'I understand that accepting this appointment as successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will, and I agree to comply or assist with a valid request by an individual with legal authority over the user’s property (such as next-of-kin, an estate’s executor, and/or a beneficiary of their will).':
      '我了解，接受继任者任命并不凌驾于任何相关司法管辖区具有法律约束力的近亲规则或遗产法，也不构成有约束力的遗嘱；我同意遵守或协助对该用户财产拥有合法权力的个人（例如近亲、遗产执行人和/或其遗嘱受益人）提出的有效请求。',
    'This invitation has already been accepted.': '此邀请已被接受。',
    'This invitation has already been declined.': '此邀请已被拒绝。',
    'Invitation not found': '未找到邀请',
    'Your invitation could not be found, or is not valid.': '找不到你的邀请，或邀请无效。',

    // 将个人帐户的工作移至组织（/move_work/new）
    'Move your work into an organization': '将你的工作移至组织',
    'Move your work progress': '工作移动进度',
    'What do you want to move?': '要移动哪些内容？',
    'Select all repositories': '全选存储库',
    'You do not have any projects': '你没有任何项目',
    'Return to your personal profile': '返回个人资料'
  },
  scoped: {
    // 新版表单分区与字段（Owner、Visibility、Description、(required)、(optional) 由 common-ui 翻译）
    General: '常规',
    Configuration: '配置',
    'Repository name': '存储库名称',
    characters: '个字符',
    Next: '下一步',
    // 开关状态（可见性选项 Public / Private / Internal 与 None 由 common-ui 翻译）
    On: '开',
    Off: '关',
    // 选择浮层（Cancel and close、Filter… 由 common-ui 翻译）
    'Search owners': '搜索所有者',
    'Search templates': '搜索模板',
    'Search apps': '搜索应用',
    "You haven't created any items yet": '你还没有创建任何项',
    'You haven’t created any items yet': '你还没有创建任何项',
    'Please add or create new items to populate the list.': '请添加或新建项以填充列表。',
    'Change repository': '更改存储库',

    // 名称可用性：存储库名在 <strong> 中（already exists on this account 由 repo-settings 收录）
    'The repository': '存储库',
    'is available.': '可用。',
    // 默认分支提示：This will set <strong>main</strong> as the default branch. Change the default name in <a>your settings</a>.
    // 不单独收录 your、settings：与存储库名同名时会误译
    'This will set': '这会将',
    'as the default branch.': '设为默认分支。',
    'as the default branch. Change the default name in': '设为默认分支。更改默认名称请前往',
    'your settings': '你的设置',
    // 创建提示：可见性单词单独包在元素里时（You are creating a <strong>public</strong> repository in…）
    'You are creating a': '你正在创建的',
    'You are creating an': '你正在创建的',
    public: '公共',
    private: '专用',
    internal: '内部',
    'repository in your personal account.': '存储库将位于你的个人帐户。',
    'repository in the': '存储库将位于',
    // 企业名单独包在元素里时
    'enterprise members can see this repository. You choose who can commit.': '企业成员可以查看此存储库。你可以选择谁能提交。',
    // GitHub 应用：Connect this repository to apps <strong>owner</strong> is subscribed to
    'is subscribed to': '订阅的应用',
    // Copilot：Tell <a>Copilot cloud agent</a> what you want to build…
    Tell: '告诉',
    Prompt: '提示',
    // 特殊存储库：…initialize it with a <strong>README</strong> in the <code>profile</code> directory to get started.
    // → 并使用自述文件初始化 profile 目录即可开始。
    special: '特殊',
    README: '自述文件',
    'in the': '初始化',
    'directory to get started.': '目录即可开始。',
    'to get started.': '初始化即可开始。',

    // 导入：Learn more about <a>importing git repositories</a>（Learn more about 由 common-ui 翻译）
    changelog: '更新日志',
    'is ready.': '已就绪。',

    // 复刻：A <a>fork</a> is a copy of a repository…；Contribute back to <strong>owner/repo</strong> by adding your own branch.
    A: '所谓',
    fork: '复刻',
    'Contribute back to': '通过添加你自己的分支向',
    'by adding your own branch.': '回馈贡献。',
    'Copy the': '仅复制',
    'branch only': '分支',

    // 新建组织：计划卡片（与 /pricing 页卡片相同）。与 /account/upgrade 比较表相同的功能说明由 settings-account 收录（static），
    // 此处不重复；Recommended 由 common-ui、per month 与 per user/month 由 settings-account 翻译
    // 计划名译“X 版”：卡片标题、比较表列头、窄屏计划选择菜单（小写 free / team / enterprise 见 new/plans.ts）。
    // 全局 static 的 Team / Enterprise 是导航义的“团队”“企业”：/pricing 页头的 Enterprise 栏目由 inline 规则保持“企业”；
    // 页脚链接（/enterprise、/team 方案页）只有文字，无法与计划名区分，本页显示“企业版”“团队版”。
    // Free 在 common 是 Copilot 计划标签的译法，此处保留 scoped，不依赖该词条
    Free: '免费版',
    Team: '团队版',
    Enterprise: '企业版',
    'Most popular': '最受欢迎',
    // 标语被 <br> 拆成两行，片段不加原文没有的标点
    'The basics for individuals': '面向个人',
    'and organizations': '和组织的基础功能',
    'Advanced collaboration for': '高级协作',
    'individuals and organizations': '面向个人和组织',
    'Security, compliance,': '安全、合规',
    'and flexible deployment': '与灵活部署',
    forever: '永久',
    'for the first 12 months': '前 12 个月',
    'Starting at': '起价',
    'Start a free trial': '开始免费试用',
    'Contact Sales': '联系销售',
    'Show features': '显示功能',
    'Everything included in Free, plus...': '包含免费版的全部功能，另加...',
    'Everything included in Free, plus…': '包含免费版的全部功能，另加…',
    'Everything included in Team, plus...': '包含团队版的全部功能，另加...',
    'Everything included in Team, plus…': '包含团队版的全部功能，另加…',
    'Featured add-ons': '精选附加组件',
    'Exclusive add-on': '专属附加组件',
    'Unlimited public/private repositories': '不限数量的公共/专用存储库',
    'Dependabot security and version updates': 'Dependabot 安全更新和版本更新',
    'Keep projects secure by automatically opening pull requests to update vulnerable dependencies and keep them up to date.':
      '自动创建拉取请求，更新存在漏洞的依赖项并使其保持最新，确保项目安全。',
    'Use execution minutes with GitHub Actions to automate your software development workflows. Write tasks and combine them to build, test, and deploy any code project on GitHub.':
      '使用 GitHub 操作的执行分钟数自动化软件开发工作流。编写任务并加以组合，即可构建、测试和部署 GitHub 上的任何代码项目。',
    'Host your own software packages or use them as dependencies in other projects. Both private and public hosting available.':
      '托管你自己的软件包，或在其他项目中将其用作依赖项。支持专用和公共托管。',
    'Issues & Projects': '议题和项目',
    'Give your developers flexible features for project management that adapts to any team, project, and workflow — all alongside your code.':
      '为开发人员提供灵活的项目管理功能，适应任何团队、项目和工作流，且与代码紧密结合。',
    'GitHub Codespaces Access': 'GitHub 代码空间访问权限',
    With: '借助',
    ', get an instant dev environment in the cloud, so you can code anywhere on any device.':
      '，即可在云端获得即时开发环境，随时随地在任何设备上编写代码。',
    'Access to GitHub Codespaces': '可使用 GitHub 代码空间',
    'Repository rules': '存储库规则',
    'Enforce restrictions on how code branches and tags are merged across your organization, including requiring reviews by selected collaborators, or allowing only specific contributors to work on a particular branch.':
      '在整个组织中限制代码分支和标签的合并方式，包括要求指定协作者审查，或只允许特定贡献者在某个分支上工作。',
    'Assign multiple users or a team to review a pull request.': '分配多个用户或一个团队审查拉取请求。',
    'Draft pull requests': '草稿拉取请求',
    'Automatically request reviews—or require approval—by selected contributors when changes are made to sections of code that they own.':
      '指定贡献者所负责的代码部分发生更改时，自动请求其审查或要求其批准。',
    'Ensure that pull requests have a specific number of approving reviews before collaborators can make changes to a protected branch.':
      '确保拉取请求获得指定数量的批准审查后，协作者才能更改受保护分支。',
    'Pages and Wikis': '页面和 Wiki',
    'Environment deployment branches and secrets': '环境部署分支和机密',
    'GitHub Support can help you troubleshoot issues you run into while using GitHub.':
      'GitHub 支持可以帮助你排查使用 GitHub 时遇到的问题。',
    'Ensure your secrets stay secure. Mitigate risk associated with exposed secrets in your repositories, while preventing new leaks before they happen with push protection.':
      '确保机密安全。降低存储库中机密泄露的风险，并通过推送保护在新泄露发生前加以阻止。',
    'Find and fix vulnerabilities in your code before they reach production. Prioritize your Dependabot alerts with automated triage rules.':
      '在漏洞进入生产环境前发现并修复。使用自动分类规则确定 Dependabot 警报的优先级。',
    'Data residency': '数据驻留',
    'GitHub Enterprise Cloud offers a multi-tenant enterprise SaaS solution on Microsoft Azure, allowing you to choose a regional cloud deployment for data residency, so your in-scope data is stored at rest in a designated location.':
      'GitHub 企业云在 Microsoft Azure 上提供多租户企业 SaaS 解决方案，你可以选择区域云部署实现数据驻留，让范围内的静态数据存储在指定位置。',
    'today or': '或',
    'contact our sales team': '联系我们的销售团队',
    'Own and control the user accounts of your enterprise members through your identity provider (IdP).':
      '通过标识提供者 (IdP) 拥有并控制企业成员的用户帐户。',
    'User provisioning through SCIM': '通过 SCIM 预配用户',
    "Automatically invite members to join your organization when you grant access on your IdP. If you remove a member's access to your GitHub organization on your SAML IdP, the member will be automatically removed from the GitHub organization.":
      '在 IdP 上授予访问权限时，自动邀请成员加入你的组织。如果你在 SAML IdP 上删除成员对 GitHub 组织的访问权限，该成员会自动从 GitHub 组织中删除。',
    'Enterprise Account to centrally manage multiple organizations': '用企业帐户集中管理多个组织',
    'GitHub Enterprise Cloud includes the option to create an enterprise account, which enables collaboration between multiple organizations, gives administrators a single point of visibility and management and brings license cost savings for identical users in multiple organizations.':
      'GitHub 企业云支持创建企业帐户，便于多个组织协作，为管理员提供统一的查看和管理入口，并为同时属于多个组织的用户节省许可证费用。',
    'Environment protection rules': '环境保护规则',
    'Enforce branch and tag protections, as well as push rules across your enterprise. Rule insights allow you to assess impact of rules before and during enforcement.':
      '在整个企业中强制实施分支和标签保护以及推送规则。规则洞察可帮助你在强制实施前和强制实施期间评估规则的影响。',
    'Audit Log API': '审核日志 API',
    'As a GitHub Enterprise Cloud organization administrator, you can now access log events using our GraphQL API and monitor the activity in your organization.':
      '作为 GitHub 企业云组织管理员，你可以使用 GraphQL API 访问日志事件并监控组织中的活动。',
    'SOC1, SOC2, type 2 reports annually': '每年提供 SOC1、SOC2 Type 2 报告',
    'GitHub offers AICPA System and Organization Controls (SOC) 1 Type 2 and SOC 2 Type 2 reports with IAASB International Standards on Assurance Engagements, ISAE 3000, and ISAE 3402.':
      'GitHub 提供 AICPA 系统与组织控制 (SOC) 1 Type 2 和 SOC 2 Type 2 报告，符合 IAASB 国际鉴证业务准则 ISAE 3000 和 ISAE 3402。',
    'FedRAMP Tailored Authority to Operate (ATO)': 'FedRAMP Tailored 运营授权 (ATO)',
    'Government users can host projects on GitHub Enterprise Cloud with the confidence that our platform meets the low impact software-as-a-service (SaaS) baseline of security standards set by our U.S. federal government partners.':
      '政府用户可以放心地在 GitHub 企业云上托管项目：平台满足美国联邦政府合作伙伴制定的低影响级软件即服务 (SaaS) 安全标准基线。',
    'Use an identity provider to manage the identities of GitHub users and applications.': '使用标识提供者管理 GitHub 用户和应用的身份。',
    'Advanced auditing': '高级审核',
    'Quickly review the actions performed by members of your organization. Keep copies of audit log data to ensure secure IP and maintain compliance for your organization.':
      '快速查看组织成员执行的操作。保留审核日志数据副本，以保护知识产权并维持组织合规。',
    'Share features and workflows between your GitHub Enterprise Server instance and GitHub Enterprise Cloud.':
      '在 GitHub 企业服务器实例与 GitHub 企业云之间共享功能和工作流。',
    'Premium support': '高级支持',
    'With Premium, get a 30-minute SLA on Urgent tickets and 24/7 web and phone support via callback request. With Premium Plus, get everything in Premium, assigned Customer Reliability Engineer and more.':
      '高级支持提供紧急工单 30 分钟 SLA，以及全天候网页和电话回拨支持。高级增强支持包含高级支持的全部内容，另有分配的客户可靠性工程师等服务。',
    'Learn more about Premium Support': '了解高级支持',

    // 新建组织：组织信息（I.e., <strong>user</strong> (your personal account)）
    'I.e.,': '即',
    '(your personal account)': '（你的个人帐户）',

    // 存储库转让：被 <strong> / 链接拆开的片段
    'in GitHub Help.': '（GitHub 帮助）。',
    There: '当前',
    are: '有',
    is: '有',
    If: '如果',
    username: '用户名',
    'is using': '正在使用',
    'Any existing': '任何现有的',
    wikis: 'Wiki',
    'on the': '位于',
    tab: '标签页',
    PRs: '拉取请求',
    'for issues and PRs': '用于议题和拉取请求',
    'for PRs': '用于拉取请求',
    can: '可先',
    upgrade: '升级',
    // Type <strong>owner/repo</strong> to confirm.
    Type: '输入',
    'to confirm.': '以确认。',

    // 邀请页片段
    'Invited by': '邀请人',
    'organization!': '组织！',
    'Certain activity': '某些活动',
    'within this repository': '在此存储库内',
    'within this organization': '在此组织内',
    'If you have': '你的',
    'two-factor authentication': '双因素身份验证',
    'enabled or not': '启用状态',
    'Opt out': '选择退出'
  },
  regexp: [
    // 存储库名称可用性（React 拆分的名称与文字拼接后）；句号随原文
    [/^([\w.-]+) is available\.$/, '$1 可用。'],
    [
      /^The repository ([\w.-]+) already exists on this account(\.?)$/,
      (_, name, period) => `此帐户中已存在存储库 ${name}${period ? '。' : ''}`
    ],
    [/^Your new repository will be created as ([\w.-]+?)(\.?)$/, (_, name, period) => `你的新存储库将创建为 ${name}${period ? '。' : ''}`],
    [
      /^Great repository names are short and memorable\.( Need inspiration\?)? How about ([\w.-]+)\?$/,
      (_, inspiration, name) => `好的存储库名称简短易记。${inspiration ? '需要灵感？' : ''}不妨试试 ${name}？`
    ],
    // 所有者按钮与建议名称（无障碍标签）
    [/^([\w-]+), Owner \(Required\)$/, '$1，所有者（必填）'],
    [/^Use suggested repository name ([\w.-]+)$/, '使用建议的存储库名称 $1'],
    // 描述字数
    [/^(\d+) ?\/ ?(\d+) characters$/, '$1/$2 个字符'],
    // 可见性按钮（无障碍标签）
    [
      /^Choose visibility: (Public|Private|Internal)$/,
      (_, visibility) => `选择可见性：${VISIBILITY[visibility.toLowerCase()] ?? visibility}`
    ],
    // 可见性与默认分支提示
    [
      /^You are creating an? (public|private|internal) repository in the ([\w.-]+) organization\.$/,
      (_, visibility, org) => `你正在 ${org} 组织中创建${VISIBILITY[visibility] ?? visibility}存储库。`
    ],
    [
      /^(.+?) enterprise members can see this repository\. You choose who can commit\.$/,
      '$1 企业成员可以查看此存储库。你可以选择谁能提交。'
    ],
    [/^This will set (\S+) as the default branch\.$/, '这会将 $1 设为默认分支。'],
    [
      /^This will set (\S+) as the default branch\. Change the default name in your settings\.$/,
      '这会将 $1 设为默认分支。可在你的设置中更改默认名称。'
    ],
    // 模板与 GitHub 应用
    [/^Copy all branches from ([\w.-]+\/[\w.-]+) and not just the default branch\.$/, '复制 $1 的所有分支，而不仅仅是默认分支。'],
    [
      /^Connect this repository to apps ([\w.-]+) is subscribed to(\.?)$/,
      (_, owner, period) => `将此存储库连接到 ${owner} 订阅的应用${period ? '。' : ''}`
    ],
    [/^You are subscribed to (\d+) Marketplace apps?(\.?)$/, (_, count, period) => `你订阅了 ${count} 个市场应用${period ? '。' : ''}`],
    [/^(\d+) apps? selected$/, '已选择 $1 个应用'],
    [/^Auto-installed by ([\w.-]+)$/, '由 $1 自动安装'],
    // 与用户名 / .github 同名的特殊存储库（整句渲染时）
    [
      /^([\w.-]+\/[\w.-]+) is a ✨special✨ repository that you can use to add a README\.md to your GitHub profile\. Make sure it[’']s public and initialize it with a README to get started\.$/,
      '$1 是一个 ✨特殊✨ 存储库，可用于将 README.md 添加到你的 GitHub 个人资料。请确保它是公共的，并使用自述文件初始化即可开始。'
    ],
    [
      /^([\w.-]+\/\.github) is a ✨special✨ repository that you can use to add a README\.md to your organization[’']s GitHub profile\. Make sure it[’']s public and initialize it with a README in the profile directory to get started\.$/,
      '$1 是一个 ✨特殊✨ 存储库，可用于将 README.md 添加到你组织的 GitHub 个人资料。请确保它是公共的，并使用自述文件初始化 profile 目录即可开始。'
    ],
    // 复刻
    [/^Copy the (\S+) branch only$/, '仅复制 $1 分支'],
    [/^Contribute back to ([\w.-]+\/[\w.-]+) by adding your own branch\.$/, '通过添加你自己的分支向 $1 回馈贡献。'],
    [/^You are creating a fork in the ([\w.-]+) organization\.$/, '你正在 $1 组织中创建复刻。'],
    [/^Fork ([\w.-]+\/[\w.-]+)$/, '复刻 $1'],
    [/^Forking ([\w.-]+\/[\w.-]+)$/, '正在复刻 $1'],
    // 导入
    [/^Updating branches and (\d+) commit authors?(…|\.\.\.)$/, '正在更新分支和 $1 个提交作者$2'],
    [
      /^No source repositories were detected at (\S+)\. Please check the URL and try again\.$/,
      '在 $1 未检测到源存储库。请检查 URL 后重试。'
    ],
    [/^Importing complete! Your new repository ([\w.-]+\/[\w.-]+) is ready\.$/, '导入完成！你的新存储库 $1 已就绪。'],
    // 新建组织：名称校验、网址、Copilot Business 价格
    [/^The name '([^']+)' is already taken\.$/, '名称“$1”已被占用。'],
    [
      /^The name '(.+)' may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen\.$/,
      '名称“$1”只能包含字母、数字或单个连字符，且不能以连字符开头或结尾。'
    ],
    [/^Organization name '(.+)' is unavailable\.$/, '组织名称“$1”不可用。'],
    [/^Your URL will be: (https:\/\/github\.com\/\S*)$/, '你的 URL 将是：$1'],
    [/^I\.e\., ([\w-]+) \(your personal account\)$/, '即 $1（你的个人帐户）'],
    [
      /^Boost developer productivity for (\$\d+(?:\.\d+)?)\/user\/month\. Pay only for assigned seats after setup\.$/,
      '以每用户每月 $1 的价格提升开发人员效率。设置后仅为已分配的席位付费。'
    ],
    // 新建组织：计划卡片中的使用量（与 settings-account 的 500MB / 2GB 静态词条同一译法）
    [/^([\d,]+) CI\/CD minutes\/month$/, '每月 $1 分钟 CI/CD'],
    [/^(\d+(?:\.\d+)? ?[MG]B) of Packages storage$/, '$1 软件包存储'],
    [
      /^Blazing fast cloud developer environments with flexible compute and pre-configured containers, developers can code, collaborate, and debug from any browser\. Pay only for what you use with compute fees starting at (\$[\d.]+)\/hr and storage fees at (\$[\d.]+)\/GB per month\.$/,
      '极速云端开发环境，提供灵活的算力和预配置容器，开发人员可在任意浏览器中编码、协作和调试。按使用量付费，计算费用低至每小时 $1，存储费用为每月每 GB $2。'
    ],
    // 转让与邀请页
    [/^Transfer repository: ([\w.-]+\/[\w.-]+)$/, '转让存储库：$1'],
    [/^There (?:is|are) (\d+) codespaces? that may be affected by this transfer\.$/, '有 $1 个代码空间可能会受到此次转让的影响。'],
    [/^There (?:is|are)$/, '当前有'],
    [/^(\d+) codespaces?$/, '$1 个代码空间'],
    [/^Type ([\w.-]+\/[\w.-]+) to confirm\.$/, '输入 $1 以确认。'],
    [/^([\w-]+) invited you to collaborate on ([\w.-]+\/[\w.-]+)$/, '$1 邀请你协作开发 $2'],
    [/^of ([\w.-]+(?:\/[\w.-]+)?) (will|may) be able to see:$/, (_, owner, verb) => `(${owner}) ${VISIBILITY_VERB[verb] ?? verb}：`],
    [/^Block ([\w-]+)$/, '阻止 $1'],
    [/^Join ([\w.-]+)$/, '加入 $1'],
    [
      /^As an account successor, you would be able to manage ([\w-]+)[’']s repositories if they[’']re not able to\.$/,
      '作为帐户继任者，你可以在 $1 无法管理其存储库时代为管理。'
    ],
    [
      /^By clicking ["“]Accept invitation["”] below, I acknowledge that I agree to serve as the successor for ([\w-]+), in such ways authorized by their successor request\. I agree to abide by GitHub[’']s$/,
      '单击下方的“接受邀请”，即表示我同意按照 $1 的继任者请求所授权的方式担任其继任者。我同意在使用和维护其帐户内容时遵守 GitHub 的'
    ],
    // 将工作移至组织：进度
    [/^(\d+)% complete$/, '已完成 $1%']
  ],
  inline: [
    // 定价页营销页头的 Enterprise 栏目按钮：<button>Enterprise<svg/></button>（计划名元素里只有文字，不命中）。
    // 全局导航栏目仍译“企业”，不用本页 scoped 的计划名“企业版”
    ['Enterprise {}', '企业{}']
  ],
  // 将工作移至组织：页头的帐户名，勾选项的存储库名、项目名（用户内容）
  ignore: [
    'move-work-container .flex-auto > p.h3:first-child',
    'move-work-container label[for^="repository-"]',
    'move-work-container label[for^="project-"]'
  ]
} satisfies PageDictionary

export default mergeDictionaries(base, plans) satisfies PageDictionary
