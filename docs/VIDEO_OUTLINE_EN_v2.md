# Veil — Video Outline (English · v2 · aligned with v4.3 / 8-action set)

> Hard limit: **3 minutes** (180 s ceiling)
> Marks: Clarity 10% + Technical 10% + Build 10% = **30%** (video side)
> Audience: *general audience* (blog / open day) — NOT ML specialists
> Capture stack: ① OBS / QuickTime screen record ② face-cam picture-in-picture ③ post in iMovie / DaVinci / FCPX
> Project state: 8 actions (not the older 4-emotion outline) · v4.3-localfix · 232 B/frame @ 24 Hz

---

## Overall structure (6 beats · time codes are hard caps)

```
0:00 ─┬─ HOOK              15s   single-line question + visual punch
0:15 ─┼─ PROBLEM           30s   why we're doing this (Zoom fatigue + privacy)
0:45 ─┼─ DEMO              50s   two browsers paired · 8 actions · mood-sync
1:35 ─┼─ TECHNICAL         55s   data → model → deploy → results
2:30 ─┼─ REFLECTION        20s   what I learned + limitations
2:50 ─┴─ CTA / SIGN-OFF    10s   GitHub + one-line vision
3:00       END                    exactly 3:00 — do not overshoot
```

Something must happen every second. Edit pace: **average shot ≤ 4 s.**

---

## Beat 1 · HOOK  (0:00–0:15 · 15 s)

### Visuals
- [Shot 1 · 0:00–0:05]　Full-screen Zoom call (Pexels "video call" stock; **do not** record real colleagues). Person stares awkwardly at their own face.
- [Shot 2 · 0:05–0:10]　A hand abruptly covers the lens — privacy gesture; screen turns black. *One clean frame, no hesitation.*
- [Shot 3 · 0:10–0:15]　In the black, VEIL logo fades in; a 3-D avatar (V-1, anime) rotates and smiles with me.

### Voiceover
> "We've all done this. Camera on, camera off, hide. There has to be a third way."

### On-screen text (lower-third)
- 0:00　`55% of communication is non-verbal — and 100% of it leaks your face`
- 0:10　`What if your expressions could travel without your face?`

### Capture notes
- Shot 2 must be one decisive frame — re-take until it lands.
- Shot 3 avatar rotation: open `mobile_avatar.html?demo=1&myav=vroid_v1` (skips start screen, single V-1 view), record 3 s in OBS, add fade-in in post.

[Screenshot V-1: VEIL logo still]
- **How**: load `mobile_avatar.html?demo=1`; capture the top-bar `VEIL` violet glyph + an avatar head — this is your transition vector.

---

## Beat 2 · PROBLEM  (0:15–0:45 · 30 s)

### Visuals (one shot every ~5 s)
- [Shot 4 · 0:15–0:20]　Data viz: Mehrabian "55-38-7" pie chart animated in (D3 / Recharts / Keynote magic-move).
- [Shot 5 · 0:20–0:25]　Typewriter line: `1.5 Mbps × 8h × 5d = 27 GB/week of your face`.
- [Shot 6 · 0:25–0:30]　News-headline montage: `Zoom Fatigue is Real` / `64% turn camera off for privacy — IPSOS 2023`.
- [Shot 7 · 0:30–0:40]　Cut to me at the desk, looking straight into camera.
- [Shot 8 · 0:40–0:45]　Cut to screen: Veil hero start screen.

### Voiceover
> "Mehrabian showed in 1971 that more than half of what we *say* is actually our face. So when we keep cameras on, we leak everything — environment, mood, fatigue. (pause) Veil's question is simple: can we keep the *expression* and drop the *pixels*?"

### On-screen text
- 0:18　`55% non-verbal · 38% tone · 7% words`
- 0:23　`Zoom: 1500 KB/s · Veil: 5.5 KB/s · 270× less`
- 0:32　`64% of remote workers turn off camera for privacy`　[→ IPSOS 2023]
- 0:42　`Veil — keep the expression, drop the pixels`

### Capture notes
- The pie must "grow itself" — don't drop in a flat PowerPoint pie.
- Numbers are the hook — **type them on screen**, don't merely read them.

[Screenshot V-2: hero start screen]
- **How**: open `http://localhost:8080/mobile_avatar.html?local=1`; capture the loaded-but-untapped state — VEIL logo + "Be together, stay private" subtitle + the 3-step intro card.

---

## Beat 3 · DEMO  (0:45–1:35 · 50 s) ★ where Build 10 is won or lost

