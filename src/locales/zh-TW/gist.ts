import type { PageDictionary } from '../../core/types'
import { formatClock } from './common-ui/time'
import { DATE_SOURCE, joinCjk, translateTime } from './helpers'

/** 空列表里的程式码片段类别 */
const GIST_KIND: Readonly<Record<string, string>> = {
  public: '公開',
  secret: '祕密',
  starred: '已加星號的',
  forked: '分叉的'
}

/** 12 小时制时刻按繁体 Intl 写法：02:10AM → 上午 2:10，12:46AM → 上午 12:46，04:55PM → 下午 4:55 */
function clockOf(clock: string): string {
  const match = /^(\d{1,2}):(\d{2})([AP])M$/.exec(clock)
  return match ? formatClock(match[1]!, match[2]!, `${match[3]!}M`) : clock
}

function emptyGists(owner: string, kind: string | undefined): string {
  const label = kind ? (GIST_KIND[kind.trim()] ?? '') : ''
  return `${owner}還沒有任何${label}程式碼片段。`
}

/** 个人档案侧栏本地时间差：「15h」「5.5h」「5h30m」「30m」→ 15 小時、5.5 小時、5 小時 30 分鐘、30 分鐘 */
function formatOffset(offset: string): string {
  const hours = /(\d+(?:\.\d+)?)h/.exec(offset)?.[1]
  const minutes = /(\d+)m/.exec(offset)?.[1]
  return [hours && `${hours} 小時`, minutes && `${minutes} 分鐘`].filter(Boolean).join(' ')
}

/**
 * gist.github.com 全部界面：头部与用户选单、探索页与用户列表（排序、分页、计数、个人档案侧栏）、
 * 新增与编辑表单、程式码片段详情（星号、分叉、内嵌与复制、文件区、留言入口）、修订版本、加星号的使用者、分叉列表、搜索。
 * 留言编辑器、表情回应、分页、复制按钮等通用界面由 common 负责。
 * clone 照术语表作「複製」，单独出现的选项补宾语「儲存庫」，避免读成 copy。
 */
