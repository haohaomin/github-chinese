import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk, spaceDigits, translateTime } from '../helpers'

const COUNT = '(\\d[\\d,]*)'

/** 部署横幅与侧栏中的框架名：Deploy your <框架> to GitHub Pages */
const FRAMEWORKS: Readonly<Record<string, string>> = {
  'Vite app': 'Vite 應用程式',
  'Astro app': 'Astro 應用程式',
  'Next.js app': 'Next.js 應用程式',
  'Gatsby site': 'Gatsby 網站',
  'Nuxt.js app': 'Nuxt.js 應用程式',
  'Eleventy site': 'Eleventy 網站',
  project: '專案',
  site: '網站'
}

/** 交互限制剩余时间的单位 */
const LIMIT_UNITS: Readonly<Record<string, string>> = {
  minute: '分鐘',
  hour: '小時',
  day: '天',
  week: '週',
  month: '個月',
  year: '年'
}

/** 交互限制剩余时间的修饰词 */
const LIMIT_QUALIFIERS: Readonly<Record<string, string>> = {
  about: '約',
  almost: '將近',
  over: '超過',
  'less than': '不到'
}

/** 同步复刻后的提示：Successfully <操作> upstream <base>（原文无逗号，译文不加） */
const SYNC_RESULTS: Readonly<Record<string, (base: string) => string>> = {
  'fetched and fast-forwarded from': base => `已成功從上游 ${base} 擷取並快轉`,
  'fetched and merged from': base => `已成功從上游 ${base} 擷取並合併`,
  'discarded changes and synchronized branch to match': base => `已成功捨棄變更並將分支同步為與上游 ${base} 一致`
}

/** 部署横幅：將你的 <框架> 部署到 GitHub 頁面；未收录的框架名原样保留，与两侧中文之间补空格 */
function deployTo(prefix: string, name: string): string {
  const framework = Object.hasOwn(FRAMEWORKS, name) ? (FRAMEWORKS[name] ?? name) : name
  return joinCjk(joinCjk(prefix, framework), '部署到 GitHub 頁面')
}

/**
 * 最近推送的时间：5 minutes ago、yesterday、on Oct 26；
 * 超过一个月时日期由浏览器按本地语言格式化（on 10月26日），去掉 on，中文与数字之间补空格（10月26日）。
 */
function pushTime(time: string): string {
  if (time === 'less than a minute ago') return '剛剛'
  const translated = translateTime(time)
  return translated === time ? spaceDigits(time.replace(/^on /, '')) : translated
}

/** 剩余时间：23 hours → 剩餘 23 小時；about 1 month → 剩餘約 1 個月（数字与单位之间加空格） */
function remaining(qualifier: string, amount: string, unit: string): string {
  const count = /^\d+$/.test(amount) ? amount : '1'
  const duration = `${count} ${LIMIT_UNITS[unit] ?? unit}`
  return joinCjk('剩餘', joinCjk(LIMIT_QUALIFIERS[qualifier] ?? '', duration))
}

