import type { PageDictionary } from '../../../core/types'

/**
 * 通用提示：加载中、进行中、完成、出错、确认、登录提示。
 * 「Loading more...」「Updating…」「Deleting…」及「You must be signed in to …」系列由其它词典的 static 收录。
 */

export default {
  static: {
    // 加载
    Loading: '加载中',
    'Loading.': '加载中。',
    'Loading…': '加载中…',
    'Loading...': '加载中...',
    'Loading content…': '正在加载内容…',
    'Loading content...': '正在加载内容...',
    'Loading more…': '正在加载更多…',
    'Loading suggestions…': '正在加载建议…',
    'Loading details…': '正在加载详细信息…',
    'Loading search results…': '正在加载搜索结果…',

    // 进行中（按钮 data-disable-with 等）
    Updating: '更新中',
    'Updating...': '更新中...',
    'Creating...': '创建中...',
    'Creating…': '创建中…',
    Deleting: '删除中',
    Submitting: '提交中',
    'Submitting…': '提交中…',
    'Submitting...': '提交中...',

    // 完成
    Success: '成功',
    'Saved!': '已保存！',
    'Changes saved': '更改已保存',
    // 设置页保存后的横幅（div.flash.flash-full.flash-notice）
    'Your Copilot settings have been updated.': '你的 Copilot 设置已更新。',

    // 出错
    'Uh oh!': '糟糕！',
    'Oops, something went wrong.': '糟糕，出错了。',
    'There was an error while loading.': '加载时出错。',
    'Please reload this page': '请重新加载此页面',
    'Something went wrong': '出错了',
    'Something went wrong.': '出错了。',
    'Hm, something went wrong': '嗯，出错了',
    // 两句之间原文是句号，不改逗号（与 projects 等词典同译）
    'Something went wrong. Please try again.': '出错了。请重试。',
    'Something went wrong. Please try again later.': '出错了。请稍后重试。',
    'Something went wrong, please refresh the page to try again.': '出错了，请刷新页面后重试。',
    // …If the problem persists, check the <a>GitHub status page</a>.
    'If the problem persists, check the': '如果问题仍然存在，请查看',
    'GitHub status page': 'GitHub 状态页',
    'Sorry, something went wrong.': '抱歉，出错了。',
    'An unexpected error has occurred': '发生意外错误',
    'An unexpected error occurred': '发生意外错误',
    'An unexpected error occurred.': '发生意外错误。',
    'An error occurred. Please try again.': '出错了。请重试。',
    'An error occurred, please try again.': '出错了，请重试。',
    'An unknown error occurred. Please try again later.': '发生未知错误。请稍后重试。',
    'A network error occurred, please try again.': '网络错误，请重试。',
    'Please try again. If the problem persists, try again later.': '请重试。如果问题仍然存在，请稍后再试。',
    'Refresh and try again.': '请刷新后重试。',
    'Unknown error': '未知错误',
    'Unknown error occurred': '发生未知错误',
    'Runtime error': '运行时错误',
    "Couldn't load": '无法加载',
    "Couldn't load the content": '无法加载内容',
    'A new version of GitHub is available. Please refresh the page.': 'GitHub 有新版本。请刷新页面。',

    // 确认
    'Are you sure?': '确定吗？',
    'This action cannot be undone.': '此操作无法撤销。',
    'This action cannot be undone': '此操作无法撤销',
    'This cannot be undone.': '此操作无法撤销。',
    'This cannot be undone': '此操作无法撤销',

    // 登录提示
    'Sign in to view': '登录后查看',

    // 删除组织后仪表板的横幅「<strong>名称</strong> is being deleted.」：名称前没有文本节点、整句写不进去时只译这一段
    'is being deleted.': '正在删除。'
  },
  regexp: [
    // 赞助按钮的未登录提示：You must be logged in to sponsor octocat
    [/^You must be logged in to sponsor ([\w-]+)$/, '登录后才能赞助 $1']
  ],
  inline: [
    // 删除组织后仪表板的横幅（名称在 <strong> 中）
    ['{} is being deleted.', '正在删除 {}。']
  ]
} satisfies PageDictionary
