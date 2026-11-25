import assert from 'node:assert/strict';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { onRequest } from '../functions/api/academy/[[path]].js';
import { signTestAssertion } from '../src/server/work-auth.js';
import { TestD1 } from '../test/fixtures/d1.mjs';
import { verifyInteractionLayout } from './interaction-layout-qa.mjs';

const root = path.resolve(import.meta.dirname, '..');
const assetRoot = path.resolve(process.env.ACADEMY_SENSOR_ASSET_ROOT || root);
const output = path.resolve(process.env.ACADEMY_QA_OUTPUT || path.join(root, '.academy-data', 'sensor-qa'));
await fs.mkdir(output, { recursive: true });
const id = 'sensor-npn';
const { COURSE_CATALOG } = createRequire(import.meta.url)('../lib/learning-progress.js');
const { practiceId } = createRequire(import.meta.url)('../lib/sensor-assessment.js');
const lessons = COURSE_CATALOG[id];
const WORK = 'https://onoff-work.pages.dev/';
const secret = 'isolated-sensor-assertion-key';
const db = new TestD1();
const states = [];
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json'
};
const prefix = '/api/academy/';
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, base);
    if (url.pathname === '/__sensor_work') {
      const subject = req.headers.cookie?.match(/(?:^|; )fixture_actor=(sensor-[a-z0-9-]+)/)?.[1];
      const state = url.searchParams.get('state');
      if (!subject || !state) { res.writeHead(400).end(); return; }
      const now = Math.floor(Date.now() / 1000);
      const assertion = await signTestAssertion({
        iss: 'onoff-work', aud: 'onoff-academy', sub: subject, jti: crypto.randomUUID(),
        iat: now, exp: now + 60, state, session_binding: 'isolated-work-session',
        role: subject === 'sensor-admin' ? 'ADMIN' : 'WORKER', name: subject, organization: 'isolated-sensor'
      }, secret);
      res.writeHead(200, { 'content-type':'text/html' }).end(
        `<form method="post" action="${prefix}auth/exchange"><input type="hidden" name="assertion" value="${assertion}"></form><script>document.forms[0].submit()</script>`);
      return;
    }
    if (url.pathname.startsWith(prefix)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const request = new Request(url, {
        method: req.method, headers: req.headers,
        ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: Buffer.concat(chunks) } : {})
      });
      const response = await onRequest({
        request, env: { DB: db, WORK_ACADEMY_ASSERTION_SECRET: secret, WORK_ACADEMY_LOGIN_URL: base + '/__sensor_work' },
        params: { path: url.pathname.slice(prefix.length).split('/') }
      });
      const headers = Object.fromEntries(response.headers);
      if (response.headers.has('set-cookie')) headers['set-cookie'] = response.headers.getSetCookie();
      res.writeHead(response.status, headers).end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const file = path.resolve(assetRoot, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(assetRoot + path.sep) || !mime[path.extname(file)]) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': mime[path.extname(file)] }).end(await fs.readFile(file));
  } catch (error) {
    states.push({ serverError: error.message });
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = 'http://127.0.0.1:' + server.address().port;
const login = base + prefix + 'auth/start?return_to=/index.html%23home';
const readApi = (context, endpoint) => context.pages()[0].evaluate(async endpoint => {
  const response = await fetch('/api/academy/' + endpoint);
  return { status: response.status, data: await response.json() };
}, endpoint);
const progress = async context => {
  const response = await readApi(context, 'progress/me');
  assert.equal(response.status, 200, JSON.stringify(response.data));
  return response.data;
};
const ready = page => page.waitForFunction(() => window.onoffAcademyProgressQA?.inspect().serverReady);
const view = (page, route) => page.waitForFunction(route => document.body.dataset.academyView === route, route);
const saved = page => page.waitForFunction(() => document.body.dataset.academyProgressSave === 'saved');
let browser;

async function session(width, subject, height = 900) {
  const context = await browser.newContext({
    viewport: { width, height }, isMobile: width < 800, hasTouch: width < 800, serviceWorkers: 'block'
  });
  context.setDefaultTimeout(10000);
  await context.addCookies([{ name: 'fixture_actor', value: subject, url: base }]);
  await context.route('**/*', route => {
    const url = route.request().url();
    if (url === WORK) return route.fulfill({
      contentType: 'text/html; charset=utf-8', body: `<!doctype html><title>격리 WORK</title><a href="${login}">Academy 열기</a>`
    });
    return url.startsWith(base + '/') ? route.continue() : route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  await page.goto(login);
  await page.waitForURL(base + '/index.html#home');
  await ready(page);
  return { context, page };
}

async function lessonCheck(page, id) {
  await page.locator(`#${id}.unified-chapter .sensor-workspace #drawing svg:visible`).waitFor();
  await saved(page);
  assert.equal(await page.locator('.unified-mast:visible').count(), 1);
  assert.equal(await page.locator('.unified-foot:visible').count(), 1);
  assert.equal(await page.locator('.sensor-workspace').count(), 1);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}

const clickControl = (page, action, value) => page.locator(`.sensor-workspace button[data-action="${action}"][data-value="${value}"]:visible`).click();
async function interact(page, index) {
  const caption = page.locator('#sensor-caption');
  if (index === 0) {
    await clickControl(page, 'part', 'sensor');
    assert.match(await page.locator('#explain').innerText(), /갈색과 청색/);
  } else if (index === 1) {
    await clickControl(page, 'lamp', 'on');
    assert.match(await caption.innerText(), /전구가 켜집니다/);
    await clickControl(page, 'lamp', 'off');
    assert.match(await caption.innerText(), /전구가 꺼져/);
  } else if (index === 2) {
    await clickControl(page, 'wire', 'plc');
    assert.match(await page.locator('#explain').innerText(), /COM을 \+24V/);
  } else if (index === 3) {
    await clickControl(page, 'stage', '2');
    assert.match(await page.locator('#explain').innerText(), /NPN 출력/);
  } else if (index === 4) {
    await clickControl(page, 'guide', '3');
    await clickControl(page, 'detect', 'on');
    assert.match(await caption.innerText(), /X0를 ON/);
    await clickControl(page, 'detect', 'off');
    assert.match(await caption.innerText(), /X0는 OFF/);
  } else if (index === 5) {
    await clickControl(page, 'mode', 'schematic');
    await clickControl(page, 'mode', 'flow');
    await page.locator('#wire-details summary').click();
    await page.locator('#com-open').click();
    assert.equal(await page.locator('.sensor-details[open] [data-input-example]').count(), 3);
    await page.locator('.sensor-details[open] button').click();
  } else if (index === 7) {
    await page.locator('#review-view').click();
    assert.equal(await page.locator('#review-view').getAttribute('aria-expanded'), 'true');
    assert.match(await page.locator('#figtitle').innerText(), /전체 입력회로/);
  }
}

async function complete(page, context, lesson, count) {
  const response = page.waitForResponse(response => {
    if (!response.url().endsWith('/progress/events')) return false;
    const body = response.request().postDataJSON();
    return body?.type === 'lesson.completed' && body.lessonId === lesson;
  });
  await page.locator(`button[data-learning-complete="${lesson}"]:visible`).click();
  assert.ok((await response).ok());
  await saved(page);
  assert.equal((await progress(context)).courses[id].progressPercent, Math.round(count / lessons.length * 100));
}

async function journey(width) {
  const subject = 'sensor-worker-' + width;
  const { context, page } = await session(width, subject);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error(error.stack); });
  let active = { context, page };
  try {
    await page.locator('[data-category="electrical"]').click();
    assert.equal(await page.locator('.catalog-course').count(), 1);
    await page.locator(`[data-catalog-course="${id}"] .catalog-course-title`).click();
    await view(page, id + '-course');
    await page.locator(`a[href="#${lessons[0]}"]:visible`).first().click();
    for (const [index, lesson] of lessons.entries()) {
      const { context: ctx, page: current } = active;
      await lessonCheck(current, lesson);
      await interact(current, index);
      if (index === 4) await current.screenshot({ path: path.join(output, 'circuit-' + width + '.png') });
      await complete(current, ctx, lesson, index + 1);
      if (index === 2) {
        await current.reload();
        await ready(current);
        assert.equal((await progress(ctx)).courses[id].lastLessonId, lesson);
        await current.locator('[data-work-return]:visible').click();
        await current.waitForURL(WORK);
        await current.getByRole('link', { name: 'Academy 열기' }).click();
        await current.waitForURL(base + '/index.html#home');
        await ready(current);
        assert.equal(await current.locator('.catalog-continue a').getAttribute('href'), '#' + lesson);
        const before = await progress(ctx);
        await ctx.close();
        active = await session(width, subject);
        active.page.on('pageerror', error => errors.push(error.message));
        const reentered = await progress(active.context);
        assert.equal(reentered.user.id, before.user.id);
        assert.equal(reentered.courses[id].lastLessonId, lesson);
        assert.equal(reentered.courses[id].progressPercent, 38);
        await active.page.locator('.catalog-continue a').click();
        await lessonCheck(active.page, lesson);
      }
      if (index < lessons.length - 1) {
        await active.page.locator('.unified-foot a').last().click();
      }
    }
    const skipped = (await progress(active.context)).courses[id];
    assert.equal(skipped.progressPercent, 100);
    assert.equal(skipped.officiallyCompleted, false);
    assert.equal(skipped.practices[practiceId].attempts, 0);

    const current = active.page;
    const assessmentUrl = base + '/index.html#' + lessons[6];
    await current.goto(assessmentUrl);
    await current.getByText('판단 Practice 미응시', { exact: true }).waitFor();
    const ids = [];
    await current.route('**/api/academy/progress/events', async route => {
      const event = route.request().postDataJSON();
      if (event?.type !== 'practice.result') { await route.continue(); return; }
      ids.push(event.id);
      const response = await route.fetch();
      assert.ok(response.ok());
      if (ids.length === 1) await route.fulfill({ status: 503, json: { error: 'response_lost_after_commit' } });
      else await route.fulfill({ response });
    });
    await clickControl(current, 'answer', '0');
    await current.locator('#sensor-retry:visible').click();
    await current.getByText('오답입니다. 다시 시도하세요.', { exact: true }).waitFor();
    assert.deepEqual(ids, [ids[0], ids[0]]);
    const wrong = (await progress(active.context)).courses[id];
    assert.equal(wrong.officiallyCompleted, false);
    assert.equal(wrong.practices[practiceId].attempts, 1);
    assert.equal(wrong.practices[practiceId].score, 0);
    await current.unroute('**/api/academy/progress/events');
    await current.reload();
    await current.getByText('오답입니다. 다시 시도하세요.', { exact: true }).waitFor();
    await current.screenshot({ path: path.join(output, 'assessment-wrong-' + width + '.png') });
    await clickControl(current, 'answer', '1');
    await current.getByText('판단 Practice 통과', { exact: true }).waitFor();
    const passed = await progress(active.context);
    assert.equal(passed.courses[id].officiallyCompleted, true);
    assert.equal(passed.courses[id].practices[practiceId].attempts, 2);
    await active.context.close();
    active = await session(width, subject);
    active.page.on('pageerror', error => errors.push(error.message));
    await active.page.goto(assessmentUrl);
    await active.page.getByText('판단 Practice 통과', { exact: true }).waitFor();
    await active.page.screenshot({ path: path.join(output, 'assessment-passed-' + width + '.png') });
    const final = await progress(active.context);
    assert.equal(final.user.id, passed.user.id);
    assert.equal(final.courses[id].state, 'COMPLETED');
    assert.equal(final.courses[id].officiallyCompleted, true);
    assert.equal(final.courses[id].practices[practiceId].attempts, 2);
    assert.equal(final.courses.platform.progressPercent, 0);
    assert.equal((await readApi(active.context, 'admin/progress')).status, 403);
    assert.deepEqual(errors, []);
    states.push({ width, lessons: lessons.length, learnerId: final.user.id, progress: 100,
      skippedOfficial: skipped.officiallyCompleted, wrongOfficial: wrong.officiallyCompleted,
      wrongAttemptsAfterRetry: wrong.practices[practiceId].attempts, passedOfficial: final.courses[id].officiallyCompleted,
      passedAttemptsAfterReentry: final.courses[id].practices[practiceId].attempts });
  } catch (error) {
    await active.page.screenshot({ path: path.join(output, 'failure-' + width + '.png') }).catch(() => {});
    throw error;
  } finally {
    await active.context.close();
  }
}

async function seedAdminScenario(name, answer) {
  const { page, context } = await session(390, name);
  try {
    const events = lessons.map(lessonId => ({ id: name + ':' + lessonId, type: 'lesson.completed', courseId: id, lessonId }));
    if (answer) events.push({ id: name + ':answer', type: 'practice.result', courseId: id, practiceId, answer });
    assert.ok(await page.evaluate(async events => {
      for (const event of events) {
        const response = await fetch('/api/academy/progress/events', {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(event)
        });
        if (!response.ok) return false;
      }
      return true;
    }, events));
  } finally { await context.close(); }
}

async function runIntegrity() {
  for (const width of (process.env.ACADEMY_SENSOR_QA_WIDTHS || '390,717,1366').split(',').map(Number)) await journey(width);
  const other = await session(390, 'sensor-other');
  assert.equal((await progress(other.context)).courses[id].progressPercent, 0);
  if (states.length) {
    const attemptedRead = await readApi(other.context, 'progress/me?userId=' + states[0].learnerId);
    assert.equal(attemptedRead.status, 200);
    assert.notEqual(attemptedRead.data.user.id, states[0].learnerId);
    assert.equal(attemptedRead.data.courses[id].progressPercent, 0);
  }
  await other.context.close();
  await seedAdminScenario('sensor-pending');
  await seedAdminScenario('sensor-wrong', '0');
  const admin = await session(1366, 'sensor-admin');
  const response = await readApi(admin.context, 'admin/progress?courseId=' + id);
  assert.equal(response.status, 200);
  const { rows } = response.data;
  for (const result of states) {
    assert.ok(rows.some(row => row.userId === result.learnerId && row.courseId === id && row.progressPercent === 100
      && row.officiallyCompleted === true && row.practice?.passed === true && row.practice.attempts === 2));
  }
  assert.ok(rows.some(row => row.name === 'sensor-other' && row.progressPercent === 0));
  await admin.page.goto(base + '/index.html#administration');
  await ready(admin.page);
  const filters = admin.page.locator('[data-learning-admin-filters]');
  await filters.getByRole('combobox', { name: '과정', exact: true }).selectOption(id);
  const filtered = admin.page.waitForResponse(response => response.url().endsWith('/admin/progress?courseId=' + id));
  await filters.getByRole('button', { name: '조회' }).click();
  assert.ok((await filtered).ok());
  const table = admin.page.locator('[data-learning-admin-rows]');
  for (const result of states) {
    const row = table.getByRole('row').filter({ hasText: 'sensor-worker-' + result.width });
    await row.getByRole('cell', { name: '센서의 이해', exact: true }).waitFor();
    await row.getByRole('cell', { name: '100%', exact: true }).waitFor();
    await row.getByRole('cell', { name: '이수', exact: true }).waitFor();
    await row.getByRole('cell', { name: '통과 (2회)', exact: true }).waitFor();
  }
  await table.getByRole('row').filter({ hasText: 'sensor-other' }).getByRole('cell', { name: '미이수', exact: true }).waitFor();
  for (const [name, label] of [['sensor-pending', '미응시'], ['sensor-wrong', '미통과 (1회)']]) {
    const row = table.getByRole('row').filter({ hasText: name });
    await row.getByRole('cell', { name: '100%', exact: true }).waitFor();
    await row.getByRole('cell', { name: '미이수', exact: true }).waitFor();
    await row.getByRole('cell', { name: label, exact: true }).waitFor();
  }
  await admin.context.close();
  assert.ok(states.every(result => !result.serverError));
  console.log(JSON.stringify({ status: 'PASS (isolated LMS)', productionAssessment: 'HOLD', states, output }));
}

try {
  browser = await chromium.launch({
    channel: process.env.ACADEMY_BROWSER_CHANNEL || undefined,
    headless: !process.argv.includes('--headed')
  });
  const baseline = process.argv.includes('--layout-baseline');
  if (!baseline && !process.argv.includes('--layout')) await runIntegrity();
  await verifyInteractionLayout({ session, base, lessons, output, baseline });
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(states, null, 2));
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  db.sqlite.close();
}
