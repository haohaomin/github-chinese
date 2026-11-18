<template>
  <div class="section">
    <ul class="switches">
      <li>
        <UiSwitch
          :label="t('freshness')"
          :checked="settings.freshness"
          :disabled="!ready"
          data-test="freshness"
          @change="save({ freshness: $event })"
        />
      </li>
    </ul>

    <section class="section" aria-labelledby="freshness-range-title">
      <h2 id="freshness-range-title" class="section-title">{{ t('freshnessRange') }}</h2>
      <div class="range-fields">
        <label class="range-field">
          <span class="range-field-label">{{ t('freshnessFreshLabel') }}</span>
          <UiInput
            type="number"
            class="range-field-input"
            mono
            :model-value="String(settings.freshnessDays.fresh)"
            :min="String(MIN_FRESH_DAYS)"
            :max="String(settings.freshnessDays.recent - 1)"
            :disabled="!ready || !settings.freshness"
            data-test="freshness-fresh-days"
            @change="setDays('fresh', $event)"
          />
          <span class="range-field-unit">{{ t('freshnessUnit') }}</span>
        </label>
        <label class="range-field">
          <span class="range-field-label">{{ t('freshnessRecentLabel') }}</span>
          <UiInput
            type="number"
            class="range-field-input"
            mono
            :model-value="String(settings.freshnessDays.recent)"
            :min="String(settings.freshnessDays.fresh + 1)"
            :max="String(MAX_FRESH_DAYS)"
            :disabled="!ready || !settings.freshness"
            data-test="freshness-recent-days"
            @change="setDays('recent', $event)"
          />
          <span class="range-field-unit">{{ t('freshnessUnit') }}</span>
        </label>
      </div>
    </section>

    <section class="section" aria-labelledby="freshness-colors-title">
      <h2 id="freshness-colors-title" class="section-title">{{ t('freshnessColors') }}</h2>
      <div class="schemes">
        <div
          v-for="scheme in SCHEMES"
          :key="scheme.value"
          role="group"
          class="scheme"
          :data-gcn-scheme="scheme.value"
          :aria-labelledby="`freshness-${scheme.value}-title`"
          :data-test="`freshness-${scheme.value}`"
        >
          <h3 :id="`freshness-${scheme.value}-title`" class="scheme-title">{{ t(scheme.label) }}</h3>
          <FreshnessColorField
            v-for="level in levels"
            :key="level.value"
            :label="level.label"
            :color="settings.freshnessColors[level.value][scheme.value]"
            :fallback="FRESHNESS_PREVIEW_COLORS[level.value][scheme.value]"
            :group-label-id="`freshness-${scheme.value}-title`"
            :disabled="!ready || !settings.freshness"
            :data-test="`freshness-${scheme.value}-${level.value}`"
            @save="setColor(level.value, scheme.value, $event)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import {
    FRESH_DAYS,
    FRESHNESS_PREVIEW_COLORS,
    MAX_FRESH_DAYS,
    MIN_FRESH_DAYS,
    withFreshnessColor,
    withFreshnessDays,
    type FreshnessLevel,
    type FreshnessScheme
  } from '../../shared/freshness'
  import FreshnessColorField from './FreshnessColorField.vue'
  import { useSettingsSave } from './useSettingsSave'

  const SCHEMES: readonly { readonly value: FreshnessScheme; readonly label: MessageKey }[] = [
    { value: 'light', label: 'themeLight' },
    { value: 'dark', label: 'themeDark' }
  ]

  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()

  const levels = computed((): readonly { readonly value: FreshnessLevel; readonly label: string }[] => [
    { value: 'fresh', label: t('freshnessFresh', { days: settings.value.freshnessDays.fresh }) },
    { value: 'recent', label: t('freshnessRecent', { days: settings.value.freshnessDays.recent }) },
    { value: 'stale', label: t('freshnessStale') }
  ])

  async function setColor(level: FreshnessLevel, scheme: FreshnessScheme, color: string): Promise<void> {
    await save(current => ({ freshnessColors: withFreshnessColor(current.freshnessColors, level, scheme, color) }))
  }

  async function setDays(key: 'fresh' | 'recent', event: Event): Promise<void> {
    const value = Number((event.target as HTMLInputElement).value)
    if (!Number.isFinite(value)) return
    await save(current => ({ freshnessDays: withFreshnessDays(current.freshnessDays, key, value) }))
  }
</script>

<style scoped>
  .schemes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }

  .scheme {
    display: grid;
    gap: 8px;
    padding: 12px 16px 16px;
    color: var(--gcn-fg);
    background: var(--gcn-bg);
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius-lg);
  }

  .scheme-title {
    font-size: 14px;
    font-weight: 600;
  }

  /* 时段天数：标签、输入框、单位一行 */
  .range-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
  }

  .range-field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .range-field-label {
    font-size: 14px;
    color: var(--gcn-fg);
  }

  .range-field-input {
    width: 72px;
  }

  .range-field-unit {
    font-size: 14px;
    color: var(--gcn-fg-muted);
  }
</style>
