// @vitest-environment-options { "url": "https://github.com/vuejs/core/issues/1" }
import { afterEach, describe, expect, it } from 'vitest'
import { createTranslator, type Translator, type TranslatorHost, type TranslatorOptions } from '../../../src/core/translator'
import { FIGHT_LIMIT, FIGHT_WINDOW_MS } from '../../../src/core/records'
import type { LocaleBundle, PageKey } from '../../../src/core/types'
import { mergeDictionaries } from '../../../src/locales/zh-CN/helpers'
import { $, settle, TEST_BUNDLE, testMatcher, texts } from './helpers'

const UNBLOCK = 'Are you sure you want to unblock '
/** 句型键超过上限的长句 */
const LONG = Array.from({ length: 61 }, () => 'word').join(' ')

/** tip 为 false 时不收录「Tip:」（更换匹配器后全量重译用） */
function sentenceBundle(tip = true): LocaleBundle {
  return [
    ...TEST_BUNDLE,
    [
      'common',
      {
        static: {
          merged: '已合并',
          'Type / to search': '按 / 搜索',
          'Press / to search': '按下 / 搜索',
          'Use the app': '使用应用',
          // 句中一段在解析分块前后都能单独命中（见「文档解析中」）
          versus: '对比',
          'versus the': '对比',
          ...(tip ? { 'Tip:': '提示：' } : {})
        },
        inline: [
          ['Are you sure you want to unblock {} from {}?', '确定要取消阻止 {} 访问 {} 吗？'],
          ['{#} merged', '{#} 个已合并'],
          ['{#} sample items', '{#} 个示例条目'],
          ['{} published {} {}', '{} 发布了 {} {}'],
          ['{} opened {} {}', '{} 打开了 {} 于 {}'],
          ['{} closed {} {}', '{} 关闭了 {} {}'],
          ['{} pushed {}.', '{} 推送了 {}.'],
          ['{} reviewed {}', '审查者 {} 审查了 {}'],
          ['{} Use the app now', '{} 立即使用应用'],
          ['Note {} Use the app now', '注意 {} 立即使用应用'],
          ['Type {} to search', '按 {} 搜索'],
          ['Compare {} versus the {}', '比较 {} 与 {}'],
          // 译文把槽位放在句首，首段写成空串
          ['Sample {} text', '{} 的示例文本'],
          // 末段只写成一个全角句号
          ['Sample {} text.', '示例文本 {}。'],
          ['Sample text {} more words', '示例文字 {} 更多文字'],
          // 末段另由 static 单独命中，与整句写入的译文不同
          ['Sample text {} Edit', '示例文本 {} 编辑项'],
          ['This response has been filtered because it violates {}.', '此回复违反了 {}，已被过滤。'],
          [`{} ${LONG}.`, '{} 长句。'],
          [/^\{\} deleted a comment from \{\} \{\}$/, '{} 删除了 {} 的评论 {}'],
          // 英文写在备选里：不含英文字母的「{} & {}」也能被正则命中
          [/^\{\} (?:and|&) \{\}$/, '{} 和 {}']
        ]
      }
    ],
    ['pulls', { inline: [['{} changed the base branch from {} to {}', '{} 将基础分支从 {} 更改为 {}']] }]
  ]
}

const BUNDLE = sentenceBundle()

/** 没有行内句规则的词典：页面范围内不按行内句处理（正式语言包 common 有行内句规则，各页面类型都按行内句处理） */
const PLAIN_BUNDLE: LocaleBundle = [...TEST_BUNDLE, ['common', { static: { 'Press / to search': '按下 / 搜索' } }]]

const ISSUES: readonly PageKey[] = ['common', 'repository', 'issues']

/** 可调时钟：互相覆盖的统计窗口按它计算，不依赖机器快慢 */
let now = 0
const CLOCK_HOST: TranslatorHost = {
  document,
  location: window.location,
  MutationObserver: window.MutationObserver,
  performance: { now: () => now }
}

let translator: Translator | undefined
const cleanups: (() => void)[] = []

function start(html: string, options: Partial<TranslatorOptions> = {}, pages = ISSUES): Translator {
  document.body.innerHTML = html
  translator = createTranslator({
    matcher: testMatcher(undefined, BUNDLE),
    host: window,
    collectUntranslated: true,
    resolvePages: () => pages,
    ...options
  })
  translator.start()
  return translator
}

const text = (selector: string): string => $(selector).textContent ?? ''
const misses = (t: Translator): string[] => t.drainUntranslated().map(([source]) => source)

function element(tag: string, content: string): HTMLElement {
  return Object.assign(document.createElement(tag), { textContent: content })
}

/** 多等几轮：变动回调（含本引擎写入引起的后续回调）全部完成 */
async function settleAll(): Promise<void> {
  for (let i = 0; i < 5; i++) await settle()
}

/** 文档解析中：只有 readyState 为 loading 时才按解析器追加处理 */
function parsing(): void {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
  cleanups.push(() => Reflect.deleteProperty(document, 'readyState'))
}

/** 页面脚本：文字一旦不是原文就改回原文，返回被改成的文字（用户看到的闪烁） */
function guardText(node: Text, original: string): string[] {
  const shown: string[] = []
  const guard = new MutationObserver(() => {
    if (node.data === original) return
    shown.push(node.data)
    node.data = original
  })
  guard.observe(node, { characterData: true })
  cleanups.push(() => guard.disconnect())
  return shown
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
  translator?.stop()
  translator = undefined
  document.body.innerHTML = ''
  now = 0
})

