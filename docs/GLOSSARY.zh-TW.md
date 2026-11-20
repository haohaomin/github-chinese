# 繁体中文翻译规范与术语表

词典文件：`src/locales/zh-TW/*.ts`，与 `src/locales/zh-CN/` 同名同键同结构（第 5 节）。所有繁体词典作者必须遵守本文件；繁体的译名、格式、写法以本文件为准。

本文件的说明用简体中文；「繁体」列与示例译文是繁体中文。各节编号与简体 `docs/GLOSSARY.md` 对应（第 1～5 节），第 6 节是繁体专用的审校表。

## 1. 原则

- 读者：台湾、香港、澳门及其他使用繁体中文的华语地区用户（浏览器语言 zh-TW、zh-HK、zh-MO、zh-Hant 都用这套词典）。用户规定：「繁体需要贴合台湾/澳门/香港/华语地区繁体使用群体的语境以及环境，也就是所谓的信达雅，不能直接简单粗暴替换」。做法：以台湾通行的书面语和软件用语为基准，港澳读者也能自然读懂；不用只在一地通行的口语。
- 从英文原文翻译。简体词典只用来查键的含义、所在界面和正则结构；不得逐字转写简体译文，不得做简繁字形转换。同一个英文词，简繁常是不同的词：issue 是「问题 / 議題」，fork 是「复刻 / 分叉」，default 是「默认 / 預設」。简体译文有误的，照英文原文译，不把错误带进繁体。
- 只翻译 GitHub 界面文字，用户内容（储存库名、用户名、文件名、分支名、提交消息、议题标题、标签名、主题、描述、Markdown 正文、代码）一律不译（同简体第 1 节；GitHub、Dependabot 预置的默认标签名与说明是例外，见第 4 节默认标签行；星号清单的预置名称同简体：🔮 Future ideas → 🔮 未來構想，🚀 My stack → 🚀 我的技術堆疊，✨ Inspiration → ✨ 靈感）。繁体词典与简体的键完全相同，不新增、不删减词条（第 5 节）。
- 译文准确、简短、自然，避免翻译腔和大陆用语（第 6 节）。按钮 2～6 字为宜。能省则省：`Learn more about X` → `瞭解 X`。
- 人称用「你」，不用「您」（Chromium 繁中 你 1407 / 您 42；与简体一致）：`你的個人檔案`、`你的組織`。
- 同一概念全站同一译法，以本文件为准。表内没有的词：先在已有繁体词典里搜同一英文的译法，保持一致；再按下面的来源与取舍原则决定；仍拿不准的记进术语疑问交主流程，不自造新词。
- 不用地方口语和网络用语：不用「喔、啦、唷、囉」，不用粤语口语（嘅、咗、唔、喺、嘢），不用网络流行语。

### 参考来源

GitHub 没有官方繁体中文界面或文档（docs.github.com 只有简体中文），不存在「官方繁体译法」。依次参考：

1. 台湾科技媒体：iThome「GitHub」标签页前 9 页的 108 篇报道（2024–2026 年，抓取于 2026-10-28）。GitHub、Git 概念词的主要依据。备注写「iThome」加计数。
2. 微软繁中界面：VS Code 繁体中文语言包（`microsoft/vscode-loc` 的 `vscode-language-pack-zh-hant`，含内置 Git、GitHub 扩展）。GitHub 母公司的用语，开发术语与 Copilot 用语的依据。备注写「VS Code 繁中」加计数。
3. Google 繁中界面：Chromium `generated_resources_zh-TW.xtb`，以及 Gmail、Google 云端硬盘。浏览器与网页通用界面词的依据。备注写「Chromium 繁中」加计数。
4. Apple、Facebook、Instagram、YouTube、LINE 繁中界面：社群类说法（追蹤、留言、帳號、封鎖）。
5. Pro Git 繁中版（`git-scm.com/book/zh-tw/v2`）。
6. Gitea、GitLab 繁中翻译：只作旁证。两者质量参差、混有大陆用语，不单独作依据。
7. 台湾教育部《重訂標點符號手冊》与标准字体：标点、用字。

### 取舍原则

1. 用户规定优先（第 2 节标点、第 3 节产品名、第 4 节 Web 鉤子）。
2. GitHub、Git 概念词：取台湾科技媒体与开发者社群的通行说法；媒体没写过的，取 VS Code 繁中，再取 Pro Git 繁中版。
3. 通用界面词：取台湾主流软件（微软、Google、Apple）一致的说法；微软与 Google 不一致时，取网页用户更熟悉的 Google 说法（tab → 分頁，不用「索引標籤」；extension → 擴充功能，不用「延伸模組」；go to → 前往，不用「移至」）。另有理由的在备注写明（pin 取微软「釘選」，account 取「帳號」）。
4. 会让同一界面两个元素同名、或与另一常用术语撞词的译法不采用，改取次选并在备注写明（fork 不用「分支」，与 branch 撞；tag 不用「標籤」，与 label 撞）。
5. 台湾与港澳说法不同的，取台湾说法；台湾说法属于口语、俚语时，取两地都通的书面说法。
6. 简体表的结构性规则（标点随原文、空格、名词 / 动词 / 状态对应、量词、产品名译成中文）繁体同样执行；具体用词按以上原则重新选，不照搬简体。

备注栏里「现有繁体表」指本文件改版前的繁体术语表；「改」表示本版修订了旧译。

### 专名

国家/地区（common/regions.ts）、自然语言名（explore/languages.ts）、时区与城市（settings-account/time-zones.ts、profile/timezones.ts）一律用 Unicode CLDR 繁体中文（zh-Hant）名称，Chrome、Android、iOS 繁中界面同源。台湾译名与大陆音译大量不同（澳大利亚 / 澳洲、意大利 / 義大利、阿塞拜疆 / 亞塞拜然、山地时间 / 山區時間），照简体转字形得到的就是大陆用语。

- 核对：地区名用 Node 的 `new Intl.DisplayNames('zh-TW', { type: 'region' })`，语言名用 `type: 'language'`；时区名用 `new Intl.DateTimeFormat('zh-TW', { timeZone, timeZoneName: 'longGeneric' })`。
- 国家/地区：Australia → 澳洲；New Zealand → 紐西蘭；Italy → 義大利；Saudi Arabia → 沙烏地阿拉伯；Azerbaijan → 亞塞拜然；South Korea / Korea, South → 南韓；North Korea / Korea, North → 北韓。
- 语言名作「X文」：Arabic → 阿拉伯文；Afrikaans → 南非荷蘭文；Chinese → 中文。
- 时区与城市：Mountain Time (US & Canada) → 山區時間（美國和加拿大）；Mexico City → 墨西哥市。
- CLDR 不收的（美国州、加拿大省、部分城市和语言名），用台湾通行全称：New Jersey → 紐澤西州；British Columbia → 卑詩省。
- 照英文原文译，不沿用简体文件按国内规范加的前缀：Taiwan → 台灣；Hong Kong → 香港；Macao / Macau → 澳門；Hong Kong SAR China → 中國香港特別行政區；Macao SAR China → 中國澳門特別行政區（与 CLDR 一致）。
- CLDR 名称里自带的「與」「及」照写（波士尼亞與赫塞哥維納、千里達及托巴哥），不受第 2 节「并列」限制；CLDR 名称里的全形括号同样照写（國際文（E）），不受第 2 节括号规则限制。
- 例外：CLDR 译名会与常用词撞词的改用通行名（Central America → 中美洲，不用 CLDR 的「中美」）；Intl 会把部分语言代码换成别名、得到另一种语言的名称，这几条按原文另译（Twi → 特威文、Tagalog → 他加祿文、Bihari languages → 比哈爾文），核对时不按 Intl 改回。
- 音译用的「里」是繁体正字（馬德里、里斯本、斯里蘭卡、千里達及托巴哥、史瓦希里文），不改「裡」；检查脚本已按词放行现有专名，新出现的处理见第 5 节「自检」。

## 2. 格式

逐条对应简体第 2 节；末尾的并列、用字、一简对多繁三条是繁体补充。

- 标点随原文（用户规定）：原文没有标点，译文也不加任何标点；原文结尾没有标点，译文结尾也不加（`Learn more` → `瞭解詳情`，不写 `瞭解詳情。`；`Sort by` → `排序依據`，不写 `排序：`）。原文有的标点按下列各条转换。
- 中文句子用全形标点：，。、：；？！（）「」『』。引号用「」，引号里再引用用『』（教育部《重訂標點符號手冊》，港澳同样通行）；不用弯引号“”‘’。原文的 `"…"`、`“…”` 转成「…」；`'…'`、`‘…’` 在「」内转成『…』，单独出现时转成「…」。数字、英文字母一律半形。
- 括号：括号内有中文用全形 `（）`，两侧不加空格：`權杖（傳統）`、`（選填）`。括号内全是英文、数字或缩写时用半形 `()`，与两侧中文之间各加一个空格：`雙重驗證 (2FA)`、`單一登入 (SSO) 設定`（同简体）。
- 省略号随原文：原文 `...` 保留 `...`，原文 `…` 用 `…`，不改写成 `……`：`Commit changes...` → `提交變更...`、`Commit changes…` → `提交變更…`。
- 破折号：句中连接两个分句的 `—` 译作 `——`，两侧不加空格；`—` 用作分隔符时（`X — Y`、`Created … — forked from …`）照原文保留，两侧空格不变。
- 斜线：中文之间的 `/` 两侧不加空格：`開啟/關閉`、`國家/地區`；按键、路径、命令照原文。
- 中文与英文单词之间加一个空格：`在 GitHub 上`、`使用 Copilot`。
- 中文与数字之间加一个空格，日期、时长同样加：`3 個提交`、`共 12 項`、`2024 年 1 月 5 日`、`3 天前`、`約 1 年前`、`5 分鐘`。这与引擎给 `<relative-time>` 补空格的做法一致：繁体页面的时间元素按 `lang="zh-TW"` 由浏览器渲染，相对时间本身是「3 天前」，日期是「2024年1月5日」，引擎在中文与数字相接处补空格，显示为「2024 年 1 月 5 日」；词典生成的时间必须与之相同。年份用西元年，不换算民国纪年。「周」一律写「週」（`本週`、`每週`、`第 N 週`、`週一`）；星期全称仍作「星期一」…「星期日」。无数字的「剛剛、昨天、今天、明天、上週、去年」不变。日期、相对时间由 `src/locales/zh-TW/helpers.ts` 生成，时刻由 `common-ui/time.ts` 的 `formatClock` 生成（第 5 节）。
- 时刻与繁体 Intl 一致：上午 / 下午 + 12 小时制，小时不补零；原文是 24 小时制的同样换算（`23:53` → `下午 11:53`，`00:05` → `上午 12:05`）。`今天 上午 7:05`、`10 月 16 日 上午 7:51`。带时刻的完整时间里，时区与浏览器本地时区相同时不写（用户规定，2026-10-28）：`2026 年 10 月 26 日 下午 8:33`；不同时放在末尾方括号里：`2026 年 7 月 15 日 上午 11:05 [PDT]`。`<relative-time>` 显示的本地时区名由引擎去掉。引擎给时间元素设 `hour-cycle="h12"`，浏览器默认 24 小时制时元素显示的时刻同样如此。
- 全形标点两侧不加空格。引擎会处理原文里的空白：译文以全形标点开头或结尾时，不保留那一侧的原文空白；元素末尾译出全形标点时，紧跟的文字不留开头空白（`<span>提示：</span>按 …`）；元素开头译出全形标点时，前面的文字不留结尾空白（`描述<span>（選填）</span>`）；元素的文字之后变了，紧邻的文字随之重算；`<relative-time>` 等时间元素的显示文字由引擎补空格。词典不必为此改写。
- 计数量词（拿不准时用「個」）：
  - 個：物件——提交、檔案、議題、拉取請求、分支、標記、標籤、發行版本、套件、儲存庫、分叉、專案、項目、工作流程、作業、權杖、金鑰等（`3 個提交`）。
  - 位：人——使用者、成員、協作者、貢獻者、追蹤者、關注者、審查者、贊助者、擁有者、管理員（`12 位成員`，现有繁体表）。泛指人数可写「N 人」。
  - 則：留言、回覆、通知、訊息（`5 則留言`，台湾网站通行）。
  - 次：次数——貢獻、執行、複製、瀏覽、造訪、下載（`120 次貢獻`）。
  - 項：检查、搜索结果、工作清单（`4 項檢查`、`約 30 項結果`、`3/5 項工作`）。
  - 顆：星号计数（`1.2k 顆星`，iThome「8.4萬顆星」）。
  - 筆：资料记录、导入导出的条目（`已匯入 3 筆`、`20 筆記錄`）。
  - 部：装置、影片（`2 部裝置`、`5 部影片`，Apple、Google、YouTube 繁中）。
  - 處：变更处（`3 處變更`）。
  - 家：公司、合作伙伴（`5 家合作夥伴`）；所：学校、教育机构（`2000 所教育機構`）；款：工具、产品（`80 款工具`）。
  - 量词随名词：同一句型里的名词可能是人也可能是物时（替换函数从查表常量取名词），按名词选「位」或「個」，不统一写「個」（写法见第 5 节）。
