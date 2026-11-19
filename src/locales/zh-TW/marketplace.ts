import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import apps from './marketplace/apps'
import browse from './marketplace/browse'
import listing from './marketplace/listing'
import manage from './marketplace/manage'

/**
 * 市场（Marketplace）：首页与搜索、类别、操作 / 应用详情页、计划与安装、透明度，
 * GitHub 应用页（/apps/*）与安装授权、订单与待处理页、上架新工具，上架项的创建与编辑。
 * GitHub Models 已下线（页面 404），不收录。
 * 繁体译名：Marketplace → 市集、action → 動作、app → 應用程式、计费 plan → 方案。
 */
export default mergeDictionaries(browse, listing, apps, manage) satisfies PageDictionary
