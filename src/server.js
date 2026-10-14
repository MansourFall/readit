import http from 'node:http';
import { buildHtml } from './build.js';
import { readSource } from './repository.js';

export async function startServer({ model, root, port = 4173 }) {
  const html = await buildHtml(model);
  const server = http.createServer(async (req, res) => {
    const host = req.headers.host;
    if (!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) { res.writeHead(403); res.end('Local requests only'); return; }
    if (req.headers.origin && ![`http://${host}`].includes(req.headers.origin)) { res.writeHead(403); res.end('Origin rejected'); return; }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.method !== 'GET') { res.writeHead(405); res.end('GET only'); return; }
    try {
      const url = new URL(req.url, `http://${host}`);
      if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); return; }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (url.pathname === '/api/info') { res.end(JSON.stringify({ sourceAvailable: Boolean(root) })); return; }
      if (url.pathname === '/api/source') {
        if (!root) throw new Error('No repository root configured');
        const ref = model.evidence.find(e => e.id === url.searchParams.get('id'));
        if (!ref) { res.writeHead(404); res.end(JSON.stringify({ error: 'Unknown evidence reference' })); return; }
        res.end(JSON.stringify(await readSource(root, ref))); return;
      }
      res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' }));
    } catch {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Cannot read referenced source. Check the path, range, size, and repository root.' }));
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}
