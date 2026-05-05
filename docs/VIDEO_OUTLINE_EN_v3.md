# Veil — Video Outline (English · v3 · aligned with v4.3 code · 8-class actions)

> **Hard limit**: 3 minutes (180 seconds, no exceptions)
> **Marking**: Clarity 10% + Technical 10% + Build 10% = 30%
> **Audience**: *general audience* (blog / open-day visitor), not ML peers
> **Style reference**: Tether (Group 4) — real demo + live recording + on-screen data callouts
> **Hard facts** (all consistent with the report):
> - 8 actions: neutral / wink_left / wink_right / smile_big / surprise / frown / mouth_o / tongue_out
> - test_acc = 0.9905, macro-F1 = 0.9903
> - Model: 32,168 params, TF.js shard ≈ 128 KB
> - Packet: 233 B / frame = 1B sender + 8B header + 16B head quat + 208B blendshape
> - Bandwidth: 5.6 KB/s @ 24 Hz (0.37 % of Zoom 720p)
> - End-to-end median latency ≈ 33 ms
> **Production stack**: ① screen recorder (OBS / QuickTime) ② face camera as PIP ③ iMovie / DaVinci / FCPX for compositing

---

## Overall structure (6 beats)

```
0:00 ─┬─ HOOK              15s   one-line problem + visual punch
0:15 ─┼─ PROBLEM           30s   why it matters (Zoom fatigue + privacy)
0:45 ─┼─ DEMO              45s   two-browser live pairing + 8-action sync
1:30 ─┼─ TECHNICAL         60s   data → model → deployment → results
2:30 ─┼─ REFLECTION        20s   lessons + limitations
2:50 ─┴─ CTA / SIGN-OFF    10s   GitHub link + tagline
3:00       END                   exactly 3 minutes — no overrun
```

Cutting cadence: **average shot length ≤ 4 seconds**. Something must move every second.

---

## Beat 1 · HOOK (0:00–0:15 · 15s)

### Visuals
- **[Shot 1 · 0:00–0:05]** Full-screen Zoom call (use Pexels "video call" stock or screen-grab Zoom from a second device). **No call audio**, the person is awkwardly staring at their own face.
- **[Shot 2 · 0:05–0:10]** A hand suddenly covers the camera (privacy gesture); screen goes black. **One clean cut, no hesitation**.
- **[Shot 3 · 0:10–0:15]** Veil logo fades in over black; a 3D avatar rotates in and smiles with me.

### Voice-over
> "We've all done this. Camera on, camera off, hide. There has to be a third way."

### On-screen text (lower-third, big)
| Time | Text |
|---|---|
| 0:00 | `55% of communication is non-verbal — and 100% of it leaks your face` |
| 0:10 | `What if your expressions could travel without your face?` |

[**Screenshot V-1 · Veil logo still**] — the purple "VEIL" wordmark + an avatar head from `mobile_avatar.html`'s top bar, used as a transition vector.

---

## Beat 2 · PROBLEM (0:15–0:45 · 30s)

### Cuts (~one per 5–7 s)
- **[Shot 4 · 0:15–0:20]** Data visualisation — Mehrabian's 55-rule pie chart with three slices (55 % body language / 38 % tone / 7 % words). Use D3 / Recharts / Keynote magic-move.
- **[Shot 5 · 0:20–0:25]** A single typewriter line: `Zoom: 1,500 KB/s · Veil: 5.6 KB/s · 0.37%`
- **[Shot 6 · 0:25–0:32]** News-headline cuts: "Zoom Fatigue is Real" / "64% of remote workers turn off camera for privacy" (IPSOS 2023 figures).
- **[Shot 7 · 0:32–0:40]** Cut to me (presenter face) at the desk, looking straight to camera. **≤ 8 seconds**.
- **[Shot 8 · 0:40–0:45]** Cut to screen — Veil start-page hero ([Screenshot V-2]).

### Voice-over
> "Mehrabian showed in 1971 that more than half of what we *say* is actually our face. So when we keep cameras on, we leak everything — environment, mood, fatigue. (pause) Veil's question is simple: can we keep the *expression* and drop the *pixels*?"

### On-screen text
| Time | Text |
|---|---|
| 0:18 | `55% non-verbal · 38% tone · 7% words` |
| 0:23 | `Zoom: 1,500 KB/s · Veil: 5.6 KB/s · 0.37%` |
| 0:32 | `64% of remote workers turn off camera for privacy` (→ IPSOS 2023) |
| 0:42 | `Veil — keep the expression, drop the pixels` |

### Recording notes
- Magic-move the pie chart; flying-in animations look amateur.
- Shot 7 ≤ 8 seconds — drop the lecture tone.
- Numbers are the hook — **don't read the whole sentence; put it on screen**.

