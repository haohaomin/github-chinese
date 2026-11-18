import type { PageDictionary } from '../../../core/types'
import { TIME_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * 开发人员设置：GitHub 应用（/settings/apps、/settings/apps/new、/settings/apps/…）与
 * OAuth 应用（/settings/developers、/settings/applications/new、/settings/applications/…）。
 * 包括注册表单、常规设置（客户端密钥、私钥、显示信息、IP 允许列表）、安装、高级（转让、删除、公共/专用）、
 * 可选功能、Copilot 配置。权限与可订阅事件见 permissions.ts。
 */
export default {
  static: {
    // GitHub 应用列表
    'Job queued to revoke all user tokens': '已排队撤销所有用户令牌',
    'Want to build something that integrates with and extends GitHub?': '想构建与 GitHub 集成并扩展 GitHub 的工具？',
    'Register a new GitHub App': '注册新的 GitHub 应用',
    'to get started developing on the GitHub API. You can also read more about building GitHub Apps in our':
      '以开始基于 GitHub API 开发。有关构建 GitHub 应用的更多信息请参阅',
    'A GitHub App can act on its own behalf, taking actions via the API directly instead of impersonating a user. Read more in our':
      'GitHub 应用可以以自身身份直接通过 API 执行操作，而无需模拟用户。详情请参阅',
    'developer documentation': '开发人员文档',

    // 注册 GitHub 应用
    'Register new GitHub App': '注册新的 GitHub 应用',
    'GitHub App name': 'GitHub 应用名称',
    'The name of your GitHub App.': '你的 GitHub 应用的名称。',
    'Markdown supported': '支持 Markdown',
    'This is displayed to users of your GitHub App': '向你的 GitHub 应用的用户显示',
    'Homepage URL': '主页 URL',
    'The full URL to your GitHub App’s website.': '你的 GitHub 应用网站的完整 URL。',
    "The full URL to your GitHub App's website.": '你的 GitHub 应用网站的完整 URL。',
    'Identifying and authorizing users': '识别和授权用户',
    'The full URL to redirect to after a user authorizes an installation.': '用户授权安装后重定向到的完整 URL。',
    'The URIs to redirect to after a user authorizes your application. You may add up to 10 redirect URIs. Wildcard matching allows tokens to be sent to all subdomains and additional paths of the redirect URI. Only enable this if you are sure you have control over all possible matches.':
      '用户授权你的应用后重定向到的 URI。最多可添加 10 个重定向 URI。通配符匹配允许将令牌发送到重定向 URI 的所有子域和其他路径。仅在确定能控制所有可能的匹配项时启用。',
    'Callback URL documentation': '回调 URL 文档',
    'Add Callback URL': '添加回调 URL',
    'Callback URL': '回调 URL',
    'Expire user authorization tokens': '用户授权令牌自动过期',
    // 「This will provide a <code>refresh_token</code> which can be used to …」：原文无逗号，用“以便”接续
    'This will provide a': '这将提供',
    'which can be used to request an updated access token when this access token expires.': '以便在此访问令牌过期时请求新的访问令牌。',
    'Request user authorization (OAuth) during installation': '安装期间请求用户授权 (OAuth)',
    'Requests that the installing user grants access to their identity during installation of your App':
      '安装应用时请求安装者授权访问其身份',
    // 「Requests that the installing user <a>grants access to their identity</a> during installation of your App.」
    'Requests that the installing user': '安装应用时请求安装者',
    'grants access to their identity': '授权访问其身份',
    'during installation of your App.': '。',
    'Identifying and authorizing users for GitHub Apps documentation': 'GitHub 应用识别和授权用户文档',
    'Enable Device Flow': '启用设备流程',
    'Allow this GitHub App to authorize users via the Device Flow.': '允许此 GitHub 应用通过设备流程授权用户。',
    // 「Allow this GitHub App to authorize users via the <a>device flow</a>.」
    'Allow this GitHub App to authorize users via the': '允许此 GitHub 应用使用',
    'Device Flow documentation': '设备流程文档',
    'Post installation': '安装后',
    'Setup URL (optional)': '设置 URL（可选）',
    'Setup URL': '设置 URL',
    'Users will be redirected to this URL after installing your GitHub App to complete additional setup.':
      '用户安装你的 GitHub 应用后将被重定向到此 URL 以完成其他设置。',
    'Unavailable when requesting OAuth during installation.': '安装期间请求 OAuth 时不可用。',
    "Users will be redirected to the 'User authorization callback URL' to complete additional setup.":
      '用户将被重定向到“用户授权回调 URL”以完成其他设置。',
    'Redirect on update': '更新时重定向',
    "Redirect users to the 'Setup URL' after installations are updated (E.g. repositories added/removed).":
      '安装更新后（例如添加或删除存储库）将用户重定向到“设置 URL”。',
    "Redirect users to the 'User authorization callback URL' after installations are updated (E.g repositories added/removed).":
      '安装更新后（例如添加或删除存储库）将用户重定向到“用户授权回调 URL”。',
    "Redirect users to the 'User authorization callback URL' after installations are updated (E.g. repositories added/removed).":
      '安装更新后（例如添加或删除存储库）将用户重定向到“用户授权回调 URL”。',
    'Events will POST to this URL. Read our': '事件将以 POST 方式发送到此 URL。请阅读',
    // 「Events will POST to this URL with a <a>webhook</a>.」「Set a secret to <a>secure your webhooks</a>.」
    'Events will POST to this URL with a': '事件将以 POST 方式发送到此 URL 并使用',
    'Set a secret to': '设置机密以',
    'secure your webhooks': '保护你的 Web 钩子',
    'webhook documentation': 'Web 钩子文档',
    'Webhook secret (optional)': 'Web 钩子机密（可选）',
    'webhook secret documentation': 'Web 钩子机密文档',
    'Where can this GitHub App be installed?': '此 GitHub 应用可以安装在哪里？',
    'Only on this account': '仅限此帐户',
    'Any account': '任意帐户',
    'Allow this GitHub App to be installed by any user or organization.': '允许任何用户或组织安装此 GitHub 应用。',
    'Create GitHub App': '创建 GitHub 应用',
    'Registration successful. You must': '注册成功。你必须',
    'generate a private key': '生成私钥',
    'in order to install your GitHub App.': '才能安装你的 GitHub 应用。',
    'Got it. Your GitHub App has been updated.': '已更新你的 GitHub 应用。',
    'The GitHub App is now public. Anyone is free to install it.': '此 GitHub 应用现已设为公共。任何人都可以安装。',
    'The GitHub App is now private. It can only be installed on this account.': '此 GitHub 应用现已设为专用。只能安装在此帐户上。',

    // GitHub 应用设置：侧边栏、常规
    'Permissions & events': '权限和事件',
    'Install App': '安装应用',
    'Optional features': '可选功能',
    'Public page': '公开页面',
    'Owned by:': '所有者：',
    'App ID:': '应用 ID：',
    'Client ID:': '客户端 ID：',
    'Client ID': '客户端 ID',
    'Using your App ID to get installation tokens? You can now': '在使用应用 ID 获取安装令牌？现在你可以',
    'use your Client ID instead': '改用客户端 ID',
    'Revoke all user tokens': '撤销所有用户令牌',
    'GitHub Apps can use OAuth credentials to identify users. Learn more about identifying users by reading our':
      'GitHub 应用可以使用 OAuth 凭据识别用户。有关识别用户的更多信息请阅读',
    'integration developer documentation': '集成开发人员文档',
    'Public link': '公开链接',
    'Revoke all user tokens?': '撤销所有用户令牌？',
    'Are you sure you want to revoke': '确定要撤销此应用的',
    'user tokens for this application?': '用户令牌吗？',
    'All users of this application will be forced back through the': '此应用的所有用户都必须重新完成',
    'authorization flow': '授权流程',
    'before they can use your application again.': '才能再次使用你的应用。',
    'All SSH keys created by this application will also be deleted.': '此应用创建的所有 SSH 密钥也将被删除。',
    'This action is not reversible.': '此操作不可逆。',
    'I understand, revoke all user tokens': '我已了解，撤销所有用户令牌',
    'Client secrets': '客户端密钥',
    'Client secret': '客户端密钥',
    'Generate a new client secret': '生成新的客户端密钥',
    'You need a client secret to authenticate as the application to the API.': '你需要客户端密钥才能以应用身份向 API 进行身份验证。',
    'Make sure to copy your new client secret now. You won’t be able to see it again.': '请立即复制新的客户端密钥。之后将无法再次查看。',
    "Make sure to copy your new client secret now. You won't be able to see it again.": '请立即复制新的客户端密钥。之后将无法再次查看。',
    'Basic information': '基本信息',
    'Display information': '显示信息',
    'Drag & drop': '拖放',
    'Upload a logo...': '上传徽标...',
    'Upload a logo…': '上传徽标…',
    'You can also drag and drop a picture from your computer.': '你也可以从电脑拖放图片。',
    // 上传错误：原文两句，第二句「Try again.」单独成句（与下方 Whoops! 等同组提示一致）
    'Only images, please. Try again.': '仅支持图片。请重试。',
    '1MB or less, please. Try again.': '图片不能超过 1MB。请重试。',
    'Whoops! Try again.': '出错了！请重试。',
    'File contents don’t match the file extension. Try again.': '文件内容与扩展名不符。请重试。',
    "File contents don't match the file extension. Try again.": '文件内容与扩展名不符。请重试。',
    'Delete this image': '删除此图片',
    'Badge background color': '徽章背景色',
    'The hex value of the badge background color. Hex colors should only contain numbers and letters from a-f.':
      '徽章背景色的十六进制值。十六进制颜色只能包含数字和字母 a-f。',
    'List your GitHub App in the': '将你的 GitHub 应用上架到',
    'so that other users can discover it.': '以便其他用户发现它。',
    'List in Marketplace': '上架到市场',
    'Edit how your GitHub App is presented in the Marketplace directory, including screenshots and links.':
      '编辑你的 GitHub 应用在市场目录中的展示方式，包括截图和链接。',
    'Edit Marketplace listing': '编辑市场上架信息',
    'Private keys': '私钥',
    'Generate a private key': '生成私钥',
    'You need a private key to sign access token requests.': '你需要私钥来签署访问令牌请求。',
    'Learn more about private keys': '了解私钥',
    'Private key': '私钥',
    // 「Enter the IP addresses … with <a>IP allow lists</a> to selectively inherit …」
    'Enter the IP addresses of your GitHub App to allow organizations with': '输入 GitHub 应用的 IP 地址可让启用了',
    "to selectively inherit the App's IP allow list when installed.": '的组织在安装时选择继承该应用的 IP 允许列表。',
    'to selectively inherit the App’s IP allow list when installed.': '的组织在安装时选择继承该应用的 IP 允许列表。',
    'Learn more about App IP allow lists': '了解应用 IP 允许列表',
    'There are no IP addresses on the allow list yet.': '允许列表中暂无 IP 地址。',

    // 权限更新
    'Add a note to users': '给用户添加备注',
    'This note will be displayed on the permissions update approval page.': '此备注将显示在权限更新审批页面上。',
    'Add a note to your users explaining why you are requesting these changes.': '给用户添加备注以说明请求这些更改的原因。',
    'Are you sure you want to update permissions?': '确定要更新权限吗？',
    'Current users will be prompted to accept these changes and enable the new permissions on their installation.':
      '系统会提示现有用户接受这些更改并在其安装中启用新权限。',

    // 高级：转让、删除、公共/专用
    'Transfer ownership of this GitHub App': '转让此 GitHub 应用的所有权',
    'Type the name of the GitHub App to confirm': '输入 GitHub 应用的名称以确认',
    'New owner’s GitHub username or organization name': '新所有者的 GitHub 用户名或组织名称',
    "New owner's GitHub username or organization name": '新所有者的 GitHub 用户名或组织名称',
    'Transfer this GitHub App': '转让此 GitHub 应用',
    'Delete this GitHub App': '删除此 GitHub 应用',
    'Delete GitHub App': '删除 GitHub 应用',
    'Delete GitHub App?': '删除 GitHub 应用？',
    'be undone. This will permanently delete the': '撤销。这将永久删除',
    // 「This will also uninstall the GitHub App from <strong>3 accounts</strong>.」
    'This will also uninstall the GitHub App from': '这还会卸载此 GitHub 应用共涉及',
    'Please type in the name of the GitHub App to confirm.': '请输入 GitHub 应用的名称以确认。',
    'I understand the consequences, delete this GitHub App': '我已了解后果，删除此 GitHub 应用',
    'Make this GitHub App public': '将此 GitHub 应用设为公共',
    'Allow this GitHub App to be installed on other accounts.': '允许在其他帐户上安装此 GitHub 应用。',
    'Make this GitHub App private': '将此 GitHub 应用设为专用',
    'Private GitHub Apps cannot be installed on other accounts.': '专用 GitHub 应用无法安装在其他帐户上。',
    'This integration cannot be made private since it is already installed on other accounts.':
      '此集成因已安装在其他帐户上而无法设为专用。',
    'Make this application private': '将此应用设为专用',
    'Private applications cannot be installed on other accounts.': '专用应用无法安装在其他帐户上。',

    // 可选功能
    'User-to-server token expiration': '用户到服务器令牌过期',
    'User-to-server access tokens will expire after 8 hours. A Refresh Token will be provided which can be exchanged for a new access token.':
      '用户到服务器访问令牌将在 8 小时后过期。届时会提供可用于换取新访问令牌的刷新令牌。',
    'Disable user-to-server token expiration for this app.': '为此应用禁用用户到服务器令牌过期。',

    // Copilot 配置
    'A Copilot configuration allows your GitHub App to integrate with Copilot. Learn more about building GitHub Copilot Extensions in the':
      'Copilot 配置让你的 GitHub 应用可以与 Copilot 集成。有关构建 GitHub Copilot 扩展的更多信息请参阅',
    'Accept the Marketplace Developer agreement to create your Copilot Extension': '接受市场开发人员协议以创建 Copilot 扩展',
    // 「By clicking "Accept Terms" below, you agree to the <a>…Policy</a> and <a>Pre-release License terms</a>. …」
    'By clicking "Accept Terms" below, you agree to the': '单击下方的“接受条款”即表示你同意',
    'By clicking “Accept Terms” below, you agree to the': '单击下方的“接受条款”即表示你同意',
    'GitHub Copilot Extension Developer Policy': 'GitHub Copilot 扩展开发人员政策',
    'Pre-release License terms': '预发行许可条款',
    '. Please check to make sure that you are agreeing to these terms on behalf of the correct account.':
      '。请确认你是代表正确的帐户同意这些条款。',
    'Accept Terms': '接受条款',
    'To enable Copilot functionality, you must first accept the Marketplace Developer agreement':
      '要启用 Copilot 功能，必须先接受市场开发人员协议',
    'To enable Copilot functionality, you must first grant your app permission to read Copilot Messages. To do so, navigate to Permissions & Events > Account Permissions > Read-only for Copilot Chat':
      '要启用 Copilot 功能，必须先授予应用读取 Copilot 消息的权限。为此，请前往权限和事件 > 帐户权限 > 将 Copilot 聊天设为只读',

    // OAuth 应用列表
    'No OAuth applications': '暂无 OAuth 应用',
    'OAuth applications are used to access the GitHub API.': 'OAuth 应用用于访问 GitHub API。',
    'Read the docs': '阅读文档',
    'to find out more.': '了解更多。',
    'Register a new application': '注册新应用',
    'No OAuth apps': '暂无 OAuth 应用',
    'OAuth apps are used to access the GitHub API. Read the docs to find out more.': 'OAuth 应用用于访问 GitHub API。阅读文档了解更多。',
    'Developer applications': '开发人员应用',
    // 「These are applications you have registered to use the <a>GitHub API</a>.」
    'These are applications you have registered to use the': '你注册的这些应用可调用',
    'New OAuth Application': '新建 OAuth 应用',

    // 注册 / 编辑 OAuth 应用
    'Register a new OAuth app': '注册新的 OAuth 应用',
    'Register a new OAuth application': '注册新的 OAuth 应用',
    'Application name': '应用名称',
    'Something users will recognize and trust.': '用户能够识别并信任的名称。',
    'The full URL to your application homepage.': '应用主页的完整 URL。',
    'Application description': '应用描述',
    'Application description is optional': '应用描述为选填项',
    'This is displayed to all users of your application.': '向应用的所有用户显示。',
    'Authorization callback URL': '授权回调 URL',
    'Your application’s callback URL. Read our': '应用的回调 URL。请阅读',
    "Your application's callback URL. Read our": '应用的回调 URL。请阅读',
    'OAuth documentation': 'OAuth 文档',
    'Allow this OAuth App to authorize users via the Device Flow.': '允许此 OAuth 应用通过设备流程授权用户。',
    // 「Allow this OAuth App to authorize users via the <a>device flow</a>.」
    'Allow this OAuth App to authorize users via the': '允许此 OAuth 应用使用',
    'Register application': '注册应用',
    'Update application': '更新应用',
    'Application logo': '应用徽标',
    'Upload new logo': '上传新徽标',
    'Delete application': '删除应用',
    'Transfer ownership of this application': '转让此应用的所有权',
    'Delete this OAuth application': '删除此 OAuth 应用',
    'Are you sure you want to delete this application?': '确定要删除此应用吗？',

    // OAuth 应用设置页（React）
    'OAuth app settings': 'OAuth 应用设置',
    'OAuth application settings': 'OAuth 应用设置',
    'Application settings': '应用设置',
    // 「<a>用户</a> owns this application.」
    'owns this application.': '拥有此应用。',
    // 「You can edit how <strong>应用</strong> is presented on <a>GitHub Marketplace</a>, including …」
    'You can edit how': '你可以编辑',
    'is presented on': '在',
    ', including description, screenshots, and pricing information.': '上的展示方式，包括描述、截图和定价信息。',
    'You cannot delete the only client secret. Generate a new client secret first.': '无法删除唯一的客户端密钥。请先生成新的客户端密钥。',
    'Label: Client secret': '标签：客户端密钥',
    'Redirect URIs': '重定向 URI',
    'Redirect URI': '重定向 URI',
    'Add redirect URI': '添加重定向 URI',
    'Allow wildcard matching': '允许通配符匹配',
    'The URIs to redirect to after a user authorizes an app. You may add up to 10 redirect URIs. Wildcard matching allows tokens to be sent to all subdomains and additional paths of the redirect URI. Only enable this if you are sure you have control over all possible matches.':
      '用户授权应用后重定向到的 URI。最多可添加 10 个重定向 URI。通配符匹配允许将令牌发送到重定向 URI 的所有子域和其他路径。仅在确定能控制所有可能的匹配项时启用。',
    'Learn more about secure use of redirect URIs': '了解如何安全使用重定向 URI',
    'e.g. https://example.com/auth': '例如 https://example.com/auth',
    'Token expiration': '令牌过期',
    'Expire user access tokens': '用户访问令牌自动过期',
    'Access tokens will expire after 8 hours. A refresh token will be provided which can be used to request an updated access token. Existing tokens are not affected.':
      '访问令牌将在 8 小时后过期。届时会提供可用于请求新访问令牌的刷新令牌。现有令牌不受影响。',
    'Transfer this application': '转让此应用',
    'Type the name of the application to confirm': '输入应用名称以确认',
    'Type in the name of the application to confirm that you want to transfer this repository.': '输入应用名称以确认转让。',
    'Type in the username of the new owner.': '输入新所有者的用户名。',
    'Delete application?': '删除应用？',
    'Delete OAuth application': '删除 OAuth 应用',
    'Fewer than 10 users are currently using this application. It will not be able to be used after deletion.':
      '目前使用此应用的用户少于 10 个。删除后将无法再使用。',
    'Please note that deleting the OAuth application will invalidate any access tokens authorized by users.':
      '请注意删除 OAuth 应用会使用户授权的所有访问令牌失效。'
  },
  scoped: {
    // 列表（与组织开发人员设置共用；Developer settings 菜单项由 settings-account 收录）
    'GitHub Apps': 'GitHub 应用',
    'OAuth Apps': 'OAuth 应用',
    'New GitHub App': '新建 GitHub 应用',
    'New OAuth App': '新建 OAuth 应用',
    'New OAuth app': '新建 OAuth 应用',
    'No GitHub Apps': '暂无 GitHub 应用',
    'View documentation': '查看文档',
    'device flow': '设备流程',

    // 表单（与组织、存储库 Web 钩子共用的短语；SSL 验证等说明由 repo-settings 收录）
    'Read the': '请阅读',
    // Web 钩子分节标题、字段名；「Events will POST to this URL with a <a>webhook</a>.」
    Webhook: 'Web 钩子',
    'Webhook URL': 'Web 钩子 URL',
    webhook: 'Web 钩子',
    Secret: '机密',
    '(not recommended)': '（不推荐）',
    // 「Disabling this option is <a>not recommended</a>.」
    'not recommended': '不推荐',
    'Recent deliveries': '最近交付',
    Response: '响应',
    Redeliver: '重新传递',
    Headers: '标头',
    Payload: '有效负载',

    // 设置页（General、Install 由 settings-account、common-ui 收录）
    Advanced: '高级',
    Added: '添加于',
    'IP allow list': 'IP 允许列表',
    'IP address or range in CIDR notation': 'IP 地址或 CIDR 表示的地址范围',
    'Short description of IP address or range': 'IP 地址或范围的简短描述',
    'Check IP address': '检查 IP 地址',
    'Enter an IP address to check whether it is permitted by enabled entries on the IP allow list.':
      '输入 IP 地址以检查 IP 允许列表中已启用的条目是否允许它。',
    'Crop your new avatar': '裁剪新头像',
    'Set new avatar': '设置新头像',
    'Your avatar has been updated. It may take a few minutes to update across the site.': '头像已更新。全站同步可能需要几分钟。',
    'This avatar has been deleted.': '已删除此头像。',
    'Uploading...': '上传中...',
    'Uploading…': '上传中…',
    all: '所有',
    'Make private': '设为专用',
    'This cannot be undone. Please be certain.': '此操作无法撤销。请谨慎操作。',
    'Opt-out': '退出',
    'Opt-in': '加入',
    'Installed on': '安装在'
  },
  regexp: [
    [/^Only allow this GitHub App to be installed on the (@[\w-]+) account\.$/, '仅允许将此 GitHub 应用安装在 $1 帐户上。'],
    [/^Choose an account to install (.+) on:$/, '选择要安装 $1 的帐户：'],
    [/^Install (.+) on this account\.$/, '将 $1 安装到此帐户。'],
    [/^(.+) is installed on this account\.$/, '$1 已安装在此帐户上。'],
    [/^Where should we transfer (.+)\?$/, '要将 $1 转让给谁？'],
    [
      /^Any user or organization will be able to install this GitHub App\. Are you sure you want to make (.+) public\?$/,
      '任何用户或组织都可以安装此 GitHub 应用。确定要将 $1 设为公共吗？'
    ],
    [
      /^This GitHub [Aa]pp will only be installable on the (\S+) account\. Are you sure you want to make (.+) private\?$/,
      '此 GitHub 应用将只能安装在 $1 帐户上。确定要将 $2 设为专用吗？'
    ],
    [/^(\d+) accounts?$/, '$1 个帐户'],
    [/^(\d+) users?$/, '$1 个用户'],
    // 客户端密钥：「Added 3 days ago by octocat」
    [
      new RegExp(`^Added (${TIME_SOURCE}) by ([\\w-]+)$`),
      (_, time: string, user: string) => joinCjk(translateTime(time), `由 ${user} 添加`)
    ],
    [/^This will also uninstall the GitHub App from (\d+) accounts?\.$/, '这还会从 $1 个帐户中卸载此 GitHub 应用。'],
    [/^Activate optional features for (.+)$/, '为 $1 激活可选功能'],
    [/^Choose a feature to activate for (.+):$/, '选择要为 $1 激活的功能：'],
    // 最近交付：交付耗时（与存储库 Web 钩子一致）
    [/^Completed in ([\d.]+) seconds?(\.?)$/, (_, seconds: string, dot: string) => `耗时 ${seconds} 秒${dot ? '。' : ''}`]
  ]
} satisfies PageDictionary
