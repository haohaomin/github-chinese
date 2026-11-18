// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues" }
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator, type TranslatorHost } from '../../../src/core/translator'
import type { InlineRule, LocaleBundle, PageKey, RegExpRule } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import { settle, TEST_BUNDLE, testMatcher } from './helpers'
import { defineFakeRelativeTime, settleTime, type FakeRelativeTime } from './time-element'

/**
 * 首轮处理（start）上限：happy-dom 下2万个文本节点。
 * 单独运行约150 ms，并行负载下300 ms 以上，覆盖率插桩加满载时700 ms 左右；预算只防数量级退化
 */
const BUDGET_MS = 1000
const TARGET_TEXT_NODES = 20_000
/** 反复构建2万节点页面的用例：解析占大头，满载时超过默认的5秒 */
const HEAVY_TIMEOUT_MS = 30_000
/**
 * 大块纯代码区对首轮耗时的影响（与同规模、不查找的基线之比；不注册观察）。
 * 修复前在整个文档里查找重新进入区域，约3～6倍；现在约1倍
 */
const CODE_RATIO_BUDGET = 2
/** 比值取各轮最好成绩之比：页面每轮重建（happy-dom 按节点缓存选择器结果） */
const CODE_RATIO_ROUNDS = 5
/** 纯代码区的一行：5个元素 */
const CODE_LINE = '<div class="react-file-line"><span>const</span> <span>x</span> <span>=</span> <span>1</span></div>'
/**
 * 行内句规则对首轮耗时的影响（与同一页面、无行内句规则之比）。有规则时每个直接文字含英文的宿主都要拆组建键查句型，
 * 直接文字没有英文的容器不查；约1.2～1.4倍，预算只防数量级退化
 */
const INLINE_RATIO_BUDGET = 2
const INLINE_RATIO_ROUNDS = 5
const INLINE_ROWS = 1000
/** 都不会命中的行内句规则数：字符串句型按放宽后的键分组查找，正则句型逐条试 */
const INLINE_STRING_RULES = 400
const INLINE_REGEXP_RULES = 20
/**
 * 标签表对首轮耗时的影响（与同一页面、无标签表之比）。有标签表时每个最外层忽略区域根多一次按特征的标签区域判断，
 * 命中的再找唯一的文字查表；预算只防数量级退化
 */
const LABEL_RATIO_BUDGET = 2
const LABEL_RATIO_ROUNDS = 5
const LABEL_ROWS = 500
/** 名称表、说明表：只收行里出现的默认标签名与说明 */
const LABEL_BUNDLE: LocaleBundle = [
  ...TEST_BUNDLE,
  [
    'common',
    {
      labels: { bug: '缺陷', question: '疑问' },
      labelDescriptions: { 'Further information is requested': '需要更多信息' }
    }
  ]
]

/**
 * 不注册观察的 MutationObserver：happy-dom 的 observe 按子树逐节点注册，耗时随节点数线性增长，
 * 两边都被它主导时比值区分不出查找范围的退化
 */
class IdleObserver extends MutationObserver {
  override observe(): void {}
}

const IDLE_HOST: TranslatorHost = { document, location, MutationObserver: IdleObserver }

/** 接近 GitHub 列表页的结构：链接、计数、按钮、相对时间、被忽略的用户链接、React 分隔注释 */
function row(i: number): string {
  return `<li class="Box-row js-issue-row d-flex" id="issue_${i}">
    <a class="Link--primary h4" href="/vuejs/core/issues/${i}" data-hovercard-type="issue">Bug report ${i}</a>
    <span class="opened-by">#${i} opened <relative-time datetime="2026-01-01T00:00:00Z">Jan 1</relative-time> by <a class="Link--muted" data-hovercard-type="user" href="/u">user${i}</a></span>
    <span class="Counter" title="Comments">3</span>
    <button type="button" class="btn-octicon" aria-label="Copy">Open</button>
    <span class="text-small">Updated <!-- -->3<!-- --> days ago</span>
  </li>`
}

function buildPage(rows: number): string {
  return `<ul class="js-navigation-container">${Array.from({ length: rows }, (_, i) => row(i)).join('')}</ul>`
}