describe('行内句：整句命中', () => {
  it('译文按槽位切分写回各段；槽位元素不变，其中的文字照常处理；不记未翻译', () => {
    const t = start(`<div id="p">${UNBLOCK}<strong>octocat</strong> from <strong>Issues</strong>?</div>`)
    expect(texts($('#p'))).toEqual(['确定要取消阻止 ', ' 访问 ', ' 吗？'])
    expect($('#p strong:first-child').textContent).toBe('octocat')
    expect($('#p strong:last-child').textContent).toBe('议题')
    expect(t.drainUntranslated().map(([source]) => source)).toEqual(['octocat'])
  })

  it('整句开头保留原文空白；结尾是全角标点时不留空白', () => {
    start(`<div id="p">\n  ${UNBLOCK}<b>octocat</b> from <b>Sample</b>?\n</div>`)
    expect(texts($('#p'))).toEqual(['\n  确定要取消阻止 ', ' 访问 ', ' 吗？'])
  })

  it('整句结尾不是全角标点时保留原文空白', () => {
    start('<span id="n"><span>3</span> merged\n  </span>')
    expect(texts($('#n'))).toEqual([' 个已合并\n  '])
  })

  it('同一组内隔着注释的多个文本节点：译文写入第一个，其余置空', () => {
    start(`<div id="p">Are you sure you want to <!---->unblock <b>octocat</b> from <b>Sample</b>?</div>`)
    expect(texts($('#p'))).toEqual(['确定要取消阻止 ', '', ' 访问 ', ' 吗？'])
  })

  it('槽位元素末尾是本引擎译出的全角标点时，紧跟的段不留开头空白', () => {
    start('<p id="t"><span>Tip:</span> Use the app now</p>')
    expect(texts($('#t'))).toEqual(['立即使用应用'])
    expect(text('#t span')).toBe('提示：')
  })

  it('{#} 只对应只含数字（可带千分位）的叶子元素；{} 句型也匹配数字槽位', () => {
    start(
      '<span id="n"><span>3</span> merged</span><span id="u"><a href="/octocat">octocat</a> merged</span>' +
        '<span id="k"><span>1,234</span> merged</span><span id="v"><span><b>3</b></span> merged</span>' +
        '<div id="d"><a>octocat</a> deleted a comment from <a>monalisa</a> <span>12</span></div>'
    )
    expect(texts($('#n'))).toEqual([' 个已合并'])
    expect(texts($('#u'))).toEqual([' 已合并'])
    expect(texts($('#k'))).toEqual([' 个已合并'])
    expect(texts($('#v'))).toEqual([' 已合并'])
    expect(text('#d')).toBe('octocat 删除了 monalisa 的评论 12')
  })

  it('只在所属页面类型生效', () => {
    const html = '<p id="b"><b>octocat</b> changed the base branch from <b>main</b> to <b>dev</b></p>'
    start(html)
    expect(text('#b')).toBe('octocat changed the base branch from main to dev')
    translator?.stop()
    start(html, {}, ['common', 'repository', 'pulls'])
    expect(text('#b')).toBe('octocat 将基础分支从 main 更改为 dev')
  })

  it('原文与译文都只有空白的段保持原文', () => {
    start('<div id="p"><a>octocat</a> published <span>GHSA-1</span>\n <span>today</span></div>')
    expect(texts($('#p'))).toEqual([' 发布了 ', '\n '])
  })

  it('整句写入的半角标点不按孤立标点转换', () => {
    start('<p id="p"><b>octocat</b> pushed <b>main</b>.</p>')
    expect(texts($('#p'))).toEqual([' 推送了 ', '.'])
  })

  it('停止后还原', () => {
    const t = start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?</div>`)
    t.stop()
    translator = undefined
    expect(text('#p')).toBe(`${UNBLOCK}octocat from Sample?`)
  })
})

describe('行内句：mergeDictionaries 合并的词典', () => {
  it('各子词典的行内句都整句翻译，句中文字不记未翻译', () => {
    const pulls = mergeDictionaries(
      { static: { Sample: '示例' } },
      { inline: [['{} merged {} into {}', '{} 将 {} 合并到 {}']] },
      {},
      { inline: [['{} closed this', '{} 关闭了此项']] }
    )
    const t = start(
      '<p id="m"><a>octocat</a> merged <b>Sample</b> into <b>main</b></p><p id="c"><a>octocat</a> closed this</p>',
      { matcher: testMatcher(undefined, [['pulls', pulls]]) },
      ['common', 'pulls']
    )
    expect(text('#m')).toBe('octocat 将 示例 合并到 main')
    expect(text('#c')).toBe('octocat 关闭了此项')
    expect(misses(t)).toEqual(['octocat', 'main'])
  })
})

describe('行内句：不构成或未命中', () => {
  it('未命中：各段照常翻译、逐段记未翻译', () => {
    const t = start('<div id="p">Random words <b>octocat</b> more words <b>Issues</b></div>')
    expect(text('#p')).toBe('Random words octocat more words 议题')
    expect(t.drainUntranslated().map(([source]) => source)).toEqual(['Random words', 'octocat', 'more words'])
  })

  it('某段需写入但该处没有文本节点：照常逐段处理', () => {
    start('<p id="r"><b>octocat</b> reviewed <b>Sample</b></p>')
    expect(text('#r')).toBe('octocat reviewed Sample')
  })

  it('未命中的宿主按文档顺序处理：元素末尾译出全角标点后，紧跟的文字不留开头空白', () => {
    start('<p id="t">Note <span>Tip:</span> Use the app</p>')
    expect(texts($('#t'))).toEqual(['Note ', '使用应用'])
  })

  it('含 kbd 的宿主按 kbd 句子处理', () => {
    start('<span id="k">Type <kbd>/</kbd> to search</span>')
    expect(texts($('#k'))).toEqual(['按 ', ' 搜索'])
  })

  it('子节点过多的宿主不按行内句处理', () => {
    start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?${'<!---->'.repeat(40)}</div>`)
    expect(text('#p')).toBe(`${UNBLOCK}octocat from Sample?`)
  })

  it('句型键过长时不按行内句处理', () => {
    start(`<p id="l"><b>octocat</b> ${LONG}.</p>`)
    expect(text('#l')).toBe(`octocat ${LONG}.`)
  })
})

