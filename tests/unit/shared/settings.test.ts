import { fakeBrowser } from 'wxt/testing/fake-browser'
import { DEFAULT_AUTO_LOAD_SCOPES } from '../../../src/shared/auto-load'
import {
  DEFAULT_SETTINGS,
  addExcludedPath,
  canExcludePath,
  customEntriesItem,
  getCustomEntries,
  getSearchBlockRules,
  getSettings,
  isPathExcluded,
  matchesPathPattern,
  normalizeExcludedPath,
  mergeSettings,
  removeExcludedPath,
  sanitizeCustomEntries,
  sanitizeSearchBlockRules,
  searchBlockRulesItem,
  setCustomEntries,
  setSearchBlockRules,
  settingsItem,
  updateSettings,
  watchCustomEntries,
  watchSearchBlockRules,
  watchSettings
} from '../../../src/shared/settings'

beforeEach(() => {
  fakeBrowser.reset()
})

describe('mergeSettings', () => {
  it.each([undefined, null, 'x', 1, true])('非对象 %s → 默认值', input => {
    expect(mergeSettings(input)).toEqual(DEFAULT_SETTINGS)
  })

  it('保留合法字段，补齐缺失字段', () => {
    expect(mergeSettings({ enabled: false, excludedPaths: ['/settings'] })).toEqual({
      ...DEFAULT_SETTINGS,
      enabled: false,
      excludedPaths: ['/settings']
    })
  })

  it('丢弃类型不符的字段', () => {
    expect(
      mergeSettings({
        enabled: 'no',
        translateTime: 0,
        translateTitle: false,
        excludedPaths: ['/a', 1]
      })
    ).toEqual({ ...DEFAULT_SETTINGS, translateTitle: false })
  })

  it('忽略未知字段（含旧版本的 collectUntranslated）', () => {
    const merged = mergeSettings({ enabled: false, collectUntranslated: false, unknown: 1 })
    expect(merged).toEqual({ ...DEFAULT_SETTINGS, enabled: false })
    expect(Object.hasOwn(merged, 'collectUntranslated')).toBe(false)
  })

  it('excludedPaths 不是数组时用默认值', () => {
    expect(mergeSettings({ excludedPaths: '/a' }).excludedPaths).toEqual([])
  })

  it('语言与外观：默认自动；保留合法取值，非法取值用默认值', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({ language: 'auto', uiLanguage: 'auto', theme: 'auto' })
    expect(mergeSettings({ language: 'zh-TW', uiLanguage: 'en', theme: 'dark' })).toEqual({
      ...DEFAULT_SETTINGS,
      language: 'zh-TW',
      uiLanguage: 'en',
      theme: 'dark'
    })
    expect(mergeSettings({ language: 'en', uiLanguage: 'ja', theme: 'neon' })).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings({ language: null, uiLanguage: 1, theme: ['dark'] })).toEqual(DEFAULT_SETTINGS)
  })
})

describe('加速设置', () => {
  it('默认关闭，不替换原链接，没有改动；下载文件夹默认开启，下载次数默认关闭', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      accelerate: false,
      accelerateImages: false,
      failover: false,
      folderDownload: true,
      downloadCount: false,
      categories: [],
      removedCategories: [],
      customSources: [],
      removedSources: [],
      replaceCategory: ''
    })
  })

  it('保留合法字段；丢弃类型不符的字段与不合法的分类、加速源', () => {
    const mirror = { id: 'custom-1', name: 'Mirror', template: 'https://mirror.example/{url}', category: 'category-1' }
    expect(
      mergeSettings({
        accelerate: true,
        accelerateImages: true,
        failover: 'yes',
        folderDownload: false,
        downloadCount: true,
        categories: [{ id: 'category-1', name: 'Team' }, { id: 'category-2' }],
        removedCategories: ['wget-la', 'category-1'],
        customSources: [mirror, { id: 'custom-2', name: 'HTTP', template: 'http://insecure.example/{url}' }],
        removedSources: ['gh-monlor', 3],
        replaceCategory: 'category-1'
      })
    ).toEqual({
      ...DEFAULT_SETTINGS,
      accelerate: true,
      accelerateImages: true,
      folderDownload: false,
      downloadCount: true,
      categories: [{ id: 'category-1', name: 'Team' }],
      removedCategories: ['wget-la'],
      customSources: [mirror],
      removedSources: ['gh-monlor'],
      replaceCategory: 'category-1'
    })
    expect(
      mergeSettings({
        accelerateImages: 'yes',
        folderDownload: 0,
        downloadCount: 'yes',
        categories: 'x',
        removedCategories: {},
        customSources: 'x',
        removedSources: {},
        replaceCategory: 'gone'
      })
    ).toEqual(DEFAULT_SETTINGS)
  })
})

