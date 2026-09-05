import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const main = readFileSync(new URL('../public/map/main.js', import.meta.url), 'utf8');
const refreshSource = main.slice(main.indexOf('function refreshRoadNameLabels()'), main.indexOf('let roadLabelRefreshFrame'));
function fixture({ zoom = 16.5, tour = false, width = 1000, occupied = [], points = [[400, 400], [410, 400], [650, 400]], levels = [], candidates = [], moved = [] } = {}) {
  const elements = points.map(() => ({ offsetWidth: 28, offsetHeight: 88, classList: { toggle(_name, hidden) { this.hidden = hidden; } } }));
  const context = {
    map: { getZoom: () => zoom, getContainer: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, right: width, bottom: 800 }) }), project: point => ({ x: point.lng ?? point[0], y: point.lat ?? point[1] }) },
    document: { body: { classList: { contains: () => tour } }, querySelectorAll: () => occupied.map(rect => ({ getBoundingClientRect: () => ({ width: 200, height: 200, ...rect }) })) },
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
    roadNameMarkers: points.map((point, index) => ({ level: levels[index] || 'primary', candidates: candidates[index], marker: { getLngLat: () => ({ lng: point[0], lat: point[1] }), setLngLat: next => { moved.push(next); }, getElement: () => elements[index] } })),
  };
  vm.runInNewContext(refreshSource + '\nrefreshRoadNameLabels();', context);
  return elements.map(element => !element.classList.hidden);
}
test('nearby road labels do not overlap', () => assert.deepEqual(fixture(), [true, false, true]));
test('road labels yield to visible panels', () => assert.deepEqual(fixture({ occupied: [{ left: 300, right: 500, top: 300, bottom: 500 }] }), [false, false, true]));
test('offscreen labels are hidden on mobile', () => assert.deepEqual(fixture({ width: 390 }), [false, false, false]));
test('overview hides labels and tours stay unobstructed', () => {
  assert.deepEqual(fixture({ zoom: 14 }), [false, false, false]);
  assert.deepEqual(fixture({ tour: true }), [false, false, false]);
});
test('secondary road names only appear at close scales', () => assert.deepEqual(fixture({ zoom: 15.5, points: [[300, 400], [650, 400]], levels: ['primary', 'secondary'] }), [true, false]));
test('invalid projected coordinates are hidden', () => assert.deepEqual(fixture({ points: [[NaN, 400]] }), [false]));
test('classic-script window export does not create a perpetual animation loop', () => {
  const queue = [];
  const context = {
    roadNameMarkers: [],
    requestAnimationFrame: fn => { queue.push(fn); return queue.length; },
    map: { getZoom: () => 16, getContainer: () => ({ getBoundingClientRect: () => ({}) }) },
    document: { body: { classList: { contains: () => false } }, querySelectorAll: () => [] },
  };
  context.window = context;
  vm.runInNewContext(main.slice(main.indexOf('function refreshRoadNameLabels()'), main.indexOf('let mapInteractionSettleTimer')) + '\nscheduleRoadNameLabels();', context);
  assert.equal(queue.length, 1);
  queue.shift()();
  assert.equal(queue.length, 0, 'one layout refresh must finish without scheduling another frame');
});
test('generated labels contain unique named local anchors with small candidate lists', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('../public/map/road-labels.js', import.meta.url), 'utf8'), context);
  const labels = context.window.ROAD_NAME_LABELS;
  assert.ok(labels.length >= 16 && labels.length <= 64);
  assert.equal(new Set(labels.map(label => label.name)).size, labels.length);
  for (const name of ['学堂坡路', '新民路', '向阳路', '木兰路']) assert.ok(labels.some(label => label.name === name));
  assert.ok(labels.every(({ candidates }) => candidates.length > 0 && candidates.length <= 4 && candidates.every(([lon, lat]) => lon > 112.92 && lon < 112.963 && lat > 28.16 && lat < 28.21)));
  assert.ok(labels.find(label => label.name === '新民路').candidates.every(([, lat]) => lat > 28.19), 'do not jump to the distant same-name street');
});

test('a blocked anchor can use a geometric candidate instead of a screen offset', () => {
  const moved = [];
  assert.deepEqual(fixture({ points: [[400, 400]], occupied: [{ left: 300, right: 500, top: 300, bottom: 500 }], candidates: [[[650, 400]]], moved }), [true]);
  assert.deepEqual(moved, [[650, 400]]);
});
test('an unobstructed current anchor is stable', () => {
  const moved = [];
  fixture({ points: [[400, 400]], candidates: [[[650, 400]]], moved });
  assert.deepEqual(moved, []);
});
test('density limits leave map space on desktop and phone', () => {
  const points = Array.from({ length: 24 }, (_, i) => [40 + i % 6 * 55, 90 + Math.floor(i / 6) * 130]);
  assert.equal(fixture({ points }).filter(Boolean).length, 14);
  assert.equal(fixture({ points, width: 390 }).filter(Boolean).length, 7);
});
test('primary road names appear at the neighborhood overview scale', () => {
  assert.deepEqual(fixture({ zoom: 14.8 }), [true, false, true]);
});
