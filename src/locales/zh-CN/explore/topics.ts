import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, translateTime } from '../helpers'

/**
 * 主题页 /topics、/topics/<name> 与集合页 /collections、/collections/<name>：
 * 页头、存储库列表筛选与排序、主题侧栏、空状态、标签页标题。
 * 主题名、集合名与描述属于用户内容，由 ignore 跳过。
 */
export default {
  static: {
    // 主题列表
    'Browse popular topics on GitHub.': '浏览 GitHub 上的热门主题。',
    'All featured topics': '所有精选主题',
    'Popular topics': '热门主题',
    'Open Source, AI & Coding Topics on GitHub': 'GitHub 上的开源、AI 与编程主题',
    'Topics on GitHub': 'GitHub 上的主题',
    'GitHub Topics': 'GitHub 主题',

    // 主题详情：存储库列表
    'Filter by language': '按语言筛选',

    // 主题详情：侧栏
    'Topic followers': '主题关注者',
    'Related topics': '相关主题',
    'Related Topics': '相关主题',
    'Improve this page': '改进此页面',
    // 句子被主题标签拆成：Add a description, image, and links to the + <主题> + topic page so that …
    'Add a description, image, and links to the': '为',
    'topic page so that developers can more easily learn about it.': '主题页面添加描述、图片和链接，方便开发人员了解。',
    'Curate this topic': '完善此主题',
    'Add this topic to your repo': '将此主题添加到你的存储库',
    // 句子被主题名拆成：To associate your repository with the + <主题> + topic, visit …
    // 原文句号在引号内（select "manage topics."），check:locale 不把引号算作结尾标点，译文结尾不加句号（与 settings-account/profile.ts 同法）
    'To associate your repository with the': '要将存储库关联到',
    'topic, visit your repo\'s landing page and select "manage topics."': '主题，请在存储库首页选择“管理主题”',

    // 主题详情：空状态（The + <主题> + topic hasn't been used …）
    "topic hasn't been used on any public repositories, yet.": '尚未被任何公共存储库使用。',
    'Explore topics': '探索主题',

    // 集合
    'Curated lists and insight into burgeoning industries, topics, and communities.': '精选列表，以及对新兴行业、主题和社区的洞察。',
    'Open Source, AI & Coding Repo Collections on GitHub': 'GitHub 上的开源、AI 与编程存储库集合'
  },
  scoped: {
    The: '主题',
    'Sort:': '排序：',
    'Most stars': '星标最多',
    'Fewest stars': '星标最少',
    'Most forks': '复刻最多',
    'Fewest forks': '复刻最少',
    'Created by': '创建者',
    Released: '发布于',
    'Latest release': '最新发行版',
    Followers: '关注者',
    Website: '网站',
    Wikipedia: '维基百科',
    Collection: '集合'
  },
  regexp: [
    // 主题详情：Here are 67,180 public repositories matching this topic...
    [/^Here (?:are|is) ([\d,]+) public repositor(?:ies|y) matching this topic\.\.\.$/, '共有 $1 个公共存储库匹配此主题...'],
    // 列表计数的另一写法：There are 1,234 public repositories matching this topic（句号随原文）
    [
      /^There (?:are|is) ([\d,]+) public repositor(?:ies|y) matching this topic(\.)?$/,
      (_, count, period) => `共有 ${count} 个公共存储库匹配此主题${period ? '。' : ''}`
    ],
    // 侧栏关注者计数（59k followers）由 common-ui 的通用计数规则翻译
    // 侧栏发布日期与最新发行版时间：February 11, 2014 / 13 days ago
    [new RegExp(`^${TIME_SOURCE}$`), time => translateTime(time)],
    // 集合详情标签页标题段
    [/^Collection: (.+)$/, '集合：$1']
  ],
  ignore: [
    // 主题名：页头、空状态、侧栏“添加到存储库”说明
    'div.flex-1 > h1.h1',
    'div.f3.color-fg-muted > strong.h3',
    '.col-md-4 p.color-fg-muted > span.text-bold',
    // 主题列表页的推荐卡片与精选主题列表：名称与描述由全局规则 a[href^="/topics/"] > p 跳过
    // 集合网格中的名称与描述
    'a.exploregrid-item > p',
    // 集合详情页头：集合名与描述
    'h1.h1.lh-condensed',
    'h1.h1.lh-condensed + .f3.color-fg-muted'
  ]
} satisfies PageDictionary
