import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 项目（新版 Projects）：项目列表。
 * 存储库项目页（React：搜索、排序、开放 / 关闭筛选、项目 / 模板切换、空状态、行菜单、
 * 链接项目对话框、复制项目对话框、规划侧栏；Rails 版：空状态、链接项目、行菜单）
 * 与组织 / 用户项目列表（Rails：介绍区、空状态、搜索）的补充词条。
 * 组织项目列表的主体由 organization 词典收录。
 */

const LIST_NOUNS: Readonly<Record<string, string>> = {
  projects: '项目',
  'project templates': '项目模板',
  templates: '模板'
}

export default {
  static: {
    // 存储库项目页
    'Repository projects': '存储库项目',
    'Search projects': '搜索项目',
    'Sort projects by': '项目排序依据',
    'Filter projects by state': '按状态筛选项目',
    'Loading projects': '正在加载项目',
    'Load more projects': '加载更多项目',
    'More project actions': '更多项目操作',
    'No closed projects': '没有已关闭的项目',
    'No closed project templates': '没有已关闭的项目模板',
    'No open project templates': '没有打开的项目模板',
    'Provide quick access to relevant project templates': '快速访问相关项目模板',
    'No project templates': '没有项目模板',
    'Add project templates from your organization to view them here.': '组织中的项目模板添加后会显示在这里。',
    // Rails 版空状态（前两句原文带句号，与模板版同译）
    'Provide quick access to relevant projects.': '快速访问相关项目。',
    'Add projects to view them here.': '项目添加后会显示在这里。',
    "This repository doesn't have any projects yet": '此存储库还没有任何项目',
    'No projects found': '未找到项目',
    'There are no projects linked to this repository yet.': '此存储库尚未链接项目。',
    'There are no projects linked to this repository.': '此存储库没有链接项目。',
    'Something went wrong loading projects.': '加载项目时出错。',
    'Something went wrong loading projects. Please try again.': '加载项目时出错。请重试。',
    'Remove from recently viewed': '从最近查看中删除',
    'Unlink project': '取消链接项目',

    // 链接项目对话框（Link projects、Link a project to this repository 是 Rails 版的按钮与说明）
    'Link a project': '链接项目',
    'Link a template': '链接模板',
    'Link projects': '链接项目',
    'Link a project from the organization to this repository': '将组织中的项目链接到此存储库',
    'Link a template from the organization to this repository': '将组织中的模板链接到此存储库',
    'Link a project to this repository': '将项目链接到此存储库',
    'Filter projects': '筛选项目',
    'Filter templates': '筛选模板',

    // 组织 / 用户项目列表（Rails）：介绍区、空状态、搜索、模板视图
    'Welcome to Projects': '欢迎使用项目',
    'Welcome to projects': '欢迎使用项目',
    'Built to be flexible and adaptable, Projects gives you a live canvas to filter, sort, and group issues and pull requests in a table, board, or roadmap. Tailor them to your needs with custom fields, saved views, workflows, and insights.':
      '项目灵活且适应性强，为你提供实时画布，可在表格、看板或路线图中筛选、排序和分组议题与拉取请求。可使用自定义字段、已保存的视图、工作流和洞察按需定制。',
    // 较早的介绍文案
    'Built like a spreadsheet, project tables give you a live canvas to filter, sort, and group issues and pull requests. Tailor them to your needs with custom fields and saved views.':
      '项目表格如同电子表格，为你提供实时画布，可对议题和拉取请求进行筛选、排序和分组。还可通过自定义字段和已保存的视图按需定制表格。',
    'Learn more about projects': '了解项目',
    "You don't have any projects yet.": '你还没有任何项目。',
    'There are no projects matching your search.': '没有与搜索匹配的项目。',
    'Clear current search query and sorts': '清除当前搜索查询和排序',
    'New template': '新建模板',

    // 复制项目对话框
    'Copy project': '复制项目',
    'Make a copy of this project that can be used as a starting point for another project.': '创建此项目的副本作为其他项目的起点。',
    'Views, custom fields, insights, and workflows will be copied.': '将复制视图、自定义字段、洞察和工作流。',
    'Issues and pull requests will not be copied.': '不会复制议题和拉取请求。',
    'Draft issues will be copied if selected': '勾选后将复制草稿议题',
    'Owner for the new project': '新项目的所有者',
    'New project name': '新项目名称',
    'Failed to copy project. Please try again.': '项目复制失败。请重试。'
  },
  scoped: {
    // 通用文本（仅项目页生效）；产品名 GitHub Projects 按 product-names.md 译“GitHub 项目”，见 settings.ts 项目菜单
    'Search by name…': '按名称搜索…',
    'Clear search query': '清除搜索词',
    'Suggestions could not be loaded': '无法加载建议',
    'Copying…': '复制中…',
    "Couldn't load owners": '无法加载所有者',
    "Couldn't load owners. Try again later.": '无法加载所有者。请稍后重试。',
    'No owners matched': '没有匹配的所有者',
    'No owners found': '未找到所有者',
    'No owners are available.': '没有可用的所有者。',
    'Select an owner': '选择所有者',
    // 列表通用
    All: '全部',
    Templates: '模板',
    'Project type': '项目类型',
    'Recently updated': '最近更新',
    'Least recently updated': '最久未更新',
    Newest: '最新',
    Oldest: '最早',
    Name: '名称',
    'Recently viewed': '最近查看',
    'Try a different search term or clear the search to see all': '换个搜索词或清除搜索以查看所有',
    // 打开 / 已关闭筛选标签（组织、用户、存储库项目列表）；“Closed”时间戳字段的表头同样显示为“已关闭”
    Open: '打开',
    Closed: '已关闭',
    // 规划侧栏
    'Issues sidebar navigation': '议题侧栏导航',
    'Open Issues sidebar navigation': '打开议题侧栏导航',
    'Issue filters': '议题筛选器',
    'Assigned to me': '分配给我的',
    'Created by me': '我创建的',
    Mentioned: '提及我的',
    'Recent activity': '最近活动',
    // 页面导航（aria-label）及其中的视图、里程碑；Preview 是“反馈”旁的标签
    Pages: '页面',
    Views: '视图',
    Milestones: '里程碑',
    Preview: '预览',
    'Collapse sidebar': '折叠侧栏',
    'Expand sidebar': '展开侧栏',
    // 复制项目对话框
    'Search owners': '搜索所有者',
    Included: '包含',
    'Not included': '不包含',
    Owner: '所有者',
    Required: '必填',
    'Try again later.': '请稍后重试。',
    'Try a different search term.': '换个搜索词。',
    'Something went wrong. Please try again.': '出错了。请重试。',
    // 存储库项目页（Rails 版）：空状态按钮；行菜单的 Remove project 是从存储库取消链接、不删除项目（React 版为 Unlink project）
    'Create a project': '创建项目',
    'Remove project': '移除项目'
  },
  regexp: [
    [/^(All|Templates), Project type$/, (_, type: string) => `${type === 'All' ? '全部' : '模板'}，项目类型`],
    [/^#(\d+) updated$/, '#$1 更新于'],
    [/^(\d[\d,]*) projects?$/, '$1 个项目'],
    [/^(\d[\d,]*) templates?$/, '$1 个模板'],
    [/^No (projects|project templates) matched your search$/, (_, noun: string) => `没有匹配的${LIST_NOUNS[noun] ?? noun}`],
    [
      /^Try a different search term or clear the search to see all (projects|project templates)\.$/,
      (_, noun: string) => `换个搜索词或清除搜索以查看所有${LIST_NOUNS[noun] ?? noun}。`
    ],
    [/^No (projects|templates) matched “(.+)”$/, (_, noun: string, query: string) => `没有与“${query}”匹配的${LIST_NOUNS[noun] ?? noun}`],
    [/^No (projects|templates) matched$/, (_, noun: string) => `没有匹配的${LIST_NOUNS[noun] ?? noun}`],
    [/^No (projects|templates) found$/, (_, noun: string) => `未找到${LIST_NOUNS[noun] ?? noun}`],
    [/^No (projects|templates) are available to link\.$/, (_, noun: string) => `没有可链接的${LIST_NOUNS[noun] ?? noun}。`],
    // 项目名是用户内容，原文没有引号，译文也不加；两句之间随原文用句号
    [/^Couldn't unlink (.+)\. Please try again\.$/, (_, name: string) => `${joinCjk('无法取消链接', name)}。请重试。`],
    // 原文只有 and、没有逗号：译文用“和”，不加顿号（与 profile/tabs.ts 同译）
    [/^(\d+) open and (\d+) closed projects? found\.$/, '找到 $1 个打开和 $2 个已关闭的项目。']
  ],
  ignore: [
    // 存储库项目页的项目描述、组织项目列表中的项目标题与描述
    'p[class*="projectDescription__"]',
    '#memexes-results a[id^="project_"]',
    '#memexes-results span.text-normal'
  ]
} satisfies PageDictionary
