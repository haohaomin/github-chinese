import {
  fromReleaseCountsResponse,
  isAcknowledged,
  isBackgroundMessage,
  isContentMessage,
  isContentStatus,
  isFetchedImage,
  isProbedSources,
  toReleaseCountsResponse
} from '../../../src/shared/messages'

const STATUS = {
  active: true,
  excluded: false,
  pages: ['common', 'repository'],
  translatedCount: 12
}

describe('isContentMessage', () => {
  it.each(['gcn:get-status', 'gcn:custom-entries-changed', 'gcn:search-rules-changed'])('%s 合法', type => {
    expect(isContentMessage({ type })).toBe(true)
  })

  it.each([
    null,
    undefined,
    'gcn:get-status',
    {},
    { type: 1 },
    { type: 'gcn:other' },
    { type: 'gcn:get-untranslated' },
    { type: 'gcn:flush-untranslated' },
    { type: 'gcn:untranslated-cleared', epoch: 1 },
    { type: 'gcn:clear-untranslated' }
  ])('%j 非法', value => {
    expect(isContentMessage(value)).toBe(false)
  })
})

describe('isContentStatus', () => {
  it('完整状态合法', () => {
    expect(isContentStatus(STATUS)).toBe(true)
  })

  it.each([
    ['null', null],
    ['数组', [STATUS]],
    ['active 非布尔', { ...STATUS, active: 'yes' }],
    ['excluded 缺失', { ...STATUS, excluded: undefined }],
    ['pages 非数组', { ...STATUS, pages: 'common' }],
    ['pages 含非字符串', { ...STATUS, pages: ['common', 1] }],
    ['计数为负', { ...STATUS, translatedCount: -1 }],
    ['计数非整数', { ...STATUS, translatedCount: 1.5 }],
    ['计数为字符串', { ...STATUS, translatedCount: '3' }]
  ])('%s → 非法', (_name, value) => {
    expect(isContentStatus(value)).toBe(false)
  })
})

describe('isBackgroundMessage', () => {
  it.each(['gcn:custom-entries-saved', 'gcn:search-rules-saved'])('%s（设置页已保存）合法', type => {
    expect(isBackgroundMessage({ type })).toBe(true)
  })

  it('注入词典脚本：只认已知语言', () => {
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: 'zh-CN' })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: 'zh-TW' })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: 'en' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale', locale: '../../popup.js' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:inject-locale' })).toBe(false)
  })

  it.each([
    ['null', null],
    ['数组', [{ type: 'gcn:custom-entries-saved' }]],
    ['未知类型', { type: 'gcn:get-status' }],
    ['发给内容脚本的类型', { type: 'gcn:search-rules-changed' }],
    ['旧版未翻译上报', { type: 'gcn:report-untranslated', items: [['Open issues', 'issues', 1, 2, 1]] }],
    ['旧版未翻译清空', { type: 'gcn:clear-untranslated' }]
  ])('%s → 非法', (_name, value) => {
    expect(isBackgroundMessage(value)).toBe(false)
  })
})

