<template>
  <div class="palette">
    <div v-if="gradientSupported" class="palette-modes" role="radiogroup" :aria-label="t('colorFill')" @keydown="onModeKeydown">
      <button
        v-for="item in MODES"
        :key="item.value"
        type="button"
        role="radio"
        class="palette-mode"
        :aria-checked="mode === item.value"
        :tabindex="mode === item.value ? 0 : -1"
        :data-mode="item.value"
        :data-test="`palette-${item.value}`"
        @click="setMode(item.value)"
      >
        {{ t(item.label) }}
      </button>
    </div>

    <template v-if="mode === 'gradient'">
      <div class="palette-row">
        <UiSelect
          class="palette-type"
          :model-value="gradient.type"
          :options="typeOptions"
          :aria-label="t('gradientType')"
          data-test="gradient-type"
          @update:model-value="setType"
        />
        <span v-if="gradient.type !== 'radial'" class="palette-number">
          <input
            class="ui-field palette-number-input"
            type="text"
            inputmode="decimal"
            spellcheck="false"
            autocomplete="off"
            :value="Math.round(gradient.angle) % 360"
            :aria-label="t('gradientAngle')"
            data-test="gradient-angle"
            @change="onAngleChange"
            @keydown="onAngleKeydown"
          />
          <span class="palette-unit" aria-hidden="true">°</span>
        </span>
      </div>
      <GradientBar
        ref="bar"
        :stops="gradient.stops"
        :selected="selectedId"
        @select="selectedId = $event"
        @move="moveStop"
        @add="addStop"
        @remove="removeStop"
      />
      <div class="palette-row">
        <label class="palette-number">
          <span class="palette-label">{{ t('gradientPosition') }}</span>
          <input
            class="ui-field palette-number-input"
            type="text"
            inputmode="decimal"
            spellcheck="false"
            autocomplete="off"
            :value="Math.round(selectedStop.position)"
            data-test="gradient-position"
            @change="onPositionChange"
            @keydown="onPositionKeydown"
          />
          <span class="palette-unit" aria-hidden="true">%</span>
        </label>
        <span class="palette-actions">
          <UiButton
            variant="invisible"
            size="sm"
            icon
            :aria-label="t('gradientAddStop')"
            :title="t('gradientAddStop')"
            data-test="gradient-add"
            @click="addStop()"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </UiButton>
          <UiButton
            variant="invisible"
            size="sm"
            icon
            :disabled="gradient.stops.length <= 2"
            :aria-label="t('gradientRemoveStop')"
            :title="t('gradientRemoveStop')"
            data-test="gradient-remove"
            @click="removeStop(selectedId)"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3 8h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </UiButton>
        </span>
      </div>
    </template>

    <ColorEditor :model-value="currentColor" :format="format" @update:model-value="setColor" @update:format="setFormat" />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, useTemplateRef } from 'vue'
  import type { UiSelectOption } from '../../components/ui/types'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiSelect from '../../components/ui/UiSelect.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import {
    clamp,
    colorAt,
    createCanvasResolver,
    defaultGradient,
    formatColor,
    formatGradient,
    GRADIENT_TYPES,
    normalizeDegrees,
    sortStops,
    type ColorFormat,
    type Gradient,
    type GradientType,
    type Hsva
  } from '../../shared/color'
  import { isValidColor } from '../../shared/freshness'
  import ColorEditor from './ColorEditor.vue'
  import { arrowDelta, parseNumberInput } from './color-keys'
  import GradientBar from './GradientBar.vue'
  import { initialPalette, newStopPosition, type EditorGradient, type EditorStop, type PaletteMode } from './palette'

  /**
   * 调色盘（颜色项的弹出层内容）：纯色或渐变（浏览器支持在 light-dark() 里用渐变时才有渐变）。
   * 打开时按 value 的写法拆解，之后每次改动发出 update（新写法，按所选格式写出）；不改动不发出
   */
  const props = defineProps<{
    value: string
    /** 为空或拆解不了时的颜色（hex） */
    fallback: string
  }>()

  const emit = defineEmits<{ update: [value: string] }>()

  const MODES: readonly { readonly value: PaletteMode; readonly label: MessageKey }[] = [
    { value: 'solid', label: 'colorSolid' },
    { value: 'gradient', label: 'colorGradient' }
  ]
  /** 填充方式单选组的方向键 */
  const MODE_KEYS: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }
  const TYPE_LABELS: Readonly<Record<GradientType, MessageKey>> = {
    linear: 'gradientLinear',
    radial: 'gradientRadial',
    conic: 'gradientConic'
  }

  const { t } = useI18n()
  const bar = useTemplateRef<InstanceType<typeof GradientBar>>('bar')
  const resolve = createCanvasResolver()
  const gradientSupported = isValidColor('linear-gradient(#000, #fff)')

  let nextId = 0
  const withIds = (value: Gradient): EditorGradient => ({ ...value, stops: value.stops.map(stop => ({ ...stop, id: nextId++ })) })

  const initial = initialPalette(props.value, props.fallback, resolve, isValidColor)
  const mode = ref<PaletteMode>(initial.mode)
  const format = ref<ColorFormat>(initial.format)
  const solid = ref<Hsva>(initial.solid)
  const gradient = ref<EditorGradient>(withIds(initial.gradient))
  const selectedId = ref(sortStops(gradient.value.stops)[0]?.id ?? 0)
  /** 纯色、渐变是否有了自己的值（原值或改过）：切换时没有自己的值就由另一种生成 */
  let solidOwned = initial.solidFromValue
  let gradientOwned = initial.gradientFromValue

  const typeOptions = computed((): readonly UiSelectOption[] => GRADIENT_TYPES.map(type => ({ value: type, label: t(TYPE_LABELS[type]) })))
  const selectedStop = computed((): EditorStop => {
    const { stops } = gradient.value
    return stops.find(stop => stop.id === selectedId.value) ?? stops[0] ?? { id: -1, color: solid.value, position: 0 }
  })
  const currentColor = computed(() => (mode.value === 'solid' ? solid.value : selectedStop.value.color))

  function emitValue(): void {
    emit('update', mode.value === 'solid' ? formatColor(solid.value, format.value) : formatGradient(gradient.value, format.value))
  }

  function setMode(value: PaletteMode): void {
    if (value === mode.value) return
    if (value === 'gradient' && !gradientOwned) {
      gradient.value = withIds(defaultGradient(solid.value))
      selectedId.value = gradient.value.stops[0]?.id ?? 0
    }
    if (value === 'solid' && !solidOwned) solid.value = selectedStop.value.color
    mode.value = value
    emitValue()
  }

  /** 单选组：← ↑ 上一项，→ ↓ 下一项（首尾循环），焦点随之移动 */
  function onModeKeydown(event: KeyboardEvent): void {
    const step = MODE_KEYS[event.key]
    if (step === undefined) return
    event.preventDefault()
    const index = MODES.findIndex(item => item.value === mode.value)
    const next = MODES[(index + step + MODES.length) % MODES.length]
    if (!next) return
    setMode(next.value)
    const group = event.currentTarget as HTMLElement
    void nextTick(() => group.querySelector<HTMLElement>(`[data-mode="${next.value}"]`)?.focus())
  }

  function setColor(color: Hsva): void {
    if (mode.value === 'solid') {
      solid.value = color
      solidOwned = true
      emitValue()
      return
    }
    updateStops(gradient.value.stops.map(stop => (stop.id === selectedStop.value.id ? { ...stop, color } : stop)))
  }

  function setFormat(value: ColorFormat): void {
    format.value = value
    emitValue()
  }

  function updateGradient(change: Partial<EditorGradient>): void {
    gradient.value = { ...gradient.value, ...change }
    gradientOwned = true
    emitValue()
  }

  function updateStops(stops: readonly EditorStop[]): void {
    updateGradient({ stops })
  }

  function setType(value: string): void {
    const type = GRADIENT_TYPES.find(item => item === value)
    if (type && type !== gradient.value.type) updateGradient({ type })
  }

  function moveStop(id: number, position: number): void {
    updateStops(gradient.value.stops.map(stop => (stop.id === id ? { ...stop, position } : stop)))
  }

  /** 添加色标（不给位置时放在最大的空隙中间），颜色取该处的渐变色，并选中 */
  function addStop(position?: number): void {
    const { stops } = gradient.value
    const at = position ?? newStopPosition(stops)
    const stop: EditorStop = { id: nextId++, color: colorAt(stops, at), position: at }
    selectedId.value = stop.id
    updateStops([...stops, stop])
  }

  /** 删除色标（至少留两个），改选位置上相邻的色标 */
  function removeStop(id: number): void {
    const { stops } = gradient.value
    if (stops.length <= 2) return
    const sorted = sortStops(stops)
    const index = sorted.findIndex(stop => stop.id === id)
    const neighbor = sorted[index + 1] ?? sorted[index - 1]
    if (neighbor) selectedId.value = neighbor.id
    updateStops(stops.filter(stop => stop.id !== id))
    bar.value?.focusSelected()
  }

  /** 数字输入框：Enter、失去焦点时取值；不是数字时写回原值 */
  function numberInput(event: Event, apply: (value: number) => void, current: () => number): void {
    const input = event.target as HTMLInputElement
    const value = parseNumberInput(input.value)
    if (value !== undefined) apply(value)
    void nextTick(() => {
      input.value = String(Math.round(current()))
    })
  }

  function setAngle(value: number): void {
    updateGradient({ angle: normalizeDegrees(Math.round(value)) })
  }

  function onAngleChange(event: Event): void {
    numberInput(event, setAngle, () => gradient.value.angle % 360)
  }

  function onAngleKeydown(event: KeyboardEvent): void {
    const delta = arrowDelta(event, 1, true)
    if (delta === undefined) return
    event.preventDefault()
    setAngle(Math.round(gradient.value.angle) + delta)
  }

  function onPositionChange(event: Event): void {
    numberInput(
      event,
      value => moveStop(selectedStop.value.id, clamp(value, 0, 100)),
      () => selectedStop.value.position
    )
  }

  function onPositionKeydown(event: KeyboardEvent): void {
    const delta = arrowDelta(event, 1, true)
    if (delta === undefined) return
    event.preventDefault()
    moveStop(selectedStop.value.id, clamp(Math.round(selectedStop.value.position) + delta, 0, 100))
  }
