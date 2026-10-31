/**
 * 由 prompts/*.md 生成 Agent 模式（@deepseek-ai/dsh-agent-preset 行）的 patch YAML。
 *
 * 用法：node scripts/build-presets.mjs
 *
 * 生成：
 *   presets/swas-cad.patch.yml     SolidWorks · 建模执行
 *   presets/swas-review.patch.yml  SolidWorks · 交付复核
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/** 预设定义：persona 文档 + 展示信息 + 工具集。 */
const PRESETS = [
  {
    id: 'swas-cad',
    rowId: 'preset-swas-cad',
    name: 'SolidWorks · 建模执行',
    description: '可写建模模式：先方案后动手，米制与完全定义草图，孔槽圆角按稳定顺序，四视图与哈希证据齐全才算完成。',
    order: 30,
    prompt: 'prompts/cad.md',
    suffix: '技能根目录见运行时上下文；每个交付结论都要有可回读的证据。',
    tools: ['shell', 'fs', 'fsSearch', 'jobs', 'todo', 'askUser', 'web'],
  },
  {
    id: 'swas-review',
    rowId: 'preset-swas-review',
    name: 'SolidWorks · 交付复核',
    description: '只读复核模式：查产物清单、SHA-256、审查报告、四视图与门禁，逐条给通过/不通过/缺证据与修复动作。',
    order: 31,
    prompt: 'prompts/review.md',
    suffix: '不改模型、不改报告；缺证据就写缺证据。',
    tools: ['shell', 'fs', 'fsSearch', 'jobs', 'askUser'],
  },
];

/** 工具行片段（与官方 preset 的组合保持一致）。 */
function toolRows(tools) {
  const rows = [];
  if (tools.includes('shell')) {
    rows.push(`          - id: tool-bash
            name: '@deepseek-ai/dsh-tool-bash'
            disabled: !!js process.platform === 'win32'`);
    rows.push(`          - id: tool-pwsh
            name: '@deepseek-ai/dsh-tool-pwsh'
            disabled: !!js process.platform !== 'win32'`);
  }
  if (tools.includes('fs')) {
    rows.push(`          - id: tool-fs
            name: '@deepseek-ai/dsh-tool-fs'`);
  }
  if (tools.includes('fsSearch')) {
    rows.push(`          - id: tool-fs-search
            name: '@deepseek-ai/dsh-tool-fs-search'
            config:
              sampleOverCapGlobResults: false`);
  }
  if (tools.includes('jobs')) {
    rows.push(`          - id: tool-jobs
            name: '@deepseek-ai/dsh-tool-jobs'`);
  }
  if (tools.includes('todo')) {
    rows.push(`          - id: tool-todo
            name: '@deepseek-ai/dsh-tool-todo'
            config:
              allowParallelInProgress: true`);
  }
  if (tools.includes('askUser')) {
    rows.push(`          - id: tool-ask-user
            name: '@deepseek-ai/dsh-tool-ask-user'`);
  }
  if (tools.includes('web')) {
    rows.push(`          - id: tool-web
            name: '@deepseek-ai/dsh-tool-web'
            config:
              fetch: true
              searchTimeoutMs: 60000`);
  }
  rows.push(`          - id: compaction
            name: cordis:group
            group: true
            isolate:
              compaction: true
              toolResultPruner: true
            config:
              - id: compaction-basic
                name: '@deepseek-ai/dsh-compaction-basic'
              - id: command-compact
                name: '@deepseek-ai/dsh-command-compact'
              - id: tool-result-pruner
                name: '@deepseek-ai/dsh-compaction-tool-result-pruner'
                config:
                  thresholdChars: 50000
                  headChars: 45000
                  tailChars: 2000`);
  return rows.join('\n');
}

/** 单引号 YAML 字符串。 */
const q = (text) => `'${String(text).replace(/'/g, "''")}'`;

/** 生成一个 preset patch。 */
function buildPreset(preset) {
  const markdown = fs.readFileSync(path.join(root, preset.prompt), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  const block = markdown
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : `                ${line}`))
    .join('\n');
  return `# 由 scripts/build-presets.mjs 从 ${preset.prompt} 生成，勿手改。
# 模式：${preset.name}（${preset.id}）
- insert:
    - id: ${preset.rowId}
      name: '@deepseek-ai/dsh-agent-preset'
      config:
        id: ${preset.id}
        name: ${q(preset.name)}
        description: ${q(preset.description)}
        order: ${preset.order}
        plugins:
          - id: persona
            name: '@deepseek-ai/dsh-persona'
            config:
              prefix: |-
${block}
              suffix: ${q(preset.suffix)}
          - id: agent-instructions
            name: '@deepseek-ai/dsh-agent-instructions'
            config:
              maxBytes: 65536
          - id: time-context
            name: '@deepseek-ai/dsh-time-context'
${toolRows(preset.tools)}
`;
}

fs.mkdirSync(path.join(root, 'presets'), { recursive: true });
for (const preset of PRESETS) {
  const target = path.join(root, 'presets', `${preset.id}.patch.yml`);
  fs.writeFileSync(target, buildPreset(preset), 'utf8');
  console.log(`presets/${preset.id}.patch.yml  ${preset.name}`);
}
