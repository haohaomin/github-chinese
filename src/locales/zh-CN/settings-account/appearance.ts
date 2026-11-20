import type { PageDictionary } from '../../../core/types'

/** 键盘组合键片段：control + k、command + option + k */
const KEY_COMBO = '((?:control|command|ctrl|cmd|alt|option|shift) \\+ (?:(?:control|command|ctrl|cmd|alt|option|shift) \\+ )*\\S)'

/**
 * 外观（/settings/appearance）：主题首选项与主题名、对比度、表情符号肤色、制表符宽度、Markdown 编辑器字体、时间戳显示；
 * 辅助功能（/settings/accessibility）：键盘快捷方式、命令面板、动效、链接下划线、悬停卡片、编辑器设置、辅助技术提示。
 * 「Increase contrast」「Light mode」「Dark mode」「Keyboard shortcuts」「Command palette」由 common 收录。
 */
export default {
  static: {
    // 主题首选项
    'Theme preferences': '主题首选项',
    'Choose how GitHub looks to you. Select a single theme, or sync with your system and automatically switch between day and night themes. Selections are applied immediately and saved automatically.':
      '选择 GitHub 的外观。可使用单一主题，或跟随系统在日间和夜间主题之间自动切换。所选设置立即生效并自动保存。',
    'Theme mode': '主题模式',
    'Single theme': '单一主题',
    'GitHub will use your selected theme': 'GitHub 将使用你选择的主题',
    'GitHub theme will match your system active settings': 'GitHub 主题将跟随系统当前设置',
    'Day theme': '日间主题',
    'Night theme': '夜间主题',
    'Light theme': '浅色主题',
    'Dark theme': '深色主题',
    'This theme will be active when your system is set to “light mode”': '系统设为“浅色模式”时使用此主题',
    'This theme will be active when your system is set to “dark mode”': '系统设为“深色模式”时使用此主题',
    'This theme will be active when your system is set to "light mode"': '系统设为“浅色模式”时使用此主题',
    'This theme will be active when your system is set to "dark mode"': '系统设为“深色模式”时使用此主题',
    // 主题选择区的无障碍名称；Active Mode 是当前主题旁「Active」标签的说明
    'Single theme picker': '单一主题选择器',
    'Light theme picker': '浅色主题选择器',
    'Dark theme picker': '深色主题选择器',
    'Active Mode': '当前模式',
    'Selected theme:': '所选主题：',

    // 主题名
    'Light default': '浅色默认',
    'Light high contrast': '浅色高对比度',
    'Light Protanopia & Deuteranopia': '浅色红绿色盲',
    'Light protanopia & deuteranopia': '浅色红绿色盲',
    'Light Protanopia and Deuteranopia': '浅色红绿色盲',
    'Light protanopia and deuteranopia': '浅色红绿色盲',
    'Light Tritanopia': '浅色蓝黄色盲',
    'Light tritanopia': '浅色蓝黄色盲',
    'Light colorblind': '浅色色盲',
    'Dark default': '深色默认',
    'Dark high contrast': '深色高对比度',
    'Dark Protanopia & Deuteranopia': '深色红绿色盲',
    'Dark protanopia & deuteranopia': '深色红绿色盲',
    'Dark Protanopia and Deuteranopia': '深色红绿色盲',
    'Dark protanopia and deuteranopia': '深色红绿色盲',
    'Dark Tritanopia': '深色蓝黄色盲',
    'Dark tritanopia': '深色蓝黄色盲',
    'Dark colorblind': '深色色盲',
    'Dark dimmed': '深色柔和',
    'Soft dark': '柔和深色',
    // 主题说明（原文无逗号，译文用定语代替）
    "GitHub's standard light theme with full color contrast and brightness.": '具有完整色彩对比度和亮度的 GitHub 标准浅色主题。',
    "GitHub's standard dark theme with full color contrast and brightness on a dark background.":
      '在深色背景上具有完整色彩对比度和亮度的 GitHub 标准深色主题。',
    'For people who may find it difficult to distinguish between reds and greens.': '适合难以区分红色和绿色的人。',
    'For people who may find it difficult to distinguish between reds and greens, with a dark background.':
      '适合难以区分红色和绿色的人，使用深色背景。',
    'For people who find it difficult to distinguish between blues and greens, as well as yellows and purples.':
      '适合难以区分蓝色和绿色、黄色和紫色的人。',
    'For people who find it difficult to distinguish between blues and greens, as well as yellows and purples, with a dark background.':
      '适合难以区分蓝色和绿色、黄色和紫色的人，使用深色背景。',
    'A dark theme with reduced contrast for comfortable viewing in low-light environments.':
      '降低对比度以便在弱光环境中舒适观看的深色主题。',

    // 对比度、表情符号肤色、制表符、Markdown 字体（无句号的对比度说明由 common 收录）
    'Enable high contrast for light or dark mode (or both) based on your system settings.':
      '根据系统设置为浅色或深色模式（或两者）启用高对比度。',
    'Emoji skin tone preference': '表情符号肤色首选项',
    'Preferred default emoji skin tone': '默认表情符号肤色',
    // 肤色单选项（译名同 Unicode CLDR；Neutral 见 scoped）
    'Light Skin Tone': '较浅肤色',
    'Medium-Light Skin Tone': '中等-浅肤色',
    'Medium Skin Tone': '中等肤色',
    'Medium-Dark Skin Tone': '中等-深肤色',
    'Dark Skin Tone': '较深肤色',
    'Tab size preference': '制表符宽度首选项',
    'Choose the number of spaces a tab is equal to when rendering code': '选择渲染代码时一个制表符等于多少个空格',
    'Markdown editor font preference': 'Markdown 编辑器字体首选项',
    'Font preference for plain text editors that support Markdown styling (e.g. pull request and issue descriptions, comments.)':
      '支持 Markdown 样式的纯文本编辑器（如拉取请求和议题描述、评论）的字体首选项',
    'Use a fixed-width (monospace) font when editing Markdown': '编辑 Markdown 时使用等宽字体',

    // 时间戳显示
    'Timestamp display': '时间戳显示',
    'Show times as "relative" (time since event) or "absolute" (specific date & time)':
      '以“相对时间”（距事件发生的时间）或“绝对时间”（具体日期和时间）显示时间',
    'Show times as “relative” (time since event) or “absolute” (specific date & time)':
      '以“相对时间”（距事件发生的时间）或“绝对时间”（具体日期和时间）显示时间',
    // 原文无冒号，译文不加（与其他词典的 e.g. 一致）
    'e.g. 2 hours ago': '例如 2小时前',
    // 示例写法同绝对时间的实际显示（本地时区不写，24 小时制）
    'e.g. Jan 1, 2024, 10:00 AM PST': '例如 2024年1月1日 10:00',
    'Unable to save timestamp display preference.': '无法保存时间戳显示首选项。',

    // 辅助功能：键盘快捷方式。说明被链接与 <kbd> 拆开
    // 「Enable [GitHub shortcuts] that don't use modifier keys in their activation. For example, the <kbd>g n</kbd>
    // shortcut to navigate notifications, or <kbd>?</kbd> to view context relevant shortcuts.」
    'Character keys': '字符键',
    'GitHub shortcuts': 'GitHub 快捷方式',
    "that don't use modifier keys in their activation. For example, the": '中无需修饰键即可触发的快捷方式。例如',
    'that don’t use modifier keys in their activation. For example, the': '中无需修饰键即可触发的快捷方式。例如',
    'shortcut to navigate notifications, or': '快捷方式用于前往通知，或',
    'to view context relevant shortcuts.': '用于查看与当前上下文相关的快捷方式。',
    // 说明里 <kbd> 前的读屏文字（kbd 本身 aria-hidden）：<span class=sr-only>question mark</span><kbd>?</kbd>、alt up + <kbd>Alt</kbd><kbd>↑</kbd>
    'question mark': '问号',
    'alt up': 'Alt+向上键',
    'Learn more about character key shortcuts': '了解字符键快捷方式',
    'Save keyboard shortcut preferences': '保存键盘快捷方式首选项',
    'Keyboard shortcut preference successfully saved.': '键盘快捷方式首选项已保存。',
    'Keyboard shortcut preferences successfully saved.': '键盘快捷方式首选项已保存。',

    // 命令面板
    'Modify the shortcuts to trigger the Command Palette for the default search mode and the command mode':
      '修改在默认搜索模式和命令模式下打开命令面板的快捷方式',
    'Search mode': '搜索模式',
    'Command mode': '命令模式',
    'Save command palette preferences': '保存命令面板首选项',
    'Command palette preferences successfully saved.': '命令面板首选项已保存。',

    // 动效
    'Autoplay animated images': '自动播放动图',
    'Select whether animated images should play automatically.': '选择动图是否自动播放。',
    'Adopts your system preference for reduced motion': '采用系统的减少动态效果首选项',
    'Automatically plays animated images': '自动播放动图',
    'Prevents animated images from playing automatically': '禁止动图自动播放',
    'Save motion preferences': '保存动效首选项',
    'Motion preferences successfully saved.': '动效首选项已保存。',

    // 内容：链接下划线、悬停卡片
    'Link underlines': '链接下划线',
    'Toggle the visibility of underlines on links that are adjacent to text.': '切换与文本相邻的链接是否显示下划线。',
    'Hide link underlines': '隐藏链接下划线',
    'Show link underlines': '显示链接下划线',
    'Save content preferences': '保存内容首选项',
    'Link underline preferences successfully saved.': '链接下划线首选项已保存。',
    'preview information about other parts of GitHub.': '可预览 GitHub 其他部分的信息。',
    'Show hovercards': '显示悬停卡片',
    'Enable previewing link content via mouse hover or keyboard focus before navigation. Move focus to hovercard content using':
      '跳转前通过鼠标悬停或键盘聚焦预览链接内容。将焦点移到悬停卡片内容可使用',
    'Save hovercard preferences': '保存悬停卡片首选项',
    'Hovercard preferences successfully saved.': '悬停卡片首选项已保存。',

    // 编辑器设置
    'Editor settings': '编辑器设置',
    'URL paste behavior': 'URL 粘贴行为',
    'Select if URLs should be formatted on paste. You can use': '选择粘贴 URL 时是否格式化。可使用',
    'to paste a link in the opposite way.': '以相反方式粘贴链接。',
    'Formatted link': '格式化链接',
    'Pasting a URL while having text selected will format to a Markdown link': '选中文本时粘贴 URL 将格式化为 Markdown 链接',
    'Plain text': '纯文本',
    'Pasting a URL while having text selected will replace the text': '选中文本时粘贴 URL 将替换所选文本',
    'Save editor settings': '保存编辑器设置',
    'Paste behavior preferences successfully saved.': '粘贴行为首选项已保存。',

    // 辅助技术提示
    'Assistive technology hints': '辅助技术提示',
    'Add or remove instructions for how to operate complex controls.': '添加或删除复杂控件的操作说明。',
    'Enable screen reader hint': '启用屏幕阅读器提示',
    'Disable screen reader hint': '禁用屏幕阅读器提示',
    'Save assistive technology hint preferences': '保存辅助技术提示首选项',
    'Hovercard assistive technology hint preferences successfully saved.': '悬停卡片辅助技术提示首选项已保存。'
  },
  scoped: {
    'Sync with system': '跟随系统',
    // 日间 / 夜间主题旁的当前主题标签；GitHub 应用 Web 钩子的同名复选框也在设置页，两处共用「启用」
    Active: '启用',
    Contrast: '对比度',
    // 时间戳显示选项
    Relative: '相对时间',
    Absolute: '绝对时间',
    // 辅助功能分组
    General: '常规',
    Motion: '动效',
    Content: '内容',
    Hovercards: '悬停卡片',
    On: '开',
    Off: '关',
    // 表情符号肤色：默认（无肤色修饰）
    Neutral: '中性',
    // <kbd> 中的读屏文字：按键名保留，只译连接词（与 common 的快捷方式提示一致）
    'control shift and V': 'control shift 和 V'
  },
  regexp: [
    // 制表符宽度选项：4 (Default)
    [/^(\d{1,2}) \(Default\)$/, '$1（默认）'],
    // 命令面板快捷方式选项：control + k or control + alt + k (default)
    [new RegExp(`^${KEY_COMBO} or ${KEY_COMBO} \\(default\\)$`), '$1 或 $2（默认）'],
    [new RegExp(`^${KEY_COMBO} \\(default\\)$`), '$1（默认）']
  ]
} satisfies PageDictionary
