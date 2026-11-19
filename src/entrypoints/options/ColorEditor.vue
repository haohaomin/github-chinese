<template>
  <div class="color-editor">
    <ColorArea
      :hue="modelValue.h"
      :saturation="modelValue.s"
      :value="modelValue.v"
      :color="opaque"
      :label="t('colorArea')"
      :value-text="t('colorAreaValue', { s: Math.round(modelValue.s * 100), v: Math.round(modelValue.v * 100) })"
      @update="(s, v) => update({ s, v })"
    />
    <ColorSlider
      :model-value="modelValue.h"
      :max="360"
      :label="t('colorHue')"
      :value-text="`${Math.round(modelValue.h)}°`"
      :background="HUE_GRADIENT"
      :thumb-color="`hsl(${modelValue.h}, 100%, 50%)`"
      @update:model-value="h => update({ h })"
    />
    <ColorSlider
      :model-value="modelValue.a * 100"
      :max="100"
      checkered
      :label="t('colorAlpha')"
      :value-text="`${Math.round(modelValue.a * 100)}%`"
      :background="`linear-gradient(to right, transparent, ${opaque})`"
      :thumb-color="cssColor(modelValue)"
      @update:model-value="a => update({ a: a / 100 })"
    />
    <div class="color-editor-fields">
      <UiSelect
        class="color-editor-format"
        :model-value="format"
        :options="FORMAT_OPTIONS"
        :aria-label="t('colorFormat')"
        data-test="color-format"
        @update:model-value="setFormat"
      />
      <label v-for="channel in channels" :key="channel.key" class="color-channel" :class="{ 'is-wide': channel.key === 'hex' }">
        <input
          class="ui-field color-channel-input"
          type="text"
          :inputmode="channel.key === 'hex' ? 'text' : 'decimal'"
          spellcheck="false"
          autocomplete="off"
          :value="channel.text"
          :aria-label="channel.label"
          :data-test="`color-channel-${channel.key}`"
          @change="onChange(channel, $event)"
          @keydown="onKeydown(channel, $event)"
        />
        <span class="color-channel-caption" aria-hidden="true">{{ channel.caption }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick } from 'vue'
  import type { UiSelectOption } from '../../components/ui/types'
  import UiSelect from '../../components/ui/UiSelect.vue'
  import { useI18n } from '../../components/ui-preferences'
  import {
    clamp,
    COLOR_FORMATS,
    cssColor,
    formatColor,
    hslToHsv,
    hsvToHsl,
    hsvToRgb,
    parseHex,
    rgbToHsv,
    type ColorFormat,
    type Hsva
  } from '../../shared/color'
  import ColorArea from './ColorArea.vue'
  import ColorSlider from './ColorSlider.vue'
  import { arrowDelta, parseNumberInput } from './color-keys'

  /**
   * 调色盘的颜色编辑：饱和度与明度面板、色相、不透明度，以及按写法（HEX / RGB / HSL）分列的数值。
   * 值为 HSV（饱和度、明度为 0 时色相不丢）；数值在 Enter、失去焦点时生效，↑ ↓ 逐一增减（Shift 为十）
   */
  const props = defineProps<{
    modelValue: Hsva
    format: ColorFormat
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: Hsva]
    'update:format': [format: ColorFormat]
  }>()

  type ChannelKey = 'hex' | 'r' | 'g' | 'b' | 'h' | 's' | 'l' | 'a'

  interface Channel {
    readonly key: ChannelKey
    /** 输入框下的字母；hex 不写 */
    readonly caption: string
    /** 无障碍名称 */
    readonly label: string
    readonly text: string
    /** 数值的上限（下限为 0） */
    readonly max: number
  }

  /** 色相滑杆的轨道 */
  const HUE_GRADIENT = 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
  const FORMAT_OPTIONS: readonly UiSelectOption[] = COLOR_FORMATS.map(format => ({ value: format, label: format.toUpperCase() }))

  const { t } = useI18n()

  /** 当前颜色（不透明）：明度面板的滑块、不透明度轨道用 */
  const opaque = computed(() => cssColor({ ...props.modelValue, a: 1 }))

  const channels = computed((): readonly Channel[] => {
    const color = props.modelValue
    const alpha: Channel = { key: 'a', caption: 'A', label: t('colorAlpha'), text: String(Math.round(color.a * 100)), max: 100 }
    if (props.format === 'hex') {
      return [{ key: 'hex', caption: '', label: 'HEX', text: formatColor({ ...color, a: 1 }, 'hex'), max: 0 }, alpha]
    }
    if (props.format === 'rgb') {
      const { r, g, b } = hsvToRgb(color)
      return [
        { key: 'r', caption: 'R', label: t('colorRed'), text: String(Math.round(r)), max: 255 },
        { key: 'g', caption: 'G', label: t('colorGreen'), text: String(Math.round(g)), max: 255 },
        { key: 'b', caption: 'B', label: t('colorBlue'), text: String(Math.round(b)), max: 255 },
        alpha
      ]
    }
    const { s, l } = hsvToHsl(color)
    return [
      { key: 'h', caption: 'H', label: t('colorHue'), text: String(Math.round(color.h) % 360), max: 360 },
      { key: 's', caption: 'S', label: t('colorSaturation'), text: String(Math.round(s * 100)), max: 100 },
      { key: 'l', caption: 'L', label: t('colorLightness'), text: String(Math.round(l * 100)), max: 100 },
      alpha
    ]
  })

  function update(change: Partial<Hsva>): void {
    emit('update:modelValue', { ...props.modelValue, ...change })
  }

  function setFormat(value: string): void {
    const format = COLOR_FORMATS.find(item => item === value)
    if (format && format !== props.format) emit('update:format', format)
  }

  /** hex 输入：# 可省；三、六位沿用当前透明度，四、八位连透明度一起改 */
  function hexColor(text: string): Hsva | undefined {
    const value = text.trim()
    const rgba = parseHex(value.startsWith('#') ? value : `#${value}`)
    if (!rgba) return undefined
    const digits = value.replace('#', '').length
    const color = props.modelValue
    return rgbToHsv({ ...rgba, a: digits === 4 || digits === 8 ? rgba.a : color.a }, color.h, color.s)
  }

  /** 某一项改为 value 后的颜色 */
  function channelColor(key: Exclude<ChannelKey, 'hex'>, value: number): Hsva {
    const color = props.modelValue
    if (key === 'a') return { ...color, a: value / 100 }
    if (key === 'h') return { ...color, h: value }
    if (key === 's' || key === 'l') {
      const hsl = hsvToHsl(color)
      return hslToHsv({ ...hsl, h: color.h, [key]: value / 100 }, color.a)
    }
    const rgb = hsvToRgb(color)
    return rgbToHsv({ ...rgb, [key]: value }, color.h, color.s)
  }

  /** 输入的文字 → 新颜色；格式不符为 undefined */
  function inputColor(channel: Channel, text: string): Hsva | undefined {
    if (channel.key === 'hex') return hexColor(text)
    const value = parseNumberInput(text)
    return value === undefined ? undefined : channelColor(channel.key, clamp(value, 0, channel.max))
  }

  /** 输入框写回当前值（格式不符、超出范围被截断时，显示的文字可能与值不同步） */
  function refresh(input: HTMLInputElement, key: ChannelKey): void {
    void nextTick(() => {
      const channel = channels.value.find(item => item.key === key)
      if (channel) input.value = channel.text
    })
  }

  function onChange(channel: Channel, event: Event): void {
    const input = event.target as HTMLInputElement
    const color = inputColor(channel, input.value)
    if (color) emit('update:modelValue', color)
    refresh(input, channel.key)
  }

  function onKeydown(channel: Channel, event: KeyboardEvent): void {
    if (channel.key === 'hex') return
    const delta = arrowDelta(event, 1, true)
    if (delta === undefined) return
    event.preventDefault()
    const current = parseNumberInput((event.target as HTMLInputElement).value) ?? Number(channel.text)
    emit('update:modelValue', channelColor(channel.key, clamp(Math.round(current) + delta, 0, channel.max)))
  }
</script>

<style scoped>
  .color-editor {
    display: grid;
    gap: 12px;
  }

  .color-editor-fields {
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  .color-editor-format {
    flex: none;
    width: 76px;
  }

  .color-channel {
    display: grid;
    flex: 1 1 0;
    min-width: 0;
    gap: 2px;
    justify-items: center;
  }

  .color-channel.is-wide {
    flex-grow: 3;
  }

  .color-channel-input {
    padding-inline: 4px;
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    text-align: center;
  }

  .color-channel-caption {
    min-height: 14px;
    font-size: 11px;
    line-height: 14px;
    color: var(--gcn-fg-muted);
  }
</style>
