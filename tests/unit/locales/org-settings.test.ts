import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import orgPolicies from '../../../src/locales/zh-CN/org-policies'
import orgSettings from '../../../src/locales/zh-CN/org-settings'
import moderation from '../../../src/locales/zh-CN/org-settings/moderation'
import { DEPENDABOT_RULES_REGEXP, DEPENDABOT_RULES_SCOPED } from '../../../src/locales/zh-CN/org-settings/security'
import { mergeDictionaries } from '../../../src/locales/zh-CN/helpers'
import rulesetImport from '../../../src/locales/zh-CN/repo-settings/ruleset-import'
import rulesetInsights from '../../../src/locales/zh-CN/repo-settings/ruleset-insights'
import rulesetRules from '../../../src/locales/zh-CN/repo-settings/ruleset-rules'
import rulesets from '../../../src/locales/zh-CN/repo-settings/rulesets'
import developerApps from '../../../src/locales/zh-CN/settings-developer/apps'
import accountModeration from '../../../src/locales/zh-CN/settings-developer/moderation'
import developerPermissions from '../../../src/locales/zh-CN/settings-developer/permissions'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'
import twOrgSettings from '../../../src/locales/zh-TW/org-settings'
import {
  DEPENDABOT_RULES_REGEXP as TW_DEPENDABOT_RULES_REGEXP,
  DEPENDABOT_RULES_SCOPED as TW_DEPENDABOT_RULES_SCOPED
} from '../../../src/locales/zh-TW/org-settings/security'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = orgSettings

const matcher = createMatcher([['org-settings', orgSettings]])