describe('行内句：变动', () => {
  const FILTERED = '<div id="p">This response has been filtered because it violates <a href="/site-policy">Sample policies</a>.</div>'

  it('页面改写其中一段后整句重算；不再命中时各段照常处理并记未翻译', async () => {
    const t = start(FILTERED)
    expect(text('#p')).toBe('此回复违反了 Sample policies，已被过滤。')
    ;($('#p').lastChild as Text).data = ' rule.'
    await settle()
    expect(text('#p')).toBe('This response has been filtered because it violates Sample policies rule.')
    expect(t.drainUntranslated().map(([source]) => source)).toEqual([
      'Sample policies',
      'This response has been filtered because it violates',
      'rule.'
    ])
  })

  it('换成另一句型后，原文与译文都只有空白的段写回原文', async () => {
    start('<div id="p"><a>octocat</a> opened <span>GHSA-1</span> <span>today</span></div>')
    expect(text('#p')).toBe('octocat 打开了 GHSA-1 于 today')
    ;($('#p a').nextSibling as Text).data = ' closed '
    await settle()
    expect(text('#p')).toBe('octocat 关闭了 GHSA-1 today')
  })

  it('不再命中后，整句中的半角标点按孤立标点处理', async () => {
    start('<p id="p"><b>octocat</b> pushed <b>main</b>.</p>')
    expect(texts($('#p'))).toEqual([' 推送了 ', '.'])
    ;($('#p b').nextSibling as Text).data = ' Close '
    await settle()
    expect(text('#p')).toBe('octocat 关闭 main。')
  })

  it('曾按整句写入、现在不命中的宿主：全量重译时按文档顺序处理', async () => {
    const t = start('<p id="t">Note <span>Tip:</span> Use the app now</p>')
    // 槽位里的「提示：」在整句写入之后才译出：轮末按最终语境去掉紧跟的空白
    expect(text('#t')).toBe('注意 提示：立即使用应用')
    ;($('#t').lastChild as Text).data = ' Use the app'
    await settle()
    expect(text('#t')).toBe('Note 提示：使用应用')
    // 新匹配器不收录「Tip:」：先还原槽位里的文字，再处理紧跟的段
    t.setMatcher(testMatcher(undefined, sentenceBundle(false)))
    expect(text('#t')).toBe('Note Tip: 使用应用')
  })

  it('移除槽位后整句重算', async () => {
    start('<div id="p"><span>octocat</span> published <span>GHSA-1</span> <span>today</span></div>')
    expect(text('#p')).toBe('octocat 发布了 GHSA-1 today')
    $('#p').lastElementChild!.remove()
    await settle()
    expect(text('#p')).toBe('octocat published GHSA-1 ')
  })

  it('插入槽位后构成整句', async () => {
    start('<div id="p"><span>octocat</span> published <span>GHSA-1</span></div>')
    expect(text('#p')).toBe('octocat published GHSA-1')
    $('#p').append(' ', Object.assign(document.createElement('span'), { textContent: 'today' }))
    await settle()
    expect(texts($('#p'))).toEqual([' 发布了 ', ' '])
  })

  it('宿主末尾插入与文字不相邻的槽位后构成整句', async () => {
    start('<div id="p"><span>octocat</span> published <span>GHSA-1</span></div>')
    $('#p').append(element('span', 'today'))
    await settle()
    expect(texts($('#p'))).toEqual([' 发布了 '])
  })

  it('槽位文字在数字与非数字之间变化（原地改写、换文本节点）后整句重算；槽位文字照常处理', async () => {
    start('<span id="n"><span id="c">3</span> merged</span>')
    expect(texts($('#n'))).toEqual([' 个已合并'])
    ;($('#c').firstChild as Text).data = 'Issues'
    await settle()
    expect(texts($('#n'))).toEqual([' 已合并'])
    expect(text('#c')).toBe('议题')
    ;($('#c').firstChild as Text).data = '12'
    await settle()
    expect(texts($('#n'))).toEqual([' 个已合并'])
    $('#c').firstChild!.replaceWith('1.2k')
    await settle()
    expect(texts($('#n'))).toEqual([' 已合并'])
  })

  it('空槽位填入数字后按数字槽位整句写入', async () => {
    start('<span id="n"><span id="c"></span> merged</span>')
    expect(texts($('#n'))).toEqual([' 已合并'])
    $('#c').append('3')
    await settle()
    expect(texts($('#n'))).toEqual([' 个已合并'])
  })

  it('槽位换入、换出元素子节点后整句重算：数字槽位只算叶子元素', async () => {
    start('<span id="n"><span id="c">3</span> merged</span>')
    $('#c').replaceChildren(Object.assign(document.createElement('b'), { textContent: '3' }))
    await settle()
    expect(texts($('#n'))).toEqual([' 已合并'])
    $('#c').replaceChildren('3')
    await settle()
    expect(texts($('#n'))).toEqual([' 个已合并'])
  })

  it('槽位文字变化但标记不变（数字 → 数字）时不重算宿主', async () => {
    const matcher = testMatcher(undefined, BUNDLE)
    const keys: string[] = []
    start('<span id="n"><span id="c">3</span> merged</span>', {
      matcher: {
        ...matcher,
        translateInline: (key, pages) => {
          keys.push(key)
          return matcher.translateInline(key, pages)
        }
      }
    })
    const queried = keys.length
    expect(queried).toBeGreaterThan(0)
    ;($('#c').firstChild as Text).data = '1,234'
    $('#c').append('5')
    await settle()
    expect(text('#c')).toBe('1,2345')
    expect(keys).toHaveLength(queried)
    expect(texts($('#n'))).toEqual([' 个已合并'])
  })

  it.each([
    ['插入后构成整句', '<span>today</span>', [' 发布了 ', ' ']],
    ['插入后仍不构成整句', '<span>today</span><span>Sample</span>', [' published ', ' ']]
  ])('子节点有增删且其中文字同批处理（%s）：宿主只判断一次，查句型与全新页面相同', async (_, added, shown) => {
    const matcher = testMatcher(undefined, BUNDLE)
    const keys: string[] = []
    const options = {
      matcher: {
        ...matcher,
        translateInline: (key: string, pages: readonly PageKey[]) => {
          keys.push(key)
          return matcher.translateInline(key, pages)
        }
      }
    }
    const html = '<div id="p"><span>octocat</span> published <span>GHSA-1</span></div>'
    // 全新页面首次翻译时查过的句型键
    start(html.replace('</div>', ` ${added}</div>`), options)
    const fresh = keys.splice(0)
    translator?.stop()
    start(html, options)
    keys.length = 0
    $('#p').insertAdjacentHTML('beforeend', ` ${added}`)
    await settle()
    expect(texts($('#p'))).toEqual(shown)
    expect(fresh.length).toBeGreaterThan(0)
    expect(keys).toEqual(fresh)
  })

  it('没有按行内句判断过的宿主（kbd 句子）：其中元素的文字变化只处理该元素', async () => {
    const matcher = testMatcher(undefined, BUNDLE)
    const sources: string[] = []
    start('<span id="k">Type <kbd>/</kbd> to search <b>Sample</b></span>', {
      matcher: {
        ...matcher,
        translateRaw: (raw, pages) => {
          sources.push(raw)
          return matcher.translateRaw(raw, pages)
        }
      }
    })
    expect(texts($('#k'))).toEqual(['按 ', ' 搜索 '])
    sources.length = 0
    ;($('#k b').firstChild as Text).data = 'Issues'
    await settle()
    expect(sources).toEqual(['Issues'])
    expect(text('#k b')).toBe('议题')
  })

  it('停止后重新开始按全新页面处理：之前判断时记下的槽位标记不再使用', async () => {
    const matcher = testMatcher(undefined, BUNDLE)
    const sources: string[] = []
    const t = start('<span id="n"><span id="c">3</span> merged</span>', {
      matcher: {
        ...matcher,
        translateRaw: (raw, pages) => {
          sources.push(raw)
          return matcher.translateRaw(raw, pages)
        }
      }
    })
    t.stop()
    // 停止期间宿主换入 kbd：重新开始后按 kbd 句子处理，不按行内句判断
    $('#n').append(Object.assign(document.createElement('kbd'), { textContent: 'K' }))
    t.start()
    expect(texts($('#n'))).toEqual([' 已合并'])
    sources.length = 0
    ;($('#c').firstChild as Text).data = 'octocat'
    await settle()
    expect(sources).toEqual(['octocat'])
  })

  it('曾按整句写入的宿主换入 kbd 后按 kbd 句子处理，kbd 片段以外的各段同样照常重算', async () => {
    start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?</div>`)
    $('#p b').replaceWith(Object.assign(document.createElement('kbd'), { textContent: 'octocat' }))
    await settle()
    expect(text('#p')).toBe(`${UNBLOCK}octocat from Sample?`)
  })

  it('页面反复改回原文时有限次后停止，各段回到原文；不把句中各段记为未翻译', async () => {
    const t = start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?</div>`)
    const node = $('#p').firstChild as Text
    const guard = new MutationObserver(() => {
      if (node.data !== UNBLOCK) node.data = UNBLOCK
    })
    guard.observe(node, { characterData: true })
    cleanups.push(() => guard.disconnect())
    node.data = UNBLOCK
    for (let i = 0; i < 5; i++) await settle()
    expect(text('#p')).toBe(`${UNBLOCK}octocat from Sample?`)
    const batches = t.batches
    expect(batches).toBeLessThan(FIGHT_LIMIT * 3)
    await settle()
    expect(t.batches).toBe(batches)
    expect(t.drainUntranslated().map(([source]) => source)).toEqual(['octocat', 'Sample'])
  })

  it('页面改回原文、次数未超上限时照常整句写入', async () => {
    start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?</div>`)
    const node = $('#p').firstChild as Text
    for (let i = 0; i < FIGHT_LIMIT - 2; i++) {
      node.data = UNBLOCK
      await settle()
      expect(node.data).toBe('确定要取消阻止 ')
    }
  })
})

describe('行内句：文档解析中', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'readyState')
  })

  it('整句末段被追加标点：保持整句译文，停止后还原整句原文', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    const t = start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?</div>`)
    ;($('#p').lastChild as Text).appendData('…')
    await settle()
    expect(texts($('#p'))).toEqual(['确定要取消阻止 ', ' 访问 ', ' 吗？…'])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe(`${UNBLOCK}octocat from Sample?…`)
  })

  it('句中一段先到并单独译出，解析器追加其余文字、插入后续槽位：按原文加追加部分预判，整句译出；停止后还原', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    // 解析器分块：第一块止于「 versus」（static 单独命中），下一块追加「 the 」并插入第二个槽位
    const t = start('<div id="p">Compare <b>A</b> versus</div>')
    expect(text('#p')).toBe('Compare A 对比')
    ;($('#p').lastChild as Text).appendData(' the ')
    $('#p').append(element('b', 'B'))
    await settle()
    expect(text('#p')).toBe('比较 A 与 B')
    t.stop()
    translator = undefined
    expect(text('#p')).toBe('Compare A versus the B')
  })
})