describe('加速源探测', () => {
  it('请求：只有类型', () => {
    expect(isBackgroundMessage({ type: 'gcn:probe-sources' })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:resolve-download', url: 'https://github.com/' })).toBe(false)
  })

  it('应答：ok 为 true，health 为 标识 → 非负耗时或 null', () => {
    expect(isProbedSources({ ok: true, health: {} })).toBe(true)
    expect(isProbedSources({ ok: true, health: { ghfast: 120, 'wget-la': null, custom: 0 } })).toBe(true)
    expect(isProbedSources({ ok: true, health: { ghfast: -1 } })).toBe(false)
    expect(isProbedSources({ ok: true, health: { ghfast: Number.POSITIVE_INFINITY } })).toBe(false)
    expect(isProbedSources({ ok: true, health: { ghfast: '120' } })).toBe(false)
    expect(isProbedSources({ ok: true, health: [] })).toBe(false)
    expect(isProbedSources({ ok: false, health: {} })).toBe(false)
    expect(isProbedSources({ ok: true })).toBe(false)
    expect(isProbedSources(undefined)).toBe(false)
  })

  it('应答：条目过多时不接受', () => {
    const health = Object.fromEntries(Array.from({ length: 101 }, (_, index) => [`source-${index}`, 1]))
    expect(isProbedSources({ ok: true, health })).toBe(false)
  })
})

describe('图片取回', () => {
  const AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4'

  it('请求：地址为字符串，不超过上限', () => {
    expect(isBackgroundMessage({ type: 'gcn:fetch-image', url: AVATAR })).toBe(true)
    expect(isBackgroundMessage({ type: 'gcn:fetch-image' })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:fetch-image', url: `${AVATAR}&${'a'.repeat(5000)}` })).toBe(false)
  })

  it('应答：ok 为 true，地址为 base64 的图片 data: 地址', () => {
    expect(isFetchedImage({ ok: true, url: 'data:image/png;base64,iVBORw==' })).toBe(true)
    expect(isFetchedImage({ ok: true, url: 'data:image/svg+xml;base64,PHN2Zz4=' })).toBe(true)
    expect(isFetchedImage({ ok: true, url: 'data:text/html;base64,PGI+' })).toBe(false)
    expect(isFetchedImage({ ok: true, url: AVATAR })).toBe(false)
    expect(isFetchedImage({ ok: false, url: 'data:image/png;base64,iVBORw==' })).toBe(false)
    expect(isFetchedImage(undefined)).toBe(false)
  })
})

describe('isAcknowledged', () => {
  it('只有 ok 为 true 才算确认', () => {
    expect(isAcknowledged({ ok: true })).toBe(true)
    expect(isAcknowledged({ ok: false })).toBe(false)
    expect(isAcknowledged({ ok: 'true' })).toBe(false)
    expect(isAcknowledged(undefined)).toBe(false)
    expect(isAcknowledged(true)).toBe(false)
  })
})

describe('下载次数', () => {
  const RELEASE = { type: 'gcn:release-counts', owner: 'vuejs', repo: 'core', tag: 'v3.5.0' }

  it('请求：所有者、存储库为合法名称，标签非空且不超过上限', () => {
    expect(isBackgroundMessage(RELEASE)).toBe(true)
    expect(isBackgroundMessage({ ...RELEASE, tag: 'release/1.0 中文' })).toBe(true)
    expect(isBackgroundMessage({ ...RELEASE, owner: '../octocat' })).toBe(false)
    expect(isBackgroundMessage({ ...RELEASE, repo: 'a'.repeat(101) })).toBe(false)
    expect(isBackgroundMessage({ ...RELEASE, repo: 1 })).toBe(false)
    expect(isBackgroundMessage({ ...RELEASE, tag: '' })).toBe(false)
    expect(isBackgroundMessage({ ...RELEASE, tag: 'a'.repeat(256) })).toBe(false)
    expect(isBackgroundMessage({ type: 'gcn:release-counts', owner: 'vuejs', repo: 'core' })).toBe(false)
  })

  it('应答与结果互转', () => {
    const counts = new Map([['vue.global.js', 3]])
    for (const result of [
      { kind: 'ok', counts },
      { kind: 'ok', counts, limitedUntil: 1_800_000_600_000 },
      { kind: 'limited', until: 1_800_000_600_000 },
      { kind: 'failed' }
    ] as const) {
      expect(fromReleaseCountsResponse(structuredClone(toReleaseCountsResponse(result)))).toEqual(result)
    }
    expect(toReleaseCountsResponse({ kind: 'ok', counts })).toEqual({ ok: true, counts: [['vue.global.js', 3]] })
    expect(toReleaseCountsResponse({ kind: 'limited', until: 1 })).toEqual({ ok: false, limitedUntil: 1 })
  })

  it.each([
    ['不是对象', undefined],
    ['ok 为 false', { ok: false }],
    ['重置时间无效', { ok: false, limitedUntil: -1 }],
    ['counts 不是数组', { ok: true, counts: {} }],
    ['次数无效', { ok: true, counts: [['a.zip', -1]] }],
    ['文件名为空', { ok: true, counts: [['', 1]] }],
    ['条目格式不符', { ok: true, counts: [['a.zip', 1, 2]] }],
    ['条目过多', { ok: true, counts: Array.from({ length: 1001 }, (_, index) => [`${index}.zip`, 1]) }]
  ] as const)('应答格式不符（%s）：失败', (_name, value) => {
    expect(fromReleaseCountsResponse(value)).toEqual({ kind: 'failed' })
  })
})
