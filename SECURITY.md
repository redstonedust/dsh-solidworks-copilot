# 安全策略

## 报告漏洞

**请不要**为安全问题开公开 issue。请走 GitHub 的私密报告：

> 仓库 → **Security** 标签 → **Report a vulnerability**
> （或直接打开 <https://github.com/redstonedust/dsh-solidworks-copilot/security/advisories/new>）

报告里尽量包含：受影响的版本或 commit、DSH 版本、复现步骤、你预期的影响。如果复现依赖特定的客户端目录结构，描述结构即可，不要附上真实的 home 目录内容。

## 影响范围

以下属于本仓库范围：

| 表面 | 例子 |
|---|---|
| Host 插件（`index.js`） | 工具注册、`apply()` 行为、本地路由处理器 |
| 本地路由（`/swas/*`） | 同源校验缺失、请求体处理、命令/参数注入 |
| 部署核心（`lib/fetch-core.mjs`） | `ref` 解析、git 调用、`dest` 路径穿越、覆盖与备份逻辑 |
| CLI（`bin/swas.mjs`） | 参数解析、退出码、写出目标目录之外 |
| 面板（`src/client.js` / `client.js`） | 生成文本导致的 HTML 注入、不安全的 DOM 写入、泄漏本机路径 |
| 构建脚本（`scripts/*`） | 读取不可信文件、写到仓库之外 |

以下**不**属于本仓库范围：

- **上游技能**的漏洞（<https://github.com/wzyn20051216/solidworks-automation-skill>）——请报到上游；
- SolidWorks、DSH、Node.js 或任何依赖自身的漏洞——请报到各自维护者；
- 许可绕过、破解、激活相关请求：不属于安全报告，也不受理；
- 需要本机账户已被攻破才能触发的发现（能改你 home 目录的本地进程，本来就拥有与本插件同等的权限）。

## 已知设计决策

- `/swas/status` 与 `/swas/deploy` 要求同时带 `sec-fetch-site: same-origin` 与 `x-swas-client: ui`，否则返回 `403`。这是对随手写脚本的防护，不是对恶意本地用户的防御。
- 部署只写解析出的客户端 `skills/` 目录，从不删除（只改名成 `<dir>.bak-<时间戳>`）；没有 `force` 时不会覆盖非本插件安装的目录。
- 除非配置 `autoFetch: true`，插件自身不会发起任何网络请求。

## 响应方式

尽力而为，无 SLA。有效报告会得到修复或书面结论；除非你另有要求，会在安全公告里署名致谢。

---

## English summary

Report vulnerabilities privately via **Security → Report a vulnerability**; public issues are not
accepted for security problems. In scope: the host plugin, `/swas/*` routes, the deploy core, the CLI,
the client panel and the build scripts. Out of scope: the upstream skill, DSH / SolidWorks / Node
themselves, license-circumvention requests, and findings that require an already-compromised local
account. Responses are best effort with no SLA.
