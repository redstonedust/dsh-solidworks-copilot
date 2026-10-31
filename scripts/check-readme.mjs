/**
 * README 自检：图片是否存在、目录锚点是否命中、语言互链是否正确。
 * 用法：node scripts/check-readme.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const files = ['README.md', 'README.en.md'];

/** GitHub 标题 slug：小写、去标点、空格转连字符（保留中日韩与字母数字）。 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

let failures = 0;
const readmeImages = new Set();

for (const file of files) {
  const full = path.join(root, file);
  const text = fs.readFileSync(full, 'utf8');

  const images = [
    ...[...text.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]),
    ...[...text.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]),
  ].filter((src) => !/^https?:/.test(src));
  for (const src of images) readmeImages.add(src);
  const missing = images.filter((src) => !fs.existsSync(path.join(root, src)));

  const anchors = [...text.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1]);
  const headings = [...text.matchAll(/^#{2,6} (.+)$/gm)].map((m) => slugify(m[1]));
  const headingSet = new Set(headings);
  const deadAnchors = anchors.filter((anchor) => !headingSet.has(anchor));

  const hasCounterpart = file === 'README.md' ? text.includes('README.en.md') : text.includes('](README.md)');

  console.log(`\n${file}`);
  console.log(`  图片 ${images.length} 张，缺失 ${missing.length}`);
  console.log(`  目录锚点 ${anchors.length} 条，未命中 ${deadAnchors.length}`);
  console.log(`  语言互链 ${hasCounterpart ? '有' : '缺失'}`);

  if (missing.length) {
    failures += 1;
    for (const src of missing) console.log(`    ✗ 缺文件: ${src}`);
  }
  if (deadAnchors.length) {
    failures += 1;
    for (const anchor of deadAnchors) console.log(`    ✗ 死锚点: #${anchor}`);
  }
  if (!hasCounterpart) {
    failures += 1;
    console.log('    ✗ 缺少语言互链');
  }
}

const totalBytes = [...readmeImages]
  .filter((src) => fs.existsSync(path.join(root, src)))
  .reduce((sum, src) => sum + fs.statSync(path.join(root, src)).size, 0);
console.log(`\n图片合计 ${(totalBytes / 1024).toFixed(1)} KB（共 ${readmeImages.size} 个文件）`);

if (failures > 0) {
  console.error(`\n失败 ${failures} 项`);
  process.exitCode = 1;
} else {
  console.log('\nREADME 自检通过。');
}
