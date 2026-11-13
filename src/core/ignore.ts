/**
 * 忽略规则：这些区域内的文本属于用户内容或代码，不翻译。
 * - 只忽略整块都是用户内容的元素；含界面文字的容器改为命中其中的内容元素。
 * - 选择器不要依赖会被翻译的祖先属性（aria-label、title 等），翻译后会失配。
 * - 不要命中 relative-time 等时间元素或包含它们的容器，时间由引擎单独翻译。
 * - 优先用 data-testid、itemprop、data-component、href 等语义特征；
 *   React 哈希类名只用前缀匹配：[class*="name__"]。
 * - 只在某类页面出现的规则，优先放进对应词典的 ignore。
 */

/** 跳过子树的标签（大写）；元素自身的可翻译属性仍处理 */
export const IGNORE_TAGS: ReadonlySet<string> = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEMPLATE',
  'TEXTAREA',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
  'VAR',
  'SVG',
  'MATH',
  'CANVAS',
  'IFRAME',
  'OBJECT'
])

/**
 * 跳过标签的放行选择器：命中的元素不按标签跳过，照常遍历子树（子树内再命中忽略规则、跳过标签的仍跳过）。
 * 只写 IGNORE_TAGS 中的标签；放行的元素仍是重新进入区域的边界
 */
export const SKIP_TAG_RELEASE_SELECTORS: readonly string[] = [
  // 提交详情页头：1 parent <sha> commit <sha>（<pre> 只为保留 flex 子项间的空格）
  '[class*="commitBranchContainer__"] > pre',
  // 个人主页活动概览雷达图：标签是界面文字，脚本一次性绘制
  'svg.js-activity-overview-graph'
]

/** 通用退出标记：其内不翻译，重新进入区域也不越过 */
export const EXIT_SELECTORS: readonly string[] = [
  '[translate="no"]',
  '.notranslate',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[data-gcn-ignore]'
]

/**
 * 退出标记用到的属性（class 除外）：引擎观察其变化，元素因此进入忽略区域时还原其中的译文。
 * class 变化太频繁，不观察；由类名决定的忽略（.notranslate、全局与词典的类名规则）在遍历到时才生效
 */
export const EXIT_ATTRIBUTES: readonly string[] = ['translate', 'contenteditable', 'data-gcn-ignore']

/** 纯代码容器：只有代码行，不会有评审线程；重新进入区域不越过，也不在其中查找 */
export const CODE_CONTAINER_SELECTORS: readonly string[] = [
  '.blob-code',
  // 建议块的代码格只有 .blob-code-inner，GitHub 读取其文字生成提交
  '.blob-code-inner',
  '.blob-num',
  '.react-code-lines',
  '.react-code-text',
  '.react-file-line',
  '.js-file-line-container'
]

/**
 * 标签区域：议题标签的名称、说明所在的元素（都在全局忽略列表里，自定义标签名、说明是用户内容）。
 * 区域根（最外层的忽略区域）命中这些选择器、自身不是退出标记时，根里只有一段文字（可套在逐层只有一个元素的包装里，
 * 只有图标的元素不计）、或根里各个标签区域只有一段文字时，按文字所在的最内层标签区域分别匹配：名称区域整段是语言包
 * 名称表（PageDictionary.labels）的原文、说明区域整段是说明表（labelDescriptions）的原文或命中标签正则（labelRegexp）时
 * 照常翻译；其余保持原文、不记未翻译
 */
export const LABEL_NAME_SELECTORS: readonly string[] = [
  // 经典标签（贡献页的 span.IssueLabel 里另有标签链接与说明）、React 标签令牌
  '.IssueLabel',
  '[class*="prc-Token-IssueLabel-"] [class*="prc-Token-TokenTextContainer-"]',
  // 标签页列表行的标签链接（其中是标签令牌；屏幕阅读器读的行标题由 React 读出文字拼行的无障碍名称，不收）
  '[class*="labelRowDescription__"] a[aria-label]',
  // 标签选择器（议题与拉取请求侧栏、新建议题、批量操作、关注设置）中的标签名
  '[class*="labelNameText__"]'
]

/** 标签说明区域：经典标签的提示、React 侧栏标签链接的提示与屏幕阅读器说明、标签页列表行的说明 */
export const LABEL_DESCRIPTION_SELECTORS: readonly string[] = [
  'tool-tip[for^="label-"]',
  '[class*="labelDescriptionTooltip__"]',
  '[class*="labelLink__"] > .sr-only',
  '[class*="labelRowDescriptionItemDescription__"]'
]