function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'org-settings'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 常规：组织资料、危险区域
  { hits: [['View setube-organization settings', '查看 setube-organization 的设置']], misses: ['View the settings'] },
  { hits: [['Link to social profile 2', '社交帐户链接 2']], misses: ['Link to social profile two'] },
  {
    hits: [['Your organization octo-org is being archived.', '正在存档组织 octo-org。']],
    misses: ['Your organization is being archived.']
  },
  {
    hits: [['Your organization octo-org has been unarchived.', '组织 octo-org 已取消存档。']],
    misses: ['Your organization has been unarchived.']
  },
  {
    hits: [['Please type octo-org to confirm.', '请输入 octo-org 以确认。']],
    misses: ['Please type the organization name to confirm.']
  },
  {
    hits: [['To confirm, type "octo-org" in the box below', '要确认，请在下方输入框中输入“octo-org”']],
    misses: ['To confirm, type the name in the box below']
  },
  {
    hits: [
      [
        'Deleting the octo-org organization will delete all of its repositories. The octo-org username will be unavailable for 90 days.',
        '删除 octo-org 组织将删除其所有存储库。octo-org 用户名将在 90 天内不可用。'
      ]
    ],
    misses: ['Deleting the organization will delete all of its repositories.']
  },
  {
    hits: [
      [
        'Connect a Patreon account for octo-org to sponsor maintainers with. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile.',
        '为 octo-org 连接 Patreon 帐户以赞助维护者。如果被赞助者也链接了 Patreon 和 GitHub，并且拥有公开的 GitHub 赞助个人资料，你在 Patreon 上的赞助也会在 GitHub 上得到认可。'
      ]
    ],
    misses: ['Connect a Patreon account to sponsor maintainers with.']
  },

  // 角色
  {
    hits: [
      ['• Manage webhooks', '• 管理 Web 钩子'],
      [
        '• Access to the audit log for the organization. The audit log may contain metadata for repositories in the organization.',
        '• 可访问组织的审核日志。审核日志可能包含组织内存储库的元数据。'
      ]
    ],
    misses: ['• Manage everything']
  },
  {
    hits: [
      ['Security manager icon', '安全管理员图标'],
      ['All-repository read icon', '所有存储库读取图标']
    ],
    misses: ['Custom role icon']
  },
  {
    hits: [
      ['5 roles', '5 个角色'],
      ['1 role', '1 个角色']
    ],
    misses: ['Five roles']
  },
  {
    hits: [
      ['12 permissions', '12 项权限'],
      ['1 permission', '1 项权限']
    ],
    misses: ['Many permissions']
  },
  {
    hits: [
      ['3 custom roles', '3 个自定义角色'],
      ['1 custom role', '1 个自定义角色']
    ],
    misses: ['No custom roles yet']
  },
  { hits: [['2/10 custom roles', '2/10 个自定义角色']], misses: ['2 of 10 custom roles'] },
  {
    hits: [
      ['3 users and 2 teams assigned', '已分配 3 个用户和 2 个团队'],
      ['1 user and 1 team assigned', '已分配 1 个用户和 1 个团队']
    ],
    misses: ['users and teams assigned']
  },
  {
    hits: [['You can create up to 3 custom roles.', '最多可创建 3 个自定义角色。']],
    misses: ['You can create custom roles.']
  },
  {
    hits: [
      [
        'In addition to the available pre-defined roles, you can create up to 3 custom roles to fit your needs.',
        '除了现有的预定义角色，你还可以根据需要创建最多 3 个自定义角色。'
      ]
    ],
    misses: ['In addition to the available pre-defined roles, you can create custom roles.']
  },

  // 成员权限（权限名的引号随原文）
  {
    hits: [
      ['Change base permission to "Read"', '将基本权限更改为“读取”'],
      ['Change default permission to "No permission"', '将默认权限更改为“无权限”'],
      ['Change base permissions to Write', '将基本权限更改为写入'],
      ['Change base permission to “Admin”', '将基本权限更改为“管理员”']
    ],
    misses: ['Change base permission to "Maintain"', 'Change base permission to “Owner”', 'Change permission to "Read"']
  },
  {
    hits: [
      ['Base repository permission updated to "Write".', '存储库基本权限已更新为“写入”。'],
      ['Base repository permission updated to “No permission”.', '存储库基本权限已更新为“无权限”。'],
      ['Base repository permission updated to Read.', '存储库基本权限已更新为读取。']
    ],
    misses: ['Base repository permission updated.']
  },
  {
    hits: [
      ['Base permission updated to "Admin" for projects.', '项目基本权限已更新为“管理员”。'],
      ['Base permission updated to “Read” for projects.', '项目基本权限已更新为“读取”。'],
      ['Base permission updated to None for projects.', '项目基本权限已更新为无。']
    ],
    misses: ['Base permission updated for projects.']
  },
  {
    hits: [
      [
        'This may change the permission that the organization’s 12 members have on its 30 repositories.',
        '这可能会改变组织 12 个成员对其 30 个存储库的权限。'
      ],
      [
        'This may change the permission that the organization’s 1 member has on its 1 repository.',
        '这可能会改变组织 1 个成员对其 1 个存储库的权限。'
      ],
      [
        "This may change the permission that the organization's 5 members have on its 8 repositories.",
        '这可能会改变组织 5 个成员对其 8 个存储库的权限。'
      ]
    ],
    misses: [
      'This may change the permission that the organization’s members have on its repositories.',
      "This may change the permission that the organization's members have."
    ]
  },
  {
    hits: [
      ['This will affect 4 projects.', '这将影响 4 个项目。'],
      ['This will affect 1 project.', '这将影响 1 个项目。']
    ],
    misses: ['This will affect all projects.']
  },
  {
    hits: [
      [
        'If enabled, all users with read access can create and comment on discussions in octo-org’s repositories.',
        '启用后，所有拥有读取访问权限的用户都可以在 octo-org 的存储库中创建讨论并发表评论。'
      ],
      [
        "If enabled, all users with read access can create and comment on discussions in octo-org's repositories.",
        '启用后，所有拥有读取访问权限的用户都可以在 octo-org 的存储库中创建讨论并发表评论。'
      ]
    ],
    misses: ['If enabled, all users with read access can create and comment on discussions.']
  },

  // 存储库策略列表计数
  {
    hits: [
      ['0 repository policies', '0 个存储库策略'],
      ['1 repository policy', '1 个存储库策略']
    ],
    misses: ['Some repository policies']
  },

  // 调解：版主、阻止用户、占位帐户
  {
    hits: [
      ['280 characters remaining.', '还可输入 280 个字符。'],
      ['1 character remaining.', '还可输入 1 个字符。']
    ],
    misses: ['No characters remaining.']
  },
  {
    hits: [
      ['Successfully added @octocat as a moderator', '已将 @octocat 添加为版主'],
      ['Successfully added @octo-org/security as a moderator', '已将 @octo-org/security 添加为版主']
    ],
    misses: ['Successfully added as a moderator']
  },
  {
    hits: [['Successfully removed @octocat as a moderator', '已将 @octocat 从版主中删除']],
    misses: ['Successfully removed octocat as a moderator']
  },
  {
    hits: [['You may add up to 10 members or teams as moderators.', '最多可添加 10 个成员或团队作为版主。']],
    misses: ['You may add members or teams as moderators.']
  },
  {
    hits: [
      ['3 blocked users', '3 个已阻止的用户'],
      ['1 blocked user', '1 个已阻止的用户']
    ],
    misses: ['No blocked users yet']
  },
  {
    hits: [
      ['2 users found', '找到 2 个用户'],
      ['1 user found', '找到 1 个用户']
    ],
    misses: ['Some users found']
  },
  { hits: [['Note for @octocat', '@octocat 的备注']], misses: ['Note for octocat'] },
  { hits: [['View note for @octocat', '查看 @octocat 的备注']], misses: ['View note for octocat'] },
  { hits: [['Edit block for @octocat', '编辑对 @octocat 的阻止']], misses: ['Edit block for octocat'] },
  { hits: [['Block settings for @octocat', '@octocat 的阻止设置']], misses: ['Block settings for octocat'] },
  { hits: [['Block user @mona-lisa', '阻止用户 @mona-lisa']], misses: ['Block user octocat'] },
  { hits: [['Block actions for @octocat', '@octocat 的阻止操作']], misses: ['Block actions for octocat'] },
  { hits: [['@octocat has been unblocked', '已取消阻止 @octocat']], misses: ['octocat has been unblocked'] },
  { hits: [['Unblocking @octocat', '正在取消阻止 @octocat']], misses: ['Unblocking octocat'] },
  { hits: [['Closing content from @octocat', '正在关闭 @octocat 的内容']], misses: ['Closing content from octocat'] },
  {
    hits: [['Unable to unblock @octocat. Please try again.', '无法取消阻止 @octocat。请重试。']],
    misses: ['Unable to unblock octocat. Please try again.']
  },
  {
    hits: [['Unable to close content from @octocat. Please try again.', '无法关闭 @octocat 的内容。请重试。']],
    misses: ['Unable to close content from octocat. Please try again.']
  },
  {
    hits: [['Content created by @octocat is being closed.', '正在关闭 @octocat 创建的内容。']],
    misses: ['Content created by octocat is being closed.']
  },
  // 交互限制剩余时间：原文无逗号，译文不加（与个人设置同句一致）
  {
    hits: [
      ['Enabled with less than a minute remaining.', '已启用剩余不到 1 分钟。'],
      ['Enabled with less than a minute remaining', '已启用剩余不到 1 分钟']
    ],
    misses: ['Enabled with less than an hour remaining']
  },
  {
    hits: [
      ['Enabled with about 23 hours remaining.', '已启用剩余约 23小时。'],
      ['Enabled with 6 days remaining', '已启用剩余 6天'],
      ['Enabled with a month remaining.', '已启用剩余 1个月。'],
      ['Enabled with almost 2 years remaining.', '已启用剩余将近 2年。']
    ],
    misses: ['Enabled with some time remaining']
  },
  {
    hits: [
      ['2 mannequins', '2 个占位帐户'],
      ['1 mannequin', '1 个占位帐户']
    ],
    misses: ['mannequins found']
  },

  // 计费
  { hits: [['$1.50 used / $10.00 included', '已用 $1.50 / 包含 $10.00']], misses: ['1.50 used / 10.00 included'] },
  { hits: [['Showing 1 to 3 of 3 budgets', '显示 3 个预算中的第 1 至 3 个']], misses: ['Showing budgets'] },
  { hits: [['Budget utilization for setube-organization', 'setube-organization 的预算使用率']], misses: ['Budget utilization'] },
  {
    hits: [
      ['View actions for Actions budget for Organization setube-organization', '查看组织 setube-organization 的操作预算的可用操作'],
      ['View actions for Git LFS budget for Organization setube-organization', '查看组织 setube-organization 的 Git LFS 预算的可用操作']
    ],
    misses: ['View actions for Storage budget for Organization setube-organization']
  },
  // 编辑预算页的面包屑
  {
    hits: [
      ['Edit Packages', '编辑软件包'],
      ['Edit Git LFS', '编辑 Git LFS']
    ],
    misses: ['Edit Storage']
  },
  {
    hits: [
      [
        'Included AI credits consumed by users in your account. Monthly limit resets in 11 days on Dec 1, 2026.',
        '帐户中用户消耗的包含 AI 额度。每月限额将在 11天后于 2026年12月1日重置。'
      ],
      [
        'Included AI credits consumed by users in your account. Monthly limit resets in 1 day on 2026年12月1日.',
        '帐户中用户消耗的包含 AI 额度。每月限额将在 1天后于 2026年12月1日重置。'
      ]
    ],
    misses: ['Included AI credits consumed by users in your account.']
  },
  {
    hits: [
      ['Member requests for GitHub Team', 'GitHub 团队版的成员请求'],
      ['Member requests for GitHub Enterprise', 'GitHub 企业版的成员请求']
    ],
    misses: ['Member requests for GitHub Pro']
  },
  {
    hits: [
      ['Team Features', '团队版功能'],
      ['Enterprise Features', '企业版功能']
    ],
    misses: ['Free Features']
  },
  { hits: [['octo-org is on the', 'octo-org 当前使用']], misses: ['octo org is on the'] },
  {
    hits: [
      ['Free organization plan', '免费版组织计划'],
      ['GitHub Team organization plan', 'GitHub 团队版组织计划']
    ],
    misses: ['Pro organization plan']
  },
  {
    hits: [
      ['View GitHub Team docs', '查看 GitHub 团队版文档'],
      ['View Copilot Business docs', '查看 Copilot 商业版文档'],
      ['View GitHub Advanced Security docs', '查看 GitHub 高级安全文档'],
      ['View GitHub Add-Ons docs', '查看 GitHub 附加组件文档']
    ],
    misses: ['View docs', 'View the docs']
  },
  {
    hits: [
      ['Your request for GitHub Team was declined by an admin on Oct 3, 2025.', '你对 GitHub 团队版的请求已于 2025年10月3日被管理员拒绝。'],
      ['Your request for Advanced Security was declined by an admin on Oct 3, 2025.', '你对高级安全的请求已于 2025年10月3日被管理员拒绝。']
    ],
    misses: ['Your request for GitHub Team was declined by an admin.']
  },
  {
    hits: [
      ['10 seats', '10 个席位'],
      ['1 seat', '1 个席位']
    ],
    misses: ['all seats']
  },
  { hits: [['3 of 10 seats used', '已使用 3/10 个席位']], misses: ['seats used'] },
  {
    hits: [
      ['2 billing managers', '2 个账单管理员'],
      ['1 billing manager', '1 个账单管理员']
    ],
    misses: ['Two billing managers']
  },
  {
    hits: [
      ['Gross metered usage for Oct 1 - Oct 31, 2025.', '10月1日 - 2025年10月31日的按流量计费的使用情况总额。'],
      ['Included usage discounts for Oct 1 - Oct 31, 2025', '10月1日 - 2025年10月31日的包含的使用量折扣']
    ],
    misses: ['Gross metered usage for this month.']
  },
  {
    hits: [
      [
        'Current usage for Oct 1 - Oct 31, 2025. Monthly quota resets in 5 day(s).',
        '10月1日 - 2025年10月31日的当前使用情况。每月配额将在 5天后重置。'
      ]
    ],
    misses: ['Current usage for Oct 1 - Oct 31, 2025.']
  },
  { hits: [['Resets in 5 days on Nov 1, 2025', '5天后于 2025年11月1日重置']], misses: ['Resets in 5 days'] },
  {
    hits: [
      ['Included usage limits reset in 5 days.', '包含的使用量限制将在 5天后重置。'],
      ['Included usage limits reset in 1 day', '包含的使用量限制将在 1天后重置']
    ],
    misses: ['Included usage limits reset soon']
  },
  {
    hits: [
      ['30 days', '30 天'],
      ['1 day', '1 天']
    ],
    misses: ['a few days']
  },
  {
    hits: [
      ['~$3.00 off*', '减免约 $3.00*'],
      ['$4.00 off', '减免 $4.00']
    ],
    misses: ['3.00 off']
  },
  { hits: [['$4.00 off per month for 1 year', '1 年内每月减免 $4.00']], misses: ['$4.00 off per month for a year'] },
  {
    hits: [
      ['$4.00 off per month until Dec 31, 2026', '2026年12月31日前每月减免 $4.00'],
      ['$4.00 off per month until Dec 31, 2026.', '2026年12月31日前每月减免 $4.00。']
    ],
    misses: ['$4.00 off per month until further notice']
  },
  { hits: [['$4.00 off per month', '每月减免 $4.00']], misses: ['4.00 off per month'] },
  {
    hits: [
      ['until Dec 31, 2026.', '至 2026年12月31日。'],
      ['until Dec 31, 2026', '至 2026年12月31日']
    ],
    misses: ['until further notice']
  },
  {
    hits: [['1,200 min used / 2,000 min included', '已用 1,200 分钟 / 包含 2,000 分钟']],
    misses: ['min used / min included']
  },
  { hits: [['0.5 GB used / 2 GB included', '已用 0.5 GB / 包含 2 GB']], misses: ['GB used / GB included'] },
  { hits: [['2,000 included Actions minutes', '包含 2,000 操作分钟数']], misses: ['included Actions minutes'] },
  {
    hits: [
      ['2 GB included Packages storage', '包含 2 GB 软件包存储'],
      ['10 GB included Git LFS bandwidth', '包含 10 GB Git LFS 带宽']
    ],
    misses: ['2 GB included Copilot storage']
  },
  {
    hits: [['120 included Codespaces core hours', '包含 120 代码空间核心小时数']],
    misses: ['included Codespaces core hours']
  },
  {
    hits: [['Discount for usage in public repositories (100% off)', '公共存储库使用量折扣（减免 100%）']],
    misses: ['Discount for usage in public repositories']
  },
  {
    hits: [['Based on 12 additional premium requests beyond your included usage.', '基于超出包含的使用量的 12 个额外高级请求。']],
    misses: ['Based on additional premium requests beyond your included usage.']
  },
  {
    hits: [['Based on 1,500 additional AI credits beyond your included usage.', '基于超出包含的使用量的 1,500 个额外 AI 额度。']],
    misses: ['Based on some additional AI credits beyond your included usage.']
  },
  {
    hits: [
      [
        'Cost calculated based on additional 30 premium requests for Copilot and Spark.',
        '费用按 Copilot 和 Spark 的 30 个额外高级请求计算。'
      ]
    ],
    misses: ['Cost calculated based on additional premium requests for Copilot and Spark.']
  },
  {
    hits: [
      ['Cost calculated based on additional 30 premium requests.', '费用按 30 个额外高级请求计算。'],
      ['Cost calculated based on additional 1 premium request', '费用按 1 个额外高级请求计算']
    ],
    misses: ['Cost calculated based on usage.']
  },
  {
    hits: [
      ['Cost calculated based on additional 4 token units', '费用按 4 个额外令牌单位计算'],
      ['Cost calculated based on additional 4 token units.', '费用按 4 个额外令牌单位计算。']
    ],
    misses: ['Cost calculated based on additional token units']
  },
  {
    hits: [
      [
        'Cost calculated based on 25 Spark premium requests that exceed the premium request usage included with your Copilot licenses.',
        '费用按超出 Copilot 许可证包含的高级请求使用量的 25 个 Spark 高级请求计算。'
      ]
    ],
    misses: ['Cost calculated based on Spark premium requests.']
  },
  {
    hits: [
      [
        'Cost calculated based on 1,200 Spark AI credits that exceed the AI credits usage included with your Copilot licenses.',
        '费用按超出 Copilot 许可证包含的 AI 额度使用量的 1,200 个 Spark AI 额度计算。'
      ]
    ],
    misses: ['Cost calculated based on Spark AI credits.']
  },
  { hits: [['/ 3,000 AI credits', '/ 3,000 AI 额度']], misses: ['/ unlimited AI credits'] },
  // 使用情况按 SKU 分组时核数可变的 SKU 名（与个人计费一致）
  {
    hits: [
      ['Actions macOS 3-core', '操作 macOS 3 核'],
      ['Actions Linux 16-core', '操作 Linux 16 核']
    ],
    misses: ['Actions macOS', 'Actions Linux 4-core ARM']
  },
  { hits: [['Codespaces compute 4-core', '代码空间计算 4 核']], misses: ['Codespaces compute 4 cores'] },
  {
    hits: [
      ['1,234 requests', '1,234 个请求'],
      ['1 request', '1 个请求']
    ],
    misses: ['Many requests']
  },
  { hits: [['12.5 min', '12.5 分钟']], misses: ['12.5 minutes'] },
  { hits: [['3 hr', '3 小时']], misses: ['3 hours'] },
  { hits: [['0.75 GB-hr', '0.75 GB·小时']], misses: ['GB-hr'] },
  {
    hits: [
      ['$4/month', '$4/月'],
      ['$21.00 / month', '$21.00/月']
    ],
    misses: ['4/month']
  },
  { hits: [['$48/year', '$48/年']], misses: ['48/year'] },
  { hits: [['$10 per month', '每月 $10']], misses: ['10 per month'] },
  { hits: [['$100 per year', '每年 $100']], misses: ['per year'] },
  {
    hits: [
      ['Timeframe: Current month', '时间范围：本月'],
      ['Timeframe: This year (2025)', '时间范围：今年 (2025)'],
      ['Time frame: Last month', '时间范围：上个月'],
      ['Time Frame: Custom range (2024)', '时间范围：自定义范围 (2024)']
    ],
    misses: ['Timeframe: Next month']
  },
  {
    hits: [
      ['This year (2025)', '今年 (2025)'],
      ['Last year (2024)', '去年 (2024)']
    ],
    misses: ['Next year (2026)']
  },
  {
    hits: [
      ['Group: Product', '分组：产品'],
      ['Group by: Repository', '分组依据：存储库'],
      ['Group: None', '分组：无']
    ],
    misses: ['Group: Workflow']
  },
  {
    hits: [
      ['Metered usage grouped by Product', '按产品分组的按流量计费的使用情况'],
      ['Actions usage grouped by SKU', '按 SKU 分组的操作使用情况']
    ],
    misses: ['Metered usage grouped by Day']
  },
  {
    hits: [['Top three repositories this month', '本月排名前三的存储库']],
    misses: ['Top ten repositories this month']
  },
  {
    hits: [['Oct 26, 2025 (All times in UTC)', '2025年10月26日（UTC 时间）']],
    misses: ['Today (All times in UTC)']
  },
  {
    hits: [
      ['Usage for Oct 26, 2025', '2025年10月26日的使用情况'],
      ['Usage for Oct 26, 2025.', '2025年10月26日的使用情况。']
    ],
    misses: ['Usage for today']
  },
  { hits: [['Oct 1 - Oct 31, 2025', '10月1日 - 2025年10月31日']], misses: ['Oct 1 - today'] },
  {
    hits: [
      ['3 budgets', '3 个预算'],
      ['1 budget', '1 个预算']
    ],
    misses: ['Some budgets']
  },
  { hits: [['$12.34 spent', '已支出 $12.34']], misses: ['Nothing spent'] },
  { hits: [['$50 budget', '预算 $50']], misses: ['Some budget'] },
  { hits: [['2 selected', '已选择 2 项']], misses: ['Some selected'] },
  {
    hits: [
      [
        "We're preparing your usage report. It may take ~30 minutes to see usage in your report. We'll send an email to mona@example.com when it's ready.",
        '正在准备使用情况报告。使用情况可能约30分钟后才会出现在报告中。报告就绪后会发送电子邮件至 mona@example.com。'
      ]
    ],
    misses: ["We're preparing your usage report. It may take a while."]
  },
  {
    hits: [
      [
        'We’re preparing your usage report. We’ll send an email to mona@example.com when it’s ready.',
        '正在准备使用情况报告。报告就绪后会发送电子邮件至 mona@example.com。'
      ]
    ],
    misses: ["We're preparing your usage report."]
  },
  {
    hits: [
      [
        'Your usage report request is already in progress. Check mona@example.com for the report when it’s ready.',
        '你的使用情况报告请求正在处理中。报告就绪后请查收 mona@example.com。'
      ]
    ],
    misses: ['Your usage report request is already in progress.']
  },
  {
    hits: [["The usage report will be emailed when it's ready to mona@example.com.", '报告就绪后将通过电子邮件发送至 mona@example.com。']],
    misses: ['The usage report will be emailed when it is ready.']
  },
  {
    hits: [
      ['Learn more about Secret Protection', '了解机密保护'],
      ['Learn more about Code Security', '了解代码安全']
    ],
    misses: ['Learn more about Code Quality']
  },
  {
    hits: [
      ['Try free for 30 days', '免费试用 30 天'],
      ['Try free for 1 day', '免费试用 1 天']
    ],
    misses: ['Try free for a month']
  },
  { hits: [['Start your free 30 day trial', '开始 30 天免费试用']], misses: ['Start your free trial'] },
  {
    hits: [
      [
        'You can convert to a paid plan at any time. If you don’t purchase by the end of 30 days, your trial will expire and all private repositories will lose access to Secret Protection and Code Security features.',
        '你可以随时转为付费计划。如果 30 天内未购买，试用将过期，所有专用存储库都将无法使用机密保护和代码安全功能。'
      ]
    ],
    misses: ['You can convert to a paid plan at any time.']
  },
  {
    hits: [
      ['Trial ends on October 31, 2026.', '试用将于 2026年10月31日结束。'],
      ['Trial ended on Jan 5, 2026.', '试用已于 2026年1月5日结束。']
    ],
    misses: ['Trial ends on the last day of the month.', 'Trial ends soon.']
  },
  {
    hits: [
      ['50 available', '50 个可用'],
      ['1,000 available', '1,000 个可用']
    ],
    misses: ['None available']
  },
  {
    hits: [
      ['Amount based on 12 billable licenses.', '金额按 12 个可计费许可证计算。'],
      ['Amount based on 1 purchased license.', '金额按 1 个已购买的许可证计算。']
    ],
    misses: ['Amount based on usage.']
  },
  {
    hits: [['Amount based on 12 billable licenses, due by October 31, 2026.', '金额按 12 个可计费许可证计算，应于 2026年10月31日前支付。']],
    misses: ['Amount based on 12 billable licenses, due by the end of the month.']
  },
  { hits: [['$19.00/month each', '每个 $19.00/月']], misses: ['19.00/month each'] },
  {
    hits: [
      ['3 Code Quality licenses', '3 个代码质量许可证'],
      ['1 Code Quality license', '1 个代码质量许可证'],
      ['12 Secret Protection licenses', '12 个机密保护许可证'],
      ['1,024 Code Security licenses', '1,024 个代码安全许可证'],
      ['5 GitHub Advanced Security licenses', '5 个 GitHub 高级安全许可证']
    ],
    misses: ['Many Code Quality licenses', '3 Copilot Business licenses']
  },
  // 组织升级为企业：升级结果列表、名称保留期，结账页的席位数下限与单价
  {
    hits: [
      [
        'A new enterprise account in which setube-organization will be the first member organization created.',
        '将创建新的企业帐户，setube-organization 将成为其第一个成员组织。'
      ]
    ],
    misses: ['A new enterprise account will be created.']
  },
  {
    hits: [
      [
        'All current owners of octo-org will become owners of the new enterprise account.',
        'octo-org 的所有现有所有者将成为新企业帐户的所有者。'
      ]
    ],
    misses: ['All current owners will become owners of the new enterprise account.']
  },
  {
    hits: [
      [
        'All current billing managers of octo-org will become billing managers of the new enterprise account.',
        'octo-org 的所有现有账单管理员将成为新企业帐户的账单管理员。'
      ]
    ],
    misses: ['All current billing managers will become billing managers of the new enterprise account.']
  },
  {
    hits: [
      [
        "The current billing details of octo-org, including the organization's billing email address, will become the billing details of the new enterprise account.",
        'octo-org 的当前账单详细信息（包括组织的账单电子邮件地址）将成为新企业帐户的账单详细信息。'
      ],
      [
        'The current billing details of octo-org, including the organization’s billing email address, will become the billing details of the new enterprise account.',
        'octo-org 的当前账单详细信息（包括组织的账单电子邮件地址）将成为新企业帐户的账单详细信息。'
      ]
    ],
    misses: ['The current billing details will become the billing details of the new enterprise account.']
  },
  {
    hits: [
      [
        'This enterprise name and slug will be reserved for 5 days until payment is processed. If the purchase is not completed, the account',
        '此企业名称和标识将保留 5 天，直至付款处理完成。如果未完成购买，此帐户'
      ],
      [
        'This enterprise name and slug will be reserved for 1 day until payment is processed. If the purchase is not completed, the account will be deleted and the name and slug will become available again.',
        '此企业名称和标识将保留 1 天，直至付款处理完成。如果未完成购买，此帐户将被删除，名称和标识将重新可用。'
      ]
    ],
    misses: ['This enterprise name and slug will be reserved until payment is processed.']
  },
  {
    hits: [
      ['You need at least 1 seat to support your organization', '至少需要 1 个席位才能支持你的组织'],
      ['You need at least 5 seats to support your organization', '至少需要 5 个席位才能支持你的组织']
    ],
    misses: ['You need at least one seat to support your organization']
  },
  {
    hits: [
      ['On GitHub Enterprise each seat costs $21 per month.', 'GitHub 企业版的每个席位每月 $21。'],
      ['On GitHub Enterprise each seat costs $231 per year.', 'GitHub 企业版的每个席位每年 $231。']
    ],
    misses: ['On GitHub Enterprise each seat costs $21.']
  },

  // 组织规则集洞察的图表（沿用洞察页的图表无障碍描述）
  { hits: [['Bar chart with 3 bars.', '包含 3 个柱的柱状图。']], misses: ['Bar chart with many bars.'] },
  {
    hits: [
      ['The chart has 1 X axis displaying Values.', '图表有 1 条显示值的 X 轴。'],
      [
        'The chart has 1 Y axis displaying Number of bypasses. Data ranges from 0 to 12.',
        '图表有 1 条显示绕过次数的 Y 轴。数据范围从 0 到 12。'
      ]
    ],
    misses: ['The chart has one X axis.']
  },
  {
    hits: [['The chart has 2 X axes displaying Actor, Values.', '图表的 2 条 X 轴分别显示参与者、值。']],
    misses: ['The chart has many axes.']
  },
  // 议题字段、议题类型、标签颜色
  {
    hits: [
      ['3 Issue fields', '3 个议题字段'],
      ['1 Issue field', '1 个议题字段']
    ],
    misses: ['Many Issue fields']
  },
  { hits: [['Issue field: Story points', '议题字段：Story points']], misses: ['Issue field'] },
  {
    hits: [
      ['Open field options for Story points', '打开 Story points 字段选项'],
      ['Open field options for 迭代', '打开迭代字段选项']
    ],
    misses: ['Open field options']
  },
  { hits: [['"Spike" Issue type list item', '议题类型列表项“Spike”']], misses: ['Issue type list item'] },
  { hits: [['Open type options for Spike', '打开 Spike 类型选项']], misses: ['Open type options'] },
  { hits: [['Color #b60205', '颜色 #b60205']], misses: ['Color red'] },

  // 存储库默认设置、标签、自定义属性、规划、网络、软件包、Pages
  {
    hits: [
      [
        'New repositories created in octo-org will use main as their default branch.',
        '在 octo-org 中创建的新存储库将使用 main 作为默认分支。'
      ],
      [
        'New repositories created in octo-org will use release/v1 as their default branch.',
        '在 octo-org 中创建的新存储库将使用 release/v1 作为默认分支。'
      ]
    ],
    misses: ['New repositories will use main as their default branch.']
  },
  {
    hits: [['Your default branch name will be trunk', '默认分支名称将为 trunk']],
    misses: ['Your default branch name will be the same']
  },
  {
    hits: [
      ['5 labels', '5 个标签'],
      ['1 label', '1 个标签']
    ],
    misses: ['No labels yet']
  },
  { hits: [['4 properties', '4 个属性']], misses: ['Some properties'] },
  { hits: [['1 property', '1 个属性']], misses: ['One property'] },
  {
    hits: [
      ['3 issue types', '3 个议题类型'],
      ['1 issue type', '1 个议题类型']
    ],
    misses: ['Many issue types']
  },
  // 议题类型列表标题：3 types (max 25)
  {
    hits: [
      ['3 types', '3 个类型'],
      ['1 type', '1 个类型']
    ],
    misses: ['Many types']
  },
  { hits: [['(max 25)', '（最多 25 个）']], misses: ['(max many)'] },
  { hits: [['3 types (max 25)', '3 个类型（最多 25 个）']], misses: ['3 types (max)'] },
  {
    hits: [
      ['2 issue fields', '2 个议题字段'],
      ['1 issue field', '1 个议题字段']
    ],
    misses: ['Many issue fields']
  },
  {
    hits: [
      ['2 network configurations', '2 个网络配置'],
      ['1 network configuration', '1 个网络配置']
    ],
    misses: ['Many network configurations']
  },
  {
    hits: [['No recoverable packages were found for octo-org.', '未找到 octo-org 中可恢复的软件包。']],
    misses: ['No recoverable packages were found.']
  },
  {
    hits: [
      ['Successfully verified example.com', '已成功验证 example.com'],
      ['Successfully verified docs.example.com.', '已成功验证 docs.example.com。']
    ],
    misses: ['Successfully verified localhost']
  },

  // Copilot
  {
    hits: [
      ['5 seats assigned', '已分配 5 个席位'],
      ['1 seat assigned', '已分配 1 个席位']
    ],
    misses: ['No seats assigned']
  },
  {
    hits: [
      ['3 members selected...', '已选择 3 个成员...'],
      ['1 member selected…', '已选择 1 个成员…']
    ],
    misses: ['members selected...', 'members selected…']
  },
  {
    hits: [
      ['2 teams selected', '已选择 2 个团队'],
      ['1 team selected', '已选择 1 个团队']
    ],
    misses: ['teams selected']
  },
  {
    hits: [
      ['You have 1200 characters, but the maximum is 1000.', '当前 1200 个字符，上限为 1000 个。'],
      ['You have 1200 characters, but the maximum is 1000', '当前 1200 个字符，上限为 1000 个']
    ],
    misses: ['You have too many characters.']
  },
  {
    hits: [
      ['If enabled, you can access and send data to Claude Sonnet 4.5.', '启用后，你可以访问 Claude Sonnet 4.5 并向其发送数据。'],
      [
        'If enabled, you can access and send data to Gemini 2.5 Pro (Preview).',
        '启用后，你可以访问 Gemini 2.5 Pro (Preview) 并向其发送数据。'
      ]
    ],
    misses: ['If enabled, you can access and send data to the model']
  },
  {
    hits: [
      ['1 of 3 items shown.', '显示 3 个项中的 1 个。'],
      ['25 of 1.2k items shown.', '显示 1.2k 个项中的 25 个。']
    ],
    misses: ['Some of many items shown.']
  },
  {
    hits: [
      ['3 users, $19.00 per user/month', '3 个用户，每用户 $19.00/月'],
      ['1 user, $1,234.50 per user/month', '1 个用户，每用户 $1,234.50/月']
    ],
    misses: ['users, $19.00 per user/month']
  },
  {
    hits: [
      [
        'This will permanently delete user-scoped Copilot memories for octocat that are billed to octo-org.',
        '这将永久删除计费到 octo-org 的 octocat 用户范围 Copilot 记忆。'
      ]
    ],
    misses: ['This will permanently delete user-scoped Copilot memories.']
  },
  {
    hits: [
      [
        'This will permanently delete user-scoped Copilot memories for all users with Copilot seats billed to octo-org.',
        '这将永久删除 Copilot 席位计费到 octo-org 的所有用户的用户范围 Copilot 记忆。'
      ]
    ],
    misses: ['This will permanently delete user-scoped Copilot memories for all users.']
  },
  {
    hits: [
      [
        'This will download user-scoped Copilot memories for octocat that are billed to octo-org.',
        '这将下载计费到 octo-org 的 octocat 用户范围 Copilot 记忆。'
      ]
    ],
    misses: ['This will download user-scoped Copilot memories.']
  },
  {
    hits: [
      [
        'This will download user-scoped Copilot memories for all users with Copilot seats billed to octo-org.',
        '这将下载 Copilot 席位计费到 octo-org 的所有用户的用户范围 Copilot 记忆。'
      ]
    ],
    misses: ['This will download user-scoped Copilot memories for all users.']
  },
  {
    hits: [
      [
        'By clicking Download memories, you confirm you have permission to access this information on behalf of users in this enterprise.',
        '单击下载记忆即表示你确认有权代表此企业的用户访问这些信息。'
      ],
      [
        'By clicking Download memories, you confirm you have permission to access this information on behalf of users in this organization.',
        '单击下载记忆即表示你确认有权代表此组织的用户访问这些信息。'
      ]
    ],
    misses: ['By clicking Download memories, you confirm you have permission to access this information on behalf of users in this team.']
  },
  {
    hits: [
      ["Values defined by octo-ent's administrators can't be edited", '由 octo-ent 的管理员定义的值无法编辑'],
      ['Values defined by octo-ent’s administrators can’t be edited', '由 octo-ent 的管理员定义的值无法编辑']
    ],
    misses: ["Values defined by administrators can't be edited"]
  },
  {
    hits: [
      ['Excluded paths inherited from enterprise', '排除路径继承自企业'],
      ['Excluded paths inherited from organization', '排除路径继承自组织']
    ],
    misses: ['Excluded paths inherited from team']
  },
  {
    hits: [
      ['Excluded paths inherited from enterprise octo-ent:', '排除路径继承自企业 octo-ent：'],
      ['Excluded paths inherited from organization octo-org:', '排除路径继承自组织 octo-org：']
    ],
    misses: ['Excluded paths inherited from enterprise octo-ent']
  },

  // Actions
  {
    hits: [
      [
        'All users that are not a member or owner of the repository and not a member of the setube-organization organization will require approval to run workflows.',
        '不是存储库成员或所有者、也不是 setube-organization 组织成员的所有用户都需要批准才能运行工作流。'
      ]
    ],
    misses: ['All users will require approval to run workflows.']
  },
  {
    hits: [['On March 2, 2026, GitHub will restrict', '2026年3月2日起，GitHub 将默认在公共存储库中限制']],
    misses: ['On some day, GitHub will restrict']
  },
  {
    hits: [
      ['3 selected repositories', '3 个所选存储库'],
      ['12 selected repositories', '12 个所选存储库']
    ],
    misses: ['No selected repositories']
  },
  {
    hits: [['Allow octo-org actions and reusable workflows', '允许 octo-org 的操作和可复用工作流']],
    misses: ['Allow these actions and workflows', 'Allow all actions and reusable workflows']
  },
  {
    hits: [
      [
        'Any action or reusable workflow defined in a repository within the octo-org organization can be used.',
        '可以使用 octo-org 组织内任何存储库中定义的操作或可复用工作流。'
      ]
    ],
    misses: ['Any action or reusable workflow can be used.']
  },
  {
    hits: [
      [
        'Allow octo-org, and select non-octo-org, actions and reusable workflows',
        '允许 octo-org 的以及所选的非 octo-org 的操作和可复用工作流'
      ]
    ],
    misses: ['Allow octo-org, and select actions']
  },
  {
    hits: [
      [
        'Any action or reusable workflow that matches the specified criteria, plus those defined in a repository within the octo-org organization, can be used.',
        '可以使用符合指定条件的操作或可复用工作流，以及 octo-org 组织内存储库中定义的操作或可复用工作流。'
      ]
    ],
    misses: ['Any action or reusable workflow that matches the specified criteria can be used.']
  },
  {
    hits: [
      ['2 active jobs', '2 个活动作业'],
      ['1 active job', '1 个活动作业']
    ],
    misses: ['No active jobs']
  },
  {
    hits: [
      ['5 caches', '5 个缓存'],
      ['1 cache', '1 个缓存']
    ],
    misses: ['All caches']
  },
  {
    hits: [
      ['3 runners', '3 个运行器'],
      ['1 runner', '1 个运行器']
    ],
    misses: ['Some runners']
  },
  {
    hits: [
      ['2 runner groups', '2 个运行器组'],
      ['1 runner group', '1 个运行器组']
    ],
    misses: ['Some runner groups']
  },
  // 操作策略：列表计数、包含 / 排除模式与事件的删除按钮提示、运行器组工作流格式错误
  {
    hits: [
      ['2 actions policies', '2 个操作策略'],
      ['1 actions policy', '1 个操作策略']
    ],
    misses: ['actions policies']
  },
  { hits: [['Delete include of src/**', '删除包含项 src/**']], misses: ['Delete include of '] },
  { hits: [['Delete exclude of 1', '删除排除项 1']], misses: ['Delete exclude of'] },
  {
    hits: [
      ['Delete pull_request_target', '删除 pull_request_target'],
      ['Delete fork', '删除 fork']
    ],
    misses: ['Delete Fork', 'Delete pull-request']
  },
  {
    hits: [['Workflow "0" is malformed. Format should be:', '工作流“0”格式错误。格式应为：']],
    misses: ['Workflow is malformed. Format should be:']
  },
  {
    hits: [
      ['Copy ubuntu-latest', '复制 ubuntu-latest'],
      ['Copy macos-latest', '复制 macos-latest']
    ],
    misses: ['Copy ubuntu-22.04']
  },
  {
    hits: [
      ['3 repositories with caches', '3 个存储库有缓存'],
      ['1 repository with cache', '1 个存储库有缓存']
    ],
    misses: ['repositories with caches']
  },
  {
    hits: [
      [
        "Add `ubuntu-latest` to your workflow's YAML to send jobs to GitHub-hosted runners.",
        '将 `ubuntu-latest` 添加到工作流 YAML 即可将作业发送到 GitHub 托管的运行器。'
      ],
      [
        'Add `octo-runner` to your workflow’s YAML to send jobs to this runner.',
        '将 `octo-runner` 添加到工作流 YAML 即可将作业发送到此运行器。'
      ]
    ],
    misses: ["Add a label to your workflow's YAML to send jobs to this runner."]
  },

  // Webhook
  {
    hits: [
      ['Completed in 0.12 seconds.', '耗时 0.12 秒。'],
      ['Completed in 1 second', '耗时 1 秒']
    ],
    misses: ['Completed in a few seconds', 'Completed in 1.2.3 seconds']
  },
  {
    hits: [
      ['4 webhooks', '4 个 Web 钩子'],
      ['1 webhook', '1 个 Web 钩子']
    ],
    misses: ['No webhooks']
  },

  // 身份验证安全、代码安全全局设置
  {
    hits: [
      [
        'Are you sure you want to require two-factor authentication for all users in setube-organization?',
        '确定要求 setube-organization 中的所有用户启用双因素身份验证吗？'
      ]
    ],
    misses: ['Are you sure you want to require two-factor authentication?']
  },
  {
    hits: [
      [
        'Two-factor authentication will no longer be required to access any resources in the setube-organization organization.',
        '访问 setube-organization 组织中的任何资源将不再需要双因素身份验证。'
      ]
    ],
    misses: ['Two-factor authentication will no longer be required.']
  },
  {
    hits: [
      [
        'Users will be required to set up two-factor authentication using a secure method in order to access the setube-organization organization.',
        '用户必须使用安全方法设置双因素身份验证才能访问 setube-organization 组织。'
      ]
    ],
    misses: ['Users will be required to set up two-factor authentication.']
  },
  {
    hits: [
      [
        'Users will be required to set up two-factor authentication in order to access the setube-organization organization.',
        '用户必须设置双因素身份验证才能访问 setube-organization 组织。'
      ]
    ],
    misses: ['Users will be required to set up two-factor authentication in order to access the organization.']
  },
  {
    hits: [
      [
        "Secure methods of two-factor authentication will no longer be required to access any organization's resources in the setube-organization organization.",
        '访问 setube-organization 组织中的资源将不再需要安全的双因素身份验证方法。'
      ]
    ],
    misses: ['Secure methods of two-factor authentication will no longer be required.']
  },
  // 合规报告
  { hits: [['Download SOC 2 Report', '下载 SOC 2 报告']], misses: ['Download SOC Report'] },
  {
    hits: [['GitHub.com ISO/IEC 27001:2022 certification', 'GitHub.com ISO/IEC 27001:2022 认证']],
    misses: ['GitHub.com ISO certification']
  },
  {
    hits: [['Download GitHub.com ISO/IEC 27001:2022 certification', '下载 GitHub.com ISO/IEC 27001:2022 认证']],
    misses: ['Download GitHub.com ISO certification']
  },
  { hits: [['2026-01-01 to 2026-03-31', '2026-01-01 至 2026-03-31']], misses: ['2026-01 to 2026-03'] },
  {
    hits: [
      ['Require two-factor authentication for everyone in the octo-org organization.', '要求 octo-org 组织中的所有人启用双因素身份验证。'],
      ['Require two-factor authentication for everyone in the octo-org organization', '要求 octo-org 组织中的所有人启用双因素身份验证']
    ],
    misses: ['Require two-factor authentication for everyone in the organization.']
  },
  {
    hits: [
      [
        'Require SAML SSO authentication for all members of the octo-org organization.',
        '要求 octo-org 组织的所有成员通过 SAML SSO 进行身份验证。'
      ],
      [
        'Require SAML SSO authentication for all members of the octo-org organization',
        '要求 octo-org 组织的所有成员通过 SAML SSO 进行身份验证'
      ]
    ],
    misses: ['Require SAML SSO authentication for all members.']
  },
  {
    hits: [
      [
        "You're about to enable private vulnerability reporting on all public repositories in octo-org.",
        '你即将为 octo-org 中的所有公共存储库启用专用漏洞报告。'
      ],
      [
        'You’re about to enable private vulnerability reporting on all public repositories in octo-org.',
        '你即将为 octo-org 中的所有公共存储库启用专用漏洞报告。'
      ]
    ],
    misses: ["You're about to enable private vulnerability reporting on all your public repositories."]
  },
  {
    hits: [
      [
        'You’re about to disable private vulnerability reporting on all public repositories in octo-org.',
        '你即将为 octo-org 中的所有公共存储库禁用专用漏洞报告。'
      ]
    ],
    misses: ["You're about to disable private vulnerability reporting."]
  },
  {
    hits: [
      [
        "You're about to enable dependency graph on all private repositories in octo-org.",
        '你即将为 octo-org 中的所有专用存储库启用依赖项关系图。'
      ]
    ],
    misses: ["You're about to enable dependency graph on all your private repositories."]
  },
  {
    hits: [
      [
        "You're about to disable dependency graph on all private repositories in octo-org. This will also disable Dependabot alerts and Dependabot security updates on those repositories.",
        '你即将为 octo-org 中的所有专用存储库禁用依赖项关系图。这也会禁用这些存储库的 Dependabot 警报和 Dependabot 安全更新。'
      ]
    ],
    misses: ["You're about to disable dependency graph on all private repositories in octo-org."]
  },
  {
    hits: [
      [
        "You're about to enable Dependabot alerts on all repositories in octo-org. Alerts require the dependency graph, so we'll also turn that on for all repositories. No notifications will be sent while Dependabot alerts are being enabled.",
        '你即将为 octo-org 中的所有存储库启用 Dependabot 警报。警报需要依赖项关系图，因此我们也会为所有存储库开启它。启用 Dependabot 警报期间不会发送通知。'
      ],
      [
        'You’re about to enable Dependabot alerts on all repositories in octo-org. Alerts require the dependency graph, so we’ll also turn that on for all repositories. No notifications will be sent while Dependabot alerts are being enabled.',
        '你即将为 octo-org 中的所有存储库启用 Dependabot 警报。警报需要依赖项关系图，因此我们也会为所有存储库开启它。启用 Dependabot 警报期间不会发送通知。'
      ]
    ],
    misses: ["You're about to enable Dependabot alerts on all repositories in octo-org."]
  },
  {
    hits: [
      [
        "You're about to disable Dependabot alerts on all repositories in octo-org. This will also disable Dependabot security updates on those repositories.",
        '你即将为 octo-org 中的所有存储库禁用 Dependabot 警报。这也会禁用这些存储库的 Dependabot 安全更新。'
      ]
    ],
    misses: ["You're about to disable Dependabot alerts on all repositories in octo-org."]
  },
  {
    hits: [
      [
        "You're about to enable Dependabot security updates on all repositories in octo-org. Dependabot security updates require the dependency graph and Dependabot alerts, so we'll also turn that on for all repositories.",
        '你即将为 octo-org 中的所有存储库启用 Dependabot 安全更新。Dependabot 安全更新需要依赖项关系图和 Dependabot 警报，因此我们也会为所有存储库开启它们。'
      ]
    ],
    misses: ["You're about to enable Dependabot security updates on all repositories in octo-org."]
  },
  {
    hits: [
      [
        "You're about to disable Dependabot security updates on all repositories in octo-org.",
        '你即将为 octo-org 中的所有存储库禁用 Dependabot 安全更新。'
      ]
    ],
    misses: ["You're about to disable Dependabot security updates on all your repositories."]
  },
  {
    hits: [
      [
        "You're about to enable grouped security updates on all repositories in octo-org. Grouped security updates require the dependency graph, Dependabot alerts, Dependabot security updates and Dependabot security updates, so we'll also turn that on for all repositories.",
        '你即将为 octo-org 中的所有存储库启用分组安全更新。分组安全更新需要依赖项关系图、Dependabot 警报和 Dependabot 安全更新，因此我们也会为所有存储库开启它们。'
      ]
    ],
    misses: ["You're about to enable grouped security updates on all repositories in octo-org."]
  },
  {
    hits: [
      [
        "You're about to disable grouped security updates on all repositories in octo-org.",
        '你即将为 octo-org 中的所有存储库禁用分组安全更新。'
      ]
    ],
    misses: ["You're about to disable grouped security updates on all your repositories."]
  },
  {
    hits: [
      ['This will disable push protection on 5 repositories where it is enabled.', '这将在 5 个已启用推送保护的存储库中禁用它。'],
      ['This will disable push protection on 1 repository where it is enabled.', '这将在 1 个已启用推送保护的存储库中禁用它。']
    ],
    misses: ['This will disable push protection on some repositories where it is enabled.']
  },

  // Dependabot 规则（与存储库设置共用）
  {
    hits: [
      ['3 rules enabled', '已启用 3 条规则'],
      ['1 rule enabled', '已启用 1 条规则']
    ],
    misses: ['Rules enabled']
  },
  {
    hits: [
      [
        'This will permanently delete the rule "Dismiss dev alerts" and potentially reopen associated alerts.',
        '这将永久删除规则“Dismiss dev alerts”并可能重新打开相关警报。'
      ]
    ],
    misses: ['This will permanently delete the rule and potentially reopen associated alerts.']
  },
  // 安全配置应用后的提示
  {
    hits: [
      ["Security settings updated for octo-org's repositories.", '已更新 octo-org 的存储库安全设置。'],
      ['Security settings updated for octo-org’s repositories.', '已更新 octo-org 的存储库安全设置。']
    ],
    misses: ['Security settings updated.']
  },
  // 推送保护绕过列表
  {
    hits: [
      ['3 actors', '3 个参与者'],
      ['1 actor', '1 个参与者']
    ],
    misses: ['No actors']
  },
  // 绕过列表每行菜单按钮的读屏名称（不带名称的提示文字由规则集 static 收录）：名称是 actor.name 原值，
  // 内置角色与兜底词 Unknown 用译名（同 repo-settings/security.ts），其余名称原样保留
  {
    hits: [
      ['octo-team Bypass actor actions', '绕过参与者 octo-team 的操作'],
      ['Organization admin Bypass actor actions', '绕过参与者组织管理员的操作'],
      ['admin Bypass actor actions', '绕过参与者管理员的操作'],
      ['Unknown Bypass actor actions', '绕过参与者未知的操作'],
      ['constructor Bypass actor actions', '绕过参与者 constructor 的操作']
    ],
    misses: ['octo-team Bypass actor', 'octo-team Bypass actor actions menu', 'Bypass actor actions for octo-team']
  },

  // 已验证和批准的域
  {
    hits: [
      ['Approve example.com', '批准 example.com'],
      ['Approve mail.example.co.uk', '批准 mail.example.co.uk']
    ],
    misses: ['Approve localhost']
  },

  // OAuth 应用策略
  {
    hits: [['Applications owned by octo-org always have access.', '由 octo-org 拥有的应用始终具有访问权限。']],
    misses: ['Applications owned by GitHub Apps always have access.']
  },
  {
    hits: [['Applications owned by octo-org are always trusted.', '由 octo-org 拥有的应用始终受信任。']],
    misses: ['Applications are always trusted.']
  },
  {
    hits: [
      [
        "All applications authorized by organization members have access to octo-org's data.",
        '组织成员授权的所有应用都可以访问 octo-org 的数据。'
      ],
      [
        'All applications authorized by organization members have access to octo-org’s data.',
        '组织成员授权的所有应用都可以访问 octo-org 的数据。'
      ]
    ],
    misses: ['All applications authorized by organization members have access to data.']
  },
  {
    hits: [
      ['2 requests selected...', '已选择 2 个请求...'],
      ['1 request selected…', '已选择 1 个请求…']
    ],
    misses: ['requests selected...']
  },
  {
    hits: [
      ['3 tokens selected...', '已选择 3 个令牌...'],
      ['1 token selected…', '已选择 1 个令牌…']
    ],
    misses: ['tokens selected…']
  },
  {
    hits: [
      ['Expires on Tue, Nov 25 2025', '有效期至 2025年11月25日周二'],
      ['Expired on Mon, Oct 6 2025.', '已于 2025年10月6日周一过期。'],
      ['Expires on Nov 25, 2025', '有效期至 2025年11月25日']
    ],
    misses: ['Expires on someday']
  },
  {
    hits: [
      ['Last used within the last week', '最近一周内使用过'],
      ['Last used within the last 3 weeks', '最近 3周内使用过'],
      ['Last used within the last 2 months', '最近 2个月内使用过']
    ],
    misses: ['Last used within the last decade']
  },
  {
    hits: [
      ['Never used •', '从未使用 •'],
      ['Last used within the last 6 months •', '最近 6个月内使用过 •']
    ],
    misses: ['Unused •']
  },

  // 开发人员设置：沿用个人开发人员设置的 GitHub 应用与权限正则
  {
    hits: [
      ['Token expiration is being enabled for test.', '正在为 test 启用令牌过期。'],
      ['Token expiration is being disabled for My App.', '正在为 My App 禁用令牌过期。']
    ],
    misses: ['Token expiration is being changed for test.']
  },
  {
    hits: [['Only allow this GitHub App to be installed on the @octo-org account.', '仅允许将此 GitHub 应用安装在 @octo-org 帐户上。']],
    misses: ['Only allow this GitHub App to be installed on this account.']
  },
  {
    hits: [['Choose an account to install Octo App on:', '选择要安装 Octo App 的帐户：']],
    misses: ['Choose an account to install on:']
  },
  {
    hits: [['Install Octo App on this account.', '将 Octo App 安装到此帐户。']],
    misses: ['Install on this account.']
  },
  {
    hits: [['Octo App is installed on this account.', 'Octo App 已安装在此帐户上。']],
    misses: ['Octo App is installed on another account.']
  },
  {
    hits: [['Where should we transfer Octo App?', '要将 Octo App 转让给谁？']],
    misses: ['Where should we transfer?']
  },
  {
    hits: [
      [
        'Any user or organization will be able to install this GitHub App. Are you sure you want to make Octo App public?',
        '任何用户或组织都可以安装此 GitHub 应用。确定要将 Octo App 设为公共吗？'
      ]
    ],
    misses: ['Any user or organization will be able to install this GitHub App.']
  },
  {
    hits: [
      [
        'This GitHub App will only be installable on the octo-org account. Are you sure you want to make Octo App private?',
        '此 GitHub 应用将只能安装在 octo-org 帐户上。确定要将 Octo App 设为专用吗？'
      ]
    ],
    misses: ['This GitHub App will only be installable on this account.']
  },
  {
    hits: [
      ['3 accounts', '3 个帐户'],
      ['1 account', '1 个帐户']
    ],
    misses: ['No accounts']
  },
  {
    hits: [
      ['2 users', '2 个用户'],
      ['1 user', '1 个用户']
    ],
    misses: ['No users']
  },
  {
    hits: [
      ['Added just now by', '刚刚添加，添加者'],
      ['Added 3 days ago by', '3天前添加，添加者']
    ],
    misses: ['Added by']
  },
  {
    hits: [['203.0.113.7 is not permitted by the IP allow list.', '203.0.113.7 未获 IP 允许列表允许。']],
    misses: ['is not permitted by the IP allow list']
  },
  {
    hits: [['203.0.113.0/24 is permitted by the IP allow list.', '203.0.113.0/24 已获 IP 允许列表允许。']],
    misses: ['This address is permitted by the IP allow list']
  },
  {
    hits: [
      [
        'This GitHub App was suspended by GitHub staff on October 1st, 2026 at 00:36 (CST).',
        '此 GitHub 应用已于 2026年10月1日 00:36（CST）被 GitHub 工作人员暂停。'
      ]
    ],
    misses: ['This GitHub App was suspended by GitHub staff.']
  },
  {
    hits: [
      ['Added 3 days ago by octocat', '3天前由 octocat 添加'],
      ['Added yesterday by octocat', '昨天由 octocat 添加']
    ],
    misses: ['Added by octocat']
  },
  {
    hits: [
      ['This will also uninstall the GitHub App from 3 accounts.', '这还会从 3 个帐户中卸载此 GitHub 应用。'],
      ['This will also uninstall the GitHub App from 1 account.', '这还会从 1 个帐户中卸载此 GitHub 应用。']
    ],
    misses: ['This will also uninstall the GitHub App from all accounts.']
  },
  {
    hits: [['Activate optional features for Octo App', '为 Octo App 激活可选功能']],
    misses: ['Activate optional features']
  },
  {
    hits: [['Choose a feature to activate for Octo App:', '选择要为 Octo App 激活的功能：']],
    misses: ['Choose a feature to activate:']
  },
  {
    hits: [
      ['Access: Read-only', '访问权限：只读'],
      ['Access: No access', '访问权限：无权限']
    ],
    misses: ['Access: Write']
  },
  {
    hits: [
      ['Remove Contents', '删除内容'],
      ['Remove Secret scanning alerts', '删除机密扫描警报']
    ],
    misses: ['Remove contents']
  },
  {
    hits: [
      ['Read access to metadata', '读取元数据'],
      ['Read and write access to code, issues, and pull requests', '读写代码、议题和拉取请求'],
      ['Read and Write access to actions', '读写操作'],
      ['Admin access to organization self hosted runners', '管理组织自托管运行器']
    ],
    misses: ['Read access to your account']
  },
  {
    hits: [
      ['access to metadata', '元数据'],
      ['access to code and pull requests', '代码和拉取请求']
    ],
    misses: ['access to everything']
  },
  {
    hits: [
      ['repository permission count', '存储库权限数'],
      ['Label: organization mandatory permission count', '标签：组织必选权限数']
    ],
    misses: ['team permission count']
  },
  {
    hits: [
      ['Learn more about the Push event', '了解推送事件'],
      ['Learn more about the Branch protection rule event', '了解分支保护规则事件']
    ],
    misses: ['Learn more about the Foo event']
  },

  // 预定提醒、审核日志、赞助日志、已删除的存储库
  { hits: [['Updated profile picture for setube-organization', '更新了 setube-organization 的头像']], misses: ['Updated profile picture'] },
  { hits: [["View setube's profile", '查看 setube 的个人资料']], misses: ['View profile'] },
  {
    hits: [
      ['Ignore with 2 or more approvals', '有 2 个或更多批准时忽略'],
      ['Ignore with 1 or more approval', '有 1 个或更多批准时忽略']
    ],
    misses: ['Ignore with approvals']
  },
  {
    hits: [
      ['Found 12 events', '找到 12 个事件'],
      ['Found 1 event', '找到 1 个事件']
    ],
    misses: ['Found no events']
  },
  {
    hits: [
      ['action: filter by action', 'action: 按操作筛选'],
      ['repo: filter by repository', 'repo: 按存储库筛选'],
      ['created: filter by created date', 'created: 按创建日期筛选']
    ],
    misses: ['action: filter by anything', 'Action: filter by action']
  },
  {
    hits: [
      ["This is where you can review activity from octo-org's sponsorships.", '你可以在这里查看 octo-org 的赞助活动。'],
      ['This is where you can review activity from octo-org’s sponsorships.', '你可以在这里查看 octo-org 的赞助活动。']
    ],
    misses: ['This is where you can review activity from your sponsorships.']
  },
  {
    hits: [['No recoverable repositories were found for octo-org.', '未找到 octo-org 可恢复的存储库。']],
    misses: ['No recoverable repositories were found.']
  },
  {
    hits: [
      ['Are you sure you want to restore octo-org/hello-world?', '确定要恢复 octo-org/hello-world 吗？'],
      ['Are you sure you want to restore hello-world?', '确定要恢复 hello-world 吗？']
    ],
    misses: ['Are you sure you want to restore this repository?']
  },
  // 组织角色：分配计数、分页标题、角色说明、分配与移除提示
  { hits: [['2 roles assigned', '已分配 2 个角色']], misses: ['Two roles assigned'] },
  { hits: [['Users 1 of 1', '用户 1/1']], misses: ['Members 1 of 1'] },
  { hits: [['Info about All-repository read', '关于“所有存储库读取”的信息']], misses: ['Info about'] },
  {
    hits: [
      [
        "You're about to remove the direct assignment of the All-repository read role from the 0.0 team.",
        '你即将移除 0.0 团队的“所有存储库读取”角色直接分配。'
      ]
    ],
    misses: ["You're about to remove the direct assignment of the role."]
  },
  {
    hits: [
      [
        "You're about to remove the direct assignment of the All-repository read role from octocat. However, this role will still be assigned through 0.0 team.",
        '你即将移除 octocat 的“所有存储库读取”角色直接分配。该角色仍会通过 0.0 团队分配。'
      ]
    ],
    misses: ['However, this role will still be assigned through the team.']
  },
  {
    hits: [
      [
        'The All-repository read role for octo-org has been removed from the 0.0 team.',
        '已从 0.0 团队移除 octo-org 的“所有存储库读取”角色。'
      ]
    ],
    misses: ['The role has been removed from the team.']
  },
  {
    hits: [
      ['The All-repository read role for octo-org has been removed from octocat.', '已从 octocat 移除 octo-org 的“所有存储库读取”角色。']
    ],
    misses: ['The role has been removed.']
  },
  {
    hits: [['octocat has been assigned the All-repository read role for octo-org.', '已为 octocat 分配 octo-org 的“所有存储库读取”角色。']],
    misses: ['octocat has been assigned the role.']
  },
  {
    hits: [['has been assigned the All-repository read role for', '已获分配以下组织的“所有存储库读取”角色：']],
    misses: ['has been assigned the role']
  },
  {
    hits: [['All-repository read roles have not been assigned to any teams.', '尚未向任何团队分配“所有存储库读取”角色。']],
    misses: ['All-repository read roles have not been assigned to any groups.']
  },
  {
    hits: [['roles have not been assigned to any users.', '角色尚未分配给任何用户。']],
    misses: ['roles have not been assigned to anyone.']
  },
  // 基本权限：项目数
  {
    hits: [['This will change the base permissions for 3 projects.', '这将更改 3 个项目的基本权限。']],
    misses: ['This will change the base permissions for all projects.']
  },
  // 规则集仪表板图表：数据点、数据系列、提示框日期
  { hits: [['Saturday, Nov 14, 2026, 0. Passes.', '2026年11月14日周六，0。通过。']], misses: ['Saturday, Nov 14, 2026, 0. Skips.'] },
  {
    hits: [['Passes, line 1 of 3 with 8 data points.', '通过，第 1 条线（共 3 条），包含 8 个数据点。']],
    misses: ['Skips, line 1 of 3 with 8 data points.']
  },
  { hits: [['Saturday, Nov 14, 2026', '2026年11月14日周六']], misses: ['Someday, Nov 14, 2026'] },
  // 议题字段：标题后半段、选项操作与拖动
  {
    hits: [
      ['/ Effort', '/ 工作量'],
      ['/ Task', '/ 任务']
    ],
    misses: ['/ Custom field']
  },
  {
    hits: [
      ['Open field actions for Urgent', '打开“紧急”的操作'],
      ['Open field actions for Effort', '打开“工作量”的操作']
    ],
    misses: ['Open actions for Urgent']
  },
  {
    hits: [
      ['Move High', '移动“高”'],
      ['Move Effort', '移动“工作量”']
    ],
    misses: ['Move Critical']
  },
  {
    hits: [
      ['Open edit dialog for Urgent', '打开“紧急”的编辑对话框'],
      ['Open edit dialog for Blocker', '打开“Blocker”的编辑对话框']
    ],
    misses: ['Open edit dialog']
  },
  {
    hits: [
      ['Advanced move High...', '高级移动“高”...'],
      ['Advanced move Blocker…', '高级移动“Blocker”…']
    ],
    misses: ['Advanced move High']
  },
  {
    hits: [
      ['Remove Urgent', '移除“紧急”'],
      ['Remove Target date', '移除“目标日期”']
    ],
    misses: ['Remove Blocker']
  },
  // 单选选项的高级移动对话框：移动结果预览（自定义选项名照录）
  { hits: [['High will be first item in the list.', '“高”将成为列表第一项。']], misses: ['High will be first.'] },
  { hits: [['Blocker will be last item in the list.', '“Blocker”将成为列表最后一项。']], misses: ['Low will be last.'] },
  {
    hits: [['Medium will be between Urgent and Low.', '“中”将位于“紧急”和“低”之间。']],
    misses: ['Medium will be between Urgent.']
  },
  // 议题类型：禁用、删除确认（类型名照录）
  {
    hits: [
      [
        'The "Bug" issue type will no longer be available to use. If it is re-enabled in the future, it will be preserved on existing issues of this type unless a different type has been added.',
        '议题类型“Bug”将不再可用。将来重新启用时，此类型的现有议题会保留它，除非已改为其他类型。'
      ]
    ],
    misses: ['The "Bug" issue type will no longer be available to use.']
  },
  {
    hits: [
      [
        'This will remove the "Bug" issue type from all issues. This action cannot be undone.',
        '这将从所有议题中移除议题类型“Bug”。此操作无法撤消。'
      ]
    ],
    misses: ['This will remove the "Bug" issue type from all issues.']
  },
  // 自定义属性：批量设置、删除前的用量检查、匹配数
  { hits: [['Set properties on demo-repository', '设置 demo-repository 的属性']], misses: ['Set properties'] },
  {
    hits: [['2 repositories found that use the property:', '找到 2 个使用此属性的存储库：']],
    misses: ['Some repositories found that use the property:']
  },
  { hits: [['Matching 2 repositories', '匹配 2 个存储库']], misses: ['Matching repositories'] },
  // 议题字段：删除确认
  { hits: [['Delete "Target date" issue field', '删除议题字段“Target date”']], misses: ['Delete issue field'] },
  {
    hits: [
      [
        'This will remove the "Target date" issue field from all of your issues and projects. This action cannot be undone.',
        '这将从你的所有议题和项目中移除议题字段“Target date”。此操作无法撤消。'
      ]
    ],
    misses: ['This will remove the issue field from all of your issues and projects.']
  },
  { hits: [['Please type "Target date" to confirm', '请输入“Target date”以确认']], misses: ['Please type the name to confirm'] },
  // Copilot 代码审查允许列表：删除规则
  { hits: [['Delete rule example.com', '删除规则 example.com']], misses: ['Delete rule for example.com'] },
  // Web 钩子：URL 缺少协议
  { hits: [['example.com is missing a scheme', 'example.com 缺少协议']], misses: ['URL is missing'] },
  // 身份验证安全与代码质量：双因素确认、启用费用、验证码有效期
  {
    hits: [
      [
        'Are you sure you want to require two-factor authentication and only allow secure methods for all users in the octo-org organization?',
        '确定要求 octo-org 组织的所有用户启用双因素身份验证并仅允许安全方式吗？'
      ]
    ],
    misses: ['Are you sure you want to require two-factor authentication?']
  },
  {
    hits: [
      [
        'Are you sure you want to remove the two-factor authentication requirement for the octo-org organization?',
        '确定移除 octo-org 组织的双因素身份验证要求吗？'
      ]
    ],
    misses: ['Are you sure you want to remove the two-factor authentication requirement?']
  },
  {
    hits: [
      [
        'Enabling across 1 repository in this organization will incur additional costs based on:',
        '在此组织的 1 个存储库中启用将根据以下各项产生额外费用：'
      ]
    ],
    misses: ['Enabling across all repositories in this organization will incur additional costs based on:']
  },
  { hits: [['$10 per active committer/month', '每位活跃提交者每月 $10']], misses: ['$10 per user/month'] },
  {
    hits: [['Please note that the code will expire in 7 days.', '请注意，验证码将在 7 天后过期。']],
    misses: ['Please note that the code will expire soon.']
  },
  // 已验证与已批准的域：确认、批准、删除
  { hits: [['Confirm approval of example.com', '确认批准 example.com']], misses: ['Confirm approval of domain'] },
  {
    hits: [['Are you sure you want to approve the domain example.com?', '确定批准域 example.com 吗？']],
    misses: ['Are you sure you want to approve the domain?']
  },
  { hits: [['You approved the domain example.com.', '你已批准域 example.com。']], misses: ['You approved the domain.'] },
  { hits: [['Confirm deleting example.com', '确认删除 example.com']], misses: ['Confirm deleting domain'] },
  {
    hits: [['Are you sure you want to delete the domain example.com?', '确定删除域 example.com 吗？']],
    misses: ['Are you sure you want to delete the domain?']
  },
  { hits: [['Delete example.com', '删除 example.com']], misses: ['Delete the example.com domain'] },
  { hits: [['Approve example.com', '批准 example.com']], misses: ['Approve the example.com domain'] },
  {
    hits: [
      ['Type: Text', '类型：文本'],
      ['Type: Single select', '类型：单选'],
      ['Type: True/false', '类型：真/假']
    ],
    misses: ['Type: Date']
  }
]

