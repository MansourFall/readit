#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateModel } from '../src/model.js';
import { scanRepository, hydrateEvidence } from '../src/repository.js';
import { buildHtml } from '../src/build.js';
import { startServer } from '../src/server.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageMetadata = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const version = packageMetadata.version;
const help = `READIT ${version} — Beyond the README. Follow the story.

Usage:
  readit demo [--port 4173]                  Explore the included source-backed demo
  readit scan <repo> [--out inventory.json]  Inventory safe source files for your agent
  readit validate <model.json> [--root repo] Validate model; optionally verify evidence
  readit build <model.json> [--out file.html] [--root repo]
                                           Export an offline, self-contained explorer
  readit serve <model.json> [--root repo] [--port 4173]
                                           Serve locally; check current source on click
  readit agent-guide                         Print the packaged coding-agent workflow
  readit install-skill [--to directory]      Legacy copy; default is the Codex skills dir

The scan is an inventory, not an AI analyzer. Install the portable skill to discover use cases.
Portable skill install: npx skills add MansourFall/readit --skill readit
No API key, browser uploads, telemetry, remote rendering, or runtime dependencies.
`;
const [command, ...args] = process.argv.slice(2);
function parse(allowed) {
  const opts = {}, positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (!allowed.includes(key) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Unknown or incomplete option: ${args[i]}`);
      opts[key] = args[++i];
    } else positional.push(args[i]);
  }
  return { opts, positional };
}
async function readModel(filename) {
  if (!filename) throw new Error('Provide a model JSON path');
  if ((await fs.stat(filename)).size > 5 * 1024 * 1024) throw new Error('Model exceeds 5 MiB');
  const model = JSON.parse(await fs.readFile(filename, 'utf8'));
  const result = validateModel(model);
  if (!result.valid) throw new Error(result.errors.join('\n'));
  return model;
}
async function write(filename, content) {
  await fs.mkdir(path.dirname(path.resolve(filename)), { recursive: true });
  await fs.writeFile(filename, content);
  console.log(`Wrote ${path.resolve(filename)}`);
}
try {
  if (!command || ['help', '--help', '-h'].includes(command)) console.log(help);
  else if (command === '--version') console.log(version);
  else if (command === 'agent-guide') {
    const { positional } = parse([]);
    if (positional.length) throw new Error('agent-guide takes no arguments');
    const referenceRoot = path.join(root, 'skills/readit/references');
    const guideFiles = ['agent-guide.md', 'analysis-playbook.md', 'model-contract.md'];
    const guides = await Promise.all(guideFiles.map(filename => fs.readFile(path.join(referenceRoot, filename), 'utf8')));
    console.log(guides.map(guide => guide.trim()).join('\n\n---\n\n'));
  }
  else if (command === 'scan') {
    const { opts, positional } = parse(['out']);
    if (positional.length !== 1) throw new Error('Provide exactly one repository path');
    const inventory = await scanRepository(positional[0]);
    await write(opts.out || '.readit/inventory.json', JSON.stringify(inventory, null, 2));
    console.log(`${inventory.files.length} source files indexed. Ask your agent to inspect them and generate readit.json.`);
  } else if (['build', 'serve', 'validate', 'demo'].includes(command)) {
    const { opts, positional } = parse(command === 'demo' ? ['port'] : command === 'build' ? ['out', 'root'] : command === 'serve' ? ['root', 'port'] : ['root']);
    if (positional.length !== (command === 'demo' ? 0 : 1)) throw new Error(command === 'demo' ? 'Demo takes no model path' : 'Provide exactly one model path');
    let model = await readModel(command === 'demo' ? path.join(root, 'examples/shop/readit.json') : positional[0]);
    const sourceRoot = command === 'demo' ? root : opts.root;
    if (sourceRoot && ['build', 'validate'].includes(command)) {
      const hydrated = await hydrateEvidence(model, sourceRoot);
      if (hydrated.problems.length) throw new Error(hydrated.problems.join('\n'));
      model = hydrated.model;
    }
    if (command === 'validate') console.log(`Valid model: ${model.useCases.length} use cases, ${model.evidence.length} evidence references${sourceRoot ? '; source hashes and snippets verified' : '; source not checked'}.`);
    else if (command === 'build') await write(opts.out || 'dist/readit.html', await buildHtml(model));
    else {
      const port = opts.port === undefined ? 4173 : Number(opts.port);
      if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer from 0 to 65535');
      const server = await startServer({ model, root: sourceRoot, port });
      console.log(`READIT is ready: http://127.0.0.1:${server.address().port}`);
      console.log('Press Ctrl+C to stop. Source files are never modified.');
      for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
    }
  } else if (command === 'install-skill') {
    const { opts, positional } = parse(['to']);
    if (positional.length) throw new Error('Use --to to choose the skills directory');
    const usesDefault = !opts.to;
    const destination = path.join(path.resolve(opts.to || path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills')), 'readit');
    try { await fs.access(destination); throw new Error(`Skill already exists at ${destination}; remove or move it deliberately before reinstalling.`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await fs.cp(path.join(root, 'skills/readit'), destination, { recursive: true });
    const destinationKind = usesDefault ? 'the legacy default Codex destination' : 'the selected compatibility destination';
    console.log(`Installed READIT skill at ${destination} (${destinationKind}).`);
    console.log('For portable agent installation, use: npx skills add MansourFall/readit --skill readit');
  } else throw new Error(`Unknown command: ${command}. Run readit --help.`);
} catch (error) { console.error(`READIT: ${error.message}`); process.exitCode = 1; }
