<template>
  <div class="schemes">
    <div
      v-for="scheme in SCHEMES"
      :key="scheme.value"
      role="group"
      class="scheme"
      :data-gcn-scheme="scheme.value"
      :aria-labelledby="`${titleId} ${groupId(scheme.value)}`"
      :data-test="`freshness-${kind}-${scheme.value}`"
    >
      <h3 :id="groupId(scheme.value)" class="scheme-title">{{ t(scheme.label) }}</h3>
      <FreshnessColorField
        v-for="segment in segments"
        :key="segment.key"
        :label="segment.label"
        :kind="kind"
        :color="segment.paint[kind][scheme.value]"
        :fallback="FRESHNESS_PREVIEW_COLORS[segment.tone][kind][scheme.value]"
        :pair="pairOf(segment, scheme.value)"
        :group-label-id="`${titleId} ${groupId(scheme.value)}`"
        :disabled="disabled"
        :data-test="`freshness-${kind}-${scheme.value}-${segment.key}`"
        @save="emit('save', segment.target, kind, scheme.value, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import {
    FRESHNESS_PREVIEW_COLORS,
    type FreshnessKey,
    type FreshnessPaint,
    type FreshnessPaintKind,
    type FreshnessScheme,
    type FreshnessTone
  } from '../../shared/freshness'
  import FreshnessColorField from './FreshnessColorField.vue'
  import { shownColor } from './freshness-preview'

  /** 一个时段：键（序号或 stale）、保存时的目标（天数或 stale）、名称、默认色调与颜色 */
  export interface FreshnessSegment {
    readonly key: FreshnessKey
    readonly target: number | 'stale'
    readonly label: string
    readonly tone: FreshnessTone
    readonly paint: FreshnessPaint
  }

  /**
   * 各时段的一种颜色（文字或背景），浅色、深色主题各一组。名称按当前颜色预览，连同另一种
   * （文字颜色组在加背景色时带上背景色，背景色组带上文字颜色）
   */
  const props = defineProps<{
    kind: FreshnessPaintKind
    /** 所在区域的标题：各组、各项名称的前缀 */
    titleId: string
    segments: readonly FreshnessSegment[]
    /** 加背景色 */
    background?: boolean
    disabled?: boolean
  }>()

  const emit = defineEmits<{ save: [target: number | 'stale', kind: FreshnessPaintKind, scheme: FreshnessScheme, color: string] }>()

  const SCHEMES: readonly { readonly value: FreshnessScheme; readonly label: MessageKey }[] = [
    { value: 'light', label: 'themeLight' },
    { value: 'dark', label: 'themeDark' }
  ]

  const { t } = useI18n()

  const groupId = (scheme: FreshnessScheme): string => `freshness-${props.kind}-${scheme}-title`

  /** 预览时一起显示的另一种颜色 */
  function pairOf(segment: FreshnessSegment, scheme: FreshnessScheme): string | undefined {
    const preview = FRESHNESS_PREVIEW_COLORS[segment.tone]
    if (props.kind === 'background') return shownColor(segment.paint.text[scheme], preview.text[scheme])
    return props.background ? shownColor(segment.paint.background[scheme], preview.background[scheme]) : undefined
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
</style>
