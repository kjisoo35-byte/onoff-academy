import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const scenarios = [
  [['part','terminal'], ['part','sensor'], ['part','supply']],
  [['lamp','on'], ['lamp','off'], ['lamp','on']],
  [['wire','plc'], ['wire','blue'], ['wire','brown']],
  [['stage','2'], ['stage','0'], ['stage','1']],
  [['guide','2'], ['detect','on'], ['guide','3'], ['detect','off'], ['detect','on'], ['guide','1']],
  [['mode','schematic'], ['mode','flow'], ['detect','on'], ['mode','panel'], ['detect','off']],
  [['answer','0'], ['answer','2'], ['answer','1']],
  [['detect','on'], ['detect','off'], ['detect','on']]
];
const bottomScenarios = {
  0: [['part','terminal'], ['part','supply'], ['part','duct']],
  2: [['wire','terminal'], ['wire','plc'], ['wire','blue'], ['wire','brown']],
  3: [['stage','2'], ['stage','0'], ['stage','1']],
  4: [['guide','2'], ['guide','1']]
};
const viewports = [[390,760], [717,768], [1024,600], [1024,768], [1366,650], [1440,900]];
const stableActions = new Set(scenarios.flat().map(([action]) => action));
const epsilon = 1;
const max = (...values) => Math.max(0, ...values);
const displacement = (a, b) => max(...a.map((value, index) => Math.abs(value - b[index])));

async function snapshot(page) {
  return page.evaluate(actions => {
    const diagram = document.getElementById('drawing');
    const workspace = diagram.closest('.sensor-workspace,.ak-interaction-workspace');
    const box = node => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return [x, y, width, height];
    };
    const buttons = Object.fromEntries([...workspace.querySelectorAll('button[data-action][data-value]')]
      .filter(button => actions.includes(button.dataset.action) && button.getClientRects().length)
      .map(button => [button.dataset.action + ':' + button.dataset.value, box(button)]));
    const scrollRoot = document.scrollingElement;
    return { diagram: box(diagram), buttons, scroll: scrollRoot.scrollTop,
      overflow: scrollRoot.scrollWidth - scrollRoot.clientWidth, viewport: [innerWidth, innerHeight],
      client: scrollRoot.clientWidth, scrollExtent: scrollRoot.scrollHeight - scrollRoot.clientHeight };
  }, [...stableActions]);
}

async function measure(page, action, value) {
  const control = page.locator('[data-action="' + action + '"][data-value="' + value + '"]:visible');
  await control.scrollIntoViewIfNeeded();
  const before = await snapshot(page);
  await (page.viewportSize().width < 800 ? control.tap() : control.click());
  if (action === 'answer') {
    await page.getByText(
      value === '1' ? '판단 Practice 통과' : '오답입니다. 다시 시도하세요.', { exact: true }
    ).waitFor();
  }
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const after = await snapshot(page);
  const key = action + ':' + value;
  const active = [before.buttons[key], after.buttons[key]];
  assert.ok(active.every(Boolean), key);
  const bottom = box => box[1] + box[3];
  const jointlyVisible = (state, button) => Math.min(state.diagram[1], button[1]) >= -epsilon
    && Math.max(bottom(state.diagram), bottom(button)) <= state.viewport[1] + epsilon;
  const buttonRects = [...Object.values(before.buttons).map(box => [box, before.client]),
    ...Object.values(after.buttons).map(box => [box, after.client])];
  return { action: key, figure: displacement(before.diagram, after.diagram),
    controls: max(...Object.entries(before.buttons).filter(([id]) => after.buttons[id])
      .map(([id, box]) => displacement(box, after.buttons[id]))),
    scroll: Math.abs(before.scroll - after.scroll),
    scrollBounds: [before.scrollExtent, after.scrollExtent],
    overflow: max(before.overflow, after.overflow),
    touch: buttonRects.every(([box]) => box[2] >= 44 - epsilon && box[3] >= 44 - epsilon),
    clipped: buttonRects.some(([box, width]) => box[0] < -epsilon || box[0] + box[2] > width + epsilon),
    simultaneous: jointlyVisible(before, active[0]) && jointlyVisible(after, active[1]) };
}

