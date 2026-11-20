import type { PageDictionary } from '../../../core/types'

/** 审核日志令牌策略事件中的令牌类型 */
const TOKEN_KIND: Readonly<Record<string, string>> = {
  'personal access tokens (classic)': '個人存取權杖（傳統）',
  'fine-grained personal access tokens': '精細個人存取權杖'
}
const TOKENS = '(personal access tokens \\(classic\\)|fine-grained personal access tokens)'

/** 令牌有效期事件末尾的「(Not exempting administrators)」 */
const EXEMPT: Readonly<Record<string, string>> = { 'Not exempting': '不豁免管理員', Exempting: '豁免管理員' }

/** 双因素要求事件的动作 */
const TWO_FACTOR_VERB: Readonly<Record<string, string>> = { removed: '移除了', cleared: '清除了', enabled: '啟用了', disabled: '停用了' }

/** Dependabot 规则事件中的规则名称（未收录的照原文） */
const DEPENDABOT_RULE: Readonly<Record<string, string>> = { 'Dismiss package malware alerts': '解除套件惡意軟體警示' }

/**
 * 审核日志事件说明：组织审核日志（/organizations/<组织>/settings/audit-log）与个人安全日志（/settings/security-log）共用。
 * 事件说明被用户、存储库、组织等链接或 span 拆开，按行内句收录（槽位顺序不能调换）；槽位里的取值见 scoped。
 * 预算事件的动作「updated」与全站时间片段不同，只在组织审核日志收录（见 archive.ts）。
 */
