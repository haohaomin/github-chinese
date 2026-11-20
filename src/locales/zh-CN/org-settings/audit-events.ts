import type { PageDictionary } from '../../../core/types'

/** 审核日志令牌策略事件中的令牌类型 */
const TOKEN_KIND: Readonly<Record<string, string>> = {
  'personal access tokens (classic)': '个人访问令牌（经典）',
  'fine-grained personal access tokens': '精细个人访问令牌'
}
const TOKENS = '(personal access tokens \\(classic\\)|fine-grained personal access tokens)'

/** 令牌有效期事件末尾的「(Not exempting administrators)」 */
const EXEMPT: Readonly<Record<string, string>> = { 'Not exempting': '不豁免管理员', Exempting: '豁免管理员' }

/** 双因素要求事件的动作 */
const TWO_FACTOR_VERB: Readonly<Record<string, string>> = { removed: '移除了', cleared: '清除了', enabled: '启用了', disabled: '禁用了' }

/** Dependabot 规则事件中的规则名称（未收录的照原文） */
const DEPENDABOT_RULE: Readonly<Record<string, string>> = { 'Dismiss package malware alerts': '消除软件包恶意软件警报' }

/**
 * 审核日志事件说明：组织审核日志（/organizations/<组织>/settings/audit-log）与个人安全日志（/settings/security-log）共用。
 * 事件说明被用户、存储库、组织等链接或 span 拆开，按行内句收录（槽位顺序不能调换）；槽位里的取值见 scoped。
 * 预算事件的动作「updated」与全站时间片段「更新于」不同，只在组织审核日志收录（见 archive.ts）。
 */
