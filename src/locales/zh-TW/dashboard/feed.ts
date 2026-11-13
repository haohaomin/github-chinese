import type { PageDictionary } from '../../../core/types'

/** 推荐原因：You're seeing this because you <reason> <target>；目标未拼进同一节点时只译前半句（标点随原文，不加冒号） */
function reasonText(reason: string, target: string): string {
  if (reason === 'collaborated with') return target ? `你看到此內容是因為你曾與 ${target} 協作` : '你看到此內容是因為你曾協作過'
  if (reason === 'starred') return target ? `你看到此內容是因為你為 ${target} 加了星號` : '你看到此內容是因為你加了星號'
  return target ? `你看到此內容是因為你追蹤了 ${target}` : '你看到此內容是因為你追蹤了'
}

/** “不感兴趣”菜单：I want to see fewer <kind> repositories（starred repositories → 已加星號的儲存庫，GLOSSARY.zh-TW star 行） */
const FEWER: Readonly<Record<string, string>> = {
  starred: '已加星號的',
  forked: '分叉的',
  trending: '熱門'
}

/**
 * 首页动态 /feed（新版首页的“Feed”标签页，旧版首页中部）：
 * 动态筛选对话框、加载与出错状态、欢迎提示、各类动态卡片的动作短语、条目选项菜单。
 * 动态卡片的标题句被用户名、存储库名链接拆开，动作短语单独成段翻译。
 */
