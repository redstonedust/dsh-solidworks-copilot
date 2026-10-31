/**
 * 共用核心：把上游 SolidWorks Automation Skill 取到本地。
 *
 * 本文件不内置、不改写上游代码，只做 git fetch + 落盘 + 记录 provenance。
 * CLI（bin/fetch-skill.mjs）与 DSH 插件入口（lib/index.js）共用同一套逻辑，
 * 避免两处行为漂移。
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const UPSTREAM = 'https://github.com/wzyn20051216/solidworks-automation-skill.git';
export const DEFAULT_REF = '2f455f2ef5f30db6ef3ce14261199eb5055d99ca';
export const SKILL_DIR_NAME = 'solidworks-automation';

export const TARGETS = {
  codex: ['.codex', 'skills'],
  claude: ['.claude', 'skills'],
  cursor: ['.cursor', 'skills'],
  agents: ['.agents', 'skills'],
  openclaw: ['.openclaw', 'skills'],
};

/**
 * 校验 ref 形态，拒绝把选项注入 git。
 * `git fetch origin <ref>` 中，以 - 开头的 ref 会被 git 当作选项解析
 * （例如 --upload-pack=<cmd>），因此只接受 commit / tag / 分支名。
 */
const REF_PATTERN = /^(?:[0-9a-fA-F]{7,40}|[A-Za-z0-9][A-Za-z0-9._/-]{0,99})$/;
export function assertRef(ref) {
  const value = String(ref ?? '').trim();
  if (!REF_PATTERN.test(value)) {
    throw new Error(`非法 ref: ${value}（只接受 commit / tag / 分支名，且不能以 - 开头）`);
  }
  return value;
}

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function resolveDest({ target = 'codex', dest = null } = {}) {
  if (dest) return path.resolve(dest);
  const seg = TARGETS[target];
  if (!seg) throw new Error(`不支持的 target: ${target}`);
  return path.join(os.homedir(), ...seg, SKILL_DIR_NAME);
}

/** 读取已安装副本的 provenance；不存在或不可解析时返回 null。 */
export function readProvenance(dest) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dest, '.provenance.json'), 'utf8'));
  } catch {
    return null;
  }
}

function fetchInto(dest, ref) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'sw-skill-'));
  git(work, ['init', '--quiet']);
  git(work, ['remote', 'add', 'origin', UPSTREAM]);
  // 只取单个 ref，避免整仓库历史
  git(work, ['fetch', '--quiet', '--depth', '1', 'origin', ref]);
  git(work, ['checkout', '--quiet', 'FETCH_HEAD']);
  for (const required of ['LICENSE', 'SKILL.md']) {
    if (!fs.existsSync(path.join(work, required))) {
      throw new Error(`上游内容缺少必需文件: ${required}`);
    }
  }
  const commit = git(work, ['rev-parse', 'HEAD']);
  const commitDate = git(work, ['log', '-1', '--format=%cI']);
  try {
    fs.renameSync(work, dest);
  } catch (err) {
    // 跨卷（例如 C: 临时目录 -> D: 目标）rename 会 EXDEV，退化为复制
    if (err && err.code === 'EXDEV') {
      fs.cpSync(work, dest, { recursive: true });
      fs.rmSync(work, { recursive: true, force: true });
    } else {
      throw err;
    }
  }
  return { commit, commitDate };
}

/**
 * 拉取并安装。
 * @returns {{dest: string, commit: string, commitDate: string, skipped: boolean, backup?: string}}
 */
export function installSkill({ target = 'codex', dest = null, ref = DEFAULT_REF, force = false, dryRun = false, log = () => {} } = {}) {
  ref = assertRef(ref);
  const resolved = resolveDest({ target, dest });
  log(`上游: ${UPSTREAM}`);
  log(`ref : ${ref}`);
  log(`目标: ${resolved}`);

  let backup = null;
  if (fs.existsSync(resolved)) {
    if (!force) {
      const err = new Error('目标目录已存在');
      err.code = 'EEXIST_TARGET';
      err.dest = resolved;
      throw err;
    }
    backup = `${resolved}.bak-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`;
    if (dryRun) {
      log(`[dry-run] 会把现有目录改名为 ${backup}`);
    } else {
      fs.renameSync(resolved, backup);
      log(`旧目录已备份到: ${backup}`);
    }
  }

  if (dryRun) {
    log('[dry-run] 将从上游拉取并写入目标目录，未做任何改动');
    return { dest: resolved, commit: null, commitDate: null, skipped: true, backup };
  }

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const { commit, commitDate } = fetchInto(resolved, ref);

  const provenance = {
    upstream: UPSTREAM,
    requestedRef: ref,
    resolvedCommit: commit,
    commitDate,
    fetchedAt: new Date().toISOString(),
    license: 'MIT',
    licenseHolder: 'SolidWorks Automation Skill Contributors',
    notice: 'See NOTICE and licenses/UPSTREAM-MIT.txt in the plugin repository.',
  };
  fs.writeFileSync(
    path.join(resolved, '.provenance.json'),
    `${JSON.stringify(provenance, null, 2)}\n`,
    'utf8',
  );

  return { dest: resolved, commit, commitDate, skipped: false, backup };
}