/** 合并进来的存储库设置规则集词典，顺序与 org-settings.ts 的合并顺序一致 */
const RULESET_PARTS: readonly PageDictionary[] = [rulesets, rulesetRules, rulesetInsights, rulesetImport]

/** 只含规则集词典的匹配器：合并进来的正则以它的译文为准，规则集改译时本组用例不必同步 */
const rulesetMatcher = createMatcher([['repo-settings', mergeDictionaries(...RULESET_PARTS)]])

function rulesetTranslate(text: string): string | undefined {
  return rulesetMatcher.translate(text, ['common', 'repo-settings'])
}

interface MergedCase {
  /** 正例原文：译文取规则集词典自身的结果 */
  readonly inputs: readonly string[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 合并自存储库设置的规则集正则（rulesets、ruleset-rules、ruleset-insights、ruleset-import），按合并顺序排列 */
const MERGED_CASES: readonly MergedCase[] = [
  {
    inputs: ['6 branch rules', '6 branch rules • targeting 5 repositories', '2 push rules • targeting all pushes'],
    misses: ['Some branch rules', '6 branch rules targeting 1 branch']
  },
  { inputs: ['• targeting 1 branch'], misses: ['• targeting branches'] },
  { inputs: ['3 Copilot code review rules'], misses: ['Copilot code review rules'] },
  { inputs: ['targeting 4 repositories'], misses: ['targeting branches'] },
  { inputs: ['3 repository rulesets', '1 organization ruleset'], misses: ['Some repository rulesets'] },
  { inputs: ['6 rules'], misses: ['Many rules'] },
  { inputs: ['Applies to 3 targets:'], misses: ['Applies to targets:'] },
  { inputs: ['3 targets:'], misses: ['Some targets:'] },
  { inputs: ['Active, Enforcement status', 'Evaluate, Enforcement status'], misses: ['Enforcement status, Active'] },
  { inputs: ['Teams, Filter actors by category'], misses: ['Bots, Filter actors by category'] },
  { inputs: ['- This ruleset will be enforced'], misses: ['- This ruleset will be ignored'] },
  { inputs: ['No roles in bypass list'], misses: ['No bots in bypass list'] },
  { inputs: ['Team • @devs', 'App • octo-org'], misses: ['Team •'] },
  { inputs: ['Branch conditions missing'], misses: ['Conditions missing'] },
  { inputs: ['Example patterns: "main", "releases/**/*".'], misses: ['Example patterns: main, dev.'] },
  { inputs: ['3 values selected'], misses: ['Some values selected'] },
  { inputs: ['View history for the ruleset named main-protection'], misses: ['View history for the ruleset'] },
  { inputs: ['Error importing ruleset: Invalid JSON'], misses: ['Error importing ruleset:'] },
  { inputs: ['Managed by octo-org'], misses: ['Managed by the enterprise', 'Managed by @octo-org'] },
  { inputs: ['As an octo-org admin, you can'], misses: ['As an admin, you can'] },
  {
    inputs: ['manage octo-org rulesets in organization settings.'],
    misses: ['manage rulesets in organization settings.']
  },
  { inputs: ['Commit message must start with a matching pattern'], misses: ['Commit message must be short'] },
  { inputs: ['Merge, Squash'], misses: ['Merge Squash'] },
  { inputs: ['Already added ci/build'], misses: ['Already added'] },
  { inputs: ['Add ci/build'], misses: ['Add some checks'] },
  { inputs: ['Select all (3)'], misses: ['Select all ()'] },
  { inputs: ['2 reviewers'], misses: ['Some reviewers'] },
  { inputs: ['Show +3 more'], misses: ['Show + more'] },
  { inputs: ['+ 4 more'], misses: ['+4 more'] },
  { inputs: ["No teams found for 'core'"], misses: ['No teams found for core'] },
  { inputs: ['File path cannot be empty'], misses: ['File path is invalid'] },
  { inputs: ['2 rulesets passed and 1 ruleset failed'], misses: ['Some rulesets passed'] },
  { inputs: ['2 rules failed'], misses: ['2 rules passed'] },
  { inputs: ['Merge group of 3 pull requests blocked'], misses: ['Merge group blocked'] },
  { inputs: ['triggered a pull_request workflow run'], misses: ['triggered the deploy workflow run'] },
  { inputs: ['Stack position: 2'], misses: ['Stack position: top'] },
  { inputs: ['Final merge failed: Unknown reason'], misses: ['Final merge failed'] },
  { inputs: ['and 2 others.'], misses: ['and others.'] },
  { inputs: ['Found 120 violations (showing first 100)'], misses: ['Found violations'] },
  {
    inputs: ['will be created from 2 branch protection rules.'],
    misses: ['will be created from branch protection rules.']
  },
  {
    inputs: ['3 rulesets will be created. Would you like to delete the 2 original branch protection rules now covered by rulesets?'],
    misses: ['Rulesets will be created.']
  },
  { inputs: ['Create 2 rulesets from "main"'], misses: ['Create rulesets from "main"'] },
  { inputs: ['Create 3 rulesets'], misses: ['Create many rulesets'] },
  {
    inputs: ['This branch protection rule will be split into 3 rulesets.'],
    misses: ['This branch protection rule will be split.']
  },
  { inputs: [', with 2 bypass actors'], misses: [', with bypass actors'] },
  {
    inputs: [
      "You've manually selected 12 repositories. A custom property lets you target them as a group and keeps the list up to date as repositories change."
    ],
    misses: ["You've manually selected repositories."]
  },
  { inputs: ['Ruleset updated to target team value'], misses: ['Ruleset updated to target value'] },
  {
    inputs: [
      'The team property has been created and applied to the 12 selected repositories. You should make sure to set values for the remaining repositories.'
    ],
    misses: ['The property has been created.']
  },
  {
    inputs: ['This property will be set to this value on the 12 selected repositories.'],
    misses: ['This property will be set to this value.']
  },
  { inputs: ['and 5 more'], misses: ['and more'] },
  { inputs: ['Step 1 of 2'], misses: ['Step one of two'] }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MERGED_INPUTS = MERGED_CASES.flatMap(item => item.inputs)
const MISSES = [...REGEXP_CASES, ...MERGED_CASES].flatMap(item => item.misses)

describe('org-settings 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MERGED_INPUTS)('沿用规则集正则，译文与规则集词典一致：%s', input => {
    const expected = rulesetTranslate(input)
    expect(expected).toBeDefined()
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('每条正则都有首个命中它的正例', () => {
    const rules = orgSettings.regexp ?? []
    const inputs = [...HITS.map(([input]) => input), ...MERGED_INPUTS]
    const covered = new Set(inputs.map(input => rules.findIndex(([pattern]) => pattern.test(input))))
    const uncovered = rules.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('正则全部锚定且不带 g / y 标志', () => {
    for (const [pattern] of orgSettings.regexp ?? []) {
      expect(pattern.source.startsWith('^')).toBe(true)
      expect(pattern.source.endsWith('$')).toBe(true)
      expect(pattern.global || pattern.sticky).toBe(false)
    }
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['3', ' of ', '10', ' seats used'].join('')))).toBe('已使用 3/10 个席位')
    expect(translate(normalizeText(['Found ', '12', ' events'].join('')))).toBe('找到 12 个事件')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('5 roles', ['common', 'organization'])).toBeUndefined()
    expect(matcher.translate('Found 12 events', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('octo-team Bypass actor actions', ['common', 'organization'])).toBeUndefined()
  })
})

describe('org-settings 静态词条', () => {
  it.each([
    ['Organization account', '组织帐户'],
    ['Member privileges', '成员权限'],
    ['Authentication security', '身份验证安全'],
    ['Organization display name', '组织显示名称'],
    ['Base permissions', '基本权限'],
    ['Require two-factor authentication for everyone in your organization', '要求组织中的所有人启用双因素身份验证'],
    ['Organization secrets', '组织机密'],
    ['Third-party application access policy', '第三方应用访问策略'],
    ['Export Git events', '导出 Git 事件'],
    ['Disclose actor IP addresses in audit logs', '在审核日志中显示参与者的 IP 地址'],
    ['Only allow secure two-factor methods', '仅允许安全的双因素方法'],
    ['starring, forking, or watching', '加星标、复刻或关注'],
    // 动词 open（issue / pull request）译“创建”
    ['opening or commenting on issues or pull requests', '创建或评论议题和拉取请求'],
    ['Read and clone repositories. Open and comment on issues and pull requests.', '读取和克隆存储库。创建议题和拉取请求并发表评论。'],
    [
      'Temporarily restrict which external users can interact with your repositories (comment, open issues, or create pull requests) for a configurable period of time. Users who are members of this organization will not be affected by these limits.',
      '在可配置的时间段内临时限制哪些外部用户可以与你的存储库交互（评论、创建议题或创建拉取请求）。此组织的成员不受这些限制影响。'
    ],
    ['Restrict email notifications to only approved or verified domains', '仅向已批准或已验证的域发送电子邮件通知'],
    [
      'All codespaces currently owned by your organization will transfer ownership to the creating user.',
      '当前归组织所有的所有代码空间，其所有权将转让给创建者。'
    ],
    // 标签页标题片段（菜单项 Runner groups、Publisher Verification 在 scoped）
    ['General Organization Settings', '常规组织设置'],
    ['Runner Groups', '运行器组'],
    ['GitHub Publisher Verification', 'GitHub 发布者验证'],
    // 待处理的 GitHub 应用安装请求页
    [
      'Members in your organization can request that GitHub Apps be installed. Pending requests are listed below.',
      '你组织中的成员可以请求安装 GitHub 应用。下方列出了待处理的请求。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it.each([
    ['Convert to outside collaborator…', '转换为外部协作者…'],
    ['Role in the organization', '组织中的角色'],
    ['Send invitation', '发送邀请'],
    ['Create new team', '创建新团队'],
    ['Team visibility', '团队可见性'],
    ['A secret team can only be seen by its members and may not be nested.', '机密团队只有其成员可见，且不能嵌套。'],
    ['Enable auto assignment', '启用自动分配'],
    ['View Sync Mismatches', '查看同步不一致项'],
    ['Read about organization OAuth app access restrictions.', '了解组织 OAuth 应用访问限制。'],
    ['Your request to join this team is pending review', '你加入此团队的申请正在等待审查']
  ])('人员、团队、策略页（organization 页面类型）可用：%s → %s', (input, expected) => {
    expect(matcher.translate(input, ['common', 'organization'])).toBe(expected)
  })
})

describe('org-settings 页面词条', () => {
  it.each([
    ['General', '常规'],
    ['Webhooks', 'Web 钩子'],
    ['Secrets and variables', '机密和变量'],
    ['Dependabot alerts', 'Dependabot 警报'],
    ['Actions secrets and variables', '操作机密和变量'],
    ['Fine-grained tokens', '精细令牌'],
    ['Actions permissions', '操作权限'],
    ['Pages', '页面'],
    ['Moderation', '调解'],
    ['Billing and plans', '计费和计划'],
    ['Custom images', '自定义映像'],
    ['Developer settings', '开发人员设置'],
    ['GitHub Apps', 'GitHub 应用'],
    ['Report Abuse', '举报滥用行为'],
    ['Close all open issues, pull requests, and discussions opened by this user', '关闭此用户创建的所有议题、拉取请求和讨论'],
    ['Enforced', '已强制实施'],
    ['Copilot usage metrics', 'Copilot 使用情况指标'],
    ['Dependency insights', '依赖项洞察'],
    ['Metered billing via Azure', '通过 Azure 进行按流量计费'],
    ['Email recipients', '电子邮件收件人'],
    ['Emails', '电子邮件']
  ])('%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it.each([
    // 拉取请求语境的动词 open → 创建
    ['Open a pull request to resolve alerts', '创建拉取请求以解决警报'],
    ['Dependabot will attempt to open security updates based on selected criteria.', 'Dependabot 将根据所选条件尝试创建安全更新。'],
    // secret scanning 语境的 provider → 提供程序
    ['Non-provider patterns', '非提供程序模式'],
    // 2FA 方法 / 双因素方法
    ['Only allow secure two-factor methods', '仅允许安全的双因素方法'],
    [
      'Requiring an additional authentication method adds another level of security for your organization.',
      '要求额外的身份验证方法可以为组织增加一层安全保障。'
    ],
    // email 义 → 电子邮件
    [
      'Members, billing managers, and outside collaborators who do not have two-factor authentication enabled for their personal account will be removed from the organization and will receive an email notifying them about the change.',
      '未在个人帐户上启用双因素身份验证的成员、账单管理员和外部协作者将被移出组织，并会收到通知电子邮件。'
    ],
    [
      'Your enterprise has disabled these emails. This organization’s preference cannot enable them.',
      '你的企业已禁用这些电子邮件。此组织的首选项无法启用。'
    ],
    // 非可见性义的 private / public → 私密 / 公开
    ['Access private organization data via the API or SSH.', '通过 API 或 SSH 访问私密组织数据。'],
    ['Change public organization data.', '更改公开组织数据。'],
    ['Receive webhooks for private events.', '接收私密事件的 Web 钩子。'],
    // read access / write access → 读取访问权限 / 写入访问权限
    ['Grants read access to all repositories in the organization.', '授予组织内所有存储库的读取访问权限。'],
    ['Grants write access to all repositories in the organization.', '授予组织内所有存储库的写入访问权限。'],
    ['Allow users with read access to create discussions', '允许拥有读取访问权限的用户创建讨论'],
    [
      'Fork pull requests from users without write access will require approval to run workflows.',
      '来自无写入访问权限用户的复刻拉取请求需要批准才能运行工作流。'
    ],
    ['Grants triage access to all repositories in the organization.', '授予组织内所有存储库的分类权限。'],
    // base → 基本（与 Base permissions → 基本权限 一致）
    ['Base role', '基本角色'],
    ['Base repository role', '基本存储库角色'],
    ['No base repository role', '无基本存储库角色'],
    ['Active jobs', '活动作业'],
    // Patreon：connect → 连接
    ['Disconnect Patreon', '断开 Patreon 连接'],
    ['This allows members to start discussions in any team in the', '这将允许成员在以下组织的任何团队中开始讨论'],
    // metered → 按流量计费
    [
      'By clicking “Connect”, you are confirming that you want to be billed for metered services via the selected Azure subscription',
      '单击“连接”即表示你确认通过所选 Azure 订阅支付按流量计费服务的费用'
    ],
    // Azure 订阅：connect → 连接，断开同用“连接”
    ['Disconnect the subscription', '断开订阅连接'],
    // Active → 活动（官方界面名“活动令牌”）
    ['Active tokens', '活动令牌'],
    ['Filter active fine-grained tokens', '筛选活动的精细令牌'],
    // membership → 成员身份
    ['Organization membership', '组织成员身份'],
    // enforce → 强制实施
    ["Organization rulesets won't be enforced", '组织规则集不会强制实施'],
    // 赞助语境的 updates → 动态（标签与说明同译）
    ['Sponsors update email', '赞助动态电子邮件'],
    [
      'The developers and organizations that your organization sponsors can send you updates to this email.',
      '你的组织赞助的开发者和组织可以向此电子邮件地址发送动态。'
    ],
    // 非可见性义的 private → 私密（与“私密电子邮件”一致）
    ['(Private)', '（私密）'],
    ['Billing email (Private)', '计费电子邮件（私密）'],
    ['Gravatar email (Private)', 'Gravatar 电子邮件（私密）'],
    ['Sponsors update email (Private)', '赞助动态电子邮件（私密）'],
    // 角色分配页无 Delete：remove → 删除（按钮、确认句、提示同译）
    ['Remove assignment', '删除分配'],
    ['Are you sure you want to remove this role assignment?', '确定要删除此角色分配吗？'],
    ['Role removed', '已删除角色']
  ])('术语统一：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it.each([
    // 与 projects/settings.ts 同句一致
    ['Unexpected bad things will happen if you don’t read this!', '不读完以下内容可能会造成意想不到的后果！'],
    ["Unexpected bad things will happen if you don't read this!", '不读完以下内容可能会造成意想不到的后果！'],
    // 与 repo-settings/secrets.ts、settings-developer/codespaces.ts 同句一致
    ['Secret values are encrypted and cannot be displayed, but you can', '机密值已加密且无法显示，但你可以'],
    // 与 settings-developer/moderation.ts 的个人交互限制句一致
    [
      'Users that have not previously committed to the default branch of a repository in this organization will be unable to interact with that repository.',
      '从未向此组织中某存储库默认分支提交过的用户将无法与该存储库交互。'
    ],
    [
      'Users that are not collaborators of a repository in this organization will not be able to interact with that repository.',
      '不是此组织中某存储库协作者的用户将无法与该存储库交互。'
    ],
    // 整句与拆分片段拼读结果一致
    ['Add more billing email recipients in the billing page.', '如需添加更多计费电子邮件收件人请前往计费页面。']
  ])('不加原文没有的逗号：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('计费电子邮件说明三段拼读后与整句译文一致', () => {
    // 「Add more billing email recipients in the」+ <a>billing page</a> +「.」；孤立的「.」由引擎转为「。」
    const parts = ['Add more billing email recipients in the', 'billing page'].map(part => translate(part))
    expect(`${parts.join('')}。`).toBe(translate('Add more billing email recipients in the billing page.'))
  })

