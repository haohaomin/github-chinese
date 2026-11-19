import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, RegExpRule } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { DEPENDABOT_RULES_SCOPED } from '../../../src/locales/zh-CN/org-settings/security'
import repoSettings from '../../../src/locales/zh-CN/repo-settings'
import access from '../../../src/locales/zh-CN/repo-settings/access'
import actions from '../../../src/locales/zh-CN/repo-settings/actions'
import branches from '../../../src/locales/zh-CN/repo-settings/branches'
import codespaces from '../../../src/locales/zh-CN/repo-settings/codespaces'
import copilot from '../../../src/locales/zh-CN/repo-settings/copilot'
import dangerZone from '../../../src/locales/zh-CN/repo-settings/danger-zone'
import environments from '../../../src/locales/zh-CN/repo-settings/environments'
import general from '../../../src/locales/zh-CN/repo-settings/general'
import nav from '../../../src/locales/zh-CN/repo-settings/nav'
import pages from '../../../src/locales/zh-CN/repo-settings/pages'
import rulesetImport from '../../../src/locales/zh-CN/repo-settings/ruleset-import'
import rulesetInsights from '../../../src/locales/zh-CN/repo-settings/ruleset-insights'
import rulesetRules from '../../../src/locales/zh-CN/repo-settings/ruleset-rules'
import rulesets from '../../../src/locales/zh-CN/repo-settings/rulesets'
import secrets from '../../../src/locales/zh-CN/repo-settings/secrets'
import security from '../../../src/locales/zh-CN/repo-settings/security'
import webhooks from '../../../src/locales/zh-CN/repo-settings/webhooks'
import { zhTW } from '../../../src/locales/zh-TW/index'
import { DEPENDABOT_RULES_SCOPED as TW_DEPENDABOT_RULES_SCOPED } from '../../../src/locales/zh-TW/org-settings/security'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = repoSettings

/** 子文件（与合并顺序一致） */
const PART_MODULES = {
  nav,
  general,
  dangerZone,
  access,
  branches,
  rulesets,
  rulesetRules,
  rulesetInsights,
  rulesetImport,
  actions,
  webhooks,
  environments,
  codespaces,
  pages,
  security,
  secrets,
  copilot
} satisfies Record<string, PageDictionary>

type PartName = keyof typeof PART_MODULES

/** 以通用类型访问子文件 */
const PARTS: Readonly<Record<PartName, PageDictionary>> = PART_MODULES
const PART_NAMES = Object.keys(PARTS) as PartName[]

const matcher = createMatcher([['repo-settings', repoSettings]])

/** 存储库设置页的作用域：common → repository → repo-settings */
const SCOPE = ['common', 'repository', 'repo-settings'] as const

