import type { PageDictionary } from '../../../core/types'

/**
 * 存储库（/settings/repositories）、已删除的存储库（/settings/deleted_repositories）、
 * 软件包（/settings/packages）、GitHub 页面（/settings/pages）、已保存回复（/settings/replies）、
 * GitHub 模型（/settings/models）。产品名按用户要求译成中文（GitHub Pages → GitHub 頁面、Models → 模型）。
 * 术语：restore → 還原，override → 覆寫，claim（域）→ 宣告擁有，propagate → 傳播，rate limit → 速率限制。
 */
export default {
  static: {
    // 存储库默认分支
    'Repository default branch': '儲存庫預設分支',
    'Choose the default branch for your new personal repositories. You might want to change the default name due to different workflows, or because your integrations still require “master” as the default branch name. You can always change the default branch name on individual repositories.':
      '為你的新個人儲存庫選擇預設分支。你可能因為工作流程不同，或整合仍要求以「master」作為預設分支名稱，而想變更預設名稱。你隨時可以變更個別儲存庫的預設分支名稱。',
    'Choose the default branch for your new personal repositories. You might want to change the default name due to different workflows, or because your integrations still require "master" as the default branch name. You can always change the default branch name on individual repositories.':
      '為你的新個人儲存庫選擇預設分支。你可能因為工作流程不同，或整合仍要求以「master」作為預設分支名稱，而想變更預設名稱。你隨時可以變更個別儲存庫的預設分支名稱。',
    'Learn more about default branches.': '瞭解預設分支。',
    'Learn more about default branches': '瞭解預設分支',
    'Default branch name': '預設分支名稱',
    'You don’t have any repositories yet. Would you like to': '你還沒有任何儲存庫。是否要',
    "You don't have any repositories yet. Would you like to": '你還沒有任何儲存庫。是否要',

    // 提交评论默认设置
    'Choose whether commit comments are enabled or disabled by default for repositories you own. Individual repositories can override this default.':
      '選擇你擁有的儲存庫預設啟用還是停用提交留言。個別儲存庫可以覆寫此預設設定。',
    'Choose whether commit comments are enabled or disabled by default for repositories you own. Individual repositories can override this default. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '選擇你擁有的儲存庫預設啟用還是停用提交留言。個別儲存庫可以覆寫此預設設定。現有的提交留言不受此設定影響，仍可查看、編輯和刪除。',
    'are enabled or disabled by default for repositories you own. Individual repositories can override this default.':
      '在你擁有的儲存庫中預設啟用還是停用。個別儲存庫可以覆寫此預設設定。',
    'are enabled or disabled by default for repositories you own. Individual repositories can override this default. Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '在你擁有的儲存庫中預設啟用還是停用。個別儲存庫可以覆寫此預設設定。現有的提交留言不受此設定影響，仍可查看、編輯和刪除。',
    'are enabled or disabled by default for repositories you own.': '在你擁有的儲存庫中預設啟用還是停用。',
    'Individual repositories can override this default.': '個別儲存庫可以覆寫此預設設定。',
    'Existing commit comments are not affected by this setting and will remain viewable, editable, and deletable.':
      '現有的提交留言不受此設定影響，仍可查看、編輯和刪除。',
    'Commit comments:': '提交留言：',
    'Enabled by default': '預設啟用',
    'Disabled by default': '預設停用',

    // 已删除的存储库
    'It may take up to an hour for repositories to be displayed here. You can only restore repositories that are not forks, or have not been forked.':
      '儲存庫最多可能需要一小時才會顯示在這裡。只能還原不是分叉且未被分叉的儲存庫。',
    'Learn more about restoring deleted repositories': '瞭解如何還原已刪除的儲存庫',
    'Learn more about restoring deleted repositories.': '瞭解如何還原已刪除的儲存庫。',
    "These repositories were deleted, but can't be restored by you. Contact support if you want to restore them.":
      '這些儲存庫已刪除，但你無法還原。如需還原，請聯絡支援團隊。',
    'These repositories were deleted, but can’t be restored by you. Contact support if you want to restore them.':
      '這些儲存庫已刪除，但你無法還原。如需還原，請聯絡支援團隊。',
    'This repository will be in a private state when it is restored. To change this state, go to settings once the repo is restored.':
      '此儲存庫還原後將為私人狀態。若要變更，請在儲存庫還原後前往設定。',
    'This repository will be in a public state when it is restored. To change this state, go to settings once the repo is restored.':
      '此儲存庫還原後將為公開狀態。若要變更，請在儲存庫還原後前往設定。',
    'Any team or collaborator permissions that previously existed for this repository will not be restored. If you require specific team or collaborator permissions, you will need to configure them in settings.':
      '此儲存庫原有的團隊或協作者權限不會還原。如需特定的團隊或協作者權限，你必須在設定中重新設定。',
    'I understand, restore this repository': '我瞭解，還原此儲存庫',
    'Restore repository': '還原儲存庫',
    'Queue…': '排入佇列中…',
    'Queue...': '排入佇列中...',

    // 软件包
    'Packages permissions': '套件權限',
    'Default Package Setting': '預設套件設定',
    'This setting will be applied to new Container, npm, rubygems and NuGet packages.':
      '此設定將套用到新的容器、npm、rubygems 和 NuGet 套件。',
    'Inherit access from source repository': '從來源儲存庫繼承存取權',
    'Deleted Packages': '已刪除的套件',
    'These are packages that have been previously deleted belonging to you. You can restore a package deleted within the last 30 days.':
      '以下是你先前刪除的套件。你可以還原過去 30 天內刪除的套件。',
    'Search deleted packages': '搜尋已刪除的套件',

    // GitHub 页面：已验证的域
    'Verified domains': '已驗證的網域',
    'Add a domain': '新增網域',
    'There are no verified domains.': '沒有已驗證的網域。',
    'Verify domains to restrict who can publish GitHub Pages on them.': '驗證網域，以限制誰可以在這些網域上發布 GitHub 頁面。',
    'One of your domains is unverified. Please verify it to prevent others from claiming it for their Pages sites.':
      '你的某個網域尚未驗證。請驗證此網域，以免他人宣告擁有並用於自己的頁面網站。',
    'Please verify your domain': '請驗證你的網域',
    'Continue verifying': '繼續驗證',
    'Review verification steps': '查看驗證步驟',
    'Delete verified domain': '刪除已驗證的網域',
    'This is a destructive action. Your GitHub Pages sites may lose their custom domains.':
      '這是具破壞性的動作。你的 GitHub 頁面網站可能會失去自訂網域。',
    'Your GitHub Pages sites may be unpublished from their custom domains if another organization claims ownership of this domain.':
      '如果其他組織宣告擁有此網域，你的 GitHub 頁面網站可能會從其自訂網域取消發布。',
    'I understand, delete verified domain': '我瞭解，刪除已驗證的網域',
    'Add a verified domain': '新增已驗證的網域',
    'Add a Pages verified domain': '新增頁面的已驗證網域',
    'What domain would you like to add?': '要新增哪個網域？',
    'Add domain': '新增網域',
    'Domain name has already been added': '此網域名稱已新增過',
    'Add a DNS TXT record': '新增 DNS TXT 記錄',
    // 「Before we can verify <strong>域</strong>, you’ll need to complete these steps:」
    'Before we can verify': '在我們驗證',
    ", you'll need to complete these steps:": '之前，你需要完成以下步驟：',
    ', you’ll need to complete these steps:': '之前，你需要完成以下步驟：',
    'Create a TXT record in your DNS configuration for the following hostname:': '在 DNS 設定中為以下主機名稱建立 TXT 記錄：',
    'Use this code for the value of the TXT record:': '使用以下驗證碼作為 TXT 記錄的值：',
    'Wait until your DNS configuration changes. This could take up to 24 hours to propagate.':
      '等待 DNS 設定變更生效。傳播最多可能需要 24 小時。',
    'Copy verification steps': '複製驗證步驟',
    'Your domain is verified. No further action is needed.': '你的網域已驗證。無需其他動作。',
    'Learn more about verifying custom domains for GitHub Pages.': '瞭解如何驗證 GitHub 頁面的自訂網域。',
    'Learn more about verifying custom domains for GitHub Pages': '瞭解如何驗證 GitHub 頁面的自訂網域',

    // 已保存回复
    'Saved replies are re-usable text snippets that you can use throughout GitHub comment fields. Saved replies can save you time if you’re often typing similar responses.':
      '已儲存的回覆是可在 GitHub 各處留言欄位中重複使用的文字片段。如果你經常輸入相似的回覆，已儲存的回覆能幫你節省時間。',
    "Saved replies are re-usable text snippets that you can use throughout GitHub comment fields. Saved replies can save you time if you're often typing similar responses.":
      '已儲存的回覆是可在 GitHub 各處留言欄位中重複使用的文字片段。如果你經常輸入相似的回覆，已儲存的回覆能幫你節省時間。',
    'Learn more about working with saved replies': '瞭解如何使用已儲存的回覆',
    'Learn more about working with saved replies.': '瞭解如何使用已儲存的回覆。',
    'No saved replies yet.': '尚無已儲存的回覆。',
    'Add a saved reply': '新增已儲存的回覆',
    'Saved reply title': '已儲存回覆標題',
    'Add a short title to your reply': '為回覆加上簡短標題',
    'Add your saved reply': '輸入要儲存的回覆',
    'Add saved reply': '新增已儲存的回覆',
    'Your saved reply was created successfully.': '已儲存的回覆建立成功。',
    'There was an error creating your SavedReply.': '建立已儲存的回覆時發生錯誤。',
    'Edit saved reply': '編輯已儲存的回覆',
    'Update saved reply': '更新已儲存的回覆',
    'Your saved reply was updated successfully.': '已儲存的回覆更新成功。',
    'Your saved reply was deleted successfully.': '已儲存的回覆刪除成功。',
    'Are you sure you want to delete this saved reply?': '確定要刪除此已儲存的回覆嗎？',

    // GitHub 模型
    'Models paid usage': '模型付費使用',
    'If enabled, usage beyond the free tier will be billed per token based on model pricing from your Models budget.':
      '啟用後，超出免費額度的使用量將依模型定價按權杖計費，並從你的模型預算中扣除。',
    'Models pricing': '模型定價',
    'To enable Models paid usage, a payment method is needed.': '啟用模型付費使用需要付款方式。',
    '. Enable paid usage to avoid interruption and add tokens.': '。啟用付費使用可避免中斷並增加權杖額度。'
  },
  scoped: {
    // 标签页标题（原文如此）
    Repositorys: '儲存庫',
    // 被链接隔开的句尾：「… on the <a>owner/repo</a> repository」
    repository: '儲存庫',
    'loading...': '載入中...',
    'loading…': '載入中…',
    // 「You don’t have any repositories yet. Would you like to <a>create one</a>?」
    'create one': '建立一個',
    'Deleted repositories': '已刪除的儲存庫',
    'Deleted Repositories': '已刪除的儲存庫',
    Deleted: '刪除於',
    by: '由',
    Restore: '還原',
    'Done!': '完成！',
    // 「Choose whether <strong>commit comments</strong> are enabled …」
    'Choose whether': '選擇',
    'Commit comments': '提交留言',
    'commit comments': '提交留言',
    'Default package settings': '預設套件設定',
    'Deleted packages': '已刪除的套件',
    'Please type': '請輸入',
    'to confirm.': '以確認。',
    'Add payment method': '新增付款方式',
    // 「You currently have <strong>free rate limits</strong>. Enable paid usage …」
    'You currently have': '你目前使用的是',
    'free rate limits': '免費速率限制'
  },
  regexp: [
    // 人：量词作「位」
    [/^(\d+) collaborators?$/, '$1 位協作者'],
    // 页面：删除已验证域后的提示
    [/^Verified domain ([\w.-]+) was deleted\.?$/, '已刪除已驗證的網域 $1'],
    [/^No recoverable repositories were found for (\S+)\.$/, '找不到 $1 可還原的儲存庫。'],
    [/^Are you sure you want to restore (\S+)\?$/, '確定要還原 $1 嗎？'],
    // 已删除的存储库「Deleted <relative-time> by <login>」：整句见 inline，不命中时与 Deleted、by 按片段拼读
    [/^by ([\w-]+)$/, '由 $1'],
    [/^No recoverable packages were found for (\S+)\.$/, '找不到 $1 可還原的套件。'],
    [/^Successfully verified ([\w.-]+?)(\.?)$/, (_, domain: string, dot: string) => `已成功驗證 ${domain}${dot ? '。' : ''}`]
  ],
  ignore: [
    // 已保存回复列表：回复标题与正文摘要是用户内容（行内带 /settings/replies/<id>/edit 编辑链接）
    '.Box-row:has(a[href*="/settings/replies/"][href$="/edit"]) :is(strong, .css-truncate, .css-truncate-target)'
  ],
  // 已删除的存储库：「Deleted <relative-time> by <login>」调整语序，时间槽位后不留空格，
  // 拼读为「已於 3 天前由 octocat 刪除」；不可还原的条目只有「Deleted <relative-time>」，不命中，按片段拼读
  inline: [[/^Deleted \{\} by ([\w-]+)$/, '已於 {}由 $1 刪除']]
} satisfies PageDictionary