- 保留原文中的技术记号：`@user`、`#123`、`owner/repo`、`git clone`、快捷键。
- 操作动词（VS Code 繁中 按一下 122 / 點選 11；Chromium 繁中 按一下 67 / 點選 36）：
  - click → 按一下；double-click → 按兩下；right-click → 按一下右鍵；tap（行动装置）→ 點一下。
  - select：选中列表项、文字、档案、复选框 → 選取（`Select all` → `全選`，`3 selected` → `已選取 3 個`）；从几个选项里挑一个（choose、pick，下拉式选单的 Select…）→ 選擇（`Select a tier` → `選擇等級`）。
  - drag → 拖曳；scroll → 捲動；press（按键）→ 按。
- 译文提到其他界面元素（按钮、分页、选单项）时，用该元素在本词典中的繁体译名，不括注英文，不保留英文原名（第 3 节不翻译的名称除外）；原文给界面名加了引号的，译文用「」：`Click "Star"` → `按一下「加星號」`。原文没加引号的不补。
- 名词、动词、状态：动作用动词，状态用「已＋动词」，撤销用「取消＋动词」；台湾界面有固定说法的从固定说法：
  - Pin、Pinned、Unpin → 釘選、已釘選、取消釘選
  - Archive、Archived、Unarchive → 封存、已封存、取消封存
  - Subscribe、Subscribed、Unsubscribe → 訂閱、已訂閱、取消訂閱
  - Approve、Approved → 核准、已核准
  - Assign、Assigned、Unassign → 指派、已指派、取消指派
  - Link、Linked、Unlink → 連結、已連結、取消連結
  - Hide、Hidden、Unhide → 隱藏、已隱藏、取消隱藏
  - Resolve、Resolved、Unresolve → 解決、已解決、取消解決
  - Save、Saved、Unsave → 儲存、已儲存、取消儲存
  - Enable、Enabled、Disable、Disabled → 啟用、已啟用、停用、已停用
  - Verify、Verified、Unverified → 驗證、已驗證、未驗證
  - 固定说法：Star、Starred、Unstar → 加星號、已加星號、移除星號（Gmail、Google 云端硬盘繁中）；Lock、Locked、Unlock → 鎖定、已鎖定、解除鎖定（VS Code 繁中）；Block、Blocked、Unblock → 封鎖、已封鎖、解除封鎖（Facebook、LINE 繁中）；Follow、Unfollow → 追蹤、取消追蹤；Watch、Unwatch → 關注、取消關注；Dismiss、Dismissed 按对象分译（第 4 节 dismiss 行）。
- 进行体：表示当前用户的持续关系，或按钮切换后的状态时，用「动词＋中」（台湾界面惯用，如「追蹤中」），不与按钮同译：`Watching` → `關注中`；`Following` → `追蹤中`；`Sponsoring` → `贊助中`。带宾语时用「正在＋动词」：`Sponsoring owner/repo` → `正在贊助 owner/repo`。
- 进度提示：单独出现的进度动名词作「X中」：`Loading…` → `載入中…`、`Saving…` → `儲存中…`、`Deleting…` → `刪除中…`；带宾语或主语时用「正在」：`Loading files…` → `正在載入檔案…`、`Copilot is working…` → `Copilot 正在工作…`。
- 并列：
  - 名词并列用「和」（`機密和變數`、`SSH 和 GPG 金鑰`），原文的 `&` 同样译「和」（`Verified & approved domains` → `已驗證和核准的網域`）。
  - 动作并列用「並」（`Approve and deploy` → `核准並部署`、`Close with comment` → `留言並關閉`）。
  - 两个动词互为逆操作的二元并列用「和」：`Can upload and download this package.` → `可上傳和下載此套件。`；`pinned and unpinned` → `釘選和取消釘選`。
  - 同一句里已有「並」时，其余动作并列用顿号：`Build, test, and deploy your code.` → `建置、測試並部署程式碼。`；`View and edit external custom properties …, and manage the app installations …` → `查看、編輯…外部自訂屬性，並管理…應用程式安裝`。
  - 不混用「與」「及」；固定说法（`Q&A` → `問與答`）和专名（第 1 节「专名」）除外。
- 用字：用教育部标准字体，不用香港或旧字形：裡（不写裏）、著（不写着）、線（不写綫）、為（不写爲）、群（不写羣）、峰（不写峯）、衛（不写衞）、鉤（不写鈎：`Web 鉤子`、`鉤子`）。「里」用于「里程碑」和音译专名（馬德里、斯里蘭卡），不改「裡」；「裡」只用于里外的「裡」（這裡、檔案裡）。固定写法：發布（不写發佈）、記錄（名词、动词同，不写紀錄）、身分（不写身份）、帳號 / 帳單 / 帳務（不写賬）、週（星期义）、祕密（不写秘密）、瞭解（不写了解）、計畫（名词：`開發人員計畫`）、佈景主題、回覆（reply，不写回復）。易混字分清：復原（undo、recover）、還原（restore、revert）、複製（copy、clone）、覆寫（overwrite）、重複（duplicate）。
- 一简对多繁、`check:locale` 查不出的字，逐字核对：製 / 制（複製、製作；控制、限制）、準 / 准（標準、準備；核准）、係 / 繫 / 系（關係；聯繫；系統）、註 / 注（註冊、註解、附註；注意、注入）、徵 / 征（特徵）、捲（捲動，不写卷動）、併 / 並（合併、併入；並且、核准並部署）、籤 / 簽（標籤；簽署、簽章）、曆 / 歷（日曆；歷史記錄）、台（台灣、平台、後台，不写臺）。

## 3. 不翻译与产品名

用户规定（2026-10-27）：界面上不能留下成排的英文产品名、方案名（「产品名和计划名改成中文（如 Actions → 操作），不然一排全是中文就这不是中文不是很怪异吗，不知道的还以为是bug导致的没翻译呢」）。产品名、功能名、方案名、客户端名中由英文普通词构成的部分一律译成中文，带 GitHub / Copilot 前缀的全称同样译出后半部分；只保留自造品牌词与技术缩写。繁体同样执行：台湾媒体习惯保留英文产品名（iThome 写「GitHub Actions」「Codespaces」），按用户规定仍译出。

- 保留的品牌词（同简体）：GitHub、Git、Copilot、Dependabot、CodeQL、Spark、npm、Docker、Azure、Patreon 等第三方品牌。Gist 按用户规定（2026-10-28）译成「程式碼片段」（第 4 节）。
- 保留的技术缩写与技术词（同简体）：LICENSE、CODEOWNERS、SSH、GPG、HTTPS、URL、API、CLI、MCP、JSON、YAML、OAuth、SAML、SSO、2FA、PR、OIDC、Markdown、Wiki、ZIP、Cookie；AI、CI/CD、IDE、SDK、DNS、IP 等通用缩写同样保留。Webhook 按用户规定（2026-10-28）译成「Web 鉤子」，README 指讀我檔案这个概念时译成「讀我檔案」（第 4 节），指具体文件名（README.md）时照原文。
- 单个字母、纯符号、版本号、哈希、路径、电子邮件地址、网址。
- 用户内容照旧不译（第 1 节）：储存库名、工作流程名、主题名里的 Actions、Pages 等单词不是产品名。

产品名、功能名译名表（全站同一译法；译名中的概念词与第 4 节一致）：

<!-- prettier-ignore -->
| 英文 | 繁体 | 备注 |
| --- | --- | --- |
| Actions / GitHub Actions | 動作 / GitHub 動作 | 用户规定（简体作「操作」）。action 在微软繁中界面通译「動作」（VS Code「更多動作」）；「操作」在台湾偏指操作方法、操作说明，不用。储存库分页、设定侧栏、帐务项目、权限名都用；可重复使用的单个 action 同样 → 動作；Actions minutes → 動作分鐘數 |
| Codespaces / GitHub Codespaces / codespace | 程式碼空間 / GitHub 程式碼空間 / 程式碼空間 | 用户规定。Create codespace → 建立程式碼空間；Your codespaces → 你的程式碼空間；core hours → 核心時數 |
| Pages / GitHub Pages | 頁面 / GitHub 頁面 | 用户规定；微软 Learn 繁中同作「GitHub 頁面」。Build and deployment → 建置和部署；Page build → 頁面建置；Pages site → 頁面網站（简体此处用「生成」，繁体 build 一律「建置」，没有例外） |
| Packages / GitHub Packages | 套件 / GitHub 套件 | iThome 套件 283 次。Container registry → 容器登錄庫 |
| Marketplace / GitHub Marketplace | 市集 / GitHub 市集 | iThome「延伸套件市集」「MCP伺服器市集」；现有繁体表同。Search Marketplace → 搜尋市集；Marketplace apps → 市集應用程式；其中的 action / app → 動作 / 應用程式 |
| Projects / Issues / Discussions / Sponsors / Models（含 GitHub 前缀） | 專案 / 議題 / 討論 / 贊助 / 模型 | GitHub Sponsors profile → GitHub 贊助個人檔案；侧栏赞助者列表标题 Sponsors → 贊助者 |
| Advanced Security / Code Security / Secret Protection / Advisory Database（含 GitHub 前缀） | 進階安全性 / 程式碼安全性 / 機密保護 / 公告資料庫 | 功能名里的 security → 安全性（VS Code 繁中）；secret → 機密（第 4 节 secret 行） |
| GitHub Desktop / GitHub Mobile | GitHub 桌面版 / GitHub 行動版 | mobile 台湾作「行動」。GitHub CLI、Copilot CLI 保留（CLI 是技术缩写） |
| GitHub Education / GitHub Classroom / GitHub Skills | GitHub 教育 / GitHub 教室 / GitHub 技能 | classroom 台湾作「教室」（简体「课堂」）。Student Developer Pack → 學生開發人員套件；GitHub Campus Expert → GitHub 校園專家 |
| Copilot Chat / Spaces / Memory / Autofix / Workspace / Extensions | Copilot 聊天 / 空間 / 記憶 / 自動修正 / 工作區 / 擴充功能 | VS Code 繁中「聊天」「工作區」；fix → 修正。Copilot code review / cloud agent / coding agent → Copilot 程式碼審查 / 雲端代理 / 程式開發代理（iThome「程式開發代理」8 次） |
| Mission Control / Copilot in the cloud | 任務控制中心 / 雲端 Copilot | 代理的任务控制中心 |
| Enterprise Cloud / Enterprise Server / Enterprise Managed Users (EMU) | 企業雲端 / 企業伺服器 / 企業受控使用者 (EMU) | managed 取微软繁中「受控」（受控識別、受控裝置）。GitHub Enterprise Cloud → GitHub 企業雲端 |
| Premium support / Pulse / Beta | 進階支援 / 統計 / 測試版 | premium 取 VS Code 繁中 Copilot 的「進階」（「進階要求」），微软方案名同样把 Premium 译「進階」；与 advanced 同译，两者不在同一元素上出现。Premium Plus Support → 進階增強支援。Pulse 取「脈動」（「掌握產業脈動」的脈動，指近期动态；简体「脉搏」是生理用语，繁体不照搬）。Preview 仍 → 預覽 |
| Code Quality / GitHub Stars | 程式碼品質 / GitHub 之星 | GitHub Stars 是社群计划，与星号无关；GitHub Universe（活动名）保留 |
| 第三方产品名 | 原文 | Microsoft Teams、Gemini Pro、Team Foundation Version Control、Visual Studio Code 等不属于 GitHub 的产品名保留 |

方案名一律译成「X 版」：GitHub Free / Pro / Team / Enterprise → GitHub 免費版 / 專業版 / 團隊版 / 企業版；Copilot Free / Pro / Pro+ / Business / Enterprise → Copilot 免費版 / 專業版 / 專業增強版 / 商務版 / 企業版；Copilot for Business → Copilot 商務版；Copilot Student → Copilot 學生版；GitHub Teams（教育页）→ GitHub 團隊版。Business 取微软繁中方案名的「商務版」（Microsoft 365 商務標準版），不用「商業版」。单独出现的 Free / Pro / Pro+ / Team / Enterprise / Business 指方案时同样 → 免費版 / 專業版 / 專業增強版 / 團隊版 / 企業版 / 商務版（Try Enterprise → 試用企業版；Upgrade to Business → 升級到商務版）。价格义 Free 仍 → 免費（Install it for free → 免費安裝）；全局导航的 Enterprise 栏目 → 企業；team 概念 → 團隊。第三方市集应用自己起的方案名按常见英文词照译（Open Source → 開源，Free → 免費版，Premium → 進階版），译不了的保留原文。

GitHub App、OAuth app → GitHub 應用程式、OAuth 應用程式。现有繁体表写「保留」，按用户规定改译；app 译「應用程式」，是微软、Google 繁中的通行说法。

