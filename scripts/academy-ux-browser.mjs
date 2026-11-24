import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { installCourseFixture, course, chapters } from '../test/fixtures/academy-course.mjs';

const repo = path.resolve(import.meta.dirname, '..');
const { COURSE_CATALOG } = createRequire(import.meta.url)('../lib/learning-progress.js');
const widths = [320, 390, 717, 1024, 1366, 1440, 1920];
const routes = {
  platform: 'platform-course', risk: 'risk-course', practical: 'risk-practical-course',
  sop: 'sop-course', tbm: 'tbm-course', special: 'special-course'
};
const proof = process.argv.includes('--prove-shift');
const headed = process.argv.includes('--headed');
const fixtureOnly = process.argv.includes('--fixture-only');
const statusOnly = process.argv.includes('--status-only');
const output = path.resolve(process.env.ACADEMY_QA_OUTPUT || path.join(repo, '.academy-data', 'ux-qa'));
await fs.mkdir(output, { recursive: true });
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'academy-ux-'));
const server = spawn(process.execPath, ['dev-server.js'], {
  cwd: repo,
  env: {
    ...process.env, PORT: '0', ACADEMY_DISABLE_WATCH: '1', ACADEMY_STATIC_ROOT: repo,
    ACADEMY_PROGRESS_FILE: path.join(temporary, 'progress.json'), ACADEMY_TEST_AUTH: '1'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
const serverClosed = new Promise(resolve => server.once('close', resolve));
let browser;

async function serverAddress() {
  return new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Academy QA server timed out')), 10000);
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error('QA server exited: ' + code + '\n' + output)); });
    server.stderr.on('data', chunk => { output += chunk; });
    server.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
  });
}

function viewport(width) {
  return { width, height: width < 800 ? 1400 : 900 };
}

async function createContext(base, width, label, role = 'learner') {
  const context = await browser.newContext({
    viewport: viewport(width), hasTouch: width < 800, isMobile: width < 800, serviceWorkers: 'block'
  });
  context.setDefaultTimeout(10000);
  // Test identity headers apply only to this loopback API. WORK and all external requests are intercepted.
  await context.route('**/*', route => {
    const request = route.request();
    if (!request.url().startsWith(base + '/')) {
      if (request.url() === 'https://onoff-work.pages.dev/') {
        return route.fulfill({ contentType: 'text/html', body: '<title>Isolated WORK</title><p>QA WORK</p>' });
      }
      return route.abort('blockedbyclient');
    }
    if (!request.url().startsWith(base + '/api/academy/')) return route.continue();
    return route.continue({ headers: { ...request.headers(), 'x-academy-user-id': label, 'x-academy-user-role': role } });
  });
  return context;
}

function waitView(page, route) {
  return page.waitForFunction(route => document.body.dataset.academyView === route, route);
}

function waitReady(page) {
  return page.waitForFunction(() => window.onoffAcademyProgressQA?.inspect().serverReady);
}

async function checkChrome(page, view) {
  // Counts are for visible application chrome. Lesson body headings and course CTAs
  // have their own semantic header/footer elements.
  const rules = {
    home: [1, [1], 0], course: [1, [0, 1], 0], lesson: [1, [0, 1], 1]
  };
  const selector = [
    '.catalog-header,.unified-mast,.desktop-academy-global-header,.site-header,.figma-course-global-header,.figma-mobile-course-landing > header,.figma-home-header',
    '.catalog-footer,.site-footer',
    '.unified-foot,.chapter-reading-nav,.floating-lesson-navigation,.chapter-pager,.ready-bottom-navigation,.platform-figma-navigation,nav[class$="-bottom-nav"],nav[aria-label="학습 이동"],nav[aria-label="Lesson 이동"]'
  ];
  const counts = await Promise.all(selector.map(value =>
    page.locator(value.split(',').map(part => part + ':visible').join(',')).count()));
  const [headers, footers, navigation] = rules[view];
  assert.ok(counts[0] === headers && footers.includes(counts[1]) && counts[2] === navigation,
    `${view} ${page.url()} chrome [header, footer, lesson nav]: ${counts}`);
  const bounds = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    layoutWidth: Math.ceil(document.documentElement.getBoundingClientRect().width),
    viewportWidth: innerWidth
  }));
  const expectedWidth = page.viewportSize().width;
  assert.ok(Math.max(bounds.scrollWidth, bounds.layoutWidth, bounds.viewportWidth) <= expectedWidth + 1,
    `${view} ${page.url()} horizontal overflow: ${JSON.stringify(bounds)}`);
  assert.ok(bounds.scrollWidth <= Math.max(bounds.clientWidth, bounds.layoutWidth) + 1,
    `${view} ${page.url()} overflow inside the scrollbar gutter: ${JSON.stringify(bounds)}`);
}

