import type { PageDictionary } from '../../../core/types'

const USER = '([\\w-]+)'
const NAME = '([\\w.-]+)'
const FULL_REPO = '([\\w.-]+/[\\w.-]+)'

/**
 * 存储库设置 · 访问：协作者和团队（谁有访问权限、管理访问权限、添加人员 / 团队、角色、邀请与删除），
 * 调解（临时交互限制、拉取请求限制、代码审查限制、报告的内容）。
 * 组织设置已收录的「Add people」「Add teams」「Outside Collaborators」「Find a collaborator…」
 * 「Create team」「Mixed roles」、角色说明「Read and clone repositories. …」等不再重复；
 * 「Select all」「Remove」「Collaborator」由 common-ui 收录。
 * 管理访问权限的成员类型筛选按钮「Type」放 scoped：页头搜索按钮「Type / to search」由引擎整句匹配，不受影响。
 */
export default {
  static: {
    // 谁有访问权限
    'This repository is public and visible to anyone': '此存储库为公共存储库且对所有人可见',
    'This repository is public and visible to anyone.': '此存储库为公共存储库且对所有人可见。',
    'Only those with access to this repository can view it.': '只有拥有访问权限的人才能查看此存储库。',
    'Manage visibility': '管理可见性',
    'Direct access': '直接访问',
    'collaborators have access to this repository. Only you can contribute to this repository.':
      '个协作者有权访问此存储库。只有你可以为此存储库做贡献。',
    'collaborator has access to this repository. Only you can contribute to this repository.':
      '个协作者有权访问此存储库。只有你可以为此存储库做贡献。',
    'Only you can contribute to this repository.': '只有你可以为此存储库做贡献。',
    'has access to this repository.': '有权访问此存储库。',
    'have access to this repository.': '有权访问此存储库。',
    'teams or members have access to this repository. Only': '个团队或成员有权访问此存储库。只有',
    'can contribute to this repository.': '可以为此存储库做贡献。',
    'can access this repository.': '可以访问此存储库。',
    // 「<strong>No base role set.</strong> Only <a>owners</a> …」，整句见 general.ts 的 inline
    'No base role set.': '未设置基本角色。',

    // 管理访问权限
    "You haven't invited any collaborators yet": '你尚未邀请任何协作者',
    'You haven’t invited any collaborators yet': '你尚未邀请任何协作者',
    'invite a collaborator': '邀请协作者',
    'Invite a collaborator': '邀请协作者',
    "You haven't added any teams or people yet": '你尚未添加任何团队或人员',
    'You haven’t added any teams or people yet': '你尚未添加任何团队或人员',
    "Organization owners can manage individual and team access to the organization's repositories. Team maintainers can also manage a team's repository access.":
      '组织所有者可以管理个人和团队对组织存储库的访问权限。团队维护者也可以管理团队的存储库访问权限。',
    'Organization owners can manage individual and team access to the organization’s repositories. Team maintainers can also manage a team’s repository access.':
      '组织所有者可以管理个人和团队对组织存储库的访问权限。团队维护者也可以管理团队的存储库访问权限。',
    'Learn more about organization access': '了解组织访问权限',
    'Filter by member type': '按成员类型筛选',
    'Access type': '访问类型',
    'Organization Members': '组织成员',
    'Outside collaborator': '外部协作者',
    'Pending Invitations': '待定邀请',
    'Find a collaborator...': '查找协作者...',
    'Find people or a team…': '查找人员或团队…',
    'Find people or a team...': '查找人员或团队...',
    'Pending Invite': '待定邀请',
    'Pending invite': '待定邀请',
    'Invite expired': '邀请已过期',
    'Change role': '更改角色',
    'Remove Access': '删除访问权限',
    'Remove access': '删除访问权限',
    'Repository invitation URLs work for invited users only. You may only share this URL with an invited user.':
      '存储库邀请 URL 仅对受邀用户有效，只能将此 URL 分享给受邀用户。',

    // 添加人员 / 团队对话框
    'Add people to': '添加人员到',
    'Add teams to': '添加团队到',
    'Search by username, full name, or email': '按用户名、全名或电子邮件搜索',
    'Search by username, full name or email': '按用户名、全名或电子邮件搜索',
    'Search by team name': '按团队名称搜索',
    'Find people': '查找人员',
    'Find a team': '查找团队',
    'No matching GitHub account found': '未找到匹配的 GitHub 帐户',
    'No matching team found': '未找到匹配的团队',
    'Invite collaborator': '邀请协作者',
    'Add to repository': '添加到存储库',
    'Select a collaborator above': '在上方选择协作者',
    'Select a member above': '在上方选择成员',
    'Select a team above': '在上方选择团队',
    'Choose a role': '选择角色',
    'Recommended for non-code contributors who want to view or discuss your project': '适合希望查看或讨论项目的非代码贡献者',
    'Recommended for contributors who need to proactively manage issues and pull requests without write access':
      '适合无需写入访问权限但需要主动管理议题和拉取请求的贡献者',
    'Recommended for contributors who need to proactively manage issues, discussions, and pull requests without write access':
      '适合无需写入访问权限但需要主动管理议题、讨论和拉取请求的贡献者',
    'Recommended for contributors who actively push to your project': '适合积极向项目推送代码的贡献者',
    'Recommended for project managers who need to manage the repository without access to sensitive or destructive actions':
      '适合需要管理存储库但无需执行敏感或破坏性操作的项目经理',
    'Recommended for people who need full access to the project, including sensitive and destructive actions like managing security or deleting a repository':
      '适合需要项目完全访问权限的人员，包括管理安全或删除存储库等敏感和破坏性操作',

    // 删除邀请 / 成员
    'Confirm you want to remove this invitation': '确认删除此邀请',
    'will no longer be invited to access the': '将不再受邀访问',
    'Confirm you want to remove this member': '确认删除此成员',
    'will no longer have direct access to this repository. However, they may still have access to this repository if they are a member of a team that is granted access.':
      '将不再能直接访问此存储库。不过，如果其所在团队拥有访问权限，仍可访问此存储库。',

    // 临时交互限制（interact → 交互，与 org-settings、settings-developer 的交互限制句一致；原文括号外无逗号，译文不加）
    'Temporary interaction limits': '临时交互限制',
    'Temporary interaction restrictions': '临时交互限制',
    'Temporarily restrict which external users can interact with your repository (comment, open issues, or create pull requests) for a configurable period of time.':
      '在可配置的时间段内临时限制哪些外部用户可以与你的存储库交互（评论、创建议题或创建拉取请求）。',
    'This may be used to force a "cool-down" period during heated discussions or prevent unwanted interactions.':
      '可用于在激烈讨论期间强制进入“冷静期”或防止不必要的交互。',
    'This may be used to force a “cool-down” period during heated discussions or prevent unwanted interactions.':
      '可用于在激烈讨论期间强制进入“冷静期”或防止不必要的交互。',
    'You can restrict repository interactions across your account in your': '你可以在以下位置限制整个帐户的存储库交互',
    'Limit to existing users': '限于现有用户',
    'Enable interaction limit to existing users': '对现有用户启用交互限制',
    'Limit to prior contributors': '限于之前的贡献者',
    'Enable interaction limit to prior contributors': '对之前的贡献者启用交互限制',
    'Users that have not previously': '从未',
    'to the default branch of this repository will be unable to interact with the repository.':
      '到此存储库默认分支的用户将无法与此存储库交互。',
    'Users that have not previously committed to the default branch of this repository will be unable to interact with the repository.':
      '从未向此存储库默认分支提交过的用户将无法与此存储库交互。',
    'branch of this repository will be unable to interact with the repository.': '分支的用户将无法与此存储库交互。',
    'Limit to repository collaborators': '限于存储库协作者',
    'Enable interaction limit to repository collaborators': '对存储库协作者启用交互限制',
    'Users that are not': '不是',
    'will not be able to interact with the repository.': '的用户将无法与此存储库交互。',
    'of one of your repositories will not be able to interact with that repository.': '的用户将无法与相应存储库交互。',
    'Users that are not collaborators will not be able to interact with the repository.': '不是协作者的用户将无法与此存储库交互。',
    'Enable interaction limits for:': '启用交互限制的时长：',
    'Repository interaction limit settings saved.': '存储库交互限制设置已保存。',

    // 拉取请求限制（「Pull request limits」「Count draft pull requests toward the limit」由 org-settings 收录）
    'Restrict how many pull requests users without write access can have open at one time and add specific users to a bypass list. These settings stay in effect until you change them.':
      '限制无写入访问权限的用户可同时打开的拉取请求数量，并可将特定用户添加到绕过列表。这些设置在你更改前一直有效。',
    'Restrict how many pull requests users without write access can have open at one time and add specific users to an exemption list. These settings stay in effect until you change them.':
      '限制无写入访问权限的用户可同时打开的拉取请求数量，并可将特定用户添加到豁免列表。这些设置在你更改前一直有效。',
    'Currently, users without write access can open an unlimited number of pull requests.':
      '目前，无写入访问权限的用户可以创建任意数量的拉取请求。',
    'Currently, users without write access can have up to': '目前，无写入访问权限的用户最多可同时有',
    'open pull request at a time. Draft pull requests do not count toward this limit.': '个打开的拉取请求。草稿拉取请求不计入此限制。',
    'open pull requests at a time. Draft pull requests do not count toward this limit.': '个打开的拉取请求。草稿拉取请求不计入此限制。',
    'open pull request at a time. Draft pull requests count toward this limit.': '个打开的拉取请求。草稿拉取请求计入此限制。',
    'open pull requests at a time. Draft pull requests count toward this limit.': '个打开的拉取请求。草稿拉取请求计入此限制。',
    'Limit open pull requests from users without write access': '限制无写入访问权限用户打开的拉取请求数量',
    'Maximum open pull requests per user': '每个用户打开的拉取请求数上限',
    'Enter a number from 1 to 1000': '输入 1 到 1000 之间的数字',
    'Enter a number from 1 to 1000. Users who have more open PRs than the above limit will not be able to create new PRs.':
      '输入 1 到 1000 之间的数字。打开的 PR 数超过上述限制的用户将无法创建新 PR。',
    'Users listed here can open pull requests regardless of the configured limit.': '此处列出的用户创建拉取请求时不受所配置的限制。',
    'Add users to bypass list': '将用户添加到绕过列表',
    'No users can bypass the open pull request limit': '没有可以绕过打开的拉取请求数量限制的用户',

    // 代码审查限制（「Code review limit settings saved.」由 settings-developer 收录）
    'Restrict users who are permitted to approve or request changes on pull requests in this repository.':
      '限制哪些用户可以在此存储库中批准拉取请求或请求更改。',
    'Limit to users explicitly granted': '限于明确授予',
    'or higher access': '或更高访问权限的用户',
    'Limit to users explicitly granted read or higher access': '限于明确授予读取或更高访问权限的用户',
    'When enabled, only users explicitly granted access to this repository will be able to submit pull request reviews that "approve" or "request changes". All users able to submit comment pull request reviews will continue to be able to do so.':
      '启用后，只有被明确授予此存储库访问权限的用户才能提交“批准”或“请求更改”的拉取请求审查。所有能提交评论性审查的用户仍可继续提交。',
    'When enabled, only users explicitly granted access to this repository will be able to submit pull request reviews that “approve” or “request changes”. All users able to submit comment pull request reviews will continue to be able to do so.':
      '启用后，只有被明确授予此存储库访问权限的用户才能提交“批准”或“请求更改”的拉取请求审查。所有能提交评论性审查的用户仍可继续提交。',

    // 报告的内容
    'Prior contributors and collaborators': '之前的贡献者和协作者',
    // 报告的内容页（/<owner>/<repo>/reported_content，只有 repository 作用域）；原文拼写 distruptive 照录
    'Users can report abusive or distruptive content for review and moderation.': '用户可以报告滥用或干扰性内容以供审查和调解。',
    'Learn more about reported content': '了解报告的内容',
    'Report content setting': '报告内容设置',
    'Any user on GitHub is able to report content': 'GitHub 上的任何用户都可以报告内容',
    'Only users who have previously contributed to the repository and collaborators will be able to report content':
      '只有之前为此存储库做过贡献的用户和协作者才能报告内容',
    'Disable content reporting': '禁用内容报告',
    'Disable content reporting for all users': '为所有用户禁用内容报告',
    'Abuse reports': '滥用行为报告',
    'The following content has been reported by users:': '用户报告了以下内容：',
    'Reported Content': '报告的内容',
    "There aren't any unresolved content reports for this repository.": '此存储库没有未解决的内容报告。',
    "There aren't any resolved content reports for this repository.": '此存储库没有已解决的内容报告。'
  },
  scoped: {
    'Once canceled,': '取消后，',
    'Once removed,': '删除后，',
    'Who has access': '谁有访问权限',
    'public repository': '公共存储库',
    'private repository': '专用存储库',
    'internal repository': '内部存储库',
    // 与组织角色、项目设置同译（GLOSSARY：Base permissions → 基本权限；官方正文“基本角色”）
    'Base role': '基本角色',
    'Manage access': '管理访问权限',
    'No Results': '无结果',
    'repository.': '存储库。',
    'Role:': '角色：',
    Read: '读取',
    Triage: '分类',
    Write: '写入',
    Maintain: '维护',
    read: '读取',
    triage: '分类',
    write: '写入',
    maintain: '维护',
    admin: '管理员',
    'account settings': '帐户设置',
    'organization settings': '组织设置',
    committed: '提交',
    collaborators: '协作者',
    'New users': '新用户',
    '3 days': '3 天',
    '1 week': '1 周',
    '1 month': '1 个月',
    '6 months': '6 个月',
    'No limit': '无限制',
    'Add users': '添加用户',
    // 添加对话框按钮的屏幕阅读器文字「Add selection」
    selection: '所选项',
    // 成员类型筛选按钮（「Type:」后接当前类型）
    Type: '类型',
    'Type:': '类型：'
  },
  regexp: [
    // 谁有访问权限：数量与文字可能被 <strong> 拆开（片段由 static 匹配）
    [
      /^(\d+) collaborators? ha(?:s|ve) access to this repository\. Only you can contribute to this repository\.$/,
      '$1 个协作者有权访问此存储库。只有你可以为此存储库做贡献。'
    ],
    [/^(\d+) collaborators? ha(?:s|ve) access to this repository\.$/, '$1 个协作者有权访问此存储库。'],
    [
      /^(\d+) teams? or members? ha(?:s|ve) access to this repository(\.?)$/,
      (_, count: string, dot: string) => `${count} 个团队或成员有权访问此存储库${dot ? '。' : ''}`
    ],
    [/^(\d+) collaborators?$/, '$1 个协作者'],
    [/^(\d+) members?$/, '$1 个成员'],
    [/^(\d+) teams?$/, '$1 个团队'],
    [/^(\d+) users?$/, '$1 个用户'],
    // 组织访问说明：「<strong>0 users and </strong><strong><a>0 teams</a></strong> can access …」，整句见 general.ts 的 inline
    [/^(\d+) users? and$/, '$1 个用户和'],
    [/^(\d+) invitations?$/, '$1 个邀请'],
    [/^(\d+) members? selected(…|\.\.\.)$/, '已选择 $1 个成员$2'],
    [
      new RegExp(`^All members of ${NAME} can access this repository(\\.?)$`),
      (_, name: string, dot: string) => `${name} 的所有成员都可以访问此存储库${dot ? '。' : ''}`
    ],
    // 添加人员 / 团队
    [new RegExp(`^Add people to ${NAME}$`), '添加人员到 $1'],
    [new RegExp(`^Add teams to ${NAME}$`), '添加团队到 $1'],
    [new RegExp(`^Add ${USER} to this repository$`), '将 $1 添加到此存储库'],
    [new RegExp(`^Add (@?[\\w.-]+) to ${FULL_REPO}$`), '将 $1 添加到 $2'],
    [new RegExp(`^${USER} has been added as a collaborator on the repository\\.$`), '已将 $1 添加为存储库协作者。'],
    // 搜索结果中的用户状态：octocat • Collaborator
    [
      new RegExp(`^${USER} • (Collaborator|Invite collaborator)$`),
      (_, user: string, state: string) => `${user} • ${state === 'Collaborator' ? '协作者' : '邀请协作者'}`
    ],
    [new RegExp(`^Awaiting ${USER}[’']s response$`), '等待 $1 回复'],
    // 删除邀请 / 成员
    [new RegExp(`^Cancel ${USER}[’']s invitation$`), '取消对 $1 的邀请'],
    [new RegExp(`^${USER} is no longer invited to this repository\\.$`), '$1 不再受邀访问此存储库。'],
    [
      new RegExp(`^Remove ${USER} from this repository(\\??)$`),
      (_, user: string, mark: string) => `从此存储库中删除 ${user}${mark ? '？' : ''}`
    ],
    [
      new RegExp(`^Removed ${USER} as a collaborator of ([\\w.-]+/[\\w.-]+?)(\\.?)$`),
      (_, user: string, repo: string, dot: string) => `已将 ${user} 从 ${repo} 的协作者中删除${dot ? '。' : ''}`
    ],
    // 临时交互限制
    [
      new RegExp(`^You can restrict repository interactions across the ${NAME} organization in your$`),
      '你可以在以下位置限制整个 $1 组织的存储库交互'
    ],
    [
      /^to the (\S+) branch of this repository will be unable to interact with the repository\.$/,
      '到此存储库 $1 分支的用户将无法与此存储库交互。'
    ],
    [
      /^Users that have not previously committed to the (\S+) branch of this repository will be unable to interact with the repository\.$/,
      '从未向此存储库 $1 分支提交过的用户将无法与此存储库交互。'
    ],
    // 拉取请求限制：数量与文字被 <strong> 拆开时由 static 分别匹配
    [
      /^Currently, users without write access can have up to (\d+) open pull requests? at a time\. Draft pull requests (do not count|count) toward this limit\.$/,
      (_, count: string, rule: string) =>
        `目前，无写入访问权限的用户最多可同时有 ${count} 个打开的拉取请求。草稿拉取请求${rule === 'count' ? '计入' : '不计入'}此限制。`
    ]
  ]
} satisfies PageDictionary
