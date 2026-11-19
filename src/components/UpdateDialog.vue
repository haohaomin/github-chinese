<template>
  <dialog ref="dialog" class="update-dialog" :aria-labelledby="titleId" data-test="update-dialog" @close="close">
    <h2 :id="titleId" class="update-dialog-title">{{ t('newVersionLabel', { version: latest }) }}</h2>
    <div class="update-dialog-body">
      <p v-if="notes === undefined" class="update-dialog-status" role="status" data-test="update-notes-status">{{ t('stateLoading') }}</p>
      <p v-else-if="notes === null" class="update-dialog-status" data-test="update-notes-status">{{ t('loadFailed') }}</p>
      <p v-else-if="notes.length === 0" class="update-dialog-status" data-test="update-notes-status">{{ t('noData') }}</p>
      <template v-else>
        <details v-for="(note, index) in notes" :key="note.version" class="update-note" :open="index === 0" data-test="update-note">
          <summary class="update-note-title">v{{ note.version }}</summary>
          <ReleaseNoteView class="update-note-body" :blocks="note.blocks" />
        </details>
      </template>
    </div>
    <div class="update-dialog-actions">
      <UiButton autofocus data-test="update-cancel" @click="close">{{ t('cancel') }}</UiButton>
      <UiButton variant="primary" :href="releaseUrl(latest)" target="_blank" rel="noreferrer" data-test="update-confirm" @click="close">
        {{ t('update') }}
      </UiButton>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import { onMounted, shallowRef, useId, useTemplateRef, watch } from 'vue'
  import { fetchReleaseNotes, type ReleaseNote } from '../shared/release-notes'
  import { releaseUrl } from '../shared/update-check'
  import ReleaseNoteView from './ReleaseNoteView'
  import UiButton from './ui/UiButton.vue'
  import { useI18n } from './ui-preferences'

  /**
   * 新版本的说明（模态 dialog）：当前版本之后到最新版本的各版说明，新的在前；最新的展开，其余收起（标题为版本号）。
   * 「更新」在新标签页打开最新版本的发行版页并关闭，「取消」、Esc 关闭
   */
  const props = defineProps<{
    /** 当前版本 */
    current: string
    /** 最新版本 */
    latest: string
  }>()
  const open = defineModel<boolean>('open', { default: false })

  const { t } = useI18n()
  const titleId = useId()
  const dialog = useTemplateRef<HTMLDialogElement>('dialog')
  /** 各版说明：加载中为 undefined，取不到为 null */
  const notes = shallowRef<readonly ReleaseNote[] | null>()
  let request = 0

  async function load(): Promise<void> {
    const id = ++request
    notes.value = undefined
    const result = await fetchReleaseNotes(props.current, props.latest)
    if (id === request) notes.value = result ?? null
  }

  /** 对话框随 open 打开、关闭；打开时取说明（上次没取到的重新取） */
  function sync(): void {
    const element = dialog.value
    if (!element || element.open === open.value) return
    if (open.value) {
      element.showModal()
      if (!notes.value) void load()
    } else element.close()
  }

  function close(): void {
    open.value = false
  }

  watch(open, sync, { flush: 'post' })
  watch(
    () => [props.current, props.latest],
    () => {
      notes.value = undefined
      if (open.value) void load()
    }
  )
  onMounted(sync)
</script>

<style scoped>
  .update-dialog {
    display: none;
    flex-direction: column;
    width: min(560px, calc(100vw - 16px));
    max-height: calc(100vh - 16px);
    padding: 0;
    color: var(--gcn-fg);
    overflow-wrap: anywhere;
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: var(--gcn-radius-overlay);
    box-shadow: var(--gcn-shadow-overlay);
  }

  .update-dialog[open] {
    display: flex;
    animation: update-dialog-in var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .update-dialog::backdrop {
    background: var(--gcn-backdrop);
  }

  .update-dialog-title {
    flex: none;
    margin: 0;
    padding: 16px 16px 12px;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  /* 说明：超出时在框内滚动，标题与按钮固定 */
  .update-dialog-body {
    display: grid;
    gap: 8px;
    min-height: 0;
    padding: 0 16px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .update-dialog-status {
    margin: 0;
    padding: 8px 0;
    font-size: 14px;
    color: var(--gcn-fg-muted);
  }

  .update-note {
    border: 1px solid var(--gcn-border);
    border-radius: var(--gcn-radius-lg);
  }

  .update-note-title {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    border-radius: var(--gcn-radius-lg);
  }

  .update-note-title:hover {
    background: var(--gcn-invisible-hover-bg);
  }

  .update-note-title:focus-visible {
    outline: 2px solid var(--gcn-focus);
    outline-offset: -2px;
  }

  .update-note[open] > .update-note-title {
    border-bottom: 1px solid var(--gcn-border-muted);
    border-radius: var(--gcn-radius-lg) var(--gcn-radius-lg) 0 0;
  }

  .update-note-body {
    padding: 4px 12px 12px;
    font-size: 13px;
    line-height: 1.6;
  }

  .update-note-body :deep(h3) {
    margin: 12px 0 4px;
    font-size: 14px;
    font-weight: 600;
  }

  .update-note-body :deep(p) {
    margin: 4px 0;
  }

  .update-note-body :deep(:is(ul, ol)) {
    margin: 4px 0;
    padding-left: 20px;
  }

  .update-note-body :deep(li > p) {
    margin: 0;
  }

  .update-note-body :deep(li + li) {
    margin-top: 2px;
  }

  .update-note-body :deep(blockquote) {
    margin: 4px 0;
    padding-left: 12px;
    color: var(--gcn-fg-muted);
    border-left: 3px solid var(--gcn-border);
  }

  .update-note-body :deep(code) {
    padding: 0.1em 0.3em;
    font-family: var(--gcn-font-mono);
    font-size: 0.92em;
    background: var(--gcn-bg-muted);
    border-radius: 4px;
  }

  .update-note-body :deep(pre) {
    margin: 4px 0;
    padding: 8px;
    overflow-x: auto;
    background: var(--gcn-bg-muted);
    border-radius: var(--gcn-radius);
  }

  .update-note-body :deep(pre code) {
    padding: 0;
    background: none;
  }

  .update-note-body :deep(a) {
    color: var(--gcn-accent);
    text-decoration: none;
  }

  .update-note-body :deep(a:hover) {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .update-note-body :deep(> :first-child) {
    margin-top: 4px;
  }

  .update-dialog-actions {
    display: flex;
    flex: none;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px 16px;
  }

  @keyframes update-dialog-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .update-dialog[open] {
      animation: none;
    }
  }
</style>
