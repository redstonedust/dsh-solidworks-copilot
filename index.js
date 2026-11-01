/**
 * SolidWorks 副驾 — Host 半。
 *
 * 注册 7 个 Agent 工具（与客户端面板共用同一份知识库与生成器）：
 *   swas_templates  模板预设 / 任务路由 / 需求书模板
 *   swas_prompt     生成可直接粘贴的执行提示词
 *   swas_plan       九段式整体设计思路
 *   swas_tips       SolidWorks API 与工程技巧检索
 *   swas_gate       交付门禁与验收提示词
 *   swas_deploy     技能部署（状态 / 安装）
 *   swas_status     插件自检
 *
 * 另外提供两条面板用的本地 HTTP 路由（/swas/status、/swas/deploy），
 * 让「技能部署」标签页能真正执行部署，而不只是显示说明。
 *
 * @module dsh-solidworks-copilot
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { templates, tips, gates, meta, routing, fallbackTemplate, agentModes } from './catalog.js';
import { buildPrompt, buildPlan, matchTemplate, searchTips, pickGates, gatePrompt, routeFor } from './generate.js';
import { DEFAULT_REF, UPSTREAM, detectClients, ensureSkill, installMany } from './lib/fetch-core.mjs';
import { listTemplates as listSpecTemplates, renderTemplate as renderSpec } from './lib/templates.mjs';

/** 需要 tools 服务；缺失时插件保持不激活而不抛错。 */
export const inject = ['tools'];

/** 面板调用的本地路由前缀。 */
const ROUTE_PREFIX = '/swas';

/** 部署任务表：一次部署一个子进程，面板轮询进度。 */
const deployJobs = new Map();
let deployJobSeq = 0;

function newDeployJob(target, dryRun) {
  const id = `job-${Date.now().toString(36)}-${(deployJobSeq += 1)}`;
  const job = {
    id,
    target,
    dryRun,
    phase: 'start',
    percent: 0,
    lines: [],
    done: false,
    ok: null,
    startedAt: Date.now(),
  };
  deployJobs.set(id, job);
  // 只保留最近 20 个任务，避免常驻内存
  if (deployJobs.size > 20) {
    const oldest = [...deployJobs.values()].filter((item) => item.done).sort((a, b) => a.startedAt - b.startedAt)[0];
    if (oldest) deployJobs.delete(oldest.id);
  }
  return job;
}

/** 用子进程跑 CLI 的 --json 模式，逐行解析进度，避免阻塞宿主事件循环。 */
function startDeployJob(target, dryRun, force) {
  const job = newDeployJob(target, dryRun);
  const cliPath = fileURLToPath(new URL('./bin/swas.mjs', import.meta.url));
  const cwd = fileURLToPath(new URL('.', import.meta.url));
  const args = [cliPath, 'install', '--target', target, '--json'];
  if (dryRun) args.push('--dry-run');
  if (force) args.push('--force');

  let child;
  try {
    child = spawn(process.execPath, args, { cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    job.done = true;
    job.ok = false;
    job.phase = 'failed';
    job.lines.push(String(error && error.message ? error.message : error));
    return job;
  }

  let buffer = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let index = buffer.indexOf('\n');
    while (index >= 0) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (line !== '') {
        try {
          const event = JSON.parse(line);
          if (event.type === 'progress') {
            job.phase = String(event.phase || job.phase);
            job.percent = Number(event.percent) || job.percent;
          } else if (event.type === 'log') {
            job.lines.push(String(event.line));
          } else if (event.type === 'result') {
            job.results = (job.results || []).concat([event]);
          }
        } catch {
          job.lines.push(line);
        }
      }
      index = buffer.indexOf('\n');
    }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    const text = String(chunk).trim();
    if (text !== '') job.lines.push(text);
  });
  child.on('close', (code) => {
    job.done = true;
    job.ok = code === 0;
    if (job.ok) {
      job.percent = 100;
      job.phase = 'done';
    } else {
      job.phase = 'failed';
    }
    if (job.lines.length > 200) job.lines = job.lines.slice(-200);
  });
  return job;
}

/**
 * 面板专用路由：同源 POST 才能触发，避免任何本地进程随意调用。
 * 浏览器同源请求会带 sec-fetch-site: same-origin，curl/脚本默认不带。
 */
