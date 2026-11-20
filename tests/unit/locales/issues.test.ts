import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { IGNORE_SELECTORS } from '../../../src/core/ignore'
import { createMatcher, normalizeText, type Matcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { LocaleBundle, PageDictionary, PageKey } from '../../../src/core/types'
import issues from '../../../src/locales/zh-CN/issues'
import { LABEL_SUGGESTION_IGNORE } from '../../../src/locales/zh-CN/issues/filter'
import { labelName } from '../../../src/locales/zh-CN/issues/labels'
import { formatDate } from '../../../src/locales/zh-CN/helpers'
import { joinName } from '../../../src/locales/zh-CN/issues/list'
import pulls from '../../../src/locales/zh-CN/pulls'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { zhTW } from '../../../src/locales/zh-TW/index'
import { LABEL_SUGGESTION_IGNORE as TW_LABEL_SUGGESTION_IGNORE } from '../../../src/locales/zh-TW/issues/filter'
import { labelName as twLabelName } from '../../../src/locales/zh-TW/issues/labels'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = issues

const matcher = createMatcher([['issues', issues]])
/** 完整语言包：其他词典的全局 static 也生效 */
const bundleMatcher = createMatcher(zhCN)

/** 存储库问题页的作用域：common → repository → issues */
function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'repository', 'issues'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列（与合并顺序一致），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // viewer：头部
  { hits: [['Issue #123', '议题 #123']], misses: ['Issue #abc'] },
  {
    hits: [['Parent issue: Improve onboarding flow', '父议题：Improve onboarding flow']],
    misses: ['Parent issue Improve onboarding flow']
  },
  {
    hits: [
      ['Blocked by 3 issues', '被 3 个议题阻止'],
      ['Blocked by 1 issue', '被 1 个议题阻止']
    ],
    misses: ['Blocked by many issues']
  },
  {
    hits: [
      ['Blocked by issue Fix login bug', '被议题 Fix login bug 阻止'],
      // 标题以半角标点开头时同样与中文隔开
      ['Blocked by issue [Bug] Fix login', '被议题 [Bug] Fix login 阻止']
    ],
    misses: ['Blocked by issue']
  },
  {
    hits: [
      ['2 of 5 issues completed', '已完成 2/5 个议题'],
      ['0 of 1 issue completed', '已完成 0/1 个议题']
    ],
    misses: ['2 of 5 tasks completed']
  },
  { hits: [['Listed in 2 issues', '列于 2 个议题']], misses: ['Listed in many issues'] },
  {
    hits: [
      ['octocat is assigned', '已分配给 octocat'],
      ['copilot-swe-agent[bot] is assigned', '已分配给 copilot-swe-agent[bot]']
    ],
    misses: ['Mona Lisa is assigned']
  },
  { hits: [['Issue 3 of 12', '12 个议题中的第 3 个']], misses: ['Issue three of 12'] },
  { hits: [['Alert: #42', '警报：#42']], misses: ['Alert #42'] },
  {
    hits: [['Alert: Prototype pollution in lodash', '警报：Prototype pollution in lodash']],
    misses: ['Alert: ']
  },
  { hits: [['View pull request #77', '查看拉取请求 #77']], misses: ['View pull request #abc'] },
  { hits: [['Agents assigned by octocat', '由 octocat 分配的智能体']], misses: ['Agents assigned by Mona Lisa'] },
  // viewer：头部代理会话摘要
  {
    hits: [
      ['1 session running', '1 个会话运行中'],
      ['2 sessions needs input, 1 failed', '2 个会话需要输入，1 个失败'],
      ['3 sessions complete, 2 others', '3 个会话已完成，其他 2 个'],
      ['Agent sessions: 1 session needs input, 1 other', '智能体会话：1 个会话需要输入，其他 1 个']
    ],
    misses: ['1 session paused', '2 sessions running, 1 paused']
  },
  // viewer：关闭 / 状态
  { hits: [['Close as duplicate of #12', '以 #12 的重复项关闭']], misses: ['Close as duplicate of 12'] },
  {
    hits: [['Issue closed as a duplicate of #12', '议题已作为 #12 的重复项关闭']],
    misses: ['Issue closed as a duplicate']
  },
  {
    hits: [
      ['Mark as Done', '标记为已完成'],
      ['Mark as Not planned with comment', '标记为未计划并评论'],
      ['Mark as Duplicate of #12 with comment', '标记为 #12 的重复项并评论'],
      // 组织自定义的状态名原样保留，与中文之间留空格（表情符号开头的同样隔开）
      ['Mark as Shipped', '标记为 Shipped'],
      ['Mark as 🚢 Shipped', '标记为 🚢 Shipped']
    ],
    misses: ['Marked as Done']
  },
  {
    hits: [
      ['Status set to In progress', '状态已设为正在进行'],
      ['Status set to Duplicate of #12', '状态已设为 #12 的重复项'],
      ['Status set to Shipped', '状态已设为 Shipped']
    ],
    misses: ['Status set']
  },
  { hits: [['Could not set the status to Done', '无法将状态设为已完成']], misses: ['Could not set the status'] },
  {
    hits: [
      ['Status: Open', '状态：打开'],
      ['Status: Closed as not planned', '状态：已关闭为未计划'],
      ['Status: Shipped', '状态：Shipped']
    ],
    misses: ['Status: v1.2']
  },
  {
    hits: [['3/3 issues already pinned. Unpin an issue to pin this one.', '已置顶 3/3 个议题。请先取消置顶一个议题。']],
    misses: ['3/3 issues already pinned.']
  },
  // viewer：正文
  {
    hits: [['Create an issue with the title "Add dark mode"', '创建标题为“Add dark mode”的议题']],
    misses: ['Create an issue with the title']
  },
  {
    hits: [
      ["octocat's profile", 'octocat 的个人资料'],
      ["Copilot's profile", 'Copilot 的个人资料']
    ],
    // @octocat's profile 由通用词典处理
    misses: ["Mona Lisa's profile", "@octocat's profile"]
  },
  { hits: [['Open issue #12', '打开议题 #12']], misses: ['Open issue #'] },
  // viewer：活动排序
  {
    hits: [
      ['Sort comments: Oldest', '评论排序：最早'],
      ['Sort activity: Newest', '活动排序：最新']
    ],
    misses: ['Sort comments: Popular']
  },
  // viewer：代理建议
  {
    hits: [
      ['High confidence', '置信度高'],
      ['Low confidence', '置信度低']
    ],
    misses: ['Very high confidence']
  },
  { hits: [['3 suggestions approved', '已接受 3 条建议']], misses: ['Some suggestions approved'] },
  { hits: [['2 suggestions rejected', '已拒绝 2 条建议']], misses: ['Some suggestions rejected'] },
  {
    hits: [
      [
        'Pending label suggestions: bug, enhancement. High confidence. View details',
        '待处理的标签建议：bug, enhancement。置信度高。查看详细信息'
      ],
      ['Pending label suggestions: bug. View details', '待处理的标签建议：bug。查看详细信息']
    ],
    misses: ['Pending label suggestions: bug']
  },
  {
    hits: [
      ['Pending type suggestion: Bug. Medium confidence. View details', '待处理的类型建议：Bug。置信度中。查看详细信息'],
      ['Pending close suggestion. View details', '待处理的关闭建议。查看详细信息'],
      // 组织自定义的问题字段名保留原文，与中文之间留空格（表情符号开头的同样隔开）
      ['Pending Priority suggestion: High. View details', '待处理的 Priority 建议：High。查看详细信息'],
      ['Pending 🎯 Goal suggestion: Q4. View details', '待处理的 🎯 Goal 建议：Q4。查看详细信息']
    ],
    misses: ['Pending type suggestion: Bug']
  },
  {
    hits: [
      ['Applied type: Bug. View rationale', '已应用类型：Bug。查看理由'],
      ['Applied label: enhancement', '已应用标签：enhancement'],
      ['Applied priority: High', '已应用 priority：High']
    ],
    misses: ['Applied type Bug']
  },
  { hits: [['duplicate of octo-org/octo-repo#12', '重复于 octo-org/octo-repo#12']], misses: ['duplicate of #12'] },
  // viewer：附件
  { hits: [['Edit artifact: Design spec', '编辑附件：Design spec']], misses: ['Edit artifact Design spec'] },
  { hits: [['More actions for Design spec', 'Design spec 的更多操作']], misses: ['More actions for'] },

  // timeline：锁定
  {
    hits: [
      ['locked and limited conversation to collaborators', '锁定了对话并限制为仅协作者可评论'],
      ['locked as too heated and limited conversation to collaborators', '以争论过激为由锁定了对话并限制为仅协作者可评论']
    ],
    misses: ['locked as rude and limited conversation to collaborators']
  },
  {
    hits: [
      ['as off topic', '以偏离主题为由'],
      ['as spam', '以垃圾信息为由']
    ],
    misses: ['as rude']
  },
  // timeline：项目状态
  {
    // 项目名是后接的链接，译文以“于”结尾；状态名两侧不加引号
    hits: [
      ['closed this by moving to Done in', '通过移至 Done 关闭了此议题于'],
      // 项目模板常见的表情符号状态名：两侧都与中文隔开
      ['closed this by moving to ✅ Done in', '通过移至 ✅ Done 关闭了此议题于']
    ],
    misses: ['closed this by moving to Done']
  },
  { hits: [['by moving to No status in', '通过移至无状态于']], misses: ['by moving to Done'] },
  {
    hits: [
      ['moved this from Todo to In Progress in', '将此议题从 Todo 移至 In Progress 于'],
      ['moved this from 📋 Backlog to 🏗 In progress in', '将此议题从 📋 Backlog 移至 🏗 In progress 于']
    ],
    misses: ['moved this from Todo to In Progress']
  },
  { hits: [['moved this to Done in', '将此议题移至 Done 于']], misses: ['moved this to Done'] },
  // timeline：交叉引用
  { hits: [['mentioned this in 3 issues', '在 3 个议题中提及了此议题']], misses: ['mentioned this in an issue'] },
  {
    hits: [['mentioned this in 2 pull requests', '在 2 个拉取请求中提及了此议题']],
    misses: ['mentioned this in a pull request']
  },
  {
    hits: [['added 4 commits that reference this issue', '添加了 4 个引用此议题的提交']],
    misses: ['added commits that reference this issue']
  },
  {
    hits: [['Private repository: octo-org/secret', '专用存储库：octo-org/secret']],
    misses: ['Private repository: secret']
  },
  {
    hits: [['Only people who can see octo-org/secret will see this reference.', '只有能查看 octo-org/secret 的用户才能看到此引用。']],
    misses: ['Only people who can see this will see this reference.']
  },
  {
    hits: [
      ["This issue will close once commit 1a2b3c4 is merged into the 'main' branch.", '提交 1a2b3c4 合并到“main”分支后此议题将关闭。'],
      [
        "This pull request will close once commit 1a2b3c4d5e is merged into the 'release/1.0' branch.",
        '提交 1a2b3c4d5e 合并到“release/1.0”分支后此拉取请求将关闭。'
      ]
    ],
    misses: ["This issue will close once commit main is merged into the 'main' branch."]
  },
  {
    hits: [['Undo marking issue as duplicate of issue #12', '撤销将此议题标记为议题 #12 的重复项']],
    misses: ['Undo marking issue as duplicate']
  },
  { hits: [['Discussion #8', '讨论 #8']], misses: ['Discussion #'] },
  // timeline：依赖与相关（多个）
  {
    hits: [['marked this as blocked by 2 issues', '将此议题标记为被 2 个议题阻止']],
    misses: ['marked this as blocked by many issues']
  },
  {
    hits: [['unmarked this as blocked by 3 issues', '取消将此议题标记为被 3 个议题阻止']],
    misses: ['unmarked this as blocked by many issues']
  },
  {
    hits: [['marked this as blocking 2 issues', '将此议题标记为阻止 2 个议题']],
    misses: ['marked this as blocking many issues']
  },
  {
    hits: [['unmarked this as blocking 4 issues', '取消将此议题标记为阻止 4 个议题']],
    misses: ['unmarked this as blocking many issues']
  },
  { hits: [['added 2 related issues', '添加了 2 个相关议题']], misses: ['added related issues'] },
  { hits: [['removed 3 related issues', '删除了 3 个相关议题']], misses: ['removed related issues'] },
  // timeline：加载更多
  { hits: [['Load 25 more', '再加载 25 条']], misses: ['Load many more'] },
  {
    hits: [
      ['3 new items loaded.', '已加载 3 条新内容。'],
      ['1 new item loaded.', '已加载 1 条新内容。']
    ],
    misses: ['3 new items loaded']
  },
  // timeline：加载更多标题（mergeText 合并后的整段）
  {
    hits: [
      ['12 remaining items', '还有 12 项'],
      ['1 remaining item', '还有 1 项'],
      ['1,200 remaining items', '还有 1,200 项']
    ],
    misses: ['Some remaining items', 'remaining items']
  },

  // metadata：分区编辑按钮
  {
    hits: [
      ['Edit Assignees', '编辑受理人'],
      ['Edit Issue type', '编辑议题类型'],
      ['Edit Milestone', '编辑里程碑']
    ],
    misses: ['Edit Reviewers']
  },
  // metadata：标签删除
  { hits: [['Removing label: bug.', '正在删除标签：bug。']], misses: ['Removing label: bug'] },
  {
    hits: [['Could not remove label: bug. The label was restored.', '无法删除标签：bug。标签已恢复。']],
    misses: ['Could not remove label: bug.']
  },
  { hits: [['Removed label: bug.', '已删除标签：bug。']], misses: ['Removed label: bug'] },
  // 删除按钮的提示文字（常态下即按钮名称）：默认标签名与令牌同译，已存档的 Archived 译出，自定义标签名保持原文
  {
    hits: [
      ['Remove label: scope: vapor', '删除标签：scope: vapor'],
      ['Remove label: bug', '删除标签：缺陷'],
      ['Remove label: Archived wontfix', '删除标签：已存档不予修复'],
      ['Remove label: Archived scope: vapor', '删除标签：已存档 scope: vapor'],
      ['Remove label: Archived', '删除标签：Archived']
    ],
    misses: ['Remove label bug']
  },
  // metadata：项目分区
  {
    hits: [
      ['Show 2 closed projects', '显示 2 个已关闭的项目'],
      ['Show 1 closed project', '显示 1 个已关闭的项目']
    ],
    misses: ['Show closed projects']
  },
  { hits: [['Show 5 more (2 closed)', '再显示 5 个（2 个已关闭的）']], misses: ['Show 5 more (some closed)'] },
  { hits: [[', 45% complete', '，已完成 45%']], misses: [', almost complete'] },
  // metadata：问题字段
  {
    hits: [['Value cannot be more than 1024 characters (1100)', '值不能超过 1024 个字符（当前 1100 个）']],
    misses: ['Value cannot be more than 1024 characters']
  },
  // 字段名是用户内容，不加引号；英文名与中文之间留空格；组织预置的字段名（Priority 等）译出
  {
    hits: [
      ['The value for the Priority field', '优先级字段的值'],
      ['The value for the Estimate field', 'Estimate 字段的值'],
      ['The value for the 优先级 field', '优先级字段的值']
    ],
    misses: ['The value for the field']
  },
  { hits: [['Toolbar for Notes field', 'Notes 字段工具栏']], misses: ['Toolbar for Notes'] },
  {
    hits: [
      ['Cannot be greater than 100', '不能大于 100'],
      ['Cannot be greater than -1.5', '不能大于 -1.5']
    ],
    misses: ['Cannot be greater than max']
  },
  { hits: [['Cannot be less than 0', '不能小于 0']], misses: ['Cannot be less than min'] },
  {
    hits: [
      ['Remove field Priority', '删除字段优先级'],
      ['Remove field Estimate', '删除字段 Estimate'],
      ['Remove field 🎯 Goal', '删除字段 🎯 Goal']
    ],
    misses: ['Remove fields']
  },
  {
    hits: [['Update field Estimate (press enter to submit)', '更新字段 Estimate（按 Enter 提交）']],
    misses: ['Update field Estimate']
  },
  { hits: [['No fields configured for Bug.', 'Bug 未配置字段。']], misses: ['No fields configured for Bug'] },
  { hits: [['Set Priority, none', '设置优先级，当前为空']], misses: ['Set Priority'] },
  // 字段值选择器的占位文字（预置字段）
  {
    hits: [
      ['Select Effort', '选择工作量'],
      ['Select Target date', '选择目标日期']
    ],
    misses: ['Select Estimate']
  },
  { hits: [['Priority (edited)', 'Priority（已编辑）']], misses: ['Priority (edit)'] },
  // metadata：选择器
  {
    hits: [
      ['Cannot edit labels right now', '暂时无法编辑标签'],
      ['Cannot edit issue type right now', '暂时无法编辑议题类型'],
      ['Cannot edit fields right now', '暂时无法编辑 fields']
    ],
    misses: ['Cannot edit labels']
  },
  {
    hits: [['You have reached the limit of 10 assignees', '已达到 10 个受理人的上限']],
    misses: ['You have reached the limit of assignees']
  },
  // 分配代理对话框标题：只收已知代理名（默认标题 Assign agent to issue 是 static）
  {
    hits: [
      ['Assign Copilot to issue', '将 Copilot 分配给议题'],
      ['Assign Claude to issue', '将 Claude 分配给议题'],
      ['Assign Codex to issue', '将 Codex 分配给议题']
    ],
    misses: ['Assign Gemini to issue', 'Assign Copilot to issues']
  },
  {
    hits: [['Create new label: "needs triage"', '新建标签：“needs triage”']],
    misses: ['Create new label: needs triage']
  },
  {
    hits: [['Created and selected label: needs triage.', '已创建并选中标签：needs triage。']],
    misses: ['Created and selected label: needs triage']
  },
  { hits: [['Create new milestone: "v2.0"', '新建里程碑：“v2.0”']], misses: ['Create new milestone: v2.0'] },
  {
    hits: [['Filter milestones (12 milestones loaded)', '筛选里程碑（已加载 12 个）']],
    misses: ['Filter milestones (loading)']
  },
  {
    hits: [
      ['2 pull requests selected', '已选择 2 个拉取请求'],
      ['1 pull request selected', '已选择 1 个拉取请求']
    ],
    misses: ['Some pull requests selected']
  },
  {
    hits: [['The branch 12-fix-login already exists.', '分支 12-fix-login 已存在。']],
    misses: ['The branch already exists.']
  },
  {
    hits: [
      ['Repository: octo-org/octo-repo', '存储库：octo-org/octo-repo'],
      ['Repository: octo-org/octo-repo (private)', '存储库：octo-org/octo-repo（专用）']
    ],
    misses: ['Repository: octo-repo']
  },
  {
    hits: [['Change destination, current repository: octo-org/octo-repo', '更改目标，当前存储库：octo-org/octo-repo']],
    misses: ['Change destination']
  },
  // metadata：开发
  {
    hits: [['Creating in octo-org/octo-repo…', '正在 octo-org/octo-repo 中创建…']],
    misses: ['Creating in octo-org/octo-repo']
  },
  {
    hits: [['Creating branch 12-fix-login in octo-org/octo-repo.', '正在 octo-org/octo-repo 中创建分支 12-fix-login。']],
    misses: ['Creating branch 12-fix-login.']
  },
  {
    // 产品名按用户要求译成中文：codespace → 代码空间
    hits: [['Codespace creation failed. Quota exceeded', '代码空间创建失败。Quota exceeded']],
    misses: ['Codespace creation failed: quota']
  },
  // metadata：关系
  {
    hits: [
      [
        'Issues have a limit of 50 relationships. To add more, an existing one must be removed.',
        '每个议题最多有 50 个关系。如需添加，请先删除现有关系。'
      ],
      [
        'Issues have a limit of 50 "blocked by" relationships. To add more, an existing one must be removed.',
        '每个议题最多有 50 个“被阻止”关系。如需添加，请先删除现有关系。'
      ]
    ],
    misses: ['Issues have a limit of 50 relationships.']
  },
  { hits: [['Failed to save 2 issues', '2 个议题保存失败']], misses: ['Failed to save issues'] },
  { hits: [['Failed to save 1 alert', '1 个警报保存失败']], misses: ['Failed to save alerts'] },
  {
    hits: [['An unexpected error occurred. Request timed out', '发生意外错误。Request timed out']],
    misses: ['An unexpected error occurred: timeout']
  },
  // metadata：参与者
  {
    hits: [['and 12 other participants, click to see the full list', '以及其他 12 个参与者，单击可查看完整列表']],
    misses: ['and other participants, click to see the full list']
  },
  // metadata：子问题
  { hits: [['Loading 4 sub-issues', '正在加载 4 个子议题']], misses: ['Loading sub-issues'] },
  { hits: [['4 sub-issues loaded', '已加载 4 个子议题']], misses: ['Sub-issues loaded'] },
  {
    hits: [
      ['Collapse Sub-issues', '折叠子议题'],
      ['Expand Sub-issues', '展开子议题']
    ],
    misses: ['Collapsed Sub-issues']
  },
  { hits: [['Fix login bug, blocked', 'Fix login bug，被阻止']], misses: ['Fix login bug, blocking'] },
  {
    hits: [
      [
        'Parents have a limit of 100 sub-issues. To add more, an existing one must be removed.',
        '每个父议题最多有 100 个子议题。如需添加，请先删除现有子议题。'
      ]
    ],
    misses: ['Parents have a limit of 100 sub-issues.']
  },
  {
    hits: [
      [
        "You can't add more than 8 layers of sub-issues. To add a sub-issue, remove a parent issue at any level.",
        '子议题最多 8 层。如需添加子议题，请删除任一层级的父议题。'
      ]
    ],
    misses: ["You can't add more than 8 layers of sub-issues."]
  },
  {
    hits: [['You can’t add more than 8 layers of sub-issues', '子议题最多 8 层']],
    misses: ['You cannot add more than 8 layers of sub-issues']
  },
  {
    hits: [
      ['3 tasks', '3 个任务'],
      ['1 task', '1 个任务']
    ],
    misses: ['Some tasks']
  },
  { hits: [['2 tasks,', '2 个任务，']], misses: ['Some tasks,'] },
  { hits: [['2 of 5', '2/5']], misses: ['2 of many'] },
  {
    hits: [
      ['Press Command, Shift, U for more actions', '按 Command、Shift、U 查看更多操作'],
      ['Press Control, Shift, U for more actions.', '按 Control、Shift、U 查看更多操作。'],
      [
        'Fix login bug: Open. 2 of 5. Press Control, Shift, U for more actions.',
        'Fix login bug: Open. 2 of 5。按 Control、Shift、U 查看更多操作。'
      ]
    ],
    misses: ['Press Alt, Shift, U for more actions', 'Fix login bug Press Control, Shift, U for more actions.']
  },
  // metadata：正文任务清单项
  { hits: [['Open Write tests task options', '打开 Write tests 的任务选项']], misses: ['Open task options'] },
  { hits: [['Write tests checklist item', 'Write tests 清单项']], misses: ['Checklist item'] },

  // create：对话框标题
  { hits: [['Create new sub-issue', '新建子议题']], misses: ['Create new sub-issues'] },
  {
    hits: [
      ['Create new sub-issue - "Fix login"', '新建子议题 - “Fix login”'],
      ['Create new issue - "Fix login"', '新建议题 - “Fix login”']
    ],
    misses: ['Create new sub-issue - Fix login']
  },
  {
    hits: [
      ['Create new issue in octo-org/octo-repo', '在 octo-org/octo-repo 中新建议题'],
      ['Create new issue in octo-org/octo-repo: Bug report', '在 octo-org/octo-repo 中新建议题：Bug report']
    ],
    misses: ['Create new issue in octo-repo']
  },
  {
    hits: [['Clone current issue in octo-org/octo-repo', '在 octo-org/octo-repo 中克隆当前议题']],
    misses: ['Clone current issue']
  },
  {
    hits: [
      ['Selected repository: octo-org/octo-repo', '已选存储库：octo-org/octo-repo'],
      ['Selected repository: octo-repo (required)', '已选存储库：octo-repo（必填）']
    ],
    misses: ['Selected repository: octo org']
  },
  { hits: [['Issue #42 created', '议题 #42 已创建']], misses: ['Issue #42 was created'] },
  // create：可能重复
  { hits: [['3 potential duplicates', '3 个可能重复的议题']], misses: ['Potential duplicates'] },
  {
    hits: [
      ['Dismiss potential duplicates', '隐藏可能重复的议题'],
      ['Dismiss potential duplicate', '隐藏可能重复的议题']
    ],
    misses: ['Dismiss duplicates']
  },
  {
    hits: [
      [
        'This issue is being cloned across repositories. The following metadata might not be copied: Milestone, Labels, Type.',
        '正在跨存储库克隆此议题。以下元数据可能不会被复制：里程碑、标签、类型。'
      ]
    ],
    misses: ['This issue is being cloned across repositories. The following metadata might not be copied: Reactions.']
  },
  // create：上传与关系
  {
    hits: [
      ['Uploading 2 files...', '正在上传 2 个文件...'],
      ['Uploading 1 file...', '正在上传 1 个文件...']
    ],
    misses: ['Uploading files...']
  },
  { hits: [['View 3 more', '再查看 3 个']], misses: ['View three more'] },
  {
    hits: [['Failed to add 2 of 5 issue relationship(s)', '5 个议题关系中有 2 个添加失败']],
    misses: ['Failed to add issue relationship(s)']
  },

  // filter：建议列表
  {
    hits: [
      ['Author, Filter, The author of the item', '作者，筛选器，项的作者'],
      ['Story points, Filter', 'Story points，筛选器']
    ],
    misses: ['Author Filter']
  },
  {
    hits: [
      ['@me, Signed-in user', '@me，已登录用户'],
      ['@copilot, Your AI pair programmer', '@copilot，你的 AI 结对程序员']
    ],
    misses: ['@octocat, Signed-in user']
  },
  {
    hits: [
      ['Has Label, Label', '有标签，标签'],
      // 未收录的筛选器名保留原文，与中文之间留空格
      ['Has Story points, Story points', '有 Story points，Story points']
    ],
    misses: ['Has Label, Milestone']
  },
  {
    hits: [
      ['No Milestone, Milestone', '无里程碑，里程碑'],
      ['No Story points, Story points', '无 Story points，Story points']
    ],
    misses: ['No Milestone, Label']
  },
  {
    hits: [
      ['Has label', '有标签'],
      ['Has parent issue', '有父议题'],
      ['Has priority', '有 priority']
    ],
    misses: ['Has Label']
  },
  {
    hits: [
      ['Exclude label', '排除标签'],
      ['Exclude parent-issue', '排除父议题'],
      ['Exclude priority', '排除 priority'],
      // 限定符与筛选器名称不同的按名称译：created → Creation date、org → Organization
      ['Exclude created', '排除创建日期'],
      ['Exclude updated', '排除更新日期'],
      ['Exclude org', '排除组织'],
      ['Exclude repo', '排除存储库'],
      ['Exclude review', '排除审查状态'],
      ['Exclude sha', '排除提交 SHA']
    ],
    misses: ['Exclude Label']
  },
  {
    hits: [
      ['No assignee', '无受理人'],
      ['No label', '无标签'],
      ['No parent issue', '无父议题']
    ],
    misses: ['No priority']
  },
  // filter：高级筛选
  {
    hits: [
      ['Advanced filter dialog', '高级筛选器对话框'],
      ['Advanced filter dialog: 2 valid filters', '高级筛选器对话框：2 个有效筛选器']
    ],
    misses: ['Advanced filter dialog: no valid filters']
  },
  { hits: [['Row 2', '第 2 行']], misses: ['Row two'] },
  { hits: [['Delete filter 1: label:bug', '删除筛选器 1：label:bug']], misses: ['Delete filter: label:bug'] },
  {
    hits: [
      ['Qualifier 1', '限定符 1'],
      ['Label, Qualifier 2', '标签，限定符 2']
    ],
    misses: ['Qualifier one']
  },
  {
    hits: [
      ['Operator 1', '运算符 1'],
      ['is one of, Operator 1', '是以下之一，运算符 1']
    ],
    misses: ['Operator one']
  },
  {
    hits: [
      ['Value 1 From', '值 1 起始'],
      ['Value 2 To', '值 2 结束']
    ],
    misses: ['Value 1 Until']
  },
  {
    hits: [
      ['Value 1', '值 1'],
      ['True, Value 2', '是，值 2'],
      ['bug, Value 1', 'bug，值 1']
    ],
    misses: ['Value one']
  },
  {
    hits: [
      ['Enter a number', '输入数字'],
      ['Enter a value', '输入值']
    ],
    misses: ['Enter a color']
  },
  // filter：校验提示
  {
    hits: [
      ['Filter contains 2 issues:', '筛选器有 2 处错误：'],
      ['Filter contains 1 issue:', '筛选器有 1 处错误：']
    ],
    misses: ['Filter contains 2 issues']
  },
  { hits: [["Filter 'reason' not supported", '不支持筛选器“reason”']], misses: ['Filter reason not supported'] },
  {
    hits: [["Filter 'involves' is deprecated and will be removed in the future", '筛选器“involves”已弃用且将来会被删除']],
    misses: ["Filter 'involves' is deprecated"]
  },
  { hits: [['Maximum nested groups of 5 exceeded', '嵌套分组超过上限 5']], misses: ['Maximum nested groups exceeded'] },
  {
    hits: [['Authenticate with SAML SSO to access', '使用 SAML SSO 进行身份验证以访问']],
    misses: ['Authenticate to access']
  },
  { hits: [['SSO required for octo-org', 'octo-org 需要 SSO']], misses: ['SSO required'] },
  {
    hits: [
      ['created:>2026-13-01 is invalid', 'created:>2026-13-01 无效'],
      ['label:foo is invalid', 'label:foo 无效']
    ],
    misses: ['Date is not valid', 'Title is invalid', "Name can't be blank. Name is invalid"]
  },
  // filter：选择器对话框
  {
    hits: [
      ['Filter users', '筛选用户'],
      ['Filter repositories', '筛选存储库']
    ],
    misses: ['Filter user']
  },
  {
    hits: [
      ['Select users', '选择用户'],
      ['Select issue types', '选择议题类型']
    ],
    misses: ['Select colors']
  },
  {
    hits: [
      ['Select a label', '选择标签'],
      ['Select an assignee', '选择受理人'],
      ['Select an issue type', '选择议题类型']
    ],
    misses: ['Select a color']
  },
  {
    hits: [
      ['3 labels selected', '已选择 3 个标签'],
      ['1 label selected', '已选择 1 个标签']
    ],
    misses: ['3 colors selected']
  },
  { hits: [['Loading labels...', '正在加载标签...']], misses: ['Loading colors...'] },
  { hits: [['Error loading milestones.', '加载里程碑时出错。']], misses: ['Error loading milestones'] },
  { hits: [['No users to show.', '没有可显示的用户。']], misses: ['No users to show'] },
  {
    hits: [['Add a filter using the input to match labels.', '在输入框中添加筛选器以匹配标签。']],
    misses: ['Add a filter using the input.']
  },
  {
    hits: [
      ['2 selected items hidden by search', '2 个所选条目被搜索隐藏'],
      ['1.2k selected items hidden by search', '1.2k 个所选条目被搜索隐藏']
    ],
    misses: ['Selected items hidden by search']
  },
  {
    hits: [
      ['250 labels matching, showing first 100', '250 个匹配项，显示前 100 个'],
      ['1,200 issue types matching, showing first 50', '1,200 个匹配项，显示前 50 个']
    ],
    misses: ['250 labels matching, showing all']
  },
  {
    hits: [
      ['12 labels matching', '12 个匹配项'],
      ['3 issue types matching', '3 个匹配项'],
      ['1.5k users matching', '1.5k 个匹配项']
    ],
    misses: ['12 Labels matching']
  },

  // labels：计数（59 labels 由通用词典处理）
  { hits: [['20 open pull requests', '20 个打开的拉取请求']], misses: ['Some open pull requests'] },
  {
    hits: [
      ['4 open issues', '4 个打开的议题'],
      ['1 open issue', '1 个打开的议题']
    ],
    misses: ['Some open issues']
  },
  {
    hits: [
      [
        ':lady_beetle: bug. 9 open pull requests9 open pull requests48 open issues48 open issues.',
        ':lady_beetle: bug。9 个打开的拉取请求 48 个打开的议题。'
      ],
      ['has PR. 12 open issues12 open issues.', 'has PR。12 个打开的议题。'],
      // 默认标签名与行里的标签令牌同译（标签表）
      ['dependencies. 7 open pull requests7 open pull requests.', '依赖项。7 个打开的拉取请求。']
    ],
    misses: ['good first issue.', 'bug. 9 open pull requests8 open pull requests.', 'v1. 2 fixes.']
  },
  {
    hits: [
      // 默认标签名与行里的标签令牌同译，自定义标签名原样保留
      [
        'Archiving hides "wontfix" so it can’t be added to discussions, issues, or pull requests. It remains on anything that already uses it, and you can unarchive it any time.',
        '存档后，“不予修复”将被隐藏，无法再添加到讨论、议题或拉取请求中。已使用它的内容会保留该标签，你可以随时取消存档。'
      ],
      [
        'Archiving hides "scope: vapor" so it can\'t be added to discussions, issues, or pull requests. It remains on anything that already uses it, and you can unarchive it any time.',
        '存档后，“scope: vapor”将被隐藏，无法再添加到讨论、议题或拉取请求中。已使用它的内容会保留该标签，你可以随时取消存档。'
      ]
    ],
    misses: ['Archiving hides "wontfix".']
  },
  // labels：颜色选择器
  {
    hits: [
      ['Red (#b60205)', '红色 (#b60205)'],
      ['Light Blue (#c5def5)', '浅蓝色 (#c5def5)']
    ],
    misses: ['Crimson (#b60205)']
  },
  { hits: [['Color: Red (#b60205)', '颜色：红色 (#b60205)']], misses: ['Color: Crimson (#b60205)'] },
  { hits: [['Color: #ab12cd', '颜色：#ab12cd']], misses: ['Color: #ab12'] },
  { hits: [['Color: (#ab12cd)', '颜色：(#ab12cd)']], misses: ['Color: (ab12cd)'] },
  // Dependabot 生态标签的说明在通用词典（common-ui/labels.ts，全站生效）

  // milestones
  { hits: [['Milestone #3', '里程碑 #3']], misses: ['Milestone #three'] },
  {
    hits: [
      // 日期由 helpers 生成（中文与数字之间带空格），后接中文不加空格
      ['Due by October 26, 2026', '2026年10月26日截止'],
      ['Due by Oct 26, 2026, 45% complete', '2026年10月26日截止，已完成 45%'],
      ['Due by October 26, 2026, not started', '2026年10月26日截止，未开始'],
      ['Due by January 2027', '2027年1月截止']
    ],
    misses: ['Due by next week']
  },
  {
    hits: [
      ['Overdue by 3 day(s)', '逾期 3 天'],
      ['Overdue by 2 month(s)', '逾期 2 个月']
    ],
    misses: ['Overdue by 3 days']
  },
  { hits: [['3/10 issues closed', '已关闭 3/10 个议题']], misses: ['3 of 10 issues closed'] },
  { hits: [['45% complete', '已完成 45%']], misses: ['almost complete'] },
  {
    hits: [
      [
        'Milestones cannot be loaded due to a system error. Try reloading the page, or if the problem persists',
        '系统错误，无法加载里程碑。请尝试重新加载页面；仍然出错时请'
      ],
      [
        "This milestone's issues can not be loaded due to a system error. Try reloading the page, or if the problem persists",
        '系统错误，无法加载此里程碑的议题。请尝试重新加载页面；仍然出错时请'
      ]
    ],
    misses: ['Labels cannot be loaded due to a system error. Try reloading the page, or if the problem persists']
  },

  // views：视图行与分区
  {
    hits: [
      ['Created by octocat', '由 octocat 创建'],
      ['Created by octocat •', '由 octocat 创建 •']
    ],
    misses: ['Created by Mona Lisa']
  },
  {
    hits: [
      ['Expand Private', '展开专用视图'],
      ['Collapse Shared', '折叠共享视图']
    ],
    misses: ['Expanded Private']
  },
  { hits: [['Showing all 12 shared views', '显示全部 12 个共享视图']], misses: ['Showing all shared views'] },
  { hits: [['Show more private views', '显示更多专用视图']], misses: ['Show more public views'] },
  // views：可见范围
  {
    hits: [['Everyone who can view this repository can see this shared view.', '所有能查看此存储库的人都能看到此共享视图。']],
    misses: ['Everyone who can view this team can see this shared view.']
  },
  {
    hits: [['Anyone with organization access can see this view.', '拥有组织访问权限的任何人都能看到此视图。']],
    misses: ['Anyone with team access can see this view.']
  },
  {
    hits: [['Everyone who can view this profile', '所有能查看此个人资料的人']],
    misses: ['Everyone who can view this team']
  },
  {
    hits: [
      [
        'Save a search as a view. Views are visible to everyone with repository access.',
        '将搜索保存为视图。拥有存储库访问权限的所有人都能看到视图。'
      ]
    ],
    misses: ['Save a search as a view.']
  },
  {
    hits: [['for everyone in this organization.', '供此组织中的所有人使用。']],
    misses: ['for everyone in this team.']
  },
  // views：删除、复制、置顶
  {
    hits: [["Are you sure you want to delete view 'Bugs'?", '确定要删除视图“Bugs”吗？']],
    misses: ["Are you sure you want to delete view 'Bugs'"]
  },
  // 原文无引号的视图名不加引号；英文名与中文之间留空格
  {
    hits: [
      ['Are you sure you want to delete view Bugs?', '确定要删除视图 Bugs 吗？'],
      ['Are you sure you want to delete view 缺陷?', '确定要删除视图缺陷吗？']
    ],
    misses: ['Are you sure you want to delete view?']
  },
  {
    hits: [['View Bugs deleted. No private views remaining.', '视图 Bugs 已删除。已没有专用视图。']],
    misses: ['View Bugs deleted. No public views remaining.']
  },
  {
    hits: [['View Bugs deleted. No saved views remaining.', '视图 Bugs 已删除。已没有已保存的视图。']],
    misses: ['View Bugs deleted. No views remaining.']
  },
  {
    hits: [
      ['View Bugs deleted', '视图 Bugs 已删除'],
      ['View 🔥 Hot deleted', '视图 🔥 Hot 已删除']
    ],
    misses: ['View deleted']
  },
  {
    hits: [['Create a copy of “Bugs” as a new saved view.', '将“Bugs”复制为新的已保存视图。']],
    misses: ['Create a copy of Bugs as a new saved view.']
  },
  {
    hits: [['Maximum of 5 pins reached. Unpin an item to pin another.', '已达到 5 个置顶项的上限。请先取消置顶一项。']],
    misses: ['Maximum of 5 pins reached.']
  },
  { hits: [['View Bugs pinned', '视图 Bugs 已置顶']], misses: ['View pinned'] },
  { hits: [['View Bugs unpinned', '视图 Bugs 已取消置顶']], misses: ['View unpinned'] },
  { hits: [['Could not pin Bugs', '无法置顶 Bugs']], misses: ['Could not pin'] },
  { hits: [['Could not unpin Bugs', '无法取消置顶 Bugs']], misses: ['Could not unpin'] },
  { hits: [['Edit Bugs description', '编辑 Bugs 的描述']], misses: ['Edit description'] },
  { hits: [['Edit Bugs title', '编辑 Bugs 的标题']], misses: ['Edit title'] },
  // views：图标与颜色
  {
    hits: [
      ['Gray color', '灰色'],
      ['Purple color', '紫色']
    ],
    misses: ['Yellow color']
  },
  {
    hits: [
      ['Bug icon', '虫子图标'],
      ['Git pull request icon', '拉取请求图标'],
      ['Copilot icon', 'Copilot 图标']
    ],
    misses: ['Unicorn icon']
  },
  {
    hits: [
      ['Visibility: Shared', '可见性：共享'],
      // 与单独出现的 Private（通用词典“专用”）一致
      ['Visibility: Private', '可见性：专用']
    ],
    misses: ['Visibility: Public']
  },
  // views：仪表板
  { hits: [['Change the issues type filter', '切换议题视图']], misses: ['Change the type filter'] },
  {
    hits: [['Default to this view when visiting github.com/issues', '访问 github.com/issues 时默认打开此视图']],
    misses: ['Default to this view']
  },
  // views：看板
  {
    hits: [
      ['12 cards', '12 张卡片'],
      ['1 card', '1 张卡片']
    ],
    misses: ['Some cards']
  },
  { hits: [['More cards in Todo', 'Todo 中的更多卡片']], misses: ['More cards'] },
  { hits: [['Alice row, 3 cards', 'Alice 行，3 张卡片']], misses: ['Alice row'] },
  {
    hits: [
      ['Done, Alice, 1 card', 'Done, Alice，1 张卡片'],
      ['Todo, 1,204 cards', 'Todo，1,204 张卡片']
    ],
    misses: ['Done, Alice']
  },

  // list：选择（1,234 results、3 selected、3 of 25 selected 由通用词典处理）
  {
    hits: [
      ['3 issues selected', '已选择 3 个议题'],
      // 与通用词典的“25 个列表项中已选择 3 个”同一写法
      ['3 issues of 25 selected', '25 个议题中已选择 3 个'],
      ['2 list items selected', '已选择 2 个列表项']
    ],
    misses: ['3 cats selected', '3 selected', '3 of 25 selected']
  },
  { hits: [['of 25 selected', '/25 已选择']], misses: ['of many selected'] },
  // list：排序（原文无标点，译文不加冒号、逗号；表情符号两侧留空格）
  {
    hits: [
      ['Sort by Newest descending', '按最新降序排序'],
      ['Sort by Thumbs up ascending', '按 👍 升序排序']
    ],
    misses: ['Sort by Newest random']
  },
  {
    hits: [
      ['Sort by Last updated', '按最后更新排序'],
      ['Sort by Comments', '按评论数排序'],
      ['Sort by Heart', '按 ❤️ 排序']
    ],
    misses: ['Sort by Priority']
  },
  {
    hits: [
      ['12 issues found. List is sorted by Last updated in descending order.', '找到 12 个议题。按最后更新降序排列。'],
      // 表情符号排序字段与排序按钮同一写法，两侧留空格
      ['3 issues found. List is sorted by Thumbs up in descending order.', '找到 3 个议题。按 👍 降序排列。'],
      ['1.2k results found. List is sorted by Best match in descending order.', '找到 1.2k 个结果。按最佳匹配降序排列。']
    ],
    misses: ['12 issues found.']
  },
  {
    hits: [['Page 2 of 5 loaded with 25 items', '第 2/5 页已加载 25 个条目']],
    misses: ['Page 2 of 5 loaded']
  },
  // list：列表项
  {
    hits: [
      ['Status: Open.', '状态：打开。'],
      ['Status: Closed (completed).', '状态：已关闭（已完成）。'],
      ['Status: Not planned (skipped).', '状态：未计划（已跳过）。']
    ],
    misses: ['Status: Pending.']
  },
  {
    hits: [
      ['Fix login bug. More information available below.', 'Fix login bug。更多信息见下方。'],
      ['Selected. Fix login bug. More information available below.', '已选择。Fix login bug。更多信息见下方。'],
      ['Fix login bug. New activity. More information available below.', 'Fix login bug。有新动态。更多信息见下方。']
    ],
    misses: ['Fix login bug. More information available below']
  },
  { hits: [['Select: Fix login bug', '选择：Fix login bug']], misses: ['Select Fix login bug'] },
  { hits: [['Selected. Fix login bug.', '已选择。Fix login bug。']], misses: ['Selected. Fix login bug'] },
  { hits: [['Unselected. Fix login bug.', '未选择。Fix login bug。']], misses: ['Unselected. Fix login bug'] },
  {
    hits: [
      ['Select all issues: Issues', '全选议题：Issues'],
      ['Select all pull requests: Review requests', '全选拉取请求：Review requests'],
      ['Select all issues:', '全选议题：']
    ],
    misses: ['Select all issues', 'Select all repositories: Mine']
  },
  // list：列表项元数据（12 comments 由通用词典处理）
  {
    hits: [
      ['5 Thumbs up reactions', '5 个 👍 反应'],
      ['1 Heart reaction', '1 个 ❤️ 反应'],
      ['12 Total reactions reactions', '12 个反应']
    ],
    misses: ['5 Sparkles reactions']
  },
  {
    hits: [
      [
        '2 / 5 sub-issues completed, filter by parent issue octo-org/octo-repo#12',
        '已完成 2/5 个子议题，按父议题 octo-org/octo-repo#12 筛选'
      ]
    ],
    misses: ['2 / 5 sub-issues completed']
  },
  { hits: [['Filter by author octocat', '按作者 octocat 筛选']], misses: ['Filter by author Mona Lisa'] },
  { hits: [['Filter by assignee hubot', '按受理人 hubot 筛选']], misses: ['Filter by assignee Mona Lisa'] },
  // 标签名、字段名、取值是用户内容，不加引号（筛选按钮里的默认标签名由通用组件的属性规则按标签表翻译，见文末“标签区域（DOM）”）
  {
    hits: [
      ['Filter by label scope: vapor', '按标签 scope: vapor 筛选'],
      ['Filter by label 缺陷', '按标签缺陷筛选'],
      // 表情符号短代码、表情符号开头的标签名与中文隔开
      ['Filter by label :bug: bug', '按标签 :bug: bug 筛选'],
      ['Filter by label 🐛 缺陷', '按标签 🐛 缺陷筛选']
    ],
    misses: ['Filter by labeling']
  },
  {
    hits: [['Filter by repository octo-org/octo-repo', '按存储库 octo-org/octo-repo 筛选']],
    misses: ['Filter by repository octo-repo']
  },
  {
    hits: [
      ['Filter by Priority: High', '按 Priority 为 High 筛选'],
      ['Filter by 优先级: 高', '按优先级为高筛选'],
      ['Filter by Status: ✅ Done', '按 Status 为 ✅ Done 筛选']
    ],
    misses: ['Filter by Priority High']
  },
  {
    hits: [
      ['Show 3 more issue field values', '再显示 3 个议题字段值'],
      ['Show 1 more issue field value', '再显示 1 个议题字段值']
    ],
    misses: ['Show more issue field values']
  },
  { hits: [['+3, show all 5 assignees', '+3，显示全部 5 个受理人']], misses: ['+3 assignees'] },
  { hits: [['Milestone: v2.0', '里程碑：v2.0']], misses: ['Milestone v2.0'] },
  { hits: [["View octocat's profile", '查看 octocat 的个人资料']], misses: ["View Mona Lisa's profile"] },
  // list：链接的拉取请求
  {
    hits: [
      ['1 linked pull request #34: Fix login, Open', '1 个链接的拉取请求 #34：Fix login，打开'],
      ['1 linked pull request octo-org/octo-repo#34, Merged', '1 个链接的拉取请求 octo-org/octo-repo#34，已合并']
    ],
    misses: ['1 linked pull request #34, Stale']
  },
  { hits: [['3 linked pull requests', '3 个链接的拉取请求']], misses: ['Several linked pull requests'] },
  {
    hits: [['30 linked pull requests, showing first 25', '30 个链接的拉取请求，显示前 25 个']],
    misses: ['30 linked pull requests, showing all']
  },
  { hits: [['3 linked PRs', '3 个链接的拉取请求']], misses: ['Several linked PRs'] },
  {
    hits: [['Only the first 25 of 30 linked pull requests are shown.', '仅显示 30 个链接的拉取请求中的前 25 个。']],
    misses: ['Only the first linked pull requests are shown.']
  },
  {
    hits: [
      ['#34 · Draft', '#34 · 草稿'],
      ['octo-org/octo-repo#34 · State unavailable', 'octo-org/octo-repo#34 · 状态不可用']
    ],
    misses: ['#34 · Stale']
  },
  { hits: [['link to the pull request #34', '指向拉取请求 #34 的链接']], misses: ['link to the pull request'] },
  { hits: [['link to the issue #12', '指向议题 #12 的链接']], misses: ['link to the issue'] },
  // list：结果上限与仪表板空状态
  {
    hits: [
      [
        'Showing the first 1,000 issues. To view additional issues, please refine your search.',
        '仅显示前 1,000 个议题。如需查看更多议题，请细化搜索条件。'
      ]
    ],
    misses: ['Showing the first 1,000 issues. To view additional pull requests, please refine your search.']
  },
  {
    hits: [
      ['When an issue needs your review or attention, it’ll appear here.', '需要你审查或关注的议题会显示在这里。'],
      ["When a pull request needs your review or attention, it'll appear here.", '需要你审查或关注的拉取请求会显示在这里。']
    ],
    misses: ['When a discussion needs your review or attention, it’ll appear here.']
  },
  // list：置顶议题、首次贡献横幅
  { hits: [['Pinned issue #12 options', '置顶议题 #12 的选项']], misses: ['Pinned issue options'] },
  { hits: [['Unpin issue #12, Fix login bug', '取消置顶议题 #12，Fix login bug']], misses: ['Unpin issue #12'] },
  {
    hits: [['👋 Want to contribute to octo-org/octo-repo?', '👋 想为 octo-org/octo-repo 做贡献吗？']],
    misses: ['Want to contribute to octo-org/octo-repo?']
  },
  // list：批量更新
  {
    hits: [
      ['Bulk update is in progress 40 %', '批量更新进行中 40%'],
      ['Bulk update is in progress 40 % (2 issues failing to update)', '批量更新进行中 40%（2 个议题更新失败）']
    ],
    misses: ['Bulk update is in progress']
  },
  { hits: [['(2 issues failing to update)', '（2 个议题更新失败）']], misses: ['(issues failing to update)'] },
  {
    hits: [['Could not update 2 of 10 issues', '10 个议题中有 2 个无法更新']],
    misses: ['Could not update some issues']
  },
  {
    hits: [
      ['10 issues updated', '已更新 10 个议题'],
      ['1 issue updated', '已更新 1 个议题']
    ],
    misses: ['Issues updated']
  },
  { hits: [['Updating 10 issues', '正在更新 10 个议题']], misses: ['Updating many issues'] },
  {
    hits: [
      ['3 issues marked as read', '已将 3 个议题标记为已读'],
      ['1 issue marked as unread', '已将 1 个议题标记为未读']
    ],
    misses: ['3 issues marked as done']
  },
  { hits: [['Marking 3 issues as unread', '正在将 3 个议题标记为未读']], misses: ['Marking 3 issues as done'] },
  {
    hits: [['Select at most 100 issues to change read state', '最多选择 100 个议题以更改已读状态']],
    misses: ['Select issues to change read state']
  },
  {
    hits: [['Select between 1 and 1,000 issues', '请选择 1 到 1,000 个议题']],
    misses: ['Select between 2 and 1,000 issues']
  },
  // list：看板卡片
  { hits: [['Author: octocat', '作者：octocat']], misses: ['Author octocat'] },
  { hits: [['Assignee: hubot', '受理人：hubot']], misses: ['Assignee hubot'] },
  { hits: [['Type: Bug', '类型：Bug']], misses: ['Type Bug'] },
  { hits: [['Sub-issues progress: 2 / 5 completed', '子议题进度：已完成 2/5']], misses: ['Sub-issues progress: none'] },
  {
    hits: [['bug, docs and 3 more', 'bug, docs 及另外 3 个']],
    misses: ['octocat and others', 'Reacted by a, b and 22 more', ', and 3 more']
  },
  {
    hits: [
      ['No Status', '无状态'],
      ['No Assignees', '无受理人'],
      ['No Issue type', '无议题类型']
    ],
    misses: ['No Sprint']
  },
  {
    hits: [
      ['(Open)', '（打开）'],
      ['(Not planned)', '（未计划）']
    ],
    misses: ['(Merged)']
  },
  // list：代理会话
  { hits: [['Open Copilot session', '打开 Copilot 会话']], misses: ['Open Gemini session'] },
  {
    hits: [
      ['Claude session', 'Claude 会话'],
      ['Copilot session:', 'Copilot 会话：']
    ],
    misses: ['Gemini session']
  },
  {
    hits: [
      ['Fix login bug · Updated 5m ago · Running for 1h 2m', 'Fix login bug · 5分钟前更新 · 已运行 1小时 2分钟'],
      ['Fix login bug · Updated 2d 3h ago · Ran for 45s', 'Fix login bug · 2天 3小时前更新 · 运行了 45秒']
    ],
    misses: ['Fix login bug · Updated 5m ago']
  },
  // list：拖放播报（条目标题是用户内容，原文无引号，译文不加；标题与中文之间按 joinName 留空格）
  {
    hits: [
      ['Moving Fix login bug.', '正在移动 Fix login bug。'],
      ['Moving 修复登录.', '正在移动修复登录。'],
      ['Moving [Bug] Fix login.', '正在移动 [Bug] Fix login。']
    ],
    misses: ['Moving Fix login bug']
  },
  {
    hits: [['Between Fix login bug and Add dark mode.', '位于 Fix login bug 和 Add dark mode 之间。']],
    misses: ['Between Fix login bug and Add dark mode']
  },
  {
    hits: [['Cancel moving Fix login bug and 2 other items', '取消移动 Fix login bug 及其他 2 个条目']],
    misses: ['Cancel moving']
  },
  { hits: [['Cancel moving Fix login bug', '取消移动 Fix login bug']], misses: ['Cancel move Fix login bug'] },
  {
    hits: [
      ['Fix login bug successfully moved to first item in list.', 'Fix login bug 已移到列表第一项。'],
      // 以半角括号结尾的标题与中文隔开，以全角括号结尾的直接相连
      ['Fix login (Safari) successfully moved to first item in list.', 'Fix login (Safari) 已移到列表第一项。'],
      ['修复登录（Safari） successfully moved to first item in list.', '修复登录（Safari）已移到列表第一项。']
    ],
    misses: ['Fix login bug successfully moved to first item in list']
  },
  {
    hits: [['Fix login bug successfully moved to last item in list.', 'Fix login bug 已移到列表最后一项。']],
    misses: ['Fix login bug successfully moved to last item']
  },
  {
    hits: [
      [
        'Fix login bug successfully moved between Add dark mode and Update docs.',
        'Fix login bug 已移到 Add dark mode 和 Update docs 之间。'
      ]
    ],
    misses: ['Fix login bug successfully moved between Add dark mode and Update docs']
  },
  {
    hits: [
      ['Fix login bug did not move.', 'Fix login bug 未移动。'],
      ['Fix login bug not moved.', 'Fix login bug 未移动。']
    ],
    misses: ['Fix login bug did not move']
  },
  {
    hits: [['Entry must be less than or equal to 12.', '输入值必须小于或等于 12。']],
    misses: ['Entry must be less than or equal to twelve.']
  },
  { hits: [['Fix login bug will be moved...', 'Fix login bug 将被移动...']], misses: ['Fix login bug will be moved'] },
  {
    hits: [['Fix login bug will not be moved.', 'Fix login bug 不会被移动。']],
    misses: ['Fix login bug will not be moved']
  },
  {
    hits: [['Fix login bug will be first item in the list.', 'Fix login bug 将成为列表第一项。']],
    misses: ['Fix login bug will be first item']
  },
  {
    hits: [['Fix login bug will be last item in the list.', 'Fix login bug 将成为列表最后一项。']],
    misses: ['Fix login bug will be last item']
  },
  {
    hits: [['Fix login bug will be between Add dark mode and Update docs.', 'Fix login bug 将位于 Add dark mode 和 Update docs 之间。']],
    misses: ['Fix login bug will be between Add dark mode and Update docs']
  },
  {
    hits: [['Fix login bug cannot be moved to an invalid position.', 'Fix login bug 无法移到无效位置。']],
    misses: ['Fix login bug cannot be moved.']
  },
  // list：兜底（标签名、分组值、卡片标题不加冒号、引号）
  { hits: [['Archived wontfix', '已存档 wontfix']], misses: ['Archive wontfix'] },
  {
    hits: [
      ['Collapse Alice', '折叠 Alice'],
      ['Expand No Status', '展开 No Status'],
      ['Collapse 待办', '折叠待办']
    ],
    misses: ['Collapse']
  },
  {
    hits: [['Actions for Fix login bug', 'Fix login bug 的操作']],
    misses: ["Actions for octocat's comment, 7:05 AM on October 19", 'Actions for']
  },
  // 议题字段的日期选择器（与提交列表同一词典 commits/date-picker）
  {
    hits: [['Oct 1 - Oct 26', `${formatDate(undefined, 10, 1)} - ${formatDate(undefined, 10, 26)}`]],
    misses: ['Oct 1 - yesterday']
  },
  { hits: [['Oct 1 -', `${formatDate(undefined, 10, 1)} -`]], misses: ['yesterday -'] },
  { hits: [['Week 2', '第 2 周']], misses: ['Week 12'] },
  {
    hits: [['Saturday, November 21 (Today)', `${formatDate(undefined, 11, 21)}星期六（今天）`]],
    misses: ['Funday, November 21']
  },
  {
    hits: [['Must be on or after Nov 1, 2026', `不能早于 ${formatDate(2026, 11, 1)}`]],
    misses: ['Must be on or after yesterday']
  },
  {
    hits: [['Must be on or before Dec 31, 2026', `不能晚于 ${formatDate(2026, 12, 31)}`]],
    misses: ['Must be on or before tomorrow']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('issues 正则词条', () => {
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

  it('长输入不会触发回溯爆炸', () => {
    const inputs = [
      `12 ${'a'.repeat(40)} matchin`,
      `1 ${'a'.repeat(40)}!`,
      `Has ${'a'.repeat(40)}!`,
      `${'Value '.repeat(200)}!`,
      `${', Filter'.repeat(200)}!`,
      `${'a. 1 open issues'.repeat(200)}!`
    ]
    const start = performance.now()
    for (const input of inputs) translate(input)
    expect(performance.now() - start).toBeLessThan(500)
  })

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Change the ', 'issues', ' type filter'].join('')))).toBe('切换议题视图')
    expect(translate(normalizeText(['Default to this view when visiting ', 'github.com/issues'].join('')))).toBe(
      '访问 github.com/issues 时默认打开此视图'
    )
    expect(
      translate(normalizeText(['Showing the first ', '1,000', ' issues. To view additional issues, please refine your search.'].join('')))
    ).toBe('仅显示前 1,000 个议题。如需查看更多议题，请细化搜索条件。')
    expect(translate(normalizeText(['Bulk update is in progress ', '40', ' %'].join('')))).toBe('批量更新进行中 40%')
    expect(translate(normalizeText(['12', ' ', 'labels', ' matching'].join('')))).toBe('12 个匹配项')
    expect(translate(normalizeText(['Due by ', 'October 26, 2026'].join('')))).toBe('2026年10月26日截止')
    expect(translate(normalizeText(['Created', ':', ' '].join('')))).toBe('创建时间：')
    expect(translate(normalizeText(['closed this ', 'as '].join('')))).toBe('将此议题关闭为')
  })

  it('被元素隔开的片段单独命中', () => {
    expect(translate('If you have a bug or an idea, read the')).toBe('如果你发现了缺陷或有新想法，请在打开议题前阅读')
    expect(translate('contributing guidelines')).toBe('贡献指南')
    expect(translate('before opening an issue.')).toBe('。')
    expect(translate("Please follow this repository's")).toBe('请遵守此存储库的')
    expect(translate('Try reloading the page, or if the problem persists')).toBe('请尝试重新加载页面；仍然出错时请')
    expect(translate('contact support')).toBe('联系支持')
    expect(translate('Commenting has been disabled because this issue was converted to a')).toBe('已禁用评论的原因是此议题已转换为')
    expect(translate('discussion')).toBe('讨论')
  })

  it('中文与用户内容拼接：英文、数字、表情符号、半角标点隔开，中文、全角标点直接相连', () => {
    expect(joinName('按标签', 'bug')).toBe('按标签 bug')
    expect(joinName('按标签', '缺陷')).toBe('按标签缺陷')
    expect(joinName('按标签', '12')).toBe('按标签 12')
    expect(joinName('通过移至', '✅ Done')).toBe('通过移至 ✅ Done')
    expect(joinName('标记为', '❤️')).toBe('标记为 ❤️')
    expect(joinName('查看', '[Bug] Fix')).toBe('查看 [Bug] Fix')
    expect(joinName('查看', '“示例”')).toBe('查看“示例”')
    expect(joinName('Fix (Safari)', '已移到')).toBe('Fix (Safari) 已移到')
    expect(joinName('Bugs 🐛', '已删除')).toBe('Bugs 🐛 已删除')
    expect(joinName('修复（登录）', '已移到')).toBe('修复（登录）已移到')
    expect(joinName('查看', 'テスト')).toBe('查看テスト')
    expect(joinName('已选择：', 'Fix')).toBe('已选择：Fix')
    expect(joinName('查看', '')).toBe('查看')
    expect(joinName('', 'Fix')).toBe('Fix')
  })
})

