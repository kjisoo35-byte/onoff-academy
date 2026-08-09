const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 4174);
const clients = new Set();
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const reloadClient = `<script>new EventSource('/__academy_reload').onmessage=()=>location.reload()</script>`;

const previewShell = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>ONOFF Academy Preview</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, Pretendard, "Noto Sans KR", "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #0a1220; }
    button, select { font: inherit; }
    .preview-app { height: 100dvh; display: grid; grid-template-rows: auto minmax(0, 1fr); }
    .preview-toolbar { z-index: 10; min-height: 58px; display: flex; align-items: center; gap: 18px; padding: 9px 16px; color: #dce7f5; background: rgba(10, 23, 41, .98); border-bottom: 1px solid #26364b; box-shadow: 0 8px 28px rgba(0,0,0,.24); }
    .preview-brand { min-width: max-content; display: grid; line-height: 1.1; }
    .preview-brand strong { color: #fff; font-size: 14px; letter-spacing: -.01em; }
    .preview-brand small { margin-top: 4px; color: #7f93ac; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
    .preview-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; }
    .preview-control { min-height: 36px; padding: 0 12px; color: #aec0d6; background: #111e30; border: 1px solid #2b3b50; border-radius: 8px; cursor: pointer; transition: color .16s ease, background .16s ease, border-color .16s ease; }
    .preview-control:hover { color: #fff; border-color: #526985; }
    .preview-control[aria-pressed="true"] { color: #fff; background: #1769c2; border-color: #3889df; box-shadow: 0 0 0 2px rgba(56,137,223,.18); }
    .preview-separator { width: 1px; height: 28px; background: #2a394d; }
    .preview-meta { margin-left: auto; color: #8fa3bb; font-size: 12px; white-space: nowrap; }
    .preview-stage { min-height: 0; overflow: auto; display: grid; place-items: start center; padding: 34px; background-color: #101b2a; background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size: 24px 24px; }
    .preview-scaler { position: relative; width: var(--frame-width); height: var(--frame-height); transform: scale(var(--preview-zoom)); transform-origin: top center; margin-bottom: calc((var(--frame-height) * (var(--preview-zoom) - 1)) + 34px); }
    .device-frame { position: relative; width: 100%; height: 100%; overflow: hidden; background: #fff; box-shadow: 0 28px 80px rgba(0,0,0,.42); }
    .device-frame.is-mobile { padding: 9px; background: #121923; border: 1px solid #536175; border-radius: 34px; }
    .device-frame.is-mobile::before { content: ""; position: absolute; z-index: 3; top: 15px; left: 50%; width: 52px; height: 5px; transform: translateX(-50%); border-radius: 999px; background: rgba(255,255,255,.18); pointer-events: none; }
    .device-frame iframe { width: 100%; height: 100%; display: block; border: 0; background: #fff; }
    .device-frame.is-mobile iframe { width: var(--screen-width); height: var(--screen-height); border-radius: 26px; }
    .safe-area { position: absolute; z-index: 2; left: 9px; right: 9px; pointer-events: none; opacity: 0; transition: opacity .16s ease; }
    .safe-area.top { top: 9px; height: var(--safe-top); border-radius: 26px 26px 0 0; background: linear-gradient(rgba(27,112,199,.16), transparent); border-top: 1px dashed rgba(49,149,244,.65); }
    .safe-area.bottom { bottom: 9px; height: var(--safe-bottom); border-radius: 0 0 26px 26px; background: linear-gradient(transparent, rgba(27,112,199,.16)); border-bottom: 1px dashed rgba(49,149,244,.65); }
    .device-frame.show-safe-area .safe-area { opacity: 1; }
    @media (max-width: 860px) {
      .preview-toolbar { align-items: flex-start; gap: 10px; padding: 9px 10px; overflow-x: auto; }
      .preview-brand, .preview-meta { display: none; }
      .preview-controls { flex-wrap: nowrap; }
      .preview-control { min-height: 40px; }
      .preview-stage { padding: 20px 12px; }
    }
  </style>
</head>
<body>
  <div class="preview-app">
    <header class="preview-toolbar" aria-label="Academy Preview Toolbar">
      <div class="preview-brand"><strong>ONOFF Academy Preview</strong><small>Development only</small></div>
      <div class="preview-controls" role="group" aria-label="Device preview">
        <button class="preview-control" type="button" data-device="desktop">Desktop</button>
        <button class="preview-control" type="button" data-device="laptop">Laptop</button>
        <button class="preview-control" type="button" data-device="foldOpen">Fold Open</button>
        <button class="preview-control" type="button" data-device="foldClosed">Fold Closed</button>
        <button class="preview-control" type="button" data-device="ultra">Galaxy</button>
        <button class="preview-control" type="button" data-device="iphone">iPhone</button>
        <button class="preview-control" type="button" data-device="responsive">Responsive</button>
      </div>
      <span class="preview-separator" aria-hidden="true"></span>
      <div class="preview-controls" role="group" aria-label="Zoom preview">
        <button class="preview-control" type="button" data-zoom="0.75">75%</button>
        <button class="preview-control" type="button" data-zoom="1">100%</button>
        <button class="preview-control" type="button" data-zoom="1.25">125%</button>
      </div>
      <button class="preview-control" type="button" data-safe-area>Safe Area</button>
      <output class="preview-meta" aria-live="polite"></output>
    </header>
    <main class="preview-stage">
      <div class="preview-scaler">
        <div class="device-frame">
          <iframe title="Academy document preview"></iframe>
          <span class="safe-area top" aria-hidden="true"></span>
          <span class="safe-area bottom" aria-hidden="true"></span>
        </div>
      </div>
    </main>
  </div>
  <script>
    (() => {
      const devices = {
        desktop: { label: 'Desktop', width: 1920, height: 1080, mobile: false },
        laptop: { label: 'Laptop', width: 1440, height: 900, mobile: false },
        foldOpen: { label: 'Galaxy Z Fold7 Open', width: 750, height: 832, mobile: true, safeTop: 24, safeBottom: 24 },
        foldClosed: { label: 'Galaxy Z Fold7 Closed', width: 412, height: 1019, mobile: true, safeTop: 24, safeBottom: 28 },
        ultra: { label: 'Galaxy S Ultra', width: 412, height: 915, mobile: true, safeTop: 24, safeBottom: 24 },
        iphone: { label: 'iPhone', width: 393, height: 852, mobile: true, safeTop: 47, safeBottom: 34 },
        responsive: { label: 'Responsive', width: 1024, height: 900, mobile: false }
      };
      const params = new URLSearchParams(location.search);
      const iframe = document.querySelector('iframe');
      const frame = document.querySelector('.device-frame');
      const scaler = document.querySelector('.preview-scaler');
      const stage = document.querySelector('.preview-stage');
      const meta = document.querySelector('.preview-meta');
      let device = localStorage.getItem('academy-preview-device') || 'desktop';
      if (!devices[device]) device = 'desktop';
      let zoom = Number(localStorage.getItem('academy-preview-zoom') || .75);
      let safeArea = localStorage.getItem('academy-preview-safe-area') === 'true';
      iframe.src = params.get('path') || '/index.html';
      const render = () => {
        const preset = devices[device] || devices.desktop;
        const responsiveWidth = Math.max(320, stage.clientWidth - 68);
        const width = device === 'responsive' ? responsiveWidth : preset.width;
        const frameInset = preset.mobile ? 20 : 0;
        scaler.style.setProperty('--screen-width', width + 'px');
        scaler.style.setProperty('--screen-height', preset.height + 'px');
        scaler.style.setProperty('--frame-width', (width + frameInset) + 'px');
        scaler.style.setProperty('--frame-height', (preset.height + frameInset) + 'px');
        scaler.style.setProperty('--preview-zoom', String(zoom));
        scaler.style.setProperty('--safe-top', (preset.safeTop || 0) + 'px');
        scaler.style.setProperty('--safe-bottom', (preset.safeBottom || 0) + 'px');
        frame.classList.toggle('is-mobile', preset.mobile);
        frame.classList.toggle('show-safe-area', preset.mobile && safeArea);
        document.querySelectorAll('[data-device]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.device === device)));
        document.querySelectorAll('[data-zoom]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.zoom) === zoom)));
        document.querySelector('[data-safe-area]').setAttribute('aria-pressed', String(preset.mobile && safeArea));
        meta.textContent = preset.label + ' · ' + Math.round(width) + ' × ' + preset.height + ' · ' + Math.round(zoom * 100) + '%';
      };
      document.querySelectorAll('[data-device]').forEach((button) => button.addEventListener('click', () => { device = button.dataset.device; localStorage.setItem('academy-preview-device', device); render(); }));
      document.querySelectorAll('[data-zoom]').forEach((button) => button.addEventListener('click', () => { zoom = Number(button.dataset.zoom); localStorage.setItem('academy-preview-zoom', String(zoom)); render(); }));
      document.querySelector('[data-safe-area]').addEventListener('click', () => { safeArea = !safeArea; localStorage.setItem('academy-preview-safe-area', String(safeArea)); render(); });
      new ResizeObserver(() => { if (device === 'responsive') render(); }).observe(stage);
      render();
      new EventSource('/__academy_reload').onmessage = () => { iframe.contentWindow.location.reload(); };
    })();
  </script>
</body>
</html>`;

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  if (requestPath === '/__academy_reload') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-store', Connection: 'keep-alive' });
    response.write('retry: 500\n\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }
  if (requestPath === '/__preview') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, max-age=0' });
    response.end(previewShell);
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
