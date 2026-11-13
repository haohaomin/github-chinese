<template>
  <ul class="switches">
    <li>
      <UiSwitch
        :label="t('translation')"
        :checked="settings.translation"
        :disabled="!ready"
        data-test="translation"
        @change="save({ translation: $event })"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useSettingsSave } from './useSettingsSave'

  /** 汉化开关（汉化设置标签页顶部）：关闭时不翻译页面，其他功能照常 */
  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()
</script>
