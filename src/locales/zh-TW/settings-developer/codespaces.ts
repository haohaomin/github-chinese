import type { PageDictionary } from '../../../core/types'

/**
 * 代码空间设置（/settings/codespaces、/settings/codespaces/secrets/…）：
 * Dotfiles、代码空间机密、GPG 验证、设置同步、可信存储库、访问与安全、编辑器首选项、
 * 默认空闲超时、默认保留期、主机映像版本、区域。
 * 产品名按用户要求译成中文（Codespaces / codespace → 程式碼空間，Beta → 測試版）；
 * 编辑器名（Visual Studio Code、JetBrains Gateway、JupyterLab）保留英文。
 * 术语：idle timeout → 閒置逾時，retention period → 保留期限（与 org-settings/code.ts 一致），
 * host image → 主機映像檔，Settings Sync → 設定同步（VS Code 繁中），trusted → 受信任，
 * desktop client → 桌面用戶端，plugin → 外掛程式，notebook → 筆記本，with（「需要 X with Y」）→ 搭配。
 */
export default {
  static: {
    // Dotfiles
    Dotfiles: '點檔案',
    'Automatically install dotfiles': '自動安裝點檔案',
    'Codespaces can automatically install your dotfiles into every codespace you create.':
      '程式碼空間可以自動將你的點檔案安裝到你建立的每個程式碼空間中。',
    'Learn how to set up your dotfiles for Codespaces.': '瞭解如何為程式碼空間設定點檔案。',
    'Learn how to set up your dotfiles.': '瞭解如何設定點檔案。',
    'This setting installs your dotfiles in environments created by Copilot in the cloud and Codespaces.':
      '此設定會將你的點檔案安裝到雲端 Copilot 和程式碼空間建立的環境中。',
    'This setting installs your dotfiles in environments created by Copilot in the cloud.':
      '此設定會將你的點檔案安裝到雲端 Copilot 建立的環境中。',
    'This setting automatically installs your dotfiles in environments created by Codespaces and Copilot cloud agent.':
      '此設定會自動將你的點檔案安裝到程式碼空間和 Copilot 雲端代理建立的環境中。',
    'Dotfiles repository': '點檔案儲存庫',
    'Select a repository you own to use as your dotfiles repository.': '選擇一個你擁有的儲存庫作為點檔案儲存庫。',
    'Failed to update your dotfiles settings. Please try again.': '無法更新點檔案設定。請再試一次。',

    // 代码空间机密
    'Codespace user secrets': '程式碼空間使用者機密',
    'Development environment secrets are environment variables that are encrypted. They are available to any codespace you create using repositories with access to that secret.':
      '開發環境機密是經過加密的環境變數。使用可存取該機密的儲存庫建立的任何程式碼空間都可以使用這些機密。',
    'There are no Codespace secrets.': '沒有程式碼空間機密。',
    'There are no Codespaces secrets.': '沒有程式碼空間機密。',
    'Secrets created at the user level can be shared with specified repositories.': '在使用者層級建立的機密可以與指定的儲存庫共用。',
    '/ New secret': '/ 新增機密',
    '/ Update secret': '/ 更新機密',
    'Secret name is required and must not start with GITHUB': '機密名稱為必填且不得以 GITHUB 開頭',
    'This secret will not be active until at least 1 repository is selected.': '至少選取 1 個儲存庫後此機密才會生效。',

    // GPG 验证与设置同步
    'GPG verification': 'GPG 驗證',
    // 第一句原文 so that 前无逗号，译文不加
    'Codespaces can have GPG commit signing capabilities so that GitHub can verify that commits made in the codespace come from a trusted source. When enabled, this setting will be applied to your list of trusted repositories.':
      '程式碼空間可以具備 GPG 提交簽署功能以便 GitHub 驗證在程式碼空間中建立的提交來自受信任的來源。啟用後，此設定將套用到你的受信任儲存庫清單。',
    'GPG signing will be available in Codespaces': '程式碼空間中將可使用 GPG 簽署',
    'Settings Sync': '設定同步',
    'By enabling, your codespaces will be able to pull from VS Code Settings Sync service and push only for the trusted repositories you specify. Only enable this for repositories that you trust.':
      '啟用後，你的程式碼空間將能從 VS Code 設定同步服務取得設定並只為你指定的受信任儲存庫推送。僅為你信任的儲存庫啟用此功能。',
    'VS Code Settings Sync will be available in Codespaces': '程式碼空間中將可使用 VS Code 設定同步',
    'When enabled, you will receive emails when your codespaces are nearing deletion due to inactivity.':
      '啟用後，你會在程式碼空間因長期未使用而即將刪除時收到電子郵件。',
    'Warning notifications for codespace deletions will be enabled': '將啟用程式碼空間刪除警告通知',
    'Trusted repositories': '受信任的儲存庫',
    'The following repositories will be referenced by GPG verification and Settings Sync.': 'GPG 驗證和設定同步將參考下列儲存庫。',
    'GPG signing and VS Code Settings Sync will be available for codespaces for all repositories':
      '所有儲存庫的程式碼空間都將可使用 GPG 簽署和 VS Code 設定同步',
    'GPG signing and VS Code Settings Sync will be available for codespaces from the selected repositories':
      '從選取的儲存庫建立的程式碼空間將可使用 GPG 簽署和 VS Code 設定同步',
    'GPG and VS Code Settings Sync will be available for Codespaces from these repositories.':
      '從這些儲存庫建立的程式碼空間將可使用 GPG 和 VS Code 設定同步。',

    // 访问与安全（已弃用）
    'Access and security': '存取和安全性',
    'Codespaces you create for your personal account can either be restricted to accessing the repository it was opened for, or granted read access to other repositories you own.':
      '你為個人帳號建立的程式碼空間可以僅限存取其對應的儲存庫，也可以取得你擁有的其他儲存庫的讀取權限。',
    'Limit access of personal Codespaces to the repository they were opened for': '將個人程式碼空間的存取範圍限制在其對應的儲存庫',
    'All Codespaces can access other repositories I own': '所有程式碼空間都可以存取我擁有的其他儲存庫',
    'Personal Codespaces created for specific repositories can access other repositories I own':
      '為特定儲存庫建立的個人程式碼空間可以存取我擁有的其他儲存庫',

    // 编辑器首选项
    'Editor preference': '編輯器偏好設定',
    'Connect to the cloud from your local desktop client. Requires': '從本機桌面用戶端連線到雲端。需要',
    'Connect to the cloud from your local desktop client. Requires the': '從本機桌面用戶端連線到雲端。需要',
    // 原文有逗号，译文随原文；「另需」表明授权是另一项要求
    'plugin, and a JetBrains license.': '外掛程式，另需 JetBrains 授權。',
    'Visual Studio Code for the Web': '網頁版 Visual Studio Code',
    'Edit and preview changes straight from the browser.': '直接在瀏覽器中編輯並預覽變更。',
    'Edit and run notebooks from the browser with JupyterLab.': '使用 JupyterLab 在瀏覽器中編輯並執行筆記本。',

    // 默认空闲超时、保留期
    'Default idle timeout': '預設閒置逾時',
    // 后接 <strong>240</strong> 与「minutes (4 hours).」
    'A codespace will suspend after a period of inactivity. You can specify a default idle timeout value, which will apply to all codespaces created after the default is changed. You will be charged for the entire time your codespace is running, even if it is idle. The maximum value is':
      '程式碼空間在一段時間沒有活動後會暫停。你可以指定預設閒置逾時值，此值將套用到變更預設值後建立的所有程式碼空間。程式碼空間執行的整段時間都會計費，即使處於閒置狀態也一樣。最大值為',
    'minutes (4 hours).': '分鐘（4 小時）。',
    'Default retention period': '預設保留期限',
    'Inactive codespaces are automatically deleted 30 days after the last time they were stopped. A shorter retention period can be set, and will apply to all codespaces created going forward. The default and maximum value is':
      '非作用中的程式碼空間會在最後一次停止後 30 天自動刪除。你可以設定較短的保留期限，此期限將套用到之後建立的所有程式碼空間。預設值和最大值均為',
    'Learn about retention setting': '瞭解保留期限設定',
    'Timeout must be 5 minutes or more.': '逾時時間不得少於 5 分鐘。',
    'Timeout must be 240 minutes or less.': '逾時時間不得超過 240 分鐘。',
    'Retention period must be 30 days or less.': '保留期限不得超過 30 天。',
    'Retention period must be between 0 and 30 days.': '保留期限必須介於 0 到 30 天之間。',

    // 主机映像版本首选项（第二、三句原文无逗号，译文不加）
    'Host image version preference': '主機映像檔版本偏好設定',
    'The host image defines the operating system in which development containers run. These images receive periodic upgrades for security, functionality, and performance. GitHub Codespaces offers early access to beta images to ensure compatibility with existing development container configurations. Any codespace created or resumed after changing this setting will use the specified image configuration.':
      '主機映像檔定義了開發容器執行所在的作業系統。這些映像檔會定期升級以提升安全性、功能和效能。GitHub 程式碼空間提供測試版映像檔的搶先體驗以確保與現有的開發容器設定相容。變更此設定後建立或繼續執行的任何程式碼空間都將使用指定的映像檔設定。',
    'Learn more about host images': '瞭解主機映像檔',
    'Always use the latest stable configuration.': '一律使用最新的穩定設定。',
    'Use a beta image configuration when available. Otherwise, use the latest stable configuration.':
      '有可用的測試版映像檔設定時使用該設定。否則，使用最新的穩定設定。',

    // 区域
    'Your default region will be used to designate compute resources to your codespaces. GitHub can set your region automatically based on your location, or you can set it yourself. Codespaces are deployed to a subset of Azure regions.':
      '你的預設區域將用於為你的程式碼空間指派運算資源。GitHub 可以根據你的位置自動設定區域，你也可以自行設定。程式碼空間部署在部分 Azure 區域中。',
    'Set automatically': '自動設定',
    'We will determine the closest available region based on your location (IP address) at codespace creation time.':
      '我們會在建立程式碼空間時根據你的位置（IP 位址）決定最近的可用區域。',
    'Set manually': '手動設定',
    'Choose your default region': '選擇預設區域'
  },
  scoped: {
    // Dotfiles、机密（与存储库、组织设置共用的短语，译法同 org-settings/secrets.ts；Secrets 见 permissions.ts，Select repository 由 common-ui 收录）
    'New secret': '新增機密',
    'Add secret': '新增機密',
    'Update secret': '更新機密',
    'Adding…': '新增中…',
    'Adding...': '新增中...',
    'Secret added.': '已新增機密。',
    'Secret deleted.': '已刪除機密。',
    'Secret updated.': '已更新機密。',
    Value: '值',
    'Available to': '可用於',
    'Secret values are encrypted and cannot be displayed, but you can': '機密值已加密且無法顯示，但你可以',
    'enter a new value.': '輸入新值。',
    'Selected repositories': '選取的儲存庫',

    // 编辑器首选项：「Requires <a>Visual Studio Code</a> with the <a>GitHub Codespaces</a> extension.」
    // 「Requires the <a>JetBrains Gateway</a> with the <a>GitHub Codespaces</a> plugin, and a JetBrains license.」
    // 链接文字 GitHub Codespaces 是扩展名，产品名按用户要求译成中文；with the 作「搭配」（不用「及」，避免与「和」混用）
    'with the': '搭配',
    'extension.': '擴充功能。',
    'GitHub Codespaces': 'GitHub 程式碼空間',

    // 时长单位、映像、区域（US West 等区域名由 repo-settings 收录，国家名由 common 收录）
    minutes: '分鐘',
    days: '天',
    'days.': '天。',
    Stable: '穩定版',
    Beta: '測試版',
    Region: '區域',
    'Asia Pacific': '亞太地區'
  },
  regexp: [
    [/^(\d+) repositor(?:y|ies)$/, '$1 個儲存庫'],
    [/^Selected (\d+) repositor(?:y|ies)(\.?)$/, (_, count: string, dot: string) => `已選取 ${count} 個儲存庫${dot ? '。' : ''}`],
    // 机密名为大写标识符
    [/^Are you sure you want to delete ([A-Z][A-Z0-9_]*)\?$/, '確定要刪除 $1 嗎？'],
    [/^Remove ([A-Z][A-Z0-9_]*)$/, '移除 $1'],
    [/^Update ([A-Z][A-Z0-9_]*)$/, '更新 $1']
  ]
} satisfies PageDictionary
