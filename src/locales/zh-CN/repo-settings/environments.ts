import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 环境：环境列表、新建 / 删除、部署保护规则（必需审查者、等待计时器、自定义规则）、
 * 部署分支和标签、环境机密 / 变量。
 * 机密与变量的通用对话框文字（Add secret、Delete secret 等）见 secrets.ts。
 */
export default {
  static: {
    // 列表
    'New environment': '新建环境',
    'You can configure environments with protection rules, variables, and secrets.': '可以为环境配置保护规则、变量和机密。',
    'You can configure environments with protection rules and secrets.': '可以为环境配置保护规则和机密。',
    'Learn more about configuring environments.': '了解如何配置环境。',
    'There are no environments for this repository': '此存储库暂无环境',
    'Environments are used by your workflows for deployments.': '工作流使用环境进行部署。',
    'Delete environment': '删除环境',
    'Are you sure you want to delete this environment?': '确定要删除此环境吗？',
    'Deleting an environment will delete all associated secrets, variables, and protection rules.':
      '删除环境将同时删除所有相关的机密、变量和保护规则。',
    'I understand, delete this environment': '我已了解，删除此环境',
    'Environment deleted.': '环境已删除。',
    'There was an error saving your new environment.': '保存新环境时出错。',

    // 新建 / 配置
    'Configure environment': '配置环境',
    'Configure reviewers, timers, and custom rules that must pass before deployments to this environment can proceed.':
      '配置部署到此环境前必须通过的审查者、计时器和自定义规则。',
    'Specify people or teams that may approve workflow runs when they access this environment.':
      '指定在工作流运行访问此环境时可以批准的人员或团队。',
    'Search for people or teams...': '搜索人员或团队...',
    'Search for people or teams…': '搜索人员或团队…',
    'Prevent self-review': '禁止自我审查',
    'Require a different approver than the user who triggered the workflow run.': '要求由触发工作流运行的用户以外的人批准。',
    'Wait timer': '等待计时器',
    'Set an amount of time to wait before allowing deployments to proceed.': '设置允许部署继续之前的等待时间。',
    'Enable custom rules with GitHub Apps': '使用 GitHub 应用启用自定义规则',
    'Learn about existing apps': '了解现有应用',
    'create your own protection rules': '创建自己的保护规则',
    'so you can deploy with confidence.': '以便放心部署。',
    'Allow administrators to bypass configured protection rules': '允许管理员绕过已配置的保护规则',
    'Save protection rules': '保存保护规则',

    // 部署分支和标签
    'Deployment branches and tags': '部署分支和标签',
    'Limit which branches and tags can deploy to this environment based on rules or naming patterns.':
      '根据规则或命名模式，限制哪些分支和标签可以部署到此环境。',
    'No restriction': '无限制',
    'No restriction to which branch or tag from this repository can deploy.': '不限制此存储库的哪些分支或标签可以部署。',
    'Protected branches only': '仅受保护分支',
    'Deployment limited to branches with protection rules.': '仅允许带有保护规则的分支部署。',
    'Selected branches and tags': '选定的分支和标签',
    'Specify a list of branches and tags using naming patterns.': '使用命名模式指定分支和标签列表。',
    '. Based on the existing': '。依据现有的',
    'repository branch protection rules': '存储库分支保护规则',
    'No branch or tag rules applied yet:': '尚未应用分支或标签规则：',
    'all branches and tags are still allowed to deploy.': '所有分支和标签仍可部署。',
    'Add deployment branch or tag rule': '添加部署分支或标签规则',
    'Ref type:': '引用类型：',
    'Name pattern:': '名称模式：',
    'Update deployment branch rule': '更新部署分支规则',
    'Environment changes successfully saved: all branches can deploy.': '环境更改已保存：所有分支都可以部署。',
    'Environment changes successfully saved: only protected branches can deploy.': '环境更改已保存：仅受保护分支可以部署。',
    'Environment changes successfully saved: only selected branches and tags can deploy.': '环境更改已保存：仅选定的分支和标签可以部署。',

    // 环境机密 / 变量
    'Secrets are encrypted environment variables. They are accessible only by GitHub Actions in the context of this environment by using the':
      '机密是加密的环境变量，只有 GitHub 操作能在此环境的上下文中访问，访问方式是使用',
    'secret context': '机密上下文',
    'This environment has no secrets.': '此环境暂无机密。',
    'Add environment secret': '添加环境机密',
    'Secret value': '机密值',
    // 名称校验错误：原文冒号后三句，句号随原文（不并成逗号句；与 secrets.ts、org-settings/secrets.ts 同一写法）
    'Failed to add secret: Secret names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '无法添加机密：机密名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。',
    'Variables are used for non-sensitive configuration data. They are accessible only by GitHub Actions in the context of this environment by using the':
      '变量用于非敏感的配置数据，只有 GitHub 操作能在此环境的上下文中访问，访问方式是使用',
    'variable context': '变量上下文',
    'This environment has no variables.': '此环境暂无变量。',
    'Add environment variable': '添加环境变量',
    'Variable value': '变量值',
    'Failed to add variable: Variable names can only contain alphanumeric characters ([a-z], [A-Z], [0-9]) or underscores (_). Spaces are not allowed. Must start with a letter ([a-z], [A-Z]) or underscores (_).':
      '无法添加变量：变量名称只能包含字母数字字符 ([a-z], [A-Z], [0-9]) 或下划线 (_)。不允许空格。必须以字母 ([a-z], [A-Z]) 或下划线 (_) 开头。'
  },
  scoped: {
    // 与 Actions 部署审查对话框共用（actions 词典可能以 static 收录）
    'Deployment protection rules': '部署保护规则',
    '/ Add': '/ 添加',
    '/ Configure': '/ 配置',
    "Name can't be blank": '名称不能为空',
    'Name can’t be blank': '名称不能为空',
    'Add up to': '最多还可添加',
    'more reviewers': '个审查者',
    reviewers: '审查者',
    Branch: '分支',
    'Update rule': '更新规则',
    'Environment secrets': '环境机密',
    'Environment variables': '环境变量'
  },
  regexp: [
    // 环境列表：保护规则 / 机密 / 变量数
    [/^(\d+) protection rules?$/, '$1 条保护规则'],
    [/^(\d+) secrets?$/, '$1 个机密'],
    [/^(\d+) variables?$/, '$1 个变量'],
    // 必需审查者
    [/^Add up to (\d+) more reviewers?$/, '最多还可添加 $1 个审查者'],
    // 部署分支：受保护分支数
    [
      /^Applies to (\d+) branch(?:es)?\. Based on the existing repository branch protection rules\.$/,
      '适用于 $1 个分支。依据现有的存储库分支保护规则。'
    ],
    // 新建环境后的提示（环境名照录）
    [/^Environment ["“](.{1,255})["”] created\.$/, '已创建环境“$1”。']
  ]
} satisfies PageDictionary
