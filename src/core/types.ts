/**
 * 词典与翻译引擎的公共类型约定。
 *
 * 词典按页面类型（PageKey）分文件维护：
 * - static：精确匹配，所有页面生效（全局合并）
 * - scoped：精确匹配，仅所属页面类型生效，优先于 static
 *   （static / scoped 在构建产物中可能被压缩成字符串，运行时只经 core/table 的函数读取）
 * - regexp：正则规则，仅所属页面类型生效（common 的规则全局生效）
 * - ignore：额外忽略选择器，仅所属页面类型生效（common 的全局生效）
 * - attributeRules：按选择器限定的属性规则，仅所属页面类型生效（common 的全局生效）
 * - inline：被行内元素拆开的句子，仅所属页面类型生效（common 的全局生效）
 * - mergeText：整段合并文字的元素选择器，仅所属页面类型生效（common 的全局生效）
 * - labels：默认标签的名称，所有页面生效（全局合并），只用于标签名称区域（core/ignore 的 LABEL_NAME_SELECTORS）
 * - labelDescriptions：默认标签的说明，所有页面生效（全局合并），只用于标签说明区域（LABEL_DESCRIPTION_SELECTORS）
 * - labelRegexp：标签说明区域里说明表未命中时再试的正则，所有页面生效（全局合并），只用于标签说明区域
 * - listNames：星标列表的预置名称，所有页面生效（全局合并），只用于星标列表名称区域（LIST_NAME_SELECTORS）
 * - issueTypes：默认议题类型的名称，所有页面生效（全局合并），只用于议题类型名称区域（ISSUE_TYPE_NAME_SELECTORS）
 */

/** 正则替换函数：参数同 String.prototype.replace 的回调（不含 offset / input） */
export type RegExpReplacer = (match: string, ...groups: string[]) => string

/**
 * 正则规则：[匹配, 替换]。
 * 匹配对象是规范化后的整段文本；正则必须以 ^ 开头、$ 结尾，不得带 g / y / m / u / v 标志；
 * 顶层不得有 |，备选放进分组（^(?:a|b)$）。
 * 字符串替换支持 $1 等反向引用。
 */
export type RegExpRule = readonly [RegExp, string | RegExpReplacer]

/**
 * 属性规则：[选择器, 属性名, 匹配, 替换]。选择器命中的元素上，该属性的规范化原文按正则改写，
 * 命中后不再查词典、不记未翻译；替换结果与原文相同时保持原文。
 * 忽略区域的根元素自身也按规则处理（只改规则列出的属性），区域内的元素不处理。
 * 属性名限于可翻译属性（core/ignore 的 TRANSLATABLE_ATTRIBUTES）与 value（RULE_ONLY_ATTRIBUTES：只作用于 input，
 * 非按钮类型只改带 disabled 属性的，不再禁用时还原原文），正则约束同 RegExpRule。
 * 规则选择器、忽略选择器都不能依赖被改写的属性值：改写后会失配
 */
export type AttributeRule = readonly [selector: string, attribute: string, pattern: RegExp, replacement: string | RegExpReplacer]

/**
 * 行内句规则：[句型, 译文]。宿主的直接子节点中，每个元素是一个槽位，槽位之间的文字是一段。
 * 句型用 {} 标出槽位：{} 对应任一元素，{#} 只对应只含数字（可带千分位逗号）的叶子元素；{} 两侧的空白不计。
 * 字符串句型规范化后逐字匹配；正则句型的约束同 RegExpRule，槽位写作 \{\} / \{#\}（不要用捕获组匹配槽位：
 * 槽位两侧的空白不计，写在正则里的空格会失配）。
 * 译文用 {} 标出槽位，个数与句型相同（槽位元素位置不变，只改各段文字）；正则句型的字符串译文支持 $1、$<名称>、$&
 * 等替换写法，所引用内容中的槽位计入个数。
 * 宿主直接子节点超过 40 个、或句型键（各段文字连同槽位，去掉槽位两侧的空白）超过 300 字符时不按行内句处理
 * （MAX_SENTENCE_CHILDREN / MAX_SENTENCE_KEY）。整句命中后不再逐段查词典；未命中时照常逐段翻译
 */
export type InlineRule = readonly [pattern: string | RegExp, translation: string | RegExpReplacer]

