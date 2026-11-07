import { browser } from 'wxt/browser'

/** 扩展的源码存储库 */
export const REPOSITORY_URL = 'https://github.com/setube/github-chinese'

/** 反馈问题：新建议题（选择模板） */
export const FEEDBACK_URL = `${REPOSITORY_URL}/issues/new/choose`

/** Firefox 构建（WXT 的构建期常量 import.meta.env.FIREFOX）。测试环境（Vitest）里该值是字符串，按字符串比较 */
export function isFirefoxBuild(): boolean {
  return String(import.meta.env.FIREFOX) === 'true'
}

/** 扩展版本号；读取失败返回空串 */
export function getExtensionVersion(): string {
  try {
    return browser.runtime.getManifest().version
  } catch {
    return ''
  }
}
