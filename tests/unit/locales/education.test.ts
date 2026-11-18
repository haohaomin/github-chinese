import { afterEach, describe, expect, it } from 'vitest'
import { createMatcher } from '../../../src/core/matcher'
import { translateTitleText } from '../../../src/core/title'
import { createTranslator, type Translator } from '../../../src/core/translator'
import type { PageDictionary, PageKey } from '../../../src/core/types'
import common from '../../../src/locales/zh-CN/common'
import commonUi from '../../../src/locales/zh-CN/common-ui'
import education from '../../../src/locales/zh-CN/education'

/** 以通用类型访问词条，便于用任意字符串取值 */
const dict: PageDictionary = education

const PAGES: readonly PageKey[] = ['common', 'education']
const matcher = createMatcher([['education', education]])

function translate(text: string, scope: readonly PageKey[] = PAGES): string | undefined {
  return matcher.translate(text, scope)
}

interface RegExpCase {
  /** 正例：[原文, 译文] */
  readonly hits: readonly (readonly [string, string])[]
  /** 反例：不应命中任何词条 */
  readonly misses: readonly string[]
}

/** 按词典中的正则顺序排列（shared、home、students、teachers、schools、partners），每条正则至少一个正例、一个反例 */
const REGEXP_CASES: readonly RegExpCase[] = [
  // /education 数据
  {
    hits: [
      ['5 million students', '500 万学生'],
      ['120 million students', '1.2 亿学生']
    ],
    misses: ['million students', '5 million developers', '5 million students use GitHub']
  },
  {
    hits: [
      ['200K verified educators', '20 万已验证教育工作者'],
      ['5K verified educators', '5000 已验证教育工作者']
    ],
    misses: ['200 verified educators', '200K educators']
  },
  {
    hits: [
      ['+2K educational institutions', '超过 2000 所教育机构'],
      ['+20K educational institutions', '超过 2 万所教育机构']
    ],
    misses: ['2K educational institutions', '+2K institutions']
  },
  // /education/students 权益
  {
    hits: [
      ['3K Actions minutes and 180 Codespaces hours per month.', '每月 3000 分钟操作和 180 小时代码空间。'],
      ['10K Actions minutes and 60 Codespaces hours per month.', '每月 1 万分钟操作和 60 小时代码空间。']
    ],
    misses: ['3K Actions minutes per month.', '3K Actions minutes and 180 Codespaces hours per month']
  },
  {
    hits: [['2 GB Packages storage and 20 GB Codespaces storage.', '2 GB 软件包存储和 20 GB 代码空间存储。']],
    misses: ['2 GB Packages storage.', '2 GB Packages storage and 20 GB Codespaces storage']
  },
  // /education/schools GitHub 课堂
  {
    hits: [
      [
        '2k+ universities, community colleges, secondary schools, and bootcamps use GitHub in the classroom.',
        '超过 2000 所大学、社区学院、中学和训练营在课堂上使用 GitHub。'
      ]
    ],
    misses: ['2k universities, community colleges, secondary schools, and bootcamps use GitHub in the classroom.']
  },
  // /education/partners 数据
  {
    hits: [['+50% of students will influence their workplaces', '超过 50% 的学生将影响其工作场所']],
    misses: ['50% of students will influence their workplaces', '+50% of students']
  },
  {
    hits: [['75% of student developers actively self-educate', '75% 的学生开发人员主动自学']],
    misses: ['75% of students actively self-educate', 'student developers actively self-educate']
  },
  {
    hits: [
      ['5M students use GitHub Education', '500 万学生使用 GitHub 教育'],
      ['100M students use GitHub Education', '1 亿学生使用 GitHub 教育']
    ],
    misses: ['5M students', '5 students use GitHub Education']
  }
]

