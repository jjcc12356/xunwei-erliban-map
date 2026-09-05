// 全局存储：分开保存美食、娱乐标记
let foodMarkers = [];
let entertainMarkers = [];
const appBootStartedAt = window.performance.now();
let currentShopData = null;
// 新增：缓存当前店铺全部菜品，弹窗使用
let currentShopAllDishes = [];

// 保存全部店铺原始feature数据，用于店铺总览列表渲染
let allShopFeatures = [];

// 店铺总览当前的组合筛选状态
let currentOverviewFilter = "all";
let currentSearchKeyword = "";
let currentSearchMode = "default";
let currentSearchResults = [];
let searchOrigin = null;
let searchOriginLabel = "当前视野";
let activeSmartRoute = [];
let smartSearchRouteInitialized = false;
let activeMarkerDom = null;
let currentAmbience = "day";
let currentCulturalMode = "landscape";
let currentCulturalHour = 14;
let culturalScenePending = false;
let currentMapMarkerFilter = "all";
let shopClusterInitialized = false;
const SHOP_LIST_PAGE_SIZE = 48;
const INDIVIDUAL_MARKER_ZOOM = 17;
const SEARCH_RESULT_MARKER_LIMIT = 12;

// 从原始 roads.geojson 的真实路名及线段投影生成，精简道路文件不含 name。
// 仅加载命名道路的少量几何锚点；不加载整份原始道路，也不请求在线字形服务。
const ROAD_NAME_LABELS = window.ROAD_NAME_LABELS || [];
let roadNameMarkers = [];

const shopClusterLayerIds = [
  "shop-cluster-halo",
  "shop-clusters",
  "shop-cluster-single",
];

// 菜谱数据（从 xlsx 读取后缓存）
let menuData = [];
let menuLoaded = false;
let xlsxLibraryPromise = null;

// ========= marker显示隐藏工具函数 =========
function setMarkerVisibility(markerArr, visible) {
  markerArr.forEach((marker) => {
    if (visible) {
      marker.getElement().style.display = "block";
    } else {
      marker.getElement().style.display = "none";
    }
  });
}

// 筛选控制器
function filterMarkers(filterType) {
  currentMapMarkerFilter = filterType;
  switch (filterType) {
    case "all":
      setMarkerVisibility(foodMarkers, true);
      setMarkerVisibility(entertainMarkers, true);
      break;
    case "food":
      setMarkerVisibility(foodMarkers, true);
      setMarkerVisibility(entertainMarkers, false);
      break;
    case "entertain":
      setMarkerVisibility(foodMarkers, false);
      setMarkerVisibility(entertainMarkers, true);
      break;
  }
  refreshShopClusterSource();
  refreshShopClusters();
}

function featureMatchesMapFilter(feature) {
  return currentMapMarkerFilter === "all" || feature?._category === currentMapMarkerFilter;
}

function shopClusterGeoJSON() {
  return {
    type: "FeatureCollection",
    features: allShopFeatures
      .filter(featureMatchesMapFilter)
      .map((feature) => ({
        type: "Feature",
        properties: {
          category: feature._category,
          shopIndex: allShopFeatures.indexOf(feature),
          name: feature.properties?.["名称"] || "城市点位",
        },
        geometry: {
          type: "Point",
          coordinates: feature.geometry.coordinates,
        },
      })),
  };
}

function refreshShopClusterSource() {
  if (!shopClusterInitialized) return;
  map.getSource("shop-clusters")?.setData(shopClusterGeoJSON());
}

function refreshShopClusters() {
  if (!shopClusterInitialized) return;
  const tourActive = document.body.classList.contains("tour-active");
  const clustered =
    map.getZoom() < INDIVIDUAL_MARKER_ZOOM &&
    !tourActive &&
    !document.body.classList.contains("smart-search-active");
  document.body.classList.toggle("map-clustered", clustered);
  document.body.dataset.markerMode = clustered ? "clustered" : "individual";
  document.body.dataset.mapZoom = map.getZoom().toFixed(2);
  shopClusterLayerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", clustered ? "visible" : "none");
    }
  });
  ["smart-search-route-halo", "smart-search-route-line", "smart-search-route-stops"].forEach(
    (layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", tourActive ? "none" : "visible");
      }
    },
  );
  refreshVisibleShopMarkers();
}

window.refreshShopClusters = refreshShopClusters;

function refreshVisibleShopMarkers() {
  if (!allShopFeatures.length) return;
  const tourActive = document.body.classList.contains("tour-active");
  const detailed = map.getZoom() >= INDIVIDUAL_MARKER_ZOOM;
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const lngPadding = Math.max(0.0012, (east - west) * 0.2);
  const latPadding = Math.max(0.001, (north - south) * 0.2);

  allShopFeatures.forEach((feature) => {
    const marker = feature._marker;
    const coordinates = feature.geometry?.coordinates;
    if (!marker || !Array.isArray(coordinates)) return;
    const isTourContext =
      feature._markerDom?.classList.contains("is-tour-context") ||
      feature._markerDom?.classList.contains("is-tour-nearby");
    const isSearchResult = Number.isFinite(feature._searchRank) && !tourActive;
    const inViewport =
      coordinates[0] >= west - lngPadding &&
      coordinates[0] <= east + lngPadding &&
      coordinates[1] >= south - latPadding &&
      coordinates[1] <= north + latPadding;
    const shouldAttach =
      isSearchResult ||
      (featureMatchesMapFilter(feature) &&
        ((tourActive && isTourContext) || (!tourActive && detailed && inViewport)));

    if (shouldAttach && !feature._markerAdded) {
      marker.addTo(map);
      feature._markerAdded = true;
    } else if (!shouldAttach && feature._markerAdded) {
      marker.remove();
      feature._markerAdded = false;
    }
  });
  document.body.dataset.visibleShopMarkers = String(
    allShopFeatures.filter((feature) => feature._markerAdded).length,
  );
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("zh-CN");
}

function isFoodFeature(feature) {
  if (feature?._category) return feature._category === "food";
  const type = String(feature?.properties?.["类型"] || "");
  return /餐饮服务|美食|餐|饮|面|饭|菜|茶|咖啡|奶茶|烧烤|火锅|小吃|甜品|烘焙/.test(
    type,
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getShopImageVariant(source, variant = "optimized") {
  const value = String(source || "").trim().replaceAll("\\", "/");
  const match = value.match(/^\.\/images\/shop\/(.+)\.(?:jpe?g|png|webp)$/i);
  if (!match) return value;
  return `./images/${variant}/shop/${match[1]}.webp?v=20260830-1`;
}

function getFoodPlaceGlyph(name, type) {
  const shopName = String(name || "");
  // “餐饮服务/餐饮相关”是所有美食点共有的上位分类，不能拿其中的“饮”判断茶饮。
  const specificType = String(type || "")
    .replace(/餐饮服务|餐饮相关场所|餐饮相关/g, "")
    .replace(/[;|]+/g, " ");
  const text = `${shopName} ${specificType}`;

  if (/咖啡|咖啡厅|Coffee|COFFEE/i.test(text)) return "咖";
  if (
    (/茶艺馆|茶馆|茶室|茶坊|茶社|擂茶|茶咖/.test(text) || /[·•-]茶$/.test(shopName)) &&
    !/茶餐厅|奶茶|果茶/.test(text)
  ) return "茶";
  if (/奶茶|果茶|饮品|冷饮|酸奶|烧仙草|冰城|Drink|果汁|冰淇淋/i.test(text)) return "饮";
  if (/粉面馆|米粉|牛肉粉|鱼粉|螺蛳粉|土豆粉|粉铺|米线|粉店/.test(text)) return "粉";
  if (/拉面|小面|面馆|面条|拌面|凉面|炸酱面|馄饨|抄手/.test(text)) return "面";
  if (/花甲|海鲜|鱼|虾|蟹|水产|生蚝/.test(text)) return "鲜";
  if (/食堂|学生餐厅|校园餐厅/.test(text)) return "食";
  if (/烧烤|烤肉|火锅|串串|铁板|烤串|炸鸡|锅贴/.test(text)) return "炙";
  if (/甜品|蛋糕|糕饼|烘焙|面包|糖水|鸡蛋仔|豆花|酥/.test(text)) return "点";
  if (/盖码饭|煲仔饭|炒饭|拌饭|饭团|米饭/.test(text)) return "饭";
  if (/快餐厅|肯德基|麦当劳|汉堡|华莱士/.test(text)) return "快";
  if (/餐厅|饭店|餐馆|菜馆|厨房|家厨|湘菜|中餐厅|清真|料理|排档|小馆/.test(text)) return "餐";
  return "味";
}

function getSpecificPlaceType(rawType, category) {
  const genericTypes = new Set([
    "餐饮服务",
    "餐饮相关场所",
    "餐饮相关",
    "体育休闲服务",
    "生活服务",
  ]);
  const parts = String(rawType || "")
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter((part) => part && !genericTypes.has(part));
  const uniqueParts = [...new Set(parts)];
  return uniqueParts.at(-1) || (category === "food" ? "街巷食味" : "城市游兴");
}

function getPlaceCoverMeta(properties, category) {
  const name = getShopValue(properties, ["名称", "name", "店名"], "二里半城市切片");
  const rawType = getShopValue(
    properties,
    ["类型", "type", "分类"],
    category === "food" ? "街巷食味" : "城市游兴",
  );
  const type = getSpecificPlaceType(rawType, category);
  const address = getShopValue(properties, ["地址", "address"], "岳麓山下 · 二里半");
  const signature = `${name}|${rawType}|${address}`;
  let seed = 0;
  for (let index = 0; index < signature.length; index += 1) {
    seed = (seed * 31 + signature.charCodeAt(index)) >>> 0;
  }
  const glyph = category === "food"
    ? getFoodPlaceGlyph(name, rawType)
    : /大学|校园|书院|文化/.test(`${name}${rawType}`)
      ? "文"
      : /体育|健身|球|游泳|瑜伽/.test(`${name}${rawType}`)
        ? "动"
        : /酒|吧|PUB|pub/.test(`${name}${rawType}`)
          ? "夜"
          : "游";
  return {
    name,
    type: type.slice(0, 16),
    address: address.replace(/湖南省|长沙市|岳麓区/g, "").slice(0, 22),
    glyph,
    tone: seed % 6,
    number: String((seed % 97) + 1).padStart(2, "0"),
  };
}

function createPlaceCoverMarkup(properties, category, variant = "overview", hidden = false) {
  const meta = getPlaceCoverMeta(properties, category);
  const categoryLabel = category === "food" ? "人间烟火" : "城市游兴";
  return `
    <div class="place-cover place-cover--${variant} place-cover--${category} place-cover-tone-${meta.tone}"${hidden ? " hidden" : ""} role="img" aria-label="${escapeHtml(meta.name)}暂无实景图片，显示城市题签">
      <span class="place-cover-kicker">ERLIBAN · ${meta.number}</span>
      <i class="place-cover-glyph" aria-hidden="true">${meta.glyph}</i>
      <span class="place-cover-copy">
        <strong>${escapeHtml(meta.name)}</strong>
        <small>${escapeHtml(meta.type)} · ${escapeHtml(meta.address)}</small>
      </span>
      <em>${categoryLabel} · 城市题签</em>
    </div>
  `;
}

function getMenuImageVariant(source) {
  const value = String(source || "").trim().replaceAll("\\", "/");
  const match = value.match(/^\.\/images\/menu\/(.+)\.(?:jpe?g|png|webp)$/i);
  if (!match) return value;
  return `./images/optimized/menu/${match[1]}.webp?v=20260831-1`;
}

function getDishCoverMeta(dish) {
  const name = String(dish?.name || "招牌风味").trim();
  const shop = String(dish?.shop || "二里半食集").trim();
  const signature = `${shop}|${name}`;
  let seed = 0;
  for (let index = 0; index < signature.length; index += 1) {
    seed = (seed * 33 + signature.charCodeAt(index)) >>> 0;
  }
  const glyph = /面|粉|米线|粉丝/.test(name)
    ? "面"
    : /饭|盖码|炒饭|煲仔/.test(name)
      ? "饭"
      : /饺|包|饼|糕|酥/.test(name)
        ? "点"
        : /汤|粥|羹/.test(name)
          ? "汤"
          : /烤|烧|串|炸|煎/.test(name)
            ? "炙"
            : /茶|咖啡|奶|饮|酒/.test(name)
              ? "饮"
              : /鸡|鸭|鱼|虾|肉|牛|羊/.test(name)
                ? "鲜"
                : "味";
  return {
    name,
    shop,
    glyph,
    tone: seed % 6,
    number: String((seed % 97) + 1).padStart(2, "0"),
  };
}

function createDishCoverMarkup(dish, hidden = false) {
  const meta = getDishCoverMeta(dish);
  return `
    <div class="dish-cover dish-cover-tone-${meta.tone}"${hidden ? " hidden" : ""} role="img" aria-label="${escapeHtml(meta.name)}暂无实景图片，显示菜品题签">
      <span class="dish-cover-index">ERLIBAN · ${meta.number}</span>
      <i class="dish-cover-seal" aria-hidden="true">${meta.glyph}</i>
      <span class="dish-cover-copy">
        <strong>${escapeHtml(meta.name)}</strong>
        <small>店家招牌 · 菜品题签</small>
      </span>
    </div>
  `;
}

function createDishMediaMarkup(dish) {
  const originalImage = String(dish?.image || "").trim();
  if (!originalImage) return createDishCoverMarkup(dish);
  const optimizedImage = getMenuImageVariant(originalImage);
  return `
    <img class="menu-dish-image" src="${escapeHtml(optimizedImage)}" data-original-src="${escapeHtml(originalImage)}" alt="${escapeHtml(dish.name || "招牌菜品")}" loading="lazy" decoding="async">
    ${createDishCoverMarkup(dish, true)}
  `;
}

function createDishCardMarkup(dish) {
  const name = String(dish?.name || "招牌菜品");
  const price = String(dish?.price || "时令价");
  return `
    <div class="menu-card">
      <div class="menu-card-img">${createDishMediaMarkup(dish)}</div>
      <div class="menu-card-info">
        <div class="menu-dish-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
        <div class="menu-dish-price">${escapeHtml(price)}</div>
      </div>
    </div>
  `;
}

function hydrateDishImages(container) {
  container.querySelectorAll(".menu-dish-image").forEach((img) => {
    const cover = img.nextElementSibling;
    const showCover = () => {
      img.hidden = true;
      img.classList.remove("is-loaded");
      if (cover) cover.hidden = false;
    };
    const showImage = () => {
      img.hidden = false;
      img.classList.add("is-loaded");
      if (cover) cover.hidden = true;
    };
    img.addEventListener("load", showImage, { once: true });
    img.addEventListener("error", () => {
      const originalImage = img.dataset.originalSrc || "";
      if (img.dataset.triedOriginal !== "true" && originalImage) {
        img.dataset.triedOriginal = "true";
        img.src = originalImage;
        return;
      }
      showCover();
    });
    if (img.complete) {
      if (img.naturalWidth > 0) showImage();
      else img.dispatchEvent(new Event("error"));
    }
  });
}

function yieldToBrowser(timeout = 90) {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => resolve(), { timeout });
    } else {
      window.setTimeout(resolve, 0);
    }
  });
}

