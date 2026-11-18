import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk, spaceDigits, translateTime } from '../helpers'

const COUNT = '(\\d[\\d,]*)'

/** 部署横幅与侧栏中的框架名：Deploy your <框架> to GitHub Pages */
const FRAMEWORKS: Readonly<Record<string, string>> = {
  'Vite app': 'Vite 应用',
  'Astro app': 'Astro 应用',
  'Next.js app': 'Next.js 应用',
  'Gatsby site': 'Gatsby 站点',
  'Nuxt.js app': 'Nuxt.js 应用',
  'Eleventy site': 'Eleventy 站点',
  project: '项目',
  site: '站点'
}

/** 交互限制剩余时间的单位 */
const LIMIT_UNITS: Readonly<Record<string, string>> = {
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '个月',
  year: '年'
}

/** 交互限制剩余时间的修饰词 */
const LIMIT_QUALIFIERS: Readonly<Record<string, string>> = {
  about: '约',
  almost: '将近',
  over: '超过',
  'less than': '不到'
}

/** 同步复刻后的提示：Successfully <操作> upstream <base>（原文无逗号，译文不加） */
const SYNC_RESULTS: Readonly<Record<string, (base: string) => string>> = {
  'fetched and fast-forwarded from': base => `已成功从上游 ${base} 获取并快进`,
  'fetched and merged from': base => `已成功从上游 ${base} 获取并合并`,
  'discarded changes and synchronized branch to match': base => `已成功放弃更改并将分支同步为与上游 ${base} 一致`
}

/** 部署横幅：将你的 <框架> 部署到 GitHub 页面；未收录的框架名原样保留，与两侧中文之间补空格 */
function deployTo(prefix: string, name: string): string {
  const framework = Object.hasOwn(FRAMEWORKS, name) ? (FRAMEWORKS[name] ?? name) : name
  return joinCjk(joinCjk(prefix, framework), '部署到 GitHub 页面')
}

/**
 * 最近推送的时间：5 minutes ago、yesterday、on Oct 26；
 * 超过一个月时日期由浏览器按本地语言格式化（on 10月26日），去掉 on，中文与数字之间补空格（10月26日）。
 */
function pushTime(time: string): string {
  if (time === 'less than a minute ago') return '刚刚'
  const translated = translateTime(time)
  return translated === time ? spaceDigits(time.replace(/^on /, '')) : translated
}

/** 剩余时间：23 hours → 剩余 23 小时；about 1 month → 剩余约1 个月（数字与单位之间加空格） */
function remaining(qualifier: string, amount: string, unit: string): string {
  const count = /^\d+$/.test(amount) ? amount : '1'
  const duration = `${count}${LIMIT_UNITS[unit] ?? unit}`
  return joinCjk('剩余', joinCjk(LIMIT_QUALIFIERS[qualifier] ?? '', duration))
}

