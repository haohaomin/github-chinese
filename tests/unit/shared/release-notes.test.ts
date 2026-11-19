import {
  fetchReleaseNotes,
  htmlToBlocks,
  notesBetween,
  notesFromApi,
  notesFromFeed,
  parseInline,
  parseMarkdown,
  RELEASE_NOTES_TIMEOUT_MS,
  RELEASES_API_URL,
  RELEASES_FEED_URL,
  safeUrl,
  type NoteBlock,
  type ReleaseNote,
  type ReleaseNotesDeps
} from '../../../src/shared/release-notes'
import { REPOSITORY_URL } from '../../../src/shared/extension'

const parse: ReleaseNotesDeps['parse'] = (text, type) => new DOMParser().parseFromString(text, type)

function release(version: string, body: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { html_url: `${REPOSITORY_URL}/releases/tag/v${version}`, body, draft: false, prerelease: false, ...extra }
}

function note(version: string): ReleaseNote {
  return { version, blocks: [] }
}

/** 块里的文字（检查结构时只看文字） */
function textOf(blocks: readonly NoteBlock[]): string {
  return JSON.stringify(blocks)
}

describe('parseInline', () => {
  it('粗体、代码、链接、换行、转义；链接只收 http、https', () => {
    expect(parseInline('**加粗**与`code`、[说明](https://github.com/a)\n下一行 \\*星号\\*')).toEqual([
      { type: 'strong', children: [{ type: 'text', text: '加粗' }] },
      { type: 'text', text: '与' },
      { type: 'code', text: 'code' },
      { type: 'text', text: '、' },
      { type: 'link', href: 'https://github.com/a', children: [{ type: 'text', text: '说明' }] },
      { type: 'break' },
      { type: 'text', text: '下一行 *星号*' }
    ])
    expect(parseInline('[危险](javascript:alert(1))')).toEqual([{ type: 'text', text: '危险' }])
  })

  it('斜体；没有成对的记号原样保留', () => {
    expect(parseInline('*斜体* 与 3 * 4 与 `未闭合')).toEqual([
      { type: 'em', children: [{ type: 'text', text: '斜体' }] },
      { type: 'text', text: ' 与 3 * 4 与 `未闭合' }
    ])
  })
})

describe('parseMarkdown', () => {
  it('标题、段落、嵌套列表、引用、代码块', () => {
    const blocks = parseMarkdown(
      [
        '# 标题',
        '',
        '本次更新：',
        '',
        '### 新增功能',
        '',
        '- **时段范围**：可设天数。',
        '  - 默认 30 天。',
        '  - 可设 1–3650 天。',
        '- 第二项',
        '',
        '1. 第一步',
        '2. 第二步',
        '',
        '> 引用',
        '',
        '```',
        'const a = 1',
        '```'
      ].join('\r\n')
    )
    expect(blocks.map(block => block.type)).toEqual(['heading', 'paragraph', 'heading', 'list', 'list', 'quote', 'code'])
    const list = blocks[3]
    expect(list).toMatchObject({ type: 'list', ordered: false })
    if (list?.type !== 'list') throw new Error('不是列表')
    expect(list.items).toHaveLength(2)
    expect(list.items[0]?.map(block => block.type)).toEqual(['paragraph', 'list'])
    expect(textOf(list.items[0]!)).toContain('可设 1–3650 天。')
    expect(blocks[4]).toMatchObject({ type: 'list', ordered: true })
    expect(blocks[6]).toEqual({ type: 'code', text: 'const a = 1' })
  })

  it('项之间有空行时仍为同一列表', () => {
    const blocks = parseMarkdown('- 一\n\n- 二\n\n段落')
    expect(blocks.map(block => block.type)).toEqual(['list', 'paragraph'])
    expect(blocks[0]).toMatchObject({ items: [[{ type: 'paragraph' }], [{ type: 'paragraph' }]] })
  })
})

describe('htmlToBlocks', () => {
  it('GitHub 渲染的说明：标题旁的锚点、图片不收；链接只收 http、https', () => {
    const doc = parse(
      `<div class="markdown-heading"><h3 class="heading-element">新增功能</h3><a class="anchor" href="#x"><svg></svg></a></div>
       <ul><li><strong>时段</strong>：可设 <code>30</code> 天
         <ul><li>默认</li></ul></li></ul>
       <p>见 <a href="https://github.com/setube">说明</a>、<a href="javascript:alert(1)">危险</a><img src="x" alt="图"></p>
       <pre><code>code
</code></pre>`,
      'text/html'
    )
    const blocks = htmlToBlocks(doc.body)
    expect(blocks.map(block => block.type)).toEqual(['heading', 'list', 'paragraph', 'code'])
    expect(blocks[0]).toEqual({ type: 'heading', level: 3, children: [{ type: 'text', text: '新增功能' }] })
    expect(textOf(blocks)).not.toContain('javascript')
    expect(blocks[2]).toMatchObject({
      children: [{ text: '见 ' }, { type: 'link', href: 'https://github.com/setube' }, { text: '、' }, { text: '危险' }]
    })
    expect(blocks[3]).toEqual({ type: 'code', text: 'code' })
  })
})

