<template>
  <section class="section" aria-labelledby="time-format-title">
    <h2 id="time-format-title" class="section-title">{{ t('timeFormat') }}</h2>
    <div class="time-format">
      <UiSelect
        class="time-format-mode"
        :model-value="settings.timeFormat"
        :options="modeOptions"
        :disabled="!ready"
        aria-labelledby="time-format-title"
        data-test="time-format"
        @update:model-value="setMode"
      />
      <template v-if="settings.timeFormat === 'custom'">
        <UiInput
          id="time-format-pattern"
          class="time-format-pattern"
          mono
          :model-value="draft"
          :maxlength="TIME_FORMAT_MAX_LENGTH"
          :placeholder="DEFAULT_CUSTOM_TIME_FORMAT"
          :aria-label="t('timeFormatPattern')"
          :disabled="!ready"
          spellcheck="false"
          autocomplete="off"
          data-test="time-format-pattern"
          @update:model-value="onInput"
          @change="flush"
        />
        <output v-if="preview" class="time-format-preview" for="time-format-pattern" data-test="time-format-preview">{{ preview }}</output>
      </template>
    </div>

    <dl v-if="settings.timeFormat === 'custom'" class="format-reference">
      <div v-for="token in TOKEN_REFERENCE" :key="token.code" class="format-reference-row">
        <dt class="format-reference-code">{{ token.code }}</dt>
        <dd class="format-reference-desc">{{ token.desc }}</dd>
        <span class="format-reference-example">{{ token.example }}</span>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import type { UiSelectOption } from '../../components/ui/types'
  import UiInput from '../../components/ui/UiInput.vue'
  import UiSelect from '../../components/ui/UiSelect.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { languageEnvironment } from '../../shared/language-env'
  import { resolvePageLocale } from '../../shared/locale'
  import {
    DEFAULT_CUSTOM_TIME_FORMAT,
    formatTime,
    isTimeFormatMode,
    sanitizeTimeFormat,
    TIME_FORMAT_MAX_LENGTH
  } from '../../shared/time-format'
  import { useSettingsSave } from './useSettingsSave'

  /**
   * 时间格式：默认（时间元素按翻译语言渲染）或自定义写法（见 shared/time-format）。
   * 写法输入停顿后保存，失去焦点、按 Enter、离开页面时立即保存；旁边显示按写法写出的当前时刻
   */

  /** 输入停顿多久后保存（毫秒） */
  const SAVE_DELAY_MS = 400

  /** 格式符说明：code 为格式符，desc 为含义，example 为示例输出 */
  const TOKEN_REFERENCE = [
    { code: 'YYYY', desc: '年（四位）', example: '2026' },
    { code: 'YY', desc: '年（两位）', example: '26' },
    { code: 'M / MM', desc: '月', example: '1 / 01' },
    { code: 'MMM', desc: '月（短）', example: '1月' },
    { code: 'MMMM', desc: '月（全）', example: '一月' },
    { code: 'D / DD', desc: '日', example: '5 / 05' },
    { code: 'H / HH', desc: '时（24小时）', example: '9 / 09' },
    { code: 'h / hh', desc: '时（12小时）', example: '9 / 09' },
    { code: 'A / a', desc: '上午 / 下午', example: '上午' },
    { code: 'm / mm', desc: '分', example: '5 / 05' },
    { code: 's / ss', desc: '秒', example: '8 / 08' },
    { code: 'SSS', desc: '毫秒', example: '007' },
    { code: 'd', desc: '星期（数字 0–6）', example: '1' },
    { code: 'dd', desc: '星期（简）', example: '一' },
    { code: 'ddd', desc: '星期（短）', example: '周一' },
    { code: 'dddd', desc: '星期（全）', example: '星期一' },
    { code: 'Z / ZZ', desc: '时区偏移', example: '+08:00 / +0800' },
    { code: '[文字]', desc: '原样输出', example: '[今天] → 今天' }
  ] as const

  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()
  const env = languageEnvironment()
  /** 预览用的时刻：打开页面时 */
  const now = Date.now()

  const modeOptions = computed<readonly UiSelectOption[]>(() => [
    { value: 'default', label: t('timeFormatDefault') },
    { value: 'custom', label: t('timeFormatCustom') }
  ])

  /** 输入框里的写法：输入时先改这里，停顿后保存 */
  const draft = ref(settings.value.customTimeFormat)
  let timer: ReturnType<typeof setTimeout> | undefined

  // 设置在别处改了（其他页面、导入备份、首次读到）：跟着变；只差首尾空白（自己刚保存的）时不动，免得打断输入
  watch(
    () => settings.value.customTimeFormat,
    value => {
      if (sanitizeTimeFormat(draft.value) !== value) draft.value = value
    }
  )

  const preview = computed(() => {
    const pattern = draft.value.trim()
    return pattern ? formatTime(pattern, now, { lang: resolvePageLocale(settings.value.language, env) }) : ''
  })

  function cancelTimer(): void {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  async function flush(): Promise<void> {
    cancelTimer()
    const pattern = sanitizeTimeFormat(draft.value)
    if (pattern !== settings.value.customTimeFormat) await save({ customTimeFormat: pattern })
  }

  function onInput(value: string): void {
    draft.value = value
    cancelTimer()
    timer = setTimeout(() => void flush(), SAVE_DELAY_MS)
  }

  async function setMode(value: string): Promise<void> {
    if (isTimeFormatMode(value)) await save({ timeFormat: value })
  }

  onBeforeUnmount(() => {
    if (timer !== undefined) void flush()
  })
</script>

<style scoped>
  /* 下拉框、写法、预览一行排开，窄时换行 */
  .time-format {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
  }

  .time-format-mode {
    min-width: 120px;
  }

  .time-format-pattern {
    flex: 1 1 200px;
    max-width: 280px;
  }

  .time-format-preview {
    color: var(--gcn-fg-muted);
    font-variant-numeric: tabular-nums;
  }

  /* 格式符说明表：三列（符号、含义、示例），紧凑排列 */
  .format-reference {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0;
    margin: 0;
    padding: 4px 0;
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius-lg);
    overflow: hidden;
  }

  .format-reference-row {
    display: contents;
  }

  .format-reference-row > * {
    padding: 5px 12px;
    border-bottom: 1px solid var(--gcn-border-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .format-reference-row:last-child > * {
    border-bottom: none;
  }

  .format-reference-code {
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    color: var(--gcn-accent);
    white-space: nowrap;
  }

  .format-reference-desc {
    margin: 0;
    color: var(--gcn-fg);
  }

  .format-reference-example {
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    color: var(--gcn-fg-muted);
    white-space: nowrap;
    text-align: right;
  }
</style>
