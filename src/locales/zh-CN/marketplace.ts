import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import agreement from './marketplace/agreement'
import apps from './marketplace/apps'
import browse from './marketplace/browse'
import listing from './marketplace/listing'
import manage from './marketplace/manage'

/**
 * 市场（Marketplace）：首页与搜索、类别、操作 / 应用详情页、计划与安装、透明度，
 * GitHub 应用页（/apps/*）与安装授权、订单与待处理页、上架新工具，上架项的创建与编辑，开发人员协议弹窗。
 * GitHub Models 已下线（页面 404），不收录。
 */
export default mergeDictionaries(browse, listing, apps, manage, agreement) satisfies PageDictionary
