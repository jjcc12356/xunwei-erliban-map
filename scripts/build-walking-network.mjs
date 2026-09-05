// Build-time extraction, preserving recorded topology rather than inventing intersections.
import { readFileSync, writeFileSync } from 'node:fs';
const source = JSON.parse(readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''));
const allowed = new Set(['primary', 'secondary', 'tertiary', 'residential', 'living_street', 'service', 'footway', 'pedestrian', 'path', 'steps', 'unclassified', 'track']);
const bounds = [112.92, 28.16, 112.97, 28.21];
const inside = ([x, y]) => x >= bounds[0] && x <= bounds[2] && y >= bounds[1] && y <= bounds[3];
const meters = (a, b) => Math.hypot((a[0] - b[0]) * Math.cos(28.18 * Math.PI / 180), a[1] - b[1]) * 111320;
const nodes = [], edges = [], names = [], nodeIds = new Map(), nameIds = new Map(), endpoints = new Map(), seenEdges = new Set();
function node(point, grade, endpoint) {
  const p = point.map(n => Number(n.toFixed(7))), xy = p.join(','), key = `${xy}|${grade}`;
  if (!nodeIds.has(key)) { nodeIds.set(key, nodes.length); nodes.push(p); }
  const id = nodeIds.get(key);
  if (endpoint) { if (!endpoints.has(xy)) endpoints.set(xy, new Set()); endpoints.get(xy).add(id); }
  return id;
}
for (const feature of source.features) {
  const props = feature.properties;
  if (!allowed.has(props.fclass)) continue;
  const layer = Number(props.layer) || 0, elevated = layer !== 0 || props.bridge === 'T';
  const grade = `${layer}:${props.bridge === 'T' ? 'bridge' : 'ground'}`;
  const name = props.name?.trim() || (['footway', 'path', 'pedestrian', 'steps'].includes(props.fclass) ? '未命名步道' : '未命名道路');
  if (!nameIds.has(name)) { nameIds.set(name, names.length); names.push(name); }
  const flags = (props.fclass === 'steps' ? 1 : 0) | (elevated ? 2 : 0) | (['primary', 'secondary'].includes(props.fclass) ? 4 : 0);
  const lines = feature.geometry.type === 'LineString' ? [feature.geometry.coordinates] : feature.geometry.type === 'MultiLineString' ? feature.geometry.coordinates : [];
  for (const line of lines) for (let i = 1; i < line.length; i++) {
    if (!inside(line[i - 1]) || !inside(line[i])) continue;
    const a = node(line[i - 1], grade, i === 1), b = node(line[i], grade, i === line.length - 1);
    if (a === b) continue;
    const key = [Math.min(a, b), Math.max(a, b)].join(':');
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);
    edges.push([a, b, Number(meters(nodes[a], nodes[b]).toFixed(3)), nameIds.get(name), flags]);
  }
}
// Different elevations connect only at explicitly coincident way endpoints, not visual crossings.
for (const ids of endpoints.values()) {
  const list = [...ids];
  for (let i = 1; i < list.length; i++) edges.push([list[0], list[i], 0, -1, 8]);
}
const result = { version: 1, bounds, nodes, edges, names, note: '源数据缺少步行权限、门禁和实时封闭信息；不代表通行保证。' };
writeFileSync(new URL('../public/map/geojson/walking-network.json', import.meta.url), JSON.stringify(result));
console.log(JSON.stringify({ nodes: nodes.length, edges: edges.length, bytes: Buffer.byteLength(JSON.stringify(result)) }));
