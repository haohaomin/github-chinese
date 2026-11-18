import type { PageDictionary } from '../../../core/types'
import { DURATION_SOURCE, formatDuration, RUN_STATUS, RUN_STATUS_LABEL_SOURCE, RUN_STATUS_LABELS } from './format'

/**
 * Actions 标签页：侧栏、工作流运行列表、筛选栏、单个工作流页（菜单、状态徽章、禁用 / 启用、横幅）、
 * 手动运行（workflow_dispatch）对话框、删除运行对话框。
 * 末尾的 Pin X、Download X、Delete X 等宽泛规则须排在其他文件的具体规则之后。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 筛选键（小写） */
const FILTER_KEYS: Readonly<Record<string, string>> = {
  workflow: '工作流',
  event: '事件',
  status: '状态',
  branch: '分支',
  actor: '参与者'
}

const FILTER_KEY_SOURCE = Object.keys(FILTER_KEYS).join('|')

/** 筛选建议的提供方名称（建议项 aria-label 末尾：ci, Workflow） */
const FILTER_PROVIDERS: Readonly<Record<string, string>> = {
  Workflow: '工作流',
  Event: '事件',
  Status: '状态',
  Branch: '分支',
  Actor: '参与者'
}

/** 排除建议的筛选键：Exclude workflow、Exclude is */
const EXCLUDE_KEYS: Readonly<Record<string, string>> = { ...FILTER_KEYS, is: '状态', key: '键' }

/** 取值为用户内容的提供方：筛选框建议项（按 aria-label 原文或译文识别）与表头筛选面板（按输入框 aria-label 识别） */
const USER_VALUE_PROVIDERS = ['Workflow', 'Event', 'Branch', 'Actor']
const USER_VALUE_FILTERS = ['workflow', 'event', 'branch', 'actor']

const SUGGESTION_VALUE_IGNORE =
  `li[role="option"]:is(${USER_VALUE_PROVIDERS.flatMap(name => [
    `[aria-label$=", ${name}"]`,
    `[aria-label$="，${FILTER_PROVIDERS[name]}"]`
  ]).join(', ')})` + ' :is([class*="displayName__"], [data-component="ActionList.Description"])'

const HEADER_FILTER_VALUE_IGNORE =
  `[data-component="SelectPanel"]:has(input:is(${USER_VALUE_FILTERS.flatMap(key => [
    `[aria-label="Filter ${key} options"]`,
    `[aria-label="筛选${FILTER_KEYS[key]}选项"]`
  ]).join(', ')}))` + ' [role="option"] :is([data-component="ActionList.Item.Label"], [data-component="ActionList.Description"])'

/** 筛选建议项的 aria-label：ci, Workflow；Success, Status；main (default), Branch */
function suggestionLabel(value: string, provider: string): string {
  const text = provider === 'Status' ? (pick(RUN_STATUS, value) ?? value) : value.replace(/ \(default\)$/, '（默认）')
  return `${text}，${pick(FILTER_PROVIDERS, provider)}`
}

/** completed successfully: Run 27404 of ci. perf(...) → 成功完成：ci 第 27404 次运行。perf(...) */
function runLabel(status: string, number: string, workflow: string, title: string): string {
  const prefix = pick(RUN_STATUS_LABELS, `${status}:`) ?? `${status}：`
  return `${prefix}${workflow} 第 ${number} 次运行。${title}`
}

/** 入门引导任务名（服务端数据，组织概述的入门任务列表同样展示）：已知任务用中文，其余保留原文 */
const ONBOARDING_TASKS: Readonly<Record<string, string>> = {
  'Run a continuous integration test': '运行持续集成测试',
  'Invite your first member': '邀请第一个成员',
  "Customize members' permissions": '自定义成员权限',
  'Customize members’ permissions': '自定义成员权限',
  'Create a pull request': '创建拉取请求',
  'Create a branch protection rule': '创建分支保护规则',
  'Auto-assign new issues': '自动分配新议题'
}

const DURATION_RE = new RegExp(`^${DURATION_SOURCE}$`)