export default {
  static: {
    // 头部与用户选单
    'Instantly share code, notes, and snippets.': '即時分享程式碼、筆記和程式碼片段。',
    'Gist Homepage': '程式碼片段首頁',
    'Search Gists': '搜尋程式碼片段',
    'All gists': '所有程式碼片段',
    'All Gists': '所有程式碼片段',
    'Back to GitHub': '返回 GitHub',
    'Sign in or sign up': '登入或註冊',
    'View profile and more': '查看個人檔案和更多內容',
    'Starred gists': '已加星號的程式碼片段',
    'Your GitHub profile': '你的 GitHub 個人檔案',
    'Create new gist': '建立新程式碼片段',
    'Create a new gist': '建立新程式碼片段',
    'Create a new Gist': '建立新程式碼片段',

    // 探索页与用户程式码片段列表
    'Discover gists': '探索程式碼片段',
    'Gist tab': '程式碼片段分頁',
    'View GitHub Profile': '查看 GitHub 個人檔案',
    'Your public gists will show up here on your profile.': '你的公開程式碼片段會顯示在個人檔案的這個位置。',
    'Create a gist': '建立程式碼片段',

    // 新增与编辑：建立按钮与类型下拉式选单
    'Create gist': '建立程式碼片段',
    'Select a type of Gist': '選擇程式碼片段類型',

    // 新增与编辑
    'Gist description': '程式碼片段描述',
    'Gist description…': '程式碼片段描述…',
    'Gist description...': '程式碼片段描述...',
    'Filename including extension': '含副檔名的檔案名稱',
    'Filename including extension…': '含副檔名的檔案名稱…',
    'Filename including extension...': '含副檔名的檔案名稱...',
    'Create secret gist': '建立祕密程式碼片段',
    'Create public gist': '建立公開程式碼片段',
    'Secret gists are hidden by search engines but visible to anyone you give the URL to.':
      '祕密程式碼片段不會出現在搜尋引擎中，但只要你提供 URL，任何人都能查看。',
    'Public gists are visible to everyone.': '所有人都能查看公開程式碼片段。',
    'Drop one or more files here to prefill your gist!': '將一個或多個檔案拖放到這裡，預先填入你的程式碼片段！',
    'Contents can’t be empty': '內容不可空白',
    "Contents can't be empty": '內容不可空白',
    'Make secret': '設為祕密',
    'Make public': '設為公開',
    'Update secret gist': '更新祕密程式碼片段',
    'Update public gist': '更新公開程式碼片段',

    // 程式码片段详情：头部动作
    'Show Gist options': '顯示程式碼片段選項',
    'Only those with the link can see this gist.': '只有知道連結的人才能查看此程式碼片段。',
    'Are you positive you want to delete this Gist?': '確定要刪除此程式碼片段嗎？',
    'Gist deleted successfully.': '已成功刪除程式碼片段。',
    'You must be signed in to star a gist': '必須登入才能為程式碼片段加星號',
    'You must be signed in to fork a gist': '必須登入才能分叉程式碼片段',
    'Star this gist': '為此程式碼片段加星號',
    'Unstar this gist': '移除此程式碼片段的星號',
    'Fork this gist': '分叉此程式碼片段',
    'You are the owner of the gist.': '你是此程式碼片段的擁有者。',
    'You are the author of this gist.': '你是此程式碼片段的作者。',
    'Comments are disabled for this gist.': '此程式碼片段已停用留言。',

    // 内嵌与复制
    'Embed this gist in your website.': '將此程式碼片段內嵌到你的網站。',
    'Copy sharable link for this gist.': '複製此程式碼片段的分享連結。',
    'Clone via HTTPS': '透過 HTTPS 複製儲存庫',
    'Clone via SSH': '透過 SSH 複製儲存庫',
    // passphrase 取微软繁中的「複雜密碼」
    'Clone with an SSH key and passphrase from your GitHub settings.': '使用 GitHub 設定中的 SSH 金鑰和複雜密碼複製儲存庫。',

    // 加星号的使用者与分叉
    'Be the first to star this gist.': '成為第一個為此程式碼片段加星號的人。',
    'Learn more about starring Gists': '瞭解為程式碼片段加星號',
    'Be the first to fork this gist.': '成為第一個分叉此程式碼片段的人。',
    'Learn more about forking Gists': '瞭解分叉程式碼片段',

    // 搜索
    'For an advanced search, use some of our prefixes.': '如需進階搜尋，可使用我們提供的前置詞。',
    'Gist search cheat sheet': '程式碼片段搜尋速查表'
  },
  scoped: {
    // 头部与用户选单
    'View your profile': '查看你的個人檔案',
    'View your gists': '查看你的程式碼片段',
    'See all of your gists': '查看你的所有程式碼片段',
    // 搜索建议的分组名
    Yours: '你的',
    // 键盘快速键对话框（gist 版文案没有连字符；与 common/dialogs.ts 的 Site-wide shortcuts 同译）
    'Site wide shortcuts': '全站快速鍵',
    'Go to Revisions': '前往修訂版本',

    // 分页、排序与筛选
    Forked: '已分叉',
    Secret: '祕密',
    'Sort:': '排序：',
    'Type:': '類型：',
    'Recently created': '最近建立',
    'Least recently created': '最早建立',
    'Best match': '最相符',
    'Most stars': '最多星號',
    'Fewest stars': '最少星號',
    'Most forks': '最多分叉',
    'Fewest forks': '最少分叉',
    Any: '不限',

    // 列表项与详情头部（后接 <relative-time> 或链接）
    Created: '建立於',
    'Last active': '上次活動於',

    // 详情页动作
    'User actions': '使用者動作',
    // 个人档案侧栏的社群帐号图示
    'Social account': '社群帳號',
    'Disable comments': '停用留言',
    'Enable comments': '啟用留言',
    'Comments have been disabled.': '已停用留言。',
    'Comments have been enabled.': '已啟用留言。',
    Embed: '內嵌',
    // 旧版分享选单标题
    'What would you like to do?': '你想要做什麼？',
    'Select an option options': '選項清單',
    'Learn more about clone URLs': '瞭解複製用 URL',
    Revisions: '修訂版本',
    Stargazers: '加星號的使用者',
    Raw: '原始檔',

    // 文件区
    'Search this file…': '搜尋此檔案…',
    'Display the source blob': '顯示檔案原始碼',
    'Display the rendered blob': '顯示轉譯後的檔案',
    'Reload?': '重新載入？',
    'Sorry, we cannot display this file.': '抱歉，無法顯示此檔案。',
    'Sorry, this file is invalid so it cannot be displayed.': '抱歉，此檔案無效，因此無法顯示。',

    // 新增与编辑：编辑页头部（Editing <gist 名称>）与文件编辑器
    Editing: '正在編輯',
    Spaces: '空格',
    Tabs: '定位字元',
    'Add file': '新增檔案',
    'Remove file': '移除檔案',
    'Remove File': '移除檔案',
    'Edit file': '編輯檔案',
    'Edit new file': '編輯新檔案',
    'Enter file contents here': '在此輸入檔案內容',
    'Preview changes': '預覽變更',
    'No changes to display.': '沒有可顯示的變更。',
    'Commit email:': '提交電子郵件：',
    // 编辑器读屏提示：Use <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>m</kbd> to toggle the <kbd>tab</kbd> key moving focus.
    Use: '使用',
    'key moving focus.': '鍵是否移動焦點。',
    // 第二句（Alternatively, use <kbd>esc</kbd> then <kbd>tab</kbd> to move …）与 to toggle the 由 code 词典收录
    'Search:': '搜尋：',
    // regexp 取微软繁中的「規則運算式」；不用「進行…搜尋」的说法
    '(Use /re/ syntax for regexp search)': '（使用 /re/ 語法以規則運算式搜尋）',

    // 留言：作者标签与未登录时的留言入口（被链接拆开时的片段由 common-ui 收录）
    'This user is the author of this .': '此使用者是此程式碼片段的作者。',
    'You are the author of this .': '你是此程式碼片段的作者。',
    'Load earlier comments...': '載入較早的留言...',
    'Load earlier comments…': '載入較早的留言…',
    'Sign up for free to join this conversation on GitHub. Already have an account? Sign in to comment':
      '免費註冊以加入 GitHub 上的此對話。已有帳號？登入後留言',

    // 修订版本：<strong>user revised</strong> this gist <relative-time>（「於」接时间元素：修訂此程式碼片段於 3 天前）
    Split: '分割',
    Unified: '統一',
    revised: '修訂',
    created: '建立',
    renamed: '重新命名',
    'this gist': '此程式碼片段於',
    with: '包含',
    'Show comments': '顯示留言',
    'View file': '查看檔案',
    'No changes.': '沒有變更。',

    // 分叉列表
    Modified: '已修改',
    'View fork': '查看分叉'
  },
  regexp: [
    // 列表计数（N files / forks / comments / stars）由 common-ui 收录
    // 列表项：Created <relative-time> — forked from <a>…</a>（分隔符 — 照原文保留）
    [/^— forked from$/, '— 分叉自'],
    // 留言框附件错误片段（with a GIF, … or WEBP.）由 common-ui 的全局正则翻译
    // 内嵌、复制与 GitHub Desktop（客户端名译「GitHub 桌面版」，用户决定 2026-10-27）
    [/^Save (\S+) to your computer and use it in GitHub Desktop\.$/, '將 $1 儲存到你的電腦並在 GitHub 桌面版中使用。'],
    [/^Clone this repository at (.+)$/, '使用 $1 複製此儲存庫'],
    // 文件区的无障碍名称：LICENSE content, created by octocat on 02:10AM today.
    // 日期三种写法（on June 25, 2019 / on 25 June 2019 / on June 2019）的 on 前缀由 translateTime 去掉
    [
      new RegExp(`^(.+) content, created by ([\\w-]+) on (\\d{1,2}:\\d{2}[AP]M) (today|yesterday|on ${DATE_SOURCE})\\.$`),
      (_, file, user, clock, day) => `${file} 的內容，由 ${user} ${joinCjk('於', translateTime(day))} ${clockOf(clock)} 建立。`
    ],
    // 修订版本：差异统计（与 commits、wiki 词典一致：additions / deletions → 新增 / 刪除 N 行；& 译「和」，不加原文没有的逗号）
    [/^(\d[\d,]*) changes?: (\d[\d,]*) additions? & (\d[\d,]*) deletions?$/, '$1 處變更：新增 $2 行和刪除 $3 行'],
    [/^(\d[\d,]*) changed files?$/, '$1 個變更的檔案'],
    [/^(\d[\d,]*) additions?$/, '新增 $1 行'],
    [/^(\d[\d,]*) deletions?$/, '刪除 $1 行'],
    [
      /^(\d[\d,]*) additions?, (\d[\d,]*) deletions? not shown because the diff is too large\. Please use a local Git client to view these changes\.$/,
      '新增 $1 行、刪除 $2 行未顯示，因為差異過大。請使用本機 Git 用戶端查看這些變更。'
    ],
    // 搜索（结果量词用「項」）
    [/^(\d[\d,]*) gist results?$/, '$1 項程式碼片段結果'],
    [/^We couldn[’']t find any gists matching '(.+)'$/, '找不到與「$1」相符的程式碼片段'],
    // 空列表
    [/^([\w-]+) doesn[’']t have any (public |secret |starred |forked )?gists yet\.$/, (_, owner, kind) => emptyGists(`${owner} `, kind)],
    [/^You don[’']t have any (public |secret |starred |forked )?gists yet\.$/, (_, kind) => emptyGists('你', kind)],
    // 标签页标题：octocat’s gists
    [/^([\w-]+)[’']s gists$/, '$1 的程式碼片段'],
    // 加星号的使用者列表与个人档案侧栏（加入日期与 insights/people.ts 同译：於 … 加入）
    [new RegExp(`^Joined on (${DATE_SOURCE})$`), (_, date) => `${joinCjk('於', translateTime(date))}加入`],
    [/^Works for (.+)$/, '任職於 $1'],
    [/^Is from (.+)$/, '來自 $1'],
    [/^Organization: (.+)$/, '組織：$1'],
    [/^Home location: (.+)$/, '所在地：$1'],
    [/^Email: (\S+@\S+)$/, '電子郵件：$1'],
    // 本地时间：- 7h behind / - 5h30m ahead（时与分之间不带空格；带空格的写法同样接受，同 profile/sidebar.ts）
    [
      /^- (\d+(?:\.\d+)?h(?: ?\d+m)?|\d+m) (ahead|behind)$/,
      (_, offset, direction) => `- ${direction === 'ahead' ? '快' : '慢'} ${formatOffset(offset)}`
    ]
  ],
  // 用户内容：描述、文件名、全名、公司与所在地、状态消息、搜索语言列表
  ignore: [
    '[itemprop="about"]',
    'strong[itemprop="name"]',
    '.gist-blob-name',
    '.gist-snippet-meta strong.css-truncate-target',
    '.gist-snippet-meta span.f6.color-fg-muted',
    '.file-info a.Truncate-text',
    '.Box-row > em.text-normal',
    '.Truncate > .Truncate-text[aria-hidden="true"]',
    '.user-status-message-wrapper',
    '.gistsearch-aside .filter-list'
  ]
} satisfies PageDictionary
