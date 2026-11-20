<template>
  <span class="ui-help-tip">
    <button
      ref="button"
      type="button"
      class="ui-help-tip-button"
      :aria-label="label"
      :aria-expanded="open"
      :aria-controls="regionId"
      data-test="help-tip"
      @click.prevent="toggle"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M6.25 6.4a1.75 1.75 0 1 1 2.55 1.55c-.48.26-.8.6-.8 1.15v.15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
      </svg>
    </button>
    <!-- 说明放在 body 下：开关的标签里不能有说明文字（会算进开关名称，点说明也会切换开关） -->
    <Teleport to="body">
      <span :id="regionId" role="status" class="ui-help-tip-region">
        <Transition name="ui-help-tip">
          <span
            v-if="open"
            ref="bubble"
            class="ui-help-tip-bubble"
            :class="{ 'is-above': above }"
            :style="{ top: `${top}px`, left: `${left}px` }"
            data-test="help-tip-text"
          >
            {{ text }}
          </span>
        </Transition>
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, ref, useId, useTemplateRef } from 'vue'

  /**
   * 说明按钮（问号图标）：点击在按钮下方显示一段说明，再点、按 Esc、点其他地方收起。
   * 说明在播报区域里，显示时读屏软件随即读出；焦点留在按钮上。
   * 可放进开关的标签里（UiSwitch 的默认插槽）：点击不切换开关
   */
  defineProps<{
    /** 按钮的无障碍名称 */
    label: string
    /** 说明文字 */
    text: string
  }>()

  /** 与按钮的间距 */
  const GAP = 6
  /** 与窗口边缘的最小距离 */
  const EDGE = 8

  const regionId = useId()
  const button = useTemplateRef<HTMLButtonElement>('button')
  const bubble = useTemplateRef<HTMLElement>('bubble')

  const open = ref(false)
  const above = ref(false)
  const top = ref(0)
  const left = ref(0)

  /** 按钮正下方居中；下方放不下、上方放得下时放上方；左右不超出窗口 */
  function place(): void {
    const rect = button.value?.getBoundingClientRect()
    const panel = bubble.value
    if (!rect || !panel) return
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    above.value = rect.bottom + GAP + height > window.innerHeight - EDGE && rect.top - GAP - height >= EDGE
    top.value = above.value ? rect.top - GAP - height : rect.bottom + GAP
    const centered = rect.left + rect.width / 2 - width / 2
    left.value = Math.max(EDGE, Math.min(centered, window.innerWidth - EDGE - width))
  }

  function onOutside(event: Event): void {
    const target = event.target
    if (target instanceof Node && (button.value?.contains(target) || bubble.value?.contains(target))) return
    close()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return
    event.preventDefault()
    close()
    button.value?.focus()
  }

  function show(): void {
    open.value = true
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onKeydown, true)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    void nextTick(place)
  }

  function close(): void {
    if (!open.value) return
    open.value = false
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onKeydown, true)
    window.removeEventListener('resize', place)
    window.removeEventListener('scroll', place, true)
  }

  function toggle(): void {
    if (open.value) close()
    else show()
  }

  onBeforeUnmount(close)
</script>

<style scoped>
  .ui-help-tip {
    display: inline-flex;
    flex: none;
    vertical-align: middle;
  }

  /*
   * 按钮只占图标大小（14px），放进窄标签也不挤文字；点击区与悬停底色由伪元素扩到 20px。
   * 默认弱化，悬停、展开时加深
   */
  .ui-help-tip-button {
    position: relative;
    display: inline-flex;
    width: 14px;
    height: 14px;
    padding: 0;
    color: var(--gcn-fg-muted);
    background: transparent;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color var(--gcn-duration-fast) var(--gcn-ease);
  }

  .ui-help-tip-button::before {
    position: absolute;
    inset: -3px;
    content: '';
    border-radius: 50%;
    transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  .ui-help-tip-button:hover,
  .ui-help-tip-button[aria-expanded='true'] {
    color: var(--gcn-fg);
  }

  .ui-help-tip-button:hover::before,
  .ui-help-tip-button[aria-expanded='true']::before {
    background: var(--gcn-invisible-hover-bg);
  }

  .ui-help-tip-button:active::before {
    background: var(--gcn-invisible-active-bg);
  }

  .ui-help-tip-button svg {
    position: relative;
    display: block;
  }

  .ui-help-tip-bubble {
    position: fixed;
    z-index: 30;
    width: max-content;
    max-width: min(240px, calc(100vw - 16px));
    padding: 8px 10px;
    font-size: 12px;
    line-height: 18px;
    color: var(--gcn-fg);
    text-align: left;
    white-space: normal;
    overflow-wrap: anywhere;
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: var(--gcn-radius-overlay);
    box-shadow: var(--gcn-shadow-overlay);
  }

  /* 展开：淡入并从按钮一侧滑出 4px；收起只淡出（同调色盘） */
  .ui-help-tip-enter-active {
    transition:
      opacity var(--gcn-duration-base) var(--gcn-ease-out),
      transform var(--gcn-duration-base) var(--gcn-ease-out);
  }

  .ui-help-tip-leave-active {
    pointer-events: none;
    transition: opacity var(--gcn-duration-fast) var(--gcn-ease);
  }

  .ui-help-tip-enter-from,
  .ui-help-tip-leave-to {
    opacity: 0;
  }

  .ui-help-tip-enter-from {
    transform: translateY(-4px);
  }

  .ui-help-tip-bubble.is-above.ui-help-tip-enter-from {
    transform: translateY(4px);
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-help-tip-button,
    .ui-help-tip-button::before,
    .ui-help-tip-enter-active,
    .ui-help-tip-leave-active {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ui-help-tip-button {
      color: ButtonText;
    }

    .ui-help-tip-bubble {
      border-color: CanvasText;
    }
  }
</style>