describe('issues 静态词条', () => {
  it.each([
    // viewer
    ['Close as completed', '以已完成关闭'],
    ['Close as not planned', '以未计划关闭'],
    ['Issue, not planned', '议题，未计划'],
    ['Lock conversation', '锁定对话'],
    ['write access', '写入访问权限'],
    ['Transfer issue', '转移议题'],
    ['Delete issue?', '删除议题？'],
    ['Failed to unblock user', '取消阻止用户失败'],
    ['Show issue details', '显示议题详细信息'],
    ["You're not receiving notifications from this thread. Click to subscribe", '你不会收到此线程的通知。单击可订阅'],
    // 与 pulls、discussions 同句同译
    ["You're receiving notifications because you're subscribed to this thread.", '你因已订阅此线程而收到通知。'],
    [
      "You're receiving notifications because you're subscribed to this thread. Click to unsubscribe",
      '你因已订阅此线程而收到通知。单击可取消订阅'
    ],
    ['This conversation has been locked and limited to collaborators.', '此对话已锁定并限制为仅协作者可评论。'],
    ['Paste HTML source...', '粘贴 HTML 源码...'],
    // 原文两句，译文不并成一句
    ['Could not delete the issue. Please try again.', '无法删除议题。请重试。'],
    ['Link could not be added. Try again.', '无法添加链接。请重试。'],
    ['Issue transfer has started. This action might take a while.', '议题转移已开始。此操作可能需要一些时间。'],
    ['Unable to reorder artifact. Previous order restored.', '无法调整附件顺序。已恢复原顺序。'],
    // 经典页的四项写法、首字母大写变体、置顶与删除提示
    ["Won't fix, can't repro, duplicate, stale", '不修复、无法复现、重复、已过时'],
    ['Reopen Issue', '重新打开议题'],
    [
      'Up to 3 issues can be pinned and they will appear publicly at the top of the issues page',
      '最多可置顶 3 个议题并公开显示在议题页顶部'
    ],
    ['The issue has been pinned.', '议题已置顶。'],
    ['The issue was successfully deleted.', '议题已删除。'],
    ['This issue has been deleted.', '此议题已被删除。'],
    // timeline
    ['pinned this issue', '置顶了此议题'],
    ['added a sub-issue', '添加了子议题'],
    ['removed a sub-issue', '删除了子议题'],
    ['Hide commit message body', '隐藏提交消息正文'],
    // metadata
    ['Create sub-issue', '创建子议题'],
    ['Remove sub-issue', '删除子议题'],
    ['No branches or linked pull requests', '没有分支或链接的拉取请求'],
    ['Could not update linked branches', '无法更新关联的分支'],
    // 产品名按用户要求译成中文（product-names.md）：codespace → 代码空间、Copilot Chat → Copilot 聊天
    [
      'Start a codespace with Copilot agent mode for this issue in another repository.',
      '在其他存储库中为此议题启动使用 Copilot 智能体模式的代码空间。'
    ],
    ['Unable to load Copilot Chat. Ensure Copilot is enabled.', '无法加载 Copilot 聊天。请确认已启用 Copilot。'],
    // 项目项（item → 项）
    ['Project items limit reached dialog', '项目项上限对话框'],
    // 开发分区说明、分配代理对话框的默认标题
    ['Shows branches and pull requests linked to this issue.', '显示链接到此议题的分支和拉取请求。'],
    ['Search for branches or pull requests', '搜索分支或拉取请求'],
    ['Assign agent to issue', '将智能体分配给议题'],
    // create
    ['Choose an Issue Template', '选择议题模板'],
    ['Blank issue', '空白议题'],
    ['Create more', '继续创建'],
    ['Select repository (required)', '选择存储库（必填）'],
    [
      'You need the triage role or higher in this repository to change the issue type.',
      '需要此存储库的分类角色或更高角色才能更改议题类型。'
    ],
    ['Go to Copilot', '转到 Copilot'],
    ['Navigate to Copilot Chat', '转到 Copilot 聊天'],
    ['Writing…', '撰写中…'],
    ['Type your message here...', '在此输入消息...'],
    ['Failed to upload file. Please try again.', '上传文件失败。请重试。'],
    ['You have made edits to the generated content. Discarding will lose your changes.', '你已编辑生成的内容。放弃将丢失这些更改。'],
    // 首次贡献提示、议题表单提示的句尾、经典页提交按钮、模板编辑器
    ['It looks like this is your first time opening an issue in this project!', '看起来这是你第一次在此项目中打开议题！'],
    ['It looks like this is your first time opening a pull request in this project!', '看起来这是你第一次在此项目中创建拉取请求！'],
    ['Be sure to review the', '请务必查看'],
    ['. Take a look before submitting an issue:', '。提交议题前请先查看：'],
    ['. Take a look before submitting a pull request:', '。提交拉取请求前请先查看：'],
    [', a new type of issue template.', '，这是一种新型议题模板。'],
    ['Submit new issue', '提交新议题'],
    ['Add template:', '添加模板：'],
    ['Preview and edit', '预览并编辑'],
    ['Add a placeholder for issue title, ex. [BUG]', '添加议题标题占位符，例如 [BUG]'],
    ['Create a report to help us improve', '创建报告以帮助我们改进'],
    // filter
    ['Search or filter', '搜索或筛选'],
    ['Advanced filters', '高级筛选器'],
    ['Add a filter', '添加筛选器'],
    // labels
    ['New label', '新建标签'],
    ["Something isn't working", '有功能不正常'],
    // 排序、按标签转换为讨论（原文两句，译文随原文分句）
    ['Reverse alphabetically', '按字母倒序'],
    ['Convert issue to discussion', '将议题转换为讨论'],
    [
      'You must choose a category for the discussion to belong to. You will be able to change this after the conversion is complete.',
      '你必须为讨论选择所属类别。转换完成后可以更改。'
    ],
    ['I understand, convert issues to discussions', '我已了解，将议题转换为讨论'],
    // milestones
    ['New milestone', '新建里程碑'],
    ['Closest due date', '截止日期最近'],
    ['Due date - Choose date...', '截止日期 - 选择日期...'],
    // views
    ['Saved views', '已保存的视图'],
    ['Set as default view', '设为默认视图'],
    ['Visible fields', '可见字段'],
    ['Delete view', '删除视图'],
    ['Column overview', '列概述'],
    ['Private view', '专用视图'],
    ['Retrying', '重试中'],
    // list
    ['Search Issues', '搜索议题'],
    ['No issues matched your search', '没有匹配的议题'],
    ['View options', '视图选项'],
    ['Private preview', '私密预览'],
    ['Keyboard Shortcut', '键盘快捷方式'],
    ['Advanced move...', '高级移动...'],
    ['Could not load more cards. Try again.', '无法加载更多卡片。请重试。'],
    ['Failed to load issues. Try refreshing the page.', '加载议题失败。请刷新页面。'],
    ['Could not delete the issue. The issue was restored. Please try again.', '无法删除议题。议题已恢复。请重试。'],
    // 仪表板视图说明、空状态、置顶议题、首次贡献横幅与维护者横幅（后两者在拉取请求列表同样生效）
    ['Issues mentioning you', '提及你的议题'],
    ['Welcome to issues!', '欢迎使用议题！'],
    ['There aren’t any open issues.', '没有打开的议题。'],
    ["There aren't any open issues.", '没有打开的议题。'],
    ['We encountered an error trying to load issues.', '加载议题时出错。'],
    ['Pinned issues', '置顶议题'],
    ['Open Source Guide', '开源指南'],
    ["we've collected some good first issues for you", '我们为你挑选了一些适合新手的议题'],
    ['Label issues and pull requests for new contributors', '为议题和拉取请求添加面向新贡献者的标签'],
    ['discover issues', '发现'],
    ['labeled with', '带有以下标签的议题']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('「X. (Please) try again.」保持两句，译作「…。请重试。」', () => {
    const entries = Object.entries({ ...dict.static, ...dict.scoped }).filter(([source]) => /\. (?:Please )?[Tt]ry again\.$/.test(source))
    expect(entries.length).toBeGreaterThan(20)
    expect(entries.filter(([, target]) => !/[^，]。请重试。$/.test(target))).toEqual([])
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Transfer issue \n', ['common', 'repository', 'issues'])).toBe('  转移议题 \n')
  })

  it('译文中不残留应译成中文的产品名（product-names.md）', () => {
    const english = /\b(?:Copilot Chat|[Cc]odespaces?|Workspace|Marketplace|GitHub (?:Actions|Pages|Packages|Mobile|Desktop))\b/
    const values = [...Object.values(dict.static ?? {}), ...Object.values(dict.scoped ?? {})]
    expect(values.filter(value => english.test(value))).toEqual([])
  })
})

describe('issues 页面词条', () => {
  it.each([
    ['No reason', '无原因'],
    ['Too heated', '争论过激'],
    ['Ready for review', '可供审查'],
    ['remaining', '剩余'],
    ['React', '添加反应'],
    ['closed this as', '将此议题关闭为'],
    ['added', '添加了'],
    ['in', '于'],
    ['blocked', '阻止了'],
    ['temporarily blocked', '暂时阻止了'],
    ['Assignees', '受理人'],
    ['No one assigned', '无受理人'],
    ['Relationships', '关系'],
    ['Add a title', '添加标题'],
    ['is one of', '是以下之一'],
    ['Active', '活跃'],
    ['complete', '已完成'],
    ['open', '个打开的'],
    ['closed', '个已关闭的'],
    ['Pinned', '已置顶'],
    ['Board', '看板'],
    ['Column by', '分列依据'],
    ['In progress', '正在进行'],
    ['Assigned to me', '分配给我的'],
    ['was merged', '合并于'],
    ['Select:', '选择：'],
    ['Past due by', '逾期'],
    ['Pre-release', '预发行版'],
    ["What's next?", '下一步做什么？'],
    ['If nothing happens, make sure', '如果没有响应，请确认'],
    ['Link pull requests', '链接拉取请求'],
    // 产品名按用户要求译成中文（product-names.md）：Copilot Workspace → 工作区、codespace → 代码空间
    ['Open in Workspace', '在工作区中打开'],
    ['Codespace creation failed', '代码空间创建失败'],
    ['Search repositories...', '搜索存储库...'],
    ['Eyes', '眼睛'],
    ['Closed as duplicate of', '已关闭为重复于'],
    ['Close as duplicate', '以重复关闭'],
    ['Linked pull requests', '链接的拉取请求'],
    ['Moderation', '调解'],
    ['if the problem persists.', '（如果仍然出错）。'],
    ['Author...', '作者...'],
    ['Pending', '挂起'],
    ['Failed to fetch repository data. Please try again.', '获取存储库数据失败。请重试。'],
    // 时间线片段（React 时间线的 as 单独成段）、议题表单提示的前两段、模板编辑器的下拉按钮
    ['as', '并标记为'],
    ['deleted this from', '从以下位置删除了此议题'],
    ["You're using an", '你正在使用'],
    ['You’re using an', '你正在使用'],
    ['issue form', '议题表单'],
    ['select', '选择'],
    ['Change branch source', '更改分支来源'],
    ['Convert issues to discussions', '将议题转换为讨论'],
    // 钉选汇总事件：同一条评论先后置顶、取消置顶，互逆并列用「和」（同「关注和取消关注」）；分句连接的片段仍用「并」
    ['pinned and unpinned a', '置顶和取消置顶了一条'],
    ['unpinned and pinned a', '取消置顶和重新置顶了一条'],
    ['and unpinned a', '并取消置顶了一条'],
    ['and pinned a', '并置顶了一条'],
    // 筛选器名称（FILTER_KEY 随 scoped 展开）
    ['Code language', '代码语言'],
    // 原文三句，译文随原文分句
    [
      'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.',
      '按空格键拿起可拖动的条目。拖动时用方向键移动条目。再按空格键将条目放到新位置，或按 Esc 取消。'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('/issues 仪表板、标签页与里程碑页同样生效', () => {
    expect(matcher.translate('Assigned to me', ['common', 'issues'])).toBe('分配给我的')
    expect(matcher.translate('12 labels matching', ['common', 'issues'])).toBe('12 个匹配项')
    expect(matcher.translate('Active', ['common', 'repository', 'issues'])).toBe('活跃')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Too heated', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Issue #12', ['common', 'pulls'])).toBeUndefined()
    expect(matcher.translate('Board', ['common', 'projects'])).toBeUndefined()
    expect(matcher.translate('12 labels matching', ['common', 'repository', 'pulls'])).toBeUndefined()
  })

  it('产品名不在问题词典中收录', () => {
    expect(dict.static?.Actions).toBeUndefined()
    expect(dict.scoped?.Actions).toBeUndefined()
    expect(translate('Actions')).toBeUndefined()
    expect(translate('Copilot')).toBeUndefined()
  })

  it('通用文字不在问题词典中', () => {
    const keys = ['Cancel', 'Save', 'Edit', 'Delete', 'Close', 'Learn more', 'Load more', 'Loading…']
    // 评论菜单、排序、重试等通用组件文字
    keys.push('Copy link', 'Quote reply', 'Oldest', 'Subscribe', 'Select all', 'Retry')
    for (const key of keys) {
      expect(dict.static?.[key]).toBeUndefined()
      expect(dict.scoped?.[key]).toBeUndefined()
    }
  })

  it('与通用词典译文相同的词条不重复收录', () => {
    const keys = ['Success', 'Popular', 'Thumbs up', 'Thumbs down', 'Something went wrong', 'Table', 'Status']
    // 评论与编辑器、未保存确认、筛选取值
    keys.push('– with', 'No description provided.', 'Type your description here…', "Couldn't load")
    keys.push('This repository has been archived.', 'An error occurred. Please try again.')
    keys.push('Discard changes?', 'Keep editing', 'Close and discard', 'Author', 'Open', 'Closed', 'Today')
    for (const key of keys) {
      expect(dict.static?.[key]).toBeUndefined()
      expect(dict.scoped?.[key]).toBeUndefined()
    }
  })

  it('已由通用词典、拉取请求词典或个人资料词典收录的词条不重复收录，问题页仍有译文', () => {
    // 通用词典：列表项说明、选择器占位；拉取请求词典 static：/issues 仪表板的拉取请求列表加载提示；
    // 个人资料词典 static：正文操作菜单的阻止、取消阻止用户
    const keys = ['More information available below.', 'Select repository', 'Select an option', 'Loading pull requests']
    keys.push('Block user', 'Unblock user')
    for (const key of keys) {
      expect(dict.static?.[key]).toBeUndefined()
      expect(dict.scoped?.[key]).toBeUndefined()
      expect(bundleMatcher.translate(key, ['common', 'repository', 'issues'])).toBeDefined()
    }
  })

  it('筛选器名称在 scoped 中只保留一份，查表映射仍完整', () => {
    // 侧栏标题由 metadata.ts 收录，筛选器建议列表的组合文字仍能用映射表翻译
    expect(dict.scoped?.Label).toBe('标签')
    expect(dict.scoped?.['Blocked by']).toBe('被阻止')
    expect(dict.scoped?.Comments).toBe('评论')
    expect(translate('Status, Filter, Issue status or pull request commit status')).toBe('状态，筛选器，议题状态或拉取请求的提交状态')
    expect(translate('Author, Filter, The author of the item')).toBe('作者，筛选器，项的作者')
    expect(dict.scoped?.['Interactions count']).toBe('交互数')
    expect(dict.scoped?.['Items linked to an issue or pull request']).toBe('链接了议题或拉取请求的项')
    expect(translate('Open, Value 2')).toBe('打开，值 2')
    // 可见性取值（is:private / is:public）
    expect(translate('Private, Value 1')).toBe('专用，值 1')
    expect(translate('Public, Value 1')).toBe('公共，值 1')
  })

  it('已保存视图的可见性：单独出现的 Private 由通用词典翻译，组合文字与之一致', () => {
    expect(dict.static?.Private).toBeUndefined()
    expect(dict.scoped?.Private).toBeUndefined()
    const scopes = ['common', 'repository', 'issues'] as const
    expect(bundleMatcher.translate('Private', scopes)).toBe('专用')
    expect(bundleMatcher.translate('Visibility: Private', scopes)).toBe('可见性：专用')
    expect(bundleMatcher.translate('Expand Private', scopes)).toBe('展开专用视图')
    expect(bundleMatcher.translate('Private view', scopes)).toBe('专用视图')
  })

  it('表单校验句由通用校验规则翻译，筛选器错误仍由筛选规则翻译', () => {
    const scopes = ['common', 'repository', 'issues'] as const
    expect(bundleMatcher.translate('Title is invalid', scopes)).toBe('标题无效')
    expect(bundleMatcher.translate("Name can't be blank. Name is invalid", scopes)).toBe('名称不能为空。名称无效')
    expect(bundleMatcher.translate('label:foo is invalid', scopes)).toBe('label:foo 无效')
  })
})

describe('issues 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('问题表单的模板文字、可能重复的问题标题、里程碑描述被忽略，头部搜索按钮与界面文字不被忽略', () => {
    document.body.innerHTML = `
      <form>
        <label class="elementLabel__a1b2">What happened?</label>
        <span class="CheckboxesElementGroupLabel__c3d4">Code of Conduct</span>
        <span class="checkboxOptionLabel__e5f6">I agree to follow this project's rules</span>
        <div class="dropdownMenuOverlay__g7h8"><span class="prc-ActionList-ItemLabel-i9j0">Chrome</span></div>
        <span class="issueTitleText__k1l2">Login fails on Safari</span>
        <button>Create more</button>
      </form>
      <p class="listDescription__m3n4">Q4 release scope</p>
      <div id="milestone-description"><p>Ship the new editor</p></div>
      <div class="milestoneTitleWrapper__o5p6"><h2>v2.0</h2></div>
      <div><input placeholder="Search Issues" /></div>
      <button class="Search-module__searchButton__q7r8" aria-label="Open quick search dialog, type / to search">
        <span class="Search-module__placeholder__s9t0">Type <kbd>/</kbd> to search</span>
      </button>
      <h2>Labels</h2>`
    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('What happened?')).toBe(true)
    expect(ignored('Code of Conduct')).toBe(true)
    expect(ignored("I agree to follow this project's rules")).toBe(true)
    expect(ignored('Chrome')).toBe(true)
    expect(ignored('Login fails on Safari')).toBe(true)
    expect(ignored('Q4 release scope')).toBe(true)
    expect(ignored('Ship the new editor')).toBe(true)
    expect(ignored('v2.0')).toBe(true)
    // 含 <kbd> 的搜索提示由引擎整句翻译
    expect(ignored('Type / to search')).toBe(false)
    expect(ignored('Create more')).toBe(false)
    expect(ignored('Labels')).toBe(false)
    expect(document.querySelector('input')?.closest(selector)).toBeNull()
  })

  it('查询框镜像层由全局忽略规则处理，不在问题词典中重复', () => {
    expect(dict.ignore).not.toContain('.styled-input-content')
    expect(dict.ignore).not.toContain('.styled-input-container > div > [aria-hidden="true"]')
  })

  it('标签选择器中的标签名由全局规则忽略（与 React、blocked 等页面词条同形），选择器界面文字不被忽略', () => {
    document.body.innerHTML = `
      <div role="dialog">
        <h2>Apply labels to this issue</h2>
        <ul role="listbox">
          <li role="option"><span class="labelNameText__xVR7LL">React</span></li>
          <li role="option"><span class="labelNameText__xVR7LL">blocked</span></li>
          <li role="option"><span>Create new label: "React"</span></li>
        </ul>
      </div>`
    const selector = IGNORE_SELECTORS.join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('React')).toBe(true)
    expect(ignored('blocked')).toBe(true)
    expect(ignored('Apply labels to this issue')).toBe(false)
    expect(ignored('Create new label: "React"')).toBe(false)
  })

  it('筛选框 label: 的取值建议：标签名忽略，说明、无值 / 有值两项与其他取值照常翻译', () => {
    document.body.innerHTML = `
      <ul role="listbox">
        <li role="option" aria-label="No Label, Label"><span><span class="displayName__vz3s9U" id="none">No label</span></span></li>
        <li role="option" aria-label="Has Label, Label"><span><span class="displayName__vz3s9U" id="any">Has label</span></span></li>
        <li role="option" aria-label="enhancement, Label">
          <span><span class="displayName__vz3s9U" id="name">enhancement</span></span>
          <span class="prc-ActionList-Description-dtt0n" id="description">New feature or request</span>
        </li>
        <li role="option" aria-label="Open, Is"><span><span class="displayName__vz3s9U" id="open">Open</span></span></li>
        <li role="option" aria-label="bug，标签"><span><span class="displayName__vz3s9U" id="translated">bug</span></span></li>
        <li role="option" aria-label="无标签，标签"><span><span class="displayName__vz3s9U" id="none-translated">No label</span></span></li>
        <li role="option" aria-label="有标签，标签"><span><span class="displayName__vz3s9U" id="any-translated">Has label</span></span></li>
        <li role="option" aria-label="No label, Label"><span><span class="displayName__vz3s9U" id="lookalike">No label</span></span></li>
      </ul>`
    const selector = (dict.ignore ?? []).join(', ')
    expect(pulls.ignore).toContain(LABEL_SUGGESTION_IGNORE)
    expect(document.querySelector('#name')?.closest(selector)).not.toBeNull()
    expect(document.querySelector('#translated')?.closest(selector)).not.toBeNull()
    // 名为 No label 的用户标签：aria-label 为“No label, Label”，与无值项（“No Label, Label”）大小写不同，仍忽略
    expect(document.querySelector('#lookalike')?.closest(selector)).not.toBeNull()
    expect(document.querySelector('#description')?.closest(selector)).toBeNull()
    expect(document.querySelector('#open')?.closest(selector)).toBeNull()
    // 无值、有值两项：aria-label 为原文或译文时都不忽略
    for (const id of ['none', 'any', 'none-translated', 'any-translated']) {
      expect(document.getElementById(id)?.closest(selector)).toBeNull()
    }
  })

  it('筛选框 label: 的取值建议（繁体）：按繁体译文排除无值、有值两项，标签名仍忽略', () => {
    document.body.innerHTML = `
      <ul role="listbox">
        <li role="option" aria-label="無標籤，標籤"><span><span class="displayName__vz3s9U" id="none">No label</span></span></li>
        <li role="option" aria-label="有標籤，標籤"><span><span class="displayName__vz3s9U" id="any">Has label</span></span></li>
        <li role="option" aria-label="bug，標籤"><span><span class="displayName__vz3s9U" id="translated">bug</span></span></li>
        <li role="option" aria-label="Has Label, Label"><span><span class="displayName__vz3s9U" id="source">Has label</span></span></li>
      </ul>`
    expect(document.querySelector('#translated')?.closest(TW_LABEL_SUGGESTION_IGNORE)).not.toBeNull()
    for (const id of ['none', 'any', 'source']) {
      expect(document.getElementById(id)?.closest(TW_LABEL_SUGGESTION_IGNORE)).toBeNull()
    }
  })

  it('默认标签名是用户内容，不作全站词条（目录名、存储库名、项目选项同形时不误译），只进名称表', () => {
    const matcher = createMatcher(zhCN)
    const names = ['accessibility', 'enhancement', 'good first issue', 'help wanted', 'invalid', 'question', 'wontfix']
    for (const scope of [['common'], ['common', 'repository', 'commits'], ['common', 'repository', 'pulls']]) {
      for (const name of [...names, 'duplicate']) expect(matcher.translate(name, scope as PageKey[])).toBeUndefined()
    }
    for (const name of names) expect(matcher.translate(name, ['common', 'repository', 'issues'])).toBeUndefined()
    // 名称表只用于标签名称区域（见 core/translator-labels.test.ts）
    for (const name of [...names, 'duplicate']) expect(matcher.translateLabel(name, 'name'), name).toMatch(/[一-鿿]/)
    // 默认标签的说明照常翻译
    expect(matcher.translate('Barrier affecting people with disabilities', ['common'])).toBeDefined()
  })

  it('头部搜索提示整句交给通用词典，不被问题词条截获', () => {
    expect(dict.static?.['Type / to search']).toBeUndefined()
    expect(dict.scoped?.['Type / to search']).toBeUndefined()
    expect(translate('Type / to search')).toBeUndefined()
  })
})