describe('行内句：整句宿主里无字母、无记录的段被原地改写', () => {
  it('末尾标点改写后不再命中：各段照常处理', async () => {
    start('<p id="p"><b>octocat</b> pushed <b>main</b>.</p><p id="q"><b>octocat</b> pushed <b>main</b>.</p>')
    ;($('#p').lastChild as Text).data = '!'
    ;($('#q').lastChild as Text).data = ''
    await settle()
    expect(texts($('#p'))).toEqual([' pushed ', '!'])
    expect(texts($('#q'))).toEqual([' pushed ', ''])
  })

  it('保持原文的空白段改写后不再命中：各段照常处理，标点不按残留译文转换', async () => {
    start('<div id="p"><a>octocat</a> published <span>GHSA-1</span> <span>today</span></div>')
    expect(texts($('#p'))).toEqual([' 发布了 ', ' '])
    ;($('#p span').nextSibling as Text).data = ', '
    await settle()
    expect(texts($('#p'))).toEqual([' published ', ', '])
  })

  it('不是整句的宿主改写标点后构成整句', async () => {
    start('<p id="p"><b>octocat</b> pushed <b>main</b>!</p>')
    expect(texts($('#p'))).toEqual([' pushed ', '!'])
    ;($('#p').lastChild as Text).data = '.'
    await settle()
    expect(texts($('#p'))).toEqual([' 推送了 ', '.'])
  })

  it('末段只写成一个全角句号：不再命中后不按孤立标点处理，写回原文', async () => {
    start('<p id="p">Sample <b>octocat</b> text.</p>')
    expect(texts($('#p'))).toEqual(['示例文本 ', '。'])
    ;($('#p').firstChild as Text).data = 'Other '
    await settle()
    expect(text('#p')).toBe('Other octocat text.')
  })
})

describe('行内句：原文与译文都只有空白的段紧邻全角标点', () => {
  /** 两个槽位之间只有空白 */
  const SPACED: LocaleBundle = [...BUNDLE, ['common', { static: { '(optional)': '（可选）' }, inline: [['Note {} {}', '注意 {} {}']] }]]

  it.each([
    [
      '前一槽位末尾是全角标点',
      '<p id="h">Note <span>Tip:</span> <span>Use the app</span></p>',
      '注意 提示：使用应用',
      'Note Tip: Use the app'
    ],
    [
      '后一槽位开头是全角标点',
      '<p id="h">Note <span>Use the app</span> <span>(optional)</span></p>',
      '注意 使用应用（可选）',
      'Note Use the app (optional)'
    ]
  ])('%s：该段置空；同词典全量重译、重新开启收集、宿主追加注释（整句重算）后仍置空', async (_, html, shown, source) => {
    const t = start(html, { matcher: testMatcher(undefined, SPACED) })
    expect(text('#h')).toBe(shown)
    t.setMatcher(testMatcher(undefined, SPACED))
    expect(text('#h')).toBe(shown)
    t.setFeatures({ collectUntranslated: false })
    t.setFeatures({ collectUntranslated: true })
    expect(text('#h')).toBe(shown)
    $('#h').append(document.createComment(''))
    await settle()
    expect(text('#h')).toBe(shown)
    t.stop()
    translator = undefined
    expect(text('#h')).toBe(source)
  })
})