describe('education 正则', () => {
  it('每条正则都有测试用例，且锚定、不带 g / y 标志', () => {
    const rules = dict.regexp ?? []
    expect(rules).toHaveLength(REGEXP_CASES.length)
    for (const [pattern] of rules) {
      expect(pattern.source.startsWith('^')).toBe(true)
      expect(pattern.source.endsWith('$')).toBe(true)
      expect(pattern.global || pattern.sticky).toBe(false)
    }
  })

  it.each(REGEXP_CASES.flatMap(item => item.hits))('%s → %s', (source, expected) => {
    expect(translate(source)).toBe(expected)
  })

  it.each(REGEXP_CASES.flatMap(item => item.misses))('不命中：%s', source => {
    expect(translate(source)).toBeUndefined()
  })

  it('正则只在教育页生效', () => {
    expect(translate('5 million students', ['common'])).toBeUndefined()
  })
})

describe('education 代表性词条', () => {
  it.each([
    // 标题与首屏
    ['Empowering the next generation of developers', '赋能下一代开发人员'],
    ['Hey students, your tech career starts here', '同学们，你的技术职业从这里开始'],
    ['Teach with industry-standard tools', '用行业标准工具教学'],
    ['Connect and collaborate with educators and students worldwide', '与全球的教育工作者和学生联系与协作'],
    // 产品名、方案名按 product-names.md 译中文；Learn more about X → 了解 X
    ['Free GitHub Pro account for verified learners', '已验证学习者免费获得 GitHub 专业版帐户'],
    ['Get your GitHub Teams account, free for teachers', '获取你的 GitHub 团队版帐户，教师免费'],
    ['Learn more about GitHub Team', '了解 GitHub 团队版'],
    ['Learn more about Campus Experts', '了解校园专家'],
    ['Code in the cloud with GitHub Codespaces', '使用 GitHub 代码空间在云端编码'],
    ['Discover GitHub Classroom', '探索 GitHub 课堂'],
    ['Deploy GitHub Enterprise at your school, for free', '在你的学校免费部署 GitHub 企业版'],
    ['How do I access free GitHub Copilot Pro?', '如何免费使用 GitHub Copilot 专业版？'],
    // 括号内全是英文缩写：半角括号，与中文之间各一个空格
    ['Enterprise Managed Users (EMUs)', '企业托管用户 (EMU)'],
    // 原文无标点，译文不加
    ['Build your skills and launch your future with GitHub', '用 GitHub 提升技能并开启你的未来'],
    ['Get free access with training for students and faculty', '免费使用并获得面向学生和教职员工的培训'],
    // 常见问题
    ['What is GitHub Education?', 'GitHub 教育是什么？'],
    ['Am I eligible to get the Student Developer Pack?', '我是否有资格获得学生开发人员包？'],
    ['Who can apply?', '谁可以申请？'],
    // 页脚、全局导航中的产品名（scoped）
    ['Actions', '操作'],
    ['Codespaces', '代码空间'],
    ['GitHub Advanced Security', 'GitHub 高级安全'],
    ['Copilot for Business', 'Copilot 商业版'],
    ['GitHub Skills', 'GitHub 技能'],
    ['GitHub Desktop', 'GitHub 桌面版'],
    ['Join GitHub Education', '加入 GitHub 教育']
  ])('%s → %s', (source, expected) => {
    expect(translate(source)).toBe(expected)
  })

  it.each([
    'Actions',
    'Codespaces',
    'Students',
    'GitHub Education',
    'Join GitHub Education',
    'Contact sales',
    'Unlimited repositories',
    'contact our sales team',
    ', which is updated regularly.'
  ])('短语与产品名只在教育页生效：%s', source => {
    expect(translate(source, ['common'])).toBeUndefined()
    expect(translate(source)).toBeDefined()
  })

  it.each(['GitHub Copilot', 'Copilot', 'GitHub CLI', 'Codio', 'Classroom 50', 'CEO'])(
    '品牌名、技术缩写、合作伙伴产品名不收录：%s',
    source => {
      expect(translate(source)).toBeUndefined()
    }
  )

  it('标签页标题：Students - GitHub Education → 学生 - GitHub 教育', () => {
    const translateSegment = (segment: string): string | undefined => translate(segment)
    expect(translateTitleText('Students - GitHub Education', translateSegment, '/education/students')).toBe('学生 - GitHub 教育')
    expect(translateTitleText('Partners - GitHub Education', translateSegment, '/education/partners')).toBe('合作伙伴 - GitHub 教育')
    expect(translateTitleText('GitHub Education', translateSegment, '/education')).toBe('GitHub 教育')
  })
})

