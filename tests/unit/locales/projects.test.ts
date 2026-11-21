import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { createMatcher, normalizeText, type Matcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import projects from '../../../src/locales/zh-CN/projects'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = projects

const matcher = createMatcher([['projects', projects]])

/** 完整语言包：DOM 测试里槽位内的文字（common 的 Owners、Loading 等）同时生效 */
const bundleMatcher = createMatcher(zhCN)

/** 组织项目页的作用域：common → organization → projects */
const SCOPE: readonly PageKey[] = ['common', 'organization', 'projects']

function translate(text: string): string | undefined {
  return matcher.translate(text, SCOPE)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列（与合并顺序一致），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 视图
  { hits: [['View options for Sprint board', 'Sprint board 的视图选项']], misses: ['View options'] },
  {
    hits: [['Save display options for Sprint board?', '保存 Sprint board 的显示选项？']],
    misses: ['Save display options for Sprint board']
  },
  { hits: [['Save filters for Backlog?', '保存 Backlog 的筛选器？']], misses: ['Save filters for Backlog'] },
  {
    hits: [['Save filters and display options for Backlog?', '保存 Backlog 的筛选器和显示选项？']],
    misses: ['Save filters and display options']
  },
  // 分组、列与卡片
  {
    hits: [
      ['Actions for column: Todo', '列 Todo 的操作'],
      ['Actions for group: High', '分组 High 的操作']
    ],
    misses: ['Actions: Todo']
  },
  { hits: [['Actions for Fix login bug', 'Fix login bug 的操作']], misses: ['Actions for'] },
  {
    hits: [
      ['Collapse group Todo', '折叠分组 Todo'],
      ['Expand group In Progress', '展开分组 In Progress']
    ],
    misses: ['Collapse all groups']
  },
  {
    hits: [
      ['No Iteration', '无迭代'],
      ['No Assignees', '无受理人'],
      ['No Start date', '无开始日期'],
      ['No Issue type', '无议题类型']
    ],
    misses: ['No iteration']
  },
  {
    hits: [
      ['No Sprint', '无 Sprint'],
      ['No Story points', '无 Story points']
    ],
    misses: ['No sprint']
  },
  {
    hits: [
      ['12 cards', '12 张卡片'],
      ['1 card', '1 张卡片']
    ],
    misses: ['Some cards']
  },
  {
    hits: [
      ['More cards in Todo', 'Todo 中的更多卡片'],
      ['More cards in Todo, High', 'Todo, High 中的更多卡片']
    ],
    misses: ['More cards']
  },
  { hits: [['Archive 3 selected items', '存档 3 个所选项']], misses: ['Archive selected items'] },
  { hits: [['Archive 3 items', '存档 3 个项']], misses: ['Archive items'] },
  {
    hits: [['Remove 3 selected items from project', '从项目中删除 3 个所选项']],
    misses: ['Remove selected items from project']
  },
  {
    hits: [['Delete 3 selected items from project', '从项目中删除 3 个所选项']],
    misses: ['Delete selected items from project']
  },
  { hits: [['Add item to Todo', '向 Todo 添加项']], misses: ['Add item to'] },
  { hits: [['Showing 25 of 120', '显示 120 个中的 25 个']], misses: ['Showing 25 of many'] },
  // 卡片标签提示
  { hits: [['Linked pull request: #12', '链接的拉取请求：#12']], misses: ['Linked pull request: 12'] },
  {
    hits: [
      ['Label: bug', '标签：bug'],
      ['Label: Public Preview', '标签：Public Preview']
    ],
    misses: ['Label bug']
  },
  {
    hits: [
      ['Iteration: Iteration 3 (Oct 01 - Oct 14)', '迭代：Iteration 3（10月1日 - 10月14日）'],
      ['Sprint: Sprint 9 (Dec 25, 2026 - Jan 07, 2027)', 'Sprint：Sprint 9（2026年12月25日 - 2027年1月7日）']
    ],
    misses: ['Sprint 9 (Oct 01 - Oct 14)']
  },
  {
    hits: [
      ['Status: Done', '状态：已完成'],
      ['Status: Blocked', '状态：Blocked'],
      ['Estimate: 0', '估算：0'],
      ['Created: Oct 26, 2026', '创建时间：2026年10月26日'],
      ['Labels: bug', '标签：bug']
    ],
    misses: ['Story points: 3', 'Status Done']
  },
  // 表头与视图配置
  {
    hits: [
      ['Status column options', '状态列选项'],
      ['Story points column options', 'Story points 列选项']
    ],
    misses: ['column options']
  },
  {
    hits: [
      ['Change sort direction to ascending', '将排序方向改为升序'],
      ['Change primary sort direction to descending', '将主要排序方向改为降序'],
      ['Change no. 3 sort direction to ascending', '将第 3 个排序方向改为升序']
    ],
    misses: ['Change sort direction to random']
  },
  {
    hits: [
      ['(sort: ascending)', '（排序：升序）'],
      ['(secondary sort: descending)', '（次要排序：降序）']
    ],
    misses: ['(sort: random)']
  },
  {
    hits: [['Sorted by: Status ascending, Story points descending', '排序依据：状态升序，Story points 降序']],
    misses: ['Sorted by Status ascending']
  },
  { hits: [['Count, Estimate and 2 more', '计数，估算等 3 项']], misses: ['Counted, Estimate and more'] },
  {
    hits: [
      ['Count, Estimate', '计数，估算'],
      ['Count, Story points', '计数，Story points']
    ],
    misses: ['Counted, Story points']
  },
  {
    hits: [
      ['Title, Assignees, and Status', '标题、受理人和状态'],
      ['Start date and Target date', '开始日期和目标日期']
    ],
    misses: ['Title, Story points, and Status']
  },
  {
    hits: [
      ['Estimate and 2 more', '估算等 3 项'],
      ['Story points and 1 more', 'Story points 等 2 项']
    ],
    misses: ['Estimate and more', 'octocat, hubot and 3 more', 'alice, bob, carol, dave, erin, and 2 more']
  },
  // 筛选建议
  {
    hits: [
      ['Current iteration', '当前迭代'],
      ['Next sprint', '下一个 sprint'],
      ['Previous iteration', '上一个迭代']
    ],
    misses: ['Next page', 'Next month', 'Current Iteration', 'Next step', 'Previous step', 'Next steps', 'Next issue']
  },
  {
    hits: [
      ['iteration starts with...', '迭代开头为...'],
      ['title contains...', '标题包含...'],
      ['sprint ends with...', 'sprint 结尾为...']
    ],
    misses: ['iteration starts with']
  },
  {
    hits: [
      ['Sub-issues – Status', '子议题 – 状态'],
      ['Sub-issues – Story points', '子议题 – Story points']
    ],
    misses: ['Sub-issues - Status']
  },
  {
    hits: [
      ['Filter by Status', '按状态筛选'],
      ['Filter by Story points', '按 Story points 筛选']
    ],
    misses: ['Filter by', 'Filter by items in the current iteration of the project', 'Filter by user', 'Filter by assignee']
  },
  {
    hits: [
      ['Has assignees', '有受理人'],
      ['Has story points', '有 story points']
    ],
    misses: ['Has Assignees']
  },
  {
    hits: [
      ['4 weeks', '4 周'],
      ['1 day', '1 天'],
      ['6 months', '6 个月']
    ],
    misses: ['2 years']
  },
  // 筛选建议的组合 aria-label
  {
    hits: [
      ['Has Assignees, Assignees', '有受理人，受理人'],
      ['No Status, Status', '无状态，状态']
    ],
    misses: ['Has Assignees, assignees']
  },
  {
    hits: [
      ['term*, iteration starts with', 'term*，迭代开头为'],
      ['*term*, sprint contains', '*term*，sprint 包含']
    ],
    misses: ['term*, Iteration starts with']
  },
  {
    hits: [
      ['Status, Filter', '状态，筛选器'],
      ['No, Filter, Items without a value for the specified field', '无，筛选器，指定字段没有值的项'],
      ['Story points, Filter', 'Story points，筛选器']
    ],
    misses: ['Status Filter']
  },
  {
    hits: [
      ['Todo, Status', '待办，状态'],
      ['Past 7 days, Updated', '过去 7 天，更新时间'],
      ['Current iteration, Iteration', '当前迭代，迭代'],
      ['Needs Review, Status', 'Needs Review，状态']
    ],
    misses: ['Todo, status']
  },
  // 路线图
  {
    hits: [
      ['Zoom level: quarter.', '缩放级别：季度。'],
      ['Zoom level: month.', '缩放级别：月。']
    ],
    misses: ['Zoom level: week.']
  },
  {
    hits: [['Select zoom level. The current zoom level is year.', '选择缩放级别。当前缩放级别为年。']],
    misses: ['Select zoom level.']
  },
  {
    hits: [
      ['Today: Mon, Oct 26', '今天：10月26日周一'],
      ['Today: Mon, Oct 26 - Fri, Nov 6 [Iteration 3]', '今天：10月26日周一 - 11月6日周五 [Iteration 3]']
    ],
    misses: ['Today: tomorrow']
  },
  { hits: [['Scroll to: Fri, Jan 8 2027', '滚动到：2027年1月8日周五']], misses: ['Scroll to: next week'] },
  { hits: [['Add to today at Mon, Oct 26', '添加到今天 10月26日周一']], misses: ['Add to today at noon'] },
  {
    hits: [['Add to Mon, Oct 26 - Fri, Nov 6 [Iteration 3]', '添加到 10月26日周一 - 11月6日周五 [Iteration 3]']],
    misses: ['Add to Monday']
  },
  {
    hits: [['Create an iteration containing Tue, Dec 1 to add items here', '创建包含 12月1日周二的迭代后才能在此添加项']],
    misses: ['Create an iteration containing today to add items here']
  },
  {
    hits: [
      ['Mon, Oct 26 - Fri, Nov 6', '10月26日周一 - 11月6日周五'],
      [
        'Mon, Oct 26 - Fri, Nov 6 [Iteration 3 start - Iteration 4 end]',
        '10月26日周一 - 11月6日周五 [Iteration 3 开始 - Iteration 4 结束]'
      ],
      ['Mon, Oct 26 [Iteration 3 start - Oct 30]', '10月26日周一 [Iteration 3 开始 - 10月30日]']
    ],
    misses: ['Mon, Oct 26 -']
  },
  {
    hits: [
      ['Oct 01 - Oct 14', '10月1日 - 10月14日'],
      ['Dec 25, 2026 - Jan 07, 2027', '2026年12月25日 - 2027年1月7日']
    ],
    misses: ['Oct 01 - later']
  },
  {
    hits: [
      [
        "We've selected an existing date field in your project to get started. You can change the fields used here.",
        '已选择项目中现有的日期字段。可在此更改所用字段。'
      ],
      [
        "We've selected an existing iteration field in your project to get started. You can change the fields used here.",
        '已选择项目中现有的迭代字段。可在此更改所用字段。'
      ]
    ],
    misses: ["We've selected an existing text field in your project to get started. You can change the fields used here."]
  },
  { hits: [['3 milestones', '3 个里程碑']], misses: ['Many milestones'] },
  { hits: [['4 iterations', '4 个迭代']], misses: ['Many iterations'] },
  {
    hits: [
      ['Iteration 3 start', 'Iteration 3 开始'],
      ['Sprint 12 end', 'Sprint 12 结束']
    ],
    misses: ['iteration 3 start']
  },
  // 字段设置页
  {
    hits: [
      ['Status field settings', '状态字段设置'],
      ['Story points field settings', 'Story points 字段设置']
    ],
    misses: ['field settings']
  },
  {
    hits: [['Title fields are created by GitHub and cannot be renamed.', '标题字段由 GitHub 创建且无法重命名。']],
    misses: ['Title fields are created by GitHub.']
  },
  { hits: [['Open field actions for Status', '打开状态字段的操作']], misses: ['Open field actions'] },
  { hits: [['Move field Priority', '移动字段优先级']], misses: ['Move fields'] },
  {
    hits: [
      ['Status options', '状态选项'],
      ['Iteration options', '迭代选项']
    ],
    misses: ['Story points options']
  },
  {
    hits: [
      ['Add assignees…', '添加受理人…'],
      ['Add labels…', '添加标签…']
    ],
    misses: ['Add Assignees…']
  },
  // 删除 / 移除字段
  {
    hits: [
      ['This will delete the field “Priority”.', '这将删除字段“优先级”。'],
      ['This will delete the field “Story points”', '这将删除字段“Story points”']
    ],
    misses: ['This will delete the field Priority.']
  },
  {
    hits: [['This will delete the field “Priority” and remove its data from', '这将删除字段“优先级”并从以下位置删除其数据']],
    misses: ['This will delete the field and remove its data from']
  },
  {
    hits: [
      [
        'This will remove the field “Priority” from this project, but it will remain on existing issues.',
        '这将从此项目中移除字段“优先级”，但会保留在现有议题上。'
      ]
    ],
    misses: ['This will remove the field from this project.']
  },
  {
    hits: [['This will remove the field “Priority”', '这将移除字段“优先级”']],
    misses: ['This will remove the field Priority']
  },
  {
    hits: [
      ['12 items', '12 个项'],
      ['1 item', '1 个项']
    ],
    misses: ['Some items']
  },
  {
    hits: [
      ['3 workflows', '3 个工作流'],
      ['1 workflow', '1 个工作流']
    ],
    misses: ['Many workflows']
  },
  // 单选选项
  { hits: [['Open edit dialog for In Progress', '打开 In Progress 的编辑对话框']], misses: ['Open edit dialog'] },
  { hits: [['Advanced move Todo...', '高级移动 Todo...']], misses: ['Advanced move Todo'] },
  { hits: [['Set Todo as default', '将 Todo 设为默认']], misses: ['Set as default value'] },
  { hits: [['Unset Todo as default', '取消 Todo 的默认']], misses: ['Unset Todo'] },
  { hits: [['Maximum of 50 options reached', '已达到 50 个选项的上限']], misses: ['Maximum options reached'] },
  {
    hits: [['Label text must be 100 characters or fewer', '标签文本不能超过 100 个字符']],
    misses: ['Label text must be short']
  },
  {
    hits: [['Description must be 256 characters or fewer', '描述不能超过 256 个字符']],
    misses: ['Description must be short']
  },
  // 迭代
  {
    hits: [['Iteration length must be 1 or more', '迭代时长不能少于 1']],
    misses: ['Iteration length must be positive']
  },
  {
    hits: [['Iteration length must be 365 or less', '迭代时长不能超过 365']],
    misses: ['Iteration length must be 365 or fewer']
  },
  { hits: [['3 Active', '活动 3']], misses: ['Active 3'] },
  { hits: [['5 Completed', '已完成 5']], misses: ['Completed 5'] },
  {
    hits: [
      ['2 active iterations will also be pushed forward.', '2 个活动迭代也会顺延。'],
      ['1 active iteration will also be pushed forward.', '1 个活动迭代也会顺延。']
    ],
    misses: ['Active iterations will also be pushed forward.']
  },
  {
    hits: [
      // Return to 后是项目标题（用户内容）：与字段名同形也不翻译
      ['Changes saved. Return to Q4 Roadmap.', '更改已保存。返回 Q4 Roadmap。'],
      ['Changes saved. Return to Iteration.', '更改已保存。返回 Iteration。']
    ],
    misses: ['Changes saved. Return']
  },
  // 删除选项 / 迭代
  {
    hits: [
      ['Delete option?', '删除选项？'],
      ['Delete 3 iterations?', '删除 3 个迭代？'],
      ['Delete values', '删除值']
    ],
    misses: ['Delete 3 fields?']
  },
  {
    hits: [
      [
        'This will permanently delete this option from the "Status" field and will impact everyone using this project.',
        '这将从“状态”字段中永久删除所选选项并影响此项目的所有使用者。'
      ],
      [
        'This will permanently delete these iteration values from the "Sprint" field and will impact everyone using this project.',
        '这将从“Sprint”字段中永久删除所选迭代值并影响此项目的所有使用者。'
      ]
    ],
    misses: ['This will permanently delete this option.']
  },
  {
    hits: [['The option will be permanently deleted from 4 items in this project.', '将从此项目的 4 个项中永久删除。']],
    misses: ['The option will be permanently deleted.']
  },
  {
    hits: [['The options will be permanently deleted from any items in this project.', '将从此项目的所有项中永久删除。']],
    misses: ['The options will be deleted from any items in this project.']
  },
  {
    hits: [['This iteration value will be removed from 2 items in this project.', '将从此项目的 2 个项中移除。']],
    misses: ['This iteration value will be removed.']
  },
  {
    hits: [['These iteration values will be removed from any items in this project.', '将从此项目的所有项中移除。']],
    misses: ['These iteration values will be removed from all items in this project.']
  },
  {
    hits: [
      [
        'This option is used in 2 workflows. Deleting it will disable the workflows and invalidate any actions referencing it.',
        '2 个工作流正在使用所选选项。删除后会禁用相关工作流并使引用它的操作失效。'
      ],
      [
        'These iterations are used in 1 workflow. Deleting them will disable the workflow and invalidate any actions referencing them.',
        '1 个工作流正在使用所选迭代。删除后会禁用相关工作流并使引用它的操作失效。'
      ]
    ],
    misses: ['This option is used in workflows.']
  },
  // 问题字段
  {
    hits: [
      ['Use issue fields defined by acme to keep information consistent across projects.', '使用 acme 定义的议题字段以保持各项目信息一致。']
    ],
    misses: ['Use issue fields to keep information consistent across projects.']
  },
  { hits: [['Add Priority field to project', '将优先级字段添加到项目']], misses: ['Add field to project'] },
  { hits: [['Priority field added to project', '优先级字段已添加到项目']], misses: ['Field added to project'] },
  {
    hits: [['Could not add Priority field to project. Please try again.', '无法将优先级字段添加到项目。请重试。']],
    misses: ['Could not add field to project.']
  },
  {
    hits: [
      [
        'In order to add the "Priority" issue field, you need to rename your project field.',
        '要添加“Priority”议题字段，需先重命名项目字段。'
      ]
    ],
    misses: ['In order to add the issue field, you need to rename your project field.']
  },
  { hits: [['Rename project field "Priority"', '重命名项目字段“Priority”']], misses: ['Rename project field'] },
  {
    hits: [
      [
        'You already have 50 fields in your project. Remove some in order to add more fields.',
        '项目已有 50 个字段。移除部分字段后才能添加。'
      ]
    ],
    misses: ['You already have many fields in your project.']
  },
  {
    hits: [['You can only add 10 at a time. Deselect some fields to continue.', '一次最多添加 10 个。取消选择部分字段后继续。']],
    misses: ['You can only add a few at a time.']
  },
  {
    hits: [
      [
        'You already have 45 fields in your project. Adding these would exceed the 50-field limit.',
        '项目已有 45 个字段。添加后将超出 50 个字段的上限。'
      ]
    ],
    misses: ['Adding these would exceed the field limit.']
  },
  {
    hits: [['Issue fields can only be applied to issues within the acme organization', '议题字段只能用于 acme 组织内的议题']],
    misses: ['Issue fields can only be applied to issues']
  },
  // 问题类型设置
  {
    hits: [
      [
        'Rename your “Type” custom field and start using issue types defined by your organization.',
        '重命名自定义字段“Type”并开始使用组织定义的议题类型。'
      ],
      [
        'Rename your “Type“ custom field and start using issue types defined by your organization.',
        '重命名自定义字段“Type”并开始使用组织定义的议题类型。'
      ]
    ],
    misses: ['Rename your custom field and start using issue types defined by your organization.']
  },
  {
    hits: [
      [
        'To start using issue types in your project, please rename your “Type“ custom field and update any filters that reference it.',
        '要在项目中使用议题类型，需重命名自定义字段“Type”并更新引用它的筛选器。'
      ]
    ],
    misses: ['To start using issue types in your project, please rename your custom field.']
  },
  // 添加项
  { hits: [['Showing 25 most recent items', '显示最近 25 个项']], misses: ['Showing most recent items'] },
  {
    hits: [
      ['Showing 25 most recent items that have not been added to this project', '显示最近 25 个未添加到此项目的项'],
      [
        'Showing 1 most recent item that has not been added to this project. Use search to narrow down this list.',
        '显示最近 1 个未添加到此项目的项。搜索可缩小范围。'
      ]
    ],
    misses: ['Showing items that have not been added to this project']
  },
  // 确认框
  {
    hits: [
      ['Are you sure you want to archive this item?', '确定要存档此项吗？'],
      ['Are you sure you want to archive these 3 items?', '确定要存档这 3 个项吗？']
    ],
    misses: ['Are you sure you want to archive this project?']
  },
  {
    hits: [
      ['Are you sure you want to remove 5 items from the project?', '确定要从项目中删除这 5 个项吗？'],
      ['Are you sure you want to remove this item from this project?', '确定要从项目中删除此项吗？']
    ],
    misses: ['Are you sure you want to remove this item?']
  },
  {
    hits: [
      ['Archive item?', '存档项？'],
      ['Archive items?', '存档项？']
    ],
    misses: ['Archive this item']
  },
  {
    hits: [
      ['Remove item?', '删除项？'],
      ['Remove items?', '删除项？']
    ],
    misses: ['Remove items']
  },
  { hits: [['Move items to Iteration 4?', '将项移到 Iteration 4？']], misses: ['Move items to Iteration 4'] },
  {
    hits: [
      ['Are you sure you want to move 3 items to "Iteration 4"?', '确定要将这 3 个项移到“Iteration 4”吗？'],
      ['Are you sure you want to move this item to "Sprint 9"?', '确定要将此项移到“Sprint 9”吗？']
    ],
    misses: ['Are you sure you want to move it?']
  },
  {
    hits: [
      ['Cannot add Reviewers', '无法添加审查者'],
      ['Cannot add an issue type', '无法添加议题类型']
    ],
    misses: ['Cannot add']
  },
  {
    hits: [['Pull requests cannot have issue fields', '拉取请求不能有议题字段']],
    misses: ['Pull requests cannot have']
  },
  {
    hits: [['Convert this draft to an issue to add an issue type', '将此草稿转换为议题后才能添加议题类型']],
    misses: ['Convert this draft to an issue']
  },
  {
    hits: [
      ['Milestones cannot be applied to draft issues', '里程碑无法应用于草稿议题'],
      ['Issue types cannot be applied to pull requests', '议题类型无法应用于拉取请求'],
      ['Repositorys cannot be applied to draft issues', '存储库无法应用于草稿议题']
    ],
    misses: ['Milestones cannot be applied to issues']
  },
  {
    hits: [
      [
        'More than 100 cells are selected. Deselect some cells to perform bulk edits.',
        '已选择超过 100 个单元格。取消选择部分单元格后才能批量编辑。'
      ]
    ],
    misses: ['More than 100 cells are selected.']
  },
  {
    hits: [
      ['Unable to assign the following users to the converted issue: octocat, hubot', '无法将以下用户分配给转换后的议题：octocat, hubot']
    ],
    misses: ['Unable to assign the following users']
  },
  {
    hits: [
      ['This value must be between -2147483647 and 2147483647', '此值必须介于 -2147483647 和 2147483647 之间'],
      ['This value must be between 1 and 10', '此值必须介于 1 和 10 之间']
    ],
    misses: ['This value must be between one and ten']
  },
  {
    hits: [
      ['Title cannot be deleted', '标题无法删除'],
      ['Single select cannot be deleted', '单选无法删除'],
      ['Created at cannot be deleted', '创建时间无法删除']
    ],
    misses: ['Story points cannot be deleted']
  },
  {
    hits: [
      ['Invalid `state`: foo. open, closed are acceptable values for `state`', '`state` 无效：foo。`state` 的可接受值为 open, closed']
    ],
    misses: ['Invalid `state`']
  },
  { hits: [["@octocat's untitled project", '@octocat 的未命名项目']], misses: ["octocat's untitled project"] },
  {
    hits: [
      ['5 results.', '5 个结果。'],
      ['1 result.', '1 个结果。']
    ],
    misses: ['5 results found.']
  },
  {
    hits: [
      ['2 reviewers', '2 个审查者'],
      ['1 reviewer', '1 个审查者']
    ],
    misses: ['Reviewers 2']
  },
  { hits: [['40% of 5', '5 项中的 40%']], misses: ['40 of 5'] },
  { hits: [['2 of 5 completed', '已完成 2/5']], misses: ['2 of 5 done'] },
  { hits: [['40% completed', '已完成 40%']], misses: ['40% done'] },
  {
    hits: [
      ['Fix login bug, status: open', 'Fix login bug，状态：打开'],
      ['Bump deps, status: merged pull request', 'Bump deps，状态：已合并的拉取请求'],
      ['Fix login bug, status: closed. sub-issue of Epic. Level 2', 'Fix login bug，状态：已关闭。Epic 的子议题。第 2 级']
    ],
    misses: ['Fix login bug, state: open']
  },
  {
    hits: [
      ['Open issue, blocked', '打开的议题，被阻止'],
      ['Closed as not planned issue, blocked', '以未计划关闭的议题，被阻止'],
      ['Merged pull request, blocked', '已合并的拉取请求，被阻止']
    ],
    misses: ['Open issue, blocking']
  },
  // 子问题
  {
    hits: [
      ['3 sub-issues not in this project', '3 个子议题不在此项目中'],
      ['1 sub-issue not in this project', '1 个子议题不在此项目中']
    ],
    misses: ['Sub-issues not in this project']
  },
  { hits: [['Sub-issues progress: 2 of 5 (40%)', '子议题进度：2/5 (40%)']], misses: ['Sub-issues progress: 2 of 5'] },
  {
    hits: [['Sub-issues progress: 2 of 5 (40%). Show sub-issues for: Fix login bug', '子议题进度：2/5 (40%)。显示 Fix login bug 的子议题']],
    misses: ['Show sub-issues for: Fix login bug']
  },
  // 里程碑与状态更新
  {
    hits: [
      ['Past due by 3 days', '已逾期 3天'],
      ['Past due by about 2 months', '已逾期约 2个月'],
      ['Past due by a day', '已逾期 1天']
    ],
    misses: ['Past due by tomorrow']
  },
  {
    hits: [
      ['Due by Oct 26, 2026', '截止于 2026年10月26日'],
      ['Due by Nov 3', '截止于 11月3日']
    ],
    misses: ['Due by tomorrow']
  },
  {
    hits: [
      ['View latest On track status updated Oct 20, 2026', '查看更新于 2026年10月20日的最新进展顺利状态'],
      ['View latest Blocked status updated Oct 20', '查看更新于 10月20日的最新Blocked 状态']
    ],
    misses: ['View latest status update']
  },
  {
    hits: [
      ['Updated 3 days ago', '更新于 3天前'],
      ['Updated less than a minute ago', '更新于不到 1分钟前'],
      ['Updated yesterday', '更新于昨天']
    ],
    misses: ['Updated recently']
  },
  {
    hits: [
      ['React with 👍 (3 👍 reactions so far)', '添加 👍 反应（已有 3 个）'],
      ['React with 🎉 (1 🎉 reaction so far)', '添加 🎉 反应（已有 1 个）']
    ],
    misses: ['React with 👍']
  },
  // 已存档项
  {
    hits: [
      ['All 1,234 items matching query selected', '已选择与查询匹配的全部 1,234 个项'],
      ['All 500+ items matching query selected', '已选择与查询匹配的全部 500+ 个项']
    ],
    misses: ['All items matching query selected']
  },
  {
    hits: [['Select all 500+ items matching this query', '选择与此查询匹配的全部 500+ 个项']],
    misses: ['Select all items matching this query']
  },
  {
    hits: [
      ['3 items selected', '已选择 3 个项'],
      ['1 item selected', '已选择 1 个项']
    ],
    misses: ['No items selected']
  },
  {
    hits: [
      ['1-25 of 1,000+ items', '共 1,000+ 个项中的第 1-25 个'],
      ['1-1 of 1 item', '共 1 个项中的第 1-1 个']
    ],
    misses: ['1-25 of many items']
  },
  {
    hits: [
      ['12 items matched your filter', '12 个项与筛选器匹配'],
      ['1 item matched your filter', '1 个项与筛选器匹配']
    ],
    misses: ['Items matched your filter']
  },
  {
    hits: [['This will exceed the 50,000 project item limit', '将超出项目 50,000 个项的上限']],
    misses: ['This will exceed the project item limit']
  },
  {
    hits: [
      ["Items without a 'Status' value", '没有“状态”值的项'],
      ["Items without a 'Story points' value", '没有“Story points”值的项']
    ],
    misses: ['Items without a value']
  },
  {
    hits: [
      ['Filter for Status', '按状态筛选'],
      ['Filter for Story points', '按 Story points 筛选']
    ],
    misses: ['Filter for']
  },
  {
    hits: [
      ['Exclude status', '排除状态'],
      ['Exclude story points', '排除 story points']
    ],
    misses: ['Excluded status']
  },
  // 批量更新 / 导入
  { hits: [['Bulk update in progress 45%', '批量更新进行中 45%']], misses: ['Bulk update in progress'] },
  {
    hits: [
      ['Bulk update completed.', '批量更新已完成。'],
      ['Bulk update completed. 2 items couldn’t be updated and were skipped.', '批量更新已完成。2 个项无法更新并已跳过。']
    ],
    misses: ['Bulk update completed']
  },
  {
    hits: [
      ['Bulk update failed. Please refresh the page and try again.', '批量更新失败。请刷新页面后重试。'],
      ['Bulk update failed for 3 items. Please refresh the page and try again.', '3 个项批量更新失败。请刷新页面后重试。']
    ],
    misses: ['Bulk update failed']
  },
  {
    hits: [['Error updating items: Cannot update more than 1000 items at once', '更新项出错：一次最多更新 1000 个项']],
    misses: ['Error updating items']
  },
  {
    hits: [['45% imported; you may leave this page while we work in the background.', '已导入 45%；后台导入期间可离开此页面。']],
    misses: ['45% imported']
  },
  {
    hits: [
      ['Import complete.', '导入完成。'],
      [
        'Import complete. 2 items failed to import. Now running setup workflows – this may take a few minutes.',
        '导入完成。2 个项导入失败。正在运行设置工作流——可能需要几分钟。'
      ],
      [
        'Import complete. Keep this project up to date by automatically adding new items matching your filters.',
        '导入完成。通过自动添加与筛选器匹配的新项保持项目最新。'
      ]
    ],
    misses: ['Import complete']
  },
  {
    hits: [['Failed to add items from your repository. 3 items failed to import.', '无法从存储库添加项。3 个项导入失败。']],
    misses: ['Failed to add items from your repository.']
  },
  // 日期选择器与日期
  { hits: [['Week 42', '第 42 周']], misses: ['Week'] },
  { hits: [['Must be on or after Oct 1, 2026', '不能早于 2026年10月1日']], misses: ['Must be on or after'] },
  { hits: [['Must be on or before Dec 31, 2026', '不能晚于 2026年12月31日']], misses: ['Must be after Oct 1'] },
  {
    hits: [['Start date - Open date picker (currently selected: Oct 26, 2026)', '开始日期 - 打开日期选择器（当前：2026年10月26日）']],
    misses: ['Start date - Open date picker']
  },
  {
    hits: [
      ['Target date - Choose date...', '目标日期 - 选择日期...'],
      ['Deadline - Choose date...', 'Deadline - 选择日期...']
    ],
    misses: ['Choose date...']
  },
  {
    hits: [
      ['Monday, October 26', '10月26日星期一'],
      ['Monday, October 26 (Today) (Start of selected range)', '10月26日星期一（今天）（所选范围开始）']
    ],
    misses: ['Monday, October']
  },
  {
    hits: [
      ['Oct 26, 2026', '2026年10月26日'],
      ['October 2026', '2026年10月']
    ],
    misses: ['Oct 2026 release']
  },
  {
    hits: [['Please keep your feedback within 1000 characters or less.', '反馈请控制在 1000 个字符以内。']],
    misses: ['Please keep your feedback short.']
  },
  // 项目设置
  { hits: [['Workflows (3 enabled)', '工作流（已启用 3 个）']], misses: ['Workflows (enabled)'] },
  {
    hits: [
      ['4 draft issues', '4 个草稿议题'],
      ['1 draft issue', '1 个草稿议题']
    ],
    misses: ['No draft issues']
  },
  {
    hits: [
      ['2 users successfully added', '已成功添加 2 个用户'],
      ['1 user successfully added', '已成功添加 1 个用户']
    ],
    misses: ['Users successfully added']
  },
  {
    hits: [
      ['Remove collaborator octocat', '删除协作者 octocat'],
      ['Remove collaborator @design • 4 members', '删除协作者 @design • 4 个成员']
    ],
    misses: ['Remove collaborators']
  },
  {
    hits: [
      ['Unselect octocat', '取消选择 octocat'],
      ['Unselect @design • 4 members', '取消选择 @design • 4 个成员']
    ],
    misses: ['Unselect', 'Unselect all', 'Unselect projects']
  },
  {
    hits: [
      ['Select octocat', '选择 octocat'],
      ['Select acme.bot', '选择 acme.bot'],
      ['Select @design • 1 member', '选择 @design • 1 个成员']
    ],
    misses: ['Select all', 'Select none', 'Select labels', 'Select assignees']
  },
  { hits: [['3 selected', '已选择 3 个']], misses: ['None selected'] },
  { hits: [['3 members, 1 team', '3 个成员，1 个团队']], misses: ['members, teams'] },
  {
    hits: [
      ['5 members', '5 个成员'],
      ['1 member', '1 个成员']
    ],
    misses: ['Many members']
  },
  {
    hits: [
      ['2 teams', '2 个团队'],
      ['1 team', '1 个团队']
    ],
    misses: ['Many teams']
  },
  { hits: [['@acme/design • 4 members', '@acme/design • 4 个成员']], misses: ['acme/design • 4 members'] },
  {
    hits: [
      ['3 collaborators found.', '找到 3 个协作者。'],
      ['1 collaborator found.', '找到 1 个协作者。']
    ],
    misses: ['No collaborators found']
  },
  { hits: [['Migrating Roadmap 2026', '正在迁移 Roadmap 2026']], misses: ['Migration Roadmap 2026'] },
  // 工作流
  {
    hits: [
      ['Duplicate of Item closed', '项已关闭的副本'],
      ['Duplicate of Triage', 'Triage 的副本']
    ],
    misses: ['Duplicate of', 'Duplicate of another issue']
  },
  {
    hits: [['See 12 existing items that match this query', '查看 12 个与此查询匹配的现有项']],
    misses: ['See existing items that match this query']
  },
  {
    hits: [
      ['12 items match this query', '12 个项与此查询匹配'],
      ['1 item matches this query', '1 个项与此查询匹配']
    ],
    misses: ['Items match this query']
  },
  {
    hits: [
      [
        'Using the last-updated operator means that your workflow will run every 4 hours',
        '使用 last-updated 运算符时工作流每 4 小时运行一次'
      ]
    ],
    misses: ['Using the last-updated operator']
  },
  { hits: [['Workflows for Done', '已完成列的工作流']], misses: ['Workflows for'] },
  {
    hits: [['2 workflows configured for In Progress', '正在进行列配置了 2 个工作流']],
    misses: ['Workflows configured for In Progress']
  },
  {
    hits: [
      ['Auto-assign enabled for Ready', '就绪列的自动分配已启用'],
      ['Auto-assign disabled for Todo', '待办列的自动分配已禁用']
    ],
    misses: ['Auto-assign paused for Ready']
  },
  {
    hits: [
      ['Item closed enabled for Done', '已为已完成列启用项已关闭工作流'],
      ['Triage disabled for Backlog', '已为待办池列禁用 Triage 工作流']
    ],
    misses: ['Item closed for Done', 'Copilot is disabled for this repository']
  },
  {
    hits: [
      ['Item added to project: Active', '项已添加到项目：已启用'],
      ['Item added: Disabled', '项已添加：已禁用']
    ],
    misses: ['Item added to project: Paused']
  },
  // 洞察
  {
    hits: [
      ['Sum of Estimate', '估算总和'],
      ['Count of items', '项计数'],
      ['Average of Story points', 'Story points 平均值']
    ],
    misses: ['Median of Estimate', 'Maximum of 5 pins reached. Unpin an item to pin another.']
  },
  {
    hits: [
      [
        'Private projects are limited to 2 custom charts. Make your project public or upgrade your plan to add more charts.',
        '专用项目最多只能有 2 个自定义图表。将项目设为公共或升级计划可添加更多图表。'
      ]
    ],
    misses: ['Private projects are limited to custom charts.']
  },
  {
    hits: [
      ['Displaying results for 2 weeks', '显示 2 周的结果'],
      ['Displaying results for Max', '显示全部结果'],
      ['Displaying results for Q3 2026', '显示 Q3 2026 的结果']
    ],
    misses: ['Displaying results']
  },
  {
    hits: [['Are you sure you want to delete "Burn up"?', '确定要删除“Burn up”吗？']],
    misses: ['Are you sure you want to delete this chart?']
  },
  {
    hits: [
      ['Burn up. Interactive chart.', '燃起图。交互式图表。'],
      ['Velocity. Interactive chart.', 'Velocity。交互式图表。']
    ],
    misses: ['Interactive chart']
  },
  {
    hits: [
      ['Burn up Axis zoom', '燃起图的坐标轴缩放'],
      ['Velocity Axis zoom', 'Velocity 的坐标轴缩放'],
      ['Sprint 12 Axis zoom', 'Sprint 12 的坐标轴缩放']
    ],
    misses: ['Axis zoom']
  },
  // Highcharts 无障碍描述
  {
    hits: [
      ['Bar chart with 3 bars.', '包含 3 个柱的柱状图。'],
      ['Line chart with 1 line.', '包含 1 条线的折线图。'],
      ['Chart with 2 data series.', '包含 2 个数据系列的图表。']
    ],
    misses: ['Bar chart with bars.']
  },
  {
    hits: [
      ['The chart has 1 Y axis displaying Count of items. Data ranges from 0 to 12.', '图表有 1 条显示项计数的 Y 轴。数据范围从 0 到 12。'],
      [
        'The chart has 1 X axis displaying Date. Data ranges from 2026-07-26 00:00:00 to 2026-10-26 00:00:00.',
        '图表有 1 条显示日期的 X 轴。数据范围从 2026-07-26 00:00:00 到 2026-10-26 00:00:00。'
      ],
      ['The chart has 1 X axis displaying Status. Data range: 4 categories.', '图表有 1 条显示状态的 X 轴。数据范围：4 个类别。'],
      ['The chart has 1 X axis displaying Date. Data range: 92 days.', '图表有 1 条显示日期的 X 轴。数据范围：92 天。'],
      ['The chart has 1 Y axis displaying Story points.', '图表有 1 条显示 Story points 的 Y 轴。']
    ],
    misses: ['The chart has 2 X axes displaying Date.']
  },
  {
    hits: [
      ['View as data table, Burn up', '以数据表查看，燃起图'],
      ['View as data table, Velocity', '以数据表查看，Velocity']
    ],
    misses: ['View as data table']
  },
  {
    hits: [
      ['Toggle series visibility, Status chart', '切换数据系列显示，状态图表'],
      ['Toggle series visibility, Velocity', '切换数据系列显示，Velocity']
    ],
    misses: ['Toggle series visibility']
  },
  // 新建项目与导入
  { hits: [['12 results', '12 个结果']], misses: ['Many results'] },
  {
    hits: [
      ['The most recent 500 items will be added to the project', '将把最近的 500 个项添加到项目'],
      ['The most recent 500 items and their sub-issues will be added to the project', '将把最近的 500 个项及其子议题添加到项目']
    ],
    misses: ['The most recent items will be added to the project']
  },
  {
    hits: [
      ['12 items will be added', '将添加 12 个项'],
      ['1 item and its sub-issues will be added', '将添加 1 个项及其子议题']
    ],
    misses: ['Items will be added']
  },
  // 项目列表
  {
    hits: [
      ['All, Project type', '全部，项目类型'],
      ['Templates, Project type', '模板，项目类型']
    ],
    misses: ['Projects, Project type']
  },
  { hits: [['#12 updated', '#12 更新于']], misses: ['#12'] },
  {
    hits: [
      ['1,234 projects', '1,234 个项目'],
      ['1 project', '1 个项目']
    ],
    misses: ['Many projects']
  },
  {
    hits: [
      ['3 templates', '3 个模板'],
      ['1 template', '1 个模板']
    ],
    misses: ['Many templates']
  },
  // 组织项目列表的「最近查看」：列表标题（计数）、读屏标题
  {
    hits: [
      ['4 recently viewed', '最近查看的 4 个'],
      ['1,024 recently viewed', '最近查看的 1,024 个']
    ],
    misses: ['recently viewed', 'Many recently viewed']
  },
  {
    hits: [['setube-organization recently viewed projects', 'setube-organization 中最近查看的项目']],
    misses: ['recently viewed projects', 'My recently viewed projects list']
  },
  {
    hits: [
      ['No projects matched your search', '没有匹配的项目'],
      ['No project templates matched your search', '没有匹配的项目模板']
    ],
    misses: ['No issues matched your search']
  },
  {
    hits: [['Try a different search term or clear the search to see all projects.', '换个搜索词或清除搜索以查看所有项目。']],
    misses: ['Try a different search term or clear the search to see all issues.']
  },
  {
    hits: [
      ['No projects matched “roadmap”', '没有与“roadmap”匹配的项目'],
      ['No templates matched “bug”', '没有与“bug”匹配的模板']
    ],
    misses: ['No issues matched “roadmap”']
  },
  {
    hits: [
      ['No templates matched', '没有匹配的模板'],
      ['No projects matched', '没有匹配的项目']
    ],
    misses: ['No issues matched']
  },
  { hits: [['No templates found', '未找到模板']], misses: ['No issues found'] },
  {
    hits: [
      ['No templates are available to link.', '没有可链接的模板。'],
      ['No projects are available to link.', '没有可链接的项目。']
    ],
    misses: ['No projects are available.']
  },
  {
    hits: [["Couldn't unlink Roadmap. Please try again.", '无法取消链接 Roadmap。请重试。']],
    misses: ["Couldn't unlink Roadmap."]
  },
  {
    hits: [['3 open and 2 closed projects found.', '找到 3 个打开和 2 个已关闭的项目。']],
    misses: ['3 open projects found.']
  },
  // 团队项目页：团队协作者权限对话框
  {
    hits: [
      [
        'This team currently has no access permissions on this project. To provide access to the project, the team "Core team" will be added as a collaborator with read permissions.',
        '此团队目前没有此项目的访问权限。团队“Core team”将被添加为具有读取权限的协作者，以便访问此项目。'
      ]
    ],
    misses: ['This team currently has no access permissions on this project.']
  },
  {
    hits: [
      [
        'This team currently has access permissions to this project. If this project is removed, "Core team" access will be revoked and the team will no longer be able to access the project.',
        '此团队目前拥有此项目的访问权限。移除此项目后，“Core team”的访问权限将被撤销，团队将无法再访问此项目。'
      ]
    ],
    misses: ['This team currently has access permissions to this project.']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('projects 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Showing ', '25', ' of ', '120'].join('')))).toBe('显示 120 个中的 25 个')
    expect(
      translate(
        normalizeText(['Using the ', 'last-updated', ' operator means that your workflow will run every ', '4', ' ', 'hours'].join(''))
      )
    ).toBe('使用 last-updated 运算符时工作流每 4 小时运行一次')
    expect(translate(normalizeText(['Showing ', '25', ' most recent items'].join('')))).toBe('显示最近 25 个项')
    expect(translate(normalizeText(['React with ', '👍', ' (', '3', ' ', '👍', ' reactions so far)'].join('')))).toBe(
      '添加 👍 反应（已有 3 个）'
    )
    expect(translate(normalizeText(['Item added to project', ': ', 'Active'].join('')))).toBe('项已添加到项目：已启用')
    expect(translate(normalizeText(['Estimate', ': ', '0'].join('')))).toBe('估算：0')
  })

  it('被元素隔开的片段单独命中', () => {
    expect(translate('This project was created with the')).toBe('此项目基于')
    expect(translate('template.')).toBe('模板创建。')
    expect(translate('Changes saved. Return to')).toBe('更改已保存。返回')
    expect(translate('Change the order in which')).toBe('更改')
    expect(translate('appear on project items and in field lists.')).toBe('在项目项和字段列表中的显示顺序。')
  })
})