describe('行内句：曾按整句写入的宿主换入 kbd 后按 kbd 句子处理', () => {
  const TYPE = '<span id="k">Type <b>/</b> to search</span>'
  /** 只有半角标点的段整句写成全角标点：末段「.」写成「。」，两个槽位间的「, 」写成「，」 */
  const PUNCT: LocaleBundle = [
    ...BUNDLE,
    [
      'common',
      {
        inline: [
          ['Sample {} {}.', '示例 {} {}。'],
          ['Edit {}, {}', '编辑 {}，{}']
        ]
      }
    ]
  ]

  /** 页面把槽位元素换成 kbd：宿主改按 kbd 句子处理（整句命中，换入当轮不记未翻译） */
  async function swapToKbd(t: Translator): Promise<void> {
    expect(texts($('#k'))).toEqual(['按 ', ' 搜索'])
    $('#k b').replaceWith(element('kbd', '/'))
    await settle()
    expect(texts($('#k'))).toEqual(['按 ', ' 搜索'])
    expect(misses(t)).toEqual([])
  }

  it('kbd 片段以外的各段照常重算；只记 kbd 整句未翻译', async () => {
    const t = start(`<div id="p">${UNBLOCK}<b>octocat</b> from <b>Sample</b>?</div>`)
    expect(misses(t)).toEqual(['octocat', 'Sample'])
    $('#p b').replaceWith(element('kbd', 'octocat'))
    await settle()
    expect(text('#p')).toBe(`${UNBLOCK}octocat from Sample?`)
    expect(misses(t)).toEqual(['Are you sure you want to unblock octocat from'])
  })

  it('关闭再开启未翻译收集：整句已译出的 kbd 句子不记未翻译', async () => {
    const t = start(TYPE)
    await swapToKbd(t)
    t.setFeatures({ collectUntranslated: false })
    t.setFeatures({ collectUntranslated: true })
    await settle()
    expect(texts($('#k'))).toEqual(['按 ', ' 搜索'])
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(text('#k')).toBe('Type / to search')
  })

  it('页面反复把首段改回原文：未超上限时每次恢复整句译文，超过后保持原文；停止后还原', async () => {
    const t = start(TYPE, { host: CLOCK_HOST })
    await swapToKbd(t)
    const head = $('#k').firstChild as Text
    for (let i = 1; i <= FIGHT_LIMIT; i++) {
      head.data = 'Type '
      await settle()
      expect(texts($('#k')), `第 ${i} 次改回`).toEqual(['按 ', ' 搜索'])
    }
    head.data = 'Type '
    await settle()
    expect(texts($('#k'))).toEqual(['Type ', ' to search'])
    t.stop()
    translator = undefined
    expect(text('#k')).toBe('Type / to search')
  })

  it('页面把首段改成另一句已收录的 kbd 句子：整句译出，不把片段记为未翻译', async () => {
    const t = start(TYPE)
    await swapToKbd(t)
    ;($('#k').firstChild as Text).data = 'Press '
    await settle()
    expect(texts($('#k'))).toEqual(['按下 ', ' 搜索'])
    expect(misses(t)).toEqual([])
  })

  it('页面把末段改成未收录的说法：各段回到原文，只记整句未翻译', async () => {
    const t = start(TYPE)
    await swapToKbd(t)
    ;($('#k').lastChild as Text).data = ' to jump'
    await settle()
    expect(texts($('#k'))).toEqual(['Type ', ' to jump'])
    expect(misses(t)).toEqual(['Type / to jump'])
  })

  it.each([
    [
      // 首段与 kbd 之间隔着另一个槽位：首段照常重算回原文，句号的语境不再是中文
      '语境不是中文时写回半角',
      '<p id="h">Sample <i>octocat</i> <b>main</b>.</p>',
      ['示例 ', ' ', '。'],
      'Sample octocat main.',
      'Sample octocat main.'
    ],
    ['两侧都是元素时用顿号', '<p id="h">Edit <b>octocat</b>, <b>main</b></p>', ['编辑 ', '，'], '编辑 octocat、main', 'Edit octocat, main']
  ])('紧邻 kbd 的标点段：整句写入的全角标点按孤立标点重算（%s），与全新处理相同；停止后还原', async (_, html, written, shown, source) => {
    const t = start(html, { matcher: testMatcher(undefined, PUNCT) })
    expect(texts($('#h'))).toEqual(written)
    // 页面把第一个 b 槽位换成 kbd
    const slot = $('#h b')
    slot.replaceWith(element('kbd', slot.textContent ?? ''))
    await settleAll()
    expect(text('#h')).toBe(shown)
    t.stop()
    expect(text('#h')).toBe(source)
    // 重新开始：按全新页面处理
    t.start()
    expect(text('#h')).toBe(shown)
  })
})

