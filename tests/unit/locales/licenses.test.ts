import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher, type Matcher } from '../../../src/core/matcher'
import { detectPages } from '../../../src/core/page'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import cnLicenses from '../../../src/locales/zh-CN/code/licenses'
import { zhCN } from '../../../src/locales/zh-CN/index'
import twLicenses from '../../../src/locales/zh-TW/code/licenses'
import { zhTW } from '../../../src/locales/zh-TW/index'

/** 期望译文：[简体, 繁体] */
type Pair = readonly [cn: string, tw: string]

/** 许可证文件页 */
const BLOB = detectPages(new URL('https://github.com/octocat/hello-world/blob/main/LICENSE'))
/** 许可证模板选择页 */
const PICKER = detectPages(new URL('https://github.com/octocat/hello-world/community/license/new?template=mit'))
/** 新建存储库页（许可证下拉框） */
const NEW = detectPages(new URL('https://github.com/new'))

interface Locale {
  readonly name: string
  readonly index: 0 | 1
  readonly dict: PageDictionary
  readonly full: Matcher
}

const LOCALES: readonly Locale[] = [
  { name: 'zh-CN', index: 0, dict: cnLicenses, full: createMatcher(zhCN) },
  { name: 'zh-TW', index: 1, dict: twLicenses, full: createMatcher(zhTW) }
]

/** 许可证模板选择页列出的许可证与另外几种：[原文, 简体, 繁体] */
const NAMES: readonly (readonly [string, ...Pair])[] = [
  ['Apache License 2.0', 'Apache 许可证 2.0', 'Apache 授權條款 2.0'],
  ['GNU General Public License v3.0', 'GNU 通用公共许可证 v3.0', 'GNU 通用公眾授權條款 v3.0'],
  ['MIT License', 'MIT 许可证', 'MIT 授權條款'],
  ['BSD 2-Clause "Simplified" License', 'BSD 2-Clause“简化版”许可证', 'BSD 2-Clause「簡化版」授權條款'],
  ['BSD 3-Clause "New" or "Revised" License', 'BSD 3-Clause“新版”或“修订版”许可证', 'BSD 3-Clause「新版」或「修訂版」授權條款'],
  ['Boost Software License 1.0', 'Boost 软件许可证 1.0', 'Boost 軟體授權條款 1.0'],
  ['Creative Commons Zero v1.0 Universal', '知识共享 CC0 v1.0 通用', '創用 CC0 v1.0 通用'],
  ['Eclipse Public License 2.0', 'Eclipse 公共许可证 2.0', 'Eclipse 公共授權條款 2.0'],
  ['GNU Affero General Public License v3.0', 'GNU Affero 通用公共许可证 v3.0', 'GNU Affero 通用公眾授權條款 v3.0'],
  ['GNU General Public License v2.0', 'GNU 通用公共许可证 v2.0', 'GNU 通用公眾授權條款 v2.0'],
  ['GNU Lesser General Public License v2.1', 'GNU 宽通用公共许可证 v2.1', 'GNU 寬通用公眾授權條款 v2.1'],
  ['Mozilla Public License 2.0', 'Mozilla 公共许可证 2.0', 'Mozilla 公共授權條款 2.0'],
  ['The Unlicense', 'Unlicense', 'Unlicense'],
  ['Mulan Permissive Software License, Version 2', '木兰宽松许可证，第 2 版', '木蘭寬鬆授權條款，第 2 版'],
  [
    'Creative Commons Attribution Share Alike 4.0 International',
    '知识共享署名-相同方式共享 4.0 国际',
    '創用 CC 姓名標示-相同方式分享 4.0 國際'
  ],
  ['Do What The F*ck You Want To Public License', '你他*的想干嘛就干嘛公共许可证', '你他*的想幹嘛就幹嘛公共授權條款']
]

