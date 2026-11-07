import { DATE_SOURCE, joinCjk, translateDate } from '../helpers'
import type { PageDictionary } from '../../../core/types'

/** 机密 / 变量列表行按钮：英文 → 中文 */
const ROW_ACTION: Readonly<Record<string, string>> = {
  Edit: '编辑',
  Delete: '删除',
  Update: '更新',
  Remove: '移除'
}

/**
 * 存储库设置 · 机密和变量（操作、代码空间、Dependabot、代理）、部署密钥、自定义属性。
 * 译法沿用组织设置机密页（org-settings/secrets.ts）。
 */
export default {
  static: {
    // 操作机密和变量
    'New repository secret': '新建存储库机密',
    'New repository variable': '新建存储库变量',
    'Anyone with collaborator access to this repository can use these secrets and variables for actions. They are not passed to workflows that are triggered by a pull request from a fork.':
      '对此存储库拥有协作者权限的任何人都可以在 GitHub 操作中使用这些机密和变量。它们不会传递给由复刻的拉取请求触发的工作流。',
    'Secret names must not start with GITHUB_.': '机密名称不能以 GITHUB_ 开头。',
    'Manage environment secrets': '管理环境机密',
    'Manage environment variables': '管理环境变量',
    'Repository secrets': '存储库机密',
    'This repository has no secrets.': '此存储库暂无机密。',
    'Repository variables': '存储库变量',
    'This repository has no variables.': '此存储库暂无变量。',
    'Secrets can also be created at the organization level and authorized for use in this repository.':
      '也可以在组织级别创建机密，并授权此存储库使用。',
    'Variables can also be created at the organization level and authorized for use in this repository.':
      '也可以在组织级别创建变量，并授权此存储库使用。',
    'Manage organization secrets': '管理组织机密',
    'Manage organization variables': '管理组织变量',
    'Organization secrets can only be used by public repositories on your plan.': '你的计划仅允许公共存储库使用组织机密。',
    'If you would like to use organization secrets in a private repository, you will need to upgrade your plan.':
      '如需在专用存储库中使用组织机密，需要升级计划。',
    'Yes, delete this secret': '是，删除此机密',
    'Yes, delete this variable': '是，删除此变量',
    'Repository secret added.': '存储库机密已添加。',
    'Repository variable added.': '存储库变量已添加。',
    // 原文三句，句号随原文（不并成逗号句；与 org-settings/secrets.ts 同译）
    'Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。',

    // 代理（Copilot 云代理）机密和变量
    'Anyone with collaborator access to this repository can use these secrets and variables for the Copilot cloud agent.':
      '对此存储库拥有协作者权限的任何人都可以为 Copilot 云代理使用这些机密和变量。',

    // 代码空间 / Dependabot 机密
    'Repository development environment secrets': '存储库开发环境机密',
    'Organization development environment secrets': '组织开发环境机密',
    'This repository has no development environment secrets.': '此存储库暂无开发环境机密。',
    'access to this repository can use these secrets for Dependabot.': '权限的任何人都可以在 Dependabot 中使用这些机密。',
    'Encrypted secrets allow you to store private access tokens so that Dependabot can update dependencies from private registries.':
      '加密机密可用于存储私密访问令牌，以便 Dependabot 更新来自专用注册表的依赖项。',
    'No organization secrets have been authorized for this repository.': '尚未授权此存储库使用任何组织机密。',
    'No organization variables have been authorized for this repository.': '尚未授权此存储库使用任何组织变量。',

    // 部署密钥
    'instead for fine grained control over repositories and': '来获得对存储库的精细控制和',
    'use an SSH key to grant readonly or write access to a single repository. They are not protected by a passphrase and can be a security risk if your server is compromised. If you have a complex project or want more fine-grain control over permissions, consider using':
      '使用 SSH 密钥授予对单个存储库的只读或写入访问权限。部署密钥不受密码保护，服务器被入侵时可能带来安全风险。如果项目较复杂或需要更精细的权限控制，请考虑使用',
    'Add deploy key': '添加部署密钥',
    'There are no deploy keys for this repository': '此存储库暂无部署密钥',
    'guide on deploy keys': '部署密钥指南',
    'Last used within the last week': '最近一周内使用过',
    'be undone. This will permanently delete the SSH key, and if you’d like to use it in the future, you will need to upload it again.':
      '撤销。这将永久删除此 SSH 密钥，今后如需使用，须重新上传。',
    "be undone. This will permanently delete the SSH key, and if you'd like to use it in the future, you will need to upload it again.":
      '撤销。这将永久删除此 SSH 密钥，今后如需使用，须重新上传。',
    'Allow write access': '允许写入权限',
    'Can this key be used to': '此密钥能否用于',
    'to this repository? Deploy keys always have pull access.': '到此存储库？部署密钥始终拥有拉取权限。',
    'Add key': '添加密钥',

    // 自定义属性（新版页面标题与说明在前）
    'Repository custom properties': '存储库自定义属性',
    'Add metadata to your repositories, such as compliance frameworks, data sensitivity, or project details.':
      '为存储库添加元数据，如合规框架、数据敏感性或项目详细信息。',
    'Custom properties allow you to decorate your repository with information such as compliance frameworks, data sensitivity, or project details.':
      '自定义属性可为存储库添加合规框架、数据敏感性或项目详细信息等内容。',
    'No custom properties have been set for this repository': '此存储库尚未设置自定义属性',
    'No custom properties set for this repository.': '此存储库未设置自定义属性。',
    'No custom properties have been defined for this organization': '此组织尚未定义自定义属性',
    'Learn more about custom properties': '了解自定义属性',
    // 「Learn more about custom properties」链接 +「and how to set them at the organization level.」
    'and how to set them at the organization level.': '以及如何在组织级别设置。',
    'Repository properties updated.': '存储库属性已更新。'
  },
  scoped: {
    'We recommend using': '建议改用',
    'enhanced security': '更强的安全性',
    'Check out our': '请查看我们的',
    'to learn more.': '了解更多。',
    'Begins with': '开头为',
    'Actions secrets and variables': '操作机密和变量',
    'Secrets or variables tab': '机密或变量标签页',
    'New secret': '新建机密',
    'Secrets and variables allow you to manage reusable configuration data. Secrets are': '机密和变量可用于管理可复用的配置数据。机密经过',
    encrypted: '加密',
    'and are used for sensitive data.': '并用于敏感数据。',
    'Learn more about encrypted secrets': '了解加密机密',
    '. Variables are shown as plain text and are used for': '。变量以纯文本显示并用于',
    'non-sensitive': '非敏感',
    'data.': '数据。',
    'Learn more about variables': '了解变量',
    Secrets: '机密',
    Variables: '变量',
    Value: '值',
    'Last updated': '最后更新',
    Updated: '更新于',
    Environment: '环境',
    // 原文四句，句号随原文（与 org-settings/secrets.ts 同译）
    'Failed to add secret. Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '无法添加机密。机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。',
    'Secret added.': '已添加机密。',
    'Secret updated.': '已更新机密。',
    'Secret deleted.': '已删除机密。',
    'Variable added.': '已添加变量。',
    'Variable updated.': '已更新变量。',
    'Variable deleted.': '已删除变量。',
    'Delete secret': '删除机密',
    'Delete variable': '删除变量',
    'Are you sure you want to delete': '确定要删除',
    'Yes, delete this': '是，删除此',
    secret: '机密',
    variable: '变量',
    '/ New variable': '/ 新建变量',
    '/ Update variable': '/ 更新变量',
    'Add secret': '添加机密',
    'Add variable': '添加变量',
    'Update secret': '更新机密',
    'Update variable': '更新变量',
    'Adding…': '添加中…',
    'Adding...': '添加中...',
    // 原文只有 but 前一个逗号（与 settings-developer/codespaces.ts 同译）
    'Secret values are encrypted and cannot be displayed, but you can': '机密值已加密且无法显示，但你可以',
    'enter a new value.': '输入新值。',
    'Name and value are required': '名称和值为必填项',
    'Note: Variable values are exposed as plain text. If you need to encrypt and mask sensitive information,':
      '注意：变量值以纯文本形式公开。如需加密和屏蔽敏感信息，请',
    'create a secret': '创建机密',
    'instead.': '。',
    'Variable names may only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_).':
      '变量名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。',
    'Variable names cannot start with a number.': '变量名称不能以数字开头。',
    'Variable names cannot start with': '变量名称不能以',
    'prefix.': '前缀开头。',
    'Development environment secrets are environment variables that are': '开发环境机密是经过',
    '. Secrets are not passed to forks.': '的环境变量。机密不会传递给复刻。',
    'Development environment secrets': '开发环境机密',
    'Secrets are credentials that are': '机密是经过',
    '. Anyone with': '的凭据。对此存储库拥有',
    collaborator: '协作者',
    'Secrets are not passed to forks.': '机密不会传递给复刻。',
    Key: '密钥',
    push: '推送',
    cannot: '无法',
    'This action': '此操作',
    'Never used': '从未使用'
  },
  regexp: [
    // 机密 / 变量列表：更新时间
    [new RegExp(`^Updated (${DATE_SOURCE})$`), (_, date: string) => joinCjk('更新于', translateDate(date) ?? date)],
    // 部署密钥：添加时间、最近使用
    [new RegExp(`^Added on (${DATE_SOURCE})$`), (_, date: string) => joinCjk('添加于', translateDate(date) ?? date)],
    [
      /^Last used within the last (\d+) (week|month)s?$/,
      (_, count: string, unit: string) => `最近 ${count} ${unit === 'week' ? '周' : '个月'}内使用过`
    ],
    // 部署密钥列表的权限标记：原文破折号不计入检查脚本的原文标点，用正则保留破折号
    [/^— Read(\/write)?$/, (_, write: string | undefined) => (write ? '— 读写' : '— 只读')],
    // 删除确认
    [/^Are you sure you want to delete ([A-Z_][A-Z0-9_]{0,99})\?$/, '确定要删除 $1 吗？'],
    // 机密 / 变量列表行按钮的读屏名称：Edit NPM_TOKEN、Delete NPM_TOKEN
    [/^(Edit|Delete|Update|Remove) ([A-Z_][A-Z0-9_]{1,99})$/, (_, verb: string, name: string) => `${ROW_ACTION[verb] ?? verb} ${name}`]
  ]
} satisfies PageDictionary
