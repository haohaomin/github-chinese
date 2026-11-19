import type { PageDictionary } from '../../../core/types'

/**
 * 项目（新版 Projects）：项目设置与项目菜单。
 * 项目菜单（顶栏）、常规设置（名称、描述、自述文件、可见性、模板、危险区域）、删除项目对话框、
 * 访问权限与协作者、默认存储库、项目详细信息面板、经典项目迁移提示。
 */

/** 协作者显示名（不含捕获组）：用户登录名，或团队“@slug • 4 members” */
const COLLABORATOR_SOURCE = '[\\w.-]+|@[\\w.-]+ • \\d+ members?'

/**
 * Select / Unselect 后不按协作者处理的词（不含捕获组）：all、none，
 * 以及侧边面板议题元数据等选择器的名词（Select labels、Select assignees…），避免译成“选择 labels”
 */
const NOT_COLLABORATOR =
  '(?!(?:all|none|projects?|branch(?:es)?|assignees?|milestones?|issues?|options?|labels?|repositor(?:y|ies)|languages?|status|columns?|views?|types?|fields?|users?|teams?|reviewers?)$)'

/** 团队显示名中的成员数：@design • 4 members → @design • 4 个成员 */
function collaboratorName(name: string): string {
  return name.replace(/ • (\d+) members?$/, ' • $1 个成员')
}