describe('projects 静态词条', () => {
  it.each([
    ['New view', '新建视图'],
    ['Project settings', '项目设置'],
    ['Delete project', '删除项目'],
    ['Custom fields', '自定义字段'],
    ['Burn up', '燃起图'],
    ['Team planning', '团队规划'],
    ['Repository projects', '存储库项目'],
    ['Search or add items', '搜索或添加项'],
    ['Save and turn on workflow', '保存并开启工作流'],
    [
      'Everyone on the internet has read access to this project. You choose who has write and admin access.',
      '互联网上的所有人都拥有此项目的读取访问权限。由你决定谁拥有写入和管理访问权限。'
    ],
    ['Change the order in which fields appear on project items and in field lists.', '更改字段在项目项和字段列表中的显示顺序。'],
    ['Creating project...', '正在创建项目...'],
    ['Creating project…', '正在创建项目…'],
    ['Visualize the status of your project and limit work in progress', '直观呈现项目状态并限制进行中的工作量'],
    ['Issue fields can only be edited in the', '议题字段只能在以下位置编辑'],
    // 无链接时三个相邻文本节点拼成整句
    ["Issue fields can only be edited in the project owner's settings.", '议题字段只能在项目所有者的设置中编辑。'],
    ['Filter for items that are blocked by other items', '筛选被其他项阻止的项'],
    ['Filter for items that are blocking other items', '筛选阻止其他项的项'],
    ['Filter by item closed reason', '按项的关闭原因筛选'],
    ['Issue items with a linked pull request', '链接了拉取请求的议题项'],
    // 分组名原文没有引号，译文也不加
    ['Drafts can’t be added with a milestone. Item was added to No milestone group', '草稿无法设置里程碑。项已添加到无里程碑分组'],
    // write access → 写入访问权限；原文没有逗号，改语序代替
    [
      "You can't edit this item because it belongs to a repository that you don't have write-access to.",
      '需要此项所属存储库的写入访问权限才能编辑。'
    ],
    ["You can't edit this field because this repository is archived", '无法编辑已存档存储库中的字段'],
    [
      'Publishing this configuration will make it the default for everyone viewing the project.',
      '发布此配置会使其成为所有查看此项目的人的默认设置。'
    ],
    // 引号内是筛选语法的取值，保留英文；原文的 or 列举不加逗号
    [
      'Filter for "issues" or "pull requests", or items that are "open", "closed", "merged", or "draft"',
      '筛选“issues”或“pull requests”，或状态为“open”“closed”“merged”或“draft”的项'
    ],
    // 原文是几句，译文也分几句（句号不改成逗号）
    ['Once you delete a project, there is no going back. Please be certain.', '项目删除后无法恢复。请谨慎操作。'],
    [
      'The Burn up chart shows the progress of your project items over time, showing how much work has been completed and how much is left to do. Use this chart to view progress, spot trends, and identify bottlenecks to help move the project forward.',
      '燃起图展示项目项随时间的进度，包括已完成和剩余的工作量。可用于查看进度、发现趋势和识别瓶颈以推进项目。'
    ],
    // 产品名、方案名按用户要求译成中文（product-names.md）
    ['Historical insights (Team or Enterprise plans only)', '历史洞察（仅限团队版或企业版计划）'],
    // 组织 / 用户项目列表（Rails）：介绍区、空状态、搜索、模板视图
    ['Welcome to Projects', '欢迎使用项目'],
    ['Welcome to projects', '欢迎使用项目'],
    [
      'Built to be flexible and adaptable, Projects gives you a live canvas to filter, sort, and group issues and pull requests in a table, board, or roadmap. Tailor them to your needs with custom fields, saved views, workflows, and insights.',
      '项目灵活且适应性强，为你提供实时画布，可在表格、看板或路线图中筛选、排序和分组议题与拉取请求。可使用自定义字段、已保存的视图、工作流和洞察按需定制。'
    ],
    ['Learn more about projects', '了解项目'],
    ["You don't have any projects yet.", '你还没有任何项目。'],
    ['There are no projects matching your search.', '没有与搜索匹配的项目。'],
    ['Clear current search query and sorts', '清除当前搜索查询和排序'],
    ['New template', '新建模板'],
    // 存储库项目页（Rails 版）：空状态与链接项目
    ['No open project templates', '没有打开的项目模板'],
    ['Provide quick access to relevant projects.', '快速访问相关项目。'],
    ['Add projects to view them here.', '项目添加后会显示在这里。'],
    ["This repository doesn't have any projects yet", '此存储库还没有任何项目'],
    ['Link projects', '链接项目'],
    ['Link a project to this repository', '将项目链接到此存储库']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  New view \n', SCOPE)).toBe('  新建视图 \n')
  })
})

