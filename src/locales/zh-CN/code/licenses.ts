import type { PageDictionary } from '../../../core/types'

/**
 * 许可证名称：许可证文件页横幅标题、模板选择页列表、新建存储库页下拉框，以及存储库筛选框中 license: 的取值
 * （organization/repos-filter.ts 的取值译名取用）
 */
export const LICENSE_NAMES: Readonly<Record<string, string>> = {
  'BSD Zero Clause License': 'BSD 零条款许可证',
  'Academic Free License v3.0': '学术自由许可证 v3.0',
  'GNU Affero General Public License v3.0': 'GNU Affero 通用公共许可证 v3.0',
  'Apache License 2.0': 'Apache 许可证 2.0',
  'Artistic License 2.0': 'Artistic 许可证 2.0',
  'Blue Oak Model License 1.0.0': 'Blue Oak 范本许可证 1.0.0',
  'BSD-2-Clause Plus Patent License': 'BSD-2-Clause 附加专利许可证',
  'BSD 2-Clause "Simplified" License': 'BSD 2-Clause“简化版”许可证',
  'BSD 3-Clause Clear License': 'BSD 3-Clause Clear 许可证',
  'BSD 3-Clause "New" or "Revised" License': 'BSD 3-Clause“新版”或“修订版”许可证',
  'BSD 4-Clause "Original" or "Old" License': 'BSD 4-Clause“原始版”或“旧版”许可证',
  'Boost Software License 1.0': 'Boost 软件许可证 1.0',
  'Creative Commons Attribution 4.0 International': '知识共享署名 4.0 国际',
  'Creative Commons Attribution Share Alike 4.0 International': '知识共享署名-相同方式共享 4.0 国际',
  'Creative Commons Zero v1.0 Universal': '知识共享 CC0 v1.0 通用',
  'CeCILL Free Software License Agreement v2.1': 'CeCILL 自由软件许可协议 v2.1',
  'CERN Open Hardware Licence Version 2 - Permissive': 'CERN 开放硬件许可证第 2 版 - 宽松型',
  'CERN Open Hardware Licence Version 2 - Strongly Reciprocal': 'CERN 开放硬件许可证第 2 版 - 强互惠型',
  'CERN Open Hardware Licence Version 2 - Weakly Reciprocal': 'CERN 开放硬件许可证第 2 版 - 弱互惠型',
  'Educational Community License v2.0': '教育社区许可证 v2.0',
  'Eclipse Public License 1.0': 'Eclipse 公共许可证 1.0',
  'Eclipse Public License 2.0': 'Eclipse 公共许可证 2.0',
  'European Union Public License 1.1': '欧盟公共许可证 1.1',
  'European Union Public License 1.2': '欧盟公共许可证 1.2',
  'GNU Free Documentation License v1.3': 'GNU 自由文档许可证 v1.3',
  'GNU General Public License v2.0': 'GNU 通用公共许可证 v2.0',
  'GNU General Public License v3.0': 'GNU 通用公共许可证 v3.0',
  'ISC License': 'ISC 许可证',
  'GNU Lesser General Public License v2.1': 'GNU 宽通用公共许可证 v2.1',
  'GNU Lesser General Public License v3.0': 'GNU 宽通用公共许可证 v3.0',
  'LaTeX Project Public License v1.3c': 'LaTeX 项目公共许可证 v1.3c',
  'MIT No Attribution': 'MIT 免署名许可证',
  'MIT License': 'MIT 许可证',
  'Mozilla Public License 2.0': 'Mozilla 公共许可证 2.0',
  'Microsoft Public License': '微软公共许可证',
  'Microsoft Reciprocal License': '微软互惠许可证',
  'Mulan Permissive Software License, Version 2': '木兰宽松许可证，第 2 版',
  'University of Illinois/NCSA Open Source License': '伊利诺伊大学/NCSA 开源许可证',
  'Open Data Commons Open Database License v1.0': '开放数据共享开放数据库许可证 v1.0',
  'SIL Open Font License 1.1': 'SIL 开放字体许可证 1.1',
  'Open Software License 3.0': '开放软件许可证 3.0',
  'PostgreSQL License': 'PostgreSQL 许可证',
  'The Unlicense': 'Unlicense',
  'Universal Permissive License v1.0': '通用宽松许可证 v1.0',
  'Vim License': 'Vim 许可证',
  'Do What The F*ck You Want To Public License': '你他*的想干嘛就干嘛公共许可证',
  'zlib License': 'zlib 许可证'
}

