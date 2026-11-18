import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { millions } from './numbers'

/**
 * 合作伙伴页（/education/partners）：首屏、数据、合作方式折叠面板、CTA、三类合作伙伴卡片、常见问题。
 * 常见问题里只隔注释的相邻文本（our partnership application、partner portal 等）先整组匹配，整句照录；
 * 再给出各段，供分段时回退。推荐语由 shared 的忽略规则排除。
 */
export default {
  static: {
    // 首屏
    'Connect and collaborate with educators and students worldwide': '与全球的教育工作者和学生联系与协作',
    'Join us in our mission to empower the next generation of developers': '加入我们赋能下一代开发人员的使命',
    'Partner with GitHub Education': '与 GitHub 教育合作',

    // 数据（数字见 regexp）
    'Your presence with us now can set the stage for future partnerships.': '现在与我们同行，可为未来的合作奠定基础。',
    'Integrate your tools with our resources to amplify the learning path of tomorrow’s developers.':
      '将你的工具与我们的资源整合，拓宽未来开发人员的学习路径。',
    'Connect with us to help them build their skills and become an integral part of their career.':
      '与我们联系，帮助他们提升技能，成为其职业生涯中不可或缺的一部分。',

    // 合作方式折叠面板：<b>Expand your impact.</b> Increase your product’s exposure …
    'Expand your impact.': '扩大你的影响力。',
    'Increase your product’s exposure in the GitHub learning community and the tech industry at large.':
      '提升你的产品在 GitHub 学习社区乃至整个技术行业的曝光度。',
    'Join the Student Developer Pack': '加入学生开发人员包',
    'Let’s get you some new lifelong users through the Student Developer Pack! Join our bundle of 80+ professional-grade tools that only verified students can access, so they can ship their projects like a pro.':
      '通过学生开发人员包为你赢得新的终身用户！加入我们由 80 多款专业级工具组成的套装，只有已验证的学生才能使用，让他们像专业人士一样交付项目。',
    'Protect your brand from fraud and abuse': '保护你的品牌免受欺诈和滥用',
    'Reach real students worldwide, while maintaining your brand’s authenticity and trust. Our system meticulously verifies users, monitors to prevent misuse, and ensures the program remains true to its purpose of enabling the next generation of developers.':
      '触达全球真实的学生，同时维护你品牌的真实性和信任。我们的系统严格验证用户，监控以防止滥用，并确保该计划始终忠于赋能下一代开发人员的宗旨。',
    'Connect with our student community': '与我们的学生社区建立联系',
    'Want a direct line to the students of the world? Work with us to engage with our incredible community of student learners through content, events, and more.':
      '想直接触达全球的学生？与我们合作，通过内容、活动等方式与我们出色的学生学习者社区互动。',
    'Hack the future with us': '与我们一起开创未来',
    'Join forces with us to make a mark in the hackathon circuit. Provide coveted prizes, showcase your branded swag, and enjoy mutual promotion at key coding events. These partnerships will put your brand in the spotlight and inspire the next wave of tech talent.':
      '与我们联手，在黑客马拉松领域留下印记。提供令人向往的奖品，展示你的品牌周边，并在重要编程活动中互相推广。这些合作将让你的品牌成为焦点，并激励下一波技术人才。',

    // 合作伙伴评价：<b>Our partners love working with us.</b> Discover why …（视觉隐藏的标题是整句）
    'Our partners love working with us. Discover why our partners continually choose to engage with our exceptional community.':
      '我们的合作伙伴乐于与我们合作。了解为什么我们的合作伙伴持续选择参与我们卓越的社区。',
    'Our partners love working with us.': '我们的合作伙伴乐于与我们合作。',
    'Discover why our partners continually choose to engage with our exceptional community.':
      '了解为什么我们的合作伙伴持续选择参与我们卓越的社区。',

    // CTA
    'Ready to work with us?': '准备好与我们合作了吗？',
    'Join us today in our mission to empower the tech innovators of tomorrow.': '立即加入我们赋能未来技术创新者的使命。',

    // 三类合作伙伴卡片
    'There are multiple ways you can partner with us. Choose what best aligns with your business goals.':
      '与我们合作的方式有多种。选择最符合你业务目标的方式。',
    'Community partner': '社区合作伙伴',
    'Want to work directly with our communities, like the Campus Experts? You can get involved through co-branded content, meetups, and more.':
      '想直接与我们的社区合作，比如校园专家？你可以通过联合品牌内容、线下聚会等方式参与。',
    'Resource partner': '资源合作伙伴',
    'Looking to share your product with students worldwide? This option is the perfect fit for those who want a long-term partnership with a global reach.':
      '想向全球学生分享你的产品？此选项非常适合希望建立具有全球影响力的长期合作关系的伙伴。',
    'Events partner': '活动合作伙伴',
    'Get in on the action. Sponsor a prize category, collaborate on an event, or create your own mini-event.':
      '参与进来。赞助一个奖项类别、合作举办活动，或创建你自己的小型活动。',

    // 常见问题
    'How do I become a Student Developer Pack Partner?': '如何成为学生开发人员包合作伙伴？',
    // … Please fill out <!-- -->our partnership application<!-- --> to have your company considered. …
    'Student Developer Pack partners are an essential part of our student’s learning experience. We seek out and onboard 5-10 new partners per year. Partner tools and resources must align with the developer lifecycle or related fields and be offered at no cost to the student. Please fill out our partnership application to have your company considered. Please note that not all who inquire are approved to join the Student Developer Pack.':
      '学生开发人员包合作伙伴是我们学生学习体验的重要组成部分。我们每年寻找并引入 5-10 个新合作伙伴。合作伙伴的工具和资源必须契合开发人员生命周期或相关领域，并免费提供给学生。请填写我们的合作申请表，以便我们考虑你的公司。请注意，并非所有咨询者都会获准加入学生开发人员包。',
    'Student Developer Pack partners are an essential part of our student’s learning experience. We seek out and onboard 5-10 new partners per year. Partner tools and resources must align with the developer lifecycle or related fields and be offered at no cost to the student. Please fill out':
      '学生开发人员包合作伙伴是我们学生学习体验的重要组成部分。我们每年寻找并引入 5-10 个新合作伙伴。合作伙伴的工具和资源必须契合开发人员生命周期或相关领域，并免费提供给学生。请填写',
    'our partnership application': '我们的合作申请表',
    'to have your company considered. Please note that not all who inquire are approved to join the Student Developer Pack.':
      '，以便我们考虑你的公司。请注意，并非所有咨询者都会获准加入学生开发人员包。',
    'What kind of ways can my company partner with GitHub Education?': '我的公司可以通过哪些方式与 GitHub 教育合作？',
    'We have three main ways you can partner with GitHub Education. You can be a Resource Partner through the Student Developer Pack or by otherwise offering free tools or resources to students. You can be a Community Partner, supporting students in their communities or an Event and Strategic Partner, by collaborating on a Hackathon, conference, or other event.':
      '与 GitHub 教育合作主要有三种方式。你可以通过学生开发人员包或以其他方式向学生免费提供工具或资源，成为资源合作伙伴；可以在学生社区中支持学生，成为社区合作伙伴；也可以通过合作举办黑客马拉松、会议或其他活动，成为活动与战略合作伙伴。',
    'Is there a difference between partnering with GitHub Education and partnering with GitHub?':
      '与 GitHub 教育合作和与 GitHub 合作有区别吗？',
    // … please visit the <!-- -->partner portal<!-- --> to better understand …（首段超过采集上限，按快照照录）
    'GitHub Education partnerships drive adoption and engagement by seeking out and providing industry standard tools and resources for all future developers. We do this by partnering with companies who support our learners with free use of their tools, special events, training opportunities, product testing, and more for a mutually beneficial learning environment. To grow your business with GitHub, please visit the partner portal to better understand Channel, Service, and Technical Partnership opportunities.':
      'GitHub 教育合作关系通过为所有未来开发人员寻找并提供行业标准工具和资源来推动采用和参与。为此，我们与支持学习者的公司合作，这些公司提供工具免费使用、特别活动、培训机会、产品测试等，共建互惠的学习环境。要与 GitHub 共同发展业务，请访问合作伙伴门户，进一步了解渠道、服务和技术合作机会。',
    'GitHub Education partnerships drive adoption and engagement by seeking out and providing industry standard tools and resources for all future developers. We do this by partnering with companies who support our learners with free use of their tools, special events, training opportunities, product testing, and more for a mutually beneficial learning environment. To grow your business with GitHub, please visit the':
      'GitHub 教育合作关系通过为所有未来开发人员寻找并提供行业标准工具和资源来推动采用和参与。为此，我们与支持学习者的公司合作，这些公司提供工具免费使用、特别活动、培训机会、产品测试等，共建互惠的学习环境。要与 GitHub 共同发展业务，请访问',
    'partner portal': '合作伙伴门户',
    'to better understand Channel, Service, and Technical Partnership opportunities.': '，进一步了解渠道、服务和技术合作机会。',
    'What kinds of partners are you looking for?': '你们在寻找什么样的合作伙伴？',
    'GitHub Education’s mission is to enable all future developers. We seek partners who align with this mission to share knowledge, tools, and resources to make the future of development as strong as it can be. Partners must be willing to offer free resources to students that align with the learning journey.':
      'GitHub 教育的使命是赋能所有未来的开发人员。我们寻找认同这一使命的合作伙伴，共享知识、工具和资源，让开发的未来尽可能强大。合作伙伴必须愿意向学生免费提供契合学习历程的资源。',
    'My company wants to partner with GitHub Education on an in-person event. What is the process for this?':
      '我的公司想与 GitHub 教育合作举办线下活动。流程是怎样的？',
    // … but please fill out <!-- -->our partnership form<!-- --> and we will be in touch …
    'We have limited capacity to support all in person event requests, but please fill out our partnership form and we will be in touch if we are able to move forward with your request.':
      '我们支持所有线下活动请求的能力有限，但请填写我们的合作表单，如果我们能够推进你的请求，将与你联系。',
    'We have limited capacity to support all in person event requests, but please fill out': '我们支持所有线下活动请求的能力有限，但请填写',
    'our partnership form': '我们的合作表单',
    'and we will be in touch if we are able to move forward with your request.': '，如果我们能够推进你的请求，将与你联系。',
    'There was a product I thought was in the Student Developer Pack but I no longer see it. What happened?':
      '我记得学生开发人员包中有某个产品，但现在看不到了。发生了什么？',
    // … visit our <!-- -->Student Developer Pack public repository<!-- -->, which is updated regularly.
    'Sometimes, a company has to leave the Student Developer Pack and no longer offers their resources to students through our system. In some cases, it’s because the company has decided to offer their own student benefit directly. In other cases, it’s because offering a free benefit isn’t aligned with their business goals. For the most up to date list of Pack partners, visit our Student Developer Pack public repository, which is updated regularly.':
      '有时，某家公司不得不退出学生开发人员包，不再通过我们的系统向学生提供资源。有些情况是因为该公司决定直接提供自己的学生福利，另一些情况则是因为提供免费福利与其业务目标不符。要获取最新的开发人员包合作伙伴列表，请访问我们的学生开发人员包公共存储库，该存储库定期更新。',
    'Sometimes, a company has to leave the Student Developer Pack and no longer offers their resources to students through our system. In some cases, it’s because the company has decided to offer their own student benefit directly. In other cases, it’s because offering a free benefit isn’t aligned with their business goals. For the most up to date list of Pack partners, visit our':
      '有时，某家公司不得不退出学生开发人员包，不再通过我们的系统向学生提供资源。有些情况是因为该公司决定直接提供自己的学生福利，另一些情况则是因为提供免费福利与其业务目标不符。要获取最新的开发人员包合作伙伴列表，请访问我们的',
    'Student Developer Pack public repository': '学生开发人员包公共存储库'
  },
  scoped: {
    'Partner now': '立即合作',
    // 只用于「… visit our <!-- -->Student Developer Pack public repository<!-- -->, which is updated regularly.」逐段回退，「该存储库」只对本句成立
    ', which is updated regularly.': '，该存储库定期更新。'
  },
  regexp: [
    // +50% of students will influence their workplaces / 75% of student developers actively self-educate
    [/^\+(\d+)% of students will influence their workplaces$/, '超过 $1% 的学生将影响其工作场所'],
    [/^(\d+)% of student developers actively self-educate$/, '$1% 的学生开发人员主动自学'],
    // 5M students use GitHub Education
    [/^(\d+)M students use GitHub Education$/, (_, count) => joinCjk(millions(count!), '学生使用 GitHub 教育')]
  ]
} satisfies PageDictionary
