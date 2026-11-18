import { describe, expect, it } from 'vitest'
import { createMatcher, normalizeText } from '../../../src/core/matcher'
import type { PageDictionary } from '../../../src/core/types'
import codespaces from '../../../src/locales/zh-CN/codespaces'
import repoRules from '../../../src/locales/zh-CN/codespaces/repo-rules'
import commonUi from '../../../src/locales/zh-CN/common-ui'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = codespaces

const matcher = createMatcher([['codespaces', codespaces]])

/** 存储库页：repository.ts 合并了 repo-rules.ts，这里只注册这部分正则 */
const repoMatcher = createMatcher([
  ['codespaces', codespaces],
  ['repository', repoRules]
])

/** Codespaces 页的作用域：common → codespaces */
function translate(text: string): string | undefined {
  return matcher.translate(text, ['common', 'codespaces'])
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按合并顺序排列（list → repo-tab → repo-rules），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  { hits: [['Owned by octo-org', '归属于 octo-org']], misses: ['Owned by you and others'] },
  {
    hits: [
      ['Last used 3 days ago', '上次使用 3天前'],
      ['Last used on Jan 5, 2024', '上次使用 2024年1月5日'],
      // 中文开头的时间不补空格
      ['Last used yesterday', '上次使用昨天']
    ],
    misses: ['Last used recently']
  },
  {
    hits: [
      ['Auto-deletes in 30 days', '30天后自动删除'],
      ['Auto-delete on Feb 1', '2月1日自动删除'],
      ['Auto-deletes tomorrow', '明天自动删除']
    ],
    misses: ['Auto-deletes soon']
  },
  {
    hits: [
      ['Created 2 hours ago', '2小时前创建'],
      ['Created on Mar 3', '3月3日创建'],
      ['Created yesterday', '昨天创建']
    ],
    misses: ['Created recently']
  },
  { hits: [['Usage paid for by octo-org', '使用量由 octo-org 支付']], misses: ['Usage paid for by you and others'] },
  {
    hits: [
      ['3 codespaces', '3 个代码空间'],
      ['1 codespace', '1 个代码空间']
    ],
    misses: ['Many codespaces']
  },
  { hits: [['By github', '由 github 发布']], misses: ['By the community'] },
  {
    hits: [
      ['This codespace is 3 commits ahead of remote and has uncommitted changes', '此代码空间领先远程 3 个提交且有未提交的更改'],
      ['This codespace is 1 commit ahead of remote and has uncommitted changes', '此代码空间领先远程 1 个提交且有未提交的更改']
    ],
    misses: ['This codespace is ahead of remote and has uncommitted changes']
  },
  {
    hits: [['This codespace is 2 commits ahead of remote', '此代码空间领先远程 2 个提交']],
    misses: ['This codespace is ahead of remote']
  },
  {
    hits: [
      [
        "You're at 90% of your included usage for this billing period. For more information, view your",
        '本计费周期包含的使用量已使用 90%。详情请查看你的'
      ],
      [
        'You’re at 100% of your included usage for this billing period. For more information, view your',
        '本计费周期包含的使用量已使用 100%。详情请查看你的'
      ]
    ],
    misses: ["You're at most of your included usage for this billing period. For more information, view your"]
  },
  {
    hits: [
      ['3 permissions requested', '请求了 3 项权限'],
      ['1 permission requested', '请求了 1 项权限']
    ],
    misses: ['Permissions requested']
  },
  {
    hits: [['Codespace "fluffy-space-waffle" stopped.', '代码空间“fluffy-space-waffle”已停止。']],
    misses: ['Codespace "fluffy-space-waffle" stopped']
  },
  {
    hits: [['Codespace "fluffy-space-waffle" deleted.', '代码空间“fluffy-space-waffle”已删除。']],
    misses: ['Codespace "fluffy-space-waffle" deleted']
  },
  {
    hits: [
      [
        'Your codespace "fluffy-space-waffle" has been updated to use machine type: "4 cores, 16 GB RAM, 32 GB storage". Changes will take effect the next time your codespace restarts.',
        '你的代码空间“fluffy-space-waffle”已改用计算机类型“4 核，16 GB 内存，32 GB 存储”。更改将在代码空间下次重启时生效。'
      ]
    ],
    misses: [
      'Your codespace "fluffy-space-waffle" has been updated to use machine type: "Large". Changes will take effect the next time your codespace restarts.'
    ]
  },
  {
    hits: [['Your codespace "fluffy-space-waffle" has been updated.', '你的代码空间“fluffy-space-waffle”已更新。']],
    misses: ['Your codespace has been updated.']
  },
  {
    hits: [['Your codespace "fluffy-space-waffle" will no longer be auto-deleted.', '你的代码空间“fluffy-space-waffle”将不再自动删除。']],
    misses: ['Your codespace will no longer be auto-deleted.']
  },
  {
    hits: [
      ['fluffy-space-waffle has unpushed changes, are you sure you want to delete?', 'fluffy-space-waffle 有未推送的更改，确定要删除吗？']
    ],
    misses: ['Has unpushed changes, delete anyway?']
  },
  {
    hits: [['Are you sure you want to delete fluffy-space-waffle?', '确定要删除 fluffy-space-waffle 吗？']],
    misses: ['Are you sure you want to stop fluffy-space-waffle?']
  },
  { hits: [['6-core', '6 核']], misses: ['Six-core'] },
  {
    hits: [
      ['6 cores', '6 核'],
      ['1 core', '1 核']
    ],
    misses: ['Many cores']
  },
  {
    hits: [
      ['24 GB RAM · 64 GB', '24 GB 内存 · 64 GB 存储'],
      ['24GB RAM • 64GB storage', '24 GB 内存 · 64 GB 存储']
    ],
    misses: ['24 GB RAM, 64 GB']
  },
  { hits: [['6-core · 24 GB RAM · 64 GB', '6 核 · 24 GB 内存 · 64 GB 存储']], misses: ['6-core, 24 GB RAM'] },
  { hits: [['24 GB RAM', '24 GB 内存']], misses: ['Lots of RAM'] },
  { hits: [['64 GB storage', '64 GB 存储']], misses: ['Lots of storage'] },
  {
    hits: [
      ['3 commits ahead', '领先 3 个提交'],
      ['1 commit ahead', '领先 1 个提交']
    ],
    misses: ['Commits ahead']
  },
  {
    hits: [['3 commits ahead, uncommitted changes', '领先 3 个提交，有未提交的更改']],
    misses: ['Uncommitted changes ahead']
  },
  {
    hits: [
      ['Create codespace on develop', '在 develop 上创建代码空间'],
      ['Create a codespace on feature/login', '在 feature/login 上创建代码空间']
    ],
    misses: ['Create codespace now']
  },
  { hits: [['Open fluffy-space-waffle in editor', '在编辑器中打开 fluffy-space-waffle']], misses: ['Open in editor'] },
  {
    hits: [['More actions for fluffy-space-waffle', 'fluffy-space-waffle 的更多操作']],
    misses: ['More actions', "More actions for octocat's comment, Jan 5, 2024", 'More actions for review, Jan 5, 2024']
  }
]

