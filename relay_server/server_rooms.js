// Veil — room-aware WebSocket relay (multi-user, with peerId attribution)
//
// Wire protocol:
//   client → server   {"type":"join", "room":"cosy42", "name":"Yidan", "avatarKey":"anime_girl", "customUrl":null}
//   server → joiner   {"type":"roster", "me":7, "peers":[{"id":3,"name":"A","avatarKey":"blonde","customUrl":null}, ...]}
//   server → others   {"type":"peer_join",  "id":7, "name":"Yidan", "avatarKey":"anime_girl", "customUrl":null}
//   server → all      {"type":"peer_leave", "id":7, "name":"Yidan"}
//   client ⇄ server   {"type":"ping"} / {"type":"pong"}
//   client → all      {"type":"reaction", "emoji":"❤️"}     (forwarded with senderId attached)
//   client → server   <ArrayBuffer 232 bytes>   (face frame)
//   server → others   <ArrayBuffer 233 bytes>   (1 byte senderId + original 232)
//
// Privacy: server stores no payloads; only ephemeral roster (peerId, name, avatarKey).

import { WebSocketServer } from "ws";
import os from "node:os";

const PORT = Number(process.env.PORT || 8765);
const wss  = new WebSocketServer({ port: PORT, perMessageDeflate: false });

/** rooms: Map<roomCode, Set<ws>> */
const rooms = new Map();
let nextPeerId = 1;
let totalForwarded = 0;
let lastReportTs   = Date.now();

function safeStr(v, max = 64) {
  return String(v == null ? '' : v).slice(0, max);
}

function rosterEntryFor(ws) {
  return { id: ws.peerId, name: ws.name, avatarKey: ws.avatarKey, customUrl: ws.customUrl };
}

function joinRoom(ws, room, name, avatarKey, customUrl) {
  ws.peerId    = (nextPeerId++) & 0xFF;       // 1..255 (0 reserved)
  if (ws.peerId === 0) ws.peerId = (nextPeerId++) & 0xFF;
  ws.room      = safeStr(room, 32);
  ws.name      = safeStr(name, 24) || 'anon';
  ws.avatarKey = safeStr(avatarKey, 24) || 'brunette';
  ws.customUrl = customUrl ? safeStr(customUrl, 512) : null;

  let members = rooms.get(ws.room);
  if (!members) { members = new Set(); rooms.set(ws.room, members); }
  members.add(ws);

  // 1) tell the joiner the full existing roster (excluding self)
  const peers = [...members].filter(m => m !== ws).map(rosterEntryFor);
  try {
    ws.send(JSON.stringify({
      type: 'roster',
      me: ws.peerId,
      peers,
      peer_count: members.size,
    }));
  } catch {}

  // 2) tell every other member that this peer joined
  const announce = JSON.stringify({
    type: 'peer_join',
    id: ws.peerId,
    name: ws.name,
    avatarKey: ws.avatarKey,
    customUrl: ws.customUrl,
  });
  for (const m of members) {
    if (m !== ws && m.readyState === m.OPEN) {
      try { m.send(announce); } catch {}
      try { m.send(JSON.stringify({ type:'room_status', peer_count: members.size })); } catch {}
    }
  }
}

function leaveRoom(ws) {
  if (!ws.room) return;
  const members = rooms.get(ws.room);
  if (!members) return;
  members.delete(ws);
  const announce = JSON.stringify({ type: 'peer_leave', id: ws.peerId, name: ws.name });
  for (const m of members) {
    if (m.readyState === m.OPEN) {
      try { m.send(announce); } catch {}
      try { m.send(JSON.stringify({ type:'room_status', peer_count: members.size })); } catch {}
    }
  }
  if (members.size === 0) rooms.delete(ws.room);
  ws.room = null;
}

wss.on('connection', (ws) => {
  ws.alive = true;
  ws.peerId = 0;
  ws.on('pong', () => { ws.alive = true; });

  ws.on('message', (raw, isBinary) => {
    if (!isBinary) {
      const txt = raw.toString();
      let msg = null;
      try { msg = JSON.parse(txt); } catch {}
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'join') {
        joinRoom(ws, msg.room, msg.name, msg.avatarKey, msg.customUrl);
      } else if (msg.type === 'ping') {
        try { ws.send(JSON.stringify({ type:'pong' })); } catch {}
      } else if (msg.type === 'leave') {
        leaveRoom(ws);
      } else if (msg.type === 'reaction') {
        // forward to all room peers, attributed
        if (!ws.room) return;
        const members = rooms.get(ws.room);
        if (!members) return;
        const out = JSON.stringify({
          type:'reaction',
          from: ws.peerId,
          name: ws.name,
          emoji: safeStr(msg.emoji, 4),
        });
        for (const m of members) {
          if (m !== ws && m.readyState === m.OPEN) { try { m.send(out); } catch {} }
        }
      }
      return;
    }

    // Binary face packet — wrap with senderId byte and fan out to other room members
    if (!ws.room) return;
    const members = rooms.get(ws.room);
    if (!members) return;
    // raw is a Buffer (Node ws); prepend the 1-byte senderId
    const wrapped = Buffer.concat([Buffer.from([ws.peerId]), raw]);
    for (const m of members) {
      if (m !== ws && m.readyState === m.OPEN) {
        try { m.send(wrapped, { binary: true }); totalForwarded++; } catch {}
      }
    }
  });

  ws.on('close', () => leaveRoom(ws));
  ws.on('error', () => { /* keep server alive */ });
});

// Heartbeat
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { try { ws.terminate(); } catch {}; continue; }
    ws.alive = false;
    try { ws.ping(); } catch {}
  }
}, 30_000);

// Per-5s usage report
setInterval(() => {
  const now = Date.now();
  const dt  = (now - lastReportTs) / 1000;
  const fps = totalForwarded / dt;
  console.log(
    `[veil-relay] rooms=${rooms.size} clients=${wss.clients.size} ` +
    `forwarded=${totalForwarded} (${fps.toFixed(1)} pkt/s)`
  );
  totalForwarded = 0; lastReportTs = now;
}, 5_000);

// Boot banner
const ips = Object.values(os.networkInterfaces())
  .flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
console.log(`veil-relay listening on :${PORT}  (multi-user)`);
ips.forEach(ip => console.log(`  LAN URL:    ws://${ip}:${PORT}`));
console.log(`  localhost:  ws://localhost:${PORT}`);
console.log(`  Each room supports N peers; binary frames are wrapped with sender's peerId.`);
