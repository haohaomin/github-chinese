import type { PageDictionary } from '../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from './helpers'

/** 空列表里的代码片段类别 */
const GIST_KIND: Readonly<Record<string, string>> = {
  public: '公共',
  secret: '机密',
  starred: '已加星标的',
  forked: '复刻的'
}

/** 12 小时制时刻转 24 小时制：02:10AM → 02:10，12:46AM → 00:46，04:55PM → 16:55 */
function to24Hour(clock: string): string {
  const match = /^(\d{1,2}):(\d{2})([AP])M$/.exec(clock)
  if (!match) return clock
  const hour = (Number(match[1]) % 12) + (match[3] === 'P' ? 12 : 0)
  return `${String(hour).padStart(2, '0')}:${match[2]}`
}

function emptyGists(owner: string, kind: string | undefined): string {
  const label = kind ? (GIST_KIND[kind.trim()] ?? '') : ''
  return `${owner}还没有任何${label}代码片段。`
}

/** 个人资料侧栏本地时间差：「15h」「5.5h」「5h30m」「30m」→ 15小时、5.5小时、5小时 30分钟、30分钟 */
function formatOffset(offset: string): string {
  const hours = /(\d+(?:\.\d+)?)h/.exec(offset)?.[1]
  const minutes = /(\d+)m/.exec(offset)?.[1]
  return [hours && `${hours}小时`, minutes && `${minutes}分钟`].filter(Boolean).join(' ')
}

/**
 * gist.github.com 全部界面：头部与用户菜单、发现页与用户列表（排序、标签页、计数、个人资料侧栏）、
 * 新建与编辑表单、代码片段详情（星标、复刻、嵌入与克隆、文件区、评论入口）、修订、标星者、复刻列表、搜索。
 * 评论编辑器、反应、分页、复制按钮等通用界面由 common 负责。
 */
