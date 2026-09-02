import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const main = readFileSync(new URL('../public/map/main.js', import.meta.url), 'utf8');
const refreshSource = main.slice(main.indexOf('function refreshRoadNameLabels()'), main.indexOf('let roadLabelRefreshFrame'));
function fixture({ zoom = 16.5, tour = false, width = 1000, occupied = [], points = [[400, 400], [410, 400], [650, 400]], levels = [] } = {}) {
  const elements = points.map(() => ({ offsetWidth: 88, offsetHeight: 26, classList: { toggle(_name, hidden) { this.hidden = hidden; } } }));
  const context = {
    map: { getZoom: () => zoom, getContainer: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, right: width, bottom: 800 }) }), project: point => ({ x: point[0], y: point[1] }) },
    document: { body: { classList: { contains: () => tour } }, querySelectorAll: () => occupied.map(rect => ({ getBoundingClientRect: () => ({ width: 200, height: 200, ...rect }) })) },
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
    roadNameMarkers: points.map((point, index) => ({ level: levels[index] || 'primary', marker: { getLngLat: () => point, getElement: () => elements[index] } })),
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
test('generated labels contain eight named, local anchors', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('../public/map/road-labels.js', import.meta.url), 'utf8'), context);
  const labels = context.window.ROAD_NAME_LABELS;
  assert.equal(labels.length, 8);
  assert.equal(new Set(labels.map(label => label.name)).size, 8);
  assert.ok(labels.some(label => label.name === '学堂坡路'));
  assert.ok(labels.every(({ coordinates: [lon, lat] }) => lon > 112.92 && lon < 112.96 && lat > 28.16 && lat < 28.21));
});
