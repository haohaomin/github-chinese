import type { PageDictionary, RegExpRule } from '../../core/types'

/** GitHub 登录名（机器人带 [bot] 后缀） */
const LOGIN = '[A-Za-z0-9][A-Za-z0-9-]*(?:\\[bot\\])?'
/** 逗号分隔的登录名列表：a, b, c */
const LOGIN_LIST = `${LOGIN}(?:, ${LOGIN})*`
/** 存储库全名：owner/repo */
const REPO = '[\\w.-]+\\/[\\w.-]+'

/** a, b, c → a、b、c */
function joinLogins(list: string): string {
  return list.split(', ').join('、')
}

/** 发布表单提交失败的原因：There was an error creating your Release: tag name can't be blank, … */
const RELEASE_ERRORS: Readonly<Record<string, string>> = {
  "tag name can't be blank": '標記名稱不可空白',
  'tag name can’t be blank': '標記名稱不可空白',
  'tag name is not well-formed': '標記名稱格式不正確',
  'published releases must have a valid tag': '已發布的發行版本必須有有效的標記'
}
const RELEASE_ERROR_SOURCE = Object.keys(RELEASE_ERRORS).join('|')
const RELEASE_ERROR_LIST_SOURCE = `(?:${RELEASE_ERROR_SOURCE})(?:, (?:${RELEASE_ERROR_SOURCE}))*`

/** 逗号分隔的失败原因 → 译文，以中文逗号连接 */
function joinReleaseErrors(list: string): string {
  return list
    .split(', ')
    .map(reason => RELEASE_ERRORS[reason] ?? reason)
    .join('，')
}