describe('行内句：曾按整句写入的宿主不再构成行内句', () => {
  /** 命中「Sample {} text」：首段写成空串 */
  const SAMPLE = '<p id="p">Sample <b>octocat</b> text</p>'
  /** 命中「Sample text {} more words」 */
  const SENTENCE = '<p id="p">Sample text <b>octocat</b> more words</p>'
  /** 页面随后换上的文字：不含元素，词典未收录 */
  const PLAIN = 'Sample text only'

  it('文档解析中移除槽位、同批末段被追加标点：各段回到原文，不丢字', async () => {
    parsing()
    const t = start(SAMPLE)
    expect(texts($('#p'))).toEqual(['', ' 的示例文本'])
    expect(misses(t)).toEqual(['octocat'])
    $('#p b').remove()
    ;($('#p').lastChild as Text).appendData('.')
    await settle()
    expect(texts($('#p'))).toEqual(['Sample ', ' text.'])
    expect(misses(t)).toEqual(['Sample', 'Sample text.'])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe('Sample  text.')
  })

  it('文档解析中移除唯一槽位后，解析器给单独译出的末段追加标点、又插入槽位与新文字：新文字照常记未翻译；停止后还原', async () => {
    parsing()
    const t = start('<p id="p">Sample text <b>octocat</b> Edit</p>')
    const p = $('#p')
    expect(texts(p)).toEqual(['示例文本 ', ' 编辑项'])
    expect(misses(t)).toEqual(['octocat'])
    // 不再构成行内句：各段照常处理，末段单独译出
    $('#p b').remove()
    await settle()
    expect(texts(p)).toEqual(['Sample text ', ' 编辑'])
    expect(misses(t)).toEqual(['Sample text'])
    // 下一个解析任务：省略号接在末段译文上，随后插入槽位与新文字
    ;(p.lastChild as Text).appendData('…')
    p.append(element('i', 'hubot'), ' more words')
    await settleAll()
    expect(texts(p)).toEqual(['Sample text ', ' 编辑…', ' more words'])
    expect(misses(t)).toEqual(['hubot', 'more words'])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe('Sample text  Edit…hubot more words')
  })

  it('页面反复改回原文超过上限后移除槽位：各段立即照常重算，仍显示原文的段记未翻译', async () => {
    const t = start(SAMPLE, { host: CLOCK_HOST })
    expect(texts($('#p'))).toEqual(['', ' 的示例文本'])
    const head = $('#p').firstChild as Text
    for (let i = 1; i <= FIGHT_LIMIT; i++) {
      head.data = 'Sample '
      await settle()
      expect(texts($('#p')), `第 ${i} 次改回`).toEqual(['', ' 的示例文本'])
    }
    head.data = 'Sample '
    await settle()
    // 超过上限：各段回到原文，不把句中各段记为未翻译
    expect(text('#p')).toBe('Sample octocat text')
    expect(misses(t)).toEqual(['octocat'])
    $('#p b').remove()
    await settle()
    expect(text('#p')).toBe('Sample  text')
    expect(misses(t)).toEqual(['text'])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe('Sample  text')
  })

  it('页面坚持改回首段、超过上限后移除唯一槽位：各段照常处理，未命中的段记未翻译；停止后保持原文', async () => {
    const t = start(SENTENCE, { host: CLOCK_HOST })
    const p = $('#p')
    expect(texts(p)).toEqual(['示例文字 ', ' 更多文字'])
    expect(misses(t)).toEqual(['octocat'])
    const head = p.firstChild as Text
    const shown = guardText(head, 'Sample text ')
    head.data = 'Sample text '
    await settleAll()
    expect(shown).toEqual(Array.from({ length: FIGHT_LIMIT }, () => '示例文字 '))
    expect(texts(p)).toEqual(['Sample text ', ' more words'])
    // 仍是整句宿主：句中各段不记未翻译
    expect(misses(t)).toEqual([])
    $('#p b').remove()
    await settle()
    expect(texts(p)).toEqual(['Sample text ', ' more words'])
    expect(misses(t)).toEqual(['more words'])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe('Sample text  more words')
  })

  it('页面用 textContent 整体改写成不含元素、未收录的文字：显示新文字，记未翻译；停止后不变', async () => {
    const t = start(SENTENCE)
    expect(texts($('#p'))).toEqual(['示例文字 ', ' 更多文字'])
    expect(misses(t)).toEqual(['octocat'])
    $('#p').textContent = PLAIN
    await settle()
    expect(text('#p')).toBe(PLAIN)
    expect(misses(t)).toEqual([PLAIN])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe(PLAIN)
  })

  it('页面移除槽位与末段、改写首段（复用原文本节点）：显示新文字，记未翻译；停止后不变', async () => {
    const t = start(SENTENCE)
    expect(misses(t)).toEqual(['octocat'])
    const p = $('#p')
    const head = p.firstChild as Text
    $('#p b').remove()
    p.lastChild?.remove()
    head.data = PLAIN
    await settle()
    expect(texts(p)).toEqual([PLAIN])
    expect(misses(t)).toEqual([PLAIN])
    t.stop()
    translator = undefined
    expect(text('#p')).toBe(PLAIN)
  })

  it('对照：未按整句写入的宿主同样改写后记未翻译；新页面直接是同样的文字时也记', async () => {
    const t = start('<p id="p">Random words <b>octocat</b> more words</p>')
    expect(misses(t)).toEqual(['Random words', 'octocat', 'more words'])
    $('#p').textContent = PLAIN
    await settle()
    expect(text('#p')).toBe(PLAIN)
    expect(misses(t)).toEqual([PLAIN])
    t.stop()
    const fresh = start(`<p id="p">${PLAIN}</p>`)
    expect(misses(fresh)).toEqual([PLAIN])
  })

  it('对照：新页面直接是计数归零后的文字时记未翻译', () => {
    const t = start('<span id="n">No sample items</span>')
    expect(texts($('#n'))).toEqual(['No sample items'])
    expect(misses(t)).toEqual(['No sample items'])
  })

  it('计数归零：数字元素被移除、文字换成另一句英文；新文字记未翻译，停止后保持页面文字', async () => {
    const t = start('<span id="n"><span>3</span> sample items</span>')
    expect(text('#n')).toBe('3 个示例条目')
    expect(misses(t)).toEqual([])
    // 页面重新渲染：去掉计数元素，原文本节点改成另一句英文
    const label = $('#n').lastChild as Text
    $('#n span').remove()
    label.data = 'No sample items'
    await settleAll()
    expect(texts($('#n'))).toEqual(['No sample items'])
    expect(misses(t)).toEqual(['No sample items'])
    t.stop()
    translator = undefined
    expect(text('#n')).toBe('No sample items')
  })

  it('停止期间页面放回槽位并改写末段：重新开始时按文档顺序处理，与首次翻译相同', async () => {
    const t = start('<p id="t">Note <span>Tip:</span> Use the app now</p>')
    expect(text('#t')).toBe('注意 提示：立即使用应用')
    // 页面移除槽位元素：不再构成行内句，各段回到原文
    $('#t span').remove()
    await settle()
    expect(text('#t')).toBe('Note  Use the app now')
    t.stop()
    // 停止期间页面重新渲染：放回槽位元素，末段换成未收录句型的文字
    const p = $('#t')
    p.insertBefore(element('span', 'Tip:'), p.lastChild)
    ;(p.lastChild as Text).data = ' Use the app'
    t.start()
    // 元素末尾是译出的全角标点，紧跟的文字不留开头空白（同一 DOM 首次翻译的结果）
    expect(texts(p)).toEqual(['Note ', '使用应用'])
    expect(text('#t span')).toBe('提示：')
    await settle()
    expect(texts(p)).toEqual(['Note ', '使用应用'])
    t.stop()
    translator = undefined
    expect(text('#t')).toBe('Note Tip: Use the app')
  })
})

describe('行内句：停止后再开始', () => {
  it('停用期间改动过的旧整句宿主按全新页面处理（按文档顺序记未翻译）', () => {
    const t = start('<p id="t">Note <span>Sample</span> Use the app now</p>')
    expect(texts($('#t'))).toEqual(['注意 ', ' 立即使用应用'])
    t.stop()
    ;($('#t').firstChild as Text).data = 'Notes '
    $('#t span').textContent = 'Other'
    misses(t)
    t.start()
    expect(misses(t)).toEqual(['Notes', 'Other', 'Use the app now'])
  })
})

