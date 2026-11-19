<template>
  <div
    ref="track"
    class="color-slider"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @lostpointercapture="endDrag"
  >
    <span class="color-slider-rail" :class="{ 'is-checkered': checkered }" aria-hidden="true">
      <span class="color-slider-fill" :style="{ backgroundImage: background }"></span>
    </span>
    <span
      ref="thumb"
      class="color-slider-thumb"
      role="slider"
      tabindex="0"
      aria-orientation="horizontal"
      aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="Math.round(modelValue)"
      :aria-valuetext="valueText"
      :aria-label="label"
      :style="thumbStyle"
      @keydown="onKeydown"
    ></span>
  </div>
</template>

<script setup lang="ts">
  import { computed, useTemplateRef } from 'vue'
  import { clamp } from '../../shared/color'
  import { arrowDelta } from './color-keys'

  /**
   * 调色盘的横向滑杆（色相、不透明度）：轨道底色为 background（渐变），滑块填 thumbColor；checkered 时轨道下垫棋盘格。
   * 拖动或点按轨道改值；键盘 ← → ↑ ↓ 每次 step，Shift、PageUp、PageDown 为十倍，Home、End 到两端
   */
  const props = withDefaults(
    defineProps<{
      modelValue: number
      max: number
      label: string
      valueText: string
      background: string
      thumbColor: string
      checkered?: boolean
      step?: number
    }>(),
    { checkered: false, step: 1 }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

  /** 滑块直径（px）：滑块圆心在轨道两端各缩进半径，到头时不出界 */
  const THUMB = 16

  const track = useTemplateRef<HTMLElement>('track')
  const thumb = useTemplateRef<HTMLElement>('thumb')
  let dragging = false

  const thumbStyle = computed(() => ({
    left: `calc(${clamp(props.modelValue / props.max, 0, 1)} * (100% - ${THUMB}px) + ${THUMB / 2}px)`,
    '--thumb-color': props.thumbColor
  }))

  /** 指针横坐标对应的值；轨道没有宽度（未显示）时为 undefined */
  function valueAt(clientX: number): number | undefined {
    const rect = track.value?.getBoundingClientRect()
    const usable = (rect?.width ?? 0) - THUMB
    if (!rect || usable <= 0) return undefined
    return clamp((clientX - rect.left - THUMB / 2) / usable, 0, 1) * props.max
  }

  function moveTo(clientX: number): void {
    const value = valueAt(clientX)
    if (value !== undefined) emit('update:modelValue', value)
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return
    // 不选中文字；焦点给滑块，键盘接着微调
    event.preventDefault()
    thumb.value?.focus({ preventScroll: true })
    track.value?.setPointerCapture?.(event.pointerId)
    dragging = true
    moveTo(event.clientX)
  }

  function onPointerMove(event: PointerEvent): void {
    if (dragging) moveTo(event.clientX)
  }

  function endDrag(): void {
    dragging = false
  }

  function onKeydown(event: KeyboardEvent): void {
    const delta = arrowDelta(event, props.step)
    let value: number | undefined
    if (delta !== undefined) value = Math.round(props.modelValue) + delta
    else if (event.key === 'Home') value = 0
    else if (event.key === 'End') value = props.max
    if (value === undefined) return
    event.preventDefault()
    emit('update:modelValue', clamp(value, 0, props.max))
  }
</script>

<style scoped>
  .color-slider {
    position: relative;
    height: 16px;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }

  .color-slider-rail {
    position: absolute;
    inset: 2px 0;
    overflow: hidden;
    border-radius: 999px;
  }

  .color-slider-rail.is-checkered {
    background: repeating-conic-gradient(var(--gcn-checker) 0 25%, var(--gcn-bg) 0 50%) 0 0 / 8px 8px;
  }

  /* 轨道内描一圈细边：浅色轨道在白底上也有边界 */
  .color-slider-fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px light-dark(#1f23281a, #ffffff1a);
  }

  .color-slider-thumb {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background: var(--thumb-color);
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow:
      0 0 0 1px #1f23284d,
      0 1px 3px #1f23283d;
    transform: translate(-50%, -50%);
  }

  .color-slider-thumb:focus-visible {
    outline: 2px solid var(--gcn-focus);
    outline-offset: 2px;
  }

  @media (forced-colors: active) {
    .color-slider-rail,
    .color-slider-thumb {
      forced-color-adjust: none;
    }
  }
</style>
