// Build-time only: project label anchors onto the named source road geometry.
// Usage: node scripts/build-road-labels.mjs path/to/roads.geojson
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = JSON.parse(readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''));
const requests = [
  ['麓山南路', [112.939, 28.175], 'primary', 'secondary'],
  ['登高路', [112.9369, 28.1819], 'primary', 'residential'],
  ['桃子湖路', [112.9455, 28.1873], 'primary', 'secondary'],
  ['学堂坡路', [112.9485, 28.192], 'secondary', 'residential'],
  ['麓山路', [112.9447, 28.1948], 'primary', 'secondary'],
  ['新民路', [112.9478, 28.1958], 'primary', 'secondary'],
  ['潇湘中路', [112.9478, 28.181], 'primary', 'primary'],
  ['枫林一路', [112.948, 28.1995], 'secondary', 'trunk'],
];
const lonScale = Math.cos(28.18 * Math.PI / 180);
const bounds = [112.925, 28.168, 112.963, 28.203];
const inBounds = ([x, y]) => x >= bounds[0] && x <= bounds[2] && y >= bounds[1] && y <= bounds[3];
const distance = (a, b) => Math.hypot((a[0] - b[0]) * lonScale, a[1] - b[1]);
const round = point => point.map(v => Number(v.toFixed(7)));
const roadLines = feature => feature.geometry.type === 'LineString'
  ? [feature.geometry.coordinates] : feature.geometry.type === 'MultiLineString' ? feature.geometry.coordinates : [];
// Keep only local, genuinely named streets. Generic OSM notes and building names are not road labels.
const localSegments = new Map();
for (const feature of source.features) {
  const name = feature.properties.name?.trim();
  if (!name || !/^[\u3400-\u9fff]{2,7}(?:路|街|巷|桥|大道)$/.test(name) || /^(?:小路|道路|主路|干路|校园路|区域路|园区路|步行路|过街天桥)$|门口|处小路/.test(name)) continue;
  for (const line of roadLines(feature)) for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i];
    // Both ends must be within the study area, avoiding extrapolated/out-of-area anchors.
    if (!inBounds(a) || !inBounds(b) || !distance(a, b)) continue;
    if (!localSegments.has(name)) localSegments.set(name, []);
    localSegments.get(name).push({ a, b, length: distance(a, b), fclass: feature.properties.fclass });
  }
}
function candidatesFor(name, preferred) {
  const segments = localSegments.get(name) || [];
  const choices = preferred ? [round(preferred)] : [];
  // Start at the midpoint of the longest retained segment, then choose well-separated alternatives.
  for (const segment of [...segments].sort((a, b) => b.length - a.length)) {
    const middle = round([(segment.a[0] + segment.b[0]) / 2, (segment.a[1] + segment.b[1]) / 2]);
    // Do not jump to a distant, identically named street (the source has two 新民路 areas).
    if (preferred && distance(preferred, middle) > 0.014) continue;
    if (choices.every(point => distance(point, middle) > 0.001)) choices.push(middle);
    if (choices.length >= 4) break;
  }
  return choices;
}
const labels = requests.map(([name, target, level, fclass]) => {
  let best = null;
  for (const feature of source.features) {
    if (feature.properties.name?.trim() !== name || feature.properties.fclass !== fclass) continue;
    const lines = feature.geometry.type === 'LineString'
      ? [feature.geometry.coordinates] : feature.geometry.type === 'MultiLineString' ? feature.geometry.coordinates : [];
    for (const line of lines) for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i];
      const dx = (b[0] - a[0]) * lonScale, dy = b[1] - a[1];
      const length2 = dx * dx + dy * dy;
      if (!length2) continue;
      const t = Math.max(0, Math.min(1, (((target[0] - a[0]) * lonScale) * dx + (target[1] - a[1]) * dy) / length2));
      const coordinates = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      const distance2 = ((coordinates[0] - target[0]) * lonScale) ** 2 + (coordinates[1] - target[1]) ** 2;
      if (!best || distance2 < best.distance2) best = { coordinates, distance2 };
    }
  }
  if (!best || best.distance2 > 0.003 ** 2) throw new Error(`No nearby named source road: ${name}`);
  return { name, coordinates: round(best.coordinates), candidates: candidatesFor(name, best.coordinates), level };
});
const existing = new Set(labels.map(label => label.name));
for (const [name, segments] of localSegments) {
  if (existing.has(name)) continue;
  const length = segments.reduce((sum, segment) => sum + segment.length, 0);
  if (length < 0.00035) continue;
  const candidates = candidatesFor(name);
  if (!candidates.length) continue;
  labels.push({ name, coordinates: candidates[0], candidates, level: 'secondary' });
}
const output = fileURLToPath(new URL('../public/map/road-labels.js', import.meta.url));
writeFileSync(output, '// Generated from original roads.geojson name + geometry; do not hand-edit anchors.\nwindow.ROAD_NAME_LABELS = ' + JSON.stringify(labels) + ';\n');
console.log(`Generated ${labels.length} geometry-aligned road labels (${output}).`);