describe('行内句：子节点过多的容器在其他位置增删子节点', () => {
  /** 列表条目：只含数字，不翻译、不记未翻译；41 个条目使容器子节点超过上限 */
  const ITEMS = Array.from({ length: 41 }, (_, i) => `<span>${i + 1}</span>`).join('')

  it('页面坚持显示原文、已暂停翻译：容器末尾追加条目后不重新翻译，不再与页面互相覆盖；停止后保持原文', async () => {
    const t = start(`<div id="list">Newest${ITEMS}</div>`, { host: CLOCK_HOST })
    const node = $('#list').firstChild as Text
    expect(node.data).toBe('最新')
    const shown = guardText(node, 'Newest')
    node.data = 'Newest'
    await settleAll()
    expect(node.data).toBe('Newest')
    expect(shown).toEqual(Array.from({ length: FIGHT_LIMIT }, () => '最新'))
    // 统计窗口过去之后，页面在列表末尾追加条目（与这段文字不相邻）
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    $('#list').append(element('span', '42'))
    await settleAll()
    expect(shown).toEqual([])
    expect(node.data).toBe('Newest')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(node.data).toBe('Newest')
  })

  it('文档解析中：末尾文字被追加省略号后保持译文；解析器继续往容器追加条目时不变；停止后还原', async () => {
    parsing()
    const t = start(`<div id="list">${ITEMS}Edit</div>`)
    const list = $('#list')
    const node = list.lastChild as Text
    expect(node.data).toBe('编辑')
    // 同一解析任务：给末尾文字追加省略号，随后插入下一个条目
    node.appendData('…')
    list.append(element('span', '42'))
    await settleAll()
    expect(node.data).toBe('编辑…')
    // 下一个解析任务：继续追加条目（与这段文字不相邻）
    list.append(element('span', '43'))
    await settleAll()
    expect(node.data).toBe('编辑…')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(node.data).toBe('Edit…')
  })

  it('文档解析中：开头的已译文字被追加标点后，解析器一次插入大量条目，之后再追加：显示与计数不变，停止后还原', async () => {
    parsing()
    const t = start('<div id="list">Edit</div>')
    const list = $('#list')
    const lead = list.firstChild as Text
    expect(lead.data).toBe('编辑')
    lead.appendData('…')
    list.insertAdjacentHTML('beforeend', ITEMS)
    await settle()
    expect(lead.data).toBe('编辑…')
    expect(t.translatedCount()).toBe(1)
    expect(misses(t)).toEqual([])
    list.append(element('span', '42'))
    await settle()
    expect(lead.data).toBe('编辑…')
    expect(t.translatedCount()).toBe(1)
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(lead.data).toBe('Edit…')
    expect(list.childNodes).toHaveLength(43)
  })
})

describe('行内句：整段不含英文字母的宿主', () => {
  /** 英文句子：两个链接之间是「 and 」，命中正则句型 */
  const ENGLISH = '<p id="en"><a>octocat</a> and <a>monalisa</a></p>'
  /** 整段不含英文字母：两个链接之间是「 & 」，与句型的另一个备选同形 */
  const CHINESE = '<p id="zh"><a>示例甲</a> &amp; <a>示例乙</a></p>'

  it('英文句子整句写入；不含英文字母的同形宿主保持原样；停止后都是原文', () => {
    const t = start(ENGLISH + CHINESE)
    expect(texts($('#en'))).toEqual([' 和 '])
    expect(text('#zh')).toBe('示例甲 & 示例乙')
    expect(misses(t)).toEqual(['octocat', 'monalisa'])
    t.stop()
    translator = undefined
    expect(text('#en')).toBe('octocat and monalisa')
    expect(text('#zh')).toBe('示例甲 & 示例乙')
  })

  it('页面插入不含英文字母的宿主：保持原样，不记未翻译', async () => {
    const t = start('<div id="list"></div>')
    $('#list').insertAdjacentHTML('beforeend', CHINESE)
    await settle()
    expect(text('#zh')).toBe('示例甲 & 示例乙')
    expect(misses(t)).toEqual([])
  })

  it('直接文字没有英文的宿主（含只有空白的容器）不拆组建键：只有直接文字含英文的宿主查句型', () => {
    const matcher = testMatcher(undefined, BUNDLE)
    const keys: string[] = []
    start(`<div id="layout"><span>1</span> <span>2</span></div><p id="zh"><a>示例甲</a> 与 <a>示例乙</a></p>${ENGLISH}`, {
      matcher: {
        ...matcher,
        translateInline: (key, pages) => {
          keys.push(key)
          return matcher.translateInline(key, pages)
        }
      }
    })
    // 英文宿主的句型键（预判与取得原文后各查一次）；其余宿主不查
    expect(keys.length).toBeGreaterThan(0)
    expect(keys.filter(key => !key.includes('and'))).toEqual([])
    expect(texts($('#en'))).toEqual([' 和 '])
  })
})

