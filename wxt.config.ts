import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { defineConfig } from 'wxt'
import { packTablesPlugin } from './scripts/pack-tables'
import { stripVueStaticContentPlugin, VUE_COMPILER_OPTIONS } from './scripts/strip-vue-static-content'

/** Firefox 扩展 ID：上架 AMO 后不可更改 */
const GECKO_ID = '{3e156188-2ae6-4a69-8821-16410eba6e18}'
/** Firefox（桌面、Android）的最低版本 */
const FIREFOX_MIN_VERSION = '128.0'

/** 扩展生效的站点（含 GitHub 状态页、支持站点），与 src/shared/github.ts 保持一致（tests/unit/shared/github.test.ts 核对） */
export const GITHUB_ORIGINS = [
  'https://github.com/*',
  'https://gist.github.com/*',
  'https://www.githubstatus.com/*',
  'https://help.github.com/*',
  'https://support.github.com/*'
]

/** 企业版站点（自有域名）按需申请的主机权限：用户在弹出页、设置页启用某个站点时只申请该站点（见 src/shared/enterprise.ts） */
export const OPTIONAL_ORIGINS = ['*://*/*']

/** 源码包（AMO 审核用）收入的路径，也是构建标识的计算范围 */
export const SOURCES = [
  'src',
  'public',
  'scripts',
  'docs',
  'package.json',
  'bun.lock',
  'wxt.config.ts',
  'tsconfig.json',
  'README.md',
  'LICENSE'
]

/**
 * 源码包不收的路径，同 WXT 打包源码的默认排除：任一段以 . 开头（含输出目录 .output）、node_modules、__tests__、
 * 测试文件（*.test.*、*.spec.*）、web-ext.config.ts。计算构建标识时同样跳过，审核者解压源码包后算出的相同
 */
export function excludedFromSources(path: string): boolean {
  const segments = path.split('/')
  const name = segments.at(-1) ?? ''
  return (
    segments.some(segment => segment.startsWith('.') || segment === 'node_modules' || segment === '__tests__') ||
    /\.(test|spec)\./.test(name) ||
    name === 'web-ext.config.ts'
  )
}

/**
 * 项目根目录（本文件所在目录），即 WXT 的根目录与源码包的根目录。构建标识按它读取源码：
 * 命令行可指定根目录（`wxt build <root>`），当前目录不一定是项目根目录
 */
const ROOT = import.meta.dirname

/** 路径下源码包收入的文件（相对项目根目录的 posix 路径） */
function sourceFiles(path: string): string[] {
  const absolute = `${ROOT}/${path}`
  if (excludedFromSources(path) || !existsSync(absolute)) return []
  const stat = statSync(absolute)
  if (stat.isFile()) return [path]
  if (!stat.isDirectory()) return []
  return readdirSync(absolute).flatMap(name => sourceFiles(`${path}/${name}`))
}

/**
 * 构建标识（见 src/shared/build-id.ts）：源码包内文件的内容哈希。源码不同则不同，
 * 同一份源码的各次构建相同（AMO 审核要求可复现），与当前目录无关。
 * 按路径排序，逐个写入「路径 + \0 + 原始字节 + \0」，sha256 取前 12 位
 */
export function computeBuildId(sources: readonly string[] = SOURCES): string {
  const hash = createHash('sha256')
  for (const file of sources.flatMap(sourceFiles).sort()) {
    const content = readFileSync(`${ROOT}/${file}`)
    hash.update(file).update('\0').update(content).update('\0')
  }
  return hash.digest('hex').slice(0, 12)
}

/** 构建标识：第一次用到时计算，同一次构建的各脚本共用；环境变量 GCN_BUILD_ID 可覆盖 */
let buildId: string | undefined

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  // 模板不生成字符串化的静态片段，Vue 运行时插入它们的 innerHTML 代码随之去掉（见 scripts/strip-vue-static-content.ts）
  vue: { vite: { template: { compilerOptions: VUE_COMPILER_OPTIONS } } },
  vite: () => {
    buildId ??= process.env.GCN_BUILD_ID || computeBuildId()
    return {
      define: { __GCN_BUILD_ID__: JSON.stringify(buildId) },
      plugins: [
        // 词典的 static / scoped 表改写成字符串，缩短词典脚本在 document_start 的编译与执行（见 scripts/pack-tables.ts）
        packTablesPlugin(`${ROOT}/src/locales`),
        stripVueStaticContentPlugin()
      ]
    }
  },
  // 各浏览器统一使用 MV3（WXT 对 Firefox、Safari 默认 MV2）
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    // 名称、描述随浏览器界面语言（public/_locales），没有对应语言时用英文
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    // scripting：按当前语言注册词典内容脚本（页面开始解析前就绪），动态导入失败（Firefox、Safari 不动态导入）时注入词典脚本；
    // Chromium、Safari 安装、更新后向已打开的 GitHub 标签页注入脚本（Firefox 自动注入）；为已授权的企业版站点注册内容脚本。
    // activeTab：打开弹出页时读取当前页的地址、识别是否是企业版站点。scripting、activeTab 均无安装、更新提示。
    // 可选主机权限不在安装、更新时申请，也无提示
    permissions: ['storage', 'scripting', 'activeTab'],
    host_permissions: GITHUB_ORIGINS,
    optional_host_permissions: OPTIONAL_ORIGINS,
    action: {
      default_title: '__MSG_extName__'
    },
    // 词典脚本由内容脚本动态导入（见 src/shared/locale-loader.ts），只对 GitHub 页面开放，用会话随机地址，
    // 页面无法据固定地址探测扩展。Firefox、Safari 不动态导入（改请后台注入），不开放
    ...(browser === 'firefox' || browser === 'safari'
      ? {}
      : {
          web_accessible_resources: [{ resources: ['locale-*.js'], matches: GITHUB_ORIGINS, use_dynamic_url: true }]
        }),
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            // 最低 128：主世界内容脚本（turbo-bridge）、可选主机权限（企业版站点）从 128 起支持。
            // data_collection_permissions 从 140（Android 142）起生效，更早的版本忽略；不收集数据，无需另做同意流程
            gecko: {
              id: GECKO_ID,
              strict_min_version: FIREFOX_MIN_VERSION,
              data_collection_permissions: { required: ['none'] }
            },
            gecko_android: {
              strict_min_version: FIREFOX_MIN_VERSION
            }
          }
        }
      : {}),
    // 主世界内容脚本（src/entrypoints/turbo-bridge.content.ts）从 Safari 18 起支持
    ...(browser === 'safari' ? { browser_specific_settings: { safari: { strict_min_version: '18.0' } } } : {})
  }),
  zip: {
    includeSources: SOURCES
  },
  webExt: {
    startUrls: ['https://github.com/vuejs/core']
  }
})
