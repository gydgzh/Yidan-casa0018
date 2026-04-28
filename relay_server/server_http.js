// Minimal fan-out WebSocket relay for face mocap (HTTP/WS - 无证书版本).
//
// 架构:
//   iPhone (ARKit) ── ws://mac:8765 ──▶ relay ──▶ all browser clients
//
// 角色辨认:
//   - 第一条消息是 "{\"role\":\"sender\"}"  → 当作 producer
//   - 第一条消息是 "{\"role\":\"viewer\"}"  → 当作 consumer
//   - 不发 role → 默认 sender(兼容 iOS app)

import { WebSocketServer } from "ws";
import http from "node:http";
import os from "node:os";

const PORT = Number(process.env.PORT || 8765);

const httpServer = http.createServer();
const wss = new WebSocketServer({ server: httpServer, perMessageDeflate: false });

const senders = new Set();
const viewers = new Set();

let totalFrames = 0;
let lastReportTs = Date.now();

wss.on("connection", (ws, req) => {
  ws.role = "sender";
  ws.alive = true;
  ws.on("pong", () => { ws.alive = true; });

  ws.on("message", (raw, isBinary) => {
    let txt = isBinary ? null : raw.toString();
    if (txt && txt.length < 80 && txt.startsWith("{") && /\"role\"/.test(txt)) {
      try {
        const msg = JSON.parse(txt);
        if (msg.role === "viewer") {
          ws.role = "viewer";
          senders.delete(ws);
          viewers.add(ws);
          return;
        }
        if (msg.role === "sender") {
          ws.role = "sender";
          viewers.delete(ws);
          senders.add(ws);
          return;
        }
      } catch { }
    }
    if (ws.role === "viewer") return;

    senders.add(ws);
    totalFrames++;
    for (const v of viewers) {
      if (v.readyState === v.OPEN) v.send(raw, { binary: isBinary });
    }
  });

  ws.on("close", () => { senders.delete(ws); viewers.delete(ws); });
  ws.on("error", () => { });
});

// 心跳
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) return ws.terminate();
    ws.alive = false;
    ws.ping();
  }
}, 30000);

// 统计
setInterval(() => {
  const now = Date.now();
  const dt = (now - lastReportTs) / 1000;
  const fps = totalFrames / dt;
  const ips = os.networkInterfaces();
  const addrs = Object.values(ips).flat().filter(i => i.family === "IPv4" && !i.internal).map(i => i.address);
  console.log(`[relay] ${senders.size} senders, ${viewers.size} viewers, ${fps.toFixed(1)} fps, ws://${addrs[0] || "localhost"}:${PORT}`);
  totalFrames = 0;
  lastReportTs = now;
}, 10000);

httpServer.listen(PORT, () => {
  const ips = os.networkInterfaces();
  const addrs = Object.values(ips).flat().filter(i => i.family === "IPv4" && !i.internal).map(i => i.address);
  console.log(`facemocap-relay (WS) listening on :${PORT}`);
  console.log(`  iPhone 端用:  ws://${addrs[0] || "localhost"}:${PORT}`);
  console.log(`  Mac 浏览器:    ws://localhost:${PORT}`);
});
