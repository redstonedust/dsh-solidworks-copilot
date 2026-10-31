/**
 * 冒烟测试：用真 React + react-dom/server 渲染插件 UI 的每个标签页。
 *
 * 覆盖：模块加载契约、apply 注册契约、五个标签页 + 收起态渲染、
 * 数据完整性（模板/技巧/门禁/提示词骨架）、以及隐藏字段缺失导致的崩溃。
 *
 * 用法：node scripts/smoke.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');
const profileModules = (() => {
  const fromEnv = process.env.DSH_PROFILE_NODE_MODULES;
  if (fromEnv) return fromEnv;
  const profileDir = process.env.DSH_PROFILE_DIR;
  if (profileDir) return path.join(profileDir, 'node_modules');
  const home = os.homedir();
  for (const name of ['desktop', 'web']) {
    const candidate = path.join(home, '.dsh', 'profiles', name, 'node_modules');
    if (fs.existsSync(path.join(candidate, 'react'))) return candidate;
  }
  return path.join(home, '.dsh', 'profiles', 'desktop', 'node_modules');
})();
const requireFromProfile = createRequire(`${profileModules}/index.js`);
const React = requireFromProfile('react');
const { renderToStaticMarkup } = requireFromProfile('react-dom/server');

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`${ok ? '✓' : '✗'} ${message}`);
};

// ── 1. 模块加载契约 ───────────────────────────────────────────────
let captured;
const sandbox = {
  window: { __ModuleLoader__: { load: (spec) => { captured = spec; } } },
  console,
  setTimeout,
  clearTimeout,
  navigator: { clipboard: null },
  document: undefined,
};
vm.createContext(sandbox);
const source = fs.readFileSync(path.join(packageRoot, 'client.js'), 'utf8');
vm.runInContext(source, sandbox, { filename: 'client.js' });

check(Boolean(captured), 'client.js 调用 __ModuleLoader__.load()');
check(captured && captured.id === 'dsh-solidworks-copilot', `模块 id = ${captured && captured.id}`);

const mod = captured.factory((name) => {
  if (name === 'react') return React;
  throw new Error(`unexpected require: ${name}`);
});
check(typeof mod.apply === 'function', 'factory 返回 apply');
check(Array.isArray(mod.inject) && mod.inject.includes('slots'), `inject = ${JSON.stringify(mod.inject)}`);

// ── 2. apply 注册契约 ─────────────────────────────────────────────
let localeCalls = 0;
const registrations = [];
const injectedSlots = [];
const ctx = {
  effect(fn) {
    return fn();
  },
  locale: {
    register() {
      localeCalls += 1;
      return () => {};
    },
    bind() {
      return (key) => key;
    },
  },
  slots: {
    inject(key, cb) {
      injectedSlots.push(key);
      return cb();
    },
    register(options, Component) {
      registrations.push({ options, Component });
      return () => {};
    },
  },
};
mod.apply(ctx);
check(localeCalls === 1, '注册了一次语言包');
check(
  injectedSlots.join(',') === 'conversation.composer.dock,sidebar.panellist,main',
  `注入三个 slot：${injectedSlots.join(',')}`,
);
const dock = registrations.find((item) => item.options.name === 'conversation.composer.dock');
const panelRow = registrations.find((item) => item.options.name === 'sidebar.panellist');
const page = registrations.find((item) => item.options.name === 'main');
check(dock && dock.options.id === 'solidworks-copilot', `dock 注册 id = ${dock && dock.options.id}`);
check(dock && dock.options.locale === 'solidworks-copilot', 'dock 注册带 locale 命名空间');
check(panelRow && panelRow.options.id === 'solidworks-copilot', '侧边栏面板行注册成功');
check(panelRow && typeof panelRow.options.label === 'function', '侧边栏面板行有 label thunk');
check(page && page.options.key === 'solidworks-copilot', '主面板 key = solidworks-copilot');
check([dock, panelRow, page].every((item) => item && typeof item.Component === 'function'), '三个组件都是函数组件');

// ── 3. 逐标签页 SSR 渲染 ─────────────────────────────────────────
const t = (key) => key;
const inserted = [];
const baseProps = {
  t,
  sessionId: 'smoke',
  inputActions: { setDraft: (text) => inserted.push(text) },
};

function render(props) {
  const html = renderToStaticMarkup(React.createElement(dock.Component, Object.assign({}, baseProps, props)));
  return html;
}

function renderPage(props) {
  return renderToStaticMarkup(
    React.createElement(
      page.Component,
      Object.assign({}, { t: t, sessionId: undefined, inputActions: undefined }, props),
    ),
  );
}

const tabs = ['templates', 'prompt', 'plan', 'tips', 'gate'];
let collapsed = '';
try {
  collapsed = render({});
  check(collapsed.includes('SolidWorks 副驾') && collapsed.includes('打开助手'), '收起态渲染出中文标题与展开按钮');
  check(!/\b(header|common|tab|templates|prompt|plan|tips|gate|modes|unit)\.[a-z]/.test(collapsed), '收起态没有漏出 i18n key');
} catch (error) {
  failures.push(`收起态渲染抛错：${error.message}`);
  console.log('✗ 收起态渲染抛错', error);
}

for (const tab of tabs) {
  try {
    const html = render({ defaultOpen: true, defaultTab: tab });
    check(html.length > 200, `标签页 ${tab} 渲染 ${html.length} 字符`);
  } catch (error) {
    failures.push(`标签页 ${tab} 渲染抛错：${error.message}`);
    console.log(`✗ 标签页 ${tab} 渲染抛错`, error);
  }
}

// 内容抽查：模板页应出现真实模板名，技巧页应出现真实技巧标题。
const templatesHtml = render({ defaultOpen: true, defaultTab: 'templates' });
check(templatesHtml.includes('安装板 / 支架'), '模板页列出「安装板 / 支架」');
check(templatesHtml.includes('简单') && templatesHtml.includes('零件'), '模板卡片用中文显示难度与分类');
const tipsHtml = render({ defaultOpen: true, defaultTab: 'tips' });
check(tipsHtml.includes('搜：单位、圆角'), '技巧页有中文搜索占位符');

// 主面板（侧边栏页面）逐标签页渲染
const pageTabs = ['templates', 'prompt', 'plan', 'tips', 'gate', 'modes'];
const LEAK = /\b(header|common|tab|templates|prompt|plan|tips|gate|modes|unit|flash)\.[a-z][a-zA-Z]/;
for (const pageTab of pageTabs) {
  try {
    const html = renderPage({ defaultTab: pageTab });
    check(html.length > 300, `主面板 ${pageTab} 渲染 ${html.length} 字符`);
    check(!LEAK.test(html), `主面板 ${pageTab} 没有漏出 i18n key`);
  } catch (error) {
    failures.push(`主面板 ${pageTab} 渲染抛错：${error.message}`);
    console.log(`✗ 主面板 ${pageTab} 渲染抛错`, error);
  }
}
try {
  const modesHtml = renderPage({ defaultTab: 'modes' });
  check(
    modesHtml.includes('swas-cad') && modesHtml.includes('swas-review'),
    '主面板列出两个 Agent 模式',
  );
} catch (error) {
  failures.push(`Agent 模式页渲染抛错：${error.message}`);
}

// ── 4. 数据完整性 ────────────────────────────────────────────────
const dataMatch = /const DATA = (\{.*?\});\s*\n/s.exec(source);
check(Boolean(dataMatch), 'client.js 内嵌 DATA');
const DATA = dataMatch ? JSON.parse(dataMatch[1]) : {};
check(DATA.templates && DATA.templates.length === 16, `模板 ${DATA.templates && DATA.templates.length} 个`);
check(DATA.tips && DATA.tips.length === 60, `技巧 ${DATA.tips && DATA.tips.length} 条`);
check(DATA.gates && DATA.gates.length === 8, `门禁 ${DATA.gates && DATA.gates.length} 个`);
check(Array.isArray(DATA.designPhases) && DATA.designPhases.length === 9, `设计阶段 ${DATA.designPhases && DATA.designPhases.length} 段`);
for (const template of DATA.templates || []) {
  if (!template.promptFull || !template.promptFull.includes('{{task}}') || !template.promptFull.includes('## 验收证据')) {
    failures.push(`模板 ${template.id} 的提示词骨架不完整`);
  }
  if (!template.params || template.params.length < 3) failures.push(`模板 ${template.id} 参数不足 3 个`);
}
check(!failures.some((f) => f.includes('提示词骨架不完整')), '每个模板都有完整提示词骨架');
check(!failures.some((f) => f.includes('参数不足')), '每个模板至少 3 个参数');

// ── 5. Host 生成器一致性 ─────────────────────────────────────────
const generate = await import(new URL('../generate.js', import.meta.url).href);
const catalog = await import(new URL('../catalog.js', import.meta.url).href);
const sample = catalog.templates[0];
const hostPrompt = generate.buildPrompt({ template: sample, task: '冒烟测试', values: {}, detail: 'full' }).prompt;
const bakedTemplate = (DATA.templates || []).find((item) => item.id === sample.id) || {};
const browserPrompt = String(bakedTemplate.promptFull || '').replace(/\{\{task\}\}/g, '冒烟测试');
check(browserPrompt !== '' && hostPrompt.startsWith(browserPrompt.split('\n')[0]), 'Host 与浏览器提示词首行一致');
check(hostPrompt.includes('## 执行步骤') && hostPrompt.includes('## 硬性约束'), 'Host 提示词含步骤与硬性约束');

console.log('');
if (failures.length > 0) {
  console.error(`失败 ${failures.length} 项：`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('全部冒烟检查通过。');
}