describe('notesFromApi、notesFromFeed', () => {
  it('API：跳过草稿、预发行版与不是版本号的标签；去掉开头的一级标题', () => {
    const notes = notesFromApi([
      release('1.6.3', '# GitHub 中文化 1.6.3 版本更新说明\n\n正文'),
      release('1.6.2', '正文', { prerelease: true }),
      release('1.6.1', '正文', { draft: true }),
      { html_url: `${REPOSITORY_URL}/releases/tag/nightly`, body: '' },
      'bad'
    ])
    expect(notes).toEqual([{ version: '1.6.3', blocks: [{ type: 'paragraph', children: [{ type: 'text', text: '正文' }] }] }])
    expect(notesFromApi({ message: 'API rate limit exceeded' })).toBeUndefined()
  })

  it('Atom：条目的链接与内容（HTML）；不是订阅时为 undefined', () => {
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link rel="alternate" type="text/html" href="${REPOSITORY_URL}/releases/tag/v1.6.3"/>
          <content type="html">&lt;h1&gt;GitHub 中文化 1.6.3&lt;/h1&gt;&lt;p&gt;正文&lt;/p&gt;</content>
        </entry>
      </feed>`
    expect(notesFromFeed(feed, parse)).toEqual([
      { version: '1.6.3', blocks: [{ type: 'paragraph', children: [{ type: 'text', text: '正文' }] }] }
    ])
    expect(notesFromFeed('<html', parse)).toBeUndefined()
  })
})

it('notesBetween：当前版本（不含）到最新版本（含），新的在前，去重', () => {
  const notes = ['1.5.0', '1.6.3', '1.5.1', '1.7.0', '1.6.0', '1.6.3'].map(note)
  expect(notesBetween(notes, '1.5.0', '1.6.3').map(item => item.version)).toEqual(['1.6.3', '1.6.0', '1.5.1'])
})

it('safeUrl：相对地址按 github.com 解析；其他协议为 undefined', () => {
  expect(safeUrl('/setube')).toBe('https://github.com/setube')
  expect(safeUrl('mailto:a@b.c')).toBeUndefined()
})

describe('fetchReleaseNotes', () => {
  function deps(responses: Record<string, Partial<Response> | Error>): ReleaseNotesDeps & { fetch: ReturnType<typeof vi.fn> } {
    const fetch = vi.fn(async (url: string) => {
      const response = responses[url]
      if (!response || response instanceof Error) throw response ?? new TypeError('Failed to fetch')
      return response as Response
    })
    return { fetch, parse }
  }

  it('先取 API；不带 Cookie 与来源页', async () => {
    const mock = deps({
      [RELEASES_API_URL]: { ok: true, json: async () => [release('1.6.3', '正文'), release('1.6.2', '上一版'), release('1.6.1', '更早')] }
    })
    const notes = await fetchReleaseNotes('1.6.1', '1.6.3', mock)
    expect(notes?.map(item => item.version)).toEqual(['1.6.3', '1.6.2'])
    expect(mock.fetch).toHaveBeenCalledTimes(1)
    expect(mock.fetch.mock.calls[0]![1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' })
  })

  it('API 失败（限额用尽）：改取 Atom 订阅；都失败为 undefined', async () => {
    const feed = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><link href="${REPOSITORY_URL}/releases/tag/v1.6.3"/><content type="html">&lt;p&gt;正文&lt;/p&gt;</content></entry></feed>`
    const mock = deps({ [RELEASES_API_URL]: { ok: false }, [RELEASES_FEED_URL]: { ok: true, text: async () => feed } })
    expect((await fetchReleaseNotes('1.6.2', '1.6.3', mock))?.map(item => item.version)).toEqual(['1.6.3'])
    expect(await fetchReleaseNotes('1.6.2', '1.6.3', deps({}))).toBeUndefined()
  })

  it('超时：中止请求', async () => {
    vi.useFakeTimers()
    try {
      const fetch = vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
          })
      )
      const pending = fetchReleaseNotes('1.6.2', '1.6.3', { fetch, parse })
      await vi.advanceTimersByTimeAsync(RELEASE_NOTES_TIMEOUT_MS * 2)
      expect(await pending).toBeUndefined()
      expect(fetch).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })
})
