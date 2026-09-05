/* Small, dependency-free reading tools. The detailed road geometry loads only on selection. */
(function () {
  'use strict';
  const normalize = value => String(value || '').trim().replace(/\s+/g, '').toLowerCase();
  function findRoads(query, roads = window.ROAD_NAME_LABELS || []) {
    const term = normalize(query);
    if (!term) return [];
    return roads.filter(road => normalize(road.name).includes(term))
      .sort((a, b) => Number(b.name === term) - Number(a.name === term)).slice(0, 6);
  }
  function distanceToRoad(point, feature) {
    const scale = Math.cos(point[1] * Math.PI / 180) * 111320;
    let best = Infinity;
    const lines = feature?.geometry?.type === 'MultiLineString' ? feature.geometry.coordinates : [];
    for (const line of lines) for (let i = 1; i < line.length; i++) {
      const a = [(line[i - 1][0] - point[0]) * scale, (line[i - 1][1] - point[1]) * 111320];
      const b = [(line[i][0] - point[0]) * scale, (line[i][1] - point[1]) * 111320];
      const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
      const t = length ? Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dy) / length)) : 0;
      best = Math.min(best, Math.hypot(a[0] + t * dx, a[1] + t * dy));
    }
    return best;
  }
  function cameraPadding(width, height, panelOpen, collapsed) {
    const compact = width <= 820;
    return {
      top: compact ? 76 : 60,
      bottom: compact && panelOpen ? (collapsed ? 90 : Math.min((height + 60) * .58, 580, height - 140) + 24) : 80,
      left: compact ? 24 : 110,
      right: !compact && panelOpen ? Math.min(440, width * .46) + 36 : (compact ? 24 : 70),
    };
  }
  window.MapReading = { findRoads, distanceToRoad, cameraPadding };
  window.initMapReading = function (map, hooks) {
    if (window.mapReader) return;
    const body = document.body;
    const panel = document.getElementById('rightPanel');
    const status = document.getElementById('roadSelectionStatus');
    const selection = document.getElementById('roadSelection');
    const collapse = document.getElementById('panelCollapse');
    let selectedRoad = null, geometryPromise = null, requestId = 0, savedView = null;
    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const padding = () => cameraPadding(map.getContainer().clientWidth, map.getContainer().clientHeight,
      body.classList.contains('panel-open'), panel.classList.contains('is-collapsed'));
    const offset = () => { const p = padding(); return [(p.left - p.right) / 2, (p.top - p.bottom) / 2]; };
    function syncView() {
      const mode = map.getPitch() < 10 ? '2d' : '3d';
      body.dataset.mapView = mode;
      document.querySelectorAll('[data-map-view-button]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.mapViewButton === mode));
      });
    }
    function setView(mode) {
      if (mode === '2d' && map.getPitch() >= 10) savedView = { pitch: map.getPitch(), bearing: map.getBearing() };
      const target = mode === '2d' ? { pitch: 0, bearing: 0 } : savedView || { pitch: 60, bearing: -15 };
      map.easeTo({ ...target, duration: reduced() ? 0 : 550 });
    }
    document.querySelectorAll('[data-map-view-button]').forEach(button => {
      button.addEventListener('click', () => setView(button.dataset.mapViewButton));
    });
    document.getElementById('mapNorthReset').addEventListener('click', () => map.easeTo({ bearing: 0, duration: reduced() ? 0 : 400 }));
    map.on('pitchend', syncView);
    syncView();
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
    collapse.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('is-collapsed');
      collapse.setAttribute('aria-expanded', String(!collapsed));
      collapse.textContent = collapsed ? '展开' : '收起';
      window.refreshRoadNameLabels?.();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && body.classList.contains('panel-open') &&
          !document.querySelector('.menu-full-modal.show, .menu-full-modal.open')) {
        if (event.target.closest('#shopSearchInput')) return;
        hooks.closePanel();
      }
    });
    function clearRoad() {
      requestId++;
      selectedRoad = null;
      selection.hidden = true;
      map.getSource('reading-road')?.setData({ type: 'FeatureCollection', features: [] });
    }
    async function selectRoad(name) {
      const id = ++requestId;
      selectedRoad = null;
      map.getSource('reading-road')?.setData({ type: 'FeatureCollection', features: [] });
      selection.hidden = false;
      status.textContent = `正在定位${name}…`;
      try {
        if (!geometryPromise) geometryPromise = fetch('geojson/named-roads.geojson?v=20260905-2', { signal: AbortSignal.timeout(10000) })
          .then(response => { if (!response.ok) throw new Error('road data unavailable'); return response.json(); })
          .catch(error => { geometryPromise = null; throw error; });
        const data = await geometryPromise;
        if (id !== requestId) return;
        const road = data.features.find(feature => feature.properties.name === name);
        if (!road?.geometry.coordinates.length) throw new Error('road not found');
        selectedRoad = road;
        if (!map.getSource('reading-road')) {
          map.addSource('reading-road', { type: 'geojson', data: road });
          map.addLayer({ id: 'reading-road-halo', type: 'line', source: 'reading-road', paint: { 'line-color': '#fff0c8', 'line-width': 9, 'line-opacity': .85 } });
          map.addLayer({ id: 'reading-road-line', type: 'line', source: 'reading-road', paint: { 'line-color': '#ba4a32', 'line-width': 4 } });
        } else map.getSource('reading-road').setData(road);
        const results = hooks.onRoadSelected(name);
        status.textContent = `${name} · ${results.length} 处道路两侧约 120 米内的地点。高亮为研究区内收录路段。`;
        const points = road.geometry.coordinates.flat();
        const bounds = points.reduce((box, point) => box.extend(point), new maplibregl.LngLatBounds(points[0], points[0]));
        if (map.getPitch() >= 10) savedView = { pitch: map.getPitch(), bearing: map.getBearing() };
        map.fitBounds(bounds, { padding: padding(), maxZoom: 17.2, pitch: 0, bearing: 0, duration: reduced() ? 0 : 750 });
        document.getElementById('panelTitle').focus();
      } catch {
        if (id !== requestId) return;
        selectedRoad = null;
        map.getSource('reading-road')?.setData({ type: 'FeatureCollection', features: [] });
        status.textContent = `${name}暂时无法加载，请重新搜索并选择道路重试。`;
      }
    }
    document.getElementById('clearRoadSelection').addEventListener('click', () => hooks.clearSearch());
    const cancelPending = () => { requestId++; if (!selectedRoad) selection.hidden = true; };
    window.mapReader = { get selectedRoad() { return selectedRoad; }, selectRoad, clearRoad, cancelPending, padding, offset, setView };
  };
})();