/** 存储库问题页的作用域 */
const SCOPE: readonly PageKey[] = ['common', 'repository', 'issues']

/** 时间线事件行的操作者（结构同采集到的添加标签事件） */
const ACTOR =
  '<div class="eventActorContainer___J4CtD"><a class="eventActorLink__jICdM_ prc-Link-Link-9ZwDx" data-component="Link" data-muted="true" data-testid="actor-link" role="link" href="/octocat">' +
  '<img data-component="Avatar" class="alignSelfCenter__9ABbp_ prc-Avatar-Avatar-0xaUi" alt="" width="16" height="16" src="https://avatars.githubusercontent.com/u/583231?s=64&amp;v=4" data-testid="github-avatar">' +
  '<span class="eventProfileReference__2-PNtH">octocat</span></a></div>'

/** 时间线事件行句末的时间链接 */
const AGO =
  '<a class="timelineAgoLink__C5_JHt prc-Link-Link-9ZwDx" data-component="Link" href="https://github.com/octo-org/hello-world/issues/12#event-1">' +
  '<relative-time data-component="RelativeTime" format="micro" tense="past" threshold="P30D" datetime="2026-10-19T07:05:11.000Z" title="Oct 19, 2026, 3:05 PM GMT+8">on Oct 19, 2026</relative-time></a>'