function getShopValue(props, keys, fallback = "暂无") {
  const key = keys.find((candidate) => {
    const value = props?.[candidate];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
  if (!key) return fallback;
  const value = String(props[key]).trim();
  return value === "[]" ? fallback : value;
}

function dismissStoryCard() {
  document.getElementById("mapStoryCard")?.classList.add("is-dismissed");
}

let panelReturnFocus = null;
function setRightPanelOpen(open) {
  const panel = document.getElementById("rightPanel");
  if (!panel) return;
  const nextOpen = Boolean(open);
  const wasOpen = panel.classList.contains("open");
  if (nextOpen && !wasOpen) panelReturnFocus = document.activeElement;
  if (nextOpen && document.body.classList.contains("tour-active")) {
    window.stopCulturalTour?.();
  }
  panel.classList.toggle("open", nextOpen);
  panel.classList.remove("is-collapsed");
  panel.inert = !nextOpen;
  if (!nextOpen) window.mapReader?.cancelPending();
  const collapse = document.getElementById("panelCollapse");
  collapse?.setAttribute("aria-expanded", "true");
  if (collapse) collapse.textContent = "收起";
  panel.setAttribute("aria-hidden", String(!nextOpen));
  document.body.classList.toggle("panel-open", nextOpen);
  if (nextOpen) dismissStoryCard();
  else {
    document.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"));
  }
  refreshShopClusters();
  if (nextOpen && !wasOpen) document.getElementById("panelTitle")?.focus({ preventScroll: true });
  if (!nextOpen && wasOpen && panelReturnFocus?.isConnected) panelReturnFocus.focus({ preventScroll: true });
}

window.setCulturalPanelOpen = setRightPanelOpen;

function activateFeatureMarker(feature) {
  activeMarkerDom?.classList.remove("is-active");
  activeMarkerDom = feature?._markerDom || null;
  activeMarkerDom?.classList.add("is-active");
}

function openShopFeature(feature, duration = 1200) {
  const coordinates = feature?.geometry?.coordinates;
  if (!feature || !Array.isArray(coordinates)) return;
  activateFeatureMarker(feature);
  dismissStoryCard();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  togglePopup(2);
  map.flyTo({
    center: coordinates,
    zoom: 18,
    pitch: document.body.dataset.mapView === "2d" ? 0 : 60,
    bearing: 0,
    duration: reduceMotion ? 0 : duration,
    essential: false,
    offset: window.mapReader?.offset() || [0, 0],
  });
  fillShopDetail(feature.properties);
}

function distanceBetweenPlaces(origin, target) {
  const averageLatitude = ((origin[1] + target[1]) / 2) * (Math.PI / 180);
  const longitudeDistance = (target[0] - origin[0]) * Math.cos(averageLatitude);
  const latitudeDistance = target[1] - origin[1];
  return Math.hypot(longitudeDistance, latitudeDistance) * 111320;
}

function formatNearbyDistance(meters) {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function renderNearbyDiscoveries(shopProps) {
  const section = document.getElementById("nearbySection");
  const list = document.getElementById("nearbyList");
  if (!section || !list) return;

  const originFeature = allShopFeatures.find(
    (feature) => feature.properties === shopProps,
  );
  const origin = originFeature?.geometry?.coordinates;
  if (!originFeature || !Array.isArray(origin)) {
    section.hidden = true;
    list.innerHTML = "";
    return;
  }

  const nearby = allShopFeatures
    .filter((feature) => feature !== originFeature && Array.isArray(feature.geometry?.coordinates))
    .map((feature) => ({
      feature,
      distance: distanceBetweenPlaces(origin, feature.geometry.coordinates),
    }))
    .filter((item) => item.distance >= 8 && item.distance <= 1600)
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 3);

  if (nearby.length === 0) {
    section.hidden = true;
    list.innerHTML = "";
    return;
  }

  list.innerHTML = nearby
    .map(({ feature, distance }) => {
      const properties = feature.properties || {};
      const category = feature._category === "food" ? "food" : "entertain";
      const meta = getPlaceCoverMeta(properties, category);
      const featureIndex = allShopFeatures.indexOf(feature);
      return `
        <button class="nearby-place" type="button" data-feature-index="${featureIndex}" aria-label="查看${escapeHtml(meta.name)}，直线距离${formatNearbyDistance(distance)}">
          <i class="nearby-place-seal nearby-place-seal--${category}" aria-hidden="true">${meta.glyph}</i>
          <span>
            <strong>${escapeHtml(meta.name)}</strong>
            <small>${escapeHtml(meta.type)} · 直线距离，仅供参考</small>
          </span>
          <em>${formatNearbyDistance(distance)}</em>
        </button>
      `;
    })
    .join("");
  list.onclick = (event) => {
    const button = event.target.closest(".nearby-place");
    if (!button) return;
    const feature = allShopFeatures[Number(button.dataset.featureIndex)];
    if (feature) openShopFeature(feature, 900);
  };
  section.hidden = false;
}

// 点击左侧菜单：打开右侧面板并切换内容
function togglePopup(num) {
  setRightPanelOpen(true);

  const titleMap = {
    1: "店铺总览",
    2: "店铺介绍",
    3: "交通路线",
  };
  document.getElementById("panelTitle").innerText = titleMap[num];

  // 隐藏全部内容块，只展示选中项
  document.querySelectorAll(".content-block").forEach((block) => {
    block.style.display = "none";
  });
  document.querySelector(`.content-block[data-id="${num}"]`).style.display =
    "block";
  document.querySelectorAll(".menu-item").forEach((item, index) => {
    item.classList.toggle("active", index === num - 1);
  });
}

// ========== 读取 xlsx 菜谱数据 ==========
function ensureXlsxLibrary() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (xlsxLibraryPromise) return xlsxLibraryPromise;

  xlsxLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.bootcdn.net/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    script.onload = () =>
      window.XLSX
        ? resolve(window.XLSX)
        : reject(new Error("SheetJS 未正确初始化"));
    script.onerror = () => reject(new Error("SheetJS 加载失败"));
    document.head.appendChild(script);
  });
  return xlsxLibraryPromise;
}

