import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'

/** 空结果标题：Your search did not match any repositories */
const EMPTY_HEADINGS: Readonly<Record<string, string>> = {
  code: '没有与搜索匹配的代码',
  repositories: '没有与搜索匹配的存储库',
  issues: '没有与搜索匹配的议题',
  'pull requests': '没有与搜索匹配的拉取请求',
  discussions: '没有与搜索匹配的讨论',
  users: '没有与搜索匹配的用户',
  commits: '没有与搜索匹配的提交',
  packages: '没有与搜索匹配的软件包',
  wikis: '没有与搜索匹配的 Wiki',
  topics: '没有与搜索匹配的主题',
  // 产品名译中文（用户定）：Marketplace → 市场
  marketplace: '没有与搜索匹配的市场应用'
}

/** 「However we found 3 repositories that matched…」中的类型 */
const FOUND_KINDS: Readonly<Record<string, string>> = {
  'code result': '代码结果',
  'code results': '代码结果',
  repository: '存储库',
  repositories: '存储库',
  issue: '议题',
  issues: '议题',
  'pull request': '拉取请求',
  'pull requests': '拉取请求',
  discussion: '讨论',
  discussions: '讨论',
  user: '用户',
  users: '用户',
  commit: '提交',
  commits: '提交',
  package: '软件包',
  packages: '软件包',
  wiki: 'Wiki',
  wikis: 'Wiki',
  topic: '主题',
  topics: '主题'
}

/** 3 + repositories → 3 个存储库；英文类型名前加空格：3 个 Wiki */
function foundCount(count: string, kind: string): string {
  return joinCjk(`${count} 个`, FOUND_KINDS[kind] ?? kind)
}

/** 链接中单独出现的「数量 + 类型」；存储库、议题、拉取请求、讨论、提交、软件包的计数由 common 收录 */
const FOUND_COUNT_KINDS = ['code results?', 'users?', 'wikis?', 'topics?'].join('|')

/** 空结果页：标题、提示折叠项（含代码搜索的索引说明与正则示例） */
export default {
  static: {
    // 标题与说明
    'Your search did not match any': '没有与搜索匹配的',
    'You could try one of the tips below.': '可尝试以下提示。',
    'Try one of the tips below to find more code': '可尝试以下提示查找更多代码',
    'Try one of the tips below to find more repositories': '可尝试以下提示查找更多存储库',
    'However we found': '不过找到了',
    'that matched your search query. Alternatively try one of the tips below.': '与搜索查询匹配。也可尝试以下提示。',
    'You could try an': '可以尝试',

    // 提示：跨存储库、组织
    'Search across repositories': '跨存储库搜索',
    'Within a repository:': '在单个存储库中：',
    'Across several:': '在多个存储库中：',
    'Alternative way:': '另一种写法：',
    'Search across an organization': '在组织内搜索',
    'Within an organization:': '在组织内：',
    "User's code:": '用户的代码：',
    'User’s code:': '用户的代码：',
    // Note that … 不译出“注意：”（原文没有冒号；正则表达式提示同）
    "Note that we don't currently support regular expressions in the repo or org qualifiers. For more information on search syntax, see our":
      'repo 和 org 限定符目前不支持正则表达式。有关搜索语法的详细信息，请参阅',
    'Note that we don’t currently support regular expressions in the repo or org qualifiers. For more information on search syntax, see our':
      'repo 和 org 限定符目前不支持正则表达式。有关搜索语法的详细信息，请参阅',
    'syntax guide': '语法指南',

    // 提示：文件扩展名
    'Find a particular file extension': '查找特定扩展名的文件',
    'With .txt extensions:': '扩展名为 .txt：',
    'JavaScript and TypeScript files:': 'JavaScript 和 TypeScript 文件：',
    // 原文用逗号带出 not just the extension，译文同样用逗号，不改成括号
    'The path qualifier can search the entire file path, not just the extension, and supports regular expressions. For more information, see our':
      'path 限定符可搜索完整文件路径，不只是扩展名，还支持正则表达式。详细信息请参阅',

    // 提示：为什么找不到代码
    "Why wasn't my code found?": '为什么找不到我的代码？',
    'Why wasn’t my code found?': '为什么找不到我的代码？',
    'When you search within a repository for the first time, please note that the repository undergoes indexing.':
      '首次在存储库中搜索时，该存储库需要先建立索引。',
    'This process may take a few minutes.': '此过程可能需要几分钟。',
    'The index currently includes more than 70 million popular public repositories, plus all private repositories that users search for.':
      '索引目前包含超过 7000 万个热门公共存储库，以及用户搜索过的全部专用存储库。',
    "Beyond that, we also don't include all files in the search index:": '此外，搜索索引并不包含所有文件：',
    'Beyond that, we also don’t include all files in the search index:': '此外，搜索索引并不包含所有文件：',
    'Vendored and generated code is excluded': '排除内置的第三方代码和生成的代码',
    'Empty files and files over 350 kiB are excluded': '排除空文件和超过 350 kiB 的文件',
    'Only UTF-8 encoded files are indexed': '仅索引 UTF-8 编码的文件',
    'Very large repositories may not be indexed': '超大存储库可能不会被索引',
    'We intend to continue to increase the amount of code available in the index as much as possible. If we are missing files that are useful to you, feel free to':
      '我们会持续尽可能扩大索引中的代码量。如果缺少对你有用的文件，欢迎',
    'provide feedback here': '在此提供反馈',

    // 提示：正则表达式
    'Regular expressions': '正则表达式',
    'Sparse followed by index:': 'sparse 后接 index：',
    'Lines that end with return:': '以 return 结尾的行：',
    'File paths matching:': '匹配的文件路径：',
    "Note that you'll have to escape any slashes in the regex. For more information, see our": '正则表达式中的斜杠需要转义。详细信息请参阅',
    'Note that you’ll have to escape any slashes in the regex. For more information, see our': '正则表达式中的斜杠需要转义。详细信息请参阅',

    // 提示：已保存的搜索
    'Always searching within the same organization or set of repositories? Try constructing a query and click the save button in the top right corner.':
      '经常在同一组织或同一组存储库中搜索？可构建查询后单击右上角的保存按钮。'
  },
  scoped: {
    // 数量在单独元素中：3 + code results
    'code results': '个代码结果',
    'code result': '个代码结果'
  },
  regexp: [
    // 「Your search did not match any 」「repositories」拼接（类型词不单独收录，避免误译路径、代码中的同名单词）
    [new RegExp(`^Your search did not match any (${Object.keys(EMPTY_HEADINGS).join('|')})$`), (_, type) => EMPTY_HEADINGS[type] ?? type],
    [
      new RegExp(
        `^However we found (\\d[\\d.,]*[kKMB]?) (${Object.keys(FOUND_KINDS).join('|')}) that matched your search query\\. Alternatively try one of the tips below\\.$`
      ),
      (_, count, kind) => `${joinCjk(`不过找到了 ${count} 个与搜索查询匹配的`, FOUND_KINDS[kind] ?? kind)}。也可尝试以下提示。`
    ],
    // 句中类型为链接时：However we found <3 code results> that matched…
    [new RegExp(`^(\\d[\\d.,]*[kKMB]?) (${FOUND_COUNT_KINDS})$`), (_, count, kind) => foundCount(count, kind)]
  ]
} satisfies PageDictionary
