/**
 * 由 catalog.js + generate.js 烘焙浏览器数据，并生成 client.js。
 *
 * 为什么要有这一步：Client 模块是单文件、只能 `require('react')`，
 * 不能 import 本地模块。所以把模板/技巧/门禁数据与「提示词骨架」在构建期
 * 序列化进 client.js，运行时浏览器只做占位符替换，Host 与 UI 输出一致。
 *
 * 用法：node scripts/build-client.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');

const catalog = await import(new URL('../catalog.js', import.meta.url).href);
const generate = await import(new URL('../generate.js', import.meta.url).href);

const {
  meta,
  templates,
  tips,
  gates,
  workflows,
  routing,
  designPhases,
  capabilityLevels,
  fallbackTemplate,
  agentModes,
} = catalog;

/** 为一个模板烘焙完整/精简两份提示词骨架。 */
function withPrompts(template) {
  return {
    ...template,
    promptFull: generate.promptTemplateFor(template, { detail: 'full' }),
    promptBrief: generate.promptTemplateFor(template, { detail: 'brief' }),
  };
}

const data = {
  meta,
  templates: templates.map(withPrompts),
  fallbackTemplate: withPrompts(fallbackTemplate),
  tips,
  gates,
  workflows,
  routing,
  designPhases,
  capabilityLevels,
  agentModes,
};

const sourcePath = path.join(packageRoot, 'src', 'client.js');
const targetPath = path.join(packageRoot, 'client.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const marker = 'const DATA = /* @swas-data */ null;';
if (!source.includes(marker)) {
  throw new Error(`client 模板缺少数据占位符：${marker}`);
}

const serialized = JSON.stringify(data).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const output = source.replace(marker, `const DATA = ${serialized};`);
fs.writeFileSync(targetPath, output, 'utf8');

const kb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
console.log(`client.js 已生成：${kb} KB`);
console.log(`  templates ${data.templates.length} / tips ${data.tips.length} / gates ${data.gates.length} / phases ${data.designPhases.length}`);
