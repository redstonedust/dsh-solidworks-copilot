#!/usr/bin/env node
/**
 * CLI 入口。三个子命令共用 lib/fetch-core.mjs 与 lib/templates.mjs：
 *
 *   install   把上游 skill 装到位（默认子命令）
 *   agents    列出各客户端目录状态，便于决定装到哪
 *   templates 列出模板库
 *   prompt    用模板生成一份可粘贴的需求书
 */

import fs from 'node:fs';

import { DEFAULT_REF, TARGETS, detectClients, installMany } from '../lib/fetch-core.mjs';
import { listTemplates, renderTemplate } from '../lib/templates.mjs';

const USAGE = `
用法: node bin/swas.mjs <命令> [选项]

命令:
  install     把上游 SolidWorks Automation Skill 装到位（不带命令时的默认行为）
  agents      列出 codex / claude / cursor / agents / openclaw 的目录状态
  templates   列出模板库
  prompt      用模板生成需求书

install 选项:
  --target <list>   codex,claude,cursor,agents,openclaw 或 all（默认 codex）
  --dest <path>     直接指定目录（仅配合单个 target）
  --ref <ref>       上游 ref，默认钉死 ${DEFAULT_REF.slice(0, 10)}
  --force           已存在时改名为 <dir>.bak-<时间戳>，不删除
  --dry-run         只打印计划

prompt 选项:
  --template <id>   模板 id，见 templates 命令
  --set K=V         填参数，可重复
  --out <file>      写入文件，默认打到 stdout
  --strict          有未填字段时以非零退出

示例:
  node bin/swas.mjs agents
  node bin/swas.mjs install --target codex,claude
  node bin/swas.mjs prompt --template part-bracket \\
    --set PART_NAME=安装板 --set SIZE=120x80x10 --set MATERIAL=6061-T6
`.trim();

function parse(argv) {
  const sub = ['install', 'agents', 'templates', 'prompt', 'help'].includes(argv[0]) ? argv.shift() : 'install';
  const o = { sub, targets: ['codex'], dest: null, ref: DEFAULT_REF, force: false, dryRun: false, json: false, template: null, sets: [], out: null, strict: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { o.sub = 'help'; continue; }
    if (a === '--target') { o.targets = String(argv[++i] || '').split(',').filter(Boolean); continue; }
    if (a === '--dest') { o.dest = argv[++i]; continue; }
    if (a === '--ref') { o.ref = argv[++i]; continue; }
    if (a === '--force') { o.force = true; continue; }
    if (a === '--dry-run') { o.dryRun = true; continue; }
    if (a === '--json') { o.json = true; continue; }
    if (a === '--template') { o.template = argv[++i]; continue; }
    if (a === '--set') { o.sets.push(argv[++i]); continue; }
    if (a === '--out') { o.out = argv[++i]; continue; }
    if (a === '--strict') { o.strict = true; continue; }
    throw new Error(`未知参数: ${a}`);
  }
  return o;
}

function cmdInstall(o) {
  const emit = (event) => {
    if (o.json) process.stdout.write(`${JSON.stringify(event)}\n`);
  };
  const results = installMany({
    targets: o.targets,
    dest: o.dest,
    ref: o.ref,
    force: o.force,
    dryRun: o.dryRun,
    onProgress: (phase, percent) => emit({ type: 'progress', phase, percent }),
    log: (line) => {
      if (o.json) emit({ type: 'log', line });
      else console.log(line);
    },
  });
  if (o.json) {
    for (const r of results) emit({ type: 'result', ...r });
    emit({ type: 'done' });
    return results.some((r) => r.action === 'failed') ? 1 : 0;
  }
  console.log('\n结果:');
  for (const r of results) {
    console.log(`  ${r.target.padEnd(9)} ${r.action}${r.commit ? ` @ ${String(r.commit).slice(0, 10)}` : ''}`);
  }
  const bad = results.filter((r) => r.action === 'failed').length;
  return bad === 0 ? 0 : 1;
}

function cmdAgents(o) {
  const rows = detectClients();
  if (o.json) {
    console.log(JSON.stringify(rows, null, 2));
    return 0;
  }
  console.log('target     skills目录  状态                  commit');
  for (const r of rows) {
    console.log(
      `${r.target.padEnd(10)} ${(r.skillsDirExists ? '有' : '无').padEnd(11)} ${r.state.padEnd(21)} ${r.commit ? String(r.commit).slice(0, 10) : '-'}`,
    );
  }
  return 0;
}

function cmdTemplates(o) {
  const rows = listTemplates();
  if (o.json) {
    console.log(JSON.stringify(rows.map(({ file, ...rest }) => rest), null, 2));
    return 0;
  }
  for (const t of rows) {
    console.log(`${t.id.padEnd(20)} ${t.title}`);
    console.log(`${''.padEnd(21)}适用: ${t.useFor}`);
    console.log(`${''.padEnd(21)}字段: ${t.fields.join(', ')}`);
  }
  return 0;
}

function cmdPrompt(o) {
  if (!o.template) {
    console.error('prompt 需要 --template <id>，先用 templates 命令看列表');
    return 2;
  }
  const params = {};
  for (const pair of o.sets) {
    const idx = pair.indexOf('=');
    if (idx <= 0) { console.error(`--set 需要 K=V 形式: ${pair}`); return 2; }
    params[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  let out;
  try {
    out = renderTemplate(o.template, params);
  } catch (err) {
    console.error(err.message);
    return 2;
  }
  if (o.out) {
    fs.writeFileSync(o.out, `${out.text.trimEnd()}\n`, 'utf8');
    console.error(`已写入 ${o.out}`);
  } else {
    console.log(out.text.trimEnd());
  }
  if (out.missing.length) console.error(`\n未填字段: ${out.missing.join(', ')}`);
  if (out.unknown.length) console.error(`忽略未知字段: ${out.unknown.join(', ')}`);
  return o.strict && out.missing.length ? 1 : 0;
}

async function main() {
  let o;
  try {
    o = parse(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    console.error(USAGE);
    process.exit(2);
  }
  if (o.sub === 'help') { console.log(USAGE); return 0; }
  switch (o.sub) {
    case 'install': return cmdInstall(o);
    case 'agents': return cmdAgents(o);
    case 'templates': return cmdTemplates(o);
    case 'prompt': return cmdPrompt(o);
    default: console.log(USAGE); return 2;
  }
}

main().then((code) => process.exit(code ?? 0)).catch((err) => {
  console.error(`失败: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
