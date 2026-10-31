/**
 * 把 _sw_pack/*.json 的调研结果合并成 content/*.js（构建期工具，不随插件运行）。
 *
 * 三个 JSON 来自对 solidworks-automation 技能仓库的只读提取：
 *   a.json → API / 建模 / 排障技巧
 *   b.json → 装配 / 运动 / 工程图 / 导出 / 外观技巧
 *   c.json → 模板预设与交付门禁
 *
 * 用法：node scripts/import-content.mjs [源目录]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 能力名 → 工作流 id 的映射（与 catalog.js 的 workflows 保持同步）。
 * 这里不 import catalog.js：content/*.js 还没生成，导入会形成启动期循环。
 */
const CAPABILITY_WORKFLOWS = {
  part_and_features: ['mounting_bracket', 'enclosure', 'modify_existing_part', 'parallel_gripper_assembly'],
  holes_and_finishing: ['mounting_bracket', 'enclosure', 'holes_slots_threads'],
  export_delivery: ['mounting_bracket', 'enclosure', 'batch_export', 'parallel_gripper_assembly', 'autocad_cleanup_delivery'],
  geometry_and_delivery_review: ['modify_existing_part', 'assembly_mates', 'parallel_gripper_assembly'],
  assembly_and_mates: ['assembly_mates', 'parallel_gripper_assembly'],
  configurations_and_design_tables: ['configuration_family'],
  drawings_and_bom: ['engineering_drawing', 'properties_bom'],
  autocad_basic_drafting: ['autocad_cleanup_delivery'],
  autocad_headless_preview: ['autocad_cleanup_delivery'],
};

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');
const sourceDir = path.resolve(
  process.argv[2] || process.env.SWAS_CONTENT_SRC || path.join(packageRoot, '_sw_pack'),
);
const outDir = path.join(packageRoot, 'content');

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(sourceDir, name), 'utf8'));

const a = readJson('a.json');
const b = readJson('b.json');
const c = readJson('c.json');

/** 技巧去重（按 id），并补齐字段。 */
const seen = new Set();
const tips = [...(a.tips || []), ...(b.tips || [])]
  .filter((tip) => {
    if (!tip || !tip.id || seen.has(tip.id)) return false;
    seen.add(tip.id);
    return true;
  })
  .map((tip) => ({
    id: String(tip.id),
    category: String(tip.category || 'api'),
    title: String(tip.title || tip.id),
    body: String(tip.body || ''),
    ...(tip.code ? { code: String(tip.code) } : {}),
    source: String(tip.source || ''),
  }));

/** 模板补齐检索关键词（中英文都放，便于自动匹配）。 */
const keywordMap = {
  part: ['零件', '建模', 'model', 'part'],
  hole: ['孔', 'hole', 'bore'],
  gear: ['齿轮', 'gear'],
  sheetmetal: ['钣金', 'sheet metal', '折弯'],
  assembly: ['装配', 'assembly', '配合', 'mate'],
  motion: ['运动', 'motion', '马达', 'motor'],
  drawing: ['工程图', 'drawing', '出图'],
  export: ['导出', 'export', 'step', 'stl'],
  evaluation: ['复核', 'review', 'dfm', 'fea'],
};

const templates = (c.templates || []).map((template) => ({
  ...template,
  keywords: [
    ...(template.keywords || []),
    ...(keywordMap[template.category] || []),
    template.name,
    template.workflow,
  ].filter(Boolean),
}));

/** 门禁补齐 workflows：按能力名反查工作流，供客户端下拉过滤。 */
const gates = (c.gates || []).map((gate) => ({
  ...gate,
  workflows: [
    ...(gate.workflows || []),
    ...(CAPABILITY_WORKFLOWS[gate.capability] || []),
  ].filter((id, index, list) => list.indexOf(id) === index),
}));

const banner = '// 由 scripts/import-content.mjs 从调研 JSON 生成；手改会被下一次合并覆盖。\n';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'tips.js'),
  `${banner}\n/** SolidWorks 自动化技巧条目（${tips.length} 条）。 */\nexport const tips = ${JSON.stringify(tips, null, 2)};\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(outDir, 'templates.js'),
  `${banner}\n/** 模板预设（${templates.length} 个）。 */\nexport const templates = ${JSON.stringify(templates, null, 2)};\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(outDir, 'gates.js'),
  `${banner}\n/** 交付门禁（${gates.length} 个）。 */\nexport const gates = ${JSON.stringify(gates, null, 2)};\n`,
  'utf8',
);

console.log(`content/tips.js      ${tips.length} 条`);
console.log(`content/templates.js ${templates.length} 个`);
console.log(`content/gates.js     ${gates.length} 个`);