## 4. 术语表

本节的「 / 」只用于分隔并列的英文或译法，不是界面文字。前 138 行与简体第 4 节逐行对应（顺序相同）；表末「繁体补充」是繁体额外需要统一的词。国家/地区、语言、时区名见第 1 节「专名」；大陆用语对照在第 6 节（旧版在第 4 节）。

<!-- prettier-ignore -->
| 英文 | 繁体 | 备注 |
| --- | --- | --- |
| repository / repo | 儲存庫 | iThome 336 / 存放庫 0；微软繁中作「存放庫」（VS Code 繁中 128 / 儲存庫 1），台湾媒体与社群通行「儲存庫」，取后者；「倉庫」口语、「倉儲」「版本庫」是 Pro Git 繁中版旧译，不用。New repository → 新增儲存庫；Repository name → 儲存庫名稱；Your repositories → 你的儲存庫；Selected repositories → 選取的儲存庫 |
| pull request | 拉取請求 | 改（现有繁体表「提取要求」取自微软繁中）。iThome 2024–2026 年 17 篇报道写「拉取請求」共 34 次、「提取要求」0 次，台湾读者熟悉；「提取」在日常语里是提款、萃取，「提取要求」字面难懂。也不写「合併請求」（GitLab 的 merge request）。git pull 的 pull 同作「拉取」，不写「提取」。缩写 PR 保留。New pull request → 新增拉取請求；Create pull request → 建立拉取請求；Compare & pull request → 比較並建立拉取請求；动词 open → 建立 |
| issue | 議題 | iThome 报道 GitHub Issues 写「子議題（Sub-issues）、議題類型（Issue Types）」；Pro Git 繁中版、GitLab 繁中同；与「問題」（problem、question）分开；默认标签 question 作「疑問」（见默认标签行）。Issues → 議題；New issue → 新增議題；Create issue → 建立議題；Close issue / Reopen issue → 關閉議題 / 重新開啟議題；sub-issue / parent issue → 子議題 / 父議題；議題類型 / 議題範本 / 議題表單 / 議題欄位；draft issue → 草稿議題 |
| discussion | 討論 | New discussion → 新增討論；Start discussion → 發起討論；Start a new discussion → 發起新討論；Start poll → 發起投票；Mark as answer → 標示為答案；category → 類別；Answered / Unanswered → 已回答 / 未回答；预设类别 Announcements / General / Ideas / Polls / Q&A / Show and tell → 公告 / 一般 / 想法 / 投票 / 問與答 / 成果分享 |
| fork | 分叉 | iThome「分叉（fork）」12 次；GitLab 繁中同；现有繁体表同。不用「分支」（与 branch 撞词，VS Code 繁中有此混用）、「復刻」（台湾指旧商品重新推出）、「派生」。名词、动词同：Create fork → 建立分叉；Forked from → 分叉自；Sync fork → 同步分叉；Forks → 分叉；fork network → 分叉網路 |
| star / starred / unstar | 加星號 / 已加星號 / 移除星號 | Gmail、Google 云端硬盘繁中「已加星號」；iThome「為儲存庫加上星號」；现有繁体表同。名词 Stars（分页、排序）→ 星號；计数用「顆星」（N stars → N 顆星）。Star this repository → 為此儲存庫加星號；Unstar this repository → 移除此儲存庫的星號；带计数时括号照第 2 节：Star this repository (N) → 為此儲存庫加星號 (N)；Starred, click to unstar this repository → 已加星號，按一下可移除此儲存庫的星號；N users starred this repository → N 位使用者為此儲存庫加了星號；Star / Unstar this gist → 為此程式碼片段加星號 / 移除此程式碼片段的星號；starred repositories / topics → 已加星號的儲存庫 / 主題；starred owner/repo（动态）→ 為 owner/repo 加了星號；Your stars → 你的星號；Most stars → 最多星號 |
| stargazers | 加星號的使用者 | 清楚，不生造词。不用「觀星者」（直译带比喻，界面上费解）、「加星者」（生造）。N stargazers → N 位加星號的使用者 |
| watch / watching / unwatch / watchers | 關注 / 關注中 / 取消關注 / 關注者 | 储存库通知订阅。Gitea 繁中、现有繁体表同；微软「監看」偏监视义，不用。与 follow（追蹤）分开（简体两者同作「关注」，繁体不同名）。计数片段 watching（N watching）→ 位關注者；Unwatch all → 全部取消關注；Watched repositories → 已關注的儲存庫；All Activity → 所有活動；Participating and @mentions → 參與和 @提及；Ignore → 忽略；Custom → 自訂 |
| follow / unfollow | 追蹤 / 取消追蹤 | 用户。Facebook、Instagram 繁中用语；现有繁体表同 |
| followers / following | 追蹤者 / 追蹤中 | 同上。N followers → N 位追蹤者；N following → 追蹤 N 人（计数不是当前用户的关系，不用进行体；「N 追蹤中」数字直接接动词，不成短语）。简体用 inline `{} following` 和正则 `^(…) following$` 调整语序，繁体照做：`追蹤 {} 人`、`追蹤 $1 人`。Following 分页、单独的 following 片段 → 追蹤中 |
| commit | 提交 | VS Code 繁中 Git 扩展、Pro Git 繁中版、iThome 都用「提交」；微软旧译「認可」与 approve 义近，不用。名词、动词同：Commits → 提交；Commit changes → 提交變更；committed → 提交於；N commits → N 個提交；committer → 提交者（不写「認可者」） |
| commit message | 提交訊息 | VS Code 繁中 Git 扩展 |
| branch | 分支 | New branch → 新增分支；Delete branch / Restore branch → 刪除分支 / 還原分支；Update branch → 更新分支；Switch branches/tags → 切換分支/標記 |
| default / base / head / compare branch | 預設分支 / 基底分支 / 來源分支 / 比較分支 | base 取微软繁中的「基底」（基底類別、重定基底）；head branch 是带变更的一侧，取「來源分支」与「基底分支」相对，不用字面的「頭部分支」。base: / compare: → 基底： / 比較：；base / head repository → 基底儲存庫 / 來源儲存庫 |
| upstream | 上游 | Pro Git 繁中版。upstream repository → 上游儲存庫；N commits ahead of / behind → 領先 / 落後 N 個提交 |
| tag | 標記 | 改（现有繁体表 tag、label 同作「標籤」）。台湾 Git 资料（Pro Git 繁中版、VS Code 繁中）多作「標籤」，但 GitHub 同时有 label，同名会让发行版本页、筛选器里两者分不开。label 在界面更常见，取 Gmail 繁中的「標籤」；tag（给某个提交做记号）让开，取「標記」。GitLab 繁中反过来（tag 作「標籤」、label 作「標記」），不采用；不用「版本標記」（偏长，tag 不只标版本）。Tags → 標記；Create new tag → 建立新標記；Choose a tag → 選擇標記；tag ruleset → 標記規則集；tag protection → 標記保護；tagged → 已標記；容器映像檔的 tag 同译 |
| label | 標籤 | 议题、拉取请求、讨论上的标签（Gmail 繁中「標籤」）。New label → 新增標籤；Edit labels → 編輯標籤；labeled → 加上了標籤；Release label → 發行版本標籤 |
| 默认标签：bug / documentation / duplicate / enhancement / good first issue / help wanted / invalid / question / wontfix / dependencies / accessibility | 錯誤 / 說明文件 / 重複 / 改進 / 適合新手的議題 / 需要協助 / 無效 / 疑問 / 不予修正 / 相依項目 / 無障礙 | 用户要求（2026-10-29），收录与生效范围同简体：名称区域只查 `issues/labels.ts` 的名称表 `labels`，说明区域只查说明表 `labelDescriptions` 与标签正则 `labelRegexp`，整段、区分大小写匹配时翻译；自定义标签（含与默认说明同形的名称、与默认标签名同形的说明）和区域外同形的词照旧不译，自定义词条不参与；区域外含默认标签名的无障碍名称、整句由 regexp、属性规则调用 `labelName()` 同译，只认默认名；默认说明在说明表与 static 各收一份、译文相同。译名与本表一致：bug 同「錯誤追蹤」；documentation 同 docs 行「說明文件」；duplicate 同 close 行的关闭原因「重複」；wontfix 同警报解除原因、审查讨论串解决原因 won't fix 的「不予修正」，不用关闭原因 not planned 的「不予處理」；dependencies 同 dependency graph 行；accessibility 同 keyboard shortcuts 行；help wanted 取「需要協助」（「幫助」偏口语）；question 作「疑問」，不作「問題」（与 problem 相混）。默认说明照原句译，弯引号、直引号两种写法都收：Something isn’t working → 某些功能無法正常運作；Good for newcomers → 適合新手；Pull requests that update a dependency file → 更新相依性檔案的拉取請求。Dependabot 按生态生成的说明 Pull requests that update X code → 更新 X 程式碼的拉取請求，同一条规则放在标签正则与 `common-ui/labels.ts` 的 regexp（全站生效）；生态名不译，产品名按第 3 节译：GitHub Actions → GitHub 動作。预览令牌的占位文字 Label preview → 標籤預覽，同收进名称表，令牌的 aria-label 与令牌同译。无障碍名称、整句示例：依標籤錯誤篩選、標籤：疑問、移除標籤：需要協助（含删除按钮的提示文字，常态下按钮名称取自提示）、已封存不予修正、已封存 scope: vapor、说明提示的 aria-label、封存确认句。已知限制同简体 |
| release | 發行版本 | 现有繁体表同。台湾「發行版」专指 Linux 发行版（iThome「發行版」6 处都是此义，release 义写「發行版本」），不用。Releases（侧栏、分页、页面标题、通知事件）→ 發行版本；Draft a new release → 草擬新發行版本；Publish release → 發布發行版本；Set as the latest release → 設為最新發行版本；+ N releases → + N 個發行版本；發行版本页分页 Releases / Tags → 發行版本 / 標記；release notes → 版本資訊（VS Code 繁中 19 次）；Generate release notes → 產生版本資訊；Latest → 最新；动词 publish → 發布 |
| pre-release | 發行前版本 | 改（现有繁体表「預發行版本」）。VS Code 繁中「發行前版本」20 次、「預發行」0 次。This is a pre-release → 這是發行前版本；pre-release terms → 發行前版本條款 |
| milestone | 里程碑 | 「里」不写「裡」（第 2 节「用字」）。New milestone → 新增里程碑 |
| project / item | 專案 / 項目 | iThome 專案 137 次。Projects → 專案；Projects (classic) → 專案（傳統）；project board → 專案看板；view → 檢視；item → 項目：Add item → 新增項目，N items → N 個項目，Archived items → 已封存的項目，Import items from repository → 從儲存庫匯入項目 |
| iteration / roadmap | 迭代 / 藍圖 | iThome 迭代 4 / 疊代 0；roadmap 台湾通行「藍圖」（产品藍圖）。iteration field → 迭代欄位；Current iteration → 目前迭代 |
| organization | 組織 | Your organizations → 你的組織；organization account → 組織帳號；organization owner → 組織擁有者 |
| team | 團隊 | child / parent team → 子團隊 / 父團隊；secret / visible team → 祕密團隊 / 可見團隊；team maintainer → 團隊維護者 |
| enterprise | 企業 | enterprise account → 企業帳號；Your enterprises → 你的企業；方案名 GitHub Enterprise → GitHub 企業版（第 3 节） |
| member / owner | 成員 / 擁有者 | owner 取微软、Google 繁中「擁有者」，「所有者」不用。N members → N 位成員；People（组织分页）→ 人員；code owner → 程式碼擁有者 |
| collaborator / outside collaborator | 協作者 / 外部協作者 | Invite collaborator → 邀請協作者 |
| contributor | 貢獻者 | Contributors → 貢獻者；first-time contributor → 首次貢獻者；contributors graph → 貢獻者圖表；Participants → 參與者 |
| maintainer | 維護者 | Allow edits by maintainers → 允許維護者編輯；Maintain 角色 → 維護 |
| author | 作者 | commit author → 提交作者；authored → 撰寫於 |
| actor | 執行者 | 触发事件、执行动作的人或应用。简体作「参与者」；繁体用「執行者」更直白，「參與者」留给 participant。Filter by actor → 依執行者篩選；bypass actors → 可繞過的執行者 |
| assignee / assign | 負責人 / 指派 | 现有繁体表、Gitea 繁中同。Assignees → 負責人；Assign yourself → 指派給自己；No one assigned → 無負責人；assigned → 已指派；Unassign → 取消指派 |
| reviewer / review | 審查者 / 審查 | iThome 程式碼審查 17 次；现有繁体表同；VS Code 繁中作「檢閱」，不用。Reviewers → 審查者；Review changes → 審查變更；Start a review → 開始審查；Submit review → 送出審查；Request review / Re-request review → 請求審查 / 重新請求審查；review request → 審查請求；Viewed → 已查看；code review → 程式碼審查；review comment → 審查留言 |
| approve / request changes | 核准 / 要求變更 | VS Code 繁中「核准」156 次。审查者的 request changes 是要求，用「要求」；其余 request 名词用「請求」（pull request 行）。Approved → 已核准；Changes requested → 已要求變更；N changes requested → N 個變更要求 |
| comment | 留言 | 台湾网站通行（Facebook、YouTube 繁中「N 則留言」）；现有繁体表同。代码里的 comment → 註解（VS Code 繁中 169 次）。Comment（按钮、审查类型选项）→ 留言；Add a comment → 新增留言；Close with comment → 留言並關閉；Hide comment → 隱藏留言；N comments → N 則留言 |
| conversation / thread | 對話 / 討論串 | thread 取台湾论坛与 Pro Git 繁中版的「討論串」（简体作「线程」）；「執行緒」只指程序线程。Conversation → 對話；Lock conversation / Unlock conversation → 鎖定對話 / 解除鎖定對話；Resolve conversation / Unresolve conversation → 解決對話 / 取消解決對話；comment thread / review thread → 留言討論串 / 審查討論串；Copilot 聊天的 conversation、thread → 對話 |
| mention | 提及 | @mentions → @提及；mentioned you → 提及了你；Mentioned（筛选）→ 提及我的 |
| reaction / emoji | 表情回應 / 表情符號 | 现有繁体表同；emoji 取 Apple、Google 繁中「表情符號」。Add reaction → 新增表情回應；Most reactions → 最多表情回應；Eyes → 眼睛 |
| notification / inbox | 通知 / 收件匣 | Gmail、Outlook 繁中「收件匣」。Notification settings → 通知設定；Manage notifications → 管理通知；participating notifications → 參與的通知；Done → 完成；Saved → 已儲存；Mark as read / unread → 標示為已讀 / 未讀 |
| subscribe / unsubscribe / subscription | 訂閱 / 取消訂閱 / 訂閱 | Subscribed → 已訂閱；计费义 subscription 同作「訂閱」；Manage subscription → 管理訂閱 |
| dashboard / feed | 儀表板 / 動態 | personal dashboard → 個人儀表板；For you → 為你推薦 |
| profile / profile picture / avatar | 個人檔案 / 頭像 / 頭像 | profile 取社群网站通行的「個人檔案」（Facebook、Instagram 繁中）；「個人資料」在台湾指个人数据（個資），不用。头像取台港澳都通用的「頭像」（香港 Facebook 繁中，台湾 Discord、Steam 繁中）；「大頭貼」源自大头贴拍照机，属口语，在港澳多指贴纸照片，不用（取舍原则 5）。Your profile → 你的個人檔案；Edit profile → 編輯個人檔案；Change your avatar → 更換頭像；organization profile → 組織資料（「組織檔案」易读成组织的档案文件；「個人檔案」是社群网站的固定说法，不类推）；Remove photo → 移除相片。GitHub 应用、OAuth 应用的 logo / avatar → 標誌：Upload new logo → 上傳新標誌；Crop your new avatar → 裁切新標誌；Set new avatar → 設定新標誌；Delete this image → 刪除此標誌 |
| settings | 設定 | General → 一般；Access → 存取；Code, planning, and automation → 程式碼、規劃和自動化；Integrations → 整合；Danger Zone → 危險區域 |
| account | 帳號 | iThome 帳號 292 / 帳戶 2；Apple 繁中「Apple 帳號」，Facebook、LINE 同；现有繁体表同。微软、Google 繁中界面作「帳戶」，不采用。personal / organization / enterprise account → 個人帳號 / 組織帳號 / 企業帳號；Switch account → 切換帳號 |
| billing / plan / licensing | 帳務 / 方案 / 授權 | 改（现有繁体表 billing →「帳單」）。iThome 报道 GitHub 服务异常写「帳務及授權頁面」（即 Billing and licensing）。功能区、设定、角色用「帳務」，账单本身的内容用「帳單」，收费方式用「計費」。Billing and licensing → 帳務和授權；Billing settings → 帳務設定；billing manager → 帳務管理員；billing email / Billing information / billing address → 帳單電子郵件 / 帳單資訊 / 帳單地址；billing cycle → 帳單週期；Payment information / Payment method → 付款資訊 / 付款方式；Upgrade plan / Downgrade plan → 升級方案 / 降級方案；invoice billing → 發票付款；Switch to invoiced billing → 切換為發票付款；usage-based billing / metered billing → 依用量計費；价格义 Free → 免費；Copilot 的 Plan 模式与代理计划见表末繁体补充 |
| sponsor | 贊助 / 贊助者 | 按钮、动词 Sponsor → 贊助；人 → 贊助者（N sponsors → N 位贊助者）；Sponsoring（分页、已赞助按钮）→ 贊助中；tier → 等級（Sponsor tiers → 贊助等級；Select a tier → 選擇等級）；Sponsor / Sponsoring owner/repo（无障碍名称）→ 贊助 owner/repo / 正在贊助 owner/repo；Sponsoring as → 贊助身分；sponsored developer → 受贊助的開發人員；Private Sponsor → 不公開的贊助者（「私人贊助者」在台湾会读成个人（非企业）赞助者；与组织成员身分 Private → 不公開一致） |
| marketplace | 市集 | 用户规定（第 3 节）；iThome「延伸套件市集」。Search Marketplace → 搜尋市集；Marketplace apps → 市集應用程式；其中的 action / app → 動作 / 應用程式；listing → 上架資訊：Create draft listing → 建立上架資訊草稿；页头 Edit X → 編輯 X |
| explore / trending | 探索 / 熱門 | 现有繁体表同。Trending repositories / developers → 熱門儲存庫 / 熱門開發人員；趋势页分页 Repositories / Developers → 儲存庫 / 開發人員；See more trending developers → 查看更多熱門開發人員；Today / This week / This month → 今天 / 本週 / 本月 |
| topic / collection | 主題 / 精選集 | collection 是人工挑选的储存库清单，取「精選集」（现有繁体表）。Manage topics → 管理主題；外观的 theme 作「佈景主題」，不与 topic 同名 |
| workflow / run / job / step | 工作流程 / 執行 / 作業 / 步驟 | iThome 工作流程 63 次、「工作流」0 次；VS Code 繁中同。All workflows → 所有工作流程；Run workflow → 執行工作流程；workflow run → 工作流程執行；Re-run jobs / Re-run all jobs → 重新執行作業 / 重新執行所有作業；Cancel run → 取消執行；N runs → N 次執行 |
| Queued / In progress / Success / Failure / Cancelled / Skipped | 已排入佇列 / 進行中 / 成功 / 失敗 / 已取消 / 已略過 | 运行、检查、部署状态。佇列、略過、逾時、擱置取 VS Code 繁中（佇列 20、略過 44、逾時 13、擱置 24）。Completed → 已完成；Timed out → 已逾時；Action required → 需要採取動作；Startup failure → 啟動失敗；Neutral → 中性；Stale → 過時；Expected → 等待回報；Waiting for status to be reported → 正在等待回報狀態；Waiting → 等待中；Pending（检查、作业、部署）→ 擱置中；pending runs / requests / review comments / invitations → 待處理；pending collaborators → 待加入的協作者 |
| runner / artifact / cache | 執行器 / 成品 / 快取 | iThome 執行器 12 次；VS Code 繁中 成品 23、快取 84。GitHub-hosted runner → GitHub 代管的執行器（hosted 取微软「代管」，iThome「代管執行環境」）；self-hosted runner → 自架執行器（iThome「自架執行器」「自架Runner」）；larger runners → 較大型執行器；runner group → 執行器群組；artifact attestations → 成品證明；Copilot、議題、拉取請求中的 artifact 作「附件」（同简体） |
| secret / variable | 機密 / 變數 | 改（现有繁体表「祕密」取自微软繁中）。凭据类 secret 取台湾媒体的「機密」（iThome「Actions機密憑證」「CI/CD機密」）。Secrets and variables → 機密和變數；Repository secrets / Environment secrets → 儲存庫機密 / 環境機密；secret scanning → 機密掃描；client secret → 用戶端密碼（微软繁中）。表示「不公开」的 secret 另作「祕密」：secret gist → 祕密程式碼片段；secret team → 祕密團隊 |
| environment / deployment | 環境 / 部署 | Review deployments → 審查部署；Approve and deploy → 核准並部署；deployment protection rules → 部署保護規則；deployment history → 部署歷史記錄 |
| package / container / registry / image | 套件 / 容器 / 登錄庫 / 映像檔 | iThome 套件 283 次、「NPM登錄庫」「Docker映像檔」；现有繁体表同（image 本版补）。Packages → 套件；N packages → N 個套件；package manager → 套件管理員；Container registry → 容器登錄庫；container image → 容器映像檔；Custom images → 自訂映像檔；runner image → 執行器映像檔；Base images → 基底映像檔；Image version → 映像檔版本；host image → 主機映像檔；图片义 image → 圖片；mirror → 鏡像（与 image 分开） |
| security / advisory / vulnerability / alert | 安全性 / 公告 / 漏洞 / 警示 | 功能、分页名 Security → 安全性（VS Code 繁中）；iThome 漏洞 534 / 弱點 17；alert → 警示（VS Code 繁中、iThome）。Security and quality → 安全性和品質；security advisory → 安全性公告；private vulnerability reporting → 私下回報漏洞；Dependabot alerts → Dependabot 警示；警示列表 Open / Closed → 未解決 / 已關閉；严重性 Critical / High / Moderate / Low → 重大 / 高 / 中 / 低（iThome「重大層級漏洞」）；bug、漏洞的 report → 回報 |
| code scanning / secret scanning / push protection | 程式碼掃描 / 機密掃描 / 推送保護 | 改（现有繁体表「祕密掃描」），随 secret 行。「推送保護」见 VS Code 繁中 GitHub 扩展。bypass → 繞過（iThome 19 次）：Bypass push protection → 繞過推送保護；bypass list → 繞過清單；Add bypass → 新增繞過；bypass request → 繞過請求；skip 另作「略過」 |
| dependency graph / dependents | 相依性圖表 / 被相依項目 | dependency 取「相依」（iThome 相依 26 / 依賴 7；VS Code 繁中「相依性」）。Dependencies → 相依項目；Dependents → 被相依項目（改：现有繁体表「相依項目」与 Dependencies 同名；不用「相依者」，易读成人）。Used by（侧栏计数）→ 採用者：不作「使用者」（台湾指 user），不作「使用此儲存庫」（偏长，后接计数不成句） |
| insights / traffic / network / Pulse | 洞察 / 流量 / 網路 / 統計 | insights 取「洞察」（现有繁体表；微软「深入解析」偏长，不用）；Pulse → 統計（用户规定，与简体「统计」一致）。Insights → 洞察；Community insights → 社群洞察；Network graph → 網路圖表；Clones / Visitors → 複製次數 / 訪客；Referring sites → 參照網站；Popular content → 熱門內容 |
| code / file / folder / directory | 程式碼 / 檔案 / 資料夾 / 目錄 | Go to file → 前往檔案；Add file → 新增檔案；Create new file → 建立新檔案；Upload files → 上傳檔案；root directory → 根目錄；file extension → 副檔名 |
| blame / raw / history | 追溯 / 原始檔 / 歷史記錄 | blame 台湾没有通行译法，取「追溯」（逐行追溯来源；现有繁体表同）。history 取 Chromium 繁中「歷史記錄」108 次（VS Code 繁中作「歷程記錄」）；改（现有繁体表「歷史紀錄」，记字统一作「記錄」）。History → 歷史記錄；View raw → 查看原始檔；commit history → 提交歷史記錄 |
| diff / patch | 差異 / 修補檔 | Load diff → 載入差異 |
| merge / merge conflict | 合併 / 合併衝突 | Merge pull request → 合併拉取請求；Confirm merge → 確認合併；Create a merge commit → 建立合併提交；Merged → 已合併；Resolve conflicts → 解決衝突；Mark as resolved → 標示為已解決；Commit merge → 提交合併 |
| squash and merge / rebase and merge | 壓縮並合併 / 重定基底並合併 | VS Code 繁中「重定基底」。Confirm squash and merge → 確認壓縮並合併；Confirm rebase and merge → 確認重定基底並合併；设定项 Allow squash merging / Allow rebase merging → 允許壓縮合併 / 允許重定基底合併 |
| rebase / cherry-pick / revert | 重定基底 / 揀選 / 還原 | VS Code 繁中 Git 扩展。Update with rebase → 以重定基底更新；命令名照原文 |
| merge queue / auto-merge | 合併佇列 / 自動合併 | iThome「合併佇列」7 次。Merge when ready → 準備就緒時合併；Add to merge queue → 加入合併佇列；Enable auto-merge / Disable auto-merge → 啟用自動合併 / 停用自動合併 |
| checks / status check | 檢查 / 狀態檢查 | check run / check suite → 檢查執行 / 檢查套件；Re-run checks → 重新執行檢查；required status checks → 必要狀態檢查；N checks → N 項檢查 |
| files changed | 變更的檔案 | Files changed（分页）→ 變更的檔案；N files changed → 已變更 N 個檔案 |
| suggestion / suggested change | 建議 / 建議的變更 | Commit suggestion → 提交建議；Add suggestion to batch → 將建議加入批次 |
| draft / ready for review | 草稿 / 可供審查 | Mark as ready for review → 標示為可供審查；Convert to draft → 轉換為草稿；draft pull request → 草稿拉取請求；Save draft → 儲存草稿；动词 draft → 草擬 |
| Open / Closed / Merged（状态） | 開放中 / 已關閉 / 已合併 | 改（现有繁体表「開啟」）。状态词用「開放中」，与「已關閉」对称（Gitea 繁中同）；动词 open 仍作「開啟」（档案、连结）或「建立」（议题、拉取请求）。计数作定语：N Open / N Closed → N 個開放中 / N 個已關閉；里程碑进度片段 open / closed → 個開放中 / 個已關閉；Closed as completed / not planned / duplicate 见 close 行；单独的状态徽章 → 開放中；警示列表见 security 行 |
| close / reopen | 關閉 / 重新開啟 | 关闭原因 completed / not planned / duplicate → 完成 / 不予處理 / 重複。not planned 取「不予處理」（议题追踪里 won't fix 一类的通行说法，简短）；不用「未列入計畫」（偏长，且与 plan 的「方案」「計畫」相混）。Close as completed / not planned / duplicate → 關閉並標示為完成 / 關閉並標示為不予處理 / 關閉並標示為重複；Closed as completed / not planned / duplicate → 已關閉並標示為完成 / 已關閉並標示為不予處理 / 已關閉並標示為重複 |
| lock / unlock | 鎖定 / 解除鎖定 | VS Code 繁中「解除鎖定」；现有繁体表同。Locked → 已鎖定；Lock branch → 鎖定分支 |
| pin / pinned | 釘選 / 已釘選 | VS Code 繁中 釘選 48 / 固定 9；现有繁体表同。Chromium 繁中作「固定」，但「固定」另有 fixed 义，不用；「置頂」只用于贴文。Unpin → 取消釘選；Pin issue → 釘選議題；Customize your pins → 自訂釘選項目；Pinned repositories → 已釘選的儲存庫 |
| archive / archived | 封存 / 已封存 | VS Code、Gmail 繁中；现有繁体表同。Unarchive → 取消封存；Archive this repository → 封存此儲存庫；GitHub Archive Program → GitHub 封存計畫 |
| template | 範本 | Template repository → 範本儲存庫；Use this template → 使用此範本；generated from → 產生自 |
| mirror | 鏡像 | mirrored from → 鏡像自；image 见 package 行 |
| Public / Private / Internal | 公開 / 私人 / 內部 | 可见度，只用于储存库、套件、专案、程式碼空間转发连接埠等资源（YouTube 繁中「公開 / 不公開 / 私人」，VS Code 繁中「私人 GitHub 存放庫」；现有繁体表同）。Make public / Make private → 設為公開 / 設為私人。非可见度义：public preview → 公開預覽；private preview → 私人預覽；public key / private key → 公開金鑰 / 私密金鑰（微软繁中）；public profile → 公開個人檔案；组织成员身分 Public / Private → 公開 / 不公開；Make profile private and hide activity → 將個人檔案設為私人並隱藏活動；Keep my email addresses private → 不公開我的電子郵件地址；private contributions → 私人貢獻 |
| visibility | 可見度 | VS Code 繁中 可見度 42 / 可見性 2。Change visibility → 變更可見度 |
| transfer | 轉移 | 储存库、拥有权、议题、讨论统一「轉移」（微软繁中「轉移擁有權」；简体分「转让 / 转移」，繁体不分）。Transfer ownership → 轉移擁有權；Transfer repository → 轉移儲存庫；Transfer issue → 轉移議題；data transfer → 資料傳輸 |
| license | 授權條款 | 改（现有繁体表「授權」）。台湾说「MIT 授權條款」「開源授權條款」。「授權」单用会与计费的 licensing、OAuth 的 authorize 撞词（取舍原则 4），「新增授權」易读成新增一项授权。MIT license → MIT 授權條款；License（侧栏、分页）→ 授權條款；Add a license → 新增授權條款；Choose a license → 選擇授權條款；计费义 Licensing / license seats → 授權 / 授權席次；authorize（OAuth 授权）→ 授權 |
| about / description / website | 關於 / 描述 / 網站 | 改（现有繁体表 description →「說明」）。description 取「描述」（VS Code 繁中 123 次），「說明」留给 help、docs |
| language | 語言 | 自然语言名见第 1 节「专名」 |
| contribution / activity / overview | 貢獻 / 活動 / 總覽 | 改（现有繁体表 overview →「概觀」）。overview 是通用界面词，按取舍原则 3 取 Google 繁中界面的「總覽」（Search Console），台港澳都通行；微软的「概觀」在港澳少见，不用。Overview（个人资料、组织、脈動等页面的分页）→ 總覽；contribution graph → 貢獻圖表；N contributions → N 次貢獻 |
| sign in / sign up / sign out | 登入 / 註冊 / 登出 | Sign out from all accounts → 登出所有帳號 |
| username / password / email | 使用者名稱 / 密碼 / 電子郵件 | email address → 電子郵件地址；Primary email address → 主要電子郵件地址；email notifications → 電子郵件通知；Forgot password? → 忘記密碼？ |
| two-factor authentication / authentication | 雙重驗證 / 身分驗證 | 2FA 取台湾通行的「雙重驗證」（Facebook、Instagram 繁中；现有繁体表同）；authentication → 身分驗證（iThome 21 / 身份驗證 0），verify、verification → 驗證。2FA 保留；Two-factor methods → 雙重驗證方式；Enable two-factor authentication → 啟用雙重驗證；Password and authentication → 密碼和身分驗證；authentication code → 驗證碼；authenticator app → 驗證器應用程式 |
| passkey / security key | 密碼金鑰 / 安全金鑰 | Chromium 繁中 密碼金鑰 95、安全金鑰 66（Windows 繁中同）；现有繁体表同。Apple 作「通行密鑰」，不采用 |
| recovery codes | 復原碼 | 微软繁中。Download recovery codes → 下載復原碼 |
| SSH key / GPG key / deploy key | SSH 金鑰 / GPG 金鑰 / 部署金鑰 | SSH and GPG keys → SSH 和 GPG 金鑰；New SSH key → 新增 SSH 金鑰；Add deploy key → 新增部署金鑰；Allow write access → 允許寫入權限；signing key → 簽署金鑰；signature → 簽章 |
| vigilant mode / verified | 警戒模式 / 已驗證 | Partially verified → 部分驗證；Unverified → 未驗證 |
| personal access token / fine-grained | 個人存取權杖 / 精細 | iThome 個人存取權杖 5、「精細度存取權杖」3；權杖 65 / 令牌 19；VS Code 繁中「權杖」75。改（现有繁体表「細粒度」偏学术）。Fine-grained tokens → 精細權杖；Tokens (classic) → 權杖（傳統）；token → 權杖（含 OAuth token、模型用量的 token）：N tokens → N 個權杖，input / output tokens → 輸入 / 輸出權杖。经典令牌列表的作用域代码显示为说明、以顿号分隔（admin:enterprise, admin:gpg_key → 完全控制企業、完全控制使用者公開 GPG 金鑰），新建、编辑表单里的代码不译 |
| ruleset / branch protection rule | 規則集 / 分支保護規則 | New branch ruleset / New tag ruleset → 新增分支規則集 / 新增標記規則集；Add classic branch protection rule → 新增傳統分支保護規則；Branch name pattern → 分支名稱模式；protected branch → 受保護的分支；classic → 傳統 |
| enforce | 強制執行 | Enforcement status → 強制執行狀態；Enforce HTTPS → 強制使用 HTTPS |
| app / integration | 應用程式 / 整合 | 改（现有繁体表 GitHub App、OAuth App 保留），见第 3 节。GitHub App → GitHub 應用程式；OAuth app → OAuth 應用程式；Authorized OAuth Apps → 已授權的 OAuth 應用程式；Authorized GitHub Apps → 已授權的 GitHub 應用程式；Install / Configure / Suspend → 安裝 / 設定 / 暫停 |
| permission / role / admin | 權限 / 角色 / 管理員 | 储存库角色 Read / Triage / Write / Maintain / Admin → 讀取 / 分類 / 寫入 / 維護 / 管理員（角色 Write 与留言框分页 Write 分译，见 write 行、第 5 节）；Base permissions → 基本權限；Repository roles → 儲存庫角色；read access / write access → 讀取權限 / 寫入權限 |
| triage | 分類 | triage access → 分類權限 |
| block / report | 封鎖 / 檢舉 | 台湾社群网站通行（Facebook、LINE 繁中）；现有繁体表同。Unblock → 解除封鎖；Blocked users → 已封鎖的使用者；Block or report → 封鎖或檢舉；Report abuse → 檢舉濫用；Report content → 檢舉內容；Report to repository admins → 向儲存庫管理員檢舉；议题依赖 Blocked by / Blocking → 受阻於 / 阻擋（不用「封鎖」）；稽核记录 Blocked by → 封鎖者；报表义 report → 報告 |
| moderation / moderators | 內容審核 / 版主 | moderators 取台湾论坛、Facebook 社团通行的「版主」；moderation 取「內容審核」，与 audit（稽核）、review（審查）分开（简体作「调解」）。Moderation options → 內容審核選項；动词 moderate → 審核；存储库角色 Moderate → 審核（All-repository moderate → 所有儲存庫審核）；严重性 Moderate → 中 |
| interaction limits | 互動限制 | Temporary interaction limits → 暫時互動限制；Limit to existing users / prior contributors / repository collaborators → 僅限現有使用者 / 僅限先前的貢獻者 / 僅限儲存庫協作者 |
| audit log / security log | 稽核記錄 / 安全性記錄 | audit 取台湾通行的「稽核」（iThome 20 次，「審計」0 次）；log → 記錄 |
| saved replies / scheduled reminders | 已儲存的回覆 / 排定的提醒 | scheduled 取微软繁中「排定」 |
| custom properties / autolink references | 自訂屬性 / 自動連結參考 | Add autolink reference → 新增自動連結參考 |
| custom domain / domain | 自訂網域 / 網域 | Add domain → 新增網域；Verify domain → 驗證網域；Verified & approved domains → 已驗證和核准的網域；Publisher domain → 發行者網域 |
| search / filter / sort | 搜尋 / 篩選 / 排序 | Filter / Filters（按钮、名词）→ 篩選器（Gmail 繁中「篩選器」）；Clear filters → 清除篩選器；Sort by → 排序依據；Group by → 分組依據；Slice by → 切分依據；筛选、排序里的 by → 依（Filter by actor → 依執行者篩選） |
| newest / oldest / recently updated | 最新 / 最舊 / 最近更新 | Least recently updated → 最久未更新；Recently created / Least recently created → 最近建立 / 最早建立；Most commented → 最多留言；Last updated → 上次更新 |
| edit / delete / cancel / save | 編輯 / 刪除 / 取消 / 儲存 | Save changes → 儲存變更；Discard changes → 捨棄變更 |
| create / new / add / remove | 建立 / 新增 / 新增、加入 / 移除 | 微软繁中：Create → 建立，New → 新增，Remove → 移除，Delete → 刪除，各自固定、不混用（简体 Remove 多作「删除」，繁体不照搬）。New X → 新增 X；Create X → 建立 X；Add X → 新增 X；放进已有集合的 Add to X → 加入 X（Add to merge queue → 加入合併佇列；Add to project → 加入專案）；分译时的键处理见第 5 节 |
| update / submit | 更新 / 送出 | submit 取台湾网页表单通行的「送出」，与 commit（提交）分开；现有繁体表同。Submit review → 送出審查；Submit new issue → 送出新議題 |
| copy / copied! | 複製 / 已複製！ | Copy to clipboard → 複製到剪貼簿；clone 同作「複製」（下一行） |
| download / upload / clone / share / embed | 下載 / 上傳 / 複製 / 分享 / 內嵌 | 现有繁体表同。clone 取微软繁中的「複製」（VS Code 繁中 Git 扩展的 Clone 全作「複製」，「複製存放庫」）；「克隆」是大陆音译，不用（第 6 节）。单独出现或作名词、可能被读成 copy 的，加宾语或「用」字：Clone（程式碼面板标题）→ 複製儲存庫；`Clone using the web URL.` → `使用網頁 URL 複製儲存庫。`；Clone URL → 複製用 URL；Clone issue → 複製議題；Clones（流量图）→ 複製次數；git clone 等命令照原文。资源、权限共用义 share → 共用（微软繁中）；Share feedback → 提供意見回饋 |
| link / connect / associate | 連結 / 連接 / 關聯 | Link a pull request → 連結拉取請求；Linked pull requests → 已連結的拉取請求；Unlink → 取消連結；Connect repository → 連接儲存庫；网路连线 connection → 連線；linked branch → 已連結的分支 |
| go to | 前往 | Chromium 繁中 前往 160 / 移至 20（VS Code 繁中反之）。Go to file → 前往檔案；Go to settings → 前往設定；Go to definition → 前往定義 |
| enable / disable / enabled / disabled | 啟用 / 停用 / 已啟用 / 已停用 | 「禁用」是大陆用语 |
| required / optional / default | 必填 / 選填 / 預設 | 表单字段 Required → 必填、Optional → 選填（台湾表单通行；现有繁体表同）；规则要求（required status checks / reviews / workflows，检查列表徽章 Required）→ 必要；非表单的 optional → 選用；分译时的键处理见第 5 节 |
| write / preview | 撰寫 / 預覽 | 留言框分页 Write → 撰寫（现有繁体表同）；权限级别 Write → 寫入（简体两者同作「写入」，繁体分开）；分译时的键处理见第 5 节（projects/settings.ts 的角色 Write 依赖全局词条） |
| details / preferences | 詳細資料 / 偏好設定 | VS Code 繁中「詳細資料」56 次；preferences 取 Chromium 繁中「偏好設定」22 次（微软作「喜好設定」）。View details / Show details → 查看詳細資料 / 顯示詳細資料；Manage cookie preferences → 管理 Cookie 偏好設定 |
| learn more / show more / load more | 瞭解詳情 / 顯示更多 / 載入更多 | Chromium 繁中「瞭解詳情」99 次；现有繁体表同。Learn more about X → 瞭解 X；Show less → 顯示較少 |
| loading… | 載入中… | 其他进度提示见第 2 节 |
| previous / next | 上一頁 / 下一頁 | 分页；条目导航 → 上一個 / 下一個 |
| feedback / docs | 意見回饋 / 說明文件 | feedback 取 Chromium 繁中「意見回饋」17 次（微软作「意見反應」）；现有繁体表同。Give feedback → 提供意見回饋；GitHub Docs → GitHub 說明文件；help → 說明 |
| public preview | 公開預覽 | iThome 13 次。Preview（徽章）→ 預覽；Beta → 測試版（第 3 节）；research preview → 研究預覽 |
| agent | 代理 | iThome「AI代理」；VS Code 繁中作「代理程式」，GitHub 界面取简短的「代理」。Agents → 代理；agent session → 代理工作階段；agent mode → 代理模式；coding agent → 程式開發代理；cloud agent → 雲端代理；custom agent → 自訂代理；Copilot cloud agent / Copilot coding agent → Copilot 雲端代理 / Copilot 程式開發代理 |
| custom instructions / prompt | 自訂指示 / 提示 | VS Code 繁中「自訂指示」「提示檔案」。repository / personal custom instructions → 儲存庫 / 個人自訂指示；prompt file → 提示檔案；system prompt → 系統提示 |
| usage | 使用量 | VS Code 繁中、iThome「依使用量收費」。Usage → 使用量；Metered usage → 計量使用量；included usage → 包含的使用量；usage limit → 使用量上限；usage report → 使用量報告；Token usage → 權杖使用量；premium requests → 進階請求（VS Code 繁中作「進階要求」；本表 request 名词统一作「請求」） |
| developer | 開發人員 | 界面用「開發人員」（VS Code 繁中 39 次，Android 繁中「開發人員選項」）；iThome 新闻多写「開發者」，界面不采用。Developer settings → 開發人員設定；Developer Program → 開發人員計畫；sponsored developer → 受贊助的開發人員 |
| keyboard shortcuts / accessibility | 鍵盤快速鍵 / 無障礙 | VS Code 繁中「鍵盤快速鍵」31 次；accessibility 取 Chromium 繁中「無障礙」（台湾政府与网页通行；微软作「協助工具」，Apple 作「輔助使用」） |
| codespace / prebuild | 程式碼空間 / 預先建置 | 用户规定（第 3 节）。Create codespace → 建立程式碼空間；Your codespaces → 你的程式碼空間；Prebuild configuration → 預先建置設定；dev container → 開發容器 |
| build | 建置 | VS Code 繁中、iThome（建置 56 次、「構建」0 次）。没有例外：页面（Pages）设定 Build and deployment → 建置和部署 |
| webhook / payload | Web 鉤子 / 承載 | 用户规定（2026-10-28 简体作「Web 钩子」，繁体保留同样的 Web + 中文结构）。hook 不取微软繁中的「勾點」（VS Code 繁中 勾點 100 / 鉤點 15）：「鉤子」与简体「钩子」一一对应，一般读者更易懂；「鉤」用教育部标准字，不写「鈎」。payload 取微软繁中「承載」。Webhooks → Web 鉤子；Add webhook → 新增 Web 鉤子；Payload URL → 承載 URL；Recent Deliveries → 最近傳遞；Deliveries → 傳遞記錄；Redeliver → 重新傳遞；hook → 鉤子（指 webhook 时 → Web 鉤子）；pre-receive hook → 預先接收鉤子。GitHub 应用、OAuth 应用设置页及市集上架资讯的 Web 鉤子页同样作「傳遞」（简体作“请求”）。请求详情的区块名 Headers / Payload / Body 照原文（用户规定 2026-11-20） |
| gist / wiki / README | 程式碼片段 / Wiki / 讀我檔案 | gist、README 按用户规定（2026-10-28）译出，GitHub Gist → GitHub 程式碼片段；README 取微软繁中术语的「讀我檔案」；Wiki 是技术词，保留（第 3 节）。New gist → 新增程式碼片段；public gist / secret gist → 公開程式碼片段 / 祕密程式碼片段；Fork gist → 分叉程式碼片段；Add a README → 新增讀我檔案；profile README → 個人檔案讀我檔案；README.md 等文件名、gist.github.com 等网址照原文 |
| single sign-on / identity provider | 單一登入 / 身分識別提供者 | 微软繁中。SSO、SAML、IdP 保留 |
| code owner / achievement | 程式碼擁有者 / 成就 | CODEOWNERS 保留；成就名保留英文 |
| compare | 比較 | Compare changes → 比較變更；compare view → 比較檢視 |
| dismiss | 解除 / 駁回 / 關閉 | 按对象分译（简体统一作「消除」）。警示 → 解除（Dismiss alert → 解除警示；Dismissed → 已解除；dismissal request → 解除請求）；审查 → 駁回（Dismiss review → 駁回審查；Dismissed → 已駁回）；横幅、提示 → 關閉；分译时的键处理见第 5 节 |
| outdated | 過時 | 审查留言徽章 Outdated → 過時；完整句可写「已過時」 |
| stacked pull request | 堆疊式拉取請求 | iThome「堆疊式PR」。stack → 堆疊；unstack → 取消堆疊 |
| 繁体补充：change / modify | 變更 / 修改 | Chromium 繁中 變更 238 / 更改 0。Changes → 變更；modify → 修改 |
| 繁体补充：view（动词）/ view（名词） | 查看 / 檢視 | 动词取 Google 繁中常用的「查看」（View all → 查看全部；Viewed → 已查看）；名词（专案的 view、compare view）取「檢視」（VS Code 繁中 880 次） |
| 繁体补充：session | 工作階段 | 微软、Chromium 繁中。Sign-in sessions → 登入工作階段；agent session → 代理工作階段 |
| 繁体补充：community | 社群 | iThome 34 / 社區 0。Community Standards → 社群標準；Code of conduct → 行為準則；Contributing → 貢獻指南 |
| 繁体补充：policy | 政策 | Privacy policy → 隱私權政策；Security policy → 安全性政策；retention policy → 保留政策；Repository policies → 儲存庫政策；allow list → 允許清單 |
| 繁体补充：certificate / credential | 憑證 / 認證資訊 | 台湾媒体两者常都写「憑證」，界面要分开：certificate → 憑證（Chromium 繁中 110 次），credential → 認證資訊 |
| 繁体补充：theme / appearance | 佈景主題 / 外觀 | 与 topic（主題）分开（VS Code 繁中「佈景主題」）。Light / Dark → 淺色 / 深色；dark mode → 深色模式 |
| 繁体补充：reply / quote / reference | 回覆 / 引用 / 參考 | N replies → N 則回覆；Quote reply → 引用回覆 |
| 繁体补充：group | 群組 | runner group → 執行器群組；user group → 使用者群組；Group by → 分組依據 |
| 繁体补充：match | 相符 | Chromium 繁中「相符」。N matching → N 個相符；No matches → 沒有相符項目 |
| 繁体补充：current | 目前 | Chromium 繁中 141 次。Current iteration → 目前迭代 |
| 繁体补充：not found / none yet | 找不到 / 尚無 | Chromium 繁中「找不到」38 次。No results → 沒有結果；None yet → 尚無 |
| 繁体补充：migrate / migration | 移轉 | 微软繁中。Start migration → 開始移轉 |
| 繁体补充：instance | 執行個體 | 微软繁中。GitHub Enterprise Server instance → GitHub 企業伺服器執行個體 |
| 繁体补充：configure / configuration | 設定 | configuration file → 設定檔 |
| 繁体补充：online / offline | 線上 / 離線 | |
| 繁体补充：artificial intelligence | 人工智慧 | 缩写 AI 保留 |
| 繁体补充：plan（Copilot） | 規劃 / 計畫 | Copilot 的 Plan 模式（copilot/agents 的权限模式）、动词 plan → 規劃（VS Code 繁中「規劃」）；代理产出的计划（名词，copilot/session-log）→ 計畫；计费 plan 仍作「方案」（billing 行） |
| 繁体补充：checkout | 簽出 / 結帳 | git checkout → 簽出（VS Code 繁中 23 次）：Checkout with GitHub CLI → 使用 GitHub CLI 簽出；购买流程的 Checkout → 結帳（Continue to checkout → 繼續結帳）；Check out the X → 查看 X |
| 繁体补充：annotation | 標註 | Actions 的 annotations、程式碼行旁的 annotations → 標註（Line N annotations → 第 N 行標註）；不作「註解」（代码注释，comment 行） |
| 繁体补充：pin（版本锁定） | 固定 | 把动作、相依项目锁定到某个版本或提交：Require actions to be pinned to a full-length commit SHA → 要求將動作固定到完整長度的提交 SHA；界面上的 pin 仍作「釘選」（第 4 节 pin 行） |
| 繁体补充：payload（攻击） | 酬載 | 安全性语境的攻击载荷（iThome「惡意酬載」）；webhook payload 仍作「承載」 |
| 繁体补充：threshold | 門檻 | 台湾一般读者更熟悉；不用「閾值」。Alert threshold → 警示門檻 |
| 繁体补充：best match | 最相符 | 搜寻排序 Best match → 最相符 |
| 繁体补充：render | 顯示 / 轉譯 | 界面上「显示出来」义（Graph could not be rendered → 無法顯示圖表）作「顯示」；Markdown、程式码等的技术处理义作「轉譯」 |
| 繁体补充：schedule / scheduled（Actions） | 排程 | 工作流程的 schedule 触发、scheduled workflow → 排程、排程工作流程；scheduled reminders 仍作「排定的提醒」 |
| 繁体补充：trigger / dispatch / ref / lockfile | 觸發條件 / 分派 / 參考 / 鎖定檔 | workflow_dispatch → 工作流程分派；Select ref → 選擇參考；Lockfile → 鎖定檔 |
| 繁体补充：compliance | 合規性 | 微软繁中 |
| 繁体补充：Built by（热门页） | 建立者 | 后接贡献者头像；不作「建置者」 |
| 繁体补充：build（非技术义） | 打造 / 建立 | 营销语、「做出某物」义作「打造」（Build what's next → 打造未來；Where software is built → 打造軟體的地方）；组合查询、检视作「建立」（Build complex filter queries → 建立複雜的篩選查詢）；软件建置仍作「建置」 |
| 繁体补充：agentic / runtime / queue time / exit code | 代理式 / 執行階段 / 佇列時間 / 結束碼 | runtime 取微软繁中；exit code 不写「結束代碼」 |
| 繁体补充：Active（状态） | 作用中 / 使用中 / 活躍 | 资源、规则、权杖、部署、执行器的启用状态 → 作用中（Inactive → 非作用中）；工作阶段、迭代、标签等「正在使用」→ 使用中；活跃度（分支、网路图）→ 活躍 |
| 繁体补充：ascending / descending | 遞增 / 遞減 | 排序读屏后缀 |
| 繁体补充：library / highlight | 程式庫 / 醒目提示 | highlight 指编辑器、程式码行的醒目提示（VS Code 繁中） |
| 繁体补充：Unified / Split（差异版面） | 統一 / 分割 | rich diff / source diff → 豐富差異 / 原始碼差異；Whitespace → 空白字元 |
| 繁体补充：notice | 提示 / 通知 | 标注级别、警示类型 → 提示；横幅通知 → 通知 |
| 繁体补充：command palette / breadcrumb / hovercard | 命令面板 / 導覽路徑 / 暫留卡片 | breadcrumb 不用「導覽標記」（与 tag 的「標記」撞词）；hover 取 VS Code 繁中「暫留」 |
| 繁体补充：unlock（营销义、成就） / training / jump to | 解鎖 / 訓練、培訓 / 跳至 | unlock 指开放功能、成就（解鎖社群洞察、已解鎖青銅）；锁定操作的 unlock 仍作「解除鎖定」。模型训练 → 訓練，人员培训 → 培訓 |
| 繁体补充：AI credits / billing entity | AI 點數 / 計費帳號 | |
| 繁体补充：context | 上下文 | LLM、Actions 表达式；帐号切换器的 context 按语境（Switch settings context → 切換要設定的帳號） |
| 繁体补充：preset / production | 預設集 / 正式環境 | preset 不作「預設選項」（会读成 default） |
| 繁体补充：agreement | 合約 / 協議 | Customer Agreement → 客戶合約（微软繁中）；Developer Agreement → 開發人員協議 |
| 繁体补充：Copilot in the cloud | 雲端 Copilot | |
| 繁体补充：coverage | 涵蓋範圍 / 涵蓋率 | 百分比、门槛语境 → 涵蓋率 |
| 繁体补充：check in / finding | 簽入 / 發現項目 | check in 与 checkout → 簽出 对称 |
| 繁体补充：regular expression / prefix / escape / parse | 規則運算式 / 前置詞 / 逸出 / 剖析 | HTML tag → 標籤（与 Git tag 的「標記」分开） |
| 繁体补充：exploit / reachability / snooze / manifest / transitive dependency | 漏洞利用程式 / 可達性 / 延後 / 資訊清單 / 間接相依項目 | |
| 繁体补充：passphrase / passwordless / scope | 複雜密碼 / 免密碼、無密碼 / 範圍 | passwordless sign-in → 免密碼登入；passwordless authentication → 無密碼身分驗證；OAuth、权杖的 scope → 範圍 |
| 繁体补充：updates | 動態 / 電子郵件更新 | 赞助者通讯 → 動態；订阅推送的 email updates → 電子郵件更新 |
| 繁体补充：account（金融） | 帳戶 | 银行、Stripe、PayPal 等收付款帐户 → 帳戶；登入帐号仍作「帳號」 |
| 繁体补充：minimize（留言） / Ignoring（通知） | 最小化 / 已忽略 | This comment has been minimized. → 此留言已最小化。 |
| 繁体补充：two-factor secret | 金鑰 | TOTP 共享密钥；与 setup key → 設定金鑰 对应 |
| 繁体补充：watch（Copilot 监看拉取请求） | 監看 | Copilot can watch this pull request → Copilot 可以監看此拉取請求；储存库通知订阅仍作「關注」 |
| 繁体补充：Try again. | 請再試一次。 | 错误信息里的句子加「請」（台湾界面惯用）；按钮 Try again → 再試一次 |
| 繁体补充：代碼（标识码） | 代碼 | 國家/地區代碼、錯誤代碼；程序代码仍作「程式碼」（`scripts/data/mainland-terms.ts` 按词放行） |

