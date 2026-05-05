# iOS Face Mocap (ARKit → WebSocket)

最小可工作的 SwiftUI app:用 ARKit `ARFaceTrackingConfiguration` 抓 52 个 blendshape +
头部 / 左右眼 4×4 变换,30 Hz 推到中转 WebSocket(默认 `ws://<Mac-LAN-IP>:8765`)。

## 设备前提
- iPhone X 或更新(必须有 TrueDepth 前置摄像头)
- iOS 16+
- Xcode 15+
- iPhone 与 Mac 在**同一 WiFi**

## 运行
1. 用 Xcode 打开 `FaceMocap` 文件夹(把它拖进 Xcode "Create New Project → 选 iOS App → Swift / SwiftUI" 然后把 `FaceMocap/*.swift` 添加到 target;为节省你时间,这里只给关键源文件,具体 Xcode 工程文件请用 Xcode 模板新建)。
2. 在 `FaceMocapApp.swift` 顶部修改 `kRelayURL` 为你 Mac 的 WiFi IP(`ifconfig | grep "inet "`)。
3. 在 `Info.plist` 加入:
   - `NSCameraUsageDescription` = "用于面部动捕"
   - `NSLocalNetworkUsageDescription` = "连接本地中转服务器"
   - `NSBonjourServices` 数组里加 `_ws._tcp`(可选,某些 iOS 版本需要)
4. 用 USB 把 app 跑到真机(模拟器没有 TrueDepth 摄像头)。
5. 启动后手机镜头对自己,Web 端就能看到虚拟人同步动起来。

## 数据帧格式
```jsonc
{
  "ts": 1714233456.789,            // double, 秒
  "blendshapes": {                 // 52 个 ARKit 标准键 → float[0,1]
    "jawOpen": 0.34,
    "mouthSmileLeft": 0.12,
    "eyeBlinkLeft": 0.0,
    /* ... */
  },
  "head":      [16 floats],        // 4x4 列主序变换
  "leftEye":   [16 floats],
  "rightEye":  [16 floats]
}
```
Web 端的字段命名直接复用 ARKit 命名,所以这套字段同时被
`@pixiv/three-vrm` 的 `VRMExpressionPresetName` 映射表和
Ready Player Me 的 `morphTargetDictionary` 识别。
