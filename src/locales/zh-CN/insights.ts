import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import charts from './insights/charts'
import community from './insights/community'
import dependencyGraph from './insights/dependency-graph'
import graphs from './insights/graphs'
import network from './insights/network'
import people from './insights/people'
import pulse from './insights/pulse'
import traffic from './insights/traffic'

/**
 * 页面类型 insights：存储库「洞察」标签页（pulse、graphs、network、forks、community、
 * stargazers、watchers）。
 * 许可证 / 行为准则模板选择器（/community/license/new、/community/code-of-conduct/new）同时属于 code 页面类型，
 * 由 code 词典收录。
 */
export default mergeDictionaries(pulse, graphs, charts, dependencyGraph, network, community, people, traffic) satisfies PageDictionary
