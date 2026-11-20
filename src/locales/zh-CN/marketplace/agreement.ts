import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, translateDate } from '../helpers'

/**
 * 市场开发人员协议弹窗（上架项编辑页「签署 GitHub 市场开发人员协议」与接受条款处的协议链接）：法律文本逐段收录。
 * 弹窗版本（v2.4）与站点政策仓库的 Markdown 版措辞有出入：采集到的编号段落、含链接的首段与通知段按弹窗原文收录，
 * 其余按 Markdown 版收录；逗号、引号、大小写、列表编号写法不同的段落由 regexp 末条按规范化后的原文查表（见 agreementText）。
 * 术语：listing → 上架项，End User → 最终用户，Personal Data → 个人数据，Token → 令牌，Action → 操作。
 */

/** 协议正文：原文 → 译文（标题、列表项带编号） */
const AGREEMENT: Readonly<Record<string, string>> = {
  'These terms and conditions (the "Agreement") govern your participation in GitHub’s Marketplace. By enrolling to participate in the Marketplace or by clicking “I Accept” below, you are confirming that you understand this agreement, and that you accept all of its terms and conditions. If you are entering into this Agreement on behalf of a company or other legal entity, you represent that you have the legal authority to bind the entity to this agreement, in which case “You” will mean the entity you represent.':
    '本条款与条件（“本协议”）适用于你参与 GitHub 市场。注册参与市场或单击下方的“我接受”，即表示你确认理解本协议并接受其全部条款与条件。如果你代表公司或其他法律实体订立本协议，即表示你声明你拥有使该实体受本协议约束的法定权限，在此情况下，“你”指你所代表的实体。',

  '1. DEFINITIONS': '1. 定义',
  '"Action" means a workflow that allows you to implement custom logic to perform a particular task with GitHub without having to create an application.':
    '“操作”指一种工作流，使你无需创建应用程序即可实现自定义逻辑，以通过 GitHub 执行特定任务。',
  '“Brand Features” means the trademarks and similar intellectual property of each party.': '“品牌特征”指各方的商标及类似知识产权。',
  '"Developer" or "You" means the company or individual who has created the Developer Application.':
    '“开发人员”或“你”指创建开发人员应用程序的公司或个人。',
  '"Developer Application" or "Developer Product" means the software, related content and other digital materials created by You for use in connection with GitHub and accessible via Marketplace. This includes Actions, GitHub Copilot Extensions, and other applications or products that use or interact with generative artificial intelligence (AI) technology.':
    '“开发人员应用程序”或“开发人员产品”指由你创建、供与 GitHub 结合使用并可通过市场获取的软件、相关内容及其他数字资料。其中包括操作、GitHub Copilot 扩展，以及使用生成式人工智能 (AI) 技术或与之交互的其他应用程序或产品。',
  '“End User” means any person, company or other legal entity that will acquire licenses to a Developer Product via the GitHub Marketplace.':
    '“最终用户”指将通过 GitHub 市场获得开发人员产品许可的任何个人、公司或其他法律实体。',
  '“GitHub API” means any proprietary application programming interface developed by GitHub, and includes the GitHub Copilot API. Access to and use of a GitHub API is governed by the ToS.':
    '“GitHub API”指由 GitHub 开发的任何专有应用程序编程接口，包括 GitHub Copilot API。对 GitHub API 的访问和使用受 ToS 约束。',
  '“GitHub Marketplace” or “Marketplace” means the proprietary online marketplace site operated by GitHub where Developer Products may be delivered to End Users.':
    '“GitHub 市场”或“市场”指由 GitHub 运营的专有在线市场网站，开发人员产品可在其中交付给最终用户。',
  '“Listing” means the content provided for listing the Developer Product on GitHub Marketplace.':
    '“上架项”指为在 GitHub 市场上架开发人员产品而提供的内容。',
  '“Taxes” means any tax, of any kind or sort regardless of origin, including interest or penalties thereon.':
    '“税费”指任何种类或性质的任何税项（无论其来源），包括相关利息或罚款。',
  '“Token” means the credentials Developer must obtain to access a GitHub API.': '“令牌”指开发人员访问 GitHub API 所必须获取的凭据。',
  '“Usage Data” means Marketplace related data generated in connection with End User use of GitHub Marketplace and licensure of Developer Products, including but not limited to usage statistics and aggregated sales data. Usage Data does not include and specifically excludes banking and payment information.':
    '“使用数据”指因最终用户使用 GitHub 市场及取得开发人员产品许可而产生的市场相关数据，包括但不限于使用情况统计和汇总销售数据。使用数据不包括且明确排除银行和付款信息。',

  '2. PURPOSE AND LICENSE GRANT': '2. 目的与许可授予',
  'This Agreement sets forth the terms that govern a Developer publishing Listings on the GitHub Marketplace for End Users to use Developer Products. This Agreement is applicable to all Developer Products, regardless if distributed for free or for a fee. Developer agrees to use the GitHub Marketplace solely for the purposes permitted by this Agreement. Developer is solely responsible for its Developer Products.':
    '本协议规定了开发人员在 GitHub 市场发布上架项以供最终用户使用开发人员产品时须遵守的条款。本协议适用于所有开发人员产品，无论其免费分发还是收费分发。开发人员同意仅出于本协议允许的目的使用 GitHub 市场。开发人员对其开发人员产品承担全部责任。',
  'Developer grants to GitHub a non-exclusive, worldwide, transferable, sublicensable, fully paid-up, royalty-free license to process the Listing in any fashion (including testing and displaying it on Marketplace), and to display Developer’s Brand Features in connection with Marketplace.':
    '开发人员授予 GitHub 一项非独占、全球性、可转让、可再许可、已全额付清、免版税的许可，允许 GitHub 以任何方式处理上架项（包括对其进行测试并在市场上展示），以及在与市场相关的情况下展示开发人员的品牌特征。',
  'In addition to the licenses granted above, GitHub may include Developer Brand Features in any material marketing Marketplace. If Developer stops distributing a Developer Product on Marketplace, GitHub will stop use of the discontinued products’ Brand Features.':
    '除上述授予的许可外，GitHub 还可以在任何推广市场的材料中使用开发人员的品牌特征。如果开发人员停止在市场上分发某个开发人员产品，GitHub 将停止使用已停止分发产品的品牌特征。',
  'Developer must include a separate end user license agreement (“EULA”) in its Developer Products that will govern the End User’s rights to the Developer Products. Developer acknowledges and agrees that the applicable EULA for each Developer Product is solely between Developer and the End User. GitHub shall not be responsible, nor have any liability whatsoever, under any EULA.':
    '开发人员必须在其开发人员产品中附带单独的最终用户许可协议（“EULA”），用以规定最终用户对开发人员产品享有的权利。开发人员确认并同意，每个开发人员产品适用的 EULA 仅存在于开发人员与最终用户之间。GitHub 不对任何 EULA 负责，也不因任何 EULA 承担任何责任。',
  'Except for the license rights granted in this Agreement, (a) Developer retains all rights in the Developer Products; (b) each party retains all rights it has independent of this Agreement, including rights under the US Copyright Act or similar laws of other jurisdictions; and (c) each party owns all rights, title, and interest in its respective Brand Features. Each party is responsible for protecting and enforcing its own rights and neither party has an obligation to do so on the other’s behalf.':
    '除本协议授予的许可权利外，(a) 开发人员保留对开发人员产品的所有权利；(b) 各方保留其独立于本协议而享有的所有权利，包括依据美国《版权法》或其他司法管辖区类似法律享有的权利；且 (c) 各方拥有其各自品牌特征的所有权利、所有权和权益。各方负责保护和行使其自身权利，任何一方均无义务代表另一方这样做。',
  'GitHub shall be entitled to provide Developer’s name, address, and other contact details to any third party as required by law or that reasonably, in GitHub’s sole determination, claims that Developer does not possess all of the necessary intellectual property rights in or to the Developer Products.':
    '如法律要求，或任何第三方（经 GitHub 自行判断）合理地主张开发人员不具备开发人员产品所需的全部知识产权，GitHub 有权向该第三方提供开发人员的姓名、地址和其他联系方式。',

  '3. RESTRICTIONS AND RESPONSIBILITIES': '3. 限制与责任',
  "Notwithstanding any of the requirements set forth in Section 2 (Purpose and License Grant) above, Developer's use of Marketplace is explicitly conditioned on Developer’s adherence to this Agreement, including the restrictions and compliance requirements set forth below.":
    '尽管有上文第 2 条（目的与许可授予）规定的任何要求，开发人员使用市场的明确前提是遵守本协议，包括下文规定的限制和合规要求。',
  'Developer agrees it will protect the privacy and legal rights of all End Users with respect to the use of Developer Products. If an End User provides Developer with or the Developer Product otherwise collects, discloses, accesses, or uses End User Personal Data, then the Developer must (a) inform End Users that such information will be available to the Developer Products; (b) provide a legally adequate privacy notice and protection to End Users; (c) obtain valid End User consent as required, and (d) comply with all other data privacy obligations applicable to Developer.':
    '开发人员同意在开发人员产品的使用方面保护所有最终用户的隐私和合法权利。如果最终用户向开发人员提供最终用户个人数据，或开发人员产品以其他方式收集、披露、访问或使用最终用户个人数据，则开发人员必须 (a) 告知最终用户此类信息将可供开发人员产品使用；(b) 向最终用户提供法律上充分的隐私声明和保护；(c) 按要求获得最终用户的有效同意；以及 (d) 遵守适用于开发人员的所有其他数据隐私义务。',
  'In order to use and access a GitHub API, Developer must obtain a Token by becoming a subscriber. Developer may not share its Token with any third party, shall keep its Token and all login information secure, and shall use the Token as Developer’s sole means of accessing a GitHub API.':
    '要使用和访问 GitHub API，开发人员必须成为订阅者以获取令牌。开发人员不得与任何第三方共享其令牌，应确保其令牌和所有登录信息的安全，并应将令牌作为访问 GitHub API 的唯一方式。',
  'Developer will not engage in any activity with Marketplace, including attempting to distribute any Developer Product, that violates GitHub’s Terms of Service including Acceptable Use Policies. Additionally, Developer will not attempt to distribute any Developer Product that:':
    '开发人员不得在市场上从事任何违反 GitHub 服务条款（包括可接受使用政策）的活动，包括试图分发任何开发人员产品。此外，开发人员不得试图分发具有以下情形的任何开发人员产品：',
  '(i) Contains or installs any active malware or exploits, or uses our platform for exploit delivery (such as part of a command and control system);':
    '(i) 包含或安装任何活动的恶意软件或漏洞利用程序，或利用我们的平台投放漏洞利用程序（例如作为命令与控制系统的一部分）；',
  '(ii) Enables the unauthorized download of streaming content or media; or': '(ii) 支持未经授权下载流式内容或媒体；或',
  '(iii) Diverts End Users or provides links to any other site that mimics Marketplace or passes itself off as Marketplace':
    '(iii) 将最终用户转引至任何模仿或冒充市场的其他网站，或提供指向此类网站的链接',
  'With respect to Developer Products that interact with generative AI technology, including GitHub Copilot Extensions, Developer will:':
    '对于与生成式 AI 技术交互的开发人员产品（包括 GitHub Copilot 扩展），开发人员应：',
  '(i) Test the Developer Product using various inputs to ensure that outputs do not violate this Agreement;':
    '(i) 使用各种输入测试开发人员产品，以确保输出不违反本协议；',
  '(ii) Notify users when they are interacting with generative AI content;': '(ii) 在用户与生成式 AI 内容交互时通知用户；',
  '(iii) Have a mechanism for End Users to report feedback to GitHub and Developer related to errors, bugs, improper, or undesired outputs; and':
    '(iii) 提供一种机制，供最终用户向 GitHub 和开发人员反馈与错误、缺陷、不当或不期望的输出相关的意见；以及',
  '(iv) Inform End Users the appropriate use cases, best practices, and limitations of the Developer Product.':
    '(iv) 告知最终用户开发人员产品的适当用例、最佳做法和局限性。',
  'Developer shall not by any means repackage or resell Marketplace, a GitHub API, Personal Data, or Usage Data. Developer is not permitted to use a GitHub API or any Personal or Usage Data in any manner that does or could undermine the security of the Service, a GitHub API, Usage Data, or any other data or information stored or transmitted using Marketplace. In addition, Developer shall not (a) interfere with, modify, or disable any features, functionality, or security controls of Marketplace or a GitHub API; (b) circumvent in any fashion any protection mechanisms for Marketplace or a GitHub API; or (c) reverse engineer, decompile, disassemble, or derive the source code, underlying ideas, algorithms, structure, or organizational form from Marketplace or a GitHub API.':
    '开发人员不得以任何方式重新打包或转售市场、GitHub API、个人数据或使用数据。开发人员不得以任何会或可能损害服务、GitHub API、使用数据或通过市场存储或传输的任何其他数据或信息安全的方式，使用 GitHub API 或任何个人数据或使用数据。此外，开发人员不得 (a) 干扰、修改或禁用市场或 GitHub API 的任何特性、功能或安全控制措施；(b) 以任何方式规避市场或 GitHub API 的任何保护机制；或 (c) 对市场或 GitHub API 进行逆向工程、反编译、反汇编，或从中推导出源代码、基本理念、算法、结构或组织形式。',
  'Developer acknowledges that Developer is solely responsible, and that GitHub has no responsibility or liability of any kind, for any aspect of Developer Products. Developer will be solely responsible for:':
    '开发人员确认，开发人员对开发人员产品的各个方面承担全部责任，GitHub 不承担任何形式的责任或义务。开发人员将全权负责：',
  '(i) providing End Users instructions on installing and using its Developer Products;':
    '(i) 向最终用户提供有关安装和使用其开发人员产品的说明；',
  '(ii) creating and displaying information and content on, through or within its Developer Products;':
    '(ii) 在其开发人员产品上、通过其开发人员产品或在其开发人员产品内创建和显示信息与内容；',
  '(iii) ensuring that its Developer Products do not violate or infringe the intellectual property rights of any third party;':
    '(iii) 确保其开发人员产品不违反或侵犯任何第三方的知识产权；',
  '(iv) ensuring that Developer Products are not offensive, profane, obscene, libelous or otherwise illegal;':
    '(iv) 确保开发人员产品不具有冒犯性、亵渎性、淫秽、诽谤性或其他违法性质；',
  '(v) ensuring that its Developer Products do not contain or introduce malicious software into Marketplace, a GitHub API, any Usage Data or other data stored or transmitted using Marketplace; and':
    '(v) 确保其开发人员产品不包含恶意软件，也不将恶意软件引入市场、GitHub API、任何使用数据或通过市场存储或传输的其他数据；以及',
  '(vi) ensuring that its Developer Products are not designed to or utilized for the purpose of sending commercial electronic messages to any GitHub.com users, agents or End Users without their consent.':
    '(vi) 确保其开发人员产品并非为了未经同意向任何 GitHub.com 用户、代理人或最终用户发送商业电子信息而设计或使用。',
  'Developer will respect and comply with the technical and policy-implemented limitations of a GitHub API and the restrictions of this Agreement in designing and implementing Developer Products. Developer shall not violate any explicit rate limitations on calling or otherwise utilizing a GitHub API.':
    '在设计和实现开发人员产品时，开发人员将尊重并遵守 GitHub API 在技术和政策上施加的限制以及本协议的限制。开发人员不得违反对调用或以其他方式使用 GitHub API 设定的任何明确速率限制。',
  "Nothing in this Agreement shall prevent either party from developing and/or publishing applications that are similar or otherwise compete with the other party's applications.":
    '本协议的任何内容均不妨碍任何一方开发和/或发布与另一方应用程序相似或以其他方式与之竞争的应用程序。',

  '4. TAKEDOWNS': '4. 下架',
  'Your Takedowns. Upon providing GitHub with thirty (30) days written notice, you may remove your Listing from future distribution via Marketplace. You must continue to comply with this Agreement for any Listing already distributed through Marketplace, including but not limited to refund requirements. Removing your Listing from future distribution via Marketplace does not (a) affect the license rights of End Users who have previously purchased or installed your Listing or (b) change your obligation to deliver or support a Listing that has been previously purchased or installed by users. If you remove your Listing, GitHub will not disclose your reason for the removal.':
    '由你下架。在提前三十 (30) 天向 GitHub 发出书面通知后，你可以将你的上架项从市场的后续分发中移除。对于已通过市场分发的任何上架项，你必须继续遵守本协议，包括但不限于退款要求。将你的上架项从市场的后续分发中移除不会 (a) 影响此前已购买或安装你的上架项的最终用户的许可权利，也不会 (b) 改变你交付或支持用户此前已购买或安装的上架项的义务。如果你移除上架项，GitHub 不会披露你移除的原因。',
  'GitHub Review and Takedowns. GitHub may review or test your Listing for compliance with this Agreement, GitHub ToS, and any other applicable terms, obligations, laws, or regulations. GitHub retains sole and absolute discretion over what Listings are included on Marketplace. You may be required to provide information about yourself (such as identification or contact details) as part of the registration process for Marketplace, or as part of your continued use of Marketplace. You agree that any information you give to Marketplace will be accurate, correct, and up to date. As part of the specification for your Listing, GitHub may ask that you include in the file for your Listing information such as your name and email address. GitHub may use this information when featuring the Listing in our directory or for other uses.':
    'GitHub 审查与下架。GitHub 可以审查或测试你的上架项是否符合本协议、GitHub ToS 以及任何其他适用的条款、义务、法律或法规。GitHub 对哪些上架项可列入市场保留唯一且绝对的决定权。在市场注册过程中或在你持续使用市场期间，你可能需要提供有关你自己的信息（例如身份证明或联系方式）。你同意你向市场提供的任何信息都是准确、正确且最新的。作为上架项规范的一部分，GitHub 可能会要求你在上架项文件中包含你的姓名和电子邮件地址等信息。GitHub 在我们的目录中推荐该上架项或用于其他用途时，可能会使用这些信息。',
  'If GitHub is notified by you or otherwise becomes aware and determines, in its sole discretion, that a Listing or any portion thereof or your Brand Features:':
    '如果 GitHub 收到你的通知或以其他方式知悉，并自行判定上架项或其任何部分或你的品牌特征：',
  '(i) violates the terms of this Agreement or the ToS;': '(i) 违反本协议或 ToS 的条款；',
  '(ii) the display of the Listing is impacting the integrity of GitHub servers (i.e., users are unable to access such content or otherwise experience difficulty);':
    '(ii) 上架项的展示正在影响 GitHub 服务器的完整性（即用户无法访问此类内容或遇到其他困难）；',
  '(iii) is deemed by GitHub to add undue risk to Marketplace End Users’ data or impair the user experience of Marketplace or GitHub; or':
    '(iii) 被 GitHub 认为会给市场最终用户的数据带来不当风险，或损害市场或 GitHub 的用户体验；或',
  '(iv) is subject to End User complaints in regards to your breach of your EULA,': '(iv) 因你违反 EULA 而遭到最终用户投诉，',
  "GitHub may: suspend the transfer of Personal Data to your Developer Product; prohibit the collection and processing of Personal Data via your Developer Product; remove the Listing from Marketplace; flag, filter, or modify related materials (including but not limited to descriptions, screenshots, or metadata); or reclassify the Listing at its sole discretion. If GitHub takes any of these actions on your Listing, you may appeal GitHub's action through the GitHub Appeal and Reinstatement Process":
    'GitHub 可自行决定：暂停向你的开发人员产品传输个人数据；禁止通过你的开发人员产品收集和处理个人数据；从市场中移除该上架项；标记、过滤或修改相关材料（包括但不限于说明、屏幕截图或元数据）；或对该上架项重新分类。如果 GitHub 对你的上架项采取了上述任何措施，你可以通过 GitHub 申诉和恢复流程对 GitHub 的措施提出申诉',
  "GitHub may: suspend the transfer of Personal Data to your Developer Product; prohibit the collection and processing of Personal Data via your Developer Product; remove the Listing from Marketplace; flag, filter, or modify related materials (including but not limited to descriptions, screenshots, or metadata); or reclassify the Listing at its sole discretion. If GitHub takes any of these actions on your Listing, you may appeal GitHub's action through the":
    'GitHub 可自行决定：暂停向你的开发人员产品传输个人数据；禁止通过你的开发人员产品收集和处理个人数据；从市场中移除该上架项；标记、过滤或修改相关材料（包括但不限于说明、屏幕截图或元数据）；或对该上架项重新分类。如果 GitHub 对你的上架项采取了上述任何措施，你可以就 GitHub 的措施提出申诉，途径为',
  'GitHub Appeal and Reinstatement Process': 'GitHub 申诉和恢复流程',
  'Developer Product Updates. From time to time, GitHub may check for available updates to any Listing, including but not limited to bug fixes or enhanced functionality. If you update your Listing to Marketplace, you agree that such update will be automatically requested, downloaded, and installed without further notice to you. GitHub makes no guarantees regarding the timing of such updates. Updates to a Listing are subject to the same terms and conditions as the Listing.':
    '开发人员产品更新。GitHub 可能会不时检查任何上架项的可用更新，包括但不限于错误修复或功能增强。如果你向市场更新你的上架项，即表示你同意该更新将被自动请求、下载和安装，而不再另行通知你。GitHub 不对此类更新的时间作任何保证。上架项的更新与该上架项适用相同的条款与条件。',
  "End-User Takedowns. If an End-User uses your Developer Product in a way that violates the Terms, then we have the right to suspend or terminate that End-User's access to the Developer Product without any liability to you.":
    '最终用户下架。如果最终用户以违反条款的方式使用你的开发人员产品，我们有权暂停或终止该最终用户对开发人员产品的访问，且无需对你承担任何责任。',

  '5. REPRESENTATIONS, WARRANTIES AND COVENANTS': '5. 陈述、保证与承诺',
  'Developer must inform End Users of the Personal Data that will be transmitted to the Developer Application from the Service and that Developer terms will control the privacy, security, or integrity of such Personal Data. To the extent Developer’s Applications store, process, or transmit Personal Data, neither Developer nor Developer’s Application will, without appropriate prior user consent or except to the extent required by applicable law:':
    '开发人员必须告知最终用户哪些个人数据将从服务传输到开发人员应用程序，并告知此类个人数据的隐私、安全或完整性将受开发人员条款的约束。在开发人员的应用程序存储、处理或传输个人数据的范围内，未经用户事先适当同意，或除非适用法律要求，开发人员及开发人员的应用程序均不得：',
  '(i) modify the content of Personal Data in a manner that adversely affects the integrity of the Personal Data;':
    '(i) 以对个人数据完整性产生不利影响的方式修改个人数据的内容；',
  '(ii) disclose the Personal Data to any third party; or': '(ii) 向任何第三方披露个人数据；或',
  '(iii) use the Personal Data for any purpose other than providing the Developer Application functionality to users of such Developer Application.':
    '(iii) 将个人数据用于向开发人员应用程序的用户提供该应用程序功能以外的任何目的。',
  'Developer shall maintain and handle all Personal Data in accordance with privacy and security measures reasonably adequate to preserve the confidentiality and security of all such Personal Data and all applicable privacy laws and regulations.':
    '开发人员应按照足以合理保护所有此类个人数据机密性和安全性的隐私与安全措施，以及所有适用的隐私法律法规，保存和处理所有个人数据。',
  'Developer agrees that it will comply with the GitHub Data Protection Addendum.': '开发人员同意遵守 GitHub 数据保护附录。',
  'You Support Your Developer Product. Developer will be solely responsible for support and maintenance of your Developer Products and any complaints about your Developer Products. Your support contact information will be displayed in each application detail page and made available to users for customer support purposes. Failure to provide adequate support for your Developer Products may result in reduced product exposure, or in some cases removal from Marketplace or anywhere else on GitHub.com where previously purchased or downloaded Developer Products are stored on behalf of users.':
    '由你支持你的开发人员产品。开发人员将全权负责你的开发人员产品的支持和维护，以及有关你的开发人员产品的任何投诉。你的支持联系信息将显示在每个应用程序详情页上，并提供给用户用于客户支持。未能为你的开发人员产品提供充分支持可能导致产品曝光度降低，或在某些情况下被从市场或 GitHub.com 上代用户存储此前购买或下载的开发人员产品的任何其他位置移除。',
  'Developer represents and warrants that: (i) its Developer Products and Developer Brand Features do not and will not violate, misappropriate, or infringe upon the intellectual property rights of any third party; (ii) Developer will comply with all applicable laws and regulations, including this Agreement and GitHub’s Terms of Service, and maintain all permissions necessary to develop, implement, and distribute its Developer Products; (iii) its Developer Products do not and will not contain or introduce any malicious software; (iv) its Developer Products are not designed to or utilized for the purpose of sending commercial electronic messages to any GitHub customers, agents, or End Users without their consent; (v) Developer has all right, power and authority to grant the licenses granted to GitHub and End Users herein; and (vi) any images and text that are used to market the Developer Products or that Developer has uploaded to Marketplace are truthful, accurate, and not intended to mislead or confuse the End User.':
    '开发人员声明并保证：(i) 其开发人员产品和开发人员品牌特征现在和将来均不会违反、盗用或侵犯任何第三方的知识产权；(ii) 开发人员将遵守所有适用的法律法规，包括本协议和 GitHub 服务条款，并保有开发、实现和分发其开发人员产品所需的全部许可；(iii) 其开发人员产品现在和将来均不包含或引入任何恶意软件；(iv) 其开发人员产品并非为了未经同意向任何 GitHub 客户、代理人或最终用户发送商业电子信息而设计或使用；(v) 开发人员拥有授予本协议中向 GitHub 和最终用户授予的许可的全部权利、权力和权限；以及 (vi) 用于推广开发人员产品或开发人员已上传到市场的任何图像和文字均真实、准确，且无意误导或混淆最终用户。',
  'Disclaimer of Warranties. All aspects of Marketplace and GitHub API, including all server and network components, are provided on an “as is” and “as available” basis, without any warranties of any kind. GitHub expressly disclaims any and all warranties to the fullest extent permitted by law, whether express or implied, including, but not limited to, any implied warranties of merchantability, title, fitness for a particular purpose, and non-infringement. Developer acknowledges that GitHub does not warrant that Marketplace or a GitHub API will be uninterrupted, timely, secure, error-free, or free from viruses, malware, or worms (otherwise known as computer code or other technology specifically designed to disrupt, disable, or harm your software, hardware, computer system, or network), and no information or advice obtained by developer from GitHub or through Marketplace or a GitHub API shall create any warranty not expressly stated in these terms. GitHub is not responsible for, and specifically disclaims any liability for, any unauthorized use of Developer Products outside Marketplace.':
    '免责声明。市场和 GitHub API 的所有方面（包括所有服务器和网络组件）均按“原样”和“现有”基础提供，不附带任何形式的保证。在法律允许的最大范围内，GitHub 明确否认任何及所有明示或默示的保证，包括但不限于对适销性、所有权、特定用途适用性和不侵权的任何默示保证。开发人员确认，GitHub 不保证市场或 GitHub API 不会中断、及时、安全、无错误，或不含病毒、恶意软件或蠕虫（亦即专门用于破坏、禁用或损害你的软件、硬件、计算机系统或网络的计算机代码或其他技术），且开发人员从 GitHub 或通过市场或 GitHub API 获得的任何信息或建议，均不构成这些条款中未明确规定的任何保证。GitHub 不对在市场以外未经授权使用开发人员产品的行为负责，并明确否认对此承担任何责任。',

  '6. PAID APPLICATIONS OR PRODUCTS': '6. 付费应用程序或产品',
  'GitHub will be the merchant of record for Developer Products purchased by End Users via Marketplace.':
    '对于最终用户通过市场购买的开发人员产品，GitHub 将作为记录商户。',
  'Registration. Developer will be required to provide information about yourself (such as identification or contact details) as part of the registration process for Marketplace, or as part of your continued use of Marketplace including, but not limited to: (i) name, (ii) address, (iii) telephone number, (iv) e-mail address, and (v) payment account details. GitHub may publicize Developer’s information on Marketplace and retain Developer’s registration information as required by applicable law.':
    '注册。在市场注册过程中或在你持续使用市场期间，开发人员需要提供有关你自己的信息（例如身份证明或联系方式），包括但不限于：(i) 姓名、(ii) 地址、(iii) 电话号码、(iv) 电子邮件地址，以及 (v) 付款帐户详细信息。GitHub 可以在市场上公开开发人员的信息，并按适用法律的要求保留开发人员的注册信息。',
  'Pricing. Prices for Listings of Developer Applications will be set in US Dollars (USD). Developer has complete control over setting pricing for each Listing. The prices you set for Developer Products will determine the amount of payment you will receive. GitHub will remit 95% of the sale price in USD without reduction for Taxes except for any withholding taxes that are required under applicable law. The remaining 5% of the sales price will be allotted to and retained by GitHub. At the end of each month and upon reaching a minimum value of $500 USD, GitHub will remit your share of payments.':
    '定价。开发人员应用程序上架项的价格将以美元 (USD) 设定。开发人员可完全自主地为每个上架项定价。你为开发人员产品设定的价格将决定你将收到的付款金额。GitHub 将以美元汇付销售价格的 95%，不扣除税费，但适用法律要求的任何预扣税除外。销售价格的其余 5% 将分配给 GitHub 并由其保留。在每月月底且金额达到最低 500 美元时，GitHub 将汇付你应得的款项份额。',
  'Refunds. You will be responsible for specifying the terms and conditions regarding refunds to your End Users. In no event shall GitHub be responsible for providing any support for refunds, nor shall GitHub be liable for payment of any refund.':
    '退款。你将负责向你的最终用户说明有关退款的条款与条件。在任何情况下，GitHub 均不负责为退款提供任何支持，也不负责支付任何退款。',

  '7. OWNERSHIP': '7. 所有权',
  'Subject to the limited licenses expressly provided in this Agreement, nothing in this Agreement transfers or assigns to a party any of the other party’s intellectual property rights in its Brand Features or other technology, and nothing in this Agreement transfers or assigns a party any of the other party’s intellectual property rights.':
    '除本协议明确规定的有限许可外，本协议的任何内容均不会将另一方在其品牌特征或其他技术中的任何知识产权转让或让与给一方，本协议的任何内容也不会将另一方的任何知识产权转让或让与给一方。',

  '8. LIMITATION OF LIABILITY': '8. 责任限制',
  'Under no circumstances and under no legal theory (whether in contract, tort, negligence or otherwise) will GitHub, or its affiliates, officers, directors, employees, agents, or suppliers be liable to developer or any third party under this agreement for any indirect, incidental, special, exemplary, consequential, punitive or other similar damages, including lost profits, lost sales or business, lost data, business interruption or any other loss incurred by Developer or any third party in connection with this Agreement, regardless of whether Developer has been advised of the possibility of or could have foreseen such damages notwithstanding anything to the contrary in this Agreement, GitHub’s aggregate liability to Developer or any third party arising out of this Agreement shall not exceed $500 (five hundred) USD.':
    '在任何情况下，无论依据何种法律理论（无论是合同、侵权、过失或其他），GitHub 或其关联公司、高级职员、董事、员工、代理人或供应商均不会就本协议项下的任何间接、附带、特殊、惩戒性、后果性、惩罚性或其他类似损害，对开发人员或任何第三方承担责任，包括开发人员或任何第三方因本协议而遭受的利润损失、销售或业务损失、数据丢失、业务中断或任何其他损失，无论开发人员是否已被告知或本可预见此类损害的可能性；尽管本协议中有任何相反规定，GitHub 因本协议而对开发人员或任何第三方承担的累计责任不超过 500（五百）美元。',

  '9. INDEMNIFICATION': '9. 赔偿',
  'To the maximum extent permitted by applicable law, Developer agrees to defend, indemnify and hold harmless GitHub, its affiliates and their respective directors, officers, employees and agents from and against any and all claims, actions, suits or proceedings, as well as any losses, liabilities, damages, costs and expenses (including reasonable attorneys’ fees) arising from or relating to (a) Developer’s use of Marketplace in violation of this Agreement, the Terms or any applicable laws or regulations; (b) Developer’s Products that infringe any copyright, trademark, trade secret, patent or other intellectual property right of any third party; (c) any loss or disclosure of data or Personal Data by Developer Products; and (d) Developer’s EULA (or ToS).':
    '在适用法律允许的最大范围内，对于因以下各项引起或与之相关的任何及所有索赔、诉讼、起诉或程序，以及任何损失、责任、损害、成本和费用（包括合理的律师费），开发人员同意为 GitHub、其关联公司及其各自的董事、高级职员、员工和代理人进行抗辩、作出赔偿并使其免受损害：(a) 开发人员违反本协议、条款或任何适用法律法规使用市场；(b) 开发人员的产品侵犯任何第三方的任何版权、商标、商业秘密、专利或其他知识产权；(c) 开发人员产品造成的任何数据或个人数据丢失或泄露；以及 (d) 开发人员的 EULA（或 ToS）。',

  '10. TERMINATION': '10. 终止',
  'This Agreement will continue to apply until terminated by either party as set forth below.':
    '本协议将持续适用，直至任何一方按下文规定终止本协议。',
  'Either party may terminate this Agreement for any reason upon thirty (30) days written notice. During the 30 day period, the terms in effect at the time of the notice of termination shall govern.':
    '任何一方均可出于任何理由，提前三十 (30) 天发出书面通知终止本协议。在这 30 天内，以发出终止通知时有效的条款为准。',
  'GitHub may terminate this Agreement at any time if (a) you have breached any provision of this Agreement or (b) GitHub is required to do so by law.':
    '如果 (a) 你违反了本协议的任何条款，或 (b) 法律要求 GitHub 这样做，GitHub 可以随时终止本协议。',
  'Effects of Termination by Developer. Upon receiving thirty (30) days’ advanced written notice of termination from Developer, Developer will be disabled from taking on new customers via Marketplace. Any outstanding fees shall be remitted upon termination and removal of the Developer Product from Marketplace. If termination is initiated as a result of a GitHub modification to these terms (Section 11), the terms in effect immediately prior to such modification shall govern the duration of the 30-day notice period.':
    '开发人员终止的效力。在收到开发人员提前三十 (30) 天发出的书面终止通知后，开发人员将无法再通过市场获取新客户。任何未结费用应在终止并将开发人员产品从市场移除后汇付。如果终止是因 GitHub 修改这些条款（第 11 条）而发起的，则在 30 天通知期内，以紧接该修改之前有效的条款为准。',
  'The obligations in Sections 2, 3, 4, 5, 8, 9, 12-18, and Data Protection Addendum will survive any expiration or termination of this Agreement.':
    '第 2、3、4、5、8、9、12-18 条及数据保护附录中的义务在本协议到期或终止后继续有效。',

  '11. MODIFICATION': '11. 修改',
  'Developer acknowledges and agrees that GitHub may modify this Agreement, Marketplace Terms of Service, a GitHub API, the General API Policies, GitHub Privacy Statement, the GitHub Developer Program Terms of Service, and the GitHub.com ToS from time to time (a “Modification”). All Modifications shall be communicated through Marketplace, the GitHub website at www.GitHub.com or through a form of direct communication from GitHub to Developer. Developer further acknowledges and agrees that such Modifications may be implemented at any time and without any notice to Developer. Developer shall, within thirty (30) days from the date of first notice of any Modification(s) (or such shorter period of time specified in the notice of the Modification(s)) (the “Conformance Period”) comply with such modification(s) by implementing and using the most current version of a GitHub API in the most current version of the Developer Products and making any changes to Developer Products that may be required as a result of such Modification(s). Developer acknowledges that a Modification may have an adverse effect on Developer Products, including but not limited to changing the manner in which applications communicate with a GitHub API. GitHub shall have no liability of any kind to Developer or any End User with respect to such Modifications or any adverse effects resulting from such Modifications. Developer’s continued access to or use of Marketplace or a GitHub API following the Conformance Period shall constitute binding acceptance of the Modification(s).':
    '开发人员确认并同意，GitHub 可能会不时修改本协议、市场服务条款、GitHub API、通用 API 政策、GitHub 隐私声明、GitHub 开发人员计划服务条款以及 GitHub.com ToS（“修改”）。所有修改均将通过市场、GitHub 网站 www.GitHub.com 或 GitHub 与开发人员的某种直接沟通形式告知。开发人员进一步确认并同意，此类修改可随时实施，且无需事先通知开发人员。开发人员应在首次通知任何修改之日起三十 (30) 天内（或修改通知中指定的更短期限内）（“合规期”）遵守此类修改，方法是在开发人员产品的最新版本中实现并使用最新版本的 GitHub API，并对开发人员产品进行因此类修改而可能需要的任何更改。开发人员确认，修改可能会对开发人员产品产生不利影响，包括但不限于改变应用程序与 GitHub API 的通信方式。对于此类修改或此类修改造成的任何不利影响，GitHub 对开发人员或任何最终用户不承担任何形式的责任。开发人员在合规期结束后继续访问或使用市场或 GitHub API，即构成对修改具有约束力的接受。',

  '12. ASSIGNMENT; ENTIRE AGREEMENT; REVISIONS': '12. 转让；完整协议；修订',
  'Developer may not, directly or indirectly, by operation of law or otherwise, assign all or any part of this Agreement or Developer’s rights under this Agreement or delegate performance of Developer’s duties under this Agreement without GitHub’s prior written consent. The rights granted in this Agreement may be assigned or transferred by GitHub without Developer’s prior approval. In addition, GitHub may delegate its responsibilities or obligations under this Agreement without Developer’s consent.':
    '未经 GitHub 事先书面同意，开发人员不得通过法律的施行或其他方式，直接或间接地转让本协议的全部或任何部分或开发人员在本协议项下的权利，也不得委托他人履行开发人员在本协议项下的职责。GitHub 可以在未经开发人员事先批准的情况下转让或转移本协议授予的权利。此外，GitHub 可以在未经开发人员同意的情况下委托他人履行其在本协议项下的责任或义务。',
  'This Agreement, together with the ToS, constitute the entire agreement between the parties with respect to the subject matter of this Agreement. GitHub’s failure to enforce at any time any provision of this Agreement does not constitute a waiver of that provision or of any other provision of this Agreement.':
    '本协议连同 ToS 构成双方就本协议标的达成的完整协议。GitHub 在任何时候未执行本协议的任何条款，均不构成对该条款或本协议任何其他条款的放弃。',

  '13. SEVERABILITY': '13. 可分割性',
  'If any part of this Agreement is held to be unenforceable, the rest of the Agreement will remain in full force and effect.':
    '如果本协议的任何部分被认定为不可执行，本协议的其余部分仍将完全有效。',

  '14. RELATIONSHIP OF THE PARTIES': '14. 双方关系',
  'The parties are independent contractors. This Agreement does not create a partnership, franchise, joint venture, agency, fiduciary or employment relationship among the parties. Developer agrees that each member of the group of companies to which GitHub belongs shall be a third party beneficiary to this Agreement and that such other companies shall be entitled to directly enforce, and rely upon, any provision of this Agreement that confers a benefit or grants a right in favor or GitHub. No other person, company or legal entity shall be a third party beneficiary to the Agreement.':
    '双方均为独立承包方。本协议不在双方之间建立合伙、特许经营、合资、代理、信托或雇佣关系。开发人员同意，GitHub 所属公司集团的每个成员均为本协议的第三方受益人，且此类其他公司有权直接执行和依赖本协议中向 GitHub 赋予利益或授予权利的任何条款。任何其他个人、公司或法律实体均不是本协议的第三方受益人。',

  '15. NOTICE': '15. 通知',

  '16. GOVERNING LAW': '16. 适用法律',
  'This Agreement will be governed by and construed in accordance with the laws of the State of California and federal laws of the United States. Any legal action or proceeding will be brought exclusively in the federal or state courts located in the Northern District of California. The parties consent to personal jurisdiction and venue there.':
    '本协议受加利福尼亚州法律和美国联邦法律管辖，并据其解释。任何法律诉讼或程序均只能在位于加利福尼亚州北区的联邦或州法院提起。双方同意接受该地的属人管辖并以该地为审判地。',

  '17. EXPORT RESTRICTIONS': '17. 出口限制',
  'Developer Products distributed via Marketplace may be subject to export controls or restrictions by the United States or other countries or territories. Developer agrees to comply with all applicable US and international export laws and regulations. These laws may include restrictions on destinations, content and/or End Users.':
    '通过市场分发的开发人员产品可能受美国或其他国家/地区的出口管制或限制。开发人员同意遵守所有适用的美国和国际出口法律法规。这些法律可能包括对目的地、内容和/或最终用户的限制。',

  '18. USAGE DATA': '18. 使用数据',
  'In order to operate and improve Marketplace, GitHub may collect Usage Data from Marketplace or a GitHub API or anywhere previously purchased or downloaded Developer Products are stored on behalf of End Users by GitHub. The Usage Data will be maintained in accordance with GitHub’s then in effect Privacy Statement. Limited Usage Data may be available for use by Developer in GitHub’s sole discretion.':
    '为运营和改进市场，GitHub 可以从市场、GitHub API 或 GitHub 代最终用户存储此前购买或下载的开发人员产品的任何位置收集使用数据。使用数据将按照 GitHub 当时有效的隐私声明进行保存。GitHub 可自行决定向开发人员提供有限的使用数据。',
  '19. PRE-RELEASE ACCESS': '19. 预发布访问',
  'If you have a Listing on a portion of Marketplace that is in a beta or similar pre-release status, your use of that portion is governed by GitHub’s Pre-release License Terms.':
    '如果你在市场中处于 Beta 版或类似预发布状态的部分拥有上架项，你对该部分的使用受 GitHub 的预发布许可条款约束。',
  'Pre-release License Terms': '预发布许可条款',

  'Addendum 1: Data Protection Addendum': '附录 1：数据保护附录',
  'This Data Protection Addendum (this “Addendum”) is attached to and made a part of the GitHub Marketplace Developer Agreement between you and GitHub (the “Agreement”). Terms not defined in this Addendum have the meanings ascribed to them in the Agreement. In the event of a conflict or inconsistency, the terms of this Addendum will supersede those of the Agreement.':
    '本数据保护附录（“本附录”）附于你与 GitHub 之间的 GitHub 市场开发人员协议（“协议”）之后，并构成其一部分。本附录中未定义的术语具有协议赋予的含义。如有冲突或不一致，以本附录的条款为准。',

  'A1-1. Purpose and Scope': 'A1-1. 目的与范围',
  'GitHub maintains Personal Data from individuals all over the world, some of whom are residents of countries and areas with strong data protection laws. This Addendum establishes your responsibilities when you receive and process any such Personal Data from GitHub.':
    'GitHub 保存着来自世界各地个人的个人数据，其中一些人是数据保护法律严格的国家和地区的居民。本附录规定了你从 GitHub 接收和处理任何此类个人数据时的责任。',

  'A1-2. Definitions': 'A1-2. 定义',
  '(a) “Applicable Data Protection Laws” means any laws, regulations, regulatory frameworks, or other legislations relating to the processing and use of Personal Data, as applicable to the Agreement, including:':
    '(a) “适用的数据保护法律”指适用于协议的、与个人数据处理和使用相关的任何法律、法规、监管框架或其他立法，包括：',
  'The EU General Data Protection Regulation 2016/679 (“GDPR”), along with any implementing or corresponding equivalent national laws or regulations;':
    '欧盟《通用数据保护条例》2016/679（“GDPR”），以及任何实施性或相应的同等国家法律或法规；',
  'The California Consumer Privacy Act of 2018, Cal. Civ. Code §§1798.100 et seq. ("CCPA"); and':
    '2018 年《加利福尼亚州消费者隐私法》，《加利福尼亚州民法典》第 1798.100 条及以下各条（“CCPA”）；以及',
  'The UK Data Protection Act 2018 and implementation of GDPR contained therein.': '英国《2018 年数据保护法》及其中所含的 GDPR 实施规定。',
  '(b) “Personal Data” means any information which relates to an individual GitHub End User, customer or employee which could, alone or together with other information, identify them, whether supplied by GitHub for processing by the Developer or whether generated by the Developer in the course of performing its obligations under this Agreement.':
    '(b) “个人数据”指与 GitHub 的个人最终用户、客户或员工相关、单独或与其他信息结合即可识别其身份的任何信息，无论该信息是由 GitHub 提供给开发人员处理，还是由开发人员在履行本协议项下义务的过程中生成。',
  '(c) “Processing” means any operation or set of operations performed on Personal Data, whether by manual or automatic means, including collection, recording, organization, storage, adaptation, alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, blocking, erasure, or destruction.':
    '(c) “处理”指以人工或自动方式对个人数据执行的任何操作或一系列操作，包括收集、记录、组织、存储、改编、更改、检索、查阅、使用、通过传输进行披露、传播或以其他方式提供、封锁、删除或销毁。',

  'A1-3. Compliance with Data Transfer Laws': 'A1-3. 遵守数据传输法律',
  '(a) GitHub Compliance. GitHub complies with Applicable Data Protection Laws. GitHub relies on Standard Contractual Clauses ("SCCs") for all transfers out of the European Union, European Economic Area, United Kingdom, and Switzerland to provide its services. GitHub also complies with the EU-U.S. Data Privacy Framework (EU-U.S. DPF), the UK Extension to the EU-U.S. DPF, and the Swiss-U.S. Data Privacy Framework (Swiss-U.S. DPF) as set forth by the U.S. Department of Commerce. GitHub has certified to the U.S. Department of Commerce that it adheres to the EU-U.S. Data Privacy Framework Principles (EU-U.S. DPF Principles) with regard to the processing of Personal Data received from the European Union in reliance on the EU-U.S. DPF and from the United Kingdom (and Gibraltar) in reliance on the UK Extension to the EU-U.S. DPF. GitHub has certified to the U.S. Department of Commerce that it adheres to the Swiss-U.S. Data Privacy Framework Principles (Swiss-U.S. DPF Principles) with regard to the processing of Personal Data received from Switzerland in reliance on the Swiss-U.S. DPF.':
    '(a) GitHub 的合规。GitHub 遵守适用的数据保护法律。为提供服务，GitHub 在所有自欧盟、欧洲经济区、英国和瑞士向外传输数据的情况下均依赖标准合同条款（“SCC”）。GitHub 还遵守美国商务部制定的欧盟-美国数据隐私框架（EU-U.S. DPF）、欧盟-美国 DPF 的英国扩展以及瑞士-美国数据隐私框架（Swiss-U.S. DPF）。GitHub 已向美国商务部证明，对于依据欧盟-美国 DPF 从欧盟接收的个人数据，以及依据欧盟-美国 DPF 的英国扩展从英国（及直布罗陀）接收的个人数据，其处理遵守欧盟-美国数据隐私框架原则（EU-U.S. DPF 原则）。GitHub 已向美国商务部证明，对于依据瑞士-美国 DPF 从瑞士接收的个人数据，其处理遵守瑞士-美国数据隐私框架原则（Swiss-U.S. DPF 原则）。',
  '(b) Developer Compliance. Developer represents and warrants that it will (i) comply with Applicable Data Protection Laws; and (ii) abide by the requirements of European Economic Area and Swiss data protection laws regarding the collection, use, transfer, retention, and other processing of Personal Data from the European Economic Area, United Kingdom, and Switzerland. All transfers of Personal Data to a third country or an international organization will be subject to appropriate safeguards as described in Article 46 of the GDPR and such transfers and safeguards will be documented according to Article 30(2) of the GDPR.':
    '(b) 开发人员的合规。开发人员声明并保证其将 (i) 遵守适用的数据保护法律；以及 (ii) 遵守欧洲经济区和瑞士数据保护法律中有关收集、使用、传输、保留和以其他方式处理来自欧洲经济区、英国和瑞士的个人数据的要求。向第三国或国际组织传输个人数据均须采取 GDPR 第 46 条所述的适当保障措施，且此类传输和保障措施将按照 GDPR 第 30(2) 条进行记录。',

  'A1-4. Data Protection': 'A1-4. 数据保护',
  '(a) Notice. Developer must provide End Users their privacy policy which identifies itself as responsible for the collection, processing, privacy, security, and integrity of all data it collects from the End User. Developer must not hold itself out as collecting any Personal Data on GitHub’s behalf. Developer’s privacy policy must provide End User’s all legally required information regarding access, collection, storage, and processing purpose of Personal Data, with whom the Personal Data is shared, and in which country or countries the Personal Data will be stored.':
    '(a) 告知。开发人员必须向最终用户提供其隐私政策，在其中表明开发人员对其从最终用户处收集的所有数据的收集、处理、隐私、安全和完整性负责。开发人员不得自称代表 GitHub 收集任何个人数据。开发人员的隐私政策必须向最终用户提供法律要求的所有信息，包括个人数据的访问、收集、存储和处理目的，与谁共享个人数据，以及个人数据将存储在哪个或哪些国家/地区。',
  '(b) Purpose Limitation.': '(b) 目的限制。',
  '(i) GitHub will provide Developer with Personal Data elements for the purpose of establishing and facilitating a relationship between the Developer and the End User, and permitting Developer to provide services to the End User. Developer must limit its usage of the Personal Data to that purpose, unless the End User agrees to allow different uses.':
    '(i) GitHub 将向开发人员提供个人数据元素，目的是建立和促进开发人员与最终用户之间的关系，并允许开发人员向最终用户提供服务。除非最终用户同意允许其他用途，开发人员必须将个人数据的使用限于该目的。',
  '(ii) Developer must process and communicate the Personal Data to third parties only for the limited and specific purposes of providing its services to the End User as described in its agreement with the End User, unless the End User agrees to allow different uses.':
    '(ii) 除非最终用户同意允许其他用途，开发人员只能出于按其与最终用户之间的协议向最终用户提供服务这一有限且特定的目的，处理个人数据并将其传达给第三方。',
  '(c) Data Quality and Proportionality. Developer must keep the Personal Data accurate and up to date. Developer must only collect Personal Data appropriate and necessary to provide the service.':
    '(c) 数据质量与相称性。开发人员必须确保个人数据准确并保持最新。开发人员只能收集提供服务所适当且必需的个人数据。',
  '(d) Security. Developer must take all reasonable security measures appropriate to the risks, such as against accidental or unlawful destruction, or accidental loss, alteration, unauthorized disclosure or access, presented by processing the Personal Data.':
    '(d) 安全。开发人员必须针对处理个人数据所带来的风险（例如意外或非法销毁，或意外丢失、更改、未经授权的披露或访问）采取与之相称的一切合理安全措施。',
  '(e) Data Retention and Deletion. Upon GitHub’s reasonable request, unless prohibited by law, Developer must return or destroy all Personal Data and related data at all locations where it is stored after it is no longer needed for the limited and specified purposes for which it was collected.':
    '(e) 数据保留与删除。当所有个人数据及相关数据对于其被收集时的有限且特定的目的不再需要后，应 GitHub 的合理要求，除非法律禁止，开发人员必须在其存储的所有位置返还或销毁这些数据。',
  '(f) Subprocessing and Onward Transfer. Developer is liable for onward transfers of Personal Data to its subprocessors. In the event that Developer must transfer the Personal Data to a third party, or Developer installs, uses, or enables third party services to process the Personal Data on Developer’s behalf, Developer must ensure that the third party will provide at least the same level of privacy protection as is required herein.':
    '(f) 再处理与转移传输。开发人员对向其子处理者转移传输个人数据承担责任。如果开发人员必须将个人数据传输给第三方，或开发人员安装、使用或启用第三方服务代表开发人员处理个人数据，开发人员必须确保该第三方提供的隐私保护水平至少达到本协议的要求。',

  'A1-5. Use of Personal Data': 'A1-5. 个人数据的使用',
  '(a) Permitted Use. Developer may process the Personal Data only for the purposes set out in Section 4(b)(i), and no other purpose.':
    '(a) 允许的用途。开发人员只能出于第 4(b)(i) 条规定的目的处理个人数据，不得用于任何其他目的。',
  '(b) No Use in Marketing. Developer must not use the Personal Data for the purposes of advertising any third party goods or services, and may not sell the Personal Data to any third party.':
    '(b) 不得用于营销。开发人员不得将个人数据用于宣传任何第三方商品或服务，也不得将个人数据出售给任何第三方。',
  '(c) Automated Decisions. In the event that the Developer makes automated decisions affecting End User’s rights, including employment, legal, credit, or health, the Developer must provide notice to the End User.':
    '(c) 自动化决策。如果开发人员作出影响最终用户权利（包括就业、法律、信用或健康方面）的自动化决策，开发人员必须通知最终用户。',

  'A1-6. Compliance': 'A1-6. 合规',
  'Developer will make its Privacy Statement, Privacy Policy, Privacy Notice, or any similar documentation available to GitHub and End User. Developer will also provide notice of any relevant compliance reports.':
    '开发人员将向 GitHub 和最终用户提供其隐私声明、隐私政策、隐私通知或任何类似文档。开发人员还将告知任何相关的合规报告。',

  'A1-7. Termination': 'A1-7. 终止',
  '(a) Takedown. In the event that Developer is in breach of its obligations to maintain an adequate level of privacy protection, GitHub may take action in accordance with Section 4 (Takedowns) or Section 10 (Termination).':
    '(a) 下架。如果开发人员违反其维持充分隐私保护水平的义务，GitHub 可以依据第 4 条（下架）或第 10 条（终止）采取措施。',
  '(b) Termination. GitHub may terminate this Agreement without prejudice to any other claims at law or in equity in the event that:':
    '(b) 终止。在以下情况下，GitHub 可以终止本协议，且不影响其依据法律或衡平法提出的任何其他主张：',
  '(i) the Developer notifies GitHub that it can no longer meet its privacy obligations, including loss of Developer Privacy Shield certification;':
    '(i) 开发人员通知 GitHub 其无法再履行隐私义务，包括开发人员失去隐私盾认证；',
  '(ii) the transfer, collection, or processing of Personal Data has been temporarily suspended for longer than one month pursuant to 7(a);':
    '(ii) 依据第 7(a) 条，个人数据的传输、收集或处理已被暂停一个月以上；',
  '(iii) the Developer is in substantial or persistent breach of any warranties or representations under this Data Protection Addendum;':
    '(iii) 开发人员严重或持续违反本数据保护附录项下的任何保证或声明；',
  '(iv) the Developer is no longer carrying on business, is dissolved, enters receivership, or a winding up order is made on behalf of Developer.':
    '(iv) 开发人员不再经营业务、解散、进入破产管理程序，或针对开发人员作出清盘令。',
  '(c) Notification. In the event that Developer determines that it can no longer meet its privacy obligations under this Agreement, it must notify GitHub immediately.':
    '(c) 通知。如果开发人员确定其无法再履行本协议项下的隐私义务，必须立即通知 GitHub。',
  'In the event that Developer was certified under Privacy Shield and allows that certification to lapse or otherwise cannot remain certified under Privacy Shield, Developer must notify GitHub immediately.':
    '如果开发人员曾获得隐私盾认证，但任由该认证失效或因其他原因无法继续保持隐私盾认证，开发人员必须立即通知 GitHub。',
  '(d) Upon Termination, Developer must:': '(d) 终止后，开发人员必须：',
  '(i) take reasonable and appropriate steps to stop processing of Personal Data;': '(i) 采取合理且适当的措施停止处理个人数据；',
  '(ii) within thirty days of Termination, delete any Personal Data Developer stores on GitHub’s behalf; and':
    '(ii) 在终止后三十天内，删除开发人员代表 GitHub 存储的任何个人数据；以及',
  '(iii) provide GitHub with reasonable assurance that Developer has stopped processing the Personal Data and deleted stored Personal Data.':
    '(iii) 向 GitHub 提供合理保证，表明开发人员已停止处理个人数据并已删除所存储的个人数据。',

  'A1-8. Liability for Data Processing': 'A1-8. 数据处理责任',
  'Direct Liability. Developer will be liable to GitHub for actual damages caused by any breach of this Addendum subject to the terms in Section 8, Limitation on Liability.':
    '直接责任。在遵守第 8 条“责任限制”中条款的前提下，开发人员将就任何违反本附录的行为所造成的实际损害对 GitHub 承担责任。',
  'Notices to GitHub may be submitted via email to': '向 GitHub 发出的通知可通过电子邮件发送至',
  '. If Customer wishes to formally service notice on GitHub, it must be made through GitHub’s registered agent: GitHub, Inc. c/o Corporation Service Company 2710 Gateway Oaks Drive, Suite 150N Sacramento, CA 95833-3505. Notices must be in writing and will be treated as delivered on the date received at the address, date shown on the return receipt, email transmission date, or date on the courier confirmation of delivery. All notices to be provided by GitHub to Developer under this Agreement may be delivered in writing (i) by nationally recognized overnight delivery service (“Courier”) or U.S. mail to the contact mailing address provided by Developer to GitHub; or (ii) electronic mail to the electronic mail address provided by Developer.':
    '。如果客户希望正式向 GitHub 送达通知，必须通过 GitHub 的注册代理人送达：由 Corporation Service Company 转交 GitHub, Inc.，地址为美国加利福尼亚州萨克拉门托市 Gateway Oaks Drive 2710 号 150N 室，邮编 95833-3505。通知必须采用书面形式，并将视为在以下日期送达：在该地址收到通知的日期、回执上显示的日期、电子邮件发送日期或快递送达确认上的日期。GitHub 根据本协议向开发人员发出的所有通知均可采用书面形式，通过以下方式送达：(i) 通过全国认可的隔夜快递服务（“快递”）或美国邮政，寄往开发人员向 GitHub 提供的联系邮寄地址；或 (ii) 通过电子邮件，发送至开发人员提供的电子邮件地址。',
  'Purpose and Scope. GitHub maintains Personal Data from individuals all over the world, some of whom are residents of countries and areas with strong data protection laws. This Addendum establishes your responsibilities when you receive and process any such Personal Data from GitHub.':
    '目的与范围。GitHub 保存着来自世界各地个人的个人数据，其中一些人是数据保护法律严格的国家和地区的居民。本附录规定了你从 GitHub 接收和处理任何此类个人数据时的责任。',

  // 弹窗 v2.4 与上面收录版本措辞不同的段落（实页核对：连字符、冠词、合并段落、原文笔误 End ser）
  '“Usage Data” means Marketplace-related data generated in connection with End User use of GitHub Marketplace and licensure of Developer Products, including but not limited to usage statistics and aggregated sales data. Usage Data does not include, and specifically excludes, banking and payment information.':
    '“使用数据”指因最终用户使用 GitHub 市场及取得开发人员产品许可而产生的市场相关数据，包括但不限于使用情况统计和汇总销售数据。使用数据不包括且明确排除银行和付款信息。',
  'GitHub may suspend the transfer of Personal Data to your Developer Product; prohibit the collection and processing of Personal Data via your Developer Product; remove the Listing from Marketplace; flag, filter, or modify related materials (including but not limited to descriptions, screenshots, or metadata); or reclassify the Listing at its sole discretion. If GitHub takes any of these actions on your Listing, you may appeal GitHub’s action through the GitHub Appeal and Reinstatement Process.':
    'GitHub 可自行决定：暂停向你的开发人员产品传输个人数据；禁止通过你的开发人员产品收集和处理个人数据；从市场中移除该上架项；标记、过滤或修改相关材料（包括但不限于说明、屏幕截图或元数据）；或对该上架项重新分类。如果 GitHub 对你的上架项采取了上述任何措施，你可以通过 GitHub 申诉和恢复流程对 GitHub 的措施提出申诉。',
  'To the maximum extent permitted by applicable law, Developer agrees to defend, indemnify and hold harmless GitHub, its affiliates and their respective directors, officers, employees and agents from and against any and all claims, actions, suits or proceedings, as well as any losses, liabilities, damages, costs and expenses (including reasonable attorneys’ fees) arising from or relating to (a) Developer’s use of the Marketplace in violation of this Agreement, the Terms or any applicable laws or regulations; (b) Developer’s Products that infringe any copyright, trademark, trade secret, patent or other intellectual property right of any third party; (c) any loss or disclosure of data or Personal Data by Developer Products; and (d) Developer’s EULA (or ToS).':
    '在适用法律允许的最大范围内，对于因以下各项引起或与之相关的任何及所有索赔、诉讼、起诉或程序，以及任何损失、责任、损害、成本和费用（包括合理的律师费），开发人员同意为 GitHub、其关联公司及其各自的董事、高级职员、员工和代理人进行抗辩、作出赔偿并使其免受损害：(a) 开发人员违反本协议、条款或任何适用法律法规使用市场；(b) 开发人员的产品侵犯任何第三方的任何版权、商标、商业秘密、专利或其他知识产权；(c) 开发人员产品造成的任何数据或个人数据丢失或泄露；以及 (d) 开发人员的 EULA（或 ToS）。',
  // 修改条款：网址 www.GitHub.com 是链接，前后两段分开收录
  'Developer acknowledges and agrees that GitHub may modify this Agreement, Marketplace Terms of Service, the GitHub API, the General API Policies, GitHub Privacy Statement, the GitHub Developer Program Terms of Service, and the GitHub.com ToS from time to time (a “Modification”). All Modifications shall be communicated through Marketplace, the GitHub website at':
    '开发人员确认并同意，GitHub 可能会不时修改本协议、市场服务条款、GitHub API、通用 API 政策、GitHub 隐私声明、GitHub 开发人员计划服务条款以及 GitHub.com ToS（“修改”）。所有修改均将通过市场、GitHub 网站',
  'or through a form of direct communication from GitHub to Developer. Developer further acknowledges and agrees that such Modifications may be implemented at any time and without any notice to Developer. Developer shall, within thirty (30) days from the date of first notice of any Modification(s) (or such shorter period of time specified in the notice of the Modification(s)) (the “Conformance Period”) comply with such modification(s) by implementing and using the most current version of a GitHub API in the most current version of the Developer Products and making any changes to Developer Products that may be required as a result of such Modification(s). Developer acknowledges that a Modification may have an adverse effect on Developer Products, including but not limited to changing the manner in which applications communicate with a GitHub API. GitHub shall have no liability of any kind to Developer or any End User with respect to such Modifications or any adverse effects resulting from such Modifications. Developer’s continued access to or use of Marketplace or a GitHub API following the Conformance Period shall constitute binding acceptance of the Modification(s).':
    '或 GitHub 与开发人员的某种直接沟通形式告知。开发人员进一步确认并同意，此类修改可随时实施，且无需事先通知开发人员。开发人员应在首次通知任何修改之日起三十 (30) 天内（或修改通知中指定的更短期限内）（“合规期”）遵守此类修改，方法是在开发人员产品的最新版本中实现并使用最新版本的 GitHub API，并对开发人员产品进行因此类修改而可能需要的任何更改。开发人员确认，修改可能会对开发人员产品产生不利影响，包括但不限于改变应用程序与 GitHub API 的通信方式。对于此类修改或此类修改造成的任何不利影响，GitHub 对开发人员或任何最终用户不承担任何形式的责任。开发人员在合规期结束后继续访问或使用市场或 GitHub API，即构成对修改具有约束力的接受。',
  '(c) Automated Decisions. In the event that the Developer makes automated decisions affecting End User’s rights, including employment, legal, credit, or health, the Developer must provide notice to the End ser.':
    '(c) 自动化决策。如果开发人员作出影响最终用户权利（包括就业、法律、信用或健康方面）的自动化决策，开发人员必须通知最终用户。',
  '(d) Notification. In the event that Developer determines that it can no longer meet its privacy obligations under this Agreement, it must notify GitHub immediately. In the event that Developer was certified under Privacy Shield and allows that certification to lapse or otherwise cannot remain certified under Privacy Shield, Developer must notify GitHub immediately.':
    '(d) 通知。如果开发人员确定其无法再履行本协议项下的隐私义务，必须立即通知 GitHub。如果开发人员曾获得隐私盾认证，但任由该认证失效或因其他原因无法继续保持隐私盾认证，开发人员必须立即通知 GitHub。',
  '(iii) provide GitHub with reasonable assurance that Developer has stopped processing Personal Data and deleted stored Personal Data.':
    '(iii) 向 GitHub 提供合理保证，表明开发人员已停止处理个人数据并已删除所存储的个人数据。'
}

