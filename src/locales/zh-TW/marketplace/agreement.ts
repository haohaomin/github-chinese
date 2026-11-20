import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, translateDate } from '../helpers'

/**
 * 市场开发人员协议弹窗（上架项编辑页「签署 GitHub 市场开发人员协议」与接受条款处的协议链接）：法律文本逐段收录。
 * 弹窗版本（v2.4）与站点政策仓库的 Markdown 版措辞有出入：采集到的编号段落、含链接的首段与通知段按弹窗原文收录，
 * 其余按 Markdown 版收录；逗号、引号、大小写、列表编号写法不同的段落由 regexp 末条按规范化后的原文查表（见 agreementText）。
 * 术语：listing → 上架資訊，End User → 終端使用者，Personal Data → 個人資料，Token → 權杖，Action → 動作。
 */

/** 协议正文：原文 → 译文（标题、列表项带编号） */
const AGREEMENT: Readonly<Record<string, string>> = {
  'These terms and conditions (the "Agreement") govern your participation in GitHub’s Marketplace. By enrolling to participate in the Marketplace or by clicking “I Accept” below, you are confirming that you understand this agreement, and that you accept all of its terms and conditions. If you are entering into this Agreement on behalf of a company or other legal entity, you represent that you have the legal authority to bind the entity to this agreement, in which case “You” will mean the entity you represent.':
    '本條款與條件（「本協議」）規範你參與 GitHub 市集的行為。報名參與市集或按一下下方的「我接受」，即表示你確認理解本協議並接受其所有條款與條件。如果你代表公司或其他法律實體簽訂本協議，即表示你聲明你具有使該實體受本協議約束的法定權限，在此情況下，「你」係指你所代表的實體。',

  '1. DEFINITIONS': '1. 定義',
  '"Action" means a workflow that allows you to implement custom logic to perform a particular task with GitHub without having to create an application.':
    '「動作」係指一種工作流程，讓你無須建立應用程式，即可實作自訂邏輯，透過 GitHub 執行特定工作。',
  '“Brand Features” means the trademarks and similar intellectual property of each party.': '「品牌特徵」係指各方的商標及類似智慧財產。',
  '"Developer" or "You" means the company or individual who has created the Developer Application.':
    '「開發人員」或「你」係指建立開發人員應用程式的公司或個人。',
  '"Developer Application" or "Developer Product" means the software, related content and other digital materials created by You for use in connection with GitHub and accessible via Marketplace. This includes Actions, GitHub Copilot Extensions, and other applications or products that use or interact with generative artificial intelligence (AI) technology.':
    '「開發人員應用程式」或「開發人員產品」係指由你建立、供搭配 GitHub 使用並可透過市集取得的軟體、相關內容及其他數位素材。其中包括動作、GitHub Copilot 擴充功能，以及使用生成式人工智慧 (AI) 技術或與之互動的其他應用程式或產品。',
  '“End User” means any person, company or other legal entity that will acquire licenses to a Developer Product via the GitHub Marketplace.':
    '「終端使用者」係指將透過 GitHub 市集取得開發人員產品授權的任何個人、公司或其他法律實體。',
  '“GitHub API” means any proprietary application programming interface developed by GitHub, and includes the GitHub Copilot API. Access to and use of a GitHub API is governed by the ToS.':
    '「GitHub API」係指由 GitHub 開發的任何專有應用程式介面，包括 GitHub Copilot API。GitHub API 的存取與使用受 ToS 規範。',
  '“GitHub Marketplace” or “Marketplace” means the proprietary online marketplace site operated by GitHub where Developer Products may be delivered to End Users.':
    '「GitHub 市集」或「市集」係指由 GitHub 經營的專有線上市集網站，開發人員產品可透過該網站提供給終端使用者。',
  '“Listing” means the content provided for listing the Developer Product on GitHub Marketplace.':
    '「上架資訊」係指為在 GitHub 市集上架開發人員產品而提供的內容。',
  '“Taxes” means any tax, of any kind or sort regardless of origin, including interest or penalties thereon.':
    '「稅費」係指任何種類或性質的任何稅捐（不論其來源），包括相關利息或罰款。',
  '“Token” means the credentials Developer must obtain to access a GitHub API.': '「權杖」係指開發人員存取 GitHub API 所必須取得的認證。',
  '“Usage Data” means Marketplace related data generated in connection with End User use of GitHub Marketplace and licensure of Developer Products, including but not limited to usage statistics and aggregated sales data. Usage Data does not include and specifically excludes banking and payment information.':
    '「使用資料」係指因終端使用者使用 GitHub 市集及取得開發人員產品授權而產生的市集相關資料，包括但不限於使用統計資料和彙總銷售資料。使用資料不包括且明確排除銀行和付款資訊。',

  '2. PURPOSE AND LICENSE GRANT': '2. 目的與授權',
  'This Agreement sets forth the terms that govern a Developer publishing Listings on the GitHub Marketplace for End Users to use Developer Products. This Agreement is applicable to all Developer Products, regardless if distributed for free or for a fee. Developer agrees to use the GitHub Marketplace solely for the purposes permitted by this Agreement. Developer is solely responsible for its Developer Products.':
    '本協議規定開發人員在 GitHub 市集發佈上架資訊、供終端使用者使用開發人員產品時須遵守的條款。本協議適用於所有開發人員產品，不論其為免費或付費散布。開發人員同意僅為本協議所允許之目的使用 GitHub 市集。開發人員對其開發人員產品負完全責任。',
  'Developer grants to GitHub a non-exclusive, worldwide, transferable, sublicensable, fully paid-up, royalty-free license to process the Listing in any fashion (including testing and displaying it on Marketplace), and to display Developer’s Brand Features in connection with Marketplace.':
    '開發人員授予 GitHub 一項非專屬、全球性、可轉讓、可再授權、已全額付清且免權利金的授權，以任何方式處理上架資訊（包括測試及在市集上展示），並在與市集相關的情況下展示開發人員的品牌特徵。',
  'In addition to the licenses granted above, GitHub may include Developer Brand Features in any material marketing Marketplace. If Developer stops distributing a Developer Product on Marketplace, GitHub will stop use of the discontinued products’ Brand Features.':
    '除上述授予的授權外，GitHub 亦得在任何推廣市集的素材中使用開發人員的品牌特徵。如果開發人員停止在市集上散布某項開發人員產品，GitHub 將停止使用已停止散布之產品的品牌特徵。',
  'Developer must include a separate end user license agreement (“EULA”) in its Developer Products that will govern the End User’s rights to the Developer Products. Developer acknowledges and agrees that the applicable EULA for each Developer Product is solely between Developer and the End User. GitHub shall not be responsible, nor have any liability whatsoever, under any EULA.':
    '開發人員必須在其開發人員產品中附上個別的終端使用者授權合約（「EULA」），用以規範終端使用者對開發人員產品的權利。開發人員確認並同意，各項開發人員產品適用的 EULA 僅存在於開發人員與終端使用者之間。GitHub 不對任何 EULA 負責，亦不因任何 EULA 承擔任何責任。',
  'Except for the license rights granted in this Agreement, (a) Developer retains all rights in the Developer Products; (b) each party retains all rights it has independent of this Agreement, including rights under the US Copyright Act or similar laws of other jurisdictions; and (c) each party owns all rights, title, and interest in its respective Brand Features. Each party is responsible for protecting and enforcing its own rights and neither party has an obligation to do so on the other’s behalf.':
    '除本協議所授予的授權權利外，(a) 開發人員保留對開發人員產品的所有權利；(b) 各方保留其獨立於本協議而享有的所有權利，包括依美國《著作權法》或其他司法管轄區類似法律所享有的權利；且 (c) 各方擁有其各自品牌特徵的所有權利、所有權及利益。各方負責保護並行使其自身權利，任一方均無義務代表另一方為之。',
  'GitHub shall be entitled to provide Developer’s name, address, and other contact details to any third party as required by law or that reasonably, in GitHub’s sole determination, claims that Developer does not possess all of the necessary intellectual property rights in or to the Developer Products.':
    '如法律要求，或任何第三方（經 GitHub 自行判斷）合理主張開發人員未擁有開發人員產品所需的全部智慧財產權，GitHub 有權向該第三方提供開發人員的姓名、地址及其他聯絡資訊。',

  '3. RESTRICTIONS AND RESPONSIBILITIES': '3. 限制與責任',
  "Notwithstanding any of the requirements set forth in Section 2 (Purpose and License Grant) above, Developer's use of Marketplace is explicitly conditioned on Developer’s adherence to this Agreement, including the restrictions and compliance requirements set forth below.":
    '儘管有上文第 2 條（目的與授權）所列的任何要求，開發人員使用市集的明確前提是遵守本協議，包括下文所列的限制與合規要求。',
  'Developer agrees it will protect the privacy and legal rights of all End Users with respect to the use of Developer Products. If an End User provides Developer with or the Developer Product otherwise collects, discloses, accesses, or uses End User Personal Data, then the Developer must (a) inform End Users that such information will be available to the Developer Products; (b) provide a legally adequate privacy notice and protection to End Users; (c) obtain valid End User consent as required, and (d) comply with all other data privacy obligations applicable to Developer.':
    '開發人員同意在開發人員產品的使用方面，保護所有終端使用者的隱私與合法權利。如果終端使用者向開發人員提供終端使用者個人資料，或開發人員產品以其他方式蒐集、揭露、存取或使用終端使用者個人資料，開發人員必須 (a) 告知終端使用者此類資訊將可供開發人員產品使用；(b) 向終端使用者提供法律上充分的隱私權聲明與保護；(c) 依規定取得終端使用者的有效同意；以及 (d) 遵守適用於開發人員的所有其他資料隱私義務。',
  'In order to use and access a GitHub API, Developer must obtain a Token by becoming a subscriber. Developer may not share its Token with any third party, shall keep its Token and all login information secure, and shall use the Token as Developer’s sole means of accessing a GitHub API.':
    '若要使用及存取 GitHub API，開發人員必須成為訂閱者以取得權杖。開發人員不得與任何第三方共用其權杖，應確保其權杖及所有登入資訊的安全，並應以權杖作為存取 GitHub API 的唯一方式。',
  'Developer will not engage in any activity with Marketplace, including attempting to distribute any Developer Product, that violates GitHub’s Terms of Service including Acceptable Use Policies. Additionally, Developer will not attempt to distribute any Developer Product that:':
    '開發人員不得在市集上從事任何違反 GitHub 服務條款（包括可接受使用政策）的活動，包括試圖散布任何開發人員產品。此外，開發人員不得試圖散布具有下列情形的任何開發人員產品：',
  '(i) Contains or installs any active malware or exploits, or uses our platform for exploit delivery (such as part of a command and control system);':
    '(i) 包含或安裝任何作用中的惡意軟體或漏洞利用程式，或利用我們的平台散布漏洞利用程式（例如作為命令與控制系統的一部分）；',
  '(ii) Enables the unauthorized download of streaming content or media; or': '(ii) 允許未經授權下載串流內容或媒體；或',
  '(iii) Diverts End Users or provides links to any other site that mimics Marketplace or passes itself off as Marketplace':
    '(iii) 將終端使用者轉引至任何模仿或冒充市集的其他網站，或提供指向此類網站的連結',
  'With respect to Developer Products that interact with generative AI technology, including GitHub Copilot Extensions, Developer will:':
    '對於與生成式 AI 技術互動的開發人員產品（包括 GitHub Copilot 擴充功能），開發人員應：',
  '(i) Test the Developer Product using various inputs to ensure that outputs do not violate this Agreement;':
    '(i) 使用各種輸入測試開發人員產品，以確保輸出內容不違反本協議；',
  '(ii) Notify users when they are interacting with generative AI content;': '(ii) 在使用者與生成式 AI 內容互動時通知使用者；',
  '(iii) Have a mechanism for End Users to report feedback to GitHub and Developer related to errors, bugs, improper, or undesired outputs; and':
    '(iii) 提供一種機制，讓終端使用者向 GitHub 及開發人員回報與錯誤、缺陷、不當或非預期輸出相關的意見回饋；以及',
  '(iv) Inform End Users the appropriate use cases, best practices, and limitations of the Developer Product.':
    '(iv) 告知終端使用者開發人員產品的適當使用案例、最佳做法及限制。',
  'Developer shall not by any means repackage or resell Marketplace, a GitHub API, Personal Data, or Usage Data. Developer is not permitted to use a GitHub API or any Personal or Usage Data in any manner that does or could undermine the security of the Service, a GitHub API, Usage Data, or any other data or information stored or transmitted using Marketplace. In addition, Developer shall not (a) interfere with, modify, or disable any features, functionality, or security controls of Marketplace or a GitHub API; (b) circumvent in any fashion any protection mechanisms for Marketplace or a GitHub API; or (c) reverse engineer, decompile, disassemble, or derive the source code, underlying ideas, algorithms, structure, or organizational form from Marketplace or a GitHub API.':
    '開發人員不得以任何方式重新封裝或轉售市集、GitHub API、個人資料或使用資料。開發人員不得以任何會或可能損害服務、GitHub API、使用資料或透過市集儲存或傳輸之任何其他資料或資訊安全的方式，使用 GitHub API 或任何個人資料或使用資料。此外，開發人員不得 (a) 干擾、修改或停用市集或 GitHub API 的任何特性、功能或安全控制措施；(b) 以任何方式規避市集或 GitHub API 的任何保護機制；或 (c) 對市集或 GitHub API 還原工程、反編譯、反組譯，或從中推知原始碼、基本概念、演算法、結構或組織形式。',
  'Developer acknowledges that Developer is solely responsible, and that GitHub has no responsibility or liability of any kind, for any aspect of Developer Products. Developer will be solely responsible for:':
    '開發人員確認，開發人員對開發人員產品的各個方面負完全責任，GitHub 不承擔任何形式的責任或義務。開發人員將全權負責：',
  '(i) providing End Users instructions on installing and using its Developer Products;':
    '(i) 向終端使用者提供安裝及使用其開發人員產品的說明；',
  '(ii) creating and displaying information and content on, through or within its Developer Products;':
    '(ii) 在其開發人員產品上、透過其開發人員產品或在其開發人員產品內建立及顯示資訊與內容；',
  '(iii) ensuring that its Developer Products do not violate or infringe the intellectual property rights of any third party;':
    '(iii) 確保其開發人員產品不違反或侵害任何第三方的智慧財產權；',
  '(iv) ensuring that Developer Products are not offensive, profane, obscene, libelous or otherwise illegal;':
    '(iv) 確保開發人員產品不具冒犯性、褻瀆性、猥褻、誹謗性或其他違法性質；',
  '(v) ensuring that its Developer Products do not contain or introduce malicious software into Marketplace, a GitHub API, any Usage Data or other data stored or transmitted using Marketplace; and':
    '(v) 確保其開發人員產品不含惡意軟體，亦不將惡意軟體引入市集、GitHub API、任何使用資料或透過市集儲存或傳輸的其他資料；以及',
  '(vi) ensuring that its Developer Products are not designed to or utilized for the purpose of sending commercial electronic messages to any GitHub.com users, agents or End Users without their consent.':
    '(vi) 確保其開發人員產品並非為了未經同意向任何 GitHub.com 使用者、代理人或終端使用者傳送商業電子訊息而設計或使用。',
  'Developer will respect and comply with the technical and policy-implemented limitations of a GitHub API and the restrictions of this Agreement in designing and implementing Developer Products. Developer shall not violate any explicit rate limitations on calling or otherwise utilizing a GitHub API.':
    '在設計及實作開發人員產品時，開發人員將尊重並遵守 GitHub API 在技術與政策上施加的限制，以及本協議的限制。開發人員不得違反對呼叫或以其他方式使用 GitHub API 所設的任何明確速率限制。',
  "Nothing in this Agreement shall prevent either party from developing and/or publishing applications that are similar or otherwise compete with the other party's applications.":
    '本協議的任何內容均不妨礙任一方開發及/或發佈與另一方應用程式相似或以其他方式與之競爭的應用程式。',

  '4. TAKEDOWNS': '4. 下架',
  'Your Takedowns. Upon providing GitHub with thirty (30) days written notice, you may remove your Listing from future distribution via Marketplace. You must continue to comply with this Agreement for any Listing already distributed through Marketplace, including but not limited to refund requirements. Removing your Listing from future distribution via Marketplace does not (a) affect the license rights of End Users who have previously purchased or installed your Listing or (b) change your obligation to deliver or support a Listing that has been previously purchased or installed by users. If you remove your Listing, GitHub will not disclose your reason for the removal.':
    '由你下架。在提前三十 (30) 天以書面通知 GitHub 後，你可以將你的上架資訊從市集的後續散布中移除。對於已透過市集散布的任何上架資訊，你必須繼續遵守本協議，包括但不限於退款要求。將你的上架資訊從市集的後續散布中移除，不會 (a) 影響先前已購買或安裝你上架資訊之終端使用者的授權權利，亦不會 (b) 改變你交付或支援使用者先前已購買或安裝之上架資訊的義務。如果你移除上架資訊，GitHub 不會揭露你移除的原因。',
  'GitHub Review and Takedowns. GitHub may review or test your Listing for compliance with this Agreement, GitHub ToS, and any other applicable terms, obligations, laws, or regulations. GitHub retains sole and absolute discretion over what Listings are included on Marketplace. You may be required to provide information about yourself (such as identification or contact details) as part of the registration process for Marketplace, or as part of your continued use of Marketplace. You agree that any information you give to Marketplace will be accurate, correct, and up to date. As part of the specification for your Listing, GitHub may ask that you include in the file for your Listing information such as your name and email address. GitHub may use this information when featuring the Listing in our directory or for other uses.':
    'GitHub 審查與下架。GitHub 得審查或測試你的上架資訊是否符合本協議、GitHub ToS 及任何其他適用的條款、義務、法律或法規。GitHub 對哪些上架資訊可列入市集保有唯一且絕對的裁量權。在市集註冊過程中或在你持續使用市集期間，你可能需要提供有關你自己的資訊（例如身分證明或聯絡資訊）。你同意你提供給市集的任何資訊皆為準確、正確且最新的資訊。作為上架資訊規格的一部分，GitHub 可能會要求你在上架資訊檔案中加入你的姓名和電子郵件地址等資訊。GitHub 在我們的目錄中推薦該上架資訊或用於其他用途時，可能會使用這些資訊。',
  'If GitHub is notified by you or otherwise becomes aware and determines, in its sole discretion, that a Listing or any portion thereof or your Brand Features:':
    '如果 GitHub 收到你的通知或以其他方式得知，並自行判定上架資訊或其任何部分或你的品牌特徵：',
  '(i) violates the terms of this Agreement or the ToS;': '(i) 違反本協議或 ToS 的條款；',
  '(ii) the display of the Listing is impacting the integrity of GitHub servers (i.e., users are unable to access such content or otherwise experience difficulty);':
    '(ii) 上架資訊的展示正在影響 GitHub 伺服器的完整性（即使用者無法存取此類內容或遇到其他困難）；',
  '(iii) is deemed by GitHub to add undue risk to Marketplace End Users’ data or impair the user experience of Marketplace or GitHub; or':
    '(iii) 經 GitHub 認定會對市集終端使用者的資料帶來不當風險，或損害市集或 GitHub 的使用者體驗；或',
  '(iv) is subject to End User complaints in regards to your breach of your EULA,': '(iv) 因你違反 EULA 而遭到終端使用者投訴，',
  "GitHub may: suspend the transfer of Personal Data to your Developer Product; prohibit the collection and processing of Personal Data via your Developer Product; remove the Listing from Marketplace; flag, filter, or modify related materials (including but not limited to descriptions, screenshots, or metadata); or reclassify the Listing at its sole discretion. If GitHub takes any of these actions on your Listing, you may appeal GitHub's action through the GitHub Appeal and Reinstatement Process":
    'GitHub 得自行決定：暫停向你的開發人員產品傳輸個人資料；禁止透過你的開發人員產品蒐集及處理個人資料；從市集中移除該上架資訊；標記、篩選或修改相關素材（包括但不限於說明、螢幕擷取畫面或中繼資料）；或重新分類該上架資訊。如果 GitHub 對你的上架資訊採取上述任何措施，你可以透過 GitHub 申訴與恢復程序對 GitHub 的措施提出申訴',
  "GitHub may: suspend the transfer of Personal Data to your Developer Product; prohibit the collection and processing of Personal Data via your Developer Product; remove the Listing from Marketplace; flag, filter, or modify related materials (including but not limited to descriptions, screenshots, or metadata); or reclassify the Listing at its sole discretion. If GitHub takes any of these actions on your Listing, you may appeal GitHub's action through the":
    'GitHub 得自行決定：暫停向你的開發人員產品傳輸個人資料；禁止透過你的開發人員產品蒐集及處理個人資料；從市集中移除該上架資訊；標記、篩選或修改相關素材（包括但不限於說明、螢幕擷取畫面或中繼資料）；或重新分類該上架資訊。如果 GitHub 對你的上架資訊採取上述任何措施，你可以就 GitHub 的措施提出申訴，途徑為',
  'GitHub Appeal and Reinstatement Process': 'GitHub 申訴與恢復程序',
  'Developer Product Updates. From time to time, GitHub may check for available updates to any Listing, including but not limited to bug fixes or enhanced functionality. If you update your Listing to Marketplace, you agree that such update will be automatically requested, downloaded, and installed without further notice to you. GitHub makes no guarantees regarding the timing of such updates. Updates to a Listing are subject to the same terms and conditions as the Listing.':
    '開發人員產品更新。GitHub 可能會不時檢查任何上架資訊的可用更新，包括但不限於錯誤修正或功能增強。如果你向市集更新你的上架資訊，即表示你同意該更新將自動要求、下載及安裝，不另行通知你。GitHub 不對此類更新的時間作任何保證。上架資訊的更新與該上架資訊適用相同的條款與條件。',
  "End-User Takedowns. If an End-User uses your Developer Product in a way that violates the Terms, then we have the right to suspend or terminate that End-User's access to the Developer Product without any liability to you.":
    '終端使用者下架。如果終端使用者以違反條款的方式使用你的開發人員產品，我們有權暫停或終止該終端使用者對開發人員產品的存取，且無須對你承擔任何責任。',

  '5. REPRESENTATIONS, WARRANTIES AND COVENANTS': '5. 聲明、保證與承諾',
  'Developer must inform End Users of the Personal Data that will be transmitted to the Developer Application from the Service and that Developer terms will control the privacy, security, or integrity of such Personal Data. To the extent Developer’s Applications store, process, or transmit Personal Data, neither Developer nor Developer’s Application will, without appropriate prior user consent or except to the extent required by applicable law:':
    '開發人員必須告知終端使用者哪些個人資料將從服務傳輸到開發人員應用程式，並告知此類個人資料的隱私、安全或完整性將受開發人員條款規範。在開發人員的應用程式儲存、處理或傳輸個人資料的範圍內，未經使用者事先適當同意，或除適用法律要求外，開發人員及開發人員的應用程式均不得：',
  '(i) modify the content of Personal Data in a manner that adversely affects the integrity of the Personal Data;':
    '(i) 以對個人資料完整性產生不利影響的方式修改個人資料的內容；',
  '(ii) disclose the Personal Data to any third party; or': '(ii) 向任何第三方揭露個人資料；或',
  '(iii) use the Personal Data for any purpose other than providing the Developer Application functionality to users of such Developer Application.':
    '(iii) 將個人資料用於向開發人員應用程式的使用者提供該應用程式功能以外的任何目的。',
  'Developer shall maintain and handle all Personal Data in accordance with privacy and security measures reasonably adequate to preserve the confidentiality and security of all such Personal Data and all applicable privacy laws and regulations.':
    '開發人員應依照足以合理維護所有此類個人資料機密性與安全性的隱私及安全措施，以及所有適用的隱私法律與法規，儲存及處理所有個人資料。',
  'Developer agrees that it will comply with the GitHub Data Protection Addendum.': '開發人員同意遵守 GitHub 資料保護附錄。',
  'You Support Your Developer Product. Developer will be solely responsible for support and maintenance of your Developer Products and any complaints about your Developer Products. Your support contact information will be displayed in each application detail page and made available to users for customer support purposes. Failure to provide adequate support for your Developer Products may result in reduced product exposure, or in some cases removal from Marketplace or anywhere else on GitHub.com where previously purchased or downloaded Developer Products are stored on behalf of users.':
    '由你支援你的開發人員產品。開發人員將全權負責你的開發人員產品的支援與維護，以及有關你的開發人員產品的任何投訴。你的支援聯絡資訊將顯示在每個應用程式詳細資料頁面上，並提供給使用者作為客戶支援之用。未能為你的開發人員產品提供充分支援，可能導致產品曝光度降低，或在某些情況下遭從市集或 GitHub.com 上代使用者儲存先前購買或下載之開發人員產品的任何其他位置移除。',
  'Developer represents and warrants that: (i) its Developer Products and Developer Brand Features do not and will not violate, misappropriate, or infringe upon the intellectual property rights of any third party; (ii) Developer will comply with all applicable laws and regulations, including this Agreement and GitHub’s Terms of Service, and maintain all permissions necessary to develop, implement, and distribute its Developer Products; (iii) its Developer Products do not and will not contain or introduce any malicious software; (iv) its Developer Products are not designed to or utilized for the purpose of sending commercial electronic messages to any GitHub customers, agents, or End Users without their consent; (v) Developer has all right, power and authority to grant the licenses granted to GitHub and End Users herein; and (vi) any images and text that are used to market the Developer Products or that Developer has uploaded to Marketplace are truthful, accurate, and not intended to mislead or confuse the End User.':
    '開發人員聲明並保證：(i) 其開發人員產品及開發人員品牌特徵現在及未來均不會違反、盜用或侵害任何第三方的智慧財產權；(ii) 開發人員將遵守所有適用的法律與法規，包括本協議及 GitHub 服務條款，並維持開發、實作及散布其開發人員產品所需的一切許可；(iii) 其開發人員產品現在及未來均不包含或引入任何惡意軟體；(iv) 其開發人員產品並非為了未經同意向任何 GitHub 客戶、代理人或終端使用者傳送商業電子訊息而設計或使用；(v) 開發人員擁有授予本協議中向 GitHub 及終端使用者所授予之授權的一切權利、權力與權限；以及 (vi) 用於推廣開發人員產品或開發人員已上傳至市集的任何圖片與文字均真實、準確，且無意誤導或混淆終端使用者。',
  'Disclaimer of Warranties. All aspects of Marketplace and GitHub API, including all server and network components, are provided on an “as is” and “as available” basis, without any warranties of any kind. GitHub expressly disclaims any and all warranties to the fullest extent permitted by law, whether express or implied, including, but not limited to, any implied warranties of merchantability, title, fitness for a particular purpose, and non-infringement. Developer acknowledges that GitHub does not warrant that Marketplace or a GitHub API will be uninterrupted, timely, secure, error-free, or free from viruses, malware, or worms (otherwise known as computer code or other technology specifically designed to disrupt, disable, or harm your software, hardware, computer system, or network), and no information or advice obtained by developer from GitHub or through Marketplace or a GitHub API shall create any warranty not expressly stated in these terms. GitHub is not responsible for, and specifically disclaims any liability for, any unauthorized use of Developer Products outside Marketplace.':
    '擔保免責聲明。市集與 GitHub API 的所有方面（包括所有伺服器與網路元件）均依「現況」及「現有」基礎提供，不附帶任何形式的擔保。在法律允許的最大範圍內，GitHub 明確否認任何及所有明示或默示的擔保，包括但不限於對適售性、所有權、特定用途適用性及未侵權的任何默示擔保。開發人員確認，GitHub 不保證市集或 GitHub API 不會中斷、及時、安全、無錯誤，或不含病毒、惡意軟體或蠕蟲（亦即專門用於干擾、停用或損害你的軟體、硬體、電腦系統或網路的電腦程式碼或其他技術），且開發人員自 GitHub 或透過市集或 GitHub API 取得的任何資訊或建議，均不構成這些條款中未明確規定的任何擔保。GitHub 不對在市集以外未經授權使用開發人員產品的行為負責，並明確否認對此承擔任何責任。',

  '6. PAID APPLICATIONS OR PRODUCTS': '6. 付費應用程式或產品',
  'GitHub will be the merchant of record for Developer Products purchased by End Users via Marketplace.':
    '對於終端使用者透過市集購買的開發人員產品，GitHub 將作為登記商家。',
  'Registration. Developer will be required to provide information about yourself (such as identification or contact details) as part of the registration process for Marketplace, or as part of your continued use of Marketplace including, but not limited to: (i) name, (ii) address, (iii) telephone number, (iv) e-mail address, and (v) payment account details. GitHub may publicize Developer’s information on Marketplace and retain Developer’s registration information as required by applicable law.':
    '註冊。在市集註冊過程中或在你持續使用市集期間，開發人員須提供有關你自己的資訊（例如身分證明或聯絡資訊），包括但不限於：(i) 姓名、(ii) 地址、(iii) 電話號碼、(iv) 電子郵件地址，以及 (v) 付款帳戶詳細資料。GitHub 得在市集上公開開發人員的資訊，並依適用法律之要求保留開發人員的註冊資訊。',
  'Pricing. Prices for Listings of Developer Applications will be set in US Dollars (USD). Developer has complete control over setting pricing for each Listing. The prices you set for Developer Products will determine the amount of payment you will receive. GitHub will remit 95% of the sale price in USD without reduction for Taxes except for any withholding taxes that are required under applicable law. The remaining 5% of the sales price will be allotted to and retained by GitHub. At the end of each month and upon reaching a minimum value of $500 USD, GitHub will remit your share of payments.':
    '定價。開發人員應用程式上架資訊的價格將以美元 (USD) 設定。開發人員可完全自主地為每項上架資訊定價。你為開發人員產品設定的價格將決定你將收到的付款金額。GitHub 將以美元匯付銷售價格的 95%，不扣除稅費，但適用法律要求的任何預扣稅款除外。銷售價格其餘的 5% 將分配給 GitHub 並由其保留。在每月月底且金額達到最低 500 美元時，GitHub 將匯付你應得的款項。',
  'Refunds. You will be responsible for specifying the terms and conditions regarding refunds to your End Users. In no event shall GitHub be responsible for providing any support for refunds, nor shall GitHub be liable for payment of any refund.':
    '退款。你將負責向你的終端使用者說明有關退款的條款與條件。在任何情況下，GitHub 均不負責為退款提供任何支援，亦不負責支付任何退款。',

  '7. OWNERSHIP': '7. 所有權',
  'Subject to the limited licenses expressly provided in this Agreement, nothing in this Agreement transfers or assigns to a party any of the other party’s intellectual property rights in its Brand Features or other technology, and nothing in this Agreement transfers or assigns a party any of the other party’s intellectual property rights.':
    '除本協議明確規定的有限授權外，本協議的任何內容均不會將另一方在其品牌特徵或其他技術中的任何智慧財產權移轉或讓與給一方，本協議的任何內容亦不會將另一方的任何智慧財產權移轉或讓與給一方。',

  '8. LIMITATION OF LIABILITY': '8. 責任限制',
  'Under no circumstances and under no legal theory (whether in contract, tort, negligence or otherwise) will GitHub, or its affiliates, officers, directors, employees, agents, or suppliers be liable to developer or any third party under this agreement for any indirect, incidental, special, exemplary, consequential, punitive or other similar damages, including lost profits, lost sales or business, lost data, business interruption or any other loss incurred by Developer or any third party in connection with this Agreement, regardless of whether Developer has been advised of the possibility of or could have foreseen such damages notwithstanding anything to the contrary in this Agreement, GitHub’s aggregate liability to Developer or any third party arising out of this Agreement shall not exceed $500 (five hundred) USD.':
    '在任何情況下，無論依據何種法律理論（不論是契約、侵權行為、過失或其他），GitHub 或其關係企業、高階主管、董事、員工、代理人或供應商均不會就本協議項下的任何間接、附帶、特殊、懲戒性、衍生性、懲罰性或其他類似損害，對開發人員或任何第三方承擔責任，包括開發人員或任何第三方因本協議而蒙受的利潤損失、銷售或業務損失、資料遺失、營業中斷或任何其他損失，無論開發人員是否已被告知或本可預見此類損害的可能性；儘管本協議中有任何相反規定，GitHub 因本協議而對開發人員或任何第三方承擔的累計責任不超過 500（五百）美元。',

  '9. INDEMNIFICATION': '9. 賠償',
  'To the maximum extent permitted by applicable law, Developer agrees to defend, indemnify and hold harmless GitHub, its affiliates and their respective directors, officers, employees and agents from and against any and all claims, actions, suits or proceedings, as well as any losses, liabilities, damages, costs and expenses (including reasonable attorneys’ fees) arising from or relating to (a) Developer’s use of Marketplace in violation of this Agreement, the Terms or any applicable laws or regulations; (b) Developer’s Products that infringe any copyright, trademark, trade secret, patent or other intellectual property right of any third party; (c) any loss or disclosure of data or Personal Data by Developer Products; and (d) Developer’s EULA (or ToS).':
    '在適用法律允許的最大範圍內，對於因下列各項所引起或與之相關的任何及所有索賠、訴訟、起訴或程序，以及任何損失、責任、損害、成本與費用（包括合理的律師費），開發人員同意為 GitHub、其關係企業及其各自的董事、高階主管、員工與代理人抗辯、提供賠償並使其免受損害：(a) 開發人員違反本協議、條款或任何適用法律或法規使用市集；(b) 開發人員的產品侵害任何第三方的任何著作權、商標、營業秘密、專利或其他智慧財產權；(c) 開發人員產品造成的任何資料或個人資料遺失或洩露；以及 (d) 開發人員的 EULA（或 ToS）。',

  '10. TERMINATION': '10. 終止',
  'This Agreement will continue to apply until terminated by either party as set forth below.':
    '本協議將持續適用，直至任一方依下文規定終止本協議為止。',
  'Either party may terminate this Agreement for any reason upon thirty (30) days written notice. During the 30 day period, the terms in effect at the time of the notice of termination shall govern.':
    '任一方均得基於任何理由，提前三十 (30) 天以書面通知終止本協議。在這 30 天期間內，以發出終止通知時有效的條款為準。',
  'GitHub may terminate this Agreement at any time if (a) you have breached any provision of this Agreement or (b) GitHub is required to do so by law.':
    '如果 (a) 你違反本協議的任何條款，或 (b) 法律要求 GitHub 這麼做，GitHub 得隨時終止本協議。',
  'Effects of Termination by Developer. Upon receiving thirty (30) days’ advanced written notice of termination from Developer, Developer will be disabled from taking on new customers via Marketplace. Any outstanding fees shall be remitted upon termination and removal of the Developer Product from Marketplace. If termination is initiated as a result of a GitHub modification to these terms (Section 11), the terms in effect immediately prior to such modification shall govern the duration of the 30-day notice period.':
    '開發人員終止的效力。在收到開發人員提前三十 (30) 天發出的書面終止通知後，開發人員將無法再透過市集招攬新客戶。任何未結費用應於終止並將開發人員產品自市集移除時匯付。如果終止係因 GitHub 修改這些條款（第 11 條）而發起，則在 30 天通知期間內，以緊接該修改前有效的條款為準。',
  'The obligations in Sections 2, 3, 4, 5, 8, 9, 12-18, and Data Protection Addendum will survive any expiration or termination of this Agreement.':
    '第 2、3、4、5、8、9、12-18 條及資料保護附錄中的義務，在本協議到期或終止後仍繼續有效。',

  '11. MODIFICATION': '11. 修改',
  'Developer acknowledges and agrees that GitHub may modify this Agreement, Marketplace Terms of Service, a GitHub API, the General API Policies, GitHub Privacy Statement, the GitHub Developer Program Terms of Service, and the GitHub.com ToS from time to time (a “Modification”). All Modifications shall be communicated through Marketplace, the GitHub website at www.GitHub.com or through a form of direct communication from GitHub to Developer. Developer further acknowledges and agrees that such Modifications may be implemented at any time and without any notice to Developer. Developer shall, within thirty (30) days from the date of first notice of any Modification(s) (or such shorter period of time specified in the notice of the Modification(s)) (the “Conformance Period”) comply with such modification(s) by implementing and using the most current version of a GitHub API in the most current version of the Developer Products and making any changes to Developer Products that may be required as a result of such Modification(s). Developer acknowledges that a Modification may have an adverse effect on Developer Products, including but not limited to changing the manner in which applications communicate with a GitHub API. GitHub shall have no liability of any kind to Developer or any End User with respect to such Modifications or any adverse effects resulting from such Modifications. Developer’s continued access to or use of Marketplace or a GitHub API following the Conformance Period shall constitute binding acceptance of the Modification(s).':
    '開發人員確認並同意，GitHub 可能會不時修改本協議、市集服務條款、GitHub API、一般 API 政策、GitHub 隱私權聲明、GitHub 開發人員計畫服務條款及 GitHub.com ToS（「修改」）。所有修改均將透過市集、GitHub 網站 www.GitHub.com，或 GitHub 與開發人員的某種直接溝通形式告知。開發人員進一步確認並同意，此類修改得隨時實施，且無須事先通知開發人員。開發人員應在首次通知任何修改之日起三十 (30) 天內（或修改通知中指定的較短期間內）（「合規期」）遵守此類修改，方法是在開發人員產品的最新版本中實作並使用最新版本的 GitHub API，並對開發人員產品做出因此類修改而可能需要的任何變更。開發人員確認，修改可能會對開發人員產品產生不利影響，包括但不限於改變應用程式與 GitHub API 的通訊方式。對於此類修改或此類修改所造成的任何不利影響，GitHub 對開發人員或任何終端使用者不承擔任何形式的責任。開發人員在合規期結束後繼續存取或使用市集或 GitHub API，即構成對修改具有約束力的接受。',

  '12. ASSIGNMENT; ENTIRE AGREEMENT; REVISIONS': '12. 讓與；完整協議；修訂',
  'Developer may not, directly or indirectly, by operation of law or otherwise, assign all or any part of this Agreement or Developer’s rights under this Agreement or delegate performance of Developer’s duties under this Agreement without GitHub’s prior written consent. The rights granted in this Agreement may be assigned or transferred by GitHub without Developer’s prior approval. In addition, GitHub may delegate its responsibilities or obligations under this Agreement without Developer’s consent.':
    '未經 GitHub 事先書面同意，開發人員不得透過法律的施行或其他方式，直接或間接讓與本協議的全部或任何部分或開發人員在本協議項下的權利，亦不得委託他人履行開發人員在本協議項下的職責。GitHub 得在未經開發人員事先核准的情況下，讓與或移轉本協議所授予的權利。此外，GitHub 得在未經開發人員同意的情況下，委託他人履行其在本協議項下的責任或義務。',
  'This Agreement, together with the ToS, constitute the entire agreement between the parties with respect to the subject matter of this Agreement. GitHub’s failure to enforce at any time any provision of this Agreement does not constitute a waiver of that provision or of any other provision of this Agreement.':
    '本協議連同 ToS 構成雙方就本協議標的所達成的完整協議。GitHub 在任何時候未執行本協議的任何條款，均不構成對該條款或本協議任何其他條款的拋棄。',

  '13. SEVERABILITY': '13. 可分割性',
  'If any part of this Agreement is held to be unenforceable, the rest of the Agreement will remain in full force and effect.':
    '如果本協議的任何部分經認定為無法執行，本協議的其餘部分仍具完全效力。',

  '14. RELATIONSHIP OF THE PARTIES': '14. 雙方關係',
  'The parties are independent contractors. This Agreement does not create a partnership, franchise, joint venture, agency, fiduciary or employment relationship among the parties. Developer agrees that each member of the group of companies to which GitHub belongs shall be a third party beneficiary to this Agreement and that such other companies shall be entitled to directly enforce, and rely upon, any provision of this Agreement that confers a benefit or grants a right in favor or GitHub. No other person, company or legal entity shall be a third party beneficiary to the Agreement.':
    '雙方均為獨立承攬人。本協議不在雙方之間建立合夥、加盟、合資、代理、信託或僱傭關係。開發人員同意，GitHub 所屬公司集團的每個成員均為本協議的第三方受益人，且此類其他公司有權直接執行並依賴本協議中為 GitHub 賦予利益或授予權利的任何條款。任何其他個人、公司或法律實體均非本協議的第三方受益人。',

  '15. NOTICE': '15. 通知',

  '16. GOVERNING LAW': '16. 準據法',
  'This Agreement will be governed by and construed in accordance with the laws of the State of California and federal laws of the United States. Any legal action or proceeding will be brought exclusively in the federal or state courts located in the Northern District of California. The parties consent to personal jurisdiction and venue there.':
    '本協議受加州法律及美國聯邦法律管轄，並依其解釋。任何法律訴訟或程序均只能向位於加州北區的聯邦或州法院提起。雙方同意接受該地的對人管轄權，並以該地為審判地。',

  '17. EXPORT RESTRICTIONS': '17. 出口限制',
  'Developer Products distributed via Marketplace may be subject to export controls or restrictions by the United States or other countries or territories. Developer agrees to comply with all applicable US and international export laws and regulations. These laws may include restrictions on destinations, content and/or End Users.':
    '透過市集散布的開發人員產品可能受美國或其他國家或地區的出口管制或限制。開發人員同意遵守所有適用的美國及國際出口法律與法規。這些法律可能包括對目的地、內容及/或終端使用者的限制。',

  '18. USAGE DATA': '18. 使用資料',
  'In order to operate and improve Marketplace, GitHub may collect Usage Data from Marketplace or a GitHub API or anywhere previously purchased or downloaded Developer Products are stored on behalf of End Users by GitHub. The Usage Data will be maintained in accordance with GitHub’s then in effect Privacy Statement. Limited Usage Data may be available for use by Developer in GitHub’s sole discretion.':
    '為經營及改善市集，GitHub 得從市集、GitHub API 或 GitHub 代終端使用者儲存先前購買或下載之開發人員產品的任何位置蒐集使用資料。使用資料將依 GitHub 當時有效的隱私權聲明儲存。GitHub 得自行決定向開發人員提供有限的使用資料。',
  '19. PRE-RELEASE ACCESS': '19. 預先發行存取',
  'If you have a Listing on a portion of Marketplace that is in a beta or similar pre-release status, your use of that portion is governed by GitHub’s Pre-release License Terms.':
    '如果你在市集中處於 Beta 版或類似預先發行狀態的部分擁有上架資訊，你對該部分的使用受 GitHub 的預先發行授權條款規範。',
  'Pre-release License Terms': '預先發行授權條款',

  'Addendum 1: Data Protection Addendum': '附錄 1：資料保護附錄',
  'This Data Protection Addendum (this “Addendum”) is attached to and made a part of the GitHub Marketplace Developer Agreement between you and GitHub (the “Agreement”). Terms not defined in this Addendum have the meanings ascribed to them in the Agreement. In the event of a conflict or inconsistency, the terms of this Addendum will supersede those of the Agreement.':
    '本資料保護附錄（「本附錄」）附於你與 GitHub 之間的 GitHub 市集開發人員協議（「協議」），並構成其一部分。本附錄中未定義的術語具有協議所賦予的含義。如有衝突或不一致，以本附錄的條款為準。',

  'A1-1. Purpose and Scope': 'A1-1. 目的與範圍',
  'GitHub maintains Personal Data from individuals all over the world, some of whom are residents of countries and areas with strong data protection laws. This Addendum establishes your responsibilities when you receive and process any such Personal Data from GitHub.':
    'GitHub 持有來自世界各地個人的個人資料，其中部分人士為資料保護法律嚴格之國家及地區的居民。本附錄規定你從 GitHub 接收及處理任何此類個人資料時的責任。',

  'A1-2. Definitions': 'A1-2. 定義',
  '(a) “Applicable Data Protection Laws” means any laws, regulations, regulatory frameworks, or other legislations relating to the processing and use of Personal Data, as applicable to the Agreement, including:':
    '(a) 「適用的資料保護法律」係指適用於協議、與個人資料處理及使用相關的任何法律、法規、監管架構或其他立法，包括：',
  'The EU General Data Protection Regulation 2016/679 (“GDPR”), along with any implementing or corresponding equivalent national laws or regulations;':
    '歐盟《一般資料保護規則》2016/679（「GDPR」），以及任何施行性或相應的同等國家法律或法規；',
  'The California Consumer Privacy Act of 2018, Cal. Civ. Code §§1798.100 et seq. ("CCPA"); and':
    '2018 年《加州消費者隱私法》，《加州民法典》第 1798.100 條以下（「CCPA」）；以及',
  'The UK Data Protection Act 2018 and implementation of GDPR contained therein.': '英國《2018 年資料保護法》及其中所含的 GDPR 施行規定。',
  '(b) “Personal Data” means any information which relates to an individual GitHub End User, customer or employee which could, alone or together with other information, identify them, whether supplied by GitHub for processing by the Developer or whether generated by the Developer in the course of performing its obligations under this Agreement.':
    '(b) 「個人資料」係指與 GitHub 的個別終端使用者、客戶或員工相關，單獨或與其他資訊結合即可識別其身分的任何資訊，無論該資訊係由 GitHub 提供給開發人員處理，或由開發人員在履行本協議項下義務的過程中產生。',
  '(c) “Processing” means any operation or set of operations performed on Personal Data, whether by manual or automatic means, including collection, recording, organization, storage, adaptation, alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, blocking, erasure, or destruction.':
    '(c) 「處理」係指以人工或自動方式對個人資料執行的任何操作或一系列操作，包括蒐集、記錄、組織、儲存、改編、變更、擷取、查閱、使用、以傳輸方式揭露、傳播或以其他方式提供、封鎖、刪除或銷毀。',

  'A1-3. Compliance with Data Transfer Laws': 'A1-3. 遵守資料傳輸法律',
  '(a) GitHub Compliance. GitHub complies with Applicable Data Protection Laws. GitHub relies on Standard Contractual Clauses ("SCCs") for all transfers out of the European Union, European Economic Area, United Kingdom, and Switzerland to provide its services. GitHub also complies with the EU-U.S. Data Privacy Framework (EU-U.S. DPF), the UK Extension to the EU-U.S. DPF, and the Swiss-U.S. Data Privacy Framework (Swiss-U.S. DPF) as set forth by the U.S. Department of Commerce. GitHub has certified to the U.S. Department of Commerce that it adheres to the EU-U.S. Data Privacy Framework Principles (EU-U.S. DPF Principles) with regard to the processing of Personal Data received from the European Union in reliance on the EU-U.S. DPF and from the United Kingdom (and Gibraltar) in reliance on the UK Extension to the EU-U.S. DPF. GitHub has certified to the U.S. Department of Commerce that it adheres to the Swiss-U.S. Data Privacy Framework Principles (Swiss-U.S. DPF Principles) with regard to the processing of Personal Data received from Switzerland in reliance on the Swiss-U.S. DPF.':
    '(a) GitHub 的合規。GitHub 遵守適用的資料保護法律。為提供服務，GitHub 在所有自歐盟、歐洲經濟區、英國及瑞士向外傳輸資料的情況下，均依據標準契約條款（「SCC」）。GitHub 亦遵守美國商務部所制定的歐盟-美國資料隱私框架（EU-U.S. DPF）、歐盟-美國 DPF 的英國延伸，以及瑞士-美國資料隱私框架（Swiss-U.S. DPF）。GitHub 已向美國商務部證明，對於依據歐盟-美國 DPF 自歐盟接收的個人資料，以及依據歐盟-美國 DPF 的英國延伸自英國（及直布羅陀）接收的個人資料，其處理遵守歐盟-美國資料隱私框架原則（EU-U.S. DPF 原則）。GitHub 已向美國商務部證明，對於依據瑞士-美國 DPF 自瑞士接收的個人資料，其處理遵守瑞士-美國資料隱私框架原則（Swiss-U.S. DPF 原則）。',
  '(b) Developer Compliance. Developer represents and warrants that it will (i) comply with Applicable Data Protection Laws; and (ii) abide by the requirements of European Economic Area and Swiss data protection laws regarding the collection, use, transfer, retention, and other processing of Personal Data from the European Economic Area, United Kingdom, and Switzerland. All transfers of Personal Data to a third country or an international organization will be subject to appropriate safeguards as described in Article 46 of the GDPR and such transfers and safeguards will be documented according to Article 30(2) of the GDPR.':
    '(b) 開發人員的合規。開發人員聲明並保證其將 (i) 遵守適用的資料保護法律；以及 (ii) 遵守歐洲經濟區及瑞士資料保護法律中，有關蒐集、使用、傳輸、保留及以其他方式處理來自歐洲經濟區、英國及瑞士之個人資料的要求。所有向第三國或國際組織傳輸個人資料的行為，均須採取 GDPR 第 46 條所述的適當保護措施，且此類傳輸及保護措施將依 GDPR 第 30(2) 條記錄。',

  'A1-4. Data Protection': 'A1-4. 資料保護',
  '(a) Notice. Developer must provide End Users their privacy policy which identifies itself as responsible for the collection, processing, privacy, security, and integrity of all data it collects from the End User. Developer must not hold itself out as collecting any Personal Data on GitHub’s behalf. Developer’s privacy policy must provide End User’s all legally required information regarding access, collection, storage, and processing purpose of Personal Data, with whom the Personal Data is shared, and in which country or countries the Personal Data will be stored.':
    '(a) 告知。開發人員必須向終端使用者提供其隱私權政策，並在其中表明開發人員對其向終端使用者蒐集之所有資料的蒐集、處理、隱私、安全與完整性負責。開發人員不得自稱代表 GitHub 蒐集任何個人資料。開發人員的隱私權政策必須向終端使用者提供法律要求的所有資訊，包括個人資料的存取、蒐集、儲存與處理目的、與誰共用個人資料，以及個人資料將儲存於哪個或哪些國家。',
  '(b) Purpose Limitation.': '(b) 目的限制。',
  '(i) GitHub will provide Developer with Personal Data elements for the purpose of establishing and facilitating a relationship between the Developer and the End User, and permitting Developer to provide services to the End User. Developer must limit its usage of the Personal Data to that purpose, unless the End User agrees to allow different uses.':
    '(i) GitHub 將向開發人員提供個人資料元素，目的是建立並促進開發人員與終端使用者之間的關係，並允許開發人員向終端使用者提供服務。除非終端使用者同意允許其他用途，開發人員必須將個人資料的使用限於該目的。',
  '(ii) Developer must process and communicate the Personal Data to third parties only for the limited and specific purposes of providing its services to the End User as described in its agreement with the End User, unless the End User agrees to allow different uses.':
    '(ii) 除非終端使用者同意允許其他用途，開發人員僅得基於依其與終端使用者之間的協議向終端使用者提供服務此一有限且特定的目的，處理個人資料並將其傳達給第三方。',
  '(c) Data Quality and Proportionality. Developer must keep the Personal Data accurate and up to date. Developer must only collect Personal Data appropriate and necessary to provide the service.':
    '(c) 資料品質與比例原則。開發人員必須確保個人資料準確並保持最新。開發人員僅得蒐集提供服務所適當且必要的個人資料。',
  '(d) Security. Developer must take all reasonable security measures appropriate to the risks, such as against accidental or unlawful destruction, or accidental loss, alteration, unauthorized disclosure or access, presented by processing the Personal Data.':
    '(d) 安全性。開發人員必須針對處理個人資料所帶來的風險（例如意外或非法銷毀，或意外遺失、變更、未經授權的揭露或存取），採取與之相稱的一切合理安全措施。',
  '(e) Data Retention and Deletion. Upon GitHub’s reasonable request, unless prohibited by law, Developer must return or destroy all Personal Data and related data at all locations where it is stored after it is no longer needed for the limited and specified purposes for which it was collected.':
    '(e) 資料保留與刪除。當所有個人資料及相關資料對於其蒐集時之有限且特定的目的已不再需要時，經 GitHub 合理要求，除非法律禁止，開發人員必須在其儲存的所有位置返還或銷毀這些資料。',
  '(f) Subprocessing and Onward Transfer. Developer is liable for onward transfers of Personal Data to its subprocessors. In the event that Developer must transfer the Personal Data to a third party, or Developer installs, uses, or enables third party services to process the Personal Data on Developer’s behalf, Developer must ensure that the third party will provide at least the same level of privacy protection as is required herein.':
    '(f) 次處理與轉移傳輸。開發人員對向其次處理者轉移傳輸個人資料承擔責任。如果開發人員必須將個人資料傳輸給第三方，或開發人員安裝、使用或啟用第三方服務代表開發人員處理個人資料，開發人員必須確保該第三方提供的隱私保護程度至少達到本協議的要求。',

  'A1-5. Use of Personal Data': 'A1-5. 個人資料的使用',
  '(a) Permitted Use. Developer may process the Personal Data only for the purposes set out in Section 4(b)(i), and no other purpose.':
    '(a) 允許的用途。開發人員僅得基於第 4(b)(i) 條所列目的處理個人資料，不得用於任何其他目的。',
  '(b) No Use in Marketing. Developer must not use the Personal Data for the purposes of advertising any third party goods or services, and may not sell the Personal Data to any third party.':
    '(b) 不得用於行銷。開發人員不得將個人資料用於宣傳任何第三方商品或服務，亦不得將個人資料出售給任何第三方。',
  '(c) Automated Decisions. In the event that the Developer makes automated decisions affecting End User’s rights, including employment, legal, credit, or health, the Developer must provide notice to the End User.':
    '(c) 自動化決策。如果開發人員作出影響終端使用者權利（包括就業、法律、信用或健康方面）的自動化決策，開發人員必須通知終端使用者。',

  'A1-6. Compliance': 'A1-6. 合規',
  'Developer will make its Privacy Statement, Privacy Policy, Privacy Notice, or any similar documentation available to GitHub and End User. Developer will also provide notice of any relevant compliance reports.':
    '開發人員將向 GitHub 及終端使用者提供其隱私權聲明、隱私權政策、隱私權通知或任何類似文件。開發人員亦將告知任何相關的合規報告。',

  'A1-7. Termination': 'A1-7. 終止',
  '(a) Takedown. In the event that Developer is in breach of its obligations to maintain an adequate level of privacy protection, GitHub may take action in accordance with Section 4 (Takedowns) or Section 10 (Termination).':
    '(a) 下架。如果開發人員違反其維持充分隱私保護程度的義務，GitHub 得依第 4 條（下架）或第 10 條（終止）採取措施。',
  '(b) Termination. GitHub may terminate this Agreement without prejudice to any other claims at law or in equity in the event that:':
    '(b) 終止。在下列情況下，GitHub 得終止本協議，且不影響其依據法律或衡平法提出的任何其他請求：',
  '(i) the Developer notifies GitHub that it can no longer meet its privacy obligations, including loss of Developer Privacy Shield certification;':
    '(i) 開發人員通知 GitHub 其無法再履行隱私義務，包括開發人員失去隱私盾認證；',
  '(ii) the transfer, collection, or processing of Personal Data has been temporarily suspended for longer than one month pursuant to 7(a);':
    '(ii) 依第 7(a) 條，個人資料的傳輸、蒐集或處理已暫停超過一個月；',
  '(iii) the Developer is in substantial or persistent breach of any warranties or representations under this Data Protection Addendum;':
    '(iii) 開發人員嚴重或持續違反本資料保護附錄項下的任何保證或聲明；',
  '(iv) the Developer is no longer carrying on business, is dissolved, enters receivership, or a winding up order is made on behalf of Developer.':
    '(iv) 開發人員不再經營業務、解散、進入破產管理程序，或對開發人員作出清算命令。',
  '(c) Notification. In the event that Developer determines that it can no longer meet its privacy obligations under this Agreement, it must notify GitHub immediately.':
    '(c) 通知。如果開發人員判定其無法再履行本協議項下的隱私義務，必須立即通知 GitHub。',
  'In the event that Developer was certified under Privacy Shield and allows that certification to lapse or otherwise cannot remain certified under Privacy Shield, Developer must notify GitHub immediately.':
    '如果開發人員曾取得隱私盾認證，但任由該認證失效或因其他原因無法繼續維持隱私盾認證，開發人員必須立即通知 GitHub。',
  '(d) Upon Termination, Developer must:': '(d) 終止後，開發人員必須：',
  '(i) take reasonable and appropriate steps to stop processing of Personal Data;': '(i) 採取合理且適當的措施停止處理個人資料；',
  '(ii) within thirty days of Termination, delete any Personal Data Developer stores on GitHub’s behalf; and':
    '(ii) 在終止後三十天內，刪除開發人員代表 GitHub 儲存的任何個人資料；以及',
  '(iii) provide GitHub with reasonable assurance that Developer has stopped processing the Personal Data and deleted stored Personal Data.':
    '(iii) 向 GitHub 提供合理保證，表明開發人員已停止處理個人資料並已刪除所儲存的個人資料。',

  'A1-8. Liability for Data Processing': 'A1-8. 資料處理責任',
  'Direct Liability. Developer will be liable to GitHub for actual damages caused by any breach of this Addendum subject to the terms in Section 8, Limitation on Liability.':
    '直接責任。在遵守第 8 條「責任限制」條款的前提下，開發人員將就任何違反本附錄之行為所造成的實際損害，對 GitHub 承擔責任。',
  'Notices to GitHub may be submitted via email to': '向 GitHub 發出的通知可透過電子郵件寄至',
  '. If Customer wishes to formally service notice on GitHub, it must be made through GitHub’s registered agent: GitHub, Inc. c/o Corporation Service Company 2710 Gateway Oaks Drive, Suite 150N Sacramento, CA 95833-3505. Notices must be in writing and will be treated as delivered on the date received at the address, date shown on the return receipt, email transmission date, or date on the courier confirmation of delivery. All notices to be provided by GitHub to Developer under this Agreement may be delivered in writing (i) by nationally recognized overnight delivery service (“Courier”) or U.S. mail to the contact mailing address provided by Developer to GitHub; or (ii) electronic mail to the electronic mail address provided by Developer.':
    '。如果客戶希望正式向 GitHub 送達通知，必須透過 GitHub 的登記代理人送達：由 Corporation Service Company 轉交 GitHub, Inc.，地址為美國加州沙加緬度市 Gateway Oaks Drive 2710 號 150N 室，郵遞區號 95833-3505。通知必須以書面為之，並將視為於下列日期送達：於該地址收到通知之日、回執上顯示之日、電子郵件傳送之日，或快遞送達確認上之日。GitHub 依本協議向開發人員發出的所有通知，均得以書面形式透過下列方式送達：(i) 透過全國認可的隔夜快遞服務（「快遞」）或美國郵政，寄至開發人員向 GitHub 提供的聯絡郵寄地址；或 (ii) 透過電子郵件，寄至開發人員提供的電子郵件地址。',
  'Purpose and Scope. GitHub maintains Personal Data from individuals all over the world, some of whom are residents of countries and areas with strong data protection laws. This Addendum establishes your responsibilities when you receive and process any such Personal Data from GitHub.':
    '目的與範圍。GitHub 持有來自世界各地個人的個人資料，其中部分人士為資料保護法律嚴格之國家及地區的居民。本附錄規定你從 GitHub 接收及處理任何此類個人資料時的責任。',

  // 弹窗 v2.4 与上面收录版本措辞不同的段落（实页核对：连字符、冠词、合并段落、原文笔误 End ser）
  '“Usage Data” means Marketplace-related data generated in connection with End User use of GitHub Marketplace and licensure of Developer Products, including but not limited to usage statistics and aggregated sales data. Usage Data does not include, and specifically excludes, banking and payment information.':
    '「使用資料」係指因終端使用者使用 GitHub 市集及取得開發人員產品授權而產生的市集相關資料，包括但不限於使用統計資料和彙總銷售資料。使用資料不包括且明確排除銀行和付款資訊。',
  'GitHub may suspend the transfer of Personal Data to your Developer Product; prohibit the collection and processing of Personal Data via your Developer Product; remove the Listing from Marketplace; flag, filter, or modify related materials (including but not limited to descriptions, screenshots, or metadata); or reclassify the Listing at its sole discretion. If GitHub takes any of these actions on your Listing, you may appeal GitHub’s action through the GitHub Appeal and Reinstatement Process.':
    'GitHub 得自行決定：暫停向你的開發人員產品傳輸個人資料；禁止透過你的開發人員產品蒐集及處理個人資料；從市集中移除該上架資訊；標記、篩選或修改相關素材（包括但不限於說明、螢幕擷取畫面或中繼資料）；或重新分類該上架資訊。如果 GitHub 對你的上架資訊採取上述任何措施，你可以透過 GitHub 申訴與恢復程序對 GitHub 的措施提出申訴。',
  'To the maximum extent permitted by applicable law, Developer agrees to defend, indemnify and hold harmless GitHub, its affiliates and their respective directors, officers, employees and agents from and against any and all claims, actions, suits or proceedings, as well as any losses, liabilities, damages, costs and expenses (including reasonable attorneys’ fees) arising from or relating to (a) Developer’s use of the Marketplace in violation of this Agreement, the Terms or any applicable laws or regulations; (b) Developer’s Products that infringe any copyright, trademark, trade secret, patent or other intellectual property right of any third party; (c) any loss or disclosure of data or Personal Data by Developer Products; and (d) Developer’s EULA (or ToS).':
    '在適用法律允許的最大範圍內，對於因下列各項所引起或與之相關的任何及所有索賠、訴訟、起訴或程序，以及任何損失、責任、損害、成本與費用（包括合理的律師費），開發人員同意為 GitHub、其關係企業及其各自的董事、高階主管、員工與代理人抗辯、提供賠償並使其免受損害：(a) 開發人員違反本協議、條款或任何適用法律或法規使用市集；(b) 開發人員的產品侵害任何第三方的任何著作權、商標、營業秘密、專利或其他智慧財產權；(c) 開發人員產品造成的任何資料或個人資料遺失或洩露；以及 (d) 開發人員的 EULA（或 ToS）。',
  // 修改条款：网址 www.GitHub.com 是链接，前后两段分开收录
  'Developer acknowledges and agrees that GitHub may modify this Agreement, Marketplace Terms of Service, the GitHub API, the General API Policies, GitHub Privacy Statement, the GitHub Developer Program Terms of Service, and the GitHub.com ToS from time to time (a “Modification”). All Modifications shall be communicated through Marketplace, the GitHub website at':
    '開發人員確認並同意，GitHub 可能會不時修改本協議、市集服務條款、GitHub API、一般 API 政策、GitHub 隱私權聲明、GitHub 開發人員計畫服務條款及 GitHub.com ToS（「修改」）。所有修改均將透過市集、GitHub 網站',
  'or through a form of direct communication from GitHub to Developer. Developer further acknowledges and agrees that such Modifications may be implemented at any time and without any notice to Developer. Developer shall, within thirty (30) days from the date of first notice of any Modification(s) (or such shorter period of time specified in the notice of the Modification(s)) (the “Conformance Period”) comply with such modification(s) by implementing and using the most current version of a GitHub API in the most current version of the Developer Products and making any changes to Developer Products that may be required as a result of such Modification(s). Developer acknowledges that a Modification may have an adverse effect on Developer Products, including but not limited to changing the manner in which applications communicate with a GitHub API. GitHub shall have no liability of any kind to Developer or any End User with respect to such Modifications or any adverse effects resulting from such Modifications. Developer’s continued access to or use of Marketplace or a GitHub API following the Conformance Period shall constitute binding acceptance of the Modification(s).':
    '或 GitHub 與開發人員的某種直接溝通形式告知。開發人員進一步確認並同意，此類修改得隨時實施，且無須事先通知開發人員。開發人員應在首次通知任何修改之日起三十 (30) 天內（或修改通知中指定的較短期間內）（「合規期」）遵守此類修改，方法是在開發人員產品的最新版本中實作並使用最新版本的 GitHub API，並對開發人員產品做出因此類修改而可能需要的任何變更。開發人員確認，修改可能會對開發人員產品產生不利影響，包括但不限於改變應用程式與 GitHub API 的通訊方式。對於此類修改或此類修改所造成的任何不利影響，GitHub 對開發人員或任何終端使用者不承擔任何形式的責任。開發人員在合規期結束後繼續存取或使用市集或 GitHub API，即構成對修改具有約束力的接受。',
  '(c) Automated Decisions. In the event that the Developer makes automated decisions affecting End User’s rights, including employment, legal, credit, or health, the Developer must provide notice to the End ser.':
    '(c) 自動化決策。如果開發人員作出影響終端使用者權利（包括就業、法律、信用或健康方面）的自動化決策，開發人員必須通知終端使用者。',
  '(d) Notification. In the event that Developer determines that it can no longer meet its privacy obligations under this Agreement, it must notify GitHub immediately. In the event that Developer was certified under Privacy Shield and allows that certification to lapse or otherwise cannot remain certified under Privacy Shield, Developer must notify GitHub immediately.':
    '(d) 通知。如果開發人員判定其無法再履行本協議項下的隱私義務，必須立即通知 GitHub。如果開發人員曾取得隱私盾認證，但任由該認證失效或因其他原因無法繼續維持隱私盾認證，開發人員必須立即通知 GitHub。',
  '(iii) provide GitHub with reasonable assurance that Developer has stopped processing Personal Data and deleted stored Personal Data.':
    '(iii) 向 GitHub 提供合理保證，表明開發人員已停止處理個人資料並已刪除所儲存的個人資料。'
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
      '本協議中使用但未另行定義的大寫術語，其含義以位於 {} 的 GitHub 服務條款為準。該服務條款簡稱為「條款」或「ToS」。'
    ],
    [
      'If you have a Listing on a portion of Marketplace that is in a beta or similar pre-release status, your use of that portion is governed by GitHub’s {}.',
      '如果你在市集中處於 Beta 版或類似預先發行狀態的部分擁有上架資訊，你對該部分的使用受 GitHub 的{}規範。'
    ],
    [
      'Capitalized terms utilized in this Agreement and not otherwise defined shall have the meaning provided in the GitHub Terms of Service located at {}. Those Terms of Service are referred to as the “Terms” or “ToS”.',
      '本協議中使用但未另行定義的大寫術語，其含義以位於 {} 的 GitHub 服務條款為準。該服務條款簡稱為「條款」或「ToS」。'
    ]
  ]
} satisfies PageDictionary
