import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { millions, thousands } from './numbers'

/** GitHub 教育首页（/education）：首屏、数据、使命、四类用户卡片、CTA；推荐语由 shared 的忽略规则排除 */
export default {
  static: {
    // 首屏
    'Empowering the next generation of developers': '赋能下一代开发人员',
    'GitHub Education bridges the gap between coding education and a tech career, and is accessible to everyone globally at no cost.':
      'GitHub 教育弥合编程教育与技术职业之间的鸿沟，面向全球所有人免费开放。',

    // 数据（数字见 regexp）
    "Connect with millions of peers who've expanded their skills through GitHub Education.":
      '与数百万通过 GitHub 教育提升技能的同伴建立联系。',
    'Collaborate with educators around the world who enhance their lesson plans and workstreams with GitHub tools.':
      '与世界各地使用 GitHub 工具改进教案和工作流的教育工作者协作。',
    'Join thousands of schools globally that incorporate GitHub into their tech curriculum.':
      '加入全球数千所将 GitHub 纳入技术课程的学校。',

    // 使命：<b>More than a platform.</b> GitHub Education is a commitment …
    'More than a platform.': '不止是一个平台。',
    'GitHub Education is a commitment to bringing tech and open source collaboration to students and educators across the globe.':
      'GitHub 教育致力于将技术和开源协作带给全球的学生和教育工作者。',
    // <b>Join us today</b> and take the first step …（整句见 inline）
    'Join us today': '立即加入我们',
    'and take the first step towards transforming your tech education experience.': '，迈出改变你的技术教育体验的第一步。',
    // 「加入 GitHub 教育」链接的 aria-label
    'Enable GitHub Education': '启用 GitHub 教育',

    // 四类用户卡片
    'Join a community where learning meets doing, with free access to the same tools professional developers use, including GitHub Copilot Student and Codespaces.':
      '加入一个学以致用的社区，免费使用专业开发人员使用的同款工具，包括 GitHub Copilot 学生版和代码空间。',
    'Learn more about students': '了解学生相关信息',
    'Connect with a community of peers, expand your teaching methods, and empower students to dream big.':
      '与同行社区建立联系，拓展教学方法，赋能学生勇敢追梦。',
    'Learn more about teachers': '了解教师相关信息',
    'Enhance your technical and academic departments with real-world software solutions, thanks to free access to GitHub Enterprise.':
      '免费使用 GitHub 企业版，用真实的软件解决方案提升你的技术和学术部门。',
    'Learn more about schools': '了解学校相关信息',
    "Expand your brand's footprint in the tech landscape and ensure the tech leaders of tomorrow know your tools by name by partnering with GitHub Education.":
      '与 GitHub 教育合作，扩大你的品牌在技术领域的影响力，让未来的技术领袖熟知你的工具。',
    'Learn more about partners': '了解合作伙伴相关信息',

    // 「更进一步」
    'Go further': '更进一步'
  },
  regexp: [
    // 数据：5 million students / 200K verified educators / +2K educational institutions
    [/^(\d+) million students$/, (_, count) => joinCjk(millions(count!), '学生')],
    [/^(\d+)K verified educators$/, (_, count) => joinCjk(thousands(count!), '已验证教育工作者')],
    [/^\+(\d+)K educational institutions$/, (_, count) => joinCjk(`超过 ${thousands(count!)}`, '所教育机构')]
  ],
  inline: [
    // <b>Join us today</b> and take the first step towards transforming your tech education experience.
    ['{} and take the first step towards transforming your tech education experience.', '{}，迈出改变你的技术教育体验的第一步。']
  ]
} satisfies PageDictionary