function loadMenuData() {
  return ensureXlsxLibrary()
    .then(() => fetch("./menu.xlsx"))
    .then((res) => {
      if (!res.ok) throw new Error("menu.xlsx 不存在或无法读取");
      return res.arrayBuffer();
    })
    .then((buf) => {
      const workbook = XLSX.read(buf, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      // 表头：店铺名称 | 菜品名称 | 价格 | 图片
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
      menuData = rows.map((row) => ({
        shop: String(row["店铺名称"] || "").trim(),
        name: String(row["菜品名称"] || "").trim(),
        price: row["价格"] !== undefined ? String(row["价格"]).trim() : "",
        image: String(row["图片"] || "").trim(),
      }));
      menuLoaded = true;
      console.log(`菜谱加载成功，共 ${menuData.length} 条菜品`);
    })
    .catch((err) => {
      console.warn("菜谱 xlsx 读取失败（不影响其他功能）：", err);
      menuLoaded = true; // 标记为已尝试，避免重复加载
    });
}

// ========== 渲染指定店铺的菜谱 ==========
function renderMenu(shopName) {
  const section = document.getElementById("menuSection");
  const grid = document.getElementById("menuGrid");
  if (!shopName) {
    section.style.display = "none";
    return;
  }
  // 按店铺名称过滤（去掉首尾空格后精确匹配）
  const shopDishes = menuData.filter((d) => d.shop === shopName.trim());
  currentShopAllDishes = shopDishes; //缓存全部菜品给弹窗

  // 没有菜谱数据 → 隐藏整个菜谱区
  if (shopDishes.length === 0) {
    section.style.display = "none";
    grid.innerHTML = "";
    return;
  }
  section.style.display = "block";

  //最多展示6个
  const showMax = 6;
  const showList = shopDishes.slice(0, showMax);
  const hasMore = shopDishes.length > showMax;

  let html = "";
  showList.forEach((dish) => {
    html += createDishCardMarkup(dish);
  });

  // 如果超过6个，追加查看全部按钮
  if (hasMore) {
    html += `<div class="menu-more-btn-wrap"><button class="menu-more-btn" type="button">查看全部菜品（共${shopDishes.length}道）</button></div>`;
  }

  grid.innerHTML = html;
  hydrateDishImages(grid);
}

//打开菜品弹窗
function openMenuModal() {
  const modal = document.getElementById("menuFullModal");
  const grid = document.getElementById("modalMenuGrid");
  if (!currentShopAllDishes || currentShopAllDishes.length === 0) {
    return;
  }
  let html = "";
  currentShopAllDishes.forEach((dish) => {
    html += createDishCardMarkup(dish);
  });
  grid.innerHTML = html;
  hydrateDishImages(grid);
  modal.classList.add("open");
}

//关闭菜品弹窗
function closeMenuModal() {
  const modal = document.getElementById("menuFullModal");
  modal.classList.remove("open");
}

// 填充店铺介绍面板内容
function fillShopDetail(shopProps) {
  currentShopData = shopProps;
  // 1. 修改面板顶部大标题
  document.getElementById("panelTitle").innerText =
    shopProps["名称"] || "未知店铺";
  // 2. 店铺介绍区块的店名（绑定id#shopNameText）
  document.getElementById("shopNameText").innerText =
    shopProps["名称"] || "未知店铺";

  // ----处理店铺图片----
  const imgBox = document.getElementById("shopImageBox");
  const imgSrc = shopProps["图片"];
  const detailCategory = isFoodFeature({ properties: shopProps }) ? "food" : "entertain";
  imgBox.innerHTML = createPlaceCoverMarkup(shopProps, detailCategory, "detail");
  const placeCover = imgBox.querySelector(".place-cover");
  if (imgSrc && imgSrc.trim() !== "") {
    const img = new Image();
    const originalImage = imgSrc.trim();
    const optimizedImage = getShopImageVariant(originalImage, "optimized");
    img.className = "shop-detail-img";
    img.decoding = "async";
    img.fetchPriority = "high";
    img.onload = function () {
      this.classList.add("is-loaded");
      if (placeCover) placeCover.hidden = true;
    };
    //图片加载失败也显示占位
    img.onerror = function () {
      if (this.src.includes("/images/optimized/") && originalImage !== optimizedImage) {
        this.onerror = () => {
          this.hidden = true;
          if (placeCover) placeCover.hidden = false;
        };
        this.src = originalImage;
        return;
      }
      this.hidden = true;
      if (placeCover) placeCover.hidden = false;
    };
    imgBox.appendChild(img);
    img.src = optimizedImage;
  }

  // 3. 结构化信息列表渲染 —— 已移除经纬度
  const infoWrapper = document.getElementById("shopInfoList");
  const infoData = [
    { label: "店铺类型", value: getShopValue(shopProps, ["类型"]) },
    { label: "地址", value: getShopValue(shopProps, ["地址"]) },
    {
      label: "联系电话",
      value: getShopValue(shopProps, ["联系电话", "联系电"]),
    },
    {
      label: "人均消费",
      value: getShopValue(shopProps, ["人均消费", "人均消"]),
    },
    {
      label: "综合评分",
      value: getShopValue(shopProps, ["综合评分", "综合评"]),
    },
  ];

  let htmlStr = "";
  infoData.forEach((item) => {
    htmlStr += `
    <div class="info-item">
      <span class="info-label">${item.label}</span>
      <span class="info-value">${item.value}</span>
    </div>
    `;
  });
  infoWrapper.innerHTML = htmlStr;
  renderNearbyDiscoveries(shopProps);

  // 4. 渲染菜谱（仅美食店铺且有数据时显示）
  const shopType = (shopProps["类型"] || "").toString();
  const shopName = shopProps["名称"] || "";
  // 判断是否为美食类店铺（类型字段包含"美食"或"餐"或"饮"等关键词）
  const isFoodShop =
    /美食|餐|饮|面|饭|菜|茶|咖啡|奶茶|烧烤|火锅|小吃|甜品|烘焙/.test(shopType);

  if (isFoodShop && shopName) {
    // 如果 xlsx 还没加载完，等加载完再渲染
    if (menuLoaded) {
      renderMenu(shopName);
    } else {
      loadMenuData().then(() => renderMenu(shopName));
    }
  } else {
    // 非美食店铺：隐藏菜谱区
    document.getElementById("menuSection").style.display = "none";
  }
}

// 关闭右侧面板
function closeRightPanel() {
  setRightPanelOpen(false);
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });
}

/**
 * 渲染店铺总览列表
 * @param {Array} shopList feature数组
 */
const SMART_SEARCH_TAGS = [
  {
    id: "milk-tea",
    label: "奶茶",
    queries: ["奶茶", "茶饮", "果茶", "喝点甜的"],
    pattern: /奶茶|茶饮|果茶|烧仙草|冰城|茶百道|益禾堂|古茗|书亦|霸王茶姬|蜜雪/,
  },
  {
    id: "late-night",
    label: "夜宵",
    queries: ["夜宵", "宵夜", "晚上吃", "深夜食堂"],
    pattern: /烧烤|烤肉|串串|火锅|炸串|小龙虾|花甲|卤味|酒吧|粉面|米粉|夜宵/,
  },
  {
    id: "photo",
    label: "适合拍照",
    queries: ["适合拍照", "拍照", "出片", "打卡"],
    pattern: /咖啡|甜品|蛋糕|书店|公园|艺术|文创|景区|岳麓山|湘江|图书馆|博物馆|美术馆|学生活动中心|广场|摄影|影城/,
  },
  {
    id: "breakfast",
    label: "早餐",
    queries: ["早餐", "早点", "早饭"],
    pattern: /早餐|包子|馒头|米粉|面馆|粥|豆浆|粉面|食堂/,
  },
  {
    id: "coffee",
    label: "咖啡",
    queries: ["咖啡", "咖啡店", "下午茶"],
    pattern: /咖啡|coffee|甜品|蛋糕|烘焙/i,
  },
  {
    id: "gathering",
    label: "适合聚餐",
    queries: ["聚餐", "多人吃", "同学聚会"],
    pattern: /餐厅|饭店|餐馆|菜馆|火锅|烤肉|湘菜|料理|清真|食堂/,
  },
  {
    id: "sports",
    label: "运动",
    queries: ["运动", "打球", "锻炼", "健身"],
    pattern: /体育|运动|球场|篮球|乒乓|健身|游泳|田径/,
  },
  {
    id: "campus",
    label: "校园",
    queries: ["校园", "师大", "湖南师大"],
    pattern: /湖南师范大学|师大|校区|学生|教学|图书馆|体育馆/,
  },
];

function normalizeSearchToken(value) {
  return normalizeText(value)
    .normalize("NFKC")
    .replace(/[\s·•—_\-，。！？、；：,.!?;:'"“”‘’()（）【】\[\]]+/g, "");
}

function parseSearchIntent(value) {
  const raw = normalizeText(value);
  let compact = normalizeSearchToken(raw);
  const near = /我附近|附近有什么|附近的|离我近|就近/.test(compact);
  const alongRoute = /沿路线|沿路|顺路|路上有什么|路线附近/.test(compact);
  const tags = SMART_SEARCH_TAGS.filter((tag) =>
    tag.queries.some((query) => compact.includes(normalizeSearchToken(query))),
  );

  SMART_SEARCH_TAGS.forEach((tag) => {
    tag.queries.forEach((query) => {
      compact = compact.replaceAll(normalizeSearchToken(query), "");
    });
  });
  [
    "我附近",
    "附近有什么",
    "附近的",
    "离我近",
    "就近",
    "沿路线",
    "沿路",
    "顺路",
    "路上有什么",
    "路线附近",
    "我想找",
    "帮我找",
    "找一家",
    "找一个",
    "有什么",
    "适合",
    "哪里有",
    "店铺",
    "店",
  ].forEach((word) => {
    compact = compact.replaceAll(normalizeSearchToken(word), "");
  });

  return { raw, term: compact, tags, near, alongRoute };
}

function getFeatureSearchMeta(feature) {
  if (feature._searchMeta) return feature._searchMeta;
  const props = feature.properties || {};
  const name = String(props["名称"] || "").trim();
  const type = String(props["类型"] || "").trim();
  const address = String(props["地址"] || "").trim();
  const pinyin = window.SHOP_PINYIN_INDEX?.[name] || ["", ""];
  const searchable = `${name} ${type} ${address}`;
  const tagSource = `${name} ${type}`;
  feature._searchMeta = {
    name,
    type,
    address,
    nameToken: normalizeSearchToken(name),
    typeToken: normalizeSearchToken(type),
    addressToken: normalizeSearchToken(address),
    allToken: normalizeSearchToken(searchable),
    pinyin: normalizeSearchToken(pinyin[0]),
    initials: normalizeSearchToken(pinyin[1]),
    tags: SMART_SEARCH_TAGS.filter((tag) => tag.pattern.test(tagSource)),
  };
  return feature._searchMeta;
}

function editDistance(left, right, stopAt = 3) {
  if (Math.abs(left.length - right.length) > stopAt) return stopAt + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    let rowMin = row;
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[column]);
    }
    if (rowMin > stopAt) return stopAt + 1;
    previous = current;
  }
  return previous[right.length];
}

function fuzzyNameDistance(term, name) {
  if (!term || !name) return Infinity;
  if (term.length < 2) return Infinity;
  const allowed = term.length <= 4 ? 1 : 2;
  let best = editDistance(term, name, allowed);
  const minWindow = Math.max(1, term.length - allowed);
  const maxWindow = Math.min(name.length, term.length + allowed);
  for (let size = minWindow; size <= maxWindow && best > 0; size += 1) {
    for (let start = 0; start + size <= name.length && best > 0; start += 1) {
      best = Math.min(best, editDistance(term, name.slice(start, start + size), allowed));
    }
  }
  return best <= allowed ? best : Infinity;
}

function getBusinessState(feature) {
  const props = feature.properties || {};
  const value = String(props["营业时间"] || props["营业时段"] || "").trim();
  const match = value.match(/(\d{1,2}):(\d{2})\s*[-至—]\s*(\d{1,2}):(\d{2})/);
  if (!match) return { known: false, open: false, label: "时间待确认" };
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = Number(match[1]) * 60 + Number(match[2]);
  let end = Number(match[3]) * 60 + Number(match[4]);
  if (end <= start) end += 24 * 60;
  const comparable = minutes < start && end > 24 * 60 ? minutes + 24 * 60 : minutes;
  const open = comparable >= start && comparable <= end;
  return { known: true, open, label: open ? "营业中" : "已打烊" };
}

