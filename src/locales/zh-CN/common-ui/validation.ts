import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/**
 * 表单校验错误（服务器渲染，多在 flash 横幅或字段下方）：「<字段名> <错误>」，如 Name can't be blank、
 * Domain is not properly formatted.。字段名与错误分别查表，两张表的键简繁相同（正则由键拼成）。
 * 几条错误拼成一段（Domain is not a valid public domain.. Domain is not properly formatted.）时由引擎按句翻译
 * （见 core/matcher.ts）。页面词典收了同一句的（issues/labels.ts、settings-account/security.ts 等）优先。
 */

/** 字段名：译法与各表单的字段标签一致 */
const FIELDS: Readonly<Record<string, string>> = {
  'Admin name': '管理员姓名',
  'Admin work email': '管理员工作电子邮件',
  'Billing email': '计费电子邮件',
  Bio: '个人简介',
  Body: '正文',
  Branch: '分支',
  'Business/Institution name': '企业/机构名称',
  'Callback URL': '回调 URL',
  Color: '颜色',
  Company: '公司',
  Country: '国家/地区',
  'Country/Region': '国家/地区',
  Description: '描述',
  Domain: '域',
  'Domain name': '域名',
  Email: '电子邮件',
  'Enterprise name': '企业名称',
  'Enterprise URL slug': '企业 URL 标识',
  'Homepage URL': '主页 URL',
  'Identity provider': '标识提供者',
  Industry: '行业',
  Key: '密钥',
  Label: '标签',
  Location: '所在地',
  Login: '用户名',
  Name: '名称',
  Note: '备注',
  'Number of employees': '员工人数',
  'Organization name': '组织名称',
  Password: '密码',
  'Repository name': '存储库名称',
  'Tag name': '标签名称',
  'Team name': '团队名称',
  Title: '标题',
  URL: 'URL',
  Username: '用户名',
  'Username shortcode': '用户名短代码',
  Value: '值',
  'Vat code': 'VAT 税号',
  Website: '网站'
}

/** 错误：字段名之后的部分 */
const MESSAGES: Readonly<Record<string, string>> = {
  "can't be blank": '不能为空',
  'can’t be blank': '不能为空',
  'is invalid': '无效',
  'has already been taken': '已被使用',
  'is already taken': '已被使用',
  'is already in use': '已被使用',
  'already exists': '已存在',
  'is reserved': '已被保留',
  'is unavailable': '不可用',
  'is not a valid URL': '不是有效的 URL',
  'is not a valid public domain': '不是有效的公共域名',
  'is not properly formatted': '格式不正确',
  'is not a number': '不是数字',
  'is not included in the list': '不在可选范围内',
  'must be accepted': '必须接受',
  'contains invalid characters': '包含无效字符',
  'cannot be an ip address': '不能是 IP 地址',
  'may only contain alphanumeric characters': '只能包含字母和数字',
  'must be selected': '为必选项',
  'required to enable enterprise managed users': '为启用企业托管用户所必需'
}

/** 带字符数的错误：is too long (maximum is 100 characters)；COUNTED_SOURCE 不含捕获组，拼进 VALIDATION_RE */
const COUNTED_SOURCE = String.raw`is (?:too long|too short|the wrong length) \((?:maximum is|minimum is|should be) \d+ characters?\)`
const COUNTED_RE = /^is (too long|too short|the wrong length) \((?:maximum is|minimum is|should be) (\d+) characters?\)$/
const COUNTED: Readonly<Record<string, (count: string) => string>> = {
  'too long': count => `过长（最多 ${count} 个字符）`,
  'too short': count => `太短（最少 ${count} 个字符）`,
  'the wrong length': count => `长度不正确（应为 ${count} 个字符）`
}

/** 键拼成正则：长的在前（Callback URL 先于 URL），转义正则元字符 */
function alternatives(keys: readonly string[]): string {
  return [...keys]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
}

/** 字段名的正则片段（不含捕获组）：其他页面的「X is invalid」规则据此让出校验句 */
export const VALIDATION_FIELD_SOURCE = alternatives(Object.keys(FIELDS))

const VALIDATION_RE = new RegExp(`^(${VALIDATION_FIELD_SOURCE}) (${alternatives(Object.keys(MESSAGES))}|${COUNTED_SOURCE})(\\.?)$`)

/** 字段名在前一个元素里时（<a>Username shortcode</a> may only contain alphanumeric characters.）只剩错误部分 */
const MESSAGE_RE = new RegExp(`^(${alternatives(Object.keys(MESSAGES))}|${COUNTED_SOURCE})(\\.?)$`)

/** VALIDATION_RE、MESSAGE_RE 匹配到的错误一定在两张表之一 */
function message(text: string): string {
  const fixed = MESSAGES[text]
  if (fixed !== undefined) return fixed
  const [, kind, count] = COUNTED_RE.exec(text)!
  return COUNTED[kind!]!(count!)
}

export default {
  regexp: [
    // Name can't be blank → 名称不能为空；Description is too long (maximum is 100 characters). → 描述过长（最多 100 个字符）。
    [VALIDATION_RE, (_, field: string, error: string, dot: string) => `${joinCjk(FIELDS[field]!, message(error))}${dot ? '。' : ''}`],
    // 只剩错误部分：may only contain alphanumeric characters. → 只能包含字母和数字。
    [MESSAGE_RE, (_, error: string, dot: string) => `${message(error)}${dot ? '。' : ''}`]
  ]
} satisfies PageDictionary
