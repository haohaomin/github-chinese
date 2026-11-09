<template>
  <div class="color-field">
    <span :id="labelId" class="color-field-label" :style="{ color: preview }" data-test="color-label">{{ label }}</span>
    <input
      class="color-field-picker"
      type="color"
      :value="preview"
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
  import { normalizeHexColor } from '../../shared/freshness'

  /**
   * 一项颜色：名称（用当前颜色显示，即预览）、取色器、颜色写法（#rrggbb）、重置。
   * 取色器拖动时只预览，关闭时保存；写法在失去焦点、按 Enter、离开标签页时保存，格式不符时提示、不保存；清空为默认
   */
  const props = defineProps<{
    /** 名称 */
    label: string
    /** 保存的颜色（小写 #rrggbb）；空为默认 */
    color: string
    /** 默认颜色的近似值：预览、取色器用 */
    fallback: string
    /** 所在分组标题的 id：与名称一起作控件的无障碍名称 */
    groupLabelId: string
    disabled?: boolean
  }>()

  const emit = defineEmits<{ save: [color: string] }>()

  const { t } = useI18n()
  const labelId = useId()
  const resetId = useId()
  const statusId = useId()
  const names = computed(() => `${props.groupLabelId} ${labelId}`)

  /** 写法输入框里的文字：输入、取色时先改这里，提交时保存 */
  const draft = ref(props.color)
  const invalid = ref(false)
  /** 有未提交的改动：设置在别处变了（其他页面、导入备份）也不覆盖 */
  let dirty = false

  watch(
    () => props.color,
    value => {
      if (dirty) return
      draft.value = value
      invalid.value = false
    }
  )

  /** 预览的颜色：清空时为默认，写法有效时用写法，输入中或格式不符时用保存的颜色 */
  const preview = computed(() => {
    const text = draft.value.trim()
    if (text === '') return props.fallback
    return normalizeHexColor(text) ?? (props.color || props.fallback)
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

  /** 提交：空为默认；格式不符时提示，不保存 */
  function commit(): void {
    const text = draft.value.trim()
    const color = text === '' ? '' : normalizeHexColor(text)
    if (color === undefined) {
      invalid.value = true
      return
    }
    dirty = false
    invalid.value = false
    draft.value = color
    if (color !== props.color) emit('save', color)
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
  /* 名称、取色器、写法、重置一行；格式错误的提示在下一行 */
  .color-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 96px auto;
    align-items: center;
    column-gap: 8px;
  }

  .color-field-label {
    font-variant-numeric: tabular-nums;
  }

  /* 取色器：与输入框同高的色块 */
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
