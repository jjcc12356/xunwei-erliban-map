importScripts('route-engine.js?v=20260905-3');
let network;
self.onmessage = async ({ data: { id, stops } }) => {
  try {
    if (!network) network = fetch('geojson/walking-network.json?v=20260905-3', { signal: AbortSignal.timeout(10000) })
      .then(response => { if (!response.ok) throw Error('network unavailable'); return response.json(); })
      .then(data => RouteEngine.createNetwork(data))
      .catch(error => { network = null; throw error; });
    self.postMessage({ id, result: (await network).plan(stops) });
  } catch { self.postMessage({ id, result: { status: 'load-error' } }); }
};