### Capture quality — 1080p / 60 fps mandatory; OBS uses **two sources** to record Chrome + Safari simultaneously.

#### 3a · Pairing (0:45–0:55 · 10 s)
- [Shot 9 · 0:45–0:50]　Side-by-side: Chrome left, Safari right; both running `mobile_avatar.html?local=1`. I type `Yidan` / `Friend` and the same room code `cosy42`; pick Mira (GLB realistic) on the left and V-1 (VRM anime) on the right.
- [Shot 10 · 0:50–0:55]　Both windows click "Allow camera & enter room"; **the top pill flips from `waiting` to green `paired`** — slow-mo this transition to 1.5×.

#### 3b · 8-action showcase (0:55–1:25 · 30 s)
- [Shot 11 · 0:55–1:00]　**smile_big** — I smile big; both Mira and V-1 smile; the halo turns orange (`ACTION_COLOR.smile_big = 0xff8a55`).
- [Shot 12 · 1:00–1:05]　**surprise** — brows up, eyes wide; halo turns sky blue (0x6cf).
- [Shot 13 · 1:05–1:10]　**wink_left** + **wink_right** — 2.5 s each; halos turn violet (0xb45cff).
- [Shot 14 · 1:10–1:15]　**mouth_o** — round mouth; halo turns lime (0xa3e635).
- [Shot 15 · 1:15–1:20]　**frown** — brow down, mouth corners down; halo turns red (0xff5a5a).
- [Shot 16 · 1:20–1:25]　**tongue_out** — tongue out; halo turns pink (0xff8ab4) and 🤪 emoji floats up.

#### 3c · Mood-sync trigger (1:25–1:32 · 7 s)
- [Shot 17 · 1:25–1:30]　Both peers `smile_big` for ≥ 2 vote frames consistent → 💞 burst centre-screen (`triggerBurst('💞')` + `spawnFloater('💞', 16)`).
- [Shot 18 · 1:30–1:32]　Freeze 1 s with a red circle around the 💞 burst.

#### 3d · Bandwidth reveal (1:32–1:35 · 3 s)
- [Shot 19 · 1:32–1:35]　Camera zooms onto the bandwidth pill `~5.5 KB/s`; overlay big text `Zoom 1500 KB/s · Veil 5.5 KB/s`.

### Voiceover (split across the 4 sub-beats)
> "Two browsers. Same room code. Different avatars. (pause)
> Watch — when I smile, both avatars smile. Surprise. Wink. Mouth-O. Frown. Tongue-out — eight discrete actions, all running locally.
> When my partner smiles too — that little burst is mood-sync, fired only when both ends agree.
> And the bandwidth — five point five kilobytes per second. **Two-hundred-seventy times less than Zoom.**"

### On-screen text
- 0:48　`Two browsers · same room code · different avatars`
- 0:52　`← paired in <2s →`
- 0:55–1:25　Action labels float over each clip: `smile_big · surprise · wink_L · wink_R · mouth_O · frown · tongue_out`
- 1:27　`mood-sync 💞 fired (both smile ≥ 2 votes · conf > 0.5)`
- 1:33　`Veil 232 B × 24 Hz = 5.5 KB/s · Zoom 1500 KB/s`

### Capture notes (*core of the Build score*)
1. **Real dual-window pairing — no post-composite.** Markers can tell from screen smoothness.
2. OBS uses one Display Capture for Chrome + Safari, plus a 200×200 face-cam PIP top-right, so the viewer sees the cause-effect chain "my face → left avatar".
3. Rehearse the 8 actions in the order above; record 3 takes; pick the cleanest expressions + most visible halo colour transitions.
4. The mood-sync moment requires **both peers smile ≥ 0.4 s simultaneously** — expect several re-takes to land.
5. The bandwidth pill close-up needs a zoom-in + post-added red circle and large-text callout.

[Screenshot V-3: dual-browser paired state] — also the YouTube thumbnail. **You take it.**
[Screenshot V-4: 8-action halo palette mosaic] — composite a 1×7 colour-card (neutral grey / wink violet / smile orange / surprise blue / frown red / mouth_o lime / tongue pink). **You composite in post.**
[Screenshot V-5: mood-sync 💞 trigger frame] — dual screens + central 💞 burst. **You take it.**
[Screenshot V-6: bandwidth pill close-up] — `~5.5 KB/s` cell zoomed. **You take it.**

---

