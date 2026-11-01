/**
 * 自测：不启动 DSH，直接以桩 ctx 调用 Host 半的每个工具，覆盖正常/边界/错误输入。
 *
 * 目的：把「模型胡说八道时工具会不会崩」这类问题在发布前打出来。
 * 用法：node scripts/selftest.mjs
 */

import { apply } from '../index.js';

const failures = [];
const results = [];

function check(ok, message) {
  if (!ok) failures.push(message);
  console.log(`${ok ? '✓' : '✗'} ${message}`);
}

// ── 桩 ctx：捕获注册，模拟 effect/get/inject ─────────────────────
const registered = new Map();
const routes = [];
const ctx = {
  effect(fn) {
    return fn();
  },
  get(name) {
    if (name === 'clientModules') return { clientPath: () => undefined };
    return undefined;
  },
  inject(deps, callback) {
    if (deps.includes('webServer')) {
      callback({
        effect: (fn) => fn(),
        webServer: { register: (route) => { routes.push(route); return () => {}; } },
      });
    }
    return () => {};
  },
  tools: {
    register(definition) {
      registered.set(definition.name, definition);
      return () => registered.delete(definition.name);
    },
  },
};

apply(ctx, { defaultDetail: 'full', maxTips: 5 });

check(registered.size === 7, `注册 7 个工具（实际 ${registered.size}：${[...registered.keys()].join(',')}）`);
for (const name of ['swas_templates', 'swas_prompt', 'swas_plan', 'swas_tips', 'swas_gate', 'swas_deploy', 'swas_status']) {
  check(registered.has(name), `存在工具 ${name}`);
}
check(routes.length === 1 && routes[0].path === '/swas', `注册本地部署路由（实际 ${routes.length} 条）`);

/** 用假 req/res 直接调用本地路由，验证 403 / 200 / 404 与部署预演。 */
function fakeReq({ method = 'GET', url, headers = {}, body = '' }) {
  return {
    method,
    url,
    headers,
    on(event, callback) {
      if (event === 'data' && body !== '') callback(body);
      if (event === 'end') callback();
      return this;
    },
    destroy() {},
  };
}
function fakeRes() {
  const res = { statusCode: 0, headers: {}, body: '' };
  res.setHeader = (key, value) => {
    res.headers[String(key).toLowerCase()] = value;
  };
  res.end = (chunk) => {
    res.body = String(chunk ?? '');
  };
  return res;
}
const sameOrigin = { 'sec-fetch-site': 'same-origin', 'x-swas-client': 'ui' };

if (routes.length === 1) {
  const handler = routes[0].handler;
  const forbidden = fakeRes();
  handler(fakeReq({ url: '/swas/status' }), forbidden);
  check(forbidden.statusCode === 403, '缺同源头 → 403');

  const okStatus = fakeRes();
  handler(fakeReq({ url: '/swas/status', headers: sameOrigin }), okStatus);
  const statusBody = JSON.parse(okStatus.body || '{}');
  check(okStatus.statusCode === 200 && Array.isArray(statusBody.clients), 'GET /swas/status 返回客户端列表');

  const missing = fakeRes();
  handler(fakeReq({ url: '/swas/nope', headers: sameOrigin }), missing);
  check(missing.statusCode === 404, '未知路径 → 404');

  const preview = fakeRes();
  handler(
    fakeReq({ method: 'POST', url: '/swas/deploy', headers: sameOrigin, body: JSON.stringify({ target: 'codex', dryRun: true }) }),
    preview,
  );
  const previewBody = JSON.parse(preview.body || '{}');
  check(preview.statusCode === 202 && typeof previewBody.jobId === 'string', 'POST /swas/deploy 返回任务号（异步执行）');

  const jobRes = fakeRes();
  handler(fakeReq({ url: `/swas/job?id=${previewBody.jobId}`, headers: sameOrigin }), jobRes);
  const jobBody = JSON.parse(jobRes.body || '{}');
  check(
    jobRes.statusCode === 200 && jobBody.job && typeof jobBody.job.percent === 'number',
    'GET /swas/job 返回进度（percent / phase）',
  );

  const badJob = fakeRes();
  handler(fakeReq({ url: '/swas/job?id=not-exist', headers: sameOrigin }), badJob);
  check(badJob.statusCode === 404, '未知任务 → 404');
}


/** 调用一个工具并断言不抛、返回带 text 的对象。 */
async function call(name, args) {
  const tool = registered.get(name);
  if (!tool) throw new Error(`未注册：${name}`);
  const started = Date.now();
  const value = await tool.execute(args ?? {});
  results.push({ name, args, ms: Date.now() - started, textLength: String(value?.text || '').length });
  check(Boolean(value) && typeof value.text === 'string' && value.text.length > 0, `${name}(${JSON.stringify(args)}) 返回文本`);
  return value;
}