## 5. 词典文件写法

繁体词典是简体词典的同构翻译：文件、键、正则与简体相同，译文按英文原文重新翻译。

```ts
import type { PageDictionary } from '../../core/types'
import { TIME_SOURCE, translateTime } from './helpers'

export default {
  // 精确匹配，全站生效。键与简体同名文件完全相同，只改值
  static: {
    'New issue': '新增議題'
  },
  // 仅本页面类型生效，优先于所有 static；键与简体相同
  scoped: {
    Open: '開放中'
  },
  // 正则、标志、顺序与简体相同；替换文本、替换函数的输出按英文原文重新翻译
  regexp: [
    [/^(\d+) Open$/, '$1 個開放中'],
    [new RegExp(`^opened (${TIME_SOURCE})$`), (_, time) => `${translateTime(time)}建立`]
  ],
  // 与简体相同；选择器里匹配本扩展译文的中文改成繁体译文
  ignore: ['.my-user-content'],
  // 选择器、属性名、正则与简体相同，只改第四项
  attributeRules: [['.react-directory-filename-cell a', 'aria-label', /^(.+), \(Directory\)$/, '$1（目錄）']],
  // 第一项（原文句型）与简体相同；译文槽位 {} / {#} 的个数与先后顺序同原文
  inline: [['Are you sure you want to unblock {} from {}?', '確定要解除封鎖 {} 對 {} 的存取嗎？']],
  // 与简体相同；选择器里匹配本扩展译文的中文改成繁体译文
  mergeText: ['h3 > span[data-sr-feedback]'],
  // 名称表：键与简体相同，只改值
  labels: {
    bug: '錯誤'
  },
  // 说明表：键与简体相同，只改值
  labelDescriptions: {
    'Good for newcomers': '適合新手'
  },
  // 标签正则：正则、标志、顺序与简体相同；替换按英文原文重新翻译
  labelRegexp: [[/^Pull requests that update ([\w.#+ -]{1,40}) code$/, '更新 $1 程式碼的拉取請求']]
} satisfies PageDictionary
```

