import { flushPromises, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { effectScope } from 'vue'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { useToasts, type Toast } from '../../../src/components/toast'
import { applyUiPreferences } from '../../../src/components/ui-preferences'
import type { ContentMessage, ContentStatus } from '../../../src/shared/messages'
import { DEFAULT_SETTINGS, settingsItem, type Settings } from '../../../src/shared/settings'

/** 界面语言为简体中文的设置：组件测试按中文文案断言 */
export const ZH_SETTINGS: Settings = { ...DEFAULT_SETTINGS, uiLanguage: 'zh-CN' }

/**
 * 写入中文界面的设置（fakeBrowser 重置后调用）。
 * 界面语言与外观存在模块级状态里，同一文件的用例共用：这里一并重置为中文，各用例不受前一个用例影响
 */
export async function seedChineseUi(): Promise<void> {
  applyUiPreferences(ZH_SETTINGS)
  await settingsItem.setValue(ZH_SETTINGS)
}

/** 页面顶部当前显示的提示（类型、文案键、参数；不含 id），先显示的在前 */
export function shownToasts(): Omit<Toast, 'id'>[] {
  return useToasts().value.map(({ tone, key, params }) => (params ? { tone, key, params } : { tone, key }))
}

export const STATUS: ContentStatus = {
  active: true,
  excluded: false,
  pages: ['common', 'repository', 'code'],
  translatedCount: 120
}

export interface Scoped<T> {
  readonly result: T
  stop(): void
}

/** 在 effectScope 内运行 composable */
export function withScope<T>(factory: () => T): Scoped<T> {
  const scope = effectScope()
  const result = scope.run(factory)
  if (result === undefined) throw new Error('effectScope 未返回结果')
  return { result, stop: () => scope.stop() }
}

/** 等待存储、消息等异步链完成 */
export async function settle(): Promise<void> {
  await flushPromises()
  await flushPromises()
}

/** 设置页的标签：页面的标签与标签页里的子标签（增强设置里的各功能、汉化设置里的词库等），按文字找 */
export function optionsTab(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  const found = wrapper.findAll('[role="tab"]').find(item => item.text() === label)
  if (!found) throw new Error(`未找到标签：${label}`)
  return found
}

/** 设置页标签对应的面板 */
export function optionsPanel(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  return wrapper.get(`#${CSS.escape(optionsTab(wrapper, label).attributes('aria-controls') ?? '')}`) as DOMWrapper<Element>
}

/** 切到设置页的标签：子标签先切到所在的标签页 */
export async function openOptionsTab(wrapper: VueWrapper, label: string): Promise<void> {
  const target = optionsTab(wrapper, label)
  const parent = target.element.closest('[role="tabpanel"]')?.getAttribute('aria-labelledby')
  if (parent) await wrapper.get(`#${CSS.escape(parent)}`).trigger('click')
  await target.trigger('click')
  await settle()
}

/** 删除所选：点表头的删除所选（先聚焦，同键盘操作），在打开的确认框中点删除 */
export async function deleteSelected(scope: DOMWrapper<Element>): Promise<void> {
  const button = scope.get<HTMLButtonElement>('[data-test="delete-selected"]')
  button.element.focus()
  await button.trigger('click')
  await settle()
  const dialog = scope.get<HTMLDialogElement>('[data-test="confirm"]')
  if (!dialog.element.open) throw new Error('确认框未打开')
  await dialog.get('[data-test="confirm-ok"]').trigger('click')
  await settle()
}

/** 新建并聚焦窗口（fakeBrowser 重置后没有当前窗口），返回窗口 ID */
export async function focusWindow(): Promise<number> {
  const created = await fakeBrowser.windows.create({ focused: true })
  if (created?.id === undefined) throw new Error('窗口无 ID')
  return created.id
}

/** 在新的当前窗口中打开并激活标签页，返回标签 ID */
export async function openTab(url: string): Promise<number> {
  const windowId = await focusWindow()
  const tab = await fakeBrowser.tabs.create({ url, active: true, windowId })
  if (tab.id === undefined) throw new Error('标签页无 ID')
  return tab.id
}

export function mockVersion(version = '0.1.0'): void {
  vi.spyOn(fakeBrowser.runtime, 'getManifest').mockReturnValue({ version } as never)
}

export function mockPermission(granted: boolean): ReturnType<typeof vi.fn> {
  const contains = vi.fn(async () => granted)
  vi.spyOn(fakeBrowser.permissions, 'contains').mockImplementation(contains as never)
  return contains
}

export type ContentResponder = (message: ContentMessage) => unknown

/** 模拟内容脚本：按消息返回响应；抛错即消息失败 */
export function mockContent(responder: ContentResponder): ReturnType<typeof vi.fn> {
  const send = vi.fn(async (_tabId: number, message: ContentMessage) => responder(message))
  vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation(send as never)
  return send
}

/** 正常的内容脚本：返回状态 */
export function contentWith(status: ContentStatus = STATUS): ContentResponder {
  return message => (message.type === 'gcn:get-status' ? status : undefined)
}

/** 内容脚本未注入 */
export function contentMissing(): never {
  throw new Error('Could not establish connection. Receiving end does not exist.')
}

/** 内容脚本收到的消息类型，按发送顺序 */
export function messagesOf(send: ReturnType<typeof vi.fn>): string[] {
  return send.mock.calls.map(call => (call[1] as ContentMessage).type)
}
