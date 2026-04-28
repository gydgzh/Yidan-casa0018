# Web Avatar (Three.js + @pixiv/three-vrm)

接收 WebSocket 上的 ARKit blendshape 帧,驱动 VRM 虚拟人。

## 安装与启动
```bash
cd web_avatar
npm install
npm run dev      # http://localhost:5173
```
启动前请确认 `public/models/avatar.vrm` 已存在(执行 `scripts/download_assets.sh`)。

## 关键文件
- `src/main.js`        — 渲染循环 + WebSocket 接入
- `src/arkitToVrm.js`  — ARKit 52 blendshapes → VRM expressionPreset 映射
- `src/oneEuroFilter.js` — One-Euro 平滑(去抖动)

## 没有 iPhone 的时候怎么测?
打开本仓库的 `web_browser_fallback/index.html`(用浏览器 MediaPipe Face Landmarker 在前端直出
ARKit-style blendshapes),它会通过同一个 relay 把帧发到本页面,不用换代码。
