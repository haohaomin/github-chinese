<template>
  <div class="color-field">
    <span :id="labelId" class="color-field-label" :style="previewStyle" data-test="color-label">{{ label }}</span>
    <input
      v-if="isHexColor"
      class="color-field-picker"
      type="color"
      :value="hexPreview"
      :disabled="disabled"
      :aria-labelledby="names"
      data-test="color-picker"
      @input="onPick"
      @change="onPickDone"
    />
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
  import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { isGradient, isValidColor, normalizeHexColor } from '../../shared/freshness'

  /**
   * 一项颜色：名称（用当前颜色显示，即预览）、取色器（仅 #rgb、#rrggbb 时显示）、颜色写法、重置。
   * 写法为 CSS 颜色（hex、rgb()、hsl()、颜色名等）或渐变，浏览器不认的标为格式不符。
   * 取色器拖动时只预览，关闭时保存；写法在失去焦点、按 Enter、离开标签页时保存；清空为默认
   */
  const props = defineProps<{
    label: string
    color: string
    fallback: string
    groupLabelId: string
    disabled?: boolean
  }>()

  const emit = defineEmits<{ save: [color: string] }>()

  const { t } = useI18n()
  const labelId = useId()
  const resetId = useId()
  const statusId = useId()
  const names = computed(() => `${props.groupLabelId} ${labelId}`)

  const draft = ref(props.color)
  const invalid = ref(false)
  let dirty = false

  watch(
    () => props.color,
    value => {
      if (dirty) return
      draft.value = value
      invalid.value = false
    }
  )

  /** 当前草稿是否为纯 hex 颜色（显示取色器的条件） */
  const isHexColor = computed(() => {
    const text = draft.value.trim()
    return text === '' || normalizeHexColor(text) !== undefined
  })

  /** 取色器用的 hex 值 */
  const hexPreview = computed(() => {
    const text = draft.value.trim()
    return normalizeHexColor(text) ?? props.fallback
  })

  /** 名称标签的样式（即预览）：颜色用 color，渐变用背景裁到文字；不可用时为默认 */
  const previewStyle = computed(() => {
    const text = draft.value.trim()
    if (text === '' || invalid.value) return { color: props.fallback }
    const hex = normalizeHexColor(text)
    if (hex !== undefined) return { color: hex }
    if (!isValidColor(text)) return { color: props.fallback }
    if (!isGradient(text)) return { color: text }
    return {
      backgroundImage: text,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  })

  function onInput(value: string): void {
    draft.value = value
    dirty = true
  }

  function onPick(event: Event): void {
    draft.value = (event.target as HTMLInputElement).value
    invalid.value = false
    dirty = true
  }

  function onPickDone(event: Event): void {
    onPick(event)
    commit()
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

  onBeforeUnmount(() => {
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

  .color-field-picker {
    width: 40px;
    height: var(--gcn-control-md);
    padding: 3px;
    background: var(--gcn-bg);
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius);
    box-shadow: var(--gcn-shadow-inset);
    cursor: pointer;
    appearance: none;
    transition: border-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  .color-field-picker:hover:not(:disabled) {
    border-color: var(--gcn-border-emphasis);
  }

  .color-field-picker:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .color-field-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-field-picker::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }

  .color-field-picker::-moz-color-swatch {
    border: none;
    border-radius: 3px;
  }

  .color-field-status {
    grid-column: 1 / -1;
    font-size: 12px;
    color: var(--gcn-danger-fg);
  }

  .color-field-status:not(:empty) {
    padding-top: 4px;
  }
</style>