const regexp: readonly RegExpRule[] = [
  // 屏幕阅读器标题：Releases: octo-org/hello-world
  [new RegExp(`^Releases: (${REPO})$`), '發行版本：$1'],
  [new RegExp(`^Tags: (${REPO})$`), '標記：$1'],
  // 隐藏的页面标题（无刷新导航时用于更新标签页标题）
  [
    new RegExp(`^(Releases|Tags) · (${REPO})$`),
    (_, page: string, repo: string) => `${page === 'Releases' ? '發行版本' : '標記'} · ${repo}`
  ],
  // 标签页标题段：Release v3.5.0（只处理以版本号命名的发行版）
  [/^Release (v?\d[\w.+-]*)$/, '發行版本 $1'],
  // 发行版头部：<959 個提交> 在此發行版本之後進入 main
  [/^to (\S+) since this release$/, '在此發行版本之後進入 $1'],
  // 资产
  [/^Show all (\d+) assets$/, '顯示全部 $1 個資產'],
  [/^Copy to clipboard digest for (.+)$/, '將 $1 的摘要複製到剪貼簿'],
  [/^Remove attached binary (\S+)$/, '移除附加的二進位檔 $1'],
  // 贡献者：a and b / a, b, and 8 other contributors / a, b, and c
  [new RegExp(`^(${LOGIN}) and (${LOGIN})$`), '$1 和 $2'],
  [
    new RegExp(`^(${LOGIN_LIST}), and (\\d+) other contributors?$`),
    (_, list: string, count: string) => `${joinLogins(list)} 和另外 ${count} 位貢獻者`
  ],
  [new RegExp(`^(${LOGIN_LIST}), and (${LOGIN})$`), (_, list: string, last: string) => `${joinLogins(list)} 和 ${last}`],
  // 标记页：切换提交消息按钮的提示
  [/^Toggle (.+?)['’]s commit message$/, '切換 $1 的提交訊息'],
  // 编辑 / 删除按钮的无障碍名称
  [/^Edit: (\S.*)$/, '編輯：$1'],
  [/^Delete: (\S.*)$/, '刪除：$1'],
  // 编辑页标题：Edit <标记名>
  [/^Edit (\S+)$/, '編輯 $1'],
  // 删除发行版确认
  [/^This will delete the information for the release (\S+)\.$/, '這將刪除發行版本 $1 的資訊。'],
  // 搜索无结果
  [/^There are no releases containing ["“](.+)["”]\.$/, '沒有包含「$1」的發行版本。'],
  // 发布表单：标记选择
  [/^(\S+) will be created on publish$/, '$1 將在發布時建立'],
  [/^(\S+) is used by another release$/, '$1 已用於其他發行版本'],
  [/^(\S+) is used by an immutable release and cannot be reused$/, '$1 已用於不可變發行版本且無法重複使用'],
  // 发布表单：标记与上一个标记按钮的无障碍名称（未选择时为 Tag: Select tag、Previous tag: Auto）
  [/^Tag: (\S.*)$/, '標記：$1'],
  [/^Previous tag: (\S.*)$/, '上一個標記：$1'],
  // 发布表单：提交失败
  [
    new RegExp(`^There was an error creating your Release: (${RELEASE_ERROR_LIST_SOURCE})\\.$`),
    (_, list: string) => `建立發行版本時發生錯誤：${joinReleaseErrors(list)}。`
  ]
]

/**
 * 页面类型 releases：发行版列表与详情（/releases、/releases/tag/<标记>）、标记页（/tags）、
 * 新建 / 编辑发行版表单（/releases/new、/releases/edit/<标记>）、删除确认、空状态。
 * 发行说明正文（Markdown）、反应、通用按钮由其它词典处理。
 */
export default {
  static: {
    // 页头与导航
    'Releases and Tags': '發行版本和標記',
    'Releases and tags': '發行版本和標記',
    'Releases and tags navigation': '發行版本和標記導覽',
    'Releases results': '發行版本結果',
    'Tags results': '標記結果',
    'On this page': '本頁內容',
    'Find a release': '尋找發行版本',
    'Draft a new release': '草擬新發行版本',
    'Release list': '發行版本清單',
    'Release list navigation': '發行版本清單導覽',
    'Release list pagination': '發行版本清單分頁',
    'Jump to release': '跳至發行版本',
    'Choose a tag to compare': '選擇要比較的標記',

    // 空状态与搜索
    'There aren’t any releases here': '尚無發行版本',
    "There aren't any releases here": '尚無發行版本',
    // …供其他人使用。發行版本的詳細資訊請參閱 <說明文件>（末句原文无逗号，译文不加）
    'You can create a release to package software, along with release notes and links to binary files, for other people to use. Learn more about releases in':
      '你可以建立發行版本來封裝軟體，並附上版本資訊和二進位檔案連結，供其他人使用。發行版本的詳細資訊請參閱',
    'our docs': '說明文件',
    // 發行版本是以 <標記儲存庫歷史記錄中的特定時間點> 為基礎。很適合用來標記發行時間點如 <v0.2.0> 或 <v1.0.0>。（原文无逗号，译文不加）
    'Releases are powered by': '發行版本是以',
    'tagging specific points of history': '標記儲存庫歷史記錄中的特定時間點',
    'in a repository. They’re great for marking release points like': '為基礎。很適合用來標記發行時間點如',
    "in a repository. They're great for marking release points like": '為基礎。很適合用來標記發行時間點如',
    'No releases found': '找不到發行版本',

    // 发行版卡片与详情：<用户> 發布於 <时间>
    'released this': '發布於',
    'tagged this': '標記於',
    'drafted this': '草擬於',
    // 不可變 <發行版本。只能修改發行版本標題和版本資訊。>
    Immutable: '不可變',
    'release. Only release title and notes can be modified.': '發行版本。只能修改發行版本標題和版本資訊。',
    'Verified commit signature': '已驗證的提交簽章',
    // 签名标记的验证弹层：此標記使用標記者的 <已驗證簽章>.
    'This tag was signed with the tagger’s': '此標記使用標記者的',
    "This tag was signed with the tagger's": '此標記使用標記者的',
    'This tag was signed with the committer’s': '此標記使用提交者的',
    "This tag was signed with the committer's": '此標記使用提交者的',
    Assets: '資產',
    'Release attestation': '發行版本證明',
    Downloads: '下載',
    // 源代码存档（“Source code”与“(zip)”分属两个节点时，只翻译前者）
    'Source code (zip)': '原始碼 (zip)',
    'Source code (tar.gz)': '原始碼 (tar.gz)',
    'Edit release': '編輯發行版本',
    'Delete release': '刪除發行版本',
    'Create release': '建立發行版本',

    // 标记页
    'Toggle commit message': '切換提交訊息',
    'Delete tag': '刪除標記',

    // 删除确认与提示
    'Delete this release?': '刪除此發行版本？',
    'Are you sure you want to delete this release?': '確定要刪除此發行版本嗎？',
    'This will delete the information for this release.': '這將刪除此發行版本的資訊。',
    // 這將刪除發行版本 <v1.0>（标记名在单独的元素中时）
    'This will delete the information for the release': '這將刪除發行版本',
    'Delete this release': '刪除此發行版本',
    'Delete tag?': '刪除標記？',
    'Delete this tag?': '刪除此標記？',
    'This will delete the information for this tag and cannot be undone.': '這將刪除此標記的資訊且無法復原。',
    // 這將刪除標記 <v1.0> 的資訊且無法復原。（原文无逗号，译文不加）
    'This will delete the information for the tag': '這將刪除標記',
    'and cannot be undone.': '的資訊且無法復原。',
    'I understand, delete this tag': '我瞭解，刪除此標記',
    'Delete this tag': '刪除此標記',
    'Your tag was removed': '標記已移除',
    'Your release was removed': '發行版本已移除',

    // 草稿（原文无逗号，译文改语序不加）
    'This is a draft and won’t be seen by the public unless it’s published.': '這是發布前不會公開的草稿。',
    "This is a draft and won't be seen by the public unless it's published.": '這是發布前不會公開的草稿。',
    'This is a draft and won’t be seen by the public unless it is published': '這是發布前不會公開的草稿',
    'Discard draft': '捨棄草稿',
    'This will delete the information for this draft.': '這將刪除此草稿的資訊。',
    'Delete this draft': '刪除此草稿',

    // 发布表单：标题与标记
    'New release': '新增發行版本',
    'New Release': '新增發行版本',
    'Release notes': '版本資訊',
    'Choose a tag': '選擇標記',
    'Find or create a new tag': '尋找或建立新標記',
    'Search or create a new tag': '搜尋或建立新標記',
    'Tag:': '標記：',
    'Select tag': '選擇標記',
    'Tag: Select tag': '標記：選擇標記',
    'Create new tag:': '建立新標記：',
    // 建立新標記：<v1.0> 於發布時
    'on publish': '於發布時',
    'Choose an existing tag, or create a new tag on publish': '選擇現有標記，或在發布時建立新標記',
    'Choose an existing tag, or create a new tag when you publish this release.': '選擇現有標記，或在發布此發行版本時建立新標記。',
    'Loading tag information…': '正在載入標記資訊…',
    'Loading tag information...': '正在載入標記資訊...',
    'Existing tag': '現有標記',
    'Duplicate tag name': '標記名稱重複',
    // 此標記已有版本資訊。是否要 <加以編輯？>
    'This tag already has release notes. Would you like to': '此標記已有版本資訊。是否要',
    'edit them?': '加以編輯？',
    'edit the existing notes': '編輯現有的版本資訊',
    'Invalid tag name': '標記名稱無效',
    'We weren’t able to create the release for you. Make sure you have a valid tag.': '無法建立發行版本。請確認標記有效。',
    "We weren't able to create the release for you. Make sure you have a valid tag.": '無法建立發行版本。請確認標記有效。',
    'We can’t create a tag with this name. Take a look at the suggestions in the sidebar for example tag names.':
      '無法使用此名稱建立標記。標記名稱範例請參閱側邊欄中的建議。',
    "We can't create a tag with this name. Take a look at the suggestions in the sidebar for example tag names.":
      '無法使用此名稱建立標記。標記名稱範例請參閱側邊欄中的建議。',
    'Excellent! This tag will be created from the target when you publish this release.': '很好！發布此發行版本時將從目標建立此標記。',
    // 新建标记对话框（标记选择器）
    'Tag cannot be blank': '標記不可空白',
    'Contains invalid characters. Use safe special characters ., -, or _ instead': '包含無效字元。請改用安全的特殊字元 .、- 或 _',
    // 「X. Please try again.」句号随原文（与 pulls、common-ui 一致）
    'Unable to validate tag name. Please try again.': '無法驗證標記名稱。請再試一次。',
    'Creating a tag with the same name as a branch can cause ambiguity when selecting refs':
      '建立與分支同名的標記可能會在選擇參考時造成混淆',
    // 发布表单：标记与分支同名、标记曾用于不可变发行版
    'Branch with this tag name already exists': '已有與此標記同名的分支',
    'Creating a tag with the same name as a branch can cause ambiguity when selecting refs. The tag will still be created when this release is published.':
      '建立與分支同名的標記可能會在選擇參考時造成混淆。發布此發行版本時仍會建立此標記。',
    'Tag name unavailable': '標記名稱無法使用',
    'Tags previously bound to immutable releases can never be reused.': '曾與不可變發行版本綁定的標記永遠無法重複使用。',

    // 发布表单：目标
    'Target:': '目標：',
    'Pick a branch or recent commit': '選擇分支或最近的提交',
    'Filter branches…': '篩選分支…',
    'Filter branches...': '篩選分支...',
    'Filter recent commits…': '篩選最近的提交…',
    'Filter recent commits...': '篩選最近的提交...',
    'Recent Commits': '最近的提交',
    'Recent commits': '最近的提交',

    // 发布表单：标题、说明与上一个标记
    'Release title': '發行版本標題',
    'Enter release title': '輸入發行版本標題',
    'Previous tag:': '上一個標記：',
    'Previous tag': '上一個標記',
    'Previous tag: Auto': '上一個標記：自動',
    'Select previous tag to compare': '選擇要比較的上一個標記',
    'Find previous tag': '尋找上一個標記',
    'Generate release notes': '產生版本資訊',
    'Select a previous tag to create generated release notes': '選擇上一個標記以產生版本資訊',
    'Select a valid tag to automatically add the Markdown for all the merged pull requests from this diff and contributors of this release':
      '選擇有效的標記以自動加入此差異中所有已合併拉取請求和此發行版本貢獻者的 Markdown',
    'Automatically add the Markdown for all the merged pull requests from this diff and contributors of this release':
      '自動加入此差異中所有已合併拉取請求和此發行版本貢獻者的 Markdown',
    'Clear existing notes to automatically add the Markdown for all the merged pull requests from this diff and contributors of this release':
      '清除現有的版本資訊以自動加入此差異中所有已合併拉取請求和此發行版本貢獻者的 Markdown',
    'There were no pull requests associated with the commits included in this release.': '此發行版本包含的提交沒有關聯的拉取請求。',
    'Describe this release': '描述此發行版本',
    'Release description': '發行版本描述',

    // 发布表单：附加二进制文件
    'Attach binaries by dropping them here or selecting them.': '將二進位檔拖放到這裡或選取檔案以附加。',
    'Attach binaries by dropping them here or selecting them': '將二進位檔拖放到這裡或選取檔案以附加',
    'Uploading your release now…': '正在上傳發行版本…',
    'Uploading your release now...': '正在上傳發行版本...',
    'Uploading your file now…': '正在上傳檔案…',
    'Uploading your file now...': '正在上傳檔案...',
    'Remove attached binary': '移除附加的二進位檔',
    'Change this file’s name': '變更此檔案的名稱',
    "Change this file's name": '變更此檔案的名稱',
    'An attachment with that filename already exists.': '已有相同檔名的附件。',
    'Try a different file.': '請改用其他檔案。',
    'Try another file.': '請改用其他檔案。',
    'Too many assets. Releases are limited to 1000 assets.': '資產過多。每個發行版本最多 1000 個資產。',
    'We don’t support that file type. Try zipping it.': '不支援此檔案類型。請嘗試壓縮成 ZIP 檔。',
    "We don't support that file type. Try zipping it.": '不支援此檔案類型。請嘗試壓縮成 ZIP 檔。',
    'Yowza, that’s a big file.': '檔案過大。',
    "Yowza, that's a big file.": '檔案過大。',
    // 檔案過大。<再試一次>並改用小於 2GB 的檔案。（与 code/edit.ts 的空文件提示同一写法；原文无逗号，译文不加）
    'with a file smaller than 2GB.': '並改用小於 2GB 的檔案。',
    'Upload failed. Delete and try uploading this file again.': '上傳失敗。請刪除後重新上傳此檔案。',
    // <文件名> 將被刪除
    'will be deleted': '將被刪除',

    // 发布表单：选项
    'Set as a pre-release': '設為發行前版本',
    'This release is labeled as non-production ready.': '此發行版本已標示為不適用於正式環境。',
    'This release will be labeled as non-production ready': '此發行版本將標示為不適用於正式環境',
    'This release will be labeled as non-production ready.': '此發行版本將標示為不適用於正式環境。',
    'Set as the latest release': '設為最新發行版本',
    'This release is labeled as the latest for this repository.': '此發行版本已標示為此儲存庫的最新發行版本。',
    'This release will be labeled as the latest for this repository.': '此發行版本將標示為此儲存庫的最新發行版本。',
    'Create a discussion for this release': '為此發行版本建立討論',
    'People will be able to leave comments and reactions on this release using Discussions.':
      '其他人將能透過討論對此發行版本留言和新增表情回應。',
    'Release label': '發行版本標籤',
    'Label release as non-production ready': '將發行版本標示為不適用於正式環境',
    'Label release as the latest for this repository': '將發行版本標示為此儲存庫的最新發行版本',

    // 发布表单：按钮与状态
    'Publish release': '發布發行版本',
    'Publishing…': '發布中…',
    'Publishing...': '發布中...',
    'Update release': '更新發行版本',
    'Saving release…': '正在儲存發行版本…',
    'Saving release...': '正在儲存發行版本...',
    'Save draft': '儲存草稿',
    'Saving draft failed. Try again?': '草稿儲存失敗。要再試一次嗎？',
    'A draft of this release has been saved!': '此發行版本的草稿已儲存！',
    'You can’t publish releases for an empty repository.': '無法為空的儲存庫發布發行版本。',
    "You can't publish releases for an empty repository.": '無法為空的儲存庫發布發行版本。',

    // 发布表单：侧边栏
    'Tagging suggestions': '標記建議',
    // 常見做法是在版本名稱前面加上字母 <v>。合適的標記名稱可以是 <v1.0.0> 或 <v2.3.4>。
    'It’s common practice to prefix your version names with the letter': '常見做法是在版本名稱前面加上字母',
    "It's common practice to prefix your version names with the letter": '常見做法是在版本名稱前面加上字母',
    '. Some good tag names might be': '。合適的標記名稱可以是',
    'If the tag isn’t meant for production use, add a pre-release version after the version name. Some good pre-release versions might be':
      '如果標記不是用於正式環境，請在版本名稱後面加上發行前版本號。合適的發行前版本號可以是',
    "If the tag isn't meant for production use, add a pre-release version after the version name. Some good pre-release versions might be":
      '如果標記不是用於正式環境，請在版本名稱後面加上發行前版本號。合適的發行前版本號可以是',
    'Semantic versioning': '語意化版本',
    'If you’re new to releasing software, we highly recommend to': '如果你是初次發布軟體，強烈建議',
    "If you're new to releasing software, we highly recommend to": '如果你是初次發布軟體，強烈建議',
    'learn more about semantic versioning.': '瞭解語意化版本。',
    'A newly published release will automatically be labeled as the latest release for this repository.':
      '新發布的發行版本會自動標示為此儲存庫的最新發行版本。',
    "If 'Set as the latest release' is unchecked, the latest release will be determined by higher semantic version and creation date.":
      '如果未勾選「設為最新發行版本」，最新發行版本將依較高的語意化版本和建立日期決定。',
    'Learn more about release settings.': '瞭解發行版本設定。',

    // 发布动作到市集（产品名译中文：GitHub Marketplace → GitHub 市集；原文无逗号，译文不加）
    'Release Action': '發布動作',
    'Publish this release to the GitHub Marketplace': '將此發行版本發布到 GitHub 市集',
    'Publish this Action to the GitHub Marketplace': '將此動作發布到 GitHub 市集',
    // 你必須先 <接受 GitHub 市集開發人員協議> 才能發布動作。
    'accept the GitHub Marketplace Developer Agreement': '接受 GitHub 市集開發人員協議',
    'before publishing an Action.': '才能發布動作。',
    'Your Action will be discoverable in the Marketplace and available in GitHub search.':
      '你的動作將可在市集中找到並出現在 GitHub 搜尋結果中。',
    'Your action.yml needs changes before it can be published.': '你的 action.yml 需要修改後才能發布。',
    'Everything looks good! You have all the required information.': '一切就緒！所需資訊皆已齊全。',
    // 两句原文用句号分开，译文不并成逗号句
    '- Name must be unique. Cannot match an existing action, user or organization name.':
      '- 名稱必須是唯一的。不得與現有的動作、使用者或組織名稱相同。',
    'A README exists.': '已有讀我檔案。',
    'Primary Category': '主要類別',
    'Another Category': '另一個類別',
    '— optional': '— 選填'
  },
  scoped: {
    'Pre-release': '發行前版本',
    'Source code': '原始碼',
    Notes: '版本資訊',
    // 自动生成的发行说明末尾的链接文字（位于 Markdown 正文内时不翻译）
    'Full Changelog': '完整變更記錄',
    // 新建标记对话框输入框的无障碍名称 Tag name 由 repository 词典按页面收录（作用域含 repository）
    // 签名弹层徽章（Verified、Unverified、Partially verified、Expired 由 common-ui 收录）
    Revoked: '已撤銷',
    // 发布表单
    Target: '目標',
    Auto: '自動',
    auto: '自動',
    'Additional settings': '其他設定',
    'Choose an option': '選擇選項',
    Icon: '圖示',
    Color: '顏色',
    // 发行说明编辑器的已保存回复为空：You can create one in your <a>settings</a>.（前段由 common-ui 翻译）
    settings: '設定',
    // 你必須先 <接受 GitHub 市集開發人員協議> 才能發布動作。
    'You must': '你必須先',
    // 讨论类别（category → 類別）；默认类别名与 discussions 词典同译
    'Category:': '類別：',
    Announcements: '公告',
    General: '一般',
    Ideas: '想法',
    Polls: '投票',
    'Q&A': '問與答',
    'Show and tell': '成果分享'
  },
  regexp,
  ignore: [
    // “跳至發行版本”菜单中的发行版名
    'a[href^="#release-"]'
  ]
} satisfies PageDictionary
