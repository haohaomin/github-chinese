import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/** 计算机规格里的数字单位：2 cores, 8 GB RAM, 32 GB storage */
const SPEC = '(\\d+) cores?, (\\d+) GB RAM, (\\d+) GB storage'

/**
 * 代码空间页（/codespaces、/codespaces/new、/codespaces/templates、代码空间启动页、
 * /codespaces/allow_permissions）：侧栏、代码空间列表与操作提示、快速启动模板、入门卡片、
 * 新建表单、启动状态、使用量警告。产品名译法见 codespaces.ts 文件头。
 * 模板卡片的说明来自模板存储库描述（用户内容），不收录；调查横幅见 code/banners.ts。
 */
export default {
  static: {
    // 侧栏与列表
    'Your codespaces': '你的程式碼空間',
    'By repository': '依儲存庫',
    'Created from a template': '從範本建立',
    'Your instant dev environment': '你的即時開發環境',
    'Go from code to commit faster on any project.': '在任何專案中更快地從寫程式到提交。',
    'Go to docs': '前往說明文件',
    'Explore quick start templates': '探索快速入門範本',
    'Choose a template': '選擇範本',
    'Create a new codespace': '建立新的程式碼空間',
    'Dev container configuration': '開發容器設定',
    'Default project configuration': '預設專案設定',
    'Default Codespaces configuration': '預設程式碼空間設定',
    'Prebuild ready': '預先建置已就緒',
    'Prebuild in progress': '正在預先建置',
    'No codespaces yet': '尚無程式碼空間',
    'Codespace is being deleted': '正在刪除程式碼空間',
    'Are you sure you want to delete this codespace?': '確定要刪除此程式碼空間嗎？',
    'Request Usage Report': '請求使用量報告',
    'Show more actions for codespace': '顯示程式碼空間的更多動作',
    'This codespace has uncommitted changes': '此程式碼空間有未提交的變更',

    // 使用量警告：……請查看你的 <帳務設定>。
    'You seem to have a billing issue. Please adjust your billing settings to continue using codespaces.':
      '你的帳務似乎有問題。請調整帳務設定以繼續使用程式碼空間。',

    // 入门：链接把句子拆成片段（初次使用程式碼空間？<從這裡開始>。瞭解……）
    'Getting started with GitHub Codespaces': 'GitHub 程式碼空間入門',
    'Learn core concepts': '瞭解核心概念',
    'New to Codespaces?': '初次使用程式碼空間？',
    '. Learn the core concepts and how to get started.': '。瞭解核心概念和入門方法。',
    'Configure and manage': '設定和管理',
    // 進一步瞭解 <機密管理> 和 <連接埠轉送>
    'Learn more about features like': '進一步瞭解',
    'Develop locally': '在本機開發',
    // 存取程式碼空間時可使用 <Visual Studio Code>
    'Access codespaces from within': '存取程式碼空間時可使用',

    // 模板页
    'Codespace templates': '程式碼空間範本',
    'Start a codespace from a template and get to developing with the power of a virtual machine in the cloud.':
      '從範本啟動程式碼空間並藉助雲端虛擬機器開始開發。',
    // 快速启动模板卡片的说明（模板名是产品名，保留原文）
    'Start with a blank canvas or import any packages you need.': '從空白畫布開始或匯入所需的任何套件。',
    'A popular JavaScript library for building user interfaces based on UI components.':
      '以 UI 元件建構使用者介面的熱門 JavaScript 程式庫。',
    'A full-stack web application template written in C#.': '以 C# 撰寫的全端 Web 應用程式範本。',
    'A full-stack web framework for building dynamic websites that deliver a rich user experience.':
      '用於建構可提供豐富使用者體驗的動態網站的全端 Web 框架。',
    'JupyterLab is the latest web-based interactive development environment for notebooks, code, and data.':
      'JupyterLab 是最新的 Web 型筆記本、程式碼和資料互動式開發環境。',
    'Express is a minimal and flexible Node.js web application framework.': 'Express 是精簡而靈活的 Node.js Web 應用程式框架。',
    'Next.js is a React framework that gives you building blocks to create web applications.':
      'Next.js 是為建立 Web 應用程式提供建構元件的 React 框架。',
    'Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.':
      'Django 是鼓勵快速開發和簡潔、務實設計的高階 Python Web 框架。',
    'Flask is a lightweight web application framework.': 'Flask 是輕量級 Web 應用程式框架。',
    'A fast 3kB alternative to React with the same modern API.': '具有相同現代 API 的快速 3kB React 替代方案。',
    'Examples running via semihosting output on an Arm FVP simulation model.': '在 Arm FVP 模擬模型上透過半主機輸出執行的範例。',
    // 页头导航：窄屏左侧按钮的提示、侧栏的无障碍名称
    'Open Codespaces navigation': '開啟程式碼空間導覽',
    'Codespaces navigation': '程式碼空間導覽',
    'Codespaces navigation links': '程式碼空間導覽連結',

    // 新建表单
    'Create new codespace': '建立新的程式碼空間',
    'Get started with development in the cloud from an existing repository or a template.': '從現有儲存庫或範本開始在雲端開發。',
    'Find out more about codespaces.': '進一步瞭解程式碼空間。',
    'Start coding': '開始寫程式',
    'Unable to load repositories, please reload the page.': '無法載入儲存庫，請重新載入頁面。',
    'No matching repositories.': '沒有相符的儲存庫。',
    'Pick a repository first.': '請先選擇儲存庫。',
    'Codespace creation is disabled': '已停用建立程式碼空間',
    'To be cloned into your codespace': '將複製到你的程式碼空間',
    'This branch will be checked out on creation': '建立時將簽出此分支',
    'Your codespace will use this configuration': '你的程式碼空間將使用此設定',
    'Your codespace will run in the selected region': '你的程式碼空間將在選取的區域中執行',
    'Resources for your codespace': '程式碼空間的資源',
    // 使用量付費方為 <owner>
    'Usage paid for by': '使用量付費方為',
    // 为指定存储库创建：建立程式碼空間用於 <owner/repo>
    'Create codespace for': '建立程式碼空間用於',
    'No codespace to resume': '沒有可繼續使用的程式碼空間',
    "You don't have a codespace matching these settings. You can continue to create a new one or customize your settings.":
      '你沒有符合這些設定的程式碼空間。你可以繼續建立新的程式碼空間或自訂設定。',
    'You don’t have a codespace matching these settings. You can continue to create a new one or customize your settings.':
      '你沒有符合這些設定的程式碼空間。你可以繼續建立新的程式碼空間或自訂設定。',
    'Change options': '變更選項',

    // 启动页
    'Setting up your codespace': '正在設定你的程式碼空間',
    'Launching Visual Studio Code': '正在啟動 Visual Studio Code',
    'Launching JetBrains Gateway': '正在啟動 JetBrains Gateway',
    // ……如果沒有，請確認已 <安裝>。
    'You should have received a prompt to open Visual Studio Code. If not, ensure it is':
      '你應該已收到開啟 Visual Studio Code 的提示。如果沒有，請確認已',
    'You should have received a prompt to open the JetBrains Gateway. If not, ensure it is':
      '你應該已收到開啟 JetBrains Gateway 的提示。如果沒有，請確認已',
    'Your codespace will open once ready.': '程式碼空間就緒後將開啟。',
    'There was a problem preparing your codespace, please try again.': '準備程式碼空間時發生問題，請再試一次。',
    'Starting codespace': '正在啟動程式碼空間',
    'Starting codespace...': '正在啟動程式碼空間...',
    'Starting codespace…': '正在啟動程式碼空間…',
    'Stopping codespace': '正在停止程式碼空間',
    'Stopping codespace...': '正在停止程式碼空間...',
    'Stopping codespace…': '正在停止程式碼空間…',
    'Building codespace...': '正在建置程式碼空間...',
    'Building codespace…': '正在建置程式碼空間…',
    'Connecting to codespace...': '正在連線到程式碼空間...',
    'Connecting to codespace…': '正在連線到程式碼空間…',
    'Restart codespace': '重新啟動程式碼空間',
    'Rebuild codespace': '重新建置程式碼空間',
    'Codespace stopped': '程式碼空間已停止',
    'This codespace is stopped.': '此程式碼空間已停止。',

    // 申请额外权限（/codespaces/allow_permissions）：此程式碼空間正在請求 <額外權限>
    'This codespace is requesting': '此程式碼空間正在請求',
    'additional permissions': '額外權限',
    'Your codespace is requesting the following permissions for these repositories:': '你的程式碼空間正在為這些儲存庫請求下列權限：',
    'The following permissions were also requested but are not available. You can continue but the codespace may not function as intended.':
      '另外也請求了下列權限，但這些權限無法使用。你可以繼續，但程式碼空間可能無法正常運作。',
    'Continue without authorizing': '不授權並繼續',
    'Authorize and continue': '授權並繼續'
  },
  scoped: {
    // 模板名（快速启动模板卡片的标题被全局忽略规则屏蔽时不生效）
    Blank: '空白',
    // 入门卡片的链接文字
    'Start here': '從這裡開始',
    'secret management': '機密管理',
    'port forwarding': '連接埠轉送',
    // 使用量警告的链接文字
    'billing settings': '帳務設定',
    // 代码空间状态（单独的进度动名词作“X中”）
    Active: '作用中',
    Stopped: '已停止',
    Retained: '已保留',
    Available: '可用',
    Shutdown: '已關機',
    'Shutting down': '關機中',
    Starting: '啟動中',
    Stopping: '停止中',
    Rebuilding: '重新建置中',
    Exporting: '匯出中',
    Provisioning: '佈建中',
    Queued: '已排入佇列',
    Unavailable: '無法使用',
    Failed: '失敗',
    'No changes': '沒有變更',
    // 被链接或时间元素隔开的片段：擁有者為 <owner>、上次使用 <3 天前>、到期時間 <3 天後>、建立自 <範本>
    'Owned by': '擁有者為',
    'Last used': '上次使用',
    'Expiring in': '到期時間',
    'Created from': '建立自',
    'Are you sure you want to delete': '確定要刪除',
    // 新建表单（区域名 US East 等见 repo-settings/codespaces.ts 的 static；Select repository 由 common-ui 翻译）
    Branch: '分支',
    'Select branch': '選擇分支',
    'Default branch': '預設分支',
    'Default Branch': '預設分支',
    // 分支选择器
    'Switch branches': '切換分支',
    'Find a branch': '尋找分支',
    'Find a branch...': '尋找分支...',
    'Find a branch…': '尋找分支…',
    default: '預設',
    branches: '分支',
    // 导出对话框的主按钮（Create ${target}）
    'Create branch': '建立分支',
    'new codespace': '新的程式碼空間',
    Region: '區域',
    'View logs': '查看記錄',
    installed: '安裝',
    // 申请额外权限
    'Contents:': '內容：',
    write: '寫入'
  },
  regexp: [
    [/^Owned by ([\w.-]+)$/, '擁有者為 $1'],
    [new RegExp(`^Last used (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次使用', translateTime(time))],
    [new RegExp(`^Auto-deletes? (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '自動刪除')],
    [new RegExp(`^Created (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '建立')],
    [/^Usage paid for by ([\w.-]+)$/, '使用量由 $1 支付'],
    [/^(\d+) codespaces?$/, '$1 個程式碼空間'],
    // 模板卡片的发布者：By github
    [/^By ([\w-]+)$/, '由 $1 發布'],

    // 列表状态与提示
    [/^This codespace is (\d+) commits? ahead of remote and has uncommitted changes$/, '此程式碼空間領先遠端 $1 個提交且有未提交的變更'],
    [/^This codespace is (\d+) commits? ahead of remote$/, '此程式碼空間領先遠端 $1 個提交'],
    [
      /^You['’]re at (\d+)% of your included usage for this billing period\. For more information, view your$/,
      '你已達到本帳單週期包含使用量的 $1%。如需詳細資訊，請查看你的'
    ],
    [/^(\d+) permissions? requested$/, '請求了 $1 項權限'],

    // 操作结果（代码空间显示名带引号）
    [/^Codespace "(.+)" stopped\.$/, '程式碼空間「$1」已停止。'],
    [/^Codespace "(.+)" deleted\.$/, '程式碼空間「$1」已刪除。'],
    [
      new RegExp(
        `^Your codespace "(.+)" has been updated to use machine type: "${SPEC}"\\. Changes will take effect the next time your codespace restarts\\.$`
      ),
      '你的程式碼空間「$1」已改用機器類型「$2 核心、$3 GB 記憶體、$4 GB 儲存空間」。變更將在程式碼空間下次重新啟動時生效。'
    ],
    [/^Your codespace "(.+)" has been updated\.$/, '你的程式碼空間「$1」已更新。'],
    [/^Your codespace "(.+)" will no longer be auto-deleted\.$/, '你的程式碼空間「$1」將不再自動刪除。'],
    [/^(.+) has unpushed changes, are you sure you want to delete\?$/, '$1 有未推送的變更，確定要刪除嗎？'],
    [/^Are you sure you want to delete (.+)\?$/, '確定要刪除 $1 嗎？']
  ]
} satisfies PageDictionary