function getCurrentSearchOrigin() {
  if (Array.isArray(searchOrigin)) return searchOrigin;
  const center = map.getCenter();
  return [center.lng, center.lat];
}

function distanceToRoute(coordinates, route) {
  if (!Array.isArray(route) || route.length < 2) return Infinity;
  const latitude = coordinates[1] * (Math.PI / 180);
  const scaleX = Math.cos(latitude) * 111320;
  const scaleY = 111320;
  let best = Infinity;
  for (let index = 1; index < route.length; index += 1) {
    const start = route[index - 1];
    const end = route[index];
    const ax = (start[0] - coordinates[0]) * scaleX;
    const ay = (start[1] - coordinates[1]) * scaleY;
    const bx = (end[0] - coordinates[0]) * scaleX;
    const by = (end[1] - coordinates[1]) * scaleY;
    const dx = bx - ax;
    const dy = by - ay;
    const denominator = dx * dx + dy * dy || 1;
    const ratio = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / denominator));
    best = Math.min(best, Math.hypot(ax + ratio * dx, ay + ratio * dy));
  }
  return best;
}

function scoreSearchFeature(feature, intent) {
  const meta = getFeatureSearchMeta(feature);
  const origin = getCurrentSearchOrigin();
  const distance = distanceBetweenPlaces(origin, feature.geometry.coordinates);
  const routeDistance = distanceToRoute(feature.geometry.coordinates, activeSmartRoute);
  const business = getBusinessState(feature);
  const matchedTags = intent.tags.filter((tag) =>
    meta.tags.some((featureTag) => featureTag.id === tag.id),
  );

  if (intent.tags.length && matchedTags.length !== intent.tags.length) return null;
  const hasRoute = activeSmartRoute.length >= 2;
  if ((currentSearchMode === "route" || intent.alongRoute) && hasRoute && routeDistance > 360) {
    return null;
  }

  let score = 0;
  const term = intent.term;
  if (term) {
    if (meta.nameToken === term) score = 140;
    else if (meta.nameToken.startsWith(term)) score = 122;
    else if (meta.nameToken.includes(term)) score = 112;
    else if (meta.pinyin.startsWith(term)) score = 106;
    else if (meta.initials.startsWith(term)) score = 102;
    else if (meta.pinyin.includes(term)) score = 94;
    else if (meta.typeToken.includes(term)) score = 86;
    else if (meta.addressToken.includes(term)) score = 72;
    else {
      const fuzzyDistance = fuzzyNameDistance(term, meta.nameToken);
      if (!Number.isFinite(fuzzyDistance)) return null;
      score = 70 - fuzzyDistance * 12;
    }
  } else if (intent.tags.length) {
    score = 86 + matchedTags.length * 7;
  } else {
    score = 1;
  }

  const nearby = currentSearchMode === "nearby" || intent.near;
  if (nearby) score += Math.max(0, 34 - distance / 90);
  else score += Math.max(0, 6 - distance / 900);
  if ((currentSearchMode === "route" || intent.alongRoute) && hasRoute) {
    score += Math.max(0, 28 - routeDistance / 18);
  }
  if (business.known) score += business.open ? 7 : -5;
  const rating = Number(
    feature.properties?.["综合评分"] ?? feature.properties?.["综合评"],
  );
  if (Number.isFinite(rating)) score += Math.max(0, Math.min(5, rating)) * 1.4;

  return { feature, score, distance, routeDistance, business, matchedTags };
}

function clearSearchMarkerRanks() {
  allShopFeatures.forEach((feature) => {
    delete feature._searchRank;
    feature._markerDom?.classList.remove("is-search-result");
    feature._markerDom?.removeAttribute("data-search-rank");
  });
}

function applySearchMarkerRanks(results, active) {
  clearSearchMarkerRanks();
  document.body.classList.toggle("smart-search-active", active);
  if (!active) return;
  results.slice(0, SEARCH_RESULT_MARKER_LIMIT).forEach((feature, index) => {
    feature._searchRank = index + 1;
    feature._markerDom?.classList.add("is-search-result");
    feature._markerDom?.setAttribute("data-search-rank", String(index + 1));
  });
}

function fitSearchResults(features) {
  const coordinates = features
    .slice(0, 12)
    .map((feature) => feature.geometry?.coordinates)
    .filter(Array.isArray);
  if (!coordinates.length) return;
  if (coordinates.length === 1) {
    map.easeTo({ center: coordinates[0], zoom: 17.2, duration: 800, offset: window.mapReader?.offset() || [0, 0] });
    return;
  }
  const bounds = coordinates.reduce(
    (nextBounds, point) => nextBounds.extend(point),
    new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
  );
  map.fitBounds(bounds, { padding: window.mapReader?.padding() || 96, maxZoom: 17.2, duration: 900 });
}

function updateSmartSearchActions() {
  const active = Boolean(currentSearchKeyword.trim()) || currentSearchMode !== "default";
  const routeButton = document.getElementById("createSearchRoute");
  const nearbyButton = document.getElementById("searchNearby");
  const alongButton = document.getElementById("searchAlongRoute");
  if (routeButton) routeButton.disabled = !active || currentSearchResults.length < 2;
  nearbyButton?.setAttribute("aria-pressed", String(currentSearchMode === "nearby"));
  alongButton?.setAttribute("aria-pressed", String(currentSearchMode === "route"));
}

function renderSearchSuggestions(scored, intent) {
  const suggestions = document.getElementById("shopSearchSuggestions");
  if (!suggestions) return;
  const hasInput = Boolean(currentSearchKeyword.trim());
  if (!hasInput || currentSearchMode === "road") {
    suggestions.hidden = true;
    suggestions.innerHTML = "";
    return;
  }
  const tagHint = intent.tags.length
    ? `<div class="search-intent-hint"><span>已读懂</span>${intent.tags.map((tag) => `<em>${escapeHtml(tag.label)}</em>`).join("")}${intent.near ? "<em>按距离</em>" : ""}</div>`
    : "";
  const inputToken = normalizeSearchToken(currentSearchKeyword);
  const roadHints = (window.MapReading?.findRoads(currentSearchKeyword) || [])
    .map(road => `<button class="search-suggestion search-suggestion--road" type="button" data-road-name="${escapeHtml(road.name)}"><b>路</b><span><strong>${escapeHtml(road.name)}</strong><small>高亮道路 · 查看道路附近地点</small></span></button>`).join("");
  const categoryHints = SMART_SEARCH_TAGS.filter((tag) =>
    tag.queries.some((query) => {
      const queryToken = normalizeSearchToken(query);
      return inputToken && (queryToken.startsWith(inputToken) || inputToken.startsWith(queryToken));
    }),
  )
    .slice(0, 2)
    .map((tag) => `<button class="search-suggestion search-suggestion--category" type="button" data-search-category="${escapeHtml(tag.label)}"><i class="fa fa-tags" aria-hidden="true"></i><span><strong>${escapeHtml(tag.label)}类地点</strong><small>按自然语言标签继续搜索</small></span></button>`)
    .join("");
  const places = scored
    .slice(0, 5)
    .map(({ feature, distance }, index) => {
      const meta = getFeatureSearchMeta(feature);
      return `<button class="search-suggestion" type="button" role="option" data-feature-index="${allShopFeatures.indexOf(feature)}"><b>${String(index + 1).padStart(2, "0")}</b><span><strong>${escapeHtml(meta.name)}</strong><small>${escapeHtml(meta.type.split(";").slice(-1)[0] || "城市地点")} · ${formatNearbyDistance(distance)}</small></span></button>`;
    })
    .join("");
  const routeHint = scored.length >= 2
    ? `<button class="search-suggestion search-suggestion--route" type="button" data-search-command="route"><i class="fa fa-map-signs" aria-hidden="true"></i><span><strong>路线建议</strong><small>把前几处串成一段短途漫游</small></span></button>`
    : "";
  suggestions.innerHTML = `${roadHints}${tagHint}${categoryHints}${places}${routeHint || (!places && !roadHints ? '<div class="search-no-suggestion">换个说法试试，可搜索道路、拼音与近似店名</div>' : "")}`;
  suggestions.hidden = false;
}

function applyShopOverviewFilters(options = {}) {
  const intent = parseSearchIntent(currentSearchKeyword);
  const searchActive = Boolean(currentSearchKeyword.trim()) || currentSearchMode !== "default";
  const scored = allShopFeatures
    .filter((feature) => {
      return (
        currentOverviewFilter === "all" ||
        (currentOverviewFilter === "food" && isFoodFeature(feature)) ||
        (currentOverviewFilter === "entertain" && !isFoodFeature(feature))
      );
    })
    .map((feature) => {
      if (currentSearchMode === "road" && window.mapReader?.selectedRoad) {
        const distance = window.MapReading.distanceToRoad(feature.geometry.coordinates, window.mapReader.selectedRoad);
        return distance <= 120 ? { feature, score: -distance, distance, business: getBusinessState(feature), matchedTags: [] } : null;
      }
      return scoreSearchFeature(feature, intent);
    })
    .filter(Boolean);

  if (searchActive) {
    scored.sort((left, right) => right.score - left.score || left.distance - right.distance);
  }
  const seenResults = new Set();
  const uniqueScored = searchActive
    ? scored.filter((item) => {
        const meta = getFeatureSearchMeta(item.feature);
        const [lng, lat] = item.feature.geometry.coordinates;
        const key = `${meta.nameToken}|${lng.toFixed(3)}|${lat.toFixed(3)}`;
        if (seenResults.has(key)) return false;
        seenResults.add(key);
        return true;
      })
    : scored;
  currentSearchResults = uniqueScored.map((item) => {
    item.feature._searchDistance = item.distance;
    item.feature._searchBusiness = item.business;
    item.feature._matchedSearchTags = item.matchedTags;
    return item.feature;
  });
  applySearchMarkerRanks(currentSearchResults, searchActive);
  renderShopOverviewList(currentSearchResults);
  renderSearchSuggestions(uniqueScored, intent);
  updateSmartSearchActions();
  refreshShopClusters();
  if (options.focusMap && searchActive) fitSearchResults(currentSearchResults);
  return currentSearchResults;
}

function setSearchStatus(message) {
  const status = document.getElementById("shopResultStatus");
  if (status) status.innerHTML = message;
}