/**
 * 插件用：缺了就补，已装则不动作，任何失败只记录不上抛。
 * 幂等 —— DSH 每次启动都会调用它。
 */
export function ensureSkill({ target = 'codex', dest = null, ref = DEFAULT_REF, log = () => {} } = {}) {
  const resolved = resolveDest({ target, dest });
  const skillsDir = path.dirname(resolved);
  if (!fs.existsSync(skillsDir)) {
    // 与 CLI 的 installMany 保持一致：不替用户创建客户端目录
    log(`skills 目录不存在，跳过（不主动创建）: ${skillsDir}`);
    return { dest: resolved, action: 'skip-no-skills-dir', commit: null };
  }
  const existing = readProvenance(resolved);
  if (existing) {
    log(`已安装，跳过: ${resolved} @ ${String(existing.resolvedCommit).slice(0, 10)}`);
    return { dest: resolved, action: 'skip', commit: existing.resolvedCommit ?? null };
  }
  if (fs.existsSync(resolved)) {
    // 目录在但不是本插件装的（例如用户手动 clone）：不覆盖、不重命名
    log(`目录已存在但非本插件安装，跳过: ${resolved}`);
    return { dest: resolved, action: 'skip-unmanaged', commit: null };
  }
  try {
    const result = installSkill({ target, dest, ref, log });
    return { dest: resolved, action: 'installed', commit: result.commit };
  } catch (err) {
    log(`拉取失败（已忽略，不影响 DSH 启动）: ${err && err.message ? err.message : err}`);
    return { dest: resolved, action: 'failed', error: String(err && err.message ? err.message : err) };
  }
}

/**
 * 多目标部署。targets 支持 codex / claude / cursor / agents / openclaw / all。
 * all 只装到"skills 目录已存在"的客户端；一个都没有时如实报告，不替你创建目录。
 */
export function installMany({ targets = ['codex'], dest = null, ref = DEFAULT_REF, force = false, dryRun = false, log = () => {} } = {}) {
  let list = targets;
  if (list.includes('all')) list = Object.keys(TARGETS);
  else list = list.flatMap((t) => String(t).split(',')).map((s) => s.trim()).filter(Boolean);

  if (dest && list.length > 1) {
    throw new Error('--dest 只能配合单个 target 使用');
  }

  const results = [];
  for (const target of list) {
    if (!TARGETS[target]) throw new Error(`不支持的 target: ${target}`);
    const dir = resolveDest({ target, dest });
    const skillsDir = path.dirname(dir);
    if (dest === null && !fs.existsSync(skillsDir)) {
      log(`跳过 ${target}: skills 目录不存在（${skillsDir}）`);
      results.push({ target, action: 'skip-no-skills-dir', dest: dir });
      continue;
    }
    try {
      const r = installSkill({ target, dest, ref, force, dryRun, log: (line) => log(`[${target}] ${line}`) });
      results.push({ target, action: dryRun ? 'planned' : 'installed', dest: r.dest, commit: r.commit });
    } catch (err) {
      const action = err && err.code === 'EEXIST_TARGET' ? 'skip-exists' : 'failed';
      log(`[${target}] ${action}: ${err && err.message ? err.message : err}`);
      results.push({ target, action, dest: dir, error: err && err.message ? err.message : String(err) });
    }
  }
  return results;
}

/** 探测各客户端：skills 目录是否存在、本插件装的是哪个 commit。 */
export function detectClients() {
  return Object.keys(TARGETS).map((target) => {
    const dir = resolveDest({ target });
    const skillsDir = path.dirname(dir);
    const prov = readProvenance(dir);
    let state = 'not-installed';
    if (prov) state = 'installed-by-plugin';
    else if (fs.existsSync(dir)) state = 'unmanaged';
    return {
      target,
      skillsDir,
      skillsDirExists: fs.existsSync(skillsDir),
      dest: dir,
      state,
      commit: prov ? prov.resolvedCommit : null,
    };
  });
}
