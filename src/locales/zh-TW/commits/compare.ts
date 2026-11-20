import type { PageDictionary, RegExpRule } from '../../../core/types'

const regexp: readonly RegExpRule[] = [
  // 标签页标题段：Comparing main...feature
  [/^Comparing (\S+\.\.\.?\S+)$/, '比較 $1'],
  // 统计栏（贡献者是人，量词作「位」）
  [/^(\d[\d,]*) contributors?$/, '$1 位貢獻者'],
  // 比较过大
  [/^This comparison is big! We[’']re only showing the most recent (\d[\d,]*) commits$/, '此比較內容龐大！僅顯示最近 $1 個提交']
]

/**
 * 比较页（/compare）：说明、范围选择器（base / head 存储库与 ref）、合并状态、统计栏、
 * 空比较与示例、过大或失败提示。拉取请求创建表单由 pulls 词典处理。
 */
export default {
  static: {
    // 页头说明
    'Comparing changes': '比較變更',
    'Compare changes': '比較變更',
    'Choose two branches to see what’s changed or to start a new pull request. If you need to, you can also':
      '選擇兩個分支以查看變更內容或建立新的拉取請求。如有需要，你也可以',
    "Choose two branches to see what's changed or to start a new pull request. If you need to, you can also":
      '選擇兩個分支以查看變更內容或建立新的拉取請求。如有需要，你也可以',
    'Compare changes across branches, commits, tags, and more below. If you need to, you can also':
      '在下方比較分支、提交、標記等之間的變更。如有需要，你也可以',
    'compare across forks': '跨分叉比較',
    'learn more about diff comparisons': '瞭解差異比較',
    'Open a pull request': '建立拉取請求',
    'Create a new pull request by comparing changes across two branches. If you need to, you can also':
      '比較兩個分支之間的變更以建立新的拉取請求。如有需要，你也可以',
    'Learn more about diff comparisons here': '瞭解差異比較',
    // 两点比较（a..b）：… repositories. <View the default comparison> for this range or <learn more about diff comparisons>.
    'This is a direct comparison between two commits made in this repository or its related repositories.':
      '這是對此儲存庫或其相關儲存庫中兩個提交的直接比較。',
    'View the default comparison': '查看此範圍的預設比較',
    Permalink: '永久連結',
    Compare: '比較',

    // 范围选择器（base / head → 基底 / 來源；ref → 參考）
    'base repository:': '基底儲存庫：',
    'head repository:': '來源儲存庫：',
    'Choose a base ref': '選擇基底參考',
    'Choose a head ref': '選擇來源參考',
    'Choose a Base Repository': '選擇基底儲存庫',
    'Choose a Head Repository': '選擇來源儲存庫',
    'Filter repos': '篩選儲存庫',
    'Failed to load repositories. Confirm that selected base ref is valid, then try again.':
      '無法載入儲存庫。請確認選取的基底參考有效，然後再試一次。',
    'Failed to load repositories. Confirm that selected head ref is valid, then try again.':
      '無法載入儲存庫。請確認選取的來源參考有效，然後再試一次。',
    'Find a tag': '尋找標記',
    'Could not load branches': '無法載入分支',
    'Could not load tags': '無法載入標記',
    'Three-dot diff: changes since branches diverged': '三點差異：分支分歧以來的變更',

    // 合并状态
    'Able to merge.': '可以合併。',
    'These branches can be automatically merged.': '這些分支可以自動合併。',
    'Can’t automatically merge.': '無法自動合併。',
    "Can't automatically merge.": '無法自動合併。',
    'Don’t worry, you can still create the pull request.': '仍可建立拉取請求。',
    "Don't worry, you can still create the pull request.": '仍可建立拉取請求。',
    'Checking mergeability…': '正在檢查是否可合併…',
    'Checking mergeability...': '正在檢查是否可合併...',
    'Discuss and review the changes in this comparison with others.': '與他人討論並審查此比較中的變更。',
    // 创建拉取请求区的另一种说明（原文无逗号）
    'Create another pull request to discuss and review the changes again.': '建立另一個拉取請求以再次討論並審查這些變更。',

    // 统计栏
    'Compare Stats': '比較統計資料',
    'Loading Files': '正在載入檔案',
    'Loading more...': '正在載入更多...',

    // 空比较
    'There isn’t anything to compare.': '沒有可比較的內容。',
    "There isn't anything to compare.": '沒有可比較的內容。',
    // <main> 和 <main> 完全相同。
    'are identical.': '完全相同。',
    // <main> 和 <other> 是完全不同的提交歷史記錄。
    'are entirely different commit histories.': '是完全不同的提交歷史記錄。',
    // <基底分支> 已包含來自 <來源分支> 的所有提交。請嘗試 <切換基底分支> 來比較。
    'is up to date with all commits from': '已包含來自',
    'switching the base': '切換基底分支',
    'for your comparison.': '來比較。',
    'We couldn’t figure out how to compare these references, do they point to valid commits?': '無法比較這些參考，它們是否指向有效的提交？',
    "We couldn't figure out how to compare these references, do they point to valid commits?": '無法比較這些參考，它們是否指向有效的提交？',
    'You’ll need to use two different branch names to get a valid comparison.': '必須使用兩個不同的分支名稱才能有效比較。',
    "You'll need to use two different branch names to get a valid comparison.": '必須使用兩個不同的分支名稱才能有效比較。',
    'Check out some of these sample comparisons.': '查看以下範例比較。',
    'Choose different branches or forks above to discuss and review changes.': '在上方選擇不同的分支或分叉來討論並審查變更。',
    'Compare and review just about anything': '比較並審查幾乎任何內容',
    'Branches, tags, commit ranges, and time ranges. In the same repository and across forks.':
      '分支、標記、提交範圍和時間範圍。同一儲存庫內或跨分叉皆可。',
    'Example comparisons': '範例比較',
    'Learn about pull requests': '瞭解拉取請求',

    // 比较失败
    'This comparison is taking too long to generate.': '產生此比較耗時過長。',
    'Unfortunately it looks like we can’t render this comparison for you right now. It might be too big, or there might be something weird with your repository.':
      '目前無法顯示此比較。可能是內容過大，或儲存庫有異常。',
    "Unfortunately it looks like we can't render this comparison for you right now. It might be too big, or there might be something weird with your repository.":
      '目前無法顯示此比較。可能是內容過大，或儲存庫有異常。',
    'You can try running this command locally to see the comparison on your machine:': '你可以嘗試在本機執行以下命令來查看比較：'
  },
  scoped: {
    // 入门引导提示「By creating a <a>pull request</a> you'll be proposing …」里的链接
    'pull request': '拉取請求',
    // 空比较提示片段：<main> 已包含來自 <v3.0.0> 的所有提交。請嘗試 …
    '. Try': '的所有提交。請嘗試',
    'base:': '基底：',
    'compare:': '比較：',
    'Find a branch': '尋找分支',
    'Files changed': '變更的檔案',
    // 标签 Files changed 的单数形式
    'File changed': '變更的檔案',
    // 摘要栏计数：<span>1</span> <span>file changed</span>（数字是相邻元素）
    'file changed': '個檔案已變更',
    'files changed': '個檔案已變更',
    contributor: '位貢獻者',
    contributors: '位貢獻者',
    // 新建拉取请求表单：类型菜单按钮、表单内容恢复失败的横幅
    'Select a type of pull request': '選擇拉取請求類型',
    "Your submitted title and description could not be recovered. Try your browser's Back button to see if your previous text is still available.":
      '無法復原你提交的標題和描述。請嘗試使用瀏覽器的「上一頁」按鈕，查看先前的文字是否還在。',
    // 两点比较页头说明的链接间片段：“此範圍”已并入前一个链接的译文
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
      '以下變更已提交到名為 {} 的獨立分支。建立{}即表示提議團隊將這些變更拉取到此儲存庫的主要分支。'
    ],
    [
      'The changes below are committed to a separate branch, named {}. By creating a {} you’ll be proposing that your team pull these changes into this repository’s main branch.',
      '以下變更已提交到名為 {} 的獨立分支。建立{}即表示提議團隊將這些變更拉取到此儲存庫的主要分支。'
    ],
    [
      'These particular changes propose revisions to the README file in this repository, which adds a badge indicating the status of two {} workflows in your repository.',
      '這些變更提議修訂此儲存庫的讀我檔案，新增一個顯示儲存庫中兩個 {}工作流程狀態的徽章。'
    ]
  ]
} satisfies PageDictionary
