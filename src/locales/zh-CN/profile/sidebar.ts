import type { PageDictionary } from '../../../core/types'

/** 本地时间差：「1h」「5.5h」「5h30m」「30m」→ 1 小时、5.5 小时、5 小时 30 分钟、30 分钟 */
function formatOffset(offset: string): string {
  const hours = /(\d+(?:\.\d+)?)h/.exec(offset)?.[1]
  const minutes = /(\d+)m/.exec(offset)?.[1]
  const parts = [hours === undefined ? '' : `${hours}小时`, minutes === undefined ? '' : `${minutes}分钟`]
  return parts.filter(Boolean).join(' ')
}

/**
 * 个人主页头部与侧栏：标签导航、名片信息、关注与赞助、亮点、置顶存储库、私密个人资料提示、
 * 阻止与举报对话框、编辑个人资料表单、个人资料自述文件入口。
 * 「Stars」「Organizations」「Repositories」「Projects」「Following」及状态对话框由 common 收录；
 * 「Sponsors」common 译“赞助”（导航项），侧栏赞助者列表标题在本文件 scoped 译“赞助者”。
 */
export default {
  static: {
    // 标签导航
    'User profile': '用户个人资料',
    Overview: '概述',
    Packages: '软件包',
    Sponsoring: '正在赞助',

    // 名片
    'Change your avatar': '更换头像',
    'Edit profile': '编辑个人资料',
    Follow: '关注',
    Unfollow: '取消关注',
    // 计数片段：<span>329k</span> followers → 329k 个关注者
    followers: '个关注者',
    follower: '个关注者',
    following: '正在关注',
    // Followed by <用户>, <用户>, and N more
    'Followed by': '关注者包括',
    Sponsor: '赞助',
    'Private Sponsor': '私密赞助者',
    'Member since': '加入时间',
    Joined: '加入于',
    '- same time': '- 时间相同',

    // 亮点
    Highlights: '亮点',
    'Developer Program Member': '开发人员计划成员',
    'Security Bug Bounty Hunter': '安全漏洞赏金猎人',
    'GitHub Campus Expert': 'GitHub 校园专家',
    'security advisory credit': '次安全公告致谢',
    'security advisory credits': '次安全公告致谢',
    // PRO 徽章的 title；方案名按用户要求译出（可见文字 Pro 由 common 的全局词条译“专业版”）
    'Label: Pro': '标签：专业版',

    // 个人资料自述文件（本人主页）
    'Edit your profile readme file': '编辑个人资料自述文件',
    'GitHub profile guide': 'GitHub 个人资料指南',

    // 置顶存储库
    Pinned: '置顶',
    'Popular repositories': '热门存储库',
    'Customize your pins': '自定义置顶项',
    'Customize pins': '自定义置顶项',
    'Edit pinned items': '编辑置顶项',
    'Select up to six public repositories or gists you’d like to show to anyone.': '最多选择六个要向所有人展示的公共存储库或代码片段。',
    "Select up to six public repositories or gists you'd like to show to anyone.": '最多选择六个要向所有人展示的公共存储库或代码片段。',
    'Select up to six public repositories you’d like to show to anyone.': '最多选择六个要向所有人展示的公共存储库。',
    "Select up to six public repositories you'd like to show to anyone.": '最多选择六个要向所有人展示的公共存储库。',
    'Select up to six public repositories you’d like to show.': '最多选择六个要展示的公共存储库。',
    "Select up to six public repositories you'd like to show.": '最多选择六个要展示的公共存储库。',
    'Filter repositories and gists': '筛选存储库和代码片段',
    'Show:': '显示：',
    'Save pins': '保存置顶项',
    'Drag to reorder': '拖动以调整顺序',
    'Order updated.': '顺序已更新。',
    'Your pins have been updated.': '置顶项已更新。',
    'Your pins have been updated. Drag and drop to reorder them.': '置顶项已更新。拖放可调整顺序。',
    'Your popular repositories will now be shown instead of your pins.': '现在将显示你的热门存储库而不是置顶项。',

    // 私密个人资料（本人主页）
    'Only you can see your full profile.': '仅你可以查看完整的个人资料。',
    'You have marked your profile as private, which limits what activity other people can see.':
      '你已将个人资料设为私密，其他人能看到的活动将受到限制。',
    'Update profile settings': '更新个人资料设置',
    'View what others see': '查看他人所见',
    'View full profile': '查看完整个人资料',

    // 阻止与举报
    'Block or Report': '阻止或举报',
    'Block or report user': '阻止或举报用户',
    'Block or Report user': '阻止或举报用户',
    'Block user': '阻止用户',
    'Unblock user': '取消阻止用户',
    'You have blocked this user': '你已阻止此用户',
    'Unblock or report user': '取消阻止或举报用户',
    'Prevent this user from interacting with your repositories and sending you notifications. Learn more about':
      '阻止此用户与你的存储库互动并向你发送通知。了解',
    'Allow this user to interact with your repositories and send you notifications. Learn more about':
      '允许此用户与你的存储库互动并向你发送通知。了解',
    'blocking users': '阻止用户',
    'You must be logged in to block users.': '登录后才能阻止用户。',
    'Close all issues, pull requests, and discussions opened by this user': '关闭此用户创建的所有议题、拉取请求和讨论',
    'Content in all repositories owned by your account will be closed.': '你的帐户拥有的所有存储库中的相关内容都将被关闭。',
    'Add an optional note': '添加可选备注',
    'Maximum 250 characters. Please don’t include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.':
      '最多 250 个字符。请勿包含法定姓名或电子邮件地址等个人信息。支持 Markdown。此备注仅你可见。',
    "Maximum 250 characters. Please don't include any personal information such as legal names or email addresses. Markdown is supported. This note will only be visible to you.":
      '最多 250 个字符。请勿包含法定姓名或电子邮件地址等个人信息。支持 Markdown。此备注仅你可见。',
    'Report abuse': '举报滥用行为',
    'Contact GitHub support about this user’s behavior. Learn more about': '就此用户的行为联系 GitHub 支持。了解',
    "Contact GitHub support about this user's behavior. Learn more about": '就此用户的行为联系 GitHub 支持。了解',
    'reporting abuse': '举报滥用行为',

    // 编辑个人资料表单
    'You can @mention other users and organizations to link to them.': '你可以 @提及 其他用户和组织以链接到其主页。',
    'other users and organizations to link to them.': '其他用户和组织以链接到其主页。'
  },
  scoped: {
    Followers: '关注者',
    // 侧栏赞助者列表标题 <h2>Sponsors</h2>
    Sponsors: '赞助者',
    // 编辑个人资料表单（设置页的同名字段由设置词典负责）
    Bio: '个人简介',
    'Add a bio': '添加个人简介',
    Pronouns: '代词',
    "Don't specify": '不指定',
    'Don’t specify': '不指定',
    Website: '网站',
    Location: '所在地',
    'Display current local time': '显示当前本地时间',
    'Social accounts': '社交帐户',
    'Social account': '社交帐户',
    Custom: '自定义',
    'Time zone': '时区',
    'You can': '你可以',
    // Display <PRO> badge.
    Display: '显示',
    'badge.': '徽章。',
    'Filter repositories': '筛选存储库',
    // 置顶对话框加载失败：Something went wrong. <Retry.>
    'Retry.': '重试。'
  },
  regexp: [
    // 正在关注计数（数字与文字拼接后）；N followers 由 common-ui 的通用计数规则翻译
    [/^(\d[\d.,]*[kKmM]?) following$/, '正在关注 $1 人'],
    [/^Sponsor @([\w-]+)$/, '赞助 @$1'],
    [/^Block or report ([\w-]+)$/, '阻止或举报 $1'],
    // 名片 aria-label
    [/^Organization: (.+)$/, '组织：$1'],
    [/^Home location: (.+)$/, '所在地：$1'],
    [/^Email: (\S+@\S+)$/, '电子邮件：$1'],
    // 本地时间：- 1h ahead / - 7h behind / - 5h30m ahead（时与分之间不带空格；带空格的写法同样接受）
    [
      /^- (\d+(?:\.\d+)?h(?: ?\d+m)?|\d+m) (ahead|behind)$/,
      (_, offset, direction) => `- ${direction === 'ahead' ? '快' : '慢'}${formatOffset(offset)}`
    ],
    // 组织头像溢出：+ 12 more
    [/^\+ (\d+) more$/, '另有 $1 个'],
    [/^(\d+) security advisory credits?$/, '$1 次安全公告致谢'],
    // 编辑个人资料：社交帐户输入框
    [/^Link to social profile (\d)$/, '社交帐户链接 $1'],
    // 置顶项排序按钮：Move hello-world up
    [/^Move (.+?) (up|down)$/, (_, name, direction) => `${direction === 'up' ? '上移' : '下移'} ${name}`]
  ],
  ignore: [
    // 状态消息（姓名、简介、公司、所在地、置顶存储库由全局忽略规则处理）
    '.user-status-message-wrapper',
    // 页头面包屑首项的用户名（today 这类用户名会被当成时间词翻译）
    'li:first-child > [class*="contextCrumb__"]',
    // 个人资料自述文件标题中的「用户名/用户名」
    '.profile-readme .text-mono'
  ],
  // 正在关注计数被 <span> 拆开：<a><span>31</span> following</a>（链接内没有图标）
  inline: [['{} following', '正在关注 {} 人']]
} satisfies PageDictionary