describe('旧版本的加速设置', () => {
  it('首选为自动选择：开启故障转移；其余首选不再使用', () => {
    expect(mergeSettings({ accelerateSource: 'auto' }).failover).toBe(true)
    const merged = mergeSettings({ accelerateSource: 'gh-proxy-hk' })
    expect(merged).toEqual(DEFAULT_SETTINGS)
    expect(Object.hasOwn(merged, 'accelerateSource')).toBe(false)
  })

  it('没有分类的自定义源归入「自定义」；与内置源重复的去掉', () => {
    const copy = { id: 'custom-1', name: 'Mirror', template: 'https://gh-proxy.com' }
    const mirror = { id: 'custom-2', name: 'Mirror 2', template: 'https://mirror.example/{url}' }
    expect(mergeSettings({ customSources: [copy, mirror] }).customSources).toEqual([{ ...mirror, category: 'custom' }])
  })
})

describe('搜索净化', () => {
  it('默认开启；保留布尔值，其余用默认值', () => {
    expect(DEFAULT_SETTINGS.purifySearch).toBe(true)
    expect(mergeSettings({ purifySearch: false }).purifySearch).toBe(false)
    expect(mergeSettings({ purifySearch: 'no' }).purifySearch).toBe(true)
  })

  it('内置规则：默认开启；保留布尔值，其余用默认值', () => {
    expect(DEFAULT_SETTINGS.purifyBuiltin).toBe(true)
    expect(mergeSettings({ purifyBuiltin: false }).purifyBuiltin).toBe(false)
    expect(mergeSettings({ purifyBuiltin: 1 }).purifyBuiltin).toBe(true)
  })

  it.each([undefined, null, 'x', { 0: '@octocat' }])('屏蔽规则不是数组 %s → 没有规则', input => {
    expect(sanitizeSearchBlockRules(input)).toEqual([])
  })

  it('屏蔽规则：过滤非字符串与空行，去掉首尾空白', () => {
    expect(sanitizeSearchBlockRules([' @octocat ', '', '  ', 3, null, 'vuejs/core'])).toEqual(['@octocat', 'vuejs/core'])
  })
})

describe('时间格式', () => {
  it('默认按元素渲染；自定义写法默认为 YYYY-MM-DD HH:mm', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({ timeFormat: 'default', customTimeFormat: 'YYYY-MM-DD HH:mm' })
  })

  it('保留合法值，写法去掉首尾空白；类型不符的用默认值', () => {
    expect(mergeSettings({ timeFormat: 'custom', customTimeFormat: '  YYYY/MM/DD  ' })).toEqual({
      ...DEFAULT_SETTINGS,
      timeFormat: 'custom',
      customTimeFormat: 'YYYY/MM/DD'
    })
    expect(mergeSettings({ timeFormat: 'custom', customTimeFormat: '' }).customTimeFormat).toBe('')
    expect(mergeSettings({ timeFormat: 'relative', customTimeFormat: 42 })).toEqual(DEFAULT_SETTINGS)
  })
})

