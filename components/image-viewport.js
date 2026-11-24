/* Shared image viewport: zoom is relative to the fitted image, pan is in CSS pixels. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AcademyImageViewport = api;
})(globalThis, function () {
  'use strict';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function fit(width, height, naturalWidth, naturalHeight) {
    const ratio = Math.min(1, Math.max(1, width - 32) / naturalWidth, Math.max(1, height - 32) / naturalHeight);
    return { width: naturalWidth * ratio, height: naturalHeight * ratio };
  }
  function bound(state) {
    const maxX = Math.max(0, (state.width * state.zoom - state.viewportWidth) / 2);
    const maxY = Math.max(0, (state.height * state.zoom - state.viewportHeight) / 2);
    return { ...state, x: maxX ? clamp(state.x, -maxX, maxX) : 0, y: maxY ? clamp(state.y, -maxY, maxY) : 0, maxX, maxY };
  }
  function zoomAt(state, zoom, from = { x: 0, y: 0 }, to = from) {
    zoom = clamp(zoom, 1, 8);
    const ratio = zoom / state.zoom;
    return bound({ ...state, zoom, x: to.x - (from.x - state.x) * ratio, y: to.y - (from.y - state.y) * ratio });
  }
  function create(viewport, image, onChange = () => {}) {
    let state = { width: 0, height: 0, viewportWidth: 0, viewportHeight: 0, zoom: 1, x: 0, y: 0 };
    const pointers = new Map();
    function render() {
      state = bound(state);
      image.style.width = `${state.width}px`;
      image.style.height = `${state.height}px`;
      image.style.transform = `translate(-50%, -50%) translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
      viewport.classList.toggle('can-pan', state.maxX > 0 || state.maxY > 0);
      viewport.classList.toggle('is-dragging', pointers.size > 0 && (state.maxX > 0 || state.maxY > 0));
      onChange(state.zoom);
    }
    function reset() {
      const ids = [...pointers.keys()];
      pointers.clear();
      for (const id of ids) if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
      state = { ...state, viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight, zoom: 1, x: 0, y: 0 };
      const size = image.naturalWidth && image.naturalHeight ? fit(state.viewportWidth, state.viewportHeight, image.naturalWidth, image.naturalHeight) : { width: 0, height: 0 };
      state = { ...state, ...size };
      viewport.scrollTo(0, 0);
      render();
    }
    const point = event => {
      const rect = viewport.getBoundingClientRect();
      return { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
    };
    function setZoom(value, anchor) { state = zoomAt(state, value, anchor); render(); }
    viewport.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !state.width) return;
      event.preventDefault();
      viewport.focus({ preventScroll: true });
      pointers.set(event.pointerId, point(event));
      viewport.setPointerCapture(event.pointerId);
      render();
    });
    viewport.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      event.preventDefault();
      const before = [...pointers.values()];
      pointers.set(event.pointerId, point(event));
      const after = [...pointers.values()];
      if (after.length === 1) {
        state = bound({ ...state, x: state.x + after[0].x - before[0].x, y: state.y + after[0].y - before[0].y });
      } else if (after.length === 2) {
        const center = points => ({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
        const distance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const previousDistance = distance(before);
        if (previousDistance > 0) state = zoomAt(state, state.zoom * distance(after) / previousDistance, center(before), center(after));
      }
      render();
    });
    function end(event) { pointers.delete(event.pointerId); render(); }
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(type, end);
    viewport.addEventListener('wheel', event => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
      setZoom(state.zoom * Math.exp(-delta * .002), point(event));
    }, { passive: false });
    viewport.addEventListener('dblclick', event => { event.preventDefault(); setZoom(state.zoom > 1 ? 1 : 2, point(event)); });
    viewport.addEventListener('keydown', event => {
      const movement = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
      if (movement) { event.preventDefault(); state = bound({ ...state, x: state.x + movement[0], y: state.y + movement[1] }); render(); }
      else if (['+', '=', '-', '0'].includes(event.key)) { event.preventDefault(); if (event.key === '0') reset(); else setZoom(state.zoom * (event.key === '-' ? 1 / 1.5 : 1.5)); }
    });
    image.draggable = false;
    image.addEventListener('load', reset);
    new ResizeObserver(() => {
      if (viewport.clientWidth !== state.viewportWidth || viewport.clientHeight !== state.viewportHeight) reset();
    }).observe(viewport);
    return { reset, zoomBy: factor => setZoom(state.zoom * factor) };
  }
  return { fit, bound, zoomAt, create };
});