const HITS = REGEXP_CASES.flatMap(item => item.hits)
const MISSES = REGEXP_CASES.flatMap(item => item.misses)
const RULES = dict.regexp ?? []

function firstRule(input: string): number {
  return RULES.findIndex(([pattern]) => pattern.test(input))
}

describe('codespaces 正则词条', () => {
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

  it('React 拆分的相邻文本节点拼接后命中', () => {
    expect(translate(normalizeText(['Last used ', '3 days ago'].join('')))).toBe('上次使用 3天前')
    expect(translate(normalizeText(['8', '-core', ' · ', '32', ' GB RAM', ' · ', '64', ' GB'].join('')))).toBe(
      '8 核 · 32 GB 内存 · 64 GB 存储'
    )
    expect(translate(normalizeText(['Open ', 'fluffy-space-waffle', ' in editor'].join('')))).toBe('在编辑器中打开 fluffy-space-waffle')
  })

  it('被元素隔开的片段单独命中', () => {
    expect(translate('Owned by')).toBe('归属于')
    expect(translate('Last used')).toBe('上次使用')
    expect(translate('Usage paid for by')).toBe('使用量付费方为')
    expect(translate('Auto-deletes')).toBe('自动删除')
  })

  it('入门卡片被链接拆开的片段分别命中', () => {
    expect(translate('New to Codespaces?')).toBe('刚接触代码空间？')
    expect(translate('Start here')).toBe('从这里开始')
    expect(translate('. Learn the core concepts and how to get started.')).toBe('。了解核心概念和入门方法。')
    expect(translate('Learn more about features like')).toBe('进一步了解')
    expect(translate('secret management')).toBe('机密管理')
    expect(translate('port forwarding')).toBe('端口转发')
  })
})

