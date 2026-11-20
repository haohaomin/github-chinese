import { lookupTable } from '../../../core/table'
import type { PageDictionary } from '../../../core/types'
import regions, { AMBIGUOUS_COUNTRIES, AMBIGUOUS_US_STATES } from '../common/regions'
import { joinCjk } from '../helpers'

const regionText = lookupTable(regions.static)

/** 中国的省级行政区（用简称）：地点的地区一段与直辖市；其余城市照录原文 */
const CHINA_PROVINCES: Readonly<Record<string, string>> = {
  Beijing: '北京',
  Tianjin: '天津',
  Hebei: '河北',
  Shanxi: '山西',
  'Inner Mongolia': '内蒙古',
  'Inner Mongolia Autonomous Region': '内蒙古',
  Liaoning: '辽宁',
  Jilin: '吉林',
  Heilongjiang: '黑龙江',
  Shanghai: '上海',
  Jiangsu: '江苏',
  Zhejiang: '浙江',
  Anhui: '安徽',
  Fujian: '福建',
  Jiangxi: '江西',
  Shandong: '山东',
  Henan: '河南',
  Hubei: '湖北',
  Hunan: '湖南',
  Guangdong: '广东',
  Guangxi: '广西',
  'Guangxi Zhuang Autonomous Region': '广西',
  Hainan: '海南',
  Chongqing: '重庆',
  Sichuan: '四川',
  Guizhou: '贵州',
  Yunnan: '云南',
  Tibet: '西藏',
  'Tibet Autonomous Region': '西藏',
  Xizang: '西藏',
  Shaanxi: '陕西',
  Gansu: '甘肃',
  Qinghai: '青海',
  Ningxia: '宁夏',
  'Ningxia Hui Autonomous Region': '宁夏',
  Xinjiang: '新疆',
  'Xinjiang Uyghur Autonomous Region': '新疆'
}

/** 表中的地名；不在表中时 undefined（只认自有属性） */
function ownName(table: Readonly<Record<string, string>>, name: string): string | undefined {
  return Object.hasOwn(table, name) ? table[name] : undefined
}

/**
 * 安全日志事件的地点「城市, 地区, 国家/地区」（地区常为空）：国家/地区名在 common/regions 中时才改写，
 * 按国家/地区、地区、城市排列，去掉空项与重名，收录的地名译出，其余保留原文。
 * 有歧义的国名（Chad、Georgia、Jordan）在国家/地区一段译出，美国的 Georgia 在地区一段译作州名，
 * 中国的地区（与直辖市同名的城市）译作省级行政区简称（见 common/regions 的 AMBIGUOUS_COUNTRIES、AMBIGUOUS_US_STATES 与 CHINA_PROVINCES）。
 * 国家/地区名不在其中时抛错（引擎按未命中处理，后面的规则照常匹配：日期、权限列表等同样是逗号分隔的三段）
 */
function eventLocation(_: string, city: string, region: string, country: string): string {
  const countryName = regionText(country) ?? ownName(AMBIGUOUS_COUNTRIES, country)
  if (countryName === undefined) throw new Error(`非地点：${country}`)
  const parts = [country, region, city].filter((part, index, all) => part !== '' && all.indexOf(part) === index)
  return parts
    .map(part => {
      if (part === country) return countryName
      const local =
        country === 'China'
          ? ownName(CHINA_PROVINCES, part)
          : country === 'United States' && part === region
            ? ownName(AMBIGUOUS_US_STATES, part)
            : undefined
      return local ?? regionText(part) ?? part
    })
    .join(' ')
}

/** 地点中的一段（不含捕获组）：以大写字母（含带变音符号的拉丁字母）开头，不含逗号、数字、冒号 */
const PLACE_SOURCE = '(?:[A-ZÀ-ÖØ-Þ][^,\\d:]*)'

const TOKEN_ACTION: Readonly<Record<string, string>> = {
  Created: '创建了',
  Regenerated: '重新生成了',
  Updated: '更新了',
  Revoked: '撤销了'
}

const TWO_FACTOR_METHOD: Readonly<Record<string, string>> = {
  'authenticator app': '身份验证器应用',
  SMS: '短信',
  'security key': '安全密钥',
  passkey: '通行密钥',
  'GitHub Mobile': 'GitHub 移动版',
  'recovery code': '恢复代码'
}

