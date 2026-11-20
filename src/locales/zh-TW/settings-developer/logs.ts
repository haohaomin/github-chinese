import { lookupTable } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import regions from '../common/regions'
import { joinCjk } from '../helpers'

const regionText = lookupTable(regions.static)

/**
 * 安全日志事件的地点「城市, 地区, 国家/地区」（地区常为空）：国家/地区名在 common/regions 中时才改写，
 * 按国家/地区、地区、城市排列，去掉空项与重名，收录的地名译出，其余保留原文。
 * 国家/地区名不在其中时抛错（引擎按未命中处理，后面的规则照常匹配：日期、权限列表等同样是逗号分隔的三段）
 */
function eventLocation(_: string, city: string, region: string, country: string): string {
  if (regionText(country) === undefined) throw new Error(`非地点：${country}`)
  const parts = [country, region, city].filter((part, index, all) => part !== '' && all.indexOf(part) === index)
  return parts.map(part => regionText(part) ?? part).join(' ')
}

/** 地点中的一段（不含捕获组）：以大写字母（含带变音符号的拉丁字母）开头，不含逗号、数字、冒号 */
const PLACE_SOURCE = '(?:[A-ZÀ-ÖØ-Þ][^,\\d:]*)'

const TOKEN_ACTION: Readonly<Record<string, string>> = {
  Created: '建立了',
  Regenerated: '重新產生了',
  Updated: '更新了',
  Revoked: '撤銷了'
}

const TWO_FACTOR_METHOD: Readonly<Record<string, string>> = {
  'authenticator app': '驗證器應用程式',
  SMS: '簡訊',
  'security key': '安全金鑰',
  passkey: '密碼金鑰',
  'GitHub Mobile': 'GitHub 行動版',
  'recovery code': '復原碼'
}

/**
 * 审核日志搜索建议「action: filter by action」中的筛选对象（与组织审核日志一致）。
 * actor 按术语表作「執行者」；operation 作「操作類型」
 */
const FILTER_TARGET: Readonly<Record<string, string>> = {
  action: '動作',
  actor: '執行者',
  country: '國家/地區',
  'created date': '建立日期',
  operation: '操作類型',
  organization: '組織',
  repository: '儲存庫',
  user: '使用者'
}

const FILTER_TARGET_SOURCE = '(action|actor|country|created date|operation|organization|repository|user)'

/** 令牌事件中的应用类型 */
const APP_KIND: Readonly<Record<string, string>> = { 'GitHub App': 'GitHub 應用程式', 'OAuth app': 'OAuth 應用程式' }

/** 工作流令牌默认权限：read → 唯讀，write → 讀寫 */
const WORKFLOW_PERMISSION: Readonly<Record<string, string>> = { read: '唯讀', write: '讀寫' }

/**
 * 安全日志（/settings/security-log）、赞助日志（/settings/sponsors-log）、预定提醒（/settings/reminders）。
 * 安全日志事件描述被用户、存储库、应用链接拆开，按片段收录；整句未被拆开时由正则匹配。
 * 事件代码（user.login 等）和原始字段保留英文。
 * 术语：audit log → 稽核記錄，security log → 安全性記錄，sponsors log → 贊助記錄，
 * scheduled reminders → 排定的提醒，challenge（双重验证）→ 挑戰。
 */