const regexp: readonly RegExpRule[] = [
  // 复刻 / 分支信息条：This branch is <N commits ahead of> and <M commits behind> <base>.
  [new RegExp(`^${COUNT} commits? ahead of$`), '領先 $1 個提交'],
  [new RegExp(`^${COUNT} commits? behind$`), '落後 $1 個提交'],
  // 同步复刻弹层（原文无逗号，译文不加）
  [
    new RegExp(`^Update branch to keep this branch up-to-date by syncing ${COUNT} commits? from the upstream repository\\.$`),
    '更新分支以同步上游儲存庫的 $1 個提交並讓此分支保持最新。'
  ],
  [
    new RegExp(
      `^Discard ${COUNT} commits? to make this branch match the upstream repository\\. ${COUNT} commits? will be removed from this branch\\.$`
    ),
    '捨棄 $1 個提交以讓此分支與上游儲存庫一致。將從此分支移除 $2 個提交。'
  ],
  [new RegExp(`^Discard ${COUNT} commits?$`), '捨棄 $1 個提交'],
  // 分支保护建议横幅
  [/^Your (\S+) branch isn['’]t protected$/, '你的 $1 分支未受保護'],
  // 部署横幅：Deploy your Vite app to GitHub Pages；侧栏部署分节：… in a matter of minutes
  [/^Deploy your (.+?) to GitHub Pages$/, (_, name: string) => deployTo('將你的', name)],
  [/^Deploy your (.+?) to GitHub Pages in a matter of minutes$/, (_, name: string) => deployTo('在幾分鐘內將你的', name)],
  // 最近推送的分支：<分支> had recent pushes 5 minutes ago（时间与句子在同一文本节点）
  [/^had recent pushes (\S.*)$/, (_, time: string) => joinCjk(pushTime(time), '有新推送')],
  // 交互限制横幅：剩余时间（23 hours、about 1 month）
  [
    /^(?:(about|almost|over|less than) )?(\d+|an?|one) (minute|hour|day|week|month|year)s? remaining$/,
    (_, qualifier: string, amount: string, unit: string) => remaining(qualifier, amount, unit)
  ],
  // 交互限制横幅：從未 <提交於> 此儲存庫 main 分支的使用者…（分支名与句尾在同一文本组；
  // 链接 committed 由 common-ui 的全局词条译作「提交於」，句尾不再加「到」）
  [
    /^to the (\S+) branch of this repository will be unable to interact with the repository\.$/,
    '此儲存庫 $1 分支的使用者將無法與此儲存庫互動。'
  ],
  // 阻止的用户贡献过的提醒
  [
    new RegExp(`^${COUNT} users you['’]ve blocked have previously contributed to this repository\\.$`),
    '你封鎖的 $1 位使用者曾為此儲存庫做出貢獻。'
  ],
  // 缺少必填自定义属性
  [new RegExp(`^This repository is missing ${COUNT} required custom property values$`), '此儲存庫缺少 $1 個必填的自訂屬性值'],
  // 不可变操作迁移对话框：<5 out of 10 tags> from <owner/repo> …；1 tag → 1 version
  [new RegExp(`^${COUNT} out of ${COUNT} tags?$`), '$2 個標記中的 $1 個'],
  [new RegExp(`^${COUNT} versions?$`), '$1 個版本'],
  // 同步复刻后的提示
  [
    /^Successfully (fetched and fast-forwarded from|fetched and merged from|discarded changes and synchronized branch to match) upstream (\S+?)(\.)?$/,
    (_, action: string, base: string, dot: string) => `${SYNC_RESULTS[action]?.(base) ?? base}${dot ? '。' : ''}`
  ]
]

/**
 * 存储库首页的提示与横幅：复刻 / 分支信息条及「贡献」「同步复刻」弹层与同步结果提示、分支保护建议、协作邀请、
 * 发布操作、部署到 GitHub 页面、默认分支改名、最近推送的分支、交互限制、阻止的用户、必填自定义属性、
 * 不可变操作迁移、依赖漏洞提醒、帐户继任者提醒、垃圾信息所有者标记。
 * 信息条和弹层也出现在目录页，放在 scoped；只在首页出现的整句放在 static。
 * 分支名、存储库名、命令行内容属于用户内容或代码，不收录；最近推送横幅的分支名链接由 ignore 排除。
 */
export default {
  static: {
    // 分支保护建议
    'Protect this branch from force pushing or deletion, or require status checks before merging.':
      '保護此分支免於強制推送或刪除，或要求合併前通過狀態檢查。',
    'View documentation.': '查看說明文件。',
    'Protect this branch': '保護此分支',

    // 协作邀请：@<用户> 邀請你成為此儲存庫的協作者
    'has invited you to collaborate on this repository': '邀請你成為此儲存庫的協作者',
    'View invitation': '查看邀請',

    // 发布操作
    'Use this GitHub action with your project': '在你的專案中使用此 GitHub 動作',
    'Add this Action to an existing workflow or create a new one': '將此動作加入現有工作流程或建立新的工作流程',
    'View on Marketplace': '在市集中查看',

    // 部署到 GitHub 页面
    'Deploy to Pages': '部署到頁面',
    'Dismiss deploy banner': '關閉部署橫幅',

    // 默认分支改名：<旧名> 現已重新命名為 <新名>
    'The default branch has been renamed!': '預設分支已重新命名！',
    'is now named': '現已重新命名為',
    'If you have a local clone, you can update it by running the following commands.': '如果你有本機複本，可以執行下列命令來更新。',
    'Learn about dealing with special characters on the command line.': '瞭解如何在命令列中處理特殊字元。',
    'Copy update commands to clipboard': '將更新命令複製到剪貼簿',
    'OK, got it': '好，我知道了',
    // 父存储库默认分支改名：<父存储库> 已將其預設分支重新命名為 <新名>
    'The default branch on the parent repository has been renamed!': '父儲存庫的預設分支已重新命名！',
    'renamed its default branch': '已將其預設分支重新命名為',
    // 如需重新命名此分叉的預設分支以保持一致可前往 <分支設定>（链接在句末、其后没有文字，语序只能不变；原文无逗号、句号，译文不加。
    // 整句由 inline 处理，此为未拼成整句时的片段）
    "You can rename this fork's default branch to match in": '如需重新命名此分叉的預設分支以保持一致可前往',
    'You can rename this fork’s default branch to match in': '如需重新命名此分叉的預設分支以保持一致可前往',
    'branch settings': '分支設定',

    // 最近推送的分支
    'Compare & pull request': '比較並建立拉取請求',

    // 交互限制
    'Users that have recently created their account will be unable to interact with the repository.':
      '最近建立帳號的使用者將無法與此儲存庫互動。',

    // 阻止的用户贡献过的提醒
    'A user you’ve blocked has previously contributed to this repository.': '你封鎖的一位使用者曾為此儲存庫做出貢獻。',
    "A user you've blocked has previously contributed to this repository.": '你封鎖的一位使用者曾為此儲存庫做出貢獻。',
    'Manage blocked users': '管理已封鎖的使用者',
    'disable this warning': '停用此警告',

    // 缺少必填自定义属性
    'This repository is missing a required custom property value': '此儲存庫缺少必填的自訂屬性值',
    "Set the required custom property values to keep this repository compliant with your organization's policies.":
      '設定必填的自訂屬性值以讓此儲存庫符合組織的政策。',
    'Set the required custom property values to keep this repository compliant with your organization’s policies.':
      '設定必填的自訂屬性值以讓此儲存庫符合組織的政策。',

    // 不可变操作迁移
    'Make your GitHub Action Immutable': '將你的 GitHub 動作設為不可變',
    'Upgrade to a newer, more secure, and more reliable way of releasing and referencing GitHub Actions by recreating your existing tags as immutable package versions.':
      '將現有標記重新建立為不可變的套件版本以升級到更新、更安全且更可靠的 GitHub 動作發布和參考方式。',
    'Immutable Action Migration Failed': '不可變動作移轉失敗',
    'One or more of your tags failed to be migrated to immutable action versions. You can try the migration again to migrate the remaining tags.':
      '一個或多個標記無法移轉為不可變的動作版本。你可以再次嘗試移轉其餘的標記。',
    'Retry migration': '重試移轉',
    'Create immutable action': '建立不可變動作',
    'Your Action is being migrated to an immutable package version.': '你的動作正在移轉為不可變的套件版本。',
    'View progress': '查看進度',
    'Learn more about immutable actions.': '瞭解不可變動作。',
    'will be recreated as immutable package versions.': '將重新建立為不可變的套件版本。',
    'After this process you can activate your package, at which point references to semantic versions of your action will be resolved from immutable package versions rather than git references. Non-semantic version references to your action will continue to be resolved from git references.':
      '完成此程序後你可以啟用套件，屆時對你的動作語意化版本的參考將從不可變的套件版本而非 Git 參考解析。對你的動作的非語意化版本參考仍會從 Git 參考解析。',
    'Failed to start migration, please try again. If this error persists, please ensure you are authenticated with the organization that owns this repository.':
      '無法開始移轉，請再試一次。如果此錯誤持續發生，請確認你已向擁有此儲存庫的組織完成身分驗證。',
    'Non-semantic version tags found': '找到非語意化版本的標記',
    'Continue anyways': '仍要繼續',
    // 非语义化版本标记对话框：<3 out of 10 tags> cannot be recreated …
    'cannot be recreated because they did not follow semantic versioning at the time of their release. To include these tags, re-release these versions following semantic versioning. You can still continue with the migration process without re-releasing these versions, but they will not be recreated as immutable package versions.':
      '因發布時未遵循語意化版本而無法重新建立。若要包含這些標記，請依照語意化版本重新發布這些版本。你也可以不重新發布這些版本而繼續移轉，但它們不會重新建立為不可變的套件版本。',
    'Only the first 100 invalid tags are listed.': '僅列出前 100 個無效標記。',

    // 所有者被标记为垃圾信息发布者（员工可见）
    'Spammy Owner': '擁有者疑似垃圾帳號',
    'The owner of this repository is flagged as spammy.': '此儲存庫的擁有者已被標示為疑似垃圾帳號。',

    // 依赖漏洞提醒
    'We found potential security vulnerabilities in your dependencies.': '我們在你的相依項目中發現潛在的安全性漏洞。',
    'Only the owner of this repository can see this message.': '只有此儲存庫的擁有者能看到此訊息。',
    'You can see this message because you have been granted access to Dependabot alerts for this repository.':
      '你能看到此訊息是因為你已獲得此儲存庫 Dependabot 警示的存取權。',
    'See Dependabot alerts': '查看 Dependabot 警示',

    // 帐户继任者提醒
    'Ensure the future of your work!': '確保你的工作得以延續！',
    'Consider inviting another GitHub user to be your successor.': '考慮邀請另一位 GitHub 使用者成為你的繼任者。',
    'Inviting a successor helps ensure the continuity of your work in case you are unable to access your account.':
      '邀請繼任者有助於在你無法存取帳號時確保工作延續。',
    'Invite a successor': '邀請繼任者'
  },
  scoped: {
    // 复刻 / 分支信息条
    'This branch is': '此分支',
    'ahead of': '領先',
    behind: '落後',
    'This branch is up to date with': '此分支已同步至',
    Contribute: '貢獻',
    'Open Contribute dropdown': '開啟貢獻下拉式選單',
    'This branch is not ahead of the upstream': '此分支沒有領先上游',
    'Open a pull request to contribute your changes upstream.': '建立拉取請求以將你的變更貢獻至上游。',
    'No new commits yet. Enjoy your day!': '尚無新提交。祝你有美好的一天！',
    Compare: '比較',
    'Sync fork': '同步分叉',
    'Open Fetch upstream dropdown': '開啟擷取上游下拉式選單',
    'This branch is out-of-date': '此分支已過時',
    'This branch is not behind the upstream': '此分支沒有落後上游',
    'No new commits to fetch. Enjoy your day!': '沒有可擷取的新提交。祝你有美好的一天！',
    'Update branch to merge the latest changes from the upstream repository into this branch.':
      '更新分支以將上游儲存庫的最新變更合併到此分支。',
    'Learn more about syncing a fork': '瞭解如何同步分叉',
    'Update branch': '更新分支',
    'Discarding changes...': '正在捨棄變更...',
    'This branch has conflicts that must be resolved': '此分支有必須解決的衝突',
    'You can resolve merge conflicts using the command line and a text editor.': '你可以使用命令列和文字編輯器解決合併衝突。',
    'Sorry, getting ahead/behind information for this branch is taking too long.': '抱歉，取得此分支的領先/落後資訊花費的時間過長。',
    'Cannot retrieve ahead/behind information for this branch.': '無法取得此分支的領先/落後資訊。',
    'Cannot retrieve comparison with upstream repository.': '無法取得與上游儲存庫的比較結果。',

    // 发布操作
    'Draft a release': '草擬發行版本',
    // 部署横幅按钮
    Deploy: '部署',
    // 交互限制：可交互的角色
    'New users': '新使用者',
    Collaborators: '協作者',
    // 不是 <協作者> 的使用者將無法與此儲存庫互動。
    collaborators: '協作者',
    'or view': '或查看',
    // 缺少必填自定义属性
    'Remind me later': '稍後提醒我'
  },
  regexp,
  // 父存储库默认分支改名弹层（ParentBranchRenamePopover，React 把 {' '} 渲染成单独的文本节点）：
  // 整句命中后链接前的空白不再保留，链接文字照常翻译
  inline: [
    ["You can rename this fork's default branch to match in {}", '如需重新命名此分叉的預設分支以保持一致可前往{}'],
    ['You can rename this fork’s default branch to match in {}', '如需重新命名此分叉的預設分支以保持一致可前往{}']
  ],
  ignore: [
    // 最近推送的分支横幅：分支名链接（Flash > Box > a.text-bold）
    '[class*="Flash__"] > [class*="Box__"] > a.text-bold[href*="/tree/"]'
  ]
} satisfies PageDictionary
