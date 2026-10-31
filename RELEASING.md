# 发布到 npm

本包当前**未发布**到 npm。发布后，dsh-plugin.org 的收录才能进 DSH 内置的 Plugin Hub（源码安装只能在本站被索引）。

## 0. 先确认三件事

```bash
npm whoami                    # 没登录会报 ENEEDAUTH
npm view dsh-solidworks-copilot version   # 404 = 名字可用
npm pack --dry-run            # 看会打包哪些文件（当前 42 个文件 / 约 475 KB）
```

包名已在 2026-10-31 查询为可用；发布前请再查一次，避免占用冲突。

### 注意：本机 registry 指向国内镜像

```bash
npm config get registry
# https://registry.npmmirror.com
```

npmmirror 是**只读镜像**，不能发布。登录、查看、发布都要显式指向官方源，不要改全局配置（否则国内装包会变慢）：

```bash
npm login  --registry=https://registry.npmjs.org
npm view   dsh-solidworks-copilot version --registry=https://registry.npmjs.org
npm publish --registry=https://registry.npmjs.org --access public
```


## 1. 登录（一次性）

**交互式（本机）**

```bash
npm login
```

**CI / 无人值守**：用 Automation token，别用密码。

```bash
npm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
# 或写进 ~/.npmrc：
# //registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Token 需要 **read + write** 权限；开了 2FA 的账号，`npm publish` 会要求一次性验证码，CI 里请用 Automation token（可绕过 OTP）。

## 2. 改版本号

```bash
npm version patch   # 0.3.0 → 0.3.1（修 bug）
npm version minor   # 0.3.0 → 0.4.0（加功能）
git push --follow-tags
```

`npm version` 会同时改 `package.json`、打 git tag，版本号在 npm 上**不可复用**——发布过的版本即使删掉也不能再发同一个号。

## 3. 发布

```bash
npm publish --access public
```

- `prepublishOnly` 会自动跑：`node --check index.js && node --check client.js && node scripts/check-readme.mjs`；任一步失败会中止发布。
- `publishConfig.access = public` 已在 `package.json` 里，公开包不需要再传 `--access public`，写上也无害。
- 发布内容由 `package.json` 的 `files` 决定，`npm pack --dry-run` 是唯一可信的预览。

## 4. 发布后验证

```bash
npm view dsh-solidworks-copilot version dist-tags
npm view dsh-solidworks-copilot --json | head
```

再在一个干净环境里试装：

```bash
dsh plugin --profile web add dsh-solidworks-copilot
```

## 5. 收尾（仓库侧）

1. README 顶部与「第 1 步」的安装命令从 `github:` 形式换成：

   ```bash
   dsh plugin --profile web add dsh-solidworks-copilot
   ```

2. 在 [dsh-plugin.org/submit](https://dsh-plugin.org/submit) 提交或等自动扫描；通过后把 README 的 badge 换成官方 listing 徽章：

   ```markdown
   [![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/redstonedust/dsh-solidworks-copilot)
   ```

3. 打 tag 并写 release notes（写明钉死的上游 commit）。

## 6. 发错了怎么办

| 时间窗 | 能做什么 | 命令 |
|---|---|---|
| 发布 72 小时内、无其他包依赖它 | 撤回该版本 | `npm unpublish dsh-solidworks-copilot@0.3.0` |
| 超过窗口 | 只能标记弃用并指明替代版本 | `npm deprecate dsh-solidworks-copilot@0.3.0 "broken, use 0.3.1"` |
| 整个包要下线（24 小时内） | 撤回整包 | `npm unpublish dsh-solidworks-copilot --force` |

撤回会破坏已安装用户的锁文件解析，能发新版本就别撤回。

## 7. 可选：npm 上的展示信息

`package.json` 里已有 `description` / `keywords` / `repository` / `homepage` / `bugs` / `license` / `engines`，npm 页面会自动展示。README.md 会作为包页面正文渲染，其中相对路径图片（`docs/images/*.png`）已包含在包内，可以正常显示。
