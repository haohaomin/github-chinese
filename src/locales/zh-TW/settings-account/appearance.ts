import type { PageDictionary } from '../../../core/types'

/** 键盘组合键片段：control + k、command + option + k */
const KEY_COMBO = '((?:control|command|ctrl|cmd|alt|option|shift) \\+ (?:(?:control|command|ctrl|cmd|alt|option|shift) \\+ )*\\S)'

/**
 * 外观（/settings/appearance）：布景主题偏好设定与布景主题名称、对比、表情符号肤色、定位字元宽度、Markdown 编辑器字型、时间戳记显示；
 * 无障碍（/settings/accessibility）：键盘快速键、命令面板、动态效果、连结底线、暂留卡片、编辑器设定、辅助技术提示。
 * 「Increase contrast」「Light mode」「Dark mode」「Keyboard shortcuts」「Command palette」由 common 收录。
 * 术语：theme → 佈景主題，preferences → 偏好設定，hovercard → 暫留卡片（与 common-ui/hovercards.ts 一致），
 * modifier key → 輔助按鍵，render → 轉譯，screen reader → 螢幕閱讀器。
 */
export default {
  static: {
    // 布景主题偏好设定
    'Theme preferences': '佈景主題偏好設定',
    'Choose how GitHub looks to you. Select a single theme, or sync with your system and automatically switch between day and night themes. Selections are applied immediately and saved automatically.':
      '選擇 GitHub 的外觀。選擇單一佈景主題，或與系統同步並在日間和夜間佈景主題之間自動切換。所選項目會立即套用並自動儲存。',
    'Theme mode': '佈景主題模式',
    'Single theme': '單一佈景主題',
    'GitHub will use your selected theme': 'GitHub 將使用你選擇的佈景主題',
    'GitHub theme will match your system active settings': 'GitHub 佈景主題將配合系統目前的設定',
    'Day theme': '日間佈景主題',
    'Night theme': '夜間佈景主題',
    'Light theme': '淺色佈景主題',
    'Dark theme': '深色佈景主題',
    'This theme will be active when your system is set to “light mode”': '系統設為「淺色模式」時將使用此佈景主題',
    'This theme will be active when your system is set to “dark mode”': '系統設為「深色模式」時將使用此佈景主題',
    'This theme will be active when your system is set to "light mode"': '系統設為「淺色模式」時將使用此佈景主題',
    'This theme will be active when your system is set to "dark mode"': '系統設為「深色模式」時將使用此佈景主題',
    // 布景主题选择区的无障碍名称；Active Mode 是当前布景主题旁「Active」标签的说明
    'Single theme picker': '單一佈景主題選擇器',
    'Light theme picker': '淺色佈景主題選擇器',
    'Dark theme picker': '深色佈景主題選擇器',
    'Active Mode': '目前模式',
    'Selected theme:': '所選佈景主題：',

    // 布景主题名
    'Light default': '淺色預設',
    'Light high contrast': '淺色高對比',
    'Light Protanopia & Deuteranopia': '淺色紅綠色盲',
    'Light protanopia & deuteranopia': '淺色紅綠色盲',
    'Light Protanopia and Deuteranopia': '淺色紅綠色盲',
    'Light protanopia and deuteranopia': '淺色紅綠色盲',
    'Light Tritanopia': '淺色藍黃色盲',
    'Light tritanopia': '淺色藍黃色盲',
    'Light colorblind': '淺色色盲',
    'Dark default': '深色預設',
    'Dark high contrast': '深色高對比',
    'Dark Protanopia & Deuteranopia': '深色紅綠色盲',
    'Dark protanopia & deuteranopia': '深色紅綠色盲',
    'Dark Protanopia and Deuteranopia': '深色紅綠色盲',
    'Dark protanopia and deuteranopia': '深色紅綠色盲',
    'Dark Tritanopia': '深色藍黃色盲',
    'Dark tritanopia': '深色藍黃色盲',
    'Dark colorblind': '深色色盲',
    'Dark dimmed': '深色柔和',
    'Soft dark': '柔和深色',
    // 布景主题说明（原文无逗号，译文用定语代替）
    "GitHub's standard light theme with full color contrast and brightness.": '具有完整色彩對比和亮度的 GitHub 標準淺色佈景主題。',
    "GitHub's standard dark theme with full color contrast and brightness on a dark background.":
      '在深色背景上具有完整色彩對比和亮度的 GitHub 標準深色佈景主題。',
    'For people who may find it difficult to distinguish between reds and greens.': '適合難以區分紅色和綠色的人。',
    'For people who may find it difficult to distinguish between reds and greens, with a dark background.':
      '適合難以區分紅色和綠色的人，採用深色背景。',
    'For people who find it difficult to distinguish between blues and greens, as well as yellows and purples.':
      '適合難以區分藍色和綠色、黃色和紫色的人。',
    'For people who find it difficult to distinguish between blues and greens, as well as yellows and purples, with a dark background.':
      '適合難以區分藍色和綠色、黃色和紫色的人，採用深色背景。',
    'A dark theme with reduced contrast for comfortable viewing in low-light environments.':
      '降低對比的深色佈景主題，在低光源環境中觀看更舒適。',

    // 对比、表情符号肤色、定位字元、Markdown 字型（无句号的对比说明由 common 收录）
    'Enable high contrast for light or dark mode (or both) based on your system settings.':
      '在淺色或深色模式（或兩者）下依系統設定啟用高對比。',
    'Emoji skin tone preference': '表情符號膚色偏好設定',
    'Preferred default emoji skin tone': '預設表情符號膚色',
    // 肤色单选项：按英文原文直译深浅（CLDR zh_Hant 的「白皮膚」「黃皮膚」「黑皮膚」以人种肤色命名，不采用；Neutral 见 scoped）
    'Light Skin Tone': '淺膚色',
    'Medium-Light Skin Tone': '中淺膚色',
    'Medium Skin Tone': '中等膚色',
    'Medium-Dark Skin Tone': '中深膚色',
    'Dark Skin Tone': '深膚色',
    'Tab size preference': '定位字元寬度偏好設定',
    'Choose the number of spaces a tab is equal to when rendering code': '選擇轉譯程式碼時一個定位字元等於幾個空格',
    'Markdown editor font preference': 'Markdown 編輯器字型偏好設定',
    'Font preference for plain text editors that support Markdown styling (e.g. pull request and issue descriptions, comments.)':
      '支援 Markdown 樣式的純文字編輯器（例如拉取請求和議題的描述、留言）的字型偏好設定',
    'Use a fixed-width (monospace) font when editing Markdown': '編輯 Markdown 時使用等寬字型',

    // 时间戳记显示
    'Timestamp display': '時間戳記顯示',
    'Show times as "relative" (time since event) or "absolute" (specific date & time)':
      '以「相對時間」（距離事件發生的時間）或「絕對時間」（具體日期和時間）顯示時間',
    'Show times as “relative” (time since event) or “absolute” (specific date & time)':
      '以「相對時間」（距離事件發生的時間）或「絕對時間」（具體日期和時間）顯示時間',
    // 原文无冒号，译文不加（与其他词典的 e.g. 一致）
    'e.g. 2 hours ago': '例如 2 小時前',
    // 示例写法同绝对时间的实际显示（上午 / 下午 + 12 小时制，本地时区不写）
    'e.g. Jan 1, 2024, 10:00 AM PST': '例如 2024年1月1日 上午 10:00',
    'Unable to save timestamp display preference.': '無法儲存時間戳記顯示偏好設定。',

    // 无障碍：键盘快速键。说明被链接与 <kbd> 拆开
    // 「Enable [GitHub shortcuts] that don't use modifier keys in their activation. For example, the <kbd>g n</kbd>
    // shortcut to navigate notifications, or <kbd>?</kbd> to view context relevant shortcuts.」
    'Character keys': '字元鍵',
    'GitHub shortcuts': 'GitHub 快速鍵',
    "that don't use modifier keys in their activation. For example, the": '中不使用輔助按鍵觸發的快速鍵。例如',
    'that don’t use modifier keys in their activation. For example, the': '中不使用輔助按鍵觸發的快速鍵。例如',
    'shortcut to navigate notifications, or': '快速鍵可前往通知，或按',
    'to view context relevant shortcuts.': '查看與目前情境相關的快速鍵。',
    // 说明里 <kbd> 前的读屏文字（kbd 本身 aria-hidden）：<span class=sr-only>question mark</span><kbd>?</kbd>、alt up + <kbd>Alt</kbd><kbd>↑</kbd>
    'question mark': '問號',
    'alt up': 'Alt+向上鍵',
    'Learn more about character key shortcuts': '瞭解字元鍵快速鍵',
    'Save keyboard shortcut preferences': '儲存鍵盤快速鍵偏好設定',
    'Keyboard shortcut preference successfully saved.': '已儲存鍵盤快速鍵偏好設定。',
    'Keyboard shortcut preferences successfully saved.': '已儲存鍵盤快速鍵偏好設定。',

    // 命令面板
    'Modify the shortcuts to trigger the Command Palette for the default search mode and the command mode':
      '修改在預設搜尋模式和命令模式下開啟命令面板的快速鍵',
    'Search mode': '搜尋模式',
    'Command mode': '命令模式',
    'Save command palette preferences': '儲存命令面板偏好設定',
    'Command palette preferences successfully saved.': '已儲存命令面板偏好設定。',

    // 动态效果
    'Autoplay animated images': '自動播放動畫圖片',
    'Select whether animated images should play automatically.': '選擇是否自動播放動畫圖片。',
    'Adopts your system preference for reduced motion': '採用系統的減少動態效果偏好設定',
    'Automatically plays animated images': '自動播放動畫圖片',
    'Prevents animated images from playing automatically': '不自動播放動畫圖片',
    'Save motion preferences': '儲存動態效果偏好設定',
    'Motion preferences successfully saved.': '已儲存動態效果偏好設定。',

    // 内容：连结底线、暂留卡片
    'Link underlines': '連結底線',
    'Toggle the visibility of underlines on links that are adjacent to text.': '切換是否顯示與文字相鄰的連結底線。',
    'Hide link underlines': '隱藏連結底線',
    'Show link underlines': '顯示連結底線',
    'Save content preferences': '儲存內容偏好設定',
    'Link underline preferences successfully saved.': '已儲存連結底線偏好設定。',
    'preview information about other parts of GitHub.': '可預覽 GitHub 其他部分的資訊。',
    'Show hovercards': '顯示暫留卡片',
    'Enable previewing link content via mouse hover or keyboard focus before navigation. Move focus to hovercard content using':
      '在前往連結前透過滑鼠暫留或鍵盤焦點預覽連結內容。將焦點移至暫留卡片內容可使用',
    'Save hovercard preferences': '儲存暫留卡片偏好設定',
    'Hovercard preferences successfully saved.': '已儲存暫留卡片偏好設定。',

    // 编辑器设定
    'Editor settings': '編輯器設定',
    'URL paste behavior': 'URL 貼上行為',
    'Select if URLs should be formatted on paste. You can use': '選擇貼上 URL 時是否格式化。你可以使用',
    'to paste a link in the opposite way.': '以相反方式貼上連結。',
    'Formatted link': '格式化連結',
    'Pasting a URL while having text selected will format to a Markdown link': '選取文字時貼上 URL 會格式化為 Markdown 連結',
    'Plain text': '純文字',
    'Pasting a URL while having text selected will replace the text': '選取文字時貼上 URL 會取代所選文字',
    'Save editor settings': '儲存編輯器設定',
    'Paste behavior preferences successfully saved.': '已儲存貼上行為偏好設定。',

    // 辅助技术提示
    'Assistive technology hints': '輔助技術提示',
    'Add or remove instructions for how to operate complex controls.': '新增或移除複雜控制項的操作說明。',
    'Enable screen reader hint': '啟用螢幕閱讀器提示',
    'Disable screen reader hint': '停用螢幕閱讀器提示',
    'Save assistive technology hint preferences': '儲存輔助技術提示偏好設定',
    'Hovercard assistive technology hint preferences successfully saved.': '已儲存暫留卡片輔助技術提示偏好設定。'
  },
  scoped: {
    'Sync with system': '與系統同步',
    // 日间 / 夜间布景主题旁的当前布景主题标签；GitHub 应用程式 Web 钩子的同名核取方块也在设定页，两处共用「作用中」
    Active: '作用中',
    Contrast: '對比',
    // 时间戳记显示选项
    Relative: '相對時間',
    Absolute: '絕對時間',
    // 无障碍分组
    General: '一般',
    Motion: '動態效果',
    Content: '內容',
    Hovercards: '暫留卡片',
    On: '開啟',
    Off: '關閉',
    // 表情符号肤色：预设（无肤色修饰）
    Neutral: '中性',
    // <kbd> 中的读屏文字：按键名保留，只译连接词（与 common 的快速键提示一致）
    'control shift and V': 'control shift 和 V'
  },
  regexp: [
    // 定位字元宽度选项：4 (Default)
    [/^(\d{1,2}) \(Default\)$/, '$1（預設）'],
    // 命令面板快速键选项：control + k or control + alt + k (default)
    [new RegExp(`^${KEY_COMBO} or ${KEY_COMBO} \\(default\\)$`), '$1 或 $2（預設）'],
    [new RegExp(`^${KEY_COMBO} \\(default\\)$`), '$1（預設）']
  ]
} satisfies PageDictionary