export default {
  static: {
    // 项目菜单
    'Project details': '项目详细信息',
    'Edit project name': '编辑项目名称',
    'Update project title': '更新项目标题',
    'Use this template': '使用此模板',

    // 常规设置
    'Project settings': '项目设置',
    'Project settings menu': '项目设置菜单',
    'Project name': '项目名称',
    'Project name is required.': '项目名称为必填项。',
    'Project settings saved successfully': '项目设置已保存',
    'A short description about this project.': '此项目的简短描述。',
    'Let everyone know what this project is about, how to use it and link to important resources.':
      '介绍此项目的内容和用法，并链接重要资源。',
    'Edit short description': '编辑简短描述',
    'You choose who can read, write, and admin this project.': '由你决定谁可以读取、写入和管理此项目。',
    // read / write access → 读取 / 写入访问权限（GLOSSARY permission 行）
    'Everyone on the internet has read access to this project. You choose who has write and admin access.':
      '互联网上的所有人都拥有此项目的读取访问权限。由你决定谁拥有写入和管理访问权限。',
    'Everyone in your enterprise has read access to this project. You choose who has write and admin access.':
      '企业中的所有人都拥有此项目的读取访问权限。由你决定谁拥有写入和管理访问权限。',
    'has read access to this project. You choose who has write and admin access.':
      '拥有此项目的读取访问权限。由你决定谁拥有写入和管理访问权限。',
    'Only organization owners can change project visibility.': '只有组织所有者可以更改项目可见性。',
    'Only admins can change project visibility.': '只有管理员可以更改项目可见性。',
    'This project is currently public.': '此项目当前为公共项目。',
    'This project is currently private.': '此项目当前为专用项目。',
    'This project is currently internal to your enterprise.': '此项目当前为企业内部可见。',
    'This project was created with the': '此项目基于',
    'Make template': '设为模板',
    'Make this project a template that can be used by members of the': '将此项目设为模板供',
    'organization when creating new projects.': '组织成员创建新项目时使用。',
    'Remove this project as a template? It will no longer be available as a template when creating new projects.':
      '将此项目从模板中删除？创建新项目时将不再能使用它作为模板。',
    'Copy as template': '复制为模板',
    'Copy this project into a template that can be used when creating new projects.': '将此项目复制为可在创建新项目时使用的模板。',
    'Make a copy of this project.': '创建此项目的副本。',
    'Re-open project': '重新打开项目',
    'Re-opening a project will add it to the list of open projects.': '重新打开项目会将其添加到打开的项目列表中。',
    'Re-open this project': '重新打开此项目',
    'Close project': '关闭项目',
    'Closing a project will disable its workflows & remove it from the list of open projects.':
      '关闭项目会禁用其工作流并将其从打开的项目列表中移除。',
    'Close this project': '关闭此项目',
    'Delete project': '删除项目',
    'Once you delete a project, there is no going back. Please be certain.': '项目删除后无法恢复。请谨慎操作。',
    'Delete this project': '删除此项目',
    'Resync search index for this project': '重新同步此项目的搜索索引',
    'This will asynchronously correct inconsistencies between the search index and the database': '将异步修正搜索索引与数据库之间的不一致',
    'Resync search index': '重新同步搜索索引',

    // 删除项目对话框：整句由下方 inline 规则译出，不构成行内句时按以下片段翻译
    'Delete project warning': '删除项目警告',
    'I understand the consequences, delete this project': '我了解后果，删除此项目',
    'project, saved views, custom fields and associated values, and Insights data.': '项目及其保存的视图、自定义字段及相关值和洞察数据。',
    'This will not delete issues or pull requests themselves.': '议题和拉取请求本身不会被删除。',

    // 访问权限
    'Everyone in the organization can see and edit this project.': '组织中的所有人都可以查看和编辑此项目。',
    'Everyone in the organization can see this project.': '组织中的所有人都可以查看此项目。',
    'are admins of this project.': '是此项目的管理员。',
    'can see this project. Owners are also admins of this project.': '可以查看此项目。所有者也是此项目的管理员。',
    'Everyone in the organization is an admin of this project.': '组织中的所有人都是此项目的管理员。',
    'Public project': '公共项目',
    'Private project': '专用项目',
    'Internal project': '内部项目',
    'This project is public and visible to anyone.': '此项目是公共项目且对所有人可见。',
    'Only those with access to this project can view it.': '只有拥有访问权限的人可以查看此项目。',
    'Everyone in the organization can view this project.': '组织中的所有人都可以查看此项目。',
    'Can see, make changes to, and add new collaborators to this project.': '可以查看、修改此项目，并添加新协作者。',
    'Can see and make changes to this project.': '可以查看和修改此项目。',
    'Can see this project.': '可以查看此项目。',
    'Organization members will only be able to see this project if it’s public. To give an organization member additional access, they can be added as part of a team or as a collaborator.':
      '项目为公共项目时组织成员才能查看。要授予组织成员更多权限，可将其加入团队或添加为协作者。',

    // 默认存储库
    'By default, new issues created from this project are added to this repository.': '从此项目新建的议题默认添加到此存储库。',

    // 经典项目迁移
    'Setting up the project…': '正在设置项目…',
    'Creating project columns…': '正在创建项目列…',
    'Creating an initial view…': '正在创建初始视图…',
    'Migrating issues, pull requests, and drafts…': '正在迁移议题、拉取请求和草稿…',
    'Your project could not be migrated.': '项目无法迁移。',
    'Your classic project': '你的经典项目',
    'Users visiting the classic project will be linked to this one.': '访问经典项目的用户会被引导到此项目。',
    '• Users visiting the classic project will be linked to this one.': '• 访问经典项目的用户会被引导到此项目。',
    'This project has been migrated as part of the sunset for Projects (classic).': '此项目已随项目（经典）停用而迁移。',
    'This project is being migrated as part of the sunset for Projects (classic).': '此项目正随项目（经典）停用进行迁移。'
  },
  scoped: {
    // 通用文本（仅项目页生效）
    'What’s new': '新功能',
    'Short description': '简短描述',
    'An error occurred while saving.': '保存时出错。',
    'Edit README': '编辑自述文件',
    'You have unsaved changes. Are you sure you want leave this page and discard them?': '有未保存的更改。确定要离开此页面并放弃更改吗？',
    'Unexpected bad things will happen if you don’t read this!': '不读完以下内容可能会造成意想不到的后果！',
    'Are you absolutely sure?': '你确定吗？',
    'be undone. This will permanently delete the': '撤销。这将永久删除',
    // 删除项目对话框草稿议题句（整句见下方 inline）的片段：前段带出“在此项目中创建的”，末段只剩句号，
    // 不构成行内句时同样拼成“这还将删除在此项目中创建的 3 个草稿议题。”
    'This will also delete': '这还将删除在此项目中创建的',
    'that were created in this project.': '。',
    'that was created in this project.': '。',
    'Who has access': '谁有访问权限',
    'Base role': '基本角色',
    'Only those with direct access and': '只有拥有直接访问权限的人和',
    'Search by username or team': '按用户名或团队搜索',
    'Find a collaborator': '查找协作者',
    'Find a collaborator or a team': '查找协作者或团队',
    'Add collaborators': '添加协作者',
    'Invite collaborators': '邀请协作者',
    '· Already a collaborator': '· 已是协作者',
    'Unable to add some users': '部分用户无法添加',
    'Failed to update collaborators': '协作者更新失败',
    'Remove collaborator': '删除协作者',
    'Select all collaborators.': '全选协作者。',
    'Remove yourself as admin?': '将自己从管理员中删除？',
    'Are you sure you want to remove yourself as Admin? You will lose access to Settings': '确定要将自己从管理员中删除吗？你将无法访问设置',
    'Failed to remove collaborators': '协作者删除失败',
    'Loading collaborators...': '正在加载协作者...',
    'Add a collaborator to see them here.': '添加的协作者会显示在这里。',
    'Try to change or remove some filters to see results.': '更改或删除部分筛选器以查看结果。',
    "You don't have any collaborators yet.": '暂无协作者。',
    'No collaborators found.': '未找到协作者。',
    'Default repository': '默认存储库',
    'No repositories are available for selection.': '没有可选的存储库。',
    'No repositories match this search': '没有与搜索匹配的存储库',
    'Try a different search term or browse your repositories.': '换个搜索词或浏览你的存储库。',
    'Starting migration…': '正在开始迁移…',
    'Migrating permissions…': '正在迁移权限…',
    'Migrating workflows…': '正在迁移工作流…',
    'has been closed and is read-only.': '已关闭且为只读。',
    "is still open, but future changes won't be synchronized.": '仍处于打开状态，但之后的更改不会同步。',
    'Migration complete': '迁移完成',
    // 项目菜单
    Project: '项目',
    // 项目菜单的分组标题：产品名按 product-names.md 译出（GitHub Projects → GitHub 项目）
    'GitHub Projects': 'GitHub 项目',
    template: '模板',
    'template.': '模板创建。',
    'Make a copy': '创建副本',
    // 常规设置
    Visibility: '可见性',
    Internal: '内部',
    'on the internet': '互联网上',
    'in your enterprise': '企业中',
    'Danger zone': '危险区域',
    // 删除项目对话框
    'This action': '此操作',
    cannot: '无法',
    'Please type': '请输入',
    'to confirm.': '以确认。',
    // 访问权限
    'Manage access': '管理访问权限',
    Manage: '管理',
    owners: '所有者',
    Role: '角色',
    'Role:': '角色：',
    Mixed: '混合',
    Read: '读取',
    // Write 角色由 common-ui 的全局词条译为“写入”（与评论框标签页同译），不收 scoped 副本
    Admin: '管理员',
    'no access': '无权限',
    'No access': '无权限',
    Invite: '邀请',
    'Search by username': '按用户名搜索',
    'Please try again later.': '请稍后重试。',
    'An error has occurred.': '出错了。',
    'Something went wrong.': '出错了。',
    'Something went wrong': '出错了',
    'An error occurred': '出错了',
    // 默认存储库
    'Filter repositories': '筛选存储库',
    'No repositories available': '没有可用的存储库',
    // 经典项目迁移
    'Try again': '重试'
  },
  regexp: [
    [/^Workflows \((\d+) enabled\)$/, '工作流（已启用 $1 个）'],
    [/^(\d+) draft issues?$/, '$1 个草稿议题'],
    [/^(\d+) users? successfully added$/, '已成功添加 $1 个用户'],
    [/^Remove collaborator (.+)$/, (_, name: string) => `删除协作者 ${collaboratorName(name)}`],
    [new RegExp(`^Unselect ${NOT_COLLABORATOR}(${COLLABORATOR_SOURCE})$`), (_, name: string) => `取消选择 ${collaboratorName(name)}`],
    [new RegExp(`^Select ${NOT_COLLABORATOR}(${COLLABORATOR_SOURCE})$`), (_, name: string) => `选择 ${collaboratorName(name)}`],
    [/^(\d+) selected$/, '已选择 $1 个'],
    [/^(\d+) members?, (\d+) teams?$/, '$1 个成员，$2 个团队'],
    [/^(\d+) members?$/, '$1 个成员'],
    [/^(\d+) teams?$/, '$1 个团队'],
    [/^@(.+) • (\d+) members?$/, '@$1 • $2 个成员'],
    [/^(\d+) collaborators? found\.$/, '找到 $1 个协作者。'],
    [/^Migrating (.+)$/, '正在迁移 $1']
  ],
  // 删除项目对话框里的项目名：须照原文输入才能确认，不翻译。默认标题 @user's untitled project 在顶栏、详细信息侧栏、
  // 项目列表同样保持原文（views.ts、list.ts 的 ignore），items.ts 的正则只在标签页标题等未忽略处生效
  ignore: [
    'label[for="confirm-delete-input"] > span',
    '[role="alertdialog"]:has(#confirm-delete-input) p:first-of-type > span:nth-of-type(2)'
  ],
  inline: [
    // 删除项目对话框（delete-project-dialog.tsx）：加粗的 cannot、项目名、草稿议题数都是 <span>
    // <p>This action <span>cannot</span> be undone. This will permanently delete the <span>项目名</span> project, saved views, …</p>
    [
      'This action {} be undone. This will permanently delete the {} project, saved views, custom fields and associated values, and Insights data.',
      '此操作{}撤销。这将永久删除 {} 项目及其保存的视图、自定义字段及相关值和洞察数据。'
    ],
    // <p>This will also delete <span>3 draft issues</span> that were created in this project.</p>
    [/^This will also delete \{\} that (?:were|was) created in this project\.$/, '这还将删除在此项目中创建的 {}。'],
    // <label>Please type <span>项目名</span> to confirm.</label>
    ['Please type {} to confirm.', '请输入 {} 以确认。'],
    // 常规设置的模板区（general-settings-view.tsx）：<p>This project was created with the&nbsp;<a>模板名</a>&nbsp;template.</p>
    ['This project was created with the {} template.', '此项目基于 {} 模板创建。'],
    // <p>Make this project a template that can be used by members of the <b>组织</b> organization when creating new projects.</p>
    [
      'Make this project a template that can be used by members of the {} organization when creating new projects.',
      '将此项目设为模板供 {} 组织成员创建新项目时使用。'
    ],
    // 经典项目迁移完成的说明（project-migration-overlay-description.tsx）：
    // <span>• <a>Your classic project</a> has been closed and is read-only.<br>• Users visiting the classic project will be linked to this one.</span>
    [
      '• {} has been closed and is read-only. {} • Users visiting the classic project will be linked to this one.',
      '• {}已关闭且为只读。{}• 访问经典项目的用户会被引导到此项目。'
    ],
    // <span><a>Your classic project</a> is still open, but future changes won't be synchronized.</span>
    ["{} is still open, but future changes won't be synchronized.", '{}仍处于打开状态，但之后的更改不会同步。'],
    // 访问设置的可见范围说明（privacy-settings.tsx）：<span>Only those with direct access and <a>owners</a>can see this project. …</span>
    // 按片段翻译时链接前的空格会留在两个中文词之间；链接文字 owners 照常翻译
    [
      'Only those with direct access and {} can see this project. Owners are also admins of this project.',
      '只有拥有直接访问权限的人和{}可以查看此项目。所有者也是此项目的管理员。'
    ]
  ]
} satisfies PageDictionary
