import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { compileIgnoreIndex } from '../../../src/core/selectors'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import actions from '../../../src/locales/zh-CN/actions'
import { deploymentStatus, formatDuration } from '../../../src/locales/zh-CN/actions/format'
import { formatDate, relativeTime } from '../../../src/locales/zh-CN/helpers'
import actionsTW from '../../../src/locales/zh-TW/actions'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = actions

const matcher = createMatcher([['actions', actions]])

/** 日期、相对时间由 helpers 生成，期望按同一格式拼出 */
const day = (year: number, month: number, date: number): string => formatDate(year, month, date)
const ago = (amount: number, unit: Intl.RelativeTimeFormatUnit): string => relativeTime(-amount, unit)

/** Actions 页面的作用域：common → repository → actions */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'actions']

function translate(text: string): string | undefined {
  return matcher.translate(text, [...SCOPE])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按合并后的正则顺序排列（run → deployments → manage → new → workflows），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // ---------- run ----------
  {
    hits: [
      ['Triggered via push', '由推送触发'],
      ['Triggered via pull request', '由拉取请求触发'],
      ['Triggered via workflow run', '由工作流运行触发'],
      ['Triggered via issue', '由议题触发'],
      ['Triggered via public', '由存储库设为公共触发'],
      // 产品名译出，与两侧中文之间按中英文规则留空格
      ['Triggered via GitHub Pages', '由 GitHub 页面触发'],
      ['Triggered via constructor', '由 constructor 触发']
    ],
    misses: ['Triggered via', 'Triggered by push']
  },
  {
    hits: [
      ['1 notice', '1 个提示'],
      ['3 warnings', '3 个警告'],
      ['2 errors and 6 notices', '2 个错误和 6 个提示'],
      ['1 error, 2 warnings, and 3 notices', '1 个错误、2 个警告和 3 个提示']
    ],
    misses: ['notices', '2 errors and']
  },
  {
    hits: [
      ['Process completed with exit code 1.', '进程以退出代码 1 完成。'],
      ['Process completed with exit code 127.', '进程以退出代码 127 完成。']
    ],
    misses: ['Process completed with exit code 1']
  },
  {
    hits: [["The process '/usr/bin/git' failed with exit code 128", "进程 '/usr/bin/git' 以退出代码 128 失败"]],
    misses: ['The process failed with exit code 128']
  },
  {
    hits: [
      ['Canceling since a higher priority waiting request for size data-16028 exists', '因 size data-16028 存在更高优先级的等待请求而取消']
    ],
    misses: ['Canceling since a higher priority waiting request exists']
  },
  {
    hits: [
      [
        'Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: octo-org/hello-world@v4. For more information see:',
        'Node.js 20 已弃用。以下操作以 Node.js 20 为目标但被强制在 Node.js 24 上运行：octo-org/hello-world@v4。详见：'
      ],
      [
        'Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4. For more information see:',
        'Node.js 20 已弃用。以下操作以 Node.js 20 为目标但被强制在 Node.js 24 上运行：actions/checkout@v4, actions/setup-node@v4。详见：'
      ]
    ],
    misses: ['Node.js 20 is deprecated.']
  },
  {
    hits: [
      [
        'Node.js 16 actions are deprecated. Please update the following actions to use Node.js 20: actions/checkout@v3. For more information see:',
        'Node.js 16 操作已弃用。请将以下操作更新为使用 Node.js 20：actions/checkout@v3。详见：'
      ]
    ],
    misses: ['Node.js 16 actions are deprecated.']
  },
  {
    hits: [
      [
        '"The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026. For more information, see',
        `"ubuntu-latest 标签将于 ${day(2026, 10, 19)}开始迁移到 Ubuntu 26。详见`
      ],
      [
        'The macos-latest label will migrate to macOS 15 beginning Aug 4, 2025. For more information, see',
        `macos-latest 标签将于 ${day(2025, 8, 4)}开始迁移到 macOS 15。详见`
      ]
    ],
    misses: ['The ubuntu-latest label will migrate to Ubuntu 26.']
  },
  {
    hits: [
      ['The job has exceeded the maximum execution time of 6h0m0s', '作业已超过最长执行时间 6小时 0分钟 0秒'],
      ['The job has exceeded the maximum execution time of 30m 0s', '作业已超过最长执行时间 30分钟 0秒']
    ],
    misses: ['The job has exceeded the maximum execution time']
  },
  {
    hits: [
      // 运行器名（GitHub Actions 2）是名称，原样保留，不按产品名改译
      [
        'The job running on runner GitHub Actions 2 has exceeded the maximum execution time of 360 minutes.',
        '运行器 GitHub Actions 2 上运行的作业已超过最长执行时间 360 分钟。'
      ]
    ],
    misses: ['The job running on runner GitHub Actions 2 has exceeded the maximum execution time.']
  },
  {
    hits: [['The job was canceled because "test" failed.', '作业因“test”失败而取消。']],
    misses: ['The job was canceled.']
  },
  {
    hits: [['The strategy configuration was canceled because "test.unit-test" failed', '策略配置因“test.unit-test”失败而取消']],
    misses: ['The strategy configuration was canceled']
  },
  {
    hits: [['Input required and not supplied: token', '缺少必需的输入：token']],
    misses: ['Input required and not supplied']
  },
  {
    hits: [
      [
        'No files were found with the provided path: dist/. No artifacts will be uploaded.',
        '在提供的路径中未找到文件：dist/。不会上传任何产物。'
      ]
    ],
    misses: ['No files were found with the provided path: dist/']
  },
  {
    hits: [
      [
        'Branch "feature/x" is not allowed to deploy to github-pages due to environment protection rules.',
        '分支“feature/x”因环境保护规则不允许部署到 github-pages。'
      ]
    ],
    misses: ['Branch "main" is not allowed to deploy.']
  },
  {
    hits: [
      [
        'The self-hosted runner: build-01 lost communication with the server. Verify the machine is running and has a healthy network connection. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.',
        '自托管运行器 build-01 与服务器失去连接。请确认该机器正在运行且网络连接正常。工作流中终止运行器进程、耗尽其 CPU 或内存、阻断其网络访问的任何操作都可能导致此错误。'
      ],
      [
        'The self-hosted runner lost communication with the server. Verify the machine is running and has a healthy network connection. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.',
        '自托管运行器与服务器失去连接。请确认该机器正在运行且网络连接正常。工作流中终止运行器进程、耗尽其 CPU 或内存、阻断其网络访问的任何操作都可能导致此错误。'
      ],
      // 运行器名 GitHub Actions 12 原样保留
      [
        'The hosted runner: GitHub Actions 12 lost communication with the server. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.',
        '托管运行器 GitHub Actions 12 与服务器失去连接。工作流中终止运行器进程、耗尽其 CPU 或内存、阻断其网络访问的任何操作都可能导致此错误。'
      ]
    ],
    misses: ['The hosted runner lost communication with the server.']
  },
  {
    hits: [
      [
        'This request was automatically failed because there were no enabled runners online to process the request for more than 1 days.',
        '此请求因超过 1 天没有已启用的在线运行器处理而自动失败。'
      ]
    ],
    misses: ['This request was automatically failed.']
  },
  {
    hits: [
      ['The job was not acquired by Runner of type hosted even after multiple attempts', '多次尝试后作业仍未被托管运行器获取'],
      ['The job was not acquired by Runner of type self-hosted even after multiple attempts', '多次尝试后作业仍未被自托管运行器获取']
    ],
    misses: ['The job was not acquired by Runner of type larger even after multiple attempts']
  },
  { hits: [['· 3 steps', '· 3 个步骤']], misses: ['3 steps', '· steps'] },
  {
    hits: [
      ['Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1', '运行 actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1'],
      ['Post Run actions/checkout@v4', '后置运行 actions/checkout@v4'],
      ['Run docker://alpine:3.8', '运行 docker://alpine:3.8'],
      ['Run ./.github/actions/setup', '运行 ./.github/actions/setup']
    ],
    misses: ['Run unit tests', 'Post Setup Vite+']
  },
  {
    hits: [
      ['succeeded 5 minutes ago in 1m 41s', `成功于 ${ago(5, 'minute')} 用时 1分钟 41秒`],
      ['failed Oct 26, 2026 in 54s', `失败于 ${day(2026, 10, 26)} 用时 54秒`],
      ['timed out 2 hours ago in 6h 0m 0s', `超时于 ${ago(2, 'hour')} 用时 6小时 0分钟 0秒`],
      ['succeeded yesterday in 54s', '成功于昨天 用时 54秒']
    ],
    misses: ['succeeded 5 minutes ago', 'succeeded in 1m 41s']
  },
  {
    hits: [
      ['Started 5m ago', '开始于 5分钟前'],
      ['Started 5 minutes ago', `开始于 ${ago(5, 'minute')}`],
      ['Started just now', '开始于刚刚']
    ],
    misses: ['Started 5m']
  },
  {
    hits: [
      ['in 1m 41s', '用时 1分钟 41秒'],
      ['in 54s', '用时 54秒']
    ],
    // in progress 是部署状态的页面词条，不作反例
    misses: ['in sync', 'in 1m 41']
  },
  {
    hits: [
      ['3/5 jobs completed', '已完成 3/5 个作业'],
      ['1 job completed', '已完成 1 个作业']
    ],
    misses: ['jobs completed']
  },
  { hits: [['Matrix: node-version', '矩阵：node-version']], misses: ['Matrix'] },
  {
    hits: [
      ['Latest attempt #2', '最新尝试 #2'],
      ['Attempt #1', '尝试 #1'],
      ['Latest #3', '最新 #3']
    ],
    misses: ['Attempt 1']
  },
  { hits: [['Back to pull request #16026', '返回拉取请求 #16026']], misses: ['Back to pull request'] },
  {
    hits: [
      ['Failed jobs', '失败的作业'],
      ['In progress jobs', '正在进行的作业'],
      ['Pending jobs', '挂起的作业'],
      ['Action required jobs', '需要操作的作业']
    ],
    misses: ['Unknown jobs']
  },
  { hits: [['2 more', '其他 2 个']], misses: ['more'] },
  {
    hits: [
      ['1m 44s', '1分钟 44秒'],
      ['9h 55m 51s', '9小时 55分钟 51秒'],
      ['2m 0s', '2分钟 0秒'],
      ['45s', '45秒'],
      ['1d 2h 3m 4s', '1天 2小时 3分钟 4秒']
    ],
    misses: ['1k', '1m44s']
  },

  // ---------- deployments ----------
  {
    hits: [
      ['300 deployments', '300 个部署'],
      ['1 deployment', '1 个部署'],
      ['1,234 deployments', '1,234 个部署']
    ],
    misses: ['deployments']
  },
  {
    hits: [
      ['via pages-build-deployment #4', '通过 pages-build-deployment #4'],
      // 工作流名是用户内容，其中的 GitHub Pages 原样保留
      ['via 部署文档站到 GitHub Pages #279', '通过 部署文档站到 GitHub Pages #279']
    ],
    misses: ['via pages-build-deployment']
  },
  { hits: [['View deployment to github-pages', '查看 github-pages 的部署']], misses: ['View deployment to'] },
  {
    hits: [
      ['Pin github-pages environment', '置顶 github-pages 环境'],
      ['Unpin production environment', '取消置顶 production 环境']
    ],
    misses: ['Pinned github-pages environment']
  },
  {
    hits: [
      ['Deployment success', '部署成功'],
      ['Deployment in_progress', '部署正在进行'],
      ['Deployment pending', '部署挂起']
    ],
    misses: ['Deployment succeeded']
  },
  {
    hits: [
      ['Status: Deployed (completed).', '状态：已部署（已完成）。'],
      ['Status: Failed to deploy (completed).', '状态：部署失败（已完成）。'],
      ['Status: Deploying (in progress).', '状态：部署中（正在进行）。']
    ],
    misses: ['Status: Unknown (completed).']
  },
  {
    hits: [
      [
        'chore: 升级版本到 1.3.92: Status: Deployed (completed). More information available below.',
        'chore: 升级版本到 1.3.92：状态：已部署（已完成）。更多信息见下方。'
      ],
      [
        'Create CNAME: Status: Failed to deploy (completed). More information available below.',
        'Create CNAME：状态：部署失败（已完成）。更多信息见下方。'
      ],
      ['Status: Deployed (completed). More information available below.', '状态：已部署（已完成）。更多信息见下方。']
    ],
    misses: ['chore: 升级版本到 1.3.92. More information available below.']
  },
  {
    hits: [
      ['Filter contains 2 issues:', '筛选器有 2 处错误：'],
      ['Filter contains 1 issue:', '筛选器有 1 处错误：']
    ],
    misses: ['Filter contains issues:']
  },

  // ---------- manage ----------
  {
    hits: [
      ['12 caches', '12 个缓存'],
      ['1 cache', '1 个缓存'],
      ['1,024 caches', '1,024 个缓存']
    ],
    misses: ['caches']
  },
  { hits: [['3 cache results', '3 个缓存结果']], misses: ['cache results'] },
  { hits: [['3 found.', '找到 3 个。']], misses: ['found.'] },
  {
    hits: [
      ['512 Bytes', '512 字节'],
      ['1 Byte', '1 字节']
    ],
    misses: ['Bytes']
  },
  {
    hits: [
      ['Delete node-cache-Linux-x64 on refs/heads/main', '删除 refs/heads/main 上的缓存 node-cache-Linux-x64'],
      ['Delete setup-go-Linux on refs/pull/12/merge', '删除 refs/pull/12/merge 上的缓存 setup-go-Linux']
    ],
    misses: ['Deleted key on refs/heads/main']
  },
  {
    hits: [
      [
        'Least recently used caches will be automatically evicted to limit the total cache storage to 10 GB.',
        '最久未使用的缓存将被自动清除以将缓存存储总量限制在 10 GB。'
      ]
    ],
    misses: ['Least recently used caches will be automatically evicted.']
  },
  {
    hits: [
      ['3 available runners', '3 个可用运行器'],
      ['1 available runner', '1 个可用运行器']
    ],
    misses: ['available runners']
  },
  {
    hits: [
      ['4-cores · 16 GB RAM · 14 GB SSD Storage', '4 核 · 16 GB 内存 · 14 GB SSD 存储'],
      [
        '64-cores · 256 GB RAM · 2040 GB SSD Storage · Windows, Linux, and Mac',
        '64 核 · 256 GB 内存 · 2040 GB SSD 存储 · Windows、Linux 和 Mac'
      ]
    ],
    misses: ['4-cores · 16 GB RAM']
  },
  {
    hits: [
      ['Copy ubuntu-latest', '复制 ubuntu-latest'],
      ['Copy windows-latest label', '复制 windows-latest 标签']
    ],
    misses: ['Copy ubuntu-22.04']
  },
  { hits: [['Insights: octo-org/hello-world', '洞察：octo-org/hello-world']], misses: ['Insights: octo-org'] },
  { hits: [['Showing data from 2026/10/1 to', '数据时段 2026/10/1 至']], misses: ['Showing data from to'] },
  {
    hits: [
      ['Period: Current month', '时段：本月'],
      ['Period: Last 30 days', '时段：过去 30 天'],
      ['Period: Current week (Mon-Sun)', '时段：本周（周一至周日）']
    ],
    misses: ['Period']
  },
  {
    hits: [
      ['Total minutes across all workflows in this repository for current month', '此存储库所有工作流本月的总分钟数'],
      ['Total job runs across all workflows in this organization for last 30 days', '此组织所有工作流过去 30 天的作业运行总数']
    ],
    misses: ['Total minutes across all workflows']
  },
  {
    hits: [
      ['Average run time of jobs in this repository for current month', '此存储库本月作业的平均运行时间'],
      ['Total minutes used across failed jobs in this repository for last month', '此存储库上个月失败作业使用的总分钟数'],
      ['Failure rate across jobs in this organization for last year', '此组织去年作业的失败率']
    ],
    misses: ['Average run time of jobs']
  },
  {
    hits: [
      ['21 subjects ·', '21 个主体 ·'],
      ['1 subject ·', '1 个主体 ·']
    ],
    misses: ['21 subjects']
  },
  { hits: [['Download attestation #20961960', '下载证明 #20961960']], misses: ['Downloaded attestation #1'] },
  {
    hits: [
      ['gh_2.103.2_linux_386.deb and 20 others', 'gh_2.103.2_linux_386.deb 及另外 20 个'],
      ['app.zip and 1 other', 'app.zip 及另外 1 个']
    ],
    misses: ['Update foo and 2 others']
  },
  {
    hits: [
      [
        'gh_2.103.2_linux_386.deb and 20 others. deployment.yml@refs/heads/trunk. More information available below.',
        'gh_2.103.2_linux_386.deb 及另外 20 个。deployment.yml@refs/heads/trunk。更多信息见下方。'
      ],
      [
        'app.zip. release.yml@refs/tags/v1.0.0. More information available below.',
        'app.zip。release.yml@refs/tags/v1.0.0。更多信息见下方。'
      ]
    ],
    misses: ['Release notes. v1.0. More information available below.']
  },
  {
    hits: [
      ['Commit. 4f2cfe92e3499f8581bf39db77e0a1431fa7b55c.', '提交。4f2cfe92e3499f8581bf39db77e0a1431fa7b55c。'],
      // 日期按通则译出，括号内的完整时间戳保留原文
      ['Created. Oct 23 (Fri, 23 Oct 2026 20:22:17 GMT).', `创建时间。${formatDate(undefined, 10, 23)} (Fri, 23 Oct 2026 20:22:17 GMT)。`],
      ['Created. 3 days ago.', `创建时间。${ago(3, 'day')}。`],
      [
        'Workflow File. .github/workflows/deployment.yml@refs/heads/trunk.',
        '工作流文件。.github/workflows/deployment.yml@refs/heads/trunk。'
      ],
      ['Build Summary. /octo-org/hello-world/actions/runs/1/attempts/1.', '构建摘要。/octo-org/hello-world/actions/runs/1/attempts/1。']
    ],
    misses: ['Commit 4f2cfe9.']
  },

  // ---------- new ----------
  {
    hits: [
      ['Found 3 workflows', '找到 3 个工作流'],
      ['Found 1 workflow', '找到 1 个工作流']
    ],
    misses: ['Found workflows']
  },
  {
    hits: [
      ['By GitHub Actions', '来自 GitHub 操作'],
      ['By Microsoft Azure', '来自 Microsoft Azure'],
      ['By constructor', '来自 constructor']
    ],
    misses: ['Bypass rules']
  },

  // ---------- workflows ----------
  {
    hits: [
      [
        'completed successfully: Run 27404 of ci. perf(compiler-vapor): misc transform and codegen allocation trims (#1…',
        '成功完成：ci 第 27404 次运行。perf(compiler-vapor): misc transform and codegen allocation trims (#1…'
      ],
      ['skipped: Run 13034 of size report.', '已跳过：size report 第 13034 次运行。'],
      ['completed successfully: Run 12048 of autofix.ci. perf: trims', '成功完成：autofix.ci 第 12048 次运行。perf: trims'],
      [
        'requires action with the application: Run 27385 of ci. fix(reactivity): release computeds',
        '需要操作：ci 第 27385 次运行。fix(reactivity): release computeds'
      ],
      ['marked stale by GitHub because it took too long: Run 9 of ci.', '因耗时过长已被 GitHub 标记为过时：ci 第 9 次运行。']
    ],
    misses: ['completed successfully: Run of ci.', 'succeeded: Run 1 of ci.']
  },
  {
    hits: [
      ['More actions for workflow run 27404', '工作流运行 27404 的更多操作'],
      ['actions for workflow run 303', '工作流运行 303 的操作']
    ],
    misses: ['More actions for workflow run']
  },
  { hits: [['View pull request #16026', '查看拉取请求 #16026']], misses: ['View pull request'] },
  { hits: [['#16026 (comment)', '#16026（评论）']], misses: ['16026 (comment)'] },
  {
    hits: [
      ['2500+ workflow runs', '2500+ 个工作流运行'],
      ['1 workflow run', '1 个工作流运行'],
      ['37 workflow run results', '37 个工作流运行结果'],
      ['1 workflow run result', '1 个工作流运行结果']
    ],
    misses: ['workflow runs']
  },
  {
    hits: [
      ['25 workflow runs loaded', '已加载 25 个工作流运行'],
      ['1 workflow run loaded', '已加载 1 个工作流运行']
    ],
    misses: ['workflow runs loaded']
  },
  {
    hits: [
      ['Workflow runs for ci', 'ci 的工作流运行'],
      ['Workflow runs for ci results', 'ci 的工作流运行结果'],
      ['Workflow runs for size report', 'size report 的工作流运行']
    ],
    misses: ['Workflow runs for']
  },
  {
    hits: [
      ['12 workflows shown', '显示 12 个工作流'],
      ['1 workflow shown', '显示 1 个工作流']
    ],
    misses: ['workflows shown']
  },
  {
    hits: [
      ['Auto-refresh: 30s', '自动刷新：30秒'],
      ['Auto-refresh: 1m', '自动刷新：1分钟'],
      ['Auto-refresh: Off', '自动刷新：关闭']
    ],
    misses: ['Auto-refresh:']
  },
  {
    hits: [['1m 44s. Show run duration details', '1分钟 44秒。显示运行时长详细信息']],
    misses: ['Show run duration details']
  },
  {
    hits: [
      [
        'This workflow run has been marked as disruptive. Workflow run ID 40257241541.',
        '此工作流运行已被标记为破坏性运行。工作流运行 ID 40257241541。'
      ]
    ],
    misses: ['This workflow run has been marked as disruptive.']
  },
  {
    hits: [
      ['2 pull requests may be affected.', '可能影响 2 个拉取请求。'],
      ['1 pull request may be affected.', '可能影响 1 个拉取请求。']
    ],
    misses: ['pull requests may be affected.']
  },
  {
    hits: [
      ['Unable to load workflow filters', '无法加载工作流筛选器'],
      ['Unable to load event filters.', '无法加载事件筛选器。'],
      ['Unable to load actor filters. Try again.', '无法加载参与者筛选器。请重试。']
    ],
    misses: ['Unable to load label filters']
  },
  {
    hits: [['foo will be ignored since log searching is not yet available', '因暂不支持日志搜索而忽略 foo']],
    misses: ['will be ignored since log searching is not yet available']
  },
  {
    hits: [
      ['ci, Excluded', 'ci，已排除'],
      ['push, Excluded', 'push，已排除']
    ],
    misses: ['ci, excluded']
  },
  {
    hits: [
      ['Deployment, Workflow', 'Deployment，工作流'],
      ['issue_comment, Event', 'issue_comment，事件'],
      ['Action required, Status', '需要操作，状态'],
      ['Pending, Status', '挂起，状态'],
      ['trunk (default), Branch', 'trunk（默认），分支'],
      ['octocat, The Octocat, Actor', 'octocat, The Octocat，参与者']
    ],
    misses: ['Deployment, workflow']
  },
  {
    hits: [
      ['Exclude workflow', '排除工作流'],
      ['Exclude is', '排除状态'],
      ['Exclude branch', '排除分支'],
      ['Exclude key', '排除键']
    ],
    misses: ['Exclude label']
  },
  {
    hits: [
      [
        "This scheduled workflow is disabled because there hasn't been activity in this repository for at least 60 days. Enable this workflow to resume scheduled runs.",
        '此计划工作流因存储库已至少 60 天没有活动而被禁用。启用此工作流以恢复计划运行。'
      ],
      [
        'This scheduled workflow is disabled because there hasn’t been activity in this repository for at least 60 days.',
        '此计划工作流因存储库已至少 60 天没有活动而被禁用。'
      ]
    ],
    misses: ['This scheduled workflow is disabled.']
  },
  {
    hits: [
      ['Workflow ci pinned.', '工作流 ci 已置顶。'],
      ['Workflow size report unpinned.', '工作流 size report 已取消置顶。']
    ],
    misses: ['Workflow pinned.']
  },
  {
    hits: [
      ['Up next:', '下一步：'],
      ['Up next: Create a repository', '下一步：Create a repository'],
      ['Up next: Run a continuous integration test', '下一步：运行持续集成测试'],
      ['Up next: Invite your first member', '下一步：邀请第一个成员'],
      ["Up next: Customize members' permissions", '下一步：自定义成员权限']
    ],
    misses: ['Up next']
  },
  { hits: [['Use workflow from: main', '工作流来源：main']], misses: ['Use workflow from:'] },
  {
    hits: [
      ['Branch: main', '分支：main'],
      ['Tag: v1.0.0', '标签：v1.0.0']
    ],
    // 单独的 Branch: 由页面词条翻译（前缀与分支名拆开时），不作反例
    misses: ['Branches: main']
  },
  { hits: [['main (default)', 'main（默认）']], misses: ['main(default)'] },
  {
    hits: [
      ['Pin ci', '置顶 ci'],
      ['Unpin size report', '取消置顶 size report']
    ],
    misses: ['Pins ci']
  },
  {
    hits: [
      ['Download size-data', '下载 size-data'],
      ['Download gh_2.103.2_linux_386.deb (opens in a new tab)', '下载 gh_2.103.2_linux_386.deb']
    ],
    misses: ['Downloads']
  },
  { hits: [['Delete size-data', '删除 size-data']], misses: ['Deleted'] }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('actions 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('具体规则先于宽泛规则', () => {
    expect(translate('Delete cache-key on refs/heads/main')).toBe('删除 refs/heads/main 上的缓存 cache-key')
    expect(translate('Pin github-pages environment')).toBe('置顶 github-pages 环境')
    expect(translate('Download attestation #1')).toBe('下载证明 #1')
  })

  it('静态词条优先于宽泛正则', () => {
    expect(translate('Delete workflow run')).toBe('删除工作流运行')
    expect(translate('Delete all logs')).toBe('删除所有日志')
    expect(translate('Download log archive')).toBe('下载日志存档')
    expect(translate('Pin workflow')).toBe('置顶工作流')
    expect(translate('Run workflow')).toBe('运行工作流')
  })
})