export default {
  static: {
    // 筛选对话框
    'Feed filters': '動態篩選器',
    'Organization feed filters': '組織動態篩選器',
    'Activity you want to see on your feed': '你想在動態中看到的活動',
    'Special discussion posts from repositories': '儲存庫發布的特別討論貼文',
    'Update posts from repositories': '儲存庫發布的更新貼文',
    'Relevant projects or people that are being sponsored': '受贊助的相關專案或使用者',
    'Repositories being starred by people': '他人加了星號的儲存庫',
    'Repositories that are created or forked by people': '他人建立或分叉的儲存庫',
    'Repository activity': '儲存庫活動',
    'Issues and pull requests from repositories': '儲存庫中的議題和拉取請求',
    'Issues, pull requests, and contributions from repositories': '儲存庫中的議題、拉取請求和貢獻',
    'Who people are following': '他人追蹤了誰',
    'Repositories and people you may like': '你可能喜歡的儲存庫和使用者',
    'Include events from starred repositories': '包含來自已加星號儲存庫的事件',
    'By default, the feed shows events from repositories you sponsor or watch, and people you follow.':
      '預設情況下，動態會顯示來自你贊助或關注的儲存庫，以及你追蹤的使用者的事件。',
    'Reset to default': '重設為預設值',

    // 加载、出错与欢迎提示
    'One moment please...': '請稍候...',
    'Loading activity...': '正在載入活動...',
    'There was an error in loading the activity feed.': '載入動態時發生錯誤。',
    'Reload this page': '重新載入此頁面',
    'Welcome to the new feed!': '歡迎使用新版動態！',
    'We’re updating the cards and ranking all the time, so check back regularly. At first, you might need to follow some people or star some repositories to get started':
      '我們會持續更新卡片和排序方式，記得定期回來看看。一開始，你可能需要先追蹤一些人或為一些儲存庫加星號',
    'Updates to your homepage feed': '首頁動態更新',
    // 原文没有给 Following feed、For you feed 加引号，译文也不加；动态名沿用分页名“追蹤中”“為你推薦”，
    // 各加“的動態”，避免“追蹤中和為你推薦”被读成“中和”
    'We’ve combined the power of the Following feed with the For you feed so there’s one place to discover content on GitHub. There’s improved filtering so you can customize your feed exactly how you like it, and a shiny new visual design. ✨':
      '我們把追蹤中的動態和為你推薦的動態合而為一，讓你在同一處探索 GitHub 上的內容。篩選功能也經過改良，可依喜好自訂動態，還有煥然一新的視覺設計。✨',
    "We've combined the power of the Following feed with the For you feed so there’s one place to discover content on GitHub. There’s improved filtering so you can customize your feed exactly how you like it, and a shiny new visual design. ✨":
      '我們把追蹤中的動態和為你推薦的動態合而為一，讓你在同一處探索 GitHub 上的內容。篩選功能也經過改良，可依喜好自訂動態，還有煥然一新的視覺設計。✨',
    'to receive personalized suggestions.': '以取得個人化推薦。',
    'Subscribe to your news feed': '訂閱你的動態',
    'organization news feed': '組織動態',

    // 卡片标题：Popular among + <people you follow>
    'Recommended for you': '為你推薦',
    'Latest from our changelog': '最新變更記錄',
    'Recommended based on people you follow': '根據你追蹤的人推薦',
    'Popular among': '熱門於',
    'Popular projects among': '熱門專案於',
    'Popular among people you follow': '在你追蹤的人之間很熱門',
    'Popular projects among people you follow': '你追蹤的人之間的熱門專案',
    'people you follow': '你追蹤的人',
    'Join discussion': '參與討論',

    // 动作短语：<用户> starred a repository
    'starred a repository': '為儲存庫加了星號',
    'forked a repository': '分叉了儲存庫',
    'created a repository': '建立了儲存庫',
    'has a new repository': '有新的儲存庫',
    'made this repository public': '將此儲存庫設為公開',
    'published a release': '發布了發行版本',
    'added a repository to': '將儲存庫加入',
    'contributed to': '貢獻於',
    'started following': '開始追蹤',
    'started sponsoring': '開始贊助',
    'launched their sponsorship page 💖': '推出了贊助頁面 💖',
    'has a new discussion in': '有新討論於',
    'posted a discussion in': '發表了討論於',
    // 拉取请求的动词 open → 建立（GLOSSARY.zh-TW pull request 行）
    'opened a pull request': '建立了拉取請求',
    'closed a pull request': '關閉了拉取請求',
    'labeled a pull request': '為拉取請求加上了標籤',
    'commented on an issue in': '在議題中留言於',
    'commented on a pull request in': '在拉取請求中留言於',
    'created a branch in': '建立了分支於',

    // 条目选项菜单（标点随原文：推荐原因不加冒号）
    'Feed item options': '動態項目選項',
    'You’re seeing this because of your activity.': '你看到此內容是因為你的活動。',
    "You're seeing this because of your activity.": '你看到此內容是因為你的活動。',
    'You’re seeing this based on GitHub-wide trends.': '你看到此內容是根據 GitHub 全站的趨勢。',
    "You're seeing this based on GitHub-wide trends.": '你看到此內容是根據 GitHub 全站的趨勢。',
    'Show less activity like this': '減少顯示此類活動',
    'Unfollow this user': '取消追蹤此使用者',

    // 旧版首页动态卡片：“不感兴趣”菜单、筛选状态；卡片区域的无障碍名称（card content）保持原文，见 core/ignore 的 KEEP_ORIGINAL_ATTRIBUTES
    // preferences 指想看的内容（喜好），不是设置义的“偏好設定”；名词 filter → 筛选器
    'Tell us more about your preferences': '進一步告訴我們你的喜好',
    'Filters are loading': '正在載入篩選器',
    'Failed to apply filters. Resetting your feed.': '無法套用篩選器。正在重設你的動態。',
    'feed item heading menu': '動態項目標題選單',
    'Repo Details': '儲存庫詳細資料'
  },
  scoped: {
    // 标签页
    'For you': '為你推薦',
    // 筛选对话框的事件类型（Sponsors 指赞助事件，由 common 的全局词条译“贊助”，不再收 scoped 副本）
    Events: '事件',
    Announcements: '公告',
    Releases: '發行版本',
    Follows: '追蹤',
    Recommendations: '推薦',
    // 组织动态订阅：Subscribe to the + <组织> + organization news feed
    'Subscribe to the': '訂閱',
    // 旧版动态的动作短语（夹在用户名与目标链接之间，语序固定；starred 译作“加了星號”）
    starred: '加了星號',
    forked: '分叉了',
    'Forked to': '分叉到',
    created: '建立了',
    released: '發布了',
    published: '發布了',
    pushed: '推送了',
    'pushed to': '推送到',
    followed: '追蹤了',
    sponsored: '贊助了',
    deleted: '刪除了',
    // 旧版动态里单独的 opened：议题、拉取请求的动词 open 都作“建立”（GLOSSARY.zh-TW pull request、Open 行）
    // （采集数据中没有该卡片，未核实是否也会接拉取请求链接）
    opened: '建立了',
    'your repository': '你的儲存庫'
  },
  regexp: [
    // 条目选项菜单：You're seeing this because you starred octo-org/hello-world
    [/^You[’']re seeing this because you (starred|follow|collaborated with)(?: (.+))?$/, (_, reason, target) => reasonText(reason, target)],
    // 聚合卡片：and 3 more / 5 more commits » / added 2 repositories to
    [/^and ([\d,]+) more$/, '和其他 $1 個'],
    [/^([\d,]+) more commits? »$/, '還有 $1 個提交 »'],
    [/^([\d,]+) commits? to$/, '$1 個提交到'],
    [/^added ([\d,]+) repositor(?:y|ies) to$/, '將 $1 個儲存庫加入'],
    [/^([\d,]+) of your repositor(?:y|ies)$/, '你的 $1 個儲存庫'],
    [/^([\d,]+) issues? needs? help$/, '$1 個議題需要協助'],
    [/^Support (.+)['’]s open source work$/, '支持 $1 的開源工作'],
    // 旧版动态卡片的“不感兴趣”菜单：I'm not interested in starred repositories from octocat
    [
      /^I[’']m not interested in (starred|forked) repositories from ([\w.-]+)$/,
      (_, kind, user) => `對 ${user} ${kind === 'starred' ? '加星號' : '分叉'}的儲存庫不感興趣`
    ],
    [/^I[’']m not interested in ([\w.-]+\/[\w.-]+)$/, '對 $1 不感興趣'],
    [/^I want to see fewer (starred|forked|trending) repositories$/, (_, kind) => `減少顯示${FEWER[kind] ?? kind}儲存庫`],
    [/^Dismissed a repository from ([\w.-]+\/[\w.-]+)\. Thank you for the feedback!$/, '已從動態中移除 $1。感謝你的意見回饋！'],
    // 卡片区域与星号计数的无障碍名称：repository body 0 / Repo Details 1 / 523 stargazers
    [/^repository body (\d+)$/, '儲存庫內容 $1'],
    [/^Repo Details (\d+)$/, '儲存庫詳細資料 $1'],
    [/^([\d,]+) stargazers?$/, '$1 位加星號的使用者'],
    // 追踪按钮：Follow octocat / Unfollow octocat
    [/^(Follow|Unfollow) ([A-Za-z\d][\w-]*)$/, (_, action, user) => `${action === 'Follow' ? '追蹤' : '取消追蹤'} ${user}`]
  ]
} satisfies PageDictionary