## Beat 4 · TECHNICAL OVERVIEW  (1:35–2:30 · 55 s) ★ where Technical 10 is won

### Sub-beat 4.1 — Data + pipeline (1:35–1:48 · 13 s)
- [Shot 20]　Cut to [Fig 2 data pipeline diagram] full-screen; highlight each stage in turn:
  `Camera Frame → 468 Landmarks → 52 Blendshapes → 30-frame Window → 1D-CNN → 8-way softmax`. ~2 s per stage; voiceover synced.

VO:
> "MediaPipe extracts 468 landmarks per frame, condensed to 52 ARKit blendshapes — the same expression vocabulary used by Animoji."

OST: `468 → 52 in 22 ms · all on-device`

### Sub-beat 4.2 — Model architecture (1:48–2:00 · 12 s)
- [Shot 21]　Cut to [Fig 3 1D-CNN architecture]. Reveal layer by layer:
  `Conv1D(32,k=5) → BN → Conv1D(64,k=5) → BN → Conv1D(64,k=3) → BN → GAP → Dropout(0.3) → Dense(8, softmax)`.

VO:
> "A small 1D-CNN — about thirty-two thousand parameters, three milliseconds per inference. Trained to recognise eight discrete actions."

OST:
- 1:51　`1D-CNN · ~32K params · 8 classes`
- 1:56　`P50 inference: 2.8 ms · TF.js WebGL`

### Sub-beat 4.3 — Training + results (2:00–2:14 · 14 s)
- [Shot 22 · 2:00–2:07]　Cut to `artifacts/training_history.png` ([Fig 4]); animate loss-down + acc-up.
- [Shot 23 · 2:07–2:14]　Cut to `artifacts/confusion_matrix.png` ([Fig 5]) — 8×8 heatmap, diagonal lit.

VO:
> "Four ablation runs. Final test accuracy: ninety-nine point oh-five percent, macro-F1 zero point nine-nine. (pause) But — on real strangers, only eighty-four. Generalisation is where it gets honest."

OST:
- 2:03　`4 ablation runs · 99.05% test acc · macro-F1 0.99`
- 2:11　`wild-test on strangers: 84.2% — generalisation gap`

### Sub-beat 4.4 — Protocol + multi-user (2:14–2:30 · 16 s)
- [Shot 24 · 2:14–2:24]　Cut to [Fig 1 three-layer architecture]. Red dashed circle on the on-device region; green dashed circle on the wire region. Side-by-side: Chrome DevTools → Network → WS pane showing a single binary frame: **`233 bytes`**.
- [Shot 25 · 2:24–2:30]　Return to live demo (the dual avatar view).

VO:
> "Each frame travels as 233 bytes — a header, a head-pose quaternion, and the 52 floats. No pixels ever leave the device."

OST:
- 2:17　`Per-frame: 1B msgType + 1B actionIdx + 16B quat + 208B blendshapes = 232 B`
- 2:21　`+ 1B senderId @ relay = 233 B on the wire`
- 2:27　`Zero pixels uploaded — by design`

[Screenshot V-7: Chrome DevTools → Network → WS column showing a 233-byte binary frame]
- **How**: DevTools → Network → filter WS → click `ws://localhost:8765` → Messages tab → see a `Binary Message · 233 B` row. **You take it.**

### Capture notes
- Pre-render the 4 figures (pipeline / architecture / training curves / confusion matrix) as high-res PNGs; Keynote magic-move feels far more pro than straight cuts.
- Don't fullscreen entire PowerPoint slides — overlay the PNGs full-frame and add callouts.
- Each sub-beat ≤ 12 s of voiceover, leave ~2 s air. Don't over-pack.

---

## Beat 5 · REFLECTION  (2:30–2:50 · 20 s)

### Visuals
- [Shot 26 · 2:30–2:40]　Cut to me, eyes on lens. Background: Mac + Arduino + notebook (engineer-on-a-bench tone). Hands relaxed.
- [Shot 27 · 2:40–2:50]　Cut to a real *frown → wink_left* misclassification clip (the one off-diagonal cell at row 6 col 2 of the confusion matrix). Overlay red box + text `predicted: wink_left (0.51) · true: frown (0.47)`.

### Voiceover
> "Two honest limitations. One — my data split was per-window, not per-speaker, so 99.05% is on faces the model has seen. On strangers it falls to eighty-four. Two — the 52 blendshapes don't have a 'jaw clench' channel, so frown sometimes looks like a wink. Both fixable. Both real."