function initShopSearch() {
  const input = document.getElementById("shopSearchInput");
  const searchButton = document.getElementById("shopSearchButton");
  const clearButton = document.getElementById("shopSearchClear");
  const suggestions = document.getElementById("shopSearchSuggestions");
  if (!input || !searchButton || !clearButton) return;

  const runSearch = (focusMap = false) => {
    window.clearTimeout(searchTimer);
    currentSearchKeyword = input.value;
    clearButton.hidden = !input.value && currentSearchMode === "default";
    const exactRoad = window.MapReading?.findRoads(input.value).find(road => road.name === input.value.trim());
    if (focusMap && exactRoad && window.mapReader) {
      window.mapReader.selectRoad(exactRoad.name);
      return;
    }
    applyShopOverviewFilters({ focusMap });
    if (focusMap) suggestions.hidden = true;
  };

  let searchTimer = null;
  input.addEventListener("input", () => {
    window.mapReader?.clearRoad();
    currentSearchMode = "default";
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => runSearch(false), 110);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && !suggestions.hidden) {
      event.preventDefault();
      suggestions.querySelector("button")?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      suggestions?.setAttribute("hidden", "");
      runSearch(true);
    } else if (event.key === "Escape") {
      suggestions?.setAttribute("hidden", "");
    }
  });
  input.addEventListener("focus", () => {
    if (currentSearchKeyword.trim()) applyShopOverviewFilters();
  });
  searchButton.addEventListener("click", () => {
    suggestions?.setAttribute("hidden", "");
    runSearch(true);
    input.focus();
  });
  clearButton.addEventListener("click", () => {
    window.mapReader?.clearRoad();
    input.value = "";
    currentSearchMode = "default";
    searchOrigin = null;
    clearSmartSearchRoute();
    runSearch(false);
    input.focus();
  });
  suggestions?.addEventListener("click", (event) => {
    const roadName = event.target.closest("[data-road-name]")?.dataset.roadName;
    if (roadName) {
      window.clearTimeout(searchTimer);
      suggestions.hidden = true;
      window.mapReader?.selectRoad(roadName);
      return;
    }
    const command = event.target.closest("[data-search-command]")?.dataset.searchCommand;
    if (command === "route") {
      createShortTourRoute();
      suggestions.hidden = true;
      return;
    }
    const category = event.target.closest("[data-search-category]")?.dataset.searchCategory;
    if (category) {
      input.value = category;
      currentSearchKeyword = category;
      suggestions.hidden = true;
      applyShopOverviewFilters({ focusMap: true });
      return;
    }
    const option = event.target.closest("[data-feature-index]");
    if (!option) return;
    const feature = allShopFeatures[Number(option.dataset.featureIndex)];
    if (!feature) return;
    input.value = getFeatureSearchMeta(feature).name;
    currentSearchKeyword = input.value;
    suggestions.hidden = true;
    applyShopOverviewFilters();
    openShopFeature(feature, 850);
  });
  suggestions?.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.stopPropagation(); input.focus(); suggestions.hidden = true; return; }
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...suggestions.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement);
    buttons[(index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
  });
  // Use click rather than pointerdown: collapsing the suggestion list while the
  // pointer is still held would move the action buttons and cause click-through.
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper, .smart-search-suggestions")) {
      suggestions?.setAttribute("hidden", "");
    }
  });

  document.getElementById("searchNearby")?.addEventListener("click", () => {
    if (currentSearchMode === "road") { input.value = ""; currentSearchKeyword = ""; }
    window.mapReader?.clearRoad();
    currentSearchMode = "nearby";
    clearButton.hidden = false;
    const useMapCenter = (notice) => {
      const center = map.getCenter();
      searchOrigin = [center.lng, center.lat];
      searchOriginLabel = "当前地图中心";
      applyShopOverviewFilters({ focusMap: true });
      if (notice) setSearchStatus(`${notice}，已按<strong>当前地图中心</strong>排序。`);
    };
    if (!navigator.geolocation) {
      useMapCenter("当前浏览器不支持定位");
      return;
    }
    setSearchStatus("正在读取你的位置…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        searchOrigin = [position.coords.longitude, position.coords.latitude];
        searchOriginLabel = "我的位置";
        applyShopOverviewFilters({ focusMap: true });
      },
      () => useMapCenter("未获得定位权限"),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 180000 },
    );
  });
  document.getElementById("searchAlongRoute")?.addEventListener("click", () => {
    if (currentSearchMode === "road") { input.value = ""; currentSearchKeyword = ""; }
    window.mapReader?.clearRoad();
    if (activeSmartRoute.length < 2) {
      if (!currentSearchKeyword.trim() || currentSearchResults.length < 2) {
        setSearchStatus("请先搜索一类地点，再生成短途漫游路线。");
        return;
      }
      createShortTourRoute(false);
    }
    currentSearchMode = "route";
    clearButton.hidden = false;
    applyShopOverviewFilters({ focusMap: true });
  });
  document.getElementById("createSearchRoute")?.addEventListener("click", () => {
    createShortTourRoute();
  });
  document.getElementById("clearSearchRoute")?.addEventListener("click", () => {
    clearSmartSearchRoute();
    if (currentSearchMode === "route") currentSearchMode = "default";
    applyShopOverviewFilters();
  });
}

function ensureSmartSearchRouteLayers() {
  if (smartSearchRouteInitialized || !map.isStyleLoaded()) return;
  map.addSource("smart-search-route", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addSource("smart-search-stops", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "smart-search-route-halo",
    type: "line",
    source: "smart-search-route",
    paint: {
      "line-color": "#fff8ec",
      "line-width": ["interpolate", ["linear"], ["zoom"], 14, 5, 18, 9],
      "line-opacity": 0.78,
      "line-blur": 1.2,
    },
  });
  map.addLayer({
    id: "smart-search-route-line",
    type: "line",
    source: "smart-search-route",
    paint: {
      "line-color": "#9b4431",
      "line-width": ["interpolate", ["linear"], ["zoom"], 14, 2, 18, 3.6],
      "line-opacity": 0.88,
      "line-dasharray": [1.5, 1.2],
    },
  });
  map.addLayer({
    id: "smart-search-route-stops",
    type: "circle",
    source: "smart-search-stops",
    paint: {
      "circle-radius": 5,
      "circle-color": "#f8efe2",
      "circle-stroke-color": "#9b4431",
      "circle-stroke-width": 2,
    },
  });
  smartSearchRouteInitialized = true;
}

function setSmartRouteData(routeFeatures) {
  ensureSmartSearchRouteLayers();
  if (!smartSearchRouteInitialized) return;
  const coordinates = routeFeatures.map((feature) => feature.geometry.coordinates);
  map.getSource("smart-search-route")?.setData({
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  });
  map.getSource("smart-search-stops")?.setData({
    type: "FeatureCollection",
    features: routeFeatures.map((feature, index) => ({
      type: "Feature",
      properties: { rank: index + 1 },
      geometry: feature.geometry,
    })),
  });
}

function orderShortRoute(features) {
  const remaining = features.slice(0, 12);
  const ordered = [];
  let cursor = getCurrentSearchOrigin();
  while (remaining.length && ordered.length < 5) {
    remaining.sort(
      (left, right) =>
        distanceBetweenPlaces(cursor, left.geometry.coordinates) -
        distanceBetweenPlaces(cursor, right.geometry.coordinates),
    );
    const next = remaining.shift();
    if (
      !ordered.length ||
      distanceBetweenPlaces(ordered.at(-1).geometry.coordinates, next.geometry.coordinates) > 35
    ) {
      ordered.push(next);
      cursor = next.geometry.coordinates;
    }
  }
  return ordered;
}

function createShortTourRoute(focusMap = true) {
  const routeFeatures = orderShortRoute(currentSearchResults);
  if (routeFeatures.length < 2) {
    setSearchStatus("至少需要两个匹配地点，才能生成短途漫游。");
    return;
  }
  activeSmartRoute = routeFeatures.map((feature) => feature.geometry.coordinates);
  setSmartRouteData(routeFeatures);
  allShopFeatures.forEach((feature) => {
    feature._markerDom?.classList.remove("is-route-stop");
    feature._markerDom?.removeAttribute("data-route-rank");
  });
  routeFeatures.forEach((feature, index) => {
    feature._markerDom?.classList.add("is-route-stop");
    feature._markerDom?.setAttribute("data-route-rank", String(index + 1));
  });
  const totalDistance = activeSmartRoute.slice(1).reduce(
    (sum, point, index) => sum + distanceBetweenPlaces(activeSmartRoute[index], point),
    0,
  );
  const summary = document.getElementById("smartRouteSummary");
  if (summary) {
    summary.innerHTML = `<span>游览顺序示意 · 非步行导航</span><strong>${routeFeatures.length} 站 · 站间直线距离合计约 ${formatNearbyDistance(totalDistance)}</strong><small>连线不代表可通行道路，实际路线、出入口和距离请以现场及导航地图为准。</small>`;
    summary.hidden = false;
  }
  const clearButton = document.getElementById("clearSearchRoute");
  if (clearButton) clearButton.hidden = false;
  if (focusMap) fitSearchResults(routeFeatures);
}

function clearSmartSearchRoute() {
  activeSmartRoute = [];
  allShopFeatures.forEach((feature) => {
    feature._markerDom?.classList.remove("is-route-stop");
    feature._markerDom?.removeAttribute("data-route-rank");
  });
  if (smartSearchRouteInitialized) {
    map.getSource("smart-search-route")?.setData({
      type: "FeatureCollection",
      features: [],
    });
    map.getSource("smart-search-stops")?.setData({
      type: "FeatureCollection",
      features: [],
    });
  }
  const summary = document.getElementById("smartRouteSummary");
  if (summary) {
    summary.hidden = true;
    summary.innerHTML = "";
  }
  const clearButton = document.getElementById("clearSearchRoute");
  if (clearButton) clearButton.hidden = true;
}