[**Screenshot V-2 · Start-page hero**] — `http://localhost:8080/mobile_avatar.html?local=1` once it has finished loading: the VEIL logo, the "Be together, stay private" tagline, and the three-step intro card.

---

## Beat 3 · DEMO (0:45–1:30 · 45s) ★ this beat decides Build (10%)

### Visuals — this is the spine of the video
**Recording**: OBS scene at **60 fps + 1080p+** capturing Chrome + Safari + my face PIP (200×200).

- **[Shot 9 · 0:45–0:55]** Split screen: Chrome on the left, Safari on the right. I type a name and the *same* room code into both, then pick a different avatar in each (left = *Mira* GLB realistic, right = *V-1* VRM anime).
- **[Shot 10 · 0:55–1:05]** Both press *Allow camera & enter room*; the top pill goes from `waiting` to `paired` (green). **Slow this frame to 0.5×**.
- **[Shot 11 · 1:05–1:25]** I produce **five distinct actions** so both avatars sync; ~3-4 s each:
  - smile_big (1:05–1:09)
  - surprise (1:09–1:13)
  - wink_left (1:13–1:17)
  - mouth_o (1:17–1:21)
  - tongue_out (1:21–1:25)
- **[Shot 12 · 1:25–1:28]** Both partners smile_big simultaneously → central 💞 mood-sync burst peaks.
- **[Shot 13 · 1:28–1:30]** Camera zooms onto the bottom `~5.5 KB/s` bandwidth pill; in post add a red ring + arrow.

### Voice-over
> "Two browsers. Same room code. Different avatars. (pause) Watch — when I smile, my avatar smiles. Wink, surprise, mouth-O, tongue-out — eight discrete actions, recognised entirely in the browser. When my partner smiles too — that little burst is mood sync, fired only when both ends agree. And the bandwidth — five-point-six kilobytes per second. Two-hundred-fifty times less than a Zoom call."

### Callout text
| Time | Text | Position |
|---|---|---|
| 0:48 | `Two browsers · same room code · different avatars` | bottom |
| 0:58 | `← paired in <2s →` | beside the top pill |
| 1:05 | `8 actions · recognised in-browser by 1D-CNN` | top |
| 1:18 | `MediaPipe → 52d → 1D-CNN → action label` | bottom |
| 1:25 | `mood-sync 💞 fired (both happy ≥ 1s)` | centre |
| 1:28 | `Zoom: 1,500 KB/s · Veil: 5.6 KB/s` | bottom |

### Recording notes (the Build-10 gating)
1. **Real two-window pairing, not edited together.** Markers can tell from frame timing.
2. The mood-sync moment must be rehearsed — both faces have to smile within ~1 s for the burst to fire; expect 3+ takes.
3. On the bandwidth shot, **zoom into "5.6 KB/s"** in post; add a red circle and arrow.
4. **All five actions must be performed.** This is the single biggest differentiator from "I trained binary smile detection" — it directly serves the Technical 10% mark.

### Screenshot list
- [**Screenshot V-3 · Demo paired hero**] — the two-browser frame; doubles as the video thumbnail.
- [**Screenshot V-4 · Five-action grid**] — 9-cell composite: column 1 my face × 5 rows, column 2 left avatar × 5 rows, column 3 right avatar × 5 rows. Visual proof that **the model recognises eight classes**, not just smile.
- [**Screenshot V-5 · 💞 burst peak frame**].
- [**Screenshot V-6 · 5.6 KB/s pill close-up**].

---

## Beat 4 · TECHNICAL OVERVIEW (1:30–2:30 · 60s) ★ this beat decides Technical (10%)

### Sub-beat 4.1 (1:30–1:42 · 12s) — data + pipeline
**[Shot 14]** Cut to **[Fig 2 data pipeline]** full-screen, sequential highlights:
`Camera Frame → 468 Landmarks → 52 Blendshapes → 30-frame Window → 1D-CNN → 8-way softmax`. Each stage glows for ~2 s.

**Voice-over**:
> "MediaPipe extracts four-hundred-sixty-eight facial landmarks per frame, condensed into fifty-two ARKit blendshapes — the same vocabulary Animoji uses. Thirty frames stack into a one-second window, fed to the network."

**On-screen**: `468 → 52 in 22 ms · all on-device`

### Sub-beat 4.2 (1:42–1:54 · 12s) — model architecture
**[Shot 15]** Cut to **[Fig 3 architecture]**, layer-by-layer reveal: Conv → BN → Conv → BN → Conv → BN → GAP → Dropout → Dense(8, softmax).