// ── 正常路径 ─────────────────────────────────────────────────────
await call('swas_templates', { action: 'list' });
await call('swas_templates', { action: 'get', id: 'mounting-bracket' });
await call('swas_templates', { action: 'routing', query: '带四个 M6 沉孔的安装板' });
await call('swas_templates', { action: 'specs' });
await call('swas_templates', { action: 'spec', id: 'part-bracket', params: { PART_NAME: '测试板', SIZE: '120x80x10' } });
await call('swas_prompt', { task: '做一个 120×80×10 的铝板，四角 M6 沉孔' });
await call('swas_prompt', { task: '', template: 'spur-gear-m2-z24', params: { module: '2' }, detail: 'brief' });
await call('swas_plan', { task: '做一块安装板', template: 'mounting-bracket', constraints: '6061-T6' });
await call('swas_tips', { query: '圆角 顺序' });
await call('swas_gate', { workflow: 'mounting_bracket' });
await call('swas_deploy', { action: 'status' });
await call('swas_status', {});

// ── 边界 / 错误输入：只要求不崩 ───────────────────────────────────
const edgeCases = [
  ['swas_templates', {}],
  ['swas_templates', { action: 'nonsense' }],
  ['swas_templates', { action: 'get' }],
  ['swas_templates', { action: 'get', id: '不存在的模板' }],
  ['swas_templates', { action: 'spec' }],
  ['swas_templates', { action: 'spec', id: '不存在的规格' }],
  ['swas_templates', { action: 'spec', id: 'part-bracket', params: '{"SIZE":"1x1"}' }],
  ['swas_templates', { action: 'list', category: '不存在' }],
  ['swas_prompt', {}],
  ['swas_prompt', { task: null, template: null, params: null }],
  ['swas_prompt', { task: 123, params: '{"size":"1"}' }],
  ['swas_prompt', { template: 'mounting-bracket', params: { size: 120 } }],
  ['swas_plan', {}],
  ['swas_plan', { task: '', template: '不存在' }],
  ['swas_tips', { query: '', category: '不存在', limit: 0 }],
  ['swas_tips', { query: 'x', limit: -5 }],
  ['swas_gate', {}],
  ['swas_gate', { workflow: '不存在的工作流' }],
  ['swas_deploy', {}],
  ['swas_deploy', { action: 'install', target: '不存在', dryRun: true }],
  ['swas_deploy', { action: 'install', target: 'codex', ref: '--upload-pack=calc', dryRun: true }],
];
for (const [name, args] of edgeCases) {
  try {
    const value = await registered.get(name).execute(args);
    check(Boolean(value) && typeof value.text === 'string', `${name} 边界输入 ${JSON.stringify(args)} 未崩`);
  } catch (error) {
    failures.push(`${name} 边界输入 ${JSON.stringify(args)} 抛错：${error.message}`);
    console.log(`✗ ${name} 抛错`, error.message);
  }
}

// ── 语义断言：几个必须成立的输出 ─────────────────────────────────
const specRender = await registered.get('swas_templates').execute({
  action: 'spec',
  id: 'part-bracket',
  params: { PART_NAME: '测试板', SIZE: '120x80x10', MATERIAL: '6061-T6' },
});
check(specRender.text.includes('测试板') && specRender.text.includes('120x80x10'), '规格模板渲染填入了参数');
check(Array.isArray(specRender.spec?.missing) && specRender.spec.missing.length > 0, '规格模板报告了未填字段');

const prompt = await registered.get('swas_prompt').execute({ task: '做一块 120×80×10 的安装板' });
check(prompt.template === 'mounting-bracket', `自动匹配到 mounting-bracket（实际 ${prompt.template}）`);
check(Array.isArray(prompt.missing) && prompt.missing.length > 0, '提示词报告了缺失参数');
check(prompt.prompt.includes('## 执行步骤') && prompt.prompt.includes('## 硬性约束'), '提示词含步骤与硬性约束');

const badDeploy = await registered.get('swas_deploy').execute({ action: 'install', target: '不存在' });
check(badDeploy.text.includes('部署参数有误'), '非法 target 给出可读错误');

const badRef = await registered.get('swas_deploy').execute({ action: 'install', target: 'codex', ref: '--upload-pack=calc', dryRun: true });
check(badRef.text.includes('非法 ref') || badRef.text.includes('部署参数有误'), 'ref 注入被拦截');

const dryDeploy = await registered.get('swas_deploy').execute({ action: 'install', target: 'codex', dryRun: true });
check(dryDeploy.text.includes('部署计划'), '默认 dryRun=true 只打印计划');

const gates = await registered.get('swas_gate').execute({ workflow: 'assembly_mates' });
check(Array.isArray(gates.gates) && gates.gates.length > 0, '工作流能过滤出门禁');

// ── 汇总 ─────────────────────────────────────────────────────────
const slow = results.filter((row) => row.ms > 200);
if (slow.length > 0) console.log(`\n较慢调用：${slow.map((row) => `${row.name} ${row.ms}ms`).join('、')}`);

console.log('');
if (failures.length > 0) {
  console.error(`失败 ${failures.length} 项：`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`全部自测通过（${results.length} 次工具调用 + 边界用例）。`);
}
