<template>
  <UiButton v-if="supported" size="sm" :disabled="checking" data-test="check-update" @click="onCheck">
    {{ checking ? t('updateChecking') : t('checkUpdate') }}
  </UiButton>
  <UpdateDialog v-if="found" v-model:open="dialogOpen" :current="current" :latest="found" />
</template>

<script setup lang="ts">
  import { defineAsyncComponent, ref } from 'vue'
  import { showToast } from './toast'
  import UiButton from './ui/UiButton.vue'
  import { useI18n } from './ui-preferences'
  import { useUpdateCheck } from './useUpdateCheck'

  /**
   * 检查更新（弹出页底部、设置页顶部）：有新版本时打开说明对话框，已是最新、失败时提示。
   * 对话框按需加载：用不到时不打包进页面的入口
   */
  const UpdateDialog = defineAsyncComponent(() => import('./UpdateDialog.vue'))

  const { t } = useI18n()
  const { current, supported, checking, check } = useUpdateCheck()
  /** 检查到的新版本 */
  const found = ref<string>()
  const dialogOpen = ref(false)

  async function onCheck(): Promise<void> {
    const result = await check()
    if (result.kind === 'update') {
      found.value = result.version
      dialogOpen.value = true
    } else if (result.kind === 'latest') {
      showToast('success', 'upToDate')
    } else {
      showToast('danger', 'updateCheckFailed')
    }
  }
</script>
