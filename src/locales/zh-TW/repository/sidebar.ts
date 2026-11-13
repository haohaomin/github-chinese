import type { PageDictionary, RegExpRule } from '../../../core/types'

/** 侧栏分节底部的「+ N <类型>」链接 */
const MORE_LINKS: Readonly<Record<string, string>> = {
  release: '個發行版本',
  contributor: '位貢獻者',
  deployment: '個部署',
  package: '個套件',
  environment: '個環境'
}

/** 成员个人资料的所有者：the organization's → 組織的；GitHub's → GitHub 的 */
function profileOwner(owner: string): string {
  const name = owner.replace(/['’]s$/, '')
  return name === 'the organization' ? '組織的' : ` ${name} 的`
}

const regexp: readonly RegExpRule[] = [
  // 编辑存储库详细信息：描述剩余字数
  [/^(\d[\d,]*) characters? remaining$/, '還剩 $1 個字元'],
  // 分节底部链接：+ 62 contributors、+ 3 releases、+ 1 more
  [
    /^\+ (\d[\d,]*) (release|contributor|deployment|package|environment)s?$/,
    (_, count: string, type: string) => `+ ${count} ${MORE_LINKS[type] ?? type}`
  ],
  [/^\+ (\d[\d,]*) more$/, '還有 $1 個'],
  // 语言分布条的无障碍名称（具体语言名不翻译）
  [/^Other: (\d+(?:\.\d+)?%)$/, '其他：$1'],
  // 引用此存储库：复制后的播报与复制按钮
  [/^(APA|BibTeX) citation copied to clipboard$/, '已將 $1 引文複製到剪貼簿'],
  [/^Copy (APA|BibTeX) citation$/, '複製 $1 引文'],
  // 特殊存储库（个人资料自述文件）
  [/^You can display (\S+) from this repository on your public GitHub profile\.$/, '你可以在 GitHub 公開個人檔案中顯示此儲存庫的 $1。'],
  [
    /^(and it )?will appear on (.+?) member profile, visible only to organization members\.$/,
    (_, created: string, owner: string) => `${created ? '後' : ''}將顯示在${profileOwner(owner)}成員專屬資料中，僅組織成員可見。`
  ]
]

/**
 * 存储库首页侧栏：About（描述、网站、资源链接、星标 / 关注 / 复刻计数、举报）与编辑存储库详细信息对话框，
 * 发行版、软件包、赞助、被使用、贡献者、部署、环境、语言、推荐工作流、引用此存储库、模板来源，
 * 以及特殊存储库（个人资料自述文件）的提示。
 * 描述、主题、发行版名、贡献者名属于用户内容，由全局忽略规则、code 词典排除或不收录；
 * 软件包名、环境名与复刻存储库的语言名由本文件的 ignore 排除。
 */
export default {
  static: {
    // About
    'No description, website, or topics provided.': '未提供描述、網站或主題。',
    'No description or website provided.': '未提供描述或網站。',
    // 资源链接：Readme 译「讀我檔案」
    Readme: '讀我檔案',
    'Report repository': '檢舉儲存庫',
    'Licenses found': '找到的授權條款',
    'Unknown license': '未知的授權條款',
    'Generated from': '產生自',

    // 编辑存储库详细信息
    'Edit repository details': '編輯儲存庫詳細資料',
    'Short description of this repository': '此儲存庫的簡短描述',
    'Enter a valid URL': '輸入有效的 URL',
    'Use your GitHub Pages website': '使用你的 GitHub 頁面網站',
    'Include in the home page': '在首頁顯示',
    'Error saving your changes.': '儲存變更時發生錯誤。',
    'Add topics': '新增主題',
    'Type to search topics': '輸入以搜尋主題',
    'Press Enter to add as new topic': '按 Enter 鍵新增為新主題',
    '(separate with spaces)': '（以空格分隔）',
    'Your repository details have been saved.': '儲存庫詳細資料已儲存。',
    // 编辑存储库详细信息：旧版主题建议（主题名是用户内容）
    'Suggested:': '建議：',
    'Add this topic': '新增此主題',
    'Decline this topic': '拒絕此主題',
    'This isn’t relevant': '不相關',
    "This isn't relevant": '不相關',
    'This is too specific': '過於具體',
    'This is too general': '過於籠統',
    'I just don’t like it': '不喜歡',
    "I just don't like it": '不喜歡',

    // 发行版、赞助、贡献者、部署、语言
    'No releases published': '未發布任何發行版本',
    'Sponsor this project': '贊助此專案',
    'No contributors': '尚無貢獻者',
    'No deployments published': '未發布任何部署',
    'Deploy in progress': '正在部署',
    'Repository language breakdown': '儲存庫語言分布',

    // 推荐工作流
    'Suggested workflows': '建議的工作流程',
    'Based on your tech stack': '根據你的技術堆疊',
    'More workflows': '更多工作流程',

    // 引用此存储库
    'Cite this repository': '引用此儲存庫',
    'If you use this software in your work, please cite it using the following metadata.':
      '如果你在工作中使用此軟體，請使用下列中繼資料引用。',
    'Learn more about CITATION files.': '瞭解 CITATION 檔案。',
    Citations: '引文格式',
    'APA citation': 'APA 引文',
    'BibTeX citation': 'BibTeX 引文',
    'View citation file': '查看 CITATION 檔案',
    'Something went wrong loading citation data.': '載入引文資料時發生錯誤。',

    // 特殊存储库（个人资料自述文件）：<owner/repo> 是特殊儲存庫。
    'is special.': '是特殊儲存庫。',
    'is now a special repository.': '現在是特殊儲存庫。',
    'is a special repository.': '是特殊儲存庫。',
    // 如果你 <將此儲存庫設為公開>，其 <README.md> 將顯示在你的個人檔案中。（整句由 inline 处理，此为未拼成整句时的片段）
    'make this a public repository': '將此儲存庫設為公開',
    'will appear on your profile.': '將顯示在你的個人檔案中。',
    'will appear on your public profile.': '將顯示在你的公開個人檔案中。',
    'will appear on the organization’s profile.': '將顯示在組織資料中。',
    "will appear on the organization's profile.": '將顯示在組織資料中。',
    // 建立 <README.md> 後將顯示在組織資料中。（and it 原文无逗号，译文作“後”）
    'and it will appear on the organization’s profile.': '後將顯示在組織資料中。',
    "and it will appear on the organization's profile.": '後將顯示在組織資料中。',
    'Update now': '立即更新',
    'Share to Profile': '分享到個人檔案',
    'Visit profile': '造訪個人檔案'
  },
  scoped: {
    // About（Activity 由 common-ui 收录；编辑按钮的 aria-label 保持原文，见 core/ignore 的 KEEP_ORIGINAL_ATTRIBUTES）
    Website: '網站',
    'Custom properties': '自訂屬性',
    // 计数：<strong>2.4k</strong> stars
    star: '顆星',
    stars: '顆星',
    Watchers: '關注者',
    watching: '位關注者',
    fork: '個分叉',
    forks: '個分叉',
    // 侧栏分节（Configure 由 common-ui 收录）；部署状态与 actions 词典一致
    Latest: '最新',
    'Create a new release': '建立新發行版本',
    'Used by': '採用者',
    Deployments: '部署',
    Environments: '環境',
    inactive: '非作用中',
    queued: '已排入佇列',
    'Set up': '設定',
    Other: '其他',
    // 特殊存储库提示的句首片段
    'If you': '如果你',
    ', its': '，其',
    Its: '其',
    The: '該',
    'Create a': '建立',
    'Edit README': '編輯讀我檔案'
  },
  regexp,
  // 特殊存储库提示（SidebarConfigCallToAction）：如果你 <將此儲存庫設為公開>，其 <README.md> 將顯示在你的個人檔案中。
  // 整句命中后中文与链接之间不留空白，元素文字照常翻译；未命中时按上面的句首片段逐段翻译
  inline: [['If you {}, its {} will appear on your profile.', '如果你{}，其 {} 將顯示在你的個人檔案中。']],
  ignore: [
    // 软件包分节：软件包名
    '[class*="packageItem__"] > a',
    // 部署分节：环境名（如 Preview、Release 会被当成界面文字）
    '[class*="envItem__"] > a',
    // 语言分节：复刻存储库的语言条目不带链接，不在全局忽略范围，语言名会被当成界面文字（如 Reason、Move、Logos）；
    // 非复刻存储库只有 Other 不带链接，仍需翻译，所以按页头 meta 只在复刻存储库忽略
    'head:has(> meta[name="octolytics-dimension-repository_is_fork"][content="true"]) ~ body [class*="languageItem__"] > [itemprop="keywords"]'
  ]
} satisfies PageDictionary
