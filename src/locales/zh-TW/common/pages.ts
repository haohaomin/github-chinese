import type { PageDictionary } from '../../../core/types'
import { DATE_SOURCE, joinCjk, translateTime } from '../helpers'

/**
 * “By clicking “<按钮名>”, you agree to our” 中的按钮名：已知按钮按界面译法替换，其余保留原文。
 * 用 Map 查找，constructor 等原型链键不会命中。
 */
const AGREE_BUTTONS: ReadonlyMap<string, string> = new Map([
  ['Upgrade to GitHub Pro', '升級到 GitHub 專業版'],
  ['Sign up for GitHub', '註冊 GitHub']
])

/** 营销同意复选框的示例字段 */
const CONSENT_FIELD: Readonly<Record<string, string>> = {
  name: '姓名',
  'email address': '電子郵件地址',
  country: '國家/地區'
}

/**
 * 示例字段列表由 Intl.ListFormat 按浏览器语言拼接：name, email address, and country（en-US）、
 * name, email address and country（en-GB）、name、email address和country（中文）；未收录的字段保留原文
 */
function consentFields(list: string): string {
  const fields = list.split(/,? and |, |、|和|及/).map(field => {
    const name = field.trim()
    return Object.hasOwn(CONSENT_FIELD, name) ? (CONSENT_FIELD[name] ?? name) : name
  })
  const last = fields[fields.length - 1] ?? ''
  return fields.length > 1 ? `${fields.slice(0, -1).join('、')}和${last}` : last
}

/**
 * GitHub 自有页面正文（页面类型 common）：地址与联系表单，
 * 高级支持（/premium-support）、企业试用（/enterprise/trial、试用计划选择 /organizations/enterprise_plan 与创建企业表单）、
 * 联系销售表单、Copilot 结账与购买流程、升级到专业版等。国家/地区、州/省列表见 regions.ts。
 * 另有未登录首页（/）与功能页（/features）的营销正文、网站地图（/sitemap）标题、开发人员计划注册页（/developer/register）、
 * Spark（/spark：首页、列表与编辑器）。这些页面只有 common 作用域（首页另有 dashboard），一律收 static。
 * 产品名、方案名按用户要求译成中文（GitHub Enterprise → GitHub 企業版、Enterprise Cloud / Server → 企業雲端 / 企業伺服器、
 * Premium Support / Premium Plus Support → 進階支援 / 進階增強支援）；品牌词 GitHub、Copilot、Spark、Dependabot 与缩写
 * GHEC / GHES / GHAS / CRE 保留；客户名、公司名保留原文。
 * 支持工单 ticket → 工單，escalation → 呈報，data residency → 資料落地。
 * 不收录：易与其他页面冲突的短词（Free、Team、Enterprise、Business、Standard 等）；
 * Spark 侧边面板标签 Theme（与项目自定义字段名同形）；
 * 结账页标题 Checkout（与 Actions 常见步骤名同形）；引言片段 At、With（过短，整句见 inline）。
 */