export default {
  static: {
    // 审核日志事件（无槽位）
    'Updated codespace access and security settings to disable access to all repositories':
      '將程式碼空間存取和安全性設定更新為停用所有儲存庫的存取權'
  },
  scoped: {
    // 事件槽位里的取值（read / write / private 由同页面类型的其他词条译出）
    'first-time contributors': '首次貢獻者',
    'first-time contributors new to GitHub': 'GitHub 新使用者中的首次貢獻者',
    'users without write access': '沒有寫入權限的使用者',
    'all outside collaborators': '所有外部協作者',
    'not set': '未設定',
    themselves: '自己',
    none: '無',
    'Personal access token (Classic)': '個人存取權杖（傳統）',
    yourself: '你自己',
    admin: '管理員'
  },
  inline: [
    // 存储库、依赖项更新、源 IP 显示
    ['Renamed the repository {} to {}', '將儲存庫 {} 重新命名為 {}'],
    ['Created the repository {}', '建立了儲存庫 {}'],
    ['Enabled GitHub Actions for {}', '為 {} 啟用了 GitHub 動作'],
    ['Disabled dependency updates on self-hosted actions for {}', '為 {} 停用了自架動作的相依性更新'],
    ['Enabled dependency updates on self-hosted actions for {}', '為 {} 啟用了自架動作的相依性更新'],
    ['Disabled source ip disclosure for the {} organization.', '為 {} 組織停用了來源 IP 揭露。'],
    ['Enabled source ip disclosure for the {} organization.', '為 {} 組織啟用了來源 IP 揭露。'],
    // 令牌策略（开头的 <strong> 是参与者；有效期、访问限制见下方正则）
    [
      '{} requires now that fine-grained personal access token requests made by organization members are subject to administrator review',
      '{} 現在要求組織成員的精細個人存取權杖請求須經管理員審查'
    ],
    [
      '{} allows fine-grained personal access token requests made by organization members to no longer be subject to administrator review',
      '{} 已允許組織成員的精細個人存取權杖請求無需管理員審查'
    ],
    [
      new RegExp(`^\\{\\} unset ${TOKENS} expiration limit$`),
      (_: string, kind: string) => `{} 取消了${TOKEN_KIND[kind] ?? kind}的到期限制`
    ],
    [
      new RegExp(`^\\{\\} set ${TOKENS} maximum lifetime to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`),
      (_: string, kind: string, days: string, exempt: string) =>
        `{} 將${TOKEN_KIND[kind] ?? kind}的最長有效期設為 ${days} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(
        `^\\{\\} changed ${TOKENS} maximum lifetime from (\\d+) days? to (\\d+) days? \\((Not exempting|Exempting) administrators\\)$`
      ),
      (_: string, kind: string, from: string, to: string, exempt: string) =>
        `{} 將${TOKEN_KIND[kind] ?? kind}的最長有效期從 ${from} 天改為 ${to} 天（${EXEMPT[exempt] ?? exempt}）`
    ],
    [
      new RegExp(`^\\{\\} maximum lifetime for ${TOKENS} is (not )?exempting administrators now\\.$`),
      (_: string, kind: string, not: string) => `{} 已將${TOKEN_KIND[kind] ?? kind}的最長有效期設為${not ? '不' : ''}豁免管理員。`
    ],
    [
      new RegExp(`^\\{\\} has (permitted|restricted) access via ${TOKENS} to the organization$`),
      (_: string, verb: string, kind: string) => `{} 已${verb === 'permitted' ? '允許' : '限制'}透過${TOKEN_KIND[kind] ?? kind}存取組織`
    ],
    // 双因素要求（开头是参与者的登录名，纯文本）
    [
      /^([\w-]+) (removed|cleared|enabled) secure two-factor requirement for \{\} organization\.$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 組織的安全雙重驗證要求。`
    ],
    [
      /^([\w-]+) (enabled|disabled) two-factor authentication requirement for \{\} organization$/,
      (_: string, actor: string, verb: string) => `${actor} ${TWO_FACTOR_VERB[verb] ?? verb} {} 組織的雙重驗證要求`
    ],
    // 第三方应用访问限制、集成、机密
    ['Enabled third-party application access restrictions for the {} organization', '為 {} 組織啟用了第三方應用程式存取限制'],
    ['Disabled third-party application access restrictions for the {} organization', '為 {} 組織停用了第三方應用程式存取限制'],
    ['Uninstalled the {} integration', '解除安裝了 {} 整合'],
    ['Installed the {} integration.', '安裝了 {} 整合。'],
    ['Removed {} secret {} for {}', '移除了 {} 機密 {} 於 {}'],
    ['Created {} secret {} available to {} repositories for {}', '建立了 {} 機密 {} 可用於 {} 儲存庫 於 {}'],
    // 域（域名是纯文本）、部署密钥、推送保护的自定义消息、Dependabot 规则
    [/^Removed the ([\w.-]+) domain from the \{\} organization\.$/, '從 {} 組織中移除了網域 $1。'],
    [/^Approved the ([\w.-]+) domain for the \{\} organization\.$/, '為 {} 組織核准了網域 $1。'],
    [/^Added the ([\w.-]+) domain to the \{\} organization\.$/, '在 {} 組織中新增了網域 $1。'],
    [/^Verified the ([\w.-]+) domain for the \{\} organization\.$/, '為 {} 組織驗證了網域 $1。'],
    [
      'Members can now create and use deploy keys to repositories in the {} organization.',
      '成員現在可以為 {} 組織中的儲存庫建立和使用部署金鑰。'
    ],
    [
      'Updated the custom message to display when GitHub detects and blocks a secret {}',
      '為 {} 更新了 GitHub 偵測並封鎖機密時顯示的自訂訊息'
    ],
    [
      'Enabled the custom message to display when GitHub detects and blocks a secret {}',
      '為 {} 啟用了 GitHub 偵測並封鎖機密時顯示的自訂訊息'
    ],
    [
      'Disabled the custom message to display when GitHub detects and blocks a secret {}',
      '為 {} 停用了 GitHub 偵測並封鎖機密時顯示的自訂訊息'
    ],
    [
      /^Force (enabled|disabled) Dependabot rule "([^"]+)" for \{\}$/,
      (_: string, verb: string, rule: string) =>
        `為 {} 強制${verb === 'enabled' ? '啟用' : '停用'}了 Dependabot 規則「${DEPENDABOT_RULE[rule] ?? rule}」`
    ],
    // Web 钩子、操作策略
    ['Installed {} for {} with {} events', '安裝了 {} 於 {} 並訂閱 {} 事件'],
    ['Uninstalled {} for {}', '解除安裝了 {} 於 {}'],
    ['Set policy to default workflow token can create or approve PR to true for {}', '為 {} 允許預設工作流程權杖建立或核准 PR'],
    ['Set policy to default workflow token permission to write for {}', '為 {} 將預設工作流程權杖權限政策設為讀寫'],
    [
      'Set policy to require approval for private fork pull request workflows from {} for {}.',
      '將政策設為來自 {} 的私人分叉拉取請求工作流程需經核准，適用於 {}。'
    ],
    [
      'Set policy to require approval for fork pull request workflows from {} for {}.',
      '將政策設為來自 {} 的分叉拉取請求工作流程需經核准，適用於 {}。'
    ],
    ['Set fork pull request workflows policy to {}', '將分叉拉取請求工作流程政策設為 {}'],
    ['Set artifact and log retention duration to {}', '將成品和記錄保留期限設為 {}'],
    ['Updated list of allowed actions and workflows for {}', '為 {} 更新了允許的動作和工作流程清單'],
    [
      'Updated allowed select actions and workflows to allow actions created by GitHub and allow verified actions for {}',
      '為 {} 將允許的選定動作和工作流程更新為允許 GitHub 建立的動作和已驗證的動作'
    ],
    ['Updated allowed actions and workflows to all actions and workflows for {}', '為 {} 將允許的動作和工作流程更新為所有動作和工作流程'],
    [
      'Updated the repo-level self-hosted runners policy from {} entities to {} entities',
      '將儲存庫層級自架執行器政策從 {} 實體更新為 {} 實體'
    ],
    // Copilot 代码审查、项目、代码空间、自定义属性
    ['Copilot review effort default changed from {} to {} for the {} organization', 'Copilot 審查強度預設值從 {} 變更為 {} 於 {} 組織'],
    ['Created project {} in {}', '建立了專案 {} 於 {}'],
    ['Closed project {} in {}', '關閉了專案 {} 於 {}'],
    ['Reopened project {} in {}', '重新開啟了專案 {} 於 {}'],
    ['Created a view in project {} in {}', '為專案 {} 建立了檢視 於 {}'],
    ['Created a field in project {} in {}', '為專案 {} 建立了欄位 於 {}'],
    ['Deleted a field in project {} in {}', '刪除了專案 {} 的欄位 於 {}'],
    [
      'Updated Codespaces access to all members and collaborators on all internal and private repositories in {}',
      '將 {} 中程式碼空間的存取權更新為所有內部和私人儲存庫的所有成員和協作者'
    ],
    [
      'Updated Codespaces access to all members on all internal and private repositories in {}',
      '將 {} 中程式碼空間的存取權更新為所有內部和私人儲存庫的所有成員'
    ],
    [
      'Updated Codespaces access to selected users on all internal and private repositories in {}',
      '將 {} 中程式碼空間的存取權更新為所有內部和私人儲存庫的選定使用者'
    ],
    ['Allowed themselves to use Codespaces for the {} organization', '允許自己在 {} 組織中使用程式碼空間'],
    ['Stopped allowing themselves to use Codespaces for the {} organization', '不再允許自己在 {} 組織中使用程式碼空間'],
    ['Created custom property {}', '建立了自訂屬性 {}'],
    ['Deleted custom property {}', '刪除了自訂屬性 {}'],
    // 成员权限、版主、组织角色（槽位：成员或团队、角色、组织）
    ['Added themselves as a moderator for the {} organization', '將自己新增為 {} 組織的版主'],
    ['Removed themselves as a moderator for the {} organization', '將自己從 {} 組織的版主中移除'],
    ['Members can now delete issues in the {} organization.', '成員現在可以刪除 {} 組織中的議題。'],
    ['Members can no longer delete issues in the {} organization.', '成員無法再刪除 {} 組織中的議題。'],
    ['Members cannot create new teams for the {} organization.', '成員無法為 {} 組織建立新團隊。'],
    [
      'Repository admins can now install GitHub Apps on their repositories in {}',
      '{} 中的儲存庫管理員現在可以在其儲存庫上安裝 GitHub 應用程式'
    ],
    [
      'App access requests are now allowed for members and outside collaborators in {}',
      '{} 中的成員和外部協作者現在可以提出應用程式存取要求'
    ],
    ['Members can no longer publish private GitHub Pages in the {} organization.', '成員無法再發佈 {} 組織中的私人 GitHub 頁面。'],
    ['Disabled forking of private repositories in the {} organization.', '停用了 {} 組織中私人儲存庫的分叉。'],
    [
      '{} the creation of only public and private repositories by members of the {} organization',
      '{} {} 組織的成員僅可建立公開和私人儲存庫'
    ],
    [
      'Changed the base repository permission setting from {} to {} for the {} organization.',
      '將基本儲存庫權限設定從 {} 變更為 {}，適用於 {} 組織。'
    ],
    ['assigned {} to the {} organization role in the {} organization', '將 {} 指派到 {} 組織角色 於 {} 組織'],
    ['assigned the {} team to the {} organization role in the {} organization', '將 {} 團隊指派到 {} 組織角色 於 {} 組織'],
    ['unassigned {} from the {} organization role in the {} organization', '將 {} 從 {} 組織角色中取消指派 於 {} 組織'],
    ['unassigned the {} team from the {} organization role in the {} organization', '將 {} 團隊從 {} 組織角色中取消指派 於 {} 組織'],
    // 分支保护（第一个槽位是分支名称模式）
    ['Enabled branch protection for {} on {}', '為 {} 啟用了分支保護 於 {}'],
    ['Disabled branch protection for {} on {}', '為 {} 停用了分支保護 於 {}'],
    // 审核日志事件说明（槽位顺序不能调换）
    ['Added themselves to the {} team', '將自己加入 {} 團隊'],
    ['Created the team {}', '建立了團隊 {}'],
    ['Renamed organization from {} to {}', '將組織從 {} 重新命名為 {}'],
    ['Created the ruleset {} in {}', '建立了規則集 {} 於 {}'],
    ['Updated Codespaces ownership to User in {}', '在 {} 中將程式碼空間擁有權更新為使用者'],
    ['Created the {} organization', '建立了 {} 組織'],
    ['Added themselves to the {} organization with {} permission', '將自己加入 {} 組織並取得 {} 權限'],
    ['Created the label {}', '建立了標籤 {}'],
    ['Set policy to default workflow token permission to read for {}', '為 {} 將預設工作流程權杖權限政策設為唯讀'],
    ['Set policy to default workflow token can create or approve PR to false for {}', '為 {} 禁止預設工作流程權杖建立或核准 PR'],
    [
      'Members can no longer create and use deploy keys to repositories in the {} organization.',
      '成員無法再為 {} 組織中的儲存庫建立和使用部署金鑰。'
    ],
    // 个人安全日志：被用户、应用、企业链接拆开的事件描述
    ['Blocked user {}', '封鎖了使用者 {}'],
    ['Unblocked user {}', '解除封鎖了使用者 {}'],
    ['Removed authorization for OAuth application {}', '移除了 OAuth 應用程式 {} 的授權'],
    ['Added {} as an owner of the {} enterprise', '將 {} 新增為 {} 企業的擁有者'],
    ['{} added payment details to the {} enterprise', '{} 為 {} 企業新增了付款詳細資料'],
    ['Marketplace listing {} was sent back to draft state', '市集上架資訊 {} 已退回草稿狀態'],
    // 存储库主题、合并设置、机密（「via the API」：通过 API 进行的操作）
    ['Added {} to the {} repository', '將 {} 新增到 {} 儲存庫'],
    ['Removed {} from the {} repository', '將 {} 從 {} 儲存庫中移除'],
    ['Allowed {} on the {} repository', '允許了 {} 於 {} 儲存庫'],
    ['Blocked {} on the {} repository', '封鎖了 {} 於 {} 儲存庫'],
    ['Changed {} on the {} repository', '變更了 {} 於 {} 儲存庫'],
    ['Created a secret for {} via the API', '透過 API 為 {} 建立了機密'],
    ['Created environment {} via the API', '透過 API 建立了環境 {}'],
    [
      'Created a deployment branch protection rule for {} via the API . The environment can only deploy in branches matching a branch policy pattern.',
      '透過 API 為 {} 建立了部署分支保護規則。此環境只能部署到符合分支原則模式的分支。'
    ],
    ['Deleted the ruleset {} in {}', '刪除了規則集 {} 於 {}'],
    ['Updated the ruleset {} in {}', '更新了規則集 {} 於 {}'],
    // OAuth 授权与令牌（槽位里的令牌类型见 scoped）
    ['Created authorization for personal access token with {} scope(s)', '建立了具有 {} 範圍的個人存取權杖授權'],
    ['Created authorization for OAuth application {} with {} scope(s)', '為 OAuth 應用程式 {} 建立了具有 {} 範圍的授權'],
    ['Removed authorization for OAuth application was marked as stale {}', '移除了已標示為過時的 OAuth 應用程式 {} 的授權'],
    ['Created a {} token for {} ending in {}.', '建立了 {} 擁有者為 {} 結尾為 {}。'],
    ['Regenerated a {} token for {} ending in {}.', '重新產生了 {} 擁有者為 {} 結尾為 {}。'],
    ['Updated a {} token for {} ending in {}.', '更新了 {} 擁有者為 {} 結尾為 {}。'],
    ['Revoked a {} token for {} ending in {}.', '撤銷了 {} 擁有者為 {} 結尾為 {}。'],
    // 精细令牌的访问权限（令牌名在引号里，是纯文本）
    [
      /^\{\} has revoked access to resources owned by yourself for the personal access token "(.+)"$/,
      '{} 已撤銷個人存取權杖「$1」對你擁有之資源的存取權'
    ],
    [
      /^\{\} has granted the personal access token "(.+)" access to resources owned by yourself$/,
      '{} 已授予個人存取權杖「$1」對你擁有之資源的存取權'
    ],
    [/^\{\} requested access for "(.+)" on resources owned by \{\}$/, '{} 為「$1」要求了對 {} 擁有之資源的存取權'],
    // 应用的安装、存储库访问
    ['Suspended the {} integration', '暫停了 {} 整合'],
    ['Unsuspended the {} integration', '取消暫停了 {} 整合'],
    ['Added the following repositories to the {} integration: {}', '已將以下儲存庫加入 {} 整合：{}'],
    ['Added the following repositories to the {} integration via the API: {}', '已透過 API 將以下儲存庫加入 {} 整合：{}'],
    ['Removed the following repositories from the {} integration: {}', '已將以下儲存庫移出 {} 整合：{}'],
    ['Removed the following repositories from the {} integration via the API: {}', '已透過 API 將以下儲存庫移出 {} 整合：{}'],
    // 开发人员设置：OAuth 应用、GitHub 应用（integration）
    ['Created the {} application', '建立了 {} 應用程式'],
    ['Updated the {} application', '更新了 {} 應用程式'],
    ['Deleted the {} application', '刪除了 {} 應用程式'],
    ['Generated a new client secret for the {} application', '為 {} 應用程式產生了新的用戶端密碼'],
    ['Removed a client secret for the {} application', '移除了 {} 應用程式的用戶端密碼'],
    ['Revoked {} for the {} application', '撤銷了 {} 於 {} 應用程式'],
    ['Enabled token expiration for the {} application', '為 {} 應用程式啟用了權杖到期'],
    ['Disabled token expiration for the {} application', '為 {} 應用程式停用了權杖到期'],
    ['Created the {} integration', '建立了 {} 整合'],
    ['Updated the {} integration', '更新了 {} 整合'],
    ['Deleted the {} integration', '刪除了 {} 整合'],
    ['Generated a new client secret for the {} integration', '為 {} 整合產生了新的用戶端密碼'],
    ['Removed a client secret for the {} integration', '移除了 {} 整合的用戶端密碼'],
    ['Revoked {} for the {} integration', '撤銷了 {} 於 {} 整合'],
    // 应用的 Web 钩子：应用名是纯文本（组织的 Web 钩子见上方，组织名是链接）
    ['Installed {} with {} events', '安裝了 {} 並訂閱 {} 事件'],
    [/^Installed \{\} for (.+) with \{\} events$/, '安裝了 {} 於 $1 並訂閱 {} 事件'],
    [/^Uninstalled \{\} for (.+)$/, '解除安裝了 {} 於 $1'],
    ['Updated {} configuration for {}', '更新了 {} 設定 於 {}'],
    [/^Updated \{\} configuration for (.+)$/, '更新了 {} 設定 於 $1'],
    ['Updated {} events for {} from {} to {}', '更新了 {} 事件 於 {} 從 {} 改為 {}'],
    [/^Updated \{\} events for (.+) from \{\} to \{\}$/, '更新了 {} 事件 於 $1 從 {} 改為 {}'],
    // 公钥：第二个槽位是指纹段落
    ['Created public key {} {}', '建立了公開金鑰 {} {}'],
    ['Deleted public key {} {}', '刪除了公開金鑰 {} {}'],
    ['Verify public key {} {}', '驗證了公開金鑰 {} {}'],
    [
      'Verify public key failed for {} key is invalid. You must supply a key in OpenSSH public key format {}',
      '公開金鑰 {} 驗證失敗，金鑰無效。必須提供 OpenSSH 公開金鑰格式的金鑰 {}'
    ],
    // 市场协议与上架项、赞助、存储库社交预览图
    ['Signed {} version {}', '簽署了 {} {} 版'],
    ['Created draft Marketplace listing {} in the “{}” category', '建立了草稿市集上架資訊 {}，類別為「{}」'],
    ['`.github/FUNDING.yml` file changed on {} repository.', '變更了 {} 儲存庫的 `.github/FUNDING.yml` 檔案。'],
    [/^Uploaded image “(.+)” to represent \{\}$/, '上傳了代表 {} 的圖片「$1」']
  ]
} satisfies PageDictionary
