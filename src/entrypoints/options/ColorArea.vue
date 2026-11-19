<template>
  <div
    ref="area"
    class="color-area"
    :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @lostpointercapture="endDrag"
  >
    <span
      ref="thumb"
      class="color-area-thumb"
      role="slider"
      tabindex="0"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(saturation * 100)"
      :aria-valuetext="valueText"
      :aria-label="label"
      :style="{ left: `${saturation * 100}%`, top: `${(1 - value) * 100}%`, '--thumb-color': color }"
      @keydown="onKeydown"
    ></span>
  </div>
</template>

<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import { clamp } from '../../shared/color'

  /**
   * 饱和度与明度面板：横向为饱和度（左 0 右 1），纵向为明度（下 0 上 1），底色为当前色相。
   * 拖动或点按改值；键盘 ← → 改饱和度、↑ ↓ 改明度，每次 1%，Shift 为 10%；PageUp、PageDown 改明度 10%；Home、End 饱和度到两端
   */
  const props = defineProps<{
    hue: number
    saturation: number
    value: number
    /** 滑块的填色：当前颜色（不透明） */
    color: string
    label: string
    valueText: string
  }>()

  const emit = defineEmits<{ update: [saturation: number, value: number] }>()

  const STEP = 0.01

  const area = useTemplateRef<HTMLElement>('area')
  const thumb = useTemplateRef<HTMLElement>('thumb')
  let dragging = false

  function moveTo(clientX: number, clientY: number): void {
    const rect = area.value?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return
    emit('update', clamp((clientX - rect.left) / rect.width, 0, 1), 1 - clamp((clientY - rect.top) / rect.height, 0, 1))
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return
    event.preventDefault()
    thumb.value?.focus({ preventScroll: true })
    area.value?.setPointerCapture?.(event.pointerId)
    dragging = true
    moveTo(event.clientX, event.clientY)
  }

  function onPointerMove(event: PointerEvent): void {
    if (dragging) moveTo(event.clientX, event.clientY)
  }

  function endDrag(): void {
    dragging = false
  }

  /** 按键 → 新的饱和度与明度；不处理的键为 undefined */
  function keyTarget(event: KeyboardEvent): readonly [number, number] | undefined {
    const unit = event.shiftKey ? STEP * 10 : STEP
    const { saturation: s, value: v } = props
    switch (event.key) {
      case 'ArrowLeft':
        return [s - unit, v]
      case 'ArrowRight':
        return [s + unit, v]
      case 'ArrowUp':
        return [s, v + unit]
      case 'ArrowDown':
        return [s, v - unit]
      case 'PageUp':
        return [s, v + STEP * 10]
      case 'PageDown':
        return [s, v - STEP * 10]
      case 'Home':
        return [0, v]
      case 'End':
        return [1, v]
      default:
        return undefined
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    const target = keyTarget(event)
    if (!target) return
    event.preventDefault()
    // 先取整到 1%，连按不累积误差
    const snap = (value: number): number => clamp(Math.round(value * 100) / 100, 0, 1)
    emit('update', snap(target[0]), snap(target[1]))
  }
</script>

<style scoped>
  .color-area {
    position: relative;
    height: 144px;
    background-image: linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent);
    border-radius: var(--gcn-radius);
    box-shadow: inset 0 0 0 1px light-dark(#1f23281a, #ffffff1a);
    cursor: crosshair;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }

  .color-area-thumb {
    position: absolute;
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

  .color-area-thumb:focus-visible {
    outline: 2px solid var(--gcn-focus);
    outline-offset: 2px;
  }

  @media (forced-colors: active) {
    .color-area,
    .color-area-thumb {
      forced-color-adjust: none;
    }
  }
</style>