export default {
  static: {
    // 地址与联系表单
    'Choose your country/region': '選擇你的國家/地區',
    'Select state': '選擇州',
    'Select province': '選擇省份',

    // 高级支持 /premium-support：首屏与权益
    'GitHub Premium Support': 'GitHub 進階支援',
    'GitHub Premium Plus Support': 'GitHub 進階增強支援',
    'Get 24/7 support for your business with GitHub Premium Support': 'GitHub 進階支援為你的企業提供 24/7 支援',
    'Protect your business': '保護你的企業',
    'and manage IT health with a comprehensive support plan.': '並以全方位的支援方案管理 IT 健康狀態。',
    'Drive operational efficiency': '提升營運效率',
    'and boost uptime with dedicated GitHub experts.': '並由專屬的 GitHub 專家協助提高正常運作時間。',
    'Empower your team': '強化你的團隊',
    'and meet your goals with the resources to maximize your investment.': '並運用各項資源達成目標，讓投資發揮最大價值。',
    'Get a quote': '取得報價',
    'Looking for general support questions? Contact GitHub Support.': '有一般支援問題嗎？請聯絡 GitHub 支援。',
    'Already an existing customer?': '已經是客戶了嗎？',
    'Upgrade to GitHub Premium Support to drive impact quickly.': '升級到 GitHub 進階支援以快速發揮成效。',
    'Experience faster responses 24/7 to maximize your uptime': '全天候享有更快速的回應以盡可能延長正常運作時間',
    'Receive expert support in one central location': '在單一位置集中取得專家支援',
    'Get a dedicated engineer who knows your account': '獲得熟悉你帳號的專屬工程師',
    'Discover all features': '探索所有功能',
    'Get GitHub Premium Support with your Microsoft Unified Support plan.': '透過你的 Microsoft Unified Support 方案取得 GitHub 進階支援。',
    'Provide your team with convenient, self-service tools': '為團隊提供便利的自助式工具',
    'Ensure the reliability of your environment': '確保環境的可靠性',
    'Accelerate your goals with best-in-class support': '以一流的支援加速達成目標',
    'Check your benefits': '查看你的權益',
    'Not a GitHub Enterprise customer yet?': '還不是 GitHub 企業版客戶嗎？',
    'Learn more about GitHub Premium Support and GitHub Premium Plus Support to discover the plan that’s right for you.':
      '瞭解 GitHub 進階支援和 GitHub 進階增強支援，找到最適合你的方案。',
    'Why choose GitHub Premium Support?': '為什麼選擇 GitHub 進階支援？',
    // 引言：“At <TSIA 链接>, we're seeing …”，整句见 inline；At 过短不收，此为整句未命中时的片段
    ", we're seeing technology leaders take an active role in helping their customers adopt new technologies. GitHub is demonstrating a thoughtful, deliberate approach to creating compelling service offerings.":
      '，我們看到技術領導者正積極協助客戶採用新技術。GitHub 在打造具吸引力的服務方面，展現出深思熟慮、審慎周延的做法。',
    'With three tiers of service options, GitHub Premium Support provides customers with smart services at the right time to drive business goals, while simplifying customer choice and allowing for service expansion as needed.':
      'GitHub 進階支援提供三種等級的服務選項，在適當的時機為客戶提供智慧服務以推動業務目標，同時簡化客戶的選擇，並可視需要擴充服務。',
    // 署名：“Hal Stanley // VP …, <TSIA 链接>”
    'Hal Stanley // VP Service Offer Management Research & Advisory,': 'Hal Stanley // 服務產品管理研究和諮詢副總裁，',

    // 高级支持：方案选择与比较表
    'Discover the plan that’s right for you': '找到適合你的方案',
    'Use the dropdown filters to reflect your organization’s properties.': '依你組織的情況設定下拉式篩選器。',
    'GHEC/GHES dual use + GHAS': 'GHEC/GHES 同時使用 + GHAS',
    'License seats': '授權席次',
    Complexity: '複雜度',
    'No ticket SLAs': '無工單 SLA',
    'Already included with your Enterprise license:': '你的企業版授權已包含：',
    'Already included with your Enterprise license': '已包含在你的企業版授權中',
    'Support via online ticket submission': '透過線上送出工單取得支援',
    'Expert guidance from a shared support team': '共用支援團隊提供的專家指導',
    '30 min': '30 分鐘',
    '4 hours': '4 小時',
    '24 hours': '24 小時',
    '48 hours': '48 小時',
    '< 8 hours': '< 8 小時',
    'Initial response for urgent requests': '緊急請求的初次回應',
    'Initial response for high requests': '高優先順序請求的初次回應',
    'Initial response for normal requests': '一般優先順序請求的初次回應',
    'Initial response for low requests': '低優先順序請求的初次回應',
    'Support entitlements': '支援權益',
    'Get everything in the Enterprise support plan, along with:': '包含企業版支援方案的所有內容，另外還有：',
    'Phone support in English via callback request': '透過回電請求提供英文電話支援',
    'Guaranteed service level agreements (SLAs)': '有保障的服務等級協定 (SLA)',
    '20 support entitlement licenses': '20 個支援權益授權',
    'Priority ticket handling': '工單優先處理',
    'Escalation management': '呈報管理',
    'Unlimited automated health check reports for GHES': '不限次數的 GHES 自動健康檢查報告',
    'Access to premium training content': '存取進階培訓內容',
    'Named CRE': '指定 CRE',
    'Per account': '每個帳號',
    '1 training': '1 次培訓',
    'Per year': '每年',
    'Get everything in Premium support plan, along with:': '包含進階支援方案的所有內容，另外還有：',
    'Additional 20 support entitlement licenses': '額外 20 個支援權益授權',
    'Designated Customer Reliability Engineer (CRE)': '指定的客戶可靠性工程師 (CRE)',
    'Incident management': '事件管理',
    'Quarterly enhanced health checks with findings, interpretations, and recommendations from a CRE (by request)':
      '每季增強型健康檢查，附 CRE 提供的發現、解讀和建議（應要求提供）',
    'Crisis prevention: Guided incident simulations that help you prepare for — and experience — an incident without risk (available for GitHub Enterprise Server)':
      '危機預防：透過引導式事件模擬，協助你在無風險的情況下為事件做好準備並親身體驗（適用於 GitHub 企業伺服器）',
    '1 virtual training class per year': '每年 1 堂線上培訓課程',
    '12 hours of technical advisory hours per quarter': '每季 12 小時的技術諮詢時數',
    'Application upgrade assistance (by request)': '應用程式升級協助（應要求提供）',
    'Cloud planning (by request)': '雲端規劃（應要求提供）',
    'Compare all features': '比較所有功能',
    // 窄屏方案选择：Features on <span>方案名</span>，整句见 inline；此为整句未命中时的片段
    'Features on': '功能',
    'Switch plans': '切換方案',
    'Select a plan to review its features': '選擇方案以查看其功能',
    'How to get started?': '如何開始？',
    'Plan coverage': '方案涵蓋範圍',
    'Does not include:': '不包括：',
    'Included with Enterprise Cloud and Enterprise Server': '包含在企業雲端和企業伺服器中',
    'Available for Enterprise Cloud and Enterprise Server': '適用於企業雲端和企業伺服器',
    'Support hours': '支援時間',
    'Initial response time': '初次回應時間',
    '30 minutes for Urgent (including initial troubleshooting)': '緊急優先順序 30 分鐘（含初步疑難排解）',
    '4 hours for High': '高優先順序 4 小時',
    '24 hours for Normal': '一般優先順序 24 小時',
    '48 hours for Normal': '一般優先順序 48 小時',
    '48 hours for Low': '低優先順序 48 小時',
    'n/a': '不適用',
    'Access to premium content': '存取進階內容',
    'One virtual training class is offered per year, with topics such as “GitHub for developers” and “GitHub for admins”.':
      '每年提供一堂線上培訓課程，主題包括「適用於開發人員的 GitHub」和「適用於管理員的 GitHub」等。',
    'Members with support entitlements': '具有支援權益的成員',
    'These members determine if incoming inquiries can be addressed via their company’s admin or only by GitHub.':
      '這些成員決定收到的詢問可由其公司的管理員處理，還是只能由 GitHub 處理。',
    'Dedicated resources': '專屬資源',
    'Priority ticket handling + named Customer Reliability Engineer': '工單優先處理 + 指定的客戶可靠性工程師',
    'For High and Urgent priority tickets': '適用於高優先順序和緊急工單',
    'For Urgent priority tickets, as needed': '適用於緊急工單，視需要提供',
    'Ensures you have the technical resources needed for case resolution, and is available 24/7.':
      '確保你擁有解決案件所需的技術資源，並全天候提供。',
    'Health Checks': '健康檢查',
    'Unlimited automated Health Check reports (see “Generating a Health Check for your enterprise”)':
      '不限次數的自動健康檢查報告（請參閱「為企業產生健康檢查」）',
    'Crisis Prevention': '危機預防',
    'Up to four sessions about reliability best practices, preparing for a potential incident, and efficiently interacting with GitHub Support.':
      '最多四場會議，主題涵蓋可靠性最佳做法、潛在事件的事前準備和如何有效率地與 GitHub 支援溝通。',
    'Technical advisory hours': '技術諮詢時數',
    '12 hours per quarter': '每季 12 小時',
    'Hours can be scheduled at your discretion. You can use them for technical tasks, such as prepping for a GitHub Enterprise Server upgrade.':
      '時數可由你自行安排，可用於技術工作，例如為 GitHub 企業伺服器升級做準備。',
    'Application upgrade assistance': '應用程式升級協助',
    'By request': '應要求提供',
    'Delivered upon request via our Customer Reliability Engineers.': '由我們的客戶可靠性工程師應要求提供。',
    'Cloud planning': '雲端規劃',
    "GitHub's Special Events Support": 'GitHub 特殊活動支援',
    'Dedicated senior support engineer coverage for high-traffic or high-risk events. Support is available in 24-hour increments, with the most common packages offering 24- or 48-hour coverage.':
      '為高流量或高風險活動提供專屬資深支援工程師。支援以 24 小時為單位提供，最常見的方案提供 24 或 48 小時的支援。',
    'Pre-event system checks and readiness planning': '活動前系統檢查和就緒規劃',
    'Real-time support via a dedicated channel': '透過專屬管道提供即時支援',
    'Post-event debriefs with actionable recommendations': '活動後檢討並提供可行的建議',

    // 高级支持：客户评价与团队
    'See what customers are saying about GitHub Premium Support': '看看客戶如何評價 GitHub 進階支援',
    'Our support engineer was very helpful in pointing me to the exact resource I needed in minutes.':
      '我們的支援工程師幫了大忙，幾分鐘內就為我找到所需的資源。',
    'The support agent took care of the request with a great sense of urgency and addressed the issue well.':
      '支援人員把這項請求當作急件處理，問題也解決得很好。',
    "I'd like to applaud our engineer for how he exceptionally responded to our query. This ticket was not a simple, one-answer investigation and I was very happy with how he explored multiple angles to investigate.":
      '我要特別稱讚我們的工程師，他對我們的詢問回應得非常出色。這張工單並非一問一答就能解決的簡單調查，他從多個角度深入調查，我非常滿意。',
    'Our engineer was super helpful and spot on with figuring out the problem. The steps he suggested helped me figure out the problem quickly. Kudos!':
      '我們的工程師幫了大忙，一針見血地找出了問題。他建議的步驟讓我很快就釐清了問題。太棒了！',
    'Meet your dedicated GitHub Premium Support team': '認識你的專屬 GitHub 進階支援團隊',
    'Premium Support Engineers': '進階支援工程師',
    'Premium Support Engineers, available only for GitHub Premium Support customers, are dedicated resources who manage and coordinate your entire GitHub Premium Support experience.':
      '進階支援工程師僅為 GitHub 進階支援客戶提供服務，是專門負責管理並協調你整個 GitHub 進階支援體驗的專屬資源。',
    'Support Incident Coordinators': '支援事件協調員',
    'Support Incident Coordinators are responsible for any major incident management, from initiation until resolution, and are available to you 24/7.':
      '支援事件協調員負責所有重大事件的管理，從發起直到解決，全天候為你服務。',
    'Customer Reliability Engineers (CREs)': '客戶可靠性工程師 (CRE)',
    'Customer Reliability Engineers (CREs), available only for GitHub Premium Plus Support customers, know your customer account in detail and can provide answers faster than Premium Support Engineers.':
      '客戶可靠性工程師 (CRE) 僅為 GitHub 進階增強支援客戶提供服務，他們詳細瞭解你的客戶帳號，能比進階支援工程師更快提供解答。',

    // 高级支持：常见问题
    'About GitHub Premium Support': '關於 GitHub 進階支援',
    'What is GitHub Premium Support for?': 'GitHub 進階支援的用途是什麼？',
    'GitHub Premium Support helps customers implement GitHub Enterprise quickly and effectively across the organization with 24/7 support.':
      'GitHub 進階支援提供 24/7 支援，協助客戶在整個組織中快速有效地部署 GitHub 企業版。',
    'How much does GitHub Premium Support cost?': 'GitHub 進階支援的費用是多少？',
    // “please get in touch with the <GitHub Premium Support Sales 链接> sales team.”
    'For pricing information, please get in touch with the': '如需定價資訊，請聯絡',
    'GitHub Premium Support Sales': 'GitHub 進階支援',
    'sales team.': '銷售團隊。',
    'What are the levels of support in GitHub Premium Support?': 'GitHub 進階支援有哪些支援等級？',
    'There are three levels of support:': '共有三種支援等級：',
    'The basic plan included with your GitHub Enterprise license': '你的 GitHub 企業版授權所含的基本方案',
    'Please refer to our': '請參閱我們的',
    'plan comparison table': '方案比較表',
    'How do I contact GitHub Premium Support?': '如何聯絡 GitHub 進階支援？',
    'If you are an existing GitHub Premium Support customer, please sign in to our': '如果你已是 GitHub 進階支援客戶，請登入我們的',
    'support portal': '支援入口網站',
    '. If you don’t already have GitHub Premium Support, please': '。如果你還沒有 GitHub 進階支援，請',
    'contact sales': '聯絡銷售人員',
    'Choosing your plan': '選擇方案',
    'What is escalation and incident management?': '什麼是呈報和事件管理？',
    'Escalation and incident management is the ability to escalate ticket progression in the GitHub support portal. After someone escalates a ticket, Support Incident Coordinators orchestrate all necessary parties to resolve the ticket. Additionally, Senior Escalation Engineers (SEEs) facilitate GitHub-internal technical communications and liaise with the rest of GitHub to improve the support team’s capability in similar future circumstances.':
      '呈報和事件管理是指在 GitHub 支援入口網站中呈報工單以加快處理進度的能力。工單呈報後，支援事件協調員會協調所有必要的相關人員來解決該工單。此外，資深呈報工程師 (SEE) 會促進 GitHub 內部的技術溝通，並和 GitHub 其他團隊協調聯繫，以提升支援團隊日後因應類似情況的能力。',
    'What is incident response management?': '什麼是事件回應管理？',
    'Incident response management helps manage the technical resources needed for case resolution. Support Incident Coordinators are available for incident response management 24/7.':
      '事件回應管理協助管理解決案件所需的技術資源。支援事件協調員全天候提供事件回應管理。',
    'What are my SLAs for initial response?': '我的初次回應 SLA 是多少？',
    'GitHub Premium Support and GitHub Premium Plus Support customers have SLAs. For urgent priority tickets, your SLA guarantees a 30-minute initial response time, which includes troubleshooting. For high priority tickets, your SLA provides a four-hour initial response time.':
      'GitHub 進階支援和 GitHub 進階增強支援客戶享有 SLA。對於緊急工單，SLA 保證 30 分鐘內初次回應，其中包括疑難排解。對於高優先順序工單，SLA 提供 4 小時內初次回應。',
    'What’s included in initial troubleshooting?': '初步疑難排解包括哪些內容？',
    'For initial troubleshooting, the assigned Premium Support Engineer/Customer Reliability Engineer will review and acknowledge your ticket. To better understand the issue and start troubleshooting, the engineer may ask for additional information such as screenshots, error messages, log files, diagnostics files, support bundles, or the output of specific console commands. They may also collaborate with others in support, engineering, or in the regional incident commander.':
      '在初步疑難排解中，指派的進階支援工程師/客戶可靠性工程師會檢視並確認收到你的工單。為了進一步瞭解問題並開始疑難排解，工程師可能會要求提供其他資訊，例如螢幕截圖、錯誤訊息、記錄檔、診斷檔案、支援資料包或特定主控台命令的輸出。他們也可能和支援團隊、工程團隊或區域事件指揮官協作。',
    'How do I get health check reports?': '如何取得健康檢查報告？',
    'GitHub Premium Support and GitHub Premium Plus Support customers are entitled to unlimited automated health check reports. Additionally, GitHub Premium Plus Support customers can request quarterly enhanced health checks with findings, interpretations, and recommendations from a Customer Reliability Engineer (CRE).':
      'GitHub 進階支援和 GitHub 進階增強支援客戶可取得不限次數的自動健康檢查報告。此外，GitHub 進階增強支援客戶還可以申請每季增強型健康檢查，並取得客戶可靠性工程師 (CRE) 提供的發現、解讀和建議。',
    'What is crisis prevention?': '什麼是危機預防？',
    'Crisis prevention allows GitHub Enterprise Server customers to prepare for — and experience — an incident without risk. Your Customer Reliability Engineer (CRE) guides your team through an incident simulation in a safe and controlled environment.':
      '危機預防讓 GitHub 企業伺服器客戶能在無風險的情況下為事件做好準備並親身體驗。你的客戶可靠性工程師 (CRE) 會在安全且受控的環境中引導團隊完成事件模擬。',
    'Crisis Prevention consists of up to four sessions about reliability best practices, preparing for a potential incident, and efficiently interacting with GitHub Support. After the incident simulation, your CRE will run a detailed retrospective, uncovering lessons learned and improvement suggestions for the future.':
      '危機預防包含最多四場會議，主題涵蓋可靠性最佳做法、潛在事件的事前準備和如何有效率地與 GitHub 支援溝通。事件模擬結束後，CRE 會主持詳細的回顧，歸納經驗教訓並提出日後的改進建議。',
    'How long does GitHub Premium Support take?': 'GitHub 進階支援的回應需要多久？',
    'GitHub Premium Support and GitHub Premium Plus Support Plus customers have service-level agreements (SLAs) for initial response. For urgent priority tickets, the initial response SLA guarantees a 30-minute initial response time, which includes troubleshooting. For high-priority tickets, the initial response SLA provides a four-hour time.':
      'GitHub 進階支援和 GitHub 進階增強支援客戶享有初次回應的服務等級協定 (SLA)。對於緊急工單，初次回應 SLA 保證 30 分鐘內初次回應，其中包括疑難排解。對於高優先順序工單，初次回應 SLA 提供 4 小時的回應時間。',
    'We currently do not provide estimates for time to resolution, as the complexity of tickets varies. However, we review these metrics on a regular basis and reduce times whenever possible.':
      '由於工單的複雜度不一，我們目前不提供解決時間的預估。不過，我們會定期檢視這些指標，並盡可能縮短時間。',
    'How do I resolve a problem in GitHub Enterprise?': '如何解決 GitHub 企業版中的問題？',
    'You can get support via online ticket submission if you’re using the basic plan included with your GitHub Enterprise license. If you have GitHub Premium Support or GitHub Premium Plus Support, you can submit a ticket online. For urgent tickets, GitHub Premium Support and GitHub Premium Plus Support customers can request a callback with one of our Premium Support Engineers or Customer Reliability Engineers (CREs). Please refer to our':
      '如果你使用的是 GitHub 企業版授權所含的基本方案，可以透過線上送出工單取得支援。如果你擁有 GitHub 進階支援或 GitHub 進階增強支援，可以線上送出工單。對於緊急工單，GitHub 進階支援和 GitHub 進階增強支援客戶可以要求我們的進階支援工程師或客戶可靠性工程師 (CRE) 回電。請參閱我們的',
    'Rules and policies': '規則和政策',
    'If I do not use all the technical advisory hours in a given quarter, can they be carried over?':
      '如果某一季沒有用完所有技術諮詢時數，可以累積到下一季嗎？',
    'Premium Plus customers may use up to 12 technical advisory hours per quarter. Unused technical advisory hours may not be carried over into the next quarter.':
      '進階增強支援客戶每季最多可使用 12 小時的技術諮詢時數。未使用的技術諮詢時數不能累積到下一季。',
    'How can the technical advisory support hours be used?': '技術諮詢支援時數可以怎麼使用？',
    'There are multiple ways you can use technical advisory hours, including but not limited to:': '技術諮詢時數有多種用法，包括但不限於：',
    'Consultations regarding GitHub best practices and general recommendations': 'GitHub 最佳做法和一般建議的諮詢',
    'GitHub Enterprise Server upgrade preparation and assistance': 'GitHub 企業伺服器升級準備和協助',
    'Does GitHub Premium Support provide service on weekends?': 'GitHub 進階支援在週末提供服務嗎？',
    'Yes! GitHub Premium Support and GitHub Premium Plus Support customers receive 24/7 support.':
      '是的！GitHub 進階支援和 GitHub 進階增強支援客戶可獲得 24/7 支援。',
    'Upgrading your plan': '升級方案',
    'What virtual trainings are available with GitHub Premium Plus Support and who can participate?':
      'GitHub 進階增強支援提供哪些線上培訓？誰可以參加？',
    'Customers get access to one virtual training class per year. Topics include:': '客戶每年可參加一堂線上培訓課程。主題包括：',
    'GitHub for developers': '適用於開發人員的 GitHub',
    // 课程名括号里的 Server / Cloud 指企业服务器 / 企业云（产品名译中文：伺服器 / 雲端），括号内有中文用全角
    'GitHub for admins (Server)': '適用於管理員的 GitHub（伺服器）',
    'GitHub for admins (Cloud)': '適用於管理員的 GitHub（雲端）',
    'GitHub for non-developers': '適用於非開發人員的 GitHub',
    'GH API Training': 'GH API 培訓',
    'GH Actions Fundamentals': 'GH 動作基礎',
    'GH Actions Intermediate': 'GH 動作中級',
    'GH Copilot Fundamentals': 'GH Copilot 基礎',
    'GH Copilot Intermediate': 'GH Copilot 中級',
    'GH Copilot Administration & Security': 'GH Copilot 管理和安全性',
    'GitHub Enterprise Implementation (Cloud)': 'GitHub 企業版部署（雲端）',
    'We recommend limiting training sessions to a maximum of 16 participants to ensure an optimal provider-to-participant ratio and a high-quality delivery experience. However, in specific cases where it makes sense, we can accommodate up to 20–25 participants while maintaining our commitment to delivering a valuable training experience for your team.':
      '我們建議每場培訓最多 16 人參加，以確保最佳的講師學員比例，並提供高品質的授課體驗。不過，在合適的特定情況下，我們最多可容納 20–25 位學員，同時仍致力為你的團隊提供有價值的培訓體驗。',
    'What value will I get by upgrading to GitHub Premium Plus Support?': '升級到 GitHub 進階增強支援能帶來什麼價值？',
    'GitHub Premium Plus Support customers get an assigned Customer Reliability Engineer (CRE), quarterly enhanced health checks, access to crisis prevention, technical advisory hours, and many additional benefits, which you can review in our':
      'GitHub 進階增強支援客戶可獲得指派的客戶可靠性工程師 (CRE)、每季增強型健康檢查、危機預防、技術諮詢時數和許多其他權益，詳情請參閱我們的',
    'What’s the benefit of having a Customer Reliability Engineer (CRE) over a Premium Support Engineer?':
      '相較於進階支援工程師，客戶可靠性工程師 (CRE) 有什麼優勢？',
    'A CRE knows your customer account in detail and can help you expedite case resolution faster than a Premium Support Engineer.':
      'CRE 詳細瞭解你的客戶帳號，能比進階支援工程師更快協助你解決案件。',
    'Since I get GitHub Enterprise Support for free, why should I upgrade to GitHub Premium Support?':
      '既然我已免費享有 GitHub 企業版支援，為什麼還要升級到 GitHub 進階支援？',
    'Most customers upgrade to GitHub Premium Support because they need initial response SLAs for urgent and high priority requests, phone support, and health checks. To see a full list of features for GitHub Premium Support packages, please refer to our':
      '大多數客戶升級到 GitHub 進階支援，是因為需要緊急和高優先順序請求的初次回應 SLA、電話支援和健康檢查。如需查看 GitHub 進階支援方案的完整功能清單，請參閱我們的',
    'Ready to maximize your investment?': '準備好讓投資發揮最大價值了嗎？',
    'Get in touch with a GitHub Premium Support specialist today.': '立即聯絡 GitHub 進階支援專家。',
    'Click below to fill out the form, and our management team will contact you within 48 hours.':
      '按一下下方填寫表單，我們的管理團隊會在 48 小時內聯絡你。',

    // 高级支持：图片替代文本
    'Page navigation': '頁面導覽',
    'Screenshot of video call interface showing high CPU load chart with urgent API request analysis for a slow GitHub Enterprise Server.':
      '視訊通話介面截圖，顯示一台回應緩慢的 GitHub 企業伺服器的高 CPU 負載圖表和緊急 API 請求分析。',
    "Screenshot of a Health Check report interface with high-level instance health check and a primary call to action to 'Request Health Check'":
      '健康檢查報告介面截圖，顯示執行個體健康檢查摘要和「請求健康檢查」主要行動按鈕',
    'A smiling GitHub Support Engineer wearing headphones and a branded hoodie, monitoring the enterprise-premium-support Slack channel on a large desktop monitor.':
      '一位面帶微笑的 GitHub 支援工程師戴著耳機、穿著品牌連帽衫，正在用大型桌上型螢幕監看 enterprise-premium-support Slack 頻道。',
    'A woman from behind coding on a laptop.': '一位女性在筆記型電腦上寫程式的背影。',
    'A man working on a laptop at his desk.': '一位男性在辦公桌前用筆記型電腦工作。',
    'Two men working on computers at neighboring desks.': '兩位男性在相鄰的辦公桌前用電腦工作。',
    'A woman video calling with someone on a laptop while sitting at the table.': '一位女性坐在桌前，用筆記型電腦和人視訊通話。',
    'Spotify logo': 'Spotify 標誌',
    'Slack logo': 'Slack 標誌',
    'Arm logo': 'Arm 標誌',
    'Dow Jones logo': 'Dow Jones 標誌',
    'Ford logo': 'Ford 標誌',
    'Uber logo': 'Uber 標誌',
    'TSIA logo': 'TSIA 標誌',

    // 企业试用 /enterprise/trial
    'Try the GitHub platform': '試用 GitHub 平台',
    'The platform that powers more than 90% of the Fortune 100': '超過 90% 的財星 100 大企業採用的平台',
    'Start a 30 day free trial': '開始 30 天免費試用',
    'Start a free 30 day trial': '開始 30 天免費試用',
    '30-day free trial': '30 天免費試用',
    Logos: '標誌',
    'Pause animation': '暫停動畫',
    'Play animation': '播放動畫',
    'What you get in your premium free trial': '進階免費試用包含的內容',
    'What you get in your premium free trial:': '進階免費試用包含：',
    "Unlock GitHub's premium features": '取得 GitHub 的進階功能',
    // 企业云试用注册页：页面标题、图片替代文字
    'Set up your GitHub Enterprise Cloud trial': '設定 GitHub 企業雲端試用',
    'GitHub, Copilot and Advanced Security icons.': 'GitHub、Copilot 與進階安全性圖示。',
    'Waiting for verification.': '等待驗證。',
    'Try GitHub Enterprise Cloud, Advanced Security, and Copilot Business to see how they can transform your workflow.':
      '試用 GitHub 企業雲端、進階安全性和 Copilot 商務版，看看它們如何改變你的工作流程。',
    'Simplify management with an enterprise account': '使用企業帳號簡化管理',
    'Manage multiple organizations with ease, streamline collaboration, and scale your development processes.':
      '輕鬆管理多個組織、簡化協作，並擴大開發流程的規模。',
    'Give up to 50 users risk-free access': '為最多 50 位使用者提供零風險存取權',
    'Invite up to 50 members of your team to utilize the best of GitHub free for 30 days.':
      '邀請最多 50 位團隊成員免費使用 GitHub 的最佳功能 30 天。',
    'GitHub is more than just a place to store code,': 'GitHub 不只是存放程式碼的地方，',
    'it’s a full-featured platform where we can manage the entire developer workflow.':
      '它是功能完整的平台，讓我們能管理整個開發人員工作流程。',
    'Developer Tools Lead // EY Technology': '開發人員工具負責人 // EY Technology',
    'Build what’s next today': '立即打造未來',
    'With an all-in-one, end-to-end platform that’s beloved by developers, GitHub makes it simple to build what’s next faster, at scale, and more securely.':
      'GitHub 是深受開發人員喜愛的一站式端對端平台，讓你輕鬆以更快的速度、更大的規模、更安全的方式打造未來。',
    'Find out how GitHub compares': '瞭解 GitHub 和其他平台的比較',
    // 比较项标签（方案名、产品名译中文）
    'Enterprise:': '企業版：',
    'Advanced Security:': '進階安全性：',
    'Seamlessly plan, build, and ship great software with an extensible DevOps platform':
      '透過可擴充的 DevOps 平台，順暢地規劃、建置並交付優質軟體',
    'Spend less time fixing security vulnerabilities with AI-powered AppSec tools': '使用 AI 驅動的 AppSec 工具減少修正安全性漏洞的時間',

    // 企业版试用计划选择 /organizations/enterprise_plan。产品名 Enterprise Cloud / Server 全站同译（new/plans.ts 同译）
    'Pick your trial plan': '選擇試用方案',
    'Enterprise Cloud': '企業雲端',
    'Build and deploy to GitHub-hosted cloud environments, directly from your repositories.':
      '直接從儲存庫建置並部署到 GitHub 代管的雲端環境。',
    'Enterprise Server': '企業伺服器',
    // 按参考词库原文收录：末尾 GC 疑为截断，现行全文未核实
    'Manage and deploy GitHub Enterprise on your own servers, including AWS, Azure, or GC':
      '在你自己的伺服器（包括 AWS、Azure 或 GC）上管理並部署 GitHub 企業版',
    // 卡片底部 Why teams <心形图标> it: …，片段连读为“团队为何 ♥ 它：…”
    'Why teams': '團隊為何',
    'it: Get started in minutes, and leave the infrastructure to us.': '它：幾分鐘即可上手，基礎架構交給我們。',
    'it: Control where your code and data live in a private cloud.': '它：在私人雲端中掌控程式碼和資料的存放位置。',

    // 创建企业（试用）：企业类型
    'Choose an Enterprise plan': '選擇企業版方案',
    'Set up your GitHub Enterprise Managed Users trial': '設定 GitHub 企業受控使用者試用',
    'Start by choosing an enterprise type': '首先選擇企業類型',
    'Your enterprise type determines whether members can contribute to public repositories and if they can use their personal GitHub accounts.':
      '企業類型會決定成員能否向公開儲存庫貢獻，以及能否使用個人 GitHub 帳號。',
    'Learn more about enterprise types': '瞭解企業類型',
    'Enterprise icon': '企業圖示',
    'Enterprise with managed users': '使用受控使用者的企業',
    'Recommended for internal work': '建議用於內部工作',
    'For private and internal work only, with member accounts provisioned from your identity provider.':
      '僅限私人和內部工作，成員帳號由你的身分識別提供者佈建。',
    'For private, internal work only, with member accounts provisioned from your identity provider.':
      '僅限私人、內部工作，成員帳號由你的身分識別提供者佈建。',
    'Get started with managed users': '開始使用受控使用者',
    'Enterprise with personal accounts': '使用個人帳號的企業',
    'Recommended for public and private work': '建議用於公開和私人工作',
    'For public, open source and private work, that allows members to access your repositories with their personal GitHub accounts.':
      '適用於公開、開源和私人工作，允許成員使用其個人 GitHub 帳號存取你的儲存庫。',
    'Get started with personal accounts': '開始使用個人帳號',
    'Learn more about Enterprise Managed Users': '瞭解企業受控使用者',
    'To bring your organization along or allow members to use their personal GitHub accounts, we recommend':
      '若要帶入現有組織或允許成員使用個人 GitHub 帳號，我們建議',

    // 创建企业：数据托管与企业信息
    'Data hosting': '資料託管',
    'Choose which geographical location to store your data': '選擇要儲存資料的地理位置',
    'By default, GitHub stores data for GitHub.com in the United States.': '預設情況下，GitHub 會將 GitHub.com 的資料儲存在美國。',
    // “With <GitHub Enterprise Cloud with Data Residency 链接>, you can choose …”，整句见 inline；
    // With 过短不收，此为整句未命中时的片段
    'GitHub Enterprise Cloud with Data Residency': '採用資料落地的 GitHub 企業雲端',
    ', you can choose where your company’s code and data are stored. Your enterprise will be hosted on a dedicated subdomain of GHE.com.':
      '，你可以選擇公司程式碼和資料的儲存位置。你的企業將託管在 GHE.com 的專屬子網域上。',
    // 原文只有域名里的点，没有逗号，译文不加
    'Host on GitHub.com without data residency': '託管在 GitHub.com 上且不使用資料落地',
    Europe: '歐洲',
    'Enterprise name': '企業名稱',
    'e.g. Acme, Inc.': '例如 Acme, Inc.',
    'Enterprise URL slug': '企業 URL 代稱',
    'e.g. acme-inc.': '例如 acme-inc',
    'This will be your enterprise profile URL.': '這將是你的企業資料頁 URL。',
    Subdomain: '子網域',
    'This will be your enterprise subdomain e.g. acme-inc.ghe.com': '這將是你的企業子網域，例如 acme-inc.ghe.com',
    'Admin information': '管理員資訊',
    'Admin name': '管理員姓名',
    'Admin work email': '管理員公司電子郵件',
    'This email should send and receive emails.': '此電子郵件地址應能收發電子郵件。',
    'This contact will be the first and only admin account responsible to configure the identity provider to provision user accounts and has unique recovery access in the event of an outage.':
      '此聯絡人將是第一個也是唯一的管理員帳號，負責設定身分識別提供者以佈建使用者帳號，並在服務中斷時擁有唯一的復原存取權限。',
    'User responsible for configuring this enterprise.': '負責設定此企業的使用者。',
    'Username shortcode (cannot be edited later)': '使用者名稱簡碼（之後無法編輯）',
    'e.g. usc for University of Southern California': '例如 usc 代表 University of Southern California',
    'What is a username shortcode?': '什麼是使用者名稱簡碼？',
    'Members of this enterprise will be created with login handles like': '此企業成員的登入名稱將類似',
    'Your setup admin username will be:': '你的設定管理員使用者名稱將是：',
    'You will set the password for this user in the next step.': '你將在下一步為此使用者設定密碼。',
    'Identity Provider': '身分識別提供者',
    "Select which identity provider you will use to manage your enterprise's user accounts.":
      '選擇要用來管理企業使用者帳號的身分識別提供者。',
    'Custom or other': '自訂或其他',
    Industry: '產業',
    'Specify your industry': '指定你的產業',
    'Number of employees': '員工人數',
    'Agriculture & Mining': '農業和採礦業',
    'Business Services': '商業服務',
    'Computers & Electronics': '電腦和電子',
    'Consumer Services': '消費者服務',
    'Energy & Utilities': '能源和公用事業',
    'Financial Services': '金融服務',
    'Food & Beverage': '食品和飲料',
    'Media & Entertainment': '媒體和娛樂',
    'Not For Profit': '非營利',
    'Real Estate & Construction': '房地產和營建',
    Retail: '零售',
    'Software & Internet': '軟體和網際網路',
    Telecommunications: '電信',
    'Transportation & Storage': '運輸和倉儲',
    'Travel, Recreation, and Leisure': '旅遊、娛樂和休閒',
    'Wholesale & Distribution': '批發和經銷',
    'Create enterprise': '建立企業',
    'Trial terms': '試用條款',
    // “I understand that <certain features 链接> are unavailable during the trial experience.”
    'I understand that': '我瞭解',
    'certain features': '某些功能',
    'are unavailable during the trial experience.': '在試用期間無法使用。',
    'If my organization does not already have a customer agreement for GitHub services, I hereby accept the':
      '如果我的組織尚未簽訂 GitHub 服務客戶合約，我在此接受',
    'Corporate Terms of Service': '企業服務條款',
    'and confirm that I have the authority to do so on behalf of my organization.': '，並確認我有權代表我的組織這麼做。',
    'Account verification.': '帳號驗證。',
    'Account has been verified. Please continue.': '帳號已驗證。請繼續。',
    "Will take a few minutes to a few hours to process before it's available for use.": '需要幾分鐘到幾小時的處理時間才能使用。',

    // 联系销售 /enterprise/contact（分页标题：Enterprise · A smarter way to work together · GitHub）
    'A smarter way to work together': '更聰明的協作方式',
    'Talk to our sales team': '聯絡我們的銷售團隊',
    'What you’ll get': '你將獲得',
    'A free trial and demo, plus an overview of GitHub’s core products and plans.':
      '免費試用和產品示範，另附 GitHub 核心產品和方案的概要說明。',
    'Who it’s for': '適合誰',
    'Teams and leaders evaluating GitHub for development, security, or enterprise use.':
      '正在評估將 GitHub 用於開發、安全性或企業用途的團隊和主管。',
    'Why it’s worth it': '為何值得',
    'Get clarity on which GitHub plan fits your goals and how to get started quickly.':
      '釐清哪個 GitHub 方案符合你的目標，並瞭解如何快速上手。',
    'Need customer support? For questions about your existing GitHub Enterprise installation,':
      '需要客戶支援嗎？如對現有的 GitHub 企業版安裝有疑問，',
    'contact Enterprise Support': '請聯絡企業版支援',
    'GitHub partners with industry leaders': 'GitHub 攜手業界領導者',
    'All fields marked with an asterisk (*) are required.': '標有星號 (*) 的欄位均為必填。',
    'Job title': '職稱',
    'e.g. Software Engineer': '例如軟體工程師',
    'Work email': '公司電子郵件',
    'Number of developers': '開發人員人數',
    "I'm interested in": '我感興趣的是',
    'Phone number': '電話號碼',
    'Describe your project, needs, and timeline.': '描述你的專案、需求和時程。',
    Country: '國家/地區',
    // “… See the <GitHub Privacy Statement 链接> for more details.”（列出示例字段时另有第二句，见 regexp）
    'Yes please, I’d like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness. See the':
      '好的，我希望 GitHub 和關係企業使用我的資訊，用於個人化溝通、精準廣告和行銷活動成效評估。請參閱',
    "Yes please, I'd like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness.":
      '好的，我希望 GitHub 和關係企業使用我的資訊，用於個人化溝通、精準廣告和行銷活動成效評估。',
    'See the': '請參閱',

    // Copilot 结账与购买（组织 / 企业）
    'GitHub Copilot - Checkout': 'GitHub Copilot - 結帳',
    // 标签页标题：/github-copilot/signup
    'Signup to GitHub Copilot': '註冊 GitHub Copilot',
    'Activate GitHub Copilot': '啟用 GitHub Copilot',
    'GitHub Copilot plans require a valid organization or enterprise': 'GitHub Copilot 方案需要有效的組織或企業',
    "Make sure you're signed in as the owner of an Organization": '請確認你是以組織擁有者身分登入',
    "Make sure you're signed in as the owner of an Enterprise": '請確認你是以企業擁有者身分登入',
    'See the list of Organizations you own.': '查看你擁有的組織清單。',
    'See the list of Enterprises you own.': '查看你擁有的企業清單。',
    'Purchase GitHub Copilot Pro instead': '改為購買 GitHub Copilot 專業版',
    'For more information on purchasing GitHub Copilot,': '如需購買 GitHub Copilot 的詳細資訊，',
    'visit the documentation': '請參閱說明文件',
    'To purchase and try latest Copilot features, including Chat-based assistance in the GitHub Platform, conversational search and summarization on internal documentation and skills for pull request:':
      '若要購買並試用最新的 Copilot 功能，包括 GitHub 平台中以聊天為基礎的協助、內部文件的對話式搜尋和摘要、拉取請求技能：',
    // “… is subject to your GitHub agreement and <the specific GitHub Copilot terms 链接>.”
    "Your organization or enterprise's use of GitHub Copilot is subject to your GitHub agreement and":
      '你的組織或企業使用 GitHub Copilot 須遵守你的 GitHub 協議和',
    'the specific GitHub Copilot terms': '特定的 GitHub Copilot 條款',

    // 结账：方案、付款周期与付款信息（Copilot Pro、升级到 GitHub Pro 共用）
    'Upgrade your account from GitHub Free to GitHub Pro': '將你的帳號從 GitHub 免費版升級到 GitHub 專業版',
    'Back to billing settings': '返回帳務設定',
    'Plan details': '方案詳細資料',
    Product: '產品',
    'Personal account': '個人帳號',
    '/ year': '/ 年',
    'Payment frequency': '付款頻率',
    'Pay monthly': '按月付款',
    'Pay yearly': '按年付款',
    'Total amount': '總金額',
    'Charge to': '扣款帳戶',
    'Edit billing information': '編輯帳單資訊',
    // 账单信息与组织关联：“Confirm your details shown below. To make changes, <edit your billing information 链接>”、
    // “<Update your billing information 链接> to be able to link it with this organization.”
    'This organization is linked with your billing information:': '此組織已連結到你的帳單資訊：',
    'Allow my billing information to be linked with this organization': '允許將我的帳單資訊連結到此組織',
    'Confirm your details shown below. To make changes,': '確認下方顯示的詳細資料。如需變更，請',
    'edit your billing information': '編輯你的帳單資訊',
    'Update your billing information': '更新你的帳單資訊',
    'to be able to link it with this organization.': '以便將其連結到此組織。',
    'You have successfully linked your billing information with this organization.': '已將你的帳單資訊連結到此組織。',
    // 确认框只收第一句：后句 Are you sure you want to do this? 由 settings-account/account.ts 收录，整段按句拼接
    'You are about to remove the billing information for this organization.': '你即將移除此組織的帳單資訊。',
    'PayPal update': '更新 PayPal',
    'Credit Card Form': '信用卡表單',
    'Prepaid debit and credit cards are not accepted as a valid form of payment.': '不接受預付簽帳金融卡和預付信用卡作為有效的付款方式。',
    'Note: Switching from monthly to yearly billing will also impact your other active subscriptions. Any necessary adjustments will be reflected on your invoice.':
      '注意：從按月計費切換為按年計費也會影響你其他有效的訂閱。任何必要的調整都會反映在你的發票上。',
    // GitHub Pro 权益：“Includes everything in <Free>, plus:”
    'Includes everything in': '包含',
    'plus:': '的所有內容，另外還有：',
    'Code owners in private repos': '私人儲存庫中的程式碼擁有者',
    'Pages in private repos': '私人儲存庫中的頁面',
    'Protected branches in private repos': '私人儲存庫中受保護的分支',
    'Repository insights in private repos': '私人儲存庫中的儲存庫洞察',
    'Required reviewers in private repos': '私人儲存庫中的必要審查者',
    'Wikis in private repos': '私人儲存庫中的 Wiki',
    '2GB of GitHub Packages storage': 'GitHub 套件 2GB 儲存空間',
    '3,000 minutes for GitHub Actions': 'GitHub 動作 3,000 分鐘',
    // 营销电子邮件订阅：“If you change your mind, you can <unsubscribe 链接> at any time.”
    'Communication preferences': '通訊偏好設定',
    'If you change your mind, you can': '如果改變主意，你可以隨時',
    unsubscribe: '取消訂閱',
    'at any time.': '。',

    // 未登录首页 /：首屏、注册表单与轮播标签页（Code / Plan / Collaborate / Automate / Secure）
    'The future of building happens together': '開發的未來在於協作',
    'Tools and trends evolve, but collaboration endures. With GitHub, developers, agents, and code come together on one platform.':
      '工具和趨勢不斷演進，但協作始終如一。在 GitHub 上，開發人員、代理和程式碼匯聚於同一個平台。',
    'Enter your email': '輸入電子郵件',
    'Download GitHub Copilot app': '下載 GitHub Copilot 應用程式',
    'Try GitHub Copilot free': '免費試用 GitHub Copilot',
    'Write, test, and fix code quickly with GitHub Copilot, from simple boilerplate to complex features.':
      '運用 GitHub Copilot，從簡單的樣板程式碼到複雜功能，都能快速撰寫、測試並修正。',
    'Align your team from idea to launch with tools that track work, visualize roadmaps, and gather insights.':
      '運用可追蹤工作、將藍圖視覺化並收集洞察的工具，讓團隊從構想到推出都步調一致。',
    Collaborate: '協作',
    'Enable your team to collaborate with agents to plan, code, and test the next big thing.':
      '讓團隊與代理協作，規劃、撰寫程式碼並測試下一個重大創新。',
    Automate: '自動化',
    'Improve your software development process by automating builds, tests, and deployments with CI/CD.':
      '透過 CI/CD 自動執行建置、測試和部署，改善軟體開發流程。',
    'Leverage tooling to detect, review, and fix vulnerabilities before they reach production.':
      '運用工具，在漏洞進入正式環境前加以偵測、審查並修正。',

    // 首页：AI 分区与行业报告（AI 卡片的 h3 内，<span> 标题后接说明句）
    'Accelerate your entire workflow': '加速整個工作流程',
    'From your first line of code to final deployment, GitHub provides AI and automation tools to help you build and ship better software faster.':
      '從第一行程式碼到最終部署，GitHub 提供 AI 和自動化工具，協助你更快打造並交付更好的軟體。',
    'Your AI partner everywhere.': '你的 AI 夥伴，無所不在。',
    'Copilot is ready to work with you at each step of the software development lifecycle.':
      'Copilot 隨時準備在軟體開發生命週期的每個階段與你協作。',
    'Duolingo boosts developer speed by 25% with GitHub Copilot': 'Duolingo 運用 GitHub Copilot 將開發速度提升 25%',
    '2025 Gartner® Magic Quadrant™ for AI Code Assistants': '2025 年 Gartner® AI 程式碼助理魔力象限™',
    'Read industry report': '閱讀產業報告',

    // 首页：自动化分区与折叠项（代码空间、移动版、市场）
    'Automate your path to production': '自動化通往正式環境之路',
    'Ship faster with secure, reliable CI/CD.': '運用安全可靠的 CI/CD 更快交付。',
    'Code instantly from anywhere': '隨時隨地立即撰寫程式碼',
    'Launch a full, cloud-based development environment in seconds.': '幾秒內即可啟動功能完整的雲端開發環境。',
    'Explore GitHub Codespaces': '探索 GitHub 程式碼空間',
    'Keep momentum on the go': '行動中也能保持節奏',
    'Manage projects and assign tasks to Copilot, all from your mobile device.': '在行動裝置上即可管理專案，並將任務指派給 Copilot。',
    'Shape your toolchain': '打造你的工具鏈',
    'Extend your stack with apps, actions, and AI models.': '運用應用程式、動作和 AI 模型擴充你的技術堆疊。',
    'Explore GitHub Marketplace': '探索 GitHub 市集',

    // 首页：安全分区。统计的大字与说明分属两个元素，数字是固定营销文案
    'Built-in application security where found means fixed': '找到即修正的內建應用程式安全性',
    'Use AI to find and fix vulnerabilities so your team can ship more secure software faster.':
      '運用 AI 找出並修正漏洞，讓團隊更快交付更安全的軟體。',
    'Apply fixes in seconds.': '幾秒內即可套用修正。',
    'Spend less time debugging and more time building features with Copilot Autofix.':
      '運用 Copilot 自動修正，減少偵錯時間，把更多時間用來開發功能。',
    'Explore GitHub Advanced Security': '探索 GitHub 進階安全性',
    '70% MTTR reduction': 'MTTR 縮短 70%',
    'with Copilot Autofix': '透過 Copilot 自動修正',
    '8.3M secret leaks stopped': '阻止 830 萬次機密外洩',
    'in the past 12 months with push protection': '過去 12 個月內透過推送保護',
    'Security debt, solved.': '安全性債務，迎刃而解。',
    'Leverage security campaigns and Copilot Autofix to reduce application vulnerabilities.':
      '運用安全性活動和 Copilot 自動修正，減少應用程式漏洞。',
    'Learn about GitHub Code Security': '瞭解 GitHub 程式碼安全性',
    'Dependencies you can depend on.': '值得信賴的相依項目。',
    'Update vulnerable dependencies with supported fixes for breaking changes.': '更新有漏洞的相依項目，並針對破壞性變更提供受支援的修正。',
    'Learn about Dependabot': '瞭解 Dependabot',
    'Your secrets, your business.': '你的機密，由你作主。',
    'Detect, prevent, and remediate leaked secrets across your organization.': '在整個組織中偵測、預防並修復外洩的機密。',
    'Learn about GitHub Secret Protection': '瞭解 GitHub 機密保護',

    // 首页：协作分区与客户推荐语（省略号随原文）
    'Work together, achieve more': '攜手協作，成就更多',
    'From planning and discussion to code review, GitHub keeps your team’s conversation and context next to your code.':
      '從規劃、討論到程式碼審查，GitHub 讓團隊的對話和上下文始終緊貼著程式碼。',
    'Plan with clarity.': '清晰規劃。',
    'Organize everything from high-level roadmaps to everyday tasks.': '從整體藍圖到日常任務，一切有條不紊。',
    'Explore GitHub Projects': '探索 GitHub 專案',
    'It helps us onboard new software engineers and get them productive right away. We have all our source code, issues, and pull requests in one place... GitHub is a complete platform that frees us from menial tasks and enables us to do our best work.':
      '它幫助我們讓新進軟體工程師順利到職並立即發揮生產力。我們所有的原始碼、議題和拉取請求都集中在一處... GitHub 是完整的平台，讓我們擺脫瑣碎雜務，發揮最佳水準。',
    'Application manager at Mercedes-Benz': 'Mercedes-Benz 應用程式經理',
    'Keep track of your tasks': '追蹤你的任務',
    'Create issues and manage projects with tools that adapt to your code.': '使用貼合程式碼的工具建立議題、管理專案。',
    'Explore GitHub Issues': '探索 GitHub 議題',
    'Share ideas and ask questions': '分享想法並提問',
    'Create space for open-ended conversations alongside your project.': '在專案旁為開放式對話保留空間。',
    'Explore GitHub Discussions': '探索 GitHub 討論',
    'Review code changes together': '一起審查程式碼變更',
    'Assign initial reviews to Copilot for greater speed and quality.': '將初步審查指派給 Copilot，提升速度和品質。',
    'Explore code review': '探索程式碼審查',
    'Fund open source projects': '資助開源專案',
    'Become an open source partner and support the tools and libraries that power your work.':
      '成為開源合作夥伴，支持你工作所仰賴的工具和程式庫。',

    // 首页：客户案例。标题分两行；标签页 By industry / By size / By use case 在 actions、codespaces 会被 By 正则半译，
    // 全局 static 优先于正则
    'From startups to enterprises,': '從新創公司到大型企業，',
    'GitHub scales with teams of any size in any industry.': 'GitHub 可隨各行各業、各種規模的團隊彈性擴充。',
    'By industry': '依產業',
    Technology: '科技',
    'Figma streamlines development and strengthens security': 'Figma 簡化開發流程並強化安全性',
    Automotive: '汽車',
    'Mercedes-Benz standardizes source code and automates onboarding': 'Mercedes-Benz 統一原始碼並自動化新人到職流程',
    'Mercado Libre cuts coding time by 50%': 'Mercado Libre 將程式撰寫時間縮短 50%',
    'By size': '依規模',
    'Buffer enhances collaboration and control with GitHub Team': 'Buffer 透過 GitHub 團隊版強化協作和管控',
    'Accenture customizes GitHub Copilot for its 12,000 developers': 'Accenture 為旗下 12,000 位開發人員自訂 GitHub Copilot',
    'Philips reduces infrastructure costs by 80%': 'Philips 將基礎架構成本降低 80%',
    'By use case': '依使用情境',
    'TELUS saves $16.9M with GitHub': 'TELUS 透過 GitHub 節省 1690 萬美元',
    'Fullstory automates DevSecOps at scale with GitHub': 'Fullstory 透過 GitHub 大規模自動化 DevSecOps',
    'EY leverages GitHub and Microsoft Azure DevOps to outpace the competition': 'EY 運用 GitHub 和 Microsoft Azure DevOps 超越競爭對手',
    'Explore customer stories': '探索客戶案例',

    // 首页：结尾与统计脚注
    'Millions of developers and businesses call GitHub home': '數百萬開發人員和企業以 GitHub 為家',
    'Whether you’re scaling your development process or just learning how to code, GitHub is where you belong. Join the world’s most widely adopted developer platform to build the technologies that shape what’s next.':
      '無論你是要擴大開發流程的規模，還是剛開始學寫程式，GitHub 都是你的歸屬。加入全球採用最廣泛的開發人員平台，打造引領未來的技術。',
    'GitHub internal customer data, 2025.': 'GitHub 內部客戶資料，2025 年。',

    // 功能页 /features：首屏与协作编码分区（卡片链接、分区标题按现行的单个文本节点收录）
    'The tools you need to build what you want': '打造你想要的一切所需的工具',
    'Experience AI with Copilot Chat': '透過 Copilot 聊天體驗 AI',
    'The latest GitHub previews': 'GitHub 最新功能預覽',
    'Collaborative Coding': '協作程式開發',
    // 页内锚点导航
    'Collaborative coding': '協作程式開發',
    // 时间线条目：<em>Build community</em> around your code.，由 mergeText 整段合并
    'Build community around your code.': '圍繞你的程式碼打造社群。',
    'Spin up fully configured dev environments in the cloud with the full power of your favorite editor.':
      '在雲端啟動設定完善的開發環境，享有你慣用編輯器的完整功能。',
    'Dedicated space for your community to come together, ask and answer questions, and have open-ended conversations.':
      '為你的社群提供專屬空間，讓成員齊聚一堂、互相解答問題，並展開開放式對話。',
    'Code search & code view': '程式碼搜尋和程式碼檢視',

    // 网站地图 /sitemap：标签页标题 GitHub Sitemap · GitHub
    'GitHub Sitemap': 'GitHub 網站地圖',

    // 开发人员计划注册 /developer/register：标签页标题与页面标题
    'Register for the GitHub Developer Program': '註冊 GitHub 開發人員計畫',
    // 页面标题拆开时的前段，后段 GitHub Developer Program 由 settings-account 的全局词条翻译
    'Register for the': '註冊',
    'The best way to integrate with GitHub.': '與 GitHub 整合的最佳方式。',
    'Select an account': '選擇帳號',
    'Select an account to register': '選擇要註冊的帳號',
    'You don’t belong to any organizations.': '你不屬於任何組織。',
    'Create Organization': '建立組織',
    // 条款：By clicking “…” below, you agree to the <developer terms of service 链接> and the <privacy statement 链接>
    // . We’ll occasionally …（末段以句点开头，与 auth/signup.ts 的 account-related 版同译）
    'By clicking “Register for the GitHub Developer Program” below, you agree to the':
      '按一下下方的「註冊 GitHub 開發人員計畫」即表示你同意',
    'developer terms of service': '開發人員服務條款',
    'and the': '和',
    '. We’ll occasionally send you account related emails.': '。我們會不定期傳送與帳號相關的電子郵件給你。',
    // 侧栏：计划权益
    'Program Benefits': '計畫權益',
    'Notification of API changes': 'API 變更通知',
    'Early access eligibility on select features': '部分功能的搶先體驗資格',
    'Eligibility for development licenses for GitHub products': '取得 GitHub 產品開發授權的資格',
    'GitHub profile membership badge': 'GitHub 個人檔案成員徽章',
    'Learn more about the program': '瞭解此計畫',

    // Spark /spark：首页标语、提示输入框与列表（小写 spark 指作品，译作 Spark）
    'Dream it.': '構想。',
    'See it.': '預覽。',
    'Ship it.': '發布。',
    'Transform ideas into full-stack intelligent apps in a snap. Publish with a click.': '瞬間將構想化為全端智慧應用程式。一鍵發布。',
    'Spark is currently only available to Copilot Pro+ and Enterprise users.': 'Spark 目前僅開放給 Copilot 專業增強版和企業版使用者。',
    'Upgrade now to access Spark': '立即升級以使用 Spark',
    'Create web apps with React and TypeScript to prototype ideas, build tools, and more':
      '使用 React 和 TypeScript 建立 Web 應用程式，製作構想原型、打造工具等',
    'Submit prompt': '送出提示',
    Favorites: '我的最愛',
    'Favorite this spark': '將此 Spark 加入我的最愛',
    'Unfavorite this spark': '將此 Spark 從我的最愛移除',
    'Nothing to see here… yet.': '尚無內容。',

    // Spark 编辑器：头部、视图切换与设置对话框
    'All sparks': '所有 Spark',
    'Live preview is interrupted. Try refreshing the page to reconnect.': '即時預覽已中斷。請重新整理頁面以重新連線。',
    'Preview mode': '預覽模式',
    'Code mode': '程式碼模式',
    'Why not both?': '何不兩者兼得？',
    'Open codespace': '開啟程式碼空間',
    'Your spark will be published as': '你的 Spark 將發布為',
    'Generated by Spark': '由 Spark 產生',
    'Delete spark': '刪除 Spark',
    'Once you delete a spark, there is no going back. Please be certain.': '刪除 Spark 後，將無法復原。請務必確定。',

    // Spark 编辑器：预览工具栏与代码编辑器
    'Action unavailable in this mode': '動作在此模式下無法使用',
    // 进度提示带主语，用“正在”，主语作宾语（同 Mermaid diagram loading、Filters are loading）
    'Action loading': '正在載入動作',
    'Select element to edit': '選取要編輯的元素',
    'Refresh preview': '重新整理預覽',
    'Show mobile view': '顯示行動裝置檢視',
    'Exit mobile view': '結束行動裝置檢視',
    'Autofix error': '自動修正錯誤',
    'Cannot edit in read-only editor': '無法在唯讀編輯器中編輯',
    // 焦点提示被 <kbd> 拆开后的末段
    'to escape the editor.': '離開編輯器。',
    'Hide problems': '隱藏問題',
    'Show minimap': '顯示縮圖',

    // Spark 侧边面板：迭代（标签 Iterate / Theme / Data / Prompts / Assets，Assets 见全局词条，Theme 不收录）
    Iterate: '迭代',
    'What do you want to change?': '你想變更什麼？',
    'Expand prompt': '展開提示',
    'Collapse prompt': '摺疊提示',
    'Copy prompt': '複製提示',
    'Manual edit': '手動編輯',
    'Fix all': '全部修正',

    // Spark 侧边面板：主题（圆角、间距选项的无障碍名称为“分组名 + 档位”）
    'Custom theme': '自訂佈景主題',
    'Select a theme': '選擇佈景主題',
    'Filter themes': '篩選佈景主題',
    'No themes found': '找不到佈景主題',
    'Try changing the filter or selecting a different theme.': '請嘗試變更篩選器或選擇其他佈景主題。',
    Typography: '排版',
    'Sans serif': '無襯線',
    Serif: '襯線',
    Monospace: '等寬',
    'Select a font': '選擇字型',
    'Search colors...': '搜尋顏色...',
    'Show all colors': '顯示所有顏色',
    'Hide colors': '隱藏顏色',
    'Border radius': '圓角',
    'Border radius None': '無圓角',
    'Border radius Small': '小圓角',
    'Border radius Medium': '中等圓角',
    'Border radius Large': '大圓角',
    'Border radius Full': '全圓角',
    Spacing: '間距',
    'Spacing None': '無間距',
    'Spacing Small': '小間距',
    'Spacing Medium': '中等間距',

    // Spark 侧边面板：数据、提示、资产
    Data: '資料',
    'Add data storage by asking in the Iterate panel. View and edit the associated tables and data here.':
      '在迭代面板中提出要求以新增資料儲存。在此查看並編輯關聯的資料表和資料。',
    "We couldn't load your data": '無法載入你的資料',
    Prompts: '提示',
    'Add AI capabilities by asking in the Iterate panel. View and edit the prompts powering those features here.':
      '在迭代面板中提出要求以新增 AI 功能。在此查看並編輯驅動這些功能的提示。',
    'Upload assets here or in the Iterate panel. Assets support images, documents, audio, and video. Ask in the Iterate panel to add them to your app.':
      '在此處或迭代面板中上傳資產。資產支援圖片、文件、音訊和影片。在迭代面板中提出要求，將其加入你的應用程式。'
  },
  regexp: [
    // 电话号码区号选择器：Select country for phone number. Currently selected: US +1
    [/^Select country for phone number\. Currently selected: (.+)$/, '選擇電話號碼所屬國家/地區。目前選擇：$1'],
    // 结账：Payment due Nov 11, 2026
    [new RegExp(`^Payment due (${DATE_SOURCE})$`), (_, date) => joinCjk('付款到期日', translateTime(date))],
    // 结账条款：By clicking “Upgrade to GitHub Pro”, you agree to our（弯引号、直引号均可）
    [
      /^By clicking ["“]([^"”]+)["”], you agree to our$/,
      (_, label: string) => `按一下「${AGREE_BUTTONS.get(label) ?? label}」即表示你同意我們的`
    ],
    // 营销同意复选框（结账、联系表单共用的组件）的第二句：第一句见 static，相邻文本节点整段未命中时按句拆分后拼成一段
    [
      /^The information used includes, but is not limited to, (.+)\.$/,
      (_, list: string) => `所使用的資訊包括但不限於${consentFields(list)}。`
    ]
  ],
  inline: [
    // 窄屏方案选择（/pricing、/organizations/plan、/account/organizations/new，页面类型都是 new）：
    // Features on <span>team</span>。方案名小写、由 CSS 首字母大写，由 new 的 scoped 译成「團隊版」等；
    // 译文把方案名移到句首，方案名是中文，后面不留空格
    ['Features on {}', '{}功能'],
    // 高级支持引言（/enterprise/premium-support）：h3 的子节点依次为 At、<a>TSIA</a>、, we're … offerings.、
    // <br>、<br>、<div>With three tiers…</div>；尾部 3 个槽位不动，<div> 里的句子照常翻译
    [
      "At {}, we're seeing technology leaders take an active role in helping their customers adopt new technologies. GitHub is demonstrating a thoughtful, deliberate approach to creating compelling service offerings. {}{}{}",
      '在 {}，我們看到技術領導者正積極協助客戶採用新技術。GitHub 在打造具吸引力的服務方面，展現出深思熟慮、審慎周延的做法。{}{}{}'
    ],
    // 创建企业表单的数据托管说明：With <GitHub Enterprise Cloud with Data Residency 链接>, you can choose …
    // 链接文字译成中文，{} 两侧不留空格。宿主按三段收录（表单需登录，结构未核对），
    // 另有元素子节点时不命中，各段照常翻译
    [
      'With {}, you can choose where your company’s code and data are stored. Your enterprise will be hosted on a dedicated subdomain of GHE.com.',
      '透過{}，你可以選擇公司程式碼和資料的儲存位置。你的企業將託管在 GHE.com 的專屬子網域上。'
    ]
  ],
  // 功能页时间线条目（Primer Brand Timeline，类名带 CSS 模块哈希，按片段匹配）：<em> 拆开的句子整段合并
  mergeText: ['[class*="Timeline__item-text"]']
} satisfies PageDictionary