async function verifyFixture(page, base) {
  const address = base + '/__interaction_fixture';
  await page.route(address, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width, initial-scale=1">
    <link rel=stylesheet href="/components/academy-components.css"><link rel=stylesheet href="/components/learning-foundation.css">
    <main class="ak-interaction-workspace">
      <section class="ak-media ak-interaction-card" aria-labelledby="relay-title">
        <h2 class="ak-interaction-title" id="relay-title">릴레이 접점 실습</h2>
        <div class="ak-interaction-layout">
          <figure class="ak-interaction-figure" aria-describedby="relay-feedback"><div class="ak-media-frame ak-interaction-stage" id="diagram"></div></figure>
          <div class="ak-interaction-panel">
            <div class="ak-interaction-controls"><div class="ak-interaction-choices" role="group" aria-label="접점 제어">
              <button type="button" aria-pressed="false">접점 닫기</button>
            </div></div>
            <div class="ak-interaction-feedback"><p id="relay-feedback" class="ak-interaction-status" aria-live="polite">열림</p></div>
          </div>
        </div>
      </section>
    </main>
    <script src="/components/interaction-workspace.js"></script>
    <script>
      const layout = AcademyInteractionWorkspace.attach(document.querySelector('.ak-interaction-card'));
      const button = document.querySelector('button');
      const diagram = document.getElementById('diagram');
      function render(closed) {
        layout.beforeUpdate();
        button.setAttribute('aria-pressed', String(closed));
        diagram.innerHTML = '<svg viewBox="0 0 240 ' + (closed ? 100 : 170) + '" role="img" aria-label="접점 회로"><path d="M20 70h70l60 ' + (closed ? '0' : '-35') + 'h70" stroke="black" stroke-width="4" fill="none"/></svg>';
        document.getElementById('relay-feedback').textContent = closed ? '코일이 작동해 접점이 닫혔고 두 단자 사이에 회로가 이어집니다.' : '열림';
      }
      button.addEventListener('click', () => render(button.getAttribute('aria-pressed') === 'false'));
      render(false);
    </script>` }));
  await page.goto(address);
  const graphic = page.locator('#diagram');
  const control = page.getByRole('button', { name: '접점 닫기' });
  const a = await graphic.boundingBox();
  const button = await control.boundingBox();
  await control.click();
  assert.ok(await page.getByText('코일이 작동해 접점이 닫혔고 두 단자 사이에 회로가 이어집니다.').isVisible());
  assert.deepEqual(await graphic.boundingBox(), a);
  assert.deepEqual(await control.boundingBox(), button);
  await page.unroute(address);
}

export async function verifyInteractionLayout({ session, base, lessons, output, baseline }) {
  const results = [];
  const bottomResults = [];
  const fixtures = [];
  const deliberate = [];
  for (const [width, height] of viewports) {
    const { page, context } = await session(width, 'sensor-layout-' + width + '-' + height, height);
    try {
      for (const [index, lesson] of lessons.entries()) {
        await page.goto(base + '/index.html#' + lesson);
        await page.locator('#' + lesson + ' #drawing svg:visible').waitFor();
        await page.waitForFunction(() => window.onoffAcademyProgressQA?.inspect().serverReady);
        await page.evaluate(() => document.fonts.ready);
        // Hash navigation deliberately resets the viewport again after 120ms. Measure controls after that settles.
        await page.waitForTimeout(140);
        if (([390, 1366].includes(width) && [1, 3, 4, 6, 7].includes(index)) || (width === 717 && index === 7)) {
          await page.screenshot({ path: path.join(output, width + '-' + (index + 1) + '-before-action.png') });
        }
        for (const [action, value] of scenarios[index]) results.push({ width, height, lesson, ...await measure(page, action, value) });
        for (const [action, value] of bottomScenarios[index] || []) {
          await page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight));
          const state = await snapshot(page);
          const button = state.buttons[action + ':' + value];
          if (!state.scroll || !button || button[1] < 0 || button[1] + button[3] > height) continue;
          bottomResults.push({ width, height, lesson, ...await measure(page, action, value) });
        }
        if (!baseline && [4, 7].includes(index)) {
          const expand = page.locator(index === 4 ? '#detail-toggle' : '#review-view');
          await expand.scrollIntoViewIfNeeded();
          const before = await snapshot(page);
          await expand.click();
          const after = await snapshot(page);
          assert.equal(await expand.getAttribute('aria-expanded'), 'true');
          const documentBox = state => [state.diagram[0], state.diagram[1] + state.scroll, ...state.diagram.slice(2)];
          assert.ok(displacement(documentBox(before), documentBox(after)) <= epsilon, 'detail expansion moved the diagram in the document');
          deliberate.push({ width, height, lesson, scroll: Math.abs(before.scroll - after.scroll) });
        }
        if (([390, 1366].includes(width) && [1, 3, 4, 6, 7].includes(index)) || (width === 717 && index === 7)) {
          await page.screenshot({ path: path.join(output, width + '-' + (index + 1) + '-after-action.png') });
        }
      }
      if (!baseline && [390, 1366].includes(width)) {
        await verifyFixture(await context.newPage(), base);
        fixtures.push(width);
      }
    } finally { await context.close(); }
  }
  const summary = {
    transitions: results.length, bottomTransitions: bottomResults.length,
    maxBottomScrollShift: max(...bottomResults.map(row => row.scroll)), viewports, fixtureWidths: fixtures, deliberateDetailExpansions: deliberate.length,
    maxFigureShift: max(...results.map(row => row.figure)),
    maxControlShift: max(...results.map(row => row.controls)),
    maxScrollShift: max(...results.map(row => row.scroll)),
    maxOverflow: max(...results.map(row => row.overflow)),
    simultaneousMisses: results.filter(row => !row.simultaneous).length,
    touchOrClippingMisses: results.filter(row => !row.touch || row.clipped).length
  };
  const violations = results.filter(row => row.figure > epsilon || row.controls > epsilon || row.scroll > epsilon
    || row.overflow > epsilon || !row.touch || row.clipped || !row.simultaneous);
  const bottomViolations = bottomResults.filter(row => row.figure > epsilon || row.controls > epsilon || row.scroll > epsilon || row.clipped);
  assert.ok(bottomResults.length > 0, 'no controls were exercised at the bottom of a scrollable lesson');
  await fs.writeFile(path.join(output, 'interaction-layout.json'), JSON.stringify({ baseline, summary, violations, bottomViolations, deliberate, results, bottomResults }, null, 2));
  console.log(JSON.stringify({ baseline, ...summary, violations: violations.length, bottomViolations: bottomViolations.length, output }));
  if (baseline) assert.ok(violations.length > 0, 'the baseline must reproduce a layout failure');
  else {
    assert.deepEqual(violations, [], 'interaction workspace geometry changed above the 1px budget');
    assert.deepEqual(bottomViolations, [], 'shrinking feedback moved the viewport or its controls near the end');
  }
}
