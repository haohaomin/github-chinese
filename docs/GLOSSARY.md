# 翻译规范与术语表

词典文件：`src/locales/zh-CN/*.ts`。所有词典作者必须遵守本文件。

## 1. 原则

- 只翻译 GitHub 界面文字。用户内容（存储库名、用户名、文件名、分支名、提交消息、议题标题、标签名、主题、描述、Markdown 正文、代码）一律不翻译、不收录。例外：GitHub、Dependabot 预置的默认标签（用户要求，2026-10-29）：标签区域里按名称表、说明表整段匹配翻译；区域外含默认标签名的无障碍名称、整句由 regexp、属性规则调用 `labelName()` 同译，只认默认名；默认说明另收进 static（第 4 节默认标签行）；自定义标签照旧不译。星标列表的预置名称（添加到列表菜单里 GitHub 建议的 🔮 Future ideas、🚀 My stack、✨ Inspiration；用户要求，2026-10-29）同理：列表名区域（星标页卡片、列表页标题、星标菜单的列表名与建议项）里按预置名称表（profile/tabs.ts 的 STAR_LIST_NAMES）整段匹配翻译，列表页标题段同译，区域外同样的文字由 common-ui/actions.ts 的 static 兜底；自定义列表名、列表描述照旧不译。译名：🔮 未来构想、🚀 我的技术栈、✨ 灵感。
- 译文准确、简短、自然，避免翻译腔。按钮 2～6 字为宜。能省则省：`Learn more about X` → `了解 X`。
- 人称用“你”，不用“您”（官方正文 你 8567 / 您 6801；界面名一律用“你”：你的个人资料、你的组织）。
- 同一概念全站同一译法，以本文件术语表为准；表内没有的词，先查官方中文文档，再在已有词典里搜，保持一致。

### 参考来源

