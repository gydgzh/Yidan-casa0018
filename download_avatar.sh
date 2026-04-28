#!/usr/bin/env bash
# download_avatar.sh — fetch a legal MIT-licensed female realistic GLB
# with full ARKit 52 blendshape morph targets, into your repo.
#
# Source: https://github.com/met4citizen/TalkingHead  (MIT, c) 2023 met4citizen
# Mirror via jsdelivr GitHub proxy → no GitHub auth, fast, no rate limits.
#
# Usage (run from repo root):
#   bash download_avatar.sh                    # default: brunette
#   AVATAR=blonde bash download_avatar.sh
#   AVATAR=asian  bash download_avatar.sh
set -euo pipefail

REPO="${REPO:-$(pwd)}"
AVATAR="${AVATAR:-brunette}"     # brunette | blonde | asian (TalkingHead names)
DEST="$REPO/models/avatar.glb"

mkdir -p "$REPO/models"

# Primary: jsdelivr GitHub proxy
PRIMARY="https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@main/avatars/${AVATAR}.glb"
# Fallback: raw.githubusercontent.com (no rate limit for public repos)
FALLBACK="https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars/${AVATAR}.glb"

echo "[1/3] downloading $AVATAR.glb"
if curl -L --fail --retry 3 --retry-delay 2 -o "$DEST" "$PRIMARY"; then
  echo "  via jsdelivr"
else
  echo "  jsdelivr failed, trying raw.githubusercontent.com"
  curl -L --fail --retry 3 -o "$DEST" "$FALLBACK"
fi

# Verify it's actually a GLB (magic = 'glTF' = 0x676c5446)
echo "[2/3] verifying GLB magic"
MAGIC=$(xxd -p -l 4 "$DEST")
if [[ "$MAGIC" != "676c5446" ]]; then
  echo "  ERROR: file is not a valid GLB. First 4 bytes: $MAGIC"
  echo "  delete and try a different avatar:  AVATAR=blonde bash $0"
  exit 1
fi

SIZE_MB=$(du -m "$DEST" | cut -f1)
echo "  OK · $DEST · ${SIZE_MB} MB"

echo "[3/3] usage in mobile_avatar.html"
echo "  No code change needed — page already tries ./models/avatar.glb first."
echo "  After git push, hard-refresh on iPhone (long-press reload icon)."

echo
echo "License: MIT  (c) 2023 met4citizen / TalkingHead"
echo "       https://github.com/met4citizen/TalkingHead/blob/main/LICENSE"
