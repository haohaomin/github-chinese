<template>
  <div class="section">
    <TransferTools :disabled="!ready" @import="importScope($event, 'purify')" @export="exportScope('purify')" />
    <ul class="switches">
      <li>
        <UiSwitch :label="t('purifySearch')" :checked="settings.purifySearch" :disabled="!ready" @change="setPurify" />
      </li>
      <li>
        <UiSwitch :label="t('purifyBuiltin')" :checked="settings.purifyBuiltin" :disabled="!ready" @change="setBuiltin" />
      </li>
    </ul>
    <UiTabs v-model="ruleTab" :tabs="ruleTabs" :label="t('searchBlockRules')" variant="pill" class="rule-tabs">
      <template #custom>
        <TextList
          :list="list"
          :label="t('searchBlockRules')"
          :placeholder="PLACEHOLDER"
          :empty="t(loadFailed ? 'loadFailed' : 'noRules')"
        />
      </template>
      <template #builtin><BuiltinRulesList :enabled="settings.purifyBuiltin" /></template>
      <template #actions>
        <UiButton size="sm" :href="CONTRIBUTE_RULES_URL" target="_blank" rel="noreferrer" data-test="contribute-rules">
          {{ t('contributeRules') }}
        </UiButton>
      </template>
    </UiTabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import type { UiTab } from '../../components/ui/types'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import UiTabs from '../../components/ui/UiTabs.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { CONTRIBUTE_RULES_URL } from '../../shared/extension'
  import BuiltinRulesList from './BuiltinRulesList.vue'
  import TextList from './TextList.vue'
  import TransferTools from './TransferTools.vue'
  import { useBackup } from './useBackup'
  import { useSearchBlock } from './useSearchBlock'

  /** 写法示例：所有者、存储库、关键词（见 shared/search-block） */
  const PLACEHOLDER = '@octocat · octocat/hello-world · hello world'

  const { t } = useI18n()
  const list = useSearchBlock()
  const { settings, ready, loadFailed, setPurify, setBuiltin } = list
  const { exportScope, importScope } = useBackup()
  /** 屏蔽规则：自定义规则、内置规则分两个标签 */
  const ruleTab = ref('custom')
  const ruleTabs = computed<UiTab[]>(() => [
    { value: 'custom', label: t('customRules') },
    { value: 'builtin', label: t('purifyBuiltin') }
  ])
</script>

<style scoped>
  /* 规则与上方开关隔开 */
  .rule-tabs {
    margin-top: 12px;
  }
</style>