function translate(text: string): string | undefined {
  return matcher.translate(text, SCOPE)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 每个子文件的正则用例，顺序与该子文件的 regexp 一一对应，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: Readonly<Record<PartName, readonly RegExpCase[]>> = {
  nav: [{ hits: [['Settings: octo-org/hello-world', '设置：octo-org/hello-world']], misses: ['Settings: hello-world'] }],
  general: [
    // 存储库名称
    { hits: [['hello-world is available.', 'hello-world 可用。']], misses: ['my.repo_2 is available'] },
    {
      hits: [
        ['The repository hello-world already exists on this account.', '存储库 hello-world 已存在于此帐户中。'],
        ['The repository hello-world already exists on this account', '存储库 hello-world 已存在于此帐户中']
      ],
      misses: ['The repository hello-world already exists']
    },
    // 重命名默认分支
    { hits: [['Rename main to:', '将 main 重命名为：']], misses: ['Rename to:'] },
    { hits: [['main is already the branch name.', 'main 已是当前分支名称。']], misses: ['main is the branch name.'] },
    {
      hits: [
        ['Will update 3 pull requests targeting this branch.', '将更新 3 个以此分支为目标的拉取请求。'],
        ['Will update 1 pull request targeting this branch.', '将更新 1 个以此分支为目标的拉取请求。']
      ],
      misses: ['Will update pull requests targeting this branch.']
    },
    {
      hits: [
        ['Will update 2 branch protection rules that explicitly target main.', '将更新 2 条明确针对 main 的分支保护规则。'],
        ['Will update 1 branch protection rule that explicitly targets release/*', '将更新 1 条明确针对 release/* 的分支保护规则']
      ],
      misses: ['Will update branch protection rules that explicitly target main.']
    },
    {
      hits: [
        ['Will close 4 open pull requests for this branch.', '将关闭 4 个来自此分支的打开的拉取请求。'],
        ['Will close 1 open pull request for this branch.', '将关闭 1 个来自此分支的打开的拉取请求。']
      ],
      misses: ['Will close open pull requests for this branch.']
    },
    // 切换默认分支
    {
      hits: [
        [
          'Choose another branch to use as the default branch of octo-org/hello-world instead of main',
          '选择另一个分支替代 main 作为 octo-org/hello-world 的默认分支'
        ],
        [
          'Choose another branch to use as the default branch of hello-world instead of master',
          '选择另一个分支替代 master 作为 hello-world 的默认分支'
        ]
      ],
      misses: ['Choose another branch to use as the default branch']
    },
    {
      hits: [
        ['Default branch changed to develop', '默认分支已更改为 develop'],
        ['Default branch updated to main', '默认分支已更改为 main']
      ],
      misses: ['Default branch is main']
    },
    // 社交预览
    {
      hits: [
        [
          'You can upload a social image, but it will not be visible publicly while octo-org/hello-world is private.',
          '你可以上传社交图片，但 octo-org/hello-world 为专用存储库，图片不会公开显示。'
        ]
      ],
      misses: ['You can upload a social image, but it will not be visible publicly.']
    },
    {
      hits: [
        ['Are you sure you want to remove octo-org/hello-world’s promotional image?', '确定要删除 octo-org/hello-world 的推广图片吗？'],
        ["Are you sure you want to remove octo-org/hello-world's promotional image?", '确定要删除 octo-org/hello-world 的推广图片吗？']
      ],
      misses: ['Are you sure you want to remove this promotional image?']
    }
  ],
  dangerZone: [
    {
      hits: [
        ['Make octo-org/hello-world private', '将 octo-org/hello-world 设为专用'],
        ['Make hello-world public', '将 hello-world 设为公共'],
        ['Make hello-world internal', '将 hello-world 设为内部']
      ],
      misses: ['Make hello-world secret']
    },
    {
      hits: [
        ['1,234 stars', '1,234 个星标'],
        ['1 star', '1 个星标']
      ],
      misses: ['Many stars']
    },
    {
      hits: [
        ['12 watchers', '12 个关注者'],
        ['1 watcher', '1 个关注者']
      ],
      misses: ['Some watchers']
    },
    {
      hits: [
        ['To confirm, type "octo-org/hello-world" in the box below', '要确认，请在下方输入框中输入“octo-org/hello-world”'],
        ['To confirm, type "1234" in the box below:', '要确认，请在下方输入框中输入“1234”：'],
        ['To confirm, type “octo-org/hello-world” in the box below', '要确认，请在下方输入框中输入“octo-org/hello-world”']
      ],
      misses: ['To confirm, type octo-org/hello-world in the box below']
    },
    {
      hits: [
        ['3 branch protection rules', '3 条分支保护规则'],
        ['1 branch protection rule', '1 条分支保护规则']
      ],
      misses: ['Some branch protection rules']
    },
    {
      hits: [['Please type octo-org/hello-world to confirm.', '请输入 octo-org/hello-world 以确认。']],
      misses: ['Please type to confirm.']
    },
    {
      hits: [['This will make octo-org/hello-world read-write.', '这将使 octo-org/hello-world 恢复读写。']],
      misses: ['This will make read-write.']
    },
    {
      hits: [['Your repository "hello-world" was successfully archived.', '存储库“hello-world”已存档。']],
      misses: ['Your repository hello-world was successfully archived.']
    },
    {
      hits: [['Your repository "hello-world" was successfully unarchived.', '存储库“hello-world”已取消存档。']],
      misses: ['Your repository hello-world was successfully unarchived.']
    },
    { hits: [['Delete octo-org/hello-world', '删除 octo-org/hello-world']], misses: ['Delete branch'] },
    {
      hits: [
        [
          'This will permanently delete the octo-org/hello-world repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations.',
          '这将永久删除 octo-org/hello-world 存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有协作者关联。'
        ],
        [
          'This will permanently delete the octo-org/hello-world repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all team associations.',
          '这将永久删除 octo-org/hello-world 存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有团队关联。'
        ]
      ],
      misses: ['This will permanently delete the octo-org/hello-world repository.']
    }
  ],
  access: [
    {
      hits: [
        [
          '3 collaborators have access to this repository. Only you can contribute to this repository.',
          '3 个协作者有权访问此存储库。只有你可以为此存储库做贡献。'
        ],
        [
          '1 collaborator has access to this repository. Only you can contribute to this repository.',
          '1 个协作者有权访问此存储库。只有你可以为此存储库做贡献。'
        ]
      ],
      misses: ['Collaborators have access to this repository. Only you can contribute to this repository.']
    },
    {
      hits: [
        ['3 collaborators have access to this repository.', '3 个协作者有权访问此存储库。'],
        ['1 collaborator has access to this repository.', '1 个协作者有权访问此存储库。']
      ],
      misses: ['Collaborators have access to this repository.']
    },
    {
      hits: [
        ['5 teams or members have access to this repository.', '5 个团队或成员有权访问此存储库。'],
        ['1 team or member has access to this repository', '1 个团队或成员有权访问此存储库']
      ],
      misses: ['Teams or members have access to this repository.']
    },
    {
      hits: [
        ['3 collaborators', '3 个协作者'],
        ['1 collaborator', '1 个协作者']
      ],
      misses: ['Some collaborators']
    },
    {
      hits: [
        ['12 members', '12 个成员'],
        ['1 member', '1 个成员']
      ],
      misses: ['Many members']
    },
    {
      hits: [
        ['4 teams', '4 个团队'],
        ['1 team', '1 个团队']
      ],
      misses: ['Teams list']
    },
    {
      hits: [
        ['7 users', '7 个用户'],
        ['1 user', '1 个用户']
      ],
      misses: ['User list']
    },
    {
      hits: [
        ['2 invitations', '2 个邀请'],
        ['1 invitation', '1 个邀请']
      ],
      misses: ['Some invitations']
    },
    {
      hits: [
        ['3 members selected…', '已选择 3 个成员…'],
        ['1 member selected...', '已选择 1 个成员...']
      ],
      misses: ['Members selected…']
    },
    {
      hits: [['All members of octo-org can access this repository.', 'octo-org 的所有成员都可以访问此存储库。']],
      misses: ['All members can access this repository.']
    },
    { hits: [['Add people to octo-org', '添加人员到 octo-org']], misses: ['Add people to the organization'] },
    { hits: [['Add teams to octo-org', '添加团队到 octo-org']], misses: ['Add teams to the organization'] },
    { hits: [['Add octocat to this repository', '将 octocat 添加到此存储库']], misses: ['Add to this repository'] },
    {
      hits: [['Add octocat to octo-org/hello-world', '将 octocat 添加到 octo-org/hello-world']],
      misses: ['Add octocat to hello-world']
    },
    {
      hits: [['octocat has been added as a collaborator on the repository.', '已将 octocat 添加为存储库协作者。']],
      misses: ['has been added as a collaborator on the repository.']
    },
    {
      hits: [
        ['octocat • Collaborator', 'octocat • 协作者'],
        ['octocat • Invite collaborator', 'octocat • 邀请协作者']
      ],
      misses: ['octocat • Owner']
    },
    {
      hits: [
        ['Awaiting octocat’s response', '等待 octocat 回复'],
        ["Awaiting octocat's response", '等待 octocat 回复']
      ],
      misses: ['Awaiting response']
    },
    {
      hits: [
        ['Cancel octocat’s invitation', '取消对 octocat 的邀请'],
        ["Cancel octocat's invitation", '取消对 octocat 的邀请']
      ],
      misses: ['Cancel invitation']
    },
    {
      hits: [['octocat is no longer invited to this repository.', 'octocat 不再受邀访问此存储库。']],
      misses: ['is no longer invited to this repository.']
    },
    {
      hits: [
        ['Remove octocat from this repository?', '从此存储库中删除 octocat？'],
        ['Remove octocat from this repository', '从此存储库中删除 octocat']
      ],
      misses: ['Remove from this repository?']
    },
    {
      hits: [['Removed octocat as a collaborator of octo-org/hello-world.', '已将 octocat 从 octo-org/hello-world 的协作者中删除。']],
      misses: ['Removed octocat as a collaborator of hello-world.']
    },
    // 调解选项：交互限制
    {
      hits: [
        [
          'You can restrict repository interactions across the octo-org organization in your',
          '你可以在以下位置限制整个 octo-org 组织的存储库交互'
        ]
      ],
      misses: ['You can restrict repository interactions across the organization in your']
    },
    {
      hits: [
        [
          'to the main branch of this repository will be unable to interact with the repository.',
          '到此存储库 main 分支的用户将无法与此存储库交互。'
        ]
      ],
      misses: ['to the branch of this repository will be unable to interact with the repository.']
    },
    {
      hits: [
        [
          'Users that have not previously committed to the main branch of this repository will be unable to interact with the repository.',
          '从未向此存储库 main 分支提交过的用户将无法与此存储库交互。'
        ]
      ],
      misses: ['Users that have not previously committed to the branch of this repository will be unable to interact with the repository.']
    },
    // 拉取请求限制
    {
      hits: [
        [
          'Currently, users without write access can have up to 5 open pull requests at a time. Draft pull requests do not count toward this limit.',
          '目前，无写入访问权限的用户最多可同时有 5 个打开的拉取请求。草稿拉取请求不计入此限制。'
        ],
        [
          'Currently, users without write access can have up to 1 open pull request at a time. Draft pull requests count toward this limit.',
          '目前，无写入访问权限的用户最多可同时有 1 个打开的拉取请求。草稿拉取请求计入此限制。'
        ]
      ],
      misses: ['Currently, users without write access can have up to open pull requests at a time.']
    }
  ],
  branches: [
    {
      hits: [
        ['Currently applies to 2 branches', '当前适用于 2 个分支'],
        ['Applies to 1 branch', '适用于 1 个分支'],
        ['Applies to 3 branches.', '适用于 3 个分支。']
      ],
      misses: ['Applies to branches']
    },
    {
      hits: [
        ['Applies to 2 branches:', '适用于 2 个分支：'],
        ['Applies to 1 branch:', '适用于 1 个分支：']
      ],
      misses: ['Applies to branches:']
    },
    {
      hits: [
        ['Applies to 3 tags', '适用于 3 个标签'],
        ['Applies to 1 tag.', '适用于 1 个标签。']
      ],
      misses: ['Applies to tags']
    }
  ],
  rulesets: [
    {
      hits: [
        ['6 branch rules', '6 条分支规则'],
        ['1 tag rule', '1 条标签规则'],
        ['6 branch rules • targeting 1 branch', '6 条分支规则 • 针对 1 个分支'],
        ['1 push rule · targeting 5 repositories', '1 条推送规则 • 针对 5 个存储库'],
        ['2 push rules • targeting all pushes', '2 条推送规则 • 针对所有推送'],
        ['100+ branch rules • targeting 100+ branches', '100+ 条分支规则 • 针对 100+ 个分支'],
        ['3 branch rules • targeting branches (too many to display)', '3 条分支规则 • 针对分支（过多无法显示）'],
        ['2 repository rules • targeting 3 repositories', '2 条存储库规则 • 针对 3 个存储库']
      ],
      misses: ['Some branch rules', '6 branch rules targeting 1 branch']
    },
    {
      hits: [
        ['• targeting 1 branch', '• 针对 1 个分支'],
        [', targeting 2 tags', '，针对 2 个标签'],
        ['· targeting 100+ repositories', '• 针对 100+ 个存储库']
      ],
      misses: ['• targeting branches']
    },
    {
      hits: [
        ['3 Copilot code review rules', '3 条 Copilot 代码审查规则'],
        ['3 Copilot code review rules • targeting 2 branches in this repository', '3 条 Copilot 代码审查规则 • 针对此存储库中的 2 个分支'],
        [
          '1 Copilot code review rule • targeting branches (too many to display) in this repository',
          '1 条 Copilot 代码审查规则 • 针对此存储库中的分支（过多无法显示）'
        ]
      ],
      misses: ['Copilot code review rules']
    },
    {
      hits: [
        ['targeting 4 repositories', '针对 4 个存储库'],
        ['targeting 1 target', '针对 1 个目标'],
        ['targeting 1 organization', '针对 1 个组织'],
        ['targeting 3 branch conditions', '针对 3 个分支条件'],
        ['targeting all pushes', '针对所有推送'],
        ['targeting 2 branches in this repository', '针对此存储库中的 2 个分支'],
        ['targeting branches (too many to display)', '针对分支（过多无法显示）']
      ],
      misses: ['targeting branches']
    },
    {
      hits: [
        ['3 repository rulesets', '3 个存储库规则集'],
        ['1 repository ruleset', '1 个存储库规则集'],
        ['1 organization ruleset', '1 个组织规则集'],
        ['12 rulesets', '12 个规则集']
      ],
      misses: ['Some repository rulesets']
    },
    {
      hits: [
        ['6 rules', '6 条规则'],
        ['1 rule', '1 条规则'],
        ['100+ rules', '100+ 条规则']
      ],
      misses: ['Many rules']
    },
    {
      hits: [
        ['Applies to 3 targets:', '适用于 3 个目标：'],
        ['Applies to 1 target', '适用于 1 个目标'],
        ['Applies to 12 targets including', '适用于 12 个目标包括']
      ],
      misses: ['Applies to targets:']
    },
    {
      hits: [
        ['3 targets:', '3 个目标：'],
        ['1 target:', '1 个目标：'],
        ['12 targets including', '12 个目标包括'],
        ['5 targets', '5 个目标']
      ],
      misses: ['Some targets:', '12 targets included']
    },
    {
      hits: [
        ['Active, Enforcement status', '活动，强制实施状态'],
        ['Evaluate, Enforcement status', '评估，强制实施状态'],
        ['Disabled, Enforcement status', '已禁用，强制实施状态']
      ],
      misses: ['Enforcement status, Active']
    },
    {
      hits: [
        ['All, Filter actors by category', '全部，按类别筛选参与者'],
        ['Teams, Filter actors by category', '团队，按类别筛选参与者']
      ],
      misses: ['Bots, Filter actors by category']
    },
    {
      hits: [
        ['- This ruleset will be enforced', '- 将强制实施此规则集'],
        ['- This ruleset will not be enforced', '- 不会强制实施此规则集'],
        ['- Evaluate this ruleset to trial rules and view insights', '- 评估此规则集以试用规则并查看洞察']
      ],
      misses: ['- This ruleset will be ignored']
    },
    {
      hits: [
        ['No roles in bypass list', '绕过列表中没有角色'],
        ['No other actors in allow list', '允许列表中没有其他参与者']
      ],
      misses: ['No bots in bypass list']
    },
    {
      hits: [
        ['Team • @devs', '团队 • @devs'],
        ['App • octo-org', '应用 • octo-org']
      ],
      misses: ['Team •', 'User • octocat']
    },
    {
      hits: [
        ['Branch conditions missing', '缺少分支条件'],
        ['Repository conditions missing', '缺少存储库条件']
      ],
      misses: ['Conditions missing']
    },
    {
      hits: [['Example patterns: "main", "releases/**/*", "users/**/*".', '模式示例："main", "releases/**/*", "users/**/*"。']],
      misses: ['Example patterns: main, dev.']
    },
    { hits: [['3 values selected', '已选择 3 个值']], misses: ['Some values selected'] },
    {
      hits: [
        ['View history for the ruleset named main-protection', '查看规则集 main-protection 的历史记录'],
        ['View insights for the ruleset named Release rules', '查看规则集 Release rules 的洞察']
      ],
      misses: ['View history for the ruleset']
    },
    {
      hits: [['Error importing ruleset: Invalid JSON', '导入规则集时出错：Invalid JSON']],
      misses: ['Error importing ruleset:']
    },
    { hits: [['Managed by octo-org', '由 octo-org 管理']], misses: ['Managed by @octo-org'] },
    {
      hits: [
        ['As an octo-org admin, you can', '作为 octo-org 管理员，你可以'],
        ['As a github admin, you can', '作为 github 管理员，你可以']
      ],
      misses: ['As an admin, you can']
    },
    {
      hits: [
        ['manage octo-org rulesets in organization settings.', '在组织设置中管理 octo-org 规则集。'],
        ['manage octo-ent rulesets in enterprise settings.', '在企业设置中管理 octo-ent 规则集。']
      ],
      misses: ['manage rulesets in organization settings.']
    }
  ],
  rulesetRules: [
    {
      hits: [
        ['Commit message must start with a matching pattern', '提交消息必须以匹配模式开头'],
        ['Author email must not end with a matching pattern', '作者电子邮件不得以匹配模式结尾'],
        ['Committer email must contain a matching pattern', '提交者电子邮件必须包含匹配模式'],
        ['Branch name must match a given regex pattern', '分支名称必须匹配给定的正则表达式'],
        ['Tag name must not contain a matching pattern', '标签名称不得包含匹配模式']
      ],
      misses: ['Commit message must be short']
    },
    {
      hits: [
        ['Merge, Squash', '合并、压缩'],
        ['Squash, Rebase, Merge', '压缩、变基、合并'],
        ['Merge, Squash, Rebase', '合并、压缩、变基']
      ],
      misses: ['Merge Squash', 'Merge, Merge, Merge, Merge']
    },
    { hits: [['Already added ci/build', '已添加 ci/build']], misses: ['Already added'] },
    {
      hits: [
        ['Add ci/build', '添加 ci/build'],
        ['Add lint:check', '添加 lint:check'],
        ['Add build.yml', '添加 build.yml']
      ],
      misses: ['Add build', 'Add some checks']
    },
    { hits: [['Select all (3)', '全选 (3)']], misses: ['Select all'] },
    {
      hits: [
        ['2 reviewers', '2 个审查者'],
        ['1 reviewer', '1 个审查者']
      ],
      misses: ['Some reviewers']
    },
    { hits: [['Show +3 more', '再显示 3 个']], misses: ['Show more'] },
    { hits: [['+ 4 more', '+ 4 个']], misses: ['+4 more'] },
    { hits: [["No teams found for 'core'", '未找到与“core”匹配的团队']], misses: ['No teams found for core'] },
    {
      hits: [
        ['File path cannot be empty', '文件路径不能为空'],
        ['File extension has already been added', '文件扩展名已添加'],
        ['Maximum file size (MB) must be a whole number', '最大文件大小 (MB) 必须为整数']
      ],
      misses: ['File path is invalid']
    }
  ],
  rulesetInsights: [
    {
      hits: [
        ['3 rulesets passed', '3 个规则集通过'],
        ['2 rulesets passed and 1 ruleset failed', '2 个规则集通过且 1 个规则集失败'],
        ['1 ruleset passed, 1 ruleset bypassed and 2 rulesets skipped', '1 个规则集通过、1 个规则集被绕过、2 个规则集已跳过']
      ],
      misses: ['Some rulesets passed']
    },
    {
      hits: [
        ['2 rules failed', '2 条规则失败'],
        ['1 rule bypassed', '1 条规则被绕过']
      ],
      misses: ['2 rules passed']
    },
    {
      hits: [['Merge group of 3 pull requests blocked', '包含 3 个拉取请求的合并组被阻止']],
      misses: ['Merge group blocked']
    },
    {
      hits: [
        ['triggered a pull_request workflow run', '触发了 pull_request 工作流运行'],
        ['triggered an issue_comment workflow run', '触发了 issue_comment 工作流运行']
      ],
      misses: ['triggered the deploy workflow run']
    },
    { hits: [['Stack position: 2', '堆栈位置：2']], misses: ['Stack position: top'] },
    {
      hits: [
        ['Final merge failed: Unknown reason', '最终合并失败：未知原因'],
        ['Final merge failed: Merge conflict', '最终合并失败：Merge conflict']
      ],
      misses: ['Final merge failed']
    },
    { hits: [['and 2 others.', '及另外 2 人。']], misses: ['and others.'] },
    {
      hits: [['Found 120 violations (showing first 100)', '发现 120 处违规（显示前 100 处）']],
      misses: ['Found violations']
    }
  ],
  rulesetImport: [
    {
      hits: [
        ['will be created from 2 branch protection rules.', '将从 2 条分支保护规则创建。'],
        ['will be created from 1 branch protection rule.', '将从 1 条分支保护规则创建。']
      ],
      misses: ['will be created from branch protection rules.']
    },
    {
      hits: [
        [
          '3 rulesets will be created. Would you like to delete the 2 original branch protection rules now covered by rulesets?',
          '将创建 3 个规则集。是否删除现已被规则集覆盖的 2 条原有分支保护规则？'
        ]
      ],
      misses: ['Rulesets will be created.']
    },
    { hits: [['Create 2 rulesets from "main"', '从“main”创建 2 个规则集']], misses: ['Create rulesets from "main"'] },
    { hits: [['Create 3 rulesets', '创建 3 个规则集']], misses: ['Create many rulesets'] },
    {
      hits: [['This branch protection rule will be split into 3 rulesets.', '此分支保护规则将拆分为 3 个规则集。']],
      misses: ['This branch protection rule will be split.']
    },
    {
      hits: [
        [', with 2 bypass actors', '，含 2 个绕过参与者'],
        [', with 1 bypass actor', '，含 1 个绕过参与者']
      ],
      misses: [', with bypass actors']
    },
    {
      hits: [
        [
          "You've manually selected 12 repositories. A custom property lets you target them as a group and keeps the list up to date as repositories change.",
          '你已手动选择 12 个存储库。自定义属性可将它们作为一组选为目标并在存储库变化时保持列表最新。'
        ]
      ],
      misses: ["You've manually selected repositories."]
    },
    {
      hits: [['Ruleset updated to target team value', '规则集已更新为以 team 值为目标']],
      misses: ['Ruleset updated to target value']
    },
    {
      hits: [
        [
          'The team property has been created and applied to the 12 selected repositories. You should make sure to set values for the remaining repositories.',
          '已创建 team 属性并应用到 12 个所选存储库。请确保为其余存储库设置值。'
        ]
      ],
      misses: ['The property has been created.']
    },
    {
      hits: [['This property will be set to this value on the 12 selected repositories.', '此属性将在 12 个所选存储库上设为此值。']],
      misses: ['This property will be set to this value.']
    },
    { hits: [['and 5 more', '及另外 5 个']], misses: ['and more'] },
    { hits: [['Step 1 of 2', '步骤 1/2']], misses: ['Step one of two'] }
  ],
  actions: [
    {
      hits: [['Allow octo-org actions and reusable workflows', '允许 octo-org 的操作和可复用工作流']],
      misses: ['Allow actions and reusable workflows']
    },
    {
      hits: [
        [
          'Allow octo-org, and select non-octo-org, actions and reusable workflows',
          '允许 octo-org 以及选定的非 octo-org 的操作和可复用工作流'
        ]
      ],
      misses: ['Allow octo-org, and select non-octo-org actions and reusable workflows']
    },
    {
      hits: [
        [
          'Any action or reusable workflow defined in a repository within octo-org can be used.',
          '可以使用 octo-org 中任何存储库定义的操作或可复用工作流。'
        ]
      ],
      misses: ['Any action or reusable workflow defined in a repository can be used.']
    },
    {
      hits: [
        [
          'Any action or reusable workflow that matches the specified criteria, plus those defined in a repository within octo-org, can be used.',
          '可以使用符合指定条件的操作或可复用工作流，以及 octo-org 中任何存储库定义的操作或可复用工作流。'
        ]
      ],
      misses: ['Any action or reusable workflow that matches the specified criteria can be used.']
    },
    {
      hits: [
        ['There is a maximum limit of 90 days.', '上限为 90 天。'],
        ['There is a maximum limit of 400 days', '上限为 400 天']
      ],
      misses: ['There is a maximum limit of days.']
    },
    {
      hits: [['Your organization has set a maximum limit of 30 days.', '你的组织设置的上限为 30 天。']],
      misses: ['Your organization has set a maximum limit of days.']
    },
    {
      hits: [
        ['Retention can be set up to 90 days.', '保留期最多可设为 90 天。'],
        ['Retention can be set up to 7 days', '保留期最多可设为 7 天']
      ],
      misses: ['Retention can be set up to days']
    },
    {
      hits: [
        ['Total cache size can be set up to 10 GB.', '缓存总大小最多可设为 10 GB。'],
        ['Total cache size can be set up to 10GB', '缓存总大小最多可设为 10 GB']
      ],
      misses: ['Total cache size can be set up to GB']
    },
    {
      hits: [
        ['Retention period must be less than or equal to 90 days.', '保留期不能超过 90 天。'],
        ['Retention period must be 1 days or more.', '保留期不能少于 1 天。']
      ],
      misses: ['Retention period must be positive.']
    },
    {
      hits: [
        ['Cache size must be less than or equal to 10000 GB.', '缓存大小不能超过 10000 GB。'],
        ['Cache size must be 10 GB or more.', '缓存大小不能少于 10 GB。']
      ],
      misses: ['Cache size must be positive.']
    },
    {
      hits: [
        ["Accessible from repositories owned by the user 'octocat'", '可从用户 octocat 拥有的存储库访问'],
        ['Accessible from repositories owned by the user octocat', '可从用户 octocat 拥有的存储库访问']
      ],
      misses: ['Accessible from repositories owned by the user']
    },
    {
      hits: [
        ["Accessible from repositories in the 'octo-org' organization", '可从 octo-org 组织中的存储库访问'],
        ['Accessible from repositories in the octo-org organization', '可从 octo-org 组织中的存储库访问']
      ],
      misses: ['Accessible from repositories in the organization']
    },
    {
      hits: [["Accessible from repositories in the 'octo-ent' enterprise", '可从 octo-ent 企业中的存储库访问']],
      misses: ['Accessible from repositories in the enterprise']
    },
    // 策略：pull_request_target 限制公告
    {
      hits: [
        ['On December 2, 2026, GitHub will restrict', '2026年12月2日起，GitHub 将默认在公共存储库中限制'],
        ['On Dec 2, 2026, GitHub will restrict', '2026年12月2日起，GitHub 将默认在公共存储库中限制']
      ],
      misses: ['On a later date, GitHub will restrict']
    },
    {
      hits: [
        [
          'On December 2, 2026, GitHub will restrict pull_request_target on public repositories by default. To continue allowing the event trigger, configure an Actions policy.',
          '2026年12月2日起，GitHub 将默认在公共存储库中限制 pull_request_target 事件。如需继续允许此事件触发器，请配置操作策略。'
        ]
      ],
      misses: ['GitHub will restrict pull_request_target on public repositories by default.']
    },
    {
      hits: [
        [
          "Add `self-hosted` to your workflow's YAML to send jobs to this runner.",
          '将 `self-hosted` 添加到工作流 YAML 即可将作业发送到此运行器。'
        ],
        ['Add `gpu` to your workflow’s YAML to send jobs to this runner.', '将 `gpu` 添加到工作流 YAML 即可将作业发送到此运行器。']
      ],
      misses: ["Add self-hosted to your workflow's YAML to send jobs to this runner."]
    },
    {
      hits: [['Add new self-hosted runner · octo-org/hello-world', '添加新的自托管运行器 · octo-org/hello-world']],
      misses: ['Add new self-hosted runner · hello-world']
    }
  ],
  webhooks: [
    {
      hits: [['Last delivery was not successful. Invalid HTTP Response: 404', '最近一次交付失败。Invalid HTTP Response: 404']],
      misses: ['Last delivery was not successful']
    },
    {
      hits: [
        [
          'This action cannot be undone. Future events will no longer be delivered to this webhook (https://example.com/hook).',
          '此操作无法撤销。今后的事件将不再交付到此 Web 钩子 (https://example.com/hook)。'
        ],
        [
          'This action cannot be undone. Future events will no longer be delivered to this webhook (https://example.com/hook)',
          '此操作无法撤销。今后的事件将不再交付到此 Web 钩子 (https://example.com/hook)'
        ]
      ],
      misses: ['This action cannot be undone. Future events will no longer be delivered to this webhook https://example.com/hook']
    },
    {
      hits: [
        ['Completed in 0.42 seconds.', '耗时 0.42 秒。'],
        ['Completed in 1 second', '耗时 1 秒']
      ],
      misses: ['Completed in seconds.']
    },
    {
      hits: [
        [
          'The payload will be delivered to https://example.com/hook using the current webhook configuration.',
          '有效负载将按当前 Web 钩子配置交付到 https://example.com/hook。'
        ]
      ],
      misses: ['The payload will be delivered using the current webhook configuration.']
    },
    { hits: [['Developed by octo-org', '开发人员 octo-org']], misses: ['Developed by @octocat'] }
  ],
  environments: [
    {
      hits: [
        ['3 protection rules', '3 条保护规则'],
        ['1 protection rule', '1 条保护规则']
      ],
      misses: ['Many protection rules']
    },
    {
      hits: [
        ['2 secrets', '2 个机密'],
        ['1 secret', '1 个机密']
      ],
      misses: ['Some secrets']
    },
    {
      hits: [
        ['5 variables', '5 个变量'],
        ['1 variable', '1 个变量']
      ],
      misses: ['Some variables']
    },
    {
      hits: [
        ['Add up to 5 more reviewers', '最多还可添加 5 个审查者'],
        ['Add up to 1 more reviewer', '最多还可添加 1 个审查者']
      ],
      misses: ['Add up to more reviewers']
    },
    {
      hits: [
        [
          'Applies to 3 branches. Based on the existing repository branch protection rules.',
          '适用于 3 个分支。依据现有的存储库分支保护规则。'
        ]
      ],
      misses: ['Applies to branches. Based on the existing repository branch protection rules.']
    }
  ],
  codespaces: [
    {
      hits: [
        ['3 versions', '3 个版本'],
        ['1 version', '1 个版本']
      ],
      misses: ['Versions']
    }
  ],
  pages: [
    {
      hits: [['Your site is live at https://octocat.github.io/hello-world/', '你的站点已上线于 https://octocat.github.io/hello-world/']],
      misses: ['Your site is live']
    },
    {
      hits: [
        ['Your site is published at https://octocat.github.io/', '你的站点发布于 https://octocat.github.io/'],
        ['Your site is ready to be published at https://octocat.github.io/', '你的站点发布于 https://octocat.github.io/']
      ],
      misses: ['Your site is published']
    },
    { hits: [['Last deployed by octocat', '最近部署者 octocat']], misses: ['Last deployed by @octocat'] },
    {
      hits: [
        [
          'Your GitHub Pages site is currently being built from the /docs folder in the main branch.',
          '你的 GitHub 页面站点当前构建自 main 分支中的 /docs 文件夹。'
        ]
      ],
      misses: ['Your GitHub Pages site is currently being built from the folder in the branch.']
    },
    {
      hits: [
        ['Your GitHub Pages site is currently being built from the gh-pages branch.', '你的 GitHub 页面站点当前构建自 gh-pages 分支。']
      ],
      misses: ['Your GitHub Pages site is currently being built.']
    },
    {
      hits: [
        [
          'Your site was last deployed to the github-pages environment by the pages build and deployment workflow.',
          '你的站点最近一次通过 pages build and deployment 工作流部署到 github-pages 环境。'
        ]
      ],
      misses: ['Your site was last deployed to the environment by the workflow.']
    },
    {
      hits: [
        [
          'Custom domains allow you to serve your site from a domain other than octocat.github.io.',
          '自定义域可让站点使用 octocat.github.io 之外的域提供服务。'
        ],
        [
          'Custom domains allow you to serve your site from a domain other than octocat.github.io',
          '自定义域可让站点使用 octocat.github.io 之外的域提供服务'
        ]
      ],
      misses: ['Custom domains allow you to serve your site from another domain']
    },
    { hits: [['Unpublish octocat/hello-world', '取消发布 octocat/hello-world']], misses: ['Unpublish hello-world'] }
  ],
  security: [
    {
      hits: [
        ['Last scan 2 hours ago', '上次扫描于 2小时前'],
        ['Last scan on Oct 26, 2026', '上次扫描于 2026年10月26日'],
        ['Last scan yesterday', '上次扫描于昨天']
      ],
      misses: ['Last scan sometime']
    },
    { hits: [['Next scan in 3 days', '下次扫描于 3天后']], misses: ['Next scan soon'] },
    {
      hits: [
        ['4 of 4 languages selected', '已选择 4 种语言中的 4 种'],
        ['1 of 3 languages selected', '已选择 3 种语言中的 1 种']
      ],
      misses: ['All languages selected']
    },
    // 推送保护绕过列表标题（存储库高级安全设置页；含单数、0）
    {
      hits: [
        ['3 actors', '3 个参与者'],
        ['1 actor', '1 个参与者'],
        ['0 actors', '0 个参与者']
      ],
      misses: ['No actors', '3 bypass actors', '3 actors selected', 'Select 3 actors']
    },
    // 绕过列表每行菜单按钮的读屏名称（不带名称的提示文字由规则集 static 收录）：名称是 actor.name 原值，
    // 内置角色（admin、maintain、write、Organization admin）与兜底词 Unknown 用译名，其余名称原样保留
    {
      hits: [
        ['octo-team Bypass actor actions', '绕过参与者 octo-team 的操作'],
        ['admin Bypass actor actions', '绕过参与者管理员的操作'],
        ['maintain Bypass actor actions', '绕过参与者维护的操作'],
        ['write Bypass actor actions', '绕过参与者写入的操作'],
        ['Organization admin Bypass actor actions', '绕过参与者组织管理员的操作'],
        ['Unknown Bypass actor actions', '绕过参与者未知的操作'],
        // 只认原值：大小写不同、原型链上的键按普通名称保留
        ['Admin Bypass actor actions', '绕过参与者 Admin 的操作'],
        ['constructor Bypass actor actions', '绕过参与者 constructor 的操作']
      ],
      misses: ['octo-team Bypass actor', 'octo-team Bypass actor actions menu', 'Bypass actor actions for octo-team']
    },
    // Dependabot 规则（与组织设置共用）
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
          'This will permanently delete the rule "Sample text" and potentially reopen associated alerts.',
          '这将永久删除规则“Sample text”并可能重新打开相关警报。'
        ]
      ],
      misses: ['This will permanently delete the rule and potentially reopen associated alerts.']
    }
  ],
  secrets: [
    {
      hits: [
        ['Updated Oct 26, 2026', '更新于 2026年10月26日'],
        ['Updated Mar 3', '更新于 3月3日']
      ],
      misses: ['Updated yesterday']
    },
    {
      hits: [
        ['Added on Oct 26, 2026', '添加于 2026年10月26日'],
        ['Added on 26 Oct 2026', '添加于 2026年10月26日']
      ],
      misses: ['Added on yesterday']
    },
    {
      hits: [
        ['Last used within the last 2 weeks', '最近 2周内使用过'],
        ['Last used within the last 3 months', '最近 3个月内使用过']
      ],
      misses: ['Last used within the last 2 years']
    },
    {
      hits: [
        ['— Read', '— 只读'],
        ['— Read/write', '— 读写']
      ],
      misses: ['— Write']
    },
    {
      hits: [['Are you sure you want to delete NPM_TOKEN?', '确定要删除 NPM_TOKEN 吗？']],
      misses: ['Are you sure you want to delete npm_token?', 'Are you sure you want to delete this?']
    },
    {
      hits: [
        ['Edit DOCKERHUB_TOKEN', '编辑 DOCKERHUB_TOKEN'],
        ['Delete GHCR_TOKEN', '删除 GHCR_TOKEN'],
        ['Update NPM_TOKEN', '更新 NPM_TOKEN'],
        ['Remove _PRIVATE_KEY', '移除 _PRIVATE_KEY']
      ],
      misses: ['Edit token', 'Delete A', 'Edit 1TOKEN']
    }
  ],
  copilot: []
}

