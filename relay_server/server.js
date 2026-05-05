// Minimal fan-out WebSocket relay for face mocap.
//
// 架构:
//   iPhone (ARKit) ── ws://mac:8765 ──▶ relay ──▶ all browser clients
//
// 角色辨认:
//   - 第一条消息是 "{\"role\":\"sender\"}"  → 当作 producer
//   - 第一条消息是 "{\"role\":\"viewer\"}"  → 当作 consumer
//   - 不发 role → 默认 sender(兼容 iOS app)
//
// producer 发的每条 mocap 帧都被广播给所有 viewer(不回给 producer 本身,
// 也不缓存,只看实时,丢就丢,符合实时动捕语义)。

import { WebSocketServer } from "ws";
import os from "node:os";

const PORT = Number(process.env.PORT || 8765);
const wss = new WebSocketServer({ port: PORT, perMessageDeflate: false });

const senders = new Set();
const viewers = new Set();

let totalFrames = 0;
let lastReportTs = Date.now();

wss.on("connection", (ws, req) => {
  ws.role = "sender";   // 默认值,iPhone app 不发 role
  ws.alive = true;
  ws.on("pong", () => { ws.alive = true; });

  ws.on("message", (raw, isBinary) => {
    let txt = isBinary ? null : raw.toString();
    // 第一条 role 报到 — 仅尝试解析很短的字符串
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
      } catch { /* not a role frame, fall through */ }
    }
    if (ws.role === "viewer") return;     // viewer 误发数据 → 忽略

    // sender → 广播给所有 viewer
    senders.add(ws);
    totalFrames++;
    for (const v of viewers) {
      if (v.readyState === v.OPEN) v.send(raw, { binary: isBinary });
    }
  });

  ws.on("close", () => { senders.delete(ws); viewers.delete(ws); });
  ws.on("error", () => { /* 不打断 */ });
});

// 心跳:30 秒未 pong 的连接断开
setInterval(() => {
  for (const ws of [...senders, ...viewers]) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false;
    try { ws.ping(); } catch {}
  }
}, 30_000);

// 帧率报告
setInterval(() => {
  const now = Date.now();
  const dt = (now - lastReportTs) / 1000;
  const fps = totalFrames / dt;
  console.log(
    `[relay] senders=${senders.size} viewers=${viewers.size} ` +
    `forwarded=${totalFrames} (${fps.toFixed(1)} Hz)`
  );
  totalFrames = 0;
  lastReportTs = now;
}, 5_000);

// 启动信息
const ips = Object.values(os.networkInterfaces())
  .flat().filter(i => i && i.family === "IPv4" && !i.internal).map(i => i.address);
console.log(`facemocap-relay listening on :${PORT}`);
ips.forEach(ip => console.log(`  iPhone 端用:  ws://${ip}:${PORT}`));
console.log(`  Mac 浏览器:    ws://localhost:${PORT}`);
