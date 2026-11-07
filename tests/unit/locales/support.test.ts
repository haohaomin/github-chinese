import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import { zhCN } from '../../../src/locales/zh-CN/index'
import cnSupport from '../../../src/locales/zh-CN/support'
import { zhTW } from '../../../src/locales/zh-TW/index'
import twSupport from '../../../src/locales/zh-TW/support'

/** 期望译文：[简体, 繁体] */
type Pair = readonly [cn: string, tw: string]

/** 支持站点的作用域（见 core/page.ts） */
const SUPPORT: readonly PageKey[] = ['common', 'support']

interface Locale {
  readonly name: string
  readonly index: 0 | 1
  readonly dict: PageDictionary
  readonly own: Matcher
  readonly full: Matcher
}

const LOCALES: readonly Locale[] = [
  { name: 'zh-CN', index: 0, dict: cnSupport, own: createMatcher([['support', cnSupport]]), full: createMatcher(zhCN) },
  { name: 'zh-TW', index: 1, dict: twSupport, own: createMatcher([['support', twSupport]]), full: createMatcher(zhTW) }
]

/** 举报页（结构同 help.github.com/contact/report-abuse 的 React 组件：说明里的链接、类别选项、表单标签） */
const REPORT_HTML = `
  <main id="start-of-content" class="container-lg pb-4">
    <h1 id="title" class="border-bottom h1 my-3">Report abuse or spam</h1>
    <section id="form-instructions">
      <p id="intro">Code collaboration should be safe for everyone, so we take abuse and harassment seriously at GitHub. We want to hear about harmful behavior on the site that violates GitHub's <a href="https://github.com/site/terms">Terms of Service</a>. Let us know about a user or content you're concerned with. Rest assured, we'll keep your identifying information private.</p>
      <h4 id="block-title">Want to block a user?</h4>
      <p id="block">You can hide a user's content and notifications. Read more about blocking a user from your <a href="/articles/blocking-a-user-from-your-personal-account">personal account</a> or <a href="/articles/blocking-a-user-from-your-organization">organization</a>.</p>
    </section>
    <form aria-label="Report abuse form">
      <p id="regarding">You are submitting a report regarding <i>octocat</i>.</p>
      <label id="category-label">Please select a category for your issue:</label>
      <button id="category" type="button">Select a category</button>
      <ul>
        <li><span id="option-spam">Spam or inauthentic Activity</span><span id="option-spam-description">Inauthentic use of the service such as rank abuse, star abuse, the use of bots, fake accounts or other deceptive uses of the service.</span></li>
        <li><span id="option-none">I don't see my problem here</span><span id="option-none-description">None of the above.</span></li>
      </ul>
      <p id="copyright">If you believe that content on GitHub infringes a valid copyright you own, please see our <a href="https://docs.github.com/site-policy/content-removal-policies/dmca-takedown-policy">Copyright - DMCA Takedown Policy</a> and our <a href="https://docs.github.com/site-policy/content-removal-policies/guide-to-submitting-a-dmca-takedown-notice">Guide to Submitting a DMCA Takedown Notice</a>.</p>
      <p id="search">Find additional answers and resources by <a href="/">searching our support site</a>.</p>
      <label id="url-label">Please provide a direct and working link to the content or behavior on GitHub you wish to report.</label>
      <input id="url" placeholder="e.g. https://github.com/monalisa/octocat/blob/master/file.md">
      <label id="comments-label">What would you like to report?</label>
      <textarea id="comments" placeholder="Please provide as much detail as possible about the account or behavior you're reporting. It's especially helpful to include specific examples in the form of URLs or screenshots."></textarea>
      <button id="submit" type="submit">Submit</button>
    </form>
  </main>`

/** 首页（help.github.com/）：选项卡片、Copilot 链接（含隐藏的“在新标签页中打开”）、状态横幅 */
const LANDING_HTML = `
  <h2 id="heading">How can we help you?</h2>
  <p id="choose">Choose one of the following options to get help with your request</p>
  <span id="copilot-option">Ask Copilot in GitHub Support</span>
  <p id="copilot-description">Get instant answers for your query. <a href="https://docs.github.com/copilot">Learn more about Copilot<span class="sr-only"> (opens in a new tab)</span> <svg aria-hidden="true"></svg></a></p>
  <span id="ticket">Create a ticket</span>
  <p id="status"><strong>GitHub status:</strong> All systems operational</p>`

describe('support 作用域', () => {
  it.each([
    'https://help.github.com/',
    'https://help.github.com/contact/report-abuse?category=report-abuse&report=octocat',
    'https://help.github.com/request/landing',
    'https://support.github.com/contact/report-abuse'
  ])('%s → common、support', url => {
    expect(detectPages(new URL(url))).toEqual(SUPPORT)
  })
})

describe.each(LOCALES)('$name support 词条', ({ index, dict, own, full }) => {
  const t = (pair: Pair): string => pair[index]

  it('只有 scoped 词条：不影响 github.com', () => {
    expect(dict.static).toBeUndefined()
    expect(own.translate('Report abuse or spam', ['common'])).toBeUndefined()
    expect(full.translate('Report abuse or spam', ['common', 'repository'])).toBeUndefined()
  })

  it('举报类别与说明', () => {
    expect(full.translate('Phishing', SUPPORT)).toBe(t(['网络钓鱼', '網路釣魚']))
    expect(full.translate('Report a user under age 13.', SUPPORT)).toBe(t(['举报未满 13 岁的用户。', '檢舉未滿 13 歲的使用者。']))
  })

  it('正则：状态横幅的最后更新时间；不带时间时整句匹配', () => {
    expect(dict.regexp).toHaveLength(1)
    expect(own.translate('Behavior and performance may be affected. Last updated Nov 7, 2026, 10:00 AM', SUPPORT)).toBe(
      t(['功能和性能可能受到影响。最后更新于 Nov 7, 2026, 10:00 AM', '功能和效能可能受到影響。最後更新於 Nov 7, 2026, 10:00 AM'])
    )
    expect(full.translate('Behavior and performance may be affected.', SUPPORT)).toBe(
      t(['功能和性能可能受到影响。', '功能和效能可能受到影響。'])
    )
    expect(own.translate('Behavior and performance may be affected. Sample text', SUPPORT)).toBeUndefined()
  })
})