describe('codespaces 静态词条', () => {
  it.each([
    ['Your codespaces', '你的代码空间'],
    ['Explore quick start templates', '浏览快速启动模板'],
    ['Create a new codespace', '创建新的代码空间'],
    ['No codespaces yet', '暂无代码空间'],
    ['Starting codespace...', '正在启动代码空间...'],
    ['Starting codespace…', '正在启动代码空间…'],
    ['Your workspaces in the cloud', '你的云端工作区'],
    ['Manage codespaces', '管理代码空间'],
    ['Create codespace', '创建代码空间'],
    ['Create a codespace on default branch', '在默认分支上创建代码空间'],
    ['Machine type disallowed', '不允许的计算机类型'],
    ['Image disallowed', '不允许的映像'],
    ['Stopping...', '停止中...'],
    ['Open in...', '在...中打开'],
    ['Go to docs', '转到文档'],
    ['Request Usage Report', '请求使用情况报告'],
    ['Prebuild in progress', '正在预生成'],
    ['Uncommitted changes', '有未提交的更改'],
    ['2-core', '2 核'],
    // 产品名按 product-names.md 译成中文
    ['Default Codespaces configuration', '默认代码空间配置'],
    ['Getting started with GitHub Codespaces', 'GitHub 代码空间入门'],
    ['Codespace templates', '代码空间模板'],
    ['Codespaces maintenance notice', '代码空间维护通知'],
    // 标点随原文：两句保持两句
    ['Could not create a codespace. Try again.', '无法创建代码空间。请重试。'],
    ['Failed to rename codespace. Please try again.', '重命名代码空间失败。请重试。'],
    [
      "You do not have write access to this codespace's repository. This will create a new fork of the repository at",
      '你没有此代码空间所属存储库的写入访问权限。这会将此存储库复刻到'
    ]
  ])('%s → %s', (input, expected) => {
    expect(dict.static?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('存储库页 Code 下拉框的 Codespaces 标签页同样生效', () => {
    expect(matcher.translate('Your workspaces in the cloud', ['common', 'repository', 'code'])).toBe('你的云端工作区')
    expect(matcher.translate('2-core', ['common', 'repository', 'code'])).toBe('2 核')
    expect(repoMatcher.translate('Create codespace on main', ['common', 'repository', 'code'])).toBe('在 main 上创建代码空间')
    expect(repoMatcher.translate('6-core', ['common', 'repository', 'code'])).toBe('6 核')
  })

  it('分支名不进 static', () => {
    const branchKey = /^Create (?:a )?codespace on (?!default branch$)/
    expect(Object.keys(dict.static ?? {}).filter(key => branchKey.test(key))).toEqual([])
  })

  it('保留首尾空白', () => {
    expect(matcher.translateRaw('  Your codespaces \n', ['common', 'codespaces'])).toBe('  你的代码空间 \n')
  })

  it('产品名按 product-names.md 译成中文：译文不再保留英文 codespace（徽章图片上的“Open in Codespaces”除外）', () => {
    const entries = [...Object.entries(dict.static ?? {}), ...Object.entries(dict.scoped ?? {})]
    const english = entries.filter(([, value]) => /codespace/i.test(value.replace(/“Open in Codespaces”/g, '')))
    expect(english).toEqual([])
    // 单独的 Codespaces（标签页、导航项）由 common 的全局词条翻译，本词典不重复收录
    expect(dict.static?.Codespaces).toBeUndefined()
  })
})

describe('codespaces 页面词条', () => {
  it.each([
    ['Active', '活动中'],
    ['Stopped', '已停止'],
    ['Region', '区域'],
    ['Retained', '已保留'],
    ['View logs', '查看日志'],
    ['Blank', '空白'],
    ['Create branch', '创建分支'],
    ['Switch branches', '切换分支'],
    ['Find a branch...', '查找分支...'],
    ['billing settings', '计费设置'],
    ['new codespace', '新的代码空间'],
    // 单独的进度动名词作“X中”
    ['Exporting', '导出中'],
    ['Starting', '启动中'],
    ['Stopping', '停止中'],
    ['Shutting down', '关闭中'],
    ['Rebuilding', '重新构建中'],
    ['Provisioning', '预配中'],
    // 状态标签与运行、检查状态一致
    ['Queued', '已排队']
  ])('%s → %s', (input, expected) => {
    expect(dict.scoped?.[input]).toBe(expected)
    expect(translate(input)).toBe(expected)
  })

  it('不在其他页面生效', () => {
    expect(matcher.translate('Active', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Last used 3 days ago', ['common', 'repository', 'code'])).toBeUndefined()
    expect(matcher.translate('6-core', ['common', 'repository', 'code'])).toBeUndefined()
    expect(matcher.translate('By github', ['common', 'repository'])).toBeUndefined()
    expect(matcher.translate('Start here', ['common', 'repository'])).toBeUndefined()
  })

  it('Select repository 不收 scoped，由 common-ui 翻译', () => {
    expect(dict.scoped?.['Select repository']).toBeUndefined()
    expect(translate('Select repository')).toBeUndefined()
    expect(commonUi.static?.['Select repository']).toBeDefined()
  })
})
