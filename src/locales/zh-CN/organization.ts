import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import pages from './organization/pages'
import reposFilter from './organization/repos-filter'
import reposList from './organization/repos-list'

/**
 * 组织页与个人存储库列表（/repos）：组织头部与概述、人员、团队、项目列表、关注者、赞助、洞察，
 * 以及两处共用的 React 存储库列表与筛选框。
 * 「Repositories」「Projects」「Teams」「Insights」「Settings」「Discussions」由 common 收录；
 * 个人主页与组织主页共用的词条（Overview、Packages、Pinned、followers 等）在 profile 词典。
 * /<name> 同时套用 profile 与 organization 词典，个人主页的项目、关注者标签页也由这里补充。
 * 正则按合并顺序匹配：筛选框的宽泛规则（<值>, <键> 等）排在最后。
 */
export default mergeDictionaries(pages, reposList, reposFilter) satisfies PageDictionary
