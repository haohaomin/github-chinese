import { defineContentScript } from 'wxt/utils/define-content-script'
import { installTurboBridge } from '../core/turbo-bridge'

// 主世界：读得到页面的 window.Turbo；不用扩展 API。
// 扩展安装、更新后后台会再注入一次（Firefox 自动注入）：installTurboBridge 先卸载已装的桥接，接手它的状态
export default defineContentScript({
  // 与内容脚本同一组站点：没有 Turbo 的页面（状态页）强制重新访问时整页刷新
  matches: [
    'https://github.com/*',
    'https://gist.github.com/*',
    'https://www.githubstatus.com/*',
    'https://help.github.com/*',
    'https://support.github.com/*'
  ],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    installTurboBridge(window)
  }
})