/**
 * 星标列表名称区域：星标页的列表卡片标题、列表页标题，以及星标菜单（存储库页、星标页、列表页的星标按钮）里的
 * 列表名与预置建议项（列表名是用户内容）。菜单有三种：select-panel 版、旧版复选框菜单、React 版 SelectPanel
 * （选项的 data-id 为 list-<编号>）。处理同标签名称区域：整段是预置名称表（PageDictionary.listNames）的原文时
 * 照常翻译，其余保持原文、不记未翻译
 */
export const LIST_NAME_SELECTORS: readonly string[] = [
  '#profile-lists-container a h3',
  '#user-profile-frame .flex-justify-between > h1',
  '[data-target~="user-list-menu.listItems"] .ActionListItem-label',
  '.js-user-list-menu-item ~ .Truncate-text',
  '.js-user-list-menu-item ~ .Truncate > .Truncate-text',
  '[role="option"][data-id^="list-"] [data-component="ActionList.Item.Label"]'
]

/**
 * 议题类型名称区域：议题类型令牌（议题列表行、议题页标题区、侧栏、时间线）与议题页置顶标题栏里的类型名
 * （类型由组织定义，类型名是用户内容）。处理同标签名称区域：整段是默认类型名称表（PageDictionary.issueTypes）的原文时
 * 照常翻译，其余保持原文、不记未翻译
 */
export const ISSUE_TYPE_NAME_SELECTORS: readonly string[] = [
  '[class*="issueTypeTokenContainer__"] [class*="prc-Token-TokenTextContainer-"]',
  '[class*="smallMetadataRow__"] > [class*="smallToken__"]'
]

/**
 * 标签区域（名称区域与说明区域）、星标列表名称区域与议题类型名称区域：其中的默认标签、预置列表名、默认类型名照常翻译
 */
export const LABEL_SELECTORS: readonly string[] = [
  ...LABEL_NAME_SELECTORS,
  ...LABEL_DESCRIPTION_SELECTORS,
  ...LIST_NAME_SELECTORS,
  ...ISSUE_TYPE_NAME_SELECTORS
]

