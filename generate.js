/**
 * SolidWorks 副驾生成器：提示词、设计思路、技巧检索、门禁清单。
 *
 * 设计要点：提示词骨架由 `promptTemplateFor()` 生成一次（Host 运行时与
 * `scripts/build-client.mjs` 构建期都用它），再用 `fill()` 替换占位符。
 * 这样浏览器端不需要复制一份生成逻辑，两边输出完全一致。
 *
 * @module solidworks-copilot/generate
 */

import { meta, promptRules, designPhases, routing } from './catalog.js';

/** 提示词占位符语法：`{{task}}` 与 `{{param:<key>}}`。 */
const TOKEN = /\{\{(task|param:[A-Za-z0-9_-]+)\}\}/g;

/**
 * 渲染提示词骨架。
 * @param {object} template 模板对象。
 * @param {{ detail?: 'brief' | 'full' }} [options]
 * @returns {string}
 */
export function promptTemplateFor(template, options = {}) {
  const detail = options.detail === 'brief' ? 'brief' : 'full';
  const lines = [];
  lines.push(`# 目标`);
  lines.push(`{{task}}`);
  lines.push(``);
  lines.push(`## 任务类型`);
  lines.push(
    `模板：${template.name}（${template.category}｜难度 ${template.difficulty}）｜工作流：${template.workflow}｜能力：${(template.capabilities || []).join(', ')}`,
  );
  lines.push(``);
  lines.push(`## 技能与环境`);
  lines.push(`- 技能根目录：SKILL_DIR（${meta.skillEnv}，默认 ${meta.defaultSkillDir}）`);
  lines.push(`- 入口自检：${meta.preflight}`);
  lines.push(`- 能力真源：${meta.capabilitySource}`);
  lines.push(`- 后端路由：${meta.router}`);
  lines.push(`- 参考文档：${(template.references || []).join('、') || '按技能 SKILL.md 路由'}`);
  lines.push(`- 复用脚本：${template.entry || '按技能 SKILL.md 路由'}`);
  lines.push(``);
  lines.push(`## 输入参数`);
  for (const p of template.params || []) {
    lines.push(`- ${p.label}：{{param:${p.key}}}${p.required === false ? '（可选）' : ''}`);
  }
  lines.push(``);
  lines.push(`## 执行步骤`);
  (template.steps || []).forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  lines.push(``);
  lines.push(`## 验收证据（逐条给出实际结果，不要只说成功）`);
  for (const check of template.checks || []) lines.push(`- ${check}`);
  lines.push(``);
  if (detail === 'full') {
    lines.push(`## 风险与人工复核`);
    const risks = template.risks && template.risks.length > 0 ? template.risks : ['能力等级未验证的部分必须标注 review_required。'];
    for (const risk of risks) lines.push(`- ${risk}`);
    lines.push(``);
    lines.push(`## 交付物`);
    for (const item of promptRules.delivery) lines.push(`- ${item}`);
    lines.push(``);
  }
  lines.push(`## 硬性约束`);
  for (const rule of promptRules.hardRules) lines.push(`- ${rule}`);
  lines.push(``);
  lines.push(`## 禁止`);
  for (const rule of promptRules.forbid) lines.push(`- ${rule}`);
  if (template.risks && template.risks.length > 0 && detail === 'brief') {
    lines.push(``);
    lines.push(`## 需要标注的复核点`);
    for (const risk of template.risks) lines.push(`- ${risk}`);
  }
  return lines.join('\n');
}

/**
 * 替换提示词占位符；缺失值渲染成 `【标签｜例：示例】`，让模型看到还缺什么。
 * @param {string} text 含占位符的提示词骨架。
 * @param {{ task?: string, template?: object, values?: Record<string, string> }} input
 * @returns {string}
 */
export function fill(text, input = {}) {
  const values = input.values || {};
  const template = input.template || { params: [] };
  const params = new Map((template.params || []).map((p) => [p.key, p]));
  return String(text).replace(TOKEN, (_match, token) => {
    if (token === 'task') {
      const task = (input.task || '').trim();
      return task !== '' ? task : '【需求描述：一句话说明要做的零件/装配/图纸与用途】';
    }
    const key = token.slice('param:'.length);
    const raw = values[key];
    const label = params.get(key)?.label || key;
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') return String(raw).trim();
    const example = params.get(key)?.example;
    return `【${label}${example ? `｜例：${example}` : ''}】`;
  });
}

/**
 * 生成完整提示词。
 * @param {object} input
 * @param {object} input.template
 * @param {string} [input.task]
 * @param {Record<string, string>} [input.values]
 * @param {'brief'|'full'} [input.detail]
 * @returns {{ prompt: string, missing: string[], optionalMissing: string[] }}
 */
