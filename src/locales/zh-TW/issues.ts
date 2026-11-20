import type { PageDictionary } from '../../core/types'
import { mergeDictionaries } from './helpers'
import viewer from './issues/viewer'
import timeline from './issues/timeline'
import metadata from './issues/metadata'
import create from './issues/create'
import filter from './issues/filter'
import labels from './issues/labels'
import milestones from './issues/milestones'
import views from './issues/views'
import list from './issues/list'
// 议题字段的日期选择器（Start date / Target date）与提交列表同一组件
import datePicker from './commits/date-picker'

/**
 * 议题（issues）：存储库议题列表、/issues 仪表板、议题详情页、侧栏元数据、时间线事件、
 * 新建议题（模板选择、表单）、筛选栏、标签页、里程碑页、已保存视图、议题字段的日期选择器。
 * 正则按合并顺序匹配：viewer / timeline / metadata 中更具体的规则排在 list / filter 之前。
 */
export default mergeDictionaries(
  viewer,
  timeline,
  metadata,
  create,
  filter,
  labels,
  milestones,
  views,
  list,
  datePicker
) satisfies PageDictionary