describe('自动加载、图片预览、新标签页打开', () => {
  it('默认都关闭；自动加载的范围默认全部，新标签页打开的范围默认为站外链接与搜索结果，没有自定义页面', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      autoLoad: false,
      autoLoadScopes: DEFAULT_AUTO_LOAD_SCOPES,
      imagePreview: false,
      newTab: false,
      newTabScopes: ['external', 'search'],
      newTabPaths: []
    })
  })

  it('保留合法字段；范围丢弃未知项、按固定顺序；类型不符的用默认值', () => {
    expect(
      mergeSettings({
        autoLoad: true,
        autoLoadScopes: ['other', 'issues', 'unknown'],
        imagePreview: true,
        newTab: true,
        newTabScopes: ['issues', 'external', 'unknown'],
        newTabPaths: ['/*/*/releases']
      })
    ).toEqual({
      ...DEFAULT_SETTINGS,
      autoLoad: true,
      autoLoadScopes: ['issues', 'other'],
      imagePreview: true,
      newTab: true,
      newTabScopes: ['external', 'issues'],
      newTabPaths: ['/*/*/releases']
    })
    expect(
      mergeSettings({
        autoLoad: 'yes',
        autoLoadScopes: 'issues',
        imagePreview: 1,
        newTab: null,
        newTabScopes: 'search',
        newTabPaths: ['/a', 2]
      })
    ).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings({ newTabScopes: [] }).newTabScopes).toEqual([])
    expect(mergeSettings({ autoLoadScopes: [] }).autoLoadScopes).toEqual([])
  })
})

describe('matchesPathPattern', () => {
  it('* 匹配单段，** 匹配任意多段，含下级路径，不分大小写；不以 / 开头的规则无效', () => {
    expect(matchesPathPattern('/vuejs/core/releases', ['/*/*/releases'])).toBe(true)
    expect(matchesPathPattern('/vuejs/core/releases/tag/v3.5.0', ['/*/*/releases'])).toBe(true)
    expect(matchesPathPattern('/vuejs/core/tags', ['/*/*/releases'])).toBe(false)
    expect(matchesPathPattern('/vuejs/core/wiki/Home', ['/**/wiki'])).toBe(true)
    expect(matchesPathPattern('/VueJS/Core', [' /vuejs/core '])).toBe(true)
    expect(matchesPathPattern('/vuejs/core', ['vuejs/core'])).toBe(false)
    expect(matchesPathPattern('/vuejs/core', [])).toBe(false)
  })
})

describe('sanitizeCustomEntries', () => {
  it.each([undefined, null, 'x', ['a', 'b']])('非对象 %s → 空对象', input => {
    expect(sanitizeCustomEntries(input)).toEqual({})
  })

  it('过滤非字符串值与空键空值', () => {
    expect(sanitizeCustomEntries({ Issues: '议题', ' ': '空', Empty: '  ', Count: 3, Pulls: '拉取请求' })).toEqual({
      Issues: '议题',
      Pulls: '拉取请求'
    })
  })
})

describe('isPathExcluded', () => {
  it.each([
    ['/settings', ['/settings'], true],
    ['/settings/profile', ['/settings'], true],
    ['/settingsx', ['/settings'], false],
    ['/vuejs/core/wiki', ['/*/*/wiki'], true],
    ['/vuejs/core/wiki/Home', ['/*/*/wiki'], true],
    ['/vuejs/wiki', ['/*/*/wiki'], false],
    ['/a/b/c/wiki', ['/**/wiki'], true],
    ['/Settings', ['/settings'], true],
    ['/settings', ['/settings/'], true],
    ['/settings', ['  /settings  '], true],
    ['/settings', ['settings'], false],
    ['/a.b', ['/a.b'], true],
    ['/aXb', ['/a.b'], false],
    ['/anything', [], false]
  ])('%s 对 %j → %s', (pathname, patterns, expected) => {
    expect(isPathExcluded(pathname, patterns)).toBe(expected)
  })
})

describe('normalizeExcludedPath', () => {
  it('去掉首尾空白', () => {
    expect(normalizeExcludedPath(' /settings ')).toBe('/settings')
    expect(normalizeExcludedPath('/*/*/wiki')).toBe('/*/*/wiki')
  })

  it('不以 / 开头：无效', () => {
    for (const value of ['', '  ', 'settings', '*/wiki']) expect(normalizeExcludedPath(value), value).toBeUndefined()
  })
})

