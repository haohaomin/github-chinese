import type { PageDictionary } from '../../../core/types'

/** CVSS 指标名（计算器按钮的 aria-label、v4 指标标题） */
const METRIC: Readonly<Record<string, string>> = {
  'Attack Vector': '攻击向量',
  'Attack Complexity': '攻击复杂度',
  'Attack Requirements': '攻击要求',
  'Privileges Required': '所需权限',
  'User Interaction': '用户交互',
  Scope: '范围',
  Confidentiality: '机密性',
  Integrity: '完整性',
  Availability: '可用性'
}

/** CVSS 指标取值 */
const VALUE: Readonly<Record<string, string>> = {
  Network: '网络',
  Adjacent: '相邻',
  Local: '本地',
  Physical: '物理',
  Low: '低',
  High: '高',
  None: '无',
  Required: '需要',
  Unchanged: '未改变',
  Changed: '已改变',
  Present: '存在',
  Passive: '被动',
  Active: '主动'
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
 */
export default {
  static: {
    // 分组与链接
    'Exploitability metrics': '可利用性指标',
    'Vulnerable system impact metrics': '漏洞系统影响指标',
    'Subsequent system impact metrics': '后续系统影响指标',
    'Learn more about attack vector': '了解攻击向量',
    'Learn more about attack complexity': '了解攻击复杂度',
    'Learn more about attack requirements': '了解攻击要求',
    'Learn more about privileges required': '了解所需权限',
    'Learn more about user interaction': '了解用户交互',
    'Learn more about scope': '了解范围',
    'Learn more about confidentiality': '了解机密性',
    'Learn more about integrity': '了解完整性',
    'Learn more about availability': '了解可用性',
    'Attack Vector:': '攻击向量：',
    'Attack Complexity:': '攻击复杂度：',
    'Attack Requirements:': '攻击要求：',
    'Privileges Required:': '所需权限：',
    'User Interaction:': '用户交互：',

    // v3.1 取值说明
    'This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the Base Score) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater Base Score.':
      '此指标反映漏洞可被利用的环境。攻击者利用存在漏洞的组件时所处位置（逻辑上和物理上）越远，此指标值（以及由此得出的基本分数）越大。可跨网络利用的漏洞的潜在攻击者数量多于需要物理接触设备才能利用的漏洞，因此基本分数更高。',
    ': The vulnerable component is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed "remotely exploitable" and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers).':
      '：存在漏洞的组件绑定在网络协议栈上且可能的攻击者范围超出下列其他选项，最远可达整个互联网。此类漏洞通常称为“可远程利用”并可视为在协议层面跨越一个或多个网络跃点（例如经过一个或多个路由器）即可利用。',
    ': The vulnerable component is bound to the network stack, but the attack is limited at the protocol level to a logically adjacent topology. This can mean an attack must be launched from the same shared physical (e.g., Bluetooth or IEEE 802.11) or logical (e.g., local IP subnet) network, or from within a secure or otherwise limited administrative domain (e.g., MPLS, secure VPN to an administrative network zone).':
      '：存在漏洞的组件绑定在网络协议栈上，但攻击在协议层面仅限于逻辑上相邻的拓扑。这意味着攻击必须从同一共享的物理网络（例如蓝牙或 IEEE 802.11）或逻辑网络（例如本地 IP 子网）发起，或从安全或受限的管理域内发起（例如 MPLS、连接到管理网络区域的安全 VPN）。',
    ": The vulnerable component is not bound to the network stack and the attacker's path is via read/write/execute capabilities. Either: the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or remotely (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).":
      '：存在漏洞的组件未绑定到网络协议栈，攻击者通过读取、写入或执行能力实施攻击。满足以下任一情况：攻击者通过本地（例如键盘、控制台）或远程（例如 SSH）访问目标系统来利用漏洞；或者攻击者依赖他人进行用户交互，执行利用漏洞所需的操作（例如利用社会工程手段诱骗合法用户打开恶意文档）。',
    ': The vulnerable component is not bound to the network stack and the attacker’s path is via read/write/execute capabilities. Either: the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or remotely (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).':
      '：存在漏洞的组件未绑定到网络协议栈，攻击者通过读取、写入或执行能力实施攻击。满足以下任一情况：攻击者通过本地（例如键盘、控制台）或远程（例如 SSH）访问目标系统来利用漏洞；或者攻击者依赖他人进行用户交互，执行利用漏洞所需的操作（例如利用社会工程手段诱骗合法用户打开恶意文档）。',
    ': The attack requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief (e.g., evil maid attack1) or persistent.':
      '：攻击需要攻击者实际接触或操作存在漏洞的组件。物理交互可能是短暂的（例如邪恶女仆攻击），也可能是持续的。',
    "This metric describes the conditions beyond the attacker's control that must exist in order to exploit the vulnerability. As described below, such conditions may require the collection of more information about the target, or computational exceptions. Importantly, the assessment of this metric excludes any requirements for user interaction in order to exploit the vulnerability (such conditions are captured in the User Interaction metric). If a specific configuration is required for an attack to succeed, the Base metrics should be scored assuming the vulnerable component is in that configuration. The Base Score is greatest for the least complex attacks.":
      '此指标描述利用漏洞时必须存在且攻击者无法控制的条件。如下所述，这些条件可能需要收集更多目标信息，或依赖计算异常。重要的是，此指标的评估不包括利用漏洞所需的任何用户交互（此类条件由用户交互指标衡量）。如果攻击成功需要特定配置，应假定存在漏洞的组件处于该配置下来评定基本指标。攻击最简单时基本分数最高。',
    'This metric describes the conditions beyond the attacker’s control that must exist in order to exploit the vulnerability. As described below, such conditions may require the collection of more information about the target, or computational exceptions. Importantly, the assessment of this metric excludes any requirements for user interaction in order to exploit the vulnerability (such conditions are captured in the User Interaction metric). If a specific configuration is required for an attack to succeed, the Base metrics should be scored assuming the vulnerable component is in that configuration. The Base Score is greatest for the least complex attacks.':
      '此指标描述利用漏洞时必须存在且攻击者无法控制的条件。如下所述，这些条件可能需要收集更多目标信息，或依赖计算异常。重要的是，此指标的评估不包括利用漏洞所需的任何用户交互（此类条件由用户交互指标衡量）。如果攻击成功需要特定配置，应假定存在漏洞的组件处于该配置下来评定基本指标。攻击最简单时基本分数最高。',
    ': Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success when attacking the vulnerable component.':
      '：不存在特殊的访问条件或特殊情况。攻击者攻击存在漏洞的组件时可预期反复成功。',
    ": A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected.":
      '：攻击能否成功取决于攻击者无法控制的条件。也就是说，攻击无法随意得手，攻击者须针对存在漏洞的组件在准备或执行上投入一定的可衡量精力才能预期攻击成功。',
    'This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. The Base Score is greatest if no privileges are required.':
      '此指标描述攻击者在成功利用漏洞前必须拥有的权限级别。无需任何权限时基本分数最高。',
    ': The attacker is unauthorized prior to attack, and therefore does not require any access to settings or files of the vulnerable system to carry out an attack.':
      '：攻击者在攻击前未经授权，因此实施攻击时无需访问漏洞系统的任何设置或文件。',
    ': The attacker requires privileges that provide basic user capabilities that could normally affect only settings and files owned by a user. Alternatively, an attacker with Low privileges has the ability to access only non-sensitive resources.':
      '：攻击者所需权限提供的基本用户能力通常只能影响用户自己拥有的设置和文件。或者，拥有低权限的攻击者只能访问非敏感资源。',
    ': The attacker requires privileges that provide significant (e.g., administrative) control over the vulnerable component allowing access to component-wide settings and files.':
      '：攻击者需要对存在漏洞的组件拥有重要控制权（例如管理权限），可访问整个组件的设置和文件。',
    'This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is greatest when no user interaction is required.':
      '此指标衡量成功攻破存在漏洞的组件是否需要攻击者以外的人类用户参与。它决定漏洞能否仅凭攻击者的意愿被利用，还是需要其他用户（或用户发起的进程）以某种方式参与。无需用户交互时基本分数最高。',
    ': The vulnerable system can be exploited without interaction from any user.': '：无需任何用户交互即可利用漏洞系统。',
    ': Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited.':
      '：成功利用此漏洞需要用户先执行某些操作。',
    ': An exploited vulnerability can only affect resources managed by the same security authority. In this case, the vulnerable component and the impacted component are either the same, or both are managed by the same security authority.':
      '：被利用的漏洞只能影响由同一安全机构管理的资源。此时，存在漏洞的组件与受影响的组件相同，或二者由同一安全机构管理。',
    ': An exploited vulnerability can affect resources beyond the security scope managed by the security authority of the vulnerable component. In this case, the vulnerable component and the impacted component are different and managed by different security authorities.':
      '：被利用的漏洞可影响存在漏洞组件的安全机构所管理安全范围之外的资源。此时，存在漏洞的组件与受影响的组件不同且由不同的安全机构管理。',
    'This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones. The Base Score is greatest when the loss to the impacted component is highest.':
      '此指标衡量漏洞被成功利用后，对软件组件所管理信息资源的机密性影响。机密性指仅允许授权用户访问和披露信息，并阻止未授权用户访问或向其披露信息。受影响组件的损失最大时基本分数最高。',
    ': There is no loss of confidentiality within the impacted component.': '：受影响组件内没有机密性损失。',
    ': There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the impacted component.':
      '：存在一定的机密性损失。攻击者可获取部分受限信息，但无法控制获取哪些信息，或损失的数量和类型有限。信息泄露不会对受影响组件造成直接、严重的损失。',
    ': There is a total loss of confidentiality, resulting in all resources within the impacted component being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact.':
      '：机密性完全丧失，受影响组件内的所有资源都会泄露给攻击者。或者，攻击者只获取了部分受限信息，但泄露的信息会造成直接、严重的影响。',
    'This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. The Base Score is greatest when the consequence to the impacted component is highest.':
      '此指标衡量漏洞被成功利用后对完整性的影响。完整性指信息的可信度与真实性。对受影响组件造成的后果最严重时基本分数最高。',
    ': There is no loss of integrity within the impacted component.': '：受影响组件内没有完整性损失。',
    ': Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact on the impacted component.':
      '：可以修改数据，但攻击者无法控制修改的后果，或可修改的数量有限。数据修改不会对受影响组件造成直接、严重的影响。',
    ': There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the impacted component. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the impacted component.':
      '：完整性完全丧失，或保护完全失效。例如，攻击者能够修改受影响组件保护的任意或全部文件。或者，只能修改部分文件，但恶意修改会对受影响组件造成直接、严重的后果。',
    'This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the impacted component, this metric refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component. The Base Score is greatest when the consequence to the impacted component is highest.':
      '此指标衡量漏洞被成功利用后对受影响组件可用性的影响。机密性与完整性影响指标针对受影响组件所用数据（例如信息、文件）的机密性或完整性损失，而此指标针对受影响组件本身的可用性损失，例如网络服务（如 Web、数据库、电子邮件）。可用性指信息资源的可访问性，因此消耗网络带宽、处理器周期或磁盘空间的攻击都会影响受影响组件的可用性。对受影响组件造成的后果最严重时基本分数最高。',
    ': There is no impact to availability within the impacted component.': '：受影响组件内的可用性不受影响。',
    ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the impacted component are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the impacted component.':
      '：性能下降或资源可用性中断。即使可以反复利用漏洞，攻击者也无法完全拒绝向合法用户提供服务。受影响组件中的资源要么始终部分可用，要么仅在部分时间完全可用，但总体上不会对受影响组件造成直接、严重的后果。',
    ': There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the impacted component; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the impacted component (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).':
      '：可用性完全丧失，攻击者能够完全拒绝对受影响组件中资源的访问；这种损失要么是持续性的（攻击者持续发起攻击期间），要么是持久性的（攻击结束后状况依然存在）。或者，攻击者能够拒绝部分可用性，但可用性损失会对受影响组件造成直接、严重的后果（例如攻击者无法中断现有连接，但可以阻止新连接；攻击者可以反复利用某个漏洞，每次成功攻击只泄漏少量内存，但反复利用后会导致服务完全不可用）。',

    // v4.0 取值说明
    ': The vulnerable system is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed “remotely exploitable” and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers).':
      '：漏洞系统绑定在网络协议栈上且可能的攻击者范围超出下列其他选项，最远可达整个互联网。此类漏洞通常称为“可远程利用”并可视为在协议层面跨越一个或多个网络跃点（例如经过一个或多个路由器）即可利用。',
    ': The vulnerable system is bound to a protocol stack, but the attack is limited at the protocol level to a logically adjacent topology. This can mean an attack must be launched from the same shared proximity (e.g., Bluetooth, NFC, or IEEE 802.11) or logical network (e.g., local IP subnet), or from within a secure or otherwise limited administrative domain (e.g., MPLS, secure VPN within an administrative network zone).':
      '：漏洞系统绑定在协议栈上，但攻击在协议层面仅限于逻辑上相邻的拓扑。这意味着攻击必须从同一共享近距离范围（例如蓝牙、NFC 或 IEEE 802.11）或同一逻辑网络（例如本地 IP 子网）内发起，或从安全或受限的管理域内发起（例如 MPLS、管理网络区域内的安全 VPN）。',
    ": The vulnerable system is not bound to the network stack and the attacker's path is via read/write/execute capabilities. Either the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or through terminal emulation (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).":
      '：漏洞系统未绑定到网络协议栈，攻击者通过读取、写入或执行能力实施攻击。攻击者要么通过本地（例如键盘、控制台）或终端仿真（例如 SSH）访问目标系统来利用漏洞；要么依赖他人进行用户交互，执行利用漏洞所需的操作（例如利用社会工程手段诱骗合法用户打开恶意文档）。',
    ': The vulnerable system is not bound to the network stack and the attacker’s path is via read/write/execute capabilities. Either the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or through terminal emulation (e.g., SSH); or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).':
      '：漏洞系统未绑定到网络协议栈，攻击者通过读取、写入或执行能力实施攻击。攻击者要么通过本地（例如键盘、控制台）或终端仿真（例如 SSH）访问目标系统来利用漏洞；要么依赖他人进行用户交互，执行利用漏洞所需的操作（例如利用社会工程手段诱骗合法用户打开恶意文档）。',
    ': The attack requires the attacker to physically touch or manipulate the vulnerable system. Physical interaction may be brief (e.g., evil maid attack) or persistent.':
      '：攻击需要攻击者实际接触或操作漏洞系统。物理交互可能是短暂的（例如邪恶女仆攻击），也可能是持续的。',
    // 原文结尾多了一个引号，译文随原文：句号后跟右引号（check:locale 不把引号算作结尾标点）
    ': The attacker must take no measurable action to exploit the vulnerability. The attack requires no target-specific circumvention to exploit the vulnerability. An attacker can expect repeatable success against the vulnerable system."':
      '：攻击者无需采取任何可衡量的行动即可利用漏洞。攻击无需针对目标进行特定规避即可利用漏洞。攻击者针对漏洞系统可预期反复成功。”',
    ': The successful attack depends on the evasion or circumvention of security-enhancing techniques in place that would otherwise hinder the attack. These include: Evasion of exploit mitigation techniques, for example, circumvention of address space randomization (ASLR) or data execution prevention (DEP) must be performed for the attack to be successful; Obtaining target-specific secrets. The attacker must gather some target-specific secret before the attack can be successful. A secret is any piece of information that cannot be obtained through any amount of reconnaissance. To obtain the secret the attacker must perform additional attacks or break otherwise secure measures (e.g. knowledge of a secret key may be needed to break a crypto channel). This operation must be performed for each attacked target.':
      '：攻击能否成功取决于能否规避或绕过本会阻碍攻击的现有安全增强技术。包括：规避漏洞利用缓解技术，例如必须绕过地址空间随机化 (ASLR) 或数据执行保护 (DEP) 才能成功攻击；获取目标特定的机密。攻击者必须先收集某些目标特定的机密才能成功攻击。机密是指无论进行多少侦察都无法获得的信息。攻击者必须实施额外攻击或突破其他安全措施才能获取机密（例如可能需要知道密钥才能破解加密通道）。每个攻击目标都必须执行此操作。',
    ': The successful attack does not depend on the deployment and execution conditions of the vulnerable system. The attacker can expect to be able to reach the vulnerability and execute the exploit under all or most instances of the vulnerability.':
      '：攻击成功与否不取决于漏洞系统的部署和执行条件。攻击者可预期在该漏洞的全部或大多数实例中触及漏洞并执行利用。',
    ': The successful attack depends on the presence of specific deployment and execution conditions of the vulnerable system that enable the attack. These include: a race condition must be won to successfully exploit the vulnerability (the successfulness of the attack is conditioned on execution conditions that are not under full control of the attacker, or the attack may need to be launched multiple times against a single target before being successful); the attacker must inject themselves into the logical network path between the target and the resource requested by the victim (e.g. vulnerabilities requiring an on-path attacker).':
      '：攻击能否成功取决于漏洞系统是否存在使攻击得以实施的特定部署和执行条件。包括：必须赢得竞争条件才能成功利用漏洞（攻击能否成功取决于攻击者无法完全控制的执行条件，或者可能需要对单个目标多次发起攻击才能成功）；攻击者必须将自己插入目标与受害者所请求资源之间的逻辑网络路径（例如需要中间人攻击的漏洞）。',
    ': The attacker requires privileges that provide basic capabilities that are typically limited to settings and resources owned by a single low-privileged user. Alternatively, an attacker with Low privileges has the ability to access only non-sensitive resources.':
      '：攻击者所需权限提供的基本能力通常仅限于单个低权限用户拥有的设置和资源。或者，拥有低权限的攻击者只能访问非敏感资源。',
    ": The attacker requires privileges that provide significant (e.g., administrative) control over the vulnerable system allowing full access to the vulnerable system's settings and files.":
      '：攻击者需要对漏洞系统拥有重要控制权（例如管理权限），可完全访问漏洞系统的设置和文件。',
    ': The vulnerable system can be exploited without interaction from any human user, other than the attacker.':
      '：除攻击者外，无需任何人类用户交互即可利用漏洞系统。',
    ": Successful exploitation of this vulnerability requires limited interaction by the targeted user with the vulnerable system and the attacker's payload. These interactions would be considered involuntary and do not require that the user actively subvert protections built into the vulnerable system.":
      '：成功利用此漏洞需要目标用户与漏洞系统及攻击者的载荷进行有限的交互。这些交互被视为非自愿交互且不要求用户主动绕过漏洞系统内置的保护。',
    ": Successful exploitation of this vulnerability requires a targeted user to perform specific, conscious interactions with the vulnerable system and the attacker's payload, or the user's interactions would actively subvert protection mechanisms which would lead to exploitation of the vulnerability.":
      '：成功利用此漏洞需要目标用户与漏洞系统及攻击者的载荷进行特定的、有意识的交互，或用户的交互会主动绕过保护机制，从而导致漏洞被利用。',
    ": There is a total loss of confidentiality, resulting in all information within the Vulnerable System being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact. For example, an attacker steals the administrator's password, or private encryption keys of a web server.":
      '：机密性完全丧失，漏洞系统内的所有信息都会泄露给攻击者。或者，攻击者只获取了部分受限信息，但泄露的信息会造成直接、严重的影响。例如，攻击者窃取了管理员密码或 Web 服务器的加密私钥。',
    ': There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the Vulnerable System.':
      '：存在一定的机密性损失。攻击者可获取部分受限信息，但无法控制获取哪些信息，或损失的数量和类型有限。信息泄露不会对漏洞系统造成直接、严重的损失。',
    ': There is no loss of confidentiality within the Vulnerable System.': '：漏洞系统内没有机密性损失。',
    ': There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the vulnerable system. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the vulnerable system.':
      '：完整性完全丧失，或保护完全失效。例如，攻击者能够修改漏洞系统保护的任意或全部文件。或者，只能修改部分文件，但恶意修改会对漏洞系统造成直接、严重的后果。',
    ': Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact to the Vulnerable System.':
      '：可以修改数据，但攻击者无法控制修改的后果，或可修改的数量有限。数据修改不会对漏洞系统造成直接、严重的影响。',
    ': There is no loss of integrity within the Vulnerable System.': '：漏洞系统内没有完整性损失。',
    ': There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the Vulnerable System; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the Vulnerable System (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).':
      '：可用性完全丧失，攻击者能够完全拒绝对漏洞系统中资源的访问；这种损失要么是持续性的（攻击者持续发起攻击期间），要么是持久性的（攻击结束后状况依然存在）。或者，攻击者能够拒绝部分可用性，但可用性损失会对漏洞系统造成直接、严重的后果（例如攻击者无法中断现有连接，但可以阻止新连接；攻击者可以反复利用某个漏洞，每次成功攻击只泄漏少量内存，但反复利用后会导致服务完全不可用）。',
    ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the Vulnerable System are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the Vulnerable System.':
      '：性能下降或资源可用性中断。即使可以反复利用漏洞，攻击者也无法完全拒绝向合法用户提供服务。漏洞系统中的资源要么始终部分可用，要么仅在部分时间完全可用，但总体上不会对漏洞系统造成直接、严重的后果。',
    ': There is no impact to availability within the Vulnerable System.': '：漏洞系统内的可用性不受影响。',
    ": There is a total loss of confidentiality, resulting in all resources within the Subsequent System being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact. For example, an attacker steals the administrator's password, or private encryption keys of a web server.":
      '：机密性完全丧失，后续系统内的所有资源都会泄露给攻击者。或者，攻击者只获取了部分受限信息，但泄露的信息会造成直接、严重的影响。例如，攻击者窃取了管理员密码或 Web 服务器的加密私钥。',
    ': There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the Subsequent System.':
      '：存在一定的机密性损失。攻击者可获取部分受限信息，但无法控制获取哪些信息，或损失的数量和类型有限。信息泄露不会对后续系统造成直接、严重的损失。',
    ': There is no loss of confidentiality within the Subsequent System or all confidentiality impact is constrained to the Vulnerable System.':
      '：后续系统内没有机密性损失或所有机密性影响都局限于漏洞系统。',
    ': There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the Subsequent System. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the Subsequent System.':
      '：完整性完全丧失，或保护完全失效。例如，攻击者能够修改后续系统保护的任意或全部文件。或者，只能修改部分文件，但恶意修改会对后续系统造成直接、严重的后果。',
    ': Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact to the Subsequent System.':
      '：可以修改数据，但攻击者无法控制修改的后果，或可修改的数量有限。数据修改不会对后续系统造成直接、严重的影响。',
    ': There is no loss of integrity within the Subsequent System or all integrity impact is constrained to the Vulnerable System.':
      '：后续系统内没有完整性损失或所有完整性影响都局限于漏洞系统。',
    ': There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the Subsequent System; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the Subsequent System (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).':
      '：可用性完全丧失，攻击者能够完全拒绝对后续系统中资源的访问；这种损失要么是持续性的（攻击者持续发起攻击期间），要么是持久性的（攻击结束后状况依然存在）。或者，攻击者能够拒绝部分可用性，但可用性损失会对后续系统造成直接、严重的后果（例如攻击者无法中断现有连接，但可以阻止新连接；攻击者可以反复利用某个漏洞，每次成功攻击只泄漏少量内存，但反复利用后会导致服务完全不可用）。',
    ': Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the Subsequent System are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the Subsequent System.':
      '：性能下降或资源可用性中断。即使可以反复利用漏洞，攻击者也无法完全拒绝向合法用户提供服务。后续系统中的资源要么始终部分可用，要么仅在部分时间完全可用，但总体上不会对后续系统造成直接、严重的后果。',
    ': There is no impact to availability within the Subsequent System or all availability impact is constrained to the Vulnerable System.':
      '：后续系统内的可用性不受影响或所有可用性影响都局限于漏洞系统。',

    // v4.0 指标定义（规范原文）
    'This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the resulting severity) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable system. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater severity.':
      '此指标反映漏洞可被利用的环境。攻击者利用漏洞系统时所处位置（逻辑上和物理上）越远，此指标值（以及由此得出的严重性）越大。可跨网络利用的漏洞的潜在攻击者数量多于需要物理接触设备才能利用的漏洞，因此严重性更高。',
    'This metric captures measurable actions that must be taken by the attacker to actively evade or circumvent existing built-in security-enhancing conditions in order to obtain a working exploit. These are conditions whose primary purpose is to increase security and/or increase exploit engineering complexity. A vulnerability exploitable without a target-specific variable has a lower complexity than a vulnerability that would require non-trivial customization. This metric is meant to capture security mechanisms utilized by the vulnerable system.':
      '此指标衡量攻击者为获得可用的漏洞利用而主动规避或绕过现有内置安全增强条件时必须采取的可衡量行动。这些条件的主要目的是提高安全性或增加漏洞利用的工程复杂度。无需针对目标特定变量即可利用的漏洞的复杂度低于需要复杂定制的漏洞。此指标用于体现漏洞系统所采用的安全机制。',
    'This metric captures the prerequisite deployment and execution conditions or variables of the vulnerable system that enable the attack. These differ from security-enhancing techniques/technologies (ref Attack Complexity) as the primary purpose of these conditions is not to explicitly mitigate attacks, but rather, emerge naturally as a consequence of the deployment and execution of the vulnerable system.':
      '此指标衡量使攻击得以实施的漏洞系统先决部署与执行条件或变量。这些条件不同于安全增强技术（参见攻击复杂度），其主要目的并非明确缓解攻击，而是漏洞系统部署和运行时自然产生的结果。',
    'This metric describes the level of privileges an attacker must possess prior to successfully exploiting the vulnerability. The method by which the attacker obtains privileged credentials prior to the attack (e.g., free trial accounts), is outside the scope of this metric. Generally, self-service provisioned accounts do not constitute a privilege requirement if the attacker can grant themselves privileges as part of the attack.':
      '此指标描述攻击者在成功利用漏洞前必须拥有的权限级别。攻击者在攻击前获取特权凭据的方式（例如免费试用帐户）不在此指标范围内。通常，如果攻击者能在攻击过程中自行授予权限，自助开通的帐户不构成权限要求。',
    'This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable system. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner.':
      '此指标衡量成功攻破漏洞系统是否需要攻击者以外的人类用户参与。它决定漏洞能否仅凭攻击者的意愿被利用，还是需要其他用户（或用户发起的进程）以某种方式参与。',
    'This metric measures the impact to the confidentiality of the information managed by the VULNERABLE SYSTEM due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.':
      '此指标衡量漏洞被成功利用后，对漏洞系统所管理信息的机密性影响。机密性指仅允许授权用户访问和披露信息，并阻止未授权用户访问或向其披露信息。',
    'This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. Integrity of the VULNERABLE SYSTEM is impacted when an attacker makes unauthorized modification of system data. Integrity is also impacted when a system user can repudiate critical actions taken in the context of the system (e.g. due to insufficient logging).':
      '此指标衡量漏洞被成功利用后对完整性的影响。完整性指信息的可信度与真实性。漏洞系统的完整性会在攻击者未经授权修改系统数据时受到影响。完整性也会在系统用户能够抵赖在系统中执行的关键操作时受到影响（例如日志记录不足）。',
    'This metric measures the impact to the availability of the VULNERABLE SYSTEM resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the system, this metric refers to the loss of availability of the impacted system itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system.':
      '此指标衡量漏洞被成功利用后对漏洞系统可用性的影响。机密性与完整性影响指标针对系统所用数据（例如信息、文件）的机密性或完整性损失，而此指标针对受影响系统本身的可用性损失，例如网络服务（如 Web、数据库、电子邮件）。可用性指信息资源的可访问性，因此消耗网络带宽、处理器周期或磁盘空间的攻击都会影响系统的可用性。',
    'This metric measures the impact to the confidentiality of the information managed by the SUBSEQUENT SYSTEM due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.':
      '此指标衡量漏洞被成功利用后，对后续系统所管理信息的机密性影响。机密性指仅允许授权用户访问和披露信息，并阻止未授权用户访问或向其披露信息。',
    'This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. Integrity of the SUBSEQUENT SYSTEM is impacted when an attacker makes unauthorized modification of system data. Integrity is also impacted when a system user can repudiate critical actions taken in the context of the system (e.g. due to insufficient logging).':
      '此指标衡量漏洞被成功利用后对完整性的影响。完整性指信息的可信度与真实性。后续系统的完整性会在攻击者未经授权修改系统数据时受到影响。完整性也会在系统用户能够抵赖在系统中执行的关键操作时受到影响（例如日志记录不足）。',
    'This metric measures the impact to the availability of the SUBSEQUENT SYSTEM resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the system, this metric refers to the loss of availability of the impacted system itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system.':
      '此指标衡量漏洞被成功利用后对后续系统可用性的影响。机密性与完整性影响指标针对系统所用数据（例如信息、文件）的机密性或完整性损失，而此指标针对受影响系统本身的可用性损失，例如网络服务（如 Web、数据库、电子邮件）。可用性指信息资源的可访问性，因此消耗网络带宽、处理器周期或磁盘空间的攻击都会影响系统的可用性。'
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
