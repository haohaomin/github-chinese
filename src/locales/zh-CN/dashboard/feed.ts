import type { PageDictionary } from '../../../core/types'

/** 推荐原因：You're seeing this because you <reason> <target>；目标未拼进同一节点时只译前半句（标点随原文，不加冒号） */
function reasonText(reason: string, target: string): string {
  if (reason === 'collaborated with') return target ? `你看到此内容是因为你与 ${target} 协作过` : '你看到此内容是因为你协作过'
  if (reason === 'starred') return target ? `你看到此内容是因为你为 ${target} 加了星标` : '你看到此内容是因为你加了星标'
  return target ? `你看到此内容是因为你关注了 ${target}` : '你看到此内容是因为你关注了'
}

/** “不感兴趣”菜单：I want to see fewer <kind> repositories（starred repositories → 已加星标的存储库，GLOSSARY star 行） */
const FEWER: Readonly<Record<string, string>> = {
  starred: '已加星标的',
  forked: '复刻',
  trending: '趋势'
}

/**
 * 首页动态 /feed（新版首页的“Feed”标签页，旧版首页中部）：
 * 动态筛选对话框、加载与出错状态、欢迎提示、各类动态卡片的动作短语、条目选项菜单。
 * 动态卡片的标题句被用户名、存储库名链接拆开，动作短语单独成段翻译。
 */