function renderShopOverviewList(shopList, limit = SHOP_LIST_PAGE_SIZE) {
  const ul = document.getElementById("shopOverviewList");
  const status = document.getElementById("shopResultStatus");
  const total = allShopFeatures.length;
  const keyword = currentSearchKeyword.trim();
  const searchActive = Boolean(keyword) || currentSearchMode !== "default";
  if (status) {
    const searchLabel = keyword
      ? `与“${escapeHtml(keyword)}”相关`
      : currentSearchMode === "nearby"
        ? `${escapeHtml(searchOriginLabel)}附近`
        : currentSearchMode === "route"
          ? "漫游路线沿途"
          : "当前分类";
    status.innerHTML = searchActive
      ? `找到 <strong>${shopList.length}</strong> 处${searchLabel}的地点 · 已按相关度、距离${currentSearchMode === "route" ? "与沿线距离" : ""}综合排序`
      : `当前显示 <strong>${shopList.length}</strong> / ${total} 家店铺`;
  }
  if (!shopList || shopList.length === 0) {
    const emptyText = keyword ? "没有找到匹配的店铺" : "暂无店铺数据";
    ul.innerHTML = `<div class="shop-overview-empty"><i class="fa fa-inbox" style="font-size:26px;margin-bottom:8px;opacity:0.4"></i><div>${emptyText}</div></div>`;
    return;
  }
  const visibleShopList = shopList.slice(0, Math.max(SHOP_LIST_PAGE_SIZE, limit));
  let html = "";
  visibleShopList.forEach((feature, resultIndex) => {
    const props = feature.properties;
    const shopName = props["名称"] || "未知店铺";
    const imgSrc = props["图片"] || "";
    const coords = feature.geometry.coordinates;
    const featureIndex = allShopFeatures.indexOf(feature);
    const safeShopName = escapeHtml(shopName);

    const category = feature._category === "food" ? "food" : "entertain";
    const searchMeta = getFeatureSearchMeta(feature);
    const business = feature._searchBusiness || getBusinessState(feature);
    const tags = (feature._matchedSearchTags?.length
      ? feature._matchedSearchTags
      : searchMeta.tags
    )
      .slice(0, 2)
      .map((tag) => tag.label);
    const metaParts = [];
    if (searchActive && Number.isFinite(feature._searchDistance)) {
      metaParts.push(`${currentSearchMode === "road" ? "距道路" : "直线"} ${formatNearbyDistance(feature._searchDistance)}`);
    }
    if (tags.length) metaParts.push(tags.join(" / "));
    if (business.known) metaParts.push(business.label);
    const resultRank = resultIndex + 1;
    const fallbackHtml = createPlaceCoverMarkup(props, category, "overview");
    let imgHtml = "";
    if (imgSrc && imgSrc.trim()) {
      const hiddenFallback = createPlaceCoverMarkup(props, category, "overview", true);
      const thumbnailSrc = getShopImageVariant(imgSrc.trim(), "thumbs");
      imgHtml = `<img src="${escapeHtml(thumbnailSrc)}" alt="${safeShopName}" loading="lazy" decoding="async" fetchpriority="low" width="360" height="240" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${hiddenFallback}`;
    } else {
      imgHtml = fallbackHtml;
    }

    html += `
    <li class="shop-overview-item" data-feature-index="${featureIndex}" data-lng="${coords[0]}" data-lat="${coords[1]}" tabindex="0">
      ${searchActive ? `<b class="shop-result-rank" aria-label="搜索结果第${resultRank}名">${String(resultRank).padStart(2, "0")}</b>` : ""}
      <div class="shop-overview-img">
        ${imgHtml}
      </div>
      <div class="shop-overview-copy">
        <div class="shop-overview-name" title="${safeShopName}">${safeShopName}</div>
        <small>${escapeHtml(metaParts.join(" · ") || searchMeta.type.split(";").slice(-1)[0] || "城市地点")}</small>
      </div>
      <i class="fa fa-angle-right shop-overview-arrow"></i>
    </li>
    `;
  });
  if (visibleShopList.length < shopList.length) {
    const remaining = shopList.length - visibleShopList.length;
    const nextBatch = Math.min(SHOP_LIST_PAGE_SIZE, remaining);
    html += `
      <div class="shop-overview-more-row">
        <button class="shop-overview-more" id="shopOverviewMore" type="button">
          <span>再展开 ${nextBatch} 家</span>
          <small>尚有 ${remaining} 家 · 按需载入</small>
        </button>
      </div>
    `;
  }
  ul.innerHTML = html;

  if (status && shopList.length > SHOP_LIST_PAGE_SIZE) {
    status.innerHTML += ` · 已载入 <strong>${visibleShopList.length}</strong> 家`;
  }

  //绑定列表项点击事件
  document.querySelectorAll(".shop-overview-item").forEach((item) => {
    const openShop = function () {
      const targetFeat = allShopFeatures[Number(this.dataset.featureIndex)];
      if (!targetFeat) return;
      openShopFeature(targetFeat, 1200);
    };
    item.onclick = openShop;
    item.onkeydown = function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openShop.call(this);
      }
    };
  });
  document.getElementById("shopOverviewMore")?.addEventListener("click", () => {
    renderShopOverviewList(shopList, visibleShopList.length + SHOP_LIST_PAGE_SIZE);
  });
}

// ========== 顶部下拉菜单逻辑 ==========
const dropdownWraps = document.querySelectorAll(".dropdown-wrap");
dropdownWraps.forEach((wrap) => {
  wrap.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownWraps.forEach((w) => {
      if (w !== wrap) w.classList.remove("open");
    });
    wrap.classList.toggle("open");
  });
});

// 点击页面空白关闭所有下拉
document.addEventListener("click", () => {
  dropdownWraps.forEach((w) => w.classList.remove("open"));
});

// 下拉选项点击事件
document.querySelectorAll(".dropdown-option").forEach((opt) => {
  opt.addEventListener("click", (e) => {
    e.stopPropagation();
    const target = opt.dataset.target;
    const lang = opt.dataset.lang;
    //新增筛选参数
    const filter = opt.dataset.filter;

    if (lang) {
      loadLanguage(lang);
    }
    if (target === "sidebar") {
      const side = document.getElementById("sidebar");
      side.classList.toggle("hidden");
    }
    if (target === "popup") {
      const panel = document.getElementById("rightPanel");
      setRightPanelOpen(!panel.classList.contains("open"));
    }
    //处理点位筛选
    if (filter) {
      filterMarkers(filter);
    }
    opt.closest(".dropdown-wrap").classList.remove("open");
  });
});

// 右侧面板内部下拉逻辑
function initInnerDropdown() {
  const select = document.getElementById("shopCategoryFilter");
  if (!select) return;
  select.addEventListener("change", () => {
    currentOverviewFilter = select.value;
    applyShopOverviewFilters();
  });
}

const buildingHeight = ["to-number", ["get", "hight"], 5];
const buildingFloor = ["to-number", ["get", "Floor"], 1];

function buildingColorExpression(mode = "day") {
  const colors =
    mode === "evening"
      ? ["#9c806a", "#b08a67", "#c49569", "#d9ad79"]
      : ["#d9c5a8", "#c9aa86", "#b68d6c", "#9e7059"];
  return [
    "interpolate",
    ["linear"],
    buildingFloor,
    1,
    colors[0],
    6,
    colors[1],
    15,
    colors[2],
    30,
    colors[3],
  ];
}

function roofColorExpression(mode = "day") {
  const colors =
    mode === "evening"
      ? ["#5f4d41", "#745142", "#8b5c47", "#a76e50"]
      : ["#816d5c", "#82634f", "#78513f", "#693e35"];
  return [
    "interpolate",
    ["linear"],
    buildingFloor,
    1,
    colors[0],
    6,
    colors[1],
    15,
    colors[2],
    30,
    colors[3],
  ];
}

const roadBaseWidth = [
  "match",
  ["get", "fclass"],
  ["motorway", "trunk"],
  4.6,
  ["primary", "trunk_link", "motorway_link"],
  3.6,
  ["secondary", "primary_link"],
  2.8,
  ["tertiary", "secondary_link"],
  2.1,
  ["residential", "living_street", "unclassified"],
  1.35,
  ["footway", "path", "steps", "pedestrian", "cycleway"],
  0.75,
  1,
];

const roadWidth = [
  "interpolate",
  ["linear"],
  ["zoom"],
  14,
  ["*", roadBaseWidth, 0.58],
  18,
  ["*", roadBaseWidth, 1.2],
];

const roadCasingWidth = [
  "interpolate",
  ["linear"],
  ["zoom"],
  14,
  ["+", ["*", roadBaseWidth, 0.58], 2.2],
  18,
  ["+", ["*", roadBaseWidth, 1.2], 2.2],
];

// 当前地图只使用本地 GeoJSON 和自定义底图，不需要 Mapbox Token。
const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    light: {
      anchor: "map",
      color: "#fff1d6",
      intensity: 0.48,
      position: [1.35, 155, 48],
    },
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#eee6d7",
        },
      },
    ],
  },
  center: [112.9366, 28.1785],
  zoom: 15.5,
  pitch: 65,
  bearing: -15,
  antialias: true,
});
window.culturalMap = map;

function refreshRoadNameLabels() {
  const zoom = map.getZoom();
  const tourActive = document.body.classList.contains("tour-active");
  if (tourActive || zoom < 14.65) {
    roadNameMarkers.forEach(({ marker }) => marker.getElement().classList.toggle("is-hidden", true));
    return;
  }
  const canvasRect = map.getContainer().getBoundingClientRect();
  const compact = canvasRect.right - canvasRect.left <= 820;
  const maxLabels = compact ? 7 : 14;
  let visibleCount = 0;
  // Batch layout reads before writes; only refresh on map/layout events, never an idle loop.
  const occupied = [...document.querySelectorAll(
    ".header-bar, .map-story-card, .map-context-ribbon, .map-reading-dock, .sidebar, .right-panel, .map-legend, .maplibregl-ctrl-group, .map-orientation-tools, .maplibregl-ctrl-scale, .map-shop-marker.is-active, .smart-search-suggestions, .city-tour-panel.is-visible, .tour-place-photo.is-visible, .tour-map-annotation"
  )].flatMap(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.1 && rect.width && rect.height ? [rect] : [];
  });
  const overlaps = (a, b) => a.left < b.right + 8 && a.right > b.left - 8 && a.top < b.bottom + 8 && a.bottom > b.top - 8;
  const updates = roadNameMarkers.map(({ marker, level, candidates }) => {
    const element = marker.getElement();
    const width = element.offsetWidth, height = element.offsetHeight;
    let placement = null;
    if (!tourActive && visibleCount < maxLabels && zoom >= (level === "primary" ? 14.65 : 16)) {
      // Try the current anchor first to keep a stable label while moving, then real points on the same road.
      for (const coordinates of [marker.getLngLat(), ...(candidates || [])]) {
        const point = map.project(coordinates);
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
        const rect = { left: canvasRect.left + point.x - width / 2, right: canvasRect.left + point.x + width / 2,
          top: canvasRect.top + point.y - height / 2, bottom: canvasRect.top + point.y + height / 2 };
        if (rect.left < canvasRect.left + 8 || rect.right > canvasRect.right - 8 ||
            rect.top < canvasRect.top + 8 || rect.bottom > canvasRect.bottom - 8 ||
            occupied.some(other => overlaps(rect, other))) continue;
        placement = coordinates;
        occupied.push(rect);
        visibleCount++;
        break;
      }
    }
    return { element, marker, placement };
  });
  updates.forEach(({ element, marker, placement }) => {
    if (placement) {
      const current = marker.getLngLat();
      if (Array.isArray(placement) && (current.lng !== placement[0] || current.lat !== placement[1])) marker.setLngLat(placement);
    }
    element.classList.toggle("is-hidden", !placement);
  });
}

let roadLabelRefreshFrame = 0;
function scheduleRoadNameLabels() {
  if (roadLabelRefreshFrame) return;
  roadLabelRefreshFrame = requestAnimationFrame(() => {
    roadLabelRefreshFrame = 0;
    refreshRoadNameLabels();
  });
}

function initRoadNameLabels() {
  if (roadNameMarkers.length) return;
  roadNameMarkers = [...ROAD_NAME_LABELS].sort((a, b) => Number(b.level === "primary") - Number(a.level === "primary")).map((road) => {
    const element = document.createElement("div");
    element.className = `road-name-marker is-hidden road-name-marker--${road.level}`;
    element.setAttribute("aria-hidden", "true");
    element.dataset.roadName = road.name;
    element.innerHTML = `<span>${escapeHtml(road.name)}</span>`;
    const marker = new maplibregl.Marker({
      element,
      anchor: "center",
      pitchAlignment: "viewport",
      rotationAlignment: "viewport",
    })
      .setLngLat(road.coordinates)
      .addTo(map);
    return { marker, level: road.level, candidates: road.candidates };
  });
  scheduleRoadNameLabels();
  map.on("resize", scheduleRoadNameLabels);
  let lastMoveRefresh = 0;
  map.on("move", () => {
    const now = performance.now();
    if (now - lastMoveRefresh < 100) return;
    lastMoveRefresh = now;
    scheduleRoadNameLabels();
  });
  const layoutObserver = new MutationObserver(scheduleRoadNameLabels);
  layoutObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.body.addEventListener("transitionend", event => {
    if (event.target.matches(".right-panel, .sidebar, .map-story-card, .map-reading-dock, .map-context-ribbon")) scheduleRoadNameLabels();
  });
  document.fonts?.ready.then(scheduleRoadNameLabels);
}
// Classic scripts share function bindings with window; keep this the same function.
// Assigning the scheduler here would replace refreshRoadNameLabels and self-schedule forever.
window.refreshRoadNameLabels = refreshRoadNameLabels;

