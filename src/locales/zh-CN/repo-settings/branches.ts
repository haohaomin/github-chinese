import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 分支 / 标签：经典分支保护规则（列表、编辑器、删除对话框）、受保护标签（已弃用）与导入到规则集。
 * 规则集见 rulesets.ts。
 */
export default {
  static: {
    // 分支保护规则列表
    'Add branch ruleset': '添加分支规则集',
    'Add classic branch protection rule': '添加经典分支保护规则',
    'Add branch protection rule': '添加分支保护规则',
    'Protect your branches with repository rulesets': '使用存储库规则集保护分支',
    'are the recommended way to protect branches, with required deployments, bypass lists, org-level enforcement, and more.':
      '是推荐的分支保护方式，支持必需部署、绕过列表、组织级强制实施等功能。',
    'Classic branch protections': '经典分支保护',
    'are also available but offer fewer capabilities.': '也可使用，但功能较少。',
    'Classic branch protections have not been configured': '尚未配置经典分支保护',
    "You haven't protected any of your branches": '你尚未保护任何分支',
    'You haven’t protected any of your branches': '你尚未保护任何分支',
    "You don't have any branches": '你还没有任何分支',
    'You don’t have any branches': '你还没有任何分支',
    'Before you can edit branch settings, you need to add a branch.': '需要先添加分支，才能编辑分支设置。',
    'Learn how to add a branch': '了解如何添加分支',
    'No branch protection rules defined yet.': '尚未定义分支保护规则。',
    'Define branch rules to disable force pushing, prevent branches from being deleted, or require pull requests before merging. Learn more about':
      '定义分支规则以禁止强制推送、防止删除分支或要求合并前先提交拉取请求。了解',
    'Define a protected branch rule to disable force pushing, prevent branches from being deleted, and optionally require status checks before merging.':
      '定义受保护分支规则以禁止强制推送、防止删除分支，并可选择要求合并前通过状态检查。',
    'Define branch protection rules to disable force pushing, prevent branches from being deleted, and optionally require status checks before merging. New to branch protection rules?':
      '定义分支保护规则以禁止强制推送、防止删除分支，并可选择要求合并前通过状态检查。初次使用分支保护规则？',
    'Learn more about protected branches': '了解受保护分支',
    "Your protected branch rules won't be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.":
      '在迁移到 GitHub 团队版或企业版组织帐户之前，受保护分支规则不会在此专用存储库上强制实施。',
    'Your protected branch rules won’t be enforced on this private repository until you move to a GitHub Team or Enterprise organization account.':
      '在迁移到 GitHub 团队版或企业版组织帐户之前，受保护分支规则不会在此专用存储库上强制实施。',
    "Rules on your private repos can't be enforced until you upgrade to GitHub Team or Enterprise.":
      '升级到 GitHub 团队版或企业版之前，专用存储库上的规则不会强制实施。',
    'Rules on your private repos can’t be enforced until you upgrade to GitHub Team or Enterprise.':
      '升级到 GitHub 团队版或企业版之前，专用存储库上的规则不会强制实施。',
    'Not enforced': '未强制实施',
    'Delete this branch protection rule?': '删除此分支保护规则？',
    'I understand, delete this rule.': '我已了解，删除此规则。',
    'Branch protection rule settings saved.': '分支保护规则设置已保存。',
    'Branch protection rule created.': '分支保护规则已创建。',
    'Branch protection rule was successfully deleted.': '分支保护规则已删除。',

    // 分支保护规则编辑器：说明与计划限制
    'About branch protection rules': '关于分支保护规则',
    'Protect your most important branches': '保护你最重要的分支',
    'define whether collaborators can delete or force push to the branch and set requirements for any pushes to the branch, such as passing status checks or a linear commit history.':
      '决定协作者能否删除或强制推送分支，并为推送到该分支设置要求，例如通过状态检查或保持线性提交历史记录。',
    'Your GitHub Free plan': '你的 GitHub 免费版计划',
    "Your organization's GitHub Free plan": '你的组织的 GitHub 免费版计划',
    'Your organization’s GitHub Free plan': '你的组织的 GitHub 免费版计划',
    'can only enforce rules on its public repositories, like this one.': '只能对公共存储库（例如此存储库）强制实施规则。',
    "Your rules won't be enforced on this private repository until you": '你的规则不会在此专用存储库上强制实施，除非你',
    'Your rules won’t be enforced on this private repository until you': '你的规则不会在此专用存储库上强制实施，除非你',
    'move to a GitHub Team or Enterprise organization account': '迁移到 GitHub 团队版或企业版组织帐户',
    'upgrade this organization to GitHub Team or Enterprise': '将此组织升级到 GitHub 团队版或企业版',
    'Branch name pattern': '分支名称模式',
    'Protect matching branches': '保护匹配的分支',

    // 要求拉取请求
    'Require a pull request before merging': '合并前必须提交拉取请求',
    'When enabled, all commits must be made to a non-protected branch and submitted via a pull request before they can be merged into a branch that matches this rule.':
      '启用后，所有提交都必须先提交到不受保护的分支，并通过拉取请求提交，才能合并到与此规则匹配的分支。',
    'Require approvals': '需要批准',
    'When enabled, pull requests targeting a matching branch require a number of approvals and no changes requested before they can be merged.':
      '启用后，以匹配分支为目标的拉取请求须获得一定数量的批准且没有请求更改，才能合并。',
    'Required number of approvals before merging:': '合并前所需的批准数：',
    'Dismiss stale pull request approvals when new commits are pushed': '推送新提交时消除过时的拉取请求批准',
    'New reviewable commits pushed to a matching branch will dismiss pull request review approvals.':
      '向匹配分支推送新的可审查提交时，将消除拉取请求的审查批准。',
    'Require review from Code Owners': '需要代码所有者审查',
    'Require an approved review in pull requests including files with a designated code owner.':
      '拉取请求包含指定了代码所有者的文件时，需要获得批准审查。',
    'Restrict who can dismiss pull request reviews': '限制谁可以消除拉取请求审查',
    'Specify people, teams, or apps allowed to dismiss pull request reviews.': '指定允许消除拉取请求审查的人员、团队或应用。',
    'People, teams, or apps that can dismiss reviews.': '可以消除审查的人员、团队或应用。',
    'People, teams, or apps that can dismiss reviews': '可以消除审查的人员、团队或应用',
    'Organization and repository administrators': '组织和存储库管理员',
    'These members can always dismiss.': '这些成员始终可以消除。',
    'These members cannot dismiss.': '这些成员无法消除。',
    'Allow specified actors to bypass required pull requests': '允许指定的参与者绕过拉取请求要求',
    'Specify people, teams, or apps who are allowed to bypass required pull requests.': '指定允许绕过拉取请求要求的人员、团队或应用。',
    'People, teams, or apps who can bypass required pull requests': '可以绕过拉取请求要求的人员、团队或应用',
    'These members can always bypass required pull requests.': '这些成员始终可以绕过拉取请求要求。',
    'These members cannot bypass.': '这些成员无法绕过。',
    'Require approval of the most recent reviewable push': '需要批准最近一次可审查的推送',
    'Whether the most recent reviewable push must be approved by someone other than the person who pushed it.':
      '最近一次可审查的推送是否必须由推送者以外的人批准。',

    // 状态检查
    'Require status checks to pass before merging': '合并前必须通过状态检查',
    'must pass before branches can be merged into a branch that matches this rule. When enabled, commits must first be pushed to another branch, then merged or pushed directly to a branch that matches this rule after status checks have passed.':
      '必须通过，分支才能合并到与此规则匹配的分支。启用后，提交必须先推送到其他分支，在状态检查通过后再合并或直接推送到与此规则匹配的分支。',
    'Require branches to be up to date before merging': '合并前分支必须为最新',
    'This ensures pull requests targeting a matching branch have been tested with the latest code. This setting will not take effect unless at least one status check is enabled (see below).':
      '这可确保以匹配分支为目标的拉取请求已使用最新代码测试。至少启用一项状态检查（见下方）后，此设置才会生效。',
    'Do not require status checks on creation': '创建时不要求状态检查',
    'Allow repositories and branches to be created if a check would otherwise prohibit it.': '即使检查会阻止，也允许创建存储库和分支。',
    'Search for status checks in the last week for this repository': '搜索此存储库最近一周的状态检查',
    'Status checks that are required.': '必需的状态检查。',
    'Status checks that are required': '必需的状态检查',
    'No status checks found': '未找到状态检查',
    'Sorry, we couldn’t find any status checks in the last week for this repository.': '未找到此存储库最近一周的状态检查。',
    "Sorry, we couldn't find any status checks in the last week for this repository.": '未找到此存储库最近一周的状态检查。',
    'Learn more about status checks': '了解状态检查',

    // 对话解决、签名、线性历史记录
    'Require conversation resolution before merging': '合并前必须解决对话',
    'When enabled, all conversations on code must be resolved before a pull request can be merged into a branch that matches this rule.':
      '启用后，必须解决代码上的所有对话，拉取请求才能合并到与此规则匹配的分支。',
    'Learn more about requiring conversation completion before merging': '了解合并前要求完成对话',
    'Require signed commits': '要求签名提交',
    'Commits pushed to matching branches must have verified signatures.': '推送到匹配分支的提交必须带有经过验证的签名。',
    'Require linear history': '要求线性历史记录',
    'Prevent merge commits from being pushed to matching branches.': '禁止将合并提交推送到匹配的分支。',
    'Select the squash or rebase method for the associated merge queue to use this rule.':
      '须为关联的合并队列选择压缩或变基方式，才能使用此规则。',

    // 合并队列
    'Require merge queue': '要求合并队列',
    'Merges to matching branches must be performed via a merge queue.': '必须通过合并队列合并到匹配的分支。',
    'Make sure to configure your CI to build branches created by the queue.': '请确保已配置 CI 构建合并队列创建的分支。',
    'Method to use when merging changes from queued pull requests.': '合并队列中拉取请求的更改时使用的方式。',
    'Build concurrency': '构建并发数',
    'Limit the number of queued pull requests building at the same time.': '限制同时构建的排队拉取请求数量。',
    'Maximum pull requests to build:': '最多同时构建的拉取请求数：',
    'Merge limits': '合并数量限制',
    'Limit the number of pull requests merged into the protected branch in a single merge operation.':
      '限制单次合并操作中合并到受保护分支的拉取请求数量。',
    'Minimum pull requests to merge:': '最少合并的拉取请求数：',
    'Maximum pull requests to merge:': '最多合并的拉取请求数：',
    'Only merge non-failing pull requests': '仅合并未失败的拉取请求',
    'Status check timeout': '状态检查超时',
    'Time (in minutes) a required status check must report a conclusion within to not be considered failed.':
      '必需的状态检查须在此时间（分钟）内报告结论，否则视为失败。',
    'Consider check failed after:': '超过以下时间视为检查失败：',

    // 部署
    'Require deployments to succeed before merging': '合并前必须部署成功',
    'Choose which environments must be successfully deployed to before branches can be merged into a branch that matches this rule.':
      '选择哪些环境必须部署成功，分支才能合并到与此规则匹配的分支。',
    'No deployment environments found': '未找到部署环境',
    'Sorry, we couldn’t find any deployments for this repository.': '未找到此存储库的部署。',
    "Sorry, we couldn't find any deployments for this repository.": '未找到此存储库的部署。',
    'Deployment environments found in this repository': '此存储库中的部署环境',

    // 锁定与推送限制
    'Lock branch': '锁定分支',
    'Branch is read-only. Users cannot push to the branch.': '分支为只读，用户无法推送到此分支。',
    'Do not allow bypassing the above settings': '不允许绕过上述设置',
    'The above settings will apply to administrators and custom roles with the "bypass branch protections" permission.':
      '上述设置将同样适用于管理员以及拥有“绕过分支保护”权限的自定义角色。',
    'The above settings will apply to administrators and custom roles with the “bypass branch protections” permission.':
      '上述设置将同样适用于管理员以及拥有“绕过分支保护”权限的自定义角色。',
    'Restrict who can push to matching branches': '限制谁可以推送到匹配的分支',
    'Specify people, teams, or apps allowed to push to matching branches. Required status checks will still prevent these people, teams, and apps from merging if the checks fail.':
      '指定允许推送到匹配分支的人员、团队或应用。如果必需的状态检查失败，这些人员、团队和应用仍无法合并。',
    'Restrict pushes that create matching branches': '限制创建匹配分支的推送',
    'Only people, teams, or apps allowed to push will be able to create new branches matching this rule.':
      '只有允许推送的人员、团队或应用才能创建与此规则匹配的新分支。',
    'People, teams, or apps with push access': '拥有推送权限的人员、团队或应用',
    'Organization administrators, repository administrators, and users with the Maintain role.':
      '组织管理员、存储库管理员和拥有维护角色的用户。',
    'Organization administrators, repository administrators, the merge queue, and users with the Maintain role.':
      '组织管理员、存储库管理员、合并队列和拥有维护角色的用户。',
    'Admins can always push. Users with the Maintain role can push when required status checks pass.':
      '管理员始终可以推送。拥有维护角色的用户在必需的状态检查通过后可以推送。',
    'These members can push when required status checks pass.': '必需的状态检查通过后，这些成员可以推送。',

    // 适用于所有人的规则
    'Rules applied to everyone including administrators': '适用于包括管理员在内的所有人的规则',
    'Allow force pushes': '允许强制推送',
    'Permit force pushes for all users with push access.': '允许所有拥有推送权限的用户强制推送。',
    'Specify who can force push': '指定谁可以强制推送',
    'Users who can force push': '可以强制推送的用户',
    'Only these people, teams, or apps are allowed to force push.': '只有这些人员、团队或应用可以强制推送。',
    'Search for people, teams, or apps': '搜索人员、团队或应用',
    'You have reached the maximum number of people, teams, and apps you can add.': '已达到可添加的人员、团队和应用数量上限。',
    'View the protected branches documentation': '查看受保护分支文档',
    'People, teams, or apps who can force push': '可以强制推送的人员、团队或应用',
    'Organization and repository administrators (automatic)': '组织和存储库管理员（自动）',
    'Allow deletions': '允许删除',
    'Allow users with push access to delete matching branches.': '允许拥有推送权限的用户删除匹配的分支。',

    // 受保护标签（已弃用）
    'Tag protection rule created.': '标签保护规则已创建。',
    'Tag protection rule deleted.': '标签保护规则已删除。',
    'Level up your tag protections with Repository Rules': '使用存储库规则升级标签保护',
    // 「…You can learn more about the sunset in our」+ 链接「changelog」+「and can get started now by migrating to rulesets.」
    // （原文链接后无逗号，译文不加）
    'Protected tags are being deprecated. To continue protecting tags, please migrate to a tag ruleset by August 30th. You can learn more about the sunset in our':
      '受保护标签即将弃用。如需继续保护标签，请在 8月30日前迁移到标签规则集。你可以在',
    'and can get started now by migrating to rulesets.': '中了解停用详情并立即开始迁移到规则集。',
    'Protected tags': '受保护标签',
    'Protected tags are available to Pro, Team, and Enterprise users': '专业版、团队版和企业版用户可以使用受保护标签',
    'Protected tags can only be created or deleted by users with enhanced permissions defined by your organization owners.':
      '只有拥有组织所有者定义的增强权限的用户才能创建或删除受保护标签。',
    'Learn more about protected tags': '了解受保护标签',
    'No protected tag rules exist yet': '尚无受保护标签规则',
    'Protected tags have been deprecated': '受保护标签已弃用',
    'Go to rulesets to create new tag rules': '转到规则集创建新的标签规则',
    'Import to rulesets': '导入到规则集',
    'Import your tag protection rules into repository rules': '将标签保护规则导入存储库规则',
    'Migrate your protected tags to one or more repository rulesets. This will implement the same tag protections you currently have today. Once created, the tag rulesets can take advantage of new ruleset features:':
      '将受保护标签迁移到一个或多个存储库规则集，以实施与当前相同的标签保护。创建后，标签规则集可以使用新的规则集功能：',
    'Requiring status checks to pass': '要求通过状态检查',
    'Requiring linear history': '要求线性历史记录',
    'Create separate rulesets for creating and deleting protected tags': '为创建和删除受保护标签分别创建规则集',
    'Users and Teams with at least Maintainer role will be able to create new protected tags. Administrators will be able to delete protected tags. This is the same behavior as existing tag protections.':
      '至少拥有维护者角色的用户和团队可以创建新的受保护标签，管理员可以删除受保护标签。这与现有的标签保护行为相同。',
    'Create one ruleset for all protected tag operations': '为所有受保护标签操作创建一个规则集',
    'Administrators will be able to create and delete protected tags.': '管理员可以创建和删除受保护标签。',
    'Learn more about tag rulesets': '了解标签规则集',
    'Delete tag protection rule': '删除标签保护规则',
    'Delete tag protection rule?': '删除标签保护规则？',
    'Are you sure you want to delete this tag protection rule? Anyone who can write to this repository will be able to create tags with this pattern.':
      '确定要删除此标签保护规则吗？删除后，任何能写入此存储库的人都可以创建符合此模式的标签。',
    // 删除对话框的确认按钮：与标题「Delete tag protection rule?」、正文「…delete this tag protection rule?」是同一操作
    'Yes, remove this tag protection rule': '是，删除此标签保护规则',
    'Tag name pattern': '标签名称模式',
    'to target tags named': '来匹配名为'
  },
  scoped: {
    'Choose which': '选择哪些',
    'Branch protection rules': '分支保护规则',
    'Branch protection rule': '分支保护规则',
    'repository rules': '存储库规则',
    'protected branches': '受保护分支',
    'status checks': '状态检查',
    'Merge method': '合并方式',
    'Method:': '方式：',
    'Merge commit': '合并提交',
    'or after': '或等待',
    minutes: '分钟',
    Required: '必需',
    changelog: '更新日志',
    'Signed commits': '签名提交',
    'New rule': '新建规则',
    '/ New rule': '/ 新建规则',
    Import: '导入',
    'Add rule': '添加规则',
    'Example: You can use': '示例：可以使用',
    ', and so on.': '等的标签。'
  },
  regexp: [
    // 规则列表与编辑器：匹配的分支数
    [
      /^(Currently applies|Applies) to (\d+) branch(?:es)?(\.?)$/,
      (_, verb: string, count: string, dot: string) => `${verb === 'Applies' ? '' : '当前'}适用于 ${count} 个分支${dot ? '。' : ''}`
    ],
    [/^Applies to (\d+) branch(?:es)?:$/, '适用于 $1 个分支：'],
    [/^Applies to (\d+) tags?(\.?)$/, (_, count: string, dot: string) => `适用于 ${count} 个标签${dot ? '。' : ''}`]
  ]
} satisfies PageDictionary