function createDeployHandler() {
  return (req, res) => {
    const send = (status, body) => {
      res.statusCode = status;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      res.end(JSON.stringify(body));
    };

    const sameOrigin = String(req.headers['sec-fetch-site'] || '') === 'same-origin';
    const fromUi = String(req.headers['x-swas-client'] || '') === 'ui';
    if (!sameOrigin || !fromUi) return send(403, { ok: false, error: 'forbidden：只接受面板发出的同源请求' });

    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname === `${ROUTE_PREFIX}/status` && req.method === 'GET') {
      try {
        return send(200, { ok: true, upstream: UPSTREAM, ref: DEFAULT_REF, clients: detectClients() });
      } catch (error) {
        return send(200, { ok: false, error: String(error && error.message ? error.message : error) });
      }
    }

    if (url.pathname === `${ROUTE_PREFIX}/job` && req.method === 'GET') {
      const job = deployJobs.get(String(url.searchParams.get('id') || ''));
      if (!job) return send(404, { ok: false, error: '任务不存在或已过期' });
      return send(200, {
        ok: true,
        job: {
          id: job.id,
          target: job.target,
          dryRun: job.dryRun,
          phase: job.phase,
          percent: job.percent,
          done: job.done,
          ok: job.ok,
          results: job.results || [],
          lines: job.lines.slice(-40),
        },
      });
    }

    if (url.pathname === `${ROUTE_PREFIX}/deploy` && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 8192) req.destroy();
      });
      req.on('end', () => {
        let input = {};
        try {
          input = JSON.parse(body || '{}');
        } catch {
          return send(400, { ok: false, error: '请求体不是合法 JSON' });
        }
        const target = String(input.target || 'codex');
        const dryRun = input.dryRun !== false; // 默认只预演
        const job = startDeployJob(target, dryRun, input.force === true);
        return send(202, { ok: true, jobId: job.id, target, dryRun });
      });
      return undefined;
    }

    return send(404, { ok: false, error: 'not found' });
  };
}


const OUTPUT = {
  schema: { type: 'object', additionalProperties: true },
  render: (_args, value) => [{ type: 'text', text: typeof value?.text === 'string' ? value.text : JSON.stringify(value, null, 2) }],
};

/** 把可能被模型传成字符串的对象参数安全归一。 */
function asRecord(value) {
  if (value === null || value === undefined) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof value === 'object' ? value : {};
}

function normalizeValues(record) {
  const out = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined) continue;
    out[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }
  return out;
}

function findTemplate(id) {
  if (!id) return undefined;
  const target = String(id).trim().toLowerCase();
  return templates.find((t) => t.id.toLowerCase() === target) || templates.find((t) => t.name === id);
}

function withSkillDir(text, skillDir) {
  const dir = typeof skillDir === 'string' ? skillDir.trim() : '';
  if (dir === '') return text;
  return text.split('SKILL_DIR').join(dir);
}

function templateRow(template) {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    summary: template.summary,
    difficulty: template.difficulty,
    workflow: template.workflow,
    entry: template.entry,
    paramCount: (template.params || []).length,
    capabilities: template.capabilities || [],
  };
}

function listText(rows) {
  const lines = [`# 模板预设（${rows.length}）`];
  for (const row of rows) {
    lines.push(`- ${row.id}｜${row.name}｜${row.category}｜${row.difficulty}｜${row.summary}`);
  }
  lines.push('');
  lines.push('用 swas_prompt（传 template）或 swas_plan 继续；详情用 action=get。');
  return lines.join('\n');
}

