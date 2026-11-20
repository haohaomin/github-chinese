import type { PageDictionary } from '../../../core/types'

/**
 * 个人设置框架：页头（帐户名、切换设置对象）、左侧导航分组与菜单项、标签页标题。
 * common 已收录的菜单项（Appearance、Accessibility、Notifications、Organizations、Enterprises、Repositories、
 * Models、Packages、Features、Security、Code security、Integrations、Overview）与其他词典已收录的
 * 「Sponsorship log」「Switch settings context」「Code, planning, and automation」不再重复。
 * 与组织设置同名的单词菜单项放 scoped，只在个人设置页生效。
 * 术语与组织设置（org-settings/nav.ts）一致：account → 帳號，billing → 帳務，licensing → 授權，plan → 方案，
 * usage → 使用量，session → 工作階段，credential → 認證資訊，moderation → 內容審核，archive → 封存，
 * benefits → 權益（同 education 的「GitHub 教育權益」）。
 */
export default {
  static: {
    // 创建企业（试用）：使用个人帐户的企业表单
    'Sign up for Enterprise Cloud': '註冊企業雲端',
    'Learn more about Enterprise Cloud': '瞭解企業雲端',
    'For only private, internal work and provisioned accounts, we recommend using': '僅用於私人、內部工作和佈建帳號時，建議使用',
    'Choose an existing organization to include in the new Enterprise account': '選擇要納入新企業帳號的現有組織',
    'Create without an organization': '不納入組織直接建立',
    'Note: Billing for any selected organization will be delegated to the enterprise account.': '注意：所選組織的計費將委派給企業帳號。',
    'Learn about changes to your billing during trial': '瞭解試用期間的計費變化',
    'For Copilot access, please': '如需 Copilot 存取權，請',
    'Verifying...': '驗證中...',
    // 页头
    'Your personal account': '你的個人帳號',
    'Go to your personal profile': '前往你的個人檔案',
    'Go to settings page': '前往設定頁面',
    'User settings': '使用者設定',
    // 窄屏下左侧导航收进的对话框标题
    'Settings menu': '設定選單',

    // 只在个人设置出现的菜单项
    'Public profile': '公開個人檔案',
    'Password and authentication': '密碼和身分驗證',
    'SSH and GPG keys': 'SSH 和 GPG 金鑰',
    'Saved replies': '已儲存的回覆',
    'Security log': '安全性記錄',
    'Education benefits': '教育權益',
    'Code security and analysis': '程式碼安全性和分析',
    // 旧版计费菜单（Billing and plans 下的子项）
    'Plans and usage': '方案和使用量',
    'Spending limits': '支出上限',

    // 标签页标题片段
    'Your Profile': '你的個人檔案',
    'Notification Settings': '通知設定',
    'Account security': '帳號安全性',
    'Email settings': '電子郵件設定',
    'Accessibility settings': '無障礙設定',
    'Billing Overview': '帳務總覽',
    'Billing overview': '帳務總覽',
    'Billing Usage': '帳務使用量',
    'Billing usage': '帳務使用量',
    'Payment Information': '付款資訊'
  },
  scoped: {
    // 页头帐户名后的读屏文字：「Mona (octocat) settings」
    settings: '設定',
    // 一级分组
    Access: '存取',
    Archives: '封存',

    // 菜单项（与组织设置菜单同名，译法一致）
    Account: '帳號',
    'Account settings': '帳號設定',
    'Billing and licensing': '帳務和授權',
    'Billing & licensing': '帳務和授權',
    'Billing & Licensing': '帳務和授權',
    'Billing and plans': '帳務和方案',
    Billing: '帳務',
    Usage: '使用量',
    'Metered usage': '計量使用量',
    'AI usage': 'AI 使用量',
    'Premium request analytics': '進階請求分析',
    'Budgets and alerts': '預算和警示',
    Budgets: '預算',
    Licensing: '授權',
    'Payment information': '付款資訊',
    'Payment history': '付款歷史記錄',
    'Additional billing details': '其他帳單詳細資料',
    Emails: '電子郵件',
    Sessions: '工作階段',
    Credentials: '認證資訊',
    Moderation: '內容審核',
    'Blocked users': '已封鎖的使用者',
    'Interaction limits': '互動限制',
    'Code review limits': '程式碼審查限制',
    'Coding agent': '程式開發代理',
    'Cloud agent': '雲端代理',
    // Copilot 下的子菜单项（与存储库设置一致）
    Cloud: '雲端',
    Memory: '記憶',
    // 侧栏的产品名按用户规定译成中文（GitHub Pages → 頁面、Codespaces → 程式碼空間）；Copilot 是品牌词，保留。
    // Codespaces 同时覆盖计费页的产品名、预算产品、GitHub 应用权限名
    Pages: '頁面',
    Codespaces: '程式碼空間',
    Applications: '應用程式',
    'Scheduled reminders': '排定的提醒',
    // 规划分组（与组织设置一致）
    Planning: '規劃',
    'Issue types': '議題類型',
    'Issue fields': '議題欄位',
    'Developer settings': '開發人員設定',
    'Developer Settings': '開發人員設定'
  },
  // 切换设置对象的按钮：「Switch <span>settings</span> context」，settings 由 scoped 译出（整句同 org-settings 的 static）
  inline: [
    // 创建企业：链接后接外部链接图标再接句号
    ['For Copilot access, please {}.', '如需 Copilot 存取權，請{}。'],
    [
      'For only private, internal work and provisioned accounts, we recommend using {} {}.',
      '僅用於私人、內部工作和佈建帳號時，建議使用{}{}。'
    ],
    [
      'Note: Billing for any selected organization will be delegated to the enterprise account. {} {}.',
      '注意：所選組織的計費將委派給企業帳號。{}{}。'
    ],
    ['Switch {} context', '切換要{}的帳號']
  ]
} satisfies PageDictionary
