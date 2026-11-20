import { onScopeDispose, readonly, ref, type Ref } from 'vue'
import { browser } from 'wxt/browser'
import { createToastSource } from '../../components/toast'
import { isPaymentFormGranted, PAYMENT_FORM_ORIGINS } from '../../shared/payment-form'

export interface UsePaymentForm {
  /** 已授予托管页的主机权限（含覆盖它的通配授权） */
  readonly enabled: Readonly<Ref<boolean>>
  /** 已读到授权状态 */
  readonly ready: Readonly<Ref<boolean>>
  /** 开启时申请、关闭时移除托管页的主机权限（在点击中调用） */
  toggle(on: boolean): Promise<void>
}

/**
 * 汉化付款表单：以 www.zuora.com 的主机权限为准（见 shared/payment-form）。开启时申请，关闭时移除；
 * 在别处授权、撤销（浏览器的扩展管理）时随之刷新。授权后的注册、注入由后台处理（见 background.ts）。
 * 须在组件 setup 内调用
 */
export function usePaymentForm(): UsePaymentForm {
  const enabled = ref(false)
  const ready = ref(false)
  const toast = createToastSource()

  async function refresh(): Promise<void> {
    enabled.value = await isPaymentFormGranted()
    ready.value = true
  }

  /** permissions.request 须在用户手势内调用：位于首个 await 之前，点击事件中同步执行 */
  async function toggle(on: boolean): Promise<void> {
    const origins = [...PAYMENT_FORM_ORIGINS]
    try {
      if (on) {
        if (await browser.permissions.request({ origins })) toast.clear()
        else toast.show('danger', 'authorizeFailed')
      } else {
        await browser.permissions.remove({ origins })
      }
    } catch {
      if (on) toast.show('danger', 'authorizeFailed')
    } finally {
      await refresh()
    }
  }

  const onChange = (): void => void refresh()
  const events = [browser.permissions?.onAdded, browser.permissions?.onRemoved]
  for (const event of events) event?.addListener(onChange)
  onScopeDispose(() => {
    for (const event of events) event?.removeListener(onChange)
  })
  void refresh()

  return { enabled: readonly(enabled), ready: readonly(ready), toggle }
}
