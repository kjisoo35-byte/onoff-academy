const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 4174);
const clients = new Set();
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const reloadClient = `<script>new EventSource('/__academy_reload').onmessage=()=>location.reload()</script>`;

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  if (requestPath === '/__academy_reload') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-store', Connection: 'keep-alive' });
    response.write('retry: 500\n\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(path.join(root, '404.html')));
    return;
  }
  const extension = path.extname(filePath).toLowerCase();
  let body = fs.readFileSync(filePath);
  if (extension === '.html') body = Buffer.from(body.toString('utf8').replace('</body>', `${reloadClient}</body>`));
  response.writeHead(200, { 'Content-Type': mime[extension] || 'application/octet-stream', 'Cache-Control': 'no-store, max-age=0' });
  response.end(body);
});

let reloadTimer;
fs.watch(root, { recursive: true }, (_event, filename) => {
  if (!filename || filename.includes('.git') || filename.includes('node_modules')) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    clients.forEach((client) => client.write(`data: reload:${Date.now()}\n\n`));
    console.log(`[reload] ${filename}`);
  }, 80);
});

server.listen(port, '127.0.0.1', () => console.log(`ONOFF Academy: http://127.0.0.1:${port}`));