/** 含链接的说明（div.VerifiedHTMLBox__* 内的 HTML，取自 choosealicense.com 数据）：[名称, HTML, 简体, 繁体] */
const LINKED: readonly (readonly [string, string, ...Pair])[] = [
  [
    'BSD 4-Clause（行内句）',
    'A permissive license similar to the <a href="/licenses/bsd-3-clause/">BSD 3-Clause License</a>, but with an "advertising clause" that requires an acknowledgment of the original source in all advertising material.',
    '一种类似于 BSD 3-Clause 许可证的宽松许可证，但增加了“广告条款”，要求在所有广告材料中注明原始来源。',
    '一種類似於 BSD 3-Clause 授權條款的寬鬆授權條款，但增加了「廣告條款」，要求在所有廣告素材中標示原始來源。'
  ],
  [
    'Microsoft Reciprocal（行内句，链接两侧都是中文）',
    'An open source license with a patent grant similar to the <a href="/licenses/ms-pl/">Microsoft Public License</a>, with the additional condition that any source code for any derived file be provided under this license.',
    '一种与微软公共许可证类似的附带专利授权的开源许可证，附加条件是任何衍生文件的源码都必须以此许可证提供。',
    '一種與微軟公共授權條款類似並附帶專利授權的開源授權條款，附加條件是任何衍生檔案的原始碼都必須以此授權條款提供。'
  ],
  [
    'Mulan PSL v2（行内句）',
    'A permissive license similar to the <a href="/licenses/apache-2.0/">Apache License</a>, but explicitly states that it does not grant trademark rights. Mulan Permissive Software License is the first open source license in both Chinese and English approved by OSI.',
    '一种类似于 Apache 许可证的宽松许可证，但明确声明不授予商标权。木兰宽松许可证是首个获得 OSI 批准的中英双语开源许可证。',
    '一種類似於 Apache 授權條款的寬鬆授權條款，但明確聲明不授予商標權。木蘭寬鬆授權條款是第一個獲得 OSI 核准的中英雙語開源授權條款。'
  ],
  [
    'BSD 2-Clause（片段）',
    'A permissive license that comes in two variants, the <a href="/licenses/bsd-2-clause/">BSD 2-Clause</a> and <a href="/licenses/bsd-3-clause/">BSD 3-Clause</a>. Both have very minute differences to the MIT license.',
    '一种宽松许可证，有两个变体 BSD 2-Clause 和 BSD 3-Clause。两者与 MIT 许可证的差异都很小。',
    '一種有兩種變體的寬鬆授權條款，分別是 BSD 2-Clause 和 BSD 3-Clause。兩者和 MIT 授權條款的差異都很小。'
  ],
  [
    'ISC（片段）',
    'A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the <a href="/licenses/bsd-2-clause/">BSD 2-Clause</a> and <a href="/licenses/mit/">MIT</a> licenses, removing some language that is no longer necessary.',
    '宽松许可证允许他人在适当署名且无担保的前提下对你的代码做任何事。ISC 许可证在功能上等同于 BSD 2-Clause 和 MIT 许可证，并删除了一些不再必要的措辞。',
    '寬鬆授權條款允許他人在適當標示出處且無擔保的前提下對你的程式碼做任何事。ISC 授權條款在功能上等同於 BSD 2-Clause 和 MIT 授權條款，並刪除了一些已不再必要的措辭。'
  ],
  [
    'Creative Commons CC0（句型键超过上限，片段；开头的 The 由 blob 的 scoped 译出）',
    'The <a href="https://creativecommons.org/publicdomain/zero/1.0/">Creative Commons CC0 Public Domain Dedication</a> waives copyright interest in a work you\'ve created and dedicates it to the world-wide public domain. Use CC0 to opt out of copyright entirely and ensure your work has the widest reach. As with the Unlicense and typical software licenses, CC0 disclaims warranties. CC0 is very similar to the Unlicense.',
    '该 知识共享 CC0 公有领域贡献声明 放弃你所创作作品的版权权益并将其贡献到全球公有领域。使用 CC0 可完全放弃版权并让作品得到最广泛的传播。与 Unlicense 和典型的软件许可证一样，CC0 不提供担保。CC0 与 Unlicense 非常相似。',
    '該 創用 CC0 公共領域貢獻宣告 放棄你對所創作作品的著作權權益，並將作品貢獻至全球公共領域。使用 CC0 可完全放棄著作權，讓作品得到最廣泛的傳播。如同 Unlicense 和一般軟體授權條款，CC0 不提供擔保。CC0 和 Unlicense 非常相似。'
  ],
  [
    'University of Illinois/NCSA（句型键超过上限，片段）',
    'The University of Illinois/NCSA Open Source License, or UIUC license, is a permissive free software license, based on the <a href="/licenses/mit/">MIT/X11 license</a> and the <a href="/licenses/bsd-3-clause/">BSD 3-clause License</a>. Its conditions include requiring the preservation of copyright and license notices both in source and in binary distributions and the prohibition of using the names of the authors or the project organization to promote or endorse derived products.',
    '伊利诺伊大学/NCSA 开源许可证，又称 UIUC 许可证，是一种宽松自由软件许可证，基于 MIT/X11 许可证 和 BSD 3-Clause 许可证。其条件包括以源码和二进制形式分发时都必须保留版权和许可证声明以及禁止使用作者或项目组织的名义推广或认可衍生产品。',
    '伊利諾大學/NCSA 開源授權條款，又稱 UIUC 授權條款，是一種寬鬆自由軟體授權條款，基於 MIT/X11 授權條款 和 BSD 3-Clause 授權條款。其條件包括以原始碼和二進位形式散布時都必須保留著作權和授權條款聲明以及禁止使用作者或專案組織的名義推廣或背書衍生產品。'
  ]
]

