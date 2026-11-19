import type { PageDictionary } from '../../../core/types'

/**
 * 冲突编辑器（/pull/N/conflicts）：标题、冲突文件列表与计数、键盘提示、标记为已解决、冲突选择按钮、提交合并对话框。
 * 缩进与换行设置（Indent mode、Line wrap mode 等）由代码编辑器的全局词条处理；缩进模式选项 Spaces / Tabs 见 scoped。
 * 冲突选择按钮与 VS Code 繁中的合并冲突操作同译（接受目前變更、接受傳入變更、接受兩者變更）。
 */
export default {
  static: {
    // 键盘提示
    'Keyboard hints': '鍵盤提示',
    'How to interact with code conflict editor via keyboard': '如何透過鍵盤操作程式碼衝突編輯器',
    'Toggle between edit mode and tab focus mode': '在編輯模式和 Tab 焦點模式之間切換',
    'Navigation between elements with tab focus mode on': '開啟 Tab 焦點模式時在元素之間瀏覽',
    'Move to next conflict control after accepting suggestion': '接受建議後移到下一個衝突控制項',
    'Exit editor': '離開編輯器',
    // 冲突选择
    'Accept current change': '接受目前變更',
    'Accept incoming change': '接受傳入變更',
    'Accept both changes': '接受兩者變更',
    'Remove all conflict markers to resolve this file': '移除所有衝突標記以解決此檔案的衝突',
    // 提交合并对话框
    'Sign off and commit merge': '簽署並提交合併',
    'Committing merge…': '正在提交合併…',
    'Heads up, this will commit to': '請注意，這會提交到',
    'and commit updates. Your pull request will be updated automatically.': '並提交更新。你的拉取請求將會自動更新。',
    'I understand, sign off and update': '我瞭解，簽署並更新'
  },
  scoped: {
    // 标题：Resolving conflicts between <main> and <feature> and committing changes → <feature>
    'Resolving conflicts': '正在解決衝突',
    between: '介於',
    'and committing changes': '之間並提交變更',
    // 文件列表：<2> conflicting files；文件行：<3> conflicts
    'conflicting file': '個衝突檔案',
    'conflicting files': '個衝突檔案',
    conflict: '處衝突',
    conflicts: '處衝突',
    'Mark as resolved': '標示為已解決',
    'Commit merge': '提交合併',
    // Commit updates to the <feature> branch. / Create a <new branch> and commit updates. …
    'Commit updates to the': '將更新提交到',
    'new branch': '新分支',
    // You are <signing off> on this commit as …
    'You are': '你正在',
    // 缩进模式下拉框（与 code、gist 一致）。拉取请求页没有其他单独的 Spaces / Tabs：
    // Copilot 导航的 Spaces（空間）只在代理会话页，该页作用域含 copilot，以 copilot 的译法为准
    Spaces: '空格',
    Tabs: '定位字元'
  },
  regexp: [
    [/^(\d+) conflicting files?$/, '$1 個衝突檔案'],
    [/^(\d+) conflicts?$/, '$1 處衝突'],
    // 原文无标点：You are <signing off> on this commit as … → 你正在 簽署 此提交並署名為 …（与 code 词典同译）
    [/^on this commit as (.+@.+)$/, '此提交並署名為 $1'],
    [/^I understand, sign off and update (\S+)$/, '我瞭解，簽署並更新 $1']
  ]
} satisfies PageDictionary