/**
 * 许可证（choosealicense.com 数据，GitHub 界面文字）：名称、说明、规则标签。许可证正文不翻译（代码视图不处理）。
 * 出现在许可证文件页的横幅（标题前的「<所有者>/<存储库> is licensed under the」见 banners.ts 的正则）、
 * 许可证模板选择页（/community/license/new）、新建存储库页的许可证下拉框。
 * - 名称、说明收 static：新建存储库页只有 common、new 作用域。规则标签收 scoped。
 * - 含链接的说明（div.VerifiedHTMLBox__* 内的 HTML）：链接文字是许可证名，一并译出；句型键不超过行内句上限（300）的
 *   用 inline 整句，链接以中文结尾，槽位之后不留空格。超过上限的（Creative Commons CC0、University of Illinois/NCSA）
 *   与整句未命中时按片段翻译。
 * - 规则的说明（choosealicense.com 的提示文字）GitHub 不显示，不收录。
 * 标点随原文：原文没有的逗号、冒号、括号、引号不加，必要时调整语序。
 */
export default {
  static: {
    ...LICENSE_NAMES,

    // 横幅页脚、说明
    'This is not legal advice.': '此信息不构成法律建议。',
    'Learn more about repository licenses': '了解存储库许可证',
    'A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种仅以保留版权和许可证声明为条件的简短宽松许可证。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种主要以保留版权和许可证声明为条件的宽松许可证。贡献者明确授予专利权。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.':
      '这种强 Copyleft 许可证的授权条件是以相同许可证公开被许可作品和修改版本的完整源码，修改版本包括使用被许可作品的更大作品。必须保留版权和许可证声明。贡献者明确授予专利权。',
    'Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.':
      '这种最强 Copyleft 许可证的授权条件是以相同许可证公开被许可作品和修改版本的完整源码，修改版本包括使用被许可作品的更大作品。必须保留版权和许可证声明。贡献者明确授予专利权。通过网络使用修改版本提供服务时，必须公开修改版本的完整源码。',
    'The GNU GPL is the most widely used free software license and has a strong copyleft requirement. When distributing derived works, the source code of the work must be made available under the same license. There are multiple variants of the GNU GPL, each with different requirements.':
      'GNU GPL 是使用最广泛且具有强 Copyleft 要求的自由软件许可证。分发衍生作品时，必须以相同许可证公开作品源码。GNU GPL 有多个变体，各自要求不同。',
    'Permissions of this copyleft license are conditioned on making available complete source code of licensed works and modifications under the same license or the GNU GPLv3. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without source code for the larger work.':
      '这种 Copyleft 许可证的授权条件是以相同许可证或 GNU GPLv3 公开被许可作品及其修改版本的完整源码。必须保留版权和许可证声明。贡献者明确授予专利权。但通过被许可作品提供的接口使用它的更大作品可以按不同条款分发且无需提供该更大作品的源码。',
    'Primarily used for software libraries, the GNU LGPL requires that derived works be licensed under the same license, but works that only link to it do not fall under this restriction. There are two commonly used versions of the GNU LGPL.':
      'GNU LGPL 主要用于软件库，要求衍生作品使用相同许可证，但仅链接到它的作品不受此限制。GNU LGPL 有两个常用版本。',
    'Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license (or in certain cases, one of the GNU licenses). Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work may be distributed under different terms and without source code for files added in the larger work.':
      '这种弱 Copyleft 许可证的授权条件是以相同许可证（某些情况下可为 GNU 许可证之一）公开被许可文件及其修改的源码。必须保留版权和许可证声明。贡献者明确授予专利权。但使用被许可作品的更大作品可以按不同条款分发且无需提供其中新增文件的源码。',
    'A simple permissive license only requiring preservation of copyright and license notices for source (and not binary) distribution. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种仅要求分发源码（而非二进制文件）时保留版权和许可证声明的简单宽松许可证。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种没有任何条件并将作品贡献到公有领域的许可证。采用此许可证的作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'A short and simple permissive license with no conditions, not even requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种没有任何条件的简短宽松许可证，甚至不要求保留版权和许可证声明。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'The BSD Zero Clause license goes further than the BSD 2-Clause license to allow you unlimited freedom with the software without requirements to include the copyright notice, license text, or disclaimer in either source or binary forms.':
      'BSD 零条款许可证比 BSD 2-Clause 许可证更进一步，允许你不受限制地使用软件且源码和二进制形式都无需附带版权声明、许可证文本或免责声明。',
    'Heavily favored by the Perl community, the Artistic license requires that modified versions of the software do not prevent users from running the standard version.':
      'Artistic 许可证深受 Perl 社区青睐，要求软件的修改版本不得妨碍用户运行标准版本。',
    'This commercially-friendly copyleft license provides the ability to commercially license binaries; a modern royalty-free patent license grant; and the ability for linked works to use other licenses, including commercial ones.':
      '这种对商业友好的 Copyleft 许可证允许对二进制文件进行商业授权；提供现代的免版税专利许可；并允许链接作品使用其他许可证，包括商业许可证。',
    'Permits almost any use subject to providing credit and license notice. Frequently used for media assets and educational materials. The most common license for Open Access scientific publications. Not recommended for software.':
      '只要注明出处并附上许可证声明即允许几乎任何用途。常用于媒体资源和教育材料。开放获取科学出版物最常用的许可证。不建议用于软件。',
    'The Open Font License (OFL) is maintained by SIL International. It attempts to be a compromise between the values of the free software and typeface design communities. It is used for almost all open source font projects, including those by Adobe, Google and Mozilla.':
      '开放字体许可证 (OFL) 由 SIL International 维护。它试图在自由软件社区与字体设计社区的价值观之间取得平衡。几乎所有开源字体项目都使用它，包括 Adobe、Google 和 Mozilla 的项目。',
    'The easiest license out there. It gives the user permissions to do whatever they want with your code.':
      '最简单的许可证。它允许用户对你的代码做任何事。',
    'A short permissive license, compatible with GPL. Requires altered source versions to be documented as such.':
      '一种简短的宽松许可证，与 GPL 兼容。要求注明源码的修改版本。',
    // 含链接的许可证说明（按链接拆分的片段；整句未命中 inline 时使用）
    'A permissive license similar to the': '一种类似于',
    ', but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.':
      '的宽松许可证，但增加的第三条禁止他人未经书面同意使用版权所有者或其贡献者的名义推广衍生产品。',
    'A permissive license that comes in two variants, the': '一种宽松许可证，有两个变体',
    '. Both have very minute differences to the MIT license.': '。两者与 MIT 许可证的差异都很小。',
    'A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the':
      '宽松许可证允许他人在适当署名且无担保的前提下对你的代码做任何事。ISC 许可证在功能上等同于',
    'licenses, removing some language that is no longer necessary.': '许可证，并删除了一些不再必要的措辞。',
    "waives copyright interest in a work you've created and dedicates it to the world-wide public domain. Use CC0 to opt out of copyright entirely and ensure your work has the widest reach. As with the Unlicense and typical software licenses, CC0 disclaims warranties. CC0 is very similar to the Unlicense.":
      '放弃你所创作作品的版权权益并将其贡献到全球公有领域。使用 CC0 可完全放弃版权并让作品得到最广泛的传播。与 Unlicense 和典型的软件许可证一样，CC0 不提供担保。CC0 与 Unlicense 非常相似。',
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.（整句由 inline 处理）
    'A variant of the': '一种',
    'that explicitly does not grant any patent rights.': '变体且明确不授予任何专利权。',
    // …approved by the European Commission in <a>23 official languages</a> of the European Union.
    'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in':
      '欧盟公共许可证 (EUPL) 是由欧盟委员会发起并以欧盟',
    '23 official languages': '23 种官方语言',
    'of the European Union.': '版本批准的 Copyleft 自由/开源软件许可证。',
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …（整句由 inline 处理）
    'but requires derivatives be distributed under the same or a similar,': '但要求衍生作品以相同或类似的',
    'license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.':
      '许可证分发。常用于媒体资源和教育材料。其旧版本是维基百科等维基媒体项目的默认许可证。不建议用于软件。',
    // 说明（其余许可证）
    'The Academic Free License is a variant of the Open Software License that does not require that the source code of derivative works be disclosed. It contains explicit copyright and patent grants and reserves trademark rights in the author.':
      '学术自由许可证是不要求公开衍生作品源码的开放软件许可证变体。它明确授予版权和专利权并为作者保留商标权。',
    'A permissive license whose main conditions require providing notice of the license. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一种主要以提供许可证声明为条件的宽松许可证。贡献者明确授予专利权。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源码。',
    'This license is designed to provide: a) a simple permissive license; b) that is compatible with the GNU GPL-2.0; and c) which also has an express patent grant included.':
      '此许可证旨在提供：a) 一种简单的宽松许可证；b) 与 GNU GPL-2.0 兼容；c) 同时明确包含专利授权。',
    'Strong copyleft license made by three French public research organisations, CEA, CNRS, and Inria, compatible with AGPL-3.0, EUPL-1.1, and GPL-2.0, or later versions of those licenses.':
      '由法国三家公共研究机构 CEA、CNRS 和 Inria 制定的强 Copyleft 许可证，与 AGPL-3.0、EUPL-1.1 和 GPL-2.0 或这些许可证的更高版本兼容。',
    'A permissive license for hardware designs, with conditions only requiring preservation of notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without sources.':
      '一种用于硬件设计的宽松许可证，仅以保留声明为条件。贡献者明确授予专利权。被许可作品、修改版本和更大的作品可以按不同条款分发且无需提供源文件。',
    'Permissions of this strongly reciprocal license for hardware designs are conditioned on making available complete sources of licensed works and modifications, which include larger works using a licensed work, under the same license. Notices must be preserved. Contributors provide an express grant of patent rights.':
      '这种用于硬件设计的强互惠许可证的授权条件是以相同许可证公开被许可作品和修改版本的完整源文件，修改版本包括使用被许可作品的更大作品。必须保留声明。贡献者明确授予专利权。',
    'Permissions of this weakly-reciprocal license are conditioned on making available complete sources of licensed works and modifications under the same license. Notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without sources for the larger work.':
      '这种弱互惠许可证的授权条件是以相同许可证公开被许可作品和修改版本的完整源文件。必须保留声明。贡献者明确授予专利权。但通过被许可作品提供的接口使用它的更大作品可以按不同条款分发且无需提供该更大作品的源文件。',
    'The Educational Community License version 2.0 ("ECL") consists of the Apache 2.0 license, modified to change the scope of the patent grant in section 3 to be specific to the needs of the education communities using this license.':
      '教育社区许可证 2.0 版 (ECL) 由 Apache 2.0 许可证修改而来，将第 3 节中专利授权的范围改为专门针对使用此许可证的教育社区的需要。',
    'The “European Union Public Licence” (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in 22 official languages of the European Union.':
      '“欧盟公共许可证” (EUPL) 是由欧盟委员会发起并以欧盟 22 种官方语言版本批准的 Copyleft 自由/开源软件许可证。',
    'A copyleft license for software documentation.': '一种用于软件文档的 Copyleft 许可证。',
    'The LaTeX Project Public License (LPPL) is the primary license under which the LaTeX kernel and the base LaTeX packages are distributed.':
      'LaTeX 项目公共许可证 (LPPL) 是 LaTeX 内核和 LaTeX 基础宏包分发时采用的主要许可证。',
    'An open source license with a patent grant.': '一种附带专利授权的开源许可证。',
    'The Open Database License (ODbL) is a license agreement intended to allow users to freely share, modify, and use a database while maintaining this same freedom for others.':
      '开放数据库许可证 (ODbL) 是一种许可协议，旨在允许用户自由共享、修改和使用数据库，同时为他人保留同样的自由。',
    "Permissions of this copyleft license are conditioned on distributing source code of licensed works and modifications under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. Using the work or modifications to provide services to external users is treated as distribution and also requires making source code available. Works that merely link to a licensed work are considered collective works and are not subject to the license's reciprocity requirements.":
      '这种 Copyleft 许可证的授权条件是以相同许可证分发被许可作品和修改版本的源码。必须保留版权和许可证声明。贡献者明确授予专利权。使用作品或修改版本向外部用户提供服务视为分发并同样需要公开源码。仅链接到被许可作品的作品视为集合作品且不受此许可证互惠要求的约束。',
    'A very short, BSD-style license, used specifically for PostgreSQL.': '一种非常简短的 BSD 风格许可证，专用于 PostgreSQL。',
    'A permissive, OSI- and FSF-approved, GPL-compatible license, expressly allowing attribution with just a copyright notice and a short form link rather than the full text of the license. Includes an express grant of patent rights. Licensed works and modifications may be distributed under different terms and without source code, and the patent grant may also optionally be expanded to larger works to permit use as a contributor license agreement.':
      '一种获 OSI 和 FSF 批准、与 GPL 兼容的宽松许可证，明确允许仅以版权声明和简短链接而非许可证全文的形式署名。包含明确的专利授权。被许可作品和修改版本可以按不同条款分发且无需提供源码，专利授权还可选择扩展到更大的作品，以便用作贡献者许可协议。',
    'There are no restrictions on using or distributing an unmodified copy of the software. Parts of the software may also be distributed, but the license text must always be included. For modified versions a few restrictions apply. The license is GPL compatible, you may compile the software with GPL libraries and distribute it.':
      '使用或分发软件的未修改副本不受任何限制。也可以分发软件的部分内容，但必须始终附带许可证文本。修改版本有少量限制。此许可证与 GPL 兼容，你可以将软件与 GPL 库一起编译并分发。',
    // 说明中的链接文字（许可证名）
    'BSD 2-Clause License': 'BSD 2-Clause 许可证',
    'BSD 3-Clause License': 'BSD 3-Clause 许可证',
    'BSD 3-clause License': 'BSD 3-Clause 许可证',
    'Apache License': 'Apache 许可证',
    'MIT/X11 license': 'MIT/X11 许可证',
    'Creative Commons CC0 Public Domain Dedication': '知识共享 CC0 公有领域贡献声明',
    // The <a>Creative Commons CC0 Public Domain Dedication</a> waives …：开头的 The 由 blob.ts 的 scoped 处理，其后见上
    // University of Illinois/NCSA：… based on the <a>MIT/X11 license</a> and the <a>BSD 3-clause License</a>. Its …
    // 中间的 and the 由通用词典处理
    'The University of Illinois/NCSA Open Source License, or UIUC license, is a permissive free software license, based on the':
      '伊利诺伊大学/NCSA 开源许可证，又称 UIUC 许可证，是一种宽松自由软件许可证，基于',
    '. Its conditions include requiring the preservation of copyright and license notices both in source and in binary distributions and the prohibition of using the names of the authors or the project organization to promote or endorse derived products.':
      '。其条件包括以源码和二进制形式分发时都必须保留版权和许可证声明以及禁止使用作者或项目组织的名义推广或认可衍生产品。'
  },

  scoped: {
    // 许可证规则分组与标签（Permissions 由通用词典处理）
    Limitations: '限制',
    Conditions: '条件',
    'Commercial use': '商业用途',
    Modification: '修改',
    Distribution: '分发',
    'Private use': '私人使用',
    'Patent use': '专利使用',
    'License and copyright notice': '许可证和版权声明',
    'License and copyright notice for source': '源码的许可证和版权声明',
    'State changes': '声明变更',
    'Disclose source': '公开源码',
    'Network use is distribution': '网络使用即分发',
    'Same license': '相同许可证',
    'Same license (file)': '相同许可证（文件）',
    'Same license (library)': '相同许可证（库）',
    'Trademark use': '商标使用',
    Liability: '责任',
    Warranty: '担保',
    'Similar to': '类似于',
    compatible: '兼容'
  },

  inline: [
    // 含链接的许可证说明（div.VerifiedHTMLBox__* 内的 HTML，取自 choosealicense.com 数据）：
    // 语序要跨链接调整、或链接两侧的空格要按中文重排的整句；其余含链接的说明按片段翻译
    // A permissive license similar to the <a>BSD 2-Clause License</a>, but with a 3rd clause …
    [
      'A permissive license similar to the {}, but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.',
      '一种类似于 {}的宽松许可证，但增加的第三条禁止他人未经书面同意使用版权所有者或其贡献者的名义推广衍生产品。'
    ],
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.
    ['A variant of the {} that explicitly does not grant any patent rights.', '一种明确不授予任何专利权的 {}变体。'],
    // … approved by the European Commission in <a>23 official languages</a> of the European Union.
    [
      'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in {} of the European Union.',
      '欧盟公共许可证 (EUPL) 是由欧盟委员会发起并以欧盟 {}版本批准的 Copyleft 自由/开源软件许可证。'
    ],
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …
    [
      'Similar to {} but requires derivatives be distributed under the same or a similar, {} license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.',
      '类似于 {} 但要求衍生作品以相同或类似的{}许可证分发。常用于媒体资源和教育材料。其旧版本是维基百科等维基媒体项目的默认许可证。不建议用于软件。'
    ],
    // A permissive license similar to the <a>BSD 3-Clause License</a>, but with an "advertising clause" …（BSD 4-Clause）
    [
      'A permissive license similar to the {}, but with an "advertising clause" that requires an acknowledgment of the original source in all advertising material.',
      '一种类似于 {}的宽松许可证，但增加了“广告条款”，要求在所有广告材料中注明原始来源。'
    ],
    // An open source license with a patent grant similar to the <a>Microsoft Public License</a>, …（Microsoft Reciprocal）
    [
      'An open source license with a patent grant similar to the {}, with the additional condition that any source code for any derived file be provided under this license.',
      '一种与{}类似的附带专利授权的开源许可证，附加条件是任何衍生文件的源码都必须以此许可证提供。'
    ],
    // A permissive license similar to the <a>Apache License</a>, but explicitly states … approved by OSI.（Mulan PSL v2）
    [
      'A permissive license similar to the {}, but explicitly states that it does not grant trademark rights. Mulan Permissive Software License is the first open source license in both Chinese and English approved by OSI.',
      '一种类似于 {}的宽松许可证，但明确声明不授予商标权。木兰宽松许可证是首个获得 OSI 批准的中英双语开源许可证。'
    ]
  ]
} satisfies PageDictionary