export interface PageDictionary {
  /**
   * 全局精确匹配词条：规范化原文 → 译文。
   * 源码中写普通对象；运行时还可能是压缩串（构建产物，wxt build 与 wxt dev 相同）或合并表（mergeDictionaries），
   * 只能经 core/table 的函数读取
   */
  readonly static?: Readonly<Record<string, string>>
  /** 仅所属页面类型生效的精确匹配词条，优先于 static；运行时形态与读取方式同 static */
  readonly scoped?: Readonly<Record<string, string>>
  /** 仅所属页面类型生效的正则规则，按顺序尝试，首个命中生效 */
  readonly regexp?: readonly RegExpRule[]
  /** 仅所属页面类型生效的额外忽略选择器 */
  readonly ignore?: readonly string[]
  /** 仅所属页面类型生效的属性规则，先于词典，按顺序尝试，首个命中生效 */
  readonly attributeRules?: readonly AttributeRule[]
  /**
   * 仅所属页面类型生效的行内句规则：越具体的页面类型越优先。同一页面类型先查字符串句型
   * （对上的 {#} 越多越优先，同样多时先收录的生效），再按顺序试正则句型
   */
  readonly inline?: readonly InlineRule[]
  /**
   * 仅所属页面类型生效的整段合并选择器：元素内（含后代）的全部文字连成一段匹配，命中时译文写入第一个文本节点、
   * 其余置空；未命中时照常处理（与不声明时相同）。元素内有链接、按钮、表单控件、kbd、时间元素、跳过标签或忽略区域时照常处理。
   * 嵌套时从外到内，按第一个整段命中的元素处理
   */
  readonly mergeText?: readonly string[]
  /**
   * 默认标签（GitHub、Dependabot 预置）的名称，以及名称区域里 GitHub 写入的占位文字（新建标签的预览令牌）：
   * 规范化原文 → 译文，所有页面生效，同一原文先收录的生效。
   * 只在标签名称区域（core/ignore 的 LABEL_NAME_SELECTORS，都在忽略列表里）内使用：区域里只有一段文字（只有图标的元素不计）、
   * 整段（区分大小写）是表中的原文时写入译文，其余保持原文、不记未翻译；static / scoped / regexp 与自定义词条都不参与，
   * 区域外、说明区域里同样的文字不受影响。只经 core/table 的函数读取（同 static）
   */
  readonly labels?: Readonly<Record<string, string>>
  /**
   * 默认标签的说明：只在标签说明区域（LABEL_DESCRIPTION_SELECTORS）内使用，其余同 labels（名称区域里同样的文字不受影响）
   */
  readonly labelDescriptions?: Readonly<Record<string, string>>
  /**
   * 标签说明区域里说明表未命中时再试的正则（Dependabot 按生态生成的标签说明，生态名不定，无法逐条收进说明表）：
   * 所有页面生效，按语言包顺序尝试，首个命中生效；匹配对象同 labelDescriptions（规范化后的整段），约束同 RegExpRule。
   * 只用于标签说明区域，区域外同样的文字照常查 static / scoped / regexp
   */
  readonly labelRegexp?: readonly RegExpRule[]
  /**
   * 星标列表的预置名称（添加到列表菜单里 GitHub 建议的列表名，选中即按此名创建）：只在星标列表名称区域
   * （core/ignore 的 LIST_NAME_SELECTORS，都在忽略列表里）内使用，其余同 labels：自定义列表名保持原文
   */
  readonly listNames?: Readonly<Record<string, string>>
  /**
   * 默认议题类型（组织预置的 Task、Bug、Feature）的名称：只在议题类型名称区域
   * （core/ignore 的 ISSUE_TYPE_NAME_SELECTORS，都在忽略列表里）内使用，其余同 labels：组织自定义的类型名保持原文
   */
  readonly issueTypes?: Readonly<Record<string, string>>
}

/**
 * 名称区域的种类：标签名称区域查 labels，标签说明区域查 labelDescriptions 与 labelRegexp，
 * 星标列表名称区域查 listNames，议题类型名称区域查 issueTypes
 */
export type LabelPart = 'name' | 'description' | 'list' | 'type'

/** 页面类型，由 URL 推断（见 page.ts） */
export const PAGE_KEYS = [
  'common',
  'dashboard',
  'explore',
  'profile',
  'organization',
  'repository',
  'code',
  'commits',
  'issues',
  'pulls',
  'actions',
  'projects',
  'releases',
  'packages',
  'wiki',
  'discussions',
  'security',
  'insights',
  'repo-settings',
  'settings',
  'org-settings',
  'notifications',
  'search',
  'new',
  'gist',
  'codespaces',
  'copilot',
  'auth',
  'marketplace',
  'sponsors',
  'education',
  'mcp',
  // GitHub 状态页（www.githubstatus.com）
  'status',
  // GitHub 支持站点（help.github.com、support.github.com）
  'support'
] as const

export type PageKey = (typeof PAGE_KEYS)[number]

/** 语言包：同一 PageKey 可由多个文件提供词条 */
export type LocaleBundle = ReadonlyArray<readonly [PageKey, PageDictionary]>
