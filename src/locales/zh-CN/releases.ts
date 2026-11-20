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
  "tag name can't be blank": '标签名称不能为空',
  'tag name can’t be blank': '标签名称不能为空',
  'tag name is not well-formed': '标签名称格式不正确',
  'published releases must have a valid tag': '已发布的发行版必须有有效的标签'
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
  [new RegExp(`^Releases: (${REPO})$`), '发行版：$1'],
  [new RegExp(`^Tags: (${REPO})$`), '标签：$1'],
  // 隐藏的页面标题（无刷新导航时用于更新标签页标题）
  [new RegExp(`^(Releases|Tags) · (${REPO})$`), (_, page: string, repo: string) => `${page === 'Releases' ? '发行版' : '标签'} · ${repo}`],
  // 标签页标题段：Release v3.5.0（只处理以版本号命名的发行版）
  [/^Release (v?\d[\w.+-]*)$/, '发行版 $1'],
  // 发行版头部：<959 个提交> 在此发行版之后进入 main
  [/^to (\S+) since this release$/, '在此发行版之后进入 $1'],
  // 资产
  [/^Show all (\d+) assets$/, '显示全部 $1 个资产'],
  [/^Copy to clipboard digest for (.+)$/, '复制 $1 的摘要到剪贴板'],
  [/^Remove attached binary (\S+)$/, '删除附加的二进制文件 $1'],
  // 贡献者：a and b / a, b, and 8 other contributors / a, b, and c
  [new RegExp(`^(${LOGIN}) and (${LOGIN})$`), '$1 和 $2'],
  [
    new RegExp(`^(${LOGIN_LIST}), and (\\d+) other contributors?$`),
    (_, list: string, count: string) => `${joinLogins(list)} 和另外 ${count} 个贡献者`
  ],
  [new RegExp(`^(${LOGIN_LIST}), and (${LOGIN})$`), (_, list: string, last: string) => `${joinLogins(list)} 和 ${last}`],
  // 标签页：切换提交消息按钮的提示
  [/^Toggle (.+?)['’]s commit message$/, '切换 $1 的提交消息'],
  // 编辑 / 删除按钮的无障碍名称
  [/^Edit: (\S.*)$/, '编辑：$1'],
  [/^Delete: (\S.*)$/, '删除：$1'],
  // 编辑页标题：Edit <标签名>
  [/^Edit (\S+)$/, '编辑 $1'],
  // 删除发行版确认
  [/^This will delete the information for the release (\S+)\.$/, '这将删除发行版 $1 的信息。'],
  // 搜索无结果
  [/^There are no releases containing ["“](.+)["”]\.$/, '没有包含“$1”的发行版。'],
  // 发布表单：标签选择
  [/^(\S+) will be created on publish$/, '$1 将在发布时创建'],
  [/^(\S+) is used by another release$/, '$1 已被其他发行版使用'],
  [/^(\S+) is used by an immutable release and cannot be reused$/, '$1 已被不可变发行版使用且无法再次使用'],
  // 发布表单：标签与上一个标签按钮的无障碍名称（未选择时为 Tag: Select tag、Previous tag: Auto）
  [/^Tag: (\S.*)$/, '标签：$1'],
  [/^Previous tag: (\S.*)$/, '上一个标签：$1'],
  // 发布表单：提交失败
  [
    new RegExp(`^There was an error creating your Release: (${RELEASE_ERROR_LIST_SOURCE})\\.$`),
    (_, list: string) => `创建发行版时出错：${joinReleaseErrors(list)}。`
  ]
]

/**
 * 页面类型 releases：发行版列表与详情（/releases、/releases/tag/<标签>）、标签页（/tags）、
 * 新建 / 编辑发行版表单（/releases/new、/releases/edit/<标签>）、删除确认、空状态。
 * 发行说明正文（Markdown）、反应、通用按钮由其它词典处理。
 */
export default {
  static: {
    // 页头与导航
    'Releases and Tags': '发行版和标签',
    'Releases and tags': '发行版和标签',
    'Releases and tags navigation': '发行版和标签导航',
    // 窄屏页头左侧按钮的提示
    'Open Releases and tags navigation': '打开发行版和标签导航',
    'Releases results': '发行版结果',
    'Tags results': '标签结果',
    'On this page': '本页内容',
    'Find a release': '查找发行版',
    'Draft a new release': '起草新发行版',
    'Release list': '发行版列表',
    'Release list navigation': '发行版列表导航',
    'Release list pagination': '发行版列表分页',
    'Jump to release': '跳转到发行版',
    'Choose a tag to compare': '选择要比较的标签',

    // 空状态与搜索
    'There aren’t any releases here': '暂无发行版',
    "There aren't any releases here": '暂无发行版',
    // …供他人使用。有关发行版的更多信息请参阅 <文档>（末句原文无逗号，译文不加）
    'You can create a release to package software, along with release notes and links to binary files, for other people to use. Learn more about releases in':
      '你可以创建发行版来打包软件，并附上发行说明和二进制文件链接，供他人使用。有关发行版的更多信息请参阅',
    'our docs': '文档',
    // 发行版通过 <给存储库历史记录中的特定节点打标签> 实现。适合标记发行节点如 <v0.2.0> 或 <v1.0.0>。（原文无逗号，译文不加）
    'Releases are powered by': '发行版通过',
    'tagging specific points of history': '给存储库历史记录中的特定节点打标签',
    'in a repository. They’re great for marking release points like': '实现。适合标记发行节点如',
    "in a repository. They're great for marking release points like": '实现。适合标记发行节点如',
    'No releases found': '未找到发行版',

    // 发行版卡片与详情：<用户> 发布于 <时间>
    'released this': '发布于',
    'tagged this': '打标签于',
    'drafted this': '起草于',
    // 不可变 <发行版。只能修改发行版标题和说明。>
    Immutable: '不可变',
    'release. Only release title and notes can be modified.': '发行版。只能修改发行版标题和说明。',
    'Verified commit signature': '已验证的提交签名',
    // 签名标签的验证弹层：此标签使用打标签者的 <已验证签名>.
    'This tag was signed with the tagger’s': '此标签使用打标签者的',
    "This tag was signed with the tagger's": '此标签使用打标签者的',
    'This tag was signed with the committer’s': '此标签使用提交者的',
    "This tag was signed with the committer's": '此标签使用提交者的',
    Assets: '资产',
    'Release attestation': '发行版证明',
    Downloads: '下载',
    // 源代码存档（“Source code”与“(zip)”分属两个节点时，只翻译前者）
    'Source code (zip)': '源代码 (zip)',
    'Source code (tar.gz)': '源代码 (tar.gz)',
    'Edit release': '编辑发行版',
    'Delete release': '删除发行版',
    'Create release': '创建发行版',

    // 标签页
    'Toggle commit message': '切换提交消息',
    'Delete tag': '删除标签',

    // 删除确认与提示
    'Delete this release?': '删除此发行版？',
    'Are you sure you want to delete this release?': '确定要删除此发行版吗？',
    'This will delete the information for this release.': '这将删除此发行版的信息。',
    // 这将删除发行版 <v1.0> 的信息（标签名在单独的元素中时）
    'This will delete the information for the release': '这将删除发行版',
    'Delete this release': '删除此发行版',
    'Delete tag?': '删除标签？',
    'Delete this tag?': '删除此标签？',
    'This will delete the information for this tag and cannot be undone.': '这将删除此标签的信息且无法撤销。',
    // 这将删除标签 <v1.0> 的信息且无法撤销。（原文无逗号，译文不加）
    'This will delete the information for the tag': '这将删除标签',
    'and cannot be undone.': '的信息且无法撤销。',
    'I understand, delete this tag': '我了解，删除此标签',
    'Delete this tag': '删除此标签',
    'Your tag was removed': '标签已删除',
    'Your release was removed': '发行版已删除',

    // 草稿（原文无逗号，译文改语序不加）
    'This is a draft and won’t be seen by the public unless it’s published.': '这是发布前不会公开的草稿。',
    "This is a draft and won't be seen by the public unless it's published.": '这是发布前不会公开的草稿。',
    'This is a draft and won’t be seen by the public unless it is published': '这是发布前不会公开的草稿',
    'Discard draft': '放弃草稿',
    'This will delete the information for this draft.': '这将删除此草稿的信息。',
    'Delete this draft': '删除此草稿',

    // 发布表单：标题与标签
    'New release': '新建发行版',
    'New Release': '新建发行版',
    'Release notes': '发行说明',
    'Choose a tag': '选择标签',
    'Find or create a new tag': '查找或创建新标签',
    'Search or create a new tag': '搜索或创建新标签',
    'Tag:': '标签：',
    'Select tag': '选择标签',
    'Tag: Select tag': '标签：选择标签',
    'Create new tag:': '创建新标签：',
    // 创建新标签：<v1.0> 于发布时
    'on publish': '于发布时',
    'Choose an existing tag, or create a new tag on publish': '选择现有标签，或在发布时创建新标签',
    'Choose an existing tag, or create a new tag when you publish this release.': '选择现有标签，或在发布此发行版时创建新标签。',
    'Loading tag information…': '正在加载标签信息…',
    'Loading tag information...': '正在加载标签信息...',
    'Existing tag': '现有标签',
    'Duplicate tag name': '标签名称重复',
    // 此标签已有发行说明。是否要 <编辑它们？>
    'This tag already has release notes. Would you like to': '此标签已有发行说明。是否要',
    'edit them?': '编辑它们？',
    'edit the existing notes': '编辑现有说明',
    'Invalid tag name': '标签名称无效',
    'We weren’t able to create the release for you. Make sure you have a valid tag.': '无法创建发行版。请确保标签有效。',
    "We weren't able to create the release for you. Make sure you have a valid tag.": '无法创建发行版。请确保标签有效。',
    'We can’t create a tag with this name. Take a look at the suggestions in the sidebar for example tag names.':
      '无法使用此名称创建标签。示例标签名称见侧边栏中的建议。',
    "We can't create a tag with this name. Take a look at the suggestions in the sidebar for example tag names.":
      '无法使用此名称创建标签。示例标签名称见侧边栏中的建议。',
    'Excellent! This tag will be created from the target when you publish this release.': '很好！发布此发行版时将基于目标创建此标签。',
    // 新建标签对话框（标签选择器）
    'Tag cannot be blank': '标签不能为空',
    'Contains invalid characters. Use safe special characters ., -, or _ instead': '包含无效字符。请改用安全的特殊字符 .、- 或 _',
    // 「X. Please try again.」句号随原文（与 pulls、common-ui 一致）
    'Unable to validate tag name. Please try again.': '无法验证标签名称。请重试。',
    'Creating a tag with the same name as a branch can cause ambiguity when selecting refs':
      '创建与分支同名的标签可能导致选择引用时产生歧义',
    // 发布表单：标签与分支同名、标签曾用于不可变发行版
    'Branch with this tag name already exists': '已存在与此标签同名的分支',
    'Creating a tag with the same name as a branch can cause ambiguity when selecting refs. The tag will still be created when this release is published.':
      '创建与分支同名的标签可能导致选择引用时产生歧义。发布此发行版时仍会创建该标签。',
    'Tag name unavailable': '标签名称不可用',
    'Tags previously bound to immutable releases can never be reused.': '曾用于不可变发行版的标签无法再次使用。',

    // 发布表单：目标
    'Target:': '目标：',
    'Pick a branch or recent commit': '选择分支或最近的提交',
    'Filter branches…': '筛选分支…',
    'Filter branches...': '筛选分支...',
    'Filter recent commits…': '筛选最近的提交…',
    'Filter recent commits...': '筛选最近的提交...',
    'Recent Commits': '最近的提交',
    'Recent commits': '最近的提交',

    // 发布表单：标题、说明与上一个标签
    'Release title': '发行版标题',
    'Enter release title': '输入发行版标题',
    'Previous tag:': '上一个标签：',
    'Previous tag': '上一个标签',
    'Previous tag: Auto': '上一个标签：自动',
    'Select previous tag to compare': '选择要比较的上一个标签',
    'Find previous tag': '查找上一个标签',
    'Generate release notes': '生成发行说明',
    'Select a previous tag to create generated release notes': '选择上一个标签以生成发行说明',
    'Select a valid tag to automatically add the Markdown for all the merged pull requests from this diff and contributors of this release':
      '选择有效标签以自动添加此差异中所有已合并拉取请求和此发行版贡献者的 Markdown',
    'Automatically add the Markdown for all the merged pull requests from this diff and contributors of this release':
      '自动添加此差异中所有已合并拉取请求和此发行版贡献者的 Markdown',
    'Clear existing notes to automatically add the Markdown for all the merged pull requests from this diff and contributors of this release':
      '清除现有说明以自动添加此差异中所有已合并拉取请求和此发行版贡献者的 Markdown',
    'There were no pull requests associated with the commits included in this release.': '此发行版包含的提交没有关联的拉取请求。',
    'Describe this release': '描述此发行版',
    'Release description': '发行版描述',

    // 发布表单：附加二进制文件
    'Attach binaries by dropping them here or selecting them.': '将二进制文件拖放到此处或选择文件以附加。',
    'Attach binaries by dropping them here or selecting them': '将二进制文件拖放到此处或选择文件以附加',
    'Uploading your release now…': '正在上传发行版…',
    'Uploading your release now...': '正在上传发行版...',
    'Uploading your file now…': '正在上传文件…',
    'Uploading your file now...': '正在上传文件...',
    'Remove attached binary': '删除附加的二进制文件',
    'Change this file’s name': '更改此文件的名称',
    "Change this file's name": '更改此文件的名称',
    'An attachment with that filename already exists.': '已存在同名附件。',
    'Try a different file.': '请换一个文件。',
    'Try another file.': '请换一个文件。',
    'Too many assets. Releases are limited to 1000 assets.': '资产过多。每个发行版最多 1000 个资产。',
    'We don’t support that file type. Try zipping it.': '不支持此文件类型。请尝试压缩为 ZIP。',
    "We don't support that file type. Try zipping it.": '不支持此文件类型。请尝试压缩为 ZIP。',
    'Yowza, that’s a big file.': '文件过大。',
    "Yowza, that's a big file.": '文件过大。',
    // 文件过大。<重试>并改用小于 2GB 的文件。（与 code/edit.ts 的空文件提示同一写法；原文无逗号，译文不加）
    'with a file smaller than 2GB.': '并改用小于 2GB 的文件。',
    'Upload failed. Delete and try uploading this file again.': '上传失败。请删除后重新上传此文件。',
    // <文件名> 将被删除
    'will be deleted': '将被删除',

    // 发布表单：选项
    'Set as a pre-release': '设为预发行版',
    'This release is labeled as non-production ready.': '此发行版已标记为非生产就绪。',
    'This release will be labeled as non-production ready': '此发行版将标记为非生产就绪',
    'This release will be labeled as non-production ready.': '此发行版将标记为非生产就绪。',
    'Set as the latest release': '设为最新发行版',
    'This release is labeled as the latest for this repository.': '此发行版已标记为此存储库的最新发行版。',
    'This release will be labeled as the latest for this repository.': '此发行版将标记为此存储库的最新发行版。',
    'Create a discussion for this release': '为此发行版创建讨论',
    'People will be able to leave comments and reactions on this release using Discussions.':
      '其他人可以通过讨论对此发行版发表评论和添加反应。',
    'Release label': '发行版标签',
    'Label release as non-production ready': '将发行版标记为非生产就绪',
    'Label release as the latest for this repository': '将发行版标记为此存储库的最新发行版',

    // 发布表单：按钮与状态
    'Publish release': '发布发行版',
    'Publishing…': '发布中…',
    'Publishing...': '发布中...',
    'Update release': '更新发行版',
    'Saving release…': '正在保存发行版…',
    'Saving release...': '正在保存发行版...',
    'Save draft': '保存草稿',
    'Saving draft failed. Try again?': '保存草稿失败。是否重试？',
    'A draft of this release has been saved!': '此发行版的草稿已保存！',
    'You can’t publish releases for an empty repository.': '无法为空存储库发布发行版。',
    "You can't publish releases for an empty repository.": '无法为空存储库发布发行版。',

    // 发布表单：侧边栏
    'Tagging suggestions': '标签建议',
    // 通常在版本名称前加上字母 <v>。合适的标签名称如 <v1.0.0> 或 <v2.3.4>。
    'It’s common practice to prefix your version names with the letter': '通常在版本名称前加上字母',
    "It's common practice to prefix your version names with the letter": '通常在版本名称前加上字母',
    '. Some good tag names might be': '。合适的标签名称如',
    'If the tag isn’t meant for production use, add a pre-release version after the version name. Some good pre-release versions might be':
      '如果标签不用于生产环境，请在版本名称后添加预发行版本号。合适的预发行版本号如',
    "If the tag isn't meant for production use, add a pre-release version after the version name. Some good pre-release versions might be":
      '如果标签不用于生产环境，请在版本名称后添加预发行版本号。合适的预发行版本号如',
    'Semantic versioning': '语义化版本',
    'If you’re new to releasing software, we highly recommend to': '如果你是初次发布软件，强烈建议',
    "If you're new to releasing software, we highly recommend to": '如果你是初次发布软件，强烈建议',
    'learn more about semantic versioning.': '了解语义化版本。',
    'A newly published release will automatically be labeled as the latest release for this repository.':
      '新发布的发行版将自动标记为此存储库的最新发行版。',
    "If 'Set as the latest release' is unchecked, the latest release will be determined by higher semantic version and creation date.":
      '如果未勾选“设为最新发行版”，最新发行版将根据更高的语义化版本和创建日期确定。',
    'Learn more about release settings.': '了解发行版设置。',

    // 发布操作到市场（产品名译中文：GitHub Marketplace → GitHub 市场；原文无逗号，译文不加）
    'Release Action': '发布操作',
    'Publish this release to the GitHub Marketplace': '将此发行版发布到 GitHub 市场',
    'Publish this Action to the GitHub Marketplace': '将此操作发布到 GitHub 市场',
    // 你必须先 <接受 GitHub 市场开发人员协议> 才能发布操作。
    'accept the GitHub Marketplace Developer Agreement': '接受 GitHub 市场开发人员协议',
    'before publishing an Action.': '才能发布操作。',
    'Your Action will be discoverable in the Marketplace and available in GitHub search.':
      '你的操作将可在市场中被发现并出现在 GitHub 搜索结果中。',
    'Your action.yml needs changes before it can be published.': '你的 action.yml 需要修改后才能发布。',
    'Everything looks good! You have all the required information.': '一切就绪！所需信息已齐全。',
    // 两句原文用句号分开，译文不并成逗号句
    '- Name must be unique. Cannot match an existing action, user or organization name.':
      '- 名称必须唯一。不能与现有操作、用户或组织名称相同。',
    'A README exists.': '已有自述文件。',
    'Primary Category': '主要类别',
    'Another Category': '其他类别',
    '— optional': '— 可选'
  },
  scoped: {
    'Pre-release': '预发行版',
    // 经典反应选择器的 aria-label（与拉取请求页同译）
    heart: '爱心',
    rocket: '火箭',
    eyes: '眼睛',
    'Source code': '源代码',
    Notes: '说明',
    // 自动生成的发行说明末尾的链接文字（位于 Markdown 正文内时不翻译）
    'Full Changelog': '完整更新日志',
    // 新建标签对话框输入框的无障碍名称 Tag name 由 repository 词典按页面收录（作用域含 repository）
    // 签名弹层徽章（Verified、Unverified、Partially verified、Expired 由 common-ui 收录）
    Revoked: '已撤销',
    // 发布表单
    Target: '目标',
    Auto: '自动',
    auto: '自动',
    'Additional settings': '其他设置',
    'Choose an option': '选择一项',
    Icon: '图标',
    Color: '颜色',
    // 发行说明编辑器的已保存回复为空：You can create one in your <a>settings</a>.（前段由 common-ui 翻译）
    settings: '设置',
    // 你必须先 <接受 GitHub 市场开发人员协议> 才能发布操作。
    'You must': '你必须先',
    // 讨论类别（category → 类别）；默认类别名与 discussions 词典同译
    'Category:': '类别：',
    Announcements: '公告',
    General: '常规',
    Ideas: '想法',
    Polls: '投票',
    'Q&A': '问答',
    'Show and tell': '展示与分享'
  },
  regexp,
  ignore: [
    // “跳转到发行版”菜单中的发行版名
    'a[href^="#release-"]'
  ]
} satisfies PageDictionary
