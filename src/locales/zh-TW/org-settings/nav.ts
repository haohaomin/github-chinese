import type { PageDictionary } from '../../../core/types'

/**
 * 组织设置：页头、左侧导航菜单项、标签页标题片段。
 * common 已收录的词（Settings、Organization、Repository、Topics、Models、Discussions、Projects、
 * Packages、Security、Security and quality、Code security、Code review、Integrations）、
 * organization 已收录的「Organization roles」「Role management」与 sponsors 已收录的「Sponsorship log」不再重复。
 * 与存储库设置、个人设置菜单同名的项放 scoped；侧栏 Pages 译「頁面」。
 * 产品名、方案名按用户要求译成中文（GLOSSARY.zh-TW 第 3 节）：
 * Actions → 動作、Codespaces / codespace → 程式碼空間、Advanced Security → 進階安全性、Pages → 頁面、
 * Marketplace → 市集、Sponsors → 贊助；带 GitHub 前缀的全名同样译出后半部分（GitHub 動作、GitHub 程式碼空間、
 * GitHub 進階安全性、GitHub 頁面、GitHub 贊助）；Copilot 功能名译出后半部分（Copilot 程式開發代理、Copilot 雲端代理、
 * Copilot 自動修正）。只有自造品牌词（GitHub、Copilot、Dependabot、CodeQL、Spark、Git）和技术缩写（CLI、LFS、
 * MCP 等）保留英文。原文只写 Actions / Codespaces 而指整个产品的句子补上 GitHub 前缀（執行 GitHub 動作）。
 * 方案名 Free / Team / Enterprise / Business 译 免費版 / 團隊版 / 企業版 / 商務版，品牌前缀保留
 * （GitHub 團隊版、Copilot 商務版）；企业帐户义的 enterprise、团队义的 team 仍译 企業、團隊。
 * Code Security、Secret Protection、Code Quality 已由 common/marketing.ts 的全局 static 译出，本区不重复。
 * 术语：policy → 政策，audit log → 稽核記錄，billing → 帳務，licensing → 授權，configuration → 設定，
 * hosted → 代管，sandbox → 沙箱。
 */