describe.each(LOCALES)('$name support 页面 DOM', ({ index, full }) => {
  const t = (pair: Pair): string => pair[index]
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: full, host: window, resolvePages: () => SUPPORT })
    translator.start()
  }

  function text(selector: string): string {
    return document.querySelector(selector)?.textContent ?? ''
  }

  function attribute(selector: string, name: string): string | null | undefined {
    return document.querySelector(selector)?.getAttribute(name)
  }

  it('举报页：标题、说明（链接是槽位）、举报对象、类别、表单标签与占位文字、提交按钮', () => {
    render(REPORT_HTML)
    expect(text('#title')).toBe(t(['举报滥用行为或垃圾信息', '檢舉濫用或垃圾內容']))
    expect(text('#intro')).toBe(
      t([
        '代码协作应当对每个人都是安全的，因此 GitHub 严肃对待滥用和骚扰行为。如果站内有违反 GitHub 服务条款的有害行为，请告诉我们。向我们报告你担心的用户或内容。请放心，我们会对你的身份信息保密。',
        '程式碼協作應該對每個人都是安全的，因此 GitHub 嚴肅看待濫用和騷擾行為。如果站上有違反 GitHub 服務條款的有害行為，請告訴我們。向我們回報你擔心的使用者或內容。請放心，我們會對你的身分資訊保密。'
      ])
    )
    expect(text('#block-title')).toBe(t(['想要阻止某个用户？', '想要封鎖某位使用者？']))
    expect(text('#block')).toBe(
      t([
        '你可以隐藏某个用户的内容和通知。详细了解如何从你的个人帐户或组织阻止用户。',
        '你可以隱藏某位使用者的內容和通知。進一步瞭解如何從你的個人帳號或組織封鎖使用者。'
      ])
    )
    expect(text('#regarding')).toBe(t(['你正在提交关于 octocat 的举报。', '你正在提交關於 octocat 的檢舉。']))
    expect(attribute('form', 'aria-label')).toBe(t(['举报滥用行为表单', '檢舉濫用表單']))
    expect(text('#category-label')).toBe(t(['请选择问题的类别：', '請選擇問題的類別：']))
    expect(text('#category')).toBe(t(['选择类别', '選擇類別']))
    expect([text('#option-spam'), text('#option-none'), text('#option-none-description')]).toEqual([
      t(['垃圾信息或虚假活动', '垃圾內容或虛假活動']),
      t(['这里没有我的问题', '這裡沒有我的問題']),
      t(['以上都不是。', '以上皆非。'])
    ])
    expect(text('#copyright')).toBe(
      t([
        '如果你认为 GitHub 上的内容侵犯了你拥有的有效版权，请参阅我们的版权 - DMCA 下架政策和提交 DMCA 下架通知指南。',
        '如果你認為 GitHub 上的內容侵犯了你擁有的有效著作權，請參閱我們的著作權 - DMCA 下架政策和提交 DMCA 下架通知指南。'
      ])
    )
    expect(text('#search')).toBe(t(['搜索我们的支持站点，查找更多答案和资源。', '搜尋我們的支援網站，尋找更多解答和資源。']))
    expect(attribute('#url', 'placeholder')).toBe(
      t(['例如 https://github.com/monalisa/octocat/blob/master/file.md', '例如 https://github.com/monalisa/octocat/blob/master/file.md'])
    )
    expect(text('#comments-label')).toBe(t(['你要举报什么？', '你要檢舉什麼？']))
    expect(attribute('#comments', 'placeholder')).toBe(
      t([
        '请尽可能详细地描述你举报的帐户或行为。附上 URL 或屏幕截图形式的具体示例尤其有帮助。',
        '請盡可能詳細描述你檢舉的帳號或行為。附上 URL 或螢幕擷取畫面形式的具體範例特別有幫助。'
      ])
    )
    expect(text('#submit')).toBe(t(['提交', '送出']))
  })

  it('首页：选项、Copilot 链接、状态横幅', () => {
    render(LANDING_HTML)
    expect(text('#heading')).toBe(t(['有什么可以帮你？', '需要什麼協助？']))
    expect(text('#choose')).toBe(t(['选择以下方式之一获取帮助', '選擇以下其中一種方式取得協助']))
    expect(text('#copilot-option')).toBe(t(['在 GitHub 支持中询问 Copilot', '在 GitHub 支援中詢問 Copilot']))
    expect(text('#copilot-description').replace(/\s+/g, ' ').trim()).toBe(
      t(['即时获取问题解答。详细了解 Copilot（在新标签页中打开）', '立即取得問題解答。進一步瞭解 Copilot（在新分頁中開啟）'])
    )
    expect(text('#ticket')).toBe(t(['创建工单', '建立工單']))
    expect(text('#status').replace(/\s+/g, ' ')).toBe(t(['GitHub 状态：所有系统运行正常', 'GitHub 狀態：所有系統運作正常']))
  })
})