const RULES = dict.regexp ?? []

/** 合并后首个命中的正则 */
function firstRule(input: string): RegExpRule | undefined {
  return RULES.find(([pattern]) => pattern.test(input))
}

const CASE_ENTRIES = PART_NAMES.flatMap(name =>
  REGEXP_CASES[name].map((item, index) => ({ name, index, item, rule: PARTS[name].regexp?.[index] }))
)
const HITS = CASE_ENTRIES.flatMap(({ name, index, item }) =>
  item.hits.map(([input, expected]) => [`${name}#${index}`, input, expected] as const)
)
const MISSES = CASE_ENTRIES.flatMap(({ name, index, item }) => item.misses.map(input => [`${name}#${index}`, input] as const))

describe('repo-settings 正则词条', () => {
  it.each(HITS)('%s：%s → %s', (_, input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('%s 不命中：%s', (_, input) => {
    expect(translate(input)).toBeUndefined()
  })

  it('每个子文件的用例与其正则一一对应', () => {
    for (const name of PART_NAMES) {
      expect(REGEXP_CASES[name], name).toHaveLength(PARTS[name].regexp?.length ?? 0)
    }
    expect(CASE_ENTRIES).toHaveLength(RULES.length)
  })

  it('正例在合并后首个命中对应的正则', () => {
    const mismatched = CASE_ENTRIES.flatMap(({ name, index, item, rule }) =>
      item.hits.filter(([input]) => firstRule(input) !== rule).map(([input]) => `${name}#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有反例', () => {
    const empty = CASE_ENTRIES.filter(({ item }) => item.misses.length === 0 || item.hits.length === 0)
    expect(empty.map(({ name, index }) => `${name}#${index}`)).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Will update ', '3', ' pull requests targeting this branch.'].join('')))).toBe(
      '将更新 3 个以此分支为目标的拉取请求。'
    )
    expect(translate(normalizeText(['Applies to ', '3', ' ', 'targets', ':'].join('')))).toBe('适用于 3 个目标：')
    expect(translate(normalizeText(['6', ' branch rules', ' • targeting ', '1', ' branch'].join('')))).toBe('6 条分支规则 • 针对 1 个分支')
    expect(translate(normalizeText(['There is a maximum limit of ', '90', ' days.'].join('')))).toBe('上限为 90 天。')
    expect(translate(normalizeText(['3', ' collaborators have access to this repository.'].join('')))).toBe('3 个协作者有权访问此存储库。')
  })

  it('被元素隔开的片段单独命中', () => {
    expect(translate('Will update')).toBe('将更新')
    expect(translate('pull requests targeting this branch.')).toBe('个以此分支为目标的拉取请求。')
    expect(translate('Most projects name the default branch')).toBe('大多数项目将默认分支命名为')
    expect(translate('This will permanently delete the')).toBe('这将永久删除')
    expect(
      translate('repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations.')
    ).toBe('存储库及其 Wiki、议题、评论、软件包、机密和工作流运行，并移除所有协作者关联。')
    expect(translate('Users that are not')).toBe('不是')
    expect(translate('will not be able to interact with the repository.')).toBe('的用户将无法与此存储库交互。')
    expect(translate('Choose which')).toBe('选择哪些')
    expect(translate('status checks')).toBe('状态检查')
    expect(translate('This tells Actions to send tokens with')).toBe('这会让 GitHub 操作向来自存储库复刻的拉取请求所触发的工作流发送具有')
    expect(translate('Secrets are credentials that are')).toBe('机密是经过')
    expect(translate('encrypted')).toBe('加密')
    expect(translate('on public repositories by default. To continue allowing the event trigger, configure an Actions policy.')).toBe(
      '事件。如需继续允许此事件触发器，请配置操作策略。'
    )
    expect(translate('Identify vulnerabilities and errors with')).toBe('使用')
    expect(translate('repositories.')).toBe('存储库识别漏洞和错误。')
    expect(translate('Managed by')).toBe('管理者')
    expect(translate('environment.')).toBe('环境中定义的机密。')
    // 页面构建来源：…构建自 <code>/docs</code> 文件夹所在的 <code>main</code> 分支。（原文无标点，不加逗号）
    expect(translate('Your GitHub Pages site is currently being built from the')).toBe('你的 GitHub 页面站点当前构建自')
    expect(translate('folder in the')).toBe('文件夹所在的')
    expect(translate('branch.')).toBe('分支。')
    expect(translate('The payload will be delivered to')).toBe('有效负载将按当前 Web 钩子配置交付到')
    expect(translate('. Based on the existing')).toBe('。依据现有的')
    expect(translate("` to your workflow's YAML to send jobs to this runner.")).toBe('` 添加到工作流 YAML 即可将作业发送到此运行器。')
    // 后半句的意思已并入前一段，只留句号；全角标点开头时不保留原文开头的空白
    expect(matcher.translateRaw(' using the current webhook configuration.', SCOPE)).toBe('。')
  })
})

describe('repo-settings 静态词条', () => {
  it.each([
    ['Template repository', '模板存储库'],
    ['Allow squash merging', '允许压缩合并'],
    ['Automatically delete head branches', '自动删除头部分支'],
    ['Change repository visibility', '更改存储库可见性'],
    ['Archive this repository', '存档此存储库'],
    ['Delete this repository', '删除此存储库'],
    ['Leave fork network', '离开复刻网络'],
    ['Temporary interaction limits', '临时交互限制'],
    ['Require a pull request before merging', '合并前必须提交拉取请求'],
    ['Require status checks to pass before merging', '合并前必须通过状态检查'],
    ['Level up your tag protections with Repository Rules', '使用存储库规则升级标签保护'],
    [
      'Protected tags are being deprecated. To continue protecting tags, please migrate to a tag ruleset by August 30th. You can learn more about the sunset in our',
      '受保护标签即将弃用。如需继续保护标签，请在 8月30日前迁移到标签规则集。你可以在'
    ],
    ['New branch ruleset', '新建分支规则集'],
    ['Organization rulesets', '组织规则集'],
    ['Enforcement status', '强制实施状态'],
    ['Bypass list', '绕过列表'],
    ['No restrictions have been added', '尚未添加限制'],
    ['Restrict file extensions', '限制文件扩展名'],
    ['Restrict commit metadata', '限制提交元数据'],
    ['Require code scanning results', '要求代码扫描结果'],
    ['Restore ruleset', '恢复规则集'],
    ['Repository ruleset insights', '存储库规则集洞察'],
    ['Import branch protection rules', '导入分支保护规则'],
    ['Convert to ruleset', '转换为规则集'],
    ['Allow all actions and reusable workflows', '允许所有操作和可复用工作流'],
    ['New self-hosted runner', '新建自托管运行器'],
    ['Customize claims included in the OIDC token.', '自定义 OIDC 令牌中包含的声明。'],
    ['Use immutable subject claim', '使用不可变主题声明'],
    ['Payload URL', '有效负载 URL'],
    ['Which events would you like to trigger this webhook?', '希望哪些事件触发此 Web 钩子？'],
    ['Org blocks', '组织阻止'],
    ['A user has been blocked or unblocked.', '用户被阻止或取消阻止。'],
    ['Projects v2', '项目 v2'],
    ['Prebuild triggers', '预生成触发器'],
    ['Build and deployment', '生成和部署'],
    ['Enforce HTTPS', '强制实施 HTTPS'],
    ['Enable CodeQL', '启用 CodeQL'],
    ['Access to alerts', '警报访问权限'],
    ['New repository secret', '新建存储库机密'],
    ['Agents secrets and variables', '智能体机密和变量'],
    ['Add deploy key', '添加部署密钥'],
    ['Enable automatic code review', '启用自动代码审查'],
    ['Automation level', '自动化级别'],
    ['Collaborators and teams', '协作者和团队'],
    ['Loading deliveries…', '正在加载交付记录…'],
    ['Loading deliveries...', '正在加载交付记录...'],
    ["You haven't invited any collaborators yet", '你尚未邀请任何协作者'],
    ['You haven’t invited any collaborators yet', '你尚未邀请任何协作者'],
    ['New tag ruleset', '新建标签规则集'],
    ['Reverting...', '还原中...'],
    ['Reverting…', '还原中…'],
    ['Require linear history', '要求线性历史记录'],
    ['Installed GitHub Apps', '已安装的 GitHub 应用'],
    ['Disable Secret Protection', '禁用机密保护'],
    ['Advanced Security will be disabled.', '高级安全将被禁用。'],
    ['Redeliver payload?', '重新传递有效负载？'],
    ['Make this repository private', '将此存储库设为专用'],
    ['Pending Invitations', '待定邀请'],
    ['Provider patterns', '提供程序模式'],
    ['Provider hooks', '提供程序钩子'],
    ['Page builds', '页面构建'],
    ['Pages site built.', '页面站点已构建。'],
    ['Yes, remove this tag protection rule', '是，删除此标签保护规则'],
    ['The Actions tab is hidden and no workflows can run.', '操作标签页将被隐藏，任何工作流都无法运行。'],
    // 产品名、计划名译成中文（见 nav.ts 文件头）：标题、复合词里的 Actions → 操作，句中指整个产品写 GitHub 操作
    ['Disable actions', '禁用 GitHub 操作'],
    ['Actions policy updated.', '已更新操作策略。'],
    ['Actions secrets', '操作机密'],
    ['Add Codespaces secret', '添加代码空间机密'],
    ['Default Codespaces Configuration', '默认代码空间配置'],
    ['Enable Secret Protection', '启用机密保护'],
    ['Actions history and logs will be visible to everyone.', 'GitHub 操作历史记录和日志将对所有人可见。'],
    ['Learn more about GitHub Pages', '了解 GitHub 页面'],
    ['Upgrade or make this repository public to enable Pages', '升级或将此存储库设为公共以启用 GitHub 页面'],
    ['Classic Pages experience', '经典页面体验'],
    ['Page source has been saved', '页面来源已保存'],
    ['GitHub Models access policy', 'GitHub 模型访问策略'],
    ['Allow actions by Marketplace', '允许市场'],
    ['Copilot Autofix enablement', 'Copilot 自动修复启用状态'],
    ['Learn more about Copilot code review.', '了解 Copilot 代码审查。'],
    ['Learn more about Copilot coding agent', '了解 Copilot 编码智能体'],
    [
      'Check new dependencies against the GitHub Advisory Database for known vulnerabilities.',
      '对照 GitHub 公告数据库检查新依赖项是否存在已知漏洞。'
    ],
    [
      'Anyone with collaborator access to this repository can use these secrets and variables for the Copilot cloud agent.',
      '对此存储库拥有协作者权限的任何人都可以为 Copilot 云端智能体使用这些机密和变量。'
    ],
    ['Code scanning with GitHub Actions is not available for this repository.', '此存储库无法使用基于 GitHub 操作的代码扫描。'],
    ['This limit does not apply to Git Large File Storage (Git LFS).', '此限制不适用于 Git 大文件存储 (Git LFS)。'],
    ['Your GitHub Free plan', '你的 GitHub 免费版计划'],
    ['upgrade this organization to GitHub Team or Enterprise', '将此组织升级到 GitHub 团队版或企业版'],
    ['Protected tags are available to Pro, Team, and Enterprise users', '专业版、团队版和企业版用户可以使用受保护标签'],
    ['Upgrade to Enterprise to use this mode.', '升级到企业版即可使用此模式。'],
    ['Try GitHub Enterprise risk-free for 30 days', '免费试用 GitHub 企业版 30 天'],
    ['Automatically open pull requests for alerts with a patch.', '自动为有可用补丁的警报创建拉取请求。'],
    ['event is triggered.', '事件时，我们将向所列地址发送通知电子邮件。'],
    [
      'Temporarily restrict which external users can interact with your repository (comment, open issues, or create pull requests) for a configurable period of time.',
      '在可配置的时间段内临时限制哪些外部用户可以与你的存储库交互（评论、创建议题或创建拉取请求）。'
    ],
    [
      'This may be used to force a “cool-down” period during heated discussions or prevent unwanted interactions.',
      '可用于在激烈讨论期间强制进入“冷静期”或防止不必要的交互。'
    ],
    ['Users that are not collaborators will not be able to interact with the repository.', '不是协作者的用户将无法与此存储库交互。'],
    // 名称校验错误：原文几句就译几句，句号随原文
    [
      'Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).',
      '机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。'
    ],
    [
      'Failed to add secret: Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).',
      '无法添加机密：机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。'
    ],
    [
      'Failed to add variable: Variable names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).',
      '无法添加变量：变量名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。'
    ],
    [
      'Metadata restrictions can ensure that commit messages contain a GitHub issue number, or enforce the format of new branch and tag names.',
      '元数据限制可确保提交消息包含 GitHub 议题编号，或强制实施新分支和标签名称的格式。'
    ],
    // 括号内是链接或域名，右括号是独立文本节点：左括号用半角，与原文右括号配对
    ['— Required for your site because you are using the default domain (', '— 你的站点必须启用，因为正在使用默认域 ('],
    // 保存议题模板后的提示横幅
    ['Updated issue templates for this repository', '已更新此存储库的议题模板'],
    // 报告的内容页（/<owner>/<repo>/reported_content）：原文拼写 distruptive 照录
    ['Users can report abusive or distruptive content for review and moderation.', '用户可以报告滥用或干扰性内容以供审查和调解。'],
    ['Report content setting', '报告内容设置'],
    [
      'Only users who have previously contributed to the repository and collaborators will be able to report content',
      '只有之前为此存储库做过贡献的用户和协作者才能报告内容'
    ],
    ['Disable content reporting for all users', '为所有用户禁用内容报告'],
    ['Abuse reports', '滥用行为报告'],
    ['Reported Content', '报告的内容'],
    ["There aren't any resolved content reports for this repository.", '此存储库没有已解决的内容报告。'],
    // 高级安全：AI 扫描的说明
    ['Identify code security findings using AI. All features consume AI credits.', '使用 AI 识别代码安全问题。所有功能都会消耗 AI 额度。'],
    [
      'Scan this repository with AI for additional security findings. Only scans the default branch.',
      '使用 AI 扫描此存储库，发现更多安全问题。仅扫描默认分支。'
    ],
    [
      'Find risks such as indirect prompt injection in AI applications and agents, in any language. Only scans pull requests.',
      '查找 AI 应用程序和智能体中的间接提示注入等风险，不限语言。仅扫描拉取请求。'
    ],
    // 拉取请求限制：bypass list 改称 exemption list
    [
      'Restrict how many pull requests users without write access can have open at one time and add specific users to an exemption list. These settings stay in effect until you change them.',
      '限制无写入访问权限的用户可同时打开的拉取请求数量，并可将特定用户添加到豁免列表。这些设置在你更改前一直有效。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Template repository \n', SCOPE)).toBe('  模板存储库 \n')
  })

  it('static 在组织设置页同样生效（规则集、Web 钩子共用）', () => {
    expect(matcher.translate('New branch ruleset', ['common', 'org-settings'])).toBe('新建分支规则集')
    expect(matcher.translate('Payload URL', ['common', 'org-settings'])).toBe('有效负载 URL')
  })

  it('报告的内容页（/<owner>/<repo>/reported_content 只有 repository 作用域）靠 static 生效', () => {
    const scope = ['common', 'repository'] as const
    expect(matcher.translate('Abuse reports', scope)).toBe('滥用行为报告')
    expect(matcher.translate('Learn more about reported content', scope)).toBe('了解报告的内容')
    expect(matcher.translate('The following content has been reported by users:', scope)).toBe('用户报告了以下内容：')
    expect(matcher.translate("There aren't any unresolved content reports for this repository.", scope)).toBe(
      '此存储库没有未解决的内容报告。'
    )
    expect(matcher.translate('Any user on GitHub is able to report content', scope)).toBe('GitHub 上的任何用户都可以报告内容')
    expect(matcher.translate('Disable content reporting', scope)).toBe('禁用内容报告')
  })
})

describe('repo-settings 页面词条', () => {
  it.each([
    ['General', '常规'],
    ['Danger Zone', '危险区域'],
    ['Rulesets', '规则集'],
    ['Webhooks', 'Web 钩子'],
    ['Deploy keys', '部署密钥'],
    ['Who has access', '谁有访问权限'],
    ['Base role', '基本角色'],
    ['Triage', '分类'],
    ['Maintain', '维护'],
    ['Active', '活动'],
    ['Evaluate', '评估'],
    ['Exempt', '豁免'],
    ['Applies to', '适用于'],
    ['Include:', '包含：'],
    ['Managed by', '管理者'],
    ['Merge', '合并'],
    ['Negate', '取反'],
    ['Bypass', '绕过'],
    ['changes', '更改'],
    ['Secret', '机密'],
    ['Recent deliveries', '最近交付'],
    ['Content type', '内容类型'],
    ['Deployment protection rules', '部署保护规则'],
    ['Standard GitHub-hosted runners', '标准 GitHub 托管的运行器'],
    ['Source', '来源'],
    ['/ (root)', '/（根目录）'],
    ['Sunday', '星期日'],
    ['Default setup', '默认设置'],
    ['Enable firewall', '启用防火墙'],
    ['Pages', '页面'],
    ['Custom domain', '自定义域'],
    ['Last updated', '最后更新'],
    ['Non-provider patterns', '非提供程序模式'],
    ['Max', '最高'],
    ['Setting up', '设置中'],
    ['Push Protection will run and the selected actor(s) will be prompted to bypass', '推送保护会运行并向所选参与者显示绕过提示'],
    ['No actors have been selected', '尚未选择参与者'],
    [
      'Failed to add secret. Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).',
      '无法添加机密。机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。'
    ],
    ['Secret values are encrypted and cannot be displayed, but you can', '机密值已加密且无法显示，但你可以'],
    // 页面自定义域 DNS 检查失败的句尾：错误码照原文，句号改全角
    ['(NotServedByPagesError).', '(NotServedByPagesError)。'],
    ['(InvalidDNSError).', '(InvalidDNSError)。']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('/<owner>/<repo>/rules 同样生效', () => {
    expect(matcher.translate('Bypass list', ['common', 'repository', 'repo-settings'])).toBe('绕过列表')
    expect(matcher.translate('6 branch rules', ['common', 'repository', 'repo-settings'])).toBe('6 条分支规则')
  })

  it('DNS 检查失败句尾的错误码：保留链接后的空格，句号改全角，只在存储库设置页生效', () => {
    // 「Domain does not resolve to the GitHub Pages server. For more information, see <a>documentation</a> (NotServedByPagesError).」
    expect(translate('Domain does not resolve to the GitHub Pages server. For more information, see')).toBe(
      '域未解析到 GitHub 页面服务器。详情请参阅'
    )
    expect(matcher.translateRaw(' (NotServedByPagesError).', SCOPE)).toBe(' (NotServedByPagesError)。')
    expect(matcher.translateRaw(' (InvalidDNSError).', SCOPE)).toBe(' (InvalidDNSError)。')
    expect(matcher.translate('(InvalidDNSError).', ['common', 'repository'])).toBeUndefined()
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('General', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Active', ['common', 'org-settings'])).toBeUndefined()
    expect(matcher.translate('3 collaborators', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('6 branch rules', ['common', 'org-settings'])).toBeUndefined()
    expect(matcher.translate('Danger Zone', ['common', 'org-settings'])).toBeUndefined()
    expect(matcher.translate('Edit NPM_TOKEN', ['common', 'actions'])).toBeUndefined()
    expect(matcher.translate('3 actors', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('octo-team Bypass actor actions', ['common', 'repository'])).toBeUndefined()
  })

  it('绕过列表菜单按钮：不带名称的提示文字仍由规则集 static 译出', () => {
    expect(translate('Bypass actor actions')).toBe('绕过参与者操作')
  })

  it('侧栏里单独出现的产品名译出（用户要求：同一行不保留英文）', () => {
    expect(dict.scoped?.Actions).toBe('操作')
    expect(dict.scoped?.Codespaces).toBe('代码空间')
    expect(dict.scoped?.['Advanced Security']).toBe('高级安全')
    expect(translate('Actions')).toBe('操作')
    expect(translate('Codespaces')).toBe('代码空间')
    expect(translate('Advanced Security')).toBe('高级安全')
    // 只在存储库设置页生效
    expect(matcher.translate('Actions', ['common', 'repository'])).toBeUndefined()
  })

  it('单独出现的产品全称、功能名译出后半部分，只在存储库设置页生效', () => {
    for (const [name, expected] of [
      ['GitHub Actions', 'GitHub 操作'],
      ['GitHub Pages', 'GitHub 页面'],
      ['GitHub Enterprise', 'GitHub 企业版'],
      ['Copilot code review', 'Copilot 代码审查'],
      ['Copilot Autofix', 'Copilot 自动修复']
    ] as const) {
      expect(dict.static?.[name]).toBeUndefined()
      expect(dict.scoped?.[name]).toBe(expected)
      expect(translate(name)).toBe(expected)
    }
    expect(matcher.translate('Copilot Autofix', ['common', 'repository'])).toBeUndefined()
  })

  it('自造品牌词与技术词保留英文', () => {
    for (const name of ['Copilot', 'Dependabot', 'CodeQL', 'OIDC']) {
      expect(dict.static?.[name]).toBeUndefined()
      expect(dict.scoped?.[name]).toBeUndefined()
      expect(translate(name)).toBeUndefined()
    }
  })

  it('链接、加粗段拆开的句子不补原文没有的逗号', () => {
    // 「…wildcard pattern, which will」+ <strong>allow all actions and reusable workflows</strong> +「except those that are explicitly blocked.」
    expect(translate('allow all actions and reusable workflows')).toBe('允许除明确阻止之外的所有操作和可复用工作流')
    expect(translate('except those that are explicitly blocked.')).toBe('。')
    // 「…learn more about the sunset in our」+ 链接「changelog」+「and can get started now by migrating to rulesets.」
    expect(translate('and can get started now by migrating to rulesets.')).toBe('中了解停用详情并立即开始迁移到规则集。')
  })

  it('不收录 Type（与全局搜索提示「Type / to search」同形）', () => {
    expect(dict.static?.Type).toBeUndefined()
    expect(dict.scoped?.Type).toBeUndefined()
    expect(translate('Type')).toBeUndefined()
  })
})

describe('repo-settings Dependabot 规则页（与组织设置共用）', () => {
  const cnMatcher = createMatcher(zhCN)

  it.each([
    ['Target alerts', '目标警报'],
    ['Add rule metadata', '添加规则元数据'],
    ['Severities', '严重性'],
    ['Scopes', '范围'],
    ['Rules will be applied for alerts matching all included metadata.', '规则将应用于匹配所有已包含元数据的警报。'],
    ['Rule name', '规则名称'],
    ['Until patch is available', '直到有可用补丁'],
    ['Indefinitely', '无限期'],
    ['Edit curated rule', '编辑精选规则'],
    ['/ GitHub Preset rule', '/ GitHub 预设规则'],
    // 开发环境既非生产、也非运行时
    [
      'In a developer (non-production or runtime) environment, these alerts are unlikely to be exploitable or have limited effect like slow builds or long-running tests.',
      '在开发环境（非生产、非运行时）中，这些警报不太可能被利用，影响也有限，例如构建变慢或测试耗时较长。'
    ],
    // 存储库设置由 branches.ts、nav.ts 收录，与组织设置同译
    ['New rule', '新建规则'],
    ['/ New rule', '/ 新建规则'],
    ['Rules', '规则']
  ])('%s → %s', (input, expected) => {
    expect(cnMatcher.translate(input, SCOPE)).toBe(expected)
  })

  it('共用词条逐条生效，与组织设置同译，只放 scoped', () => {
    const shared = Object.entries(DEPENDABOT_RULES_SCOPED)
    expect(shared.length).toBeGreaterThan(0)
    for (const [key, value] of shared) {
      expect(dict.static?.[key], key).toBeUndefined()
      expect(dict.scoped?.[key], key).toBe(value)
      expect(cnMatcher.translate(key, SCOPE), key).toBe(value)
      expect(cnMatcher.translate(key, ['common', 'org-settings']), key).toBe(value)
    }
  })

  it('「目标警报」自动补全里的筛选取值照原文', () => {
    for (const value of ['critical', 'high', 'moderate', 'low', 'runtime', 'development', 'severity:', 'scope:']) {
      expect(cnMatcher.translate(value, SCOPE), value).toBeUndefined()
    }
  })

  it('不在其他页面生效', () => {
    expect(cnMatcher.translate('Target alerts', ['common', 'repository'])).toBeUndefined()
    expect(cnMatcher.translate('Indefinitely', ['common', 'repository'])).toBeUndefined()
    expect(cnMatcher.translate('3 rules enabled', ['common', 'repository'])).toBeUndefined()
  })

  it('安全设置页「Dependabot rules」行的齿轮按钮由 static 收录，存储库、组织页面都生效', () => {
    expect(PARTS.security.static?.['Configure Dependabot rules']).toBe('配置 Dependabot 规则')
    expect(Object.hasOwn(DEPENDABOT_RULES_SCOPED, 'Configure Dependabot rules')).toBe(false)
    for (const scope of [SCOPE, ['common', 'org-settings']] as const) {
      expect(cnMatcher.translate('Configure Dependabot rules', scope), scope.join()).toBe('配置 Dependabot 规则')
    }
  })
})

describe('repo-settings 子文件', () => {
  it('合并结果包含全部子文件词条', () => {
    const parts = Object.values(PARTS)
    const staticCount = parts.reduce((sum, part) => sum + Object.keys(part.static ?? {}).length, 0)
    const scopedCount = parts.reduce((sum, part) => sum + Object.keys(part.scoped ?? {}).length, 0)
    const regexpCount = parts.reduce((sum, part) => sum + (part.regexp ?? []).length, 0)
    expect(Object.keys(dict.static ?? {})).toHaveLength(staticCount)
    expect(Object.keys(dict.scoped ?? {})).toHaveLength(scopedCount)
    expect(RULES).toHaveLength(regexpCount)
  })

  it('子文件之间没有重复的键，static 与 scoped 不重叠', () => {
    const owners = new Map<string, string[]>()
    for (const [name, part] of Object.entries(PARTS)) {
      for (const key of [...Object.keys(part.static ?? {}), ...Object.keys(part.scoped ?? {})]) {
        owners.set(key, [...(owners.get(key) ?? []), name])
      }
    }
    const duplicated = [...owners].filter(([, names]) => names.length > 1).map(([key, names]) => `${key}：${names.join('、')}`)
    expect(duplicated).toEqual([])
  })
})

describe('repo-settings 行内句', () => {
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  /** 按存储库设置页的作用域翻译 html */
  function render(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
  }

  function shown(id: string): string {
    return (document.getElementById(id)?.textContent ?? '').replace(/\s+/g, ' ').trim()
  }

  /** Primer BranchName：分支名由引擎忽略 */
  function branch(name: string): string {
    return `<a href="/octo-org/hello-world/activity?ref=${name}" class="prc-BranchName-BranchName-CMTaU" data-component="BranchName">${name}</a>`
  }

  it('规则洞察运行记录的分支重命名注记按整句翻译', () => {
    // repos-rules RuleSuiteRow：<span>deleted </span><BranchName/><span> (renamed to <BranchName/>)</span>
    render(`
      <span id="deleted"><span>deleted </span>${branch('main')}<span id="to"> (renamed to ${branch('trunk')})</span></span>
      <span id="created"><span>created </span>${branch('trunk')}<span id="from"> (renamed from ${branch('main')})</span></span>`)
    expect(shown('to')).toBe('（重命名为 trunk）')
    expect(shown('from')).toBe('（重命名自 main）')
    expect(shown('deleted')).toBe('删除了 main（重命名为 trunk）')
    expect(shown('created')).toBe('创建了 trunk（重命名自 main）')
  })
})

describe('repo-settings 繁体（zh-TW 语言包）', () => {
  const twMatcher = createMatcher(zhTW)

  it.each([
    // 报告的内容页（/<owner>/<repo>/reported_content）只有 repository 作用域，靠 static 生效
    [['common', 'repository'], 'Abuse reports', '濫用行為檢舉'],
    [['common', 'repository'], 'Reported Content', '已檢舉的內容'],
    [['common', 'repository'], 'Disable content reporting', '停用內容檢舉'],
    [
      ['common', 'repository'],
      'Users can report abusive or distruptive content for review and moderation.',
      '使用者可以檢舉濫用或干擾性內容以供審查和內容審核。'
    ],
    [['common', 'repository'], "There aren't any unresolved content reports for this repository.", '此儲存庫沒有未解決的內容檢舉。'],
    // 保存议题模板后的提示横幅
    [['common', 'repository', 'issues'], 'Updated issue templates for this repository', '已更新此儲存庫的議題範本'],
    // 页面 DNS 检查失败句尾（scoped）
    [['common', 'repository', 'repo-settings'], '(NotServedByPagesError).', '(NotServedByPagesError)。'],
    [['common', 'repository', 'repo-settings'], '(InvalidDNSError).', '(InvalidDNSError)。'],
    // Dependabot 规则页（与组织设置共用）
    [['common', 'repository', 'repo-settings'], 'Target alerts', '目標警示'],
    [['common', 'repository', 'repo-settings'], 'Add a rule name', '輸入規則名稱'],
    [['common', 'repository', 'repo-settings'], 'GitHub presets', 'GitHub 預設集'],
    [['common', 'repository', 'repo-settings'], 'Indefinitely', '無限期'],
    [['common', 'repository', 'repo-settings'], 'New rule', '新增規則'],
    [['common', 'repository', 'repo-settings'], '3 rules enabled', '已啟用 3 個規則'],
    [
      ['common', 'repository', 'repo-settings'],
      'This will permanently delete the rule "Sample text" and potentially reopen associated alerts.',
      '這會永久刪除規則「Sample text」並可能重新開啟關聯的警示。'
    ],
    // 安全设置页「Dependabot rules」行的齿轮按钮（static，组织安全设置页同样生效）
    [['common', 'repository', 'repo-settings'], 'Configure Dependabot rules', '設定 Dependabot 規則'],
    // 高级安全：AI 扫描的说明；拉取请求限制
    [
      ['common', 'repository', 'repo-settings'],
      'Identify code security findings using AI. All features consume AI credits.',
      '使用 AI 識別程式碼安全性發現項目。所有功能都會耗用 AI 點數。'
    ],
    [
      ['common', 'repository', 'repo-settings'],
      'Scan this repository with AI for additional security findings. Only scans the default branch.',
      '使用 AI 掃描此儲存庫，找出更多安全性發現項目。僅掃描預設分支。'
    ],
    [
      ['common', 'repository', 'repo-settings'],
      'Find risks such as indirect prompt injection in AI applications and agents, in any language. Only scans pull requests.',
      '找出 AI 應用程式與代理中的間接提示注入等風險，不限語言。僅掃描拉取請求。'
    ],
    [
      ['common', 'repository', 'repo-settings'],
      'Restrict how many pull requests users without write access can have open at one time and add specific users to an exemption list. These settings stay in effect until you change them.',
      '限制沒有寫入權限的使用者同時可有多少個開放中的拉取請求，並將特定使用者加入豁免清單。這些設定在你變更之前會持續生效。'
    ],
    [['common', 'org-settings'], 'Configure Dependabot rules', '設定 Dependabot 規則'],
    // 推送保护绕过列表标题（与组织设置同译）
    [['common', 'repository', 'repo-settings'], '3 actors', '3 個執行者'],
    [['common', 'repository', 'repo-settings'], '1 actor', '1 個執行者'],
    [['common', 'repository', 'repo-settings'], '0 actors', '0 個執行者'],
    [['common', 'org-settings'], '3 actors', '3 個執行者'],
    // 绕过列表每行菜单按钮的读屏名称（与组织设置同译）：内置角色与兜底词用译名，其余名称原样保留
    [['common', 'repository', 'repo-settings'], 'octo-team Bypass actor actions', '可繞過的執行者 octo-team 的動作'],
    [['common', 'repository', 'repo-settings'], 'admin Bypass actor actions', '可繞過的執行者管理員的動作'],
    [['common', 'repository', 'repo-settings'], 'maintain Bypass actor actions', '可繞過的執行者維護的動作'],
    [['common', 'repository', 'repo-settings'], 'write Bypass actor actions', '可繞過的執行者寫入的動作'],
    [['common', 'repository', 'repo-settings'], 'Unknown Bypass actor actions', '可繞過的執行者未知的動作'],
    [['common', 'repository', 'repo-settings'], 'constructor Bypass actor actions', '可繞過的執行者 constructor 的動作'],
    [['common', 'org-settings'], 'octo-team Bypass actor actions', '可繞過的執行者 octo-team 的動作'],
    [['common', 'org-settings'], 'Organization admin Bypass actor actions', '可繞過的執行者組織管理員的動作']
  ] as const)('%j：%s → %s', (scope, input, expected) => {
    expect(twMatcher.translate(input, scope)).toBe(expected)
  })

  it('Dependabot 规则页的共用词条逐条生效，与组织设置同译，筛选取值照原文', () => {
    const shared = Object.entries(TW_DEPENDABOT_RULES_SCOPED)
    expect(shared.length).toBeGreaterThan(0)
    for (const [key, value] of shared) {
      expect(twMatcher.translate(key, ['common', 'repository', 'repo-settings']), key).toBe(value)
      expect(twMatcher.translate(key, ['common', 'org-settings']), key).toBe(value)
    }
    for (const value of ['critical', 'high', 'moderate', 'low', 'runtime', 'development']) {
      expect(twMatcher.translate(value, ['common', 'repository', 'repo-settings']), value).toBeUndefined()
    }
    expect(twMatcher.translate('Target alerts', ['common', 'repository'])).toBeUndefined()
  })

  it('DNS 检查失败句尾的错误码不在其他页面生效', () => {
    expect(twMatcher.translate('(InvalidDNSError).', ['common', 'repository'])).toBeUndefined()
  })

  it('推送保护绕过列表标题首尾锚定，不在存储库其他页面生效', () => {
    for (const input of ['No actors', '3 bypass actors', '3 actors selected', 'Select 3 actors']) {
      expect(twMatcher.translate(input, ['common', 'repository', 'repo-settings']), input).toBeUndefined()
    }
    expect(twMatcher.translate('3 actors', ['common', 'repository'])).toBeUndefined()
  })

  it('绕过列表每行菜单按钮的读屏名称首尾锚定，不在存储库其他页面生效；不带名称的提示文字照旧', () => {
    for (const input of ['octo-team Bypass actor', 'octo-team Bypass actor actions menu', 'Bypass actor actions for octo-team']) {
      expect(twMatcher.translate(input, ['common', 'repository', 'repo-settings']), input).toBeUndefined()
    }
    expect(twMatcher.translate('octo-team Bypass actor actions', ['common', 'repository'])).toBeUndefined()
    expect(twMatcher.translate('Bypass actor actions', ['common', 'repository', 'repo-settings'])).toBe('可繞過執行者的動作')
  })
})
