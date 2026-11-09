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
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import {
    FRESH_DAYS,
    FRESHNESS_PREVIEW_COLORS,
    withFreshnessColor,
    type FreshnessLevel,
    type FreshnessScheme
  } from '../../shared/freshness'
  import FreshnessColorField from './FreshnessColorField.vue'
  import { useSettingsSave } from './useSettingsSave'

  /** 更新时间着色：开关；各时段的颜色按 GitHub 的浅色、深色主题分两组，每组按该主题的配色显示，名称用所选颜色 */
  const SCHEMES: readonly { readonly value: FreshnessScheme; readonly label: MessageKey }[] = [
    { value: 'light', label: 'themeLight' },
    { value: 'dark', label: 'themeDark' }
  ]

  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()

  const levels = computed((): readonly { readonly value: FreshnessLevel; readonly label: string }[] => [
    { value: 'fresh', label: t('freshnessFresh', { days: FRESH_DAYS }) },
    { value: 'recent', label: t('freshnessRecent') },
    { value: 'stale', label: t('freshnessStale') }
  ])

  async function setColor(level: FreshnessLevel, scheme: FreshnessScheme, color: string): Promise<void> {
    // 按写入前的最新设置计算：连续改几项时不丢失
    await save(current => ({ freshnessColors: withFreshnessColor(current.freshnessColors, level, scheme, color) }))
  }
</script>

<style scoped>
  /* 浅色、深色两组并排，窄时上下排 */
  .schemes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }

  /* 每组按 GitHub 该主题的配色显示（data-gcn-scheme：组内重新取浅色或深色的颜色变量，见 theme.css） */
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
</style>