export default {
  static: {
    // 安全日志：搜索、筛选与导出
    'Loading audit log entries…': '正在載入稽核記錄項目…',
    'Loading audit log entries...': '正在載入稽核記錄項目...',
    'Filter audit logs': '篩選稽核記錄',
    "Yesterday's activity": '昨天的活動',
    'Yesterday’s activity': '昨天的活動',
    'Repository management': '儲存庫管理',
    'Billing updates': '帳務更新',
    'Copilot activity': 'Copilot 活動',
    'Personal access token activity': '個人存取權杖活動',
    'View advanced search syntax': '查看進階搜尋語法',
    'Filter by Member': '依成員篩選',
    'Filter by Action': '依動作篩選',
    'Search audit logs': '搜尋稽核記錄',
    'Search your security log': '搜尋你的安全性記錄',
    'Events matching search query': '與搜尋查詢相符的事件',
    'Recent events': '最近的事件',
    'Unknown IP address': '未知的 IP 位址',
    'Unknown location': '未知的位置',
    'View all events created yesterday': '查看昨天建立的所有事件',
    'View all events where you created something': '查看你建立內容的所有事件',
    'We couldn’t find any events matching your search.': '找不到與搜尋相符的事件。',
    "We couldn't find any events matching your search.": '找不到與搜尋相符的事件。',
    // 原文两处之间无逗号，译文不加
    "Export job successfully created. Please don't close this window and note that an export job may take up to one hour to complete.":
      '已成功建立匯出作業。請勿關閉此視窗並注意匯出作業最多可能需要一小時才能完成。',
    'Export job successfully created. Please don’t close this window and note that an export job may take up to one hour to complete.':
      '已成功建立匯出作業。請勿關閉此視窗並注意匯出作業最多可能需要一小時才能完成。',
    'Too many exports in progress. Please try again later.': '進行中的匯出作業過多。請稍後再試。',

    // 安全日志：事件描述
    'Country changed from your previous session': '國家/地區與上次工作階段不同',
    'User signed in from an unrecognized device.': '使用者從無法辨識的裝置登入。',
    'User signed in from an unrecognized device and location.': '使用者從無法辨識的裝置和位置登入。',
    'New Device Used': '使用了新裝置',
    'Two-factor auth requested': '已要求雙重驗證',
    'Created the repository': '建立了儲存庫',
    'Deleted the repository': '刪除了儲存庫',
    'Created project': '建立了專案',
    'Closed project': '關閉了專案',
    'Created a view in project': '在以下專案中建立了檢視',
    'Created GitHub Pages site in': '在以下儲存庫中建立了 GitHub 頁面網站',
    'Modified GitHub Pages source in': '修改了以下儲存庫的 GitHub 頁面來源',
    'Changed GitHub Pages visibility to public': '將 GitHub 頁面可見度變更為公開',
    'Created environment': '建立了環境',
    'Added deployment branch pattern with value': '新增的部署分支模式值為',
    'Created a deployment branch protection rule for': '為以下環境建立了部署分支保護規則',
    'The environment can only deploy in branches matching a branch policy pattern.': '該環境只能部署到與分支政策模式相符的分支。',
    '. The environment can only deploy in branches matching a branch policy pattern.': '。該環境只能部署到與分支政策模式相符的分支。',
    // 「Added the following repositories to the <組織> organization with <read> permission」：放进已有集合用「加入」
    'Added the following repositories to the': '已將以下儲存庫加入',
    'Removed the following repositories from the': '已將以下儲存庫移出',
    'Enabled GitHub Actions for': '為以下儲存庫啟用了 GitHub 動作',
    'Created a secret for': '為以下儲存庫建立了機密',
    // 「Created a token for <用户> ending in <代码> for the <应用> GitHub App」
    'Created a token for': '為以下使用者建立了權杖',
    'Regenerated a token for': '為以下使用者重新產生了權杖',
    'Updated a token for': '為以下使用者更新了權杖',
    'Revoked a token for': '撤銷了以下使用者的權杖',
    'Created a Pages verified domain': '建立了頁面的已驗證網域',
    'Deleted a Pages verified domain': '刪除了頁面的已驗證網域',

    // 赞助日志
    'Sponsors log': '贊助記錄',
    'Sponsorship Log': '贊助記錄',
    'New sponsorships, changes, and cancellations': '新的贊助、變更和取消',
    'All-time': '所有時間',
    'Past day': '過去一天',
    'Past week': '過去一週',
    'Past month': '過去一個月',
    'Past year': '過去一年',
    'No sponsorship activity in this time period': '此期間沒有贊助活動',
    'This is where you can review activity from your sponsorships.': '你可以在這裡查看贊助活動。',

    // 预定提醒（instance → 執行個體）
    'Reminders allow you to push certain events to authorized instances of Microsoft Teams or Slack.':
      '提醒可將特定事件推送到已授權的 Microsoft Teams 或 Slack 執行個體。',
    "To use scheduled reminders, make sure that the Slack or Microsoft Teams integration is installed and up-to-date. If you need help with this, please contact your organization's owner.":
      '若要使用排定的提醒，請確認已安裝最新版的 Slack 或 Microsoft Teams 整合。如需協助，請聯絡組織擁有者。',
    'To use scheduled reminders, make sure that the Slack or Microsoft Teams integration is installed and up-to-date. If you need help with this, please contact your organization’s owner.':
      '若要使用排定的提醒，請確認已安裝最新版的 Slack 或 Microsoft Teams 整合。如需協助，請聯絡組織擁有者。',
    'Available organizations': '可用的組織',
    'Unavailable organizations': '無法使用的組織',
    'Configure Reminder': '設定提醒',
    'Configure reminder': '設定提醒',
    'No reminders': '沒有提醒',
    'Needs installing': '需要安裝',
    'New scheduled reminder': '新增排定的提醒',
    'Edit scheduled reminder': '編輯排定的提醒',
    'Slack workspace': 'Slack 工作區',
    'Authorize Slack workspace': '授權 Slack 工作區',
    'Review requests assigned to you': '指派給你的審查請求',
    'Receive reminders for reviews waiting on you.': '接收等待你處理的審查提醒。',
    'Review requests assigned to your team': '指派給你團隊的審查請求',
    'Receive reminders for reviews waiting on your team.': '接收等待你的團隊處理的審查提醒。',
    'Enable real-time alerts': '啟用即時警示',
    'Receive immediate Slack messages when certain events happen': '發生特定事件時立即接收 Slack 訊息',
    // 「… because the current plan for <strong>组织</strong> does not support reminders for private repositories.」
    // because 从句用“因…而…”，原文无逗号，译文不加
    'You will only receive notifications from public repositories in this organization because the current plan for': '你因組織',
    'does not support reminders for private repositories.': '的目前方案不支援私人儲存庫的提醒而只會收到此組織公開儲存庫的通知。',
    'Upgrade to Team': '升級到團隊版',
    'Create reminder': '建立提醒',
    'Update reminder': '更新提醒',
    'Delete reminder': '刪除提醒'
  },
  scoped: {
    'Period:': '期間：',
    // 安全日志事件片段：「… a token for <用户> ending in <代码> for the <应用> OAuth app」
    'ending in': '結尾為',
    'for the': '用於',
    'GitHub App.': 'GitHub 應用程式。',
    'OAuth app': 'OAuth 應用程式',
    // 句末无句号的同一片段；也是 /settings/apps/new 表单的属性值
    'GitHub App': 'GitHub 應用程式',
    // 「Changed <strong>a merge setting</strong> on the <a>owner/repo</a> repository」等被链接拆开的事件描述
    'a merge setting': '合併設定',
    'on the': '於',
    'to the': '到',
    // 「Closed project <项目> in <所有者>」
    in: '位於',
    'organization with': '組織並授予',
    read: '讀取',
    permission: '權限',
    // 搜索建议：「action:」限定词保留，说明翻译（filter by organization / repository 由 notifications 收录）
    'filter by action': '依動作篩選',
    'filter by actor': '依執行者篩選',
    'filter by country': '依國家/地區篩選',
    'filter by created date': '依建立日期篩選',
    'filter by operation': '依操作類型篩選',
    'filter by user': '依使用者篩選',
    Export: '匯出',
    Exporting: '匯出中',
    'Show more details': '顯示更多詳細資料',
    'Clear current search query': '清除目前的搜尋查詢',
    'Logged in': '已登入',
    integration: '整合',
    'integration:': '整合：',
    // 预定提醒：星期全称 → 星期X，与组织预定提醒一致（缩写 Mon 等 → 週X）
    Days: '星期',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    Sunday: '星期日',
    Times: '時間'
  },
  regexp: [
    [/^Found (\d+) events?$/, '找到 $1 個事件'],
    [/^View ([\w-]+)['’]s profile$/, '查看 $1 的個人檔案'],
    // 搜索建议的无障碍标签：「action: filter by action」（限定词与半角冒号原样保留）
    [
      new RegExp(`^([a-z_]+): filter by ${FILTER_TARGET_SOURCE}$`),
      (_, qualifier: string, target: string) => `${qualifier}: 依${FILTER_TARGET[target] ?? target}篩選`
    ],
    [
      /^Two-factor auth challenge solved with (authenticator app|SMS|security key|passkey|GitHub Mobile|recovery code)$/,
      (_, method: string) => joinCjk(joinCjk('已透過', TWO_FACTOR_METHOD[method] ?? method), '完成雙重驗證挑戰')
    ],
    // 原文句中无标点，译文也不加：「Created a token for octocat ending in abcd for the Copilot GitHub App.」
    [
      /^(Created|Regenerated|Updated|Revoked) a token for ([\w-]+) ending in (\S+) for the (.+) (GitHub App|OAuth app)(\.?)$/,
      (_, action: string, owner: string, suffix: string, app: string, kind: string, dot: string) =>
        `${joinCjk(`${TOKEN_ACTION[action] ?? action} ${owner} 的結尾為 ${suffix} 的`, app)} ${APP_KIND[kind] ?? kind}權杖${dot ? '。' : ''}`
    ],
    [/^Added deployment branch pattern with value (.+) for (.+)\.$/, '為 $2 新增了值為 $1 的部署分支模式。'],
    [
      /^Created a deployment branch protection rule for (.+)\. The environment can only deploy in branches matching a branch policy pattern\.$/,
      '為 $1 建立了部署分支保護規則。該環境只能部署到與分支政策模式相符的分支。'
    ],
    [/^Changed GitHub Pages visibility to public (.+)$/, '將 $1 的 GitHub 頁面可見度變更為公開'],
    // 工作流令牌策略：句尾的存储库是链接
    [
      /^Set policy to default workflow token permission to (read|write) for$/,
      (_, level: string) => `為以下儲存庫將預設工作流程權杖權限政策設為${WORKFLOW_PERMISSION[level] ?? level}`
    ],
    // 原文用缩写 PR，按术语表保留
    [
      /^Set policy to default workflow token can create or approve PR to (true|false) for$/,
      (_, value: string) => `為以下儲存庫${value === 'true' ? '允許' : '禁止'}預設工作流程權杖建立或核准 PR`
    ],
    // 头像事件（团队头像等）：「Updated profile picture for octo-org/team」
    [/^Updated profile picture for (.+)$/, '更新了 $1 的頭像'],
    // 事件地点：Hong Kong, , Hong Kong → 香港
    [new RegExp(`^(${PLACE_SOURCE}?), (${PLACE_SOURCE}?), (${PLACE_SOURCE})$`), eventLocation]
  ],
  // 事件描述被用户、应用、企业链接拆开的句子
  inline: [
    ['Blocked user {}', '封鎖了使用者 {}'],
    ['Unblocked user {}', '解除封鎖了使用者 {}'],
    ['Removed authorization for OAuth application {}', '移除了 OAuth 應用程式 {} 的授權'],
    ['Added {} as an owner of the {} enterprise', '將 {} 新增為 {} 企業的擁有者'],
    ['{} added payment details to the {} enterprise', '{} 為 {} 企業新增了付款詳細資料'],
    ['Marketplace listing {} was sent back to draft state', '市集上架資訊 {} 已退回草稿狀態'],
    ['Installed the {} integration.', '安裝了 {} 整合。']
  ]
} satisfies PageDictionary
