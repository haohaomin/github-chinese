import {
  ACCELERATE_KEYS,
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupFileName,
  isEmptyBackup,
  mergeImportedEntries,
  mergeImportedRules,
  mergeImportedSettings,
  parseBackup,
  scopeBackup,
  serializeBackup,
  settingsOfScope,
  type BackupData
} from '../../../src/shared/backup'
import { DEFAULT_SETTINGS } from '../../../src/shared/settings'

/** 备份文件的文本 */
function file(content: Record<string, unknown>): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, ...content })
}

describe('设置备份', () => {
  describe('解析', () => {
    it.each([
      ['不是 JSON', '{'],
      ['不是对象', '[]'],
      ['格式不符', JSON.stringify({ format: 'other', version: 1 })],
      ['没有版本', JSON.stringify({ format: BACKUP_FORMAT })],
      ['版本更新', JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION + 1 })]
    ])('%s：不是备份文件', (_name, text) => {
      expect(parseBackup(text)).toBeUndefined()
    })

    it('只有文件头：没有可导入的内容', () => {
      const data = parseBackup(file({ exportedAt: '2026-11-04T00:00:00.000Z' }))
      expect(data).toEqual({})
      expect(isEmptyBackup(data!)).toBe(true)
    })

    it('设置：只取文件中有的项；类型不符的用默认值；未知的项丢弃', () => {
      expect(parseBackup(file({ settings: { accelerate: true, translateTime: 'yes', unknown: 1 } }))?.settings).toEqual({
        accelerate: true,
        translateTime: DEFAULT_SETTINGS.translateTime
      })
    })

    it('分类、分类顺序、加速源、替换原链接：文件中有其中一项时一并导入，其余为默认', () => {
      expect(parseBackup(file({ settings: { replaceCategory: 'ghfast' } }))?.settings).toEqual({
        categories: DEFAULT_SETTINGS.categories,
        categoryOrder: DEFAULT_SETTINGS.categoryOrder,
        removedCategories: DEFAULT_SETTINGS.removedCategories,
        customSources: DEFAULT_SETTINGS.customSources,
        removedSources: DEFAULT_SETTINGS.removedSources,
        replaceCategory: 'ghfast'
      })
      expect(parseBackup(file({ settings: { categoryOrder: ['ghfast', 'gh-proxy', 'missing'] } }))?.settings?.categoryOrder).toEqual([
        'ghfast',
        'gh-proxy'
      ])
    })

    it('排除路径、自定义页面：去掉格式错误、重复的路径', () => {
      const paths = [' /settings ', 'settings', '/settings', '/*/*/wiki', 3]
      expect(
        parseBackup(
          file({ settings: { excludedPaths: paths.filter(item => typeof item === 'string'), newTabPaths: ['x', '/*/*/releases'] } })
        )?.settings
      ).toEqual({
        excludedPaths: ['/settings', '/*/*/wiki'],
        newTabPaths: ['/*/*/releases']
      })
    })

    it('自定义词条：规范化原文与译文；空的、不是文字的丢弃', () => {
      expect(parseBackup(file({ customEntries: { '  Code  ': ' 代码 ', Wiki: ' ', Pull: 1 } }))?.customEntries).toEqual({ Code: '代码' })
    })

    it('屏蔽规则：规范化写法；无效的丢弃；同一规则只留第一条', () => {
      const rules = [' @octocat ', 'https://github.com/vuejs/core', '@OctoCat', 'VUEJS/CORE', '', 1, '@-octocat', 'Sample text']
      expect(parseBackup(file({ searchBlockRules: rules }))?.searchBlockRules).toEqual(['@octocat', 'vuejs/core', 'Sample text'])
    })

    it('企业版站点：规范化为主机名；无效的、GitHub 自己的站点丢弃；去重', () => {
      const sites = ['https://GitHub.Example.com/octocat', 'github.example.com', 'github.com', 'not a host', 2, 'octo-corp.ghe.com']
      expect(parseBackup(file({ enterpriseSites: sites }))?.enterpriseSites).toEqual(['github.example.com', 'octo-corp.ghe.com'])
    })

    it('各部分类型不符时略过', () => {
      expect(
        parseBackup(file({ settings: [], customEntries: 'Code', searchBlockRules: {}, enterpriseSites: 'github.example.com' }))
      ).toEqual({})
    })
  })

  describe('范围', () => {
    const data: BackupData = {
      settings: {
        accelerate: true,
        failover: true,
        replaceCategory: 'ghfast',
        purifySearch: true,
        purifyBuiltin: false,
        translateTime: false
      },
      customEntries: { Code: '代码' },
      searchBlockRules: ['@octocat'],
      enterpriseSites: ['github.example.com']
    }

    it('全部：原样', () => {
      expect(scopeBackup(data, 'all')).toBe(data)
    })

    it('加速设置：开关、分类、加速源与替换原链接', () => {
      expect(scopeBackup(data, 'accelerate')).toEqual({ settings: { accelerate: true, failover: true, replaceCategory: 'ghfast' } })
    })

    it('加速设置：文件中只有开关时只导入开关，不补加速源的各项', () => {
      const parsed = parseBackup(file({ settings: { accelerateImages: true, translateTime: false } }))!
      expect(scopeBackup(parsed, 'accelerate')).toEqual({ settings: { accelerateImages: true } })
    })

    it('排除路径：只有排除路径', () => {
      expect(scopeBackup({ ...data, settings: { ...data.settings, excludedPaths: ['/settings'] } }, 'excluded')).toEqual({
        settings: { excludedPaths: ['/settings'] }
      })
    })

    it('新标签页打开：开关、范围与自定义页面', () => {
      const withNewTab: BackupData = {
        ...data,
        settings: { ...data.settings, newTab: true, newTabScopes: ['search'], newTabPaths: ['/*/*/releases'] }
      }
      expect(scopeBackup(withNewTab, 'new-tab')).toEqual({
        settings: { newTab: true, newTabScopes: ['search'], newTabPaths: ['/*/*/releases'] }
      })
    })

    it('净化设置：净化开关、内置规则开关与屏蔽规则', () => {
      expect(scopeBackup(data, 'purify')).toEqual({
        settings: { purifySearch: true, purifyBuiltin: false },
        searchBlockRules: ['@octocat']
      })
    })

    it('企业版设置：站点', () => {
      expect(scopeBackup(data, 'enterprise')).toEqual({ enterpriseSites: ['github.example.com'] })
    })

    it('范围内没有的部分：为空', () => {
      const entriesOnly: BackupData = { customEntries: { Code: '代码' } }
      for (const scope of ['excluded', 'accelerate', 'purify', 'new-tab', 'enterprise'] as const) {
        expect(isEmptyBackup(scopeBackup(entriesOnly, scope)), scope).toBe(true)
      }
      expect(isEmptyBackup(scopeBackup({ settings: { translateTime: false } }, 'accelerate'))).toBe(true)
      expect(isEmptyBackup(scopeBackup({ settings: { accelerate: true } }, 'accelerate'))).toBe(false)
      expect(isEmptyBackup(entriesOnly)).toBe(false)
    })

    it('导出时取设置中范围内的项', () => {
      const settings = { ...DEFAULT_SETTINGS, accelerate: true }
      expect(settingsOfScope(settings, 'all')).toBe(settings)
      expect(Object.keys(settingsOfScope(settings, 'accelerate'))).toEqual([...ACCELERATE_KEYS])
      expect(settingsOfScope(settings, 'accelerate')).toMatchObject({ accelerate: true, accelerateImages: false, failover: false })
      expect(settingsOfScope(settings, 'purify')).toEqual({ purifySearch: settings.purifySearch, purifyBuiltin: settings.purifyBuiltin })
      expect(settingsOfScope(settings, 'excluded')).toEqual({ excludedPaths: settings.excludedPaths })
      expect(settingsOfScope(settings, 'new-tab')).toEqual({
        newTab: settings.newTab,
        newTabScopes: settings.newTabScopes,
        newTabPaths: settings.newTabPaths
      })
      expect(settingsOfScope(settings, 'enterprise')).toEqual({})
    })
  })

  describe('导出', () => {
    it('文件头、导出时间与各部分；缩进两格，末尾换行；能再解析', () => {
      const text = serializeBackup({ searchBlockRules: ['@octocat'] }, new Date('2026-11-04T08:00:00.000Z'))
      expect(text.startsWith('{\n  "format"')).toBe(true)
      expect(text.endsWith('}\n')).toBe(true)
      expect(JSON.parse(text)).toEqual({
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: '2026-11-04T08:00:00.000Z',
        searchBlockRules: ['@octocat']
      })
      expect(parseBackup(text)).toEqual({ searchBlockRules: ['@octocat'] })
    })

    it.each([
      ['all', 'github-chinese-backup-2026-01-05.json'],
      ['excluded', 'github-chinese-excluded-2026-01-05.json'],
      ['accelerate', 'github-chinese-accelerate-2026-01-05.json'],
      ['new-tab', 'github-chinese-new-tab-2026-01-05.json'],
      ['purify', 'github-chinese-purify-2026-01-05.json'],
      ['enterprise', 'github-chinese-enterprise-2026-01-05.json']
    ] as const)('文件名（%s）：带本地日期', (scope, name) => {
      expect(backupFileName(scope, new Date(2026, 0, 5, 23, 59))).toBe(name)
    })
  })

  describe('合并', () => {
    it('自定义词条：同原文以导入为准，其余保留', () => {
      expect(mergeImportedEntries({ Code: '代码', Wiki: '维基' }, { Code: '源码', Pull: '拉取' })).toEqual({
        Code: '源码',
        Wiki: '维基',
        Pull: '拉取'
      })
    })

    it('设置：路径列表与现有的合并（已有的不重复，新的在后）；其余按文件覆盖', () => {
      const current = { ...DEFAULT_SETTINGS, excludedPaths: ['/settings', '/*/*/wiki'], newTabPaths: ['/*/*/releases'], newTab: false }
      expect(
        mergeImportedSettings(current, { excludedPaths: ['/*/*/wiki', '/notifications'], newTabPaths: ['/*/*/releases'], newTab: true })
      ).toEqual({ excludedPaths: ['/settings', '/*/*/wiki', '/notifications'], newTabPaths: ['/*/*/releases'], newTab: true })
      expect(mergeImportedSettings(current, { accelerate: true })).toEqual({ accelerate: true })
    })

    it('屏蔽规则：已有的（写法不同）不重复添加，新的排在后面', () => {
      expect(mergeImportedRules(['@octocat', 'vuejs/core'], ['@OCTOCAT', 'Sample text', 'Vuejs/Core'])).toEqual([
        '@octocat',
        'vuejs/core',
        'Sample text'
      ])
    })
  })
})