export default {
  static: {
    // 筛选对话框
    'Feed filters': '动态筛选器',
    'Organization feed filters': '组织动态筛选器',
    'Activity you want to see on your feed': '你想在动态中看到的活动',
    'Special discussion posts from repositories': '存储库发布的特别讨论帖',
    'Update posts from repositories': '存储库发布的更新帖',
    'Relevant projects or people that are being sponsored': '获得赞助的相关项目或用户',
    'Repositories being starred by people': '被他人加星标的存储库',
    'Repositories that are created or forked by people': '他人创建或复刻的存储库',
    'Repository activity': '存储库活动',
    'Issues and pull requests from repositories': '存储库中的议题和拉取请求',
    'Issues, pull requests, and contributions from repositories': '存储库中的议题、拉取请求和贡献',
    'Who people are following': '他人关注了谁',
    'Repositories and people you may like': '你可能喜欢的存储库和用户',
    'Include events from starred repositories': '包含已加星标存储库的事件',
    'By default, the feed shows events from repositories you sponsor or watch, and people you follow.':
      '默认情况下，动态显示你赞助或关注的存储库以及你关注的人的事件。',
    'Reset to default': '恢复默认',

    // 加载、出错与欢迎提示
    'One moment please...': '请稍候...',
    'Loading activity...': '正在加载活动...',
    'There was an error in loading the activity feed.': '加载动态时出错。',
    'Reload this page': '重新加载此页面',
    'Welcome to the new feed!': '欢迎使用新版动态！',
    'We’re updating the cards and ranking all the time, so check back regularly. At first, you might need to follow some people or star some repositories to get started':
      '我们会持续更新卡片和排序，请经常回来看看。刚开始时，你可能需要先关注一些人或为一些存储库加星标',
    'Updates to your homepage feed': '首页动态已更新',
    // 原文没有给 Following feed、For you feed 加引号，译文也不加；用“把”字句，避免“将正在关注…”被读成时态
    'We’ve combined the power of the Following feed with the For you feed so there’s one place to discover content on GitHub. There’s improved filtering so you can customize your feed exactly how you like it, and a shiny new visual design. ✨':
      '我们把正在关注动态与为你推荐动态合二为一，在同一处发现 GitHub 上的内容。筛选功能已改进，可按喜好定制动态，还换上了全新的视觉设计。✨',
    "We've combined the power of the Following feed with the For you feed so there’s one place to discover content on GitHub. There’s improved filtering so you can customize your feed exactly how you like it, and a shiny new visual design. ✨":
      '我们把正在关注动态与为你推荐动态合二为一，在同一处发现 GitHub 上的内容。筛选功能已改进，可按喜好定制动态，还换上了全新的视觉设计。✨',
    'to receive personalized suggestions.': '以获取个性化推荐。',
    'Subscribe to your news feed': '订阅你的动态',
    'organization news feed': '组织动态',

    // 卡片标题：Popular among + <people you follow>
    'Recommended for you': '为你推荐',
    'Latest from our changelog': '更新日志最新动态',
    'Recommended based on people you follow': '根据你关注的人推荐',
    'Popular among': '热门于',
    'Popular projects among': '热门项目于',
    'Popular among people you follow': '你关注的人中的热门',
    'Popular projects among people you follow': '你关注的人中的热门项目',
    'people you follow': '你关注的人',
    'Join discussion': '参与讨论',

    // 动作短语：<用户> starred a repository
    'starred a repository': '为存储库加了星标',
    'forked a repository': '复刻了存储库',
    'created a repository': '创建了存储库',
    'has a new repository': '有新存储库',
    'made this repository public': '将此存储库设为公共',
    'published a release': '发布了发行版',
    'added a repository to': '将存储库添加到',
    'contributed to': '贡献于',
    'started following': '开始关注',
    'started sponsoring': '开始赞助',
    'launched their sponsorship page 💖': '上线了赞助页面 💖',
    'has a new discussion in': '有新讨论于',
    'posted a discussion in': '发表了讨论于',
    // 拉取请求的动词 open → 创建（GLOSSARY pull request 行）
    'opened a pull request': '创建了拉取请求',
    'closed a pull request': '关闭了拉取请求',
    'labeled a pull request': '为拉取请求添加了标签',
    'commented on an issue in': '评论了议题于',
    'commented on a pull request in': '评论了拉取请求于',
    'created a branch in': '创建了分支于',

    // 条目选项菜单（标点随原文：推荐原因不加冒号）
    'Feed item options': '动态条目选项',
    'You’re seeing this because of your activity.': '你看到此内容是因为你的活动。',
    "You're seeing this because of your activity.": '你看到此内容是因为你的活动。',
    'You’re seeing this based on GitHub-wide trends.': '你看到此内容是基于 GitHub 全站趋势。',
    "You're seeing this based on GitHub-wide trends.": '你看到此内容是基于 GitHub 全站趋势。',
    'Show less activity like this': '减少此类活动',
    'Unfollow this user': '取消关注此用户',

    // 旧版首页动态卡片：“不感兴趣”菜单、筛选状态；卡片区域的无障碍名称（card content）保持原文，见 core/ignore 的 KEEP_ORIGINAL_ATTRIBUTES
    // preferences 指想看的内容（喜好），不是设置义的“首选项”；名词 filter → 筛选器
    'Tell us more about your preferences': '告诉我们你的偏好',
    'Filters are loading': '正在加载筛选器',
    'Failed to apply filters. Resetting your feed.': '应用筛选器失败。正在重置动态。',
    'feed item heading menu': '动态条目标题菜单',
    'Repo Details': '存储库详细信息'
  },
  scoped: {
    // 标签页
    'For you': '为你推荐',
    // 筛选对话框的事件类型（Sponsors 指赞助事件，由 common 的全局词条译“赞助”，不再收 scoped 副本）
    Events: '事件',
    Announcements: '公告',
    Releases: '发行版',
    Follows: '关注',
    Recommendations: '推荐',
    // 组织动态订阅：Subscribe to the + <组织> + organization news feed
    'Subscribe to the': '订阅',
    // 旧版动态的动作短语（夹在用户名与目标链接之间，语序固定；starred 译作“加了星标”）
    starred: '加了星标',
    forked: '复刻了',
    'Forked to': '复刻到',
    created: '创建了',
    released: '发布了',
    published: '发布了',
    pushed: '推送了',
    'pushed to': '推送到',
    followed: '关注了',
    sponsored: '赞助了',
    deleted: '删除了',
    // 旧版动态里单独的 opened：拉取请求卡片用“opened a pull request”，这里按议题的动词 open 仍译“打开了”
    // （采集数据中没有该卡片，未核实是否也会接拉取请求链接）
    opened: '打开了',
    'your repository': '你的存储库'
  },
  regexp: [
    // 条目选项菜单：You're seeing this because you starred octo-org/hello-world
    [/^You[’']re seeing this because you (starred|follow|collaborated with)(?: (.+))?$/, (_, reason, target) => reasonText(reason, target)],
    // 聚合卡片：and 3 more / 5 more commits » / added 2 repositories to
    [/^and ([\d,]+) more$/, '以及另外 $1 个'],
    [/^([\d,]+) more commits? »$/, '另有 $1 个提交 »'],
    [/^([\d,]+) commits? to$/, '$1 个提交到'],
    [/^added ([\d,]+) repositor(?:y|ies) to$/, '将 $1 个存储库添加到'],
    [/^([\d,]+) of your repositor(?:y|ies)$/, '你的 $1 个存储库'],
    [/^([\d,]+) issues? needs? help$/, '$1 个议题需要帮助'],
    [/^Support (.+)['’]s open source work$/, '支持 $1 的开源工作'],
    // 旧版动态卡片的“不感兴趣”菜单：I'm not interested in starred repositories from octocat
    [
      /^I[’']m not interested in (starred|forked) repositories from ([\w.-]+)$/,
      (_, kind, user) => `对 ${user} ${kind === 'starred' ? '加星标' : '复刻'}的存储库不感兴趣`
    ],
    [/^I[’']m not interested in ([\w.-]+\/[\w.-]+)$/, '对 $1 不感兴趣'],
    [/^I want to see fewer (starred|forked|trending) repositories$/, (_, kind) => `减少${FEWER[kind] ?? kind}存储库动态`],
    [/^Dismissed a repository from ([\w.-]+\/[\w.-]+)\. Thank you for the feedback!$/, '已从动态中删除 $1。感谢反馈！'],
    // 卡片区域与星标计数的无障碍名称：repository body 0 / Repo Details 1 / 523 stargazers
    [/^repository body (\d+)$/, '存储库内容 $1'],
    [/^Repo Details (\d+)$/, '存储库详细信息 $1'],
    [/^([\d,]+) stargazers?$/, '$1 个标星者'],
    // 关注按钮：Follow octocat / Unfollow octocat
    [/^(Follow|Unfollow) ([A-Za-z\d][\w-]*)$/, (_, action, user) => `${action === 'Follow' ? '关注' : '取消关注'} ${user}`]
  ]
} satisfies PageDictionary
