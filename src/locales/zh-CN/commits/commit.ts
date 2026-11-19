import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 页头：父提交数、标签数（父提交行在 <pre> 内，已由引擎放行：2 parents <sha> + <sha> commit <sha>）
  [/^(\d+) parents?$/, '$1 个父提交'],
  [/^(\d+) tags$/, '$1 个标签'],
  // 更改统计：2 files changed（React 拆成 “2” “ file” “s” “ changed” 后拼接）
  [/^(\d[\d,]*) files? changed$/, '已更改 $1 个文件'],
  // 评论区标题：3 commit comments
  [/^(\d[\d,]*) commit comments?$/, '$1 条提交评论'],
  // 经典评论区标题：0 comments on commit <0ff253b>
  [/^(\d[\d,]*) comments? on commit$/, '$1 条提交评论'],
  [/^(\d[\d,]*) comments? on commit ([0-9a-f]{7,40})$/, '提交 $2 的 $1 条评论'],
  [/^Comments on commit ([0-9a-f]{7,40})$/, '提交 $1 的评论'],
  // 行内评论线程：回复过多时的提示、评论的无障碍名称
  [/^Only the first (\d+) replies are currently being shown\.$/, '当前仅显示前 $1 条回复。'],
  [/^Reply (\d+) to Comment (\d+)$/, '评论 $2 的第 $1 条回复'],
  [/^Reply (\d+)$/, '第 $1 条回复'],
  [/^Comment (\d+)$/, '第 $1 条评论'],
  // 过时评论线程的差异预览标题：Line +12, commit <0ff253b> / Line -3 to +5, commit <0ff253b>
  [/^Line ([+-]?\d+)(?: to ([+-]?\d+))?, commit$/, (_, start: string, end: string) => `第 ${end ? `${start} 至 ${end}` : start} 行，提交`],
  // 应用建议对话框：提交失败（冒号后为服务器返回的原因）
  [/^There was an error trying to commit changes: (\S.*)$/, '提交更改时出错：$1']
]

/**
 * 提交详情页（/commit/<sha>）：页头、更改统计、文件树、评论区（含应用建议对话框）与锁定对话、订阅、在场证明、
 * 错误与横幅。差异视图的文字见 diff.ts，签名弹层见 list.ts。
 */
