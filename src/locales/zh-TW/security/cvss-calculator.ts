import type { PageDictionary } from '../../../core/types'

/** CVSS 指标名（计算器按钮的 aria-label、v4 指标标题） */
const METRIC: Readonly<Record<string, string>> = {
  'Attack Vector': '攻擊向量',
  'Attack Complexity': '攻擊複雜度',
  'Attack Requirements': '攻擊要求',
  'Privileges Required': '所需權限',
  'User Interaction': '使用者互動',
  Scope: '範圍',
  Confidentiality: '機密性',
  Integrity: '完整性',
  Availability: '可用性'
}

/** CVSS 指标取值（Local 作「本機」，Physical 作「實體」，Changed / Unchanged 作「已變更」「未變更」） */
const VALUE: Readonly<Record<string, string>> = {
  Network: '網路',
  Adjacent: '相鄰',
  Local: '本機',
  Physical: '實體',
  Low: '低',
  High: '高',
  None: '無',
  Required: '需要',
  Unchanged: '未變更',
  Changed: '已變更',
  Present: '存在',
  Passive: '被動',
  Active: '主動'
}

const METRIC_SOURCE = `(${Object.keys(METRIC).join('|')})`
const VALUE_SOURCE = `(${Object.keys(VALUE).join('|')})`
const ABBR_SOURCE = '(AV|AC|AT|PR|UI|VC|VI|VA|SC|SI|SA)'

/**
 * 公告表单的 CVSS 计算器（v3.1 / v4.0）：指标分组、取值按钮、各取值说明，
 * 以及 v4 指标对话框里的规范原文定义。
 * 取值说明以「: 」开头，前面的取值名在 <strong> 里。
 * 超过 400 字符的说明采集不到：v3.1 按 FIRST 规范原文（去掉表格引用句与结尾示例句）、
 * v4.0 按 RedHat cvss-v4-calculator 的 metrics.json 补录，未在 GitHub 页面核对；撇号两种写法都收录。
 * 术语：vulnerable component / system → 有漏洞的元件 / 系統，impacted component → 受影響的元件，
 * subsequent system → 後續系統，security authority → 安全授權機制，network / protocol stack → 網路堆疊 / 協定堆疊，
 * bound to → 繫結於，network hop → 網路躍點，social engineering → 社交工程，exploit（名词）→ 漏洞利用程式，
 * payload（攻击载荷）→ 酬載，credential → 認證資訊，performance → 效能，repudiate → 否認，
 * deny service → 阻斷服務。
 */
