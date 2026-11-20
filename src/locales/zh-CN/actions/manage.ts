import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, translateTime } from '../helpers'

/**
 * Actions 管理：缓存、运行器、使用情况指标、性能指标、证明（列表与详情，/attestations 归入 actions 页面类型）。
 */

/** 安全取值：避免 constructor 等原型链键命中 */
function pick(map: Readonly<Record<string, string>>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** 指标时段（句中为小写） */
const PERIODS: Readonly<Record<string, string>> = {
  'current week (mon-sun)': '本周（周一至周日）',
  'current month': '本月',
  'this month': '本月',
  'last month': '上个月',
  'last 30 days': '过去 30 天',
  'last 90 days': '过去 90 天',
  'last year': '去年',
  custom: '自定义时段'
}

function period(text: string): string {
  return pick(PERIODS, text.toLowerCase()) ?? text
}

const SCOPES: Readonly<Record<string, string>> = { organization: '此组织', repository: '此存储库' }

const USAGE_METRICS: Readonly<Record<string, string>> = { minutes: '总分钟数', 'job runs': '作业运行总数' }

/** 性能指标说明：主语与指标 */
const PERFORMANCE_METRICS: Readonly<Record<string, string>> = {
  'Average run time of': '作业的平均运行时间',
  'Average queue time of': '作业的平均排队时间',
  'Failure rate across': '作业的失败率',
  'Total minutes used across failed': '失败作业使用的总分钟数'
}

const PERFORMANCE_SOURCE = Object.keys(PERFORMANCE_METRICS).join('|')

/** 证明详情摘要条目的名称 */
const ATTESTATION_FIELDS: Readonly<Record<string, string>> = {
  Created: '创建时间',
  Commit: '提交',
  'Build Summary': '构建摘要',
  'Workflow File': '工作流文件'
}

/** Created 的取值：Oct 23 (Fri, 23 Oct 2026 20:22:17 GMT) → 10月23日 (Fri, 23 Oct 2026 20:22:17 GMT)；括号内的完整时间戳保留原文 */
const CREATED_VALUE_RE = new RegExp(`^(${TIME_SOURCE})( \\(.+\\))?$`)

function attestationValue(field: string, value: string): string {
  const created = field === 'Created' ? CREATED_VALUE_RE.exec(value) : null
  return created ? `${translateTime(created[1]!)}${created[2] ?? ''}` : value
}

/** Windows, Linux, and Mac → Windows、Linux 和 Mac */
function joinList(list: string): string {
  return list.replace(/,? and /, ' 和 ').replace(/, /g, '、')
}

export default {
  static: {
    // 缓存
    Caches: '缓存',
    'Showing caches from all workflows.': '显示所有工作流的缓存。',
    'Learn more about managing caches.': '了解如何管理缓存。',
    'Filter by cache key': '按缓存键筛选',
    'No caches': '暂无缓存',
    'No caches matched your search': '没有与搜索匹配的缓存',
    'Cache not found': '未找到缓存',
    'Nothing has been cached by workflows running in this repository.': '此存储库中运行的工作流尚未缓存任何内容。',
    'Remove the filters': '删除筛选器',
    'or try a different search query.': '或尝试其他搜索词。',
    'Approaching total cache storage limit': '即将达到缓存存储总上限',
    'Learn more about cache usage.': '了解缓存使用情况。',
    'Least recently used': '最久未使用',
    'at an unknown time': '时间未知',
    'Delete cache': '删除缓存',
    // 同屏另有 Delete cache，Remove 保留“移除”
    'Remove cache': '移除缓存',
    'Are you sure you want to delete this cache?': '确定要删除此缓存吗？',
    'Yes, permanently delete this cache': '是，永久删除此缓存',
    'Deleting cache...': '正在删除缓存...',
    'Deleting Cache...': '正在删除缓存...',
    'Deletion is in progress. Dismissing this dialog will not cancel it.': '正在删除。关闭此对话框不会取消删除。',
    'Cache deleted successfully.': '缓存已删除。',
    'Failed to delete this cache. Please try again.': '无法删除此缓存。请重试。',
    'Unable to load branches': '无法加载分支',
    'Unable to load branches.': '无法加载分支。',
    'Unable to load branches. Try again.': '无法加载分支。请重试。',
    'Close and reopen the filter to try again.': '关闭并重新打开筛选器以重试。',
    'Filter menus are unavailable because this query is too long. Shorten it in the filter input.':
      '筛选器菜单因查询过长而不可用。请在筛选器输入框中缩短查询。',

    // 运行器
    Runners: '运行器',
    'New runner': '新建运行器',
    'Runners available to this repository': '此存储库可用的运行器',
    'GitHub-hosted runners': 'GitHub 托管的运行器',
    'Self-hosted runners': '自托管运行器',
    'Copy label': '复制标签',
    'Runner actions': '运行器操作',
    'Runner list item actions': '运行器列表项操作',
    'Loading runners': '正在加载运行器',
    'Self-hosted runners are virtual machines for GitHub Actions workflows that you manage and maintain outside of GitHub.':
      '自托管运行器是用于 GitHub 操作工作流并由你在 GitHub 之外管理和维护的虚拟机。',
    'You don’t have any runners for this repository': '此存储库暂无运行器',
    "You don't have any runners for this repository": '此存储库暂无运行器',
    'You don’t have any self-hosted runners for this repository': '此存储库暂无自托管运行器',
    "You don't have any self-hosted runners for this repository": '此存储库暂无自托管运行器',
    'Unable to load runners': '无法加载运行器',
    'An error occurred while loading runners. Please try again.': '加载运行器时出错。请重试。',
    'Unable to load runners. An error occurred while loading runners. Please try again.': '无法加载运行器。加载时出错。请重试。',
    'Repository runners': '存储库运行器',
    'GitHub-hosted runners list': 'GitHub 托管的运行器列表',
    'Self-hosted runners list': '自托管运行器列表',
    'Repository self-hosted runner list': '存储库自托管运行器列表',
    'Runner type': '运行器类型',

    // 使用情况指标、性能指标
    'Metrics navigation': '指标导航',
    'Showing data:': '显示数据：',
    'Current month': '本月',
    'Current week (Mon-Sun)': '本周（周一至周日）',
    'Custom date range (UTC)': '自定义日期范围 (UTC)',
    'Choose dates': '选择日期',
    'Download report': '下载报告',
    'Job runs': '作业运行',
    'Runtime OS': '运行时操作系统',
    'Source repository': '源存储库',
    'Runner labels': '运行器标签',
    'No table data available yet.': '暂无表格数据。',
    'You don’t have workflows on any of your organization repositories.': '你的组织存储库中没有任何工作流。',
    "You don't have workflows on any of your organization repositories.": '你的组织存储库中没有任何工作流。',
    'Total minutes': '总分钟数',
    'Total job runs': '作业运行总数',
    'Row Actions': '行操作',
    'View performance': '查看性能',
    'Avg job run time': '平均作业运行时间',
    'Avg job queue time': '平均作业排队时间',
    'Job failure rate': '作业失败率',
    // 数量义 usage 作“使用量”
    'Failed job usage': '失败作业使用量',
    'Avg run time minutes': '平均运行分钟数',
    'Avg queue time minutes': '平均排队分钟数',
    'Failure rate': '失败率',
    'Has job failures': '有作业失败',
    'Avg run time': '平均运行时间',
    'Avg queue time': '平均排队时间',

    // 证明
    'Attestations list': '证明列表',
    'No attestations': '暂无证明',
    // Create attestations using the <a>attest-build-provenance</a> action
    'Create attestations using the': '使用',
    'Predicate type': '谓词类型',
    'Title of the list': '列表标题',
    'Attestation summary': '证明摘要',
    'Build Summary': '构建摘要',
    'Workflow File': '工作流文件',
    'Verify attestation': '验证证明',
    'Certificate summary': '证书摘要',
    'Subject digest': '主体摘要',
    // 证书摘要的字段
    'Build Config Digest': '构建配置摘要',
    'Build Config URI': '构建配置 URI',
    'Build Signer Digest': '构建签名者摘要',
    'Build Signer URI': '构建签名者 URI',
    'Build Trigger': '构建触发器',
    'Runner Invocation URI': '运行器调用 URI',
    'Runner Environment': '运行器环境',
    'Source Repository Digest': '源存储库摘要',
    'Source Repository Identifier': '源存储库标识符',
    'Source Repository Owner Identifier': '源存储库所有者标识符',
    'Source Repository Owner URI': '源存储库所有者 URI',
    'Source Repository Ref': '源存储库引用',
    'Source Repository URI': '源存储库 URI',
    'Source Repository Visibility': '源存储库可见性'
  },

  scoped: {
    Key: '键',
    'Find a branch': '查找分支',
    'Recently used': '最近使用',
    cached: '缓存于',
    'Last used': '最后使用于',
    label: '标签',
    Metrics: '指标',
    Range: '范围',
    'Range:': '范围：',
    'Enter a number': '输入数字',
    'equal to': '等于',
    'greater than': '大于',
    'less than': '小于',
    'greater than or equal to': '大于或等于',
    'less than or equal to': '小于或等于',
    // 运行器类型的取值（self-hosted 也是自托管运行器的默认标签，保留原文）
    hosted: '托管',
    'hosted-larger': '更大的托管',
    // 指标表格中不足 1 秒的时长（其余时长由 run.ts 的时长规则译出，同限 actions）
    '<1s': '<1 秒',
    of: '共',

    // 运行器空状态、标准托管运行器（与组织设置的运行器页共用组件）
    'Learn more about using runners': '了解如何使用运行器',
    'Runners are the machines that execute GitHub Actions workflows.': '运行器是执行 GitHub 操作工作流的机器。',
    'Standard GitHub-hosted runners': '标准 GitHub 托管的运行器',
    'Ready-to-use runners managed by GitHub.': '由 GitHub 管理的开箱即用运行器。',
    'Learn more about GitHub-hosted runners.': '了解 GitHub 托管的运行器。',

    // 证明；action 是 Create attestations using the <a>attest-build-provenance</a> action 的末段
    action: '操作创建证明',
    Subjects: '主体',
    Subject: '主体',
    Issuer: '颁发者',
    // 排序按钮的读屏后缀：Sort by Newest, descending
    ', descending': '，降序',
    ', ascending': '，升序'
  },

  regexp: [
    // 缓存
    [/^([\d,]+) caches?$/, '$1 个缓存'],
    [/^([\d,]+) cache results?$/, '$1 个缓存结果'],
    [/^([\d,]+) found\.$/, '找到 $1 个。'],
    [/^([\d,]+) Bytes?$/, '$1 字节'],
    [/^Delete (.+) on ([^ ]+)$/, '删除 $2 上的缓存 $1'],
    [
      /^Least recently used caches will be automatically evicted to limit the total cache storage to ([\d.]+ [KMGT]B)\.$/,
      '最久未使用的缓存将被自动清除以将缓存存储总量限制在 $1。'
    ],
    // 运行器
    [/^([\d,]+) available runners?$/, '$1 个可用运行器'],
    [
      /^(\d+)-cores · (\d+) GB RAM · (\d+) GB SSD Storage(?: · (.+))?$/,
      (_, cores: string, ram: string, ssd: string, systems: string) =>
        `${cores} 核 · ${ram} GB 内存 · ${ssd} GB SSD 存储${systems ? ` · ${joinList(systems)}` : ''}`
    ],
    [/^Copy ([\w.-]+-latest)( label)?$/, (_, name: string, label: string) => `复制 ${name}${label ? ' 标签' : ''}`],
    // 指标
    [/^Insights: ([\w.-]+\/[\w.-]+)$/, '洞察：$1'],
    [/^Showing data from (\d{4}\/\d{1,2}\/\d{1,2}) to$/, '数据时段 $1 至'],
    [/^Period: (.+)$/, (_, text: string) => `时段：${period(text)}`],
    [
      /^Total (minutes|job runs) across all workflows in this (organization|repository) for (.+)$/,
      (_, metric: string, scope: string, text: string) => `${pick(SCOPES, scope)}所有工作流${period(text)}的${pick(USAGE_METRICS, metric)}`
    ],
    [
      new RegExp(`^(${PERFORMANCE_SOURCE}) jobs in this (organization|repository) for (.+)$`),
      (_, metric: string, scope: string, text: string) => `${pick(SCOPES, scope)}${period(text)}${pick(PERFORMANCE_METRICS, metric)}`
    ],
    // 证明列表：主体名不含空格，避免误伤带“and N others”的运行标题
    [/^([\d,]+) subjects? ·$/, '$1 个主体 ·'],
    [/^Download attestation #(\d+)$/, '下载证明 #$1'],
    [/^(\S+) and ([\d,]+) others?$/, '$1 及另外 $2 个'],
    // 列表项的无障碍名称：gh.deb and 20 others. deployment.yml@refs/heads/trunk. More information available below.
    [
      /^(\S+?)(?: and ([\d,]+) others?)?\. (\S+)\. More information available below\.$/,
      (_, subject: string, count: string | undefined, workflow: string) =>
        `${subject}${count ? ` 及另外 ${count} 个` : ''}。${workflow}。更多信息见下方。`
    ],
    // 证明详情的摘要条目：Commit. 4f2cfe9….（标点随原文，名称与取值之间用句号；Created 的日期按通则译出）
    [
      new RegExp(`^(${Object.keys(ATTESTATION_FIELDS).join('|')})\\. (.+)\\.$`),
      (_, field: string, value: string) => `${pick(ATTESTATION_FIELDS, field)}。${attestationValue(field, value)}。`
    ]
  ],

  ignore: [
    // 运行器页自托管标签页：条目标题后的运行器标签（self-hosted、Linux、X64 等，runs-on 用的标识符），来源标签（accent）照常
    '[class*="SelfHostedRunners__"] [data-listview-item-title-container] > [data-component="Label"]:not([data-variant="accent"])'
  ]
} satisfies PageDictionary