/** 审核日志搜索建议「action: filter by action」中的筛选对象 */
const FILTER_TARGET: Readonly<Record<string, string>> = {
  action: '操作',
  actor: '参与者',
  country: '国家/地区',
  'created date': '创建日期',
  operation: '操作类型',
  organization: '组织',
  repository: '存储库',
  user: '用户'
}

const FILTER_TARGET_SOURCE = '(action|actor|country|created date|operation|organization|repository|user)'

/** 令牌事件中的应用类型 */
const APP_KIND: Readonly<Record<string, string>> = { 'GitHub App': 'GitHub 应用', 'OAuth app': 'OAuth 应用' }

/** 括号里的名称：含汉字用全角括号，否则用半角括号并与前面的中文隔一个空格 */
function parenName(name: string): string {
  return /\p{Script=Han}/u.test(name) ? `（${name}）` : ` (${name})`
}

/**
 * 安全日志（/settings/security-log）、赞助日志（/settings/sponsors-log）、预定提醒（/settings/reminders）。
 * 安全日志事件描述被链接拆开的整句与组织审核日志共用（org-settings/audit-events）；其余按片段收录，未被拆开的整句由正则匹配。
 * 事件代码（user.login 等）和原始字段保留英文。
 */
export default {
  static: {
    // 安全日志：搜索、筛选与导出
    'Loading audit log entries…': '正在加载审核日志条目…',
    'Loading audit log entries...': '正在加载审核日志条目...',
    'Filter audit logs': '筛选审核日志',
    "Yesterday's activity": '昨天的活动',
    'Yesterday’s activity': '昨天的活动',
    'Repository management': '存储库管理',
    'Billing updates': '计费更新',
    'Copilot activity': 'Copilot 活动',
    'Personal access token activity': '个人访问令牌活动',
    'View advanced search syntax': '查看高级搜索语法',
    'Filter by Member': '按成员筛选',
    'Filter by Action': '按操作筛选',
    'Search audit logs': '搜索审核日志',
    'Search your security log': '搜索你的安全日志',
    'Events matching search query': '与搜索查询匹配的事件',
    'Recent events': '最近的事件',
    'Unknown IP address': '未知 IP 地址',
    'Unknown location': '未知位置',
    'View all events created yesterday': '查看昨天创建的所有事件',
    'View all events where you created something': '查看你创建内容的所有事件',
    'We couldn’t find any events matching your search.': '未找到与搜索匹配的事件。',
    "We couldn't find any events matching your search.": '未找到与搜索匹配的事件。',
    "Export job successfully created. Please don't close this window and note that an export job may take up to one hour to complete.":
      '导出任务已创建。请勿关闭此窗口并注意导出任务最多可能需要一小时才能完成。',
    'Export job successfully created. Please don’t close this window and note that an export job may take up to one hour to complete.':
      '导出任务已创建。请勿关闭此窗口并注意导出任务最多可能需要一小时才能完成。',
    'Too many exports in progress. Please try again later.': '进行中的导出任务过多。请稍后重试。',

    // 安全日志：事件描述
    'Country changed from your previous session': '国家/地区与上次会话不同',
    'User signed in from an unrecognized device.': '用户从无法识别的设备登录。',
    'User signed in from an unrecognized device and location.': '用户从无法识别的设备和位置登录。',
    'New Device Used': '使用了新设备',
    'Two-factor auth requested': '已请求双因素身份验证',
    'Created the repository': '创建了存储库',
    'Deleted the repository': '删除了存储库',
    'Created project': '创建了项目',
    'Closed project': '关闭了项目',
    'Created a view in project': '在以下项目中创建了视图',
    'Created GitHub Pages site in': '在以下存储库中创建了 GitHub 页面站点',
    'Modified GitHub Pages source in': '修改了以下存储库的 GitHub 页面来源',
    'Changed GitHub Pages visibility to public': '将 GitHub 页面可见性更改为公共',
    'Created environment': '创建了环境',
    'Added deployment branch pattern with value': '添加的部署分支模式值为',
    'Created a deployment branch protection rule for': '为以下环境创建了部署分支保护规则',
    'The environment can only deploy in branches matching a branch policy pattern.': '该环境只能部署到与分支策略模式匹配的分支。',
    '. The environment can only deploy in branches matching a branch policy pattern.': '。该环境只能部署到与分支策略模式匹配的分支。',
    'Added the following repositories to the': '已将以下存储库添加到',
    'Removed the following repositories from the': '已将以下存储库移出',
    'Enabled GitHub Actions for': '为以下存储库启用了 GitHub 操作',
    'Created a secret for': '为以下存储库创建了机密',
    // 「Created a token for <用户> ending in <代码> for the <应用> GitHub App」
    'Created a token for': '为以下用户创建了令牌',
    'Regenerated a token for': '为以下用户重新生成了令牌',
    'Updated a token for': '为以下用户更新了令牌',
    'Revoked a token for': '撤销了以下用户的令牌',
    'Created a Pages verified domain': '创建了页面的已验证域',
    'Deleted a Pages verified domain': '删除了页面的已验证域',
    'Failed to login': '登录失败',
    'Removed authorization for personal access token': '移除了个人访问令牌的授权',
    // 应用名为空时的同一事件（「All tokens for <应用> …」见正则）
    'All tokens for have been requested to be revoked': '已请求撤销所有令牌',

    // 赞助日志
    'Sponsors log': '赞助日志',
    'Sponsorship Log': '赞助日志',
    'New sponsorships, changes, and cancellations': '新的赞助、变更和取消',
    'All-time': '所有时间',
    'Past day': '过去一天',
    'Past week': '过去一周',
    'Past month': '过去一个月',
    'Past year': '过去一年',
    'No sponsorship activity in this time period': '此时间段内没有赞助活动',
    'This is where you can review activity from your sponsorships.': '你可以在这里查看赞助活动。',

    // 预定提醒
    'Reminders allow you to push certain events to authorized instances of Microsoft Teams or Slack.':
      '提醒可以将特定事件推送到已授权的 Microsoft Teams 或 Slack 实例。',
    "To use scheduled reminders, make sure that the Slack or Microsoft Teams integration is installed and up-to-date. If you need help with this, please contact your organization's owner.":
      '要使用预定提醒，请确保已安装最新版的 Slack 或 Microsoft Teams 集成。如需帮助，请联系组织所有者。',
    'To use scheduled reminders, make sure that the Slack or Microsoft Teams integration is installed and up-to-date. If you need help with this, please contact your organization’s owner.':
      '要使用预定提醒，请确保已安装最新版的 Slack 或 Microsoft Teams 集成。如需帮助，请联系组织所有者。',
    'Available organizations': '可用的组织',
    'Unavailable organizations': '不可用的组织',
    'Configure Reminder': '配置提醒',
    'Configure reminder': '配置提醒',
    'No reminders': '没有提醒',
    'Needs installing': '需要安装',
    'New scheduled reminder': '新建预定提醒',
    'Edit scheduled reminder': '编辑预定提醒',
    'Slack workspace': 'Slack 工作区',
    'Authorize Slack workspace': '授权 Slack 工作区',
    'Review requests assigned to you': '分配给你的审查请求',
    'Receive reminders for reviews waiting on you.': '接收等待你处理的审查提醒。',
    'Review requests assigned to your team': '分配给你团队的审查请求',
    'Receive reminders for reviews waiting on your team.': '接收等待你的团队处理的审查提醒。',
    'Enable real-time alerts': '启用实时提醒',
    'Receive immediate Slack messages when certain events happen': '发生特定事件时立即接收 Slack 消息',
    // 「… because the current plan for <strong>组织</strong> does not support reminders for private repositories.」
    // because 从句用“因…而…”，原文无逗号，译文不加
    'You will only receive notifications from public repositories in this organization because the current plan for': '你因组织',
    'does not support reminders for private repositories.': '的当前计划不支持专用存储库的提醒而只会收到此组织公共存储库的通知。',
    'Upgrade to Team': '升级到团队版',
    'Create reminder': '创建提醒',
    'Update reminder': '更新提醒',
    'Delete reminder': '删除提醒'
  },
  scoped: {
    'Period:': '时间段：',
    // 安全日志事件片段：「… a token for <用户> ending in <代码> for the <应用> OAuth app」
    'ending in': '尾号',
    'for the': '用于',
    'GitHub App.': 'GitHub 应用。',
    'OAuth app': 'OAuth 应用',
    // 句末无句号的同一片段；也是 /settings/apps/new 表单的属性值
    'GitHub App': 'GitHub 应用',
    // 「Changed <strong>a merge setting</strong> on the <a>owner/repo</a> repository」等被链接拆开的事件描述
    'a merge setting': '合并设置',
    'on the': '于',
    'to the': '到',
    // 「Closed project <项目> in <所有者>」
    in: '位于',
    'organization with': '组织并授予',
    read: '读取',
    permission: '权限',
    // 搜索建议：「action:」限定词保留，说明翻译（filter by organization / repository 由 notifications 收录）
    'filter by action': '按操作筛选',
    'filter by actor': '按参与者筛选',
    'filter by country': '按国家/地区筛选',
    'filter by created date': '按创建日期筛选',
    'filter by operation': '按操作类型筛选',
    'filter by user': '按用户筛选',
    Export: '导出',
    Exporting: '导出中',
    'Show more details': '显示更多详细信息',
    'Clear current search query': '清除当前搜索查询',
    'Logged in': '已登录',
    integration: '集成',
    'integration:': '集成：',
    // Copilot 审查强度事件「… changed from <span>Adaptive</span> to …」的取值（组织设置由 org-settings/copilot 收录）
    Adaptive: '自适应',
    // 公钥事件的指纹段落「<strong>Fingerprint</strong> SHA256:…」、市场上架项事件的类别
    Fingerprint: '指纹',
    'Agent apps': '智能体应用',
    // 预定提醒：星期全称 → 星期X，与组织预定提醒一致（缩写 Mon 等 → 周X）
    Days: '星期',
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    Sunday: '星期日',
    Times: '时间'
  },
  regexp: [
    [/^Found (\d+) events?$/, '找到 $1 个事件'],
    [/^View ([\w-]+)['’]s profile$/, '查看 $1 的个人资料'],
    // 搜索建议的无障碍标签：「action: filter by action」
    [
      new RegExp(`^([a-z_]+): filter by ${FILTER_TARGET_SOURCE}$`),
      (_, qualifier: string, target: string) => `${qualifier}: 按${FILTER_TARGET[target] ?? target}筛选`
    ],
    [
      /^Two-factor auth challenge solved with (authenticator app|SMS|security key|passkey|GitHub Mobile|recovery code)$/,
      (_, method: string) => joinCjk(joinCjk('已通过', TWO_FACTOR_METHOD[method] ?? method), '完成双因素身份验证质询')
    ],
    // 原文句中无标点，译文也不加：「Created a token for octocat ending in abcd for the Copilot GitHub App.」
    [
      /^(Created|Regenerated|Updated|Revoked) a token for ([\w-]+) ending in (\S+) for the (.+) (GitHub App|OAuth app)(\.?)$/,
      (_, action: string, owner: string, suffix: string, app: string, kind: string, dot: string) =>
        `${joinCjk(`${TOKEN_ACTION[action] ?? action} ${owner} 的尾号为 ${suffix} 的`, app)} ${APP_KIND[kind] ?? kind}令牌${dot ? '。' : ''}`
    ],
    [/^Added deployment branch pattern with value (.+) for (.+)\.$/, '为 $2 添加了值为 $1 的部署分支模式。'],
    [
      /^Created a deployment branch protection rule for (.+)\. The environment can only deploy in branches matching a branch policy pattern\.$/,
      '为 $1 创建了部署分支保护规则。该环境只能部署到与分支策略模式匹配的分支。'
    ],
    [/^Changed GitHub Pages visibility to public (.+)$/, '将 $1 的 GitHub 页面可见性更改为公共'],
    // 登录方式、经典令牌、应用令牌的撤销请求
    [/^Logged in via social identity (\S+)$/, '通过社交身份 $1 登录'],
    [/^Removed personal access token \((.+)\)$/, (_, name: string) => `移除了个人访问令牌${parenName(name)}`],
    [/^Created personal access token \((.+)\) with no permissions$/, (_, name: string) => `创建了无权限的个人访问令牌${parenName(name)}`],
    [/^All user tokens for (.+) have been requested to be revoked$/, '已请求撤销 $1 的所有用户令牌'],
    [/^All tokens for (.+) have been requested to be revoked$/, '已请求撤销 $1 的所有令牌'],
    // 头像事件（团队头像等）：「Updated profile picture for octo-org/team」
    [/^Updated profile picture for (.+)$/, '更新了 $1 的头像'],
    // 事件地点：Hong Kong, , Hong Kong → 中国香港
    [new RegExp(`^(${PLACE_SOURCE}?), (${PLACE_SOURCE}?), (${PLACE_SOURCE})$`), eventLocation]
  ]
} satisfies PageDictionary
