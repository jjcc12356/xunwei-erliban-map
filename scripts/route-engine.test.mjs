import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = file => readFileSync(new URL('../public/map/' + file, import.meta.url), 'utf8');
const context = {};
vm.runInNewContext(read('route-engine.js'), context);
const { createNetwork, distance } = context.RouteEngine;
const graph = (nodes, connections) => ({ nodes, edges: connections.map(([a, b, flags = 0]) => [a, b, distance(nodes[a], nodes[b]), 0, flags]), names: ['测试路'] });
const bend = graph([[112, 28], [112, 28.002], [112.003, 28.002], [112.003, 28]], [[0, 1], [1, 2], [2, 3]]);
test('route follows the bend in the road instead of a straight chord', () => {
  const result = createNetwork(bend).plan([[112, 28], [112.003, 28]]);
  assert.equal(result.status, 'ok');
  assert.ok(result.distance > 700);
  assert.ok(result.legs[0].coordinates.some(p => p[1] === 28.002));
});
test('two projections on one edge take only the between-projections segment', () => {
  const data = graph([[112, 28], [112.01, 28]], [[0, 1]]);
  const result = createNetwork(data).plan([[112.004, 28], [112.006, 28]]);
  assert.equal(result.status, 'ok');
  assert.ok(result.distance > 190 && result.distance < 200);
});
test('nearby POI access is separate from network length', () => {
  const data = graph([[112, 28], [112.01, 28]], [[0, 1]]);
  const result = createNetwork(data).plan([[112.002, 28.0003], [112.003, 28.0003]]);
  assert.equal(result.status, 'ok');
  assert.ok(result.access[0].distance > 30);
  assert.ok(result.legs[0].coordinates.every(p => p[1] === 28));
  assert.ok(result.distance < 100);
});
test('a visual crossing without shared topology is not an intersection', () => {
  const data = graph([[112, 28], [112.01, 28], [112.005, 27.995], [112.005, 28.005]], [[0, 1], [2, 3]]);
  assert.equal(createNetwork(data).plan([[112, 28], [112.005, 28.005]]).status, 'disconnected');
});
test('failed legs never return a partly fabricated complete route', () => {
  const data = graph([[112, 28], [112.001, 28], [112.005, 28], [112.006, 28]], [[0, 1], [2, 3]]);
  const result = createNetwork(data).plan([[112, 28], [112.001, 28], [112.005, 28]]);
  assert.equal(result.status, 'disconnected');
  assert.equal(result.from, 1);
  assert.equal(result.legs, undefined);
});
test('stops too far from a road or on an elevated road are not silently attached', () => {
  assert.equal(createNetwork(bend).plan([[111, 27], [112, 28]]).status, 'off-network');
  const bridge = graph([[112, 28], [112.01, 28]], [[0, 1, 2]]);
  assert.equal(createNetwork(bridge).plan([[112, 28], [112.01, 28]]).status, 'off-network');
});
test('steps are preserved as an explicit route warning', () => {
  const data = graph([[112, 28], [112.01, 28]], [[0, 1, 1]]);
  assert.equal(createNetwork(data).plan([[112, 28], [112.01, 28]]).legs[0].hasSteps, true);
});
test('invalid coordinates and unsupported stop counts are rejected', () => {
  for (const stops of [[], [[112, 28]], [[NaN, 28], [112, 28]], Array(6).fill([112, 28])]) assert.equal(createNetwork(bend).plan(stops).status, 'invalid');
});
test('real project network routes the first two shops with source-road geometry', () => {
  const data = JSON.parse(read('geojson/walking-network.json'));
  assert.ok(data.nodes.length > 1000 && data.nodes.length < 10000);
  const shops = JSON.parse(read('geojson/food.geojson')).features;
  const result = createNetwork(data).plan(shops.slice(0, 2).map(feature => feature.geometry.coordinates));
  assert.equal(result.status, 'ok');
  assert.ok(result.legs[0].coordinates.length > 5);
  assert.ok(result.distance >= distance(result.legs[0].coordinates[0], result.legs[0].coordinates.at(-1)));
});
function uiFixture(planner) {
  const main = read('main.js');
  const source = main.slice(main.indexOf('async function createShortTourRoute('), main.indexOf('function renderShopOverviewList('));
  const summary = { hidden: true, innerHTML: '' }, clear = { hidden: true }, rendered = [];
  const features = [0, 1].map(i => ({ geometry: { coordinates: [112 + i * .003, 28] }, properties: { 名称: '地点' + i } }));
  const ctx = { routePending: false, routeRequestId: 0, activeSmartRoute: [], smartSearchRouteInitialized: false,
    currentSearchResults: features, allShopFeatures: features, orderShortRoute: f => f,
    document: { getElementById: id => id === 'smartRouteSummary' ? summary : clear },
    window: { RoutePlanner: { plan: planner, cancel() {} } },
    updateSmartSearchActions() {}, setSearchStatus() {}, escapeHtml: x => x,
    getFeatureSearchMeta: f => ({ name: f.properties.名称 }), formatNearbyDistance: d => String(Math.round(d)),
    setSmartRouteData: (...args) => rendered.push(args),
  };
  vm.createContext(ctx); vm.runInContext(source, ctx);
  return { ctx, summary, rendered, run: () => vm.runInContext('createShortTourRoute(false)', ctx), clear: () => vm.runInContext('clearSmartSearchRoute()', ctx) };
}
test('clearing a pending route discards its late response', async () => {
  let resolve;
  const app = uiFixture(() => new Promise(done => { resolve = done; }));
  const pending = app.run(); app.clear();
  resolve(createNetwork(bend).plan([[112, 28], [112.003, 28]]));
  assert.equal(await pending, false);
  assert.equal(app.rendered.length, 0);
  assert.equal(app.summary.hidden, true);
});
test('UI shows topology failure and no replacement line', async () => {
  const app = uiFixture(async () => ({ status: 'disconnected', from: 0, to: 1 }));
  assert.equal(await app.run(), false);
  assert.match(app.summary.innerHTML, /未使用直线补齐/);
  assert.equal(app.rendered.length, 0);
  assert.equal(app.ctx.routePending, false);
});
test('UI uses computed network coordinates for along-route searches', async () => {
  const result = createNetwork(bend).plan([[112, 28], [112.003, 28]]);
  const app = uiFixture(async () => result);
  assert.equal(await app.run(), true);
  assert.ok(app.ctx.activeSmartRoute.length > 2);
  assert.equal(app.rendered.length, 1);
  assert.match(app.summary.innerHTML, /步行权限/);
});
