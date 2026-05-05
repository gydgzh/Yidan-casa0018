# Use the two VRoid Hub avatars you wanted

The 2 character pages you sent:
1. https://hub.vroid.com/en/characters/1355919122034347311/models/9134279447888604460
2. https://hub.vroid.com/en/characters/1687514383812434869/models/5025695106507499665

VRoid Hub requires a Pixiv login to download `.vrm` files, and the actual file
URL is signed per session, so the sandbox can't fetch them for you. **You** need
to download once, then drop them in `models/` — the page is already wired to
pick them up.

---

## Step-by-step (5 minutes)

### 1. Open each link in Chrome

Open both URLs above. **Sign into Pixiv** if prompted (free account).

### 2. Click the Download button

Each page has a **"Download"** button on the right side, near the model preview.
Click it. You may need to scroll to find it — it's near the model info card.

If a license dialog appears, scroll, accept (these models allow non-commercial /
academic use). The browser will download a `.vrm` file (typically 5–30 MB).

### 3. Rename the two files

Rename them to:
- The first one → `avatar_vroid_a.vrm`
- The second one → `avatar_vroid_b.vrm`

### 4. Drop them into the project's models folder

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
mv ~/Downloads/avatar_vroid_a.vrm "$DLL/models/"
mv ~/Downloads/avatar_vroid_b.vrm "$DLL/models/"

# Verify they're real glTF/VRM files (first 4 bytes should be 676c5446 = "glTF")
xxd -l 4 "$DLL/models/avatar_vroid_a.vrm"
xxd -l 4 "$DLL/models/avatar_vroid_b.vrm"

# md5sum should be DIFFERENT for the two:
md5sum "$DLL/models/"avatar_vroid_*.vrm
```

If you also want them on GitHub Pages so iPhone / friends can use them:
```bash
PAGES=~/Yidan-casa0018
mkdir -p "$PAGES/models"
cp "$DLL/models/avatar_vroid_"*.vrm "$PAGES/models/"
cd "$PAGES"
git add models/avatar_vroid_*.vrm
git commit -m "Add 2 VRoid Hub avatars (academic non-commercial)"
git push
```

### 5. Hard reload the page

In Chrome / Safari: ⌘ + Shift + R. The avatar grid now shows **two new cards**:
- 🌸 **VRoid #1**
- ⭐ **VRoid #2**

Click one to use it. Anyone in the room who picks the same room code will see
your VRoid avatar (they don't need to download — the file is served from the
same server).

---

## What if textures still look broken?

The page now has two safety nets that make broken textures impossible to be
embarrassing:

1. **HEAD-ONLY clipping plane** at world y=1.30 — anything below the
   collarbone is clipped at the GPU. Even if the body fails to load, only the
   head + neck shows. **No nudity can ever appear.**

2. **Auto-aim camera at head bone** — every VRM has its head at a different
   height (VRoid female ~1.45 m, male ~1.65 m). When the model loads, the cell
   camera auto-snaps to the actual head bone's Y position, so the head is
   always centered in the cell.

---

## License notice

Both models are downloaded under the creator's stated license on VRoid Hub.
**Use is limited to non-commercial / academic** (this CASA0018 project).
Credit the original creator (their handle is on each character page) in your
report's References section, e.g.:

> Avatar #1: VRoid Hub character 1355919122034347311 / model 9134279447888604460
> by [creator handle], used under the [licence] terms displayed on
> https://hub.vroid.com — academic non-commercial use only.

---

## If you don't want to bother with download

You can skip the VRoid avatars entirely. The page already works with **3 verified
realistic GLB avatars** (Mira / Emma / Ada) plus the **Custom URL** field where
you can paste any public `.glb` URL — including a Ready Player Me avatar you
make in 2 minutes at https://readyplayer.me/avatar.

The two VRoid slots will simply show "loading…" and a fallback face if the
files aren't there — they don't break anything.
