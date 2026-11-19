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
      <ol class="ranges" aria-labelledby="freshness-range-title" data-test="freshness-ranges">
        <li v-for="(range, index) in config.ranges" :key="index" class="range" data-test="freshness-range">
          <UiInput
            type="number"
            class="range-input"
            mono
            :model-value="String(range.days)"
            :min="String(MIN_FRESH_DAYS)"
            :max="String(MAX_FRESH_DAYS)"
            :aria-label="t('freshnessDays')"
            :aria-describedby="duplicate === index ? 'freshness-range-status' : undefined"
            :disabled="!editable"
            data-test="freshness-days"
            @change="setDays(index, $event)"
          />
          <span class="range-unit">{{ t('freshnessDaysUnit') }}</span>
          <UiButton
            size="sm"
            class="range-remove"
            :disabled="!editable || config.ranges.length <= MIN_FRESHNESS_RANGES"
            :aria-label="`${t('delete')} ${rangeLabel(range.days)}`"
            data-test="freshness-remove"
            @click="remove(index)"
          >
            {{ t('delete') }}
          </UiButton>
        </li>
        <li class="range range-stale" data-test="freshness-range-stale">{{ t('freshnessStale') }}</li>
      </ol>
      <p id="freshness-range-status" class="range-status" role="status" data-test="freshness-range-status">
        {{ duplicate === undefined ? '' : t('freshnessDuplicate') }}
      </p>
      <div>
        <UiButton size="sm" :disabled="!editable || nextRangeDays(config) === undefined" data-test="freshness-add" @click="add">
          {{ t('freshnessAddRange') }}
        </UiButton>
      </div>
    </section>

    <section class="section" aria-labelledby="freshness-text-title">
      <h2 id="freshness-text-title" class="section-title">{{ t('freshnessColors') }}</h2>
      <FreshnessColorGroups
        kind="text"
        title-id="freshness-text-title"
        :segments="segments"
        :background="settings.freshnessBackground"
        :disabled="!editable"
        @save="setColor"
      />
    </section>

    <section class="section" aria-labelledby="freshness-background-title">
      <h2 id="freshness-background-title" class="section-title">{{ t('freshnessBackground') }}</h2>
      <ul class="switches">
        <li>
          <UiSwitch
            :label="t('enable')"
            :checked="settings.freshnessBackground"
            :disabled="!editable"
            data-test="freshness-background"
            @change="save({ freshnessBackground: $event })"
          />
        </li>
      </ul>
      <FreshnessColorGroups
        v-if="settings.freshnessBackground"
        kind="background"
        title-id="freshness-background-title"
        :segments="segments"
        background
        :disabled="!editable"
        @save="setColor"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import {
    canSetRangeDays,
    MAX_FRESH_DAYS,
    MIN_FRESH_DAYS,
    MIN_FRESHNESS_RANGES,
    nextRangeDays,
    toneOf,
    withAddedRange,
    withFreshnessColor,
    withoutRange,
    withRangeDays,
    type FreshnessPaintKind,
    type FreshnessScheme
  } from '../../shared/freshness'
  import FreshnessColorGroups, { type FreshnessSegment } from './FreshnessColorGroups.vue'
  import { useSettingsSave } from './useSettingsSave'

  /**
   * 更新时间着色：开关；时段（「N 天内」可增删、改天数，其后为「更早」）；各时段的文字颜色、背景色（浅色、深色主题各一组）。
   * 天数与其他时段重复时不保存、恢复原值并提示；改后按天数重新排序
   */
  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()

  const config = computed(() => settings.value.freshnessRanges)
  const editable = computed(() => ready.value && settings.value.freshness)
  /** 天数与其他时段重复的时段（序号） */
  const duplicate = ref<number>()

  const rangeLabel = (days: number): string => t('freshnessWithin', { days })

  const segments = computed((): readonly FreshnessSegment[] => [
    ...config.value.ranges.map((range, index): FreshnessSegment => ({
      key: index,
      target: range.days,
      label: rangeLabel(range.days),
      tone: toneOf(index),
      paint: range
    })),
    { key: 'stale', target: 'stale', label: t('freshnessStale'), tone: toneOf('stale'), paint: config.value.stale }
  ])

  async function setColor(target: number | 'stale', kind: FreshnessPaintKind, scheme: FreshnessScheme, color: string): Promise<void> {
    await save(current => ({ freshnessRanges: withFreshnessColor(current.freshnessRanges, target, kind, scheme, color) }))
  }

  async function setDays(index: number, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const range = config.value.ranges[index]
    const value = Math.round(Number(input.value))
    if (!range) return
    // 清空、写法不对：恢复原值
    if (input.value.trim() === '' || !Number.isFinite(value)) {
      duplicate.value = undefined
      input.value = String(range.days)
      return
    }
    const days = Math.min(MAX_FRESH_DAYS, Math.max(MIN_FRESH_DAYS, value))
    // 与其他时段重复：恢复原值，提示
    if (!canSetRangeDays(config.value, index, days)) {
      duplicate.value = index
      input.value = String(range.days)
      return
    }
    duplicate.value = undefined
    input.value = String(days)
    if (days !== range.days) await save(current => ({ freshnessRanges: withRangeDays(current.freshnessRanges, index, days) }))
  }

  async function add(): Promise<void> {
    duplicate.value = undefined
    await save(current => ({ freshnessRanges: withAddedRange(current.freshnessRanges) }))
  }

  async function remove(index: number): Promise<void> {
    duplicate.value = undefined
    await save(current => ({ freshnessRanges: withoutRange(current.freshnessRanges, index) }))
  }
</script>

<style scoped>
  /* 时段：天数、单位、删除一行；末行为「更早」 */
  .ranges {
    display: grid;
    margin: 0;
    padding: 0 16px;
    list-style: none;
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius-lg);
  }

  .range {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 6px 0;
  }

  .range + .range {
    border-top: 1px solid var(--gcn-border-muted);
  }

  .range-input {
    width: 88px;
  }

  .range-unit {
    font-size: 14px;
    color: var(--gcn-fg-muted);
  }

  .range-remove {
    margin-left: auto;
  }

  .range-stale {
    font-size: 14px;
    color: var(--gcn-fg-muted);
  }

  .range-status {
    margin: 0;
    font-size: 12px;
    color: var(--gcn-danger-fg);
  }

  .range-status:empty {
    display: none;
  }
</style>