/** 被删评论作者的链接（CommentDeletedEvent） */
const AUTHOR_LINK =
  '<a class="deletedCommentAuthorLink__RJN3Il prc-Link-Link-9ZwDx" data-component="Link" data-inline="true" href="/hubot"><span>hubot</span></a>'

/** 时间线“加载更多”（LoadMore）：计数与 remaining / items 分在嵌套 span 中 */
const LOAD_MORE =
  '<div data-testid="issue-timeline-load-more-container-load-top" class="loadMoreContentContainer__Qg1Clv"><div class="innerContentWrapper__0lTRlX"><div class="centeredContent__GXvLUU">' +
  '<div class="headingWrapper__Vj7xPN"><h3 id="heading" class="remainingItemsHeading__DW2RIn"><span data-testid="issue-timeline-load-more-count-load-top">12</span><span> remaining <span>items</span></span></h3></div>' +
  '<div class="buttonWrapper__BcMgD5"><button type="button" class="prc-Button-ButtonBase-c50BI" data-testid="issue-timeline-load-more-load-top" aria-describedby="heading"><span class="prc-Button-ButtonContent-HKbr-"><span data-component="text" class="prc-Button-Label-pTQ3x"><div class="buttonChildrenWrapper__R817fz">Load more</div></span></span></button></div>' +
  '</div></div></div>'