let mapInteractionSettleTimer = null;
function setMapPerformanceMode(interacting) {
  window.clearTimeout(mapInteractionSettleTimer);
  const active = Boolean(interacting);
  document.body.classList.toggle("map-interacting", active);
  document.body.dataset.mapQuality = active ? "interactive" : "full";
  window.setMapEffectsInteracting?.(active);

  if (!active) refreshVisibleShopMarkers();
}

map.on("movestart", () => setMapPerformanceMode(true));
map.on("moveend", () => {
  mapInteractionSettleTimer = window.setTimeout(
    () => setMapPerformanceMode(false),
    140,
  );
});
setMapPerformanceMode(false);

function applyMapAmbience(mode) {
  currentAmbience = mode;
  const evening = mode === "evening";
  document.body.classList.toggle("evening", evening);

  const toggle = document.getElementById("ambienceToggle");
  toggle?.setAttribute("aria-pressed", String(evening));
  const ambienceDescription = evening ? "切换晨光模式" : "切换暮色模式";
  toggle?.setAttribute("aria-label", ambienceDescription);
  toggle?.setAttribute("title", ambienceDescription);
  const toggleLabel = toggle?.querySelector("span");
  const toggleIcon = toggle?.querySelector("i");
  if (toggleLabel) toggleLabel.textContent = evening ? "晨光模式" : "暮色模式";
  if (toggleIcon) {
    toggleIcon.className = evening ? "fa fa-sun-o" : "fa fa-moon-o";
  }

  if (!map.isStyleLoaded()) return;
  const setPaint = (layer, property, value) => {
    if (map.getLayer(layer)) map.setPaintProperty(layer, property, value);
  };

  setPaint("background", "background-color", evening ? "#2e3431" : "#eee6d7");
  setPaint(
    "contours-layer",
    "fill-extrusion-color",
    evening
      ? [
          "interpolate",
          ["linear"],
          ["to-number", ["get", "Z_Mean"], 40],
          40,
          "#3e493f",
          130,
          "#4c5748",
          260,
          "#5b624f",
        ]
      : [
          "interpolate",
          ["linear"],
          ["to-number", ["get", "Z_Mean"], 40],
          40,
          "#e7ead7",
          130,
          "#d7ddc1",
          260,
          "#c5cfaa",
        ],
  );
  setPaint("water-layer", "fill-color", evening ? "#416f70" : "#75a7a2");
  setPaint("water-highlight", "line-color", evening ? "#80a7a5" : "#b7d6cd");
  setPaint("water-motion-layer", "raster-opacity", evening ? 0.74 : 0.86);
  setPaint("roads-casing", "line-color", evening ? "#30302b" : "#f5ecdc");
  setPaint(
    "roads-layer",
    "line-color",
    evening
      ? [
          "match",
          ["get", "fclass"],
          ["motorway", "trunk", "primary"],
          "#d07c5f",
          ["secondary", "tertiary"],
          "#b58a74",
          "#858679",
        ]
      : [
          "match",
          ["get", "fclass"],
          ["motorway", "trunk", "primary"],
          "#a65340",
          ["secondary", "tertiary"],
          "#b77e62",
          "#b1a58d",
        ],
  );
  setPaint("buildings-3d", "fill-extrusion-color", buildingColorExpression(mode));
  setPaint("building-roofs", "fill-extrusion-color", roofColorExpression(mode));
  map.setLight({
    anchor: "map",
    color: evening ? "#ffd29a" : "#fff1d6",
    intensity: evening ? 0.75 : 0.48,
    position: evening ? [1.4, 125, 62] : [1.35, 155, 48],
  });
  applyCulturalLayerMode();
}

function toggleAmbience() {
  currentCulturalHour = currentAmbience === "day" ? 20 : 14;
  applyCulturalHour(currentCulturalHour);
  window.dispatchEvent(
    new CustomEvent("cultural-hour-sync", { detail: { hour: currentCulturalHour } }),
  );
}

const culturalModePalettes = {
  landscape: {
    day: ["#75a7a2", "#c0ddd4", "#9f6853", "#aa8a71", "#aaa48f", ["#d9cdb7", "#c8b496", "#aa8d73", "#8b6d59"], ["#8d7d69", "#806650", "#704c3d", "#5f3d33"]],
    evening: ["#426f70", "#87aaa7", "#b77b65", "#9d8270", "#777d73", ["#897769", "#9b7c63", "#a47b5c", "#ae7955"], ["#574b43", "#674d40", "#79503e", "#8b5942"]],
    opacity: [0.9, 0.72, 0.86],
  },
  culture: {
    day: ["#7d9e99", "#c4d8cf", "#8f493c", "#a66b58", "#aca18d", ["#e0cfb8", "#d1ad8c", "#b77c61", "#934f43"], ["#786b5a", "#82594a", "#874438", "#6f302b"]],
    evening: ["#45686a", "#839c99", "#d17b60", "#ad7865", "#7e7b70", ["#806f65", "#98705d", "#a65f4d", "#b65545"], ["#51463f", "#69483d", "#7c3f35", "#8a372f"]],
    opacity: [0.68, 0.84, 0.97],
  },
  life: {
    day: ["#83a19c", "#bed4cb", "#a73f32", "#bf7655", "#b6a187", ["#e3c9a9", "#d6aa80", "#c3825f", "#a85845"], ["#866b55", "#935843", "#924232", "#7b3028"]],
    evening: ["#3f6669", "#789898", "#ec8b5f", "#ce7d59", "#948272", ["#876e60", "#a16d51", "#bd6846", "#d06a45"], ["#55463e", "#744637", "#8d3c2d", "#a33e2d"]],
    opacity: [0.54, 1, 0.95],
  },
};

function culturalBuildingExpression(colors) {
  return [
    "interpolate",
    ["linear"],
    buildingFloor,
    1,
    colors[0],
    6,
    colors[1],
    15,
    colors[2],
    30,
    colors[3],
  ];
}

function applyCulturalLayerMode() {
  if (!map?.isStyleLoaded()) return;
  const mode = culturalModePalettes[currentCulturalMode] || culturalModePalettes.landscape;
  const palette = mode[currentAmbience] || mode.day;
  const [water, waterLine, roadMain, roadSecondary, roadLocal, buildings, roofs] = palette;
  const [contourOpacity, roadOpacity, buildingOpacity] = mode.opacity;
  const setPaint = (layer, property, value) => {
    if (map.getLayer(layer)) map.setPaintProperty(layer, property, value);
  };

  setPaint("water-layer", "fill-color", water);
  setPaint("water-layer", "fill-opacity", currentCulturalMode === "landscape" ? 0.94 : 0.82);
  setPaint("water-highlight", "line-color", waterLine);
  setPaint("contours-layer", "fill-extrusion-opacity", contourOpacity);
  setPaint("roads-layer", "line-opacity", roadOpacity);
  setPaint("roads-layer", "line-color", [
    "match",
    ["get", "fclass"],
    ["motorway", "trunk", "primary"],
    roadMain,
    ["secondary", "tertiary"],
    roadSecondary,
    roadLocal,
  ]);
  setPaint("buildings-3d", "fill-extrusion-color", culturalBuildingExpression(buildings));
  setPaint("buildings-3d", "fill-extrusion-opacity", buildingOpacity);
  setPaint("building-roofs", "fill-extrusion-color", culturalBuildingExpression(roofs));
  setPaint("building-roofs", "fill-extrusion-opacity", Math.min(0.98, buildingOpacity + 0.01));
}

function applyCulturalMapMode(mode) {
  if (!culturalModePalettes[mode]) return;
  currentCulturalMode = mode;
  document.body.dataset.mapReadingMode = mode;
  if (!map?.isStyleLoaded()) {
    scheduleCulturalSceneRefresh();
    return;
  }
  applyCulturalLayerMode();
}

function applyCulturalHour(hour) {
  currentCulturalHour = ((Math.round(Number(hour)) % 24) + 24) % 24;
  document.body.dataset.culturalHour = String(currentCulturalHour);
  const evening = currentCulturalHour < 6 || currentCulturalHour >= 18;
  applyMapAmbience(evening ? "evening" : "day");
  if (!map?.isStyleLoaded()) {
    scheduleCulturalSceneRefresh();
    return;
  }
  const daylight = Math.max(0, Math.sin(((currentCulturalHour - 5) / 14) * Math.PI));
  const azimuth = 85 + ((currentCulturalHour - 6 + 24) % 24) * 7.5;
  const dusk = currentCulturalHour >= 17 && currentCulturalHour < 20;
  map.setLight({
    anchor: "map",
    color: dusk ? "#ffbd7a" : evening ? "#ffd19d" : "#fff0cf",
    intensity: evening ? 0.7 : 0.38 + daylight * 0.34,
    position: [1.35, azimuth, evening ? 62 : 42 + daylight * 18],
  });
}

function scheduleCulturalSceneRefresh() {
  if (culturalScenePending || !map) return;
  culturalScenePending = true;
  map.once("idle", () => {
    culturalScenePending = false;
    applyCulturalHour(currentCulturalHour);
    applyCulturalLayerMode();
  });
}

window.applyCulturalMapMode = applyCulturalMapMode;
window.applyCulturalHour = applyCulturalHour;

function setupShopClusterLayers() {
  if (shopClusterInitialized || map.getSource("shop-clusters")) return;

  map.addSource("shop-clusters", {
    type: "geojson",
    data: shopClusterGeoJSON(),
    cluster: true,
    clusterMaxZoom: 16,
    clusterRadius: 58,
  });
  map.addLayer({
    id: "shop-cluster-halo",
    type: "circle",
    source: "shop-clusters",
    filter: ["has", "point_count"],
    layout: { visibility: "none" },
    paint: {
      "circle-radius": ["step", ["get", "point_count"], 22, 15, 29, 45, 37],
      "circle-color": "#f4eee3",
      "circle-opacity": 0.34,
      "circle-blur": 0.38,
      "circle-stroke-color": "#b18a4f",
      "circle-stroke-width": 1.2,
      "circle-stroke-opacity": 0.44,
    },
  });
  map.addLayer({
    id: "shop-clusters",
    type: "circle",
    source: "shop-clusters",
    filter: ["has", "point_count"],
    layout: { visibility: "none" },
    paint: {
      "circle-radius": ["step", ["get", "point_count"], 13, 15, 17, 45, 21],
      "circle-color": ["step", ["get", "point_count"], "#a65340", 15, "#8f3428", 45, "#6f2a23"],
      "circle-opacity": 0.9,
      "circle-stroke-color": "#fff8ef",
      "circle-stroke-width": 1.5,
    },
  });
  map.addLayer({
    id: "shop-cluster-single",
    type: "circle",
    source: "shop-clusters",
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: "none" },
    paint: {
      "circle-radius": 8,
      "circle-color": ["match", ["get", "category"], "food", "#8f3428", "#557b70"],
      "circle-stroke-color": "#fff8ef",
      "circle-stroke-width": 1.4,
      "circle-opacity": 0.9,
    },
  });

  const zoomToCluster = (event) => {
    const feature = event.features?.[0];
    if (!feature) return;
    map.easeTo({
      center: feature.geometry.coordinates,
      zoom: Math.min(Math.max(map.getZoom() + 1.7, 16.8), 17.25),
      duration: 900,
      essential: true,
    });
  };
  map.on("click", "shop-clusters", zoomToCluster);
  map.on("click", "shop-cluster-single", zoomToCluster);
  ["shop-clusters", "shop-cluster-single"].forEach((layerId) => {
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  });

  shopClusterInitialized = true;
  refreshShopClusters();
}

