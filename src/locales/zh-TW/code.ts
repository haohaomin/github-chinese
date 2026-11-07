import type { PageDictionary } from '../../core/types'
import blob from './code/blob'
import banners from './code/banners'
import edit from './code/edit'
import licenses from './code/licenses'
import templates from './code/templates'
import tree from './code/tree'
import checkSummary from './commits/check-summary'
import checks from './commits/checks'
import { mergeDictionaries } from './helpers'

/**
 * 页面类型 code：存储库代码页（概述、tree、blob、blame、edit、new、upload、delete、find），
 * 以及许可证、行为准则模板选择页。许可证名称、说明收 static（新建存储库页的下拉框同样适用，见 code/licenses）。
 * 目录列表、分支信息栏、引用选择器、存储库概述侧栏由 repository 词典处理。
 * 合并 commits 词典的检查汇总正则与检查弹层词条（放在最后）：最新提交的检查弹层，代码页作用域不含 commits。
 */
export default mergeDictionaries(tree, blob, banners, licenses, edit, templates, checkSummary, checks) satisfies PageDictionary
