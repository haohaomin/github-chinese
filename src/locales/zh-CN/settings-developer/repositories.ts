import type { PageDictionary } from '../../../core/types'

/**
 * 存储库（/settings/repositories）、已删除的存储库（/settings/deleted_repositories）、
 * 软件包（/settings/packages）、GitHub 页面（/settings/pages）、已保存回复（/settings/replies）、
 * GitHub 模型（/settings/models）。产品名按用户要求译成中文（GitHub Pages → GitHub 页面、Models → 模型）。
 */
export default {
  static: {
    // 存储库默认分支
    'Repository default branch': '存储库默认分支',
    'Choose the default branch for your new personal repositories. You might want to change the default name due to different workflows, or because your integrations still require “master” as the default branch name. You can always change the default branch name on individual repositories.':
      '为你新建的个人存储库选择默认分支。你可能因工作流不同，或因集成仍要求以“master”作为默认分支名而需要更改默认名称。你随时可以在各个存储库中更改默认分支名。',
    'Choose the default branch for your new personal repositories. You might want to change the default name due to different workflows, or because your integrations still require "master" as the default branch name. You can always change the default branch name on individual repositories.':
      '为你新建的个人存储库选择默认分支。你可能因工作流不同，或因集成仍要求以“master”作为默认分支名而需要更改默认名称。你随时可以在各个存储库中更改默认分支名。',
    'Learn more about default branches.': '了解默认分支。',
    'Learn more about default branches': '了解默认分支',
    'Default branch name': '默认分支名',
    'You don’t have any repositories yet. Would you like to': '你还没有任何存储库。是否',
    "You don't have any repositories yet. Would you like to": '你还没有任何存储库。是否',

    // 提交评论默认设置
    'Choose whether commit comments are enabled or disabled by default for repositories you own. Individual repositories can override this default.':
      '选择你拥有的存储库默认启用还是禁用提交评论。各存储库可以覆盖此默认设置。',
    'Choose whether commit comments are enabled or disabled by default for repositories you own. Individual repositories can override this default. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '选择你拥有的存储库默认启用还是禁用提交评论。各存储库可以覆盖此默认设置。现有提交评论不受此设置影响且仍可查看、编辑和删除。',
    'are enabled or disabled by default for repositories you own. Individual repositories can override this default.':
      '在你拥有的存储库中默认启用还是禁用。各存储库可以覆盖此默认设置。',
    'are enabled or disabled by default for repositories you own. Individual repositories can override this default. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '在你拥有的存储库中默认启用还是禁用。各存储库可以覆盖此默认设置。现有提交评论不受此设置影响且仍可查看、编辑和删除。',
    'are enabled or disabled by default for repositories you own.': '在你拥有的存储库中默认启用还是禁用。',
    'Individual repositories can override this default.': '各存储库可以覆盖此默认设置。',
    'Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '现有提交评论不受此设置影响且仍可查看、编辑和删除。',
    'Commit comments:': '提交评论：',
    'Enabled by default': '默认启用',
    'Disabled by default': '默认禁用',

    // 已删除的存储库
    'It may take up to an hour for repositories to be displayed here. You can only restore repositories that are not forks, or have not been forked.':
      '存储库最多可能需要一小时才会显示在这里。只能恢复不是复刻且未被复刻的存储库。',
    'Learn more about restoring deleted repositories': '了解如何恢复已删除的存储库',
    'Learn more about restoring deleted repositories.': '了解如何恢复已删除的存储库。',
    "These repositories were deleted, but can't be restored by you. Contact support if you want to restore them.":
      '这些存储库已被删除，但你无法恢复。如需恢复请联系支持。',
    'These repositories were deleted, but can’t be restored by you. Contact support if you want to restore them.':
      '这些存储库已被删除，但你无法恢复。如需恢复请联系支持。',
    'This repository will be in a private state when it is restored. To change this state, go to settings once the repo is restored.':
      '此存储库恢复后将处于专用状态。如需更改，请在存储库恢复后转到设置。',
    'This repository will be in a public state when it is restored. To change this state, go to settings once the repo is restored.':
      '此存储库恢复后将处于公共状态。如需更改，请在存储库恢复后转到设置。',
    'Any team or collaborator permissions that previously existed for this repository will not be restored. If you require specific team or collaborator permissions, you will need to configure them in settings.':
      '此存储库原有的团队或协作者权限不会恢复。如需特定的团队或协作者权限，必须在设置中重新配置。',
    'I understand, restore this repository': '我已了解，恢复此存储库',
    'Restore repository': '恢复存储库',
    'Queue…': '排队中…',
    'Queue...': '排队中...',

    // 软件包
    'Packages permissions': '软件包权限',
    'Default Package Setting': '默认软件包设置',
    'This setting will be applied to new Container, npm, rubygems and NuGet packages.':
      '此设置将应用于新的容器、npm、rubygems 和 NuGet 软件包。',
    'Inherit access from source repository': '从源存储库继承访问权限',
    'Deleted Packages': '已删除的软件包',
    'These are packages that have been previously deleted belonging to you. You can restore a package deleted within the last 30 days.':
      '以下是你之前删除的软件包。你可以恢复最近 30 天内删除的软件包。',
    'Search deleted packages': '搜索已删除的软件包',

    // GitHub 页面：已验证的域
    'Verified domains': '已验证的域',
    'Add a domain': '添加域',
    'There are no verified domains.': '暂无已验证的域。',
    'Verify domains to restrict who can publish GitHub Pages on them.': '验证域以限制谁可以在这些域上发布 GitHub 页面。',
    'One of your domains is unverified. Please verify it to prevent others from claiming it for their Pages sites.':
      '你的某个域尚未验证。请验证该域以防他人将其用于自己的页面站点。',
    'Please verify your domain': '请验证你的域',
    'Continue verifying': '继续验证',
    'Review verification steps': '查看验证步骤',
    'Delete verified domain': '删除已验证的域',
    'This is a destructive action. Your GitHub Pages sites may lose their custom domains.':
      '这是破坏性操作。你的 GitHub 页面站点可能会失去自定义域。',
    'Your GitHub Pages sites may be unpublished from their custom domains if another organization claims ownership of this domain.':
      '你的 GitHub 页面站点可能会在其他组织声明拥有此域时从自定义域上取消发布。',
    'I understand, delete verified domain': '我已了解，删除已验证的域',
    'Add a verified domain': '添加已验证的域',
    'Add a Pages verified domain': '添加页面的已验证域',
    'What domain would you like to add?': '要添加哪个域？',
    'Add domain': '添加域',
    'Domain name has already been added': '该域已添加',
    'Add a DNS TXT record': '添加 DNS TXT 记录',
    'Before we can verify': '在验证',
    ", you'll need to complete these steps:": '之前，你需要完成以下步骤：',
    ', you’ll need to complete these steps:': '之前，你需要完成以下步骤：',
    'Create a TXT record in your DNS configuration for the following hostname:': '在 DNS 配置中为以下主机名创建 TXT 记录：',
    'Use this code for the value of the TXT record:': '使用以下代码作为 TXT 记录的值：',
    'Wait until your DNS configuration changes. This could take up to 24 hours to propagate.':
      '等待 DNS 配置生效。传播最长可能需要 24 小时。',
    'Copy verification steps': '复制验证步骤',
    'Your domain is verified. No further action is needed.': '你的域已验证。无需其他操作。',
    'Learn more about verifying custom domains for GitHub Pages.': '了解如何验证 GitHub 页面的自定义域。',
    'Learn more about verifying custom domains for GitHub Pages': '了解如何验证 GitHub 页面的自定义域',

    // 已保存回复
    'Saved replies are re-usable text snippets that you can use throughout GitHub comment fields. Saved replies can save you time if you’re often typing similar responses.':
      '已保存回复是可在 GitHub 各处评论框中重复使用的文本片段。已保存回复能在你经常输入相似回复时帮你节省时间。',
    "Saved replies are re-usable text snippets that you can use throughout GitHub comment fields. Saved replies can save you time if you're often typing similar responses.":
      '已保存回复是可在 GitHub 各处评论框中重复使用的文本片段。已保存回复能在你经常输入相似回复时帮你节省时间。',
    'Learn more about working with saved replies': '了解如何使用已保存回复',
    'Learn more about working with saved replies.': '了解如何使用已保存回复。',
    'No saved replies yet.': '还没有已保存回复。',
    'Add a saved reply': '添加已保存回复',
    'Saved reply title': '已保存回复标题',
    'Add a short title to your reply': '为回复添加简短标题',
    'Add your saved reply': '输入要保存的回复',
    'Add saved reply': '添加已保存回复',
    'Your saved reply was created successfully.': '已保存回复创建成功。',
    'There was an error creating your SavedReply.': '创建已保存回复时出错。',
    'Edit saved reply': '编辑已保存回复',
    'Update saved reply': '更新已保存回复',
    'Your saved reply was updated successfully.': '已保存回复更新成功。',
    'Your saved reply was deleted successfully.': '已保存回复删除成功。',
    'Are you sure you want to delete this saved reply?': '确定要删除此已保存回复吗？',

    // GitHub 模型
    'Models paid usage': '模型付费使用',
    'If enabled, usage beyond the free tier will be billed per token based on model pricing from your Models budget.':
      '启用后，超出免费额度的使用量将根据模型定价按令牌从你的模型预算中计费。',
    'Models pricing': '模型定价',
    'To enable Models paid usage, a payment method is needed.': '启用模型付费使用需要先添加付款方式。',
    '. Enable paid usage to avoid interruption and add tokens.': '。启用付费使用可避免中断并增加令牌额度。'
  },
  scoped: {
    // 标签页标题（原文如此）
    Repositorys: '存储库',
    // 被链接隔开的句尾：「… on the <a>owner/repo</a> repository」
    repository: '存储库',
    'loading...': '加载中...',
    'loading…': '加载中…',
    // 「You don’t have any repositories yet. Would you like to <a>create one</a>?」
    'create one': '创建一个',
    'Deleted repositories': '已删除的存储库',
    'Deleted Repositories': '已删除的存储库',
    Deleted: '删除于',
    by: '由',
    Restore: '恢复',
    'Done!': '完成！',
    // 「Choose whether <strong>commit comments</strong> are enabled …」
    'Choose whether': '选择',
    'Commit comments': '提交评论',
    'commit comments': '提交评论',
    'Default package settings': '默认软件包设置',
    'Deleted packages': '已删除的软件包',
    'Please type': '请输入',
    'to confirm.': '以确认。',
    'Add payment method': '添加付款方式',
    // 「You currently have <strong>free rate limits</strong>. Enable paid usage …」
    'You currently have': '你当前使用的是',
    'free rate limits': '免费速率限制'
  },
  regexp: [
    [/^(\d+) collaborators?$/, '$1 个协作者'],
    // 页面：删除已验证域后的提示
    [/^Verified domain ([\w.-]+) was deleted\.?$/, '已删除已验证的域 $1'],
    [/^No recoverable repositories were found for (\S+)\.$/, '未找到 $1 可恢复的存储库。'],
    [/^Are you sure you want to restore (\S+)\?$/, '确定要恢复 $1 吗？'],
    // 已删除的存储库「Deleted <relative-time> by <login>」：整句见 inline，不命中时与 Deleted、by 按片段拼读
    [/^by ([\w-]+)$/, '由 $1'],
    [/^No recoverable packages were found for (\S+)\.$/, '未找到 $1 可恢复的软件包。'],
    [/^Successfully verified ([\w.-]+?)(\.?)$/, (_, domain: string, dot: string) => `已成功验证 ${domain}${dot ? '。' : ''}`]
  ],
  ignore: [
    // 已保存回复列表：回复标题与正文摘要是用户内容（行内带 /settings/replies/<id>/edit 编辑链接）
    '.Box-row:has(a[href*="/settings/replies/"][href$="/edit"]) :is(strong, .css-truncate, .css-truncate-target)'
  ],
  // 已删除的存储库：「Deleted <relative-time> by <login>」调整语序，时间槽位后不留空格，
  // 拼读为“已于 3 天前由 octocat 删除”；不可还原的条目只有「Deleted <relative-time>」，不命中，按片段拼读
  inline: [[/^Deleted \{\} by ([\w-]+)$/, '已于 {}由 $1 删除']]
} satisfies PageDictionary
