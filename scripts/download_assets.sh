#!/usr/bin/env bash
# 在本地 Mac 上运行(不在沙盒里)。
# 下载 5 个真正不同的 avatar(3 写实 GLB + 2 二次元 VRM)+ MediaPipe 模型。
#
# !! 重要 !! 之前的版本下载完 4 个文件 md5 全相同 - CDN/raw 被某种代理拦截
# 返回 fallback 的同一个文件并保存成不同名。这一版会:
#   1. 优先用 raw.githubusercontent.com (主) + jsdelivr (备),不互相 fallback
#   2. 每下完立即校验 magic bytes 和 file size
#   3. 全部下完后跑 md5sum 检查所有文件 hash 不同;有重复就报错退出
#
# 资源全部公开合法可见:
#   - met4citizen/TalkingHead avatars (MIT) — Ready Player Me 风写实头像
#   - madjin/vrm-samples (VRoid 公开样例) — 二次元 VRM
#   - Google AI Edge MediaPipe Face Landmarker v2 (Apache-2.0)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "DLLLL1 根目录: $ROOT"

# 同时下到两个目录(web_avatar 桌面版 + mobile_avatar.html 用 ./models/)
DIRS=("$ROOT/web_avatar/public/models" "$ROOT/models")
for d in "${DIRS[@]}"; do mkdir -p "$d"; done

# ---------- 通用下载函数 ----------
# fetch <out_name> <primary_url> <backup_url> [min_bytes]
fetch() {
  local name="$1" primary="$2" backup="$3" minb="${4:-100000}"
  for d in "${DIRS[@]}"; do
    local target="$d/$name"
    # 即使存在,如果太小或者 magic bytes 不对,也强制重下
    if [ -s "$target" ]; then
      local sz=$(stat -f%z "$target" 2>/dev/null || stat -c%s "$target" 2>/dev/null)
      local magic=$(xxd -l 4 "$target" 2>/dev/null | awk '{print $2}')
      if [ "$sz" -ge "$minb" ] && [ "$magic" = "676c" ]; then
        echo "  ✓ $name 已存在($d, $(du -h $target | cut -f1)),跳过"
        continue
      else
        echo "  ⚠ $name 存在但坏掉(size=$sz, magic=$magic),重下"
        rm -f "$target"
      fi
    fi
    echo "  ⬇ 下载 $name → $d"
    if curl -fL --retry 3 --max-time 180 -o "$target" "$primary"; then
      echo "    OK (primary)"
    else
      echo "    primary 失败,尝试 backup ..."
      curl -fL --retry 3 --max-time 180 -o "$target" "$backup"
      echo "    OK (backup)"
    fi
    # 下完立即校验
    local sz2=$(stat -f%z "$target" 2>/dev/null || stat -c%s "$target" 2>/dev/null)
    local magic2=$(xxd -l 4 "$target" 2>/dev/null | awk '{print $2}')
    if [ "$sz2" -lt "$minb" ] || [ "$magic2" != "676c" ]; then
      echo "    ❌ 下载坏文件(size=$sz2, magic=$magic2,期望 ≥$minb 且 magic=676c='glTF')"
      rm -f "$target"
      exit 1
    fi
    echo "    ✓ size=$(du -h $target | cut -f1) magic=glTF"
  done
}

echo
echo "====== 1/2: 5 个 avatar 模型 ======"
echo

# ----- 3 个写实 GLB(TalkingHead, MIT) -----
TH_RAW="https://raw.githubusercontent.com/met4citizen/TalkingHead/main/avatars"
TH_CDN="https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@main/avatars"

fetch "avatar.glb"        "$TH_RAW/brunette.glb"  "$TH_CDN/brunette.glb"  100000
fetch "avatar_blonde.glb" "$TH_RAW/blonde.glb"    "$TH_CDN/blonde.glb"    100000
fetch "avatar_asian.glb"  "$TH_RAW/asian.glb"     "$TH_CDN/asian.glb"     100000

# ----- 2 个二次元 VRM(madjin/vrm-samples) -----
MJ_RAW="https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid"
MJ_CDN="https://cdn.jsdelivr.net/gh/madjin/vrm-samples@master/vroid"

fetch "avatar_anime_girl.vrm" "$MJ_RAW/fem_vroid.vrm"  "$MJ_CDN/fem_vroid.vrm"  500000
fetch "avatar_anime_boy.vrm"  "$MJ_RAW/masc_vroid.vrm" "$MJ_CDN/masc_vroid.vrm" 500000

# ===== 关键校验:5 个文件 md5 必须互不相同 =====
echo
echo "====== 校验:5 个文件 md5 必须互不相同 ======"
DUP_FOUND=0
for d in "${DIRS[@]}"; do
  echo "  📁 $d"
  if command -v md5sum >/dev/null; then MD5=md5sum; else MD5="md5 -r"; fi
  $MD5 "$d/avatar.glb" "$d/avatar_blonde.glb" "$d/avatar_asian.glb" \
       "$d/avatar_anime_girl.vrm" "$d/avatar_anime_boy.vrm" 2>/dev/null \
       | awk '{print $1, $2}' | sort | tee /tmp/_md5_$$ \
       | awk '{print "     " $0}'
  uniq_count=$(awk '{print $1}' /tmp/_md5_$$ | sort -u | wc -l | tr -d ' ')
  if [ "$uniq_count" -ne 5 ]; then
    echo "     ❌ 5 个文件里只有 $uniq_count 个唯一 hash — 有重复!"
    DUP_FOUND=1
  else
    echo "     ✓ 5 个唯一 hash,文件全是真不同的"
  fi
  rm -f /tmp/_md5_$$
done
if [ "$DUP_FOUND" = "1" ]; then
  echo
  echo "❌ 有重复文件。请删掉重复的 .glb/.vrm,重跑此脚本。"
  exit 1
fi

echo
echo "====== 2/2: MediaPipe face_landmarker.task ======"
echo
MP_DIR="$ROOT/web_browser_fallback/public"
mkdir -p "$MP_DIR"
MP_URL="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
if [ ! -s "$MP_DIR/face_landmarker.task" ]; then
  echo "  ⬇ 下载 MediaPipe Face Landmarker v2 ..."
  curl -fL --retry 3 --max-time 180 -o "$MP_DIR/face_landmarker.task" "$MP_URL"
else
  echo "  ✓ face_landmarker.task 已存在"
fi
# 同步给 web_avatar
WA_MP="${DIRS[0]}/face_landmarker.task"
if [ ! -e "$WA_MP" ]; then cp "$MP_DIR/face_landmarker.task" "$WA_MP"; fi

echo
echo "✅ 全部下载 + 校验完成。"
echo "─── 头像清单 ───"
for d in "${DIRS[@]}"; do
  echo "  📁 $d"
  ls -lh "$d" | awk 'NR>1 {printf "     %-28s %6s\n", $NF, $5}'
done
echo
echo "──── 总和 ────"
du -sh "${DIRS[@]}" "$MP_DIR" 2>/dev/null
