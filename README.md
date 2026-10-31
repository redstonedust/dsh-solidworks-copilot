# SolidWorks 副驾 · DSH 插件

**DSH 插件 + 零依赖 CLI**：为 [SolidWorks 自动化技能](https://github.com/wzyn20051216/solidworks-automation-skill) 配一个随叫随到的助手。
选个模板、填几个数字，拿到一份 AI 能照着做的需求书；缺技能，顺手一条命令装好。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Upstream: MIT](https://img.shields.io/badge/Upstream-MIT-blue.svg)](licenses/UPSTREAM-MIT.txt)
![DSH plugin](https://img.shields.io/badge/DSH-plugin-4b8bf5)
![Node](https://img.shields.io/badge/node-%E2%89%A520-339933)
![100% vibe coding](https://img.shields.io/badge/100%25-vibe%20coding-ff69b4)

**简体中文** · [English](README.en.md)

---

## 目录

- [为什么需要它](#为什么需要它)
- [3 分钟上手](#3-分钟上手)
- [里面有什么](#里面有什么)
- [安装](#安装)
- [配置](#配置)
- [CLI](#cli)
- [工具](#工具)
- [Agent 模式](#agent-模式)
- [排障](#排障)
- [构建与测试](#构建与测试)
- [0.2.0 修掉的问题](#020-修掉的问题)
- [范围与边界](#范围与边界)
- [仓库结构](#仓库结构)
- [许可与署名](#许可与署名)
- [关于](#关于)

---

## 为什么需要它

跟 AI 说「画个安装板」，它多半会给你一块板：孔位乱放、圆角忘了、做完也没法验。
问题不在模型，在于**没给约束**。

这个插件把「约束」做成可复用的东西：

- **模板**写死特征顺序、公差、验收证据和禁止项；
- 你只负责**填数字**，没填的会被点名，不会被默认值悄悄糊过去；
- **门禁**是「说完成之前」必须逐条过一遍的清单。

---

## 3 分钟上手

不需要懂 SolidWorks API。你只要知道：要做个什么、多大、几个孔。

### 1. 装上

```js
plugin_manager({ action: 'install_bundle', target: '<本仓库绝对路径>' })
```

刷新页面。侧边栏会多一个 **SolidWorks 副驾** 图标，输入框下方会多一条小卡。

### 2. 挑模板

点侧边栏图标，默认就在 **选模板**。16 个模板按 *零件 / 孔和槽 / 齿轮 / 钣金 / 装配 / 动画 / 出图 / 导出 / 检查* 分组，卡片上只写两件事：**难不难**（简单 · 中等 · 高级）和 **是什么类**。

拿不准就点第一个「安装板 / 支架」。

### 3. 填数字、生成、粘贴

1. 先写一句「你要做什么」（可不填，模板已经带了标准写法）；
2. 把知道的数字填进去，**不知道的留空**，AI 会回来问你要；
3. 点 **生成提示词**。

结果是一份完整需求书：目标、参数表、执行步骤、验收证据、硬性约束、禁止项。

- 侧边栏页面：点 **复制** → 回对话粘贴发送；
- 输入框小卡：点 **放进对话框** → 回车发送。

### 4. 可选：让它先自证

切到 **做完检查**，选这次是零件 / 孔槽 / 装配 / 动画 / 出图 / 导出，生成检查清单，粘给 AI 逐条报。
*「我完成了」不算完成，附上证据才算。*

### 不装插件也能用

```bash
node bin/swas.mjs templates
node bin/swas.mjs prompt --template part-bracket \
  --set PART_NAME=电机安装板 --set SIZE=120x80x10 --set MATERIAL=6061-T6
node bin/swas.mjs agents
node bin/swas.mjs install --target codex --dry-run
```

零依赖，Node ≥ 20。

---

## 里面有什么

| 层 | 内容 |
|---|---|
| **界面** | 侧边栏整页（6 个标签页）+ 输入框下方小卡，共用同一份知识库 |
| **7 个工具** | `swas_templates` · `swas_prompt` · `swas_plan` · `swas_tips` · `swas_gate` · `swas_deploy` · `swas_status` |
| **2 个 Agent 模式** | `swas-cad`（可写建模）· `swas-review`（只读交付复核） |
| **内容** | 16 个 UI 模板 · 5 张需求书模板 · 60 条技巧 · 8 组门禁 · 9 段设计思路 · 18 条任务路由 |
| **CLI** | `install` · `agents` · `templates` · `prompt`：钉死 commit、写 provenance、绝不覆盖已有安装 |

---

## 安装

### 方式一：作为 DSH 插件（推荐）

```js
plugin_manager({ action: 'install_bundle', target: '<本仓库绝对路径>' })
```

Host 工具立刻可用；面板在**刷新页面**后出现（Client 模块在页面启动时装配）。返回 `restart-required` 时重启一次 DSH。

### 方式二：手动挂载

把仓库放到 `~/.dsh/plugins/dsh-solidworks-copilot`，在 profile 的 `dependencies` 里加 `link:`，把包名加进 `dsh.profile.bundles`，重启 DSH。

### 方式三：只用 CLI

```bash
git clone https://github.com/redstonedust/dsh-solidworks-copilot.git
cd dsh-solidworks-copilot
node bin/swas.mjs --help
```

---

## 配置

```yaml
- id: solidworks-copilot
  name: dsh-solidworks-copilot
  config:
    skillDir: ''          # 填了就替换提示词里的 SKILL_DIR
    defaultDetail: full   # brief | full，提示词默认详细度
    maxTips: 12           # swas_tips 默认返回条数
    autoFetch: false      # 加载时是否自动部署上游技能（默认关）
    autoFetchTarget: codex
```

`autoFetch` 默认**关闭**是有意为之：装个插件不应该顺手联网、往你的 home 目录里写东西。

---

## CLI

```text
node bin/swas.mjs <命令> [选项]

  install     部署上游 SolidWorks 自动化技能（默认子命令）
  agents      列出 codex / claude / cursor / agents / openclaw 状态
  templates   列出 5 张需求书模板
  prompt      用模板渲染需求书
```

| 选项 | 含义 |
|---|---|
| `--target codex,claude` / `--target all` | 装到哪些客户端（`all` 只碰 skills 目录已存在的） |
| `--ref <commit/tag/分支>` | 上游 ref，默认钉死 `2f455f2e`；会校验，以 `-` 开头的值直接拒绝 |
| `--force` | 目标已存在时先改名为 `<dir>.bak-<时间戳>`，不删除 |
| `--dry-run` | 只打印计划，不改任何东西 |
| `--template <id>` `--set K=V` `--out <file>` `--strict` | 仅 `prompt`；`--strict` 有未填字段时以非零退出 |

---

## 工具

```text
swas_templates  { action: 'list' | 'get' | 'routing' | 'specs' | 'spec', id?, category?, query?, params? }
swas_prompt     { task?, template?, params?: { key: value }, detail?: 'brief' | 'full' }
swas_plan       { task?, template?, constraints? }
swas_tips       { query?, category?, limit? }
swas_gate       { workflow?, capability?, task? }
swas_deploy     { action: 'status' | 'install', target?, ref?, dryRun?, force? }
swas_status     { }
```

典型链路：

1. `swas_deploy({ action: 'status' })` —— 技能到底装了没有；
2. `swas_templates({ action: 'routing', query: '安装板，四个 M6 沉孔' })` —— 该用哪个脚本、看哪篇文档；
3. `swas_prompt({ task: '…', template: 'mounting-bracket', params: { size: '120×80×10' } })` —— 可执行需求书；
4. 跑完回读证据，最后 `swas_gate({ workflow: 'mounting_bracket' })` 过门禁。

---

## Agent 模式

两行 `@deepseek-ai/dsh-agent-preset`，bundle 启用后出现在会话的 Agent 模式选择器里。

| 模式 | 姿态 | 强制规则 |
|---|---|---|
| `swas-cad` · SolidWorks · 建模执行 | 可写 | 先方案后动手 · 一律米制 · 草图完全定义 · 基体 → 切除 → 孔槽 → 圆角 · 四视图 + SHA-256 证据 |
| `swas-review` · SolidWorks · 交付复核 | 只读 | 产物清单 · 哈希对账 · `*_review_report.json` · 四视图 · 门禁逐条判定 + 修复动作 |

人设文档在 `prompts/*.md`，由 `scripts/build-presets.mjs` 编译进 `presets/*.patch.yml`。

---

## 排障

**面板不出现。** 按这四条查——缺任何一条，Client 模块会被**静默跳过**：

1. `package.json` 里有 `dsh.client`，且 `platform` 为 `"web"`；
2. `exports` 里**同时**有 `"./client"` 与 `"./package.json"`。Client 模块表用 `createRequire(...).resolve('<pkg>/package.json')` 定位清单，缺这条会 `ERR_PACKAGE_PATH_NOT_EXPORTED`，界面上却什么都不报；
3. 包名在 profile 的 `dsh.profile.bundles` 里；
4. Client 模块表在 DSH 启动时建立——安装或升级后重启一次。

**自检。** 调 `swas_status`，看「Web 面板模块」一行；只有显示 `已装配（…/client.js）` 才算真正进了装配图。

**技能没装。** `swas_deploy({ action: 'status' })` 会列出每个客户端的状态（`installed-by-plugin` / `unmanaged` / `not-installed`）；用 `action: 'install'` 安装，`dryRun` 默认 `true`。

---

## 构建与测试

面板数据是**构建期烘焙**进 `client.js` 的（浏览器端只能 `require('react')`，不能 import 本地模块）：

```bash
node scripts/import-content.mjs   # 调研 JSON（_sw_pack/）→ content/*.js；仓库已带产物，可跳过
node scripts/build-client.mjs     # catalog.js + generate.js → client.js
node scripts/build-presets.mjs    # prompts/*.md → presets/*.patch.yml
node scripts/smoke.mjs            # 真 React SSR 渲染每个标签页 + 注册契约
node scripts/selftest.mjs         # 桩 ctx：7 个工具全部正常/边界用例
```

改了 `catalog.js`、`content/*.js`、`prompts/*.md` 或 `src/client.js` 之后，重跑对应构建。

---

## 0.2.0 修掉的问题

| 问题 | 现象 | 修法 |
|---|---|---|
| 必填与可选混算 | 只缺 3 个必填，却报 5 个缺失 | `buildPrompt` 拆出 `missing` 与 `optionalMissing`，结果分行显示 |
| 未知 action 静默兜底 | `swas_templates({ action: 'nonsense' })` 看起来像成功了 | 显式返回「未知 action + 可用列表」 |
| 需求输入框在生成按钮下方 | 得先点生成，才看得见「你要做什么」 | 输入框上移到参数区之前 |

---

## 范围与边界

- 面向 [SolidWorks 自动化技能](https://github.com/wzyn20051216/solidworks-automation-skill)，内容按 commit `2f455f2e` 提炼。
- **能力等级以技能的 `capabilities.yaml` 为准**：`reference_only` / `not_implemented` 不得作为无人值守交付，`pilot` 需人工复核。
- 插件只生成文本、读技能目录，不修改模型文件。
- 部署是**选做**（`autoFetch: false`），`install` 默认 `dryRun: true`，目标已存在则跳过，`force` 仅备份改名，从不执行上游 `install.js`。
- 真正建模仍需要本机合法授权的 SolidWorks。

---

## 仓库结构

```text
index.js              Host 半：注册 7 个工具
catalog.js            知识库装配：模板、技巧、门禁、工作流、九段式骨架、Agent 模式
generate.js           提示词 / 思路 / 技巧 / 门禁生成器（Host 与构建期共用）
content/*.js          生成的数据
lib/fetch-core.mjs    部署核心：目标解析、单 ref 拉取、provenance、ref 校验
lib/templates.mjs     需求书模板：front matter、占位符渲染、缺失字段报告
bin/swas.mjs          CLI：install / agents / templates / prompt
templates/*.md        5 张需求书模板
src/client.js         面板源码（含数据占位符）
client.js             构建产物：数据内联后的浏览器模块
presets/*.patch.yml   Agent 模式（人设由 prompts/*.md 编译）
prompts/*.md          人设文档
docs/legal-analysis.md  部署时拉取上游的合规分析
scripts/              构建、冒烟、自测
licenses/UPSTREAM-MIT.txt  上游 MIT 全文
NOTICE                衍生内容署名、商标与范围声明
```

---

## 许可与署名

- **本仓库**：MIT，见 [LICENSE](LICENSE)。
- **衍生内容**：`content/`、`catalog.js`、`generate.js`、`templates/` 中的模板、技巧、门禁与提示词骨架，提炼/改写自上游 **SolidWorks 自动化技能**（MIT，Copyright (c) 2026 SolidWorks Automation Skill Contributors）。上游许可全文随仓库提供：[licenses/UPSTREAM-MIT.txt](licenses/UPSTREAM-MIT.txt)；钉死来源 commit 记录在 [NOTICE](NOTICE)。
- **商标**：SOLIDWORKS® 是 Dassault Systèmes SolidWorks Corporation 的商标，此处仅用于指示兼容对象。本项目与 Dassault Systèmes 无隶属、赞助或背书关系。
- **范围**：插件只生成文本、部署上游代码、调用上游脚本；不含也不执行任何许可绕过、补丁或激活绕过。

---

## 关于

本项目采用 **100% vibe coding** 方式开发：全部代码、文档与测试均由 AI 依据自然语言指令生成，人工不手写实现，只在需求澄清、代码评审与验收环节介入。该标注说明的是实现来源，不构成质量背书。

具体做法如下。

**需求以对话形式提出。** 每轮改动对应一个明确诉求（例如"界面不要暴露英文键名""按钮对比度不足""补充零基础使用说明"），并以可审查的提交落地，提交信息记录改了什么、为什么改。

**对外宣称的行为必须实跑验证。** 仓库内两组测试分别覆盖不同层面：

- `scripts/smoke.mjs` 使用真实 React 渲染校验三处 slot 注册、主面板六个标签页与 i18n 回退；
- `scripts/selftest.mjs` 以桩上下文调用全部 7 个工具，覆盖空参数、类型错误、非法 target、未知 action 与 `git` 选项注入等边界。

0.2.0 修复的三个缺陷均由上述测试发现，而非代码阅读推断。

**依赖与合规按常规工程标准处理。** 上游内容保留 MIT 署名与许可全文（`NOTICE`、`licenses/UPSTREAM-MIT.txt`）；部署默认关闭，需显式 `dryRun: false` 才落盘；`ref` 参数做形态校验，避免被解释为 `git` 选项。

需要说明的是：100% vibe coding 指实现由 AI 生成，不代表免于评审。使用前仍应逐次检查 diff、运行测试，并确认插件对目标机器的写入范围（本插件仅写目标 `skills/` 目录）。

阅读顺序建议：`index.js`（7 个工具）→ `lib/fetch-core.mjs`（部署）→ `src/client.js`（界面）。若只想使用，[3 分钟上手](#3-分钟上手) 已覆盖全部必要步骤。