/** 全局忽略选择器：命中元素连同子树、属性都不处理 */
export const IGNORE_SELECTORS: readonly string[] = [
  ...EXIT_SELECTORS,

  // Markdown 渲染内容：README、议题 / 评论正文、Wiki、发行说明
  // （赞助档位上方的自定义金额提示也带这两个类，但文字由 GitHub 生成，不忽略）
  '.markdown-body:not(#sponsors-custom-amount-message)',
  '.markdown-title',
  '.comment-body:not(#sponsors-custom-amount-message)',

  // 代码与差异
  ...CODE_CONTAINER_SELECTORS,
  // 经典差异视图的差异表格外包着 div.highlight，表内插有行内评审线程；空文件显示界面文字 Empty file.
  '.highlight:not(.empty)',
  '.diff-table',

  // 提交信息
  '.commit-title',
  '.commit-desc',
  '.commit-message',
  '[data-testid="latest-commit-html"]',
  '.react-directory-commit-message',
  '[class*="commitMessage__"]',
  '[class*="commitMessageContainer__"]',
  '[class*="commitMessageText__"]',
  '[class*="commitHashLink__"]',
  // 活动页推送标题中的提交信息（删除分支时标题是界面文字 Deleted branch）
  '[data-testid="push-link"] > [class*="prc-Truncate-Truncate-"]',
  // 拉取请求文件页的提交选择菜单
  'a.select-menu-item[href*="/commits/"] .text-emphasized',
  // 检查运行页头部
  '.check-page-commit-message',

  // React 列表（ListView）条目标题：议题、拉取请求、提交、仓库、标签、工作流运行、证明列表的主体名
  // （照常翻译：GitHub 应用权限选择器里的权限名；证明详情摘要的字段名 Created、Commit 等，该列表含
  // attestation-relative-time 等 data-testid。条件写在祖先列表上：happy-dom 不支持 :not() 内的组合符）
  '[data-listview-component="items-list"]:not(:has([data-testid="attestation-relative-time"], [data-testid="attestation-commit-link"], [data-testid="view-build-summary"])) [data-listview-item-title-container] :is(h1, h2, h3, h4, h5, h6):not(react-partial[partial-name="integration-permission-selector"] *)',

  // 分支、标签名
  '[data-component="BranchName"]',
  '.commit-ref',
  '.branch-name',
  // 比较页：范围选择按钮、示例比较
  '.range-editor .css-truncate-target',
  'a.css-truncate-target[href*="/compare/"]',

  // 文件、目录名（合并显示的空目录路径只忽略路径片段，链接 title 是界面文字）
  '.react-directory-filename-cell a:not(:has([data-testid="path-name-segment"]))',
  '[data-testid="path-name-segment"]',
  '.PRIVATE_TreeView-item-content-text',
  '[data-testid="breadcrumbs-filename"]',
  '[data-testid="breadcrumbs-repo-link"]',
  // 查找文件结果
  '.tree-browser-result',
  // 差异文件头、拉取请求文件树
  '.file-info .Truncate-text',
  'file-tree .ActionList-item-label',
  '[data-filterable-item-text]',
  // 文件树名称截断时的悬停提示（Portal 渲染在树外）
  '[data-testid$="-item-tooltip"]',

  // 用户、团队、仓库等链接名（团队名与词条同名时也不翻译：拉取请求审查摘要的 on behalf of 后的团队列表）
  '.user-mention',
  '.author',
  'a[data-hovercard-type="user"]',
  'span[data-hovercard-type="user"]',
  'a[data-hovercard-type="organization"]',
  'a[data-hovercard-type="team"]',
  'a[data-hovercard-type="repository"]',
  'span[data-hovercard-type="repository"]',
  '[itemprop~="codeRepository"]',
  '[itemprop="description"]',
  '[data-testid="repo-name-wrapper"]',
  '[data-testid="actor-link"]',
  '[data-testid="issue-body-header-author"]',
  // 评论头部的作者（链接与无链接时的名称）
  '[data-testid="avatar-link"]',
  '[data-testid="avatar-name"]',
  '[class*="editorLogin__"]',
  'a.assignee',
  // 应用（机器人）账户名
  'a.text-bold[href^="/apps/"]',
  // 组织成员列表中的用户名
  '.member-list-item .css-truncate > .color-fg-default',

  // 个人资料
  '.vcard-fullname',
  '.vcard-username',
  '.user-profile-bio',
  '.vcard-detail .p-org',
  // 名片所在地（本地时间条目也用 .p-label，其中的时间差照常翻译）
  '.vcard-detail:not([itemprop="localTime"]) .p-label',
  // 组织资料头部的所在地（国家名已收入全站 static，不能把用户填的地点译掉）
  '[itemprop="location"]',
  '[itemprop="social"] > a.Link--primary',
  '.user-profile-mini-vcard strong',
  // 活动概览雷达图的说明：含用户名与日期（雷达图按 SKIP_TAG_RELEASE_SELECTORS 放行）
  'svg.js-activity-overview-graph > title',
  // 关注者 / 正在关注列表的简介（div）、公司与所在地（p）；赞助标签页同位置的 span 是赞助时间，照常翻译
  '#user-profile-frame .d-table-cell .color-fg-muted.text-small:not(span)',

  // 置顶仓库
  '.pinned-item-list-item-content .repo',
  '.pinned-item-list-item-content tool-tip',
  '.pinned-item-desc',

  // 置顶议题标题（链接 aria-label 含界面文字，只忽略标题文本）
  '[class*="titleOptionsContainer__"] a > span[data-component="Text"]',

  // 议题标签的名称、说明，星标列表名与议题类型名（默认标签、预置列表名、默认类型名照常翻译，见 LABEL_SELECTORS）
  ...LABEL_SELECTORS,
  // 星标菜单里的列表描述（预置列表没有默认描述）
  '[data-target~="user-list-menu.listItems"] .ActionListItem-description',
  '[role="option"][data-id^="list-"] [data-component="ActionList.Description"]',

  // 主题
  '.topic-tag',
  '[class*="prc-TopicTag-TopicTag-"]',
  'a[data-testid$="-topic-link"]',
  'a[href^="/topics/"] > p',
  'a[href^="/topics/"] h1',

  // 编程语言名（Other 为界面文字）
  '[itemprop="programmingLanguage"]',
  'a:not([href$="l=Other"]) > [itemprop="keywords"]',
  '#languages-menuitems a:not([href*="/unknown"]) .select-menu-item-text',

  // 仓库侧栏（React）：描述、发行版名、赞助者名（描述另按模块类名兜底，不依赖父级结构）
  '[class*="sidebarSection__"] > p[class*="description__"]',
  'p[class*="SidebarAbout-module__description"]',
  '[class*="releaseName__"]',
  '[class*="sponsorName__"]',

  // 发行版：标题、标签名、导航、资源文件名
  'a.Link--primary[href*="/releases/tag/"]',
  '[data-release-anchor] > h2',
  '.Box-body .flex-1 > h1.d-inline',
  'a[href*="/tree/"] > .css-truncate-target > .ml-1',
  'li[data-item-id^="release-"]',
  'a[href*="/releases/download/"]',

  // Actions：工作流名、作业名
  '[class*="MainContent__"] strong',
  '.PageHeader-parentLink > a[href*="/actions/workflows/"]',
  'a.Link--primary.d-block[href*="/actions/runs/"] > span:first-of-type',
  'a[data-component="NavList.Item"][href*="/job/"]',
  'a.Link--secondary[href*="/job/"]',
  '.SideNav-subItem[href*="/job/"]',
  '.SideNav-subItem[href*="check_run_id="]',
  'streaming-graph-job .css-truncate',
  '.jobName-truncation-tooltip',

  // 讨论：标题、分类分组名（分类名与“(category)”无障碍名称由 discussions 词典处理，不忽略）
  '.discussion-title',
  'li.ActionList-item--hasSubItem:has(a[href*="/discussions/categories/"]) > button .ActionList-item-label',

  // 趋势：仓库名与描述、开发者名、热门仓库、公司与所在地
  'article.Box-row > h2',
  'article.Box-row > p',
  'article.Box-row h1',
  'article.Box-row h1 + p',
  'article.Box-row article > h1 + .f6',
  'article.Box-row h4',
  'article.Box-row p.f6.mb-0',
  'article.Box-row .Truncate-text',
  // 探索、主题、集合页的仓库卡片与集合列表
  'article.border.rounded h3.lh-condensed',
  'article.border.rounded p.color-fg-muted.mb-0',
  'article h1.lh-condensed',
  'article.border > .ws-normal.color-fg-muted',
  'article.border-bottom > .col-10',

  // 搜索结果
  '.search-title a',
  '.search-match',

  // 查询框的高亮层与尺寸层：镜像输入框中的查询文字，翻译后与输入错位
  '.QueryBuilder-StyledInputContent',
  '.QueryBuilder-Sizer',
  '.styled-input-content',
  '.styled-input-container > div > [aria-hidden="true"]',
  '[data-testid="quick-search-input-overlay"]',
  // 查询框建议：url-result 标签是条目的 value（查询回显、跳转目标名称）
  '.QueryBuilder-ListWrap [data-type="url-result"] .ActionListItem-label',
  // 快速搜索的最近搜索、按原词搜索：名称即查询
  '[data-testid="quick-search-suggestion"][id*="-option-recent-"] [class*="suggestionName__"]',
  '[data-testid="quick-search-suggestion"][id*="-option-search-plain-"] [class*="suggestionName__"]',
  // 顶部搜索按钮显示当前查询时（占位提示含快捷键 kbd）
  '[class*="searchButton__"] [class*="placeholder__"]:not(:has(kbd))',
  // 评论框的自动补全建议（表情符号名、用户名、问题标题）：React 版建议项、经典版 text-expander 列表
  'li[role="option"][class*="suggestion__"]',
  'text-expander [role="listbox"]'
]