规则：

- 同名同键同结构（`bun run check:parity` 校验）：
  - 文件与子目录与简体一一对应；`src/locales/zh-TW/index.ts` 导出 `zhTW`，注册顺序、页面类型与简体 `zhCN` 相同。
  - `static`、`scoped` 的键集合与简体相同：不增、不减、不改键。简体在某页用 `scoped`、而繁体译法与 `static` 相同的，照样保留该键。名称表 `labels`、说明表 `labelDescriptions`、预置列表名表 `listNames` 同样（键集合与简体相同），`labelRegexp` 同 `regexp`；收录与生效范围见简体第 5 节。
  - 一个键不够分：简体共用一个键、本表要求繁体按语境分译的词（Write：留言框分页 撰寫 / 权限 寫入；Optional：選填 / 選用；Select：選取 / 選擇；Add：新增 / 加入；Open：開放中 / 開啟；Dismissed：已解除 / 已駁回），有 `scoped` 的，按 `scoped` 所在页面的语境译；只有全局 `static` 的，按该键所在文件的语境译（common-ui/editor.ts 的 Write → 撰寫；common-ui/status.ts 的 Open → 開放中；common-ui/actions.ts 表单字段的 Optional → 選填）。其他页面依赖这条全局键、需要另一种译法、本页又没有 `scoped` 键的，不在繁体单方面加键（`check:parity` 会报错），记进术语疑问（写明页面、原文、应有译法），由主流程在简繁两边同时补 `scoped` 键（简体值不变）。已知一处：projects/settings.ts 的角色 Write 依赖全局词条（简体注释写明不收 scoped 副本），繁体应作「寫入」。
  - `regexp` 的条数、顺序、`source`、`flags` 与简体相同。替换文本、替换函数的输出、查表常量的值，都按英文原文重新翻译，不是把简体译文转成繁体。引用的捕获组（`$1`、`$<名称>`）和调用的辅助函数不增不减，位置可按繁体语序调整；替换函数的参数、查表常量的键不变。例外：时刻按第 2 节换成 12 小时制，替换函数可以比简体多调用 `formatClock`（discussions/list.ts 的 was created by），也可以用模块内不导出的辅助函数代替简体的 24 小时制换算（gist.ts 的 `clockOf`）。
  - 量词按第 2 节随名词变化。简体在替换函数里写死「个」、名词从查表常量取，而表里人和物混在一起的（如 issues/filter.ts 的 `已选择 ${count} 个${PICKER_ITEMS[name] ?? …}`，表里 users、assignees、authors 是人），可以改拼接量词的写法：另建模块内的「键 → 量词」表，或按键选用「位」「個」。正则、捕获组、具名导出、原查表常量的键都不变。
  - `ignore`、`mergeText` 与简体相同；`attributeRules` 的选择器、属性名、正则与简体相同，只改第四项（替换文本）；`inline` 只改第二项（译文），槽位 `{}` / `{#}` 的个数与先后顺序同原文。例外：选择器里用来匹配本扩展译文的中文属性值，改成繁体文件里同一属性的译文，逐字一致，否则繁体页面上匹配不到（`check:parity` 不比较选择器引号里的中文）。目前只有 actions/workflows.ts 的 `ignore`：`[aria-label="筛选${FILTER_KEYS[key]}选项"]`、`[aria-label$="，${FILTER_PROVIDERS[name]}"]`，其中的中文改成繁体文件里对应 aria-label 译文的写法。
  - 具名导出（`export const` / `function` / `type`）与简体同名；为繁体新增的辅助常量、函数不导出。
  - 发现简体的键有问题（误收、漏收、正则错误），不在繁体里单独修，记下来交主流程，两边一起改。