/** 置顶议题卡片（PinnedIssueCard，结构同采集到的 /issues 列表页） */
const PINNED_CARD =
  '<ul class="container__07jUsY area__cYPRPP" aria-label="Drag and drop pinned issues list."><li class="position-relative container__qnX6sL"><div class="PinnedIssueContainer__vsm37n"><div class="contentContainer__YWSx_8">' +
  '<div class="titleOptionsContainer__za47RM"><a id="title" class="css-truncate Link___MAuNs prc-Link-Link-9ZwDx" data-component="Link" data-muted="true" aria-label="View Sample text" href="https://github.com/octo-org/hello-world/issues/12">' +
  '<span class="Octicon__oAwWNb"><svg data-component="Octicon" focusable="false" aria-label="Status: Open." class="octicon octicon-issue-opened" role="img" viewBox="0 0 16 16" width="16" height="16"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path></svg></span>' +
  '<span class="prc-Text-Text-9mHv3" data-component="Text">Sample text</span></a>' +
  '<button id="options" class="IconButton__gWFP_o prc-Button-ButtonBase-c50BI" type="button" aria-label="Pinned issue #12 options"></button></div>' +
  '<div class="metadataContainer__Ut21pG"><span class="issueMetadata__Z8VAxr">#<!-- -->12</span></div>' +
  '</div></div></li></ul>'

