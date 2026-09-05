/* Pure routing engine; runs inside a Worker and in unit tests. No network or DOM here. */
(function (root) {
  const scaleX = Math.cos(28.18 * Math.PI / 180) * 111320;
  const distance = (a, b) => Math.hypot((a[0] - b[0]) * scaleX, (a[1] - b[1]) * 111320);
  class Heap {
    constructor() { this.items = []; }
    push(item) { const a = this.items; let i = a.length; a.push(item); while (i) { const p = (i - 1) >> 1; if (a[p][0] <= item[0]) break; a[i] = a[p]; i = p; } a[i] = item; }
    pop() { const a = this.items, first = a[0], last = a.pop(); if (a.length) { let i = 0; while (i * 2 + 1 < a.length) { let c = i * 2 + 1; if (c + 1 < a.length && a[c + 1][0] < a[c][0]) c++; if (a[c][0] >= last[0]) break; a[i] = a[c]; i = c; } a[i] = last; } return first; }
  }
  function createNetwork(data) {
    const { nodes, edges, names } = data;
    const adjacency = nodes.map(() => []);
    edges.forEach(([a, b, length, name, flags], id) => {
      const cost = length * (flags & 1 ? 1.3 : flags & 4 ? 1.12 : 1);
      adjacency[a].push([b, cost, id]); adjacency[b].push([a, cost, id]);
    });
    function snap(point) {
      let best = null;
      edges.forEach(([a, b, length, , flags], edge) => {
        if (flags & 10 || !length) return; // Never attach a POI to an elevated road or a topology-only junction.
        const start = nodes[a], end = nodes[b];
        const dx = (end[0] - start[0]) * scaleX, dy = (end[1] - start[1]) * 111320;
        const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * scaleX * dx + (point[1] - start[1]) * 111320 * dy) / (dx * dx + dy * dy)));
        const projected = [start[0] + t * (end[0] - start[0]), start[1] + t * (end[1] - start[1])];
        const gap = distance(point, projected);
        if (gap <= 60 && (!best || gap < best.gap)) best = { edge, t, point: projected, gap };
      });
      return best;
    }
    function between(start, end) {
      const extra = new Map(), coordinates = nodes.concat([start.point, end.point]);
      const origin = nodes.length, target = origin + 1;
      const add = (a, b, length, edge) => {
        const flags = edges[edge][4], cost = length * (flags & 1 ? 1.3 : flags & 4 ? 1.12 : 1);
        if (!extra.has(a)) extra.set(a, []); if (!extra.has(b)) extra.set(b, []);
        extra.get(a).push([b, cost, edge]); extra.get(b).push([a, cost, edge]);
      };
      for (const [snap, id] of [[start, origin], [end, target]]) {
        const [a, b, length] = edges[snap.edge];
        add(id, a, length * snap.t, snap.edge); add(id, b, length * (1 - snap.t), snap.edge);
      }
      if (start.edge === end.edge) add(origin, target, edges[start.edge][2] * Math.abs(start.t - end.t), start.edge);
      const costs = new Float64Array(coordinates.length).fill(Infinity), previous = new Map(), queue = new Heap();
      costs[origin] = 0; queue.push([0, origin]);
      while (queue.items.length) {
        const [cost, id] = queue.pop();
        if (cost !== costs[id]) continue;
        if (id === target) break;
        for (const [next, step, edge] of [...(adjacency[id] || []), ...(extra.get(id) || [])]) {
          if (cost + step >= costs[next]) continue;
          costs[next] = cost + step; previous.set(next, [id, edge]); queue.push([cost + step, next]);
        }
      }
      if (!Number.isFinite(costs[target])) return null;
      const ids = [target], usedEdges = [];
      for (let id = target; id !== origin;) { const [prev, edge] = previous.get(id); ids.push(prev); usedEdges.push(edge); id = prev; }
      ids.reverse(); usedEdges.reverse();
      const route = ids.map(id => coordinates[id]);
      let length = 0; for (let i = 1; i < route.length; i++) length += distance(route[i - 1], route[i]);
      const roadNames = [];
      for (const edge of usedEdges) { const name = names[edges[edge][3]]; if (name && roadNames.at(-1) !== name) roadNames.push(name); }
      return { coordinates: route, distance: length, roads: roadNames, hasSteps: usedEdges.some(id => edges[id][4] & 1) };
    }
    return { plan(stops) {
      if (!Array.isArray(stops) || stops.length < 2 || stops.length > 5 || stops.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) return { status: 'invalid' };
      const snapped = stops.map(snap);
      const missing = snapped.findIndex(point => !point);
      if (missing !== -1) return { status: 'off-network', stop: missing };
      const legs = [];
      for (let i = 1; i < snapped.length; i++) {
        const leg = between(snapped[i - 1], snapped[i]);
        if (!leg) return { status: 'disconnected', from: i - 1, to: i };
        legs.push(leg);
      }
      return { status: 'ok', legs, distance: legs.reduce((sum, leg) => sum + leg.distance, 0),
        access: snapped.map((point, i) => ({ coordinates: [stops[i], point.point], distance: point.gap })) };
    } };
  }
  root.RouteEngine = { createNetwork, distance };
})(globalThis);
