<template>
  <section v-if="supported" class="section" aria-labelledby="update-title">
    <h2 id="update-title" class="section-title">{{ t('updateSection') }}</h2>
    <ul class="switches">
      <li>
        <UiSwitch
          :label="t('autoCheckUpdate')"
          :checked="settings.updateCheck"
          :disabled="!ready"
          data-test="update-check"
          @change="save({ updateCheck: $event })"
        />
      </li>
      <li class="field-row">
        <label for="update-interval" class="field-label">{{ t('updateInterval') }}</label>
        <UiSelect
          id="update-interval"
          class="field-select"
          :model-value="settings.updateInterval"
          :options="intervalOptions"
          :disabled="!ready || !settings.updateCheck"
          data-test="update-interval"
          @update:model-value="setInterval"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { UiSelectOption } from '../../components/ui/types'
  import UiSelect from '../../components/ui/UiSelect.vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useUpdateCheck } from '../../components/useUpdateCheck'
  import type { MessageKey } from '../../i18n'
  import { isUpdateInterval, UPDATE_INTERVALS, type UpdateInterval } from '../../shared/update-settings'
  import { useSettingsSave } from './useSettingsSave'

  /** 更新：自动检查新版本的开关与频率。只在检查新版本时显示（手动安装的，见 shared/update-check） */
  const INTERVAL_LABELS: Readonly<Record<UpdateInterval, MessageKey>> = {
    daily: 'updateDaily',
    weekly: 'updateWeekly',
    monthly: 'updateMonthly'
  }

  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()
  const { supported } = useUpdateCheck()
  const intervalOptions = computed<readonly UiSelectOption[]>(() =>
    UPDATE_INTERVALS.map(value => ({ value, label: t(INTERVAL_LABELS[value]) }))
  )

  async function setInterval(value: string): Promise<void> {
    if (isUpdateInterval(value)) await save({ updateInterval: value })
  }
</script>
