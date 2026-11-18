import { afterEach, describe, expect, it } from 'vitest'
import { simplifiedChars } from '../../../scripts/data/simplified-only'
import { patternKey } from '../../../src/core/inline-key'
import { createMatcher } from '../../../src/core/matcher'
import { translateTitleText } from '../../../src/core/title'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhTW } from '../../../src/locales/zh-TW/index'

const matcher = createMatcher(zhTW)

const REPOSITORY: readonly PageKey[] = ['common', 'repository']
const SETTINGS: readonly PageKey[] = ['common', 'settings']
const ORG_SETTINGS: readonly PageKey[] = ['common', 'org-settings']
const REPO_SETTINGS: readonly PageKey[] = ['common', 'repository', 'repo-settings']
const ACTIONS: readonly PageKey[] = ['common', 'repository', 'actions']
const COMMON: readonly PageKey[] = ['common']
const DISCUSSIONS: readonly PageKey[] = ['common', 'repository', 'discussions']
const GIST: readonly PageKey[] = ['common', 'gist']
const PULLS: readonly PageKey[] = ['common', 'repository', 'pulls']
const SECURITY: readonly PageKey[] = ['common', 'repository', 'security']
const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']

/** 繁体词典里所有写死的译文：static、scoped、字符串替换、属性规则与行内句的译文 */
function literalTranslations(dict: PageDictionary): string[] {
  return [
    ...Object.values(dict.static ?? {}),
    ...Object.values(dict.scoped ?? {}),
    ...(dict.regexp ?? []).flatMap(([, replacement]) => (typeof replacement === 'string' ? [replacement] : [])),
    ...(dict.attributeRules ?? []).flatMap(([, , , replacement]) => (typeof replacement === 'string' ? [replacement] : [])),
    ...(dict.inline ?? []).flatMap(([, translation]) => (typeof translation === 'string' ? [translation] : []))
  ]
}

describe('繁体译文', () => {
  it('不含简体字', () => {
    const mixed = zhTW.flatMap(([page, dict]) =>
      literalTranslations(dict).flatMap(text => {
        const chars = simplifiedChars(text)
        return chars.length > 0 ? [`${page}：${text}（${chars.join('')}）`] : []
      })
    )
    expect(mixed).toEqual([])
  })

  it('不用弯引号', () => {
    const curly = zhTW.flatMap(([page, dict]) =>
      // 原文的弯引号被元素拆开、另一半留在英文片段里的除外（引号须成对）
      literalTranslations(dict)
        .filter(text => /[“”‘’]/.test(text) && !/^[^“”‘’]*[“‘]$/.test(text))
        .map(text => `${page}：${text}`)
    )
    expect(curly).toEqual([])
  })
})