**Voice-over**:
> "A small 1D CNN — thirty-two thousand parameters, three milliseconds per inference. Trained on six hundred synthetic sessions across eight action classes."

**On-screen**:
- 1:45 `1D-CNN · 32,168 params · 8 classes`
- 1:50 `TF.js shard: 128 KB · inference: 2.8 ms`

### Sub-beat 4.3 (1:54–2:10 · 16s) — training + results
**[Shot 16]** Cut to **[Fig 4 training history]** with loss falling and accuracy rising (use `artifacts/training_history.png` directly).
**[Shot 17]** Cut to **[Fig 5 confusion matrix]** heatmap (use `artifacts/confusion_matrix.png` directly), diagonal at 312/315.

**Voice-over**:
> "Test accuracy: ninety-nine point oh five percent on three hundred fifteen windows. (pause) But honest disclosure — the split is by window, not by actor. On real strangers it drops to about eighty-four. Generalisation is where edge AI gets honest."

**On-screen**:
- 2:00 `Test acc: 99.05% · macro-F1: 0.9903 · 315 windows`
- 2:07 `wild-test on strangers: ~84% — generalisation gap`

### Sub-beat 4.4 (2:10–2:30 · 20s) — deployment + multi-user protocol
**[Shot 18]** Cut to **[Fig 1 three-layer architecture]**, with red dashed boundary around the on-device area and green dashed line across the network arrow.
**[Shot 19]** Cut to Chrome DevTools → Network → WS, showing a single binary frame at exactly `233 bytes`.
**[Shot 20]** Cut back to the live two-avatar view.

**Voice-over**:
> "Each frame travels as two-hundred-thirty-three bytes — header, head pose quaternion, fifty-two floats. No pixels ever leave the device. The relay never sees a face."

**On-screen**:
- 2:15 `Per-frame packet: 1B sender + 8B header + 16B quat + 208B blendshapes = 233B`
- 2:23 `Zero pixels uploaded — by design`

[**Screenshot V-7 · DevTools Network WS panel**] — Chrome DevTools, Network tab, WS row showing the 233-byte binary frame.

### Sub-beat 4 production notes
- Prepare all five figures (architecture / pipeline / model / training curves / confusion matrix) as **high-resolution PNGs** ahead of time; transition with Keynote magic-move.
- Avoid full PowerPoint slides; use full-screen PNGs + overlay annotations.
- Each sub-beat narration ≤ 12–16 s; leave 2–3 s breathing room.

---

## Beat 5 · REFLECTION (2:30–2:50 · 20s)

### Visuals
- **[Shot 21 · 2:30–2:40]** Cut to me in front of the camera (looking straight in), natural gestures. Background: a Mac on the desk and developer ambience (notebooks, coffee).
- **[Shot 22 · 2:40–2:50]** Cut to a recorded *frown → wink_left* misclassification clip; overlay a red box and the word "misclassified".

### Voice-over
> "Two honest limitations. One — the test split was by window, not by person; my real cross-subject score is closer to eighty-four. Two — ARKit's fifty-two blendshapes don't have an 'anger' channel, so frown and angry collapse together. Both are fixable — but they're real."

### On-screen
- 2:32 `Limitation 1: by-window split — cross-subject ≈ 84%`
- 2:42 `Limitation 2: 'anger' has no native blendshape channel`

### Production notes
- This beat is where *Clarity of Presentation* is graded — **owning the limitations adds marks**, do not oversell.
- If the timeline is tight, this beat can drop from 20 s → 15 s; spend the spare 5 s on Beat 3.

[**Screenshot V-8 · frown → wink_left misclassification frame**] — my face clearly frowning while the avatar shows a left wink, with a confidence bar showing wink_left:0.51 / frown:0.47. **Rehearse this counter-example shot.**

---

## Beat 6 · CTA / SIGN-OFF (2:50–3:00 · 10s)

### Visuals
- **[Shot 23 · 2:50–2:58]** Full-screen logo + three-line CTA.
- **[Shot 24 · 2:58–3:00]** Fade to black, single VEIL wordmark closes.

### On-screen (large)
```
Veil — be together, stay private
github.com/<user>/Veil
CASA0018 · UCL · 2025
```

### Voice-over
> "Veil. Be together, stay private. Code's on GitHub."

---

# Recording + post checklist

