import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import reposFilter from './organization/repos-filter'

/** 策略页自有的词条：目标存储库的筛选提示与匹配计数 */
const policies = {
  static: {
    'Add a filter using the input to match repositories.': '使用輸入框新增篩選器以比對儲存庫。',
    'No filter added. Add a filter using the input to match repositories.': '未新增篩選器。使用輸入框新增篩選器以比對儲存庫。'
  },
  regexp: [
    // 目标存储库计数：0 repositories matching（数量、名词、matching 是相邻文本节点，整体匹配）
    [/^([\d,]+) repositor(?:y|ies) matching$/, '$1 個符合的儲存庫']
  ]
} satisfies PageDictionary

/**
 * 组织设置的存储库策略页（/organizations/<组织>/settings/policies/*）：叠加在 org-settings 之上。
 * 目标存储库的筛选框与存储库列表的筛选框是同一组件，沿用 organization/repos-filter；
 * 只在本页面类型生效，避免宽泛的筛选规则影响其他组织设置页。
 */
export default mergeDictionaries(reposFilter, policies) satisfies PageDictionary