const regexp: readonly RegExpRule[] = [
  // 复刻 / 分支信息条：This branch is <N commits ahead of> and <M commits behind> <base>.
  [new RegExp(`^${COUNT} commits? ahead of$`), '领先 $1 个提交'],
  [new RegExp(`^${COUNT} commits? behind$`), '落后 $1 个提交'],
  // 同步复刻弹层（原文无逗号，译文不加）
  [
    new RegExp(`^Update branch to keep this branch up-to-date by syncing ${COUNT} commits? from the upstream repository\\.$`),
    '更新分支以同步上游存储库的 $1 个提交并使此分支保持最新。'
  ],
  [
    new RegExp(
      `^Discard ${COUNT} commits? to make this branch match the upstream repository\\. ${COUNT} commits? will be removed from this branch\\.$`
    ),
    '放弃 $1 个提交以使此分支与上游存储库一致。$2 个提交将从此分支中删除。'
  ],
  [new RegExp(`^Discard ${COUNT} commits?$`), '放弃 $1 个提交'],
  // 分支保护建议横幅
  [/^Your (\S+) branch isn['’]t protected$/, '你的 $1 分支未受保护'],
  // 部署横幅：Deploy your Vite app to GitHub Pages；侧栏部署分节：… in a matter of minutes
  [/^Deploy your (.+?) to GitHub Pages$/, (_, name: string) => deployTo('将你的', name)],
  [/^Deploy your (.+?) to GitHub Pages in a matter of minutes$/, (_, name: string) => deployTo('几分钟内即可将你的', name)],
  // 最近推送的分支：<分支> had recent pushes 5 minutes ago（时间与句子在同一文本节点）
  [/^had recent pushes (\S.*)$/, (_, time: string) => joinCjk(pushTime(time), '有新推送')],
  // 交互限制横幅：剩余时间（23 hours、about 1 month）
  [
    /^(?:(about|almost|over|less than) )?(\d+|an?|one) (minute|hour|day|week|month|year)s? remaining$/,
    (_, qualifier: string, amount: string, unit: string) => remaining(qualifier, amount, unit)
  ],
  // 交互限制横幅：从未 <提交> 到默认分支的用户（分支名与句尾在同一文本组）
  [
    /^to the (\S+) branch of this repository will be unable to interact with the repository\.$/,
    '此存储库 $1 分支的用户将无法与此存储库交互。'
  ],
  // 阻止的用户贡献过的提醒
  [
    new RegExp(`^${COUNT} users you['’]ve blocked have previously contributed to this repository\\.$`),
    '你阻止的 $1 个用户曾为此存储库做过贡献。'
  ],
  // 缺少必填自定义属性
  [new RegExp(`^This repository is missing ${COUNT} required custom property values$`), '此存储库缺少 $1 个必填的自定义属性值'],
  // 不可变操作迁移对话框：<5 out of 10 tags> from <owner/repo> …；1 tag → 1 version
  [new RegExp(`^${COUNT} out of ${COUNT} tags?$`), '$2 个标签中的 $1 个'],
  [new RegExp(`^${COUNT} versions?$`), '$1 个版本'],
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
      '保护此分支免遭强制推送或删除，或要求合并前通过状态检查。',
    'View documentation.': '查看文档。',
    'Protect this branch': '保护此分支',

    // 协作邀请：@<用户> 邀请你成为此存储库的协作者
    'has invited you to collaborate on this repository': '邀请你成为此存储库的协作者',
    'View invitation': '查看邀请',

    // 发布操作
    'Use this GitHub action with your project': '在你的项目中使用此 GitHub 操作',
    'Add this Action to an existing workflow or create a new one': '将此操作添加到现有工作流或创建新工作流',
    'View on Marketplace': '在市场中查看',

    // 部署到 GitHub 页面
    'Deploy to Pages': '部署到页面',
    'Dismiss deploy banner': '关闭部署横幅',

    // 默认分支改名：<旧名> 现已重命名为 <新名>
    'The default branch has been renamed!': '默认分支已重命名！',
    'is now named': '现已重命名为',
    'If you have a local clone, you can update it by running the following commands.': '如果你有本地克隆，可以运行以下命令进行更新。',
    'Learn about dealing with special characters on the command line.': '了解如何在命令行中处理特殊字符。',
    'Copy update commands to clipboard': '复制更新命令到剪贴板',
    'OK, got it': '好的，知道了',
    // 父存储库默认分支改名：<父存储库> 已将其默认分支重命名为 <新名>
    'The default branch on the parent repository has been renamed!': '父存储库的默认分支已重命名！',
    'renamed its default branch': '已将其默认分支重命名为',
    // 如需重命名此复刻的默认分支以保持一致可前往 <分支设置>（链接在句末、其后没有文字，语序只能不变；原文无逗号、句号，译文不加。
    // 整句由 inline 处理，此为未拼成整句时的片段）
    "You can rename this fork's default branch to match in": '如需重命名此复刻的默认分支以保持一致可前往',
    'You can rename this fork’s default branch to match in': '如需重命名此复刻的默认分支以保持一致可前往',
    'branch settings': '分支设置',

    // 最近推送的分支
    'Compare & pull request': '比较和拉取请求',

    // 交互限制
    'Users that have recently created their account will be unable to interact with the repository.':
      '最近创建帐户的用户将无法与此存储库交互。',

    // 阻止的用户贡献过的提醒
    'A user you’ve blocked has previously contributed to this repository.': '你阻止的一个用户曾为此存储库做过贡献。',
    "A user you've blocked has previously contributed to this repository.": '你阻止的一个用户曾为此存储库做过贡献。',
    'Manage blocked users': '管理已阻止的用户',
    'disable this warning': '禁用此警告',

    // 缺少必填自定义属性
    'This repository is missing a required custom property value': '此存储库缺少必填的自定义属性值',
    "Set the required custom property values to keep this repository compliant with your organization's policies.":
      '设置必填的自定义属性值以使此存储库符合组织的策略。',
    'Set the required custom property values to keep this repository compliant with your organization’s policies.':
      '设置必填的自定义属性值以使此存储库符合组织的策略。',

    // 不可变操作迁移
    'Make your GitHub Action Immutable': '将你的 GitHub 操作设为不可变',
    'Upgrade to a newer, more secure, and more reliable way of releasing and referencing GitHub Actions by recreating your existing tags as immutable package versions.':
      '通过将现有标签重新创建为不可变软件包版本来升级到更新、更安全、更可靠的 GitHub 操作发布与引用方式。',
    'Immutable Action Migration Failed': '不可变操作迁移失败',
    'One or more of your tags failed to be migrated to immutable action versions. You can try the migration again to migrate the remaining tags.':
      '一个或多个标签未能迁移为不可变操作版本。你可以重试迁移以迁移其余标签。',
    'Retry migration': '重试迁移',
    'Create immutable action': '创建不可变操作',
    'Your Action is being migrated to an immutable package version.': '你的操作正在迁移为不可变软件包版本。',
    'View progress': '查看进度',
    'Learn more about immutable actions.': '了解不可变操作。',
    'will be recreated as immutable package versions.': '将被重新创建为不可变软件包版本。',
    'After this process you can activate your package, at which point references to semantic versions of your action will be resolved from immutable package versions rather than git references. Non-semantic version references to your action will continue to be resolved from git references.':
      '完成后即可激活软件包，届时对你的操作的语义化版本引用将从不可变软件包版本而非 Git 引用解析。对你的操作的非语义化版本引用仍从 Git 引用解析。',
    'Failed to start migration, please try again. If this error persists, please ensure you are authenticated with the organization that owns this repository.':
      '启动迁移失败，请重试。如果仍然出错，请确认你已通过拥有此存储库的组织的身份验证。',
    'Non-semantic version tags found': '发现非语义化版本标签',
    'Continue anyways': '仍然继续',
    // 非语义化版本标签对话框：<3 out of 10 tags> cannot be recreated …
    'cannot be recreated because they did not follow semantic versioning at the time of their release. To include these tags, re-release these versions following semantic versioning. You can still continue with the migration process without re-releasing these versions, but they will not be recreated as immutable package versions.':
      '因发布时未遵循语义化版本而无法重新创建。要包含这些标签，请按语义化版本重新发布这些版本。也可以不重新发布这些版本而继续迁移，但它们不会被重新创建为不可变软件包版本。',
    'Only the first 100 invalid tags are listed.': '仅列出前 100 个无效标签。',

    // 所有者被标记为垃圾信息发布者（员工可见）
    'Spammy Owner': '所有者疑似发布垃圾信息',
    'The owner of this repository is flagged as spammy.': '此存储库的所有者已被标记为疑似发布垃圾信息。',

    // 依赖漏洞提醒
    'We found potential security vulnerabilities in your dependencies.': '在你的依赖项中发现了潜在的安全漏洞。',
    'Only the owner of this repository can see this message.': '只有此存储库的所有者能看到此消息。',
    'You can see this message because you have been granted access to Dependabot alerts for this repository.':
      '你能看到此消息是因为你有权访问此存储库的 Dependabot 警报。',
    'See Dependabot alerts': '查看 Dependabot 警报',

    // 帐户继任者提醒
    'Ensure the future of your work!': '确保你的工作得以延续！',
    'Consider inviting another GitHub user to be your successor.': '考虑邀请另一个 GitHub 用户作为你的继任者。',
    'Inviting a successor helps ensure the continuity of your work in case you are unable to access your account.':
      '邀请继任者有助于在你无法访问帐户时确保工作的延续。',
    'Invite a successor': '邀请继任者'
  },
  scoped: {
    // 复刻 / 分支信息条
    'This branch is': '此分支',
    'ahead of': '领先',
    behind: '落后',
    'This branch is up to date with': '此分支已同步至',
    Contribute: '贡献',
    'Open Contribute dropdown': '打开贡献下拉菜单',
    'This branch is not ahead of the upstream': '此分支没有领先上游',
    'Open a pull request to contribute your changes upstream.': '创建拉取请求以将你的更改贡献到上游。',
    'No new commits yet. Enjoy your day!': '暂无新提交。祝你愉快！',
    Compare: '比较',
    'Sync fork': '同步复刻',
    'Open Fetch upstream dropdown': '打开同步上游下拉菜单',
    'This branch is out-of-date': '此分支已过时',
    'This branch is not behind the upstream': '此分支没有落后上游',
    'No new commits to fetch. Enjoy your day!': '没有可获取的新提交。祝你愉快！',
    'Update branch to merge the latest changes from the upstream repository into this branch.':
      '更新分支以将上游存储库的最新更改合并到此分支。',
    'Learn more about syncing a fork': '了解如何同步复刻',
    'Update branch': '更新分支',
    'Discarding changes...': '正在放弃更改...',
    'This branch has conflicts that must be resolved': '此分支存在必须解决的冲突',
    'You can resolve merge conflicts using the command line and a text editor.': '你可以使用命令行和文本编辑器解决合并冲突。',
    'Sorry, getting ahead/behind information for this branch is taking too long.': '抱歉，获取此分支的领先/落后信息耗时过长。',
    'Cannot retrieve ahead/behind information for this branch.': '无法获取此分支的领先/落后信息。',
    'Cannot retrieve comparison with upstream repository.': '无法获取与上游存储库的比较结果。',

    // 发布操作
    'Draft a release': '起草发行版',
    // 部署横幅按钮
    Deploy: '部署',
    // 交互限制：可交互的角色
    'New users': '新用户',
    Collaborators: '协作者',
    // 不是 <协作者> 的用户将无法与此存储库交互。
    collaborators: '协作者',
    'or view': '或查看',
    // 缺少必填自定义属性
    'Remind me later': '稍后提醒'
  },
  regexp,
  // 父存储库默认分支改名弹层（ParentBranchRenamePopover，React 把 {' '} 渲染成单独的文本节点）：
  // 整句命中后链接前的空白不再保留，链接文字照常翻译
  inline: [
    ["You can rename this fork's default branch to match in {}", '如需重命名此复刻的默认分支以保持一致可前往{}'],
    ['You can rename this fork’s default branch to match in {}', '如需重命名此复刻的默认分支以保持一致可前往{}']
  ],
  ignore: [
    // 最近推送的分支横幅：分支名链接（Flash > Box > a.text-bold）
    '[class*="Flash__"] > [class*="Box__"] > a.text-bold[href*="/tree/"]'
  ]
} satisfies PageDictionary
