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
      <div v-for="token in tokenRows" :key="token.code" class="format-reference-row" data-test="format-reference-row">
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
  import type { MessageKey } from '../../i18n'
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

  /** 格式符说明的一行：code 为格式符，tokens 为示例用到的格式符（多个以 / 隔开），desc 为含义的文案键 */
  interface TokenRow {
    readonly code: string
    readonly tokens: readonly string[]
    readonly desc: MessageKey
  }

  const TOKEN_REFERENCE: readonly TokenRow[] = [
    { code: 'YYYY', tokens: ['YYYY'], desc: 'timeFormatTokenYear4' },
    { code: 'YY', tokens: ['YY'], desc: 'timeFormatTokenYear2' },
    { code: 'M / MM', tokens: ['M', 'MM'], desc: 'timeFormatTokenMonth' },
    { code: 'MMM', tokens: ['MMM'], desc: 'timeFormatTokenMonthShort' },
    { code: 'MMMM', tokens: ['MMMM'], desc: 'timeFormatTokenMonthLong' },
    { code: 'D / DD', tokens: ['D', 'DD'], desc: 'timeFormatTokenDay' },
    { code: 'H / HH', tokens: ['H', 'HH'], desc: 'timeFormatTokenHour24' },
    { code: 'h / hh', tokens: ['h', 'hh'], desc: 'timeFormatTokenHour12' },
    { code: 'A / a', tokens: ['A'], desc: 'timeFormatTokenMeridiem' },
    { code: 'm / mm', tokens: ['m', 'mm'], desc: 'timeFormatTokenMinute' },
    { code: 's / ss', tokens: ['s', 'ss'], desc: 'timeFormatTokenSecond' },
    { code: 'SSS', tokens: ['SSS'], desc: 'timeFormatTokenMillisecond' },
    { code: 'd', tokens: ['d'], desc: 'timeFormatTokenWeekdayNumber' },
    { code: 'dd', tokens: ['dd'], desc: 'timeFormatTokenWeekdayMin' },
    { code: 'ddd', tokens: ['ddd'], desc: 'timeFormatTokenWeekdayShort' },
    { code: 'dddd', tokens: ['dddd'], desc: 'timeFormatTokenWeekdayLong' },
    { code: 'Z / ZZ', tokens: ['Z', 'ZZ'], desc: 'timeFormatTokenOffset' }
  ]

  /** 示例时刻：2026-01-05 09:05:08.007（本地时区，周一） */
  const SAMPLE_TIME = new Date(2026, 0, 5, 9, 5, 8, 7).getTime()

  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()
  const env = languageEnvironment()
  /** 预览用的时刻：打开页面时 */
  const now = Date.now()

  /** 翻译语言：时间按它写出 */
  const pageLocale = computed(() => resolvePageLocale(settings.value.language, env))

  /** 说明表：含义随界面语言，示例按翻译语言写出 */
  const tokenRows = computed(() => {
    const lang = pageLocale.value
    const sample = (pattern: string): string => formatTime(pattern, SAMPLE_TIME, { lang })
    const literal = t('timeFormatLiteralSample')
    return [
      ...TOKEN_REFERENCE.map(row => ({ code: row.code, desc: t(row.desc), example: row.tokens.map(sample).join(' / ') })),
      { code: t('timeFormatLiteralCode'), desc: t('timeFormatTokenLiteral'), example: `[${literal}] → ${sample(`[${literal}]`)}` }
    ]
  })

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
    return pattern ? formatTime(pattern, now, { lang: pageLocale.value }) : ''
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
