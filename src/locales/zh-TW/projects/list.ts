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
  projects: '專案',
  'project templates': '專案範本',
  templates: '範本'
}

export default {
  static: {
    // 存储库项目页
    'Repository projects': '儲存庫專案',
    'Search projects': '搜尋專案',
    'Sort projects by': '專案排序依據',
    'Filter projects by state': '依狀態篩選專案',
    'Loading projects': '正在載入專案',
    'Load more projects': '載入更多專案',
    'More project actions': '更多專案動作',
    'No closed projects': '沒有已關閉的專案',
    'No closed project templates': '沒有已關閉的專案範本',
    'No open project templates': '沒有開放中的專案範本',
    'Provide quick access to relevant project templates': '快速存取相關的專案範本',
    'No project templates': '沒有專案範本',
    'Add project templates from your organization to view them here.': '新增組織的專案範本後會顯示在這裡。',
    // Rails 版空状态（前两句原文带句号，与模板版同译）
    'Provide quick access to relevant projects.': '快速存取相關的專案。',
    'Provide quick access to relevant project templates.': '快速存取相關的專案範本。',
    'Add projects from your organization to view them here.': '新增組織中的專案後會顯示在這裡。',
    'Add projects to view them here.': '新增專案後會顯示在這裡。',
    "This repository doesn't have any projects yet": '此儲存庫還沒有任何專案',
    'No projects found': '找不到專案',
    'There are no projects linked to this repository yet.': '此儲存庫尚未連結任何專案。',
    'There are no projects linked to this repository.': '此儲存庫沒有連結任何專案。',
    'Something went wrong loading projects.': '載入專案時發生錯誤。',
    'Something went wrong loading projects. Please try again.': '載入專案時發生錯誤。請再試一次。',
    'Remove from recently viewed': '從最近查看中移除',
    'Unlink project': '取消連結專案',

    // 链接项目对话框（Link projects、Link a project to this repository 是 Rails 版的按钮与说明）
    'Link a project': '連結專案',
    'Link a template': '連結範本',
    'Link projects': '連結專案',
    'Link a project from the organization to this repository': '將組織中的專案連結到此儲存庫',
    'Link a template from the organization to this repository': '將組織中的範本連結到此儲存庫',
    'Link a project from the organization to this team': '將組織中的專案連結到此團隊',
    'Link a template from the organization to this team': '將組織中的範本連結到此團隊',
    'Link a project to this repository': '將專案連結到此儲存庫',
    'Filter projects': '篩選專案',
    'Filter templates': '篩選範本',

    // 组织 / 用户项目列表（Rails）：介绍区、空状态、搜索、模板视图
    'Welcome to Projects': '歡迎使用專案',
    'Welcome to projects': '歡迎使用專案',
    'Built to be flexible and adaptable, Projects gives you a live canvas to filter, sort, and group issues and pull requests in a table, board, or roadmap. Tailor them to your needs with custom fields, saved views, workflows, and insights.':
      '專案靈活且適應性強，為你提供即時畫布，可在表格、看板或藍圖中篩選、排序並分組議題和拉取請求。可使用自訂欄位、已儲存的檢視、工作流程和洞察依需求量身打造。',
    // 较早的介绍文案
    'Built like a spreadsheet, project tables give you a live canvas to filter, sort, and group issues and pull requests. Tailor them to your needs with custom fields and saved views.':
      '專案表格就像試算表，為你提供即時畫布，可篩選、排序並分組議題和拉取請求。還能透過自訂欄位和已儲存的檢視，依需求調整表格。',
    'Learn more about projects': '瞭解專案',
    "You don't have any projects yet.": '你還沒有任何專案。',
    'There are no projects matching your search.': '沒有與搜尋相符的專案。',
    'Clear current search query and sorts': '清除目前的搜尋查詢和排序',
    'New template': '新增範本',

    // 复制项目对话框
    'Copy project': '複製專案',
    'Make a copy of this project that can be used as a starting point for another project.': '建立此專案的副本作為其他專案的起點。',
    'Views, custom fields, insights, and workflows will be copied.': '將複製檢視、自訂欄位、洞察和工作流程。',
    'Issues and pull requests will not be copied.': '不會複製議題和拉取請求。',
    'Draft issues will be copied if selected': '選取後將複製草稿議題',
    'Owner for the new project': '新專案的擁有者',
    'New project name': '新專案名稱',
    'Failed to copy project. Please try again.': '無法複製專案。請再試一次。'
  },
  scoped: {
    // 通用文本（仅项目页生效）；产品名 GitHub Projects 按 product-names.md 译「GitHub 專案」，见 settings.ts 项目菜单
    'Search by name…': '依名稱搜尋…',
    'Clear search query': '清除搜尋字詞',
    'Suggestions could not be loaded': '無法載入建議',
    'Copying…': '複製中…',
    "Couldn't load owners": '無法載入擁有者',
    "Couldn't load owners. Try again later.": '無法載入擁有者。請稍後再試。',
    'No owners matched': '沒有相符的擁有者',
    'No owners found': '找不到擁有者',
    'No owners are available.': '沒有可用的擁有者。',
    'Select an owner': '選擇擁有者',
    // 列表通用
    All: '全部',
    Templates: '範本',
    'Project type': '專案類型',
    'Recently updated': '最近更新',
    'Least recently updated': '最久未更新',
    Newest: '最新',
    Oldest: '最舊',
    Name: '名稱',
    'Recently viewed': '最近查看',
    'Try a different search term or clear the search to see all': '嘗試其他搜尋字詞或清除搜尋以查看全部',
    // 开放中 / 已关闭筛选标签（组织、用户、存储库项目列表）；Closed 时间戳字段的表头同样显示为「已關閉」
    Open: '開放中',
    Closed: '已關閉',
    // 规划侧栏
    'Issues sidebar navigation': '議題側邊欄導覽',
    'Open Issues sidebar navigation': '開啟議題側邊欄導覽',
    'Issue filters': '議題篩選器',
    'Assigned to me': '指派給我的',
    'Created by me': '我建立的',
    Mentioned: '提及我的',
    'Recent activity': '最近活動',
    // 页面导航（aria-label）及其中的视图、里程碑；Preview 是「意見回饋」旁的标签
    Pages: '頁面',
    Views: '檢視',
    Milestones: '里程碑',
    Preview: '預覽',
    'Collapse sidebar': '摺疊側邊欄',
    'Expand sidebar': '展開側邊欄',
    // 复制项目对话框
    'Search owners': '搜尋擁有者',
    Included: '包含',
    'Not included': '不包含',
    Owner: '擁有者',
    Required: '必填',
    'Try again later.': '請稍後再試。',
    'Try a different search term.': '嘗試其他搜尋字詞。',
    'Something went wrong. Please try again.': '發生錯誤。請再試一次。',
    // 存储库项目页（Rails 版）：空状态按钮；行菜单的 Remove project 是从存储库取消链接、不删除项目（React 版为 Unlink project）
    'Create a project': '建立專案',
    'Remove project': '移除專案',
    // 团队项目页（/orgs/<组织>/teams/<团队>/projects）：团队协作者权限对话框
    'Update team collaborator permissions': '更新團隊協作者權限',
    'Add team as collaborator': '將團隊新增為協作者',
    'Remove team as collaborator': '移除團隊的協作者身分'
  },
  regexp: [
    [/^(All|Templates), Project type$/, (_, type: string) => `${type === 'All' ? '全部' : '範本'}，專案類型`],
    [/^#(\d+) updated$/, '#$1 更新於'],
    [/^(\d[\d,]*) projects?$/, '$1 個專案'],
    [/^(\d[\d,]*) templates?$/, '$1 個範本'],
    [/^No (projects|project templates) matched your search$/, (_, noun: string) => `沒有相符的${LIST_NOUNS[noun] ?? noun}`],
    [
      /^Try a different search term or clear the search to see all (projects|project templates)\.$/,
      (_, noun: string) => `嘗試其他搜尋字詞或清除搜尋以查看所有${LIST_NOUNS[noun] ?? noun}。`
    ],
    [/^No (projects|templates) matched “(.+)”$/, (_, noun: string, query: string) => `沒有與「${query}」相符的${LIST_NOUNS[noun] ?? noun}`],
    [/^No (projects|templates) matched$/, (_, noun: string) => `沒有相符的${LIST_NOUNS[noun] ?? noun}`],
    [/^No (projects|templates) found$/, (_, noun: string) => `找不到${LIST_NOUNS[noun] ?? noun}`],
    [/^No (projects|templates) are available to link\.$/, (_, noun: string) => `沒有可連結的${LIST_NOUNS[noun] ?? noun}。`],
    // 项目名是用户内容，原文没有引号，译文也不加；两句之间随原文用句号
    [/^Couldn't unlink (.+)\. Please try again\.$/, (_, name: string) => `${joinCjk('無法取消連結', name)}。請再試一次。`],
    // 原文只有 and、没有逗号：译文用「和」，不加顿号（与 profile/tabs.ts 同译）
    [/^(\d+) open and (\d+) closed projects? found\.$/, '找到 $1 個開放中和 $2 個已關閉的專案。'],
    // 团队项目页：团队协作者权限对话框（团队名在引号中）
    [
      /^This team currently has no access permissions on this project\. To provide access to the project, the team "(.+)" will be added as a collaborator with read permissions\.$/,
      '此團隊目前沒有此專案的存取權限。團隊「$1」將新增為具有讀取權限的協作者，以便存取此專案。'
    ],
    [
      /^This team currently has access permissions to this project\. If this project is removed, "(.+)" access will be revoked and the team will no longer be able to access the project\.$/,
      '此團隊目前具有此專案的存取權限。移除此專案後，「$1」的存取權限將被撤銷，團隊將無法再存取此專案。'
    ]
  ],
  ignore: [
    // 存储库项目页的项目描述、组织项目列表中的项目标题与描述
    'p[class*="projectDescription__"]',
    '#memexes-results a[id^="project_"]',
    '#memexes-results span.text-normal'
  ]
} satisfies PageDictionary
