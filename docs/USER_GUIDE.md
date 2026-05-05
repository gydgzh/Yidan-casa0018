# Veil — User Guide

> **Veil** is a privacy-preserving avatar companionship tool. Your face never leaves
> your device — only abstract facial-expression data (~6 KB/s) is sent to your friend,
> who sees your real-time expressions through a 3D avatar of your choice.

---

## Quick start (you alone, on Mac)

1. Make sure your Mac is running both background services (relay on `8765` and HTTP server on `8080`).
2. Open Chrome → `http://localhost:8080/mobile_avatar.html`
3. Fill the start screen:
   - **① Your name** → e.g. `Yidan`
   - **② Room code** → e.g. `cosy42` (any string both of you agree on)
   - **③ Relay server** → already auto-filled, leave it
   - **④ Choose your avatar** → click one of the 6 cards (Mira / Emma / Ada / Sakura / Kaito / Custom)
   - **⑤ Tap the purple button** → grant camera permission
4. You should see your chosen avatar on the left, mirroring your face. The right side says "waiting for friend".

---

## Two-person test on the same Mac

You need **two different browsers** (Chrome + Safari), because macOS only lets one tab access the camera at a time.

### Window A — Chrome
- Name: `Yidan`
- Room: `cosy42`
- Avatar: pick **Mira** (realistic brunette)

### Window B — Safari
- Name: `Friend`
- Room: `cosy42` ← same code as Window A
- Avatar: pick **Sakura** (anime girl) ← *different from Window A*

After both join, you should see:
- Top pill turns green: `paired`
- **Window A** screen: Mira on left (you), Sakura on right (friend) — Sakura mirrors what Safari camera sees.
- **Window B** screen: Sakura on left (you), Mira on right (friend) — Mira mirrors what Chrome camera sees.
- Smile big at the same time → 💞 burst in the centre = mood sync detected.

> **Why both windows looked the same before**: the first time you tested, both windows defaulted to the *same* avatar (whichever was last saved in browser storage). The avatars are different *only if you pick different ones in each window*.

---

## What each card represents

| Card | Style | Source / License |
|---|---|---|
| 👩🏻 **Mira** | Realistic brunette | TalkingHead repo, MIT |
| 👱🏼‍♀️ **Emma** | Realistic blonde | TalkingHead repo, MIT |
| 👩🏻‍🦱 **Ada** | Realistic asian | TalkingHead repo, MIT |
| 👧 **Sakura** | Anime girl | madjin/vrm-samples (VRoid CC0) |
| 👦 **Kaito** | Anime boy | madjin/vrm-samples (VRoid CC0) |
| ➕ **Custom** | Anything | Paste any public `.glb` or `.vrm` URL — try [readyplayer.me](https://readyplayer.me/avatar) |

Avatars are streamed from [jsdelivr CDN](https://www.jsdelivr.com/) on first use (5-10 s for the ~5-12 MB file), then cached in your browser forever.

---

## Mood Sync (the special bit)

Behind the scenes, a small **self-trained 1D-CNN** (32k parameters) classifies your facial expression into 8 actions:

| Action | Trigger | Effect |
|---|---|---|
| smile_big | open big smile | 💞 hearts |
| surprise | raise brows + open mouth | ❓ pop |
| frown | downturned mouth | 💧 rain |
| mouth_o | round "oh" mouth | 🔊 wave |
| wink_left/right | one eye closed | ✨ sparkle |
| tongue_out | stick out tongue | 😜 |
| neutral | resting | nothing |

If you and your friend hit the **same non-neutral action within 1.5 seconds** → centre-screen burst.

---

## Why the privacy claim holds

- The hidden `<video>` element is set `position:absolute; left:-9999px` — Three.js never reads it; only MediaPipe processes raw pixels in WebGL/CPU.
- What goes over the wire: a 232-byte binary frame at 24 Hz = **5.7 KB/s**.
  - 1 byte `type`
  - 1 byte `action_idx` (0–7 or 255)
  - 6 bytes reserved
  - 16 bytes head quaternion (4× float32)
  - 208 bytes blendshapes (52× float32, ARKit-named)
- The relay server (`server_rooms.js`) keeps an in-memory `Map<roomCode, Set<peerId>>` and forwards bytes. **It never decodes the frames, never logs payloads, never persists anything.**
- Compare with Zoom: ~5000 KB/s raw video → Veil is ~800× compression *and* zero pixel data.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Page is blank | Old cached HTML | Hard reload: ⌘ + Shift + R |
| Top pill stuck on `connecting…` | Relay server not running, or wrong URL | Check terminal `lsof -i :8765` |
| Top pill stuck on `waiting for friend` | Friend's room code differs (case-sensitive) | Both type the *exact* same room |
| Both avatars look identical | Both you and friend picked the *same* avatar | Pick different cards in each window |
| Avatar slow to load | First-time CDN fetch | Wait 30 s; check the `log` button bottom-right |
| Camera permission popup didn't appear | macOS already remembers — granted in System Settings → Privacy → Camera | Grant browser app there |
| Friend "frozen" — no expressions | They denied camera permission | They re-allow + reload |

If something else breaks, click the small `log` button at the bottom-right of the screen. The first red line in that log usually identifies the problem.

---

## On iPhone

iPhone Safari requires HTTPS (Mac localhost is exempt; iPhone is not).
For real-device testing, ask the local AI to follow `docs/IPHONE_DEPLOY_CN.md`.

---

## URL parameters (advanced)

Append after the URL to tweak behaviour without going back to the start screen:

| Param | Default | Effect |
|---|---|---|
| `?debug=1` | off | Keep log panel open from start |
| `?gain=2.0` | 1.6 | Multiply blendshape strength |
| `?smooth=0.6` | 0.35 | Stronger temporal smoothing (less jitter, more lag) |
| `?headlerp=0.25` | 0.45 | Slower head tracking |
| `?headflip=y` | none | Flip head yaw (some webcams) |
| `?nofx` | off | Disable action recognition (saves CPU) |

Example: `http://localhost:8080/mobile_avatar.html?debug=1&gain=2.0`
