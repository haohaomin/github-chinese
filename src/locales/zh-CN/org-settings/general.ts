import type { PageDictionary } from '../../../core/types'

const ORG = '([\\w.-]+)'

/**
 * 组织设置「常规」页：组织个人资料表单、产品内消息、服务条款、Patreon、开发人员计划、
 * 危险区域（重命名、存档、取消存档、删除）及确认对话框。
 * 个人设置已收录为 static 的同名词条（Profile picture、Update profile、Upload a photo…、
 * Link to social profile、开发人员计划标题与按钮等）不再重复。
 * 重命名警告片段、Patreon 片段与开发人员计划说明为个人设置共用，放 static。
 */
export default {
  static: {
    // 组织个人资料
    'Organization display name': '组织显示名称',
    'Email (will be public)': '电子邮件（将公开）',
    '(will be public)': '（将公开）',
    'Billing email': '计费电子邮件',
    'Add more billing email recipients in the': '如需添加更多计费电子邮件收件人请前往',
    'billing page': '计费页面',
    'Gravatar email': 'Gravatar 电子邮件',
    // 赞助语境的 updates → 动态（与赞助词典“电子邮件动态”一致）
    'Sponsors update email': '赞助动态电子邮件',
    'The developers and organizations that your organization sponsors can send you updates to this email.':
      '你的组织赞助的开发者和组织可以向此电子邮件地址发送动态。',
    "Note: To apply for a publisher verification your organization's profile picture should not be irrelevant, abusive or vulgar. It should not be a default image provided by GitHub.":
      '注意：要申请发布者验证，组织个人资料图片不得无关、侮辱或低俗。图片也不能是 GitHub 提供的默认图像。',
    'Note: To apply for a publisher verification your organization’s profile picture should not be irrelevant, abusive or vulgar. It should not be a default image provided by GitHub.':
      '注意：要申请发布者验证，组织个人资料图片不得无关、侮辱或低俗。图片也不能是 GitHub 提供的默认图像。',

    // 产品内消息
    'In-product messages': '产品内消息',
    'Notify account admins about exclusive GitHub products, services, offers, and events.':
      '向帐户管理员通知 GitHub 独家产品、服务、优惠和活动。',
    'Allow members in your organization to request access to products, budget, or features.': '允许组织成员申请使用产品、预算或功能。',
    'Show your organization members tips about enabled products and features.': '向组织成员显示已启用产品和功能的提示。',
    'Customer Research': '客户调研',
    'Allow GitHub to contact members in your organization for research and feedback surveys.':
      '允许 GitHub 联系组织成员参与调研和反馈问卷。',
    'Product guidance and recommendations': '产品指南和推荐',
    "Your enterprise has disabled these emails. This organization's preference cannot enable them.":
      '你的企业已禁用这些电子邮件。此组织的首选项无法启用。',
    'Your enterprise has disabled these emails. This organization’s preference cannot enable them.':
      '你的企业已禁用这些电子邮件。此组织的首选项无法启用。',

    // 服务条款
    'Best for individuals wanting the freedom to move data and remain independent of a corporation.':
      '适合希望自由迁移数据、不依附于企业的个人。',
    'Read the Standard Terms of Service': '阅读标准服务条款',
    'Best for businesses that need to protect their intellectual property and secure visibility into their data.':
      '适合需要保护知识产权并掌握数据可见性的企业。',
    'Read the GitHub customer agreement': '阅读 GitHub 客户协议',
    'Read the GitHub Customer Agreement': '阅读 GitHub 客户协议',
    'Sign GitHub customer terms': '签署 GitHub 客户条款',
    'Yes, I want to sign these terms on behalf of my business.': '是，我要代表我的公司签署这些条款。',
    'Accept terms': '接受条款',

    // Patreon（个人设置共用片段）：connect → 连接，link → 链接
    'Connect a Patreon account for': '为',
    'to sponsor maintainers with. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile.':
      '连接 Patreon 帐户以赞助维护者。如果被赞助者也链接了 Patreon 和 GitHub，并且拥有公开的 GitHub 赞助个人资料，你在 Patreon 上的赞助也会在 GitHub 上得到认可。',

    // 开发人员计划（个人设置共用）：「Check out the Developer site」+「for guides, …」，片段间原文无逗号，译文不加
    'for guides, our API reference, and other resources for building applications that integrate with GitHub. Make sure your contact information is up-to-date below. Thanks for being a member!':
      '以获取指南、API 参考以及构建 GitHub 集成应用的其他资源。请确保下方联系信息是最新的。感谢你的加入！',
    'Thanks for updating your Developer Program contact information!': '感谢你更新开发人员计划联系信息！',

    // 危险区域：重命名（个人设置共用片段）
    'Rename organization': '重命名组织',
    'Renaming your organization can have': '重命名组织可能会产生',
    'unintended side effects': '意外的副作用',
    'This organization cannot be renamed because it is archived.': '此组织已存档，无法重命名。',
    'Really rename your organization?': '确定要重命名组织吗？',
    // 原文无逗号，译文不加；与 projects/settings.ts 同句一致
    'Unexpected bad things will happen if you don’t read this!': '不读完以下内容可能会造成意想不到的后果！',
    "Unexpected bad things will happen if you don't read this!": '不读完以下内容可能会造成意想不到的后果！',
    'set up redirects for your old profile page.': '为旧的个人资料页面设置重定向。',
    'set up redirects for Pages sites.': '为页面站点设置重定向。',
    'create redirects for your repositories (web and git access).': '为你的存储库创建重定向（网页和 Git 访问）。',
    'You will need to update your local repositories to point to the new location.': '你需要更新本地存储库，使其指向新位置。',
    'Renaming may take a few minutes to complete.': '重命名可能需要几分钟才能完成。',
    'I understand, let’s rename my organization': '我已了解，重命名组织',
    "I understand, let's rename my organization": '我已了解，重命名组织',
    'Rename your organization': '重命名组织',
    'Change organization’s name': '更改组织名称',
    "Change organization's name": '更改组织名称',
    'Organization name may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen':
      '组织名称只能包含字母、数字或单个连字符，且不能以连字符开头或结尾',
    'Organization name is not available': '组织名称不可用',

    // 危险区域：存档
    'Archive this organization': '存档此组织',
    'Mark this organization and all its repositories as archived and read-only.': '将此组织及其所有存储库标记为已存档并设为只读。',
    'Archive organization': '存档组织',
    'Archive the organization': '存档组织',
    'This organization will be archived.': '此组织将被存档。',
    'Modifying settings will be limited and creating new repositories will be blocked.': '修改设置将受到限制，且无法创建新存储库。',
    'All repositories will be': '所有存储库都将',
    'and be read-only.': '并设为只读。',
    'Before you archive, please consider:': '存档前，请考虑：',
    'Updating any organization settings': '更新组织设置',
    'Making a note in your': '添加说明至',
    'organization README': '组织自述文件',
    'I understand the consequences, archive this organization': '我了解后果，存档此组织',
    'Unarchive this organization': '取消存档此组织',
    'Mark this organization as unarchived and read-write.': '将此组织标记为未存档并恢复读写。',
    'Unarchive organization': '取消存档组织',
    'Unarchive the organization': '取消存档组织',
    'This organization will be unarchived.': '此组织将取消存档。',
    'Modifying settings will be possible and creating new repositories will be unblocked.': '将可以修改设置，并可以创建新存储库。',
    // 「Repositories will remain」+ <strong>archived</strong> +「and need to be unarchived separately.」：原文无逗号，译文不加
    'Repositories will be remain': '存储库将保持',
    'Repositories will remain': '存储库将保持',
    'and need to be unarchived separately.': '状态并需要分别取消存档。',
    'I understand the consequences, unarchive this organization': '我了解后果，取消存档此组织',
    'Most organization settings are hidden for an archived organization. This organization must be unarchived to change them.':
      '已存档组织的大多数设置已隐藏。须先取消存档此组织才能更改这些设置。',
    'This organization has been archived.': '此组织已存档。',
    'This organization has been archived and is read-only.': '此组织已存档，处于只读状态。',

    // 危险区域：删除
    'Delete this organization': '删除此组织',
    'Once deleted, it will be gone forever. Please be certain.': '删除后将无法恢复。请谨慎操作。',
    'Are you sure you want to delete this?': '确定要删除吗？',
    'Deleting the': '删除',
    'organization will delete all of its repositories. The': '组织将删除其所有存储库。同时',
    'username will be unavailable for 90 days.': '用户名将在 90 天内不可用。',
    'Before proceeding, please be sure to review the': '继续之前，请务必查看',
    'regarding account deletion.': '中关于删除帐户的内容。',
    'Enter this organization’s name to confirm': '输入此组织的名称以确认',
    "Enter this organization's name to confirm": '输入此组织的名称以确认',
    'Cancel plan and delete the organization': '取消计划并删除组织',
    'Delete organization': '删除组织'
  },
  scoped: {
    // 与个人设置共用的表单词（「Upload new picture」「Danger zone」团队设置页也用，由 teams 收录为 static）
    Email: '电子邮件',
    Location: '所在地',
    'Select a location': '选择所在地',
    'Find a location...': '查找所在地...',
    'Find a location…': '查找所在地…',
    'Clear Location': '清除所在地',
    'Social accounts': '社交帐户',
    // 「Billing email」+「(Private)」；整段在同一文本节点时另收。非可见性义 private → 私密（与“私密电子邮件”一致）
    '(Private)': '（私密）',
    'Billing email (Private)': '计费电子邮件（私密）',
    'Gravatar email (Private)': 'Gravatar 电子邮件（私密）',
    'Sponsors update email (Private)': '赞助动态电子邮件（私密）',
    // 原文无逗号，与「Add more billing email recipients in the」+「billing page」+「.」拼读结果一致
    'Add more billing email recipients in the billing page.': '如需添加更多计费电子邮件收件人请前往计费页面。',
    'Patreon account': 'Patreon 帐户',
    'Disconnect Patreon': '断开 Patreon 连接',
    'Danger Zone': '危险区域',
    // 重命名
    'Renaming your organization can have unintended side effects.': '重命名组织可能会产生意外的副作用。',
    'set up redirects for your Pages sites.': '为你的页面站点设置重定向。',
    'New organization name': '新组织名称',
    'Enter a new name': '输入新名称',
    'Organization was successfully renamed.': '组织已重命名。',
    'Your organization has been renamed.': '你的组织已重命名。',
    'Your organization is being renamed.': '正在重命名你的组织。',
    // 删除受阻
    'This organization cannot be deleted because it has an active sponsorship.': '此组织有进行中的赞助，无法删除。',
    'Your organization is currently sponsoring': '你的组织当前正在赞助',
    'Cancel your sponsorships before deleting this organization.': '删除此组织前，请先取消赞助。',
    'This organization is part of an enterprise account': '此组织隶属于企业帐户',
    'Remove organization from enterprise': '从企业中移除组织',
    Promotions: '推广',
    'Member requests': '成员请求',
    Tips: '提示',
    Emails: '电子邮件',
    'Unable to update': '无法更新',
    // 全站 static 为个人资料译法，组织设置页另收
    'Profile updated successfully': '组织个人资料已更新',
    Standard: '标准',
    Corporate: '公司',
    // 重命名警告句首的「We」由 inline 整句译出，不单收（与计费日期选择器的星期表头同形）
    archived: '存档',
    'Please provide': '请就此功能提供',
    feedback: '反馈',
    'on this feature.': '。',
    'Please type': '请输入',
    'to confirm.': '以确认。'
  },
  regexp: [
    [/^Link to social profile (\d+)$/, '社交帐户链接 $1'],
    [new RegExp(`^Your organization ${ORG} is being archived\\.$`), '正在存档组织 $1。'],
    [new RegExp(`^Your organization ${ORG} has been unarchived\\.$`), '组织 $1 已取消存档。'],
    [new RegExp(`^Please type ${ORG} to confirm\\.$`), '请输入 $1 以确认。'],
    [new RegExp(`^To confirm, type "${ORG}" in the box below$`), '要确认，请在下方输入框中输入“$1”'],
    [
      new RegExp(
        `^Deleting the ${ORG} organization will delete all of its repositories\\. The ${ORG} username will be unavailable for 90 days\\.$`
      ),
      '删除 $1 组织将删除其所有存储库。$2 用户名将在 90 天内不可用。'
    ],
    [
      new RegExp(
        `^Connect a Patreon account for ${ORG} to sponsor maintainers with\\. Get recognition on GitHub for sponsorships made on Patreon when the sponsored person has linked Patreon and GitHub, too, and has a public GitHub Sponsors profile\\.$`
      ),
      '为 $1 连接 Patreon 帐户以赞助维护者。如果被赞助者也链接了 Patreon 和 GitHub，并且拥有公开的 GitHub 赞助个人资料，你在 Patreon 上的赞助也会在 GitHub 上得到认可。'
    ]
  ],
  // 重命名警告：「We」+ <strong>will</strong> / <strong>will not</strong> + 后半句，槽位里的 will / will not
  // 由 billing.ts 的 static 译成“将 / 不会”，拼读为“我们不会为旧的个人资料页面设置重定向。”
  inline: [
    ['We {} create redirects for your repositories (web and git access).', '我们{}为你的存储库创建重定向（网页和 Git 访问）。'],
    ['We {} set up redirects for your old profile page.', '我们{}为旧的个人资料页面设置重定向。'],
    ['We {} set up redirects for Pages sites.', '我们{}为页面站点设置重定向。'],
    ['We {} set up redirects for your Pages sites.', '我们{}为你的页面站点设置重定向。']
  ]
} satisfies PageDictionary
