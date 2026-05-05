# Browser-only Fallback (MediaPipe Face Landmarker → relay)

如果暂时没接入 iPhone,或想做 ARKit vs. MediaPipe 的延迟对比实验,用这个。

## 启动
```bash
# 1) 先开 relay
cd ../relay_server && npm start &

# 2) 用任何静态服务器跑这个目录(npx serve 即可)
cd ../web_browser_fallback
npx --yes serve -l 8000
# 然后浏览器打开 http://localhost:8000
```
点 **Start camera + MediaPipe** 后,会用前置摄像头 +
MediaPipe Face Landmarker v2 实时输出 52 个 ARKit-命名 blendshape,
和 iPhone 走的是**完全相同的 schema**,所以同一个 `web_avatar` 可以无缝接收。

## 注意
- MediaPipe 模型从 jsdelivr CDN 取 wasm,模型文件优先取 `./face_landmarker.task`(`scripts/download_assets.sh` 已经下好);取不到会回落到 Google 官方 CDN。
- 浏览器需要 HTTPS 或 `localhost` 才能拿到摄像头权限。