/**
 * 忽略区域里由 GitHub 写入的占位文字：区域根命中占位区域、自身不是退出标记、里面只有这一段文字时照常翻译。
 * - Markdown 编辑器的预览窗格（PLACEHOLDER_SELECTOR）：.markdown-body 里只有这一个文本节点。预览为空时是
 *   Nothing to preview，预览请求失败时是 Markdown preview unavailable（用户内容渲染后总有元素）；
 * - 经典评论框的预览区（CLASSIC_PREVIEW_SELECTOR）：脚本用 innerHTML 依次写入 <p>Loading preview…</p>、
 *   <p>Nothing to preview</p>，出错时写入 <p>Error rendering preview</p>。区域里只有这一个不带属性的段落
 *   （其余子节点只有空白文字）、段落里只有一个文本节点（用户内容的段落带 dir="auto"）。
 * 其他忽略区域（标题、描述、标签名等）里同样的文字是用户内容，保持原文
 */
export const PLACEHOLDER_TEXTS: ReadonlySet<string> = new Set([
  'Nothing to preview',
  'Markdown preview unavailable',
  'Loading preview…',
  'Error rendering preview'
])

/** 占位文字所在的区域根：Markdown 编辑器的预览窗格（带哈希类名，或屏幕阅读器播报区域）下的 .markdown-body */
export const PLACEHOLDER_SELECTOR = ['[class*="previewViewerWrapper__"] > .markdown-body', '[aria-live="polite"] > .markdown-body'].join(
  ', '
)

