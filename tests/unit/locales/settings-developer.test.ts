import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'
import settingsDeveloper from '../../../src/locales/zh-CN/settings-developer'
import { joinCjk } from '../../../src/locales/zh-CN/helpers'
import { lastUsedLabel, translateLastUsed, translateUsage } from '../../../src/locales/zh-CN/settings-developer/keys'
import { translateDuration } from '../../../src/locales/zh-CN/settings-developer/moderation'
import {
  EVENT_TITLES,
  PERMISSION_TITLES,
  PROVIDED_EVENTS,
  PROVIDED_TITLES,
  translatePermissionList
} from '../../../src/locales/zh-CN/settings-developer/permissions'
import { translateTokenDate } from '../../../src/locales/zh-CN/settings-developer/tokens'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = settingsDeveloper

const matcher = createMatcher([['settings', settingsDeveloper]])

/** 个人设置页的作用域：common → settings */
function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'settings'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按合并后的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // SSH 与 GPG 密钥、凭据汇总
  { hits: [['Added on Jan 5, 2024', '添加于 2024年1月5日']], misses: ['Added on someday'] },
  {
    hits: [
      ['Last used within the last 3 weeks', '最近 3周内使用过'],
      ['Last used within the last week', '最近一周内使用过'],
      ['Last used within the last 2 months', '最近 2个月内使用过']
    ],
    misses: ['Last used within the last day']
  },
  {
    hits: [
      ['— Read/write', '— 读写'],
      ['— Read-only', '— 只读']
    ],
    misses: ['— Admin']
  },
  {
    hits: [
      ["You have successfully added the key 'Work laptop'.", '已成功添加密钥“Work laptop”。'],
      ['You have successfully added the key “Work laptop”', '已成功添加密钥“Work laptop”']
    ],
    misses: ['You have successfully added the key']
  },
  {
    hits: [
      ['3 tokens', '3 个令牌'],
      ['1 token', '1 个令牌']
    ],
    misses: ['Many tokens']
  },
  {
    hits: [
      ['2 OAuth apps', '2 个 OAuth 应用'],
      ['1 OAuth App', '1 个 OAuth 应用']
    ],
    misses: ['Some OAuth apps']
  },
  { hits: [['4 GitHub Apps', '4 个 GitHub 应用']], misses: ['Some GitHub Apps'] },
  {
    hits: [
      ['5 SSH keys', '5 个 SSH 密钥'],
      ['1 SSH key', '1 个 SSH 密钥']
    ],
    misses: ['5 GPG keys']
  },
  {
    hits: [
      ['2 keys', '2 个密钥'],
      ['1 key', '1 个密钥']
    ],
    misses: ['Some keys']
  },

  // 组织、转换帐户
  {
    hits: [
      [
        'Are you positive you want to leave acme? You will lose access to all repositories and teams.',
        '确定要退出 acme 吗？你将失去对其所有存储库和团队的访问权限。'
      ]
    ],
    misses: ['Are you positive you want to leave acme?']
  },
  {
    hits: [
      [
        'Are you positive you want to leave acme? You will lose access to all repositories.',
        '确定要退出 acme 吗？你将失去对其所有存储库的访问权限。'
      ]
    ],
    misses: ['Are you positive you want to leave? You will lose access to all repositories.']
  },
  {
    hits: [['You left acme. It may take a few minutes to process.', '你已退出 acme。处理可能需要几分钟。']],
    misses: ['You left acme.']
  },
  { hits: [['Outside collaborator on 3 repositories', '3 个存储库的外部协作者']], misses: ['Outside collaborator'] },
  {
    hits: [['Member and collaborator on 1 repository', '1 个存储库的成员和协作者']],
    misses: ['Member and collaborator']
  },
  { hits: [['Turn octocat into an organization', '将 octocat 转换为组织']], misses: ['Turn into an organization'] },
  {
    hits: [
      [
        'You will no longer be able to sign in to octocat (all administrative privileges will be bestowed upon the owners you choose)',
        '你将无法再登录 octocat（所有管理权限将授予你选择的所有者）'
      ]
    ],
    misses: ['You will no longer be able to sign in to octocat']
  },
  {
    hits: [
      [
        'Any commits and comments credited to octocat will no longer be linked to this GitHub account',
        '归属于 octocat 的提交和评论将不再关联到此 GitHub 帐户'
      ]
    ],
    misses: ['Any commits and comments credited to octocat']
  },
  {
    hits: [['Any GitHub Apps installed on octocat will be uninstalled', '安装在 octocat 上的所有 GitHub 应用都将被卸载']],
    misses: ['Any GitHub Apps will be uninstalled']
  },
  {
    hits: [['If you are using octocat as a personal account, you should', '如果你将 octocat 用作个人帐户，应先']],
    misses: ['If you are using octocat as a personal account']
  },
  {
    // 句首片段原文无逗号，译文不加
    hits: [['before transforming octocat into an organization.', '再将 octocat 转换为组织。']],
    misses: ['before transforming into an organization.']
  },

  // 阻止用户、交互限制
  { hits: [['Note for @octocat', '@octocat 的备注']], misses: ['Note for octocat'] },
  { hits: [['View note for @octocat', '查看 @octocat 的备注']], misses: ['View note for octocat'] },
  { hits: [['Edit block for @octocat', '编辑对 @octocat 的阻止']], misses: ['Edit block for octocat'] },
  { hits: [['Block settings for @octocat', '@octocat 的阻止设置']], misses: ['Block settings for octocat'] },
  { hits: [['Block user @octocat', '阻止用户 @octocat']], misses: ['Block user octocat'] },
  { hits: [['Block actions for @octocat', '@octocat 的阻止操作']], misses: ['Block actions for octocat'] },
  { hits: [['@octocat has been unblocked', '已取消阻止 @octocat']], misses: ['octocat has been unblocked'] },
  { hits: [['Unblocking @octocat', '正在取消阻止 @octocat']], misses: ['Unblocking octocat'] },
  { hits: [['Closing content from @octocat', '正在关闭 @octocat 的内容']], misses: ['Closing content from octocat'] },
  {
    // 句号随原文：「… Please try again.」不改成逗号
    hits: [['Unable to unblock @octocat. Please try again.', '无法取消阻止 @octocat。请重试。']],
    misses: ['Unable to unblock @octocat.']
  },
  {
    hits: [['Unable to close content from @octocat. Please try again.', '无法关闭 @octocat 的内容。请重试。']],
    misses: ['Unable to close content from @octocat.']
  },
  {
    hits: [['Content created by @octocat is being closed.', '正在关闭 @octocat 创建的内容。']],
    misses: ['Content created by octocat is being closed.']
  },
  { hits: [['3 users found', '找到 3 个用户']], misses: ['Many users found'] },
  {
    hits: [
      ['3 blocked users', '3 个已阻止的用户'],
      ['1 blocked user', '1 个已阻止的用户']
    ],
    misses: ['Many blocked users']
  },
  {
    hits: [
      ['120 characters remaining.', '还可输入 120 个字符。'],
      ['1 character remaining.', '还可输入 1 个字符。']
    ],
    misses: ['No characters remaining.']
  },
  {
    hits: [
      // 原文无逗号，译文不加；句号随原文
      ['Enabled with 23 hours remaining.', '已启用剩余 23小时。'],
      ['Enabled with about 1 month remaining', '已启用剩余约 1个月'],
      ['Enabled with less than a minute remaining.', '已启用剩余不到 1分钟。']
    ],
    misses: ['Enabled with remaining']
  },

  // 存储库、已删除的存储库、软件包、Pages
  { hits: [['3 collaborators', '3 个协作者']], misses: ['Many collaborators'] },
  {
    hits: [['No recoverable repositories were found for octocat.', '未找到 octocat 可恢复的存储库。']],
    misses: ['No recoverable repositories were found.']
  },
  {
    hits: [['Are you sure you want to restore octocat/hello-world?', '确定要恢复 octocat/hello-world 吗？']],
    misses: ['Are you sure you want to restore']
  },
  { hits: [['by octocat', '由 octocat']], misses: ['by the octocat team'] },
  {
    hits: [['No recoverable packages were found for octocat.', '未找到 octocat 可恢复的软件包。']],
    misses: ['No recoverable packages were found.']
  },
  {
    hits: [
      ['Successfully verified example.com.', '已成功验证 example.com。'],
      ['Successfully verified docs.example.com', '已成功验证 docs.example.com']
    ],
    misses: ['Successfully verified']
  },

  // 代码安全
  {
    hits: [
      [
        'You’re about to enable private vulnerability reporting on all public repositories in octocat.',
        '你即将为 octocat 的所有公共存储库启用专用漏洞报告。'
      ],
      [
        "You're about to disable private vulnerability reporting on all public repositories in octocat.",
        '你即将为 octocat 的所有公共存储库禁用专用漏洞报告。'
      ]
    ],
    misses: ["You're about to enable private vulnerability reporting."]
  },
  {
    hits: [["Security settings updated for octocat's repositories.", '已更新 octocat 存储库的安全设置。']],
    misses: ['Security settings updated.']
  },

  // Codespaces
  {
    hits: [
      ['12 repositories', '12 个存储库'],
      ['1 repository', '1 个存储库']
    ],
    misses: ['Many repositories']
  },
  {
    hits: [
      ['Selected 3 repositories.', '已选择 3 个存储库。'],
      ['Selected 1 repository', '已选择 1 个存储库']
    ],
    misses: ['Selected some repositories']
  },
  {
    hits: [['Are you sure you want to delete NPM_TOKEN?', '确定要删除 NPM_TOKEN 吗？']],
    misses: ['Are you sure you want to delete NPM_TOKEN']
  },
  { hits: [['Remove NPM_TOKEN', '删除 NPM_TOKEN']], misses: ['Remove npm token'] },
  { hits: [['Update NPM_TOKEN', '更新 NPM_TOKEN']], misses: ['Update npm token'] },

  // Copilot：计划与使用情况
  {
    hits: [
      [
        'Upgrade for higher limits, premium models, AI reviews. Free responses reset in 12 days.',
        '升级以获得更高额度、高级模型和 AI 审查。免费额度将在 12天后重置。'
      ],
      [
        'Upgrade for higher limits, premium models, AI reviews. Free responses reset in 1 day',
        '升级以获得更高额度、高级模型和 AI 审查。免费额度将在 1天后重置'
      ]
    ],
    misses: ['Upgrade for higher limits']
  },
  {
    hits: [['Free responses reset in 3 days.', '免费额度将在 3天后重置。']],
    misses: ['Free responses reset in 3 days']
  },
  {
    hits: [
      // 方案名译成中文（product-names.md）
      ['GitHub Copilot Pro is active for your account', '你的帐户已启用 GitHub Copilot 专业版'],
      ['GitHub Copilot Pro+ is active for your account', '你的帐户已启用 GitHub Copilot 专业增强版'],
      ['GitHub Copilot Free is active for your account', '你的帐户已启用 GitHub Copilot 免费版']
    ],
    misses: ['GitHub Copilot Business is active for your account']
  },
  {
    hits: [
      ['Copilot Pro+ subscription', 'Copilot 专业增强版订阅'],
      ['Copilot Student subscription', 'Copilot 学生版订阅']
    ],
    misses: ['Copilot Business subscription']
  },
  {
    hits: [['Your GitHub Copilot subscription will renew in 5 days.', '你的 GitHub Copilot 订阅将在 5天后续订。']],
    misses: ['Your GitHub Copilot subscription will renew soon.']
  },
  { hits: [['1,200 / 3,000 AI credits', '1,200 / 3,000 AI 额度']], misses: ['1,200 AI credits left'] },
  { hits: [['1,200 AI credits used', '已使用 1,200 AI 额度']], misses: ['Some AI credits used'] },
  {
    hits: [
      ['300 AI credits', '300 AI 额度'],
      ['1 AI credit', '1 AI 额度']
    ],
    misses: ['Some AI credits']
  },
  { hits: [['$12.50 / $50 budget', '$12.50 / $50 预算']], misses: ['12.50 / 50 budget'] },
  {
    hits: [
      ['Included credits: 45% used', '包含的额度：已使用 45%'],
      ['Monthly limit: 100% used', '每月上限：已使用 100%']
    ],
    misses: ['Other credits: 45% used']
  },
  { hits: [['45.5% used', '已使用 45.5%']], misses: ['45 used'] },
  {
    hits: [
      ['Resets on Nov 1, 2026', '2026年11月1日重置'],
      ['Resets Dec 1', '12月1日重置'],
      ['Resets in 5 days', '5天后重置']
    ],
    misses: ['Resets soon']
  },

  // Copilot：模型（原文无逗号，译文不加）
  {
    hits: [
      [
        'Learn more about how GitHub Copilot serves Claude Sonnet 4 and confirm compatibility with your IDE in our documentation.',
        '在文档中了解 GitHub Copilot 如何提供 Claude Sonnet 4 并确认与你的 IDE 的兼容性。'
      ]
    ],
    misses: ['Learn more about how GitHub Copilot serves models']
  },
  {
    hits: [['Learn more about how GitHub Copilot serves Gemini 2.5 Pro.', '了解 GitHub Copilot 如何提供 Gemini 2.5 Pro。']],
    misses: ['Learn more about how GitHub Copilot serves']
  },
  {
    hits: [['You can use the latest GPT-5 model.', '你可以使用最新的 GPT-5 模型。']],
    misses: ['You can use the latest model']
  },
  {
    hits: [['If enabled, you can access and send data to Grok Code Fast 1.', '启用后，你可以访问 Grok Code Fast 1 并向其发送数据。']],
    misses: ['If enabled, you can access it']
  },
  {
    hits: [['Anthropic Claude Opus 4.1 in Copilot', 'Copilot 中的 Anthropic Claude Opus 4.1']],
    misses: ['Claude Opus 4.1 in Copilot']
  },

  // Copilot：云代理（原文无逗号，译文不加）
  {
    hits: [
      [
        'Choose which repositories Copilot cloud agent should be enabled in. Copilot cloud agent will only be available where it is enabled for the repository and in the Copilot license policies.',
        '选择要启用 Copilot 云端智能体的存储库。Copilot 云端智能体只有在存储库中已启用且 Copilot 许可证策略允许时才可用。'
      ],
      [
        'Choose which repositories Foo agent should be enabled in. Foo agent will only be available where it is enabled for the repository and in the Copilot license policies.',
        '选择要启用 Foo agent 的存储库。Foo agent 只有在存储库中已启用且 Copilot 许可证策略允许时才可用。'
      ],
      [
        'Choose which repositories Cloud agent should be enabled in. Cloud agent will only be available where it is enabled for the repository and in the Copilot license policies.',
        '选择要启用云端智能体的存储库。云端智能体只有在存储库中已启用且 Copilot 许可证策略允许时才可用。'
      ]
    ],
    misses: ['Choose which repositories Copilot cloud agent should be enabled in.']
  },
  {
    hits: [
      ['Matching 1.2k repositories', '匹配 1.2k 个存储库'],
      ['Matching 1 repository', '匹配 1 个存储库']
    ],
    misses: ['Matching repositories']
  },
  {
    hits: [
      ['42 repositories matching', '匹配 42 个存储库'],
      ['1 repository matching', '匹配 1 个存储库']
    ],
    misses: ['Many repositories matching']
  },
  {
    hits: [['120 repositories matching, showing first 100', '匹配 120 个存储库，显示前 100 个']],
    misses: ['120 repositories matching, showing first few']
  },
  { hits: [['5 of 20 items shown.', '显示 20 个项中的 5 个。']], misses: ['5 of 20 items'] },

  // Copilot：代码审查力度
  {
    hits: [
      ['Default (Balanced)', '默认（均衡）'],
      ['Organization default (Lite)', '组织默认值（轻量）'],
      ['Enterprise default (Max)', '企业默认值（最高）']
    ],
    misses: ['Default (main)']
  },
  {
    hits: [
      ['Organization limit (Lite)', '组织上限（轻量）'],
      ['Enterprise limit (Balanced)', '企业上限（均衡）'],
      ['Inherited limit (Auto)', '继承的上限（自动）']
    ],
    misses: ['Organization limit (Unlimited)']
  },
  {
    hits: [['Reviews use Balanced because of the maximum review effort.', '审查因最高审查力度限制而使用均衡力度。']],
    misses: ['Reviews use Balanced because of the maximum review effort']
  },
  {
    hits: [
      ['Inherit the review effort level set by your enterprise', '继承你的企业设置的审查力度'],
      ['Inherit the review effort level set by the Acme Corp enterprise', '继承 Acme Corp 企业设置的审查力度']
    ],
    misses: ['Inherit the review effort level set by the organization']
  },
  {
    hits: [
      ['Use the maximum review effort set by your enterprise', '使用你的企业设置的最高审查力度'],
      ['Use the maximum review effort set by the Acme enterprise', '使用 Acme 企业设置的最高审查力度']
    ],
    misses: ['Use the maximum review effort set by an admin']
  },

  // 安全日志、赞助日志
  {
    hits: [
      ['Found 12 events', '找到 12 个事件'],
      ['Found 1 event', '找到 1 个事件']
    ],
    misses: ['Found events']
  },
  { hits: [["View octocat's profile", '查看 octocat 的个人资料']], misses: ['View octocat profile'] },
  {
    hits: [
      ['actor: filter by actor', 'actor: 按参与者筛选'],
      ['repo: filter by repository', 'repo: 按存储库筛选'],
      ['created: filter by created date', 'created: 按创建日期筛选']
    ],
    misses: ['actor: filter by team']
  },
  {
    hits: [
      ['Two-factor auth challenge solved with authenticator app', '已通过身份验证器应用完成双因素身份验证质询'],
      ['Two-factor auth challenge solved with security key', '已通过安全密钥完成双因素身份验证质询'],
      ['Two-factor auth challenge solved with GitHub Mobile', '已通过 GitHub 移动版完成双因素身份验证质询']
    ],
    misses: ['Two-factor auth challenge solved with carrier pigeon']
  },
  {
    hits: [
      [
        'Created a token for octocat ending in abcd for the Copilot GitHub App.',
        '创建了 octocat 的尾号为 abcd 的 Copilot GitHub 应用令牌。'
      ],
      [
        'Revoked a token for octocat ending in abcd for the Copilot GitHub App.',
        '撤销了 octocat 的尾号为 abcd 的 Copilot GitHub 应用令牌。'
      ],
      [
        'Regenerated a token for octocat ending in abcd for the Travis CI OAuth app',
        '重新生成了 octocat 的尾号为 abcd 的 Travis CI OAuth 应用令牌'
      ]
    ],
    misses: ['Created a token for octocat']
  },
  {
    hits: [['Added deployment branch pattern with value main for github-pages.', '为 github-pages 添加了值为 main 的部署分支模式。']],
    misses: ['Added deployment branch pattern']
  },
  {
    hits: [
      [
        'Created a deployment branch protection rule for github-pages. The environment can only deploy in branches matching a branch policy pattern.',
        '为 github-pages 创建了部署分支保护规则。该环境只能部署到与分支策略模式匹配的分支。'
      ]
    ],
    misses: ['Created a deployment branch protection rule for github-pages.']
  },
  {
    hits: [['Changed GitHub Pages visibility to public octocat/site', '将 octocat/site 的 GitHub 页面可见性更改为公共']],
    misses: ['Changed GitHub Pages visibility to private']
  },
  {
    hits: [
      ['Set policy to default workflow token permission to read for', '为以下存储库将默认工作流令牌权限策略设为只读'],
      ['Set policy to default workflow token permission to write for', '为以下存储库将默认工作流令牌权限策略设为读写']
    ],
    misses: ['Set policy to default workflow token permission to admin for']
  },
  {
    hits: [
      ['Set policy to default workflow token can create or approve PR to true for', '为以下存储库允许默认工作流令牌创建或批准拉取请求'],
      ['Set policy to default workflow token can create or approve PR to false for', '为以下存储库禁止默认工作流令牌创建或批准拉取请求']
    ],
    misses: ['Set policy to default workflow token can create or approve PR to maybe for']
  },

  // 已授权的应用
  {
    hits: [['You have granted 3 applications access to your account.', '你已授权 3 个应用访问你的帐户。']],
    misses: ['You have granted applications access to your account.']
  },
  {
    hits: [['You have authorized 1 application to access your account.', '你已授权 1 个应用访问你的帐户。']],
    misses: ['You have authorized applications to access your account.']
  },
  {
    hits: [
      ['5 applications', '5 个应用'],
      ['1 application', '1 个应用']
    ],
    misses: ['Some applications']
  },
  {
    hits: [
      ['Never used · Owned by', '从未使用 · 所有者'],
      ['Last used within the last 2 weeks · Owned by', '最近 2周内使用过 · 所有者']
    ],
    misses: ['Used · Owned by']
  },
  {
    hits: [['Last used within the last month · Owned by octocat', '最近一个月内使用过 · 所有者 octocat']],
    misses: ['Never used · Owned by octo cat']
  },
  { hits: [['Owned by octocat', '所有者 octocat']], misses: ['Owned by the octocat team'] },
  {
    hits: [
      [
        'Travis CI will no longer be able to access your GitHub account. You cannot undo this action.',
        'Travis CI 将无法再访问你的 GitHub 帐户。此操作无法撤销。'
      ]
    ],
    misses: ['Travis CI will no longer be able to access your GitHub account.']
  },
  {
    hits: [
      [
        'deploy-script will no longer be able to access the GitHub API. You cannot undo this action.',
        'deploy-script 将无法再访问 GitHub API。此操作无法撤销。'
      ]
    ],
    misses: ['deploy-script will no longer be able to access the GitHub API.']
  },
  {
    hits: [['Travis CI has been revoked from your account.', '已从你的帐户撤销 Travis CI。']],
    misses: ['Travis CI has been revoked.']
  },
  {
    hits: [
      ['Reporting Travis CI will contact Support about abuse on the application.', '举报 Travis CI 将联系支持团队处理该应用的滥用问题。']
    ],
    misses: ['Reporting Travis CI will contact Support.']
  },
  {
    hits: [
      ['Report Travis CI', '举报 Travis CI'],
      ['Report 1Password', '举报 1Password']
    ],
    misses: ['Reported Travis CI', 'Report a bug', 'Report spam', 'Report this app', 'Report Abuse content']
  },
  {
    hits: [
      ['Revoke Travis CI', '撤销 Travis CI'],
      ['Revoke Itch.io', '撤销 Itch.io']
    ],
    misses: [
      'Revoked Travis CI',
      'Revoke all sessions',
      'Revoke authorization',
      'Revoke access for all applications',
      'Revoke tokens',
      'Revoke selected',
      'Revoke All'
    ]
  },

  // 安装配置页
  {
    hits: [
      ['Installed 2 years ago', '2年前安装'],
      ['Installed on Jan 5, 2024', '2024年1月5日安装']
    ],
    misses: ['Installed apps']
  },
  {
    hits: [
      ['Your installation was suspended by you on November 20th, 2026 at 03:11 (CST).', '你已于 2026年11月20日 03:11（CST）暂停此安装。'],
      ['Your installation was suspended by you on May 2nd, 2026 at 3:05 PM (UTC).', '你已于 2026年5月2日 15:05（UTC）暂停此安装。']
    ],
    misses: ['Your installation was suspended by you on November 20th, 2026 at 03:11']
  },
  {
    hits: [
      ['Your installation was suspended by you on Jan 5, 2025.', '你已于 2025年1月5日暂停此安装。'],
      ['Your installation was suspended by you on Jan 5, 2025', '你已于 2025年1月5日暂停此安装']
    ],
    misses: ['Your installation was suspended by you']
  },
  {
    hits: [
      ['Uninstall "Dependabot Preview"', '卸载“Dependabot Preview”'],
      ['Uninstall “Renovate”', '卸载“Renovate”']
    ],
    misses: ['Uninstall Renovate']
  },
  {
    hits: [
      [
        'This action cannot be undone. Are you sure you want to uninstall this GitHub App from 3 repositories?',
        '此操作无法撤销。确定要从 3 个存储库中卸载此 GitHub 应用吗？'
      ]
    ],
    misses: ['Are you sure you want to uninstall this GitHub App?']
  },
  {
    hits: [
      [
        'This action cannot be undone. Are you sure you want to uninstall this GitHub App from all repositories?',
        '此操作无法撤销。确定要从所有存储库中卸载此 GitHub 应用吗？'
      ]
    ],
    misses: ['This action cannot be undone. Are you sure you want to uninstall this GitHub App from some repositories?']
  },
  { hits: [["You're all set! Renovate has been uninstalled.", '已卸载 Renovate。']], misses: ["You're all set!"] },
  {
    hits: [["You're all set! A job has been queued to uninstall the 'Renovate' app.", '已排队卸载 Renovate 应用。']],
    misses: ["You're all set! A job has been queued."]
  },
  {
    hits: [['Okay, Renovate was installed on the @octocat account.', '已将 Renovate 安装到 @octocat 帐户。']],
    misses: ['Okay, Renovate was installed.']
  },
  {
    hits: [['Okay, Renovate was updated for the @octocat account.', '已更新 @octocat 帐户的 Renovate。']],
    misses: ['Okay, Renovate was updated.']
  },

  // 权限更新请求
  {
    hits: [['Renovate is requesting updated permissions', 'Renovate 正在请求更新权限']],
    misses: ['Renovate is requesting permissions']
  },
  {
    hits: [
      [
        'The Renovate app will retain its current permissions if you choose not to accept the new permissions.',
        'Renovate 应用将在你不接受新权限时保留其当前权限。'
      ]
    ],
    misses: ['The Renovate app will retain its current permissions.']
  },

  // 应用授权详情
  {
    hits: [["Travis CI is authorized to access this organization's resources", 'Travis CI 已获授权访问此组织的资源']],
    misses: ['Travis CI is authorized']
  },
  {
    hits: [
      ['Travis CI is denied access this organization’s resources', 'Travis CI 已被拒绝访问此组织的资源'],
      ["Travis CI is denied access to this organization's resources", 'Travis CI 已被拒绝访问此组织的资源']
    ],
    misses: ['Travis CI is denied access']
  },

  // 切换令牌过期
  {
    hits: [
      ['Token expiration is being enabled for test.', '正在为 test 启用令牌过期。'],
      ['Token expiration is being disabled for My App.', '正在为 My App 禁用令牌过期。']
    ],
    misses: ['Token expiration is being changed for test.']
  },

  // GitHub App：安装、转移、公共/专用、客户端密钥、可选功能、最近交付
  {
    hits: [['Only allow this GitHub App to be installed on the @octocat account.', '仅允许将此 GitHub 应用安装在 @octocat 帐户上。']],
    misses: ['Only allow this GitHub App to be installed on the octocat account.']
  },
  {
    hits: [['Choose an account to install Renovate on:', '选择要安装 Renovate 的帐户：']],
    misses: ['Choose an account to install Renovate']
  },
  { hits: [['Install Renovate on this account.', '将 Renovate 安装到此帐户。']], misses: ['Install Renovate'] },
  {
    hits: [['Renovate is installed on this account.', 'Renovate 已安装在此帐户上。']],
    misses: ['Renovate is installed.']
  },
  { hits: [['Where should we transfer my-app?', '要将 my-app 转让给谁？']], misses: ['Where should we transfer'] },
  {
    hits: [
      [
        'Any user or organization will be able to install this GitHub App. Are you sure you want to make my-app public?',
        '任何用户或组织都可以安装此 GitHub 应用。确定要将 my-app 设为公共吗？'
      ]
    ],
    misses: ['Any user or organization will be able to install this GitHub App.']
  },
  {
    hits: [
      [
        'This GitHub app will only be installable on the octocat account. Are you sure you want to make my-app private?',
        '此 GitHub 应用将只能安装在 octocat 帐户上。确定要将 my-app 设为专用吗？'
      ]
    ],
    misses: ['This GitHub app will only be installable on the octocat account.']
  },
  {
    hits: [
      ['3 accounts', '3 个帐户'],
      ['1 account', '1 个帐户']
    ],
    misses: ['Some accounts']
  },
  {
    hits: [
      ['0 users', '0 个用户'],
      ['1 user', '1 个用户']
    ],
    misses: ['Some users']
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
      ['Added on Jan 5, 2024 by octocat', '2024年1月5日由 octocat 添加']
    ],
    misses: ['Added 3 days ago']
  },
  {
    hits: [
      ['This will also uninstall the GitHub App from 3 accounts.', '这还会从 3 个帐户中卸载此 GitHub 应用。'],
      ['This will also uninstall the GitHub App from 1 account.', '这还会从 1 个帐户中卸载此 GitHub 应用。']
    ],
    misses: ['This will also uninstall the GitHub App from all accounts.']
  },
  {
    hits: [['Activate optional features for my-app', '为 my-app 激活可选功能']],
    misses: ['Activate optional features']
  },
  {
    hits: [['Choose a feature to activate for my-app:', '选择要为 my-app 激活的功能：']],
    misses: ['Choose a feature to activate for my-app']
  },
  {
    hits: [
      ['Completed in 0.52 seconds.', '耗时 0.52 秒。'],
      ['Completed in 1 second', '耗时 1 秒']
    ],
    misses: ['Completed in a moment']
  },

  // 个人访问令牌：过期时间
  {
    hits: [
      ['Expires on Tue, Nov 25 2025.', '有效期至 2025年11月25日周二。'],
      ['Expires on Tue, Nov 25 2025', '有效期至 2025年11月25日周二'],
      ['Expired on Nov 25, 2025', '已于 2025年11月25日过期']
    ],
    misses: ['Expires on someday']
  },
  {
    hits: [['This token expires on Tue, Nov 25 2025.', '此令牌将于 2025年11月25日周二过期。']],
    misses: ['This token expires soon.']
  },
  {
    hits: [['This token expired on Mon, Jan 5 2026.', '此令牌已于 2026年1月5日周一过期。']],
    misses: ['This token expired.']
  },
  {
    hits: [['The token will expire on Sun, Nov 30 2025', '令牌将于 2025年11月30日周日过期']],
    misses: ['The token will expire on someday']
  },
  {
    hits: [
      // 「Expires in 3 days」由 settings-account 的计划页规则先行翻译，这里用小时、今天等其余写法
      ['Expires in 5 hours', '5小时后过期'],
      ['Expires today.', '今天过期。']
    ],
    misses: ['Expires soon']
  },
  {
    hits: [
      ['30 days (Tue, Nov 25 2025)', '30 天（2025年11月25日周二）'],
      ['7 days (Nov 2, 2025)', '7 天（2025年11月2日）']
    ],
    misses: ['30 days (soon)']
  },
  {
    hits: [
      ['Tue, Nov 25 2025', '2025年11月25日周二'],
      ['Wed, Dec 3 2025.', '2025年12月3日周三。'],
      ['on Sun, Dec 20 2026', '2026年12月20日周日'],
      ['Sunday, December 20, 2026', '2026年12月20日周日']
    ],
    misses: ['Tue, 25 Nov 2025']
  },
  {
    hits: [
      ['— admin:enterprise, admin:gpg_key', '— 完全控制企业、完全控制用户公开 GPG 密钥'],
      ['— repo, workflow, write:packages', '— 完全控制专用存储库、更新 GitHub 操作工作流、向 GitHub 软件包注册表上传软件包'],
      ['— repo, new:scope', '— 完全控制专用存储库、new:scope']
    ],
    misses: ['repo, workflow', '— Admin']
  },
  { hits: [['Limit set by acme organization', '由 acme 组织设定的限制']], misses: ['Limit set by organization'] },
  {
    hits: [
      [
        'The acme organization requires a maximum lifetime of 30 days for fine-grained personal access tokens.',
        'acme 组织要求精细个人访问令牌的最长有效期为 30 天。'
      ],
      [
        'The Acme enterprise requires a maximum lifetime of 1 day for fine-grained personal access tokens.',
        'Acme 企业要求精细个人访问令牌的最长有效期为 1 天。'
      ],
      [
        'The requires a maximum lifetime of 0 days for fine-grained personal access tokens. As an enterprise administrator you are exempted from this requirement.',
        '要求精细个人访问令牌的最长有效期为 0 天。你作为企业管理员不受此要求限制。'
      ]
    ],
    misses: ['The acme organization requires a maximum lifetime for fine-grained personal access tokens.']
  },

  // 个人访问令牌：使用情况、名称校验、权限汇总
  {
    hits: [
      ['Never used •', '从未使用 •'],
      ['Last used within the last week •', '最近一周内使用过 •']
    ],
    misses: ['Used •']
  },
  { hits: [["'my-token' is available.", '“my-token”可用。']], misses: ['my-token is available.'] },
  {
    hits: [["'my-token' is not available. The token name has already been taken.", '“my-token”不可用。令牌名称已被使用。']],
    misses: ["'my-token' is not available."]
  },
  {
    hits: [
      ['3 permissions for all repositories:', '所有存储库的 3 项权限：'],
      ['1 permission for all repositories', '所有存储库的 1 项权限']
    ],
    misses: ['Permissions for all repositories:']
  },
  {
    hits: [
      ['2 permissions for 5 repositories:', '5 个存储库的 2 项权限：'],
      ['1 permission for 1 repository', '1 个存储库的 1 项权限']
    ],
    misses: ['2 permissions for repositories']
  },
  { hits: [['1 account permission', '1 项帐户权限']], misses: ['Some account permissions'] },
  { hits: [['2 organization permissions', '2 项组织权限']], misses: ['Some organization permissions'] },
  { hits: [['4 repository permissions', '4 项存储库权限']], misses: ['Some repository permissions'] },

  // 权限选择器、已安装应用的权限摘要
  {
    hits: [
      ['Access: Read and write', '访问权限：读写'],
      ['Access: Read-only', '访问权限：只读']
    ],
    misses: ['Access: Write']
  },
  {
    hits: [
      ['Remove Pull requests', '删除拉取请求'],
      ['Remove Actions', '删除操作'],
      ['Remove Copilot Chat', '删除 Copilot 聊天'],
      ['Remove Codespaces secrets', '删除代码空间机密'],
      ['Remove Secret scanning alerts', '删除机密扫描警报'],
      ['Remove Pages', '删除页面']
    ],
    misses: ['Remove pull requests']
  },
  {
    hits: [
      ['Read access to metadata', '读取元数据'],
      ['Read access to pages', '读取页面'],
      ['Read and write access to code, issues, and pull requests', '读写代码、议题和拉取请求'],
      ['Read and Write access to actions', '读写操作'],
      ['Read and write access to actions, checks, and code', '读写操作、检查和代码'],
      ['Read access to codespaces and copilot chat', '读取代码空间和 Copilot 聊天'],
      ['Admin access to organization self hosted runners', '管理组织自托管运行器'],
      ['Read and write access to organization user blocking', '读写组织用户阻止']
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
      ['Label: repository permission count', '标签：存储库权限数'],
      ['organization mandatory permission count', '组织必选权限数'],
      ['Label: user mandatory permission count', '标签：帐户必选权限数'],
      ['business permission count', '企业权限数']
    ],
    misses: ['enterprise permission count']
  },

  // GitHub App 可订阅事件的帮助链接
  {
    hits: [
      ['Learn more about the Push event', '了解推送事件'],
      ['Learn more about the Gollum event', '了解 Gollum 事件'],
      ['Learn more about the Projects v2 item event', '了解项目 v2 项事件'],
      ['Learn more about the Dependabot alert event', '了解 Dependabot 警报事件'],
      ['Learn more about the Public event', '了解公共事件']
    ],
    misses: ['Learn more about the Unknown event']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('settings-developer 正则词条', () => {
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

  it('宽泛的“Report / Revoke + 应用名”让位于静态与页面词条', () => {
    expect(translate('Revoke all')).toBe('全部撤销')
    expect(translate('Revoke access')).toBe('撤销访问权限')
    expect(translate('Revoke all user tokens')).toBe('撤销所有用户令牌')
    expect(translate('Report Abuse')).toBe('举报滥用行为')
    expect(translate('Revoke GitHub CLI')).toBe('撤销 GitHub CLI')
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Selected ', '3', ' repositories.'].join('')))).toBe('已选择 3 个存储库。')
    expect(translate(normalizeText(['1,200', ' / ', '3,000', ' AI credits'].join('')))).toBe('1,200 / 3,000 AI 额度')
    expect(translate(normalizeText(['Found ', '12', ' events'].join('')))).toBe('找到 12 个事件')
    expect(translate(normalizeText(['Matching ', '42', ' repositories'].join('')))).toBe('匹配 42 个存储库')
  })

  it('被元素隔开的片段单独命中', () => {
    // 「This will revoke access for <strong>all third-party</strong> OAuth applications. …」
    expect(translate('This will revoke access for')).toBe('这将撤销')
    expect(translate('all third-party')).toBe('所有第三方')
    expect(translate('OAuth applications. This action cannot be undone.')).toBe('OAuth 应用的访问权限。此操作无法撤销。')
    // 「<strong>Read</strong> and <strong>write</strong> access to code」（and 由通用词典翻译）
    expect(translate('Read')).toBe('读取')
    expect(translate('write')).toBe('写入')
    expect(translate('access to code')).toBe('代码')
    // 「You have granted <strong>3 applications</strong> access to your account.」
    expect(translate('You have granted')).toBe('你已授权')
    expect(translate('3 applications')).toBe('3 个应用')
    expect(translate('access to your account.')).toBe('访问你的帐户。')
    // 「Tokens you have generated that can be used to access the <a>GitHub API</a>.」
    expect(translate('Tokens you have generated that can be used to access the')).toBe('你生成的令牌可用于访问')
    // 已删除的存储库：「Deleted <relative-time> by <login>」
    expect(translate('Deleted')).toBe('删除于')
    expect(translate('by')).toBe('由')
  })
})

describe('settings-developer 工具函数', () => {
  it('translateTokenDate 处理带星期、常规与相对日期', () => {
    expect(translateTokenDate('Tue, Nov 25 2025')).toBe('2025年11月25日周二')
    expect(translateTokenDate('Sat, Jan 3, 2026')).toBe('2026年1月3日周六')
    expect(translateTokenDate('Sunday, December 20, 2026')).toBe('2026年12月20日周日')
    expect(translateTokenDate('Nov 25, 2025')).toBe('2025年11月25日')
    expect(translateTokenDate('in 3 days')).toBe('3天后')
    expect(translateTokenDate('someday')).toBe('someday')
  })

  it('translatePermissionList 拼接资源名，未知资源名保留原文', () => {
    expect(translatePermissionList('metadata')).toBe('元数据')
    expect(translatePermissionList('code, issues, and pull requests')).toBe('代码、议题和拉取请求')
    expect(translatePermissionList('actions and code')).toBe('操作和代码')
    expect(translatePermissionList('actions, checks, and code')).toBe('操作、检查和代码')
    expect(translatePermissionList('code and widgets')).toBe('代码和 widgets')
    expect(translatePermissionList('organization user blocking')).toBe('组织用户阻止')
  })

  it('lastUsedLabel、translateLastUsed、translateUsage', () => {
    expect(lastUsedLabel(undefined, 'month')).toBe('最近一个月内使用过')
    expect(lastUsedLabel('2', 'week')).toBe('最近 2周内使用过')
    expect(translateLastUsed('Last used within the last year')).toBe('最近一年内使用过')
    expect(translateLastUsed('Never used')).toBeUndefined()
    expect(translateUsage('Never used')).toBe('从未使用')
    expect(translateUsage('Last used within the last 3 years')).toBe('最近 3年内使用过')
    expect(translateUsage('Used yesterday')).toBe('Used yesterday')
  })

  it('translateDuration', () => {
    expect(translateDuration('over 2 days')).toBe('超过 2天')
    expect(translateDuration('about 23 hours')).toBe('约 23小时')
    expect(translateDuration('an hour')).toBe('1小时')
    expect(translateDuration('less than a minute')).toBe('不到 1分钟')
    expect(translateDuration('forever')).toBe('forever')
  })

  it('joinCjk 只在中文与字母、数字交界处补空格', () => {
    expect(joinCjk('读写', 'Actions')).toBe('读写 Actions')
    expect(joinCjk('Actions', '和')).toBe('Actions 和')
    expect(joinCjk('代码', '和')).toBe('代码和')
    expect(joinCjk('（只读）', 'Gists')).toBe('（只读）Gists')
    expect(joinCjk('Gists', '（只读）')).toBe('Gists（只读）')
    expect(joinCjk('', '代码')).toBe('代码')
    expect(joinCjk('添加于', '2024年1月5日')).toBe('添加于 2024年1月5日')
    expect(joinCjk('已于', '昨天')).toBe('已于昨天')
    expect(joinCjk('3天前', '重置')).toBe('3天前重置')
  })

  it('权限标题：自有标题都有译文，已由其他文件收录的不重复收录', () => {
    const mismatched = Object.entries(PERMISSION_TITLES)
      .filter(([title]) => !PROVIDED_TITLES.has(title))
      .filter(([title, value]) => translate(title) !== (title === value ? undefined : value))
      .map(([title]) => title)
    expect(mismatched).toEqual([])
    const duplicated = [...PROVIDED_TITLES].filter(title => dict.scoped?.[title] !== undefined)
    expect(duplicated).toEqual([])
    expect([...PROVIDED_TITLES].filter(title => PERMISSION_TITLES[title] === undefined)).toEqual([])
  })

  it('事件名：自有事件名都有译文，已由其他词条收录的译法一致', () => {
    const mismatched = Object.entries(EVENT_TITLES)
      .filter(([title]) => !PROVIDED_EVENTS.has(title))
      .filter(([title, value]) => translate(title) !== (title === value ? undefined : value))
      .map(([title]) => title)
    expect(mismatched).toEqual([])
    // 已收录的事件名（多为全站 static）：本词典要么不收录，要么译法相同（如阻止用户表格的 Label）
    const conflicting = [...PROVIDED_EVENTS].filter(title => {
      const value = translate(title)
      return value !== undefined && value !== EVENT_TITLES[title]
    })
    expect(conflicting).toEqual([])
    expect([...PROVIDED_EVENTS].filter(title => EVENT_TITLES[title] === undefined)).toEqual([])
  })
})

describe('settings-developer 静态词条', () => {
  it.each([
    ['New SSH key', '新建 SSH 密钥'],
    ['Configure SSO', '配置 SSO'],
    ['Leave organization', '退出组织'],
    ['Repository default branch', '存储库默认分支'],
    ['Verified domains', '已验证的域'],
    ['Add a saved reply', '添加已保存回复'],
    ['Models paid usage', '模型付费使用'],
    ['Visit Marketplace', '访问市场'],
    ['Upgrade to Team', '升级到团队版'],
    ['Push protection for yourself', '个人推送保护'],
    ['Default idle timeout', '默认空闲超时'],
    ['Premium requests', '高级请求'],
    ['Loading usage data...', '正在加载使用情况数据...'],
    ['Sponsors log', '赞助日志'],
    ['No installed GitHub Apps', '暂无已安装的 GitHub 应用'],
    ['App Suspended', '应用已暂停'],
    ['I understand, revoke access', '我已了解，撤销访问权限'],
    ['Register new GitHub App', '注册新的 GitHub 应用'],
    ['Generate a new client secret', '生成新的客户端密钥'],
    ['Generate new token', '生成新令牌'],
    ['Personal access tokens (classic)', '个人访问令牌（经典）'],
    ['Full control of private repositories', '完全控制专用存储库'],
    ['Workflows, workflow runs and artifacts.', '工作流、工作流运行和产物。'],
    ['Choose the minimal permissions necessary for your needs.', '选择满足需求的最小权限。'],
    [
      'Make sure to copy your personal access token now. You won’t be able to see it again!',
      '请立即复制你的个人访问令牌。之后将无法再次查看！'
    ],
    ['Expire user access tokens', '用户访问令牌自动过期'],
    ['Create repositories.', '创建存储库。'],
    ['Enterprise permissions permit access to enterprise account resources.', '企业权限允许访问企业帐户资源。'],
    ['Something went wrong while checking. Please retry.', '检查时出错。请重试。'],
    // block → 阻止，dismissal request → 消除请求
    ['You are about to block:', '你即将阻止：'],
    ['Additionally, blocked users are not able to:', '此外，被阻止的用户无法：'],
    ['Warn me when blocked users have contributed to a repository', '被阻止的用户曾为某存储库做出贡献时提醒我'],
    ['View and manage users blocked by the user.', '查看和管理该用户阻止的用户。'],
    ['View and manage users blocked by the organization.', '查看和管理组织阻止的用户。'],
    ['View and manage secret scanning alert dismissal requests', '查看和管理机密扫描警报消除请求'],
    ['Review and manage Dependabot alert dismissal requests.', '审查和管理 Dependabot 警报消除请求。'],
    ['Your organization has blocked AI credits usage.', '你的组织已阻止使用 AI 额度。'],
    // 手写日期：中文与数字之间加空格
    [
      'GitHub will enable push protection for all GitHub Free individuals in January 2024. Enable below to try it now in beta.',
      'GitHub 将于 2024年1月为所有 GitHub 免费版个人用户启用推送保护。可在下方启用以抢先体验测试版。'
    ],
    [
      '. Enforcement begins July 27th, 2026 in version 1.1 of the GitHub Copilot app. The Copilot CLI policy continues to govern the GitHub Copilot App until version 1.1',
      '。GitHub Copilot 应用 1.1 版自 2026年7月27日起强制实施此策略。Copilot CLI 策略在 1.1 版之前继续管控 GitHub Copilot 应用'
    ],
    ['Dotfiles repository', 'Dotfiles 存储库'],
    // 与拉取请求并列的 open issues → 创建问题；整句与组织、存储库设置同句写法一致
    [
      'Temporarily restrict which external users can interact with your repositories (comment, open issues, or create pull requests) for a configurable period of time.',
      '在可配置的时间段内，临时限制哪些外部用户可以与你的存储库交互（评论、创建议题或创建拉取请求）。'
    ],
    // 非可见性义的 private / public（数据）→ 私密 / 公开；代码库按可见性 → 专用
    [
      'Applications act on your behalf to access your data based on the permissions you grant them. Organizations control which applications are allowed to access their private data. Applications you authorize will always have access to public data in your organizations.',
      '应用会根据你授予的权限代表你访问数据。组织可以控制允许哪些应用访问其私密数据。你授权的应用始终可以访问你所在组织的公开数据。'
    ],
    ['No private access', '无私密访问权限'],
    [
      'Granting access will give this application the ability to request access to private data in the',
      '授予访问权限后此应用将能够请求访问以下组织的私密数据'
    ],
    ['Customize conversations to your private codebase and extensions', '根据你的专用代码库和扩展定制对话'],
    // read access → 读取访问权限
    ['Read access required to use other repository permissions.', '使用其他存储库权限需要读取访问权限。'],
    [
      'Codespaces you create for your personal account can either be restricted to accessing the repository it was opened for, or granted read access to other repositories you own.',
      '你为个人帐户创建的代码空间可以仅限访问打开它的存储库，也可以获得你拥有的其他存储库的读取访问权限。'
    ],
    // profile → 个人资料
    ['Read enterprise profile data', '读取企业个人资料数据'],
    [
      'Any user-specific information (OAuth tokens, SSH keys, Job Profile, etc) will be erased',
      '所有用户特定信息（OAuth 令牌、SSH 密钥、求职个人资料等）都将被清除'
    ],
    // 标点随原文：原文只有词内撇号，译文不加逗号；原文没有冒号，译文不加
    [
      'GitHub Copilot won’t answer questions about new trends and give improved answers',
      'GitHub Copilot 不会回答有关新趋势的问题或给出更好的答案'
    ],
    [
      'To enable Copilot functionality, you must first grant your app permission to read Copilot Messages. To do so, navigate to Permissions & Events > Account Permissions > Read-only for Copilot Chat',
      '要启用 Copilot 功能，必须先授予应用读取 Copilot 消息的权限。为此，请前往权限和事件 > 帐户权限 > 将 Copilot 聊天设为只读'
    ],
    // 标点随原文：原文没有逗号的句子不加逗号，必要时改语序；「X. Please try again.」保留句号
    ['Failed to update budget. Please try again.', '无法更新预算。请重试。'],
    ['Whoops! Try again.', '出错了！请重试。'],
    ['Only images, please. Try again.', '仅支持图片。请重试。'],
    ['1MB or less, please. Try again.', '图片不能超过 1MB。请重试。'],
    [
      'You cannot transform this account into an organization because you have an active GitHub Sponsors account.',
      '你因有活跃的 GitHub 赞助帐户而无法将此帐户转换为组织。'
    ],
    [
      'This integration cannot be made private since it is already installed on other accounts.',
      '此集成因已安装在其他帐户上而无法设为专用。'
    ],
    [
      "You can enable Copilot coding agent for other users, but you won't be able to assign tasks to Copilot because the Copilot coding agent policy has been disabled by an administrator.",
      '你可以为其他用户启用 Copilot 编码智能体，但因管理员已禁用 Copilot 编码智能体策略而无法向 Copilot 分配任务。'
    ],
    ['Any commits you signed with this key will become unverified after removing it.', '你用此密钥签名的所有提交在删除后都将变为未验证。'],
    [
      'Select at least one repository. Max 50 repositories. Also includes public repositories (read-only).',
      '至少选择一个存储库。最多 50 个存储库。同时包括公共存储库（只读）。'
    ],
    ['Tokens you have generated that can be used to access the GitHub API.', '你生成的可用于访问 GitHub API 的令牌。'],
    ['will be ready for use immediately. It will expire on', '将立即可用。过期日期为'],
    // 「Block commits that contain <a>supported secrets</a> across all public repositories on GitHub.」：范围状语并入句首片段
    [
      'Block commits that contain supported secrets across all public repositories on GitHub.',
      '在 GitHub 上的所有公共存储库中阻止提交中出现受支持的机密。'
    ],
    // 「… because the current plan for <strong>组织</strong> does not support …」：because 从句用“因…而…”
    ['You will only receive notifications from public repositories in this organization because the current plan for', '你因组织'],
    ['does not support reminders for private repositories.', '的当前计划不支持专用存储库的提醒而只会收到此组织公共存储库的通知。'],
    // 原文无逗号的长句：改用定语、连词接续，不加逗号
    [
      'This will clear your dismissal preferences and the SSO banner may appear again for organizations that require single sign-on authentication.',
      '这将清除你的关闭首选项并可能让 SSO 横幅在要求单一登录身份验证的组织中再次出现。'
    ],
    [
      "You're about to enable dependabot on actions on all your repositories. Dependabot on actions requires Actions so we'll also turn that on for all repositories.",
      '你即将为你的所有存储库启用操作运行器上的 Dependabot。此功能所需的 GitHub 操作也会为所有存储库开启。'
    ],
    [
      'You’re about to enable dependabot self-hosted on all your repositories. Dependabot self-hosted depends on Dependabot on Actions so we’ll also turn that on for all repositories.',
      '你即将为你的所有存储库启用自托管运行器上的 Dependabot。此功能所依赖的操作运行器上的 Dependabot 也会为所有存储库开启。'
    ],
    // 「This will provide a <code>refresh_token</code> which can be used to …」
    ['which can be used to request an updated access token when this access token expires.', '以便在此访问令牌过期时请求新的访问令牌。'],
    // 并列形容词之间的逗号译作顿号
    ['Fine-grained, repo-scoped', '精细、存储库范围']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Generate new token \n', ['common', 'settings'])).toBe('  生成新令牌 \n')
  })

  it('private 不译“私有”：可见性 → 专用，数据、信息 → 私密', () => {
    const values = [...Object.values(dict.static ?? {}), ...Object.values(dict.scoped ?? {})]
    expect(values.filter(value => value.includes('私有'))).toEqual([])
  })
})

describe('settings-developer 页面词条', () => {
  it.each([
    ['Restore', '恢复'],
    ['Repositorys', '存储库'],
    ['Deleted repositories', '已删除的存储库'],
    ['Region', '区域'],
    ['Allowed', '已允许'],
    ['Blocked', '已阻止'],
    ['Compare plans', '比较计划'],
    ['Signing', '签名'],
    ['Fine-grained tokens', '精细令牌'],
    ['Tokens (classic)', '令牌（经典）'],
    ['No access', '无权限'],
    ['Read and write', '读写'],
    ['Administration', '管理'],
    ['Events', '事件'],
    ['Authorized GitHub Apps', '授权的 GitHub 应用'],
    ['Authorized OAuth Apps', '授权的 OAuth 应用'],
    ['GitHub App', 'GitHub 应用'],
    ['GitHub App.', 'GitHub 应用。'],
    ['OAuth app', 'OAuth 应用'],
    ['Show more options', '显示更多选项'],
    ['Suspend', '暂停'],
    ['Unsuspend', '恢复'],
    ['Secret scanning', '机密扫描'],
    ['Copilot code completions quota usage', 'Copilot 代码补全额度使用情况'],
    ['Period:', '时间段：'],
    ['Get started', '开始使用'],
    ['Organization default', '组织默认值'],
    ['in', '位于'],
    ['not recommended', '不推荐'],
    ['Mandatory', '必选'],
    ['Code quality', '代码质量'],
    ['Projects v2 item', '项目 v2 项'],
    ['Meta', 'Web 钩子本身'],
    // 已阻止的用户：表格与对话框
    ['Learn more about blocking a user', '了解如何阻止用户'],
    ['Until unblocked', '直到取消阻止'],
    ['No blocked users match your search.', '没有匹配的已阻止用户。'],
    ['Blocked by', '阻止者'],
    ['Blocked until', '阻止截止'],
    ['Date blocked', '阻止日期'],
    ['Block settings', '阻止设置'],
    ['Unable to save block settings. Please try again.', '无法保存阻止设置。请重试。'],
    ['This cannot be undone. Please be certain.', '此操作无法撤销。请谨慎操作。'],
    // 个人推送保护：范围状语并入句首片段，supported secrets 与存储库安全设置同译
    ['Block commits that contain', '在 GitHub 上的所有公共存储库中阻止提交中出现'],
    ['supported secrets', '受支持的机密'],
    ['across all public repositories on GitHub.', '。'],
    // 权限标题与事件名：block → 阻止，dismissal request → 消除请求
    ['Block another user', '阻止其他用户'],
    ['Blocking users', '阻止用户'],
    ['Org block', '组织阻止'],
    ['Secret scanning alert dismissal requests', '机密扫描警报消除请求'],
    ['Organization dismissal requests for code scanning', '组织代码扫描消除请求'],
    ['Dismissal request dependabot', 'Dependabot 消除请求'],
    // 产品名按用户要求译成中文（product-names.md）
    ['Codespaces lifecycle admin', '代码空间生命周期管理'],
    ['Organization codespaces secrets', '组织代码空间机密'],
    ['Copilot Spaces', 'Copilot 空间'],
    ['GitHub Copilot Business', 'GitHub Copilot 商业版'],
    ['Beta', '测试版'],
    // 编辑器首选项里的扩展名链接「GitHub Codespaces」
    ['GitHub Codespaces', 'GitHub 代码空间'],
    // 应用授权详情的访问级别：read / write access → 读取 / 写入访问权限
    ['Read-only access', '只读访问权限'],
    ['Read and write access', '读取和写入访问权限'],
    ['Full access', '完全访问权限'],
    // 预定提醒：星期全称 → 星期X
    ['Monday', '星期一'],
    ['Tuesday', '星期二'],
    ['Wednesday', '星期三'],
    ['Thursday', '星期四'],
    ['Friday', '星期五'],
    ['Saturday', '星期六'],
    ['Sunday', '星期日']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('通用词由 common-ui 收录，本词典不重复收录', () => {
    expect(dict.scoped?.['Select repository']).toBeUndefined()
    expect(dict.static?.['Select repository']).toBeUndefined()
    expect(commonUi.static?.['Select repository']).toBeDefined()
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Restore', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('3 accounts', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('Revoke GitHub CLI', ['common', 'org-settings'])).toBeUndefined()
    expect(matcher.translate('Read access to metadata', ['common', 'marketplace'])).toBeUndefined()
    expect(matcher.translate('Expires on Tue, Nov 25 2025', ['common', 'org-settings'])).toBeUndefined()
  })

  it('权限名 Actions、Codespaces 由其他词典（settings-account）提供，整包译文与 PERMISSION_TITLES 一致，本词典不重复收录', () => {
    const full = createMatcher(zhCN)
    for (const name of ['Actions', 'Codespaces']) {
      expect(PROVIDED_TITLES.has(name)).toBe(true)
      expect(dict.scoped?.[name]).toBeUndefined()
      expect(translate(name)).toBeUndefined()
      expect(full.translate(name, ['common', 'settings'])).toBe(PERMISSION_TITLES[name])
    }
    expect(PERMISSION_TITLES.Actions).toBe('操作')
    expect(PERMISSION_TITLES.Codespaces).toBe('代码空间')
  })

  it('译文里不残留英文产品名、方案名（product-names.md）', () => {
    const values = [...Object.values(dict.static ?? {}), ...Object.values(dict.scoped ?? {})]
    const leftover = values.filter(value =>
      /(?<![A-Za-z])(Codespaces|codespace|Marketplace|Copilot Chat|Copilot Spaces|Copilot (?:cloud|coding) agent|Copilot code review|Copilot (?:Pro|Business|Enterprise|Free)|GitHub (?:Mobile|Desktop|Models|Sponsors|Pages|Actions|Free|Pro|Team|Enterprise))(?![A-Za-z+])/.test(
        value
      )
    )
    expect(leftover).toEqual([])
  })
})

describe('settings-developer 被链接拆开的句子（DOM）', () => {
  const SCOPE: readonly PageKey[] = ['common', 'settings']
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function start(html: string): Translator {
    document.body.innerHTML = html
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE, collectUntranslated: true })
    translator.start()
    return translator
  }

  it('个人推送保护：范围状语并入句首片段，句尾片段只剩句号且不留原文空白', () => {
    const t = start(
      '<p id="push-protection">Block commits that contain <a href="https://docs.github.com/code-security/secret-scanning/introduction/supported-secret-scanning-patterns">supported secrets</a> across all public repositories on GitHub.</p>'
    )
    const paragraph = document.getElementById('push-protection')!
    const [head, link, tail] = [...paragraph.childNodes]
    expect(head?.textContent?.trim()).toBe('在 GitHub 上的所有公共存储库中阻止提交中出现')
    expect(link?.textContent).toBe('受支持的机密')
    expect(tail?.textContent).toBe('。')
    // 中文片段与链接之间的原文空白由引擎决定是否保留（已提 engine 请求），这里只核对去掉该空白后的整句
    expect(paragraph.textContent?.replace(/(?<=\p{Script=Han}) (?=\p{Script=Han})/gu, '')).toBe(
      '在 GitHub 上的所有公共存储库中阻止提交中出现受支持的机密。'
    )
    expect(t.drainUntranslated()).toEqual([])
  })

  it('预定提醒：because 从句拆成「你因组织 <strong>组织名</strong> 的当前计划…」', () => {
    const t = start(
      '<p id="reminder">You will only receive notifications from public repositories in this organization because the current plan for <strong>octo-org</strong> does not support reminders for private repositories.</p>'
    )
    expect(document.getElementById('reminder')?.textContent).toBe(
      '你因组织 octo-org 的当前计划不支持专用存储库的提醒而只会收到此组织公共存储库的通知。'
    )
    // 组织名是用户内容，只有它被报为未译
    expect(t.drainUntranslated().map(([text]) => text)).toEqual(['octo-org'])
  })
})

describe('经典令牌列表的作用域（DOM）', () => {
  const SCOPE: readonly PageKey[] = ['common', 'settings']
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  const HTML =
    '<div class="access-token"><span class="token-description"><strong><a href="/settings/tokens/1">test</a></strong>' +
    '<span class="color-fg-muted"><em>— <span title="Full control of enterprises">admin:enterprise</span>, ' +
    '<span title="Full control of public user gpg keys">admin:gpg_key</span>, <span title="Update all user data">user</span></em></span></span></div>' +
    '<label><input type="checkbox" value="repo"> repo</label>'

  it('简体：作用域代码显示为说明，以顿号分隔；新建表单里的代码不变', () => {
    document.body.innerHTML = HTML
    translator = createTranslator({ matcher: createMatcher(zhCN), host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(document.querySelector('em')?.textContent).toBe('— 完全控制企业、完全控制用户公开 GPG 密钥、更新所有用户数据')
    expect(document.querySelector('label')?.textContent?.trim()).toBe('repo')
  })

  it('繁体', () => {
    document.body.innerHTML = HTML
    translator = createTranslator({ matcher: createMatcher(zhTW), host: window, resolvePages: () => SCOPE })
    translator.start()
    expect(document.querySelector('em')?.textContent).toBe('— 完全控制企業、完全控制使用者公開 GPG 金鑰、更新所有使用者資料')
  })
})

describe('Copilot 记忆与梦境（功能页，DOM）', () => {
  const HTML = `<h3 id="title">Copilot Memory</h3>
    <button id="memory" type="button"><span class="fgColor-muted">Copilot Memory:</span> User and repository memories allowed</button>
    <p id="description">Choose which memories Copilot can use in work you start, such as agent sessions and code reviews. If user or repository memory is disabled by organization, enterprise or repository policy, those memories will not be supplied, regardless of your preference. Your preference remains saved and will automatically take effect if the policy later allows memory. Disabling memory does not delete existing memories. While user memories aren't enabled, you can't view or delete them on the Memory page.</p>
    <h4 id="dreaming">Dreaming</h4>
    <p id="intro">Dreaming works in the background to improve the memories and guidance Copilot uses in future coding sessions and code reviews.</p>
    <p id="managed"><strong>Memories are fully managed.</strong> Dreaming applies memory changes automatically, without a pull request or manual approval.</p>
    <p id="scope">Dreaming runs only where the relevant Memory scope and other required policies and features are enabled. Session-based Dreams also require session upload.</p>
    <a id="learn" href="https://docs.github.com/copilot">Learn more about Copilot Dreaming</a>
    <p id="note">This setting controls Dreaming for your user memories. Enable repository Dreaming separately in each repository's settings.</p>`

  function render(bundle: typeof zhCN): Map<string, string | undefined> {
    document.body.innerHTML = HTML
    const translator = createTranslator({
      matcher: createMatcher(bundle),
      host: window,
      resolvePages: () => ['common', 'settings'],
      collectUntranslated: true
    })
    translator.start()
    const shown = new Map([...document.querySelectorAll('[id]')].map(element => [element.id, element.textContent?.trim()]))
    const untranslated = translator.drainUntranslated()
    translator.stop()
    document.body.innerHTML = ''
    expect(untranslated).toEqual([])
    return shown
  }

  it('简体', () => {
    const shown = render(zhCN)
    expect(shown.get('title')).toBe('Copilot 记忆')
    expect(shown.get('memory')?.replace(/\s+/g, '')).toBe('Copilot记忆：允许用户和存储库记忆')
    expect(shown.get('description')).toMatch(/^选择 Copilot 在你发起的工作.+你无法在记忆页面查看或删除它们。$/)
    expect(shown.get('dreaming')).toBe('梦境')
    expect(shown.get('managed')?.replace(/\s+/g, '')).toBe('记忆完全托管。梦境自动应用记忆变更，无需拉取请求或手动批准。')
    expect(shown.get('learn')).toBe('了解 Copilot 梦境')
    expect(shown.get('note')).toBe('此设置控制用户记忆的梦境。存储库的梦境需在各存储库的设置中分别启用。')
  })

  it('繁体', () => {
    const shown = render(zhTW)
    expect(shown.get('memory')?.replace(/\s+/g, '')).toBe('Copilot記憶：允許使用者和儲存庫記憶')
    expect(shown.get('dreaming')).toBe('夢境')
    expect(shown.get('learn')).toBe('瞭解 Copilot 夢境')
    expect(shown.get('scope')).toBe(
      '夢境只會在相關記憶範圍及其他必要的政策和功能都已啟用時執行。以工作階段為基礎的夢境還需要上傳工作階段。'
    )
  })
})

describe('应用设置页的 Web 钩子请求记录', () => {
  const cn = createMatcher(zhCN)
  const tw = createMatcher(zhTW)
  const PERSONAL: readonly PageKey[] = ['common', 'settings']
  const ORG_APP: readonly PageKey[] = ['common', 'org-settings', 'org-apps']
  const ORG_HOOK: readonly PageKey[] = ['common', 'org-settings']

  it.each([
    ['Recent deliveries', '最近请求', '最近交付'],
    ['Recent Deliveries', '最近请求', '最近交付'],
    ['Redeliver', '重新请求', '重新传递'],
    ['redelivery', '重新请求', '重新传递'],
    ['Redeliver payload?', '重新请求有效负载？', '重新传递有效负载？'],
    ['Yes, redeliver this payload', '是，重新请求此有效负载', '是，重新传递此有效负载']
  ])('%s：个人与组织应用设置页为 %s，组织 Web 钩子页为 %s', (input, app, hook) => {
    expect(cn.translate(input, PERSONAL)).toBe(app)
    expect(cn.translate(input, ORG_APP)).toBe(app)
    expect(cn.translate(input, ORG_HOOK)).toBe(hook)
  })

  it('繁体沿用“傳遞”', () => {
    expect(tw.translate('Redeliver', ORG_APP)).toBe('重新傳遞')
    expect(tw.translate('redelivery', PERSONAL)).toBe('重新傳遞')
  })
})