export default {
  static: {
    // 头部与用户菜单
    'Instantly share code, notes, and snippets.': '即时分享代码、笔记和代码片段。',
    'Gist Homepage': '代码片段主页',
    'Search Gists': '搜索代码片段',
    'All gists': '全部代码片段',
    'All Gists': '全部代码片段',
    'Back to GitHub': '返回 GitHub',
    'Sign in or sign up': '登录或注册',
    'View profile and more': '查看个人资料及更多',
    'Starred gists': '已加星标的代码片段',
    'Your GitHub profile': '你的 GitHub 个人资料',
    'Create new gist': '新建代码片段',
    'Create a new gist': '新建代码片段',
    'Create a new Gist': '新建代码片段',

    // 发现页与用户代码片段列表
    'Discover gists': '发现代码片段',
    'Gist tab': '代码片段标签页',
    'View GitHub Profile': '查看 GitHub 个人资料',
    'Your public gists will show up here on your profile.': '你的公共代码片段会显示在这里。',
    'Create a gist': '创建代码片段',

    // 新建与编辑：创建按钮与类型下拉菜单
    'Create gist': '创建代码片段',
    'Select a type of Gist': '选择代码片段类型',

    // 新建与编辑
    'Gist description': '代码片段描述',
    'Gist description…': '代码片段描述…',
    'Gist description...': '代码片段描述...',
    'Filename including extension': '含扩展名的文件名',
    'Filename including extension…': '含扩展名的文件名…',
    'Filename including extension...': '含扩展名的文件名...',
    'Create secret gist': '创建机密代码片段',
    'Create public gist': '创建公共代码片段',
    'Secret gists are hidden by search engines but visible to anyone you give the URL to.':
      '机密代码片段不会被搜索引擎收录，但任何拿到 URL 的人都可以查看。',
    'Public gists are visible to everyone.': '公共代码片段对所有人可见。',
    'Drop one or more files here to prefill your gist!': '将一个或多个文件拖放到此处，预填到代码片段中！',
    'Contents can’t be empty': '内容不能为空',
    "Contents can't be empty": '内容不能为空',
    'Make secret': '设为机密',
    'Make public': '设为公共',
    'Update secret gist': '更新机密代码片段',
    'Update public gist': '更新公共代码片段',

    // 代码片段详情：头部操作
    'Show Gist options': '显示代码片段选项',
    'Only those with the link can see this gist.': '只有知道链接的人才能查看此代码片段。',
    'Are you positive you want to delete this Gist?': '确定要删除此代码片段吗？',
    'Gist deleted successfully.': '代码片段已删除。',
    'You must be signed in to star a gist': '登录后才能为代码片段加星标',
    'You must be signed in to fork a gist': '登录后才能复刻代码片段',
    'Star this gist': '为此代码片段加星标',
    'Unstar this gist': '取消此代码片段的星标',
    'Fork this gist': '复刻此代码片段',
    'You are the owner of the gist.': '你是此代码片段的所有者。',
    'You are the author of this gist.': '你是此代码片段的作者。',
    'Comments are disabled for this gist.': '此代码片段已禁用评论。',

    // 嵌入与克隆
    'Embed this gist in your website.': '将此代码片段嵌入你的网站。',
    'Copy sharable link for this gist.': '复制此代码片段的分享链接。',
    'Clone via HTTPS': '通过 HTTPS 克隆',
    'Clone via SSH': '通过 SSH 克隆',
    'Clone with an SSH key and passphrase from your GitHub settings.': '使用 GitHub 设置中的 SSH 密钥和密码短语克隆。',

    // 标星者与复刻
    'Be the first to star this gist.': '成为第一个为此代码片段加星标的人。',
    'Learn more about starring Gists': '了解为代码片段加星标',
    'Be the first to fork this gist.': '成为第一个复刻此代码片段的人。',
    'Learn more about forking Gists': '了解复刻代码片段',

    // 搜索
    'For an advanced search, use some of our prefixes.': '如需高级搜索，可使用我们提供的前缀。',
    'Gist search cheat sheet': '代码片段搜索速查表'
  },
  scoped: {
    // 头部与用户菜单
    'View your profile': '查看你的个人资料',
    'View your gists': '查看你的代码片段',
    'See all of your gists': '查看你的全部代码片段',
    // 搜索建议的分组名
    Yours: '你的',
    // 键盘快捷方式对话框（gist 版文案没有连字符）
    'Site wide shortcuts': '全站快捷方式',
    'Go to Revisions': '转到修订',

    // 标签页、排序与筛选
    Forked: '已复刻',
    Secret: '机密',
    'Sort:': '排序：',
    'Type:': '类型：',
    'Recently created': '最近创建',
    'Least recently created': '最早创建',
    'Best match': '最佳匹配',
    'Most stars': '星标最多',
    'Fewest stars': '星标最少',
    'Most forks': '复刻最多',
    'Fewest forks': '复刻最少',
    Any: '任意',

    // 列表项与详情头部（后接 <relative-time> 或链接）
    Created: '创建于',
    'Last active': '最后活跃于',

    // 详情页操作
    'User actions': '用户操作',
    // 个人资料侧栏的社交帐户图标
    'Social account': '社交帐户',
    'Disable comments': '禁用评论',
    'Enable comments': '启用评论',
    'Comments have been disabled.': '评论已禁用。',
    'Comments have been enabled.': '评论已启用。',
    Embed: '嵌入',
    // 旧版分享菜单标题
    'What would you like to do?': '你想做什么？',
    'Select an option options': '选项列表',
    'Learn more about clone URLs': '了解克隆 URL',
    Revisions: '修订',
    Stargazers: '标星者',
    Raw: '原始',

    // 文件区
    'Search this file…': '搜索此文件…',
    'Display the source blob': '显示源文件',
    'Display the rendered blob': '显示渲染视图',
    'Reload?': '重新加载？',
    'Sorry, we cannot display this file.': '抱歉，无法显示此文件。',
    'Sorry, this file is invalid so it cannot be displayed.': '抱歉，此文件无效，无法显示。',

    // 新建与编辑：编辑页头部（Editing <gist 名称>）与文件编辑器
    Editing: '正在编辑',
    Spaces: '空格',
    Tabs: '制表符',
    'Add file': '添加文件',
    'Remove file': '删除文件',
    'Remove File': '删除文件',
    'Edit file': '编辑文件',
    'Edit new file': '编辑新文件',
    'Enter file contents here': '在此输入文件内容',
    'Preview changes': '预览更改',
    'No changes to display.': '无可显示的更改。',
    'Commit email:': '提交电子邮件：',
    // 编辑器读屏提示：Use <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>m</kbd> to toggle the <kbd>tab</kbd> key moving focus.
    Use: '使用',
    'key moving focus.': '键是否移动焦点。',
    // 第二句（Alternatively, use <kbd>esc</kbd> then <kbd>tab</kbd> to move …）与 to toggle the 由 code 词典收录
    'Search:': '搜索：',
    '(Use /re/ syntax for regexp search)': '（使用 /re/ 语法进行正则搜索）',

    // 评论：作者标签与未登录时的评论入口（被链接拆开时的片段由 common-ui 收录）
    'This user is the author of this .': '此用户是此代码片段的作者。',
    'You are the author of this .': '你是此代码片段的作者。',
    'Load earlier comments...': '加载更早的评论...',
    'Load earlier comments…': '加载更早的评论…',
    'Sign up for free to join this conversation on GitHub. Already have an account? Sign in to comment':
      '免费注册以加入 GitHub 上的此对话。已有帐户？登录后评论',

    // 修订：<strong>user revised</strong> this gist <relative-time>（“于”接时间元素：修订此代码片段于 3 天前）
    Split: '拆分',
    Unified: '统一',
    revised: '修订',
    created: '创建',
    renamed: '重命名',
    'this gist': '此代码片段于',
    with: '包含',
    'Show comments': '显示评论',
    'View file': '查看文件',
    'No changes.': '无更改。',

    // 复刻列表
    Modified: '已修改',
    'View fork': '查看复刻'
  },
  regexp: [
    // 列表计数（N files / forks / comments / stars）由 common-ui 收录
    // 列表项：Created <relative-time> — forked from <a>…</a>（分隔符 — 照原文保留）
    [/^— forked from$/, '— 复刻自'],
    // 评论框附件错误片段（with a GIF, … or WEBP.）由 common-ui 的全局正则翻译
    // 嵌入、克隆与 GitHub Desktop（客户端名译“GitHub 桌面版”，用户决定 2026-10-27）
    [/^Save (\S+) to your computer and use it in GitHub Desktop\.$/, '将 $1 保存到你的计算机并在 GitHub 桌面版中使用。'],
    [/^Clone this repository at (.+)$/, '通过 $1 克隆此存储库'],
    // 文件区的无障碍名称：LICENSE content, created by octocat on 02:10AM today.
    // 日期三种写法（on June 25, 2019 / on 25 June 2019 / on June 2019）的 on 前缀由 translateTime 去掉
    [
      new RegExp(`^(.+) content, created by ([\\w-]+) on (\\d{1,2}:\\d{2}[AP]M) (today|yesterday|on ${DATE_SOURCE})\\.$`),
      (_, file, user, clock, day) => `${file} 的内容，由 ${user} ${joinCjk('于', translateTime(day))} ${to24Hour(clock)} 创建。`
    ],
    // 修订：差异统计（与 commits、wiki 词典一致：additions / deletions → 新增 / 删除 N 行；& 译“和”，不加原文没有的逗号）
    [/^(\d[\d,]*) changes?: (\d[\d,]*) additions? & (\d[\d,]*) deletions?$/, '$1 处更改：新增 $2 行和删除 $3 行'],
    [/^(\d[\d,]*) changed files?$/, '$1 个已更改的文件'],
    [/^(\d[\d,]*) additions?$/, '新增 $1 行'],
    [/^(\d[\d,]*) deletions?$/, '删除 $1 行'],
    [
      /^(\d[\d,]*) additions?, (\d[\d,]*) deletions? not shown because the diff is too large\. Please use a local Git client to view these changes\.$/,
      '新增 $1 行、删除 $2 行未显示，因为差异过大。请使用本地 Git 客户端查看这些更改。'
    ],
    // 搜索
    [/^(\d[\d,]*) gist results?$/, '$1 个代码片段结果'],
    [/^We couldn[’']t find any gists matching '(.+)'$/, '未找到与“$1”匹配的代码片段'],
    // 空列表
    [/^([\w-]+) doesn[’']t have any (public |secret |starred |forked )?gists yet\.$/, (_, owner, kind) => emptyGists(`${owner} `, kind)],
    [/^You don[’']t have any (public |secret |starred |forked )?gists yet\.$/, (_, kind) => emptyGists('你', kind)],
    // 标签页标题：octocat’s gists
    [/^([\w-]+)[’']s gists$/, '$1 的代码片段'],
    // 标星者列表与个人资料侧栏
    [new RegExp(`^Joined on (${DATE_SOURCE})$`), (_, date) => joinCjk(translateTime(date), '加入')],
    [/^Works for (.+)$/, '就职于 $1'],
    [/^Is from (.+)$/, '来自 $1'],
    [/^Organization: (.+)$/, '组织：$1'],
    [/^Home location: (.+)$/, '所在地：$1'],
    [/^Email: (\S+@\S+)$/, '电子邮件：$1'],
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
