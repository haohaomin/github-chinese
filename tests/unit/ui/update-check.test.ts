import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { clearToasts } from '../../../src/components/toast'
import { REPOSITORY_URL } from '../../../src/shared/extension'
import { settingsItem } from '../../../src/shared/settings'
import { RELEASES_API_URL } from '../../../src/shared/release-notes'
import { LATEST_RELEASE_URL, updateCheckItem } from '../../../src/shared/update-check'
import '../../../src/entrypoints/options/options.css'
import { mockPermission, mockVersion, seedChineseUi, settle, ZH_SETTINGS } from './helpers'
import { importSfc, required } from './sfc'

const Popup = await importSfc(() => import('../../../src/entrypoints/popup/App.vue'))
const Options = await importSfc(() => import('../../../src/entrypoints/options/App.vue'))

const TAG_URL = `${REPOSITORY_URL}/releases/tag/v1.3.0`

enableAutoUnmount(afterEach)

const PAGES = [
  ['弹出页', () => Popup],
  ['设置页', () => Options]
] as const

async function render(page: (typeof PAGES)[number][1]): Promise<VueWrapper> {
  const wrapper = mount(required(page()), { attachTo: document.body })
  await settle()
  return wrapper
}

/** 最新发行版跳转到的地址 */
function mockLatest(url = TAG_URL): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, url } as Response)
}

/** API 的发行版列表：版本号与说明 */
function apiRelease(version: string, body: string): Record<string, unknown> {
  return { html_url: `${REPOSITORY_URL}/releases/tag/v${version}`, body, draft: false, prerelease: false }
}

/** 最新发行版（HEAD）与发行版列表（API）；releases 为 undefined 时 API 失败 */
function mockRelease(latest: string, releases?: readonly unknown[]): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url === LATEST_RELEASE_URL) return { ok: true, url: `${REPOSITORY_URL}/releases/tag/v${latest}` } as Response
    if (url === RELEASES_API_URL && releases) return { ok: true, json: async () => releases } as Response
    return { ok: false, url } as Response
  })
}

/** 页面顶部的提示文字 */
function toastTexts(wrapper: VueWrapper): string[] {
  return wrapper
    .get('[aria-live="polite"]')
    .findAll('.ui-toast')
    .map(toast => toast.text())
}

