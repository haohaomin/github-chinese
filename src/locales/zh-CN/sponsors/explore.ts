import type { PageDictionary } from '../../../core/types'

/**
 * 探索页（/sponsors/explore）与筛选器、赞助帐户页（/sponsors/accounts）、
 * 批量赞助（/sponsors/bulk-sponsorships/*）、组织依赖页。
 * 产品名按用户决定（2026-10-27，product-names.md）译成中文：GitHub Sponsors → GitHub 赞助，
 * 不带前缀的 Sponsors → 赞助（Sponsors profile → 赞助个人资料）。
 */

/** 排序选项 */
const ORDERINGS: Readonly<Record<string, string>> = {
  'Most used': '使用最多',
  'Least used': '使用最少',
  'Most sponsors': '赞助者最多',
  'Fewest sponsors': '赞助者最少',
  'Newest Sponsors profile': '赞助个人资料最新',
  'Oldest Sponsors profile': '赞助个人资料最早',
  Unknown: '未知'
}

/** 生态系统筛选按钮文字：All ecosystems / 2 ecosystems / npm */
function ecosystemLabel(label: string): string {
  if (label === 'All ecosystems') return '全部生态系统'
  const count = /^(\d+) ecosystems?$/.exec(label)
  return count ? `${count[1]} 个生态系统` : label
}

