import type { PageDictionary } from '../../../core/types'

/**
 * 存储库设置 · 规则集的导入与转换：导入分支保护规则对话框、单条分支保护规则转换为规则集对话框、
 * 「用自定义属性选择目标」横幅与新建自定义属性侧栏。
 * 「Enforcement status」「Ruleset name」等编辑器通用文字见 rulesets.ts。
 */
export default {
  static: {
    // 规则集列表页横幅
    'You have branch protection rules that can be converted': '你有可以转换的分支保护规则',
    'Rulesets offer layered enforcement, evaluate mode, and richer branch targeting. Import your existing rules to get started.':
      '规则集提供分层强制实施、评估模式和更丰富的分支目标。导入现有规则即可开始使用。',
    'Import branch protection rules': '导入分支保护规则',

    // 导入分支保护规则对话框
    'Review import': '审查导入',
    'Ruleset previews': '规则集预览',
    'Create ruleset': '创建规则集',
    'Create rulesets': '创建规则集',
    'Creating ruleset': '正在创建规则集',
    'Creating rulesets': '正在创建规则集',
    'Keep rule': '保留规则',
    'Keep rules': '保留规则',
    'Delete branch protection rule': '删除分支保护规则',
    'Delete branch protection rules': '删除分支保护规则',
    'Too many rules selected': '所选规则过多',
    'Selected branch protections would generate more than 75 rulesets.': '所选分支保护将生成超过 75 个规则集。',
    'No rules selected': '未选择规则',
    'You must select at least one branch protection rule to import.': '必须至少选择一条要导入的分支保护规则。',
    'No rules to create': '没有可创建的规则',
    'The current selection would not create any new rulesets.': '当前选择不会创建任何新规则集。',
    'Already covered by an existing ruleset': '已被现有规则集覆盖',
    'No rulesets would be created': '不会创建任何规则集',
    'Failed to load previews.': '加载预览失败。',
    'Your request timed out.': '请求超时。',
    'Failed to create rulesets.': '创建规则集失败。',
    'Failed to create rulesets and delete branch protection rules.': '创建规则集并删除分支保护规则失败。',

    // 规则行为变化提示
    'New behavior': '新行为',
    'Require conversation resolution:': '要求解决对话：',
    "In rulesets, requiring conversation resolution also requires a pull request. Comment resolution itself works the same, except you can't bypass it by merging without a pull request.":
      '在规则集中，要求解决对话也会要求拉取请求。解决评论的方式不变，只是无法通过不经拉取请求直接合并来绕过它。',
    'Merge queue and restricted pushers:': '合并队列与受限推送者：',
    'In rulesets, enabling merge queue and restricting updates for the same branch is not supported.':
      '规则集不支持对同一分支同时启用合并队列和限制更新。',

    // 转换为规则集对话框
    'Convert to ruleset': '转换为规则集',
    'Targeted branches': '目标分支',
    'Delete branch protection rule once migration is done': '迁移完成后删除分支保护规则',
    'The new ruleset will enforce this branch.': '新规则集将对此分支强制实施。',
    'The new rulesets will enforce this branch.': '新规则集将对此分支强制实施。',
    'Ruleset name is invalid': '规则集名称无效',
    'Unable to create the ruleset.': '无法创建规则集。',
    'Unable to load the migration preview.': '无法加载迁移预览。',
    'This branch protection rule has no rules that can be converted to a ruleset yet.': '此分支保护规则中暂无可转换为规则集的规则。',

    // 用自定义属性选择目标
    'Automate targeting with custom properties': '使用自定义属性自动选择目标',
    'Create property': '创建属性',
    'Set values for remaining repositories': '为其余存储库设置值',
    'New custom property': '新建自定义属性',
    'Save and apply': '保存并应用',
    'Failed to fetch properties': '获取属性失败',
    'Value is required': '值为必填项',
    'For the following repositories:': '对于以下存储库：',
    'Apply the following value:': '应用以下值：',
    'When you save:': '保存时：',
    'This ruleset will be updated to target repositories by this property and value instead of by name.':
      '此规则集将改为按此属性和值（而非名称）选择目标存储库。',
    'This is the default value that will be set for this property. Changing it has immediate effect, although on large organizations it may take minutes to be available in search results.':
      '这是此属性将设置的默认值。更改会立即生效，但在大型组织中，可能需要几分钟才能出现在搜索结果中。',
    'When creating, transferring, or updating the property values of repositories, users must provide an explicit value.':
      '创建、转让存储库或更新存储库的属性值时，用户必须提供明确的值。'
  },
  regexp: [
    // 导入对话框：<span>3 rulesets <span>will be created from 2 branch protection rules.</span></span>
    [/^will be created from (\d+) branch protection rules?\.$/, '将从 $1 条分支保护规则创建。'],
    [
      /^(\d+) rulesets? will be created\. Would you like to delete the (\d+) original branch protection rules? now covered by rulesets\?$/,
      '将创建 $1 个规则集。是否删除现已被规则集覆盖的 $2 条原有分支保护规则？'
    ],
    // 转换对话框
    [/^Create (\d+) rulesets from "(.{1,100})"$/, '从“$2”创建 $1 个规则集'],
    [/^Create (\d+) rulesets$/, '创建 $1 个规则集'],
    [/^This branch protection rule will be split into (\d+) rulesets\.$/, '此分支保护规则将拆分为 $1 个规则集。'],
    [/^, with (\d+) bypass actors?$/, '，含 $1 个绕过参与者'],
    // 用自定义属性选择目标
    [
      /^You've manually selected (\d+) repositories\. A custom property lets you target them as a group and keeps the list up to date as repositories change\.$/,
      '你已手动选择 $1 个存储库。自定义属性可将它们作为一组选为目标并在存储库变化时保持列表最新。'
    ],
    [/^Ruleset updated to target (.{1,100}) value$/, '规则集已更新为以 $1 值为目标'],
    [
      /^The (.{1,100}) property has been created and applied to the (\d+) selected repositories\. You should make sure to set values for the remaining repositories\.$/,
      '已创建 $1 属性并应用到 $2 个所选存储库。请确保为其余存储库设置值。'
    ],
    [/^This property will be set to this value on the (\d+) selected repositories\.$/, '此属性将在 $1 个所选存储库上设为此值。'],
    [/^and (\d+) more$/, '及另外 $1 个'],
    [/^Step (\d+) of (\d+)$/, '步骤 $1/$2']
  ]
} satisfies PageDictionary