function buildToolDefinitions(ctx, config) {
  const defaultDetail = config?.defaultDetail === 'brief' ? 'brief' : 'full';
  const configSkillDir = typeof config?.skillDir === 'string' ? config.skillDir : '';
  const maxTips = Number.isFinite(config?.maxTips) && config.maxTips > 0 ? Math.min(50, config.maxTips) : 12;

  return [
    {
      name: 'swas_templates',
      description: [
        '列出/查看 SolidWorks 自动化模板预设与任务路由。',
        'action=list 列出模板（可按 category 过滤），action=get 取某个模板的参数、步骤、验收与风险，',
        'action=routing 按中文需求找该用哪个脚本/参考文档。',
        '不确定任务该怎么开始时先调这个。',
      ].join(''),
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', enum: ['list', 'get', 'routing', 'specs', 'spec'], description: '操作类型：list/get 看 UI 模板，routing 查任务路由，specs/spec 用 CLI 需求书模板。' },
          id: { type: 'string', description: 'get / spec：模板 id，例如 mounting-bracket、part-bracket。' },
          category: { type: 'string', description: 'list：按分类过滤，例如 part、hole、assembly、drawing、export。' },
          query: { type: 'string', description: 'routing：中文需求描述，例如「带四个 M6 沉孔的安装板」。' },
          params: { type: 'object', additionalProperties: true, description: 'spec：字段键值，例如 {"SIZE":"120x80x10"}。' },
        },
        required: ['action'],
      },
      output: OUTPUT,
      isConcurrencySafe: () => true,
      async execute(args) {
        const input = asRecord(args);
        const action = String(input.action || 'list');
        if (action === 'specs') {
          const specs = listSpecTemplates();
          const lines = ['# 需求书模板（CLI 与 swas_templates(action:"spec") 共用）'];
          for (const spec of specs) {
            lines.push(`- ${spec.id}｜${spec.title}｜${spec.useFor}`);
            lines.push(`  必填字段：${spec.fields.join(', ')}`);
          }
          lines.push('');
          lines.push('渲染：swas_templates({ action: "spec", id: "<id>", params: { FIELD: "值" } })');
          return { text: lines.join('\n'), specs };
        }
        if (action === 'spec') {
          const specId = String(input.id || '').trim();
          if (specId === '') return { text: 'spec 需要 id，例如 part-bracket；先调 action:"specs" 看清单。', spec: null };
          try {
            const rendered = renderSpec(specId, normalizeValues(asRecord(input.params)));
            const lines = [
              `# ${rendered.title}（${rendered.id}）`,
              rendered.text,
              '',
              '---',
              `已填：${rendered.filled.join(', ') || '无'}`,
              `未填：${rendered.missing.join(', ') || '无'}`,
              rendered.unknown.length > 0 ? `未知字段（模板不认识，已忽略）：${rendered.unknown.join(', ')}` : '',
            ].filter((line) => line !== '');
            return { text: withSkillDir(lines.join('\n'), configSkillDir), spec: rendered };
          } catch (error) {
            return { text: `渲染失败：${error.message}`, spec: null };
          }
        }
        if (action === 'routing') {
          const hits = routeFor(input.query || '');
          const text =
            hits.length === 0
              ? `未匹配到路由。可用分类：${[...new Set(templates.map((t) => t.category))].join('、')}`
              : [`# 任务路由`, ...hits.map((hit) => `- 「${hit.match}」→ ${hit.entry}｜${hit.ref}`)].join('\n');
          return { text, routing: hits };
        }
        if (action === 'get') {
          const template = findTemplate(input.id);
          if (!template) return { text: `未找到模板：${input.id}。先调用 action=list。`, template: null };
          const lines = [
            `# ${template.name}（${template.id}）`,
            template.summary,
            `分类：${template.category}｜难度：${template.difficulty}｜工作流：${template.workflow}`,
            `能力：${(template.capabilities || []).join(', ')}`,
            `脚本：${template.entry}`,
            `参考：${(template.references || []).join('、')}`,
            '',
            '## 参数',
            ...(template.params || []).map((p) => `- ${p.key}｜${p.label}｜例：${p.example ?? '—'}${p.required === false ? '（可选）' : ''}`),
            '',
            '## 步骤',
            ...(template.steps || []).map((s, i) => `${i + 1}. ${s}`),
            '',
            '## 验收',
            ...(template.checks || []).map((c) => `- ${c}`),
            '',
            '## 风险',
            ...(template.risks || []).map((r) => `- ${r}`),
          ];
          return { text: lines.join('\n'), template };
        }
        if (action !== 'list') {
          return { text: `未知 action：${action}。可用：list / get / routing / specs / spec。`, templates: [] };
        }
        const category = String(input.category || '').trim().toLowerCase();
        const rows = templates
          .filter((t) => category === '' || t.category.toLowerCase() === category)
          .map(templateRow);
        return { text: listText(rows), templates: rows };
      },
    },
    {
      name: 'swas_prompt',
      description: [
        '生成一份可直接执行的 SolidWorks 任务提示词（含技能入口、参数表、特征步骤、验收证据、硬性约束与禁止项）。',
        '传 task 会自动匹配最合适的模板；也可用 template 指定模板 id，用 params 填参数键值。',
        '不确定模板时先 swas_templates(action=list)。缺参数会在 missing 里返回，提示词里以【标签｜例：…】占位。',
      ].join(''),
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          task: { type: 'string', description: '一句话需求，例如「做一块 120x80x10 的安装板，四角 M6 沉孔」。' },
          template: { type: 'string', description: '模板 id（可选）：见 swas_templates 的 id。' },
          params: {
            type: 'object',
            additionalProperties: true,
            description: '参数键值，例如 {"size":"120×80×10","hole":"M6 沉孔"}。键名见模板的 params[].key。',
          },
          detail: { type: 'string', enum: ['brief', 'full'], description: 'brief 精简版；full 含风险与交付物（默认）。' },
        },
      },
      output: OUTPUT,
      isConcurrencySafe: () => true,
      async execute(args) {
        const input = asRecord(args);
        const task = typeof input.task === 'string' ? input.task : '';
        let template = findTemplate(input.template);
        let alternatives = [];
        if (!template) {
          const matched = matchTemplate(templates, task);
          template = matched.template;
          alternatives = matched.alternatives;
        }
        const chosen = template || fallbackTemplate;
        const values = normalizeValues(asRecord(input.params));
        const detail = input.detail === 'brief' ? 'brief' : defaultDetail;
        const { prompt, missing, optionalMissing } = buildPrompt({ template: chosen, task, values, detail });
        const text = withSkillDir(prompt, configSkillDir);
        const routingHits = routeFor(`${task} ${chosen.name}`);
        const body = [
          text,
          '',
          '---',
          `模板：${chosen.id}（${chosen.name}）｜必填缺失：${missing.length > 0 ? missing.join(', ') : '无'}`,
          optionalMissing.length > 0 ? `可选未填：${optionalMissing.join(', ')}` : '',
          routingHits.length > 0 ? `建议脚本：${routingHits.map((h) => h.entry).join('；')}` : `建议脚本：${chosen.entry}`,
          alternatives.length > 1 ? `其他候选：${alternatives.slice(1).map((a) => `${a.name}(${a.id})`).join('、')}` : '',
        ]
          .filter((line) => line !== '')
          .join('\n');
        return {
          text: body,
          template: chosen.id,
          templateName: chosen.name,
          missing,
          optionalMissing,
          prompt: text,
          alternatives,
          routing: routingHits,
        };
      },
    },
    {
      name: 'swas_plan',
      description: [
        '生成九段式整体设计思路：需求澄清、单位坐标、参数化草图、特征顺序、装配自由度、运动验证、出图标注、交付证据、风险复核。',
        '每段给出工程要点与本任务的具体落点，可直接作为建模前的方案说明或让另一个模型照着执行。',
        '适合需求含糊、跨零件/装配/出图多个域、或需要先评审方案再动手的场景。',
      ].join(''),
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          task: { type: 'string', description: '需求描述。' },
          template: { type: 'string', description: '模板 id（可选），用于把思路落到具体步骤。' },
          constraints: { type: 'string', description: '额外约束，例如材料 6061-T6、CNC 加工、必须出 GB 工程图。' },
        },
      },
      output: OUTPUT,
      isConcurrencySafe: () => true,
      async execute(args) {
        const input = asRecord(args);
        const task = typeof input.task === 'string' ? input.task : '';
        let template = findTemplate(input.template);
        if (!template) template = matchTemplate(templates, `${task} ${input.constraints || ''}`).template;
        const { plan, text } = buildPlan({ task, template, constraints: input.constraints });
        return { text: withSkillDir(text, configSkillDir), plan };
      },
    },
    {
      name: 'swas_tips',
      description: [
        '检索 SolidWorks 自动化技巧库：单位换算、草图完全定义、选择与 VARIANT、特征参数、装配配合、Motion、工程图、导出与哈希、外观、网格导入、排障错误码。',
        '每条含标题、说明、可选代码片段与出处文档。写脚本前查一次，比踩坑快。',
      ].join(''),
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          query: { type: 'string', description: '关键词，支持中文，例如「圆角 顺序」「VARIANT」「结果不过期」。' },
          category: { type: 'string', description: '分类过滤：units/sketch/selection/api/feature/hole/error/assembly/mate/motion/drawing/export/delivery/appearance/mesh/review。' },
          limit: { type: 'number', description: `返回条数上限，默认 ${maxTips}。` },
        },
      },
      output: OUTPUT,
      isConcurrencySafe: () => true,
      async execute(args) {
        const input = asRecord(args);
        const limit = Number.isFinite(input.limit) ? input.limit : maxTips;
        const found = searchTips(tips, { query: input.query, category: input.category, limit });
        const lines = [`# 技巧（命中 ${found.length} 条）`];
        for (const tip of found) {
          lines.push('');
          lines.push(`## ${tip.title}［${tip.category}］`);
          lines.push(tip.body);
          if (tip.code) {
            lines.push('```python');
            lines.push(tip.code);
            lines.push('```');
          }
          lines.push(`出处：${tip.source}`);
        }
        return { text: lines.join('\n'), count: found.length, tips: found };
      },
    },
    {
      name: 'swas_gate',
      description: [
        '按工作流或能力名返回交付门禁清单与验收提示词：必查项、证据文件、命中即 blocked 的条件。',
        '汇报「做完了」之前必须过一遍；不通过项要给出修复动作与重跑步骤。',
      ].join(''),
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          workflow: { type: 'string', description: '工作流 id，例如 mounting_bracket、assembly_mates、engineering_drawing。' },
          capability: { type: 'string', description: '能力名，例如 part_and_features、holes_and_finishing、export_delivery。' },
          task: { type: 'string', description: '可选的当前任务描述，会写进验收提示词开头。' },
        },
      },
      output: OUTPUT,
      isConcurrencySafe: () => true,
      async execute(args) {
        const input = asRecord(args);
        const selected = pickGates(gates, { workflow: input.workflow, capability: input.capability });
        const prompt = gatePrompt(selected, { task: input.task });
        return { text: withSkillDir(prompt, configSkillDir), gates: selected };
      },
    },
    {
      name: 'swas_deploy',
      description: [
        '把上游 SolidWorks Automation Skill 部署到本机 Agent 客户端（codex / claude / cursor / agents / openclaw）。',
        'action:"status" 只读列出各客户端目录状态；action:"install" 默认 dryRun=true 先打印计划，确认后传 dryRun:false 才真正落盘。',
        '目录已存在默认跳过，force=true 才会改名为 <dir>.bak-<时间戳> 再装；不跑上游脚本、不改上游代码。',
      ].join(''),
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', enum: ['status', 'install'], description: '操作类型。' },
          target: { type: 'string', description: '目标客户端：codex|claude|cursor|agents|openclaw|all，默认 codex。' },
          ref: { type: 'string', description: '上游 ref（commit/tag/分支），默认钉死的 commit。' },
          dryRun: { type: 'boolean', description: 'install 时是否只打印计划，默认 true。' },
          force: { type: 'boolean', description: '目标已存在时是否备份后覆盖，默认 false。' },
        },
        required: ['action'],
      },
      output: OUTPUT,
      isConcurrencySafe: () => false,
      async execute(args) {
        const input = asRecord(args);
        const action = String(input.action || 'status');
        if (action === 'status') {
          const clients = detectClients();
          const lines = ['# 客户端状态', `上游：${UPSTREAM}`, `默认 ref：${DEFAULT_REF}`, ''];
          lines.push('target      skills目录  状态                commit');
          for (const client of clients) {
            lines.push(
              `${client.target.padEnd(11)} ${(client.skillsDirExists ? '有' : '无').padEnd(11)} ${client.state.padEnd(19)} ${client.commit ? client.commit.slice(0, 10) : '-'}`,
            );
          }
          lines.push('');
          lines.push('状态含义：installed-by-plugin 本插件装过；unmanaged 别的方式装的（部署时跳过、不覆盖）；not-installed 客户端目录不存在。');
          return { text: lines.join('\n'), clients };
        }
        const target = String(input.target || config.autoFetchTarget || 'codex');
        const dryRun = input.dryRun !== false;
        const ref = typeof input.ref === 'string' && input.ref.trim() !== '' ? input.ref : DEFAULT_REF;
        const logs = [];
        let results;
        try {
          results = installMany({
            targets: [target],
            ref,
            force: input.force === true,
            dryRun,
            log: (line) => logs.push(line),
          });
        } catch (error) {
          return { text: `部署参数有误：${error.message}`, results: [] };
        }
        const lines = [dryRun ? '# 部署计划（未落盘，确认后传 dryRun:false）' : '# 部署结果', ...logs];
        return { text: lines.join('\n'), results };
      },
    },
    {
      name: 'swas_status',
      description: [
        '查看 SolidWorks 副驾自身状态：知识库条目数、预置 Agent 模式、技能目录是否存在、Web 面板模块是否已装配。',
        '面板没出现、或不确定技能路径配得对不对时先调这个。',
      ].join(''),
      parameters: { type: 'object', additionalProperties: false, properties: {} },
      output: OUTPUT,
      isConcurrencySafe: () => true,
      async execute() {
        const clientModules = typeof ctx.get === 'function' ? ctx.get('clientModules') : undefined;
        let clientPath;
        try {
          clientPath = clientModules && typeof clientModules.clientPath === 'function'
            ? clientModules.clientPath('dsh-solidworks-copilot')
            : undefined;
        } catch {
          clientPath = undefined;
        }
        const dir = (configSkillDir || '').trim();
        const skillDirExists = dir === '' ? null : existsSync(dir);
        let clientLine = '客户端：读取失败';
        try {
          clientLine = `客户端：${detectClients().map((c) => `${c.target}=${c.state}`).join('、')}`;
        } catch {
          /* 读不到客户端目录不影响其它状态 */
        }
        const lines = [
          `# SolidWorks 副驾 v${meta.version}`,
          `模板 ${templates.length}｜技巧 ${tips.length}｜门禁 ${gates.length}｜路由 ${routing.length}｜Agent 模式 ${agentModes.length}｜需求书模板 ${listSpecTemplates().length}`,
          `Agent 模式：${agentModes.map((m) => `${m.name}（${m.id}）`).join('、')}`,
          clientLine,
          `技能目录：${dir === '' ? '未配置（提示词里保留 SKILL_DIR 占位符）' : `${dir}｜${skillDirExists ? '存在' : '不存在'}`}`,
          `加载时自动部署：${config.autoFetch === true ? `开启（target=${config.autoFetchTarget || 'codex'}）` : '关闭（需要时调 swas_deploy）'}`,
          `Web 面板模块：${clientPath ? `已装配（${clientPath}）` : '未装配——Host 组合是在启动时建立的，重启 DSH 后加载'}`,
        ];
        return { text: lines.join('\n'), client: { id: 'dsh-solidworks-copilot', composed: Boolean(clientPath), path: clientPath || null } };
      },
    },
  ];
}