describe('actions 静态词条', () => {
  it.each([
    // 侧栏与运行列表
    ['Show more workflows...', '显示更多工作流...'],
    ['Show more workflows…', '显示更多工作流…'],
    ['Actions workflows', '操作工作流'],
    ['Actions management', '操作管理'],
    ['Usage metrics', '使用情况指标'],
    ['Performance metrics', '性能指标'],
    ['Attestations', '证明'],
    ['Lockfile', '锁定文件'],
    ['Filter workflows...', '筛选工作流...'],
    ['Filter workflows…', '筛选工作流…'],
    ['Loading workflows...', '正在加载工作流...'],
    ['Name (A–Z)', '名称 (A–Z)'],
    ['Last run (Newest first)', '最近运行（最新优先）'],
    ['Showing runs from all workflows', '显示所有工作流的运行'],
    ['Filter workflow runs', '筛选工作流运行'],
    ['Search runs', '搜索运行'],
    ['Workflows', '工作流'],
    ['Workflow runs', '工作流运行'],
    ['Every 10 seconds', '每 10 秒'],
    ['Refresh now', '立即刷新'],
    ['completed successfully:', '成功完成：'],
    ['requires action with the application:', '需要操作：'],
    ['cancelled:', '已取消：'],
    ['Cancel run', '取消运行'],
    ['View workflow file', '查看工作流文件'],
    ['Are you sure you want to permanently delete this workflow run?', '确定要永久删除此工作流运行吗？'],
    ['Filter by Actor', '按参与者筛选'],
    ['Filter actor options', '筛选参与者选项'],
    ['Find a user', '查找用户'],
    ['Create status badge', '创建状态徽章'],
    ['Disable workflow', '禁用工作流'],
    ['Enable workflow', '启用工作流'],
    ['This workflow has a workflow_dispatch event trigger.', '此工作流有 workflow_dispatch 事件触发器。'],
    ['Use workflow from', '工作流来源'],
    ['Workflow does not exist or does not have a', '工作流不存在或此引用中没有'],
    ['trigger in this branch.', '触发器。'],
    ['trigger in this tag.', '触发器。'],
    ["Workflows aren't being run on this forked repository", '此复刻存储库中的工作流未运行'],
    ['Workflows aren’t being run on this forked repository', '此复刻存储库中的工作流未运行'],
    ['Learn more about GitHub Actions', '了解 GitHub 操作'],
    // 产品名译中文：Actions → 操作，Codespaces → 代码空间
    ['Enable Actions on this repository', '在此存储库启用操作'],
    ['GitHub Actions is currently disabled for this workflow.', '此工作流当前已禁用 GitHub 操作。'],
    ['Codespaces Prebuilds', '代码空间预生成'],
    ['prebuilding your codespaces.', '如何预生成代码空间。'],
    ['Could not load workflows. Try again.', '无法加载工作流。请重试。'],
    ['or try different filters.', '或尝试其他筛选器。'],
    ['Filter menus are not available for complex queries.', '复杂查询不支持筛选器菜单。'],
    ['Adding this filter would make your query too long. Use the filter input instead.', '添加此筛选器会使查询过长。请改用筛选器输入框。'],
    ['The following pull requests may not be able to be merged if this run is deleted:', '以下拉取请求可能在删除此运行后无法合并：'],
    [
      'This scheduled workflow is disabled because scheduled workflows are disabled by default in forks.',
      '此计划工作流因复刻中默认禁用计划工作流而被禁用。'
    ],
    ['Workflow, Filter, Filter by workflow', '工作流，筛选器，按工作流筛选'],
    ['Actor, Filter, Filter by the actor who triggered a workflow run', '参与者，筛选器，按触发工作流运行的参与者筛选'],
    ['Key, Filter, Filter by cache key', '键，筛选器，按缓存键筛选'],
    ['The billing plan for', '帐户'],
    [
      'GitHub Actions is not available for private repositories on legacy per-repository billing plans. Please visit your billing settings to upgrade your account.',
      '旧版按存储库计费计划下的专用存储库无法使用 GitHub 操作。请前往计费设置升级帐户。'
    ],
    [
      'does not include access to GitHub Actions. Please contact the organization owner or billing manager for questions about the current billing plan',
      '的计费计划不包含 GitHub 操作的访问权限。请联系组织所有者或账单管理员咨询当前计费计划'
    ],
    ['GitHub Actions usage limit', 'GitHub 操作使用限制'],
    ['Upcoming change to GitHub App installation token format', 'GitHub 应用安装令牌格式即将变更'],
    ['Run a continuous integration test', '运行持续集成测试'],
    // 组织概述的入门任务名（服务端数据，与 Up next 共用）
    ['Invite your first member', '邀请第一个成员'],
    ["Customize members' permissions", '自定义成员权限'],
    ['Customize members’ permissions', '自定义成员权限'],
    ['Create a pull request', '创建拉取请求'],
    ['Create a branch protection rule', '创建分支保护规则'],
    ['Auto-assign new issues', '自动分配新议题'],
    [
      'workflow, which allows developers to continuously integrate new code while automatically checking for invalid HTML.',
      '工作流，可让开发人员在持续集成新代码时自动检查无效的 HTML。'
    ],
    // 运行详情
    ['Workflow run summary', '工作流运行摘要'],
    ['All jobs', '所有作业'],
    ['Run details', '运行详细信息'],
    ['Workflow file', '工作流文件'],
    ['Agentic Workflow file', '智能体工作流文件'],
    ['Re-run all jobs', '重新运行所有作业'],
    ['Re-run failed jobs', '重新运行失败的作业'],
    ['Re-running...', '重新运行中...'],
    ['Re-running…', '重新运行中…'],
    ['Re-running jobs...', '正在重新运行作业...'],
    ['Re-running jobs…', '正在重新运行作业…'],
    ['A new attempt of this workflow will be started, including', '将启动此工作流的新尝试，包括'],
    ['and dependents:', '及其下游作业：'],
    ['Total duration', '总时长'],
    ['Billable time', '计费时间'],
    ['Produced during runtime', '运行期间生成'],
    ['Copy artifact digest', '复制产物摘要'],
    ['This run and associated checks have been archived and are scheduled for deletion.', '此运行及相关检查已存档并计划删除。'],
    ['Oh hello! Nice to see you.', '你好呀！很高兴见到你。'],
    ['This workflow is', '此工作流正在'],
    ['awaiting approval', '等待维护者批准'],
    ['This job was skipped', '此作业已跳过'],
    ['Set up job', '设置作业'],
    ['Complete job', '完成作业'],
    ['This step passed', '此步骤已通过'],
    ['Parallel group', '并行组'],
    ['No steps available yet.', '暂无步骤。'],
    ['Waiting for pending jobs', '正在等待挂起的作业'],
    ['The log was not found. It may have been deleted based on retention settings.', '未找到日志。可能已按保留设置删除。'],
    ['This step has been truncated due to its large size. View the raw logs from the', '此步骤因过大已被截断。工作流运行完成后可从'],
    ['menu once the workflow run has completed.', '菜单查看原始日志。'],
    ['Search logs', '搜索日志'],
    ['Show full screen (Shift+F)', '全屏显示 (Shift+F)'],
    ['Download log archive', '下载日志存档'],
    ['View raw logs', '查看原始日志'],
    ['Try broadening your search filters.', '尝试放宽搜索筛选器。'],
    [
      "The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings",
      '作业因最近的帐户付款失败或支出限额需要提高而未启动。请检查设置中的“计费和计划”部分'
    ],
    ['Learn about OS pricing on GitHub Actions', '了解 GitHub 操作的操作系统定价'],
    ['Workflow file for this run', '此运行的工作流文件'],
    ['No lockfile was found for this workflow run. Lock your workflow dependencies by running', '此工作流运行没有锁定文件。在存储库中运行'],
    // 管理
    ['Caches', '缓存'],
    ['Showing caches from all workflows.', '显示所有工作流的缓存。'],
    ['Remove the filters', '删除筛选器'],
    ['Remove cache', '移除缓存'],
    ['Deleting cache...', '正在删除缓存...'],
    ['Learn more about cache usage.', '了解缓存使用情况。'],
    ['Approaching total cache storage limit', '即将达到缓存存储总上限'],
    ['Cache not found', '未找到缓存'],
    ['Runners', '运行器'],
    ['Self-hosted runners', '自托管运行器'],
    [
      'Self-hosted runners are virtual machines for GitHub Actions workflows that you manage and maintain outside of GitHub.',
      '自托管运行器是用于 GitHub 操作工作流并由你在 GitHub 之外管理和维护的虚拟机。'
    ],
    [
      'Filter menus are unavailable because this query is too long. Shorten it in the filter input.',
      '筛选器菜单因查询过长而不可用。请在筛选器输入框中缩短查询。'
    ],
    ['Metrics navigation', '指标导航'],
    ['Custom date range (UTC)', '自定义日期范围 (UTC)'],
    ['Failed job usage', '失败作业使用量'],
    ['Avg job queue time', '平均作业排队时间'],
    ['No table data available yet.', '暂无表格数据。'],
    ['Create attestations using the', '使用'],
    ['Attestation summary', '证明摘要'],
    ['Build Config Digest', '构建配置摘要'],
    // 部署
    ['All deployments', '全部部署'],
    ['Active deployments', '活跃部署'],
    ['Latest deployments from pinned environments', '置顶环境的最新部署'],
    ['Filter environments...', '筛选环境...'],
    ['Filter environments…', '筛选环境…'],
    ['Deployed to', '已部署到'],
    ['Failed to deploy to', '未能部署到'],
    ['More list item action bar', '更多操作'],
    ['Text will be ignored since log searching is not yet available:', '因暂不支持日志搜索而忽略以下文本：'],
    // 新建工作流
    ['Get started with GitHub Actions', '开始使用 GitHub 操作'],
    ['Skip this and', '跳过此步骤并'],
    ['set up a workflow yourself', '自行设置工作流'],
    ['Set up a workflow yourself', '自行设置工作流'],
    ['Suggested for this repository', '为此存储库推荐'],
    ['Browse all categories', '浏览所有类别'],
    ['Build and test a Node.js project with npm.', '使用 npm 构建并测试 Node.js 项目。'],
    ['Build a Docker image to deploy, run, or push to a registry.', '构建 Docker 映像以部署、运行或推送到注册表。'],
    ['Labels pull requests based on the files changed', '根据已更改的文件为拉取请求添加标签'],
    ['Deploy a container to Alibaba Cloud Container Service for Kubernetes (ACK).', '将容器部署到阿里云容器服务 Kubernetes 版 (ACK)。'],
    ['Matrix builds', '矩阵构建'],
    [
      'PMD is a static source code analyzer. It supports Java, JavaScript, Apex and Visualforce, Modelica, PLSQL, Apache Velocity, XML, XSL, Scala.',
      'PMD 是静态源代码分析器。支持 Java、JavaScript、Apex 和 Visualforce、Modelica、PLSQL、Apache Velocity、XML、XSL、Scala。'
    ],
    [
      'Static analysis of code for vulnerability detection, covering 26+ languages. Start cleaning your code in minutes!',
      '通过静态代码分析检测漏洞，覆盖 26 种以上语言。几分钟内即可开始清理代码！'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('\n    Total duration\n  ', [...SCOPE])).toBe('\n    总时长\n  ')
  })
})