- 只改译文。代码注释保持简体中文（项目规定）。注释里引用的简体译文、简体译法说明，改成本文件实际用的繁体译文；与繁体不符的说明改写或删去（如 projects/settings.ts 的「Write 角色由 common-ui 的全局词条译为“写入”…不收 scoped 副本」）。
- 被元素拆开、分别收录的片段（`Updated` + 时间元素、`N` + `followers`、`by` + 用户名），繁体译文要能独立成立，并和相邻片段、时间元素拼起来通顺。简体用 `inline`、`mergeText`、正则调整语序的地方，繁体照样调整，不逐个片段照搬英文语序。
- 时间、日期一律用 `src/locales/zh-TW/helpers.ts`，从 `./helpers` 相对导入；导出名与简体 helpers 相同：`TIME_SOURCE` / `DATE_SOURCE` / `RELATIVE_SOURCE` / `MONTH_SOURCE` 拼规则，`translateTime()` / `translateDate()` / `translateRelativeTime()` 输出，`joinCjk()` 拼接中文与变量，`mergeDictionaries()` 合并（另有 `formatDate`、`relativeTime`、`spaceDigits`）。输出写法（第 2 节）：`3 天前`、`2 小時後`、`約 1 年前`、`將近 2 年前`、`超過 3 年前`、`剛剛`、`昨天`、`今天`、`明天`、`上週`、`上個月`、`去年`、`2024 年 1 月 5 日`、`1 月 5 日`、`2024 年 1 月`。不新增手写的日期、相对时间规则。时刻用 `common-ui/time.ts` 的 `formatClock`（`translateAriaDate`、`translateCompactDate` 同在该文件），相对导入（pulls/comments.ts、discussions/list.ts、gist.ts）。简体文件里已有的星期、月份查表常量照样翻译（commits/date-picker.ts 的 Monday → 星期一、Week N → 第 N 週；profile/contributions.ts 的 Mon → 週一）。
- 只能用相对路径导入（脚本通过 tsx 直接加载词典）。
- 文件拆分与简体相同：简体在 `src/locales/zh-CN/<区域>/` 下拆了子文件、由 `<区域>.ts` 用 `mergeDictionaries()` 合并的，繁体照样拆、照样合并；不自行拆分或合并文件。
- 自检：`bun run check:locale --locale=zh-TW src/locales/zh-TW/<文件>.ts`（格式、标点、正则；繁体另查简体字、大陆用语、弯引号）与 `bun run check:parity src/locales/zh-TW/<文件>.ts`（简繁结构一致）。简体的正则单元测试不改。
  - 错误必须为 0。专名音译用的「里」（馬德里、里斯本、斯里蘭卡、千里達及托巴哥、模里西斯、史瓦希里文等 CLDR 繁中名称）与「里程碑」已在 `scripts/data/simplified-only.ts` 的 `TRADITIONAL_WORDS` 按词放行；新出现的音译专名被判为简体字时，确认是 CLDR 或台湾通行译名后把该词加入放行表，不改「裡」。
  - 大陆用语警告按本表判断，不照脚本括号里的建议改。本表选定的拉取（拉取請求）、項目（item）不在检查之列；登錄庫、用戶端、進行中与专名「聖皮埃與密克隆群島」检查时已放行（`scripts/data/mainland-terms.ts` 的 `ACCEPTED_WORDS`）。其余大陆用语警告按第 6 节改。
  - 弯引号、中英文缺空格的警告照改；确属合理的保留，并注明理由。

