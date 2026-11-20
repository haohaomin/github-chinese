import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置：左侧导航（分组与菜单项）、标签页标题片段、设置页通用提示。
 * common 已收录的 Settings、Security、Security and quality、Code security、Code review、Models、
 * Integrations、Insights、Agents 不再重复，org-settings 已收录「Code, planning, and automation」；
 * 与组织设置、个人设置同名的菜单项放 scoped。
 * 产品名、功能名、方案名按用户要求译成中文（GLOSSARY.zh-TW 第 3 节），
 * 与组织设置（org-settings/nav.ts 文件头）同一套写法：Actions → 動作（動作權限、動作機密和變數、動作政策）、
 * Codespaces / codespace → 程式碼空間、Pages → 頁面、Advanced Security → 進階安全性、Secret Protection → 機密保護、
 * Models → 模型、Marketplace → 市集、Sponsors → 贊助、Packages → 套件、Beta → 測試版；带 GitHub 前缀的全名同样译出
 * 后半部分（GitHub 動作、GitHub 頁面、GitHub 進階安全性、GitHub 公告資料庫）；Copilot 功能名译出后半部分
 * （Copilot 程式碼審查、Copilot 雲端代理、Copilot 程式開發代理、Copilot 自動修正），Copilot in the cloud → 雲端 Copilot。
 * 原文只写 Actions 而指整个产品的句子补上 GitHub 前缀（停用 GitHub 動作）。只有自造品牌词（GitHub、Git、Copilot、
 * Dependabot、CodeQL）与技术词（OIDC、MCP、Wiki、LFS 等）保留英文。方案名 Free / Pro / Pro+ / Team / Enterprise / Business →
 * 免費版 / 專業版 / 專業增強版 / 團隊版 / 企業版 / 商務版，品牌前缀保留（GitHub 團隊版、Copilot 商務版）。
 * 术语：policy → 政策，insights → 洞察，moderation → 內容審核，private registry → 私人登錄庫，deploy key → 部署金鑰。
 */
export default {
  static: {
    // 分组
    'Code and automation': '程式碼和自動化',

    // 存储库设置专有菜单项
    'Collaborators and teams': '協作者和團隊',
    'Collaborators & teams': '協作者和團隊',
    'Team and member roles': '團隊和成員角色',
    'Moderation options': '內容審核選項',
    'Reported content': '已檢舉的內容',
    'Email notifications': '電子郵件通知',
    'Autolink references': '自動連結參考',
    'MCP servers': 'MCP 伺服器',
    'Agent suggestions for issues': '議題的代理建議',

    // 标签页标题片段
    'Actions settings': '動作設定',
    'Actions policies': '動作政策',
    'Actions policy insights': '動作政策洞察',
    'Actions secrets': '動作機密',
    'Actions variables': '動作變數',
    'Add Actions secret': '新增動作機密',
    'Add Actions variable': '新增動作變數',
    'Agents secrets': '代理機密',
    'Agents variables': '代理變數',
    'Agents secrets and variables': '代理機密和變數',
    'Add Agents secret': '新增代理機密',
    'Add Agents variable': '新增代理變數',
    'Codespaces secrets': '程式碼空間機密',
    'Add Codespaces secret': '新增程式碼空間機密',
    'Dependabot secrets': 'Dependabot 機密',
    'Add Dependabot secret': '新增 Dependabot 機密',
    'New branch protection rule': '新增分支保護規則',
    'Edit branch protection rule': '編輯分支保護規則',
    'Configure email notifications': '設定電子郵件通知',
    'GitHub Models access policy': 'GitHub 模型存取政策',
    'Copilot in the cloud': '雲端 Copilot',
    'Create environment': '建立環境',
    'OIDC Configuration': 'OIDC 設定',
    'OIDC configuration': 'OIDC 設定',

    // 设置页通用提示
    'Repository settings saved.': '儲存庫設定已儲存。',
    'Most repository settings are hidden for archived repositories. This repository must be unarchived to change them.':
      '已封存儲存庫的大多數設定都會隱藏。必須先取消封存此儲存庫才能變更這些設定。',
    "You don't have access to repository options": '你無權存取儲存庫選項',
    'You don’t have access to repository options': '你無權存取儲存庫選項',
    'Check the sidebar for available repository settings.': '請在側邊欄查看可用的儲存庫設定。'
  },
  scoped: {
    // 侧栏「安全和质量」分组
    'Code quality': '程式碼品質',
    // 与组织设置、个人设置同名的菜单项
    General: '一般',
    Access: '存取',
    Collaborators: '協作者',
    Moderation: '內容審核',
    'Interaction limits': '互動限制',
    'Code review limits': '程式碼審查限制',
    Branches: '分支',
    Tags: '標記',
    Rules: '規則',
    Rulesets: '規則集',
    Runners: '執行器',
    Policies: '政策',
    'Policy insights': '政策洞察',
    Webhooks: 'Web 鉤子',
    'Coding agent': '程式開發代理',
    'Cloud agent': '雲端代理',
    Cloud: '雲端',
    'Internet access': '網際網路存取',
    Planning: '規劃',
    Environments: '環境',
    Pages: '頁面',
    // 侧栏里单独出现的产品名（「Secrets and variables」下的 Actions、Codespaces 子项同形；见文件头）
    Actions: '動作',
    Codespaces: '程式碼空間',
    'Advanced Security': '進階安全性',
    'Custom properties': '自訂屬性',
    'Deploy keys': '部署金鑰',
    'Secrets and variables': '機密和變數',
    'Private registries': '私人登錄庫',
    'GitHub Apps': 'GitHub 應用程式',
    'Rule insights': '規則洞察',
    'Rule Insights': '規則洞察'
  },
  regexp: [
    // 侧栏标题（读屏）：Settings: owner/repo
    [/^Settings: ([\w.-]+\/[\w.-]+)$/, '設定：$1']
  ]
} satisfies PageDictionary
