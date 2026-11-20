import type { PageDictionary } from '../../../core/types'
import { joinCjk, TIME_SOURCE, translateTime } from '../helpers'

/** 计算机规格里的数字单位：2 cores, 8 GB RAM, 32 GB storage */
const SPEC = '(\\d+) cores?, (\\d+) GB RAM, (\\d+) GB storage'

/**
 * 代码空间页（/codespaces、/codespaces/new、/codespaces/templates、代码空间启动页、
 * /codespaces/allow_permissions）：侧栏、代码空间列表与操作提示、快速启动模板、入门卡片、
 * 新建表单、启动状态、使用量警告。产品名译法见 codespaces.ts 文件头。
 * 模板卡片的说明来自模板存储库描述（用户内容），不收录；调查横幅见 code/banners.ts。
 */
export default {
  static: {
    // 侧栏与列表
    'Your codespaces': '你的代码空间',
    'By repository': '按存储库',
    'Created from a template': '从模板创建',
    'Your instant dev environment': '你的即时开发环境',
    'Go from code to commit faster on any project.': '在任何项目中更快地从编码到提交。',
    'Go to docs': '转到文档',
    'Explore quick start templates': '浏览快速启动模板',
    'Choose a template': '选择模板',
    'Create a new codespace': '创建新的代码空间',
    'Dev container configuration': '开发容器配置',
    'Default project configuration': '默认项目配置',
    'Default Codespaces configuration': '默认代码空间配置',
    'Prebuild ready': '预生成就绪',
    'Prebuild in progress': '正在预生成',
    'No codespaces yet': '暂无代码空间',
    'Codespace is being deleted': '正在删除代码空间',
    'Are you sure you want to delete this codespace?': '确定要删除此代码空间吗？',
    'Request Usage Report': '请求使用情况报告',
    'Show more actions for codespace': '显示代码空间的更多操作',
    'This codespace has uncommitted changes': '此代码空间有未提交的更改',

    // 使用量警告：……请查看你的 <计费设置>。
    'You seem to have a billing issue. Please adjust your billing settings to continue using codespaces.':
      '似乎存在计费问题。请调整计费设置以继续使用代码空间。',

    // 入门：链接把句子拆成片段（刚接触代码空间？<从这里开始>。了解……）
    'Getting started with GitHub Codespaces': 'GitHub 代码空间入门',
    'Learn core concepts': '了解核心概念',
    'New to Codespaces?': '刚接触代码空间？',
    '. Learn the core concepts and how to get started.': '。了解核心概念和入门方法。',
    'Configure and manage': '配置和管理',
    // 进一步了解 <机密管理> 和 <端口转发>
    'Learn more about features like': '进一步了解',
    'Develop locally': '在本地开发',
    // 访问代码空间时可使用 <Visual Studio Code>
    'Access codespaces from within': '访问代码空间时可使用',

    // 模板页
    'Codespace templates': '代码空间模板',
    'Start a codespace from a template and get to developing with the power of a virtual machine in the cloud.':
      '从模板启动代码空间，借助云端虚拟机开始开发。',
    // 快速启动模板卡片的说明（模板名是产品名，保留原文）
    'Start with a blank canvas or import any packages you need.': '从空白画布开始或导入所需的任意软件包。',
    'A popular JavaScript library for building user interfaces based on UI components.': '基于 UI 组件构建用户界面的热门 JavaScript 库。',
    'A full-stack web application template written in C#.': '用 C# 编写的全栈 Web 应用模板。',
    'A full-stack web framework for building dynamic websites that deliver a rich user experience.':
      '用于构建可提供丰富用户体验的动态网站的全栈 Web 框架。',
    'JupyterLab is the latest web-based interactive development environment for notebooks, code, and data.':
      'JupyterLab 是最新的基于 Web 的笔记本、代码和数据交互式开发环境。',
    'Express is a minimal and flexible Node.js web application framework.': 'Express 是精简而灵活的 Node.js Web 应用框架。',
    'Next.js is a React framework that gives you building blocks to create web applications.':
      'Next.js 是为创建 Web 应用提供构建块的 React 框架。',
    'Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.':
      'Django 是鼓励快速开发和简洁、务实设计的高级 Python Web 框架。',
    'Flask is a lightweight web application framework.': 'Flask 是轻量级 Web 应用框架。',
    'A fast 3kB alternative to React with the same modern API.': '具有相同现代 API 的快速 3kB React 替代方案。',
    'Examples running via semihosting output on an Arm FVP simulation model.': '在 Arm FVP 仿真模型上通过半主机输出运行的示例。',
    // 页头导航：窄屏左侧按钮的提示、侧栏的无障碍名称
    'Open Codespaces navigation': '打开代码空间导航',
    'Codespaces navigation': '代码空间导航',
    'Codespaces navigation links': '代码空间导航链接',

    // 新建表单
    'Create new codespace': '新建代码空间',
    'Get started with development in the cloud from an existing repository or a template.': '从现有存储库或模板开始云端开发。',
    'Find out more about codespaces.': '进一步了解代码空间。',
    'Start coding': '开始编码',
    'Unable to load repositories, please reload the page.': '无法加载存储库，请重新加载页面。',
    'No matching repositories.': '没有匹配的存储库。',
    'Pick a repository first.': '请先选择存储库。',
    'Codespace creation is disabled': '已禁止创建代码空间',
    'To be cloned into your codespace': '将克隆到你的代码空间中',
    'This branch will be checked out on creation': '创建时将检出此分支',
    'Your codespace will use this configuration': '你的代码空间将使用此配置',
    'Your codespace will run in the selected region': '你的代码空间将在所选区域运行',
    'Resources for your codespace': '为代码空间分配的资源',
    // 使用量付费方为 <owner>
    'Usage paid for by': '使用量付费方为',
    // 为指定存储库创建：创建代码空间用于 <owner/repo>
    'Create codespace for': '创建代码空间用于',
    'No codespace to resume': '没有可恢复的代码空间',
    "You don't have a codespace matching these settings. You can continue to create a new one or customize your settings.":
      '你没有符合这些设置的代码空间。你可以继续创建新的代码空间，或自定义设置。',
    'You don’t have a codespace matching these settings. You can continue to create a new one or customize your settings.':
      '你没有符合这些设置的代码空间。你可以继续创建新的代码空间，或自定义设置。',
    'Change options': '更改选项',

    // 启动页
    'Setting up your codespace': '正在设置你的代码空间',
    'Launching Visual Studio Code': '正在启动 Visual Studio Code',
    'Launching JetBrains Gateway': '正在启动 JetBrains Gateway',
    // ……如果没有，请确认已 <安装>。
    'You should have received a prompt to open Visual Studio Code. If not, ensure it is':
      '你应该已收到打开 Visual Studio Code 的提示。如果没有，请确认已',
    'You should have received a prompt to open the JetBrains Gateway. If not, ensure it is':
      '你应该已收到打开 JetBrains Gateway 的提示。如果没有，请确认已',
    'Your codespace will open once ready.': '代码空间就绪后将自动打开。',
    'There was a problem preparing your codespace, please try again.': '准备代码空间时出现问题，请重试。',
    'Starting codespace': '正在启动代码空间',
    'Starting codespace...': '正在启动代码空间...',
    'Starting codespace…': '正在启动代码空间…',
    'Stopping codespace': '正在停止代码空间',
    'Stopping codespace...': '正在停止代码空间...',
    'Stopping codespace…': '正在停止代码空间…',
    'Building codespace...': '正在构建代码空间...',
    'Building codespace…': '正在构建代码空间…',
    'Connecting to codespace...': '正在连接代码空间...',
    'Connecting to codespace…': '正在连接代码空间…',
    'Restart codespace': '重新启动代码空间',
    'Rebuild codespace': '重新构建代码空间',
    'Codespace stopped': '代码空间已停止',
    'This codespace is stopped.': '此代码空间已停止。',

    // 申请额外权限（/codespaces/allow_permissions）：此 codespace 正在请求 <额外权限>
    'This codespace is requesting': '此代码空间正在请求',
    'additional permissions': '额外权限',
    'Your codespace is requesting the following permissions for these repositories:': '你的代码空间正在为这些存储库请求以下权限：',
    'The following permissions were also requested but are not available. You can continue but the codespace may not function as intended.':
      '还请求了以下权限，但这些权限不可用。你可以继续，但代码空间可能无法按预期运行。',
    'Continue without authorizing': '不授权并继续',
    'Authorize and continue': '授权并继续'
  },
  scoped: {
    // 模板名（快速启动模板卡片的标题被全局忽略规则屏蔽时不生效）
    Blank: '空白',
    // 入门卡片的链接文字
    'Start here': '从这里开始',
    'secret management': '机密管理',
    'port forwarding': '端口转发',
    // 使用量警告的链接文字
    'billing settings': '计费设置',
    // 代码空间状态（单独的进度动名词作“X中”）
    Active: '活动中',
    Stopped: '已停止',
    Retained: '已保留',
    Available: '可用',
    Shutdown: '已关闭',
    'Shutting down': '关闭中',
    Starting: '启动中',
    Stopping: '停止中',
    Rebuilding: '重新构建中',
    Exporting: '导出中',
    Provisioning: '预配中',
    Queued: '已排队',
    Unavailable: '不可用',
    Failed: '失败',
    'No changes': '无更改',
    // 被链接或时间元素隔开的片段：归属于 <owner>、上次使用 <3 天前>、到期时间 <3 天后>、创建自 <模板>
    'Owned by': '归属于',
    'Last used': '上次使用',
    'Expiring in': '到期时间',
    'Created from': '创建自',
    'Are you sure you want to delete': '确定要删除',
    // 新建表单（区域名 US East 等见 repo-settings/codespaces.ts 的 static；Select repository 由 common-ui 翻译）
    Branch: '分支',
    'Select branch': '选择分支',
    'Default branch': '默认分支',
    'Default Branch': '默认分支',
    // 分支选择器
    'Switch branches': '切换分支',
    'Find a branch': '查找分支',
    'Find a branch...': '查找分支...',
    'Find a branch…': '查找分支…',
    default: '默认',
    branches: '分支',
    // 导出对话框的主按钮（Create ${target}）
    'Create branch': '创建分支',
    'new codespace': '新的代码空间',
    Region: '区域',
    'View logs': '查看日志',
    installed: '安装',
    // 申请额外权限
    'Contents:': '内容：',
    write: '写入'
  },
  regexp: [
    [/^Owned by ([\w.-]+)$/, '归属于 $1'],
    [new RegExp(`^Last used (${TIME_SOURCE})$`), (_, time: string) => joinCjk('上次使用', translateTime(time))],
    [new RegExp(`^Auto-deletes? (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '自动删除')],
    [new RegExp(`^Created (${TIME_SOURCE})$`), (_, time: string) => joinCjk(translateTime(time), '创建')],
    [/^Usage paid for by ([\w.-]+)$/, '使用量由 $1 支付'],
    [/^(\d+) codespaces?$/, '$1 个代码空间'],
    // 模板卡片的发布者：By github
    [/^By ([\w-]+)$/, '由 $1 发布'],

    // 列表状态与提示
    [/^This codespace is (\d+) commits? ahead of remote and has uncommitted changes$/, '此代码空间领先远程 $1 个提交且有未提交的更改'],
    [/^This codespace is (\d+) commits? ahead of remote$/, '此代码空间领先远程 $1 个提交'],
    [
      /^You['’]re at (\d+)% of your included usage for this billing period\. For more information, view your$/,
      '本计费周期包含的使用量已使用 $1%。详情请查看你的'
    ],
    [/^(\d+) permissions? requested$/, '请求了 $1 项权限'],

    // 操作结果（代码空间显示名带引号）
    [/^Codespace "(.+)" stopped\.$/, '代码空间“$1”已停止。'],
    [/^Codespace "(.+)" deleted\.$/, '代码空间“$1”已删除。'],
    [
      new RegExp(
        `^Your codespace "(.+)" has been updated to use machine type: "${SPEC}"\\. Changes will take effect the next time your codespace restarts\\.$`
      ),
      '你的代码空间“$1”已改用计算机类型“$2 核，$3 GB 内存，$4 GB 存储”。更改将在代码空间下次重启时生效。'
    ],
    [/^Your codespace "(.+)" has been updated\.$/, '你的代码空间“$1”已更新。'],
    [/^Your codespace "(.+)" will no longer be auto-deleted\.$/, '你的代码空间“$1”将不再自动删除。'],
    [/^(.+) has unpushed changes, are you sure you want to delete\?$/, '$1 有未推送的更改，确定要删除吗？'],
    [/^Are you sure you want to delete (.+)\?$/, '确定要删除 $1 吗？']
  ]
} satisfies PageDictionary
