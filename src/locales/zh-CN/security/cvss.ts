import type { PageDictionary } from '../../../core/types'

/** CVSS v3 / v4 指标说明（公告详情、Dependabot 警报侧栏、公告表单的严重性计算器） */
export default {
  static: {
    // 总体评分
    'CVSS overall score': 'CVSS 总体评分',
    'CVSS overall score details': 'CVSS 总体评分详细信息',
    'Learn more about the CVSS overall score': '了解 CVSS 总体评分',
    'This score calculates overall vulnerability severity from 0 to 10 and is based on the Common Vulnerability Scoring System (CVSS).':
      '此评分依据通用漏洞评分系统 (CVSS) 以 0 到 10 衡量漏洞的总体严重性。',
    'This score calculates overall vulnerability severity from 0 to 10 and is based on the Common Vulnerability Scoring System.':
      '此评分依据通用漏洞评分系统以 0 到 10 衡量漏洞的总体严重性。',

    // CVSS v3 基本指标
    'CVSS base metrics': 'CVSS 基本指标',
    'CVSS v3 base metrics': 'CVSS v3 基本指标',
    'CVSS v4 base metrics': 'CVSS v4 基本指标',
    'Base metrics': '基本指标',
    'Learn more about base metrics': '了解基本指标',
    'Attack vector': '攻击向量',
    'Attack vector:': '攻击向量：',
    'Attack complexity': '攻击复杂度',
    'Attack complexity:': '攻击复杂度：',
    'Privileges required': '所需权限',
    'Privileges required:': '所需权限：',
    'User interaction': '用户交互',
    'User interaction:': '用户交互：',
    Scope: '范围',
    'Scope:': '范围：',
    Confidentiality: '机密性',
    'Confidentiality:': '机密性：',
    Integrity: '完整性',
    'Integrity:': '完整性：',
    'Availability:': '可用性：',
    'More severe the more the remote (logically and physically) an attacker can be in order to exploit the vulnerability.':
      '攻击者利用漏洞时所处位置（逻辑上和物理上）越远则严重性越高。',
    'More severe the more remote (logically and physically) an attacker can be in order to exploit the vulnerability.':
      '攻击者利用漏洞时所处位置（逻辑上和物理上）越远则严重性越高。',
    'More severe for the least complex attacks.': '攻击越简单则严重性越高。',
    'More severe if no privileges are required.': '无需权限时严重性更高。',
    'More severe when no user interaction is required.': '无需用户交互时严重性更高。',
    'More severe when a scope change occurs, e.g. one vulnerable component impacts resources in components beyond its security scope.':
      '发生范围变更时严重性更高，例如一个存在漏洞的组件影响到其安全范围之外的组件资源。',
    'More severe when loss of data confidentiality is highest, measuring the level of data access available to an unauthorized user.':
      '数据机密性损失越大则严重性越高，衡量的是未授权用户可访问数据的程度。',
    'More severe when loss of data integrity is the highest, measuring the consequence of data modification possible by an unauthorized user.':
      '数据完整性损失越大则严重性越高，衡量的是未授权用户修改数据可能造成的后果。',
    'More severe when the loss of impacted component availability is highest.': '受影响组件的可用性损失越大则严重性越高。',

    // CVSS v4 基本指标
    'Exploitability Metrics': '可利用性指标',
    'Attack Vector': '攻击向量',
    'Attack Complexity': '攻击复杂度',
    'Attack Requirements': '攻击要求',
    'Privileges Required': '所需权限',
    'User Interaction': '用户交互',
    'Vulnerable System Impact Metrics': '漏洞系统影响指标',
    'Subsequent System Impact Metrics': '后续系统影响指标',
    'How remotely an attacker can exploit the vulnerable system. More remote attacks have greater severity because more potential attackers can reach them.':
      '攻击者可从多远的位置利用存在漏洞的系统。更远程的攻击因可触及的潜在攻击者更多而严重性更高。',
    'Actions an attacker must take to evade or circumvent built-in security controls. Exploits requiring non-trivial, target-specific customization have greater complexity.':
      '攻击者为规避或绕过内置安全控制必须采取的操作。需要针对目标进行复杂定制的利用方式复杂度更高。',
    'Deployment or execution conditions that must exist for the attack to succeed. Unlike Attack Complexity, these conditions arise naturally and are not intended to mitigate attacks.':
      '攻击成功必须具备的部署或执行条件。与攻击复杂度不同，这些条件自然存在且并非用于缓解攻击。',
    'Privileges an attacker must already have to exploit the vulnerability. How the attacker obtained those privileges is out of scope. Self-service accounts do not count if the attacker can grant themselves the required privileges during the attack.':
      '攻击者利用漏洞前必须已具备的权限。攻击者如何获得这些权限不在考虑范围内。自助注册的帐户在攻击者能于攻击过程中自行授予所需权限时不计入。',
    'Whether exploitation requires a human other than the attacker, or a process initiated by that user, to participate.':
      '利用漏洞是否需要攻击者以外的人员或其发起的进程参与。',
    'The loss of confidentiality in the vulnerable system after successful exploitation, including unauthorized access to or disclosure of its information.':
      '成功利用后漏洞系统的机密性损失，包括其信息遭未授权访问或泄露。',
    'The loss of integrity in the vulnerable system after successful exploitation, including unauthorized data changes or the ability to repudiate critical actions.':
      '成功利用后漏洞系统的完整性损失，包括数据遭未授权更改或关键操作可被抵赖。',
    'The loss of availability in the vulnerable system after successful exploitation. This includes attacks that consume resources such as network bandwidth, processor cycles, or disk space.':
      '成功利用后漏洞系统的可用性损失。这包括消耗网络带宽、处理器周期或磁盘空间等资源的攻击。',
    'The loss of confidentiality in a subsequent system after successful exploitation, including unauthorized access to or disclosure of its information.':
      '成功利用后后续系统的机密性损失，包括其信息遭未授权访问或泄露。',
    'The loss of integrity in a subsequent system after successful exploitation, including unauthorized data changes or the ability to repudiate critical actions.':
      '成功利用后后续系统的完整性损失，包括数据遭未授权更改或关键操作可被抵赖。',
    'The loss of availability in a subsequent system after successful exploitation. This includes attacks that consume resources such as network bandwidth, processor cycles, or disk space.':
      '成功利用后后续系统的可用性损失。这包括消耗网络带宽、处理器周期或磁盘空间等资源的攻击。',

    // EPSS：… within the next 30 days. Data by <FIRST>.
    'EPSS score': 'EPSS 评分',
    'Exploit Prediction Scoring System (EPSS)': '漏洞利用预测评分系统 (EPSS)',
    'Exploit Prediction Scoring System': '漏洞利用预测评分系统',
    'This score estimates the probability of this vulnerability being exploited within the next 30 days. Data by':
      '此评分估计该漏洞在未来 30 天内被利用的概率。数据来源',
    'This score estimates the probability of this vulnerability being exploited within the next 30 days. Data provided by':
      '此评分估计该漏洞在未来 30 天内被利用的概率。数据来源',
    'Learn more about the EPSS score.': '了解 EPSS 评分。',

    // 严重性计算器（公告表单）
    'Score could not be calculated': '无法计算评分',
    'Please fill out this field with a valid vector string': '请填写有效的向量字符串',
    'Vector string': '向量字符串',
    'CVSS vector string': 'CVSS 向量字符串',
    Calculator: '计算器',
    'Assess severity using CVSS': '使用 CVSS 评估严重性',
    'Select severity': '选择严重性',
    'Severity score': '严重性评分'
  },
  scoped: {
    // 其他区域也出现的同形文字，本区域内单独生效
    Availability: '可用性',
    Required: '需要',
    Active: '有效',
    // 指标取值（单词过于通用，只在安全页生效）
    Adjacent: '相邻',
    'Adjacent Network': '相邻网络',
    Physical: '物理',
    Changed: '已改变',
    Unchanged: '未改变',
    Present: '存在',
    Passive: '被动'
  },
  regexp: [
    // EPSS 百分位：(5th percentile)
    [/^\((\d+)(?:st|nd|rd|th) percentile\)$/, '（第 $1 百分位）']
  ]
} satisfies PageDictionary