describe('projects 页面词条', () => {
  it.each([
    ['Board', '看板'],
    ['Table', '表格'],
    ['Todo', '待办'],
    ['In Progress', '正在进行'],
    ['Done', '已完成'],
    ['Recently viewed', '最近查看'],
    ['Item closed', '项已关闭'],
    ['Changes requested', '已请求更改'],
    ['Not planned', '未计划'],
    ['Sort ascending', '升序排序'],
    ['Danger zone', '危险区域'],
    ['Unavailable for iterations', '不适用于迭代'],
    ['@me, Signed-in user', '@me，已登录用户'],
    ['On track', '进展顺利'],
    ['Complete', '已完成'],
    ['Pages', '页面'],
    ['Milestones', '里程碑'],
    ['Preview', '预览'],
    ['Expand sidebar', '展开侧栏'],
    ['Filter by repository', '按存储库筛选'],
    ['Green checkmark', '绿色对勾'],
    ['Dash', '横线'],
    ['Blocked by', '被阻止'],
    ['Blocking', '阻止'],
    ['Closed as completed issue', '以已完成关闭的议题'],
    ['Items that were closed as not planned', '以未计划关闭的项'],
    ['Transfer issue', '转移议题'],
    ['milestone in the', '里程碑于'],
    ['Add items from', '从以下存储库添加项'],
    ['7 or more days ago', '7天前或更早'],
    ['Past 30 days', '过去 30 天'],
    ['Last 7 days', '最近 7 天'],
    ['3 months', '3 个月'],
    ['Jan', '1 月'],
    ['Dec', '12 月'],
    // 工作流编辑器的操作块说明：覆盖 common-ui 的全局译文，避免“筛选项”读作名词
    ['Filter items', '筛选项目项'],
    // Interaction(s) count → 交互数
    ['Interactions count', '交互数'],
    ['Interaction count', '交互数'],
    // 产品名按用户要求译成中文（product-names.md）：Copilot Chat → Copilot 聊天
    ['Unable to load Copilot Chat. Ensure Copilot is enabled.', '无法加载 Copilot 聊天。请确认已启用 Copilot。'],
    // 看板拖动的读屏说明：原文三句，译文也是三句
    [
      'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.',
      '按空格键拿起可拖动的项。拖动时用方向键移动项。再按空格键将项放到新位置，或按 Esc 取消。'
    ],
    // 日期选择器说明：原文 like 前没有逗号，译文改语序不加（与 commits/date-picker.ts 同译）
    [
      'Use arrow keys to select a date, or type a date like "Dec 28, 2020" or "12/28/2020".',
      '用方向键选择日期，或输入如“Dec 28, 2020”或“12/28/2020”的日期。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it.each(['Select repository', 'Select a repository', 'Spammy', 'Filter', 'Filters', 'Clear filter', 'Write'])(
    '%s 由 common-ui 的全局词条统一翻译，projects 不收 scoped 副本',
    key => {
      expect(dict.scoped?.[key]).toBeUndefined()
      expect(dict.static?.[key]).toBeUndefined()
    }
  )

  it('产品名 GitHub Projects 按 product-names.md 译出，仅项目页生效', () => {
    expect(dict.scoped?.['GitHub Projects']).toBe('GitHub 项目')
    expect(translate('GitHub Projects')).toBe('GitHub 项目')
    expect(matcher.translate('GitHub Projects', ['common', 'repository'])).toBeUndefined()
  })

  it('删除项目对话框草稿问题句的片段：不构成行内句时拼成同一句', () => {
    expect(translate('This will also delete')).toBe('这还将删除在此项目中创建的')
    expect(translate('that were created in this project.')).toBe('。')
    expect(translate('that was created in this project.')).toBe('。')
  })

  it('与问题视图共用的词条不在 projects 的 static 中重复收录', () => {
    for (const key of ['Duplicate view', 'Save changes to new view', 'Delete view', 'Visible fields', 'Loading board']) {
      expect(dict.static?.[key]).toBeUndefined()
    }
  })

  it('与 common-ui 的全局词条同译的不收 scoped 副本，项目页照常翻译', () => {
    for (const [key, expected] of [
      ['Edit value', '编辑值'],
      ['Closed as not planned issue', '以未计划关闭的议题']
    ] as const) {
      expect(dict.scoped?.[key]).toBeUndefined()
      expect(bundleMatcher.translate(key, SCOPE)).toBe(expected)
    }
    // 状态图标的其余 aria-label 仍按页面收录；「, blocked」正则照常取全部状态
    expect(dict.scoped?.['Open issue']).toBe('打开的议题')
    expect(translate('Closed as not planned issue, blocked')).toBe('以未计划关闭的议题，被阻止')
  })

  it('用户与存储库的项目页同样生效', () => {
    expect(matcher.translate('Board', ['common', 'profile', 'projects'])).toBe('看板')
    expect(matcher.translate('Board', ['common', 'repository', 'projects'])).toBe('看板')
    expect(matcher.translate('Milestones', ['common', 'repository', 'projects'])).toBe('里程碑')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Board', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('12 cards', ['common', 'issues'])).toBeUndefined()
    expect(matcher.translate('Sort ascending', ['common', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Dash', ['common', 'repository'])).toBeUndefined()
  })

  it('侧边面板操作列表的 aria-label Actions 译“操作”（产品名 Actions 按用户要求同译，不再冲突）', () => {
    expect(dict.scoped?.Actions).toBe('操作')
    expect(translate('Actions')).toBe('操作')
    expect(matcher.translate('Actions', ['common', 'repository', 'projects'])).toBe('操作')
  })

  it('存储库项目页（Rails 版）：空状态按钮与行菜单仅项目页生效；Remove project 是取消链接，译“移除项目”', () => {
    const repoProjects: readonly PageKey[] = ['common', 'repository', 'projects']
    expect(dict.scoped?.['Create a project']).toBe('创建项目')
    expect(dict.scoped?.['Remove project']).toBe('移除项目')
    expect(matcher.translate('Create a project', repoProjects)).toBe('创建项目')
    expect(matcher.translate('Remove project', repoProjects)).toBe('移除项目')
    expect(matcher.translate('Create a project', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Remove project', ['common', 'repository', 'issues'])).toBeUndefined()
  })
})

describe('projects 项目列表（繁体）', () => {
  const tw = createMatcher(zhTW)

  it.each([
    ['Welcome to Projects', '歡迎使用專案'],
    [
      'Built to be flexible and adaptable, Projects gives you a live canvas to filter, sort, and group issues and pull requests in a table, board, or roadmap. Tailor them to your needs with custom fields, saved views, workflows, and insights.',
      '專案靈活且適應性強，為你提供即時畫布，可在表格、看板或藍圖中篩選、排序並分組議題和拉取請求。可使用自訂欄位、已儲存的檢視、工作流程和洞察依需求量身打造。'
    ],
    [
      'Built like a spreadsheet, project tables give you a live canvas to filter, sort, and group issues and pull requests. Tailor them to your needs with custom fields and saved views.',
      '專案表格就像試算表，為你提供即時畫布，可篩選、排序並分組議題和拉取請求。還能透過自訂欄位和已儲存的檢視，依需求調整表格。'
    ],
    ['Learn more about projects', '瞭解專案'],
    ["You don't have any projects yet.", '你還沒有任何專案。'],
    ['There are no projects matching your search.', '沒有與搜尋相符的專案。'],
    ['New template', '新增範本'],
    ['No open project templates', '沒有開放中的專案範本'],
    ['Link a project to this repository', '將專案連結到此儲存庫'],
    ['Create a project', '建立專案'],
    ['Remove project', '移除專案']
  ])('%s → %s', (input, expected) => {
    expect(tw.translate(input, SCOPE)).toBe(expected)
  })

  it('Create a project、Remove project 仅项目页生效', () => {
    expect(tw.translate('Create a project', ['common', 'repository'])).toBeUndefined()
    expect(tw.translate('Remove project', ['common', 'repository', 'issues'])).toBeUndefined()
  })

  it('Edit value、Closed as not planned issue 由 common-ui 的全局词条翻译', () => {
    expect(tw.translate('Edit value', SCOPE)).toBe('編輯值')
    expect(tw.translate('Closed as not planned issue', SCOPE)).toBe('已關閉並標示為不予處理的議題')
  })
})

describe('projects 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('查询框高亮层由全局忽略规则处理，不在 projects 中重复收录', () => {
    for (const selector of ['.styled-input-content', '.QueryBuilder-StyledInputContent']) {
      expect(IGNORE_SELECTORS).toContain(selector)
      expect(dict.ignore).not.toContain(selector)
    }
  })

  it('卡片上的问题标签名由全局忽略规则处理（标签按钮 aria-label、单选值不被忽略），不在 projects 中重复收录', () => {
    const labelSelector = '[class*="prc-Token-IssueLabel-"] [class*="prc-Token-TokenTextContainer-"]'
    expect(IGNORE_SELECTORS).toContain(labelSelector)
    expect((dict.ignore ?? []).some(selector => selector.includes('prc-Token-IssueLabel-'))).toBe(false)
    document.body.innerHTML = `
      <projects-v2 id="memex-root">
        <ul aria-label="Fields">
          <li><button class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM" aria-label="Label: Preview">
            <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">Preview</span></span>
          </button></li>
          <li><span class="prc-Token-TokenBase-te5-F SingleSelectToken__WYEe_H">
            <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">Done</span></span>
          </span></li>
        </ul>
      </projects-v2>`
    const textElement = (text: string): Element | undefined =>
      [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
    expect(textElement('Preview')?.closest(labelSelector)).not.toBeNull()
    expect(textElement('Done')?.closest(labelSelector)).toBeNull()
    expect(document.querySelector('[aria-label="Label: Preview"]')?.closest(labelSelector)).toBeNull()
  })

  it('项目标题（顶栏、详细信息侧栏）、视图名称、项标题与项目描述被忽略，顶栏路由标题等界面文字不被忽略', () => {
    document.body.innerHTML = `
      <projects-v2 id="memex-root">
        <div class="topBar__a1b2"><h1 class="SanitizedHtml__Z-fMho prc-Text-Text-9mHv3">Q4 Roadmap</h1><button>Project details</button></div>
        <div class="topBar__a1b2"><h1 class="Heading__cYvq9z prc-Heading-Heading-6CmGO">Workflows</h1></div>
        <h2 class="prc-Text-Text-9mHv3 infoPanelTitle__Cz6Xqx">Sprint planning</h2>
        <a class="tabNavLink__q7r8" title="Team items" href="/orgs/acme/projects/1/views/3"><span>Team items</span></a>
        <div class="viewNameText__c3d4">Sprint board</div>
        <div class="titleCell__e5f6"><a href="/acme/app/issues/1">Fix login bug</a></div>
        <div class="titleCell__e5f6"><span class="TextCell__g7h8">Draft idea</span></div>
        <h3 id="board-card-title-12">Board card title</h3>
        <div class="RoadmapCell__i9j0"><span class="SanitizedHtml__k1l2">Roadmap item title</span></div>
        <div class="titleHeading__m3n4"><bdi>Side panel title</bdi></div>
        <button>New view</button>
      </projects-v2>
      <p class="projectDescription__o5p6">Team planning board</p>
      <div id="memexes-results">
        <a id="project_42" href="/orgs/acme/projects/42">Platform roadmap</a>
        <span class="text-normal">Shared roadmap</span>
        <span class="color-fg-muted">Updated</span>
      </div>`
    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('Q4 Roadmap')).toBe(true)
    expect(ignored('Sprint planning')).toBe(true)
    expect(ignored('Team items')).toBe(true)
    expect(ignored('Sprint board')).toBe(true)
    expect(ignored('Fix login bug')).toBe(true)
    expect(ignored('Draft idea')).toBe(true)
    expect(ignored('Board card title')).toBe(true)
    expect(ignored('Roadmap item title')).toBe(true)
    expect(ignored('Side panel title')).toBe(true)
    expect(ignored('Team planning board')).toBe(true)
    expect(ignored('Platform roadmap')).toBe(true)
    expect(ignored('Shared roadmap')).toBe(true)
    expect(ignored('Project details')).toBe(false)
    expect(ignored('Workflows')).toBe(false)
    expect(ignored('New view')).toBe(false)
    expect(ignored('Updated')).toBe(false)
  })

  it('看板卡片的存储库名（含草稿拉取请求）与虚拟化 aria-label、筛选框镜像被忽略，草稿问题与隐藏项的头部、单选值、标签 aria-label、输入框、筛选框外的 aria-hidden 文本不被忽略', () => {
    document.body.innerHTML = `
      <projects-v2 id="memex-root">
        <div class="board-view-column-card CardBase__x1" role="button"
          aria-label="Fix login bug [GA] octo-org/hello-world#1250"></div>
        <div class="board-view-column-card CardBase__x1" role="button" data-hovercard-subject-tag="issue:101"
          aria-labelledby="board-card-title-1 board-card-header-icon-1 board-card-header-title-1">
          <div id="board-card-header-icon-1"><svg aria-label="Open issue" role="img"></svg></div>
          <div id="board-card-header-title-1"><span>hello-world #1025</span></div>
          <ul aria-label="Fields"><li><span>Todo</span></li>
            <li><button class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM" aria-label="Label: Preview">
              <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">Preview</span></span>
            </button></li>
            <li><span class="prc-Token-TokenBase-te5-F SingleSelectToken__WYEe_H">
              <span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">Done</span></span>
            </span></li>
          </ul>
          <span class="sr-only">Click a value to filter the view</span>
        </div>
        <div class="board-view-column-card CardBase__x1" role="button" data-hovercard-subject-tag="pull_request:202"
          aria-labelledby="board-card-title-4 board-card-header-icon-4">
          <div id="board-card-header-icon-4"><svg aria-label="Draft pull request" role="img"></svg></div>
          <div id="board-card-header-title-4"><span>hello-world #61</span></div>
        </div>
        <div class="board-view-column-card CardBase__x1" role="button"
          aria-labelledby="board-card-title-2 board-card-header-icon-2">
          <div id="board-card-header-title-2"><span>Draft</span></div>
        </div>
        <div class="board-view-column-card isRedacted__28JHL3" role="button"
          aria-labelledby="board-card-title-3 board-card-header-icon-3 board-card-header-title-3">
          <div id="board-card-header-title-3"><div></div><h3 class="sr-only">Access prohibited</h3></div>
        </div>
        <div class="styled-input-container" tabindex="-1">
          <div aria-hidden="true" class="styled-input-content"><span>has</span></div>
          <div class="Box_2__oyay5f">
            <div aria-hidden="true" class="Box_3__EZ1k1_"><span>is:open has:status</span><span></span></div>
            <input id="filter-bar-component-input" placeholder="Filter by keyword or by field" />
          </div>
        </div>
        <div class="columnHeader__a1"><span aria-hidden="true">Estimate: 3</span></div>
      </projects-v2>`
    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    const virtualized = document.querySelector('[aria-label="Fix login bug [GA] octo-org/hello-world#1250"]')
    expect(virtualized?.closest(selector)).not.toBeNull()
    expect(ignored('hello-world #1025')).toBe(true)
    expect(ignored('hello-world #61')).toBe(true)
    expect(ignored('has')).toBe(true)
    expect(ignored('is:open has:status')).toBe(true)
    expect(ignored('Todo')).toBe(false)
    expect(ignored('Done')).toBe(false)
    expect(ignored('Click a value to filter the view')).toBe(false)
    expect(ignored('Draft')).toBe(false)
    expect(ignored('Access prohibited')).toBe(false)
    expect(ignored('Estimate: 3')).toBe(false)
    expect(document.querySelector('[aria-label="Fields"]')?.closest(selector)).toBeNull()
    expect(document.querySelector('[aria-label="Label: Preview"]')?.closest(selector)).toBeNull()
    expect(document.querySelector('[aria-label="Open issue"]')?.closest(selector)).toBeNull()
    expect(document.querySelector('[aria-label="Draft pull request"]')?.closest(selector)).toBeNull()
    expect(document.querySelector('#filter-bar-component-input')?.closest(selector)).toBeNull()
  })
})

/** 拖入里程碑分组的提示框（get-group-update-validation.tsx 的 createMilestoneTransferDialogContent，宿主是 AlertDialog 正文） */
const MILESTONE_DIALOG =
  '<div role="alertdialog" aria-labelledby="dialog-title"><h1 id="dialog-title">New milestone required</h1>' +
  '<div class="Box_a1b2c3" id="body">Please create the <code>v1.0</code> milestone in the ' +
  '<a href="/octo-org/hello-world/milestones">octo-org/hello-world</a> repository before adding to this milestone group.</div>' +
  '<button type="button">OK</button></div>'

/** 拖入问题类型分组的提示框（createIssueTypeTransferDialogContent） */
const ISSUE_TYPE_DIALOG =
  '<div class="Box_a1b2c3" id="body">There is no <code>Bug</code> issue type in the <a href="/octo-org">octo-org</a> organization.</div>'

/** 拖入存储库分组的提示框（createIssueTransferDialogContent），链接前是 &nbsp; */
const TRANSFER_DIALOG =
  '<div class="Box_a1b2c3"><div id="body">You can transfer this issue to a different repository from the&nbsp;' +
  '<a target="_blank" href="https://github.com/octo-org/hello-world/issues/12">issue page</a>.</div></div>'

/** 删除项目对话框（delete-project-dialog.tsx）：加粗文字是 Primer Text 渲染的 span */
const DELETE_PROJECT_DIALOG =
  '<div role="alertdialog"><p id="warning">This action <span class="prc-Text-Text-9mHv3">cannot</span> be undone. This will permanently delete the ' +
  '<span class="prc-Text-Text-9mHv3">Q4 Roadmap</span> project, saved views, custom fields and associated values, and Insights data.</p>' +
  '<p id="drafts">This will also delete <span class="prc-Text-Text-9mHv3">3 draft issues</span> that were created in this project.</p>' +
  '<p id="keep">This will not delete issues or pull requests themselves.</p>' +
  '<label id="confirm" for="confirm-delete-input" class="d-block mb-2 text-normal">Please type <span class="prc-Text-Text-9mHv3">Q4 Roadmap</span> to confirm.</label>' +
  '<input id="confirm-delete-input" type="text"></div>'

/** 删除字段对话框（delete-field-dialog.tsx）：受影响的项数、工作流数是 strong */
const DELETE_FIELD_DIALOG =
  '<div role="alertdialog"><p id="body">This will delete the field “Sprint” and remove its data from <strong>3 items</strong> and <strong>2 workflows</strong>.</p>' +
  '<p><span id="question">Permanently delete data from this project?</span></p></div>'

/** 路线图表头的迭代标记按钮（roadmap-header.tsx）：读屏文本里右括号是独立文本节点 */
const ROADMAP_MARKER =
  '<button type="button" aria-label="Sprint 3"><span>Sprint 3</span>' +
  '<span id="sr" class="sr-only">(Starting on <time datetime="2026-10-26T00:00:00Z">Oct 26, 2026</time>)</span></button>' +
  '<a id="milestone" href="/octo-org/hello-world/milestone/1">v1.0<span class="sr-only">(Due on <time datetime="2026-11-06T00:00:00Z">Nov 6, 2026</time>)</span></a>'

describe('projects 被元素拆开的句子（DOM）', () => {
  let translator: Translator | undefined

  /** 用完整语言包按组织项目页的页面类型翻译 html；prepare 可在翻译前拆分文本节点（模拟 React 渲染的相邻文本节点） */
  function render(html: string, prepare?: (body: HTMLElement) => void): HTMLElement {
    document.body.innerHTML = html
    prepare?.(document.body)
    translator = createTranslator({ matcher: bundleMatcher, host: window, resolvePages: () => SCOPE })
    translator.start()
    return document.body
  }

  function text(id: string): string {
    return document.getElementById(id)?.textContent ?? ''
  }

  /** 元素的直接子文本节点 */
  function ownTexts(element: Element | null): string[] {
    return [...(element?.childNodes ?? [])].filter(node => node.nodeType === Node.TEXT_NODE).map(node => (node as Text).data)
  }

  /** 按 React 的渲染方式把文本节点拆开：{' '} 与相邻文字是不同的文本节点 */
  function splitAfter(node: Node | null, ...lengths: number[]): void {
    let current = node as Text
    for (const length of lengths) current = current.splitText(length)
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('里程碑分组提示：<里程碑> milestone in the <存储库> repository 整句译出，语序调整、槽位不动', () => {
    render(MILESTONE_DIALOG, body => {
      // React 渲染：["Please create the ", <code>, "milestone in the", " ", <a>, " repository before adding to this milestone group."]
      const host = body.querySelector('#body')!
      splitAfter(host.childNodes[2]!, 'milestone in the'.length)
    })
    expect(text('body')).toBe('v1.0 里程碑需先在 octo-org/hello-world 存储库中创建才能添加到此里程碑分组。')
    expect(ownTexts(document.getElementById('body'))).toEqual(['', ' 里程碑需先在 ', '', ' 存储库中创建才能添加到此里程碑分组。'])
    expect(document.querySelector('#body code')?.textContent).toBe('v1.0')
    expect(document.querySelector('#body a')?.textContent).toBe('octo-org/hello-world')
    expect(text('dialog-title')).toBe('需要新里程碑')
  })

  it('问题类型分组提示：There is no <类型> issue type in the <组织> organization. 整句译出', () => {
    render(ISSUE_TYPE_DIALOG)
    expect(text('body')).toBe('Bug 议题类型在 octo-org 组织中不存在。')
    expect(document.querySelector('#body code')?.textContent).toBe('Bug')
  })

  it('存储库分组提示：链接前的 &nbsp; 不影响匹配，链接文字 issue page 照常翻译', () => {
    render(TRANSFER_DIALOG)
    expect(text('body')).toBe('可从议题页面将此议题转移到其他存储库。')
    expect(document.querySelector('#body a')?.textContent).toBe('议题页面')
  })

  it('整句不再构成行内句时按片段翻译：提示框里只有一个槽位', () => {
    render('<div class="Box_a1b2c3" id="body">There is no <code>Bug</code> issue type in the octo-org organization.</div>')
    // 句型不命中；首段按 scoped 片段“不存在”翻译
    expect(ownTexts(document.getElementById('body'))[0]).toBe('不存在 ')
  })

  it('添加项建议列表的批量添加行：槽位后没有文本节点，按 scoped 片段翻译', () => {
    render('<span class="Text_a1b2" id="row">Add items from <span class="Text_1_c3d4">octo-org/hello-world</span></span>')
    expect(text('row')).toBe('从以下存储库添加项 octo-org/hello-world')
  })

  it('侧边面板没有存储库建议：Create a <repository> to get started. 整句译出，链接文字照常翻译', () => {
    render('<p class="Octicon_a1b2" id="empty">Create a <a href="/orgs/octo-org/repositories">repository</a> to get started.</p>', body => {
      // React 渲染：["Create a", " ", <a>, " ", "to get started."]
      const host = body.querySelector('#empty')!
      splitAfter(host.firstChild, 'Create a'.length)
      splitAfter(host.lastChild, 1)
    })
    expect(text('empty')).toBe('创建存储库以开始使用。')
    expect(document.querySelector('#empty a')?.textContent).toBe('存储库')
  })

  it('批量添加的模式切换：Add from a <search query> instead 整句译出', () => {
    render(
      '<p class="ModeToggleLink_a1b2" id="toggle">Add from a <button type="button" class="prc-Link-Link-9ZwDx">search query </button> instead</p>'
    )
    expect(text('toggle').replace(/\s+/g, '')).toBe('改为从搜索查询添加')
    expect(ownTexts(document.getElementById('toggle'))).toEqual(['改为从', '添加'])
  })

  it('删除项目对话框：cannot、项目名、草稿问题数三处槽位的整句分别译出', () => {
    render(DELETE_PROJECT_DIALOG)
    expect(text('warning')).toBe('此操作无法撤销。这将永久删除 Q4 Roadmap 项目及其保存的视图、自定义字段及相关值和洞察数据。')
    expect(text('drafts')).toBe('这还将删除在此项目中创建的 3 个草稿议题。')
    expect(text('keep')).toBe('议题和拉取请求本身不会被删除。')
    expect(text('confirm')).toBe('请输入 Q4 Roadmap 以确认。')
    expect([...document.querySelectorAll('#warning span, #confirm span')].map(span => span.textContent)).toEqual([
      '无法',
      'Q4 Roadmap',
      'Q4 Roadmap'
    ])
  })

  it('删除项目对话框：项目名照原文显示（须照原文输入才能确认），默认标题也不翻译', () => {
    const name = "@octocat's untitled project"
    render(DELETE_PROJECT_DIALOG.replaceAll('Q4 Roadmap', name))
    expect(text('warning')).toBe(`此操作无法撤销。这将永久删除 ${name} 项目及其保存的视图、自定义字段及相关值和洞察数据。`)
    expect(text('confirm')).toBe(`请输入 ${name} 以确认。`)
    expect(translate(name)).toBe('@octocat 的未命名项目')
  })

  it('删除项目对话框：只有 1 个草稿问题时用 was', () => {
    render(DELETE_PROJECT_DIALOG.replace('3 draft issues</span> that were', '1 draft issue</span> that was'))
    expect(text('drafts')).toBe('这还将删除在此项目中创建的 1 个草稿议题。')
  })

  it('删除项目对话框：停止后还原', () => {
    render(DELETE_PROJECT_DIALOG)
    translator?.stop()
    translator = undefined
    expect(text('drafts')).toBe('This will also delete 3 draft issues that were created in this project.')
    expect(text('confirm')).toBe('Please type Q4 Roadmap to confirm.')
  })

  it('删除字段对话框：受影响的项与工作流两个槽位整句译出；只有一个槽位时同样命中', () => {
    render(DELETE_FIELD_DIALOG)
    expect(text('body')).toBe('这将删除字段“Sprint”并从 3 个项和 2 个工作流中删除其数据。')
    expect(text('question')).toBe('永久删除此项目中的数据？')
    translator?.stop()
    render(DELETE_FIELD_DIALOG.replace(' and <strong>2 workflows</strong>', ''))
    expect(text('body')).toBe('这将删除字段“Sprint”并从 3 个项中删除其数据。')
    translator?.stop()
    render(DELETE_FIELD_DIALOG.replace('<strong>3 items</strong> and ', ''))
    expect(text('body')).toBe('这将删除字段“Sprint”并从 2 个工作流中删除其数据。')
  })

  it('字段设置页的问题字段说明：链接版整句译出，链接文字照常翻译', () => {
    render(
      '<span class="prc-FormControl-Caption-W_dJj" id="caption">Issue fields can only be edited in the ' +
        '<a href="/organizations/octo-org/settings/issue-fields">project owner\'s settings</a>.</span>'
    )
    expect(text('caption')).toBe('议题字段只能在项目所有者的设置中编辑。')
    expect(document.querySelector('#caption a')?.textContent).toBe('项目所有者的设置')
  })

  it('常规设置的模板区：created with the <模板> template、members of the <组织> organization 整句译出', () => {
    render(
      '<p id="created" class="Text_a1b2">This project was created with the&nbsp;<a target="_blank" href="/orgs/octo-org/projects/7"><span>Sample text</span></a>&nbsp;template.</p>' +
        '<p id="make-template-description">Make this project a template that can be used by members of the <b>octo-org</b> organization when creating new projects.</p>'
    )
    expect(text('created')).toBe('此项目基于 Sample text 模板创建。')
    expect(text('make-template-description')).toBe('将此项目设为模板供 octo-org 组织成员创建新项目时使用。')
  })

  it('经典项目迁移说明：<br> 也是槽位，已关闭与仍打开两种整句分别译出', () => {
    render(
      '<span id="closed">• <a target="_blank" href="/orgs/octo-org/projects/1">Your classic project</a> has been closed and is read-only.<br>• Users visiting the classic project will be linked to this one.</span>' +
        '<span id="open"><a target="_blank" href="/orgs/octo-org/projects/1">Your classic project</a> is still open, but future changes won\'t be synchronized.</span>'
    )
    expect(text('closed')).toBe('• 你的经典项目已关闭且为只读。• 访问经典项目的用户会被引导到此项目。')
    expect(text('open')).toBe('你的经典项目仍处于打开状态，但之后的更改不会同步。')
  })

  it('访问设置的可见范围说明：Only those with direct access and <owners> can see this project. 整句译出，链接文字照常翻译', () => {
    render(
      '<span class="Octicon_a1b2" id="privacy">Only those with direct access and <a class="prc-Link-Link-9ZwDx" target="_blank" rel="noopener noreferrer" ' +
        'href="https://github.com/orgs/octo-org/people?query=role%3Aowner">owners</a>can see this project. Owners are also admins of this project.</span>',
      body => {
        // React 渲染：["Only those with direct access and", " ", <a>, "can see this project. Owners are also admins of this project."]
        splitAfter(body.querySelector('#privacy')!.firstChild, 'Only those with direct access and'.length)
      }
    )
    expect(text('privacy')).toBe('只有拥有直接访问权限的人和所有者可以查看此项目。所有者也是此项目的管理员。')
    expect(document.querySelector('#privacy a')?.textContent).toBe('所有者')
    translator?.stop()
    translator = undefined
    expect(text('privacy')).toBe('Only those with direct access and ownerscan see this project. Owners are also admins of this project.')
  })

  it('路线图标记的读屏文本：(Starting on <time>) / (Due on <time>) 整句译出，括号改为全角', () => {
    render(ROADMAP_MARKER)
    expect(text('sr')).toBe('（开始于 2026年10月26日）')
    expect(document.querySelector('#milestone .sr-only')?.textContent).toBe('（截止于 2026年11月6日）')
    expect(document.querySelector('#milestone')?.firstChild?.textContent).toBe('v1.0')
  })

  it('路线图标记的读屏文本：停止后还原', () => {
    render(ROADMAP_MARKER)
    translator?.stop()
    translator = undefined
    expect(text('sr')).toBe('(Starting on Oct 26, 2026)')
  })
})

/** 项目详细信息侧栏（side-panel/content.tsx 的 SidePanelMemexInfoContent）：标题是用户起的项目名 */
function infoPanel(name: string): string {
  return (
    '<div class="infoPanelContainer__a1b2" data-testid="side-panel-info-content"><div class="infoPanelHeader__c3d4">' +
    `<h2 id="info-title" class="prc-Text-Text-9mHv3 infoPanelTitle__Cz6Xqx">${name}</h2></div>` +
    '<button type="button" id="info-edit" aria-label="Edit short description"></button></div>'
  )
}

/** 停靠版侧栏：#memex-root 内的 aside */
function dockedInfoPanel(name: string): string {
  return `<projects-v2 id="memex-root"><aside tabindex="-1" class="sidePanelPane__e5f6">${infoPanel(name)}</aside></projects-v2>`
}

/** 浮层版侧栏：Primer Overlay 渲染在门户根里，在 #memex-root 外 */
function overlayInfoPanel(name: string): string {
  return (
    '<projects-v2 id="memex-root"></projects-v2>' +
    `<div id="__primerPortalRoot__"><div role="dialog" class="prc-Overlay-Overlay-g7h8">${infoPanel(name)}</div></div>`
  )
}

/**
 * 顶栏（top-bar）：项目标题是 SanitizedHtml 渲染的 h1（memex-title.tsx）；
 * 项目设置、工作流、洞察、存档页的路由标题是 RouteTitle（Primer Heading 渲染的 h1）
 */
function topBar(heading: string): string {
  return (
    '<projects-v2 id="memex-root"><div role="navigation" aria-label="Project" class="topBar__uq_wTN"><div class="Box__a1b2">' +
    `<a aria-label="Return to project view" href="/orgs/octo-org/projects/1/views/1"></a>${heading}</div></div></projects-v2>`
  )
}

interface TitleLocale {
  readonly name: string
  /** 完整语言包 */
  readonly matcher: Matcher
  /** 侧栏按钮 Edit short description 的译文 */
  readonly editShortDescription: string
  /** 路由标题：[原文, 译文] */
  readonly routes: readonly (readonly [string, string])[]
}

const TITLE_LOCALES: readonly TitleLocale[] = [
  {
    name: 'zh-CN',
    matcher: bundleMatcher,
    editShortDescription: '编辑简短描述',
    routes: [
      ['Settings', '设置'],
      ['Workflows', '工作流'],
      ['Insights', '洞察'],
      ['Archive', '存档']
    ]
  },
  {
    name: 'zh-TW',
    matcher: createMatcher(zhTW),
    editShortDescription: '編輯簡短描述',
    routes: [
      ['Settings', '設定'],
      ['Workflows', '工作流程'],
      ['Insights', '洞察'],
      ['Archive', '封存']
    ]
  }
]

/** 用户起的项目名：与词条同形（Roadmap、Backlog）或命中默认标题正则 */
const PROJECT_NAMES = ['Roadmap', 'Backlog', "@octocat's untitled project"]

describe.each(TITLE_LOCALES)('projects 顶栏与详细信息侧栏的标题（DOM，$name）', locale => {
  let translator: Translator | undefined

  /** 用完整语言包按组织项目页的页面类型翻译 html */
  function render(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: locale.matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
  }

  function text(id: string): string | null | undefined {
    return document.getElementById(id)?.textContent
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it.each(PROJECT_NAMES)('详细信息侧栏（停靠版）：项目名 %s 保持原文，面板按钮照常翻译', name => {
    render(dockedInfoPanel(name))
    expect(text('info-title')).toBe(name)
    expect(document.getElementById('info-edit')?.getAttribute('aria-label')).toBe(locale.editShortDescription)
  })

  it.each(PROJECT_NAMES)('详细信息侧栏（浮层版，#memex-root 外）：项目名 %s 保持原文，面板按钮照常翻译', name => {
    render(overlayInfoPanel(name))
    expect(document.querySelector('#memex-root #info-title')).toBeNull()
    expect(text('info-title')).toBe(name)
    expect(document.getElementById('info-edit')?.getAttribute('aria-label')).toBe(locale.editShortDescription)
  })

  it.each(locale.routes)('顶栏：路由标题 %s 照常翻译为 %s', (source, target) => {
    render(topBar(`<h1 id="route" class="Heading__cYvq9z prc-Heading-Heading-6CmGO">${source}</h1>`))
    expect(text('route')).toBe(target)
  })

  it.each([...PROJECT_NAMES, 'Settings'])('顶栏：项目标题 %s 保持原文', name => {
    render(topBar(`<h1 id="title" class="SanitizedHtml__Z-fMho prc-Text-Text-9mHv3">${name}</h1>`))
    expect(text('title')).toBe(name)
  })
})
