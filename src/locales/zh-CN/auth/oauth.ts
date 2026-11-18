import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/**
 * OAuth 应用 / GitHub 应用授权页（/login/oauth/authorize）、设备授权确认页、选择授权帐户、授权后重定向。
 * 「X by Y wants to access your Z account」按片段收录：X、Y、Z 是独立元素。
 */
export default {
  static: {
    'Authorize application': '授权应用',
    'wants to access your': '想要访问你的',
    'would like permission to:': '请求以下权限：',

    // 权限说明
    'Resources on your account': '你帐户上的资源',
    'Act on your behalf': '代表你执行操作',
    'Know which resources you can access': '了解你可以访问哪些资源',
    'Verify your GitHub identity': '验证你的 GitHub 身份',
    'View your email addresses': '查看你的电子邮件地址',
    'This application will be able to': '此应用将能够',
    'read and write all public and private repository data': '读写所有公共和专用存储库数据',
    '. This includes the following:': '，包括：',
    'Personal user data': '个人用户数据',
    'Email addresses (read-only)': '电子邮件地址（只读）',
    'This application will be able to read your private email addresses.': '此应用将能够读取你的私密电子邮件地址。',
    'This application will be able to read your organization and team membership and private Projects.':
      '此应用将能够读取你的组织和团队成员身份以及专用项目。',

    // 组织访问
    'This organization allows the application to access organization data as described in the permissions above.':
      '此组织允许应用按上述权限访问组织数据。',
    'Until access is granted by an owner, the application cannot access the organization’s private data or modify its public data.':
      '在所有者授予访问权限前，应用无法访问组织的私密数据，也无法修改其公开数据。',
    "Until access is granted by an owner, the application cannot access the organization's private data or modify its public data.":
      '在所有者授予访问权限前，应用无法访问组织的私密数据，也无法修改其公开数据。',
    'The application cannot access this organization’s private data or modify its public data.':
      '应用无法访问此组织的私密数据，也无法修改其公开数据。',
    "The application cannot access this organization's private data or modify its public data.":
      '应用无法访问此组织的私密数据，也无法修改其公开数据。',

    // 应用信息
    'Owned & operated by GitHub': '由 GitHub 拥有和运营',
    'Not owned or operated by GitHub': '非 GitHub 拥有或运营',
    'Learn more about OAuth': '了解 OAuth',
    'Authorizing will redirect to': '授权后将重定向到',

    // 选择授权帐户 /login/oauth/select_account
    'From the options below, choose which account you would like to use to authorize this app.': '从以下选项中选择用于授权此应用的帐户。',
    'Use a different account': '使用其他帐户',
    'has not been installed on any accounts you have access to.': '尚未安装在你有权访问的任何帐户上。',

    // 授权后重定向
    'OAuth application authorized': 'OAuth 应用已授权',
    'You are being redirected to the authorized application.': '正在重定向到已授权的应用。',
    'If your browser does not redirect you back, please visit': '如果浏览器没有自动跳转，请访问',
    'If your browser does not redirect you back, please': '如果浏览器没有自动跳转，请',

    // 重新授权
    'Reauthorization required': '需要重新授权',
    'This application has made an unusually high number of requests to access your account. Please reauthorize the application to continue.':
      '此应用访问你帐户的请求异常频繁。请重新授权以继续。'
  },
  scoped: {
    // 权限分组
    'Organizations and teams': '组织和团队',
    'Repository delete': '删除存储库',
    'Commit status': '提交状态',
    Deployments: '部署',
    Workflow: '工作流',
    // read / write access → 读取 / 写入访问权限（GLOSSARY permission 行），与 Full access 同用“访问权限”
    'Read-only access': '只读访问权限',
    'Read and write access': '读取和写入访问权限',
    'Full access': '完全访问权限',

    // 授权页片段
    Authorize: '授权',
    by: '来自',
    account: '帐户',
    private: '专用',
    Request: '请求',
    Grant: '授予',
    // 「<Not> owned or operated by GitHub」
    Not: '非',
    'owned or operated by GitHub': 'GitHub 拥有或运营',
    Created: '创建于',
    'GitHub users': '个 GitHub 用户',
    'click here': '单击此处',
    'to continue.': '以继续。',
    'this setup page': '此设置页面',
    '(read)': '（只读）',
    'Public and': '公共和',
    'Email addresses': '电子邮件地址',
    'Deploy keys': '部署密钥',
    'Webhooks and services': 'Web 钩子和服务',
    'Collaboration invites': '协作邀请',
    'Organization access': '组织访问权限'
  },
  regexp: [
    [/^Authorize (.+)$/, '授权 $1'],
    [/^Continue as (\S+)$/, '以 $1 身份继续'],
    [/^Select user to authorize (.+)$/, '选择要授权 $1 的用户'],
    [/^More than ([\d.,]+[KkMm]?)$/, '超过 $1'],
    [/^(?:Fewer|Less) than ([\d.,]+[KkMm]?)$/, '少于 $1'],
    [/^More than ([\d.,]+[KkMm]?) GitHub users$/, '超过 $1 个 GitHub 用户'],
    [/^(?:Fewer|Less) than ([\d.,]+[KkMm]?) GitHub users$/, '少于 $1 个 GitHub 用户'],
    [/^Verify your GitHub identity \(([\w-]+)\)$/, '验证你的 GitHub 身份 ($1)'],
    [new RegExp(`^Created (${TIME_SOURCE})$`), (_, time: string) => joinCjk('创建于', translateTime(time))]
  ]
} satisfies PageDictionary