async function switchCategory(page, category, count) {
  const tab = page.locator(`[role="tab"][data-category="${category}"]`);
  await tab.click();
  assert.equal(await tab.getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('.catalog-course').count(), count);
}

// Reproduce the exact long/short lists from the 7.52px shift. Require both native
// scrollbar states on the desktop so an overlay scrollbar cannot give a false pass.
async function checkShift(page, width, label) {
  await switchCategory(page, 'electrical', 1);
  const samples = [];
  for (let n = 0; n < 10; n++) {
    await switchCategory(page, n % 2 ? 'electrical' : 'safety', n % 2 ? 1 : 5);
    const sample = await page.evaluate(() => {
      const root = document.documentElement;
      const selectors = ['.catalog-header', '.catalog-header-inner', '.catalog-brand', '.catalog-workspace',
        '.catalog-category-tabs', '.catalog-my-learning'];
      return {
        innerWidth, clientWidth: root.clientWidth, scrollHeight: root.scrollHeight,
        clientHeight: root.clientHeight, scrollX,
        x: Object.fromEntries(selectors.map(selector => [selector, document.querySelector(selector).getBoundingClientRect().x]))
      };
    });
    samples.push(sample);
    if ((width === 1366 || proof) && n < 2) {
      await page.screenshot({ path: path.join(output, `${label}-${width}-${n ? 'short' : 'long'}.png`) });
    }
  }
  assert.ok(samples.every(sample => sample.innerWidth === samples[0].innerWidth && sample.scrollX === 0));
  if (width === 1366 || width === 1440) {
    assert.ok(samples[0].scrollHeight > samples[0].clientHeight && samples[1].scrollHeight === samples[1].clientHeight);
    assert.ok(samples[0].innerWidth - samples[0].clientWidth > 0, 'QA requires classic desktop scrollbars');
  }
  const movements = Object.fromEntries(Object.keys(samples[0].x).map(key => {
    const positions = samples.map(sample => sample.x[key]);
    return [key, Math.max(...positions) - Math.min(...positions)];
  }));
  const maximum = Math.max(...Object.values(movements));
  await fs.writeFile(path.join(output, `${label}-${width}.json`), JSON.stringify({ maximum, movements, samples }, null, 2));
  assert.ok(maximum <= 1, `Horizontal shift: ${maximum.toFixed(2)}px exceeds 1px at ${width}px`);
  return maximum;
}

function eventResponse(page, base, type, courseId, lessonId) {
  return page.waitForResponse(response => {
    if (response.url() !== base + '/api/academy/progress/events') return false;
    const payload = response.request().postDataJSON();
    return payload?.type === type && payload.courseId === courseId && payload.lessonId === lessonId;
  });
}

async function enterLesson(page, base, link, courseId, lessonId) {
  const [response] = await Promise.all([eventResponse(page, base, 'lesson.entered', courseId, lessonId), link.click()]);
  await waitView(page, lessonId);
  assert.ok(response.ok(), `${courseId}/${lessonId} session event rejected`);
  assert.equal((await response.json()).courses[courseId].lastLessonId, lessonId);
  await page.waitForFunction(() => document.body.dataset.academyProgressSave === 'saved');
  await checkChrome(page, 'lesson');
}

