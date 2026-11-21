import type { PageDictionary } from '../../../core/types'

/**
 * 通用提示：加载中、进行中、完成、出错、确认、登录提示。
 * 「Loading more...」「Updating…」「Deleting…」及「You must be signed in to …」系列由其它词典的 static 收录。
 */

export default {
  static: {
    // 加载
    Loading: '載入中',
    'Loading.': '載入中。',
    'Loading…': '載入中…',
    'Loading...': '載入中...',
    'Loading content…': '正在載入內容…',
    'Loading content...': '正在載入內容...',
    'Loading more…': '正在載入更多…',
    'Loading suggestions…': '正在載入建議…',
    'Loading details…': '正在載入詳細資料…',
    'Loading search results…': '正在載入搜尋結果…',

    // 进行中（按钮 data-disable-with 等）
    Updating: '更新中',
    'Updating...': '更新中...',
    'Creating...': '建立中...',
    'Creating…': '建立中…',
    Deleting: '刪除中',
    Submitting: '送出中',
    'Submitting…': '送出中…',
    'Submitting...': '送出中...',

    // 完成
    Success: '成功',
    'Saved!': '已儲存！',
    'Changes saved': '已儲存變更',
    // 设置页保存后的横幅（div.flash.flash-full.flash-notice）
    'Your Copilot settings have been updated.': '你的 Copilot 設定已更新。',

    // 出错
    'Uh oh!': '糟糕！',
    'Oops, something went wrong.': '糟糕，發生錯誤。',
    'There was an error while loading.': '載入時發生錯誤。',
    'Please reload this page': '請重新載入此頁面',
    'Something went wrong': '發生錯誤',
    'Something went wrong.': '發生錯誤。',
    'Hm, something went wrong': '嗯，發生錯誤',
    // 两句之间原文是句号，不改逗号（与 projects 等词典同译）
    'Something went wrong. Please try again.': '發生錯誤。請再試一次。',
    'Something went wrong. Please try again later.': '發生錯誤。請稍後再試。',
    'Something went wrong, please refresh the page to try again.': '發生錯誤，請重新整理頁面後再試一次。',
    // …If the problem persists, check the <a>GitHub status page</a>.
    'If the problem persists, check the': '如果問題持續發生，請查看',
    'GitHub status page': 'GitHub 狀態頁面',
    'Sorry, something went wrong.': '抱歉，發生錯誤。',
    'An unexpected error has occurred': '發生未預期的錯誤',
    'An unexpected error occurred': '發生未預期的錯誤',
    'An unexpected error occurred.': '發生未預期的錯誤。',
    'An error occurred. Please try again.': '發生錯誤。請再試一次。',
    'An error occurred, please try again.': '發生錯誤，請再試一次。',
    'An unknown error occurred. Please try again later.': '發生未知錯誤。請稍後再試。',
    'A network error occurred, please try again.': '發生網路錯誤，請再試一次。',
    'Please try again. If the problem persists, try again later.': '請再試一次。如果問題持續發生，請稍後再試。',
    'Refresh and try again.': '請重新整理後再試一次。',
    'Unknown error': '未知錯誤',
    'Unknown error occurred': '發生未知錯誤',
    'Runtime error': '執行階段錯誤',
    "Couldn't load": '無法載入',
    "Couldn't load the content": '無法載入內容',
    'A new version of GitHub is available. Please refresh the page.': 'GitHub 有新版本。請重新整理頁面。',

    // 确认
    'Are you sure?': '確定嗎？',
    'This action cannot be undone.': '此動作無法復原。',
    'This action cannot be undone': '此動作無法復原',
    'This cannot be undone.': '此動作無法復原。',
    'This cannot be undone': '此動作無法復原',

    // 登录提示
    'Sign in to view': '登入後查看',

    // 删除组织后仪表板的横幅「<strong>名称</strong> is being deleted.」：名称前没有文本节点、整句写不进去时只译这一段
    'is being deleted.': '正在刪除。'
  },
  regexp: [
    // 赞助按钮的未登录提示：You must be logged in to sponsor octocat
    [/^You must be logged in to sponsor ([\w-]+)$/, '登入後才能贊助 $1']
  ],
  inline: [
    // 删除组织后仪表板的横幅（名称在 <strong> 中）
    ['{} is being deleted.', '正在刪除 {}。']
  ]
} satisfies PageDictionary
