import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateModel } from './model.js';
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function buildHtml(model) {
  const validation = validateModel(model);
  if (!validation.valid) throw new Error(validation.errors.join('\n'));
  const [template, css, validator, diagrams, app] = await Promise.all([
    fs.readFile(path.join(packageRoot, 'web/index.html'), 'utf8'),
    fs.readFile(path.join(packageRoot, 'web/style.css'), 'utf8'),
    fs.readFile(path.join(packageRoot, 'src/model.js'), 'utf8'),
    fs.readFile(path.join(packageRoot, 'src/diagrams.js'), 'utf8'),
    fs.readFile(path.join(packageRoot, 'web/app.js'), 'utf8')
  ]);
  const code = [validator, diagrams, app].join('\n').replace(/^export /gm, '').replace(/<\/script/gi, '<\\/script');
  const json = JSON.stringify(model).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return template.replace('/* READIT_CSS */', () => css).replace('READIT_DATA', () => json).replace('// READIT_APP', () => code);
}