describe('下载次数的备份（令牌）', () => {
  /** 占位令牌（运行时拼出，不是真实令牌） */
  const TOKEN = `ghp_${'x'.repeat(36)}`

  it('解析：令牌去掉首尾空白；格式不符、不是字符串时丢弃', () => {
    expect(
      parseBackup(
        file({
          githubToken: ` ${TOKEN}
`
        })
      )
    ).toEqual({ githubToken: TOKEN })
    expect(parseBackup(file({ githubToken: 'not a token' }))).toEqual({})
    expect(parseBackup(file({ githubToken: 42 }))).toEqual({})
  })

  it('范围：下载次数只取开关与令牌；全部不含令牌；其他范围不含令牌', () => {
    const data: BackupData = { settings: { downloadCount: true, accelerate: true }, githubToken: TOKEN, customEntries: { Code: '代码' } }
    expect(scopeBackup(data, 'downloads')).toEqual({ settings: { downloadCount: true }, githubToken: TOKEN })
    expect(scopeBackup(data, 'all')).toEqual({ settings: { downloadCount: true, accelerate: true }, customEntries: { Code: '代码' } })
    expect(scopeBackup(data, 'accelerate')).toEqual({ settings: { accelerate: true } })
    expect(scopeBackup({ githubToken: TOKEN }, 'enterprise')).toEqual({})
  })

  it('只有令牌也可导入；导出的设置项与文件名', () => {
    expect(isEmptyBackup({ githubToken: TOKEN })).toBe(false)
    expect(settingsOfScope({ ...DEFAULT_SETTINGS, downloadCount: true }, 'downloads')).toEqual({ downloadCount: true })
    expect(backupFileName('downloads', new Date(2026, 10, 7))).toBe('github-chinese-downloads-2026-11-07.json')
  })
})