/** 列表行加上标签：筛选按钮里的 React 标签令牌（默认、自定义交替）、经典标签与说明提示 */
function labelRow(i: number): string {
  const labels =
    '<button type="button" class="filterLink__Cq0Hs1"><span class="prc-Token-TokenBase-te5-F prc-Token-IssueLabel-2IazM">' +
    '<span class="prc-Token-TokenTextContainer-cOUaD"><span class="prc-Text-Text-9mHv3">' +
    `${i % 2 === 0 ? 'bug' : 'scope: vapor'}</span></span></span></button>` +
    `<a id="label-${i}" class="IssueLabel" href="/vuejs/core/labels/question">question</a>` +
    `<tool-tip for="label-${i}" popover="manual" data-type="description" class="sr-only" role="tooltip">` +
    'Further information is requested</tool-tip>'
  return row(i).replace('</li>', `${labels}</li>`)
}

function countTextNodes(root: Node): number {
  let count = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) count++
  return count
}

/** 测试词典加上不会命中的行内句规则：strings 条字符串句型、regexps 条正则句型 */
function withInline(strings: number, regexps: number): LocaleBundle {
  const inline: InlineRule[] = []
  for (let i = 0; i < strings; i++) inline.push([`Sample rule ${i} {} number {}`, `示例规则 ${i} {} 编号 {}`])
  for (let i = 0; i < regexps; i++) {
    inline.push([new RegExp(`^Sample pattern ${i} \\{\\} (.+) \\{\\}$`), `示例句型 ${i} {} $1 {}`])
  }
  return [...TEST_BUNDLE, ['common', { inline }]]
}

let translator: Translator | undefined

/** 换上 html 后首轮处理的耗时（不注册观察） */
function timeStart(html: string, bundle: LocaleBundle = TEST_BUNDLE): number {
  translator?.stop()
  document.body.innerHTML = html
  translator = createTranslator({ matcher: testMatcher(undefined, bundle), host: IDLE_HOST })
  const started = performance.now()
  translator.start()
  return performance.now() - started
}

afterEach(() => {
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
})

