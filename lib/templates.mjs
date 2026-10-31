/**
 * 模板库：把"需求书"沉淀成可填参数的文件。
 *
 * 每个模板用 front matter 声明 id / title / useFor / fields，
 * 正文里用 {{FIELD}} 占位。渲染时补齐已知参数，列出还缺哪些。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'templates');

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: match[2] };
}

/** 列出全部模板；目录不存在时返回空数组。 */
export function listTemplates({ dir = DEFAULT_DIR } = {}) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const full = path.join(dir, file);
      const { meta } = parseFrontMatter(fs.readFileSync(full, 'utf8'));
      return {
        id: meta.id || path.basename(file, '.md'),
        title: meta.title || meta.id || file,
        useFor: meta.useFor || '',
        fields: (meta.fields || '').split(',').map((s) => s.trim()).filter(Boolean),
        file: full,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function findTemplate(id, { dir = DEFAULT_DIR } = {}) {
  return listTemplates({ dir }).find((t) => t.id === id) || null;
}

/**
 * 渲染模板。
 * @returns {{id:string, title:string, text:string, filled:string[], missing:string[], unknown:string[]}}
 */
export function renderTemplate(id, params = {}, { dir = DEFAULT_DIR } = {}) {
  const tpl = findTemplate(id, { dir });
  if (!tpl) {
    const err = new Error(`找不到模板: ${id}`);
    err.code = 'ENO_TEMPLATE';
    throw err;
  }
  const { body } = parseFrontMatter(fs.readFileSync(tpl.file, 'utf8'));
  const filled = [];
  const unknown = Object.keys(params).filter((k) => !tpl.fields.includes(k));
  const text = body.replace(/\{\{([A-Z0-9_]+)\}\}/g, (whole, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      filled.push(key);
      return String(params[key]);
    }
    return whole;
  });
  const missing = [...new Set((text.match(/\{\{[A-Z0-9_]+\}\}/g) || []).map((s) => s.slice(2, -2)))];
  return { id: tpl.id, title: tpl.title, text, filled: [...new Set(filled)], missing, unknown };
}