export default {
  static: {
    // 探索页
    'Explore GitHub Sponsors': '探索 GitHub 赞助',
    'Fund the work of developers and projects you depend on.': '资助你所依赖的开发者和项目。',
    'Sponsored developers and organizations': '被赞助的开发者和组织',
    "Don't see what you're looking for? Try": '没找到想要的？试试',
    'Don’t see what you’re looking for? Try': '没找到想要的？试试',
    'searching for people you can sponsor': '搜索可赞助的人',
    'and filtering by language!': '并按语言筛选！',

    // 探索页：筛选器
    'All ecosystems': '全部生态系统',
    'Direct dependencies only': '仅直接依赖',

    // 探索页：依赖
    'None of your dependencies can be sponsored': '你的依赖都不可赞助',
    "You don't directly depend on any repositories whose maintainers can be sponsored.": '你没有直接依赖任何维护者可赞助的存储库。',
    'You don’t directly depend on any repositories whose maintainers can be sponsored.': '你没有直接依赖任何维护者可赞助的存储库。',
    // 主语（组织名）在单独的元素里时的后半句
    'does not directly depend on any repositories whose maintainers can be sponsored.': '没有直接依赖任何维护者可赞助的存储库。',
    'developers who maintain your dependencies': '个维护你的依赖的开发者',
    'Explore people and projects': '探索人员和项目',
    'Bulk Sponsor': '批量赞助',
    'Sponsor multiple maintainers in one easy transaction.': '一次交易赞助多个维护者。',
    'owns or maintains.': '拥有或维护。',
    'owns or maintains': '拥有或维护',
    "We check their maintainer status by seeing if they're listed in a repository's": '我们通过检查其是否列在存储库的',
    'We check their maintainer status by seeing if they’re listed in a repository’s': '我们通过检查其是否列在存储库的',
    'Talk to your organization about GitHub Sponsors': '与组织讨论 GitHub 赞助',
    'Share this discovery page with your team to start a conversation about investing in the people and projects you rely on.':
      '与团队分享此发现页以开始讨论如何投资你所依赖的人员和项目。',
    "Invest in open source software and we'll track your progress here!": '投资开源软件后我们会在此跟踪你的进度！',
    'Invest in open source software and we’ll track your progress here!': '投资开源软件后我们会在此跟踪你的进度！',

    // 赞助帐户页 /sponsors/accounts
    'GitHub Sponsors accounts': 'GitHub 赞助帐户',
    'Manage who you sponsor': '管理你赞助的对象',
    "You haven't sponsored anyone yet.": '你还没有赞助任何人。',
    'You haven’t sponsored anyone yet.': '你还没有赞助任何人。',
    'Find someone to sponsor': '寻找赞助对象',
    'GitHub Sponsors eligible accounts': '符合 GitHub 赞助条件的帐户',
    'This account has not applied to join GitHub Sponsors.': '此帐户尚未申请加入 GitHub 赞助。',
    'Join the waitlist': '加入候补名单',
    'GitHub Sponsors applications': 'GitHub 赞助申请',
    'This GitHub Sponsors profile is waiting to be reviewed by GitHub.': '此 GitHub 赞助个人资料正在等待 GitHub 审查。',

    // 批量赞助
    'Bulk sponsor': '批量赞助',
    'Bulk sponsorship': '批量赞助',
    'Bulk Sponsors': '批量赞助',
    'Choose frequency to bulk sponsor': '选择批量赞助频率',
    'Choose a frequency': '选择频率',
    'Sponsored maintainers will receive a one-time payment. Your profile picture will appear in their sponsors for one month.':
      '被赞助的维护者将收到一次性付款。你的个人资料图片将在其赞助者列表中显示一个月。',
    'Sponsored maintainers will receive a recurring sponsorship until you cancel. Your profile picture will appear in their sponsors for the duration of your sponsorship.':
      '被赞助的维护者将持续收到定期赞助直到你取消。你的个人资料图片将在赞助期间显示在其赞助者列表中。',
    'Create sponsorships in bulk via file import': '通过导入文件批量创建赞助',
    'One-time bulk sponsorship': '一次性批量赞助',
    'Monthly bulk sponsorship': '每月批量赞助',
    'Import a CSV': '导入 CSV',
    'Download example CSV': '下载示例 CSV',
    'Or export a list of your dependencies on': '或在以下位置导出依赖项列表',
    // 链接到探索页；原文没有 GitHub 前缀，按 product-names 作“赞助”
    'Explore Sponsors': '探索赞助',
    "A CSV is a type of file that contains the names of the people you want to sponsor and the sponsorship amount. We'll look for columns labeled Maintainer Username and Amount in USD. We'll safely ignore the rest of your columns. You can modify the file using a tool like Microsoft Excel, Google Sheets, or a text editor.":
      'CSV 文件包含要赞助的人员名称和赞助金额。我们会查找名为 Maintainer Username 和 Amount in USD 的列。其余列将被忽略。可使用 Microsoft Excel、Google Sheets 或文本编辑器等工具修改文件。',
    'Continue to checkout': '继续结账',

    // 组织依赖页（标点随原文：三句各自成句）
    'We only show dependencies that have an active sponsors profile. We use files in your repositories like package-lock.json and requirements.txt to find your dependencies. We check their maintainer status by seeing if they’re listed in a repository’s funding file.':
      '只显示拥有有效赞助个人资料的依赖。我们通过存储库中的 package-lock.json 和 requirements.txt 等文件查找依赖。我们通过检查维护者是否列在存储库的资助文件中确认其身份。',
    "We only show dependencies that have an active sponsors profile. We use files in your repositories like package-lock.json and requirements.txt to find your dependencies. We check their maintainer status by seeing if they're listed in a repository's funding file.":
      '只显示拥有有效赞助个人资料的依赖。我们通过存储库中的 package-lock.json 和 requirements.txt 等文件查找依赖。我们通过检查维护者是否列在存储库的资助文件中确认其身份。',
    'Your dependencies will appear here': '你的依赖将显示在此处',
    "Looks like you don't have any dependencies that can be sponsored right now. You can find open source maintainers to sponsor on our explore page.":
      '目前没有可赞助的依赖。可在探索页查找可赞助的开源维护者。',
    'Explore maintainers': '探索维护者',
    'Search maintainers, dependencies': '搜索维护者、依赖',
    'Try searching for something else': '尝试搜索其他内容',
    'An error occurred while searching for your dependencies.': '搜索依赖时出错。',
    'Loading dependencies table': '正在加载依赖表',
    'Your dependencies they maintain or own': '他们维护或拥有的你的依赖',
    'Export dependencies': '导出依赖',
    'There was a problem exporting your dependencies.': '导出依赖时出现问题。',
    'Sponsorable dependencies': '可赞助的依赖'
  },
  scoped: {
    Ecosystems: '生态系统',
    sponsors: '个赞助者',
    You: '你',
    Pending: '待审查',
    Import: '导入',
    'Choose file': '选择文件',
    Unknown: '未知',
    'Repository list': '存储库列表',
    'Recent activity': '最近活动',
    'Choose your file': '选择文件',
    'Download your': '下载',
    'results as CSV': 'CSV 格式的结果',
    'You depend on': '你依赖',
    'others sponsor': '个其他赞助者',
    'funding file': '资助文件中确认维护者身份',
    'Order by': '排序依据',
    'Most used': '使用最多',
    'Least used': '使用最少',
    'Most sponsors': '赞助者最多',
    'Fewest sponsors': '赞助者最少',
    'Newest Sponsors profile': '赞助个人资料最新',
    'Oldest Sponsors profile': '赞助个人资料最早',
    'Explore as': '探索身份',
    'Get email updates': '获取电子邮件动态',
    'Change email updates': '更改电子邮件动态',
    // 产品名：探索页子导航标签、全局导航「Open Source」菜单项与页面标题里的 GitHub Sponsors；common 没有全局词条
    'GitHub Sponsors': 'GitHub 赞助'
  },
  regexp: [
    [/^(\d[\d,]*) sponsored developers and organizations loaded\.$/, '已加载 $1 个被赞助的开发者和组织。'],
    [/^Explore as: (.+)$/, '探索身份：$1'],
    [/^Ecosystems: (.+)$/, (_, label: string) => `生态系统：${ecosystemLabel(label)}`],
    [/^(\d+) ecosystems?$/, '$1 个生态系统'],
    [/^Order by: (.+)$/, (_, label: string) => `排序依据：${ORDERINGS[label] ?? label}`],
    [
      /^(.+) does not directly depend on any repositories whose maintainers can be sponsored\.$/,
      '$1 没有直接依赖任何维护者可赞助的存储库。'
    ],
    // 按生态系统筛选后（主语在单独的元素里时只剩后半句）：… in the Cargo ecosystem whose maintainers can be sponsored.
    [
      /^(?:(.+?) )?(?:does not|don['’]t) directly depend on any repositories in the (.+) ecosystem whose maintainers can be sponsored\.$/,
      (_, subject: string | undefined, ecosystem: string) =>
        `${subject === 'You' ? '你' : subject ? `${subject} ` : ''}没有直接依赖 ${ecosystem} 生态系统中任何维护者可赞助的存储库。`
    ],
    [/^(\d[\d,]*) repositor(?:y|ies) they own or maintain$/, '他们拥有或维护的 $1 个存储库'],
    [/^others? sponsor, including (\d[\d,]*) organizations?$/, '个其他赞助者，包括 $1 个组织'],
    [/^Want to sponsor on behalf of (.+)\?$/, '想代表 $1 赞助吗？'],
    // 存储库列表对话框：<You / 组织> depend(s) on <N> repositories <用户> owns or maintains.
    // 主语分开收录，两条同译，拼读为“你依赖的 3 个存储库由 octocat 拥有或维护。”
    [/^depend on (\d[\d,]*) repositor(?:y|ies)$/, '依赖的 $1 个存储库由'],
    [/^depends on (\d[\d,]*) repositor(?:y|ies)$/, '依赖的 $1 个存储库由'],
    [/^(\d[\d,]*) repositor(?:y|ies)$/, '$1 个存储库'],
    [/^(\d[\d,]*) members?$/, '$1 个成员'],
    [/^(\d[\d,]*) of your repositories depends? on this$/, '你有 $1 个存储库依赖于此'],
    [/^\+(\d[\d,]*) more$/, '另有 $1 个'],
    [/^Sponsor (\d[\d,]*) maintainers?$/, '赞助 $1 个维护者']
  ],
  ignore: [
    // 探索页卡片：名称与简介
    'article.Box-row .col-sm-9'
  ]
} satisfies PageDictionary
