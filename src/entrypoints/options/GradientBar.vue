<template>
  <div class="gradient-bar" role="group" :aria-label="t('gradientStops')">
    <div ref="track" class="gradient-bar-track" data-test="gradient-track" @pointerdown="onTrackPointerDown">
      <span class="gradient-bar-fill" :style="{ backgroundImage: preview }"></span>
    </div>
    <span
      v-for="stop in stops"
      :key="stop.id"
      :ref="element => setHandle(stop.id, element)"
      class="gradient-stop"
      :class="{ 'is-selected': stop.id === selected }"
      role="slider"
      tabindex="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(stop.position)"
      :aria-valuetext="`${Math.round(stop.position)}%`"
      :aria-label="t('gradientStop', { n: rank(stop.id) })"
      :aria-current="stop.id === selected ? 'true' : undefined"
      :style="{ left: `${stop.position}%`, '--stop-color': cssColor(stop.color) }"
      data-test="gradient-stop"
      @focus="emit('select', stop.id)"
      @pointerdown="onStopPointerDown(stop, $event)"
      @pointermove="onStopPointerMove(stop, $event)"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @lostpointercapture="endDrag"
      @keydown="onStopKeydown(stop, $event)"
    ></span>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, useTemplateRef } from 'vue'
  import { useI18n } from '../../components/ui-preferences'
  import { clamp, cssColor, sortStops } from '../../shared/color'
  import { arrowDelta } from './color-keys'
  import type { EditorStop } from './palette'

  /**
   * 渐变的色标条：条上为自左向右的渐变预览，色标可拖动；点按条上空处在该处添加色标（颜色取该处的渐变色）。
   * 色标聚焦即选中（下方编辑它的颜色）；键盘 ← → 移动 1%（Shift 10%），Home、End 到两端，Delete、Backspace 删除（至少留两个）。
   * 色标按添加顺序排列（拖过别的色标时不重排，焦点不丢），名称里的序号按位置
   */
  const props = defineProps<{
    stops: readonly EditorStop[]
    selected: number
  }>()

  const emit = defineEmits<{
    select: [id: number]
    move: [id: number, position: number]
    add: [position: number]
    remove: [id: number]
  }>()

  const { t } = useI18n()
  const track = useTemplateRef<HTMLElement>('track')
  const handles = new Map<number, HTMLElement>()
  /** 拖动中的色标与按下处相对色标中心的偏移（%） */
  let drag: { readonly id: number; readonly offset: number } | undefined

  const sorted = computed(() => sortStops(props.stops))
  const preview = computed(
    () => `linear-gradient(to right, ${sorted.value.map(stop => `${cssColor(stop.color)} ${stop.position}%`).join(', ')})`
  )

  function setHandle(id: number, element: unknown): void {
    if (element instanceof HTMLElement) handles.set(id, element)
    else handles.delete(id)
  }

  /** 按位置的序号（从 1 起） */
  function rank(id: number): number {
    return sorted.value.findIndex(stop => stop.id === id) + 1
  }

  /** 指针横坐标对应的位置（%）；条没有宽度时为 undefined */
  function positionAt(clientX: number): number | undefined {
    const rect = track.value?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return undefined
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
  }

  /** 聚焦选中的色标（删除后焦点落到相邻的色标上） */
  function focusSelected(): void {
    void nextTick(() => handles.get(props.selected)?.focus({ preventScroll: true }))
  }

  defineExpose({ focusSelected })

  function onTrackPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return
    event.preventDefault()
    const position = positionAt(event.clientX)
    if (position === undefined) return
    emit('add', Math.round(position))
    focusSelected()
  }

  function onStopPointerDown(stop: EditorStop, event: PointerEvent): void {
    if (event.button !== 0) return
    event.preventDefault()
    const handle = event.currentTarget as HTMLElement
    handle.focus({ preventScroll: true })
    emit('select', stop.id)
    const position = positionAt(event.clientX)
    drag = { id: stop.id, offset: position === undefined ? 0 : position - stop.position }
    handle.setPointerCapture?.(event.pointerId)
  }

  function onStopPointerMove(stop: EditorStop, event: PointerEvent): void {
    if (drag?.id !== stop.id) return
    const position = positionAt(event.clientX)
    if (position !== undefined) emit('move', stop.id, clamp(position - drag.offset, 0, 100))
  }

  function endDrag(): void {
    drag = undefined
  }

  function onStopKeydown(stop: EditorStop, event: KeyboardEvent): void {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      if (props.stops.length <= 2) return
      emit('remove', stop.id)
      focusSelected()
      return
    }
    const delta = arrowDelta(event, 1)
    let position: number | undefined
    if (delta !== undefined) position = Math.round(stop.position) + delta
    else if (event.key === 'Home') position = 0
    else if (event.key === 'End') position = 100
    if (position === undefined) return
    event.preventDefault()
    emit('move', stop.id, clamp(position, 0, 100))
  }
</script>

<style scoped>
  /* 左右留出色标的半宽：到头时不出界 */
  .gradient-bar {
    position: relative;
    margin-inline: 7px;
  }

  .gradient-bar-track {
    position: relative;
    height: 24px;
    overflow: hidden;
    background: repeating-conic-gradient(var(--gcn-checker) 0 25%, var(--gcn-bg) 0 50%) 0 0 / 8px 8px;
    border-radius: var(--gcn-radius);
    cursor: copy;
    touch-action: none;
  }

  .gradient-bar-fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px light-dark(#1f23281a, #ffffff1a);
  }

  .gradient-stop {
    position: absolute;
    top: 50%;
    width: 14px;
    height: 30px;
    background:
      linear-gradient(var(--stop-color), var(--stop-color)),
      repeating-conic-gradient(var(--gcn-checker) 0 25%, var(--gcn-bg) 0 50%) 0 0 / 6px 6px;
    border: 2px solid #ffffff;
    border-radius: 5px;
    box-shadow:
      0 0 0 1px #1f23284d,
      0 1px 3px #1f23283d;
    cursor: grab;
    touch-action: none;
    transform: translate(-50%, -50%);
  }

  .gradient-stop:active {
    cursor: grabbing;
  }

  /* 选中的色标：外圈加一道强调色 */
  .gradient-stop.is-selected {
    box-shadow:
      0 0 0 1px #1f23284d,
      0 0 0 3px var(--gcn-accent),
      0 1px 3px #1f23283d;
  }

  .gradient-stop:focus-visible {
    outline: 2px solid var(--gcn-focus);
    outline-offset: 3px;
  }

  @media (forced-colors: active) {
    .gradient-bar-track,
    .gradient-stop {
      forced-color-adjust: none;
    }
  }
</style>
