import type { PageDictionary, RegExpRule } from '../../../core/types'

/** 侧栏分节底部的「+ N <类型>」链接 */
const MORE_LINKS: Readonly<Record<string, string>> = {
  release: '个发行版',
  contributor: '个贡献者',
  deployment: '个部署',
  package: '个软件包',
  environment: '个环境'
}

/** 成员个人资料的所有者：the organization's → 组织的；GitHub's → GitHub 的 */
function profileOwner(owner: string): string {
  const name = owner.replace(/['’]s$/, '')
  return name === 'the organization' ? '组织的' : ` ${name} 的`
}

const regexp: readonly RegExpRule[] = [
  // 编辑存储库详细信息：描述剩余字数
  [/^(\d[\d,]*) characters? remaining$/, '还剩 $1 个字符'],
  // 分节底部链接：+ 62 contributors、+ 3 releases、+ 1 more
  [
    /^\+ (\d[\d,]*) (release|contributor|deployment|package|environment)s?$/,
    (_, count: string, type: string) => `+ ${count} ${MORE_LINKS[type] ?? type}`
  ],
  [/^\+ (\d[\d,]*) more$/, '还有 $1 个'],
  // 语言分布条的无障碍名称（具体语言名不翻译）
  [/^Other: (\d+(?:\.\d+)?%)$/, '其他：$1'],
  // 引用此存储库：复制后的播报与复制按钮
  [/^(APA|BibTeX) citation copied to clipboard$/, '$1 引用已复制到剪贴板'],
  [/^Copy (APA|BibTeX) citation$/, '复制 $1 引用'],
  // 特殊存储库（个人资料自述文件）
  [/^You can display (\S+) from this repository on your public GitHub profile\.$/, '你可以在 GitHub 公开个人资料中显示此存储库的 $1。'],
  [
    /^(and it )?will appear on (.+?) member profile, visible only to organization members\.$/,
    (_, created: string, owner: string) => `${created ? '后它' : ''}将显示在${profileOwner(owner)}成员个人资料中，仅组织成员可见。`
  ]
]

/**
 * 存储库首页侧栏：About（描述、网站、资源链接、星标 / 关注 / 复刻计数、举报）与编辑存储库详细信息对话框，
 * 发行版、软件包、赞助、被使用、贡献者、部署、环境、语言、推荐工作流、引用此存储库、模板来源，
 * 以及特殊存储库（个人资料自述文件）的提示。
 * 描述、主题、发行版名、贡献者名属于用户内容，由全局忽略规则、code 词典排除或不收录；
 * 软件包名、环境名与复刻存储库的语言名由本文件的 ignore 排除。
 */
export default {
  static: {
    // About
    'No description, website, or topics provided.': '未提供描述、网站或主题。',
    'No description or website provided.': '未提供描述或网站。',
    // 资源链接：Readme 译“自述文件”
    Readme: '自述文件',
    'Report repository': '举报存储库',
    'Licenses found': '找到的许可证',
    'Unknown license': '未知许可证',
    'Generated from': '生成自',

    // 编辑存储库详细信息
    'Edit repository details': '编辑存储库详细信息',
    'Short description of this repository': '此存储库的简短描述',
    'Enter a valid URL': '输入有效的 URL',
    'Use your GitHub Pages website': '使用你的 GitHub 页面网站',
    'Include in the home page': '在首页显示',
    'Error saving your changes.': '保存更改时出错。',
    'Add topics': '添加主题',
    'Type to search topics': '输入以搜索主题',
    'Press Enter to add as new topic': '按 Enter 添加为新主题',
    '(separate with spaces)': '（以空格分隔）',
    'Your repository details have been saved.': '存储库详细信息已保存。',
    // 编辑存储库详细信息：旧版主题建议（主题名是用户内容）
    'Suggested:': '推荐：',
    'Add this topic': '添加此主题',
    'Decline this topic': '拒绝此主题',
    'This isn’t relevant': '不相关',
    "This isn't relevant": '不相关',
    'This is too specific': '过于具体',
    'This is too general': '过于宽泛',
    'I just don’t like it': '不喜欢',
    "I just don't like it": '不喜欢',

    // 发行版、赞助、贡献者、部署、语言
    'No releases published': '未发布任何发行版',
    'Sponsor this project': '赞助此项目',
    'No contributors': '暂无贡献者',
    'No deployments published': '未发布任何部署',
    'Deploy in progress': '正在部署',
    'Repository language breakdown': '存储库语言分布',

    // 推荐工作流
    'Suggested workflows': '推荐的工作流',
    'Based on your tech stack': '基于你的技术栈',
    'More workflows': '更多工作流',

    // 引用此存储库
    'Cite this repository': '引用此存储库',
    'If you use this software in your work, please cite it using the following metadata.':
      '如果你在工作中使用了此软件，请按以下元数据引用。',
    'Learn more about CITATION files.': '了解 CITATION 文件。',
    Citations: '引用格式',
    'APA citation': 'APA 引用',
    'BibTeX citation': 'BibTeX 引用',
    'View citation file': '查看引用文件',
    'Something went wrong loading citation data.': '加载引用数据时出错。',

    // 特殊存储库（个人资料自述文件）：<owner/repo> 是特殊存储库。
    'is special.': '是特殊存储库。',
    'is now a special repository.': '现在是特殊存储库。',
    'is a special repository.': '是特殊存储库。',
    // 如果你 <将此存储库设为公共>，其 <README.md> 将显示在你的个人资料中。（整句由 inline 处理，此为未拼成整句时的片段）
    'make this a public repository': '将此存储库设为公共',
    'will appear on your profile.': '将显示在你的个人资料中。',
    'will appear on your public profile.': '将显示在你的公开个人资料中。',
    'will appear on the organization’s profile.': '将显示在组织的个人资料中。',
    "will appear on the organization's profile.": '将显示在组织的个人资料中。',
    // 创建 <README.md> 后它将显示在组织的个人资料中。（and it 原文无逗号，译文作“后它”）
    'and it will appear on the organization’s profile.': '后它将显示在组织的个人资料中。',
    "and it will appear on the organization's profile.": '后它将显示在组织的个人资料中。',
    'Update now': '立即更新',
    'Share to Profile': '分享到个人资料',
    'Visit profile': '访问个人资料'
  },
  scoped: {
    // About（Activity 由 common-ui 收录；编辑按钮的 aria-label 保持原文，见 core/ignore 的 KEEP_ORIGINAL_ATTRIBUTES）
    Website: '网站',
    'Custom properties': '自定义属性',
    // 计数：<strong>2.4k</strong> stars
    star: '个星标',
    stars: '个星标',
    Watchers: '关注者',
    watching: '个关注者',
    fork: '个复刻',
    forks: '个复刻',
    // 侧栏分节（Configure 由 common-ui 收录）；部署状态与 actions 词典一致
    Latest: '最新',
    'Create a new release': '创建新发行版',
    'Used by': '使用者',
    Deployments: '部署',
    Environments: '环境',
    inactive: '不活跃',
    queued: '已排队',
    'Set up': '设置',
    Other: '其他',
    // 特殊存储库提示的句首片段
    'If you': '如果你',
    ', its': '，其',
    Its: '其',
    The: '该',
    'Create a': '创建',
    'Edit README': '编辑自述文件'
  },
  regexp,
  // 特殊存储库提示（SidebarConfigCallToAction）：如果你 <将此存储库设为公共>，其 <README.md> 将显示在你的个人资料中。
  // 整句命中后中文与链接之间不留空白，元素文字照常翻译；未命中时按上面的句首片段逐段翻译
  inline: [['If you {}, its {} will appear on your profile.', '如果你{}，其 {} 将显示在你的个人资料中。']],
  ignore: [
    // 软件包分节：软件包名
    '[class*="packageItem__"] > a',
    // 部署分节：环境名（如 Preview、Release 会被当成界面文字）
    '[class*="envItem__"] > a',
    // 语言分节：复刻存储库的语言条目不带链接，不在全局忽略范围，语言名会被当成界面文字（如 Reason、Move、Logos）；
    // 非复刻存储库只有 Other 不带链接，仍需翻译，所以按页头 meta 只在复刻存储库忽略
    'head:has(> meta[name="octolytics-dimension-repository_is_fork"][content="true"]) ~ body [class*="languageItem__"] > [itemprop="keywords"]'
  ]
} satisfies PageDictionary