/**
 * 注册全部工具。
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ skillDir?: string, defaultDetail?: string, maxTips?: number, autoFetch?: boolean, autoFetchTarget?: string, ref?: string }} [config]
 */
export function apply(ctx, config = {}) {
  const disposers = buildToolDefinitions(ctx, config).map((definition) =>
    ctx.effect(() => ctx.tools.register(definition), `solidworks-copilot: ${definition.name}`),
  );
  // 面板的「技能部署」页通过这两条路由真正执行部署；宿主没有 webServer 时静默跳过。
  if (typeof ctx.inject === 'function') {
    ctx.inject(['webServer'], (webCtx) => {
      webCtx.effect(
        () => webCtx.webServer.register({ kind: 'prefix', path: ROUTE_PREFIX, handler: createDeployHandler() }),
        'solidworks-copilot: deploy route',
      );
    });
  }
  let cancelled = false;
  if (config.autoFetch === true) {
    // 默认不自动部署；显式开启时放到下一轮事件循环，失败只影响部署，不影响 DSH 启动。
    Promise.resolve().then(() => {
      if (cancelled) return;
      const targets = String(config.autoFetchTarget || 'codex')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      for (const target of targets) {
        try {
          ensureSkill({ target, ref: config.ref || DEFAULT_REF, log: () => {} });
        } catch {
          /* 单个目标失败不阻断其它目标 */
        }
      }
    });
  }
  return () => {
    cancelled = true;
    for (const dispose of disposers) {
      try {
        dispose();
      } catch {
        /* 已释放 */
      }
    }
  };
}