  it.each([
    [
      'Note: this won’t assign members who have committed to the pull request or have set their status to Busy.',
      '注意：不会分配已向该拉取请求提交过代码或状态设为忙碌的成员。'
    ],
    [
      'By clicking Delete memories, you confirm you have permission to perform this action on behalf of these users.',
      '单击删除记忆即表示你确认有权代表这些用户执行此操作。'
    ],
    [
      'All discussions on the source repository will be surfaced to the organization Discussions tab.',
      '源存储库中的所有讨论都将显示在组织的讨论标签页中。'
    ],
    ["` to your workflow's YAML to send jobs to this runner.", '` 添加到工作流 YAML 即可将作业发送到此运行器。'],
    ['` to your workflow’s YAML to send jobs to GitHub-hosted runners.', '` 添加到工作流 YAML 即可将作业发送到 GitHub 托管的运行器。'],
    // 原文两句之间是句号，译文不改成逗号
    ['Something went wrong creating your request. Please try again.', '创建请求时出错。请重试。'],
    ["We couldn't delete these memories. Please try again later.", '无法删除这些记忆。请稍后重试。'],
    ['Repository forking setting not updated. Please try again.', '存储库复刻设置未更新。请重试。'],
    ['I understand. Downgrade my organization', '我已了解。降级我的组织'],
    ['This action cannot be undone. Deleted memories cannot be recovered.', '此操作无法撤销。删除的记忆无法恢复。'],
    ["You can't remove yourself from the organization. Have another admin do this for you.", '无法将自己移出组织。请让其他管理员操作。'],
    ['Once deleted, it will be gone forever. Please be certain.', '删除后将无法恢复。请谨慎操作。'],
    ['You are about to delete all excluded paths. Are you sure you want to proceed?', '你即将删除所有排除路径。确定要继续吗？'],
    ['You may also drag and drop an image from your computer. The image must be less than 1MB.', '也可以从电脑拖放图片。图片须小于 1MB。'],
    ['Select at least one repository. Also includes public repositories (read-only).', '至少选择一个存储库。同时包括公共存储库（只读）。'],
    [
      'Variable name can only contain alphanumeric characters. Special characters and spaces are not allowed.',
      '变量名称只能包含字母数字字符。不允许特殊字符和空格。'
    ],
    [
      'If enabled, any member of the organization will be able to create new teams. If disabled, only organization owners can create new teams.',
      '启用后，组织的任何成员都可以创建新团队。禁用后，只有组织所有者可以创建新团队。'
    ],
    [
      'repositories. If disabled, only organization owners can delete or transfer repositories.',
      '存储库。禁用后，只有组织所有者可以删除或转让存储库。'
    ],
    [". Refresh to see if it's done.", '。刷新页面查看是否完成。'],
    // 分句间的破折号译“——”，不改成逗号
    [
      'will get Copilot access automatically within 24 hours — no action needed. Need it sooner? Pay now.',
      '将在 24 小时内自动获得 Copilot 访问权限——无需任何操作。需要更快？请立即付款。'
    ],
    // 原文无标点、无逗号的句子与片段，译文不加
    [
      'Restrict access to your organization’s assets by configuring a list of IP addresses that are allowed to connect',
      '配置允许连接的 IP 地址列表以限制对组织资产的访问'
    ],
    ['Push Protection will run and the selected actor(s) will be prompted to bypass', '推送保护会运行并向所选参与者显示绕过提示'],
    ['All repositories, excluding public repositories', '所有存储库，不含公共存储库'],
    ['to run against your code.', '用于对你的代码运行。'],
    ['and are used for sensitive data.', '并用于敏感数据。'],
    ['. Variables are shown as plain text and are used for', '。变量以纯文本显示并用于'],
    ['and approve of these terms on behalf of your organization.', '并代表你的组织批准这些条款。'],
    ['and is billed at the enterprise level.', '并在企业级别计费。'],
    ['and need to be unarchived separately.', '状态并需要分别取消存档。'],
    // 「Check out the Developer site」+「for guides, …」：片段开头不加逗号
    [
      'for guides, our API reference, and other resources for building applications that integrate with GitHub. Make sure your contact information is up-to-date below. Thanks for being a member!',
      '以获取指南、API 参考以及构建 GitHub 集成应用的其他资源。请确保下方联系信息是最新的。感谢你的加入！'
    ],
    // 原文一句不拆成两句；原文四句不并成逗号句
    [
      'This group cannot be deleted and new runners will be automatically assigned to this group if no other group is specified.',
      '此组无法删除，未指定其他组时新运行器将自动分配到此组。'
    ],
    [
      'Failed to add secret. Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).',
      '无法添加机密。机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。'
    ],
    // 原文本身有逗号的保留
    ['Failed to update setting, please try again later.', '无法更新设置，请稍后重试。']
  ])('标点随原文（原文无引号、无逗号处译文不加）：%s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('试用说明三段拼读后不加原文没有的逗号', () => {
    // <p>「Your trial includes all Secret Protection and Code Security」<a>features</a><span>for repositories in your organization.</span></p>
    const parts = ['Your trial includes all Secret Protection and Code Security', 'features', 'for repositories in your organization.'].map(
      part => translate(part)
    )
    expect(parts.join('')).toBe('试用为组织中的存储库提供所有机密保护和代码安全功能。')
  })

  it('存储库角色说明三段拼读后不加原文没有的逗号', () => {
    // 「You can」+「set the base role」+「for this organization from one of these roles.」
    const parts = ['You can', 'set the base role', 'for this organization from one of these roles.'].map(part => translate(part))
    expect(parts.join('')).toBe('你可以设置组织的基本角色为以下角色之一。')
  })

  it.each([
    // 侧栏、标签页、产品行里单独出现的产品名译成中文（product-names.md）
    ['Actions', '操作'],
    ['Codespaces', '代码空间'],
    ['Advanced Security', '高级安全'],
    // 复合词、带 GitHub 前缀的全名同样译出
    ['General actions permissions', '常规操作权限'],
    ['Codespaces access', '代码空间访问权限'],
    ['Manage organization Actions secrets', '管理组织操作机密'],
    ['Dependabot on Actions runners', '操作运行器上的 Dependabot'],
    ['Code Quality licenses', '代码质量许可证'],
    ['Preview cost and enable Secret Protection', '预览费用并启用机密保护'],
    ['Choose which repositories are permitted to use GitHub Actions.', '选择允许使用 GitHub 操作的存储库。'],
    ['Manage GitHub Actions general settings', '管理 GitHub 操作常规设置'],
    ['Manage GitHub Pages settings', '管理 GitHub 页面设置'],
    ['Update GitHub Codespaces ownership settings?', '更新 GitHub 代码空间所有权设置？'],
    ['Codespace policies', '代码空间策略'],
    ['New codespace secret', '新建代码空间机密'],
    ['Maximum codespaces per user', '每个用户的代码空间数量上限'],
    ['Allow actions by Marketplace verified creators', '允许市场已验证创建者的操作'],
    ['Purchase, edit, or cancel Marketplace subscriptions', '购买、编辑或取消市场订阅'],
    ['Copilot Autofix for vulnerabilities', '针对漏洞的 Copilot 自动修复'],
    ['set up redirects for Pages sites.', '为页面站点设置重定向。'],
    ['Pages creation', '页面创建'],
    // 品牌词、技术缩写保留
    ['Enable GitHub Copilot', '启用 GitHub Copilot'],
    ['Allow use of Copilot CLI billed to the organization', '允许使用计费到组织的 Copilot CLI'],
    // 计划名译成中文，品牌前缀保留
    ['Upgrade to Enterprise', '升级到企业版'],
    ['Upgrade to GitHub Team', '升级到 GitHub 团队版'],
    ['Downgrade to GitHub Free', '降级到 GitHub 免费版'],
    ['GitHub Enterprise', 'GitHub 企业版'],
    ['Copilot Business', 'Copilot 商业版'],
    ['Only available on paid Team or Enterprise plans', '仅适用于付费的团队版或企业版计划'],
    ['Team & Enterprise', '团队版和企业版'],
    ['Copilot Enterprise is active in your organization', '你的组织已启用 Copilot 企业版'],
    ['Try it in a 30-day trial of GitHub Enterprise.', '可在 GitHub 企业版 30 天试用中体验。']
  ])('产品名、计划名译成中文：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('没有中文名的品牌与计划外的 Team / Enterprise 不受影响', () => {
    expect(translate('Copilot')).toBeUndefined()
    expect(translate('Dependabot')).toBeUndefined()
    expect(translate('Shared by the Enterprise')).toBe('由企业共享')
    expect(translate('Team discussions')).toBe('团队讨论')
  })

  it('Code Security、Secret Protection、Code Quality 由 common 全局收录，本区不重复', () => {
    for (const name of ['Code Security', 'Secret Protection', 'Code Quality']) {
      expect(dict.static?.[name], name).toBeUndefined()
      expect(dict.scoped?.[name], name).toBeUndefined()
    }
  })

  it('本组译文不再保留英文产品名（品牌词、技术缩写除外；沿用的规则集、个人开发人员设置词条不计）', () => {
    const banned =
      /GitHub (?:Actions|Codespaces|Advanced Security|Pages|Sponsors)|codespace|Marketplace|Copilot (?:Autofix|coding agent|cloud agent|Chat)/i
    const foreign: PageDictionary[] = [...RULESET_PARTS, developerApps, developerPermissions]
    const foreignKeys = new Set(foreign.flatMap(part => [...Object.keys(part.static ?? {}), ...Object.keys(part.scoped ?? {})]))
    const foreignRules = new Set(foreign.flatMap(part => part.regexp ?? []))
    const own = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})].filter(([key]) => !foreignKeys.has(key))
    const ownRules = (orgSettings.regexp ?? []).filter(rule => !foreignRules.has(rule))
    const values = [
      ...own.map(([, value]) => value),
      ...ownRules.map(([, replacement]) => (typeof replacement === 'string' ? replacement : ''))
    ]
    expect(values.filter(value => banned.test(value))).toEqual([])
  })

  it('Password 由 auth 全局收录，本区不重复', () => {
    expect(dict.static?.Password).toBeUndefined()
    expect(dict.scoped?.Password).toBeUndefined()
  })

  it('/orgs/<组织>/settings 同时带 organization 时仍优先使用本区 scoped', () => {
    expect(matcher.translate('General', ['common', 'organization', 'org-settings'])).toBe('常规')
  })

  it.each(['6 branch rules • targeting 5 repositories', 'Active', 'Evaluate', 'Exempt', 'Applies to', 'Blocked'])(
    '组织规则集页沿用存储库规则集的 scoped 与正则：%s',
    input => {
      const expected = rulesetTranslate(input)
      expect(expected).toBeDefined()
      expect(translate(input)).toBe(expected)
    }
  )

  it('与规则集同形的本组短词', () => {
    expect(translate('Active')).toBe('活动')
    expect(translate('Applies to')).toBe('适用于')
    expect(translate('repositories only')).toBe('存储库')
    expect(translate('Blocked')).toBe('已阻止')
    expect(translate('Allowed')).toBe('已允许')
  })

  it('合并进来的规则集词条未被本组子词典覆盖', () => {
    for (const part of RULESET_PARTS) {
      for (const [key, value] of Object.entries(part.static ?? {})) expect(dict.static?.[key], key).toBe(value)
      for (const [key, value] of Object.entries(part.scoped ?? {})) expect(dict.scoped?.[key], key).toBe(value)
      for (const rule of part.regexp ?? []) expect(orgSettings.regexp).toContain(rule)
    }
  })

  it.each([
    ['Artifact metadata', '产物元数据'],
    ['Organization IP allow list', '组织 IP 允许列表'],
    ['Branch protection rule', '分支保护规则'],
    ['Watching', '关注'],
    ['Advanced', '高级'],
    ['Read and write', '读写']
  ])('开发人员设置沿用个人开发人员设置：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('权限名 Watching 单独出现与拼接时同译“关注”', () => {
    expect(translate('Watching')).toBe('关注')
    expect(translate('Remove Watching')).toBe('删除关注')
  })

  it('开发人员设置不覆盖组织设置页现有译法', () => {
    expect(dict.scoped?.['Required']).toBeUndefined()
    expect(dict.scoped?.['Added']).toBeUndefined()
    expect(dict.scoped?.['all']).toBeUndefined()
  })

  it('不收录 We（重命名警告句首与日期选择器星期表头同形）', () => {
    expect(dict.static?.We).toBeUndefined()
    expect(dict.scoped?.We).toBeUndefined()
    expect(translate('We')).toBeUndefined()
  })

  it.each([
    ['Consumed licenses', '已用许可证'],
    ['Estimated monthly payment', '预计每月付款'],
    ['Buy Advanced Security', '购买高级安全'],
    ['Disable Advanced Security for this organization', '为此组织禁用高级安全'],
    ['Trial expired', '试用已过期'],
    ['No actors have been selected', '尚未选择参与者'],
    ['At least one actor is required.', '至少需要一个参与者。']
  ])('许可页、推送保护绕过列表：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('Select repository 由 common-ui 统一收录，本区不重复', () => {
    expect(dict.static?.['Select repository']).toBeUndefined()
    expect(dict.scoped?.['Select repository']).toBeUndefined()
  })

  it('新建属性表单的 Type 标签译作“类型”；全局搜索提示「Type <kbd>/</kbd> to search」由 common 整句收录，不受影响', () => {
    expect(dict.static?.Type).toBeUndefined()
    expect(translate('Type')).toBe('类型')
    const full = createMatcher(zhCN)
    expect(full.translate('Type / to search', ['common', 'org-settings'])).toBe('按 / 搜索')
  })

  it('Dependabot 规则「目标警报」自动补全里的筛选取值照原文（要原样输入查询，只译分组标题）', () => {
    for (const value of ['critical', 'high', 'moderate', 'low', 'runtime']) {
      expect(translate(value), value).toBeUndefined()
    }
    expect(translate('Severities')).toBe('严重性')
    expect(translate('Scopes')).toBe('范围')
  })

  it.each([
    ['Target alerts', '目标警报'],
    ['Add rule metadata', '添加规则元数据'],
    ['Rule name', '规则名称'],
    ['Rules will be applied for alerts matching all included metadata.', '规则将应用于匹配所有已包含元数据的警报。'],
    ['Until patch is available', '直到有可用补丁'],
    ['Edit curated rule', '编辑精选规则'],
    ['/ GitHub Preset rule', '/ GitHub 预设规则'],
    ['Indefinitely', '无限期'],
    ['New rule', '新建规则'],
    ['/ New rule', '/ 新建规则'],
    ['Rules', '规则']
  ])('Dependabot 规则页抽出共用词条后译法不变：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('GitHub 预设规则说明：开发环境既非生产、也非运行时（与繁体同义）', () => {
    expect(
      translate(
        'In a developer (non-production or runtime) environment, these alerts are unlikely to be exploitable or have limited effect like slow builds or long-running tests.'
      )
    ).toBe('在开发环境（非生产、非运行时）中，这些警报不太可能被利用，影响也有限，例如构建变慢或测试耗时较长。')
  })

  it('Dependabot 规则页的共用词条仍只放组织设置的 scoped，正则照旧收录', () => {
    const shared = Object.entries(DEPENDABOT_RULES_SCOPED)
    expect(shared.length).toBeGreaterThan(0)
    for (const [key, value] of shared) {
      expect(dict.static?.[key], key).toBeUndefined()
      expect(dict.scoped?.[key], key).toBe(value)
    }
    // 存储库设置另有收录的三条留在组织设置本区
    for (const key of ['New rule', '/ New rule', 'Rules']) {
      expect(Object.hasOwn(DEPENDABOT_RULES_SCOPED, key), key).toBe(false)
      expect(dict.scoped?.[key], key).toBeDefined()
    }
    for (const rule of DEPENDABOT_RULES_REGEXP) expect(orgSettings.regexp).toContain(rule)
  })

  it.each([
    ['Block a user', '阻止用户'],
    ['All blocked users', '所有已阻止的用户'],
    ['Block user from organization', '在组织中阻止用户'],
    ['Blocked users', '已阻止的用户'],
    ['Blocked by', '阻止者'],
    ['Blocked until', '阻止截止'],
    ['Date blocked', '阻止日期'],
    ['Block settings', '阻止设置'],
    ['Until unblocked', '直到取消阻止']
  ])('block 译“阻止”：%s → %s', (input, expected) => {
    expect(translate(input)).toBe(expected)
  })

  it('阻止用户页与个人设置共用的原文译法一致', () => {
    const own: PageDictionary = moderation
    const account: PageDictionary = accountModeration
    const shared = Object.keys(account.scoped ?? {}).filter(key => Object.hasOwn(own.scoped ?? {}, key))
    expect(shared.length).toBeGreaterThan(0)
    for (const key of shared) expect(own.scoped?.[key], key).toBe(account.scoped?.[key])
    const accountRules = new Map((account.regexp ?? []).map(([pattern, replacement]) => [pattern.source, replacement]))
    for (const [pattern, replacement] of own.regexp ?? []) {
      const other = accountRules.get(pattern.source)
      if (typeof other === 'string') expect(replacement, pattern.source).toBe(other)
    }
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('General', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Secrets and variables', ['common', 'organization'])).toBeUndefined()
  })
})