async function catalogJourney(base, width) {
  const context = await createContext(base, width, 'ux-' + width);
  try {
    const page = await context.newPage();
    const pageErrors = [];
    const browserEvents = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => {
      if (request.url() === base + '/api/academy/progress/events') browserEvents.push(request.postDataJSON());
    });
    await page.goto(base + '/index.html#home');
    await waitReady(page);
    await checkChrome(page, 'home');
    assert.equal(await page.locator('.catalog-course[data-catalog-course]').count(), 6);
    const shift = await checkShift(page, width, 'catalog');
    await switchCategory(page, 'all', 7);
    const search = page.getByRole('searchbox', { name: '교육과정 검색' });
    await search.fill('SOP');
    assert.equal(await page.locator('.catalog-course').count(), 1);
    assert.equal(await page.locator('.catalog-course').getAttribute('data-catalog-course'), 'sop');
    await page.getByRole('combobox', { name: '과정 정렬' }).selectOption('title');
    await page.locator('[data-catalog-course="sop"] .catalog-course-title').click();
    await waitView(page, routes.sop);
    await page.goBack();
    await waitView(page, 'home');
    assert.equal(await search.inputValue(), 'SOP');
    assert.equal(await page.getByRole('combobox', { name: '과정 정렬' }).inputValue(), 'title');
    await search.fill('없는 과정 QA');
    assert.ok(await page.locator('.catalog-empty:visible').isVisible());
    await page.locator('.catalog-empty:visible [data-catalog-all]').click();
    assert.equal(browserEvents.length, 0, 'Catalog browsing must not write learning events');

    for (const [courseId, route] of Object.entries(routes)) {
      await page.locator(`[data-catalog-course="${courseId}"] .catalog-course-title`).click();
      await waitView(page, route);
      await checkChrome(page, 'course');
      const [first, next] = COURSE_CATALOG[courseId];
      await enterLesson(page, base, page.locator(`a[href="#${first}"]:visible`).first(), courseId, first);
      await page.locator('.unified-foot').getByRole('button', { name: '목차', exact: true }).click();
      const toc = page.locator('dialog.unified-toc[open]');
      assert.equal(await toc.count(), 1);
      assert.ok(await toc.locator(`a[href="#${first}"][aria-current="page"]`).isVisible());
      await enterLesson(page, base, toc.locator(`a[href="#${next}"]`), courseId, next);
      await page.locator('.unified-mast a[href="#home"]').click();
      await waitView(page, 'home');
      await checkChrome(page, 'home');
    }

    const resume = page.locator('.catalog-continue a');
    assert.equal(await resume.getAttribute('href'), '#special-live-work-75v',
      `${width}px resume target after Special Lesson 2`);
    await enterLesson(page, base, resume, 'special', 'special-live-work-75v');
    await page.locator('.unified-mast a[href="#home"]').click();
    await waitView(page, 'home');
    await page.locator('[data-catalog-course="practical"] .catalog-course-title').click();
    await waitView(page, routes.practical);
    const completionLesson = 'risk-practical-01';
    await enterLesson(page, base, page.locator(`a[href="#${completionLesson}"]:visible`).first(), 'practical', completionLesson);
    const completion = page.locator(
      `[data-complete-on-navigation="${completionLesson}"]:visible, [data-learning-complete="${completionLesson}"]:visible`
    );
    assert.equal(await completion.count(), 1, `${width}px Practical completion control`);
    const [response] = await Promise.all([
      eventResponse(page, base, 'lesson.completed', 'practical', completionLesson),
      completion.click()
    ]);
    assert.ok(response.ok());
    assert.equal((await response.json()).courses.practical.progressPercent, 25);
    const progress = await page.evaluate(async () => (await fetch('/api/academy/progress/me')).json());
    assert.equal(progress.courses.practical.lessons[completionLesson].state, 'COMPLETED');
    assert.equal(progress.courses.practical.officiallyCompleted, false);
    assert.equal(browserEvents.filter(event => event.type === 'lesson.completed').length, 1);
    assert.equal(browserEvents.filter(event => event.type === 'practice.result').length, 0);
    // These requirements are present at both mobile and desktop in the existing
    // Practice audit. TBM and the unregistered Practical Lesson 4 stay under P1 HOLD.
    for (const [courseId, lessonId] of [
      ['practical', 'risk-practical-01'], ['practical', 'risk-practical-02'],
      ['special', 'special-robot-work'], ['special', 'special-live-work-75v']
    ]) {
      const practiceId = lessonId + ':practice';
      assert.ok(browserEvents.some(event => event.type === 'practice.required' && event.courseId === courseId && event.practiceId === practiceId),
        `${width}px missing practice.required for ${practiceId}`);
      assert.equal(progress.courses[courseId].practices[practiceId]?.required, true);
    }
    for (const event of browserEvents.filter(event => event.type === 'practice.required')) {
      assert.ok(event.required && event.practiceId.endsWith(':practice'));
      assert.ok(COURSE_CATALOG[event.courseId].includes(event.practiceId.replace(/:practice$/, '')));
    }
    await page.locator('.unified-mast a[href="#home"]').click();
    await waitView(page, 'home');
    await page.reload();
    await waitReady(page);
    assert.equal(await page.locator('[data-catalog-course="practical"] [role="progressbar"]').getAttribute('aria-valuenow'), '25');
    await page.locator('[data-work-return]:visible').click();
    await page.waitForURL('https://onoff-work.pages.dev/');
    assert.equal(await page.title(), 'Isolated WORK');
    assert.deepEqual(pageErrors, []);
    console.log(`PASS ${width}px · shift ${shift.toFixed(2)}px · six courses · server progress`);
  } finally {
    await context.close();
  }
}

