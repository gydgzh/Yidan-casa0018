# Local-AI execution — fix face cropping + add avatars + random picker

> **What changed in `mobile_avatar.html`** (1404 lines, 0 Chinese chars):
>
> 1. **Face-cropping bug fix**: avatar arc span tightened (`0.45*n` → `0.30*n`),
>    camera pulled back (z 1.55→1.95 portrait, 1.25→1.55 landscape), FOV widened
>    (30→34, 24→30). Two avatars now fit fully in frame, no more half-faces.
> 2. **2 more avatars added**: Yuki 🧑‍🎤 (anime girl v2 VRM) + Hiro 🧑 (anime boy v2 VRM).
>    Total avatar bank now: **3 realistic GLB + 4 anime VRM + Custom URL = 8 options**.
> 3. **Random default avatar**: instead of always defaulting to "brunette",
>    page picks a random avatar on first load. Two windows opened on the same Mac
>    will (probably) start with different avatars.
> 4. **🎲 Random button** added next to the "Choose your avatar" heading —
>    one click rolls to a fresh avatar.
> 5. **Yellow warning** under avatar grid:
>    *"⚠ Important: if your friend is also on this Mac, make sure each window picks
>    a DIFFERENT avatar — otherwise both faces will look identical on screen."*
>
> User screenshot showed two windows defaulting to the same `Yidan` name + same
> `brunette` avatar (because localStorage persists across tabs in same browser).
> The `1` suffix is the server's collision auto-fix. With #3 + #5 above, this
> should stop happening — and if it does, the warning makes the cause obvious.

---

## Execute (3 minutes)

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
cd "$DLL"

# 1) Sync to GitHub Pages if you use it
PAGES=~/Yidan-casa0018
if [ -d "$PAGES" ]; then
  cp "$DLL/mobile_avatar.html" "$PAGES/mobile_avatar.html"
  cd "$PAGES"
  git add mobile_avatar.html
  git commit -m "Veil v6: fix face cropping + 8 avatars + random picker" || true
  git push || true
fi

# 2) Restart services (cleaner than reload)
cd "$DLL"
lsof -ti :8443 :8080 :8765 2>/dev/null | xargs -r kill -9
sleep 1

npx --yes http-server . -p 8080 -a 0.0.0.0 --cors > /tmp/httpserver.log 2>&1 &
cd "$DLL/relay_server" && npm start > /tmp/relay.log 2>&1 &
sleep 2
head -3 /tmp/relay.log     # banner must contain "(multi-user)"

# 3) Wipe browser localStorage so the random-default kicks in cleanly
#    (do it manually in each browser, see below)
```

**Important:** in EACH browser (Chrome AND Safari), open the DevTools console once on the page and paste:
```js
localStorage.clear(); location.reload();
```
This clears any leftover `veil_myav: brunette` and lets the new "random default avatar" code pick a fresh one each time.

---

## Test sequence (with user)

### Window A — Chrome
1. Open `http://localhost:8080/mobile_avatar.html`
2. Hard reload (⌘⇧R)
3. **Notice the avatar grid already has a random card highlighted** (because of new default)
4. ① name = `Yidan` · ② room = `cosy42` · ③ relay = auto · ④ click any avatar (say **Mira**) · ⑤ button

### Window B — Safari
1. Same URL
2. Hard reload (⌘⌥R)
3. **Look at the yellow warning under the avatar grid**
4. ① name = `Mom` (different!) · ② room = `cosy42` (same!) · ③ relay = auto ·
   ④ click 🎲 Random a few times until you land on something **different from Window A's choice** (say **Sakura**) · ⑤ button

### Expect to see
- Top pill turns green: `paired`
- **Both faces fully visible** — no more half-cheek crops
- **Two distinct avatars** — Mira (realistic) on one side, Sakura (anime) on the other
- Bottom labels show `YOU Yidan` / `FRIEND Mom` (not `Yidan1`)

---

## Verification questions for user (paste answers back)

```
=== visible questions to confirm ===
1. Do you see TWO different avatars on screen now (not the same one twice)?  ___ Y/N
2. Is each avatar's face FULLY visible (not cropped at the edges)?            ___ Y/N
3. Did clicking 🎲 Random give you a different avatar each time?              ___ Y/N
4. Yellow ⚠ warning text visible above the avatar grid?                       ___ Y/N
5. Bottom labels show "Yidan" and "Mom" (or whatever names — NOT same)?        ___ Y/N
```

---

## File status snapshot (paste back)

```bash
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1

echo "=== HTML sanity ==="
grep "<title>" mobile_avatar.html
wc -l mobile_avatar.html
python3 -c "import re; print('CN lines:', sum(1 for l in open('mobile_avatar.html') if re.search(r'[一-鿿]', l)))"

echo
echo "=== AVATAR_BANK count ==="
grep -cE "  [a-z_]+: *\{ *name:" mobile_avatar.html

echo
echo "=== services running ==="
lsof -i :8080 2>/dev/null | head -2
lsof -i :8765 2>/dev/null | head -2

echo
echo "=== relay banner (must contain multi-user) ==="
head -3 /tmp/relay.log
```

---

## One-line instruction to send to local AI

> Run [`docs/RUN_NEXT.md`](RUN_NEXT.md). Push HTML to GitHub Pages, restart all three services, then in BOTH Chrome and Safari run `localStorage.clear(); location.reload();` in DevTools console once. Test with Chrome=Mira, Safari=Sakura (two DIFFERENT avatars in two DIFFERENT-name windows). Paste the 5 Y/N answers + 4-block snapshot back when done.
