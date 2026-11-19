import type { PageDictionary } from '../../../core/types'

/**
 * 组织机密和变量：操作机密 / 变量、代码空间机密、Dependabot 机密、专用注册表（产品名译法见 nav.ts 文件头）。
 * 与存储库设置共用的列表、表单、删除对话框文字放 scoped。
 */
export default {
  static: {
    // Actions 机密
    'Organization secrets': '组织机密',
    'This organization has no secrets.': '此组织暂无机密。',
    'New organization secret': '新建组织机密',
    'Organization secrets and variables cannot be used by private repositories with your plan.':
      '你的计划不支持专用存储库使用组织机密和变量。',
    'This secret may be used by public repositories in the organization. Paid GitHub plans include private repositories.':
      '组织中的公共存储库可以使用此机密。付费 GitHub 计划包含专用存储库。',
    'Organization secrets cannot be used by private repositories with your plan.': '你的计划不支持专用存储库使用组织机密。',
    'This secret may only be used by specifically selected repositories.': '只有明确选定的存储库才能使用此机密。',
    'Secret repository access': '机密的存储库访问权限',
    'Select the organization repositories that may use this secret.': '选择可以使用此机密的组织存储库。',
    'This secret may be used by any repository in the organization.': '组织中的任何存储库都可以使用此机密。',
    'This secret may be used by any private repository in the organization.': '组织中的任何专用存储库都可以使用此机密。',

    // Actions 变量
    'New organization variable': '新建组织变量',
    'Create new organization variable': '新建组织变量',
    'Organization variables': '组织变量',
    'This organization has no variables.': '此组织暂无变量。',
    'This variable may be used by public repositories in the organization. Paid GitHub plans include private repositories.':
      '组织中的公共存储库可以使用此变量。付费 GitHub 计划包含专用存储库。',
    'Organization variables cannot be used by private repositories with your plan.': '你的计划不支持专用存储库使用组织变量。',
    'This variable may only be used by specifically selected repositories.': '只有明确选定的存储库才能使用此变量。',
    'Variable repository access': '变量的存储库访问权限',
    'Select the organization repositories that may use this variable.': '选择可以使用此变量的组织存储库。',

    // Codespaces 机密
    'This organization has no development environment secrets.': '此组织暂无开发环境机密。',

    // 专用注册表
    'Private registry configurations include passwords or tokens that are handled as encrypted secrets. Access to private registry configurations is limited to':
      '专用注册表配置包含作为加密机密处理的密码或令牌。专用注册表配置仅限',
    'for analyzing code. The automatically-generated name for a private registry configuration is visible to users in log files for debugging. No other information is accessible to users.':
      '在分析代码时访问。专用注册表配置自动生成的名称会显示在日志文件中，供用户调试。用户无法访问其他任何信息。',
    'Private registry secrets': '专用注册表机密',
    'New private registry': '新建专用注册表',
    'Select registry type': '选择注册表类型',
    'Add Registry': '添加注册表',
    'Edit private registry': '编辑专用注册表'
  },
  scoped: {
    // 页头说明（与存储库设置共用，片段间原文无逗号，译文不加）
    'Actions secrets and variables': '操作机密和变量',
    'Secrets and variables allow you to manage reusable configuration data. Secrets are': '机密和变量可用于管理可复用的配置数据。机密经过',
    encrypted: '加密',
    'and are used for sensitive data.': '并用于敏感数据。',
    'Learn more about encrypted secrets': '了解加密机密',
    '. Variables are shown as plain text and are used for': '。变量以纯文本显示并用于',
    'non-sensitive': '非敏感',
    'data.': '数据。',
    'Learn more about variables': '了解变量',
    'Anyone with collaborator access to the repositories with access to a secret or variable can use it for Actions. They are not passed to workflows that are triggered by a pull request from a fork.':
      '对有权访问机密或变量的存储库拥有协作者权限的任何人都可以在 GitHub 操作中使用它们。它们不会传递给由复刻的拉取请求触发的工作流。',
    'Please consider': '如需此功能请考虑',
    'upgrading your plan': '升级计划',
    'if you require this functionality.': '。',
    Secrets: '机密',
    Variables: '变量',

    // 列表与提示
    Value: '值',
    'Last updated': '最后更新',
    Environment: '环境',
    'all repositories': '所有存储库',
    'private and internal repositories': '专用和内部存储库',
    'Host setup': '主机设置',
    'Development environment': '开发环境',
    'Private registry': '专用注册表',
    'Codespace user': '代码空间用户',
    // 原文四句，句号随原文（不并成逗号句）
    'Failed to add secret. Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '无法添加机密。机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。',
    'Secret added.': '已添加机密。',
    'Secret updated.': '已更新机密。',
    'Secret deleted.': '已删除机密。',
    'Variable added.': '已添加变量。',
    'Variable updated.': '已更新变量。',
    'Variable deleted.': '已删除变量。',

    // 删除对话框
    'Delete secret': '删除机密',
    'Delete variable': '删除变量',
    'Are you sure you want to delete': '确定要删除',
    'Unable to delete': '无法删除',
    'Yes, delete this': '是，删除此',
    secret: '机密',
    variable: '变量',

    // 新建 / 更新机密
    'Add secret': '添加机密',
    'New secret': '新建机密',
    'Remove secret': '移除机密',
    Variable: '变量',
    'Adding…': '添加中…',
    'Adding...': '添加中...',
    'Public repositories': '公共存储库',
    'Private repositories': '专用存储库',
    'Update selection': '更新选择',
    'Update secret': '更新机密',
    // 原文 and 处无逗号，译文不加；与 repo-settings、settings-developer 同句一致
    'Secret values are encrypted and cannot be displayed, but you can': '机密值已加密且无法显示，但你可以',
    'enter a new value.': '输入新值。',
    'Name and value are required': '名称和值为必填项',
    'Re-authentication required': '需要重新验证身份',
    'Secret encryption failed: missing public key': '机密加密失败：缺少公钥',

    // 新建 / 更新变量
    '/ New variable': '/ 新建变量',
    'Note: Variable values are exposed as plain text. If you need to encrypt and mask sensitive information,':
      '注意：变量值以纯文本形式公开。如需加密和屏蔽敏感信息，请',
    'create a secret': '创建机密',
    'instead.': '。',
    'Variable names may only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_).':
      '变量名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。',
    'Variable names cannot start with a number.': '变量名称不能以数字开头。',
    'Variable names cannot start with': '变量名称不能以',
    'prefix.': '前缀开头。',
    'Variable name can only contain alphanumeric characters. Special characters and spaces are not allowed.':
      '变量名称只能包含字母数字字符。不允许特殊字符和空格。',
    'Variable name can only start with a letter or underscore.': '变量名称只能以字母或下划线开头。',
    'Variable name cannot start with "GITHUB_" prefix.': '变量名称不能以“GITHUB_”前缀开头。',
    'Add variable': '添加变量',
    '/ Update variable': '/ 更新变量',
    'Update variable': '更新变量',
    'Save variable': '保存变量',

    // Codespaces 机密
    'Development environment secrets are environment variables that are': '开发环境机密是经过',
    '. They are available to any codespace user with': '的环境变量。对有权访问该机密的存储库拥有',
    collaborator: '协作者',
    'access to the repositories with access to that secret.': '权限的任何代码空间用户都可以使用它们。',
    'Development environment secrets': '开发环境机密',
    'New codespace secret': '新建代码空间机密',

    // Dependabot 机密
    'Secrets are credentials that are': '机密是经过',
    '. Anyone with': '的凭据。对有权访问各机密的存储库拥有',
    'access to the repositories with access to each secret can use it for Dependabot.': '权限的任何人都可以在 Dependabot 中使用它们。',
    'Secrets are not passed to forks.': '机密不会传递给复刻。',

    // 专用注册表
    'CodeQL default setup': 'CodeQL 默认设置',
    'Registry type': '注册表类型',
    'Add registry': '添加注册表',
    'Maven Repository': 'Maven 存储库',
    'NuGet Feed': 'NuGet 源',
    Token: '令牌',
    'Username and password': '用户名和密码',
    Username: '用户名',
    // 专用注册表：OIDC 与匿名身份验证（云服务商字段名，服务商名称保留英文）
    Anonymous: '匿名',
    'Tenant ID': '租户 ID',
    'AWS Region': 'AWS 区域',
    'Account ID': '帐户 ID',
    'Role Name': '角色名称',
    Domain: '域',
    'Domain Owner': '域所有者',
    Audience: '受众',
    Namespace: '命名空间',
    'Service Account Slug': '服务帐户标识',
    'API Host': 'API 主机',
    'Workload Identity Provider': '工作负载标识提供者',
    'Service Account': '服务帐户',
    'OIDC Provider Name': 'OIDC 提供方名称',
    'Identity Mapping Name': '身份映射名称'
  }
} satisfies PageDictionary