describe('行内句：文档解析中句子分两块到达，此前未按整句写入', () => {
  const NBSP = String.fromCharCode(0xa0)
  const PARSING_BUNDLE: LocaleBundle = [
    ...TEST_BUNDLE,
    [
      'common',
      {
        static: {
          'Sample text': '示例文本',
          'more words': '更多文字',
          'Tip:': '提示：',
          // 产品名保留英文
          'GitHub Marketplace': 'GitHub Marketplace'
        },
        inline: [
          // 两个槽位之间是可变的标签名（捕获后原样带入译文）
          [/^Sample text \{\} (.+) \{\} more words$/, '示例文本 {} $1 {} 更多文字'],
          ['GitHub Marketplace: {} Sample text', 'GitHub Marketplace：{} 示例文本'],
          ['{} GitHub Marketplace: {} Sample text', '{} GitHub Marketplace：{} 示例文本']
        ]
      }
    ]
  ]
  const link = (label: string): HTMLElement => Object.assign(element('a', label), { href: '/octocat' })

  function startParsing(html: string): Translator {
    parsing()
    return start(html, { matcher: testMatcher(undefined, PARSING_BUNDLE), host: CLOCK_HOST })
  }

  it('已译文字被追加标点、同一解析任务又插入槽位与后续文字：后续文字照常翻译，停止后还原整句原文', async () => {
    // 第一块：只有一个槽位，不构成句型，各段逐段翻译
    const t = startParsing('<p id="p">Sample text <b>main</b> Issues</p>')
    const p = $('#p')
    expect(texts(p)).toEqual(['示例文本 ', ' 议题'])
    // 第二块（同一解析任务）：标签名后的「: 」接在已译文字上，随后插入链接与句子其余部分；
    // 按当前文字预判的句型键带着译文加标点，仍被带 (.+) 的正则句型命中
    ;(p.lastChild as Text).appendData(': ')
    const tail = document.createTextNode(' more words')
    p.append(link('octocat'), tail)
    await settleAll()
    expect(tail.data).toBe(' 更多文字')
    expect(text('#p b')).toBe('main')
    expect(text('#p a')).toBe('octocat')
    t.stop()
    translator = undefined
    expect(p.textContent).toBe('Sample text main Issues: octocat more words')
  })

  it.each([
    ['产品名用 &nbsp; 连接', `<p id="p">GitHub${NBSP}Marketplace</p>`, `GitHub${NBSP}Marketplace: octocat Sample text`],
    [
      '产品名紧跟在译出全角标点的元素后',
      '<p id="p"><span>Tip:</span> GitHub Marketplace</p>',
      'Tip: GitHub Marketplace: octocat Sample text'
    ]
  ])(
    '保留英文的译文与原文只差空白、仍留下写入记录（%s）：被追加标点后插入的后续文字照常翻译，停止后还原原文',
    async (_, html, restored) => {
      const t = startParsing(html)
      const p = $('#p')
      // 第二块（同一解析任务）：冒号接在已写入的产品名后，随后是链接与后续文字；按当前文字预判命中句型
      ;(p.lastChild as Text).appendData(': ')
      p.append(link('octocat'), ' Sample text')
      await settleAll()
      expect(t.batches).toBeGreaterThan(0)
      expect(texts(p)[1]).toBe(' 示例文本')
      expect(p.textContent).not.toContain('Sample text')
      expect(misses(t)).toEqual(['octocat'])
      t.stop()
      translator = undefined
      expect(p.textContent).toBe(restored)
    }
  )

  it('已按整句写入的宿主：末段被追加标点、同一解析任务又插入槽位与后续文字：已写入的显示不变，各组照常重算，后续文字照常翻译', async () => {
    const t = startParsing('<p id="p">Sample text <b>main</b> Issues <a>octocat</a> more words</p>')
    const p = $('#p')
    expect(texts(p)).toEqual(['示例文本 ', ' Issues ', ' 更多文字'])
    // 第二块（同一解析任务）：省略号接在末段译文上，随后插入链接与后续文字
    ;(p.lastChild as Text).appendData('…')
    const tail = document.createTextNode(' Sample text')
    p.append(link('hubot'), tail)
    await settleAll()
    expect(texts(p)).toEqual(['示例文本 ', ' 议题 ', ' 更多文字…', ' 示例文本'])
    expect(misses(t)).toEqual(['main', 'octocat', 'hubot'])
    t.stop()
    translator = undefined
    expect(p.textContent).toBe('Sample text main Issues octocat more words…hubot Sample text')
  })
})

describe.each([
  ['没有行内句规则', PLAIN_BUNDLE, false],
  ['有行内句规则', BUNDLE, true]
] as const)('行内句：子节点不多的容器增删子节点、改写条目文字（页面范围内%s）', (_, bundle, inline) => {
  function startWith(html: string): Translator {
    return start(html, { matcher: testMatcher(undefined, bundle), host: CLOCK_HOST })
  }

  it('前提：页面范围内的行内句规则', () => {
    expect(testMatcher(undefined, bundle).hasInline(ISSUES)).toBe(inline)
  })

  it.each([
    ['末尾追加条目', (list: Element) => list.append(element('span', '3'))],
    ['移除末尾条目', (list: Element) => list.lastElementChild!.remove()],
    [
      '末尾条目的文字由数字改为非数字',
      (list: Element) => {
        ;(list.lastElementChild!.firstChild as Text).data = '9+'
      }
    ]
  ])('页面坚持显示原文、已暂停翻译：统计窗口过后%s，不重算不相邻的文字，不再与页面互相覆盖', async (_, change) => {
    const t = startWith('<div id="list">Newest<span>1</span><span>2</span></div>')
    const list = $('#list')
    const node = list.firstChild as Text
    expect(node.data).toBe('最新')
    const shown = guardText(node, 'Newest')
    node.data = 'Newest'
    await settleAll()
    expect(node.data).toBe('Newest')
    expect(shown).toEqual(Array.from({ length: FIGHT_LIMIT }, () => '最新'))
    // 统计窗口过去之后，页面增删容器里的条目（与这段文字不相邻）
    now += FIGHT_WINDOW_MS * 2
    shown.length = 0
    const batches = t.batches
    change(list)
    await settleAll()
    expect(shown).toEqual([])
    expect(node.data).toBe('Newest')
    expect(t.batches).toBe(batches + 1)
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(node.data).toBe('Newest')
  })

  it('文档解析中：文字被追加省略号后保持译文，解析器继续往父元素追加条目时不改回英文、不记未翻译；停止后还原', async () => {
    parsing()
    const t = startWith('<div id="list"><span>1</span>Edit</div>')
    const list = $('#list')
    const node = list.lastChild as Text
    expect(node.data).toBe('编辑')
    // 同一解析任务：给末尾文字追加省略号，随后插入下一个条目
    node.appendData('…')
    list.append(element('span', '2'))
    await settleAll()
    expect(node.data).toBe('编辑…')
    // 之后的解析任务：继续追加条目（与这段文字不相邻）
    list.append(element('span', '3'))
    await settleAll()
    list.append(element('span', '4'))
    await settleAll()
    expect(node.data).toBe('编辑…')
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(list.textContent).toBe('1Edit…234')
  })

  it('文档解析中：kbd 句子末段被追加省略号后保持整句译文，解析器继续往宿主追加条目时不变；停止后还原', async () => {
    parsing()
    const t = startWith('<p id="k">Press <kbd>/</kbd> to search</p>')
    const host = $('#k')
    expect(texts(host)).toEqual(['按下 ', ' 搜索'])
    ;(host.lastChild as Text).appendData('…')
    host.append(element('span', '1'))
    await settleAll()
    expect(texts(host)).toEqual(['按下 ', ' 搜索…'])
    host.append(element('span', '2'))
    await settleAll()
    expect(texts(host)).toEqual(['按下 ', ' 搜索…'])
    expect(misses(t)).toEqual([])
    t.stop()
    translator = undefined
    expect(host.textContent).toBe('Press / to search…12')
  })
})
