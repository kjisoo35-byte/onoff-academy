const test = require('node:test');
const assert = require('node:assert/strict');
const { fit, bound, zoomAt } = require('../components/image-viewport.js');
const state = (overrides = {}) => ({ width: 358, height: 178, viewportWidth: 390, viewportHeight: 700, zoom: 1, x: 0, y: 0, ...overrides });
test('fits wide, portrait and small images without distorting or upscaling', () => {
  for (const width of [390, 717, 1366]) for (const [w, h] of [[1238, 824], [752, 1052], [64, 48]]) {
    const size = fit(width, 700, w, h);
    assert.ok(size.width <= width - 32 && size.height <= 668);
    assert.ok(size.width <= w && size.height <= h);
    assert.ok(Math.abs(size.width / size.height - w / h) < 1e-8);
  }
});
test('small images cannot be dragged on either axis', () => {
  const result = bound(state({ width: 64, height: 48, zoom: 2, x: 999, y: -999 }));
  assert.equal(result.x, 0); assert.equal(result.y, 0);
});
test('wide image pans horizontally and locks its shorter axis', () => {
  const result = bound(state({ zoom: 2, x: 999, y: 999 }));
  assert.equal(result.x, 163); assert.equal(result.y, 0);
});
test('all four corners of an enlarged image can align with viewport edges', () => {
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const result = bound(state({ zoom: 8, x: sx * 10000, y: sy * 10000 }));
    assert.equal(result.x, sx * (358 * 8 - 390) / 2);
    assert.equal(result.y, sy * (178 * 8 - 700) / 2);
  }
});
test('zooming at an anchor preserves the same image point when bounds allow it', () => {
  const current = state({ zoom: 4, x: 20, y: 10 });
  const anchor = { x: 50, y: 20 };
  const result = zoomAt(current, 6, anchor);
  assert.equal((anchor.x - current.x) / current.zoom, (anchor.x - result.x) / result.zoom);
  assert.equal((anchor.y - current.y) / current.zoom, (anchor.y - result.y) / result.zoom);
});
test('pinch centroid movement and pinch scale use the same coordinate system', () => {
  const result = zoomAt(state({ zoom: 4 }), 6, { x: 0, y: 0 }, { x: 25, y: 40 });
  assert.equal(result.x, 25); assert.equal(result.y, 40);
});
test('zoom out re-centers non-overflowing axes and clamps the zoom range', () => {
  const current = state({ zoom: 8, x: 1000, y: 300 });
  const result = zoomAt(current, .1);
  assert.equal(result.zoom, 1); assert.equal(result.x, 0); assert.equal(result.y, 0);
  assert.equal(zoomAt(current, 200).zoom, 8);
});
