# Local-AI execution plan (this round)

> **What changed in `mobile_avatar.html`**:
> 1. Stripped all Chinese from the user-facing UI — start screen is now 100% English.
> 2. Reworded the avatar-section copy so the user clearly understands "this is how OTHERS see you, not how you see yourself".
> 3. AVATAR_BANK already on CDN-only (last round) — no local files needed.
>
> **What you need to do**: kill old services, restart with HTTP, hard-reload browsers, and verify two windows pick *different* avatars.

---

## Execute (5 minutes)

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
cd "$DLL"

# 1) Kill anything on the relevant ports
lsof -ti :8443 :8080 :8765 2>/dev/null | xargs -r kill -9
sleep 1

# 2) HTTP static server (HTTP is fine for localhost — secure-context exception)
npx --yes http-server . -p 8080 -a 0.0.0.0 --cors > /tmp/httpserver.log 2>&1 &
sleep 1

# 3) Multi-user relay (banner MUST say "(multi-user)")
cd "$DLL/relay_server"
npm start > /tmp/relay.log 2>&1 &
sleep 2
head -3 /tmp/relay.log

# 4) Sync to GitHub Pages if you use it
PAGES=~/Yidan-casa0018
if [ -d "$PAGES" ]; then
  cp "$DLL/mobile_avatar.html" "$PAGES/mobile_avatar.html"
  cd "$PAGES"
  git add mobile_avatar.html
  git commit -m "Veil v5: English-only UI" || true
  git push || true
fi

# 5) Open both browsers
open -a "Google Chrome" "http://localhost:8080/mobile_avatar.html"
sleep 3
open -a "Safari" "http://localhost:8080/mobile_avatar.html"
```

After both windows open, **hard-reload each one** (⌘ + Shift + R in Chrome, ⌘ + Option + R in Safari) so the new HTML overrides the old cached version.

---

## Verification checklist

| # | Check | Expected | Failure → |
|---|---|---|---|
| 1 | Start screen text | All English. No Chinese characters anywhere. | `grep -P '[\x{4e00}-\x{9fff}]'` mobile_avatar.html should return 0 lines |
| 2 | Layout | Purple "3 steps to start" tip box, then ① ② ③ ④ ⑤ numbered fields | If layout broken, hard reload (⌘⇧R) |
| 3 | Window A picks Mira | Card visibly highlighted | If clicking does nothing, reload |
| 4 | Window B picks Sakura | Different card, different colour | **Don't pick the same avatar — that's why they looked identical before!** |
| 5 | Both `paired` | Top pill green, both windows show two avatars side-by-side | Check `lsof -i :8765` and relay log |
| 6 | Camera mirrors face | Window A's left avatar mirrors Chrome cam; Window B's left avatar mirrors Safari cam | Look at bottom-right `log` button |
| 7 | The two avatars are visibly different | Mira (realistic) ≠ Sakura (anime) | If same: user picked same card in both windows; pick different ones |
| 8 | Mood sync | Smile big in BOTH windows simultaneously → 💞 in centre | Action model needs `~/.veil/action_model/` or it loads silently no-op |

---

## Demo to user (after verification passes)

Tell the user (or screenshot for them):

> Open this URL in Chrome:  
> `http://localhost:8080/mobile_avatar.html`
>
> Read the purple instruction box. Pick name `Yidan`, room `cosy42`, and click **Mira**, then the big button.
>
> Now open Safari and go to the same URL. Type your friend's name (e.g. `Mom`), the same room `cosy42`, but **click a different avatar like Sakura or Kaito**. Press the button.
>
> Both windows should pair within 5 seconds and show two different avatars on screen, each mirroring the corresponding camera.

Hand them `docs/USER_GUIDE.md` for the full feature reference.

---

## Report back to remote Claude

```bash
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1

echo "=== 1. mobile_avatar.html sanity ==="
grep -c "<title>Veil" mobile_avatar.html      # 1
wc -l mobile_avatar.html                       # ~1380
python3 -c "import re; print('CN lines:', sum(1 for l in open('mobile_avatar.html') if re.search(r'[一-鿿]', l)))"  # 0

echo
echo "=== 2. services ==="
lsof -i :8080 2>/dev/null | head -2
lsof -i :8765 2>/dev/null | head -2

echo
echo "=== 3. relay banner ==="
head -3 /tmp/relay.log    # must contain "multi-user"

echo
echo "=== 4. test answers ==="
echo "  Two windows paired? ___ (Y/N)"
echo "  Each picked a DIFFERENT avatar? ___ (Y/N — must be different)"
echo "  Two avatars are visibly different on screen? ___ (Y/N)"
echo "  Mood sync 💞 fires when both smile? ___ (Y/N)"
echo "  Any Chinese visible on the page? ___ (Y/N — must be N)"
```

---

## One-line instruction to send to local AI

> Run `docs/LOCAL_AI_RUN.md`. Kill old services on `:8443/:8080/:8765`, restart with HTTP `:8080` and `npm start` (must show "multi-user" in banner), open Chrome + Safari to `http://localhost:8080/mobile_avatar.html`, hard-reload both, **type the same room code but pick DIFFERENT avatars in each** (Window A → Mira, Window B → Sakura). Paste the 4 blocks of output back when done.