## Recording
- [ ] OBS dual scene: Scene A = two browsers + face PIP; Scene B = full-screen slide / figure
- [ ] 1080p / 60 fps / H.264 / AAC 48 kHz
- [ ] **Light from in front** (so MediaPipe doesn't drop landmarks)
- [ ] Mic: built-in Mac + iPhone backup (in case one dies)
- [ ] Read the script aloud once before the demo run; record narration and visuals on **separate tracks**
- [ ] **Beat 3 demo: at least three takes** — pick the one with fastest pairing, cleanest five actions and tightest mood-sync
- [ ] `localStorage.clear()` before recording so no stale avatar key sneaks in

## Post (iMovie / Resolve / FCPX — pick one)
- [ ] Cut by beat first, then refine within each beat
- [ ] **Add on-screen text** (lower-third + big callouts) — *without on-screen text Clarity caps at 7/10*
- [ ] BGM very low (–25 dB), no vocals / lyrics / strong percussion that fights the narration
- [ ] Run narration through **Audacity noise reduction + compressor** for level consistency
- [ ] Before final render, **mute and watch once** — the picture alone should still tell the story (Clarity criterion)
- [ ] Confirm runtime ≤ 180 s — **overruns lose Clarity marks directly**

## Upload
- [ ] YouTube unlisted or UCL OneDrive shared link
- [ ] Description: GitHub link + Veil tagline + CASA0018 tags
- [ ] **Embed the thumbnail link in the GitHub README** — small Build-mark gain

---

# Mark-criterion mapping (which beat earns which point)

| Beat | Length | Clarity 10% | Technical 10% | Build 10% |
|---|---:|:---:|:---:|:---:|
| 1 Hook | 15s | ✓✓ | – | – |
| 2 Problem | 30s | ✓✓ | – | – |
| 3 **Demo** | 45s | ✓ | ✓ | **✓✓✓** |
| 4 **Technical** | 60s | ✓ | **✓✓✓** | ✓ |
| 5 Reflection | 20s | ✓✓ | ✓ | – |
| 6 CTA | 10s | ✓ | – | – |

If you must drop one beat: **keep 3 + 4, sacrifice 2** — extend the Hook by 5 s and go straight into the demo.

---

# Asset list (video-only, no overlap with the report)

| ID | Content | Source | Action |
|---|---|---|---|
| **V-1** | Veil logo still (transition vector) | top bar of `mobile_avatar.html` | you screenshot |
| **V-2** | Start-page hero | the loaded start-page frame | you screenshot |
| **V-3** | Demo paired (two browsers) | OBS scene A | freeze-frame from recording |
| **V-4** | Five-action 3×5 grid (face + left avatar + right avatar) | OBS multi-take | composite in post |
| **V-5** | 💞 burst peak frame | OBS dual-smile take | record |
| **V-6** | 5.6 KB/s bandwidth pill close-up | bottom pill region | post zoom-in |
| **V-7** | DevTools Network WS 233 B row | Chrome DevTools | you screenshot |
| **V-8** | frown → wink_left misclassification | rehearse a borderline frown | record |
| **Fig 1** (reuse from report) | Three-layer architecture | draw.io | reuse |
| **Fig 2** (reuse) | Data pipeline | draw.io | reuse |
| **Fig 3** (reuse) | 1D-CNN architecture | Netron | reuse |
| **Fig 4** (reuse) | Training curves | `artifacts/training_history.png` | reuse |
| **Fig 5** (reuse) | Confusion matrix | `artifacts/confusion_matrix.png` | reuse |

---

# One-line recording priority

> **Get Beat 3 (Demo) right first** — pairing + five actions + mood-sync. The other beats are easy to patch; if the demo flops, half the marks go with it.

---

# Beat 3 demo rehearsal checklist (run 5 times before pressing record)

1. **Pairing ≤ 2 s** — both windows press Go simultaneously and the pill turns green within 2 s. Pre-grant camera permission on both browsers so they don't ask during the take.
2. **Eight-class recognition** — verify each action's confidence ≥ 0.5 before recording:
   - smile_big — corners of the mouth pulled wide, teeth visible
   - surprise — brows up + mouth open (not the same as mouth_o)
   - wink_left — only the left eye closes (mind MediaPipe's mirrored view)
   - wink_right — only the right eye closes
   - mouth_o — lips form a clear "oh" circle
   - tongue_out — tongue extended (most visible class — must include)
   - frown — brow knit + corners of the mouth down
   - neutral — at rest (used as the comparison anchor)
3. **Mood-sync trigger** — both partners must smile_big simultaneously for ≥ 1 s; the central 💞 fires only when both confidences ≥ 0.5 (`CONF_THRESHOLD = 0.5`). If it doesn't fire on take 1, check both confidence indicators.
4. **Bandwidth pill** — the `~5.5 KB/s` figure at the bottom is computed from the bottom stats bar. Restart the relay before recording so the number doesn't drift to 7 KB/s during the shot.
5. **Three takes minimum** — take 1 is the dry run; take 2 and 3 are the candidate masters.