describe('org-settings 页面渲染', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function run(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({
      matcher,
      host: window,
      resolvePages: () => ['common', 'org-settings'],
      collectUntranslated: true
    })
    translator.start()
  }

  it('许可页试用说明：片段间不加原文没有的逗号，句号前不留空白', () => {
    // 结构同 licensing-app StartTrialDialog：文本 +{' '}+ <Link>features</Link> +{' '}+ <span>…</span>
    run(
      '<p class="mb-0">Your trial includes all Secret Protection and Code Security <a href="#">features</a> <span>for repositories in your organization.</span></p>'
    )
    const paragraph = document.querySelector('p')!
    expect(paragraph.querySelector('a')?.textContent).toBe('功能')
    expect(paragraph.querySelector('span')?.textContent).toBe('。')
    expect(paragraph.textContent?.replace(/\s+/g, '')).toBe('试用为组织中的存储库提供所有机密保护和代码安全功能。')
    expect(paragraph.textContent).not.toMatch(/\s。|，/)
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('部署密钥说明：两个链接前后的文字按文本节点翻译', () => {
    // 结构同组织设置 · 部署密钥页（句型超过 300 字符，不走 inline）
    run(
      '<p> Deploy keys use an SSH key to grant readonly or write access to a single repository. If you have a more complex project or want more fine-grain control over permissions, consider using a GitHub App instead. For more information, see <a class="Link--inTextBlock">the GitHub Apps documentation</a>. Please note that deploy keys are not protected by a passphrase and can be a security risk if your server is compromised. For more information on deploy keys, see <a class="Link--inTextBlock">managing deploy keys</a>. </p>'
    )
    const paragraph = document.querySelector('p')!
    expect(paragraph.textContent?.trim()).toBe(
      '部署密钥使用 SSH 密钥授予对单个存储库的只读或写入权限。如果项目更复杂或需要更细粒度的权限控制，请考虑改用 GitHub 应用。详情请参阅 GitHub 应用文档。请注意，部署密钥不受密码短语保护，服务器遭入侵时可能带来安全风险。有关部署密钥的详细信息，请参阅 管理部署密钥。'
    )
    expect(translator?.drainUntranslated()).toEqual([])
  })

  it('要求双因素身份验证的确认说明：组织名与链接之间的文字按文本节点翻译', () => {
    run(
      '<p> Organization members who do not have two-factor authentication enabled will be unable to access resources owned by the <strong>octo-org</strong> organization, but will remain a member of <strong>octo-org</strong> until they update their settings. Outside collaborators who do not have two-factor authentication enabled will be removed from the organization and notified. <a class="Link--inTextBlock">View organization membership</a> to see which users will be impacted. </p>'
    )
    expect(document.querySelector('p')!.textContent?.trim()).toBe(
      '未启用双因素身份验证的组织成员将无法访问 octo-org 组织拥有的资源，但在更新设置之前仍是 octo-org 的成员。未启用双因素身份验证的外部协作者将被移出组织并收到通知。查看组织成员资格 以查看哪些用户会受影响。'
    )
    // 组织名是用户内容，不计入未翻译
    expect(translator?.drainUntranslated().map(([text]) => text)).toEqual(['octo-org'])
  })

  it.each([
    ['created', '创建了'],
    ['updated', '更新了'],
    ['deleted', '删除了']
  ])('审核日志的预算事件：Budget was %s → %s预算', (action, translated) => {
    // 结构同审核日志条目；动作词与规则集洞察共用 scoped
    run(
      `<div> Budget was <strong>${action}</strong> with a limit of <span class="context">0</span> (<span class="context">PreventFurtherUsage</span>). <span>Budget alerts are enabled.</span> </div>`
    )
    expect(document.querySelector('div')!.textContent?.trim()).toBe(`${translated}预算，限额为 0（PreventFurtherUsage）。预算警报已启用。`)
  })

  it.each([
    [
      '双因素要求（开头是登录名纯文本）',
      'setube removed secure two-factor requirement for <a class="Link--inTextBlock">octo-org</a> organization.',
      'setube 移除了 octo-org 组织的安全双因素要求。'
    ],
    [
      '令牌有效期（开头的 strong 是参与者）',
      '<strong>setube</strong> changed personal access tokens (classic) maximum lifetime from 7 days to 366 days (Not exempting administrators)',
      'setube 将个人访问令牌（经典）的最长有效期从 7 天改为 366 天（不豁免管理员）'
    ],
    [
      '令牌访问限制',
      '<strong>setube</strong> has restricted access via fine-grained personal access tokens to the organization',
      'setube 已限制通过精细个人访问令牌访问组织'
    ],
    [
      '域（域名是纯文本）',
      'Removed the example.com domain from the <a class="Link--inTextBlock">octo-org</a> organization.',
      '从 octo-org 组织中移除了域 example.com。'
    ],
    [
      'Dependabot 规则',
      'Force disabled Dependabot rule "Dismiss package malware alerts" for <span class="context"><a class="Link--inTextBlock">octo-org</a></span>',
      '为 octo-org 强制禁用了 Dependabot 规则“消除软件包恶意软件警报”'
    ],
    [
      '复刻拉取请求审批策略（槽位取值也译）',
      'Set policy to require approval for fork pull request workflows from <span class="context">all outside collaborators</span> for <span class="context"><a class="Link--inTextBlock">octo-org</a></span>.',
      '将策略设为来自 所有外部协作者 的复刻拉取请求工作流需经批准，适用于 octo-org。'
    ],
    [
      '组织角色（三个槽位顺序不变）',
      'unassigned <strong class="context"> themselves </strong> from the <strong class="context"> all_repo_read</strong> organization role in the <span class="context">octo-org</span> organization',
      '将 自己 从 all_repo_read 组织角色中取消分配 于 octo-org 组织'
    ]
  ])('审核日志事件说明：%s', (_, html, expected) => {
    run(`<div> ${html} </div>`)
    expect(document.querySelector('div')!.textContent?.replace(/\s+/g, ' ').trim()).toBe(expected)
  })

  it('审核日志条目展开后的原始字段表照原文', () => {
    // private 在组织设置页面类型下译作“专用”，字段表里不译
    run('<table class="entry-details-table"><tbody><tr><th>visibility</th><td> private </td></tr></tbody></table><p>private</p>')
    expect(document.querySelector('td')!.textContent?.trim()).toBe('private')
    expect(document.querySelector('p')!.textContent).toBe('专用')
  })
})

describe('org-policies 存储库策略页', () => {
  const policyMatcher = createMatcher([
    ['org-settings', orgSettings],
    ['org-policies', orgPolicies]
  ])
  const twMatcher = createMatcher(zhTW)
  const POLICY_PAGES: PageKey[] = ['common', 'org-settings', 'org-policies']
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each([
    ['0 repositories matching', '0 个匹配的存储库', '0 個符合的儲存庫'],
    ['1 repository matching', '1 个匹配的存储库', '1 個符合的儲存庫'],
    ['Add a filter using the input to match repositories.', '在输入框中添加筛选器以匹配存储库。', '使用輸入框新增篩選器以比對儲存庫。'],
    [
      'No filter added. Add a filter using the input to match repositories.',
      '未添加筛选器。在输入框中添加筛选器以匹配存储库。',
      '未新增篩選器。使用輸入框新增篩選器以比對儲存庫。'
    ],
    // 目标存储库筛选框与存储库列表筛选框同一组件，沿用 organization/repos-filter
    ['Exclude visibility', '排除可见性', '排除可見度'],
    ['Filter contains 1 issue:', '筛选器有 1 处错误：', '篩選器有 1 處錯誤：']
  ])('%s → %s / %s', (input, cn, tw) => {
    expect(policyMatcher.translate(input, POLICY_PAGES)).toBe(cn)
    expect(twMatcher.translate(input, POLICY_PAGES)).toBe(tw)
  })

  it('筛选框词条不在其他组织设置页生效', () => {
    expect(policyMatcher.translate('0 repositories matching', ['common', 'org-settings'])).toBeUndefined()
    expect(policyMatcher.translate('Exclude visibility', ['common', 'org-settings'])).toBeUndefined()
  })

  it('匹配计数的数量、名词、matching 是相邻文本节点，整体翻译', () => {
    document.body.innerHTML = '<div id="count"></div><ul><li id="issue">Empty value for <code>visibility</code></li></ul>'
    document.getElementById('count')!.append('0', ' repositories', ' matching')
    translator = createTranslator({ matcher: policyMatcher, host: window, resolvePages: () => POLICY_PAGES })
    translator.start()
    expect(document.getElementById('count')!.textContent).toBe('0 个匹配的存储库')
    expect(document.getElementById('issue')!.textContent).toBe('以下筛选器的值为空 visibility')
  })
})

describe('org-settings 繁体（zh-TW 语言包）', () => {
  const twMatcher = createMatcher(zhTW)

  it.each([
    // 标签页标题片段
    ['General Organization Settings', '一般組織設定'],
    ['Runner Groups', '執行器群組'],
    ['GitHub Publisher Verification', 'GitHub 發行者驗證'],
    // 待处理的 GitHub 应用安装请求页
    [
      'Members in your organization can request that GitHub Apps be installed. Pending requests are listed below.',
      '你組織中的成員可以請求安裝 GitHub 應用程式。下方列出了待處理的請求。'
    ],
    // 组织计费页的 SKU 名（regexp 在 org-settings/billing.ts，static 由个人计费收录）
    ['Actions macOS 3-core', '動作 macOS 3 核心'],
    ['Codespaces compute 2-core', '程式碼空間的運算 2 核心'],
    ['Copilot Premium Request', 'Copilot 進階請求'],
    // Dependabot 规则页（抽出与存储库设置共用的词条后译法不变）
    ['Target alerts', '目標警示'],
    ['Add a rule name', '輸入規則名稱'],
    ['GitHub presets', 'GitHub 預設集'],
    ['Indefinitely', '無限期'],
    ['New rule', '新增規則'],
    ['3 rules enabled', '已啟用 3 個規則'],
    [
      'This will permanently delete the rule "Sample text" and potentially reopen associated alerts.',
      '這會永久刪除規則「Sample text」並可能重新開啟關聯的警示。'
    ],
    // 安全设置页「Dependabot rules」行的齿轮按钮（static 在 repo-settings/security.ts）
    ['Configure Dependabot rules', '設定 Dependabot 規則'],
    // 推送保护绕过列表标题（与存储库设置同译）
    ['3 actors', '3 個執行者'],
    // 议题类型页
    ['3 types (max 25)', '3 個類型（最多 25 個）'],
    ['What is this type for?', '這個類型的用途是什麼？'],
    ['A request, idea, or new functionality', '請求、構想或新功能'],
    ['1 actor', '1 個執行者'],
    // 绕过列表每行菜单按钮的读屏名称（与存储库设置同译）：内置角色与兜底词用译名，其余名称原样保留；
    // 不带名称的提示文字由规则集 static 收录
    ['octo-team Bypass actor actions', '可繞過的執行者 octo-team 的動作'],
    ['Organization admin Bypass actor actions', '可繞過的執行者組織管理員的動作'],
    ['admin Bypass actor actions', '可繞過的執行者管理員的動作'],
    ['Unknown Bypass actor actions', '可繞過的執行者未知的動作'],
    ['constructor Bypass actor actions', '可繞過的執行者 constructor 的動作'],
    ['Bypass actor actions', '可繞過執行者的動作']
  ])('%s → %s', (input, expected) => {
    expect(twMatcher.translate(input, ['common', 'org-settings'])).toBe(expected)
  })

  it('绕过列表每行菜单按钮的读屏名称首尾锚定，不在组织其他页面生效', () => {
    for (const input of ['octo-team Bypass actor', 'octo-team Bypass actor actions menu', 'Bypass actor actions for octo-team']) {
      expect(twMatcher.translate(input, ['common', 'org-settings']), input).toBeUndefined()
    }
    expect(twMatcher.translate('octo-team Bypass actor actions', ['common', 'organization'])).toBeUndefined()
  })

  it('Dependabot 规则页的共用词条逐条生效，正则照旧收录', () => {
    const shared = Object.entries(TW_DEPENDABOT_RULES_SCOPED)
    expect(shared.length).toBeGreaterThan(0)
    for (const [key, value] of shared) {
      expect(twMatcher.translate(key, ['common', 'org-settings']), key).toBe(value)
    }
    for (const rule of TW_DEPENDABOT_RULES_REGEXP) expect(twOrgSettings.regexp).toContain(rule)
  })
})

describe.each([
  ['zh-CN', zhCN, ['编辑软件包', '预算金额', '移除 octocat', '显示 octo-org/hello-world', '隐藏其他', '显示软件包', '显示 constructor']],
  ['zh-TW', zhTW, ['編輯套件', '預算金額', '移除 octocat', '顯示 octo-org/hello-world', '隱藏其他', '顯示套件', '顯示 constructor']]
])('计费页的预算表单与使用情况图表（%s）', (_, bundle, expected) => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('面包屑、金额标签、收件人移除按钮与图例切换按钮译出；用户名、存储库名照录；stop 后还原', () => {
    const legend = ['octo-org/hello-world', 'All other', 'Packages', 'constructor']
    document.body.innerHTML = [
      '<nav><ol><li><a id="crumb" href="#">Edit Packages</a></li></ol></nav>',
      '<label id="amount" class="prc-components-Label-2mrqP">BudgetAmountInput</label>',
      '<ul><li class="listItem__Uo4JIa"><p>octocat</p><button id="remove" aria-label="Remove octocat"></button></li></ul>',
      '<div class="highcharts-a11y-proxy-group highcharts-a11y-proxy-group-legend"><ul>',
      ...legend.map(
        (name, index) =>
          `<li><button class="highcharts-a11y-proxy-element" id="legend-${index}" aria-label="${index === 1 ? 'Hide' : 'Show'} ${name}"></button></li>`
      ),
      '</ul></div>'
    ].join('')
    translator = createTranslator({ matcher: createMatcher(bundle), host: window, resolvePages: () => ['common', 'org-settings'] })
    translator.start()
    const label = (id: string): string | null => document.getElementById(id)?.getAttribute('aria-label') ?? null
    expect([
      document.getElementById('crumb')?.textContent,
      document.getElementById('amount')?.textContent,
      label('remove'),
      ...legend.map((_, index) => label(`legend-${index}`))
    ]).toEqual(expected)
    translator.stop()
    expect(label('remove')).toBe('Remove octocat')
    expect(label('legend-1')).toBe('Hide All other')
  })

  it('移除按钮的规则只在收件人列表里生效', () => {
    document.body.innerHTML = '<div><button id="other" aria-label="Remove octocat"></button></div>'
    translator = createTranslator({ matcher: createMatcher(bundle), host: window, resolvePages: () => ['common', 'org-settings'] })
    translator.start()
    expect(document.getElementById('other')?.getAttribute('aria-label')).toBe('Remove octocat')
  })

  it('议题字段与类型、升级表单的新增词条', () => {
    const matcher = createMatcher(bundle)
    const pages: PageKey[] = ['common', 'org-settings', 'settings']
    for (const source of ['Urgent', "VAT/GST: Vat code can't be blank", 'Move Effort', '/ Task']) {
      expect(matcher.translate(source, pages), source).toMatch(/[一-鿿]/)
    }
  })
})
