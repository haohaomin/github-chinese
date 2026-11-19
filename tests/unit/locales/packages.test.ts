import { describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import packages from '../../../src/locales/zh-CN/packages'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = packages

const matcher = createMatcher([['packages', packages]])

/** 组织包页的作用域：common → organization → packages */
const SCOPE: readonly PageKey[] = ['common', 'organization', 'packages']

function translate(text: string): string | undefined {
  return matcher.translate(text, [...SCOPE])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列，每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // 版本发布时间
  {
    hits: [
      ['Published 38 minutes ago · Digest', '38分钟前发布 · 摘要'],
      ['Published about 24 hours ago · Digest', '约24小时前发布 · 摘要']
    ],
    misses: ['Published · Digest', 'Published recently · Digest']
  },
  {
    hits: [
      ['Published 1 day ago', '昨天发布'],
      ['Published almost 4 years ago', '将近4年前发布'],
      ['Published on Mar 25, 2021', '2021年3月25日发布'],
      // translateDate 接受 on 前缀的月年、日月年写法
      ['Published on January 2024', '2024年1月发布'],
      ['Published on 5 January 2024', '2024年1月5日发布']
    ],
    misses: ['Published recently', 'Published by octocat']
  },
  // 版本列表标签页与筛选
  { hits: [['4,558 tagged', '4,558 个带标签版本']], misses: ['all tagged'] },
  { hits: [['17,259 untagged', '17,259 个无标签版本']], misses: ['all untagged'] },
  { hits: [['12 active', '12 个活跃版本']], misses: ['all active'] },
  { hits: [['3 deleted', '3 个已删除版本']], misses: ['none deleted'] },
  {
    hits: [['Package versions of hello-world', 'hello-world 的软件包版本']],
    misses: ['Package versions of']
  },
  // 详情侧栏
  {
    hits: [
      ['+ 5,355 contributors', '+ 5,355 个贡献者'],
      ['+ 1 contributor', '+ 1 个贡献者']
    ],
    misses: ['5,355 contributors']
  },
  {
    hits: [
      ['1 dependencies', '1 个依赖项'],
      ['1 dependency', '1 个依赖项'],
      ['12 dependencies', '12 个依赖项']
    ],
    misses: ['No dependencies']
  },
  {
    hits: [
      ['Learn more about npm packages', '了解 npm 软件包'],
      ['Learn more about NuGet packages', '了解 NuGet 软件包'],
      ['Learn more about RubyGems packages', '了解 RubyGems 软件包'],
      ['Learn more about Apache Maven', '了解 Apache Maven'],
      ['Learn more about Maven or Gradle', '了解 Maven 或 Gradle'],
      ['Learn more about Docker', '了解 Docker'],
      ['Learn more about Containers', '了解容器'],
      ['Learn more about Containers packages', '了解容器软件包'],
      ['Learn more about npm', '了解 npm']
    ],
    misses: ['Learn more about Cargo packages', 'Learn more about Swift']
  },
  // 页面标题段
  {
    hits: [
      ['Package hello-world', '软件包 hello-world'],
      ['Package @octo-org/prettier-config', '软件包 @octo-org/prettier-config'],
      ['Package Octocat.Json', '软件包 Octocat.Json']
    ],
    misses: ['Package Details', 'Package visibility', 'Package']
  },
  {
    hits: [
      ['hello-world versions', 'hello-world 的版本'],
      ['prettier-config versions', 'prettier-config 的版本'],
      ['Octocat.Json versions', 'Octocat.Json 的版本'],
      ['@octo-org/prettier-config versions', '@octo-org/prettier-config 的版本']
    ],
    misses: [
      'View versions',
      'Previous versions',
      'Untagged versions',
      'Show versions',
      'Older versions',
      'all versions',
      'older versions',
      'hello-world Versions'
    ]
  },
  // 设置：确认对话框
  {
    hits: [
      ['Please type hello-world to confirm.', '请输入 hello-world 以确认。'],
      ['Please type acme/app to confirm:', '请输入 acme/app 以确认：']
    ],
    misses: ['Please type to confirm', 'Please type acme/app to confirm']
  },
  {
    hits: [['Are you sure you want to unlink acme/web from app-image?', '确定要取消 acme/web 与 app-image 的链接吗？']],
    misses: ['Are you sure you want to unlink this?']
  },
  // 设置：访问权限列表
  {
    hits: [
      ['2 repositories selected…', '已选择 2 个存储库…'],
      ['1 repository selected...', '已选择 1 个存储库...']
    ],
    misses: ['repositories selected…']
  },
  {
    hits: [['Change the role of 2 repositories?', '要更改 2 个存储库的角色吗？']],
    misses: ['Change the role of repositories?']
  },
  {
    hits: [
      ['1 member selected...', '已选择 1 个成员...'],
      ['3 members selected…', '已选择 3 个成员…']
    ],
    misses: ['members selected…']
  },
  { hits: [['Change the role of 4 members?', '要更改 4 个成员的角色吗？']], misses: ['Change the role of members?'] },
  {
    hits: [
      ['Change 2 Roles', '更改 2 个角色'],
      ['Change 1 role', '更改 1 个角色']
    ],
    misses: ['Change roles']
  },
  { hits: [["octocat's access settings", 'octocat 的访问设置']], misses: ["'s access settings"] },
  {
    hits: [['Removed access from repository acme/web.', '已移除存储库 acme/web 的访问权限。']],
    misses: ['Removed access from repository.']
  },
  {
    hits: [['Removed octocat as a package collaborator.', '已将 octocat 从软件包协作者中移除。']],
    misses: ['Removed as a package collaborator.']
  },
  {
    hits: [
      ['Remove acme/web from app-image', '从 app-image 中移除 acme/web'],
      ['Remove acme/web from app-image?', '要从 app-image 中移除 acme/web 吗？'],
      ['Remove octocat from app-image', '从 app-image 中移除 octocat']
    ],
    misses: ['Remove from app-image', 'Remove acme web from app-image', 'Remove access from repository', 'Remove user from package?']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('packages 正则词条', () => {
  it.each(HITS)('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBeUndefined()
    expect(dict.scoped?.[input]).toBeUndefined()
    expect(translate(input)).toBe(expected)
  })

  it.each(MISSES)('不命中：%s', input => {
    expect(translate(input)).toBeUndefined()
  })

  it('用例与正则一一对应，正例首个命中对应的正则', () => {
    expect(REGEXP_CASES).toHaveLength(RULES.length)
    const mismatched = REGEXP_CASES.flatMap((item, index) =>
      item.hits.filter(([input]) => firstRule(input) !== index).map(([input]) => `#${index} ${input}`)
    )
    expect(mismatched).toEqual([])
  })

  it('每条正则都有首个命中它的正例', () => {
    const covered = new Set(HITS.map(([input]) => firstRule(input)))
    const uncovered = RULES.filter((_, index) => !covered.has(index)).map(([pattern]) => String(pattern))
    expect(uncovered).toEqual([])
  })

  it('被元素隔开的片段单独命中', () => {
    // Published <relative-time> by <所有者> in <存储库>
    expect(translate('Published')).toBe('发布于')
    expect(translate('by')).toBe('发布者')
    expect(translate('in')).toBe('存储库')
    // For multi-arch images, set a value for the <code> key in the <code> field of the manifest:
    expect(translate('For multi-arch images, set a value for the')).toBe('对于多架构映像，请为')
    expect(translate('key in the')).toBe('键在清单的')
    expect(translate('field of the manifest:')).toBe('字段中设置值：')
    // This package version was published <relative-time>
    expect(translate('This package version was published')).toBe('此软件包版本发布于')
    // This cannot be undone. This will permanently delete the version <strong>…</strong> so users and processes …
    // 原文片段之间没有逗号，译文用“并”衔接
    expect(translate('This cannot be undone. This will permanently delete the version')).toBe('此操作无法撤销。这将永久删除版本')
    expect(translate('so users and processes won’t be able to download this version.')).toBe('并让用户和进程无法再下载此版本。')
    // Once removed, <strong>repo</strong> will no longer have access to the <strong>name</strong> package.
    expect(translate('Once removed,')).toBe('移除后，')
    expect(translate('will no longer have access to the')).toBe('将无法再访问')
    expect(translate('package.')).toBe('软件包。')
    // Please type <strong>name</strong> to confirm:
    expect(translate('Please type')).toBe('请输入')
    expect(translate('to confirm:')).toBe('以确认：')
    // Go to <a>owner/repo</a> to change access, or remove inherited access …
    expect(translate('Go to')).toBe('转到')
    expect(translate('to change access, or remove inherited access to manage it separately. Inherited access is recommended.')).toBe(
      '更改访问权限，或移除继承的访问权限以单独管理。推荐使用继承的访问权限。'
    )
    // This action will delete package <strong>name</strong>. Versions of this package …
    expect(translate('This action will delete package')).toBe('此操作将删除软件包')
    // Try <a>browsing all packages</a> to find what you're looking for.（原文无逗号，译文不加）
    expect(translate('Try')).toBe('试试')
    expect(translate('browsing all packages')).toBe('浏览所有软件包')
    expect(translate("to find what you're looking for.")).toBe('来查找你需要的内容。')
    expect(translate('to find what you’re looking for.')).toBe('来查找你需要的内容。')
  })
})

describe('packages 静态词条', () => {
  it.each([
    ['Search packages…', '搜索软件包…'],
    ['Search packages...', '搜索软件包...'],
    ['No packages published', '未发布软件包'],
    ['Install from the command line', '通过命令行安装'],
    ['Install from the command line:', '通过命令行安装：'],
    ['Install via package.json:', '通过 package.json 安装：'],
    ['Install 1/2: Add this to pom.xml:', '安装 1/2：将以下内容添加到 pom.xml：'],
    ['About this package', '关于此软件包'],
    ['Recent tagged image versions', '最近带标签的映像版本'],
    ['View and manage all versions', '查看并管理所有版本'],
    ['View all versions', '查看所有版本'],
    ['Last published', '最近发布'],
    ['Total downloads', '总下载量'],
    ['Downloads for the last 30 days', '最近 30 天的下载量'],
    ['Package settings', '软件包设置'],
    ['Link this package to a repository', '将此软件包链接到存储库'],
    ['Link to repository', '链接到存储库'],
    ['Connect repository', '连接存储库'],
    ['Connect Repository', '连接存储库'],
    ['Confirm you want to unlink this repository', '确认取消链接此存储库'],
    ['Yes, unlink this repository', '是，取消链接此存储库'],
    ['Add a Readme to the linked repository', '为链接的存储库添加自述文件'],
    ["The linked repository's Readme will be shown here.", '此处将显示所链接存储库的自述文件。'],
    ['OS / Arch', '操作系统/架构'],
    ['Other tags on this version', '此版本的其他标签'],
    ['Use as base image in Dockerfile:', '在 Dockerfile 中用作基础映像：'],
    ['Learn more about labelling container images', '了解如何标注容器映像'],
    ['Manage Actions access', '管理操作访问权限'],
    ['Manage Codespaces access', '管理代码空间访问权限'],
    ['Pick the repositories that can access this package using GitHub Actions.', '选择可通过 GitHub 操作访问此软件包的存储库。'],
    ['remove access to repository from this package', '移除存储库对此软件包的访问权限'],
    // 原文分句、原文无逗号或括号处，译文不合并、不添加
    ['Can upload and download this package. Can read and write package metadata.', '可上传和下载此软件包。可读写软件包元数据。'],
    [
      'A software platform used for building applications based on containers — small and lightweight execution environments.',
      '基于容器构建应用的软件平台——容器即小巧轻量的执行环境。'
    ],
    ['Once you delete a package, there is no going back. Please be certain.', '删除软件包后，将无法恢复。请谨慎操作。'],
    ['Inherit access from source repository (recommended)', '从源存储库继承访问权限（推荐）'],
    ['Inherit access from repository (recommended)', '从存储库继承访问权限（推荐）'],
    ['Change package visibility', '更改软件包可见性'],
    ['This package is currently public.', '此软件包当前为公共软件包。'],
    ['This package is currently private.', '此软件包当前为专用软件包。'],
    ['Delete this package', '删除此软件包'],
    ['I understand the consequences, delete this package', '我了解后果，删除此软件包'],
    ['I understand, delete this package.', '我了解，删除此软件包。'],
    ['I understand the consequences, restore this version.', '我了解后果，恢复此版本。']
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Total downloads \n', [...SCOPE])).toBe('  总下载量 \n')
  })
})

describe('packages 页面词条', () => {
  it.each([
    ['Packages', '软件包'],
    ['GitHub Packages', 'GitHub 软件包'],
    ['Type:', '类型：'],
    ['Visibility:', '可见性：'],
    ['Most downloads', '下载最多'],
    ['Least downloads', '下载最少'],
    ['Container', '容器'],
    ['Linked artifacts', '链接的产物'],
    ['Latest', '最新'],
    ['Latest version', '最新版本'],
    ['Label: Latest version', '标签：最新版本'],
    ['Recent versions', '最近版本'],
    ['Readme', '自述文件'],
    ['Start a discussion', '开始讨论'],
    ['Versions', '版本'],
    ['Select versions view', '选择版本视图'],
    ['Tagged', '带标签'],
    ['Untagged', '无标签'],
    ['Digest', '摘要'],
    ['Installation', '安装'],
    ['No description provided', '未提供描述'],
    ['Package versions', '软件包版本'],
    ['Last 30 days', '最近 30 天'],
    ['Manage versions', '管理版本'],
    ['Actions access', '操作访问权限'],
    ['Danger Zone', '危险区域'],
    ['Change visibility', '更改可见性']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('common-ui 已收录且译法相同的词条不重复收录', () => {
    for (const text of ['Admin', 'Restore']) {
      expect(dict.scoped?.[text]).toBeUndefined()
      expect(dict.static?.[text]).toBeUndefined()
    }
  })

  it('用户与存储库的软件包页同样生效', () => {
    expect(matcher.translate('Most downloads', ['common', 'profile', 'packages'])).toBe('下载最多')
    expect(matcher.translate('Published', ['common', 'repository', 'packages'])).toBe('发布于')
    expect(matcher.translate('4,558 tagged', ['common', 'repository', 'packages'])).toBe('4,558 个带标签版本')
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Published', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('4,558 tagged', ['common', 'profile'])).toBeUndefined()
    expect(matcher.translate('Published 1 day ago', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Most downloads', ['common', 'search'])).toBeUndefined()
  })
})

describe('packages 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })

  it('版本标记、软件包名、所有者与存储库名、描述被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <div id="package-results">
        <ul>
          <li class="Box-row">
            <a class="text-bold f4 Link--primary" href="/orgs/acme/packages/container/package/app">app-image</a>
            <div class="f6 color-fg-muted">
              <span>Published</span>
              <a class="Link--secondary Link--inTextBlock" href="/acme">Acme Corp</a>
              <strong><a class="Link--secondary Link--inTextBlock" href="/acme/web">acme/web</a></strong>
            </div>
          </li>
        </ul>
      </div>
      <ul>
        <li class="Box-row">
          <a class="Label mr-1 mb-2 text-normal" href="/orgs/acme/packages/container/app/14453">latest</a>
          <small class="color-fg-muted">Published 1 day ago · Digest</small>
        </li>
      </ul>
      <div class="d-flex flex-column flex-md-row mt-n1 mb-3">
        <div class="col-12"><p>Prettier config used at Acme</p></div>
      </div>
      <span class="Label v-align-middle">Latest</span>`
    const selector = (dict.ignore ?? []).join(', ')
    const ignored = (text: string): boolean => {
      const element = [...document.querySelectorAll('*')].reverse().find(node => node.textContent?.trim() === text)
      return Boolean(element?.closest(selector))
    }
    expect(ignored('app-image')).toBe(true)
    expect(ignored('Acme Corp')).toBe(true)
    expect(ignored('acme/web')).toBe(true)
    expect(ignored('latest')).toBe(true)
    expect(ignored('Prettier config used at Acme')).toBe(true)
    expect(ignored('Published')).toBe(false)
    expect(ignored('Published 1 day ago · Digest')).toBe(false)
    expect(ignored('Latest')).toBe(false)
  })

  it('标题、面包屑与侧栏 Details 中的名称被忽略，界面文字不被忽略', () => {
    document.body.innerHTML = `
      <h1 class="mb-2 mt-1 clearfix width-fit">
        <span class="overflow-hidden lh-condensed"> Settings </span>
        <span class="text-normal h2 mr-1 color-fg-muted">sha256-cd88</span>
        <span class="Label v-align-middle"> Public </span>
      </h1>
      <nav>
        <ol>
          <li class="breadcrumb-item"><a href="/orgs/acme/packages/container/package/settings">Settings</a></li>
          <li class="breadcrumb-item"><a href="/orgs/acme/packages/container/settings/versions">Versions</a></li>
          <li class="breadcrumb-item breadcrumb-item-selected">
            <a aria-current="page" href="/orgs/acme/packages/container/settings/1445?tag=latest">latest</a>
          </li>
        </ol>
      </nav>
      <div class="col-12 col-md-3">
        <h4>Details</h4>
        <ul class="list-style-none">
          <li><span><a class="Link--primary" href="https://github.com/octo-org">octo-org</a></span></li>
          <li><a class="Link Link--muted" href="https://github.com/acme/docs"><svg></svg> Docs</a></li>
          <li><a class="Link Link--muted" href="/acme/docs/stargazers"><strong>12</strong> stars</a></li>
        </ul>
      </div>`
    const selector = (dict.ignore ?? []).join(', ')
    const at = (query: string): boolean => document.querySelector(query)?.closest(selector) !== null
    expect(at('h1 > .overflow-hidden')).toBe(true)
    expect(at('h1 > .Label')).toBe(false)
    expect(at('.breadcrumb-item:first-child > a')).toBe(true)
    expect(at('.breadcrumb-item:nth-child(2) > a')).toBe(false)
    expect(at('.breadcrumb-item-selected > a')).toBe(true)
    expect(at('a.Link--primary')).toBe(true)
    expect(at('a[href$="/acme/docs"]')).toBe(true)
    expect(at('a[href$="/stargazers"]')).toBe(false)
    expect(at('h4')).toBe(false)
  })
})