/** 自动刷新间隔：30s、1m、Off */
function refreshInterval(label: string): string {
  if (label === 'Off') return '关闭'
  return DURATION_RE.test(label) ? formatDuration(label) : label
}

export default {
  static: {
    // 侧栏
    'Show more workflows...': '显示更多工作流...',
    'Show more workflows…': '显示更多工作流…',
    'Actions workflows': '操作工作流',
    'Actions management': '操作管理',
    'Open Actions': '打开操作',
    'Usage metrics': '使用情况指标',
    'Performance metrics': '性能指标',
    Attestations: '证明',
    Lockfile: '锁定文件',
    'Filter workflows...': '筛选工作流...',
    'Filter workflows…': '筛选工作流…',
    'Search workflows': '搜索工作流',
    'Sort workflows': '排序工作流',
    'Name (A–Z)': '名称 (A–Z)',
    'Name (Z–A)': '名称 (Z–A)',
    'Last run (Newest first)': '最近运行（最新优先）',
    'Last run (Oldest first)': '最近运行（最早优先）',
    'Loading workflows…': '正在加载工作流…',
    'Loading workflows...': '正在加载工作流...',
    'Try loading workflows again': '重新加载工作流',
    'Could not load workflows': '无法加载工作流',
    'Could not load workflows. Try again.': '无法加载工作流。请重试。',
    'No matching workflows': '没有匹配的工作流',
    'No matching workflows.': '没有匹配的工作流。',
    'No workflows found': '未找到工作流',
    'Pin workflow': '置顶工作流',
    'Unpin workflow': '取消置顶工作流',
    'Unpin this workflow?': '取消置顶此工作流？',
    'This action will unpin the workflow for all viewers of this repository.': '这将为此存储库的所有查看者取消置顶该工作流。',
    'Yes, unpin': '是，取消置顶',
    'This workflow does not exist.': '此工作流不存在。',
    'The workflow may have been renamed or deleted.': '此工作流可能已被重命名或删除。',
    'View all workflows': '查看全部工作流',
    'Unable to load workflow runs': '无法加载工作流运行',
    'There was a problem loading workflow runs. Reload the page to try again.': '加载工作流运行时出错。请重新加载页面。',
    'Reload page': '重新加载页面',

    // 运行列表
    'Showing runs from all workflows': '显示所有工作流的运行',
    'Filter workflow runs': '筛选工作流运行',
    'Search runs': '搜索运行',
    Workflows: '工作流',
    'Workflow runs': '工作流运行',
    'Workflow runs results': '工作流运行结果',
    'Workflow run filters': '工作流运行筛选器',
    'Auto-refresh': '自动刷新',
    'Auto-refresh is only available on the first page': '仅第一页可自动刷新',
    'Every 10 seconds': '每 10 秒',
    'Every 30 seconds': '每 30 秒',
    'Every minute': '每分钟',
    'Every 5 minutes': '每 5 分钟',
    'Refresh now': '立即刷新',
    'Loading workflow runs': '正在加载工作流运行',
    'No workflow runs found': '未找到工作流运行',
    'You have hit the limit of pages.': '已达到页数上限。',
    'You could filter by': '可以按',
    'to continue reviewing older workflow runs.': '筛选以继续查看更早的工作流运行。',
    'You could search': '可以搜索',
    'all workflow runs': '所有工作流运行',
    'or try different filters.': '或尝试其他筛选器。',
    'This workflow has no runs yet.': '此工作流尚无运行。',
    'There are no workflow runs yet.': '尚无工作流运行。',
    'You can narrow down the results and go further in time using the': '你可以使用',
    'filter or the other filters available.': '筛选器或其他可用筛选器缩小结果范围并查看更早的运行。',
    'Help us improve GitHub Actions': '帮助我们改进 GitHub 操作',
    'Tell us how to make GitHub Actions work better for you with three quick questions.': '通过三个简短问题告诉我们如何改进 GitHub 操作。',
    'Codespaces Prebuilds': '代码空间预生成',
    'Showing all prebuild configuration runs for Codespaces. Learn about': '显示代码空间的所有预生成配置运行。了解',
    'prebuilding your codespaces.': '如何预生成代码空间。',
    'Run duration': '运行时长',
    'This is the workflow execution time which may be different than the billed time.': '这是可能与计费时间不同的工作流执行时间。',
    'Disruptive workflow run': '破坏性工作流运行',
    'This workflow run has been marked as disruptive': '此工作流运行已被标记为破坏性运行',
    '(Unknown event)': '（未知事件）',

    // 运行状态图标的无障碍前缀
    ...RUN_STATUS_LABELS,

    // 运行菜单与删除对话框
    'Cancel run': '取消运行',
    'View workflow file': '查看工作流文件',
    'Delete workflow run': '删除工作流运行',
    'Are you sure you want to permanently delete this workflow run?': '确定要永久删除此工作流运行吗？',
    'Yes, delete this workflow run': '是，删除此工作流运行',
    'Workflow run deleted successfully.': '工作流运行已删除。',
    'Loading workflow run delete warning': '正在加载删除警告',
    'Invalid workflow run delete warning response': '删除警告响应无效',
    'The following pull request may not be able to be merged if this run is deleted:': '以下拉取请求可能在删除此运行后无法合并：',
    'The following pull requests may not be able to be merged if this run is deleted:': '以下拉取请求可能在删除此运行后无法合并：',
    'Open pull request:': '打开的拉取请求：',
    'Closed pull request:': '已关闭的拉取请求：',
    'The workflow run action could not be completed.': '无法完成工作流运行操作。',
    'The workflow run action returned an invalid response.': '工作流运行操作返回了无效响应。',

    // 筛选栏
    'Filter by Workflow': '按工作流筛选',
    'Filter by Event': '按事件筛选',
    'Filter by Status': '按状态筛选',
    'Filter by Branch': '按分支筛选',
    'Filter by Actor': '按参与者筛选',
    'Filter workflow options': '筛选工作流选项',
    'Filter event options': '筛选事件选项',
    'Filter status options': '筛选状态选项',
    'Filter branch options': '筛选分支选项',
    'Filter actor options': '筛选参与者选项',
    'Filter by workflow': '按工作流筛选',
    'Filter by the event that triggered a workflow run': '按触发工作流运行的事件筛选',
    'Filter by workflow run status': '按工作流运行状态筛选',
    'Filter by the workflow run branch': '按工作流运行的分支筛选',
    'Filter by the actor who triggered a workflow run': '按触发工作流运行的参与者筛选',
    'Filter menus are not available for complex queries.': '复杂查询不支持筛选器菜单。',
    'Adding this filter would make your query too long. Use the filter input instead.': '添加此筛选器会使查询过长。请改用筛选器输入框。',
    'No matching events.': '没有匹配的事件。',
    'Find an event': '查找事件',
    'Find a status': '查找状态',
    'Find a user': '查找用户',
    // 筛选框建议列表中筛选键的组合 aria-label：<名称>, Filter, <说明>（Filter 为名词，作“筛选器”）
    'Workflow, Filter, Filter by workflow': '工作流，筛选器，按工作流筛选',
    'Event, Filter, Filter by the event that triggered a workflow run': '事件，筛选器，按触发工作流运行的事件筛选',
    'Status, Filter, Filter by workflow run status': '状态，筛选器，按工作流运行状态筛选',
    'Branch, Filter, Filter by the workflow run branch': '分支，筛选器，按工作流运行的分支筛选',
    'Actor, Filter, Filter by the actor who triggered a workflow run': '参与者，筛选器，按触发工作流运行的参与者筛选',
    'Creation date, Filter, Creation date': '创建日期，筛选器，创建日期',
    // 缓存筛选
    'Key, Filter, Filter by cache key': '键，筛选器，按缓存键筛选',
    'Branch, Filter, Filter by branch': '分支，筛选器，按分支筛选',

    // 单个工作流页
    'Workflow options': '工作流选项',
    'Show workflow options': '显示工作流选项',
    'More workflow actions': '更多工作流操作',
    'Create status badge': '创建状态徽章',
    'Disable workflow': '禁用工作流',
    'Disabling this workflow prevents future runs until it is enabled again.': '禁用此工作流将阻止其在重新启用前再次运行。',
    'Enable workflow': '启用工作流',
    'Enabling workflow': '正在启用工作流',
    'Continue running workflow': '继续运行工作流',
    'Workflow disabled successfully.': '工作流已禁用。',
    'Workflow enabled successfully.': '工作流已启用。',
    'There was an error disabling this workflow.': '禁用此工作流时出错。',
    'There was an error enabling this workflow.': '启用此工作流时出错。',
    'Required by ruleset': '规则集要求',
    'This scheduled workflow is disabled because scheduled workflows are disabled by default in forks.':
      '此计划工作流因复刻中默认禁用计划工作流而被禁用。',
    'This workflow was disabled manually.': '此工作流已被手动禁用。',
    'This workflow will be disabled soon because there’s no recent activity in the repository.': '此工作流因存储库近期没有活动即将被禁用。',
    "This workflow will be disabled soon because there's no recent activity in the repository.": '此工作流因存储库近期没有活动即将被禁用。',
    'GitHub Actions is currently disabled for this workflow.': '此工作流当前已禁用 GitHub 操作。',
    'GitHub Actions is currently disabled for your account.': '你的帐户当前已禁用 GitHub 操作。',
    'GitHub Actions is currently disabled for this repository.': '此存储库当前已禁用 GitHub 操作。',
    'Please reach out to': '请联系',
    'for assistance.': '获取帮助。',

    // 状态徽章
    'Status badge configuration': '状态徽章配置',
    'Loading status badge configuration': '正在加载状态徽章配置',
    'Status badge configuration could not be loaded.': '无法加载状态徽章配置。',
    'The status badge URLs returned by the server were invalid.': '服务器返回的状态徽章 URL 无效。',
    'Try loading the status badge configuration again.': '重新加载状态徽章配置。',
    'Use default branch': '使用默认分支',
    'Copy status badge Markdown': '复制状态徽章 Markdown',

    // 手动运行
    'Run workflow': '运行工作流',
    'Retry run': '重试运行',
    'Running workflow': '正在运行工作流',
    'Running workflow...': '正在运行工作流...',
    'Workflow run was successfully requested.': '已请求运行工作流。',
    'This workflow has a workflow_dispatch event trigger.': '此工作流有 workflow_dispatch 事件触发器。',
    'This workflow has a': '此工作流有',
    'event trigger.': '事件触发器。',
    'Use workflow from': '工作流来源',
    'Loading workflow details.': '正在加载工作流详细信息。',
    'Workflow details could not be loaded.': '无法加载工作流详细信息。',
    'Try loading the workflow details again.': '重新加载工作流详细信息。',
    'Workflow details could not be loaded. Try loading the workflow details again.': '无法加载工作流详细信息。请重新加载。',
    'Workflow dispatch': '工作流调度',
    'Workflow inputs': '工作流输入',
    'Workflow dispatch failed': '工作流调度失败',
    'Workflow could not be run.': '工作流无法运行。',
    'Workflow could not be run. Please try again.': '工作流无法运行。请重试。',
    'Workflow dispatch unavailable': '无法调度工作流',
    // Workflow does not exist or does not have a <code>workflow_dispatch</code> trigger in this branch / tag.
    // 首段两种句子共用，分支、标签合称“此引用”（同对话框 Select ref → 选择引用），末段不加原文没有的括号
    'Workflow does not exist or does not have a': '工作流不存在或此引用中没有',
    'trigger in this branch.': '触发器。',
    'trigger in this tag.': '触发器。',
    'Workflow dispatch unavailable. Workflow does not exist or does not have a workflow_dispatch trigger in this branch.':
      '无法调度工作流。工作流不存在或此分支中没有 workflow_dispatch 触发器。',
    'Workflow dispatch unavailable. Workflow does not exist or does not have a workflow_dispatch trigger in this tag.':
      '无法调度工作流。工作流不存在或此标签中没有 workflow_dispatch 触发器。',
    'This input expects a number.': '此输入需要数字。',
    'No environments are configured.': '尚未配置环境。',
    'Configure environments': '配置环境',
    'Learn more about manual workflows': '了解手动工作流',
    'Select ref': '选择引用',

    // 横幅
    'Workflows aren’t being run on this forked repository': '此复刻存储库中的工作流未运行',
    "Workflows aren't being run on this forked repository": '此复刻存储库中的工作流未运行',
    'Workflows aren’t being run on this repository': '此存储库中的工作流未运行',
    "Workflows aren't being run on this repository": '此存储库中的工作流未运行',
    'Because this repository contained workflow files when it was forked, we have disabled them from running on this fork. Make sure you understand the configured workflows and their expected usage before enabling Actions on this repository.':
      '复刻时此存储库包含工作流文件，因此已在此复刻中禁用这些工作流。请在此存储库启用操作前确认已了解所配置的工作流及其预期用途。',
    'Because this repository contained workflow files when it was forked, we have disabled them from running on this fork. Make sure you understand the configured workflows and their expected usage before enabling Actions on this repository. Some GitHub features that depend on Actions may still be able to run.':
      '复刻时此存储库包含工作流文件，因此已在此复刻中禁用这些工作流。请在此存储库启用操作前确认已了解所配置的工作流及其预期用途。部分依赖操作的 GitHub 功能可能仍可运行。',
    'I understand my workflows, go ahead and enable them': '我了解我的工作流，启用它们',
    'Enable Actions on this repository': '在此存储库启用操作',
    'Enabling Actions': '正在启用操作',
    'View the workflows directory': '查看工作流目录',
    'GitHub Actions is not currently enabled on this repository. Some GitHub features that depend on Actions may still be able to run.':
      '此存储库当前未启用 GitHub 操作。部分依赖操作的 GitHub 功能可能仍可运行。',
    'GitHub Actions has been enabled': 'GitHub 操作已启用',
    'There was an error enabling GitHub Actions': '启用 GitHub 操作时出错',
    'Actions Enabled.': '操作已启用。',
    'GitHub Actions usage limit': 'GitHub 操作使用限制',
    // Your account has reached its current usage limit for <b>Actions</b>.
    'Your account has reached its current usage limit for': '你的帐户已达到当前使用上限的产品为',
    'Get in touch with our customer support team to continue.': '联系客户支持团队以继续。',
    'Please contact your admin to continue.': '请联系管理员以继续。',
    'GitHub Actions is not available for private repositories on legacy per-repository billing plans.':
      '旧版按存储库计费计划下的专用存储库无法使用 GitHub 操作。',
    'Please visit your billing settings to upgrade your account.': '请前往计费设置升级帐户。',
    'GitHub Actions is not available for private repositories on legacy per-repository billing plans. Please visit your billing settings to upgrade your account.':
      '旧版按存储库计费计划下的专用存储库无法使用 GitHub 操作。请前往计费设置升级帐户。',
    // The billing plan for <span>所有者</span> does not include access to GitHub Actions. …
    'The billing plan for': '帐户',
    'does not include access to GitHub Actions. Please contact the organization owner or billing manager for questions about the current billing plan':
      '的计费计划不包含 GitHub 操作的访问权限。请联系组织所有者或账单管理员咨询当前计费计划',
    'Your account’s billing is currently locked. Please update your payment information.': '你的帐户计费已锁定。请更新付款信息。',
    "Your account's billing is currently locked. Please update your payment information.": '你的帐户计费已锁定。请更新付款信息。',
    'GitHub Actions workflows can’t be executed on this repository.': '此存储库无法执行 GitHub 操作工作流。',
    "GitHub Actions workflows can't be executed on this repository.": '此存储库无法执行 GitHub 操作工作流。',
    'Learn more about GitHub Actions': '了解 GitHub 操作',
    'Learn more about GitHub Actions limits': '了解 GitHub 操作的限制',
    'GitHub-hosted runner capacity': 'GitHub 托管运行器容量',
    'Upcoming change to GitHub App installation token format': 'GitHub 应用安装令牌格式即将变更',
    'GitHub App installation tokens will soon use a new stateless format (ghs_...) and may be longer (~520 characters). Apps with hardcoded length assumptions may break.':
      'GitHub 应用安装令牌即将改用新的无状态格式 (ghs_...) 且长度可能更长（约 520 个字符）。硬编码长度假设的应用可能会出错。',
    'Validate your apps and workflows with the per-request override header detailed in this':
      '使用逐请求覆盖标头验证你的应用和工作流的方法详见',

    // 试用入门引导卡片
    ...ONBOARDING_TASKS,
    'This is your repository’s "Actions" tab, where you can find the jobs most recently run by your workflows. Your demo-repository includes the':
      '这是存储库的“操作”标签页，可在此查看工作流最近运行的作业。你的 demo-repository 包含',
    'workflow, which allows developers to continuously integrate new code while automatically checking for invalid HTML.':
      '工作流，可让开发人员在持续集成新代码时自动检查无效的 HTML。',
    'workflow in your repository is currently configured to run automatically whenever someone pushes code, or to run manually; which you can do from this page. Just select':
      '工作流当前配置为有人推送代码时自动运行，也可以在此页面手动运行。选择下方的',
    'below to see it in action.': '即可查看运行效果。',
    'Back to onboarding': '返回入门引导',
    'Continuous integration docs': '持续集成文档',
    'You completed a task!': '你完成了一项任务！',
    'Creating demo repository': '正在创建演示存储库',
    'See all tasks': '查看所有任务',
    'You’ve completed all your tasks!': '你已完成所有任务！',
    "You've completed all your tasks!": '你已完成所有任务！',
    'Discover more GitHub features or upgrade your plan.': '探索更多 GitHub 功能或升级计划。'
  },

  scoped: {
    Workflow: '工作流',
    Actor: '参与者',
    Management: '管理',
    Lab: '实验',
    Off: '关闭',
    Excluded: '已排除',
    'See details': '查看详细信息',
    'This action cannot be undone': '此操作无法撤销',
    'Default branch': '默认分支',
    // 工作流不存在页的标题
    'Not found': '未找到',
    // 手动运行对话框：引用选择器按钮的前缀与分支名拆开时（合在一起的由正则处理）
    'Branch:': '分支：',

    // 运行描述：Commit de7a4dc pushed by octocat
    by: '由',
    'Issue comment': '议题评论',
    Scheduled: '计划运行',
    'Manually run by': '手动运行者',
    'Merge group': '合并组',
    Discussion: '讨论',
    'Discussion comment': '讨论评论',
    Deployment: '部署',
    pushed: '推送',
    // 采集到的运行描述中 opened 都在 Pull request #N opened by X 里（拉取请求动词 open → 创建）
    opened: '创建',
    reopened: '重新打开',
    closed: '关闭',
    created: '创建',
    completed: '完成',
    requested: '请求',
    rerequested: '重新请求',
    synchronize: '同步',
    stacked: '堆叠',
    labeled: '添加标签',
    unlabeled: '删除标签',
    edited: '编辑',
    deleted: '删除',
    published: '发布',
    released: '发布',
    prereleased: '预发行',
    submitted: '提交',
    dismissed: '消除',
    assigned: '分配',
    unassigned: '取消分配',
    enqueued: '加入队列',
    'ready for review': '标记为可供审查',
    'review requested': '请求审查',
    'checks requested': '请求检查',
    'commented on': '评论了',
    mannequin: '占位帐户',
    Spammy: '疑似垃圾帐户',

    // 试用入门引导卡片的功能链接与按钮
    'Client apps': '客户端应用',
    'Project management': '项目管理',
    'Team administration': '团队管理',
    'Talk to us': '联系我们'
  },

  regexp: [
    // 运行条目的无障碍名称
    [
      new RegExp(`^(${RUN_STATUS_LABEL_SOURCE}): Run (\\d+) of (.+?)\\.(?: (.+))?$`),
      (_, status: string, number: string, workflow: string, title: string) => runLabel(status, number, workflow, title)
    ],
    [/^(More )?actions for workflow run (\d+)$/, (_, more: string, number: string) => `工作流运行 ${number} 的${more ? '更多' : ''}操作`],
    [/^View pull request #(\d+)$/, '查看拉取请求 #$1'],
    [/^#(\d+) \(comment\)$/, '#$1（评论）'],
    // 运行数量
    [/^([\d,]+\+?) workflow runs?( results?)?$/, (_, count: string, results: string) => `${count} 个工作流运行${results ? '结果' : ''}`],
    [/^([\d,]+) workflow runs? loaded$/, '已加载 $1 个工作流运行'],
    [/^Workflow runs for (.+?)( results)?$/, (_, name: string, results: string) => `${name} 的工作流运行${results ? '结果' : ''}`],
    [/^([\d,]+) workflows? shown$/, '显示 $1 个工作流'],
    [/^Auto-refresh: (.+)$/, (_, label: string) => `自动刷新：${refreshInterval(label)}`],
    [
      new RegExp(`^(${DURATION_SOURCE})\\. Show run duration details$`),
      (_, duration: string) => `${formatDuration(duration)}。显示运行时长详细信息`
    ],
    [/^This workflow run has been marked as disruptive\. Workflow run ID (\d+)\.$/, '此工作流运行已被标记为破坏性运行。工作流运行 ID $1。'],
    [/^(\d+) pull requests? may be affected\.$/, '可能影响 $1 个拉取请求。'],
    // 筛选栏
    [
      new RegExp(`^Unable to load (${FILTER_KEY_SOURCE}) filters(\\. Try again\\.|\\.)?$`),
      (_, key: string, suffix: string) =>
        `无法加载${pick(FILTER_KEYS, key) ?? key}筛选器${suffix ? (suffix === '.' ? '。' : '。请重试。') : ''}`
    ],
    [/^(.+) will be ignored since log searching is not yet available$/, '因暂不支持日志搜索而忽略 $1'],
    [/^(.+), Excluded$/, '$1，已排除'],
    // 筛选框建议项的 aria-label：ci, Workflow；Exclude workflow
    [
      new RegExp(`^(.+), (${Object.keys(FILTER_PROVIDERS).join('|')})$`),
      (_, value: string, provider: string) => suggestionLabel(value, provider)
    ],
    [new RegExp(`^Exclude (${Object.keys(EXCLUDE_KEYS).join('|')})$`), (_, key: string) => `排除${pick(EXCLUDE_KEYS, key) ?? key}`],
    // 计划工作流因不活跃被禁用
    [
      /^This scheduled workflow is disabled because there hasn['’]t been activity in this repository for at least (\d+) days\.( Enable this workflow to resume scheduled runs\.)?$/,
      (_, days: string, resume: string) =>
        `此计划工作流因存储库已至少 ${days} 天没有活动而被禁用。${resume ? '启用此工作流以恢复计划运行。' : ''}`
    ],
    [
      /^Workflow (.+) (pinned|unpinned)\.$/,
      (_, name: string, action: string) => `工作流 ${name} 已${action === 'pinned' ? '置顶' : '取消置顶'}。`
    ],
    // 入门引导：Up next: <任务名>
    [/^Up next:(?: (.+))?$/, (_, task: string | undefined) => `下一步：${task ? (pick(ONBOARDING_TASKS, task) ?? task) : ''}`],
    // 手动运行、状态徽章的引用选择器
    [/^Use workflow from: (.+)$/, '工作流来源：$1'],
    [/^(Branch|Tag): (.+)$/, (_, kind: string, name: string) => `${kind === 'Branch' ? '分支' : '标签'}：${name}`],
    [/^(.+) \(default\)$/, '$1（默认）'],
    // 宽泛规则：须在其他文件的具体规则之后
    [/^(Pin|Unpin) (.+)$/, (_, action: string, name: string) => `${action === 'Pin' ? '置顶' : '取消置顶'} ${name}`],
    [/^Download (.+?)(?: \(opens in a new tab\))?$/, '下载 $1'],
    [/^Delete (.+)$/, '删除 $1']
  ],

  ignore: [
    // 侧栏工作流名
    'a[href*="/actions/workflows/"] [data-component="ActionList.Item.Label"]',
    // 单个工作流页标题
    '[data-component="PageHeader"]:has(a[href*="/.github/workflows/"]) [data-component="PH_Title"]',
    // 筛选框建议与表头筛选面板中的工作流名、事件标识符、分支名、用户名
    SUGGESTION_VALUE_IGNORE,
    HEADER_FILTER_VALUE_IGNORE
  ]
} satisfies PageDictionary