async function courseStatusJourney(base) {
  const scenarios = [
    { id: 'new', state: 'NOT_STARTED', label: '미시작', learning: '미시작', official: false },
    { id: 'started', state: 'IN_PROGRESS', label: '학습 중', learning: '진행 중', official: false },
    { id: 'pending', state: 'COMPLETED', label: '학습 완료 · 이수 대기', learning: '학습 완료', official: false },
    { id: 'official', state: 'COMPLETED', label: '공식 이수 완료', learning: '학습 완료', official: true }
  ];
  const evidence = [];
  for (const scenario of scenarios) {
    const user = 'ux-status-' + scenario.id;
    const headers = { 'x-academy-user-id': user, 'content-type': 'application/json' };
    const post = async (courseId, type, fields) => {
      const response = await fetch(base + '/api/academy/progress/events', {
        method: 'POST', headers, body: JSON.stringify({ id: crypto.randomUUID(), courseId, type, ...fields })
      });
      assert.ok(response.ok, type);
    };
    for (const [courseId, lessons] of Object.entries(COURSE_CATALOG)) {
      // Pending and official have the same lesson data and differ only by the server's Practice result.
      if (scenario.state === 'COMPLETED') {
        await post(courseId, 'practice.required', { practiceId: 'qa-assessment', required: true });
      }
      const completed = scenario.state === 'COMPLETED' ? lessons : scenario.state === 'IN_PROGRESS' ? lessons.slice(0, 1) : [];
      for (const lessonId of completed) await post(courseId, 'lesson.completed', { lessonId });
      if (scenario.official) await post(courseId, 'practice.result', { practiceId: 'qa-assessment', required: true, passed: true });
    }
    const response = await fetch(base + '/api/academy/progress/me', { headers });
    assert.ok(response.ok);
    const { courses } = await response.json();
    for (const [courseId, course] of Object.entries(courses)) {
      assert.equal(course.state, scenario.state, user + ' ' + courseId);
      assert.equal(course.officiallyCompleted, scenario.official, user + ' ' + courseId);
    }
    for (const width of [390, 1366]) {
      const context = await createContext(base, width, user);
      try {
        const page = await context.newPage();
        await page.goto(base + '/index.html#home');
        await waitReady(page);
        for (const [courseId, route] of Object.entries(routes)) {
          const card = page.locator(`[data-catalog-course="${courseId}"]`);
          const home = await card.locator('.catalog-status').innerText();
          const percent = courses[courseId].progressPercent;
          assert.equal(await card.getByRole('progressbar').getAttribute('aria-valuenow'), String(percent));
          await card.locator('.catalog-course-title').click();
          await waitView(page, route);
          const status = page.locator(`[data-progress-course="${courseId}"] [data-course-state]:visible`);
          const progress = page.locator(`[data-progress-course="${courseId}"] [data-course-progress]:visible`);
          // The Special desktop landing has theme links and no status badge or progress display.
          const hasDetailStatus = courseId !== 'special' || width < 800;
          const detail = hasDetailStatus ? await status.innerText() : null;
          if (hasDetailStatus) assert.ok((await progress.innerText()).startsWith(percent + '%'));
          else assert.equal(await status.count() + await progress.count(), 0);
          evidence.push({ width, user, courseId, percent, state: scenario.state, officiallyCompleted: scenario.official,
            expected: scenario.label, expectedDetail: hasDetailStatus ? scenario.label : null, home, detail });
          if (courseId === 'practical' && scenario.id === 'pending') {
            await page.screenshot({ path: path.join(output, `status-practical-${width}.png`) });
          }
          await page.goBack();
          await waitView(page, 'home');
        }
      } finally {
        await context.close();
      }
    }
  }
  const context = await createContext(base, 1366, 'ux-course-admin', 'administrator');
  try {
    const page = await context.newPage();
    await page.goto(base + '/index.html#administration');
    const form = page.locator('[data-learning-admin-filters]');
    await page.locator('[data-learning-admin-rows] tr').first().waitFor();
    await form.locator('input[name="query"]').fill('ux-status-');
    const rows = page.locator('[data-learning-admin-rows] tr');
    for (const courseId of Object.keys(routes)) {
      const previous = await rows.evaluateAll(nodes => [nodes.length, nodes[0]?.cells[2].textContent]);
      await form.locator('select[name="courseId"]').selectOption(courseId);
      await form.getByRole('button', { name: '조회' }).click();
      await page.waitForFunction(([count, title]) => {
        const found = document.querySelectorAll('[data-learning-admin-rows] tr');
        return found.length === 4 && (count !== 4 || found[0].cells[2].textContent !== title);
      }, previous);
      const filtered = await rows.evaluateAll(nodes => nodes.map(row => Array.from(row.cells, cell => cell.textContent)));
      for (const item of evidence.filter(item => item.courseId === courseId)) {
        const row = filtered.find(row => row[0] === item.user);
        const scenario = scenarios.find(scenario => item.user === 'ux-status-' + scenario.id);
        assert.ok(row, `Missing admin row for ${item.user} and ${courseId}`);
        item.admin = { percent: row[3], learning: row[4], official: row[5] };
        item.expectedAdmin = { percent: item.percent + '%', learning: scenario.learning, official: item.officiallyCompleted ? '이수' : '미이수' };
      }
    }
  } finally {
    await context.close();
  }
  await fs.writeFile(path.join(output, 'course-status.json'), JSON.stringify(evidence, null, 2));
  const practicalPending = evidence.find(item => item.courseId === 'practical' && item.user === 'ux-status-pending');
  assert.equal(practicalPending.detail, practicalPending.expectedDetail, 'Practical: Lesson 100%, officiallyCompleted=false');
  for (const item of evidence) {
    const label = `${item.width}px ${item.user} ${item.courseId}`;
    assert.equal(item.home, item.expected, label + ' Home');
    assert.equal(item.detail, item.expectedDetail, label + ' Course Detail');
    assert.deepEqual(item.admin, item.expectedAdmin, label + ' Admin');
  }
  console.log(`PASS · official completion presentation · ${evidence.length} course/state/viewport combinations`);
}