describe('性能', () => {
  it(`2万个文本节点首轮处理 < ${BUDGET_MS}ms`, { timeout: HEAVY_TIMEOUT_MS }, () => {
    document.body.innerHTML = buildPage(10)
    const perRow = countTextNodes(document.body) / 10
    const rows = Math.ceil(TARGET_TEXT_NODES / perRow)
    const timings: number[] = []
    // 每轮都是全新页面的首轮处理；取最好成绩，降低并行测试的干扰
    for (let round = 0; round < 3; round++) {
      translator?.stop()
      document.body.innerHTML = buildPage(rows)
      translator = createTranslator({ matcher: testMatcher(), host: window, collectUntranslated: true })
      const started = performance.now()
      translator.start()
      timings.push(performance.now() - started)
    }
    expect(countTextNodes(document.body)).toBeGreaterThanOrEqual(TARGET_TEXT_NODES)
    expect(document.querySelector('button')!.textContent).toBe('未解决')
    expect(document.querySelector('.text-small')!.firstChild!.textContent).toBe('3天前更新')
    expect(Math.min(...timings)).toBeLessThan(BUDGET_MS)
  })

  it('批量插入2万个文本节点后一次回调处理完', async () => {
    document.body.innerHTML = '<main></main>'
    translator = createTranslator({ matcher: testMatcher(), host: window })
    translator.start()
    const main = document.querySelector('main')!
    const before = translator.batches
    main.innerHTML = buildPage(1250)
    await settle()
    expect(main.querySelector('button')!.textContent).toBe('未解决')
    expect(translator.batches - before).toBeLessThanOrEqual(2)
  })

  it(
    `界面含忽略元素时不在2万元素的纯代码区里查找：首轮耗时为不查找基线的 ${CODE_RATIO_BUDGET} 倍以内`,
    { timeout: HEAVY_TIMEOUT_MS },
    () => {
      const code = CODE_LINE.repeat(4000)
      const page = buildPage(40)
      // 基线：界面没有忽略元素（去掉用户链接的标记），代码在跳过标签内，不会查找
      const plain = page.replaceAll(' data-hovercard-type="user"', '')
      const codeTimings: number[] = []
      const baseTimings: number[] = []
      const timeCode = (): void => {
        codeTimings.push(timeStart(`${page}<div class="react-code-lines">${code}</div>`))
      }
      const timeBase = (): void => {
        baseTimings.push(timeStart(`${plain}<pre>${code}</pre>`))
      }
      // 两边交替先后，减少负载起伏带来的偏差
      for (let round = 0; round < CODE_RATIO_ROUNDS; round++) {
        for (const time of round % 2 === 0 ? [timeCode, timeBase] : [timeBase, timeCode]) time()
      }
      expect(document.querySelector('button')!.textContent).toBe('未解决')
      expect(Math.min(...codeTimings) / Math.min(...baseTimings)).toBeLessThan(CODE_RATIO_BUDGET)
    }
  )

  it(`有大量行内句规则时首轮耗时为无规则时的 ${INLINE_RATIO_BUDGET} 倍以内`, { timeout: HEAVY_TIMEOUT_MS }, () => {
    const page = buildPage(INLINE_ROWS)
    const inline = withInline(INLINE_STRING_RULES, INLINE_REGEXP_RULES)
    const inlineTimings: number[] = []
    const baseTimings: number[] = []
    const timeInline = (): void => {
      inlineTimings.push(timeStart(page, inline))
    }
    const timeBase = (): void => {
      baseTimings.push(timeStart(page))
    }
    // 两边交替先后，减少负载起伏带来的偏差
    for (let round = 0; round < INLINE_RATIO_ROUNDS; round++) {
      for (const time of round % 2 === 0 ? [timeInline, timeBase] : [timeBase, timeInline]) time()
    }
    expect(document.querySelector('button')!.textContent).toBe('未解决')
    expect(Math.min(...inlineTimings) / Math.min(...baseTimings)).toBeLessThan(INLINE_RATIO_BUDGET)
  })

  it(`${LABEL_ROWS} 行带标签的列表：有标签表时首轮耗时为无标签表时的 ${LABEL_RATIO_BUDGET} 倍以内`, { timeout: HEAVY_TIMEOUT_MS }, () => {
    const page = `<ul class="js-navigation-container">${Array.from({ length: LABEL_ROWS }, (_, i) => labelRow(i)).join('')}</ul>`
    const labelTimings: number[] = []
    const baseTimings: number[] = []
    const timeLabels = (): void => {
      labelTimings.push(timeStart(page, LABEL_BUNDLE))
      expect(document.querySelector('.IssueLabel')!.textContent).toBe('疑问')
    }
    const timeBase = (): void => {
      baseTimings.push(timeStart(page))
      expect(document.querySelector('.IssueLabel')!.textContent).toBe('question')
    }
    // 两边交替先后，减少负载起伏带来的偏差
    for (let round = 0; round < LABEL_RATIO_ROUNDS; round++) {
      for (const time of round % 2 === 0 ? [timeLabels, timeBase] : [timeBase, timeLabels]) time()
    }
    expect(Math.min(...labelTimings) / Math.min(...baseTimings)).toBeLessThan(LABEL_RATIO_BUDGET)
  })
})

/**
 * 孤立标点的轮末重算：链接之间用标点分隔的长列表。计的是读取兄弟节点（nextSibling、previousSibling）与调用 closest 的次数，
 * 不受机器快慢影响。曾经每个标点都向两侧逐个兄弟查找语境、并按忽略选择器查找祖先，整列重算是平方级：
 * 改一个链接的文字，列表所在的元素整列重算
 */
const LIST_SMALL = 50
const LIST_LARGE = 400
/** 列表长度放大8倍时读取次数的放大上限：线性约8倍，平方级约64倍 */
const LIST_GROWTH_BUDGET = 16

const LIST_BUNDLE: LocaleBundle = [['common', { static: { 'Contributed to': '贡献于' } }]]

/** n 个链接：wrapped 为 <span>, </span> 分隔（各段都包在元素里），否则为带译文标签、直接文字 ", " 分隔 */
function linkList(n: number, wrapped: boolean): string {
  const links = Array.from({ length: n }, (_, i) => `<a href="/u${i}"><span>user${i}</span></a>`)
  const list = wrapped ? `<span id="list">${links.join('<span>, </span>')}</span>` : `<p id="list">Contributed to ${links.join(', ')}</p>`
  return `<main><div><div>${list}</div></div></main>`
}

