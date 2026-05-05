# Debug — empty viewports (cells render but no avatar inside)

> **Symptom**: Both YOU/FRIEND cells visible with their CSS gradient
> backgrounds, fps:19, av:ok, but **no actual 3D avatar mesh inside either cell**.
>
> **Likely root cause** that I just fixed: I had added 2 new avatars `vroid_v2`
> and `vroid_male` whose URLs pointed to files (`fem_vroid_v2.vrm` /
> `masc_vroid_v2.vrm`) that almost certainly don't exist in `madjin/vrm-samples`.
> The new "random default avatar" code might have rolled one of those, hit 404
> on every URL in the chain (incl. the local fallback), and either built a tiny
> proxy or showed nothing.
>
> **What I just did**: removed those 2 unverified avatars. Avatar bank is back
> to **5 verified ones** (3 GLB Mira/Emma/Ada + 2 VRM Sakura/Kaito) + Custom URL.

---

## Try this first (1 minute)

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
PAGES=~/Yidan-casa0018

# 1) sync to Pages
[ -d "$PAGES" ] && cp "$DLL/mobile_avatar.html" "$PAGES/mobile_avatar.html" && \
  cd "$PAGES" && git add -A && git commit -m "v7: remove unverified avatars" && git push

# 2) restart static (you don't need to touch relay)
cd "$DLL"
lsof -ti :8080 | xargs -r kill -9
sleep 1
npx --yes http-server . -p 8080 -a 0.0.0.0 --cors > /tmp/httpserver.log 2>&1 &
```

Then in browser: **localStorage.clear() + hard reload** (the previous random
default may have stuck on `vroid_v2` in storage):

```js
// in DevTools console of EACH browser window:
localStorage.clear();
location.reload();
```

---

## If still empty — open log panel and read errors

Click the small `log` button at bottom-right of the page. The first red line
tells the story.

| Red line says | Meaning | Fix |
|---|---|---|
| `[self] failed: …404…` × 5 lines + `all URLs failed → proxy head` | All CDN URLs blocked / no internet | Check Mac internet; or run `bash scripts/download_assets.sh` to put 5 valid avatars in `models/` so local fallback works |
| `[self] failed: timeout 12000ms` | jsdelivr is hanging | Wait, retry; or open the URL directly in a new tab to see if it 200s |
| `VRM OK · …vrm · expressions=0 · head=NONE` | VRM loaded but humanoid bone graph missing | This VRM is malformed — pick a different avatar (use 🎲 Random) |
| `proxy build err: …` | Three.js material/geometry crash | Refresh page; if persists, send the full error line |
| nothing red, all green `OK` lines | Avatar loaded fine, but visibility toggle lost track of root | Likely Three.js bug from rapid show/hide toggle. Refresh once. |

---

## Force-feed a known-good avatar via URL parameter

This **bypasses random default + localStorage** entirely:

```
http://localhost:8080/mobile_avatar.html?myav=brunette
```

If this shows Mira → architecture is fine, the random default was the bug.
If this shows empty → deeper issue, paste me the log panel screenshot.

---

## What to paste back

```bash
echo "=== 1. avatar bank entries ==="
grep -cE "  [a-z_]+: *\{ *name:" /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1/mobile_avatar.html
# Should be 6 (5 builtin + custom)

echo
echo "=== 2. localStorage state in browser ==="
echo "  After Cmd+Option+J → Console, run:"
echo '    Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith("veil_")).map(k=>[k,localStorage[k]]))'
echo "  Paste the output here"

echo
echo "=== 3. log panel content ==="
echo "  Click 'log' button bottom-right of the page,"
echo "  paste the last 30 lines (especially any in red)"
```

---

## One-line for local AI

> Sync HTML to Pages, restart `:8080`, in **both** Chrome and Safari run
> `localStorage.clear(); location.reload();` in DevTools console once. Try with
> `?myav=brunette` URL. If still empty, paste the log panel content + the
> `localStorage` state.