export function buildPrompt(input) {
  const detail = input.detail === 'brief' ? 'brief' : 'full';
  const skeleton = promptTemplateFor(input.template, { detail });
  const prompt = fill(skeleton, input);
  const emptyKeys = (input.template.params || [])
    .filter((p) => {
      const v = (input.values || {})[p.key];
      return v === undefined || v === null || String(v).trim() === '';
    });
  // required 才是「不填就不能开工」；可选字段单独列出，别把 5 个缺失混成一片
  const missing = emptyKeys.filter((p) => p.required !== false).map((p) => p.key);
  const optionalMissing = emptyKeys.filter((p) => p.required === false).map((p) => p.key);
  return { prompt, missing, optionalMissing };
}

/**
 * 按自然语言需求给模板打分，选最合适的一个。
 * @param {Array<object>} templates
 * @param {string} text
 * @returns {{ template: object | undefined, score: number, alternatives: Array<{ id: string, name: string, score: number }> }}
 */
export function matchTemplate(templates, text) {
  const haystack = String(text || '').toLowerCase();
  const scored = templates
    .map((template) => {
      const words = [
        template.name,
        template.summary,
        template.category,
        ...(template.keywords || []),
        ...(template.params || []).map((p) => p.label),
      ]
        .join(' ')
        .toLowerCase();
      let score = 0;
      for (const chunk of haystack.split(/[\s,，。;；、/]+/)) {
        if (chunk.length < 2) continue;
        if (words.includes(chunk)) score += 4;
        else if (template.name.includes(chunk)) score += 2;
      }
      for (const kw of template.keywords || []) {
        if (kw && haystack.includes(String(kw).toLowerCase())) score += 3;
      }
      return { template, score };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  return {
    template: best && best.score > 0 ? best.template : undefined,
    score: best ? best.score : 0,
    alternatives: scored.slice(0, 5).map((s) => ({ id: s.template.id, name: s.template.name, score: s.score })),
  };
}

/**
 * 整体设计思路：九段式骨架 + 本任务落点。
 * @param {object} input
 * @param {object} [input.template]
 * @param {string} [input.task]
 * @param {string} [input.constraints]
 * @returns {{ plan: object, text: string }}
 */
export function buildPlan(input = {}) {
  const template = input.template;
  const task = (input.task || '').trim() || template?.summary || '待描述';
  const steps = template?.steps || [];
  const checks = template?.checks || [];
  const risks = template?.risks || [];
  const params = template?.params || [];

  const phases = designPhases.map((phase, index) => {
    const anchor = anchorFor(phase.id, { steps, checks, risks, params, template });
    return {
      id: phase.id,
      name: phase.name,
      question: phase.question,
      hints: phase.hints,
      anchor,
      prompt: phase.prompt,
      order: index + 1,
    };
  });

  const plan = {
    task,
    template: template ? { id: template.id, name: template.name, workflow: template.workflow } : null,
    constraints: (input.constraints || '').trim(),
    phases,
    featureOrder: steps,
    checks,
    risks,
  };

  const lines = [];
  lines.push(`# 设计思路：${task}`);
  if (template) lines.push(`模板：${template.name}｜工作流：${template.workflow}｜脚本：${template.entry || '按技能路由'}`);
  if (plan.constraints) lines.push(`额外约束：${plan.constraints}`);
  lines.push('');
  lines.push('## 一句话方案');
  lines.push(template ? template.summary : '先定交付级别与输入参数，再按特征顺序建模，最后用四视图与审查报告验收。');
  lines.push('');
  for (const phase of phases) {
    lines.push(`## ${phase.name}｜${phase.question}`);
    for (const hint of phase.hints) lines.push(`- ${hint}`);
    lines.push(`- 本任务落点：${phase.anchor}`);
    lines.push('');
  }
  lines.push('## 特征顺序（可直接照做）');
  if (steps.length > 0) steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  else lines.push('1. 按技能 SKILL.md 的零件建模顺序执行。');
  lines.push('');
  lines.push('## 验收矩阵');
  if (checks.length > 0) checks.forEach((c) => lines.push(`- ${c}`));
  else lines.push('- 四视图预览目视复核 + *_review_report.json + 产物路径与 SHA-256。');
  lines.push('');
  lines.push('## 风险与复核');
  if (risks.length > 0) risks.forEach((r) => lines.push(`- ${r}`));
  else lines.push('- 未验证能力与假设参数标注 review_required。');
  return { plan, text: lines.join('\n') };
}

/** 为某个设计阶段挑一条与本任务相关的落点。 */
function anchorFor(phaseId, ctx) {
  const { steps, checks, risks, params, template } = ctx;
  const pick = (list, fallback) => (list && list.length > 0 ? list[0] : fallback);
  switch (phaseId) {
    case 'brief':
      return params.length > 0
        ? `先确认这些参数：${params.map((p) => p.label).join('、')}`
        : '先列出输入清单与假设表。';
    case 'units':
      return 'API 数值全部换算成米：mm(x) = x / 1000，角度用 deg()。';
    case 'sketch':
      return `草图策略：${pick(steps.filter((s) => /草图|sketch|轮廓/.test(s)), '先画主轮廓草图并完全定义。')}`;
    case 'features':
      return `特征顺序：${steps.slice(0, 3).join(' → ') || '基体 → 切除 → 孔槽 → 圆角 → 细节'}`;
    case 'assembly':
      return template && /assembly|装配/.test(template.category + template.workflow)
        ? '组件定位后加同心/齿轮配合，保留 1 个可动自由度并验证拖动。'
        : '本任务若为单体零件，装配段可跳过，但要说明装配基准面。';
    case 'motion':
      return '需要运动时创建 Motion Study 并校验 results_out_of_date=False。';
    case 'drawing':
      return /drawing|drawings|工程图/.test(`${template?.category || ''} ${template?.workflow || ''}`)
        ? '按 GB/T 习惯出图：图幅/标题栏/尺寸链/孔表/技术要求。'
        : '需要出图时，孔槽必须给规格、数量与定位尺寸。';
    case 'delivery':
      return `交付证据：${pick(checks, '四视图预览 + review_report + 路径与 SHA-256')}`;
    case 'risk':
      return risks.length > 0 ? `已知复核点：${risks.join('；')}` : '能力等级与假设参数在结果里显式标注。';
    default:
      return '按技能工作流执行。';
  }
}

/**
 * 技巧检索。
 * @param {Array<object>} tips
 * @param {{ query?: string, category?: string, limit?: number }} [filter]
 * @returns {Array<object>}
 */
export function searchTips(tips, filter = {}) {
  const limit = Number.isFinite(filter.limit) && filter.limit > 0 ? Math.min(50, filter.limit) : 12;
  const q = String(filter.query || '').trim().toLowerCase();
  const category = String(filter.category || '').trim().toLowerCase();
  const scored = tips
    .filter((tip) => !category || category === 'all' || String(tip.category).toLowerCase() === category)
    .map((tip) => {
      if (q === '') return { tip, score: 1 };
      const text = `${tip.title} ${tip.body} ${tip.code || ''} ${tip.category}`.toLowerCase();
      let score = 0;
      if (text.includes(q)) score += 6;
      for (const token of q.split(/[\s,，。;；、/]+/)) {
        if (token.length >= 2 && text.includes(token)) score += 3;
      }
      for (const token of q.split(/[\s,，。;；、/]+/)) {
        for (const ch of token) if (text.includes(ch)) score += 0.2;
      }
      return { tip, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.tip);
}

/**
 * 门禁清单。
 * @param {Array<object>} gates
 * @param {{ workflow?: string, capability?: string }} [filter]
 * @returns {Array<object>}
 */
export function pickGates(gates, filter = {}) {
  const workflow = String(filter.workflow || '').trim();
  const capability = String(filter.capability || '').trim();
  if (!workflow && !capability) return gates;
  return gates.filter((gate) => {
    const hitWorkflow = workflow === '' || (gate.workflows || []).includes(workflow) || gate.capability === workflow;
    const hitCapability = capability === '' || gate.capability === capability;
    return hitWorkflow && hitCapability;
  });
}

/**
 * 把门禁清单渲染成一段可粘贴的验收提示词。
 * @param {Array<object>} gates
 * @param {{ task?: string }} [options]
 * @returns {string}
 */
export function gatePrompt(gates, options = {}) {
  const lines = [];
  lines.push('# 交付前门禁检查');
  if (options.task) lines.push(`任务：${options.task}`);
  lines.push('');
  for (const gate of gates) {
    lines.push(`## ${gate.name}（能力：${gate.capability}）`);
    for (const item of gate.items || []) lines.push(`- [ ] ${item}`);
    if (gate.evidence && gate.evidence.length > 0) lines.push(`- 证据文件：${gate.evidence.join('、')}`);
    if (gate.blocked_when && gate.blocked_when.length > 0) {
      lines.push(`- 命中即 blocked：${gate.blocked_when.join('；')}`);
    }
    lines.push('');
  }
  lines.push('逐条回答：[通过/不通过/缺证据]，不通过项给出修复动作与重跑步骤。');
  return lines.join('\n');
}

/**
 * 任务路由建议。
 * @param {string} text
 * @returns {Array<{ match: string, entry: string, ref: string }>}
 */
export function routeFor(text) {
  const haystack = String(text || '').toLowerCase();
  const hits = [];
  for (const row of routing) {
    const hit = row.match.find((kw) => haystack.includes(kw.toLowerCase()));
    if (hit) hits.push({ match: hit, entry: row.entry, ref: row.ref });
  }
  return hits;
}