/** 定义了 name 访问器的原型（happy-dom 定义在 Node 基类上） */
function accessorOwner(name: string): Node {
  let proto: object | null = Object.getPrototypeOf(document.createTextNode(''))
  while (proto && !Object.getOwnPropertyDescriptor(proto, name)) proto = Object.getPrototypeOf(proto)
  if (!proto) throw new Error(`没有访问器：${name}`)
  return proto as Node
}

interface ReadCounts {
  readonly siblings: number
  readonly closest: number
}

/** task 期间读取兄弟节点与调用 closest 的次数 */
function countReads(task: () => void): ReadCounts {
  const next = vi.spyOn(accessorOwner('nextSibling'), 'nextSibling', 'get')
  const previous = vi.spyOn(accessorOwner('previousSibling'), 'previousSibling', 'get')
  const closest = vi.spyOn(Element.prototype, 'closest')
  try {
    task()
    return { siblings: next.mock.calls.length + previous.mock.calls.length, closest: closest.mock.calls.length }
  } finally {
    next.mockRestore()
    previous.mockRestore()
    closest.mockRestore()
  }
}

/** 首轮处理、改第一个链接的文字后一批变动，各自的读取次数 */
function listReads(n: number, wrapped: boolean): { start: ReadCounts; batch: ReadCounts } {
  translator?.stop()
  document.body.innerHTML = linkList(n, wrapped)
  const engine = createTranslator({ matcher: createMatcher(LIST_BUNDLE), host: window })
  translator = engine
  const start = countReads(() => engine.start())
  ;(document.querySelector('#list a span')!.firstChild as Text).data = 'user0x'
  const batch = countReads(() => engine.flush())
  return { start, batch }
}

describe('孤立标点轮末重算', () => {
  it.each([
    ['各段都包在元素里（<span>, </span> 分隔）', true],
    ['带译文标签、直接文字分隔', false]
  ])('%s的长列表：首轮与改一个链接的文字后，读取兄弟节点的次数随列表长度线性增长', (_, wrapped) => {
    const small = listReads(LIST_SMALL, wrapped)
    const large = listReads(LIST_LARGE, wrapped)
    expect(document.querySelector('#list')!.textContent).toMatch(wrapped ? /^user0x, user1, / : /^贡献于 user0x、user1、/)
    expect(large.start.siblings).toBeLessThan(small.start.siblings * LIST_GROWTH_BUDGET)
    expect(large.batch.siblings).toBeLessThan(small.batch.siblings * LIST_GROWTH_BUDGET)
  })

  it('显示不变的标点不按忽略选择器查找祖先：改一个链接的文字后，closest 的调用次数与列表长度无关', () => {
    const small = listReads(LIST_SMALL, true)
    const large = listReads(LIST_LARGE, true)
    expect(large.batch.closest).toBe(small.batch.closest)
  })
})

/** 记录试过的文本：同一文本只计一次（字符串替换会经 replace 再执行一次） */
class TriedRegExp extends RegExp {
  readonly tried = new Set<string>()

  override exec(text: string): RegExpExecArray | null {
    this.tried.add(text)
    return super.exec(text)
  }
}

/** 议题页上未命中词条、要进入正则阶段的文字：用户内容与带数字的界面文字 */
const REGEXP_STAGE_TEXTS = [
  'Fix memory leak in reactivity',
  'chore(deps): update dependency vite to v6',
  'feat(compiler): support v-bind shorthand',
  'Hydration mismatch when using Teleport',
  'good first issue',
  'scope: compiler',
  'octocat',
  '12 comments',
  'Updated 3 days ago',
  '3 tasks done',
  '#15928 opened on Oct 10 by octocat',
  'Assigned to nobody',
  '5 participants',
  'Milestone 3.6',
  'Linked 2 pull requests',
  'v3.5.13',
  '1 of 2 tasks',
  'Opened by octocat',
  'Reproduction link',
  'Vue version 3.5.12'
]