/** docs/GLOSSARY.zh-TW.md 规定的核心译名 */
describe('核心译名', () => {
  it.each([
    [REPOSITORY, 'Issues', '議題'],
    [REPOSITORY, 'Pull requests', '拉取請求'],
    [REPOSITORY, 'Actions', '動作'],
    [REPOSITORY, 'Projects', '專案'],
    [REPOSITORY, 'Security', '安全性'],
    [REPOSITORY, 'Insights', '洞察'],
    [REPOSITORY, 'Settings', '設定'],
    [REPOSITORY, 'Code', '程式碼']
  ] as const)('%j：%s → %s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })

  it.each([
    [REPOSITORY, 'Fork', '分叉'],
    [REPOSITORY, 'Watch', '關注'],
    [REPOSITORY, 'Releases', '發行版本'],
    [REPOSITORY, 'Packages', '套件'],
    [REPOSITORY, 'Contributors', '貢獻者'],
    [REPOSITORY, 'Branches', '分支'],
    [REPOSITORY, 'Tags', '標記'],
    [REPOSITORY, 'Commits', '提交']
  ] as const)('%j：%s 含「%s」', (scopes, source, term) => {
    expect(matcher.translate(source, scopes)).toContain(term)
  })
})

/** Webhook 按用户规定译「Web 鉤子」 */
describe('Web 鉤子', () => {
  it.each([
    [SETTINGS, 'Read and write access to repository hooks'],
    [ORG_SETTINGS, 'Read access to organization hooks'],
    [SETTINGS, 'Full control of repository hooks'],
    [SETTINGS, 'Repository hooks'],
    [SETTINGS, 'Organization hooks'],
    [SETTINGS, 'Webhook'],
    [SETTINGS, 'Webhook URL'],
    [ORG_SETTINGS, 'webhook'],
    [REPO_SETTINGS, 'Webhooks'],
    [['common', 'sponsors'], 'Webhooks']
  ] as const)('%j：%s', (scopes, source) => {
    const target = matcher.translate(source, scopes)
    expect(target).toContain('Web 鉤子')
    expect(target).not.toMatch(/[钩鈎]|勾點|網路掛鉤/)
  })
})

/**
 * docs/GLOSSARY.zh-TW.md 第 2 节「并列」：动作并列用「並」，名词并列用「和」；
 * 同句已有「並」时改用顿号；互逆操作（建立和刪除、上傳和下載）保留「和」
 */
describe('动作并列', () => {
  it.each([
    [SETTINGS, 'View and edit Copilot Business seat assignments', '查看並編輯 Copilot 商務版席次指派'],
    [SETTINGS, 'View and edit copilot business seat assignments', '查看並編輯 Copilot 商務版席次指派'],
    [SETTINGS, 'Ability to create, read, update, and delete codespace secrets', '可建立、讀取、更新並刪除程式碼空間機密'],
    [SETTINGS, 'View and manage code scanning alerts.', '查看並管理程式碼掃描警示。'],
    [
      SETTINGS,
      'View and edit external custom properties for repositories, and manage the app installations that provide them, at the organization level.',
      '在組織層級查看、編輯儲存庫的外部自訂屬性，並管理提供這些屬性的應用程式安裝。'
    ],
    [
      COMMON,
      'Seamlessly plan, build, and ship great software with an extensible DevOps platform',
      '透過可擴充的 DevOps 平台，順暢地規劃、建置並交付優質軟體'
    ],
    [ORG_SETTINGS, 'Members will be able to clone, pull, and push all repositories.', '成員可以複製、拉取並推送所有儲存庫。'],
    [ORG_SETTINGS, 'Review and manage secret scanning bypass requests', '審查並管理機密掃描繞過請求'],
    [REPO_SETTINGS, 'Allow GitHub Actions to create and approve pull requests', '允許 GitHub 動作建立並核准拉取請求'],
    [
      ACTIONS,
      'This workflow will build a docker container, publish and deploy it to Tencent Kubernetes Engine (TKE).',
      '此工作流程會建置 Docker 容器，發布並部署到 Tencent Kubernetes Engine (TKE)。'
    ],
    [
      ['common', 'new'],
      'Blazing fast cloud developer environments with flexible compute and pre-configured containers, developers can code, collaborate, and debug from any browser. Pay only for what you use with compute fees starting at $0.18/hr and storage fees at $0.07/GB per month.',
      '極速雲端開發環境，具備彈性運算和預先設定的容器，開發人員可在任何瀏覽器中撰寫程式碼、協作並偵錯。依使用量付費，運算費用每小時 $0.18 起，儲存費用為每月每 GB $0.07。'
    ],
    [
      ORG_SETTINGS,
      'Access to create, view, update, and delete custom organization roles within the organization. This permission does not allow a user to assign custom roles.',
      '可在組織內建立、查看、更新並刪除自訂組織角色。此權限不允許使用者指派自訂角色。'
    ],
    [ORG_SETTINGS, 'Access to create and manage Actions organization secrets.', '可建立並管理組織動作機密。'],
    [
      ORG_SETTINGS,
      'Access to register and manage webhooks for the organization. Users with this permission will be able to view webhook payloads, which may contain metadata for repositories in the organization.',
      '可為組織註冊並管理 Web 鉤子。具有此權限的使用者可以查看 Web 鉤子承載，其中可能包含組織內儲存庫的中繼資料。'
    ],
    [
      ORG_SETTINGS,
      'Access to create and manage GitHub-hosted runners, self-hosted runners, and runner groups, and control where self-hosted runners can be created.',
      '可建立並管理 GitHub 代管的執行器、自架執行器和執行器群組，並控制可在何處建立自架執行器。'
    ],
    [
      ORG_SETTINGS,
      'Note: Variable values are exposed as plain text. If you need to encrypt and mask sensitive information,',
      '注意：變數值會以純文字公開。如需加密並遮罩敏感資訊，請改為'
    ],
    [
      REPO_SETTINGS,
      'Note: Variable values are exposed as plain text. If you need to encrypt and mask sensitive information,',
      '注意：變數值會以純文字公開。如需加密並遮罩敏感資訊，請改為'
    ],
    // 警示存取权说明，原文 repository's 有直引号、弯引号两种
    [
      REPO_SETTINGS,
      "Admins, users, and teams in the list below have permission to view and manage code scanning, Dependabot, or secret scanning alerts. These users may be notified when a new vulnerability is found in one of this repository's dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their",
      '下方清單中的管理員、使用者和團隊有權查看並管理程式碼掃描、Dependabot 或機密掃描警示。在此儲存庫的相依項目中發現新漏洞或有機密、金鑰被簽入時，這些使用者可能會收到通知。他們查看 Dependabot 安全性更新時也會看到更多詳細資料。個人可以管理自己接收這些警示的方式，詳見'
    ],
    [
      REPO_SETTINGS,
      'Admins, users, and teams in the list below have permission to view and manage code scanning, Dependabot, or secret scanning alerts. These users may be notified when a new vulnerability is found in one of this repository’s dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their',
      '下方清單中的管理員、使用者和團隊有權查看並管理程式碼掃描、Dependabot 或機密掃描警示。在此儲存庫的相依項目中發現新漏洞或有機密、金鑰被簽入時，這些使用者可能會收到通知。他們查看 Dependabot 安全性更新時也會看到更多詳細資料。個人可以管理自己接收這些警示的方式，詳見'
    ],
    // read and write 作谓语时用「讀寫」
    [['common', 'auth'], 'read and write all public and private repository data', '讀寫所有公開和私人儲存庫的資料']
  ] as const)('%j：%s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })

  it.each([
    [
      ['common', 'packages'],
      'Can upload and download this package. Can read and write package metadata.',
      '可上傳和下載此套件。可讀寫套件中繼資料。'
    ],
    [
      ['common', 'packages'],
      'Can upload, download, and manage this package. Can read and write package metadata. Can delete and restore packages.',
      '可上傳、下載並管理此套件。可讀寫套件中繼資料。可刪除和還原套件。'
    ],
    [REPO_SETTINGS, 'Administrators will be able to create and delete protected tags.', '管理員可以建立和刪除受保護的標記。'],
    [SETTINGS, 'Create and remove enterprise organizations', '建立和移除企業組織'],
    [SETTINGS, 'Follow and unfollow users', '追蹤和取消追蹤使用者'],
    // 同一钉选汇总事件，词序只随两次操作的先后变化，连接词一致
    [ISSUES, 'pinned and unpinned a', '釘選和取消釘選了一則'],
    [ISSUES, 'unpinned and pinned a', '取消釘選和重新釘選了一則']
  ] as const)('互逆操作保留「和」 %j：%s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })

  // 先后动作、一个按钮做两件事：不是互逆并列，仍用「並」
  it.each([
    [PULLS, 'Save and discard', '儲存並捨棄'],
    [['common', 'organization'], 'Invite and reinstate', '邀請並還原']
  ] as const)('先后动作仍用「並」 %j：%s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })

  it.each([
    [SETTINGS, 'Full control of GitHub Copilot settings and seat assignments', '完全控制 GitHub Copilot 設定和席次指派'],
    [REPO_SETTINGS, 'Build and deployment', '建置和部署'],
    [REPO_SETTINGS, 'Read and write permissions', '讀取和寫入權限']
  ] as const)('名词并列不变 %j：%s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })
})

describe('动作页的筛选面板', () => {
  const actionsIgnore = zhTW.filter(([page]) => page === 'actions').flatMap(([, dict]) => dict.ignore ?? [])

  it.each(['workflow', 'event', 'branch', 'actor'])('Filter %s options：选择器按繁体译文识别输入框', key => {
    const label = matcher.translate(`Filter ${key} options`, ACTIONS)
    expect(label).toBeDefined()
    expect(actionsIgnore.some(selector => selector.includes(`[aria-label="${label}"]`))).toBe(true)
  })
})

/**
 * 时刻与繁体 Intl（浏览器按 lang="zh-TW" 渲染的时间元素）一致：上午 / 下午 + 12 小时制；
 * 本地时区（测试固定为 GMT+8）不写，其他时区在末尾方括号里
 */
describe('繁体时刻', () => {
  it.each([
    [COMMON, 'Oct 26, 2026, 8:33 PM GMT+8', '2026年10月26日 下午 8:33'],
    [COMMON, 'Oct 26, 2026, 12:05 AM UTC', '2026年10月26日 上午 12:05 [UTC]'],
    [COMMON, 'Jan 15, 2026, 6:05 PM GMT', '2026年1月15日 下午 6:05 [GMT]'],
    [COMMON, 'Jul 15, 2026, 11:05 AM PDT', '2026年7月15日 上午 11:05 [PDT]'],
    [COMMON, 'Jan 15, 2026, 8:05 AM HST', '2026年1月15日 上午 8:05 [HAST]'],
    // en-US 给 America/Adak 用的缩写，繁体 Intl 写法相同
    [COMMON, 'Jan 15, 2026, 12:05 AM HAST', '2026年1月15日 上午 12:05 [HAST]'],
    [COMMON, 'Jul 15, 2026, 1:05 AM HADT', '2026年7月15日 上午 1:05 [HADT]'],
    [COMMON, 'on Oct 26, 2026, 10:03 AM', '2026年10月26日 上午 10:03'],
    [COMMON, 'October 26, 2026 00:05', '2026年10月26日 上午 12:05'],
    [COMMON, 'October 26, 2026 14:03', '2026年10月26日 下午 2:03'],
    [COMMON, '12:00 PM today', '今天 下午 12:00'],
    [COMMON, '7:05 AM on October 19', '10月19日 上午 7:05'],
    [COMMON, '07:51AM on October 16', '10月16日 上午 7:51'],
    [COMMON, 'Yesterday at 3:45 PM', '昨天 下午 3:45'],
    [DISCUSSIONS, '12 comments: octocat, 11:34PM on September 06', '12 則留言：octocat，9月6日 下午 11:34'],
    [GIST, 'LICENSE content, created by octocat on 02:10AM today.', 'LICENSE 的內容，由 octocat 於今天 上午 2:10 建立。']
  ] as const)('%j：%s → %s', (scopes, source, target) => {
    expect(matcher.translate(source, scopes)).toBe(target)
  })

  describe('本地时区为 America/Adak', () => {
    afterEach(() => {
      process.env.TZ = 'Asia/Shanghai'
    })

    it('HAST、HADT 是本地时区，不写', () => {
      process.env.TZ = 'America/Adak'
      // 匹配器按原文缓存译文：换了时区要新建
      const adak = createMatcher(zhTW)

      expect(adak.translate('Jan 15, 2026, 12:05 AM HAST', COMMON)).toBe('2026年1月15日 上午 12:05')
      expect(adak.translate('Jul 15, 2026, 1:05 AM HADT', COMMON)).toBe('2026年7月15日 上午 1:05')
    })
  })
})

describe('拼接与整段合并', () => {
  it('合并框：將 + 分支名 + 的最新變更合併到此分支。', () => {
    expect(matcher.translate('Merge the latest changes from', PULLS)).toBe('將')
    expect(matcher.translate('into this branch.', PULLS)).toBe('的最新變更合併到此分支。')
  })

  it('单文件模式提示：Previous / Next 是档案导航按钮', () => {
    expect(matcher.translate('Use the Previous and Next buttons to move between files.', PULLS)).toBe(
      '請使用上一個和下一個按鈕在檔案之間切換。'
    )
  })

  it('安全页被元素拆开的整句：时间与方式放在动词之前', () => {
    const inline = (key: string): string | undefined => matcher.translateInline(patternKey(key), SECURITY)
    expect(inline('Fixed {} via pull request #12')).toBe('於 {}透過拉取請求 #12 修正')
    expect(inline('Fixed {} via commit abc1234')).toBe('於 {}透過提交 abc1234 修正')
    expect(inline('Fixed {}')).toBe('修正於 {}')
    expect(inline('#12 was closed {}')).toBe('#12 關閉於 {}')
    expect(inline('Prioritize this alert with signals like {}, {}, or {}.')).toBe('依據{}、{}或{}等訊號排定此警示的優先順序。')
    expect(inline('Revoke this {} through {} to prevent unauthorized access.')).toBe('將此 {} 透過 {} 撤銷，以防止未經授權的存取。')
  })
})

describe('跨页面配套词条', () => {
  it('强制 2FA 横幅的后半句：截止日期按繁体写法', () => {
    expect(
      matcher.translate(
        'to enable two-factor authentication as an additional security measure. Your activity on GitHub includes you in this requirement. You will need to enable two-factor authentication on your account before March 15, 2027, or be restricted from account actions.',
        COMMON
      )
    ).toBe(
      '啟用雙重驗證作為額外的安全措施。根據你在 GitHub 上的活動，你也在此要求範圍內。你必須在 2027年3月15日之前為帳號啟用雙重驗證，否則帳號操作將受到限制。'
    )
  })

  it('已保存回复为空时的 settings 链接：经典评论框所在页面译「設定」，其他页面保持原文', () => {
    const releases: readonly PageKey[] = ['common', 'repository', 'releases']
    for (const scope of [DISCUSSIONS, releases, SECURITY, PULLS]) {
      expect(matcher.translate('settings', scope)).toBe('設定')
    }
    expect(matcher.translate('settings', ['common', 'repository', 'code'])).toBeUndefined()
  })

  it('代码片段名片的本地时间差：时与分之间不带空格', () => {
    expect(matcher.translate('- 2h30m behind', GIST)).toBe('- 慢2 小時 30 分鐘')
    expect(matcher.translate('- 5h 30m ahead', GIST)).toBe('- 快5 小時 30 分鐘')
  })

  it('全站横幅：locked out 同「無法存取帳號」；停用功能预览的两句按句拆开，Please 是全局词条', () => {
    expect(matcher.translate("Don't get locked out of your account.", COMMON)).toBe('避免無法存取帳號。')
    // 换机提醒：this season 指节假日
    const holiday =
      "Don't get locked out - if you get a new phone this season, be sure to transfer your authenticator app data to the new phone. Enable cloud back up if your authenticator app supports it and consider"
    expect(matcher.translate(holiday, COMMON)).toMatch(/^避免無法存取帳號——如果你在這個假期換了新手機，/)
    expect(matcher.translate('Feature disabled. Please', COMMON)).toBe('功能已停用。請')
    expect(matcher.translate(', just to be safe.', COMMON)).toBe('，以防萬一。')
    expect(matcher.translate('now required', COMMON)).toBe('現在必須')
  })

  it('旧版命令面板：命令模式同用「進入」，帮助项按整句翻译', () => {
    expect(matcher.translate('Type > to activate command mode', COMMON)).toBe('按 > 進入命令模式')
    expect(matcher.translate('Activate command mode', COMMON)).toBe('進入命令模式')
    expect(matcher.translate('Search for issues, pull requests, discussions, and projects', COMMON)).toBe('搜尋議題、拉取請求、討論和專案')
    expect(matcher.translate('Search for projects', COMMON)).toBe('搜尋專案')
    expect(matcher.translate('Sync with system settings', COMMON)).toBe('與系統設定同步')
    expect(matcher.mergeSelectors(COMMON)).toEqual(
      expect.arrayContaining([
        '[data-target="command-palette-help.titleElement"]',
        '[data-target="command-palette-item.titleElement"] > span'
      ])
    )
  })

  it('旧版命令面板 # 模式的筛选提示：is:project 与 is:issue、is:pr 同句式，projects 作「專案」', () => {
    expect(matcher.translate('Type is:issue to filter to issues', COMMON)).toBe('輸入 is:issue 僅篩選議題')
    expect(matcher.translate('Type is:pr to filter to pull requests', COMMON)).toBe('輸入 is:pr 僅篩選拉取請求')
    expect(matcher.translate('Type is:project to filter to projects', COMMON)).toBe('輸入 is:project 僅篩選專案')
    expect(matcher.translate('Type is:open to filter to open content', COMMON)).toBe('輸入 is:open 僅篩選開放中的內容')
  })

  it('旧版命令面板底部的搜索项：全局、所有者、存储库三种范围', () => {
    const inline = (key: string): string | undefined => matcher.translateInline(patternKey(key), COMMON)
    expect(inline('Search {} across all of GitHub')).toBe('在整個 GitHub 中搜尋{}')
    expect(inline('Search {} in octo-org/hello-world')).toBe('在 octo-org/hello-world 中搜尋{}')
    expect(inline('Search {} in octo-org')).toBe('在 octo-org 中搜尋{}')
    expect(inline('Search {} in this repository')).toBeUndefined()
    // 片段兜底
    expect(matcher.translate('across all of GitHub', COMMON)).toBe('在整個 GitHub 中')
  })

  it('旧版命令面板的报错条与提示条：报错条三种撇号写法同译，失败提示用「無法」「失敗」', () => {
    const tail = 'available at this time. Type a new search or try again later.'
    const expected = '發生錯誤，部分結果目前無法取得。請重新搜尋或稍後再試。'
    for (const head of [
      "We’ve encountered an error and some results aren't",
      "We've encountered an error and some results aren't",
      'We’ve encountered an error and some results aren’t'
    ]) {
      expect(matcher.translate(`${head} ${tail}`, COMMON)).toBe(expected)
    }
    expect(matcher.translate('Failed to run command', COMMON)).toBe('無法執行命令')
    expect(matcher.translate('Copy failed', COMMON)).toBe('複製失敗')
  })

  it('未登录首页标签页标题：标语段翻译，站点名段保持原样', () => {
    const title = 'GitHub · Build and ship software on a single, collaborative platform · GitHub'
    expect(translateTitleText(title, text => matcher.translate(text, COMMON))).toBe('GitHub · 在單一協作平台上打造並交付軟體 · GitHub')
  })
})

describe('表单校验错误', () => {
  it.each([
    ["Name can't be blank", '名稱不能為空白'],
    ['Login has already been taken', '使用者名稱已在使用中'],
    ['Callback URL is not a valid URL', '回呼 URL 不是有效的 URL'],
    ['Description is too long (maximum is 350 characters).', '描述過長（上限為 350 個字元）。'],
    ['Domain is not a valid public domain.. Domain is not properly formatted.', '網域不是有效的公開網域。網域格式不正確。'],
    ['Loading... Try again.', '載入中... 請再試一次。'],
    ['Note is too long (maximum is 250 characters)', '備註過長（上限為 250 個字元）']
  ])('%s → %s', (input, expected) => {
    expect(matcher.translate(input, SETTINGS)).toBe(expected)
  })

  it('单独的 README 标签译作「讀我檔案」', () => {
    expect(matcher.translate('README', REPOSITORY)).toBe('讀我檔案')
    expect(matcher.translate('Readme', REPOSITORY)).toBe('讀我檔案')
  })

  it('封锁对话框的备注与校验句同用「備註」', () => {
    expect(matcher.translate('Add an optional note', SETTINGS)).toBe('新增選填備註')
    expect(matcher.translate('Note is too long (maximum is 250 characters).', SETTINGS)).toBe('備註過長（上限為 250 個字元）。')
  })

  it('问题页：校验句由通用校验规则翻译，筛选器错误仍由筛选规则翻译', () => {
    expect(matcher.translate('Title is invalid', ISSUES)).toBe('標題無效')
    expect(matcher.translate("Name can't be blank. Name is invalid", ISSUES)).toBe('名稱不能為空白。名稱無效')
    expect(matcher.translate('label:foo is invalid', ISSUES)).toBe('label:foo 無效')
  })
})
