# SolidWorks 副驾 · dsh-solidworks-copilot

**DSH 插件 + 零依赖 CLI**：把 SolidWorks 自动化技能做成「能点、能选、能复制」的助手，同时负责把技能装到你的 Agent 客户端。

一句话：**选个模板、填几个数字，拿到一份 AI 能照着做的需求书；缺技能就顺手装好。**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Upstream: MIT](https://img.shields.io/badge/Upstream-MIT-blue.svg)](https://github.com/wzyn20051216/solidworks-automation-skill/blob/main/LICENSE)
![DSH plugin](https://img.shields.io/badge/DSH-plugin-4b8bf5)
![Node](https://img.shields.io/badge/node-%E2%89%A520-339933)

---

## 零基础 3 分钟上手

不懂 SolidWorks API、不懂提示词工程也没关系。你只要知道「要做个什么东西、多大、几个孔」。

### 第 1 步：装上

在 DSH 里执行一次（需要 Full access）：

```js
plugin_manager({ action: 'install_bundle', target: '<本仓库路径>' })
```

装完刷新页面。侧边栏会多一个 **SolidWorks 副驾** 图标，输入框下方会多一条小卡。

### 第 2 步：打开，挑模板

点侧边栏图标 → 默认就是「选模板」。16 个模板按「零件 / 孔和槽 / 齿轮 / 钣金 / 装配 / 动画 / 出图 / 导出 / 检查」分组，卡片上只写两件事：**难不难**（简单 / 中等 / 高级）和 **是什么类**。

拿不准就选第一个「安装板 / 支架」。

### 第 3 步：填数字，生成，复制

点模板 → 顶部先写一句「你要做什么」（可不填）→ 右侧「要填的数字」里填外形尺寸、板厚、孔径、孔心距……**不知道的留空**，AI 会回来问你要。

点 **生成提示词** → 结果框里出现一份完整需求书（目标、参数表、执行步骤、验收证据、硬性约束、禁止项）。

- 在侧边栏页面：点 **复制**，回到对话粘上去发送。
- 在输入框下方小卡：点 **放进对话框**，直接写进输入框，按回车发送。

### 第 4 步（可选）：做完让它自检

切到「做完检查」，选这次是零件 / 孔槽 / 装配 / 动画 / 出图 / 导出，生成一张检查清单，粘给 AI 让它逐条报结果。**“我完成了” 不算完成，附了证据才算。**

### 不想装插件？纯命令行也行

```bash
node bin/swas.mjs templates            # 看 5 张需求书模板
node bin/swas.mjs prompt --template part-bracket \
  --set PART_NAME=电机安装板 --set SIZE=120x80x10 --set MATERIAL=6061-T6
node bin/swas.mjs agents               # 看哪些客户端装了技能
node bin/swas.mjs install --target codex --dry-run
```

零依赖，Node ≥ 20 即可。

---

## 它好上手在哪

| 特性 | 说明 |
|---|---|
| **说人话的界面** | 标签页叫「选模板 / 一句话生成 / 先想清楚 / 避坑指南 / 做完检查 / 专家模式」，不出现 `workflow`、`capability` 这类词 |
| **不用背参数名** | 模板自己声明要填哪些键，界面上是中文标签 + 示例如「外形尺寸 L×W×T (mm)｜例：120×80×10」 |
| **漏填不静默** | 必填缺失在结果里点名（`missing`）；可选的单独列（`optionalMissing`），不再把两者混在一起吓人 |
| **先想清楚再动手** | 「先想清楚」页把需求拆成九段（需求 → 单位 → 草图 → 特征顺序 → 装配 → 运动 → 出图 → 交付 → 风险） |
| **现成的坑位清单** | 60 条经验（单位是米、圆角放孔槽之后、`results_out_of_date=False` 才算算例有效……），搜一下就有 |
| **一条命令自检** | `swas_status` 告诉你：条目数、客户端状态、技能目录在不在、面板模块装没装 |
| **装技能不用记路径** | `swas_deploy` / `swas install`：先 `status` 看客户端，再 `dry-run` 看计划，确认后才落盘；已存在默认跳过 |
| **复制即用** | 生成结果支持「复制」或「放进对话框」，不需要手工挑段落 |
| **不碰你的模型** | 插件只生成文本、读技能目录；改模型仍由 Agent 调用上游技能脚本完成 |

---

## 功能一览

**界面**（两处，同一份知识库）

1. **侧边栏整页**：`sidebar.panellist` + `main` 键位 `solidworks-copilot`，六个标签页。
2. **输入框下方小卡**：`conversation.composer.dock`，收起一行入口，展开同样五个标签页，带「放进对话框」。

**7 个工具**

| 工具 | 干什么 |
|---|---|
| `swas_templates` | `list`/`get` 看 16 个 UI 模板；`routing` 按需求查脚本；`specs`/`spec` 用 5 张 CLI 需求书模板 |
| `swas_prompt` | 生成可执行提示词（`task` 自动匹配模板，`template` 指定，`params` 填参数） |
| `swas_plan` | 九段式设计思路 |
| `swas_tips` | 技巧库检索（单位 / 草图 / 选择 / 特征 / 孔 / 装配 / 运动 / 出图 / 导出 / 报错） |
| `swas_gate` | 按工作流或能力返回交付门禁与验收提示词 |
| `swas_deploy` | 客户端状态 / 部署上游技能（`dryRun` 默认 true，`force` 默认 false） |
| `swas_status` | 自检：条目数、客户端状态、技能目录、面板模块、自动部署开关 |

**2 个 Agent 模式**（`@deepseek-ai/dsh-agent-preset` 行，装完即可在会话的 Agent 模式选择器里选）

| 模式 | 干什么 |
|---|---|
| `swas-cad` · SolidWorks · 建模执行 | 可写建模：先方案后动手、米制与完全定义草图、孔槽圆角稳定顺序、四视图 + SHA-256 证据 |
| `swas-review` · SolidWorks · 交付复核 | 只读复核：产物清单、哈希对账、审查报告、四视图、门禁逐条判定 + 修复动作 |

**内容规模**：16 个 UI 模板 · 5 张 CLI 需求书模板 · 60 条技巧 · 8 组交付门禁 · 9 段设计思路 · 18 条任务路由。

---

## 安装

### 方式一：作为 DSH 插件（推荐）

```js
plugin_manager({ action: 'install_bundle', target: '<仓库绝对路径>' })
```

Host 工具立即可用；面板在页面刷新后出现（Client 模块在页面启动时装配）。若返回 `restart-required`，重启一次 DSH。

### 方式二：手动挂载

把仓库放到 `~/.dsh/plugins/dsh-solidworks-copilot`，在 profile 的 `dependencies` 里加一行 `link:`，并在 `dsh.profile.bundles` 里加入包名 `dsh-solidworks-copilot`，然后重启 DSH。

### 方式三：只用 CLI

```bash
git clone https://github.com/redstonedust/dsh-solidworks-copilot.git
cd dsh-solidworks-copilot
node bin/swas.mjs --help
```

### 配置（`cordis.patch.yml` 的这一行）

```yaml
- id: solidworks-copilot
  name: dsh-solidworks-copilot
  config:
    skillDir: ''          # 填了就把提示词里的 SKILL_DIR 换成真实路径
    defaultDetail: full   # brief | full，提示词默认详细度
    maxTips: 12           # swas_tips 默认返回条数
    autoFetch: false      # 加载时是否自动装上游技能（默认关，避免装插件就联网落盘）
    autoFetchTarget: codex
```

---

## CLI

```
node bin/swas.mjs <命令> [选项]

  install     把上游 SolidWorks Automation Skill 装到位（默认子命令）
  agents      列出 codex / claude / cursor / agents / openclaw 的目录状态
  templates   列出 5 张需求书模板
  prompt      用模板生成需求书
```

| 选项 | 说明 |
|---|---|
| `--target codex,claude` / `--target all` | 装到哪些客户端（`all` 只装到 skills 目录已存在的） |
| `--ref <commit/tag/分支>` | 上游 ref，默认钉死 `2f455f2e`；会被校验，不接受以 `-` 开头的值 |
| `--force` | 目标已存在时改名为 `<dir>.bak-<时间戳>` 再装，不删除 |
| `--dry-run` | 只打印计划 |
| `--template <id>` `--set K=V` `--out <file>` `--strict` | `prompt` 用；`--strict` 有未填字段时退出码 1 |

---

## 工具速查

```
swas_templates  { action: 'list' | 'get' | 'routing' | 'specs' | 'spec', id?, category?, query?, params? }
swas_prompt     { task?, template?, params?: { key: value }, detail?: 'brief' | 'full' }
swas_plan       { task?, template?, constraints? }
swas_tips       { query?, category?, limit? }
swas_gate       { workflow?, capability?, task? }
swas_deploy     { action: 'status' | 'install', target?, ref?, dryRun?, force? }
swas_status     {}
```

典型链路：

1. `swas_deploy({ action: 'status' })` → 看技能装了没有；没有就 `install`（先 `dryRun`）。
2. `swas_templates({ action: 'routing', query: '带四个 M6 沉孔的安装板' })` → 该用哪个脚本、看哪篇文档。
3. `swas_prompt({ task: '...', template: 'mounting-bracket', params: { size: '120×80×10' } })` → 可执行提示词。
4. 执行并回读证据，最后 `swas_gate({ workflow: 'mounting_bracket' })` 过门禁。

---

## 面板不出来怎么办

按这四条排查（缺一条模块会被静默跳过，界面上什么都不显示）：

1. `package.json` 有 `dsh.client` 且 `platform` 为 `web`；
2. `exports` 里同时有 `"./client"` 与 `"./package.json"`（Client 模块表用 `createRequire(...).resolve('<pkg>/package.json')` 定位清单，缺这条会 `ERR_PACKAGE_PATH_NOT_EXPORTED`）；
3. 包名在 profile 的 `dsh.profile.bundles` 里；
4. Client 模块表在 DSH 启动时建立，安装/升级后要重启一次。

自检：调用 `swas_status`，看「Web 面板模块」一行，显示 `已装配（…/client.js）` 才算真正进了装配图。

---

## 构建与自检

面板数据是**构建期烘焙**进 `client.js` 的（浏览器端只能 `require('react')`，不能 import 本地模块）：

```bash
node scripts/import-content.mjs   # 把调研 JSON（_sw_pack/）合并成 content/*.js，仓库已带产物，可跳过
node scripts/build-client.mjs     # 由 catalog.js + generate.js 生成 client.js
node scripts/build-presets.mjs    # 由 prompts/*.md 生成 presets/*.patch.yml
node scripts/smoke.mjs            # 真 React SSR 渲染全部标签页 + 契约检查
node scripts/selftest.mjs         # 桩 ctx 调用 7 个工具，覆盖正常/边界/错误输入
```

改了 `catalog.js`、`content/*.js`、`prompts/*.md` 或 `src/client.js` 后都要重跑对应构建。

**已修的三个问题**（自测覆盖）：

| 问题 | 现象 | 修法 |
|---|---|---|
| 必填/可选缺失混算 | 安装板模板只缺 3 个必填，却报 5 个缺失 | `buildPrompt` 拆成 `missing` 与 `optionalMissing`，结果分行显示 |
| 未知 action 静默列表 | `swas_templates({ action: 'nonsense' })` 直接当 `list` 返回 | 显式返回「未知 action + 可用列表」 |
| 模板页输入框在按钮下方 | 先点生成才看见「你要做什么」输入框 | 把需求输入框移到参数区之前 |

---

## 兼容性与边界

- 面向 [solidworks-automation-skill](https://github.com/wzyn20051216/solidworks-automation-skill)，内容按 commit `2f455f2e` 提炼。
- **能力等级以技能仓库的 `capabilities.yaml` 为准**：`reference_only` / `not_implemented` 不得作为无人值守交付，`pilot` 需标注人工复核。
- 部署默认**不自动**：`autoFetch: false`；`swas_deploy` 的 `install` 默认 `dryRun: true`，只有显式 `dryRun: false` 才落盘。
- 部署只写目标 `skills/` 目录；目录已存在默认跳过；`force` 也只备份改名；不跑上游 `install.js`、不改上游代码。
- 插件本身不建模、不改模型文件；实际建模由 Agent 调用技能脚本 + 本机合法授权的 SolidWorks 完成。

---

## 目录结构

```
index.js              Host 半：注册 7 个工具
catalog.js            知识库装配：模板、技巧、门禁、工作流、九段式骨架、Agent 模式
generate.js           提示词 / 思路 / 技巧 / 门禁生成器（Host 与构建期共用）
content/*.js          由调研 JSON 生成的数据
lib/fetch-core.mjs    技能部署核心：定位客户端、git 取单 ref、写 provenance、ref 校验
lib/templates.mjs     需求书模板：front matter 解析、占位符渲染、缺失字段统计
bin/swas.mjs          CLI：install / agents / templates / prompt
templates/*.md        5 张需求书模板
src/client.js         面板源码（含数据占位符）
client.js             构建产物：数据内联后的浏览器模块
presets/*.patch.yml   Agent 模式（persona 由 prompts/*.md 生成）
prompts/*.md          两个 Agent 模式的人设文档
docs/legal-analysis.md  部署时拉取上游的合规分析
scripts/              构建、冒烟、自测脚本
licenses/UPSTREAM-MIT.txt   上游 MIT 全文
NOTICE                衍生内容署名、商标与范围声明
```

---

## 许可与署名

- 本仓库：MIT，见 [LICENSE](LICENSE)。
- **衍生内容署名**：`content/`、`catalog.js`、`generate.js`、`templates/` 中的模板、技巧、门禁与提示词骨架，是从上游 **SolidWorks Automation Skill**（MIT，Copyright (c) 2026 SolidWorks Automation Skill Contributors）的文档与脚本提炼/改写而来；上游许可全文见 [licenses/UPSTREAM-MIT.txt](licenses/UPSTREAM-MIT.txt)，钉死来源 commit 见 [NOTICE](NOTICE)。
- **商标**：SOLIDWORKS® 是 Dassault Systèmes SolidWorks Corporation 的注册商标，本项目仅用于指示兼容对象，与 Dassault Systèmes 无隶属、赞助或背书关系。
- **范围**：本插件只生成文本、部署上游代码、调用上游技能脚本；不含、不执行任何许可绕过、补丁或激活绕过。
