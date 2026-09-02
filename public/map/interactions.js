(function () {
  "use strict";

  const chapters = [
    {
      number: "壹",
      kicker: "YUELU · MOUNTAIN",
      title: "岳麓青岚",
      text: "山色从书院檐角漫入城中，二里半的故事，由一缕青岚起笔。",
      note: "书院不只是旧建筑，也是长沙把山林、教育与日常连在一起的入口。抬头看檐角，城市的时间仍在那里缓慢经过。",
      arrival: "先辨认岳麓山体与书院院落的贴合关系，再沿檐角、古木和山脚高差读城。",
      echo: "檐角隐入身后，千年书声仍从山林传来。",
      meta: "山林与书院",
      focusLabel: "岳麓山麓",
      photoLayout: "landmark",
      photoLayoutLabel: "地标细读",
      center: [112.9312, 28.1818],
      zoom: 15.25,
      pitch: 67,
      bearing: -28,
      contextRadius: 0.003,
      contextLimit: 9,
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Yuelu_Academy_10874-Changsha_%2848757570041%29.jpg/960px-Yuelu_Academy_10874-Changsha_%2848757570041%29.jpg",
          alt: "岳麓书院的庭院与传统建筑",
          label: "书院庭院",
          title: "岳麓书院",
          caption: "檐角、古木与千年书声",
          credit: "摄影 xiquinhosilva · CC BY 2.0",
          source: "https://commons.wikimedia.org/wiki/File:Yuelu_Academy_10874-Changsha_(48757570041).jpg",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Yuelu_Academy_10869-Changsha_%2848757247143%29.jpg/960px-Yuelu_Academy_10869-Changsha_%2848757247143%29.jpg",
          alt: "岳麓书院孔庙建筑与飞檐",
          label: "孔庙檐影",
          title: "孔庙檐影",
          caption: "儒风藏在飞檐、院墙与树影之间",
          credit: "摄影 xiquinhosilva · CC BY 2.0",
          source: "https://commons.wikimedia.org/wiki/File:Yuelu_Academy_10869-Changsha_(48757247143).jpg",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Yuelu_Academy_10844-Changsha_%2848757566176%29.jpg/960px-Yuelu_Academy_10844-Changsha_%2848757566176%29.jpg",
          alt: "岳麓书院中的传统院落景观",
          label: "书院一隅",
          title: "书院一隅",
          caption: "一方院落收住岳麓山下的清幽",
          credit: "摄影 xiquinhosilva · CC BY 2.0",
          source: "https://commons.wikimedia.org/wiki/File:Yuelu_Academy_10844-Changsha_(48757566176).jpg",
        },
      ],
      annotations: [
        {
          title: "岳麓山麓",
          note: "山林从这里漫入城市",
          coordinates: [112.9312, 28.1818],
          offset: [0, -18],
          mobileOffset: [0, -18],
          placement: "center",
        },
      ],
    },
    {
      number: "贰",
      kicker: "NORMAL UNIVERSITY · MEMORY",
      title: "师大文脉",
      text: "镜头落在二里半校区本部：学生活动中心、木兰路与五舍运动场，共同组成师大的校园日常。",
      note: "师大的文脉并不只在纪念碑与校门里，也藏在下课的人流、球场边的树影和木兰路的一日三餐中。",
      arrival: "以学生活动中心为锚点，顺着木兰路辨认食堂、宿舍与运动场的校园生活轴线。",
      echo: "树影落回球场，青春的喧响仍留在木兰路上。",
      meta: "二里半校区本部 · 校园与青春",
      focusLabel: "湖南师范大学本部",
      photoLayout: "campus",
      photoLayoutLabel: "校园编辑页",
      photoEra: "1938—2026 · 师大校园年轮",
      photoQuote: "问渠那得清如许？为有源头活水来。",
      photoQuoteBy: "朱熹《观书有感》",
      center: [112.94175, 28.18885],
      zoom: 17.25,
      pitch: 57,
      bearing: -8,
      contextRadius: 0.0026,
      contextLimit: 14,
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Hunan_Normal_University_1.JPG/960px-Hunan_Normal_University_1.JPG",
          alt: "湖南师范大学至善楼与校园景观",
          label: "至善楼",
          title: "湖南师大 · 至善楼",
          caption: "红墙与林荫，写下校园年轮",
          credit: "摄影 Huangdan2060 · CC BY 3.0",
          source: "https://commons.wikimedia.org/wiki/File:Hunan_Normal_University_1.JPG",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hunan_Normal_University_10.JPG/960px-Hunan_Normal_University_10.JPG",
          alt: "湖南师范大学景德楼与校园道路",
          label: "景德楼",
          title: "校园 · 景德楼",
          caption: "讲堂、道路与树荫连接起师大日常",
          credit: "摄影 Huangdan2060 · CC BY 3.0",
          source: "https://commons.wikimedia.org/wiki/File:Hunan_Normal_University_10.JPG",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paifang_of_Hunan_Normal_University_20230904.jpg/960px-Paifang_of_Hunan_Normal_University_20230904.jpg",
          alt: "湖南师范大学校园牌坊",
          label: "师大牌坊",
          title: "师大牌坊",
          caption: "一座校门，把城市与文脉轻轻分开",
          credit: "摄影 Huangdan2060 · CC BY 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Paifang_of_Hunan_Normal_University_20230904.jpg",
        },
      ],
      annotations: [
        {
          title: "学生活动中心",
          note: "校园公共生活的中心",
          coordinates: [112.9415912, 28.1888002],
          offset: [-74, -22],
          mobileOffset: [-34, -18],
          placement: "left",
        },
        {
          title: "木兰路生活带",
          note: "食堂、宿舍与日常交汇",
          coordinates: [112.9416461, 28.188478],
          offset: [-86, -88],
          mobileOffset: [76, -62],
          placement: "left",
        },
        {
          title: "五舍运动场",
          note: "青春在场，树影相随",
          coordinates: [112.9421239, 28.1889522],
          offset: [88, -78],
          mobileOffset: [0, -18],
          placement: "right",
        },
      ],
    },
    {
      number: "叁",
      kicker: "ERLIBAN · EVERYDAY LIFE",
      title: "街巷烟火",
      text: "从桃子湖路转入学堂坡·油烟街，小店的热气、江边宿舍与晚归灯火，构成最密集的生活切片。",
      note: "这里没有宏大的城市天际线，却有最准确的生活尺度：一盏摊灯、一张小桌，以及被熟客记住的口味。",
      arrival: "从学堂坡巷口向油烟街看，小店、宿舍和摊灯共同定义这里的生活尺度。",
      echo: "转过巷口，锅气与晚灯仍替这条街保留温度。",
      meta: "学堂坡 · 油烟街 · 饮食与日常",
      focusLabel: "学堂坡 · 油烟街",
      photoLayout: "street",
      photoLayoutLabel: "街巷胶片",
      center: [112.94692, 28.18886],
      zoom: 17.35,
      pitch: 55,
      bearing: 14,
      contextRadius: 0.0021,
      contextLimit: 18,
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Sifangping_Night_Market_in_Changsha_2025052906.jpg/960px-Sifangping_Night_Market_in_Changsha_2025052906.jpg",
          alt: "长沙夜市摊档与街巷灯火",
          label: "街巷食摊",
          title: "长沙街巷 · 烟火意象",
          caption: "以长沙夜市影像映照学堂坡的热气",
          credit: "摄影 Huangdan2060 · CC BY 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Sifangping_Night_Market_in_Changsha_2025052906.jpg",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Sifangping_Night_Market_in_Changsha_2025052903.jpg/960px-Sifangping_Night_Market_in_Changsha_2025052903.jpg",
          alt: "长沙夜市中的摊位与来往人群",
          label: "夜市灯火",
          title: "夜市灯火",
          caption: "摊灯次第亮起，街巷有了夜晚的温度",
          credit: "摄影 Huangdan2060 · CC BY 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Sifangping_Night_Market_in_Changsha_2025052903.jpg",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sifangping_Night_Market_in_Changsha_2025052908.jpg/960px-Sifangping_Night_Market_in_Changsha_2025052908.jpg",
          alt: "长沙夜市的街头食物与烟火场景",
          label: "人间热气",
          title: "人间热气",
          caption: "锅气、谈笑与晚归脚步汇成城市切片",
          credit: "摄影 Huangdan2060 · CC BY 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Sifangping_Night_Market_in_Changsha_2025052908.jpg",
        },
      ],
      annotations: [
        {
          title: "学堂坡巷",
          note: "小店沿巷生长",
          coordinates: [112.94645, 28.18848],
          offset: [-102, -30],
          mobileOffset: [-42, -22],
          placement: "left",
        },
        {
          title: "油烟街",
          note: "一日三餐的热气",
          coordinates: [112.9466929, 28.1888637],
          offset: [94, -34],
          mobileOffset: [96, -52],
          placement: "right",
        },
        {
          title: "江边学生宿舍",
          note: "晚归灯火与夜宵",
          coordinates: [112.9476724, 28.1890568],
          offset: [82, -94],
          mobileOffset: [0, -18],
          placement: "right",
        },
      ],
    },
    {
      number: "肆",
      kicker: "XIANG RIVER · FLOWING TIME",
      title: "湘江流年",
      text: "江水向北，带走一场烟雨，也把岳麓山下的生活送往更辽阔的远方。",
      note: "湘江不是地图的边界，而是这座城市持续流动的时间。山、洲、校园与街巷，都在江面上获得了共同的倒影。",
      arrival: "先看江岸方向与水纹，再辨认洲岸、远景和两岸灯火形成的城市横轴。",
      echo: "江流退到画面边缘，两岸灯火仍在水面相认。",
      meta: "江岸与远方",
      focusLabel: "湘江水岸",
      photoLayout: "river",
      photoLayoutLabel: "江岸宽景",
      center: [112.9634, 28.1884],
      zoom: 14.75,
      pitch: 48,
      bearing: 7,
      contextRadius: 0.003,
      contextLimit: 8,
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Xiang_River_and_Orange_Isle%2C_Changsha.jpg/960px-Xiang_River_and_Orange_Isle%2C_Changsha.jpg",
          alt: "长沙湘江与橘子洲的城市风光",
          label: "江洲相望",
          title: "湘江与橘子洲",
          caption: "江流向北，洲岸把城市铺向远方",
          credit: "摄影 JULIANISME · CC BY-SA 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Xiang_River_and_Orange_Isle,_Changsha.jpg",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Night_view_of_Xiang_River_in_Changsha_2025031301.jpg/960px-Night_view_of_Xiang_River_in_Changsha_2025031301.jpg",
          alt: "夜晚从岳麓区远眺湘江",
          label: "湘江夜色",
          title: "湘江夜色",
          caption: "暮色落进江面，城市灯火沿岸舒展",
          credit: "摄影 Huangdan2060 · CC BY 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Night_view_of_Xiang_River_in_Changsha_2025031301.jpg",
        },
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Night_view_of_Xiang_River_in_Changsha_2025031304.jpg/960px-Night_view_of_Xiang_River_in_Changsha_2025031304.jpg",
          alt: "长沙湘江夜景与城市天际线",
          label: "江岸灯火",
          title: "江岸灯火",
          caption: "一江深色托起两岸明灭的生活",
          credit: "摄影 Huangdan2060 · CC BY 4.0",
          source: "https://commons.wikimedia.org/wiki/File:Night_view_of_Xiang_River_in_Changsha_2025031304.jpg",
        },
      ],
      annotations: [
        {
          title: "湘江水岸",
          note: "江流向北，山水相望",
          coordinates: [112.9634, 28.1884],
          offset: [0, -18],
          mobileOffset: [0, -18],
          placement: "center",
        },
      ],
    },
  ];

  const scenePoems = [
    {
      zone: "岳麓山脊",
      text: "一山青黛，半城书声",
      coordinates: [112.9272, 28.1812],
      minZoom: 14.3,
      maxZoom: 16.25,
      rotation: -21,
      tone: "mountain",
    },
    {
      zone: "湘江水面",
      text: "湘水无言，向北而行",
      coordinates: [112.9602, 28.1814],
      minZoom: 13.9,
      maxZoom: 16.2,
      rotation: 4,
      tone: "water",
    },
    {
      zone: "师大校园",
      text: "树影与书页，都在午后翻动",
      coordinates: [112.94186, 28.1887],
      minZoom: 16.2,
      maxZoom: 18.7,
      rotation: -7,
      tone: "culture",
    },
    {
      zone: "学堂坡巷",
      text: "巷深一盏灯，人间三餐暖",
      coordinates: [112.94672, 28.18878],
      minZoom: 16.35,
      maxZoom: 18.8,
      rotation: 11,
      tone: "life",
    },
  ];

  const interactionState = {
    map: null,
    initialized: false,
    tourActive: false,
    tourPlaying: true,
    chapterIndex: 0,
    tourTimer: null,
    contextFrame: null,
    contextWakeTimer: null,
    markerHovering: false,
    culturalLandmarks: [],
    allFeatures: [],
    annotationMarkers: [],
    selectedAnnotationIndex: -1,
    rippleCount: 0,
    photoRequest: 0,
    photoActiveIndex: 0,
    landmarkMarkers: [],
    poemMarkers: [],
    nearbyChapterIndex: -1,
    afterglowTimer: null,
    riverLastTime: 0,
    riverLastPoint: null,
    riverWakeCount: 0,
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function escapeMarkup(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readProperty(properties, keys, fallback) {
    const key = keys.find((candidate) => {
      const value = properties?.[candidate];
      return value !== undefined && value !== null && String(value).trim();
    });
    return key ? String(properties[key]).trim() : fallback;
  }

  function routeGeoJSON() {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: chapters.map((chapter) => chapter.center),
          },
        },
      ],
    };
  }

  function stopGeoJSON(activeIndex = 0) {
    return {
      type: "FeatureCollection",
      features: chapters.map((chapter, index) => ({
        type: "Feature",
        properties: {
          index,
          active: index === activeIndex,
        },
        geometry: {
          type: "Point",
          coordinates: chapter.center,
        },
      })),
    };
  }

  function focusGeoJSON(coordinates = chapters[0].center) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates },
        },
      ],
    };
  }

  function setupTourLayers() {
    const mapInstance = interactionState.map;
    if (!mapInstance || mapInstance.getSource("cultural-tour-route")) return;

    mapInstance.addSource("cultural-tour-route", {
      type: "geojson",
      data: routeGeoJSON(),
    });
    mapInstance.addSource("cultural-tour-stops", {
      type: "geojson",
      data: stopGeoJSON(),
    });
    mapInstance.addSource("cultural-tour-focus", {
      type: "geojson",
      data: focusGeoJSON(),
    });

    mapInstance.addLayer({
      id: "cultural-tour-route-halo",
      type: "line",
      source: "cultural-tour-route",
      layout: {
        visibility: "none",
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#f4eee3",
        "line-width": 7,
        "line-opacity": 0.4,
        "line-blur": 2.5,
      },
    });
    mapInstance.addLayer({
      id: "cultural-tour-route",
      type: "line",
      source: "cultural-tour-route",
      layout: {
        visibility: "none",
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#8f3428",
        "line-width": 1.8,
        "line-opacity": 0.72,
        "line-dasharray": [1.2, 2.1],
      },
    });
    mapInstance.addLayer({
      id: "cultural-tour-stops",
      type: "circle",
      source: "cultural-tour-stops",
      layout: {
        visibility: "none",
      },
      paint: {
        "circle-radius": ["case", ["get", "active"], 8, 4.5],
        "circle-color": [
          "case",
          ["get", "active"],
          "#b18a4f",
          "#f4eee3",
        ],
        "circle-stroke-color": "#8f3428",
        "circle-stroke-width": ["case", ["get", "active"], 2.4, 1.4],
        "circle-opacity": 0.95,
        "circle-blur": ["case", ["get", "active"], 0.08, 0],
      },
    });
    mapInstance.addLayer({
      id: "cultural-tour-focus-halo",
      type: "circle",
      source: "cultural-tour-focus",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 62,
        "circle-color": "#b18a4f",
        "circle-opacity": 0.12,
        "circle-blur": 0.68,
        "circle-stroke-color": "#f4eee3",
        "circle-stroke-width": 2,
        "circle-stroke-opacity": 0.34,
      },
    });
    mapInstance.addLayer({
      id: "cultural-tour-focus-ring",
      type: "circle",
      source: "cultural-tour-focus",
      layout: { visibility: "none" },
      paint: {
        "circle-radius": 26,
        "circle-color": "rgba(255,255,255,0)",
        "circle-stroke-color": "#8f3428",
        "circle-stroke-width": 1.8,
        "circle-stroke-opacity": 0.78,
      },
    });
  }

  function showLandmarkAfterglow(chapter) {
    const card = document.getElementById("landmarkAfterglow");
    if (!card || !chapter) return;
    window.clearTimeout(interactionState.afterglowTimer);
    document.getElementById("landmarkAfterglowTitle").textContent = chapter.title;
    document.getElementById("landmarkAfterglowStory").textContent = chapter.echo;
    card.classList.remove("is-visible");
    card.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => card.classList.add("is-visible"));
    interactionState.afterglowTimer = window.setTimeout(() => {
      card.classList.remove("is-visible");
      card.setAttribute("aria-hidden", "true");
    }, reduceMotion.matches ? 2400 : 3800);
  }

  function trackLandmarkDeparture() {
    const mapInstance = interactionState.map;
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    let nextIndex = -1;
    let nearestDistance = 0.0039 ** 2;
    chapters.forEach((chapter, index) => {
      const distance =
        (center.lng - chapter.center[0]) ** 2 +
        (center.lat - chapter.center[1]) ** 2;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextIndex = index;
      }
    });
    if (
      interactionState.nearbyChapterIndex >= 0 &&
      nextIndex !== interactionState.nearbyChapterIndex
    ) {
      showLandmarkAfterglow(chapters[interactionState.nearbyChapterIndex]);
    }
    interactionState.nearbyChapterIndex = nextIndex;
  }

  function setupLandmarkBreaths() {
    const mapInstance = interactionState.map;
    if (!mapInstance || interactionState.landmarkMarkers.length || !window.maplibregl) return;
    interactionState.landmarkMarkers = chapters.map((chapter, index) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "landmark-breath-marker";
      element.dataset.chapterIndex = String(index);
      element.style.setProperty("--breath-delay", `${index * -1.15}s`);
      element.setAttribute("aria-label", `从${chapter.title}开始城市漫游`);
      element.innerHTML = `
        <span class="landmark-breath-ring" aria-hidden="true"></span>
        <span class="landmark-breath-core" aria-hidden="true">${chapter.number}</span>
        <span class="landmark-breath-label"><small>城市锚点</small><strong>${escapeMarkup(chapter.title)}</strong></span>
      `;
      const openChapter = () => startTour(index);
      element.addEventListener("click", openChapter);
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openChapter();
        }
      });
      element.addEventListener("pointerenter", () => {
        interactionState.markerHovering = true;
        document.getElementById("mapContextRibbon")?.classList.add("is-marker", "is-awake");
        document.getElementById("mapContextEyebrow").textContent = "重点地标";
        document.getElementById("mapContextTitle").textContent = chapter.title;
        document.getElementById("mapContextMeta").textContent = `${chapter.meta} · 点击从这里起行`;
      });
      element.addEventListener("pointerleave", () => {
        interactionState.markerHovering = false;
        document.getElementById("mapContextRibbon")?.classList.remove("is-marker");
        window.setTimeout(updateMapContext, 80);
      });
      const marker = new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat(chapter.center)
        .addTo(mapInstance);
      return { marker, element };
    });
  }

  function updateScenePoems() {
    const mapInstance = interactionState.map;
    if (!mapInstance || !interactionState.poemMarkers.length) return;
    const zoom = mapInstance.getZoom();
    const bounds = mapInstance.getBounds();
    interactionState.poemMarkers.forEach(({ element, item }) => {
      const visible =
        zoom >= item.minZoom &&
        zoom <= item.maxZoom &&
        bounds.contains(item.coordinates);
      element.classList.toggle("is-visible", visible);
      element.setAttribute("aria-hidden", String(!visible));
    });
  }

  function setupScenePoems() {
    const mapInstance = interactionState.map;
    if (!mapInstance || interactionState.poemMarkers.length || !window.maplibregl) return;
    interactionState.poemMarkers = scenePoems.map((item) => {
      const element = document.createElement("div");
      element.className = "scene-poem";
      element.dataset.tone = item.tone;
      element.setAttribute("aria-hidden", "true");
      element.innerHTML = `
        <span class="scene-poem-text">
          <small>${escapeMarkup(item.zone)}</small>
          <strong>${escapeMarkup(item.text)}</strong>
        </span>
      `;
      const marker = new maplibregl.Marker({
        element,
        anchor: "center",
        rotation: item.rotation,
        rotationAlignment: "map",
      })
        .setLngLat(item.coordinates)
        .addTo(mapInstance);
      return { marker, element, item };
    });
    updateScenePoems();
  }

  function createRiverResponse(event) {
    if (reduceMotion.matches || document.body.classList.contains("effects-off")) return;
    const layer = document.getElementById("riverResponseLayer");
    const point = event?.point;
    if (!layer || !point) return;
    const now = performance.now();
    if (now - interactionState.riverLastTime < 165) return;

    const previous = interactionState.riverLastPoint;
    const angle = previous
      ? Math.atan2(point.y - previous.y, point.x - previous.x) * (180 / Math.PI)
      : -12;
    interactionState.riverLastTime = now;
    interactionState.riverLastPoint = { x: point.x, y: point.y };

    const wake = document.createElement("span");
    wake.className = "river-response";
    wake.style.left = `${point.x}px`;
    wake.style.top = `${point.y}px`;
    wake.style.setProperty("--wake-angle", `${angle}deg`);
    wake.innerHTML = '<i class="river-response-tail"></i>';
    layer.appendChild(wake);
    interactionState.riverWakeCount += 1;
    layer.dataset.wakeCount = String(interactionState.riverWakeCount);
    while (layer.childElementCount > 5) layer.firstElementChild?.remove();
    wake.addEventListener("animationend", () => wake.remove(), { once: true });
    window.setTimeout(() => wake.remove(), 1900);
  }

  function setupRiverResponse() {
    const mapInstance = interactionState.map;
    if (!mapInstance?.getLayer("water-layer")) return;
    mapInstance.on("mousemove", "water-layer", createRiverResponse);
    mapInstance.on("mouseleave", "water-layer", () => {
      interactionState.riverLastPoint = null;
    });
  }

  function setTourLayersVisible(visible) {
    const mapInstance = interactionState.map;
    if (!mapInstance) return;
    [
      "cultural-tour-route-halo",
      "cultural-tour-route",
      "cultural-tour-stops",
      "cultural-tour-focus-halo",
      "cultural-tour-focus-ring",
    ].forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  }

  function updateTourStopLayer() {
    interactionState.map
      ?.getSource("cultural-tour-stops")
      ?.setData(stopGeoJSON(interactionState.chapterIndex));
    updateTourFocusLayer();
  }

  function updateTourFocusLayer(coordinates) {
    const chapter = chapters[interactionState.chapterIndex];
    interactionState.map
      ?.getSource("cultural-tour-focus")
      ?.setData(focusGeoJSON(coordinates || chapter?.center || chapters[0].center));
  }

  function clearTourAnnotations() {
    interactionState.annotationMarkers.forEach((entry) => entry.marker.remove());
    interactionState.annotationMarkers = [];
  }

  function annotationOffset(annotation) {
    const compact = window.innerWidth <= 820;
    const offset = compact ? annotation.mobileOffset || annotation.offset : annotation.offset;
    return Array.isArray(offset) ? [...offset] : [0, -10];
  }

  function annotationRect(entry) {
    const rect = entry.element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  function annotationOverlap(first, second, padding = 0) {
    return !(
      first.right + padding <= second.left ||
      second.right + padding <= first.left ||
      first.bottom + padding <= second.top ||
      second.bottom + padding <= first.top
    );
  }

  function setAnnotationOffset(entry, offset) {
    entry.offset = offset;
    entry.marker.setOffset(offset);
  }

  function keepAnnotationInView(entry) {
    const margin = window.innerWidth <= 820 ? 12 : 18;
    const headerBottom =
      (document.querySelector(".header-bar")?.getBoundingClientRect().bottom || 0) + 12;
    const panel = document.getElementById("cityTourPanel")?.getBoundingClientRect();
    const photo = document.getElementById("tourPlacePhoto")?.getBoundingClientRect();
    let rect = annotationRect(entry);
    let shiftX = 0;
    let shiftY = 0;

    if (rect.left < margin) shiftX += margin - rect.left;
    if (rect.right > window.innerWidth - margin) {
      shiftX -= rect.right - (window.innerWidth - margin);
    }
    if (rect.top < headerBottom) shiftY += headerBottom - rect.top;
    if (
      panel &&
      panel.width > 0 &&
      panel.height > 0 &&
      annotationOverlap(rect, {
        left: panel.left,
        right: panel.right,
        top: panel.top,
        bottom: panel.bottom,
      }, 10)
    ) {
      shiftY -= rect.bottom - panel.top + 18;
    }

    rect = annotationRect(entry);
    if (
      photo &&
      photo.width > 0 &&
      photo.height > 0 &&
      annotationOverlap(rect, photo, 10)
    ) {
      if (photo.top < window.innerHeight * 0.45) {
        shiftY += photo.bottom - rect.top + 18;
      } else {
        shiftY -= rect.bottom - photo.top + 18;
      }
    }

    if (shiftX || shiftY) {
      setAnnotationOffset(entry, [entry.offset[0] + shiftX, entry.offset[1] + shiftY]);
    }
  }

  function layoutTourAnnotations() {
    if (!interactionState.tourActive || !interactionState.annotationMarkers.length) return;
    const entries = interactionState.annotationMarkers.filter(
      (entry) => getComputedStyle(entry.element).display !== "none",
    );
    entries.forEach((entry) => setAnnotationOffset(entry, annotationOffset(entry.annotation)));
    entries.forEach(keepAnnotationInView);

    for (let pass = 0; pass < 3; pass += 1) {
      entries.forEach((entry, index) => {
        for (let otherIndex = 0; otherIndex < index; otherIndex += 1) {
          const other = entries[otherIndex];
          let rect = annotationRect(entry);
          const otherRect = annotationRect(other);
          if (!annotationOverlap(rect, otherRect, 10)) continue;

          const moveRight = otherRect.right - rect.left + 16;
          const moveLeft = rect.right - otherRect.left + 16;
          const canMoveRight = rect.right + moveRight <= window.innerWidth - 12;
          const canMoveLeft = rect.left - moveLeft >= 12;
          if (canMoveRight) {
            setAnnotationOffset(entry, [entry.offset[0] + moveRight, entry.offset[1]]);
          } else if (canMoveLeft) {
            setAnnotationOffset(entry, [entry.offset[0] - moveLeft, entry.offset[1]]);
          } else {
            const moveUp = rect.bottom - otherRect.top + 16;
            setAnnotationOffset(entry, [entry.offset[0], entry.offset[1] - moveUp]);
          }
          keepAnnotationInView(entry);
          rect = annotationRect(entry);
        }
      });
    }
  }

  function renderTourAnnotations() {
    clearTourAnnotations();
    if (!interactionState.tourActive || !window.maplibregl) return;
    const chapter = chapters[interactionState.chapterIndex];
    chapter.annotations.forEach((annotation, index) => {
      const markerDom = document.createElement("div");
      markerDom.className = "tour-map-annotation";
      markerDom.dataset.annotationIndex = String(index + 1);
      markerDom.dataset.placement = annotation.placement || "center";
      markerDom.style.setProperty("--annotation-delay", `${280 + index * 130}ms`);
      markerDom.innerHTML = `
        <span class="tour-annotation-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="tour-annotation-copy">
          <strong>${escapeMarkup(annotation.title)}</strong>
          <small>${escapeMarkup(annotation.note)}</small>
        </span>
      `;
      const marker = new maplibregl.Marker({
        element: markerDom,
        anchor: "bottom",
        offset: annotationOffset(annotation),
      })
        .setLngLat(annotation.coordinates)
        .addTo(interactionState.map);
      interactionState.annotationMarkers.push({
        marker,
        element: markerDom,
        annotation,
        offset: annotationOffset(annotation),
      });
    });
    window.requestAnimationFrame(layoutTourAnnotations);
  }

  function highlightChapterMarker() {
    interactionState.allFeatures.forEach((feature) => {
      feature?._markerDom?.classList.remove("is-tour-context");
    });
    interactionState.culturalLandmarks.forEach((markerDom, index) => {
      markerDom?.classList.toggle(
        "is-tour-nearby",
        interactionState.tourActive && index === interactionState.chapterIndex,
      );
    });
    interactionState.landmarkMarkers.forEach(({ element }, index) => {
      element.classList.toggle(
        "is-active",
        interactionState.tourActive && index === interactionState.chapterIndex,
      );
    });
    if (!interactionState.tourActive) return;

    const chapter = chapters[interactionState.chapterIndex];
    interactionState.allFeatures
      .map((feature) => {
        const coordinates = feature.geometry?.coordinates;
        if (!Array.isArray(coordinates)) return null;
        const distance =
          (coordinates[0] - chapter.center[0]) ** 2 +
          (coordinates[1] - chapter.center[1]) ** 2;
        return { feature, distance };
      })
      .filter((entry) => entry && entry.distance <= chapter.contextRadius ** 2)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, chapter.contextLimit)
      .forEach(({ feature }) => feature._markerDom?.classList.add("is-tour-context"));
  }

  function updateTourPlayButton() {
    const button = document.getElementById("cityTourPlay");
    if (!button) return;
    const icon = button.querySelector("i");
    const label = button.querySelector("span");
    button.setAttribute(
      "aria-label",
      interactionState.tourPlaying ? "暂停漫游" : "继续漫游",
    );
    if (icon) {
      icon.className = interactionState.tourPlaying ? "fa fa-pause" : "fa fa-play";
    }
    if (label) {
      label.textContent = interactionState.tourPlaying ? "暂停行旅" : "继续行旅";
    }

    const meta = document.querySelector("#cityTourMeta em");
    if (meta) {
      meta.textContent = interactionState.tourPlaying
        ? "约 14 秒后续行"
        : "行旅已停 · 可自由看景";
    }
    document.getElementById("cityTourPanel")?.setAttribute(
      "data-playing",
      String(interactionState.tourPlaying),
    );
  }

  function scheduleTourImagePreload(index) {
    const preload = () => {
      const nextImages = chapters[index]?.images || [];
      nextImages.slice(0, 1).forEach((item) => {
        if (!item?.src) return;
        const image = new Image();
        image.decoding = "async";
        image.src = item.src;
      });
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preload, { timeout: 2200 });
    } else {
      window.setTimeout(preload, 900);
    }
  }

  function selectTourPhoto(index, pauseTour = false) {
    const chapter = chapters[interactionState.chapterIndex];
    const gallery = chapter?.images || [];
    const figure = document.getElementById("tourPlacePhoto");
    const cells = [...document.querySelectorAll("#tourPhotoCollage .tour-photo-cell")];
    if (!figure || !gallery.length || !cells.length) return;
    const activeIndex = Math.max(0, Math.min(index, gallery.length - 1));
    const activeImage = gallery[activeIndex];
    interactionState.photoActiveIndex = activeIndex;

    let secondaryOrder = 0;
    cells.forEach((cell, cellIndex) => {
      cell.classList.remove("is-main", "is-secondary-first", "is-secondary-second");
      if (cellIndex === activeIndex) cell.classList.add("is-main");
      else {
        cell.classList.add(
          secondaryOrder++ === 0 ? "is-secondary-first" : "is-secondary-second",
        );
      }
      cell.setAttribute("aria-pressed", String(cellIndex === activeIndex));
      cell.querySelector("img")?.setAttribute(
        "fetchpriority",
        cellIndex === activeIndex ? "high" : "low",
      );
    });

    figure.dataset.photoIndex = String(activeIndex + 1);
    document.getElementById("tourPhotoActiveNumber").textContent =
      String(activeIndex + 1).padStart(2, "0");
    document.getElementById("tourPlacePhotoTitle").textContent = activeImage.title;
    document.getElementById("tourPlacePhotoCaption").textContent = activeImage.caption;
    const credit = document.getElementById("tourPlacePhotoCredit");
    credit.textContent = activeImage.credit;
    credit.href = activeImage.source;
    if (pauseTour) setTourPlaying(false);
  }

  function updateTourPhoto(chapter) {
    const gallery = chapter?.images || [];
    if (!interactionState.tourActive || !gallery.length) return;
    const figure = document.getElementById("tourPlacePhoto");
    const cells = [...document.querySelectorAll("#tourPhotoCollage .tour-photo-cell")];
    if (!figure || !cells.length) return;

    const requestId = ++interactionState.photoRequest;
    const layout = chapter.photoLayout || "landmark";
    const layoutChanged = figure.dataset.layout !== layout;
    figure.dataset.layout = layout;
    document.body.dataset.tourPhotoLayout = layout;
    figure.setAttribute("aria-label", `${chapter.title} · ${chapter.photoLayoutLabel || "地点影像"}`);
    if (layoutChanged && !reduceMotion.matches) {
      figure.classList.remove("is-layout-changing");
      window.requestAnimationFrame(() => figure.classList.add("is-layout-changing"));
      window.setTimeout(() => figure.classList.remove("is-layout-changing"), 520);
    }
    figure.classList.add("is-visible");
    figure.classList.remove("is-loading", "is-ready", "is-error");
    figure.setAttribute("aria-hidden", "false");
    document.getElementById("tourPlacePhotoChapter").textContent =
      `${chapter.number} · ${chapter.meta} · 本章影像 ${gallery.length} 帧`;
    document.getElementById("tourPhotoLayoutBadge").textContent =
      chapter.photoLayoutLabel || "地点影像";
    const editorial = document.getElementById("tourPhotoEditorial");
    const hasEditorial = layout === "campus";
    editorial?.setAttribute("aria-hidden", String(!hasEditorial));
    document.getElementById("tourPhotoEra").textContent = chapter.photoEra || "";
    document.getElementById("tourPhotoQuote").textContent = chapter.photoQuote || "";
    document.getElementById("tourPhotoQuoteBy").textContent = chapter.photoQuoteBy || "";

    cells.forEach((cell, index) => {
      const item = gallery[index];
      const image = cell.querySelector("img");
      const status = cell.querySelector(".tour-photo-status");
      const label = cell.querySelector(".tour-photo-cell-label");
      if (!item || !image || !status || !label) return;
      cell.classList.remove("is-loaded", "is-error");
      cell.setAttribute("aria-label", `查看影像 ${index + 1}：${item.title}`);
      image.alt = item.alt;
      label.textContent = `${String(index + 1).padStart(2, "0")} · ${item.label}`;
      status.textContent = "影像正在抵达";

      const onLoad = () => {
        if (requestId !== interactionState.photoRequest) return;
        cell.classList.remove("is-error");
        cell.classList.add("is-loaded");
        window.requestAnimationFrame(layoutTourAnnotations);
      };
      image.onload = onLoad;
      image.onerror = () => {
        if (requestId !== interactionState.photoRequest) return;
        cell.classList.remove("is-loaded");
        cell.classList.add("is-error");
        status.textContent = "影像暂未抵达";
      };
      if (image.src !== item.src) image.src = item.src;
      else if (image.complete && image.naturalWidth) onLoad();
    });

    selectTourPhoto(0);
    scheduleTourImagePreload((interactionState.chapterIndex + 1) % chapters.length);
  }

  function updateTourPanel() {
    const chapter = chapters[interactionState.chapterIndex];
    const panel = document.getElementById("cityTourPanel");
    if (!chapter || !panel) return;

    document.getElementById("cityTourNumber").textContent = chapter.number;
    document.getElementById("cityTourKicker").textContent = chapter.kicker;
    document.getElementById("cityTourTitle").textContent = chapter.title;
    document.getElementById("cityTourText").textContent = chapter.text;
    const note = document.getElementById("cityTourNoteText");
    if (note) note.textContent = chapter.note;
    const watch = document.getElementById("cityTourWatch");
    if (watch) {
      watch.innerHTML = `
        <div class="tour-watch-heading">
          <span>抵达后看什么</span>
          <small>白模是方位，题签是线索</small>
        </div>
        <p class="tour-arrival-lead">${escapeMarkup(chapter.arrival)}</p>
        <div class="tour-watch-list">
          ${chapter.annotations
            .map(
              (annotation, index) => `
                <button type="button" data-annotation-index="${index}" aria-label="聚焦${escapeMarkup(annotation.title)}">
                  <b>${String(index + 1).padStart(2, "0")}</b>
                  <span><strong>${escapeMarkup(annotation.title)}</strong><small>${escapeMarkup(annotation.note)}</small></span>
                </button>`,
            )
            .join("")}
        </div>
      `;
    }
    const metaLabel = document.querySelector("#cityTourMeta span");
    if (metaLabel) {
      metaLabel.innerHTML = `<i class="fa fa-location-arrow" aria-hidden="true"></i> ${escapeMarkup(chapter.meta)}`;
    }

    panel.dataset.chapter = String(interactionState.chapterIndex + 1);
    panel.querySelectorAll(".tour-progress-dot").forEach((dot, index) => {
      const active = index === interactionState.chapterIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "step" : "false");
    });
    updateTourPlayButton();
    updateTourStopLayer();
    highlightChapterMarker();
    renderTourAnnotations();
    updateTourPhoto(chapter);
    window.refreshShopClusters?.();
  }

  function clearTourTimer() {
    window.clearTimeout(interactionState.tourTimer);
    interactionState.tourTimer = null;
  }

  function scheduleTourAdvance() {
    clearTourTimer();
    if (!interactionState.tourActive || !interactionState.tourPlaying) return;
    interactionState.tourTimer = window.setTimeout(() => {
      goToChapter(interactionState.chapterIndex + 1);
    }, 13800);
  }

  function goToChapter(index) {
    const mapInstance = interactionState.map;
    if (!mapInstance) return;
    interactionState.chapterIndex = (index + chapters.length) % chapters.length;
    interactionState.selectedAnnotationIndex = -1;
    const chapter = chapters[interactionState.chapterIndex];
    updateTourPanel();

    mapInstance.flyTo({
      center: chapter.center,
      zoom: chapter.zoom,
      pitch: chapter.pitch,
      bearing: chapter.bearing,
      offset: window.innerWidth <= 820 ? [0, -112] : [0, -58],
      duration: reduceMotion.matches ? 0 : 2800,
      essential: true,
    });
    window.setTimeout(layoutTourAnnotations, reduceMotion.matches ? 30 : 2860);
    scheduleTourAdvance();
  }

  function focusChapterAnnotation(index) {
    const chapter = chapters[interactionState.chapterIndex];
    const annotation = chapter?.annotations?.[index];
    if (!annotation || !interactionState.map) return;
    interactionState.selectedAnnotationIndex = index;
    setTourPlaying(false);
    updateTourFocusLayer(annotation.coordinates);

    interactionState.annotationMarkers.forEach((entry, markerIndex) => {
      entry.element.classList.toggle("is-selected", markerIndex === index);
    });
    document.querySelectorAll("#cityTourWatch button").forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === index);
    });

    interactionState.map.flyTo({
      center: annotation.coordinates,
      zoom: Math.max(chapter.zoom, 17.55),
      pitch: Math.min(chapter.pitch, 55),
      bearing: chapter.bearing,
      offset: window.innerWidth <= 820 ? [0, -112] : [0, -58],
      duration: reduceMotion.matches ? 0 : 1500,
      essential: true,
    });
    window.setTimeout(layoutTourAnnotations, reduceMotion.matches ? 30 : 1560);
    updateMapContext();
  }

  function setTourPlaying(playing) {
    interactionState.tourPlaying = Boolean(playing);
    if (!interactionState.tourPlaying) clearTourTimer();
    else scheduleTourAdvance();
    updateTourPlayButton();
  }

  function hideGestureHint() {
    document.getElementById("mapGestureHint")?.classList.remove("is-visible");
  }

  function startTour(index = 0) {
    if (!interactionState.map) return;
    setupTourLayers();
    hideGestureHint();
    document.getElementById("mapStoryCard")?.classList.add("is-dismissed");
    if (window.setCulturalPanelOpen) window.setCulturalPanelOpen(false);
    else document.getElementById("rightPanel")?.classList.remove("open");

    interactionState.tourActive = true;
    interactionState.tourPlaying = true;
    document.body.classList.add("tour-active");
    document.body.dataset.tourActive = "true";

    const panel = document.getElementById("cityTourPanel");
    panel?.classList.add("is-visible");
    panel?.setAttribute("aria-hidden", "false");
    const toggle = document.getElementById("cityTourToggle");
    toggle?.setAttribute("aria-pressed", "true");
    toggle?.setAttribute("title", "结束城市漫游");
    toggle?.setAttribute("aria-label", "结束城市漫游");
    const toggleLabel = toggle?.querySelector("span");
    if (toggleLabel) toggleLabel.textContent = "结束漫游";

    setTourLayersVisible(true);
    window.refreshShopClusters?.();
    window.refreshRoadNameLabels?.();
    goToChapter(index);
  }

  function stopTour() {
    interactionState.tourActive = false;
    interactionState.tourPlaying = false;
    clearTourTimer();
    interactionState.map?.stop();
    document.body.classList.remove("tour-active");
    document.body.dataset.tourActive = "false";

    const panel = document.getElementById("cityTourPanel");
    panel?.classList.remove("is-visible");
    panel?.setAttribute("aria-hidden", "true");
    const photo = document.getElementById("tourPlacePhoto");
    photo?.classList.remove("is-visible", "is-loading", "is-ready", "is-error");
    photo?.classList.remove("is-layout-changing");
    photo?.setAttribute("aria-hidden", "true");
    delete document.body.dataset.tourPhotoLayout;
    const toggle = document.getElementById("cityTourToggle");
    toggle?.setAttribute("aria-pressed", "false");
    toggle?.setAttribute("title", "开启城市漫游");
    toggle?.setAttribute("aria-label", "开启城市漫游");
    const toggleLabel = toggle?.querySelector("span");
    if (toggleLabel) toggleLabel.textContent = "城市漫游";
    setTourLayersVisible(false);
    highlightChapterMarker();
    clearTourAnnotations();
    interactionState.selectedAnnotationIndex = -1;
    window.refreshShopClusters?.();
    window.refreshRoadNameLabels?.();
  }

  function toggleTour() {
    if (interactionState.tourActive) stopTour();
    else startTour(interactionState.chapterIndex);
  }

  function getContextForView(center, zoom) {
    let title = "二里半街巷";
    let description = "街巷与校园彼此交织";

    if (center.lng < 112.934) {
      title = "岳麓青岚";
      description = "山林、书院与城市相接";
    } else if (center.lng >= 112.957) {
      title = "湘江水岸";
      description = "江流、洲岸与远方相望";
    } else if (center.lat >= 28.184) {
      title = "校园年轮";
      description = "林荫、讲堂与青春相逢";
    } else if (center.lng < 112.943) {
      title = "师大文脉";
      description = "校门内外延续百年文气";
    }

    const scale = zoom >= 17 ? "近观" : zoom >= 15.4 ? "街巷" : "俯瞰";
    return { title, meta: `${scale} · ${description}` };
  }

  function updateMapContext() {
    interactionState.contextFrame = null;
    if (!interactionState.map || interactionState.markerHovering) return;
    const center = interactionState.map.getCenter();
    const chapter = chapters[interactionState.chapterIndex];
    const selectedAnnotation = chapter?.annotations?.[interactionState.selectedAnnotationIndex];
    const context = interactionState.tourActive
      ? {
          title: selectedAnnotation?.title || chapter.focusLabel,
          meta: selectedAnnotation?.note || `漫游第${chapter.number}章 · ${chapter.meta}`,
        }
      : getContextForView(center, interactionState.map.getZoom());
    const bearing = interactionState.map.getBearing();
    const ribbon = document.getElementById("mapContextRibbon");
    const needle = document.getElementById("compassNeedle");

    document.getElementById("mapContextEyebrow").textContent = interactionState.tourActive
      ? "本章现场"
      : "此刻所见";
    document.getElementById("mapContextTitle").textContent = context.title;
    document.getElementById("mapContextMeta").textContent = context.meta;
    ribbon.dataset.zone = context.title;
    needle.style.transform = `rotate(${-bearing}deg)`;
  }

  function requestMapContextUpdate() {
    if (interactionState.contextFrame) return;
    interactionState.contextFrame = window.requestAnimationFrame(updateMapContext);
  }

  function wakeMapContext() {
    const ribbon = document.getElementById("mapContextRibbon");
    ribbon?.classList.add("is-awake");
    window.clearTimeout(interactionState.contextWakeTimer);
    interactionState.contextWakeTimer = window.setTimeout(() => {
      ribbon?.classList.remove("is-awake");
    }, 900);
  }

  function createInkRipple(event) {
    const wrapper = document.querySelector(".map-wrapper");
    if (!wrapper) return;
    const marks = ["寻", "味", "游", "记"];
    const ripple = document.createElement("span");
    ripple.className = "map-ink-ripple";
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.left = `${event.point.x}px`;
    ripple.style.top = `${event.point.y}px`;
    ripple.innerHTML = `<i>${marks[interactionState.rippleCount % marks.length]}</i>`;
    wrapper.appendChild(ripple);
    interactionState.rippleCount += 1;
    wrapper.dataset.rippleCount = String(interactionState.rippleCount);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    window.setTimeout(() => ripple.remove(), 1300);
  }

  function bindTourControls() {
    const progress = document.getElementById("cityTourProgress");
    progress.innerHTML = chapters
      .map(
        (chapter, index) =>
          `<button class="tour-progress-dot" type="button" aria-label="第${index + 1}章：${chapter.title}" data-index="${index}"><span></span></button>`,
      )
      .join("");

    progress.addEventListener("click", (event) => {
      const dot = event.target.closest(".tour-progress-dot");
      if (!dot) return;
      goToChapter(Number(dot.dataset.index));
    });

    const toggle = document.getElementById("cityTourToggle");
    toggle?.addEventListener("click", toggleTour);
    toggle?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleTour();
      }
    });
    document.getElementById("cityTourClose")?.addEventListener("click", stopTour);
    document.getElementById("cityTourPrev")?.addEventListener("click", () => {
      goToChapter(interactionState.chapterIndex - 1);
    });
    document.getElementById("cityTourNext")?.addEventListener("click", () => {
      goToChapter(interactionState.chapterIndex + 1);
    });
    document.getElementById("cityTourPlay")?.addEventListener("click", () => {
      setTourPlaying(!interactionState.tourPlaying);
    });
    document.getElementById("cityTourWatch")?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-annotation-index]");
      if (!button) return;
      focusChapterAnnotation(Number(button.dataset.annotationIndex));
    });
    document.getElementById("tourPhotoCollage")?.addEventListener("click", (event) => {
      const cell = event.target.closest("button[data-photo-index]");
      if (!cell) return;
      selectTourPhoto(Number(cell.dataset.photoIndex), true);
    });

    document.addEventListener("keydown", (event) => {
      if (!interactionState.tourActive) return;
      if (event.key === "Escape") stopTour();
      if (event.target instanceof Element && event.target.matches("input, textarea, select")) return;
      if (event.key === "ArrowLeft") goToChapter(interactionState.chapterIndex - 1);
      if (event.key === "ArrowRight") goToChapter(interactionState.chapterIndex + 1);
    });
  }

  function initCulturalMapInteractions(mapInstance) {
    if (!mapInstance || interactionState.initialized) return;
    interactionState.initialized = true;
    interactionState.map = mapInstance;
    document.body.dataset.tourActive = "false";

    setupTourLayers();
    setupLandmarkBreaths();
    setupScenePoems();
    setupRiverResponse();
    bindTourControls();
    updateTourPanel();
    updateMapContext();
    trackLandmarkDeparture();

    mapInstance.on("move", () => {
      requestMapContextUpdate();
      wakeMapContext();
    });
    mapInstance.on("moveend", () => {
      updateMapContext();
      layoutTourAnnotations();
      updateScenePoems();
      trackLandmarkDeparture();
    });
    mapInstance.on("click", (event) => {
      hideGestureHint();
      createInkRipple(event);
    });
    mapInstance.on("dragstart", () => {
      hideGestureHint();
      if (interactionState.tourActive) setTourPlaying(false);
    });
    mapInstance.on("zoomstart", hideGestureHint);
    mapInstance.on("zoomend", updateScenePoems);
    window.addEventListener("resize", layoutTourAnnotations);

    window.setTimeout(() => {
      if (!interactionState.tourActive) {
        document.getElementById("mapGestureHint")?.classList.add("is-visible");
      }
    }, 2200);
  }

  function enhanceCulturalMarker(markerDom, feature, category) {
    if (!markerDom || markerDom.dataset.culturalEnhanced === "true") return;
    markerDom.dataset.culturalEnhanced = "true";
    const properties = feature?.properties || {};
    const name = readProperty(properties, ["名称", "name", "店名"], "城市切片");
    const type = readProperty(
      properties,
      ["类型", "type", "分类"],
      category === "food" ? "人间烟火" : "城市游兴",
    );
    const address = readProperty(properties, ["地址", "address"], "二里半街巷");
    const label = markerDom.querySelector(".marker-label");

    markerDom.insertAdjacentHTML("afterbegin", '<span class="marker-aura" aria-hidden="true"></span>');
    markerDom.dataset.shopName = name;
    markerDom.dataset.shopCategory = category;
    if (label) {
      label.innerHTML = `
        <span class="marker-label-kicker">${category === "food" ? "美食 · 人间烟火" : "休闲 · 城市游兴"}</span>
        <strong>${escapeMarkup(name)}</strong>
        <small>${escapeMarkup(type)} · ${escapeMarkup(address)}</small>
      `;
    }

    markerDom.addEventListener("pointerenter", () => {
      interactionState.markerHovering = true;
      const ribbon = document.getElementById("mapContextRibbon");
      ribbon?.classList.add("is-marker", "is-awake");
      document.getElementById("mapContextEyebrow").textContent =
        category === "food" ? "街巷食记" : "城市游记";
      document.getElementById("mapContextTitle").textContent = name;
      document.getElementById("mapContextMeta").textContent = "轻触题签 · 展开这一处城市切片";
    });
    markerDom.addEventListener("pointerleave", () => {
      interactionState.markerHovering = false;
      document.getElementById("mapContextRibbon")?.classList.remove("is-marker");
      window.setTimeout(updateMapContext, 80);
    });
  }

  function notifyCulturalMarkersReady(features) {
    if (!Array.isArray(features) || !features.length) return;
    interactionState.allFeatures = features;
    interactionState.culturalLandmarks = chapters.map((chapter, chapterIndex) => {
      let closest = null;
      let closestDistance = Infinity;
      features.forEach((feature) => {
        const coordinates = feature.geometry?.coordinates;
        if (!Array.isArray(coordinates)) return;
        const distance =
          (coordinates[0] - chapter.center[0]) ** 2 +
          (coordinates[1] - chapter.center[1]) ** 2;
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = feature;
        }
      });
      closest?._markerDom?.classList.add("is-cultural-highlight");
      closest?._markerDom?.setAttribute("data-tour-chapter", String(chapterIndex + 1));
      return closest?._markerDom || null;
    });
    highlightChapterMarker();
  }

  window.initCulturalMapInteractions = initCulturalMapInteractions;
  window.enhanceCulturalMarker = enhanceCulturalMarker;
  window.notifyCulturalMarkersReady = notifyCulturalMarkersReady;
  window.stopCulturalTour = stopTour;
  window.getCulturalInteractionState = () => ({
    initialized: interactionState.initialized,
    tourActive: interactionState.tourActive,
    tourPlaying: interactionState.tourPlaying,
    chapter: interactionState.chapterIndex + 1,
    rippleCount: interactionState.rippleCount,
    landmarkCount: interactionState.culturalLandmarks.filter(Boolean).length,
    annotationCount: interactionState.annotationMarkers.length,
    landmarkBreathCount: interactionState.landmarkMarkers.length,
    scenePoemCount: interactionState.poemMarkers.length,
    riverWakeCount: interactionState.riverWakeCount,
    contextMarkerCount: interactionState.allFeatures.filter((feature) =>
      feature?._markerDom?.classList.contains("is-tour-context"),
    ).length,
  });
})();
