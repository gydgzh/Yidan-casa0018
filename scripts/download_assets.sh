#!/usr/bin/env bash
# 在本地 Mac 上运行(不在沙盒里)。
# 作用:把虚拟人模型 + MediaPipe blendshape 模型下载到正确位置。
# 用法:cd DLLLL1 && bash scripts/download_assets.sh
#
# 数据/模型来源全部公开合法可见:
#   - madjin/vrm-samples (VRoid 官方公开样例,作者 GitHub 仓库,公共可见)
#   - Google AI Edge MediaPipe Face Landmarker v2 (Apache-2.0,Google 官方 CDN)
#
# 如果你担心 vroid 样例的版权,可以替换为 ToxSam/open-source-avatars 仓库里
# 任何标注 CC0/CC-BY 的 .vrm 文件,接口完全一样。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "DLLLL1 根目录: $ROOT"

# ---------- 1. VRM 虚拟人模型 ----------
VRM_DIR="$ROOT/web_avatar/public/models"
mkdir -p "$VRM_DIR"

# 优先 fem_vroid.vrm,其次 masc_vroid.vrm。两个都是 VRoid Studio 官方导出 + ARKit-style blendshapes。
VRM_URL_PRIMARY="https://github.com/madjin/vrm-samples/raw/master/vroid/fem_vroid.vrm"
VRM_URL_BACKUP="https://github.com/madjin/vrm-samples/raw/master/vroid/masc_vroid.vrm"

if [ ! -s "$VRM_DIR/avatar.vrm" ]; then
  echo "==> 下载 VRM 虚拟人模型 ..."
  if curl -fL --retry 3 --max-time 120 -o "$VRM_DIR/avatar.vrm" "$VRM_URL_PRIMARY"; then
    echo "    OK (fem_vroid)"
  else
    echo "    primary 失败,尝试 backup ..."
    curl -fL --retry 3 --max-time 120 -o "$VRM_DIR/avatar.vrm" "$VRM_URL_BACKUP"
    echo "    OK (masc_vroid)"
  fi
else
  echo "==> avatar.vrm 已存在,跳过"
fi
ls -lh "$VRM_DIR/avatar.vrm"

# ---------- 2. MediaPipe face_landmarker.task ----------
MP_DIR="$ROOT/web_browser_fallback/public"
mkdir -p "$MP_DIR"
MP_URL="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

if [ ! -s "$MP_DIR/face_landmarker.task" ]; then
  echo "==> 下载 MediaPipe Face Landmarker v2 模型 ..."
  curl -fL --retry 3 --max-time 120 -o "$MP_DIR/face_landmarker.task" "$MP_URL"
else
  echo "==> face_landmarker.task 已存在,跳过"
fi
ls -lh "$MP_DIR/face_landmarker.task"

# ---------- 3. 也把 web_avatar 用到的同一个模型软链过去,省一次下载 ----------
WA_MODEL="$ROOT/web_avatar/public/models/face_landmarker.task"
if [ ! -e "$WA_MODEL" ]; then
  cp "$MP_DIR/face_landmarker.task" "$WA_MODEL"
fi

echo ""
echo "✅ 所有静态资源就绪。"
echo "    虚拟人模型:        $VRM_DIR/avatar.vrm"
echo "    MediaPipe blendshape 模型: $MP_DIR/face_landmarker.task"
