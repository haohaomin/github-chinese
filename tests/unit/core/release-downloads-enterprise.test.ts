// @vitest-environment-options { "url": "https://github.example.com/octocat/hello-world/releases" }
import { afterEach, expect, it, vi } from 'vitest'
import { COUNT_ATTRIBUTE, createReleaseDownloads } from '../../../src/core/release-downloads'
import type { ReleaseCountsResult, ReleaseRef } from '../../../src/shared/github-api'

afterEach(() => {
  document.body.innerHTML = ''
})

it('企业版站点（不在 github.com）：不请求、不显示', async () => {
  document.body.innerHTML = `
    <ul>
      <li class="Box-row">
        <a href="https://github.com/octocat/hello-world/releases/download/v1.0/sample.zip">sample.zip</a>
        <a href="/octocat/hello-world/releases/download/v1.0/sample.zip">sample.zip</a>
        <div class="flex-justify-end"><span>1 KB</span><span><relative-time datetime="2026-10-26T00:00:00Z"></relative-time></span></div>
      </li>
    </ul>`
  const request = vi.fn<(release: ReleaseRef) => Promise<ReleaseCountsResult>>()
  const downloads = createReleaseDownloads(document, { active: () => true, lang: () => 'zh-CN', label: String, request })
  await new Promise(done => setTimeout(done, 0))
  expect(request).not.toHaveBeenCalled()
  expect(document.querySelector(`[${COUNT_ATTRIBUTE}]`)).toBeNull()
  downloads.stop()
})