describe.each(LOCALES)('$name 许可证词条', ({ index, dict, full }) => {
  const t = (pair: Pair): string => pair[index]

  it('无正则：code 的正则顺序（code.test.ts 的 REGEXP_CASES）不受影响', () => {
    expect(dict.regexp).toBeUndefined()
  })

  it.each(NAMES)('名称收 static，新建存储库页同样适用：%s', (source, ...pair) => {
    expect(dict.static?.[source]).toBe(t(pair))
    expect(full.translate(source, NEW)).toBe(t(pair))
    expect(full.translate(source, PICKER)).toBe(t(pair))
  })

  it('说明：无链接的长句整句匹配', () => {
    expect(full.translate('An open source license with a patent grant.', BLOB)).toBe(
      t(['一种附带专利授权的开源许可证。', '一種附帶專利授權的開源授權條款。'])
    )
    expect(full.translate('A copyleft license for software documentation.', NEW)).toBe(
      t(['一种用于软件文档的 Copyleft 许可证。', '一種用於軟體文件的 Copyleft 授權條款。'])
    )
  })

  it('规则标签只在代码页作用域', () => {
    expect(full.translate('Commercial use', PICKER)).toBe(t(['商业用途', '商業用途']))
    expect(full.translate('Commercial use', NEW)).toBeUndefined()
  })
})

describe.each(LOCALES)('$name 许可证 DOM', ({ index, full }) => {
  const t = (pair: Pair): string => pair[index]
  let translator: Translator | undefined

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  function render(html: string, pages: readonly PageKey[]): void {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: full, host: window, resolvePages: () => pages })
    translator.start()
  }

  function text(selector: string): string {
    return document.querySelector(selector)?.textContent ?? ''
  }

  it('许可证文件页横幅：标题行、名称、说明、规则、页脚', () => {
    render(
      `<div class="Box_2__M8iAnv">
        <div class="Box_4__vTeWQ8"><div id="lead" class="Box_5__LftDhI">octocat/hello-world is licensed under  the</div><h3 id="name">GNU General Public License v3.0</h3></div>
        <div id="description" class="VerifiedHTMLBox__4GHziY">An open source license with a patent grant.</div>
        <h5 id="permissions">Permissions</h5><div id="commercial">Commercial use</div>
        <h5 id="limitations">Limitations</h5><div id="liability">Liability</div>
        <h5 id="conditions">Conditions</h5><div id="notice">License and copyright notice</div>
        <div id="advice">This is not legal advice.</div>
      </div>`,
      BLOB
    )
    expect(text('#lead')).toBe(t(['octocat/hello-world 采用以下许可证', 'octocat/hello-world 採用以下授權條款']))
    expect(text('#name')).toBe(t(['GNU 通用公共许可证 v3.0', 'GNU 通用公眾授權條款 v3.0']))
    expect(text('#description')).toBe(t(['一种附带专利授权的开源许可证。', '一種附帶專利授權的開源授權條款。']))
    expect([text('#permissions'), text('#limitations'), text('#conditions')]).toEqual([
      t(['权限', '權限']),
      t(['限制', '限制']),
      t(['条件', '條件'])
    ])
    expect([text('#commercial'), text('#liability'), text('#notice')]).toEqual([
      t(['商业用途', '商業用途']),
      t(['责任', '責任']),
      t(['许可证和版权声明', '授權條款和著作權聲明'])
    ])
    expect(text('#advice')).toBe(t(['此信息不构成法律建议。', '此內容不構成法律建議。']))
  })

  it.each(LINKED)('含链接的说明：%s', (_, html, ...pair) => {
    render(`<div class="Box_2__M8iAnv"><div id="description" class="VerifiedHTMLBox__4GHziY">${html}</div></div>`, PICKER)
    const host = document.getElementById('description')!
    const hrefs = [...host.querySelectorAll('a')].map(link => link.getAttribute('href'))
    expect(host.textContent).toBe(t(pair))
    expect([...host.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(hrefs)
    translator?.stop()
    translator = undefined
    expect(host.innerHTML).toBe(html)
  })
})
