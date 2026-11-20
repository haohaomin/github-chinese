import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 标签页标题段：Comparing main...feature
  [/^Comparing (\S+\.\.\.?\S+)$/, '比较 $1'],
  // 统计栏
  [/^(\d[\d,]*) contributors?$/, '$1 个贡献者'],
  // 比较过大
  [/^This comparison is big! We[’']re only showing the most recent (\d[\d,]*) commits$/, '此比较较大！仅显示最近 $1 个提交']
]

/**
 * 比较页（/compare）：说明、范围选择器（基础 / 头部存储库与引用）、合并状态、统计栏、
 * 空比较与示例、过大或失败提示。拉取请求创建表单由 pulls 词典处理。
 */
export default {
  static: {
    // 页头说明
    'Comparing changes': '比较更改',
    'Compare changes': '比较更改',
    'Choose two branches to see what’s changed or to start a new pull request. If you need to, you can also':
      '选择两个分支以查看更改或创建新的拉取请求。如有需要，你也可以',
    "Choose two branches to see what's changed or to start a new pull request. If you need to, you can also":
      '选择两个分支以查看更改或创建新的拉取请求。如有需要，你也可以',
    'Compare changes across branches, commits, tags, and more below. If you need to, you can also':
      '在下方比较分支、提交、标签等之间的更改。如有需要，你也可以',
    'compare across forks': '跨复刻比较',
    'learn more about diff comparisons': '了解差异比较',
    'Open a pull request': '创建拉取请求',
    'Create a new pull request by comparing changes across two branches. If you need to, you can also':
      '比较两个分支的更改以创建新的拉取请求。如有需要，你也可以',
    'Learn more about diff comparisons here': '了解差异比较',
    // 两点比较（a..b）：… repositories. <View the default comparison> for this range or <learn more about diff comparisons>.
    'This is a direct comparison between two commits made in this repository or its related repositories.':
      '这是对此存储库或其相关存储库中两个提交的直接比较。',
    'View the default comparison': '查看此范围的默认比较',
    Permalink: '永久链接',
    Compare: '比较',

    // 范围选择器
    'base repository:': '基础存储库：',
    'head repository:': '头部存储库：',
    'Choose a base ref': '选择基础引用',
    'Choose a head ref': '选择头部引用',
    'Choose a Base Repository': '选择基础存储库',
    'Choose a Head Repository': '选择头部存储库',
    'Filter repos': '筛选存储库',
    'Failed to load repositories. Confirm that selected base ref is valid, then try again.':
      '无法加载存储库。请确认所选基础引用有效后重试。',
    'Failed to load repositories. Confirm that selected head ref is valid, then try again.':
      '无法加载存储库。请确认所选头部引用有效后重试。',
    'Find a tag': '查找标签',
    'Could not load branches': '无法加载分支',
    'Could not load tags': '无法加载标签',
    'Three-dot diff: changes since branches diverged': '三点差异：分支分叉以来的更改',

    // 合并状态
    'Able to merge.': '可以合并。',
    'These branches can be automatically merged.': '这些分支可以自动合并。',
    'Can’t automatically merge.': '无法自动合并。',
    "Can't automatically merge.": '无法自动合并。',
    'Don’t worry, you can still create the pull request.': '仍可创建拉取请求。',
    "Don't worry, you can still create the pull request.": '仍可创建拉取请求。',
    'Checking mergeability…': '正在检查能否合并…',
    'Checking mergeability...': '正在检查能否合并...',
    'Discuss and review the changes in this comparison with others.': '与他人讨论和审查此比较中的更改。',
    // 创建拉取请求区的另一种说明（原文无逗号）
    'Create another pull request to discuss and review the changes again.': '创建另一个拉取请求以再次讨论和审查这些更改。',

    // 统计栏
    'Compare Stats': '比较统计',
    'Loading Files': '正在加载文件',
    'Loading more...': '正在加载更多...',

    // 空比较
    'There isn’t anything to compare.': '没有可比较的内容。',
    "There isn't anything to compare.": '没有可比较的内容。',
    // <main> 和 <main> 完全相同。
    'are identical.': '完全相同。',
    // <main> 和 <other> 是完全不同的提交历史记录。
    'are entirely different commit histories.': '是完全不同的提交历史记录。',
    // <基础分支> 已包含来自 <头部分支> 的所有提交。请尝试 <切换基础分支> 进行比较。
    'is up to date with all commits from': '已包含来自',
    'switching the base': '切换基础分支',
    'for your comparison.': '进行比较。',
    'We couldn’t figure out how to compare these references, do they point to valid commits?': '无法比较这些引用，它们是否指向有效的提交？',
    "We couldn't figure out how to compare these references, do they point to valid commits?": '无法比较这些引用，它们是否指向有效的提交？',
    'You’ll need to use two different branch names to get a valid comparison.': '需要使用两个不同的分支名称才能进行有效比较。',
    "You'll need to use two different branch names to get a valid comparison.": '需要使用两个不同的分支名称才能进行有效比较。',
    'Check out some of these sample comparisons.': '查看以下示例比较。',
    'Choose different branches or forks above to discuss and review changes.': '在上方选择不同的分支或复刻来讨论和审查更改。',
    'Compare and review just about anything': '比较和审查几乎任何内容',
    'Branches, tags, commit ranges, and time ranges. In the same repository and across forks.':
      '分支、标签、提交范围和时间范围。同一存储库内或跨复刻均可。',
    'Example comparisons': '示例比较',
    'Learn about pull requests': '了解拉取请求',

    // 比较失败
    'This comparison is taking too long to generate.': '生成此比较耗时过长。',
    'Unfortunately it looks like we can’t render this comparison for you right now. It might be too big, or there might be something weird with your repository.':
      '目前无法呈现此比较。可能是比较过大，或存储库存在异常。',
    "Unfortunately it looks like we can't render this comparison for you right now. It might be too big, or there might be something weird with your repository.":
      '目前无法呈现此比较。可能是比较过大，或存储库存在异常。',
    'You can try running this command locally to see the comparison on your machine:': '你可以在本地运行以下命令查看比较：'
  },
  scoped: {
    // 入门引导提示「By creating a <a>pull request</a> you'll be proposing …」里的链接
    'pull request': '拉取请求',
    // 空比较提示片段：<main> 已包含来自 <v3.0.0> 的所有提交。请尝试 …
    '. Try': '的所有提交。请尝试',
    'base:': '基础：',
    'compare:': '比较：',
    'Find a branch': '查找分支',
    'Files changed': '已更改的文件',
    // 标签 Files changed 的单数形式
    'File changed': '已更改的文件',
    // 摘要栏计数：<span>1</span> <span>file changed</span>（数字是相邻元素）
    'file changed': '个文件已更改',
    'files changed': '个文件已更改',
    contributor: '个贡献者',
    contributors: '个贡献者',
    // 新建拉取请求表单：类型菜单按钮、表单内容恢复失败的横幅
    'Select a type of pull request': '选择拉取请求类型',
    "Your submitted title and description could not be recovered. Try your browser's Back button to see if your previous text is still available.":
      '无法恢复你提交的标题和描述。请尝试使用浏览器的“后退”按钮，查看之前的文本是否还在。',
    // 两点比较页头说明的链接间片段：“此范围”已并入前一个链接的译文
    'for this range or': '或'
  },
  regexp,
  ignore: [
    // 经典比较页摘要下展开的文件路径列表
    'ol.content > li > a[href^="#diff-"]'
  ],
  attributeRules: [
    // 经典提交列表（比较页）：作者链接是用户提及（整体忽略），只改写提示
    ['a.commit-author', 'title', /^View all commits by ([\w.-]+(?:\[bot\])?)$/, '查看 $1 的所有提交']
  ],
  inline: [
    // 入门引导提示（?show_onboarding_guide_tip=true）：分支名 <strong>、链接 <a> 拆开的句子
    [
      "The changes below are committed to a separate branch, named {}. By creating a {} you'll be proposing that your team pull these changes into this repository's main branch.",
      '以下更改已提交到名为 {} 的单独分支。创建{}即表示提议团队将这些更改拉取到此存储库的主分支。'
    ],
    [
      'The changes below are committed to a separate branch, named {}. By creating a {} you’ll be proposing that your team pull these changes into this repository’s main branch.',
      '以下更改已提交到名为 {} 的单独分支。创建{}即表示提议团队将这些更改拉取到此存储库的主分支。'
    ],
    [
      'These particular changes propose revisions to the README file in this repository, which adds a badge indicating the status of two {} workflows in your repository.',
      '这些更改提议修订此存储库的自述文件，添加一个显示存储库中两个 {}工作流状态的徽章。'
    ]
  ]
} satisfies PageDictionary
