import type { PageDictionary, RegExpRule } from '../../../core/types'
import { withCategory } from './categories'

const regexp: readonly RegExpRule[] = [
  // 选择类别页的按钮名称：Get started with Q&A category
  [/^Get started with (.+) category$/, (_, name) => withCategory('開始使用', name, '類別')],
  // 投票选项输入框：Option 3
  [/^Option (\d+)$/, '選項 $1']
]

/**
 * 新建讨论：选择类别（/discussions/new/choose）、讨论表单与投票表单、首次发帖提示、侧栏帮助资源。
 * 正文编辑器与通用按钮由 common-ui 词典负责。
 */
export default {
  static: {
    // 选择类别
    'Start a new discussion': '發起新討論',
    'Select a discussion category': '選擇討論類別',
    'It looks like this is your first time starting a discussion in this repository!': '看來這是你第一次在此儲存庫中發起討論！',
    'This is a community we build together. Please be welcoming and open minded.': '這是我們共同打造的社群。請保持友善和開放的心態。',

    // 讨论表单
    'Discussion title': '討論標題',
    'Ask a question, start a conversation, or make an announcement': '提出問題、發起對話或發布公告',
    // If this doesn’t look right you can <a>choose a different category.</a>（原文无逗号，译文不加）
    'If this doesn’t look right you can': '類別不合適時可以',
    "If this doesn't look right you can": '類別不合適時可以',
    'choose a different category.': '選擇其他類別。',
    'Start discussion': '發起討論',
    'Start poll': '發起投票',
    "Since you're new here, we're helping you to get started by generating your first post to the community. Don't worry, you can edit this discussion after you post!":
      '你是新成員，我們為你產生了第一篇社群貼文來協助你上手。別擔心，發布後仍可編輯此討論！',
    'Since you’re new here, we’re helping you to get started by generating your first post to the community. Don’t worry, you can edit this discussion after you post!':
      '你是新成員，我們為你產生了第一篇社群貼文來協助你上手。別擔心，發布後仍可編輯此討論！',
    // I have done a <a>search for similar discussions</a> / Reminder to <a>search for similar discussions</a>
    'search for similar discussions': '搜尋類似的討論',

    // 投票表单
    'Poll question': '投票問題',
    'Ask your question here (required)': '在此輸入你的問題（必填）',
    'Poll options': '投票選項',
    'Option 1 (required)': '選項 1（必填）',
    'Option 2 (required)': '選項 2（必填）',
    '+ Add an option': '+ 新增選項',
    'Add an option': '新增選項',

    // 页面标题段：New Discussion · owner/repo · Category selection
    'Category selection': '選擇類別'
  },
  scoped: {
    'Get started': '開始使用',
    'Category:': '類別：',
    Option: '選項',
    'I have done a': '我已',
    'Reminder to': '記得',
    'Fields marked with an asterisk (*) are required.': '標有星號 (*) 的欄位為必填。',

    // 侧栏帮助资源
    'Helpful resources': '實用資源',
    'Security policy': '安全性政策',
    Contributing: '貢獻指南'
  },
  regexp
} satisfies PageDictionary
