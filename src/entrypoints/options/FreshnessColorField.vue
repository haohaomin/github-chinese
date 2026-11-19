<template>
  <div class="color-field">
    <span :id="labelId" class="color-field-label" :style="previewStyle" data-test="color-label">{{ label }}</span>
    <span ref="anchor" class="color-field-palette" @focusout="onFocusOut" @keydown.esc="onEscape">
      <button
        ref="swatch"
        type="button"
        class="color-field-swatch"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="open ? paletteId : undefined"
        :aria-labelledby="`${paletteLabelId} ${names}`"
        data-test="color-picker"
        @click="toggle"
      >
        <span class="color-field-swatch-checker">
          <span class="color-field-swatch-color" :style="swatchStyle" data-test="color-swatch"></span>
        </span>
      </button>
      <span :id="paletteLabelId" hidden>{{ t('palette') }}</span>
      <Transition name="color-field-popover">
        <div
          v-if="open"
          :id="paletteId"
          ref="popover"
          role="dialog"
          tabindex="-1"
          class="color-field-popover"
          :class="{ 'is-above': above, 'is-end': alignEnd }"
          :aria-labelledby="names"
          data-test="color-palette"
        >
          <ColorPalette :value="draft" :fallback="fallback" @update="onPaletteUpdate" />
        </div>
      </Transition>
    </span>
    <UiInput
      class="color-field-hex"
      mono
      :model-value="draft"
      :placeholder="t('colorDefault')"
      :disabled="disabled"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-labelledby="names"
      :aria-describedby="statusId"
      spellcheck="false"
      autocomplete="off"
      data-test="color-hex"
      @update:model-value="onInput"
      @change="commit"
    />
    <UiButton
      :id="resetId"
      :disabled="disabled || (!color && draft.trim() === '')"
      :aria-labelledby="`${resetId} ${names}`"
      data-test="color-reset"
      @click="reset"
    >
      {{ t('colorReset') }}
    </UiButton>
    <p :id="statusId" class="color-field-status" role="status" data-test="color-status">{{ invalid ? t('invalidFormat') : '' }}</p>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { isGradient, isValidColor, normalizeHexColor } from '../../shared/freshness'
  import ColorPalette from './ColorPalette.vue'
  import { previewStyle as stylePreview, shownColor as showColor } from './freshness-preview'

  /**
   * 一项颜色（文字颜色或背景色）：名称（用当前颜色显示，即预览）、色块（点开调色盘）、颜色写法、重置。
   * 写法为 CSS 颜色（hex、rgb()、hsl()、颜色名等）或渐变，浏览器不认的标为格式不符。
   * 调色盘里改动时只预览，关闭（点在别处、再点色块、焦点移出）时保存，Esc 取消并恢复打开时的写法；
   * 写法在失去焦点、按 Enter、离开标签页时保存；清空为默认
   */
  const props = defineProps<{
    label: string
    color: string
    fallback: string
    /** 名称的前缀：所在组的标题（可为多个 id，空格分隔） */
    groupLabelId: string
    disabled?: boolean
    /** 颜色的用处：文字（默认）、背景 */
    kind?: 'text' | 'background'
    /** 预览时一起显示的另一项：文字颜色项为背景色（不加背景时不给），背景色项为文字颜色 */
    pair?: string
  }>()

  const emit = defineEmits<{ save: [color: string] }>()

  /** 弹出层与色块的间距、与窗口边缘至少留出的距离（px） */
  const GAP = 4
  const EDGE = 8
  /** 打开时聚焦弹出层里的第一个可聚焦控件 */
  const FOCUSABLE = 'button:not(:disabled, [tabindex="-1"]), input:not(:disabled), [tabindex="0"]'

  const { t } = useI18n()
  const labelId = useId()
  const resetId = useId()
  const statusId = useId()
  const paletteId = useId()
  const paletteLabelId = useId()
  const names = computed(() => `${props.groupLabelId} ${labelId}`)

  const anchor = useTemplateRef<HTMLElement>('anchor')
  const swatch = useTemplateRef<HTMLButtonElement>('swatch')
  const popover = useTemplateRef<HTMLElement>('popover')

  const draft = ref(props.color)
  const invalid = ref(false)
  let dirty = false

  const open = ref(false)
  /** 向上展开、与色块右缘对齐：每次打开时按窗口内的空间决定 */
  const above = ref(false)
  const alignEnd = ref(false)
  /** 打开调色盘时的写法与状态：Esc 取消时恢复 */
  let before = { draft: '', invalid: false, dirty: false }

  watch(
    () => props.color,
    value => {
      if (dirty) return
      draft.value = value
      invalid.value = false
    }
  )

  /** 当前显示的颜色：写法可用时为它（hex 统一写法），否则为默认色 */
  const shownColor = computed(() => (invalid.value ? props.fallback : showColor(draft.value, props.fallback)))

  /** 名称标签的样式（即预览），连同另一项（见 pair） */
  const previewStyle = computed(() =>
    props.kind === 'background' ? stylePreview(props.pair ?? 'currentColor', shownColor.value) : stylePreview(shownColor.value, props.pair)
  )

  const swatchStyle = computed(() =>
    isGradient(shownColor.value) ? { backgroundImage: shownColor.value } : { backgroundColor: shownColor.value }
  )

  function onInput(value: string): void {
    draft.value = value
    dirty = true
  }

  function onPaletteUpdate(value: string): void {
    draft.value = value
    invalid.value = false
    dirty = true
  }

  function commit(): void {
    const text = draft.value.trim()
    if (text === '') {
      dirty = false
      invalid.value = false
      draft.value = ''
      if ('' !== props.color) emit('save', '')
      return
    }
    // hex（# 可省）统一写法；其他写法交给浏览器判断
    const hex = normalizeHexColor(text)
    if (hex === undefined && !isValidColor(text)) {
      invalid.value = true
      return
    }
    dirty = false
    invalid.value = false
    draft.value = hex ?? text
    if (draft.value !== props.color) emit('save', draft.value)
  }

  function reset(): void {
    draft.value = ''
    commit()
  }

  /** 调色盘的大小变化（切换纯色、渐变等）：重新定位 */
  let resizeObserver: ResizeObserver | undefined

  /**
   * 下方放不下、上方放得下时向上展开，其余向下（页面能向下滚，向上展开超出窗口顶端时可能滚不到）；
   * 右侧超出窗口时与色块右缘对齐
   */
  function place(): void {
    const rect = swatch.value?.getBoundingClientRect()
    const panel = popover.value
    if (!rect || !panel) return
    const height = panel.offsetHeight
    const below = window.innerHeight - rect.bottom - GAP - EDGE
    const upper = rect.top - GAP - EDGE
    above.value = height > below && height <= upper
    alignEnd.value = rect.left + panel.offsetWidth > window.innerWidth - EDGE
  }

  /** 滚动页面让调色盘完整可见；比窗口高时露出顶端 */
  function reveal(): void {
    popover.value?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  function placeAndReveal(): void {
    place()
    void nextTick(reveal)
  }

  function watchSize(panel: HTMLElement): void {
    if (typeof ResizeObserver !== 'function') return
    let initial = true
    resizeObserver = new ResizeObserver(() => {
      // 首次回调为打开时的大小：已定位
      if (initial) initial = false
      else placeAndReveal()
    })
    resizeObserver.observe(panel)
  }

  function show(): void {
    if (open.value || props.disabled) return
    before = { draft: draft.value, invalid: invalid.value, dirty }
    open.value = true
    document.addEventListener('pointerdown', onOutside, true)
    void nextTick(() => {
      const panel = popover.value
      if (!panel) return
      placeAndReveal()
      panel.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true })
      watchSize(panel)
    })
  }

  function hide(): void {
    open.value = false
    document.removeEventListener('pointerdown', onOutside, true)
    resizeObserver?.disconnect()
    resizeObserver = undefined
  }

  /** 关闭并保存调色盘里的改动 */
  function close(): void {
    if (!open.value) return
    hide()
    if (dirty) commit()
  }

  /** 取消：关闭并恢复打开时的写法，焦点回到色块 */
  function cancel(): void {
    if (!open.value) return
    hide()
    draft.value = before.draft
    invalid.value = before.invalid
    dirty = before.dirty
    swatch.value?.focus()
  }

  function toggle(): void {
    if (open.value) close()
    else show()
  }

  /** 点在色块与调色盘以外：关闭并保存 */
  function onOutside(event: Event): void {
    const target = event.target
    if (target instanceof Node && anchor.value?.contains(target)) return
    close()
  }

  /** 焦点移到色块与调色盘以外（Tab 离开）：关闭并保存。切换窗口等没有去处的失焦不算 */
  function onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget
    if (next instanceof Node && !anchor.value?.contains(next)) close()
  }

  function onEscape(event: KeyboardEvent): void {
    if (!open.value) return
    event.stopPropagation()
    cancel()
  }

  // 打开时被禁用（如关掉总开关）：收起并保存
  watch(
    () => props.disabled,
    value => {
      if (value) close()
    }
  )

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onOutside, true)
    resizeObserver?.disconnect()
    if (dirty) commit()
  })