describe('actions 页面词条', () => {
  it.each([
    ['Summary', '摘要'],
    ['Usage', '使用情况'],
    ['Jobs', '作业'],
    ['Annotations', '注释'],
    ['Artifacts', '产物'],
    ['Digest', '摘要'],
    ['Event', '事件'],
    ['Actor', '参与者'],
    ['Workflow', '工作流'],
    ['Successful', '成功'],
    ['Failure', '失败'],
    ['Cancelled', '已取消'],
    ['In progress', '正在进行'],
    ['Pending', '挂起'],
    ['Action required', '需要操作'],
    ['Startup failure', '启动失败'],
    ['succeeded', '成功于'],
    ['approved', '批准于'],
    ['Deployment protection rules', '部署保护规则'],
    ['skipped', '已跳过'],
    ['timed out', '已超时'],
    ['by', '由'],
    ['pushed', '推送'],
    ['opened', '创建'],
    ['synchronize', '同步'],
    ['commented on', '评论了'],
    ['unlabeled', '删除标签'],
    ['prereleased', '预发行'],
    ['dismissed', '消除'],
    ['ready for review', '标记为可供审查'],
    ['Issue comment', '议题评论'],
    ['Scheduled', '计划运行'],
    ['Manually run by', '手动运行者'],
    ['Off', '关闭'],
    ['See details', '查看详细信息'],
    ['This action cannot be undone', '此操作无法撤销'],
    // 工作流不存在页的标题；手动运行对话框引用选择器按钮的前缀与分支名拆开时
    ['Not found', '未找到'],
    ['Branch:', '分支：'],
    ['cached', '缓存于'],
    ['deployed by', '部署者'],
    ['Last used', '最后使用于'],
    ['Recently used', '最近使用'],
    // 指标表格中不足 1 秒的时长（其余时长由正则译出，同限 actions）
    ['<1s', '<1 秒'],
    ['Standard GitHub-hosted runners', '标准 GitHub 托管的运行器'],
    ['Ready-to-use runners managed by GitHub.', '由 GitHub 管理的开箱即用运行器。'],
    ['Runners are the machines that execute GitHub Actions workflows.', '运行器是执行 GitHub 操作工作流的机器。'],
    ['Subject', '主体'],
    ['Issuer', '颁发者'],
    [', descending', '，降序'],
    ['action', '操作创建证明'],
    ['is one of', '是以下之一'],
    ['Signed-in user', '已登录用户'],
    ['in_progress', '正在进行'],
    ['in progress', '正在进行'],
    ['Categories', '类别'],
    // 新建工作流页的模板类别名与类别标题
    ['Deployment', '部署'],
    ['Automation', '自动化'],
    ['Code scanning', '代码扫描'],
    ['Pages', '页面'],
    ['deployment workflows', '部署工作流'],
    ['Pages workflows', '页面工作流'],
    ['to your workflow file.', '即可在工作流中测试 Web 服务及其数据库。'],
    ['Project management', '项目管理']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('运行描述按片段翻译', () => {
    // <span>Commit</span> <a>de7a4dc</a> <span>pushed</span> <span>by</span> <a>octocat</a>
    expect(['pushed', 'by'].map(translate)).toEqual(['推送', '由'])
    // <span>Pull request</span><a>#16026</a><span>opened</span><span>by</span><a>octocat</a>（拉取请求动词 open → 创建）
    expect(['opened', 'by'].map(translate)).toEqual(['创建', '由'])
    // 作业标题：succeeded <relative-time> in 1m 41s
    expect(['succeeded', 'in 1m 41s'].map(translate)).toEqual(['成功于', '用时 1分钟 41秒'])
    // 等待批准：This workflow is <strong>awaiting approval</strong> from a maintainer in <a>#123</a>
    expect(['This workflow is', 'awaiting approval', 'from a maintainer in'].map(translate)).toEqual([
      '此工作流正在',
      '等待维护者批准',
      '于拉取请求'
    ])
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Summary', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('pushed', ['common', 'repository', 'commits'])).toBeUndefined()
    expect(matcher.translate('1m 44s', ['common', 'repository', 'issues'])).toBeUndefined()
    expect(matcher.translate('Triggered via push', ['common', 'repository', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Pin ci', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Not found', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Branch:', ['common', 'repository', 'commits'])).toBeUndefined()
    // 组织洞察的指标页（organization）没有时长规则，<1s 与 45s 一样保留原文
    expect(matcher.translate('<1s', ['common', 'organization'])).toBeUndefined()
  })
})

describe('actions 繁体词条（zh-TW）', () => {
  const twDict: PageDictionary = actionsTW
  const twMatcher = createMatcher([['actions', actionsTW]])

  it.each([
    ['Find a user', '尋找使用者'],
    ['Cache not found', '找不到快取'],
    // 组织概述的入门任务名
    ['Invite your first member', '邀請第一位成員'],
    ["Customize members' permissions", '自訂成員權限'],
    ['Create a pull request', '建立拉取請求'],
    ['Create a branch protection rule', '建立分支保護規則'],
    ['Auto-assign new issues', '自動指派新議題']
  ])('静态：%s → %s', (input, expected) => {
    expect(twDict.static?.[input]).toBe(expected)
    expect(twMatcher.translate(input, [...SCOPE])).toBe(expected)
  })

  it('入门引导：Up next 后接任务名', () => {
    expect(twMatcher.translate('Up next: Invite your first member', [...SCOPE])).toBe('下一步：邀請第一位成員')
  })

  it.each([
    ['Not found', '找不到'],
    ['Branch:', '分支：'],
    ['<1s', '<1 秒'],
    ['in progress', '進行中']
  ])('页面：%s → %s', (input, expected) => {
    expect(twDict.scoped?.[input]).toBe(expected)
    expect(twMatcher.translate(input, [...SCOPE])).toBe(expected)
  })

  it('页面词条不在其他页面生效', () => {
    expect(twMatcher.translate('Not found', ['common', 'repository'])).toBeUndefined()
    expect(twMatcher.translate('<1s', ['common', 'organization'])).toBeUndefined()
  })

  it('运行器页自托管标签页：运行器标签被忽略，self-hosted 不作页面词条', () => {
    document.body.innerHTML = runnerListHtml()
    const selector = (twDict.ignore ?? []).join(', ')
    const labels = [...document.querySelectorAll('[data-component="Label"]')].map(node => [
      node.textContent,
      node.closest(selector) !== null
    ])
    expect(labels).toEqual([
      ['octo-org', false],
      ['self-hosted', true],
      ['Linux', true],
      ['X64', true],
      ['Deploy', true],
      ['Unprovisioned', false]
    ])
    expect(twMatcher.translate('self-hosted', [...SCOPE])).toBeUndefined()
  })
})

describe('actions 格式工具', () => {
  it.each([
    ['45s', '45秒'],
    ['1m 44s', '1分钟 44秒'],
    ['2m 0s', '2分钟 0秒'],
    ['6h0m0s', '6小时 0分钟 0秒'],
    ['1d 2h 3m 4s', '1天 2小时 3分钟 4秒']
  ])('时长 %s → %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected)
  })

  it('部署状态：未知取值保留原文，进度为英文时用半角括号', () => {
    expect(deploymentStatus('Deployed', 'completed')).toBe('状态：已部署（已完成）')
    expect(deploymentStatus('Deployed', 'done')).toBe('状态：已部署 (done)')
    expect(deploymentStatus('Rolled back', 'done')).toBe('状态：Rolled back (done)')
    expect(deploymentStatus('Rolled back', 'pending')).toBe('状态：Rolled back（挂起）')
  })
})

describe('actions 标点随原文', () => {
  /** [名称, 译文中的标点, 原文中对应的标点]：同一句中译文的个数不得多于原文（只查个数，原文有一处不等于译文可加两处） */
  const PUNCTUATION: readonly (readonly [string, RegExp, RegExp])[] = [
    ['逗号', /[，、]/g, /,/g],
    ['冒号', /：/g, /:/g],
    ['分号', /；/g, /;/g],
    ['引号', /“/g, /["'“‘]/g],
    ['括号', /[（(]/g, /\(/g]
  ]
  const splitSource = (text: string): string[] => text.split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
  const splitTranslation = (text: string): string[] => text.split(/(?<=[。！？])(?=.)/)
  const countOf = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0

  /** 句数相同时逐句比较，否则整段比较；返回译文多出的标点 */
  function extraPunctuation(source: string, translation: string): string[] {
    const sources = splitSource(source)
    const translations = splitTranslation(translation)
    const pairs =
      sources.length === translations.length
        ? sources.map((sentence, index) => [sentence, translations[index] ?? ''] as const)
        : [[source, translation] as const]
    return pairs.flatMap(([sentence, translated]) =>
      PUNCTUATION.filter(([, mark, pattern]) => countOf(translated, mark) > countOf(sentence, pattern)).map(
        ([name]) => `${name} ${sentence} → ${translated}`
      )
    )
  }

  it('守护自身：多出的逗号、句间合并的逗号会被查出', () => {
    expect(extraPunctuation('A, which runs while B.', '甲，运行，同时乙。')).toHaveLength(1)
    expect(extraPunctuation('A is a tool. It supports B, C.', '甲是工具，支持乙、丙。')).toHaveLength(1)
    expect(extraPunctuation('A is a tool. It supports B, C.', '甲是工具。支持乙、丙。')).toEqual([])
  })

  it('静态与页面词条不加原文没有的逗号、顿号、冒号、分号、引号、括号', () => {
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    expect(entries.flatMap(([source, translation]) => extraPunctuation(source, translation))).toEqual([])
  })

  it('正则译文同样不加', () => {
    expect(HITS.flatMap(([source, translation]) => extraPunctuation(source, translation))).toEqual([])
  })
})

/**
 * 运行器页（RunnerListItem）：自托管标签页的条目标题后先是来源标签（accent），再是各运行器标签（runner.labels）；
 * 托管标签页的更大运行器条目带状态标签
 */
function runnerListHtml(): string {
  const label = (text: string, variant = 'default'): string =>
    `<span class="prc-Label-Label-qG-Zu" data-size="small" data-variant="${variant}" data-component="Label">${text}</span>`
  return `
    <div class="SelfHostedRunners__99q0Vk"><ul aria-label="Repository self-hosted runner list"><li>
      <div class="ListItemTitle_0__PYp9aW" data-listview-item-title-container="true">
        <h3 class="ListItemTitle_1__iy5932"><span>build-01</span></h3>
        ${label('octo-org', 'accent')}${['self-hosted', 'Linux', 'X64', 'Deploy'].map(text => label(text)).join('')}
      </div>
    </li></ul></div>
    <ul aria-label="GitHub-hosted runners list"><li>
      <div class="ListItemTitle_0__5yawh2" data-listview-item-title-container="true">
        <h3><span>Larger GitHub-hosted runners</span></h3>
        ${label('Unprovisioned')}
      </div>
    </li></ul>`
}

describe('actions 忽略选择器', () => {
  const ignoreSelector = (dict.ignore ?? []).join(', ')
  /** 文本所在的最内层元素是否位于忽略区域 */
  const ignored = (text: string): boolean => {
    const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
    if (!element) throw new Error(`找不到元素：${text}`)
    return Boolean(element.closest(ignoreSelector))
  }

  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('选择器只对 actions 页面类型生效', () => {
    expect(matcher.ignoreSelectors(SCOPE)).toEqual(dict.ignore ?? [])
    expect(matcher.ignoreSelectors(['common', 'repository', 'issues'])).toEqual([])
  })

  it('选择器都能建索引，不需要逐元素检查', () => {
    const index = compileIgnoreIndex(dict.ignore ?? [], document.createElement('div'))
    expect(index.invalid).toEqual([])
    expect(index.universal).toEqual([])
  })

  it('用户内容被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <nav>
        <ul>
          <li><a data-component="NavList.Item" href="/o/r/actions"><span><span data-component="ActionList.Item.Label">All workflows</span></span></a></li>
          <li><a data-component="NavList.Item" href="/o/r/actions/workflows/release.yml"><span><span data-component="ActionList.Item.Label">Release</span></span></a></li>
        </ul>
      </nav>
      <div data-component="PageHeader">
        <div data-component="TitleArea"><h1 data-component="PH_Title">Deploy</h1></div>
        <div data-component="PageHeader.Description"><a href="/o/r/blob/main/.github/workflows/deploy.yml">deploy.yml</a></div>
      </div>
      <div data-component="PageHeader">
        <div data-component="TitleArea"><h1 data-component="PH_Title">Caches</h1></div>
        <div data-component="PageHeader.Description"><span>Showing caches from all workflows.</span></div>
      </div>
      <ul>
        <li data-has-subitem="true">
          <button data-component="NavList.Item"><span><span data-component="ActionList.Item.Label">build-matrix</span></span></button>
          <ul><li><a data-component="NavList.Item" href="/o/r/actions/runs/1/job/2"><span>linux-job</span></a></li></ul>
        </li>
        <li><a data-component="NavList.Item" href="/o/r/actions/runs/1/usage"><span data-component="ActionList.Item.Label">Usage</span></a></li>
      </ul>
      <check-step data-name="Set up job"><span class="CheckStep-titleName">Set up job</span></check-step>
      <check-step data-name="Setup Vite+"><span class="CheckStep-titleName">Setup Vite+</span></check-step>
      <check-step data-name="Run actions/checkout@v4"><span class="CheckStep-titleName">Run actions/checkout@v4</span></check-step>
      <check-step data-name="Post Run actions/checkout@v4"><span class="CheckStep-titleName">Post Run actions/checkout@v4</span></check-step>
      <check-step data-name="Post Setup Vite+"><span class="CheckStep-titleName">Post Setup Vite+</span></check-step>
      <check-step data-name="Run workflow"><span class="CheckStep-titleName">Run workflow</span></check-step>
      <check-step data-name="Run ./.github/actions/setup"><span class="CheckStep-titleName">Run ./.github/actions/setup</span></check-step>
      <check-step data-name="Complete job"><span class="CheckStep-titleName">Complete job</span></check-step>
      <check-step data-name="Parallel group" data-parallel-group-header>
        <span class="CheckStep-titleName">Parallel group</span><span class="CheckStep-titleSummary">· 3 steps</span>
      </check-step>
      <check-step data-name="Wait for build" data-step-type="wait">
        <span class="CheckStep-titleName">Wait for build</span><span class="CheckStep-titleSummary">Deploy docs</span>
        <div class="CheckStep-inlineDetailsItem">
          <span class="CheckStep-inlineDetailsName">Deploy site</span><span class="CheckStep-inlineDetailsStatus">skipped</span>
        </div>
      </check-step>
      <div class="PageHeader-navigation">
        <button><h2><span class="Truncate-text"><div>
          <span class="css-truncate workflow-path-first-item" data-target="streaming-graph-job.name">test&nbsp;</span><span>/</span><span class="css-truncate">&nbsp;e2e-test</span>
        </div></span></h2></button>
        <dialog><h1 class="Overlay-title sr-only">fix: Release notes</h1></dialog>
      </div>
      <div class="PageHeader-navigation">
        <button><h2><span class="css-truncate" data-target="streaming-graph-job.name"> size-report </span></h2></button>
      </div>
      <ul role="listbox" aria-label="Suggestions">
        <li role="option" aria-label="Workflow, Filter, Filter by workflow"><span class="displayName__vz3s9U normalText__haV_1j">Workflow</span></li>
        <li role="option" aria-label="Deployment, Workflow"><span class="displayName__vz3s9U normalText__haV_1j">Deployment</span></li>
        <li role="option" aria-label="fork，事件"><span class="displayName__vz3s9U normalText__haV_1j">fork</span></li>
        <li role="option" aria-label="octocat, The Octocat, Actor">
          <span class="displayName__vz3s9U boldText__B3XpAY">octocat</span>
          <div data-component="ActionList.Description" class="ActionList_Description__UqFMNI">The Octocat</div>
        </li>
        <li role="option" aria-label="Cancelled, Status"><span class="displayName__vz3s9U normalText__haV_1j">Cancelled</span></li>
        <li role="option" aria-label="octo-org，参与者"><span class="displayName__vz3s9U normalText__haV_1j">octo-org</span></li>
      </ul>
      <div data-component="SelectPanel">
        <input aria-label="筛选事件选项">
        <ul role="listbox"><li role="option" data-id="label"><span data-component="ActionList.Item.Label">label</span></li></ul>
      </div>
      <div data-component="SelectPanel">
        <input aria-label="筛选参与者选项">
        <ul role="listbox"><li role="option" data-id="hello-world"><span data-component="ActionList.Item.Label">hello-world</span></li></ul>
      </div>
      <div data-component="SelectPanel">
        <input aria-label="Filter status options">
        <ul role="listbox"><li role="option" data-id="timed_out"><span data-component="ActionList.Item.Label">Timed out</span></li></ul>
      </div>
      <div class="js-artifact-files"><ul class="js-artifact-files-list">
        <li class="d-flex"><span class="flex-auto min-width-0 text-small">docs/Release</span><span class="ml-2 text-small">0 Bytes</span></li>
      </ul></div>
      <div class="js-check-step-line CheckStep-line">
        <a class="CheckStep-line-number">1</a>
        <span class="CheckStep-line-timestamp">2026-10-26T02:04:01.1234567Z</span>
        <span class="CheckStep-line-content js-check-line-content">Run tests: Success</span>
      </div>
      <span class="CheckRun-log-title">
        <h4><span class="css-truncate">matrix-group</span><span>/</span><span class="css-truncate">unit-job</span></h4>
        <a id="check-step-header-title"><span class="two-line-wrapping">group / unit-job</span></a>
        <span class="d-block f6">succeeded</span>
      </span>
      <annotation-message>
        <div>
          <a href="#annotation:8:187"><strong>Run e2e tests</strong></a>
          <div class="color-fg-muted"><div>Process completed with exit code 1.</div></div>
        </div>
      </annotation-message>
      <table><tbody><tr data-artifact-id="1">
        <td><div><span class="text-bold">size-data</span></div></td>
        <td>1.33 KB</td>
        <td><span>Expired</span></td>
      </tr></tbody></table>
      <table><tbody><tr>
        <td><a class="text-bold" href="https://github.com/o/r/runs/1?check_suite_focus=true">Deploy job</a></td>
        <td>Run time</td>
      </tr></tbody></table>
      <div><a href="/o/r/deployments/activity_log?environment=Preview">Preview</a> and <button>2 more</button></div>
      <a href="/o/r/deployments">All deployments</a>`

    for (const text of [
      'Release',
      'Deploy',
      'build-matrix',
      'Setup Vite+',
      'Post Setup Vite+',
      'Run workflow',
      'Wait for build',
      'Deploy docs',
      'Deploy site',
      'test',
      'e2e-test',
      'size-report',
      'fix: Release notes',
      'Deployment',
      'fork',
      'octocat',
      'The Octocat',
      'octo-org',
      'label',
      'hello-world',
      'docs/Release',
      'Run tests: Success',
      '2026-10-26T02:04:01.1234567Z',
      'matrix-group',
      'unit-job',
      'group / unit-job',
      'Run e2e tests',
      'size-data',
      'Deploy job',
      'Preview'
    ]) {
      expect(ignored(text), text).toBe(true)
    }
    for (const text of [
      'All workflows',
      'Caches',
      'Showing caches from all workflows.',
      'Usage',
      'Set up job',
      'Run actions/checkout@v4',
      'Post Run actions/checkout@v4',
      'Run ./.github/actions/setup',
      'Complete job',
      'Parallel group',
      '· 3 steps',
      'skipped',
      'Workflow',
      'Cancelled',
      'Timed out',
      '0 Bytes',
      'succeeded',
      'Process completed with exit code 1.',
      'Expired',
      'Run time',
      '2 more',
      'All deployments'
    ]) {
      expect(ignored(text), text).toBe(false)
    }
  })

  it('data-target 含多个值时作业名仍被忽略；运行标题对话框的无障碍标题不翻译，普通对话框标题照常', () => {
    document.body.innerHTML = `
      <h2 class="Truncate lh-default h3"><span class="Truncate-text"><div class="d-flex">
        <span class="css-truncate css-truncate-overflow workflow-path-first-item" data-target="streaming-graph-job.name workflow-path.first">build-docs&nbsp;</span>
        <span>/</span>
        <span class="css-truncate css-truncate-overflow min-width-0">&nbsp;deploy-docs</span>
      </div></span></h2>
      <h2 class="Truncate h3"><span class="Truncate-text" data-target="streaming-graph-job.name-label">Summary</span></h2>
      <div class="Overlay-titleWrap">
        <h1 class="Overlay-title sr-only">chore: update docs</h1>
        <h2 class="d-flex"><span class="markdown-title">chore: update docs<span class="color-fg-muted"> #27404</span></span></h2>
      </div>
      <div class="Overlay-titleWrap"><h1 class="Overlay-title">Re-run all jobs</h1></div>`

    for (const text of ['build-docs', 'deploy-docs', 'chore: update docs']) {
      expect(ignored(text), text).toBe(true)
    }
    for (const text of ['/', 'Summary', 'Re-run all jobs']) {
      expect(ignored(text), text).toBe(false)
    }
  })

  it('运行器页自托管标签页：运行器标签被忽略，来源标签、运行器名、更大运行器的状态标签不被忽略', () => {
    document.body.innerHTML = runnerListHtml()
    for (const text of ['self-hosted', 'Linux', 'X64', 'Deploy']) {
      expect(ignored(text), text).toBe(true)
    }
    for (const text of ['octo-org', 'build-01', 'Unprovisioned']) {
      expect(ignored(text), text).toBe(false)
    }
    // self-hosted 也是自托管运行器的默认标签（runs-on 标识符），不作页面词条
    expect(translate('self-hosted')).toBeUndefined()
  })
})
