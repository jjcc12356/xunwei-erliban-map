(function () {
  "use strict";

  const modeContent = {
    landscape: {
      label: "山水",
      note: "看山形、水势与岳麓青岚",
      context: "山水阅读 · 地形与江流成为主角",
    },
    culture: {
      label: "文脉",
      note: "沿书院、校园与建筑阅读城市",
      context: "文脉阅读 · 校园与历史地标被重新照亮",
    },
    life: {
      label: "烟火",
      note: "循街巷、小店与夜色寻找日常",
      context: "烟火阅读 · 道路与生活点位更加清晰",
    },
  };

  const xiangTimes = [
    { key: "zi", branch: "子时", alias: "夜半", hour: 0, verse: "湘江收尽灯影，岳麓只余风声。", watch: "江面暗流与零星灯火" },
    { key: "chou", branch: "丑时", alias: "鸡鸣", hour: 2, verse: "城声渐歇，巷口仍留一盏夜灯。", watch: "夜色里的街巷轮廓" },
    { key: "yin", branch: "寅时", alias: "平旦", hour: 4, verse: "天色未明，山脊先从墨色里醒来。", watch: "岳麓山形与初起薄雾" },
    { key: "mao", branch: "卯时", alias: "日出", hour: 6, verse: "晨光越过山门，落在书院檐角。", watch: "屋顶、树冠与校园晨光" },
    { key: "chen", branch: "辰时", alias: "食时", hour: 8, verse: "木兰路渐热，一城从早餐香气醒来。", watch: "食堂、小店与上课人流" },
    { key: "si", branch: "巳时", alias: "隅中", hour: 10, verse: "日光照清街巷，建筑显出生活尺度。", watch: "道路层级与院落关系" },
    { key: "wu", branch: "午时", alias: "日中", hour: 12, verse: "江面铺开碎银，城市轮廓最分明。", watch: "湘江、洲岸与建筑高差" },
    { key: "wei", branch: "未时", alias: "日昳", hour: 14, verse: "树影偏斜，校园的午后慢下来。", watch: "林荫、球场与讲堂" },
    { key: "shen", branch: "申时", alias: "哺时", hour: 16, verse: "人声重新聚拢，街巷开始预备晚餐。", watch: "小店门面与生活节点" },
    { key: "you", branch: "酉时", alias: "日入", hour: 18, verse: "夕照贴近湘江，屋顶染上一层暖赭。", watch: "江岸落日与屋顶颜色" },
    { key: "xu", branch: "戌时", alias: "黄昏", hour: 20, verse: "摊灯次第亮起，油烟街有了温度。", watch: "夜市、宿舍与晚归动线" },
    { key: "hai", branch: "亥时", alias: "人定", hour: 22, verse: "灯火沉入江雾，城市回到安静呼吸。", watch: "水面倒影与远处灯带" },
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentMode = readStorage("mapReadingMode", "landscape");
  let currentHour = Number(readStorage("culturalHour", "14"));
  let timeTimer = null;

  function readStorage(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      // 存储不可用时仍保留本次体验。
    }
  }

  function periodForHour(hour) {
    if (hour >= 5 && hour < 8) return { key: "dawn", label: "晨雾" };
    if (hour >= 8 && hour < 12) return { key: "morning", label: "日上" };
    if (hour >= 12 && hour < 17) return { key: "afternoon", label: "午后" };
    if (hour >= 17 && hour < 19) return { key: "dusk", label: "薄暮" };
    if (hour >= 19 && hour < 23) return { key: "evening", label: "灯火" };
    return { key: "night", label: "夜深" };
  }

  function xiangTimeForHour(hour) {
    return xiangTimes[Math.floor(((hour + 1) % 24) / 2)];
  }

  function renderXiangTimeTrack() {
    const track = document.getElementById("xiangTimeTrack");
    if (!track) return;
    track.innerHTML = xiangTimes
      .map(
        (item, index) => `
          <button type="button" data-xiang-index="${index}" aria-label="${item.branch}，${item.alias}" aria-pressed="false">
            <span>${item.branch.slice(0, 1)}</span><small>${item.alias}</small>
          </button>`,
      )
      .join("");
    track.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-xiang-index]");
      if (!button) return;
      setTimePlaying(false);
      setHour(xiangTimes[Number(button.dataset.xiangIndex)]?.hour ?? currentHour);
    });
  }

  function setMode(mode, persist = true) {
    if (!modeContent[mode]) return;
    currentMode = mode;
    document.body.dataset.mapReadingMode = mode;
    document.querySelectorAll("[data-reading-mode]").forEach((button) => {
      const active = button.dataset.readingMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const note = document.getElementById("readingModeNote");
    if (note) note.textContent = modeContent[mode].note;
    window.applyCulturalMapMode?.(mode);
    if (!document.body.classList.contains("tour-active")) {
      const eyebrow = document.getElementById("mapContextEyebrow");
      const meta = document.getElementById("mapContextMeta");
      if (eyebrow) eyebrow.textContent = `${modeContent[mode].label}读城`;
      if (meta) meta.textContent = modeContent[mode].context;
    }
    if (persist) writeStorage("mapReadingMode", mode);
  }

  function setHour(hour, persist = true) {
    currentHour = ((Math.round(Number(hour)) % 24) + 24) % 24;
    const period = periodForHour(currentHour);
    const xiangTime = xiangTimeForHour(currentHour);
    const range = document.getElementById("cityTimeRange");
    const value = document.getElementById("cityTimeValue");
    const label = document.getElementById("cityTimePeriod");
    if (range) range.value = String(currentHour);
    if (value) value.textContent = `${String(currentHour).padStart(2, "0")}:00`;
    if (label) label.textContent = period.label;
    document.body.dataset.dayPeriod = period.key;
    document.body.dataset.xiangTime = xiangTime.key;
    const xiangName = document.getElementById("xiangTimeName");
    const xiangVerse = document.getElementById("xiangTimeVerse");
    const xiangWatch = document.getElementById("xiangTimeWatch");
    if (xiangName) xiangName.textContent = `${xiangTime.branch} · ${xiangTime.alias}`;
    if (xiangVerse) xiangVerse.textContent = xiangTime.verse;
    if (xiangWatch) xiangWatch.textContent = `此刻宜看 · ${xiangTime.watch}`;
    document.querySelectorAll("#xiangTimeTrack button").forEach((button, index) => {
      const active = xiangTimes[index]?.key === xiangTime.key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    window.applyCulturalHour?.(currentHour);
    if (persist) writeStorage("culturalHour", currentHour);
  }

  function setTimePlaying(playing) {
    window.clearInterval(timeTimer);
    timeTimer = null;
    const button = document.getElementById("cityTimePlay");
    const active = Boolean(playing) && !reduceMotion.matches;
    button?.setAttribute("aria-pressed", String(active));
    button?.setAttribute("aria-label", active ? "暂停城市时辰" : "让城市时辰缓慢流动");
    const icon = button?.querySelector("i");
    if (icon) icon.className = active ? "fa fa-pause" : "fa fa-play";
    if (!active) return;
    timeTimer = window.setInterval(() => {
      if (document.hidden || document.body.classList.contains("map-interacting")) return;
      setHour(currentHour + 1);
    }, 1700);
  }

  function initReadingExperience() {
    renderXiangTimeTrack();
    document.querySelectorAll("[data-reading-mode]").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.readingMode));
    });
    document.getElementById("cityTimeRange")?.addEventListener("input", (event) => {
      setTimePlaying(false);
      setHour(event.target.value);
    });
    document.getElementById("cityTimePlay")?.addEventListener("click", (event) => {
      setTimePlaying(event.currentTarget.getAttribute("aria-pressed") !== "true");
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) setTimePlaying(false);
    });
    setMode(currentMode, false);
    setHour(Number.isFinite(currentHour) ? currentHour : 14, false);
  }

  window.addEventListener("cultural-map-ready", () => {
    setMode(currentMode, false);
    setHour(currentHour, false);
  });
  window.addEventListener("cultural-hour-sync", (event) => {
    setTimePlaying(false);
    setHour(event.detail?.hour ?? currentHour, false);
  });
  window.getReadingExperienceState = () => ({
    mode: currentMode,
    hour: currentHour,
    period: periodForHour(currentHour).key,
    xiangTime: xiangTimeForHour(currentHour).key,
    timePlaying: Boolean(timeTimer),
  });
  document.addEventListener("DOMContentLoaded", initReadingExperience, { once: true });
})();
