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
  return { name, coordinates: best.coordinates.map(v => Number(v.toFixed(7))), level };
});
const output = fileURLToPath(new URL('../public/map/road-labels.js', import.meta.url));
writeFileSync(output, '// Generated from original roads.geojson name + geometry; do not hand-edit anchors.\nwindow.ROAD_NAME_LABELS = ' + JSON.stringify(labels) + ';\n');
console.log(`Generated ${labels.length} geometry-aligned road labels (${output}).`);