export default {
  static: {
    // 页头
    'Show more tags': '显示更多标签',
    'Show all tags': '显示所有标签',
    'Loading branch information': '正在加载分支信息',

    // 文件树（展开 / 折叠、筛选文件等由 code、pulls 词典收录）
    'File Tree': '文件树',
    'Draggable pane splitter': '可拖动的窗格分隔条',
    'Find in commit input': '在提交中查找',
    'Search within code': '在代码中搜索',

    // 差异加载错误
    'Sorry, this diff is unavailable.': '抱歉，此差异不可用。',
    'The repository may be missing relevant data.': '存储库可能缺少相关数据。',
    'Please contact support for more information': '请联系支持了解详细信息',
    'Sorry, this diff is taking too long to generate.': '抱歉，生成此差异的时间过长。',
    'It may be too large to display on GitHub.': '它可能过大而无法在 GitHub 上显示。',
    'Sorry, this diff is temporarily unavailable due to heavy server load.': '抱歉，此差异因服务器负载过高而暂时不可用。',
    'Some content is hidden': '部分内容已隐藏',
    'Large Commits have some content hidden by default. Use the searchbox below for content that may be hidden.':
      '大型提交默认隐藏部分内容。请使用下方搜索框查找可能被隐藏的内容。',
    // 纪念 Jim Weirich 的提交横幅
    'Thanks for everything, Jim.': '感谢你所做的一切，Jim。',
    'We will miss you.': '我们会想念你。',

    // 评论区
    'to comment.': '后发表评论。',
    'Comment on this commit': '评论此提交',
    'Load more comments': '加载更多评论',
    'Comments cannot be loaded right now': '暂时无法加载评论',
    'Refresh the page or try again later': '请刷新页面或稍后重试',
    'Failed to add comment': '添加评论失败',
    'Failed to edit comment': '编辑评论失败',
    'Failed to update comment': '更新评论失败',
    'Failed to delete comment': '删除评论失败',
    'Failed to hide comment': '隐藏评论失败',
    'Failed to unhide comment': '取消隐藏评论失败',
    'Failed to fetch thread': '获取线程失败',
    'Failed to fetch comment data': '获取评论数据失败',
    'Comment not found': '找不到评论',
    // 建议更改：应用 / 加入批次（应用建议、加入批次等按钮与不可应用的原因由 pulls 词典收录）
    'More suggestion batching options': '更多建议批量处理选项',
    'This feature is not supported yet.': '暂不支持此功能。',
    'There was an error trying to commit changes.': '提交更改时出错。',
    // 订阅
    "You're now subscribed to this thread.": '你已订阅此线程。',
    'You’re now subscribed to this thread.': '你已订阅此线程。',
    "You're now unsubscribed to this thread.": '你已取消订阅此线程。',
    'You’re now unsubscribed to this thread.': '你已取消订阅此线程。',

    // 锁定对话对话框（片段按原文顺序收录，译文重排后整句通顺）
    'Lock conversation on this commit': '锁定此提交的对话',
    'Unlock conversation on this commit': '解锁此提交的对话',
    // 「X. Please try again.」句号随原文（与 pulls、common-ui 一致）
    'There was an error locking this conversation. Please try again.': '锁定此对话时出错。请重试。',
    'There was an error unlocking this conversation. Please try again.': '解锁此对话时出错。请重试。',
    'Locking the conversation means:': '锁定对话意味着：',
    'Unlocking the conversation means:': '解锁对话意味着：',
    // 所有人 都可以再次对此提交发表评论。
    'will be able to comment on this commit once more.': '都可以再次对此提交发表评论。',
    // 其他用户 将无法 对此提交发表新评论。
    'to this commit.': '对此提交发表新评论。',
    // 你和其他拥有此存储库 <写入访问权限> 的人员 仍可发表 其他人可见的评论。（write access 由 issues 词典全局收录）
    'You and other members of teams with': '你和其他拥有此存储库',
    'You can always unlock this commit again in the future.': '你以后随时可以解锁此提交。',
    'You can always lock this commit again in the future.': '你以后随时可以再次锁定此提交。'
  },
  scoped: {
    // 页头父提交行：N 个父提交 <sha> 提交 <sha>（commit 是 <pre> 内的独立文本）
    commit: '提交',
    'Browse files': '浏览文件',
    // 评论区的屏幕阅读器标题：<3> 条提交评论（评论数尚未加载时只有文字部分）
    'commit comments': '提交评论',
    'Comments on commit': '提交评论',
    // 服务器繁忙时的差异不可用说明
    'Please try again later.': '请稍后重试。',
    Top: '顶部',
    Comments: '评论',
    // 行内评论
    'Add diff comment': '添加差异评论',
    'Failed to react to comment': '添加反应失败',
    // 应用建议对话框
    'Commit message': '提交消息',
    'Extended description': '扩展描述',
    // 锁定对话片段（与讨论区同一套重排译法）
    'Other users': '其他用户',
    'can’t add new comments': '将无法',
    "can't add new comments": '将无法',
    'You and other collaborators': '你和其他',
    'with access': '有权访问此存储库',
    'to this repository': '的人员',
    'can still leave comments': '仍可发表',
    'that others can see.': '其他人可见的评论。',
    'Lock conversation': '锁定对话',
    'Unlock conversation': '解锁对话',
    // 原文无逗号，译文不加
    'The page is unavailable due to a system error.': '页面因系统错误而不可用。',
    'Try reloading the page, or if the problem persists, contact support.': '请重新加载页面；如果问题仍然存在，请联系支持。'
  },
  regexp
} satisfies PageDictionary
