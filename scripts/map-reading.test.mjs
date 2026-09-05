import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../public/map/' + path, import.meta.url), 'utf8');
const source = read('map-reading.js');
const context = { window: {} };
vm.runInNewContext(read('road-labels.js') + '\n' + source, context);
const { findRoads, distanceToRoad, cameraPadding } = context.window.MapReading;
const roads = JSON.parse(read('geojson/named-roads.geojson'));
test('road name search accepts partial names, exact names, and empty input', () => {
  assert.equal(findRoads('新民')[0].name, '新民路');
  assert.equal(findRoads(' 新民路 ')[0].name, '新民路');
  assert.equal(findRoads('木兰')[0].name, '木兰路');
  assert.equal(findRoads('').length, 0);
  assert.equal(findRoads('不存在的路名').length, 0);
});
test('distance to a road uses finite line segments, not an infinite line or cross-gap shortcut', () => {
  const road = { geometry: { type: 'MultiLineString', coordinates: [[[112, 28], [112.001, 28]], [[112.01, 28], [112.011, 28]]] } };
  assert.ok(distanceToRoad([112.0005, 28], road) < .01);
  assert.ok(distanceToRoad([112.0005, 28.001], road) > 110);
  assert.ok(distanceToRoad([112.005, 28], road) > 300);
  assert.equal(distanceToRoad([112, 28], null), Infinity);
});
test('generated geometry covers the label index without distant same-name road segments', () => {
  assert.equal(roads.features.length, context.window.ROAD_NAME_LABELS.length);
  assert.ok(Buffer.byteLength(JSON.stringify(roads)) < 50000);
  for (const road of roads.features) {
    assert.ok(road.geometry.coordinates.length > 0);
    assert.ok(road.geometry.coordinates.every(line => line.length >= 2));
    if (road.properties.name === '新民路') assert.ok(road.geometry.coordinates.flat().every(([, lat]) => lat > 28.19));
  }
});
test('camera padding reserves the mobile sheet or desktop panel without covering the full map', () => {
  for (const [width, height] of [[390, 600], [390, 784], [800, 340], [1280, 728], [1920, 1008]]) {
    for (const collapsed of [false, true]) {
      const p = cameraPadding(width, height, true, collapsed);
      assert.ok(p.left + p.right < width - 30);
      assert.ok(p.top + p.bottom < height - 30);
    }
  }
});
function makeApp(fetcher) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, { hidden: true, textContent: '', dataset: {}, handlers: {},
        addEventListener(type, fn) { this.handlers[type] = fn; },
        setAttribute(key, value) { this[key] = value; }, focus() {},
        classList: { contains: value => classes.has(value), toggle(value) { if (classes.has(value)) { classes.delete(value); return false; } classes.add(value); return true; } },
      });
    }
    return elements.get(id);
  }
  const sources = new Map(), moves = [], selected = [], views = [];
  let pitch = 60, bearing = -15, fetches = 0;
  const map = { getContainer: () => ({ clientWidth: 390, clientHeight: 784 }),
    getPitch: () => pitch, getBearing: () => bearing, on() {}, addControl() {}, addLayer() {},
    getSource: id => sources.get(id), addSource(id, spec) { sources.set(id, { data: spec.data, setData(data) { this.data = data; } }); },
    easeTo(options) { views.push(options); pitch = options.pitch ?? pitch; bearing = options.bearing ?? bearing; },
    fitBounds(bounds, options) { moves.push({ bounds, options }); },
  };
  const body = element('body');
  const environment = { window: { matchMedia: () => ({ matches: false }) }, AbortSignal,
    document: { body, getElementById: element, querySelectorAll: () => [], addEventListener() {} },
    maplibregl: { ScaleControl: class {}, LngLatBounds: class { constructor(a, b) { this.points = [a, b]; } extend(p) { this.points.push(p); return this; } } },
    fetch: (...args) => { fetches++; return fetcher(...args); },
  };
  vm.runInNewContext(source, environment);
  environment.window.initMapReading(map, { onRoadSelected: name => { selected.push(name); return []; }, closePanel() {}, clearSearch() {} });
  return { reader: environment.window.mapReader, element, sources, moves, selected, views, fetchCount: () => fetches };
}
test('road selection loads geometry lazily, caches it and fits a flat view', async () => {
  const app = makeApp(async () => ({ ok: true, json: async () => roads }));
  assert.equal(app.fetchCount(), 0);
  await app.reader.selectRoad('新民路');
  assert.equal(app.reader.selectedRoad.properties.name, '新民路');
  assert.equal(app.moves[0].options.pitch, 0);
  assert.ok(app.moves[0].options.padding.bottom > 0);
  await app.reader.selectRoad('木兰路');
  assert.equal(app.fetchCount(), 1);
  app.reader.clearRoad();
  assert.equal(app.reader.selectedRoad, null);
  assert.equal(app.sources.get('reading-road').data.features.length, 0);
});
test('clear or close during loading cannot reopen the panel or move the map', async () => {
  for (const action of ['clearRoad', 'cancelPending']) {
    let resolve;
    const app = makeApp(() => new Promise(done => { resolve = done; }));
    const pending = app.reader.selectRoad('新民路');
    app.reader[action]();
    resolve({ ok: true, json: async () => roads });
    await pending;
    assert.equal(app.moves.length, 0);
    assert.equal(app.selected.length, 0);
  }
});
test('a failed geometry request is visible and retryable', async () => {
  let fail = true;
  const app = makeApp(async () => ({ ok: !fail, json: async () => roads }));
  await app.reader.selectRoad('新民路');
  assert.match(app.element('roadSelectionStatus').textContent, /重新搜索/);
  fail = false;
  await app.reader.selectRoad('新民路');
  assert.equal(app.reader.selectedRoad.properties.name, '新民路');
  assert.equal(app.fetchCount(), 2);
});
test('2D / 3D restores the prior viewing angle', () => {
  const app = makeApp(() => { throw Error('must not fetch'); });
  app.reader.setView('2d'); app.reader.setView('3d');
  assert.equal(app.views[0].pitch, 0);
  assert.equal(app.views[1].pitch, 60);
  assert.equal(app.views[1].bearing, -15);
});
test('route summary distinguishes network geometry and never estimates walking minutes', () => {
  const main = read('main.js');
  assert.match(main, /沿收录路网 · 参考路线/);
  assert.match(main, /入口连接，不计入路网长度/);
  assert.doesNotMatch(main, /walkMinutes/);
});