async function extensionJourney(base, width) {
  const context = await createContext(base, width, 'extension-' + width);
  try {
    await installCourseFixture(context, base);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/index.html#home');
    await waitView(page, 'home');
    await checkChrome(page, 'home');
    await switchCategory(page, 'equipment', 2);
    const card = page.locator(`[data-catalog-course="${course.id}"]`);
    const theme = a => a.evaluate(el => {
      const style = getComputedStyle(el);
      return [style.borderRadius, style.backgroundColor, style.fontFamily];
    });
    assert.deepEqual(await theme(card), await theme(page.locator('[data-catalog-course="sop"]')));
    await page.getByRole('searchbox').fill(course.title);
    assert.equal(await card.count(), 1);
    await card.locator('.catalog-course-title').click();
    await waitView(page, course.route);
    await checkChrome(page, 'course');
    const [[first], [next]] = chapters;
    await page.locator(`a[href="#${first}"]:visible`).first().click();
    await waitView(page, first);
    await checkChrome(page, 'lesson');
    assert.ok(await page.locator(`#${first}.unified-chapter .ak-scene:visible`).isVisible());
    await page.screenshot({ path: path.join(output, `extension-${width}.png`) });
    await page.locator('.unified-foot').getByRole('button', { name: '목차', exact: true }).click();
    await page.locator(`dialog.unified-toc[open] a[href="#${next}"]`).click();
    await waitView(page, next);
    await checkChrome(page, 'lesson');
    const previousRoute = width < 800 ? first + '-content' : first;
    await page.locator(`.unified-foot a[href="#${previousRoute}"]`).click();
    await waitView(page, previousRoute);
    const nextRoute = width < 800 ? next + '-content' : next;
    await page.locator(`.unified-foot a[href="#${nextRoute}"]`).click();
    await waitView(page, nextRoute);
    await page.locator('.unified-mast a[href="#home"]').click();
    await waitView(page, 'home');
    await checkChrome(page, 'home');
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px · fixture Catalog → course → shared Shell → Home`);
  } finally {
    await context.close();
  }
}

async function proveShift(base) {
  for (const broken of [true, false]) {
    const context = await createContext(base, 1366, 'shift-proof');
    try {
      if (broken) await context.route(base + '/components/learning-catalog.css', async route => {
        const response = await route.fetch();
        const css = await response.text();
        const originalGutterRule = 'html:has(body.is-catalog-home) { scrollbar-gutter:stable; }';
        assert.ok(css.includes(originalGutterRule), 'Update proof mutation if the gutter rule moves');
        await route.fulfill({ response, body: css.replace(originalGutterRule, '') });
      });
      const page = await context.newPage();
      await page.goto(base + '/index.html#home');
      await waitReady(page);
      if (broken) {
        await assert.rejects(checkShift(page, 1366, 'proof-before'), /Horizontal shift: .* exceeds 1px/);
        console.log('EXPECTED FAIL · the 1px assertion rejected the original gutter behavior');
      } else {
        const shift = await checkShift(page, 1366, 'proof-after');
        console.log(`PASS · live CSS measured ${shift.toFixed(2)}px`);
      }
    } finally {
      await context.close();
    }
  }
}

try {
  const base = await serverAddress();
  const channel = process.env.ACADEMY_BROWSER_CHANNEL;
  browser = await chromium.launch({
    ...(channel ? { channel } : {}), headless: !headed,
    ignoreDefaultArgs: ['--hide-scrollbars'],
    args: ['--disable-features=OverlayScrollbar,FluentOverlayScrollbar']
  });
  if (proof) await proveShift(base);
  else {
    if (!statusOnly) {
      if (!fixtureOnly) for (const width of widths) await catalogJourney(base, width);
      for (const width of [390, 1366]) await extensionJourney(base, width);
    }
    if (!fixtureOnly) await courseStatusJourney(base);
  }
  console.log('Evidence: ' + output);
} finally {
  try {
    await browser?.close();
  } finally {
    server.kill();
    await serverClosed;
    await fs.rm(path.join(temporary, 'progress.json'), { force: true });
    await fs.rmdir(temporary);
  }
}