</script>

<style scoped>
  .color-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 96px auto;
    align-items: center;
    column-gap: 8px;
  }

  .color-field-label {
    font-variant-numeric: tabular-nums;
  }

  .color-field-palette {
    position: relative;
    display: flex;
  }

  .color-field-swatch {
    width: 40px;
    height: var(--gcn-control-md);
    padding: 3px;
    background: var(--gcn-bg);
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius);
    box-shadow: var(--gcn-shadow-inset);
    cursor: pointer;
    transition: border-color var(--gcn-duration-fast) var(--gcn-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .color-field-swatch:hover:enabled,
  .color-field-swatch[aria-expanded='true'] {
    border-color: var(--gcn-border-emphasis);
  }

  .color-field-swatch:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* 色块下垫棋盘格：半透明的颜色看得出透明 */
  .color-field-swatch-checker {
    display: block;
    height: 100%;
    overflow: hidden;
    background: repeating-conic-gradient(var(--gcn-checker) 0 25%, var(--gcn-bg) 0 50%) 0 0 / 8px 8px;
    border-radius: 3px;
  }

  .color-field-swatch-color {
    display: block;
    height: 100%;
    box-shadow: inset 0 0 0 1px light-dark(#1f23281a, #ffffff1a);
  }

  /* 调色盘：z-index 盖住后面带定位的控件（按钮、另一组颜色） */
  .color-field-popover {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 20;
    width: 264px;
    max-width: calc(100vw - 16px);
    padding: 12px;
    color: var(--gcn-fg);
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: var(--gcn-radius-overlay);
    box-shadow: var(--gcn-shadow-overlay);
    /* 滚动显示时与窗口边缘留出的距离（同 EDGE） */
    scroll-margin: 8px;
  }

  .color-field-popover:focus {
    outline: none;
  }

  .color-field-popover.is-above {
    top: auto;
    bottom: calc(100% + 4px);
  }

  .color-field-popover.is-end {
    right: 0;
    left: auto;
  }

  /* 展开：淡入并从色块一侧滑出 4px；收起只淡出（同下拉框） */
  .color-field-popover-enter-active {
    transition:
      opacity var(--gcn-duration-base) var(--gcn-ease-out),
      transform var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .color-field-popover-leave-active {
    pointer-events: none;
    transition: opacity var(--gcn-duration-fast) var(--gcn-ease);
  }

  .color-field-popover-enter-from,
  .color-field-popover-leave-to {
    opacity: 0;
  }

  .color-field-popover-enter-from {
    transform: translateY(-4px);
  }

  .color-field-popover.is-above.color-field-popover-enter-from {
    transform: translateY(4px);
  }

  .color-field-status {
    grid-column: 1 / -1;
    font-size: 12px;
    color: var(--gcn-danger-fg);
  }

  .color-field-status:not(:empty) {
    padding-top: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .color-field-swatch,
    .color-field-popover-enter-active,
    .color-field-popover-leave-active {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .color-field-swatch-checker {
      forced-color-adjust: none;
    }
  }
</style>