describe('正则阶段执行条数', () => {
  it('真实词典：议题作用域下按首字符与字面前缀筛选，执行的规则不到逐条执行的三分之一', () => {
    const rules: TriedRegExp[] = []
    const bundle: LocaleBundle = zhCN.map(([key, dict]) => [
      key,
      {
        ...dict,
        regexp: dict.regexp?.map(([pattern, replacement]): RegExpRule => {
          const counting = new TriedRegExp(pattern.source, pattern.flags)
          rules.push(counting)
          return [counting, replacement]
        })
      }
    ])
    const scope: PageKey[] = ['common', 'repository', 'issues']
    const matcher = createMatcher(bundle)
    for (const text of REGEXP_STAGE_TEXTS) matcher.translate(text, scope)
    const inScope = bundle.filter(([key]) => scope.includes(key)).reduce((sum, [, dict]) => sum + (dict.regexp?.length ?? 0), 0)
    const tried = rules.reduce((sum, rule) => sum + rule.tried.size, 0)
    expect(inScope).toBeGreaterThan(0)
    expect(tried).toBeLessThan((REGEXP_STAGE_TEXTS.length * inScope) / 3)
  })
})

/**
 * 时间元素定时刷新：补过空格的元素每次刷新都派发事件（元素比较的是刷新前的显示文字），
 * 每个事件判断元素是否位于跳过区域。修复前逐次按忽略选择器查找祖先，耗时随规则数增长（400条额外规则约5倍）；
 * 现在按元素沿用判断，约1倍
 */
const TIME_RATIO_BUDGET = 2
const TIME_RATIO_ROUNDS = 5
const TIME_COUNT = 300
/** 每个时间元素的嵌套层数 */
const TIME_DEPTH = 12
/** 额外的忽略规则数：都不会命中 */
const EXTRA_IGNORES = 400

function timePage(): string {
  let html = ''
  for (let i = 0; i < TIME_COUNT; i++) {
    let item = '<relative-time datetime="2026-10-26T02:03:00Z"></relative-time>'
    for (let depth = 0; depth < TIME_DEPTH; depth++) {
      item = `<div class="d-flex level-${depth}"><span>Sample text ${i}</span>${item}</div>`
    }
    html += item
  }
  return `<main>${html}</main>`
}

/** 测试词典加上 n 条不会命中的全局忽略规则 */
function withIgnores(n: number): LocaleBundle {
  const ignore = Array.from({ length: n }, (_, i) => `.sample-ignore-${i}:not(:has(.sample-flag-${i}))`)
  return [...TEST_BUNDLE, ['common', { ignore }]]
}

/** 全部时间元素刷新一次的耗时 */
function timeTick(times: readonly FakeRelativeTime[]): number {
  const started = performance.now()
  for (const element of times) element.tick()
  return performance.now() - started
}

// 假时间元素注册后对整个文件生效：放在最后，前面的用例按未定义的 relative-time 计时
describe('时间元素定时刷新', () => {
  beforeAll(defineFakeRelativeTime)

  it(
    `耗时不随忽略规则增长：${EXTRA_IGNORES} 条额外规则时为无额外规则的 ${TIME_RATIO_BUDGET} 倍以内`,
    { timeout: HEAVY_TIMEOUT_MS },
    async () => {
      document.body.innerHTML = timePage()
      await settleTime()
      const engine = createTranslator({ matcher: testMatcher(), host: window })
      translator = engine
      engine.start()
      await settleTime()
      const times = [...document.querySelectorAll('relative-time')] as FakeRelativeTime[]
      expect(times).toHaveLength(TIME_COUNT)
      expect(times[0]!.renderedText).toBe('3天前')
      const baseTimings: number[] = []
      const extraTimings: number[] = []
      /** 换上 bundle 后刷新一次预热，再取三次中的最好成绩 */
      const measure = async (bundle: LocaleBundle, timings: number[]): Promise<void> => {
        engine.setMatcher(createMatcher(bundle))
        await settle()
        timeTick(times)
        timings.push(Math.min(timeTick(times), timeTick(times), timeTick(times)))
      }
      const timeBase = (): Promise<void> => measure(TEST_BUNDLE, baseTimings)
      const timeExtra = (): Promise<void> => measure(withIgnores(EXTRA_IGNORES), extraTimings)
      // 两边交替先后，减少负载起伏带来的偏差
      for (let round = 0; round < TIME_RATIO_ROUNDS; round++) {
        for (const time of round % 2 === 0 ? [timeBase, timeExtra] : [timeExtra, timeBase]) await time()
      }
      expect(times[TIME_COUNT - 1]!.renderedText).toBe('3天前')
      expect(Math.min(...extraTimings) / Math.min(...baseTimings)).toBeLessThan(TIME_RATIO_BUDGET)
    }
  )
})
