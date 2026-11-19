import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import fields from './projects/fields'
import insights from './projects/insights'
import items from './projects/items'
import list from './projects/list'
import settings from './projects/settings'
import templates from './projects/templates'
import views from './projects/views'
import workflows from './projects/workflows'

/**
 * 项目（新版 Projects）：项目列表、新建项目与模板、视图、项、字段、项目设置、工作流、洞察。
 * 页面类型 projects 覆盖 /orgs/<org>/projects…、/users/<user>/projects/<n>、/<owner>/<repo>/projects。
 * 正则按合并顺序匹配：views 中的具体规则（如 Actions for column:）须排在 list 等文件的通用规则之前。
 */
export default mergeDictionaries(views, fields, items, settings, workflows, insights, templates, list) satisfies PageDictionary
