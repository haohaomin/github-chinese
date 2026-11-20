import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import features from '../../../src/locales/zh-CN/features'
import twFeatures from '../../../src/locales/zh-TW/features'

const PAGES: readonly PageKey[] = ['common', 'features']
const matcher = createMatcher([['features', features]])
const twMatcher = createMatcher([['features', twFeatures]])

describe('features 词条', () => {
  it.each([
    ['GitHub Features', 'GitHub 功能', 'GitHub 功能'],
    ['Plan', '规划', '規劃'],
    ['Ship', '交付', '交付'],
    ['Stacked pull requests', '堆叠式拉取请求', '堆疊式拉取請求'],
    ['Webhooks', 'Web 钩子', 'Web 鉤子'],
    ['View pricing plans', '查看定价计划', '檢視定價方案'],
    ['Delegate to agents.', '委派给智能体。', '委派給代理。']
  ])('%s → %s / %s', (input, cn, tw) => {
    expect(matcher.translate(input, PAGES)).toBe(cn)
    expect(twMatcher.translate(input, PAGES)).toBe(tw)
  })

  it('分组名、分区标题等短词不在其他页面生效', () => {
    for (const text of ['Build', 'Plan', 'Review', 'Ship']) {
      expect(matcher.translate(text, ['common', 'repository'])).toBeUndefined()
    }
  })
})

describe('features 页面（DOM）', () => {
  const pageMatcher = createMatcher([
    ['common', common],
    ['common', commonUi],
    ['features', features]
  ])
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function start(html: string): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: pageMatcher, host: window, resolvePages: () => PAGES })
    translator.start()
  }

  it('Copilot 应用要点：粗体前缀与后半句分别翻译', () => {
    // 采集自 /features 的 River 区块（Primer Brand 类名已略去）
    start(
      '<p><b>GitHub Copilot app:</b> from issue to merge</p>' +
        '<p><span>Delegate to agents. </span>Start a session from an issue, a prompt, or a PR already in flight.</p>'
    )
    const [first, second] = document.querySelectorAll('p')
    expect(first?.textContent?.replace(/\s+/g, '')).toBe('GitHubCopilot应用：从议题到合并')
    expect(second?.textContent?.replace(/\s+/g, '')).toBe('委派给智能体。从议题、提示或进行中的PR启动会话。')
  })
})
