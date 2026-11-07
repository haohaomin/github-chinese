<template>
  <div class="section">
    <TransferTools :disabled="!ready" @import="importScope($event, 'downloads')" @export="exportScope('downloads')" />
    <ul class="switches">
      <li>
        <UiSwitch
          :label="t('downloadCount')"
          :checked="settings.downloadCount"
          :disabled="!ready"
          data-test="download-count"
          @change="save({ downloadCount: $event })"
        />
      </li>
    </ul>

    <section class="section" aria-labelledby="download-about-title">
      <h2 id="download-about-title" class="section-title">{{ t('downloadAbout') }}</h2>
      <ul class="notes" data-test="download-about">
        <li v-for="note in aboutNotes" :key="note.key">{{ note.text }}</li>
      </ul>
    </section>

    <section class="section" aria-labelledby="github-token-title">
      <h2 id="github-token-title" class="section-title">{{ t('githubToken') }}</h2>
      <div class="token">
        <UiInput
          class="token-input"
          type="password"
          mono
          :model-value="draft"
          :placeholder="PLACEHOLDER"
          :disabled="!tokenReady"
          :aria-invalid="invalid ? 'true' : undefined"
          aria-labelledby="github-token-title"
          aria-describedby="github-token-status"
          autocomplete="off"
          spellcheck="false"
          data-test="github-token"
          @update:model-value="onInput"
          @change="commit"
        />
        <UiButton :disabled="!tokenReady || !saved" data-test="clear-token" @click="clear">{{ t('clear') }}</UiButton>
      </div>
      <p id="github-token-status" class="token-status" :class="{ 'token-status-danger': danger }" role="status" data-test="token-status">
        {{ status }}
      </p>
    </section>

    <section class="section" aria-labelledby="token-guide-title">
      <h2 id="token-guide-title" class="section-title">{{ t('tokenGuide') }}</h2>
      <ol class="notes" data-test="token-guide">
        <li>
          <a class="link" :href="NEW_TOKEN_URL" target="_blank" rel="noopener noreferrer" data-test="new-token">
            {{ t('tokenGuideOpen') }}
          </a>
        </li>
        <li v-for="key in GUIDE_STEPS" :key="key">{{ t(key) }}</li>
      </ol>
    </section>

    <section class="section" aria-labelledby="privacy-title">
      <h2 id="privacy-title" class="section-title">{{ t('privacy') }}</h2>
      <ul class="notes" data-test="privacy">
        <li v-for="key in PRIVACY_NOTES" :key="key">{{ t(key) }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
  import { createToastSource } from '../../components/toast'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import type { MessageKey } from '../../i18n'
  import {
    ANONYMOUS_RATE_LIMIT,
    fetchRateLimit,
    githubTokenItem,
    NEW_TOKEN_URL,
    normalizeToken,
    RELEASE_CACHE_TTL_MS,
    TOKEN_RATE_LIMIT,
    type RateLimitResult
  } from '../../shared/github-api'
  import TransferTools from './TransferTools.vue'
  import { useBackup } from './useBackup'
  import { useSettingsSave } from './useSettingsSave'

  /**
   * 下载次数设置：开关、说明（次数来源、更新、限额、令牌的用处）、个人访问令牌（存 storage.local，见 shared/github-api）、
   * 创建令牌的步骤、隐私说明。
   * 令牌在失去焦点、按 Enter 时保存；格式不符时不保存。
   * 标签页显示时查询当前的 API 限额（不计入限额）：没有令牌时为每个 IP 的额度，令牌无效时提示
   */

  const props = defineProps<{
    /** 所在标签页正显示：显示时才查询限额 */
    active?: boolean
  }>()

  /** 写法示例：精细令牌的前缀 */
  const PLACEHOLDER = 'github_pat_…'
  /** 创建令牌的步骤（第一步是链接） */
  const GUIDE_STEPS: readonly MessageKey[] = [
    'tokenGuideName',
    'tokenGuideExpiration',
    'tokenGuideAccess',
    'tokenGuidePermissions',
    'tokenGuideGenerate'
  ]
  const PRIVACY_NOTES: readonly MessageKey[] = ['privacyNoCollect', 'privacyLocal', 'privacyToken']
  /** 缓存时长（分钟） */
  const CACHE_MINUTES = RELEASE_CACHE_TTL_MS / 60_000

  type RateState = { readonly kind: 'idle' } | { readonly kind: 'loading' } | RateLimitResult

  const { t, language } = useI18n()
  const { settings, ready, save } = useSettingsSave()
  const { exportScope, importScope } = useBackup()
  const toast = createToastSource()

  /** 已保存的令牌；没有时为空串 */
  const saved = ref('')
  /** 输入框里的内容 */
  const draft = ref('')
  const tokenReady = ref(false)
  const tokenLoadFailed = ref(false)
  const invalid = ref(false)
  const rate = shallowRef<RateState>({ kind: 'idle' })
  /** 上次查询限额用的令牌：令牌没变时不重复查询 */
  let rateToken: string | undefined
  let rateRequest = 0

  /** 查询限额：标签页显示时；force 为 false 时令牌没变就不查 */
  function syncRate(force: boolean): void {
    if (!props.active || !tokenReady.value) return
    const token = saved.value
    if (!force && rateToken === token) return
    rateToken = token
    const request = ++rateRequest
    rate.value = { kind: 'loading' }
    void fetchRateLimit(token).then(result => {
      if (request === rateRequest) rate.value = result
    })
  }

  /** 已保存的令牌变了（本页保存、导入备份、其他设置页）：输入框跟着变 */
  function adopt(value: unknown): void {
    saved.value = typeof value === 'string' ? (normalizeToken(value) ?? '') : ''
    draft.value = saved.value
    invalid.value = false
    syncRate(false)
  }

  githubTokenItem
    .getValue()
    .then(
      value => adopt(value),
      () => {
        tokenLoadFailed.value = true
      }
    )
    .finally(() => {
      tokenReady.value = true
      syncRate(true)
    })
  const unwatch = githubTokenItem.watch(adopt)
  onBeforeUnmount(unwatch)

  watch(
    () => props.active,
    active => {
      // 每次显示都重新查询：额度随浏览消耗
      if (active) syncRate(true)
    }
  )

  function onInput(value: string): void {
    draft.value = value
    invalid.value = false
  }

  async function store(token: string): Promise<void> {
    try {
      await githubTokenItem.setValue(token)
    } catch {
      toast.show('danger', 'saveFailed')
      return
    }
    toast.clear()
    tokenLoadFailed.value = false
    adopt(token)
  }

  /** 失去焦点、按 Enter：空则删除，格式不符时提示，不保存 */
  async function commit(): Promise<void> {
    const text = draft.value.trim()
    if (text === saved.value) {
      draft.value = text
      return
    }
    if (text === '') return store('')
    const token = normalizeToken(text)
    if (!token) {
      invalid.value = true
      return
    }
    await store(token)
  }

  async function clear(): Promise<void> {
    await store('')
  }

  const status = computed(() => {
    if (invalid.value) return t('invalidFormat')
    if (tokenLoadFailed.value) return t('loadFailed')
    const state = rate.value
    switch (state.kind) {
      case 'loading':
        return t('stateLoading')
      case 'ok': {
        const format = new Intl.NumberFormat(language.value)
        return t('rateLimit', { remaining: format.format(state.rate.remaining), limit: format.format(state.rate.limit) })
      }
      case 'unauthorized':
        return t('tokenRejected')
      case 'failed':
        return t('loadFailed')
      default:
        return ''
    }
  })
  const danger = computed(() => invalid.value || rate.value.kind === 'unauthorized')

  /** 说明：数字按界面语言分组 */
  const aboutNotes = computed((): readonly { readonly key: MessageKey; readonly text: string }[] => {
    const format = new Intl.NumberFormat(language.value)
    return [
      { key: 'downloadAboutSource', text: t('downloadAboutSource') },
      { key: 'downloadAboutUpdate', text: t('downloadAboutUpdate', { minutes: format.format(CACHE_MINUTES) }) },
      { key: 'downloadAboutQuota', text: t('downloadAboutQuota', { limit: format.format(ANONYMOUS_RATE_LIMIT) }) },
      { key: 'downloadAboutToken', text: t('downloadAboutToken', { limit: format.format(TOKEN_RATE_LIMIT) }) }
    ]
  })
</script>

<style scoped>
  /* 令牌：输入框占满，清除按钮在右 */
  .token {
    display: flex;
    gap: 8px;
  }

  .token-input {
    flex: 1 1 auto;
  }

  .token-status {
    min-height: 1.5em;
    margin: 0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--gcn-fg-muted);
  }

  .token-status-danger {
    color: var(--gcn-danger-fg);
  }

  .notes {
    display: grid;
    gap: 4px;
    margin: 0;
    padding-left: 24px;
  }

  .link {
    color: var(--gcn-accent);
    text-decoration: none;
  }

  .link:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
</style>