describe('education 忽略选择器', () => {
  it.each(dict.ignore ?? [])('%s 是合法选择器', selector => {
    expect(() => document.createElement('div').querySelector(selector)).not.toThrow()
  })
})

describe('education 页面（DOM）', () => {
  const pageMatcher = createMatcher([
    ['common', common],
    ['common', commonUi],
    ['education', education]
  ])
  let translator: Translator | undefined

  function start(html: string): HTMLElement {
    document.body.innerHTML = html
    translator = createTranslator({ matcher: pageMatcher, host: window, resolvePages: () => PAGES })
    translator.start()
    return document.body
  }

  /** 合并空白后的文字 */
  function text(element: Element | null | undefined): string {
    return (element?.textContent ?? '').replace(/\s+/g, ' ').trim()
  }

  afterEach(() => {
    translator?.stop()
    translator = undefined
    document.body.innerHTML = ''
  })

  it('页内导航与首屏眉题：Education / Students / Teachers / Schools / Partners / More', () => {
    // 采集自 /education 的 SubNav（Primer Brand 类名带哈希，已缩短）
    const body = start(`
      <nav class="Primer_Brand__SubNav-module__SubNav___a1b2c" data-testid="SubNav-root">
        <a class="Primer_Brand__SubNav-module__SubNav__heading___d3e4f" href="/education">Education</a>
        <ul class="Primer_Brand__SubNav-module__SubNav__links-overlay___g5h6i">
          <li><a class="Primer_Brand__SubNav-module__SubNav__link___j7k8l" href="/education/students"><span class="Primer_Brand__Text-module__Text___m9n0o">Students</span></a></li>
          <li><a class="Primer_Brand__SubNav-module__SubNav__link___j7k8l" href="/education/teachers"><span class="Primer_Brand__Text-module__Text___m9n0o">Teachers</span></a></li>
          <li><a class="Primer_Brand__SubNav-module__SubNav__link___j7k8l" href="/education/schools"><span class="Primer_Brand__Text-module__Text___m9n0o">Schools</span></a></li>
          <li><a class="Primer_Brand__SubNav-module__SubNav__link___j7k8l" href="/education/partners"><span class="Primer_Brand__Text-module__Text___m9n0o">Partners</span></a></li>
          <li aria-hidden="true"><button type="button" class="Primer_Brand__SubNav-module__SubNav__overflow-toggle___p1q2r"><span class="Primer_Brand__Text-module__Text___m9n0o">More</span></button>
            <div popover="auto"><ul id="overflow" aria-label="More"></ul></div></li>
        </ul>
      </nav>
      <span class="Primer_Brand__Hero-module__Hero-label___s3t4u">
        <span class="Primer_Brand__TextCursorAnimation-module__TextCursorAnimation___v5w6x">
          <span class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__TextCursorAnimation-module__TextCursorAnimation__sizingText___y7z8a" data-testid="EyebrowText">GitHub Education</span>
        </span>
      </span>
      <h1 id="hero-section-brand-heading">Empowering the next generation of developers</h1>`)
    expect([...body.querySelectorAll('nav a, nav button')].map(text)).toEqual(['教育', '学生', '教师', '学校', '合作伙伴', '更多'])
    expect(body.querySelector('#overflow')?.getAttribute('aria-label')).toBe('更多')
    expect(text(body.querySelector('[data-testid="EyebrowText"]'))).toBe('GitHub 教育')
    expect(text(body.querySelector('h1'))).toBe('赋能下一代开发人员')
  })

  it('被 <b> 拆开的整句：Join us today and take the first step …；链接的 aria-label 也翻译', () => {
    // 采集自 /education 的 River 区块：视觉隐藏的 h3 是整句，正文由 <b> 拆开
    const body = start(`
      <section class="Primer_Brand__River-module__RiverBreakout___b1c2d">
        <h3 class="Primer_Brand__Heading-module__Heading___e3f4g visually-hidden">Join us today and take the first step towards transforming your tech education experience.</h3>
        <div class="Primer_Brand__River-module__River__content___h5i6j">
          <p class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__River-module__River__text___k7l8m"><b>Join us today</b> and take the first step towards transforming your tech education experience.</p>
          <a class="Primer_Brand__Link-module__Link___n9o0p" aria-label="Enable GitHub Education" href="/settings/education/benefits"><span class="Primer_Brand__Text-module__Text___m9n0o">Join GitHub Education</span></a>
        </div>
      </section>`)
    expect(text(body.querySelector('h3'))).toBe('立即加入我们，迈出改变你的技术教育体验的第一步。')
    expect(text(body.querySelector('p'))).toBe('立即加入我们，迈出改变你的技术教育体验的第一步。')
    expect(text(body.querySelector('p > b'))).toBe('立即加入我们')
    const link = body.querySelector('a')
    expect(link?.getAttribute('aria-label')).toBe('启用 GitHub 教育')
    expect(text(link)).toBe('加入 GitHub 教育')
  })

  it('被链接拆开的常见问题整句：<a>Sign up for free</a> and take the first step …', () => {
    // 采集自 /education/teachers 的常见问题；/education/schools 同一句是只隔注释的文本组
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p id="linked"><a href="/settings/education/benefits">Sign up for free</a> and take the first step toward becoming a leader in technology and innovation.</p>
        <p id="run">Sign up for free<!-- --> and take the first step toward becoming a leader in technology and innovation.</p>
      </div>`)
    expect(text(body.querySelector('#linked'))).toBe('免费注册，迈出成为技术与创新领导者的第一步。')
    expect(text(body.querySelector('#linked a'))).toBe('免费注册')
    expect(text(body.querySelector('#run'))).toBe('免费注册，迈出成为技术与创新领导者的第一步。')
  })

  it('长句中的链接：… through our <a>GitHub Education for Teachers</a> portal. 整句改写语序，槽位两侧不留空格', () => {
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p>To access GitHub Education benefits, you need to be a currently employed educator at an accredited educational institution. Please apply by submitting proof of academic employment, such as a faculty ID or employment verification letter, using your institutional email address through our <a href="/settings/education/benefits">GitHub Education for Teachers</a> portal.</p>
      </div>`)
    expect(text(body.querySelector('p'))).toBe(
      '要获得 GitHub 教育福利，你需要是经认证教育机构的在职教育工作者。请通过我们的面向教师的 GitHub 教育门户，使用你的机构电子邮件地址提交学术任职证明（如教职工 ID 或在职证明信）来申请。'
    )
    expect(text(body.querySelector('a'))).toBe('面向教师的 GitHub 教育')
  })

  it('超过行内句键长的段落按片段翻译：… in our <a>GitHub Education for educators</a> documentation page.', () => {
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p>This free benefit is available to teachers who qualify for GitHub Education. To apply, please provide proof of your current academic position using your official academic email address along with supplementary documents, such as a faculty ID or an employment verification letter, via our Teacher Application. You can find more information in our <a href="https://docs.github.com/en/education">GitHub Education for educators</a> documentation page.</p>
      </div>`)
    expect(text(body.querySelector('p'))).toBe(
      '此免费福利面向符合 GitHub 教育资格的教师。要申请，请通过我们的教师申请，使用你的官方学术电子邮件地址提供当前学术职位证明，并附上补充文件（如教职工 ID 或在职证明信）。更多信息请参阅我们的 面向教育工作者的 GitHub 教育 文档页面。'
    )
  })

  it('<b> 拆开的方案说明：Our offering is intended as a <b>whole-school solution</b> to ensure …', () => {
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p>Our offering is intended as a <b>whole-school solution</b> to ensure every department benefits. It promotes an integrated learning and development environment throughout your entire institution. However, the adoption must be at the institutional level and cannot be implemented by individual departments.</p>
      </div>`)
    expect(text(body.querySelector('p'))).toBe(
      '我们的方案旨在成为全校解决方案，确保每个部门都能受益。它在你的整个机构内推动一体化的学习和开发环境。但采用必须在机构层面进行，不能由单个部门实施。'
    )
    expect(text(body.querySelector('b'))).toBe('全校解决方案')
  })

  it('<b> 开头的折叠面板标题：<b>Empower your classroom</b> with professional developer tools 按片段翻译，保留原文空格', () => {
    // 采集自 /education/teachers 的 SectionIntro 标题：<b> 前没有文本节点，译文不能前置；原文无标点，译文不加
    const body = start(`
      <h2 class="Primer_Brand__Heading-module__Heading___e3f4g Primer_Brand__SectionIntro-module__SectionIntro-heading___g1h2i"><b>Empower your classroom</b> with professional developer tools</h2>`)
    expect(body.querySelector('h2')?.textContent).toBe('赋能你的课堂 借助专业开发人员工具')
    expect(text(body.querySelector('b'))).toBe('赋能你的课堂')
  })

  it('三个相邻的 <b>（宿主没有直接文字）按片段翻译：首段以全角标点收尾，「请」落在第二段，段间不留空格', () => {
    // 采集自 /education/schools 常见问题「GitHub 教育适合我的学校吗？」答案末段，整段全是粗体
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p><b>If your institution does not fit this criteria, such as not granting formal degrees or certificates, please </b><b>contact our sales team</b><b> to discuss alternative options and available education discounts.</b></p>
      </div>`)
    expect(body.querySelector('p')?.textContent).toBe(
      '如果你的机构不符合此标准，例如不授予正式学位或证书，请联系我们的销售团队，讨论其他选择和可用的教育折扣。'
    )
    expect([...body.querySelectorAll('b')].map(element => element.textContent)).toEqual([
      '如果你的机构不符合此标准，例如不授予正式学位或证书，',
      '请联系我们的销售团队',
      '，讨论其他选择和可用的教育折扣。'
    ])
  })

  it('只隔注释的相邻文本先整组匹配：产品名、链接文字、句末标点都在整句里', () => {
    // 采集自 /education/schools（Actions / Codespaces / Copilot、Terms and Conditions）与 /education/students（Student）
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p id="leverage">Implement GitHub Enterprise Server and Cloud in your school to unlock a suite of advanced tools for educators and students. Leverage GitHub <!-- -->Actions<!-- -->, <!-- -->Codespaces<!-- -->, and <!-- -->Copilot<!-- --> to elevate your technical education and collaboration standards.</p>
        <p id="terms">Agree to our <!-- -->Terms and Conditions<!-- -->.</p>
        <p id="copilot">GitHub Copilot <!-- -->Student<!-- --> is your AI-powered coding companion. Available for free to verified students, teachers, and open-source maintainers, Copilot offers real-time, context-aware code suggestions right in your editor—whether you're learning the ropes or an experienced developer.</p>
        <p id="period">Make it easier for students and educators to collaborate on projects and assignments<!-- -->.</p>
      </div>`)
    expect(text(body.querySelector('#leverage'))).toBe(
      '在你的学校部署 GitHub 企业服务器和企业云，为教育工作者和学生解锁一整套高级工具。利用 GitHub 操作、代码空间和 Copilot 提升你的技术教育和协作水准。'
    )
    expect(text(body.querySelector('#terms'))).toBe('同意我们的条款和条件。')
    expect(text(body.querySelector('#copilot'))).toBe(
      'GitHub Copilot 学生版是你的 AI 驱动编码伙伴。已验证的学生、教师和开源维护者可免费使用，Copilot 直接在你的编辑器中提供实时、感知上下文的代码建议——无论你是初学者还是经验丰富的开发人员。'
    )
    expect(text(body.querySelector('#period'))).toBe('让学生和教育工作者更轻松地协作完成项目和作业。')
  })

  it('超过采集上限（400 字符）的文本组同样整组匹配', () => {
    // 采集自 /education/partners 的常见问题：Please fill out <!-- -->our partnership application<!-- --> to have …
    const body = start(`
      <div class="Primer_Brand__Text-module__Text___m9n0o">
        <p>Student Developer Pack partners are an essential part of our student’s learning experience. We seek out and onboard 5-10 new partners per year. Partner tools and resources must align with the developer lifecycle or related fields and be offered at no cost to the student. Please fill out <!-- -->our partnership application<!-- --> to have your company considered. Please note that not all who inquire are approved to join the Student Developer Pack.</p>
      </div>`)
    expect(text(body.querySelector('p'))).toBe(
      '学生开发人员包合作伙伴是我们学生学习体验的重要组成部分。我们每年寻找并引入 5-10 个新合作伙伴。合作伙伴的工具和资源必须契合开发人员生命周期或相关领域，并免费提供给学生。请填写我们的合作申请表，以便我们考虑你的公司。请注意，并非所有咨询者都会获准加入学生开发人员包。'
    )
  })

  it('推荐语整块忽略：引言、人名与职务保持原文，旁边的 CTA 照常翻译', () => {
    // 采集自 /education 的 Testimonial 与 CTABanner；人名、职务换成占位
    const body = start(`
      <figure class="Primer_Brand__Testimonial-module__Testimonial___kxB6R Primer_Brand__Testimonial-module__Testimonial--variant-expressive___J1PIY Primer_Brand__Testimonial-module__Testimonial--border___pbUPS">
        <div class="Primer_Brand__Testimonial-module__Testimonial__quoteWrapper___q1r2s">
          <blockquote><span class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Testimonial-module__Testimonial-quote___t3u4v"><b>Join us today</b> and take the first step towards transforming your tech education experience.</span></blockquote>
        </div>
        <figcaption class="Primer_Brand__Testimonial-module__Testimonial-caption___8c_KF">
          <span class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Testimonial-module__Testimonial-from___XLpqj">Sample Person</span>
          <span class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Testimonial-module__Testimonial-position____jQ17">Teachers</span>
        </figcaption>
      </figure>
      <section class="Primer_Brand__CTABanner-module__CTABanner___w5x6y">
        <h3 class="Primer_Brand__Heading-module__Heading___e3f4g">Begin your GitHub Education journey</h3>
        <p class="Primer_Brand__Text-module__Text___m9n0o">Join us today and take the first step towards transforming your tech education experience.</p>
      </section>`)
    const selector = (dict.ignore ?? []).join(', ')
    expect(body.querySelector('blockquote')?.closest(selector)).not.toBeNull()
    expect(body.querySelector('figcaption')?.closest(selector)).not.toBeNull()
    // 引言里即使出现词典已收录的句子也不翻译
    expect(text(body.querySelector('blockquote'))).toBe(
      'Join us today and take the first step towards transforming your tech education experience.'
    )
    expect(text(body.querySelector('figcaption'))).toBe('Sample Person Teachers')
    expect(text(body.querySelector('section h3'))).toBe('开启你的 GitHub 教育之旅')
    expect(text(body.querySelector('section p'))).toBe('立即加入我们，迈出改变你的技术教育体验的第一步。')
  })

  it('学校案例卡片：标题（学校名，链接到博客）忽略，说明与操作标签翻译；其他卡片标题照常翻译', () => {
    // 采集自 /education/schools「看看学校如何使用 GitHub」与 /education 的用户卡片；学校名换成占位
    const body = start(`
      <div class="Primer_Brand__Card-module__Card___c1d2e">
        <h3 class="Primer_Brand__Heading-module__Heading___e3f4g Primer_Brand__Card-module__Card__heading___f3g4h"><a href="https://github.blog/2017-02-15-sample-story/" class="Primer_Brand__Card-module__Card__link___LyRm6">Sample University</a></h3>
        <p class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Card-module__Card__description___i5j6k">Give students hands-on experience with the tools used by professional developers.</p>
        <div class="Primer_Brand__Card-module__Card__action___l7m8n" aria-hidden="true"><span class="Primer_Brand__Card-module__Card__actionLabelClip___o9p0q"><span class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Card-module__Card__actionLabel___r1s2t">Read more</span></span></div>
      </div>
      <div class="Primer_Brand__Card-module__Card___c1d2e">
        <h3 class="Primer_Brand__Heading-module__Heading___e3f4g Primer_Brand__Card-module__Card__heading___f3g4h"><a href="/education/students" class="Primer_Brand__Card-module__Card__link___LyRm6">Students</a></h3>
        <p class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Card-module__Card__description___i5j6k">Join a community where learning meets doing, with free access to the same tools professional developers use, including GitHub Copilot Student and Codespaces.</p>
        <div class="Primer_Brand__Card-module__Card__action___l7m8n" aria-hidden="true"><span class="Primer_Brand__Card-module__Card__actionLabelClip___o9p0q"><span class="Primer_Brand__Text-module__Text___m9n0o Primer_Brand__Card-module__Card__actionLabel___r1s2t">Learn more about students</span></span></div>
      </div>`)
    const selector = (dict.ignore ?? []).join(', ')
    const [story, students] = body.querySelectorAll('div[class*="Card-module__Card___"]')
    expect(story?.querySelector('a')?.closest(selector)).not.toBeNull()
    expect(text(story?.querySelector('h3'))).toBe('Sample University')
    expect(text(story?.querySelector('p'))).toBe('让学生亲身体验专业开发人员使用的工具。')
    expect(text(story?.querySelector('[aria-hidden] span'))).toBe('阅读更多')
    expect(students?.querySelector('a')?.closest(selector)).toBeNull()
    expect(text(students?.querySelector('h3'))).toBe('学生')
    expect(text(students?.querySelector('p'))).toBe(
      '加入一个学以致用的社区，免费使用专业开发人员使用的同款工具，包括 GitHub Copilot 学生版和代码空间。'
    )
    expect(text(students?.querySelector('[aria-hidden] span'))).toBe('了解学生相关信息')
  })

  it('折叠面板标题与常见问题：按钮内的文字、details/summary 里的标题', () => {
    const body = start(`
      <div class="Primer_Brand__RiverAccordion-module__RiverAccordion__item___u3v4w">
        <h3 class="Primer_Brand__Heading-module__Heading___e3f4g"><button class="Primer_Brand__RiverAccordion-module__RiverAccordion__trigger___x5y6z" type="button">Harness the AI power of GitHub Copilot Pro<span aria-hidden="true"></span></button></h3>
      </div>
      <details class="Primer_Brand__Accordion-module__Accordion___a7b8c" name="faq-sample">
        <summary class="Primer_Brand__Accordion-module__Accordion__summary___d9e0f"><span aria-hidden="true"></span><h4 class="Primer_Brand__Heading-module__Heading___e3f4g">How can I qualify for GitHub Education benefits as a teacher?</h4></summary>
        <section><div><div class="Primer_Brand__Text-module__Text___m9n0o"><p><b>Free access to tools</b>: Explore our Learning Paths to find structured educational content designed to guide your learning. These paths provide a clear progression through different tech topics, helping you enhance your knowledge and skills at your own pace.</p></div></div></section>
      </details>`)
    expect(text(body.querySelector('button'))).toBe('发挥 GitHub Copilot 专业版的 AI 力量')
    expect(text(body.querySelector('h4'))).toBe('作为教师，我如何获得 GitHub 教育福利的资格？')
    expect(text(body.querySelector('details p'))).toBe(
      '免费使用工具：探索我们的学习路径，找到旨在引导你学习的结构化教育内容。这些路径提供贯穿不同技术主题的清晰进阶，帮助你按自己的节奏提升知识和技能。'
    )
  })
})
