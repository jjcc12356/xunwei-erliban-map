# 寻味二里半

长沙岳麓山—湖南师范大学—湘江一带的人文主题交互地图。

计划发布地址：https://jjcc12356.github.io/xunwei-erliban-map/

## 功能与代码

- `public/map/index.html`：静态网页入口，适配桌面与移动设备。
- `public/map/main.js`：MapLibre 场景、建筑、道路、商铺、搜索与地图标注。
- `public/map/interactions.js`：城市漫游、地点影像、十二时辰与人文交互。
- `public/map/effects.js`：烟雨、水面与环境效果。
- `public/map/experience.js`：界面体验与辅助交互。
- `public/map/search-index.js`：本地搜索索引。
- `public/map/css/`：宣纸、朱砂、青黛主题及响应式布局。
- `public/map/geojson/`：经过精简的地图数据。
- `public/map/road-labels.js`：由原始道路几何生成的轻量路名锚点；原始数据的名称缺失处不推测补名。
- `public/map/vendor/`：本地地图运行依赖，避免关键脚本依赖第三方 CDN。
- `scripts/build-road-labels.mjs`：离线从带 `name` 字段的原始道路 GeoJSON 生成路名。
- `.github/workflows/deploy-pages.yml`：只发布静态地图和已有分享封面，不发布开发环境。
- `app/`：原 Sites 版本的页面外壳，GitHub Pages 不依赖此服务端外壳。

## 运行与发布

用任意静态 HTTP 服务打开 `public/map/index.html`，不要直接双击 HTML 使用 `file://` 协议。

GitHub 仓库 Settings → Pages → Source 选择 GitHub Actions。向 `main` 推送后自动发布；访问者无需 GitHub 或 ChatGPT 账号。

重新生成路名：`node scripts/build-road-labels.mjs <原始roads.geojson的路径>`。

## 数据说明

这是地图制图实习展示项目，不是实时导航服务。道路、商铺与营业信息以采集时的数据为准；现场情况可能变化。影像及第三方库保留各自来源和权利，本仓库公开不代表自动授予这些素材的再分发许可。