// 复位视角按钮
document.getElementById("revestView").addEventListener("click", () => {
  map.flyTo({
    center: [112.9366, 28.1785],
    zoom: 15.5,
    pitch: 65,
    bearing: -15,
  });
});

// 全屏切换
document.getElementById("fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

map.on("load", () => {
  document.body.dataset.mapCoreReadyMs = String(
    Math.round(window.performance.now() - appBootStartedAt),
  );
  // 1. 岳麓山地形：用分层茶绿和更克制的高度塑造山体
  map.addSource("contours", {
    type: "geojson",
    data: "./geojson/contours-scene.geojson?v=20260823-1",
  });
  map.addLayer({
    id: "contours-layer",
    type: "fill-extrusion",
    source: "contours",
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "Z_Mean"], 40],
        40,
        "#e7ead7",
        130,
        "#d7ddc1",
        260,
        "#c5cfaa",
      ],
      "fill-extrusion-height": [
        "*",
        ["max", 0.1, ["-", ["to-number", ["get", "Z_Mean"], 40], 40]],
        0.2,
      ],
      "fill-extrusion-opacity": 0.82,
      "fill-extrusion-vertical-gradient": true,
    },
  });

  // 2. 湘江与湖泊：低饱和青瓷色并增加柔和高光
  map.addSource("water", {
    type: "geojson",
    data: "./geojson/water-scene.geojson?v=20260823-1",
  });
  map.addLayer({
    id: "water-layer",
    type: "fill",
    source: "water",
    paint: {
      "fill-color": "#75a7a2",
      "fill-opacity": 0.9,
      "fill-outline-color": "#b7d6cd",
    },
  });
  map.addLayer({
    id: "water-highlight",
    type: "line",
    source: "water",
    paint: {
      "line-color": "#b7d6cd",
      "line-width": 1.2,
      "line-opacity": 0.8,
      "line-blur": 0.4,
    },
  });
  window.initAnimatedWater?.(map);

  // 3. 道路：以米白描边托起赭石主路，按道路等级控制宽度
  map.addSource("roads", {
    type: "geojson",
    data: "./geojson/roads-scene.geojson?v=20260823-1",
  });
  map.addLayer({
    id: "roads-casing",
    type: "line",
    source: "roads",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#f5ecdc",
      "line-width": roadCasingWidth,
      "line-opacity": 0.86,
    },
  });
  map.addLayer({
    id: "roads-layer",
    type: "line",
    source: "roads",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": [
        "match",
        ["get", "fclass"],
        ["motorway", "trunk", "primary"],
        "#a65340",
        ["secondary", "tertiary"],
        "#b77e62",
        "#b1a58d",
      ],
      "line-width": roadWidth,
      "line-opacity": 0.88,
    },
  });
  initRoadNameLabels();

  // 4. 城市建筑：墙体、投影与屋顶薄层共同形成真实体块
  map.addSource("buildings", {
    type: "geojson",
    data: "./geojson/buildings-scene.geojson?v=20260823-1",
  });
  const animatedBuildingHeight = [
    "interpolate",
    ["linear"],
    ["zoom"],
    14.7,
    0,
    15.5,
    buildingHeight,
  ];
  const animatedRoofBase = [
    "interpolate",
    ["linear"],
    ["zoom"],
    14.7,
    0,
    15.5,
    ["max", 0, ["-", buildingHeight, 1.2]],
  ];
  map.addLayer({
    id: "buildings-3d",
    type: "fill-extrusion",
    source: "buildings",
    paint: {
      "fill-extrusion-color": buildingColorExpression("day"),
      "fill-extrusion-height": animatedRoofBase,
      "fill-extrusion-opacity": 0.97,
      "fill-extrusion-vertical-gradient": true,
    },
  });
  map.addLayer({
    id: "building-roofs",
    type: "fill-extrusion",
    source: "buildings",
    minzoom: 16.15,
    paint: {
      "fill-extrusion-color": roofColorExpression("day"),
      "fill-extrusion-base": animatedRoofBase,
      "fill-extrusion-height": animatedBuildingHeight,
      "fill-extrusion-opacity": 0.86,
      "fill-extrusion-vertical-gradient": false,
    },
  });

  // 封装批量渲染点位函数，增加参数：markerArray，用来指定存入哪个数组
  function renderMarker(geoUrl, targetMarkerArray, category) {
    return fetch(geoUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async (geoData) => {
        const features = geoData.features || [];
        for (let featureIndex = 0; featureIndex < features.length; featureIndex += 1) {
          const shop = features[featureIndex];
          shop._category = category;
          //存入全局店铺数组，用于总览列表
          allShopFeatures.push(shop);

          // 创建克制的印章式地图点位，避免大图标遮挡建筑
          const markerDom = document.createElement("div");
          markerDom.className = `map-shop-marker ${category}`;
          markerDom.tabIndex = 0;
          markerDom.setAttribute("role", "button");
          markerDom.setAttribute("aria-label", shop.properties["名称"] || "店铺");
          markerDom.innerHTML = `
            <span class="marker-core"><span>${category === "food" ? "食" : "游"}</span></span>
            <span class="marker-label">${escapeHtml(shop.properties["名称"] || "未知店铺")}</span>
          `;
          window.enhanceCulturalMarker?.(markerDom, shop, category);
          shop._markerDom = markerDom;

          const marker = new maplibregl.Marker({
            element: markerDom,
            anchor: "center",
          })
            .setLngLat(shop.geometry.coordinates);
          shop._marker = marker;
          shop._markerAdded = false;

          //推入对应数组
          targetMarkerArray.push(marker);

          // 点击点位自动打开店铺介绍并填充数据
          const openMarkerShop = () => {
            openShopFeature(shop, 1400);
          };
          markerDom.addEventListener("click", openMarkerShop);
          markerDom.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openMarkerShop();
            }
          });
          if ((featureIndex + 1) % 48 === 0) await yieldToBrowser();
        }
      })
      .catch((err) => {
        console.error(`点位文件加载失败 ${geoUrl}：`, err);
      });
  }

  // 加载美食、娱乐点位GeoJSON，分别传入对应数组
  Promise.all([
    renderMarker("./geojson/food.geojson", foodMarkers, "food"),
    renderMarker("./geojson/entertain.geojson", entertainMarkers, "entertain"),
  ]).then(() => {
    applyShopOverviewFilters();
    window.notifyCulturalMarkersReady?.(allShopFeatures);
    setupShopClusterLayers();
    document.getElementById("mapLoading")?.classList.add("is-complete");
    document.body.dataset.mapDataReadyMs = String(
      Math.round(window.performance.now() - appBootStartedAt),
    );
  });

  applyMapAmbience(currentAmbience);
  window.initMapReading?.(map, {
    closePanel: () => setRightPanelOpen(false),
    clearSearch: () => document.getElementById("shopSearchClear")?.click(),
    onRoadSelected: (name) => {
      togglePopup(1);
      clearSmartSearchRoute();
      currentSearchMode = "road";
      currentSearchKeyword = name;
      document.getElementById("shopSearchInput").value = name;
      document.getElementById("shopSearchClear").hidden = false;
      const results = applyShopOverviewFilters();
      setSearchStatus(`找到 <strong>${results.length}</strong> 处${escapeHtml(name)}附近地点 · 按距道路线形的距离排序，非门牌归属判断`);
      return results;
    },
  });
  window.initCulturalMapInteractions?.(map);
  window.dispatchEvent(new CustomEvent("cultural-map-ready"));
});

map.once("dragstart", dismissStoryCard);
map.on("zoomend", () => {
  refreshShopClusters();
  refreshRoadNameLabels();
});
map.on("moveend", () => {
  refreshShopClusters();
  refreshRoadNameLabels();
});

// ========== 语言管理 ==========
let currentLang = "zh";
let i18nData = {};

//加载语言文件
async function loadLanguage(lang) {
  try {
    // 英文文件在原项目中命名为 eh.json，这里做兼容映射。
    const languageFile = lang === "en" ? "eh" : "zh";
    const response = await fetch(`./json/${languageFile}.json`);
    if (!response.ok) throw new Error("Network response was not ok");
    i18nData = await response.json();
    currentLang = lang;
    applyTranslations();
    localStorage.setItem("language", lang);
  } catch (error) {
    console.error("加载语言文件失败：", error);
    //加载失败回退中文
    if (lang != "zh") {
      loadLanguage("zh");
    }
  }
}

//将翻译应用到页面
function applyTranslations() {
  if (typeof i18nData !== "object" || i18nData === null) return;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = i18nData[key];
    } else {
      el.innerText = i18nData[key];
    }
  });
}

//页面初始化
document.addEventListener("DOMContentLoaded", () => {
  document.body.dataset.domReadyMs = String(
    Math.round(window.performance.now() - appBootStartedAt),
  );
  window.initAmbientEffects?.();
  const protocolNotice = document.getElementById("protocolNotice");
  if (protocolNotice && window.location.protocol === "file:") {
    protocolNotice.hidden = false;
  }
  const savedLang = localStorage.getItem("language") || "zh";
  loadLanguage(savedLang);
  initInnerDropdown();
  initShopSearch();
  [1, 2, 3].forEach((num) => {
    const menuItem = document.getElementById(`menuItem${num}`);
    menuItem?.addEventListener("click", () => togglePopup(num));
    menuItem?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePopup(num);
      }
    });
  });
  document
    .getElementById("panelClose")
    ?.addEventListener("click", closeRightPanel);
  document
    .getElementById("menuModalMask")
    ?.addEventListener("click", closeMenuModal);
  document
    .getElementById("menuModalClose")
    ?.addEventListener("click", closeMenuModal);
  document.getElementById("menuGrid")?.addEventListener("click", (event) => {
    if (event.target.closest(".menu-more-btn")) openMenuModal();
  });
  document.getElementById("storyExplore")?.addEventListener("click", () => {
    dismissStoryCard();
    togglePopup(1);
    map.easeTo({
      center: [112.9366, 28.1785],
      zoom: 16,
      pitch: 58,
      bearing: -10,
      duration: 1200,
    });
  });

  const ambienceToggle = document.getElementById("ambienceToggle");
  ambienceToggle?.addEventListener("click", toggleAmbience);
  ambienceToggle?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleAmbience();
    }
  });
});
