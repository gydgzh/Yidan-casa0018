#!/bin/bash
# download_ravdess.sh - 下载 RAVDESS 数据集（4个演员，用于4类表情）

set -e

DATA_DIR="/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1/action_recognition/data/ravdess_video"
mkdir -p "$DATA_DIR"

echo "=== 下载 RAVDESS 视频数据集 ==="
echo "来源: Zenodo (DOI: 10.5281/zenodo.1188976)"
echo "协议: CC BY-NC-SA 4.0 (学术非商用)"
echo ""

BASE_URL="https://zenodo.org/record/1188976/files"

# 下载演员 01-04 的 Video_Speech（演讲视频，表情更丰富）
for actor in 01 02 03 04; do
    zipfile="Video_Speech_Actor_${actor}.zip"
    url="${BASE_URL}/${zipfile}?download=1"
    
    if [ ! -f "$DATA_DIR/${zipfile}" ]; then
        echo "下载 ${zipfile}..."
        curl -L --retry 3 --max-time 300 "$url" -o "$DATA_DIR/${zipfile}" 2>&1 | tail -5 || echo "下载可能失败，继续..."
    else
        echo "${zipfile} 已存在"
    fi
    
    # 解压
    if [ -f "$DATA_DIR/${zipfile}" ] && [ ! -d "$DATA_DIR/Actor_${actor}" ]; then
        echo "解压 ${zipfile}..."
        unzip -q "$DATA_DIR/${zipfile}" -d "$DATA_DIR/" || echo "解压可能失败"
    fi
done

echo ""
echo "=== 下载完成 ==="
echo "数据位置: $DATA_DIR"
find "$DATA_DIR" -name "*.mp4" 2>/dev/null | wc -l | xargs echo "视频文件数:"