/** 点检查更新并等结果；有新版本时等对话框（按需加载）与说明 */
async function checkUpdate(wrapper: VueWrapper): Promise<void> {
  const toasts = toastTexts(wrapper).length
  await wrapper.get('[data-test="check-update"]').trigger('click')
  for (let round = 0; round < 200; round++) {
    await settle()
    const dialog = wrapper.find('[data-test="update-dialog"]')
    // 有新版本：对话框（按需加载，要真实时间）出现且说明加载完；其余：出现提示
    const done = dialog.exists() ? !dialog.find('[role="status"]').exists() : toastTexts(wrapper).length > toasts
    if (done) return
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error('检查更新没有结果')
}

describe.skipIf(!Popup || !Options)('新版本提示', () => {
  beforeEach(async () => {
    fakeBrowser.reset()
    await seedChineseUi()
    mockVersion('1.2.0')
    mockPermission(true)
  })

  afterEach(() => {
    delete document.documentElement.dataset.theme
    clearToasts()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe.each(PAGES)('%s', (_name, page) => {
    it('从发行版安装、有新版本：版本号后显示「新版本」，新标签页打开该版本的发行版页', async () => {
      const fetch = mockLatest()
      const wrapper = await render(page)
      const badge = wrapper.get('[data-test="update"]')
      expect(badge.text()).toBe('新版本')
      expect(badge.attributes('href')).toBe(TAG_URL)
      expect(badge.attributes('target')).toBe('_blank')
      expect(badge.attributes('rel')).toBe('noreferrer')
      expect(badge.attributes('aria-label')).toBe('新版本 v1.3.0')
      expect(badge.attributes('title')).toBe('新版本 v1.3.0')
      expect(wrapper.get('[data-test="version"]').element.nextElementSibling).toBe(badge.element)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch.mock.calls[0]![0]).toBe(LATEST_RELEASE_URL)
    })

    it('已是最新：不显示', async () => {
      mockLatest(`${REPOSITORY_URL}/releases/tag/v1.2.0`)
      const wrapper = await render(page)
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('商店安装（manifest 带 update_url）：不请求、不显示', async () => {
      vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
        version: '1.2.0',
        update_url: 'https://clients2.google.com/service/update2/crx'
      } as never)
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('Firefox 构建：不请求、不显示', async () => {
      vi.stubEnv('FIREFOX', 'true')
      await updateCheckItem.setValue({ latest: '1.3.0', checkedAt: Date.now() })
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('24 小时内检查过：按缓存显示，不请求', async () => {
      await updateCheckItem.setValue({ latest: '1.3.0', checkedAt: Date.now() })
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.get('[data-test="update"]').attributes('href')).toBe(TAG_URL)
    })

    it('请求失败：不显示', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
      const wrapper = await render(page)
      expect(wrapper.find('[data-test="update"]').exists()).toBe(false)
    })

    it('英文界面', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, uiLanguage: 'en' })
      mockLatest()
      const wrapper = await render(page)
      const badge = wrapper.get('[data-test="update"]')
      expect(badge.text()).toBe('Update')
      expect(badge.attributes('aria-label')).toBe('Update v1.3.0')
      expect(wrapper.get('[data-test="check-update"]').text()).toBe('Check for updates')
    })

    it('关闭自动检查：打开时不请求，按缓存显示', async () => {
      await settingsItem.setValue({ ...ZH_SETTINGS, updateCheck: false })
      await updateCheckItem.setValue({ latest: '1.3.0', checkedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 })
      const fetch = mockLatest()
      const wrapper = await render(page)
      expect(fetch).not.toHaveBeenCalled()
      expect(wrapper.get('[data-test="update"]').attributes('href')).toBe(TAG_URL)
    })

    it('检查更新：有新版本时打开说明，当前版本之后的各版新的在前，最新的展开、其余收起；「更新」新标签页打开最新版本', async () => {
      const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
      const fetch = mockRelease('1.3.0', [
        apiRelease('1.3.0', '# GitHub 中文化 1.3.0 版本更新说明\n\n### 新增功能\n\n- **检查更新**：手动检查'),
        apiRelease('1.2.1', '修复'),
        apiRelease('1.2.0', '当前版本')
      ])
      const wrapper = await render(page)
      fetch.mockClear()
      await checkUpdate(wrapper)
      expect(fetch.mock.calls.map(([url]: [unknown]) => String(url))).toEqual([LATEST_RELEASE_URL, RELEASES_API_URL])
      expect(showModal).toHaveBeenCalledOnce()
      const dialog = wrapper.get('[data-test="update-dialog"]')
      expect(dialog.get('h2').text()).toBe('新版本 v1.3.0')
      const notes = dialog.findAll<HTMLDetailsElement>('[data-test="update-note"]')
      expect(notes.map(item => item.get('summary').text())).toEqual(['v1.3.0', 'v1.2.1'])
      expect(notes.map(item => item.element.open)).toEqual([true, false])
      expect(notes[0]!.find('h1').exists()).toBe(false)
      expect(notes[0]!.get('h3').text()).toBe('新增功能')
      expect(notes[0]!.get('li strong').text()).toBe('检查更新')
      const confirm = dialog.get('[data-test="update-confirm"]')
      expect(confirm.text()).toBe('更新')
      expect(confirm.attributes('href')).toBe(TAG_URL)
      expect(confirm.attributes('target')).toBe('_blank')
      await confirm.trigger('click')
      await settle()
      expect((dialog.element as HTMLDialogElement).open).toBe(false)
      // 检查结果写入缓存，版本号旁随之提示
      expect(wrapper.get('[data-test="update"]').attributes('href')).toBe(TAG_URL)
    })

    it('检查更新：说明取不到时显示「加载失败」，仍可更新', async () => {
      mockRelease('1.3.0')
      const wrapper = await render(page)
      await checkUpdate(wrapper)
      const dialog = wrapper.get('[data-test="update-dialog"]')
      expect(dialog.get('[data-test="update-notes-status"]').text()).toBe('加载失败')
      expect(dialog.get('[data-test="update-confirm"]').attributes('href')).toBe(TAG_URL)
    })

    it('检查更新：已是最新、失败时提示，不打开对话框', async () => {
      mockRelease('1.2.0')
      const wrapper = await render(page)
      await checkUpdate(wrapper)
      expect(toastTexts(wrapper)).toEqual(['已是最新版本'])
      expect(wrapper.find('[data-test="update-dialog"]').exists()).toBe(false)
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
      await checkUpdate(wrapper)
      expect(toastTexts(wrapper)).toEqual(['已是最新版本', '检查失败'])
    })

    it('商店安装：没有检查更新', async () => {
      vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
        version: '1.2.0',
        update_url: 'https://clients2.google.com/service/update2/crx'
      } as never)
      const wrapper = await render(page)
      expect(wrapper.find('[data-test="check-update"]').exists()).toBe(false)
    })
  })

  describe('设置页的更新设置', () => {
    it('自动检查更新、检查频率：改动即时保存；关闭自动检查时频率不可选', async () => {
      mockLatest()
      const wrapper = await render(() => Options)
      const toggle = wrapper.get('[data-test="update-check"] [role="switch"]')
      expect(toggle.attributes('aria-checked')).toBe('true')
      const interval = wrapper.get('[data-test="update-interval"]')
      expect(interval.text()).toContain('每天')
      await interval.trigger('click')
      await settle()
      const weekly = wrapper.findAll('[role="option"]').find(option => option.text() === '每周')
      await weekly!.trigger('click')
      await settle()
      expect((await settingsItem.getValue())?.updateInterval).toBe('weekly')
      await toggle.trigger('click')
      await settle()
      expect((await settingsItem.getValue())?.updateCheck).toBe(false)
      expect(wrapper.get('[data-test="update-interval"]').attributes('disabled')).toBeDefined()
    })

    it('商店安装：不显示', async () => {
      vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({
        version: '1.2.0',
        update_url: 'https://clients2.google.com/service/update2/crx'
      } as never)
      const wrapper = await render(() => Options)
      expect(wrapper.find('[data-test="update-check"]').exists()).toBe(false)
    })
  })
})