## 6. 大陆用语对照（审校必查）

出现左列写法即视为问题，按右列改写（结合语境）。一行有几个义项的，按括号里的英文义区分。左列是简体写法，审校时同样查它们的繁体字形（默认 → 默認）。按词判断：左列词是右列或本表其他译名的一部分时（發行版 / 發行版本、工作流 / 工作流程、域 / 網域），不算问题。第 5 节「自检」列出的放行词（拉取請求、登錄庫、用戶端、項目、進行中、音译用的「里」）照写。

### GitHub 概念

<!-- prettier-ignore -->
| 大陆用语 | 繁体用语 | 说明 |
| --- | --- | --- |
| 存储库、仓库、版本库 | 儲存庫 | |
| 问题（issue） | 議題 | 「問題」只用于 problem、question；默认标签 question 作「疑問」 |
| 复刻、派生、分支（fork 义） | 分叉 | |
| 星标、标星、加星标、取消星标 | 星號、加星號、移除星號 | 计数用「顆星」 |
| 标星者 | 加星號的使用者 | |
| 关注（follow）、关注者（followers）、正在关注（following） | 追蹤、追蹤者、追蹤中 | watch 仍作「關注」；N following 作「追蹤 N 人」 |
| 正在关注（watching） | 關注中 | |
| 发行版、发布（release 名词） | 發行版本 | 台湾「發行版」指 Linux 发行版 |
| 预发行版、预发布 | 發行前版本 | |
| 发行说明 | 版本資訊 | |
| 标签（tag） | 標記 | 「標籤」只用于 label |
| 标记为（mark as） | 標示為 | 標示為已讀 |
| 受理人、被分配者 | 負責人 | |
| 所有者 | 擁有者 | |
| 批准 | 核准 | |
| 评论（GitHub 留言） | 留言 | 代码里的 comment 作「註解」 |
| 线程（留言串） | 討論串 | 程序线程才是「執行緒」 |
| 反应（reaction） | 表情回應 | |
| 固定、置顶（pin） | 釘選 | |
| 存档、归档 | 封存 | |
| 解锁（lock 操作） | 解除鎖定 | 开放功能、成就义可作「解鎖」（第 4 节繁体补充） |
| 阻止、屏蔽（block） | 封鎖 | 议题依赖的 blocked by 作「受阻於」 |
| 举报 | 檢舉 | |
| 公共、专用、私有（可见度） | 公開、私人 | |
| 可见性 | 可見度 | |
| 转让 | 轉移 | |
| 许可证 | 授權條款 | 计费的 licensing、OAuth 的 authorize 作「授權」 |
| 计费（billing） | 帳務 | 功能区、设定、角色作「帳務」；账单内容作「帳單」，收费方式作「計費」 |
| 计划、套餐（计费 plan） | 方案 | Copilot 的 Plan 模式作「規劃」，代理产出的计划作「計畫」 |
| 商业版 | 商務版 | |
| 高级（advanced、premium） | 進階 | |
| 工作流 | 工作流程 | |
| 运行（run）、运行器 | 執行、執行器 | |
| 产物 | 成品 | |
| 已排队、正在进行、挂起、超时、跳过 | 已排入佇列、進行中、擱置中、逾時、略過 | |
| 包（package） | 套件 | |
| 注册表 | 登錄庫 | |
| 镜像（image） | 映像檔 | mirror 才是「鏡像」 |
| 警报 | 警示 | |
| 依赖项、依赖关系 | 相依項目、相依性 | |
| 被依赖 | 被相依項目 | |
| 使用者（Used by） | 採用者 | 只指 Used by；user 仍作「使用者」 |
| 见解 | 洞察 | |
| 统计（Pulse） | 統計 | |
| 概述、概览、概观（overview） | 總覽 | |
| 克隆（clone） | 複製 | 单独出现时写「複製儲存庫」；流量图 Clones 作「複製次數」 |
| 检出（checkout） | 簽出 | 购买流程的 checkout 作「結帳」 |
| 变基、衍合 | 重定基底 | |
| 挑拣（cherry-pick） | 揀選 | |
| 合并队列 | 合併佇列 | |
| 头部分支、基础分支 | 來源分支、基底分支 | |
| 项（item） | 項目 | 量词「項」照第 2 节（`4 項檢查`） |
| 项目（project） | 專案 | item 作「項目」 |
| 路线图 | 藍圖 | |
| 集合（collection） | 精選集 | |
| 趋势 | 熱門 | |
| 市场 | 市集 | |
| 操作（Actions） | 動作 | |
| 代码空间 | 程式碼空間 | |
| 预生成 | 預先建置 | |
| 构建、生成（build） | 建置 | |
| 有效负载 | 承載 | |
| 交付（delivery） | 傳遞 | |
| 网络钩子 | Web 鉤子 | |
| 调解（moderation） | 內容審核 | |
| 审核日志、审计日志 | 稽核記錄 | |
| 预定提醒 | 排定的提醒 | |
| 已保存回复 | 已儲存的回覆 | |
| 强制实施 | 強制執行 | |
| 智能体 | 代理 | |
| 自定义说明、自定义指令 | 自訂指示 | |
| 提示词 | 提示 | |
| 使用情况 | 使用量 | |
| 高级请求 | 進階請求 | |

