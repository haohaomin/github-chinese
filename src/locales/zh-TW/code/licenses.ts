import type { PageDictionary } from '../../../core/types'

/**
 * 许可证名称：许可证文件页横幅标题、模板选择页列表、新建存储库页下拉框，以及存储库筛选框中 license: 的取值
 * （organization/repos-filter.ts 的取值译名取用）
 */
export const LICENSE_NAMES: Readonly<Record<string, string>> = {
  'BSD Zero Clause License': 'BSD Zero Clause 授權條款',
  'Academic Free License v3.0': '學術自由授權條款 v3.0',
  'GNU Affero General Public License v3.0': 'GNU Affero 通用公眾授權條款 v3.0',
  'Apache License 2.0': 'Apache 授權條款 2.0',
  'Artistic License 2.0': 'Artistic 授權條款 2.0',
  'Blue Oak Model License 1.0.0': 'Blue Oak 範本授權條款 1.0.0',
  'BSD-2-Clause Plus Patent License': 'BSD-2-Clause 附加專利授權條款',
  'BSD 2-Clause "Simplified" License': 'BSD 2-Clause「簡化版」授權條款',
  'BSD 3-Clause Clear License': 'BSD 3-Clause Clear 授權條款',
  'BSD 3-Clause "New" or "Revised" License': 'BSD 3-Clause「新版」或「修訂版」授權條款',
  'BSD 4-Clause "Original" or "Old" License': 'BSD 4-Clause「原始版」或「舊版」授權條款',
  'Boost Software License 1.0': 'Boost 軟體授權條款 1.0',
  'Creative Commons Attribution 4.0 International': '創用 CC 姓名標示 4.0 國際',
  'Creative Commons Attribution Share Alike 4.0 International': '創用 CC 姓名標示-相同方式分享 4.0 國際',
  'Creative Commons Zero v1.0 Universal': '創用 CC0 v1.0 通用',
  'CeCILL Free Software License Agreement v2.1': 'CeCILL 自由軟體授權協議 v2.1',
  'CERN Open Hardware Licence Version 2 - Permissive': 'CERN 開放硬體授權條款第 2 版 - 寬鬆型',
  'CERN Open Hardware Licence Version 2 - Strongly Reciprocal': 'CERN 開放硬體授權條款第 2 版 - 強互惠型',
  'CERN Open Hardware Licence Version 2 - Weakly Reciprocal': 'CERN 開放硬體授權條款第 2 版 - 弱互惠型',
  'Educational Community License v2.0': '教育社群授權條款 v2.0',
  'Eclipse Public License 1.0': 'Eclipse 公共授權條款 1.0',
  'Eclipse Public License 2.0': 'Eclipse 公共授權條款 2.0',
  'European Union Public License 1.1': '歐盟公共授權條款 1.1',
  'European Union Public License 1.2': '歐盟公共授權條款 1.2',
  'GNU Free Documentation License v1.3': 'GNU 自由文件授權條款 v1.3',
  'GNU General Public License v2.0': 'GNU 通用公眾授權條款 v2.0',
  'GNU General Public License v3.0': 'GNU 通用公眾授權條款 v3.0',
  'ISC License': 'ISC 授權條款',
  'GNU Lesser General Public License v2.1': 'GNU 寬通用公眾授權條款 v2.1',
  'GNU Lesser General Public License v3.0': 'GNU 寬通用公眾授權條款 v3.0',
  'LaTeX Project Public License v1.3c': 'LaTeX 專案公共授權條款 v1.3c',
  'MIT No Attribution': 'MIT 免標示出處授權條款',
  'MIT License': 'MIT 授權條款',
  'Mozilla Public License 2.0': 'Mozilla 公共授權條款 2.0',
  'Microsoft Public License': '微軟公共授權條款',
  'Microsoft Reciprocal License': '微軟互惠授權條款',
  'Mulan Permissive Software License, Version 2': '木蘭寬鬆授權條款，第 2 版',
  'University of Illinois/NCSA Open Source License': '伊利諾大學/NCSA 開源授權條款',
  'Open Data Commons Open Database License v1.0': '開放資料共享開放資料庫授權條款 v1.0',
  'SIL Open Font License 1.1': 'SIL 開放字型授權條款 1.1',
  'Open Software License 3.0': '開放軟體授權條款 3.0',
  'PostgreSQL License': 'PostgreSQL 授權條款',
  'The Unlicense': 'Unlicense',
  'Universal Permissive License v1.0': '通用寬鬆授權條款 v1.0',
  'Vim License': 'Vim 授權條款',
  'Do What The F*ck You Want To Public License': '你他*的想幹嘛就幹嘛公共授權條款',
  'zlib License': 'zlib 授權條款'
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
    'This is not legal advice.': '此內容不構成法律建議。',
    'Learn more about repository licenses': '瞭解儲存庫授權條款',
    'A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種僅以保留著作權和授權條款聲明為條件的簡短寬鬆授權條款。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種主要條件為保留著作權和授權條款聲明的寬鬆授權條款。貢獻者明確授予專利權。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.':
      '這種強 Copyleft 授權條款授予權利的條件是以相同授權條款公開授權作品和修改版本的完整原始碼，修改版本包括使用授權作品的更大作品。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。',
    'Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.':
      '這種最強 Copyleft 授權條款授予權利的條件是以相同授權條款公開授權作品和修改版本的完整原始碼，修改版本包括使用授權作品的更大作品。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。透過網路使用修改版本提供服務時，必須公開修改版本的完整原始碼。',
    'The GNU GPL is the most widely used free software license and has a strong copyleft requirement. When distributing derived works, the source code of the work must be made available under the same license. There are multiple variants of the GNU GPL, each with different requirements.':
      'GNU GPL 是使用最廣泛且具有強 Copyleft 要求的自由軟體授權條款。散布衍生作品時，必須以相同授權條款公開作品的原始碼。GNU GPL 有多種變體，各有不同要求。',
    'Permissions of this copyleft license are conditioned on making available complete source code of licensed works and modifications under the same license or the GNU GPLv3. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without source code for the larger work.':
      '這種 Copyleft 授權條款授予權利的條件是以相同授權條款或 GNU GPLv3 公開授權作品和修改版本的完整原始碼。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。但透過授權作品提供的介面使用它的更大作品，可以依不同條款散布且無需提供該更大作品的原始碼。',
    'Primarily used for software libraries, the GNU LGPL requires that derived works be licensed under the same license, but works that only link to it do not fall under this restriction. There are two commonly used versions of the GNU LGPL.':
      'GNU LGPL 主要用於軟體程式庫，要求衍生作品採用相同授權條款，但僅連結到它的作品不受此限制。GNU LGPL 有兩個常用版本。',
    'Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license (or in certain cases, one of the GNU licenses). Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work may be distributed under different terms and without source code for files added in the larger work.':
      '這種弱 Copyleft 授權條款授予權利的條件是以相同授權條款（某些情況下可為 GNU 授權條款之一）公開授權檔案和這些檔案修改內容的原始碼。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。但使用授權作品的更大作品，可以依不同條款散布且無需提供其中新增檔案的原始碼。',
    'A simple permissive license only requiring preservation of copyright and license notices for source (and not binary) distribution. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種僅要求以原始碼（而非二進位）形式散布時保留著作權和授權條款聲明的簡單寬鬆授權條款。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種沒有任何條件並將作品貢獻至公共領域的授權條款。採用此授權條款的作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'A short and simple permissive license with no conditions, not even requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種沒有任何條件的簡短寬鬆授權條款，甚至不要求保留著作權和授權條款聲明。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'The BSD Zero Clause license goes further than the BSD 2-Clause license to allow you unlimited freedom with the software without requirements to include the copyright notice, license text, or disclaimer in either source or binary forms.':
      'BSD Zero Clause 授權條款比 BSD 2-Clause 授權條款更進一步，讓你不受限制地使用軟體，且原始碼和二進位形式都不需附上著作權聲明、授權條款文字或免責聲明。',
    'Heavily favored by the Perl community, the Artistic license requires that modified versions of the software do not prevent users from running the standard version.':
      'Artistic 授權條款深受 Perl 社群青睞，要求軟體的修改版本不得妨礙使用者執行標準版本。',
    'This commercially-friendly copyleft license provides the ability to commercially license binaries; a modern royalty-free patent license grant; and the ability for linked works to use other licenses, including commercial ones.':
      '這種對商業友善的 Copyleft 授權條款允許以商業授權方式提供二進位檔；提供現代的免權利金專利授權；並允許連結的作品使用其他授權條款，包括商業授權條款。',
    'Permits almost any use subject to providing credit and license notice. Frequently used for media assets and educational materials. The most common license for Open Access scientific publications. Not recommended for software.':
      '在註明出處並附上授權條款聲明的前提下允許幾乎任何用途。常用於媒體素材和教材。開放取用科學出版品最常用的授權條款。不建議用於軟體。',
    'The Open Font License (OFL) is maintained by SIL International. It attempts to be a compromise between the values of the free software and typeface design communities. It is used for almost all open source font projects, including those by Adobe, Google and Mozilla.':
      '開放字型授權條款 (OFL) 由 SIL International 維護。它試圖在自由軟體社群和字型設計社群的價值觀之間取得折衷。幾乎所有開源字型專案都採用它，包括 Adobe、Google 和 Mozilla 的專案。',
    'The easiest license out there. It gives the user permissions to do whatever they want with your code.':
      '最簡單的授權條款。它允許使用者對你的程式碼做任何事。',
    'A short permissive license, compatible with GPL. Requires altered source versions to be documented as such.':
      '一種簡短的寬鬆授權條款，與 GPL 相容。要求將修改過的原始碼版本標明為修改版本。',
    // 含链接的许可证说明（按链接拆分的片段；整句未命中 inline 时使用）
    'A permissive license similar to the': '一種類似於',
    ', but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.':
      '的寬鬆授權條款，但增加的第三條禁止他人未經書面同意使用著作權人或其貢獻者的名義推廣衍生產品。',
    'A permissive license that comes in two variants, the': '一種有兩種變體的寬鬆授權條款，分別是',
    '. Both have very minute differences to the MIT license.': '。兩者和 MIT 授權條款的差異都很小。',
    'A permissive license lets people do anything with your code with proper attribution and without warranty. The ISC license is functionally equivalent to the':
      '寬鬆授權條款允許他人在適當標示出處且無擔保的前提下對你的程式碼做任何事。ISC 授權條款在功能上等同於',
    'licenses, removing some language that is no longer necessary.': '授權條款，並刪除了一些已不再必要的措辭。',
    "waives copyright interest in a work you've created and dedicates it to the world-wide public domain. Use CC0 to opt out of copyright entirely and ensure your work has the widest reach. As with the Unlicense and typical software licenses, CC0 disclaims warranties. CC0 is very similar to the Unlicense.":
      '放棄你對所創作作品的著作權權益，並將作品貢獻至全球公共領域。使用 CC0 可完全放棄著作權，讓作品得到最廣泛的傳播。如同 Unlicense 和一般軟體授權條款，CC0 不提供擔保。CC0 和 Unlicense 非常相似。',
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.（整句由 inline 处理）
    'A variant of the': '一種',
    'that explicitly does not grant any patent rights.': '變體且明確不授予任何專利權。',
    // …approved by the European Commission in <a>23 official languages</a> of the European Union.
    'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in':
      '歐盟公共授權條款 (EUPL) 是由歐盟執委會發起並以歐盟',
    '23 official languages': '23 種官方語言',
    'of the European Union.': '版本核准的 Copyleft 自由/開源軟體授權條款。',
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …（整句由 inline 处理）
    'but requires derivatives be distributed under the same or a similar,': '但要求衍生作品以相同或類似的',
    'license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.':
      '授權條款散布。常用於媒體素材和教材。其舊版本是維基百科等維基媒體計畫的預設授權條款。不建議用於軟體。',
    // 说明（其余许可证）
    'The Academic Free License is a variant of the Open Software License that does not require that the source code of derivative works be disclosed. It contains explicit copyright and patent grants and reserves trademark rights in the author.':
      '學術自由授權條款是不要求公開衍生作品原始碼的開放軟體授權條款變體。它明確授予著作權和專利權並為作者保留商標權。',
    'A permissive license whose main conditions require providing notice of the license. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.':
      '一種主要條件為提供授權條款聲明的寬鬆授權條款。貢獻者明確授予專利權。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始碼。',
    'This license is designed to provide: a) a simple permissive license; b) that is compatible with the GNU GPL-2.0; and c) which also has an express patent grant included.':
      '此授權條款旨在提供：a) 一種簡單的寬鬆授權條款；b) 與 GNU GPL-2.0 相容；c) 同時明確包含專利授權。',
    'Strong copyleft license made by three French public research organisations, CEA, CNRS, and Inria, compatible with AGPL-3.0, EUPL-1.1, and GPL-2.0, or later versions of those licenses.':
      '由法國三家公共研究機構 CEA、CNRS 和 Inria 制定的強 Copyleft 授權條款，與 AGPL-3.0、EUPL-1.1 和 GPL-2.0 或這些授權條款的更新版本相容。',
    'A permissive license for hardware designs, with conditions only requiring preservation of notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without sources.':
      '一種用於硬體設計的寬鬆授權條款，僅以保留聲明為條件。貢獻者明確授予專利權。授權作品、修改版本和更大的作品可以依不同條款散布且無需提供原始檔。',
    'Permissions of this strongly reciprocal license for hardware designs are conditioned on making available complete sources of licensed works and modifications, which include larger works using a licensed work, under the same license. Notices must be preserved. Contributors provide an express grant of patent rights.':
      '這種用於硬體設計的強互惠授權條款授予權利的條件是以相同授權條款公開授權作品和修改版本的完整原始檔，修改版本包括使用授權作品的更大作品。必須保留聲明。貢獻者明確授予專利權。',
    'Permissions of this weakly-reciprocal license are conditioned on making available complete sources of licensed works and modifications under the same license. Notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without sources for the larger work.':
      '這種弱互惠授權條款授予權利的條件是以相同授權條款公開授權作品和修改版本的完整原始檔。必須保留聲明。貢獻者明確授予專利權。但透過授權作品提供的介面使用它的更大作品，可以依不同條款散布且無需提供該更大作品的原始檔。',
    'The Educational Community License version 2.0 ("ECL") consists of the Apache 2.0 license, modified to change the scope of the patent grant in section 3 to be specific to the needs of the education communities using this license.':
      '教育社群授權條款 2.0 版 (ECL) 由 Apache 2.0 授權條款修改而成，將第 3 節中專利授權的範圍改為專門符合採用此授權條款的教育社群的需求。',
    'The “European Union Public Licence” (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in 22 official languages of the European Union.':
      '「歐盟公共授權條款」(EUPL) 是由歐盟執委會發起並以歐盟 22 種官方語言版本核准的 Copyleft 自由/開源軟體授權條款。',
    'A copyleft license for software documentation.': '一種用於軟體文件的 Copyleft 授權條款。',
    'The LaTeX Project Public License (LPPL) is the primary license under which the LaTeX kernel and the base LaTeX packages are distributed.':
      'LaTeX 專案公共授權條款 (LPPL) 是 LaTeX 核心和 LaTeX 基本巨集套件散布時採用的主要授權條款。',
    'An open source license with a patent grant.': '一種附帶專利授權的開源授權條款。',
    'The Open Database License (ODbL) is a license agreement intended to allow users to freely share, modify, and use a database while maintaining this same freedom for others.':
      '開放資料庫授權條款 (ODbL) 是一種授權協議，旨在讓使用者自由分享、修改和使用資料庫，同時為他人保留同樣的自由。',
    "Permissions of this copyleft license are conditioned on distributing source code of licensed works and modifications under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. Using the work or modifications to provide services to external users is treated as distribution and also requires making source code available. Works that merely link to a licensed work are considered collective works and are not subject to the license's reciprocity requirements.":
      '這種 Copyleft 授權條款授予權利的條件是以相同授權條款散布授權作品和修改版本的原始碼。必須保留著作權和授權條款聲明。貢獻者明確授予專利權。使用作品或修改版本向外部使用者提供服務視同散布並同樣需要公開原始碼。僅連結到授權作品的作品視為集合作品且不受此授權條款互惠要求的約束。',
    'A very short, BSD-style license, used specifically for PostgreSQL.': '一種非常簡短的 BSD 風格授權條款，專用於 PostgreSQL。',
    'A permissive, OSI- and FSF-approved, GPL-compatible license, expressly allowing attribution with just a copyright notice and a short form link rather than the full text of the license. Includes an express grant of patent rights. Licensed works and modifications may be distributed under different terms and without source code, and the patent grant may also optionally be expanded to larger works to permit use as a contributor license agreement.':
      '一種經 OSI 和 FSF 核准、與 GPL 相容的寬鬆授權條款，明確允許僅以著作權聲明和簡短連結而非授權條款全文的形式標示出處。包含明確的專利授權。授權作品和修改版本可以依不同條款散布且無需提供原始碼，專利授權也可選擇擴及更大的作品，以便作為貢獻者授權協議使用。',
    'There are no restrictions on using or distributing an unmodified copy of the software. Parts of the software may also be distributed, but the license text must always be included. For modified versions a few restrictions apply. The license is GPL compatible, you may compile the software with GPL libraries and distribute it.':
      '使用或散布軟體的未修改副本不受任何限制。也可以散布軟體的部分內容，但必須一律附上授權條款文字。修改版本有少數限制。此授權條款與 GPL 相容，你可以將軟體與 GPL 程式庫一起編譯並散布。',
    // 说明中的链接文字（许可证名）
    'BSD 2-Clause License': 'BSD 2-Clause 授權條款',
    'BSD 3-Clause License': 'BSD 3-Clause 授權條款',
    'BSD 3-clause License': 'BSD 3-Clause 授權條款',
    'Apache License': 'Apache 授權條款',
    'MIT/X11 license': 'MIT/X11 授權條款',
    'Creative Commons CC0 Public Domain Dedication': '創用 CC0 公共領域貢獻宣告',
    // The <a>Creative Commons CC0 Public Domain Dedication</a> waives …：开头的 The 由 blob.ts 的 scoped 处理，其后见上
    // University of Illinois/NCSA：… based on the <a>MIT/X11 license</a> and the <a>BSD 3-clause License</a>. Its …
    // 中间的 and the 由通用词典处理
    'The University of Illinois/NCSA Open Source License, or UIUC license, is a permissive free software license, based on the':
      '伊利諾大學/NCSA 開源授權條款，又稱 UIUC 授權條款，是一種寬鬆自由軟體授權條款，基於',
    '. Its conditions include requiring the preservation of copyright and license notices both in source and in binary distributions and the prohibition of using the names of the authors or the project organization to promote or endorse derived products.':
      '。其條件包括以原始碼和二進位形式散布時都必須保留著作權和授權條款聲明以及禁止使用作者或專案組織的名義推廣或背書衍生產品。'
  },

  scoped: {
    // 许可证规则分组与标签（Permissions 由通用词典处理）
    Limitations: '限制',
    Conditions: '條件',
    'Commercial use': '商業用途',
    Modification: '修改',
    Distribution: '散布',
    'Private use': '私人使用',
    'Patent use': '專利使用',
    'License and copyright notice': '授權條款和著作權聲明',
    'License and copyright notice for source': '原始碼的授權條款和著作權聲明',
    'State changes': '註明變更',
    'Disclose source': '公開原始碼',
    'Network use is distribution': '網路使用即散布',
    'Same license': '相同授權條款',
    'Same license (file)': '相同授權條款（檔案）',
    'Same license (library)': '相同授權條款（程式庫）',
    'Trademark use': '商標使用',
    Liability: '責任',
    Warranty: '擔保',
    'Similar to': '類似於',
    compatible: '相容'
  },

  inline: [
    // 含链接的许可证说明（div.VerifiedHTMLBox__* 内的 HTML，取自 choosealicense.com 数据）：
    // 语序要跨链接调整、或链接两侧的空格要按中文重排的整句；其余含链接的说明按片段翻译
    // A permissive license similar to the <a>BSD 2-Clause License</a>, but with a 3rd clause …
    [
      'A permissive license similar to the {}, but with a 3rd clause that prohibits others from using the name of the copyright holder or its contributors to promote derived products without written consent.',
      '一種類似於 {}的寬鬆授權條款，但增加的第三條禁止他人未經書面同意使用著作權人或其貢獻者的名義推廣衍生產品。'
    ],
    // A variant of the <a>BSD 3-Clause License</a> that explicitly does not grant any patent rights.
    ['A variant of the {} that explicitly does not grant any patent rights.', '一種明確不授予任何專利權的 {}變體。'],
    // … approved by the European Commission in <a>23 official languages</a> of the European Union.
    [
      'The European Union Public Licence (EUPL) is a copyleft free/open source software license created on the initiative of and approved by the European Commission in {} of the European Union.',
      '歐盟公共授權條款 (EUPL) 是由歐盟執委會發起並以歐盟 {}版本核准的 Copyleft 自由/開源軟體授權條款。'
    ],
    // Similar to <a>CC-BY-4.0</a> but requires … a similar, <a>compatible</a> license. …
    [
      'Similar to {} but requires derivatives be distributed under the same or a similar, {} license. Frequently used for media assets and educational materials. A previous version is the default license for Wikipedia and other Wikimedia projects. Not recommended for software.',
      '類似於 {} 但要求衍生作品以相同或類似的{}授權條款散布。常用於媒體素材和教材。其舊版本是維基百科等維基媒體計畫的預設授權條款。不建議用於軟體。'
    ],
    // A permissive license similar to the <a>BSD 3-Clause License</a>, but with an "advertising clause" …（BSD 4-Clause）
    [
      'A permissive license similar to the {}, but with an "advertising clause" that requires an acknowledgment of the original source in all advertising material.',
      '一種類似於 {}的寬鬆授權條款，但增加了「廣告條款」，要求在所有廣告素材中標示原始來源。'
    ],
    // An open source license with a patent grant similar to the <a>Microsoft Public License</a>, …（Microsoft Reciprocal）
    [
      'An open source license with a patent grant similar to the {}, with the additional condition that any source code for any derived file be provided under this license.',
      '一種與{}類似並附帶專利授權的開源授權條款，附加條件是任何衍生檔案的原始碼都必須以此授權條款提供。'
    ],
    // A permissive license similar to the <a>Apache License</a>, but explicitly states … approved by OSI.（Mulan PSL v2）
    [
      'A permissive license similar to the {}, but explicitly states that it does not grant trademark rights. Mulan Permissive Software License is the first open source license in both Chinese and English approved by OSI.',
      '一種類似於 {}的寬鬆授權條款，但明確聲明不授予商標權。木蘭寬鬆授權條款是第一個獲得 OSI 核准的中英雙語開源授權條款。'
    ]
  ]
} satisfies PageDictionary