export default {
  static: {
    // 分组与链接
    'Exploitability metrics': '可利用性指標',
    'Vulnerable system impact metrics': '有漏洞系統影響指標',
    'Subsequent system impact metrics': '後續系統影響指標',
    'Learn more about attack vector': '瞭解攻擊向量',
    'Learn more about attack complexity': '瞭解攻擊複雜度',
    'Learn more about attack requirements': '瞭解攻擊要求',
    'Learn more about privileges required': '瞭解所需權限',
    'Learn more about user interaction': '瞭解使用者互動',
    'Learn more about scope': '瞭解範圍',
    'Learn more about confidentiality': '瞭解機密性',
    'Learn more about integrity': '瞭解完整性',
    'Learn more about availability': '瞭解可用性',
    'Attack Vector:': '攻擊向量：',
    'Attack Complexity:': '攻擊複雜度：',
    'Attack Requirements:': '攻擊要求：',
    'Privileges Required:': '所需權限：',
    'User Interaction:': '使用者互動：',

    // v3.1 取值说明
    'This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the Base Score) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater Base Score.':
      '此指標反映可能利用漏洞的情境。攻擊者能在越遠的位置（邏輯上和實體上）利用有漏洞的元件，此指標值（連同由此得出的基本分數）就越大。此處假設可跨網路利用的漏洞，其潛在攻擊者多於需要實體存取裝置才能利用的漏洞，因此應給予較高的基本分數。',
    ': The vulnerable component is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed "remotely exploitable" and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers).':
      '：有漏洞的元件繫結於網路堆疊，可能的攻擊者範圍超出下列其他選項，最遠可達整個網際網路。此類漏洞通常稱為「可遠端利用」，可視為能在協定層級跨越一或多個網路躍點（例如經過一或多個路由器）加以利用的攻擊。',
    ': The vulnerable component is bound to the network stack, but the attack is limited at the protocol level to a logically adjacent topology. This can mean an attack must be launched from the same shared physical (e.g., Bluetooth or IEEE 802.11) or logical (e.g., local IP subnet) network, or from within a secure or otherwise limited administrative domain (e.g., MPLS, secure VPN to an administrative network zone).':
      '：有漏洞的元件繫結於網路堆疊，但攻擊在協定層級僅限於邏輯上相鄰的拓撲。這可能表示攻擊必須從同一個共用的實體網路（例如藍牙或 IEEE 802.11）或邏輯網路（例如本機 IP 子網路）發動，或從安全或以其他方式受限的管理網域內發動（例如 MPLS、連至管理網路區域的安全 VPN）。',
    ": The vulnerable component is not bound to the network stack and the attacker's path is via read/write/execute capabilities. Either: the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or remotely (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).":
      '：有漏洞的元件未繫結於網路堆疊，攻擊者的攻擊途徑是讀取/寫入/執行能力。可能是以下任一情況：攻擊者從本機（例如鍵盤、主控台）或遠端（例如 SSH）存取目標系統來利用漏洞；或攻擊者仰賴他人的使用者互動來執行利用漏洞所需的動作（例如利用社交工程手法誘騙合法使用者開啟惡意文件）。',
    ': The vulnerable component is not bound to the network stack and the attacker’s path is via read/write/execute capabilities. Either: the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or remotely (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).':
      '：有漏洞的元件未繫結於網路堆疊，攻擊者的攻擊途徑是讀取/寫入/執行能力。可能是以下任一情況：攻擊者從本機（例如鍵盤、主控台）或遠端（例如 SSH）存取目標系統來利用漏洞；或攻擊者仰賴他人的使用者互動來執行利用漏洞所需的動作（例如利用社交工程手法誘騙合法使用者開啟惡意文件）。',
    ': The attack requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief (e.g., evil maid attack1) or persistent.':
      '：攻擊需要攻擊者以實體方式碰觸或操作有漏洞的元件。實體互動可能是短暫的（例如邪惡女僕攻擊），也可能是持續的。',
    "This metric describes the conditions beyond the attacker's control that must exist in order to exploit the vulnerability. As described below, such conditions may require the collection of more information about the target, or computational exceptions. Importantly, the assessment of this metric excludes any requirements for user interaction in order to exploit the vulnerability (such conditions are captured in the User Interaction metric). If a specific configuration is required for an attack to succeed, the Base metrics should be scored assuming the vulnerable component is in that configuration. The Base Score is greatest for the least complex attacks.":
      '此指標描述利用漏洞時必須存在、且非攻擊者所能控制的條件。如下所述，這類條件可能需要收集更多關於目標的資訊，或涉及計算上的例外狀況。重要的是，此指標的評估不包括利用漏洞所需的任何使用者互動（這類條件由使用者互動指標衡量）。如果攻擊成功需要特定設定，則應假設有漏洞的元件處於該設定下來評定基本指標。攻擊越不複雜，基本分數越高。',
    'This metric describes the conditions beyond the attacker’s control that must exist in order to exploit the vulnerability. As described below, such conditions may require the collection of more information about the target, or computational exceptions. Importantly, the assessment of this metric excludes any requirements for user interaction in order to exploit the vulnerability (such conditions are captured in the User Interaction metric). If a specific configuration is required for an attack to succeed, the Base metrics should be scored assuming the vulnerable component is in that configuration. The Base Score is greatest for the least complex attacks.':
      '此指標描述利用漏洞時必須存在、且非攻擊者所能控制的條件。如下所述，這類條件可能需要收集更多關於目標的資訊，或涉及計算上的例外狀況。重要的是，此指標的評估不包括利用漏洞所需的任何使用者互動（這類條件由使用者互動指標衡量）。如果攻擊成功需要特定設定，則應假設有漏洞的元件處於該設定下來評定基本指標。攻擊越不複雜，基本分數越高。',
    ': Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success when attacking the vulnerable component.':
      '：不存在特殊的存取條件或可減輕風險的情況。攻擊者攻擊有漏洞的元件時，可預期能重複成功。',
    ": A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected.":
      '：攻擊能否成功，取決於非攻擊者所能控制的條件。也就是說，攻擊無法隨意得手，攻擊者必須針對有漏洞的元件，在準備或執行上投入一定程度可衡量的心力，才能預期攻擊成功。',
    'This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. The Base Score is greatest if no privileges are required.':
      '此指標描述攻擊者成功利用漏洞前必須擁有的權限層級。不需要任何權限時，基本分數最高。',
    ': The attacker is unauthorized prior to attack, and therefore does not require any access to settings or files of the vulnerable system to carry out an attack.':
      '：攻擊者在攻擊前未經授權，因此發動攻擊時不需要存取有漏洞系統的任何設定或檔案。',
    ': The attacker requires privileges that provide basic user capabilities that could normally affect only settings and files owned by a user. Alternatively, an attacker with Low privileges has the ability to access only non-sensitive resources.':
      '：攻擊者需要具備基本使用者能力的權限，這些能力通常只能影響使用者自己擁有的設定和檔案。或者，具有低權限的攻擊者只能存取非敏感資源。',
    ': The attacker requires privileges that provide significant (e.g., administrative) control over the vulnerable component allowing access to component-wide settings and files.':
      '：攻擊者需要的權限能對有漏洞的元件提供重大（例如管理層級的）控制權，可存取整個元件範圍的設定和檔案。',
    'This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is greatest when no user interaction is required.':
      '此指標衡量成功入侵有漏洞的元件時，是否需要攻擊者以外的人類使用者參與。此指標決定漏洞能否完全依攻擊者的意願加以利用，或是否必須有另一位使用者（或由使用者啟動的處理程序）以某種方式參與。不需要使用者互動時，基本分數最高。',
    ': The vulnerable system can be exploited without interaction from any user.': '：不需要任何使用者互動，就能利用有漏洞的系統。',
    ': Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited.':
      '：必須先由使用者採取某些動作，才能成功利用此漏洞。',
    ': An exploited vulnerability can only affect resources managed by the same security authority. In this case, the vulnerable component and the impacted component are either the same, or both are managed by the same security authority.':
      '：遭利用的漏洞只能影響由同一個安全授權機制管理的資源。在此情況下，有漏洞的元件和受影響的元件是同一個元件，或兩者由同一個安全授權機制管理。',
    ': An exploited vulnerability can affect resources beyond the security scope managed by the security authority of the vulnerable component. In this case, the vulnerable component and the impacted component are different and managed by different security authorities.':
      '：遭利用的漏洞可影響有漏洞元件的安全授權機制所管理之安全範圍以外的資源。在此情況下，有漏洞的元件和受影響的元件不同，且由不同的安全授權機制管理。',
    'This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones. The Base Score is greatest when the loss to the impacted component is highest.':
      '此指標衡量漏洞遭成功利用時，對軟體元件所管理之資訊資源的機密性影響。機密性是指將資訊的存取和揭露限於獲授權的使用者，並防止未獲授權者存取資訊或向其揭露資訊。受影響元件的損失最大時，基本分數最高。',
    ': There is no loss of confidentiality within the impacted component.': '：受影響的元件內沒有機密性損失。',
    ': There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the impacted component.':
      '：有部分機密性損失。攻擊者可取得部分受限資訊，但無法控制取得哪些資訊，或損失的數量或種類有限。資訊洩漏不會對受影響的元件造成直接、嚴重的損失。',
    ': There is a total loss of confidentiality, resulting in all resources within the impacted component being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact.':
      '：機密性完全喪失，導致受影響元件內的所有資源都洩漏給攻擊者。或者，攻擊者只取得部分受限資訊，但洩漏的資訊會造成直接、嚴重的影響。',
    'This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. The Base Score is greatest when the consequence to the impacted component is highest.':
      '此指標衡量漏洞遭成功利用時對完整性的影響。完整性是指資訊的可信度和真實性。對受影響元件造成的後果最嚴重時，基本分數最高。',
    ': There is no loss of integrity within the impacted component.': '：受影響的元件內沒有完整性損失。',
    ': Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact on the impacted component.':
      '：可以修改資料，但攻擊者無法控制修改的後果，或可修改的數量有限。資料修改不會對受影響的元件造成直接、嚴重的影響。',
    ': There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the impacted component. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the impacted component.':
      '：完整性完全喪失，或完全失去保護。例如，攻擊者能修改受影響元件所保護的任何/所有檔案。或者，只能修改部分檔案，但惡意修改會對受影響的元件造成直接、嚴重的後果。',
    'This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the impacted component, this metric refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component. The Base Score is greatest when the consequence to the impacted component is highest.':
      '此指標衡量漏洞遭成功利用時對受影響元件可用性的影響。機密性和完整性影響指標適用於受影響元件所使用資料（例如資訊、檔案）的機密性或完整性損失，而此指標是指受影響元件本身的可用性損失，例如網路服務（如網頁、資料庫、電子郵件）。由於可用性是指資訊資源的可存取性，因此消耗網路頻寬、處理器週期或磁碟空間的攻擊，都會影響受影響元件的可用性。對受影響元件造成的後果最嚴重時，基本分數最高。',
    ': There is no impact to availability within the impacted component.': '：受影響元件內的可用性不受影響。',
    ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the impacted component are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the impacted component.':
      '：效能降低，或資源可用性中斷。即使可以重複利用此漏洞，攻擊者也無法對合法使用者完全阻斷服務。受影響元件中的資源可能始終部分可用，或只在部分時間完全可用，但整體而言不會對受影響的元件造成直接、嚴重的後果。',
    ': There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the impacted component; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the impacted component (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).':
      '：可用性完全喪失，導致攻擊者能完全拒絕對受影響元件中資源的存取；這種損失可能是持續性的（攻擊者持續發動攻擊期間），也可能是持久性的（即使攻擊結束後，狀況仍持續存在）。或者，攻擊者能使部分可用性喪失，但可用性損失會對受影響的元件造成直接、嚴重的後果（例如攻擊者無法中斷現有連線，但能阻止新的連線；攻擊者可重複利用某個漏洞，每次成功攻擊只會洩漏少量記憶體，但重複利用後會導致服務完全無法使用）。',

    // v4.0 取值说明
    ': The vulnerable system is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed “remotely exploitable” and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers).':
      '：有漏洞的系統繫結於網路堆疊，可能的攻擊者範圍超出下列其他選項，最遠可達整個網際網路。此類漏洞通常稱為「可遠端利用」，可視為能在協定層級跨越一或多個網路躍點（例如經過一或多個路由器）加以利用的攻擊。',
    ': The vulnerable system is bound to a protocol stack, but the attack is limited at the protocol level to a logically adjacent topology. This can mean an attack must be launched from the same shared proximity (e.g., Bluetooth, NFC, or IEEE 802.11) or logical network (e.g., local IP subnet), or from within a secure or otherwise limited administrative domain (e.g., MPLS, secure VPN within an administrative network zone).':
      '：有漏洞的系統繫結於協定堆疊，但攻擊在協定層級僅限於邏輯上相鄰的拓撲。這可能表示攻擊必須從同一個共用的鄰近範圍（例如藍牙、NFC 或 IEEE 802.11）或邏輯網路（例如本機 IP 子網路）發動，或從安全或以其他方式受限的管理網域內發動（例如 MPLS、管理網路區域內的安全 VPN）。',
    ": The vulnerable system is not bound to the network stack and the attacker's path is via read/write/execute capabilities. Either the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or through terminal emulation (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).":
      '：有漏洞的系統未繫結於網路堆疊，攻擊者的攻擊途徑是讀取/寫入/執行能力。攻擊者可能從本機（例如鍵盤、主控台）或透過終端機模擬（例如 SSH）存取目標系統來利用漏洞；也可能仰賴他人的使用者互動來執行利用漏洞所需的動作（例如利用社交工程手法誘騙合法使用者開啟惡意文件）。',
    ': The vulnerable system is not bound to the network stack and the attacker’s path is via read/write/execute capabilities. Either the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or through terminal emulation (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).':
      '：有漏洞的系統未繫結於網路堆疊，攻擊者的攻擊途徑是讀取/寫入/執行能力。攻擊者可能從本機（例如鍵盤、主控台）或透過終端機模擬（例如 SSH）存取目標系統來利用漏洞；也可能仰賴他人的使用者互動來執行利用漏洞所需的動作（例如利用社交工程手法誘騙合法使用者開啟惡意文件）。',
    ': The attack requires the attacker to physically touch or manipulate the vulnerable system. Physical interaction may be brief (e.g., evil maid attack) or persistent.':
      '：攻擊需要攻擊者以實體方式碰觸或操作有漏洞的系統。實體互動可能是短暫的（例如邪惡女僕攻擊），也可能是持續的。',
    // 原文结尾多了一个引号，译文随原文：句号后跟右引号「」」（check:locale 不把引号算作结尾标点）
    ': The attacker must take no measurable action to exploit the vulnerability. The attack requires no target-specific circumvention to exploit the vulnerability. An attacker can expect repeatable success against the vulnerable system."':
      '：攻擊者不需要採取任何可衡量的動作就能利用漏洞。攻擊不需要針對特定目標的規避手段就能利用漏洞。攻擊者攻擊有漏洞的系統時，可預期能重複成功。」',
    ': The successful attack depends on the evasion or circumvention of security-enhancing techniques in place that would otherwise hinder the attack. These include: Evasion of exploit mitigation techniques, for example, circumvention of address space randomization (ASLR) or data execution prevention (DEP) must be performed for the attack to be successful; Obtaining target-specific secrets. The attacker must gather some target-specific secret before the attack can be successful. A secret is any piece of information that cannot be obtained through any amount of reconnaissance. To obtain the secret the attacker must perform additional attacks or break otherwise secure measures (e.g. knowledge of a secret key may be needed to break a crypto channel). This operation must be performed for each attacked target.':
      '：攻擊能否成功，取決於能否規避或繞過現有的安全強化技術，這些技術原本會阻礙攻擊。包括：規避漏洞利用緩解技術，例如必須繞過位址空間隨機化 (ASLR) 或資料執行防止 (DEP) 才能成功攻擊；取得特定目標的機密。攻擊者必須先收集某些特定目標的機密，攻擊才能成功。機密是指無論偵察多少都無法取得的任何資訊。攻擊者必須發動額外攻擊或突破原本安全的措施才能取得機密（例如可能需要知道祕密金鑰才能破解加密通道）。每個受攻擊的目標都必須執行此程序。',
    ': The successful attack does not depend on the deployment and execution conditions of the vulnerable system. The attacker can expect to be able to reach the vulnerability and execute the exploit under all or most instances of the vulnerability.':
      '：攻擊能否成功，不取決於有漏洞系統的部署和執行條件。攻擊者可預期在該漏洞的所有或大多數情況下，都能觸及漏洞並執行漏洞利用程式。',
    ': The successful attack depends on the presence of specific deployment and execution conditions of the vulnerable system that enable the attack. These include: a race condition must be won to successfully exploit the vulnerability (the successfulness of the attack is conditioned on execution conditions that are not under full control of the attacker, or the attack may need to be launched multiple times against a single target before being successful); the attacker must inject themselves into the logical network path between the target and the resource requested by the victim (e.g. vulnerabilities requiring an on-path attacker).':
      '：攻擊能否成功，取決於有漏洞的系統是否具備能讓攻擊得逞的特定部署和執行條件。包括：必須贏得競爭條件才能成功利用漏洞（攻擊能否成功，取決於攻擊者無法完全掌控的執行條件，或可能需要對單一目標多次發動攻擊才能成功）；攻擊者必須介入目標和受害者所要求資源之間的邏輯網路路徑（例如需要中間人攻擊者的漏洞）。',
    ': The attacker requires privileges that provide basic capabilities that are typically limited to settings and resources owned by a single low-privileged user. Alternatively, an attacker with Low privileges has the ability to access only non-sensitive resources.':
      '：攻擊者需要具備基本能力的權限，這些能力通常僅限於單一低權限使用者擁有的設定和資源。或者，具有低權限的攻擊者只能存取非敏感資源。',
    ": The attacker requires privileges that provide significant (e.g., administrative) control over the vulnerable system allowing full access to the vulnerable system's settings and files.":
      '：攻擊者需要的權限能對有漏洞的系統提供重大（例如管理層級的）控制權，可完整存取有漏洞系統的設定和檔案。',
    ': The vulnerable system can be exploited without interaction from any human user, other than the attacker.':
      '：不需要攻擊者以外任何人類使用者的互動，就能利用有漏洞的系統。',
    ": Successful exploitation of this vulnerability requires limited interaction by the targeted user with the vulnerable system and the attacker's payload. These interactions would be considered involuntary and do not require that the user actively subvert protections built into the vulnerable system.":
      '：成功利用此漏洞需要目標使用者與有漏洞的系統和攻擊者的酬載有限度地互動。這些互動視為非自願，且不需要使用者主動破壞有漏洞系統內建的保護。',
    ": Successful exploitation of this vulnerability requires a targeted user to perform specific, conscious interactions with the vulnerable system and the attacker's payload, or the user's interactions would actively subvert protection mechanisms which would lead to exploitation of the vulnerability.":
      '：成功利用此漏洞需要目標使用者以特定、有意識的方式與有漏洞的系統和攻擊者的酬載互動，或使用者的互動會主動破壞保護機制，進而導致漏洞遭到利用。',
    ": There is a total loss of confidentiality, resulting in all information within the Vulnerable System being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact. For example, an attacker steals the administrator's password, or private encryption keys of a web server.":
      '：機密性完全喪失，導致有漏洞系統內的所有資訊都洩漏給攻擊者。或者，攻擊者只取得部分受限資訊，但洩漏的資訊會造成直接、嚴重的影響。例如，攻擊者竊取了管理員的密碼或網頁伺服器的私密加密金鑰。',
    ': There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the Vulnerable System.':
      '：有部分機密性損失。攻擊者可取得部分受限資訊，但無法控制取得哪些資訊，或損失的數量或種類有限。資訊洩漏不會對有漏洞的系統造成直接、嚴重的損失。',
    ': There is no loss of confidentiality within the Vulnerable System.': '：有漏洞的系統內沒有機密性損失。',
    ': There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the vulnerable system. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the vulnerable system.':
      '：完整性完全喪失，或完全失去保護。例如，攻擊者能修改有漏洞系統所保護的任何/所有檔案。或者，只能修改部分檔案，但惡意修改會對有漏洞的系統造成直接、嚴重的後果。',
    ': Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact to the Vulnerable System.':
      '：可以修改資料，但攻擊者無法控制修改的後果，或可修改的數量有限。資料修改不會對有漏洞的系統造成直接、嚴重的影響。',
    ': There is no loss of integrity within the Vulnerable System.': '：有漏洞的系統內沒有完整性損失。',
    ': There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the Vulnerable System; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the Vulnerable System (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).':
      '：可用性完全喪失，導致攻擊者能完全拒絕對有漏洞系統中資源的存取；這種損失可能是持續性的（攻擊者持續發動攻擊期間），也可能是持久性的（即使攻擊結束後，狀況仍持續存在）。或者，攻擊者能使部分可用性喪失，但可用性損失會對有漏洞的系統造成直接、嚴重的後果（例如攻擊者無法中斷現有連線，但能阻止新的連線；攻擊者可重複利用某個漏洞，每次成功攻擊只會洩漏少量記憶體，但重複利用後會導致服務完全無法使用）。',
    ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the Vulnerable System are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the Vulnerable System.':
      '：效能降低，或資源可用性中斷。即使可以重複利用此漏洞，攻擊者也無法對合法使用者完全阻斷服務。有漏洞系統中的資源可能始終部分可用，或只在部分時間完全可用，但整體而言不會對有漏洞的系統造成直接、嚴重的後果。',
    ': There is no impact to availability within the Vulnerable System.': '：有漏洞系統內的可用性不受影響。',
    ": There is a total loss of confidentiality, resulting in all resources within the Subsequent System being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact. For example, an attacker steals the administrator's password, or private encryption keys of a web server.":
      '：機密性完全喪失，導致後續系統內的所有資源都洩漏給攻擊者。或者，攻擊者只取得部分受限資訊，但洩漏的資訊會造成直接、嚴重的影響。例如，攻擊者竊取了管理員的密碼或網頁伺服器的私密加密金鑰。',
    ': There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the Subsequent System.':
      '：有部分機密性損失。攻擊者可取得部分受限資訊，但無法控制取得哪些資訊，或損失的數量或種類有限。資訊洩漏不會對後續系統造成直接、嚴重的損失。',
    ': There is no loss of confidentiality within the Subsequent System or all confidentiality impact is constrained to the Vulnerable System.':
      '：後續系統內沒有機密性損失，或所有機密性影響都侷限於有漏洞的系統。',
    ': There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the Subsequent System. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the Subsequent System.':
      '：完整性完全喪失，或完全失去保護。例如，攻擊者能修改後續系統所保護的任何/所有檔案。或者，只能修改部分檔案，但惡意修改會對後續系統造成直接、嚴重的後果。',
    ': Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact to the Subsequent System.':
      '：可以修改資料，但攻擊者無法控制修改的後果，或可修改的數量有限。資料修改不會對後續系統造成直接、嚴重的影響。',
    ': There is no loss of integrity within the Subsequent System or all integrity impact is constrained to the Vulnerable System.':
      '：後續系統內沒有完整性損失，或所有完整性影響都侷限於有漏洞的系統。',
    ': There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the Subsequent System; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the Subsequent System (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).':
      '：可用性完全喪失，導致攻擊者能完全拒絕對後續系統中資源的存取；這種損失可能是持續性的（攻擊者持續發動攻擊期間），也可能是持久性的（即使攻擊結束後，狀況仍持續存在）。或者，攻擊者能使部分可用性喪失，但可用性損失會對後續系統造成直接、嚴重的後果（例如攻擊者無法中斷現有連線，但能阻止新的連線；攻擊者可重複利用某個漏洞，每次成功攻擊只會洩漏少量記憶體，但重複利用後會導致服務完全無法使用）。',
    ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the Subsequent System are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the Subsequent System.':
      '：效能降低，或資源可用性中斷。即使可以重複利用此漏洞，攻擊者也無法對合法使用者完全阻斷服務。後續系統中的資源可能始終部分可用，或只在部分時間完全可用，但整體而言不會對後續系統造成直接、嚴重的後果。',
    ': There is no impact to availability within the Subsequent System or all availability impact is constrained to the Vulnerable System.':
      '：後續系統內的可用性不受影響，或所有可用性影響都侷限於有漏洞的系統。',

    // v4.0 指标定义（规范原文）
    'This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the resulting severity) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable system. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater severity.':
      '此指標反映可能利用漏洞的情境。攻擊者能在越遠的位置（邏輯上和實體上）利用有漏洞的系統，此指標值（連同由此得出的嚴重性）就越大。此處假設可跨網路利用的漏洞，其潛在攻擊者多於需要實體存取裝置才能利用的漏洞，因此應給予較高的嚴重性。',
    'This metric captures measurable actions that must be taken by the attacker to actively evade or circumvent existing built-in security-enhancing conditions in order to obtain a working exploit. These are conditions whose primary purpose is to increase security and/or increase exploit engineering complexity. A vulnerability exploitable without a target-specific variable has a lower complexity than a vulnerability that would require non-trivial customization. This metric is meant to capture security mechanisms utilized by the vulnerable system.':
      '此指標衡量攻擊者為取得可用的漏洞利用程式，主動規避或繞過現有內建安全強化條件時必須採取的可衡量動作。這些條件的主要目的是提高安全性和/或增加漏洞利用程式的開發複雜度。不需要特定目標變數就能利用的漏洞，複雜度低於需要相當程度自訂的漏洞。此指標旨在反映有漏洞的系統所採用的安全機制。',
    'This metric captures the prerequisite deployment and execution conditions or variables of the vulnerable system that enable the attack. These differ from security-enhancing techniques/technologies (ref Attack Complexity) as the primary purpose of these conditions is not to explicitly mitigate attacks, but rather, emerge naturally as a consequence of the deployment and execution of the vulnerable system.':
      '此指標衡量有漏洞的系統中，讓攻擊得以發動的先決部署和執行條件或變數。這些條件不同於安全強化技術（參見攻擊複雜度），並非以明確緩解攻擊為主要目的，而是隨著有漏洞系統的部署和執行而自然產生。',
    'This metric describes the level of privileges an attacker must possess prior to successfully exploiting the vulnerability. The method by which the attacker obtains privileged credentials prior to the attack (e.g., free trial accounts), is outside the scope of this metric. Generally, self-service provisioned accounts do not constitute a privilege requirement if the attacker can grant themselves privileges as part of the attack.':
      '此指標描述攻擊者成功利用漏洞前必須擁有的權限層級。攻擊者在攻擊前取得特權認證資訊的方式（例如免費試用帳號）不在此指標的範圍內。一般而言，如果攻擊者能在攻擊過程中自行授予權限，則自助佈建的帳號不構成權限要求。',
    'This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable system. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner.':
      '此指標衡量成功入侵有漏洞的系統時，是否需要攻擊者以外的人類使用者參與。此指標決定漏洞能否完全依攻擊者的意願加以利用，或是否必須有另一位使用者（或由使用者啟動的處理程序）以某種方式參與。',
    'This metric measures the impact to the confidentiality of the information managed by the VULNERABLE SYSTEM due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.':
      '此指標衡量漏洞遭成功利用時，對有漏洞系統所管理資訊的機密性影響。機密性是指將資訊的存取和揭露限於獲授權的使用者，並防止未獲授權者存取資訊或向其揭露資訊。',
    'This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. Integrity of the VULNERABLE SYSTEM is impacted when an attacker makes unauthorized modification of system data. Integrity is also impacted when a system user can repudiate critical actions taken in the context of the system (e.g. due to insufficient logging).':
      '此指標衡量漏洞遭成功利用時對完整性的影響。完整性是指資訊的可信度和真實性。攻擊者未經授權修改系統資料時，有漏洞系統的完整性就會受到影響。系統使用者能否認在系統中執行過的關鍵動作時（例如因記錄不足），完整性也會受到影響。',
    'This metric measures the impact to the availability of the VULNERABLE SYSTEM resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the system, this metric refers to the loss of availability of the impacted system itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system.':
      '此指標衡量漏洞遭成功利用時對有漏洞系統可用性的影響。機密性和完整性影響指標適用於系統所使用資料（例如資訊、檔案）的機密性或完整性損失，而此指標是指受影響系統本身的可用性損失，例如網路服務（如網頁、資料庫、電子郵件）。由於可用性是指資訊資源的可存取性，因此消耗網路頻寬、處理器週期或磁碟空間的攻擊，都會影響系統的可用性。',
    'This metric measures the impact to the confidentiality of the information managed by the SUBSEQUENT SYSTEM due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.':
      '此指標衡量漏洞遭成功利用時，對後續系統所管理資訊的機密性影響。機密性是指將資訊的存取和揭露限於獲授權的使用者，並防止未獲授權者存取資訊或向其揭露資訊。',
    'This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. Integrity of the SUBSEQUENT SYSTEM is impacted when an attacker makes unauthorized modification of system data. Integrity is also impacted when a system user can repudiate critical actions taken in the context of the system (e.g. due to insufficient logging).':
      '此指標衡量漏洞遭成功利用時對完整性的影響。完整性是指資訊的可信度和真實性。攻擊者未經授權修改系統資料時，後續系統的完整性就會受到影響。系統使用者能否認在系統中執行過的關鍵動作時（例如因記錄不足），完整性也會受到影響。',
    'This metric measures the impact to the availability of the SUBSEQUENT SYSTEM resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the system, this metric refers to the loss of availability of the impacted system itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system.':
      '此指標衡量漏洞遭成功利用時對後續系統可用性的影響。機密性和完整性影響指標適用於系統所使用資料（例如資訊、檔案）的機密性或完整性損失，而此指標是指受影響系統本身的可用性損失，例如網路服務（如網頁、資料庫、電子郵件）。由於可用性是指資訊資源的可存取性，因此消耗網路頻寬、處理器週期或磁碟空間的攻擊，都會影響系統的可用性。'
  },
  regexp: [
    // 取值按钮的 aria-label：Attack Vector - Network
    [new RegExp(`^${METRIC_SOURCE} - ${VALUE_SOURCE}$`), (_, metric: string, value: string) => `${METRIC[metric]} - ${VALUE[value]}`],
    // v4：Attack Vector (AV) - Network (N)
    [
      new RegExp(`^${METRIC_SOURCE} \\(${ABBR_SOURCE}\\) - ${VALUE_SOURCE} \\(([A-Z])\\)$`),
      (_, metric: string, abbr: string, value: string, letter: string) => `${METRIC[metric]} (${abbr}) - ${VALUE[value]} (${letter})`
    ],
    // v4 指标标题：Attack Vector (AV)
    [new RegExp(`^${METRIC_SOURCE} \\(${ABBR_SOURCE}\\)$`), (_, metric: string, abbr: string) => `${METRIC[metric]} (${abbr})`],
    // v4 取值：Network (N)
    [new RegExp(`^${VALUE_SOURCE} \\(([A-Z])\\)$`), (_, value: string, letter: string) => `${VALUE[value]} (${letter})`]
  ]
} satisfies PageDictionary