### On-screen text
- 2:32　`Limit 1: not speaker-independent — wild acc 84.2%`
- 2:42　`Limit 2: 52-d ARKit has no 'jaw clench' channel`

### Capture notes
- This 20 s is where Clarity is scored: **owning limitations adds marks** — do not oversell.
- If pressed for time, compress to 15 s; donate the 5 s to Demo or CTA.

[Screenshot V-8: frown → wink_left misclassification still]
- **How**: open the demo with `?infer=1` (per-frame inference); make a frown; wait until the on-screen confidence vector reads `frown:0.47 / wink_left:0.51` and capture. Several rehearsals required.

---

## Beat 6 · CTA / SIGN-OFF  (2:50–3:00 · 10 s)

### Visuals
- [Shot 28 · 2:50–2:58]　Full-screen logo animation + 3-line CTA.
- [Shot 29 · 2:58–3:00]　Fade to black + single-glyph Veil logo.

### On-screen text (large)
```
Veil — be together, stay private
github.com/<user>/Veil
CASA0018 · UCL · 2025
```

### Voiceover
> "Veil. Be together, stay private. Code's on GitHub."

---

# Capture + post-production checklist

## Capture
- [ ] OBS two-scene set-up: Scene A = dual browsers + face PIP; Scene B = full-screen figure.
- [ ] 1080p / 60 fps / H.264 / AAC 48 kHz.
- [ ] **Front-facing key light** (so MediaPipe doesn't drop landmarks on shadowed sides).
- [ ] Mic: built-in Mac + iPhone backup (in case one fails).
- [ ] **Read the script verbatim into the mic first**, then film demo, then sync — separates audio from picture errors.
- [ ] **At least 3 takes of Beat 3 Demo** — pick the take with fastest pairing, cleanest 8 actions, and best-aligned mood-sync.
- [ ] Rehearse the 8 actions in front of a mirror — camera must see the whole face, no harsh shadows.

## Post (iMovie / Resolve / FCPX)
- [ ] Drop each beat's shots onto its track; align durations first, content second.
- [ ] **Add on-screen text** (lower-third + big-text callouts) — *without OST you will not hit 8/10 Clarity*.
- [ ] BGM very quiet (–25 dB); no vocals / lyrics / heavy beats over the voiceover.
- [ ] After narration is recorded, run Audacity noise-reduction + compressor for level consistency.
- [ ] Pre-render preview **with sound off**, verify the story is followable from picture alone.
- [ ] Strict ≤ 180 s — **overrun directly costs Clarity marks**.

## Upload
- [ ] YouTube (unlisted) or UCL OneDrive shared link.
- [ ] Description: GitHub link + Veil tagline + CASA0018 hashtag.
- [ ] **Embed thumbnail in GitHub README** — +1 pt under Build.

---

# Beat → mark-scheme mapping

| Beat | Length | Clarity 10% | Technical 10% | Build 10% |
|---|---:|:---:|:---:|:---:|
| 1 Hook | 15 s | ✓✓ | – | – |
| 2 Problem | 30 s | ✓✓ | – | – |
| 3 **Demo** | 50 s | ✓ | ✓ | **✓✓✓** |
| 4 **Technical** | 55 s | ✓ | **✓✓✓** | ✓ |
| 5 Reflection | 20 s | ✓✓ | ✓ | – |
| 6 CTA | 10 s | ✓ | – | – |

If you have to drop one beat: **keep 3 + 4, sacrifice 2** — push the hook longer and cut straight into demo.

---

# One-line capture order

> Lock **Beat 3 Demo** first (dual-browser pairing + 8 actions + mood-sync); everything else is patchable. If demo is botched, half the video's marks are lost.

---

# 5-minute pre-flight sanity check (run before recording)

```bash
# 1) Start relay
node relay_server/server_rooms.js
# 2) Static server
npx http-server -p 8080
# 3) Chrome
open -a "Google Chrome" "http://localhost:8080/mobile_avatar.html?local=1"
# 4) Safari (mirror)
open -a Safari "http://localhost:8080/mobile_avatar.html?local=1"
# 5) DevTools → Network → WS — outgoing should read ~5.5 KB/s; only then start recording
```

If the top pill is stuck on `waiting` for > 5 s:
- Is port 8765 occupied? — `lsof -iTCP:8765 -sTCP:LISTEN`
- Any red errors in the browser console? Append `?debug=1` for verbose logging.
- The V-1 anime VRM is 15 MB — first load takes a beat; the browser caches it after.