- GitHub 官方中文文档（`docs.github.com/zh`）：[词汇表](https://docs.github.com/zh/get-started/learning-about-github/github-glossary)与正文。正文页脚注明部分内容为机器或 AI 翻译，同一概念常多译并存。
- Pro Git 中文版（`git-scm.com/book/zh/v2`）及其翻译约定（`progit/progit2-zh` 的 `TRANSLATION_NOTES.asc`）。
- 社区词库 [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese)（GPL-3.0）：只参考术语选择、发现漏收的原文，不搬运译文。

取舍原则：

1. 与官方中文文档冲突时以官方为准。术语和行文约定（人称、空格、标点、量词）都按官方。
2. 官方内部不一致时：
   - 概念术语取官方正文实际用法的多数（按英文原文对齐计数）；用法接近或样本过少时取官方词汇表。
   - 按钮、标签页、菜单项等界面元素名取官方正文引用该元素时的多数译法（少于 3 处时按概念术语处理）；其中的概念词与本表统一：`New repository` → `新建存储库`。
   - 官方词汇表或界面名明显误译、未译、自相矛盾的不采用，如 fork → 创建分支、head branch → 主分支、review → 评价、block → 块。
3. 官方译法会让同一界面两个元素同名，或与另一常用术语撞词时，不采用，改取官方次多译法或通行说法，在备注写明。
4. 产品名、功能名、方案名中的英文普通词译成中文，只保留自造品牌词与技术缩写（第 3 节；用户规定，优先于官方保留英文的做法）。官方正文因引用英文界面而保留英文的普通界面名（Settings、Insights 等）照常译成中文。
5. 官方未覆盖的，依次参考 Pro Git 中文版及其翻译约定、通行说法。

备注栏出处：官方词汇表、官方正文（“界面名”指官方正文引用界面元素时的译法）、Pro Git、通行。

## 2. 格式

- 标点随原文（用户规定）：原文没有标点，译文也不加任何标点；原文结尾没有标点，译文结尾也不加（`Learn more` → `了解更多`，不写 `了解更多。`；`Sort by` → `排序依据`，不写 `排序：`）。原文有的标点按下列各条转换。
- 中文句子用全角标点：，。：；？！（）“”。引号用弯引号“”，不用「」。
- 括号：括号内有中文用全角 `（）`，两侧不加空格：`令牌（经典）`、`（可选）`。括号内全是英文、数字或缩写时用半角 `()`，与两侧中文之间各加一个空格：`双因素身份验证 (2FA)`、`单一登录 (SSO) 设置`（官方正文 半角 369 / 全角 292，半角括号后接中文时 194 处全部加空格）。
- 省略号随原文（官方正文引用界面名时照录原文）：原文 `...` 保留 `...`，原文 `…` 用 `…`，不改写成 `……`：`Commit changes...` → `提交更改...`、`Commit changes…` → `提交更改…`。
- 破折号：句中连接两个分句的 `—` 译作 `——`，两侧不加空格；`—` 用作分隔符时（`X — Y`、`Created … — forked from …`）照原文保留，两侧空格不变。
- 斜杠：中文之间的 `/` 两侧不加空格：`打开/关闭`、`国家/地区`（官方正文 257 / 18）；按键、路径、命令照原文。
- 中文与英文单词之间加一个空格：`在 GitHub 上`、`使用 Copilot`（官方正文 37487 / 3556）。
- 中文与数字之间加一个空格，日期、时长同样加：`3 个提交`、`共 12 项`、`2024 年 1 月 5 日`、`3 天前`、`约 1 年前`、`5 分钟`（官方正文 2323 / 42，“2023 年 3 月”式 111 / 4）。无数字的“刚刚、昨天、今天”不变。时间、日期一律由 `helpers.ts` 生成，不在词典里手写。带时刻的完整时间只写日期与时刻（用户规定，2026-10-28）：时区与浏览器本地时区相同时不写，`2026 年 10 月 26 日 10:03`；不同时写在时刻后的括号里，`2026 年 7 月 15 日 11:05 (GMT-7)`。`<relative-time>` 显示的本地时区名由引擎去掉。
- 全角标点两侧不加空格。引擎会处理原文里的空白：译文以全角标点开头或结尾时，不保留那一侧的原文空白；元素末尾译出全角标点时，紧跟的文字不留开头空白（`<span>提示：</span>按 …`）；元素开头译出全角标点时，前面的文字不留结尾空白（`描述<span>（可选）</span>`）；元素的文字之后变了，紧邻的文字随之重算；`<relative-time>` 等时间元素的显示文字由引擎补空格。词典不必为此改写。
- 计数量词：提交、文件、议题、拉取请求、分支、发行版、软件包、检查、项、人（用户、成员、协作者、贡献者、关注者、审查者、赞助者、标星者）→ 个；评论 → 条；次数（贡献、运行）→ 次（官方正文 个用户 107 / 名 6 / 位 3）。
- 保留原文中的技术记号：`@user`、`#123`、`owner/repo`、`git clone`、快捷键。
- 操作动词：click → 单击，select → 选择，tap（移动端）→ 点击（官方正文 单击 7695 / 点击 91）。
- 译文提到其他界面元素（按钮、标签页、菜单项）时，用该元素在本词典中的中文译名，不括注英文，不保留英文原名（第 3 节不翻译的名称除外）；原文给界面名加了引号的，译文用“”：`Click "Star"` → `单击“星标”`。
- 名词、动词、状态：动作用动词，状态用“已+动词”，撤销用“取消+动词”：Pin、Pinned、Unpin → 置顶、已置顶、取消置顶；Archive、Archived、Unarchive → 存档、已存档、取消存档；Subscribe、Subscribed、Unsubscribe → 订阅、已订阅、取消订阅；Approve、Approved → 批准、已批准。官方有固定说法的从官方：Star、Starred、Unstar → 星标、已加星标、取消星标；Lock、Locked、Unlock → 锁定、已锁定、解锁；Block、Unblock → 阻止、取消阻止。
- 进行体：表示当前用户的持续关系，或按钮切换后的状态时用“正在+动词”，不与按钮同译：`Watching` → `正在关注`；`Following` → `正在关注`；`Sponsoring` → `正在赞助`。
- 进度提示：单独出现的进度动名词作“X中”：`Loading…` → `加载中…`、`Saving…` → `保存中…`、`Deleting…` → `删除中…`；带宾语或主语时用“正在”：`Loading files…` → `正在加载文件…`、`Copilot is working…` → `Copilot 正在工作…`。

## 3. 不翻译与产品名

用户规定（2026-10-27）：界面上不能留下成排的英文产品名、方案名。产品名、功能名、方案名、客户端名中由英文普通词构成的部分一律译成中文，带 GitHub / Copilot 前缀的全称同样译出后半部分；只保留自造品牌词与技术缩写。

- 保留的品牌词：GitHub、Git、Copilot、Dependabot、CodeQL、Spark、npm、Docker、Azure、Patreon 等第三方品牌。Gist 按用户规定（2026-10-28）译成“代码片段”（第 4 节）。
- 保留的技术缩写与技术词：LICENSE、CODEOWNERS、SSH、GPG、HTTPS、URL、API、CLI、MCP、JSON、YAML、OAuth、SAML、SSO、2FA、PR、OIDC、Markdown、Wiki、ZIP、Cookie。Webhook 按用户规定（2026-10-28）译成“Web 钩子”，README 指自述文件这个概念时译成“自述文件”（第 4 节），指具体文件名（README.md）时照原文。
- 单个字母、纯符号、版本号、哈希、路径、电子邮件地址、网址。
- 用户内容照旧不译（第 1 节）：存储库名、工作流名、主题名里的 Actions、Pages 等单词不是产品名。

产品名、功能名译名表（全站同一译法；译名中的概念词与第 4 节一致）：

<!-- prettier-ignore -->
| 英文 | 中文 | 备注 |
| --- | --- | --- |
| Actions / GitHub Actions | 操作 / GitHub 操作 | 存储库标签页、设置侧栏、计费项、权限名都用；可复用的单个 action 同样 → 操作；Actions minutes → 操作分钟数 |
| Codespaces / GitHub Codespaces / codespace | 代码空间 / GitHub 代码空间 / 代码空间 | Create codespace → 创建代码空间；Your codespaces → 你的代码空间；core hours → 核心小时数 |
| Pages / GitHub Pages | 页面 / GitHub 页面 | Pages 设置 Build and deployment → 生成和部署；Page build → 页面构建；Pages site → 页面站点 |
| Packages / GitHub Packages | 软件包 / GitHub 软件包 | 用户规定（2026-10-28）。Container registry → 容器注册表 |
| Marketplace / GitHub Marketplace | 市场 / GitHub 市场 | Search Marketplace → 搜索市场；Marketplace apps → 市场应用；其中的 action / app → 操作 / 应用 |
| Projects / Issues / Discussions / Sponsors / Models（含 GitHub 前缀） | 项目 / 议题 / 讨论 / 赞助 / 模型 | GitHub Sponsors profile → GitHub 赞助个人资料；侧栏赞助者列表标题 Sponsors → 赞助者 |
| Advanced Security / Code Security / Secret Protection / Advisory Database（含 GitHub 前缀） | 高级安全 / 代码安全 / 机密保护 / 公告数据库 | |
| GitHub Desktop / GitHub Mobile | GitHub 桌面版 / GitHub 移动版 | GitHub CLI、Copilot CLI 保留（CLI 是技术缩写） |
| GitHub Education / GitHub Classroom / GitHub Skills | GitHub 教育 / GitHub 课堂 / GitHub 技能 | Student Developer Pack → 学生开发人员包；GitHub Campus Expert → GitHub 校园专家 |
| Copilot Chat / Spaces / Memory / Autofix / Workspace | Copilot 聊天 / 空间 / 记忆 / 自动修复 / 工作区 | Copilot code review / cloud agent / coding agent → Copilot 代码审查 / 云端智能体 / 编码智能体 |
| Mission Control / Copilot in the cloud | 任务控制中心 / 云端 Copilot | 智能体的任务控制中心（No Mission Control environments available → 没有可用的任务控制中心环境） |
| Enterprise Cloud / Enterprise Server / Enterprise Managed Users (EMU) | 企业云 / 企业服务器 / 企业托管用户 (EMU) | GitHub Enterprise Cloud → GitHub 企业云 |
| Premium support / Pulse / Beta | 高级支持 / 统计 / 测试版 | Premium Plus Support → 高级增强支持；Preview 仍 → 预览 |
| Code Quality / GitHub Stars | 代码质量 / GitHub 之星 | GitHub Stars 是社区计划，与星标无关；GitHub Universe（活动名）保留 |
| 第三方产品名 | 原文 | Microsoft Teams、Gemini Pro、Team Foundation Version Control、Visual Studio Code 等不属于 GitHub 的产品名保留 |

方案名一律译成「X 版」：GitHub Free / Pro / Team / Enterprise → GitHub 免费版 / 专业版 / 团队版 / 企业版；Copilot Free / Pro / Pro+ / Business / Enterprise → Copilot 免费版 / 专业版 / 专业增强版 / 商业版 / 企业版；Copilot for Business → Copilot 商业版；Copilot Student → Copilot 学生版；GitHub Teams（教育页）→ GitHub 团队版。单独出现的 Free / Pro / Pro+ / Team / Enterprise / Business 指方案时同样 → 免费版 / 专业版 / 专业增强版 / 团队版 / 企业版 / 商业版（Try Enterprise → 试用企业版；Upgrade to Business → 升级到商业版）。价格义 Free 仍 → 免费（Install it for free → 免费安装）；全局导航的 Enterprise 栏目 → 企业；team 概念 → 团队。第三方 Marketplace 应用自己起的计划名按常见英文词照译（Open Source → 开源，Free → 免费版），译不了的保留原文。

GitHub App、OAuth app 按官方词汇表译「GitHub 应用」「OAuth 应用」。

## 4. 术语表

本节的“ / ”只用于分隔并列的英文或译法，不是界面文字。

<!-- prettier-ignore -->
| 英文 | 中文 | 备注 |
| --- | --- | --- |
| repository / repo | 存储库 | 官方正文（存储库 11809 / 仓库 3703；界面名 新建存储库 15 / 0，2026 年新文档同样以“存储库”为主）。官方词汇表标题作“仓库”，其释义仍以“存储库”为主（111 / 17），不采用。New repository → 新建存储库；Repository name → 存储库名称；Your repositories → 你的存储库；Selected repositories → 所选存储库 |
| pull request | 拉取请求 | 官方词汇表、正文。缩写 PR 保留。New pull request → 新建拉取请求；Create pull request → 创建拉取请求；Compare & pull request → 比较和拉取请求；动词 open → 创建 |
| issue | 议题 | 用户规定（2026-10-28；官方界面名 问题 27 / 议题 23）。problem、question 义仍作“问题”（默认标签 question 作“疑问”，见默认标签行）。Issues → 议题；New issue → 新建议题；Create issue → 创建议题；Close issue / Reopen issue → 关闭议题 / 重新打开议题；sub-issue / parent issue → 子议题 / 父议题；议题类型 / 议题模板 / 议题表单 / 议题字段；draft issue → 草稿议题 |
| discussion | 讨论 | 官方正文。New discussion → 新建讨论；Start discussion → 开始讨论；Start a new discussion → 开始新讨论；Start poll → 开始投票；Mark as answer → 标记为答案；category → 类别；Answered / Unanswered → 已回答 / 未回答 |
| fork | 复刻 | 官方正文多数（复刻 197 / 分叉 179 / 派生 110）。官方词汇表与界面名作“创建分支”“分支”，与 branch 撞词，不采用。名词、动词同：Create fork → 创建复刻；Forked from → 复刻自；Sync fork → 同步复刻；Forks → 复刻；fork network → 复刻网络 |
| star / starred / unstar | 星标 / 已加星标 / 取消星标 | 官方正文（界面名 Star → 星标 5，Starred → 已加星标 7）。动词作“加星标”：Star this repository → 为此存储库加星标；Unstar this repository → 取消此存储库的星标；带计数时括号照第 2 节：Star this repository (N) → 为此存储库加星标 (N)；Starred, click to unstar this repository → 已加星标，单击可取消此存储库的星标；N users starred this repository → N 个用户为此存储库加了星标；Star / Unstar this gist → 为此代码片段加星标 / 取消此代码片段的星标；starred repositories / topics → 已加星标的存储库 / 主题；starred owner/repo → 为 owner/repo 加了星标；Stars（计数、标签页）→ 星标；Your stars → 你的星标（官方“你的星级”属误译） |
| stargazers | 标星者 | 官方正文。N stargazers → N 个标星者 |
| watch / watching / unwatch / watchers | 关注 / 正在关注 / 取消关注 / 关注者 | 官方正文：通知文档一律“关注”，取消关注 26 / 取消监视 4，已关注 4 / 已监视 0，界面名 10 / 10。官方词汇表作“监视”，与同表 watching notifications（查看通知）矛盾，不采用。Unwatch all → 全部取消关注；Watched repositories → 已关注的存储库；All Activity → 所有活动；Participating and @mentions → 参与和 @提及；Ignore → 忽略；Custom → 自定义 |
| follow / unfollow | 关注 / 取消关注 | 官方正文（界面名）。用户。官方 watch、follow 同作“关注” |
| followers / following | 关注者 / 正在关注 | 官方正文。N followers → N 个关注者；N following → 正在关注 N 人 |
| commit | 提交 | 官方词汇表、正文。名词、动词同：Commits → 提交；Commit changes → 提交更改；committed → 提交于；N commits → N 个提交 |
| commit message | 提交消息 | 官方词汇表、正文（245 / 提交信息 11） |
| branch | 分支 | 官方正文。New branch → 新建分支；Delete branch / Restore branch → 删除分支 / 恢复分支；Update branch → 更新分支；Switch branches/tags → 切换分支/标签 |
| default / base / head / compare branch | 默认分支 / 基础分支 / 头部分支 / 比较分支 | 官方词汇表；head branch 词汇表作“主分支”属误译，取正文“头部分支”。base: / compare: → 基础： / 比较：；base / head repository → 基础存储库 / 头部存储库 |
| upstream | 上游 | 官方正文、Pro Git。upstream repository → 上游存储库；N commits ahead of / behind → 领先 / 落后 N 个提交 |
| tag | 标签 | Git 标签。用户指定（2026-10-31），同 Pro Git 中文版；官方正文多作“标记”（分支和标记 63 / 分支和标签 16）。与 label 同名，发布表单的 Release label 仍作“发行版标签”。Tags → 标签；Create new tag → 创建新标签；Choose a tag → 选择标签；tag ruleset → 标签规则集；tag protection → 标签保护；tagged this → 打标签于；tagger → 打标签者；Tagged / Untagged（软件包版本）→ 带标签 / 无标签；容器映像的 tag、代码扫描规则的 tag 同译；mark、flag、marker 仍作“标记” |
| label | 标签 | 官方词汇表、正文。议题标签。New label → 新建标签；Edit labels → 编辑标签；labeled → 添加了标签；Release label → 发行版标签 |
| 默认标签：bug / documentation / duplicate / enhancement / good first issue / help wanted / invalid / question / wontfix / dependencies / accessibility | 缺陷 / 文档 / 重复 / 改进 / 适合新手的议题 / 需要帮助 / 无效 / 疑问 / 不予修复 / 依赖项 / 辅助功能 | 用户要求（2026-10-29）。标签区域（`core/ignore` 的 `LABEL_SELECTORS`）里整段、区分大小写匹配时翻译：名称区域（令牌、经典标签、标签页的标签链接、标签选择器）只查 `issues/labels.ts` 的名称表 `labels`，说明区域（说明提示、屏幕阅读器说明、标签页的说明列）只查说明表 `labelDescriptions` 与标签正则 `labelRegexp`；标签名不进 static。自定义标签（含与默认说明同形的名称、与默认标签名同形的说明）和区域外同形的目录名、存储库名、项目选项照旧不译；自定义词条不参与标签区域。区域外含默认标签名的无障碍名称、整句由 regexp、属性规则调用 `labelName()` 同译，只认默认名，自定义名原样：按标签缺陷筛选、标签：疑问、删除标签：需要帮助（含删除按钮的提示文字，常态下按钮名称取自提示）、存档确认句；已存档的前加“已存档”，自定义名同样加：已存档不予修复、已存档 scope: vapor。译名与本表一致：bug 同“缺陷跟踪”；documentation 同 docs 行；duplicate 同关闭原因；dependencies 同 dependency graph 行；accessibility 同 keyboard shortcuts 行；question 不作“问题”（官方对 issue 的旧译，挂在议题上易混）；wontfix 同警报消除原因、审查线程解决原因 won't fix 的“不予修复”（说明 This will not be worked on 照原句译作“不会处理”）。默认说明照原句译，弯引号、直引号两种写法都收，说明表与 static 各收一份、译文相同（static 那份供标签区域外的标签选择器、筛选框标签建议），说明提示的 aria-label 同译：Something isn’t working → 有功能不正常；Good for newcomers → 适合新手；Pull requests that update a dependency file → 更新依赖文件的拉取请求。Dependabot 按生态生成的说明 Pull requests that update X code → 更新 X 代码的拉取请求，同一条规则放在标签正则与 `common-ui/labels.ts` 的 regexp（全站生效，同 static 里的默认说明）；生态名 javascript、Docker 等不译，产品名按第 3 节译：GitHub Actions → GitHub 操作。新建标签对话框预览令牌的占位文字 Label preview → 标签预览，同收进名称表，令牌的 aria-label 与令牌同译。已知限制：标签选择器显示译名，筛选仍按英文原名（输入“缺陷”查不到）；关注设置的已选标签摘要、看板卡片的标签溢出提示、实时播报里的标签名保持原文；标签页列表行屏幕阅读器读的行标题保持原文（React 读它的文字拼行的无障碍名称，行的无障碍名称照常译出）；名为 Label preview 的自定义标签按占位文字译出；无障碍名称里以“Archived ”开头的自定义标签名按已存档译出 |
| release | 发行版 | 官方正文（219）、页面标题“关于发行版”。Releases（侧栏、标签页、页面标题、通知事件）→ 发行版：官方界面名在“版本”“发布”间分歧，分别与 version、publish 撞词，不采用。Draft a new release → 起草新发行版；Publish release → 发布发行版；Set as the latest release → 设为最新发行版；+ N releases → + N 个发行版；发行版页标签 Releases / Tags → 发行版 / 标签；release notes → 发行说明；Generate release notes → 生成发行说明；Latest → 最新；动词 publish → 发布 |
| pre-release | 预发行版 | 官方正文（52 / 预发布 30）。This is a pre-release → 这是预发行版；pre-release terms → 预发行条款 |
| milestone | 里程碑 | 官方词汇表、正文。New milestone → 新建里程碑 |
| project / item | 项目 / 项 | 官方正文。Projects → 项目；Projects (classic) → 项目（经典）；project board → 项目看板；view → 视图；item → 项：Add item → 添加项，N items → N 个项，Archived items → 存档项，Import items from repository → 从存储库导入项 |
| iteration / roadmap | 迭代 / 路线图 | 官方正文。iteration field → 迭代字段；Current iteration → 当前迭代 |
| organization | 组织 | 官方词汇表。Your organizations → 你的组织；organization account → 组织帐户；organization owner → 组织所有者 |
| team | 团队 | 官方词汇表。child / parent team → 子团队 / 父团队；secret / visible team → 机密团队 / 可见团队；team maintainer → 团队维护者 |
| enterprise | 企业 | 官方词汇表。enterprise account → 企业帐户；Your enterprises → 你的企业；方案名 GitHub Enterprise → GitHub 企业版（第 3 节） |
| member / owner | 成员 / 所有者 | 官方正文。N members → N 个成员；code owner → 代码所有者 |
| collaborator / outside collaborator | 协作者 / 外部协作者 | 官方词汇表、正文 |
| contributor | 贡献者 | 官方页面标题（贡献者 9 / 参与者 0）、正文（177 / 158）。官方词汇表标题“参与者”与同表 contributors graph（贡献者图表）矛盾，且“参与者”已用于 participant、actor，不采用。Contributors → 贡献者；first-time contributor → 首次贡献者；contributors graph → 贡献者图；Participants → 参与者 |
| maintainer | 维护者 | 官方词汇表、正文多数（137 / 维护员 91 / 维护人员 86）。Allow edits by maintainers → 允许维护者编辑；Maintain 角色 → 维护 |
| author | 作者 | 官方词汇表（commit author → 提交作者）。authored → 编写于 |
| actor | 参与者 | 官方正文（27 / 执行者 10 / 触发者 2）。Filter by actor → 按参与者筛选；bypass actors → 绕过参与者 |
| assignee / assign | 受理人 / 分配 | 官方正文多数（受理人 25；界面名分散在 被分派人、被分配者、分配者 等）；官方词汇表“代理人”属误译。Assignees → 受理人；Assign yourself → 分配给自己；No one assigned → 无受理人；assigned → 已分配 |
| reviewer / review | 审查者 / 审查 | 官方正文（界面名 Reviewers → 审查者 5 / 审阅者 4；审查 808）；官方词汇表 review“评价”属误译。Review changes → 审查更改；Start a review → 开始审查；Submit review → 提交审查；Request review / Re-request review → 请求审查 / 重新请求审查；Viewed → 已查看；code review → 代码审查；review comment → 审查评论 |
| approve / request changes | 批准 / 请求更改 | 官方正文（界面名）。Approved → 已批准；Changes requested → 已请求更改；N changes requested → N 个更改请求 |
| comment | 评论 | 官方正文（评论 642 / 注释 467 / 批注 77）。官方部分段落连名词带按钮都作“注释”“批注”，按概念统一取“评论”；代码注释仍作“注释”。Comment（按钮、审查类型选项）→ 评论；Add a comment → 添加评论；Close with comment → 评论并关闭；Hide comment → 隐藏评论；N comments → N 条评论 |
| conversation / thread | 对话 / 线程 | 官方正文（对话 321）；thread 官方不统一（线程 4 / 帖子 4 / 会话 3 / 讨论串 1），取“线程”。Conversation → 对话；Lock conversation / Unlock conversation → 锁定对话 / 解锁对话；Resolve conversation / Unresolve conversation → 解决对话 / 取消解决对话；comment thread / review thread → 评论线程 / 审查线程；Copilot 聊天的 conversation、thread → 对话 |
| mention | 提及 | 官方词汇表。@mentions → @提及；mentioned you → 提及了你；Mentioned（筛选）→ 提及我的 |
| reaction / emoji | 反应 / 表情符号 | 官方正文（反应 27 / 表情回应 0；表情符号 39 / 表情 3）。Add reaction → 添加反应；Most reactions → 反应最多；Eyes → 眼睛 |
| notification / inbox | 通知 / 收件箱 | 官方词汇表、正文。Notification settings → 通知设置；Manage notifications → 管理通知；participating notifications → 参与通知；Done → 完成；Saved → 已保存；Mark as read / unread → 标记为已读 / 未读 |
| subscribe / unsubscribe / subscription | 订阅 / 取消订阅 / 订阅 | 官方正文（取消订阅 70 / 退订 0）。Subscribed → 已订阅；计费义 subscription 也作“订阅”（对齐 261 / 套餐 0；词汇表“套餐”的用例原文是 plan）；Manage subscription → 管理订阅 |
| dashboard / feed | 仪表板 / 动态 | 官方词汇表（仪表板）；news feed 词汇表标题“新闻源”与其释义“动态消息”不一致，取“动态”。personal dashboard → 个人仪表板；For you → 为你推荐 |
| profile / profile picture / avatar | 个人资料 / 个人资料图片 / 头像 | 官方正文（个人资料图片 310 / 个人资料照片 168）。Your profile → 你的个人资料；Edit profile → 编辑个人资料；organization profile → 组织个人资料；Remove photo → 删除照片。GitHub 应用、OAuth 应用的 logo / avatar → 图标（用户规定 2026-11-20）：Upload new logo → 上传新图标；Crop your new avatar → 裁剪新图标；Set new avatar → 设置新图标；Delete this image → 删除此图标 |
| settings | 设置 | 官方正文（界面名）。General → 常规；Access → 访问；Code, planning, and automation → 代码、规划和自动化；Integrations → 集成；Danger Zone → 危险区域 |
| account | 帐户 | 官方正文（帐户 2913 / 账户 299）、词汇表。personal / organization / enterprise account → 个人帐户 / 组织帐户 / 企业帐户；Switch account → 切换帐户 |
| billing / plan / licensing | 计费 / 计划 / 许可 | 官方正文（界面名 Billing and licensing → 计费和许可）、词汇表（billing cycle → 计费周期）。Billing settings → 计费设置；billing email → 计费电子邮件；Billing information → 账单信息；billing manager → 账单管理员；Payment information / Payment method → 付款信息 / 付款方式；Upgrade plan / Downgrade plan → 升级计划 / 降级计划；invoice billing → 发票付款；Switch to invoiced billing → 切换到开票计费；价格义 Free → 免费 |
| sponsor | 赞助 / 赞助者 | 官方正文。按钮、动词 Sponsor → 赞助；人 → 赞助者（N sponsors → N 个赞助者）；Sponsoring（标签页、已赞助按钮）→ 正在赞助（官方截图说明作“赞助”，与 Sponsor 按钮同名，不采用）；tier → 等级（Sponsor tiers → 赞助等级；Select a tier → 选择等级）；Sponsor / Sponsoring owner/repo（无障碍名称）→ 赞助 / 正在赞助 owner/repo；Sponsoring as → 赞助身份；sponsored developer → 被赞助的开发者；Private Sponsor → 私密赞助者 |
| marketplace | 市场 | 用户规定（第 3 节；官方词汇表保留英文、正文 647 / 市场 195）。Search Marketplace → 搜索市场；Marketplace apps → 市场应用；其中的 action / app → 操作 / 应用；listing → 上架项：Create draft listing → 创建上架项草稿；页头 Edit X → 编辑 X |
| explore / trending | 探索 / 趋势 | 官方正文。Trending repositories / developers → 趋势存储库 / 趋势开发人员；趋势页标签 Repositories / Developers → 存储库 / 开发人员；See more trending developers → 查看更多趋势开发人员；Today / This week / This month → 今天 / 本周 / 本月 |
| topic / collection | 主题 / 集合 | 官方词汇表、正文。Manage topics → 管理主题 |
| workflow / run / job / step | 工作流 / 运行 / 作业 / 步骤 | 官方正文（工作流 5714 / 工作流程 1052）。All workflows → 所有工作流；Run workflow → 运行工作流；workflow run → 工作流运行；Re-run jobs / Re-run all jobs → 重新运行作业 / 重新运行所有作业；Cancel run → 取消运行 |
| Queued / In progress / Success / Failure / Cancelled / Skipped | 已排队 / 正在进行 / 成功 / 失败 / 已取消 / 已跳过 | 运行、检查、部署状态。官方正文（in progress → 正在进行 80 / 进行中 25）。Timed out → 已超时；Action required → 需要操作；Startup failure → 启动失败；Neutral → 中性；Stale → 已过时；Expected → 等待报告；Waiting for status to be reported → 正在等待状态上报；Waiting → 等待中；Pending（检查、作业、部署）→ 挂起；pending runs / requests / review comments → 待处理；pending invitations / collaborators → 待定邀请 / 待定协作者 |
| runner / artifact / cache | 运行器 / 产物 / 缓存 | 运行器取官方正文（运行器 2400 / 运行程序 760）；artifact 用户规定：操作的构建产物作「产物」，Copilot、议题、拉取请求中的 artifact 作「附件」，不用「工件」。self-hosted runner → 自托管运行器；larger runners → 更大的运行器；runner group → 运行器组；artifact attestations → 产物证明 |
| secret / variable | 机密 / 变量 | 官方正文。Secrets and variables → 机密和变量；Repository secrets / Environment secrets → 存储库机密 / 环境机密；secret gist → 机密代码片段；secret team → 机密团队；client secret → 客户端密钥 |
| environment / deployment | 环境 / 部署 | 官方正文。Review deployments → 审查部署；Approve and deploy → 批准并部署；deployment protection rules → 部署保护规则；deployment history → 部署历史记录 |
| package / container / registry / image | 软件包 / 容器 / 注册表 / 映像 | package 按用户规定（2026-10-28）作“软件包”（官方界面名 Packages → 包 19 / 软件包 0），包含、打包、学生开发包（Student Developer Pack）等不是 package 的词不动；映像为官方正文（映像 807 / 镜像 126）。N packages → N 个软件包；package manager → 软件包管理器；package registry → 软件包注册表；package.json 等文件名照原文；Container registry → 容器注册表；container image → 容器映像；Custom images → 自定义映像；runner image → 运行器映像；Base images → 基础映像；Image version → 映像版本；host image → 主机映像；图片义 image → 图片；mirror → 镜像 |
| security / advisory / vulnerability / alert | 安全 / 公告 / 漏洞 / 警报 | 官方正文。存储库标签页 Security → 安全；设置侧栏 Security 分组 → 安全性；Security and quality → 安全和质量；security advisory → 安全公告；private vulnerability reporting → 专用漏洞报告；Dependabot alerts → Dependabot 警报；警报列表 Open / Closed → 未解决 / 已关闭 |
| code scanning / secret scanning / push protection | 代码扫描 / 机密扫描 / 推送保护 | 官方正文（中文译出部分）。bypass → 绕过：Bypass push protection → 绕过推送保护；bypass list → 绕过列表；Add bypass → 添加绕过；bypass request → 绕过请求 |
| dependency graph / dependents | 依赖项关系图 / 被依赖 | 官方词汇表、界面名（依赖项关系图 29）。Dependents 官方作“依赖项”，与 Dependencies 同名，不采用。Dependencies → 依赖项；Used by → 使用者 |
| insights / traffic / network / Pulse | 洞察 / 流量 / 网络 / 统计 | Insights → 洞察、Pulse → 统计（用户规定）。Community insights → 社区洞察；Network graph → 网络图；Clones / Visitors → 克隆 / 访问者；Referring sites → 推荐站点；Popular content → 热门内容 |
| code / file / folder / directory | 代码 / 文件 / 文件夹 / 目录 | 官方正文。Go to file → 转到文件；Add file → 添加文件；Create new file → 创建新文件；Upload files → 上传文件；root directory → 根目录 |
| blame / raw / history | 追溯 / 原始 / 历史记录 | 官方词汇表（追溯）、界面名（History → 历史记录 77 / 历史 3）。View raw → 查看原始文件；commit history → 提交历史记录 |
| diff / patch | 差异 / 补丁 | 官方词汇表。Load diff → 加载差异 |
| merge / merge conflict | 合并 / 合并冲突 | 官方词汇表、界面名。Merge pull request → 合并拉取请求；Confirm merge → 确认合并；Create a merge commit → 创建合并提交；Merged → 已合并；Resolve conflicts → 解决冲突；Mark as resolved → 标记为已解决；Commit merge → 提交合并 |
| squash and merge / rebase and merge | 压缩并合并 / 变基并合并 | 官方正文（界面名）。Confirm squash and merge → 确认压缩并合并；Confirm rebase and merge → 确认变基并合并；设置项 Allow squash merging / Allow rebase merging → 允许压缩合并 / 允许变基合并 |
| rebase / cherry-pick / revert | 变基 / 挑拣 / 还原 | 官方词汇表（Pro Git 作“拣选”）。Update with rebase → 使用变基更新；命令名照原文 |
| merge queue / auto-merge | 合并队列 / 自动合并 | 官方正文（界面名）。Merge when ready → 准备就绪时合并；Add to merge queue → 添加到合并队列；Enable auto-merge / Disable auto-merge → 启用自动合并 / 禁用自动合并 |
| checks / status check | 检查 / 状态检查 | 官方词汇表。check run / check suite → 检查运行 / 检查套件；Re-run checks → 重新运行检查；required status checks → 必需的状态检查；N checks → N 个检查 |
| files changed | 已更改的文件 | 官方正文（界面名 24 / 文件已更改 12）。N files changed → 已更改 N 个文件 |
| suggestion / suggested change | 建议 / 建议更改 | 官方正文。Commit suggestion → 提交建议；Add suggestion to batch → 将建议添加到批次 |
| draft / ready for review | 草稿 / 可供审查 | 官方正文（界面名）。Mark as ready for review → 标记为可供审查；Convert to draft → 转换为草稿；draft pull request → 草稿拉取请求；Save draft → 保存草稿；动词 draft → 起草 |
| Open / Closed / Merged（状态） | 打开 / 已关闭 / 已合并 | 官方正文。计数作定语：N Open / N Closed → N 个打开的 / N 个已关闭的；Closed as completed / not planned → 已关闭（已完成）/ 已关闭（未计划）；里程碑进度片段 open / closed → 个打开的 / 个已关闭的；单独的状态徽章不变；警报列表见 security 行 |
| close / reopen | 关闭 / 重新打开 | 官方正文。Close as not planned → 以未计划关闭；Close as duplicate → 以重复关闭 |
| lock / unlock | 锁定 / 解锁 | 官方正文。Locked → 已锁定；Lock branch → 锁定分支 |
| pin / pinned | 置顶 / 已置顶 | 用户指定（2026-10-29）；官方词汇表、正文作“固定”（固定 221 / 置顶 16），不采用。Unpin → 取消置顶；Pin issue → 置顶议题；Pinned issues → 置顶议题；Customize your pins → 自定义置顶项；Pinned repositories → 置顶存储库；个人资料的 Pinned 标题 → 置顶，状态标签 Pinned → 已置顶。锁定版本（Require actions to be pinned to a full-length commit SHA、Pin to commit）、停靠（Pin side panel）不是置顶，仍作“固定” |
| archive / archived | 存档 / 已存档 | 官方正文（存档 368 / 归档 19）。Unarchive → 取消存档；Archive this repository → 存档此存储库；GitHub Archive Program → GitHub 存档计划 |
| template | 模板 | 官方正文。Template repository → 模板存储库；Use this template → 使用此模板；generated from → 生成自 |
| mirror | 镜像 | 官方词汇表。mirrored from → 镜像自；image 见 package 行 |
| Public / Private / Internal | 公共 / 专用 / 内部 | 可见性，只用于存储库、包、项目、codespace 转发端口等资源。官方词汇表、界面名（公共 22 / 公开 2；专用 8）。Make public / Make private → 设为公共 / 设为专用。非可见性义：public preview → 公开预览；private preview → 私密预览；public key / private key → 公钥 / 私钥；public profile → 公开个人资料；组织成员身份 Public / Private → 公开 / 隐藏；Make profile private and hide activity → 将个人资料设为私密并隐藏活动；Keep my email addresses private → 对我的电子邮件地址保密；private contributions → 私密贡献 |
| visibility | 可见性 | 官方正文。Change visibility → 更改可见性 |
| transfer | 转让 / 转移 | 官方词汇表“传输”与其释义（转让存储库）矛盾，不采用。存储库、所有权 → 转让：Transfer ownership → 转让所有权，Transfer repository → 转让存储库；危险区域的 Transfer 按钮 → 转移（官方界面名 2 / 2）；议题、讨论 → 转移：Transfer issue → 转移议题；data transfer → 数据传输 |
| license | 许可证 | 官方正文（831 / 许可 205）、页面标题。Add a license → 添加许可证；Choose a license → 选择许可证；计费义 Licensing、license seats → 许可、许可席位 |
| about / description / website | 关于 / 描述 / 网站 | 通行（官方 Description 描述 12 / 说明 11） |
| language | 语言 | 通行 |
| contribution / activity / overview | 贡献 / 活动 / 概述 | 官方词汇表（贡献）、界面名（Overview → 概述 17 / 概览 2）。contribution graph → 贡献图；N contributions → N 次贡献 |
| sign in / sign up / sign out | 登录 / 注册 / 退出登录 | 官方正文（界面名）。Sign out from all accounts → 从所有帐户退出登录 |
| username / password / email | 用户名 / 密码 / 电子邮件 | 官方正文（电子邮件 1312 / 邮箱 24）。email address → 电子邮件地址；Primary email address → 主要电子邮件地址；email notifications → 电子邮件通知；Forgot password? → 忘记密码？ |
| two-factor authentication / authentication | 双因素身份验证 / 身份验证 | 官方正文（界面名 双因素身份验证 20 / 双重身份验证 1；身份验证 2106 / 认证 134）。2FA 保留；Two-factor methods → 双因素方法；Enable two-factor authentication → 启用双因素身份验证；Password and authentication → 密码和身份验证；authentication code → 验证码；authenticator app → 身份验证器应用 |
| passkey / security key | 通行密钥 / 安全密钥 | 官方页面标题“管理通行密钥”。官方正文多作“密钥”（86 / 21），与 SSH 密钥、GPG 密钥、安全密钥撞词，不采用 |
| recovery codes | 恢复代码 | 官方词汇表、正文（80 / 恢复码 0）。Download recovery codes → 下载恢复代码 |
| SSH key / GPG key / deploy key | SSH 密钥 / GPG 密钥 / 部署密钥 | 官方正文。SSH and GPG keys → SSH 和 GPG 密钥；New SSH key → 新建 SSH 密钥；Add deploy key → 添加部署密钥；Allow write access → 允许写入权限；signing key → 签名密钥 |
| vigilant mode / verified | 警戒模式 / 已验证 | 官方正文。Partially verified → 部分验证；Unverified → 未验证 |
| personal access token / fine-grained | 个人访问令牌 / 精细 | 官方正文（精细 99 / 细粒度 32）。Fine-grained tokens → 精细令牌；Tokens (classic) → 令牌（经典）；token → 令牌（含 OAuth token、模型用量的 token）：N tokens → N 个令牌，input / output tokens → 输入 / 输出令牌。经典令牌列表的作用域代码显示为说明、以顿号分隔（admin:enterprise, admin:gpg_key → 完全控制企业、完全控制用户公开 GPG 密钥），新建、编辑表单里的代码不译 |
| ruleset / branch protection rule | 规则集 / 分支保护规则 | 官方正文。New branch ruleset / New tag ruleset → 新建分支规则集 / 新建标签规则集；Add classic branch protection rule → 添加经典分支保护规则；Branch name pattern → 分支名称模式；protected branch → 受保护分支 |
| enforce | 强制实施 | 官方正文（214 / 强制执行 86）。Enforce HTTPS → 强制实施 HTTPS；Enforcement status → 强制实施状态 |
| policy / allow list | 策略 / 允许列表 | 组织设置的存储库策略：Repository policies → 存储库策略；New repository policy → 新建存储库策略；allow list → 允许列表。法律文件仍作“政策”：Privacy policy → 隐私政策 |
| app / integration | 应用 / 集成 | 官方词汇表。GitHub App → GitHub 应用；OAuth app → OAuth 应用；Authorized OAuth Apps → 授权的 OAuth 应用；Authorized GitHub Apps → 授权的 GitHub 应用；Install / Configure / Suspend → 安装 / 配置 / 暂停 |
| permission / role / admin | 权限 / 角色 / 管理员 | 官方正文。存储库角色 Read / Triage / Write / Maintain / Admin → 读取 / 分类 / 写入 / 维护 / 管理员；Base permissions → 基本权限；Repository roles → 存储库角色；read access / write access → 读取访问权限 / 写入访问权限 |
| triage | 分类 | 官方正文（81 / 会审 24）。triage access → 分类权限 |
| block / report | 阻止 / 举报 | 官方正文（阻止 1201 / 屏蔽 66）；官方词汇表 block“块”属误译。Unblock → 取消阻止；Blocked users → 已阻止的用户；Block or report → 阻止或举报；Report abuse → 举报滥用行为；Report content → 报告内容；Report to repository admins → 向存储库管理员报告；议题依赖 Blocked by / Blocking → 被阻止 / 阻止；审核日志 Blocked by → 阻止者；报表义 report → 报告 |
| moderation / moderators | 调解 / 版主 | 官方正文（moderation → 调解 10 / 管理 10；moderators → 管理员 22 / 审查者 12 / 版主 8，前两者与 admin、reviewer 撞词）。Moderation options → 调解选项；动词 moderate → 管理；“审核”只用于 audit log 和存储库角色 Moderate（与 Admin 管理员区分；All-repository moderate → 所有存储库审核）；严重性 Moderate → 中 |
| interaction limits | 交互限制 | 官方正文（界面名）。Temporary interaction limits → 临时交互限制；Limit to existing users / prior contributors / repository collaborators → 限于现有用户 / 限于之前的贡献者 / 限于存储库协作者 |
| audit log / security log | 审核日志 / 安全日志 | 官方正文（审核日志 215 / 审计日志 3）、词汇表 |
| saved replies / scheduled reminders | 已保存回复 / 预定提醒 | 官方词汇表、正文（已保存回复 69 / 已保存的回复 15；预定提醒 73 / 定时提醒 14） |
| custom properties / autolink references | 自定义属性 / 自动链接引用 | 官方正文。Add autolink reference → 添加自动链接引用 |
| custom domain / domain | 自定义域 / 域 | 官方正文（界面名）。Add domain → 添加域；Verify domain → 验证域；Verified & approved domains → 已验证和批准的域；Publisher domain → 发布者域名 |
| search / filter / sort | 搜索 / 筛选 / 排序 | 官方正文。Filter / Filters（按钮、名词）→ 筛选器；Clear filters → 清除筛选器；Sort by → 排序依据；Group by → 分组依据；Slice by → 切片依据 |
| newest / oldest / recently updated | 最新 / 最早 / 最近更新 | 官方正文。Least recently updated → 最久未更新；Recently created / Least recently created → 最近创建 / 最早创建；Most commented → 评论最多；Last updated → 最后更新 |
| edit / delete / cancel / save | 编辑 / 删除 / 取消 / 保存 | 官方正文（界面名）。Save changes → 保存更改；Discard changes → 放弃更改 |
| create / new / add / remove | 创建 / 新建 / 添加 / 删除 | 官方正文（界面名 Remove → 删除 23 / 移除 9；移出人员、访问权限时 删除 84 / 移除 18）。New X → 新建 X；Create X → 创建 X；Add X → 添加 X；同一界面同时出现 Delete 与 Remove 时 Remove → 移除 |
| update / submit | 更新 / 提交 | 官方正文。Submit review → 提交审查；Submit new issue → 提交新议题 |
| copy / copied! | 复制 / 已复制！ | 官方正文。Copy to clipboard → 复制到剪贴板 |
| download / upload / clone / share / embed | 下载 / 上传 / 克隆 / 分享 / 嵌入 | 官方正文。资源、权限共用义 share → 共享；Share feedback → 提供反馈 |
| link / connect / associate | 链接 / 连接 / 关联 | 官方正文。Link a pull request → 链接拉取请求；Linked pull requests → 链接的拉取请求；Unlink → 取消链接；Connect repository → 连接存储库；linked branch → 关联的分支 |
| go to | 转到 | 官方正文（222 / 前往 36）。Go to file → 转到文件；Go to settings → 转到设置；Go to definition → 转到定义 |
| enable / disable / enabled / disabled | 启用 / 禁用 / 已启用 / 已禁用 | 官方正文 |
| required / optional / default | 必填 / 可选 / 默认 | 官方正文。表单字段 Required → 必填；规则要求（required status checks / reviews / workflows，检查列表徽章 Required）→ 必需 |
| write / preview | 写入 / 预览 | 官方正文（界面名 Write → 写入 8）。评论框标签页与权限级别同译 |
| details / preferences | 详细信息 / 首选项 | 官方正文（详细信息 6798 / 详情 24；首选项 192 / 偏好 28）。View details / Show details → 查看详细信息 / 显示详细信息；Manage cookie preferences → 管理 Cookie 首选项 |
| learn more / show more / load more | 了解更多 / 显示更多 / 加载更多 | 通行。Learn more about X → 了解 X；Show less → 显示更少 |
| loading… | 加载中… | 通行。其他进度提示见第 2 节 |
| previous / next | 上一页 / 下一页 | 官方正文。分页；条目导航 → 上一个 / 下一个 |
| feedback / docs | 反馈 / 文档 | 官方正文。Give feedback → 提供反馈；GitHub Docs → GitHub 文档 |
| public preview | 公开预览 | 官方正文（113 / 公共预览 11）。Preview（徽章）→ 预览；Beta 保留 |
| agent | 智能体 | 用户规定（议题 #9）。Agents → 智能体；agent session → 智能体会话；agent mode → 智能体模式；coding agent → 编码智能体；cloud agent → 云端智能体；custom agent → 自定义智能体；Copilot cloud agent / Copilot coding agent → Copilot 云端智能体 / Copilot 编码智能体 |
| custom instructions / prompt | 自定义说明 / 提示 | 官方正文（自定义说明 401 / 自定义指令 229；提示文件 173 / 提示词文件 0）。repository / personal custom instructions → 存储库 / 个人自定义说明；prompt file → 提示文件；system prompt → 系统提示 |
| usage | 使用情况 | 官方正文（界面名 Usage → 使用情况 4）。Metered usage → 按流量计费的使用情况；included usage → 包含的使用量；usage limit → 使用限制；usage report → 使用情况报告；Token usage → 令牌使用情况 |
| developer | 开发人员 | 官方正文（开发人员 634 / 开发者 115；Developer settings → 开发人员设置）。Developer Program → 开发人员计划；sponsored developer → 被赞助的开发者（官方固定说法） |
| keyboard shortcuts / accessibility | 键盘快捷方式 / 辅助功能 | 官方正文（快捷方式 57 / 快捷键 19；辅助功能 34 / 可访问性 5） |
| codespace / prebuild | 代码空间 / 预生成 | 用户规定（第 3 节；官方正文 codespace 1610 / 代码空间 891）；预生成 286 / 预构建 82。Create codespace → 创建代码空间；Your codespaces → 你的代码空间；Prebuild configuration → 预生成配置；dev container → 开发容器 |
| build | 构建 | 官方正文。Build → 构建；例外：页面（Pages）设置 Build and deployment → 生成和部署，prebuild → 预生成 |
| webhook / payload | Web 钩子 / 有效负载 | 用户规定（2026-10-28，第 3 节；与参考仓库一致；官方正文 Webhook 1928 / 网络钩子 66）。Webhooks → Web 钩子；Add webhook → 添加 Web 钩子；Payload URL → 有效负载 URL；Recent Deliveries → 最近交付；Deliveries → 交付记录；Redeliver → 重新传递；hook → 钩子（指 webhook 时 → Web 钩子）；pre-receive hook → 预接收钩子。GitHub 应用、OAuth 应用设置页（个人与组织拥有的）及市场上架项的 Web 钩子页的 delivery 作“请求”（用户规定 2026-11-20）：Recent deliveries → 最近请求；Redeliver、redelivery → 重新请求；存储库、组织 Web 钩子页不变 |
| gist / wiki / README | 代码片段 / Wiki / 自述文件 | gist、README 按用户规定（2026-10-28）译出，GitHub Gist → GitHub 代码片段；Wiki 是技术词，保留（第 3 节）。New gist → 新建代码片段；Your gists → 你的代码片段；public gist / secret gist → 公共代码片段 / 机密代码片段；Fork gist → 复刻代码片段；N gists → N 个代码片段；Add a README → 添加自述文件；profile README → 个人资料自述文件；README.md 等文件名、gist.github.com 等网址照原文 |
| single sign-on / identity provider | 单一登录 / 标识提供者 | 官方词汇表。SSO、SAML、IdP 保留 |
| code owner / achievement | 代码所有者 / 成就 | 官方词汇表、正文。CODEOWNERS 保留；成就名保留英文 |
| compare | 比较 | 官方正文。Compare changes → 比较更改；compare view → 比较视图 |
| dismiss | 消除 / 关闭 | 官方正文（界面名 Dismiss → 消除 4 / 关闭 2；Dismiss alert → 消除警报 5）。警报、审查 → 消除：Dismissed → 已消除，dismissal request → 消除请求，Dismiss review → 消除审查；横幅、提示 → 关闭 |
| outdated | 过时 | 官方正文（98 / 已过时 7）。审查评论徽章 Outdated → 过时；完整句可写“已过时” |
| stacked pull request | 堆叠式拉取请求 | 官方正文（94 / 25）。stack → 堆栈；unstack → 取消堆叠 |

## 5. 词典文件写法

```ts
import type { PageDictionary } from '../../core/types'
import { TIME_SOURCE, translateTime } from './helpers'

export default {
  // 精确匹配，全站生效。键是规范化原文：首尾去空白、连续空白合并为一个空格，区分大小写
  static: {
    'New issue': '新建议题'
  },
  // 仅本页面类型生效，优先于所有 static；用于同一原文在本页面需要不同译法
  scoped: {
    Open: '打开'
  },
  // 仅本页面类型生效（common 的规则全站生效）。必须 ^...$ 锚定，不得用 g / y / m / u / v 标志；
  // 顶层不得有 |，备选放进分组：/^(?:Open|Closed)$/
  regexp: [
    [/^(\d+) Open$/, '$1 个打开'],
    [new RegExp(`^opened (${TIME_SOURCE})$`), (_, time) => `${translateTime(time)}打开`]
  ],
  // 仅本页面类型生效的额外忽略选择器（整块用户内容）
  ignore: ['.my-user-content'],
  // 按选择器改写属性：[选择器, 属性名, 正则, 替换]，命中后不查词典；忽略区域根元素自身的属性也按此处理
  attributeRules: [['.react-directory-filename-cell a', 'aria-label', /^(.+), \(Directory\)$/, '$1（目录）']],
  // 被元素拆开的整句：{} 是一个元素子节点（槽位），{#} 是只含数字的元素；译文用 {} 标出槽位，个数相同、位置不变
  inline: [['Are you sure you want to unblock {} from {}?', '确定要取消阻止 {} 访问 {} 吗？']],
  // 嵌套元素拆开的短语：元素内全部文字连成一段，再按 static / scoped / regexp 匹配
  mergeText: ['h3 > span[data-sr-feedback]'],
  // 名称表：默认标签名，全站生效；只在标签名称区域里整段、区分大小写匹配（见下方规则）
  labels: {
    bug: '缺陷'
  },
  // 说明表：默认标签的说明，全站生效；只在标签说明区域里整段、区分大小写匹配
  labelDescriptions: {
    'Good for newcomers': '适合新手'
  },
  // 标签说明区域里说明表未命中时再试的正则（Dependabot 按生态生成的说明），约束同 regexp
  labelRegexp: [[/^Pull requests that update ([\w.#+ -]{1,40}) code$/, '更新 $1 代码的拉取请求']],
  // 预置列表名表：星标列表的预置名称，全站生效；只在星标列表名称区域里整段、区分大小写匹配
  listNames: {
    '✨ Inspiration': '✨ 灵感'
  }
} satisfies PageDictionary
```

规则：

- `labels`、`labelDescriptions`、`labelRegexp` 只收 GitHub、Dependabot 预置的默认标签（第 4 节默认标签行）与名称区域里 GitHub 写入的占位文字，目前只在 `issues/labels.ts`：全站生效，同一原文先注册的生效；区域只有一段文字且整段区分大小写命中时翻译，名称区域（`core/ignore` 的 `LABEL_NAME_SELECTORS`）只查 `labels`，说明区域（`LABEL_DESCRIPTION_SELECTORS`）只查 `labelDescriptions`、再试 `labelRegexp`；static、scoped、regexp 与自定义词条都不参与。区域外同样的文字照常查 static / scoped / regexp：区域外也要译出的说明另收进 static、全站 regexp，译文相同。
- `listNames` 只收星标列表的预置名称（第 1 节），目前只在 `profile/tabs.ts`（`STAR_LIST_NAMES`）：全站生效，同一原文先注册的生效；星标列表名称区域（`core/ignore` 的 `LIST_NAME_SELECTORS`：星标页卡片标题、列表页标题、星标菜单的列表名与建议项）只有一段文字且整段区分大小写命中时翻译，其余保持原文、不记未翻译；static、scoped、regexp 与自定义词条都不参与，标签区域不查 `listNames`。区域外同样的文字照常查词典，由 `common-ui/actions.ts` 的 static 兜底，译文相同。
- 同一原文只在一个文件的 `static` 出现。多处页面共用的文字归 `common.ts`；其它文件不要重复收录 common 已有的词条。确需不同译法时用 `scoped`。
- 含变量（数字、名称、日期）的文字用 `regexp`，变量部分用捕获组原样保留。正则要具体，避免开头就是 `.*`、避免嵌套量词。
- 时间、日期一律用 `helpers.ts`：`TIME_SOURCE` / `DATE_SOURCE` / `RELATIVE_SOURCE` 拼规则，`translateTime()` 输出。
- GitHub 把一句话拆成多个元素时：各段之间都是元素（链接、`<strong>`、时间等）、语序要调整的，用 `inline` 整句收录（正则句型的槽位写 `\{\}` / `\{#\}`）；数字、月份被嵌套 `<span>` 隔开的短语（`October <span>2026</span>`、`<span>12</span> remaining items`），用 `mergeText` 声明外层元素；槽位元素（`<strong>` 等）里的词要按整句语境改译、`inline` 改不了槽位内文字的整句，也用 `mergeText` 声明外层元素，同时收录整句的 `static`（单文件模式提示 `Use the <strong>Previous</strong> and <strong>Next</strong> buttons …`：Previous / Next 是文件导航按钮，按片段会命中分页的“上一页 / 下一页”；选择器 `[class*="PopoverContent__"] > p`）；其余按片段分别收录（如 `Updated` + `<relative-time>`），译文要能独立成立。
- 文件超过约 800 行时拆分：在 `src/locales/zh-CN/<区域>/` 下建子文件，由 `<区域>.ts` 用 `mergeDictionaries()` 合并导出。
- 只能用相对路径导入（脚本通过 tsx 直接加载词典）。
- 自检：`bun run check:locale src/locales/zh-CN/<文件>.ts`，正则写单元测试 `tests/unit/locales/<区域>.test.ts`。
