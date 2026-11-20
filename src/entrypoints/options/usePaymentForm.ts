import { computed, onScopeDispose, ref, type ComputedRef } from 'vue'
import { browser } from 'wxt/browser'
import { createToastSource } from '../../components/toast'
import { isPaymentFormGranted, PAYMENT_FORM_ORIGINS } from '../../shared/payment-form'
import { useSettingsSave } from './useSettingsSave'

export interface UsePaymentForm {
  /** 生效：设置「汉化付款表单」开启，且有托管页的主机权限 */
  readonly enabled: ComputedRef<boolean>
  /** 已读到设置与权限 */
  readonly ready: ComputedRef<boolean>
  /** 开启：没有权限时先申请（在点击中调用），再保存设置；关闭：只保存设置 */
  toggle(on: boolean): Promise<void>
}

/**
 * 汉化付款表单（见 shared/payment-form）：设置默认开启，托管页的主机权限在安装时授予。
 * 权限被撤销（浏览器的扩展管理）时显示为关闭，开启时重新申请；关闭不移除权限（清单申请的权限移除不了）。
 * 权限在别处授予、撤销时随之刷新。注册、注入由后台处理（见 background.ts）。须在组件 setup 内调用
 */
export function usePaymentForm(): UsePaymentForm {
  const { settings, ready: settingsReady, save } = useSettingsSave()
  const granted = ref(false)
  const grantedReady = ref(false)
  const toast = createToastSource()

  async function refresh(): Promise<void> {
    granted.value = await isPaymentFormGranted()
    grantedReady.value = true
  }

  /** 申请托管页的主机权限；拒绝、出错时提示授权失败。permissions.request 位于首个 await 之前，点击事件中同步执行 */
  async function request(): Promise<boolean> {
    try {
      const ok = await browser.permissions.request({ origins: [...PAYMENT_FORM_ORIGINS] })
      if (ok) toast.clear()
      else toast.show('danger', 'authorizeFailed')
      return ok
    } catch {
      toast.show('danger', 'authorizeFailed')
      return false
    } finally {
      await refresh()
    }
  }

  async function toggle(on: boolean): Promise<void> {
    if (on && !granted.value && !(await request())) return
    await save({ paymentForm: on })
  }

  const onChange = (): void => void refresh()
  const events = [browser.permissions?.onAdded, browser.permissions?.onRemoved]
  for (const event of events) event?.addListener(onChange)
  onScopeDispose(() => {
    for (const event of events) event?.removeListener(onChange)
  })
  void refresh()

  return {
    enabled: computed(() => settings.value.paymentForm && granted.value),
    ready: computed(() => settingsReady.value && grantedReady.value),
    toggle
  }
}
