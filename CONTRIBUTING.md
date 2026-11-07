# 贡献指南

感谢参与「GitHub 中文化」。本文说明反馈问题、改译文、改代码与提交拉取请求的约定。参与即表示同意遵守[行为准则](CODE_OF_CONDUCT.md)。

## 反馈

| 情况                             | 去处                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| 未翻译、译文有误、用户内容被翻译 | [新建议题](https://github.com/setube/github-chinese/issues/new/choose)，选「翻译问题」 |
| 功能异常                         | 新建议题，选「缺陷报告」                                                               |
| 新功能                           | 新建议题，选「功能建议」                                                               |
| 使用问题、讨论                   | [讨论区](https://github.com/setube/github-chinese/discussions)                         |
| 安全漏洞                         | 不要公开提交，见[安全政策](SECURITY.md)                                                |

- 翻译问题附页面地址、原文与截图；页面需要登录才能看到时注明。
- 缺陷报告写明浏览器及版本、扩展版本、复现步骤。
- 截图、日志里的账号、令牌、私有存储库内容先打码。

## 开发环境

1. 安装 [Bun](https://bun.sh)（版本见 `package.json` 的 `packageManager`）。
2. `bun install`
3. `bun run dev`（Chrome）、`bun run dev:edge`、`bun run dev:firefox`：开发模式，修改后自动重载。

命令一览见 [README · 常用命令](README.md#常用命令)。项目脚本一律用 `bun run`：`bun test`、`bun build` 是 Bun 自带命令，不是本项目的脚本。

## 改译文

1. 先读[术语表](docs/GLOSSARY.md)。繁体按[繁体术语表](docs/GLOSSARY.zh-TW.md)从英文翻译，贴合台湾用语，不做简繁转换。
2. 简体词典在 `src/locales/zh-CN/`，繁体在 `src/locales/zh-TW/`，同名文件、同键同结构。改了简体，同一拉取请求里同步繁体。
3. 只译 GitHub 的界面文字；存储库名、议题标题、评论、代码等用户内容保持原文。
4. 新增、修改正则规则时补单元测试：`tests/unit/locales/<区域>.test.ts`。
5. 自检：

   ```bash
   bun run check:locale
   bun run check:locale --locale=zh-TW
   bun run check:parity
   ```

词典字段、采集与覆盖率工具见 README「[常用命令](README.md#常用命令)」下的「词典维护」。

## 改代码

- TypeScript；Vue 单文件组件用 `<script setup lang="ts">`，块顺序为 `<template>`、`<script>`、`<style>`。
- 格式以 Prettier 为准（`.prettierrc.json`：不加分号、单引号、行宽 140、LF 换行），提交前运行 `bun run format`。
- 注释与日志用简体中文。
- 扩展界面文案在 `src/i18n/`，简体、繁体、英文三份同步；文案用短标签（如「加载失败」「暂无数据」），不写解释、建议或客套话。
- 新功能、缺陷修复带单元测试（Vitest + happy-dom，放在 `tests/unit/`）。
- 测试数据用中性占位：`octocat`、`vuejs/core`、`Sample text`；不写真实账号、邮箱、令牌、地址。
- 新增网络请求、存储项时，同步更新 [README · 隐私与权限](README.md#隐私与权限)与[隐私说明](docs/PRIVACY.md)。
- 需要新增扩展权限时，先开议题讨论。

## 提交前检查

与[发布工作流](.github/workflows/release.yml)的检查相同：

```bash
bun run lint
bun run compile
bun run check:parity
bun run check:locale
bun run check:locale --locale=zh-TW
bun run test
```

## 提交信息

格式为 `<类型>: <说明>`，说明用简体中文。

| 类型       | 用于                 |
| ---------- | -------------------- |
| `feat`     | 新功能               |
| `fix`      | 缺陷修复、补译、改译 |
| `refactor` | 不改行为的重构       |
| `perf`     | 性能                 |
| `test`     | 只改测试             |
| `docs`     | 只改文档             |
| `style`    | 只改格式             |
| `chore`    | 版本号、依赖、杂项   |
| `ci`       | 工作流               |

例：`fix: 补译拉取请求差异页的 You made it to the end!`

## 拉取请求

1. 从 `main` 新建分支；一个拉取请求只做一件事。
2. 说明里写改了什么、怎么验证的；界面改动附浅色、深色截图。
3. 通过上面的检查后提交，维护者审查后合并。
4. 贡献的代码与译文按 [MIT 许可证](LICENSE)发布。