export default {
  static: {
    // 侧栏：规则集与策略的洞察、仪表板，存储库属性；导航与功能标签的读屏名称
    'Ruleset insights': '規則集洞察',
    'Ruleset dashboard': '規則集儀表板',
    'Repository ruleset dashboard': '儲存庫規則集儀表板',
    'Repository properties': '儲存庫屬性',
    'Policy insights': '政策洞察',
    'Organization navigation': '組織導覽',
    'Organization settings': '組織設定',
    'Feature Release Label: Public preview': '功能發佈標籤：公開預覽',
    // 页头
    'Organization account': '組織帳號',
    'Go to your organization profile': '前往你的組織資料',
    'Go to organization profile': '前往組織資料',
    // settings context：设置页所属的帐户（个人帐户或组织），译「要設定的帳號」
    'Switch settings context': '切換要設定的帳號',
    'Select settings context': '選擇要設定的帳號',
    'Organization settings navigation': '組織設定導覽',

    // 一级分组
    'Code, planning, and automation': '程式碼、規劃和自動化',
    'Third-party Access': '第三方存取',
    'Third-party access': '第三方存取',

    // 仅组织设置才有的菜单项
    'Role assignments': '角色指派',
    'Repository roles': '儲存庫角色',
    'Member privileges': '成員權限',
    'Team discussions': '團隊討論',
    'Import/Export': '匯入/匯出',
    Moderators: '版主',
    'Hosted compute networking': '代管運算網路',
    'Authentication security': '身分驗證安全性',
    'Verified and approved domains': '已驗證和核准的網域',
    'Verified & approved domains': '已驗證和核准的網域',
    'OAuth app policy': 'OAuth 應用程式政策',
    'OAuth application policy': 'OAuth 應用程式政策',
    // Active 作「作用中」（与 actions/format.ts、org-settings/actions.ts 的执行器状态同译）
    'Active tokens': '作用中的權杖',
    'Audit log': '稽核記錄',
    'Repository policies': '儲存庫政策',

    // 标签页标题片段
    'Organization Profile': '組織資料',
    'Organization profile': '組織資料',
    'Member Privileges': '成員權限',
    'Repository Roles': '儲存庫角色',
    'Repository Defaults': '儲存庫預設值',
    'Repository defaults': '儲存庫預設值',
    'Authentication Security': '身分驗證安全性',
    'Audit Log': '稽核記錄',
    'Deploy Keys': '部署金鑰',
    'Verified Domains': '已驗證的網域',
    'General Organization Settings': '一般組織設定',
    'Runner Groups': '執行器群組',
    'GitHub Publisher Verification': 'GitHub 發行者驗證'
  },
  scoped: {
    // Copilot 分组下的云端智能体设置
    Cloud: '雲端',
    // 组织页头标签（设置页也显示）
    People: '人員',

    // 产品名（见文件头注释）：侧栏 Actions、Codespaces、Advanced Security，机密页标签 Actions / Codespaces
    Actions: '動作',
    Codespaces: '程式碼空間',
    'Advanced Security': '進階安全性',

    // 与其他设置页同名的菜单项
    General: '一般',
    Policies: '政策',
    Access: '存取',
    'Billing and plans': '帳務和方案',
    'Billing and licensing': '帳務和授權',
    'Billing & licensing': '帳務和授權',
    'Billing & Licensing': '帳務和授權',
    Billing: '帳務',
    Usage: '使用量',
    'Premium request analytics': '進階請求分析',
    'Budgets and alerts': '預算和警示',
    Licensing: '授權',
    'Payment information': '付款資訊',
    'Payment history': '付款歷史記錄',
    'Additional billing details': '其他帳單詳細資料',
    'Requests from members': '成員請求',
    Moderation: '內容審核',
    'Blocked users': '已封鎖的使用者',
    'Interaction limits': '互動限制',
    'Code review limits': '程式碼審查限制',
    Rulesets: '規則集',
    'Rule insights': '規則洞察',
    'Custom properties': '自訂屬性',
    Sandboxes: '沙箱',
    Planning: '規劃',
    'Issue types': '議題類型',
    'Issue fields': '議題欄位',
    'Issue Fields': '議題欄位',
    'Cloud agent': '雲端代理',
    'Content exclusion': '內容排除',
    'Internet access': '網際網路存取',
    'Runner groups': '執行器群組',
    'Custom images': '自訂映像檔',
    Development: '開發',
    'Custom models': '自訂模型',
    Webhooks: 'Web 鉤子',
    Pages: '頁面',
    Configurations: '設定',
    'Global settings': '全域設定',
    'Deploy keys': '部署金鑰',
    Compliance: '合規性',
    'Secrets and variables': '機密和變數',
    'Private registries': '私人登錄庫',
    'Private Registries': '私人登錄庫',
    'GitHub Apps': 'GitHub 應用程式',
    'App managers': '應用程式管理員',
    'Personal access tokens': '個人存取權杖',
    'Pending requests': '待處理的請求',
    Applications: '應用程式',
    Logs: '記錄',
    'Deleted repositories': '已刪除的儲存庫',
    'Deleted Repositories': '已刪除的儲存庫',
    'Developer settings': '開發人員設定',
    'Developer Settings': '開發人員設定',
    'OAuth Apps': 'OAuth 應用程式',
    'OAuth apps': 'OAuth 應用程式',
    'Publisher Verification': '發行者驗證',
    'Publisher verification': '發行者驗證',
    'Account settings': '帳號設定',
    // 切换设置对象按钮里单独包起来的 settings（见 inline）
    settings: '設定'
  },
  // 切换设置对象的按钮：「Switch <span>settings</span> context」，整句不在同一文本节点时按行内句译（同 static 的整句）
  inline: [['Switch {} context', '切換要{}的帳號']]
} satisfies PageDictionary
