// Local browser E2E: real Academy handlers + in-memory SQLite D1 adapter.
// WORK is an explicitly simulated menu. No Production data or WORK source is used.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { onRequest } from '../functions/api/academy/[[path]].js';
import { beginAcademyLogin, issueAcademySession } from '../src/server/academy-auth.js';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.ACADEMY_QA_OUTPUT || path.join(root, '../work-return-qa'));
await fs.mkdir(output, { recursive: true });
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'))('playwright')); }
class Statement {
  constructor(statement) { this.statement = statement; this.values = []; }
  bind(...values) { this.values = values; return this; }
  run() { return { success: true, meta: { changes: Number(this.statement.run(...this.values).changes) } }; }
  first() { return this.statement.get(...this.values) || null; }
  all() { return { success: true, results: this.statement.all(...this.values) }; }
}
const sqlite = new DatabaseSync(':memory:');
for (const file of ['0001_learning_progress.sql', '0002_identity_links.sql']) sqlite.exec(await fs.readFile(path.join(root, 'migrations', file), 'utf8'));
const db = {
  prepare: sql => new Statement(sqlite.prepare(sql)),
  async batch(statements) {
    sqlite.exec('BEGIN');
    try { const results = statements.map(statement => statement.run()); sqlite.exec('COMMIT'); return results; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  }
};
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };
const apiRequests = [];
const serverErrors = [];
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/academy/')) {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const request = new Request(base + req.url, { method: req.method, headers: req.headers, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: Buffer.concat(chunks) } : {}) });
      const response = await onRequest({ request, env: { DB: db }, params: { path: url.pathname.slice('/api/academy/'.length).split('/') } });
      apiRequests.push({ path: url.pathname, method: req.method, status: response.status });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    res.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch (error) { serverErrors.push(error.message); res.writeHead(500); res.end('fixture_error'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const WORK = 'https://onoff-work.pages.dev/';
const browser = await chromium.launch({ headless: true, executablePath: process.env.ACADEMY_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const results = [];
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const waitSaved = page => page.waitForFunction(() => document.body.dataset.academyProgressStorage === 'server' && document.body.dataset.academyProgressSave !== 'saving');
const readProgress = page => page.evaluate(async () => (await fetch('/api/academy/progress/me')).json());
async function session(context, subject, role) {
  const login = await beginAcademyLogin(db, '/');
  const issued = await issueAcademySession(db, { provider: 'WORK', externalSubject: subject, issuer: 'onoff-work', assertionId: crypto.randomUUID(), state: login.state, expiresAt: new Date(Date.now() + 60000).toISOString(), name: 'QA ' + role, role, organization: 'ISOLATED-QA', workLine: null, shiftGroup: null }, new Request(base, { headers: { cookie: login.cookie.split(';')[0] } }));
  const [name, value] = issued.cookie.split(';')[0].split('=');
  await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: 'Lax' }, { name: 'qa_work_session', value: subject, url: WORK, httpOnly: true, secure: true, sameSite: 'Lax' }]);
}
async function inspectLink(page, label) {
  const links = page.locator('[data-work-return]');
  await links.waitFor({ state: 'visible' });
  check(await links.count() === 1, label + ': single return link');
  check(await links.isVisible(), label + ': visible');
  check(await links.getAttribute('href') === WORK, label + ': explicit URL');
  const box = await links.boundingBox();
  const viewport = page.viewportSize();
  check(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height, label + ': within viewport');
  check(box.height >= 40, label + ': touch target');
  check(await links.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), label + ': unobstructed');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ': no horizontal overflow');
}
try {
  for (const role of ['learner', 'administrator']) for (const width of [1440, 390, 320, 717]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await session(context, `${role}-${width}`, role);
    await context.route(WORK, route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Simulated WORK menu</title><p>격리 QA WORK 메뉴</p><a href="${base}/index.html">Academy</a></html>` }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base);
    await waitSaved(page);
    await inspectLink(page, `${role}/${width}/home`);
    for (const route of ['sop-course', 'sop-purpose', 'philosophy', 'workflow', 'daily-work', 'safety-report', 'risk-course', 'risk-assessment-purpose', 'tbm-nine-steps', 'special-robot-work', 'home']) {
      await page.evaluate(route => { location.hash = route; }, route);
      await page.waitForFunction(route => document.body.dataset.academyView === route, route);
      await waitSaved(page);
      await inspectLink(page, `${role}/${width}/${route}`);
    }
    await page.screenshot({ path: path.join(output, `${role}-${width}-home.png`) });
    await page.locator('.figma-home-course[data-progress-course="sop"]').click();
    await page.waitForFunction(() => document.body.dataset.academyView === 'sop-course');
    await page.locator('[data-progress-course="sop"] [data-course-continue]:visible').first().click();
    await page.waitForFunction(() => document.body.dataset.academyView === 'sop-purpose');
    await waitSaved(page);
    if (width < 800) {
      await page.evaluate(() => { location.hash = 'sop-purpose-version'; });
      await page.waitForFunction(() => document.body.dataset.academyView === 'sop-purpose-version');
      await waitSaved(page);
    }
    const complete = page.locator(width >= 800 ? '[data-complete-on-navigation="sop-purpose"]:visible' : '[data-learning-complete="sop-purpose"]:visible').first();
    await complete.click();
    await page.evaluate(() => { location.hash = 'sop-reading'; });
    await page.waitForFunction(() => document.body.dataset.academyView === 'sop-reading');
    await page.waitForFunction(() => document.body.dataset.academyProgressSave === 'saved');
    const before = await readProgress(page);
    check(before.courses.sop.lessons['sop-purpose'].state === 'COMPLETED', 'completion stored in server');
    const sessionsBefore = await context.cookies();
    await page.screenshot({ path: path.join(output, `${role}-${width}-lesson.png`) });
    if (width === 320) {
      await page.locator('[data-work-return]').focus();
      await page.keyboard.press('Enter');
    } else await page.locator('[data-work-return]').click();
    await page.waitForURL(WORK);
    check(!apiRequests.some(request => request.path.endsWith('/logout')), 'return does not log out');
    const sessionsAfter = await context.cookies();
    for (const name of ['onoff_academy_session', 'qa_work_session']) check(sessionsBefore.find(cookie => cookie.name === name)?.value === sessionsAfter.find(cookie => cookie.name === name)?.value, name + ' preserved');
    await page.getByRole('link', { name: 'Academy', exact: true }).click();
    await waitSaved(page);
    // Prove that restoration is from the server, with client progress removed.
    await page.evaluate(() => { localStorage.removeItem('onoff-academy-progress-v1'); localStorage.removeItem('onoff-academy-progress-owner-v1'); });
    await page.reload(); await waitSaved(page);
    await page.locator('.figma-home-course[data-progress-course="sop"]').click();
    await page.waitForFunction(() => document.body.dataset.academyView === 'sop-course');
    const resume = page.locator('[data-progress-course="sop"] [data-course-continue]:visible').first();
    check((await resume.getAttribute('href')).includes(before.courses.sop.lastLessonId), 'resume points to last server lesson');
    await resume.click(); await waitSaved(page);
    const restored = await readProgress(page);
    check(restored.courses.sop.lastLessonId === before.courses.sop.lastLessonId, 'last Lesson restored');
    check(restored.courses.sop.lessons['sop-purpose'].state === 'COMPLETED', 'completed Lesson preserved');
    check(restored.courses.sop.progressPercent === before.courses.sop.progressPercent, 'progress preserved');
    check(restored.courses.sop.officiallyCompleted === before.courses.sop.officiallyCompleted, 'completion policy unchanged');
    check(errors.length === 0, `${role}/${width}: browser errors ${JSON.stringify(errors)}`);
    results.push({ role, width, status: 'PASS', serverRestoration: true, consoleAndNetworkErrors: errors });
    console.log(JSON.stringify({ role, width, status: 'PASS' }));
    await context.close();
  }
  // Saving in flight and failed saves must never allow an early navigation.
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  await session(context, 'save-guard', 'learner');
  await context.route(WORK, route => route.fulfill({ contentType: 'text/html', body: '<title>WORK QA</title>WORK QA' }));
  const page = await context.newPage(); await page.goto(base); await waitSaved(page);
  let release;
  const held = new Promise(resolve => { release = resolve; });
  let intercepted = 0;
  await page.route('**/api/academy/progress/events', async route => { intercepted++; await held; await route.continue(); });
  await page.evaluate(() => { location.hash = 'sop-reading'; });
  await page.waitForFunction(() => document.body.dataset.academyProgressSave === 'saving');
  await page.locator('[data-work-return]').click();
  await page.waitForTimeout(250);
  check(page.url().startsWith(base) && intercepted > 0, 'waits for in-flight save');
  check(await page.locator('[data-work-return]').getAttribute('aria-disabled') === 'true', 'double click prevented');
  release(); await page.waitForURL(WORK);
  await page.goto(base); await waitSaved(page);
  await page.unroute('**/api/academy/progress/events');
  await page.route('**/api/academy/progress/events', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"injected_save_failure"}' }));
  await page.evaluate(() => { location.hash = 'sop-structure'; });
  await page.waitForFunction(() => document.body.dataset.academyProgressSave === 'failed');
  await page.locator('[data-work-return]').click();
  await page.waitForFunction(() => document.querySelector('.work-return-status').textContent.includes('확인하지 못했습니다'));
  check(page.url().startsWith(base), 'failed save blocks leaving');
  check(await page.locator('.work-return-status').evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), 'save failure feedback is unobstructed');
  await page.screenshot({ path: path.join(output, 'save-failure-390.png') });
  await page.unroute('**/api/academy/progress/events');
  await page.locator('[data-work-return]').click(); await page.waitForURL(WORK);
  await page.goto(base); await waitSaved(page);
  const recovered = await readProgress(page);
  check(recovered.courses.sop.lastLessonId === 'sop-structure', 'retry stores last Lesson before leaving');
  check(recovered.courses.sop.lessons['sop-structure'].state === 'IN_PROGRESS', 'retry preserves entered Lesson');
  results.push({ scenario: 'delayed-save + failure + retry', status: 'PASS' });
  await context.close();
  // Correct Practice answer, response lost after server commit, idempotent retry.
  const practiceContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await session(practiceContext, 'practice-retry', 'learner');
  await practiceContext.route(WORK, route => route.fulfill({ contentType: 'text/html', body: '<title>WORK QA</title>WORK QA' }));
  const practicePage = await practiceContext.newPage();
  await practicePage.goto(base); await waitSaved(practicePage);
  for (const width of [320, 717, 1440, 390, 1440]) {
    await practicePage.setViewportSize({ width, height: 900 });
    await inspectLink(practicePage, `resize/home/${width}`);
  }
  await practicePage.evaluate(() => { location.hash = 'sop-reading'; });
  await practicePage.waitForFunction(() => document.body.dataset.academyView === 'sop-reading');
  await waitSaved(practicePage);
  await practicePage.route('**/api/academy/progress/events', async route => {
    if (route.request().postDataJSON().type !== 'practice.result') { await route.continue(); return; }
    const response = await route.fetch();
    check(response.status() === 200, 'Practice committed before response loss');
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"injected_response_loss"}' });
  });
  const practice = practicePage.locator('.sop-ready-l02 .ready-practice');
  await practice.locator('[data-ready-choice="B"]').click();
  await practice.locator('[data-ready-check]').click();
  await practicePage.waitForFunction(() => document.body.dataset.academyProgressSave === 'failed');
  check((await practice.locator('aside strong').textContent()) === 'Correct', 'Practice UI works');
  await practicePage.unroute('**/api/academy/progress/events');
  await practicePage.evaluate(() => { window.scrollTo(0, 0); document.querySelector('.document').scrollTop = 0; });
  await practicePage.locator('[data-work-return]').click(); await practicePage.waitForURL(WORK);
  await practicePage.goto(base); await waitSaved(practicePage);
  const practiceRecord = (await readProgress(practicePage)).courses.sop.practices['sop-reading:practice'];
  check(practiceRecord.passed === true && practiceRecord.attempts === 1, 'Practice result preserved without duplicate attempts');
  results.push({ scenario: 'viewport resize + Practice UI + committed response loss + idempotent retry', status: 'PASS' });
  await practiceContext.close();
  check(serverErrors.length === 0, 'no local server errors: ' + JSON.stringify(serverErrors));
  const report = { status: 'PASS', checks, scope: 'Local browser + actual Academy API handlers + in-memory SQLite D1 adapter; simulated WORK menu/session; NOT real-account or Production E2E', results, apiRequests, serverErrors };
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, checks, results, output }));
} catch (error) {
  for (const context of browser.contexts()) for (const page of context.pages()) {
    console.log(await page.evaluate(() => ({
      route: location.hash,
      parent: document.querySelector('.work-return-control')?.parentElement.outerHTML.slice(0, 1200),
      headers: [...document.querySelectorAll('.desktop-academy-global-header,.figma-home-header,.figma-course-global-header,.site-header')].map(el => ({ class: el.className, rects: el.getClientRects().length, display: getComputedStyle(el).display, hidden: el.hidden }))
    })));
  }
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, results, checks, apiRequests, serverErrors }, null, 2));
  for (const context of browser.contexts()) for (const page of context.pages()) await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); sqlite.close(); }
