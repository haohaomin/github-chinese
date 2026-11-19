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
 * 管理访问权限的成员类型筛选按钮「Type」不收录：与页头「Type / to search」的片段同形。
 * 术语：access → 存取 / 存取權（Manage access → 管理存取權），interact → 互動，moderation → 內容審核，
 * remove → 移除，pending invitation → 待處理的邀請，open（拉取请求状态）→ 開放中、open（动词）→ 建立；
 * 计数量词：协作者、成员、使用者是人，用「位」；团队、邀请用「個」；「團隊或成員」混指时用「個」。
 */
export default {
  static: {
    // 谁有访问权限
    'This repository is public and visible to anyone': '此儲存庫已公開且對所有人可見',
    'This repository is public and visible to anyone.': '此儲存庫已公開且對所有人可見。',
    'Only those with access to this repository can view it.': '只有具有此儲存庫存取權的人才能查看。',
    'Manage visibility': '管理可見度',
    'Direct access': '直接存取權',
    'collaborators have access to this repository. Only you can contribute to this repository.':
      '位協作者可以存取此儲存庫。只有你可以為此儲存庫做出貢獻。',
    'collaborator has access to this repository. Only you can contribute to this repository.':
      '位協作者可以存取此儲存庫。只有你可以為此儲存庫做出貢獻。',
    'Only you can contribute to this repository.': '只有你可以為此儲存庫做出貢獻。',
    'has access to this repository.': '可以存取此儲存庫。',
    'have access to this repository.': '可以存取此儲存庫。',
    'teams or members have access to this repository. Only': '個團隊或成員可以存取此儲存庫。只有',
    'can contribute to this repository.': '可以為此儲存庫做出貢獻。',
    'can access this repository.': '可以存取此儲存庫。',

    // 管理访问权限
    "You haven't invited any collaborators yet": '你尚未邀請任何協作者',
    'You haven’t invited any collaborators yet': '你尚未邀請任何協作者',
    'invite a collaborator': '邀請協作者',
    'Invite a collaborator': '邀請協作者',
    "You haven't added any teams or people yet": '你尚未新增任何團隊或人員',
    'You haven’t added any teams or people yet': '你尚未新增任何團隊或人員',
    "Organization owners can manage individual and team access to the organization's repositories. Team maintainers can also manage a team's repository access.":
      '組織擁有者可以管理個人和團隊對組織儲存庫的存取權。團隊維護者也可以管理團隊的儲存庫存取權。',
    'Organization owners can manage individual and team access to the organization’s repositories. Team maintainers can also manage a team’s repository access.':
      '組織擁有者可以管理個人和團隊對組織儲存庫的存取權。團隊維護者也可以管理團隊的儲存庫存取權。',
    'Learn more about organization access': '瞭解組織存取權',
    'Filter by member type': '依成員類型篩選',
    'Organization Members': '組織成員',
    'Outside collaborator': '外部協作者',
    'Pending Invitations': '待處理的邀請',
    'Find a collaborator...': '尋找協作者...',
    'Find people or a team…': '尋找人員或團隊…',
    'Find people or a team...': '尋找人員或團隊...',
    'Pending Invite': '待處理的邀請',
    'Pending invite': '待處理的邀請',
    'Invite expired': '邀請已過期',
    'Change role': '變更角色',
    'Remove Access': '移除存取權',
    'Remove access': '移除存取權',
    'Repository invitation URLs work for invited users only. You may only share this URL with an invited user.':
      '儲存庫邀請 URL 僅適用於受邀使用者。你只能將此 URL 分享給受邀使用者。',

    // 添加人员 / 团队对话框（加入已有集合按术语表作「加入」）
    'Add people to': '將人員加入',
    'Add teams to': '將團隊加入',
    'Search by username, full name, or email': '依使用者名稱、全名或電子郵件搜尋',
    'Search by username, full name or email': '依使用者名稱、全名或電子郵件搜尋',
    'Search by team name': '依團隊名稱搜尋',
    'Find people': '尋找人員',
    'Find a team': '尋找團隊',
    'Invite collaborator': '邀請協作者',
    'Add to repository': '加入儲存庫',
    'Select a collaborator above': '在上方選取協作者',
    'Select a member above': '在上方選取成員',
    'Select a team above': '在上方選取團隊',
    'Choose a role': '選擇角色',
    'Recommended for non-code contributors who want to view or discuss your project': '適合想要查看或討論專案的非程式碼貢獻者',
    'Recommended for contributors who need to proactively manage issues and pull requests without write access':
      '適合需要主動管理議題和拉取請求但沒有寫入權限的貢獻者',
    'Recommended for contributors who need to proactively manage issues, discussions, and pull requests without write access':
      '適合需要主動管理議題、討論和拉取請求但沒有寫入權限的貢獻者',
    'Recommended for contributors who actively push to your project': '適合積極推送到專案的貢獻者',
    'Recommended for project managers who need to manage the repository without access to sensitive or destructive actions':
      '適合需要管理儲存庫但無權執行敏感或破壞性操作的專案經理',
    'Recommended for people who need full access to the project, including sensitive and destructive actions like managing security or deleting a repository':
      '適合需要專案完整存取權的人員，包括管理安全性或刪除儲存庫等敏感和破壞性操作',

    // 删除邀请 / 成员（Remove 按术语表作「移除」）
    'Confirm you want to remove this invitation': '確認移除此邀請',
    'will no longer be invited to access the': '將不再受邀存取',
    'Confirm you want to remove this member': '確認移除此成員',
    'will no longer have direct access to this repository. However, they may still have access to this repository if they are a member of a team that is granted access.':
      '將不再擁有此儲存庫的直接存取權。不過，若對方所屬的團隊已獲得存取權，對方仍有可能存取此儲存庫。',

    // 临时交互限制（interact → 互動，与 org-settings 的互动限制句一致；原文括号外无逗号，译文不加）
    'Temporary interaction limits': '暫時互動限制',
    'Temporary interaction restrictions': '暫時互動限制',
    'Temporarily restrict which external users can interact with your repository (comment, open issues, or create pull requests) for a configurable period of time.':
      '在可設定的期間內暫時限制哪些外部使用者能與你的儲存庫互動（留言、建立議題或建立拉取請求）。',
    'This may be used to force a "cool-down" period during heated discussions or prevent unwanted interactions.':
      '可用於在激烈討論期間強制進入「冷靜期」或防止不必要的互動。',
    'This may be used to force a “cool-down” period during heated discussions or prevent unwanted interactions.':
      '可用於在激烈討論期間強制進入「冷靜期」或防止不必要的互動。',
    // 「…in your」+ 链接「account settings」+「.」：原文无逗号，改语序不加标点
    'You can restrict repository interactions across your account in your': '整個帳號的儲存庫互動限制位於',
    'Limit to existing users': '僅限現有使用者',
    'Enable interaction limit to existing users': '啟用僅限現有使用者的互動限制',
    'Limit to prior contributors': '僅限先前的貢獻者',
    'Enable interaction limit to prior contributors': '啟用僅限先前貢獻者的互動限制',
    'Users that have not previously': '從未',
    'to the default branch of this repository will be unable to interact with the repository.':
      '到此儲存庫預設分支的使用者將無法與此儲存庫互動。',
    'Users that have not previously committed to the default branch of this repository will be unable to interact with the repository.':
      '從未向此儲存庫預設分支提交過的使用者將無法與此儲存庫互動。',
    'branch of this repository will be unable to interact with the repository.': '分支的使用者將無法與此儲存庫互動。',
    'Limit to repository collaborators': '僅限儲存庫協作者',
    'Enable interaction limit to repository collaborators': '啟用僅限儲存庫協作者的互動限制',
    'Users that are not': '不是',
    'will not be able to interact with the repository.': '的使用者將無法與此儲存庫互動。',
    'of one of your repositories will not be able to interact with that repository.': '的使用者將無法與你的相應儲存庫互動。',
    'Users that are not collaborators will not be able to interact with the repository.': '不是協作者的使用者將無法與此儲存庫互動。',
    'Enable interaction limits for:': '啟用互動限制的期間：',
    // 「已儲存儲存庫…」两个「儲存」相连，改作「…設定已儲存」（同 nav.ts 的 Repository settings saved.）
    'Repository interaction limit settings saved.': '儲存庫互動限制設定已儲存。',

    // 拉取请求限制（「Pull request limits」「Count draft pull requests toward the limit」由 org-settings 收录；
    // 状态 open → 開放中，动词 open → 建立）
    'Restrict how many pull requests users without write access can have open at one time and add specific users to a bypass list. These settings stay in effect until you change them.':
      '限制沒有寫入權限的使用者同時可有多少個開放中的拉取請求，並將特定使用者加入繞過清單。這些設定在你變更之前會持續生效。',
    'Restrict how many pull requests users without write access can have open at one time and add specific users to an exemption list. These settings stay in effect until you change them.':
      '限制沒有寫入權限的使用者同時可有多少個開放中的拉取請求，並將特定使用者加入豁免清單。這些設定在你變更之前會持續生效。',
    'Currently, users without write access can open an unlimited number of pull requests.':
      '目前，沒有寫入權限的使用者可以建立不限數量的拉取請求。',
    'Currently, users without write access can have up to': '目前，沒有寫入權限的使用者同時最多可有',
    'open pull request at a time. Draft pull requests do not count toward this limit.': '個開放中的拉取請求。草稿拉取請求不計入此限制。',
    'open pull requests at a time. Draft pull requests do not count toward this limit.': '個開放中的拉取請求。草稿拉取請求不計入此限制。',
    'open pull request at a time. Draft pull requests count toward this limit.': '個開放中的拉取請求。草稿拉取請求計入此限制。',
    'open pull requests at a time. Draft pull requests count toward this limit.': '個開放中的拉取請求。草稿拉取請求計入此限制。',
    'Limit open pull requests from users without write access': '限制沒有寫入權限之使用者的開放中拉取請求數量',
    'Maximum open pull requests per user': '每位使用者的開放中拉取請求上限',
    'Enter a number from 1 to 1000': '輸入 1 到 1000 之間的數字',
    'Enter a number from 1 to 1000. Users who have more open PRs than the above limit will not be able to create new PRs.':
      '輸入 1 到 1000 之間的數字。開放中 PR 數量超過上述限制的使用者將無法建立新的 PR。',
    'Users listed here can open pull requests regardless of the configured limit.': '此處列出的使用者建立拉取請求時不受設定的限制。',
    'Add users to bypass list': '將使用者加入繞過清單',
    'No users can bypass the open pull request limit': '沒有可以繞過開放中拉取請求數量限制的使用者',

    // 代码审查限制（「Code review limit settings saved.」由 settings-developer 收录）
    'Restrict users who are permitted to approve or request changes on pull requests in this repository.':
      '限制哪些使用者可以在此儲存庫中核准拉取請求或要求變更。',
    'Limit to users explicitly granted': '僅限已明確獲得',
    'or higher access': '或更高權限的使用者',
    'Limit to users explicitly granted read or higher access': '僅限已明確獲得讀取或更高權限的使用者',
    'When enabled, only users explicitly granted access to this repository will be able to submit pull request reviews that "approve" or "request changes". All users able to submit comment pull request reviews will continue to be able to do so.':
      '啟用後，只有已明確獲得此儲存庫存取權的使用者才能送出「核准」或「要求變更」的拉取請求審查。所有能送出留言審查的使用者仍可繼續送出。',
    'When enabled, only users explicitly granted access to this repository will be able to submit pull request reviews that “approve” or “request changes”. All users able to submit comment pull request reviews will continue to be able to do so.':
      '啟用後，只有已明確獲得此儲存庫存取權的使用者才能送出「核准」或「要求變更」的拉取請求審查。所有能送出留言審查的使用者仍可繼續送出。',

    // 已检举的内容
    'Prior contributors and collaborators': '先前的貢獻者和協作者',
    // 已检举的内容页（/<owner>/<repo>/reported_content，只有 repository 作用域）；原文拼写 distruptive 照录
    'Users can report abusive or distruptive content for review and moderation.': '使用者可以檢舉濫用或干擾性內容以供審查和內容審核。',
    'Learn more about reported content': '瞭解已檢舉的內容',
    'Report content setting': '檢舉內容設定',
    'Any user on GitHub is able to report content': 'GitHub 上的任何使用者都可以檢舉內容',
    'Only users who have previously contributed to the repository and collaborators will be able to report content':
      '只有先前曾為此儲存庫做出貢獻的使用者和協作者才能檢舉內容',
    'Disable content reporting': '停用內容檢舉',
    'Disable content reporting for all users': '為所有使用者停用內容檢舉',
    'Abuse reports': '濫用行為檢舉',
    'The following content has been reported by users:': '使用者檢舉了以下內容：',
    'Reported Content': '已檢舉的內容',
    "There aren't any unresolved content reports for this repository.": '此儲存庫沒有未解決的內容檢舉。',
    "There aren't any resolved content reports for this repository.": '此儲存庫沒有已解決的內容檢舉。'
  },
  scoped: {
    'Once canceled,': '取消後，',
    'Once removed,': '移除後，',
    'Who has access': '誰有存取權',
    'public repository': '公開儲存庫',
    'private repository': '私人儲存庫',
    'internal repository': '內部儲存庫',
    // 与组织角色同译（GLOSSARY.zh-TW：Base permissions → 基本權限；org-settings/roles.ts 的 Base role → 基本角色）
    'Base role': '基本角色',
    'Manage access': '管理存取權',
    'No Results': '沒有結果',
    'repository.': '儲存庫。',
    'Role:': '角色：',
    Read: '讀取',
    Triage: '分類',
    Write: '寫入',
    Maintain: '維護',
    read: '讀取',
    triage: '分類',
    write: '寫入',
    maintain: '維護',
    admin: '管理員',
    'account settings': '帳號設定',
    'organization settings': '組織設定',
    committed: '提交',
    collaborators: '協作者',
    'New users': '新使用者',
    '3 days': '3 天',
    '1 week': '1 週',
    '1 month': '1 個月',
    '6 months': '6 個月',
    'No limit': '無限制',
    'Add users': '新增使用者',
    // 添加对话框按钮的屏幕阅读器文字「Add selection」
    selection: '選取項目'
  },
  regexp: [
    // 谁有访问权限：数量与文字可能被 <strong> 拆开（片段由 static 匹配）
    [
      /^(\d+) collaborators? ha(?:s|ve) access to this repository\. Only you can contribute to this repository\.$/,
      '$1 位協作者可以存取此儲存庫。只有你可以為此儲存庫做出貢獻。'
    ],
    [/^(\d+) collaborators? ha(?:s|ve) access to this repository\.$/, '$1 位協作者可以存取此儲存庫。'],
    [
      /^(\d+) teams? or members? ha(?:s|ve) access to this repository(\.?)$/,
      (_, count: string, dot: string) => `${count} 個團隊或成員可以存取此儲存庫${dot ? '。' : ''}`
    ],
    [/^(\d+) collaborators?$/, '$1 位協作者'],
    [/^(\d+) members?$/, '$1 位成員'],
    [/^(\d+) teams?$/, '$1 個團隊'],
    [/^(\d+) users?$/, '$1 位使用者'],
    [/^(\d+) invitations?$/, '$1 個邀請'],
    [/^(\d+) members? selected(…|\.\.\.)$/, '已選取 $1 位成員$2'],
    [
      new RegExp(`^All members of ${NAME} can access this repository(\\.?)$`),
      (_, name: string, dot: string) => `${name} 的所有成員都可以存取此儲存庫${dot ? '。' : ''}`
    ],
    // 添加人员 / 团队
    [new RegExp(`^Add people to ${NAME}$`), '將人員加入 $1'],
    [new RegExp(`^Add teams to ${NAME}$`), '將團隊加入 $1'],
    [new RegExp(`^Add ${USER} to this repository$`), '將 $1 加入此儲存庫'],
    [new RegExp(`^Add (@?[\\w.-]+) to ${FULL_REPO}$`), '將 $1 加入 $2'],
    [new RegExp(`^${USER} has been added as a collaborator on the repository\\.$`), '已將 $1 新增為儲存庫協作者。'],
    // 搜索结果中的用户状态：octocat • Collaborator
    [
      new RegExp(`^${USER} • (Collaborator|Invite collaborator)$`),
      (_, user: string, state: string) => `${user} • ${state === 'Collaborator' ? '協作者' : '邀請協作者'}`
    ],
    // 对邀请的回应（接受或拒绝），不是 reply（回覆）
    [new RegExp(`^Awaiting ${USER}[’']s response$`), '等待 $1 回應'],
    // 删除邀请 / 成员
    [new RegExp(`^Cancel ${USER}[’']s invitation$`), '取消 $1 的邀請'],
    [new RegExp(`^${USER} is no longer invited to this repository\\.$`), '$1 已不再受邀加入此儲存庫。'],
    [
      new RegExp(`^Remove ${USER} from this repository(\\??)$`),
      (_, user: string, mark: string) => `從此儲存庫移除 ${user}${mark ? '？' : ''}`
    ],
    [
      new RegExp(`^Removed ${USER} as a collaborator of ([\\w.-]+/[\\w.-]+?)(\\.?)$`),
      (_, user: string, repo: string, dot: string) => `已將 ${user} 從 ${repo} 的協作者中移除${dot ? '。' : ''}`
    ],
    // 临时交互限制（后接链接「organization settings」：原文无逗号，改语序不加标点）
    [new RegExp(`^You can restrict repository interactions across the ${NAME} organization in your$`), '整個 $1 組織的儲存庫互動限制位於'],
    [
      /^to the (\S+) branch of this repository will be unable to interact with the repository\.$/,
      '到此儲存庫 $1 分支的使用者將無法與此儲存庫互動。'
    ],
    [
      /^Users that have not previously committed to the (\S+) branch of this repository will be unable to interact with the repository\.$/,
      '從未向此儲存庫 $1 分支提交過的使用者將無法與此儲存庫互動。'
    ],
    // 拉取请求限制：数量与文字被 <strong> 拆开时由 static 分别匹配
    [
      /^Currently, users without write access can have up to (\d+) open pull requests? at a time\. Draft pull requests (do not count|count) toward this limit\.$/,
      (_, count: string, rule: string) =>
        `目前，沒有寫入權限的使用者同時最多可有 ${count} 個開放中的拉取請求。草稿拉取請求${rule === 'count' ? '計入' : '不計入'}此限制。`
    ]
  ]
} satisfies PageDictionary
