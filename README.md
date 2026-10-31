# SolidWorks Copilot for DSH

**A DSH plugin + zero-dependency CLI for the [SolidWorks Automation Skill](https://github.com/wzyn20051216/solidworks-automation-skill).**
Pick a template, fill in a few numbers, and get a spec an AI agent can actually execute — plus a one-command way to install the skill itself.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Upstream: MIT](https://img.shields.io/badge/Upstream-MIT-blue.svg)](licenses/UPSTREAM-MIT.txt)
![DSH plugin](https://img.shields.io/badge/DSH-plugin-4b8bf5)
![Node](https://img.shields.io/badge/node-%E2%89%A520-339933)
![100% vibe coded](https://img.shields.io/badge/100%25-vibe%20coded-ff69b4)

**English** · [简体中文](README.zh.md)

---

## Contents

- [Why this exists](#why-this-exists)
- [Three-minute quick start](#three-minute-quick-start)
- [What's inside](#whats-inside)
- [Install](#install)
- [Configuration](#configuration)
- [CLI](#cli)
- [Tools](#tools)
- [Agent presets](#agent-presets)
- [Troubleshooting](#troubleshooting)
- [Build and test](#build-and-test)
- [Fixed in 0.2.0](#fixed-in-020)
- [Scope and boundaries](#scope-and-boundaries)
- [Repository layout](#repository-layout)
- [License and attribution](#license-and-attribution)
- [About](#about)

---

## Why this exists

Telling an agent "draw me a mounting plate" produces a plate: holes in the wrong place, fillets
forgotten, nothing you can verify. The problem is not the model — it is the missing spec.

This plugin turns the spec into a reusable asset:

- **Templates** encode feature order, tolerances, acceptance evidence and prohibitions.
- **Filling blanks** is the only thing you do; anything you leave empty is reported back, never
  silently defaulted.
- **Gates** give you a checklist to run *before* anyone says "done".

---

## Three-minute quick start

You do not need to know the SolidWorks API. You need to know what the part is, how big it is, and
how many holes it has.

### 1. Install

```js
plugin_manager({ action: 'install_bundle', target: '<absolute path to this repo>' })
```

Refresh the page. A **SolidWorks Copilot** icon appears in the sidebar, and a compact bar appears
under the composer.

### 2. Pick a template

Click the sidebar icon — the **Templates** tab is already open. The 16 templates are grouped by
*part / holes / gear / sheetmetal / assembly / motion / drawing / export / inspection*, and each
card shows only two things: **difficulty** (easy · medium · advanced) and **category**.

Not sure? Take the first one, *Mounting plate / bracket*.

### 3. Fill, generate, copy

1. Write one line about what you want (optional — the template already carries the standard wording).
2. Fill the numbers you know. Leave the rest blank; the agent will ask.
3. Press **Generate prompt**.

You get a complete spec: goal, parameter table, execution steps, acceptance evidence, hard rules,
prohibitions.

- In the sidebar page: **Copy** → paste into the chat.
- In the composer bar: **Fill composer** → press Enter.

### 4. Optional: verify before you trust

Open **Checklist**, pick the work type (part / holes / assembly / motion / drawing / export) and
generate a gate list. Paste it and make the agent answer line by line. *"It's done"* is not done;
evidence is.

### No DSH? Use the CLI

```bash
node bin/swas.mjs templates
node bin/swas.mjs prompt --template part-bracket \
  --set PART_NAME=motor-mount --set SIZE=120x80x10 --set MATERIAL=6061-T6
node bin/swas.mjs agents
node bin/swas.mjs install --target codex --dry-run
```

No dependencies, Node ≥ 20.

---

## What's inside

| Layer | What it gives you |
|---|---|
| **UI** | Sidebar workspace (6 tabs) + ambient bar under the composer, both backed by the same knowledge base |
| **7 tools** | `swas_templates` · `swas_prompt` · `swas_plan` · `swas_tips` · `swas_gate` · `swas_deploy` · `swas_status` |
| **2 agent presets** | `swas-cad` (writable modelling) · `swas-review` (read-only delivery review) |
| **Content** | 16 UI templates · 5 spec templates · 60 tips · 8 delivery gates · 9-phase design outline · 18 routing rules |
| **CLI** | `install` · `agents` · `templates` · `prompt`, pinned upstream commit, provenance, no-overwrite |

---

## Install

### Option A — as a DSH plugin (recommended)

```js
plugin_manager({ action: 'install_bundle', target: '<absolute path to this repo>' })
```

Host tools are live immediately; the panel appears after a page refresh (client modules are
composed at page start). If the result says `restart-required`, restart DSH once.

### Option B — manual mount

Place the repo at `~/.dsh/plugins/dsh-solidworks-copilot`, add a `link:` entry to the profile's
`dependencies`, add `dsh-solidworks-copilot` to `dsh.profile.bundles`, restart DSH.

### Option C — CLI only

```bash
git clone https://github.com/redstonedust/dsh-solidworks-copilot.git
cd dsh-solidworks-copilot
node bin/swas.mjs --help
```

---

## Configuration

```yaml
- id: solidworks-copilot
  name: dsh-solidworks-copilot
  config:
    skillDir: ''          # when set, SKILL_DIR in generated prompts is replaced with this path
    defaultDetail: full   # brief | full — default prompt depth
    maxTips: 12           # default result count for swas_tips
    autoFetch: false      # deploy the upstream skill at load time (off by default)
    autoFetchTarget: codex
```

`autoFetch` is **off by default** on purpose: installing a plugin should not silently hit the
network and write into your home directory.

---

## CLI

```text
node bin/swas.mjs <command> [options]

  install     deploy the upstream SolidWorks Automation Skill (default command)
  agents      list codex / claude / cursor / agents / openclaw status
  templates   list the 5 spec templates
  prompt      render a spec from a template
```

| Option | Meaning |
|---|---|
| `--target codex,claude` / `--target all` | Which clients to install into (`all` only touches clients whose skills directory exists) |
| `--ref <commit/tag/branch>` | Upstream ref, pinned to `2f455f2e` by default; validated, values starting with `-` are rejected |
| `--force` | If the target exists, rename it to `<dir>.bak-<timestamp>` first — never delete |
| `--dry-run` | Print the plan, change nothing |
| `--template <id>` `--set K=V` `--out <file>` `--strict` | `prompt` only; `--strict` exits non-zero when fields are missing |

---

## Tools

```text
swas_templates  { action: 'list' | 'get' | 'routing' | 'specs' | 'spec', id?, category?, query?, params? }
swas_prompt     { task?, template?, params?: { key: value }, detail?: 'brief' | 'full' }
swas_plan       { task?, template?, constraints? }
swas_tips       { query?, category?, limit? }
swas_gate       { workflow?, capability?, task? }
swas_deploy     { action: 'status' | 'install', target?, ref?, dryRun?, force? }
swas_status     { }
```

A typical chain:

1. `swas_deploy({ action: 'status' })` — is the skill installed at all?
2. `swas_templates({ action: 'routing', query: 'mounting plate, four M6 counterbores' })` — which script, which reference doc.
3. `swas_prompt({ task: '…', template: 'mounting-bracket', params: { size: '120×80×10' } })` — the executable spec.
4. Run it, read the evidence back, then `swas_gate({ workflow: 'mounting_bracket' })`.

---

## Agent presets

Both rows ship as `@deepseek-ai/dsh-agent-preset` entries and show up in the session's agent-mode
picker once the bundle is enabled.

| Preset | Posture | Rules it enforces |
|---|---|---|
| `swas-cad` — SolidWorks · Modelling | Writable | Plan before modelling · metres everywhere · fully defined sketches · base → cut → holes → fillets · four-view preview + SHA-256 evidence |
| `swas-review` — SolidWorks · Delivery review | Read-only | Artefact list · hash reconciliation · `*_review_report.json` · four views · gate-by-gate verdict with fix actions |

Personas live in `prompts/*.md` and are compiled into `presets/*.patch.yml` by
`scripts/build-presets.mjs`.

---

## Troubleshooting

**The panel doesn't show up.** Check these four things — missing any one makes the client module
get skipped *silently*:

1. `package.json` declares `dsh.client` with `platform: "web"`.
2. `exports` contains **both** `"./client"` and `"./package.json"`. The client module table locates
   the manifest with `createRequire(...).resolve('<pkg>/package.json')`; without that export you get
   `ERR_PACKAGE_PATH_NOT_EXPORTED` and no error in the UI.
3. The package name is in the profile's `dsh.profile.bundles`.
4. The client module table is built at DSH start-up — restart once after install or upgrade.

**Self-check.** Call `swas_status` and read the *Web panel module* line. Only a `composed` result
with a resolved `client.js` path means the module actually reached the boot graph.

**The skill isn't installed.** `swas_deploy({ action: 'status' })` lists every client and its state
(`installed-by-plugin`, `unmanaged`, `not-installed`). Install with `action: 'install'`; `dryRun`
defaults to `true`.

---

## Build and test

Panel data is **baked into `client.js` at build time** (the browser half can only `require('react')`,
it cannot import local modules):

```bash
node scripts/import-content.mjs   # research JSON (_sw_pack/) → content/*.js; artefacts are committed
node scripts/build-client.mjs     # catalog.js + generate.js → client.js
node scripts/build-presets.mjs    # prompts/*.md → presets/*.patch.yml
node scripts/smoke.mjs            # real React SSR for every tab + registration contract
node scripts/selftest.mjs         # stubbed ctx: all 7 tools, happy path + edge cases
```

Re-run the relevant build after touching `catalog.js`, `content/*.js`, `prompts/*.md` or
`src/client.js`.

---

## Fixed in 0.2.0

| Bug | Symptom | Fix |
|---|---|---|
| Required and optional fields were merged | A plate missing 3 required fields reported 5 missing | `buildPrompt` returns `missing` and `optionalMissing` separately; output prints them on separate lines |
| Unknown `action` fell through to `list` | `swas_templates({ action: 'nonsense' })` looked like it worked | Explicit "unknown action + valid list" response |
| Requirement box sat below the generate button | You had to press Generate before you could describe the part | Moved the requirement box above the parameter block |

---

## Scope and boundaries

- Targets the [SolidWorks Automation Skill](https://github.com/wzyn20051216/solidworks-automation-skill); content distilled from commit `2f455f2e`.
- **Capability levels come from the skill's `capabilities.yaml`**: `reference_only` and `not_implemented` are never unattended deliverables, `pilot` requires human review.
- The plugin writes text and reads skill directories; it never edits model files.
- Deployment is opt-in (`autoFetch: false`), `install` defaults to `dryRun: true`, existing directories are skipped, `force` only renames a backup, upstream `install.js` is never executed.
- Real modelling still needs a properly licensed SolidWorks installation.

---

## Repository layout

```text
index.js              host half — registers the 7 tools
catalog.js            knowledge base assembly: templates, tips, gates, workflows, phases, presets
generate.js           prompt / plan / tips / gate generators (shared by host and build)
content/*.js          generated data
lib/fetch-core.mjs    deploy core: target resolution, single-ref git fetch, provenance, ref validation
lib/templates.mjs     spec templates: front matter, placeholder rendering, missing-field report
bin/swas.mjs          CLI: install / agents / templates / prompt
templates/*.md        5 spec templates
src/client.js         panel source (data placeholder)
client.js             build output — data inlined
presets/*.patch.yml   agent presets (personas compiled from prompts/*.md)
prompts/*.md          persona documents
docs/legal-analysis.md  compliance notes for fetching upstream at deploy time
scripts/              build, smoke test, selftest
licenses/UPSTREAM-MIT.txt  upstream MIT text
NOTICE                attribution, trademark and scope notes
```

---

## License and attribution

- **This repository:** MIT — see [LICENSE](LICENSE).
- **Derived content:** templates, tips, gates and prompt scaffolding under `content/`, `catalog.js`,
  `generate.js` and `templates/` are distilled from the upstream **SolidWorks Automation Skill**
  (MIT, Copyright (c) 2026 SolidWorks Automation Skill Contributors). The full upstream license ships
  as [licenses/UPSTREAM-MIT.txt](licenses/UPSTREAM-MIT.txt); the pinned source commit is recorded in
  [NOTICE](NOTICE).
- **Trademarks:** SOLIDWORKS® is a trademark of Dassault Systèmes SolidWorks Corporation. The name is
  used only to indicate compatibility. This project is not affiliated with, sponsored by, or
  endorsed by Dassault Systèmes.
- **Scope:** the plugin generates text, deploys upstream code and calls upstream scripts. It contains
  and performs no license circumvention, patching or activation bypass of any kind.

---

## About

This project was built **100% by vibe coding**: no hand-typed implementation, no whiteboard
architecture session. The whole thing — plugin host, browser panel, prompt generators, deployer,
CLI, tests and this document — came out of a conversation with an agent, steered by short,
plain-language requests ("the buttons are unreadable", "make the README understandable for
beginners", "the panel doesn't show up").

What that means in practice:

- **Fast to shape, expensive to trust.** Behaviour is only believed after running it — every claim
  in this README was executed at least once, and the three bugs listed above were found that way.
- **Review is the real work.** Vibe coding does not remove the need to read diffs, run the smoke
  tests, and check what a plugin does to the machine it is installed on.
- **Conventions still matter.** The panel uses host theme tokens, the CLI validates its inputs, and
  the license obligations are honoured — none of that comes for free from a prompt.

If you are here to read code: start with `index.js` (7 tools), then `lib/fetch-core.mjs`
(deployment), then `src/client.js` (UI). If you are here to use it: the
[three-minute quick start](#three-minute-quick-start) is all you need.

*100% vibe coded. Reviewed by a human. Verified by tests that actually ran.*
