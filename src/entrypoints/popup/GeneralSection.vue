<template>
  <section aria-labelledby="general-title">
    <h2 id="general-title" class="section-title">{{ t('general') }}</h2>
    <ul class="toggle-grid">
      <li
        v-for="option in OPTIONS"
        :key="option.key"
        class="toggle-tile"
        :class="{ 'is-on': settings[option.key] && !blocked(option), 'is-blocked': blocked(option) }"
      >
        <UiSwitch
          compact
          :label="t(option.label)"
          :checked="settings[option.key]"
          :disabled="!ready || blocked(option)"
          @change="setOption(option.key, $event)"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
  import { createToastSource } from '../../components/toast'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useSettings } from '../../components/useSettings'
  import type { MessageKey } from '../../i18n'
  import type { BooleanSettingKey, Settings } from '../../shared/settings'

  interface ToggleOption {
    readonly key: BooleanSettingKey
    readonly label: MessageKey
    /** 所依赖的开关：它关闭时本开关不生效，显示为不可用 */
    readonly requires?: BooleanSettingKey
  }

  /** 总开关在弹出页顶部，这里不重复；时间本地化、翻译标题随汉化 */
  const OPTIONS: readonly ToggleOption[] = [
    { key: 'translation', label: 'translation' },
    { key: 'translateTime', label: 'translateTime', requires: 'translation' },
    { key: 'translateTitle', label: 'translateTitle', requires: 'translation' },
    { key: 'accelerate', label: 'accelerate' },
    { key: 'purifySearch', label: 'purifySearch' },
    { key: 'autoLoad', label: 'autoLoad' },
    { key: 'imagePreview', label: 'imagePreview' },
    { key: 'downloadCount', label: 'downloadCount' },
    { key: 'folderDownload', label: 'downloadFolder' },
    { key: 'newTab', label: 'newTab' },
    { key: 'chineseReadme', label: 'chineseReadme' },
    { key: 'freshness', label: 'freshness' }
  ]

  const { t } = useI18n()
  // 读取前显示的是默认值：与顶部总开关一样先不可用
  const { settings, ready, update } = useSettings()
  // 保存失败时在页面顶部提示；再次保存成功时收起
  const toast = createToastSource()

  /** 所依赖的开关已关闭 */
  function blocked(option: ToggleOption): boolean {
    return option.requires !== undefined && !settings.value[option.requires]
  }

  async function setOption(key: BooleanSettingKey, value: boolean): Promise<void> {
    const patch: Partial<Settings> = { [key]: value }
    if (await update(patch)) toast.clear()
    else toast.show('danger', 'saveFailed')
  }
</script>

<style scoped>
  /*
 * 两列并排：开关多，一行一个时弹出页过长。开启的描主题色边、浅主题色底。
 * 标签区约 81px（弹出页 300px）：中文标签最长 6 字，一行放得下；英文标签多数折成两行，同一行的格子等高
 */
  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
  }

  /* 内边距在开关里（见 UiSwitch 的紧凑样式）：整格可点 */
  .toggle-tile {
    display: flex;
    font-size: 13px;
    line-height: 16px;
    background: var(--gcn-bg);
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius-lg);
    transition:
      background-color var(--gcn-duration-base) var(--gcn-ease),
      border-color var(--gcn-duration-base) var(--gcn-ease);
  }

  .toggle-tile > * {
    flex: 1 1 auto;
    min-width: 0;
  }

  .toggle-tile.is-on {
    background: color-mix(in srgb, var(--gcn-accent) 6%, var(--gcn-bg));
    border-color: color-mix(in srgb, var(--gcn-accent) 45%, var(--gcn-border));
  }

  /* 所依赖的开关关闭：标签变灰，不可点 */
  .toggle-tile.is-blocked {
    color: var(--gcn-fg-muted);
  }

  .toggle-tile.is-blocked :deep(.ui-switch-label) {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle-tile {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .toggle-tile.is-on {
      border-color: Highlight;
    }
  }
</style>