describe('排除此页 / 取消排除', () => {
  it('根路径不可排除', () => {
    expect(canExcludePath('/')).toBe(false)
    expect(canExcludePath('')).toBe(false)
    expect(canExcludePath('/vuejs/core')).toBe(true)
  })

  it('加入当前路径，去掉末尾斜杠', () => {
    expect(addExcludedPath(['/settings'], '/vuejs/core/')).toEqual(['/settings', '/vuejs/core'])
  })

  it('已命中或根路径时原样返回', () => {
    const patterns = ['/vuejs']
    expect(addExcludedPath(patterns, '/vuejs/core')).toBe(patterns)
    expect(addExcludedPath(patterns, '/')).toBe(patterns)
  })

  it('移除所有命中当前路径的规则', () => {
    expect(removeExcludedPath(['/vuejs', '/*/*/wiki', '/settings', '/vuejs/core'], '/vuejs/core')).toEqual(['/*/*/wiki', '/settings'])
  })
})

describe('存储读写', () => {
  it('无存储值时返回默认设置', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('updateSettings 合并写入', async () => {
    await settingsItem.setValue({ translateTime: false })
    const next = await updateSettings({ enabled: false })
    expect(next).toEqual({ ...DEFAULT_SETTINGS, enabled: false, translateTime: false })
    expect(await settingsItem.getValue()).toEqual({ ...next, collectUntranslated: false })
  })

  it('updateSettings 传函数：按写入前存储中的最新设置计算', async () => {
    await settingsItem.setValue({ removedSources: ['wget-la'] })
    const next = await updateSettings(current => ({ removedSources: [...current.removedSources, 'ghfast'] }))
    expect(next.removedSources).toEqual(['wget-la', 'ghfast'])
    expect((await getSettings()).removedSources).toEqual(['wget-la', 'ghfast'])
  })

  it.each<[string, Record<string, unknown>]>([
    ['开启', { collectUntranslated: true }],
    ['关闭', { collectUntranslated: false }],
    ['没有该字段', {}]
  ])(
    '旧版本的 collectUntranslated（%s）：读取时忽略；写入时固定为 false（设置会同步，未更新的旧版本读不到时按开启处理）',
    async (_name, legacy) => {
      await fakeBrowser.storage.sync.set({ settings: { enabled: false, ...legacy } })
      expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, enabled: false })
      const next = await updateSettings({ translateTitle: false })
      expect(Object.hasOwn(next, 'collectUntranslated')).toBe(false)
      expect(await settingsItem.getValue()).toEqual({
        ...DEFAULT_SETTINGS,
        enabled: false,
        translateTitle: false,
        collectUntranslated: false
      })
    }
  )

  it('watchSettings 回调合并后的设置', async () => {
    const callback = vi.fn()
    const stop = watchSettings(callback)
    await settingsItem.setValue({ enabled: false, excludedPaths: 'bad' as never })
    expect(callback).toHaveBeenLastCalledWith({ ...DEFAULT_SETTINGS, enabled: false })
    stop()
  })

  it('setCustomEntries 过滤后写入', async () => {
    const saved = await setCustomEntries({ Issues: '议题', Bad: ' ' })
    expect(saved).toEqual({ Issues: '议题' })
    expect(await customEntriesItem.getValue()).toEqual({ Issues: '议题' })
    expect(await getCustomEntries()).toEqual({ Issues: '议题' })
  })

  it('watchCustomEntries 回调过滤后的词条', async () => {
    const callback = vi.fn()
    const stop = watchCustomEntries(callback)
    await customEntriesItem.setValue({ Pulls: '拉取请求', Bad: 1 as never })
    expect(callback).toHaveBeenLastCalledWith({ Pulls: '拉取请求' })
    stop()
  })

  it('屏蔽规则存于 local 区：无存储值时没有规则；setSearchBlockRules 过滤后写入', async () => {
    expect(await getSearchBlockRules()).toEqual([])
    const saved = await setSearchBlockRules(['@octocat', ' '])
    expect(saved).toEqual(['@octocat'])
    expect(await fakeBrowser.storage.local.get('searchBlockRules')).toEqual({ searchBlockRules: ['@octocat'] })
    expect(await getSearchBlockRules()).toEqual(['@octocat'])
  })

  it('watchSearchBlockRules 回调过滤后的规则', async () => {
    const callback = vi.fn()
    const stop = watchSearchBlockRules(callback)
    await searchBlockRulesItem.setValue(['vuejs/core', 1 as never])
    expect(callback).toHaveBeenLastCalledWith(['vuejs/core'])
    stop()
  })
})
