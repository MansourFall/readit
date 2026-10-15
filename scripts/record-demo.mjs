// Capture actual demo interactions, then compose camera moves for a looping GIF.
// Marketing tooling only: no application UI or model mutations.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { buildHtml } from '../src/build.js';
import { hydrateEvidence } from '../src/repository.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(process.env.READIT_GIF_OUTPUT || path.join(root, 'docs/assets/readit-demo.gif'));
const width = 1280, height = 800;
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'readit-recording-'));
let browser;
const frames = [], errors = [];
const exists = async filename => fs.access(filename).then(() => true, () => false);
try {
  if (process.platform !== 'darwin') throw new Error('The GIF encoder currently requires macOS and Swift (Xcode Command Line Tools).');
  const swift = spawnSync('xcrun', ['--find', 'swift'], { encoding: 'utf8' });
  if (swift.status !== 0) throw new Error('Install Xcode Command Line Tools with xcode-select --install, then rerun.');
  let executablePath = process.env.READIT_CHROMIUM_EXECUTABLE;
  if (!executablePath && !await exists(chromium.executablePath())) {
    const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (await exists(chrome)) executablePath = chrome;
    else throw new Error('Run npx playwright install chromium or set READIT_CHROMIUM_EXECUTABLE.');
  }
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'light' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const fixture = JSON.parse(await fs.readFile(path.join(root, 'examples/shop/readit.json'), 'utf8'));
  const hydrated = await hydrateEvidence(fixture, root);
  assert.deepEqual(hydrated.problems, []);
  const html = path.join(temporary, 'demo.html');
  await fs.writeFile(html, await buildHtml(hydrated.model));
  await page.goto(pathToFileURL(html).href);
  await page.locator('.case-item').first().waitFor();
  await page.addStyleTag({ content: '.scene-enter { animation: none !important; } * { scroll-behavior: auto !important; }' });
  const render = await context.newPage();
  await render.setViewportSize({ width, height });
  await render.setContent(`<body style="margin:0;background:#101d25"><canvas width="${width}" height="${height}"></canvas></body>`);

  const box = selector => page.locator(selector).evaluate(el => {
    const r = el.getBoundingClientRect();
    return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
  });
  const fit = r => ({ x: r.x + r.width / 2, y: r.y + r.height / 2, scale: Math.min(1216 / (r.width + 36), 654 / (r.height + 36), 1.45) });
  const center = r => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
  async function snapshot() {
    await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('svg').forEach(el => el.pauseAnimations?.()); });
    const buffer = await page.screenshot({ fullPage: true });
    await render.evaluate(async data => {
      window.shot = new Image();
      window.shot.src = data;
      await window.shot.decode();
    }, `data:image/png;base64,${buffer.toString('base64')}`);
  }
  let camera, caption = 'Start with the whole application', cursor;
  async function frame(delay, click = false) {
    await render.evaluate(({ camera: c, caption, cursor, click, width, height }) => {
      const ctx = document.querySelector('canvas').getContext('2d');
      ctx.fillStyle = '#101d25'; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#c4ef99'; ctx.font = '700 16px system-ui'; ctx.fillText('READIT  /  FOLLOW THE STORY', 32, 34);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 26px system-ui'; ctx.fillText(caption, 32, 73);
      ctx.save(); ctx.beginPath(); ctx.roundRect(32, 98, 1216, 654, 12); ctx.clip();
      ctx.fillStyle = '#f5f6f2'; ctx.fillRect(32, 98, 1216, 654);
      const left = 640 - c.x * c.scale, top = 425 - c.y * c.scale;
      ctx.drawImage(window.shot, left, top, window.shot.width * c.scale, window.shot.height * c.scale);
      if (cursor) {
        const x = left + cursor.x * c.scale, y = top + cursor.y * c.scale;
        if (click) {
          ctx.fillStyle = '#b2dd7999'; ctx.beginPath(); ctx.arc(x, y, 21, 0, Math.PI * 2); ctx.fill();
        }
        ctx.save(); ctx.translate(x, y); ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, 23); ctx.lineTo(6, 17); ctx.lineTo(12, 28); ctx.lineTo(17, 25); ctx.lineTo(11, 15); ctx.lineTo(20, 14); ctx.closePath();
        ctx.fillStyle = '#15242c'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.restore();
      ctx.fillStyle = '#a8b4bc'; ctx.font = '12px system-ui';
      ctx.fillText('LITTLE SHOP DEMO · STATIC SOURCE ANALYSIS', 32, 781);
      ctx.textAlign = 'right'; ctx.fillText('github.com/MansourFall/readit', 1248, 781); ctx.textAlign = 'left';
    }, { camera, caption, cursor, click, width, height });
    const filename = path.join(temporary, `frame-${String(frames.length).padStart(4, '0')}.png`);
    await render.screenshot({ path: filename });
    frames.push({ path: filename, delay });
  }
  async function move(nextCamera, nextCursor, seconds = 0.8) {
    const previous = { ...camera }, pointer = cursor || nextCursor;
    const count = Math.round(seconds * 15);
    for (let i = 1; i <= count; i++) {
      const t = i / count, ease = t * t * (3 - 2 * t);
      camera = Object.fromEntries(['x', 'y', 'scale'].map(k => [k, previous[k] + (nextCamera[k] - previous[k]) * ease]));
      cursor = nextCursor && { x: pointer.x + (nextCursor.x - pointer.x) * ease, y: pointer.y + (nextCursor.y - pointer.y) * ease };
      await frame(1 / 15);
    }
  }

  console.log('Capturing overview and use-case navigation…');
  camera = fit(await box('body'));
  const overview = { ...camera };
  await snapshot(); await frame(2);
  const tab = center(await box('#tab-map'));
  caption = 'Find the user goals in the use-case map';
  await move({ x: 850, y: tab.y + 100, scale: 1 }, tab);
  await frame(0.25, true);
  await page.locator('#tab-map').click();
  await snapshot();
  const mapCamera = fit(await box('#map-view'));
  await move(mapCamera, center(await box('[data-case="place-order"] ellipse')));
  await frame(1.5);
  caption = 'Choose “Place an order”';
  await frame(0.35, true);
  await page.locator('[data-case="place-order"]').click();
  assert.equal(await page.locator('#case-detail h2').textContent(), 'Place an order');
  await snapshot();
  cursor = undefined;
  camera = fit(await box('#case-detail'));
  await frame(1.8);
  caption = 'Follow the implementation, one message at a time';
  const flowCamera = fit(await box('#flow-area'));
  await move(flowCamera, undefined, 1);
  const scenario = fixture.useCases.find(u => u.id === 'place-order').scenarios[0];
  assert.equal(await page.locator('#sequence [data-step]').count(), scenario.steps.length);
  console.log(`Capturing all ${scenario.steps.length} sequence messages…`);
  for (let i = 0; i < scenario.steps.length; i++) {
    if (i) {
      cursor = center(await box('#next'));
      await frame(0.15, true);
      await page.locator('#next').click();
    }
    assert.equal(await page.locator('#step-counter').textContent(), `${i + 1} OF ${scenario.steps.length} MESSAGES`);
    assert.equal(await page.locator('#step-detail h3').textContent(), scenario.steps[i].label);
    caption = `${String(i + 1).padStart(2, '0')} / ${String(scenario.steps.length).padStart(2, '0')}  ${scenario.steps[i].label}`;
    cursor = undefined;
    // Capture the real SVG packet at successive animation times for each step.
    for (let n = 0; n < 6; n++) {
      await page.locator('#sequence svg').evaluate((svg, time) => { svg.pauseAnimations(); svg.setCurrentTime(time); }, n * 0.15);
      await snapshot(); await frame(0.22);
    }
  }
  caption = 'From a user goal to an evidence-backed flow';
  await frame(2.2);
  await page.locator('#reset').click();
  await page.locator('[data-select]').first().click();
  await snapshot();
  caption = 'Beyond the README. Follow the story.';
  await move(overview, undefined, 1.2); await frame(2);
  assert.deepEqual(errors, []);

  await fs.mkdir(path.dirname(output), { recursive: true });
  const manifest = path.join(temporary, 'frames.json');
  await fs.writeFile(manifest, JSON.stringify(frames));
  console.log('Encoding the looping GIF…');
  const candidate = path.join(temporary, 'readit-demo.gif');
  const encoded = spawnSync(swift.stdout.trim(), ['-module-cache-path', path.join(temporary, 'swift-cache'), path.join(root, 'scripts/encode-demo.swift'), manifest, candidate], { stdio: 'inherit' });
  if (encoded.status !== 0) throw new Error('GIF encoding failed; check the Swift output above.');
  await fs.copyFile(candidate, output);
  await fs.copyFile(frames[0].path, output.replace(/\.gif$/i, '') + '-poster.png');
  const size = (await fs.stat(output)).size;
  console.log(`Ready: ${output}\n${width}×${height}, ${frames.reduce((n, f) => n + f.delay, 0).toFixed(1)} seconds, ${(size / 1024 / 1024).toFixed(1)} MiB`);
} finally {
  await browser?.close();
  await fs.rm(temporary, { recursive: true, force: true });
}
