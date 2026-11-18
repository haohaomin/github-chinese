import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { thousands } from './numbers'

/**
 * 学校页（/education/schools）：首屏、三项优势、全校方案折叠面板、GitHub 课堂、CTA、学校案例卡片、常见问题。
 * 常见问题里只隔注释的相邻文本（Actions / Codespaces / Copilot、Terms and Conditions、Let us know 等）
 * 先整组匹配，整句照录；再给出各段，供分段时回退。学校案例卡片的标题是学校名，由 shared 的忽略规则排除。
 */
export default {
  static: {
    // 首屏
    'Teach with industry-standard tools': '用行业标准工具教学',
    'Get free access with training for students and faculty': '免费使用并获得面向学生和教职员工的培训',

    // 三项优势
    'Enhance your technical curriculum': '提升你的技术课程',
    "Elevate your lessons with GitHub's advanced tools and provide students access to current industry practices.":
      '用 GitHub 的高级工具提升你的课程，让学生接触当前的行业实践。',
    'Reinvigorate your teaching methods': '焕新你的教学方法',
    'Use GitHub to automate feedback and manage coursework, which can make your sessions more dynamic and interactive.':
      '使用 GitHub 自动化反馈并管理课业，让你的课堂更具活力和互动性。',
    'Boost collaboration across campus': '促进全校园协作',
    // 句末的「.」是单独的文本节点
    'Make it easier for students and educators to collaborate on projects and assignments.':
      '让学生和教育工作者更轻松地协作完成项目和作业。',
    'Make it easier for students and educators to collaborate on projects and assignments': '让学生和教育工作者更轻松地协作完成项目和作业',

    // 全校方案折叠面板
    'Unlock a passion for learning with GitHub for your whole school': '用 GitHub 为全校点燃学习热情',
    'Deploy GitHub Enterprise at your school, for free': '在你的学校免费部署 GitHub 企业版',
    // … Leverage GitHub <!-- -->Actions<!-- -->, <!-- -->Codespaces<!-- -->, and <!-- -->Copilot<!-- --> to elevate …
    'Implement GitHub Enterprise Server and Cloud in your school to unlock a suite of advanced tools for educators and students. Leverage GitHub Actions, Codespaces, and Copilot to elevate your technical education and collaboration standards.':
      '在你的学校部署 GitHub 企业服务器和企业云，为教育工作者和学生解锁一整套高级工具。利用 GitHub 操作、代码空间和 Copilot 提升你的技术教育和协作水准。',
    'Implement GitHub Enterprise Server and Cloud in your school to unlock a suite of advanced tools for educators and students. Leverage GitHub':
      '在你的学校部署 GitHub 企业服务器和企业云，为教育工作者和学生解锁一整套高级工具。利用 GitHub',
    'to elevate your technical education and collaboration standards.': '提升你的技术教育和协作水准。',
    'Explore GitHub Copilot': '探索 GitHub Copilot',
    'Build student tech communities': '建设学生技术社区',
    "Foster diverse technology communities on your campus through GitHub's comprehensive support system, offering training and mentorship to empower student growth and innovation.":
      '通过 GitHub 全面的支持体系，在你的校园培育多元的技术社区，提供培训和指导，赋能学生成长与创新。',
    // 两句之间只隔注释
    'Support your faculty by integrating Git and GitHub into their teaching toolkit. Our teacher training features self-paced video lessons and practical assignments, enabling educators to enhance their skills and apply them directly in the classroom.':
      '通过将 Git 和 GitHub 融入教学工具包来支持你的教职员工。我们的教师培训包含自定进度的视频课程和实践作业，帮助教育工作者提升技能并直接应用于课堂。',
    'Support your faculty by integrating Git and GitHub into their teaching toolkit.':
      '通过将 Git 和 GitHub 融入教学工具包来支持你的教职员工。',
    'Our teacher training features self-paced video lessons and practical assignments, enabling educators to enhance their skills and apply them directly in the classroom.':
      '我们的教师培训包含自定进度的视频课程和实践作业，帮助教育工作者提升技能并直接应用于课堂。',
    "Tailor GitHub Education to your school's needs": '根据你学校的需求定制 GitHub 教育',
    "Our free educational self-serve solution for schools doesn't include advanced features like Enterprise Support, Advanced Security, Enterprise Managed Users or Copilot Business. If you need these additional features for your institution, please contact our sales team to discuss available discounts for schools.":
      '我们面向学校的免费教育自助解决方案不包含企业支持、高级安全、企业托管用户或 Copilot 商业版等高级功能。如果你的机构需要这些附加功能，请联系我们的销售团队，讨论面向学校的可用折扣。',

    // GitHub 课堂（数字见 regexp）
    'Bring the global power of open source and the developer community to your campus.': '将开源和开发人员社区的全球力量带到你的校园。',
    'Discover GitHub Classroom': '探索 GitHub 课堂',
    'Give students hands-on experience with the tools used by professional developers.': '让学生亲身体验专业开发人员使用的工具。',
    'Empower your students and faculty with real-world software development skills': '用真实的软件开发技能赋能你的学生和教职员工',

    // CTA
    'Discover the impact of GitHub Education': '了解 GitHub 教育的影响力',
    "Join thousands of educational institutions around the world that are already benefiting from GitHub Education's free resources.":
      '加入全球数千所已从 GitHub 教育免费资源中受益的教育机构。',

    // 学校案例卡片（标题是学校名，已忽略；说明文字中的学校名保留原文）
    'See how schools use GitHub': '看看学校如何使用 GitHub',
    'Discover how Naperville North High School uses GitHub Classroom to enhance their AP Computer Science curriculum, creating a professional-like collaborative environment that enhances learning.':
      '了解 Naperville North High School 如何使用 GitHub 课堂改进其 AP 计算机科学课程，打造接近专业水准的协作环境，提升学习效果。',
    "Learn about Rice University's journey integrating GitHub into their first-year computer science classes, improving student engagement and project management through practical, real-world tools.":
      '了解 Rice University 将 GitHub 融入一年级计算机科学课程的历程，通过实用的真实工具提升学生参与度和项目管理。',
    'Explore how Harvard’s CS50 course leverages GitHub to streamline course management, distribute content, and track student progress, significantly enriching the computer science education experience.':
      '探索 Harvard 的 CS50 课程如何利用 GitHub 简化课程管理、分发内容并跟踪学生进度，显著丰富计算机科学教育体验。',

    // 常见问题：「免费使用工具」说明（学校页版本，与教师页措辞略有不同）
    ': Jump-start your development journey with the GitHub Student Developer Pack, offering dozens of premium tools and services at no cost. From AI-powered coding assistance with Copilot to GitHub Codespaces, which provide a fully configured cloud development environment, these tools are used daily by professional developers globally. They’d normally cost a fortune, but are available for free to verified students.':
      '：通过 GitHub 学生开发人员包快速开启你的开发之旅，免费获得数十款高级工具和服务。从 Copilot 的 AI 驱动编码辅助，到提供完整配置云端开发环境的 GitHub 代码空间，这些工具是全球专业开发人员每天都在使用的。它们通常价格不菲，但已验证的学生可免费使用。',
    'Is GitHub Education right for my school?': 'GitHub 教育适合我的学校吗？',
    // … does not include Enterprise Support, <!-- -->Advanced Security<!-- -->, <!-- -->Enterprise Managed Users (EMUs)<!-- -->, Copilot Business, or contract redlining.
    'GitHub Education offers free access (yes, free!) to GitHub Enterprise Server or GitHub Enterprise Cloud. This program is specifically designed for accredited institutions that grant degrees, diplomas, or certificates. It equips schools with a comprehensive suite of tools to enhance the educational experience but does not include Enterprise Support, Advanced Security, Enterprise Managed Users (EMUs), Copilot Business, or contract redlining.':
      'GitHub 教育免费（没错，免费！）提供 GitHub 企业服务器或 GitHub 企业云。此计划专为授予学位、文凭或证书的经认证机构设计。它为学校配备一整套工具以提升教育体验，但不包含企业支持、高级安全、企业托管用户 (EMU)、Copilot 商业版或合同修订。',
    'GitHub Education offers free access (yes, free!) to GitHub Enterprise Server or GitHub Enterprise Cloud. This program is specifically designed for accredited institutions that grant degrees, diplomas, or certificates. It equips schools with a comprehensive suite of tools to enhance the educational experience but does not include Enterprise Support,':
      'GitHub 教育免费（没错，免费！）提供 GitHub 企业服务器或 GitHub 企业云。此计划专为授予学位、文凭或证书的经认证机构设计。它为学校配备一整套工具以提升教育体验，但不包含企业支持、',
    'Enterprise Managed Users (EMUs)': '企业托管用户 (EMU)',
    ', Copilot Business, or contract redlining.': '、Copilot 商业版或合同修订。',
    // Our offering is intended as a <b>whole-school solution</b> to ensure …（整句见 inline）
    'Our offering is intended as a': '我们的方案旨在成为',
    'whole-school solution': '全校解决方案',
    'to ensure every department benefits. It promotes an integrated learning and development environment throughout your entire institution. However, the adoption must be at the institutional level and cannot be implemented by individual departments.':
      '，确保每个部门都能受益。它在你的整个机构内推动一体化的学习和开发环境。但采用必须在机构层面进行，不能由单个部门实施。',
    'To fully participate, your school must:': '要全面参与，你的学校必须：',
    'Provide the platform access across all interested departments.': '为所有有意参与的部门提供平台访问权限。',
    'Designate an administrator as the main contact for GitHub to handle any technical queries.':
      '指定一名管理员作为 GitHub 的主要联系人，处理任何技术问题。',
    "Display your school's logo on our website as a sign of our partnership.": '在我们的网站上展示你学校的徽标，作为我们合作关系的标志。',
    'Maintain open lines of communication for all qualified users within your institution.':
      '为你机构内所有符合条件的用户保持畅通的沟通渠道。',
    'Agree to receive regular updates from GitHub Education to stay informed about new tools and opportunities.':
      '同意接收来自 GitHub 教育的定期更新，及时了解新工具和新机会。',
    // 三个相邻的 <b>：… please </b><b>contact our sales team</b><b> to discuss …
    // 宿主 <p> 没有直接文字，不构成行内句；首段原文以空格结尾，译文以全角标点收尾才会吃掉该空格，
    // 「请」落到第二段（见 scoped）
    'If your institution does not fit this criteria, such as not granting formal degrees or certificates, please':
      '如果你的机构不符合此标准，例如不授予正式学位或证书，',
    'to discuss alternative options and available education discounts.': '，讨论其他选择和可用的教育折扣。',
    "If you're leading your school's IT program, heading a department, or overseeing technology adoption at your school, you're welcome to apply. Provide the requested information, and GitHub will be in contact to discuss eligibility and the next steps. The agreement must be signed by your school's CIO or CTO as part of a full campus solution.":
      '如果你负责学校的 IT 项目、领导某个部门或监督学校的技术采用，欢迎申请。请提供所需信息，GitHub 将与你联系，讨论资格和后续步骤。作为全校园解决方案的一部分，协议必须由你学校的 CIO 或 CTO 签署。',
    'To receive the free benefits, your school needs to:': '要获得免费福利，你的学校需要：',
    'Offer GitHub access across all technical and academic departments.': '在所有技术和学术部门提供 GitHub 访问权限。',
    'Display your school’s logo on our website as a GitHub Education partner.':
      '作为 GitHub 教育合作伙伴，在我们的网站上展示你学校的徽标。',
    'Receive regular updates from GitHub Education.': '接收来自 GitHub 教育的定期更新。',
    // Agree to our <!-- -->Terms and Conditions<!-- -->.
    'Agree to our Terms and Conditions.': '同意我们的条款和条件。',
    'Agree to our': '同意我们的',
    'Terms and Conditions': '条款和条件',
    // Interested? <!-- -->Let us know<!-- -->, and we'll guide you …
    "Interested? Let us know, and we'll guide you through joining our education initiative!":
      '有兴趣？告诉我们，我们将指导你加入我们的教育计划！',
    ", and we'll guide you through joining our education initiative!": '，我们将指导你加入我们的教育计划！',
    'Do schools receive free access to Copilot and the Student Developer Pack?': '学校是否可以免费获得 Copilot 和学生开发人员包？',
    // … Students and educators must <!-- -->apply directly to receive these benefits<!-- -->.
    'While GitHub offers free access to Copilot and numerous partner tools for all verified students and educators, these are not accessed through our educational institutional benefits. Students and educators must apply directly to receive these benefits.':
      '虽然 GitHub 为所有已验证的学生和教育工作者免费提供 Copilot 和众多合作伙伴工具，但这些并不通过我们的教育机构福利获取。学生和教育工作者必须直接申请才能获得这些福利。',
    'While GitHub offers free access to Copilot and numerous partner tools for all verified students and educators, these are not accessed through our educational institutional benefits. Students and educators must':
      '虽然 GitHub 为所有已验证的学生和教育工作者免费提供 Copilot 和众多合作伙伴工具，但这些并不通过我们的教育机构福利获取。学生和教育工作者必须',
    'apply directly to receive these benefits': '直接申请才能获得这些福利',
    'Can I enroll my non-profit educational organization?': '我可以为我的非营利教育组织注册吗？',
    // … Visit our <!-- -->GitHub Social Impact<!-- --> site for more information.
    'GitHub Education supports accredited institutions that grant degrees. For non-profit organizations, GitHub offers separate discounts. Visit our GitHub Social Impact site for more information.':
      'GitHub 教育支持授予学位的经认证机构。对于非营利组织，GitHub 提供单独的折扣。请访问我们的 GitHub 社会影响力网站了解更多信息。',
    'GitHub Education supports accredited institutions that grant degrees. For non-profit organizations, GitHub offers separate discounts. Visit our':
      'GitHub 教育支持授予学位的经认证机构。对于非营利组织，GitHub 提供单独的折扣。请访问我们的',
    'GitHub Social Impact': 'GitHub 社会影响力',
    'site for more information.': '网站了解更多信息。'
  },
  scoped: {
    'Enroll your campus': '注册你的校园',
    'Teacher training': '教师培训',
    // org-settings、security 词典只在各自页面译「联系销售」（scoped），此处给出本页译法
    'Contact sales': '联系销售',
    // 产品名按 product-names.md 译中文；repo-settings 等页面另有本页译法
    'Advanced Security': '高级安全',
    'Who can apply?': '谁可以申请？',
    'How do I sign up?': '如何注册？',
    'Interested?': '有兴趣？',
    'Let us know': '告诉我们',
    // 本页只出现在「… please </b><b>contact our sales team</b><b> to discuss …」里，「请」从首段挪到此段；
    // new 页另有 scoped「联系我们的销售团队」
    'contact our sales team': '请联系我们的销售团队'
  },
  regexp: [
    // 2k+ universities, community colleges, secondary schools, and bootcamps use GitHub in the classroom.
    [
      /^(\d+)k\+ universities, community colleges, secondary schools, and bootcamps use GitHub in the classroom\.$/,
      (_, count) => joinCjk(`超过 ${thousands(count!)}`, '所大学、社区学院、中学和训练营在课堂上使用 GitHub。')
    ]
  ],
  inline: [
    // Our offering is intended as a <b>whole-school solution</b> to ensure every department benefits. …
    [
      'Our offering is intended as a {} to ensure every department benefits. It promotes an integrated learning and development environment throughout your entire institution. However, the adoption must be at the institutional level and cannot be implemented by individual departments.',
      '我们的方案旨在成为{}，确保每个部门都能受益。它在你的整个机构内推动一体化的学习和开发环境。但采用必须在机构层面进行，不能由单个部门实施。'
    ]
  ]
} satisfies PageDictionary
