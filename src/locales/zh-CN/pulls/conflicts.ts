import type { PageDictionary } from '../../../core/types'

/**
 * 冲突编辑器（/pull/N/conflicts）：标题、冲突文件列表与计数、键盘提示、标记为已解决、冲突选择按钮、提交合并对话框。
 * 缩进与换行设置（Indent mode、Line wrap mode 等）由代码编辑器的全局词条处理；缩进模式选项 Spaces / Tabs 见 scoped。
 */
export default {
  static: {
    // 键盘提示
    'Keyboard hints': '键盘提示',
    'How to interact with code conflict editor via keyboard': '如何通过键盘操作代码冲突编辑器',
    'Toggle between edit mode and tab focus mode': '在编辑模式和 Tab 焦点模式之间切换',
    'Navigation between elements with tab focus mode on': '开启 Tab 焦点模式时在元素间导航',
    'Move to next conflict control after accepting suggestion': '接受建议后移到下一个冲突控件',
    'Exit editor': '退出编辑器',
    // 冲突选择
    'Accept current change': '接受当前更改',
    'Accept incoming change': '接受传入更改',
    'Accept both changes': '接受双方更改',
    'Remove all conflict markers to resolve this file': '删除所有冲突标记以解决此文件的冲突',
    // 提交合并对话框
    'Sign off and commit merge': '签署并提交合并',
    'Committing merge…': '正在提交合并…',
    'Heads up, this will commit to': '请注意，这将提交到',
    'and commit updates. Your pull request will be updated automatically.': '并提交更改。你的拉取请求将自动更新。',
    'I understand, sign off and update': '我已了解，签署并更新'
  },
  scoped: {
    // 标题：Resolving conflicts between <main> and <feature> and committing changes → <feature>
    'Resolving conflicts': '正在解决冲突',
    between: '介于',
    'and committing changes': '之间并提交更改',
    // 文件列表：<2> conflicting files；文件行：<3> conflicts
    'conflicting file': '个冲突文件',
    'conflicting files': '个冲突文件',
    conflict: '处冲突',
    conflicts: '处冲突',
    'Mark as resolved': '标记为已解决',
    'Commit merge': '提交合并',
    // Commit updates to the <feature> branch. / Create a <new branch> and commit updates. …
    'Commit updates to the': '提交更改到',
    'new branch': '新分支',
    // You are <signing off> on this commit as …
    'You are': '你正在',
    // 缩进模式下拉框（与 code、gist 一致）。拉取请求页没有其他单独的 Spaces / Tabs：
    // Copilot 导航的 Spaces（空间）只在智能体会话页，该页作用域含 copilot，以 copilot 的译法为准
    Spaces: '空格',
    Tabs: '制表符'
  },
  regexp: [
    [/^(\d+) conflicting files?$/, '$1 个冲突文件'],
    [/^(\d+) conflicts?$/, '$1 处冲突'],
    // 原文无标点：You are <signing off> on this commit as … → 你正在签署此提交并署名为 …
    [/^on this commit as (.+@.+)$/, '此提交并署名为 $1'],
    [/^I understand, sign off and update (\S+)$/, '我已了解，签署并更新 $1']
  ]
} satisfies PageDictionary