</script>

<style scoped>
  .palette {
    display: grid;
    gap: 12px;
  }

  /* 填充方式：分段切换 */
  .palette-modes {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    padding: 2px;
    background: var(--gcn-bg-muted);
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius);
  }

  .palette-mode {
    min-height: 24px;
    padding: 2px 8px;
    font: inherit;
    font-size: 12px;
    line-height: 18px;
    color: var(--gcn-fg-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition:
      color var(--gcn-duration-fast) var(--gcn-ease),
      background-color var(--gcn-duration-fast) var(--gcn-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .palette-mode:hover {
    color: var(--gcn-fg);
  }

  .palette-mode[aria-checked='true'] {
    font-weight: 600;
    color: var(--gcn-fg);
    background: var(--gcn-bg);
    border-color: var(--gcn-border);
    box-shadow: var(--gcn-shadow-sm);
  }

  .palette-mode:focus-visible {
    outline-offset: -2px;
  }

  .palette-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .palette-type {
    flex: 1;
  }

  .palette-number {
    display: flex;
    flex: none;
    align-items: center;
    gap: 6px;
  }

  .palette-label {
    font-size: 12px;
    color: var(--gcn-fg-muted);
  }

  .palette-number-input {
    width: 52px;
    padding-inline: 6px;
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    text-align: right;
  }

  .palette-unit {
    font-size: 12px;
    color: var(--gcn-fg-muted);
  }

  .palette-actions {
    display: flex;
    gap: 2px;
    margin-left: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .palette-mode {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .palette-mode[aria-checked='true'] {
      color: HighlightText;
      background: Highlight;
      forced-color-adjust: none;
    }
  }
</style>
