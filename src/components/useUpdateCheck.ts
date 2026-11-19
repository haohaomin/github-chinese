import { computed, inject, onScopeDispose, provide, shallowRef, watch, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { getExtensionVersion } from '../shared/extension'
import {
  canCheckUpdates,
  checkForUpdate,
  checkLatestVersion,
  isNewerVersion,
  UPDATE_CHECK_DEPS,
  updatePolicy
} from '../shared/update-check'
import { useSettings } from './useSettings'

/** 手动检查的结果：有新版本、已是最新、失败 */
export type UpdateCheckResult =
  { readonly kind: 'update'; readonly version: string } | { readonly kind: 'latest' } | { readonly kind: 'failed' }

export interface UseUpdateCheck {
  /** 当前版本 */
  readonly current: string
  /** 比当前版本新的发行版版本号；没有时为 undefined */
  readonly newVersion: ComputedRef<string | undefined>
  /** 检查新版本（手动安装的才检查，见 shared/update-check）：确定前为 false */
  readonly supported: Readonly<Ref<boolean>>
  /** 正在手动检查 */
  readonly checking: Readonly<Ref<boolean>>
  /** 手动检查：不看缓存与设置 */
  check(): Promise<UpdateCheckResult>
}

const UPDATE_CHECK_KEY: InjectionKey<UseUpdateCheck> = Symbol('update-check')

/**
 * 新版本提示与手动检查。打开时按设置自动检查（见 shared/update-check 的 checkLatestVersion）。
 * Firefox 不检查：AMO 自动更新，发行版的 xpi 未签名，只能临时载入
 */
function createUpdateCheck(): UseUpdateCheck {
  const current = getExtensionVersion()
  const latest = shallowRef<string>()
  const supported = shallowRef(false)
  const checking = shallowRef(false)
  const newVersion = computed(() => (latest.value !== undefined && isNewerVersion(latest.value, current) ? latest.value : undefined))
  // 条件直接写构建期常量（同 isFirefoxBuild）：函数调用不内联，Firefox 构建里会留着检查代码
  if (String(import.meta.env.FIREFOX) === 'true') {
    return { current, newVersion, supported, checking, check: async () => ({ kind: 'failed' }) }
  }

  let active = true
  onScopeDispose(() => {
    active = false
  })
  // 自动检查的设置取页面共用的一份（不另读存储），读完后再看
  const { settings, ready } = useSettings()
  const settingsReady = new Promise<void>(resolve => {
    if (ready.value) {
      resolve()
      return
    }
    const stop = watch(ready, value => {
      if (!value) return
      stop()
      resolve()
    })
  })
  const deps = {
    ...UPDATE_CHECK_DEPS,
    policy: async () => {
      await settingsReady
      return updatePolicy(settings.value)
    }
  }
  void canCheckUpdates(deps).then(value => {
    if (active) supported.value = value
  })
  void checkLatestVersion(version => {
    if (active) latest.value = version
  }, deps)

  async function check(): Promise<UpdateCheckResult> {
    checking.value = true
    try {
      const version = await checkForUpdate()
      if (version === undefined) return { kind: 'failed' }
      if (active) latest.value = version
      return isNewerVersion(version, current) ? { kind: 'update', version } : { kind: 'latest' }
    } finally {
      checking.value = false
    }
  }

  return { current, newVersion, supported, checking, check }
}

/** 根组件里调用：版本号旁的提示与检查按钮共用，一页只检查一次 */
export function provideUpdateCheck(): UseUpdateCheck {
  const state = createUpdateCheck()
  provide(UPDATE_CHECK_KEY, state)
  return state
}

/** 取上层提供的；没有时自建。须在组件 setup 或 effectScope 内调用 */
export function useUpdateCheck(): UseUpdateCheck {
  return inject(UPDATE_CHECK_KEY, null) ?? createUpdateCheck()
}