describe('issues 被元素拆开的句子与属性（DOM）', () => {
  let translator: Translator | undefined

  /** 用完整语言包按页面类型翻译 html（通用词典的 Contact support、Load more 等同时生效） */
  function render(html: string, pages: readonly PageKey[] = SCOPE): HTMLElement {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: bundleMatcher, host: window, resolvePages: () => pages })
    translator.start()
    return document.body
  }

  /** 显示文字：时间元素的文字由元素自己在 shadowRoot 里渲染，这里记作「<时间>」 */
  function shown(id: string): string {
    const clone = document.getElementById(id)?.cloneNode(true) as Element | undefined
    for (const time of clone?.querySelectorAll('relative-time') ?? []) time.textContent = '<时间>'
    return (clone?.textContent ?? '').replace(/\s+/g, ' ').trim()
  }

  /** 元素内全部文本节点的文字（含后代） */
  function texts(element: Element | null): string[] {
    const walker = document.createTreeWalker(element ?? document.body, NodeFilter.SHOW_TEXT)
    const result: string[] = []
    for (let node = walker.nextNode(); node; node = walker.nextNode()) result.push((node as Text).data)
    return result
  }

  /** 等待变动回调处理完 */
  function settle(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('删除评论事件：<操作者> deleted a comment from <用户> <时间> 整句译出，语序调整', () => {
    render(`<div class="timelineBodyContent__Uq4b9L" id="event">${ACTOR}deleted a comment from ${AUTHOR_LINK} ${AGO}</div>`)
    expect(shown('event')).toBe('octocat 删除了 hubot 的一条评论 <时间>')
    // 链接内的用户名原样保留
    expect(document.querySelector('#event [data-testid="actor-link"]')?.textContent).toBe('octocat')
    expect(document.querySelector('#event [class*="deletedCommentAuthorLink__"]')?.textContent).toBe('hubot')
  })

  it('删除评论事件：没有时间链接时同样整句译出', () => {
    render(`<div class="timelineBodyContent__Uq4b9L" id="event">${ACTOR}deleted a comment from ${AUTHOR_LINK} </div>`)
    expect(shown('event')).toBe('octocat 删除了 hubot 的一条评论')
  })

  it('删除评论事件：停止后还原', () => {
    render(`<div class="timelineBodyContent__Uq4b9L" id="event">${ACTOR}deleted a comment from ${AUTHOR_LINK} ${AGO}</div>`)
    translator?.stop()
    translator = undefined
    // 操作者容器与文字之间原本没有空白（容器是块级元素）
    expect(shown('event')).toBe('octocatdeleted a comment from hubot <时间>')
  })

  it('时间线错误占位：说明 + <联系支持> + 句尾整句译出，链接移到句末', () => {
    render(
      '<div class="Blankslate prc-Blankslate-Blankslate-oYfTM" data-component="Blankslate"><h2 class="Blankslate-Heading prc-Blankslate-Heading-rCrgF">Timeline cannot be loaded</h2>' +
        '<p class="Blankslate-Description prc-Blankslate-Description-nqiRV" data-component="Blankslate.Description" id="description">The timeline is currently unavailable due to a system error. Try reloading the page. <a class="prc-Link-Link-9ZwDx" data-component="Link" data-inline="true" href="https://support.github.com/contact">Contact support</a> if the problem persists.</p></div>'
    )
    expect(shown('description')).toBe('系统错误，时间线暂不可用。请尝试重新加载页面。仍然出错时请联系支持。')
    expect(document.querySelector('h2')?.textContent).toBe('无法加载时间线')
  })

  it('加载更多标题：<span>12</span><span> remaining <span>items</span></span> 整段合并为“还有 12 项”', () => {
    const body = render(LOAD_MORE)
    const heading = body.querySelector('#heading')!
    expect(heading.textContent).toBe('还有 12 项')
    // 译文写入第一个文本节点，其余置空
    expect(texts(heading)).toEqual(['还有 12 项', '', ''])
    expect(body.querySelector('[class*="buttonChildrenWrapper__"]')?.textContent).toBe('加载更多')
  })

  it('加载更多标题：单数 item 与 React 改写计数后整段重算', async () => {
    const body = render(LOAD_MORE.replace('>12<', '>1<').replace('<span>items</span>', '<span>item</span>'))
    const heading = body.querySelector('#heading')!
    expect(heading.textContent).toBe('还有 1 项')
    const count = heading.querySelector('span')!.firstChild as Text
    count.data = '13'
    await settle()
    expect(heading.textContent).toBe('还有 13 项')
  })

  it('加载更多标题：停止后还原', () => {
    const body = render(LOAD_MORE)
    translator?.stop()
    translator = undefined
    expect(texts(body.querySelector('#heading'))).toEqual(['12', ' remaining ', 'items'])
  })

  it('置顶议题卡片：aria-label「View <标题>」改写为「查看 <标题>」，标题原样，其他属性照常查词典', () => {
    const body = render(PINNED_CARD)
    expect(body.querySelector('#title')?.getAttribute('aria-label')).toBe('查看 Sample text')
    expect(body.querySelector('#title span[data-component="Text"]')?.textContent).toBe('Sample text')
    expect(body.querySelector('#title svg')?.getAttribute('aria-label')).toBe('状态：打开。')
    expect(body.querySelector('#options')?.getAttribute('aria-label')).toBe('置顶议题 #12 的选项')
    expect(body.querySelector('ul')?.getAttribute('aria-label')).toBe('可拖放的置顶议题列表。')
  })

  it('置顶议题卡片：标题含界面词、中文时同样原样保留，停止后还原', () => {
    const body = render(
      PINNED_CARD.replace('aria-label="View Sample text"', 'aria-label="View View options for 示例"').replace(
        '>Sample text<',
        '>View options for 示例<'
      )
    )
    const title = body.querySelector('#title')!
    expect(title.getAttribute('aria-label')).toBe('查看 View options for 示例')
    translator?.stop()
    translator = undefined
    expect(title.getAttribute('aria-label')).toBe('View View options for 示例')
  })

  it('置顶议题卡片：以半角标点开头的标题与“查看”隔开', () => {
    const body = render(PINNED_CARD.replace('aria-label="View Sample text"', 'aria-label="View [Bug] Sample text"'))
    expect(body.querySelector('#title')?.getAttribute('aria-label')).toBe('查看 [Bug] Sample text')
  })

  it('筛选器校验条目：被 <code> 拆开的句子整句译出，<code> 在句末的按片段译出', () => {
    // 结构按 filter/ValidationMessage.tsx 简化：每条消息是一段内联 HTML
    render(`
      <ul>
        <li><span id="invalid">Invalid value <code>foo</code> for <code>label</code></span></li>
        <li><span id="empty">Empty value for <code>author</code></span></li>
      </ul>`)
    expect(shown('invalid')).toBe('无效值 foo 用于筛选器 label')
    expect(shown('empty')).toBe('以下筛选器的值为空 author')
  })

  it('属性规则选择器不依赖 aria-label 的取值', () => {
    const selectors = (dict.attributeRules ?? []).map(([selector]) => selector)
    expect(selectors.length).toBeGreaterThan(0)
    expect(selectors.filter(selector => /\[aria-label[~|^$*]?=/.test(selector))).toEqual([])
    for (const selector of selectors) expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('行内句、整段合并与属性规则只在问题页面类型生效', () => {
    // 用 wiki 页面类型对照：pulls 的 React 对话页用同一时间线组件，之后可能加同样的规则
    const body = render(
      `<div class="timelineBodyContent__Uq4b9L" id="event">${ACTOR}deleted a comment from ${AUTHOR_LINK} ${AGO}</div>${LOAD_MORE}${PINNED_CARD}`,
      ['common', 'repository', 'wiki']
    )
    expect(shown('event')).not.toContain('删除了 hubot 的一条评论')
    // 不整段合并：计数节点原样，items 由通用词典逐段翻译
    expect(texts(body.querySelector('#heading')).slice(0, 2)).toEqual(['12', ' remaining '])
    expect(body.querySelector('#title')?.getAttribute('aria-label')).toBe('View Sample text')
  })
})

/**
 * 筛选框 label: 的取值建议（filter/suggestions/SuggestionItem）：aria-label 在 li 上，显示名在 displayName__ 里。
 * 无值、有值两项由 filter-core 的 getNoValueSuggestion / getHasValueSuggestion 生成：
 * aria-label 为“No Label, Label”“Has Label, Label”，显示名为 No label、Has label
 */
const LABEL_SUGGESTIONS =
  '<ul role="listbox">' +
  '<li role="option" id="none-option" aria-label="No Label, Label"><span><span class="displayName__vz3s9U" id="none">No label</span></span></li>' +
  '<li role="option" id="any-option" aria-label="Has Label, Label"><span><span class="displayName__vz3s9U" id="any">Has label</span></span></li>' +
  '<li role="option" aria-label="enhancement, Label"><span><span class="displayName__vz3s9U" id="enhancement">enhancement</span></span>' +
  '<span class="prc-ActionList-Description-dtt0n" id="description">New feature or request</span></li>' +
  '<li role="option" aria-label="documentation, Label"><span><span class="displayName__vz3s9U" id="documentation">documentation</span></span></li>' +
  '</ul>'

interface LabelSuggestionLocale {
  readonly name: string
  /** 完整语言包 */
  readonly matcher: Matcher
  /** No label、Has label 的译文 */
  readonly values: readonly [none: string, any: string]
  /** 两项 aria-label 的译文 */
  readonly ariaLabels: readonly [none: string, any: string]
  /** 标签说明 New feature or request 的译文 */
  readonly description: string
}

const LABEL_SUGGESTION_LOCALES: readonly LabelSuggestionLocale[] = [
  {
    name: 'zh-CN',
    matcher: bundleMatcher,
    values: ['无标签', '有标签'],
    ariaLabels: ['无标签，标签', '有标签，标签'],
    description: '新功能或功能请求'
  },
  {
    name: 'zh-TW',
    matcher: createMatcher(zhTW),
    values: ['無標籤', '有標籤'],
    ariaLabels: ['無標籤，標籤', '有標籤，標籤'],
    description: '新功能或功能請求'
  }
]

describe.each(LABEL_SUGGESTION_LOCALES)('筛选框 label: 的取值建议（DOM，$name）', locale => {
  let translator: Translator | undefined

  /** 用完整语言包按存储库问题页的页面类型翻译 html */
  function render(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: locale.matcher, host: window, resolvePages: () => SCOPE })
    translator.start()
  }

  function text(id: string): string | null | undefined {
    return document.getElementById(id)?.textContent
  }

  /** 等待变动回调处理完 */
  function settle(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('No label、Has label 与标签说明照常翻译，标签名 enhancement、documentation 保持原文', () => {
    render(LABEL_SUGGESTIONS)
    expect(text('none')).toBe(locale.values[0])
    expect(text('any')).toBe(locale.values[1])
    expect(document.getElementById('none-option')?.getAttribute('aria-label')).toBe(locale.ariaLabels[0])
    expect(document.getElementById('any-option')?.getAttribute('aria-label')).toBe(locale.ariaLabels[1])
    expect(text('description')).toBe(locale.description)
    expect(text('enhancement')).toBe('enhancement')
    expect(text('documentation')).toBe('documentation')
  })

  it('React 把显示名写回原文后（aria-label 已是译文）重新翻译', async () => {
    render(LABEL_SUGGESTIONS)
    ;(document.getElementById('none')!.firstChild as Text).data = 'No label'
    ;(document.getElementById('any')!.firstChild as Text).data = 'Has label'
    await settle()
    expect(text('none')).toBe(locale.values[0])
    expect(text('any')).toBe(locale.values[1])
    expect(text('enhancement')).toBe('enhancement')
  })

  it('停止后还原', () => {
    render(LABEL_SUGGESTIONS)
    translator?.stop()
    translator = undefined
    expect(text('none')).toBe('No label')
    expect(document.getElementById('any-option')?.getAttribute('aria-label')).toBe('Has Label, Label')
  })
})

/** 参考词库对照补收的词条（各区域代表）：[原文, 简体, 繁体] */
const GAP_CASES: readonly (readonly [string, string, string])[] = [
  // list
  ['Issues mentioning you', '提及你的议题', '提及你的議題'],
  ['There aren’t any open issues.', '没有打开的议题。', '沒有開放中的議題。'],
  ['Pinned issues', '置顶议题', '已釘選的議題'],
  ['discover issues', '发现', '探索'],
  // viewer
  ['Reopen Issue', '重新打开议题', '重新開啟議題'],
  ['The issue has been unpinned.', '议题已取消置顶。', '議題已取消釘選。'],
  ["Won't fix, can't repro, duplicate, stale", '不修复、无法复现、重复、已过时', '不予修正、無法重現、重複、過時'],
  // timeline（scoped）
  ['as', '并标记为', '並標示為'],
  ['deleted this from', '从以下位置删除了此议题', '從以下位置刪除了此議題'],
  // metadata
  ['Assign Copilot to issue', '将 Copilot 分配给议题', '將 Copilot 指派給議題'],
  ['Assign agent to issue', '将智能体分配给议题', '將代理指派給議題'],
  ['Change branch source', '更改分支来源', '變更分支來源'],
  ['Link a pull request from this repository', '链接此存储库中的拉取请求', '連結此儲存庫中的拉取請求'],
  // create
  ['Submit new issue', '提交新议题', '送出新議題'],
  ['issue form', '议题表单', '議題表單'],
  ['Template name', '模板名称', '範本名稱'],
  ['Documentation has changed since you last contributed', '自你上次贡献以来文档已更改', '自你上次貢獻以來說明文件已變更'],
  ['. Take a look before submitting an issue:', '。提交议题前请先查看：', '。送出議題前請先查看：'],
  // labels
  ['Alphabetically', '按字母顺序', '依字母順序'],
  ['Convert issues to discussions', '将议题转换为讨论', '將議題轉換為討論'],
  ['Issue will be locked', '议题将被锁定', '議題將會鎖定'],
  // filter：筛选器名称与建议列表的组合文字（FILTER_KEY 查表）
  ['Code language', '代码语言', '程式碼語言'],
  ['Has code language', '有代码语言', '有程式碼語言'],
  ['No code language', '无代码语言', '無程式碼語言'],
  ['Exclude code-language', '排除代码语言', '排除程式碼語言'],
  ['Code language, Filter', '代码语言，筛选器', '程式碼語言，篩選器'],
  // filter：Exclude <限定符> 按筛选器名称译
  ['Exclude created', '排除创建日期', '排除建立日期'],
  ['Exclude closed', '排除关闭日期', '排除關閉日期'],
  ['Exclude merged', '排除合并日期', '排除合併日期'],
  ['Exclude org', '排除组织', '排除組織'],
  ['Exclude reason', '排除关闭原因', '排除關閉原因']
]

/** static 在其他页面类型同样生效（盖过别处正则的误配），scoped 不外溢：[作用域, 原文, 简体, 繁体] */
const GAP_SCOPE_CASES: readonly (readonly [readonly PageKey[], string, string | undefined, string | undefined])[] = [
  [
    ['common', 'repository', 'pulls'],
    'Label issues and pull requests for new contributors',
    '为议题和拉取请求添加面向新贡献者的标签',
    '為議題和拉取請求加上適合新貢獻者的標籤'
  ],
  [['common', 'repository', 'pulls'], 'labeled with', '带有以下标签的议题', '帶有以下標籤的議題'],
  [['common', 'repository', 'commits', 'pulls'], 'Be sure to review the', '请务必查看', '請務必詳閱'],
  [
    ['common', 'repository', 'commits', 'pulls'],
    'It looks like this is your first time opening a pull request in this project!',
    '看起来这是你第一次在此项目中创建拉取请求！',
    '看來這是你第一次在此專案中建立拉取請求！'
  ],
  [
    ['common', 'repository', 'commits', 'pulls'],
    '. Take a look before submitting a pull request:',
    '。提交拉取请求前请先查看：',
    '。送出拉取請求前請先查看：'
  ],
  [['common', 'repository', 'repo-settings'], 'Add template:', '添加模板：', '新增範本：'],
  [['common', 'repository', 'releases'], 'Preview and edit', '预览并编辑', '預覽並編輯'],
  [['common', 'repository', 'copilot'], 'Assign agent to issue', '将智能体分配给议题', '將代理指派給議題'],
  [['common', 'repository', 'pulls'], 'as', undefined, undefined],
  [['common', 'repository', 'pulls'], 'select', undefined, undefined]
]

/** 贡献指南链接 */
const GUIDELINES_LINK = '<a href="/vuejs/core/blob/main/CONTRIBUTING.md">'

/**
 * 被链接、标签元素拆开的横幅（片段顺序同参考词库，标签固定在句末；默认标签名由标签表翻译，自定义标签名保持原文）：
 * [名称, 作用域, html, 简体, 繁体]
 */
const GAP_BANNERS: readonly (readonly [string, readonly PageKey[], string, string, string])[] = [
  [
    '维护者横幅 Now, GitHub will help … <discover issues> labeled with <默认标签>',
    ['common', 'repository', 'pulls'],
    'Now, GitHub will help potential first-time contributors <a href="/vuejs/core/contribute">discover issues</a> ' +
      'labeled with <span class="IssueLabel">good first issue</span>',
    '现在，GitHub 将帮助潜在的首次贡献者 发现 带有以下标签的议题 适合新手的议题',
    '現在，GitHub 會協助潛在的首次貢獻者 探索 帶有以下標籤的議題 適合新手的議題'
  ],
  [
    '维护者横幅 Now, GitHub will help … <discover issues> labeled with <自定义标签>',
    ['common', 'repository', 'pulls'],
    'Now, GitHub will help potential first-time contributors <a href="/vuejs/core/contribute">discover issues</a> ' +
      'labeled with <span class="IssueLabel">scope: vapor</span>',
    '现在，GitHub 将帮助潜在的首次贡献者 发现 带有以下标签的议题 scope: vapor',
    '現在，GitHub 會協助潛在的首次貢獻者 探索 帶有以下標籤的議題 scope: vapor'
  ],
  [
    '比较页 Documentation has changed … Take a look before submitting a pull request: <Contributing guidelines>',
    ['common', 'repository', 'commits', 'pulls'],
    '<strong>Documentation has changed since you last contributed</strong>. Take a look before submitting a pull request: ' +
      `${GUIDELINES_LINK}Contributing guidelines</a>`,
    '自你上次贡献以来文档已更改。提交拉取请求前请先查看：贡献指南',
    '自你上次貢獻以來說明文件已變更。送出拉取請求前請先查看：貢獻指南'
  ],
  [
    '比较页 It looks like … opening a pull request … Be sure to review the <contributing guidelines>.',
    ['common', 'repository', 'commits', 'pulls'],
    'It looks like this is your first time opening a pull request in this project! Be sure to review the ' +
      `${GUIDELINES_LINK}contributing guidelines</a>.`,
    '看起来这是你第一次在此项目中创建拉取请求！请务必查看 贡献指南。',
    '看來這是你第一次在此專案中建立拉取請求！請務必詳閱 貢獻指南。'
  ]
]

interface GapLocale {
  readonly name: string
  /** 期望译文在用例中的下标：简体 1，繁体 2 */
  readonly index: 1 | 2
  /** 完整语言包 */
  readonly full: Matcher
}

const GAP_LOCALES: readonly GapLocale[] = [
  { name: 'zh-CN', index: 1, full: bundleMatcher },
  { name: 'zh-TW', index: 2, full: createMatcher(zhTW) }
]

describe.each(GAP_LOCALES)('参考词库对照补收（完整语言包，$name）', ({ index, full }) => {
  it.each(GAP_CASES)('%s', (source, cn, tw) => {
    expect(full.translate(source, SCOPE)).toBe(index === 1 ? cn : tw)
  })

  it.each(GAP_SCOPE_CASES)('%j：%s', (scope, source, cn, tw) => {
    expect(full.translate(source, scope)).toBe(index === 1 ? cn : tw)
  })

  it('React 时间线 closed this | as | not planned 逐段拼读', () => {
    const parts = ['closed this', 'as', 'not planned'].map(part => full.translate(part, SCOPE))
    expect(parts).toEqual(index === 1 ? ['关闭了此议题', '并标记为', '未计划'] : ['關閉了此議題', '並標示為', '不予處理'])
  })

  describe('被链接、标签元素拆开的横幅（DOM）', () => {
    let translator: Translator | undefined

    afterEach(() => {
      translator?.stop()
      translator = undefined
      document.body.innerHTML = ''
    })

    it.each(GAP_BANNERS)('%s', (_name, scope, html, cn, tw) => {
      document.body.innerHTML = `<p id="banner">${html}</p>`
      translator = createTranslator({ matcher: full, host: window, resolvePages: () => scope })
      translator.start()
      expect(document.getElementById('banner')?.textContent).toBe(index === 1 ? cn : tw)
    })
  })
})

/** 默认标签（GitHub、Dependabot 预置）的名称：[原文, 简体, 繁体] */
const DEFAULT_LABEL_NAMES: readonly (readonly [string, string, string])[] = [
  ['bug', '缺陷', '錯誤'],
  ['documentation', '文档', '說明文件'],
  ['duplicate', '重复', '重複'],
  ['enhancement', '改进', '改進'],
  ['good first issue', '适合新手的议题', '適合新手的議題'],
  ['help wanted', '需要帮助', '需要協助'],
  ['invalid', '无效', '無效'],
  ['question', '疑问', '疑問'],
  ['wontfix', '不予修复', '不予修正'],
  ['dependencies', '依赖项', '相依項目'],
  ['accessibility', '辅助功能', '無障礙']
]

/** 与默认标签名同形、另有词条的普通词（搜索语法说明里的 documentation 链接、时间线的关闭原因 duplicate） */
const SHARED_LABEL_WORDS: ReadonlySet<string> = new Set(['documentation', 'duplicate'])

/** 默认标签的说明：[原文, 简体, 繁体] */
const DEFAULT_LABEL_DESCRIPTIONS: readonly (readonly [string, string, string])[] = [
  ['Barrier affecting people with disabilities', '影响残障人士使用的障碍', '影響身心障礙者使用的障礙'],
  ["Something isn't working", '有功能不正常', '某些功能無法正常運作'],
  ['Something isn’t working', '有功能不正常', '某些功能無法正常運作'],
  ['Improvements or additions to documentation', '文档改进或补充', '說明文件的改進或補充'],
  ['This issue or pull request already exists', '此议题或拉取请求已存在', '此議題或拉取請求已存在'],
  ['New feature or request', '新功能或功能请求', '新功能或功能請求'],
  ['Good for newcomers', '适合新手', '適合新手'],
  ['Extra attention is needed', '需要额外关注', '需要特別注意'],
  ["This doesn't seem right", '这似乎不对', '這似乎不對'],
  ['This doesn’t seem right', '这似乎不对', '這似乎不對'],
  ['Further information is requested', '需要更多信息', '需要更多資訊'],
  ['This will not be worked on', '不会处理', '不會處理'],
  ['Pull requests that update a dependency file', '更新依赖文件的拉取请求', '更新相依性檔案的拉取請求']
]

/** 标签区域里 GitHub 写入的占位文字（新建、编辑标签对话框的预览令牌）：[原文, 简体, 繁体] */
const LABEL_PLACEHOLDERS: readonly (readonly [string, string, string])[] = [['Label preview', '标签预览', '標籤預覽']]

/** React 标签令牌（结构取自采集页面）：文字在 TokenTextContainer 里的 prc-Text 中 */
const LABEL_TOKEN = (name: string, id: string): string =>
  '<span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM IssueLabelToken__0H-m6r">' +
  '<span class="prc-Token-TokenTextContainer-cOUaD">' +
  `<span class="prc-Text-Text-9mHv3" data-component="Text" id="${id}">${name}</span></span></span>`

/**
 * 标签页列表行（结构取自采集页面，内容换成中性占位）：屏幕阅读器读的行标题、标签链接里的令牌、说明。
 * 行的无障碍名称是标签名加计数；没有打开的议题、拉取请求时（counted 为 false）只有标签名加句点
 */
const LABEL_ROW = (name: string, description: string, id: string, counted = true): string =>
  `<li data-label-id="${id}" role="listitem" aria-label="${name}.${counted ? ' 1 open issues1 open issues.' : ''}">` +
  '<div class="container__mDVuhO sr-only" data-listview-item-title-container="true">' +
  `<h4 class="heading__fzQskI"><span id="${id}-title">${name}</span></h4></div>` +
  '<div class="container__W45oI6 labelRowDescription__BiyOt7"><div class="default__oxxQZ0">' +
  `<a aria-label="${name}" href="/vuejs/core/issues?q=label%3A1" id="${id}-link">${LABEL_TOKEN(name, `${id}-name`)}</a>` +
  ` </div><div class="default__oxxQZ0 labelRowDescriptionItemDescription__btj1EZ" id="${id}-desc">${description}</div>` +
  '</div></li>'

/**
 * Dependabot 生态标签的说明：[原文, 简体, 繁体]（旧标签的生态名小写，新建的首字母大写，GitHub Actions 另有说明；
 * 产品名 GitHub Actions 按术语表第 3 节译出，其余生态名保持原文）
 */
const ECOSYSTEM_DESCRIPTIONS: readonly (readonly [string, string, string])[] = [
  ['Pull requests that update javascript code', '更新 javascript 代码的拉取请求', '更新 javascript 程式碼的拉取請求'],
  ['Pull requests that update Javascript code', '更新 Javascript 代码的拉取请求', '更新 Javascript 程式碼的拉取請求'],
  ['Pull requests that update GitHub Actions code', '更新 GitHub 操作代码的拉取请求', '更新 GitHub 動作程式碼的拉取請求'],
  ['Pull requests that update .net code', '更新 .net 代码的拉取请求', '更新 .net 程式碼的拉取請求']
]

/** 拉取请求列表、项目页的作用域 */
const PULLS_SCOPE: readonly PageKey[] = ['common', 'repository', 'pulls']
const PROJECTS_SCOPE: readonly PageKey[] = ['common', 'organization', 'projects']

interface LabelLocale {
  readonly name: string
  /** 期望译文在用例中的下标：简体 1，繁体 2 */
  readonly index: 1 | 2
  /** 完整语言包 */
  readonly bundle: LocaleBundle
  readonly full: Matcher
  /** 词典导出的无障碍名称用标签名 */
  readonly nameOf: (name: string) => string
  /** 术语表文件（docs 下） */
  readonly glossary: string
}

const LABEL_LOCALES: readonly LabelLocale[] = [
  { name: 'zh-CN', index: 1, bundle: zhCN, full: bundleMatcher, nameOf: labelName, glossary: 'GLOSSARY.md' },
  {
    name: 'zh-TW',
    index: 2,
    bundle: zhTW,
    full: createMatcher(zhTW),
    nameOf: twLabelName,
    glossary: 'GLOSSARY.zh-TW.md'
  }
]

/** 术语表第 4 节的默认标签行：原文列、译文列按“ / ”拆开，逐项配对 */
function glossaryLabelNames(file: string): readonly (readonly [string, string])[] {
  const row = readFileSync(resolve(__dirname, '../../../docs', file), 'utf8')
    .split('\n')
    .find(line => line.startsWith('| 默认标签：'))
  if (row === undefined) throw new Error(`${file} 没有默认标签行`)
  const [sources = '', targets = ''] = row
    .split('|')
    .slice(1, 3)
    .map(cell => cell.trim())
  const names = sources.replace(/^默认标签：/, '').split(' / ')
  const translations = targets.split(' / ')
  expect(translations, file).toHaveLength(names.length)
  return names.map((name, i) => [name, translations[i] ?? ''] as const)
}

describe.each(LABEL_LOCALES)('默认标签表（完整语言包，$name）', ({ index, bundle, full, nameOf, glossary }) => {
  it('名称表只收默认标签名与名称区域里的占位文字，说明表只收默认说明；语言包里只有议题词典带这两张表与标签正则', () => {
    // 合并出的词典都带 labels、labelDescriptions、labelRegexp 字段（可能为空），按有无条目判断
    const owners = bundle.filter(
      ([, dict]) =>
        Object.keys(dict.labels ?? {}).length > 0 ||
        Object.keys(dict.labelDescriptions ?? {}).length > 0 ||
        (dict.labelRegexp ?? []).length > 0
    )
    expect(owners.map(([page]) => page)).toEqual(['issues'])
    expect(Object.keys(owners[0]?.[1].labels ?? {}).sort()).toEqual(
      [...DEFAULT_LABEL_NAMES, ...LABEL_PLACEHOLDERS].map(([source]) => source).sort()
    )
    expect(Object.keys(owners[0]?.[1].labelDescriptions ?? {}).sort()).toEqual(DEFAULT_LABEL_DESCRIPTIONS.map(([source]) => source).sort())
    expect(owners[0]?.[1].labelRegexp).toHaveLength(1)
  })

  it.each(LABEL_PLACEHOLDERS)('占位文字 %s：名称表与 static 同译，说明区域不译', (source, cn, tw) => {
    expect(full.translateLabel(source, 'name')).toBe(index === 1 ? cn : tw)
    expect(full.translateLabel(source, 'description')).toBeUndefined()
    expect(full.translate(source, SCOPE)).toBe(index === 1 ? cn : tw)
    expect(nameOf(source)).toBe(source)
  })

  it('术语表第 4 节的默认标签行与名称表逐项一致', () => {
    const rows = glossaryLabelNames(glossary)
    expect(rows.map(([source]) => source)).toEqual(DEFAULT_LABEL_NAMES.map(([source]) => source))
    for (const [source, target] of rows) {
      expect(full.translateLabel(source, 'name'), source).toBe(target)
      expect(nameOf(source), source).toBe(target)
    }
  })

  it.each(DEFAULT_LABEL_NAMES)('名称 %s：只进名称表，不作全站词条，说明区域不译', (source, cn, tw) => {
    const expected = index === 1 ? cn : tw
    expect(full.translateLabel(source, 'name')).toBe(expected)
    expect(full.translateLabel(source, 'description')).toBeUndefined()
    expect(nameOf(source)).toBe(expected)
    // 同形的普通词另有词条时译文与名称表相同
    expect(full.translate(source, SCOPE)).toBe(SHARED_LABEL_WORDS.has(source) ? expected : undefined)
  })

  it.each(DEFAULT_LABEL_DESCRIPTIONS)('说明 %s：说明表与 static 同译，名称区域不译', (source, cn, tw) => {
    expect(full.translateLabel(source, 'description')).toBe(index === 1 ? cn : tw)
    expect(full.translateLabel(source, 'name')).toBeUndefined()
    expect(full.translate(source, ['common'])).toBe(index === 1 ? cn : tw)
    // 说明不是标签名：无障碍名称里不按说明改写
    expect(nameOf(source)).toBe(source)
  })

  it.each(ECOSYSTEM_DESCRIPTIONS)('生态标签的说明 %s：说明区域按标签正则、区域外按全站 regexp 同译，名称区域不译', (source, cn, tw) => {
    const expected = index === 1 ? cn : tw
    expect(full.translateLabel(source, 'description')).toBe(expected)
    expect(full.translateLabel(source, 'name')).toBeUndefined()
    // 标签选择器、拉取请求侧栏令牌的 title 等：与 static 里的默认说明一样全站生效
    for (const scope of [['common'], SCOPE, PULLS_SCOPE, PROJECTS_SCOPE, ['common', 'dashboard']] as const) {
      expect(full.translate(source, scope), scope.join('|')).toBe(expected)
    }
  })

  it('整段区分大小写匹配：大小写不同、自定义名、带表情、多段的不收；首尾空白照原文保留', () => {
    for (const source of [
      'Bug',
      'BUG',
      'Good First Issue',
      'scope: vapor',
      '🐞 bug',
      'bug question',
      'good first',
      'javascript',
      'Pull requests that update docs'
    ]) {
      expect(full.translateLabel(source, 'name'), source).toBeUndefined()
      expect(full.translateLabel(source, 'description'), source).toBeUndefined()
      expect(nameOf(source)).toBe(source)
    }
    expect(full.translateLabel('\n  bug\n', 'name')).toBe(index === 1 ? '\n  缺陷\n' : '\n  錯誤\n')
  })

  it('存档确认句：默认标签名与令牌同译，自定义标签名保持原文', () => {
    const sentence = (name: string): string =>
      `Archiving hides "${name}" so it can’t be added to discussions, issues, or pull requests. It remains on anything that already uses it, and you can unarchive it any time.`
    const expected = (name: string): string =>
      index === 1
        ? `存档后，“${name}”将被隐藏，无法再添加到讨论、议题或拉取请求中。已使用它的内容会保留该标签，你可以随时取消存档。`
        : `封存會隱藏「${name}」，使其無法再加入討論、議題或拉取請求。已使用此標籤的項目會保留它，你可以隨時取消封存。`
    for (const [source, cn, tw] of DEFAULT_LABEL_NAMES) {
      expect(full.translate(sentence(source), SCOPE), source).toBe(expected(index === 1 ? cn : tw))
    }
    expect(full.translate(sentence('scope: vapor'), SCOPE)).toBe(expected('scope: vapor'))
    expect(full.translate(sentence('Bug'), SCOPE)).toBe(expected('Bug'))
  })

  describe('标签区域（DOM）', () => {
    let translator: Translator | undefined

    afterEach(() => {
      translator?.stop()
      translator = undefined
      document.body.innerHTML = ''
    })

    function render(html: string, scope: readonly PageKey[] = SCOPE): void {
      translator?.stop()
      document.body.innerHTML = html
      translator = createTranslator({ matcher: full, host: window, resolvePages: () => scope })
      translator.start()
    }

    /** 等待变动回调处理完 */
    const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

    const row = (id: string): string | null | undefined => document.querySelector(`[data-label-id="${id}"]`)?.getAttribute('aria-label')
    const label = (id: string): string | null | undefined => document.getElementById(id)?.getAttribute('aria-label')
    const text = (id: string): string | null | undefined => document.getElementById(id)?.textContent

    it('标签页列表行，默认标签：行与标签链接的无障碍名称、令牌、说明都译出，行标题保持原文；自定义标签保持原文；stop 后还原', () => {
      render(
        '<ul data-listview-component="items-list">' +
          `${LABEL_ROW('documentation', 'Improvements or additions to documentation', 'doc')}` +
          `${LABEL_ROW('scope: vapor', 'related to vapor mode', 'custom')}</ul>`
      )
      const [name, description, count] =
        index === 1 ? ['文档', '文档改进或补充', '1 个打开的议题'] : ['說明文件', '說明文件的改進或補充', '1 個開放中的議題']
      expect(row('doc')).toBe(`${name}。${count}。`)
      expect(label('doc-link')).toBe(name)
      // 屏幕阅读器读的行标题不在标签区域里（React 读它的文字拼行的无障碍名称，见下一条）
      expect(text('doc-title')).toBe('documentation')
      expect(text('doc-name')).toBe(name)
      expect(text('doc-desc')).toBe(description)
      expect(row('custom')).toBe(`scope: vapor。${count}。`)
      expect(label('custom-link')).toBe('scope: vapor')
      expect(text('custom-title')).toBe('scope: vapor')
      expect(text('custom-name')).toBe('scope: vapor')
      expect(text('custom-desc')).toBe('related to vapor mode')
      translator!.stop()
      expect(row('doc')).toBe('documentation. 1 open issues1 open issues.')
      expect(label('doc-link')).toBe('documentation')
      expect(text('doc-title')).toBe('documentation')
      expect(text('doc-name')).toBe('documentation')
      expect(text('doc-desc')).toBe('Improvements or additions to documentation')
    })

    it('标签页列表行：React 在副作用里读行标题的文字、重拼行的无障碍名称，读到的是原文；停用后还原为原文', async () => {
      render(
        '<ul data-listview-component="items-list">' +
          `${LABEL_ROW('documentation', 'Improvements or additions to documentation', 'doc')}` +
          `${LABEL_ROW('good first issue', 'Good for newcomers', 'gfi', false)}</ul>`
      )
      // 列表条目的 TitleProvider：被动副作用（晚于变动回调）读行标题的 textContent，按它重拼行的 aria-label
      for (const [id, counted] of [
        ['doc', true],
        ['gfi', false]
      ] as const) {
        const title = document.getElementById(`${id}-title`)?.textContent?.trim() ?? ''
        document
          .querySelector(`[data-label-id="${id}"]`)
          ?.setAttribute('aria-label', counted ? `${title}. 1 open issues1 open issues.` : `${title}.`)
      }
      await settle()
      const [doc, gfi, count] =
        index === 1 ? ['文档', '适合新手的议题', '1 个打开的议题'] : ['說明文件', '適合新手的議題', '1 個開放中的議題']
      expect(row('doc')).toBe(`${doc}。${count}。`)
      expect(row('gfi')).toBe(`${gfi}。`)
      translator!.stop()
      expect(row('doc')).toBe('documentation. 1 open issues1 open issues.')
      expect(row('gfi')).toBe('good first issue.')
    })

    it('标签页列表行，没有打开的议题与拉取请求：行的无障碍名称只有标签名，默认标签同译；生态标签的说明译出，生态名保持原文', () => {
      render(
        '<ul data-listview-component="items-list">' +
          `${LABEL_ROW('good first issue', 'Good for newcomers', 'gfi', false)}` +
          `${LABEL_ROW('regression', 'related to vapor mode', 'reg', false)}` +
          `${LABEL_ROW('javascript', 'Pull requests that update javascript code', 'js', false)}</ul>`
      )
      const [name, ecosystem] =
        index === 1 ? ['适合新手的议题', '更新 javascript 代码的拉取请求'] : ['適合新手的議題', '更新 javascript 程式碼的拉取請求']
      expect(row('gfi')).toBe(`${name}。`)
      expect(label('gfi-link')).toBe(name)
      expect(text('gfi-name')).toBe(name)
      expect(row('reg')).toBe('regression.')
      expect(text('reg-name')).toBe('regression')
      expect(row('js')).toBe('javascript.')
      expect(text('js-name')).toBe('javascript')
      expect(text('js-desc')).toBe(ecosystem)
      translator!.stop()
      expect(row('gfi')).toBe('good first issue.')
      expect(text('js-desc')).toBe('Pull requests that update javascript code')
    })

    it('区域外同样的文字不按标签表翻译：同一段里的标签区域译出，区域外的标签名保持原文', () => {
      render(
        '<p id="banner">Sample text good first issue <span class="IssueLabel" id="inside">good first issue</span></p>' +
          '<a class="Link--primary" href="/vuejs/core/tree/main/help%20wanted" id="dir">help wanted</a>'
      )
      expect(text('inside')).toBe(index === 1 ? '适合新手的议题' : '適合新手的議題')
      expect(document.getElementById('banner')?.firstChild?.textContent).toBe('Sample text good first issue ')
      expect(text('dir')).toBe('help wanted')
    })

    it('议题、拉取请求列表的标签筛选按钮：无障碍名称里的默认标签名与令牌同译，自定义标签名保持原文', () => {
      const html =
        `<button type="button" class="filterLink__ywNfwR" aria-label="Filter by label bug" id="default">${LABEL_TOKEN('bug', 'default-name')}</button>` +
        `<button type="button" class="filterLink__OXCGsP" aria-label="Filter by label scope: vapor" id="custom">${LABEL_TOKEN('scope: vapor', 'custom-name')}</button>`
      for (const scope of [SCOPE, PULLS_SCOPE]) {
        render(html, scope)
        expect(text('default-name')).toBe(index === 1 ? '缺陷' : '錯誤')
        expect(label('default')).toBe(index === 1 ? '按标签缺陷筛选' : '依標籤錯誤篩選')
        expect(text('custom-name')).toBe('scope: vapor')
        expect(label('custom')).toContain('scope: vapor')
        expect(label('custom')).not.toBe('Filter by label scope: vapor')
      }
      translator!.stop()
      expect(label('default')).toBe('Filter by label bug')
    })

    it('项目卡片的标签令牌、移除中（按钮禁用）的删除按钮：无障碍名称里的默认标签名与令牌同译，已存档的前加“已存档”', () => {
      /** 项目卡片的标签令牌（按钮本身是令牌）：已存档的标签名前有存档图标，无障碍名称是 Label: Archived 加标签名 */
      const card = (name: string, id: string, archived = false): string =>
        `<button class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM IssueLabelToken__0H-m6r" aria-label="Label: ${archived ? 'Archived ' : ''}${name}" id="${id}">` +
        '<span class="prc-Token-TokenTextContainer-cOUaD">' +
        (archived ? '<span class="archivedIcon__6ud3yr"><svg aria-label="Archived" role="img"></svg></span>' : '') +
        `<span class="prc-Text-Text-9mHv3" data-component="Text">${name}</span></span></button>`
      render(
        `${card('question', 'card')}${card('Enterprise', 'card-custom')}` +
          `${card('wontfix', 'card-archived', true)}${card('Enterprise', 'card-archived-custom', true)}`,
        PROJECTS_SCOPE
      )
      expect(text('card')).toBe(index === 1 ? '疑问' : '疑問')
      expect(label('card')).toBe(index === 1 ? '标签：疑问' : '標籤：疑問')
      expect(text('card-custom')).toBe('Enterprise')
      expect(label('card-custom')).toBe(index === 1 ? '标签：Enterprise' : '標籤：Enterprise')
      expect(text('card-archived')).toBe(index === 1 ? '不予修复' : '不予修正')
      expect(label('card-archived')).toBe(index === 1 ? '标签：已存档不予修复' : '標籤：已封存不予修正')
      expect(text('card-archived-custom')).toBe('Enterprise')
      expect(label('card-archived-custom')).toBe(index === 1 ? '标签：已存档 Enterprise' : '標籤：已封存 Enterprise')
      translator!.stop()
      expect(label('card-archived')).toBe('Label: Archived wontfix')

      // 移除中按钮禁用，名称直接写在 aria-label 上（常态见下一条）
      const removable = (name: string, id: string): string =>
        `<span class="labelToken__Q1w2E3">${LABEL_TOKEN(name, `${id}-name`)}` +
        `<button type="button" class="prc-Button-ButtonBase-9n-Xk" aria-label="Remove label: ${name}" disabled id="${id}"></button></span>`
      render(`${removable('help wanted', 'remove')}${removable('scope: vapor', 'remove-custom')}`)
      expect(text('remove-name')).toBe(index === 1 ? '需要帮助' : '需要協助')
      expect(label('remove')).toBe(index === 1 ? '删除标签：需要帮助' : '移除標籤：需要協助')
      expect(label('remove-custom')).toBe(index === 1 ? '删除标签：scope: vapor' : '移除標籤：scope: vapor')
      translator!.stop()
      expect(label('remove')).toBe('Remove label: help wanted')
    })

    it('可删除标签的删除按钮（常态）：名称取自提示文字，其中的默认标签名与令牌同译，已存档的前加“已存档”，自定义名保持原文', () => {
      /** 图标按钮不带 aria-label，由 aria-labelledby 指向提示；提示文字是 Remove label: 加无障碍名称（已存档的加 Archived） */
      const removable = (name: string, id: string, archived = false): string =>
        `<span class="removableLabelContainer__Q1w2E3">${LABEL_TOKEN(name, `${id}-name`)}` +
        `<button data-component="IconButton" type="button" class="prc-Button-ButtonBase-9n-Xk" aria-labelledby="${id}-tip" id="${id}"></button>` +
        '<span class="prc-TooltipV2-Tooltip-tLeuB" data-direction="s" data-component="Tooltip" aria-hidden="true" ' +
        `id="${id}-tip" popover="auto">Remove label: ${archived ? 'Archived ' : ''}${name}</span></span>`
      render(
        `${removable('help wanted', 'remove')}${removable('scope: vapor', 'remove-custom')}` +
          `${removable('wontfix', 'remove-archived', true)}${removable('scope: vapor', 'remove-archived-custom', true)}` +
          `${removable('待办', 'remove-archived-cjk', true)}`
      )
      const expected =
        index === 1
          ? ['删除标签：需要帮助', '删除标签：scope: vapor', '删除标签：已存档不予修复', '删除标签：已存档 scope: vapor']
          : ['移除標籤：需要協助', '移除標籤：scope: vapor', '移除標籤：已封存不予修正', '移除標籤：已封存 scope: vapor']
      expect(text('remove-name')).toBe(index === 1 ? '需要帮助' : '需要協助')
      expect(text('remove-tip')).toBe(expected[0])
      expect(text('remove-custom-tip')).toBe(expected[1])
      expect(text('remove-archived-tip')).toBe(expected[2])
      expect(text('remove-archived-custom-tip')).toBe(expected[3])
      expect(text('remove-archived-cjk-tip')).toBe(index === 1 ? '删除标签：已存档待办' : '移除標籤：已封存待办')
      translator!.stop()
      expect(text('remove-tip')).toBe('Remove label: help wanted')
      expect(text('remove-archived-tip')).toBe('Remove label: Archived wontfix')
    })

    it('议题侧栏的标签链接：令牌、屏幕阅读器说明、说明提示的文字与无障碍名称都译出，自定义说明保持原文', () => {
      /** 侧栏标签（结构取自采集页面）：链接里是令牌与屏幕阅读器说明，链接后的说明提示带 aria-label */
      const sidebar = (name: string, description: string, id: string): string =>
        `<a class="labelLink__AJlImc prc-Link-Link-9ZwDx" href="/vuejs/core/issues?q=label%3A1" aria-describedby="${id}-sr ${id}-tip">` +
        `${LABEL_TOKEN(name, `${id}-name`)}<span class="sr-only" id="${id}-sr">${description}</span></a>` +
        '<span class="labelDescriptionTooltip__3yeDxA tooltipVisible__OdIxx8 prc-TooltipV2-Tooltip-tLeuB" ' +
        `data-direction="s" data-component="Tooltip" aria-label="${description}" role="tooltip" aria-hidden="true" ` +
        `id="${id}-tip" popover="auto">${description}</span>`
      render(
        `${sidebar('question', 'Further information is requested', 'q')}` +
          `${sidebar('javascript', 'Pull requests that update javascript code', 'js')}` +
          `${sidebar('scope: vapor', 'related to vapor mode', 'custom')}` +
          // 自定义说明恰好是默认标签名、自定义标签名恰好是默认说明：名称与说明分开匹配，都保持原文
          `${sidebar('a11y', 'accessibility', 'a11y')}${sidebar('Good for newcomers', 'related to vapor mode', 'gfn')}`
      )
      const [name, description, ecosystem] =
        index === 1
          ? ['疑问', '需要更多信息', '更新 javascript 代码的拉取请求']
          : ['疑問', '需要更多資訊', '更新 javascript 程式碼的拉取請求']
      expect(text('q-name')).toBe(name)
      expect(text('q-sr')).toBe(description)
      expect(text('q-tip')).toBe(description)
      expect(label('q-tip')).toBe(description)
      expect(text('js-tip')).toBe(ecosystem)
      expect(label('js-tip')).toBe(ecosystem)
      expect(text('custom-tip')).toBe('related to vapor mode')
      expect(label('custom-tip')).toBe('related to vapor mode')
      expect(text('a11y-sr')).toBe('accessibility')
      expect(text('a11y-tip')).toBe('accessibility')
      expect(label('a11y-tip')).toBe('accessibility')
      expect(text('gfn-name')).toBe('Good for newcomers')
      translator!.stop()
      expect(label('q-tip')).toBe('Further information is requested')
      expect(label('js-tip')).toBe('Pull requests that update javascript code')
    })

    it('已存档的标签：令牌（带存档图标）里的默认标签名译出；标签页链接与删除按钮的无障碍名称里 Archived 都译出，默认标签名同译，自定义名保持原文', () => {
      /** 已存档的令牌：文字容器里先是包着存档图标的元素，再是文字 */
      const archived = (name: string, id: string): string =>
        '<span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM IssueLabelToken__0H-m6r">' +
        '<span class="prc-Token-TokenTextContainer-cOUaD"><span class="archivedIcon__6ud3yr">' +
        '<svg aria-label="Archived" role="img" class="octicon octicon-archive" viewBox="0 0 16 16" width="12" height="12">' +
        '<path d="M0 2.75"></path></svg></span>' +
        `<span class="prc-Text-Text-9mHv3" data-component="Text" id="${id}">${name}</span></span></span>`
      /** 标签页已存档行：链接的无障碍名称是 Archived 加标签名 */
      const archivedRow = (name: string, id: string): string =>
        `<li data-label-id="${id}" role="listitem" aria-label="${name}.">` +
        '<div class="container__mDVuhO sr-only" data-listview-item-title-container="true">' +
        `<h4 class="heading__fzQskI"><span id="${id}-title">${name}</span></h4></div>` +
        '<div class="container__W45oI6 labelRowDescription__BiyOt7"><div class="default__oxxQZ0">' +
        `<a aria-label="Archived ${name}" href="/vuejs/core/issues?q=label%3A1" id="${id}-link">${archived(name, `${id}-name`)}</a>` +
        ' </div></div></li>'
      const removable = (name: string, id: string): string =>
        `<span class="removableLabelContainer__Q1w2E3">${archived(name, `${id}-name`)}` +
        `<button type="button" class="prc-Button-ButtonBase-9n-Xk" aria-label="Remove label: Archived ${name}" disabled id="${id}"></button></span>`
      render(
        `<ul data-listview-component="items-list">${archivedRow('wontfix', 'won')}${archivedRow('scope: vapor', 'custom')}` +
          `${archivedRow('待办', 'cjk')}</ul>` +
          `${removable('help wanted', 'remove')}${removable('scope: vapor', 'remove-custom')}`
      )
      const [name, linkName, removeName, archivedPrefix, removePrefix] =
        index === 1
          ? ['不予修复', '已存档不予修复', '删除标签：已存档需要帮助', '已存档', '删除标签：已存档']
          : ['不予修正', '已封存不予修正', '移除標籤：已封存需要協助', '已封存', '移除標籤：已封存']
      expect(text('won-name')).toBe(name)
      // 行标题不在标签区域里（见“React 在副作用里读行标题的文字”）
      expect(text('won-title')).toBe('wontfix')
      expect(row('won')).toBe(`${name}。`)
      expect(label('won-link')).toBe(linkName)
      expect(label('remove')).toBe(removeName)
      expect(text('remove-name')).toBe(index === 1 ? '需要帮助' : '需要協助')
      expect(text('custom-name')).toBe('scope: vapor')
      expect(label('custom-link')).toBe(`${archivedPrefix} scope: vapor`)
      expect(label('cjk-link')).toBe(`${archivedPrefix}待办`)
      expect(text('remove-custom-name')).toBe('scope: vapor')
      expect(label('remove-custom')).toBe(`${removePrefix} scope: vapor`)
      translator!.stop()
      expect(text('won-name')).toBe('wontfix')
      expect(label('won-link')).toBe('Archived wontfix')
      expect(label('custom-link')).toBe('Archived scope: vapor')
      expect(label('remove')).toBe('Remove label: Archived help wanted')
    })

    it('新建、编辑标签对话框的预览令牌：占位文字与输入的默认标签名、令牌的无障碍名称同译；自定义名称保持原文', async () => {
      render(
        '<div class="container__pR3vW1"><span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM IssueLabelToken__0H-m6r" ' +
          'aria-label="Label preview" id="preview"><span class="prc-Token-TokenTextContainer-cOUaD" id="preview-name">Label preview</span></span></div>'
      )
      const preview = index === 1 ? '标签预览' : '標籤預覽'
      expect(text('preview-name')).toBe(preview)
      expect(label('preview')).toBe(preview)
      // React 按输入改写令牌的文字与无障碍名称
      const token = document.getElementById('preview')!
      const node = document.getElementById('preview-name')!.firstChild as Text
      token.setAttribute('aria-label', 'bug')
      node.data = 'bug'
      await settle()
      expect(text('preview-name')).toBe(index === 1 ? '缺陷' : '錯誤')
      expect(label('preview')).toBe(index === 1 ? '缺陷' : '錯誤')
      token.setAttribute('aria-label', 'scope: vapor')
      node.data = 'scope: vapor'
      await settle()
      expect(text('preview-name')).toBe('scope: vapor')
      expect(label('preview')).toBe('scope: vapor')
      // 与普通词条同形的自定义名称（Security 在全站词典里另有译文）：令牌的文字与无障碍名称都保持原文
      expect(full.translate('Security', SCOPE)).toBeDefined()
      token.setAttribute('aria-label', 'Security')
      node.data = 'Security'
      await settle()
      expect(text('preview-name')).toBe('Security')
      expect(label('preview')).toBe('Security')
    })

    it('拉取请求概览侧栏的标签令牌：title 是标签说明，默认说明与生态说明都译出（区域外的说明全站生效）', () => {
      /** 令牌本身是链接，不在忽略区域里，title 照常查词典 */
      const token = (name: string, description: string, id: string): string =>
        `<a class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM IssueLabelToken__0H-m6r" href="/vuejs/core/pulls?q=label%3A1" title="${description}" id="${id}">` +
        `<span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3" data-component="Text" id="${id}-name">${name}</span></span></a>`
      render(
        `${token('dependencies', 'Pull requests that update a dependency file', 'deps')}` +
          `${token('javascript', 'Pull requests that update javascript code', 'js')}`,
        PULLS_SCOPE
      )
      const title = (id: string): string | null | undefined => document.getElementById(id)?.getAttribute('title')
      expect(text('deps-name')).toBe(index === 1 ? '依赖项' : '相依項目')
      expect(title('deps')).toBe(index === 1 ? '更新依赖文件的拉取请求' : '更新相依性檔案的拉取請求')
      expect(text('js-name')).toBe('javascript')
      expect(title('js')).toBe(index === 1 ? '更新 javascript 代码的拉取请求' : '更新 javascript 程式碼的拉取請求')
      translator!.stop()
      expect(title('js')).toBe('Pull requests that update javascript code')
    })
  })
})
