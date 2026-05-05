# Face Mocap WebSocket Relay

把 iPhone 的 ARKit 帧转发给所有浏览器 viewer。

## 安装与启动
```bash
cd relay_server
npm install        # 只装一个 ws 包
npm start          # 默认监听 :8765
```
启动后控制台会打印类似:
```
facemocap-relay listening on :8765
  iPhone 端用:  ws://192.168.1.100:8765
  Mac 浏览器:    ws://localhost:8765
```
把那个 `192.168.1.100:8765` 抄进 `ios_mocap/FaceMocap/FaceMocapApp.swift` 里的 `kRelayURL`。

## 端口冲突
```bash
PORT=9000 npm start
```

## 协议
- iPhone 直接发 JSON 字符串(每帧 ≈ 1 KB,30 Hz)。
- 浏览器 viewer 连上后**先发一条** `{"role":"viewer"}` 注册角色,之后 onmessage 就是 mocap 帧。
- 没有持久化、没有重放,丢帧就丢帧 — 这是实时动捕想要的语义。