export default {
  static: {
    // 审核日志事件（无槽位）
    'Updated codespace access and security settings to disable access to all repositories':
      '将代码空间访问和安全设置更新为禁止访问所有存储库'
  },
  scoped: {
    // 事件槽位里的取值（read / write / private 由同页面类型的其他词条译出）
    'first-time contributors': '首次贡献者',
    'first-time contributors new to GitHub': 'GitHub 新用户中的首次贡献者',
    'users without write access': '没有写入权限的用户',
    'all outside collaborators': '所有外部协作者',
    'not set': '未设置',
    themselves: '自己',
    none: '无',
    'Personal access token (Classic)': '个人访问令牌（经典）',
    yourself: '你自己',
    admin: '管理员'
  },
  inline: [
    // 存储库、依赖项更新、源 IP 显示
    ['Renamed the repository {} to {}', '将存储库 {} 重命名为 {}'],
    ['Created the repository {}', '创建了存储库 {}'],
    ['Enabled GitHub Actions for {}', '为 {} 启用了 GitHub 操作'],
    ['Disabled dependency updates on self-hosted actions for {}', '为 {} 禁用了自托管操作的依赖项更新'],
    ['Enabled dependency updates on self-hosted actions for {}', '为 {} 启用了自托管操作的依赖项更新'],
    ['Disabled source ip disclosure for the {} organization.', '为 {} 组织禁用了源 IP 显示。'],
    ['Enabled source ip disclosure for the {} organization.', '为 {} 组织启用了源 IP 显示。'],
    // 令牌策略（开头的 <strong> 是参与者；有效期、访问限制见下方正则）
    [
      '{} requires now that fine-grained personal access token requests made by organization members are subject to administrator review',
      '{} 现在要求组织成员的精细个人访问令牌请求须经管理员审查'
    ],
    [
      '{} allows fine-grained personal access token requests made by organization members to no longer be subject to administrator review',
      '{} 已允许组织成员的精细个人访问令牌请求无需管理员审查'
    ],
    [
      new RegExp(`^\\{\\} unset ${TOKENS} expiration limit$`),
      (_: string, kind: string) => `{} 取消了${TOKEN_KIND[kind] ?? kind}的有效期限制`
    ],
    [
      new RegExp(`^\\{\\} set ${TOKENS} maximum lifetime to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`),
      (_: string, kind: string, days: string, exempt: string) =>
        `{} 将${TOKEN_KIND[kind] ?? kind}的最长有效期设为 ${days} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(
        `^\\{\\} changed ${TOKENS} maximum lifetime from (\\d+) days? to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`
      ),
      (_: string, kind: string, from: string, to: string, exempt: string) =>
        `{} 将${TOKEN_KIND[kind] ?? kind}的最长有效期从 ${from} 天改为 ${to} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(`^\\{\\} maximum lifetime for ${TOKENS} is (not )?exempting administrators now\\.$`),
      (_: string, kind: string, not: string) => `{} 已将${TOKEN_KIND[kind] ?? kind}的最长有效期设为${not ? '不' : ''}豁免管理员。`
    ],
    [
      new RegExp(`^\\{\\} has (permitted|restricted) access via ${TOKENS} to the organization$`),
      (_: string, verb: string, kind: string) => `{} 已${verb === 'permitted' ? '允许' : '限制'}通过${TOKEN_KIND[kind] ?? kind}访问组织`
    ],
    // 双因素要求（开头是参与者的登录名，纯文本）
    [
      /^([\w-]+) (removed|cleared|enabled) secure two-factor requirement for \{\} organization\.$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 组织的安全双因素要求。`
    ],
    [
      /^([\w-]+) (enabled|disabled) two-factor authentication requirement for \{\} organization$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 组织的双因素身份验证要求`
    ],
    // 第三方应用访问限制、集成、机密
    ['Enabled third-party application access restrictions for the {} organization', '为 {} 组织启用了第三方应用访问限制'],
    ['Disabled third-party application access restrictions for the {} organization', '为 {} 组织禁用了第三方应用访问限制'],
    ['Uninstalled the {} integration', '卸载了 {} 集成'],
    ['Installed the {} integration.', '安装了 {} 集成。'],
    ['Removed {} secret {} for {}', '移除了 {} 机密 {} 于 {}'],
    ['Created {} secret {} available to {} repositories for {}', '创建了 {} 机密 {} 可用于 {} 存储库 于 {}'],
    // 域（域名是纯文本）、部署密钥、推送保护的自定义消息、Dependabot 规则
    [/^Removed the ([\w.-]+) domain from the \{\} organization\.$/, '从 {} 组织中移除了域 $1。'],
    [/^Approved the ([\w.-]+) domain for the \{\} organization\.$/, '为 {} 组织批准了域 $1。'],
    [/^Added the ([\w.-]+) domain to the \{\} organization\.$/, '向 {} 组织添加了域 $1。'],
    [/^Verified the ([\w.-]+) domain for the \{\} organization\.$/, '为 {} 组织验证了域 $1。'],
    [
      'Members can now create and use deploy keys to repositories in the {} organization.',
      '成员现在可以为 {} 组织中的存储库创建和使用部署密钥。'
    ],
    [
      'Updated the custom message to display when GitHub detects and blocks a secret {}',
      '为 {} 更新了 GitHub 检测并阻止机密时显示的自定义消息'
    ],
    [
      'Enabled the custom message to display when GitHub detects and blocks a secret {}',
      '为 {} 启用了 GitHub 检测并阻止机密时显示的自定义消息'
    ],
    [
      'Disabled the custom message to display when GitHub detects and blocks a secret {}',
      '为 {} 禁用了 GitHub 检测并阻止机密时显示的自定义消息'
    ],
    [
      /^Force (enabled|disabled) Dependabot rule "([^"]+)" for \{\}$/,
      (_: string, verb: string, rule: string) =>
        `为 {} 强制${verb === 'enabled' ? '启用' : '禁用'}了 Dependabot 规则“${DEPENDABOT_RULE[rule] ?? rule}”`
    ],
    // Web 钩子、操作策略
    ['Installed {} for {} with {} events', '安装了 {} 于 {} 并订阅 {} 事件'],
    ['Uninstalled {} for {}', '卸载了 {} 于 {}'],
    ['Set policy to default workflow token can create or approve PR to true for {}', '为 {} 允许默认工作流令牌创建或批准拉取请求'],
    ['Set policy to default workflow token permission to write for {}', '为 {} 将默认工作流令牌权限策略设为读写'],
    [
      'Set policy to require approval for private fork pull request workflows from {} for {}.',
      '将策略设为来自 {} 的专用复刻拉取请求工作流需经批准，适用于 {}。'
    ],
    [
      'Set policy to require approval for fork pull request workflows from {} for {}.',
      '将策略设为来自 {} 的复刻拉取请求工作流需经批准，适用于 {}。'
    ],
    ['Set fork pull request workflows policy to {}', '将复刻拉取请求工作流策略设为 {}'],
    ['Set artifact and log retention duration to {}', '将产物和日志保留期限设为 {}'],
    ['Updated list of allowed actions and workflows for {}', '为 {} 更新了允许的操作和工作流列表'],
    [
      'Updated allowed select actions and workflows to allow actions created by GitHub and allow verified actions for {}',
      '为 {} 将允许的选定操作和工作流更新为允许 GitHub 创建的操作和经过验证的操作'
    ],
    ['Updated allowed actions and workflows to all actions and workflows for {}', '为 {} 将允许的操作和工作流更新为所有操作和工作流'],
    [
      'Updated the repo-level self-hosted runners policy from {} entities to {} entities',
      '将存储库级自托管运行器策略从 {} 实体更新为 {} 实体'
    ],
    // Copilot 代码审查、项目、代码空间、自定义属性
    ['Copilot review effort default changed from {} to {} for the {} organization', 'Copilot 审查强度默认值从 {} 更改为 {} 于 {} 组织'],
    ['Created project {} in {}', '创建了项目 {} 于 {}'],
    ['Closed project {} in {}', '关闭了项目 {} 于 {}'],
    ['Reopened project {} in {}', '重新打开了项目 {} 于 {}'],
    ['Created a view in project {} in {}', '为项目 {} 创建了视图 于 {}'],
    ['Created a field in project {} in {}', '为项目 {} 创建了字段 于 {}'],
    ['Deleted a field in project {} in {}', '删除了项目 {} 的字段 于 {}'],
    [
      'Updated Codespaces access to all members and collaborators on all internal and private repositories in {}',
      '将 {} 中代码空间的访问权限更新为所有内部和专用存储库的所有成员和协作者'
    ],
    [
      'Updated Codespaces access to all members on all internal and private repositories in {}',
      '将 {} 中代码空间的访问权限更新为所有内部和专用存储库的所有成员'
    ],
    [
      'Updated Codespaces access to selected users on all internal and private repositories in {}',
      '将 {} 中代码空间的访问权限更新为所有内部和专用存储库的选定用户'
    ],
    ['Allowed themselves to use Codespaces for the {} organization', '允许自己在 {} 组织中使用代码空间'],
    ['Stopped allowing themselves to use Codespaces for the {} organization', '不再允许自己在 {} 组织中使用代码空间'],
    ['Created custom property {}', '创建了自定义属性 {}'],
    ['Deleted custom property {}', '删除了自定义属性 {}'],
    // 成员权限、版主、组织角色（槽位：成员或团队、角色、组织）
    ['Added themselves as a moderator for the {} organization', '将自己添加为 {} 组织的版主'],
    ['Removed themselves as a moderator for the {} organization', '将自己从 {} 组织的版主中移除'],
    ['Members can now delete issues in the {} organization.', '成员现在可以删除 {} 组织中的议题。'],
    ['Members can no longer delete issues in the {} organization.', '成员不能再删除 {} 组织中的议题。'],
    ['Members cannot create new teams for the {} organization.', '成员不能为 {} 组织创建新团队。'],
    [
      'Repository admins can now install GitHub Apps on their repositories in {}',
      '{} 中的存储库管理员现在可以在其存储库上安装 GitHub 应用'
    ],
    ['App access requests are now allowed for members and outside collaborators in {}', '{} 中的成员和外部协作者现在可以提出应用访问请求'],
    ['Members can no longer publish private GitHub Pages in the {} organization.', '成员不能再发布 {} 组织中的专用 GitHub 页面。'],
    ['Disabled forking of private repositories in the {} organization.', '禁用了 {} 组织中专用存储库的复刻。'],
    [
      '{} the creation of only public and private repositories by members of the {} organization',
      '{} {} 组织的成员仅可创建公共和专用存储库'
    ],
    [
      'Changed the base repository permission setting from {} to {} for the {} organization.',
      '将基本存储库权限设置从 {} 更改为 {}，适用于 {} 组织。'
    ],
    ['assigned {} to the {} organization role in the {} organization', '将 {} 分配到 {} 组织角色 于 {} 组织'],
    ['assigned the {} team to the {} organization role in the {} organization', '将 {} 团队分配到 {} 组织角色 于 {} 组织'],
    ['unassigned {} from the {} organization role in the {} organization', '将 {} 从 {} 组织角色中取消分配 于 {} 组织'],
    ['unassigned the {} team from the {} organization role in the {} organization', '将 {} 团队从 {} 组织角色中取消分配 于 {} 组织'],
    // 分支保护（第一个槽位是分支名称模式）
    ['Enabled branch protection for {} on {}', '为 {} 启用了分支保护 于 {}'],
    ['Disabled branch protection for {} on {}', '为 {} 禁用了分支保护 于 {}'],
    // 审核日志事件说明（槽位顺序不能调换）
    ['Added themselves to the {} team', '将自己添加到 {} 团队'],
    ['Created the team {}', '创建了团队 {}'],
    ['Renamed organization from {} to {}', '将组织从 {} 重命名为 {}'],
    ['Created the ruleset {} in {}', '创建了规则集 {} 于 {}'],
    ['Updated Codespaces ownership to User in {}', '在 {} 中将代码空间所有权更新为用户'],
    ['Created the {} organization', '创建了 {} 组织'],
    ['Added themselves to the {} organization with {} permission', '将自己添加到 {} 组织并获得 {} 权限'],
    ['Created the label {}', '创建了标签 {}'],
    ['Set policy to default workflow token permission to read for {}', '为 {} 将默认工作流令牌权限策略设为只读'],
    ['Set policy to default workflow token can create or approve PR to false for {}', '为 {} 禁止默认工作流令牌创建或批准拉取请求'],
    [
      'Members can no longer create and use deploy keys to repositories in the {} organization.',
      '成员不能再为 {} 组织中的存储库创建和使用部署密钥。'
    ],
    // 个人安全日志：被用户、应用、企业链接拆开的事件描述
    ['Blocked user {}', '阻止了用户 {}'],
    ['Unblocked user {}', '取消阻止了用户 {}'],
    ['Removed authorization for OAuth application {}', '移除了 OAuth 应用 {} 的授权'],
    ['Added {} as an owner of the {} enterprise', '将 {} 添加为 {} 企业的所有者'],
    ['{} added payment details to the {} enterprise', '{} 向 {} 企业添加了付款详细信息'],
    ['Marketplace listing {} was sent back to draft state', '市场上架项 {} 已退回草稿状态'],
    // 存储库主题、合并设置、机密（「via the API」：通过 API 进行的操作）
    ['Added {} to the {} repository', '将 {} 添加到 {} 存储库'],
    ['Removed {} from the {} repository', '将 {} 从 {} 存储库中移除'],
    ['Allowed {} on the {} repository', '允许了 {} 于 {} 存储库'],
    ['Blocked {} on the {} repository', '阻止了 {} 于 {} 存储库'],
    ['Changed {} on the {} repository', '更改了 {} 于 {} 存储库'],
    ['Created a secret for {} via the API', '通过 API 为 {} 创建了机密'],
    ['Created environment {} via the API', '通过 API 创建了环境 {}'],
    [
      'Created a deployment branch protection rule for {} via the API . The environment can only deploy in branches matching a branch policy pattern.',
      '通过 API 为 {} 创建了部署分支保护规则。该环境只能部署到与分支策略模式匹配的分支。'
    ],
    ['Deleted the ruleset {} in {}', '删除了规则集 {} 于 {}'],
    ['Updated the ruleset {} in {}', '更新了规则集 {} 于 {}'],
    // OAuth 授权与令牌（槽位里的令牌类型见 scoped）
    ['Created authorization for personal access token with {} scope(s)', '创建了具有 {} 作用域的个人访问令牌授权'],
    ['Created authorization for OAuth application {} with {} scope(s)', '为 OAuth 应用 {} 创建了具有 {} 作用域的授权'],
    ['Removed authorization for OAuth application was marked as stale {}', '移除了已标记为过时的 OAuth 应用 {} 的授权'],
    ['Created a {} token for {} ending in {}.', '创建了 {} 所有者为 {} 尾号为 {}。'],
    ['Regenerated a {} token for {} ending in {}.', '重新生成了 {} 所有者为 {} 尾号为 {}。'],
    ['Updated a {} token for {} ending in {}.', '更新了 {} 所有者为 {} 尾号为 {}。'],
    ['Revoked a {} token for {} ending in {}.', '撤销了 {} 所有者为 {} 尾号为 {}。'],
    // 精细令牌的访问权限（令牌名在引号里，是纯文本）
    [
      /^\{\} has revoked access to resources owned by yourself for the personal access token "(.+)"$/,
      '{} 已撤销个人访问令牌“$1”对你拥有的资源的访问权限'
    ],
    [
      /^\{\} has granted the personal access token "(.+)" access to resources owned by yourself$/,
      '{} 已授予个人访问令牌“$1”对你拥有的资源的访问权限'
    ],
    [/^\{\} requested access for "(.+)" on resources owned by \{\}$/, '{} 为“$1”请求了对 {} 拥有的资源的访问权限'],
    // 应用的安装、存储库访问
    ['Suspended the {} integration', '暂停了 {} 集成'],
    ['Unsuspended the {} integration', '取消暂停了 {} 集成'],
    ['Added the following repositories to the {} integration: {}', '已将以下存储库添加到 {} 集成：{}'],
    ['Added the following repositories to the {} integration via the API: {}', '已通过 API 将以下存储库添加到 {} 集成：{}'],
    ['Removed the following repositories from the {} integration: {}', '已将以下存储库移出 {} 集成：{}'],
    ['Removed the following repositories from the {} integration via the API: {}', '已通过 API 将以下存储库移出 {} 集成：{}'],
    // 开发人员设置：OAuth 应用、GitHub 应用（integration）
    ['Created the {} application', '创建了 {} 应用'],
    ['Updated the {} application', '更新了 {} 应用'],
    ['Deleted the {} application', '删除了 {} 应用'],
    ['Generated a new client secret for the {} application', '为 {} 应用生成了新的客户端密钥'],
    ['Removed a client secret for the {} application', '移除了 {} 应用的客户端密钥'],
    ['Revoked {} for the {} application', '撤销了 {} 于 {} 应用'],
    ['Enabled token expiration for the {} application', '为 {} 应用启用了令牌过期'],
    ['Disabled token expiration for the {} application', '为 {} 应用禁用了令牌过期'],
    ['Created the {} integration', '创建了 {} 集成'],
    ['Updated the {} integration', '更新了 {} 集成'],
    ['Deleted the {} integration', '删除了 {} 集成'],
    ['Generated a new client secret for the {} integration', '为 {} 集成生成了新的客户端密钥'],
    ['Removed a client secret for the {} integration', '移除了 {} 集成的客户端密钥'],
    ['Revoked {} for the {} integration', '撤销了 {} 于 {} 集成'],
    // 应用的 Web 钩子：应用名是纯文本（组织的 Web 钩子见上方，组织名是链接）
    ['Installed {} with {} events', '安装了 {} 并订阅 {} 事件'],
    [/^Installed \{\} for (.+) with \{\} events$/, '安装了 {} 于 $1 并订阅 {} 事件'],
    [/^Uninstalled \{\} for (.+)$/, '卸载了 {} 于 $1'],
    ['Updated {} configuration for {}', '更新了 {} 配置 于 {}'],
    [/^Updated \{\} configuration for (.+)$/, '更新了 {} 配置 于 $1'],
    ['Updated {} events for {} from {} to {}', '更新了 {} 事件 于 {} 从 {} 改为 {}'],
    [/^Updated \{\} events for (.+) from \{\} to \{\}$/, '更新了 {} 事件 于 $1 从 {} 改为 {}'],
    // 公钥：第二个槽位是指纹段落
    ['Created public key {} {}', '创建了公钥 {} {}'],
    ['Deleted public key {} {}', '删除了公钥 {} {}'],
    ['Verify public key {} {}', '验证了公钥 {} {}'],
    [
      'Verify public key failed for {} key is invalid. You must supply a key in OpenSSH public key format {}',
      '公钥 {} 验证失败，密钥无效。必须提供 OpenSSH 公钥格式的密钥 {}'
    ],
    // 市场协议与上架项、赞助、存储库社交预览图
    ['Signed {} version {}', '签署了 {} {} 版'],
    ['Created draft Marketplace listing {} in the “{}” category', '创建了草稿市场上架项 {}，类别为“{}”'],
    ['`.github/FUNDING.yml` file changed on {} repository.', '更改了 {} 存储库的 `.github/FUNDING.yml` 文件。'],
    [/^Uploaded image “(.+)” to represent \{\}$/, '上传了代表 {} 的图片“$1”']
  ]
} satisfies PageDictionary
