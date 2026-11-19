<template>
  <div ref="root" class="ui-back-to-top" :class="{ 'is-shown': shown, 'is-page': page }">
    <button
      type="button"
      class="ui-back-to-top-button"
      :aria-label="label"
      :title="label"
      data-test="back-to-top"
      @click="toTop"
      @focus="onFocus"
      @blur="focused = false"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path :d="ARROW_UP" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

  /**
   * 返回顶部：放在可滚动的列表（容器）里，作为最后一个子元素；固定在列表可见区域的右下角。
   * 整页（page）时按页面的滚动，固定在窗口右下角。
   * 向下滚过半屏后显示（列表里同时在末尾留出按钮的高度），点按后滚回顶部（减少动态效果时直接回到顶部）。
   * 键盘聚焦时不隐藏：键盘操作回到顶部后焦点仍在按钮上；点按聚焦的照常隐藏
   */
  const { label, page = false } = defineProps<{
    /** 按钮的名称（悬停提示同） */
    label: string
    /** 整页：按页面的滚动；缺省按所在的列表（父元素） */
    page?: boolean
  }>()

  /** Octicons 的 arrow-up（16px） */
  const ARROW_UP =
    'M3.47 7.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018L9 4.81v7.44a.75.75 0 0 1-1.5 0V4.81L4.53 7.78a.75.75 0 0 1-1.06 0Z'

  const root = useTemplateRef<HTMLElement>('root')
  const scrolled = ref(false)
  const focused = ref(false)
  const shown = computed(() => scrolled.value || focused.value)
  /** 滚动的元素：列表，整页时为页面的滚动元素 */
  let container: Element | null = null
  /** 滚动事件的来源：列表，整页时为窗口 */
  let source: HTMLElement | Window | null = null

  /** 滚过可见高度的一半后显示 */
  function update(): void {
    if (!container) return
    const height = page ? window.innerHeight : container.clientHeight
    scrolled.value = container.scrollTop > height / 2
  }

  /** 键盘聚焦（:focus-visible）；不支持该选择器时按键盘聚焦 */
  function isFocusVisible(element: Element): boolean {
    try {
      return element.matches(':focus-visible')
    } catch {
      return true
    }
  }

  function onFocus(event: FocusEvent): void {
    const target = event.currentTarget
    focused.value = target instanceof Element && isFocusVisible(target)
  }

  function toTop(): void {
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduced ? 'auto' : 'smooth'
    if (page) window.scrollTo({ top: 0, behavior })
    else container?.scrollTo({ top: 0, behavior })
  }

  onMounted(() => {
    container = page ? (document.scrollingElement ?? document.documentElement) : (root.value?.parentElement ?? null)
    source = page ? window : (root.value?.parentElement ?? null)
    source?.addEventListener('scroll', update, { passive: true })
    if (page) window.addEventListener('resize', update, { passive: true })
    update()
  })

  onBeforeUnmount(() => {
    source?.removeEventListener('scroll', update)
    if (page) window.removeEventListener('resize', update)
    container = null
    source = null
  })
</script>

<style scoped>
  /*
   * 粘在列表可见区域的底部；只有按钮响应点按，下面的行照常可点。层级高于各行与固定的表头。
   * 隐藏时高为 0、不占位置；显示时在列表末尾留出按钮的高度，滚到底时最后一行在按钮上方，不被挡住
   */
  .ui-back-to-top {
    position: sticky;
    bottom: 12px;
    z-index: 3;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 0;
    padding-right: 12px;
    pointer-events: none;
  }

  .ui-back-to-top.is-shown {
    height: calc(var(--gcn-control-md) + 12px);
  }

  /* 整页：固定在窗口右下角，不占位置；在下拉列表、调色盘等浮层之下 */
  .ui-back-to-top.is-page {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 5;
    height: auto;
    padding-right: 0;
  }

  .ui-back-to-top-button {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--gcn-control-md);
    height: var(--gcn-control-md);
    padding: 0;
    color: var(--gcn-fg-muted);
    pointer-events: auto;
    cursor: pointer;
    background: var(--gcn-overlay-bg);
    border: 1px solid var(--gcn-overlay-border);
    border-radius: 50%;
    box-shadow: var(--gcn-shadow-overlay);
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    -webkit-tap-highlight-color: transparent;
    transition:
      opacity var(--gcn-duration-fast) var(--gcn-ease),
      transform var(--gcn-duration-fast) var(--gcn-ease),
      color var(--gcn-duration-fast) var(--gcn-ease),
      background-color var(--gcn-duration-fast) var(--gcn-ease),
      visibility 0s linear var(--gcn-duration-fast);
  }

  .is-shown > .ui-back-to-top-button {
    opacity: 1;
    visibility: visible;
    transform: none;
    transition-delay: 0s;
  }

  .ui-back-to-top-button:hover {
    color: var(--gcn-fg);
    background-color: color-mix(in srgb, var(--gcn-overlay-bg), var(--gcn-fg) 6%);
  }

  .ui-back-to-top-button:active {
    background-color: color-mix(in srgb, var(--gcn-overlay-bg), var(--gcn-fg) 10%);
    transition-duration: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-back-to-top-button {
      transform: none;
      transition: none;
    }
  }
</style>
