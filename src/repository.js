import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { safeSourcePath } from './model.js';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const skipped = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.readit', '.next', '.venv', 'vendor', '__pycache__']);
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.java', '.py', '.go', '.rs', '.rb', '.php', '.c', '.cpp', '.h', '.cs', '.sql', '.md', '.html', '.vue', '.svelte', '.json', '.yaml', '.yml']);

export async function readSource(root, reference) {
  if (!safeSourcePath(reference.path)) throw new Error('Unsafe or sensitive source path');
  const base = await fs.realpath(root);
  const full = await fs.realpath(path.resolve(base, reference.path));
  if (!full.startsWith(base + path.sep)) throw new Error('Source escapes repository');
  // Reject symlinks at every path component, even those pointing within the repo.
  let component = base;
  for (const part of reference.path.split('/')) {
    component = path.join(component, part);
    if ((await fs.lstat(component)).isSymbolicLink()) throw new Error('Symlink sources are not supported');
  }
  const stat = await fs.stat(full);
  if (!stat.isFile() || stat.size > 512000) throw new Error('Source must be a file under 500 KiB');
  const bytes = await fs.readFile(full);
  if (bytes.includes(0)) throw new Error('Binary source is not supported');
  const lines = bytes.toString('utf8').split('\n');
  if (reference.endLine > lines.length) throw new Error('Evidence line range exceeds file');
  return { path: reference.path, sha256: sha256(bytes), stale: reference.sha256 !== sha256(bytes), snippet: lines.slice(reference.startLine - 1, reference.endLine).join('\n') };
}

export async function scanRepository(root) {
  const base = await fs.realpath(root);
  let files = [], strategy = 'filesystem';
  try {
    files = execFileSync('git', ['-C', base, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\0').filter(Boolean);
    strategy = 'git';
  } catch {
    async function walk(dir, relative = '') {
      for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
        const name = relative ? `${relative}/${entry.name}` : entry.name;
        if (skipped.has(entry.name) || !safeSourcePath(name) || entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) await walk(path.join(dir, entry.name), name);
        else if (entry.isFile()) files.push(name);
        if (files.length > 10000) throw new Error('Repository exceeds 10000 files; scan a smaller subdirectory');
      }
    }
    await walk(base);
  }
  files = [...new Set(files)].sort().filter(p => safeSourcePath(p) && !p.split('/').some(x => skipped.has(x)) && extensions.has(path.extname(p)));
  if (files.length > 10000) throw new Error('Repository exceeds 10000 source files; narrow the scope');
  const inventory = [], omitted = [];
  for (const p of files) {
    try {
      const source = await readSource(base, { path: p, startLine: 1, endLine: 1 });
      const bytes = await fs.readFile(path.join(base, p));
      const lines = bytes.toString('utf8').split('\n');
      const hints = [];
      lines.forEach((line, i) => {
        // Hints are starting points for the agent, never classified as use cases.
        if (/\b(?:app|router)\.(?:get|post|put|patch|delete)\s*\(|@(Get|Post|Put|Patch|Delete)\b|\b(?:export )?(?:async )?function\s+\w+|\bclass\s+\w+|^\s*(?:async )?def\s+\w+/.test(line) && hints.length < 60) hints.push({ line: i + 1, text: line.trim().slice(0, 200) });
      });
      inventory.push({ path: p, sha256: source.sha256, lines: lines.length, bytes: bytes.length, hints });
    } catch (e) { omitted.push({ path: p, reason: e.message }); }
  }
  let commit;
  try { commit = execFileSync('git', ['-C', base, 'rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* no commit yet */ }
  return { schemaVersion: '1.0', generatedAt: new Date().toISOString(), strategy, ...(commit ? { commit } : {}), files: inventory, omitted, note: 'Inventory only. Use an agent to inspect code and build an evidence-backed READIT model.' };
}

export async function hydrateEvidence(model, root) {
  const result = structuredClone(model), problems = [];
  for (const ref of result.evidence) {
    try {
      const source = await readSource(root, ref);
      if (source.stale) problems.push(`${ref.id}: stale hash for ${ref.path}`);
      if (ref.snippet !== undefined && ref.snippet !== source.snippet) problems.push(`${ref.id}: snippet differs from referenced lines`);
      ref.snippet = source.snippet;
    } catch (e) { problems.push(`${ref.id}: ${e.message}`); }
  }
  return { model: result, problems };
}