### 界面操作

<!-- prettier-ignore -->
| 大陆用语 | 繁体用语 | 说明 |
| --- | --- | --- |
| 单击、点击 | 按一下 | tap 作「點一下」 |
| 双击、右键单击 | 按兩下、按一下右鍵 | |
| 拖动、拖拽 | 拖曳 | |
| 滚动 | 捲動 | |
| 选中 | 選取 | 从选项里挑一个作「選擇」 |
| 默认、缺省 | 預設 | |
| 设置（名词、动词） | 設定 | |
| 配置（configure、configuration）、配置文件 | 設定、設定檔 | 布局作「版面配置」，不在此列 |
| 保存 | 儲存 | |
| 加载 | 載入 | |
| 刷新 | 重新整理 | |
| 重置 | 重設 | |
| 创建 | 建立 | |
| 新建 | 新增 | |
| 添加 | 新增、加入 | 放进已有集合用「加入」 |
| 更改 | 變更 | |
| 重命名 | 重新命名 | |
| 提交（submit） | 送出 | commit 仍作「提交」 |
| 撤销（undo） | 復原 | revoke 作「撤銷」 |
| 恢复（restore、recover）、回滚 | 還原、復原、復原 | |
| 禁用 | 停用 | |
| 激活 | 啟用 | |
| 搜索 | 搜尋 | |
| 查找 | 尋找 | |
| 匹配 | 相符 | |
| 自定义、定制 | 自訂 | |
| 导入、导出 | 匯入、匯出 | |
| 粘贴 | 貼上 | |
| 获取（get、fetch） | 取得、擷取 | |
| 转到 | 前往 | |
| 访问（权限、网站） | 存取、造訪 | |
| 打开（文件、链接） | 開啟 | 状态 Open 作「開放中」 |
| 共享（资源、权限） | 共用 | 社群分享仍作「分享」 |
| 嵌入 | 內嵌 | |
| 链接 | 連結 | |
| 连接（网络） | 連線 | 连接帐号、储存库作「連接」 |
| 反馈 | 意見回饋 | |
| 优化 | 最佳化 | |
| 迁移 | 移轉 | |
| 折叠 | 摺疊 | |
| 打印 | 列印 | |
| 调用 | 呼叫 | |
| 调试 | 偵錯 | |
| 卸载 | 解除安裝 | |
| 渲染 | 轉譯 | VS Code 繁中 轉譯 111 / 渲染 1 |
| 重定向、跳转 | 重新導向 | |

### 界面元素

<!-- prettier-ignore -->
| 大陆用语 | 繁体用语 | 说明 |
| --- | --- | --- |
| 菜单、下拉菜单 | 選單、下拉式選單 | |
| 标签页、选项卡 | 分頁 | |
| 窗口、弹出窗口 | 視窗、彈出式視窗 | |
| 对话框 | 對話方塊 | |
| 复选框、单选按钮 | 核取方塊、選項按鈕 | |
| 进度条、状态栏、工具栏 | 進度列、狀態列、工具列 | |
| 侧边栏、导航栏、导航 | 側邊欄、導覽列、導覽 | |
| 视图 | 檢視 | 动词 view 作「查看」 |
| 字段 | 欄位 | |
| 列（表格 column）、行（表格 row） | 欄、列 | 台湾 column 是「欄」、row 是「列」，与大陆相反。只指表格、清单；程式碼、文字的 line 仍作「行」（`第 12 行`、`123 行`），不改「列」 |
| 列表 | 清單 | |
| 布局 | 版面配置 | |
| 主题（外观） | 佈景主題 | topic 才是「主題」 |
| 夜间模式 | 深色模式 | |
| 全屏、屏幕 | 全螢幕、螢幕 | |
| 鼠标、光标 | 滑鼠、游標 | |
| 字体 | 字型 | |
| 图标、图像 | 圖示、影像 | |
| 视频、音频 | 影片、音訊 | |
| 文本 | 文字 | |
| 常规 | 一般 | |
| 首选项 | 偏好設定 | |
| 详细信息 | 詳細資料 | |
| 帮助 | 說明 | |
| 文档 | 說明文件、文件 | docs 作「說明文件」，document 作「文件」 |
| 当前 | 目前 | |
| 暂无 X | 尚無 X、沒有 X | |
| 未找到 | 找不到 | |
| 在线 | 線上 | 离线同作「離線」 |
| 移动（mobile）、移动端 | 行動、行動裝置 | |
| 辅助功能 | 無障礙 | |
| 快捷方式、快捷键 | 快速鍵 | |
| 时间线 | 時間軸 | |

### 技术名词

<!-- prettier-ignore -->
| 大陆用语 | 繁体用语 | 说明 |
| --- | --- | --- |
| 软件、硬件 | 軟體、硬體 | |
| 程序（program） | 程式 | 流程义「程序」可用 |
| 代码、源代码 | 程式碼、原始碼 | |
| 数据、数据库 | 資料、資料庫 | |
| 元数据 | 中繼資料 | |
| 信息、消息 | 資訊、訊息 | |
| 网络、互联网 | 網路、網際網路 | |
| 服务器、客户端 | 伺服器、用戶端 | 「用戶端」命中检查脚本的大陆用语警告，保留（第 5 节） |
| 站点 | 網站 | |
| 带宽 | 頻寬 | |
| 设备 | 裝置 | |
| 内存、磁盘、存储（空间） | 記憶體、磁碟、儲存空間 | |
| 文件（file）、文件夹 | 檔案、資料夾 | 台湾「文件」指 document |
| 扩展名 | 副檔名 | |
| 日志、日志文件 | 記錄、記錄檔 | |
| 缓存 | 快取 | |
| 脚本 | 指令碼 | |
| 命令行、终端 | 命令列、終端機 | |
| 函数、对象、数组 | 函式、物件、陣列 | |
| 字符串、字符 | 字串、字元 | |
| 变量、返回值 | 變數、傳回值 | 参数同作「參數」 |
| 回调 | 回呼 | |
| 哈希 | 雜湊 | |
| 二进制 | 二進位 | |
| 实时 | 即時 | |
| 进程、线程 | 處理程序、執行緒 | |
| 实例、端口 | 執行個體、連接埠 | |
| 地址（IP）、域名、域 | 位址、網域名稱、網域 | |
| 插件、扩展 | 外掛程式、擴充功能 | |
| 接口、界面、交互 | 介面、介面、互動 | |
| 兼容、质量、支持、集成 | 相容、品質、支援、整合 | |
| 模板、示例 | 範本、範例 | |
| 批量、内置 | 批次、內建 | |
| 人工智能、智能 | 人工智慧、智慧 | |
| 大语言模型、大模型 | 大型語言模型 | |
| 博客、短信、二维码 | 部落格、簡訊、QR 圖碼 | |
| 帖子、点赞 | 貼文、按讚 | |
| 剪贴板 | 剪貼簿 | |
| 社区 | 社群 | |
| 默认值 | 預設值 | |

### 帐号与安全

<!-- prettier-ignore -->
| 大陆用语 | 繁体用语 | 说明 |
| --- | --- | --- |
| 帐户、账户、账号 | 帳號 | |
| 用户、用户名 | 使用者、使用者名稱 | 用戶端（client）不在此列 |
| 登录、退出登录、注销 | 登入、登出、登出 | 登錄庫（registry）不在此列 |
| 个人资料图片 | 頭像 | 头像同作「頭像」；不用「大頭貼」 |
| 个人资料（profile） | 個人檔案 | 台湾「個人資料」指个人数据；组织的 profile 作「組織資料」 |
| 会话 | 工作階段 | |
| 身份验证、认证（authentication） | 身分驗證 | credential 作「認證資訊」 |
| 双因素身份验证 | 雙重驗證 | |
| 通行密钥 | 密碼金鑰 | |
| 恢复代码 | 復原碼 | |
| 密钥 | 金鑰 | |
| 令牌 | 權杖 | |
| 凭据 | 認證資訊 | |
| 证书 | 憑證 | |
| 签名（名词、动词） | 簽章、簽署 | |
| 标识提供者 | 身分識別提供者 | |

另查：

- 简体字混入（设、为、个、发、这、关、开、户、码 等）：`check:locale --locale=zh-TW` 报错，必须改。
- 一简对多繁的错字（複制、標准、關系、注冊、合並、標簽、Web 鈎子）脚本查不出，按第 2 节「用字」「一简对多繁」核对。
- 港式或旧字形：裏、着、綫、爲、羣、鈎（第 2 节「用字」）。
- 翻译腔：滥用「进行」「的话」「相关」「操作」「通过」，「被」字句过多，词序照搬英文。
- 客服腔：「请…以便…」「…即可…」之类原文没有的说法不加。
