import type { PageDictionary, RegExpRule } from '../../../core/types'
import { withCategory } from './categories'

const regexp: readonly RegExpRule[] = [
  // 选择类别页的按钮名称：Get started with Q&A category
  [/^Get started with (.+) category$/, (_, name) => withCategory('开始使用', name, '类别')],
  // 投票选项输入框：Option 3
  [/^Option (\d+)$/, '选项 $1']
]

/**
 * 新建讨论：选择类别（/discussions/new/choose）、讨论表单与投票表单、首次发帖提示、侧栏帮助资源。
 * 正文编辑器与通用按钮由 common-ui 词典负责。
 */
export default {
  static: {
    // 选择类别
    'Start a new discussion': '开始新讨论',
    'Select a discussion category': '选择讨论类别',
    'It looks like this is your first time starting a discussion in this repository!': '看起来这是你第一次在此存储库中开始讨论！',
    'This is a community we build together. Please be welcoming and open minded.': '这是我们共同建设的社区。请保持友善和开放的心态。',

    // 讨论表单
    'Discussion title': '讨论标题',
    'Ask a question, start a conversation, or make an announcement': '提出问题、发起对话或发布公告',
    // If this doesn’t look right you can <a>choose a different category.</a>（原文无逗号，译文不加）
    'If this doesn’t look right you can': '类别不合适时可以',
    "If this doesn't look right you can": '类别不合适时可以',
    'choose a different category.': '选择其他类别。',
    'Start discussion': '开始讨论',
    'Start poll': '开始投票',
    "Since you're new here, we're helping you to get started by generating your first post to the community. Don't worry, you can edit this discussion after you post!":
      '你是新成员，我们为你生成了面向社区的第一篇帖子来帮助你上手。别担心，发布后仍可编辑此讨论！',
    'Since you’re new here, we’re helping you to get started by generating your first post to the community. Don’t worry, you can edit this discussion after you post!':
      '你是新成员，我们为你生成了面向社区的第一篇帖子来帮助你上手。别担心，发布后仍可编辑此讨论！',
    // I have done a <a>search for similar discussions</a> / Reminder to <a>search for similar discussions</a>
    'search for similar discussions': '搜索类似讨论',

    // 投票表单
    'Poll question': '投票问题',
    'Ask your question here (required)': '在此输入你的问题（必填）',
    'Poll options': '投票选项',
    'Option 1 (required)': '选项 1（必填）',
    'Option 2 (required)': '选项 2（必填）',
    '+ Add an option': '+ 添加选项',
    'Add an option': '添加选项',

    // 页面标题段：New Discussion · owner/repo · Category selection
    'Category selection': '选择类别'
  },
  scoped: {
    'Get started': '开始使用',
    'Category:': '类别：',
    Option: '选项',
    'I have done a': '我已',
    'Reminder to': '记得',
    'Fields marked with an asterisk (*) are required.': '标有星号 (*) 的字段为必填项。',

    // 侧栏帮助资源
    'Helpful resources': '实用资源',
    'Security policy': '安全策略',
    Contributing: '贡献指南'
  },
  regexp
} satisfies PageDictionary
