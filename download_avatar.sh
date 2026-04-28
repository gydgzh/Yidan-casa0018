#!/usr/bin/env bash
# download_avatar.sh — fetch a legal MIT-licensed female realistic GLB
# (TalkingHead, c) 2023 met4citizen) into your repo, plus harden git so
# the binary file isn't mangled.
#
# Usage (from repo root):
#   bash download_avatar.sh
#   AVATAR=blonde bash download_avatar.sh
#   AVATAR=asian  bash download_avatar.sh
set -euo pipefail

REPO="${REPO:-$(pwd)}"
AVATAR="${AVATAR:-brunette}"
DEST="$REPO/models/avatar.glb"

mkdir -p "$REPO/models"

# 1) ensure .gitattributes treats glb/bin as binary, no eol conversion ever
ATTR="$REPO/.gitattributes"
touch "$ATTR"
add_attr() {
  local pat="$1"
  if ! grep -qF "$pat" "$ATTR"; then
    echo "$pat binary" >> "$ATTR"
    echo "  added .gitattributes: $pat"
  fi
}
add_attr "*.glb"
add_attr "*.bin"
add_attr "*.task"
add_attr "*.vrm"

# 2) download
PRIMARY="https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@main/avatars/${AVATAR}.glb"
FALLBACK="https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars/${AVATAR}.glb"
echo "[1/3] downloading $AVATAR.glb"
rm -f "$DEST"
if curl -L --fail --retry 3 --retry-delay 2 -o "$DEST" "$PRIMARY"; then
  echo "  via jsdelivr"
else
  echo "  jsdelivr failed, falling back to raw.githubusercontent"
  curl -L --fail --retry 3 -o "$DEST" "$FALLBACK"
fi

# 3) verify
echo "[2/3] verifying"
SIZE=$(wc -c < "$DEST")
SIZE_MB=$(( SIZE / 1024 / 1024 ))
echo "  size: ${SIZE} bytes (${SIZE_MB} MB)"
if (( SIZE < 5000000 )); then
  echo "  ERROR: file is < 5 MB — almost certainly truncated"
  exit 1
fi
MAGIC=$(xxd -p -l 4 "$DEST")
if [[ "$MAGIC" != "676c5446" ]]; then
  echo "  ERROR: file is not a valid GLB. Magic bytes: $MAGIC (expected 676c5446 = 'glTF')"
  exit 1
fi
echo "  magic OK (glTF)"

# 4) sanity check: does it round-trip through git diff cleanly as binary?
if git -C "$REPO" check-attr binary -- models/avatar.glb 2>/dev/null \
   | grep -q "binary: set"; then
  echo "  git: tracked as binary OK"
else
  echo "  WARNING: git not yet tracking as binary — commit .gitattributes FIRST"
fi

echo "[3/3] usage"
echo "  page already tries ./models/avatar.glb first, then jsdelivr fallback"
echo "  commit:  git add .gitattributes models/avatar.glb && git commit && git push"
echo "  hard-refresh on browser to bypass cache"

echo
echo "License: MIT  (c) 2023 met4citizen / TalkingHead"