/** 段首编号：(i)、(a)、i.、a.、1.、A1-2. */
const MARKER_RE = /^(?:\((?:[a-z]|[ivx]+)\)|(?:[a-z]|[ivx]+)\.|\d+\.|A\d+-\d+\.?)\s+/
/** 段尾的标点与连接词（列表项结尾的 ; and、; or） */
const TAIL_RE = /[\s.;:]*(?:\b(?:and|or))?[\s.;:]*$/

/** 查表键：去掉段首编号、逗号、双引号与段尾标点，统一单引号，转小写 */
function agreementKey(text: string): string {
  return text
    .replace(MARKER_RE, '')
    .replace(/[,"“”]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(TAIL_RE, '')
    .toLowerCase()
}

let agreementIndex: ReadonlyMap<string, string> | undefined

/** 按规范化后的原文查协议译文，段首编号照页面原文写回；查不到时抛错（引擎按未命中处理） */
export function agreementText(text: string): string {
  agreementIndex ??= new Map(Object.entries(AGREEMENT).map(([source, target]) => [agreementKey(source), target]))
  const translated = agreementIndex.get(agreementKey(text))
  if (translated === undefined) throw new Error(`非协议正文：${text}`)
  return (MARKER_RE.exec(text)?.[0] ?? '') + translated.replace(MARKER_RE, '')
}

export default {
  scoped: AGREEMENT,
  regexp: [
    [new RegExp(`^Effective Date: (${DATE_SOURCE})$`), (_, date: string) => `生效日期：${translateDate(date) ?? date}`],
    // 末条：与收录原文只差逗号、引号、大小写、编号写法的段落（弹窗版本与 Markdown 版的差异）
    [/^(.+)$/, (text: string) => agreementText(text)]
  ],
  inline: [
    // 首段：位于 <a>网址</a> 的服务条款（Markdown 版与弹窗版措辞不同）；预发布条款链接
    [
      'Capitalized terms utilized in this Agreement and not defined shall otherwise have the meaning provided in the GitHub Terms of Service located at {}. Those Terms of Service are referred to as the “Terms” or “ToS”.',
      '本协议中使用但未另行定义的大写术语，其含义以位于 {} 的 GitHub 服务条款为准。该服务条款简称“条款”或“ToS”。'
    ],
    [
      'If you have a Listing on a portion of Marketplace that is in a beta or similar pre-release status, your use of that portion is governed by GitHub’s {}.',
      '如果你在市场中处于 Beta 版或类似预发布状态的部分拥有上架项，你对该部分的使用受 GitHub 的{}约束。'
    ],
    [
      'Capitalized terms utilized in this Agreement and not otherwise defined shall have the meaning provided in the GitHub Terms of Service located at {}. Those Terms of Service are referred to as the “Terms” or “ToS”.',
      '本协议中使用但未另行定义的大写术语，其含义以位于 {} 的 GitHub 服务条款为准。该服务条款简称“条款”或“ToS”。'
    ]
  ]
} satisfies PageDictionary