/** 占位段落所在的区域根：经典评论框（.js-previewable-comment-form）的预览区 .comment-body.markdown-body.js-preview-body */
export const CLASSIC_PREVIEW_SELECTOR = '.js-preview-body'

/** 重新进入区域的容器类：REENTRY_SELECTORS 的目标都是它的直接子元素，引擎先按类名找容器 */
export const REENTRY_CONTAINER_CLASS = 'js-suggested-changes-blob'

/**
 * 重新进入区域：忽略区域内由 GitHub 生成的界面块，照常翻译（其中再命中忽略规则的仍跳过）。
 * 用户 Markdown 中的 class 会被 GitHub 过滤，无法伪造。
 */
export const REENTRY_SELECTORS: readonly string[] = [
  // 评论中的建议块：标题栏与按钮区（代码表格在 .blob-wrapper 内）
  `.${REENTRY_CONTAINER_CLASS} > :not(.blob-wrapper)`
]

/** 需要翻译的属性 */
export const TRANSLATABLE_ATTRIBUTES: readonly string[] = [
  'aria-label',
  'placeholder',
  'title',
  'data-confirm',
  'data-disable-with',
  'data-copy-feedback',
  'label',
  // React 提示框的可见文字（伪元素 content: attr()）
  'data-visible-text',
  // 脚本交给原生 confirm 的确认文字
  'data-confirm-text',
  'data-confirm-cancel-text',
  'data-warn-unsaved-changes',
  // 表情回应建议：脚本复制到 data-reaction-suggestion-message 后由伪元素显示
  'data-reaction-markup'
]

/**
 * 保持原文的属性：其他扩展按英文属性值选择元素，找不到时会隐藏或改动页面。
 * [元素选择器, 属性名, 原文]：元素命中选择器、属性原文（规范化后）相同时不翻译，已翻译的还原。
 * 只收不显示在页面上的属性
 */
export const KEEP_ORIGINAL_ATTRIBUTES: readonly (readonly [selector: string, attribute: string, source: string])[] = [
  // Refined GitHub（clean-repo-sidebar）：About 标题里没有这个按钮时隐藏整个标题，编辑按钮随之消失
  ['button', 'aria-label', 'Edit repository metadata'],
  // Refined GitHub（show-names）：首页动态卡片里的用户名不加全名
  ['*', 'aria-label', 'card content'],
  // Refined GitHub（no-self-reference）：议题、拉取请求事件区里指向本页的链接不停用
  ['section', 'aria-label', 'Events']
]

/**
 * 镜像文字属性：Primer 用隐藏的粗体伪元素按其值预留宽度，值须随元素文字一起变。
 * 这两个属性另有非界面用途（JSON 数据、表情建议的筛选键），只处理白名单内、值与文字原文相同的元素。
 */
export const MIRROR_ATTRIBUTES: readonly string[] = ['data-content', 'data-text']

/** 镜像文字属性的白名单 */
export const MIRROR_SELECTOR = [
  '[data-component="text"][data-content]',
  '.UnderlineNav-item [data-content]',
  '.SegmentedControl-item .Button-label[data-content]',
  '[class*="SegmentedControl-Text"][data-text]'
].join(', ')

/** value 属性仅在这些 input 类型上翻译 */
export const BUTTON_INPUT_TYPES: ReadonlySet<string> = new Set(['button', 'submit', 'reset'])

/**
 * 属性规则另可改写的属性：value，只作用于 input。按钮类型照常（也查词典）；其余类型只改带 disabled 属性的
 * （GitHub 把默认值显示在禁用的输入框里，不会被编辑或随表单提交），只按规则改写，不查词典、不记未翻译，不再禁用时还原原文
 */
export const RULE_ONLY_ATTRIBUTES: readonly string[] = ['value']
