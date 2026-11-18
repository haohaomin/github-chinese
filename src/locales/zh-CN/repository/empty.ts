import type { PageDictionary, RegExpRule } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 引导卡片申请的功能名：产品名译出，Copilot 等品牌词与未收录的名称原样保留（Map 查找不会命中原型链上的键） */
const FEATURE_NAMES: ReadonlyMap<string, string> = new Map([
  ['Codespaces', '代码空间'],
  ['GitHub Codespaces', 'GitHub 代码空间']
])

/** 「<前缀><功能名><后缀>」：功能名为英文时与两侧中文之间补空格 */
function featureRequest(prefix: string, name: string, suffix: string): string {
  return joinCjk(joinCjk(prefix, FEATURE_NAMES.get(name) ?? name), suffix)
}

const regexp: readonly RegExpRule[] = [
  // 正在创建存储库时的自动刷新提示（原文无逗号，译文不加）
  [
    /^This page will automatically refresh in (\d+) seconds to check if the repository is ready\.$/,
    '此页面将在 $1秒后自动刷新以检查存储库是否就绪。'
  ],
  // 空存储库的功能申请（引导卡片）：读屏播报
  [/^Request for (.+) submitted successfully$/, (_, name: string) => featureRequest('已提交', name, '的申请')],
  [/^Request for (.+) failed, please try again$/, (_, name: string) => featureRequest('', name, '的申请提交失败，请重试')],
  [/^Request for (.+) removed$/, (_, name: string) => featureRequest('已撤回', name, '的申请')],
  [/^Removing request for (.+) failed, please try again$/, (_, name: string) => featureRequest('撤回', name, '的申请失败，请重试')]
]

/**
 * 空存储库与创建中的存储库：无写入访问权限的空存储库、正在复刻 / 镜像 / 生成，以及有写入访问权限时的快速设置
 * （克隆地址、命令行指引）和引导卡片（代码空间、Copilot、添加协作者）。
 * 命令行内容是代码，由 <pre> / <code> 排除。
 * 引导卡片的申请已提交、申请被拒整句（相邻文本节点拼接后匹配）由 code 词典处理。
 */
export default {
  static: {
    // 无写入访问权限的空存储库：要不要看看 <YouTube 上的 GitHub 频道> 打发等待时间？
    'This repository is empty.': '此存储库为空。',
    'You don’t have write access to this repository yet': '你还没有此存储库的写入访问权限',
    "You don't have write access to this repository yet": '你还没有此存储库的写入访问权限',
    'Care to check out the': '要不要看看',
    'GitHub Channel on YouTube': 'YouTube 上的 GitHub 频道',
    'while you wait?': '打发等待时间？',

    // 创建中
    'Forking your repository': '正在复刻存储库',
    'Mirroring your repository': '正在镜像存储库',
    'Generating your repository...': '正在生成存储库...',
    'Generating your repository…': '正在生成存储库…',
    'This may take anywhere from a few minutes to a few hours depending on the size of the repository being mirrored.':
      '视被镜像存储库的大小可能需要几分钟到几小时。',

    // 快速设置
    'Quick setup': '快速设置',
    '— if you’ve done this kind of thing before': '— 如果你以前做过类似操作',
    "— if you've done this kind of thing before": '— 如果你以前做过类似操作',
    'Set up in GitHub Desktop': '在 GitHub 桌面版中设置',
    'Set up in Desktop': '在桌面版中设置',
    'Clone protocol': '克隆协议',
    'Clone URL': '克隆 URL',
    // 首先 <创建新文件> 或 <上传现有文件>。建议每个存储库都包含 README、LICENSE，以及 .gitignore。
    'Get started by': '首先',
    'creating a new file': '创建新文件',
    'uploading an existing file': '上传现有文件',
    '. We recommend every repository include a': '。建议每个存储库都包含',
    '…or create a new repository on the command line': '…或在命令行中创建新存储库',
    '…or push an existing repository from the command line': '…或从命令行推送现有存储库',
    '…or import code from another repository': '…或从其他存储库导入代码',
    'You can initialize this repository with code from a Subversion, Mercurial, or TFS project.':
      '你可以用 Subversion、Mercurial 或 TFS 项目的代码初始化此存储库。',
    'Import code': '导入代码',
    'Copy create commands to clipboard': '复制创建命令到剪贴板',
    'Copy push commands to clipboard': '复制推送命令到剪贴板',
    'Use the URL for this page when adding GitHub as a remote.': '添加 GitHub 远程存储库时使用此页面的 URL。',

    // 引导卡片
    'Start coding with Codespaces': '使用代码空间开始编码',
    // 原文的逗号都在并列的形容词之间（译作顿号），译文不另加逗号
    'Add a README file and start coding in a secure, configurable, and dedicated development environment.':
      '添加自述文件并在安全、可配置的专用开发环境中开始编码。',
    'Set up GitHub Copilot': '设置 GitHub Copilot',
    "Use GitHub's AI pair programmer to autocomplete suggestions as you code.": '编码时使用 GitHub 的 AI 结对程序员自动补全建议。',
    'Use GitHub’s AI pair programmer to autocomplete suggestions as you code.': '编码时使用 GitHub 的 AI 结对程序员自动补全建议。',
    'Get started with GitHub Copilot': '开始使用 GitHub Copilot',
    'Add collaborators to this repository': '为此存储库添加协作者',
    'Search for people using their GitHub username or email address.': '使用 GitHub 用户名或电子邮件地址搜索用户。'
  },
  scoped: {
    // 快速设置：README、LICENSE，以及 .gitignore（逗号无英文，不翻译）
    ', and': '，以及',
    'Invite collaborators': '邀请协作者'
  },
  regexp
} satisfies PageDictionary
