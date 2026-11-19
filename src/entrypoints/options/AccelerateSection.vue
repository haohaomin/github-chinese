<template>
  <div class="section">
    <ul class="switches">
      <li v-for="key in SWITCHES" :key="key">
        <UiSwitch :label="t(key)" :checked="settings[key]" :disabled="!ready" @change="setSwitch(key, $event)" />
      </li>
      <li class="field-row">
        <label for="replace-category" class="field-label">{{ t('replaceLinks') }}</label>
        <UiSelect
          id="replace-category"
          class="field-select"
          :model-value="settings.replaceCategory"
          :options="replaceOptions"
          :disabled="!ready"
          data-test="replace-category"
          @update:model-value="setReplace"
        />
      </li>
    </ul>

    <section class="section sources-section" aria-labelledby="sources-title">
      <div class="section-head">
        <h2 id="sources-title" class="section-title">{{ t('sourcesTitle') }}</h2>
        <TransferTools :disabled="!ready" @import="importScope($event, 'accelerate')" @export="exportScope('accelerate')" />
      </div>

      <UiTabs
        v-model="activeCategory"
        :tabs="categoryTabs"
        :label="t('category')"
        variant="pill"
        :reorderable="ready"
        class="categories"
        @move="onMoveCategory"
      >
        <template #actions>
          <UiButton
            size="sm"
            icon
            :aria-label="t('newCategory')"
            :title="t('newCategory')"
            :disabled="!ready"
            data-test="new-category"
            @click="onNewCategory"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </UiButton>
          <UiButton size="sm" :disabled="testing || sourceCount === 0" @click="test">{{ t('testLatency') }}</UiButton>
          <UiButton size="sm" :disabled="!ready || removedCount === 0" @click="restore">{{ t('restoreSources') }}</UiButton>
        </template>
        <template #panel="{ value }">
          <div v-if="viewOf(value)" class="category" :data-test="`category-${value}`">
            <div class="category-head">
              <UiInput
                class="category-name"
                inline
                :model-value="viewOf(value)!.name"
                :aria-label="t('categoryName')"
                :maxlength="CATEGORY_NAME_MAX_LENGTH"
                :disabled="!ready"
                data-test="category-name"
                @change="onRename(value, viewOf(value)!.name, $event)"
                @keydown.enter.prevent="blurTarget"
              />
              <UiSwitch
                class="category-hide"
                :label="t('autoHide')"
                :checked="viewOf(value)!.category.autoHide"
                :disabled="!ready || !settings.failover"
                @change="setAutoHide(value, $event)"
              />
              <UiButton variant="danger" size="sm" :disabled="!ready" data-test="delete-category" @click="onRemoveCategory(value)">
                {{ t('deleteCategory') }}
              </UiButton>
            </div>
            <div v-if="viewOf(value)!.rows.length > 0" class="list-frame">
              <table class="list-table sources" :aria-busy="testing">
                <thead>
                  <tr>
                    <th scope="col" class="select-cell">
                      <UiCheckbox
                        :checked="selectState(value) === 'all'"
                        :indeterminate="selectState(value) === 'some'"
                        :label="t('selectAll')"
                        :disabled="!ready"
                        data-test="select-all"
                        @change="selection.toggleAll"
                      />
                    </th>
                    <th scope="col">{{ t('sources') }}</th>
                    <th scope="col" class="metric">{{ t('latency') }}</th>
                    <th scope="col" class="metric">{{ t('ping') }}</th>
                    <th scope="col" class="bulk-cell">
                      <UiButton
                        v-if="value === activeCategory && selection.count.value > 0"
                        variant="danger"
                        size="sm"
                        :disabled="!ready"
                        data-test="delete-selected"
                        @click="confirming = true"
                      >
                        {{ t('deleteCount', { count: selection.count.value }) }}
                      </UiButton>
                      <span v-else class="sr-only">{{ t('actions') }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in viewOf(value)!.rows" :key="row.source.id">
                    <td class="select-cell">
                      <UiCheckbox
                        :checked="value === activeCategory && selection.has(row.source.id)"
                        :label="t('selectItem', { item: row.source.name })"
                        :disabled="!ready"
                        @change="selection.toggle(row.source.id, $event)"
                      />
                    </td>
                    <td>
                      <span class="source-text">
                        <span class="source-name">{{ row.source.name }}</span>
                        <span class="source-template">{{ row.source.template }}</span>
                      </span>
                    </td>
                    <td v-for="metric in row.metrics" :key="metric.kind" class="metric" :class="`is-${metric.tone}`">
                      {{ metric.text }}
                    </td>
                    <td class="source-action">
                      <UiButton
                        variant="danger"
                        size="sm"
                        :disabled="!ready"
                        :aria-label="t('deleteEntry', { source: row.source.name })"
                        @click="onRemoveSource($event, row.source.id, index)"
                      >
                        {{ t('delete') }}
                      </UiButton>
                    </td>
                  </tr>
                </tbody>
              </table>
              <UiBackToTop :label="t('backToTop')" />
            </div>
            <p v-else class="blankslate category-empty" data-test="sources-empty">{{ t('noSources') }}</p>

            <form v-if="value === activeCategory" class="source-form" @submit.prevent="onAdd(value)">
              <UiInput
                :ref="setNameInput"
                v-model="name"
                :aria-label="t('sourceName')"
                :placeholder="t('sourceName')"
                :maxlength="SOURCE_NAME_MAX_LENGTH"
              />
              <UiInput
                v-model="template"
                mono
                :aria-label="t('sourceTemplate')"
                :placeholder="TEMPLATE_PLACEHOLDER"
                :maxlength="SOURCE_TEMPLATE_MAX_LENGTH"
                spellcheck="false"
                autocomplete="off"
              />
              <UiButton type="submit" variant="primary" :disabled="!canAdd">{{ t('add') }}</UiButton>
            </form>
          </div>
        </template>
      </UiTabs>
      <p v-if="categoryTabs.length === 0" class="blankslate" data-test="categories-empty">{{ t('noCategories') }}</p>
    </section>
    <UiConfirm
      v-model:open="confirming"
      :title="t('deleteConfirm', { count: selection.count.value })"
      :confirm-label="t('delete')"
      :cancel-label="t('cancel')"
      @confirm="onRemoveSelected"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
  import type { UiSelectOption, UiTab } from '../../components/ui/types'
  import UiBackToTop from '../../components/ui/UiBackToTop.vue'
  import UiButton from '../../components/ui/UiButton.vue'
  import UiCheckbox from '../../components/ui/UiCheckbox.vue'
  import UiConfirm from '../../components/ui/UiConfirm.vue'
  import UiInput from '../../components/ui/UiInput.vue'
  import UiSelect from '../../components/ui/UiSelect.vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import UiTabs from '../../components/ui/UiTabs.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { useSelection, type SelectionState } from '../../components/useSelection'
  import { SOURCE_NAME_MAX_LENGTH, SOURCE_TEMPLATE_MAX_LENGTH } from '../../shared/accelerate'
  import { CATEGORY_NAME_MAX_LENGTH } from '../../shared/accelerate-categories'
  import TransferTools from './TransferTools.vue'
  import { useAccelerateSources, type AccelerateSwitch, type CategoryView, type LatencyState, type SourceRow } from './useAccelerateSources'
  import { useBackup } from './useBackup'

  type MetricKind = 'latency' | 'ping'
  type MetricTone = 'good' | 'fair' | 'slow' | 'muted'

  interface MetricView {
    readonly kind: MetricKind
    readonly text: string
    readonly tone: MetricTone
  }

  /** 分类的显示内容：各行带测速结果的显示 */
  interface CategoryItem extends Omit<CategoryView, 'rows'> {
    readonly rows: readonly (SourceRow & { readonly metrics: readonly MetricView[] })[]
  }

  const SWITCHES: readonly AccelerateSwitch[] = ['accelerate', 'accelerateImages', 'failover']
  const METRICS: readonly MetricKind[] = ['latency', 'ping']
  /** 延迟、Ping 的分档（毫秒）：不超过前者为快，不超过后者为一般，其余为慢 */
  const TONE_LIMITS: Readonly<Record<MetricKind, readonly [number, number]>> = {
    latency: [500, 1500],
    ping: [200, 600]
  }
  const TEMPLATE_PLACEHOLDER = 'https://example.com/{url}'
  /** 未测速 */
  const UNTESTED = '—'
  /** 新建分类的默认名称最多试到第几个 */
  const MAX_DEFAULT_NAME = 100

  const { t } = useI18n()
  const {
    settings,
    ready,
    categories,
    sourceCount,
    removedCount,
    testing,
    setSwitch,
    setReplace,
    addCategory,
    renameCategory,
    setAutoHide,
    removeCategory,
    moveCategory,
    addSource,
    removeSource,
    removeSources,
    restore,
    test
  } = useAccelerateSources()
  const { exportScope, importScope } = useBackup()

  const name = ref('')
  const template = ref('')
  /** 选中的分类；不存在（已删除）时为第一个 */
  const chosenCategory = ref('')
  /** 添加表单的名称输入框（只在选中的分类里） */
  let nameInput: InstanceType<typeof UiInput> | undefined

  function setNameInput(element: Element | ComponentPublicInstance | null): void {
    nameInput = (element as InstanceType<typeof UiInput> | null) ?? undefined
  }

  const replaceOptions = computed<readonly UiSelectOption[]>(() => [
    { value: '', label: t('replaceOff') },
    ...categories.value.map(view => ({ value: view.category.id, label: view.name }))
  ])
  const categoryTabs = computed<readonly UiTab[]>(() =>
    categories.value.map(view => ({ value: view.category.id, label: view.name, count: view.rows.length }))
  )
  const activeCategory = computed({
    get: () => {
      const ids = categories.value.map(view => view.category.id)
      return ids.includes(chosenCategory.value) ? chosenCategory.value : (ids[0] ?? '')
    },
    set: (value: string) => {
      chosenCategory.value = value
    }
  })
  const canAdd = computed(() => ready.value && activeCategory.value !== '' && template.value.trim() !== '')

  function toneOf(ms: number, kind: MetricKind): MetricTone {
    const [good, fair] = TONE_LIMITS[kind]
    if (ms <= good) return 'good'
    return ms <= fair ? 'fair' : 'slow'
  }

  function metricOf(state: LatencyState | undefined, kind: MetricKind): MetricView {
    if (!state) return { kind, text: UNTESTED, tone: 'muted' }
    if (state.testing) return { kind, text: t('testing'), tone: 'muted' }
    const result = kind === 'latency' ? state.result.latency : state.result.ping
    if (!result) return { kind, text: UNTESTED, tone: 'muted' }
    if (!result.ok) return { kind, text: t(result.reason === 'timeout' ? 'timeout' : 'failed'), tone: 'slow' }
    return { kind, text: `${result.ms} ms`, tone: toneOf(result.ms, kind) }
  }

  const items = computed<ReadonlyMap<string, CategoryItem>>(
    () =>
      new Map(
        categories.value.map(view => [
          view.category.id,
          { ...view, rows: view.rows.map(row => ({ ...row, metrics: METRICS.map(kind => metricOf(row.latency, kind)) })) }
        ])
      )
  )

  function viewOf(id: string): CategoryItem | undefined {
    return items.value.get(id)
  }

  /** 多选：只选选中的分类里的加速源，换了分类即清空 */
  const selection = useSelection(() => viewOf(activeCategory.value)?.rows.map(row => row.source.id) ?? [])
  /** 删除所选的确认框 */
  const confirming = ref(false)

  /** 分类的全选框：只有选中的分类有勾选 */
  function selectState(id: string): SelectionState {
    return id === activeCategory.value ? selection.state.value : 'none'
  }

  // 换了分类：未提交的加速源随之清空
  watch(activeCategory, () => {
    name.value = ''
    template.value = ''
  })

  function blurTarget(event: KeyboardEvent): void {
    if (event.target instanceof HTMLElement) event.target.blur()
  }

  /** 分类的名称输入框 */
  function nameField(id: string): HTMLInputElement | null {
    return document.querySelector<HTMLInputElement>(`[data-test="category-${CSS.escape(id)}"] [data-test="category-name"]`)
  }

  /** 改名：失败时（重名、清空自定义分类）输入框恢复原名 */
  async function onRename(id: string, current: string, event: Event): Promise<void> {
    const input = event.target
    if (!(input instanceof HTMLInputElement) || input.value.trim() === current) {
      if (input instanceof HTMLInputElement) input.value = current
      return
    }
    if (!(await renameCategory(id, input.value))) input.value = current
  }

  /** 新建分类的默认名称：分类 1、分类 2……中第一个未用的 */
  function defaultName(): string {
    const taken = new Set(categories.value.map(view => view.name.toLowerCase()))
    for (let index = 1; index < MAX_DEFAULT_NAME; index += 1) {
      const candidate = t('categoryDefault', { n: index })
      if (!taken.has(candidate.toLowerCase())) return candidate
    }
    return t('categoryDefault', { n: MAX_DEFAULT_NAME })
  }

  /** 新建分类：用默认名称，选中它，焦点移到名称（全选：直接输入即改名） */
  async function onNewCategory(): Promise<void> {
    const id = await addCategory(defaultName())
    if (!id) return
    chosenCategory.value = id
    await nextTick()
    const field = nameField(id)
    field?.focus()
    field?.select()
  }

  /** 删除分类：选中它前面的分类（删的是第一个时为新的第一个） */
  async function onRemoveCategory(id: string): Promise<void> {
    const ids = categories.value.map(view => view.category.id)
    const index = ids.indexOf(id)
    if (!(await removeCategory(id))) return
    const remaining = ids.filter(item => item !== id)
    chosenCategory.value = remaining[Math.max(0, index - 1)] ?? ''
  }

  /** 拖放、Alt + ← → 排序：即时写入，页面上的选项随之换顺序 */
  function onMoveCategory(id: string, index: number): void {
    // 选中的分类不随顺序变（没选过时选中的是第一个，排序后第一个换了）
    chosenCategory.value = activeCategory.value
    void moveCategory(id, index)
  }

  /** 删除所选的加速源。焦点移到该分类的全选框，删空时移到添加表单 */
  async function onRemoveSelected(): Promise<void> {
    const id = activeCategory.value
    if (!(await removeSources([...selection.selected.value]))) return
    selection.clear()
    await nextTick()
    const box = document.querySelector<HTMLInputElement>(`[data-test="category-${CSS.escape(id)}"] [data-test="select-all"] input`)
    if (box) box.focus()
    else nameInput?.focus()
  }

  async function onAdd(categoryId: string): Promise<void> {
    if (!canAdd.value || !(await addSource(categoryId, name.value, template.value))) return
    name.value = ''
    template.value = ''
    nameInput?.focus()
  }

  /** 删除加速源。焦点原在该行时移到同一分类中原位置这一行（没有时上一行）的删除按钮，删空时移到添加表单 */
  async function onRemoveSource(event: MouseEvent, id: string, index: number): Promise<void> {
    const button = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined
    const category = button?.closest('.category')
    const hadFocus = button !== undefined && button.contains(document.activeElement)
    if (!(await removeSource(id)) || !hadFocus) return
    await nextTick()
    const buttons = category?.querySelectorAll<HTMLButtonElement>('.source-action button')
    const next = buttons?.[Math.min(index, buttons.length - 1)]
    if (next) next.focus()
    else nameInput?.focus()
  }
</script>

<style scoped>
  /* 加速源与上方开关隔开 */
  .sources-section {
    margin-top: 12px;
  }

  .category {
    display: grid;
    gap: 12px;
  }

  .category-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .category-name {
    flex: 1 1 auto;
    min-width: 0;
    font-weight: 600;
  }

  .category-hide {
    flex: none;
  }

  .category-empty {
    padding: 16px;
  }

  /* 限高、表头见 options.css 的 .list-frame */
  .sources td {
    padding: 8px 12px;
    vertical-align: middle;
    transition: background-color var(--gcn-duration-fast) var(--gcn-ease);
  }

  .sources tbody tr + tr td {
    border-top: 1px solid var(--gcn-border-muted);
  }

  .sources tbody tr:hover td {
    background: var(--gcn-bg-muted);
  }

  .sources .select-cell {
    padding-right: 0;
  }

  .source-text {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .source-template {
    font-family: var(--gcn-font-mono);
    font-size: 12px;
    color: var(--gcn-fg-muted);
    overflow-wrap: anywhere;
  }

  /* 数值列：按内容收窄，右对齐，数字等宽 */
  .sources .metric {
    width: 1%;
    white-space: nowrap;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .is-good {
    color: var(--gcn-success-fg);
  }

  .is-fair {
    color: var(--gcn-attention-fg);
  }

  .is-slow {
    color: var(--gcn-danger-fg);
  }

  .is-muted {
    color: var(--gcn-fg-muted);
  }

  .source-action {
    width: 1%;
    white-space: nowrap;
  }

  /* 两列输入框可收窄到 0：固有宽度不撑开表单 */
  .source-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
    gap: 8px;
  }

  @media (max-width: 640px) {
    .category-head {
      flex-wrap: wrap;
    }

    .source-form {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .source-form > :first-child {
      grid-column: 1 / -1;
    }
  }
</style>
