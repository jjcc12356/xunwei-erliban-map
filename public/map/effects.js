(function () {
  "use strict";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let savedEffectSetting = null;
  try {
    savedEffectSetting = localStorage.getItem("dynamicEffects");
  } catch (error) {
    savedEffectSetting = null;
  }

  const effectState = {
    enabled:
      savedEffectSetting === null
        ? !motionPreference.matches
        : savedEffectSetting === "on",
    reducedMotion: motionPreference.matches,
    interacting: false,
    water: null,
    weather: null,
    waterFrames: 0,
    weatherFrames: 0,
    waterStatus: "waiting",
    constrainedDevice:
      window.matchMedia("(max-width: 820px)").matches ||
      (navigator.hardwareConcurrency || 8) <= 4,
  };

  function updateEffectToggle() {
    const toggle = document.getElementById("effectToggle");
    if (!toggle) return;

    toggle.setAttribute("aria-pressed", String(effectState.enabled));
    const toggleDescription = effectState.enabled
      ? "关闭潇湘烟雨与动态水纹"
      : "开启潇湘烟雨与动态水纹";
    toggle.title = toggleDescription;
    toggle.setAttribute("aria-label", toggleDescription);

    const label = toggle.querySelector("span");
    const icon = toggle.querySelector("i");
    if (label) label.textContent = effectState.enabled ? "潇湘烟雨" : "唤起烟雨";
    if (icon) icon.className = effectState.enabled ? "fa fa-tint" : "fa fa-circle-o";
  }

  function setDynamicEffectsEnabled(enabled, persist = true) {
    effectState.enabled = Boolean(enabled);
    document.body?.classList.toggle("effects-off", !effectState.enabled);
    effectState.water?.setEnabled(effectState.enabled);
    effectState.weather?.setEnabled(effectState.enabled);
    updateEffectToggle();

    if (persist) {
      savedEffectSetting = effectState.enabled ? "on" : "off";
      try {
        localStorage.setItem("dynamicEffects", savedEffectSetting);
      } catch (error) {
        // 隐私模式下存储可能不可用，不影响本次切换。
      }
    }
  }

  function toggleDynamicEffects() {
    setDynamicEffectsEnabled(!effectState.enabled);
  }

  function setMapEffectsInteracting(interacting) {
    effectState.interacting = Boolean(interacting);
    document.body.dataset.effectsQuality = effectState.interacting
      ? "interactive"
      : "full";
  }

  function bindEffectToggle() {
    const toggle = document.getElementById("effectToggle");
    if (!toggle || toggle.dataset.effectBound === "true") return;

    toggle.dataset.effectBound = "true";
    toggle.addEventListener("click", toggleDynamicEffects);
    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDynamicEffects();
      }
    });
  }

  function createRainDrop(width, height, startInside = false) {
    const depth = Math.pow(Math.random(), 0.72);
    const perspective = 0.48 + depth * 1.08;
    return {
      x: Math.random() * (width + 160) - 80,
      y: startInside ? Math.random() * height : -30 - Math.random() * height * 0.25,
      length: (7 + Math.random() * 15) * perspective,
      speed: (68 + Math.random() * 105) * perspective,
      drift: (13 + Math.random() * 15) * perspective,
      alpha: 0.075 + depth * 0.2 + Math.random() * 0.055,
      width: 0.48 + depth * 0.72,
      depth,
    };
  }

  function initAmbientEffects() {
    bindEffectToggle();
    updateEffectToggle();
    document.body?.classList.toggle("effects-off", !effectState.enabled);

    if (effectState.weather) return effectState.weather;

    const canvas = document.getElementById("ambientWeatherCanvas");
    if (!canvas) return null;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return null;

    let viewportWidth = 0;
    let viewportHeight = 0;
    let drops = [];
    let lastFrameTime = 0;
    let enabled = effectState.enabled;
    let animationFrame = 0;

    function resizeWeatherCanvas() {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        effectState.constrainedDevice ? 1.15 : 1.35,
      );
      viewportWidth = Math.max(1, bounds.width);
      viewportHeight = Math.max(1, bounds.height);
      canvas.width = Math.round(viewportWidth * pixelRatio);
      canvas.height = Math.round(viewportHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const density = effectState.reducedMotion ? 21 : 6.2;
      const dropCount = Math.max(
        effectState.reducedMotion ? 40 : 82,
        Math.min(effectState.reducedMotion ? 74 : 240, Math.round(viewportWidth / density)),
      );
      canvas.dataset.rainDrops = String(dropCount);
      canvas.dataset.fogBanks = "5";
      canvas.dataset.renderer = "layered-xiaoxiang-rain-v2";
      canvas.dataset.quality = effectState.constrainedDevice ? "balanced" : "full";
      drops = Array.from({ length: dropCount }, () =>
        createRainDrop(viewportWidth, viewportHeight, true),
      );
    }

    function drawMist(now, evening) {
      const time = now * 0.001;
      const fogColor = evening ? "126, 159, 153" : "124, 151, 143";
      const highlightColor = evening ? "191, 215, 207" : "229, 235, 222";
      const fogBanks = [
        { y: 0.12, radius: 0.34, speed: 8, offset: 0.04, alpha: 0.18 },
        { y: 0.3, radius: 0.27, speed: -5, offset: 0.47, alpha: 0.135 },
        { y: 0.52, radius: 0.38, speed: 6, offset: 0.78, alpha: 0.16 },
        { y: 0.73, radius: 0.3, speed: -7, offset: 0.24, alpha: 0.145 },
        { y: 0.9, radius: 0.4, speed: 4, offset: 0.62, alpha: 0.125 },
      ];

      context.save();
      context.globalCompositeOperation = evening ? "screen" : "source-over";
      context.filter = "blur(9px)";
      for (const bank of fogBanks) {
        const radius = Math.max(260, viewportWidth * bank.radius);
        const travel = viewportWidth + radius * 2;
        const rawX = viewportWidth * bank.offset + time * bank.speed;
        const centerX = ((rawX + radius) % travel + travel) % travel - radius;
        const centerY = viewportHeight * bank.y + Math.sin(time * 0.08 + bank.offset * 9) * 18;

        for (let lobe = -1; lobe <= 1; lobe += 1) {
          const lobeX = centerX + lobe * radius * 0.52;
          const lobeY = centerY + Math.sin(lobe * 2.1 + bank.offset * 7) * 24;
          context.save();
          context.translate(lobeX, lobeY);
          context.scale(1, 0.22 + (lobe + 1) * 0.025);
          const mist = context.createRadialGradient(0, 0, 0, 0, 0, radius);
          mist.addColorStop(0, `rgba(${highlightColor}, ${bank.alpha * 0.72})`);
          mist.addColorStop(0.38, `rgba(${fogColor}, ${bank.alpha})`);
          mist.addColorStop(0.72, `rgba(${fogColor}, ${bank.alpha * 0.38})`);
          mist.addColorStop(1, `rgba(${fogColor}, 0)`);
          context.fillStyle = mist;
          context.beginPath();
          context.arc(0, 0, radius, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      }

      // 数条更纤细的烟缕从雾带中穿出，强化“烟岚”而不是白色滤镜。
      context.filter = "blur(14px)";
      context.lineCap = "round";
      context.setLineDash([viewportWidth * 0.26, viewportWidth * 0.2]);
      for (let index = 0; index < 5; index += 1) {
        const baseY = viewportHeight * (0.16 + index * 0.18);
        const drift = time * (5 + index * 0.7) + index * 170;
        context.beginPath();
        context.moveTo(-180, baseY + Math.sin(time * 0.16 + index) * 18);
        context.bezierCurveTo(
          viewportWidth * 0.25,
          baseY - 46 + Math.sin(time * 0.11 + index * 2) * 26,
          viewportWidth * 0.68,
          baseY + 52 + Math.cos(time * 0.13 + index) * 22,
          viewportWidth + 180,
          baseY - 12,
        );
        context.lineDashOffset = -drift;
        context.lineWidth = 18 + index * 4;
        context.strokeStyle = evening
          ? "rgba(176, 205, 197, .085)"
          : "rgba(105, 134, 126, .085)";
        context.stroke();
      }
      context.setLineDash([]);
      context.filter = "none";

      const veil = context.createLinearGradient(0, 0, 0, viewportHeight);
      veil.addColorStop(0, `rgba(${fogColor}, ${evening ? 0.025 : 0.035})`);
      veil.addColorStop(0.5, `rgba(${fogColor}, ${evening ? 0.012 : 0.02})`);
      veil.addColorStop(1, `rgba(${highlightColor}, ${evening ? 0.045 : 0.06})`);
      context.fillStyle = veil;
      context.fillRect(0, 0, viewportWidth, viewportHeight);
      context.restore();
    }

    function requestWeatherFrame() {
      if (!animationFrame && enabled && !document.hidden) {
        animationFrame = window.requestAnimationFrame(drawWeather);
      }
    }

    function stopWeatherFrame() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function drawWeather(now) {
      animationFrame = 0;
      if (!enabled || document.hidden) return;
      requestWeatherFrame();

      const frameInterval = effectState.interacting
        ? 112
        : effectState.reducedMotion
          ? 84
          : effectState.constrainedDevice
            ? 50
            : 40;
      if (now - lastFrameTime < frameInterval) return;
      const delta = Math.min(0.08, (now - lastFrameTime) / 1000 || 0.033);
      lastFrameTime = now;

      context.clearRect(0, 0, viewportWidth, viewportHeight);
      const evening = document.body.classList.contains("evening");
      drawMist(now, evening);

      context.save();
      context.lineCap = "round";
      for (const drop of drops) {
        drop.x += drop.drift * delta;
        drop.y += drop.speed * delta;
        if (drop.y > viewportHeight + 35 || drop.x > viewportWidth + 90) {
          Object.assign(drop, createRainDrop(viewportWidth, viewportHeight));
        }

        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x + drop.length * 0.22, drop.y + drop.length);
        context.lineWidth = drop.width;
        context.strokeStyle = evening
          ? `rgba(206, 229, 220, ${drop.alpha * 1.12})`
          : `rgba(51, 82, 76, ${drop.alpha})`;
        context.stroke();

        if (drop.depth > 0.82) {
          context.beginPath();
          context.moveTo(drop.x + 0.6, drop.y + 1);
          context.lineTo(
            drop.x + drop.length * 0.22 + 0.6,
            drop.y + drop.length * 0.72,
          );
          context.lineWidth = Math.max(0.35, drop.width * 0.34);
          context.strokeStyle = evening
            ? `rgba(243, 249, 239, ${drop.alpha * 0.8})`
            : `rgba(224, 235, 224, ${drop.alpha * 0.58})`;
          context.stroke();
        }
      }
      context.restore();

      effectState.weatherFrames += 1;
      canvas.dataset.frame = String(effectState.weatherFrames);
      canvas.dataset.active = "true";
    }

    const controller = {
      setEnabled(nextEnabled) {
        enabled = Boolean(nextEnabled);
        canvas.dataset.active = String(enabled);
        canvas.classList.toggle("is-paused", !enabled);
        if (!enabled) {
          stopWeatherFrame();
          context.clearRect(0, 0, viewportWidth, viewportHeight);
        } else {
          lastFrameTime = 0;
          requestWeatherFrame();
        }
      },
      resize: resizeWeatherCanvas,
    };

    effectState.weather = controller;
    resizeWeatherCanvas();
    window.addEventListener("resize", resizeWeatherCanvas, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopWeatherFrame();
      else requestWeatherFrame();
    });
    controller.setEnabled(effectState.enabled);
    return controller;
  }

  function visitCoordinates(value, callback) {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      callback(value);
      return;
    }
    value.forEach((child) => visitCoordinates(child, callback));
  }

  function getWaterBounds(geojson) {
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    geojson.features.forEach((feature) => {
      visitCoordinates(feature.geometry?.coordinates, ([longitude, latitude]) => {
        bounds[0] = Math.min(bounds[0], longitude);
        bounds[1] = Math.min(bounds[1], latitude);
        bounds[2] = Math.max(bounds[2], longitude);
        bounds[3] = Math.max(bounds[3], latitude);
      });
    });
    return bounds;
  }

  function buildWaterPath(geojson, bounds, width, height) {
    const [west, south, east, north] = bounds;
    const path = new Path2D();
    const project = ([longitude, latitude]) => [
      ((longitude - west) / (east - west)) * width,
      ((north - latitude) / (north - south)) * height,
    ];

    function addRing(ring) {
      if (!ring?.length) return;
      ring.forEach((coordinate, index) => {
        const [x, y] = project(coordinate);
        if (index === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      path.closePath();
    }

    function addPolygon(polygon) {
      polygon.forEach(addRing);
    }

    geojson.features.forEach((feature) => {
      if (feature.geometry?.type === "Polygon") addPolygon(feature.geometry.coordinates);
      if (feature.geometry?.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach(addPolygon);
      }
    });
    return path;
  }

  async function initAnimatedWater(mapInstance) {
    if (!mapInstance || effectState.water || effectState.waterStatus === "loading") {
      return effectState.water;
    }

    const canvas = document.getElementById("waterMotionCanvas");
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return null;

    effectState.waterStatus = "loading";
    canvas.dataset.status = "loading";

    try {
      const response = await fetch("./geojson/water-scene.geojson?v=20260823-1");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const waterData = await response.json();
      const bounds = getWaterBounds(waterData);
      const waterPath = buildWaterPath(
        waterData,
        bounds,
        canvas.width,
        canvas.height,
      );

      let enabled = effectState.enabled;
      let lastFrameTime = 0;
      let animationFrame = 0;

      function sampleWaterSurface(count) {
        const points = [];
        const maxAttempts = count * 220;
        let attempts = 0;
        while (points.length < count && attempts < maxAttempts) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          if (context.isPointInPath(waterPath, x, y, "evenodd")) {
            points.push({ x, y });
          }
          attempts += 1;
        }
        return points;
      }

      function makeFlowTexture() {
        const texture = document.createElement("canvas");
        const size = 192;
        texture.width = size;
        texture.height = size;
        const textureContext = texture.getContext("2d");
        const pixels = textureContext.createImageData(size, size);

        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            const index = (y * size + x) * 4;
            const waveA = Math.sin(x * 0.12 + Math.sin(y * 0.037) * 2.4);
            const waveB = Math.sin(y * 0.085 + x * 0.026);
            const waveC = Math.sin((x + y) * 0.043);
            const turbulence = (waveA + waveB * 0.7 + waveC * 0.45 + 2.15) / 4.3;
            const grain = Math.random() * 0.24;
            const alpha = Math.round(34 + (turbulence * 0.76 + grain) * 88);
            pixels.data[index] = 220;
            pixels.data[index + 1] = 244;
            pixels.data[index + 2] = 236;
            pixels.data[index + 3] = alpha;
          }
        }
        textureContext.putImageData(pixels, 0, 0);
        return texture;
      }

      const flowTexture = makeFlowTexture();
      const shimmerPoints = sampleWaterSurface(360).map((point) => ({
        ...point,
        seed: Math.random() * 40,
        speed: 0.62 + Math.random() * 1.4,
        size: 0.8 + Math.random() * 3.4,
        sway: 2 + Math.random() * 7,
      }));
      const ripplePoints = sampleWaterSurface(105).map((point) => ({
        ...point,
        seed: Math.random(),
        speed: 0.09 + Math.random() * 0.14,
        radius: 11 + Math.random() * 20,
      }));
      const lightPools = sampleWaterSurface(46).map((point) => ({
        ...point,
        seed: Math.random() * Math.PI * 2,
        radius: 18 + Math.random() * 54,
        speed: 0.35 + Math.random() * 0.65,
      }));
      const currentLanes = Array.from({ length: 24 }, (_, index) => ({
        x: ((index + 0.5) / 24) * canvas.width + (Math.random() - 0.5) * 28,
        bend: (Math.random() - 0.5) * 72,
        width: 8 + Math.random() * 28,
        speed: 17 + Math.random() * 28,
        seed: Math.random() * 90,
        light: Math.random() > 0.45,
      }));

      function paintWater(now) {
        const width = canvas.width;
        const height = canvas.height;
        const phase = now * 0.001;
        const evening = document.body.classList.contains("evening");

        context.clearRect(0, 0, width, height);
        context.fillStyle = evening
          ? "rgba(31, 75, 78, .34)"
          : "rgba(42, 113, 108, .2)";
        context.fill(waterPath, "evenodd");

        context.save();
        context.clip(waterPath, "evenodd");

        const depthGradient = context.createLinearGradient(0, 0, width, height);
        depthGradient.addColorStop(
          0,
          evening ? "rgba(122, 171, 165, .18)" : "rgba(217, 239, 226, .24)",
        );
        depthGradient.addColorStop(
          0.36,
          evening ? "rgba(35, 78, 82, .16)" : "rgba(45, 111, 111, .13)",
        );
        depthGradient.addColorStop(
          0.68,
          evening ? "rgba(18, 58, 65, .22)" : "rgba(30, 91, 94, .18)",
        );
        depthGradient.addColorStop(
          1,
          evening ? "rgba(145, 188, 180, .16)" : "rgba(197, 231, 219, .2)",
        );
        context.fillStyle = depthGradient;
        context.fillRect(0, 0, width, height);

        // 细密水面纹理由南向北缓慢漂移，避免规则的平行线感。
        const textureSize = flowTexture.width;
        const textureOffsetY = (phase * 20) % textureSize;
        const textureOffsetX = Math.sin(phase * 0.18) * 18;
        context.save();
        context.globalCompositeOperation = "screen";
        context.globalAlpha = evening ? 0.13 : 0.2;
        context.filter = "blur(0.55px)";
        for (let y = -textureSize; y < height + textureSize; y += textureSize) {
          for (let x = -textureSize; x < width + textureSize; x += textureSize) {
            context.drawImage(
              flowTexture,
              x + textureOffsetX,
              y - textureOffsetY,
            );
          }
        }
        context.restore();

        // 宽而柔和的暗流与亮流沿湘江主方向推进，形成真实的流速差。
        context.save();
        context.lineCap = "round";
        context.lineJoin = "round";
        context.filter = "blur(7px)";
        for (const lane of currentLanes) {
          const sway = Math.sin(phase * 0.21 + lane.seed) * 9;
          context.beginPath();
          context.moveTo(lane.x - lane.bend * 0.28 + sway, height + 90);
          context.bezierCurveTo(
            lane.x + lane.bend + sway,
            height * 0.72,
            lane.x - lane.bend + sway,
            height * 0.3,
            lane.x + lane.bend * 0.35 + sway,
            -90,
          );
          context.setLineDash([105 + lane.width, 54, 32, 82]);
          context.lineDashOffset = phase * lane.speed + lane.seed;
          context.lineWidth = lane.width;
          context.strokeStyle = lane.light
            ? evening
              ? "rgba(126, 177, 171, .075)"
              : "rgba(218, 240, 225, .11)"
            : evening
              ? "rgba(7, 37, 45, .1)"
              : "rgba(14, 69, 76, .085)";
          context.stroke();
        }
        context.restore();

        // 柔和的水面反光块随流向上移，不呈现机械重复的波纹。
        context.save();
        context.globalCompositeOperation = "screen";
        context.filter = "blur(9px)";
        context.fillStyle = evening
          ? "rgba(162, 205, 196, .075)"
          : "rgba(241, 246, 222, .12)";
        for (const pool of lightPools) {
          const travel = (phase * pool.speed * 8 + pool.seed * 16) % height;
          const y = (pool.y - travel + height) % height;
          const x = pool.x + Math.sin(phase * 0.3 + pool.seed) * 7;
          context.beginPath();
          context.ellipse(x, y, pool.radius * 0.42, pool.radius, 0.06, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();

        // 不同速度的小型高光碎片，模拟波峰、漂沫和水面的闪动。
        context.save();
        context.globalCompositeOperation = "screen";
        context.lineCap = "round";
        for (const point of shimmerPoints) {
          const travel = phase * point.speed * 21 + point.seed * 13;
          const y = (point.y - travel + height * 3) % height;
          const x =
            point.x +
            Math.sin(y * 0.026 + phase * 0.72 + point.seed) * point.sway;
          const flicker = 0.42 + Math.sin(phase * 2.3 + point.seed) * 0.28;
          context.beginPath();
          context.moveTo(x - point.size * 1.8, y);
          context.quadraticCurveTo(x, y - point.size * 0.8, x + point.size * 2.2, y + 0.3);
          context.lineWidth = 0.55 + point.size * 0.24;
          context.strokeStyle = evening
            ? `rgba(212, 235, 225, ${0.09 + flicker * 0.13})`
            : `rgba(255, 249, 219, ${0.12 + flicker * 0.2})`;
          context.stroke();
        }
        context.restore();

        // 随机扩散的椭圆涟漪，让湖面与宽阔河面拥有局部生命感。
        context.save();
        context.lineWidth = 0.8;
        for (const ripple of ripplePoints) {
          const cycle = (phase * ripple.speed + ripple.seed) % 1;
          const fade = Math.sin(cycle * Math.PI) * (1 - cycle * 0.42);
          const radius = 3 + ripple.radius * cycle;
          context.beginPath();
          context.ellipse(
            ripple.x,
            ripple.y,
            radius,
            radius * 0.28,
            Math.sin(ripple.seed * 14) * 0.18,
            Math.PI * 0.08,
            Math.PI * 0.92,
          );
          context.strokeStyle = evening
            ? `rgba(190, 220, 211, ${fade * 0.16})`
            : `rgba(245, 246, 221, ${fade * 0.25})`;
          context.stroke();
        }
        context.restore();

        // 岸边碎浪：两层不规则白沫仅贴着真实河湖边界运动。
        context.save();
        context.clip(waterPath, "evenodd");
        context.lineCap = "round";
        context.filter = "blur(2.4px)";
        context.setLineDash([18, 10, 4, 14, 28, 7]);
        context.lineDashOffset = -phase * 7;
        context.lineWidth = 5.5;
        context.strokeStyle = evening
          ? "rgba(185, 217, 208, .18)"
          : "rgba(241, 244, 220, .25)";
        context.stroke(waterPath);
        context.filter = "none";
        context.setLineDash([2, 7, 11, 5, 4, 13]);
        context.lineDashOffset = phase * 9;
        context.lineWidth = 1.6;
        context.strokeStyle = evening
          ? "rgba(224, 238, 229, .36)"
          : "rgba(255, 251, 226, .52)";
        context.stroke(waterPath);
        context.restore();

        context.restore();
        effectState.waterFrames += 1;
        canvas.dataset.frame = String(effectState.waterFrames);
        canvas.dataset.renderer = "layered-flow-v2";
        canvas.dataset.surfacePoints = String(shimmerPoints.length);
      }

      function requestWaterFrame() {
        if (!animationFrame && enabled && !document.hidden) {
          animationFrame = window.requestAnimationFrame(animateWater);
        }
      }

      function stopWaterFrame() {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }

      function animateWater(now) {
        animationFrame = 0;
        if (!enabled || document.hidden) return;
        requestWaterFrame();
        const frameInterval = effectState.interacting
          ? 145
          : effectState.reducedMotion
            ? 105
            : effectState.constrainedDevice
              ? 68
              : 54;
        if (now - lastFrameTime < frameInterval) return;
        lastFrameTime = now;
        paintWater(now);
      }

      paintWater(performance.now());
      mapInstance.addSource("water-motion", {
        type: "canvas",
        canvas,
        animate: effectState.enabled,
        coordinates: [
          [bounds[0], bounds[3]],
          [bounds[2], bounds[3]],
          [bounds[2], bounds[1]],
          [bounds[0], bounds[1]],
        ],
      });

      const beforeLayer = mapInstance.getLayer("roads-casing")
        ? "roads-casing"
        : undefined;
      mapInstance.addLayer(
        {
          id: "water-motion-layer",
          type: "raster",
          source: "water-motion",
          layout: {
            visibility: effectState.enabled ? "visible" : "none",
          },
          paint: {
            "raster-opacity": 0.86,
            "raster-fade-duration": 0,
            "raster-resampling": "linear",
          },
        },
        beforeLayer,
      );

      const controller = {
        setEnabled(nextEnabled) {
          enabled = Boolean(nextEnabled);
          canvas.dataset.active = String(enabled);
          if (mapInstance.getLayer("water-motion-layer")) {
            mapInstance.setLayoutProperty(
              "water-motion-layer",
              "visibility",
              enabled ? "visible" : "none",
            );
          }

          const source = mapInstance.getSource("water-motion");
          if (enabled) {
            paintWater(performance.now());
            source?.play?.();
            requestWaterFrame();
          } else {
            stopWaterFrame();
            source?.pause?.();
          }
        },
      };

      effectState.water = controller;
      effectState.waterStatus = "ready";
      canvas.dataset.status = "ready";
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopWaterFrame();
        else requestWaterFrame();
      });
      controller.setEnabled(effectState.enabled);
      return controller;
    } catch (error) {
      effectState.waterStatus = "error";
      canvas.dataset.status = "error";
      console.warn("动态水纹未能加载：", error);
      return null;
    }
  }

  motionPreference.addEventListener?.("change", (event) => {
    effectState.reducedMotion = event.matches;
    if (savedEffectSetting === null) setDynamicEffectsEnabled(!event.matches, false);
  });

  window.initAmbientEffects = initAmbientEffects;
  window.initAnimatedWater = initAnimatedWater;
  window.setDynamicEffectsEnabled = setDynamicEffectsEnabled;
  window.setMapEffectsInteracting = setMapEffectsInteracting;
  window.getDynamicEffectsState = () => ({
    enabled: effectState.enabled,
    reducedMotion: effectState.reducedMotion,
    interacting: effectState.interacting,
    waterFrames: effectState.waterFrames,
    weatherFrames: effectState.weatherFrames,
    waterStatus: effectState.waterStatus,
    constrainedDevice: effectState.constrainedDevice,
  });
})();
