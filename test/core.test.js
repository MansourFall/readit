import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { validateModel, safeSourcePath } from '../src/model.js';
import { scanRepository, hydrateEvidence, readSource, sha256 } from '../src/repository.js';
import { buildHtml } from '../src/build.js';
import { plantUmlUseCases, plantUmlSequence, sequenceSvg, useCaseSvg } from '../src/diagrams.js';
import { startServer } from '../src/server.js';
import { createShop } from '../examples/shop/app.js';
import { Store } from '../examples/shop/store.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demo = JSON.parse(await fs.readFile(path.join(root, 'examples/shop/readit.json'), 'utf8'));
async function temp(t) { const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'readit-test-')); t.after(() => fs.rm(dir, { recursive: true, force: true })); return dir; }

test('demo model has valid, exact evidence from executable source', async () => {
  assert.deepEqual(validateModel(demo), { valid: true, errors: [] });
  assert.deepEqual((await hydrateEvidence(demo, root)).problems, []);
});
test('independent agent-generated invitation model has matching source evidence', async () => {
  const model = JSON.parse(await fs.readFile(path.join(root, 'examples/invitations/readit.json'), 'utf8'));
  assert.equal(validateModel(model).valid, true);
  assert.deepEqual((await hydrateEvidence(model, root)).problems, []);
});
test('validation rejects dangling references, observed guesses, duplicate IDs, and unsafe evidence', () => {
  const m = structuredClone(demo);
  m.useCases[0].scenarios[0].steps[0].to = 'unknown';
  m.useCases[0].evidenceIds = [];
  m.useCases[1].id = m.useCases[0].id;
  m.evidence[0].path = '../secret';
  const errors = validateModel(m).errors.join('\n');
  assert.match(errors, /unknown sequence participant/); assert.match(errors, /must not be empty/);
  assert.match(errors, /duplicate id/); assert.match(errors, /safe relative/);
  const inferred = structuredClone(demo); delete inferred.useCases[1].scenarios[0].steps[0].rationale;
  assert.equal(validateModel(inferred).valid, false);
});
test('validator handles malformed and empty models without crashing', () => {
  for (const m of [null, {}, [], { ...demo, evidence: [null], actors: null, relationships: [null] }]) assert.equal(validateModel(m).valid, false);
  const empty = { ...demo, useCases: [], actors: [], participants: [], evidence: [], relationships: [] };
  assert.equal(validateModel(empty).valid, true);
});
test('scan respects git ignores and skips sensitive files, binaries, generated content and symlinks', async t => {
  const dir = await temp(t);
  execFileSync('git', ['init', '-q', dir]);
  await fs.writeFile(path.join(dir, '.gitignore'), 'ignored.js\n');
  await fs.writeFile(path.join(dir, 'safe.js'), 'export function hello() {}\n');
  await fs.writeFile(path.join(dir, 'ignored.js'), 'ignored');
  await fs.writeFile(path.join(dir, '.env'), 'SECRET=private');
  await fs.writeFile(path.join(dir, 'binary.js'), Buffer.from([0, 1, 2]));
  await fs.mkdir(path.join(dir, 'dist')); await fs.writeFile(path.join(dir, 'dist/app.js'), 'generated');
  await fs.symlink(path.join(dir, 'safe.js'), path.join(dir, 'link.js'));
  const result = await scanRepository(dir);
  assert.equal(result.strategy, 'git'); assert.deepEqual(result.files.map(x => x.path), ['safe.js']);
  assert.equal(result.files[0].hints[0].line, 1);
  assert.equal(result.omitted.length, 2);
});
test('source access prevents traversal and symlink escapes and detects stale hashes', async t => {
  const dir = await temp(t); await fs.writeFile(path.join(dir, 'file.js'), 'first\nsecond\n');
  const ref = { path: 'file.js', startLine: 1, endLine: 2, sha256: sha256(Buffer.from('old')) };
  const result = await readSource(dir, ref); assert.equal(result.stale, true); assert.equal(result.snippet, 'first\nsecond');
  for (const p of ['../outside', '/etc/passwd', 'a/../file.js', '.env', 'a/.env.local', 'private.key', 'a\\b', '.npmrc']) assert.equal(safeSourcePath(p), false);
  await fs.symlink(path.join(dir, 'file.js'), path.join(dir, 'linked.js'));
  await assert.rejects(readSource(dir, { ...ref, path: 'linked.js' }), /Symlink/);
  await assert.rejects(readSource(dir, { ...ref, endLine: 500 }), /line range/);
});
test('source hydration rejects stale or fabricated evidence snippets', async () => {
  const m = structuredClone(demo); m.evidence[0].sha256 = '0'.repeat(64); m.evidence[1].snippet = 'invented code';
  const result = await hydrateEvidence(m, root);
  assert.match(result.problems.join('\n'), /stale hash/); assert.match(result.problems.join('\n'), /snippet differs/);
});
test('HTML export safely embeds untrusted text and requires no external resources', async () => {
  const m = structuredClone(demo); m.project.name = '</script><img src=x onerror=alert(1)>';
  m.useCases[0].goal = '$& $` $\' </script>';
  const html = await buildHtml(m);
  assert.ok(!html.includes('</script><img'));
  assert.ok(html.includes('\\u003c/script\\u003e'));
  const embedded = JSON.parse(html.match(/<script id="readit-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(embedded.useCases[0].goal, m.useCases[0].goal);
  assert.equal((html.match(/<script\b/g) || []).length, 2);
  assert.ok(!html.includes('src="http'));
});
test('UML exports preserve include direction and message types and escape labels', () => {
  assert.match(plantUmlUseCases(demo), /U1 \.\.> U2 : <<include>>/);
  const u = demo.useCases[1], scenario = u.scenarios[0];
  assert.match(plantUmlSequence(demo, u, scenario), /P3 --> P1 : Return paid receipt/);
  assert.match(plantUmlSequence(demo, u, scenario), /P1 -> P3 : Charge payment token/);
  const m = structuredClone(demo); m.useCases[0].name = '<script>alert(1)</script>';
  assert.ok(!useCaseSvg(m).includes('<script>'));
  const self = { steps: [{ ...scenario.steps[0], from: 'shop', to: 'shop' }] };
  assert.match(sequenceSvg(demo, self), /h60v30h-60/);
});
test('demo success, decline, validation, and stock paths match modeled outcomes', async () => {
  const store = new Store(), shop = createShop(store);
  assert.equal(shop.browseProducts().length, 2);
  assert.equal((await shop.placeOrder({ sku: 'book', token: 'ok' })).status, 201);
  assert.equal(store.stock.get('book'), 2); assert.equal(store.orders.length, 1);
  assert.equal((await shop.placeOrder({ sku: 'book', token: 'declined' })).status, 402);
  assert.equal(store.stock.get('book'), 2); assert.equal(store.orders.length, 1);
  assert.equal((await shop.placeOrder({ sku: 'keyboard', token: 'ok' })).status, 409);
  assert.equal((await shop.placeOrder({ sku: 'book' })).status, 400);
});
test('local server serves explorer and only model-listed source refs', async t => {
  const server = await startServer({ model: demo, root, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  assert.match(await (await fetch(url)).text(), /READIT · Beyond the README/);
  const source = await (await fetch(`${url}/api/source?id=browse`)).json(); assert.equal(source.stale, false);
  assert.equal((await fetch(`${url}/api/source?id=../../etc/passwd`)).status, 404);
  assert.equal((await fetch(`${url}/api/source?id=browse`, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${url}/api/source?id=browse`, { headers: { Origin: 'https://evil.example' } })).status, 403);
});
