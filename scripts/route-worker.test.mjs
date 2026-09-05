import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL('../public/map/' + file, import.meta.url), 'utf8');
test('worker imports the engine, caches its network, and preserves request IDs', async () => {
  let fetches = 0;
  const replies = [], ctx = { AbortSignal };
  ctx.self = ctx;
  ctx.postMessage = message => replies.push(message);
  ctx.fetch = async () => { fetches++; return { ok: true, json: async () => JSON.parse(read('geojson/walking-network.json')) }; };
  vm.createContext(ctx);
  ctx.importScripts = file => vm.runInContext(read(file.split('?')[0]), ctx);
  vm.runInContext(read('route-worker.js'), ctx);
  const stops = JSON.parse(read('geojson/food.geojson')).features.slice(0, 2).map(f => f.geometry.coordinates);
  await ctx.onmessage({ data: { id: 7, stops } });
  await ctx.onmessage({ data: { id: 8, stops } });
  assert.equal(fetches, 1);
  assert.deepEqual(replies.map(r => r.id), [7, 8]);
  assert.ok(replies.every(r => r.result.status === 'ok'));
});
test('worker reports loading failures rather than inventing a route', async () => {
  const ctx = { AbortSignal, fetch: async () => { throw Error('offline'); } }, replies = [];
  ctx.self = ctx; ctx.postMessage = message => replies.push(message);
  vm.createContext(ctx); ctx.importScripts = file => vm.runInContext(read(file.split('?')[0]), ctx);
  vm.runInContext(read('route-worker.js'), ctx);
  await ctx.onmessage({ data: { id: 1, stops: [[112, 28], [112, 28.1]] } });
  assert.equal(replies[0].result.status, 'load-error');
});
function plannerFixture() {
  const workers = [];
  class Worker {
    constructor() { workers.push(this); }
    postMessage(data) { this.data = data; }
    terminate() { this.terminated = true; }
  }
  const ctx = { window: { Worker }, Worker, setTimeout, clearTimeout };
  vm.runInNewContext(read('route-planner.js'), ctx);
  return { planner: ctx.window.RoutePlanner, workers };
}
test('planner creates a worker only on demand and returns the corresponding result', async () => {
  const { planner, workers } = plannerFixture();
  assert.equal(workers.length, 0);
  const pending = planner.plan([[112, 28], [112, 28.01]]);
  workers[0].onmessage({ data: { id: workers[0].data.id, result: { status: 'ok' } } });
  assert.equal((await pending).status, 'ok');
  planner.cancel();
});
test('planner cancellation terminates background work and releases pending requests', async () => {
  const { planner, workers } = plannerFixture();
  const pending = planner.plan([[112, 28], [112, 28.01]]);
  planner.cancel();
  assert.equal((await pending).status, 'cancelled');
  assert.equal(workers[0].terminated, true);
});
test('planner worker errors clear its timer and permit a later retry', async () => {
  const { planner, workers } = plannerFixture();
  const pending = planner.plan([[112, 28], [112, 28.01]]);
  workers[0].onerror();
  assert.equal((await pending).status, 'load-error');
  const retry = planner.plan([[112, 28], [112, 28.01]]);
  assert.equal(workers.length, 2);
  planner.cancel();
  await retry;
});
